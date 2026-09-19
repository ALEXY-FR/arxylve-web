"use client";
import {usePathname} from 'next/navigation';
import {useSite} from './SiteProvider';
import {useLanguage} from './LanguageProvider';
import {localizedText} from '../data/localized-content';
export function copyScope(path:string){return path.startsWith('/collection/')?'artwork':path==='/'?'home':path.slice(1)}
export function copyKey(path:string,id:string){return (id.startsWith('Header.')||id.startsWith('Shared.')||id.startsWith('status.')?'global':id.startsWith('NotFoundPage.')?'404':copyScope(path))+':'+id}
export function useCopy(){const {content}=useSite(),path=usePathname(),{language}=useLanguage();return (id:string,fallback:string)=>{const key=copyKey(path,id),source=content.copy?.[key]??fallback;return content.translations?.[language]?.[key]?localizedText(content,language,key,source):content.copy?.[language+':'+key]??localizedText(content,language,key,source)}}
export function SiteCopy({id,fallback}:{id:string;fallback:string}){const t=useCopy(),path=usePathname(),{preview}=useSite();return <span className="site-copy" data-copy-key={preview?copyKey(path,id):undefined}>{t(id,fallback)}</span>}
