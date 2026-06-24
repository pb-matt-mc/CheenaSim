#pragma once
#include <Arduino.h>

class PbClient {
public:
  bool begin(const String& baseUrl, const String& email, const String& password);
  bool publishPosition(const String& recordId, const String& room, const String& source);
  String pollPartnerPosition(const String& recordId);

private:
  String _baseUrl;
  String _host;
  int    _port = 443;
  String _email;
  String _password;
  String _token;
  bool   _reauth();
  bool   _post(const String& path, const String& body, String& response);
  bool   _patch(const String& path, const String& body, String& response);
  bool   _get(const String& path, String& response);
};
