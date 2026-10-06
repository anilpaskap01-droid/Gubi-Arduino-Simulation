import {CPU,avrInstruction,AVRIOPort,portBConfig,portCConfig,portDConfig,AVRTimer,timer0Config,timer1Config,timer2Config,AVRUSART,usart0Config,AVRADC,adcConfig,PinState} from 'avr8js';
import {loadHex} from './hex';
import {buildNetlist} from './netlist';
import type {Project,Snapshot} from '../types';
export const pulseAngle=(microseconds:number)=>Math.max(0,Math.min(180,(microseconds-544)*180/(2400-544)));
export class Engine {
 cpu:CPU;ports:AVRIOPort[];uart:AVRUSART;adc:AVRADC;project:Project;serial='';net:ReturnType<typeof buildNetlist>;
 levels=Array(20).fill(false);last=Array(20).fill(0);rise=Array(20).fill(0);highCycles=Array(20).fill(0);pulse=Array(20).fill(0);windowStart=0;rx:number[]=[];
 constructor(hex:string,project:Project){
  this.project=project;this.net=buildNetlist(project);this.cpu=new CPU(loadHex(hex));
  this.ports=[new AVRIOPort(this.cpu,portDConfig),new AVRIOPort(this.cpu,portBConfig),new AVRIOPort(this.cpu,portCConfig)];
  new AVRTimer(this.cpu,timer0Config);new AVRTimer(this.cpu,timer1Config);new AVRTimer(this.cpu,timer2Config);
  this.uart=new AVRUSART(this.cpu,usart0Config,16000000);this.adc=new AVRADC(this.cpu,adcConfig);this.uart.onByteTransmit=b=>this.serial+=String.fromCharCode(b);
  this.ports.forEach((port,group)=>port.addListener((value,old)=>{for(let bit=0;bit<(group===0?8:6);bit++){const i=group===0?bit:group===1?bit+8:bit+14;if((value^old)&(1<<bit)){if(this.levels[i]){this.highCycles[i]+=this.cpu.cycles-this.last[i];this.pulse[i]=(this.cpu.cycles-this.rise[i])/16;}else this.rise[i]=this.cpu.cycles;this.levels[i]=!!(value&(1<<bit));this.last[i]=this.cpu.cycles;}}}));
  this.inputs();
 }
 pin(i:number){return {port:this.ports[i<8?0:i<14?1:2],bit:i<8?i:i<14?i-8:i-14};}
 update(project:Project){this.project=project;this.net=buildNetlist(project);this.inputs();}
 inputs(){const uno=this.project.components.find(c=>c.type==='arduino-uno-r3');if(!uno)return;
  for(let i=0;i<20;i++){const key=`${uno.id}:${i<14?'D'+i:'A'+(i-14)}`,{port,bit}=this.pin(i);if(port.pinState(bit)===PinState.Low||port.pinState(bit)===PinState.High)continue;
   let high=port.pinState(bit)===PinState.InputPullUp;
   if(this.net.connected(key,`${uno.id}:GND`))high=false;else if(this.net.connected(key,`${uno.id}:5V`))high=true;
   port.setPin(bit,high);
   if(i>=14){this.adc.channelValues[i-14]=0;for(const c of this.project.components.filter(c=>['potentiometer','ldr','photoresistor'].includes(c.type)))if(this.net.connected(key,`${c.id}:OUT`)&&this.net.connected(`${c.id}:VCC`,`${uno.id}:5V`)&&this.net.connected(`${c.id}:GND`,`${uno.id}:GND`))this.adc.channelValues[i-14]=Number(c.properties.value)*5/1023;}
  }
 }
 advance(cycles:number){this.inputs();const target=this.cpu.cycles+cycles;while(this.cpu.cycles<target){avrInstruction(this.cpu);this.cpu.tick();if(this.rx.length&&this.uart.rxEnable&&!this.uart.rxBusy)this.uart.writeByte(this.rx.shift()!);}}
 snapshot():Snapshot{
  const elapsed=Math.max(1,this.cpu.cycles-this.windowStart),pins:Record<string,number>={};for(let i=0;i<20;i++){if(this.levels[i])this.highCycles[i]+=this.cpu.cycles-this.last[i];pins[i<14?'D'+i:'A'+(i-14)]=this.highCycles[i]/elapsed;this.highCycles[i]=0;this.last[i]=this.cpu.cycles;}this.windowStart=this.cpu.cycles;
  const uno=this.project.components.find(c=>c.type==='arduino-uno-r3'),states:Snapshot['states']={};
  if(uno){const value=(id:string)=>{if(this.net.connected(id,`${uno.id}:5V`))return 1;for(const [pin,v] of Object.entries(pins))if(this.net.connected(id,`${uno.id}:${pin}`))return v;return 0;};const ground=(id:string)=>this.net.connected(id,`${uno.id}:GND`);
   for(const c of this.project.components){if(c.type.startsWith('led-'))states[c.id]={brightness:ground(`${c.id}:K`)?value(`${c.id}:A`):0};
    if(c.type.startsWith('rgb-led')){const anode=c.type.endsWith('anode'),common=anode?value(`${c.id}:VCC`)>0:ground(`${c.id}:GND`);const rgb=['R','G','B'].map(k=>Math.round(255*(common?(anode?1-value(`${c.id}:${k}`):value(`${c.id}:${k}`)):0)));states[c.id]={color:`rgb(${rgb.join(',')})`,brightness:Math.max(...rgb)/255};}
    if(c.type.includes('servo')&&ground(`${c.id}:GND`)&&value(`${c.id}:VCC`)>0){for(let i=0;i<14;i++)if(this.net.connected(`${c.id}:SIG`,`${uno.id}:D${i}`)&&this.pulse[i]>=500&&this.pulse[i]<=2500)states[c.id]={angle:pulseAngle(this.pulse[i])};}
   }
  }
  const serial=this.serial;this.serial='';return {time:this.cpu.cycles/16000000,pins,states,serial,warnings:this.net.warnings};
 }
}
