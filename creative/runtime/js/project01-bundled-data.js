(()=>{
  'use strict';
  const input=document.getElementById('fieldModeFile');
  const shell=document.getElementById('fieldModeEntryShell');
  if(!input||!shell)return;

  const projectBtn=shell.querySelector('#fieldDevProject01');
  const freeBtn=shell.querySelector('#fieldDevFreeCreative');
  const start=shell.querySelector('#fieldModeEntryStart');
  const filebar=shell.querySelector('.field-mode-entry-filebar');
  const state=shell.querySelector('#fieldModeEntryFileState');
  const hint=shell.querySelector('#fieldModeEntryHint');
  const filename=shell.querySelector('#fieldModeEntryFilename');
  const PROJECT_URL='projects/project01/kasai_rinkaipark.kmz';
  let loading=false;
  let bundledReady=false;

  function projectSelected(){return projectBtn?.classList.contains('is-selected');}

  async function loadBundledProject(){
    if(loading||bundledReady)return;
    loading=true;
    if(filebar)filebar.hidden=true;
    if(state)state.textContent='葛西臨海公園の練習MAPを準備中…';
    if(hint)hint.textContent='PROJECT 01の教材を自動で読み込んでいます';
    if(start)start.disabled=true;
    try{
      const res=await fetch(PROJECT_URL,{cache:'no-store'});
      if(!res.ok)throw new Error(`HTTP ${res.status}`);
      const blob=await res.blob();
      const file=new File([blob],'kasai_rinkaipark.kmz',{type:'application/vnd.google-earth.kmz'});
      const dt=new DataTransfer();
      dt.items.add(file);
      input.files=dt.files;
      if(filename)filename.textContent='kasai_rinkaipark.kmz';
      input.dispatchEvent(new Event('change',{bubbles:true}));

      let tries=0;
      const timer=setInterval(()=>{
        tries++;
        let ready=false;
        try{ready=!!fileLoaded;}catch(_){ready=false;}
        if(ready){
          clearInterval(timer);
          bundledReady=true;
          loading=false;
          if(state)state.textContent='葛西臨海公園の練習MAPを自動読込しました。';
          if(hint)hint.textContent='PROJECT 01を開始できます';
          if(start){start.disabled=false;start.classList.add('is-ready');}
        }else if(tries>100){
          clearInterval(timer);
          loading=false;
          if(state)state.textContent='練習MAPの読込に失敗しました。ページを再読み込みしてください。';
        }
      },120);
    }catch(err){
      loading=false;
      if(state)state.textContent='練習MAPの取得に失敗しました。';
      if(hint)hint.textContent='通信状態を確認して再読み込みしてください';
      console.error('[PROJECT01] bundled KMZ load failed',err);
    }
  }

  function useProjectMode(){
    if(filebar)filebar.hidden=true;
    loadBundledProject();
  }

  function useFreeMode(){
    if(filebar)filebar.hidden=false;
    bundledReady=false;
    try{fileLoaded=false;}catch(_){}
    input.value='';
    if(filename)filename.textContent='未選択';
    if(state)state.textContent='';
    if(hint)hint.textContent='ゲームスポット元データを選択してください';
    if(start){start.disabled=true;start.classList.remove('is-ready');}
  }

  projectBtn?.addEventListener('click',()=>setTimeout(useProjectMode,0));
  freeBtn?.addEventListener('click',()=>setTimeout(useFreeMode,0));

  if(projectSelected())useProjectMode();
})();
