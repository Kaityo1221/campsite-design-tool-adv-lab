from pathlib import Path

path = Path('prototype/gungi-auto-room.html')
s = path.read_text(encoding='utf-8')


def replace_once(old: str, new: str, label: str) -> None:
    global s
    if old not in s:
        raise SystemExit(f'patch needle not found: {label}')
    s = s.replace(old, new, 1)


replace_once(
    '.park-demo{color:#fde68a}.strategy-scene.park-intro-active #map{filter:saturate(.8) brightness(.72)}',
    '.park-demo{color:#fde68a}.strategy-scene.park-intro-active #map{filter:saturate(.8) brightness(.72)}.strategy-scene.park-map-focus #map{filter:saturate(1.12) brightness(.94);box-shadow:inset 0 0 0 2px rgba(125,211,252,.72),0 0 30px rgba(56,189,248,.22)}@keyframes parkPulse{0%,100%{stroke-width:4;stroke-opacity:1;fill-opacity:.95}50%{stroke-width:8;stroke-opacity:.45;fill-opacity:.5}}@keyframes parkHalo{0%,100%{stroke-opacity:.72;fill-opacity:.12}50%{stroke-opacity:.22;fill-opacity:.04}}.park-highlight-pulse{animation:parkPulse 1.35s ease-in-out infinite}.park-highlight-halo{animation:parkHalo 1.7s ease-in-out infinite}.park-highlight-tooltip{background:rgba(4,16,30,.94);border:1px solid rgba(125,211,252,.72);color:#eaf5ff;border-radius:10px;box-shadow:0 8px 22px rgba(0,0,0,.35);font-size:11px;font-weight:900;padding:5px 8px}.park-highlight-tooltip:before{border-top-color:rgba(125,211,252,.72)}',
    'map focus css',
)

replace_once(
    '<script src="./gungi-park-intro.js?v=0.2.0"></script>',
    '<script src="./gungi-park-intro.js?v=0.3.0"></script>',
    'park story asset version',
)

needle = "  function focusWarning(w){highlightLayer.clearLayers();if(!w)return;"
insert = """  function focusParkMapPoint(focus){
    if(!focus||!Number.isFinite(Number(focus.lat))||!Number.isFinite(Number(focus.lon)))return false;
    highlightLayer.clearLayers();
    const lat=Number(focus.lat),lon=Number(focus.lon),label=`${focus.icon||'✨'} ${focus.title||'見どころ'}`;
    L.circle([lat,lon],{radius:70,color:'#38bdf8',weight:3,fillColor:'#7dd3fc',fillOpacity:.10,className:'park-highlight-halo',interactive:false}).addTo(highlightLayer);
    L.circleMarker([lat,lon],{radius:11,color:'#e0f2fe',weight:4,fillColor:'#38bdf8',fillOpacity:.95,className:'park-highlight-pulse'}).bindTooltip(label,{permanent:true,direction:'top',offset:[0,-12],className:'park-highlight-tooltip'}).addTo(highlightLayer);
    map.flyTo([lat,lon],17,{duration:.8});
    return true;
  }
  function restorePoiMap(){
    el.scene.classList.remove('park-map-focus');
    highlightLayer.clearLayers();
    if(points.length){drawPoints(points);return;}
    const park=window.GungiParkIntro?.modelFromResolved?.(parkIntroResolved);
    if(park?.parkFocus)map.flyTo([park.parkFocus.lat,park.parkFocus.lon],14,{duration:.7});
  }
  function renderMapStep(step){
    if(step?.restorePoiMap){restorePoiMap();return;}
    const focused=focusParkMapPoint(step?.mapFocus);
    el.scene.classList.toggle('park-map-focus',!!focused&&step?.mapFocus?.kind==='PARK_HIGHLIGHT');
    if(!focused&&String(step?.kind||'').startsWith('park-'))highlightLayer.clearLayers();
  }
"""
replace_once(needle, insert + needle, 'map focus functions')

old_render = "  function renderStep(i){const step=sequence[i];if(!step)return;stepIndex=i;setRikuExpression(step.rikuExpression||'normal');setActor(step.speaker);renderParkCard(step);el.dialog.textContent=step.text;if(step.warning)focusWarning(step.warning);if(step.event)focusEvent(step.event);if(step.eventRef)el.banner.textContent=`EVENT ${step.eventNo}/${step.eventTotal} · ${step.eventRef.title}`;else el.banner.textContent=step.banner||'ADV COUNCIL';sync();}"
new_render = "  function renderStep(i){const step=sequence[i];if(!step)return;stepIndex=i;setRikuExpression(step.rikuExpression||'normal');setActor(step.speaker);renderParkCard(step);renderMapStep(step);el.dialog.textContent=step.text;if(step.warning)focusWarning(step.warning);if(step.event)focusEvent(step.event);if(step.eventRef)el.banner.textContent=`EVENT ${step.eventNo}/${step.eventTotal} · ${step.eventRef.title}`;else el.banner.textContent=step.banner||'ADV COUNCIL';sync();}"
replace_once(old_render, new_render, 'render map sync')

replace_once(
    '⚔️ 自動軍議室 v0.3.4 + PARK STORY',
    '⚔️ 自動軍議室 v0.3.4 + PARK STORY MAP',
    'title',
)
replace_once(
    'KMZ → Park Intelligence → 公園紹介・見どころ → 24イベント判定 → リク＆ミナ軍議',
    'KMZ → Park Intelligence → 公園紹介・見どころMAP → 24イベント判定 → リク＆ミナ軍議',
    'subtitle',
)

path.write_text(s, encoding='utf-8')
print('Park Highlight map sync patch applied')
