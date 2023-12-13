#include <BLEDevice.h>
#include <BLEScan.h>
#include <WiFi.h>
#include <HTTPClient.h>

#include "secrets.h"

BLEAddress ruuviTagAddress(ruuviTagMacAddress);
BLEScan* pBLEScan;

const char* serverUrl = "http://reetuinkila.eu.pythonanywhere.com/add";

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
      String raw_data = String(BLEUtils::buildHexData(nullptr, (uint8_t*)advertisedDevice.getManufacturerData().data(), advertisedDevice.getManufacturerData().length()));
      raw_data.toUpperCase();
      float temp = hexadecimalToDecimal(raw_data.substring(6, 10))*0.005;
      float hum = hexadecimalToDecimal(raw_data.substring(10, 14))*0.0025;
      int pres = hexadecimalToDecimal(raw_data.substring(14, 18))*1+50000;
      sendData(temp, hum, pres);
    }
  }
};

void setup() {
  Serial.begin(115200);
  BLEDevice::init("");
  pBLEScan = BLEDevice::getScan(); 
  pBLEScan->setAdvertisedDeviceCallbacks(new MyAdvertisedDeviceCallbacks());
}

void loop() {
  pBLEScan->start(5, false);
  delay(60000*60); // Odota 60 minuuttia ennen seuraavaa skannausta
}

void sendData(float temp, float hum, int pres){
    // Connect to Wi-Fi
    WiFi.begin(SSID, PASS);
    Serial.println("Connecting");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }

    WiFiClient client;
    HTTPClient http;

    http.begin(client, serverUrl);
    http.addHeader("Content-Type", "text/plain");

    String postData = String(temp) + "," +
                      String(hum) + "," +
                      String(pres) + "," +
                      SQL_pswd;

    Serial.println(postData);
    
    int httpResponseCode = http.POST(postData);
    Serial.println(httpResponseCode);
    http.end();
}