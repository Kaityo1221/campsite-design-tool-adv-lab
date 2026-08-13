import * as THREE from 'three';
import { App } from 'locar';
import { loadActivityAreas } from './kmz.js';
import { clearCrowd, renderCrowd } from './crowd.js';
import './styles.css';

const state = {
  activityAreas: [],
  arStarted: false,
  gpsReady: false,
  locar: null,
  selectedCount: 50,
  crowd: [],
  lastPosition: null,
  sourceName: ''
};

const el = {
  file: document.getElementById('kmzFile'),
  start: document.getElementById('startArBtn'),
  show: document.getElementById('showFutureBtn'),
  reset: document.getElementById('resetBtn'),
  fieldset: document.getElementById('peopleFieldset'),
  peopleButtons: document.getElementById('peopleButtons'),
  kmzStatus: document.getElementById('kmzStatus'),
  arStatus: document.getElementById('arStatus'),
  gpsStatus: document.getElementById('gpsStatus'),
  message: document.getElementById('message'),
  liveCard: document.getElementById('liveCard'),
  liveCount: document.getElementById('liveCount'),
  accuracy: document.getElementById('accuracyText'),
  panel: document.querySelector('.setup-panel')
};

function setMessage(text, type = '') {
  el.message.className = `message${type ? ` ${type}` : ''}`;
  el.message.textContent = text;
}

function updateControls() {
  el.start.disabled = !state.activityAreas.length || state.arStarted;
  el.fieldset.disabled = !state.arStarted;
  el.show.disabled = !state.activityAreas.length || !state.arStarted || !state.gpsReady;
}

function formatAccuracy(position) {
  const accuracy = Number(position?.coords?.accuracy);
  if (!Number.isFinite(accuracy)) return '精度不明';
  return `±${Math.round(accuracy)}m`;
}

function onGpsUpdate(event) {
  state.lastPosition = event.position;
  state.gpsReady = true;
  const accuracy = Number(event.position?.coords?.accuracy);
  el.gpsStatus.textContent = Number.isFinite(accuracy) ? `取得 ${formatAccuracy(event.position)}` : '取得済み';
  el.accuracy.textContent = `GPS ${formatAccuracy(event.position)}`;

  if (Number.isFinite(accuracy) && accuracy > 80) {
    setMessage('GPS精度が低めです。人物の位置が大きくずれる可能性があります。開けた場所で再取得してください。', 'warn');
  } else if (!state.crowd.length) {
    setMessage('準備完了です。人数を選び「未来を見る」を押してください。', 'ok');
  }
  updateControls();
}

function onGpsError(error) {
  state.gpsReady = false;
  const code = error?.code ? ` (${error.code})` : '';
  el.gpsStatus.textContent = `取得失敗${code}`;
  setMessage('位置情報を取得できませんでした。Safariの位置情報許可と端末の位置情報サービスを確認してください。', 'error');
  updateControls();
}

async function startAr() {
  if (!state.activityAreas.length || state.arStarted) return;
  el.start.disabled = true;
  el.arStatus.textContent = '起動中';
  setMessage('カメラとセンサーの許可を確認しています。');

  try {
    const app = new App({
      cameraOptions: { hFov: 80, near: 0.001, far: 1200 }
    });
    const locar = await app.start();
    state.locar = locar;
    state.arStarted = true;
    document.body.classList.add('ar-running');
    el.arStatus.textContent = '起動済み';
    el.liveCard.classList.remove('hidden');
    el.reset.classList.remove('hidden');

    locar.on('gpsupdate', onGpsUpdate);
    locar.on('gpserror', onGpsError);
    locar.startGps();

    setMessage('GPSを取得しています。端末を立てて周囲へ向けてください。');
    updateControls();
  } catch (error) {
    console.error(error);
    el.arStatus.textContent = '起動失敗';
    setMessage('ARを開始できませんでした。カメラ・モーションと方向・位置情報の許可を確認してください。HTTPS上で開く必要があります。', 'error');
    state.arStarted = false;
    updateControls();
  }
}

async function handleFile(file) {
  state.activityAreas = [];
  state.sourceName = '';
  el.kmzStatus.textContent = '解析中';
  setMessage('KMZをブラウザ内で解析しています。');
  updateControls();

  try {
    const result = await loadActivityAreas(file);
    state.activityAreas = result.polygons;
    state.sourceName = file.name;
    el.kmzStatus.textContent = `${result.polygons.length}範囲`;

    if (result.selection === 'single-fallback') {
      setMessage('活動範囲という名称は見つかりませんでしたが、Polygonが1件だけだったため試験用に採用しました。', 'warn');
    } else {
      setMessage(`活動範囲を${result.polygons.length}件読み込みました。次にカメラ・位置情報を開始してください。`, 'ok');
    }
  } catch (error) {
    console.error(error);
    el.kmzStatus.textContent = '失敗';
    setMessage(error?.message || 'KMZの解析に失敗しました。', 'error');
  }
  updateControls();
}

function showFuture() {
  if (!state.locar || !state.activityAreas.length || !state.gpsReady) return;

  renderCrowd({
    locar: state.locar,
    polygons: state.activityAreas,
    count: state.selectedCount,
    crowd: state.crowd
  });

  el.liveCount.textContent = `${state.selectedCount}人規模`;
  el.panel.classList.add('compact');
  setMessage(`${state.selectedCount}人を活動範囲内へ仮想配置しました。端末をゆっくり動かして周囲を見てください。`, 'ok');
}

el.file.addEventListener('change', event => {
  const file = event.target.files?.[0];
  if (!file) return;
  if (state.crowd.length && state.locar) clearCrowd(state.locar, state.crowd);
  handleFile(file);
});

el.start.addEventListener('click', startAr);
el.show.addEventListener('click', showFuture);

el.peopleButtons.addEventListener('click', event => {
  const button = event.target.closest('[data-count]');
  if (!button) return;
  state.selectedCount = Number(button.dataset.count) || 50;
  el.peopleButtons.querySelectorAll('button').forEach(item => item.classList.toggle('selected', item === button));
  if (state.crowd.length) {
    setMessage(`人数を${state.selectedCount}人へ変更しました。「未来を見る」を押すと再描画します。`);
  }
});

el.reset.addEventListener('click', () => {
  if (state.locar) clearCrowd(state.locar, state.crowd);
  location.reload();
});

window.addEventListener('pagehide', () => {
  if (state.locar) clearCrowd(state.locar, state.crowd);
});

updateControls();
