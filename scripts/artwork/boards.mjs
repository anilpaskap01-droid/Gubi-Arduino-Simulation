import {pcb,rect,circle,path,text,header,chip,qfp,smd,usb,repeat,metal,gold} from './primitives.mjs';
export function drawBoard(def){
 const id=def.id;
 const nano=id==='arduino-nano'||id==='arduino-micro'||id==='arduino-pro-mini';
 const esp=id.startsWith('esp');
 const pico=id==='pico'||id==='pico-w';
 if(nano){const mini=id==='arduino-pro-mini',micro=id==='arduino-micro',x=micro?70:65,w=micro?80:90,y=mini?50:18,h=mini?190:242;
  return pcb(x,y,w,h,micro?'#307477':mini?'#326588':'#267c75')+header(x+7,y+20,mini?12:15,true,14)+header(x+w-8,y+20,mini?12:15,true,14)+(mini?header(83,54,6,false,10):usb(94,y-3,micro?24:32,23))+qfp(94,mini?104:116,32,micro?'32U4':'328P')+rect(95,168,28,9,'url(#metal)',3)+smd(90,95)+smd(123,184)+chip(94,mini?180:210,30,13,'REG',6)+text('GUBI',110,mini?88:73,12)+text(mini?'PRO MINI':micro?'MICRO':'NANO',110,mini?157:157,7)+repeat(3,i=>rect(91+i*14,194,5,3,['#a37138','#384a30','#744635'][i],1));
 }
 if(pico){const wireless=id==='pico-w';return pcb(63,12,94,255,'#287b57')+usb(96,6,28,23)+repeat(20,i=>circle(66,39+i*11,3,gold)+circle(154,39+i*11,3,gold))+header(74,41,19,true,11)+header(146,41,19,true,11)+qfp(92,wireless?160:121,36,'RP2040')+(wireless?rect(84,72,52,57,'url(#metal)',3,'#d5dfd9')+text('WIRELESS',110,106,6,'#465454')+path('M88 139h43v8h-39v8h39','#bdcdae',2):rect(87,188,46,18,'#1b262c',2)+text('FLASH',110,200,5))+smd(102,223)+text('GUBI',110,58,12)+text(wireless?'PICO W':'PICO',110,242,8);}
 if(esp){const c3=id==='esp32-c3',s3=id==='esp32-s3',node=id==='esp8266-nodemcu',x=c3?67:58,w=c3?86:104,y=c3?30:12,h=c3?211:254;
  const antenna=path(`M${x+23} ${y+17}h54v7h-48v8h48v8h-35`,gold,3);
  return pcb(x,y,w,h,node?'#285968':'#263e4a')+header(x+7,y+45,c3?12:16,true,12)+header(x+w-8,y+45,c3?12:16,true,12)+rect(x+18,y+10,w-36,139,'#172a2e',1)+antenna+rect(x+22,y+51,w-44,c3?66:80,'url(#metal)',2,'#d4dddc')+text(node?'ESP8266':s3?'ESP32-S3':c3?'ESP32-C3':'ESP32',110,y+82,9,'#43545b')+text(c3?'RISC-V':'GUBI RADIO',110,y+96,5,'#4c5c61')+qfp(96,y+166,26,'USB')+usb(s3?80:96,y+h-14,27,18)+(s3?usb(121,y+h-14,27,18):'')+rect(x+21,y+205,12,11,'#3f444a',1)+rect(x+w-33,y+205,12,11,'#3f444a',1)+text('BOOT',x+27,y+200,5)+text('RST',x+w-27,y+200,5)+text('GUBI',110,y+156,8);
 }
 const mega=id==='arduino-mega-2560',leonardo=id==='arduino-leonardo';
 return pcb(9,9,202,262,leonardo?'#286c76':'#28786f')+header(18,55,15,true,13)+header(202,44,16,true,12)+header(43,255,mega?16:10,false,9)+usb(6,37,leonardo?29:42,leonardo?22:43)+rect(8,215,40,29,'url(#plastic)',3,'#677a7c')+circle(28,229,8,'#172127')+(mega?qfp(70,109,65,'ATmega2560'):leonardo?qfp(84,116,42,'ATmega32U4'):chip(83,119,44,95,'ATmega328P',28))+qfp(65,mega?56:73,23,'USB')+rect(86,mega?203:94,27,10,'url(#metal)',4)+smd(139,191)+smd(143,206)+circle(54,187,9,metal)+circle(54,187,5,'#455958')+text('GUBI',128,54,24)+text(mega?'MEGA 2560':leonardo?'LEONARDO':'UNO R3',128,74,10)+rect(147,91,5,3,'#364732',1)+text('L',155,95,5)+path('M140 126h29v55h-24 M54 132v33h18','#ffffff18',2);
}
