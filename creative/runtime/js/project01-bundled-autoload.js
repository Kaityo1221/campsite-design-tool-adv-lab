(()=>{
  'use strict';
  const input=document.getElementById('fieldModeFile');
  const projectBtn=document.getElementById('fieldDevProject01');
  const freeBtn=document.getElementById('fieldDevFreeCreative');
  const start=document.getElementById('fieldModeEntryStart');
  const shell=document.getElementById('fieldModeEntryShell');
  if(!input||!projectBtn||!freeBtn||!start||!shell)return;

  const fileBar=shell.querySelector('.field-mode-entry-filebar');
  const state=shell.querySelector('#fieldModeEntryFileState');
  const hint=shell.querySelector('#fieldModeEntryHint');
  let loading=false;

  const isProject=()=>projectBtn.classList.contains('is-selected');
  function syncChrome(){
    const on=isProject();
    if(fileBar)fileBar.style.display=on?'none':'';
    if(state)state.style.display=on?'none':'';
    if(hint)hint.style.display=on?'none':'';
  }

  async function loadBundled(){
    if(loading)return;
    loading=true;
    syncChrome();
    start.disabled=true;
    start.classList.remove('is-ready');
    try{
      const res=await fetch('project-data/project01/kasai_rinkaipark.kmz?v=20260817-6',{cache:'no-store'});
      if(!res.ok)throw new Error(`KMZ ${res.status}`);
      const blob=await res.blob();
      const file=new File([blob],'kasai_rinkaipark.kmz',{type:'application/vnd.google-earth.kmz'});

      fileLoaded=false;
      updateNewPoiButton();
      sourceFileName=file.name;
      fileStatus.textContent=`読込中：${file.name}`;
      modeStatus.textContent='読込中';

      const kmlText=await readKmlText(file);
      fileStatus.textContent=`選択中：${file.name}`;
      renderKml(kmlText);

      loading=false;
      if(isProject()&&fileLoaded){
        syncChrome();
        start.disabled=false;
        start.classList.add('is-ready');
        start.textContent='PROJECT 01をはじめる';
      }
    }catch(err){
      loading=false;
      console.error('[PROJECT01] bundled KMZ load failed',err);
      modeStatus.textContent='読込失敗';
      start.disabled=true;
      start.classList.remove('is-ready');
    }
  }

  projectBtn.addEventListener('click',()=>{syncChrome();loadBundled();});
  freeBtn.addEventListener('click',syncChrome);
  syncChrome();
  if(isProject())loadBundled();
})();