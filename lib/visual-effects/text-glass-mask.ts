/** Rasterize the actual glyph and cache its distance field for the glass bevel. */
export function createTextGlassMask(text:string,style:CSSStyleDeclaration,width:number,height:number,cssWidth:number,cssHeight:number){
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const context=canvas.getContext('2d',{willReadFrequently:true})!;
  context.scale(width/cssWidth,height/cssHeight);
  context.font=style.font||[style.fontWeight,style.fontSize,style.fontFamily].join(' ');
  const metrics=context.measureText(text),size=parseFloat(style.fontSize);
  const ascent=metrics.fontBoundingBoxAscent??size*.8,descent=metrics.fontBoundingBoxDescent??size*.2;
  context.fillStyle='#fff';context.fillText(text,0,(cssHeight-ascent-descent)/2+ascent);
  const image=context.getImageData(0,0,width,height).data;
  const distance=new Float32Array(width*height),field=new Uint8Array(image.length),coverage=new Uint8Array(image.length);
  for(let i=0;i<distance.length;i++)distance[i]=image[i*4+3]>127?10000:0;
  // Two chamfer passes approximate distance to the glyph boundary in linear time.
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const i=y*width+x;if(!distance[i])continue;
    distance[i]=Math.min(distance[i],x?distance[i-1]+1:1,y?distance[i-width]+1:1,x&&y?distance[i-width-1]+Math.SQRT2:10000,y&&x+1<width?distance[i-width+1]+Math.SQRT2:10000);
  }
  for(let y=height-1;y>=0;y--)for(let x=width-1;x>=0;x--){
    const i=y*width+x;if(!distance[i])continue;
    distance[i]=Math.min(distance[i],x+1<width?distance[i+1]+1:1,y+1<height?distance[i+width]+1:1,x+1<width&&y+1<height?distance[i+width+1]+Math.SQRT2:10000,x&&y+1<height?distance[i+width-1]+Math.SQRT2:10000);
  }
  const bevel=Math.max(1,Math.min(width,height)*.12);
  for(let i=0;i<distance.length;i++){
    const p=i*4,value=Math.round(255*(1-Math.min(1,distance[i]/bevel))),outside=255-image[p+3];
    field[p]=field[p+1]=field[p+2]=value;field[p+3]=255;
    coverage[p]=coverage[p+1]=coverage[p+2]=outside;coverage[p+3]=255;
  }
  return {field,coverage};
}
