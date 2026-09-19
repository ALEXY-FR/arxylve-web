import type {SiteContent} from '../data/content';

// Saving must complete before the authenticated session is revoked.
export async function saveAndSignOut(content:SiteContent|null,onSaved:(saved:SiteContent)=>void,request:typeof fetch=fetch){
 if(content){
  const response=await request('/api/admin/content',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(content)});
  const data=await response.json();
  if(!response.ok)throw Error(data.message||'Enregistrement impossible. Vos modifications sont conservées dans cette page.');
  onSaved(data);
 }
 const response=await request('/api/admin/session',{method:'DELETE'});
 if(!response.ok)throw Error('Les modifications sont enregistrées, mais la déconnexion a échoué. Cliquez de nouveau sur ARXYLVE.');
}
