import {mkdir,writeFile} from 'node:fs/promises';
import {registry} from '../src/components/registry.ts';
import {expandedModels} from '../src/components/expandedCatalog.ts';
import {drawExpanded} from './artwork/expanded.mjs';
import {svg} from './artwork/primitives.mjs';
import {drawBoard} from './artwork/boards.mjs';
import {drawBasic} from './artwork/basics.mjs';
import {drawDisplay} from './artwork/displays.mjs';
import {drawMotor,drawPower} from './artwork/motors-power.mjs';
import {drawSensor} from './artwork/sensors.mjs';
import {drawCommunication} from './artwork/communications.mjs';
import {drawIC,drawOther} from './artwork/other.mjs';

// Original vector artwork. Shared geometry helpers represent physical families,
// while every catalog definition owns an explicit, independently addressable SVG.
const painters={Boards:drawBoard,Basic:drawBasic,Display:drawDisplay,Motors:drawMotor,Sensors:drawSensor,Communication:drawCommunication,Power:drawPower,IC:drawIC,Other:drawOther};
await mkdir('src/assets/components/catalog',{recursive:true});
for(const def of registry){
 const model=expandedModels[def.id];
 const painter=model?d=>drawExpanded(d,model):def.id==='photoresistor'?drawBasic:painters[def.category];
 if(!painter)throw new Error(`Missing artwork category: ${def.category}`);
 const content=svg(def,painter(def),{...(def.category==='Boards'?{width:220,height:280}:{}),family:model?.family||def.id});
 if(/NaN|undefined/.test(content))throw new Error(`Invalid SVG coordinates: ${def.id}`);
 await writeFile(`src/assets/components/catalog/${def.id}.svg`,content);
 if(['sg90-servo','standard-servo','toggle-switch','slide-switch'].includes(def.id)){
  await writeFile(`src/assets/components/catalog/${def.id}-base.svg`,svg(def,painter(def,true)));
 }
}
console.log(`Generated ${registry.length} original component SVG models.`);
