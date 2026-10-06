import {newProject,blinkCode} from '../utils/project';
import type {Project} from '../types';
export const exampleNames=['Blink LED','Button LED','RGB Color','Servo Sweep','Potentiometer','Traffic Light','Ultrasonic Distance','DHT11','LCD Hello World','Buzzer','7 Segment Counter','PWM LED','LDR Automatic Light','PIR Alarm','Joystick','NeoPixel','Serial Monitor','Relay','DC Motor','Stepper Motor'];
const implemented=new Set([0,1,2,3,4,5,11,12,16]);
export function example(index:number):Project{
 const p=newProject();p.name=exampleNames[index];
 const add=(type:string,id:string,x:number,y:number)=>p.components.push({id,type,position:{x,y},rotation:0,properties:{value:512,pressed:false,color:type.startsWith('led-')?type.slice(4):'green'}});
 const wire=(source:string,sourceHandle:string,target:string,targetHandle:string,color='#6cad8c')=>p.wires.push({id:crypto.randomUUID(),source,sourceHandle,target,targetHandle,color});
 const led=(pin='D13',id='led',y=130,color='red')=>{add('led-'+color,id,470,y);add('resistor','res-'+id,330,y+40);const r=p.components.at(-1)!;r.properties.value=220;wire('uno',pin,r.id,'1');wire(r.id,'2',id,'A');wire(id,'K','uno','GND','#777e89');};
 if([0,1,4,11,12].includes(index))led(index===11||index===4||index===12?'D9':'D13');
 if(index===1){add('push-button','button',460,320);wire('button','1','uno','D2');wire('button','2','uno','GND');p.code='void setup() { pinMode(13, OUTPUT); pinMode(2, INPUT_PULLUP); }\nvoid loop() { digitalWrite(13, !digitalRead(2)); }';}
 if(index===2){add('rgb-led-common-cathode','rgb',450,160);['R','G','B'].forEach((pin,i)=>{add('resistor','r'+i,330,70+i*130);wire('uno','D'+[9,10,11][i],'r'+i,'1');wire('r'+i,'2','rgb',pin);});wire('rgb','GND','uno','GND');p.code='void setup() { pinMode(9, OUTPUT); pinMode(10, OUTPUT); pinMode(11, OUTPUT); }\nvoid loop() { analogWrite(9, 255); analogWrite(10, 40); analogWrite(11, 120); delay(1000); analogWrite(9, 20); analogWrite(10, 180); analogWrite(11, 255); delay(1000); }';}
 if(index===3){add('sg90-servo','servo',460,140);wire('uno','D9','servo','SIG');wire('uno','5V','servo','VCC','#dd736e');wire('uno','GND','servo','GND','#777e89');p.code='#include <Servo.h>\nServo motor;\nvoid setup() { motor.attach(9); }\nvoid loop() {\n  for (int angle=0; angle<=180; angle++) { motor.write(angle); delay(15); }\n  for (int angle=180; angle>=0; angle--) { motor.write(angle); delay(15); }\n}';}
 if(index===4||index===12){add(index===4?'potentiometer':'ldr','sensor',450,350);wire('sensor','VCC','uno','5V','#dd736e');wire('sensor','GND','uno','GND','#777e89');wire('sensor','OUT','uno','A0');p.code='void setup() { pinMode(9, OUTPUT); Serial.begin(9600); }\nvoid loop() { int value=analogRead(A0); analogWrite(9, value/4); Serial.println(value); delay(100); }';}
 if(index===5){[0,1,2].forEach(i=>led('D'+[11,10,9][i],'led'+i,40+i*160,['red','yellow','green'][i]));p.code='void setup() { pinMode(9, OUTPUT); pinMode(10, OUTPUT); pinMode(11, OUTPUT); }\nvoid loop() { digitalWrite(11,HIGH); delay(1000); digitalWrite(11,LOW); digitalWrite(10,HIGH); delay(500); digitalWrite(10,LOW); digitalWrite(9,HIGH); delay(1000); digitalWrite(9,LOW); }';}
 if(index===11)p.code='void setup() { pinMode(9, OUTPUT); }\nvoid loop() { for(int b=0;b<=255;b++) { analogWrite(9,b); delay(8); } for(int b=255;b>=0;b--) { analogWrite(9,b); delay(8); } }';
 if(index===16)p.code='void setup() { Serial.begin(9600); Serial.println("Hello GUBI"); }\nvoid loop() { if (Serial.available()) Serial.write(Serial.read()); }';
 if(!implemented.has(index)){const type=['','','','','','','hc-sr04','dht11','lcd-16x2','buzzer','7-segment-1-digit','','','pir','joystick','neopixel','','relay','dc-motor','stepper-motor'][index];add(type,'device',450,140);p.code='// Experimental circuit template. Device protocol is not implemented.\n'+blinkCode;}
 return p;
}
export const exampleSupported=(i:number)=>implemented.has(i);
