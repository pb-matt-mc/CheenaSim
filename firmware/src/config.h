#pragma once

// ---------- WiFi / PocketBase ----------
// These are populated by the WiFi provisioning portal on first boot (stored in NVS).
// Hard-code them here only for development flashing convenience; clear before gifting.
#define PB_URL          ""   // e.g. "https://abc.trycloudflare.com"
#define PB_EMAIL        ""
#define PB_PASSWORD     ""

// ---------- PocketBase record IDs ----------
// From backend/seed.json — fill after Phase 1 is complete
#define MY_RECORD_ID      ""
#define PARTNER_RECORD_ID ""

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
