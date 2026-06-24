#include "pb_client.h"
#include <WiFiClientSecure.h>
#include <ArduinoHttpClient.h>
#include <ArduinoJson.h>

static void parseUrl(const String& url, String& host, int& port) {
  bool tls = url.startsWith("https://");
  port = tls ? 443 : 80;
  String stripped = url;
  stripped.replace("https://", "");
  stripped.replace("http://", "");
  int slash = stripped.indexOf('/');
  String hostPort = (slash > 0) ? stripped.substring(0, slash) : stripped;
  int colon = hostPort.indexOf(':');
  if (colon > 0) {
    host = hostPort.substring(0, colon);
    port = hostPort.substring(colon + 1).toInt();
  } else {
    host = hostPort;
  }
}

bool PbClient::begin(const String& baseUrl, const String& email, const String& password) {
  _baseUrl  = baseUrl;
  _email    = email;
  _password = password;
  parseUrl(baseUrl, _host, _port);
  return _reauth();
}

bool PbClient::_reauth() {
  String body = "{\"identity\":\"" + _email + "\",\"password\":\"" + _password + "\"}";
  String resp;
  if (!_post("/api/collections/users/auth-with-password", body, resp)) return false;
  JsonDocument doc;
  if (deserializeJson(doc, resp) != DeserializationError::Ok) return false;
  _token = doc["token"].as<String>();
  return _token.length() > 0;
}

bool PbClient::publishPosition(const String& recordId, const String& room, const String& source) {
  String body = "{\"room\":\"" + room + "\",\"source\":\"" + source + "\"}";
  String resp;
  if (_patch("/api/collections/positions/records/" + recordId, body, resp)) return true;
  // retry once after re-auth (handles token expiry)
  if (_reauth()) return _patch("/api/collections/positions/records/" + recordId, body, resp);
  return false;
}

String PbClient::pollPartnerPosition(const String& recordId) {
  String resp;
  if (!_get("/api/collections/positions/records/" + recordId, resp)) {
    if (_reauth()) _get("/api/collections/positions/records/" + recordId, resp);
  }
  if (resp.length() == 0) return "";
  JsonDocument doc;
  if (deserializeJson(doc, resp) != DeserializationError::Ok) return "";
  return doc["room"].as<String>();
}

bool PbClient::_post(const String& path, const String& body, String& response) {
  WiFiClientSecure wifi;
  wifi.setInsecure();
  HttpClient client(wifi, _host.c_str(), _port);
  client.beginRequest();
  client.post(path);
  client.sendHeader("Content-Type", "application/json");
  client.sendHeader("Content-Length", body.length());
  client.beginBody();
  client.print(body);
  client.endRequest();
  int code = client.responseStatusCode();
  response = client.responseBody();
  return code >= 200 && code < 300;
}

bool PbClient::_patch(const String& path, const String& body, String& response) {
  WiFiClientSecure wifi;
  wifi.setInsecure();
  HttpClient client(wifi, _host.c_str(), _port);
  client.beginRequest();
  client.patch(path);
  client.sendHeader("Content-Type", "application/json");
  client.sendHeader("Authorization", "Bearer " + _token);
  client.sendHeader("Content-Length", body.length());
  client.beginBody();
  client.print(body);
  client.endRequest();
  int code = client.responseStatusCode();
  response = client.responseBody();
  return code >= 200 && code < 300;
}

bool PbClient::_get(const String& path, String& response) {
  WiFiClientSecure wifi;
  wifi.setInsecure();
  HttpClient client(wifi, _host.c_str(), _port);
  client.beginRequest();
  client.get(path);
  client.sendHeader("Authorization", "Bearer " + _token);
  client.endRequest();
  int code = client.responseStatusCode();
  response = client.responseBody();
  return code >= 200 && code < 300;
}
