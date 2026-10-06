import {pcb,rect,circle,path,text,header,chip,qfp,smd,repeat,metal,gold} from './primitives.mjs';
export function drawCommunication(def){const id=def.id;
 if(id==='hc-05'||id==='hc-06'){return pcb(48,9,84,116,'#3b6f5c')+rect(55,13,70,84,'#365d69',1,'#96aaa3')+path('M60 19h57v7h-51v8h51v8h-33',gold,3)+qfp(72,49,32,'BT')+rect(70,85,40,8,'url(#metal)',2)+header(58,123,id==='hc-05'?6:4,false,id==='hc-05'?13:21)+text(id.toUpperCase(),90,113,10)+(id==='hc-05'?rect(113,97,12,10,'#333c41',1)+circle(119,102,3,metal):smd(112,102));}
 if(id==='nrf24l01'){return pcb(28,28,127,87,'#263c40')+path('M35 36h113v8h-104v9h104v9h-62',gold,3)+qfp(88,78,25,'NRF')+rect(48,78,25,10,'url(#metal)',2)+header(32,81,4,true,8)+header(43,81,4,true,8)+text('NRF24L01',118,107,7);}
 if(id==='esp-01'){return pcb(44,17,92,105,'#273d4c')+path('M55 25h69v7h-62v8h62v8h-50',gold,3)+qfp(73,60,31,'ESP8266')+header(55,108,4,false,20)+header(55,116,4,false,20)+smd(52,85)+text('ESP-01',90,102,7);}
 if(id==='rfid-rc522'){return pcb(16,15,148,112,'#34688d')+repeat(5,i=>rect(23+i*5,22+i*5,133-i*10,62-i*10,'none',6,gold))+chip(65,95,51,21,'RC522',10)+header(36,124,8,false,15)+text('13.56 MHz RFID',91,87,7);}
 if(id==='ir-receiver'){return path('M67 85V128 M90 85V128 M113 85V128',metal,3)+rect(52,29,76,61,'url(#metal)',7,'#d3e0dc')+rect(57,33,66,56,'#303845',5)+circle(90,59,24,'#1f2834','#647180',1.5)+circle(90,59,16,'#343448')+path('M76 51q4-9 15-9','#8b859b',2)+text('IR RECEIVER',90,138,6,'#a6b8be');}
 if(id==='ir-transmitter'){return path('M74 89V127 M107 89V127',metal,3)+path('M53 88V50a37 37 0 0 1 74 0v38Z','#6a647e',1,'#4b455f')+rect(49,84,82,10,'#645c77',3)+path('M64 42q3-17 19-17','#b3a5bb',3)+text('IR EMITTER',90,138,6,'#a8afb8');}
 if(id==='gps-neo-6m'){return pcb(23,22,134,97,'#376b8c')+rect(45,30,93,49,'#d2bc93',3,'#ecd6af')+rect(55,36,72,37,'#c8a86f',2)+circle(91,55,5,'#dcd0b2')+rect(50,85,66,26,'url(#metal)',2)+text('NEO-6M',83,101,9,'#3c555e')+circle(140,96,6,gold)+circle(140,96,3,'#283e49')+header(51,118,4,false,25)+text('GPS',35,33,6);}
 throw new Error('No communication artwork: '+id);
}

