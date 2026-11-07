/* GLSL for the footer water (LiquidLayer.tsx) */
export const VS = `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;

export const WATER = `precision highp float;varying vec2 vUv;uniform vec2 uSize;uniform float uTime;uniform vec2 uMouse;uniform float uRip;
const vec3 NIGHT=vec3(.063,.18,.216);
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vnoise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*vnoise(p);p*=2.03;a*=.5;}return v;}
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
