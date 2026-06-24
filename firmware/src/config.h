#pragma once

// ---------- WiFi / PocketBase ----------
// These are populated by the WiFi provisioning portal on first boot (stored in NVS).
// Hard-code them here only for development flashing convenience; clear before gifting.
#define PB_URL          "https://minecraftserver.tailfd0db9.ts.net:8443"
#define PB_EMAIL        "user-a@local.dev"   // board-1 (you); change to user-b@local.dev for board-2
#define PB_PASSWORD     ""                   // fill before flashing — do not commit

// ---------- PocketBase record IDs ----------
// board-1 (user-a): MY=smndwiryxkcnre6  PARTNER=fdv9w3fq3ets70e
// board-2 (user-b): MY=fdv9w3fq3ets70e  PARTNER=smndwiryxkcnre6
#define MY_RECORD_ID      "smndwiryxkcnre6"  // user-a positions record
#define PARTNER_RECORD_ID "fdv9w3fq3ets70e"  // user-b positions record

// ---------- Hardware ----------
#define I2C_SDA       21
#define I2C_SCL       22
#define LED_DATA_PIN  18
#define LED_COUNT     6

// TCA9548A I2C address (default A0–A2 tied low = 0x70)
#define MUX_ADDR      0x70

// NFC scan interval ms
#define NFC_INTERVAL  200

// Partner poll interval ms
#define POLL_INTERVAL 2000
