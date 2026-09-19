import type {SiteContent} from './content';
import {languages,type Language} from './languages';
import {translate} from './translations';

export function localizedText(content:SiteContent,language:Language,key:string,source:string){
 if(language==='fr')return source;
 const entry=content.translations?.[language]?.[key];
 // A French edit invalidates the old translation until the owner reviews it.
 return entry?.source===source&&entry.value.trim()?entry.value:translate(source,language);
}

export function validateTranslations(value:SiteContent['translations']){
 if(value===undefined)return;
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length>languages.length)throw Error('Traductions invalides.');
 for(const [language,entries] of Object.entries(value)){
  if(!languages.some(l=>l.code===language)||!entries||typeof entries!=='object'||Array.isArray(entries)||Object.keys(entries).length>4000)throw Error('Langue ou champs de traduction invalides.');
  for(const [key,entry] of Object.entries(entries))if(key.length>240||!entry||typeof entry!=='object'||typeof entry.source!=='string'||typeof entry.value!=='string'||entry.source.length>20000||entry.value.length>20000)throw Error('Texte traduit invalide.');
 }
}
