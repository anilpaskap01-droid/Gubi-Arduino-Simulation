import { cp, mkdir } from 'node:fs/promises';
await mkdir('public/avr',{recursive:true});
for(const dir of ['tools','assets']) await cp(`node_modules/@horang-corp/avr-gcc-wasm/${dir}`,`public/avr/${dir}`,{recursive:true});
for(const file of ['index.js','worker.js','firmware-builder.js','THIRD_PARTY_NOTICES.md']) await cp(`node_modules/@horang-corp/avr-gcc-wasm/${file}`,`public/avr/${file}`);
