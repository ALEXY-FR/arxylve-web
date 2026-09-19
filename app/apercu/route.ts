import {readFile} from 'node:fs/promises';
import path from 'node:path';

// A local development aid, never served by the published production site.
export async function GET(){
 if(process.env.NODE_ENV!=='development')return new Response('Not found',{status:404});
 const html=await readFile(path.join(process.cwd(),'scripts/device-preview.html'),'utf8');
 return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});
}
