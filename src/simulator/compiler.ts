export async function compileSketch(code:string,signal?:AbortSignal):Promise<string>{
 return new Promise((resolve,reject)=>{
  const worker=new Worker(new URL('/avr/worker.js',location.origin),{type:'module'});
  const cleanup=()=>{clearTimeout(timeout);signal?.removeEventListener('abort',abort);worker.terminate();};
  const abort=()=>{cleanup();reject(new Error('Compilation cancelled'));};
  const timeout=setTimeout(()=>{cleanup();reject(new Error('Compilation timed out. Try again or upload compiled Intel HEX.'));},90000);
  signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted){abort();return;}
  worker.onmessage=e=>{cleanup();const {ok,result,error}=e.data;if(!ok){reject(new Error(error?.message||'Compilation failed'));return;}if(!result.fitsTarget){reject(new Error('Firmware exceeds Uno application flash budget'));return;}resolve(result.hex);};
  worker.onerror=e=>{cleanup();reject(new Error(e.message||'Compiler Worker failed'));};
  worker.postMessage({id:1,source:'#include <Arduino.h>\n'+code,sensors:[],assetsBase:new URL('/avr/',location.origin).href});
 });
}
