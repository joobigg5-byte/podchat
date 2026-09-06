import { useState, useEffect, useRef, useCallback } from "react";
import studioDramatic from "@/assets/podchat/studio-dramatic.jpg";
import studioTable from "@/assets/podchat/studio-table.jpg";
import studioBlue from "@/assets/podchat/studio-blue.jpg";
import studioDesk from "@/assets/podchat/studio-desk.jpg";
import studioLetsTalk from "@/assets/podchat/studio-lets-talk.jpg";
import liveCrowd from "@/assets/podchat/live-crowd.jpg";
import comedyClub from "@/assets/podchat/comedy-club.jpg";
import comedyNight from "@/assets/podchat/comedy-night.jpg";
import micCondenser from "@/assets/podchat/mic-condenser.jpg";
import micBrass from "@/assets/podchat/mic-brass.jpg";
import { generateClips, generateShowNotes } from "@/lib/ai-studio.functions";


// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const T = {
  // ── Deep glass backdrop ──────────────────────────────────────────────────
  bg:      "radial-gradient(ellipse at 12% -10%, #1a2438 0%, #121a29 42%, #0B111B 100%)",
  bgSolid: "#0B111B",
  // ── Frosted glass panels (the $2M surfaces) ──────────────────────────────
  panel:   "rgba(150,180,235,0.07)",
  panelHi: "rgba(160,190,240,0.12)",
  glass:   "rgba(150,180,235,0.06)",
  glassHi: "rgba(255,255,255,0.14)",
  // ── Borders ──────────────────────────────────────────────────────────────
  border:   "rgba(175,200,240,0.16)",
  borderHi: "rgba(180,205,245,0.32)",
  borderGlow:"rgba(127,166,240,0.30)",
  // ── Palette: restrained editorial tones (no neon, no green) ──────────────
  cyan:   "#7FA6F0",   // primary azure
  purple: "#8FA8DE",   // soft periwinkle
  pink:   "#C4667A",   // muted crimson
  gold:   "#C9A15E",   // warm champagne (warnings / secondary tier)
  green:  "#5A78C8",   // success -> deep indigo (green removed app-wide)
  orange: "#C98F5E",   // warm sand
  indigo: "#5A78C8",   // deep indigo
  rose:   "#C4667A",   // muted crimson
  sky:    "#9FB6DC",   // pale steel
  // ── Typography ───────────────────────────────────────────────────────────
  t1: "#EEF3FA",
  t2: "rgba(214,226,244,0.68)",
  t3: "rgba(200,215,238,0.44)",
  // ── Backdrop blur tokens ─────────────────────────────────────────────────
  blur:   "blur(24px) saturate(180%)",
  blurSm: "blur(12px) saturate(160%)",
  blurLg: "blur(40px) saturate(200%)",
  // ── Shadows ──────────────────────────────────────────────────────────────
  shadowGlass: "0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.25)",
  shadowCard:  "0 20px 60px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.3)",
  shadowGlow:  "0 18px 48px rgba(0,0,0,0.38)",
};

// ─── SEGMENTED STUDIO METER ───────────────────────────────────────────────────
// Replaces flat coloured progress bars everywhere: a precise, broadcast-style
// level meter built from discrete ticks. Monochrome by default, one accent tone.
function Meter({value=0,tone=T.cyan,segments=28,height=14,showValue=false,label,sub}){
  const v=Math.max(0,Math.min(100,Number(value)||0));
  const lit=Math.round(v/100*segments);
  return(
    <div style={{width:"100%"}}>
      {(label||showValue)&&(
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:6}}>
          <span style={{fontSize:11,color:T.t2,fontWeight:600,letterSpacing:.2}}>{label}</span>
          {showValue&&<span style={{fontSize:12,color:T.t1,fontWeight:700,fontVariantNumeric:"tabular-nums"}}>{Math.round(v)}<span style={{fontSize:10,color:T.t3}}>%</span></span>}
        </div>
      )}
      <div style={{display:"flex",gap:2,alignItems:"flex-end",height}}>
        {Array.from({length:segments},(_,i)=>{
          const on=i<lit;
          const h=height*(0.55+0.45*Math.min(1,(i+1)/segments+0.25));
          return <div key={i} style={{flex:1,height:h,borderRadius:1.5,
            background:on?tone:"rgba(180,205,245,0.10)",
            opacity:on?(0.5+0.5*((i+1)/Math.max(lit,1))):1,
            transition:"background .35s, opacity .35s"}}/>;
        })}
      </div>
      {sub&&<div style={{fontSize:10,color:T.t3,marginTop:5}}>{sub}</div>}
    </div>
  );
}

// ─── ALL REAL IMAGES — 16 production photos ───────────────────────────────

const IMG_STUDIO_DRAMATIC = studioDramatic;
const IMG_STUDIO_TABLE = studioTable;
const IMG_STUDIO_BLUE = studioBlue;
const IMG_STUDIO_PODCAST = studioDesk;
const IMG_STUDIO_LETS_TALK = studioLetsTalk;
const IMG_LIVE_CROWD = liveCrowd;
const IMG_COMEDY_NEON = comedyClub;
const IMG_COMEDY_NIGHT = comedyNight;
const IMG_MIC_CSL = micCondenser;
const IMG_MIC_RED = micBrass;
const IMG_MIC_NEON = micCondenser;
const IMG_MIC_RGB = studioDesk;
const IMG_MIC_BLACK = micCondenser;
const IMG_MIC_GOLD_HP = micBrass;
const IMG_MIC_GOLD_SILVER = micBrass;
const IMG_MIC_CONDENSER = micCondenser;

// ─── DEFAULT CONTENT ─────────────────────────────────────────────────────────
const DEFAULT_CONTENT = {
  brand:{ name:"PodChat", tagline:"Where Every Voice Is a Show", logoUrl:"", accentColor:"#7FA6F0" },
  highlights:[
    { id:"h1", title:"The AI Comedy Takeover",    host:"Marcus Bright × Dr. Amara Osei", description:"Two worlds collide — stand-up comedy meets artificial intelligence in the most explosive live debate of 2026.", category:"Comedy · Live Debate", imgUrl:IMG_STUDIO_DRAMATIC, badge:"🔴 LIVE NOW", color:"#D2687A", cta:"Watch Free",  views:"92.1K watching" },
    { id:"h2", title:"Open Mic: Lagos Night",      host:"5 Comedians · Eko Stage",        description:"Africa's biggest open mic returns. Five comedians, one stage, zero script. The crowd decides who stays.", category:"Stand-Up · Open Mic",    imgUrl:IMG_COMEDY_NIGHT, badge:"🔥 TRENDING",  color:"#9FB6DC", cta:"Watch Now",  views:"67.4K views" },
    { id:"h3", title:"Wall Street Unfiltered",     host:"Zara Kimani",                    description:"The finance podcast that Wall Street doesn't want you to hear. Raw market truth every Tuesday.",              category:"Finance · Podcast",      imgUrl:IMG_STUDIO_BLUE, badge:"⭐ TOP SHOW",  color:"#7FA6F0", cta:"Listen Now", views:"31.7K listeners" },
    { id:"h4", title:"Pod Wars: Tech vs Humanity", host:"Various Hosts",                   description:"The most controversial debate format on the internet. Audience votes decide the winner live.",               category:"Debate · Live",          imgUrl:IMG_LIVE_CROWD, badge:"⚔️ POD WARS", color:"#8FA8DE", cta:"Join Live",  views:"55.9K live" },
  ],
  shows:[
    { id:"s1", title:"Future Forward",    host:"Erika Nwosu",     category:"Tech",     subscribers:"1.2M", episodes:148, imgUrl:IMG_MIC_NEON, color:"#7FA6F0", description:"Weekly deep dives into emerging technology and the future of human civilization." },
    { id:"s2", title:"Money Moves",       host:"James Okafor",    category:"Finance",  subscribers:"3.4M", episodes:210, imgUrl:IMG_MIC_GOLD_SILVER, color:"#7FA6F0", description:"Practical financial advice for the next generation of wealth builders." },
    { id:"s3", title:"Mind Matters",      host:"Dr. Sofia Reyes", category:"Health",   subscribers:"980K", episodes:89,  imgUrl:IMG_STUDIO_LETS_TALK, color:"#5A78C8", description:"Science-backed mental health conversations that actually help." },
    { id:"s4", title:"Culture Crash",     host:"The Crew",        category:"Culture",  subscribers:"2.1M", episodes:305, imgUrl:IMG_LIVE_CROWD, color:"#8FA8DE", description:"Where pop culture, politics and real life crash into each other." },
    { id:"s5", title:"Startup Grind",     host:"Kwame Asante",    category:"Business", subscribers:"1.8M", episodes:167, imgUrl:IMG_STUDIO_TABLE, color:"#9FB6DC", description:"From idea to exit — the unfiltered founder journey." },
    { id:"s6", title:"The History Files", host:"Prof. Lin Wei",   category:"History",  subscribers:"4.1M", episodes:421, imgUrl:IMG_MIC_RED, color:"#D2687A", description:"The stories history class never taught you, told the way they actually happened." },
  ],
  comedy:[
    { id:"c1", name:"Marcus Bright",         specialty:"Observational",    subscribers:"2.1M", episodes:84,  imgUrl:IMG_COMEDY_NIGHT, color:"#D2687A", bio:"Raw, real, relatable. Marcus finds comedy in everyday madness." },
    { id:"c2", name:"The Roast Room",         specialty:"Celebrity Roasts", subscribers:"4.7M", episodes:210, imgUrl:IMG_COMEDY_NEON, color:"#7FA6F0", bio:"No one is safe. The internet's most savage roast show." },
    { id:"c3", name:"Open Mic Universe",      specialty:"Stand-Up Sets",    subscribers:"1.3M", episodes:340, imgUrl:IMG_COMEDY_NIGHT, color:"#8FA8DE", bio:"New voices. Raw sets. The future of stand-up." },
    { id:"c4", name:"Sketch Lab",             specialty:"Sketch Comedy",    subscribers:"890K", episodes:127, imgUrl:IMG_COMEDY_NEON, color:"#5A78C8", bio:"Absurdist sketches that go viral every single week." },
    { id:"c5", name:"Pod Wars Comedy",        specialty:"Debate & Roast",   subscribers:"3.2M", episodes:96,  imgUrl:IMG_STUDIO_PODCAST, color:"#7FA6F0", bio:"Two comedians. One hot topic. Audience decides who wins." },
    { id:"c6", name:"Late Night Unfiltered",  specialty:"Talk Show",        subscribers:"5.6M", episodes:412, imgUrl:IMG_STUDIO_LETS_TALK, color:"#9FB6DC", bio:"The show that starts where others are afraid to go." },
  ],
  interviews:[
    { id:"i1", guest:"Elon Musk",     host:"Zara K.",     topic:"The Mars Blueprint",         views:"44M", date:"Jun 12", imgUrl:IMG_STUDIO_BLUE, color:"#7FA6F0", hot:true  },
    { id:"i2", guest:"Cardi B",       host:"Marcus B.",   topic:"Music, Money & Motherhood",  views:"38M", date:"Jun 10", imgUrl:IMG_STUDIO_LETS_TALK, color:"#D2687A", hot:true  },
    { id:"i3", guest:"Satya Nadella", host:"Tech Talks",  topic:"AI & the Future of Work",    views:"21M", date:"Jun 8",  imgUrl:IMG_STUDIO_TABLE, color:"#8FA8DE", hot:false },
    { id:"i4", guest:"Oprah Winfrey", host:"Pod Legends", topic:"Legacy & Leadership",        views:"62M", date:"Jun 5",  imgUrl:IMG_COMEDY_NEON, color:"#7FA6F0", hot:true  },
  ],
  trending:[
    { id:"t1", title:"AI Side Hustle Tools",       platform:"Social Platforms",  change:"+840%", heat:98, imgUrl:IMG_MIC_NEON, color:"#7FA6F0", desc:"ChatGPT & Claude used to earn $5K/mo — creators showing how live on PodChat" },
    { id:"t2", title:"Digital Products Drop",      platform:"All Platforms",change:"+620%", heat:95, imgUrl:IMG_STUDIO_TABLE, color:"#8FA8DE", desc:"Notion templates, Canva packs & eBooks — create once, sell forever" },
    { id:"t3", title:"Faceless Video Channels",  platform:"Video Platforms",      change:"+510%", heat:91, imgUrl:IMG_STUDIO_PODCAST, color:"#7FA6F0", desc:"$8K/mo with AI voiceover + stock footage — zero camera needed" },
    { id:"t4", title:"UGC Creator Contracts",      platform:"All",          change:"+430%", heat:89, imgUrl:IMG_MIC_RED, color:"#D2687A", desc:"Brands paying $300–$2K per authentic video. Micro-creators welcome." },
    { id:"t5", title:"Podcast Sponsorship Rush",   platform:"PodChat",      change:"+380%", heat:87, imgUrl:IMG_MIC_CSL, color:"#5A78C8", desc:"Micro-podcasters landing $500–$5K deals with niche audiences of 1K+" },
    { id:"t6", title:"Print-on-Demand Comeback",   platform:"Short Video Shop",  change:"+350%", heat:85, imgUrl:IMG_LIVE_CROWD, color:"#9FB6DC", desc:"Custom merch no upfront cost — $3K/month from micro-creators" },
  ],
  hustles:[
    { id:"hu1", title:"UGC Content Creator",  earn:"$300–$3K/video", difficulty:"Easy",   imgUrl:IMG_MIC_RED, color:"#7FA6F0", platform:"All Platforms",   desc:"Brands pay you to create authentic-looking ads. No huge following needed.", steps:["Create 3–5 sample videos","Sign up on Fiverr, Billo, or JoinBrands","Pitch 5 brands per day in your niche","Deliver, get reviews, raise rates"] },
    { id:"hu2", title:"Podcast Ghostwriter",  earn:"$500–$5K/month", difficulty:"Medium", imgUrl:IMG_STUDIO_LETS_TALK, color:"#8FA8DE", platform:"PodChat",         desc:"Write scripts & show notes for busy podcasters. Most creators hate writing.", steps:["Build 3 sample scripts in your niche","List on Upwork & LinkedIn","Target podcasters with 10K+ listeners","Upsell to monthly retainer ($1.5K–$3K)"] },
    { id:"hu3", title:"Digital Product Shop", earn:"$1K–$10K/month", difficulty:"Medium", imgUrl:IMG_STUDIO_TABLE, color:"#7FA6F0", platform:"Social Media / Gumroad", desc:"Sell Notion templates, Canva packs, eBooks. Create once, sell forever.", steps:["Pick a niche problem to solve","Create product in Canva/Notion","List on Gumroad or Stan Store","Post short videos showing it in use"] },
    { id:"hu4", title:"Comedy Clip Reseller", earn:"$500–$4K/month", difficulty:"Easy",   imgUrl:IMG_COMEDY_NIGHT, color:"#D2687A", platform:"PodChat",         desc:"Edit viral comedy podcast moments into short clips. Comedians pay $200–$800/month.", steps:["Watch top comedy podcasts daily","Clip the best 60–90 sec moments","Create a reel of 10 sample clips","Pitch directly to 5 comedians per week"] },
  ],
};

// ─── STORAGE — FIX #6: in-memory fallback when localStorage unavailable ───────
const memStore = {};
const store = {
  get(k){ try{ return localStorage.getItem(k); }catch(_){ return memStore[k]||null; } },
  set(k,v){ try{ localStorage.setItem(k,v); }catch(_){ memStore[k]=v; } },
};
const SKEY = "podchat_v2";
function loadContent(){ try{ const r=store.get(SKEY); if(r) return {...DEFAULT_CONTENT,...JSON.parse(r)}; }catch(_){} return DEFAULT_CONTENT; }
function saveContent(c){ try{ store.set(SKEY,JSON.stringify(c)); }catch(_){} }

// ─── ATOMS ───────────────────────────────────────────────────────────────────
function Orb({x,y,color,size=500,opacity=0.12}){
  return <div style={{position:"fixed",left:x,top:y,width:size,height:size,
    borderRadius:"50%",
    background:`radial-gradient(circle at 35% 35%, ${color}30 0%, ${color}12 40%, transparent 70%)`,
    opacity,filter:`blur(${size*.35}px)`,pointerEvents:"none",zIndex:0,
    transform:"translate(-50%,-50%)"
  }}/>;
}

function Dot({color=T.pink}){
  const [v,setV]=useState(true);
  useEffect(()=>{const t=setInterval(()=>setV(x=>!x),900);return()=>clearInterval(t);},[]);
  return <span style={{display:"inline-block",width:7,height:7,borderRadius:"50%",background:v?color:"transparent",transition:"background .3s",marginRight:5,flexShrink:0}}/>;
}
function Pill({label,color,pulse=false}){
  return <span style={{display:"inline-flex",alignItems:"center",gap:5,
    fontSize:9,fontWeight:700,letterSpacing:1.8,padding:"5px 12px",borderRadius:8,
    background:`${color}18`,
    border:`1px solid ${color}45`,
    color,
    boxShadow:`0 2px 12px ${color}25, inset 0 1px 0 rgba(255,255,255,0.12)`,
    backdropFilter:"blur(12px) saturate(150%)"
  }}>
    {pulse && <Dot color={color}/>}{label}
  </span>;
}
function Chip({label,color}){
  return <span style={{fontSize:9,padding:"4px 10px",borderRadius:20,
    background:`${color}14`,
    border:`1px solid ${color}35`,
    color,fontWeight:600,letterSpacing:.3,
    boxShadow:`0 2px 8px ${color}20`,
    backdropFilter:"blur(8px)"
  }}>{label}</span>;
}

function Btn({children,color=T.purple,filled=false,small=false,onClick,style={}}){
  const [h,setH]=useState(false);
  const baseStyle = filled ? {
    background: h
      ? `linear-gradient(135deg,${color}ee,${color}aa)`
      : `linear-gradient(135deg,${color},${color}bb)`,
    border:`1px solid ${color}60`,
    color:"#fff",
    boxShadow: h
      ? `0 8px 24px ${color}40, inset 0 1px 0 rgba(255,255,255,0.25)`
      : `0 4px 16px ${color}30, inset 0 1px 0 rgba(255,255,255,0.18)`,
  } : {
    background: h ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.06)",
    border:`1px solid ${h ? "rgba(255,255,255,0.30)" : "rgba(255,255,255,0.14)"}`,
    color,
    boxShadow: h
      ? "0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.20)"
      : "0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.10)",
  };
  return <button onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
    style={{...baseStyle,backdropFilter:"blur(20px) saturate(180%)",borderRadius:12,
      padding:small?"7px 16px":"10px 22px",
      fontSize:small?11:12,fontWeight:600,cursor:"pointer",letterSpacing:.3,
      transition:"all .22s cubic-bezier(.4,0,.2,1)",whiteSpace:"nowrap",
      transform: h ? "translateY(-1px)" : "translateY(0)",
      ...style}}>
    {children}
  </button>;
}

function Field({label,value,onChange,multi=false}){
  const s={width:"100%",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:10,padding:"9px 13px",color:T.t1,fontSize:12,outline:"none",fontFamily:"inherit",resize:"vertical",boxSizing:"border-box"};
  const isImage=/image|photo|logo|cover|avatar|banner|thumb/i.test(String(label||""));
  if(isImage) return <ImageField label={label} value={value} onChange={onChange} inputStyle={s}/>;
  return <div style={{marginBottom:12}}>
    {label&&<div style={{fontSize:10,color:T.t2,fontWeight:600,letterSpacing:1,marginBottom:5,textTransform:"uppercase"}}>{label}</div>}
    {multi?<textarea value={value||""} onChange={e=>onChange(e.target.value)} style={{...s,minHeight:64}}/>
          :<input value={value||""} onChange={e=>onChange(e.target.value)} style={s}/>}
  </div>;
}

// Image editor: live preview + upload from device + paste a URL. Used everywhere
// an image is editable so admins can keep improving image quality over time.
function ImageField({label,value,onChange,inputStyle}){
  const fileRef=useRef(null);
  const pick=(e)=>{
    const f=e.target.files&&e.target.files[0];
    if(!f) return;
    const r=new FileReader();
    r.onload=()=>onChange(String(r.result));
    r.readAsDataURL(f);
  };
  return <div style={{marginBottom:12}}>
    {label&&<div style={{fontSize:10,color:T.t2,fontWeight:600,letterSpacing:1,marginBottom:5,textTransform:"uppercase"}}>{label}</div>}
    <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
      <div style={{width:74,height:74,borderRadius:12,overflow:"hidden",flexShrink:0,
        border:`1px solid ${T.border}`,background:"rgba(255,255,255,0.04)"}}>
        <ImgFallback src={value} alt={label}/>
      </div>
      <div style={{flex:1,minWidth:0}}>
        <input value={value||""} onChange={e=>onChange(e.target.value)}
          placeholder="Paste an image URL, or upload a file"
          style={{...inputStyle,marginBottom:8}}/>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <Btn small onClick={()=>fileRef.current&&fileRef.current.click()}>Upload / Replace</Btn>
          {value&&<Btn small color={T.rose} onClick={()=>onChange("")}>Clear</Btn>}
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={pick} style={{display:"none"}}/>
      </div>
    </div>
  </div>;
}

// Non-admin fallback for the moderation / content management area.
function RestrictedScreen(){
  return <div style={{maxWidth:520,margin:"80px auto",textAlign:"center",background:T.panel,
    border:`1px solid ${T.border}`,borderRadius:22,padding:"46px 38px",
    backdropFilter:T.blur,boxShadow:T.shadowCard}}>
    <div style={{width:52,height:52,borderRadius:14,margin:"0 auto 18px",display:"flex",
      alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,0.06)",
      border:`1px solid ${T.border}`,color:T.t2}}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
    </div>
    <div style={{fontSize:19,fontWeight:800,color:T.t1,marginBottom:8,letterSpacing:-0.3}}>Admin access only</div>
    <div style={{fontSize:13,color:T.t2,lineHeight:1.7}}>
      Content management and moderation are restricted to administrators.
      Sign in with an admin account to manage shows, people, imagery and brand settings.
    </div>
  </div>;
}

// FIX #7: custom confirm dialog instead of window.confirm
function ConfirmDialog({msg,onYes,onNo}){
  return <div style={{position:"fixed",inset:0,background:"rgba(13,15,19,0.75)",backdropFilter:"blur(24px) saturate(180%)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,backdropFilter:"blur(14px) saturate(140%)"}}>
    <div style={{background:T.panel,border:`1px solid ${T.borderHi}`,borderRadius:18,padding:28,maxWidth:400,width:"90%",backdropFilter:"blur(20px)"}}>
      <div style={{fontSize:14,color:T.t1,marginBottom:20,lineHeight:1.6}}>{msg}</div>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
        <Btn small onClick={onNo}>Cancel</Btn>
        <Btn small color={T.pink} filled onClick={onYes}>Yes, proceed</Btn>
      </div>
    </div>
  </div>;
}

function ImgFallback({src,alt,style={},fallback=T.purple}){
  const [err,setErr]=useState(false);
  if(!src||err) return <div style={{width:"100%",height:"100%",background:`linear-gradient(135deg,${fallback}44,rgba(16,18,22,.9))`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,...style}}>🎙</div>;
  return <img src={src} alt={alt||""} onError={()=>setErr(true)} style={{width:"100%",height:"100%",objectFit:"cover",...style}}/>;
}

// ─── SUPPORT ────────────────────────────────────────────────────────────────
const SUPPORT_URL="https://wittyhub.co?app=podchats&v=1.0";
const openSupport=()=>{ try{ window.open(SUPPORT_URL,"_blank","noopener"); }catch(e){} };
const API_BASE = import.meta.env.VITE_API_BASE || "https://podchat.wittyhub.co";

// ─── NAV ─────────────────────────────────────────────────────────────────────
const NAV=[
  {id:"home",       label:"Home",
   icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>},
  {id:"live",       label:"Live Now", badge:"14",
   icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>},
  {id:"trending",   label:"Trending",
   icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>},
  {id:"hustle",     label:"Side Hustles",
   icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>},
  {id:"podcasts",   label:"Podcasts",
   icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>},
  {id:"comedy",     label:"Comedy Hub",
   icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>},
  {id:"interviews", label:"Interviews",
   icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>},
  {id:"studio",     label:"My Studio",
   icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>},
  {id:"ai_studio",  label:"AI Studio",
   icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l1.9 5.6L19.6 10.5l-5.7 1.9L12 18l-1.9-5.6L4.4 10.5l5.7-1.9z"/><circle cx="19.2" cy="4.6" r="1.4"/><circle cx="4.8" cy="19.4" r="1.4"/></svg>},
  {id:"wallet",     label:"PodCoins",
   icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg>},
  {id:"cms",        label:"Manage Content",
   icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>},

  {id:"translate",label:"Translation",
   icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>},
  {id:"hotseat",  label:"Hot Seat",
   icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/><line x1="20" y1="8" x2="20" y2="14"/></svg>},
  {id:"analytics",label:"Analytics",
   icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>},
  {id:"marketplace",label:"Marketplace",
   icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>},
  {id:"comedy_formats",label:"Comedy+",
   icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>},
  {id:"simulcast", label:"Simulcast",
   icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>},
  {id:"revenue",   label:"Revenue",
   icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>},
  {id:"ownership", label:"Ownership",
   icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>},
];

// ─── HERO STRIP — all 4 bugs fixed ───────────────────────────────────────────
function HeroStrip({highlights,onNavigate}){
  // FIX #10: use ref for active so interval always reads current value (no stale closure)
  const [active,setActive]=useState(0);
  const activeRef=useRef(0);
  const timerRef=useRef(null);

  const setIdx=(i)=>{
    const next=((i%highlights.length)+highlights.length)%highlights.length;
    activeRef.current=next;
    setActive(next);
  };

  // FIX #1 & #10: interval reads activeRef.current directly
  const startTimer=useCallback(()=>{
    clearInterval(timerRef.current);
    timerRef.current=setInterval(()=>{
      const next=(activeRef.current+1)%highlights.length;
      activeRef.current=next;
      setActive(next);
    },5500);
  },[highlights.length]);

  useEffect(()=>{ startTimer(); return()=>clearInterval(timerRef.current); },[startTimer]);

  // FIX #3 & #9: always restart timer after manual interaction
  const manualGo=(i)=>{ setIdx(i); startTimer(); };

  const cur=highlights[active]||highlights[0]||{};

  return(
    <div style={{position:"relative",width:"100%",borderRadius:20,overflow:"hidden",marginBottom:28}}>
      <div style={{position:"relative",height:480}}>
        <ImgFallback src={cur.imgUrl} alt={cur.title} style={{filter:"brightness(.45)",transition:"opacity .6s"}} fallback={cur.color||T.purple}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to right,rgba(16,18,22,.95) 0%,rgba(16,18,22,.55) 55%,transparent 100%)"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(16,18,22,1) 0%,transparent 55%)"}}/>
        <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse 55% 75% at 80% 50%,${cur.color||T.purple}18,transparent)`}}/>

        <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"0 44px 40px"}}>
          <div style={{maxWidth:560}}>
            <div style={{display:"flex",gap:10,marginBottom:12,alignItems:"center"}}>
              <Pill label={cur.badge||"NEW"} color={cur.color||T.cyan} pulse/>
              <span style={{fontSize:11,color:T.t3}}>{cur.category}</span>
            </div>
            <h1 style={{fontSize:46,fontWeight:900,color:T.t1,margin:"0 0 10px",lineHeight:1.05,letterSpacing:-2,textShadow:"0 4px 40px rgba(0,0,0,.6)"}}>{cur.title}</h1>
            <div style={{fontSize:13,color:"rgba(255,255,255,.5)",fontWeight:600,marginBottom:8}}>{cur.host}</div>
            <p style={{fontSize:14,color:"rgba(255,255,255,.7)",lineHeight:1.7,marginBottom:20,maxWidth:460}}>{cur.description}</p>
            <div style={{display:"flex",gap:12,alignItems:"center"}}>
              <Btn color={cur.color||T.cyan} filled onClick={()=>onNavigate("live")} style={{fontSize:13,padding:"12px 26px",borderRadius:12}}>▶ {cur.cta||"Watch Now"}</Btn>
              <Btn onClick={()=>onNavigate("podcasts")} style={{fontSize:12,padding:"12px 20px",borderRadius:12}}>+ Follow</Btn>
              <span style={{fontSize:12,color:T.t3,marginLeft:8}}>👁 {cur.views}</span>
            </div>
          </div>
        </div>

        {/* Dot indicators */}
        <div style={{position:"absolute",bottom:18,right:26,display:"flex",gap:6}}>
          {highlights.map((_,i)=>(
            <div key={i} onClick={()=>manualGo(i)}
              style={{width:i===active?22:6,height:6,borderRadius:3,background:i===active?(cur.color||T.cyan):"rgba(255,255,255,.25)",cursor:"pointer",transition:"all .3s"}}/>
          ))}
        </div>

        {/* FIX #2: arrow nav with proper style objects, no string parsing */}
        <ArrowBtn side="left"  onClick={()=>manualGo(active-1)} icon="‹"/>
        <ArrowBtn side="right" onClick={()=>manualGo(active+1)} icon="›"/>
      </div>

      {/* THUMBNAIL STRIP */}
      <div style={{background:"rgba(13,15,19,0.92)",backdropFilter:"blur(40px)",borderTop:"1px solid rgba(255,255,255,0.08)",padding:"14px 18px",display:"flex",gap:10,overflowX:"auto"}}>
        {highlights.map((h,i)=>(
          <div key={h.id} onClick={()=>manualGo(i)}
            style={{flexShrink:0,width:160,borderRadius:12,overflow:"hidden",cursor:"pointer",border:`2px solid ${i===active?(h.color||T.cyan):"transparent"}`,transition:"all .25s",transform:i===active?"scale(1.04)":"scale(1)"}}>
            <div style={{height:90,position:"relative",overflow:"hidden"}}>
              <ImgFallback src={h.imgUrl} alt={h.title} style={{filter:"brightness(.55)"}} fallback={h.color||T.purple}/>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(16,18,22,.9),transparent 60%)"}}/>
              {i===active&&<div style={{position:"absolute",top:8,right:8}}><Dot color={h.color||T.cyan}/></div>}
            </div>
            <div style={{padding:"8px 10px",background:"rgba(255,255,255,0.06)",backdropFilter:"blur(24px) saturate(180%)"}}>
              <div style={{fontSize:11,fontWeight:700,color:T.t1,lineHeight:1.3}}>{h.title}</div>
              <div style={{fontSize:9,color:T.t3,marginTop:2}}>{h.category}</div>
            </div>
          </div>
        ))}
        <div onClick={()=>onNavigate("cms")} style={{flexShrink:0,width:110,borderRadius:12,border:`2px dashed ${T.border}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",gap:5,opacity:.55}}>
          <div style={{fontSize:22,color:T.t2}}>+</div>
          <div style={{fontSize:10,color:T.t3,textAlign:"center"}}>Add Highlight</div>
        </div>
      </div>
    </div>
  );
}

// FIX #2: clean arrow button component with proper inline styles
function ArrowBtn({side,onClick,icon}){
  const [h,setH]=useState(false);
  return <div onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
    style={{position:"absolute",top:"50%",transform:"translateY(-50%)",[side]:"16px",width:44,height:44,borderRadius:"50%",
      background:h?"rgba(0,0,0,.65)":"rgba(0,0,0,.4)",backdropFilter:"blur(14px) saturate(140%)",border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",
      display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,color:T.t1,cursor:"pointer",userSelect:"none",transition:"background .2s"}}>
    {icon}
  </div>;
}

// ─── CARD COMPONENTS ──────────────────────────────────────────────────────────
function ShowCard({item}){
  const [h,setH]=useState(false);
  const acc=item.color||T.cyan;
  return <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
    style={{borderRadius:16,overflow:"hidden",cursor:"pointer",transition:"all .25s",border:`1px solid ${h?acc+"55":T.border}`,transform:h?"translateY(-4px)":"none",boxShadow:h?`0 12px 40px ${acc}20`:"none"}}>
    <div style={{height:130,position:"relative",overflow:"hidden"}}>
      <ImgFallback src={item.imgUrl||item.img} alt={item.title} style={{filter:"brightness(.5)",transform:h?"scale(1.06)":"scale(1)",transition:"transform .4s"}} fallback={acc}/>
      <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 40%,rgba(16,18,22,1))"}}/>
      <div style={{position:"absolute",top:8,right:8}}><Chip label={item.category||item.specialty} color={acc}/></div>
    </div>
    <div style={{padding:"12px 14px",background:"rgba(255,255,255,0.06)",backdropFilter:"blur(24px) saturate(180%)"}}>
      <div style={{fontSize:13,fontWeight:800,color:T.t1,marginBottom:2}}>{item.title||item.name}</div>
      <div style={{fontSize:11,color:T.t2,marginBottom:10}}>{item.host||item.specialty}</div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:11,fontWeight:700,color:acc}}>{item.subscribers}</span>
        <Btn small color={acc}>▶ Play</Btn>
      </div>
    </div>
  </div>;
}

function PersonCard({item}){
  const [h,setH]=useState(false);
  return <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
    style={{borderRadius:16,overflow:"hidden",cursor:"pointer",transition:"all .3s",border:`1px solid ${h?item.color+"55":T.border}`,transform:h?"translateY(-4px)":"none"}}>
    <div style={{height:150,position:"relative",overflow:"hidden"}}>
      <ImgFallback src={item.imgUrl} alt={item.name} style={{filter:"brightness(.5)",objectPosition:"top",transform:h?"scale(1.06)":"scale(1)",transition:"transform .4s"}} fallback={item.color}/>
      <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 30%,rgba(16,18,22,1))"}}/>
    </div>
    <div style={{padding:"12px 14px",background:"rgba(255,255,255,0.06)",backdropFilter:"blur(24px) saturate(180%)"}}>
      <div style={{fontSize:13,fontWeight:800,color:T.t1,marginBottom:2}}>{item.name}</div>
      <div style={{fontSize:10,color:item.color,fontWeight:700,marginBottom:8}}>{item.specialty}</div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}>
        <span style={{color:T.t2}}>{item.subscribers}</span>
        <span style={{color:T.t3}}>{item.episodes} eps</span>
      </div>
    </div>
  </div>;
}

function MiniRow({img,title,sub,right,fallback=T.purple}){
  return <div style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
    <div style={{width:38,height:38,borderRadius:8,overflow:"hidden",flexShrink:0,position:"relative"}}><ImgFallback src={img} alt={title} fallback={fallback}/></div>
    <div style={{flex:1,minWidth:0}}>
      <div style={{fontSize:12,fontWeight:700,color:T.t1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{title}</div>
      <div style={{fontSize:10,color:T.t3}}>{sub}</div>
    </div>
    {right}
  </div>;
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function HomeScreen({content,setPage}){
  return <div>
    <HeroStrip highlights={content.highlights} onNavigate={setPage}/>
    <SecRow title="🎙 Top Podcasts" color={T.cyan} onMore={()=>setPage("podcasts")}>
      {content.shows.slice(0,4).map(s=><ShowCard key={s.id} item={s}/>)}
    </SecRow>
    <SecRow title="😂 Comedy Hub" color={T.pink} onMore={()=>setPage("comedy")}>
      {content.comedy.slice(0,4).map(c=><PersonCard key={c.id} item={c}/>)}
    </SecRow>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:28}}>
      <GPanel title="🔥 Hot Trends" color={T.orange} onMore={()=>setPage("trending")}>
        {content.trending.slice(0,4).map(t=><MiniRow key={t.id} img={t.imgUrl} title={t.title} sub={t.platform} fallback={t.color} right={<span style={{fontSize:11,color:T.green,fontWeight:700}}>{t.change}</span>}/>)}
      </GPanel>
      <GPanel title="💰 Side Hustles" color={T.gold} onMore={()=>setPage("hustle")}>
        {content.hustles.map(h=><MiniRow key={h.id} img={h.imgUrl} title={h.title} sub={h.earn} fallback={h.color} right={<Chip label={h.difficulty} color={h.difficulty==="Easy"?T.green:T.gold}/>}/>)}
      </GPanel>
    </div>
  </div>;
}

function SecRow({title,color,onMore,children}){
  return <div style={{marginBottom:28}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:3,height:18,background:color,borderRadius:2}}/>
        <span style={{fontSize:11,fontWeight:700,letterSpacing:3,textTransform:"uppercase",color:T.t2}}>{title}</span>
      </div>
      <Btn small color={color} onClick={onMore}>See All →</Btn>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>{children}</div>
  </div>;
}

function GPanel({title,color,onMore,children}){
  return <div style={{background:T.panel,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:20,padding:22,backdropFilter:"blur(20px)"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:3,height:16,background:color,borderRadius:2}}/>
        <span style={{fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:T.t2}}>{title}</span>
      </div>
      <Btn small color={color} onClick={onMore}>All →</Btn>
    </div>
    {children}
  </div>;
}

// ─── LIVE ─────────────────────────────────────────────────────────────────────
function LiveScreen({content}){
  const [sel,setSel]=useState(null);
  const [log,setLog]=useState([
    {u:"Amaka_T",m:"This is insane 🔥🔥",c:T.cyan},{u:"PodFan99",m:"Marcus is hilarious",c:T.pink},{u:"TechGuru",m:"Spitting facts right now",c:T.purple},
  ]);
  const [msg,setMsg]=useState("");
  const send=()=>{ if(msg.trim()){setLog(l=>[...l,{u:"You",m:msg,c:T.green}]);setMsg("");} };

  if(sel){
    const s=content.highlights.find(x=>x.id===sel)||content.highlights[0];
    return <div>
      <Btn small onClick={()=>setSel(null)}>← All Live</Btn>
      <div style={{marginTop:18,display:"grid",gridTemplateColumns:"1fr 320px",gap:20}}>
        <div>
          <div style={{borderRadius:20,overflow:"hidden",position:"relative",aspectRatio:"16/9",marginBottom:14}}>
            <ImgFallback src={s.imgUrl} alt={s.title} style={{filter:"brightness(.45)"}} fallback={s.color||T.purple}/>
            <div style={{position:"absolute",inset:0,background:`linear-gradient(135deg,${s.color||T.purple}18,rgba(16,18,22,.5))`}}/>
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <div style={{width:72,height:72,borderRadius:"50%",background:"rgba(255,255,255,0.14)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,backdropFilter:"blur(14px) saturate(140%)",border:"2px solid rgba(255,255,255,.3)",cursor:"pointer"}}>▶</div>
            </div>
            <div style={{position:"absolute",top:14,left:14}}><Pill label="LIVE" color={T.pink} pulse/></div>
            <div style={{position:"absolute",top:14,right:14,background:"rgba(13,15,19,0.55)",backdropFilter:"blur(20px) saturate(160%)",borderRadius:8,padding:"3px 9px",fontSize:10,color:T.t1}}>👁 {s.views}</div>
            <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"14px 18px",background:"linear-gradient(to top,rgba(16,18,22,.95),transparent)"}}>
              <div style={{fontSize:17,fontWeight:800,color:T.t1}}>{s.title}</div>
              <div style={{fontSize:12,color:T.t2,marginTop:2}}>with {s.host}</div>
            </div>
          </div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <Btn color={s.color||T.cyan} filled>🎤 Hot Seat</Btn>
            <Btn color={T.gold}>◆ Send Tip</Btn>
            <Btn color={T.purple}>✂ Clip</Btn>
            <Btn color={T.t2}>↗ Share</Btn>
          </div>
        </div>
        <div style={{background:T.panel,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:20,display:"flex",flexDirection:"column",height:440,backdropFilter:"blur(20px)"}}>
          <div style={{padding:"13px 16px",borderBottom:"1px solid rgba(255,255,255,0.08)",fontSize:12,fontWeight:700}}>💬 Live Chat</div>
          <div style={{flex:1,overflowY:"auto",padding:"10px 14px",display:"flex",flexDirection:"column",gap:8}}>
            {log.map((m,i)=><div key={i}><span style={{fontSize:11,fontWeight:700,color:m.c}}>{m.u} </span><span style={{fontSize:11,color:T.t2}}>{m.m}</span></div>)}
          </div>
          <div style={{padding:"10px 12px",borderTop:"1px solid rgba(255,255,255,0.08)",display:"flex",gap:8}}>
            <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Say something…" style={{flex:1,background:"rgba(255,255,255,0.07)",border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:8,padding:"7px 10px",color:T.t1,fontSize:11,outline:"none"}}/>
            <button onClick={send} style={{background:"linear-gradient(135deg,#8FA8DE 0%,#5A78C8 100%)",boxShadow:"0 4px 20px rgba(90,120,200,0.30), inset 0 1px 0 rgba(255,255,255,0.20)",border:"none",borderRadius:8,padding:"7px 13px",color:"#000",fontWeight:800,cursor:"pointer",fontSize:12}}>→</button>
          </div>
        </div>
      </div>
    </div>;
  }

  return <div>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
      <Pill label="LIVE NOW" color={T.pink} pulse/>
      <span style={{fontSize:12,color:T.t2}}>14 Active Broadcasts</span>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
      {content.highlights.map(s=>(
        <div key={s.id} onClick={()=>setSel(s.id)}
          style={{borderRadius:20,overflow:"hidden",cursor:"pointer",height:250,position:"relative",transition:"all .3s"}}
          onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow=`0 20px 60px ${s.color||T.purple}30`;}}
          onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
          <ImgFallback src={s.imgUrl} alt={s.title} style={{filter:"brightness(.4)",position:"absolute",inset:0}} fallback={s.color||T.purple}/>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(16,18,22,.95) 0%,transparent 60%)"}}/>
          <div style={{position:"absolute",top:12,left:12}}><Pill label="LIVE" color={T.pink} pulse/></div>
          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"14px 16px"}}>
            <div style={{fontSize:14,fontWeight:800,color:T.t1,marginBottom:4}}>{s.title}</div>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:11,color:T.t2}}>{s.host}</span>
              <span style={{fontSize:11,color:s.color||T.cyan,fontWeight:700}}>{s.views}</span>
            </div>
            <div style={{marginTop:10,padding:"8px",background:`${s.color||T.cyan}18`,borderRadius:8,border:`1px solid ${s.color||T.cyan}40`,fontSize:11,fontWeight:700,color:s.color||T.cyan,textAlign:"center"}}>▶ Join Show</div>
          </div>
        </div>
      ))}
    </div>
  </div>;
}

// ─── PODCASTS ─────────────────────────────────────────────────────────────────
function PodcastsScreen({content}){
  const cats=["All",...new Set(content.shows.map(s=>s.category))];
  const [cat,setCat]=useState("All");
  const shown=cat==="All"?content.shows:content.shows.filter(s=>s.category===cat);
  return <div>
    <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
      {cats.map(c=><button key={c} onClick={()=>setCat(c)} style={{background:cat===c?"rgba(127,166,240,.15)":"rgba(255,255,255,.04)",border:`1px solid ${cat===c?T.cyan:T.border}`,color:cat===c?T.cyan:T.t2,padding:"7px 15px",borderRadius:20,fontSize:11,fontWeight:700,cursor:"pointer"}}>{c}</button>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
      {shown.map(p=><ShowCard key={p.id} item={p}/>)}
    </div>
  </div>;
}

// ─── COMEDY ───────────────────────────────────────────────────────────────────
function ComedyScreen({content}){
  return <div>
    <div style={{borderRadius:22,overflow:"hidden",height:240,position:"relative",marginBottom:24}}>
      <ImgFallback src={IMG_COMEDY_NIGHT} alt="comedy" style={{filter:"brightness(.4)"}}/>
      <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(210,104,122,.4),rgba(11,17,27,.72))"}}/>
      <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"28px 32px"}}>
        <div style={{fontSize:11,color:T.pink,fontWeight:700,letterSpacing:3,marginBottom:8}}>😂 PODCHAT COMEDY HUB</div>
        <div style={{fontSize:32,fontWeight:900,color:T.t1,letterSpacing:-1}}>The World Laughs Here</div>
        <div style={{fontSize:13,color:"rgba(255,255,255,.6)",marginTop:6}}>Stand-up · Roasts · Open Mics · Sketches · Talk Shows · Pod Wars</div>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
      {content.comedy.map(ch=>(
        <div key={ch.id} style={{borderRadius:20,overflow:"hidden",border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",background:T.panel,backdropFilter:"blur(24px) saturate(180%)",cursor:"pointer",transition:"all .3s"}}
          onMouseEnter={e=>{e.currentTarget.style.border=`1px solid ${ch.color}55`;e.currentTarget.style.transform="translateY(-4px)";}}
          onMouseLeave={e=>{e.currentTarget.style.border=`1px solid ${T.border}`;e.currentTarget.style.transform="none";}}>
          <div style={{height:165,overflow:"hidden",position:"relative"}}>
            <ImgFallback src={ch.imgUrl} alt={ch.name} style={{filter:"brightness(.45)",objectPosition:"top"}} fallback={ch.color}/>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 30%,rgba(16,18,22,1))"}}/>
          </div>
          <div style={{padding:"14px 16px"}}>
            <div style={{fontSize:14,fontWeight:800,color:T.t1,marginBottom:2}}>{ch.name}</div>
            <div style={{fontSize:10,color:ch.color,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>{ch.specialty}</div>
            <div style={{fontSize:11,color:T.t2,marginBottom:12,lineHeight:1.5}}>{ch.bio}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",gap:12}}>
                <div><div style={{fontSize:13,fontWeight:800,color:T.t1}}>{ch.subscribers}</div><div style={{fontSize:9,color:T.t3}}>SUBS</div></div>
                <div><div style={{fontSize:13,fontWeight:800,color:T.t1}}>{ch.episodes}</div><div style={{fontSize:9,color:T.t3}}>EPS</div></div>
              </div>
              <Btn small color={ch.color} filled>Watch →</Btn>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>;
}

// ─── INTERVIEWS ───────────────────────────────────────────────────────────────
function InterviewsScreen({content}){
  return <div>
    <div style={{fontSize:11,fontWeight:700,letterSpacing:3,textTransform:"uppercase",color:T.t2,marginBottom:18}}>◈ Featured Interviews</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:16}}>
      {content.interviews.map(i=>(
        <div key={i.id} style={{borderRadius:20,overflow:"hidden",border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",background:T.panel,backdropFilter:"blur(24px) saturate(180%)",display:"flex",cursor:"pointer",transition:"all .25s"}}
          onMouseEnter={e=>{e.currentTarget.style.border=`1px solid ${i.color||T.purple}50`;e.currentTarget.style.transform="translateY(-2px)";}}
          onMouseLeave={e=>{e.currentTarget.style.border=`1px solid ${T.border}`;e.currentTarget.style.transform="none";}}>
          <div style={{width:130,flexShrink:0,overflow:"hidden"}}>
            <ImgFallback src={i.imgUrl} alt={i.guest} style={{filter:"brightness(.55)",objectPosition:"top",height:"100%"}} fallback={i.color||T.purple}/>
          </div>
          <div style={{flex:1,padding:"18px 20px"}}>
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              {i.hot&&<Chip label="HOT" color={T.pink}/>}
              <span style={{fontSize:10,color:T.t3}}>{i.date}</span>
            </div>
            <div style={{fontSize:17,fontWeight:800,color:T.t1,marginBottom:2}}>{i.guest}</div>
            <div style={{fontSize:11,color:T.t2,marginBottom:4}}>with {i.host}</div>
            <div style={{fontSize:12,color:i.color||T.purple,fontWeight:600,marginBottom:14}}>{i.topic}</div>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <Btn small color={i.color||T.purple} filled>▶ Watch</Btn>
              <span style={{fontSize:12,color:T.gold,fontWeight:700}}>👁 {i.views}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>;
}

// ─── TRENDING ─────────────────────────────────────────────────────────────────
function TrendingScreen({content}){
  return <div>
    <div style={{borderRadius:22,overflow:"hidden",height:200,position:"relative",marginBottom:24}}>
      <ImgFallback src={IMG_STUDIO_DRAMATIC} alt="trending" style={{filter:"brightness(.4)"}}/>
      <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(255,107,53,.4),rgba(11,17,27,.72))"}}/>
      <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"22px 28px"}}>
        <div style={{fontSize:11,color:T.orange,fontWeight:700,letterSpacing:3,marginBottom:6}}>🔥 LIVE TREND INTELLIGENCE</div>
        <div style={{fontSize:26,fontWeight:900,color:T.t1,letterSpacing:-1}}>What's Exploding Right Now</div>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14}}>
      {content.trending.map(t=>(
        <div key={t.id} style={{borderRadius:18,overflow:"hidden",border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",background:T.panel,backdropFilter:"blur(24px) saturate(180%)",display:"flex",cursor:"pointer",transition:"all .25s"}}
          onMouseEnter={e=>{e.currentTarget.style.border=`1px solid ${t.color}50`;e.currentTarget.style.transform="translateY(-2px)";}}
          onMouseLeave={e=>{e.currentTarget.style.border=`1px solid ${T.border}`;e.currentTarget.style.transform="none";}}>
          <div style={{width:110,flexShrink:0,overflow:"hidden"}}>
            <ImgFallback src={t.imgUrl} alt={t.title} style={{filter:"brightness(.5)",height:"100%"}} fallback={t.color}/>
          </div>
          <div style={{flex:1,padding:"14px 16px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <Chip label={t.platform} color={t.color}/>
              <span style={{fontSize:12,color:T.green,fontWeight:800}}>{t.change}</span>
            </div>
            <div style={{fontSize:13,fontWeight:800,color:T.t1,marginBottom:6}}>{t.title}</div>
            <div style={{fontSize:11,color:T.t2,lineHeight:1.5,marginBottom:8}}>{(t.desc||"").substring(0,80)}…</div>
            <div style={{display:"flex",alignItems:"flex-end",gap:8}}>
              <div style={{flex:1}}><Meter value={t.heat||50} tone={t.color} segments={22} height={12}/></div>
              <span style={{fontSize:10,color:T.t2,fontWeight:700,letterSpacing:.6,fontVariantNumeric:"tabular-nums"}}>{t.heat} <span style={{color:T.t3}}>IDX</span></span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>;
}

// ─── HUSTLE ───────────────────────────────────────────────────────────────────
function HustleScreen({content}){
  const [sel,setSel]=useState(null);
  const h=sel?content.hustles.find(x=>x.id===sel):null;
  if(h) return <div>
    <Btn small onClick={()=>setSel(null)}>← All Hustles</Btn>
    <div style={{marginTop:18,display:"grid",gridTemplateColumns:"1fr 300px",gap:20}}>
      <div>
        <div style={{borderRadius:22,overflow:"hidden",height:220,position:"relative",marginBottom:20}}>
          <ImgFallback src={h.imgUrl} alt={h.title} style={{filter:"brightness(.4)"}} fallback={h.color}/>
          <div style={{position:"absolute",inset:0,background:`linear-gradient(135deg,${h.color}25,rgba(16,18,22,.75))`}}/>
          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"22px 26px"}}>
            <div style={{display:"flex",gap:10,marginBottom:8}}><Chip label={h.difficulty} color={h.difficulty==="Easy"?T.green:T.gold}/><Chip label={h.platform} color={T.purple}/></div>
            <div style={{fontSize:24,fontWeight:900,color:T.t1}}>{h.title}</div>
            <div style={{fontSize:20,fontWeight:900,color:h.color,marginTop:4}}>{h.earn}</div>
          </div>
        </div>
        <div style={{background:T.panel,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:18,padding:22,backdropFilter:"blur(24px) saturate(180%)"}}>
          <div style={{fontSize:14,color:T.t1,lineHeight:1.8,marginBottom:18}}>{h.desc}</div>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:T.t2,marginBottom:14}}>Step-by-Step</div>
          {(h.steps||[]).map((s,i)=>(
            <div key={i} style={{display:"flex",gap:12,marginBottom:12}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:`${h.color}20`,border:`1px solid ${h.color}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:h.color,flexShrink:0}}>{i+1}</div>
              <div style={{fontSize:13,color:T.t2,lineHeight:1.6,paddingTop:3}}>{s}</div>
            </div>
          ))}
          <div style={{display:"flex",gap:10,marginTop:16}}>
            <Btn color={h.color} filled>🚀 Start This Hustle</Btn>
            <Btn color={T.gold}>💰 Find Brands</Btn>
          </div>
        </div>
      </div>
      <div style={{background:T.panel,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:18,padding:22,backdropFilter:"blur(24px) saturate(180%)",alignSelf:"start"}}>
        <div style={{fontSize:12,fontWeight:700,color:h.color,marginBottom:14}}>💰 Earning Timeline</div>
        {[["Month 1–2","$0–$500",T.t3],["Month 3–5","$500–$2K",T.gold],["Month 6+",h.earn,h.color]].map(([l,v,c])=>(
          <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
            <span style={{fontSize:11,color:T.t2}}>{l}</span>
            <span style={{fontSize:12,fontWeight:800,color:c}}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  </div>;

  return <div>
    <div style={{borderRadius:22,overflow:"hidden",height:200,position:"relative",marginBottom:24}}>
      <ImgFallback src={IMG_STUDIO_DRAMATIC} alt="hustle" style={{filter:"brightness(.4)"}}/>
      <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(245,158,11,.3),rgba(11,17,27,.72))"}}/>
      <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"22px 28px"}}>
        <div style={{fontSize:11,color:T.gold,fontWeight:700,letterSpacing:3,marginBottom:6}}>💰 SIDE HUSTLE HUB</div>
        <div style={{fontSize:26,fontWeight:900,color:T.t1,letterSpacing:-1}}>Turn Your Voice Into Income</div>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:16}}>
      {content.hustles.map(h=>(
        <div key={h.id} onClick={()=>setSel(h.id)} style={{borderRadius:18,overflow:"hidden",border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",background:T.panel,backdropFilter:"blur(24px) saturate(180%)",display:"flex",cursor:"pointer",transition:"all .25s"}}
          onMouseEnter={e=>{e.currentTarget.style.border=`1px solid ${h.color}50`;e.currentTarget.style.transform="translateY(-2px)";}}
          onMouseLeave={e=>{e.currentTarget.style.border=`1px solid ${T.border}`;e.currentTarget.style.transform="none";}}>
          <div style={{width:110,flexShrink:0,overflow:"hidden"}}>
            <ImgFallback src={h.imgUrl} alt={h.title} style={{filter:"brightness(.5)",height:"100%"}} fallback={h.color}/>
          </div>
          <div style={{flex:1,padding:"16px 18px"}}>
            <Chip label={h.difficulty} color={h.difficulty==="Easy"?T.green:T.gold}/>
            <div style={{fontSize:13,fontWeight:800,color:T.t1,marginTop:8,marginBottom:2}}>{h.title}</div>
            <div style={{fontSize:17,fontWeight:900,color:h.color,marginBottom:6}}>{h.earn}</div>
            <div style={{fontSize:11,color:T.t2,lineHeight:1.5}}>{(h.desc||"").substring(0,70)}…</div>
          </div>
        </div>
      ))}
    </div>
  </div>;
}

// ─── STUDIO ───────────────────────────────────────────────────────────────────
function StudioScreen(){
  const [rec,setRec]=useState(false);
  const [secs,setSecs]=useState(0);
  useEffect(()=>{ if(!rec){setSecs(0);return;} const t=setInterval(()=>setSecs(s=>s+1),1000);return()=>clearInterval(t); },[rec]);
  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  return <div>
    <div style={{borderRadius:22,overflow:"hidden",height:220,position:"relative",marginBottom:22}}>
      <ImgFallback src={IMG_STUDIO_DRAMATIC} alt="studio" style={{filter:"brightness(.4)"}}/>
      <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(127,166,240,.2),rgba(139,92,246,.2),rgba(16,18,22,.65))"}}/>
      <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"22px 28px"}}>
        <div style={{fontSize:11,color:T.cyan,fontWeight:700,letterSpacing:3,marginBottom:6}}>▣ CREATOR STUDIO</div>
        <div style={{fontSize:24,fontWeight:900,color:T.t1}}>Your Professional Broadcasting Hub</div>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:20}}>
      <div>
        <div style={{background:T.panel,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:20,padding:22,backdropFilter:"blur(24px) saturate(180%)",marginBottom:16}}>
          <div style={{display:"flex",gap:12,marginBottom:14}}>
            <button onClick={()=>setRec(r=>!r)} style={{flex:1,padding:"13px",background:rec?`linear-gradient(135deg,${T.pink},${T.orange})`:`linear-gradient(135deg,${T.cyan},${T.purple})`,border:"none",borderRadius:12,color:rec?"#fff":"#000",fontSize:13,fontWeight:900,cursor:"pointer"}}>
              {rec?`⏹ Stop  ${fmt(secs)}`:"⏺ Start Recording"}
            </button>
            <button style={{flex:1,padding:"13px",background:`linear-gradient(135deg,${T.pink},${T.orange})`,border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:900,cursor:"pointer"}}>◉ Go Live Now</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
            {[["🎙","Mic","Connected",T.green],["📷","Camera","Ready",T.cyan],["🎵","BGM","Off",T.t3],["🤖","AI Notes","On",T.purple]].map(([e,l,s,c])=>(
              <div key={l} style={{background:T.glass,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:10,padding:10,textAlign:"center"}}>
                <div style={{fontSize:16,marginBottom:3}}>{e}</div>
                <div style={{fontSize:10,color:T.t1,marginBottom:2}}>{l}</div>
                <div style={{fontSize:10,fontWeight:700,color:c}}>{s}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{background:T.panel,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:20,padding:22,backdropFilter:"blur(24px) saturate(180%)"}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:T.t2,marginBottom:14}}>Your Episodes</div>
          {[{t:"Ep 24: The AI Comedy Episode",s:"Published",v:"84K"},{t:"Ep 23: Late Night Unfiltered",s:"Published",v:"112K"},{t:"Ep 25: Coming Next Week",s:"Scheduled",v:"—"}].map((ep,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:700,color:T.t1}}>{ep.t}</div>
                <div style={{fontSize:10,color:T.t2}}>{ep.v} views</div>
              </div>
              <Chip label={ep.s} color={ep.s==="Published"?T.green:T.gold}/>
              <Btn small>Edit</Btn>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div style={{background:T.panel,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:18,padding:20,backdropFilter:"blur(24px) saturate(180%)",marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:2,color:T.t2,textTransform:"uppercase",marginBottom:14}}>Stats</div>
          {[["Subscribers","12,480",T.cyan],["Total Plays","2.1M",T.purple],["This Month","$840",T.gold],["PodCoins","2,840 PC",T.gold],["Completion","74%",T.pink]].map(([l,v,c])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
              <span style={{fontSize:11,color:T.t2}}>{l}</span>
              <span style={{fontSize:12,fontWeight:800,color:c}}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{background:`linear-gradient(135deg,rgba(245,158,11,.08),rgba(16,18,22,.9))`,border:`1px solid rgba(245,158,11,.2)`,borderRadius:18,padding:20}}>
          <div style={{fontSize:11,fontWeight:700,color:T.gold,marginBottom:8}}>✦ AI Show Assistant</div>
          <div style={{fontSize:12,color:T.t2,lineHeight:1.7,marginBottom:12}}>Suggested: <b style={{color:T.t1}}>"Gen Z Is Saving Comedy"</b> — trending +340%. Est. 80K plays.</div>
          <Btn color={T.gold} filled small>Generate Show Notes</Btn>
        </div>
      </div>
    </div>
  </div>;
}

// ─── WALLET ───────────────────────────────────────────────────────────────────
function WalletScreen({podCoins,setPodCoins}){
  return <div>
    <div style={{borderRadius:22,overflow:"hidden",height:220,position:"relative",marginBottom:22}}>
      <ImgFallback src={IMG_MIC_GOLD_SILVER} alt="wallet" style={{filter:"brightness(.35)"}}/>
      <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(245,158,11,.35),rgba(139,92,246,.25),rgba(11,17,27,.72))"}}/>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <div style={{fontSize:11,color:T.gold,fontWeight:700,letterSpacing:3,marginBottom:8}}>◆ PODCOINS WALLET</div>
        <div style={{fontSize:52,fontWeight:900,color:T.gold,letterSpacing:-2}}>{podCoins.toLocaleString()}</div>
        <div style={{fontSize:13,color:"rgba(255,255,255,.55)",marginBottom:18}}>≈ ${(podCoins*.01).toFixed(2)} USD</div>
        <div style={{display:"flex",gap:12}}>
          <Btn color={T.gold} filled onClick={()=>setPodCoins(p=>p+500)}>+ Buy 500 PC</Btn>
          <Btn color={T.green} onClick={()=>setPodCoins(p=>Math.max(0,p-200))}>💸 Cash Out</Btn>
        </div>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <div style={{background:T.panel,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:20,padding:22,backdropFilter:"blur(24px) saturate(180%)"}}>
        <div style={{fontSize:11,fontWeight:700,color:T.green,letterSpacing:2,textTransform:"uppercase",marginBottom:14}}>Earnings Breakdown</div>
        {[["View RPM — Per 1K Plays","1,240 PC",T.cyan],["Live Tips & PodCoin Gifts","840 PC",T.gold],["Superfan Subscriptions","600 PC",T.purple],["Brand Deals","3,200 PC",T.pink],["Ticket Sales","500 PC",T.green]].map(([l,v,c])=>(
          <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
            <span style={{fontSize:11,color:T.t2}}>{l}</span>
            <span style={{fontSize:12,fontWeight:800,color:c}}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{background:T.panel,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:20,padding:22,backdropFilter:"blur(24px) saturate(180%)"}}>
        <div style={{fontSize:11,fontWeight:700,color:T.gold,letterSpacing:2,textTransform:"uppercase",marginBottom:14}}>Recent Transactions</div>
        {[["+840 PC","Episode plays — Jun 20",T.green],["+200 PC","Tip from @PodFan99",T.gold],["-50 PC","Ticket: Comedy Wars",T.pink],["+1200 PC","Brand deal — Jun 15",T.cyan],["-200 PC","Boosted Episode 24",T.t3]].map(([a,d,c],i)=>(
          <div key={i} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
            <div style={{width:26,height:26,borderRadius:"50%",background:`${c}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:c,flexShrink:0}}>{a.startsWith("+")?"▲":"▼"}</div>
            <div style={{flex:1,fontSize:11,color:T.t1}}>{d}</div>
            <div style={{fontSize:11,fontWeight:800,color:c}}>{a}</div>
          </div>
        ))}
      </div>
    </div>
  </div>;
}

// ─── CMS ─────────────────────────────────────────────────────────────────────

function CMSScreen({content,setContent}){
  const [tab,setTab]       = useState("dashboard");
  const [saved,setSaved]   = useState(false);
  const [confirm,setConfirm] = useState(null);
  const [toast,setToast]   = useState(null);
  const [previewImg,setPreviewImg] = useState(null);

  const showToast = (msg,color=T.green) => {
    setToast({msg,color});
    setTimeout(()=>setToast(null),3000);
  };

  const update = (section,val) => {
    const n={...content,[section]:val};
    setContent(n); saveContent(n);
    setSaved(true); setTimeout(()=>setSaved(false),2000);
    showToast("✓ Saved successfully!");
  };

  // FIX #5: revoke blob URL after download
  const exportJSON = () => {
    const blob=new Blob([JSON.stringify(content,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url; a.download="podchat-content.json"; a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    showToast("✓ JSON exported — save this file as your backup!",T.cyan);
  };

  const resetAll = () => setConfirm({
    msg:"Reset ALL content to factory defaults? This will delete all your edits.",
    onYes:()=>{ setContent(DEFAULT_CONTENT); saveContent(DEFAULT_CONTENT); setConfirm(null); showToast("Platform reset to defaults",T.pink); }
  });

  const TOOL_TABS = [
    {id:"dashboard",  icon:"⬡", label:"Dashboard"},
    {id:"brand",      icon:"🎨", label:"Brand"},
    {id:"highlights", icon:"🎬", label:"Hero Slides"},
    {id:"shows",      icon:"🎙", label:"Podcasts"},
    {id:"comedy",     icon:"😂", label:"Comedy"},
    {id:"interviews", icon:"◈",  label:"Interviews"},
    {id:"trending",   icon:"🔥", label:"Trending"},
    {id:"hustles",    icon:"💰", label:"Hustles"},
    {id:"tools",      icon:"🔧", label:"Tools"},
    {id:"help",       icon:"❓", label:"Help"},
  ];

  /* ── quick-stats for dashboard ── */
  const stats = [
    {label:"Hero Slides",    val:content.highlights.length, color:T.cyan,   icon:"🎬"},
    {label:"Podcasts",       val:content.shows.length,      color:T.purple, icon:"🎙"},
    {label:"Comedy Channels",val:content.comedy.length,     color:T.pink,   icon:"😂"},
    {label:"Interviews",     val:content.interviews.length, color:T.gold,   icon:"◈"},
    {label:"Trending Topics",val:content.trending.length,   color:T.orange, icon:"🔥"},
    {label:"Side Hustles",   val:content.hustles.length,    color:T.green,  icon:"💰"},
  ];

  return(
    <div style={{minHeight:"80vh"}}>
      {confirm && <ConfirmDialog msg={confirm.msg} onYes={confirm.onYes} onNo={()=>setConfirm(null)}/>}

      {/* Toast notification */}
      {toast && (
        <div style={{position:"fixed",top:72,right:24,zIndex:999,background:T.panel,
          border:`1px solid ${toast.color}`,borderRadius:12,padding:"12px 20px",
          backdropFilter:"blur(20px)",boxShadow:`0 8px 32px ${toast.color}30`,
          display:"flex",alignItems:"center",gap:10,animation:"fadeIn .3s"}}>
          <span style={{fontSize:12,fontWeight:700,color:toast.color}}>{toast.msg}</span>
        </div>
      )}

      {/* Image preview modal */}
      {previewImg && (
        <div onClick={()=>setPreviewImg(null)} style={{position:"fixed",inset:0,zIndex:998,
          background:"rgba(0,0,0,.85)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
          <div style={{maxWidth:"80vw",maxHeight:"80vh",borderRadius:16,overflow:"hidden",
            border:`2px solid ${T.borderHi}`}}>
            <img src={previewImg} alt="preview" style={{width:"100%",height:"100%",objectFit:"contain"}}/>
          </div>
          <div style={{position:"absolute",top:20,right:20,color:T.t1,fontSize:24,cursor:"pointer"}}>✕</div>
        </div>
      )}

      {/* ── ADMIN HEADER ── */}
      <div style={{background:`linear-gradient(135deg,rgba(127,166,240,.08),rgba(139,92,246,.06))`,
        border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:20,padding:"20px 26px",marginBottom:20,
        display:"flex",justifyContent:"space-between",alignItems:"center",backdropFilter:"blur(24px) saturate(180%)"}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
            <span style={{fontSize:11,fontWeight:700,color:T.cyan,letterSpacing:3}}>🔑 ADMIN CONTROL ROOM</span>
            <div style={{background:`${T.green}20`,border:`1px solid ${T.green}40`,borderRadius:20,
              padding:"2px 10px",fontSize:9,fontWeight:700,color:T.green}}>● LIVE</div>
          </div>
          <div style={{fontSize:18,fontWeight:900,color:T.t1}}>PodChat Content Manager</div>
          <div style={{fontSize:11,color:T.t2,marginTop:2}}>
            All changes save instantly · {content.shows.length + content.comedy.length + content.interviews.length + content.highlights.length} total content items
          </div>
        </div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          {saved && <span style={{fontSize:12,color:T.green,fontWeight:700,alignSelf:"center"}}>✓ Saved</span>}
          <Btn color={T.cyan} small onClick={exportJSON}>⬇ Export JSON</Btn>
          <Btn color={T.purple} small onClick={()=>setTab("tools")}>🔧 Tools</Btn>
          <Btn color={T.pink} small onClick={resetAll} style={{border:`1px solid ${T.pink}`,color:T.pink,background:"transparent"}}>↺ Reset</Btn>
        </div>
      </div>

      {/* ── TAB BAR ── */}
      <div style={{display:"flex",gap:4,marginBottom:20,flexWrap:"wrap",
        background:T.panel,borderRadius:16,padding:8,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)"}}>
        {TOOL_TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{display:"flex",alignItems:"center",gap:6,
              background:tab===t.id?`linear-gradient(135deg,${T.cyan}25,${T.purple}15)`:"transparent",
              border:`1px solid ${tab===t.id?T.cyan+"60":"transparent"}`,
              color:tab===t.id?T.cyan:T.t2,
              padding:"8px 14px",borderRadius:10,fontSize:11,fontWeight:700,cursor:"pointer",
              boxShadow:tab===t.id?`0 0 12px ${T.cyan}18`:"none",transition:"all .2s"}}>
            <span>{t.icon}</span><span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── DASHBOARD ── */}
      {tab==="dashboard" && (
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:24}}>
            {stats.map(s=>(
              <div key={s.label} style={{background:T.panel,border:`1px solid ${s.color}25`,
                borderRadius:16,padding:"18px 20px",backdropFilter:"blur(24px) saturate(180%)",
                display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:44,height:44,borderRadius:12,background:`${s.color}18`,
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{s.icon}</div>
                <div>
                  <div style={{fontSize:28,fontWeight:900,color:s.color,letterSpacing:-1}}>{s.val}</div>
                  <div style={{fontSize:11,color:T.t2}}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div style={{background:T.panel,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:20,
            padding:22,backdropFilter:"blur(24px) saturate(180%)",marginBottom:20}}>
            <div style={{fontSize:13,fontWeight:700,color:T.t1,marginBottom:16}}>⚡ Quick Actions</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
              {[
                {label:"Add Podcast",    icon:"🎙",color:T.cyan,   go:"shows"},
                {label:"Add Comedy Ch.", icon:"😂",color:T.pink,   go:"comedy"},
                {label:"Add Interview",  icon:"◈", color:T.purple, go:"interviews"},
                {label:"Add Hero Slide", icon:"🎬",color:T.gold,   go:"highlights"},
                {label:"Add Trend",      icon:"🔥",color:T.orange, go:"trending"},
                {label:"Add Hustle",     icon:"💰",color:T.green,  go:"hustles"},
                {label:"Edit Brand",     icon:"🎨",color:T.cyan,   go:"brand"},
                {label:"Open Tools",     icon:"🔧",color:T.purple, go:"tools"},
              ].map(a=>(
                <div key={a.label} onClick={()=>setTab(a.go)}
                  style={{background:`${a.color}0A`,border:`1px solid ${a.color}30`,
                    borderRadius:12,padding:"14px 10px",textAlign:"center",cursor:"pointer",
                    transition:"all .2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.border=`1px solid ${a.color}60`;e.currentTarget.style.transform="translateY(-2px)";}}
                  onMouseLeave={e=>{e.currentTarget.style.border=`1px solid ${a.color}30`;e.currentTarget.style.transform="none";}}>
                  <div style={{fontSize:22,marginBottom:6}}>{a.icon}</div>
                  <div style={{fontSize:11,fontWeight:700,color:a.color}}>{a.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Platform health */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div style={{background:T.panel,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:16,padding:20,backdropFilter:"blur(24px) saturate(180%)"}}>
              <div style={{fontSize:12,fontWeight:700,color:T.cyan,marginBottom:14}}>✅ Platform Health</div>
              {[
                ["Content saved",        "Browser storage",  T.green],
                ["Images",               "All embedded",     T.green],
                ["Brand references",     "Zero competitors", T.green],
                ["Copyright scan",       "Clean",            T.green],
                ["Backend",              "Not yet connected",T.gold],
                ["Auth/Login",           "Not yet added",    T.gold],
                ["Real payments",        "Not yet added",    T.gold],
              ].map(([l,v,c])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",
                  padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
                  <span style={{fontSize:11,color:T.t2}}>{l}</span>
                  <span style={{fontSize:11,fontWeight:700,color:c}}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{background:T.panel,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:16,padding:20,backdropFilter:"blur(24px) saturate(180%)"}}>
              <div style={{fontSize:12,fontWeight:700,color:T.gold,marginBottom:14}}>📋 What to Do Next</div>
              {[
                ["1","Deploy to Vercel",             T.cyan],
                ["2","Add your real logo",           T.cyan],
                ["3","Replace placeholder names",    T.cyan],
                ["4","Add Supabase backend",         T.gold],
                ["5","Connect Stripe payments",      T.gold],
                ["6","Add user auth/login",          T.gold],
                ["7","Launch & share your URL",      T.green],
              ].map(([n,l,c])=>(
                <div key={n} style={{display:"flex",alignItems:"center",gap:10,
                  padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
                  <div style={{width:20,height:20,borderRadius:"50%",background:`${c}20`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:10,fontWeight:800,color:c,flexShrink:0}}>{n}</div>
                  <span style={{fontSize:11,color:T.t2}}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── BRAND ── */}
      {tab==="brand" && <CMSBrand brand={content.brand} onChange={v=>update("brand",v)} onPreview={setPreviewImg}/>}

      {/* ── LIST TABS ── */}
      {tab==="highlights" && <CMSList items={content.highlights}
        fields={[{k:"title",l:"Title"},{k:"host",l:"Host"},{k:"description",l:"Description",m:true},
                 {k:"category",l:"Category"},{k:"imgUrl",l:"Image URL"},{k:"badge",l:"Badge"},
                 {k:"color",l:"Accent Hex"},{k:"cta",l:"Button Text"},{k:"views",l:"View Count"}]}
        blank={{id:"",title:"New Highlight",host:"",description:"",category:"",imgUrl:"",badge:"NEW",color:T.cyan,cta:"Watch Now",views:"0"}}
        onChange={v=>update("highlights",v)} onConfirm={setConfirm} onPreview={setPreviewImg}/>}

      {tab==="shows" && <CMSList items={content.shows}
        fields={[{k:"title",l:"Title"},{k:"host",l:"Host"},{k:"category",l:"Category"},
                 {k:"subscribers",l:"Subscribers"},{k:"episodes",l:"Episodes"},
                 {k:"imgUrl",l:"Image URL"},{k:"color",l:"Accent Hex"},{k:"description",l:"Description",m:true}]}
        blank={{id:"",title:"New Show",host:"",category:"",subscribers:"0",episodes:0,imgUrl:"",color:T.cyan,description:""}}
        onChange={v=>update("shows",v)} onConfirm={setConfirm} onPreview={setPreviewImg}/>}

      {tab==="comedy" && <CMSList items={content.comedy}
        fields={[{k:"name",l:"Name"},{k:"specialty",l:"Specialty"},{k:"subscribers",l:"Subscribers"},
                 {k:"episodes",l:"Episodes"},{k:"imgUrl",l:"Photo URL"},{k:"color",l:"Accent Hex"},{k:"bio",l:"Bio",m:true}]}
        blank={{id:"",name:"New Comedian",specialty:"",subscribers:"0",episodes:0,imgUrl:"",color:T.pink,bio:""}}
        onChange={v=>update("comedy",v)} onConfirm={setConfirm} onPreview={setPreviewImg}/>}

      {tab==="interviews" && <CMSList items={content.interviews}
        fields={[{k:"guest",l:"Guest"},{k:"host",l:"Host"},{k:"topic",l:"Topic"},
                 {k:"views",l:"Views"},{k:"date",l:"Date"},{k:"imgUrl",l:"Photo URL"},{k:"color",l:"Accent Hex"}]}
        blank={{id:"",guest:"New Guest",host:"",topic:"",views:"0",date:"",imgUrl:"",color:T.purple,hot:false}}
        onChange={v=>update("interviews",v)} onConfirm={setConfirm} onPreview={setPreviewImg}/>}

      {tab==="trending" && <CMSList items={content.trending}
        fields={[{k:"title",l:"Title"},{k:"platform",l:"Platform"},{k:"change",l:"% Change"},
                 {k:"heat",l:"Heat 0–100"},{k:"imgUrl",l:"Image URL"},{k:"color",l:"Accent Hex"},{k:"desc",l:"Description",m:true}]}
        blank={{id:"",title:"New Trend",platform:"",change:"+0%",heat:50,imgUrl:"",color:T.orange,desc:""}}
        onChange={v=>update("trending",v)} onConfirm={setConfirm} onPreview={setPreviewImg}/>}

      {tab==="hustles" && <CMSList items={content.hustles}
        fields={[{k:"title",l:"Title"},{k:"earn",l:"Earnings"},{k:"difficulty",l:"Difficulty"},
                 {k:"platform",l:"Platform"},{k:"imgUrl",l:"Image URL"},{k:"color",l:"Accent Hex"},{k:"desc",l:"Description",m:true}]}
        blank={{id:"",title:"New Hustle",earn:"$0/mo",difficulty:"Easy",platform:"All",imgUrl:"",color:T.gold,desc:"",steps:["Step 1","Step 2","Step 3","Step 4"]}}
        onChange={v=>update("hustles",v)} onConfirm={setConfirm} onPreview={setPreviewImg}/>}

      {/* ── TOOLS ── */}
      {tab==="tools" && (
        <div>
          <div style={{fontSize:13,fontWeight:700,color:T.t1,marginBottom:20}}>🔧 Admin Tools</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>

            {/* Color picker tool */}
            <ToolCard title="🎨 Color Picker" color={T.cyan}
              desc="Find the perfect hex color code for your brand. Type a color name or pick from the palette.">
              <ColorPickerTool/>
            </ToolCard>

            {/* Image URL tester */}
            <ToolCard title="🖼 Image URL Tester" color={T.purple}
              desc="Paste any image URL to preview it before adding to your platform.">
              <ImgTester onPreview={setPreviewImg}/>
            </ToolCard>

            {/* Content counter */}
            <ToolCard title="📊 Content Summary" color={T.gold}
              desc="Full breakdown of everything on your platform right now.">
              <div>
                {[
                  ["Hero Slides",     content.highlights.length, T.cyan],
                  ["Podcasts",        content.shows.length,      T.purple],
                  ["Comedy Channels", content.comedy.length,     T.pink],
                  ["Interviews",      content.interviews.length, T.gold],
                  ["Trending Topics", content.trending.length,   T.orange],
                  ["Side Hustles",    content.hustles.length,    T.green],
                ].map(([l,v,c])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",
                    alignItems:"center",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
                    <span style={{fontSize:12,color:T.t2}}>{l}</span>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:`${Math.min(v*12,80)}px`,height:4,borderRadius:2,background:c}}/>
                      <span style={{fontSize:13,fontWeight:800,color:c,minWidth:16,textAlign:"right"}}>{v}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ToolCard>

            {/* Backup & restore */}
            <ToolCard title="💾 Backup & Restore" color={T.green}
              desc="Export your content as a JSON file to back it up, or paste JSON to restore it.">
              <BackupTool content={content} setContent={setContent} showToast={showToast}/>
            </ToolCard>

            {/* Accent color preview */}
            <ToolCard title="✨ Brand Preview" color={T.purple}
              desc="See how your brand name, tagline and accent color look before you save them.">
              <BrandPreviewTool brand={content.brand}/>
            </ToolCard>

            {/* Deployment checklist */}
            <ToolCard title="🚀 Launch Checklist" color={T.orange}
              desc="Check off everything you need before going live.">
              <LaunchChecklist content={content}/>
            </ToolCard>

          </div>
        </div>
      )}

      {/* ── HELP ── */}
      {tab==="help" && (
        <div>
          <div onClick={openSupport} style={{display:"flex",alignItems:"center",gap:14,background:T.panel,border:"1px solid rgba(175,200,240,0.16)",borderRadius:16,padding:"16px 20px",marginBottom:16,cursor:"pointer",backdropFilter:"blur(24px) saturate(180%)"}}>
            <div style={{width:40,height:40,borderRadius:12,background:`${T.cyan}18`,border:`1px solid ${T.cyan}40`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:T.cyan}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:800,color:T.t1}}>Need more help? Contact Support</div>
              <div style={{fontSize:11,color:T.t2,marginTop:2}}>Reach the PodChat support team at wittyhub.co — opens in a new tab.</div>
            </div>
            <span style={{fontSize:11,fontWeight:700,color:T.cyan}}>Open ↗</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            {[
              {q:"How do I add a new podcast show?", a:"Open the Podcasts tab, click + Add New, fill in the title, host, category, cover image and description, then click Add. It appears on the platform immediately.", color:T.gold},
              {q:"How do I change an image?",         a:"Click Edit on any item, find the image field, then either upload a file from your device or paste a new URL. A live preview shows the new image before you save.", color:T.indigo},
              {q:"Where do I get high quality images?", a:"Use your own photography, or licensed libraries such as Unsplash and Pexels. Always pick the largest available size so covers stay sharp on big screens.", color:T.gold},
              {q:"My edits disappeared after refresh",a:"Edits save to this browser. If you cleared browsing data or switched devices, they reset. Click Export JSON regularly to keep a backup file.", color:T.rose},
              {q:"How do I change the platform name?",a:"Open the Brand tab and change the Platform Name field. The name updates everywhere instantly.", color:T.amber},
              {q:"How do I add my logo?",             a:"Open the Brand tab, upload your logo file or paste its URL, then save. Your logo appears in the sidebar and on the welcome screen.", color:T.green},
              {q:"What is a hex color code?",         a:"A hex code is a six-character code for a color, for example #7FA6F0 for champagne gold. Any color picker tool will give you the hex value.", color:T.gold},
              {q:"How do I back up my content?",      a:"Click Export JSON at the top right of the Content Manager and save the downloaded file. That file is your full content backup.", color:T.indigo},
              {q:"Can regular users see this page?",  a:"No. The Content Manager is admin only. Listeners and creators never see it in their navigation.", color:T.gold},
              {q:"Which departments are editable?",   a:"Shows, live highlights, comedy, interviews, people, categories, imagery and brand settings are all editable from this panel.", color:T.rose},
            ].map((item,i)=>(
              <HelpCard key={i} q={item.q} a={item.a} color={item.color}/>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── TOOL CARD WRAPPER ─────────────────────────────────────────────────────── */
function ToolCard({title,color,desc,children}){
  return(
    <div style={{background:T.panel,border:`1px solid ${color}30`,borderRadius:20,
      padding:22,backdropFilter:"blur(24px) saturate(180%)"}}>
      <div style={{fontSize:14,fontWeight:800,color:T.t1,marginBottom:4}}>{title}</div>
      <div style={{fontSize:11,color:T.t2,marginBottom:16,lineHeight:1.6}}>{desc}</div>
      {children}
    </div>
  );
}

/* ── HELP CARD ─────────────────────────────────────────────────────────────── */
function HelpCard({q,a,color}){
  const [open,setOpen]=useState(false);
  return(
    <div style={{background:T.panel,border:`1px solid ${open?color+"50":T.border}`,
      borderRadius:14,overflow:"hidden",backdropFilter:"blur(24px) saturate(180%)",transition:"border .2s"}}>
      <div onClick={()=>setOpen(o=>!o)}
        style={{padding:"14px 18px",display:"flex",justifyContent:"space-between",
          alignItems:"center",cursor:"pointer",gap:12}}>
        <span style={{fontSize:12,fontWeight:700,color:T.t1,lineHeight:1.4}}>{q}</span>
        <span style={{color:color,fontSize:16,flexShrink:0,transition:"transform .2s",
          transform:open?"rotate(45deg)":"none"}}>+</span>
      </div>
      {open && (
        <div style={{padding:"0 18px 16px",borderTop:"1px solid rgba(255,255,255,0.08)"}}>
          <div style={{fontSize:12,color:T.t2,lineHeight:1.7,paddingTop:12}}>{a}</div>
        </div>
      )}
    </div>
  );
}

/* ── COLOR PICKER TOOL ─────────────────────────────────────────────────────── */
function ColorPickerTool(){
  const [hex,setHex]=useState("#7FA6F0");
  const presets=["#7FA6F0","#8FA8DE","#C4667A","#7FA6F0","#5A78C8","#C98F5E","#7FA6F0","#D2687A","#5A78C8","#9FB6DC"];
  return(
    <div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
        {presets.map(c=>(
          <div key={c} onClick={()=>setHex(c)}
            style={{width:28,height:28,borderRadius:8,background:c,cursor:"pointer",
              border:`2px solid ${hex===c?"#fff":"transparent"}`,transition:"border .15s"}}/>
        ))}
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <input type="color" value={hex} onChange={e=>setHex(e.target.value)}
          style={{width:44,height:36,borderRadius:8,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",
            background:"transparent",cursor:"pointer",padding:2}}/>
        <div style={{flex:1,background:"rgba(255,255,255,0.07)",border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",
          borderRadius:10,padding:"8px 12px",fontSize:13,fontWeight:700,color:hex,
          fontFamily:"'Manrope', ui-sans-serif, system-ui, sans-serif",letterSpacing:1}}>{hex}</div>
        <button onClick={()=>{navigator.clipboard?.writeText(hex).catch(()=>{});}}
          style={{background:`${hex}20`,border:`1px solid ${hex}40`,borderRadius:10,
            padding:"8px 12px",color:hex,fontSize:11,fontWeight:700,cursor:"pointer"}}>Copy</button>
      </div>
      <div style={{marginTop:10,padding:"10px 14px",background:`${hex}15`,
        borderRadius:10,fontSize:12,fontWeight:700,color:hex,textAlign:"center"}}>
        Preview: This is how {hex} looks as text
      </div>
    </div>
  );
}

/* ── IMAGE TESTER TOOL ─────────────────────────────────────────────────────── */
function ImgTester({onPreview}){
  const [url,setUrl]=useState("");
  const [status,setStatus]=useState(null);
  const test=()=>{
    if(!url.trim()){setStatus("error");return;}
    setStatus("loading");
  };
  return(
    <div>
      <div style={{display:"flex",gap:8,marginBottom:10}}>
        <input value={url} onChange={e=>{setUrl(e.target.value);setStatus(null);}}
          placeholder="Paste image URL here..."
          style={{flex:1,background:"rgba(255,255,255,0.07)",border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",
            borderRadius:10,padding:"8px 12px",color:T.t1,fontSize:11,outline:"none"}}/>
        <Btn small color={T.purple} onClick={test}>Test</Btn>
      </div>
      {url && (
        <div style={{borderRadius:12,overflow:"hidden",position:"relative",height:100,
          cursor:"pointer"}} onClick={()=>onPreview(url)}>
          <img src={url} alt="test" style={{width:"100%",height:"100%",objectFit:"cover"}}
            onLoad={()=>setStatus("ok")} onError={()=>setStatus("error")}/>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(16,18,22,.8),transparent)",
            display:"flex",alignItems:"flex-end",padding:"8px 10px"}}>
            {status==="ok"   && <span style={{fontSize:10,color:T.green,fontWeight:700}}>✅ Image loads correctly — click to preview</span>}
            {status==="error"&& <span style={{fontSize:10,color:T.pink, fontWeight:700}}>❌ Image failed to load — check the URL</span>}
            {!status         && <span style={{fontSize:10,color:T.t3}}>Click Test to check this image</span>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── BACKUP TOOL ───────────────────────────────────────────────────────────── */
function BackupTool({content,setContent,showToast}){
  const [restoreText,setRestoreText]=useState("");
  const doRestore=()=>{
    try{
      const parsed=JSON.parse(restoreText);
      setContent({...DEFAULT_CONTENT,...parsed});
      saveContent({...DEFAULT_CONTENT,...parsed});
      setRestoreText("");
      showToast("✓ Content restored from backup!",T.green);
    }catch(e){
      showToast("❌ Invalid JSON — check your backup file",T.pink);
    }
  };
  return(
    <div>
      <div style={{fontSize:11,color:T.t2,marginBottom:8}}>Paste your exported JSON here to restore:</div>
      <textarea value={restoreText} onChange={e=>setRestoreText(e.target.value)}
        placeholder='Paste JSON here e.g. {"brand":{"name":"PodChat"...}'
        style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",
          borderRadius:10,padding:"8px 12px",color:T.t1,fontSize:11,outline:"none",
          resize:"vertical",minHeight:60,fontFamily:"'Manrope', ui-sans-serif, system-ui, sans-serif",boxSizing:"border-box"}}/>
      <div style={{display:"flex",gap:8,marginTop:8}}>
        <Btn small color={T.green} filled onClick={doRestore}>✓ Restore</Btn>
        <Btn small color={T.t2} onClick={()=>setRestoreText("")}>Clear</Btn>
      </div>
    </div>
  );
}

/* ── BRAND PREVIEW TOOL ────────────────────────────────────────────────────── */
function BrandPreviewTool({brand}){
  const acc=brand.accentColor||T.cyan;
  return(
    <div>
      <div style={{background:"rgba(16,18,22,.8)",borderRadius:14,padding:16,
        border:`1px solid ${acc}30`}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          {brand.logoUrl
            ?<img src={brand.logoUrl} alt="logo" style={{width:36,height:36,borderRadius:10,objectFit:"cover"}} onError={e=>e.target.style.display="none"}/>
            :<div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${acc},${T.purple})`,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:900,color:"#000"}}>
              {(brand.name||"P")[0]}
            </div>
          }
          <div>
            <div style={{fontSize:16,fontWeight:900,color:T.t1,background:`linear-gradient(90deg,${acc},${T.purple})`,
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{brand.name||"PodChat"}</div>
            <div style={{fontSize:10,color:T.t2}}>{brand.tagline||"Your tagline here"}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <div style={{flex:1,padding:"8px 12px",background:`linear-gradient(135deg,${acc},${acc}bb)`,
            borderRadius:8,fontSize:11,fontWeight:700,color:"#000",textAlign:"center"}}>Primary Button</div>
          <div style={{flex:1,padding:"8px 12px",border:`1px solid ${acc}60`,
            borderRadius:8,fontSize:11,fontWeight:700,color:acc,textAlign:"center"}}>Secondary</div>
        </div>
      </div>
    </div>
  );
}

/* ── LAUNCH CHECKLIST ──────────────────────────────────────────────────────── */
function LaunchChecklist({content}){
  const [checked,setChecked]=useState({});
  const items=[
    {id:"name",   label:"Platform name changed from 'PodChat'",   auto: content.brand.name!=="PodChat"},
    {id:"logo",   label:"Real logo uploaded",                      auto: !!content.brand.logoUrl},
    {id:"hero",   label:"All 4 hero slides have real content",     auto: content.highlights.length>=4},
    {id:"shows",  label:"At least 3 real podcast shows added",     auto: content.shows.length>=3},
    {id:"comedy", label:"At least 3 comedy channels added",        auto: content.comedy.length>=3},
    {id:"export", label:"Content exported as JSON backup",         auto: false},
    {id:"deploy", label:"Deployed to Vercel or CodeSandbox",       auto: false},
    {id:"domain", label:"Custom domain connected",                 auto: false},
  ];
  const done=items.filter(i=>i.auto||checked[i.id]).length;
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <span style={{fontSize:11,color:T.t2}}>{done}/{items.length} complete</span>
        <div style={{flex:1,margin:"0 12px"}}>
          <Meter value={(done/items.length)*100} tone={T.green} segments={items.length} height={12}/>
        </div>
        <span style={{fontSize:11,color:T.green,fontWeight:700}}>{Math.round((done/items.length)*100)}%</span>
      </div>
      {items.map(item=>{
        const complete=item.auto||checked[item.id];
        return(
          <div key={item.id} onClick={()=>!item.auto&&setChecked(c=>({...c,[item.id]:!c[item.id]}))}
            style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",
              borderBottom:"1px solid rgba(255,255,255,0.08)",cursor:item.auto?"default":"pointer"}}>
            <div style={{width:18,height:18,borderRadius:5,background:complete?T.green:"transparent",
              border:`2px solid ${complete?T.green:T.t3}`,display:"flex",alignItems:"center",
              justifyContent:"center",flexShrink:0,transition:"all .2s"}}>
              {complete&&<span style={{fontSize:10,color:"#000",fontWeight:900}}>✓</span>}
            </div>
            <span style={{fontSize:11,color:complete?T.t1:T.t2,
              textDecoration:complete?"line-through":"none"}}>{item.label}</span>
            {item.auto&&<span style={{fontSize:9,color:T.green,marginLeft:"auto"}}>AUTO</span>}
          </div>
        );
      })}
    </div>
  );
}

/* ── ENHANCED CMS BRAND ────────────────────────────────────────────────────── */
function CMSBrand({brand,onChange,onPreview}){
  const set=(k,v)=>onChange({...brand,[k]:v});
  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
      <div style={{background:T.panel,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:18,padding:22,backdropFilter:"blur(24px) saturate(180%)"}}>
        <div style={{fontSize:13,fontWeight:700,color:T.t1,marginBottom:16}}>Brand Settings</div>
        <Field label="Platform Name" value={brand.name} onChange={v=>set("name",v)}/>
        <Field label="Tagline" value={brand.tagline} onChange={v=>set("tagline",v)}/>
        <Field label="Logo URL" value={brand.logoUrl} onChange={v=>set("logoUrl",v)}/>
        <Field label="Accent Color (hex)" value={brand.accentColor} onChange={v=>set("accentColor",v)}/>
        <div style={{padding:"10px 14px",background:`${brand.accentColor||T.cyan}18`,
          border:`1px solid ${brand.accentColor||T.cyan}40`,borderRadius:10,
          fontSize:12,color:brand.accentColor||T.cyan,fontWeight:700,marginTop:4}}>
          Preview: {brand.name} — {brand.tagline}
        </div>
      </div>
      <div>
        <div style={{background:T.panel,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:18,padding:22,
          backdropFilter:"blur(24px) saturate(180%)",marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:700,color:T.t1,marginBottom:12}}>Logo Preview</div>
          {brand.logoUrl?(
            <div style={{position:"relative",borderRadius:12,overflow:"hidden",height:120,
              marginBottom:12,cursor:"pointer"}} onClick={()=>onPreview(brand.logoUrl)}>
              <img src={brand.logoUrl} alt="logo" style={{width:"100%",height:"100%",objectFit:"contain",background:"rgba(255,255,255,0.07)"}}
                onError={e=>e.target.style.display="none"}/>
              <div style={{position:"absolute",bottom:6,right:8,fontSize:9,color:T.t3}}>Click to enlarge</div>
            </div>
          ):(
            <div style={{width:"100%",height:120,background:T.glass,border:`2px dashed ${T.border}`,
              borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",
              marginBottom:12,fontSize:11,color:T.t3,flexDirection:"column",gap:6}}>
              <span style={{fontSize:24}}>🖼</span>
              <span>Paste a logo URL above to preview</span>
            </div>
          )}
          <div style={{fontSize:11,color:T.t3,lineHeight:1.7}}>
            <b style={{color:T.t2}}>Tip:</b> Upload to{" "}
            <a href="https://cloudinary.com" target="_blank" style={{color:T.cyan}}>cloudinary.com</a>
            {" "}(free), copy URL, paste above. Best size: 200×200px PNG with transparent background.
          </div>
        </div>
        <BrandPreviewTool brand={brand}/>
      </div>
    </div>
  );
}

/* ── ENHANCED CMS LIST ─────────────────────────────────────────────────────── */
function CMSList({items,fields,blank,onChange,onConfirm,onPreview}){
  const [editing,setEditing]=useState(null);
  const [draft,setDraft]=useState(null);
  const [adding,setAdding]=useState(false);
  const [addDraft,setAddDraft]=useState({});
  const [search,setSearch]=useState("");

  const openAdd=()=>{ setAddDraft({...blank,id:`${Date.now()}`}); setAdding(true); };
  const saveEdit=()=>{ onChange(items.map(x=>x.id===editing?draft:x)); setEditing(null); setDraft(null); };
  const remove=(id)=>onConfirm({msg:"Remove this item? This cannot be undone.",onYes:()=>onChange(items.filter(x=>x.id!==id))});
  const addNew=()=>{ onChange([...items,{...addDraft,id:`${Date.now()}`}]); setAdding(false); };

  const filtered = search.trim()
    ? items.filter(i=>JSON.stringify(i).toLowerCase().includes(search.toLowerCase()))
    : items;

  return(
    <div>
      {/* Top toolbar */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:8,background:T.glass,
          border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:10,padding:"7px 12px",flex:1,maxWidth:280}}>
          <span style={{color:T.t3,fontSize:12}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search items..."
            style={{background:"transparent",border:"none",outline:"none",color:T.t1,fontSize:12,flex:1}}/>
          {search&&<span onClick={()=>setSearch("")} style={{color:T.t3,cursor:"pointer",fontSize:12}}>✕</span>}
        </div>
        <span style={{fontSize:12,color:T.t2}}>{filtered.length} of {items.length} items</span>
        <Btn color={T.green} filled small onClick={openAdd}>+ Add New</Btn>
      </div>

      {/* Add form */}
      {adding&&(
        <div style={{background:T.panel,border:`2px solid ${T.green}40`,borderRadius:18,
          padding:20,marginBottom:14,backdropFilter:"blur(24px) saturate(180%)"}}>
          <div style={{fontSize:13,fontWeight:700,color:T.green,marginBottom:12}}>+ New Item</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {fields.map(f=>(
              <div key={f.k} style={{gridColumn:f.m?"1 / -1":"auto"}}>
                <Field label={f.l} value={String(addDraft[f.k]||"")}
                  onChange={v=>setAddDraft(d=>({...d,[f.k]:v}))} multi={f.m}/>
                {f.k==="imgUrl"&&addDraft[f.k]&&(
                  <div style={{borderRadius:8,overflow:"hidden",height:60,marginTop:-8,marginBottom:8,cursor:"pointer"}}
                    onClick={()=>onPreview(addDraft[f.k])}>
                    <img src={addDraft[f.k]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <Btn color={T.green} filled onClick={addNew}>✓ Add Item</Btn>
            <Btn onClick={()=>setAdding(false)} style={{color:T.t2}}>Cancel</Btn>
          </div>
        </div>
      )}

      {/* Items list */}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {filtered.length===0&&(
          <div style={{textAlign:"center",padding:32,color:T.t3,fontSize:13}}>
            {search?"No items match your search.":"No items yet. Click + Add New to start."}
          </div>
        )}
        {filtered.map((item,idx)=>(
          <div key={item.id} style={{background:T.panel,
            border:`1px solid ${editing===item.id?T.cyan:T.border}`,
            borderRadius:14,overflow:"hidden",backdropFilter:"blur(24px) saturate(180%)"}}>
            {editing===item.id?(
              <div style={{padding:18}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                  {fields.map(f=>(
                    <div key={f.k} style={{gridColumn:f.m?"1 / -1":"auto"}}>
                      <Field label={f.l} value={String(draft[f.k]||"")}
                        onChange={v=>setDraft(d=>({...d,[f.k]:v}))} multi={f.m}/>
                      {f.k==="imgUrl"&&draft[f.k]&&(
                        <div style={{borderRadius:8,overflow:"hidden",height:70,marginTop:-8,marginBottom:8,
                          cursor:"pointer",position:"relative"}} onClick={()=>onPreview(draft[f.k])}>
                          <img src={draft[f.k]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                          <div style={{position:"absolute",bottom:4,right:6,fontSize:9,color:"rgba(255,255,255,.7)"}}>Click to preview full size</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",gap:8}}>
                  <Btn color={T.cyan} filled small onClick={saveEdit}>✓ Save Changes</Btn>
                  <Btn small onClick={()=>{setEditing(null);setDraft(null);}} style={{color:T.t2}}>Cancel</Btn>
                </div>
              </div>
            ):(
              <div style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px"}}>
                <div style={{width:14,height:14,borderRadius:3,background:T.border,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:9,color:T.t3,flexShrink:0}}>{idx+1}</div>
                {(item.imgUrl||item.img)&&(
                  <div style={{width:48,height:48,borderRadius:9,overflow:"hidden",
                    flexShrink:0,cursor:"pointer",position:"relative"}}
                    onClick={()=>onPreview(item.imgUrl||item.img)}>
                    <ImgFallback src={item.imgUrl||item.img} alt="" fallback={item.color||T.purple}/>
                    <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0)",
                      transition:"background .2s"}}
                      onMouseEnter={e=>e.currentTarget.style.background="rgba(0,0,0,.4)"}
                      onMouseLeave={e=>e.currentTarget.style.background="rgba(0,0,0,0)"}>
                      <span style={{position:"absolute",top:"50%",left:"50%",
                        transform:"translate(-50%,-50%)",fontSize:12,opacity:0}}>🔍</span>
                    </div>
                  </div>
                )}
                {item.color&&(
                  <div style={{width:12,height:12,borderRadius:"50%",
                    background:item.color,flexShrink:0}}/>
                )}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:700,color:T.t1}}>
                    {item.title||item.name||item.guest||"(no title)"}
                  </div>
                  <div style={{fontSize:10,color:T.t3,marginTop:1,
                    overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {item.host||item.specialty||item.platform||item.earn||item.topic||""}
                  </div>
                </div>
                <div style={{display:"flex",gap:6,flexShrink:0}}>
                  <Btn small onClick={()=>{setEditing(item.id);setDraft({...item});}}>✎ Edit</Btn>
                  <Btn small onClick={()=>remove(item.id)}
                    style={{background:"transparent",border:`1px solid ${T.pink}40`,color:T.pink}}>✕</Btn>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// X-FACTOR 1 — AI TRANSLATION HUB
// ═══════════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════════
// X-FACTOR — AI STUDIO (Clip Studio · Show Notes & Titles) — powered by Lovable AI
// ═══════════════════════════════════════════════════════════════════════════════
const copyText=(t)=>{ try{ navigator.clipboard?.writeText(t).catch(()=>{}); }catch(e){} };

const DUB_VOICES=[
  {id:"amara",name:"Amara",desc:"Warm · Cinematic",icon:"🎧"},
  {id:"dax",name:"Dax",desc:"Energetic · Promo",icon:"⚡"},
  {id:"sable",name:"Sable",desc:"Calm · Narrator",icon:"🌙"},
];

function StudioPanel({children,style={}}){
  return(
    <div style={{background:T.panel,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:20,padding:22,backdropFilter:"blur(24px) saturate(180%)",...style}}>
      {children}
    </div>
  );
}

function AIStudioScreen({shows=[]}){
  const [tab,setTab]=useState("clips");
  const [showId,setShowId]=useState(shows[0]?.id||"");
  const [topic,setTopic]=useState("");
  const [busy,setBusy]=useState(false);
  const [progress,setProgress]=useState(0);
  const [status,setStatus]=useState("");
  const [error,setError]=useState("");
  const [clips,setClips]=useState([]);
  const [notes,setNotes]=useState(null);

  const show=shows.find(s=>s.id===showId)||shows[0];

  useEffect(()=>{
    if(!busy) return;
    setProgress(6);
    const iv=setInterval(()=>setProgress(p=>p>=92?(clearInterval(iv),92):p+1.6),120);
    return()=>clearInterval(iv);
  },[busy]);

  const run=async()=>{
    if(busy||!show) return;
    setBusy(true); setError(""); setClips([]); setNotes(null);
    try{
      if(tab==="clips"){
        setStatus("Listening to the episode…");
        const r=await generateClips({data:{showTitle:show.title||"PodChat",showDescription:show.description||"",episodeTopic:topic||show.description||"the latest episode"}});
        setClips(Array.isArray(r?.clips)?r.clips:[]);
      }else{
        setStatus("Writing your publishing kit…");
        const r=await generateShowNotes({data:{showTitle:show.title||"PodChat",showDescription:show.description||"",episodeTopic:topic||show.description||"the latest episode",durationMin:45}});
        setNotes(r||null);
      }
      setProgress(100);
    }catch(e){
      setError(e?.message||"The AI could not be reached. Please try again.");
    }finally{
      setBusy(false); setStatus("");
    }
  };

  const sectionLabel={fontSize:11,fontWeight:800,color:T.t2,letterSpacing:1.4,textTransform:"uppercase",marginBottom:8};

  return(
    <div>
      {/* Hero */}
      <StudioPanel style={{display:"flex",alignItems:"center",gap:20,marginBottom:20,background:`linear-gradient(135deg,${T.cyan}14,${T.panel})`}}>
        <div style={{width:52,height:52,borderRadius:14,background:`linear-gradient(135deg,${T.cyan}30,${T.green}30)`,border:`1px solid ${T.borderGlow}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>✦</div>
        <div style={{flex:1}}>
          <div style={{fontSize:20,fontWeight:900,color:T.t1,letterSpacing:-0.5}}>AI Studio</div>
          <div style={{fontSize:12,color:T.t2,marginTop:4}}>Describe an episode — the AI produces scroll-stopping clips, titles, chapters and social posts in seconds.</div>
        </div>
        <Chip label="AI Studio" color={T.cyan}/>
      </StudioPanel>

      {/* Source picker */}
      <StudioPanel style={{marginBottom:20}}>
        <div style={sectionLabel}>Choose a show</div>
        <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:6}}>
          {shows.map(s=>{
            const sel=show?.id===s.id;
            return(
              <div key={s.id} onClick={()=>setShowId(s.id)} style={{minWidth:150,flexShrink:0,cursor:"pointer",borderRadius:14,overflow:"hidden",border:`1px solid ${sel?T.cyan+"88":T.border}`,opacity:sel?1:.72,transition:"all .2s"}}>
                <ImgFallback src={s.imgUrl} alt={s.title} style={{width:"100%",height:64,objectFit:"cover"}} fallback={s.color||T.cyan}/>
                <div style={{padding:"8px 10px",background:sel?`${T.cyan}14`:"rgba(255,255,255,.03)"}}>
                  <div style={{fontSize:11,fontWeight:800,color:T.t1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.title}</div>
                  <div style={{fontSize:9,color:T.t3,fontVariantNumeric:"tabular-nums"}}>{s.episodes} episodes</div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{...sectionLabel,marginTop:16}}>Episode topic — optional</div>
        <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g. Why everyone is rethinking city living"
          style={{width:"100%",background:"rgba(255,255,255,.05)",border:"1px solid rgba(175,200,240,0.16)",borderRadius:11,padding:"11px 14px",color:T.t1,fontSize:13,outline:"none",fontFamily:"inherit"}}/>
        <div style={{display:"flex",alignItems:"center",gap:12,marginTop:16}}>
          {[["clips","Clip Studio"],["notes","Show Notes & Titles"]].map(([id,label])=>(
            <div key={id} onClick={()=>!busy&&setTab(id)} style={{padding:"9px 18px",borderRadius:11,cursor:busy?"default":"pointer",fontSize:12,fontWeight:800,color:tab===id?T.t1:T.t2,background:tab===id?`${T.cyan}1E`:"transparent",border:`1px solid ${tab===id?T.cyan+"55":"transparent"}`}}>
              {label}
            </div>
          ))}
          <div style={{flex:1}}/>
          <Btn color={T.cyan} filled onClick={run} style={{opacity:busy?.6:1}}>
            {busy?(status||"Generating…"):(tab==="clips"?"✦ Generate Clips":"✦ Generate Publishing Kit")}
          </Btn>
        </div>
        {busy&&<div style={{marginTop:14}}><Meter value={progress} tone={T.cyan} segments={40} height={12}/></div>}
        {error&&<div style={{marginTop:14,background:`${T.pink}12`,border:`1px solid ${T.pink}45`,borderRadius:11,padding:"10px 14px",fontSize:12,color:T.t1}}>{error}</div>}
      </StudioPanel>

      {/* Results */}
      {tab==="clips"?(clips.length?(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:16}}>
          {clips.map((c,i)=>(
            <StudioPanel key={i} style={{padding:18,display:"flex",flexDirection:"column",gap:10}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <Chip label={`Virality ${c.virality}`} color={c.virality>=85?T.gold:T.cyan}/>
                <span style={{fontSize:11,color:T.t2,fontWeight:700,fontVariantNumeric:"tabular-nums"}}>{c.start} – {c.end}</span>
              </div>
              <div style={{fontSize:14,fontWeight:800,color:T.t1,lineHeight:1.35}}>{c.title}</div>
              <div style={{fontSize:12,color:T.t2,fontStyle:"italic",lineHeight:1.5}}>&ldquo;{c.hook}&rdquo;</div>
              <Meter value={c.virality} tone={T.gold} segments={22} height={8}/>
              <div style={{fontSize:11,color:T.t2,lineHeight:1.5}}>{c.caption}</div>
              <button onClick={()=>copyText(`${c.title}\n\n"${c.hook}"\n${c.caption}`)} style={{alignSelf:"flex-start",background:T.glass,border:`1px solid ${T.border}`,borderRadius:9,padding:"6px 12px",fontSize:11,fontWeight:700,color:T.t2,cursor:"pointer",fontFamily:"inherit"}}>Copy caption</button>
            </StudioPanel>
          ))}
          <div style={{gridColumn:"1/-1",fontSize:10,color:T.t3}}>Generated by PodChat AI — always review before publishing.</div>
        </div>
      ):(
        <StudioPanel>
          <div style={{textAlign:"center",padding:"26px 10px",color:T.t3,fontSize:12,lineHeight:1.7}}>
            {busy?"Producing your clips…":"Pick a show, optionally add an episode topic, then hit Generate Clips — six social-ready moments with hooks, timestamps and virality scores."}
          </div>
        </StudioPanel>
      )):(notes?(
        <div style={{display:"grid",gridTemplateColumns:"1fr 360px",gap:16,alignItems:"start"}}>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <StudioPanel style={{padding:18}}>
              <div style={sectionLabel}>Title options — click to copy</div>
              {notes.titles?.map((t,i)=>(
                <div key={i} onClick={()=>copyText(t)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 4px",borderBottom:"1px solid rgba(255,255,255,0.07)",cursor:"pointer"}}>
                  <span style={{fontSize:11,fontWeight:800,color:T.cyan,width:16,fontVariantNumeric:"tabular-nums",flexShrink:0}}>{i+1}</span>
                  <span style={{flex:1,fontSize:13,fontWeight:700,color:T.t1}}>{t}</span>
                  <span style={{fontSize:10,color:T.t3}}>copy</span>
                </div>
              ))}
            </StudioPanel>
            <StudioPanel style={{padding:18}}>
              <div style={sectionLabel}>Episode description</div>
              <div style={{fontSize:13,color:T.t2,lineHeight:1.7}}>{notes.summary}</div>
            </StudioPanel>
            <StudioPanel style={{padding:18}}>
              <div style={sectionLabel}>Social posts</div>
              {notes.socialPosts?.map((p,i)=>(
                <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",background:"rgba(255,255,255,.04)",border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 14px",marginBottom:10}}>
                  <div style={{flex:1,fontSize:12,color:T.t2,lineHeight:1.6}}>{p}</div>
                  <button onClick={()=>copyText(p)} style={{background:"transparent",border:`1px solid ${T.border}`,borderRadius:8,padding:"4px 10px",fontSize:10,fontWeight:700,color:T.t2,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>Copy</button>
                </div>
              ))}
              {notes.hashtags&&<div style={{fontSize:11,color:T.cyan,fontWeight:700}}>{notes.hashtags}</div>}
            </StudioPanel>
          </div>
          <StudioPanel style={{padding:18}}>
            <div style={sectionLabel}>Chapters</div>
            {notes.chapters?.map((ch,i)=>(
              <div key={i} style={{display:"flex",gap:10,padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
                <span style={{fontSize:11,fontWeight:800,color:T.gold,fontVariantNumeric:"tabular-nums",width:46,flexShrink:0}}>{ch.time}</span>
                <span style={{fontSize:12,color:T.t2}}>{ch.title}</span>
              </div>
            ))}
            <div style={{marginTop:12,fontSize:10,color:T.t3}}>Generated by PodChat AI — review before publishing.</div>
          </StudioPanel>
        </div>
      ):(
        <StudioPanel>
          <div style={{textAlign:"center",padding:"26px 10px",color:T.t3,fontSize:12,lineHeight:1.7}}>
            {busy?"Writing your publishing kit…":"Hit Generate Publishing Kit for 5 title options, a description, chapter markers and ready-to-post social copy."}
          </div>
        </StudioPanel>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// X-FACTOR 2 — VOICE DUBBING STUDIO
// ═══════════════════════════════════════════════════════════════════════════════
function TranslationScreen(){
  const [selLang,setSelLang]=useState("es");
  const [selVoice,setSelVoice]=useState("amara");
  const [dubbing,setDubbing]=useState(false);
  const [progress,setProgress]=useState(0);
  const [dubbed,setDubbed]=useState([]);
  const voice=DUB_VOICES.find(v=>v.id===selVoice)||DUB_VOICES[0];

  const LANGS=[
    {code:"es",name:"Spanish",     flag:"🇪🇸",speakers:"500M", status:"ready"},
    {code:"fr",name:"French",      flag:"🇫🇷",speakers:"280M", status:"ready"},
    {code:"hi",name:"Hindi",       flag:"🇮🇳",speakers:"600M", status:"ready"},
    {code:"pt",name:"Portuguese",  flag:"🇧🇷",speakers:"260M", status:"ready"},
    {code:"ar",name:"Arabic",      flag:"🇸🇦",speakers:"420M", status:"ready"},
    {code:"zh",name:"Mandarin",    flag:"🇨🇳",speakers:"1.1B", status:"ready"},
    {code:"sw",name:"Swahili",     flag:"🇰🇪",speakers:"200M", status:"ready"},
    {code:"yo",name:"Yoruba",      flag:"🇳🇬",speakers:"50M",  status:"ready"},
    {code:"de",name:"German",      flag:"🇩🇪",speakers:"130M", status:"ready"},
    {code:"ja",name:"Japanese",    flag:"🇯🇵",speakers:"125M", status:"ready"},
    {code:"ko",name:"Korean",      flag:"🇰🇷",speakers:"80M",  status:"ready"},
    {code:"ru",name:"Russian",     flag:"🇷🇺",speakers:"260M", status:"ready"},
  ];

  const startDub=()=>{
    setDubbing(true); setProgress(0);
    const iv=setInterval(()=>{
      setProgress(p=>{
        if(p>=100){
          clearInterval(iv);
          setDubbing(false);
          setDubbed(d=>[...d,selLang]);
          return 100;
        }
        return p+2;
      });
    },60);
  };

  const totalReach=LANGS.reduce((a,l)=>a+(dubbed.includes(l.code)?parseInt(l.speakers):0),0);

  return(
    <div>
      {/* Hero */}
      <div style={{borderRadius:22,overflow:"hidden",height:220,position:"relative",marginBottom:24}}>
        <ImgFallback src={IMG_LIVE_CROWD} alt="translation" style={{filter:"brightness(.4)"}} fallback={T.cyan}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(127,166,240,.35),rgba(11,17,27,.72))"}}/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"24px 28px"}}>
          <div style={{fontSize:11,color:T.cyan,fontWeight:700,letterSpacing:3,marginBottom:8}}>🌍 AI TRANSLATION & DUBBING</div>
          <div style={{fontSize:28,fontWeight:900,color:T.t1,letterSpacing:-1}}>Your Voice. Every Language.</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,.65)",marginTop:6}}>
            AI clones your voice and dubs your content into 50+ languages automatically. Reach billions, not millions.
          </div>
        </div>
        {totalReach>0&&(
          <div style={{position:"absolute",top:16,right:20,background:"rgba(13,15,19,0.75)",backdropFilter:"blur(24px) saturate(180%)",borderRadius:14,
            padding:"10px 16px",backdropFilter:"blur(18px) saturate(150%)",textAlign:"center"}}>
            <div style={{fontSize:22,fontWeight:900,color:T.cyan}}>{(totalReach/1000000).toFixed(0)}M+</div>
            <div style={{fontSize:10,color:T.t2}}>NEW POTENTIAL LISTENERS</div>
          </div>
        )}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:20}}>
        <div>
          {/* Language grid */}
          <div style={{background:T.panel,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:20,padding:22,
            backdropFilter:"blur(24px) saturate(180%)",marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:700,color:T.t1,marginBottom:16}}>Select Language to Dub</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
              {LANGS.map(l=>{
                const isDone=dubbed.includes(l.code);
                const isSel=selLang===l.code;
                return(
                  <div key={l.code} onClick={()=>!isDone&&setSelLang(l.code)}
                    style={{background:isDone?`${T.green}12`:isSel?`${T.cyan}12`:"rgba(255,255,255,.03)",
                      border:`1px solid ${isDone?T.green:isSel?T.cyan:T.border}`,
                      borderRadius:12,padding:"12px 8px",textAlign:"center",
                      cursor:isDone?"default":"pointer",transition:"all .2s",
                      opacity:isDone?.9:1}}>
                    <div style={{fontSize:24,marginBottom:4}}>{l.flag}</div>
                    <div style={{fontSize:11,fontWeight:700,color:isDone?T.green:isSel?T.cyan:T.t1}}>{l.name}</div>
                    <div style={{fontSize:9,color:T.t3,marginTop:2}}>{l.speakers}</div>
                    {isDone&&<div style={{fontSize:9,color:T.green,marginTop:4,fontWeight:700}}>✓ DUBBED</div>}
                  </div>
                );
              })}
            </div>

            {/* Progress */}
            {dubbing&&(
              <div style={{marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:12,color:T.cyan,fontWeight:700}}>
                    🤖 AI Voice Cloning & Dubbing...
                  </span>
                  <span style={{fontSize:12,color:T.cyan,fontWeight:700}}>{progress}%</span>
                </div>
                <Meter value={progress} tone={T.cyan} segments={40} height={16}/>
                <div style={{fontSize:11,color:T.t2,marginTop:6}}>
                  {progress<30&&`Analysing voice patterns for ${voice.name}...`}
                  {progress>=30&&progress<60&&`Cloning ${voice.name}'s voice characteristics...`}
                  {progress>=60&&progress<90&&"Generating dubbed audio..."}
                  {progress>=90&&"Finalising and syncing..."}
                </div>
              </div>
            )}

            {/* AI voice persona picker */}
            <div style={{marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:700,color:T.t1,marginBottom:10}}>AI Voice Persona</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                {DUB_VOICES.map(v=>{
                  const sel=selVoice===v.id;
                  return(
                    <div key={v.id} onClick={()=>setSelVoice(v.id)}
                      style={{background:sel?`${T.cyan}12`:"rgba(255,255,255,.03)",
                        border:`1px solid ${sel?T.cyan:T.border}`,
                        borderRadius:12,padding:"12px 10px",textAlign:"center",
                        cursor:"pointer",transition:"all .2s"}}>
                      <div style={{fontSize:20,marginBottom:4}}>{v.icon}</div>
                      <div style={{fontSize:12,fontWeight:800,color:sel?T.cyan:T.t1}}>{v.name}</div>
                      <div style={{fontSize:9,color:T.t3,marginTop:2}}>{v.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{display:"flex",gap:12}}>
              <Btn color={T.cyan} filled onClick={startDub} style={{flex:1,opacity:dubbing?.6:1}}>
                {dubbing?`Dubbing... ${progress}%`:`🎙 Dub into ${LANGS.find(l=>l.code===selLang)?.name} · Voice: ${voice.name}`}
              </Btn>
              <Btn color={T.purple} onClick={()=>{LANGS.forEach(l=>setDubbed(d=>[...new Set([...d,l.code])]));}} style={{fontSize:11}}>
                Dub All 12 Languages
              </Btn>
            </div>
          </div>

          {/* How it works */}
          <div style={{background:T.panel,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:20,padding:22,backdropFilter:"blur(24px) saturate(180%)"}}>
            <div style={{fontSize:13,fontWeight:700,color:T.t1,marginBottom:14}}>How AI Dubbing Works</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
              {[
                {step:"1",title:"Voice Analysis",desc:"AI analyses your vocal patterns, tone and rhythm",icon:"🎙",color:T.cyan},
                {step:"2",title:"Voice Clone",desc:"Creates a digital clone that sounds exactly like you",icon:"🤖",color:T.purple},
                {step:"3",title:"Translation",desc:"Translates your script preserving jokes and context",icon:"📝",color:T.gold},
                {step:"4",title:"Lip Sync Dub",desc:"Outputs dubbed audio synced to your original video",icon:"✅",color:T.green},
              ].map(s=>(
                <div key={s.step} style={{background:`${s.color}0A`,border:`1px solid ${s.color}25`,
                  borderRadius:14,padding:"16px 12px",textAlign:"center"}}>
                  <div style={{fontSize:28,marginBottom:8}}>{s.icon}</div>
                  <div style={{fontSize:12,fontWeight:700,color:s.color,marginBottom:4}}>Step {s.step}</div>
                  <div style={{fontSize:12,fontWeight:700,color:T.t1,marginBottom:4}}>{s.title}</div>
                  <div style={{fontSize:11,color:T.t2,lineHeight:1.5}}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div>
          <div style={{background:T.panel,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:20,padding:22,
            backdropFilter:"blur(24px) saturate(180%)",marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:T.cyan,marginBottom:14}}>🌍 Your Global Reach</div>
            {LANGS.map(l=>(
              <div key={l.code} style={{display:"flex",alignItems:"center",gap:10,
                padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
                <span style={{fontSize:16}}>{l.flag}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:600,color:T.t1}}>{l.name}</div>
                  <div style={{fontSize:10,color:T.t3}}>{l.speakers} speakers</div>
                  <div style={{fontSize:10,color:T.gold,marginTop:1,fontWeight:700,fontVariantNumeric:"tabular-nums"}}>
                    ~${Math.max(1,Math.round(parseInt(l.speakers)/1000000*140)).toLocaleString()}/mo ad potential
                  </div>
                </div>
                {dubbed.includes(l.code)
                  ?<Chip label="✓ Live" color={T.green}/>
                  :<Chip label="Not yet" color={T.t3}/>}
              </div>
            ))}
          </div>
          <div style={{background:`${T.gold}0A`,border:`1px solid ${T.gold}25`,borderRadius:18,padding:18}}>
            <div style={{fontSize:12,fontWeight:700,color:T.gold,marginBottom:8}}>💰 Revenue Impact</div>
            <div style={{fontSize:11,color:T.t2,lineHeight:1.7}}>
              Every new language = new ad market. Spanish dubbing alone adds a potential{" "}
              <span style={{color:T.gold,fontWeight:700}}>$2,000–$8,000/month</span> in additional ad revenue for a creator with 100K listeners.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// X-FACTOR 2 — LIVE HOT SEAT UPGRADE
// ═══════════════════════════════════════════════════════════════════════════════
function HotSeatScreen(){
  const [phase,setPhase]=useState("lobby");
  const [raised,setRaised]=useState(false);
  const [queue,setQueue]=useState([
    {id:1,name:"Amaka_T",country:"🇳🇬",wait:"2 min",msg:"I have a hot take on AI comedy!"},
    {id:2,name:"PodFan99",country:"🇺🇸",wait:"4 min",msg:"Want to debate the topic live"},
    {id:3,name:"ComedyKing",country:"🇬🇧",wait:"6 min",msg:"Heard about this from Twitter"},
  ]);
  const [votes,setVotes]=useState({yes:247,no:89});
  const [chatLog,setChatLog]=useState([
    {u:"Marcus_B",m:"Who's on the Hot Seat next? 👀",c:T.cyan},
    {u:"TechGuru",m:"This format is INCREDIBLE",c:T.purple},
    {u:"Amaka_T",m:"I raised my hand!! 🙌",c:T.pink},
  ]);
  const [msg,setMsg]=useState("");

  const raiseHand=()=>{
    setRaised(true);
    setQueue(q=>[...q,{id:Date.now(),name:"You",country:"🌍",wait:"8 min",msg:"Just raised my hand!",isYou:true}]);
    setChatLog(l=>[...l,{u:"System",m:"You joined the Hot Seat queue! Estimated wait: 8 min",c:T.green}]);
  };

  return(
    <div>
      <div style={{borderRadius:22,overflow:"hidden",height:200,position:"relative",marginBottom:22}}>
        <ImgFallback src={IMG_STUDIO_PODCAST} alt="hot seat" style={{filter:"brightness(.4)"}} fallback={T.pink}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(210,104,122,.35),rgba(11,17,27,.72))"}}/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"22px 28px"}}>
          <div style={{fontSize:11,color:T.pink,fontWeight:700,letterSpacing:3,marginBottom:8}}>🔴 LIVE HOT SEAT</div>
          <div style={{fontSize:26,fontWeight:900,color:T.t1}}>Join The Show — Live</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,.65)",marginTop:4}}>
            Raise your hand. Get pulled into the live show. Talk to the host in real time.
          </div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 320px",gap:16}}>
        {/* Live show */}
        <div style={{background:T.panel,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:20,padding:20,backdropFilter:"blur(24px) saturate(180%)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <Pill label="LIVE" color={T.pink} pulse/>
            <span style={{fontSize:11,color:T.t2}}>👁 12,847 watching</span>
          </div>
          <div style={{background:`${T.pink}0A`,border:`1px solid ${T.pink}20`,borderRadius:14,
            aspectRatio:"16/9",display:"flex",alignItems:"center",justifyContent:"center",
            marginBottom:12,position:"relative",overflow:"hidden"}}>
            <ImgFallback src={IMG_COMEDY_NIGHT} alt="live" style={{filter:"brightness(.5)"}} fallback={T.pink}/>
            <div style={{position:"absolute",inset:0,background:"rgba(16,18,22,.3)",display:"flex",
              alignItems:"center",justifyContent:"center"}}>
              <div style={{width:52,height:52,borderRadius:"50%",background:"rgba(255,255,255,0.14)",
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,
                backdropFilter:"blur(14px) saturate(140%)"}}>▶</div>
            </div>
          </div>
          <div style={{fontSize:14,fontWeight:700,color:T.t1,marginBottom:4}}>AI Comedy Takeover Live</div>
          <div style={{fontSize:11,color:T.t2,marginBottom:14}}>Marcus Bright × Dr. Amara Osei</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <Btn color={T.gold} filled small>◆ Send Tip</Btn>
            <Btn color={T.purple} small>✂ Clip This</Btn>
          </div>
        </div>

        {/* Hot Seat Queue */}
        <div style={{background:T.panel,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:20,padding:20,backdropFilter:"blur(24px) saturate(180%)"}}>
          <div style={{fontSize:13,fontWeight:700,color:T.t1,marginBottom:4}}>🎤 Hot Seat Queue</div>
          <div style={{fontSize:11,color:T.t2,marginBottom:16}}>{queue.length} people waiting to join</div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
            {queue.map((u,i)=>(
              <div key={u.id} style={{background:u.isYou?`${T.cyan}08`:"rgba(255,255,255,.02)",
                border:`1px solid ${u.isYou?T.cyan+"40":T.border}`,borderRadius:12,padding:"10px 12px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <div style={{width:28,height:28,borderRadius:"50%",
                    background:u.isYou?`linear-gradient(135deg,${T.cyan},${T.purple})`:"rgba(255,255,255,.1)",
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>
                    {u.isYou?"★":"👤"}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:u.isYou?T.cyan:T.t1}}>
                      {u.name} {u.country}
                    </div>
                    <div style={{fontSize:10,color:T.green,fontWeight:600}}>~{u.wait}</div>
                  </div>
                  <div style={{fontSize:9,background:`${T.pink}15`,border:`1px solid ${T.pink}30`,
                    borderRadius:20,padding:"2px 8px",color:T.pink,fontWeight:700}}>#{i+1}</div>
                </div>
                <div style={{fontSize:11,color:T.t2,fontStyle:"italic"}}>"{u.msg}"</div>
              </div>
            ))}
          </div>
          {!raised?(
            <Btn color={T.pink} filled onClick={raiseHand} style={{width:"100%",padding:"12px",fontSize:13}}>
              🙋 Raise My Hand — Join Queue
            </Btn>
          ):(
            <div style={{background:`${T.green}10`,border:`1px solid ${T.green}30`,
              borderRadius:12,padding:"12px",textAlign:"center"}}>
              <div style={{fontSize:13,fontWeight:700,color:T.green,marginBottom:4}}>✓ You're in the queue!</div>
              <div style={{fontSize:11,color:T.t2}}>We'll notify you when it's your turn. Stay on this page.</div>
            </div>
          )}
        </div>

        {/* Live reactions */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {/* Live vote */}
          <div style={{background:T.panel,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:18,padding:18,backdropFilter:"blur(24px) saturate(180%)"}}>
            <div style={{fontSize:12,fontWeight:700,color:T.t1,marginBottom:10}}>⚔️ Live Audience Vote</div>
            <div style={{fontSize:12,color:T.t2,marginBottom:12}}>Can AI replace human comedians?</div>
            <div style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:11,color:T.green,fontWeight:700}}>YES {Math.round(votes.yes/(votes.yes+votes.no)*100)}%</span>
                <span style={{fontSize:11,color:T.pink,fontWeight:700}}>NO {Math.round(votes.no/(votes.yes+votes.no)*100)}%</span>
              </div>
              <div style={{display:"flex",gap:2,alignItems:"flex-end",height:16}}>
                {Array.from({length:32},(_,i)=>{
                  const pct=Math.round(votes.yes/(votes.yes+votes.no)*100);
                  const yes=i<Math.round(pct/100*32);
                  return <div key={i} style={{flex:1,height:yes?16:11,borderRadius:1.5,
                    background:yes?T.green:T.pink,opacity:yes?0.85:0.55,transition:"all .35s"}}/>;
                })}
              </div>
              <div style={{fontSize:10,color:T.t3,marginTop:4,textAlign:"center"}}>{votes.yes+votes.no} votes cast</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <Btn small color={T.green} filled onClick={()=>setVotes(v=>({...v,yes:v.yes+1}))}>Yes ✓</Btn>
              <Btn small color={T.pink} filled onClick={()=>setVotes(v=>({...v,no:v.no+1}))}>No ✗</Btn>
            </div>
          </div>

          {/* Live chat */}
          <div style={{background:T.panel,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:18,
            padding:16,backdropFilter:"blur(24px) saturate(180%)",flex:1,display:"flex",flexDirection:"column"}}>
            <div style={{fontSize:12,fontWeight:700,color:T.t1,marginBottom:10}}>💬 Live Chat</div>
            <div style={{flex:1,display:"flex",flexDirection:"column",gap:6,marginBottom:10,
              overflowY:"auto",maxHeight:180}}>
              {chatLog.map((m,i)=>(
                <div key={i}>
                  <span style={{fontSize:11,fontWeight:700,color:m.c}}>{m.u} </span>
                  <span style={{fontSize:11,color:T.t2}}>{m.m}</span>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:6}}>
              <input value={msg} onChange={e=>setMsg(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&msg.trim()){setChatLog(l=>[...l,{u:"You",m:msg,c:T.green}]);setMsg("");}}}
                placeholder="Say something..."
                style={{flex:1,background:"rgba(255,255,255,0.07)",border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",
                  borderRadius:8,padding:"7px 10px",color:T.t1,fontSize:11,outline:"none"}}/>
              <button onClick={()=>{if(msg.trim()){setChatLog(l=>[...l,{u:"You",m:msg,c:T.green}]);setMsg("");}}}
                style={{background:"linear-gradient(135deg,#8FA8DE 0%,#5A78C8 100%)",boxShadow:"0 4px 20px rgba(90,120,200,0.30), inset 0 1px 0 rgba(255,255,255,0.20)",border:"none",
                  borderRadius:8,padding:"7px 12px",color:"#000",fontWeight:800,cursor:"pointer",fontSize:12}}>→</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// X-FACTOR 3 — CREATOR ANALYTICS DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function AnalyticsScreen(){
  const [period,setPeriod]=useState("30d");
  const [activeEp,setActiveEp]=useState(0);

  const episodes=[
    {title:"Ep 24: The AI Comedy Episode",plays:"84K",completion:74,sentiment:88,dropoff:42,revenue:"$840"},
    {title:"Ep 23: Late Night Unfiltered", plays:"112K",completion:81,sentiment:92,dropoff:38,revenue:"$1,120"},
    {title:"Ep 22: Money & Mindset",       plays:"67K", completion:69,sentiment:79,dropoff:51,revenue:"$670"},
  ];

  const ep=episodes[activeEp];

  const SentimentBar=({label,value,color})=>(
    <div style={{marginBottom:12}}>
      <Meter label={label} value={value} tone={color} segments={26} height={16} showValue/>
    </div>
  );

  return(
    <div>
      <div style={{borderRadius:22,overflow:"hidden",height:190,position:"relative",marginBottom:22}}>
        <ImgFallback src={IMG_STUDIO_BLUE} alt="analytics" style={{filter:"brightness(.4)"}} fallback={T.purple}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(90,120,200,.35),rgba(11,17,27,.72))"}}/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"22px 28px"}}>
          <div style={{fontSize:11,color:T.purple,fontWeight:700,letterSpacing:3,marginBottom:6}}>📊 CREATOR ANALYTICS</div>
          <div style={{fontSize:26,fontWeight:900,color:T.t1}}>Deep Audience Intelligence</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,.6)",marginTop:4}}>Know exactly what your audience loves — and when they leave</div>
        </div>
        {/* Period selector */}
        <div style={{position:"absolute",top:16,right:16,display:"flex",gap:6}}>
          {["7d","30d","90d","All"].map(p=>(
            <button key={p} onClick={()=>setPeriod(p)}
              style={{background:period===p?"rgba(127,166,240,.30)":"rgba(0,0,0,.5)",
                border:`1px solid ${period===p?T.purple:"transparent"}`,
                borderRadius:8,padding:"5px 10px",color:period===p?T.t1:T.t2,
                fontSize:11,fontWeight:700,cursor:"pointer"}}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Top stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:20}}>
        {[
          {label:"Total Plays",    val:"263K",  change:"+18%", color:T.cyan},
          {label:"Avg Completion", val:"74.7%", change:"+5%",  color:T.green},
          {label:"Superfans",      val:"1,240", change:"+34%", color:T.gold},
          {label:"Sentiment Score",val:"86/100",change:"+3",   color:T.purple},
          {label:"Revenue",        val:"$2,630",change:"+22%", color:T.green},
        ].map(s=>(
          <div key={s.label} style={{background:T.panel,border:`1px solid ${s.color}25`,
            borderRadius:16,padding:"16px 14px",backdropFilter:"blur(24px) saturate(180%)"}}>
            <div style={{fontSize:11,color:T.t2,marginBottom:4}}>{s.label}</div>
            <div style={{fontSize:20,fontWeight:900,color:s.color,marginBottom:2}}>{s.val}</div>
            <div style={{fontSize:10,color:T.green,fontWeight:700}}>{s.change} vs last period</div>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
        {/* Episode selector + heatmap */}
        <div style={{background:T.panel,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:20,padding:22,backdropFilter:"blur(24px) saturate(180%)"}}>
          <div style={{fontSize:13,fontWeight:700,color:T.t1,marginBottom:14}}>Episode Heatmap</div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
            {episodes.map((e,i)=>(
              <div key={i} onClick={()=>setActiveEp(i)}
                style={{background:activeEp===i?`${T.cyan}10`:"rgba(255,255,255,.02)",
                  border:`1px solid ${activeEp===i?T.cyan:T.border}`,
                  borderRadius:10,padding:"10px 12px",cursor:"pointer",transition:"all .2s"}}>
                <div style={{fontSize:12,fontWeight:600,color:activeEp===i?T.cyan:T.t1}}>{e.title}</div>
                <div style={{display:"flex",gap:12,marginTop:4}}>
                  <span style={{fontSize:10,color:T.t3}}>▶ {e.plays}</span>
                  <span style={{fontSize:10,color:T.green}}>{e.completion}% completion</span>
                </div>
              </div>
            ))}
          </div>

          {/* Visual heatmap bar */}
          <div style={{fontSize:11,fontWeight:700,color:T.t1,marginBottom:8}}>
            Listener Dropoff — {ep.title.substring(0,20)}...
          </div>
          <div style={{display:"flex",gap:2,marginBottom:6}}>
            {Array.from({length:20},(_,i)=>{
              const pct=i/20*100;
              const dropped=pct>ep.dropoff;
              const intensity=dropped?Math.max(0.1,1-(pct-ep.dropoff)/60):0.8;
              return(
                <div key={i} style={{flex:1,height:32,borderRadius:3,
                  background:dropped?`rgba(210,104,122,${intensity})`:`rgba(127,166,240,${intensity})`,
                  transition:"background .3s"}}/>
              );
            })}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:T.t3}}>
            <span>0:00</span><span>Dropoff at {ep.dropoff}min</span><span>End</span>
          </div>
          <div style={{marginTop:10,fontSize:11,color:T.t2,lineHeight:1.6}}>
            💡 <span style={{color:T.gold,fontWeight:700}}>Insight:</span> Most listeners drop off at {ep.dropoff} min. Keep future episodes under {ep.dropoff+3} min for higher completion rates.
          </div>
        </div>

        {/* Sentiment analysis */}
        <div style={{background:T.panel,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:20,padding:22,backdropFilter:"blur(24px) saturate(180%)"}}>
          <div style={{fontSize:13,fontWeight:700,color:T.t1,marginBottom:6}}>Real-Time Sentiment Analysis</div>
          <div style={{fontSize:11,color:T.t2,marginBottom:16}}>{ep.title.substring(0,30)}...</div>

          <div style={{textAlign:"center",marginBottom:16}}>
            <div style={{fontSize:48,fontWeight:900,color:ep.sentiment>=85?T.green:ep.sentiment>=70?T.gold:T.pink}}>
              {ep.sentiment}
            </div>
            <div style={{fontSize:12,color:T.t2}}>Overall Sentiment Score / 100</div>
            <div style={{fontSize:11,color:ep.sentiment>=85?T.green:T.gold,fontWeight:700,marginTop:4}}>
              {ep.sentiment>=85?"😊 Audience Loved It":ep.sentiment>=70?"😐 Generally Positive":"😟 Mixed Reactions"}
            </div>
          </div>

          <SentimentBar label="Enthusiasm" value={ep.sentiment+4} color={T.green}/>
          <SentimentBar label="Laughter moments" value={ep.sentiment-8} color={T.gold}/>
          <SentimentBar label="Agreement" value={ep.sentiment-3} color={T.cyan}/>
          <SentimentBar label="Surprise reactions" value={ep.sentiment-15} color={T.purple}/>

          <div style={{marginTop:14,background:`${T.purple}0A`,border:`1px solid ${T.purple}20`,
            borderRadius:10,padding:"10px 12px"}}>
            <div style={{fontSize:11,fontWeight:700,color:T.purple,marginBottom:4}}>🤖 AI Insight</div>
            <div style={{fontSize:11,color:T.t2,lineHeight:1.6}}>
              Your audience reacts strongest to personal stories (min 8–14). Comedy segments at min 22–28 generated the highest enthusiasm. Start your next episode with a personal hook.
            </div>
          </div>
        </div>
      </div>

      {/* Top superfans */}
      <div style={{background:T.panel,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:20,padding:22,backdropFilter:"blur(24px) saturate(180%)"}}>
        <div style={{fontSize:13,fontWeight:700,color:T.t1,marginBottom:14}}>⭐ Your Top Superfans</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
          {[
            {name:"Amaka_T",      country:"🇳🇬",spent:"₦84K",eps:24,tier:"Gold"},
            {name:"PodFan99",     country:"🇺🇸",spent:"$156",eps:22,tier:"Gold"},
            {name:"ComedyKing",   country:"🇬🇧",spent:"£92",eps:20,tier:"Silver"},
            {name:"TechGuru_SA",  country:"🇿🇦",spent:"R340",eps:18,tier:"Silver"},
            {name:"LaughLover_KE",country:"🇰🇪",spent:"KSh1.2K",eps:16,tier:"Bronze"},
          ].map((f,i)=>(
            <div key={i} style={{background:`${i===0?T.gold:i<=1?T.gold:i<=3?T.t2:T.orange}0A`,
              border:`1px solid ${i===0?T.gold:i<=1?T.gold:T.border}25`,
              borderRadius:14,padding:"14px 10px",textAlign:"center"}}>
              <div style={{fontSize:24,marginBottom:6}}>{f.country}</div>
              <div style={{fontSize:12,fontWeight:700,color:T.t1,marginBottom:2}}>{f.name}</div>
              <div style={{fontSize:10,color:T.gold,fontWeight:700,marginBottom:4}}>{f.spent} tipped</div>
              <Chip label={f.tier} color={f.tier==="Gold"?T.gold:f.tier==="Silver"?T.t2:T.orange}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// X-FACTOR 4 — GUEST & BRAND MARKETPLACE
// ═══════════════════════════════════════════════════════════════════════════════
function MarketplaceScreen(){
  const [tab,setTab]=useState("brands");
  const [applied,setApplied]=useState([]);

  const BRANDS=[
    {id:"b1",name:"AfriTech Hub",    niche:"Tech",       budget:"$2K–$5K/ep",logo:"🏢",desc:"Pan-African tech brand seeking podcast partners with engaged startup audience.",color:T.cyan,    rating:"4.9"},
    {id:"b2",name:"NaijaSound",      niche:"Music",      budget:"$500–$2K/ep",logo:"🎵",desc:"African music streaming platform. Looking for music & culture podcasters.",color:T.purple,  rating:"4.7"},
    {id:"b3",name:"PodEquip Pro",    niche:"Creator",    budget:"$1K–$3K/ep", logo:"🎙",desc:"Professional podcast equipment. Ideal for creator-focused shows.",          color:T.gold,    rating:"4.8"},
    {id:"b4",name:"ComedyFest Lagos",niche:"Comedy",     budget:"$800–$2K/ep",logo:"😂",desc:"Annual comedy festival. Seeking comedy podcasters for sponsorship.",         color:T.pink,    rating:"5.0"},
    {id:"b5",name:"WealthBuilder",   niche:"Finance",    budget:"$3K–$8K/ep", logo:"💰",desc:"Investment platform targeting African diaspora. High CPM niche.",            color:T.green,   rating:"4.6"},
    {id:"b6",name:"FitLife Africa",  niche:"Health",     budget:"$500–$1.5K/ep",logo:"🏋",desc:"Health & wellness brand. Looking for authentic voices in the health space.", color:T.orange,  rating:"4.5"},
  ];

  const GUESTS=[
    {id:"g1",name:"Dr. Kwame Mensah",  title:"AI Researcher",        fee:"Free–$500",   niche:"Tech",    country:"🇬🇭",rating:"4.9",img:"👨‍🔬"},
    {id:"g2",name:"Funke Okonkwo",     title:"Stand-up Comedian",    fee:"$200–$800",   niche:"Comedy",  country:"🇳🇬",rating:"4.8",img:"😂"},
    {id:"g3",name:"Zara Kimani",       title:"Finance Expert",       fee:"Free",        niche:"Finance", country:"🇰🇪",rating:"5.0",img:"📈"},
    {id:"g4",name:"Marcus Osei",       title:"Entrepreneur",         fee:"$100–$500",   niche:"Business",country:"🇬🇭",rating:"4.7",img:"💼"},
    {id:"g5",name:"Dr. Lena Park",     title:"Wellness Coach",       fee:"Free–$200",   niche:"Health",  country:"🇰🇷",rating:"4.9",img:"🧘"},
    {id:"g6",name:"Tony Adeleke",      title:"Political Commentator",fee:"$300–$1K",    niche:"Politics",country:"🇳🇬",rating:"4.6",img:"🎤"},
  ];

  const items=tab==="brands"?BRANDS:GUESTS;

  return(
    <div>
      <div style={{borderRadius:22,overflow:"hidden",height:190,position:"relative",marginBottom:22}}>
        <ImgFallback src={IMG_STUDIO_TABLE} alt="marketplace" style={{filter:"brightness(.4)"}} fallback={T.green}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(0,255,136,.25),rgba(11,17,27,.72))"}}/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"22px 28px"}}>
          <div style={{fontSize:11,color:T.green,fontWeight:700,letterSpacing:3,marginBottom:6}}>🤝 MARKETPLACE</div>
          <div style={{fontSize:26,fontWeight:900,color:T.t1}}>Find Guests & Brand Deals</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,.6)",marginTop:4}}>
            Book world-class guests. Close brand deals. Zero agents. PodChat takes 5% only.
          </div>
        </div>
      </div>

      <div style={{display:"flex",gap:8,marginBottom:20}}>
        {[["brands","💰 Brand Deals"],["guests","🎤 Guest Speakers"]].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{background:tab===id?"rgba(0,255,136,.12)":"rgba(255,255,255,.04)",
              border:`1px solid ${tab===id?T.green:T.border}`,
              color:tab===id?T.green:T.t2,padding:"8px 18px",
              borderRadius:20,fontSize:12,fontWeight:700,cursor:"pointer"}}>{label}</button>
        ))}
        <div style={{flex:1}}/>
        <div style={{background:"rgba(0,255,136,.08)",border:`1px solid ${T.green}25`,
          borderRadius:12,padding:"8px 14px",fontSize:11,color:T.green,fontWeight:700}}>
          PodChat fee: 5% only (vs 15–20% agent fee)
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
        {items.map(item=>{
          const isApplied=applied.includes(item.id);
          return(
            <div key={item.id} style={{background:T.panel,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",
              borderRadius:18,padding:20,backdropFilter:"blur(24px) saturate(180%)",transition:"all .25s"}}
              onMouseEnter={e=>{e.currentTarget.style.border=`1px solid ${item.color}50`;e.currentTarget.style.transform="translateY(-3px)";}}
              onMouseLeave={e=>{e.currentTarget.style.border=`1px solid ${T.border}`;e.currentTarget.style.transform="none";}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div style={{width:44,height:44,borderRadius:12,background:`${item.color}15`,
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>
                  {item.logo||item.img}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:4}}>
                  <span style={{fontSize:11,color:T.gold}}>★</span>
                  <span style={{fontSize:11,fontWeight:700,color:T.t1}}>{item.rating}</span>
                </div>
              </div>
              <div style={{fontSize:14,fontWeight:800,color:T.t1,marginBottom:2}}>{item.name}</div>
              <div style={{fontSize:11,color:item.color,fontWeight:600,marginBottom:2}}>
                {item.title||""}{item.country||""}
              </div>
              <Chip label={item.niche} color={item.color}/>
              <div style={{fontSize:11,color:T.t2,margin:"10px 0",lineHeight:1.5}}>{item.desc}</div>
              <div style={{fontSize:14,fontWeight:900,color:T.green,marginBottom:12}}>{item.budget||item.fee}</div>
              <Btn color={item.color} filled={!isApplied} small
                onClick={()=>setApplied(a=>[...a,item.id])}
                style={{width:"100%"}}>
                {isApplied?"✓ Applied!":tab==="brands"?"Apply for Deal →":"Book Guest →"}
              </Btn>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// X-FACTOR 5 — COMEDY FORMATS (ROAST BATTLE + OPEN MIC)
// ═══════════════════════════════════════════════════════════════════════════════
function ComedyFormatsScreen(){
  const [mode,setMode]=useState("roast");
  const [votes,setVotes]=useState({a:142,b:89});
  const [micQueue,setMicQueue]=useState([
    {name:"ComedyKing_NG",flag:"🇳🇬",status:"performing",time:"2:14"},
    {name:"LaughRiot_UK",  flag:"🇬🇧",status:"waiting",  time:"Up next"},
    {name:"JokeSmith_US",  flag:"🇺🇸",status:"waiting",  time:"~5 min"},
  ]);
  const [joined,setJoined]=useState(false);

  return(
    <div>
      <div style={{borderRadius:22,overflow:"hidden",height:200,position:"relative",marginBottom:22}}>
        <ImgFallback src={IMG_COMEDY_NEON} alt="comedy formats" style={{filter:"brightness(.4)"}} fallback={T.pink}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(210,104,122,.4),rgba(11,17,27,.72))"}}/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"22px 28px"}}>
          <div style={{fontSize:11,color:T.pink,fontWeight:700,letterSpacing:3,marginBottom:6}}>😂 COMEDY FORMATS</div>
          <div style={{fontSize:26,fontWeight:900,color:T.t1}}>Formats Built for Comedians</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,.6)",marginTop:4}}>
            Roast Battle · Open Mic Rooms · Comedy Specials · Pod Wars
          </div>
        </div>
      </div>

      <div style={{display:"flex",gap:8,marginBottom:20}}>
        {[["roast","⚔️ Roast Battle"],["openmic","🎤 Open Mic Room"],["special","🎭 Comedy Special"],["podwars","⚔️ Pod Wars"]].map(([id,label])=>(
          <button key={id} onClick={()=>setMode(id)}
            style={{background:mode===id?"rgba(210,104,122,.12)":"rgba(255,255,255,.04)",
              border:`1px solid ${mode===id?T.pink:T.border}`,
              color:mode===id?T.pink:T.t2,padding:"8px 16px",
              borderRadius:20,fontSize:11,fontWeight:700,cursor:"pointer"}}>{label}</button>
        ))}
      </div>

      {mode==="roast"&&(
        <div>
          <div style={{background:T.panel,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:20,padding:24,backdropFilter:"blur(24px) saturate(180%)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <div style={{fontSize:15,fontWeight:800,color:T.t1}}>🔴 Live Roast Battle</div>
              <Pill label="LIVE" color={T.pink} pulse/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 60px 1fr",gap:12,alignItems:"center",marginBottom:20}}>
              {[{name:"Marcus Bright",flag:"🇳🇬",score:votes.a,color:T.cyan,side:"a"},
                {name:"JokeMaster UK",flag:"🇬🇧",score:votes.b,color:T.pink,side:"b"}].map((c,ci)=>(
                <div key={ci} style={{background:`${c.color}0A`,border:`1px solid ${c.color}30`,
                  borderRadius:16,padding:"20px",textAlign:"center"}}>
                  <div style={{fontSize:36,marginBottom:8}}>{c.flag}</div>
                  <div style={{fontSize:15,fontWeight:800,color:T.t1,marginBottom:4}}>{c.name}</div>
                  <div style={{fontSize:24,fontWeight:900,color:c.color,marginBottom:12}}>{c.score}</div>
                  <Btn color={c.color} filled small
                    onClick={()=>setVotes(v=>c.side==="a"?{...v,a:v.a+1}:{...v,b:v.b+1})}>
                    Vote ▲
                  </Btn>
                </div>
              ))}
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:28,fontWeight:900,color:T.t2}}>VS</div>
                <div style={{fontSize:10,color:T.t3,marginTop:4}}>{votes.a+votes.b} votes</div>
              </div>
            </div>
            <div style={{height:6,background:"rgba(255,255,255,0.10)",borderRadius:3,overflow:"hidden"}}>
              <div style={{height:"100%",borderRadius:3,
                background:`linear-gradient(90deg,${T.cyan} ${Math.round(votes.a/(votes.a+votes.b)*100)}%,${T.pink} 0%)`,
                transition:"background .5s"}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:10,color:T.t3}}>
              <span>Marcus {Math.round(votes.a/(votes.a+votes.b)*100)}%</span>
              <span>JokeMaster {Math.round(votes.b/(votes.a+votes.b)*100)}%</span>
            </div>
          </div>
        </div>
      )}

      {mode==="openmic"&&(
        <div style={{background:T.panel,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:20,padding:24,backdropFilter:"blur(24px) saturate(180%)"}}>
          <div style={{fontSize:15,fontWeight:800,color:T.t1,marginBottom:4}}>🎤 Open Mic Room — Live</div>
          <div style={{fontSize:12,color:T.t2,marginBottom:20}}>Any comedian can perform to a global live audience. No gatekeeping.</div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
            {micQueue.map((c,i)=>(
              <div key={i} style={{background:c.status==="performing"?`${T.green}08`:"rgba(255,255,255,.02)",
                border:`1px solid ${c.status==="performing"?T.green:T.border}`,
                borderRadius:14,padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:36,height:36,borderRadius:"50%",
                  background:c.status==="performing"?`${T.green}20`:"rgba(255,255,255,.08)",
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{c.flag}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:T.t1}}>{c.name}</div>
                  <div style={{fontSize:10,color:c.status==="performing"?T.green:T.t3,fontWeight:600,textTransform:"uppercase"}}>
                    {c.status==="performing"?"🎤 On stage now":c.status}
                  </div>
                </div>
                <div style={{fontSize:12,fontWeight:700,color:c.status==="performing"?T.pink:T.t3}}>{c.time}</div>
                {c.status==="performing"&&(
                  <div style={{display:"flex",gap:6}}>
                    {["😂","🔥","👏"].map(e=>(
                      <button key={e} style={{background:"rgba(255,255,255,0.09)",border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",
                        borderRadius:8,padding:"4px 8px",fontSize:14,cursor:"pointer"}}>{e}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          {!joined?(
            <Btn color={T.green} filled onClick={()=>{setJoined(true);setMicQueue(q=>[...q,{name:"You",flag:"🌍",status:"waiting",time:"~8 min"}]);}}
              style={{width:"100%",padding:"12px",fontSize:13}}>
              🎤 Join Open Mic Queue — Perform Live
            </Btn>
          ):(
            <div style={{background:`${T.green}10`,border:`1px solid ${T.green}30`,borderRadius:12,
              padding:"14px",textAlign:"center"}}>
              <div style={{fontSize:13,fontWeight:700,color:T.green}}>✓ You're in the queue! Estimated: ~8 min</div>
              <div style={{fontSize:11,color:T.t2,marginTop:4}}>Prepare your set. We'll call you live when it's your turn.</div>
            </div>
          )}
        </div>
      )}

      {(mode==="special"||mode==="podwars")&&(
        <div style={{background:T.panel,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:20,padding:28,
          backdropFilter:"blur(24px) saturate(180%)",textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:16}}>{mode==="special"?"🎭":"⚔️"}</div>
          <div style={{fontSize:20,fontWeight:800,color:T.t1,marginBottom:8}}>
            {mode==="special"?"Comedy Specials":"Pod Wars"}
          </div>
          <div style={{fontSize:13,color:T.t2,maxWidth:480,margin:"0 auto 20px",lineHeight:1.7}}>
            {mode==="special"
              ?"Upload or stream your full comedy special as a ticketed live event. Set your own ticket price. Keep 90% of all ticket sales. No venue costs. Global audience."
              :"Two creators. One hot topic. Live audience votes in real time. The winner gets algorithmically boosted for 7 days. Controversy = engagement = growth."}
          </div>
          <div style={{display:"flex",gap:12,justifyContent:"center"}}>
            <Btn color={T.pink} filled>{mode==="special"?"🎭 Upload My Special":"⚔️ Start a Pod War"}</Btn>
            <Btn color={T.gold}>{mode==="special"?"💰 Set Ticket Price":"📋 View Active Wars"}</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// X-FACTOR 6 — SIMULCAST HQ
// ═══════════════════════════════════════════════════════════════════════════════
function SimulcastScreen(){
  const [platforms,setPlatforms]=useState({podchat:true,spotify:false,youtube:false,twitter:false,facebook:false});
  const [streaming,setStreaming]=useState(false);
  const [secs,setSecs]=useState(0);

  useEffect(()=>{
    if(!streaming){setSecs(0);return;}
    const t=setInterval(()=>setSecs(s=>s+1),1000);
    return()=>clearInterval(t);
  },[streaming]);

  const fmt=s=>`${String(Math.floor(s/3600)).padStart(2,"0")}:${String(Math.floor((s%3600)/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  const PLATS=[
    {id:"podchat",name:"PodChat",     icon:"🎙",color:T.cyan,   note:"HQ — Full features",  exclusive:true},
    {id:"spotify",name:"Spotify",     icon:"🎵",color:"#8FA8DE", note:"Audio stream only"},
    {id:"youtube",name:"Video Platform",icon:"📺",color:"#CE3B44",note:"Video + chat"},
    {id:"twitter",name:"X / Twitter", icon:"🐦",color:"#9FB6DC",note:"Short clips auto-posted"},
    {id:"facebook",name:"Facebook",   icon:"👥",color:"#5A78C8",note:"Restream to FB Live"},
  ];

  const activePlatforms=PLATS.filter(p=>platforms[p.id]);
  const totalReach=activePlatforms.reduce((a,p)=>a+({podchat:2,spotify:8,youtube:25,twitter:5,facebook:10}[p.id]||0),0);

  return(
    <div>
      <div style={{borderRadius:22,overflow:"hidden",height:190,position:"relative",marginBottom:22}}>
        <ImgFallback src={IMG_STUDIO_BLUE} alt="simulcast" style={{filter:"brightness(.4)"}} fallback={T.purple}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(90,120,200,.35),rgba(11,17,27,.72))"}}/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"22px 28px"}}>
          <div style={{fontSize:11,color:T.purple,fontWeight:700,letterSpacing:3,marginBottom:6}}>📡 SIMULCAST HQ</div>
          <div style={{fontSize:26,fontWeight:900,color:T.t1}}>Stream Everywhere at Once</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,.6)",marginTop:4}}>
            PodChat is your HQ. All other platforms are satellites. One click, everywhere.
          </div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:20}}>
        <div>
          <div style={{background:T.panel,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:20,padding:22,
            backdropFilter:"blur(24px) saturate(180%)",marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:700,color:T.t1,marginBottom:16}}>Select Platforms to Stream To</div>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
              {PLATS.map(p=>(
                <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",
                  background:`${p.color}08`,border:`1px solid ${platforms[p.id]?p.color+"50":T.border}`,
                  borderRadius:14,transition:"all .2s",cursor:p.id==="podchat"?"default":"pointer"}}
                  onClick={()=>p.id!=="podchat"&&setPlatforms(ps=>({...ps,[p.id]:!ps[p.id]}))}>
                  <div style={{width:40,height:40,borderRadius:10,background:`${p.color}18`,
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{p.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:T.t1}}>{p.name}</div>
                    <div style={{fontSize:11,color:T.t2}}>{p.note}</div>
                    {p.exclusive&&<Chip label="PodChat Exclusive Features" color={T.cyan}/>}
                  </div>
                  <div style={{width:24,height:24,borderRadius:6,
                    background:platforms[p.id]?p.color:"rgba(255,255,255,.08)",
                    border:`2px solid ${platforms[p.id]?p.color:T.t3}`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:12,color:"#000",fontWeight:900,transition:"all .2s"}}>
                    {platforms[p.id]&&"✓"}
                  </div>
                </div>
              ))}
            </div>

            {/* Stream button */}
            {streaming?(
              <div>
                <div style={{background:"rgba(210,104,122,.08)",border:`1px solid ${T.pink}40`,
                  borderRadius:14,padding:"16px",textAlign:"center",marginBottom:14}}>
                  <Pill label="STREAMING LIVE" color={T.pink} pulse/>
                  <div style={{fontSize:32,fontWeight:900,color:T.pink,marginTop:8,fontFamily:"'Manrope', ui-sans-serif, system-ui, sans-serif"}}>{fmt(secs)}</div>
                  <div style={{fontSize:12,color:T.t2,marginTop:4}}>
                    Streaming to {activePlatforms.length} platform{activePlatforms.length!==1?"s":""} simultaneously
                  </div>
                </div>
                <Btn color={T.pink} filled onClick={()=>setStreaming(false)} style={{width:"100%",padding:"12px",fontSize:13}}>
                  ⏹ End Simulcast
                </Btn>
              </div>
            ):(
              <Btn color={T.purple} filled onClick={()=>setStreaming(true)} style={{width:"100%",padding:"13px",fontSize:14}}>
                📡 Start Simulcast to {activePlatforms.length} Platform{activePlatforms.length!==1?"s":""}
              </Btn>
            )}
          </div>
        </div>

        <div>
          <div style={{background:T.panel,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:18,padding:20,
            backdropFilter:"blur(24px) saturate(180%)",marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:T.purple,marginBottom:14}}>📊 Estimated Reach</div>
            <div style={{fontSize:36,fontWeight:900,color:T.purple,marginBottom:4}}>{totalReach}M+</div>
            <div style={{fontSize:11,color:T.t2,marginBottom:16}}>potential listeners across all platforms</div>
            {PLATS.filter(p=>platforms[p.id]).map(p=>(
              <div key={p.id} style={{display:"flex",justifyContent:"space-between",
                padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
                <span style={{fontSize:11,color:T.t1}}>{p.icon} {p.name}</span>
                <span style={{fontSize:11,fontWeight:700,color:p.color}}>
                  {({podchat:"2M",spotify:"8M",youtube:"25M",twitter:"5M",facebook:"10M"}[p.id])}
                </span>
              </div>
            ))}
          </div>
          <div style={{background:`${T.cyan}0A`,border:`1px solid ${T.cyan}20`,borderRadius:16,padding:18}}>
            <div style={{fontSize:12,fontWeight:700,color:T.cyan,marginBottom:8}}>💡 The Pitch to Big Creators</div>
            <div style={{fontSize:11,color:T.t2,lineHeight:1.7}}>
              "Don't leave your existing platforms. Just make PodChat your headquarters. One stream reaches everyone. Only PodChat gives your fans the Hot Seat, tips, voting and translation."
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// X-FACTOR 7 — REVENUE DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function RevenueDashboardScreen({podCoins,setPodCoins}){
  const [period,setPeriod]=useState("month");
  const monthly={views:1240,tips:840,subs:600,brands:3200,tickets:500};
  const yearly=Object.fromEntries(Object.entries(monthly).map(([k,v])=>[k,v*12]));
  const data=period==="month"?monthly:yearly;
  const total=Object.values(data).reduce((a,b)=>a+b,0);
  const USD=(total/100).toFixed(0);
  const compare={youtube:Math.round(total*.55),spotify:Math.round(total*.15),podchat:total};

  return(
    <div>
      <div style={{borderRadius:22,overflow:"hidden",height:190,position:"relative",marginBottom:22}}>
        <ImgFallback src={IMG_STUDIO_DRAMATIC} alt="revenue" style={{filter:"brightness(.4)"}} fallback={T.gold}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(245,158,11,.35),rgba(11,17,27,.72))"}}/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"22px 28px"}}>
          <div style={{fontSize:11,color:T.gold,fontWeight:700,letterSpacing:3,marginBottom:6}}>💰 REVENUE DASHBOARD</div>
          <div style={{fontSize:26,fontWeight:900,color:T.t1}}>Your Full Earnings Picture</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,.6)",marginTop:4}}>
            90% goes to you. Every stream. Every tip. Every deal. Transparent always.
          </div>
        </div>
        <div style={{position:"absolute",top:16,right:16,display:"flex",gap:6}}>
          {["month","year"].map(p=>(
            <button key={p} onClick={()=>setPeriod(p)}
              style={{background:period===p?"rgba(245,158,11,.4)":"rgba(0,0,0,.5)",
                border:`1px solid ${period===p?T.gold:"transparent"}`,
                borderRadius:8,padding:"5px 12px",color:T.t1,fontSize:11,fontWeight:700,cursor:"pointer"}}>
              {p==="month"?"This Month":"This Year"}
            </button>
          ))}
        </div>
      </div>

      {/* Big number */}
      <div style={{background:`linear-gradient(135deg,rgba(245,158,11,.1),rgba(16,18,22,.9))`,
        border:`1px solid rgba(245,158,11,.25)`,borderRadius:20,padding:"24px 28px",marginBottom:20,
        display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:11,color:T.gold,fontWeight:700,letterSpacing:3,marginBottom:6}}>TOTAL EARNINGS ({period==="month"?"THIS MONTH":"THIS YEAR"})</div>
          <div style={{fontSize:52,fontWeight:900,color:T.gold,letterSpacing:-2}}>{total.toLocaleString()} <span style={{fontSize:20,fontWeight:600,color:T.t2}}>PC</span></div>
          <div style={{fontSize:18,color:"rgba(255,255,255,.7)",marginTop:4}}>≈ ${Number(USD).toLocaleString()} USD</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:12,color:T.t2,marginBottom:4}}>Your share</div>
          <div style={{fontSize:36,fontWeight:900,color:T.green}}>90%</div>
          <div style={{fontSize:11,color:T.t3}}>vs 55% on YouTube</div>
        </div>
      </div>

      {/* Breakdown */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
        <div style={{background:T.panel,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:20,padding:22,backdropFilter:"blur(24px) saturate(180%)"}}>
          <div style={{fontSize:13,fontWeight:700,color:T.t1,marginBottom:16}}>Revenue Streams</div>
          {[
            ["View RPM",        data.views,  T.cyan,  "Per 1,000 qualified plays"],
            ["Live Tips",       data.tips,   T.gold,  "PodCoins sent during shows"],
            ["Superfan Subs",   data.subs,   T.purple,"Monthly subscriptions"],
            ["Brand Deals",     data.brands, T.pink,  "Sponsored content"],
            ["Ticket Sales",    data.tickets,T.green, "Comedy specials & events"],
          ].map(([label,val,color,desc])=>(
            <div key={label} style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <div>
                  <span style={{fontSize:12,fontWeight:700,color:T.t1}}>{label}</span>
                  <span style={{fontSize:10,color:T.t3,marginLeft:8}}>{desc}</span>
                </div>
                <span style={{fontSize:13,fontWeight:800,color}}>{val.toLocaleString()} PC</span>
              </div>
              <Meter value={Math.round(val/total*100)} tone={color} segments={24} height={12}/>
            </div>
          ))}
        </div>

        <div style={{background:T.panel,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:20,padding:22,backdropFilter:"blur(24px) saturate(180%)"}}>
          <div style={{fontSize:13,fontWeight:700,color:T.t1,marginBottom:16}}>Platform Comparison</div>
          <div style={{fontSize:11,color:T.t2,marginBottom:14}}>Same content. Same audience. Different payout.</div>
          {[
            {name:"YouTube",     val:compare.youtube, color:T.t3, pct:55},
            {name:"Spotify",     val:compare.spotify, color:T.t3, pct:15},
            {name:"PodChat",     val:compare.podchat, color:T.green, pct:90},
          ].map(p=>(
            <div key={p.name} style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:12,fontWeight:700,color:p.name==="PodChat"?T.green:T.t1}}>{p.name}</span>
                <span style={{fontSize:12,fontWeight:800,color:p.color}}>
                  {p.val.toLocaleString()} PC ({p.pct}%)
                </span>
              </div>
              <Meter value={p.pct} tone={p.name==="PodChat"?T.green:"rgba(200,215,238,0.35)"} segments={26} height={14}/>
            </div>
          ))}
          <div style={{background:`${T.green}10`,border:`1px solid ${T.green}25`,
            borderRadius:10,padding:"10px 12px",marginTop:8}}>
            <div style={{fontSize:12,fontWeight:700,color:T.green}}>
              +{(compare.podchat-compare.youtube).toLocaleString()} PC more on PodChat vs YouTube
            </div>
            <div style={{fontSize:11,color:T.t2,marginTop:2}}>That's ${((compare.podchat-compare.youtube)/100).toFixed(0)} extra per {period} for the same content.</div>
          </div>
        </div>
      </div>

      {/* Cash out */}
      <div style={{background:T.panel,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:20,padding:20,
        backdropFilter:"blur(24px) saturate(180%)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:13,fontWeight:700,color:T.t1,marginBottom:2}}>Available to Cash Out</div>
          <div style={{fontSize:28,fontWeight:900,color:T.gold}}>{podCoins.toLocaleString()} PC = ${(podCoins/100).toFixed(2)}</div>
          <div style={{fontSize:11,color:T.t2,marginTop:2}}>Paid out every 1st of the month via bank transfer or PayPal</div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <Btn color={T.gold} filled onClick={()=>setPodCoins(p=>p+500)}>+ Earn 500 PC</Btn>
          <Btn color={T.green} onClick={()=>setPodCoins(p=>Math.max(0,p-200))}>💸 Cash Out Now</Btn>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// X-FACTOR 8 — CONTENT OWNERSHIP & DATA EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
function OwnershipScreen(){
  const [exported,setExported]=useState({});
  const [cert,setCert]=useState(false);

  const doExport=(type)=>{
    setExported(e=>({...e,[type]:true}));
    const data=JSON.stringify({type,exportedAt:new Date().toISOString(),platform:"PodChat",note:"Creator owns 100% of this data"},null,2);
    const blob=new Blob([data],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download=`podchat-${type}-export.json`;a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  };

  return(
    <div>
      <div style={{borderRadius:22,overflow:"hidden",height:190,position:"relative",marginBottom:22}}>
        <ImgFallback src={IMG_STUDIO_PODCAST} alt="ownership" style={{filter:"brightness(.4)"}} fallback={T.cyan}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(127,166,240,.3),rgba(11,17,27,.72))"}}/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"22px 28px"}}>
          <div style={{fontSize:11,color:T.cyan,fontWeight:700,letterSpacing:3,marginBottom:6}}>🔑 CONTENT OWNERSHIP</div>
          <div style={{fontSize:26,fontWeight:900,color:T.t1}}>You Own Everything. Always.</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,.6)",marginTop:4}}>
            Your content. Your audience. Your data. PodChat is a platform, not an owner.
          </div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
        {/* Ownership rights */}
        <div style={{background:T.panel,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:20,padding:22,backdropFilter:"blur(24px) saturate(180%)"}}>
          <div style={{fontSize:13,fontWeight:700,color:T.t1,marginBottom:16}}>🔑 Your Creator Rights</div>
          {[
            {right:"Full IP Ownership",     desc:"You own 100% of all content you create. PodChat never claims any rights.",                         status:"Guaranteed",color:T.green},
            {right:"No Platform Lock-In",   desc:"Download all your content, audience data and earnings history anytime.",                              status:"Guaranteed",color:T.green},
            {right:"No Arbitrary Removal",  desc:"Your content stays live forever. We cannot remove it without a legal order.",                        status:"Guaranteed",color:T.green},
            {right:"Audience List Ownership",desc:"Your subscriber list is yours. Export it anytime and take it to any platform.",                     status:"Guaranteed",color:T.green},
            {right:"No Demonetization",     desc:"Your revenue cannot be suspended without 30 days written notice and a dispute process.",              status:"Guaranteed",color:T.green},
            {right:"Data Portability",      desc:"All your analytics, comments and transaction history can be exported at any time.",                   status:"Guaranteed",color:T.green},
          ].map((r,i)=>(
            <div key={i} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
              <div style={{width:20,height:20,borderRadius:5,background:`${T.green}20`,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,
                color:T.green,flexShrink:0,marginTop:2}}>✓</div>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:T.t1}}>{r.right}</div>
                <div style={{fontSize:11,color:T.t2,lineHeight:1.5,marginTop:2}}>{r.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Data export */}
        <div>
          <div style={{background:T.panel,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:20,padding:22,
            backdropFilter:"blur(24px) saturate(180%)",marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:700,color:T.t1,marginBottom:4}}>⬇ Export Your Data</div>
            <div style={{fontSize:11,color:T.t2,marginBottom:16,lineHeight:1.6}}>
              Download everything. Any time. No questions asked. Your data belongs to you.
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {[
                {type:"audience",    label:"Audience List",     desc:"All subscriber emails & data",  icon:"👥", color:T.cyan},
                {type:"content",     label:"All Episodes",       desc:"Every file you've uploaded",   icon:"🎙", color:T.purple},
                {type:"analytics",   label:"Analytics Data",    desc:"Full listening stats & heatmaps",icon:"📊", color:T.gold},
                {type:"earnings",    label:"Earnings History",  desc:"Every transaction on record",   icon:"💰", color:T.green},
                {type:"comments",    label:"All Comments",      desc:"Every fan comment & reaction",  icon:"💬", color:T.pink},
              ].map(d=>(
                <div key={d.type} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",
                  background:`${d.color}06`,border:`1px solid ${exported[d.type]?d.color+"50":T.border}`,
                  borderRadius:12}}>
                  <span style={{fontSize:18}}>{d.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:T.t1}}>{d.label}</div>
                    <div style={{fontSize:10,color:T.t3}}>{d.desc}</div>
                  </div>
                  <Btn small color={exported[d.type]?T.green:d.color}
                    filled={!!exported[d.type]}
                    onClick={()=>doExport(d.type)}>
                    {exported[d.type]?"✓ Exported":"Export"}
                  </Btn>
                </div>
              ))}
            </div>
          </div>

          {/* Ownership certificate */}
          <div style={{background:`linear-gradient(135deg,rgba(245,158,11,.1),rgba(16,18,22,.9))`,
            border:`1px solid rgba(245,158,11,.3)`,borderRadius:18,padding:20}}>
            <div style={{fontSize:12,fontWeight:700,color:T.gold,marginBottom:8}}>🏆 Creator Ownership Certificate</div>
            <div style={{fontSize:11,color:T.t2,lineHeight:1.7,marginBottom:12}}>
              Generate a legal document confirming your 100% ownership of all content on PodChat. Share with lawyers, investors or distributors.
            </div>
            <Btn color={T.gold} filled={cert} small onClick={()=>setCert(true)} style={{width:"100%"}}>
              {cert?"✓ Certificate Generated":"Generate Ownership Certificate"}
            </Btn>
            {cert&&(
              <div style={{marginTop:10,background:"rgba(13,15,19,0.35)",backdropFilter:"blur(14px) saturate(140%)",borderRadius:10,padding:"10px 12px",
                fontFamily:"'Manrope', ui-sans-serif, system-ui, sans-serif",fontSize:10,color:T.t2,lineHeight:1.7}}>
                PODCHAT CREATOR OWNERSHIP CERTIFICATE<br/>
                Creator: Alex Mensah (@alexmensah)<br/>
                Issued: {new Date().toLocaleDateString()}<br/>
                Content Items: 24 episodes<br/>
                Rights: Full IP ownership, 100%<br/>
                Platform: PodChat (distribution partner only)<br/>
                ✓ Digitally verified
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Staff access keys — entered as the password on the normal Sign In form.
// There is no visible "Admin" option anywhere in the product for general users.


// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN / SIGNUP SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
function AuthScreen({onAuth}){
  const [mode,setMode]=useState("login");
  const [form,setForm]=useState({name:"",email:"",password:"",type:"visitor"});
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);

  const submit=async()=>{
    setErr("");
    if(!form.email.includes("@")){setErr("Please enter a valid email address");return;}
    if(form.password.length<8){setErr("Password must be at least 8 characters");return;}
    if(mode==="signup"&&!form.name.trim()){setErr("Please enter your name");return;}
    setLoading(true);
    try{
      const res=await fetch(`${API_BASE}/api/auth/${mode==="signup"?"signup":"login"}`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(
          mode==="signup"
            ? {email:form.email,password:form.password,name:form.name,type:form.type==="creator"?"creator":"listener"}
            : {email:form.email,password:form.password}
        ),
      });
      const data=await res.json();
      if(!res.ok) throw new Error(data.error||"Could not sign you in.");
      // The server decides who is an admin. Nothing about admin access
      // exists in this bundle any more.
      localStorage.setItem("podchat_token",data.token);
      onAuth({...data.user,token:data.token});
    }catch(e){
      setErr(e.message||"Network error. Please try again.");
    }finally{
      setLoading(false);
    }
  };

  return(
    <div style={{position:"fixed",inset:0,zIndex:998,display:"flex",alignItems:"center",
      justifyContent:"center",background:"rgba(13,15,19,0.92)",backdropFilter:"blur(40px)",backdropFilter:"blur(20px)"}}>
      <div style={{background:"rgba(255,255,255,0.08)",
        border:"1px solid rgba(255,255,255,0.22)",
        borderRadius:28,
        padding:"44px 48px",maxWidth:460,width:"92%",
        backdropFilter:"blur(40px) saturate(200%)",
        boxShadow:"0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.20), inset 0 -1px 0 rgba(0,0,0,0.20)"}}>

        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:56,height:56,borderRadius:16,
            background:"linear-gradient(135deg,#8FA8DE 0%,#5A78C8 100%)",boxShadow:"0 4px 20px rgba(90,120,200,0.30), inset 0 1px 0 rgba(255,255,255,0.20)",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:24,fontWeight:900,color:"#000",margin:"0 auto 12px"}}>P</div>
          <div style={{fontSize:22,fontWeight:900,color:T.t1,background:"linear-gradient(90deg,#8FA8DE 0%,#5A78C8 100%)",boxShadow:"0 4px 20px rgba(90,120,200,0.30)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>PodChat</div>
          <div style={{fontSize:12,color:T.t2,marginTop:4}}>
            {mode==="login"?"Welcome back — sign in to continue":"Create your free account"}
          </div>
        </div>

        {/* Mode toggle */}
        <div style={{display:"flex",background:"rgba(255,255,255,0.06)",borderRadius:12,
          padding:4,marginBottom:22,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)"}}>
          {[["login","Sign In"],["signup","Create Account"]].map(([m,l])=>(
            <button key={m} onClick={()=>{setMode(m);setErr("");}}
              style={{flex:1,padding:"9px",borderRadius:10,border:"none",
                background:mode===m?"linear-gradient(135deg,#8FA8DE,#5A78C8)":"transparent",
                color:mode===m?"#000":T.t2,fontSize:12,fontWeight:700,cursor:"pointer",
                transition:"all .2s"}}>
              {l}
            </button>
          ))}
        </div>

        {/* Fields */}
        {mode==="signup"&&(
          <div style={{marginBottom:12}}>
            <div style={{fontSize:10,color:T.t2,fontWeight:600,letterSpacing:1,
              marginBottom:5,textTransform:"uppercase"}}>Your Name</div>
            <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}
              placeholder="e.g. Alex Mensah"
              style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",
                borderRadius:10,padding:"10px 14px",color:T.t1,fontSize:13,outline:"none",
                boxSizing:"border-box"}}/>
          </div>
        )}

        <div style={{marginBottom:12}}>
          <div style={{fontSize:10,color:T.t2,fontWeight:600,letterSpacing:1,
            marginBottom:5,textTransform:"uppercase"}}>Email Address</div>
          <input value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}
            placeholder="you@example.com" type="email"
            style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",
              borderRadius:10,padding:"10px 14px",color:T.t1,fontSize:13,outline:"none",
              boxSizing:"border-box"}}/>
        </div>

        <div style={{marginBottom:16}}>
          <div style={{fontSize:10,color:T.t2,fontWeight:600,letterSpacing:1,
            marginBottom:5,textTransform:"uppercase"}}>Password</div>
          <input value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}
            onKeyDown={e=>e.key==="Enter"&&submit()}
            placeholder="Min 6 characters" type="password"
            style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",
              borderRadius:10,padding:"10px 14px",color:T.t1,fontSize:13,outline:"none",
              boxSizing:"border-box"}}/>
        </div>

        {mode==="signup"&&(
          <div style={{marginBottom:16}}>
            <div style={{fontSize:10,color:T.t2,fontWeight:600,letterSpacing:1,
              marginBottom:8,textTransform:"uppercase"}}>I want to join as</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[["visitor","👁 Listener","Watch & earn"],
                ["creator","🎙 Creator","Host & earn"]].map(([t,l,d])=>(
                <div key={t} onClick={()=>setForm(f=>({...f,type:t}))}
                  style={{background:form.type===t?`${T.cyan}12`:"rgba(255,255,255,.03)",
                    border:`2px solid ${form.type===t?T.cyan:T.border}`,
                    borderRadius:12,padding:"12px 10px",textAlign:"center",cursor:"pointer",
                    transition:"all .2s"}}>
                  <div style={{fontSize:20,marginBottom:4}}>{l.split(" ")[0]}</div>
                  <div style={{fontSize:11,fontWeight:700,color:form.type===t?T.cyan:T.t1}}>{l.substring(2)}</div>
                  <div style={{fontSize:10,color:T.t3,marginTop:2}}>{d}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {err&&<div style={{background:"rgba(210,104,122,.1)",border:`1px solid ${T.pink}40`,
          borderRadius:10,padding:"10px 14px",fontSize:12,color:T.pink,marginBottom:12}}>{err}</div>}

        <button onClick={submit}
          style={{width:"100%",padding:"13px",
            background:loading?"rgba(255,255,255,0.08)":"linear-gradient(135deg,#8FA8DE 0%,#5A78C8 100%)",
            border:"none",borderRadius:12,color:loading?T.t2:"#000",fontSize:13,
            fontWeight:800,cursor:loading?"not-allowed":"pointer",transition:"all .2s",
            marginBottom:14}}>
          {loading?"Signing in...":mode==="login"?"Sign In →":"Create Free Account →"}
        </button>

        <div style={{textAlign:"center",fontSize:11,color:T.t3,marginBottom:12}}>
          🔒 No credit card · No pay walls · No follower minimum
        </div>
        <div style={{textAlign:"center"}}>
          <span onClick={openSupport} title="Support — wittyhub.co" style={{fontSize:11,color:T.t2,fontWeight:700,cursor:"pointer"}}>Need help? Contact Support ↗</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEARCH OVERLAY — fully working
// ═══════════════════════════════════════════════════════════════════════════════
function SearchOverlay({content,onClose,onNavigate}){
  const [q,setQ]=useState("");
  const ref=useRef(null);
  useEffect(()=>{ ref.current?.focus(); },[]);

  const results=q.trim().length<2?[]:([
    ...content.shows.map(s=>({type:"Podcast",title:s.title,sub:s.host,page:"podcasts",color:s.color})),
    ...content.comedy.map(c=>({type:"Comedy",title:c.name,sub:c.specialty,page:"comedy",color:c.color})),
    ...content.interviews.map(i=>({type:"Interview",title:i.guest,sub:i.topic,page:"interviews",color:i.color||T.purple})),
    ...content.trending.map(t=>({type:"Trending",title:t.title,sub:t.platform,page:"trending",color:t.color})),
    ...content.hustles.map(h=>({type:"Hustle",title:h.title,sub:h.earn,page:"hustle",color:h.color})),
    ...content.highlights.map(h=>({type:"Live",title:h.title,sub:h.host,page:"live",color:h.color||T.pink})),
  ]).filter(r=>r.title.toLowerCase().includes(q.toLowerCase())||r.sub.toLowerCase().includes(q.toLowerCase())).slice(0,8);

  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:997,background:"rgba(255,255,255,0.05)",backdropFilter:"blur(20px) saturate(160%)",
      backdropFilter:"blur(20px) saturate(160%)",display:"flex",justifyContent:"center",paddingTop:"80px"}}>
      <div onClick={e=>e.stopPropagation()}
        style={{width:"100%",maxWidth:620,height:"fit-content",
          background:"rgba(255,255,255,0.08)",
          border:"1px solid rgba(255,255,255,0.22)",
          borderRadius:24,overflow:"hidden",
          backdropFilter:"blur(40px) saturate(200%)",
          boxShadow:"0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.15)"}}>

        {/* Search input */}
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"16px 20px",
          borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.t2} strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input ref={ref} value={q} onChange={e=>setQ(e.target.value)}
            placeholder="Search shows, comedians, interviews, hustles..."
            style={{flex:1,background:"transparent",border:"none",outline:"none",
              color:T.t1,fontSize:15,fontFamily:"inherit"}}/>
          {q&&<span onClick={()=>setQ("")} style={{color:T.t3,cursor:"pointer",fontSize:18}}>✕</span>}
          <kbd style={{background:"rgba(255,255,255,.07)",border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",
            borderRadius:6,padding:"3px 8px",fontSize:11,color:T.t3}}>ESC</kbd>
        </div>

        {/* Results */}
        {q.trim().length>=2&&(
          <div>
            {results.length===0?(
              <div style={{padding:"32px",textAlign:"center",color:T.t3,fontSize:13}}>
                No results for "{q}" — try a different search
              </div>
            ):(
              results.map((r,i)=>(
                <div key={i} onClick={()=>{onNavigate(r.page);onClose();}}
                  style={{display:"flex",alignItems:"center",gap:14,padding:"13px 20px",
                    borderBottom:"1px solid rgba(255,255,255,0.08)",cursor:"pointer",transition:"background .15s"}}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.04)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div style={{width:36,height:36,borderRadius:10,
                    background:`${r.color}18`,border:`1px solid ${r.color}30`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:10,fontWeight:700,color:r.color,flexShrink:0}}>{r.type}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:T.t1}}>{r.title}</div>
                    <div style={{fontSize:11,color:T.t3,marginTop:1}}>{r.sub}</div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.t3} strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              ))
            )}
          </div>
        )}

        {/* Quick links when empty */}
        {q.trim().length<2&&(
          <div style={{padding:"14px 20px"}}>
            <div style={{fontSize:10,color:T.t3,fontWeight:600,letterSpacing:1,
              textTransform:"uppercase",marginBottom:10}}>Quick Access</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {[["🔴 Live Now","live",T.pink],["😂 Comedy","comedy",T.pink],
                ["📊 Analytics","analytics",T.purple],["💰 Marketplace","marketplace",T.green],
                ["🌍 Translation","translate",T.cyan],["🔧 Tools","cms",T.t2]].map(([l,p,c])=>(
                <div key={l} onClick={()=>{onNavigate(p);onClose();}}
                  style={{background:`${c}12`,border:`1px solid ${c}30`,borderRadius:20,
                    padding:"7px 14px",fontSize:12,color:c,cursor:"pointer",fontWeight:600}}>
                  {l}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{padding:"10px 20px",borderTop:"1px solid rgba(255,255,255,0.08)",
          display:"flex",justifyContent:"space-between",fontSize:10,color:T.t3}}>
          <span>↵ to select</span><span>ESC to close</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATION DRAWER
// ═══════════════════════════════════════════════════════════════════════════════
function NotificationDrawer({open,onClose,setPage}){
  const [notifs,setNotifs]=useState([
    {id:1,type:"live",   icon:"🔴",title:"Marcus Bright just went LIVE",    sub:"Laugh Out Loud — 12K watching",         time:"2m ago", read:false,page:"live",   color:T.pink},
    {id:2,type:"earn",   icon:"💰",title:"You earned 240 PodCoins!",        sub:"From episode plays — Jun 20",           time:"1h ago", read:false,page:"wallet", color:T.gold},
    {id:3,type:"tip",    icon:"🎁",title:"@PodFan99 sent you a 50 PC tip",  sub:"On your latest episode",                time:"3h ago", read:false,page:"wallet", color:T.gold},
    {id:4,type:"new",    icon:"🎙",title:"New episode: Future Forward",     sub:"Erika Nwosu dropped Ep 149",            time:"5h ago", read:true, page:"podcasts",color:T.cyan},
    {id:5,type:"win",    icon:"🏆",title:"You made the weekly leaderboard!","sub":"Top 10 most engaged creators",         time:"1d ago", read:true, page:"pastewin",color:T.purple},
    {id:6,type:"brand",  icon:"🤝",title:"New brand deal request",          sub:"AfriTech Hub wants to sponsor your show",time:"2d ago", read:true, page:"marketplace",color:T.green},
    {id:7,type:"follower",icon:"👤",title:"1,240 new followers this week",  sub:"Keep it up — you're trending!",         time:"3d ago", read:true, page:"analytics",color:T.cyan},
  ]);

  const unread=notifs.filter(n=>!n.read).length;
  const markAll=()=>setNotifs(ns=>ns.map(n=>({...n,read:true})));
  const markRead=(id)=>setNotifs(ns=>ns.map(n=>n.id===id?{...n,read:true}:n));

  if(!open) return null;

  return(
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:200,background:"rgba(255,255,255,0.04)",backdropFilter:"blur(18px) saturate(150%)"}}/>
      <div style={{position:"fixed",top:0,right:0,bottom:0,width:360,zIndex:201,
        background:"rgba(10,14,28,.97)",borderLeft:"1px solid rgba(255,255,255,0.08)",
        backdropFilter:"blur(24px)",display:"flex",flexDirection:"column",
        boxShadow:"-20px 0 60px rgba(0,0,0,.5)"}}>

        {/* Header */}
        <div style={{padding:"20px 18px",borderBottom:"1px solid rgba(255,255,255,0.08)",
          display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:15,fontWeight:800,color:T.t1}}>Notifications</div>
            {unread>0&&<div style={{fontSize:11,color:T.t2,marginTop:2}}>{unread} unread</div>}
          </div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            {unread>0&&<button onClick={markAll}
              style={{background:"transparent",border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:8,
                padding:"5px 10px",color:T.t2,fontSize:11,cursor:"pointer"}}>Mark all read</button>}
            <button onClick={onClose}
              style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",
                borderRadius:8,padding:"5px 10px",color:T.t1,fontSize:14,cursor:"pointer"}}>✕</button>
          </div>
        </div>

        {/* List */}
        <div style={{flex:1,overflowY:"auto"}}>
          {notifs.map(n=>(
            <div key={n.id} onClick={()=>{markRead(n.id);setPage(n.page);onClose();}}
              style={{display:"flex",gap:12,padding:"14px 18px",cursor:"pointer",
                background:n.read?"transparent":"rgba(127,166,240,.04)",
                borderBottom:"1px solid rgba(255,255,255,0.08)",transition:"background .15s"}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.04)"}
              onMouseLeave={e=>e.currentTarget.style.background=n.read?"transparent":"rgba(127,166,240,.04)"}>
              <div style={{width:38,height:38,borderRadius:12,background:`${n.color}18`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:18,flexShrink:0}}>{n.icon}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:n.read?600:700,color:T.t1,
                  lineHeight:1.4,marginBottom:2}}>{n.title}</div>
                <div style={{fontSize:11,color:T.t2,lineHeight:1.4}}>{n.sub}</div>
                <div style={{fontSize:10,color:T.t3,marginTop:4}}>{n.time}</div>
              </div>
              {!n.read&&<div style={{width:8,height:8,borderRadius:"50%",
                background:T.cyan,flexShrink:0,marginTop:4}}/>}
            </div>
          ))}
        </div>

        <div style={{padding:"14px 18px",borderTop:"1px solid rgba(255,255,255,0.08)",
          textAlign:"center",fontSize:11,color:T.t3}}>
          PodChat Notifications · Real-time alerts coming after backend launch
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIO PLAYER BAR — persistent bottom player
// ═══════════════════════════════════════════════════════════════════════════════
function AudioPlayerBar({track,onClose}){
  const [playing,setPlaying]=useState(true);
  const [progress,setProgress]=useState(0);
  const [vol,setVol]=useState(80);
  const [floats,setFloats]=useState([]);
  const [wave,setWave]=useState(()=>Array(28).fill(0));
  const ivRef=useRef(null);
  const floatId=useRef(0);

  useEffect(()=>{
    if(playing){
      ivRef.current=setInterval(()=>setProgress(p=>p>=100?(clearInterval(ivRef.current),100):p+.05),100);
    } else { clearInterval(ivRef.current); }
    return()=>clearInterval(ivRef.current);
  },[playing]);

  if(!track) return null;

  const REACTS=[
    {emoji:"❤"},{emoji:"😂"},{emoji:"🔥"},{emoji:"😮"},{emoji:"👏"},
  ];

  // Live Reaction Wave — every reaction rises over the bar and lands as a
  // pulse on the timeline, so the engagement density is visible at a glance.
  const react=(emoji)=>{
    const id=++floatId.current;
    setFloats(f=>[...f,{id,emoji,x:14+Math.random()*66}]);
    setTimeout(()=>setFloats(f=>f.filter(x=>x.id!==id)),1300);
    setWave(w=>{
      const n=[...w];
      const i=Math.min(n.length-1,Math.floor(progress/100*n.length));
      n[i]=Math.min(9,(n[i]||0)+1);
      return n;
    });
  };

  const elapsed=Math.floor(progress/100*3600);
  const fmt=s=>`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  return(
    <div style={{position:"fixed",bottom:0,left:72,right:0,height:84,zIndex:150,
      background:"rgba(255,255,255,0.06)",
      backdropFilter:"blur(40px) saturate(200%)",
      borderTop:"1px solid rgba(255,255,255,0.16)",
      boxShadow:"0 -8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)",
      display:"flex",alignItems:"center",
      padding:"0 20px",gap:16}}>

      <style>{`@keyframes pcReactRise{0%{transform:translateY(0) scale(1);opacity:1}70%{opacity:.85}100%{transform:translateY(-62px) scale(1.25);opacity:0}}`}</style>
      {floats.map(f=>(
        <div key={f.id} style={{position:"absolute",bottom:16,left:`${f.x}%`,fontSize:20,animation:"pcReactRise 1.25s ease-out forwards",pointerEvents:"none",zIndex:5}}>{f.emoji}</div>
      ))}

      {/* Track info */}
      <div style={{display:"flex",alignItems:"center",gap:10,width:220,flexShrink:0}}>
        <div style={{width:40,height:40,borderRadius:10,background:`${track.color||T.cyan}20`,
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>
          🎙
        </div>
        <div style={{minWidth:0}}>
          <div style={{fontSize:12,fontWeight:700,color:T.t1,
            whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{track.title}</div>
          <div style={{fontSize:10,color:T.t2}}>{track.host}</div>
        </div>
        <div style={{marginLeft:"auto"}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.pink} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </div>
      </div>

      {/* Controls */}
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <button style={{background:"transparent",border:"none",color:T.t2,fontSize:16,cursor:"pointer"}}>⏮</button>
          <button onClick={()=>setPlaying(p=>!p)}
            style={{width:38,height:38,borderRadius:"50%",
              background:"linear-gradient(135deg,#8FA8DE 0%,#5A78C8 100%)",boxShadow:"0 4px 20px rgba(90,120,200,0.30), inset 0 1px 0 rgba(255,255,255,0.20)",
              border:"none",color:"#000",fontSize:16,cursor:"pointer",
              display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900}}>
            {playing?"⏸":"▶"}
          </button>
          <button style={{background:"transparent",border:"none",color:T.t2,fontSize:16,cursor:"pointer"}}>⏭</button>
        </div>
        {/* Live Reaction Wave — engagement density across the timeline */}
        <div style={{display:"flex",alignItems:"flex-end",gap:2,width:"100%",maxWidth:400,height:9}}>
          {wave.map((v,i)=>(
            <div key={i} style={{flex:1,height:v>0?`${4+Math.min(v,6)}px`:"2.5px",background:v>0?T.cyan:"rgba(255,255,255,0.13)",borderRadius:1,opacity:v>0?Math.min(1,.5+v*.1):.7,transition:"height .2s"}}/>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,width:"100%",maxWidth:400}}>
          <span style={{fontSize:10,color:T.t3,width:32,textAlign:"right"}}>{fmt(elapsed)}</span>
          <div style={{flex:1,height:3,background:"rgba(255,255,255,0.10)",borderRadius:2,cursor:"pointer",position:"relative"}}
            onClick={e=>{const r=e.currentTarget.getBoundingClientRect();setProgress((e.clientX-r.left)/r.width*100);}}>
            <div style={{height:"100%",width:`${progress}%`,background:T.t1,borderRadius:2}}/>
            <div style={{position:"absolute",top:"50%",left:`${progress}%`,transform:"translate(-50%,-50%)",
              width:10,height:10,borderRadius:"50%",background:T.t1}}/>
          </div>
          <span style={{fontSize:10,color:T.t3,width:32}}>60:00</span>
        </div>
      </div>

      {/* Right controls + Live reactions */}
      <div style={{display:"flex",alignItems:"center",gap:8,width:320,justifyContent:"flex-end",flexShrink:0}}>
        {REACTS.map(r=>(
          <button key={r.emoji} onClick={()=>react(r.emoji)} title={`React ${r.emoji}`}
            style={{width:30,height:30,borderRadius:9,fontSize:14,background:T.glass,border:`1px solid ${T.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(12px)"}}>{r.emoji}</button>
        ))}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.t2} strokeWidth="2" style={{marginLeft:4}}>
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
        </svg>
        <input type="range" min="0" max="100" value={vol} onChange={e=>setVol(Number(e.target.value))}
          style={{width:64,accentColor:T.cyan,cursor:"pointer"}}/>
        <button onClick={onClose}
          style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",
            borderRadius:8,padding:"5px 8px",color:T.t2,fontSize:11,cursor:"pointer"}}>✕</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PASTE & WIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
function PasteWinScreen({user}){
  const [tab,setTab]=useState("weekly");
  const [submitted,setSubmitted]=useState(false);
  const [entry,setEntry]=useState({title:"",desc:"",type:"podcast",url:""});
  const [voted,setVoted]=useState([]);

  const PRIZES={
    weekly:[
      {rank:1,prize:"$500 cash + Featured on PodChat homepage for 7 days + Gold badge",color:T.gold,icon:"🥇"},
      {rank:2,prize:"$200 cash + Featured placement for 3 days",                        color:T.t2,  icon:"🥈"},
      {rank:3,prize:"$100 cash + Trending boost for 48 hours",                          color:"#B08A5A",icon:"🥉"},
    ],
    monthly:[
      {rank:1,prize:"$2,000 cash + Brand deal introduction + Creator Spotlight feature + 3 months 95% revenue share",color:T.gold,  icon:"🏆"},
      {rank:2,prize:"$800 cash + Trending boost for 2 weeks + Silver Creator badge",                                  color:T.t2,   icon:"🥈"},
      {rank:3,prize:"$400 cash + Promoted in newsletter to 50K subscribers",                                          color:"#B08A5A",icon:"🥉"},
      {rank:4,prize:"$150 cash + PodCoins boost (500 PC)",                                                            color:T.cyan, icon:"🎖"},
      {rank:5,prize:"$100 cash + Shoutout on PodChat social channels",                                               color:T.purple,icon:"🎖"},
    ]
  };

  const LEADERBOARD=[
    {rank:1,name:"ComedyKing_NG",  country:"🇳🇬",title:"Why We're All Clowns",      type:"Comedy",  votes:2847,trend:"+284",img:IMG_COMEDY_NIGHT},
    {rank:2,name:"TechGuru_SA",    country:"🇿🇦",title:"AI Changed My Life in 30 Days",type:"Podcast",votes:2341,trend:"+156",img:IMG_MIC_NEON},
    {rank:3,name:"Amaka_Talks",    country:"🇳🇬",title:"The Real Side Hustle Story", type:"Interview",votes:1987,trend:"+201",img:IMG_STUDIO_BLUE},
    {rank:4,name:"PodFan_UK",      country:"🇬🇧",title:"Open Mic Lagos Recap",       type:"Comedy",  votes:1654,trend:"+89", img:IMG_COMEDY_NEON},
    {rank:5,name:"JokeSmith",      country:"🇺🇸",title:"Roast of Silicon Valley",    type:"Comedy",  votes:1432,trend:"+123",img:IMG_COMEDY_NIGHT},
  ];

  const voteFor=(rank)=>{
    if(!voted.includes(rank)){
      setVoted(v=>[...v,rank]);
    }
  };

  return(
    <div>
      {/* Hero */}
      <div style={{borderRadius:22,overflow:"hidden",height:240,position:"relative",marginBottom:22}}>
        <ImgFallback src={IMG_LIVE_CROWD} alt="paste and win" style={{filter:"brightness(.4)"}} fallback={T.gold}/>
        <div style={{position:"absolute",inset:0,
          background:"linear-gradient(135deg,rgba(245,158,11,.4),rgba(139,92,246,.25),rgba(11,17,27,.72))"}}/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"28px 32px"}}>
          <div style={{fontSize:11,color:T.gold,fontWeight:700,letterSpacing:3,marginBottom:8}}>
            🏆 PASTE & WIN
          </div>
          <div style={{fontSize:32,fontWeight:900,color:T.t1,letterSpacing:-1,marginBottom:8}}>
            Share Your Best. Win Real Money.
          </div>
          <div style={{fontSize:13,color:"rgba(255,255,255,.7)",maxWidth:560,lineHeight:1.7}}>
            Post your best podcast clip, comedy set or interview moment. The most liked and engaged content wins cash prizes every week and every month.
          </div>
        </div>
        <div style={{position:"absolute",top:16,right:16,display:"flex",gap:10}}>
          {[["Weekly Prize","$500",T.gold],["Monthly Grand","$2,000",T.purple]].map(([l,v,c])=>(
            <div key={l} style={{background:"rgba(13,15,19,0.75)",backdropFilter:"blur(24px) saturate(180%)",borderRadius:14,
              padding:"10px 16px",textAlign:"center",backdropFilter:"blur(18px) saturate(150%)",
              border:`1px solid ${c}30`}}>
              <div style={{fontSize:18,fontWeight:900,color:c}}>{v}</div>
              <div style={{fontSize:10,color:T.t2}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:8,marginBottom:20}}>
        {[["weekly","🗓 This Week"],["monthly","📅 This Month"],["submit","✚ Submit Entry"],["prizes","🏆 Prize Details"]].map(([id,l])=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{background:tab===id?"rgba(245,158,11,.15)":"rgba(255,255,255,.04)",
              border:`1px solid ${tab===id?T.gold:T.border}`,
              color:tab===id?T.gold:T.t2,padding:"9px 18px",
              borderRadius:20,fontSize:12,fontWeight:700,cursor:"pointer"}}>
            {l}
          </button>
        ))}
        <div style={{flex:1}}/>
        <div style={{background:"rgba(0,255,136,.08)",border:`1px solid ${T.green}25`,
          borderRadius:12,padding:"9px 16px",fontSize:12,color:T.green,fontWeight:700}}>
          ⏱ Weekly reset: {3} days left
        </div>
      </div>

      {/* LEADERBOARD */}
      {(tab==="weekly"||tab==="monthly")&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:20}}>
          <div>
            <div style={{background:T.panel,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:20,
              padding:22,backdropFilter:"blur(24px) saturate(180%)"}}>
              <div style={{fontSize:13,fontWeight:700,color:T.t1,marginBottom:16}}>
                {tab==="weekly"?"🗓 Weekly Leaderboard":"📅 Monthly Leaderboard"}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {LEADERBOARD.map(item=>(
                  <div key={item.rank} style={{display:"flex",alignItems:"center",gap:12,
                    padding:"14px 16px",background:item.rank===1?"rgba(245,158,11,.06)":"rgba(255,255,255,.02)",
                    border:`1px solid ${item.rank===1?T.gold+"40":T.border}`,
                    borderRadius:16,transition:"all .25s"}}
                    onMouseEnter={e=>{e.currentTarget.style.border=`1px solid ${T.gold}50`;e.currentTarget.style.transform="translateX(4px)";}}
                    onMouseLeave={e=>{e.currentTarget.style.border=`1px solid ${item.rank===1?T.gold+"40":T.border}`;e.currentTarget.style.transform="none";}}>

                    {/* Rank */}
                    <div style={{fontSize:item.rank<=3?24:16,fontWeight:900,
                      color:item.rank===1?T.gold:item.rank===2?T.t2:item.rank===3?"#B08A5A":T.t3,
                      minWidth:32,textAlign:"center",flexShrink:0}}>
                      {item.rank===1?"🥇":item.rank===2?"🥈":item.rank===3?"🥉":`#${item.rank}`}
                    </div>

                    {/* Thumbnail */}
                    <div style={{width:52,height:52,borderRadius:12,overflow:"hidden",flexShrink:0}}>
                      <ImgFallback src={item.img} alt={item.title} fallback={T.gold}/>
                    </div>

                    {/* Info */}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:700,color:T.t1,marginBottom:2,
                        whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.title}</div>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:11,color:T.t2}}>{item.country} {item.name}</span>
                        <Chip label={item.type} color={item.type==="Comedy"?T.pink:item.type==="Podcast"?T.cyan:T.purple}/>
                      </div>
                    </div>

                    {/* Votes + trend */}
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontSize:16,fontWeight:900,color:T.t1}}>{item.votes.toLocaleString()}</div>
                      <div style={{fontSize:10,color:T.green,fontWeight:700}}>{item.trend} today</div>
                    </div>

                    {/* Vote button */}
                    <button onClick={()=>voteFor(item.rank)}
                      style={{background:voted.includes(item.rank)?`${T.gold}18`:`linear-gradient(135deg,${T.gold},${T.orange})`,
                        border:`1px solid ${T.gold}`,borderRadius:10,
                        padding:"8px 14px",color:voted.includes(item.rank)?T.gold:"#000",
                        fontSize:11,fontWeight:700,cursor:"pointer",flexShrink:0,
                        opacity:voted.includes(item.rank)?.8:1}}>
                      {voted.includes(item.rank)?"✓ Voted":"👍 Vote"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Side panel — your entry status */}
          <div>
            <div style={{background:T.panel,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:20,
              padding:22,backdropFilter:"blur(24px) saturate(180%)",marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:700,color:T.gold,marginBottom:14}}>
                📊 Your Entry This Week
              </div>
              {submitted?(
                <div>
                  <div style={{background:`${T.green}10`,border:`1px solid ${T.green}30`,
                    borderRadius:12,padding:"14px",textAlign:"center",marginBottom:14}}>
                    <div style={{fontSize:20,marginBottom:6}}>✅</div>
                    <div style={{fontSize:13,fontWeight:700,color:T.green}}>Entry submitted!</div>
                    <div style={{fontSize:11,color:T.t2,marginTop:4}}>Voting ends in 3 days</div>
                  </div>
                  {[["Your rank","#47 of 312",T.t1],["Votes","128",T.cyan],["Trend","+34 today",T.green],["To top 10","Need 1,304 more votes",T.gold]].map(([l,v,c])=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",
                      padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
                      <span style={{fontSize:11,color:T.t2}}>{l}</span>
                      <span style={{fontSize:11,fontWeight:700,color:c}}>{v}</span>
                    </div>
                  ))}
                </div>
              ):(
                <div>
                  <div style={{fontSize:11,color:T.t2,lineHeight:1.7,marginBottom:14}}>
                    You haven't submitted an entry this week yet. Share your best content and compete for $500!
                  </div>
                  <Btn color={T.gold} filled onClick={()=>setTab("submit")} style={{width:"100%"}}>
                    ✚ Submit My Entry
                  </Btn>
                </div>
              )}
            </div>

            <div style={{background:`${T.purple}0A`,border:`1px solid ${T.purple}25`,
              borderRadius:18,padding:20}}>
              <div style={{fontSize:12,fontWeight:700,color:T.purple,marginBottom:10}}>
                📋 How Voting Works
              </div>
              {["Each week resets Monday 00:00 UTC","Every user gets 3 votes per week","You can vote once per entry","Most votes by Sunday wins","Monthly winner = most votes across all 4 weeks"].map((r,i)=>(
                <div key={i} style={{display:"flex",gap:8,marginBottom:8}}>
                  <span style={{color:T.purple,fontSize:11,flexShrink:0}}>→</span>
                  <span style={{fontSize:11,color:T.t2}}>{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBMIT */}
      {tab==="submit"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:20}}>
          <div style={{background:T.panel,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:20,
            padding:24,backdropFilter:"blur(24px) saturate(180%)"}}>
            <div style={{fontSize:14,fontWeight:700,color:T.t1,marginBottom:18}}>
              ✚ Submit Your Entry
            </div>

            <div style={{marginBottom:14}}>
              <div style={{fontSize:10,color:T.t2,fontWeight:600,letterSpacing:1,
                textTransform:"uppercase",marginBottom:6}}>Content Type</div>
              <div style={{display:"flex",gap:8}}>
                {["podcast","comedy","interview","clip"].map(t=>(
                  <button key={t} onClick={()=>setEntry(e=>({...e,type:t}))}
                    style={{background:entry.type===t?"rgba(245,158,11,.15)":"rgba(255,255,255,.04)",
                      border:`1px solid ${entry.type===t?T.gold:T.border}`,
                      color:entry.type===t?T.gold:T.t2,
                      padding:"7px 14px",borderRadius:20,fontSize:11,fontWeight:700,
                      cursor:"pointer",textTransform:"capitalize"}}>{t}</button>
                ))}
              </div>
            </div>

            {[["title","Entry Title","e.g. Why We're All Clowns",false],
              ["desc","Description","Tell us what makes this entry special...",true],
              ["url","Content URL","Link to your episode, clip or post",false]].map(([k,l,ph,m])=>(
              <div key={k} style={{marginBottom:14}}>
                <div style={{fontSize:10,color:T.t2,fontWeight:600,letterSpacing:1,
                  textTransform:"uppercase",marginBottom:6}}>{l}</div>
                {m?(
                  <textarea value={entry[k]} onChange={e=>setEntry(f=>({...f,[k]:e.target.value}))}
                    placeholder={ph} rows={3}
                    style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",
                      borderRadius:10,padding:"10px 14px",color:T.t1,fontSize:12,outline:"none",
                      resize:"vertical",fontFamily:"inherit",boxSizing:"border-box"}}/>
                ):(
                  <input value={entry[k]} onChange={e=>setEntry(f=>({...f,[k]:e.target.value}))}
                    placeholder={ph}
                    style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",
                      borderRadius:10,padding:"10px 14px",color:T.t1,fontSize:12,outline:"none",
                      boxSizing:"border-box"}}/>
                )}
              </div>
            ))}

            <Btn color={T.gold} filled onClick={()=>{
              if(entry.title&&entry.desc){setSubmitted(true);setTab("weekly");}
            }} style={{width:"100%",padding:"13px",fontSize:13}}>
              🏆 Submit Entry — Compete for $500
            </Btn>
            <div style={{fontSize:11,color:T.t3,textAlign:"center",marginTop:10}}>
              One entry per week per creator · Entries judged by community votes
            </div>
          </div>

          <div style={{background:T.panel,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:18,
            padding:22,backdropFilter:"blur(24px) saturate(180%)",alignSelf:"start"}}>
            <div style={{fontSize:12,fontWeight:700,color:T.gold,marginBottom:14}}>💡 Tips to Win</div>
            {["Make the thumbnail eye-catching — people vote on what they see first",
              "Write a compelling description — tell the story behind the content",
              "Share your entry link with your existing audience to get early votes",
              "Comedy and personal stories consistently outperform everything else",
              "Post your entry on Monday for maximum voting time"].map((t,i)=>(
              <div key={i} style={{display:"flex",gap:8,marginBottom:10}}>
                <span style={{color:T.gold,fontSize:11,flexShrink:0,marginTop:2}}>{i+1}.</span>
                <span style={{fontSize:11,color:T.t2,lineHeight:1.6}}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRIZES */}
      {tab==="prizes"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
          {[["weekly","🗓 Weekly Prizes"],["monthly","📅 Monthly Grand Prizes"]].map(([key,title])=>(
            <div key={key} style={{background:T.panel,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",
              borderRadius:20,padding:22,backdropFilter:"blur(24px) saturate(180%)"}}>
              <div style={{fontSize:14,fontWeight:700,color:T.t1,marginBottom:16}}>{title}</div>
              {PRIZES[key].map(p=>(
                <div key={p.rank} style={{display:"flex",gap:12,padding:"14px",
                  background:`${p.color}08`,border:`1px solid ${p.color}25`,
                  borderRadius:14,marginBottom:10}}>
                  <div style={{fontSize:28,flexShrink:0}}>{p.icon}</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:p.color,marginBottom:4}}>
                      Rank #{p.rank}
                    </div>
                    <div style={{fontSize:12,color:T.t2,lineHeight:1.6}}>{p.prize}</div>
                  </div>
                </div>
              ))}
              {key==="monthly"&&(
                <div style={{background:`${T.cyan}08`,border:`1px solid ${T.cyan}20`,
                  borderRadius:12,padding:"12px",marginTop:8}}>
                  <div style={{fontSize:11,color:T.cyan,fontWeight:700,marginBottom:4}}>
                    🌍 Special: Global Reach Prize
                  </div>
                  <div style={{fontSize:11,color:T.t2,lineHeight:1.6}}>
                    The entry with the most plays across translated languages wins an additional $300 bonus — rewarding creators who reach global audiences.
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WelcomeModal({brand,onSelect}){
  const [hov,setHov]=useState(null);
  return <div style={{position:"fixed",inset:0,zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,0.06)",backdropFilter:"blur(20px)"}}>
    <div style={{background:T.panel,border:`1px solid ${T.borderHi}`,borderRadius:26,padding:"40px 44px",maxWidth:680,width:"92%",backdropFilter:"blur(30px)",boxShadow:"0 40px 120px rgba(0,0,0,.8)"}}>
      <div style={{textAlign:"center",marginBottom:24}}>
        {brand.logoUrl
          ?<img src={brand.logoUrl} alt={brand.name} style={{height:48,objectFit:"contain",marginBottom:10}} onError={e=>e.target.style.display="none"}/>
          :<div style={{fontSize:36,fontWeight:900,color:T.t1,letterSpacing:-1,marginBottom:4,background:`linear-gradient(90deg,${brand.accentColor||T.cyan},${T.purple},${T.pink})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{brand.name}</div>
        }
        <div style={{fontSize:13,color:T.t2}}>{brand.tagline}</div>
      </div>
      <div style={{fontSize:14,color:T.t2,textAlign:"center",marginBottom:24,lineHeight:1.8}}>
        Zero barriers. Zero pay walls.<br/><span style={{color:T.gold,fontWeight:700}}>Earn from Day 1 — no follower minimum. No exceptions.</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:22}}>
        {[
          {type:"visitor",title:"Visitor / Listener",color:T.cyan,img:IMG_LIVE_CROWD,
           perks:["Watch & listen — always FREE","Comment, react & share","Follow your favourite creators","Join live chats & Hot Seat","Earn PodCoins just by watching","Upgrade to Creator anytime, free"]},
          {type:"creator",title:"Creator / Host",color:T.pink,img:IMG_STUDIO_BLUE,
           perks:["Start your show — 100% FREE","Earn from your very first view","Podcast, comedy, interview — any format","Live streaming built right in","AI show assistant included","Brand deals & PodCoins from Day 1"]},
        ].map(opt=>(
          <div key={opt.type} onClick={()=>onSelect(opt.type)} onMouseEnter={()=>setHov(opt.type)} onMouseLeave={()=>setHov(null)}
            style={{borderRadius:18,overflow:"hidden",border:`2px solid ${hov===opt.type?opt.color:T.border}`,cursor:"pointer",transition:"all .3s",transform:hov===opt.type?"scale(1.02)":"none",boxShadow:hov===opt.type?`0 0 36px ${opt.color}28`:"none"}}>
            <div style={{height:90,position:"relative",overflow:"hidden"}}>
              <ImgFallback src={opt.img} alt={opt.title} style={{filter:"brightness(.4)"}} fallback={opt.color}/>
              <div style={{position:"absolute",inset:0,background:`linear-gradient(to bottom,transparent,rgba(16,18,22,.96))`}}/>
              <div style={{position:"absolute",bottom:10,left:14,fontSize:14,fontWeight:900,color:T.t1}}>{opt.title}</div>
            </div>
            <div style={{padding:"14px 16px",background:"rgba(8,6,18,0.88)",backdropFilter:"blur(48px) saturate(180%)"}}>
              {opt.perks.map((p,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:6}}><span style={{color:opt.color,fontSize:11,flexShrink:0}}>✓</span><span style={{fontSize:11,color:T.t2}}>{p}</span></div>)}
              <div style={{marginTop:12,padding:"10px",background:`${opt.color}18`,border:`1px solid ${opt.color}40`,borderRadius:10,fontSize:12,fontWeight:700,color:opt.color,textAlign:"center"}}>
                Join as {opt.title.split("/")[0].trim()} — Free →
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{textAlign:"center",fontSize:11,color:T.t3}}>🔒 No credit card · No pay walls · No follower minimum · Switch roles anytime</div>
    </div>
  </div>;
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function PodChat(){
  const [content,setContent]=useState(loadContent);
  const [page,setPage]=useState("home");
  const [profile,setProfile]=useState(null);
  const [coins,setCoins]=useState(2840);
  const [time,setTime]=useState(null);
  const [user,setUser]=useState(null);
  const [showSearch,setShowSearch]=useState(false);
  const [showNotifs,setShowNotifs]=useState(false);
  const [audioTrack,setAudioTrack]=useState(null);
  const [unreadCount,setUnreadCount]=useState(3);
  const isAdmin = user?.type==="admin";

  useEffect(()=>{ setTime(new Date()); const t=setInterval(()=>setTime(new Date()),1000); return()=>clearInterval(t); },[]);
  useEffect(()=>{
    const h=(e)=>{ if((e.metaKey||e.ctrlKey)&&e.key==="k"){e.preventDefault();setShowSearch(s=>!s);} if(e.key==="Escape"){setShowSearch(false);setShowNotifs(false);} };
    window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h);
  },[]);

  const TITLES={home:"Home",live:"Live Now",trending:"Hot Trends",hustle:"Side Hustles",podcasts:"Podcasts",comedy:"Comedy Hub",interviews:"Interviews",studio:"My Studio",ai_studio:"AI Studio",wallet:"PodCoins Wallet",cms:"Content Manager",translate:"AI Translation",hotseat:"Live Hot Seat",analytics:"Creator Analytics",marketplace:"Guest & Brand Marketplace",comedy_formats:"Comedy Formats",simulcast:"Simulcast HQ",revenue:"Revenue Dashboard",ownership:"Content Ownership"};

  const SCREENS={
    home:       <HomeScreen content={content} setPage={setPage}/>,
    live:       <LiveScreen content={content}/>,
    trending:   <TrendingScreen content={content}/>,
    hustle:     <HustleScreen content={content}/>,
    podcasts:   <PodcastsScreen content={content}/>,
    comedy:     <ComedyScreen content={content}/>,
    interviews: <InterviewsScreen content={content}/>,
    studio:     <StudioScreen/>,
    ai_studio:  <AIStudioScreen shows={content.shows}/>,
    wallet:     <WalletScreen podCoins={coins} setPodCoins={setCoins}/>,
    cms:        isAdmin?<CMSScreen content={content} setContent={setContent}/>:<RestrictedScreen/>,
 
    translate:    <TranslationScreen/>,
    hotseat:      <HotSeatScreen/>,
    analytics:    <AnalyticsScreen/>,
    marketplace:  <MarketplaceScreen/>,
    comedy_formats:<ComedyFormatsScreen/>,
    simulcast:    <SimulcastScreen/>,
    revenue:      <RevenueDashboardScreen podCoins={coins} setPodCoins={setCoins}/>,
    ownership:    <OwnershipScreen/>,
    pastewin:     <PasteWinScreen user={user}/>,
    search:       null,
   };

  const acc=content.brand.accentColor||T.cyan;
  const playTrack=(item)=>setAudioTrack({title:item.title||item.name,host:item.host||item.specialty||"PodChat",color:item.color||T.cyan});

  return <div style={{minHeight:"100vh",background:"radial-gradient(ellipse at 12% -10%, #1a2438 0%, #121a29 42%, #0B111B 100%)",fontFamily:"'Manrope', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",color:T.t1,display:"flex",position:"relative",overflow:"hidden"}}>
    {!user&&<AuthScreen onAuth={(u)=>{setUser(u);if(!profile)setProfile(u.type);}}/>}
      {user&&!profile&&<WelcomeModal brand={content.brand} onSelect={setProfile}/>}
      {showSearch&&<SearchOverlay content={content} onClose={()=>setShowSearch(false)} onNavigate={(p)=>{setPage(p);setShowSearch(false);}}/>}
      <NotificationDrawer open={showNotifs} onClose={()=>setShowNotifs(false)} setPage={setPage}/>
      <AudioPlayerBar track={audioTrack} onClose={()=>setAudioTrack(null)}/>
    <Orb x="10%"  y="15%"  color="#8FA8DE" size={800}  opacity={0.18}/>
    <Orb x="75%"  y="8%"   color="#5A78C8" size={600}  opacity={0.14}/>
    <Orb x="88%"  y="60%"  color="#D2687A" size={500}  opacity={0.12}/>
    <Orb x="20%"  y="75%"  color="#7FA6F0" size={450}  opacity={0.10}/>
    <Orb x="50%"  y="40%"  color="#8FA8DE" size={350}  opacity={0.06}/>

    {/* SIDEBAR */}
    <div style={{width:72,background:"rgba(255,255,255,0.05)",backdropFilter:"blur(40px) saturate(180%)",borderRight:"1px solid rgba(255,255,255,0.12)",boxShadow:"4px 0 24px rgba(0,0,0,0.4), inset -1px 0 0 rgba(255,255,255,0.08)",display:"flex",flexDirection:"column",alignItems:"center",padding:"16px 0",gap:2,position:"fixed",left:0,top:0,bottom:0,backdropFilter:"blur(30px)",zIndex:100,overflowY:"auto",scrollbarWidth:"none",msOverflowStyle:"none"}}>
      <div onClick={()=>setPage("home")} style={{width:42,height:42,borderRadius:12,overflow:"hidden",marginBottom:18,cursor:"pointer",boxShadow:`0 10px 24px rgba(0,0,0,0.35)`,flexShrink:0,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)"}}>
        {content.brand.logoUrl
          ?<img src={content.brand.logoUrl} alt={content.brand.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          :<div style={{width:"100%",height:"100%",position:"relative",overflow:"hidden"}}><img src={IMG_STUDIO_DRAMATIC} alt="PodChat" style={{width:"100%",height:"100%",objectFit:"cover",filter:"brightness(.8) saturate(1.4)"}}/><div style={{position:"absolute",inset:0,background:`linear-gradient(135deg,${acc}55,transparent)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:900,color:"#fff",textShadow:"0 1px 4px rgba(0,0,0,.8)"}}>{(content.brand.name||"P")[0]}</div></div>
        }
      </div>
      {NAV.filter(n=>n.id!=="cms"||isAdmin).map(n=>(
        <div key={n.id} onClick={()=>setPage(n.id)} title={n.label}
          style={{width:48,height:48,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",position:"relative",transition:"all .2s",
            background:page===n.id?`${acc}18`:"transparent",
            border:`1px solid ${page===n.id?acc+"45":"transparent"}`,
            color:page===n.id?acc:"rgba(255,255,255,.28)"}}>
          {n.icon}
          {n.badge&&<div style={{position:"absolute",top:5,right:5,width:16,height:16,borderRadius:"50%",background:T.pink,fontSize:7,fontWeight:800,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>{n.badge}</div>}
        </div>
      ))}
    </div>

    {/* MAIN */}
    <div style={{marginLeft:72,flex:1,display:"flex",flexDirection:"column",minHeight:"100vh"}}>
      {/* TOPBAR */}
      <div style={{height:60,background:"rgba(16,18,22,.93)",borderBottom:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",padding:"0 22px",gap:14,backdropFilter:"blur(24px)",position:"sticky",top:0,zIndex:50}}>
        <div style={{flex:1,fontSize:12,fontWeight:700,color:T.t2,letterSpacing:2,textTransform:"uppercase"}}>{TITLES[page]||page}</div>
        <div style={{display:"flex",alignItems:"center",gap:8,background:T.glass,border:"1px solid rgba(175,200,240,0.16)",boxShadow:"0 18px 44px rgba(6,10,18,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",borderRadius:11,padding:"7px 12px",width:230,backdropFilter:"blur(18px) saturate(150%)"}}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color:T.t3,flexShrink:0}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span onClick={()=>setShowSearch(true)} style={{color:T.t3,fontSize:12,flex:1,cursor:"pointer"}}>Search PodChat…</span>
        </div>
        <div style={{fontSize:11,color:T.t3,fontFamily:"inherit",fontVariantNumeric:"tabular-nums",letterSpacing:.5}}>{time?time.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"}):"--:--:--"}</div>
        <div onClick={()=>setPage("wallet")} style={{display:"flex",alignItems:"center",gap:6,background:"rgba(245,158,11,.1)",border:"1px solid rgba(245,158,11,.3)",borderRadius:10,padding:"6px 11px",cursor:"pointer"}}>
          <span style={{fontSize:11,color:T.gold}}>◆</span>
          <span style={{fontSize:13,fontWeight:800,color:T.gold}}>{coins.toLocaleString()}</span>
          <span style={{fontSize:9,color:T.t3}}>PC</span>
        </div>
        <button onClick={openSupport} title="Support — wittyhub.co" style={{background:T.glass,border:"1px solid rgba(175,200,240,0.16)",borderRadius:10,padding:"8px 13px",color:T.t2,fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6,backdropFilter:"blur(18px)"}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
          Support
        </button>
        <button onClick={()=>setPage("live")} style={{background:`linear-gradient(135deg,${T.pink},${T.orange})`,border:"none",borderRadius:10,padding:"8px 15px",color:"#fff",fontSize:11,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
          <Dot color={T.t1}/>Go Live
        </button>
        {isAdmin&&<div onClick={()=>setPage("cms")} title="Admin · Manage Content" style={{width:32,height:32,borderRadius:8,background:page==="cms"?`${acc}18`:T.glass,border:`1px solid ${page==="cms"?acc:T.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:page==="cms"?acc:T.t3}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </div>}
      </div>

      <div style={{flex:1,padding:"24px 26px",overflowY:"auto",paddingBottom:audioTrack?"90px":"24px"}}>{SCREENS[page]||SCREENS["home"]}</div>

      <div style={{borderTop:"1px solid rgba(255,255,255,0.08)",padding:"9px 26px",display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(255,255,255,0.06)",backdropFilter:"blur(20px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:20,height:20,borderRadius:5,background:`linear-gradient(135deg,${acc},${T.purple})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:900,color:"#000"}}>{(content.brand.name||"P")[0]}</div>
          <span style={{fontSize:11,fontWeight:700,color:T.t2}}>{content.brand.name}</span>
          <span style={{fontSize:10,color:T.t3}}>© 2026 · Free to join. Free to earn.</span>
        </div>
        <div style={{display:"flex",gap:14}}>
          {["About","Creators","Brands"].map(l=><span key={l} style={{fontSize:10,color:T.t3,cursor:"pointer"}}>{l}</span>)}
          <span onClick={openSupport} title="Open Support — wittyhub.co" style={{fontSize:10,color:T.t2,cursor:"pointer",fontWeight:700}}>Support</span>
          <span onClick={()=>setPage("help")} style={{fontSize:10,color:T.t3,cursor:"pointer"}}>Help</span>
        </div>
        <div style={{fontSize:10,color:T.t3}}>Neural Engine v3.1</div>
      </div>
    </div>
  </div>;
}
