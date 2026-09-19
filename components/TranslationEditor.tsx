"use client";
import {useState} from 'react';
import type {SiteContent} from '../data/content';
import {languages,type Language} from '../data/languages';
import {localizedText} from '../data/localized-content';
import {LiquidSelect} from './LiquidSelect';

export type TranslationField={key:string;label:string;source:string};
export function TranslationEditor({content,fields,onChange,busy}:{content:SiteContent;fields:TranslationField[];onChange:(next:SiteContent)=>void;busy:boolean}){
 const [language,setLanguage]=useState<Language>('en');
 const [selected,setSelected]=useState('');
 const field=fields.find(f=>f.key===selected)??fields[0];
 const entry=field?content.translations?.[language]?.[field.key]:undefined;
 function write(value:string){if(!field)return;onChange({...content,translations:{...content.translations,[language]:{...content.translations?.[language],[field.key]:{source:field.source,value}}}})}
 return <details className="translation-editor"><summary>Traductions de cette page</summary><fieldset disabled={busy}>
 <p>Choisissez une langue et un texte, puis collez sa traduction. Cliquez ensuite sur ARXYLVE pour enregistrer. Le texte français reste votre référence.</p>
 <label>Langue de traduction<LiquidSelect value={language} onChange={e=>setLanguage(e.target.value as Language)}>{languages.filter(l=>l.code!=='fr').map(l=><option key={l.code} value={l.code}>{l.label}</option>)}</LiquidSelect></label>
 {field?<><label>Texte à traduire<LiquidSelect value={field.key} onChange={e=>setSelected(e.target.value)}>{fields.map(f=><option value={f.key} key={f.key}>{f.label}</option>)}</LiquidSelect></label>
 <label>Texte français<textarea readOnly rows={4} value={field.source}/></label>
 <label>Traduction à coller<textarea lang={language} rows={5} value={entry?.value??localizedText(content,language,field.key,field.source)} onChange={e=>write(e.target.value)}/></label>
 {entry&&entry.source!==field.source?<><p role="status">Le français a changé. Cette ancienne traduction n’est plus affichée sur le site. Corrigez-la ou confirmez qu’elle convient toujours.</p><button className="button" type="button" onClick={()=>write(entry.value)}>Valider cette traduction</button></>:<p>{entry?.value.trim()?'Traduction personnalisée.':localizedText(content,language,field.key,field.source)===field.source?'À traduire : le français est affiché en attendant.':'Traduction existante, que vous pouvez remplacer.'}</p>}
 {entry&&<button className="button" type="button" onClick={()=>{const entries={...content.translations?.[language]};delete entries[field.key];onChange({...content,translations:{...content.translations,[language]:entries}})}}>Rétablir la traduction initiale</button>}
 </>:<p>Aucun texte à traduire dans cette page.</p>}
 </fieldset></details>;
}
