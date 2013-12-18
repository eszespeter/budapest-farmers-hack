//source:
// humidity code from: http://itp.nyu.edu/physcomp/sensors/Reports/HIH-4030
// temp code from: http://bildr.org/2011/01/tmp102-arduino/
// hidden voltage code from: http://code.google.com/p/tinkerit/wiki/SecretVoltmeter
// wifly library and code: https://github.com/harlequin-tech/WiFlyHQ

// CODE //

//libraries
#include <WiFlyHQ.h>
#include "Credentials.h" //for cosm feed details
#include <SoftwareSerial.h>

//wifly
WiFly wifly;
SoftwareSerial wifiSerial(2,3);

// wifi setup
const char mySSID[] = "yourssid";
const char myPassword[] = "yourpassword";

//cosm connection
int i; //number of updates
char buff2[64]; //buffer for data to cosm

//temp setup
#include <Wire.h>
int tmp102Address = 0x48;

//light setup
int lightPin = 0;
int light = 0;

//humidity setup
int humidityPin = 1;
int humidityReading = 0;

// temperature setup
float getTemperature() {
  Wire.requestFrom(tmp102Address,2); 

  byte MSB = Wire.read();
  byte LSB = Wire.read();

  int TemperatureSum = ((MSB << 8) | LSB) >> 4; 

  float celsius = TemperatureSum*0.0625;
  return celsius;
}

//hiddenvoltage setup & read
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

void terminal();

void setup()
{
    char buf[32]; //buffer for wifly information

    Serial.begin(115200);
    Serial.println("Starting");
    Serial.print("Free memory: ");
    Serial.println(wifly.getFreeMemory(),DEC);

    wifiSerial.begin(9600);
    if (!wifly.begin(&wifiSerial, &Serial)) {
        Serial.println("Failed to start wifly");
	terminal();
    }

    /* Join wifi network if not already associated */
    if (!wifly.isAssociated()) {
	/* Setup the WiFly to connect to a wifi network */
	Serial.println("Joining network");
	wifly.setSSID(mySSID);
	wifly.setPassphrase(myPassword);
	wifly.enableDHCP();

	if (wifly.join()) {
	    Serial.println("Joined wifi network");
	} else {
	    Serial.println("Failed to join wifi network");
	    terminal();
	}
    } else {
        Serial.println("Already joined network");
    }

    //terminal();

    Serial.print("MAC: ");
    Serial.println(wifly.getMAC(buf, sizeof(buf)));
    Serial.print("IP: ");
    Serial.println(wifly.getIP(buf, sizeof(buf)));
    Serial.print("Netmask: ");
    Serial.println(wifly.getNetmask(buf, sizeof(buf)));
    Serial.print("Gateway: ");
    Serial.println(wifly.getGateway(buf, sizeof(buf)));

    wifly.setDeviceID("Wifly-WebClient");
    Serial.print("DeviceID: ");
    Serial.println(wifly.getDeviceID(buf, sizeof(buf)));

    if (wifly.isConnected()) {
        Serial.println("Old connection active. Closing");
	wifly.close();
    }
}
void loop() {
  
  delay(TIMETOUPDATE);

  Serial.println("=======================");
  
  //number of updates
  Serial.print("Number of updates: ");
  Serial.println(i);
  
  //light
  light = analogRead(lightPin);
  Serial.print("Light: ");
  Serial.println(light, DEC);
  
  //temp
  float celsius = getTemperature();
  Serial.print("Celsius: ");
  Serial.println(celsius);
  
  //  float fahrenheit = (1.8 * celsius) + 32;
  //  Serial.print("Fahrenheit: ");
  //  Serial.println(fahrenheit);
  
  //humidity
  humidityReading = analogRead(humidityPin); 
  float humidityVoltage = humidityReading * 5;
  humidityVoltage /= 1024.0;
  // convert to percentage
  float humidityPercentage = humidityVoltage * 100;
  humidityPercentage /= 5;
  Serial.print("Humidity: ");
  Serial.print(humidityPercentage);
  Serial.println("%");
  
  //hiddenvoltage
  Serial.print("Voltage in: ");
  Serial.println(readVcc(), DEC);
  
  Serial.println("=======================");
  
  int hotness = celsius;
  int humidity = humidityPercentage;
  int voltage = readVcc();
  
  // prepare the data to send
  // format (API V2)
  // multiple lines each with <datastreamID>,<datastreamValue>
  // feedID can be the datastream name of the numberic ID
  sprintf(buff2,"0,%d\n1,%d\n2,%d\n3,%d\n4,%d",i++,light,hotness,humidity,voltage);
  
  Serial.println("connecting...");
  
  if (wifly.open("api.cosm.com", 80))
  {
    Serial.println("connected");
    wifly.print("PUT /v2/feeds/");  // APIV2
    wifly.print(COSMFEED);
    wifly.println(".csv HTTP/1.1");
    wifly.println("Host: api.cosm.com");
    wifly.print("X-ApiKey: ");
    wifly.println(APIKEY);
  
    wifly.println("User-Agent: arduino WiFly RN-XV");
    wifly.print("Content-Type: text/csv\nContent-Length: ");
    wifly.println(strlen(buff2));
    
    wifly.println("Connection: close");
    wifly.println();
  
    wifly.print(buff2);
    wifly.println();
  }
  
  else
  {
    Serial.println("connection failed");
  }
  
  delay(2000);

  while (wifly.available())
  {
    Serial.write(wifly.read());  // display the result
  }
  
  Serial.println();
   
  if (wifly.isConnected())
  {
    Serial.println("disconnecting.");
    wifly.close();
    Serial.println("disconnected.");
  }
}

void terminal()
{
    while (1) {
	if (wifly.available() > 0) {
	    Serial.write(wifly.read());
	}


	if (Serial.available() > 0) {
	    wifly.write(Serial.read());
	}
    }
}  
