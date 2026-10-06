import type {Project} from '../types';
export function buildNetlist(p:Project){
 const parent=new Map<string,string>();const root=(x:string):string=>{if(!parent.has(x))parent.set(x,x);const a=parent.get(x)!;if(a===x)return x;const r=root(a);parent.set(x,r);return r;};const join=(a:string,b:string)=>parent.set(root(a),root(b));
 p.wires.forEach(w=>join(`${w.source}:${w.sourceHandle}`,`${w.target}:${w.targetHandle}`));
 const directNets=new Map<string,string[]>();for(const key of parent.keys()){const r=root(key);directNets.set(r,[...(directNets.get(r)||[]),key]);}
 p.components.filter(c=>c.type==='resistor').forEach(c=>join(`${c.id}:1`,`${c.id}:2`));
 p.components.filter(c=>['push-button','toggle-switch','slide-switch'].includes(c.type)&&c.properties.pressed).forEach(c=>join(`${c.id}:1`,`${c.id}:2`));
 const nets=new Map<string,string[]>();for(const key of parent.keys()){const r=root(key);nets.set(r,[...(nets.get(r)||[]),key]);}
 const warnings:string[]=[];for(const nodes of directNets.values())if(nodes.some(x=>x.endsWith(':5V')||x.endsWith(':VCC'))&&nodes.some(x=>x.endsWith(':GND')))warnings.push('Potential short circuit detected: power connected to GND.');
 return {nets:[...nets.values()].map((nodes,i)=>({id:`net-${i}`,nodes,voltage:0,digitalState:0})),root,warnings,connected:(a:string,b:string)=>root(a)===root(b)};
}
