import {describe,it,expect} from 'vitest';
import {registry,definitions} from './registry';
import {expandedCatalog,expandedModels} from './expandedCatalog';
import {filterComponents} from './ComponentLibrary';
import {pinLayout} from '../circuit/pinLayout';
import {newProject,parseProject} from '../utils/project';

describe('expanded component catalog',()=>{
 it('adds over 500 distinct, documented models without claiming device emulation',()=>{
  expect(expandedCatalog.length).toBeGreaterThanOrEqual(500);
  expect(new Set(registry.map(d=>d.id)).size).toBe(registry.length);
  expect(Object.keys(expandedModels)).toHaveLength(expandedCatalog.length);
  for(const d of expandedCatalog){expect(expandedModels[d.id]).toBeDefined();expect(d.supportLevel).toBe('Experimental');expect(d.simulationHandler).toBe('none');expect(d.interactiveControls).toEqual([]);expect(d.pins.length).toBeGreaterThan(0);expect(new Set(d.pins.map(p=>p.id)).size).toBe(d.pins.length);}
 });
 it('round trips wiring to every new part, including high lead counts',()=>{
  for(const d of expandedCatalog){const p=newProject();p.components.push({id:'device',type:d.id,position:{x:500,y:100},rotation:90,properties:{...d.defaultProperties}});p.wires.push({id:'test',source:'uno',target:'device',sourceHandle:'D2',targetHandle:d.pins.at(-1)!.id,color:'#6cad8c'});expect(parseProject(JSON.stringify(p))).toEqual(p);}
 });
 it('keeps handles distinct and at least 16 pixels apart for dense parts',()=>{
  for(const d of registry){const layout=pinLayout(d);expect(layout.pins).toHaveLength(d.pins.length);for(const side of [false,true]){const handles=layout.pins.filter(p=>p.right===side);for(let i=1;i<handles.length;i++)expect(handles[i].top-handles[i-1].top).toBeGreaterThanOrEqual(15.999);for(const p of handles){expect(p.top).toBeGreaterThan(32);expect(p.top).toBeLessThan(layout.height-20);}}}
  expect(pinLayout(definitions['atmega2560-chip']).height).toBeGreaterThan(800);
 });
 it('searches interfaces and Turkish aliases with combined category/support filters',()=>{
  expect(filterComponents(registry,'i2c adc','IC','Experimental').some(d=>d.id==='ads1115-adc-module')).toBe(true);
  expect(filterComponents(registry,'matris','Display','All levels').some(d=>d.id==='max7219-matrix-4-in-1')).toBe(true);
  expect(filterComponents(registry,'sensör','All components','Experimental').length).toBeGreaterThan(100);
  expect(filterComponents(registry,'','All components','Full').map(d=>d.id)).toEqual(['arduino-uno-r3']);
  expect(filterComponents(registry,'nonsense-123','All components','All levels')).toEqual([]);
 });
});
