export function loadHex(hex:string):Uint16Array{
 const bytes=new Uint8Array(32768);let base=0,eof=false;
 for(const line of hex.trim().split(/\r?\n/)){if(!/^:[0-9a-f]+$/i.test(line)||line.length%2!==1)throw Error('Malformed Intel HEX');const r=Array.from({length:(line.length-1)/2},(_,i)=>parseInt(line.slice(1+i*2,3+i*2),16));if(r.length!==r[0]+5||r.reduce((a,b)=>a+b,0)%256)throw Error('HEX checksum mismatch');const [n,hi,lo,type]=r;const addr=base+(hi<<8)+lo;if(type===0){if(addr+n>bytes.length)throw Error('Firmware exceeds Uno flash');bytes.set(r.slice(4,4+n),addr);}else if(type===1)eof=true;else if(type===4)base=((r[4]<<8)|r[5])*65536;else if(type===2)base=((r[4]<<8)|r[5])*16;else throw Error('Unsupported HEX record');}
 if(!eof)throw Error('Missing HEX end record');return new Uint16Array(bytes.buffer);
}
