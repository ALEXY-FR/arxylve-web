export type AvailabilityStatus = "available" | "returning-soon" | "made-to-order" | "unavailable" | "production-ended" | "edition-complete" | "sold" | "exhibited";
export type EditionType = "limited-numbered" | "unique" | "continuous-series" | "made-to-order" | "prototype" | "exhibition-piece";
export type Sculpture = {slug:string;title:string;description:string;material:string;dimensions:string;image:string;imageAlt:string;photos?:{src:string;alt:string;format?:"original"|"square"|"vertical"|"horizontal"}[];videos?:{src:string;alt:string}[];provisionalImage?:boolean;price:number|null;status:AvailabilityStatus;editionType:EditionType;editionLabel:string;totalEdition?:number;editionNames?:Record<string,string>;availableNumbers?:number[]};
export const statusLabels:Record<AvailabilityStatus,string>={available:"Disponible", "returning-soon":"De retour prochainement", "made-to-order":"Sur commande",unavailable:"Indisponible","production-ended":"Production terminée","edition-complete":"Édition épuisée",sold:"Vendue",exhibited:"Exposée"};
export const sculptures:Sculpture[] = [
  {
    "slug": "ligne-deau",
    "title": "Ligne d’Eau",
    "description": "Une sculpture miroir ARXYLVE. Les caractéristiques de cette pièce seront précisées avec ses photographies définitives.",
    "material": "Matériau à préciser",
    "dimensions": "Dimensions sur demande",
    "image": "/images/test.jpg",
    "imageAlt": "Visuel provisoire — Ligne d’Eau",
    "provisionalImage": true,
    "price": 1240,
    "status": "available",
    "editionType": "limited-numbered",
    "editionLabel": "Limitée à 24 exemplaires",
    "totalEdition": 24,
    "availableNumbers": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      9,
      10,
      11,
      12,
      13,
      14,
      18,
      21,
      24
    ]
  },
  {
    "slug": "faille-01",
    "title": "Faille 01",
    "description": "Une sculpture miroir ARXYLVE. Les caractéristiques de cette pièce seront précisées avec ses photographies définitives.",
    "material": "Matériau à préciser",
    "dimensions": "Dimensions sur demande",
    "image": "/images/test.jpg",
    "imageAlt": "Visuel provisoire — Faille 01",
    "provisionalImage": true,
    "price": 980,
    "status": "available",
    "editionType": "limited-numbered",
    "editionLabel": "Limitée à 12 exemplaires",
    "totalEdition": 12,
    "availableNumbers": [
      1,
      2,
      3,
      4,
      5,
      6,
      8,
      10,
      12
    ]
  }
];
export const formatPrice=(value:number)=>new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(value);
export type Selection = {slug:string;number?:number};
export const selectionKey=(s:Selection)=>s.slug+":"+(s.number??"unique");
export function isSelectable(s:Sculpture,number?:number){return s.status==="available"&&s.price!==null&&(s.editionType!=="limited-numbered"?number===undefined:(number!==undefined&&!!s.availableNumbers?.includes(number)));}

export const editionName=(s:Sculpture,id:number)=>s.editionNames?.[String(id)]||String(id).padStart(2,'0');
