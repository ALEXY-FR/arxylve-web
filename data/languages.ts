export const languages = [
 {code:'fr',label:'Français',short:'FR'}, {code:'en',label:'English',short:'EN'},
 {code:'zh',label:'中文（简体）',short:'中文'}, {code:'es',label:'Español',short:'ES'},
 {code:'pt',label:'Português',short:'PT'}, {code:'de',label:'Deutsch',short:'DE'},
 {code:'it',label:'Italiano',short:'IT'}, {code:'ja',label:'日本語',short:'日本語'},
 {code:'nl',label:'Nederlands',short:'NL'}, {code:'pl',label:'Polski',short:'PL'},
 {code:'ro',label:'Română',short:'RO'}, {code:'sv',label:'Svenska',short:'SV'},
 {code:'da',label:'Dansk',short:'DA'}, {code:'fi',label:'Suomi',short:'FI'},
 {code:'el',label:'Ελληνικά',short:'EL'}, {code:'cs',label:'Čeština',short:'CS'},
 {code:'hu',label:'Magyar',short:'HU'}, {code:'sk',label:'Slovenčina',short:'SK'},
 {code:'bg',label:'Български',short:'BG'}, {code:'hr',label:'Hrvatski',short:'HR'},
 {code:'sl',label:'Slovenščina',short:'SL'}, {code:'et',label:'Eesti',short:'ET'},
 {code:'lv',label:'Latviešu',short:'LV'}, {code:'lt',label:'Lietuvių',short:'LT'},
 {code:'mt',label:'Malti',short:'MT'}, {code:'ga',label:'Gaeilge',short:'GA'},
 {code:'nb',label:'Norsk bokmål',short:'NO'}, {code:'is',label:'Íslenska',short:'IS'},
 {code:'uk',label:'Українська',short:'UK'}, {code:'ru',label:'Русский',short:'RU'},
 {code:'tr',label:'Türkçe',short:'TR'}, {code:'sq',label:'Shqip',short:'SQ'},
 {code:'sr',label:'Srpski',short:'SR'}, {code:'bs',label:'Bosanski',short:'BS'},
 {code:'mk',label:'Македонски',short:'MK'}, {code:'cnr',label:'Crnogorski',short:'ME'},
] as const;
export type Language=typeof languages[number]['code'];
export const languageTag=Object.fromEntries(languages.map(({code})=>[code,code==='zh'?'zh-Hans':code==='sr'?'sr-Latn':code==='cnr'?'sr-Latn-ME':code])) as Record<Language,string>;
export function parseLanguage(value:string|undefined|null):Language|null{const tag=value?.toLowerCase().replaceAll('_','-');if(tag==='sr-latn-me')return 'cnr';let base=tag?.split('-')[0];if(base==='no')base='nb';return languages.some(l=>l.code===base)?base as Language:null}
export function preferredLanguage(header:string|null):Language{
 if(!header)return 'fr';
 const ranked=header.split(',').map(part=>{const [tag,quality]=part.trim().split(';');return {tag,q:quality?.startsWith('q=')?Number(quality.slice(2)):1}}).filter(x=>x.q>0).sort((a,b)=>b.q-a.q);
 for(const {tag} of ranked){const language=parseLanguage(tag);if(language)return language}return 'en';
}
export const languageCountries:Record<Language,string>={fr:'FR',en:'GB',zh:'CN',es:'ES',pt:'PT',de:'DE',it:'IT',ja:'JP',nl:'NL',pl:'PL',ro:'RO',sv:'SE',da:'DK',fi:'FI',el:'GR',cs:'CZ',hu:'HU',sk:'SK',bg:'BG',hr:'HR',sl:'SI',et:'EE',lv:'LV',lt:'LT',mt:'MT',ga:'IE',nb:'NO',is:'IS',uk:'UA',ru:'RU',tr:'TR',sq:'AL',sr:'RS',bs:'BA',mk:'MK',cnr:'ME'};
