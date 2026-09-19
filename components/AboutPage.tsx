"use client";
import {useLocalizedSite as useSite} from "./useLocalizedSite";
import {FreeText} from "./FreeText";
import {AboutSlideshow} from "./AboutSlideshow";
import { SocialLinks } from "./SocialLinks";
export function AboutPage(){const {content}=useSite();const {texts,aboutPhotos}=content;return <main id="contenu"><section className="section split-page"><div className="about-copy"><FreeText content={content} page="a-propos"/><SocialLinks/></div><AboutSlideshow photos={[{src:texts.aboutPortrait,alt:"Portrait d’Alexy Mekerke"},...(aboutPhotos??[])]}/></section></main>}
