#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEScan.h>
#include "secrets.h"


BLEAddress ruuviTagAddress(ruuviTagMacAddress);

BLEScan* pBLEScan;

//Converts hexadecimal values to decimal values
int hexadecimalToDecimal(String hexVal)
{
    int len = hexVal.length();
    int base = 1;

    int dec_val = 0;

    for (int i = len - 1; i >= 0; i--)
    {
        if (hexVal[i] >= '0' && hexVal[i] <= '9')
        {
            dec_val += (hexVal[i] - 48) * base;

            base = base * 16;
        }
        else if (hexVal[i] >= 'A' && hexVal[i] <= 'F')
        {
            dec_val += (hexVal[i] - 55) * base;

            base = base * 16;
        }
    }
    return dec_val;
}

class MyAdvertisedDeviceCallbacks: public BLEAdvertisedDeviceCallbacks {
  void onResult(BLEAdvertisedDevice advertisedDevice) {
    if (advertisedDevice.getAddress() == ruuviTagAddress) {
      Serial.println("RuuviTag found!");
      String raw_data = String(BLEUtils::buildHexData(nullptr, (uint8_t*)advertisedDevice.getManufacturerData().data(), advertisedDevice.getManufacturerData().length()));
      raw_data.toUpperCase();
      Serial.println(raw_data);
      Serial.println(raw_data.substring(4, 6));
      Serial.println(hexadecimalToDecimal(raw_data.substring(6, 10))*0.005);
      Serial.println(hexadecimalToDecimal(raw_data.substring(10, 14))*0.0025);
      Serial.println(hexadecimalToDecimal(raw_data.substring(14, 18))*1+50000);

    }
  }
};

void setup() {
  Serial.begin(115200);
  Serial.println("ESP32 RuuviTag Scanner");

  BLEDevice::init("");
  pBLEScan = BLEDevice::getScan(); 
  pBLEScan->setAdvertisedDeviceCallbacks(new MyAdvertisedDeviceCallbacks());
}

void loop() {
  Serial.println("Scanning...");
  pBLEScan->start(5, false);

  delay(60000); // Odota minuutti ennen seuraavaa skannausta
}