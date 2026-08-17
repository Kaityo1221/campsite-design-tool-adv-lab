(()=>{
  'use strict';
  const body=document.body;
  const fileInput=document.getElementById('fieldModeFile');
  if(!body||!fileInput)return;

  const style=document.createElement('style');
  style.textContent=`
    .field-dev-badge{display:inline-block;margin-top:9px;padding:5px 10px;border:1px solid rgba(255,229,155,.58);border-radius:999px;background:rgba(40,32,22,.55);color:#f6d98c;font-size:10px;font-weight:950;letter-spacing:.14em;text-shadow:0 2px 8px #000}
    .field-dev-project-switch{width:min(100%,620px);display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:15px auto 0}
    .field-dev-project-choice{min-height:52px;border:1px solid rgba(255,239,200,.42);border-radius:16px;background:rgba(43,37,28,.72);color:#fff7e5;font-weight:950;box-shadow:0 8px 20px rgba(0,0,0,.24);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
    .field-dev-project-choice small{display:block;margin-top:3px;font-size:10px;font-weight:750;color:#d8cab0}
    .field-dev-project-choice.is-selected{border-color:#ffe29a;background:linear-gradient(180deg,rgba(119,84,25,.92),rgba(62,44,17,.94));color:#fff0b1;box-shadow:0 0 24px rgba(235,185,61,.48),0 8px 20px rgba(0,0,0,.3)}

    .field-project-hud{position:fixed;z-index:1700;left:10px;right:10px;bottom:calc(74px + env(safe-area-inset-bottom));max-width:560px;margin:auto;padding:11px;border:1px solid rgba(246,217,140,.62);border-radius:18px;background:linear-gradient(180deg,rgba(34,30,24,.94),rgba(20,18,15,.96));color:#fff8e8;box-shadow:0 10px 28px rgba(0,0,0,.36);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
    .field-project-hud-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}.field-project-hud-title{font-size:11px;font-weight:950;letter-spacing:.1em;color:#f5d37d}.field-project-progress{padding:4px 8px;border-radius:999px;background:#f1d16f;color:#3c2b0c;font-size:10px;font-weight:950}.field-project-guide{display:grid;grid-template-columns:62px 1fr;gap:9px;align-items:center}.field-project-guide img{width:62px;height:62px;object-fit:contain;border-radius:14px;background:rgba(255,255,255,.07)}.field-project-guide strong{display:block;font-size:13px}.field-project-guide p{margin:3px 0 0;font-size:11px;line-height:1.55;color:#eee1c9}.field-project-actions{display:flex;gap:7px;margin-top:9px}.field-project-actions button{flex:1;min-height:40px;border-radius:11px;border:1px solid #b8954d;background:#d9b65f;color:#34260e;font-weight:950}.field-project-actions button.secondary{background:rgba(255,255,255,.08);color:#fff8e8;border-color:rgba(255,255,255,.22)}

    .project01-note-stage{position:fixed;inset:0;z-index:2600;display:grid;place-items:center;padding:18px 14px calc(20px + env(safe-area-inset-bottom));background:radial-gradient(circle at 50% 20%,rgba(99,78,43,.30),transparent 40%),rgba(13,16,13,.86);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);overflow:hidden}
    .project01-note-stage[hidden]{display:none}.project01-note-wrap{width:min(92vw,430px);position:relative}.project01-note-kicker{text-align:center;color:#f1d57e;font-size:11px;font-weight:950;letter-spacing:.18em;margin-bottom:9px}.project01-note-hint{text-align:center;color:#fff5db;font-size:12px;line-height:1.5;margin:0 12px 12px}
    .project01-note-card{position:relative;padding:22px 18px 18px;border-radius:8px 8px 16px 10px;background:linear-gradient(176deg,#fff7c9 0%,#f7e8aa 62%,#eed98c 100%);color:#382e1e;box-shadow:0 22px 50px rgba(0,0,0,.45),inset 0 0 0 1px rgba(113,88,36,.28);touch-action:none;will-change:transform,opacity;transform-origin:50% 90%;transition:transform .16s ease,box-shadow .16s ease;overflow:hidden}
    .project01-note-card::before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.22;background:repeating-linear-gradient(0deg,transparent 0 27px,rgba(76,111,142,.35) 28px 29px),linear-gradient(90deg,transparent 0 31px,rgba(204,85,76,.36) 32px 33px,transparent 34px)}
    .project01-note-card.is-dragging{transition:none;box-shadow:0 30px 65px rgba(0,0,0,.5)}.project01-note-card.is-sent{transition:transform .42s cubic-bezier(.2,.85,.35,1),opacity .32s ease;transform:translate3d(0,-125vh,0) rotate(-11deg) scale(.72)!important;opacity:.08}
    .project01-note-title{position:relative;z-index:1;text-align:center;font-family:"Chalkboard SE","Bradley Hand","Klee One","Yu Kyokasho",cursive;font-weight:700;font-size:23px;transform:rotate(-1deg);margin-bottom:10px}.project01-note-place{position:relative;z-index:1;text-align:center;font-family:"Chalkboard SE","Bradley Hand","Klee One","Yu Kyokasho",cursive;font-size:14px;margin-bottom:14px;opacity:.75}
    .project01-note-label{position:relative;z-index:1;display:block;margin:10px 2px 4px;font-family:"Chalkboard SE","Bradley Hand","Klee One","Yu Kyokasho",cursive;font-size:16px;font-weight:700}.project01-note-input{position:relative;z-index:1;display:block;width:100%;min-height:92px;resize:none;border:0;border-bottom:2px solid rgba(73,59,33,.24);border-radius:6px;background:rgba(255,255,255,.08);padding:8px 7px;font-family:"Chalkboard SE","Bradley Hand","Klee One","Yu Kyokasho",cursive;font-size:18px;line-height:1.48;color:#352c1d;outline:none}.project01-note-input::placeholder{color:rgba(66,54,35,.42)}.project01-note-input:focus{background:rgba(255,255,255,.18);border-bottom-color:rgba(73,59,33,.5)}
    .project01-swipe-guide{position:relative;z-index:1;display:flex;justify-content:center;align-items:center;gap:7px;margin-top:14px;font-size:11px;font-weight:900;color:#665530;opacity:.82}.project01-swipe-arrow{font-size:25px;line-height:1;animation:project01Arrow 1s ease-in-out infinite}@keyframes project01Arrow{0%,100%{transform:translateY(4px);opacity:.45}50%{transform:translateY(-5px);opacity:1}}
    .project01-note-error{height:18px;text-align:center;margin-top:7px;font-size:11px;font-weight:900;color:#ffd7a8}.project01-note-close{display:block;margin:12px auto 0;border:0;background:transparent;color:#e9dcc0;font-weight:850;text-decoration:underline;text-underline-offset:3px}

    .project01-clear-flash{position:fixed;inset:0;z-index:3100;display:grid;place-items:center;pointer-events:none;background:radial-gradient(circle,rgba(255,236,146,.23),transparent 48%);opacity:0}.project01-clear-flash.show{animation:project01ClearStage 1.25s ease both}.project01-clear-word{font-size:clamp(62px,22vw,118px);font-weight:1000;letter-spacing:.08em;color:#fff6b0;text-shadow:0 0 14px rgba(255,220,91,.9),0 6px 0 rgba(80,55,5,.28),0 16px 34px rgba(0,0,0,.45);transform:scale(.55) rotate(-3deg)}.project01-clear-flash.show .project01-clear-word{animation:project01ClearWord 1.1s cubic-bezier(.18,.86,.29,1.22) both}@keyframes project01ClearStage{0%{opacity:0}12%,70%{opacity:1}100%{opacity:0}}@keyframes project01ClearWord{0%{transform:scale(.35) rotate(-7deg);opacity:0}32%{transform:scale(1.12) rotate(2deg);opacity:1}55%{transform:scale(.98) rotate(-1deg)}100%{transform:scale(1) rotate(0);opacity:0}}

    .project01-riku-result{position:fixed;inset:0;z-index:3000;display:grid;place-items:center;padding:18px 14px calc(18px + env(safe-area-inset-bottom));background:rgba(12,15,13,.84);backdrop-filter:blur(9px);-webkit-backdrop-filter:blur(9px)}.project01-riku-result[hidden]{display:none}.project01-riku-card{width:min(94vw,470px);border:1px solid rgba(246,217,140,.56);border-radius:22px;background:linear-gradient(180deg,rgba(42,37,30,.97),rgba(21,20,17,.98));box-shadow:0 20px 55px rgba(0,0,0,.46);padding:15px;color:#fff8e8}.project01-riku-head{display:grid;grid-template-columns:84px 1fr;gap:11px;align-items:center}.project01-riku-head img{width:84px;height:84px;object-fit:contain;border-radius:18px;background:rgba(255,255,255,.06)}.project01-riku-head strong{display:block;color:#f4d473;font-size:17px}.project01-riku-head p{font-size:12px;line-height:1.6;margin:4px 0 0;color:#eee1c9}.project01-example{margin-top:12px;padding:12px;border-radius:15px;background:rgba(255,248,222,.07);border:1px solid rgba(255,240,190,.18);font-size:12px;line-height:1.72;color:#f4ead3}.project01-example b{color:#ffd982}.project01-finish{width:100%;margin-top:12px;min-height:44px;border:1px solid #c19c4d;border-radius:13px;background:#ddba63;color:#38280d;font-weight:1000}

    @media(max-width:420px){.field-dev-project-switch{gap:6px}.field-dev-project-choice{font-size:12px}.field-project-hud{left:7px;right:7px;bottom:calc(68px + env(safe-area-inset-bottom))}.field-project-guide{grid-template-columns:54px 1fr}.field-project-guide img{width:54px;height:54px}.project01-note-card{padding:18px 15px 15px}.project01-note-input{min-height:82px;font-size:17px}}
  `;
  document.head.appendChild(style);

  let mode='project01';
  let projectActive=false;

  const shell=document.createElement('section');
  shell.id='fieldModeEntryShell';
  shell.className='field-mode-entry-shell';
  shell.innerHTML=`
    <div class="field-mode-entry-inner">
      <div class="field-mode-entry-kicker">CREATIVE MODE</div>
      <p class="field-mode-entry-copy">新しい世界の幕開けへ。</p>
      <div class="field-dev-badge">DEVELOPMENT / 開発版</div>
      <div class="field-dev-project-switch" role="group" aria-label="開始モード">
        <button id="fieldDevProject01" class="field-dev-project-choice is-selected" type="button">PROJECT 01<small>葛西臨海公園を観察せよ</small></button>
        <button id="fieldDevFreeCreative" class="field-dev-project-choice" type="button">FREE CREATIVE<small>自由に設計する</small></button>
      </div>
      <button id="fieldModeEntryStart" class="field-mode-entry-start" type="button" disabled>PROJECT 01をはじめる</button>
      <label class="field-mode-entry-filebar" for="fieldModeFile">
        <span class="field-mode-entry-fileicon">▱</span>
        <span><span class="field-mode-entry-filelabel">葛西臨海公園の練習MAPを選択</span><span id="fieldModeEntryFilename" class="field-mode-entry-filename">未選択</span></span>
        <span>›</span>
        <span id="fieldModeEntryFileSlot" class="field-mode-entry-file-slot"></span>
      </label>
      <div id="fieldModeEntryFileState" class="field-mode-entry-file-state"></div>
      <div id="fieldModeEntryHint" class="field-mode-entry-hint">先に練習用KMZを選択してください</div>
      <div id="fieldModeEntryResumeSlot" class="field-mode-entry-resume-slot"></div>
      <a class="field-mode-entry-main-link" href="../../index.html">開発版トップへ</a>
      <div class="field-mode-entry-transition">CREATIVE MODE</div>
    </div>`;
  body.appendChild(shell);

  const slot=shell.querySelector('#fieldModeEntryFileSlot');
  slot.appendChild(fileInput);
  const filename=shell.querySelector('#fieldModeEntryFilename');
  const state=shell.querySelector('#fieldModeEntryFileState');
  const hint=shell.querySelector('#fieldModeEntryHint');
  const start=shell.querySelector('#fieldModeEntryStart');
  const projectBtn=shell.querySelector('#fieldDevProject01');
  const freeBtn=shell.querySelector('#fieldDevFreeCreative');
  const resumeSlot=shell.querySelector('#fieldModeEntryResumeSlot');

  const resumePanel=document.getElementById('fieldModeResumePanel');
  const resumeStatus=document.getElementById('fieldModeSessionStatus');
  if(resumePanel)resumeSlot.appendChild(resumePanel);
  if(resumeStatus)resumeSlot.appendChild(resumeStatus);

  function isReady(){try{return !!fileLoaded;}catch(_){return false;}}
  function syncReady(){
    const ready=isReady();
    start.disabled=!ready;
    start.classList.toggle('is-ready',ready);
    if(ready){
      state.textContent='準備OK。練習MAPを読み込みました。';
      hint.textContent=mode==='project01'?'PROJECT 01を開始できます':'自由設計を開始できます';
    }
  }
  function setMode(next){
    mode=next;
    projectBtn.classList.toggle('is-selected',mode==='project01');
    freeBtn.classList.toggle('is-selected',mode==='free');
    start.textContent=mode==='project01'?'PROJECT 01をはじめる':'創作をはじめる';
    const label=shell.querySelector('.field-mode-entry-filelabel');
    if(label)label.textContent=mode==='project01'?'葛西臨海公園の練習MAPを選択':'ゲームスポット元データを選択';
    syncReady();
  }
  projectBtn.addEventListener('click',()=>setMode('project01'));
  freeBtn.addEventListener('click',()=>setMode('free'));

  fileInput.addEventListener('change',()=>{
    const f=fileInput.files&&fileInput.files[0];
    filename.textContent=f?f.name:'未選択';
    state.textContent=f?`読込中：${f.name}`:'';
    hint.textContent=f?'練習MAPを確認しています…':'先に練習用KMZを選択してください';
    let tries=0;
    const timer=setInterval(()=>{tries++;syncReady();if(isReady()||tries>80)clearInterval(timer);},150);
  });

  function removeProjectHud(){document.getElementById('fieldProjectHud')?.remove();}
  function renderProjectHud(){
    removeProjectHud();
    const hud=document.createElement('aside');
    hud.id='fieldProjectHud';
    hud.className='field-project-hud';
    hud.innerHTML=`
      <div class="field-project-hud-head"><div class="field-project-hud-title">PROJECT 01 / 葛西臨海公園を観察せよ</div><div class="field-project-progress">1 QUESTION</div></div>
      <div class="field-project-guide"><img src="assets/riku_decided.png" alt="リク"><div><strong>リク</strong><p>今回は設計しなくていい。地図を見て、この公園の「良いところ」と「気になるところ」をひとつずつ見つけてみよう。</p></div></div>
      <div class="field-project-actions"><button id="project01WriteMemo" type="button">📝 メモを書く</button><button id="project01HideGuide" class="secondary" type="button">地図をよく見る</button></div>`;
    body.appendChild(hud);
    hud.querySelector('#project01WriteMemo')?.addEventListener('click',openMemo);
    hud.querySelector('#project01HideGuide')?.addEventListener('click',()=>{hud.style.opacity='0.16';setTimeout(()=>hud.style.opacity='1',2500);});
  }

  const noteStage=document.createElement('section');
  noteStage.className='project01-note-stage';
  noteStage.hidden=true;
  noteStage.innerHTML=`
    <div class="project01-note-wrap">
      <div class="project01-note-kicker">PROJECT 01 / FIELD NOTE</div>
      <p class="project01-note-hint">正解を当てなくてOK。あなたが気づいたことを、そのまま書いてください。</p>
      <div id="project01NoteCard" class="project01-note-card">
        <div class="project01-note-title">公園観察メモ</div>
        <div class="project01-note-place">葛西臨海公園</div>
        <label class="project01-note-label" for="project01Merit">◎ 良いところ</label>
        <textarea id="project01Merit" class="project01-note-input" maxlength="180" placeholder="例：歩きやすそう、駅から近い…"></textarea>
        <label class="project01-note-label" for="project01Demerit">△ 気になるところ</label>
        <textarea id="project01Demerit" class="project01-note-input" maxlength="180" placeholder="例：暑そう、動線が長い…"></textarea>
        <div class="project01-swipe-guide"><span class="project01-swipe-arrow">↑</span><span>書けたら、メモを上へスワイプして送る</span></div>
      </div>
      <div id="project01NoteError" class="project01-note-error"></div>
      <button id="project01NoteClose" class="project01-note-close" type="button">地図に戻る</button>
    </div>`;
  body.appendChild(noteStage);

  const clearFlash=document.createElement('div');
  clearFlash.className='project01-clear-flash';
  clearFlash.innerHTML='<div class="project01-clear-word">CLEAR</div>';
  body.appendChild(clearFlash);

  const result=document.createElement('section');
  result.className='project01-riku-result';
  result.hidden=true;
  result.innerHTML=`
    <div class="project01-riku-card">
      <div class="project01-riku-head"><img src="assets/riku_decided.png" alt="リク"><div><strong>リク</strong><p>いい観察だな！ 正解はひとつじゃない。ほかにも、こんな見方ができるぞ。</p></div></div>
      <div class="project01-example">
        <b>たとえば葛西臨海公園なら…</b><br>
        駅の近くにはジムが集まっている。海までは距離があるけど、道はほぼ直線で分かりやすい。<br><br>
        ただ、日差しを遮る場所が少ないから、夏はかなり暑そうだ。<br><br>
        西側の東屋まで行ければ雨や日差しを避けられる。でも、そこまでみんなをどう動かすか。動線も考えどころだな！
      </div>
      <button id="project01Finish" class="project01-finish" type="button">PROJECT 01 完了</button>
    </div>`;
  body.appendChild(result);

  const card=noteStage.querySelector('#project01NoteCard');
  const merit=noteStage.querySelector('#project01Merit');
  const demerit=noteStage.querySelector('#project01Demerit');
  const error=noteStage.querySelector('#project01NoteError');
  let pointerId=null,startY=0,startX=0,dy=0,dx=0,sending=false;

  function openMemo(){
    if(!projectActive)return;
    noteStage.hidden=false;
    error.textContent='';
    card.classList.remove('is-sent','is-dragging');
    card.style.transform='';
    card.style.opacity='';
  }
  function closeMemo(){if(!sending)noteStage.hidden=true;}
  noteStage.querySelector('#project01NoteClose')?.addEventListener('click',closeMemo);

  function noteReady(){return merit.value.trim().length>0&&demerit.value.trim().length>0;}
  function resetDrag(){card.classList.remove('is-dragging');card.style.transform='';dy=0;dx=0;pointerId=null;}
  function sendNote(){
    if(sending)return;
    if(!noteReady()){
      error.textContent='「良いところ」と「気になるところ」を1つずつ書こう。';
      resetDrag();
      return;
    }
    sending=true;
    try{localStorage.setItem('project01-kasai-note',JSON.stringify({merit:merit.value.trim(),demerit:demerit.value.trim(),savedAt:new Date().toISOString()}));}catch(_){}
    card.classList.remove('is-dragging');
    card.classList.add('is-sent');
    error.textContent='';
    setTimeout(()=>{
      noteStage.hidden=true;
      clearFlash.classList.remove('show');
      void clearFlash.offsetWidth;
      clearFlash.classList.add('show');
      if(navigator.vibrate)navigator.vibrate([25,35,55]);
      setTimeout(()=>{result.hidden=false;},820);
    },330);
  }
  card.addEventListener('pointerdown',e=>{
    if(sending)return;
    if(e.target.closest('textarea'))return;
    pointerId=e.pointerId;startY=e.clientY;startX=e.clientX;dy=0;dx=0;card.setPointerCapture?.(pointerId);card.classList.add('is-dragging');
  });
  card.addEventListener('pointermove',e=>{
    if(pointerId!==e.pointerId||sending)return;
    dy=e.clientY-startY;dx=e.clientX-startX;
    if(dy<0){const rot=Math.max(-8,Math.min(8,dx/24));card.style.transform=`translate3d(${dx*.28}px,${dy}px,0) rotate(${rot}deg) scale(${Math.max(.92,1+dy/1600)})`;}
  });
  card.addEventListener('pointerup',e=>{
    if(pointerId!==e.pointerId||sending)return;
    if(dy<-95&&Math.abs(dy)>Math.abs(dx)*1.15)sendNote();else resetDrag();
  });
  card.addEventListener('pointercancel',resetDrag);

  result.querySelector('#project01Finish')?.addEventListener('click',()=>{
    result.hidden=true;
    projectActive=false;
    removeProjectHud();
    sending=false;
    try{window.FieldCreative?.exit?.();}catch(_){}
  });

  function startProject01(){
    projectActive=true;
    sending=false;
    window.FieldCreative?.enter?.();
    renderProjectHud();
  }

  start.addEventListener('click',()=>{
    if(!isReady())return;
    shell.classList.add('is-starting');
    setTimeout(()=>{
      shell.hidden=true;
      body.classList.add('field-mode-entry-started');
      try{map.invalidateSize();}catch(_){}
      if(mode==='project01')startProject01();
      else window.FieldCreative?.enter?.();
    },1500);
  });

  const statusNode=document.getElementById('fieldModeStatus');
  if(statusNode)new MutationObserver(syncReady).observe(statusNode,{childList:true,subtree:true,characterData:true});
  syncReady();
})();
