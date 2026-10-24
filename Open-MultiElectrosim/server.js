import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomBytes,scrypt as scryptCb,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
const scrypt=promisify(scryptCb),ROOT=path.dirname(fileURLToPath(import.meta.url)),PUBLIC=path.join(ROOT,'public'),DATA=process.env.OME_DATA_DIR||path.join(ROOT,'data'),DB=path.join(DATA,'accounts.json');
fs.mkdirSync(DATA,{recursive:true});let db={users:[],projects:{}};
if(fs.existsSync(DB)){try{db=JSON.parse(fs.readFileSync(DB,'utf8'));if(!Array.isArray(db.users)||!db.projects)throw Error('Invalid database')}catch{console.error('Account data is unreadable. Restore data/accounts.json from backup; the server will not overwrite it.');process.exit(1)}}
function persist(){const tmp=DB+'.tmp';fs.writeFileSync(tmp,JSON.stringify(db),{mode:0o600});fs.renameSync(tmp,DB)}
const sessions=new Map(),attempts=new Map();const flag=name=>{const i=process.argv.indexOf(name);return i>=0?process.argv[i+1]:undefined};const PORT=Number(flag('--port')||process.env.PORT||3000),HOST=flag('--host')||process.env.HOST||'0.0.0.0';
function json(res,code,value){res.writeHead(code,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(value))}
function userOf(req){const cookies=Object.fromEntries((req.headers.cookie||'').split(';').map(s=>s.trim().split('=')));const s=sessions.get(cookies.ome_session);if(s&&s.expires>Date.now())return db.users.find(u=>u.id===s.user);return null;}
function session(req,res,user){const id=randomBytes(32).toString('hex');sessions.set(id,{user:user.id,expires:Date.now()+7*86400000});res.setHeader('Set-Cookie',`ome_session=${id}; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800${req.socket.encrypted?'; Secure':''}`);return {id:user.id,name:user.name,email:user.email}}
async function body(req){let chunks='',size=0;for await(const data of req){size+=data.length;if(size>1048576)throw Object.assign(Error('Request exceeds 1 MB'),{code:413});chunks+=data}try{return chunks?JSON.parse(chunks):{}}catch{throw Object.assign(Error('Invalid JSON'),{code:400})}}
function authRate(req){const ip=req.socket.remoteAddress;const now=Date.now();let a=attempts.get(ip);if(!a||a.until<now){a={count:0,until:now+900000};attempts.set(ip,a)}if(++a.count>20)throw Object.assign(Error('Too many sign-in attempts. Try again in 15 minutes.'),{code:429});}
function validProject(p){if(!p||typeof p!=='object'||!Array.isArray(p.parts)||p.parts.length>300||!Array.isArray(p.wires)||p.wires.length>1000||typeof p.name!=='string'||p.name.length>100)throw Object.assign(Error('Invalid project document'),{code:400});return p;}
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json','.ico':'image/x-icon','.png':'image/png'};
const server=http.createServer(async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');res.setHeader('X-Frame-Options','DENY');res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
 try{const url=new URL(req.url,'http://localhost'),route=url.pathname;if(route==='/health'){return json(res,200,{ok:true,app:'Open MultiElectrosim'})}
 if(route.startsWith('/api/')){
 if(!['GET','HEAD'].includes(req.method)&&req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host)return json(res,403,{error:'Cross-origin request blocked'});
 if(route==='/api/auth/me'&&req.method==='GET'){const u=userOf(req);return json(res,200,{user:u?{id:u.id,name:u.name,email:u.email}:null})}
 if(['/api/auth/signup','/api/auth/signin'].includes(route)&&req.method==='POST'){
 authRate(req);const b=await body(req),email=String(b.email||'').trim().toLowerCase(),password=String(b.password||'');if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||password.length<10||password.length>128)return json(res,400,{error:'Use a valid email and a password of 10–128 characters.'});let u=db.users.find(x=>x.email===email);
 if(route.endsWith('signup')){if(db.users.length>=500)return json(res,503,{error:'Local account limit reached'});if(u)return json(res,409,{error:'This email already has an account.'});const salt=randomBytes(16).toString('hex'),hash=(await scrypt(password,salt,64)).toString('hex');if(db.users.some(x=>x.email===email))return json(res,409,{error:'This email already has an account.'});u={id:randomBytes(16).toString('hex'),email,name:String(b.name||'Engineer').trim().slice(0,60)||'Engineer',salt,hash};db.users.push(u);persist();return json(res,201,{user:session(req,res,u)});}
 const salt=u?.salt||'unknown-account-placeholder',computed=await scrypt(password,salt,64);if(!u||!timingSafeEqual(computed,Buffer.from(u.hash,'hex')))return json(res,401,{error:'Email or password is incorrect.'});return json(res,200,{user:session(req,res,u)});
 }
 if(route==='/api/auth/signout'&&req.method==='POST'){const token=(req.headers.cookie||'').match(/(?:^|;\s*)ome_session=([^;]+)/)?.[1];sessions.delete(token);res.setHeader('Set-Cookie','ome_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');return json(res,200,{ok:true})}
 if(route.startsWith('/api/projects')){const user=userOf(req);if(!user)return json(res,401,{error:'Sign in to use account projects.'});db.projects[user.id]||={};const collection=db.projects[user.id],id=route.split('/')[3];if(!id&&req.method==='GET')return json(res,200,{projects:Object.entries(collection).map(([id,p])=>({id,name:p.name,updated:p.updated,parts:p.document.parts.length}))});if(!id&&req.method==='POST'){if(Object.keys(collection).length>=50)return json(res,400,{error:'Maximum 50 saved projects per local account.'});const p=validProject(await body(req)),pid=randomBytes(12).toString('hex');collection[pid]={name:p.name,document:p,updated:new Date().toISOString()};persist();return json(res,201,{id:pid})}if(!/^[a-f0-9]{24}$/.test(id||'')||!collection[id])return json(res,404,{error:'Project not found'});if(req.method==='GET')return json(res,200,{project:collection[id].document});if(req.method==='PUT'){const p=validProject(await body(req));collection[id]={name:p.name,document:p,updated:new Date().toISOString()};persist();return json(res,200,{ok:true,id})}if(req.method==='DELETE'){delete collection[id];persist();return json(res,200,{ok:true})}}
 return json(res,404,{error:'API route not found'});
 }
 if(!['GET','HEAD'].includes(req.method))return json(res,405,{error:'Method not allowed'});
 let filename=decodeURIComponent(route);if(['/','/signin','/signup'].includes(filename))filename='/index.html';const full=path.resolve(PUBLIC,'.'+filename);if(!full.startsWith(PUBLIC+path.sep))return json(res,403,{error:'Forbidden'});let stat;try{stat=fs.statSync(full)}catch{return json(res,404,{error:'File not found'})}if(!stat.isFile())return json(res,404,{error:'File not found'});res.writeHead(200,{'Content-Type':mime[path.extname(full)]||'application/octet-stream','Cache-Control':'no-cache'});if(req.method==='HEAD')return res.end();fs.createReadStream(full).pipe(res);
 }catch(e){json(res,e.code&&Number.isInteger(e.code)?e.code:500,{error:e.code?e.message:'Server error. Check local server access and data permissions.'})}
});
setInterval(()=>{const now=Date.now();for(const [k,v]of sessions)if(v.expires<now)sessions.delete(k);for(const [k,v]of attempts)if(v.until<now)attempts.delete(k)},60000).unref();
server.listen(PORT,HOST,()=>console.log(`\n  Open MultiElectrosim\n  Open http://localhost:${PORT}\n  Accounts and projects stay on this server. Press Ctrl+C to stop.\n`));
