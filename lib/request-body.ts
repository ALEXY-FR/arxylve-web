export class RequestError extends Error {
  constructor(message:string,public status=400,public retryAfter?:number){super(message);this.name='RequestError';}
}

export async function readJsonBody<T=unknown>(request:Request,maxBytes:number):Promise<T>{
  if(request.headers.get('content-encoding')&&!/^identity$/i.test(request.headers.get('content-encoding')!))throw new RequestError('Demande invalide.',415);
  if(request.headers.get('content-type')?.split(';')[0].trim().toLowerCase()!=='application/json')throw new RequestError('Demande invalide.',415);
  const declared=request.headers.get('content-length');
  if(declared!==null&&(!/^\d+$/.test(declared)||!Number.isSafeInteger(Number(declared))))throw new RequestError('Demande invalide.');
  if(declared!==null&&Number(declared)>maxBytes)throw new RequestError('Demande trop volumineuse.',413);
  if(!request.body)throw new RequestError('Demande invalide.');
  const reader=request.body.getReader(),chunks:Uint8Array[]=[];let size=0;
  try{
    while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>maxBytes)throw new RequestError('Demande trop volumineuse.',413);chunks.push(value);}
  }catch(error){void reader.cancel().catch(()=>{});throw error;}
  finally{reader.releaseLock();}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
  try{return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes)) as T;}catch{throw new RequestError('Demande invalide.');}
}

export function requestErrorResponse(error:unknown,fallback='Demande invalide.'){
  const known=error instanceof RequestError;
  return Response.json({message:known?error.message:fallback},{status:known?error.status:503,headers:{'Cache-Control':'no-store',...(known&&error.retryAfter?{'Retry-After':String(error.retryAfter)}:{})}});
}
