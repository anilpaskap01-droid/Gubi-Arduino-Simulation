import {chromium,expect} from '@playwright/test';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 for(const path of ['/studio','/projects','/examples']){
  const response=await page.goto((process.env.TEST_URL||'http://127.0.0.1:8787')+path);expect(response.status()).toBe(200);await expect(page.locator('.brand')).toContainText('GUBI');
  if(path==='/studio')await expect(page.getByRole('button',{name:/Start simulation/i})).toBeVisible();
  if(path==='/projects')await expect(page.getByRole('heading',{name:/My projects/})).toBeVisible();
  if(path==='/examples')await expect(page.getByRole('heading',{name:'Circuit examples'})).toBeVisible();
  const refresh=await page.reload();expect(refresh.status()).toBe(200);console.log('PASS direct navigation and refresh',path);
 }
 expect(errors).toEqual([]);console.log('PASS production browser runtime');
}finally{await browser.close();}
