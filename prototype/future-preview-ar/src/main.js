import { App } from 'locar';
import { loadActivityAreas } from './kmz.js';
import { clearCrowd, renderCrowd } from './crowd.js';
import './styles.css';

const state = {
  activityAreas: [],
  arStarted: false,
  cameraReady: false,
  gpsReady: false,
  locar: null,
  app: null,
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
  motionStatus: document.getElementById('motionStatus'),
  cameraStatus: document.getElementById('cameraStatus'),
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
  el.show.disabled = !state.activityAreas.length || !state.arStarted || !state.cameraReady || !state.gpsReady;
}

function formatAccuracy(position) {
  const accuracy = Number(position?.coords?.accuracy);
  if (!Number.isFinite(accuracy)) return '精度不明';
  return `±${Math.round(accuracy)}m`;
}

async function requestOrientationPermissionFromGesture() {
  el.motionStatus.textContent = '確認中';

  if (typeof window.DeviceOrientationEvent === 'undefined') {
    el.motionStatus.textContent = '非対応';
    throw new Error('この端末ではモーション・方向センサーを利用できません。');
  }

  const requestPermission = window.DeviceOrientationEvent.requestPermission;
  if (typeof requestPermission === 'function') {
    const result = await requestPermission.call(window.DeviceOrientationEvent);
    if (result !== 'granted') {
      el.motionStatus.textContent = '拒否';
      throw new Error('モーションと方向へのアクセスが許可されませんでした。Safariの設定を確認してください。');
    }
    el.motionStatus.textContent = '許可済み';
    return;
  }

  el.motionStatus.textContent = '利用可能';
}

function onGpsUpdate(event) {
  state.lastPosition = event.position;
  state.gpsReady = true;
  const accuracy = Number(event.position?.coords?.accuracy);
  el.gpsStatus.textContent = Number.isFinite(accuracy) ? `取得 ${formatAccuracy(event.position)}` : '取得済み';
  el.accuracy.textContent = `GPS ${formatAccuracy(event.position)}`;

  if (Number.isFinite(accuracy) && accuracy > 80) {
    setMessage('GPS精度が低めです。人物の位置が大きくずれる可能性があります。開けた場所で再取得してください。', 'warn');
  } else if (!state.crowd.length && state.cameraReady) {
    setMessage('準備完了です。現在地から50m以内を未来化します。人数を選び「未来を見る」を押してください。', 'ok');
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
  el.arStatus.textContent = '準備中';
  el.cameraStatus.textContent = '待機中';
  setMessage('iPhoneのモーション・方向へのアクセスを確認します。許可画面が出たら「許可」を選んでください。');

  try {
    // iOSでは requestPermission() をユーザーのタップ処理から直接呼ぶ必要がある。
    await requestOrientationPermissionFromGesture();

    el.cameraStatus.textContent = '起動中';
    setMessage('モーション・方向：OK。続いてカメラを開始します。');

    const app = new App({
      cameraOptions: { hFov: 80, near: 0.001, far: 1200 },
      deviceOrientationOptions: {
        enabled: true,
        enablePermissionDialog: false,
        smoothingFactor: 0.2
      },
      videoConstraints: { video: { facingMode: 'environment' } }
    });

    state.app = app;

    app.webcam.on('webcamstarted', () => {
      state.cameraReady = true;
      el.cameraStatus.textContent = '起動済み';
      if (state.gpsReady && !state.crowd.length) {
        setMessage('カメラ・モーション・GPSの準備ができました。「未来を見る」を押してください。', 'ok');
      }
      updateControls();
    });

    app.webcam.on('webcamerror', error => {
      state.cameraReady = false;
      el.cameraStatus.textContent = '起動失敗';
      setMessage(`カメラを開始できませんでした。Safariのカメラ許可を確認してください。${error?.code ? ` (${error.code})` : ''}`, 'error');
      updateControls();
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

    setMessage('ARは起動しました。カメラとGPSの準備完了を待っています。');
    updateControls();
  } catch (error) {
    console.error(error);
    el.arStatus.textContent = '起動失敗';
    if (el.cameraStatus.textContent === '起動中') el.cameraStatus.textContent = '未開始';
    setMessage(error?.message || 'ARを開始できませんでした。モーション・方向、カメラ、位置情報の許可を確認してください。', 'error');
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
      setMessage(`活動範囲を${result.polygons.length}件読み込みました。次にAR権限・カメラを開始してください。`, 'ok');
    }
  } catch (error) {
    console.error(error);
    el.kmzStatus.textContent = '失敗';
    setMessage(error?.message || 'KMZの解析に失敗しました。', 'error');
  }
  updateControls();
}

function showFuture() {
  if (!state.locar || !state.activityAreas.length || !state.gpsReady || !state.cameraReady) return;

  const coords = state.lastPosition?.coords;
  if (!coords) {
    setMessage('現在地がまだ取得できていません。', 'warn');
    return;
  }

  try {
    const result = renderCrowd({
      locar: state.locar,
      polygons: state.activityAreas,
      count: state.selectedCount,
      crowd: state.crowd,
      origin: { lat: coords.latitude, lng: coords.longitude }
    });

    if (result.placed === 0) {
      el.liveCount.textContent = '表示対象なし';
      setMessage('現在地から50m以内に活動範囲がありません。活動範囲の現地へ移動してから再度「未来を見る」を押してください。', 'warn');
      return;
    }

    el.liveCount.textContent = `${result.placed}人表示 / ${state.selectedCount}人設定`;
    el.panel.classList.add('compact');

    if (result.placed < result.requested) {
      setMessage(`現在地から50m以内かつ活動範囲内に${result.placed}人を仮想配置しました。範囲境界付近のため人数を一部絞っています。`, 'warn');
    } else {
      setMessage(`${result.placed}人を現在地から50m以内の活動範囲へ仮想配置しました。端末をゆっくり動かして周囲を見てください。`, 'ok');
    }
  } catch (error) {
    console.error(error);
    setMessage(error?.message || '仮想人物の配置に失敗しました。', 'error');
  }
}

function cleanup() {
  if (state.locar) clearCrowd(state.locar, state.crowd);
  state.app?.webcam?.dispose?.();
  state.app?.deviceOrientationControls?.dispose?.();
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
  cleanup();
  location.reload();
});

window.addEventListener('pagehide', cleanup);

updateControls();
