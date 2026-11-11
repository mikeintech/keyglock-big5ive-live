/* BIG 5IVE LIVE hub. Edit CONFIG to update shows, songs, links and rules. */
const CONFIG = {
  seatedArtistId: '667b3d0e-313a-4e68-b5c1-ffb039565357',
  seatedWidgetId: 'seated-55fdf2c0',
  swshDefault: 'https://www.joinswsh.com/p/3e7f282059e04917b329cd2f585678e4',
  streaming: 'https://keyglock.lnk.to/projectx',
  // results: 'always' | 'after-vote' | 'after-close'
  resultsVisibility: 'after-vote',
  voteClosesHoursBefore: 2,           // voting closes this many hours before doors
  merchRadiusMeters: 400,             // venue radius for location unlock
  merchCodes: { /* per-city rotating codes, shown on venue screens */ },
  // PLACEHOLDER list until label sends the approved songs
  songs: ['Ambition For Cash','Mr. Glock','Russian Cream','Dig That','Proud Of Me','Since 9',
          'Yellow Tape','Gang Gang','Party Animal','Dirty Glock','Something Bout Me','Glockoma'],
  giveaway: { url: '#', legal: 'Official rules and eligibility to come. No purchase necessary.' },
};
// doors in local venue time with UTC offset
const SHOWS = [
  {slug:'phoenix',     city:'Phoenix',     st:'AZ', date:'2026-11-28T20:00:00-07:00', venue:'9th & Jackson',       ll:[33.4447,-112.0631]},
  {slug:'denver',      city:'Denver',      st:'CO', date:'2026-11-29T20:00:00-07:00', venue:'Summit Music Hall',   ll:[39.7553,-104.9970]},
  {slug:'dallas',      city:'Dallas',      st:'TX', date:'2026-12-08T20:00:00-06:00', venue:'House of Blues',      ll:[32.7843,-96.8090]},
  {slug:'houston',     city:'Houston',     st:'TX', date:'2026-12-09T20:00:00-06:00', venue:'House of Blues',      ll:[29.7536,-95.3612]},
  {slug:'san-antonio', city:'San Antonio', st:'TX', date:'2026-12-12T20:00:00-06:00', venue:'Aztec Theatre',       ll:[29.4268,-98.4925]},
  {slug:'washington',  city:'Washington',  st:'DC', date:'2026-12-16T20:00:00-05:00', venue:'The Howard Theatre',  ll:[38.9155,-77.0209]},
  {slug:'atlanta',     city:'Atlanta',     st:'GA', date:'2026-12-18T20:00:00-05:00', venue:'Tabernacle',          ll:[33.7588,-84.3915]},
];
// fingertip positions (% of hand image)
const SPOTS = [
  {st:'AZ', x:29.5, y:24.5}, {st:'CO', x:45, y:26}, {st:'TX', x:52.7, y:10.8, big:1},
  {st:'DC', x:64.5, y:27.5}, {st:'GA', x:80.2, y:30.2},
];
const MERCH = [
  {name:'City Tee', price:45}, {name:'City Hoodie', price:85}, {name:'Signed Poster', price:30},
];

/* ---------- data layer (swap for Supabase / CRM API) ---------- */
const DB = {
  get(k){ try{ return JSON.parse(localStorage.getItem('b5_'+k)) ?? [] }catch(e){ return [] } },
  add(k,row){ const a=DB.get(k); a.push(row); try{ localStorage.setItem('b5_'+k,JSON.stringify(a)) }catch(e){} return row },
};
const OPT_EMAIL = 'Yes, email me about Key Glock shows, music and merch. I can unsubscribe anytime.';
const OPT_SMS = 'Yes, text me about Key Glock shows, music and merch at the number above. Msg frequency varies. Msg & data rates may apply. Reply STOP to cancel, HELP for help. Consent is not a condition of purchase.';

/* ---------- helpers ---------- */
const $ = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const app = $('#app');
const esc = s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const md = s=>{const d=new Date(s);return `${d.getUTCMonth()+1}·${String(new Date(s).toLocaleString('en-US',{day:'2-digit',timeZone:'UTC'}))}`};
const mmdd = s=>s.slice(5,7)+'·'+s.slice(8,10);
const longDate = s=>new Date(s).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',timeZone:'America/Chicago'});
const closesAt = sh=>new Date(new Date(sh.date)-CONFIG.voteClosesHoursBefore*3600e3);
const STATES = {AZ:'Arizona',CO:'Colorado',TX:'Texas',DC:'Washington DC',GA:'Georgia'};

/* ---------- router ---------- */
let first = true;
function route(){
  const h = location.hash.replace(/^#\/?/,'');
  const [a,b0] = h.split('/'); const b=(b0||'').split('#')[0];
  closeSheet(); killMotion();
  document.body.dataset.view = a||'hub';
  document.querySelectorAll('.tabs a').forEach(t=>t.classList.toggle('on',
    t.dataset.tab===(a==='merch'?'merch':a==='music'?'music':'live')));
  if(a==='show' && SHOWS.find(s=>s.slug===b)) city(SHOWS.find(s=>s.slug===b));
  else if(a==='state' && STATES[b?.toUpperCase()]) statePage(b.toUpperCase());
  else if(a==='merch') merchPage();
  else if(a==='music') music();
  else if(a==='admin') admin();
  else hub();
  if(!location.hash.includes('#cmerch')) window.scrollTo(0,0);
  first = false;
}
addEventListener('hashchange',route);

function closeSheet(){ $('.sheet').classList.remove('open'); $('.scrim').classList.remove('on') }
$('.scrim').onclick = closeSheet;

const SHAPES = {"AZ": {"d": "M92.0,0.1L91.9,100.0L62.4,100.0L45.4,93.4L8.0,79.5L9.4,75.6L12.3,74.9L13.1,73.4L12.3,70.1L10.3,70.0L9.3,63.4L12.3,60.9L12.7,58.3L12.1,54.2L13.9,51.1L16.2,49.9L17.9,47.6L15.1,45.1L13.1,40.4L10.7,37.5L10.7,35.3L11.5,32.9L11.2,29.6L10.0,26.3L9.2,15.9L14.5,15.3L16.2,17.4L17.7,17.3L19.2,14.3L19.2,0.1L70.8,0.0L92.0,0.1Z", "cities": [[48.0, 62.8]]}, "CO": {"d": "M16.2,13.2L47.5,13.3L71.4,13.2L99.8,13.2L99.8,31.6L100.0,86.8L86.3,86.7L67.3,86.8L31.2,86.8L23.3,86.7L0.2,86.7L0.2,65.3L0.0,63.3L0.1,47.7L0.2,13.3L16.2,13.2Z", "cities": [[57.9, 36.1]]}, "DC": {"d": "M41.6,0.0L90.0,48.6L39.5,100.0L10.0,29.7L41.6,0.0Z", "cities": [[47.1, 38.7]]}, "GA": {"d": "M52.5,0.0L48.6,4.6L48.3,6.8L54.4,11.4L56.3,11.1L59.0,15.8L59.6,18.3L62.5,22.8L66.7,25.5L69.1,29.5L74.0,33.1L73.8,35.6L76.9,39.6L81.8,42.9L83.0,46.5L83.2,51.1L85.7,52.6L88.6,58.4L88.7,62.0L92.8,63.9L88.4,71.2L87.6,75.0L85.7,78.3L85.5,81.7L83.5,83.3L82.7,92.5L77.7,91.6L73.6,89.9L71.9,91.5L72.6,95.5L71.8,99.9L69.6,100.0L68.7,95.4L45.4,93.7L20.6,92.3L18.1,86.1L16.1,80.2L17.4,74.5L15.6,68.0L17.2,64.4L17.1,61.7L20.2,59.0L18.1,57.7L18.9,55.5L16.9,52.1L14.8,46.1L10.3,18.9L7.2,0.4L30.5,0.2L43.2,0.4L52.5,0.0Z", "cities": [[29.2, 26.7]]}, "TX": {"d": "M36.8,3.0L50.6,3.0L50.6,20.2L51.2,20.1L52.9,21.8L53.9,21.5L56.3,21.6L56.8,23.3L58.4,23.2L60.0,24.0L61.5,23.9L62.2,24.6L63.1,23.8L64.6,24.2L65.2,25.1L66.3,25.3L66.9,26.5L68.2,25.3L70.0,26.0L70.7,26.7L71.6,26.4L72.2,27.5L74.1,25.5L74.7,26.5L76.3,26.5L77.9,27.2L78.5,27.9L80.0,26.6L81.6,26.2L82.4,26.6L84.2,25.8L84.6,26.2L86.6,26.3L87.1,25.5L89.0,26.4L89.8,27.4L92.7,28.4L93.5,29.2L95.0,28.8L96.1,29.2L96.1,33.9L96.1,42.9L97.7,44.9L97.8,46.8L99.9,50.4L100.0,52.3L99.2,54.6L98.5,55.5L98.7,56.7L98.2,57.6L98.7,59.3L97.0,62.5L97.6,63.3L96.4,63.4L92.4,64.6L91.0,63.9L90.7,62.5L89.7,63.5L89.0,63.2L88.6,64.5L89.4,65.0L89.6,66.7L88.1,68.4L85.8,70.6L81.3,72.9L80.8,72.5L79.4,73.1L79.4,72.6L77.5,73.0L76.6,71.9L76.1,72.1L78.1,74.4L76.6,75.1L75.2,74.7L75.0,76.3L73.3,77.9L71.6,81.0L70.4,84.2L69.6,83.9L69.4,85.1L70.3,84.8L69.9,87.1L69.3,87.2L69.2,88.5L69.9,89.3L70.1,91.9L71.0,92.8L71.2,94.5L71.9,96.0L69.5,97.0L68.6,95.8L66.8,95.4L64.4,95.5L62.3,94.0L60.8,93.9L59.6,92.7L58.0,92.3L57.0,91.2L56.2,88.5L54.9,86.9L55.0,85.6L54.4,84.1L54.6,82.9L53.7,81.5L52.9,81.3L51.6,80.1L51.1,78.5L50.0,77.0L48.4,75.8L47.6,73.1L46.8,72.4L45.8,70.3L45.5,68.5L44.6,67.3L42.9,66.1L42.5,65.4L41.0,64.7L39.9,62.7L36.5,62.3L34.5,62.4L32.8,61.7L32.4,62.7L30.6,62.9L29.2,64.8L28.4,67.7L27.9,67.8L26.9,69.5L25.6,69.6L23.8,68.2L19.0,66.0L18.1,64.9L16.3,63.8L15.0,61.2L14.9,59.0L13.6,57.1L13.3,55.5L12.5,54.5L9.5,53.0L7.9,51.0L6.6,50.2L5.3,48.5L3.3,47.6L2.0,45.2L0.9,44.8L0.0,43.7L0.2,42.9L27.3,42.9L27.3,34.0L27.4,25.0L27.5,3.0L27.8,3.0L36.8,3.0Z", "cities": [[75.0, 35.9], [86.0, 62.8], [62.1, 65.6]]}};
let US = null;
// circular crop of the red relief map, state glowing inside, city pins
const bboxOf = d=>{ const n=d.match(/-?\d+(\.\d+)?/g).map(Number); let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for(let i=0;i<n.length;i+=2){ x0=Math.min(x0,n[i]);x1=Math.max(x1,n[i]);y0=Math.min(y0,n[i+1]);y1=Math.max(y1,n[i+1]) } return [x0,y0,x1,y1] };
let mcN=0;
function mapCircle(st,hi,zoomCity){
  if(!US) return '';
  const list=SHOWS.filter(s=>s.st===st); let [x0,y0,x1,y1]=bboxOf(US.states[st]);
  let cx=(x0+x1)/2, cy=(y0+y1)/2, r=Math.max(x1-x0,y1-y0)*.68;
  // close-in like DC: centred on the city (or the middle of TX's three), border only partly in frame
  let close=false;
  if(zoomCity){ [cx,cy]=US.cities[zoomCity]; r=60; close=true }
  else if(st==='DC'){ [cx,cy]=US.cities.washington; r=70; close=true }
  else r=Math.max(x1-x0,y1-y0)*.62;
  const id='mc'+(++mcN), ck=close?(zoomCity||'washington'):null;
  return `<svg class="mapc" viewBox="${cx-r} ${cy-r} ${2*r} ${2*r}" aria-hidden="true"><defs><clipPath id="${id}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath></defs>
    <g clip-path="url(#${id})"><image href="img/us-map.jpg" width="${US.w}" height="${US.h}"/>${(c=>c?`<image href="img/cmap/${ck}.jpg" x="${c[0]}" y="${c[1]}" width="${c[2]}" height="${c[3]}"/>`:'')(ck&&(US.crops||{})[ck])}<circle cx="${cx}" cy="${cy}" r="${r}" class="vig"/>
    <path class="on" d="${US.states[st]}"/>${list.map(s=>`<circle class="cpin${hi&&hi!==s.slug?' dim':''}" cx="${US.cities[s.slug][0]}" cy="${US.cities[s.slug][1]}" r="${r*.07}"/>`).join('')}</g>
    <circle class="ring" cx="${cx}" cy="${cy}" r="${r*.985}"/></svg>`;
}
const CIRCLES = new URLSearchParams(location.search).get('points')==='circles';
if(CIRCLES) document.documentElement.classList.add('circles');
const stateSvg = (st,hi,cls='')=>`<svg class="shape ${cls}" viewBox="-6 -6 112 112" aria-hidden="true"><path d="${SHAPES[st].d}"/>${SHAPES[st].cities.map(([x,y],i)=>{const sl=SHOWS.filter(s=>s.st===st)[i].slug;return `<circle class="pin${hi&&hi!==sl?' dim':''}" cx="${x}" cy="${y}" r="${st==='DC'?8:5}"/>`}).join('')}</svg>`;
let CREDITS={};
const credit = slug=>{ const c=CREDITS[slug]; return c?`<a class="credit" href="${c.source}" target="_blank" rel="noopener">Photo: ${esc(c.author)} · ${esc(c.license)}</a>`:'' };

/* ---------- motion: layered artwork that follows pointer / tilt ---------- */
let motionOff = [];
function killMotion(){ motionOff.forEach(f=>f()); motionOff=[] }
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
function stageHtml(extra=''){
  return `<div class="stage" aria-hidden="false">
    <div class="lp" data-d="-18"><div class="ly glow"><img src="img/glow-a.webp" class="ga" alt=""><img src="img/glow-b.webp" class="gb" alt=""></div></div>
    <div class="ly torch"></div>
    <div class="lp" data-d="10"><img class="ly hand" src="img/l-hand.webp" alt="Key Glock hand sign"></div>
    <div class="lp" data-d="24"><img class="ly big5" src="img/l-big5.webp" alt="BIG 5IVE"></div>
    <div class="lp" data-d="38"><img class="ly live" src="img/l-live.webp" alt="LIVE"></div>
    ${extra}
  </div>`;
}
function bindParallax(stage){
  if(!window.gsap||reduce) return;
  const lys=[...stage.querySelectorAll('[data-d]')].map(el=>({d:+el.dataset.d,
    x:gsap.quickTo(el,'x',{duration:.9,ease:'power3'}),y:gsap.quickTo(el,'y',{duration:.9,ease:'power3'}),
    r:gsap.quickTo(el,'rotationY',{duration:1.2,ease:'power3'})}));
  const torch=stage.querySelector('.torch');
  const move=(nx,ny,px,py)=>{ lys.forEach(l=>{l.x(nx*l.d);l.y(ny*l.d*.6);l.r(nx*l.d*.12)});
    if(torch&&px!=null){ torch.style.setProperty('--tx',px+'%'); torch.style.setProperty('--ty',py+'%') } };
  const pm=e=>{ const r=stage.getBoundingClientRect(); const px=(e.clientX-r.left)/r.width, py=(e.clientY-r.top)/r.height;
    move(px-.5,py-.5,px*100,py*100) };
  const om=e=>{ if(e.gamma==null) return; move(Math.max(-1,Math.min(1,e.gamma/30))*.5,Math.max(-1,Math.min(1,(e.beta-45)/30))*.5) };
  addEventListener('pointermove',pm); addEventListener('deviceorientation',om);
  // idle drift so it breathes even without input (phones without tilt access)
  const drift=gsap.to({t:0},{t:1,duration:7,repeat:-1,yoyo:true,ease:'sine.inOut',onUpdate(){ if(!stage.matches(':hover')){ const t=this.targets()[0].t; move((t-.5)*.5,Math.sin(t*3)*.15) } }});
  motionOff.push(()=>{ removeEventListener('pointermove',pm); removeEventListener('deviceorientation',om); drift.kill() });
}

/* ---------- hub ---------- */
function hub(){
  const intro = first && !reduce;
  app.innerHTML = `
  <section class="landing${intro?' intro':''}">
    <div class="stagewrap">
      ${stageHtml(SPOTS.map((p,i)=>`<button class="spot${p.big?' big':''}" style="left:${p.x}%;top:${p.y}%;--d:${i*.4}s" data-st="${p.st}" aria-label="${STATES[p.st]}: ${SHOWS.filter(s=>s.st===p.st).length} show${SHOWS.filter(s=>s.st===p.st).length>1?'s':''}"><i>${CIRCLES?'':mapCircle(p.st)}</i><b>${p.st}<small>${SHOWS.filter(s=>s.st===p.st).length>1?'3 cities':SHOWS.find(s=>s.st===p.st).city}</small></b></button>`).join(''))}
    </div>
    <p class="tagline"><span>5 States.</span> <span>5 Fingers.</span> <span class="red">Pick your city.</span></p>
    <div class="chips" role="list" aria-label="Pick a state">${SPOTS.map(p=>`<button class="chip" data-st="${p.st}" role="listitem">${p.st}<small>${SHOWS.filter(s=>s.st===p.st).length>1?SHOWS.filter(s=>s.st===p.st).length+' dates':mmdd(SHOWS.find(s=>s.st===p.st).date)}</small></button>`).join('')}</div>
    <a class="scrollcue" href="#dates" aria-label="See all dates">All dates ↓</a>
  </section>
  <section class="wrap" id="dates">
    <p class="kick">BIG 5IVE LIVE</p>
    <h2 class="disp">7 nights.<br><span class="red">5 states.</span></h2>
    <ul class="dates">${SHOWS.map(s=>`<li><a href="#/show/${s.slug}"><span class="d">${mmdd(s.date)}</span><span><span class="c">${s.city}, ${s.st}</span><span class="v">${esc(s.venue)}</span></span><span class="go">${phase(s)==='after'?'Recap':'Tickets'}</span></a></li>`).join('')}</ul>
  </section>
  <section class="wrap phases">
    <p class="kick">Every city page lives three lives</p>
    <div class="ph-grid">
      <div class="ph-card"><b>01</b><h3 class="disp">Before</h3><p class="body">Tickets, countdown, set list voting, merch previews, giveaway entry.</p></div>
      <div class="ph-card hot"><b>02</b><h3 class="disp">Live</h3><p class="body">Vote results drop, fan uploads, in-venue merch unlocks.</p></div>
      <div class="ph-card"><b>03</b><h3 class="disp">After</h3><p class="body">Photo and video memories, the songs played, recaps.</p></div>
    </div>
  </section>
  <section class="wrap"><video src="video/trailer.mp4" autoplay muted loop playsinline style="width:100%;border-radius:6px"></video></section>
  <section class="wrap" id="request">
    <p class="kick">Not on the list?</p>
    <h2 class="disp">Request<br>your city</h2>
    ${requestForm()}
  </section>`;
  const stage=$('.stage');
  bindParallax(stage);
  const torch=$('.torch',stage);
  app.querySelectorAll('.spot').forEach(b=>{
    b.onpointerenter=()=>{ stage.classList.add('aim'); torch.style.setProperty('--tx',b.style.left); torch.style.setProperty('--ty',b.style.top); b.classList.add('hot') };
    b.onpointerleave=()=>{ stage.classList.remove('aim'); b.classList.remove('hot') };
  });
  app.querySelectorAll('.spot,.chip').forEach(b=>b.onclick=e=>pickState(b.dataset.st,e));
  bindRequest();
  if(window.gsap){
    const tl=gsap.timeline();
    if(intro){
      tl.from('.stage .glow',{opacity:0,duration:1.6,ease:'power1.in'})
        .from('.stage .hand',{opacity:0,scale:1.12,filter:'blur(14px)',duration:1.4,ease:'power3.out'},'-=1')
        .from('.stage .big5',{opacity:0,y:30,duration:.7,ease:'power4.out'},'-=.5')
        .from('.stage .live',{opacity:0,x:-120,skewX:-25,duration:.6,ease:'power4.out'},'-=.4');
    } else tl.from('.stage .ly',{opacity:0,duration:.5,stagger:.06});
    tl.from('.spot',{scale:0,opacity:0,duration:.55,stagger:.1,ease:'back.out(2.4)'},'-=.2')
      .from('.tagline span',{opacity:0,y:14,duration:.5,stagger:.25},'-=.3');
    gsap.fromTo('.chip',{opacity:0,y:10},{opacity:1,y:0,duration:.4,stagger:.05,delay:intro?3.2:.5,clearProps:'transform'});
  }
}

/* finger tap → artwork reacts → full-screen state reveal */
// US relief map (NASA Blue Marble, tinted) + state borders in the same pixel space

const mapImg = new Image(); mapImg.src = 'img/us-map.jpg';
function pickState(st,e){
  const list=SHOWS.filter(s=>s.st===st);
  const dest = list.length>1 ? '#/state/'+st.toLowerCase() : '#/show/'+list[0].slug;
  if(!window.gsap||reduce||!US){ location.hash=dest; return }
  const spot=$(`.spot[data-st="${st}"]`); const r=(spot||e.currentTarget).getBoundingClientRect();
  const cx=r.left+r.width/2, cy=r.top+r.height/2;
  const label = list.length>1?STATES[st]:list[0].city;
  const w=document.createElement('div'); w.className='wipe';
  w.innerHTML=`<div class="cam" style="width:${US.w}px;height:${US.h}px">
      <img src="img/us-map.jpg" alt="">
      <svg viewBox="0 0 ${US.w} ${US.h}" class="borders">${Object.entries(US.states).map(([k,d])=>`<path class="${k===st?'on':''}" d="${d}"/>`).join('')}
        ${list.map(s=>`<circle class="cpin" cx="${US.cities[s.slug][0]}" cy="${US.cities[s.slug][1]}" r="9"/>`).join('')}</svg>
    </div>
    <div class="maplabel disp">${STATES[st]}</div>
`;
  w.style.setProperty('--cx',cx+'px'); w.style.setProperty('--cy',cy+'px');
  document.body.appendChild(w);
  // camera: fit whole US, then fit the state's box
  const cam=$('.cam',w), path=$('.borders .on',w), bb=path.getBBox(), W=innerWidth, H=innerHeight;
  const fit=(x,y,bw,bh,pad)=>{ const sc=Math.min(W/(bw*pad),H/(bh*pad)); return {s:sc,x:W/2-(x+bw/2)*sc,y:H/2-(y+bh/2)*sc} };
  const us=fit(0,US.h*.05,US.w,US.h*.85,1.02), zs=fit(bb.x,bb.y,bb.width,bb.height,st==='DC'?14:1.7);
  const v={...us}; const apply=()=>cam.style.transform=`translate(${v.x}px,${v.y}px) scale(${v.s})`; apply();
  const len=path.getTotalLength(); path.style.strokeDasharray=len; path.style.strokeDashoffset=len;
  const lab=$('.maplabel',w);
  // one fast move: US -> state glows -> dive into the city pin -> page is already there, settling in
  const tgt=list.map(x=>US.cities[x.slug]); const tx=tgt.reduce((a,p)=>a+p[0],0)/tgt.length, ty=tgt.reduce((a,p)=>a+p[1],0)/tgt.length;
  const dive={s:zs.s*7,x:W/2-tx*zs.s*7,y:H/2-ty*zs.s*7};
  const fx0=(-us.x+W/2)/us.s, fy0=(-us.y+H/2)/us.s;           // map point at screen centre, US view
  const p={t:0}, ls0=Math.log(us.s), ls1=Math.log(dive.s);
  const zoom=()=>{ const t=p.t, c=gsap.parseEase('power3.out')(Math.min(1,t*1.5));
    v.s=Math.exp(ls0+(ls1-ls0)*t); const fx=fx0+(tx-fx0)*c, fy=fy0+(ty-fy0)*c;
    v.x=W/2-fx*v.s; v.y=H/2-fy*v.s; apply() };
  const tl=gsap.timeline();
  if(spot){ spot.classList.add('hot'); tl.to(spot,{scale:1.5,duration:.15,ease:'power2.out'},0) }
  tl.fromTo(w,{'--r':'20px'},{'--r':Math.hypot(W,H)+'px',duration:.3,ease:'power2.in'},0)
    .to(p,{t:1,duration:1.25,ease:'power1.in',onUpdate:zoom},.12)
    .to(path,{strokeDashoffset:0,duration:.45,ease:'power2.out'},.2)
    .fromTo(lab,{opacity:0,scale:.8,rotate:-12},{opacity:1,scale:1,rotate:-8,duration:.3,ease:'back.out(2)'},.35)
    .from($$('.cpin',w),{scale:0,transformOrigin:'50% 50%',stagger:.05,duration:.22,ease:'back.out(3)'},.55)
    .to(lab,{opacity:0,scale:1.8,duration:.35,ease:'power2.in'},.85)
    .call(()=>{ location.hash=dest },null,1.3)
    .to(w,{opacity:0,duration:.3,ease:'power1.out',onComplete:()=>w.remove()},1.34)
    .call(()=>gsap.fromTo('#app',{scale:1.15,filter:'blur(5px)'},{scale:1,filter:'blur(0px)',duration:.5,ease:'power3.out',clearProps:'transform,filter',transformOrigin:'50% 30%'}),null,1.32);
}

/* ---------- state chapter (multi-date states) ---------- */
function statePage(st){
  const list=SHOWS.filter(s=>s.st===st);
  if(list.length===1){ location.replace('#/show/'+list[0].slug); return }
  app.innerHTML=`<section class="chapter">
    <div class="wrap chap-in">
      <a class="back" href="#/">← All states</a>
      <p class="kick">Chapter · ${st}</p>
      <div class="herostage">${stageHtml()}</div>
      <h1 class="disp mega">${splitChars(STATES[st])}</h1>
      <p class="chap-sub">${list.length} dates. ${list.length} cities. One BIG 5IVE LIVE.</p>
      <div class="night-cards">${list.map((s,i)=>`<a class="night" href="#/show/${s.slug}"><span class="nn">0${i+1}</span><span class="nd">${mmdd(s.date)}</span><span class="nc disp">${s.city}</span><span class="nv">${esc(s.venue)}</span><span class="nphase">${phaseLabel(s)}</span><span class="arrow">→</span></a>`).join('')}</div>
    </div></section>`;
  tilt('.night'); cityMotion();
  if(window.gsap&&!reduce){ gsap.from('.mega .ch',{yPercent:110,opacity:0,stagger:.04,duration:.7,ease:'power4.out'});
    gsap.from('.chap-sub,.night',{opacity:0,y:24,stagger:.1,duration:.6,delay:.35,ease:'power3.out'}) }
}
const splitChars = s=>[...s].map(c=>c===' '?'<span class="ch">&nbsp;</span>':`<span class="ch">${c}</span>`).join('');
function tilt(sel){
  if(reduce) return;
  document.querySelectorAll(sel).forEach(el=>{
    el.onpointermove=e=>{ const r=el.getBoundingClientRect(); const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      el.style.transform=`perspective(700px) rotateY(${x*10}deg) rotateX(${-y*10}deg) translateZ(0)`; el.style.setProperty('--mx',(x+.5)*100+'%'); el.style.setProperty('--my',(y+.5)*100+'%') };
    el.onpointerleave=()=>el.style.transform='';
  });
}

/* ---------- show phase: before / live / after ---------- */
let phaseOverride = new URLSearchParams(location.search).get('phase');
function phase(s){
  if(phaseOverride) return phaseOverride;
  const d=+new Date(s.date), n=Date.now();
  return n < d-3*3600e3 ? 'before' : n < d+8*3600e3 ? 'live' : 'after';
}
const phaseLabel = s=>({before:'On sale',live:'Live now',after:'Recap'})[phase(s)];

/* ---------- city chapter ---------- */
function city(s){
  const atl = s.slug==='atlanta', ph = phase(s);
  const tiles = [
    {id:'tix', ic:ICON.ticket, t:'Tickets', s:'via Seated', show:ph!=='after'},
    {id:'vote', ic:ICON.note, t:ph==='before'?'Build your 5':'Fan results', s:ph==='before'?'Fan-picked set list':'What ${city} voted'.replace('${city}',s.city)},
    {id:'content', ic:ICON.cam, t:ph==='after'?'Memories':'Fan content', s:'Powered by SWSH'},
    {id:'cmerch', ic:ICON.shirt, t:'City merch', s:ph==='live'?'Unlocked in venue':'Limited drop'},
    ...(atl?[{id:'give', ic:ICON.gift, t:'Bottega bag', s:'Atlanta giveaway'}]:[]),
  ].filter(t=>t.show!==false);
  const sections = {
    tix:`<section id="tix"><p class="kick">Tickets</p><h2 class="disp">Get in<br>the room</h2>
      <div class="panel"><div class="seated"><div id="${CONFIG.seatedWidgetId}" data-artist-id="${CONFIG.seatedArtistId}" data-css-version="4"></div></div></div></section>`,
    vote:`<section id="vote">${voteBlock(s)}</section>`,
    content:`<section id="content"><p class="kick">${ph==='after'?'You were there':'From the floor'}</p><h2 class="disp">${s.city}<br>${ph==='after'?'memories':'live'}</h2>
      <p class="body" style="color:var(--dim);margin-top:10px">${ph==='before'?'Opens on show night. Upload your photos and video from the floor.':ph==='live'?'Upload right now. Your clips land here in real time.':'Every photo and clip fans shared from the night.'}</p>
      <div class="panel"><iframe class="embed" src="${s.swsh||CONFIG.swshDefault}" title="${s.city} show photos and videos" loading="lazy" allow="camera;microphone;clipboard-write"></iframe></div></section>`,
    cmerch:`<section id="cmerch">${merchBlock(s)}</section>`,
  };
  const order = ph==='before'?['tix','vote','cmerch','content']:ph==='live'?['content','cmerch','vote','tix']:['content','vote','cmerch'];
  app.innerHTML = `
  <section class="chapter city-chap">
    <div class="wrap chap-in">
      <a class="back" href="${s.st==='TX'?'#/state/tx':'#/'}">← ${s.st==='TX'?'Texas':'All states'}</a>
      <p class="kick"><span class="pdot ${ph}"></span>${phaseLabel(s)} · ${longDate(s.date)}</p>
      <div class="herostage">${stageHtml()}<div class="minimap">${mapCircle(s.st,s.slug,s.slug)}</div></div>
      <h1 class="disp mega">${splitChars(s.city)}</h1>
      <p class="meta">${esc(s.venue)} · ${s.city}, ${s.st}</p>
      <div class="cdrow"><div style="flex:1">
      ${ph==='before'?`<div class="cd" data-to="${+new Date(s.date)}"><div><b>00</b><small>Days</small></div><div><b>00</b><small>Hrs</small></div><div><b>00</b><small>Min</small></div><div><b>00</b><small>Sec</small></div></div>`:
        ph==='live'?`<div class="livebar"><span class="pdot live"></span>Doors are open. Vote results, uploads and merch are unlocked.</div>`:
        `<div class="livebar">That night is in the books. Relive it below.</div>`}</div></div>
      <div class="tiles">${tiles.map((t,i)=>`<a class="tile" href="#${t.id}" data-jump="${t.id}" style="--i:${i}"><span class="tic">${t.ic}</span><b>${t.t}</b><small>${t.s}</small><span class="shine"></span></a>`).join('')}</div>
    </div>
  </section>
  <div class="wrap">
    ${order.map(k=>sections[k]).join('')}
    ${atl?`<section id="give"><div class="giveaway"><span class="gic">${ICON.gift}</span><p class="kick">Atlanta only</p><h2 class="disp">Win the<br>Bottega bag</h2>
      <p class="body" style="margin:12px 0 18px;color:var(--dim)">Christmas giveaway for the Tabernacle show.</p>
      <a class="btn" href="${CONFIG.giveaway.url}" target="_blank" rel="noopener">Enter now ↗</a>
      <p class="body" style="font-size:11px;color:var(--dim);margin-top:14px">${esc(CONFIG.giveaway.legal)}</p></div></section>`:''}
    <p class="tag" style="text-align:center;margin:10px 0 0">Preview phase: ${['before','live','after'].map(p=>`<a href="?phase=${p}${location.hash}" class="${ph===p?'red':''}" style="margin:0 6px">${p}</a>`).join('')}</p>
  </div>`;
  app.querySelectorAll('[data-jump]').forEach(a=>a.onclick=e=>{ e.preventDefault(); document.getElementById(a.dataset.jump)?.scrollIntoView({behavior:'smooth'}) });
  tilt('.tile'); cityMotion();
  countdown($('.cd'));
  if(sections.tix && ph!=='after') loadSeated();
  bindVote(s); bindMerch(s);
  if(window.gsap&&!reduce){
    gsap.from('.mega .ch',{yPercent:110,opacity:0,rotate:6,stagger:.05,duration:.8,ease:'power4.out'});
    gsap.from('.city-chap .meta,.city-chap .cd,.city-chap .livebar',{opacity:0,y:16,duration:.6,delay:.3,stagger:.1});
    gsap.from('.tile',{opacity:0,y:40,rotateX:-30,stagger:.08,duration:.7,delay:.45,ease:'power3.out'});
    reveal();
  }
  if(location.hash.includes('#cmerch')) setTimeout(()=>$('#cmerch')?.scrollIntoView(),300);
}
function cityMotion(){
  if(!window.gsap||reduce) return;
  const mm=$('.minimap'); bindParallax($('.herostage .stage'));
  if(mm) gsap.from(mm,{scale:0,opacity:0,duration:.7,delay:.6,ease:'back.out(1.8)'});
}
function countdown(el){
  if(!el) return; const b=el.querySelectorAll('b');
  const tick=()=>{ if(!document.body.contains(el)) return; let t=Math.max(0,el.dataset.to-Date.now())/1e3;
    [Math.floor(t/86400),Math.floor(t%86400/3600),Math.floor(t%3600/60),Math.floor(t%60)].forEach((v,i)=>{ const s=String(v).padStart(2,'0'); if(b[i].textContent!==s){ b[i].textContent=s; if(i===3&&window.gsap) gsap.fromTo(b[i],{y:-6,opacity:.4},{y:0,opacity:1,duration:.3}) } });
    setTimeout(tick,1000) }; tick();
}
function reveal(){
  const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ gsap.to(e.target,{opacity:1,y:0,duration:.8,ease:'power3.out'}); io.unobserve(e.target) } }),{threshold:.12});
  app.querySelectorAll('.wrap > section').forEach(s=>{ gsap.set(s,{opacity:0,y:40}); io.observe(s) });
  motionOff.push(()=>io.disconnect());
}
const ICON = {
  ticket:'<svg viewBox="0 0 24 24"><path d="M3 8a2 2 0 0 0 0 4v4h18v-4a2 2 0 0 1 0-4V4H3z" transform="rotate(-12 12 12)"/><path d="M14 5v14" stroke-dasharray="2 2" transform="rotate(-12 12 12)"/></svg>',
  note:'<svg viewBox="0 0 24 24"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg>',
  cam:'<svg viewBox="0 0 24 24"><path d="M3 7h4l2-3h6l2 3h4v13H3z"/><circle cx="12" cy="13" r="4"/></svg>',
  shirt:'<svg viewBox="0 0 24 24"><path d="M8 3 3 6l2 5 3-1v11h8V10l3 1 2-5-5-3a4 4 0 0 1-8 0z"/></svg>',
  gift:'<svg viewBox="0 0 24 24"><path d="M3 9h18v4H3zM5 13h14v8H5zM12 9v12M12 9C9 9 7 4 9.5 4S12 9 12 9s.5-5 2.5-5S15 9 12 9"/></svg>',
  crown:'<svg viewBox="0 0 24 24"><path d="M3 18h18L19 7l-4 5-3-7-3 7-4-5z"/></svg>',
};
function loadSeated(){
  const old = document.getElementById('seated-js'); if(old) old.remove();
  const sc = document.createElement('script'); sc.id='seated-js'; sc.src='https://widget.seated.com/app.js'; document.body.appendChild(sc);
}

/* ---------- Build Your 5 ---------- */
const voted = slug=>DB.get('votes').find(v=>v.city===slug && v.device===deviceId());
function deviceId(){ let id; try{ id=localStorage.getItem('b5_dev') }catch(e){} if(!id){ id=Math.random().toString(36).slice(2); try{localStorage.setItem('b5_dev',id)}catch(e){} } return id }
function voteBlock(s){
  const closed = Date.now()>closesAt(s) || phase(s)!=='before';
  const mine = voted(s.slug);
  return `<p class="kick">Select your set list</p><h2 class="disp">Build<br>your <span class="red">5</span></h2>
  <p class="body" style="color:var(--dim);margin-top:10px">Pick four tracks, then the <b style="color:var(--ink)">Fan-Picked Finale</b>, the song that closes the night in ${s.city}.</p>
  <p class="tag" style="margin-top:8px">${closed?'Voting closed':'Voting closes '+closesAt(s).toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}</p>
  <div class="panel record" id="vbox">${closed||mine?resultsHtml(s,mine):pickerHtml()}</div>`;
}
function pickerHtml(){
  return `<div class="slots">${[0,1,2,3,4].map(i=>`<button class="slot${i===4?' fin':''}" data-i="${i}" aria-label="${i===4?'Finale slot':'Track '+(i+1)}"><span class="sn">${i===4?ICON.crown:'0'+(i+1)}</span><span class="st">${i===4?'Fan-picked finale':'Track 0'+(i+1)}</span></button>`).join('')}</div>
  <p class="tag" id="pc" style="margin:16px 0 8px">Tap a song to drop it on Track 01</p>
  <div class="crate">${CONFIG.songs.map(t=>`<button class="song" data-t="${esc(t)}"><span class="play">▶</span><span>${esc(t)}</span><span class="plus">+</span></button>`).join('')}</div>
  <div class="picks-bar"><span class="tag" id="cnt">0/5</span><button class="btn" id="vsub" disabled>Lock in my 5</button></div>`;
}
function bindVote(s){
  const box = $('#vbox'); if(!box) return; let picks=[];
  const paint = ()=>{
    box.querySelectorAll('.slot').forEach((sl,i)=>{ sl.classList.toggle('full',!!picks[i]);
      $('.st',sl).textContent = picks[i] || (i===4?'Fan-picked finale':'Track 0'+(i+1)); sl.classList.toggle('next',i===picks.length) });
    box.querySelectorAll('.song').forEach(b=>{ const on=picks.includes(b.dataset.t); b.classList.toggle('on',on); b.disabled=!on&&picks.length>=5; $('.plus',b).textContent=on?'✓':'+' });
    const pc=$('#pc'); if(pc) pc.textContent = picks.length>=5?'Your 5 is set. Tap a track to swap it out.':picks.length===4?'Now pick your finale, the closing song':`Tap a song to drop it on Track 0${picks.length+1}`;
    $('#cnt').textContent=picks.length+'/5'; $('#vsub').disabled=picks.length<1;
  };
  box.onclick = e=>{
    const b = e.target.closest('.song'), sl=e.target.closest('.slot');
    if(b && !b.disabled){
      const i=picks.indexOf(b.dataset.t);
      if(i>-1){ picks.splice(i,1); paint(); return }
      const target=box.querySelectorAll('.slot')[picks.length]; picks.push(b.dataset.t);
      flyTo(b,target); paint();
      if(window.gsap) gsap.fromTo(target,{scale:.92},{scale:1,duration:.5,ease:'elastic.out(1,.5)',delay:.25});
    }
    if(sl && picks[+sl.dataset.i]){ picks.splice(+sl.dataset.i,1); paint() }
    if(e.target.closest('#vsub')){
      if(Date.now()>closesAt(s)) return;
      const row = DB.add('votes',{ts:new Date().toISOString(),city:s.slug,device:deviceId(),picks:picks.slice(0,4),finale:picks.length===5?picks[4]:''});
      box.innerHTML = resultsHtml(s,row,true);
      if(window.gsap){ gsap.from('.locked',{scale:1.3,opacity:0,rotate:-4,duration:.5,ease:'back.out(2)'}); gsap.from('.locked li',{x:-30,opacity:0,stagger:.08,delay:.2}) }
    }
    if(e.target.closest('#shr')) shareImage(s,voted(s.slug));
  };
}
function flyTo(from,to){
  if(!window.gsap||reduce) return;
  const a=from.getBoundingClientRect(), b=to.getBoundingClientRect();
  const g=from.cloneNode(true); g.className='song ghost'; Object.assign(g.style,{position:'fixed',left:a.left+'px',top:a.top+'px',width:a.width+'px',margin:0,zIndex:80});
  document.body.appendChild(g);
  gsap.to(g,{x:b.left-a.left,y:b.top-a.top,width:b.width,scale:.9,opacity:.2,duration:.45,ease:'power3.inOut',onComplete:()=>g.remove()});
}
function tally(slug){
  const t={}, f={}; DB.get('votes').filter(v=>v.city===slug).forEach(v=>{
    v.picks.forEach(p=>t[p]=(t[p]||0)+1); if(v.finale){ t[v.finale]=(t[v.finale]||0)+1; f[v.finale]=(f[v.finale]||0)+1 }});
  return {t,f};
}
function resultsHtml(s,mine,fresh){
  const closed = Date.now()>closesAt(s) || phase(s)!=='before';
  const show = CONFIG.resultsVisibility==='always' || (CONFIG.resultsVisibility==='after-vote'&&mine) || closed;
  const {t,f} = tally(s.slug); const tot = Math.max(1,...Object.values(t));
  const top = Object.entries(t).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const fin = Object.entries(f).sort((a,b)=>b[1]-a[1])[0];
  return `${mine?`<div class="locked"><span class="stamp">✓</span><h3 class="disp">${fresh?'Your 5 is locked in':'Your 5'}</h3><p class="tag">${s.city}</p>
    <ol>${mine.picks.map((p,i)=>`<li><b>0${i+1}</b>${esc(p)}</li>`).join('')}${mine.finale?`<li class="fin"><b>05</b>${esc(mine.finale)} <small>Fan-picked finale</small></li>`:''}</ol>
    <button class="btn" id="shr" style="width:100%;margin-top:14px">Share your set list ↗</button></div>`:''}
    ${show?`<p class="tag" style="margin-top:18px">${closed?'Final':'Live'} results · ${s.city}</p>${top.length?top.map(([n,c])=>`<div class="bar"><span>${esc(n)}</span><span class="red">${Math.round(c/tot*100)}%</span><span class="t"><i style="width:${c/tot*100}%"></i></span></div>`).join(''):'<p class="body" style="color:var(--dim)">No votes yet.</p>'}
    ${fin?`<p class="body" style="margin-top:14px">Leading finale: <b class="red">${esc(fin[0])}</b></p>`:''}`:'<p class="tag" style="margin-top:14px">Results reveal when voting closes.</p>'}`;
}
let handImg;
function shareImage(s,v){
  const c=document.createElement('canvas'); c.width=1080; c.height=1920; const x=c.getContext('2d');
  const draw=()=>{
    x.fillStyle='#000'; x.fillRect(0,0,1080,1920);
    const h=1080*handImg.height/handImg.width; x.globalAlpha=.55; x.drawImage(handImg,0,-80,1080,h); x.globalAlpha=1;
    const g=x.createLinearGradient(0,500,0,1100); g.addColorStop(0,'#0000'); g.addColorStop(1,'#000'); x.fillStyle=g; x.fillRect(0,500,1080,1420);
    x.textAlign='center'; x.fillStyle='#e3202a'; x.font='54px Bebas'; x.fillText('MY BIG 5 · '+s.city.toUpperCase(),540,980);
    x.fillStyle='#f3f0ea'; x.font='150px Compacta'; x.fillText('BIG 5IVE LIVE',540,1130);
    const list=[...v.picks.map((p,i)=>[String(i+1),p]),...(v.finale?[['F',v.finale]]:[])];
    list.forEach(([n,p],i)=>{const y=1280+i*112; x.fillStyle=n==='F'?'#fff':'#e3202a'; x.beginPath(); x.arc(200,y-22,38,0,7); x.fill();
      x.fillStyle=n==='F'?'#000':'#fff'; x.font='50px Bebas'; x.fillText(n,200,y-4); x.textAlign='left'; x.fillStyle='#f3f0ea'; x.font='72px Bebas'; x.fillText(p.toUpperCase(),270,y); x.textAlign='center'});
    x.fillStyle='#f3f0ea99'; x.font='40px Bebas'; x.fillText(`${mmdd(s.date)} · ${s.venue.toUpperCase()}`,540,1860);
    c.toBlob(async b=>{
      const file=new File([b],`big5-${s.slug}.png`,{type:'image/png'});
      const u=URL.createObjectURL(b); $('#vbox .share-wrap')?.remove();
      $('#vbox').insertAdjacentHTML('beforeend','<div class="share-wrap"></div>');
      if(navigator.canShare&&navigator.canShare({files:[file]})) navigator.share({files:[file],title:'My BIG 5'}).catch(()=>{});
      $('#vbox .share-wrap').insertAdjacentHTML('beforeend',`<img class="share-img" src="${u}" alt="Your set list story image"><p class="body" style="text-align:center;color:var(--dim);margin-top:8px"><a href="${u}" download="big5-${s.slug}.png">Save image</a> · long-press to save on phone</p>`);
    });
  };
  if(handImg) draw(); else { handImg=new Image(); handImg.onload=()=>document.fonts.ready.then(draw); handImg.src='img/hand.jpg' }
}

/* ---------- request your city ---------- */
function requestForm(){
  return `<form class="form" id="reqf" novalidate>
    <div class="row"><input name="city" placeholder="City" required autocomplete="address-level2"><input name="state" placeholder="State" required maxlength="2" autocomplete="address-level1"></div>
    <input name="email" type="email" placeholder="Email" required autocomplete="email">
    <input name="phone" type="tel" placeholder="Mobile number" autocomplete="tel">
    <label class="consent body"><input type="checkbox" name="optEmail"><span>${OPT_EMAIL}</span></label>
    <label class="consent body"><input type="checkbox" name="optSms"><span>${OPT_SMS}</span></label>
    <p class="body" style="color:var(--dim);font-size:12px">By submitting you agree to the Privacy Policy and Terms.</p>
    <button class="btn">Request my city</button>
    <p class="err body red"></p>
  </form>`;
}
function bindRequest(){
  const f = $('#reqf'); if(!f) return;
  f.onsubmit = e=>{
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f));
    const err = !d.city||!d.state ? 'Add your city and state.' :
      !/^\S+@\S+\.\S+$/.test(d.email) ? 'Add a valid email.' :
      d.optSms && !/\d{10}/.test(d.phone.replace(/\D/g,'')) ? 'Add a mobile number to get texts.' : '';
    if(err){ $('.err',f).textContent = err; return }
    DB.add('requests',{ts:new Date().toISOString(),city:d.city,state:d.state.toUpperCase(),email:d.email,phone:d.phone,
      emailOptIn:!!d.optEmail,smsOptIn:!!d.optSms,emailConsentText:d.optEmail?OPT_EMAIL:'',smsConsentText:d.optSms?OPT_SMS:'',
      source:'request-city',page:location.href,ua:navigator.userAgent});
    f.outerHTML = `<div class="ok"><h3 class="disp" style="font-size:44px">${esc(d.city)} heard.</h3><p class="body" style="margin-top:8px;color:var(--dim)">Your request is in. ${d.optSms?'Watch your texts':d.optEmail?'Watch your inbox':'Check back here'} for new BIG 5IVE LIVE dates.</p></div>`;
  };
}

/* ---------- city merch ---------- */
function merchWindow(s){ const d=new Date(s.date); return [new Date(+d-3*3600e3), new Date(+d+6*3600e3)] }
const unlocked = slug=>DB.get('unlocks').some(u=>u.city===slug&&u.device===deviceId());
function merchBlock(s){
  const [o,cl]=merchWindow(s); const now=Date.now(); const live=now>=o&&now<=cl; const open=unlocked(s.slug);
  return `<p class="kick">${s.city} exclusive · show night only</p><h2 class="disp">City<br>merch</h2>
  <p class="body" style="color:var(--dim);margin-top:10px">Made for ${s.city}. Only people in the building can buy it, and it ships to your door.</p>
  <div class="merch-grid">${MERCH.map(m=>`<div class="prod${open?'':' locked'}"><div class="ph" style="background-image:url(img/lead.jpg)"></div>${open?'':'<span class="lock">Locked</span>'}<h4>${s.city} ${m.name}</h4><small>${open?'$'+m.price+' · ships to home':'Unlocks at '+esc(s.venue)}</small></div>`).join('')}</div>
  <div class="panel" id="mbox">${open?`<button class="btn" style="width:100%">Shop ${s.city} drop</button>`:
    now<o?`<p class="tag">Unlocks in</p><div class="count" data-to="${+o}"></div><p class="body" style="color:var(--dim)">Be at ${esc(s.venue)} on show night to get in.</p>`:
    now>cl?`<p class="tag">This drop is closed.</p><p class="body" style="color:var(--dim)">You had to be there.</p>`:
    `<p class="tag">You're on the clock</p><p class="body" style="margin:6px 0 12px">Enter the code on the venue screens, or check in with your location.</p>
     <div class="form" style="margin-top:0"><input id="mcode" placeholder="Venue code" autocapitalize="characters"><button class="btn" id="mgo">Unlock</button><button class="btn ghost" id="mgeo">Use my location</button><p class="err body red" id="merr"></p></div>`}</div>`;
}
function bindMerch(s){
  const box=$('#mbox'); if(!box) return;
  const cd=$('.count',box); if(cd){ const tick=()=>{ if(!document.body.contains(cd)) return; let t=Math.max(0,cd.dataset.to-Date.now())/1e3;
    cd.textContent=`${Math.floor(t/86400)}D ${String(Math.floor(t%86400/3600)).padStart(2,'0')}H ${String(Math.floor(t%3600/60)).padStart(2,'0')}M ${String(Math.floor(t%60)).padStart(2,'0')}S`; setTimeout(tick,1000) }; tick() }
  const ok=m=>{ DB.add('unlocks',{ts:new Date().toISOString(),city:s.slug,device:deviceId(),method:m}); $('#cmerch').innerHTML=merchBlock(s); bindMerch(s) };
  const go=$('#mgo'); if(go) go.onclick=()=>{ const code=(CONFIG.merchCodes[s.slug]||'').toUpperCase(); $('#mcode').value.trim().toUpperCase()===code&&code ? ok('code') : $('#merr').textContent='That code does not match. Check the screens.' };
  const geo=$('#mgeo'); if(geo) geo.onclick=()=>{
    if(!navigator.geolocation){ $('#merr').textContent='Location is not available. Use the venue code.'; return }
    $('#merr').textContent='Checking…';
    navigator.geolocation.getCurrentPosition(p=>{
      const d=dist(p.coords.latitude,p.coords.longitude,...s.ll);
      d<=CONFIG.merchRadiusMeters+Math.min(p.coords.accuracy,300) ? ok('geo') : $('#merr').textContent='You look a bit far from the venue. Use the code on the screens.';
    },()=>$('#merr').textContent='Location is off. Use the venue code on the screens instead.',{enableHighAccuracy:true,timeout:10000});
  };
}
function dist(a,b,c,d){ const R=6371e3,r=Math.PI/180,x=Math.sin((c-a)*r/2)**2+Math.cos(a*r)*Math.cos(c*r)*Math.sin((d-b)*r/2)**2; return 2*R*Math.asin(Math.sqrt(x)) }

/* ---------- tabs ---------- */
function merchPage(){
  app.innerHTML = `<div class="city-hero"><div class="wrap"><p class="kick">BIG 5IVE LIVE</p><h1 class="disp">Merch</h1>
    <p class="body" style="color:var(--dim);margin-top:10px">Every city gets its own drop, sold only in the building on show night. Pick a city to see what's coming.</p></div></div>
  <div class="wrap"><ul class="dates">${SHOWS.map(s=>`<li><a href="#/show/${s.slug}#cmerch"><span class="d">${mmdd(s.date)}</span><span><span class="c">${s.city} drop</span><span class="v">${esc(s.venue)}</span></span><span class="go">Preview</span></a></li>`).join('')}</ul></div>`;
}
function music(){
  app.innerHTML = `<div class="city-hero"><div class="wrap"><p class="kick">Key Glock</p><h1 class="disp">Music</h1></div></div>
  <div class="wrap"><img src="img/photo2.jpg" alt="Key Glock" style="border-radius:6px;width:100%">
  <a class="btn" style="width:100%;margin-top:18px" href="${CONFIG.streaming}" target="_blank" rel="noopener">Listen now ↗</a></div>`;
}

/* ---------- admin export (#/admin) ---------- */
function csv(rows){ if(!rows.length) return ''; const k=Object.keys(rows[0]); return [k.join(','),...rows.map(r=>k.map(x=>`"${String(Array.isArray(r[x])?r[x].join(' | '):r[x]).replace(/"/g,'""')}"`).join(','))].join('\n') }
function dl(name,text){ const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([text],{type:'text/csv'})); a.download=name; a.click() }
function admin(){
  const v=DB.get('votes'), r=DB.get('requests');
  app.innerHTML=`<div class="wrap" style="padding-top:90px"><h1 class="disp" style="font-size:70px">Results</h1>
  <p class="body" style="color:var(--dim)">Prototype data stored in this browser. Production connects to the shared database.</p>
  <div style="display:flex;gap:10px;flex-wrap:wrap;margin:16px 0"><button class="btn" id="ev">Export votes CSV</button><button class="btn" id="er">Export city requests CSV</button></div>
  ${SHOWS.map(s=>{const {t,f}=tally(s.slug);const n=v.filter(x=>x.city===s.slug).length;return `<div class="panel"><h3 class="disp" style="font-size:36px">${s.city} <span class="tag">${n} votes</span></h3>
    <table><tr><th>Song</th><th>Votes</th><th>As finale</th></tr>${Object.entries(t).sort((a,b)=>b[1]-a[1]).map(([k,c])=>`<tr><td>${esc(k)}</td><td>${c}</td><td>${f[k]||0}</td></tr>`).join('')}</table></div>`}).join('')}
  <div class="panel"><h3 class="disp" style="font-size:36px">City requests <span class="tag">${r.length}</span></h3>
  <table><tr><th>City</th><th>Email</th><th>Email opt-in</th><th>SMS opt-in</th></tr>${r.map(x=>`<tr><td>${esc(x.city)}, ${esc(x.state)}</td><td>${esc(x.email)}</td><td>${x.emailOptIn}</td><td>${x.smsOptIn}</td></tr>`).join('')}</table></div></div>`;
  $('#ev').onclick=()=>dl('big5-votes.csv',csv(v.map(x=>({...x,pick1:x.picks[0]||'',pick2:x.picks[1]||'',pick3:x.picks[2]||'',pick4:x.picks[3]||''}))));
  $('#er').onclick=()=>dl('big5-city-requests.csv',csv(r));
}

fetch('img/us-states.json').then(r=>r.json()).then(j=>US=j).catch(()=>{}).finally(route);
