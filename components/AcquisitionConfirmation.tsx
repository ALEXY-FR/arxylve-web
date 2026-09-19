"use client";
import {useLanguage} from './LanguageProvider';
import {translate} from '../data/translations';
export function AcquisitionConfirmation({kind="acquisition"}:{kind?:"acquisition"|"custom"|"question"}){
 const {language}=useLanguage();const acquisition=kind==="acquisition";
 const lines=[
 acquisition?"Votre demande d’acquisition a bien été envoyée.":kind==="custom"?"Votre demande sur mesure a bien été envoyée.":"Votre demande de renseignement a bien été envoyée.",
 acquisition?"Les demandes sont traitées dans leur ordre d’arrivée, sous réserve de disponibilité.":"Les demandes sont traitées dans leur ordre d’arrivée.",
 acquisition?"Nous vous recontacterons pour confirmer la disponibilité et les modalités d’acquisition.":kind==="custom"?"Nous vous recontacterons pour échanger sur votre projet et préciser ensemble les dimensions, les matières et les modalités.":"Nous vous recontacterons pour répondre à vos questions sur cette œuvre.",
 acquisition?"Aucun paiement n’a été effectué et aucun exemplaire n’est réservé à ce stade.":"Aucun paiement n’a été effectué à ce stade."
 ];
 return <div className="notice acquisition-confirmation" role="status"><ul role="list">{lines.map(line=><li key={line}>{translate(line,language)}</li>)}</ul></div>;
}
