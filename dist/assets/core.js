(function(root){
  'use strict';
  const WEIGHTS=[1,1,2,3,3], KEY='clutch-atlas-v1';
  function dayKey(date=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);}
  function hash(s){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
  function shuffled(items,seed){const a=[...items];let h=hash(String(seed));for(let i=a.length-1;i>0;i--){h=(Math.imul(h,1664525)+1013904223)>>>0;const j=h%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
  function selectQuestions(bank,mode,seed){
    if(mode!=='mixed')return shuffled(bank.filter(q=>q.game===mode),seed).filter((q,i,a)=>a.findIndex(x=>x.city===q.city)===i).slice(0,5);
    const order=shuffled(['cs','val','lol'],seed),pool=shuffled(bank,seed),picked=[];
    for(const game of [...order,...order.slice(0,2)]){const q=pool.find(q=>q.game===game&&!picked.some(p=>p.id===q.id||p.city===q.city));if(q)picked.push(q);}
    return picked;
  }
  function validPoint(p){return p&&Number.isFinite(p.lng)&&Number.isFinite(p.lat)&&Math.abs(p.lng)<=180&&Math.abs(p.lat)<=90;}
  function distance(a,b){if(!validPoint(a)||!validPoint(b))throw new Error('Invalid coordinates');const rad=Math.PI/180,dl=(b.lat-a.lat)*rad,dn=(b.lng-a.lng)*rad;const h=Math.sin(dl/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dn/2)**2;return 6371.0088*2*Math.asin(Math.sqrt(Math.min(1,h)));}
  function score(km,index){if(!Number.isFinite(km)||km<0||!Number.isInteger(index)||index<0||index>4)throw new Error('Invalid scoring input');const base=km<=35?100:Math.max(0,Math.round(100*Math.exp(-(km-35)/2400)));return base*WEIGHTS[index];}
  function tier(ratio){return ratio>=.98?{label:'精准锁定',emoji:'🟢',color:'#d4f975'}:ratio>=.8?{label:'漂亮预判',emoji:'🟢',color:'#9bdbb5'}:ratio>=.5?{label:'方向对了',emoji:'🟡',color:'#efb568'}:{label:'下次更近',emoji:'🔴',color:'#fa7b89'};}
  function emptyStore(){return {version:1,active:null,history:[]};}
  function readStore(storage){try{const v=JSON.parse(storage.getItem(KEY));if(!v||v.version!==1||!Array.isArray(v.history))return emptyStore();v.history=v.history.filter(r=>r&&typeof r.id==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(r.date)&&Number.isFinite(r.total)&&r.total>=0&&r.total<=1000&&Array.isArray(r.answers)&&r.answers.length===5).slice(0,100);return v;}catch{return emptyStore();}}
  function validRound(r,bank){return !!r&&typeof r.id==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(r.date)&&['mixed','cs','val','lol'].includes(r.mode)&&['daily','practice'].includes(r.kind)&&Array.isArray(r.ids)&&r.ids.length===5&&new Set(r.ids).size===5&&r.ids.every(id=>bank.some(q=>q.id===id))&&Array.isArray(r.answers)&&r.answers.length<=5&&r.answers.every((a,i)=>a&&validPoint(a.guess)&&Number.isFinite(a.km)&&a.km>=0&&a.score===score(a.km,i))&&(!r.guess||validPoint(r.guess))&&Number.isInteger(r.index)&&r.index>=0&&r.index<=4&&r.answers.length>=r.index&&r.answers.length<=r.index+1;}
  function streak(history,today=dayKey()){const days=new Set(history.filter(r=>r.kind==='daily').map(r=>r.date));let cursor=new Date(today+'T12:00:00+08:00'),count=0;if(!days.has(today))cursor.setUTCDate(cursor.getUTCDate()-1);while(days.has(dayKey(cursor))){count++;cursor.setUTCDate(cursor.getUTCDate()-1);}return count;}
  const api={WEIGHTS,KEY,dayKey,hash,shuffled,selectQuestions,validPoint,distance,score,tier,emptyStore,readStore,validRound,streak};root.AtlasCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
