import {definitions} from '../components/registry';
import type {Project} from '../types';
export const blinkCode=`void setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(500);\n  digitalWrite(13, LOW);\n  delay(500);\n}\n`;
export function newProject():Project{return {version:1,id:crypto.randomUUID(),name:'Untitled circuit',board:'arduino-uno-r3',code:blinkCode,components:[{id:'uno',type:'arduino-uno-r3',position:{x:100,y:100},rotation:0,properties:{}}],wires:[],simulatorSettings:{frequency:16000000},updatedAt:Date.now()};}
export function parseProject(text:string):Project{
 const p=JSON.parse(text);if(p.version!==1||typeof p.id!=='string'||typeof p.name!=='string'||typeof p.code!=='string'||!definitions[p.board]||!Array.isArray(p.components)||!Array.isArray(p.wires)||p.components.length>500||p.wires.length>2000)throw Error('Invalid or unsupported GUBI project');
 const ids=new Set<string>();for(const c of p.components){if(!definitions[c.type]||typeof c.id!=='string'||ids.has(c.id)||!Number.isFinite(c.position?.x)||!Number.isFinite(c.position?.y)||!Number.isFinite(c.rotation)||!c.properties||typeof c.properties!=='object')throw Error('Invalid component');ids.add(c.id);}
 for(const w of p.wires){const s=p.components.find((c:any)=>c.id===w.source),t=p.components.find((c:any)=>c.id===w.target);if(!s||!t||!definitions[s.type].pins.some(x=>x.id===w.sourceHandle)||!definitions[t.type].pins.some(x=>x.id===w.targetHandle)||!/^#[0-9a-f]{6}$/i.test(w.color))throw Error('Invalid wire');}
 return {...p,simulatorSettings:{frequency:16000000}};
}
export function download(name:string,text:string){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'application/json'}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
