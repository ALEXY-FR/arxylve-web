"use client";
import {useMemo} from 'react';
import {useSite} from './SiteProvider';
import {useLanguage} from './LanguageProvider';
import {localizedText} from '../data/localized-content';
// Public translation is a view of the original CMS data; it is never persisted by this hook.
export function useLocalizedSite(){const site=useSite();const {language}=useLanguage();const original=site.content;
 const content=useMemo(()=>language==='fr'?original:{...original,texts:{...original.texts,...Object.fromEntries(Object.entries(original.texts).filter(([key])=>key!=='aboutPortrait').map(([key,value])=>[key,localizedText(original,language,'text:'+key,value)]))},sculptures:original.sculptures.map(s=>({...s,...Object.fromEntries((['title','description','material','dimensions','editionLabel','imageAlt'] as const).map(key=>[key,localizedText(original,language,'work:'+s.slug+':'+key,s[key])]))}))},[original,language]);
 return {...site,content};
}
