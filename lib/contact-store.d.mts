export type ContactDetails = {firstName:string;lastName:string;email:string;phone:string;category:string;dimensions:string;message:string;acquisition:boolean;artworks:string[]};
export type ContactStatus = 'received'|'replied'|'in-progress'|'completed';
export type ContactRequest = {id:string;createdAt:string;details:ContactDetails;status:ContactStatus;delivery:'sending'|'sent';ownerTest?:boolean;repliedAt?:string};
export function reserveContact(email:string,phone:string,details?:ContactDetails,bypass?:boolean):Promise<string|null>;
export function releaseContact(id:string):Promise<void>;
export function markReplied(email:string):Promise<number>;
export function confirmContact(id:string):Promise<void>;
export function listContacts():Promise<ContactRequest[]>;
export function updateContact(id:string,status:ContactStatus):Promise<void>;

