# Hardware Wiring & Circuit Integration Guide

**Microcontroller:** ESP32-WROOM-32 (38-pin DevKit v1)  
**Edge Sensors:** MAX30102 Pulse Oximeter, DS18B20 OneWire Temp, NEO-6M GPS, SOS Button  

---

## 1. Electrical Schematic & Interconnection Diagram

```
                 +----------------------------------------------------+
                 |                   ESP32 WROOM-32                   |
                 |                                                    |
[3.3V] --------> | 3V3                                            GND | <-------- [GND Rail]
                 |                                                    |
[MAX30102 SDA] ->| GPIO 21 (SDA)                              GPIO 22 | <------- [MAX30102 SCL]
                 |                                                    |
[DS18B20 Data] ->| GPIO 4  (OneWire)                           GPIO 15 | <------- [SOS Push Button]
(4.7kΩ to 3.3V)  |                                                    |            (Normally Open)
                 |                                                    |
[NEO-6M GPS TX] >| GPIO 16 (U2_RXD)                           GPIO 17 | -------> [NEO-6M GPS RX]
                 |                                                    |
[Red SOS LED] <- | GPIO 2  (Status LED)                       GPIO 13 | -------> [WiFi Status LED]
                 +----------------------------------------------------+
```

---

## 2. Complete Pinout & Wiring Table

| Peripheral Component | Pin on Sensor | ESP32 GPIO Pin | Wire Color (Rec.) | Description & Operational Notes |
|---|---|---|---|---|
| **MAX30102**<br/>(Pulse Oximeter & HR) | VCC | 3V3 | Red | Operates on 3.3V DC power rail |
| | GND | GND | Black | Common circuit ground |
| | SDA | GPIO 21 | Blue | I2C Serial Data line |
| | SCL | GPIO 22 | Yellow | I2C Serial Clock line |
| **DS18B20**<br/>(Core Temp Sensor) | VCC (Red) | 3V3 or 5V | Red | Waterproof probe power |
| | GND (Black) | GND | Black | Common circuit ground |
| | DATA (Yellow) | GPIO 4 | Yellow | OneWire data bus. **Requires a 4.7kΩ pull-up resistor** connected between DATA and VCC. |
| **NEO-6M GPS**<br/>(Satellite Positioning)| VCC | 5V / VIN | Red | Connect to 5V power for active ceramic antenna |
| | GND | GND | Black | Common circuit ground |
| | TX | GPIO 16 (RX2) | Green | GPS Transmit connects to ESP32 Hardware Serial2 Receive |
| | RX | GPIO 17 (TX2) | Orange | GPS Receive connects to ESP32 Hardware Serial2 Transmit |
| **Emergency SOS Button** | Terminal 1 | GPIO 15 | Purple | Configured with internal pull-up resistor (`INPUT_PULLUP`). |
| | Terminal 2 | GND | Black | Pressing button shorts GPIO 15 to GND, triggering falling-edge hardware interrupt. |
| **Emergency Indicator LED** | Anode (+) | GPIO 2 | Red | Driven through a 220Ω current limiting resistor. |
| | Cathode (-) | GND | Black | Illuminates on vital threshold breach or panic SOS. |

---

## 3. Power Supply Design in Ambulance Vehicle

In a physical ambulance installation:
1. Vehicle Auxiliary 12V DC battery bus feeds a step-down **LM2596 or MP1584 Buck Converter**.
2. The buck converter outputs a stabilized **5.0V DC at 2.0 Amperes**.
3. 5.0V connects to the **VIN pin** of the ESP32 and VCC of the GPS module.
4. The ESP32 onboard linear low-dropout regulator (LDO) generates 3.3V to power the MAX30102 and DS18B20 sensors.
5. Add a 470µF electrolytic capacitor across VIN and GND to absorb vehicle starter voltage dips.
