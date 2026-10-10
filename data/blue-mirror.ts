import type {SiteContent} from './content';
import type {Sculpture} from './sculptures';

const legacyDescription="Une sculpture miroir ARXYLVE. Les caractéristiques de cette pièce seront précisées avec ses photographies définitives.";
const description="Nitescence est une sculpture miroir bleue d’Alexy Mekerke, réalisée en un seul exemplaire. C’est son tout premier miroir réussi. La photographie présente l’œuvre originale.";
const imageAlt="Nitescence — sculpture miroir bleue originale d’Alexy Mekerke";

// Only replace the two original demonstration records. Owner-created works stay intact.
function isOriginalDemo(s:Sculpture){
 const original=s.slug==='ligne-deau'?{title:'Ligne d’Eau',label:'Limitée à 24 exemplaires',total:24}:s.slug==='faille-01'?{title:'Faille 01',label:'Limitée à 12 exemplaires',total:12}:null;
 return !!original&&s.title===original.title&&s.description===legacyDescription&&s.image==='/images/test.jpg'&&s.provisionalImage===true&&s.editionType==='limited-numbered'&&s.editionLabel===original.label&&s.totalEdition===original.total;
}

export function normalizeBlueMirrorContent(content:SiteContent):SiteContent{
 const mirror=content.sculptures.find(s=>s.slug==='ligne-deau');
 if(!mirror)return content;
 if(!isOriginalDemo(mirror)){
  if(mirror.editionType!=='unique'||!['Reflet d’Eau','Nitescence'].includes(mirror.title))return content;
  const aliases=[...new Set([...(mirror.previousSlugs??[]),...(content.sculptures.some(s=>s.slug==='faille-01')?[]:['faille-01'])])];
  const updated={...mirror,title:'Nitescence',previousSlugs:aliases,description:mirror.description===description.replaceAll('Nitescence','Reflet d’Eau')?description:mirror.description,imageAlt:mirror.imageAlt===imageAlt.replaceAll('Nitescence','Reflet d’Eau')?imageAlt:mirror.imageAlt};
  return {...content,sculptures:content.sculptures.map(s=>s===mirror?updated:s)};
 }
 const updated:Sculpture={...mirror,title:'Nitescence',previousSlugs:content.sculptures.some(s=>s.slug==='faille-01'&&!isOriginalDemo(s))?[]:['faille-01'],description,image:'/images/reflet-deau.jpg',imageAlt,provisionalImage:false,editionType:'unique',editionLabel:'Pièce unique',photos:mirror.photos?.filter(p=>!(p.src==='/images/test.jpg'&&p.alt.startsWith('Visuel provisoire — ')))};
 delete updated.totalEdition;delete updated.availableNumbers;delete updated.editionNames;
 return {...content,sculptures:content.sculptures.filter(s=>s.slug!=='faille-01'||!isOriginalDemo(s)).map(s=>s.slug===updated.slug?updated:s)};
}
