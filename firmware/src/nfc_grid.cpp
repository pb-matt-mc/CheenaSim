#include "nfc_grid.h"
#include "config.h"
#include <Wire.h>
#include <Adafruit_PN532.h>

static const char* ROOM_NAMES[6] = {
  "living_room", "kitchen", "study",
  "bedroom", "bathroom", "garden"
};

static Adafruit_PN532 nfc(I2C_SDA, I2C_SCL);

void NfcGrid::begin() {
  Wire.begin(I2C_SDA, I2C_SCL);
}

void NfcGrid::selectChannel(uint8_t ch) {
  Wire.beginTransmission(MUX_ADDR);
  Wire.write(1 << ch);
  Wire.endTransmission();
}

String NfcGrid::scan() {
  for (uint8_t ch = 0; ch < 6; ch++) {
    selectChannel(ch);
    nfc.begin();
    if (!nfc.getFirmwareVersion()) continue;
    nfc.SAMConfig();

    uint8_t uid[7];
    uint8_t uidLen = 0;
    bool found = nfc.readPassiveTargetID(PN532_MIFARE_ISO14443A, uid, &uidLen, 50);
    if (found && uidLen > 0) {
      return String(ROOM_NAMES[ch]);
    }
  }
  return "";
}
