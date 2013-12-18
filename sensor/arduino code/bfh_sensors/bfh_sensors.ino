//source:
// humidity code from: http://itp.nyu.edu/physcomp/sensors/Reports/HIH-4030
// temp code from: http://bildr.org/2011/01/tmp102-arduino/
// hidden voltage code from: http://code.google.com/p/tinkerit/wiki/SecretVoltmeter


//Code

//temp
#include <Wire.h>
int tmp102Address = 0x48;

//light
int lightPin = 0;
int sensorValue = 0;

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
  pinMode(lightPin, INPUT);
  Wire.begin();
  Serial.begin(9600);
}

void loop() {

  //light
  sensorValue = analogRead(lightPin);
  Serial.print("Light: ");
  Serial.println(sensorValue, DEC);
  
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
  Serial.println(readVcc(), DEC );
  
  Serial.println("=======================");
  
  delay(2000);
}

float getTemperature(){
  Wire.requestFrom(tmp102Address,2); 

  byte MSB = Wire.read();
  byte LSB = Wire.read();

  int TemperatureSum = ((MSB << 8) | LSB) >> 4; 

  float celsius = TemperatureSum*0.0625;
  return celsius;
}
