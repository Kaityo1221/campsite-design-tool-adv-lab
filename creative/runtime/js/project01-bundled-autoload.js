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
      const res=await fetch('project-data/project01/kasai_rinkaipark.kmz?v=20260817-3',{cache:'no-store'});
      if(!res.ok)throw new Error(`KMZ ${res.status}`);
      const blob=await res.blob();
      const file=new File([blob],'kasai_rinkaipark.kmz',{type:'application/vnd.google-earth.kmz'});
      const dt=new DataTransfer();
      dt.items.add(file);
      input.files=dt.files;
      input.dispatchEvent(new Event('change',{bubbles:true}));

      let tries=0;
      const timer=setInterval(()=>{
        tries++;
        let ready=false;
        try{ready=!!fileLoaded}catch(_){ready=false}
        if(ready){
          clearInterval(timer);
          loading=false;
          if(isProject()){
            syncChrome();
            start.disabled=false;
            start.classList.add('is-ready');
            start.textContent='PROJECT 01をはじめる';
          }
        }else if(tries>=150){
          clearInterval(timer);
          loading=false;
          console.error('[PROJECT01] bundled KMZ parse timeout');
        }
      },100);
    }catch(err){
      loading=false;
      console.error('[PROJECT01] bundled KMZ load failed',err);
    }
  }

  projectBtn.addEventListener('click',()=>{syncChrome();loadBundled();});
  freeBtn.addEventListener('click',syncChrome);
  syncChrome();
  if(isProject())loadBundled();
})();
