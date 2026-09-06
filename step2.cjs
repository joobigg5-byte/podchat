const fs = require("fs")
const f = "src/components/podchat/PodChat.jsx"
let c = fs.readFileSync(f, "utf8")
const before = c

// --- 1. add rowsToContent after loadContent ---
const loadLine = 'function loadContent(){ try{ const r=store.get(SKEY); if(r) return {...DEFAULT_CONTENT,...JSON.parse(r)}; }catch(_){} return DEFAULT_CONTENT; }'

const helper = `

/* Shapes database rows back into what the screens already expect, so the
   catalogue can come from the API without changing a single component. */
function rowsToContent(rows, base){
  if(!Array.isArray(rows)||!rows.length) return base;
  const pick=k=>rows.filter(r=>r.kind===k);
  const img=r=>IMAGES[r.img_url]||r.img_url||"";
  const n=v=>v>=1000000?\`\${(v/1000000).toFixed(1)}M\`:v>=1000?\`\${Math.round(v/1000)}K\`:String(v||0);
  const live=pick("live");
  return {
    ...base,
    shows: pick("show").map(r=>({id:r.id,title:r.title,host:r.host,category:r.category,
      subscribers:n(r.subscribers),episodes:r.episode_count,imgUrl:img(r),color:r.color,description:r.description})),
    comedy: pick("comedy").map(r=>({id:r.id,name:r.title,specialty:r.category,
      subscribers:n(r.subscribers),episodes:r.episode_count,imgUrl:img(r),color:r.color,bio:r.description})),
    interviews: pick("interview").map(r=>({id:r.id,guest:r.category,host:r.host,topic:r.title,
      views:n(r.subscribers),date:"",imgUrl:img(r),color:r.color,hot:false})),
    highlights: live.length?live.map(r=>({id:r.id,title:r.title,host:r.host,
      description:r.description,category:r.category,imgUrl:img(r),badge:"LIVE",color:r.color,
      cta:"Watch Now",views:n(r.subscribers)+" watching"})):base.highlights,
  };
}`

if (!c.includes("function rowsToContent")) {
  c = c.replace(loadLine, loadLine + helper)
}

// --- 2. fetch the catalogue once on mount ---
const stateLine = "const [content,setContent]=useState(loadContent);"
const fetcher = stateLine + `
  // Catalogue comes from the API. Falls back to what is cached locally
  // if the request fails, so the app still renders offline.
  useEffect(()=>{
    let cancelled=false;
    fetch(\`\${API_BASE}/api/shows\`)
      .then(r=>r.ok?r.json():Promise.reject())
      .then(rows=>{ if(!cancelled) setContent(prev=>rowsToContent(rows,prev)); })
      .catch(()=>{});
    return ()=>{cancelled=true;};
  },[]);`

if (!c.includes("Catalogue comes from the@'
const fs = require("fs")
const f = "src/components/podchat/PodChat.jsx"
let c = fs.readFileSync(f, "utf8")
const before = c

// --- 1. add rowsToContent after loadContent ---
const loadLine = 'function loadContent(){ try{ const r=store.get(SKEY); if(r) return {...DEFAULT_CONTENT,...JSON.parse(r)}; }catch(_){} return DEFAULT_CONTENT; }'

const helper = `

/* Shapes database rows back into what the screens already expect, so the
   catalogue can come from the API without changing a single component. */
function rowsToContent(rows, base){
  if(!Array.isArray(rows)||!rows.length) return base;
  const pick=k=>rows.filter(r=>r.kind===k);
  const img=r=>IMAGES[r.img_url]||r.img_url||"";
  const n=v=>v>=1000000?\`\${(v/1000000).toFixed(1)}M\`:v>=1000?\`\${Math.round(v/1000)}K\`:String(v||0);
  const live=pick("live");
  return {
    ...base,
    shows: pick("show").map(r=>({id:r.id,title:r.title,host:r.host,category:r.category,
      subscribers:n(r.subscribers),episodes:r.episode_count,imgUrl:img(r),color:r.color,description:r.description})),
    comedy: pick("comedy").map(r=>({id:r.id,name:r.title,specialty:r.category,
      subscribers:n(r.subscribers),episodes:r.episode_count,imgUrl:img(r),color:r.color,bio:r.description})),
    interviews: pick("interview").map(r=>({id:r.id,guest:r.category,host:r.host,topic:r.title,
      views:n(r.subscribers),date:"",imgUrl:img(r),color:r.color,hot:false})),
    highlights: live.length?live.map(r=>({id:r.id,title:r.title,host:r.host,
      description:r.description,category:r.category,imgUrl:img(r),badge:"LIVE",color:r.color,
      cta:"Watch Now",views:n(r.subscribers)+" watching"})):base.highlights,
  };
}`

if (!c.includes("function rowsToContent")) {
  c = c.replace(loadLine, loadLine + helper)
}

// --- 2. fetch the catalogue once on mount ---
const stateLine = "const [content,setContent]=useState(loadContent);"
const fetcher = stateLine + `
  // Catalogue comes from the API. Falls back to what is cached locally
  // if the request fails, so the app still renders offline.
  useEffect(()=>{
    let cancelled=false;
    fetch(\`\${API_BASE}/api/shows\`)
      .then(r=>r.ok?r.json():Promise.reject())
      .then(rows=>{ if(!cancelled) setContent(prev=>rowsToContent(rows,prev)); })
      .catch(()=>{});
    return ()=>{cancelled=true;};
  },[]);`

if (!c.includes("Catalogue comes from the API")) {
  c = c.replace(stateLine, fetcher)
}

fs.writeFileSync(f, c)
console.log(c !== before ? "DONE" : "NO CHANGE - check patterns")
