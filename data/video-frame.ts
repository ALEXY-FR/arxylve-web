export type VideoCrop={left:number;top:number;width:number;height:number};
export const fullVideo:VideoCrop={left:0,top:0,width:1,height:1};
// Only remove paired, near-pure-black export borders. Dark footage is left intact.
export function videoBorders(pixels:Uint8ClampedArray,width:number,height:number):VideoCrop|null{
 const dark=(x:number,y:number)=>{const i=(y*width+x)*4;return pixels[i]<12&&pixels[i+1]<12&&pixels[i+2]<12;};
 const column=(x:number)=>{let black=0;for(let y=0;y<height;y++)if(dark(x,y))black++;return black/height>=.995;};
 const row=(y:number)=>{let black=0;for(let x=0;x<width;x++)if(dark(x,y))black++;return black/width>=.995;};
 let left=0,right=width,top=0,bottom=height;
 while(left<width&&column(left))left++;while(right>left&&column(right-1))right--;
 while(top<height&&row(top))top++;while(bottom>top&&row(bottom-1))bottom--;
 if(left<width*.04||width-right<width*.04){left=0;right=width;}
 if(top<height*.04||height-bottom<height*.04){top=0;bottom=height;}
 if((right-left)*(bottom-top)<width*height*.2||(left===0&&right===width&&top===0&&bottom===height))return null;
 return {left:left/width,top:top/height,width:(right-left)/width,height:(bottom-top)/height};
}
export function videoPlacement(natural:number,crop:VideoCrop,frame:number){
 const ratio=natural*crop.width/crop.height;
 const w=Math.max(1,ratio/frame),h=Math.max(1,frame/ratio);
 return {position:'absolute' as const,width:(w/crop.width*100)+'%',height:(h/crop.height*100)+'%',left:((1-w)/2-crop.left*w/crop.width)*100+'%',top:((1-h)/2-crop.top*h/crop.height)*100+'%',objectFit:'fill' as const};
}
