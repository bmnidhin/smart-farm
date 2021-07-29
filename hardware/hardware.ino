#include <ESP8266WebServer.h>
#include <LiquidCrystal_I2C.h>
#include <Wire.h>
#include "DHT.h"
      const char* ssid = "xxxx";  // Enter SSID here
const char* password = "xxxx";  //Enter Password here

float h,t,f,ultra;                                       
int soilvalue,light;

#define ultra_limit 5    // centimeters
#define light_limit 50  // percentage
#define temp_limit 30  // celcius
                                               
#define Ldr A0                               //A0 Pin for ldr
#define Soil D0                             //D0 Pin for soil moisture 
#define echo D3                            //D3 pin for echo
#define trigger D4                        //D4 pin for trigger
#define DHTPIN D5                      //D5 Connected to the DHT sensor
#define Relay D6                        //D6 pin for Relay
#define IN1 D7                         //D7 pin for PUMP  
#define IN4 D8                        //D8 pin for FAN

LiquidCrystal_I2C lcd(0x27,16,2);    
DHT dht(DHTPIN, DHT11);
ESP8266WebServer server(80);              
 
void setup()
{Serial.begin(9600);
  
  Wire.begin(D2,D1);  // D2_SDA    D1_SCL
  pinMode(Relay,OUTPUT);
  pinMode(IN1,OUTPUT);
  pinMode(IN4,OUTPUT);
  pinMode(trigger,OUTPUT);
  pinMode(echo,INPUT);
  pinMode(Soil,INPUT);
  pinMode(Ldr, INPUT);

  dht.begin();
  lcd.begin();lcd.clear();
  
  Serial.print("Connecting to: ");Serial.println(ssid);
  
  WiFi.begin(ssid, password); //connect to your local wi-fi network

  lcd.print("   WELCOME TO   ");
  lcd.setCursor(0,1);
  lcd.print("NEXT-GEN-FARMING");
  delay(3000);lcd.clear();
  
  lcd.print("CONNCETING WIFI");
    
  while (WiFi.status() != WL_CONNECTED) //check wi-fi is connected to wi-fi network
  {
      delay(500);
      Serial.print(".");
  }
  
  lcd.clear();
  lcd.print("WIFI CONNECTED");
  lcd.setCursor(0,1);
  lcd.print(WiFi.localIP());
  
  Serial.println("\nWiFi connected..!");
  Serial.print("IP: "); Serial.println(WiFi.localIP());

  server.on("/", handle_OnConnect);
  server.onNotFound(handle_NotFound);

  server.begin();
  Serial.println("HTTP server started");
  
  delay(5000);lcd.clear();
}

void loop()
{
  Serial.print('\n');                                                      
                                                               
  h = dht.readHumidity();                                       
  t = dht.readTemperature();              // Read temperature as Celsius (the default)                  
  f = dht.readTemperature(true);         // Read temperature as Fahrenheit (isFahrenheit = true) 
  soilvalue = digitalRead(Soil);
  light=map(analogRead(Ldr),0,1023,0,100);
  ultra = ultra_sonic();    

  Serial.print("Soil Moist: ");Serial.println(soilvalue);
  Serial.print("Light :"); Serial.println(light);
  Serial.print("Water: "); Serial.println(ultra);                
                                                                                                                                        
  if (isnan(h) || isnan(t) || isnan(f))        // Check if any reads failed and exit early (to try again).
  {
    lcd.print("   DHT ERROR    ");
    Serial.println("Failed DHT");
  }
  else
  {
    if(t>temp_limit)
    {
      digitalWrite(IN4,HIGH);
    }
    else
    {
      digitalWrite(IN4,LOW);
    }
    
    lcd.print("Temp: ");lcd.print(t);lcd.print(" C");
    lcd.setCursor(0,1);                                              
    lcd.print("Humid: ");lcd.print(h);lcd.print(" %");

    Serial.print("Humidity: "); Serial.print(h);
    Serial.print("%  Temperature: "); Serial.print(t);Serial.println("°C");
  }
  
  delay(2000); lcd.clear();

  if(ultra>ultra_limit)
  {
    Serial.println("No sufficient water");
    lcd.print("Reservoir empty");
  }
  else
  {
    if(soilvalue == 1)
    {
        digitalWrite(IN1,HIGH);
        lcd.print(" Watering plant ");
    }
    else
    {
        digitalWrite(IN1,LOW);
        lcd.print("Moisture Normal");
    }
  }
  
  lcd.setCursor(0,1);
  
  if(light>light_limit)
  {
    digitalWrite(Relay,HIGH);
    lcd.print("Light activated");
  }
  else
  {
    digitalWrite(Relay,LOW);
    lcd.print("Sufficient light");
  }

  server.handleClient();
  
  delay(2000); lcd.clear();    
}

float ultra_sonic()                    //function for ultrasonic sensor
{
  digitalWrite(trigger , HIGH);
  delayMicroseconds(10);
  digitalWrite(trigger,LOW);

  return (pulseIn(echo,HIGH)*0.03475)/2;
}

void handle_OnConnect()
{
  server.send(200, "text/html", SendHTML(t,h,light,ultra,soilvalue)); 
}

void handle_NotFound()
{
  server.send(404, "text/plain", "Not found");
}

String SendHTML(float T,float H,int L,float W,int M)
{
  String ptr = "<!DOCTYPE html> <html>\n";
  
      ptr +="<head><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, user-scalable=no\">\n";
      ptr +="<meta http-equiv=\"refresh\" content=\"5\">\n";
        ptr +="<title>Greenhouse monitor</title>\n";
        ptr +="<style>html { font-family: Helvetica; display: inline-block; margin: 0px auto; text-align: center;}\n";
           ptr +="body{margin-top: 50px;} h1 {color: #444444;margin: 50px auto 30px;}\n";
           ptr +="p {font-size: 24px;color: #444444;margin-bottom: 10px;}\n";
        ptr +="</style>\n";
   
       ptr +="<script>\n";

          ptr += "sendToCloud("; ptr += H; ptr += ",'humidity');";
          ptr += "sendToCloud("; ptr += T; ptr += ",'temperature');";
          ptr += "sendToCloud("; ptr += M; ptr += ",'moisture');";
          ptr += "sendToCloud("; ptr += L; ptr += ",'light');";
          ptr += "sendToCloud("; ptr += W; ptr += ",'water');";
          
          ptr += "function sendToCloud(data,type){";
           ptr += "var xhttp = new XMLHttpRequest();";
           ptr += "xhttp.onreadystatechange =function() {";
            ptr += "if (this.readyState == 4 && this.status == 200) {";
           ptr += "console.log('hi'); }};";
          ptr += "xhttp.open('GET','https://test.thetkmshow.in/'+ type +'/'+data, true);";
          ptr += "xhttp.send();}";
        
       ptr +="</script>\n"; 
     ptr +="</head>\n";
      ptr +="<body>\n";
  
        ptr +="<div id=\"webpage\">\n";
          ptr +="<h1>GREENHOUSE MONITOR</h1>\n";
          
          ptr +="<p>Temperature: ";         ptr +=T;    ptr +=" &deg;C</p>";
          ptr +="<p>Humidity: ";            ptr +=H;    ptr +=" %</p>";
          ptr +="<p>soil moisture: ";       ptr +=M;    ptr +="</p>";
          ptr +="<p>water level: ";         ptr +=W;    ptr +=" cm</p>";
          ptr +="<p>light intensity : ";    ptr +=L;    ptr +=" %</p>";
          
        ptr +="</div>\n";
      ptr +="</body>\n"; 
  ptr +="</html>\n";
  
  return ptr;
}
