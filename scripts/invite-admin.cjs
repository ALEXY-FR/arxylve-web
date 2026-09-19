// Run from the deployed project via the server's private terminal, never a web route.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
function invite(origin,project=process.cwd()){
 const url=new URL(origin);
 if(url.username||url.password||url.search||url.hash||url.pathname!=='/'||(url.protocol!=='https:'&&!(url.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(url.hostname))))throw Error('Indiquez uniquement l’origine HTTPS du site, par exemple https://arxylve.com.');
 const dir=path.join(project,'.arxylve-private','cms');fs.mkdirSync(dir,{recursive:true,mode:0o700});
 const configured=fs.existsSync(path.join(dir,'credentials.json'));
 const token=crypto.randomBytes(32).toString('hex'),expires=Date.now()+15*60*1000;
 const record={hash:crypto.createHash('sha256').update(token).digest('hex'),expires};
 function write(name,text){const dest=path.join(dir,name),temp=dest+'.'+crypto.randomUUID()+'.tmp';fs.writeFileSync(temp,text,{mode:0o600});fs.renameSync(temp,dest)}
 write(configured?'device-invite.json':'setup.json',JSON.stringify(record));
 const file=path.join(dir,'admin-invitation.txt');
 write('admin-invitation.txt',url.origin+'/admin#'+(configured?'device':'setup')+'='+token+'\n');
 return {file,configured,expires};
}
if(require.main===module){try{if(process.argv.length!==3)throw Error('Usage : npm run admin:invite -- https://arxylve.com');const result=invite(process.argv[2]);console.log('Invitation privée valable 15 minutes, utilisable une seule fois.');console.log('Ouvrez le fichier privé : '+result.file);console.log(result.configured?'Votre mot de passe actuel sera demandé.':'Ce lien permettra de choisir le premier mot de passe.')}catch(e){console.error(e.message);process.exitCode=1}}
module.exports={invite};
