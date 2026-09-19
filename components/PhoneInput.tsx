"use client";
import {LiquidSelect} from "./LiquidSelect";
import {CountryFlag} from "./CountryFlag";
import {useRef,useState,useEffect} from 'react';
import {type CountryCode} from 'libphonenumber-js/max';
import {phoneCountries as countries} from '../data/phone-countries';
import {useLanguage} from './LanguageProvider';
import {languageTag} from '../data/languages';
import {useCopy} from './SiteCopy';
import {normalizePhone} from '../lib/contact-input';
export function PhoneInput({label,placeholder,errorMessage}:{label:string;placeholder:string;errorMessage:string}){
 const {language}=useLanguage();const t=useCopy();const [names,setNames]=useState<Record<string,string>>({});
 useEffect(()=>{const frame=requestAnimationFrame(()=>{const display=new Intl.DisplayNames([languageTag[language]],{type:'region'});setNames(Object.fromEntries(countries.map(c=>[c.code,display.of(c.code)??c.name])))});return()=>cancelAnimationFrame(frame)},[language]);
 const [country,setCountry]=useState<CountryCode>('FR');const input=useRef<HTMLInputElement>(null);
 return <div className="field phone-field"><label htmlFor="contact-phone">{label}</label><div className="phone-controls"><LiquidSelect name="phoneCountry" searchable optionIcons={Object.fromEntries(countries.map(item=>[item.code,<CountryFlag key={item.code} country={item.code}/>]))} renderValue={<><CountryFlag country={country}/><span>+{countries.find(item=>item.code===country)?.dial}</span></>} aria-label={t("Phone.country","Pays et indicatif téléphonique")} value={country} onChange={event=>{setCountry(event.target.value as CountryCode);input.current?.setCustomValidity('')}}>{countries.map(item=><option key={item.code} value={item.code}>+{item.dial} · {names[item.code]??item.name}</option>)}</LiquidSelect><input ref={input} id="contact-phone" name="phone" type="tel" autoComplete="tel-national" placeholder={placeholder} required maxLength={40} onChange={e=>e.currentTarget.setCustomValidity('')} onBlur={e=>e.currentTarget.setCustomValidity(normalizePhone(e.currentTarget.value,country)?'':errorMessage)}/></div></div>
}
