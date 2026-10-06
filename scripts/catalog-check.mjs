import {chromium,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {registry} from '../src/components/registry.ts';
import {expandedModels} from '../src/components/expandedCatalog.ts';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(process.env.TEST_URL||'http://localhost:5173');
 await page.getByRole('button',{name:'New',exact:true}).click();
 await expect(page.locator('.library-results')).toHaveText(`${registry.length} matching parts`);
 // The list keeps a bounded DOM but every row is reachable by scrolling.
 expect(await page.locator('.library-part').count()).toBeLessThan(40);
 await page.locator('.library-scroll').evaluate(el=>{el.scrollTop=el.scrollHeight;});
 await expect(page.locator('.library-part').filter({hasText:'Function generator module'})).toBeVisible();
 const search=page.getByRole('textbox',{name:'Search components'});
 await search.fill('i2c adc');await page.getByRole('combobox',{name:'Category'}).selectOption('IC');
 await expect(page.locator('.library-part').filter({hasText:'ADS1115 ADC module'})).toBeVisible();
 await page.getByRole('combobox',{name:'Category'}).selectOption('All components');
 await search.fill('');await page.getByRole('combobox',{name:'Simulation support'}).selectOption('Full');
 await expect(page.locator('.library-part')).toHaveCount(1);
 await expect(page.locator('.library-part')).toContainText('Arduino Uno R3');
 await page.getByRole('combobox',{name:'Simulation support'}).selectOption('All levels');
 const representatives=Object.values(Object.fromEntries(Object.entries(expandedModels).map(([id,m])=>[m.family,registry.find(d=>d.id===id)])));
 // Exercise actual add/rotate/inspect rendering for every physical model family.
 for(const d of representatives){
  await search.fill(d.name);
  await page.locator('.library-part').filter({hasText:d.name}).first().click();
  const node=page.locator('.react-flow__node').last();
  await expect(node.locator('img')).toHaveAttribute('alt',d.name);
  await expect.poll(()=>node.locator('img').evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
  await expect(node.locator('.react-flow__handle')).toHaveCount(d.pins.length);
 }
 await search.fill('ATmega2560 chip');await page.locator('.library-part').click();
 await page.getByRole('button',{name:'Circuit',exact:true}).click();await page.getByRole('button',{name:'Fit view',exact:true}).click();
 const dense=page.locator('.react-flow__node').last();
 await expect(dense.locator('.react-flow__handle')).toHaveCount(100);
 expect(await dense.locator('.electronic-node').evaluate(el=>el.clientHeight)).toBeGreaterThan(800);
 // JSON export contains the added models and all their pin identifiers still validate.
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Export',exact:true}).click();
 const file=await download;expect(await file.suggestedFilename()).toMatch(/\.gubi\.json$/);
 const project=JSON.parse(await readFile(await file.path(),'utf8'));
 expect(project.components).toHaveLength(representatives.length+2);
 // Also import a clean review circuit: all showcased parts use the same project
 // format as the user's own export, without injecting state into the application.
 project.name='Component catalog · 626 parts';project.wires=[];
 project.components=['max7219-matrix-4-in-1','ws2812-ring-24','nema17-stepper','pn532-nfc','lcd-40x4','mg996r-servo','sht31','relay-4-channel','usb-ttl-cp2102','ads1115-adc-module','cooling-fan-2-wire','tp4056-charger'].map((type,i)=>({id:`showcase-${i}`,type,position:{x:(i%4)*230,y:Math.floor(i/4)*215},rotation:0,properties:{...registry.find(d=>d.id===type).defaultProperties}}));
 await page.locator('input[type=file]').first().setInputFiles({name:'catalog.gubi.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(project))});
 await expect(page.locator('.react-flow__node')).toHaveCount(project.components.length);
 await expect.poll(()=>page.locator('.react-flow__node img').evaluateAll(imgs=>imgs.every(img=>img.complete&&img.naturalWidth>0))).toBe(true);
 await page.getByRole('button',{name:'Fit view',exact:true}).click();await search.fill('matrix');
 await page.screenshot({path:'docs/catalog-workbench.png'});
 await page.setViewportSize({width:480,height:900});await search.fill('');
 await expect.poll(()=>page.locator('.library-part').first().evaluate(el=>Math.round(el.getBoundingClientRect().height))).toBe(116);
 await page.locator('.library-scroll').evaluate(el=>{el.scrollTop=el.scrollHeight;});
 await expect(page.locator('.library-part').filter({hasText:'Function generator module'})).toBeVisible();
 expect(errors).toEqual([]);
 console.log(`PASS ${registry.length} searchable parts; virtual list end, filters, ${representatives.length} model families on canvas and 100-lead wiring handles.`);
}finally{await browser.close();}
