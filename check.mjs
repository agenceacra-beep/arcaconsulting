import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const root=path.resolve('dist');
const pages=(await fs.readdir(root)).filter(x=>x.endsWith('.html'));
let links=0;
for(const file of pages){const html=await fs.readFile(path.join(root,file),'utf8');assert.equal((html.match(/<h1[ >]/g)||[]).length,1,file+' needs one H1');assert(html.includes('id="main"'),file+' main landmark');assert(html.includes('name="description"'),file+' metadata');for(const m of html.matchAll(/(?:href|src)="([^"]+)"/g)){const target=m[1];if(/^(https?:|data:)/.test(target))continue;const [raw,anchor]=target.split('#');const clean=raw.split('?')[0];const dest=path.join(root,clean||file);await fs.access(dest);if(anchor){const referenced=await fs.readFile(dest,'utf8');assert(referenced.includes('id="'+anchor+'"'),file+' missing anchor '+target);}links++;}const res=await fetch('http://127.0.0.1:4173/'+file);assert.equal(res.status,200,file);}
const js=await fs.readFile(path.join(root,'assets/site.js'),'utf8');new vm.Script(js);assert(!/fetch\(|localStorage|sessionStorage/.test(js),'demo must not transmit/store');
const audit=await fs.readFile(path.join(root,'audit.html'),'utf8');const accounting=await fs.readFile(path.join(root,'expertise-comptable.html'),'utf8');assert(audit.includes('audit légal')&&audit.includes('contractuel'));assert(accounting.includes('Comptes annuels'));assert(audit.includes('?objet=Audit'));assert(accounting.includes('?objet=Expertise%20comptable'));
console.log(JSON.stringify({pages:pages.length,localLinksAndAssets:links,allRoutes200:true,uniqueH1:true,jsSyntax:true,distinctServiceContent:true,contextualBooking:true,noDemoStorageOrTransmission:true}));
