#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEScan.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <time.h>
#include <Wire.h>
#include <Adafruit_SSD1306.h>

#include "secrets.h"

#define SCREEN_WIDTH 128 // OLED display width, in pixels
#define SCREEN_HEIGHT 32 // OLED display height, in pixels

#define OLED_RESET     -1 
#define SCREEN_ADDRESS 0x3C 
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

BLEAddress ruuviTagAddress(ruuviTagMacAddress);
BLEScan* pBLEScan;

const char* serverUrl = "http://reetuinkila.eu.pythonanywhere.com/add";

unsigned long previousPrintTime = 0; // Variable to store the last time temperature was printed
unsigned long previousSendTime = 0;  // Variable to store the last time data was sent

bool send = false;
bool print = true;

// put function declarations here:
void useData(float temp, float hum, int pres);
void sendData(float temp, float hum, int pres);
void printTemp(float number);


//Converts hexadecimal values to decimal values
int hexadecimalToDecimal(String hexVal){
    int len = hexVal.length();
    int base = 1;
    int dec_val = 0;

    for (int i = len - 1; i >= 0; i--){
        if (hexVal[i] >= '0' && hexVal[i] <= '9'){
            dec_val += (hexVal[i] - 48) * base;
            base = base * 16;
        }
        else if (hexVal[i] >= 'A' && hexVal[i] <= 'F'){
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
      useData(temp, hum, pres);
    }
  }
};

void setup() {
  Serial.begin(115200);
  BLEDevice::init("");
  pBLEScan = BLEDevice::getScan(); 
  pBLEScan->setAdvertisedDeviceCallbacks(new MyAdvertisedDeviceCallbacks());

  // SSD1306_SWITCHCAPVCC = generate display voltage from 3.3V internally
  display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS);
  display.clearDisplay(); // Clear the display buffer

}

void loop() {
  // Connect to Wi-Fi
  WiFi.begin(SSID, PASS);
    Serial.println("Connecting");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println();

  // Scan weather data
  pBLEScan->start(5, false);

  // Get current time
  configTime(0, 0, "pool.ntp.org");
  struct tm timeinfo;
  if(!getLocalTime(&timeinfo)){
    Serial.println("Failed to obtain time");
    return;
  }

  // Calculate the remaining minutes until the next quarter-hour
  int remainingMinutes = 15 - (timeinfo.tm_min % 15);

  // Next measurement will be sent
  if(timeinfo.tm_min >= 45){
    send = true;
  }

  if(timeinfo.tm_hour <= 22 && timeinfo.tm_hour >= 7){
    print = true;
    display.ssd1306_command(SSD1306_DISPLAYON);
  }else{
    print = false;
    display.ssd1306_command(SSD1306_DISPLAYOFF);
  }
  // Disconnect from Wi-Fi
  WiFi.disconnect(true);

  // Delay until next quarter-hour
  Serial.println(remainingMinutes);
  delay(remainingMinutes * 60 * 1000);
  
}

void useData(float temp, float hum, int pres){
  if (send){
    sendData(temp, hum, pres);
    send = false;
  }
  if(print){
    printTemp(temp);
  }
}

void sendData(float temp, float hum, int pres){
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

void printTemp(float number) {
  display.clearDisplay(); // Clear the display buffer
  display.setTextSize(4);
  display.setTextColor(SSD1306_WHITE); // Set text color to white
  display.setCursor(5, 5); // Set the position of the text
  display.print(number);
  display.display(); // Show the display buffer on the screen
}