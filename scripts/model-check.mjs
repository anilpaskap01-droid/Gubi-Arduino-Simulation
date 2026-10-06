import {chromium,expect} from '@playwright/test';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(process.env.TEST_URL||'http://localhost:5173');await page.getByRole('button',{name:'Explore Blink LED'}).click();
 const models=await page.evaluate(async()=>{const {registry}=await import('/src/components/registry.ts');return registry.map(d=>({id:d.id,name:d.name,category:d.category}));});
 // Parse every asset as XML in the browser, including the 64-dot matrix models.
 for(const m of models){const response=await page.request.get(new URL(`/src/assets/components/catalog/${m.id}.svg`,page.url()).href);expect(response.ok()).toBe(true);const source=await response.text();const valid=await page.evaluate(s=>!new DOMParser().parseFromString(s,'image/svg+xml').querySelector('parsererror'),source);expect(valid,`${m.id}: well-formed SVG`).toBe(true);}
 await page.getByRole('combobox',{name:'Category'}).selectOption('Display');
 await page.locator('.library-part').filter({hasText:'MAX7219 matrix'}).click();
 await page.getByRole('button',{name:'Circuit',exact:true}).click();await page.getByRole('button',{name:'Fit view',exact:true}).click();
 const matrix=page.locator('.react-flow__node').filter({hasText:'MAX7219 matrix'});await expect(matrix.locator('img')).toBeVisible();expect(await matrix.locator('img').evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
 await matrix.click();await expect(page.locator('.inspector-preview img')).toBeVisible();await page.screenshot({path:'docs/matrix-model.png'});
 await page.evaluate(models=>{document.querySelector('.app-shell').style.display='none';const gallery=document.createElement('main');gallery.style.cssText='padding:24px;background:#171e25;display:grid;grid-template-columns:repeat(8,1fr);gap:10px';for(const m of models){const card=document.createElement('figure');card.style.cssText='margin:0;padding:12px 6px;background:#222d35;border:1px solid #42505a;border-radius:5px;height:175px;text-align:center';const img=document.createElement('img');img.src=`/src/assets/components/catalog/${m.id}.svg`;img.alt=m.name;img.style.cssText='width:100%;height:125px;object-fit:contain';const caption=document.createElement('figcaption');caption.textContent=m.name;caption.style.cssText='font:11px Segoe UI;color:#dce5e6;padding-top:10px';card.append(img,caption);gallery.append(card);}document.body.append(gallery);},models);
 await expect.poll(()=>page.locator('main img').evaluateAll(imgs=>imgs.every(img=>img.complete&&img.naturalWidth>0))).toBe(true);
 await page.screenshot({path:'docs/component-models.png',fullPage:true});
 expect(errors).toEqual([]);console.log(`PASS ${models.length} SVG models parse and render; MAX7219 canvas and inspector verified.`);
}finally{await browser.close();}

