const STORAGE_KEY='roulette_app';
const COLORS=['#FF6B9D','#FFD93D','#6BCFB5','#C084FC','#FF8C69','#60A5FA','#F472B6'];

function loadData(){const r=localStorage.getItem(STORAGE_KEY);if(!r)return getDefault();try{return JSON.parse(r)}catch{return getDefault()}}
function saveData(d){localStorage.setItem(STORAGE_KEY,JSON.stringify(d))}

function getDefault(){return{
  settings:{eventName:'ライブ抽選システム',totalWinners:10,remainingWinners:10,loseMessage:'残念！またチャレンジしてね！',adminPassword:'1234',lastInputMethod:'text'},
  prizes:[
    {id:'prize-001',name:'サイン入りポスター',imageUrl:null,winMessage:'サイン入りポスターが当たりました！',totalWinners:5,remainingWinners:5,winners:[]},
    {id:'prize-002',name:'チェキ',imageUrl:null,winMessage:'チェキが当たりました！',totalWinners:3,remainingWinners:3,winners:[]},
    {id:'prize-003',name:'グッズセット',imageUrl:null,winMessage:'グッズセットが当たりました！',totalWinners:2,remainingWinners:2,winners:[]}
  ],
  design:{backgroundColor:'#FFF5F9',backgroundPattern:'none',fontFamily:'Nunito'},
  tickets:[
    {id:'A-001',used:false,usedAt:null,result:null},{id:'A-002',used:false,usedAt:null,result:null},
    {id:'A-003',used:false,usedAt:null,result:null},{id:'A-004',used:false,usedAt:null,result:null},
    {id:'A-005',used:false,usedAt:null,result:null},{id:'A-006',used:false,usedAt:null,result:null},
    {id:'A-007',used:false,usedAt:null,result:null},{id:'A-008',used:false,usedAt:null,result:null},
    {id:'A-009',used:false,usedAt:null,result:null},{id:'A-010',used:false,usedAt:null,result:null}
  ]
}}

function showPage(page){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const data=loadData();
  if(page==='main'){
    if(data.settings.remainingWinners<=0){
      document.getElementById('page-soldout').classList.add('active');
      document.getElementById('soldout-event-name').textContent='🎪 '+data.settings.eventName;
      document.getElementById('soldout-event-label').textContent=data.settings.eventName;
    }else{
      document.getElementById('page-main').classList.add('active');
      renderMain(data);
    }
  }else{
    document.getElementById('page-'+page).classList.add('active');
  }
}

function goToLogin(){showPage('login')}

function renderMain(data){
  const s=data.settings;
  document.getElementById('header-event-name').textContent='🎪 '+s.eventName;
  document.getElementById('display-event-name').textContent=s.eventName;
  document.getElementById('header-remaining').textContent=s.remainingWinners;
  document.getElementById('remaining-num').textContent=s.remainingWinners;
  document.querySelectorAll('.method-tab').forEach(t=>{t.classList.toggle('active',t.dataset.method===s.lastInputMethod)});
}

document.querySelectorAll('.method-tab').forEach(tab=>{
  tab.addEventListener('click',()=>{
    document.querySelectorAll('.method-tab').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    const data=loadData();data.settings.lastInputMethod=tab.dataset.method;saveData(data);
    const inp=document.getElementById('ticket-input');
    inp.placeholder=tab.dataset.method==='text'?'チケット番号を入力':tab.dataset.method==='qr'?'QRコードをスキャン（準備中）':'バーコードをスキャン（準備中）';
  });
});

let isSpinning=false;
document.getElementById('btn-start').addEventListener('click',startRoulette);
document.getElementById('ticket-input').addEventListener('keydown',e=>{if(e.key==='Enter')startRoulette()});

function startRoulette(){
  if(isSpinning)return;
  const ticketId=document.getElementById('ticket-input').value.trim().toUpperCase();
  if(!ticketId){showError('入力エラー','チケット番号を入力してください。');return}
  const data=loadData();
  const ticket=data.tickets.find(t=>t.id.toUpperCase()===ticketId);
  if(!ticket){showError('チケットエラー','登録されていないチケット番号です。\nスタッフにお問い合わせください。');return}
  if(ticket.used||ticket.usedAt!==null||ticket.result!==null){
    const anomaly=ticket.used&&(ticket.usedAt===null||ticket.result===null);
    showError(anomaly?'システムエラー':'使用済みエラー',anomaly?'このチケットは処理中にエラーが発生しました。\nスタッフにお問い合わせください。':'このチケットはすでに使用済みです。\n1枚につき1回のみ有効です。');
    return;
  }
  if(data.settings.remainingWinners<=0){showError('終了','本日の抽選はすべて終了しました。');return}

  isSpinning=true;
  document.getElementById('btn-start').disabled=true;
  document.getElementById('ticket-input').disabled=true;
  const ring=document.getElementById('roulette-ring');
  const emoji=document.getElementById('roulette-emoji');
  const label=document.getElementById('roulette-label');
  ring.className='roulette-ring spinning';
  emoji.textContent='🌀';label.textContent='SPINNING';

  const availablePrizes=data.prizes.filter(p=>p.remainingWinners>0);
  let result=null,wonPrize=null;
  if(availablePrizes.length>0){
    const unused=data.tickets.filter(t=>!t.used&&t.usedAt===null&&t.result===null).length;
    if(Math.random()<(data.settings.remainingWinners/unused)){
      wonPrize=availablePrizes[Math.floor(Math.random()*availablePrizes.length)];
      result=wonPrize.id;
    }
  }

  setTimeout(()=>{
    ring.className='roulette-ring stopping';
    setTimeout(()=>{
      ring.className='roulette-ring';
      isSpinning=false;
      document.getElementById('btn-start').disabled=false;
      document.getElementById('ticket-input').disabled=false;
      document.getElementById('ticket-input').value='';

      const d=loadData();
      const t=d.tickets.find(t=>t.id.toUpperCase()===ticketId);
      t.used=true;saveData(d);
      t.usedAt=new Date().toISOString();saveData(d);

      if(result){
        const prize=d.prizes.find(p=>p.id===result);
        prize.winners.push(t.id);saveData(d);
        t.result=result;saveData(d);
        prize.remainingWinners--;saveData(d);
        d.settings.remainingWinners--;saveData(d);
        emoji.textContent='🎉';label.textContent='WIN!';
        renderMain(d);showWin(wonPrize);launchConfetti();
      }else{
        t.result='lose';saveData(d);
        emoji.textContent='😢';label.textContent='TRY AGAIN';
        showLose(d.settings.loseMessage);
      }
      renderMain(loadData());
      if(loadData().settings.remainingWinners<=0)setTimeout(()=>showPage('main'),2500);
    },1400);
  },2000);
}

function showWin(prize){
  document.getElementById('win-prize-name').textContent='🏆 '+prize.name;
  document.getElementById('win-message').textContent=prize.winMessage;
  document.getElementById('overlay-win').classList.add('show');
}
function showLose(msg){document.getElementById('lose-message').textContent=msg;document.getElementById('overlay-lose').classList.add('show')}
function showError(title,msg){document.getElementById('error-title').textContent=title;document.getElementById('error-message').textContent=msg;document.getElementById('overlay-error').classList.add('show')}
function closeOverlay(type){
  document.getElementById('overlay-'+type).classList.remove('show');
  document.getElementById('roulette-emoji').textContent='🎯';
  document.getElementById('roulette-label').textContent='READY';
}

function launchConfetti(){
  for(let i=0;i<30;i++){
    const el=document.createElement('div');el.className='confetti-piece';
    el.style.left=Math.random()*100+'vw';el.style.background=COLORS[Math.floor(Math.random()*COLORS.length)];
    el.style.animationDelay=Math.random()*0.8+'s';el.style.animationDuration=(1+Math.random())+'s';
    el.style.borderRadius=Math.random()>0.5?'50%':'2px';
    document.body.appendChild(el);setTimeout(()=>el.remove(),3000);
  }
}

function doLogin(){
  const pw=document.getElementById('login-pw').value;
  const data=loadData();
  if(pw===data.settings.adminPassword){
    document.getElementById('login-pw').value='';
    document.getElementById('login-error').classList.remove('show');
    showPage('admin');renderAdmin();
  }else{document.getElementById('login-error').classList.add('show')}
}
document.getElementById('login-pw').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin()});

document.querySelectorAll('.admin-tab').forEach(tab=>{
  tab.addEventListener('click',()=>{
    document.querySelectorAll('.admin-tab').forEach(t=>t.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tab-'+tab.dataset.tab).classList.add('active');
    if(tab.dataset.tab==='tickets')renderTicketList();
    if(tab.dataset.tab==='history')renderHistory();
    if(tab.dataset.tab==='prizes')renderPrizeList();
  });
});

function renderAdmin(){
  const data=loadData();const s=data.settings;
  document.getElementById('s-eventName').value=s.eventName;
  document.getElementById('s-totalWinners').value=s.totalWinners;
  document.getElementById('s-loseMessage').value=s.loseMessage;
  document.getElementById('s-lastInputMethod').value=s.lastInputMethod;
  document.getElementById('s-backgroundColor').value=data.design.backgroundColor;
  document.getElementById('s-backgroundPattern').value=data.design.backgroundPattern;
  document.getElementById('s-fontFamily').value=data.design.fontFamily;
  renderPrizeList();renderTicketList();renderHistory();
}

function saveSettings(){
  const data=loadData();
  data.settings.eventName=document.getElementById('s-eventName').value||data.settings.eventName;
  const tw=parseInt(document.getElementById('s-totalWinners').value);
  if(!isNaN(tw)&&tw>0)data.settings.totalWinners=tw;
  data.settings.loseMessage=document.getElementById('s-loseMessage').value||data.settings.loseMessage;
  const newPw=document.getElementById('s-adminPassword').value;
  if(newPw)data.settings.adminPassword=newPw;
  data.settings.lastInputMethod=document.getElementById('s-lastInputMethod').value;
  data.design.backgroundColor=document.getElementById('s-backgroundColor').value;
  data.design.backgroundPattern=document.getElementById('s-backgroundPattern').value;
  data.design.fontFamily=document.getElementById('s-fontFamily').value;
  saveData(data);applyDesign(data.design);
  const msg=document.getElementById('settings-saved');msg.classList.add('show');setTimeout(()=>msg.classList.remove('show'),2000);
}

function applyDesign(design){document.documentElement.style.setProperty('--bg',design.backgroundColor)}

function renderPrizeList(){
  const data=loadData();const el=document.getElementById('prize-list');
  if(!data.prizes.length){el.innerHTML='<div style="font-size:13px;color:var(--text-muted);text-align:center;padding:12px">商品が登録されていません</div>';return}
  el.innerHTML=data.prizes.map((p,i)=>`
    <div class="prize-item">
      <div class="prize-color-dot" style="background:${COLORS[i%COLORS.length]}"></div>
      <div class="prize-info">
        <div class="prize-name">${p.name}</div>
        <div class="prize-meta">当選数: ${p.totalWinners} / 残り: ${p.remainingWinners}</div>
        <div class="prize-meta" style="font-size:10px;margin-top:2px">${p.winMessage}</div>
      </div>
      <button class="btn-danger" style="font-size:11px;padding:4px 10px" onclick="deletePrize('${p.id}')">削除</button>
    </div>`).join('');
}

function openAddPrize(){
  const name=prompt('商品名を入力してください');if(!name)return;
  const total=parseInt(prompt('当選数を入力してください'));if(isNaN(total)||total<1)return;
  const msg=prompt('当選時コメントを入力してください')||name+'が当たりました！';
  const data=loadData();
  data.prizes.push({id:'prize-'+Date.now(),name,imageUrl:null,winMessage:msg,totalWinners:total,remainingWinners:total,winners:[]});
  data.settings.totalWinners+=total;data.settings.remainingWinners+=total;
  saveData(data);renderPrizeList();
}

function deletePrize(id){
  const data=loadData();const prize=data.prizes.find(p=>p.id===id);if(!prize)return;
  data.settings.totalWinners-=prize.remainingWinners;data.settings.remainingWinners-=prize.remainingWinners;
  data.prizes=data.prizes.filter(p=>p.id!==id);saveData(data);renderPrizeList();
}

function importTickets(){
  const raw=document.getElementById('ticket-import-area').value.trim();if(!raw)return;
  const ids=raw.split('\n').map(l=>l.trim().toUpperCase()).filter(Boolean);
  const data=loadData();let added=0;
  ids.forEach(id=>{if(!data.tickets.find(t=>t.id===id)){data.tickets.push({id,used:false,usedAt:null,result:null});added++}});
  saveData(data);document.getElementById('ticket-import-area').value='';
  const msg=document.getElementById('tickets-saved');msg.textContent='✅ '+added+'件インポートしました！';msg.classList.add('show');
  setTimeout(()=>msg.classList.remove('show'),2000);renderTicketList();
}

function renderTicketList(){
  const data=loadData();const el=document.getElementById('ticket-list');
  if(!data.tickets.length){el.innerHTML='<div style="font-size:13px;color:var(--text-muted);text-align:center;padding:8px">チケットが登録されていません</div>';return}
  el.innerHTML=data.tickets.map(t=>{
    let sc='unused',st='未使用';
    if(t.result==='lose'){sc='used';st='ハズレ'}
    else if(t.result&&t.result!=='lose'){sc='win';st='当選'}
    else if(t.used){sc='used';st='使用済'}
    return `<div class="ticket-row"><span class="ticket-id">${t.id}</span><span class="ticket-status ${sc}">${st}</span></div>`;
  }).join('');
}

function renderHistory(){
  const data=loadData();
  const winners=data.tickets.filter(t=>t.result&&t.result!=='lose');
  const el=document.getElementById('history-list');
  if(!winners.length){el.innerHTML='<div style="font-size:13px;color:var(--text-muted);text-align:center;padding:8px">当選者はまだいません</div>';return}
  el.innerHTML=winners.map(t=>{
    const prize=data.prizes.find(p=>p.id===t.result);
    const time=t.usedAt?new Date(t.usedAt).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'}):'-';
    return `<div class="history-row"><span class="history-ticket">${t.id}</span><span class="history-result win">${prize?prize.name:t.result}</span><span class="history-time">${time}</span></div>`;
  }).join('');
}

function exportCSV(){
  const data=loadData();
  const winners=data.tickets.filter(t=>t.result&&t.result!=='lose');
  const csv='チケットID,当選商品,抽選日時\n'+winners.map(t=>{
    const prize=data.prizes.find(p=>p.id===t.result);
    return `${t.id},${prize?prize.name:t.result},${t.usedAt||''}`;
  }).join('\n');
  const blob=new Blob(['﻿'+csv],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download='当選履歴.csv';a.click();URL.revokeObjectURL(url);
}

let pendingReset=null;
function confirmReset(type){
  pendingReset=type;
  document.getElementById('confirm-title').textContent=type==='all'?'全データリセット':'チケットリセット';
  document.getElementById('confirm-msg').textContent=type==='all'?'すべてのデータが削除されます。この操作は取り消せません。':'チケット一覧がリセットされます。よろしいですか？';
  document.getElementById('confirm-overlay').classList.add('show');
}
document.getElementById('confirm-ok').addEventListener('click',()=>{
  if(pendingReset==='all')localStorage.removeItem(STORAGE_KEY);
  else if(pendingReset==='tickets'){const d=loadData();d.tickets=[];saveData(d)}
  closeConfirm();renderAdmin();
});
function closeConfirm(){document.getElementById('confirm-overlay').classList.remove('show');pendingReset=null}

(function init(){
  const data=loadData();applyDesign(data.design);showPage('main');
})();
