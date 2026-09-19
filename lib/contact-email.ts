type ContactEmail={firstName:string;lastName:string;phone:string;email:string;category:string;dimensions:string;message:string;acquisition:boolean;artworks:string[]};
function escapeHtml(value:string){return value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;')}
export function formatContactEmail(input:ContactEmail){
 const {firstName,lastName,phone,email,category,dimensions,message,acquisition,artworks}=input;
 const inquiry=!acquisition&&category.startsWith('Renseignement — ');
 const subjectType=acquisition?'Demande d’acquisition':inquiry?category:'Demande sur mesure';
 const title=acquisition?'Nouvelle demande d’acquisition':inquiry?'Nouvelle demande de renseignement':'Nouvelle demande sur mesure';
 const paragraph=(label:string,value:string)=>`<p><strong>${label} :</strong><br />${escapeHtml(value).replaceAll('\n','<br />')}</p>`;
 return {
  subject:`${subjectType} — ${firstName} ${lastName}`.replace(/[\r\n]+/g,' '),
  html:`<h1>${title}</h1>`+paragraph('Nom',`${firstName} ${lastName}`)+paragraph('Téléphone',phone)+paragraph('E-mail',email)+paragraph('Message',message)+(acquisition?paragraph('Œuvres',artworks.join('\n')):paragraph('Dimensions',dimensions)),
  text:[title,'',`Nom : ${firstName} ${lastName}`,`Téléphone : ${phone}`,`E-mail : ${email}`,'','Message :',message,'',...(acquisition?['Œuvres :',...artworks]:['Dimensions :',dimensions])].join('\n'),
 };
}
