"use client";
import {FreeText} from "./FreeText";
import {SiteCopy} from "./SiteCopy";
import {useLocalizedSite as useSite} from "./useLocalizedSite";
import {RequestExamples} from "./RequestExamples";
import {InquiryForm} from "./InquiryForm";
export function CustomPage({artworkSlug}:{artworkSlug?:string}){const {content}=useSite();const {sculptures,texts}=content;const artwork=sculptures.find(s=>s.slug===artworkSlug);return <main id="contenu" className="section split-page"><div><FreeText content={content} page="sur-mesure" title={artwork?<><SiteCopy id="CustomPage.1" fallback="À propos de"/><br/><em>{artwork.title}<SiteCopy id="CustomPage.2" fallback="."/></em></>:undefined}/><RequestExamples title={texts.exampleTitle} phrases={texts.examplePhrases}/></div><InquiryForm artworkTitle={artwork?.title}/></main>}
