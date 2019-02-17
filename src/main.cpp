#include <Arduino.h>
#include <Servo.h>
#include <esp8266wifi.h>
#include <esp8266httpclient.h>
#include <ESP8266WebServer.h>
#include <EEPROM.h>

const short int OPTO = 2;
const short int PORT = 5; //GPIO5 SILK WRONG (because IO4)
Servo servo_1; // Giving name to servo.
int addr = 0;

const char* ssid = "hgplsoft";
const char* password = "7102237203210";
const char* uuid = "05d5504e-1894-423f-9e9d-f9ee8ebce778";
ESP8266WebServer server(9249);
char wheelpos=0; // 0=open closepos=close    
char closepos=4; // optotick  /open_close
int wheeldir=1; // -1== to open , 1=to close


void handleRoot() {
  
  server.send(200, "text/plain", "hello from ESP8266!");
  
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
	Serial.print("Connecting..");
	while (WiFi.status() != WL_CONNECTED) {
    	delay(1000);
    	Serial.print("Connecting..");
  	}
	
	Serial.print("Connected! ");
	Serial.println(WiFi.localIP());

	server.on("/", handleRoot);
	server.on("/open", []() {
    	server.send(200, "text/plain", "switched on");
		Serial.println("OPEN");
		toopen();
  	});
	server.on("/close", []() {
    	server.send(200, "text/plain", "switched off");
		Serial.println("CLOSE");
		toclose();
  	});
	server.on("/swap", []() {		
    	server.send(200, "text/plain", "swapped");
		Serial.println("SWAP");
  	});
	server.begin();
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
	if (webcnt>10){
		server.handleClient();
		webcnt=0;
	}

} 