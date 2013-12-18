//source:
// humidity code from: http://itp.nyu.edu/physcomp/sensors/Reports/HIH-4030
// temp code from: http://bildr.org/2011/01/tmp102-arduino/
// hidden voltage code from: http://code.google.com/p/tinkerit/wiki/SecretVoltmeter
// wifly library and code: https://github.com/harlequin-tech/WiFlyHQ

// CODE //

// libaries you have to include
#include <SPI.h>
#include <WiFi.h>
#include <Wire.h>
#include <tmp102.h>

// info for the cosm update
#define APIKEY         "you api key from cosm.com" // your cosm api key here
#define FEEDID         12345                    // feed ID
#define USERAGENT      "abcd"     // user agent is the project name

// info for the internet connection
char ssid[] = "yourSSIDname";      //  your network SSID (name) 
char pass[] = "yourPASSWORD";   // your network password
int status = WL_IDLE_STATUS;

// initialize the library instance
WiFiClient client;
// connect to the cosm server
IPAddress server(216,52,233,121);      // numeric IP for api.cosm.com
//char server[] = "api.cosm.com";   // name address for cosm API

// handling the connection with cosm || frequence of the updates
unsigned long lastConnectionTime = 0;          // last time you connected to the server, in milliseconds
boolean lastConnected = false;                 // state of the connection last time through the main loop
const unsigned long postingInterval = 30*1000; //delay between updates to Cosm.com || seconds before the *

// setting up the sensors
//temp
const byte sensorAddress = 0x90;
tmp102 *thermometer = new tmp102(&Wire);
 

//light
int lightPin = 0;
int Light = 0;

//humidity
int humidityPin = 1;
int humidityReading = 0;

//hiddenvoltage
long readVcc() {
  long result;
  // Read 1.1V reference against AVcc
  ADMUX = _BV(REFS0) | _BV(MUX3) | _BV(MUX2) | _BV(MUX1);
  delay(2); // Wait for Vref to settle
  ADCSRA |= _BV(ADSC); // Convert
  while (bit_is_set(ADCSRA,ADSC));
  result = ADCL;
  result |= ADCH<<8;
  result = 1126400L / result; // Back-calculate AVcc in mV
  return result;
}

void setup() {
  //Initialize serial and wait for port to open
  Serial.begin(9600); 
  
  // fire up the temperature sensor
  thermometer->init(sensorAddress);
  //Set default config.
  thermometer->writeConf(TMP102_DEFAULT_CONF);
  
  // check for the presence of the shield:
  if (WiFi.status() == WL_NO_SHIELD) {
    Serial.println("WiFi shield not present"); 
    // don't continue:
    while(true);
  } 
  
  // attempt to connect to Wifi network:
  while ( status != WL_CONNECTED) { 
    Serial.print("Attempting to connect to SSID: ");
    Serial.println(ssid);
    // Connect to WPA/WPA2 network. Change this line if using open or WEP network:    
    status = WiFi.begin(ssid, pass);

    // give some time (10 seconds) to the shield to connect
    delay(10000);
  } 
  // you're connected now, so print out the status:
  printWifiStatus();
}

// get the sensors to read data and send it to the cosm client

void loop() {
  
  //light
  int sensorReading = analogRead(lightPin);
  // convert the data to a String to send it
  String dataString = "Light,";
  dataString += sensorReading;
  
  //temp
  int temperature = 0;
  if(thermometer->readTemp(temperature)) {
  } 
  else {
    Serial.println(F("Temp read failed!!"));
  }
  
  // convert the data to a String to send it
  int SensorReading2 = temperature*0.0625;
  dataString += "\nTemperature,";
  dataString += SensorReading2;
  
  //humidity
  humidityReading = analogRead(humidityPin); 
  float humidityVoltage = humidityReading * 5;
  humidityVoltage /= 1024.0;
  // convert to percentage
  float humidityPercentage = humidityVoltage * 100;
  humidityPercentage /= 5;
  
  // convert the data to a String to send it
  int SensorReading3 = humidityPercentage;
  dataString += "\nHumidity,";
  dataString += SensorReading3;
  
  // vcc input
  int SensorReading4 = readVcc();
  dataString += "\nVoltageIn,";
  dataString += SensorReading4;
  

  // if there's incoming data from the net connection.
  // send it out the serial port.  This is for debugging
  // purposes only:
  while (client.available()) {
    char c = client.read();
    Serial.print(c);
  }

  // if there's no net connection, but there was one last time
  // through the loop, then stop the client:
  if (!client.connected() && lastConnected) {
    Serial.println();
    Serial.println("disconnecting.");
    client.stop();
  }

  // if you're not connected, and ten seconds have passed since
  // your last connection, then connect again and send data: 
  if(!client.connected() && (millis() - lastConnectionTime > postingInterval)) {
    sendData(dataString);
  }
  // store the state of the connection for next time through
  // the loop:
  lastConnected = client.connected();
}

// this method makes a HTTP connection to the server:
void sendData(String thisData) {
  // if there's a successful connection:
  if (client.connect(server, 80)) {
    Serial.println("connecting...");
    // send the HTTP PUT request:
    client.print("PUT /v2/feeds/");
    client.print(FEEDID);
    client.println(".csv HTTP/1.1");
    client.println("Host: api.cosm.com");
    client.print("X-ApiKey: ");
    client.println(APIKEY);
    client.print("User-Agent: ");
    client.println(USERAGENT);
    client.print("Content-Length: ");
    client.println(thisData.length());

    // last pieces of the HTTP PUT request:
    client.println("Content-Type: text/csv");
    client.println("Connection: close");
    client.println();

    // here's the actual content of the PUT request:
    client.println(thisData);
  } 
  else {
    // if you couldn't make a connection:
    Serial.println("connection failed");
    Serial.println();
    Serial.println("disconnecting.");
    client.stop();
  }
  // note the time that the connection was made or attempted:
  lastConnectionTime = millis();
}


void printWifiStatus() {
  // print the SSID of the network you're attached to:
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());

  // print your WiFi shield's IP address:
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);

  // print the received signal strength:
  long rssi = WiFi.RSSI();
  Serial.print("signal strength (RSSI):");
  Serial.print(rssi);
  Serial.println(" dBm");
}


