#include "wifi_prov.h"
#include <Preferences.h>
#include <WiFi.h>
#include <WebServer.h>

static const char* NVS_NS  = "prov";
static const char* AP_SSID = "CheenaSetup";

static const char PORTAL_HTML[] PROGMEM = R"(<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CheenaSim Setup</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,-apple-system,sans-serif;background:#0E0C1A;color:#EAE6F4;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}
.card{background:#151220;border:1px solid rgba(155,89,182,0.18);border-radius:14px;padding:36px 32px;display:flex;flex-direction:column;gap:14px;width:100%;max-width:320px;position:relative;overflow:hidden}
.card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#9b59b6,#00c8c8)}
.wordmark{font-size:0.65rem;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#6E6880}
.headline{font-size:1.2rem;font-weight:600;line-height:1.35;margin-bottom:4px}
.headline span{background:linear-gradient(90deg,#9b59b6,#00c8c8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
label{font-size:0.72rem;font-weight:500;letter-spacing:0.06em;text-transform:uppercase;color:#6E6880;margin-bottom:-6px}
input{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);color:#EAE6F4;padding:10px 13px;border-radius:8px;font-family:ui-monospace,monospace;font-size:0.85rem;width:100%}
input:focus{outline:none;border-color:rgba(155,89,182,0.45)}
button{background:linear-gradient(90deg,#9b59b6,#00c8c8);color:#fff;border:none;padding:12px;border-radius:8px;cursor:pointer;font-family:system-ui,sans-serif;font-size:0.875rem;font-weight:600;margin-top:4px}
</style></head>
<body><div class="card"><form method="POST" action="/save">
<p class="wordmark">CheenaSim</p>
<p class="headline">Connect your <span>board.</span></p>
<label>WiFi network</label>
<input name="ssid"    placeholder="Network name" required>
<label>WiFi password</label>
<input name="pass"    placeholder="Password" type="password">
<label>PocketBase URL</label>
<input name="pbUrl"   placeholder="https://..." required>
<label>Your email</label>
<input name="pbEmail" placeholder="you@example.com" required>
<label>Your password</label>
<input name="pbPw"    placeholder="Password" type="password" required>
<button type="submit">Save &amp; connect</button>
</form></div></body></html>)";

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
