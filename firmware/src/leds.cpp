#include "leds.h"
#include "config.h"
#include <FastLED.h>

static CRGB leds[LED_COUNT];
static int _partnerIdx = -1;
static uint8_t _pulse  = 0;
static int8_t  _dir    = 1;

static const char* ROOM_ORDER[6] = {
  "living_room", "kitchen", "study",
  "bedroom", "bathroom", "garden"
};

void Leds::begin() {
  FastLED.addLeds<WS2812B, LED_DATA_PIN, GRB>(leds, LED_COUNT);
  FastLED.setBrightness(80);
  fill_solid(leds, LED_COUNT, CRGB::Black);
  FastLED.show();
}

int Leds::roomIndex(const String& room) {
  for (int i = 0; i < 6; i++) {
    if (room == ROOM_ORDER[i]) return i;
  }
  return -1;
}

void Leds::setPartnerRoom(const String& room) {
  _partnerIdx = roomIndex(room);
  fill_solid(leds, LED_COUNT, CRGB(10, 10, 20));
  if (_partnerIdx >= 0) {
    leds[_partnerIdx] = CRGB(0, 200, 255);
  }
  FastLED.show();
}

void Leds::pulseAll() {
  _pulse += _dir * 5;
  if (_pulse >= 250 || _pulse <= 5) _dir = -_dir;
  fill_solid(leds, LED_COUNT, CRGB(_pulse / 4, 0, _pulse));
  FastLED.show();
}

void Leds::show() {
  FastLED.show();
}
