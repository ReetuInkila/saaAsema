#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEScan.h>
#include "secrets.h"


BLEAddress ruuviTagAddress(ruuviTagMacAddress);

BLEScan* pBLEScan;

class MyAdvertisedDeviceCallbacks: public BLEAdvertisedDeviceCallbacks {
    void onResult(BLEAdvertisedDevice advertisedDevice) {
        if (advertisedDevice.getAddress() == ruuviTagAddress) {
            Serial.println("RuuviTag found!");

            // Tässä voit lukea mittaustiedot RuuviTagilta
            // Mittaustiedot ovat yleensä saatavilla BLE-palvelujen ja -luokkien kautta
            // Käytä RuuviTagin teknistä dokumentaatiota selvittääksesi, miten tiedot luetaan
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