"use client";
import {useEffect} from "react";
export function GlassCursor(){useEffect(()=>{const colors=["bourgogne","pourpre","foret","marine"];const color=colors[Math.floor(Math.random()*colors.length)];document.documentElement.style.setProperty("--glass-cursor",`url('/cursor-${color}.svg')`);return()=>{document.documentElement.style.removeProperty("--glass-cursor")}},[]);return null}
