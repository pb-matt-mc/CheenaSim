#include "pb_client.h"
#include <WiFiClientSecure.h>
#include <ArduinoHttpClient.h>
#include <ArduinoJson.h>

static String _host;
static bool   _useTls;

static void parseUrl(const String& url, String& host, bool& useTls) {
  useTls = url.startsWith("https://");
  String stripped = url;
  stripped.replace("https://", "");
  stripped.replace("http://", "");
  int slash = stripped.indexOf('/');
  host = (slash > 0) ? stripped.substring(0, slash) : stripped;
}

bool PbClient::begin(const String& baseUrl, const String& email, const String& password) {
  _baseUrl = baseUrl;
  parseUrl(baseUrl, _host, _useTls);

  String body = "{\"identity\":\"" + email + "\",\"password\":\"" + password + "\"}";
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
  return _patch("/api/collections/positions/records/" + recordId, body, resp);
}

String PbClient::pollPartnerPosition(const String& recordId) {
  String resp;
  if (!_get("/api/collections/positions/records/" + recordId, resp)) return "";
  JsonDocument doc;
  if (deserializeJson(doc, resp) != DeserializationError::Ok) return "";
  return doc["room"].as<String>();
}

bool PbClient::_post(const String& path, const String& body, String& response) {
  WiFiClientSecure wifi;
  wifi.setInsecure();
  HttpClient client(wifi, _host.c_str(), 443);
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
  HttpClient client(wifi, _host.c_str(), 443);
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
  HttpClient client(wifi, _host.c_str(), 443);
  client.beginRequest();
  client.get(path);
  client.sendHeader("Authorization", "Bearer " + _token);
  client.endRequest();
  int code = client.responseStatusCode();
  response = client.responseBody();
  return code >= 200 && code < 300;
}
