"use client";
import {useCopy} from "./SiteCopy";
import Image from "next/image";
export function SocialLinks(){const t=useCopy();return <nav className="social-links" onPointerDown={e=>{if(e.pointerType!=="mouse"){const link=(e.target as Element).closest<HTMLElement>(".social-icon");if(link)link.dataset.pressed="true"}}} onPointerUp={e=>e.currentTarget.querySelectorAll<HTMLElement>("[data-pressed]").forEach(link=>delete link.dataset.pressed)} onPointerCancel={e=>e.currentTarget.querySelectorAll<HTMLElement>("[data-pressed]").forEach(link=>delete link.dataset.pressed)} onPointerLeave={e=>e.currentTarget.querySelectorAll<HTMLElement>("[data-pressed]").forEach(link=>delete link.dataset.pressed)} aria-label={t("SocialLinks.1","Réseaux sociaux")}><a href="https://www.instagram.com/arxylve/" target="_blank" rel="noopener noreferrer" className="social-icon" data-network="instagram" aria-label={t("SocialLinks.2","Instagram")} title={t("SocialLinks.3","Instagram")}><svg
                      viewBox="0 0 24 24" style={{stroke:"url(#instagram-spectrum)"}}
                      aria-hidden="true"
                    >
                      <defs><linearGradient id="instagram-spectrum" x1="0" y1="1" x2="1" y2="0"><stop stopColor="#ffdc80"/><stop offset=".3" stopColor="#fcaf45"/><stop offset=".55" stopColor="#f56040"/><stop offset=".75" stopColor="#c13584"/><stop offset="1" stopColor="#833ab4"/></linearGradient></defs><rect
                        x="3"
                        y="3"
                        width="18"
                        height="18"
                        rx="5"
                      />

                      <circle
                        cx="12"
                        cy="12"
                        r="4"
                      />

                      <circle
                        cx="17.5"
                        cy="6.5"
                        r="1"
                        className="iconFill"
                      />
                    </svg></a>
<a href="https://www.tiktok.com/@arxylve" target="_blank" rel="noopener noreferrer" className="social-icon" data-network="tiktok" aria-label={t("SocialLinks.4","TikTok")} title={t("SocialLinks.5","TikTok")}><svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        d="M14.5 3v11.2a4.8 4.8 0 1 1-4-4.7v3.1a1.9 1.9 0 1 0 1 1.7V3h3Z"
                        className="iconFill"
                      />

                      <path
                        d="M14.5 3c.5 2.7 2.1 4.4 5 4.9V11c-2.1-.1-3.7-.8-5-1.8"
                        className="iconFill"
                      />
                    </svg></a>
<a href="https://www.rednote.com/user/profile/6a845891000000000301ca65?tab=note&subTab=note" target="_blank" rel="noopener noreferrer" className="social-icon" data-network="rednote" aria-label={t("SocialLinks.6","RedNote")} title={t("SocialLinks.7","RedNote")}><Image
                      className="rednoteLogo"
                      src="/social-logos/rednote.svg"
                      alt=""
                      width={30}
                      height={30}
                    /></a>
<a href="https://www.linkedin.com/in/alexymekerke/" target="_blank" rel="noopener noreferrer" className="social-icon" data-network="linkedin" aria-label={t("SocialLinks.8","LinkedIn")} title={t("SocialLinks.9","LinkedIn")}><svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <rect
                        x="4"
                        y="9"
                        width="3"
                        height="11"
                        rx="0.5"
                        className="iconFill"
                      />

                      <circle
                        cx="5.5"
                        cy="5.5"
                        r="1.7"
                        className="iconFill"
                      />

                      <path
                        d="M11 20V9h3v1.8c1-1.4 2.3-2.1 4-2.1 3 0 4.5 2 4.5 5.3v6h-3v-5.5c0-2-.8-3.1-2.4-3.1-1.9 0-3.1 1.3-3.1 3.8V20Z"
                        className="iconFill"
                      />
                    </svg></a>
<a href="https://www.artsy.net/collector-profile/my-collection" target="_blank" rel="noopener noreferrer" className="social-icon" data-network="artsy" aria-label={t("SocialLinks.10","Artsy")} title={t("SocialLinks.11","Artsy")}><Image
                      className="artsyLogo"
                      src="/social-logos/artsy.svg"
                      alt=""
                      width={28}
                      height={28}
                    /></a>
<a href="https://fr.pinterest.com/Arxylve/" target="_blank" rel="noopener noreferrer" className="social-icon" data-network="pinterest" aria-label={t("SocialLinks.12","Pinterest")} title={t("SocialLinks.13","Pinterest")}><svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        className="iconFill"
                        d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.406.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.781c0-1.669.967-2.915 2.171-2.915 1.024 0 1.518.769 1.518 1.69 0 1.03-.655 2.569-.994 3.996-.283 1.195.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.872-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.208 0 1.031.397 2.137.893 2.739.098.119.112.223.083.344-.091.378-.293 1.194-.333 1.36-.053.219-.174.265-.402.159-1.499-.698-2.436-2.888-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.966 7.398 6.931 0 4.135-2.608 7.46-6.224 7.46-1.216 0-2.36-.632-2.751-1.378 0 0-.602 2.291-.748 2.853-.27 1.038-1.002 2.337-1.492 3.13 1.122.347 2.304.535 3.53.535C18.627 24 24 18.627 24 12S18.627 0 12 0Z"
                      />
                    </svg></a>
<a href="https://www.cosmos.so/arxylve/collections" target="_blank" rel="noopener noreferrer" className="social-icon" data-network="cosmos" aria-label={t("SocialLinks.14","Cosmos")} title={t("SocialLinks.15","Cosmos")}><svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        cx="12"
                        cy="4.5"
                        r="2"
                        className="iconFill"
                      />

                      <circle
                        cx="18.5"
                        cy="8.25"
                        r="2"
                        className="iconFill"
                      />

                      <circle
                        cx="18.5"
                        cy="15.75"
                        r="2"
                        className="iconFill"
                      />

                      <circle
                        cx="12"
                        cy="19.5"
                        r="2"
                        className="iconFill"
                      />

                      <circle
                        cx="5.5"
                        cy="15.75"
                        r="2"
                        className="iconFill"
                      />

                      <circle
                        cx="5.5"
                        cy="8.25"
                        r="2"
                        className="iconFill"
                      />
                    </svg></a><a href="https://open.spotify.com/user/w23gtr5oci17fh38w8s87won1" target="_blank" rel="noopener noreferrer" className="social-icon" data-network="spotify" aria-label={t("SocialLinks.16","Spotify")} title={t("SocialLinks.17","Spotify")}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" className="iconFill"/><g stroke="#07140c" strokeWidth="1.6" fill="none"><path d="M6.4 9.1c3.8-1.2 7.5-.8 11.2 1M7.2 12.2c3.1-.9 6.3-.6 9.5.9M8 15.2c2.6-.7 5.1-.4 7.6.7"/></g></svg></a></nav>}
