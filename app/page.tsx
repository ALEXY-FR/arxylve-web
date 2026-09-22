import {pageMetadata} from "../lib/seo";
export const metadata=pageMetadata("Sculptures miroir en résine et béton","ARXYLVE, sculptures miroir par Alexy Mekerke. Découvrez les œuvres en résine colorée et béton, les éditions disponibles et les créations sur mesure.","/");
import { HomeGallery } from "../components/HomeGallery";
export default function Home(){return <main id="contenu" className="home-gallery-page"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({"@context":"https://schema.org","@type":"WebSite",name:"ARXYLVE",url:"https://arxylve.com",publisher:{"@type":"Organization",name:"ARXYLVE",url:"https://arxylve.com",founder:{"@type":"Person",name:"Alexy Mekerke"}}})}}/><HomeGallery/></main>}
