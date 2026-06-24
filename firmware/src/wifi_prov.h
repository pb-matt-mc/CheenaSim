#pragma once
#include <Arduino.h>

struct ProvConfig {
  String ssid;
  String wifiPassword;
  String pbUrl;
  String pbEmail;
  String pbPassword;
};

class WifiProv {
public:
  bool loadFromNvs(ProvConfig& cfg);
  void saveToNvs(const ProvConfig& cfg);
  void runPortal(ProvConfig& cfg);  // blocks until user submits form
};
