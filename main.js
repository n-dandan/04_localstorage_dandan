const STORAGE_KEY='roulette_app';
const COLORS=['#FF6B9D','#FFD93D','#6BCFB5','#C084FC','#FF8C69','#60A5FA','#F472B6'];

// LocalStorageからアプリデータを読み込む。データがない or 壊れていればデフォルト値を返す
function loadData(){const r=localStorage.getItem(STORAGE_KEY);if(!r)return getDefault();try{return JSON.parse(r)}catch{return getDefault()}}

// アプリデータをLocalStorageに保存する
function saveData(d){localStorage.setItem(STORAGE_KEY,JSON.stringify(d))}

// アプリの初期データ（設定・商品・デザイン・チケット50件）を返す
function getDefault(){return{
  settings:{
    eventName:'イベント抽選システム',
    totalWinners:10,
    remainingWinners:10,
    loseMessage:'残念！またチャレンジしてね！',
    adminPassword:'1234',
    lastInputMethod:'text'
  },
  prizes:[
    {id:'prize-001',name:'サイン入りポスター',imageUrl:null,winMessage:'サイン入りポスターが当たりました！',totalWinners:5,remainingWinners:5,winners:[]},
    {id:'prize-002',name:'チェキ',imageUrl:null,winMessage:'チェキが当たりました！',totalWinners:3,remainingWinners:3,winners:[]},
    {id:'prize-003',name:'グッズセット',imageUrl:null,winMessage:'グッズセットが当たりました！',totalWinners:2,remainingWinners:2,winners:[]}
  ],
  design:{backgroundColor:'#FFF5F9',backgroundPattern:'none',fontFamily:'Nunito'},
  tickets:[
    {id:'A-0001',used:false,usedAt:null,result:null},{id:'A-0002',used:false,usedAt:null,result:null},
    {id:'A-0003',used:false,usedAt:null,result:null},{id:'A-0004',used:false,usedAt:null,result:null},
    {id:'A-0005',used:false,usedAt:null,result:null},{id:'A-0006',used:false,usedAt:null,result:null},
    {id:'A-0007',used:false,usedAt:null,result:null},{id:'A-0008',used:false,usedAt:null,result:null},
    {id:'A-0009',used:false,usedAt:null,result:null},{id:'A-0010',used:false,usedAt:null,result:null},
    {id:'A-0011',used:false,usedAt:null,result:null},{id:'A-0012',used:false,usedAt:null,result:null},
    {id:'A-0013',used:false,usedAt:null,result:null},{id:'A-0014',used:false,usedAt:null,result:null},
    {id:'A-0015',used:false,usedAt:null,result:null},{id:'A-0016',used:false,usedAt:null,result:null},
    {id:'A-0017',used:false,usedAt:null,result:null},{id:'A-0018',used:false,usedAt:null,result:null},
    {id:'A-0019',used:false,usedAt:null,result:null},{id:'A-0020',used:false,usedAt:null,result:null},
    {id:'0001',used:false,usedAt:null,result:null},{id:'0002',used:false,usedAt:null,result:null},
    {id:'0003',used:false,usedAt:null,result:null},{id:'0004',used:false,usedAt:null,result:null},
    {id:'0005',used:false,usedAt:null,result:null},{id:'0006',used:false,usedAt:null,result:null},
    {id:'0007',used:false,usedAt:null,result:null},{id:'0008',used:false,usedAt:null,result:null},
    {id:'0009',used:false,usedAt:null,result:null},{id:'0010',used:false,usedAt:null,result:null},
    {id:'0011',used:false,usedAt:null,result:null},{id:'0012',used:false,usedAt:null,result:null},
    {id:'0013',used:false,usedAt:null,result:null},{id:'0014',used:false,usedAt:null,result:null},
    {id:'0015',used:false,usedAt:null,result:null},{id:'0016',used:false,usedAt:null,result:null},
    {id:'0017',used:false,usedAt:null,result:null},{id:'0018',used:false,usedAt:null,result:null},
    {id:'0019',used:false,usedAt:null,result:null},{id:'0020',used:false,usedAt:null,result:null},
    {id:'0021',used:false,usedAt:null,result:null},{id:'0022',used:false,usedAt:null,result:null},
    {id:'0023',used:false,usedAt:null,result:null},{id:'0024',used:false,usedAt:null,result:null},
    {id:'0025',used:false,usedAt:null,result:null},{id:'0026',used:false,usedAt:null,result:null},
    {id:'0027',used:false,usedAt:null,result:null},{id:'0028',used:false,usedAt:null,result:null},
    {id:'0029',used:false,usedAt:null,result:null},{id:'0030',used:false,usedAt:null,result:null}
  ]
}}

// 指定ページを表示する。抽選画面(main)では残り当選数が0の場合にsoldout画面へ切り替える
function showPage(page){
  stopScanner();
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

// ログイン画面へ遷移する
function goToLogin(){showPage('login')}

// 「管理画面へ」ボタンの連打カウンター。10回タップで管理画面へ遷移、5秒無操作でカウントリセット
let adminNavCount=0;
let adminNavTimer=null;
function handleAdminNav(){
  adminNavCount++;
  clearTimeout(adminNavTimer);
  const btn=document.getElementById('admin-nav-btn');
  if(adminNavCount>=10){
    adminNavCount=0;
    btn.textContent='管理画面へ';
    goToLogin();
    return;
  }
  btn.textContent='あと'+(10-adminNavCount)+'回';
  adminNavTimer=setTimeout(()=>{
    adminNavCount=0;
    btn.textContent='管理画面へ';
  },5000);
}

// 抽選画面のヘッダー・イベント名・残り当選数・入力タブ選択状態を更新する
function renderMain(data){
  const s=data.settings;
  document.getElementById('header-event-name').textContent='🎪 '+s.eventName;
  document.getElementById('display-event-name').textContent=s.eventName;
  document.getElementById('remaining-num').textContent=s.remainingWinners;
  document.querySelectorAll('.method-tab').forEach(t=>{t.classList.toggle('active',t.dataset.method===s.lastInputMethod)});
  const el=document.getElementById('prize-status-list');
  if(!el)return;
  el.innerHTML=data.prizes.map((p,i)=>`
    <div class="prize-status-item">
      <div class="prize-status-dot" style="background:${COLORS[i%COLORS.length]}"></div>
      <div class="prize-status-name">${p.name}</div>
      <div class="prize-status-remain">${p.remainingWinners}<span>残</span></div>
    </div>`).join('');
}

// 入力方式タブ（テキスト/スキャン）の切り替えイベント。スキャン選択時はカメラを起動する
document.querySelectorAll('.method-tab').forEach(tab=>{
  tab.addEventListener('click',()=>{
    document.querySelectorAll('.method-tab').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    const method=tab.dataset.method;
    const data=loadData();data.settings.lastInputMethod=method;saveData(data);
    stopScanner();
    if(method==='scan'){
      startScanner();
    }else{
      document.getElementById('ticket-input').placeholder='チケット番号を入力';
    }
  });
});

let html5QrCode=null;

// QR・バーコードスキャナーを起動し、読み取り成功時にチケット入力欄へセットする
function startScanner(){
  const wrap=document.getElementById('qr-reader-wrap');
  wrap.classList.remove('scanning');
  const formats=[
    Html5QrcodeSupportedFormats.QR_CODE,
    Html5QrcodeSupportedFormats.CODE_128,Html5QrcodeSupportedFormats.CODE_39,
    Html5QrcodeSupportedFormats.EAN_13,Html5QrcodeSupportedFormats.EAN_8,
    Html5QrcodeSupportedFormats.UPC_A,Html5QrcodeSupportedFormats.UPC_E,
    Html5QrcodeSupportedFormats.ITF];
  html5QrCode=new Html5Qrcode('qr-reader');
  html5QrCode.start(
    {facingMode:'environment'},
    {fps:10,qrbox:{width:240,height:240},formatsToSupport:formats},
    (decoded)=>{
      document.getElementById('ticket-input').value=decoded.trim().toUpperCase();
      stopScanner();
    },
    ()=>{}
  ).then(()=>{
    wrap.classList.add('scanning');
  }).catch(()=>{
    html5QrCode=null;
    showError('カメラエラー','カメラへのアクセスができませんでした。\nブラウザの設定を確認してください。');
    document.querySelectorAll('.method-tab').forEach(t=>t.classList.remove('active'));
    document.querySelector('.method-tab[data-method="text"]').classList.add('active');
    const d=loadData();d.settings.lastInputMethod='text';saveData(d);
  });
}

// スキャナーを停止し、カメラ映像エリアを非表示にする
function stopScanner(){
  if(!html5QrCode)return;
  const qr=html5QrCode;
  html5QrCode=null;
  const wrap=document.getElementById('qr-reader-wrap');
  qr.stop().then(()=>{
    qr.clear();
    wrap.classList.remove('scanning');
  }).catch(()=>{
    wrap.classList.remove('scanning');
  });
}

let isSpinning=false;
document.getElementById('btn-start').addEventListener('click',startRoulette);
document.getElementById('ticket-input').addEventListener('keydown',e=>{if(e.key==='Enter')startRoulette()});

// 抽選メイン処理。チケット検証 → ルーレットアニメーション → 当落判定 → 結果保存の順で実行する
function startRoulette(){
  // チケット検証処理
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
  // 抽選を行っていない人がいても、当選商品がなくなった場合は抽選を終了する。必要ない場合はこの処理をコメントアウトする。
  if(data.settings.remainingWinners<=0){showError('終了','本日の抽選はすべて終了しました。');return}

  // ルーレットアニメーション
  isSpinning=true;
  document.getElementById('btn-start').disabled=true;
  document.getElementById('ticket-input').disabled=true;
  const ring=document.getElementById('roulette-ring');
  const emoji=document.getElementById('roulette-emoji');
  const label=document.getElementById('roulette-label');
  ring.className='roulette-ring spinning';
  emoji.textContent='🌀';label.textContent='SPINNING';

  // 当落判定
  // 抽選処理：(残り当選数)/(残り抽選者数)で抽選される
  const availablePrizes=data.prizes.filter(p=>p.remainingWinners>0);
  let result=null,wonPrize=null;
  if(availablePrizes.length>0){
    const unused=data.tickets.filter(t=>!t.used&&t.usedAt===null&&t.result===null).length;
    if(Math.random()<(data.settings.remainingWinners/unused)){
      wonPrize=availablePrizes[Math.floor(Math.random()*availablePrizes.length)];
      result=wonPrize.id;
    }
  }

  // 結果保存
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

// 当選オーバーレイを表示する
function showWin(prize){
  document.getElementById('win-prize-name').textContent='🏆 '+prize.name;
  document.getElementById('win-message').textContent=prize.winMessage;
  document.getElementById('overlay-win').classList.add('show');
}

// ハズレオーバーレイを表示する
function showLose(msg){document.getElementById('lose-message').textContent=msg;document.getElementById('overlay-lose').classList.add('show')}

// エラーオーバーレイをタイトル・メッセージ付きで表示する
function showError(title,msg){document.getElementById('error-title').textContent=title;document.getElementById('error-message').textContent=msg;document.getElementById('overlay-error').classList.add('show')}

// 指定種別のオーバーレイを閉じ、ルーレット表示をREADY状態に戻す
function closeOverlay(type){
  document.getElementById('overlay-'+type).classList.remove('show');
  document.getElementById('roulette-emoji').textContent='🎯';
  document.getElementById('roulette-label').textContent='READY';
}

// 当選時に紙吹雪アニメーションを30個生成して画面に降らせる
function launchConfetti(){
  for(let i=0;i<30;i++){
    const el=document.createElement('div');el.className='confetti-piece';
    el.style.left=Math.random()*100+'vw';el.style.background=COLORS[Math.floor(Math.random()*COLORS.length)];
    el.style.animationDelay=Math.random()*0.8+'s';el.style.animationDuration=(1+Math.random())+'s';
    el.style.borderRadius=Math.random()>0.5?'50%':'2px';
    document.body.appendChild(el);setTimeout(()=>el.remove(),3000);
  }
}

// 管理パスワードを照合し、正しければ管理画面へ遷移する
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

// 管理画面のタブ切り替えイベント。タブに応じて各リストを再描画する
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

// 管理画面を開いたときに全フォームをLocalStorageの値で初期化する
function renderAdmin(){
  const data=loadData();const s=data.settings;
  document.getElementById('s-eventName').value=s.eventName;
  document.getElementById('s-loseMessage').value=s.loseMessage;
  document.getElementById('s-lastInputMethod').value=s.lastInputMethod;
  document.getElementById('s-backgroundColor').value=data.design.backgroundColor;
  document.getElementById('s-backgroundPattern').value=data.design.backgroundPattern;
  document.getElementById('s-fontFamily').value=data.design.fontFamily;
  renderPrizeList();renderTicketList();renderHistory();
}

// 基本設定・デザイン設定のフォーム内容を保存し、デザインを即時反映する
function saveSettings(){
  const data=loadData();
  data.settings.eventName=document.getElementById('s-eventName').value||data.settings.eventName;
  data.settings.loseMessage=document.getElementById('s-loseMessage').value||data.settings.loseMessage;
  data.settings.lastInputMethod=document.getElementById('s-lastInputMethod').value;
  data.design.backgroundColor=document.getElementById('s-backgroundColor').value;
  data.design.backgroundPattern=document.getElementById('s-backgroundPattern').value;
  data.design.fontFamily=document.getElementById('s-fontFamily').value;
  saveData(data);applyDesign(data.design);
  const activeTab=document.querySelector('.admin-tab.active');
  const tabName=activeTab&&activeTab.dataset.tab;
  const msgId=tabName==='prizes'?'prizes-saved':'settings-saved';
  const msg=document.getElementById(msgId);
  if(msg){msg.classList.add('show');setTimeout(()=>msg.classList.remove('show'),2000);}
}

// 現在のパスワードを照合してから新パスワードに更新する
function changePassword(){
  const current=document.getElementById('pw-current').value;
  const nw=document.getElementById('pw-new').value;
  const confirm=document.getElementById('pw-confirm').value;
  const errEl=document.getElementById('pw-error');
  errEl.style.display='none';
  const data=loadData();
  if(current!==data.settings.adminPassword){errEl.textContent='現在のパスワードが違います';errEl.style.display='block';return;}
  if(!nw){errEl.textContent='新しいパスワードを入力してください';errEl.style.display='block';return;}
  if(nw!==confirm){errEl.textContent='新しいパスワードが一致しません';errEl.style.display='block';return;}
  data.settings.adminPassword=nw;
  saveData(data);
  document.getElementById('pw-current').value='';
  document.getElementById('pw-new').value='';
  document.getElementById('pw-confirm').value='';
  const msg=document.getElementById('pw-saved');
  msg.classList.add('show');setTimeout(()=>msg.classList.remove('show'),2000);
}

// CSS変数 --bg を更新して背景色をページ全体に即時反映する
function applyDesign(design){document.documentElement.style.setProperty('--bg',design.backgroundColor)}

// 当選商品一覧を描画し、合計当選数を更新する
function renderPrizeList(){
  const data=loadData();const el=document.getElementById('prize-list');
  const total=data.prizes.reduce((s,p)=>s+p.totalWinners,0);
  const totalEl=document.getElementById('prize-total-count');
  if(totalEl)totalEl.textContent=total;
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

// 当選商品追加モーダルを開く
function openAddPrize(){
  document.getElementById('add-prize-name').value='';
  document.getElementById('add-prize-total').value='';
  document.getElementById('add-prize-msg').value='';
  document.getElementById('add-prize-error').style.display='none';
  document.getElementById('prize-add-overlay').classList.add('show');
  setTimeout(()=>document.getElementById('add-prize-name').focus(),50);
}

// 当選商品追加モーダルを閉じる
function closeAddPrize(){
  document.getElementById('prize-add-overlay').classList.remove('show');
}

// モーダルの入力内容を検証して当選商品を追加する
function submitAddPrize(){
  const name=document.getElementById('add-prize-name').value.trim();
  const total=parseInt(document.getElementById('add-prize-total').value);
  const msg=document.getElementById('add-prize-msg').value.trim()||name+'が当たりました！';
  const errEl=document.getElementById('add-prize-error');
  if(!name){errEl.textContent='商品名を入力してください';errEl.style.display='block';return;}
  if(isNaN(total)||total<1){errEl.textContent='当選数は1以上の数値を入力してください';errEl.style.display='block';return;}
  const data=loadData();
  data.prizes.push({id:'prize-'+Date.now(),name,imageUrl:null,winMessage:msg,totalWinners:total,remainingWinners:total,winners:[]});
  data.settings.totalWinners+=total;data.settings.remainingWinners+=total;
  saveData(data);closeAddPrize();renderPrizeList();
}

// 削除確認ダイアログを表示する（実際の削除はconfirm-okボタンで実行）
function deletePrize(id){
  const data=loadData();const prize=data.prizes.find(p=>p.id===id);if(!prize)return;
  pendingPrizeId=id;
  document.getElementById('confirm-title').textContent='当選商品の削除';
  document.getElementById('confirm-msg').textContent=`「${prize.name}」を削除します。この操作は取り消せません。`;
  document.getElementById('confirm-overlay').classList.add('show');
}

// CSVファイルからチケットIDを読み込んで一覧に追加する（BOM・ヘッダー行を自動スキップ）
function importTicketsFromCSV(){
  const fileInput=document.getElementById('ticket-csv-input');
  const file=fileInput.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=(e)=>{
    const text=e.target.result.replace(/^﻿/,'');
    const lines=text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
    const data=loadData();let added=0;
    lines.forEach(line=>{
      const id=line.split(',')[0].trim().toUpperCase();
      if(!id||id==='チケットID'||id==='ID')return;
      if(!data.tickets.find(t=>t.id===id)){data.tickets.push({id,used:false,usedAt:null,result:null});added++;}
    });
    saveData(data);fileInput.value='';
    const msg=document.getElementById('tickets-saved');
    msg.textContent='✅ '+added+'件インポートしました！';msg.classList.add('show');
    setTimeout(()=>msg.classList.remove('show'),2000);renderTicketList();
  };
  reader.readAsText(file,'UTF-8');
}

// テキストエリアに1行1件で入力されたチケットIDを一覧に追加する
function importTickets(){
  const raw=document.getElementById('ticket-import-area').value.trim();if(!raw)return;
  const ids=raw.split('\n').map(l=>l.trim().toUpperCase()).filter(Boolean);
  const data=loadData();let added=0;
  ids.forEach(id=>{if(!data.tickets.find(t=>t.id===id)){data.tickets.push({id,used:false,usedAt:null,result:null});added++}});
  saveData(data);document.getElementById('ticket-import-area').value='';
  const msg=document.getElementById('tickets-saved');msg.textContent='✅ '+added+'件インポートしました！';msg.classList.add('show');
  setTimeout(()=>msg.classList.remove('show'),2000);renderTicketList();
}

// チケット一覧を未使用・使用済・ハズレ・当選のステータス付きで描画する
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

// チケット一覧全件（ステータス・当選商品・日時含む）をCSVファイルとしてエクスポートする
function exportTicketsCSV(){
  const data=loadData();
  const rows=data.tickets.map(t=>{
    let status='未使用';
    let prizeName='';
    if(t.result==='lose'){status='ハズレ'}
    else if(t.result&&t.result!=='lose'){
      status='当選';
      const prize=data.prizes.find(p=>p.id===t.result);
      prizeName=prize?prize.name:t.result;
    }else if(t.used){status='使用済'}
    const time=t.usedAt?new Date(t.usedAt).toLocaleString('ja-JP'):'';
    return `${t.id},${status},${prizeName},${time}`;
  });
  const csv='チケットID,ステータス,当選商品,抽選日時\n'+rows.join('\n');
  const blob=new Blob(['﻿'+csv],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download='チケット一覧.csv';a.click();URL.revokeObjectURL(url);
}

// 当選したチケットだけを抽出して当選履歴一覧を描画する
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

// 当選履歴をCSVファイルとしてエクスポートする（BOM付きでExcel対応）
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

// リセット操作（全リセット・チケットリセット・商品削除）の確認ダイアログを表示する
let pendingReset=null;
let pendingPrizeId=null;
function confirmReset(type){
  pendingReset=type;
  document.getElementById('confirm-title').textContent=type==='all'?'全データリセット':'チケットリセット';
  document.getElementById('confirm-msg').textContent=type==='all'?'すべてのデータが削除されます。この操作は取り消せません。':'チケット一覧がリセットされます。よろしいですか？';
  document.getElementById('confirm-overlay').classList.add('show');
}

// リセットの確認ダイアログのOKボタン。pendingPrizeId（商品削除）またはpendingReset（リセット）を実行する
document.getElementById('confirm-ok').addEventListener('click',()=>{
  if(pendingPrizeId){
    const d=loadData();const prize=d.prizes.find(p=>p.id===pendingPrizeId);
    if(prize){d.settings.totalWinners-=prize.remainingWinners;d.settings.remainingWinners-=prize.remainingWinners;d.prizes=d.prizes.filter(p=>p.id!==pendingPrizeId);saveData(d);}
    closeConfirm();renderPrizeList();return;
  }
  if(pendingReset==='all')localStorage.removeItem(STORAGE_KEY);
  else if(pendingReset==='tickets'){const d=loadData();d.tickets=[];saveData(d)}
  closeConfirm();renderAdmin();
});

// 確認ダイアログを閉じ、保留中のアクションをクリアする
function closeConfirm(){document.getElementById('confirm-overlay').classList.remove('show');pendingReset=null;pendingPrizeId=null;}

// アプリ起動時の初期化。デザイン適用 → 抽選画面表示
(function init(){
  const data=loadData();applyDesign(data.design);showPage('main');
})();
