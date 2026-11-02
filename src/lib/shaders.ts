/* GLSL for the Liquid Regal layer */
export const COMMON = `precision highp float;varying vec2 vUv;uniform vec2 uSize;uniform float uTime;
const vec3 TEAL=vec3(.098,.247,.278);const vec3 NIGHT=vec3(.063,.18,.216);const vec3 AQUA=vec3(.706,.894,.894);
const vec3 LDIR=vec3(-.45,.6,.66);
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vnoise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*vnoise(p);p*=2.03;a*=.5;}return v;}
/* a liquid drop: soft wobbling rim, dome normal, normalised distance from centre */
float dropShape(vec2 q,float R,float t,out vec3 n,out float d){
  float ang=atan(q.y,q.x);
  float Rw=R*(1.+.028*sin(3.*ang+t*.7)+.014*sin(5.*ang-t*.5));
  float l=length(q);d=l/max(Rw,1e-3);
  float h=sqrt(max(1.-d*d,0.));
  n=normalize(vec3(q/max(Rw,1e-3)*.9,h+.05));
  return smoothstep(Rw+1.,Rw-1.,l);
}
/* liquid metal: a teal-tinted chrome horizon, the surroundings mirrored in, hard highlights and a dark rim */
vec3 chrome(vec3 n,float t){
  vec3 r=reflect(vec3(0.,0.,-1.),normalize(vec3(n.xy*1.35,n.z)));
  vec3 c=mix(vec3(.03,.10,.12),vec3(.22,.40,.44),smoothstep(-.7,.05,r.y));
  c=mix(c,vec3(.80,.93,.93),smoothstep(.05,.45,r.y));
  c=mix(c,vec3(.34,.56,.60),smoothstep(.55,.95,r.y));
  c+=vec3(.03,.05,.05)*sin(r.y*5.+r.x*3.+t*.4);
  return c;
}
vec3 metalLight(vec3 base,vec3 n,float d,float t){
  vec3 g=base;
  g+=vec3(1.)*pow(max(dot(n,normalize(LDIR)),0.),120.)*.85;
  g+=vec3(.85,1.,1.)*pow(max(dot(n,normalize(vec3(.55,-.35,.75))),0.),36.)*.28;
  g*=1.-.28*smoothstep(.8,.99,d);
  g+=vec3(.75,.92,.92)*smoothstep(.96,.99,d)*(1.-smoothstep(.99,1.,d))*.3;
  return g;
}
/* teal tint, fresnel rim, highlight, caustic and rim line */
vec3 glassLight(vec3 g,vec3 n,float d,vec2 dir,float tint){
  g=mix(g,g*vec3(.80,.96,1.)+TEAL*.12,tint);
  g+=AQUA*pow(1.-clamp(n.z,0.,1.),2.4)*.42;
  g+=vec3(1.)*pow(max(dot(n,normalize(LDIR)),0.),60.)*.95;
  g+=AQUA*smoothstep(.5,1.,d)*max(dot(dir,normalize(vec2(.6,-.8))),0.)*.25;
  g*=1.-.16*smoothstep(.86,1.,d);
  return g;
}`;
export const VS = `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
export const PHOTO = COMMON+`
uniform sampler2D uA,uB;uniform float uHasA,uHasB,uP,uZoomA,uZoomB,uAspA,uAspB,uShift,uRadT,uRadB,uDropAmt,uLife;uniform vec2 uOrigin;uniform vec3 uDrop;
vec2 cover(vec2 uv,float a){float b=uSize.x/uSize.y;vec2 s=b>a?vec2(1.,a/b):vec2(b/a,1.);return (uv-.5)*s+.5;}
vec2 life(vec2 uv){if(uLife<.001)return uv;float t=uTime;float top=smoothstep(.35,1.,uv.y);
  float w=(fbm(vec2(uv.x*2.2-t*.18,uv.y*1.6+t*.05))-.5);
  vec2 o=vec2(w*.010+sin(t*.7+uv.y*5.)*.0025,w*.004)*top;
  o+=vec2(0.,(fbm(vec2(uv.x*14.,uv.y*30.-t*.6))-.5)*.0016)*(1.-top);
  return uv+o*uLife;}
vec3 tA(vec2 p){vec2 uv=life(p/uSize);uv.y+=uShift;vec2 c=.5+(cover(uv,uAspA)-.5)/uZoomA;return texture2D(uA,clamp(c,.001,.999)).rgb;}
vec3 tB(vec2 p){vec2 uv=life(p/uSize);uv.y+=uShift;vec2 c=.5+(cover(uv,uAspB)-.5)/uZoomB;return texture2D(uB,clamp(c,.001,.999)).rgb;}
vec4 scene(vec2 p){
  if(uP>=.999)return vec4(tB(p),uHasB);
  float maxD=length(max(uOrigin,uSize-uOrigin));
  float r=uP*(maxD+80.);
  vec2 q=p-uOrigin;float dd=length(q);vec2 dir=q/max(dd,1e-3);
  float band=1.-clamp(abs(dd-r)/48.,0.,1.);band=band*band*(3.-2.*band);
  float inB=smoothstep(r+1.5,r-1.5,dd);
  vec3 b=tB(p-dir*band*28.);
  vec3 a=mix(b,tA(p+dir*band*12.),uHasA);
  vec4 col=mix(vec4(a,uHasA),vec4(b,uHasB),inB);
  float on=step(.001,uP);
  float lit=max(dot(dir,normalize(vec2(-.55,.85))),0.);
  col.rgb+=on*(AQUA*.26*pow(band,3.)+vec3(1.)*.4*pow(band,8.)*lit);
  col.rgb*=1.-on*.16*smoothstep(0.,36.,dd-r)*smoothstep(110.,36.,dd-r);
  return col;
}
void main(){
  vec2 p=vUv*uSize;
  vec4 col=scene(p);
  float R=uDrop.z*uDropAmt;
  if(R>1.5){
    vec2 c=uDrop.xy;vec2 q=p-c;
    float sd=length(q-vec2(.07,-.13)*R)/R;
    col.rgb*=1.-.22*smoothstep(1.32,.92,sd);
    vec3 n;float d;float cov=dropShape(q,R,uTime,n,d);
    if(cov>0.){
      vec3 rr=reflect(vec3(0.,0.,-1.),normalize(vec3(n.xy*1.35,n.z)));
      vec3 env=scene(c-rr.xy*R*1.7).rgb;
      env=mix(env,vec3(dot(env,vec3(.3,.59,.11))),.45)*vec3(.82,1.,1.02);
      vec3 g=mix(chrome(n,uTime),env*1.1,.38);
      g=metalLight(g,n,d,uTime);
      col=mix(col,vec4(g,1.),cov);
    }
  }
  float rad=min(vUv.y>.5?uRadT:uRadB,min(uSize.x,uSize.y)*.5);
  vec2 k=abs(p-uSize*.5)-(uSize*.5-rad);
  float rr=length(max(k,0.))+min(max(k.x,k.y),0.)-rad;
  col.a*=smoothstep(.75,-.75,rr);
  gl_FragColor=col;
}`;
export const BEAD = COMMON+`uniform vec3 uBg;uniform float uR,uAmt,uSeed;
void main(){
  vec2 p=vUv*uSize;vec2 c=uSize*.5;float R=uR*uAmt;
  if(R<.5){gl_FragColor=vec4(0.);return;}
  vec2 q=p-c;
  float lum=dot(uBg,vec3(.299,.587,.114));float dark=1.-step(.45,lum);
  float sd=length(q-vec2(.1,-.32)*R)/R;
  float sh=smoothstep(1.2,.55,sd)*mix(.16,.3,dark);
  vec3 n;float d;float cov=dropShape(q,R,uTime*.8+uSeed,n,d);
  vec3 g=mix(chrome(n,uTime*.8+uSeed),uBg,.18);
  g=metalLight(g,n,d,uTime);
  gl_FragColor=mix(vec4(NIGHT*.7,sh),vec4(g,.96),cov);
}`;
export const WATER = COMMON+`uniform vec2 uMouse;uniform float uRip;
float wave(vec2 w,float t){return fbm(w*vec2(1.,2.4)+vec2(t*.03,-t*.12))+.4*fbm(w*vec2(2.2,4.4)+vec2(-t*.05,-t*.2));}
void main(){
  vec2 uv=vUv;vec2 p=uv*uSize;float t=uTime;float y=uv.y;
  float z=1./(1.04-y);
  vec2 w=vec2((uv.x-.5)*uSize.x/uSize.y*z*.9,z*1.4);
  float e=.03,h0=wave(w,t);
  vec2 g=vec2(wave(w+vec2(e,0.),t)-h0,wave(w+vec2(0.,e),t)-h0)/e;
  vec2 mq=p-uMouse;float md=length(mq);
  g+=mq/max(md,1.)*cos(md*.075-t*2.6)*exp(-md/150.)*1.2*uRip;
  vec3 n=normalize(vec3(-g*.11,1.));
  vec3 r=reflect(normalize(vec3(0.,-.25,-1.)),n);
  vec3 sky=mix(vec3(.12,.29,.32),vec3(.56,.80,.82),smoothstep(-.15,.55,r.y));
  vec3 deep=mix(vec3(.07,.19,.23),vec3(.12,.27,.35),y);
  float fres=.2+.65*pow(1.-clamp(n.z,0.,1.),2.5);
  vec3 c=mix(deep,sky,clamp(fres+y*.35,0.,1.));
  c+=vec3(.85,1.,1.)*pow(max(dot(r,normalize(vec3(.15,.55,.82))),0.),48.)*.3*(.35+.65*y);
  c=mix(c,NIGHT,smoothstep(.72,1.,y));
  gl_FragColor=vec4(c,1.);
}`;
export const PILL = COMMON+`uniform vec2 uBox;uniform float uM;
float sdCap(vec2 p,vec2 hs){float r=hs.y;vec2 q=abs(p)-vec2(max(hs.x-r,0.),0.);return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
void main(){
  vec2 p=vUv*uSize-uSize*.5;
  float h2=uBox.y*.5,w2=uBox.x*.5;
  float grow=smoothstep(0.,.4,uM);
  float str=uM<.22?0.:(uM-.22)/.78;str=str<1.?str*str*(3.-2.*str):str;
  float r=max(h2*grow,.01);float hw=mix(r,w2,str);
  vec2 q=p-vec2(w2-hw,0.);
  float ang=atan(q.y,q.x);
  float sd=sdCap(q,vec2(hw,r))-r*.06*(1.-min(str,1.))*sin(3.*ang+uTime*2.);
  float cov=smoothstep(1.,-1.,sd);
  float ins=clamp(-sd/r,0.,1.);float hgt=sqrt(1.-(1.-ins)*(1.-ins));
  vec2 gr=vec2(dFdx(sd),dFdy(sd));gr=gr/max(length(gr),1e-4);
  vec3 n=normalize(vec3(gr*(1.-hgt)*1.2,hgt+.05));
  vec3 g=mix(NIGHT,vec3(.13,.28,.37),vUv.y*.8)*.96;
  g+=AQUA*.08*fbm(p*.025+vec2(uTime*.12,0.));
  vec3 rf=reflect(vec3(0.,0.,-1.),n);
  g+=AQUA*.22*smoothstep(.1,.9,rf.y);
  g=glassLight(g,n,1.-hgt,gr,0.);
  float ssd=sdCap(q-vec2(0.,-9.),vec2(hw,r));
  float sh=smoothstep(22.,-8.,ssd)*.32*grow;
  gl_FragColor=mix(vec4(NIGHT*.6,sh),vec4(g,.95),cov);
}`;

/* The hero scene: Gopalpur at golden hour, drawn in code. uP runs the time of day:
   0 golden hour, .5 sunset, 1 night. A liquid metal drop floats over the sea. */
export const SCENE = COMMON + `
uniform float uP;uniform vec2 uM;uniform vec3 uDrop;uniform float uDropAmt;uniform vec4 uCam;
float hor(){return .40+uCam.y+uM.y*.012;}
vec3 sky(vec2 uv,float p,vec2 sun){
  float h=hor();float y=clamp((uv.y-h)/(1.-h),0.,1.);
  vec3 top=mix(vec3(.30,.55,.76),vec3(.17,.26,.45),smoothstep(.15,.6,p));top=mix(top,vec3(.02,.05,.09),smoothstep(.55,.95,p));
  vec3 mid=mix(vec3(.96,.82,.62),vec3(.93,.52,.42),smoothstep(.1,.55,p));mid=mix(mid,vec3(.10,.15,.24),smoothstep(.6,.95,p));
  vec3 low=mix(vec3(1.,.88,.62),vec3(.99,.58,.34),smoothstep(.1,.5,p));low=mix(low,vec3(.16,.20,.28),smoothstep(.62,.98,p));
  vec3 c=mix(low,mid,smoothstep(0.,.25,y));c=mix(c,top,smoothstep(.2,.95,y));
  float asp=uSize.x/uSize.y;vec2 d=(uv-sun)*vec2(asp,1.);float r=length(d);
  vec3 sunc=mix(vec3(1.,.95,.78),vec3(1.,.62,.36),smoothstep(.1,.6,p));
  float vis=1.-smoothstep(.62,.8,p);
  c+=sunc*(exp(-r*7.)*.55+exp(-r*2.2)*.22)*vis;
  c=mix(c,vec3(1.,.97,.88),smoothstep(.045,.04,r)*vis);
  /* clouds lit from below */
  vec2 cp=vec2(uv.x*asp*1.6+uTime*.006,uv.y*5.);
  float cl=fbm(cp+vec2(0.,uTime*.002))*.9+fbm(cp*2.3-uTime*.004)*.35;
  float band=smoothstep(.55,.85,uv.y)*(1.-smoothstep(.85,1.,uv.y))+smoothstep(.45,.55,uv.y)*.5*(1.-smoothstep(.55,.62,uv.y));
  float cm=smoothstep(.62,.9,cl)*band;
  vec3 cc=mix(mix(vec3(1.,.92,.82),vec3(.98,.62,.50),smoothstep(.2,.6,p)),vec3(.10,.13,.20),smoothstep(.6,.95,p));
  c=mix(c,cc*(.85+.3*(1.-y)),cm*.75);
  /* stars */
  vec2 sg=floor(uv*vec2(asp,1.)*180.);float st=step(.996,hash(sg))*smoothstep(.62,1.,p)*smoothstep(.1,.5,y);
  c+=vec3(st)*(.6+.4*sin(uTime*2.+hash(sg+3.)*30.));
  return c;
}
vec3 sea(vec2 uv,float p,vec2 sun){
  float h=hor();float dy=max(h-uv.y,.0005);float z=1./(dy+.035);
  float asp=uSize.x/uSize.y;
  vec2 w=vec2((uv.x-.5)*asp*z*.55,z*1.2);
  float t=uTime;
  float e=.04;float h0=fbm(w*vec2(1.,2.2)+vec2(t*.05,-t*.35))+.5*fbm(w*vec2(2.6,5.)+vec2(-t*.08,-t*.5));
  float hx=fbm((w+vec2(e,0.))*vec2(1.,2.2)+vec2(t*.05,-t*.35));float hy=fbm((w+vec2(0.,e))*vec2(1.,2.2)+vec2(t*.05,-t*.35));
  vec3 n=normalize(vec3(-(hx-h0)/e*.18,-(hy-h0)/e*.18,1.));
  vec3 r=reflect(normalize(vec3(0.,-.18,-1.)),n);
  vec2 ruv=vec2(uv.x+r.x*.05,h+(h-uv.y)*.6+r.y*.12);
  vec3 refl=sky(clamp(ruv,0.,1.),p,sun);
  vec3 deep=mix(vec3(.06,.24,.28),vec3(.04,.14,.19),smoothstep(.3,.9,p));deep=mix(deep,vec3(.015,.05,.07),smoothstep(.65,1.,p));
  float fres=.25+.6*pow(1.-clamp(n.z,0.,1.),2.)+.35*smoothstep(.0,.12,1.-dy*8.);
  vec3 c=mix(deep,refl,clamp(fres,0.,1.));
  /* the sun's glitter path */
  float vis=1.-smoothstep(.62,.8,p);
  float col=exp(-pow((uv.x-sun.x)*asp/(.05+dy*1.4),2.));
  float gl=pow(max(dot(r,normalize(vec3((sun.x-.5)*.6,.35,.9))),0.),60.);
  c+=mix(vec3(1.,.93,.75),vec3(1.,.6,.35),smoothstep(.1,.6,p))*(col*.35+gl*col*2.2)*vis;
  /* surf lines near the shore */
  float surf=smoothstep(.8,1.,sin(z*.9-t*1.6+fbm(vec2(uv.x*6.,t*.2))*3.))*smoothstep(.2,.05,uv.y)*.35;
  c+=vec3(.9,.97,.97)*surf*(1.-smoothstep(.7,1.,p)*.7);
  c=mix(c,sky(vec2(uv.x,h+.002),p,sun),smoothstep(.012,0.,dy)*.8);
  return c;
}
vec3 env(vec2 uv,float p,vec2 sun){return uv.y>hor()?sky(uv,p,sun):sea(uv,p,sun);}
void main(){
  /* camera: push in, tilt and a slight roll, set by scroll */
  float asp0=uSize.x/uSize.y;
  vec2 q0=(vUv-.5)*vec2(asp0,1.);
  float cr=cos(uCam.z),sr=sin(uCam.z);
  q0=mat2(cr,-sr,sr,cr)*q0/uCam.x;
  vec2 uv=q0/vec2(asp0,1.)+.5+vec2(uCam.w,0.);float p=uP;
  vec2 sun=vec2(.74+uM.x*.01,hor()+.2-.28*smoothstep(0.,.8,p));
  vec3 c=env(uv,p,sun);
  /* liquid metal drop */
  float R=uDrop.z*uDropAmt;
  if(R>1.){
    vec2 px=uv*uSize;vec2 q=px-uDrop.xy;
    float sd=length(q-vec2(.05,-.18)*R)/R;c*=1.-.25*smoothstep(1.3,.9,sd)*step(uv.y,hor()+.05);
    vec3 n;float d;float cov=dropShape(q,R,uTime,n,d);
    if(cov>0.){
      vec3 rr=reflect(vec3(0.,0.,-1.),normalize(vec3(n.xy*1.35,n.z)));
      vec3 e2=env(clamp(uDrop.xy/uSize+vec2(-rr.x*.25,rr.y*.35+.12),0.,1.),p,sun);
      vec3 g=mix(chrome(n,uTime),e2*1.15,.5);
      g=metalLight(g,n,d,uTime);
      c=mix(c,g,cov);
    }
  }
  /* soft vignette */
  vec2 v=uv-.5;c*=1.-.28*dot(v,v)*1.6;
  gl_FragColor=vec4(c,1.);
}`;
