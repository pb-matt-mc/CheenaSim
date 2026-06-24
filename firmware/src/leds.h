#pragma once
#include <Arduino.h>

class Leds {
public:
  void begin();
  void setPartnerRoom(const String& room);
  void pulseAll();
  void show();

private:
  int roomIndex(const String& room);
};
