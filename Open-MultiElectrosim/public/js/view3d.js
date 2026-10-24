import {byId} from './catalog.js';
import {pcbPads,segments,boardParts} from './pcb.js';
export class Board3D{
 constructor(canvas){this.canvas=canvas;this.yaw=-0.35;this.pitch=0.9;this.zoom=1;this.drag=null;canvas.addEventListener('pointerdown',e=>{this.drag={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId)});canvas.addEventListener('pointermove',e=>{if(!this.drag)return;this.yaw+=(e.clientX-this.drag.x)*.008;this.pitch=Math.max(.15,Math.min(1.5,this.pitch+(e.clientY-this.drag.y)*.008));this.drag={x:e.clientX,y:e.clientY};this.render()});canvas.addEventListener('pointerup',()=>this.drag=null);canvas.addEventListener('wheel',e=>{e.preventDefault();this.zoom=Math.max(.35,Math.min(3,this.zoom*Math.exp(-e.deltaY*.001)));this.render()},{passive:false});}
 setProject(p){this.project=p;this.render()}
 render(){if(!this.project||this.canvas.hidden)return;const c=this.canvas,rect=c.getBoundingClientRect(),dpr=window.devicePixelRatio||1;if(rect.width<1)return;c.width=rect.width*dpr;c.height=rect.height*dpr;const ctx=c.getContext('2d');ctx.scale(dpr,dpr);const W=rect.width,H=rect.height,board=this.project.board,BW=board.width/10,BH=board.height/10,scale=Math.min(W/(BW*1.25),H/(BH*1.4))*this.zoom;const cy=Math.cos(this.yaw),sy=Math.sin(this.yaw),cp=Math.cos(this.pitch),sp=Math.sin(this.pitch);
 const project=(x,y,z=0)=>{x-=BW/2;y-=BH/2;const xx=x*cy-y*sy,yy=x*sy+y*cy,depth=yy*sp-z*cp;return {x:W/2+xx*scale,y:H/2+(yy*cp-z*sp)*scale,depth}};
 ctx.clearRect(0,0,W,H);const light=document.documentElement.dataset.theme==='light';ctx.fillStyle=light?'#eef3f0':'#101819';ctx.fillRect(0,0,W,H);const grad=ctx.createRadialGradient(W/2,H*.6,20,W/2,H*.6,W*.45);grad.addColorStop(0,light?'#c4d1c8aa':'#0009');grad.addColorStop(1,'#0000');ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
 const faces=[];const face=(points,fill,stroke='#ffffff12')=>{faces.push({points,fill,stroke,depth:points.reduce((s,p)=>s+p.depth,0)/points.length})};
 const box=(x,y,z,w,d,h,color,rotation=0)=>{const a=rotation*Math.PI/180,ca=Math.cos(a),sa=Math.sin(a),p=(xx,yy,zz)=>project(x+xx*ca-yy*sa,y+xx*sa+yy*ca,z+zz),pts=[p(-w/2,-d/2,0),p(w/2,-d/2,0),p(w/2,d/2,0),p(-w/2,d/2,0),p(-w/2,-d/2,h),p(w/2,-d/2,h),p(w/2,d/2,h),p(-w/2,d/2,h)];face([pts[0],pts[1],pts[5],pts[4]],color[1]||color[0]);face([pts[1],pts[2],pts[6],pts[5]],color[2]||color[0]);face([pts[2],pts[3],pts[7],pts[6]],color[1]||color[0]);face([pts[3],pts[0],pts[4],pts[7]],color[2]||color[0]);face([pts[4],pts[5],pts[6],pts[7]],color[0]);};
 const cylinder=(x,y,z,r,h,color)=>{const top=[],bottom=[];for(let i=0;i<16;i++){const a=i*Math.PI/8;top.push(project(x+r*Math.cos(a),y+r*Math.sin(a),z+h));bottom.push(project(x+r*Math.cos(a),y+r*Math.sin(a),z));}for(let i=0;i<16;i++)face([bottom[i],bottom[(i+1)%16],top[(i+1)%16],top[i]],i<8?color[1]:color[2]);face(top,color[0]);};
 box(BW/2,BH/2,-1.6,BW-4.8,BH-4.8,1.6,['#245c43','#b1a36b','#6e6848']);
 for(const p of boardParts(this.project)){const fp=p.footprint||p,c=byId[p.type],k=c.kind,x=fp.x/10,y=fp.y/10,r=fp.rotation||0;let width=5,depth=3,height=3;
 if(k==='mcu'){width=12;depth=Math.max(17,Math.ceil(c.pins.length/2)*2.54+3);box(x,y,1,width,depth,1,['#247a65','#174c40','#2b5941'],r);box(x,y,2.1,7,7,1.3,['#313637','#151819','#242b2d'],r);const ang=r*Math.PI/180;box(x+Math.sin(ang)*(depth/2-3),y-Math.cos(ang)*(depth/2-3),2,7,5,3,['#b0b7b6','#6c7372','#858c8a'],r);box(x,y+Math.cos(ang)*(depth/2-3),2,4,1.4,1.5,['#202a2a','#0c1717','#101b1a'],r);}
 else if(k==='capacitor'&&c.polarized){cylinder(x,y,.3,2.7,8,['#c3c9ca','#27394a','#1f2c3b']);box(x,y,8.4,2.8,.2,.08,['#717c7b'],r);}
 else if(k==='led'){cylinder(x,y,.2,2,4,[c.color||'#ee6a70',c.color||'#bd3747','#65252a']);}
 else if(['resistor','ldr','ntc','ptc','pot'].includes(k)){box(x,y,.8,5.2,2.3,2.1,['#c6ad82','#96815d','#a28c64'],r);const a=r*Math.PI/180;for(let i=0;i<3;i++)box(x+(i-1)*1.2*Math.cos(a),y+(i-1)*1.2*Math.sin(a),2.91,.45,2.35,.04,[['#8b553c','#27252c','#c2413a'][i]],r);}
 else if(k==='inductor'){cylinder(x,y,.2,2.6,3.5,['#414c43','#26322b','#1c251f']);for(let i=0;i<4;i++)box(x+(i-1.5)*.85,y,3.72,.38,3,.18,['#b27f42'],r);}
 else if(['diode','zener'].includes(k)){box(x,y,.7,4,2,2,['#363b3c','#161d20','#252a2c'],r);box(x+1.3*Math.cos(r*Math.PI/180),y+1.3*Math.sin(r*Math.PI/180),2.71,.6,2,.06,['#b5bfbb'],r);}
 else if(['voltage','sine','square','triangle','current'].includes(k)){box(x,y,.2,10,6,6,['#43877b','#20564d','#296a5b'],r);cylinder(x-2.5,y,6.2,1.5,.2,['#b1bcbb','#707b79','#879491']);cylinder(x+2.5,y,6.2,1.5,.2,['#b1bcbb','#707b79','#879491']);}
 else if(c.pins.length>3){height=2.5;depth=Math.max(4,Math.ceil(c.pins.length/2)*2.54);box(x,y,.8,6.8,depth,height,['#343d3d','#172222','#222d2c'],r);}
 else if(k==='capacitor'){box(x,y,.5,3.5,3,4,['#bba271','#8d7950','#a68d5a'],r);}
 else if(k==='testpoint')cylinder(x,y,.4,1,2.5,['#e3c37e','#b49b5e','#8b774e']);
 else box(x,y,.4,width,depth,height,['#404849','#202b2d','#323c3c'],r);
 }
 // Sorted faces produce a solid, orbitable scene without external rendering dependencies.
 faces.sort((a,b)=>b.depth-a.depth);const drawFace=f=>{ctx.beginPath();f.points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fillStyle=f.fill;ctx.fill();ctx.strokeStyle=f.stroke;ctx.lineWidth=.6;ctx.stroke()};
 // Board first, copper on its top, and component geometry last.
 
 // Render board separately to prevent copper being occluded by its top surface.
 faces.filter(f=>f.fill==='#245c43'||f.fill==='#b1a36b'||f.fill==='#6e6848').forEach(drawFace);
 for(const t of segments(this.project).filter(s=>s.layer==='F.Cu')){const a=project(t.a.x/10,t.a.y/10,.03),b=project(t.b.x/10,t.b.y/10,.03);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle='#a38443';ctx.lineWidth=Math.max(1,t.width*scale);ctx.lineCap='round';ctx.stroke();}
 for(const pad of pcbPads(this.project)){const pp=project(pad.x/10,pad.y/10,.08);ctx.save();ctx.translate(pp.x,pp.y);ctx.rotate(this.yaw);ctx.scale(1,Math.max(.2,cp));ctx.fillStyle='#c6ab65';ctx.beginPath();ctx.arc(0,0,.8*scale,0,Math.PI*2);ctx.fill();ctx.fillStyle='#132a23';ctx.beginPath();ctx.arc(0,0,.4*scale,0,Math.PI*2);ctx.fill();ctx.restore()}
 for(const [x,y]of [[4,4],[BW-4,4],[4,BH-4],[BW-4,BH-4]]){const pp=project(x,y,.09);ctx.fillStyle='#a2956d';ctx.beginPath();ctx.ellipse(pp.x,pp.y,1.6*scale,1.6*scale*cp,this.yaw,0,Math.PI*2);ctx.fill();ctx.fillStyle=light?'#d4ded8':'#0e1717';ctx.beginPath();ctx.ellipse(pp.x,pp.y,scale,scale*cp,this.yaw,0,Math.PI*2);ctx.fill();}
 for(const part of boardParts(this.project)){const fp=part.footprint||part,def=byId[part.type],pp=pcbPads(this.project).filter(p=>p.part===part.id);for(const pad of pp){const a=project(pad.x/10,pad.y/10,.1),b=project(fp.x/10,fp.y/10,.9);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle='#aeb8b0';ctx.lineWidth=Math.max(.7,.3*scale);ctx.stroke();}const xy=project(fp.x/10,fp.y/10-4,.12),xp=project(fp.x/10+1,fp.y/10-4,.12),yp=project(fp.x/10,fp.y/10-3,.12);ctx.save();ctx.setTransform(dpr*(xp.x-xy.x),dpr*(xp.y-xy.y),dpr*(yp.x-xy.x),dpr*(yp.y-xy.y),dpr*xy.x,dpr*xy.y);ctx.fillStyle='#d7e8ce';ctx.font='1.2px ui-monospace, monospace';ctx.textAlign='center';ctx.fillText(part.ref,0,0);ctx.restore();}
 faces.filter(f=>!['#245c43','#b1a36b','#6e6848'].includes(f.fill)).forEach(drawFace);
 ctx.fillStyle=light?'#668274':'#6d8d7d';ctx.font='10px ui-monospace, monospace';ctx.textAlign='right';ctx.fillText(`${(BW-4.8).toFixed(1)} × ${(BH-4.8).toFixed(1)} mm  /  FR4 · 1.6 mm`,W-20,H-22);
 }
}
