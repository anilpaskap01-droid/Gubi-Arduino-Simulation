import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {renderToStaticMarkup} from 'react-dom/server';
import {registry,definitions} from './registry';
import {componentArtwork} from './artwork';
import {PartVisual} from '../circuit/PartVisual';

describe('component models',()=>{
 it('covers all catalog parts with dedicated SVGs and no generic fallback',()=>{
  for(const d of registry){
   expect(componentArtwork(d)).toContain(`/catalog/${d.id}.svg`);
   const model=readFileSync(new URL(`../assets/components/catalog/${d.id}.svg`,import.meta.url),'utf8');
   expect(model).toContain(`data-component="${d.id}"`);
   const html=renderToStaticMarkup(<PartVisual part={{id:d.id,type:d.id,position:{x:0,y:0},rotation:0,properties:d.defaultProperties}}/>);
   expect(html.length).toBeGreaterThan(100);
   expect(html).not.toContain('/module.svg');
  }
 });
 it('draws 64 physical pixels for each matrix variant',()=>{
  for(const id of ['dot-matrix-8x8','max7219-matrix']){
   const model=readFileSync(new URL(`../assets/components/catalog/${id}.svg`,import.meta.url),'utf8');
   expect(model.match(/r="3.7"/g)).toHaveLength(64);
  }
 });
 it('keeps visual models separate from unimplemented device simulation',()=>{
  for(const id of ['max7219-matrix','lcd-16x2','dht11','neopixel'])expect(definitions[id].supportLevel).toBe('Experimental');
 });
});
