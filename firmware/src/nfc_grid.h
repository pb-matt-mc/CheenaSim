#pragma once
#include <Arduino.h>

class NfcGrid {
public:
  void begin();
  String scan();   // returns room name or "" if none detected

private:
  void selectChannel(uint8_t ch);
  String tagToRoom(uint8_t* uid, uint8_t uidLen);
};
