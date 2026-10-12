import {glassVertex, glassFragment} from './glass-shaders';

const surfaces = [
  '.preloader-disc','.preloader-disc-wordmark','.desktop-nav','.desktop-nav a','.brand-button',
  '.button','.cart-link','.admin-shortcut','.liquid-select-trigger','.liquid-select-panel',
  '.social-icon','.social-label','.fitted-object','.fitted-artwork-frame','.masonry-inner',
  '.masonry-card','.catalog-card','.mobile-work-card','.mobile-work-info','.tablet-photo-frame',
  '.tablet-artwork-info','.side-photo-frame','.satellite-photo','.hover-artwork-info',
  '.artwork-details-panel','.artwork-facts','.artwork-photo-tray','.request-examples','.cart-total',
  '.notice','.request-card','.not-found-panel','.lost-reflection span','.drag-grip','.auto-format-label',
  '.portrait','.artwork-image','.artwork-index','.availability','.image-note','.catalog-empty',
  '.slideshow-controls button','.admin-work','.admin-texts','.admin-login','.admin-command-bar',
  '.admin-main-nav','.admin-main-nav button','.admin-work-tab','.visual-inspector','.visual-preview',
  '.field input','.field textarea','.phone-controls input','.phone-controls select',
  '.liquid-select-search','.admin-page input','.admin-page textarea',
  '.split-page>form','.cart-layout>div:last-child','.material-band>div','.custom-callout',
].join(',');

type Surface = {host:HTMLElement;canvas:HTMLCanvasElement;context:CanvasRenderingContext2D;kind:'surface'|'disc'|'text';native:boolean;position:string;lastImage:number};
const loadImage = (url:string) => new Promise<HTMLImageElement>((resolve,reject) => {const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=url;});

/** One shared GPU context avoids the mobile WebGL-context limit across a whole site. */
export async function mountSiteGlass() {
  const gpu=document.createElement('canvas');
  const contextGL=gpu.getContext('webgl2',{alpha:true,premultipliedAlpha:false,preserveDrawingBuffer:true,antialias:false});
  if(!contextGL){document.documentElement.dataset.liquidEngine='fallback';return ()=>{};}
  const gl=contextGL;
  const shader=(type:number,source:string)=>{const result=gl.createShader(type)!;gl.shaderSource(result,source);gl.compileShader(result);if(!gl.getShaderParameter(result,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(result)||'Glass shader failed');return result;};
  const vertex=shader(gl.VERTEX_SHADER,glassVertex),fragment=shader(gl.FRAGMENT_SHADER,glassFragment),program=gl.createProgram()!;
  gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program)||'Glass program failed');
  gl.useProgram(program);
  const uniforms:Record<string,WebGLUniformLocation>={};
  for(let i=0;i<gl.getProgramParameter(program,gl.ACTIVE_UNIFORMS);i++){const name=gl.getActiveUniform(program,i)!.name;uniforms[name]=gl.getUniformLocation(program,name)!;}
  const positions=gl.createBuffer()!,uvs=gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER,positions);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const position=gl.getAttribLocation(program,'a_position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ARRAY_BUFFER,uvs);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([0,1,1,1,0,0,1,0]),gl.STATIC_DRAW);
  const uv=gl.getAttribLocation(program,'a_texcoord');gl.enableVertexAttribArray(uv);gl.vertexAttribPointer(uv,2,gl.FLOAT,false,0,0);
  const texture=()=>{const t=gl.createTexture()!;gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t;};
  const backdropTexture=texture(),discTexture=texture(),textTexture=texture(),circleTexture=texture(),textCoverageTexture=texture(),circleCoverageTexture=texture(),emptyMask=texture();
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0,0,0,255]));
  const [icon,textMask,circleMask,textCoverage,circleCoverage]=await Promise.all([loadImage('/images/liquid/disc-pattern.svg'),loadImage('/images/liquid/wordmark-mask.png'),loadImage('/images/liquid/disc-mask.png'),loadImage('/images/liquid/wordmark-coverage.png'),loadImage('/images/liquid/disc-coverage.png')]);
  for(const [target,image] of [[textTexture,textMask],[circleTexture,circleMask],[textCoverageTexture,textCoverage],[circleCoverageTexture,circleCoverage]] as const){gl.bindTexture(gl.TEXTURE_2D,target);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);}
  const background=document.createElement('canvas'),backgroundContext=background.getContext('2d')!;
  const discBackground=document.createElement('canvas');discBackground.width=256;discBackground.height=256;const discContext=discBackground.getContext('2d')!;
  const records=new Map<HTMLElement,Surface>(),motion=matchMedia('(prefers-reduced-motion: reduce)');
  let disposed=false,frame=0,last=0,scanFrame=0,backgroundScale=1;
  function remove(record:Surface){record.canvas.remove();record.canvas.width=record.canvas.height=0;record.host.style.position=record.position;record.host.style.removeProperty('--liquid-image');delete record.host.dataset.resourceGlass;delete record.host.dataset.liquidReady;records.delete(record.host);}
  function scan(){
    scanFrame=0;
    const adminView=location.pathname==='/admin'||location.pathname.startsWith('/admin/');
    const keepGlass=(host:HTMLElement)=>adminView||host.matches('.preloader-disc,.preloader-disc-wordmark,.brand-button');
    for(const record of records.values()){
      if(!record.host.isConnected||!keepGlass(record.host))remove(record);
      else if(!record.native&&record.canvas.parentElement!==record.host)record.host.appendChild(record.canvas);
    }
    const candidates=new Set<HTMLElement>(document.querySelectorAll<HTMLElement>(surfaces));
    // Retain the original public styles; enhance all administration surfaces and portals.
    for(const element of adminView?document.querySelectorAll<HTMLElement>('main *,header *,aside *,dialog *'):[]){
      if(!(element instanceof HTMLElement)||element.dataset.resourceGlass||element.classList.contains('resource-glass-canvas'))continue;
      if(element.closest('.site-preloader'))continue;
      const style=getComputedStyle(element);if((style.backdropFilter&&style.backdropFilter!=='none')||(style.boxShadow!=='none'&&style.backgroundImage!=='none'&&parseFloat(style.borderTopLeftRadius)>=6))candidates.add(element);
    }
    for(const host of candidates){
      if(!keepGlass(host)||records.has(host)||host.matches('input[type=checkbox],input[type=radio],input[type=hidden],.liquid-select-native'))continue;
      const canvas=document.createElement('canvas'),context=canvas.getContext('2d');if(!context)continue;
      const native=host.matches('input,textarea,select');const style=getComputedStyle(host),position=host.style.position;
      if(!native&&style.position==='static')host.style.position='relative';
      const kind=host.classList.contains('preloader-disc')?'disc':host.classList.contains('preloader-disc-wordmark')?'text':'surface';
      canvas.className='resource-glass-canvas';canvas.setAttribute('aria-hidden','true');canvas.setAttribute('data-html2canvas-ignore','true');
      if(!native)host.appendChild(canvas);
      host.dataset.resourceGlass=kind;records.set(host,{host,canvas,context,kind,native,position,lastImage:0});
    }
    document.documentElement.dataset.liquidTargets=String(records.size);
  }
  const queueScan=()=>{if(!scanFrame&&!disposed)scanFrame=requestAnimationFrame(scan);};
  const observer=new MutationObserver(queueScan);observer.observe(document.body,{childList:true,subtree:true});scan();
  function sampleBackdrop(loader:Element|null){
    backgroundScale=Math.min(1,960/innerWidth);const width=Math.round(innerWidth*backgroundScale),height=Math.round(innerHeight*backgroundScale);
    if(background.width!==width||background.height!==height){background.width=width;background.height=height;}
    const context=backgroundContext;context.setTransform(backgroundScale,0,0,backgroundScale,0,0);context.globalAlpha=1;context.fillStyle='#07080b';context.fillRect(0,0,innerWidth,innerHeight);
    const field=loader?.querySelector('.ambient-background')??document.querySelector('body>.ambient-background');
    for(const blob of field?.querySelectorAll<HTMLElement>('.ambient-blob')??[]){const box=blob.getBoundingClientRect(),style=getComputedStyle(blob);if(!box.width||!box.height)continue;context.save();context.translate(box.x+box.width/2,box.y+box.height/2);context.scale(box.width,box.height);context.globalAlpha=Number(style.opacity)||.3;const fill=context.createRadialGradient(0,0,0,0,0,.58);fill.addColorStop(0,style.backgroundColor);fill.addColorStop(.6,style.backgroundColor);fill.addColorStop(1,'transparent');context.fillStyle=fill;context.fillRect(-.6,-.6,1.2,1.2);context.restore();}
    if(!loader)for(const image of document.querySelectorAll<HTMLImageElement>('#contenu img')){
      const box=image.getBoundingClientRect();if(!image.complete||!image.naturalWidth||box.width<2||box.height<2||box.bottom<0||box.top>innerHeight)continue;
      if(image.checkVisibility&&!image.checkVisibility({checkOpacity:true,checkVisibilityCSS:true}))continue;
      const url=new URL(image.currentSrc||image.src,location.href);if(url.origin!==location.origin)continue;
      const style=getComputedStyle(image),fit=style.objectFit,scale=fit==='cover'?Math.max(box.width/image.naturalWidth,box.height/image.naturalHeight):Math.min(box.width/image.naturalWidth,box.height/image.naturalHeight);
      context.save();context.beginPath();context.rect(box.x,box.y,box.width,box.height);context.clip();try{if(fit==='contain'||fit==='cover'){const w=image.naturalWidth*scale,h=image.naturalHeight*scale;context.drawImage(image,box.x+(box.width-w)/2,box.y+(box.height-h)/2,w,h);}else context.drawImage(image,box.x,box.y,box.width,box.height);}catch{/* Retain the live ambient source if an image cannot be sampled. */}context.restore();
    }
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,backdropTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,background);
  }
  const f=(name:string,value:number)=>gl.uniform1f(uniforms[name],value);
  const v=(name:string,x:number,y:number)=>gl.uniform2f(uniforms[name],x,y);
  function draw(record:Surface,time:number,rect:DOMRect){
    const {host,canvas,context,kind,native}=record;
    if(native&&time-record.lastImage<800)return;
    const style=getComputedStyle(host);const dpr=Math.min(devicePixelRatio,1.35),limit=Math.min(1,Math.sqrt(140000/(rect.width*rect.height*dpr*dpr)));
    const w=Math.max(2,Math.round(rect.width*dpr*limit)),h=Math.max(2,Math.round(rect.height*dpr*limit));
    if(gpu.width!==w||gpu.height!==h){gpu.width=w;gpu.height=h;}if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    gl.viewport(0,0,w,h);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(program);
    let sourceWidth=background.width,sourceHeight=background.height,localScale=backgroundScale;
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,backdropTexture);
    if(kind==='disc'){
      const t=motion.matches?0:time*.00015;discContext.clearRect(0,0,256,256);discContext.drawImage(background,rect.x*backgroundScale,rect.y*backgroundScale,rect.width*backgroundScale,rect.height*backgroundScale,0,0,256,256);discContext.save();discContext.globalAlpha=.62;discContext.translate(128,128);discContext.rotate(Math.sin(t)*.07);discContext.scale(1.13,1.13);discContext.drawImage(icon,-128+Math.sin(t)*5,-128,256,256);discContext.restore();
      gl.bindTexture(gl.TEXTURE_2D,discTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,discBackground);sourceWidth=sourceHeight=256;localScale=256/rect.width;v('u_containerPosition',128,128);
    }else v('u_containerPosition',(rect.x+rect.width/2)*backgroundScale,(rect.y+rect.height/2)*backgroundScale);
    gl.uniform1i(uniforms.u_image,0);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,kind==='text'?textTexture:kind==='disc'?circleTexture:emptyMask);gl.uniform1i(uniforms.u_shapeMask,1);
    gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,kind==='text'?textCoverageTexture:kind==='disc'?circleCoverageTexture:emptyMask);gl.uniform1i(uniforms.u_shapeCoverage,2);
    v('u_resolution',rect.width*localScale,rect.height*localScale);v('u_textureSize',sourceWidth,sourceHeight);
    let radius=parseFloat(style.borderTopLeftRadius)||0;if(style.borderTopLeftRadius.includes('%'))radius=Math.min(rect.width,rect.height)*radius/100;
    if(kind==='disc')radius=rect.width/2;if(kind==='text')radius=0;
    f('u_borderRadius',Math.min(radius,rect.width/2,rect.height/2)*localScale);f('u_scrollY',0);f('u_blurRadius',kind==='text'?1.2:kind==='disc'?1.5:2.8);
    f('u_warp',1);f('u_edgeIntensity',kind==='text'?.004:.012);f('u_rimIntensity',kind==='disc'?.028:.018);f('u_baseIntensity',.0015);
    f('u_edgeDistance',.17);f('u_rimDistance',.75);f('u_baseDistance',.1);f('u_cornerBoost',.001);f('u_rippleEffect',.007);
    const active=host.matches('.desktop-nav a[aria-current],.brand-button[aria-current],.button[aria-pressed=true],.admin-main-nav button[aria-current],.admin-work-tab[aria-pressed=true]');
    const tone=active?(style.getPropertyValue('--active-color').trim()||'100 36 72').split(/\s+/).map(Number):[240,246,255];
    gl.uniform3f(uniforms.u_colorTint,tone[0]/255,tone[1]/255,tone[2]/255);f('u_tintOpacity',kind==='disc'?.07:kind==='text'?.08:active?.64:.075);
    f('u_masked',kind==='surface'?0:1);f('u_glassText',kind==='text'?1:0);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    context.clearRect(0,0,w,h);context.drawImage(gpu,0,0);
    if(native){host.style.setProperty('--liquid-image',`url("${canvas.toDataURL('image/png')}")`);record.lastImage=time;}
    host.dataset.liquidReady='true';
  }
  function render(time:number){
    if(disposed)return;frame=requestAnimationFrame(render);
    const interval=matchMedia('(pointer:coarse)').matches?85:50;if(time-last<interval||document.visibilityState!=='visible')return;last=time;
    const loader=document.querySelector('.site-preloader');sampleBackdrop(loader);
    for(const record of records.values()){
      const {host,kind}=record;if(!host.isConnected)continue;
      if(loader&&kind==='surface'&&!host.closest('.site-preloader'))continue;
      const rect=host.getBoundingClientRect();if(rect.width<3||rect.height<3||rect.bottom<0||rect.top>innerHeight||rect.right<0||rect.left>innerWidth)continue;
      if(host.checkVisibility&&!host.checkVisibility({checkOpacity:true,checkVisibilityCSS:true}))continue;
      draw(record,time,rect);
    }
  }
  document.documentElement.dataset.liquidEngine='webgl';frame=requestAnimationFrame(render);
  function cleanup(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);cancelAnimationFrame(scanFrame);observer.disconnect();gpu.removeEventListener('webglcontextlost',lost);for(const record of [...records.values()])remove(record);for(const t of [backdropTexture,discTexture,textTexture,circleTexture,textCoverageTexture,circleCoverageTexture,emptyMask])gl.deleteTexture(t);gl.deleteBuffer(positions);gl.deleteBuffer(uvs);gl.deleteProgram(program);gl.deleteShader(vertex);gl.deleteShader(fragment);gl.getExtension('WEBGL_lose_context')?.loseContext();gpu.width=gpu.height=0;}
  function lost(event:Event){event.preventDefault();cleanup();document.documentElement.dataset.liquidEngine='fallback';}
  gpu.addEventListener('webglcontextlost',lost);
  return cleanup;
}
