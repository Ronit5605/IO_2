# ESP32 Smart Ambulance IoT Firmware

This directory contains the embedded C++ source code for the ESP32 microcontroller onboard the smart ambulance. It collects patient vital telemetry and GPS coordinates and transmits them in real time over MQTT to the backend gateway.

---

## 1. Hardware Pinout & Wiring Map

| Sensor / Component | ESP32 GPIO Pin | Protocol / Interface | Function / Description |
|---|---|---|---|
| **MAX30102 (Pulse Oximeter)** | GPIO 21 (SDA), GPIO 22 (SCL) | I2C (Wire) | Measures Heart Rate (BPM) & Blood Oxygen (SpO2 %) |
| **DS18B20 (Temp Sensor)** | GPIO 4 | OneWire (4.7kΩ pullup) | High-precision core body temperature (°C) |
| **NEO-6M GPS Module** | GPIO 16 (RX2), GPIO 17 (TX2) | UART Serial2 (9600 baud) | Satellite positioning (Latitude, Longitude, Speed) |
| **Emergency SOS Button** | GPIO 15 | Active-LOW Interrupt | Hardware push button for immediate paramedic distress beacon |
| **Emergency LED Indicator** | GPIO 2 | Digital Output | Flashes red when SOS or abnormal threshold is active |
| **WiFi Status Indicator** | GPIO 13 | Digital Output | Steady ON when connected to WiFi & MQTT Broker |

### Power Supply
- ESP32 Vin / 5V: Connect to 5V 2A regulator or vehicle 12V-to-5V step-down buck converter.
- MAX30102: Connect VCC to 3.3V, GND to GND.
- DS18B20: Connect VCC to 3.3V or 5V, GND to GND, and a 4.7kΩ pull-up resistor between VCC and Data pin (GPIO 4).
- NEO-6M GPS: Connect VCC to 3.3V/5V, GND to GND, TX to GPIO 16, RX to GPIO 17.
- Push Button: Connect one terminal to GPIO 15 and the other terminal to GND (using ESP32 internal pullup).

---

## 2. Required Arduino IDE Libraries

Install these libraries from **Arduino IDE -> Tools -> Manage Libraries...**:

1. `PubSubClient` by Nick O'Leary (v2.8+)
2. `ArduinoJson` by Benoit Blanchon (v6.21+ or v7.x)
3. `DallasTemperature` by Miles Burton (v3.9+)
4. `OneWire` by Paul Stoffregen (v2.3+)
5. `TinyGPSPlus` by Mikal Hart (v1.0.3+)

---

## 3. Configuration & Flashing Instructions

1. Open `smart_ambulance_node.ino` in the Arduino IDE.
2. Open `config.h` and update:
   - `DEFAULT_WIFI_SSID`: Your local Wi-Fi SSID.
   - `DEFAULT_WIFI_PASSWORD`: Your local Wi-Fi password.
   - `DEFAULT_MQTT_SERVER`: The local IP address of the machine running the backend server (e.g. `192.168.1.100`).
   - `DEFAULT_AMBULANCE_ID`: Vehicle number matching the database (e.g. `GJ-05-EM-1081`).
3. Under **Tools -> Board**, select **ESP32 Dev Module** (or `DOIT ESP32 DEVKIT V1`).
4. Select the matching COM Port under **Tools -> Port**.
5. Click **Upload**.
6. Open **Serial Monitor** at **115200 baud** to view real-time sensor readings and MQTT transmissions.
