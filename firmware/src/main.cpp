#include <Arduino.h>
#include <WiFi.h>
#include "config.h"
#include "nfc_grid.h"
#include "leds.h"
#include "pb_client.h"
#include "wifi_prov.h"

NfcGrid  grid;
Leds     leds;
PbClient pb;
WifiProv prov;
ProvConfig cfg;  // global so loop() can use it for reconnect

String lastRoom    = "";
String partnerRoom = "";
unsigned long lastNfcScan = 0;
unsigned long lastPoll    = 0;

static void connectWifi() {
  WiFi.begin(cfg.ssid.c_str(), cfg.wifiPassword.c_str());
  unsigned long t = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t < 30000) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
}

void setup() {
  Serial.begin(115200);

  leds.begin();

  if (!prov.loadFromNvs(cfg)) {
    Serial.println("No provisioning data — starting setup portal");
    prov.runPortal(cfg);  // reboots after save
  }

  Serial.print("Connecting to WiFi: "); Serial.println(cfg.ssid);
  connectWifi();
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
  // WiFi watchdog — reconnect and re-auth if connection dropped
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi lost — reconnecting...");
    WiFi.disconnect();
    connectWifi();
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("WiFi restored — re-authenticating PocketBase");
      pb.begin(cfg.pbUrl, cfg.pbEmail, cfg.pbPassword);
    }
    return;
  }

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
