import type {ComponentDefinition} from '../types';

// Keep legacy board sides/project handles intact; expanded parts distribute pins
// over two sides and grow vertically so even a 100-lead IC remains connectable.
export function pinLayout(definition:ComponentDefinition){
 const board=definition.visual==='board',legacy=board&&!definition.pinLayout;
 const right=(i:number)=>legacy?i>=2&&i<16:i%2===1;
 const sideCount=[false,true].map(side=>definition.pins.filter((_,i)=>right(i)===side).length);
 const span=Math.max(board?250:85,(Math.max(...sideCount)+1)*16);
 const indices=[0,0];
 return {height:Math.max(board?338:165,span+65),pins:definition.pins.map((pin,i)=>{const isRight=right(i),side=isRight?1:0;return {pin,right:isRight,top:32+(++indices[side])/(sideCount[side]+1)*span};})};
}
