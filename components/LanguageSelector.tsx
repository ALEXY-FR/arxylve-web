"use client";
import {languages,type Language,languageCountries} from '../data/languages';
import {useLanguage} from './LanguageProvider';
import {LiquidSelect} from './LiquidSelect';
import {CountryFlag} from './CountryFlag';
export function LanguageSelector(){const {language,setLanguage}=useLanguage();return <div className="language-selector"><LiquidSelect aria-label="Language / Langue" value={language} onChange={e=>setLanguage(e.target.value as Language)} searchable optionIcons={Object.fromEntries(languages.map(l=>[l.code,<CountryFlag key={l.code} country={languageCountries[l.code]}/>]))} renderValue={<><CountryFlag country={languageCountries[language]}/><span>{languages.find(l=>l.code===language)?.short}</span></>}>{languages.map(l=><option key={l.code} value={l.code} lang={l.code}>{l.label}</option>)}</LiquidSelect></div>}
