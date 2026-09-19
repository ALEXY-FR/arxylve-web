import type {MetadataRoute} from 'next';
import {readContent} from '../lib/cms-store';
export const dynamic='force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const {sculptures}=await readContent();
 return ['','/collection','/sur-mesure','/a-propos',...sculptures.map(s=>'/collection/'+s.slug)].map(path=>({url:'https://arxylve.com'+path}));
}
