import {NextRequest,NextResponse} from 'next/server';
import {contentSecurityPolicy} from './lib/security-policy';

export function proxy(request:NextRequest){
  const nonce=Buffer.from(crypto.randomUUID()).toString('base64');
  const policy=contentSecurityPolicy(nonce,process.env.NODE_ENV==='development',['localhost','127.0.0.1','[::1]'].includes(request.nextUrl.hostname));
  const headers=new Headers(request.headers);
  // Overwrite incoming values: the requester must never choose the nonce/policy.
  headers.set('x-nonce',nonce);headers.set('Content-Security-Policy',policy);
  const response=NextResponse.next({request:{headers}});
  response.headers.set('Content-Security-Policy',policy);
  return response;
}

export const config={matcher:['/((?!api/|_next/|media/|images/|fonts/|flags/|social-logos/|vendor/).*)']};
