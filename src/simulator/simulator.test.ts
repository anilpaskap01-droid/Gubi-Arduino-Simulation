import {describe,it,expect} from 'vitest';
import {registry,definitions} from '../components/registry';
import {example} from '../examples';
import {newProject,parseProject} from '../utils/project';
import {buildNetlist} from './netlist';
import {loadHex} from './hex';
import {Engine,pulseAngle} from './engine';
import blinkFirmware from './fixtures/blink.hex?raw';
import servoFirmware from './fixtures/servo.hex?raw';
import uartFirmware from './fixtures/uart.hex?raw';
import pwmFirmware from './fixtures/pwm.hex?raw';
function firmware(words:number[]){const bytes=words.flatMap(w=>[w&255,w>>8]);let text='';for(let i=0;i<bytes.length;i+=16){const data=bytes.slice(i,i+16),r=[data.length,i>>8,i&255,0,...data];r.push((-r.reduce((a,b)=>a+b,0))&255);text+=':'+r.map(b=>b.toString(16).padStart(2,'0')).join('')+'\n';}return text+':00000001FF';}
describe('registry and projects',()=>{
 it('provides 100+ unique documented definitions',()=>{expect(registry.length).toBeGreaterThanOrEqual(100);expect(new Set(registry.map(d=>d.id)).size).toBe(registry.length);for(const d of registry){expect(d.documentation.length).toBeGreaterThan(10);expect(new Set(d.pins.map(p=>p.id)).size).toBe(d.pins.length);if(d.supportLevel==='Experimental')expect(d.simulationHandler==='none'||d.category==='Boards').toBe(true);}});
 it('round trips every example',()=>{for(let i=0;i<20;i++){const p=example(i);expect(parseProject(JSON.stringify(p))).toEqual(p);p.components.forEach(c=>expect(definitions[c.type]).toBeDefined());}});
 it('rejects corrupt and dangling projects',()=>{expect(()=>parseProject('{}')).toThrow();const p=newProject();p.wires.push({id:'bad',source:'missing',target:'uno',sourceHandle:'A',targetHandle:'D13',color:'#000000'});expect(()=>parseProject(JSON.stringify(p))).toThrow();});
});
describe('GCC compiled firmware integration',()=>{
 it('blinks at the Arduino delay interval',()=>{const e=new Engine(blinkFirmware,example(0));e.advance(1600000);expect(e.snapshot().states.led.brightness).toBeGreaterThan(.95);e.advance(8000000);e.snapshot();e.advance(1600000);expect(e.snapshot().states.led.brightness).toBeLessThan(.05);});
 it('measures hardware timer PWM duty',()=>{const p=example(11),e=new Engine(pwmFirmware,p);e.advance(1600000);const brightness=e.snapshot().states.led.brightness!;expect(brightness).toBeGreaterThan(.45);expect(brightness).toBeLessThan(.55);});
 it('decodes actual Servo.h 0 and 180 degree pulses',()=>{const e=new Engine(servoFirmware,example(3));e.advance(3200000);expect(e.snapshot().states.servo.angle).toBeGreaterThan(175);e.advance(16000000);expect(e.snapshot().states.servo.angle).toBeLessThan(5);});
 it('runs real UART output and receives echo input',()=>{const e=new Engine(uartFirmware,example(16));e.advance(1600000);expect(e.snapshot().serial).toContain('Hello GUBI');e.rx.push(...new TextEncoder().encode('Echo'));e.advance(1600000);expect(e.snapshot().serial).toBe('Echo');});
});
describe('electrical connectivity',()=>{
 it('conducts GPIO through a series resistor',()=>{const n=buildNetlist(example(0));expect(n.connected('uno:D13','led:A')).toBe(true);expect(n.connected('uno:GND','led:K')).toBe(true);expect(n.connected('uno:D13','uno:GND')).toBe(false);});
 it('warns on direct power short',()=>{const p=newProject();p.wires.push({id:'short',source:'uno',target:'uno',sourceHandle:'5V',targetHandle:'GND',color:'#dd736e'});expect(buildNetlist(p).warnings).toHaveLength(1);});
 it('button closes and opens an input net',()=>{const p=example(1);expect(buildNetlist(p).connected('uno:D2','uno:GND')).toBe(false);p.components.find(c=>c.id==='button')!.properties.pressed=true;expect(buildNetlist(p).connected('uno:D2','uno:GND')).toBe(true);});
});
describe('real AVR execution',()=>{
 // LDI r16,0x20; OUT DDRB,r16; OUT PORTB,r16; RJMP -1
 const hex=firmware([0xe200,0xb904,0xb905,0xcfff]);
 it('executes machine code and lights a connected LED',()=>{const e=new Engine(hex,example(0));e.advance(16000);expect(e.snapshot().states.led.brightness).toBeGreaterThan(.99);});
 it('does not light a disconnected LED',()=>{const p=example(0);p.wires=[];const e=new Engine(hex,p);e.advance(16000);expect(e.snapshot().states.led.brightness).toBe(0);});
 it('rejects corrupt HEX before execution',()=>{expect(()=>loadHex(':010000000001\n:00000001FF')).toThrow(/checksum/);expect(()=>loadHex(':0000000000')).toThrow();});
 it('ADC follows an interactive potentiometer',()=>{const p=example(4),e=new Engine(hex,p);p.components.find(c=>c.id==='sensor')!.properties.value=1023;e.update(p);expect(e.adc.channelValues[0]).toBe(5);});
 it('maps physical servo pulse widths and clamps limits',()=>{expect(pulseAngle(544)).toBe(0);expect(pulseAngle(1472)).toBe(90);expect(pulseAngle(2400)).toBe(180);expect(pulseAngle(4000)).toBe(180);});
 it('buffers actual UART TX bytes',()=>{const e=new Engine(hex,newProject());e.uart.onByteTransmit?.(72);e.uart.onByteTransmit?.(105);expect(e.snapshot().serial).toBe('Hi');expect(e.snapshot().serial).toBe('');});
});
