#include <Arduino.h>
#include <Servo.h>
#include <esp8266wifi.h>
#include <esp8266httpclient.h>
#include <ESP8266WebServer.h>
#include <EEPROM.h>
#include <ESP8266mDNS.h>
#include <WiFiUdp.h>
#include <ArduinoOTA.h>
#include <ESP8266HTTPUpdateServer.h>

const short int OPTO = 2;
const short int PORT = 5; //GPIO5 SILK WRONG (because IO4)
Servo servo_1; // Giving name to servo.
int addr = 0;

const char* host = "blindsopener";
const char* ssid = "hgplsoft";
const char* password = "7102237203210";
const char* uuid = "05d5504e-1894-423f-9e9d-f9ee8ebce778";
ESP8266WebServer server(80);
ESP8266HTTPUpdateServer httpUpdater;
char wheelpos=0; // 0=open closepos=close    
char closepos=4; // optotick  /open_close
int wheeldir=1; // -1== to open , 1=to close


void handleRoot() {
  
  server.send(200, "text/html", "<a href=\"/open\">Open</a> <a href=\"/close\">Close</a>");
  
}

void servo(int fok){
		servo_1.attach(PORT); // Attaching Servo to D3
		servo_1.write (fok); // Servo will move to 45 degree angle.
}
void servostop(){
	servo_1.detach();
}

void toopen(){
	if (wheelpos>0){		
		wheeldir=-1;
		servo(0);
	}
}

void toclose(){	
	if (wheelpos<closepos){
		wheeldir=1;
		servo(180); // Servo will move to 45 degree angle.
	}
}

void setup(/* arguments */) {
	EEPROM.begin(512);
	if ((char(EEPROM.read(addr))==0xEE) && (char(EEPROM.read(addr+1))==0xAA)) {
		//already initialized read the value
		wheelpos=char(EEPROM.read(addr+2));
		closepos=char(EEPROM.read(addr+3));
	} else {
		wheelpos=0;
		EEPROM.write(addr+2, wheelpos);
		EEPROM.write(addr+3, closepos);
		EEPROM.write(addr, 0xEE);
		EEPROM.write(addr+1, 0xAA);
	}


	Serial.begin(115200);
	pinMode(OPTO, INPUT);
	
	WiFi.begin(ssid, password);
	Serial.print("Connecting..222 ");
	/*
	while (WiFi.waitForConnectResult() != WL_CONNECTED) {
		Serial.println("Connection Failed! Rebooting...");
		delay(5000);
		ESP.restart();
	}*/
	while (WiFi.status() != WL_CONNECTED) {
    	delay(1000);
    	Serial.print("Connecting..");
  	}
	
	Serial.print("CONNNN! ");
	ArduinoOTA.onStart([]() {
		Serial.println("Start");
	});
	ArduinoOTA.onEnd([]() {
		Serial.println("\nEnd");
	});
	//ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
	//  Serial.printf("Progress: %u%%\r", (progress / (total / 100)));
	//});
	ArduinoOTA.onError([](ota_error_t error) {
		Serial.printf("Error[%u]: ", error);
		if (error == OTA_AUTH_ERROR) Serial.println("Auth Failed");
		else if (error == OTA_BEGIN_ERROR) Serial.println("Begin Failed");
		else if (error == OTA_CONNECT_ERROR) Serial.println("Connect Failed");
		else if (error == OTA_RECEIVE_ERROR) Serial.println("Receive Failed");
		else if (error == OTA_END_ERROR) Serial.println("End Failed");
	});
	ArduinoOTA.begin();
	Serial.println("Ready - OTA Success!!!");
  	Serial.print("IP address: ");
	Serial.println(WiFi.localIP());

	server.on("/", handleRoot);
	server.on("/open", []() {
    	server.send(200, "text/html", "<a href=\"close\">switched on</a>");
		Serial.println("OPEN");
		toopen();
  	});
	server.on("/close", []() {
    	server.send(200, "text/html", "<a href=\"open\">switched off</a>");
		Serial.println("CLOSE ");
		toclose();
  	});
	server.on("/swap", []() {		
    	server.send(200, "text/plain", "swapped");
		Serial.println("SWAP");
  	});
	MDNS.begin(host);
  	httpUpdater.setup(&server);
	server.begin();
	MDNS.addService("http", "tcp", 80);
  	Serial.println("HTTP server started");
}



int i=HIGH;
int l=0;
int val=0;
int oldval=0;
int webcnt=0;

void loop(){
	delay(10);
	val = digitalRead(OPTO);
	if ((val==1) && (oldval==0))
	{		
		wheelpos+=wheeldir;
		Serial.print("OPTO ");Serial.println(wheelpos);
		EEPROM.write(addr+2, wheelpos);
		if (wheelpos<1){
			servo(180);
			delay(40);			
			servostop();
		}
		if (wheelpos>=closepos){
			servo(0);
			delay(40);
			servostop();
		}
	}
	oldval=val;

	
	webcnt++;
	if (webcnt>9){
		ArduinoOTA.handle();
		server.handleClient();
		webcnt=0;
	}

} 