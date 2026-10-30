"use client";
import {createContext,useContext,type ReactNode} from 'react';
import type {Language} from '../data/languages';
const Context=createContext<{language:Language;setLanguage:(language:Language)=>void}>({language:'fr',setLanguage:()=>{}});
export const useLanguage=()=>useContext(Context);
export function LanguageProvider({children}:{initial:Language;children:ReactNode}){return <Context.Provider value={{language:'fr',setLanguage:()=>{}}}>{children}</Context.Provider>}
