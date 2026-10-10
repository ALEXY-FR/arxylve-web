export type AvailabilityStatus = "available" | "returning-soon" | "made-to-order" | "unavailable" | "production-ended" | "edition-complete" | "sold" | "exhibited";
export type EditionType = "limited-numbered" | "unique" | "continuous-series" | "made-to-order" | "prototype" | "exhibition-piece";
export type Sculpture = {slug:string;title:string;description:string;material:string;dimensions:string;image:string;imageAlt:string;photos?:{src:string;alt:string;format?:"original"|"square"|"vertical"|"horizontal"}[];videos?:{src:string;alt:string}[];provisionalImage?:boolean;price:number|null;status:AvailabilityStatus;editionType:EditionType;editionLabel:string;totalEdition?:number;editionNames?:Record<string,string>;availableNumbers?:number[]};
export const statusLabels:Record<AvailabilityStatus,string>={available:"Disponible", "returning-soon":"De retour prochainement", "made-to-order":"Sur commande",unavailable:"Indisponible","production-ended":"Production terminée","edition-complete":"Édition épuisée",sold:"Vendue",exhibited:"Exposée"};
export const sculptures:Sculpture[] = [
  {
    "slug": "ligne-deau",
    "title": "Reflet d’Eau",
    "description": "Reflet d’Eau est une sculpture miroir bleue d’Alexy Mekerke, réalisée en un seul exemplaire. C’est son tout premier miroir réussi. La photographie présente l’œuvre originale.",
    "material": "Matériau à préciser",
    "dimensions": "Dimensions sur demande",
    "image": "/images/reflet-deau.jpg",
    "imageAlt": "Reflet d’Eau — sculpture miroir bleue originale d’Alexy Mekerke",
    "provisionalImage": false,
    "price": 1240,
    "status": "available",
    "editionType": "unique",
    "editionLabel": "Pièce unique"
  }
];
export const formatPrice=(value:number)=>new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(value);
export type Selection = {slug:string;number?:number};
export const selectionKey=(s:Selection)=>s.slug+":"+(s.number??"unique");
export function isSelectable(s:Sculpture,number?:number){return s.status==="available"&&s.price!==null&&(s.editionType!=="limited-numbered"?number===undefined:(number!==undefined&&!!s.availableNumbers?.includes(number)));}

export const editionName=(s:Sculpture,id:number)=>s.editionNames?.[String(id)]||String(id).padStart(2,'0');
