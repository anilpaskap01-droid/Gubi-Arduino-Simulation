export async function compileSketch(code:string):Promise<string>{
 const url=new URL('/avr/index.js',location.origin).href;
 const compiler=await import(/* @vite-ignore */ url);
 const result=await compiler.compile({source:'#include <Arduino.h>\n'+code,assetsBase:new URL('/avr/',location.origin).href});
 if(!result.fitsTarget)throw Error('Firmware exceeds Uno application flash budget');
 return result.hex;
}
