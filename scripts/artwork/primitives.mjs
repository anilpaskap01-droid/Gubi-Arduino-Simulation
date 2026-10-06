export const metal='#bac4c5', gold='#c6af71', dark='#20282d';
export const escapeXml=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export const rect=(x,y,w,h,fill=dark,r=3,stroke='none')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`;
export const circle=(x,y,r,fill,stroke='none',width=1)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"/>`;
export const path=(d,stroke=metal,width=2,fill='none')=>`<path d="${d}" stroke="${stroke}" stroke-width="${width}" fill="${fill}" stroke-linecap="round" stroke-linejoin="round"/>`;
export const text=(label,x,y,size=7,fill='#d1ded8',anchor='middle')=>`<text x="${x}" y="${y}" font-family="Arial,sans-serif" font-size="${size}" fill="${fill}" text-anchor="${anchor}">${escapeXml(label)}</text>`;
export const repeat=(count,fn)=>Array.from({length:count},(_,i)=>fn(i)).join('');
export function pcb(x=15,y=18,w=150,h=97,color='#306760'){
 return rect(x,y,w,h,color,5,'#60978c')+path(`M${x+12} ${y+14}H${x+w-14}V${y+h-15}H${x+15}`, '#ffffff12',1)+[[x+8,y+8],[x+w-8,y+8],[x+8,y+h-8],[x+w-8,y+h-8]].map(([a,b])=>circle(a,b,3.5,gold)+circle(a,b,1.8,'#182c2b')).join('');
}
export function header(x,y,count=3,vertical=false,step=8){return rect(x-4,y-5,vertical?9:count*step,vertical?count*step:10,'#182127',1)+repeat(count,i=>rect(x+(vertical?0:i*step)-2,y+(vertical?i*step:0)-2,4,4,gold,.6)+circle(x+(vertical?0:i*step),y+(vertical?i*step:0),.9,'#2c3334'));}
export function terminals(x,y,count=2,color='#448ac0',step=16){return repeat(count,i=>rect(x+i*step,y,step-1,19,color,2,'#8aadbe')+circle(x+i*step+step/2,y+6,4,metal)+path(`M${x+i*step+step/2-2} ${y+8}l4-4`,'#52616a',1.2)+rect(x+i*step+3,y+13,step-7,5,'#172f37',1));}
export function chip(x,y,w,h,label='IC',pins=8){const n=pins/2;return repeat(n,i=>rect(x-5,y+5+i*(h-10)/Math.max(1,n-1),6,3,metal,0)+rect(x+w-1,y+5+i*(h-10)/Math.max(1,n-1),6,3,metal,0))+rect(x,y,w,h,dark,2,'#475258')+circle(x+5,y+5,1.5,'#738080')+text(label,x+w/2,y+h/2+2,Math.min(7,w/6),'#a8b6b4');}
export function qfp(x,y,size=32,label='MCU') {return repeat(7,i=>rect(x-5,y+3+i*4,5,2,metal,0)+rect(x+size,y+3+i*4,5,2,metal,0)+rect(x+3+i*4,y-5,2,5,metal,0)+rect(x+3+i*4,y+size,2,5,metal,0))+rect(x,y,size,size,dark,2,'#48585c')+text(label,x+size/2,y+size/2+2,5,'#b0baba')+circle(x+4,y+4,1.5,'#819194');}
export const smd=(x,y,w=12,h=5)=>rect(x,y,w,h,'#bdc3b5',1)+rect(x+2,y,w-4,h,'#746e5b',0);
export const can=(x,y,r=15)=>circle(x,y,r,'url(#metal)','#c1cccc',1.4)+circle(x,y,r-4,'#52616a')+path(`M${x-r+5} ${y}H${x+r-5} M${x} ${y-r+5}V${y+r-5}`,'#afbdbd',1);
export const usb=(x,y,w=22,h=16)=>rect(x,y,w,h,'url(#metal)',2,'#d1d9d7')+rect(x+4,y+4,w-8,h-7,'#26353c',1)+rect(x+6,y+7,w-12,3,'#758480',1);
export function svg(def,body,{width=180,height=140,family=def.id}={}){
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title" data-component="${def.id}" data-model="${family}"><title id="title">${escapeXml(def.name)} — GUBI component illustration</title><defs><linearGradient id="metal" x2="0.8" y2="1"><stop stop-color="#e1e5df"/><stop offset=".45" stop-color="#8d9da3"/><stop offset="1" stop-color="#bcc8c8"/></linearGradient><linearGradient id="plastic" x2=".7" y2="1"><stop stop-color="#48535b"/><stop offset="1" stop-color="#1e272e"/></linearGradient></defs>${body}</svg>\n`;
}
