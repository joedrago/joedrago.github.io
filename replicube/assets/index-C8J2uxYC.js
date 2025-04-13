(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function t(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(r){if(r.ep)return;r.ep=!0;const s=t(r);fetch(r.href,s)}})();/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Aa="175",Ei={ROTATE:0,DOLLY:1,PAN:2},xi={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},Zc=0,Ha=1,Jc=2,Ko=1,Qc=2,vn=3,Nn=0,Ft=1,on=2,Un=0,yi=1,Ga=2,Wa=3,Xa=4,el=5,Yn=100,tl=101,nl=102,il=103,rl=104,sl=200,al=201,ol=202,cl=203,Fs=204,Os=205,ll=206,ul=207,hl=208,fl=209,dl=210,pl=211,ml=212,gl=213,_l=214,Bs=0,zs=1,ks=2,Ai=3,Vs=4,Hs=5,Gs=6,Ws=7,wa=0,vl=1,xl=2,In=0,Sl=1,Ml=2,El=3,yl=4,bl=5,Tl=6,Al=7,Zo=300,wi=301,Ri=302,Xs=303,$s=304,Hr=306,qs=1e3,Kn=1001,Ys=1002,rn=1003,wl=1004,ar=1005,cn=1006,es=1007,Zn=1008,yn=1009,Jo=1010,Qo=1011,Gi=1012,Ra=1013,Qn=1014,xn=1015,ji=1016,Ca=1017,Pa=1018,Wi=1020,ec=35902,tc=1021,nc=1022,nn=1023,ic=1024,rc=1025,Xi=1026,$i=1027,sc=1028,La=1029,ac=1030,Da=1031,Ua=1033,Pr=33776,Lr=33777,Dr=33778,Ur=33779,js=35840,Ks=35841,Zs=35842,Js=35843,Qs=36196,ea=37492,ta=37496,na=37808,ia=37809,ra=37810,sa=37811,aa=37812,oa=37813,ca=37814,la=37815,ua=37816,ha=37817,fa=37818,da=37819,pa=37820,ma=37821,Ir=36492,ga=36494,_a=36495,oc=36283,va=36284,xa=36285,Sa=36286,Rl=3200,Cl=3201,cc=0,Pl=1,Ln="",Yt="srgb",Ci="srgb-linear",zr="linear",at="srgb",si=7680,$a=519,Ll=512,Dl=513,Ul=514,lc=515,Il=516,Nl=517,Fl=518,Ol=519,qa=35044,Ya="300 es",Sn=2e3,kr=2001;class ni{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){const i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){const i=this._listeners;if(i===void 0)return;const r=i[e];if(r!==void 0){const s=r.indexOf(t);s!==-1&&r.splice(s,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const i=t[e.type];if(i!==void 0){e.target=this;const r=i.slice(0);for(let s=0,a=r.length;s<a;s++)r[s].call(this,e);e.target=null}}}const At=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Nr=Math.PI/180,Ma=180/Math.PI;function Ki(){const n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(At[n&255]+At[n>>8&255]+At[n>>16&255]+At[n>>24&255]+"-"+At[e&255]+At[e>>8&255]+"-"+At[e>>16&15|64]+At[e>>24&255]+"-"+At[t&63|128]+At[t>>8&255]+"-"+At[t>>16&255]+At[t>>24&255]+At[i&255]+At[i>>8&255]+At[i>>16&255]+At[i>>24&255]).toLowerCase()}function Xe(n,e,t){return Math.max(e,Math.min(t,n))}function Bl(n,e){return(n%e+e)%e}function ts(n,e,t){return(1-t)*n+t*e}function Ni(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function It(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}const zl={DEG2RAD:Nr};class He{constructor(e=0,t=0){He.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,i=this.y,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6],this.y=r[1]*t+r[4]*i+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Xe(this.x,e.x,t.x),this.y=Xe(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Xe(this.x,e,t),this.y=Xe(this.y,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Xe(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(Xe(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const i=Math.cos(t),r=Math.sin(t),s=this.x-e.x,a=this.y-e.y;return this.x=s*i-a*r+e.x,this.y=s*r+a*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Ve{constructor(e,t,i,r,s,a,o,l,u){Ve.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,r,s,a,o,l,u)}set(e,t,i,r,s,a,o,l,u){const c=this.elements;return c[0]=e,c[1]=r,c[2]=o,c[3]=t,c[4]=s,c[5]=l,c[6]=i,c[7]=a,c[8]=u,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,r=t.elements,s=this.elements,a=i[0],o=i[3],l=i[6],u=i[1],c=i[4],d=i[7],p=i[2],g=i[5],v=i[8],M=r[0],m=r[3],h=r[6],T=r[1],w=r[4],b=r[7],B=r[2],P=r[5],R=r[8];return s[0]=a*M+o*T+l*B,s[3]=a*m+o*w+l*P,s[6]=a*h+o*b+l*R,s[1]=u*M+c*T+d*B,s[4]=u*m+c*w+d*P,s[7]=u*h+c*b+d*R,s[2]=p*M+g*T+v*B,s[5]=p*m+g*w+v*P,s[8]=p*h+g*b+v*R,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],u=e[7],c=e[8];return t*a*c-t*o*u-i*s*c+i*o*l+r*s*u-r*a*l}invert(){const e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],u=e[7],c=e[8],d=c*a-o*u,p=o*l-c*s,g=u*s-a*l,v=t*d+i*p+r*g;if(v===0)return this.set(0,0,0,0,0,0,0,0,0);const M=1/v;return e[0]=d*M,e[1]=(r*u-c*i)*M,e[2]=(o*i-r*a)*M,e[3]=p*M,e[4]=(c*t-r*l)*M,e[5]=(r*s-o*t)*M,e[6]=g*M,e[7]=(i*l-u*t)*M,e[8]=(a*t-i*s)*M,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,r,s,a,o){const l=Math.cos(s),u=Math.sin(s);return this.set(i*l,i*u,-i*(l*a+u*o)+a+e,-r*u,r*l,-r*(-u*a+l*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(ns.makeScale(e,t)),this}rotate(e){return this.premultiply(ns.makeRotation(-e)),this}translate(e,t){return this.premultiply(ns.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,i=e.elements;for(let r=0;r<9;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const ns=new Ve;function uc(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function Vr(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function kl(){const n=Vr("canvas");return n.style.display="block",n}const ja={};function Fr(n){n in ja||(ja[n]=!0,console.warn(n))}function Vl(n,e,t){return new Promise(function(i,r){function s(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:r();break;case n.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:i()}}setTimeout(s,t)})}function Hl(n){const e=n.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function Gl(n){const e=n.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const Ka=new Ve().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Za=new Ve().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Wl(){const n={enabled:!0,workingColorSpace:Ci,spaces:{},convert:function(r,s,a){return this.enabled===!1||s===a||!s||!a||(this.spaces[s].transfer===at&&(r.r=En(r.r),r.g=En(r.g),r.b=En(r.b)),this.spaces[s].primaries!==this.spaces[a].primaries&&(r.applyMatrix3(this.spaces[s].toXYZ),r.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===at&&(r.r=bi(r.r),r.g=bi(r.g),r.b=bi(r.b))),r},fromWorkingColorSpace:function(r,s){return this.convert(r,this.workingColorSpace,s)},toWorkingColorSpace:function(r,s){return this.convert(r,s,this.workingColorSpace)},getPrimaries:function(r){return this.spaces[r].primaries},getTransfer:function(r){return r===Ln?zr:this.spaces[r].transfer},getLuminanceCoefficients:function(r,s=this.workingColorSpace){return r.fromArray(this.spaces[s].luminanceCoefficients)},define:function(r){Object.assign(this.spaces,r)},_getMatrix:function(r,s,a){return r.copy(this.spaces[s].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(r){return this.spaces[r].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(r=this.workingColorSpace){return this.spaces[r].workingColorSpaceConfig.unpackColorSpace}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[Ci]:{primaries:e,whitePoint:i,transfer:zr,toXYZ:Ka,fromXYZ:Za,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Yt},outputColorSpaceConfig:{drawingBufferColorSpace:Yt}},[Yt]:{primaries:e,whitePoint:i,transfer:at,toXYZ:Ka,fromXYZ:Za,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Yt}}}),n}const nt=Wl();function En(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function bi(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}let ai;class Xl{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{ai===void 0&&(ai=Vr("canvas")),ai.width=e.width,ai.height=e.height;const r=ai.getContext("2d");e instanceof ImageData?r.putImageData(e,0,0):r.drawImage(e,0,0,e.width,e.height),i=ai}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Vr("canvas");t.width=e.width,t.height=e.height;const i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const r=i.getImageData(0,0,e.width,e.height),s=r.data;for(let a=0;a<s.length;a++)s[a]=En(s[a]/255)*255;return i.putImageData(r,0,0),t}else if(e.data){const t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(En(t[i]/255)*255):t[i]=En(t[i]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let $l=0;class Ia{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:$l++}),this.uuid=Ki(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let a=0,o=r.length;a<o;a++)r[a].isDataTexture?s.push(is(r[a].image)):s.push(is(r[a]))}else s=is(r);i.url=s}return t||(e.images[this.uuid]=i),i}}function is(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?Xl.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let ql=0;class Ot extends ni{constructor(e=Ot.DEFAULT_IMAGE,t=Ot.DEFAULT_MAPPING,i=Kn,r=Kn,s=cn,a=Zn,o=nn,l=yn,u=Ot.DEFAULT_ANISOTROPY,c=Ln){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:ql++}),this.uuid=Ki(),this.name="",this.source=new Ia(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=r,this.magFilter=s,this.minFilter=a,this.anisotropy=u,this.format=o,this.internalFormat=null,this.type=l,this.offset=new He(0,0),this.repeat=new He(1,1),this.center=new He(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ve,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=c,this.userData={},this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Zo)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case qs:e.x=e.x-Math.floor(e.x);break;case Kn:e.x=e.x<0?0:1;break;case Ys:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case qs:e.y=e.y-Math.floor(e.y);break;case Kn:e.y=e.y<0?0:1;break;case Ys:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Ot.DEFAULT_IMAGE=null;Ot.DEFAULT_MAPPING=Zo;Ot.DEFAULT_ANISOTROPY=1;class gt{constructor(e=0,t=0,i=0,r=1){gt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=i,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,r){return this.x=e,this.y=t,this.z=i,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,i=this.y,r=this.z,s=this.w,a=e.elements;return this.x=a[0]*t+a[4]*i+a[8]*r+a[12]*s,this.y=a[1]*t+a[5]*i+a[9]*r+a[13]*s,this.z=a[2]*t+a[6]*i+a[10]*r+a[14]*s,this.w=a[3]*t+a[7]*i+a[11]*r+a[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,r,s;const l=e.elements,u=l[0],c=l[4],d=l[8],p=l[1],g=l[5],v=l[9],M=l[2],m=l[6],h=l[10];if(Math.abs(c-p)<.01&&Math.abs(d-M)<.01&&Math.abs(v-m)<.01){if(Math.abs(c+p)<.1&&Math.abs(d+M)<.1&&Math.abs(v+m)<.1&&Math.abs(u+g+h-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const w=(u+1)/2,b=(g+1)/2,B=(h+1)/2,P=(c+p)/4,R=(d+M)/4,D=(v+m)/4;return w>b&&w>B?w<.01?(i=0,r=.707106781,s=.707106781):(i=Math.sqrt(w),r=P/i,s=R/i):b>B?b<.01?(i=.707106781,r=0,s=.707106781):(r=Math.sqrt(b),i=P/r,s=D/r):B<.01?(i=.707106781,r=.707106781,s=0):(s=Math.sqrt(B),i=R/s,r=D/s),this.set(i,r,s,t),this}let T=Math.sqrt((m-v)*(m-v)+(d-M)*(d-M)+(p-c)*(p-c));return Math.abs(T)<.001&&(T=1),this.x=(m-v)/T,this.y=(d-M)/T,this.z=(p-c)/T,this.w=Math.acos((u+g+h-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Xe(this.x,e.x,t.x),this.y=Xe(this.y,e.y,t.y),this.z=Xe(this.z,e.z,t.z),this.w=Xe(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Xe(this.x,e,t),this.y=Xe(this.y,e,t),this.z=Xe(this.z,e,t),this.w=Xe(this.w,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Xe(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Yl extends ni{constructor(e=1,t=1,i={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new gt(0,0,e,t),this.scissorTest=!1,this.viewport=new gt(0,0,e,t);const r={width:e,height:t,depth:1};i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:cn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},i);const s=new Ot(r,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.colorSpace);s.flipY=!1,s.generateMipmaps=i.generateMipmaps,s.internalFormat=i.internalFormat,this.textures=[];const a=i.count;for(let o=0;o<a;o++)this.textures[o]=s.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=i.depthTexture,this.samples=i.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let r=0,s=this.textures.length;r<s;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=i;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const r=Object.assign({},e.textures[t].image);this.textures[t].source=new Ia(r)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class ei extends Yl{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}}class hc extends Ot{constructor(e=null,t=1,i=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=rn,this.minFilter=rn,this.wrapR=Kn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class jl extends Ot{constructor(e=null,t=1,i=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=rn,this.minFilter=rn,this.wrapR=Kn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class ti{constructor(e=0,t=0,i=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=r}static slerpFlat(e,t,i,r,s,a,o){let l=i[r+0],u=i[r+1],c=i[r+2],d=i[r+3];const p=s[a+0],g=s[a+1],v=s[a+2],M=s[a+3];if(o===0){e[t+0]=l,e[t+1]=u,e[t+2]=c,e[t+3]=d;return}if(o===1){e[t+0]=p,e[t+1]=g,e[t+2]=v,e[t+3]=M;return}if(d!==M||l!==p||u!==g||c!==v){let m=1-o;const h=l*p+u*g+c*v+d*M,T=h>=0?1:-1,w=1-h*h;if(w>Number.EPSILON){const B=Math.sqrt(w),P=Math.atan2(B,h*T);m=Math.sin(m*P)/B,o=Math.sin(o*P)/B}const b=o*T;if(l=l*m+p*b,u=u*m+g*b,c=c*m+v*b,d=d*m+M*b,m===1-o){const B=1/Math.sqrt(l*l+u*u+c*c+d*d);l*=B,u*=B,c*=B,d*=B}}e[t]=l,e[t+1]=u,e[t+2]=c,e[t+3]=d}static multiplyQuaternionsFlat(e,t,i,r,s,a){const o=i[r],l=i[r+1],u=i[r+2],c=i[r+3],d=s[a],p=s[a+1],g=s[a+2],v=s[a+3];return e[t]=o*v+c*d+l*g-u*p,e[t+1]=l*v+c*p+u*d-o*g,e[t+2]=u*v+c*g+o*p-l*d,e[t+3]=c*v-o*d-l*p-u*g,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,r){return this._x=e,this._y=t,this._z=i,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const i=e._x,r=e._y,s=e._z,a=e._order,o=Math.cos,l=Math.sin,u=o(i/2),c=o(r/2),d=o(s/2),p=l(i/2),g=l(r/2),v=l(s/2);switch(a){case"XYZ":this._x=p*c*d+u*g*v,this._y=u*g*d-p*c*v,this._z=u*c*v+p*g*d,this._w=u*c*d-p*g*v;break;case"YXZ":this._x=p*c*d+u*g*v,this._y=u*g*d-p*c*v,this._z=u*c*v-p*g*d,this._w=u*c*d+p*g*v;break;case"ZXY":this._x=p*c*d-u*g*v,this._y=u*g*d+p*c*v,this._z=u*c*v+p*g*d,this._w=u*c*d-p*g*v;break;case"ZYX":this._x=p*c*d-u*g*v,this._y=u*g*d+p*c*v,this._z=u*c*v-p*g*d,this._w=u*c*d+p*g*v;break;case"YZX":this._x=p*c*d+u*g*v,this._y=u*g*d+p*c*v,this._z=u*c*v-p*g*d,this._w=u*c*d-p*g*v;break;case"XZY":this._x=p*c*d-u*g*v,this._y=u*g*d-p*c*v,this._z=u*c*v+p*g*d,this._w=u*c*d+p*g*v;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const i=t/2,r=Math.sin(i);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,i=t[0],r=t[4],s=t[8],a=t[1],o=t[5],l=t[9],u=t[2],c=t[6],d=t[10],p=i+o+d;if(p>0){const g=.5/Math.sqrt(p+1);this._w=.25/g,this._x=(c-l)*g,this._y=(s-u)*g,this._z=(a-r)*g}else if(i>o&&i>d){const g=2*Math.sqrt(1+i-o-d);this._w=(c-l)/g,this._x=.25*g,this._y=(r+a)/g,this._z=(s+u)/g}else if(o>d){const g=2*Math.sqrt(1+o-i-d);this._w=(s-u)/g,this._x=(r+a)/g,this._y=.25*g,this._z=(l+c)/g}else{const g=2*Math.sqrt(1+d-i-o);this._w=(a-r)/g,this._x=(s+u)/g,this._y=(l+c)/g,this._z=.25*g}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<Number.EPSILON?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Xe(this.dot(e),-1,1)))}rotateTowards(e,t){const i=this.angleTo(e);if(i===0)return this;const r=Math.min(1,t/i);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const i=e._x,r=e._y,s=e._z,a=e._w,o=t._x,l=t._y,u=t._z,c=t._w;return this._x=i*c+a*o+r*u-s*l,this._y=r*c+a*l+s*o-i*u,this._z=s*c+a*u+i*l-r*o,this._w=a*c-i*o-r*l-s*u,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const i=this._x,r=this._y,s=this._z,a=this._w;let o=a*e._w+i*e._x+r*e._y+s*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=i,this._y=r,this._z=s,this;const l=1-o*o;if(l<=Number.EPSILON){const g=1-t;return this._w=g*a+t*this._w,this._x=g*i+t*this._x,this._y=g*r+t*this._y,this._z=g*s+t*this._z,this.normalize(),this}const u=Math.sqrt(l),c=Math.atan2(u,o),d=Math.sin((1-t)*c)/u,p=Math.sin(t*c)/u;return this._w=a*d+this._w*p,this._x=i*d+this._x*p,this._y=r*d+this._y*p,this._z=s*d+this._z*p,this._onChangeCallback(),this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),r=Math.sqrt(1-i),s=Math.sqrt(i);return this.set(r*Math.sin(e),r*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class z{constructor(e=0,t=0,i=0){z.prototype.isVector3=!0,this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Ja.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Ja.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6]*r,this.y=s[1]*t+s[4]*i+s[7]*r,this.z=s[2]*t+s[5]*i+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,i=this.y,r=this.z,s=e.elements,a=1/(s[3]*t+s[7]*i+s[11]*r+s[15]);return this.x=(s[0]*t+s[4]*i+s[8]*r+s[12])*a,this.y=(s[1]*t+s[5]*i+s[9]*r+s[13])*a,this.z=(s[2]*t+s[6]*i+s[10]*r+s[14])*a,this}applyQuaternion(e){const t=this.x,i=this.y,r=this.z,s=e.x,a=e.y,o=e.z,l=e.w,u=2*(a*r-o*i),c=2*(o*t-s*r),d=2*(s*i-a*t);return this.x=t+l*u+a*d-o*c,this.y=i+l*c+o*u-s*d,this.z=r+l*d+s*c-a*u,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[4]*i+s[8]*r,this.y=s[1]*t+s[5]*i+s[9]*r,this.z=s[2]*t+s[6]*i+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Xe(this.x,e.x,t.x),this.y=Xe(this.y,e.y,t.y),this.z=Xe(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Xe(this.x,e,t),this.y=Xe(this.y,e,t),this.z=Xe(this.z,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Xe(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const i=e.x,r=e.y,s=e.z,a=t.x,o=t.y,l=t.z;return this.x=r*l-s*o,this.y=s*a-i*l,this.z=i*o-r*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return rs.copy(this).projectOnVector(e),this.sub(rs)}reflect(e){return this.sub(rs.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(Xe(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y,r=this.z-e.z;return t*t+i*i+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){const r=Math.sin(t)*e;return this.x=r*Math.sin(i),this.y=Math.cos(t)*e,this.z=r*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const rs=new z,Ja=new ti;class Zi{constructor(e=new z(1/0,1/0,1/0),t=new z(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(Jt.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(Jt.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const i=Jt.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const s=i.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=s.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,Jt):Jt.fromBufferAttribute(s,a),Jt.applyMatrix4(e.matrixWorld),this.expandByPoint(Jt);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),or.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),or.copy(i.boundingBox)),or.applyMatrix4(e.matrixWorld),this.union(or)}const r=e.children;for(let s=0,a=r.length;s<a;s++)this.expandByObject(r[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Jt),Jt.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Fi),cr.subVectors(this.max,Fi),oi.subVectors(e.a,Fi),ci.subVectors(e.b,Fi),li.subVectors(e.c,Fi),bn.subVectors(ci,oi),Tn.subVectors(li,ci),Vn.subVectors(oi,li);let t=[0,-bn.z,bn.y,0,-Tn.z,Tn.y,0,-Vn.z,Vn.y,bn.z,0,-bn.x,Tn.z,0,-Tn.x,Vn.z,0,-Vn.x,-bn.y,bn.x,0,-Tn.y,Tn.x,0,-Vn.y,Vn.x,0];return!ss(t,oi,ci,li,cr)||(t=[1,0,0,0,1,0,0,0,1],!ss(t,oi,ci,li,cr))?!1:(lr.crossVectors(bn,Tn),t=[lr.x,lr.y,lr.z],ss(t,oi,ci,li,cr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Jt).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Jt).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(fn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),fn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),fn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),fn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),fn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),fn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),fn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),fn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(fn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const fn=[new z,new z,new z,new z,new z,new z,new z,new z],Jt=new z,or=new Zi,oi=new z,ci=new z,li=new z,bn=new z,Tn=new z,Vn=new z,Fi=new z,cr=new z,lr=new z,Hn=new z;function ss(n,e,t,i,r){for(let s=0,a=n.length-3;s<=a;s+=3){Hn.fromArray(n,s);const o=r.x*Math.abs(Hn.x)+r.y*Math.abs(Hn.y)+r.z*Math.abs(Hn.z),l=e.dot(Hn),u=t.dot(Hn),c=i.dot(Hn);if(Math.max(-Math.max(l,u,c),Math.min(l,u,c))>o)return!1}return!0}const Kl=new Zi,Oi=new z,as=new z;class Na{constructor(e=new z,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const i=this.center;t!==void 0?i.copy(t):Kl.setFromPoints(e).getCenter(i);let r=0;for(let s=0,a=e.length;s<a;s++)r=Math.max(r,i.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Oi.subVectors(e,this.center);const t=Oi.lengthSq();if(t>this.radius*this.radius){const i=Math.sqrt(t),r=(i-this.radius)*.5;this.center.addScaledVector(Oi,r/i),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(as.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Oi.copy(e.center).add(as)),this.expandByPoint(Oi.copy(e.center).sub(as))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const dn=new z,os=new z,ur=new z,An=new z,cs=new z,hr=new z,ls=new z;class fc{constructor(e=new z,t=new z(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,dn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=dn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(dn.copy(this.origin).addScaledVector(this.direction,t),dn.distanceToSquared(e))}distanceSqToSegment(e,t,i,r){os.copy(e).add(t).multiplyScalar(.5),ur.copy(t).sub(e).normalize(),An.copy(this.origin).sub(os);const s=e.distanceTo(t)*.5,a=-this.direction.dot(ur),o=An.dot(this.direction),l=-An.dot(ur),u=An.lengthSq(),c=Math.abs(1-a*a);let d,p,g,v;if(c>0)if(d=a*l-o,p=a*o-l,v=s*c,d>=0)if(p>=-v)if(p<=v){const M=1/c;d*=M,p*=M,g=d*(d+a*p+2*o)+p*(a*d+p+2*l)+u}else p=s,d=Math.max(0,-(a*p+o)),g=-d*d+p*(p+2*l)+u;else p=-s,d=Math.max(0,-(a*p+o)),g=-d*d+p*(p+2*l)+u;else p<=-v?(d=Math.max(0,-(-a*s+o)),p=d>0?-s:Math.min(Math.max(-s,-l),s),g=-d*d+p*(p+2*l)+u):p<=v?(d=0,p=Math.min(Math.max(-s,-l),s),g=p*(p+2*l)+u):(d=Math.max(0,-(a*s+o)),p=d>0?s:Math.min(Math.max(-s,-l),s),g=-d*d+p*(p+2*l)+u);else p=a>0?-s:s,d=Math.max(0,-(a*p+o)),g=-d*d+p*(p+2*l)+u;return i&&i.copy(this.origin).addScaledVector(this.direction,d),r&&r.copy(os).addScaledVector(ur,p),g}intersectSphere(e,t){dn.subVectors(e.center,this.origin);const i=dn.dot(this.direction),r=dn.dot(dn)-i*i,s=e.radius*e.radius;if(r>s)return null;const a=Math.sqrt(s-r),o=i-a,l=i+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){const i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,r,s,a,o,l;const u=1/this.direction.x,c=1/this.direction.y,d=1/this.direction.z,p=this.origin;return u>=0?(i=(e.min.x-p.x)*u,r=(e.max.x-p.x)*u):(i=(e.max.x-p.x)*u,r=(e.min.x-p.x)*u),c>=0?(s=(e.min.y-p.y)*c,a=(e.max.y-p.y)*c):(s=(e.max.y-p.y)*c,a=(e.min.y-p.y)*c),i>a||s>r||((s>i||isNaN(i))&&(i=s),(a<r||isNaN(r))&&(r=a),d>=0?(o=(e.min.z-p.z)*d,l=(e.max.z-p.z)*d):(o=(e.max.z-p.z)*d,l=(e.min.z-p.z)*d),i>l||o>r)||((o>i||i!==i)&&(i=o),(l<r||r!==r)&&(r=l),r<0)?null:this.at(i>=0?i:r,t)}intersectsBox(e){return this.intersectBox(e,dn)!==null}intersectTriangle(e,t,i,r,s){cs.subVectors(t,e),hr.subVectors(i,e),ls.crossVectors(cs,hr);let a=this.direction.dot(ls),o;if(a>0){if(r)return null;o=1}else if(a<0)o=-1,a=-a;else return null;An.subVectors(this.origin,e);const l=o*this.direction.dot(hr.crossVectors(An,hr));if(l<0)return null;const u=o*this.direction.dot(cs.cross(An));if(u<0||l+u>a)return null;const c=-o*An.dot(ls);return c<0?null:this.at(c/a,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class _t{constructor(e,t,i,r,s,a,o,l,u,c,d,p,g,v,M,m){_t.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,r,s,a,o,l,u,c,d,p,g,v,M,m)}set(e,t,i,r,s,a,o,l,u,c,d,p,g,v,M,m){const h=this.elements;return h[0]=e,h[4]=t,h[8]=i,h[12]=r,h[1]=s,h[5]=a,h[9]=o,h[13]=l,h[2]=u,h[6]=c,h[10]=d,h[14]=p,h[3]=g,h[7]=v,h[11]=M,h[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new _t().fromArray(this.elements)}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){const t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,i=e.elements,r=1/ui.setFromMatrixColumn(e,0).length(),s=1/ui.setFromMatrixColumn(e,1).length(),a=1/ui.setFromMatrixColumn(e,2).length();return t[0]=i[0]*r,t[1]=i[1]*r,t[2]=i[2]*r,t[3]=0,t[4]=i[4]*s,t[5]=i[5]*s,t[6]=i[6]*s,t[7]=0,t[8]=i[8]*a,t[9]=i[9]*a,t[10]=i[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,i=e.x,r=e.y,s=e.z,a=Math.cos(i),o=Math.sin(i),l=Math.cos(r),u=Math.sin(r),c=Math.cos(s),d=Math.sin(s);if(e.order==="XYZ"){const p=a*c,g=a*d,v=o*c,M=o*d;t[0]=l*c,t[4]=-l*d,t[8]=u,t[1]=g+v*u,t[5]=p-M*u,t[9]=-o*l,t[2]=M-p*u,t[6]=v+g*u,t[10]=a*l}else if(e.order==="YXZ"){const p=l*c,g=l*d,v=u*c,M=u*d;t[0]=p+M*o,t[4]=v*o-g,t[8]=a*u,t[1]=a*d,t[5]=a*c,t[9]=-o,t[2]=g*o-v,t[6]=M+p*o,t[10]=a*l}else if(e.order==="ZXY"){const p=l*c,g=l*d,v=u*c,M=u*d;t[0]=p-M*o,t[4]=-a*d,t[8]=v+g*o,t[1]=g+v*o,t[5]=a*c,t[9]=M-p*o,t[2]=-a*u,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){const p=a*c,g=a*d,v=o*c,M=o*d;t[0]=l*c,t[4]=v*u-g,t[8]=p*u+M,t[1]=l*d,t[5]=M*u+p,t[9]=g*u-v,t[2]=-u,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){const p=a*l,g=a*u,v=o*l,M=o*u;t[0]=l*c,t[4]=M-p*d,t[8]=v*d+g,t[1]=d,t[5]=a*c,t[9]=-o*c,t[2]=-u*c,t[6]=g*d+v,t[10]=p-M*d}else if(e.order==="XZY"){const p=a*l,g=a*u,v=o*l,M=o*u;t[0]=l*c,t[4]=-d,t[8]=u*c,t[1]=p*d+M,t[5]=a*c,t[9]=g*d-v,t[2]=v*d-g,t[6]=o*c,t[10]=M*d+p}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Zl,e,Jl)}lookAt(e,t,i){const r=this.elements;return zt.subVectors(e,t),zt.lengthSq()===0&&(zt.z=1),zt.normalize(),wn.crossVectors(i,zt),wn.lengthSq()===0&&(Math.abs(i.z)===1?zt.x+=1e-4:zt.z+=1e-4,zt.normalize(),wn.crossVectors(i,zt)),wn.normalize(),fr.crossVectors(zt,wn),r[0]=wn.x,r[4]=fr.x,r[8]=zt.x,r[1]=wn.y,r[5]=fr.y,r[9]=zt.y,r[2]=wn.z,r[6]=fr.z,r[10]=zt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,r=t.elements,s=this.elements,a=i[0],o=i[4],l=i[8],u=i[12],c=i[1],d=i[5],p=i[9],g=i[13],v=i[2],M=i[6],m=i[10],h=i[14],T=i[3],w=i[7],b=i[11],B=i[15],P=r[0],R=r[4],D=r[8],y=r[12],E=r[1],U=r[5],Q=r[9],X=r[13],ie=r[2],Y=r[6],ee=r[10],re=r[14],K=r[3],C=r[7],$=r[11],ve=r[15];return s[0]=a*P+o*E+l*ie+u*K,s[4]=a*R+o*U+l*Y+u*C,s[8]=a*D+o*Q+l*ee+u*$,s[12]=a*y+o*X+l*re+u*ve,s[1]=c*P+d*E+p*ie+g*K,s[5]=c*R+d*U+p*Y+g*C,s[9]=c*D+d*Q+p*ee+g*$,s[13]=c*y+d*X+p*re+g*ve,s[2]=v*P+M*E+m*ie+h*K,s[6]=v*R+M*U+m*Y+h*C,s[10]=v*D+M*Q+m*ee+h*$,s[14]=v*y+M*X+m*re+h*ve,s[3]=T*P+w*E+b*ie+B*K,s[7]=T*R+w*U+b*Y+B*C,s[11]=T*D+w*Q+b*ee+B*$,s[15]=T*y+w*X+b*re+B*ve,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[4],r=e[8],s=e[12],a=e[1],o=e[5],l=e[9],u=e[13],c=e[2],d=e[6],p=e[10],g=e[14],v=e[3],M=e[7],m=e[11],h=e[15];return v*(+s*l*d-r*u*d-s*o*p+i*u*p+r*o*g-i*l*g)+M*(+t*l*g-t*u*p+s*a*p-r*a*g+r*u*c-s*l*c)+m*(+t*u*d-t*o*g-s*a*d+i*a*g+s*o*c-i*u*c)+h*(-r*o*c-t*l*d+t*o*p+r*a*d-i*a*p+i*l*c)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){const r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=i),this}invert(){const e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],u=e[7],c=e[8],d=e[9],p=e[10],g=e[11],v=e[12],M=e[13],m=e[14],h=e[15],T=d*m*u-M*p*u+M*l*g-o*m*g-d*l*h+o*p*h,w=v*p*u-c*m*u-v*l*g+a*m*g+c*l*h-a*p*h,b=c*M*u-v*d*u+v*o*g-a*M*g-c*o*h+a*d*h,B=v*d*l-c*M*l-v*o*p+a*M*p+c*o*m-a*d*m,P=t*T+i*w+r*b+s*B;if(P===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const R=1/P;return e[0]=T*R,e[1]=(M*p*s-d*m*s-M*r*g+i*m*g+d*r*h-i*p*h)*R,e[2]=(o*m*s-M*l*s+M*r*u-i*m*u-o*r*h+i*l*h)*R,e[3]=(d*l*s-o*p*s-d*r*u+i*p*u+o*r*g-i*l*g)*R,e[4]=w*R,e[5]=(c*m*s-v*p*s+v*r*g-t*m*g-c*r*h+t*p*h)*R,e[6]=(v*l*s-a*m*s-v*r*u+t*m*u+a*r*h-t*l*h)*R,e[7]=(a*p*s-c*l*s+c*r*u-t*p*u-a*r*g+t*l*g)*R,e[8]=b*R,e[9]=(v*d*s-c*M*s-v*i*g+t*M*g+c*i*h-t*d*h)*R,e[10]=(a*M*s-v*o*s+v*i*u-t*M*u-a*i*h+t*o*h)*R,e[11]=(c*o*s-a*d*s-c*i*u+t*d*u+a*i*g-t*o*g)*R,e[12]=B*R,e[13]=(c*M*r-v*d*r+v*i*p-t*M*p-c*i*m+t*d*m)*R,e[14]=(v*o*r-a*M*r-v*i*l+t*M*l+a*i*m-t*o*m)*R,e[15]=(a*d*r-c*o*r+c*i*l-t*d*l-a*i*p+t*o*p)*R,this}scale(e){const t=this.elements,i=e.x,r=e.y,s=e.z;return t[0]*=i,t[4]*=r,t[8]*=s,t[1]*=i,t[5]*=r,t[9]*=s,t[2]*=i,t[6]*=r,t[10]*=s,t[3]*=i,t[7]*=r,t[11]*=s,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,r))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const i=Math.cos(t),r=Math.sin(t),s=1-i,a=e.x,o=e.y,l=e.z,u=s*a,c=s*o;return this.set(u*a+i,u*o-r*l,u*l+r*o,0,u*o+r*l,c*o+i,c*l-r*a,0,u*l-r*o,c*l+r*a,s*l*l+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,r,s,a){return this.set(1,i,s,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,i){const r=this.elements,s=t._x,a=t._y,o=t._z,l=t._w,u=s+s,c=a+a,d=o+o,p=s*u,g=s*c,v=s*d,M=a*c,m=a*d,h=o*d,T=l*u,w=l*c,b=l*d,B=i.x,P=i.y,R=i.z;return r[0]=(1-(M+h))*B,r[1]=(g+b)*B,r[2]=(v-w)*B,r[3]=0,r[4]=(g-b)*P,r[5]=(1-(p+h))*P,r[6]=(m+T)*P,r[7]=0,r[8]=(v+w)*R,r[9]=(m-T)*R,r[10]=(1-(p+M))*R,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,i){const r=this.elements;let s=ui.set(r[0],r[1],r[2]).length();const a=ui.set(r[4],r[5],r[6]).length(),o=ui.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),e.x=r[12],e.y=r[13],e.z=r[14],Qt.copy(this);const u=1/s,c=1/a,d=1/o;return Qt.elements[0]*=u,Qt.elements[1]*=u,Qt.elements[2]*=u,Qt.elements[4]*=c,Qt.elements[5]*=c,Qt.elements[6]*=c,Qt.elements[8]*=d,Qt.elements[9]*=d,Qt.elements[10]*=d,t.setFromRotationMatrix(Qt),i.x=s,i.y=a,i.z=o,this}makePerspective(e,t,i,r,s,a,o=Sn){const l=this.elements,u=2*s/(t-e),c=2*s/(i-r),d=(t+e)/(t-e),p=(i+r)/(i-r);let g,v;if(o===Sn)g=-(a+s)/(a-s),v=-2*a*s/(a-s);else if(o===kr)g=-a/(a-s),v=-a*s/(a-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=u,l[4]=0,l[8]=d,l[12]=0,l[1]=0,l[5]=c,l[9]=p,l[13]=0,l[2]=0,l[6]=0,l[10]=g,l[14]=v,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,i,r,s,a,o=Sn){const l=this.elements,u=1/(t-e),c=1/(i-r),d=1/(a-s),p=(t+e)*u,g=(i+r)*c;let v,M;if(o===Sn)v=(a+s)*d,M=-2*d;else if(o===kr)v=s*d,M=-1*d;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=2*u,l[4]=0,l[8]=0,l[12]=-p,l[1]=0,l[5]=2*c,l[9]=0,l[13]=-g,l[2]=0,l[6]=0,l[10]=M,l[14]=-v,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,i=e.elements;for(let r=0;r<16;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}}const ui=new z,Qt=new _t,Zl=new z(0,0,0),Jl=new z(1,1,1),wn=new z,fr=new z,zt=new z,Qa=new _t,eo=new ti;class hn{constructor(e=0,t=0,i=0,r=hn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,r=this._order){return this._x=e,this._y=t,this._z=i,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){const r=e.elements,s=r[0],a=r[4],o=r[8],l=r[1],u=r[5],c=r[9],d=r[2],p=r[6],g=r[10];switch(t){case"XYZ":this._y=Math.asin(Xe(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-c,g),this._z=Math.atan2(-a,s)):(this._x=Math.atan2(p,u),this._z=0);break;case"YXZ":this._x=Math.asin(-Xe(c,-1,1)),Math.abs(c)<.9999999?(this._y=Math.atan2(o,g),this._z=Math.atan2(l,u)):(this._y=Math.atan2(-d,s),this._z=0);break;case"ZXY":this._x=Math.asin(Xe(p,-1,1)),Math.abs(p)<.9999999?(this._y=Math.atan2(-d,g),this._z=Math.atan2(-a,u)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-Xe(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(p,g),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-a,u));break;case"YZX":this._z=Math.asin(Xe(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-c,u),this._y=Math.atan2(-d,s)):(this._x=0,this._y=Math.atan2(o,g));break;case"XZY":this._z=Math.asin(-Xe(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(p,u),this._y=Math.atan2(o,s)):(this._x=Math.atan2(-c,g),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return Qa.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Qa,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return eo.setFromEuler(this),this.setFromQuaternion(eo,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}hn.DEFAULT_ORDER="XYZ";class dc{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let Ql=0;const to=new z,hi=new ti,pn=new _t,dr=new z,Bi=new z,eu=new z,tu=new ti,no=new z(1,0,0),io=new z(0,1,0),ro=new z(0,0,1),so={type:"added"},nu={type:"removed"},fi={type:"childadded",child:null},us={type:"childremoved",child:null};class Rt extends ni{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Ql++}),this.uuid=Ki(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Rt.DEFAULT_UP.clone();const e=new z,t=new hn,i=new ti,r=new z(1,1,1);function s(){i.setFromEuler(t,!1)}function a(){t.setFromQuaternion(i,void 0,!1)}t._onChange(s),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new _t},normalMatrix:{value:new Ve}}),this.matrix=new _t,this.matrixWorld=new _t,this.matrixAutoUpdate=Rt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Rt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new dc,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return hi.setFromAxisAngle(e,t),this.quaternion.multiply(hi),this}rotateOnWorldAxis(e,t){return hi.setFromAxisAngle(e,t),this.quaternion.premultiply(hi),this}rotateX(e){return this.rotateOnAxis(no,e)}rotateY(e){return this.rotateOnAxis(io,e)}rotateZ(e){return this.rotateOnAxis(ro,e)}translateOnAxis(e,t){return to.copy(e).applyQuaternion(this.quaternion),this.position.add(to.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(no,e)}translateY(e){return this.translateOnAxis(io,e)}translateZ(e){return this.translateOnAxis(ro,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(pn.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?dr.copy(e):dr.set(e,t,i);const r=this.parent;this.updateWorldMatrix(!0,!1),Bi.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?pn.lookAt(Bi,dr,this.up):pn.lookAt(dr,Bi,this.up),this.quaternion.setFromRotationMatrix(pn),r&&(pn.extractRotation(r.matrixWorld),hi.setFromRotationMatrix(pn),this.quaternion.premultiply(hi.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(so),fi.child=e,this.dispatchEvent(fi),fi.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(nu),us.child=e,this.dispatchEvent(us),us.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),pn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),pn.multiply(e.parent.matrixWorld)),e.applyMatrix4(pn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(so),fi.child=e,this.dispatchEvent(fi),fi.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,r=this.children.length;i<r;i++){const a=this.children[i].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);const r=this.children;for(let s=0,a=r.length;s<a;s++)r[s].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Bi,e,eu),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Bi,tu,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t){const i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const r=this.children;for(let s=0,a=r.length;s<a;s++)r[s].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.visibility=this._visibility,r.active=this._active,r.bounds=this._bounds.map(o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()})),r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.geometryCount=this._geometryCount,r.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere={center:r.boundingSphere.center.toArray(),radius:r.boundingSphere.radius}),this.boundingBox!==null&&(r.boundingBox={min:r.boundingBox.min.toArray(),max:r.boundingBox.max.toArray()}));function s(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let u=0,c=l.length;u<c;u++){const d=l[u];s(e.shapes,d)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,u=this.material.length;l<u;l++)o.push(s(e.materials,this.material[l]));r.material=o}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let o=0;o<this.children.length;o++)r.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];r.animations.push(s(e.animations,l))}}if(t){const o=a(e.geometries),l=a(e.materials),u=a(e.textures),c=a(e.images),d=a(e.shapes),p=a(e.skeletons),g=a(e.animations),v=a(e.nodes);o.length>0&&(i.geometries=o),l.length>0&&(i.materials=l),u.length>0&&(i.textures=u),c.length>0&&(i.images=c),d.length>0&&(i.shapes=d),p.length>0&&(i.skeletons=p),g.length>0&&(i.animations=g),v.length>0&&(i.nodes=v)}return i.object=r,i;function a(o){const l=[];for(const u in o){const c=o[u];delete c.metadata,l.push(c)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){const r=e.children[i];this.add(r.clone())}return this}}Rt.DEFAULT_UP=new z(0,1,0);Rt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Rt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const en=new z,mn=new z,hs=new z,gn=new z,di=new z,pi=new z,ao=new z,fs=new z,ds=new z,ps=new z,ms=new gt,gs=new gt,_s=new gt;class tn{constructor(e=new z,t=new z,i=new z){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,r){r.subVectors(i,t),en.subVectors(e,t),r.cross(en);const s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,t,i,r,s){en.subVectors(r,t),mn.subVectors(i,t),hs.subVectors(e,t);const a=en.dot(en),o=en.dot(mn),l=en.dot(hs),u=mn.dot(mn),c=mn.dot(hs),d=a*u-o*o;if(d===0)return s.set(0,0,0),null;const p=1/d,g=(u*l-o*c)*p,v=(a*c-o*l)*p;return s.set(1-g-v,v,g)}static containsPoint(e,t,i,r){return this.getBarycoord(e,t,i,r,gn)===null?!1:gn.x>=0&&gn.y>=0&&gn.x+gn.y<=1}static getInterpolation(e,t,i,r,s,a,o,l){return this.getBarycoord(e,t,i,r,gn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,gn.x),l.addScaledVector(a,gn.y),l.addScaledVector(o,gn.z),l)}static getInterpolatedAttribute(e,t,i,r,s,a){return ms.setScalar(0),gs.setScalar(0),_s.setScalar(0),ms.fromBufferAttribute(e,t),gs.fromBufferAttribute(e,i),_s.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(ms,s.x),a.addScaledVector(gs,s.y),a.addScaledVector(_s,s.z),a}static isFrontFacing(e,t,i,r){return en.subVectors(i,t),mn.subVectors(e,t),en.cross(mn).dot(r)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,r){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,i,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return en.subVectors(this.c,this.b),mn.subVectors(this.a,this.b),en.cross(mn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return tn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return tn.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,r,s){return tn.getInterpolation(e,this.a,this.b,this.c,t,i,r,s)}containsPoint(e){return tn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return tn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const i=this.a,r=this.b,s=this.c;let a,o;di.subVectors(r,i),pi.subVectors(s,i),fs.subVectors(e,i);const l=di.dot(fs),u=pi.dot(fs);if(l<=0&&u<=0)return t.copy(i);ds.subVectors(e,r);const c=di.dot(ds),d=pi.dot(ds);if(c>=0&&d<=c)return t.copy(r);const p=l*d-c*u;if(p<=0&&l>=0&&c<=0)return a=l/(l-c),t.copy(i).addScaledVector(di,a);ps.subVectors(e,s);const g=di.dot(ps),v=pi.dot(ps);if(v>=0&&g<=v)return t.copy(s);const M=g*u-l*v;if(M<=0&&u>=0&&v<=0)return o=u/(u-v),t.copy(i).addScaledVector(pi,o);const m=c*v-g*d;if(m<=0&&d-c>=0&&g-v>=0)return ao.subVectors(s,r),o=(d-c)/(d-c+(g-v)),t.copy(r).addScaledVector(ao,o);const h=1/(m+M+p);return a=M*h,o=p*h,t.copy(i).addScaledVector(di,a).addScaledVector(pi,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const pc={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Rn={h:0,s:0,l:0},pr={h:0,s:0,l:0};function vs(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}class et{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){const r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Yt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,nt.toWorkingColorSpace(this,t),this}setRGB(e,t,i,r=nt.workingColorSpace){return this.r=e,this.g=t,this.b=i,nt.toWorkingColorSpace(this,r),this}setHSL(e,t,i,r=nt.workingColorSpace){if(e=Bl(e,1),t=Xe(t,0,1),i=Xe(i,0,1),t===0)this.r=this.g=this.b=i;else{const s=i<=.5?i*(1+t):i+t-i*t,a=2*i-s;this.r=vs(a,s,e+1/3),this.g=vs(a,s,e),this.b=vs(a,s,e-1/3)}return nt.toWorkingColorSpace(this,r),this}setStyle(e,t=Yt){function i(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s;const a=r[1],o=r[2];switch(a){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){const s=r[1],a=s.length;if(a===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Yt){const i=pc[e.toLowerCase()];return i!==void 0?this.setHex(i,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=En(e.r),this.g=En(e.g),this.b=En(e.b),this}copyLinearToSRGB(e){return this.r=bi(e.r),this.g=bi(e.g),this.b=bi(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Yt){return nt.fromWorkingColorSpace(wt.copy(this),e),Math.round(Xe(wt.r*255,0,255))*65536+Math.round(Xe(wt.g*255,0,255))*256+Math.round(Xe(wt.b*255,0,255))}getHexString(e=Yt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=nt.workingColorSpace){nt.fromWorkingColorSpace(wt.copy(this),t);const i=wt.r,r=wt.g,s=wt.b,a=Math.max(i,r,s),o=Math.min(i,r,s);let l,u;const c=(o+a)/2;if(o===a)l=0,u=0;else{const d=a-o;switch(u=c<=.5?d/(a+o):d/(2-a-o),a){case i:l=(r-s)/d+(r<s?6:0);break;case r:l=(s-i)/d+2;break;case s:l=(i-r)/d+4;break}l/=6}return e.h=l,e.s=u,e.l=c,e}getRGB(e,t=nt.workingColorSpace){return nt.fromWorkingColorSpace(wt.copy(this),t),e.r=wt.r,e.g=wt.g,e.b=wt.b,e}getStyle(e=Yt){nt.fromWorkingColorSpace(wt.copy(this),e);const t=wt.r,i=wt.g,r=wt.b;return e!==Yt?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(r*255)})`}offsetHSL(e,t,i){return this.getHSL(Rn),this.setHSL(Rn.h+e,Rn.s+t,Rn.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(Rn),e.getHSL(pr);const i=ts(Rn.h,pr.h,t),r=ts(Rn.s,pr.s,t),s=ts(Rn.l,pr.l,t);return this.setHSL(i,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,i=this.g,r=this.b,s=e.elements;return this.r=s[0]*t+s[3]*i+s[6]*r,this.g=s[1]*t+s[4]*i+s[7]*r,this.b=s[2]*t+s[5]*i+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const wt=new et;et.NAMES=pc;let iu=0;class Ji extends ni{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:iu++}),this.uuid=Ki(),this.name="",this.type="Material",this.blending=yi,this.side=Nn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Fs,this.blendDst=Os,this.blendEquation=Yn,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new et(0,0,0),this.blendAlpha=0,this.depthFunc=Ai,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=$a,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=si,this.stencilZFail=si,this.stencilZPass=si,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const i=e[t];if(i===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const r=this[t];if(r===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(i):r&&r.isVector3&&i&&i.isVector3?r.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const i={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==yi&&(i.blending=this.blending),this.side!==Nn&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==Fs&&(i.blendSrc=this.blendSrc),this.blendDst!==Os&&(i.blendDst=this.blendDst),this.blendEquation!==Yn&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==Ai&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==$a&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==si&&(i.stencilFail=this.stencilFail),this.stencilZFail!==si&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==si&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function r(s){const a=[];for(const o in s){const l=s[o];delete l.metadata,a.push(l)}return a}if(t){const s=r(e.textures),a=r(e.images);s.length>0&&(i.textures=s),a.length>0&&(i.images=a)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let i=null;if(t!==null){const r=t.length;i=new Array(r);for(let s=0;s!==r;++s)i[s]=t[s].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class mc extends Ji{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new et(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new hn,this.combine=wa,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const vt=new z,mr=new He;let ru=0;class un{constructor(e,t,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:ru++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=qa,this.updateRanges=[],this.gpuType=xn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=t.array[i+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)mr.fromBufferAttribute(this,t),mr.applyMatrix3(e),this.setXY(t,mr.x,mr.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)vt.fromBufferAttribute(this,t),vt.applyMatrix3(e),this.setXYZ(t,vt.x,vt.y,vt.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)vt.fromBufferAttribute(this,t),vt.applyMatrix4(e),this.setXYZ(t,vt.x,vt.y,vt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)vt.fromBufferAttribute(this,t),vt.applyNormalMatrix(e),this.setXYZ(t,vt.x,vt.y,vt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)vt.fromBufferAttribute(this,t),vt.transformDirection(e),this.setXYZ(t,vt.x,vt.y,vt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=Ni(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=It(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Ni(t,this.array)),t}setX(e,t){return this.normalized&&(t=It(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Ni(t,this.array)),t}setY(e,t){return this.normalized&&(t=It(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Ni(t,this.array)),t}setZ(e,t){return this.normalized&&(t=It(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Ni(t,this.array)),t}setW(e,t){return this.normalized&&(t=It(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=It(t,this.array),i=It(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,r){return e*=this.itemSize,this.normalized&&(t=It(t,this.array),i=It(i,this.array),r=It(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this}setXYZW(e,t,i,r,s){return e*=this.itemSize,this.normalized&&(t=It(t,this.array),i=It(i,this.array),r=It(r,this.array),s=It(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==qa&&(e.usage=this.usage),e}}class gc extends un{constructor(e,t,i){super(new Uint16Array(e),t,i)}}class _c extends un{constructor(e,t,i){super(new Uint32Array(e),t,i)}}class Jn extends un{constructor(e,t,i){super(new Float32Array(e),t,i)}}let su=0;const Xt=new _t,xs=new Rt,mi=new z,kt=new Zi,zi=new Zi,Tt=new z;class ii extends ni{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:su++}),this.uuid=Ki(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(uc(e)?_c:gc)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const s=new Ve().getNormalMatrix(e);i.applyNormalMatrix(s),i.needsUpdate=!0}const r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Xt.makeRotationFromQuaternion(e),this.applyMatrix4(Xt),this}rotateX(e){return Xt.makeRotationX(e),this.applyMatrix4(Xt),this}rotateY(e){return Xt.makeRotationY(e),this.applyMatrix4(Xt),this}rotateZ(e){return Xt.makeRotationZ(e),this.applyMatrix4(Xt),this}translate(e,t,i){return Xt.makeTranslation(e,t,i),this.applyMatrix4(Xt),this}scale(e,t,i){return Xt.makeScale(e,t,i),this.applyMatrix4(Xt),this}lookAt(e){return xs.lookAt(e),xs.updateMatrix(),this.applyMatrix4(xs.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(mi).negate(),this.translate(mi.x,mi.y,mi.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const i=[];for(let r=0,s=e.length;r<s;r++){const a=e[r];i.push(a.x,a.y,a.z||0)}this.setAttribute("position",new Jn(i,3))}else{const i=Math.min(e.length,t.count);for(let r=0;r<i;r++){const s=e[r];t.setXYZ(r,s.x,s.y,s.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Zi);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new z(-1/0,-1/0,-1/0),new z(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,r=t.length;i<r;i++){const s=t[i];kt.setFromBufferAttribute(s),this.morphTargetsRelative?(Tt.addVectors(this.boundingBox.min,kt.min),this.boundingBox.expandByPoint(Tt),Tt.addVectors(this.boundingBox.max,kt.max),this.boundingBox.expandByPoint(Tt)):(this.boundingBox.expandByPoint(kt.min),this.boundingBox.expandByPoint(kt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Na);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new z,1/0);return}if(e){const i=this.boundingSphere.center;if(kt.setFromBufferAttribute(e),t)for(let s=0,a=t.length;s<a;s++){const o=t[s];zi.setFromBufferAttribute(o),this.morphTargetsRelative?(Tt.addVectors(kt.min,zi.min),kt.expandByPoint(Tt),Tt.addVectors(kt.max,zi.max),kt.expandByPoint(Tt)):(kt.expandByPoint(zi.min),kt.expandByPoint(zi.max))}kt.getCenter(i);let r=0;for(let s=0,a=e.count;s<a;s++)Tt.fromBufferAttribute(e,s),r=Math.max(r,i.distanceToSquared(Tt));if(t)for(let s=0,a=t.length;s<a;s++){const o=t[s],l=this.morphTargetsRelative;for(let u=0,c=o.count;u<c;u++)Tt.fromBufferAttribute(o,u),l&&(mi.fromBufferAttribute(e,u),Tt.add(mi)),r=Math.max(r,i.distanceToSquared(Tt))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=t.position,r=t.normal,s=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new un(new Float32Array(4*i.count),4));const a=this.getAttribute("tangent"),o=[],l=[];for(let D=0;D<i.count;D++)o[D]=new z,l[D]=new z;const u=new z,c=new z,d=new z,p=new He,g=new He,v=new He,M=new z,m=new z;function h(D,y,E){u.fromBufferAttribute(i,D),c.fromBufferAttribute(i,y),d.fromBufferAttribute(i,E),p.fromBufferAttribute(s,D),g.fromBufferAttribute(s,y),v.fromBufferAttribute(s,E),c.sub(u),d.sub(u),g.sub(p),v.sub(p);const U=1/(g.x*v.y-v.x*g.y);isFinite(U)&&(M.copy(c).multiplyScalar(v.y).addScaledVector(d,-g.y).multiplyScalar(U),m.copy(d).multiplyScalar(g.x).addScaledVector(c,-v.x).multiplyScalar(U),o[D].add(M),o[y].add(M),o[E].add(M),l[D].add(m),l[y].add(m),l[E].add(m))}let T=this.groups;T.length===0&&(T=[{start:0,count:e.count}]);for(let D=0,y=T.length;D<y;++D){const E=T[D],U=E.start,Q=E.count;for(let X=U,ie=U+Q;X<ie;X+=3)h(e.getX(X+0),e.getX(X+1),e.getX(X+2))}const w=new z,b=new z,B=new z,P=new z;function R(D){B.fromBufferAttribute(r,D),P.copy(B);const y=o[D];w.copy(y),w.sub(B.multiplyScalar(B.dot(y))).normalize(),b.crossVectors(P,y);const U=b.dot(l[D])<0?-1:1;a.setXYZW(D,w.x,w.y,w.z,U)}for(let D=0,y=T.length;D<y;++D){const E=T[D],U=E.start,Q=E.count;for(let X=U,ie=U+Q;X<ie;X+=3)R(e.getX(X+0)),R(e.getX(X+1)),R(e.getX(X+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new un(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let p=0,g=i.count;p<g;p++)i.setXYZ(p,0,0,0);const r=new z,s=new z,a=new z,o=new z,l=new z,u=new z,c=new z,d=new z;if(e)for(let p=0,g=e.count;p<g;p+=3){const v=e.getX(p+0),M=e.getX(p+1),m=e.getX(p+2);r.fromBufferAttribute(t,v),s.fromBufferAttribute(t,M),a.fromBufferAttribute(t,m),c.subVectors(a,s),d.subVectors(r,s),c.cross(d),o.fromBufferAttribute(i,v),l.fromBufferAttribute(i,M),u.fromBufferAttribute(i,m),o.add(c),l.add(c),u.add(c),i.setXYZ(v,o.x,o.y,o.z),i.setXYZ(M,l.x,l.y,l.z),i.setXYZ(m,u.x,u.y,u.z)}else for(let p=0,g=t.count;p<g;p+=3)r.fromBufferAttribute(t,p+0),s.fromBufferAttribute(t,p+1),a.fromBufferAttribute(t,p+2),c.subVectors(a,s),d.subVectors(r,s),c.cross(d),i.setXYZ(p+0,c.x,c.y,c.z),i.setXYZ(p+1,c.x,c.y,c.z),i.setXYZ(p+2,c.x,c.y,c.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)Tt.fromBufferAttribute(e,t),Tt.normalize(),e.setXYZ(t,Tt.x,Tt.y,Tt.z)}toNonIndexed(){function e(o,l){const u=o.array,c=o.itemSize,d=o.normalized,p=new u.constructor(l.length*c);let g=0,v=0;for(let M=0,m=l.length;M<m;M++){o.isInterleavedBufferAttribute?g=l[M]*o.data.stride+o.offset:g=l[M]*c;for(let h=0;h<c;h++)p[v++]=u[g++]}return new un(p,c,d)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new ii,i=this.index.array,r=this.attributes;for(const o in r){const l=r[o],u=e(l,i);t.setAttribute(o,u)}const s=this.morphAttributes;for(const o in s){const l=[],u=s[o];for(let c=0,d=u.length;c<d;c++){const p=u[c],g=e(p,i);l.push(g)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const u=a[o];t.addGroup(u.start,u.count,u.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const u in l)l[u]!==void 0&&(e[u]=l[u]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const i=this.attributes;for(const l in i){const u=i[l];e.data.attributes[l]=u.toJSON(e.data)}const r={};let s=!1;for(const l in this.morphAttributes){const u=this.morphAttributes[l],c=[];for(let d=0,p=u.length;d<p;d++){const g=u[d];c.push(g.toJSON(e.data))}c.length>0&&(r[l]=c,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone());const r=e.attributes;for(const u in r){const c=r[u];this.setAttribute(u,c.clone(t))}const s=e.morphAttributes;for(const u in s){const c=[],d=s[u];for(let p=0,g=d.length;p<g;p++)c.push(d[p].clone(t));this.morphAttributes[u]=c}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let u=0,c=a.length;u<c;u++){const d=a[u];this.addGroup(d.start,d.count,d.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const oo=new _t,Gn=new fc,gr=new Na,co=new z,_r=new z,vr=new z,xr=new z,Ss=new z,Sr=new z,lo=new z,Mr=new z;class ln extends Rt{constructor(e=new ii,t=new mc){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const r=t[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=r.length;s<a;s++){const o=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}getVertexPosition(e,t){const i=this.geometry,r=i.attributes.position,s=i.morphAttributes.position,a=i.morphTargetsRelative;t.fromBufferAttribute(r,e);const o=this.morphTargetInfluences;if(s&&o){Sr.set(0,0,0);for(let l=0,u=s.length;l<u;l++){const c=o[l],d=s[l];c!==0&&(Ss.fromBufferAttribute(d,e),a?Sr.addScaledVector(Ss,c):Sr.addScaledVector(Ss.sub(t),c))}t.add(Sr)}return t}raycast(e,t){const i=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),gr.copy(i.boundingSphere),gr.applyMatrix4(s),Gn.copy(e.ray).recast(e.near),!(gr.containsPoint(Gn.origin)===!1&&(Gn.intersectSphere(gr,co)===null||Gn.origin.distanceToSquared(co)>(e.far-e.near)**2))&&(oo.copy(s).invert(),Gn.copy(e.ray).applyMatrix4(oo),!(i.boundingBox!==null&&Gn.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,Gn)))}_computeIntersections(e,t,i){let r;const s=this.geometry,a=this.material,o=s.index,l=s.attributes.position,u=s.attributes.uv,c=s.attributes.uv1,d=s.attributes.normal,p=s.groups,g=s.drawRange;if(o!==null)if(Array.isArray(a))for(let v=0,M=p.length;v<M;v++){const m=p[v],h=a[m.materialIndex],T=Math.max(m.start,g.start),w=Math.min(o.count,Math.min(m.start+m.count,g.start+g.count));for(let b=T,B=w;b<B;b+=3){const P=o.getX(b),R=o.getX(b+1),D=o.getX(b+2);r=Er(this,h,e,i,u,c,d,P,R,D),r&&(r.faceIndex=Math.floor(b/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{const v=Math.max(0,g.start),M=Math.min(o.count,g.start+g.count);for(let m=v,h=M;m<h;m+=3){const T=o.getX(m),w=o.getX(m+1),b=o.getX(m+2);r=Er(this,a,e,i,u,c,d,T,w,b),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}else if(l!==void 0)if(Array.isArray(a))for(let v=0,M=p.length;v<M;v++){const m=p[v],h=a[m.materialIndex],T=Math.max(m.start,g.start),w=Math.min(l.count,Math.min(m.start+m.count,g.start+g.count));for(let b=T,B=w;b<B;b+=3){const P=b,R=b+1,D=b+2;r=Er(this,h,e,i,u,c,d,P,R,D),r&&(r.faceIndex=Math.floor(b/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{const v=Math.max(0,g.start),M=Math.min(l.count,g.start+g.count);for(let m=v,h=M;m<h;m+=3){const T=m,w=m+1,b=m+2;r=Er(this,a,e,i,u,c,d,T,w,b),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}}}function au(n,e,t,i,r,s,a,o){let l;if(e.side===Ft?l=i.intersectTriangle(a,s,r,!0,o):l=i.intersectTriangle(r,s,a,e.side===Nn,o),l===null)return null;Mr.copy(o),Mr.applyMatrix4(n.matrixWorld);const u=t.ray.origin.distanceTo(Mr);return u<t.near||u>t.far?null:{distance:u,point:Mr.clone(),object:n}}function Er(n,e,t,i,r,s,a,o,l,u){n.getVertexPosition(o,_r),n.getVertexPosition(l,vr),n.getVertexPosition(u,xr);const c=au(n,e,t,i,_r,vr,xr,lo);if(c){const d=new z;tn.getBarycoord(lo,_r,vr,xr,d),r&&(c.uv=tn.getInterpolatedAttribute(r,o,l,u,d,new He)),s&&(c.uv1=tn.getInterpolatedAttribute(s,o,l,u,d,new He)),a&&(c.normal=tn.getInterpolatedAttribute(a,o,l,u,d,new z),c.normal.dot(i.direction)>0&&c.normal.multiplyScalar(-1));const p={a:o,b:l,c:u,normal:new z,materialIndex:0};tn.getNormal(_r,vr,xr,p.normal),c.face=p,c.barycoord=d}return c}class Li extends ii{constructor(e=1,t=1,i=1,r=1,s=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:r,heightSegments:s,depthSegments:a};const o=this;r=Math.floor(r),s=Math.floor(s),a=Math.floor(a);const l=[],u=[],c=[],d=[];let p=0,g=0;v("z","y","x",-1,-1,i,t,e,a,s,0),v("z","y","x",1,-1,i,t,-e,a,s,1),v("x","z","y",1,1,e,i,t,r,a,2),v("x","z","y",1,-1,e,i,-t,r,a,3),v("x","y","z",1,-1,e,t,i,r,s,4),v("x","y","z",-1,-1,e,t,-i,r,s,5),this.setIndex(l),this.setAttribute("position",new Jn(u,3)),this.setAttribute("normal",new Jn(c,3)),this.setAttribute("uv",new Jn(d,2));function v(M,m,h,T,w,b,B,P,R,D,y){const E=b/R,U=B/D,Q=b/2,X=B/2,ie=P/2,Y=R+1,ee=D+1;let re=0,K=0;const C=new z;for(let $=0;$<ee;$++){const ve=$*U-X;for(let Ne=0;Ne<Y;Ne++){const it=Ne*E-Q;C[M]=it*T,C[m]=ve*w,C[h]=ie,u.push(C.x,C.y,C.z),C[M]=0,C[m]=0,C[h]=P>0?1:-1,c.push(C.x,C.y,C.z),d.push(Ne/R),d.push(1-$/D),re+=1}}for(let $=0;$<D;$++)for(let ve=0;ve<R;ve++){const Ne=p+ve+Y*$,it=p+ve+Y*($+1),j=p+(ve+1)+Y*($+1),se=p+(ve+1)+Y*$;l.push(Ne,it,se),l.push(it,j,se),K+=6}o.addGroup(g,K,y),g+=K,p+=re}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Li(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Pi(n){const e={};for(const t in n){e[t]={};for(const i in n[t]){const r=n[t][i];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=r.clone():Array.isArray(r)?e[t][i]=r.slice():e[t][i]=r}}return e}function Dt(n){const e={};for(let t=0;t<n.length;t++){const i=Pi(n[t]);for(const r in i)e[r]=i[r]}return e}function ou(n){const e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function vc(n){const e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:nt.workingColorSpace}const cu={clone:Pi,merge:Dt};var lu=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,uu=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Fn extends Ji{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=lu,this.fragmentShader=uu,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Pi(e.uniforms),this.uniformsGroups=ou(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const r in this.uniforms){const a=this.uniforms[r].value;a&&a.isTexture?t.uniforms[r]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[r]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[r]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[r]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[r]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[r]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[r]={type:"m4",value:a.toArray()}:t.uniforms[r]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const i={};for(const r in this.extensions)this.extensions[r]===!0&&(i[r]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}}class xc extends Rt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new _t,this.projectionMatrix=new _t,this.projectionMatrixInverse=new _t,this.coordinateSystem=Sn}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Cn=new z,uo=new He,ho=new He;class jt extends xc{constructor(e=50,t=1,i=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Ma*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Nr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Ma*2*Math.atan(Math.tan(Nr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){Cn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Cn.x,Cn.y).multiplyScalar(-e/Cn.z),Cn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Cn.x,Cn.y).multiplyScalar(-e/Cn.z)}getViewSize(e,t){return this.getViewBounds(e,uo,ho),t.subVectors(ho,uo)}setViewOffset(e,t,i,r,s,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Nr*.5*this.fov)/this.zoom,i=2*t,r=this.aspect*i,s=-.5*r;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,u=a.fullHeight;s+=a.offsetX*r/l,t-=a.offsetY*i/u,r*=a.width/l,i*=a.height/u}const o=this.filmOffset;o!==0&&(s+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,t,t-i,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const gi=-90,_i=1;class hu extends Rt{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const r=new jt(gi,_i,e,t);r.layers=this.layers,this.add(r);const s=new jt(gi,_i,e,t);s.layers=this.layers,this.add(s);const a=new jt(gi,_i,e,t);a.layers=this.layers,this.add(a);const o=new jt(gi,_i,e,t);o.layers=this.layers,this.add(o);const l=new jt(gi,_i,e,t);l.layers=this.layers,this.add(l);const u=new jt(gi,_i,e,t);u.layers=this.layers,this.add(u)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[i,r,s,a,o,l]=t;for(const u of t)this.remove(u);if(e===Sn)i.up.set(0,1,0),i.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===kr)i.up.set(0,-1,0),i.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const u of t)this.add(u),u.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[s,a,o,l,u,c]=this.children,d=e.getRenderTarget(),p=e.getActiveCubeFace(),g=e.getActiveMipmapLevel(),v=e.xr.enabled;e.xr.enabled=!1;const M=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,r),e.render(t,s),e.setRenderTarget(i,1,r),e.render(t,a),e.setRenderTarget(i,2,r),e.render(t,o),e.setRenderTarget(i,3,r),e.render(t,l),e.setRenderTarget(i,4,r),e.render(t,u),i.texture.generateMipmaps=M,e.setRenderTarget(i,5,r),e.render(t,c),e.setRenderTarget(d,p,g),e.xr.enabled=v,i.texture.needsPMREMUpdate=!0}}class Sc extends Ot{constructor(e=[],t=wi,i,r,s,a,o,l,u,c){super(e,t,i,r,s,a,o,l,u,c),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class fu extends ei{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},r=[i,i,i,i,i,i];this.texture=new Sc(r,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:cn}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new Li(5,5,5),s=new Fn({name:"CubemapFromEquirect",uniforms:Pi(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Ft,blending:Un});s.uniforms.tEquirect.value=t;const a=new ln(r,s),o=t.minFilter;return t.minFilter===Zn&&(t.minFilter=cn),new hu(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,i=!0,r=!0){const s=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,i,r);e.setRenderTarget(s)}}class yr extends Rt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const du={type:"move"};class Ms{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new yr,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new yr,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new z,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new z),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new yr,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new z,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new z),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let r=null,s=null,a=null;const o=this._targetRay,l=this._grip,u=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(u&&e.hand){a=!0;for(const M of e.hand.values()){const m=t.getJointPose(M,i),h=this._getHandJoint(u,M);m!==null&&(h.matrix.fromArray(m.transform.matrix),h.matrix.decompose(h.position,h.rotation,h.scale),h.matrixWorldNeedsUpdate=!0,h.jointRadius=m.radius),h.visible=m!==null}const c=u.joints["index-finger-tip"],d=u.joints["thumb-tip"],p=c.position.distanceTo(d.position),g=.02,v=.005;u.inputState.pinching&&p>g+v?(u.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!u.inputState.pinching&&p<=g-v&&(u.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,i),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(r=t.getPose(e.targetRaySpace,i),r===null&&s!==null&&(r=s),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(du)))}return o!==null&&(o.visible=r!==null),l!==null&&(l.visible=s!==null),u!==null&&(u.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const i=new yr;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}}class pu extends Rt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new hn,this.environmentIntensity=1,this.environmentRotation=new hn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}const Es=new z,mu=new z,gu=new Ve;class Pn{constructor(e=new z(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,r){return this.normal.set(e,t,i),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){const r=Es.subVectors(i,t).cross(mu.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const i=e.delta(Es),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const s=-(e.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:t.copy(e.start).addScaledVector(i,s)}intersectsLine(e){const t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const i=t||gu.getNormalMatrix(e),r=this.coplanarPoint(Es).applyMatrix4(e),s=this.normal.applyMatrix3(i).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Wn=new Na,br=new z;class Fa{constructor(e=new Pn,t=new Pn,i=new Pn,r=new Pn,s=new Pn,a=new Pn){this.planes=[e,t,i,r,s,a]}set(e,t,i,r,s,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(i),o[3].copy(r),o[4].copy(s),o[5].copy(a),this}copy(e){const t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=Sn){const i=this.planes,r=e.elements,s=r[0],a=r[1],o=r[2],l=r[3],u=r[4],c=r[5],d=r[6],p=r[7],g=r[8],v=r[9],M=r[10],m=r[11],h=r[12],T=r[13],w=r[14],b=r[15];if(i[0].setComponents(l-s,p-u,m-g,b-h).normalize(),i[1].setComponents(l+s,p+u,m+g,b+h).normalize(),i[2].setComponents(l+a,p+c,m+v,b+T).normalize(),i[3].setComponents(l-a,p-c,m-v,b-T).normalize(),i[4].setComponents(l-o,p-d,m-M,b-w).normalize(),t===Sn)i[5].setComponents(l+o,p+d,m+M,b+w).normalize();else if(t===kr)i[5].setComponents(o,d,M,w).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Wn.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Wn.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Wn)}intersectsSprite(e){return Wn.center.set(0,0,0),Wn.radius=.7071067811865476,Wn.applyMatrix4(e.matrixWorld),this.intersectsSphere(Wn)}intersectsSphere(e){const t=this.planes,i=e.center,r=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(i)<r)return!1;return!0}intersectsBox(e){const t=this.planes;for(let i=0;i<6;i++){const r=t[i];if(br.x=r.normal.x>0?e.max.x:e.min.x,br.y=r.normal.y>0?e.max.y:e.min.y,br.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(br)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class Mc extends Ot{constructor(e,t,i=Qn,r,s,a,o=rn,l=rn,u,c=Xi){if(c!==Xi&&c!==$i)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");super(null,r,s,a,o,l,c,i,u),this.isDepthTexture=!0,this.image={width:e,height:t},this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Ia(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class Gr extends ii{constructor(e=1,t=1,i=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:r};const s=e/2,a=t/2,o=Math.floor(i),l=Math.floor(r),u=o+1,c=l+1,d=e/o,p=t/l,g=[],v=[],M=[],m=[];for(let h=0;h<c;h++){const T=h*p-a;for(let w=0;w<u;w++){const b=w*d-s;v.push(b,-T,0),M.push(0,0,1),m.push(w/o),m.push(1-h/l)}}for(let h=0;h<l;h++)for(let T=0;T<o;T++){const w=T+u*h,b=T+u*(h+1),B=T+1+u*(h+1),P=T+1+u*h;g.push(w,b,P),g.push(b,B,P)}this.setIndex(g),this.setAttribute("position",new Jn(v,3)),this.setAttribute("normal",new Jn(M,3)),this.setAttribute("uv",new Jn(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Gr(e.width,e.height,e.widthSegments,e.heightSegments)}}class _u extends Ji{constructor(e){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new et(16777215),this.specular=new et(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new et(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=cc,this.normalScale=new He(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new hn,this.combine=wa,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.specular.copy(e.specular),this.shininess=e.shininess,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class vu extends Ji{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Rl,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class xu extends Ji{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}class Su extends Rt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new et(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}const ys=new _t,fo=new z,po=new z;class Mu{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new He(512,512),this.map=null,this.mapPass=null,this.matrix=new _t,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Fa,this._frameExtents=new He(1,1),this._viewportCount=1,this._viewports=[new gt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,i=this.matrix;fo.setFromMatrixPosition(e.matrixWorld),t.position.copy(fo),po.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(po),t.updateMatrixWorld(),ys.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(ys),i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(ys)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class Ec extends xc{constructor(e=-1,t=1,i=1,r=-1,s=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=r,this.near=s,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,r,s,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,r=(this.top+this.bottom)/2;let s=i-e,a=i+e,o=r+t,l=r-t;if(this.view!==null&&this.view.enabled){const u=(this.right-this.left)/this.view.fullWidth/this.zoom,c=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=u*this.view.offsetX,a=s+u*this.view.width,o-=c*this.view.offsetY,l=o-c*this.view.height}this.projectionMatrix.makeOrthographic(s,a,o,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class Eu extends Mu{constructor(){super(new Ec(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class mo extends Su{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Rt.DEFAULT_UP),this.updateMatrix(),this.target=new Rt,this.shadow=new Eu}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class yu extends jt{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e,this.index=0}}class go{constructor(e=1,t=0,i=0){this.radius=e,this.phi=t,this.theta=i}set(e,t,i){return this.radius=e,this.phi=t,this.theta=i,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=Xe(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,i){return this.radius=Math.sqrt(e*e+t*t+i*i),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,i),this.phi=Math.acos(Xe(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}class bu extends ni{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){if(e===void 0){console.warn("THREE.Controls: connect() now requires an element.");return}this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}}function _o(n,e,t,i){const r=Tu(i);switch(t){case tc:return n*e;case ic:return n*e;case rc:return n*e*2;case sc:return n*e/r.components*r.byteLength;case La:return n*e/r.components*r.byteLength;case ac:return n*e*2/r.components*r.byteLength;case Da:return n*e*2/r.components*r.byteLength;case nc:return n*e*3/r.components*r.byteLength;case nn:return n*e*4/r.components*r.byteLength;case Ua:return n*e*4/r.components*r.byteLength;case Pr:case Lr:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Dr:case Ur:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Ks:case Js:return Math.max(n,16)*Math.max(e,8)/4;case js:case Zs:return Math.max(n,8)*Math.max(e,8)/2;case Qs:case ea:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case ta:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case na:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case ia:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case ra:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case sa:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case aa:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case oa:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case ca:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case la:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case ua:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case ha:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case fa:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case da:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case pa:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case ma:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case Ir:case ga:case _a:return Math.ceil(n/4)*Math.ceil(e/4)*16;case oc:case va:return Math.ceil(n/4)*Math.ceil(e/4)*8;case xa:case Sa:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Tu(n){switch(n){case yn:case Jo:return{byteLength:1,components:1};case Gi:case Qo:case ji:return{byteLength:2,components:1};case Ca:case Pa:return{byteLength:2,components:4};case Qn:case Ra:case xn:return{byteLength:4,components:1};case ec:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${n}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Aa}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Aa);/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function yc(){let n=null,e=!1,t=null,i=null;function r(s,a){t(s,a),i=n.requestAnimationFrame(r)}return{start:function(){e!==!0&&t!==null&&(i=n.requestAnimationFrame(r),e=!0)},stop:function(){n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){n=s}}}function Au(n){const e=new WeakMap;function t(o,l){const u=o.array,c=o.usage,d=u.byteLength,p=n.createBuffer();n.bindBuffer(l,p),n.bufferData(l,u,c),o.onUploadCallback();let g;if(u instanceof Float32Array)g=n.FLOAT;else if(u instanceof Uint16Array)o.isFloat16BufferAttribute?g=n.HALF_FLOAT:g=n.UNSIGNED_SHORT;else if(u instanceof Int16Array)g=n.SHORT;else if(u instanceof Uint32Array)g=n.UNSIGNED_INT;else if(u instanceof Int32Array)g=n.INT;else if(u instanceof Int8Array)g=n.BYTE;else if(u instanceof Uint8Array)g=n.UNSIGNED_BYTE;else if(u instanceof Uint8ClampedArray)g=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+u);return{buffer:p,type:g,bytesPerElement:u.BYTES_PER_ELEMENT,version:o.version,size:d}}function i(o,l,u){const c=l.array,d=l.updateRanges;if(n.bindBuffer(u,o),d.length===0)n.bufferSubData(u,0,c);else{d.sort((g,v)=>g.start-v.start);let p=0;for(let g=1;g<d.length;g++){const v=d[p],M=d[g];M.start<=v.start+v.count+1?v.count=Math.max(v.count,M.start+M.count-v.start):(++p,d[p]=M)}d.length=p+1;for(let g=0,v=d.length;g<v;g++){const M=d[g];n.bufferSubData(u,M.start*c.BYTES_PER_ELEMENT,c,M.start,M.count)}l.clearUpdateRanges()}l.onUploadCallback()}function r(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function s(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=e.get(o);l&&(n.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const c=e.get(o);(!c||c.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const u=e.get(o);if(u===void 0)e.set(o,t(o,l));else if(u.version<o.version){if(u.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(u.buffer,o,l),u.version=o.version}}return{get:r,remove:s,update:a}}var wu=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Ru=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Cu=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Pu=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Lu=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Du=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Uu=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Iu=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Nu=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,Fu=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Ou=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Bu=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,zu=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,ku=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Vu=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Hu=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Gu=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Wu=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Xu=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,$u=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,qu=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Yu=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,ju=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,Ku=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Zu=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Ju=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Qu=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,eh=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,th=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,nh=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,ih="gl_FragColor = linearToOutputTexel( gl_FragColor );",rh=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,sh=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,ah=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,oh=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,ch=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,lh=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,uh=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,hh=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fh=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,dh=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,ph=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,mh=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,gh=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,_h=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,vh=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,xh=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Sh=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Mh=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Eh=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,yh=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,bh=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Th=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Ah=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,wh=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Rh=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Ch=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Ph=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Lh=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Dh=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Uh=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Ih=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Nh=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Fh=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Oh=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Bh=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,zh=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,kh=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Vh=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Hh=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Gh=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Wh=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Xh=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,$h=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,qh=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Yh=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,jh=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Kh=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Zh=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Jh=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Qh=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,ef=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,tf=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,nf=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,rf=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,sf=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,af=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,of=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,cf=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,lf=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,uf=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,hf=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,ff=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,df=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,pf=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,mf=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,gf=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,_f=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,vf=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,xf=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Sf=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Mf=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Ef=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,yf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,bf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Tf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Af=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const wf=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Rf=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Cf=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Pf=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Lf=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Df=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Uf=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,If=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Nf=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Ff=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,Of=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Bf=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,zf=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,kf=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Vf=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Hf=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Gf=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Wf=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Xf=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,$f=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,qf=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Yf=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,jf=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Kf=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Zf=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Jf=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Qf=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ed=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,td=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,nd=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,id=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,rd=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,sd=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,ad=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,We={alphahash_fragment:wu,alphahash_pars_fragment:Ru,alphamap_fragment:Cu,alphamap_pars_fragment:Pu,alphatest_fragment:Lu,alphatest_pars_fragment:Du,aomap_fragment:Uu,aomap_pars_fragment:Iu,batching_pars_vertex:Nu,batching_vertex:Fu,begin_vertex:Ou,beginnormal_vertex:Bu,bsdfs:zu,iridescence_fragment:ku,bumpmap_pars_fragment:Vu,clipping_planes_fragment:Hu,clipping_planes_pars_fragment:Gu,clipping_planes_pars_vertex:Wu,clipping_planes_vertex:Xu,color_fragment:$u,color_pars_fragment:qu,color_pars_vertex:Yu,color_vertex:ju,common:Ku,cube_uv_reflection_fragment:Zu,defaultnormal_vertex:Ju,displacementmap_pars_vertex:Qu,displacementmap_vertex:eh,emissivemap_fragment:th,emissivemap_pars_fragment:nh,colorspace_fragment:ih,colorspace_pars_fragment:rh,envmap_fragment:sh,envmap_common_pars_fragment:ah,envmap_pars_fragment:oh,envmap_pars_vertex:ch,envmap_physical_pars_fragment:xh,envmap_vertex:lh,fog_vertex:uh,fog_pars_vertex:hh,fog_fragment:fh,fog_pars_fragment:dh,gradientmap_pars_fragment:ph,lightmap_pars_fragment:mh,lights_lambert_fragment:gh,lights_lambert_pars_fragment:_h,lights_pars_begin:vh,lights_toon_fragment:Sh,lights_toon_pars_fragment:Mh,lights_phong_fragment:Eh,lights_phong_pars_fragment:yh,lights_physical_fragment:bh,lights_physical_pars_fragment:Th,lights_fragment_begin:Ah,lights_fragment_maps:wh,lights_fragment_end:Rh,logdepthbuf_fragment:Ch,logdepthbuf_pars_fragment:Ph,logdepthbuf_pars_vertex:Lh,logdepthbuf_vertex:Dh,map_fragment:Uh,map_pars_fragment:Ih,map_particle_fragment:Nh,map_particle_pars_fragment:Fh,metalnessmap_fragment:Oh,metalnessmap_pars_fragment:Bh,morphinstance_vertex:zh,morphcolor_vertex:kh,morphnormal_vertex:Vh,morphtarget_pars_vertex:Hh,morphtarget_vertex:Gh,normal_fragment_begin:Wh,normal_fragment_maps:Xh,normal_pars_fragment:$h,normal_pars_vertex:qh,normal_vertex:Yh,normalmap_pars_fragment:jh,clearcoat_normal_fragment_begin:Kh,clearcoat_normal_fragment_maps:Zh,clearcoat_pars_fragment:Jh,iridescence_pars_fragment:Qh,opaque_fragment:ef,packing:tf,premultiplied_alpha_fragment:nf,project_vertex:rf,dithering_fragment:sf,dithering_pars_fragment:af,roughnessmap_fragment:of,roughnessmap_pars_fragment:cf,shadowmap_pars_fragment:lf,shadowmap_pars_vertex:uf,shadowmap_vertex:hf,shadowmask_pars_fragment:ff,skinbase_vertex:df,skinning_pars_vertex:pf,skinning_vertex:mf,skinnormal_vertex:gf,specularmap_fragment:_f,specularmap_pars_fragment:vf,tonemapping_fragment:xf,tonemapping_pars_fragment:Sf,transmission_fragment:Mf,transmission_pars_fragment:Ef,uv_pars_fragment:yf,uv_pars_vertex:bf,uv_vertex:Tf,worldpos_vertex:Af,background_vert:wf,background_frag:Rf,backgroundCube_vert:Cf,backgroundCube_frag:Pf,cube_vert:Lf,cube_frag:Df,depth_vert:Uf,depth_frag:If,distanceRGBA_vert:Nf,distanceRGBA_frag:Ff,equirect_vert:Of,equirect_frag:Bf,linedashed_vert:zf,linedashed_frag:kf,meshbasic_vert:Vf,meshbasic_frag:Hf,meshlambert_vert:Gf,meshlambert_frag:Wf,meshmatcap_vert:Xf,meshmatcap_frag:$f,meshnormal_vert:qf,meshnormal_frag:Yf,meshphong_vert:jf,meshphong_frag:Kf,meshphysical_vert:Zf,meshphysical_frag:Jf,meshtoon_vert:Qf,meshtoon_frag:ed,points_vert:td,points_frag:nd,shadow_vert:id,shadow_frag:rd,sprite_vert:sd,sprite_frag:ad},de={common:{diffuse:{value:new et(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ve},alphaMap:{value:null},alphaMapTransform:{value:new Ve},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ve}},envmap:{envMap:{value:null},envMapRotation:{value:new Ve},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ve}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ve}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ve},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ve},normalScale:{value:new He(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ve},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ve}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ve}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ve}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new et(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new et(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ve},alphaTest:{value:0},uvTransform:{value:new Ve}},sprite:{diffuse:{value:new et(16777215)},opacity:{value:1},center:{value:new He(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ve},alphaMap:{value:null},alphaMapTransform:{value:new Ve},alphaTest:{value:0}}},an={basic:{uniforms:Dt([de.common,de.specularmap,de.envmap,de.aomap,de.lightmap,de.fog]),vertexShader:We.meshbasic_vert,fragmentShader:We.meshbasic_frag},lambert:{uniforms:Dt([de.common,de.specularmap,de.envmap,de.aomap,de.lightmap,de.emissivemap,de.bumpmap,de.normalmap,de.displacementmap,de.fog,de.lights,{emissive:{value:new et(0)}}]),vertexShader:We.meshlambert_vert,fragmentShader:We.meshlambert_frag},phong:{uniforms:Dt([de.common,de.specularmap,de.envmap,de.aomap,de.lightmap,de.emissivemap,de.bumpmap,de.normalmap,de.displacementmap,de.fog,de.lights,{emissive:{value:new et(0)},specular:{value:new et(1118481)},shininess:{value:30}}]),vertexShader:We.meshphong_vert,fragmentShader:We.meshphong_frag},standard:{uniforms:Dt([de.common,de.envmap,de.aomap,de.lightmap,de.emissivemap,de.bumpmap,de.normalmap,de.displacementmap,de.roughnessmap,de.metalnessmap,de.fog,de.lights,{emissive:{value:new et(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:We.meshphysical_vert,fragmentShader:We.meshphysical_frag},toon:{uniforms:Dt([de.common,de.aomap,de.lightmap,de.emissivemap,de.bumpmap,de.normalmap,de.displacementmap,de.gradientmap,de.fog,de.lights,{emissive:{value:new et(0)}}]),vertexShader:We.meshtoon_vert,fragmentShader:We.meshtoon_frag},matcap:{uniforms:Dt([de.common,de.bumpmap,de.normalmap,de.displacementmap,de.fog,{matcap:{value:null}}]),vertexShader:We.meshmatcap_vert,fragmentShader:We.meshmatcap_frag},points:{uniforms:Dt([de.points,de.fog]),vertexShader:We.points_vert,fragmentShader:We.points_frag},dashed:{uniforms:Dt([de.common,de.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:We.linedashed_vert,fragmentShader:We.linedashed_frag},depth:{uniforms:Dt([de.common,de.displacementmap]),vertexShader:We.depth_vert,fragmentShader:We.depth_frag},normal:{uniforms:Dt([de.common,de.bumpmap,de.normalmap,de.displacementmap,{opacity:{value:1}}]),vertexShader:We.meshnormal_vert,fragmentShader:We.meshnormal_frag},sprite:{uniforms:Dt([de.sprite,de.fog]),vertexShader:We.sprite_vert,fragmentShader:We.sprite_frag},background:{uniforms:{uvTransform:{value:new Ve},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:We.background_vert,fragmentShader:We.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ve}},vertexShader:We.backgroundCube_vert,fragmentShader:We.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:We.cube_vert,fragmentShader:We.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:We.equirect_vert,fragmentShader:We.equirect_frag},distanceRGBA:{uniforms:Dt([de.common,de.displacementmap,{referencePosition:{value:new z},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:We.distanceRGBA_vert,fragmentShader:We.distanceRGBA_frag},shadow:{uniforms:Dt([de.lights,de.fog,{color:{value:new et(0)},opacity:{value:1}}]),vertexShader:We.shadow_vert,fragmentShader:We.shadow_frag}};an.physical={uniforms:Dt([an.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ve},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ve},clearcoatNormalScale:{value:new He(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ve},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ve},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ve},sheen:{value:0},sheenColor:{value:new et(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ve},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ve},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ve},transmissionSamplerSize:{value:new He},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ve},attenuationDistance:{value:0},attenuationColor:{value:new et(0)},specularColor:{value:new et(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ve},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ve},anisotropyVector:{value:new He},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ve}}]),vertexShader:We.meshphysical_vert,fragmentShader:We.meshphysical_frag};const Tr={r:0,b:0,g:0},Xn=new hn,od=new _t;function cd(n,e,t,i,r,s,a){const o=new et(0);let l=s===!0?0:1,u,c,d=null,p=0,g=null;function v(w){let b=w.isScene===!0?w.background:null;return b&&b.isTexture&&(b=(w.backgroundBlurriness>0?t:e).get(b)),b}function M(w){let b=!1;const B=v(w);B===null?h(o,l):B&&B.isColor&&(h(B,1),b=!0);const P=n.xr.getEnvironmentBlendMode();P==="additive"?i.buffers.color.setClear(0,0,0,1,a):P==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,a),(n.autoClear||b)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function m(w,b){const B=v(b);B&&(B.isCubeTexture||B.mapping===Hr)?(c===void 0&&(c=new ln(new Li(1,1,1),new Fn({name:"BackgroundCubeMaterial",uniforms:Pi(an.backgroundCube.uniforms),vertexShader:an.backgroundCube.vertexShader,fragmentShader:an.backgroundCube.fragmentShader,side:Ft,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(P,R,D){this.matrixWorld.copyPosition(D.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(c)),Xn.copy(b.backgroundRotation),Xn.x*=-1,Xn.y*=-1,Xn.z*=-1,B.isCubeTexture&&B.isRenderTargetTexture===!1&&(Xn.y*=-1,Xn.z*=-1),c.material.uniforms.envMap.value=B,c.material.uniforms.flipEnvMap.value=B.isCubeTexture&&B.isRenderTargetTexture===!1?-1:1,c.material.uniforms.backgroundBlurriness.value=b.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(od.makeRotationFromEuler(Xn)),c.material.toneMapped=nt.getTransfer(B.colorSpace)!==at,(d!==B||p!==B.version||g!==n.toneMapping)&&(c.material.needsUpdate=!0,d=B,p=B.version,g=n.toneMapping),c.layers.enableAll(),w.unshift(c,c.geometry,c.material,0,0,null)):B&&B.isTexture&&(u===void 0&&(u=new ln(new Gr(2,2),new Fn({name:"BackgroundMaterial",uniforms:Pi(an.background.uniforms),vertexShader:an.background.vertexShader,fragmentShader:an.background.fragmentShader,side:Nn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute("normal"),Object.defineProperty(u.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(u)),u.material.uniforms.t2D.value=B,u.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,u.material.toneMapped=nt.getTransfer(B.colorSpace)!==at,B.matrixAutoUpdate===!0&&B.updateMatrix(),u.material.uniforms.uvTransform.value.copy(B.matrix),(d!==B||p!==B.version||g!==n.toneMapping)&&(u.material.needsUpdate=!0,d=B,p=B.version,g=n.toneMapping),u.layers.enableAll(),w.unshift(u,u.geometry,u.material,0,0,null))}function h(w,b){w.getRGB(Tr,vc(n)),i.buffers.color.setClear(Tr.r,Tr.g,Tr.b,b,a)}function T(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0)}return{getClearColor:function(){return o},setClearColor:function(w,b=1){o.set(w),l=b,h(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(w){l=w,h(o,l)},render:M,addToRenderList:m,dispose:T}}function ld(n,e){const t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},r=p(null);let s=r,a=!1;function o(E,U,Q,X,ie){let Y=!1;const ee=d(X,Q,U);s!==ee&&(s=ee,u(s.object)),Y=g(E,X,Q,ie),Y&&v(E,X,Q,ie),ie!==null&&e.update(ie,n.ELEMENT_ARRAY_BUFFER),(Y||a)&&(a=!1,b(E,U,Q,X),ie!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(ie).buffer))}function l(){return n.createVertexArray()}function u(E){return n.bindVertexArray(E)}function c(E){return n.deleteVertexArray(E)}function d(E,U,Q){const X=Q.wireframe===!0;let ie=i[E.id];ie===void 0&&(ie={},i[E.id]=ie);let Y=ie[U.id];Y===void 0&&(Y={},ie[U.id]=Y);let ee=Y[X];return ee===void 0&&(ee=p(l()),Y[X]=ee),ee}function p(E){const U=[],Q=[],X=[];for(let ie=0;ie<t;ie++)U[ie]=0,Q[ie]=0,X[ie]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:U,enabledAttributes:Q,attributeDivisors:X,object:E,attributes:{},index:null}}function g(E,U,Q,X){const ie=s.attributes,Y=U.attributes;let ee=0;const re=Q.getAttributes();for(const K in re)if(re[K].location>=0){const $=ie[K];let ve=Y[K];if(ve===void 0&&(K==="instanceMatrix"&&E.instanceMatrix&&(ve=E.instanceMatrix),K==="instanceColor"&&E.instanceColor&&(ve=E.instanceColor)),$===void 0||$.attribute!==ve||ve&&$.data!==ve.data)return!0;ee++}return s.attributesNum!==ee||s.index!==X}function v(E,U,Q,X){const ie={},Y=U.attributes;let ee=0;const re=Q.getAttributes();for(const K in re)if(re[K].location>=0){let $=Y[K];$===void 0&&(K==="instanceMatrix"&&E.instanceMatrix&&($=E.instanceMatrix),K==="instanceColor"&&E.instanceColor&&($=E.instanceColor));const ve={};ve.attribute=$,$&&$.data&&(ve.data=$.data),ie[K]=ve,ee++}s.attributes=ie,s.attributesNum=ee,s.index=X}function M(){const E=s.newAttributes;for(let U=0,Q=E.length;U<Q;U++)E[U]=0}function m(E){h(E,0)}function h(E,U){const Q=s.newAttributes,X=s.enabledAttributes,ie=s.attributeDivisors;Q[E]=1,X[E]===0&&(n.enableVertexAttribArray(E),X[E]=1),ie[E]!==U&&(n.vertexAttribDivisor(E,U),ie[E]=U)}function T(){const E=s.newAttributes,U=s.enabledAttributes;for(let Q=0,X=U.length;Q<X;Q++)U[Q]!==E[Q]&&(n.disableVertexAttribArray(Q),U[Q]=0)}function w(E,U,Q,X,ie,Y,ee){ee===!0?n.vertexAttribIPointer(E,U,Q,ie,Y):n.vertexAttribPointer(E,U,Q,X,ie,Y)}function b(E,U,Q,X){M();const ie=X.attributes,Y=Q.getAttributes(),ee=U.defaultAttributeValues;for(const re in Y){const K=Y[re];if(K.location>=0){let C=ie[re];if(C===void 0&&(re==="instanceMatrix"&&E.instanceMatrix&&(C=E.instanceMatrix),re==="instanceColor"&&E.instanceColor&&(C=E.instanceColor)),C!==void 0){const $=C.normalized,ve=C.itemSize,Ne=e.get(C);if(Ne===void 0)continue;const it=Ne.buffer,j=Ne.type,se=Ne.bytesPerElement,pe=j===n.INT||j===n.UNSIGNED_INT||C.gpuType===Ra;if(C.isInterleavedBufferAttribute){const ue=C.data,Re=ue.stride,Ze=C.offset;if(ue.isInstancedInterleavedBuffer){for(let Le=0;Le<K.locationSize;Le++)h(K.location+Le,ue.meshPerAttribute);E.isInstancedMesh!==!0&&X._maxInstanceCount===void 0&&(X._maxInstanceCount=ue.meshPerAttribute*ue.count)}else for(let Le=0;Le<K.locationSize;Le++)m(K.location+Le);n.bindBuffer(n.ARRAY_BUFFER,it);for(let Le=0;Le<K.locationSize;Le++)w(K.location+Le,ve/K.locationSize,j,$,Re*se,(Ze+ve/K.locationSize*Le)*se,pe)}else{if(C.isInstancedBufferAttribute){for(let ue=0;ue<K.locationSize;ue++)h(K.location+ue,C.meshPerAttribute);E.isInstancedMesh!==!0&&X._maxInstanceCount===void 0&&(X._maxInstanceCount=C.meshPerAttribute*C.count)}else for(let ue=0;ue<K.locationSize;ue++)m(K.location+ue);n.bindBuffer(n.ARRAY_BUFFER,it);for(let ue=0;ue<K.locationSize;ue++)w(K.location+ue,ve/K.locationSize,j,$,ve*se,ve/K.locationSize*ue*se,pe)}}else if(ee!==void 0){const $=ee[re];if($!==void 0)switch($.length){case 2:n.vertexAttrib2fv(K.location,$);break;case 3:n.vertexAttrib3fv(K.location,$);break;case 4:n.vertexAttrib4fv(K.location,$);break;default:n.vertexAttrib1fv(K.location,$)}}}}T()}function B(){D();for(const E in i){const U=i[E];for(const Q in U){const X=U[Q];for(const ie in X)c(X[ie].object),delete X[ie];delete U[Q]}delete i[E]}}function P(E){if(i[E.id]===void 0)return;const U=i[E.id];for(const Q in U){const X=U[Q];for(const ie in X)c(X[ie].object),delete X[ie];delete U[Q]}delete i[E.id]}function R(E){for(const U in i){const Q=i[U];if(Q[E.id]===void 0)continue;const X=Q[E.id];for(const ie in X)c(X[ie].object),delete X[ie];delete Q[E.id]}}function D(){y(),a=!0,s!==r&&(s=r,u(s.object))}function y(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:o,reset:D,resetDefaultState:y,dispose:B,releaseStatesOfGeometry:P,releaseStatesOfProgram:R,initAttributes:M,enableAttribute:m,disableUnusedAttributes:T}}function ud(n,e,t){let i;function r(u){i=u}function s(u,c){n.drawArrays(i,u,c),t.update(c,i,1)}function a(u,c,d){d!==0&&(n.drawArraysInstanced(i,u,c,d),t.update(c,i,d))}function o(u,c,d){if(d===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,u,0,c,0,d);let g=0;for(let v=0;v<d;v++)g+=c[v];t.update(g,i,1)}function l(u,c,d,p){if(d===0)return;const g=e.get("WEBGL_multi_draw");if(g===null)for(let v=0;v<u.length;v++)a(u[v],c[v],p[v]);else{g.multiDrawArraysInstancedWEBGL(i,u,0,c,0,p,0,d);let v=0;for(let M=0;M<d;M++)v+=c[M]*p[M];t.update(v,i,1)}}this.setMode=r,this.render=s,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function hd(n,e,t,i){let r;function s(){if(r!==void 0)return r;if(e.has("EXT_texture_filter_anisotropic")===!0){const R=e.get("EXT_texture_filter_anisotropic");r=n.getParameter(R.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function a(R){return!(R!==nn&&i.convert(R)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(R){const D=R===ji&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(R!==yn&&i.convert(R)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&R!==xn&&!D)}function l(R){if(R==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";R="mediump"}return R==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let u=t.precision!==void 0?t.precision:"highp";const c=l(u);c!==u&&(console.warn("THREE.WebGLRenderer:",u,"not supported, using",c,"instead."),u=c);const d=t.logarithmicDepthBuffer===!0,p=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),g=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),v=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),M=n.getParameter(n.MAX_TEXTURE_SIZE),m=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),h=n.getParameter(n.MAX_VERTEX_ATTRIBS),T=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),w=n.getParameter(n.MAX_VARYING_VECTORS),b=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),B=v>0,P=n.getParameter(n.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:u,logarithmicDepthBuffer:d,reverseDepthBuffer:p,maxTextures:g,maxVertexTextures:v,maxTextureSize:M,maxCubemapSize:m,maxAttributes:h,maxVertexUniforms:T,maxVaryings:w,maxFragmentUniforms:b,vertexTextures:B,maxSamples:P}}function fd(n){const e=this;let t=null,i=0,r=!1,s=!1;const a=new Pn,o=new Ve,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,p){const g=d.length!==0||p||i!==0||r;return r=p,i=d.length,g},this.beginShadows=function(){s=!0,c(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(d,p){t=c(d,p,0)},this.setState=function(d,p,g){const v=d.clippingPlanes,M=d.clipIntersection,m=d.clipShadows,h=n.get(d);if(!r||v===null||v.length===0||s&&!m)s?c(null):u();else{const T=s?0:i,w=T*4;let b=h.clippingState||null;l.value=b,b=c(v,p,w,g);for(let B=0;B!==w;++B)b[B]=t[B];h.clippingState=b,this.numIntersection=M?this.numPlanes:0,this.numPlanes+=T}};function u(){l.value!==t&&(l.value=t,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function c(d,p,g,v){const M=d!==null?d.length:0;let m=null;if(M!==0){if(m=l.value,v!==!0||m===null){const h=g+M*4,T=p.matrixWorldInverse;o.getNormalMatrix(T),(m===null||m.length<h)&&(m=new Float32Array(h));for(let w=0,b=g;w!==M;++w,b+=4)a.copy(d[w]).applyMatrix4(T,o),a.normal.toArray(m,b),m[b+3]=a.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=M,e.numIntersection=0,m}}function dd(n){let e=new WeakMap;function t(a,o){return o===Xs?a.mapping=wi:o===$s&&(a.mapping=Ri),a}function i(a){if(a&&a.isTexture){const o=a.mapping;if(o===Xs||o===$s)if(e.has(a)){const l=e.get(a).texture;return t(l,a.mapping)}else{const l=a.image;if(l&&l.height>0){const u=new fu(l.height);return u.fromEquirectangularTexture(n,a),e.set(a,u),a.addEventListener("dispose",r),t(u.texture,a.mapping)}else return null}}return a}function r(a){const o=a.target;o.removeEventListener("dispose",r);const l=e.get(o);l!==void 0&&(e.delete(o),l.dispose())}function s(){e=new WeakMap}return{get:i,dispose:s}}const Si=4,vo=[.125,.215,.35,.446,.526,.582],jn=20,bs=new Ec,xo=new et;let Ts=null,As=0,ws=0,Rs=!1;const qn=(1+Math.sqrt(5))/2,vi=1/qn,So=[new z(-qn,vi,0),new z(qn,vi,0),new z(-vi,0,qn),new z(vi,0,qn),new z(0,qn,-vi),new z(0,qn,vi),new z(-1,1,-1),new z(1,1,-1),new z(-1,1,1),new z(1,1,1)],pd=new z;class Mo{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,i=.1,r=100,s={}){const{size:a=256,position:o=pd}=s;Ts=this._renderer.getRenderTarget(),As=this._renderer.getActiveCubeFace(),ws=this._renderer.getActiveMipmapLevel(),Rs=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);const l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,i,r,l,o),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=bo(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=yo(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Ts,As,ws),this._renderer.xr.enabled=Rs,e.scissorTest=!1,Ar(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===wi||e.mapping===Ri?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Ts=this._renderer.getRenderTarget(),As=this._renderer.getActiveCubeFace(),ws=this._renderer.getActiveMipmapLevel(),Rs=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:cn,minFilter:cn,generateMipmaps:!1,type:ji,format:nn,colorSpace:Ci,depthBuffer:!1},r=Eo(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Eo(e,t,i);const{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=md(s)),this._blurMaterial=gd(s,e,t)}return r}_compileMaterial(e){const t=new ln(this._lodPlanes[0],e);this._renderer.compile(t,bs)}_sceneToCubeUV(e,t,i,r,s){const l=new jt(90,1,t,i),u=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],d=this._renderer,p=d.autoClear,g=d.toneMapping;d.getClearColor(xo),d.toneMapping=In,d.autoClear=!1;const v=new mc({name:"PMREM.Background",side:Ft,depthWrite:!1,depthTest:!1}),M=new ln(new Li,v);let m=!1;const h=e.background;h?h.isColor&&(v.color.copy(h),e.background=null,m=!0):(v.color.copy(xo),m=!0);for(let T=0;T<6;T++){const w=T%3;w===0?(l.up.set(0,u[T],0),l.position.set(s.x,s.y,s.z),l.lookAt(s.x+c[T],s.y,s.z)):w===1?(l.up.set(0,0,u[T]),l.position.set(s.x,s.y,s.z),l.lookAt(s.x,s.y+c[T],s.z)):(l.up.set(0,u[T],0),l.position.set(s.x,s.y,s.z),l.lookAt(s.x,s.y,s.z+c[T]));const b=this._cubeSize;Ar(r,w*b,T>2?b:0,b,b),d.setRenderTarget(r),m&&d.render(M,l),d.render(e,l)}M.geometry.dispose(),M.material.dispose(),d.toneMapping=g,d.autoClear=p,e.background=h}_textureToCubeUV(e,t){const i=this._renderer,r=e.mapping===wi||e.mapping===Ri;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=bo()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=yo());const s=r?this._cubemapMaterial:this._equirectMaterial,a=new ln(this._lodPlanes[0],s),o=s.uniforms;o.envMap.value=e;const l=this._cubeSize;Ar(t,0,0,3*l,2*l),i.setRenderTarget(t),i.render(a,bs)}_applyPMREM(e){const t=this._renderer,i=t.autoClear;t.autoClear=!1;const r=this._lodPlanes.length;for(let s=1;s<r;s++){const a=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),o=So[(r-s-1)%So.length];this._blur(e,s-1,s,a,o)}t.autoClear=i}_blur(e,t,i,r,s){const a=this._pingPongRenderTarget;this._halfBlur(e,a,t,i,r,"latitudinal",s),this._halfBlur(a,e,i,i,r,"longitudinal",s)}_halfBlur(e,t,i,r,s,a,o){const l=this._renderer,u=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const c=3,d=new ln(this._lodPlanes[r],u),p=u.uniforms,g=this._sizeLods[i]-1,v=isFinite(s)?Math.PI/(2*g):2*Math.PI/(2*jn-1),M=s/v,m=isFinite(s)?1+Math.floor(c*M):jn;m>jn&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${jn}`);const h=[];let T=0;for(let R=0;R<jn;++R){const D=R/M,y=Math.exp(-D*D/2);h.push(y),R===0?T+=y:R<m&&(T+=2*y)}for(let R=0;R<h.length;R++)h[R]=h[R]/T;p.envMap.value=e.texture,p.samples.value=m,p.weights.value=h,p.latitudinal.value=a==="latitudinal",o&&(p.poleAxis.value=o);const{_lodMax:w}=this;p.dTheta.value=v,p.mipInt.value=w-i;const b=this._sizeLods[r],B=3*b*(r>w-Si?r-w+Si:0),P=4*(this._cubeSize-b);Ar(t,B,P,3*b,2*b),l.setRenderTarget(t),l.render(d,bs)}}function md(n){const e=[],t=[],i=[];let r=n;const s=n-Si+1+vo.length;for(let a=0;a<s;a++){const o=Math.pow(2,r);t.push(o);let l=1/o;a>n-Si?l=vo[a-n+Si-1]:a===0&&(l=0),i.push(l);const u=1/(o-2),c=-u,d=1+u,p=[c,c,d,c,d,d,c,c,d,d,c,d],g=6,v=6,M=3,m=2,h=1,T=new Float32Array(M*v*g),w=new Float32Array(m*v*g),b=new Float32Array(h*v*g);for(let P=0;P<g;P++){const R=P%3*2/3-1,D=P>2?0:-1,y=[R,D,0,R+2/3,D,0,R+2/3,D+1,0,R,D,0,R+2/3,D+1,0,R,D+1,0];T.set(y,M*v*P),w.set(p,m*v*P);const E=[P,P,P,P,P,P];b.set(E,h*v*P)}const B=new ii;B.setAttribute("position",new un(T,M)),B.setAttribute("uv",new un(w,m)),B.setAttribute("faceIndex",new un(b,h)),e.push(B),r>Si&&r--}return{lodPlanes:e,sizeLods:t,sigmas:i}}function Eo(n,e,t){const i=new ei(n,e,t);return i.texture.mapping=Hr,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Ar(n,e,t,i,r){n.viewport.set(e,t,i,r),n.scissor.set(e,t,i,r)}function gd(n,e,t){const i=new Float32Array(jn),r=new z(0,1,0);return new Fn({name:"SphericalGaussianBlur",defines:{n:jn,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:Oa(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Un,depthTest:!1,depthWrite:!1})}function yo(){return new Fn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Oa(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Un,depthTest:!1,depthWrite:!1})}function bo(){return new Fn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Oa(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Un,depthTest:!1,depthWrite:!1})}function Oa(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function _d(n){let e=new WeakMap,t=null;function i(o){if(o&&o.isTexture){const l=o.mapping,u=l===Xs||l===$s,c=l===wi||l===Ri;if(u||c){let d=e.get(o);const p=d!==void 0?d.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==p)return t===null&&(t=new Mo(n)),d=u?t.fromEquirectangular(o,d):t.fromCubemap(o,d),d.texture.pmremVersion=o.pmremVersion,e.set(o,d),d.texture;if(d!==void 0)return d.texture;{const g=o.image;return u&&g&&g.height>0||c&&g&&r(g)?(t===null&&(t=new Mo(n)),d=u?t.fromEquirectangular(o):t.fromCubemap(o),d.texture.pmremVersion=o.pmremVersion,e.set(o,d),o.addEventListener("dispose",s),d.texture):null}}}return o}function r(o){let l=0;const u=6;for(let c=0;c<u;c++)o[c]!==void 0&&l++;return l===u}function s(o){const l=o.target;l.removeEventListener("dispose",s);const u=e.get(l);u!==void 0&&(e.delete(l),u.dispose())}function a(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:a}}function vd(n){const e={};function t(i){if(e[i]!==void 0)return e[i];let r;switch(i){case"WEBGL_depth_texture":r=n.getExtension("WEBGL_depth_texture")||n.getExtension("MOZ_WEBGL_depth_texture")||n.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=n.getExtension("EXT_texture_filter_anisotropic")||n.getExtension("MOZ_EXT_texture_filter_anisotropic")||n.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=n.getExtension("WEBGL_compressed_texture_s3tc")||n.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=n.getExtension("WEBGL_compressed_texture_pvrtc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=n.getExtension(i)}return e[i]=r,r}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){const r=t(i);return r===null&&Fr("THREE.WebGLRenderer: "+i+" extension not supported."),r}}}function xd(n,e,t,i){const r={},s=new WeakMap;function a(d){const p=d.target;p.index!==null&&e.remove(p.index);for(const v in p.attributes)e.remove(p.attributes[v]);p.removeEventListener("dispose",a),delete r[p.id];const g=s.get(p);g&&(e.remove(g),s.delete(p)),i.releaseStatesOfGeometry(p),p.isInstancedBufferGeometry===!0&&delete p._maxInstanceCount,t.memory.geometries--}function o(d,p){return r[p.id]===!0||(p.addEventListener("dispose",a),r[p.id]=!0,t.memory.geometries++),p}function l(d){const p=d.attributes;for(const g in p)e.update(p[g],n.ARRAY_BUFFER)}function u(d){const p=[],g=d.index,v=d.attributes.position;let M=0;if(g!==null){const T=g.array;M=g.version;for(let w=0,b=T.length;w<b;w+=3){const B=T[w+0],P=T[w+1],R=T[w+2];p.push(B,P,P,R,R,B)}}else if(v!==void 0){const T=v.array;M=v.version;for(let w=0,b=T.length/3-1;w<b;w+=3){const B=w+0,P=w+1,R=w+2;p.push(B,P,P,R,R,B)}}else return;const m=new(uc(p)?_c:gc)(p,1);m.version=M;const h=s.get(d);h&&e.remove(h),s.set(d,m)}function c(d){const p=s.get(d);if(p){const g=d.index;g!==null&&p.version<g.version&&u(d)}else u(d);return s.get(d)}return{get:o,update:l,getWireframeAttribute:c}}function Sd(n,e,t){let i;function r(p){i=p}let s,a;function o(p){s=p.type,a=p.bytesPerElement}function l(p,g){n.drawElements(i,g,s,p*a),t.update(g,i,1)}function u(p,g,v){v!==0&&(n.drawElementsInstanced(i,g,s,p*a,v),t.update(g,i,v))}function c(p,g,v){if(v===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,g,0,s,p,0,v);let m=0;for(let h=0;h<v;h++)m+=g[h];t.update(m,i,1)}function d(p,g,v,M){if(v===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let h=0;h<p.length;h++)u(p[h]/a,g[h],M[h]);else{m.multiDrawElementsInstancedWEBGL(i,g,0,s,p,0,M,0,v);let h=0;for(let T=0;T<v;T++)h+=g[T]*M[T];t.update(h,i,1)}}this.setMode=r,this.setIndex=o,this.render=l,this.renderInstances=u,this.renderMultiDraw=c,this.renderMultiDrawInstances=d}function Md(n){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(s,a,o){switch(t.calls++,a){case n.TRIANGLES:t.triangles+=o*(s/3);break;case n.LINES:t.lines+=o*(s/2);break;case n.LINE_STRIP:t.lines+=o*(s-1);break;case n.LINE_LOOP:t.lines+=o*s;break;case n.POINTS:t.points+=o*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:i}}function Ed(n,e,t){const i=new WeakMap,r=new gt;function s(a,o,l){const u=a.morphTargetInfluences,c=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,d=c!==void 0?c.length:0;let p=i.get(o);if(p===void 0||p.count!==d){let E=function(){D.dispose(),i.delete(o),o.removeEventListener("dispose",E)};var g=E;p!==void 0&&p.texture.dispose();const v=o.morphAttributes.position!==void 0,M=o.morphAttributes.normal!==void 0,m=o.morphAttributes.color!==void 0,h=o.morphAttributes.position||[],T=o.morphAttributes.normal||[],w=o.morphAttributes.color||[];let b=0;v===!0&&(b=1),M===!0&&(b=2),m===!0&&(b=3);let B=o.attributes.position.count*b,P=1;B>e.maxTextureSize&&(P=Math.ceil(B/e.maxTextureSize),B=e.maxTextureSize);const R=new Float32Array(B*P*4*d),D=new hc(R,B,P,d);D.type=xn,D.needsUpdate=!0;const y=b*4;for(let U=0;U<d;U++){const Q=h[U],X=T[U],ie=w[U],Y=B*P*4*U;for(let ee=0;ee<Q.count;ee++){const re=ee*y;v===!0&&(r.fromBufferAttribute(Q,ee),R[Y+re+0]=r.x,R[Y+re+1]=r.y,R[Y+re+2]=r.z,R[Y+re+3]=0),M===!0&&(r.fromBufferAttribute(X,ee),R[Y+re+4]=r.x,R[Y+re+5]=r.y,R[Y+re+6]=r.z,R[Y+re+7]=0),m===!0&&(r.fromBufferAttribute(ie,ee),R[Y+re+8]=r.x,R[Y+re+9]=r.y,R[Y+re+10]=r.z,R[Y+re+11]=ie.itemSize===4?r.w:1)}}p={count:d,texture:D,size:new He(B,P)},i.set(o,p),o.addEventListener("dispose",E)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(n,"morphTexture",a.morphTexture,t);else{let v=0;for(let m=0;m<u.length;m++)v+=u[m];const M=o.morphTargetsRelative?1:1-v;l.getUniforms().setValue(n,"morphTargetBaseInfluence",M),l.getUniforms().setValue(n,"morphTargetInfluences",u)}l.getUniforms().setValue(n,"morphTargetsTexture",p.texture,t),l.getUniforms().setValue(n,"morphTargetsTextureSize",p.size)}return{update:s}}function yd(n,e,t,i){let r=new WeakMap;function s(l){const u=i.render.frame,c=l.geometry,d=e.get(l,c);if(r.get(d)!==u&&(e.update(d),r.set(d,u)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),r.get(l)!==u&&(t.update(l.instanceMatrix,n.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,n.ARRAY_BUFFER),r.set(l,u))),l.isSkinnedMesh){const p=l.skeleton;r.get(p)!==u&&(p.update(),r.set(p,u))}return d}function a(){r=new WeakMap}function o(l){const u=l.target;u.removeEventListener("dispose",o),t.remove(u.instanceMatrix),u.instanceColor!==null&&t.remove(u.instanceColor)}return{update:s,dispose:a}}const bc=new Ot,To=new Mc(1,1),Tc=new hc,Ac=new jl,wc=new Sc,Ao=[],wo=[],Ro=new Float32Array(16),Co=new Float32Array(9),Po=new Float32Array(4);function Di(n,e,t){const i=n[0];if(i<=0||i>0)return n;const r=e*t;let s=Ao[r];if(s===void 0&&(s=new Float32Array(r),Ao[r]=s),e!==0){i.toArray(s,0);for(let a=1,o=0;a!==e;++a)o+=t,n[a].toArray(s,o)}return s}function Et(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function yt(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function Wr(n,e){let t=wo[e];t===void 0&&(t=new Int32Array(e),wo[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function bd(n,e){const t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function Td(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Et(t,e))return;n.uniform2fv(this.addr,e),yt(t,e)}}function Ad(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Et(t,e))return;n.uniform3fv(this.addr,e),yt(t,e)}}function wd(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Et(t,e))return;n.uniform4fv(this.addr,e),yt(t,e)}}function Rd(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Et(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),yt(t,e)}else{if(Et(t,i))return;Po.set(i),n.uniformMatrix2fv(this.addr,!1,Po),yt(t,i)}}function Cd(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Et(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),yt(t,e)}else{if(Et(t,i))return;Co.set(i),n.uniformMatrix3fv(this.addr,!1,Co),yt(t,i)}}function Pd(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Et(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),yt(t,e)}else{if(Et(t,i))return;Ro.set(i),n.uniformMatrix4fv(this.addr,!1,Ro),yt(t,i)}}function Ld(n,e){const t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function Dd(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Et(t,e))return;n.uniform2iv(this.addr,e),yt(t,e)}}function Ud(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Et(t,e))return;n.uniform3iv(this.addr,e),yt(t,e)}}function Id(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Et(t,e))return;n.uniform4iv(this.addr,e),yt(t,e)}}function Nd(n,e){const t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function Fd(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Et(t,e))return;n.uniform2uiv(this.addr,e),yt(t,e)}}function Od(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Et(t,e))return;n.uniform3uiv(this.addr,e),yt(t,e)}}function Bd(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Et(t,e))return;n.uniform4uiv(this.addr,e),yt(t,e)}}function zd(n,e,t){const i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r);let s;this.type===n.SAMPLER_2D_SHADOW?(To.compareFunction=lc,s=To):s=bc,t.setTexture2D(e||s,r)}function kd(n,e,t){const i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture3D(e||Ac,r)}function Vd(n,e,t){const i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTextureCube(e||wc,r)}function Hd(n,e,t){const i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture2DArray(e||Tc,r)}function Gd(n){switch(n){case 5126:return bd;case 35664:return Td;case 35665:return Ad;case 35666:return wd;case 35674:return Rd;case 35675:return Cd;case 35676:return Pd;case 5124:case 35670:return Ld;case 35667:case 35671:return Dd;case 35668:case 35672:return Ud;case 35669:case 35673:return Id;case 5125:return Nd;case 36294:return Fd;case 36295:return Od;case 36296:return Bd;case 35678:case 36198:case 36298:case 36306:case 35682:return zd;case 35679:case 36299:case 36307:return kd;case 35680:case 36300:case 36308:case 36293:return Vd;case 36289:case 36303:case 36311:case 36292:return Hd}}function Wd(n,e){n.uniform1fv(this.addr,e)}function Xd(n,e){const t=Di(e,this.size,2);n.uniform2fv(this.addr,t)}function $d(n,e){const t=Di(e,this.size,3);n.uniform3fv(this.addr,t)}function qd(n,e){const t=Di(e,this.size,4);n.uniform4fv(this.addr,t)}function Yd(n,e){const t=Di(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function jd(n,e){const t=Di(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function Kd(n,e){const t=Di(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function Zd(n,e){n.uniform1iv(this.addr,e)}function Jd(n,e){n.uniform2iv(this.addr,e)}function Qd(n,e){n.uniform3iv(this.addr,e)}function ep(n,e){n.uniform4iv(this.addr,e)}function tp(n,e){n.uniform1uiv(this.addr,e)}function np(n,e){n.uniform2uiv(this.addr,e)}function ip(n,e){n.uniform3uiv(this.addr,e)}function rp(n,e){n.uniform4uiv(this.addr,e)}function sp(n,e,t){const i=this.cache,r=e.length,s=Wr(t,r);Et(i,s)||(n.uniform1iv(this.addr,s),yt(i,s));for(let a=0;a!==r;++a)t.setTexture2D(e[a]||bc,s[a])}function ap(n,e,t){const i=this.cache,r=e.length,s=Wr(t,r);Et(i,s)||(n.uniform1iv(this.addr,s),yt(i,s));for(let a=0;a!==r;++a)t.setTexture3D(e[a]||Ac,s[a])}function op(n,e,t){const i=this.cache,r=e.length,s=Wr(t,r);Et(i,s)||(n.uniform1iv(this.addr,s),yt(i,s));for(let a=0;a!==r;++a)t.setTextureCube(e[a]||wc,s[a])}function cp(n,e,t){const i=this.cache,r=e.length,s=Wr(t,r);Et(i,s)||(n.uniform1iv(this.addr,s),yt(i,s));for(let a=0;a!==r;++a)t.setTexture2DArray(e[a]||Tc,s[a])}function lp(n){switch(n){case 5126:return Wd;case 35664:return Xd;case 35665:return $d;case 35666:return qd;case 35674:return Yd;case 35675:return jd;case 35676:return Kd;case 5124:case 35670:return Zd;case 35667:case 35671:return Jd;case 35668:case 35672:return Qd;case 35669:case 35673:return ep;case 5125:return tp;case 36294:return np;case 36295:return ip;case 36296:return rp;case 35678:case 36198:case 36298:case 36306:case 35682:return sp;case 35679:case 36299:case 36307:return ap;case 35680:case 36300:case 36308:case 36293:return op;case 36289:case 36303:case 36311:case 36292:return cp}}class up{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=Gd(t.type)}}class hp{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=lp(t.type)}}class fp{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){const r=this.seq;for(let s=0,a=r.length;s!==a;++s){const o=r[s];o.setValue(e,t[o.id],i)}}}const Cs=/(\w+)(\])?(\[|\.)?/g;function Lo(n,e){n.seq.push(e),n.map[e.id]=e}function dp(n,e,t){const i=n.name,r=i.length;for(Cs.lastIndex=0;;){const s=Cs.exec(i),a=Cs.lastIndex;let o=s[1];const l=s[2]==="]",u=s[3];if(l&&(o=o|0),u===void 0||u==="["&&a+2===r){Lo(t,u===void 0?new up(o,n,e):new hp(o,n,e));break}else{let d=t.map[o];d===void 0&&(d=new fp(o),Lo(t,d)),t=d}}}class Or{constructor(e,t){this.seq=[],this.map={};const i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<i;++r){const s=e.getActiveUniform(t,r),a=e.getUniformLocation(t,s.name);dp(s,a,this)}}setValue(e,t,i,r){const s=this.map[t];s!==void 0&&s.setValue(e,i,r)}setOptional(e,t,i){const r=t[i];r!==void 0&&this.setValue(e,i,r)}static upload(e,t,i,r){for(let s=0,a=t.length;s!==a;++s){const o=t[s],l=i[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,r)}}static seqWithValue(e,t){const i=[];for(let r=0,s=e.length;r!==s;++r){const a=e[r];a.id in t&&i.push(a)}return i}}function Do(n,e,t){const i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}const pp=37297;let mp=0;function gp(n,e){const t=n.split(`
`),i=[],r=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let a=r;a<s;a++){const o=a+1;i.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return i.join(`
`)}const Uo=new Ve;function _p(n){nt._getMatrix(Uo,nt.workingColorSpace,n);const e=`mat3( ${Uo.elements.map(t=>t.toFixed(4))} )`;switch(nt.getTransfer(n)){case zr:return[e,"LinearTransferOETF"];case at:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function Io(n,e,t){const i=n.getShaderParameter(e,n.COMPILE_STATUS),r=n.getShaderInfoLog(e).trim();if(i&&r==="")return"";const s=/ERROR: 0:(\d+)/.exec(r);if(s){const a=parseInt(s[1]);return t.toUpperCase()+`

`+r+`

`+gp(n.getShaderSource(e),a)}else return r}function vp(n,e){const t=_p(e);return[`vec4 ${n}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function xp(n,e){let t;switch(e){case Sl:t="Linear";break;case Ml:t="Reinhard";break;case El:t="Cineon";break;case yl:t="ACESFilmic";break;case Tl:t="AgX";break;case Al:t="Neutral";break;case bl:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const wr=new z;function Sp(){nt.getLuminanceCoefficients(wr);const n=wr.x.toFixed(4),e=wr.y.toFixed(4),t=wr.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Mp(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Vi).join(`
`)}function Ep(n){const e=[];for(const t in n){const i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function yp(n,e){const t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let r=0;r<i;r++){const s=n.getActiveAttrib(e,r),a=s.name;let o=1;s.type===n.FLOAT_MAT2&&(o=2),s.type===n.FLOAT_MAT3&&(o=3),s.type===n.FLOAT_MAT4&&(o=4),t[a]={type:s.type,location:n.getAttribLocation(e,a),locationSize:o}}return t}function Vi(n){return n!==""}function No(n,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Fo(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const bp=/^[ \t]*#include +<([\w\d./]+)>/gm;function Ea(n){return n.replace(bp,Ap)}const Tp=new Map;function Ap(n,e){let t=We[e];if(t===void 0){const i=Tp.get(e);if(i!==void 0)t=We[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return Ea(t)}const wp=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Oo(n){return n.replace(wp,Rp)}function Rp(n,e,t,i){let r="";for(let s=parseInt(e);s<parseInt(t);s++)r+=i.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function Bo(n){let e=`precision ${n.precision} float;
	precision ${n.precision} int;
	precision ${n.precision} sampler2D;
	precision ${n.precision} samplerCube;
	precision ${n.precision} sampler3D;
	precision ${n.precision} sampler2DArray;
	precision ${n.precision} sampler2DShadow;
	precision ${n.precision} samplerCubeShadow;
	precision ${n.precision} sampler2DArrayShadow;
	precision ${n.precision} isampler2D;
	precision ${n.precision} isampler3D;
	precision ${n.precision} isamplerCube;
	precision ${n.precision} isampler2DArray;
	precision ${n.precision} usampler2D;
	precision ${n.precision} usampler3D;
	precision ${n.precision} usamplerCube;
	precision ${n.precision} usampler2DArray;
	`;return n.precision==="highp"?e+=`
#define HIGH_PRECISION`:n.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function Cp(n){let e="SHADOWMAP_TYPE_BASIC";return n.shadowMapType===Ko?e="SHADOWMAP_TYPE_PCF":n.shadowMapType===Qc?e="SHADOWMAP_TYPE_PCF_SOFT":n.shadowMapType===vn&&(e="SHADOWMAP_TYPE_VSM"),e}function Pp(n){let e="ENVMAP_TYPE_CUBE";if(n.envMap)switch(n.envMapMode){case wi:case Ri:e="ENVMAP_TYPE_CUBE";break;case Hr:e="ENVMAP_TYPE_CUBE_UV";break}return e}function Lp(n){let e="ENVMAP_MODE_REFLECTION";if(n.envMap)switch(n.envMapMode){case Ri:e="ENVMAP_MODE_REFRACTION";break}return e}function Dp(n){let e="ENVMAP_BLENDING_NONE";if(n.envMap)switch(n.combine){case wa:e="ENVMAP_BLENDING_MULTIPLY";break;case vl:e="ENVMAP_BLENDING_MIX";break;case xl:e="ENVMAP_BLENDING_ADD";break}return e}function Up(n){const e=n.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:i,maxMip:t}}function Ip(n,e,t,i){const r=n.getContext(),s=t.defines;let a=t.vertexShader,o=t.fragmentShader;const l=Cp(t),u=Pp(t),c=Lp(t),d=Dp(t),p=Up(t),g=Mp(t),v=Ep(s),M=r.createProgram();let m,h,T=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,v].filter(Vi).join(`
`),m.length>0&&(m+=`
`),h=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,v].filter(Vi).join(`
`),h.length>0&&(h+=`
`)):(m=[Bo(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,v,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Vi).join(`
`),h=[Bo(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,v,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.envMap?"#define "+c:"",t.envMap?"#define "+d:"",p?"#define CUBEUV_TEXEL_WIDTH "+p.texelWidth:"",p?"#define CUBEUV_TEXEL_HEIGHT "+p.texelHeight:"",p?"#define CUBEUV_MAX_MIP "+p.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==In?"#define TONE_MAPPING":"",t.toneMapping!==In?We.tonemapping_pars_fragment:"",t.toneMapping!==In?xp("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",We.colorspace_pars_fragment,vp("linearToOutputTexel",t.outputColorSpace),Sp(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Vi).join(`
`)),a=Ea(a),a=No(a,t),a=Fo(a,t),o=Ea(o),o=No(o,t),o=Fo(o,t),a=Oo(a),o=Oo(o),t.isRawShaderMaterial!==!0&&(T=`#version 300 es
`,m=[g,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,h=["#define varying in",t.glslVersion===Ya?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Ya?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+h);const w=T+m+a,b=T+h+o,B=Do(r,r.VERTEX_SHADER,w),P=Do(r,r.FRAGMENT_SHADER,b);r.attachShader(M,B),r.attachShader(M,P),t.index0AttributeName!==void 0?r.bindAttribLocation(M,0,t.index0AttributeName):t.morphTargets===!0&&r.bindAttribLocation(M,0,"position"),r.linkProgram(M);function R(U){if(n.debug.checkShaderErrors){const Q=r.getProgramInfoLog(M).trim(),X=r.getShaderInfoLog(B).trim(),ie=r.getShaderInfoLog(P).trim();let Y=!0,ee=!0;if(r.getProgramParameter(M,r.LINK_STATUS)===!1)if(Y=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(r,M,B,P);else{const re=Io(r,B,"vertex"),K=Io(r,P,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(M,r.VALIDATE_STATUS)+`

Material Name: `+U.name+`
Material Type: `+U.type+`

Program Info Log: `+Q+`
`+re+`
`+K)}else Q!==""?console.warn("THREE.WebGLProgram: Program Info Log:",Q):(X===""||ie==="")&&(ee=!1);ee&&(U.diagnostics={runnable:Y,programLog:Q,vertexShader:{log:X,prefix:m},fragmentShader:{log:ie,prefix:h}})}r.deleteShader(B),r.deleteShader(P),D=new Or(r,M),y=yp(r,M)}let D;this.getUniforms=function(){return D===void 0&&R(this),D};let y;this.getAttributes=function(){return y===void 0&&R(this),y};let E=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return E===!1&&(E=r.getProgramParameter(M,pp)),E},this.destroy=function(){i.releaseStatesOfProgram(this),r.deleteProgram(M),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=mp++,this.cacheKey=e,this.usedTimes=1,this.program=M,this.vertexShader=B,this.fragmentShader=P,this}let Np=0;class Fp{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,i=e.fragmentShader,r=this._getShaderStage(t),s=this._getShaderStage(i),a=this._getShaderCacheForMaterial(e);return a.has(r)===!1&&(a.add(r),r.usedTimes++),a.has(s)===!1&&(a.add(s),s.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){const t=this.shaderCache;let i=t.get(e);return i===void 0&&(i=new Op(e),t.set(e,i)),i}}class Op{constructor(e){this.id=Np++,this.code=e,this.usedTimes=0}}function Bp(n,e,t,i,r,s,a){const o=new dc,l=new Fp,u=new Set,c=[],d=r.logarithmicDepthBuffer,p=r.vertexTextures;let g=r.precision;const v={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function M(y){return u.add(y),y===0?"uv":`uv${y}`}function m(y,E,U,Q,X){const ie=Q.fog,Y=X.geometry,ee=y.isMeshStandardMaterial?Q.environment:null,re=(y.isMeshStandardMaterial?t:e).get(y.envMap||ee),K=re&&re.mapping===Hr?re.image.height:null,C=v[y.type];y.precision!==null&&(g=r.getMaxPrecision(y.precision),g!==y.precision&&console.warn("THREE.WebGLProgram.getParameters:",y.precision,"not supported, using",g,"instead."));const $=Y.morphAttributes.position||Y.morphAttributes.normal||Y.morphAttributes.color,ve=$!==void 0?$.length:0;let Ne=0;Y.morphAttributes.position!==void 0&&(Ne=1),Y.morphAttributes.normal!==void 0&&(Ne=2),Y.morphAttributes.color!==void 0&&(Ne=3);let it,j,se,pe;if(C){const Qe=an[C];it=Qe.vertexShader,j=Qe.fragmentShader}else it=y.vertexShader,j=y.fragmentShader,l.update(y),se=l.getVertexShaderID(y),pe=l.getFragmentShaderID(y);const ue=n.getRenderTarget(),Re=n.state.buffers.depth.getReversed(),Ze=X.isInstancedMesh===!0,Le=X.isBatchedMesh===!0,Ge=!!y.map,ht=!!y.matcap,$e=!!re,L=!!y.aoMap,Pt=!!y.lightMap,Je=!!y.bumpMap,qe=!!y.normalMap,Ae=!!y.displacementMap,ct=!!y.emissiveMap,be=!!y.metalnessMap,A=!!y.roughnessMap,_=y.anisotropy>0,k=y.clearcoat>0,q=y.dispersion>0,J=y.iridescence>0,W=y.sheen>0,ye=y.transmission>0,le=_&&!!y.anisotropyMap,ge=k&&!!y.clearcoatMap,Be=k&&!!y.clearcoatNormalMap,oe=k&&!!y.clearcoatRoughnessMap,Se=J&&!!y.iridescenceMap,Pe=J&&!!y.iridescenceThicknessMap,De=W&&!!y.sheenColorMap,Me=W&&!!y.sheenRoughnessMap,Oe=!!y.specularMap,Ue=!!y.specularColorMap,rt=!!y.specularIntensityMap,I=ye&&!!y.transmissionMap,ce=ye&&!!y.thicknessMap,Z=!!y.gradientMap,te=!!y.alphaMap,he=y.alphaTest>0,fe=!!y.alphaHash,we=!!y.extensions;let ze=In;y.toneMapped&&(ue===null||ue.isXRRenderTarget===!0)&&(ze=n.toneMapping);const lt={shaderID:C,shaderType:y.type,shaderName:y.name,vertexShader:it,fragmentShader:j,defines:y.defines,customVertexShaderID:se,customFragmentShaderID:pe,isRawShaderMaterial:y.isRawShaderMaterial===!0,glslVersion:y.glslVersion,precision:g,batching:Le,batchingColor:Le&&X._colorsTexture!==null,instancing:Ze,instancingColor:Ze&&X.instanceColor!==null,instancingMorph:Ze&&X.morphTexture!==null,supportsVertexTextures:p,outputColorSpace:ue===null?n.outputColorSpace:ue.isXRRenderTarget===!0?ue.texture.colorSpace:Ci,alphaToCoverage:!!y.alphaToCoverage,map:Ge,matcap:ht,envMap:$e,envMapMode:$e&&re.mapping,envMapCubeUVHeight:K,aoMap:L,lightMap:Pt,bumpMap:Je,normalMap:qe,displacementMap:p&&Ae,emissiveMap:ct,normalMapObjectSpace:qe&&y.normalMapType===Pl,normalMapTangentSpace:qe&&y.normalMapType===cc,metalnessMap:be,roughnessMap:A,anisotropy:_,anisotropyMap:le,clearcoat:k,clearcoatMap:ge,clearcoatNormalMap:Be,clearcoatRoughnessMap:oe,dispersion:q,iridescence:J,iridescenceMap:Se,iridescenceThicknessMap:Pe,sheen:W,sheenColorMap:De,sheenRoughnessMap:Me,specularMap:Oe,specularColorMap:Ue,specularIntensityMap:rt,transmission:ye,transmissionMap:I,thicknessMap:ce,gradientMap:Z,opaque:y.transparent===!1&&y.blending===yi&&y.alphaToCoverage===!1,alphaMap:te,alphaTest:he,alphaHash:fe,combine:y.combine,mapUv:Ge&&M(y.map.channel),aoMapUv:L&&M(y.aoMap.channel),lightMapUv:Pt&&M(y.lightMap.channel),bumpMapUv:Je&&M(y.bumpMap.channel),normalMapUv:qe&&M(y.normalMap.channel),displacementMapUv:Ae&&M(y.displacementMap.channel),emissiveMapUv:ct&&M(y.emissiveMap.channel),metalnessMapUv:be&&M(y.metalnessMap.channel),roughnessMapUv:A&&M(y.roughnessMap.channel),anisotropyMapUv:le&&M(y.anisotropyMap.channel),clearcoatMapUv:ge&&M(y.clearcoatMap.channel),clearcoatNormalMapUv:Be&&M(y.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:oe&&M(y.clearcoatRoughnessMap.channel),iridescenceMapUv:Se&&M(y.iridescenceMap.channel),iridescenceThicknessMapUv:Pe&&M(y.iridescenceThicknessMap.channel),sheenColorMapUv:De&&M(y.sheenColorMap.channel),sheenRoughnessMapUv:Me&&M(y.sheenRoughnessMap.channel),specularMapUv:Oe&&M(y.specularMap.channel),specularColorMapUv:Ue&&M(y.specularColorMap.channel),specularIntensityMapUv:rt&&M(y.specularIntensityMap.channel),transmissionMapUv:I&&M(y.transmissionMap.channel),thicknessMapUv:ce&&M(y.thicknessMap.channel),alphaMapUv:te&&M(y.alphaMap.channel),vertexTangents:!!Y.attributes.tangent&&(qe||_),vertexColors:y.vertexColors,vertexAlphas:y.vertexColors===!0&&!!Y.attributes.color&&Y.attributes.color.itemSize===4,pointsUvs:X.isPoints===!0&&!!Y.attributes.uv&&(Ge||te),fog:!!ie,useFog:y.fog===!0,fogExp2:!!ie&&ie.isFogExp2,flatShading:y.flatShading===!0,sizeAttenuation:y.sizeAttenuation===!0,logarithmicDepthBuffer:d,reverseDepthBuffer:Re,skinning:X.isSkinnedMesh===!0,morphTargets:Y.morphAttributes.position!==void 0,morphNormals:Y.morphAttributes.normal!==void 0,morphColors:Y.morphAttributes.color!==void 0,morphTargetsCount:ve,morphTextureStride:Ne,numDirLights:E.directional.length,numPointLights:E.point.length,numSpotLights:E.spot.length,numSpotLightMaps:E.spotLightMap.length,numRectAreaLights:E.rectArea.length,numHemiLights:E.hemi.length,numDirLightShadows:E.directionalShadowMap.length,numPointLightShadows:E.pointShadowMap.length,numSpotLightShadows:E.spotShadowMap.length,numSpotLightShadowsWithMaps:E.numSpotLightShadowsWithMaps,numLightProbes:E.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:y.dithering,shadowMapEnabled:n.shadowMap.enabled&&U.length>0,shadowMapType:n.shadowMap.type,toneMapping:ze,decodeVideoTexture:Ge&&y.map.isVideoTexture===!0&&nt.getTransfer(y.map.colorSpace)===at,decodeVideoTextureEmissive:ct&&y.emissiveMap.isVideoTexture===!0&&nt.getTransfer(y.emissiveMap.colorSpace)===at,premultipliedAlpha:y.premultipliedAlpha,doubleSided:y.side===on,flipSided:y.side===Ft,useDepthPacking:y.depthPacking>=0,depthPacking:y.depthPacking||0,index0AttributeName:y.index0AttributeName,extensionClipCullDistance:we&&y.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(we&&y.extensions.multiDraw===!0||Le)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:y.customProgramCacheKey()};return lt.vertexUv1s=u.has(1),lt.vertexUv2s=u.has(2),lt.vertexUv3s=u.has(3),u.clear(),lt}function h(y){const E=[];if(y.shaderID?E.push(y.shaderID):(E.push(y.customVertexShaderID),E.push(y.customFragmentShaderID)),y.defines!==void 0)for(const U in y.defines)E.push(U),E.push(y.defines[U]);return y.isRawShaderMaterial===!1&&(T(E,y),w(E,y),E.push(n.outputColorSpace)),E.push(y.customProgramCacheKey),E.join()}function T(y,E){y.push(E.precision),y.push(E.outputColorSpace),y.push(E.envMapMode),y.push(E.envMapCubeUVHeight),y.push(E.mapUv),y.push(E.alphaMapUv),y.push(E.lightMapUv),y.push(E.aoMapUv),y.push(E.bumpMapUv),y.push(E.normalMapUv),y.push(E.displacementMapUv),y.push(E.emissiveMapUv),y.push(E.metalnessMapUv),y.push(E.roughnessMapUv),y.push(E.anisotropyMapUv),y.push(E.clearcoatMapUv),y.push(E.clearcoatNormalMapUv),y.push(E.clearcoatRoughnessMapUv),y.push(E.iridescenceMapUv),y.push(E.iridescenceThicknessMapUv),y.push(E.sheenColorMapUv),y.push(E.sheenRoughnessMapUv),y.push(E.specularMapUv),y.push(E.specularColorMapUv),y.push(E.specularIntensityMapUv),y.push(E.transmissionMapUv),y.push(E.thicknessMapUv),y.push(E.combine),y.push(E.fogExp2),y.push(E.sizeAttenuation),y.push(E.morphTargetsCount),y.push(E.morphAttributeCount),y.push(E.numDirLights),y.push(E.numPointLights),y.push(E.numSpotLights),y.push(E.numSpotLightMaps),y.push(E.numHemiLights),y.push(E.numRectAreaLights),y.push(E.numDirLightShadows),y.push(E.numPointLightShadows),y.push(E.numSpotLightShadows),y.push(E.numSpotLightShadowsWithMaps),y.push(E.numLightProbes),y.push(E.shadowMapType),y.push(E.toneMapping),y.push(E.numClippingPlanes),y.push(E.numClipIntersection),y.push(E.depthPacking)}function w(y,E){o.disableAll(),E.supportsVertexTextures&&o.enable(0),E.instancing&&o.enable(1),E.instancingColor&&o.enable(2),E.instancingMorph&&o.enable(3),E.matcap&&o.enable(4),E.envMap&&o.enable(5),E.normalMapObjectSpace&&o.enable(6),E.normalMapTangentSpace&&o.enable(7),E.clearcoat&&o.enable(8),E.iridescence&&o.enable(9),E.alphaTest&&o.enable(10),E.vertexColors&&o.enable(11),E.vertexAlphas&&o.enable(12),E.vertexUv1s&&o.enable(13),E.vertexUv2s&&o.enable(14),E.vertexUv3s&&o.enable(15),E.vertexTangents&&o.enable(16),E.anisotropy&&o.enable(17),E.alphaHash&&o.enable(18),E.batching&&o.enable(19),E.dispersion&&o.enable(20),E.batchingColor&&o.enable(21),y.push(o.mask),o.disableAll(),E.fog&&o.enable(0),E.useFog&&o.enable(1),E.flatShading&&o.enable(2),E.logarithmicDepthBuffer&&o.enable(3),E.reverseDepthBuffer&&o.enable(4),E.skinning&&o.enable(5),E.morphTargets&&o.enable(6),E.morphNormals&&o.enable(7),E.morphColors&&o.enable(8),E.premultipliedAlpha&&o.enable(9),E.shadowMapEnabled&&o.enable(10),E.doubleSided&&o.enable(11),E.flipSided&&o.enable(12),E.useDepthPacking&&o.enable(13),E.dithering&&o.enable(14),E.transmission&&o.enable(15),E.sheen&&o.enable(16),E.opaque&&o.enable(17),E.pointsUvs&&o.enable(18),E.decodeVideoTexture&&o.enable(19),E.decodeVideoTextureEmissive&&o.enable(20),E.alphaToCoverage&&o.enable(21),y.push(o.mask)}function b(y){const E=v[y.type];let U;if(E){const Q=an[E];U=cu.clone(Q.uniforms)}else U=y.uniforms;return U}function B(y,E){let U;for(let Q=0,X=c.length;Q<X;Q++){const ie=c[Q];if(ie.cacheKey===E){U=ie,++U.usedTimes;break}}return U===void 0&&(U=new Ip(n,E,y,s),c.push(U)),U}function P(y){if(--y.usedTimes===0){const E=c.indexOf(y);c[E]=c[c.length-1],c.pop(),y.destroy()}}function R(y){l.remove(y)}function D(){l.dispose()}return{getParameters:m,getProgramCacheKey:h,getUniforms:b,acquireProgram:B,releaseProgram:P,releaseShaderCache:R,programs:c,dispose:D}}function zp(){let n=new WeakMap;function e(a){return n.has(a)}function t(a){let o=n.get(a);return o===void 0&&(o={},n.set(a,o)),o}function i(a){n.delete(a)}function r(a,o,l){n.get(a)[o]=l}function s(){n=new WeakMap}return{has:e,get:t,remove:i,update:r,dispose:s}}function kp(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.z!==e.z?n.z-e.z:n.id-e.id}function zo(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function ko(){const n=[];let e=0;const t=[],i=[],r=[];function s(){e=0,t.length=0,i.length=0,r.length=0}function a(d,p,g,v,M,m){let h=n[e];return h===void 0?(h={id:d.id,object:d,geometry:p,material:g,groupOrder:v,renderOrder:d.renderOrder,z:M,group:m},n[e]=h):(h.id=d.id,h.object=d,h.geometry=p,h.material=g,h.groupOrder=v,h.renderOrder=d.renderOrder,h.z=M,h.group=m),e++,h}function o(d,p,g,v,M,m){const h=a(d,p,g,v,M,m);g.transmission>0?i.push(h):g.transparent===!0?r.push(h):t.push(h)}function l(d,p,g,v,M,m){const h=a(d,p,g,v,M,m);g.transmission>0?i.unshift(h):g.transparent===!0?r.unshift(h):t.unshift(h)}function u(d,p){t.length>1&&t.sort(d||kp),i.length>1&&i.sort(p||zo),r.length>1&&r.sort(p||zo)}function c(){for(let d=e,p=n.length;d<p;d++){const g=n[d];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:t,transmissive:i,transparent:r,init:s,push:o,unshift:l,finish:c,sort:u}}function Vp(){let n=new WeakMap;function e(i,r){const s=n.get(i);let a;return s===void 0?(a=new ko,n.set(i,[a])):r>=s.length?(a=new ko,s.push(a)):a=s[r],a}function t(){n=new WeakMap}return{get:e,dispose:t}}function Hp(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new z,color:new et};break;case"SpotLight":t={position:new z,direction:new z,color:new et,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new z,color:new et,distance:0,decay:0};break;case"HemisphereLight":t={direction:new z,skyColor:new et,groundColor:new et};break;case"RectAreaLight":t={color:new et,position:new z,halfWidth:new z,halfHeight:new z};break}return n[e.id]=t,t}}}function Gp(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new He};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new He};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new He,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}let Wp=0;function Xp(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function $p(n){const e=new Hp,t=Gp(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let u=0;u<9;u++)i.probe.push(new z);const r=new z,s=new _t,a=new _t;function o(u){let c=0,d=0,p=0;for(let y=0;y<9;y++)i.probe[y].set(0,0,0);let g=0,v=0,M=0,m=0,h=0,T=0,w=0,b=0,B=0,P=0,R=0;u.sort(Xp);for(let y=0,E=u.length;y<E;y++){const U=u[y],Q=U.color,X=U.intensity,ie=U.distance,Y=U.shadow&&U.shadow.map?U.shadow.map.texture:null;if(U.isAmbientLight)c+=Q.r*X,d+=Q.g*X,p+=Q.b*X;else if(U.isLightProbe){for(let ee=0;ee<9;ee++)i.probe[ee].addScaledVector(U.sh.coefficients[ee],X);R++}else if(U.isDirectionalLight){const ee=e.get(U);if(ee.color.copy(U.color).multiplyScalar(U.intensity),U.castShadow){const re=U.shadow,K=t.get(U);K.shadowIntensity=re.intensity,K.shadowBias=re.bias,K.shadowNormalBias=re.normalBias,K.shadowRadius=re.radius,K.shadowMapSize=re.mapSize,i.directionalShadow[g]=K,i.directionalShadowMap[g]=Y,i.directionalShadowMatrix[g]=U.shadow.matrix,T++}i.directional[g]=ee,g++}else if(U.isSpotLight){const ee=e.get(U);ee.position.setFromMatrixPosition(U.matrixWorld),ee.color.copy(Q).multiplyScalar(X),ee.distance=ie,ee.coneCos=Math.cos(U.angle),ee.penumbraCos=Math.cos(U.angle*(1-U.penumbra)),ee.decay=U.decay,i.spot[M]=ee;const re=U.shadow;if(U.map&&(i.spotLightMap[B]=U.map,B++,re.updateMatrices(U),U.castShadow&&P++),i.spotLightMatrix[M]=re.matrix,U.castShadow){const K=t.get(U);K.shadowIntensity=re.intensity,K.shadowBias=re.bias,K.shadowNormalBias=re.normalBias,K.shadowRadius=re.radius,K.shadowMapSize=re.mapSize,i.spotShadow[M]=K,i.spotShadowMap[M]=Y,b++}M++}else if(U.isRectAreaLight){const ee=e.get(U);ee.color.copy(Q).multiplyScalar(X),ee.halfWidth.set(U.width*.5,0,0),ee.halfHeight.set(0,U.height*.5,0),i.rectArea[m]=ee,m++}else if(U.isPointLight){const ee=e.get(U);if(ee.color.copy(U.color).multiplyScalar(U.intensity),ee.distance=U.distance,ee.decay=U.decay,U.castShadow){const re=U.shadow,K=t.get(U);K.shadowIntensity=re.intensity,K.shadowBias=re.bias,K.shadowNormalBias=re.normalBias,K.shadowRadius=re.radius,K.shadowMapSize=re.mapSize,K.shadowCameraNear=re.camera.near,K.shadowCameraFar=re.camera.far,i.pointShadow[v]=K,i.pointShadowMap[v]=Y,i.pointShadowMatrix[v]=U.shadow.matrix,w++}i.point[v]=ee,v++}else if(U.isHemisphereLight){const ee=e.get(U);ee.skyColor.copy(U.color).multiplyScalar(X),ee.groundColor.copy(U.groundColor).multiplyScalar(X),i.hemi[h]=ee,h++}}m>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=de.LTC_FLOAT_1,i.rectAreaLTC2=de.LTC_FLOAT_2):(i.rectAreaLTC1=de.LTC_HALF_1,i.rectAreaLTC2=de.LTC_HALF_2)),i.ambient[0]=c,i.ambient[1]=d,i.ambient[2]=p;const D=i.hash;(D.directionalLength!==g||D.pointLength!==v||D.spotLength!==M||D.rectAreaLength!==m||D.hemiLength!==h||D.numDirectionalShadows!==T||D.numPointShadows!==w||D.numSpotShadows!==b||D.numSpotMaps!==B||D.numLightProbes!==R)&&(i.directional.length=g,i.spot.length=M,i.rectArea.length=m,i.point.length=v,i.hemi.length=h,i.directionalShadow.length=T,i.directionalShadowMap.length=T,i.pointShadow.length=w,i.pointShadowMap.length=w,i.spotShadow.length=b,i.spotShadowMap.length=b,i.directionalShadowMatrix.length=T,i.pointShadowMatrix.length=w,i.spotLightMatrix.length=b+B-P,i.spotLightMap.length=B,i.numSpotLightShadowsWithMaps=P,i.numLightProbes=R,D.directionalLength=g,D.pointLength=v,D.spotLength=M,D.rectAreaLength=m,D.hemiLength=h,D.numDirectionalShadows=T,D.numPointShadows=w,D.numSpotShadows=b,D.numSpotMaps=B,D.numLightProbes=R,i.version=Wp++)}function l(u,c){let d=0,p=0,g=0,v=0,M=0;const m=c.matrixWorldInverse;for(let h=0,T=u.length;h<T;h++){const w=u[h];if(w.isDirectionalLight){const b=i.directional[d];b.direction.setFromMatrixPosition(w.matrixWorld),r.setFromMatrixPosition(w.target.matrixWorld),b.direction.sub(r),b.direction.transformDirection(m),d++}else if(w.isSpotLight){const b=i.spot[g];b.position.setFromMatrixPosition(w.matrixWorld),b.position.applyMatrix4(m),b.direction.setFromMatrixPosition(w.matrixWorld),r.setFromMatrixPosition(w.target.matrixWorld),b.direction.sub(r),b.direction.transformDirection(m),g++}else if(w.isRectAreaLight){const b=i.rectArea[v];b.position.setFromMatrixPosition(w.matrixWorld),b.position.applyMatrix4(m),a.identity(),s.copy(w.matrixWorld),s.premultiply(m),a.extractRotation(s),b.halfWidth.set(w.width*.5,0,0),b.halfHeight.set(0,w.height*.5,0),b.halfWidth.applyMatrix4(a),b.halfHeight.applyMatrix4(a),v++}else if(w.isPointLight){const b=i.point[p];b.position.setFromMatrixPosition(w.matrixWorld),b.position.applyMatrix4(m),p++}else if(w.isHemisphereLight){const b=i.hemi[M];b.direction.setFromMatrixPosition(w.matrixWorld),b.direction.transformDirection(m),M++}}}return{setup:o,setupView:l,state:i}}function Vo(n){const e=new $p(n),t=[],i=[];function r(c){u.camera=c,t.length=0,i.length=0}function s(c){t.push(c)}function a(c){i.push(c)}function o(){e.setup(t)}function l(c){e.setupView(t,c)}const u={lightsArray:t,shadowsArray:i,camera:null,lights:e,transmissionRenderTarget:{}};return{init:r,state:u,setupLights:o,setupLightsView:l,pushLight:s,pushShadow:a}}function qp(n){let e=new WeakMap;function t(r,s=0){const a=e.get(r);let o;return a===void 0?(o=new Vo(n),e.set(r,[o])):s>=a.length?(o=new Vo(n),a.push(o)):o=a[s],o}function i(){e=new WeakMap}return{get:t,dispose:i}}const Yp=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,jp=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function Kp(n,e,t){let i=new Fa;const r=new He,s=new He,a=new gt,o=new vu({depthPacking:Cl}),l=new xu,u={},c=t.maxTextureSize,d={[Nn]:Ft,[Ft]:Nn,[on]:on},p=new Fn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new He},radius:{value:4}},vertexShader:Yp,fragmentShader:jp}),g=p.clone();g.defines.HORIZONTAL_PASS=1;const v=new ii;v.setAttribute("position",new un(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const M=new ln(v,p),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Ko;let h=this.type;this.render=function(P,R,D){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||P.length===0)return;const y=n.getRenderTarget(),E=n.getActiveCubeFace(),U=n.getActiveMipmapLevel(),Q=n.state;Q.setBlending(Un),Q.buffers.color.setClear(1,1,1,1),Q.buffers.depth.setTest(!0),Q.setScissorTest(!1);const X=h!==vn&&this.type===vn,ie=h===vn&&this.type!==vn;for(let Y=0,ee=P.length;Y<ee;Y++){const re=P[Y],K=re.shadow;if(K===void 0){console.warn("THREE.WebGLShadowMap:",re,"has no shadow.");continue}if(K.autoUpdate===!1&&K.needsUpdate===!1)continue;r.copy(K.mapSize);const C=K.getFrameExtents();if(r.multiply(C),s.copy(K.mapSize),(r.x>c||r.y>c)&&(r.x>c&&(s.x=Math.floor(c/C.x),r.x=s.x*C.x,K.mapSize.x=s.x),r.y>c&&(s.y=Math.floor(c/C.y),r.y=s.y*C.y,K.mapSize.y=s.y)),K.map===null||X===!0||ie===!0){const ve=this.type!==vn?{minFilter:rn,magFilter:rn}:{};K.map!==null&&K.map.dispose(),K.map=new ei(r.x,r.y,ve),K.map.texture.name=re.name+".shadowMap",K.camera.updateProjectionMatrix()}n.setRenderTarget(K.map),n.clear();const $=K.getViewportCount();for(let ve=0;ve<$;ve++){const Ne=K.getViewport(ve);a.set(s.x*Ne.x,s.y*Ne.y,s.x*Ne.z,s.y*Ne.w),Q.viewport(a),K.updateMatrices(re,ve),i=K.getFrustum(),b(R,D,K.camera,re,this.type)}K.isPointLightShadow!==!0&&this.type===vn&&T(K,D),K.needsUpdate=!1}h=this.type,m.needsUpdate=!1,n.setRenderTarget(y,E,U)};function T(P,R){const D=e.update(M);p.defines.VSM_SAMPLES!==P.blurSamples&&(p.defines.VSM_SAMPLES=P.blurSamples,g.defines.VSM_SAMPLES=P.blurSamples,p.needsUpdate=!0,g.needsUpdate=!0),P.mapPass===null&&(P.mapPass=new ei(r.x,r.y)),p.uniforms.shadow_pass.value=P.map.texture,p.uniforms.resolution.value=P.mapSize,p.uniforms.radius.value=P.radius,n.setRenderTarget(P.mapPass),n.clear(),n.renderBufferDirect(R,null,D,p,M,null),g.uniforms.shadow_pass.value=P.mapPass.texture,g.uniforms.resolution.value=P.mapSize,g.uniforms.radius.value=P.radius,n.setRenderTarget(P.map),n.clear(),n.renderBufferDirect(R,null,D,g,M,null)}function w(P,R,D,y){let E=null;const U=D.isPointLight===!0?P.customDistanceMaterial:P.customDepthMaterial;if(U!==void 0)E=U;else if(E=D.isPointLight===!0?l:o,n.localClippingEnabled&&R.clipShadows===!0&&Array.isArray(R.clippingPlanes)&&R.clippingPlanes.length!==0||R.displacementMap&&R.displacementScale!==0||R.alphaMap&&R.alphaTest>0||R.map&&R.alphaTest>0){const Q=E.uuid,X=R.uuid;let ie=u[Q];ie===void 0&&(ie={},u[Q]=ie);let Y=ie[X];Y===void 0&&(Y=E.clone(),ie[X]=Y,R.addEventListener("dispose",B)),E=Y}if(E.visible=R.visible,E.wireframe=R.wireframe,y===vn?E.side=R.shadowSide!==null?R.shadowSide:R.side:E.side=R.shadowSide!==null?R.shadowSide:d[R.side],E.alphaMap=R.alphaMap,E.alphaTest=R.alphaTest,E.map=R.map,E.clipShadows=R.clipShadows,E.clippingPlanes=R.clippingPlanes,E.clipIntersection=R.clipIntersection,E.displacementMap=R.displacementMap,E.displacementScale=R.displacementScale,E.displacementBias=R.displacementBias,E.wireframeLinewidth=R.wireframeLinewidth,E.linewidth=R.linewidth,D.isPointLight===!0&&E.isMeshDistanceMaterial===!0){const Q=n.properties.get(E);Q.light=D}return E}function b(P,R,D,y,E){if(P.visible===!1)return;if(P.layers.test(R.layers)&&(P.isMesh||P.isLine||P.isPoints)&&(P.castShadow||P.receiveShadow&&E===vn)&&(!P.frustumCulled||i.intersectsObject(P))){P.modelViewMatrix.multiplyMatrices(D.matrixWorldInverse,P.matrixWorld);const X=e.update(P),ie=P.material;if(Array.isArray(ie)){const Y=X.groups;for(let ee=0,re=Y.length;ee<re;ee++){const K=Y[ee],C=ie[K.materialIndex];if(C&&C.visible){const $=w(P,C,y,E);P.onBeforeShadow(n,P,R,D,X,$,K),n.renderBufferDirect(D,null,X,$,P,K),P.onAfterShadow(n,P,R,D,X,$,K)}}}else if(ie.visible){const Y=w(P,ie,y,E);P.onBeforeShadow(n,P,R,D,X,Y,null),n.renderBufferDirect(D,null,X,Y,P,null),P.onAfterShadow(n,P,R,D,X,Y,null)}}const Q=P.children;for(let X=0,ie=Q.length;X<ie;X++)b(Q[X],R,D,y,E)}function B(P){P.target.removeEventListener("dispose",B);for(const D in u){const y=u[D],E=P.target.uuid;E in y&&(y[E].dispose(),delete y[E])}}}const Zp={[Bs]:zs,[ks]:Gs,[Vs]:Ws,[Ai]:Hs,[zs]:Bs,[Gs]:ks,[Ws]:Vs,[Hs]:Ai};function Jp(n,e){function t(){let I=!1;const ce=new gt;let Z=null;const te=new gt(0,0,0,0);return{setMask:function(he){Z!==he&&!I&&(n.colorMask(he,he,he,he),Z=he)},setLocked:function(he){I=he},setClear:function(he,fe,we,ze,lt){lt===!0&&(he*=ze,fe*=ze,we*=ze),ce.set(he,fe,we,ze),te.equals(ce)===!1&&(n.clearColor(he,fe,we,ze),te.copy(ce))},reset:function(){I=!1,Z=null,te.set(-1,0,0,0)}}}function i(){let I=!1,ce=!1,Z=null,te=null,he=null;return{setReversed:function(fe){if(ce!==fe){const we=e.get("EXT_clip_control");fe?we.clipControlEXT(we.LOWER_LEFT_EXT,we.ZERO_TO_ONE_EXT):we.clipControlEXT(we.LOWER_LEFT_EXT,we.NEGATIVE_ONE_TO_ONE_EXT),ce=fe;const ze=he;he=null,this.setClear(ze)}},getReversed:function(){return ce},setTest:function(fe){fe?ue(n.DEPTH_TEST):Re(n.DEPTH_TEST)},setMask:function(fe){Z!==fe&&!I&&(n.depthMask(fe),Z=fe)},setFunc:function(fe){if(ce&&(fe=Zp[fe]),te!==fe){switch(fe){case Bs:n.depthFunc(n.NEVER);break;case zs:n.depthFunc(n.ALWAYS);break;case ks:n.depthFunc(n.LESS);break;case Ai:n.depthFunc(n.LEQUAL);break;case Vs:n.depthFunc(n.EQUAL);break;case Hs:n.depthFunc(n.GEQUAL);break;case Gs:n.depthFunc(n.GREATER);break;case Ws:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}te=fe}},setLocked:function(fe){I=fe},setClear:function(fe){he!==fe&&(ce&&(fe=1-fe),n.clearDepth(fe),he=fe)},reset:function(){I=!1,Z=null,te=null,he=null,ce=!1}}}function r(){let I=!1,ce=null,Z=null,te=null,he=null,fe=null,we=null,ze=null,lt=null;return{setTest:function(Qe){I||(Qe?ue(n.STENCIL_TEST):Re(n.STENCIL_TEST))},setMask:function(Qe){ce!==Qe&&!I&&(n.stencilMask(Qe),ce=Qe)},setFunc:function(Qe,bt,pt){(Z!==Qe||te!==bt||he!==pt)&&(n.stencilFunc(Qe,bt,pt),Z=Qe,te=bt,he=pt)},setOp:function(Qe,bt,pt){(fe!==Qe||we!==bt||ze!==pt)&&(n.stencilOp(Qe,bt,pt),fe=Qe,we=bt,ze=pt)},setLocked:function(Qe){I=Qe},setClear:function(Qe){lt!==Qe&&(n.clearStencil(Qe),lt=Qe)},reset:function(){I=!1,ce=null,Z=null,te=null,he=null,fe=null,we=null,ze=null,lt=null}}}const s=new t,a=new i,o=new r,l=new WeakMap,u=new WeakMap;let c={},d={},p=new WeakMap,g=[],v=null,M=!1,m=null,h=null,T=null,w=null,b=null,B=null,P=null,R=new et(0,0,0),D=0,y=!1,E=null,U=null,Q=null,X=null,ie=null;const Y=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let ee=!1,re=0;const K=n.getParameter(n.VERSION);K.indexOf("WebGL")!==-1?(re=parseFloat(/^WebGL (\d)/.exec(K)[1]),ee=re>=1):K.indexOf("OpenGL ES")!==-1&&(re=parseFloat(/^OpenGL ES (\d)/.exec(K)[1]),ee=re>=2);let C=null,$={};const ve=n.getParameter(n.SCISSOR_BOX),Ne=n.getParameter(n.VIEWPORT),it=new gt().fromArray(ve),j=new gt().fromArray(Ne);function se(I,ce,Z,te){const he=new Uint8Array(4),fe=n.createTexture();n.bindTexture(I,fe),n.texParameteri(I,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(I,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let we=0;we<Z;we++)I===n.TEXTURE_3D||I===n.TEXTURE_2D_ARRAY?n.texImage3D(ce,0,n.RGBA,1,1,te,0,n.RGBA,n.UNSIGNED_BYTE,he):n.texImage2D(ce+we,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,he);return fe}const pe={};pe[n.TEXTURE_2D]=se(n.TEXTURE_2D,n.TEXTURE_2D,1),pe[n.TEXTURE_CUBE_MAP]=se(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),pe[n.TEXTURE_2D_ARRAY]=se(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),pe[n.TEXTURE_3D]=se(n.TEXTURE_3D,n.TEXTURE_3D,1,1),s.setClear(0,0,0,1),a.setClear(1),o.setClear(0),ue(n.DEPTH_TEST),a.setFunc(Ai),Je(!1),qe(Ha),ue(n.CULL_FACE),L(Un);function ue(I){c[I]!==!0&&(n.enable(I),c[I]=!0)}function Re(I){c[I]!==!1&&(n.disable(I),c[I]=!1)}function Ze(I,ce){return d[I]!==ce?(n.bindFramebuffer(I,ce),d[I]=ce,I===n.DRAW_FRAMEBUFFER&&(d[n.FRAMEBUFFER]=ce),I===n.FRAMEBUFFER&&(d[n.DRAW_FRAMEBUFFER]=ce),!0):!1}function Le(I,ce){let Z=g,te=!1;if(I){Z=p.get(ce),Z===void 0&&(Z=[],p.set(ce,Z));const he=I.textures;if(Z.length!==he.length||Z[0]!==n.COLOR_ATTACHMENT0){for(let fe=0,we=he.length;fe<we;fe++)Z[fe]=n.COLOR_ATTACHMENT0+fe;Z.length=he.length,te=!0}}else Z[0]!==n.BACK&&(Z[0]=n.BACK,te=!0);te&&n.drawBuffers(Z)}function Ge(I){return v!==I?(n.useProgram(I),v=I,!0):!1}const ht={[Yn]:n.FUNC_ADD,[tl]:n.FUNC_SUBTRACT,[nl]:n.FUNC_REVERSE_SUBTRACT};ht[il]=n.MIN,ht[rl]=n.MAX;const $e={[sl]:n.ZERO,[al]:n.ONE,[ol]:n.SRC_COLOR,[Fs]:n.SRC_ALPHA,[dl]:n.SRC_ALPHA_SATURATE,[hl]:n.DST_COLOR,[ll]:n.DST_ALPHA,[cl]:n.ONE_MINUS_SRC_COLOR,[Os]:n.ONE_MINUS_SRC_ALPHA,[fl]:n.ONE_MINUS_DST_COLOR,[ul]:n.ONE_MINUS_DST_ALPHA,[pl]:n.CONSTANT_COLOR,[ml]:n.ONE_MINUS_CONSTANT_COLOR,[gl]:n.CONSTANT_ALPHA,[_l]:n.ONE_MINUS_CONSTANT_ALPHA};function L(I,ce,Z,te,he,fe,we,ze,lt,Qe){if(I===Un){M===!0&&(Re(n.BLEND),M=!1);return}if(M===!1&&(ue(n.BLEND),M=!0),I!==el){if(I!==m||Qe!==y){if((h!==Yn||b!==Yn)&&(n.blendEquation(n.FUNC_ADD),h=Yn,b=Yn),Qe)switch(I){case yi:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Ga:n.blendFunc(n.ONE,n.ONE);break;case Wa:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Xa:n.blendFuncSeparate(n.ZERO,n.SRC_COLOR,n.ZERO,n.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}else switch(I){case yi:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Ga:n.blendFunc(n.SRC_ALPHA,n.ONE);break;case Wa:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Xa:n.blendFunc(n.ZERO,n.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}T=null,w=null,B=null,P=null,R.set(0,0,0),D=0,m=I,y=Qe}return}he=he||ce,fe=fe||Z,we=we||te,(ce!==h||he!==b)&&(n.blendEquationSeparate(ht[ce],ht[he]),h=ce,b=he),(Z!==T||te!==w||fe!==B||we!==P)&&(n.blendFuncSeparate($e[Z],$e[te],$e[fe],$e[we]),T=Z,w=te,B=fe,P=we),(ze.equals(R)===!1||lt!==D)&&(n.blendColor(ze.r,ze.g,ze.b,lt),R.copy(ze),D=lt),m=I,y=!1}function Pt(I,ce){I.side===on?Re(n.CULL_FACE):ue(n.CULL_FACE);let Z=I.side===Ft;ce&&(Z=!Z),Je(Z),I.blending===yi&&I.transparent===!1?L(Un):L(I.blending,I.blendEquation,I.blendSrc,I.blendDst,I.blendEquationAlpha,I.blendSrcAlpha,I.blendDstAlpha,I.blendColor,I.blendAlpha,I.premultipliedAlpha),a.setFunc(I.depthFunc),a.setTest(I.depthTest),a.setMask(I.depthWrite),s.setMask(I.colorWrite);const te=I.stencilWrite;o.setTest(te),te&&(o.setMask(I.stencilWriteMask),o.setFunc(I.stencilFunc,I.stencilRef,I.stencilFuncMask),o.setOp(I.stencilFail,I.stencilZFail,I.stencilZPass)),ct(I.polygonOffset,I.polygonOffsetFactor,I.polygonOffsetUnits),I.alphaToCoverage===!0?ue(n.SAMPLE_ALPHA_TO_COVERAGE):Re(n.SAMPLE_ALPHA_TO_COVERAGE)}function Je(I){E!==I&&(I?n.frontFace(n.CW):n.frontFace(n.CCW),E=I)}function qe(I){I!==Zc?(ue(n.CULL_FACE),I!==U&&(I===Ha?n.cullFace(n.BACK):I===Jc?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):Re(n.CULL_FACE),U=I}function Ae(I){I!==Q&&(ee&&n.lineWidth(I),Q=I)}function ct(I,ce,Z){I?(ue(n.POLYGON_OFFSET_FILL),(X!==ce||ie!==Z)&&(n.polygonOffset(ce,Z),X=ce,ie=Z)):Re(n.POLYGON_OFFSET_FILL)}function be(I){I?ue(n.SCISSOR_TEST):Re(n.SCISSOR_TEST)}function A(I){I===void 0&&(I=n.TEXTURE0+Y-1),C!==I&&(n.activeTexture(I),C=I)}function _(I,ce,Z){Z===void 0&&(C===null?Z=n.TEXTURE0+Y-1:Z=C);let te=$[Z];te===void 0&&(te={type:void 0,texture:void 0},$[Z]=te),(te.type!==I||te.texture!==ce)&&(C!==Z&&(n.activeTexture(Z),C=Z),n.bindTexture(I,ce||pe[I]),te.type=I,te.texture=ce)}function k(){const I=$[C];I!==void 0&&I.type!==void 0&&(n.bindTexture(I.type,null),I.type=void 0,I.texture=void 0)}function q(){try{n.compressedTexImage2D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function J(){try{n.compressedTexImage3D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function W(){try{n.texSubImage2D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function ye(){try{n.texSubImage3D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function le(){try{n.compressedTexSubImage2D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function ge(){try{n.compressedTexSubImage3D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Be(){try{n.texStorage2D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function oe(){try{n.texStorage3D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Se(){try{n.texImage2D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Pe(){try{n.texImage3D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function De(I){it.equals(I)===!1&&(n.scissor(I.x,I.y,I.z,I.w),it.copy(I))}function Me(I){j.equals(I)===!1&&(n.viewport(I.x,I.y,I.z,I.w),j.copy(I))}function Oe(I,ce){let Z=u.get(ce);Z===void 0&&(Z=new WeakMap,u.set(ce,Z));let te=Z.get(I);te===void 0&&(te=n.getUniformBlockIndex(ce,I.name),Z.set(I,te))}function Ue(I,ce){const te=u.get(ce).get(I);l.get(ce)!==te&&(n.uniformBlockBinding(ce,te,I.__bindingPointIndex),l.set(ce,te))}function rt(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),a.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),c={},C=null,$={},d={},p=new WeakMap,g=[],v=null,M=!1,m=null,h=null,T=null,w=null,b=null,B=null,P=null,R=new et(0,0,0),D=0,y=!1,E=null,U=null,Q=null,X=null,ie=null,it.set(0,0,n.canvas.width,n.canvas.height),j.set(0,0,n.canvas.width,n.canvas.height),s.reset(),a.reset(),o.reset()}return{buffers:{color:s,depth:a,stencil:o},enable:ue,disable:Re,bindFramebuffer:Ze,drawBuffers:Le,useProgram:Ge,setBlending:L,setMaterial:Pt,setFlipSided:Je,setCullFace:qe,setLineWidth:Ae,setPolygonOffset:ct,setScissorTest:be,activeTexture:A,bindTexture:_,unbindTexture:k,compressedTexImage2D:q,compressedTexImage3D:J,texImage2D:Se,texImage3D:Pe,updateUBOMapping:Oe,uniformBlockBinding:Ue,texStorage2D:Be,texStorage3D:oe,texSubImage2D:W,texSubImage3D:ye,compressedTexSubImage2D:le,compressedTexSubImage3D:ge,scissor:De,viewport:Me,reset:rt}}function Qp(n,e,t,i,r,s,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),u=new He,c=new WeakMap;let d;const p=new WeakMap;let g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function v(A,_){return g?new OffscreenCanvas(A,_):Vr("canvas")}function M(A,_,k){let q=1;const J=be(A);if((J.width>k||J.height>k)&&(q=k/Math.max(J.width,J.height)),q<1)if(typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&A instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&A instanceof ImageBitmap||typeof VideoFrame<"u"&&A instanceof VideoFrame){const W=Math.floor(q*J.width),ye=Math.floor(q*J.height);d===void 0&&(d=v(W,ye));const le=_?v(W,ye):d;return le.width=W,le.height=ye,le.getContext("2d").drawImage(A,0,0,W,ye),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+J.width+"x"+J.height+") to ("+W+"x"+ye+")."),le}else return"data"in A&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+J.width+"x"+J.height+")."),A;return A}function m(A){return A.generateMipmaps}function h(A){n.generateMipmap(A)}function T(A){return A.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:A.isWebGL3DRenderTarget?n.TEXTURE_3D:A.isWebGLArrayRenderTarget||A.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function w(A,_,k,q,J=!1){if(A!==null){if(n[A]!==void 0)return n[A];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+A+"'")}let W=_;if(_===n.RED&&(k===n.FLOAT&&(W=n.R32F),k===n.HALF_FLOAT&&(W=n.R16F),k===n.UNSIGNED_BYTE&&(W=n.R8)),_===n.RED_INTEGER&&(k===n.UNSIGNED_BYTE&&(W=n.R8UI),k===n.UNSIGNED_SHORT&&(W=n.R16UI),k===n.UNSIGNED_INT&&(W=n.R32UI),k===n.BYTE&&(W=n.R8I),k===n.SHORT&&(W=n.R16I),k===n.INT&&(W=n.R32I)),_===n.RG&&(k===n.FLOAT&&(W=n.RG32F),k===n.HALF_FLOAT&&(W=n.RG16F),k===n.UNSIGNED_BYTE&&(W=n.RG8)),_===n.RG_INTEGER&&(k===n.UNSIGNED_BYTE&&(W=n.RG8UI),k===n.UNSIGNED_SHORT&&(W=n.RG16UI),k===n.UNSIGNED_INT&&(W=n.RG32UI),k===n.BYTE&&(W=n.RG8I),k===n.SHORT&&(W=n.RG16I),k===n.INT&&(W=n.RG32I)),_===n.RGB_INTEGER&&(k===n.UNSIGNED_BYTE&&(W=n.RGB8UI),k===n.UNSIGNED_SHORT&&(W=n.RGB16UI),k===n.UNSIGNED_INT&&(W=n.RGB32UI),k===n.BYTE&&(W=n.RGB8I),k===n.SHORT&&(W=n.RGB16I),k===n.INT&&(W=n.RGB32I)),_===n.RGBA_INTEGER&&(k===n.UNSIGNED_BYTE&&(W=n.RGBA8UI),k===n.UNSIGNED_SHORT&&(W=n.RGBA16UI),k===n.UNSIGNED_INT&&(W=n.RGBA32UI),k===n.BYTE&&(W=n.RGBA8I),k===n.SHORT&&(W=n.RGBA16I),k===n.INT&&(W=n.RGBA32I)),_===n.RGB&&k===n.UNSIGNED_INT_5_9_9_9_REV&&(W=n.RGB9_E5),_===n.RGBA){const ye=J?zr:nt.getTransfer(q);k===n.FLOAT&&(W=n.RGBA32F),k===n.HALF_FLOAT&&(W=n.RGBA16F),k===n.UNSIGNED_BYTE&&(W=ye===at?n.SRGB8_ALPHA8:n.RGBA8),k===n.UNSIGNED_SHORT_4_4_4_4&&(W=n.RGBA4),k===n.UNSIGNED_SHORT_5_5_5_1&&(W=n.RGB5_A1)}return(W===n.R16F||W===n.R32F||W===n.RG16F||W===n.RG32F||W===n.RGBA16F||W===n.RGBA32F)&&e.get("EXT_color_buffer_float"),W}function b(A,_){let k;return A?_===null||_===Qn||_===Wi?k=n.DEPTH24_STENCIL8:_===xn?k=n.DEPTH32F_STENCIL8:_===Gi&&(k=n.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):_===null||_===Qn||_===Wi?k=n.DEPTH_COMPONENT24:_===xn?k=n.DEPTH_COMPONENT32F:_===Gi&&(k=n.DEPTH_COMPONENT16),k}function B(A,_){return m(A)===!0||A.isFramebufferTexture&&A.minFilter!==rn&&A.minFilter!==cn?Math.log2(Math.max(_.width,_.height))+1:A.mipmaps!==void 0&&A.mipmaps.length>0?A.mipmaps.length:A.isCompressedTexture&&Array.isArray(A.image)?_.mipmaps.length:1}function P(A){const _=A.target;_.removeEventListener("dispose",P),D(_),_.isVideoTexture&&c.delete(_)}function R(A){const _=A.target;_.removeEventListener("dispose",R),E(_)}function D(A){const _=i.get(A);if(_.__webglInit===void 0)return;const k=A.source,q=p.get(k);if(q){const J=q[_.__cacheKey];J.usedTimes--,J.usedTimes===0&&y(A),Object.keys(q).length===0&&p.delete(k)}i.remove(A)}function y(A){const _=i.get(A);n.deleteTexture(_.__webglTexture);const k=A.source,q=p.get(k);delete q[_.__cacheKey],a.memory.textures--}function E(A){const _=i.get(A);if(A.depthTexture&&(A.depthTexture.dispose(),i.remove(A.depthTexture)),A.isWebGLCubeRenderTarget)for(let q=0;q<6;q++){if(Array.isArray(_.__webglFramebuffer[q]))for(let J=0;J<_.__webglFramebuffer[q].length;J++)n.deleteFramebuffer(_.__webglFramebuffer[q][J]);else n.deleteFramebuffer(_.__webglFramebuffer[q]);_.__webglDepthbuffer&&n.deleteRenderbuffer(_.__webglDepthbuffer[q])}else{if(Array.isArray(_.__webglFramebuffer))for(let q=0;q<_.__webglFramebuffer.length;q++)n.deleteFramebuffer(_.__webglFramebuffer[q]);else n.deleteFramebuffer(_.__webglFramebuffer);if(_.__webglDepthbuffer&&n.deleteRenderbuffer(_.__webglDepthbuffer),_.__webglMultisampledFramebuffer&&n.deleteFramebuffer(_.__webglMultisampledFramebuffer),_.__webglColorRenderbuffer)for(let q=0;q<_.__webglColorRenderbuffer.length;q++)_.__webglColorRenderbuffer[q]&&n.deleteRenderbuffer(_.__webglColorRenderbuffer[q]);_.__webglDepthRenderbuffer&&n.deleteRenderbuffer(_.__webglDepthRenderbuffer)}const k=A.textures;for(let q=0,J=k.length;q<J;q++){const W=i.get(k[q]);W.__webglTexture&&(n.deleteTexture(W.__webglTexture),a.memory.textures--),i.remove(k[q])}i.remove(A)}let U=0;function Q(){U=0}function X(){const A=U;return A>=r.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+A+" texture units while this GPU supports only "+r.maxTextures),U+=1,A}function ie(A){const _=[];return _.push(A.wrapS),_.push(A.wrapT),_.push(A.wrapR||0),_.push(A.magFilter),_.push(A.minFilter),_.push(A.anisotropy),_.push(A.internalFormat),_.push(A.format),_.push(A.type),_.push(A.generateMipmaps),_.push(A.premultiplyAlpha),_.push(A.flipY),_.push(A.unpackAlignment),_.push(A.colorSpace),_.join()}function Y(A,_){const k=i.get(A);if(A.isVideoTexture&&Ae(A),A.isRenderTargetTexture===!1&&A.version>0&&k.__version!==A.version){const q=A.image;if(q===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(q.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{j(k,A,_);return}}t.bindTexture(n.TEXTURE_2D,k.__webglTexture,n.TEXTURE0+_)}function ee(A,_){const k=i.get(A);if(A.version>0&&k.__version!==A.version){j(k,A,_);return}t.bindTexture(n.TEXTURE_2D_ARRAY,k.__webglTexture,n.TEXTURE0+_)}function re(A,_){const k=i.get(A);if(A.version>0&&k.__version!==A.version){j(k,A,_);return}t.bindTexture(n.TEXTURE_3D,k.__webglTexture,n.TEXTURE0+_)}function K(A,_){const k=i.get(A);if(A.version>0&&k.__version!==A.version){se(k,A,_);return}t.bindTexture(n.TEXTURE_CUBE_MAP,k.__webglTexture,n.TEXTURE0+_)}const C={[qs]:n.REPEAT,[Kn]:n.CLAMP_TO_EDGE,[Ys]:n.MIRRORED_REPEAT},$={[rn]:n.NEAREST,[wl]:n.NEAREST_MIPMAP_NEAREST,[ar]:n.NEAREST_MIPMAP_LINEAR,[cn]:n.LINEAR,[es]:n.LINEAR_MIPMAP_NEAREST,[Zn]:n.LINEAR_MIPMAP_LINEAR},ve={[Ll]:n.NEVER,[Ol]:n.ALWAYS,[Dl]:n.LESS,[lc]:n.LEQUAL,[Ul]:n.EQUAL,[Fl]:n.GEQUAL,[Il]:n.GREATER,[Nl]:n.NOTEQUAL};function Ne(A,_){if(_.type===xn&&e.has("OES_texture_float_linear")===!1&&(_.magFilter===cn||_.magFilter===es||_.magFilter===ar||_.magFilter===Zn||_.minFilter===cn||_.minFilter===es||_.minFilter===ar||_.minFilter===Zn)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(A,n.TEXTURE_WRAP_S,C[_.wrapS]),n.texParameteri(A,n.TEXTURE_WRAP_T,C[_.wrapT]),(A===n.TEXTURE_3D||A===n.TEXTURE_2D_ARRAY)&&n.texParameteri(A,n.TEXTURE_WRAP_R,C[_.wrapR]),n.texParameteri(A,n.TEXTURE_MAG_FILTER,$[_.magFilter]),n.texParameteri(A,n.TEXTURE_MIN_FILTER,$[_.minFilter]),_.compareFunction&&(n.texParameteri(A,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(A,n.TEXTURE_COMPARE_FUNC,ve[_.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(_.magFilter===rn||_.minFilter!==ar&&_.minFilter!==Zn||_.type===xn&&e.has("OES_texture_float_linear")===!1)return;if(_.anisotropy>1||i.get(_).__currentAnisotropy){const k=e.get("EXT_texture_filter_anisotropic");n.texParameterf(A,k.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(_.anisotropy,r.getMaxAnisotropy())),i.get(_).__currentAnisotropy=_.anisotropy}}}function it(A,_){let k=!1;A.__webglInit===void 0&&(A.__webglInit=!0,_.addEventListener("dispose",P));const q=_.source;let J=p.get(q);J===void 0&&(J={},p.set(q,J));const W=ie(_);if(W!==A.__cacheKey){J[W]===void 0&&(J[W]={texture:n.createTexture(),usedTimes:0},a.memory.textures++,k=!0),J[W].usedTimes++;const ye=J[A.__cacheKey];ye!==void 0&&(J[A.__cacheKey].usedTimes--,ye.usedTimes===0&&y(_)),A.__cacheKey=W,A.__webglTexture=J[W].texture}return k}function j(A,_,k){let q=n.TEXTURE_2D;(_.isDataArrayTexture||_.isCompressedArrayTexture)&&(q=n.TEXTURE_2D_ARRAY),_.isData3DTexture&&(q=n.TEXTURE_3D);const J=it(A,_),W=_.source;t.bindTexture(q,A.__webglTexture,n.TEXTURE0+k);const ye=i.get(W);if(W.version!==ye.__version||J===!0){t.activeTexture(n.TEXTURE0+k);const le=nt.getPrimaries(nt.workingColorSpace),ge=_.colorSpace===Ln?null:nt.getPrimaries(_.colorSpace),Be=_.colorSpace===Ln||le===ge?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,_.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,_.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Be);let oe=M(_.image,!1,r.maxTextureSize);oe=ct(_,oe);const Se=s.convert(_.format,_.colorSpace),Pe=s.convert(_.type);let De=w(_.internalFormat,Se,Pe,_.colorSpace,_.isVideoTexture);Ne(q,_);let Me;const Oe=_.mipmaps,Ue=_.isVideoTexture!==!0,rt=ye.__version===void 0||J===!0,I=W.dataReady,ce=B(_,oe);if(_.isDepthTexture)De=b(_.format===$i,_.type),rt&&(Ue?t.texStorage2D(n.TEXTURE_2D,1,De,oe.width,oe.height):t.texImage2D(n.TEXTURE_2D,0,De,oe.width,oe.height,0,Se,Pe,null));else if(_.isDataTexture)if(Oe.length>0){Ue&&rt&&t.texStorage2D(n.TEXTURE_2D,ce,De,Oe[0].width,Oe[0].height);for(let Z=0,te=Oe.length;Z<te;Z++)Me=Oe[Z],Ue?I&&t.texSubImage2D(n.TEXTURE_2D,Z,0,0,Me.width,Me.height,Se,Pe,Me.data):t.texImage2D(n.TEXTURE_2D,Z,De,Me.width,Me.height,0,Se,Pe,Me.data);_.generateMipmaps=!1}else Ue?(rt&&t.texStorage2D(n.TEXTURE_2D,ce,De,oe.width,oe.height),I&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,oe.width,oe.height,Se,Pe,oe.data)):t.texImage2D(n.TEXTURE_2D,0,De,oe.width,oe.height,0,Se,Pe,oe.data);else if(_.isCompressedTexture)if(_.isCompressedArrayTexture){Ue&&rt&&t.texStorage3D(n.TEXTURE_2D_ARRAY,ce,De,Oe[0].width,Oe[0].height,oe.depth);for(let Z=0,te=Oe.length;Z<te;Z++)if(Me=Oe[Z],_.format!==nn)if(Se!==null)if(Ue){if(I)if(_.layerUpdates.size>0){const he=_o(Me.width,Me.height,_.format,_.type);for(const fe of _.layerUpdates){const we=Me.data.subarray(fe*he/Me.data.BYTES_PER_ELEMENT,(fe+1)*he/Me.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,Z,0,0,fe,Me.width,Me.height,1,Se,we)}_.clearLayerUpdates()}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,Z,0,0,0,Me.width,Me.height,oe.depth,Se,Me.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,Z,De,Me.width,Me.height,oe.depth,0,Me.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ue?I&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,Z,0,0,0,Me.width,Me.height,oe.depth,Se,Pe,Me.data):t.texImage3D(n.TEXTURE_2D_ARRAY,Z,De,Me.width,Me.height,oe.depth,0,Se,Pe,Me.data)}else{Ue&&rt&&t.texStorage2D(n.TEXTURE_2D,ce,De,Oe[0].width,Oe[0].height);for(let Z=0,te=Oe.length;Z<te;Z++)Me=Oe[Z],_.format!==nn?Se!==null?Ue?I&&t.compressedTexSubImage2D(n.TEXTURE_2D,Z,0,0,Me.width,Me.height,Se,Me.data):t.compressedTexImage2D(n.TEXTURE_2D,Z,De,Me.width,Me.height,0,Me.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ue?I&&t.texSubImage2D(n.TEXTURE_2D,Z,0,0,Me.width,Me.height,Se,Pe,Me.data):t.texImage2D(n.TEXTURE_2D,Z,De,Me.width,Me.height,0,Se,Pe,Me.data)}else if(_.isDataArrayTexture)if(Ue){if(rt&&t.texStorage3D(n.TEXTURE_2D_ARRAY,ce,De,oe.width,oe.height,oe.depth),I)if(_.layerUpdates.size>0){const Z=_o(oe.width,oe.height,_.format,_.type);for(const te of _.layerUpdates){const he=oe.data.subarray(te*Z/oe.data.BYTES_PER_ELEMENT,(te+1)*Z/oe.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,te,oe.width,oe.height,1,Se,Pe,he)}_.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,oe.width,oe.height,oe.depth,Se,Pe,oe.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,De,oe.width,oe.height,oe.depth,0,Se,Pe,oe.data);else if(_.isData3DTexture)Ue?(rt&&t.texStorage3D(n.TEXTURE_3D,ce,De,oe.width,oe.height,oe.depth),I&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,oe.width,oe.height,oe.depth,Se,Pe,oe.data)):t.texImage3D(n.TEXTURE_3D,0,De,oe.width,oe.height,oe.depth,0,Se,Pe,oe.data);else if(_.isFramebufferTexture){if(rt)if(Ue)t.texStorage2D(n.TEXTURE_2D,ce,De,oe.width,oe.height);else{let Z=oe.width,te=oe.height;for(let he=0;he<ce;he++)t.texImage2D(n.TEXTURE_2D,he,De,Z,te,0,Se,Pe,null),Z>>=1,te>>=1}}else if(Oe.length>0){if(Ue&&rt){const Z=be(Oe[0]);t.texStorage2D(n.TEXTURE_2D,ce,De,Z.width,Z.height)}for(let Z=0,te=Oe.length;Z<te;Z++)Me=Oe[Z],Ue?I&&t.texSubImage2D(n.TEXTURE_2D,Z,0,0,Se,Pe,Me):t.texImage2D(n.TEXTURE_2D,Z,De,Se,Pe,Me);_.generateMipmaps=!1}else if(Ue){if(rt){const Z=be(oe);t.texStorage2D(n.TEXTURE_2D,ce,De,Z.width,Z.height)}I&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,Se,Pe,oe)}else t.texImage2D(n.TEXTURE_2D,0,De,Se,Pe,oe);m(_)&&h(q),ye.__version=W.version,_.onUpdate&&_.onUpdate(_)}A.__version=_.version}function se(A,_,k){if(_.image.length!==6)return;const q=it(A,_),J=_.source;t.bindTexture(n.TEXTURE_CUBE_MAP,A.__webglTexture,n.TEXTURE0+k);const W=i.get(J);if(J.version!==W.__version||q===!0){t.activeTexture(n.TEXTURE0+k);const ye=nt.getPrimaries(nt.workingColorSpace),le=_.colorSpace===Ln?null:nt.getPrimaries(_.colorSpace),ge=_.colorSpace===Ln||ye===le?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,_.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,_.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,ge);const Be=_.isCompressedTexture||_.image[0].isCompressedTexture,oe=_.image[0]&&_.image[0].isDataTexture,Se=[];for(let te=0;te<6;te++)!Be&&!oe?Se[te]=M(_.image[te],!0,r.maxCubemapSize):Se[te]=oe?_.image[te].image:_.image[te],Se[te]=ct(_,Se[te]);const Pe=Se[0],De=s.convert(_.format,_.colorSpace),Me=s.convert(_.type),Oe=w(_.internalFormat,De,Me,_.colorSpace),Ue=_.isVideoTexture!==!0,rt=W.__version===void 0||q===!0,I=J.dataReady;let ce=B(_,Pe);Ne(n.TEXTURE_CUBE_MAP,_);let Z;if(Be){Ue&&rt&&t.texStorage2D(n.TEXTURE_CUBE_MAP,ce,Oe,Pe.width,Pe.height);for(let te=0;te<6;te++){Z=Se[te].mipmaps;for(let he=0;he<Z.length;he++){const fe=Z[he];_.format!==nn?De!==null?Ue?I&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,he,0,0,fe.width,fe.height,De,fe.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,he,Oe,fe.width,fe.height,0,fe.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ue?I&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,he,0,0,fe.width,fe.height,De,Me,fe.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,he,Oe,fe.width,fe.height,0,De,Me,fe.data)}}}else{if(Z=_.mipmaps,Ue&&rt){Z.length>0&&ce++;const te=be(Se[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,ce,Oe,te.width,te.height)}for(let te=0;te<6;te++)if(oe){Ue?I&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,0,0,0,Se[te].width,Se[te].height,De,Me,Se[te].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,0,Oe,Se[te].width,Se[te].height,0,De,Me,Se[te].data);for(let he=0;he<Z.length;he++){const we=Z[he].image[te].image;Ue?I&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,he+1,0,0,we.width,we.height,De,Me,we.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,he+1,Oe,we.width,we.height,0,De,Me,we.data)}}else{Ue?I&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,0,0,0,De,Me,Se[te]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,0,Oe,De,Me,Se[te]);for(let he=0;he<Z.length;he++){const fe=Z[he];Ue?I&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,he+1,0,0,De,Me,fe.image[te]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,he+1,Oe,De,Me,fe.image[te])}}}m(_)&&h(n.TEXTURE_CUBE_MAP),W.__version=J.version,_.onUpdate&&_.onUpdate(_)}A.__version=_.version}function pe(A,_,k,q,J,W){const ye=s.convert(k.format,k.colorSpace),le=s.convert(k.type),ge=w(k.internalFormat,ye,le,k.colorSpace),Be=i.get(_),oe=i.get(k);if(oe.__renderTarget=_,!Be.__hasExternalTextures){const Se=Math.max(1,_.width>>W),Pe=Math.max(1,_.height>>W);J===n.TEXTURE_3D||J===n.TEXTURE_2D_ARRAY?t.texImage3D(J,W,ge,Se,Pe,_.depth,0,ye,le,null):t.texImage2D(J,W,ge,Se,Pe,0,ye,le,null)}t.bindFramebuffer(n.FRAMEBUFFER,A),qe(_)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,q,J,oe.__webglTexture,0,Je(_)):(J===n.TEXTURE_2D||J>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&J<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,q,J,oe.__webglTexture,W),t.bindFramebuffer(n.FRAMEBUFFER,null)}function ue(A,_,k){if(n.bindRenderbuffer(n.RENDERBUFFER,A),_.depthBuffer){const q=_.depthTexture,J=q&&q.isDepthTexture?q.type:null,W=b(_.stencilBuffer,J),ye=_.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,le=Je(_);qe(_)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,le,W,_.width,_.height):k?n.renderbufferStorageMultisample(n.RENDERBUFFER,le,W,_.width,_.height):n.renderbufferStorage(n.RENDERBUFFER,W,_.width,_.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,ye,n.RENDERBUFFER,A)}else{const q=_.textures;for(let J=0;J<q.length;J++){const W=q[J],ye=s.convert(W.format,W.colorSpace),le=s.convert(W.type),ge=w(W.internalFormat,ye,le,W.colorSpace),Be=Je(_);k&&qe(_)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,Be,ge,_.width,_.height):qe(_)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Be,ge,_.width,_.height):n.renderbufferStorage(n.RENDERBUFFER,ge,_.width,_.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function Re(A,_){if(_&&_.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(n.FRAMEBUFFER,A),!(_.depthTexture&&_.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const q=i.get(_.depthTexture);q.__renderTarget=_,(!q.__webglTexture||_.depthTexture.image.width!==_.width||_.depthTexture.image.height!==_.height)&&(_.depthTexture.image.width=_.width,_.depthTexture.image.height=_.height,_.depthTexture.needsUpdate=!0),Y(_.depthTexture,0);const J=q.__webglTexture,W=Je(_);if(_.depthTexture.format===Xi)qe(_)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,J,0,W):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,J,0);else if(_.depthTexture.format===$i)qe(_)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,J,0,W):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,J,0);else throw new Error("Unknown depthTexture format")}function Ze(A){const _=i.get(A),k=A.isWebGLCubeRenderTarget===!0;if(_.__boundDepthTexture!==A.depthTexture){const q=A.depthTexture;if(_.__depthDisposeCallback&&_.__depthDisposeCallback(),q){const J=()=>{delete _.__boundDepthTexture,delete _.__depthDisposeCallback,q.removeEventListener("dispose",J)};q.addEventListener("dispose",J),_.__depthDisposeCallback=J}_.__boundDepthTexture=q}if(A.depthTexture&&!_.__autoAllocateDepthBuffer){if(k)throw new Error("target.depthTexture not supported in Cube render targets");Re(_.__webglFramebuffer,A)}else if(k){_.__webglDepthbuffer=[];for(let q=0;q<6;q++)if(t.bindFramebuffer(n.FRAMEBUFFER,_.__webglFramebuffer[q]),_.__webglDepthbuffer[q]===void 0)_.__webglDepthbuffer[q]=n.createRenderbuffer(),ue(_.__webglDepthbuffer[q],A,!1);else{const J=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,W=_.__webglDepthbuffer[q];n.bindRenderbuffer(n.RENDERBUFFER,W),n.framebufferRenderbuffer(n.FRAMEBUFFER,J,n.RENDERBUFFER,W)}}else if(t.bindFramebuffer(n.FRAMEBUFFER,_.__webglFramebuffer),_.__webglDepthbuffer===void 0)_.__webglDepthbuffer=n.createRenderbuffer(),ue(_.__webglDepthbuffer,A,!1);else{const q=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,J=_.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,J),n.framebufferRenderbuffer(n.FRAMEBUFFER,q,n.RENDERBUFFER,J)}t.bindFramebuffer(n.FRAMEBUFFER,null)}function Le(A,_,k){const q=i.get(A);_!==void 0&&pe(q.__webglFramebuffer,A,A.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),k!==void 0&&Ze(A)}function Ge(A){const _=A.texture,k=i.get(A),q=i.get(_);A.addEventListener("dispose",R);const J=A.textures,W=A.isWebGLCubeRenderTarget===!0,ye=J.length>1;if(ye||(q.__webglTexture===void 0&&(q.__webglTexture=n.createTexture()),q.__version=_.version,a.memory.textures++),W){k.__webglFramebuffer=[];for(let le=0;le<6;le++)if(_.mipmaps&&_.mipmaps.length>0){k.__webglFramebuffer[le]=[];for(let ge=0;ge<_.mipmaps.length;ge++)k.__webglFramebuffer[le][ge]=n.createFramebuffer()}else k.__webglFramebuffer[le]=n.createFramebuffer()}else{if(_.mipmaps&&_.mipmaps.length>0){k.__webglFramebuffer=[];for(let le=0;le<_.mipmaps.length;le++)k.__webglFramebuffer[le]=n.createFramebuffer()}else k.__webglFramebuffer=n.createFramebuffer();if(ye)for(let le=0,ge=J.length;le<ge;le++){const Be=i.get(J[le]);Be.__webglTexture===void 0&&(Be.__webglTexture=n.createTexture(),a.memory.textures++)}if(A.samples>0&&qe(A)===!1){k.__webglMultisampledFramebuffer=n.createFramebuffer(),k.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,k.__webglMultisampledFramebuffer);for(let le=0;le<J.length;le++){const ge=J[le];k.__webglColorRenderbuffer[le]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,k.__webglColorRenderbuffer[le]);const Be=s.convert(ge.format,ge.colorSpace),oe=s.convert(ge.type),Se=w(ge.internalFormat,Be,oe,ge.colorSpace,A.isXRRenderTarget===!0),Pe=Je(A);n.renderbufferStorageMultisample(n.RENDERBUFFER,Pe,Se,A.width,A.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+le,n.RENDERBUFFER,k.__webglColorRenderbuffer[le])}n.bindRenderbuffer(n.RENDERBUFFER,null),A.depthBuffer&&(k.__webglDepthRenderbuffer=n.createRenderbuffer(),ue(k.__webglDepthRenderbuffer,A,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(W){t.bindTexture(n.TEXTURE_CUBE_MAP,q.__webglTexture),Ne(n.TEXTURE_CUBE_MAP,_);for(let le=0;le<6;le++)if(_.mipmaps&&_.mipmaps.length>0)for(let ge=0;ge<_.mipmaps.length;ge++)pe(k.__webglFramebuffer[le][ge],A,_,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+le,ge);else pe(k.__webglFramebuffer[le],A,_,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+le,0);m(_)&&h(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(ye){for(let le=0,ge=J.length;le<ge;le++){const Be=J[le],oe=i.get(Be);t.bindTexture(n.TEXTURE_2D,oe.__webglTexture),Ne(n.TEXTURE_2D,Be),pe(k.__webglFramebuffer,A,Be,n.COLOR_ATTACHMENT0+le,n.TEXTURE_2D,0),m(Be)&&h(n.TEXTURE_2D)}t.unbindTexture()}else{let le=n.TEXTURE_2D;if((A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(le=A.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(le,q.__webglTexture),Ne(le,_),_.mipmaps&&_.mipmaps.length>0)for(let ge=0;ge<_.mipmaps.length;ge++)pe(k.__webglFramebuffer[ge],A,_,n.COLOR_ATTACHMENT0,le,ge);else pe(k.__webglFramebuffer,A,_,n.COLOR_ATTACHMENT0,le,0);m(_)&&h(le),t.unbindTexture()}A.depthBuffer&&Ze(A)}function ht(A){const _=A.textures;for(let k=0,q=_.length;k<q;k++){const J=_[k];if(m(J)){const W=T(A),ye=i.get(J).__webglTexture;t.bindTexture(W,ye),h(W),t.unbindTexture()}}}const $e=[],L=[];function Pt(A){if(A.samples>0){if(qe(A)===!1){const _=A.textures,k=A.width,q=A.height;let J=n.COLOR_BUFFER_BIT;const W=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ye=i.get(A),le=_.length>1;if(le)for(let ge=0;ge<_.length;ge++)t.bindFramebuffer(n.FRAMEBUFFER,ye.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ge,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,ye.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ge,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,ye.__webglMultisampledFramebuffer),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,ye.__webglFramebuffer);for(let ge=0;ge<_.length;ge++){if(A.resolveDepthBuffer&&(A.depthBuffer&&(J|=n.DEPTH_BUFFER_BIT),A.stencilBuffer&&A.resolveStencilBuffer&&(J|=n.STENCIL_BUFFER_BIT)),le){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,ye.__webglColorRenderbuffer[ge]);const Be=i.get(_[ge]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,Be,0)}n.blitFramebuffer(0,0,k,q,0,0,k,q,J,n.NEAREST),l===!0&&($e.length=0,L.length=0,$e.push(n.COLOR_ATTACHMENT0+ge),A.depthBuffer&&A.resolveDepthBuffer===!1&&($e.push(W),L.push(W),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,L)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,$e))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),le)for(let ge=0;ge<_.length;ge++){t.bindFramebuffer(n.FRAMEBUFFER,ye.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ge,n.RENDERBUFFER,ye.__webglColorRenderbuffer[ge]);const Be=i.get(_[ge]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,ye.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ge,n.TEXTURE_2D,Be,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,ye.__webglMultisampledFramebuffer)}else if(A.depthBuffer&&A.resolveDepthBuffer===!1&&l){const _=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[_])}}}function Je(A){return Math.min(r.maxSamples,A.samples)}function qe(A){const _=i.get(A);return A.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&_.__useRenderToTexture!==!1}function Ae(A){const _=a.render.frame;c.get(A)!==_&&(c.set(A,_),A.update())}function ct(A,_){const k=A.colorSpace,q=A.format,J=A.type;return A.isCompressedTexture===!0||A.isVideoTexture===!0||k!==Ci&&k!==Ln&&(nt.getTransfer(k)===at?(q!==nn||J!==yn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",k)),_}function be(A){return typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement?(u.width=A.naturalWidth||A.width,u.height=A.naturalHeight||A.height):typeof VideoFrame<"u"&&A instanceof VideoFrame?(u.width=A.displayWidth,u.height=A.displayHeight):(u.width=A.width,u.height=A.height),u}this.allocateTextureUnit=X,this.resetTextureUnits=Q,this.setTexture2D=Y,this.setTexture2DArray=ee,this.setTexture3D=re,this.setTextureCube=K,this.rebindTextures=Le,this.setupRenderTarget=Ge,this.updateRenderTargetMipmap=ht,this.updateMultisampleRenderTarget=Pt,this.setupDepthRenderbuffer=Ze,this.setupFrameBufferTexture=pe,this.useMultisampledRTT=qe}function em(n,e){function t(i,r=Ln){let s;const a=nt.getTransfer(r);if(i===yn)return n.UNSIGNED_BYTE;if(i===Ca)return n.UNSIGNED_SHORT_4_4_4_4;if(i===Pa)return n.UNSIGNED_SHORT_5_5_5_1;if(i===ec)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===Jo)return n.BYTE;if(i===Qo)return n.SHORT;if(i===Gi)return n.UNSIGNED_SHORT;if(i===Ra)return n.INT;if(i===Qn)return n.UNSIGNED_INT;if(i===xn)return n.FLOAT;if(i===ji)return n.HALF_FLOAT;if(i===tc)return n.ALPHA;if(i===nc)return n.RGB;if(i===nn)return n.RGBA;if(i===ic)return n.LUMINANCE;if(i===rc)return n.LUMINANCE_ALPHA;if(i===Xi)return n.DEPTH_COMPONENT;if(i===$i)return n.DEPTH_STENCIL;if(i===sc)return n.RED;if(i===La)return n.RED_INTEGER;if(i===ac)return n.RG;if(i===Da)return n.RG_INTEGER;if(i===Ua)return n.RGBA_INTEGER;if(i===Pr||i===Lr||i===Dr||i===Ur)if(a===at)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(i===Pr)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Lr)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Dr)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Ur)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(i===Pr)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Lr)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Dr)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Ur)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===js||i===Ks||i===Zs||i===Js)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(i===js)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Ks)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Zs)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Js)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Qs||i===ea||i===ta)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(i===Qs||i===ea)return a===at?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(i===ta)return a===at?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===na||i===ia||i===ra||i===sa||i===aa||i===oa||i===ca||i===la||i===ua||i===ha||i===fa||i===da||i===pa||i===ma)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(i===na)return a===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===ia)return a===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===ra)return a===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===sa)return a===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===aa)return a===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===oa)return a===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===ca)return a===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===la)return a===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===ua)return a===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===ha)return a===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===fa)return a===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===da)return a===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===pa)return a===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===ma)return a===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Ir||i===ga||i===_a)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(i===Ir)return a===at?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===ga)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===_a)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===oc||i===va||i===xa||i===Sa)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(i===Ir)return s.COMPRESSED_RED_RGTC1_EXT;if(i===va)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===xa)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Sa)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===Wi?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}const tm=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,nm=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class im{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,i){if(this.texture===null){const r=new Ot,s=e.properties.get(r);s.__webglTexture=t.texture,(t.depthNear!==i.depthNear||t.depthFar!==i.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=r}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,i=new Fn({vertexShader:tm,fragmentShader:nm,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new ln(new Gr(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class rm extends ni{constructor(e,t){super();const i=this;let r=null,s=1,a=null,o="local-floor",l=1,u=null,c=null,d=null,p=null,g=null,v=null;const M=new im,m=t.getContextAttributes();let h=null,T=null;const w=[],b=[],B=new He;let P=null;const R=new jt;R.viewport=new gt;const D=new jt;D.viewport=new gt;const y=[R,D],E=new yu;let U=null,Q=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(j){let se=w[j];return se===void 0&&(se=new Ms,w[j]=se),se.getTargetRaySpace()},this.getControllerGrip=function(j){let se=w[j];return se===void 0&&(se=new Ms,w[j]=se),se.getGripSpace()},this.getHand=function(j){let se=w[j];return se===void 0&&(se=new Ms,w[j]=se),se.getHandSpace()};function X(j){const se=b.indexOf(j.inputSource);if(se===-1)return;const pe=w[se];pe!==void 0&&(pe.update(j.inputSource,j.frame,u||a),pe.dispatchEvent({type:j.type,data:j.inputSource}))}function ie(){r.removeEventListener("select",X),r.removeEventListener("selectstart",X),r.removeEventListener("selectend",X),r.removeEventListener("squeeze",X),r.removeEventListener("squeezestart",X),r.removeEventListener("squeezeend",X),r.removeEventListener("end",ie),r.removeEventListener("inputsourceschange",Y);for(let j=0;j<w.length;j++){const se=b[j];se!==null&&(b[j]=null,w[j].disconnect(se))}U=null,Q=null,M.reset(),e.setRenderTarget(h),g=null,p=null,d=null,r=null,T=null,it.stop(),i.isPresenting=!1,e.setPixelRatio(P),e.setSize(B.width,B.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(j){s=j,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(j){o=j,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return u||a},this.setReferenceSpace=function(j){u=j},this.getBaseLayer=function(){return p!==null?p:g},this.getBinding=function(){return d},this.getFrame=function(){return v},this.getSession=function(){return r},this.setSession=async function(j){if(r=j,r!==null){if(h=e.getRenderTarget(),r.addEventListener("select",X),r.addEventListener("selectstart",X),r.addEventListener("selectend",X),r.addEventListener("squeeze",X),r.addEventListener("squeezestart",X),r.addEventListener("squeezeend",X),r.addEventListener("end",ie),r.addEventListener("inputsourceschange",Y),m.xrCompatible!==!0&&await t.makeXRCompatible(),P=e.getPixelRatio(),e.getSize(B),typeof XRWebGLBinding<"u"&&"createProjectionLayer"in XRWebGLBinding.prototype){let pe=null,ue=null,Re=null;m.depth&&(Re=m.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,pe=m.stencil?$i:Xi,ue=m.stencil?Wi:Qn);const Ze={colorFormat:t.RGBA8,depthFormat:Re,scaleFactor:s};d=new XRWebGLBinding(r,t),p=d.createProjectionLayer(Ze),r.updateRenderState({layers:[p]}),e.setPixelRatio(1),e.setSize(p.textureWidth,p.textureHeight,!1),T=new ei(p.textureWidth,p.textureHeight,{format:nn,type:yn,depthTexture:new Mc(p.textureWidth,p.textureHeight,ue,void 0,void 0,void 0,void 0,void 0,void 0,pe),stencilBuffer:m.stencil,colorSpace:e.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1})}else{const pe={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:s};g=new XRWebGLLayer(r,t,pe),r.updateRenderState({baseLayer:g}),e.setPixelRatio(1),e.setSize(g.framebufferWidth,g.framebufferHeight,!1),T=new ei(g.framebufferWidth,g.framebufferHeight,{format:nn,type:yn,colorSpace:e.outputColorSpace,stencilBuffer:m.stencil,resolveDepthBuffer:g.ignoreDepthValues===!1,resolveStencilBuffer:g.ignoreDepthValues===!1})}T.isXRRenderTarget=!0,this.setFoveation(l),u=null,a=await r.requestReferenceSpace(o),it.setContext(r),it.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return M.getDepthTexture()};function Y(j){for(let se=0;se<j.removed.length;se++){const pe=j.removed[se],ue=b.indexOf(pe);ue>=0&&(b[ue]=null,w[ue].disconnect(pe))}for(let se=0;se<j.added.length;se++){const pe=j.added[se];let ue=b.indexOf(pe);if(ue===-1){for(let Ze=0;Ze<w.length;Ze++)if(Ze>=b.length){b.push(pe),ue=Ze;break}else if(b[Ze]===null){b[Ze]=pe,ue=Ze;break}if(ue===-1)break}const Re=w[ue];Re&&Re.connect(pe)}}const ee=new z,re=new z;function K(j,se,pe){ee.setFromMatrixPosition(se.matrixWorld),re.setFromMatrixPosition(pe.matrixWorld);const ue=ee.distanceTo(re),Re=se.projectionMatrix.elements,Ze=pe.projectionMatrix.elements,Le=Re[14]/(Re[10]-1),Ge=Re[14]/(Re[10]+1),ht=(Re[9]+1)/Re[5],$e=(Re[9]-1)/Re[5],L=(Re[8]-1)/Re[0],Pt=(Ze[8]+1)/Ze[0],Je=Le*L,qe=Le*Pt,Ae=ue/(-L+Pt),ct=Ae*-L;if(se.matrixWorld.decompose(j.position,j.quaternion,j.scale),j.translateX(ct),j.translateZ(Ae),j.matrixWorld.compose(j.position,j.quaternion,j.scale),j.matrixWorldInverse.copy(j.matrixWorld).invert(),Re[10]===-1)j.projectionMatrix.copy(se.projectionMatrix),j.projectionMatrixInverse.copy(se.projectionMatrixInverse);else{const be=Le+Ae,A=Ge+Ae,_=Je-ct,k=qe+(ue-ct),q=ht*Ge/A*be,J=$e*Ge/A*be;j.projectionMatrix.makePerspective(_,k,q,J,be,A),j.projectionMatrixInverse.copy(j.projectionMatrix).invert()}}function C(j,se){se===null?j.matrixWorld.copy(j.matrix):j.matrixWorld.multiplyMatrices(se.matrixWorld,j.matrix),j.matrixWorldInverse.copy(j.matrixWorld).invert()}this.updateCamera=function(j){if(r===null)return;let se=j.near,pe=j.far;M.texture!==null&&(M.depthNear>0&&(se=M.depthNear),M.depthFar>0&&(pe=M.depthFar)),E.near=D.near=R.near=se,E.far=D.far=R.far=pe,(U!==E.near||Q!==E.far)&&(r.updateRenderState({depthNear:E.near,depthFar:E.far}),U=E.near,Q=E.far),R.layers.mask=j.layers.mask|2,D.layers.mask=j.layers.mask|4,E.layers.mask=R.layers.mask|D.layers.mask;const ue=j.parent,Re=E.cameras;C(E,ue);for(let Ze=0;Ze<Re.length;Ze++)C(Re[Ze],ue);Re.length===2?K(E,R,D):E.projectionMatrix.copy(R.projectionMatrix),$(j,E,ue)};function $(j,se,pe){pe===null?j.matrix.copy(se.matrixWorld):(j.matrix.copy(pe.matrixWorld),j.matrix.invert(),j.matrix.multiply(se.matrixWorld)),j.matrix.decompose(j.position,j.quaternion,j.scale),j.updateMatrixWorld(!0),j.projectionMatrix.copy(se.projectionMatrix),j.projectionMatrixInverse.copy(se.projectionMatrixInverse),j.isPerspectiveCamera&&(j.fov=Ma*2*Math.atan(1/j.projectionMatrix.elements[5]),j.zoom=1)}this.getCamera=function(){return E},this.getFoveation=function(){if(!(p===null&&g===null))return l},this.setFoveation=function(j){l=j,p!==null&&(p.fixedFoveation=j),g!==null&&g.fixedFoveation!==void 0&&(g.fixedFoveation=j)},this.hasDepthSensing=function(){return M.texture!==null},this.getDepthSensingMesh=function(){return M.getMesh(E)};let ve=null;function Ne(j,se){if(c=se.getViewerPose(u||a),v=se,c!==null){const pe=c.views;g!==null&&(e.setRenderTargetFramebuffer(T,g.framebuffer),e.setRenderTarget(T));let ue=!1;pe.length!==E.cameras.length&&(E.cameras.length=0,ue=!0);for(let Le=0;Le<pe.length;Le++){const Ge=pe[Le];let ht=null;if(g!==null)ht=g.getViewport(Ge);else{const L=d.getViewSubImage(p,Ge);ht=L.viewport,Le===0&&(e.setRenderTargetTextures(T,L.colorTexture,L.depthStencilTexture),e.setRenderTarget(T))}let $e=y[Le];$e===void 0&&($e=new jt,$e.layers.enable(Le),$e.viewport=new gt,y[Le]=$e),$e.matrix.fromArray(Ge.transform.matrix),$e.matrix.decompose($e.position,$e.quaternion,$e.scale),$e.projectionMatrix.fromArray(Ge.projectionMatrix),$e.projectionMatrixInverse.copy($e.projectionMatrix).invert(),$e.viewport.set(ht.x,ht.y,ht.width,ht.height),Le===0&&(E.matrix.copy($e.matrix),E.matrix.decompose(E.position,E.quaternion,E.scale)),ue===!0&&E.cameras.push($e)}const Re=r.enabledFeatures;if(Re&&Re.includes("depth-sensing")&&r.depthUsage=="gpu-optimized"&&d){const Le=d.getDepthInformation(pe[0]);Le&&Le.isValid&&Le.texture&&M.init(e,Le,r.renderState)}}for(let pe=0;pe<w.length;pe++){const ue=b[pe],Re=w[pe];ue!==null&&Re!==void 0&&Re.update(ue,se,u||a)}ve&&ve(j,se),se.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:se}),v=null}const it=new yc;it.setAnimationLoop(Ne),this.setAnimationLoop=function(j){ve=j},this.dispose=function(){}}}const $n=new hn,sm=new _t;function am(n,e){function t(m,h){m.matrixAutoUpdate===!0&&m.updateMatrix(),h.value.copy(m.matrix)}function i(m,h){h.color.getRGB(m.fogColor.value,vc(n)),h.isFog?(m.fogNear.value=h.near,m.fogFar.value=h.far):h.isFogExp2&&(m.fogDensity.value=h.density)}function r(m,h,T,w,b){h.isMeshBasicMaterial||h.isMeshLambertMaterial?s(m,h):h.isMeshToonMaterial?(s(m,h),d(m,h)):h.isMeshPhongMaterial?(s(m,h),c(m,h)):h.isMeshStandardMaterial?(s(m,h),p(m,h),h.isMeshPhysicalMaterial&&g(m,h,b)):h.isMeshMatcapMaterial?(s(m,h),v(m,h)):h.isMeshDepthMaterial?s(m,h):h.isMeshDistanceMaterial?(s(m,h),M(m,h)):h.isMeshNormalMaterial?s(m,h):h.isLineBasicMaterial?(a(m,h),h.isLineDashedMaterial&&o(m,h)):h.isPointsMaterial?l(m,h,T,w):h.isSpriteMaterial?u(m,h):h.isShadowMaterial?(m.color.value.copy(h.color),m.opacity.value=h.opacity):h.isShaderMaterial&&(h.uniformsNeedUpdate=!1)}function s(m,h){m.opacity.value=h.opacity,h.color&&m.diffuse.value.copy(h.color),h.emissive&&m.emissive.value.copy(h.emissive).multiplyScalar(h.emissiveIntensity),h.map&&(m.map.value=h.map,t(h.map,m.mapTransform)),h.alphaMap&&(m.alphaMap.value=h.alphaMap,t(h.alphaMap,m.alphaMapTransform)),h.bumpMap&&(m.bumpMap.value=h.bumpMap,t(h.bumpMap,m.bumpMapTransform),m.bumpScale.value=h.bumpScale,h.side===Ft&&(m.bumpScale.value*=-1)),h.normalMap&&(m.normalMap.value=h.normalMap,t(h.normalMap,m.normalMapTransform),m.normalScale.value.copy(h.normalScale),h.side===Ft&&m.normalScale.value.negate()),h.displacementMap&&(m.displacementMap.value=h.displacementMap,t(h.displacementMap,m.displacementMapTransform),m.displacementScale.value=h.displacementScale,m.displacementBias.value=h.displacementBias),h.emissiveMap&&(m.emissiveMap.value=h.emissiveMap,t(h.emissiveMap,m.emissiveMapTransform)),h.specularMap&&(m.specularMap.value=h.specularMap,t(h.specularMap,m.specularMapTransform)),h.alphaTest>0&&(m.alphaTest.value=h.alphaTest);const T=e.get(h),w=T.envMap,b=T.envMapRotation;w&&(m.envMap.value=w,$n.copy(b),$n.x*=-1,$n.y*=-1,$n.z*=-1,w.isCubeTexture&&w.isRenderTargetTexture===!1&&($n.y*=-1,$n.z*=-1),m.envMapRotation.value.setFromMatrix4(sm.makeRotationFromEuler($n)),m.flipEnvMap.value=w.isCubeTexture&&w.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=h.reflectivity,m.ior.value=h.ior,m.refractionRatio.value=h.refractionRatio),h.lightMap&&(m.lightMap.value=h.lightMap,m.lightMapIntensity.value=h.lightMapIntensity,t(h.lightMap,m.lightMapTransform)),h.aoMap&&(m.aoMap.value=h.aoMap,m.aoMapIntensity.value=h.aoMapIntensity,t(h.aoMap,m.aoMapTransform))}function a(m,h){m.diffuse.value.copy(h.color),m.opacity.value=h.opacity,h.map&&(m.map.value=h.map,t(h.map,m.mapTransform))}function o(m,h){m.dashSize.value=h.dashSize,m.totalSize.value=h.dashSize+h.gapSize,m.scale.value=h.scale}function l(m,h,T,w){m.diffuse.value.copy(h.color),m.opacity.value=h.opacity,m.size.value=h.size*T,m.scale.value=w*.5,h.map&&(m.map.value=h.map,t(h.map,m.uvTransform)),h.alphaMap&&(m.alphaMap.value=h.alphaMap,t(h.alphaMap,m.alphaMapTransform)),h.alphaTest>0&&(m.alphaTest.value=h.alphaTest)}function u(m,h){m.diffuse.value.copy(h.color),m.opacity.value=h.opacity,m.rotation.value=h.rotation,h.map&&(m.map.value=h.map,t(h.map,m.mapTransform)),h.alphaMap&&(m.alphaMap.value=h.alphaMap,t(h.alphaMap,m.alphaMapTransform)),h.alphaTest>0&&(m.alphaTest.value=h.alphaTest)}function c(m,h){m.specular.value.copy(h.specular),m.shininess.value=Math.max(h.shininess,1e-4)}function d(m,h){h.gradientMap&&(m.gradientMap.value=h.gradientMap)}function p(m,h){m.metalness.value=h.metalness,h.metalnessMap&&(m.metalnessMap.value=h.metalnessMap,t(h.metalnessMap,m.metalnessMapTransform)),m.roughness.value=h.roughness,h.roughnessMap&&(m.roughnessMap.value=h.roughnessMap,t(h.roughnessMap,m.roughnessMapTransform)),h.envMap&&(m.envMapIntensity.value=h.envMapIntensity)}function g(m,h,T){m.ior.value=h.ior,h.sheen>0&&(m.sheenColor.value.copy(h.sheenColor).multiplyScalar(h.sheen),m.sheenRoughness.value=h.sheenRoughness,h.sheenColorMap&&(m.sheenColorMap.value=h.sheenColorMap,t(h.sheenColorMap,m.sheenColorMapTransform)),h.sheenRoughnessMap&&(m.sheenRoughnessMap.value=h.sheenRoughnessMap,t(h.sheenRoughnessMap,m.sheenRoughnessMapTransform))),h.clearcoat>0&&(m.clearcoat.value=h.clearcoat,m.clearcoatRoughness.value=h.clearcoatRoughness,h.clearcoatMap&&(m.clearcoatMap.value=h.clearcoatMap,t(h.clearcoatMap,m.clearcoatMapTransform)),h.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=h.clearcoatRoughnessMap,t(h.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),h.clearcoatNormalMap&&(m.clearcoatNormalMap.value=h.clearcoatNormalMap,t(h.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(h.clearcoatNormalScale),h.side===Ft&&m.clearcoatNormalScale.value.negate())),h.dispersion>0&&(m.dispersion.value=h.dispersion),h.iridescence>0&&(m.iridescence.value=h.iridescence,m.iridescenceIOR.value=h.iridescenceIOR,m.iridescenceThicknessMinimum.value=h.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=h.iridescenceThicknessRange[1],h.iridescenceMap&&(m.iridescenceMap.value=h.iridescenceMap,t(h.iridescenceMap,m.iridescenceMapTransform)),h.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=h.iridescenceThicknessMap,t(h.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),h.transmission>0&&(m.transmission.value=h.transmission,m.transmissionSamplerMap.value=T.texture,m.transmissionSamplerSize.value.set(T.width,T.height),h.transmissionMap&&(m.transmissionMap.value=h.transmissionMap,t(h.transmissionMap,m.transmissionMapTransform)),m.thickness.value=h.thickness,h.thicknessMap&&(m.thicknessMap.value=h.thicknessMap,t(h.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=h.attenuationDistance,m.attenuationColor.value.copy(h.attenuationColor)),h.anisotropy>0&&(m.anisotropyVector.value.set(h.anisotropy*Math.cos(h.anisotropyRotation),h.anisotropy*Math.sin(h.anisotropyRotation)),h.anisotropyMap&&(m.anisotropyMap.value=h.anisotropyMap,t(h.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=h.specularIntensity,m.specularColor.value.copy(h.specularColor),h.specularColorMap&&(m.specularColorMap.value=h.specularColorMap,t(h.specularColorMap,m.specularColorMapTransform)),h.specularIntensityMap&&(m.specularIntensityMap.value=h.specularIntensityMap,t(h.specularIntensityMap,m.specularIntensityMapTransform))}function v(m,h){h.matcap&&(m.matcap.value=h.matcap)}function M(m,h){const T=e.get(h).light;m.referencePosition.value.setFromMatrixPosition(T.matrixWorld),m.nearDistance.value=T.shadow.camera.near,m.farDistance.value=T.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:r}}function om(n,e,t,i){let r={},s={},a=[];const o=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function l(T,w){const b=w.program;i.uniformBlockBinding(T,b)}function u(T,w){let b=r[T.id];b===void 0&&(v(T),b=c(T),r[T.id]=b,T.addEventListener("dispose",m));const B=w.program;i.updateUBOMapping(T,B);const P=e.render.frame;s[T.id]!==P&&(p(T),s[T.id]=P)}function c(T){const w=d();T.__bindingPointIndex=w;const b=n.createBuffer(),B=T.__size,P=T.usage;return n.bindBuffer(n.UNIFORM_BUFFER,b),n.bufferData(n.UNIFORM_BUFFER,B,P),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,w,b),b}function d(){for(let T=0;T<o;T++)if(a.indexOf(T)===-1)return a.push(T),T;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function p(T){const w=r[T.id],b=T.uniforms,B=T.__cache;n.bindBuffer(n.UNIFORM_BUFFER,w);for(let P=0,R=b.length;P<R;P++){const D=Array.isArray(b[P])?b[P]:[b[P]];for(let y=0,E=D.length;y<E;y++){const U=D[y];if(g(U,P,y,B)===!0){const Q=U.__offset,X=Array.isArray(U.value)?U.value:[U.value];let ie=0;for(let Y=0;Y<X.length;Y++){const ee=X[Y],re=M(ee);typeof ee=="number"||typeof ee=="boolean"?(U.__data[0]=ee,n.bufferSubData(n.UNIFORM_BUFFER,Q+ie,U.__data)):ee.isMatrix3?(U.__data[0]=ee.elements[0],U.__data[1]=ee.elements[1],U.__data[2]=ee.elements[2],U.__data[3]=0,U.__data[4]=ee.elements[3],U.__data[5]=ee.elements[4],U.__data[6]=ee.elements[5],U.__data[7]=0,U.__data[8]=ee.elements[6],U.__data[9]=ee.elements[7],U.__data[10]=ee.elements[8],U.__data[11]=0):(ee.toArray(U.__data,ie),ie+=re.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,Q,U.__data)}}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function g(T,w,b,B){const P=T.value,R=w+"_"+b;if(B[R]===void 0)return typeof P=="number"||typeof P=="boolean"?B[R]=P:B[R]=P.clone(),!0;{const D=B[R];if(typeof P=="number"||typeof P=="boolean"){if(D!==P)return B[R]=P,!0}else if(D.equals(P)===!1)return D.copy(P),!0}return!1}function v(T){const w=T.uniforms;let b=0;const B=16;for(let R=0,D=w.length;R<D;R++){const y=Array.isArray(w[R])?w[R]:[w[R]];for(let E=0,U=y.length;E<U;E++){const Q=y[E],X=Array.isArray(Q.value)?Q.value:[Q.value];for(let ie=0,Y=X.length;ie<Y;ie++){const ee=X[ie],re=M(ee),K=b%B,C=K%re.boundary,$=K+C;b+=C,$!==0&&B-$<re.storage&&(b+=B-$),Q.__data=new Float32Array(re.storage/Float32Array.BYTES_PER_ELEMENT),Q.__offset=b,b+=re.storage}}}const P=b%B;return P>0&&(b+=B-P),T.__size=b,T.__cache={},this}function M(T){const w={boundary:0,storage:0};return typeof T=="number"||typeof T=="boolean"?(w.boundary=4,w.storage=4):T.isVector2?(w.boundary=8,w.storage=8):T.isVector3||T.isColor?(w.boundary=16,w.storage=12):T.isVector4?(w.boundary=16,w.storage=16):T.isMatrix3?(w.boundary=48,w.storage=48):T.isMatrix4?(w.boundary=64,w.storage=64):T.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",T),w}function m(T){const w=T.target;w.removeEventListener("dispose",m);const b=a.indexOf(w.__bindingPointIndex);a.splice(b,1),n.deleteBuffer(r[w.id]),delete r[w.id],delete s[w.id]}function h(){for(const T in r)n.deleteBuffer(r[T]);a=[],r={},s={}}return{bind:l,update:u,dispose:h}}class cm{constructor(e={}){const{canvas:t=kl(),context:i=null,depth:r=!0,stencil:s=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:u=!1,powerPreference:c="default",failIfMajorPerformanceCaveat:d=!1,reverseDepthBuffer:p=!1}=e;this.isWebGLRenderer=!0;let g;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=i.getContextAttributes().alpha}else g=a;const v=new Uint32Array(4),M=new Int32Array(4);let m=null,h=null;const T=[],w=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=In,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const b=this;let B=!1;this._outputColorSpace=Yt;let P=0,R=0,D=null,y=-1,E=null;const U=new gt,Q=new gt;let X=null;const ie=new et(0);let Y=0,ee=t.width,re=t.height,K=1,C=null,$=null;const ve=new gt(0,0,ee,re),Ne=new gt(0,0,ee,re);let it=!1;const j=new Fa;let se=!1,pe=!1;const ue=new _t,Re=new _t,Ze=new z,Le=new gt,Ge={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let ht=!1;function $e(){return D===null?K:1}let L=i;function Pt(x,F){return t.getContext(x,F)}try{const x={alpha:!0,depth:r,stencil:s,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:u,powerPreference:c,failIfMajorPerformanceCaveat:d};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Aa}`),t.addEventListener("webglcontextlost",te,!1),t.addEventListener("webglcontextrestored",he,!1),t.addEventListener("webglcontextcreationerror",fe,!1),L===null){const F="webgl2";if(L=Pt(F,x),L===null)throw Pt(F)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(x){throw console.error("THREE.WebGLRenderer: "+x.message),x}let Je,qe,Ae,ct,be,A,_,k,q,J,W,ye,le,ge,Be,oe,Se,Pe,De,Me,Oe,Ue,rt,I;function ce(){Je=new vd(L),Je.init(),Ue=new em(L,Je),qe=new hd(L,Je,e,Ue),Ae=new Jp(L,Je),qe.reverseDepthBuffer&&p&&Ae.buffers.depth.setReversed(!0),ct=new Md(L),be=new zp,A=new Qp(L,Je,Ae,be,qe,Ue,ct),_=new dd(b),k=new _d(b),q=new Au(L),rt=new ld(L,q),J=new xd(L,q,ct,rt),W=new yd(L,J,q,ct),De=new Ed(L,qe,A),oe=new fd(be),ye=new Bp(b,_,k,Je,qe,rt,oe),le=new am(b,be),ge=new Vp,Be=new qp(Je),Pe=new cd(b,_,k,Ae,W,g,l),Se=new Kp(b,W,qe),I=new om(L,ct,qe,Ae),Me=new ud(L,Je,ct),Oe=new Sd(L,Je,ct),ct.programs=ye.programs,b.capabilities=qe,b.extensions=Je,b.properties=be,b.renderLists=ge,b.shadowMap=Se,b.state=Ae,b.info=ct}ce();const Z=new rm(b,L);this.xr=Z,this.getContext=function(){return L},this.getContextAttributes=function(){return L.getContextAttributes()},this.forceContextLoss=function(){const x=Je.get("WEBGL_lose_context");x&&x.loseContext()},this.forceContextRestore=function(){const x=Je.get("WEBGL_lose_context");x&&x.restoreContext()},this.getPixelRatio=function(){return K},this.setPixelRatio=function(x){x!==void 0&&(K=x,this.setSize(ee,re,!1))},this.getSize=function(x){return x.set(ee,re)},this.setSize=function(x,F,H=!0){if(Z.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}ee=x,re=F,t.width=Math.floor(x*K),t.height=Math.floor(F*K),H===!0&&(t.style.width=x+"px",t.style.height=F+"px"),this.setViewport(0,0,x,F)},this.getDrawingBufferSize=function(x){return x.set(ee*K,re*K).floor()},this.setDrawingBufferSize=function(x,F,H){ee=x,re=F,K=H,t.width=Math.floor(x*H),t.height=Math.floor(F*H),this.setViewport(0,0,x,F)},this.getCurrentViewport=function(x){return x.copy(U)},this.getViewport=function(x){return x.copy(ve)},this.setViewport=function(x,F,H,G){x.isVector4?ve.set(x.x,x.y,x.z,x.w):ve.set(x,F,H,G),Ae.viewport(U.copy(ve).multiplyScalar(K).round())},this.getScissor=function(x){return x.copy(Ne)},this.setScissor=function(x,F,H,G){x.isVector4?Ne.set(x.x,x.y,x.z,x.w):Ne.set(x,F,H,G),Ae.scissor(Q.copy(Ne).multiplyScalar(K).round())},this.getScissorTest=function(){return it},this.setScissorTest=function(x){Ae.setScissorTest(it=x)},this.setOpaqueSort=function(x){C=x},this.setTransparentSort=function(x){$=x},this.getClearColor=function(x){return x.copy(Pe.getClearColor())},this.setClearColor=function(){Pe.setClearColor(...arguments)},this.getClearAlpha=function(){return Pe.getClearAlpha()},this.setClearAlpha=function(){Pe.setClearAlpha(...arguments)},this.clear=function(x=!0,F=!0,H=!0){let G=0;if(x){let O=!1;if(D!==null){const ne=D.texture.format;O=ne===Ua||ne===Da||ne===La}if(O){const ne=D.texture.type,me=ne===yn||ne===Qn||ne===Gi||ne===Wi||ne===Ca||ne===Pa,_e=Pe.getClearColor(),xe=Pe.getClearAlpha(),Ie=_e.r,Ce=_e.g,Te=_e.b;me?(v[0]=Ie,v[1]=Ce,v[2]=Te,v[3]=xe,L.clearBufferuiv(L.COLOR,0,v)):(M[0]=Ie,M[1]=Ce,M[2]=Te,M[3]=xe,L.clearBufferiv(L.COLOR,0,M))}else G|=L.COLOR_BUFFER_BIT}F&&(G|=L.DEPTH_BUFFER_BIT),H&&(G|=L.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),L.clear(G)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",te,!1),t.removeEventListener("webglcontextrestored",he,!1),t.removeEventListener("webglcontextcreationerror",fe,!1),Pe.dispose(),ge.dispose(),Be.dispose(),be.dispose(),_.dispose(),k.dispose(),W.dispose(),rt.dispose(),I.dispose(),ye.dispose(),Z.dispose(),Z.removeEventListener("sessionstart",Ht),Z.removeEventListener("sessionend",Zt),sn.stop()};function te(x){x.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),B=!0}function he(){console.log("THREE.WebGLRenderer: Context Restored."),B=!1;const x=ct.autoReset,F=Se.enabled,H=Se.autoUpdate,G=Se.needsUpdate,O=Se.type;ce(),ct.autoReset=x,Se.enabled=F,Se.autoUpdate=H,Se.needsUpdate=G,Se.type=O}function fe(x){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",x.statusMessage)}function we(x){const F=x.target;F.removeEventListener("dispose",we),ze(F)}function ze(x){lt(x),be.remove(x)}function lt(x){const F=be.get(x).programs;F!==void 0&&(F.forEach(function(H){ye.releaseProgram(H)}),x.isShaderMaterial&&ye.releaseShaderCache(x))}this.renderBufferDirect=function(x,F,H,G,O,ne){F===null&&(F=Ge);const me=O.isMesh&&O.matrixWorld.determinant()<0,_e=qr(x,F,H,G,O);Ae.setMaterial(G,me);let xe=H.index,Ie=1;if(G.wireframe===!0){if(xe=J.getWireframeAttribute(H),xe===void 0)return;Ie=2}const Ce=H.drawRange,Te=H.attributes.position;let Ye=Ce.start*Ie,tt=(Ce.start+Ce.count)*Ie;ne!==null&&(Ye=Math.max(Ye,ne.start*Ie),tt=Math.min(tt,(ne.start+ne.count)*Ie)),xe!==null?(Ye=Math.max(Ye,0),tt=Math.min(tt,xe.count)):Te!=null&&(Ye=Math.max(Ye,0),tt=Math.min(tt,Te.count));const mt=tt-Ye;if(mt<0||mt===1/0)return;rt.setup(O,G,_e,H,xe);let ft,f=Me;if(xe!==null&&(ft=q.get(xe),f=Oe,f.setIndex(ft)),O.isMesh)G.wireframe===!0?(Ae.setLineWidth(G.wireframeLinewidth*$e()),f.setMode(L.LINES)):f.setMode(L.TRIANGLES);else if(O.isLine){let S=G.linewidth;S===void 0&&(S=1),Ae.setLineWidth(S*$e()),O.isLineSegments?f.setMode(L.LINES):O.isLineLoop?f.setMode(L.LINE_LOOP):f.setMode(L.LINE_STRIP)}else O.isPoints?f.setMode(L.POINTS):O.isSprite&&f.setMode(L.TRIANGLES);if(O.isBatchedMesh)if(O._multiDrawInstances!==null)Fr("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),f.renderMultiDrawInstances(O._multiDrawStarts,O._multiDrawCounts,O._multiDrawCount,O._multiDrawInstances);else if(Je.get("WEBGL_multi_draw"))f.renderMultiDraw(O._multiDrawStarts,O._multiDrawCounts,O._multiDrawCount);else{const S=O._multiDrawStarts,N=O._multiDrawCounts,V=O._multiDrawCount,ae=xe?q.get(xe).bytesPerElement:1,ke=be.get(G).currentProgram.getUniforms();for(let Fe=0;Fe<V;Fe++)ke.setValue(L,"_gl_DrawID",Fe),f.render(S[Fe]/ae,N[Fe])}else if(O.isInstancedMesh)f.renderInstances(Ye,mt,O.count);else if(H.isInstancedBufferGeometry){const S=H._maxInstanceCount!==void 0?H._maxInstanceCount:1/0,N=Math.min(H.instanceCount,S);f.renderInstances(Ye,mt,N)}else f.render(Ye,mt)};function Qe(x,F,H){x.transparent===!0&&x.side===on&&x.forceSinglePass===!1?(x.side=Ft,x.needsUpdate=!0,zn(x,F,H),x.side=Nn,x.needsUpdate=!0,zn(x,F,H),x.side=on):zn(x,F,H)}this.compile=function(x,F,H=null){H===null&&(H=x),h=Be.get(H),h.init(F),w.push(h),H.traverseVisible(function(O){O.isLight&&O.layers.test(F.layers)&&(h.pushLight(O),O.castShadow&&h.pushShadow(O))}),x!==H&&x.traverseVisible(function(O){O.isLight&&O.layers.test(F.layers)&&(h.pushLight(O),O.castShadow&&h.pushShadow(O))}),h.setupLights();const G=new Set;return x.traverse(function(O){if(!(O.isMesh||O.isPoints||O.isLine||O.isSprite))return;const ne=O.material;if(ne)if(Array.isArray(ne))for(let me=0;me<ne.length;me++){const _e=ne[me];Qe(_e,H,O),G.add(_e)}else Qe(ne,H,O),G.add(ne)}),h=w.pop(),G},this.compileAsync=function(x,F,H=null){const G=this.compile(x,F,H);return new Promise(O=>{function ne(){if(G.forEach(function(me){be.get(me).currentProgram.isReady()&&G.delete(me)}),G.size===0){O(x);return}setTimeout(ne,10)}Je.get("KHR_parallel_shader_compile")!==null?ne():setTimeout(ne,10)})};let bt=null;function pt(x){bt&&bt(x)}function Ht(){sn.stop()}function Zt(){sn.start()}const sn=new yc;sn.setAnimationLoop(pt),typeof self<"u"&&sn.setContext(self),this.setAnimationLoop=function(x){bt=x,Z.setAnimationLoop(x),x===null?sn.stop():sn.start()},Z.addEventListener("sessionstart",Ht),Z.addEventListener("sessionend",Zt),this.render=function(x,F){if(F!==void 0&&F.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(B===!0)return;if(x.matrixWorldAutoUpdate===!0&&x.updateMatrixWorld(),F.parent===null&&F.matrixWorldAutoUpdate===!0&&F.updateMatrixWorld(),Z.enabled===!0&&Z.isPresenting===!0&&(Z.cameraAutoUpdate===!0&&Z.updateCamera(F),F=Z.getCamera()),x.isScene===!0&&x.onBeforeRender(b,x,F,D),h=Be.get(x,w.length),h.init(F),w.push(h),Re.multiplyMatrices(F.projectionMatrix,F.matrixWorldInverse),j.setFromProjectionMatrix(Re),pe=this.localClippingEnabled,se=oe.init(this.clippingPlanes,pe),m=ge.get(x,T.length),m.init(),T.push(m),Z.enabled===!0&&Z.isPresenting===!0){const ne=b.xr.getDepthSensingMesh();ne!==null&&Ui(ne,F,-1/0,b.sortObjects)}Ui(x,F,0,b.sortObjects),m.finish(),b.sortObjects===!0&&m.sort(C,$),ht=Z.enabled===!1||Z.isPresenting===!1||Z.hasDepthSensing()===!1,ht&&Pe.addToRenderList(m,x),this.info.render.frame++,se===!0&&oe.beginShadows();const H=h.state.shadowsArray;Se.render(H,x,F),se===!0&&oe.endShadows(),this.info.autoReset===!0&&this.info.reset();const G=m.opaque,O=m.transmissive;if(h.setupLights(),F.isArrayCamera){const ne=F.cameras;if(O.length>0)for(let me=0,_e=ne.length;me<_e;me++){const xe=ne[me];Ii(G,O,x,xe)}ht&&Pe.render(x);for(let me=0,_e=ne.length;me<_e;me++){const xe=ne[me];Bt(m,x,xe,xe.viewport)}}else O.length>0&&Ii(G,O,x,F),ht&&Pe.render(x),Bt(m,x,F);D!==null&&R===0&&(A.updateMultisampleRenderTarget(D),A.updateRenderTargetMipmap(D)),x.isScene===!0&&x.onAfterRender(b,x,F),rt.resetDefaultState(),y=-1,E=null,w.pop(),w.length>0?(h=w[w.length-1],se===!0&&oe.setGlobalState(b.clippingPlanes,h.state.camera)):h=null,T.pop(),T.length>0?m=T[T.length-1]:m=null};function Ui(x,F,H,G){if(x.visible===!1)return;if(x.layers.test(F.layers)){if(x.isGroup)H=x.renderOrder;else if(x.isLOD)x.autoUpdate===!0&&x.update(F);else if(x.isLight)h.pushLight(x),x.castShadow&&h.pushShadow(x);else if(x.isSprite){if(!x.frustumCulled||j.intersectsSprite(x)){G&&Le.setFromMatrixPosition(x.matrixWorld).applyMatrix4(Re);const me=W.update(x),_e=x.material;_e.visible&&m.push(x,me,_e,H,Le.z,null)}}else if((x.isMesh||x.isLine||x.isPoints)&&(!x.frustumCulled||j.intersectsObject(x))){const me=W.update(x),_e=x.material;if(G&&(x.boundingSphere!==void 0?(x.boundingSphere===null&&x.computeBoundingSphere(),Le.copy(x.boundingSphere.center)):(me.boundingSphere===null&&me.computeBoundingSphere(),Le.copy(me.boundingSphere.center)),Le.applyMatrix4(x.matrixWorld).applyMatrix4(Re)),Array.isArray(_e)){const xe=me.groups;for(let Ie=0,Ce=xe.length;Ie<Ce;Ie++){const Te=xe[Ie],Ye=_e[Te.materialIndex];Ye&&Ye.visible&&m.push(x,me,Ye,H,Le.z,Te)}}else _e.visible&&m.push(x,me,_e,H,Le.z,null)}}const ne=x.children;for(let me=0,_e=ne.length;me<_e;me++)Ui(ne[me],F,H,G)}function Bt(x,F,H,G){const O=x.opaque,ne=x.transmissive,me=x.transparent;h.setupLightsView(H),se===!0&&oe.setGlobalState(b.clippingPlanes,H),G&&Ae.viewport(U.copy(G)),O.length>0&&ri(O,F,H),ne.length>0&&ri(ne,F,H),me.length>0&&ri(me,F,H),Ae.buffers.depth.setTest(!0),Ae.buffers.depth.setMask(!0),Ae.buffers.color.setMask(!0),Ae.setPolygonOffset(!1)}function Ii(x,F,H,G){if((H.isScene===!0?H.overrideMaterial:null)!==null)return;h.state.transmissionRenderTarget[G.id]===void 0&&(h.state.transmissionRenderTarget[G.id]=new ei(1,1,{generateMipmaps:!0,type:Je.has("EXT_color_buffer_half_float")||Je.has("EXT_color_buffer_float")?ji:yn,minFilter:Zn,samples:4,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:nt.workingColorSpace}));const ne=h.state.transmissionRenderTarget[G.id],me=G.viewport||U;ne.setSize(me.z*b.transmissionResolutionScale,me.w*b.transmissionResolutionScale);const _e=b.getRenderTarget();b.setRenderTarget(ne),b.getClearColor(ie),Y=b.getClearAlpha(),Y<1&&b.setClearColor(16777215,.5),b.clear(),ht&&Pe.render(H);const xe=b.toneMapping;b.toneMapping=In;const Ie=G.viewport;if(G.viewport!==void 0&&(G.viewport=void 0),h.setupLightsView(G),se===!0&&oe.setGlobalState(b.clippingPlanes,G),ri(x,H,G),A.updateMultisampleRenderTarget(ne),A.updateRenderTargetMipmap(ne),Je.has("WEBGL_multisampled_render_to_texture")===!1){let Ce=!1;for(let Te=0,Ye=F.length;Te<Ye;Te++){const tt=F[Te],mt=tt.object,ft=tt.geometry,f=tt.material,S=tt.group;if(f.side===on&&mt.layers.test(G.layers)){const N=f.side;f.side=Ft,f.needsUpdate=!0,ir(mt,H,G,ft,f,S),f.side=N,f.needsUpdate=!0,Ce=!0}}Ce===!0&&(A.updateMultisampleRenderTarget(ne),A.updateRenderTargetMipmap(ne))}b.setRenderTarget(_e),b.setClearColor(ie,Y),Ie!==void 0&&(G.viewport=Ie),b.toneMapping=xe}function ri(x,F,H){const G=F.isScene===!0?F.overrideMaterial:null;for(let O=0,ne=x.length;O<ne;O++){const me=x[O],_e=me.object,xe=me.geometry,Ie=me.group;let Ce=me.material;Ce.allowOverride===!0&&G!==null&&(Ce=G),_e.layers.test(H.layers)&&ir(_e,F,H,xe,Ce,Ie)}}function ir(x,F,H,G,O,ne){x.onBeforeRender(b,F,H,G,O,ne),x.modelViewMatrix.multiplyMatrices(H.matrixWorldInverse,x.matrixWorld),x.normalMatrix.getNormalMatrix(x.modelViewMatrix),O.onBeforeRender(b,F,H,G,x,ne),O.transparent===!0&&O.side===on&&O.forceSinglePass===!1?(O.side=Ft,O.needsUpdate=!0,b.renderBufferDirect(H,F,G,O,x,ne),O.side=Nn,O.needsUpdate=!0,b.renderBufferDirect(H,F,G,O,x,ne),O.side=on):b.renderBufferDirect(H,F,G,O,x,ne),x.onAfterRender(b,F,H,G,O,ne)}function zn(x,F,H){F.isScene!==!0&&(F=Ge);const G=be.get(x),O=h.state.lights,ne=h.state.shadowsArray,me=O.state.version,_e=ye.getParameters(x,O.state,ne,F,H),xe=ye.getProgramCacheKey(_e);let Ie=G.programs;G.environment=x.isMeshStandardMaterial?F.environment:null,G.fog=F.fog,G.envMap=(x.isMeshStandardMaterial?k:_).get(x.envMap||G.environment),G.envMapRotation=G.environment!==null&&x.envMap===null?F.environmentRotation:x.envMapRotation,Ie===void 0&&(x.addEventListener("dispose",we),Ie=new Map,G.programs=Ie);let Ce=Ie.get(xe);if(Ce!==void 0){if(G.currentProgram===Ce&&G.lightsStateVersion===me)return sr(x,_e),Ce}else _e.uniforms=ye.getUniforms(x),x.onBeforeCompile(_e,b),Ce=ye.acquireProgram(_e,xe),Ie.set(xe,Ce),G.uniforms=_e.uniforms;const Te=G.uniforms;return(!x.isShaderMaterial&&!x.isRawShaderMaterial||x.clipping===!0)&&(Te.clippingPlanes=oe.uniform),sr(x,_e),G.needsLights=jr(x),G.lightsStateVersion=me,G.needsLights&&(Te.ambientLightColor.value=O.state.ambient,Te.lightProbe.value=O.state.probe,Te.directionalLights.value=O.state.directional,Te.directionalLightShadows.value=O.state.directionalShadow,Te.spotLights.value=O.state.spot,Te.spotLightShadows.value=O.state.spotShadow,Te.rectAreaLights.value=O.state.rectArea,Te.ltc_1.value=O.state.rectAreaLTC1,Te.ltc_2.value=O.state.rectAreaLTC2,Te.pointLights.value=O.state.point,Te.pointLightShadows.value=O.state.pointShadow,Te.hemisphereLights.value=O.state.hemi,Te.directionalShadowMap.value=O.state.directionalShadowMap,Te.directionalShadowMatrix.value=O.state.directionalShadowMatrix,Te.spotShadowMap.value=O.state.spotShadowMap,Te.spotLightMatrix.value=O.state.spotLightMatrix,Te.spotLightMap.value=O.state.spotLightMap,Te.pointShadowMap.value=O.state.pointShadowMap,Te.pointShadowMatrix.value=O.state.pointShadowMatrix),G.currentProgram=Ce,G.uniformsList=null,Ce}function rr(x){if(x.uniformsList===null){const F=x.currentProgram.getUniforms();x.uniformsList=Or.seqWithValue(F.seq,x.uniforms)}return x.uniformsList}function sr(x,F){const H=be.get(x);H.outputColorSpace=F.outputColorSpace,H.batching=F.batching,H.batchingColor=F.batchingColor,H.instancing=F.instancing,H.instancingColor=F.instancingColor,H.instancingMorph=F.instancingMorph,H.skinning=F.skinning,H.morphTargets=F.morphTargets,H.morphNormals=F.morphNormals,H.morphColors=F.morphColors,H.morphTargetsCount=F.morphTargetsCount,H.numClippingPlanes=F.numClippingPlanes,H.numIntersection=F.numClipIntersection,H.vertexAlphas=F.vertexAlphas,H.vertexTangents=F.vertexTangents,H.toneMapping=F.toneMapping}function qr(x,F,H,G,O){F.isScene!==!0&&(F=Ge),A.resetTextureUnits();const ne=F.fog,me=G.isMeshStandardMaterial?F.environment:null,_e=D===null?b.outputColorSpace:D.isXRRenderTarget===!0?D.texture.colorSpace:Ci,xe=(G.isMeshStandardMaterial?k:_).get(G.envMap||me),Ie=G.vertexColors===!0&&!!H.attributes.color&&H.attributes.color.itemSize===4,Ce=!!H.attributes.tangent&&(!!G.normalMap||G.anisotropy>0),Te=!!H.morphAttributes.position,Ye=!!H.morphAttributes.normal,tt=!!H.morphAttributes.color;let mt=In;G.toneMapped&&(D===null||D.isXRRenderTarget===!0)&&(mt=b.toneMapping);const ft=H.morphAttributes.position||H.morphAttributes.normal||H.morphAttributes.color,f=ft!==void 0?ft.length:0,S=be.get(G),N=h.state.lights;if(se===!0&&(pe===!0||x!==E)){const Lt=x===E&&G.id===y;oe.setState(G,x,Lt)}let V=!1;G.version===S.__version?(S.needsLights&&S.lightsStateVersion!==N.state.version||S.outputColorSpace!==_e||O.isBatchedMesh&&S.batching===!1||!O.isBatchedMesh&&S.batching===!0||O.isBatchedMesh&&S.batchingColor===!0&&O.colorTexture===null||O.isBatchedMesh&&S.batchingColor===!1&&O.colorTexture!==null||O.isInstancedMesh&&S.instancing===!1||!O.isInstancedMesh&&S.instancing===!0||O.isSkinnedMesh&&S.skinning===!1||!O.isSkinnedMesh&&S.skinning===!0||O.isInstancedMesh&&S.instancingColor===!0&&O.instanceColor===null||O.isInstancedMesh&&S.instancingColor===!1&&O.instanceColor!==null||O.isInstancedMesh&&S.instancingMorph===!0&&O.morphTexture===null||O.isInstancedMesh&&S.instancingMorph===!1&&O.morphTexture!==null||S.envMap!==xe||G.fog===!0&&S.fog!==ne||S.numClippingPlanes!==void 0&&(S.numClippingPlanes!==oe.numPlanes||S.numIntersection!==oe.numIntersection)||S.vertexAlphas!==Ie||S.vertexTangents!==Ce||S.morphTargets!==Te||S.morphNormals!==Ye||S.morphColors!==tt||S.toneMapping!==mt||S.morphTargetsCount!==f)&&(V=!0):(V=!0,S.__version=G.version);let ae=S.currentProgram;V===!0&&(ae=zn(G,F,O));let ke=!1,Fe=!1,dt=!1;const st=ae.getUniforms(),Gt=S.uniforms;if(Ae.useProgram(ae.program)&&(ke=!0,Fe=!0,dt=!0),G.id!==y&&(y=G.id,Fe=!0),ke||E!==x){Ae.buffers.depth.getReversed()?(ue.copy(x.projectionMatrix),Hl(ue),Gl(ue),st.setValue(L,"projectionMatrix",ue)):st.setValue(L,"projectionMatrix",x.projectionMatrix),st.setValue(L,"viewMatrix",x.matrixWorldInverse);const Ut=st.map.cameraPosition;Ut!==void 0&&Ut.setValue(L,Ze.setFromMatrixPosition(x.matrixWorld)),qe.logarithmicDepthBuffer&&st.setValue(L,"logDepthBufFC",2/(Math.log(x.far+1)/Math.LN2)),(G.isMeshPhongMaterial||G.isMeshToonMaterial||G.isMeshLambertMaterial||G.isMeshBasicMaterial||G.isMeshStandardMaterial||G.isShaderMaterial)&&st.setValue(L,"isOrthographic",x.isOrthographicCamera===!0),E!==x&&(E=x,Fe=!0,dt=!0)}if(O.isSkinnedMesh){st.setOptional(L,O,"bindMatrix"),st.setOptional(L,O,"bindMatrixInverse");const Lt=O.skeleton;Lt&&(Lt.boneTexture===null&&Lt.computeBoneTexture(),st.setValue(L,"boneTexture",Lt.boneTexture,A))}O.isBatchedMesh&&(st.setOptional(L,O,"batchingTexture"),st.setValue(L,"batchingTexture",O._matricesTexture,A),st.setOptional(L,O,"batchingIdTexture"),st.setValue(L,"batchingIdTexture",O._indirectTexture,A),st.setOptional(L,O,"batchingColorTexture"),O._colorsTexture!==null&&st.setValue(L,"batchingColorTexture",O._colorsTexture,A));const Wt=H.morphAttributes;if((Wt.position!==void 0||Wt.normal!==void 0||Wt.color!==void 0)&&De.update(O,H,ae),(Fe||S.receiveShadow!==O.receiveShadow)&&(S.receiveShadow=O.receiveShadow,st.setValue(L,"receiveShadow",O.receiveShadow)),G.isMeshGouraudMaterial&&G.envMap!==null&&(Gt.envMap.value=xe,Gt.flipEnvMap.value=xe.isCubeTexture&&xe.isRenderTargetTexture===!1?-1:1),G.isMeshStandardMaterial&&G.envMap===null&&F.environment!==null&&(Gt.envMapIntensity.value=F.environmentIntensity),Fe&&(st.setValue(L,"toneMappingExposure",b.toneMappingExposure),S.needsLights&&Yr(Gt,dt),ne&&G.fog===!0&&le.refreshFogUniforms(Gt,ne),le.refreshMaterialUniforms(Gt,G,K,re,h.state.transmissionRenderTarget[x.id]),Or.upload(L,rr(S),Gt,A)),G.isShaderMaterial&&G.uniformsNeedUpdate===!0&&(Or.upload(L,rr(S),Gt,A),G.uniformsNeedUpdate=!1),G.isSpriteMaterial&&st.setValue(L,"center",O.center),st.setValue(L,"modelViewMatrix",O.modelViewMatrix),st.setValue(L,"normalMatrix",O.normalMatrix),st.setValue(L,"modelMatrix",O.matrixWorld),G.isShaderMaterial||G.isRawShaderMaterial){const Lt=G.uniformsGroups;for(let Ut=0,Qr=Lt.length;Ut<Qr;Ut++){const kn=Lt[Ut];I.update(kn,ae),I.bind(kn,ae)}}return ae}function Yr(x,F){x.ambientLightColor.needsUpdate=F,x.lightProbe.needsUpdate=F,x.directionalLights.needsUpdate=F,x.directionalLightShadows.needsUpdate=F,x.pointLights.needsUpdate=F,x.pointLightShadows.needsUpdate=F,x.spotLights.needsUpdate=F,x.spotLightShadows.needsUpdate=F,x.rectAreaLights.needsUpdate=F,x.hemisphereLights.needsUpdate=F}function jr(x){return x.isMeshLambertMaterial||x.isMeshToonMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isShadowMaterial||x.isShaderMaterial&&x.lights===!0}this.getActiveCubeFace=function(){return P},this.getActiveMipmapLevel=function(){return R},this.getRenderTarget=function(){return D},this.setRenderTargetTextures=function(x,F,H){const G=be.get(x);G.__autoAllocateDepthBuffer=x.resolveDepthBuffer===!1,G.__autoAllocateDepthBuffer===!1&&(G.__useRenderToTexture=!1),be.get(x.texture).__webglTexture=F,be.get(x.depthTexture).__webglTexture=G.__autoAllocateDepthBuffer?void 0:H,G.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(x,F){const H=be.get(x);H.__webglFramebuffer=F,H.__useDefaultFramebuffer=F===void 0};const Kr=L.createFramebuffer();this.setRenderTarget=function(x,F=0,H=0){D=x,P=F,R=H;let G=!0,O=null,ne=!1,me=!1;if(x){const xe=be.get(x);if(xe.__useDefaultFramebuffer!==void 0)Ae.bindFramebuffer(L.FRAMEBUFFER,null),G=!1;else if(xe.__webglFramebuffer===void 0)A.setupRenderTarget(x);else if(xe.__hasExternalTextures)A.rebindTextures(x,be.get(x.texture).__webglTexture,be.get(x.depthTexture).__webglTexture);else if(x.depthBuffer){const Te=x.depthTexture;if(xe.__boundDepthTexture!==Te){if(Te!==null&&be.has(Te)&&(x.width!==Te.image.width||x.height!==Te.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");A.setupDepthRenderbuffer(x)}}const Ie=x.texture;(Ie.isData3DTexture||Ie.isDataArrayTexture||Ie.isCompressedArrayTexture)&&(me=!0);const Ce=be.get(x).__webglFramebuffer;x.isWebGLCubeRenderTarget?(Array.isArray(Ce[F])?O=Ce[F][H]:O=Ce[F],ne=!0):x.samples>0&&A.useMultisampledRTT(x)===!1?O=be.get(x).__webglMultisampledFramebuffer:Array.isArray(Ce)?O=Ce[H]:O=Ce,U.copy(x.viewport),Q.copy(x.scissor),X=x.scissorTest}else U.copy(ve).multiplyScalar(K).floor(),Q.copy(Ne).multiplyScalar(K).floor(),X=it;if(H!==0&&(O=Kr),Ae.bindFramebuffer(L.FRAMEBUFFER,O)&&G&&Ae.drawBuffers(x,O),Ae.viewport(U),Ae.scissor(Q),Ae.setScissorTest(X),ne){const xe=be.get(x.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_CUBE_MAP_POSITIVE_X+F,xe.__webglTexture,H)}else if(me){const xe=be.get(x.texture),Ie=F;L.framebufferTextureLayer(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,xe.__webglTexture,H,Ie)}else if(x!==null&&H!==0){const xe=be.get(x.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,xe.__webglTexture,H)}y=-1},this.readRenderTargetPixels=function(x,F,H,G,O,ne,me){if(!(x&&x.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let _e=be.get(x).__webglFramebuffer;if(x.isWebGLCubeRenderTarget&&me!==void 0&&(_e=_e[me]),_e){Ae.bindFramebuffer(L.FRAMEBUFFER,_e);try{const xe=x.texture,Ie=xe.format,Ce=xe.type;if(!qe.textureFormatReadable(Ie)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!qe.textureTypeReadable(Ce)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}F>=0&&F<=x.width-G&&H>=0&&H<=x.height-O&&L.readPixels(F,H,G,O,Ue.convert(Ie),Ue.convert(Ce),ne)}finally{const xe=D!==null?be.get(D).__webglFramebuffer:null;Ae.bindFramebuffer(L.FRAMEBUFFER,xe)}}},this.readRenderTargetPixelsAsync=async function(x,F,H,G,O,ne,me){if(!(x&&x.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let _e=be.get(x).__webglFramebuffer;if(x.isWebGLCubeRenderTarget&&me!==void 0&&(_e=_e[me]),_e)if(F>=0&&F<=x.width-G&&H>=0&&H<=x.height-O){Ae.bindFramebuffer(L.FRAMEBUFFER,_e);const xe=x.texture,Ie=xe.format,Ce=xe.type;if(!qe.textureFormatReadable(Ie))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!qe.textureTypeReadable(Ce))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const Te=L.createBuffer();L.bindBuffer(L.PIXEL_PACK_BUFFER,Te),L.bufferData(L.PIXEL_PACK_BUFFER,ne.byteLength,L.STREAM_READ),L.readPixels(F,H,G,O,Ue.convert(Ie),Ue.convert(Ce),0);const Ye=D!==null?be.get(D).__webglFramebuffer:null;Ae.bindFramebuffer(L.FRAMEBUFFER,Ye);const tt=L.fenceSync(L.SYNC_GPU_COMMANDS_COMPLETE,0);return L.flush(),await Vl(L,tt,4),L.bindBuffer(L.PIXEL_PACK_BUFFER,Te),L.getBufferSubData(L.PIXEL_PACK_BUFFER,0,ne),L.deleteBuffer(Te),L.deleteSync(tt),ne}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(x,F=null,H=0){const G=Math.pow(2,-H),O=Math.floor(x.image.width*G),ne=Math.floor(x.image.height*G),me=F!==null?F.x:0,_e=F!==null?F.y:0;A.setTexture2D(x,0),L.copyTexSubImage2D(L.TEXTURE_2D,H,0,0,me,_e,O,ne),Ae.unbindTexture()};const Zr=L.createFramebuffer(),Jr=L.createFramebuffer();this.copyTextureToTexture=function(x,F,H=null,G=null,O=0,ne=null){ne===null&&(O!==0?(Fr("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),ne=O,O=0):ne=0);let me,_e,xe,Ie,Ce,Te,Ye,tt,mt;const ft=x.isCompressedTexture?x.mipmaps[ne]:x.image;if(H!==null)me=H.max.x-H.min.x,_e=H.max.y-H.min.y,xe=H.isBox3?H.max.z-H.min.z:1,Ie=H.min.x,Ce=H.min.y,Te=H.isBox3?H.min.z:0;else{const Wt=Math.pow(2,-O);me=Math.floor(ft.width*Wt),_e=Math.floor(ft.height*Wt),x.isDataArrayTexture?xe=ft.depth:x.isData3DTexture?xe=Math.floor(ft.depth*Wt):xe=1,Ie=0,Ce=0,Te=0}G!==null?(Ye=G.x,tt=G.y,mt=G.z):(Ye=0,tt=0,mt=0);const f=Ue.convert(F.format),S=Ue.convert(F.type);let N;F.isData3DTexture?(A.setTexture3D(F,0),N=L.TEXTURE_3D):F.isDataArrayTexture||F.isCompressedArrayTexture?(A.setTexture2DArray(F,0),N=L.TEXTURE_2D_ARRAY):(A.setTexture2D(F,0),N=L.TEXTURE_2D),L.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,F.flipY),L.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,F.premultiplyAlpha),L.pixelStorei(L.UNPACK_ALIGNMENT,F.unpackAlignment);const V=L.getParameter(L.UNPACK_ROW_LENGTH),ae=L.getParameter(L.UNPACK_IMAGE_HEIGHT),ke=L.getParameter(L.UNPACK_SKIP_PIXELS),Fe=L.getParameter(L.UNPACK_SKIP_ROWS),dt=L.getParameter(L.UNPACK_SKIP_IMAGES);L.pixelStorei(L.UNPACK_ROW_LENGTH,ft.width),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,ft.height),L.pixelStorei(L.UNPACK_SKIP_PIXELS,Ie),L.pixelStorei(L.UNPACK_SKIP_ROWS,Ce),L.pixelStorei(L.UNPACK_SKIP_IMAGES,Te);const st=x.isDataArrayTexture||x.isData3DTexture,Gt=F.isDataArrayTexture||F.isData3DTexture;if(x.isDepthTexture){const Wt=be.get(x),Lt=be.get(F),Ut=be.get(Wt.__renderTarget),Qr=be.get(Lt.__renderTarget);Ae.bindFramebuffer(L.READ_FRAMEBUFFER,Ut.__webglFramebuffer),Ae.bindFramebuffer(L.DRAW_FRAMEBUFFER,Qr.__webglFramebuffer);for(let kn=0;kn<xe;kn++)st&&(L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,be.get(x).__webglTexture,O,Te+kn),L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,be.get(F).__webglTexture,ne,mt+kn)),L.blitFramebuffer(Ie,Ce,me,_e,Ye,tt,me,_e,L.DEPTH_BUFFER_BIT,L.NEAREST);Ae.bindFramebuffer(L.READ_FRAMEBUFFER,null),Ae.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else if(O!==0||x.isRenderTargetTexture||be.has(x)){const Wt=be.get(x),Lt=be.get(F);Ae.bindFramebuffer(L.READ_FRAMEBUFFER,Zr),Ae.bindFramebuffer(L.DRAW_FRAMEBUFFER,Jr);for(let Ut=0;Ut<xe;Ut++)st?L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,Wt.__webglTexture,O,Te+Ut):L.framebufferTexture2D(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,Wt.__webglTexture,O),Gt?L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,Lt.__webglTexture,ne,mt+Ut):L.framebufferTexture2D(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,Lt.__webglTexture,ne),O!==0?L.blitFramebuffer(Ie,Ce,me,_e,Ye,tt,me,_e,L.COLOR_BUFFER_BIT,L.NEAREST):Gt?L.copyTexSubImage3D(N,ne,Ye,tt,mt+Ut,Ie,Ce,me,_e):L.copyTexSubImage2D(N,ne,Ye,tt,Ie,Ce,me,_e);Ae.bindFramebuffer(L.READ_FRAMEBUFFER,null),Ae.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else Gt?x.isDataTexture||x.isData3DTexture?L.texSubImage3D(N,ne,Ye,tt,mt,me,_e,xe,f,S,ft.data):F.isCompressedArrayTexture?L.compressedTexSubImage3D(N,ne,Ye,tt,mt,me,_e,xe,f,ft.data):L.texSubImage3D(N,ne,Ye,tt,mt,me,_e,xe,f,S,ft):x.isDataTexture?L.texSubImage2D(L.TEXTURE_2D,ne,Ye,tt,me,_e,f,S,ft.data):x.isCompressedTexture?L.compressedTexSubImage2D(L.TEXTURE_2D,ne,Ye,tt,ft.width,ft.height,f,ft.data):L.texSubImage2D(L.TEXTURE_2D,ne,Ye,tt,me,_e,f,S,ft);L.pixelStorei(L.UNPACK_ROW_LENGTH,V),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,ae),L.pixelStorei(L.UNPACK_SKIP_PIXELS,ke),L.pixelStorei(L.UNPACK_SKIP_ROWS,Fe),L.pixelStorei(L.UNPACK_SKIP_IMAGES,dt),ne===0&&F.generateMipmaps&&L.generateMipmap(N),Ae.unbindTexture()},this.copyTextureToTexture3D=function(x,F,H=null,G=null,O=0){return Fr('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(x,F,H,G,O)},this.initRenderTarget=function(x){be.get(x).__webglFramebuffer===void 0&&A.setupRenderTarget(x)},this.initTexture=function(x){x.isCubeTexture?A.setTextureCube(x,0):x.isData3DTexture?A.setTexture3D(x,0):x.isDataArrayTexture||x.isCompressedArrayTexture?A.setTexture2DArray(x,0):A.setTexture2D(x,0),Ae.unbindTexture()},this.resetState=function(){P=0,R=0,D=null,Ae.reset(),rt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Sn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=nt._getDrawingBufferColorSpace(e),t.unpackColorSpace=nt._getUnpackColorSpace()}}const Ho={type:"change"},Ba={type:"start"},Rc={type:"end"},Rr=new fc,Go=new Pn,lm=Math.cos(70*zl.DEG2RAD),St=new z,Nt=2*Math.PI,ot={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},Ps=1e-6;class um extends bu{constructor(e,t=null){super(e,t),this.state=ot.NONE,this.target=new z,this.cursor=new z,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Ei.ROTATE,MIDDLE:Ei.DOLLY,RIGHT:Ei.PAN},this.touches={ONE:xi.ROTATE,TWO:xi.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this._lastPosition=new z,this._lastQuaternion=new ti,this._lastTargetPosition=new z,this._quat=new ti().setFromUnitVectors(e.up,new z(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new go,this._sphericalDelta=new go,this._scale=1,this._panOffset=new z,this._rotateStart=new He,this._rotateEnd=new He,this._rotateDelta=new He,this._panStart=new He,this._panEnd=new He,this._panDelta=new He,this._dollyStart=new He,this._dollyEnd=new He,this._dollyDelta=new He,this._dollyDirection=new z,this._mouse=new He,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=fm.bind(this),this._onPointerDown=hm.bind(this),this._onPointerUp=dm.bind(this),this._onContextMenu=Sm.bind(this),this._onMouseWheel=gm.bind(this),this._onKeyDown=_m.bind(this),this._onTouchStart=vm.bind(this),this._onTouchMove=xm.bind(this),this._onMouseDown=pm.bind(this),this._onMouseMove=mm.bind(this),this._interceptControlDown=Mm.bind(this),this._interceptControlUp=Em.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(Ho),this.update(),this.state=ot.NONE}update(e=null){const t=this.object.position;St.copy(t).sub(this.target),St.applyQuaternion(this._quat),this._spherical.setFromVector3(St),this.autoRotate&&this.state===ot.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let i=this.minAzimuthAngle,r=this.maxAzimuthAngle;isFinite(i)&&isFinite(r)&&(i<-Math.PI?i+=Nt:i>Math.PI&&(i-=Nt),r<-Math.PI?r+=Nt:r>Math.PI&&(r-=Nt),i<=r?this._spherical.theta=Math.max(i,Math.min(r,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(i+r)/2?Math.max(i,this._spherical.theta):Math.min(r,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let s=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{const a=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),s=a!=this._spherical.radius}if(St.setFromSpherical(this._spherical),St.applyQuaternion(this._quatInverse),t.copy(this.target).add(St),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let a=null;if(this.object.isPerspectiveCamera){const o=St.length();a=this._clampDistance(o*this._scale);const l=o-a;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),s=!!l}else if(this.object.isOrthographicCamera){const o=new z(this._mouse.x,this._mouse.y,0);o.unproject(this.object);const l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),s=l!==this.object.zoom;const u=new z(this._mouse.x,this._mouse.y,0);u.unproject(this.object),this.object.position.sub(u).add(o),this.object.updateMatrixWorld(),a=St.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;a!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(a).add(this.object.position):(Rr.origin.copy(this.object.position),Rr.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Rr.direction))<lm?this.object.lookAt(this.target):(Go.setFromNormalAndCoplanarPoint(this.object.up,this.target),Rr.intersectPlane(Go,this.target))))}else if(this.object.isOrthographicCamera){const a=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),a!==this.object.zoom&&(this.object.updateProjectionMatrix(),s=!0)}return this._scale=1,this._performCursorZoom=!1,s||this._lastPosition.distanceToSquared(this.object.position)>Ps||8*(1-this._lastQuaternion.dot(this.object.quaternion))>Ps||this._lastTargetPosition.distanceToSquared(this.target)>Ps?(this.dispatchEvent(Ho),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?Nt/60*this.autoRotateSpeed*e:Nt/60/60*this.autoRotateSpeed}_getZoomScale(e){const t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){St.setFromMatrixColumn(t,0),St.multiplyScalar(-e),this._panOffset.add(St)}_panUp(e,t){this.screenSpacePanning===!0?St.setFromMatrixColumn(t,1):(St.setFromMatrixColumn(t,0),St.crossVectors(this.object.up,St)),St.multiplyScalar(e),this._panOffset.add(St)}_pan(e,t){const i=this.domElement;if(this.object.isPerspectiveCamera){const r=this.object.position;St.copy(r).sub(this.target);let s=St.length();s*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*s/i.clientHeight,this.object.matrix),this._panUp(2*t*s/i.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/i.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/i.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;const i=this.domElement.getBoundingClientRect(),r=e-i.left,s=t-i.top,a=i.width,o=i.height;this._mouse.x=r/a*2-1,this._mouse.y=-(s/o)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(Nt*this._rotateDelta.x/t.clientHeight),this._rotateUp(Nt*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(Nt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-Nt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(Nt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-Nt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._rotateStart.set(i,r)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._panStart.set(i,r)}}_handleTouchStartDolly(e){const t=this._getSecondPointerPosition(e),i=e.pageX-t.x,r=e.pageY-t.y,s=Math.sqrt(i*i+r*r);this._dollyStart.set(0,s)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{const i=this._getSecondPointerPosition(e),r=.5*(e.pageX+i.x),s=.5*(e.pageY+i.y);this._rotateEnd.set(r,s)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(Nt*this._rotateDelta.x/t.clientHeight),this._rotateUp(Nt*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._panEnd.set(i,r)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){const t=this._getSecondPointerPosition(e),i=e.pageX-t.x,r=e.pageY-t.y,s=Math.sqrt(i*i+r*r);this._dollyEnd.set(0,s),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);const a=(e.pageX+t.x)*.5,o=(e.pageY+t.y)*.5;this._updateZoomParameters(a,o)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new He,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){const t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){const t=e.deltaMode,i={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:i.deltaY*=16;break;case 2:i.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(i.deltaY*=10),i}}function hm(n){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(n.pointerId),this.domElement.addEventListener("pointermove",this._onPointerMove),this.domElement.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(n)&&(this._addPointer(n),n.pointerType==="touch"?this._onTouchStart(n):this._onMouseDown(n)))}function fm(n){this.enabled!==!1&&(n.pointerType==="touch"?this._onTouchMove(n):this._onMouseMove(n))}function dm(n){switch(this._removePointer(n),this._pointers.length){case 0:this.domElement.releasePointerCapture(n.pointerId),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(Rc),this.state=ot.NONE;break;case 1:const e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function pm(n){let e;switch(n.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case Ei.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(n),this.state=ot.DOLLY;break;case Ei.ROTATE:if(n.ctrlKey||n.metaKey||n.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(n),this.state=ot.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(n),this.state=ot.ROTATE}break;case Ei.PAN:if(n.ctrlKey||n.metaKey||n.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(n),this.state=ot.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(n),this.state=ot.PAN}break;default:this.state=ot.NONE}this.state!==ot.NONE&&this.dispatchEvent(Ba)}function mm(n){switch(this.state){case ot.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(n);break;case ot.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(n);break;case ot.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(n);break}}function gm(n){this.enabled===!1||this.enableZoom===!1||this.state!==ot.NONE||(n.preventDefault(),this.dispatchEvent(Ba),this._handleMouseWheel(this._customWheelEvent(n)),this.dispatchEvent(Rc))}function _m(n){this.enabled!==!1&&this._handleKeyDown(n)}function vm(n){switch(this._trackPointer(n),this._pointers.length){case 1:switch(this.touches.ONE){case xi.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(n),this.state=ot.TOUCH_ROTATE;break;case xi.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(n),this.state=ot.TOUCH_PAN;break;default:this.state=ot.NONE}break;case 2:switch(this.touches.TWO){case xi.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(n),this.state=ot.TOUCH_DOLLY_PAN;break;case xi.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(n),this.state=ot.TOUCH_DOLLY_ROTATE;break;default:this.state=ot.NONE}break;default:this.state=ot.NONE}this.state!==ot.NONE&&this.dispatchEvent(Ba)}function xm(n){switch(this._trackPointer(n),this.state){case ot.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(n),this.update();break;case ot.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(n),this.update();break;case ot.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(n),this.update();break;case ot.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(n),this.update();break;default:this.state=ot.NONE}}function Sm(n){this.enabled!==!1&&n.preventDefault()}function Mm(n){n.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function Em(n){n.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}const ki=new z;function $t(n,e,t,i,r,s){const a=2*Math.PI*r/4,o=Math.max(s-2*r,0),l=Math.PI/4;ki.copy(e),ki[i]=0,ki.normalize();const u=.5*a/(a+o),c=1-ki.angleTo(n)/l;return Math.sign(ki[t])===1?c*u:o/(a+o)+u+u*(1-c)}class ym extends Li{constructor(e=1,t=1,i=1,r=2,s=.1){if(r=r*2+1,s=Math.min(e/2,t/2,i/2,s),super(1,1,1,r,r,r),r===1)return;const a=this.toNonIndexed();this.index=null,this.attributes.position=a.attributes.position,this.attributes.normal=a.attributes.normal,this.attributes.uv=a.attributes.uv;const o=new z,l=new z,u=new z(e,t,i).divideScalar(2).subScalar(s),c=this.attributes.position.array,d=this.attributes.normal.array,p=this.attributes.uv.array,g=c.length/6,v=new z,M=.5/r;for(let m=0,h=0;m<c.length;m+=3,h+=2)switch(o.fromArray(c,m),l.copy(o),l.x-=Math.sign(l.x)*M,l.y-=Math.sign(l.y)*M,l.z-=Math.sign(l.z)*M,l.normalize(),c[m+0]=u.x*Math.sign(o.x)+l.x*s,c[m+1]=u.y*Math.sign(o.y)+l.y*s,c[m+2]=u.z*Math.sign(o.z)+l.z*s,d[m+0]=l.x,d[m+1]=l.y,d[m+2]=l.z,Math.floor(m/g)){case 0:v.set(1,0,0),p[h+0]=$t(v,l,"z","y",s,i),p[h+1]=1-$t(v,l,"y","z",s,t);break;case 1:v.set(-1,0,0),p[h+0]=1-$t(v,l,"z","y",s,i),p[h+1]=1-$t(v,l,"y","z",s,t);break;case 2:v.set(0,1,0),p[h+0]=1-$t(v,l,"x","z",s,e),p[h+1]=$t(v,l,"z","x",s,i);break;case 3:v.set(0,-1,0),p[h+0]=1-$t(v,l,"x","z",s,e),p[h+1]=1-$t(v,l,"z","x",s,i);break;case 4:v.set(0,0,1),p[h+0]=1-$t(v,l,"x","y",s,e),p[h+1]=1-$t(v,l,"y","x",s,t);break;case 5:v.set(0,0,-1),p[h+0]=$t(v,l,"x","y",s,e),p[h+1]=1-$t(v,l,"y","x",s,t);break}}}var Wo=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function bm(n){return n&&n.__esModule&&Object.prototype.hasOwnProperty.call(n,"default")?n.default:n}var Hi={exports:{}},Tm=Hi.exports,Xo;function Am(){return Xo||(Xo=1,function(n,e){(function(t,i,r){var s=e&&!e.nodeType&&e,a=n&&!n.nodeType&&n,o=s&&a&&typeof Wo=="object"&&Wo,l=a&&a.exports===s&&s;o&&(o.global===o||o.window===o||o.self===o)&&(t=o),r(s&&a?l?a.exports:s:t[i]={})})(Tm,"luaparse",function(t){t.version="0.3.1";var i,r,s,a,o,l=t.defaultOptions={wait:!1,comments:!0,scope:!1,locations:!1,ranges:!1,onCreateNode:null,onCreateScope:null,onDestroyScope:null,onLocalDeclaration:null,luaVersion:"5.1",encodingMode:"none"};function u(f,S){return S=S||0,f<128?String.fromCharCode(f):f<2048?String.fromCharCode(S|192|f>>6,S|128|f&63):f<65536?String.fromCharCode(S|224|f>>12,S|128|f>>6&63,S|128|f&63):f<1114112?String.fromCharCode(S|240|f>>18,S|128|f>>12&63,S|128|f>>6&63,S|128|f&63):null}function c(f,S){for(var N=f.toString(16);N.length<S;)N="0"+N;return N}function d(f){return function(S){var N=f.exec(S);if(!N)return S;Y(null,P.invalidCodeUnit,c(N[0].charCodeAt(0),4).toUpperCase())}}var p={"pseudo-latin1":{fixup:d(/[^\x00-\xff]/),encodeByte:function(f){return f===null?"":String.fromCharCode(f)},encodeUTF8:function(f){return u(f)}},"x-user-defined":{fixup:d(/[^\x00-\x7f\uf780-\uf7ff]/),encodeByte:function(f){return f===null?"":f>=128?String.fromCharCode(f|63232):String.fromCharCode(f)},encodeUTF8:function(f){return u(f,63232)}},none:{discardStrings:!0,fixup:function(f){return f},encodeByte:function(f){return""},encodeUTF8:function(f){return""}}},g=1,v=2,M=4,m=8,h=16,T=32,w=64,b=128,B=256;t.tokenTypes={EOF:g,StringLiteral:v,Keyword:M,Identifier:m,NumericLiteral:h,Punctuator:T,BooleanLiteral:w,NilLiteral:b,VarargLiteral:B};var P=t.errors={unexpected:"unexpected %1 '%2' near '%3'",unexpectedEOF:"unexpected symbol near '<eof>'",expected:"'%1' expected near '%2'",expectedToken:"%1 expected near '%2'",unfinishedString:"unfinished string near '%1'",malformedNumber:"malformed number near '%1'",decimalEscapeTooLarge:"decimal escape too large near '%1'",invalidEscape:"invalid escape sequence near '%1'",hexadecimalDigitExpected:"hexadecimal digit expected near '%1'",braceExpected:"missing '%1' near '%2'",tooLargeCodepoint:"UTF-8 value too large near '%1'",unfinishedLongString:"unfinished long string (starting at line %1) near '%2'",unfinishedLongComment:"unfinished long comment (starting at line %1) near '%2'",ambiguousSyntax:"ambiguous syntax (function call x new statement) near '%1'",noLoopToBreak:"no loop to break near '%1'",labelAlreadyDefined:"label '%1' already defined on line %2",labelNotVisible:"no visible label '%1' for <goto>",gotoJumpInLocalScope:"<goto %1> jumps into the scope of local '%2'",cannotUseVararg:"cannot use '...' outside a vararg function near '%1'",invalidCodeUnit:"code unit U+%1 is not allowed in the current encoding mode"},R=t.ast={labelStatement:function(f){return{type:"LabelStatement",label:f}},breakStatement:function(){return{type:"BreakStatement"}},gotoStatement:function(f){return{type:"GotoStatement",label:f}},returnStatement:function(f){return{type:"ReturnStatement",arguments:f}},ifStatement:function(f){return{type:"IfStatement",clauses:f}},ifClause:function(f,S){return{type:"IfClause",condition:f,body:S}},elseifClause:function(f,S){return{type:"ElseifClause",condition:f,body:S}},elseClause:function(f){return{type:"ElseClause",body:f}},whileStatement:function(f,S){return{type:"WhileStatement",condition:f,body:S}},doStatement:function(f){return{type:"DoStatement",body:f}},repeatStatement:function(f,S){return{type:"RepeatStatement",condition:f,body:S}},localStatement:function(f,S){return{type:"LocalStatement",variables:f,init:S}},assignmentStatement:function(f,S){return{type:"AssignmentStatement",variables:f,init:S}},callStatement:function(f){return{type:"CallStatement",expression:f}},functionStatement:function(f,S,N,V){return{type:"FunctionDeclaration",identifier:f,isLocal:N,parameters:S,body:V}},forNumericStatement:function(f,S,N,V,ae){return{type:"ForNumericStatement",variable:f,start:S,end:N,step:V,body:ae}},forGenericStatement:function(f,S,N){return{type:"ForGenericStatement",variables:f,iterators:S,body:N}},chunk:function(f){return{type:"Chunk",body:f}},identifier:function(f){return{type:"Identifier",name:f}},literal:function(f,S,N){return f=f===v?"StringLiteral":f===h?"NumericLiteral":f===w?"BooleanLiteral":f===b?"NilLiteral":"VarargLiteral",{type:f,value:S,raw:N}},tableKey:function(f,S){return{type:"TableKey",key:f,value:S}},tableKeyString:function(f,S){return{type:"TableKeyString",key:f,value:S}},tableValue:function(f){return{type:"TableValue",value:f}},tableConstructorExpression:function(f){return{type:"TableConstructorExpression",fields:f}},binaryExpression:function(f,S,N){var V=f==="and"||f==="or"?"LogicalExpression":"BinaryExpression";return{type:V,operator:f,left:S,right:N}},unaryExpression:function(f,S){return{type:"UnaryExpression",operator:f,argument:S}},memberExpression:function(f,S,N){return{type:"MemberExpression",indexer:S,identifier:N,base:f}},indexExpression:function(f,S){return{type:"IndexExpression",base:f,index:S}},callExpression:function(f,S){return{type:"CallExpression",base:f,arguments:S}},tableCallExpression:function(f,S){return{type:"TableCallExpression",base:f,arguments:S}},stringCallExpression:function(f,S){return{type:"StringCallExpression",base:f,argument:S}},comment:function(f,S){return{type:"Comment",value:f,raw:S}}};function D(f){if(ze){var S=we.pop();S.complete(),S.bless(f)}return r.onCreateNode&&r.onCreateNode(f),f}var y=Array.prototype.slice,E=function(f,S){for(var N=0,V=f.length;N<V;++N)if(f[N]===S)return N;return-1};Array.prototype.indexOf&&(E=function(f,S){return f.indexOf(S)});function U(f,S,N){for(var V=0,ae=f.length;V<ae;++V)if(f[V][S]===N)return V;return-1}function Q(f){var S=y.call(arguments,1);return f=f.replace(/%(\d)/g,function(N,V){return""+S[V-1]||""}),f}var X=function(f){for(var S=y.call(arguments,1),N,V,ae=0,ke=S.length;ae<ke;++ae){N=S[ae];for(V in N)Object.prototype.hasOwnProperty.call(N,V)&&(f[V]=N[V])}return f};Object.assign&&(X=Object.assign),t.SyntaxError=SyntaxError;function ie(f){return Object.create?Object.create(f,{line:{writable:!0,value:f.line},index:{writable:!0,value:f.index},column:{writable:!0,value:f.column}}):f}function Y(f){var S=Q.apply(null,y.call(arguments,1)),N,V;throw f===null||typeof f.line>"u"?(V=C-pe+1,N=ie(new SyntaxError(Q("[%1:%2] %3",se,V,S))),N.index=C,N.line=se,N.column=V):(V=f.range[0]-f.lineStart,N=ie(new SyntaxError(Q("[%1:%2] %3",f.line,V,S))),N.line=f.line,N.index=f.range[0],N.column=V),N}function ee(f){var S=i.slice(f.range[0],f.range[1]);return S||f.value}function re(f,S){Y(S,P.expectedToken,f,ee(S))}function K(f){var S=ee(Ne);if(typeof f.type<"u"){var N;switch(f.type){case v:N="string";break;case M:N="keyword";break;case m:N="identifier";break;case h:N="number";break;case T:N="symbol";break;case w:N="boolean";break;case b:return Y(f,P.unexpected,"symbol","nil",S);case g:return Y(f,P.unexpectedEOF)}return Y(f,P.unexpected,N,ee(f),S)}return Y(f,P.unexpected,"symbol",f,S)}var C,$,ve,Ne,it,j,se,pe;t.lex=ue;function ue(){for(Ze();i.charCodeAt(C)===45&&i.charCodeAt(C+1)===45;)_(),Ze();if(C>=s)return{type:g,value:"<eof>",line:se,lineStart:pe,range:[C,C]};var f=i.charCodeAt(C),S=i.charCodeAt(C+1);if(j=C,oe(f))return Le();switch(f){case 39:case 34:return $e();case 48:case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:return Pt();case 46:return ge(S)?Pt():S===46?i.charCodeAt(C+2)===46?ht():Ge(".."):Ge(".");case 61:return Ge(S===61?"==":"=");case 62:return a.bitwiseOperators&&S===62?Ge(">>"):Ge(S===61?">=":">");case 60:return a.bitwiseOperators&&S===60?Ge("<<"):Ge(S===61?"<=":"<");case 126:if(S===61)return Ge("~=");if(!a.bitwiseOperators)break;return Ge("~");case 58:return a.labels&&S===58?Ge("::"):Ge(":");case 91:return S===91||S===61?L():Ge("[");case 47:return a.integerDivision&&S===47?Ge("//"):Ge("/");case 38:case 124:if(!a.bitwiseOperators)break;case 42:case 94:case 37:case 44:case 123:case 125:case 93:case 40:case 41:case 59:case 35:case 45:case 43:return Ge(i.charAt(C))}return K(i.charAt(C))}function Re(){var f=i.charCodeAt(C),S=i.charCodeAt(C+1);return le(f)?(f===10&&S===13&&++C,f===13&&S===10&&++C,++se,pe=++C,!0):!1}function Ze(){for(;C<s;){var f=i.charCodeAt(C);if(ye(f))++C;else if(!Re())break}}function Le(){for(var f,S;Se(i.charCodeAt(++C)););return f=o.fixup(i.slice(j,C)),Pe(f)?S=M:f==="true"||f==="false"?(S=w,f=f==="true"):f==="nil"?(S=b,f=null):S=m,{type:S,value:f,line:se,lineStart:pe,range:[j,C]}}function Ge(f){return C+=f.length,{type:T,value:f,line:se,lineStart:pe,range:[j,C]}}function ht(){return C+=3,{type:B,value:"...",line:se,lineStart:pe,range:[j,C]}}function $e(){for(var f=i.charCodeAt(C++),S=se,N=pe,V=C,ae=o.discardStrings?null:"",ke;ke=i.charCodeAt(C++),f!==ke;)if((C>s||le(ke))&&(ae+=i.slice(V,C-1),Y(null,P.unfinishedString,i.slice(j,C-1))),ke===92){if(!o.discardStrings){var Fe=i.slice(V,C-1);ae+=o.fixup(Fe)}var dt=A();o.discardStrings||(ae+=dt),V=C}return o.discardStrings||(ae+=o.encodeByte(null),ae+=o.fixup(i.slice(V,C-1))),{type:v,value:ae,line:S,lineStart:N,lastLine:se,lastLineStart:pe,range:[j,C]}}function L(){var f=se,S=pe,N=k(!1);return N===!1&&Y($,P.expected,"[",ee($)),{type:v,value:o.discardStrings?null:o.fixup(N),line:f,lineStart:S,lastLine:se,lastLineStart:pe,range:[j,C]}}function Pt(){var f=i.charAt(C),S=i.charAt(C+1),N=f==="0"&&"xX".indexOf(S||null)>=0?Ae():ct(),V=Je(),ae=qe();return ae&&(V||N.hasFractionPart)&&Y(null,P.malformedNumber,i.slice(j,C)),{type:h,value:N.value,line:se,lineStart:pe,range:[j,C]}}function Je(){if(a.imaginaryNumbers)return"iI".indexOf(i.charAt(C)||null)>=0?(++C,!0):!1}function qe(){if(a.integerSuffixes){if("uU".indexOf(i.charAt(C)||null)>=0)if(++C,"lL".indexOf(i.charAt(C)||null)>=0){if(++C,"lL".indexOf(i.charAt(C)||null)>=0)return++C,"ULL";Y(null,P.malformedNumber,i.slice(j,C))}else Y(null,P.malformedNumber,i.slice(j,C));else if("lL".indexOf(i.charAt(C)||null)>=0){if(++C,"lL".indexOf(i.charAt(C)||null)>=0)return++C,"LL";Y(null,P.malformedNumber,i.slice(j,C))}}}function Ae(){var f=0,S=1,N=1,V,ae,ke,Fe;for(Fe=C+=2,Be(i.charCodeAt(C))||Y(null,P.malformedNumber,i.slice(j,C));Be(i.charCodeAt(C));)++C;V=parseInt(i.slice(Fe,C),16);var dt=!1;if(i.charAt(C)==="."){for(dt=!0,ae=++C;Be(i.charCodeAt(C));)++C;f=i.slice(ae,C),f=ae===C?0:parseInt(f,16)/Math.pow(16,C-ae)}var st=!1;if("pP".indexOf(i.charAt(C)||null)>=0){for(st=!0,++C,"+-".indexOf(i.charAt(C)||null)>=0&&(N=i.charAt(C++)==="+"?1:-1),ke=C,ge(i.charCodeAt(C))||Y(null,P.malformedNumber,i.slice(j,C));ge(i.charCodeAt(C));)++C;S=i.slice(ke,C),S=Math.pow(2,S*N)}return{value:(V+f)*S,hasFractionPart:dt||st}}function ct(){for(;ge(i.charCodeAt(C));)++C;var f=!1;if(i.charAt(C)===".")for(f=!0,++C;ge(i.charCodeAt(C));)++C;var S=!1;if("eE".indexOf(i.charAt(C)||null)>=0)for(S=!0,++C,"+-".indexOf(i.charAt(C)||null)>=0&&++C,ge(i.charCodeAt(C))||Y(null,P.malformedNumber,i.slice(j,C));ge(i.charCodeAt(C));)++C;return{value:parseFloat(i.slice(j,C)),hasFractionPart:f||S}}function be(){var f=C++;for(i.charAt(C++)!=="{"&&Y(null,P.braceExpected,"{","\\"+i.slice(f,C)),Be(i.charCodeAt(C))||Y(null,P.hexadecimalDigitExpected,"\\"+i.slice(f,C));i.charCodeAt(C)===48;)++C;for(var S=C;Be(i.charCodeAt(C));)++C,C-S>6&&Y(null,P.tooLargeCodepoint,"\\"+i.slice(f,C));var N=i.charAt(C++);N!=="}"&&(N==='"'||N==="'"?Y(null,P.braceExpected,"}","\\"+i.slice(f,C--)):Y(null,P.hexadecimalDigitExpected,"\\"+i.slice(f,C)));var V=parseInt(i.slice(S,C-1)||"0",16),ae="\\"+i.slice(f,C);return V>1114111&&Y(null,P.tooLargeCodepoint,ae),o.encodeUTF8(V,ae)}function A(){var f=C;switch(i.charAt(C)){case"a":return++C,"\x07";case"n":return++C,`
`;case"r":return++C,"\r";case"t":return++C,"	";case"v":return++C,"\v";case"b":return++C,"\b";case"f":return++C,"\f";case"\r":case`
`:return Re(),`
`;case"0":case"1":case"2":case"3":case"4":case"5":case"6":case"7":case"8":case"9":for(;ge(i.charCodeAt(C))&&C-f<3;)++C;var S=i.slice(f,C),N=parseInt(S,10);return N>255&&Y(null,P.decimalEscapeTooLarge,"\\"+N),o.encodeByte(N,"\\"+S);case"z":if(a.skipWhitespaceEscape)return++C,Ze(),"";break;case"x":if(a.hexEscapes){if(Be(i.charCodeAt(C+1))&&Be(i.charCodeAt(C+2)))return C+=3,o.encodeByte(parseInt(i.slice(f+1,C),16),"\\"+i.slice(f,C));Y(null,P.hexadecimalDigitExpected,"\\"+i.slice(f,C+2))}break;case"u":if(a.unicodeEscapes)return be();break;case"\\":case'"':case"'":return i.charAt(C++)}return a.strictEscapes&&Y(null,P.invalidEscape,"\\"+i.slice(f,C+1)),i.charAt(C++)}function _(){j=C,C+=2;var f=i.charAt(C),S="",N=!1,V=C,ae=pe,ke=se;if(f==="["&&(S=k(!0),S===!1?S=f:N=!0),!N){for(;C<s&&!le(i.charCodeAt(C));)++C;r.comments&&(S=i.slice(V,C))}if(r.comments){var Fe=R.comment(S,i.slice(j,C));r.locations&&(Fe.loc={start:{line:ke,column:j-ae},end:{line:se,column:C-pe}}),r.ranges&&(Fe.range=[j,C]),r.onCreateNode&&r.onCreateNode(Fe),it.push(Fe)}}function k(f){var S=0,N="",V=!1,ae,ke,Fe=se;for(++C;i.charAt(C+S)==="=";)++S;if(i.charAt(C+S)!=="[")return!1;for(C+=S+1,le(i.charCodeAt(C))&&Re(),ke=C;C<s;){for(;le(i.charCodeAt(C));)Re();if(ae=i.charAt(C++),ae==="]"){V=!0;for(var dt=0;dt<S;++dt)i.charAt(C+dt)!=="="&&(V=!1);i.charAt(C+S)!=="]"&&(V=!1)}if(V)return N+=i.slice(ke,C-1),C+=S+1,N}Y(null,f?P.unfinishedLongComment:P.unfinishedLongString,Fe,"<eof>")}function q(){ve=$,$=Ne,Ne=ue()}function J(f){return f===$.value?(q(),!0):!1}function W(f){f===$.value?q():Y($,P.expected,f,ee($))}function ye(f){return f===9||f===32||f===11||f===12}function le(f){return f===10||f===13}function ge(f){return f>=48&&f<=57}function Be(f){return f>=48&&f<=57||f>=97&&f<=102||f>=65&&f<=70}function oe(f){return!!(f>=65&&f<=90||f>=97&&f<=122||f===95||a.extendedIdentifiers&&f>=128)}function Se(f){return!!(f>=65&&f<=90||f>=97&&f<=122||f===95||f>=48&&f<=57||a.extendedIdentifiers&&f>=128)}function Pe(f){switch(f.length){case 2:return f==="do"||f==="if"||f==="in"||f==="or";case 3:return f==="and"||f==="end"||f==="for"||f==="not";case 4:return f==="else"||f==="then"?!0:a.labels&&!a.contextualGoto?f==="goto":!1;case 5:return f==="break"||f==="local"||f==="until"||f==="while";case 6:return f==="elseif"||f==="repeat"||f==="return";case 8:return f==="function"}return!1}function De(f){return T===f.type?"#-~".indexOf(f.value)>=0:M===f.type?f.value==="not":!1}function Me(f){if(g===f.type)return!0;if(M!==f.type)return!1;switch(f.value){case"else":case"elseif":case"end":case"until":return!0;default:return!1}}var Oe,Ue,rt;function I(){var f=Oe[Ue++].slice();Oe.push(f),r.onCreateScope&&r.onCreateScope()}function ce(){Oe.pop(),--Ue,r.onDestroyScope&&r.onDestroyScope()}function Z(f){r.onLocalDeclaration&&r.onLocalDeclaration(f),E(Oe[Ue],f)===-1&&Oe[Ue].push(f)}function te(f){Z(f.name),he(f,!0)}function he(f,S){!S&&U(rt,"name",f.name)===-1&&rt.push(f),f.isLocal=S}function fe(f){return E(Oe[Ue],f)!==-1}var we=[],ze;function lt(){return new Qe($)}function Qe(f){r.locations&&(this.loc={start:{line:f.line,column:f.range[0]-f.lineStart},end:{line:0,column:0}}),r.ranges&&(this.range=[f.range[0],0])}Qe.prototype.complete=function(){r.locations&&(this.loc.end.line=ve.lastLine||ve.line,this.loc.end.column=ve.range[1]-(ve.lastLineStart||ve.lineStart)),r.ranges&&(this.range[1]=ve.range[1])},Qe.prototype.bless=function(f){if(this.loc){var S=this.loc;f.loc={start:{line:S.start.line,column:S.start.column},end:{line:S.end.line,column:S.end.column}}}this.range&&(f.range=[this.range[0],this.range[1]])};function bt(){ze&&we.push(lt())}function pt(f){ze&&we.push(f)}function Ht(){this.scopes=[],this.pendingGotos=[]}Ht.prototype.isInLoop=function(){for(var f=this.scopes.length;f-- >0;)if(this.scopes[f].isLoop)return!0;return!1},Ht.prototype.pushScope=function(f){var S={labels:{},locals:[],deferredGotos:[],isLoop:!!f};this.scopes.push(S)},Ht.prototype.popScope=function(){for(var f=0;f<this.pendingGotos.length;++f){var S=this.pendingGotos[f];S.maxDepth>=this.scopes.length&&--S.maxDepth<=0&&Y(S.token,P.labelNotVisible,S.target)}this.scopes.pop()},Ht.prototype.addGoto=function(f,S){for(var N=[],V=0;V<this.scopes.length;++V){var ae=this.scopes[V];if(N.push(ae.locals.length),Object.prototype.hasOwnProperty.call(ae.labels,f))return}this.pendingGotos.push({maxDepth:this.scopes.length,target:f,token:S,localCounts:N})},Ht.prototype.addLabel=function(f,S){var N=this.currentScope();if(Object.prototype.hasOwnProperty.call(N.labels,f))Y(S,P.labelAlreadyDefined,f,N.labels[f].line);else{for(var V=[],ae=0;ae<this.pendingGotos.length;++ae){var ke=this.pendingGotos[ae];if(ke.maxDepth>=this.scopes.length&&ke.target===f){ke.localCounts[this.scopes.length-1]<N.locals.length&&N.deferredGotos.push(ke);continue}V.push(ke)}this.pendingGotos=V}N.labels[f]={localCount:N.locals.length,line:S.line}},Ht.prototype.addLocal=function(f,S){this.currentScope().locals.push({name:f,token:S})},Ht.prototype.currentScope=function(){return this.scopes[this.scopes.length-1]},Ht.prototype.raiseDeferredErrors=function(){for(var f=this.currentScope(),S=f.deferredGotos,N=0;N<S.length;++N){var V=S[N];Y(V.token,P.gotoJumpInLocalScope,V.target,f.locals[V.localCounts[this.scopes.length-1]].name)}};function Zt(){this.level=0,this.loopLevels=[]}Zt.prototype.isInLoop=function(){return!!this.loopLevels.length},Zt.prototype.pushScope=function(f){++this.level,f&&this.loopLevels.push(this.level)},Zt.prototype.popScope=function(){var f=this.loopLevels,S=f.length;S&&f[S-1]===this.level&&f.pop(),--this.level},Zt.prototype.addGoto=Zt.prototype.addLabel=function(){throw new Error("This should never happen")},Zt.prototype.addLocal=Zt.prototype.raiseDeferredErrors=function(){};function sn(){return a.labels?new Ht:new Zt}function Ui(){q(),bt(),r.scope&&I();var f=sn();f.allowVararg=!0,f.pushScope();var S=Bt(f);return f.popScope(),r.scope&&ce(),g!==$.type&&K($),ze&&!S.length&&(ve=$),D(R.chunk(S))}function Bt(f){for(var S=[],N;!Me($);){if($.value==="return"||!a.relaxedBreak&&$.value==="break"){S.push(Ii(f));break}N=Ii(f),J(";"),N&&S.push(N)}return S}function Ii(f){if(bt(),T===$.type&&J("::"))return ri(f);if(a.emptyStatement&&J(";")){ze&&we.pop();return}if(f.raiseDeferredErrors(),M===$.type)switch($.value){case"local":return q(),Zr(f);case"if":return q(),jr(f);case"return":return q(),Yr(f);case"function":q();var S=H();return F(S);case"while":return q(),sr(f);case"for":return q(),Kr(f);case"repeat":return q(),qr(f);case"break":return q(),f.isInLoop()||Y($,P.noLoopToBreak,$.value),ir();case"do":return q(),rr(f);case"goto":return q(),zn(f)}return a.contextualGoto&&$.type===m&&$.value==="goto"&&Ne.type===m&&Ne.value!=="goto"?(q(),zn(f)):(ze&&we.pop(),Jr(f))}function ri(f){var S=$,N=x();return r.scope&&(Z("::"+S.value+"::"),he(N,!0)),W("::"),f.addLabel(S.value,S),D(R.labelStatement(N))}function ir(){return D(R.breakStatement())}function zn(f){var S=$.value,N=ve,V=x();return f.addGoto(S,N),D(R.gotoStatement(V))}function rr(f){r.scope&&I(),f.pushScope();var S=Bt(f);return f.popScope(),r.scope&&ce(),W("end"),D(R.doStatement(S))}function sr(f){var S=ne(f);W("do"),r.scope&&I(),f.pushScope(!0);var N=Bt(f);return f.popScope(),r.scope&&ce(),W("end"),D(R.whileStatement(S,N))}function qr(f){r.scope&&I(),f.pushScope(!0);var S=Bt(f);W("until"),f.raiseDeferredErrors();var N=ne(f);return f.popScope(),r.scope&&ce(),D(R.repeatStatement(N,S))}function Yr(f){var S=[];if($.value!=="end"){var N=O(f);for(N!=null&&S.push(N);J(",");)N=ne(f),S.push(N);J(";")}return D(R.returnStatement(S))}function jr(f){var S=[],N,V,ae;for(ze&&(ae=we[we.length-1],we.push(ae)),N=ne(f),W("then"),r.scope&&I(),f.pushScope(),V=Bt(f),f.popScope(),r.scope&&ce(),S.push(D(R.ifClause(N,V))),ze&&(ae=lt());J("elseif");)pt(ae),N=ne(f),W("then"),r.scope&&I(),f.pushScope(),V=Bt(f),f.popScope(),r.scope&&ce(),S.push(D(R.elseifClause(N,V))),ze&&(ae=lt());return J("else")&&(ze&&(ae=new Qe(ve),we.push(ae)),r.scope&&I(),f.pushScope(),V=Bt(f),f.popScope(),r.scope&&ce(),S.push(D(R.elseClause(V)))),W("end"),D(R.ifStatement(S))}function Kr(f){var S=x(),N;if(r.scope&&(I(),te(S)),J("=")){var V=ne(f);W(",");var ae=ne(f),ke=J(",")?ne(f):null;return W("do"),f.pushScope(!0),N=Bt(f),f.popScope(),W("end"),r.scope&&ce(),D(R.forNumericStatement(S,V,ae,ke,N))}else{for(var Fe=[S];J(",");)S=x(),r.scope&&te(S),Fe.push(S);W("in");var dt=[];do{var st=ne(f);dt.push(st)}while(J(","));return W("do"),f.pushScope(!0),N=Bt(f),f.popScope(),W("end"),r.scope&&ce(),D(R.forGenericStatement(Fe,dt,N))}}function Zr(f){var S,N=ve;if(m===$.type){var V=[],ae=[];do S=x(),V.push(S),f.addLocal(S.name,N);while(J(","));if(J("="))do{var ke=ne(f);ae.push(ke)}while(J(","));if(r.scope)for(var Fe=0,dt=V.length;Fe<dt;++Fe)te(V[Fe]);return D(R.localStatement(V,ae))}if(J("function"))return S=x(),f.addLocal(S.name,N),r.scope&&(te(S),I()),F(S,!0);re("<name>",$)}function Jr(f){var S,N,V,ae,ke,Fe=[];ze&&(N=lt());do{if(ze&&(S=lt()),m===$.type)ke=$.value,ae=x(),r.scope&&he(ae,fe(ke)),V=!0;else if($.value==="(")q(),ae=ne(f),W(")"),V=!1;else return K($);e:for(;;){switch(v===$.type?'"':$.value){case".":case"[":V=!0;break;case":":case"(":case"{":case'"':V=null;break;default:break e}ae=xe(ae,S,f)}if(Fe.push(ae),$.value!==",")break;if(!V)return K($);q()}while(!0);if(Fe.length===1&&V===null)return pt(S),D(R.callStatement(Fe[0]));if(!V)return K($);W("=");var dt=[];do dt.push(ne(f));while(J(","));return pt(N),D(R.assignmentStatement(Fe,dt))}function x(){bt();var f=$.value;return m!==$.type&&re("<name>",$),q(),D(R.identifier(f))}function F(f,S){var N=sn();N.pushScope();var V=[];if(W("("),!J(")"))for(;;){if(m===$.type){var ae=x();if(r.scope&&te(ae),V.push(ae),J(","))continue}else B===$.type?(N.allowVararg=!0,V.push(Te(N))):re("<name> or '...'",$);W(")");break}var ke=Bt(N);return N.popScope(),W("end"),r.scope&&ce(),S=S||!1,D(R.functionStatement(f,V,S,ke))}function H(){var f,S,N;for(ze&&(N=lt()),f=x(),r.scope&&(he(f,fe(f.name)),I());J(".");)pt(N),S=x(),f=D(R.memberExpression(f,".",S));return J(":")&&(pt(N),S=x(),f=D(R.memberExpression(f,":",S)),r.scope&&Z("self")),f}function G(f){for(var S=[],N,V;;){if(bt(),T===$.type&&J("["))N=ne(f),W("]"),W("="),V=ne(f),S.push(D(R.tableKey(N,V)));else if(m===$.type)Ne.value==="="?(N=x(),q(),V=ne(f),S.push(D(R.tableKeyString(N,V)))):(V=ne(f),S.push(D(R.tableValue(V))));else{if((V=O(f))==null){we.pop();break}S.push(D(R.tableValue(V)))}if(",;".indexOf($.value)>=0){q();continue}break}return W("}"),D(R.tableConstructorExpression(S))}function O(f){var S=_e(0,f);return S}function ne(f){var S=O(f);if(S==null)re("<expression>",$);else return S}function me(f){var S=f.charCodeAt(0),N=f.length;if(N===1)switch(S){case 94:return 12;case 42:case 47:case 37:return 10;case 43:case 45:return 9;case 38:return 6;case 126:return 5;case 124:return 4;case 60:case 62:return 3}else if(N===2)switch(S){case 47:return 10;case 46:return 8;case 60:case 62:return f==="<<"||f===">>"?7:3;case 61:case 126:return 3;case 111:return 1}else if(S===97&&f==="and")return 2;return 0}function _e(f,S){var N=$.value,V,ae;if(ze&&(ae=lt()),De($)){bt(),q();var ke=_e(10,S);ke==null&&re("<expression>",$),V=D(R.unaryExpression(N,ke))}if(V==null&&(V=Te(S),V==null&&(V=Ie(S))),V==null)return null;for(var Fe;N=$.value,Fe=T===$.type||M===$.type?me(N):0,!(Fe===0||Fe<=f);){(N==="^"||N==="..")&&--Fe,q();var dt=_e(Fe,S);dt==null&&re("<expression>",$),ze&&we.push(ae),V=D(R.binaryExpression(N,V,dt))}return V}function xe(f,S,N){var V,ae;if(T===$.type)switch($.value){case"[":return pt(S),q(),V=ne(N),W("]"),D(R.indexExpression(f,V));case".":return pt(S),q(),ae=x(),D(R.memberExpression(f,".",ae));case":":return pt(S),q(),ae=x(),f=D(R.memberExpression(f,":",ae)),pt(S),Ce(f,N);case"(":case"{":return pt(S),Ce(f,N)}else if(v===$.type)return pt(S),Ce(f,N);return null}function Ie(f){var S,N,V;if(ze&&(V=lt()),m===$.type)N=$.value,S=x(),r.scope&&he(S,fe(N));else if(J("("))S=ne(f),W(")");else return null;for(;;){var ae=xe(S,V,f);if(ae===null)break;S=ae}return S}function Ce(f,S){if(T===$.type)switch($.value){case"(":a.emptyStatement||$.line!==ve.line&&Y(null,P.ambiguousSyntax,$.value),q();var N=[],V=O(S);for(V!=null&&N.push(V);J(",");)V=ne(S),N.push(V);return W(")"),D(R.callExpression(f,N));case"{":bt(),q();var ae=G(S);return D(R.tableCallExpression(f,ae))}else if(v===$.type)return D(R.stringCallExpression(f,Te(S)));re("function arguments",$)}function Te(f){var S=v|h|w|b|B,N=$.value,V=$.type,ae;if(ze&&(ae=lt()),V===B&&!f.allowVararg&&Y($,P.cannotUseVararg,$.value),V&S){pt(ae);var ke=i.slice($.range[0],$.range[1]);return q(),D(R.literal(V,N,ke))}else{if(M===V&&N==="function")return pt(ae),q(),r.scope&&I(),F(null);if(J("{"))return pt(ae),G(f)}}t.parse=tt;var Ye={"5.1":{},"5.2":{labels:!0,emptyStatement:!0,hexEscapes:!0,skipWhitespaceEscape:!0,strictEscapes:!0,relaxedBreak:!0},"5.3":{labels:!0,emptyStatement:!0,hexEscapes:!0,skipWhitespaceEscape:!0,strictEscapes:!0,unicodeEscapes:!0,bitwiseOperators:!0,integerDivision:!0,relaxedBreak:!0},LuaJIT:{labels:!0,contextualGoto:!0,hexEscapes:!0,skipWhitespaceEscape:!0,strictEscapes:!0,unicodeEscapes:!0,imaginaryNumbers:!0,integerSuffixes:!0}};function tt(f,S){if(typeof S>"u"&&typeof f=="object"&&(S=f,f=void 0),S||(S={}),i=f||"",r=X({},l,S),C=0,se=1,pe=0,s=i.length,Oe=[[]],Ue=0,rt=[],we=[],!Object.prototype.hasOwnProperty.call(Ye,r.luaVersion))throw new Error(Q("Lua version '%1' not supported",r.luaVersion));if(a=X({},Ye[r.luaVersion]),r.extendedIdentifiers!==void 0&&(a.extendedIdentifiers=!!r.extendedIdentifiers),!Object.prototype.hasOwnProperty.call(p,r.encodingMode))throw new Error(Q("Encoding mode '%1' not supported",r.encodingMode));return o=p[r.encodingMode],r.comments&&(it=[]),r.wait?t:ft()}t.write=mt;function mt(f){return i+=String(f),s=i.length,t}t.end=ft;function ft(f){typeof f<"u"&&mt(f),i&&i.substr(0,2)==="#!"&&(i=i.replace(/^.*/,function(N){return N.replace(/./g," ")})),s=i.length,ze=r.locations||r.ranges,Ne=ue();var S=Ui();if(r.comments&&(S.comments=it),r.scope&&(S.globals=rt),we.length>0)throw new Error("Location tracking failed. This is most likely a bug in luaparse");return S}})}(Hi,Hi.exports)),Hi.exports}var wm=Am();const Rm=bm(wm);var Ls={};function Cm(n){if(Ls[n])return Ls[n];for(var e=[],t=0,i=0,r=!1,s="",a="",o="",l="",u="",c=0,d=n.length;i<d;++i){if(c=n.charCodeAt(i),!r){if(c!==37)continue;t<i&&e.push(["L",n.substring(t,i)]),t=i,r=!0;continue}if(c>=48&&c<58)l.length?l+=String.fromCharCode(c):c==48&&!o.length?a+=String.fromCharCode(c):o+=String.fromCharCode(c);else switch(c){case 36:l.length?l+="$":o.charAt(0)=="*"?o+="$":(s=o+"$",o="");break;case 39:a+="'";break;case 45:a+="-";break;case 43:a+="+";break;case 32:a+=" ";break;case 35:a+="#";break;case 46:l=".";break;case 42:l.charAt(0)=="."?l+="*":o+="*";break;case 104:case 108:if(u.length>1)throw"bad length "+u+String(c);u+=String.fromCharCode(c);break;case 76:case 106:case 122:case 116:case 113:case 90:case 119:if(u!=="")throw"bad length "+u+String.fromCharCode(c);u=String.fromCharCode(c);break;case 73:if(u!=="")throw"bad length "+u+"I";u="I";break;case 100:case 105:case 111:case 117:case 120:case 88:case 102:case 70:case 101:case 69:case 103:case 71:case 97:case 65:case 99:case 67:case 115:case 83:case 112:case 110:case 68:case 85:case 79:case 109:case 98:case 66:case 121:case 89:case 74:case 86:case 84:case 37:r=!1,l.length>1&&(l=l.substr(1)),e.push([String.fromCharCode(c),n.substring(t,i+1),s,a,o,l,u]),t=i+1,u=l=o=a=s="";break;default:throw new Error("Invalid format string starting with |"+n.substring(t,i+1)+"|")}}return t<n.length&&e.push(["L",n.substring(t)]),Ls[n]=e}var Pm=JSON.stringify;function Lm(n,e){for(var t="",i=0,r=0,s=0,a="",o=0;o<n.length;++o){var l=n[o],u=l[0].charCodeAt(0);if(u===76){t+=l[1];continue}if(u===37){t+="%";continue}var c="",d=0,p=10,g=4,v=!1,M=l[3],m=M.indexOf("#")>-1;if(l[2])i=parseInt(l[2],10)-1;else if(u===109&&!m){t+="Success";continue}var h=0;l[4].length>0&&(l[4].charAt(0)!=="*"?h=parseInt(l[4],10):l[4].length===1?h=e[r++]:h=e[parseInt(l[4].substr(1),10)-1]);var T=-1;l[5].length>0&&(l[5].charAt(0)!=="*"?T=parseInt(l[5],10):l[5].length===1?T=e[r++]:T=e[parseInt(l[5].substr(1),10)-1]),l[2]||(i=r++);var w=e[i],b=l[6];switch(u){case 83:case 115:c=String(w),T>=0&&(c=c.substr(0,T)),(h>c.length||-h>c.length)&&((M.indexOf("-")==-1||h<0)&&M.indexOf("0")!=-1?(a=h-c.length>=0?"0".repeat(h-c.length):"",c=a+c):(a=h-c.length>=0?" ".repeat(h-c.length):"",c=M.indexOf("-")>-1?c+a:a+c));break;case 67:case 99:switch(typeof w){case"number":var B=w;u==67||b.charCodeAt(0)===108?(B&=4294967295,c=String.fromCharCode(B)):(B&=255,c=String.fromCharCode(B));break;case"string":c=w.charAt(0);break;default:c=String(w).charAt(0)}(h>c.length||-h>c.length)&&((M.indexOf("-")==-1||h<0)&&M.indexOf("0")!=-1?(a=h-c.length>=0?"0".repeat(h-c.length):"",c=a+c):(a=h-c.length>=0?" ".repeat(h-c.length):"",c=M.indexOf("-")>-1?c+a:a+c));break;case 68:g=8;case 100:case 105:d=-1,v=!0;break;case 85:g=8;case 117:d=-1;break;case 79:g=8;case 111:d=-1,p=8;break;case 120:d=-1,p=-16;break;case 88:d=-1,p=16;break;case 66:g=8;case 98:d=-1,p=2;break;case 70:case 102:d=1;break;case 69:case 101:d=2;break;case 71:case 103:d=3;break;case 65:case 97:d=4;break;case 112:s=typeof w=="number"?w:w?Number(w.l):-1,isNaN(s)&&(s=-1),m?c=s.toString(10):(s=Math.abs(s),c="0x"+s.toString(16).toLowerCase());break;case 110:w&&(w.len=t.length);continue;case 109:w instanceof Error?w.message?c=w.message:w.errno?c="Error number "+w.errno:c="Error "+String(w):c="Success";break;case 74:c=(m?Pm:JSON.stringify)(w);break;case 86:c=w==null?"null":String(w.valueOf());break;case 84:m?(c=Object.prototype.toString.call(w).substr(8),c=c.substr(0,c.length-1)):c=typeof w;break;case 89:case 121:c=w?m?"yes":"true":m?"no":"false",u==89&&(c=c.toUpperCase()),T>=0&&(c=c.substr(0,T)),(h>c.length||-h>c.length)&&((M.indexOf("-")==-1||h<0)&&M.indexOf("0")!=-1?(a=h-c.length>=0?"0".repeat(h-c.length):"",c=a+c):(a=h-c.length>=0?" ".repeat(h-c.length):"",c=M.indexOf("-")>-1?c+a:a+c));break}if(h<0&&(h=-h,M+="-"),d==-1){switch(s=Number(w),b){case"hh":g=1;break;case"h":g=2;break;case"l":g==4&&(g=8);break;case"L":case"q":case"ll":g==4&&(g=8);break;case"j":g==4&&(g=8);break;case"t":g==4&&(g=8);break;case"z":case"Z":g==4&&(g=8);break;case"I":g==4&&(g=8);break}switch(g){case 1:s=s&255,v&&s>127&&(s-=256);break;case 2:s=s&65535,v&&s>32767&&(s-=65536);break;case 4:s=v?s|0:s>>>0;break;default:s=isNaN(s)?0:Math.round(s);break}if(g>4&&s<0&&!v)if(p==16||p==-16)c=(s>>>0).toString(16),s=Math.floor((s-(s>>>0))/Math.pow(2,32)),c=(s>>>0).toString(16)+(8-c.length>=0?"0".repeat(8-c.length):"")+c,c=(16-c.length>=0?"f".repeat(16-c.length):"")+c,p==16&&(c=c.toUpperCase());else if(p==8)c=(s>>>0).toString(8),c=(10-c.length>=0?"0".repeat(10-c.length):"")+c,s=Math.floor((s-(s>>>0&1073741823))/Math.pow(2,30)),c=(s>>>0).toString(8)+c.substr(c.length-10),c=c.substr(c.length-20),c="1"+(21-c.length>=0?"7".repeat(21-c.length):"")+c;else{s=-s%1e16;for(var P=[1,8,4,4,6,7,4,4,0,7,3,7,0,9,5,5,1,6,1,6],R=P.length-1;s>0;)(P[R]-=s%10)<0&&(P[R]+=10,P[R-1]--),--R,s=Math.floor(s/10);c=P.join("")}else p===-16?c=s.toString(16).toLowerCase():p===16?c=s.toString(16).toUpperCase():c=s.toString(p);if(T===0&&c=="0"&&!(p==8&&m))c="";else if(c.length<T+(c.substr(0,1)=="-"?1:0)&&(c.substr(0,1)!="-"?c=(T-c.length>=0?"0".repeat(T-c.length):"")+c:c=c.substr(0,1)+(T+1-c.length>=0?"0".repeat(T+1-c.length):"")+c.substr(1)),!v&&m&&s!==0)switch(p){case-16:c="0x"+c;break;case 16:c="0X"+c;break;case 8:c.charAt(0)!="0"&&(c="0"+c);break;case 2:c="0b"+c;break}v&&c.charAt(0)!="-"&&(M.indexOf("+")>-1?c="+"+c:M.indexOf(" ")>-1&&(c=" "+c)),h>0&&c.length<h&&(M.indexOf("-")>-1?c=c+(h-c.length>=0?" ".repeat(h-c.length):""):M.indexOf("0")>-1&&T<0&&c.length>0?(T>c.length&&(c=(T-c.length>=0?"0".repeat(T-c.length):"")+c),a=h-c.length>=0?(T>0?" ":"0").repeat(h-c.length):"",c.charCodeAt(0)<48?c.charAt(2).toLowerCase()=="x"?c=c.substr(0,3)+a+c.substring(3):c=c.substr(0,1)+a+c.substring(1):c.charAt(1).toLowerCase()=="x"?c=c.substr(0,2)+a+c.substring(2):c=a+c):c=(h-c.length>=0?" ".repeat(h-c.length):"")+c)}else if(d>0){s=Number(w),w===null&&(s=NaN),b=="L"&&(g=12);var D=isFinite(s);if(!D)s<0?c="-":M.indexOf("+")>-1?c="+":M.indexOf(" ")>-1&&(c=" "),c+=isNaN(s)?"nan":"inf";else{var y=0;T==-1&&d!=4&&(T=6),d==3&&(c=s.toExponential(1),y=+c.substr(c.indexOf("e")+1),T===0&&(T=1),T>y&&y>=-4?(d=11,T=T-(y+1)):(d=12,T=T-1));var E=s<0||1/s==-1/0?"-":"";switch(s<0&&(s=-s),d){case 1:case 11:if(s<1e21){c=s.toFixed(T),d==1?T===0&&m&&c.indexOf(".")==-1&&(c+="."):m?c.indexOf(".")==-1&&(c+="."):c=c.replace(/(\.\d*[1-9])0*$/,"$1").replace(/\.0*$/,"");break}c=s.toExponential(20),y=+c.substr(c.indexOf("e")+1),c=c.charAt(0)+c.substr(2,c.indexOf("e")-2),c=c+(y-c.length+1>=0?"0".repeat(y-c.length+1):""),(m||T>0&&d!==11)&&(c=c+"."+(T>=0?"0".repeat(T):""));break;case 2:case 12:c=s.toExponential(T),y=c.indexOf("e"),c.length-y===3&&(c=c.substr(0,y+2)+"0"+c.substr(y+2)),m&&c.indexOf(".")==-1?c=c.substr(0,y)+"."+c.substr(y):!m&&d==12&&(c=c.replace(/\.0*e/,"e").replace(/\.(\d*[1-9])0*e/,".$1e"));break;case 4:if(s===0){c="0x0"+(m||T>0?"."+(T>=0?"0".repeat(T):""):"")+"p+0";break}c=s.toString(16);var U=c.charCodeAt(0);if(U==48){for(U=2,y=-4,s*=16;c.charCodeAt(U++)==48;)y-=4,s*=16;c=s.toString(16),U=c.charCodeAt(0)}var Q=c.indexOf(".");if(c.indexOf("(")>-1){var X=c.match(/\(e(.*)\)/),ie=X?+X[1]:0;y+=4*ie,s/=Math.pow(16,ie)}else Q>1?(y+=4*(Q-1),s/=Math.pow(16,Q-1)):Q==-1&&(y+=4*(c.length-1),s/=Math.pow(16,c.length-1));if(g>8?U<50?(y-=3,s*=8):U<52?(y-=2,s*=4):U<56&&(y-=1,s*=2):U>=56?(y+=3,s/=8):U>=52?(y+=2,s/=4):U>=50&&(y+=1,s/=2),c=s.toString(16),c.length>1){if(c.length>T+2&&c.charCodeAt(T+2)>=56){var Y=c.charCodeAt(0)==102;c=(s+8*Math.pow(16,-T-1)).toString(16),Y&&c.charCodeAt(0)==49&&(y+=4)}T>0?(c=c.substr(0,T+2),c.length<T+2&&(c.charCodeAt(0)<48?c=c.charAt(0)+(T+2-c.length>=0?"0".repeat(T+2-c.length):"")+c.substr(1):c+=T+2-c.length>=0?"0".repeat(T+2-c.length):"")):T===0&&(c=c.charAt(0)+(m?".":""))}else T>0?c=c+"."+(T>=0?"0".repeat(T):""):m&&(c=c+".");c="0x"+c+"p"+(y>=0?"+"+y:y);break}E===""&&(M.indexOf("+")>-1?E="+":M.indexOf(" ")>-1&&(E=" ")),c=E+c}h>c.length&&(M.indexOf("-")>-1?c=c+(h-c.length>=0?" ".repeat(h-c.length):""):M.indexOf("0")>-1&&c.length>0&&D?(a=h-c.length>=0?"0".repeat(h-c.length):"",c.charCodeAt(0)<48?c.charAt(2).toLowerCase()=="x"?c=c.substr(0,3)+a+c.substring(3):c=c.substr(0,1)+a+c.substring(1):c.charAt(1).toLowerCase()=="x"?c=c.substr(0,2)+a+c.substring(2):c=a+c):c=(h-c.length>=0?" ".repeat(h-c.length):"")+c),u<96&&(c=c.toUpperCase())}t+=c}return t}function Cr(){for(var n=new Array(arguments.length-1),e=0;e<n.length;++e)n[e]=arguments[e+1];return Lm(Cm(arguments[0]),n)}class je extends Error{constructor(e){super(),this.message=e}toString(){return`LuaError: ${this.message}`}}class Ke{constructor(e){if(this.numValues=[void 0],this.strValues={},this.keys=[],this.values=[],this.metatable=null,e!==void 0){if(typeof e=="function"){e(this);return}if(Array.isArray(e)){this.insert(...e);return}for(const t in e)if(Dn(e,t)){let i=e[t];i===null&&(i=void 0),this.set(t,i)}}}get(e){const t=this.rawget(e);if(t===void 0&&this.metatable){const i=this.metatable.get("__index");if(i instanceof Ke)return i.get(e);if(typeof i=="function"){const r=i.call(void 0,this,e);return r instanceof Array?r[0]:r}}return t}rawget(e){switch(typeof e){case"string":if(Dn(this.strValues,e))return this.strValues[e];break;case"number":if(e>0&&e%1===0)return this.numValues[e]}const t=this.keys.indexOf(qi(e));return t===-1?void 0:this.values[t]}getMetaMethod(e){return this.metatable&&this.metatable.rawget(e)}set(e,t){const i=this.metatable&&this.metatable.get("__newindex");if(i&&this.rawget(e)===void 0){if(i instanceof Ke)return i.set(e,t);if(typeof i=="function")return i(this,e,t)}this.rawset(e,t)}setFn(e){return t=>this.set(e,t)}rawset(e,t){switch(typeof e){case"string":this.strValues[e]=t;return;case"number":if(e>0&&e%1===0){this.numValues[e]=t;return}}const i=qi(e),r=this.keys.indexOf(i);if(r>-1){this.values[r]=t;return}this.values[this.keys.length]=t,this.keys.push(i)}insert(...e){this.numValues.push(...e)}toObject(){const e=Object.keys(this.strValues).length===0&&this.getn()>0,t=e?[]:{};for(let i=1;i<this.numValues.length;i++){const r=this.numValues[i],s=r instanceof Ke?r.toObject():r;if(e){const a=t;a[i-1]=s}else{const a=t;a[String(i-1)]=s}}for(const i in this.strValues)if(Dn(this.strValues,i)){const r=this.strValues[i],s=r instanceof Ke?r.toObject():r,a=t;a[i]=s}return t}getn(){const e=this.numValues,t=[];for(const r in e)Dn(e,r)&&(t[r]=!0);let i=0;for(;t[i+1];)i+=1;if(i>0&&e[i]===void 0){let r=0;for(;i-r>1;){const s=Math.floor((r+i)/2);e[s]===void 0?i=s:r=s}return r}return i}}const Dm=/^[-+]?[0-9]*\.?([0-9]+([eE][-+]?[0-9]+)?)?$/,Um=/^(-)?0x([0-9a-fA-F]*)\.?([0-9a-fA-F]*)$/;function Qi(n){const e=typeof n;switch(e){case"undefined":return"nil";case"number":case"string":case"boolean":case"function":return e;case"object":if(n instanceof Ke)return"table";if(n instanceof Function)return"function"}}function qi(n){if(n instanceof Ke){const t=n.getMetaMethod("__tostring");return t?t(n)[0]:e(n,"table: 0x")}if(n instanceof Function)return e(n,"function: 0x");return Yi(n);function e(t,i){const r=t.toString();if(r.indexOf(i)>-1)return r;const s=i+Math.floor(Math.random()*4294967295).toString(16);return t.toString=()=>s,s}}function ya(n,e){return n>=0?n:-n>e?0:e+n+1}function Cc(n,e){if(e)throw new je(`${e}`.replace(/%type/gi,Qi(n)))}function er(n){return!(n===!1||n===void 0)}function On(n,e){if(typeof n=="number")return n;switch(n){case void 0:return;case"inf":return 1/0;case"-inf":return-1/0;case"nan":return NaN}const t=`${n}`;if(t.match(Dm))return parseFloat(t);const i=t.match(Um);if(i){const[,r,s,a]=i;let o=parseInt(s,16)||0;return a&&(o+=parseInt(a,16)/Math.pow(16,a.length)),r&&(o*=-1),o}e!==void 0&&Cc(n,e)}function Yi(n,e){if(typeof n=="string")return n;switch(n){case void 0:case null:return"nil";case 1/0:return"inf";case-1/0:return"-inf"}if(typeof n=="number")return Number.isNaN(n)?"nan":`${n}`;if(typeof n=="boolean")return`${n}`;if(e===void 0)return"nil";Cc(n,e)}function Pc(n,e,t,i,r){return e(n,`bad argument #${r} to '${i}' (${t} expected, got %type)`)}function Ee(n,e,t){return Pc(n,On,"number",e,t)}function ut(n,e,t){return Pc(n,Yi,"string",e,t)}function Ct(n,e,t){if(n instanceof Ke)return n;{const i=Qi(n);throw new je(`bad argument #${t} to '${e}' (table expected, got ${i})`)}}function Im(n,e,t){if(n instanceof Function)return n;{const i=Qi(n);throw new je(`bad argument #${t} to '${e}' (function expected, got ${i})`)}}const $o=n=>n instanceof Array?n:[n],Dn=(n,e)=>Object.prototype.hasOwnProperty.call(n,e);class za{constructor(e={}){this._variables=e}get(e){return this._variables[e]}set(e,t){Dn(this._variables,e)||!this.parent?this.setLocal(e,t):this.parent.set(e,t)}setLocal(e,t){this._variables[e]=t}setVarargs(e){this._varargs=e}getVarargs(){return this._varargs||this.parent&&this.parent.getVarargs()||[]}extend(){const e=Object.create(this._variables),t=new za(e);return t.parent=this,t}}const Lc=n=>n.type==="IfClause"||n.type==="ElseifClause"||n.type==="ElseClause"||n.type==="WhileStatement"||n.type==="DoStatement"||n.type==="RepeatStatement"||n.type==="FunctionDeclaration"||n.type==="ForNumericStatement"||n.type==="ForGenericStatement"||n.type==="Chunk";class Ds extends String{constructor(e,t){super(),this.base=e,this.property=t}get(){return`__lua.get(${this.base}, ${this.property})`}set(e){return`${this.base}.set(${this.property}, ${e})`}setFn(){return`${this.base}.setFn(${this.property})`}toString(){return this.get()}valueOf(){return this.get()}}const Nm={not:"not","-":"unm","~":"bnot","#":"len"},Fm={"+":"add","-":"sub","*":"mul","%":"mod","^":"pow","/":"div","//":"idiv","&":"band","|":"bor","~":"bxor","<<":"shl",">>":"shr","..":"concat","~=":"neq","==":"eq","<":"lt","<=":"le",">":"gt",">=":"ge"},Kt=n=>{switch(n.type){case"LabelStatement":return`case '${n.label.name}': label = undefined`;case"BreakStatement":return"break";case"GotoStatement":return`label = '${n.label.name}'; continue`;case"ReturnStatement":return`return ${ba(n.arguments)}`;case"IfStatement":return n.clauses.map(t=>Kt(t)).join(" else ");case"IfClause":case"ElseifClause":{const e=xt(n.condition),t=_n(n);return`if (__lua.bool(${e})) {
${t}
}`}case"ElseClause":return`{
${_n(n)}
}`;case"WhileStatement":{const e=xt(n.condition),t=_n(n);return`while(${e}) {
${t}
}`}case"DoStatement":return`
${_n(n)}
`;case"RepeatStatement":{const e=xt(n.condition);return`do {
${_n(n)}
} while (!(${e}))`}case"LocalStatement":return qo(n);case"AssignmentStatement":return qo(n);case"CallStatement":return Kt(n.expression);case"FunctionDeclaration":{const e=r=>{const s=r.join(`;
`),a=_n(n,s),o=r.length===0?"":"...args",l=n.body.findIndex(u=>u.type==="ReturnStatement")===-1?`
return []`:"";return`(${o}) => {
${a}${l}
}`},t=n.parameters.map(r=>r.type==="VarargLiteral"?`$${qt.get(r)}.setVarargs(args)`:`$${qt.get(r)}.setLocal('${r.name}', args.shift())`);if(n.identifier===null)return e(t);if(n.identifier.type==="Identifier"){const r=qt.get(n.identifier),s=n.isLocal?"setLocal":"set";return`$${r}.${s}('${n.identifier.name}', ${e(t)})`}const i=Kt(n.identifier);return n.identifier.indexer===":"&&t.unshift(`$${qt.get(n)}.setLocal('self', args.shift())`),i.set(e(t))}case"ForNumericStatement":{const e=n.variable.name,t=xt(n.start),i=xt(n.end),r=n.step===null?1:xt(n.step),s=`let ${e} = ${t}, end = ${i}, step = ${r}`,a=`step > 0 ? ${e} <= end : ${e} >= end`,o=`${e} += step`,l=`$${qt.get(n.variable)}.setLocal('${e}', ${e});`,u=_n(n,l);return`for (${s}; ${a}; ${o}) {
${u}
}`}case"ForGenericStatement":{const e=ba(n.iterators),t=n.variables.map((r,s)=>`$${qt.get(r)}.setLocal('${r.name}', res[${s}])`).join(`;
`),i=_n(n,t);return`for (let [iterator, table, next] = ${e}, res = __lua.call(iterator, table, next); res[0] !== undefined; res = __lua.call(iterator, table, res[0])) {
${i}
}`}case"Chunk":return`'use strict'
const $0 = __lua.globalScope
let vars
let vals
let label

${_n(n)}`;case"Identifier":return`$${qt.get(n)}.get('${n.name}')`;case"StringLiteral":return`\`${n.value.replace(/([^\\])?\\(\d{1,3})/g,(t,i,r)=>`${i||""}${String.fromCharCode(r)}`).replace(/\\/g,"\\\\").replace(/`/g,"\\`")}\``;case"NumericLiteral":return n.value.toString();case"BooleanLiteral":return n.value?"true":"false";case"NilLiteral":return"undefined";case"VarargLiteral":return`$${qt.get(n)}.getVarargs()`;case"TableConstructorExpression":return n.fields.length===0?"new __lua.Table()":`new __lua.Table(t => {
${n.fields.map((t,i,r)=>{if(t.type==="TableKey")return`t.rawset(${Kt(t.key)}, ${xt(t.value)})`;if(t.type==="TableKeyString")return`t.rawset('${t.key.name}', ${xt(t.value)})`;if(t.type==="TableValue")return i===r.length-1&&Xr(t.value)?`t.insert(...${Kt(t.value)})`:`t.insert(${xt(t.value)})`}).join(`;
`)}
})`;case"UnaryExpression":{const e=Nm[n.operator],t=xt(n.argument);if(!e)throw new Error(`Unhandled unary operator: ${n.operator}`);return`__lua.${e}(${t})`}case"BinaryExpression":{const e=xt(n.left),t=xt(n.right),i=Fm[n.operator];if(!i)throw new Error(`Unhandled binary operator: ${n.operator}`);return`__lua.${i}(${e}, ${t})`}case"LogicalExpression":{const e=xt(n.left),t=xt(n.right),i=n.operator;if(i==="and")return`__lua.and(${e},${t})`;if(i==="or")return`__lua.or(${e},${t})`;throw new Error(`Unhandled logical operator: ${n.operator}`)}case"MemberExpression":{const e=xt(n.base);return new Ds(e,`'${n.identifier.name}'`)}case"IndexExpression":{const e=xt(n.base),t=xt(n.index);return new Ds(e,t)}case"CallExpression":case"TableCallExpression":case"StringCallExpression":{const e=xt(n.base),t=n.type==="CallExpression"?Dc(n.arguments).join(", "):xt(n.type==="TableCallExpression"?n.arguments:n.argument);return e instanceof Ds&&n.base.type==="MemberExpression"&&n.base.indexer===":"?`__lua.call(${e}, ${e.base}, ${t})`:`__lua.call(${e}, ${t})`}default:throw new Error(`No generator found for: ${n.type}`)}},_n=(n,e="")=>{const t=qt.get(n),i=t===void 0?"":`const $${t} = $${ka.get(t)}.extend();`,r=n.body.map(c=>Kt(c)).join(`;
`),s=Nc.get(n);if(s===void 0)return`${i}
${e}
${r}`;const a=`L${s}: do { switch(label) { case undefined:`,o=Ic.get(s),u=`${o===void 0?"":`break; default: continue L${o}
`}} } while (label)`;return`${i}
${a}
${e}
${r}
${u}`},xt=n=>{const e=Kt(n);return Xr(n)?`${e}[0]`:e},ba=n=>n.length===1&&Xr(n[0])?Kt(n[0]):`[${Dc(n).join(", ")}]`,Dc=n=>n.map((e,t,i)=>{const r=Kt(e);return Xr(e)?t===i.length-1?`...${r}`:`${r}[0]`:r}),qo=n=>{const e=[],t=[],i=n.variables.length>1&&n.init.length>0&&!n.init.every(Om);for(let r=0;r<n.variables.length;r++){const s=n.variables[r],a=n.init[r],o=i?`vars[${r}]`:a===void 0?"undefined":xt(a);if(s.type==="Identifier"){const l=n.type==="LocalStatement"?"setLocal":"set";e.push(`$${qt.get(s)}.${l}('${s.name}', ${o})`)}else{const l=Kt(s);i?(e.push(`vals[${t.length}](${o})`),t.push(l.setFn())):e.push(l.set(o))}}for(let r=n.variables.length;r<n.init.length;r++){const s=n.init[r];Uc(s)&&e.push(Kt(s))}return i&&(e.unshift(`vars = ${ba(n.init)}`),t.length>0&&e.unshift(`vals = [${t.join(", ")}]`)),e.join(`;
`)},Uc=n=>n.type==="CallExpression"||n.type==="StringCallExpression"||n.type==="TableCallExpression",Xr=n=>Uc(n)||n.type==="VarargLiteral",Om=n=>n.type==="StringLiteral"||n.type==="NumericLiteral"||n.type==="BooleanLiteral"||n.type==="NilLiteral"||n.type==="TableConstructorExpression",Bm=n=>{const e=[];let t=0;const i=new Map,r=(()=>{let l=0;return()=>(l+=1,l)})(),s=l=>{if(Lc(l)){a();for(let u=0;u<l.body.length;u++){const c=l.body[u];switch(c.type){case"LocalStatement":{e.push({type:"local",name:c.variables[0].name,scope:t});break}case"LabelStatement":{if(e.find(d=>d.type==="label"&&d.name===c.label.name&&d.scope===t))throw new Error(`label '${c.label.name}' already defined`);e.push({type:"label",name:c.label.name,scope:t,last:l.type!=="RepeatStatement"&&l.body.slice(u).every(d=>d.type==="LabelStatement")});break}case"GotoStatement":{e.push({type:"goto",name:c.label.name,scope:t});break}case"IfStatement":{c.clauses.forEach(d=>s(d));break}default:s(c)}}o()}};s(n);function a(){const l=t;t=r(),i.set(t,l)}function o(){t=i.get(t)}for(let l=0;l<e.length;l++){const u=e[l];if(u.type==="goto"){const c=e.filter(p=>p.type==="label"&&p.name===u.name&&p.scope<=u.scope).sort((p,g)=>Math.abs(u.scope-p.scope)-Math.abs(u.scope-g.scope))[0];if(!c)throw new Error(`no visible label '${u.name}' for <goto>`);const d=e.findIndex(p=>p===c);if(d>l){const p=e.slice(l,d).filter(g=>g.type==="local"&&g.scope===c.scope);if(!c.last&&p.length>0)throw new Error(`<goto ${u.name}> jumps into the scope of local '${p[0].name}'`)}}}},zm=(n,e,t,i,r)=>{const s=(a,o=!0)=>{if(!a)return;const l=o===!1&&i?ka.get(t):t;Array.isArray(a)?a.forEach(u=>e(u,l,r)):e(a,l,r)};switch(n.type){case"LocalStatement":case"AssignmentStatement":s(n.variables),s(n.init);break;case"UnaryExpression":s(n.argument);break;case"BinaryExpression":case"LogicalExpression":s(n.left),s(n.right);break;case"FunctionDeclaration":s(n.identifier,!1),s(n.parameters),s(n.body);break;case"ForGenericStatement":s(n.variables),s(n.iterators,!1),s(n.body);break;case"IfClause":case"ElseifClause":case"WhileStatement":case"RepeatStatement":s(n.condition,!1);case"Chunk":case"ElseClause":case"DoStatement":s(n.body);break;case"ForNumericStatement":s(n.variable),s(n.start,!1),s(n.end,!1),s(n.step,!1),s(n.body);break;case"ReturnStatement":s(n.arguments);break;case"IfStatement":s(n.clauses);break;case"MemberExpression":s(n.base),s(n.identifier);break;case"IndexExpression":s(n.base),s(n.index);break;case"LabelStatement":s(n.label);break;case"CallStatement":s(n.expression);break;case"GotoStatement":s(n.label);break;case"TableConstructorExpression":s(n.fields);break;case"TableKey":case"TableKeyString":s(n.key);case"TableValue":s(n.value);break;case"CallExpression":s(n.base),s(n.arguments);break;case"TableCallExpression":s(n.base),s(n.arguments);break;case"StringCallExpression":s(n.base),s(n.argument)}},ka=new Map,qt=new Map,Ic=new Map,Nc=new Map,km=n=>{let e=0,t=0;const i=(r,s,a)=>{let o=s,l=a;Lc(r)?((r.body.findIndex(u=>u.type==="LocalStatement"||u.type==="FunctionDeclaration"&&u.isLocal)!==-1||r.type==="FunctionDeclaration"&&(r.parameters.length>0||r.identifier&&r.identifier.type==="MemberExpression")||r.type==="ForNumericStatement"||r.type==="ForGenericStatement")&&(e+=1,o=e,qt.set(r,e),ka.set(e,s)),r.body.findIndex(u=>u.type==="LabelStatement"||u.type==="GotoStatement")!==-1&&(l=t,Nc.set(r,t),r.type!=="Chunk"&&r.type!=="FunctionDeclaration"&&Ic.set(t,a),t+=1)):(r.type==="Identifier"||r.type==="VarargLiteral")&&qt.set(r,s),zm(r,i,o,s!==o,l)};i(n,e,t)},Ta=n=>{const e=Rm.parse(n.replace(/^#.*/,""),{scope:!1,comments:!1,luaVersion:"5.3",encodingMode:"x-user-defined"});return Bm(e),km(e),Kt(e).toString()},Us={"([^a-zA-Z0-9%(])-":"$1*?","([^%])-([^a-zA-Z0-9?])":"$1*?$2","([^%])\\.":"$1[\\s\\S]","(.)-$":"$1*?","%a":"[a-zA-Z]","%A":"[^a-zA-Z]","%c":"[\0-]","%C":"[^\0-]","%d":"\\d","%D":"[^d]","%l":"[a-z]","%L":"[^a-z]","%p":`[.,"'?!;:#$%&()*+-/<>=@\\[\\]\\\\^_{}|~]`,"%P":`[^.,"'?!;:#$%&()*+-/<>=@\\[\\]\\\\^_{}|~]`,"%s":"[ \\t\\n\\f\\v\\r]","%S":`[^ 	
\f\v\r]`,"%u":"[A-Z]","%U":"[^A-Z]","%w":"[a-zA-Z0-9]","%W":"[^a-zA-Z0-9]","%x":"[a-fA-F0-9]","%X":"[^a-fA-F0-9]","%([^a-zA-Z])":"\\$1"};function $r(n){let e=n.replace(/\\/g,"\\\\");for(const i in Us)Dn(Us,i)&&(e=e.replace(new RegExp(i,"g"),Us[i]));let t=0;for(let i=0,r=e.length;i<r;i++){if(i&&e.substr(i-1,1)==="\\")continue;const s=e.substr(i,1);(s==="["||s==="]")&&(s==="]"&&(t-=1),t>0&&(e=e.substr(0,i)+e.substr(i+1),i-=1,r-=1),s==="["&&(t+=1))}return e}function Vm(n,e,t){const i=ut(n,"byte",1),r=e===void 0?1:Ee(e,"byte",2),s=t===void 0?r:Ee(t,"byte",3);return i.substring(r-1,s).split("").map(a=>a.charCodeAt(0))}function Hm(...n){return n.map((e,t)=>{const i=Ee(e,"char",t);return String.fromCharCode(i)}).join("")}function Gm(n,e,t,i){const r=ut(n,"find",1),s=ut(e,"find",2),a=t===void 0?1:Ee(t,"find",3);if(!(i===void 0?!1:Ee(i,"find",4))){const u=new RegExp($r(s)),c=r.substr(a-1).search(u);if(c<0)return;const d=r.substr(a-1).match(u),p=[c+a,c+a+d[0].length-1];return d.shift(),[...p,...d]}const l=r.indexOf(s,a-1);return l===-1?void 0:[l+1,l+s.length]}function Wm(n,...e){const t=/%%|%([-+ #0]*)?(\d*)?(?:\.(\d*))?(.)/g;let i=-1;return n.replace(t,(r,s,a,o,l)=>{if(r==="%%")return"%";if(!l.match(/[AEGXacdefgioqsux]/))throw new je(`invalid option '%${r}' to 'format'`);if(s&&s.length>5)throw new je("invalid format (repeated flags)");if(a&&a.length>2)throw new je("invalid format (width too long)");if(o&&o.length>2)throw new je("invalid format (precision too long)");i+=1;const u=e[i];if(u===void 0)throw new je(`bad argument #${i} to 'format' (no value)`);return/A|a|E|e|f|G|g/.test(l)||/c|d|i|o|u|X|x/.test(l)?Cr(r,Ee(u,"format",i)):l==="q"?`"${u.replace(/([\n"])/g,"\\$1")}"`:l==="s"?Cr(r,qi(u)):Cr(r,u)})}function Xm(n,e){const t=ut(n,"gmatch",1),i=$r(ut(e,"gmatch",2)),r=new RegExp(i,"g"),s=t.match(r);return()=>{const a=s.shift();if(a===void 0)return[];const o=new RegExp(i).exec(a);return o.shift(),o.length?o:[a]}}function $m(n,e,t,i){let r=ut(n,"gsub",1);const s=i===void 0?1/0:Ee(i,"gsub",3),a=$r(ut(e,"gsub",2)),o=typeof t=="function"?p=>{const g=t(p[0])[0];return g===void 0?p[0]:g}:t instanceof Ke?p=>t.get(p[0]).toString():p=>`${t}`.replace(/%([0-9])/g,(g,v)=>p[v]);let l="",u=0,c,d;for(;u<s&&r&&(c=r.match(a));){const p=c[0].length>0?r.substr(0,c.index):d===void 0?"":r.substr(0,1);d=c[0],l+=`${p}${o(c)}`,r=r.substr(`${p}${d}`.length),u+=1}return`${l}${r}`}function qm(n){return ut(n,"len",1).length}function Ym(n){return ut(n,"lower",1).toLowerCase()}function jm(n,e,t=0){let i=ut(n,"match",1);const r=ut(e,"match",2),s=Ee(t,"match",3);i=i.substr(s);const a=i.match(new RegExp($r(r)));if(a){if(!a[1])return a[0]}else return;return a.shift(),a}function Km(n,e,t){const i=ut(n,"rep",1),r=Ee(e,"rep",2),s=t===void 0?"":ut(t,"rep",3);return Array(r).fill(i).join(s)}function Zm(n){return ut(n,"reverse",1).split("").reverse().join("")}function Jm(n,e=1,t=-1){const i=ut(n,"sub",1);let r=ya(Ee(e,"sub",2),i.length),s=ya(Ee(t,"sub",3),i.length);return r<1&&(r=1),s>i.length&&(s=i.length),r<=s?i.substr(r-1,s-r+1):""}function Qm(n){return ut(n,"upper",1).toUpperCase()}const Fc=new Ke({byte:Vm,char:Hm,find:Gm,format:Wm,gmatch:Xm,gsub:$m,len:qm,lower:Ym,match:jm,rep:Km,reverse:Zm,sub:Jm,upper:Qm}),Oc=new Ke({__index:Fc}),eg="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";function tg(n,e){if(e===void 0)throw new je("Bad argument #2 to ipairs() iterator");const t=e+1,i=n.numValues;if(!(!i[t]||i[t]===void 0))return[t,i[t]]}const ng="Lua 5.3";function ig(n,e){if(er(n))return[n,e];const t=e===void 0?"Assertion failed!":ut(e,"assert",2);throw new je(t)}function rg(){return[]}function sg(n){const e=ut(n,"error",1);throw new je(e)}function ag(n){if(n instanceof Ke&&n.metatable){const e=n.metatable.rawget("__metatable");return e||n.metatable}if(typeof n=="string")return Oc}function og(n){const e=Ct(n,"ipairs",1),t=e.getMetaMethod("__pairs")||e.getMetaMethod("__ipairs");return t?t(e).slice(0,3):[tg,e,0]}function Bc(n,e){const t=Ct(n,"next",1);let i=e===void 0;if(i||typeof e=="number"&&e>0){const r=t.numValues,s=Object.keys(r);let a=1;if(!i){const o=s.indexOf(`${e}`);o>=0&&(i=!0,a+=o)}if(i)for(a;s[a]!==void 0;a++){const o=Number(s[a]),l=r[o];if(l!==void 0)return[o,l]}}for(const r in t.strValues)if(Dn(t.strValues,r)){if(!i)r===e&&(i=!0);else if(t.strValues[r]!==void 0)return[r,t.strValues[r]]}for(const r in t.keys)if(Dn(t.keys,r)){const s=t.keys[r];if(!i)s===e&&(i=!0);else if(t.values[r]!==void 0)return[s,t.values[r]]}}function cg(n){const e=Ct(n,"pairs",1),t=e.getMetaMethod("__pairs");return t?t(e).slice(0,3):[Bc,e,void 0]}function lg(n,...e){if(typeof n!="function")throw new je("Attempt to call non-function");try{return[!0,...n(...e)]}catch(t){return[!1,t&&t.toString()]}}function ug(n,e){return n===e}function hg(n,e){return Ct(n,"rawget",1).rawget(e)}function fg(n){if(n instanceof Ke)return n.getn();if(typeof n=="string")return n.length;throw new je("attempt to get length of an unsupported value")}function dg(n,e,t){const i=Ct(n,"rawset",1);if(e===void 0)throw new je("table index is nil");return i.rawset(e,t),i}function pg(n,...e){if(n==="#")return e.length;if(typeof n=="number"){const t=ya(Math.trunc(n),e.length);return e.slice(t-1)}throw new je(`bad argument #1 to 'select' (number expected, got ${Qi(n)})`)}function mg(n,e){const t=Ct(n,"setmetatable",1);if(t.metatable&&t.metatable.rawget("__metatable"))throw new je("cannot change a protected metatable");return t.metatable=e==null?null:Ct(e,"setmetatable",2),t}function gg(n,e){const t=Yi(n).trim(),i=e===void 0?10:Ee(e,"tonumber",2);if(i!==10&&t==="nil")throw new je("bad argument #1 to 'tonumber' (string expected, got nil)");if(i<2||i>36)throw new je("bad argument #2 to 'tonumber' (base out of range)");if(t==="")return;if(i===10)return On(t);if(new RegExp(`^${i===16?"(0x)?":""}[${eg.substr(0,i)}]*$`,"gi").test(t))return parseInt(t,i)}function _g(n,e,...t){if(typeof n!="function"||typeof e!="function")throw new je("Attempt to call non-function");try{return[!0,...n(...t)]}catch(i){return[!1,e(i)[0]]}}function vg(n,e){function t(...o){const l=o.map(u=>qi(u)).join("	");n.stdout(l)}function i(o,l,u,c){let d="";if(o instanceof Function){let g=" ";for(;g!==""&&g!==void 0;)d+=g,g=o()[0]}else d=ut(o,"load",1);let p;try{p=Ta(d)}catch(g){return[void 0,g.message]}return()=>e(c||a,p)}function r(o){const l=s(o);if(Array.isArray(l)&&l[0]===void 0)throw new je(l[1]);return l()}function s(o,l,u){const c=o===void 0?n.stdin:ut(o,"loadfile",1);if(!n.fileExists)throw new je("loadfile requires the config.fileExists function");if(!n.fileExists(c))return[void 0,"file not found"];if(!n.loadFile)throw new je("loadfile requires the config.loadFile function");return i(n.loadFile(c),c,l,u)}const a=new Ke({_VERSION:ng,assert:ig,dofile:r,collectgarbage:rg,error:sg,getmetatable:ag,ipairs:og,load:i,loadfile:s,next:Bc,pairs:cg,pcall:lg,print:t,rawequal:ug,rawget:hg,rawlen:fg,rawset:dg,select:pg,setmetatable:mg,tonumber:gg,tostring:qi,type:Qi,xpcall:_g});return a}const Vt=(n,e,t,i)=>{const r=n instanceof Ke&&n.getMetaMethod(t)||e instanceof Ke&&e.getMetaMethod(t);if(r)return r(n,e)[0];const s=On(n,"attempt to perform arithmetic on a %type value"),a=On(e,"attempt to perform arithmetic on a %type value");return i(s,a)},zc=(n,e,t,i)=>typeof n=="string"&&typeof e=="string"||typeof n=="number"&&typeof e=="number"?i(n,e):Vt(n,e,t,i),kc=n=>er(n),xg=(n,e)=>er(n)?e:n,Sg=(n,e)=>er(n)?n:e,Mg=n=>!kc(n),Eg=n=>{const e=n instanceof Ke&&n.getMetaMethod("__unm");return e?e(n)[0]:-1*On(n,"attempt to perform arithmetic on a %type value")},yg=n=>{const e=n instanceof Ke&&n.getMetaMethod("__bnot");return e?e(n)[0]:~On(n,"attempt to perform arithmetic on a %type value")},bg=n=>{if(n instanceof Ke){const e=n.getMetaMethod("__len");return e?e(n)[0]:n.getn()}if(typeof n=="string")return n.length;throw new je("attempt to get length of an unsupported value")},Tg=(n,e)=>Vt(n,e,"__add",(t,i)=>t+i),Ag=(n,e)=>Vt(n,e,"__sub",(t,i)=>t-i),wg=(n,e)=>Vt(n,e,"__mul",(t,i)=>t*i),Rg=(n,e)=>Vt(n,e,"__mod",(t,i)=>{if(i===0||i===-1/0||i===1/0||isNaN(t)||isNaN(i))return NaN;const r=Math.abs(i);let s=Math.abs(t)%r;return t*i<0&&(s=r-s),i<0&&(s*=-1),s}),Cg=(n,e)=>Vt(n,e,"__pow",Math.pow),Pg=(n,e)=>Vt(n,e,"__div",(t,i)=>{if(i===void 0)throw new je("attempt to perform arithmetic on a nil value");return t/i}),Lg=(n,e)=>Vt(n,e,"__idiv",(t,i)=>{if(i===void 0)throw new je("attempt to perform arithmetic on a nil value");return Math.floor(t/i)}),Dg=(n,e)=>Vt(n,e,"__band",(t,i)=>t&i),Ug=(n,e)=>Vt(n,e,"__bor",(t,i)=>t|i),Ig=(n,e)=>Vt(n,e,"__bxor",(t,i)=>t^i),Ng=(n,e)=>Vt(n,e,"__shl",(t,i)=>t<<i),Fg=(n,e)=>Vt(n,e,"__shr",(t,i)=>t>>i),Og=(n,e)=>{const t=n instanceof Ke&&n.getMetaMethod("__concat")||e instanceof Ke&&e.getMetaMethod("__concat");if(t)return t(n,e)[0];const i=Yi(n,"attempt to concatenate a %type value"),r=Yi(e,"attempt to concatenate a %type value");return`${i}${r}`},Bg=(n,e)=>!Vc(n,e),Vc=(n,e)=>{const t=e!==n&&n instanceof Ke&&e instanceof Ke&&n.metatable===e.metatable&&n.getMetaMethod("__eq");return t?!!t(n,e)[0]:n===e},Hc=(n,e)=>zc(n,e,"__lt",(t,i)=>t<i),Gc=(n,e)=>zc(n,e,"__le",(t,i)=>t<=i),zg=(n,e)=>!Gc(n,e),kg=(n,e)=>!Hc(n,e),Vg={bool:kc,and:xg,or:Sg,not:Mg,unm:Eg,bnot:yg,len:bg,add:Tg,sub:Ag,mul:wg,mod:Rg,pow:Cg,div:Pg,idiv:Lg,band:Dg,bor:Ug,bxor:Ig,shl:Ng,shr:Fg,concat:Og,neq:Bg,eq:Vc,lt:Hc,le:Gc,gt:zg,ge:kg},Hg=Number.MAX_SAFE_INTEGER,Gg=Number.MIN_SAFE_INTEGER,Wg=1/0,Xg=Math.PI;let Br=1;function Yo(){return Br=16807*Br%2147483647,Br/2147483647}function $g(n){const e=Ee(n,"abs",1);return Math.abs(e)}function qg(n){const e=Ee(n,"acos",1);return Math.acos(e)}function Yg(n){const e=Ee(n,"asin",1);return Math.asin(e)}function Wc(n,e){const t=Ee(n,"atan",1),i=e===void 0?1:Ee(e,"atan",2);return Math.atan2(t,i)}function jg(n,e){return Wc(n,e)}function Kg(n){const e=Ee(n,"ceil",1);return Math.ceil(e)}function Zg(n){const e=Ee(n,"cos",1);return Math.cos(e)}function Jg(n){const e=Ee(n,"cosh",1);return(Mn(e)+Mn(-e))/2}function Qg(n){return Ee(n,"deg",1)*180/Math.PI}function Mn(n){const e=Ee(n,"exp",1);return Math.exp(e)}function e_(n){const e=Ee(n,"floor",1);return Math.floor(e)}function t_(n,e){const t=Ee(n,"fmod",1),i=Ee(e,"fmod",2);return t%i}function n_(n){let e=Ee(n,"frexp",1);if(e===0)return[0,0];const t=e>0?1:-1;e*=t;const i=Math.floor(Math.log(e)/Math.log(2))+1;return[e/Math.pow(2,i)*t,i]}function i_(n,e){const t=Ee(n,"ldexp",1),i=Ee(e,"ldexp",2);return t*Math.pow(2,i)}function r_(n,e){const t=Ee(n,"log",1);if(e===void 0)return Math.log(t);{const i=Ee(e,"log",2);return Math.log(t)/Math.log(i)}}function s_(n){const e=Ee(n,"log10",1);return Math.log(e)/Math.log(10)}function a_(...n){const e=n.map((t,i)=>Ee(t,"max",i+1));return Math.max(...e)}function o_(...n){const e=n.map((t,i)=>Ee(t,"min",i+1));return Math.min(...e)}function c_(n){const e=Ee(n,"modf",1),t=Math.floor(e),i=e-t;return[t,i]}function l_(n,e){const t=Ee(n,"pow",1),i=Ee(e,"pow",2);return Math.pow(t,i)}function u_(n){const e=Ee(n,"rad",1);return Math.PI/180*e}function h_(n,e){if(n===void 0&&e===void 0)return Yo();const t=Ee(n,"random",1),i=e!==void 0?t:1,r=e!==void 0?Ee(e,"random",2):t;if(i>r)throw new Error("bad argument #2 to 'random' (interval is empty)");return Math.floor(Yo()*(r-i+1)+i)}function f_(n){Br=Ee(n,"randomseed",1)}function d_(n){const e=Ee(n,"sin",1);return Math.sin(e)}function p_(n){const e=Ee(n,"sinh",1);return(Mn(e)-Mn(-e))/2}function m_(n){const e=Ee(n,"sqrt",1);return Math.sqrt(e)}function g_(n){const e=Ee(n,"tan",1);return Math.tan(e)}function __(n){const e=Ee(n,"tanh",1);return(Mn(e)-Mn(-e))/(Mn(e)+Mn(-e))}function Xc(n){const e=On(n);if(e!==void 0)return Math.floor(e)}function v_(n){const e=On(n);if(e!==void 0)return Xc(e)===e?"integer":"float"}function x_(n,e){const t=Ee(n,"ult",1),i=Ee(e,"ult",2),r=s=>s>>>0;return r(t)<r(i)}const S_=new Ke({abs:$g,acos:qg,asin:Yg,atan:Wc,atan2:jg,ceil:Kg,cos:Zg,cosh:Jg,deg:Qg,exp:Mn,floor:e_,fmod:t_,frexp:n_,huge:Wg,ldexp:i_,log:r_,log10:s_,max:a_,min:o_,maxinteger:Hg,mininteger:Gg,modf:c_,pi:Xg,pow:l_,rad:u_,random:h_,randomseed:f_,sin:d_,sinh:p_,sqrt:m_,tan:g_,tanh:__,tointeger:Xc,type:v_,ult:x_});function M_(n){return Ct(n,"getn",1).getn()}function E_(n,e="",t=1,i){const r=Ct(n,"concat",1),s=ut(e,"concat",2),a=Ee(t,"concat",3),o=i===void 0?$c(r):Ee(i,"concat",4);return[].concat(r.numValues).splice(a,o-a+1).join(s)}function y_(n,e,t){const i=Ct(n,"insert",1),r=t===void 0?i.numValues.length:Ee(e,"insert",2),s=t===void 0?e:t;i.numValues.splice(r,0,void 0),i.set(r,s)}function $c(n){return Ct(n,"maxn",1).numValues.length-1}function b_(n,e,t,i,r){const s=Ct(n,"move",1),a=Ee(e,"move",2),o=Ee(t,"move",3),l=Ee(i,"move",4),u=r===void 0?s:Ct(r,"move",5);if(o>=a){if(a<=0&&o>=Number.MAX_SAFE_INTEGER+a)throw new je("too many elements to move");const c=o-a+1;if(l>Number.MAX_SAFE_INTEGER-c+1)throw new je("destination wrap around");if(l>o||l<=a||u!==s)for(let d=0;d<c;d++){const p=s.get(a+d);u.set(l+d,p)}else for(let d=c-1;d>=0;d--){const p=s.get(a+d);u.set(l+d,p)}}return u}function T_(...n){const e=new Ke(n);return e.rawset("n",n.length),e}function A_(n,e){const t=Ct(n,"remove",1),i=t.getn(),r=e===void 0?i:Ee(e,"remove",2);if(r>i||r<0)return;const s=t.numValues,a=s.splice(r,1)[0];let o=r;for(;o<i&&s[o]===void 0;)delete s[o],o+=1;return a}function w_(n,e){const t=Ct(n,"sort",1);let i;if(e){const s=Im(e,"sort",2);i=(a,o)=>er(s(a,o)[0])?-1:1}else i=(s,a)=>s<a?-1:1;const r=t.numValues;r.shift(),r.sort(i).unshift(void 0)}function R_(n,e,t){const i=Ct(n,"unpack",1),r=e===void 0?1:Ee(e,"unpack",2),s=t===void 0?i.getn():Ee(t,"unpack",3);return i.numValues.slice(r,s+1)}const C_=new Ke({getn:M_,concat:E_,insert:y_,maxn:$c,move:b_,pack:T_,remove:A_,sort:w_,unpack:R_}),P_=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],L_=["January","February","March","April","May","June","July","August","September","October","November","December"],D_=[31,28,31,30,31,30,31,31,30,31,30,31],Mt={"%":()=>"%",Y:(n,e)=>`${e?n.getUTCFullYear():n.getFullYear()}`,y:(n,e)=>Mt.Y(n,e).substr(-2),b:(n,e)=>Mt.B(n,e).substr(0,3),B:(n,e)=>L_[e?n.getUTCMonth():n.getMonth()],m:(n,e)=>`0${(e?n.getUTCMonth():n.getMonth())+1}`.substr(-2),U:(n,e)=>jo(n,0,e),W:(n,e)=>jo(n,1,e),j:(n,e)=>{let t=e?n.getUTCDate():n.getDate();const i=e?n.getUTCMonth():n.getMonth(),r=e?n.getUTCFullYear():n.getFullYear();return t+=D_.slice(0,i).reduce((s,a)=>s+a,0),i>1&&r%4===0&&(t+=1),`00${t}`.substr(-3)},d:(n,e)=>`0${e?n.getUTCDate():n.getDate()}`.substr(-2),a:(n,e)=>Mt.A(n,e).substr(0,3),A:(n,e)=>P_[e?n.getUTCDay():n.getDay()],w:(n,e)=>`${e?n.getUTCDay():n.getDay()}`,H:(n,e)=>`0${e?n.getUTCHours():n.getHours()}`.substr(-2),I:(n,e)=>`0${(e?n.getUTCHours():n.getHours())%12||12}`.substr(-2),M:(n,e)=>`0${e?n.getUTCMinutes():n.getMinutes()}`.substr(-2),S:(n,e)=>`0${e?n.getUTCSeconds():n.getSeconds()}`.substr(-2),c:(n,e)=>n.toLocaleString(void 0,e?{timeZone:"UTC"}:void 0),x:(n,e)=>{const t=Mt.m(n,e),i=Mt.d(n,e),r=Mt.y(n,e);return`${t}/${i}/${r}`},X:(n,e)=>{const t=Mt.H(n,e),i=Mt.M(n,e),r=Mt.S(n,e);return`${t}:${i}:${r}`},p:(n,e)=>(e?n.getUTCHours():n.getHours())<12?"AM":"PM",Z:(n,e)=>{if(e)return"UTC";const t=n.toString().match(/[A-Z][A-Z][A-Z]/);return t?t[0]:""}};function U_(n){const e=n.getFullYear(),t=new Date(e,0);return n.getTimezoneOffset()!==t.getTimezoneOffset()}function jo(n,e,t){const i=parseInt(Mt.j(n,t),10),r=new Date(n.getFullYear(),0,1,12),s=(8-(t?r.getUTCDay():r.getDay())+e)%7;return`0${Math.floor((i-s)/7)+1}`.substr(-2)}function I_(n="%c",e){const t=n.substr(0,1)==="!",i=t?n.substr(1):n,r=new Date;return e&&r.setTime(e*1e3),i==="*t"?new Ke({year:parseInt(Mt.Y(r,t),10),month:parseInt(Mt.m(r,t),10),day:parseInt(Mt.d(r,t),10),hour:parseInt(Mt.H(r,t),10),min:parseInt(Mt.M(r,t),10),sec:parseInt(Mt.S(r,t),10),wday:parseInt(Mt.w(r,t),10)+1,yday:parseInt(Mt.j(r,t),10),isdst:U_(r)}):i.replace(/%[%YybBmUWjdaAwHIMScxXpZ]/g,s=>Mt[s[1]](r,t))}function N_(n="C"){if(n==="C")return"C"}function F_(n){let e=Math.round(Date.now()/1e3);if(!n)return e;const t=n.rawget("year"),i=n.rawget("month"),r=n.rawget("day"),s=n.rawget("hour")||12,a=n.rawget("min"),o=n.rawget("sec");return t&&(e+=t*31557600),i&&(e+=i*2629800),r&&(e+=r*86400),e+=s*3600,a&&(e+=a*60),o&&(e+=o),e}function O_(n,e){const t=Ee(n,"difftime",1),i=Ee(e,"difftime",2);return t-i}const B_=n=>{function e(t){if(!n.osExit)throw new je("os.exit requires the config.osExit function");let i=0;typeof t=="boolean"&&t===!1?i=1:typeof t=="number"&&(i=t),n.osExit(i)}return new Ke({date:I_,exit:e,setlocale:N_,time:F_,difftime:O_})},z_=(n,e)=>{const t="/",i=";",r="?",s="!",a="-",o=e.LUA_PATH,l=[t,i,r,s,a].join(`
`),u=new Ke,c=new Ke,d=(M,m,h,T)=>{if(!e.fileExists)throw new je("package.searchpath requires the config.fileExists function");let w=ut(M,"searchpath",1);const b=ut(m,"searchpath",2),B=h===void 0?".":ut(h,"searchpath",3),P=T===void 0?"/":ut(T,"searchpath",4);w=w.replace(B,P);const R=b.split(";").map(D=>D.replace("?",w));for(const D of R)if(e.fileExists(D))return D;return[void 0,`The following files don't exist: ${R.join(" ")}`]},p=new Ke([M=>{const m=c.rawget(M);return m===void 0?[void 0]:[m]},M=>{const m=d(M,v.rawget("path"));if(Array.isArray(m)&&m[0]===void 0)return[m[1]];if(!e.loadFile)throw new je("package.searchers requires the config.loadFile function");return[(h,T)=>n(e.loadFile(T),h),m]}]);function g(M){const m=ut(M,"require",1),h=u.rawget(m);if(h)return h;const T=p.numValues.filter(w=>!!w);for(const w of T){const b=w(m);if(b[0]!==void 0&&typeof b[0]!="string"){const B=b[0],P=B(m,b[1]),R=P===void 0?!0:P;return u.rawset(m,R),R}}throw new je(`Module '${m}' not found!`)}const v=new Ke({path:o,config:l,loaded:u,preload:c,searchers:p,searchpath:d});return{libPackage:v,_require:g}},k_=(n,...e)=>{if(n instanceof Function)return $o(n(...e));const t=n instanceof Ke&&n.getMetaMethod("__call");if(t)return $o(t(n,...e));throw new je("attempt to call an uncallable type")},qc=new Ke;qc.metatable=Oc;const V_=(n,e)=>{if(n instanceof Ke)return n.get(e);if(typeof n=="string")return qc.get(e);throw new je("no table or metatable found for given type")},Is=(n,e,t)=>{const i=new Function("__lua",e),r=new za(n.strValues).extend();t&&r.setVarargs([t]);const s=i(Object.assign(Object.assign({globalScope:r},Vg),{Table:Ke,call:k_,get:V_}));return s===void 0?[void 0]:s};function H_(n={}){const e=Object.assign({LUA_PATH:"./?.lua",stdin:"",stdout:console.log},n),t=vg(e,Is),{libPackage:i,_require:r}=z_((u,c)=>Is(t,Ta(u),c)[0],e),s=i.get("loaded"),a=(u,c)=>{t.rawset(u,c),s.rawset(u,c)};a("_G",t),a("package",i),a("math",S_),a("table",C_),a("string",Fc),a("os",B_(e)),t.rawset("require",r);const o=u=>{const c=Ta(u);return{exec:()=>Is(t,c)[0]}};return{parse:o,parseFile:u=>{if(!e.fileExists)throw new je("parseFile requires the config.fileExists function");if(!e.loadFile)throw new je("parseFile requires the config.loadFile function");if(!e.fileExists(u))throw new je("file not found");return o(e.loadFile(u))},loadLib:a}}function Yc(n){n=n.replace(/[\[\]]/g,"\\$&");let e=window.location.href,i=new RegExp("[?&]"+n+"(=([^&#]*)|&|#|$)").exec(e);return!i||!i[2]?null:decodeURIComponent(i[2].replace(/\+/g," "))}var Bn=ace.edit("editor");Bn.setTheme("ace/theme/tomorrow_night");Bn.session.setMode("ace/mode/lua");Bn.setHighlightActiveLine(!1);Bn.resize();let Ti=Yc("lua");(!Ti||Ti.length<=0)&&(Ti=`-- Enjoy!

return RED
`);Bn.setValue(Ti,-1);let Ns=Yc("s");Ns&&Ns.length>0&&(document.getElementById("s").value=Ns);const G_=[0,14674421,6911380,1053975,16231080,13920410,7875734,15218018,15893084,16762734,8963149,4169305,3617889,4740264,7444953,10375762,5055798],W_=`
local WHITE = 1
local GREY = 2
local BLACK = 3
local PEACH = 4
local PINK = 5
local PURPLE = 6
local RED = 7
local ORANGE = 8
local YELLOW = 9
local LIGHTGREEN = 10
local GREEN = 11
local DARKBLUE = 12
local BLUE = 13
local LIGHTBLUE = 14
local BROWN = 15
local DARKBROWN = 16
local abs = math.abs
`;function X_(n){return new _u({side:on,color:G_[n]})}function $_(n,e,t,i,r){if(r<1||r>16)return;const s=new ym(1,1,1),a=X_(r),o=new ln(s,a);o.position.x=e,o.position.y=t,o.position.z=i,n.add(o)}const Va=document.getElementById("view"),jc=Va.clientWidth,Kc=Va.clientHeight,Mi=new pu;Mi.background=new et(3561863);const tr=new jt(75,jc/Kc,.1,1e3);window.evalReplicubeScript=function(){const n=document.getElementById("s"),e=parseInt(n.value);Mi.clear();{const r=new mo(16777215,3);r.position.set(-1,2,4),Mi.add(r)}{const r=new mo(16777215,3);r.position.set(1,-2,-4),Mi.add(r)}document.getElementById("error").innerHTML="";for(let t=-e;t<=e;++t)for(let i=-e;i<=e;++i)for(let r=-e;r<=e;++r){const s=H_("");let a=`
local x=${t}
local y=${i}
local z=${r}
`,o,l;try{o=s.parse(W_+a+Ti),l=o.exec()}catch(u){console.log("Parse Error: ",u),document.getElementById("error").innerHTML=u;return}(l===void 0||isNaN(l))&&(l=0),$_(Mi,t,i,r,l)}};function q_(){let n=document.getElementById("repform"),e=new FormData(n),t=new URLSearchParams(e);t.set("lua",Bn.getValue());let i=t.toString(),s=window.location.href.split("#")[0].split("?")[0]+"?"+i;history.replaceState("here","",s)}window.cubeSizeChanged=function(n){const e=document.getElementById("s"),t=document.getElementById("cubesizelabel"),i=parseInt(e.value);t.innerHTML=`${i}`,Ti=Bn.getValue(),q_(),evalReplicubeScript()};const nr=new cm;nr.setSize(jc,Kc);nr.setAnimationLoop(j_);Va.appendChild(nr.domElement);tr.position.x=10;tr.position.y=10;tr.position.z=20;const Y_=new um(tr,nr.domElement);window.cubeSizeChanged();Bn.session.on("change",function(n){cubeSizeChanged()});function j_(){Y_.update(),nr.render(Mi,tr)}window.onresize=function(){location.reload()};
