import {chromium,expect} from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
await page.addInitScript(()=>{const Original=Worker;window.Worker=class extends Original{constructor(...args){super(...args);this.addEventListener('message',e=>{if(e.data.type==='snapshot')window.__snapshot=e.data.snapshot;});}};});
page.on('pageerror',e=>errors.push(String(e)));await page.goto(process.env.TEST_URL||'http://localhost:5173');
await page.getByRole('button',{name:'Explore Blink LED'}).click();
await page.getByRole('button',{name:/Start simulation/i}).click();
await expect(page.locator('.status-label')).toHaveText(/running/i,{timeout:60000});
const led=page.locator('[data-id="led"] svg path').nth(1);
const opacities=new Set();for(let i=0;i<20;i++){opacities.add(await led.getAttribute('opacity'));await page.waitForTimeout(100);}
expect(opacities.size).toBeGreaterThan(1);console.log('PASS Blink LED changes with actual GPIO:',[...opacities]);
await page.screenshot({path:'docs/studio.png'});
await page.getByRole('button',{name:'Examples',exact:true}).click();await page.locator('.example-picker button').filter({hasText:'Servo Sweep'}).click();
await page.getByRole('button',{name:/Start simulation/i}).click();await expect(page.locator('.status-label')).toHaveText(/running/i,{timeout:60000});
const angles=new Set();for(let i=0;i<15;i++){angles.add(await page.locator('[data-id="servo"] .servo-visual span').innerText());await page.waitForTimeout(180);}expect(angles.size).toBeGreaterThan(5);console.log('PASS Servo.h real PWM angles:',[...angles]);
await page.getByRole('button',{name:'Examples',exact:true}).click();await page.locator('.example-picker button').filter({hasText:'Serial Monitor'}).click();
await page.getByRole('button',{name:/Start simulation/i}).click();await expect(page.locator('.terminal pre')).toContainText('Hello GUBI',{timeout:60000});
await page.getByRole('textbox',{name:'Serial input'}).fill('GUBI RX test');await page.getByRole('button',{name:'Send ↵'}).click();await expect(page.locator('.terminal pre')).toContainText('GUBI RX test');console.log('PASS UART TX/RX');
// Produce independently executed firmware fixtures for unit regression tests.
if(process.env.GENERATE_FIXTURES==='1'){await fs.mkdir('src/simulator/fixtures',{recursive:true});
for(const [name,source] of [['blink','void setup(){pinMode(13,OUTPUT);} void loop(){digitalWrite(13,HIGH);delay(500);digitalWrite(13,LOW);delay(500);}'],['servo','#include <Servo.h>\nServo s;void setup(){s.attach(9);s.write(0);}void loop(){s.write(180);delay(1000);s.write(0);delay(1000);}'],['uart','void setup(){Serial.begin(9600);Serial.println("Hello GUBI");}void loop(){if(Serial.available()) Serial.write(Serial.read());}'],['pwm','void setup(){pinMode(9,OUTPUT);analogWrite(9,128);}void loop(){}']]){
 const hex=await page.evaluate(async source=>{const {compile}=await import('/avr/index.js');return (await compile({source:'#include <Arduino.h>\n'+source,assetsBase:new URL('/avr/',location.origin).href})).hex;},source);await fs.writeFile(`src/simulator/fixtures/${name}.hex`,hex);
}
for(const [name,index] of [['button',1],['adc',4],['rgb',2]]){const hex=await page.evaluate(async index=>{const {example}=await import('/src/examples/index.ts');const {compile}=await import('/avr/index.js');return (await compile({source:'#include <Arduino.h>\n'+example(index).code,assetsBase:new URL('/avr/',location.origin).href})).hex;},index);await fs.writeFile(`src/simulator/fixtures/${name}.hex`,hex);}}expect(errors).toEqual([]);console.log('PASS no browser runtime errors');await browser.close();

