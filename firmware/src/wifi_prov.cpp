#include "wifi_prov.h"
#include <Preferences.h>
#include <WiFi.h>
#include <WebServer.h>

static const char* NVS_NS  = "prov";
static const char* AP_SSID = "CheenaSetup";

static const char PORTAL_HTML[] PROGMEM = R"(<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>CheenaSim Setup</title>
<style>body{font-family:monospace;background:#1a1a2e;color:#e0e0e0;display:flex;justify-content:center;padding:40px}
form{display:flex;flex-direction:column;gap:12px;min-width:280px}
input{background:#0d1b2a;border:1px solid #0f3460;color:#e0e0e0;padding:8px;border-radius:4px}
button{background:#9b59b6;color:#fff;border:none;padding:10px;border-radius:4px;cursor:pointer}
h2{color:#9b59b6}</style></head>
<body><form method="POST" action="/save">
<h2>CheenaSim Setup</h2>
<input name="ssid"    placeholder="WiFi SSID" required>
<input name="pass"    placeholder="WiFi Password" type="password">
<input name="pbUrl"   placeholder="PocketBase URL (https://...)" required>
<input name="pbEmail" placeholder="Your PocketBase email" required>
<input name="pbPw"    placeholder="Your PocketBase password" type="password" required>
<button type="submit">Save &amp; Connect</button>
</form></body></html>)";

bool WifiProv::loadFromNvs(ProvConfig& cfg) {
  Preferences p;
  p.begin(NVS_NS, true);
  cfg.ssid        = p.getString("ssid", "");
  cfg.wifiPassword = p.getString("pass", "");
  cfg.pbUrl       = p.getString("pbUrl", "");
  cfg.pbEmail     = p.getString("pbEmail", "");
  cfg.pbPassword  = p.getString("pbPw", "");
  p.end();
  return cfg.ssid.length() > 0 && cfg.pbUrl.length() > 0;
}

void WifiProv::saveToNvs(const ProvConfig& cfg) {
  Preferences p;
  p.begin(NVS_NS, false);
  p.putString("ssid",    cfg.ssid);
  p.putString("pass",    cfg.wifiPassword);
  p.putString("pbUrl",   cfg.pbUrl);
  p.putString("pbEmail", cfg.pbEmail);
  p.putString("pbPw",    cfg.pbPassword);
  p.end();
}

void WifiProv::runPortal(ProvConfig& cfg) {
  WiFi.softAP(AP_SSID);
  Serial.print("Provisioning AP up: "); Serial.println(AP_SSID);
  Serial.print("IP: "); Serial.println(WiFi.softAPIP());

  WebServer server(80);
  bool done = false;

  server.on("/", [&]() {
    server.send(200, "text/html", PORTAL_HTML);
  });

  server.on("/save", HTTP_POST, [&]() {
    cfg.ssid         = server.arg("ssid");
    cfg.wifiPassword = server.arg("pass");
    cfg.pbUrl        = server.arg("pbUrl");
    cfg.pbEmail      = server.arg("pbEmail");
    cfg.pbPassword   = server.arg("pbPw");
    saveToNvs(cfg);
    server.send(200, "text/plain", "Saved! Rebooting...");
    done = true;
  });

  // Captive portal: redirect all unknown hosts
  server.onNotFound([&]() {
    server.sendHeader("Location", "http://192.168.4.1/");
    server.send(302, "text/plain", "");
  });

  server.begin();
  while (!done) {
    server.handleClient();
    delay(2);
  }
  delay(500);
  ESP.restart();
}
