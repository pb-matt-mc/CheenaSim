#include <Arduino.h>
#include <WiFi.h>
#include "config.h"
#include "nfc_grid.h"
#include "leds.h"
#include "pb_client.h"
#include "wifi_prov.h"

NfcGrid grid;
Leds    leds;
PbClient pb;
WifiProv prov;

String lastRoom    = "";
String partnerRoom = "";
unsigned long lastNfcScan = 0;
unsigned long lastPoll    = 0;

void setup() {
  Serial.begin(115200);

  leds.begin();

  ProvConfig cfg;
  if (!prov.loadFromNvs(cfg)) {
    Serial.println("No provisioning data — starting setup portal");
    prov.runPortal(cfg);  // reboots after save
  }

  Serial.print("Connecting to WiFi: "); Serial.println(cfg.ssid);
  WiFi.begin(cfg.ssid.c_str(), cfg.wifiPassword.c_str());
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts++ < 30) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi failed — restarting");
    ESP.restart();
  }
  Serial.print("WiFi connected: "); Serial.println(WiFi.localIP());

  if (!pb.begin(cfg.pbUrl, cfg.pbEmail, cfg.pbPassword)) {
    Serial.println("PocketBase auth failed — check credentials");
  }

  grid.begin();

  lastNfcScan = millis();
  lastPoll    = millis();
}

void loop() {
  unsigned long now = millis();

  if (now - lastNfcScan >= NFC_INTERVAL) {
    lastNfcScan = now;
    String room = grid.scan();
    if (room.length() > 0 && room != lastRoom) {
      lastRoom = room;
      Serial.print("Room: "); Serial.println(room);
      pb.publishPosition(MY_RECORD_ID, room, "physical");
    }
  }

  if (now - lastPoll >= POLL_INTERVAL) {
    lastPoll = now;
    String r = pb.pollPartnerPosition(PARTNER_RECORD_ID);
    if (r.length() > 0 && r != partnerRoom) {
      partnerRoom = r;
      Serial.print("Partner: "); Serial.println(r);
      leds.setPartnerRoom(r);
    }
  }
}
