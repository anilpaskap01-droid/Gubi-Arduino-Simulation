import type {ComponentDefinition,Pin} from '../types';
import {expandedCatalog} from './expandedCatalog.ts';
const pins=(names:string[]):Pin[]=>names.map(id=>({id,type:id==='GND'||id==='K'?'ground':id==='5V'||id==='VCC'?'power':id.startsWith('A')&&id!=='A'?'analog':'digital'}));
const groups:Record<string,string[]>={
 Boards:['Arduino Uno R3','Arduino Nano','Arduino Mega 2560','Arduino Leonardo','Arduino Micro','Arduino Pro Mini','ESP32 DevKit','ESP32-S3','ESP32-C3','ESP8266 NodeMCU','Pico','Pico W'],
 Basic:['LED red','LED green','LED blue','LED yellow','LED white','RGB LED common cathode','RGB LED common anode','Resistor','Capacitor','Electrolytic capacitor','Diode','Potentiometer','Push button','Toggle switch','Slide switch','DIP switch','LDR','Thermistor','Buzzer','Piezo'],
 Display:['7 segment 1 digit','7 segment 4 digit','LCD 16x2','LCD 20x4','I2C LCD','OLED SSD1306 128x64','OLED 128x32','Dot matrix 8x8','MAX7219 matrix','NeoPixel','WS2812B strip'],
 Motors:['SG90 servo','Standard servo','DC motor','Stepper motor','28BYJ-48','ULN2003','L298N','L293D'],
 Sensors:['DHT11','DHT22','HC-SR04','PIR','MQ2','MQ135','Flame sensor','Soil moisture','Rain sensor','Sound sensor','Vibration sensor','Hall sensor','IR obstacle sensor','Line sensor','BMP180','BMP280','BME280','MPU6050','DS18B20','Photoresistor','Rotary encoder','Joystick','Touch sensor','Capacitive touch'],
 Communication:['HC-05','HC-06','NRF24L01','ESP-01','RFID RC522','IR receiver','IR transmitter','GPS NEO-6M'],
 Power:['Battery','AA battery pack','9V battery','DC supply','5V supply','Breadboard power module','Relay','MOSFET module'],
 IC:['74HC595','74HC165','PCF8574','ATtiny85','NE555'],
 Other:['Breadboard full','Breadboard mini','Keypad 4x4','Membrane keypad','Microphone','Speaker','Relay module','Traffic light module']};
export const slug=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-');
const originalCatalog:ComponentDefinition[]=Object.entries(groups).flatMap(([category,names])=>names.map(name=>{
 const id=slug(name),board=category==='Boards',led=name.startsWith('LED'),rgb=name.startsWith('RGB'),servo=name.toLowerCase().includes('servo'),resistor=name==='Resistor',input=['Push button','Toggle switch','Slide switch'].includes(name),analog=['Potentiometer','LDR','Photoresistor'].includes(name);
 const supported=led||rgb||servo||resistor||input||analog;
 const pinNames=board?['5V','GND',...Array.from({length:14},(_,i)=>`D${i}`),...Array.from({length:6},(_,i)=>`A${i}`)]:led?['A','K']:rgb?['R','G','B',name.includes('anode')?'VCC':'GND']:servo?['VCC','GND','SIG']:resistor||input?['1','2']:analog?['VCC','GND','OUT']:name==='HC-SR04'?['VCC','GND','TRIG','ECHO']:['VCC','GND','SIG'];
 return {id,name,category,description:board?'Microcontroller development board':`${name} circuit component`,pins:pins(pinNames),visual:board?'board':led?'led':rgb?'rgb':servo?'servo':resistor?'resistor':input?'button':analog?'pot':'module',defaultProperties:{value:analog?512:resistor?220:0,pressed:false,color:led?name.split(' ')[1]:'green'},simulationHandler:supported?id:'none',interactiveControls:analog?['value']:input?['pressed']:[],documentation:supported?'Functional digital model. Not an analog SPICE solver.':'Visual and wiring only. Device protocol is not implemented.',supportLevel:id==='arduino-uno-r3'?'Full':supported?'Partial':'Experimental'};
}));
export const registry:ComponentDefinition[]=[...originalCatalog,...expandedCatalog];
export const definitions=Object.fromEntries(registry.map(d=>[d.id,d]));
