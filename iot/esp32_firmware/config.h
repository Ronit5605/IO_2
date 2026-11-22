#ifndef CONFIG_H
#define CONFIG_H

// ==============================================================================
// SMART AMBULANCE IoT TELEMETRY FIRMWARE CONFIGURATION
// ESP32 + MAX30102 + DS18B20 + NEO-6M GPS + EMERGENCY SOS BUTTON
// ==============================================================================

// Hardware Pin Definitions (ESP32 WROOM-32)
#define PIN_ONE_WIRE_BUS      4    // DS18B20 OneWire Data Pin
#define PIN_EMERGENCY_BUTTON  15   // Active-LOW Hardware SOS Push Button
#define PIN_LED_EMERGENCY     2    // Red LED for SOS Status Indicator
#define PIN_LED_WIFI          13   // Blue/Green LED for Network Connectivity Status

// GPS NEO-6M Serial Configuration (ESP32 Hardware Serial 2)
#define GPS_RX_PIN            16   // ESP32 RX2 connects to GPS TX
#define GPS_TX_PIN            17   // ESP32 TX2 connects to GPS RX
#define GPS_BAUD_RATE         9600

// I2C Configuration (MAX30102 Pulse Oximeter & Heart Rate)
// Default ESP32 I2C: SDA = GPIO 21, SCL = GPIO 22

// Network & MQTT Configuration
// IMPORTANT: Replace with your local WiFi credentials and MQTT Broker IP address
#define DEFAULT_WIFI_SSID     "Your_WiFi_SSID"
#define DEFAULT_WIFI_PASSWORD "Your_WiFi_Password"

#define DEFAULT_MQTT_SERVER   "192.168.1.100"  // IP address where backend is running
#define DEFAULT_MQTT_PORT     1883
#define DEFAULT_MQTT_USER     ""               // Optional auth
#define DEFAULT_MQTT_PASS     ""               // Optional auth

// Device Identity
#define DEFAULT_AMBULANCE_ID  "GJ-05-EM-1081"
#define DEFAULT_PATIENT_ID    "PAT-4011"
#define MQTT_TOPIC_TELEMETRY  "ambulance/telemetry"
#define MQTT_TOPIC_ALERTS     "ambulance/alerts"

// Sensor Sampling & Transmission Intervals
#define TELEMETRY_INTERVAL_MS 2000  // Transmit payload every 2 seconds
#define BUTTON_DEBOUNCE_MS    250   // Hardware button debounce time

#endif // CONFIG_H
