const fs = require('fs');
const path = require('path');

const hairPath = path.join(__dirname, 'avatar_hair_fit_editor.html');
const outPath = path.join(__dirname, 'avatar_body_head_fit_editor.html');
const hairHtml = fs.readFileSync(hairPath, 'utf8');
const start = hairHtml.indexOf('    const embeddedAssets = {');
const end = hairHtml.indexOf('    const storageKey =', start);

if (start < 0 || end < 0) {
  throw new Error('Cannot extract embedded avatar assets from avatar_hair_fit_editor.html');
}

const sharedAssetsBlock = hairHtml.slice(start, end).trimEnd();
const html = extractHtmlTemplate();

/* HTML_TEMPLATE_START
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Подстановка голов к телам</title>
  <style>
    :root {
      --bg: #f6dfaa;
      --panel: #fff0c2;
      --panel-2: #f4d78f;
      --line: #9b611f;
      --ink: #432813;
      --muted: #735c37;
      --green: #3f883d;
      --red: #a84932;
      --shadow: rgba(67, 40, 19, .22);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--ink);
      font: 16px/1.35 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    header {
      background: #9e601f;
      color: #fff5d5;
      border-bottom: 3px solid #684015;
      padding: 14px 16px;
    }
    h1 { margin: 0 0 6px; font-size: 24px; line-height: 1.1; }
    header p { margin: 0; max-width: 920px; }
    main {
      width: min(1180px, 100%);
      margin: 0 auto;
      padding: 14px;
      display: grid;
      grid-template-columns: minmax(280px, 360px) minmax(320px, 1fr);
      gap: 14px;
    }
    .panel {
      background: var(--panel);
      border: 3px solid var(--line);
      box-shadow: 5px 5px 0 var(--shadow);
      padding: 12px;
    }
    .panel h2 { margin: 0 0 10px; font-size: 17px; }
    .stack { display: grid; gap: 10px; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
    label { display: block; font-weight: 800; color: var(--muted); margin: 2px 0 4px; }
    button, input, select, textarea { width: 100%; font: inherit; border-radius: 7px; }
    button {
      min-height: 48px;
      padding: 10px 12px;
      border: 3px solid var(--line);
      background: var(--panel-2);
      color: var(--ink);
      font-weight: 900;
      box-shadow: 4px 4px 0 var(--shadow);
      cursor: pointer;
    }
    button.primary { background: var(--green); color: #fff; }
    button.danger { background: var(--red); color: #fff; }
    button.active { outline: 4px solid rgba(63, 136, 61, .25); background: #d9f0bf; }
    button:active { transform: translateY(1px); box-shadow: 2px 2px 0 var(--shadow); }
    input, select, textarea {
      background: #fff8e6;
      color: var(--ink);
      border: 3px solid var(--line);
      padding: 10px;
      font-weight: 700;
    }
    input[type="range"] { padding: 0; border: 0; background: transparent; }
    textarea {
      min-height: 130px;
      resize: vertical;
      font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace;
      font-size: 12px;
      font-weight: 600;
    }
    .stage-panel { display: grid; gap: 10px; align-content: start; }
    .stage-wrap { width: min(100%, 620px); margin: 0 auto; }
    .stage {
      position: relative;
      width: 100%;
      aspect-ratio: 1;
      overflow: hidden;
      touch-action: none;
      user-select: none;
      background:
        linear-gradient(90deg, rgba(67,40,19,.12) 1px, transparent 1px),
        linear-gradient(rgba(67,40,19,.12) 1px, transparent 1px),
        #f5dc99;
      background-size: 10% 10%;
      border: 5px solid var(--line);
      box-shadow: inset 0 0 0 3px #f7c66b;
    }
    .avatar-layer, .head-group {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      transform-origin: 50% 50%;
      pointer-events: none;
    }
    .avatar-layer { object-fit: contain; image-rendering: auto; }
    .head-group .avatar-layer { position: absolute; }
    .crosshair {
      position: absolute;
      inset: 0;
      pointer-events: none;
      background:
        linear-gradient(90deg, transparent 49.85%, rgba(67,40,19,.3) 50%, transparent 50.15%),
        linear-gradient(transparent 49.85%, rgba(67,40,19,.3) 50%, transparent 50.15%);
    }
    .status {
      width: min(100%, 620px);
      margin: 0 auto;
      background: rgba(255, 248, 230, .9);
      border: 2px solid rgba(155, 97, 31, .45);
      padding: 10px 12px;
      border-radius: 7px;
    }
    .small { color: var(--muted); font-size: 13px; margin: 0; }
    .hidden { visibility: hidden; }
    @media (max-width: 900px) {
      main { grid-template-columns: 1fr; padding: 10px; }
      h1 { font-size: 22px; }
      button { min-height: 54px; }
      .panel { box-shadow: 3px 3px 0 var(--shadow); }
    }
  </style>
</head>
<body>
  <header>
    <h1>Подстановка голов к телам</h1>
    <p>Тело остается на месте. Голова, глаза и оба слоя волос двигаются и масштабируются одним блоком.</p>
  </header>

  <main>
    <section class="panel stack">
      <h2>Проход</h2>
      <div class="row">
        <button id="maleBtn" type="button">Мужской</button>
        <button id="femaleBtn" type="button">Женский</button>
      </div>
      <div class="row">
        <button id="prevBtn" type="button">Назад</button>
        <button id="nextBtn" type="button" class="primary">Далее</button>
      </div>
    </section>

    <section class="stage-panel">
      <div class="stage-wrap">
        <div id="stage" class="stage">
          <div id="hairBackGroup" class="head-group">
            <img id="hairBackImg" class="avatar-layer" alt="">
          </div>
          <img id="bodyImg" class="avatar-layer" alt="">
          <div id="headGroup" class="head-group">
            <img id="headImg" class="avatar-layer" alt="">
            <img id="eyesImg" class="avatar-layer" alt="">
            <img id="hairFrontImg" class="avatar-layer" alt="">
          </div>
          <div class="crosshair"></div>
        </div>
      </div>
      <div id="status" class="status"></div>
    </section>

    <section class="panel stack">
      <h2>Тело и проверочная голова</h2>
      <div>
        <label for="passInput">Номер тела</label>
        <input id="passInput" type="number" min="1" step="1">
      </div>
      <div class="row">
        <button id="jumpBtn" type="button">Перейти</button>
        <button id="findBtn" type="button">Найти место</button>
      </div>
      <div>
        <label for="bodySelect">Тело</label>
        <select id="bodySelect"></select>
      </div>
      <div class="row">
        <div>
          <label for="levelSelect">Уровень</label>
          <select id="levelSelect"></select>
        </div>
        <div>
          <label for="numberSelect">Вариант</label>
          <select id="numberSelect"></select>
        </div>
      </div>
      <h2>Проверочная голова</h2>
      <div>
        <label for="headSelect">Голова</label>
        <select id="headSelect"></select>
      </div>
      <div>
        <label for="eyesSelect">Глаза</label>
        <select id="eyesSelect"></select>
      </div>
      <div>
        <label for="hairSelect">Волосы</label>
        <select id="hairSelect"></select>
      </div>
    </section>

    <section class="panel stack">
      <h2>Положение головы на теле</h2>
      <div class="row-3">
        <div>
          <label for="dxInput">dx</label>
          <input id="dxInput" type="number" step="0.25">
        </div>
        <div>
          <label for="dyInput">dy</label>
          <input id="dyInput" type="number" step="0.25">
        </div>
        <div>
          <label for="scaleNumber">scale</label>
          <input id="scaleNumber" type="number" step="0.005" min="0.6" max="1.5">
        </div>
      </div>
      <input id="scaleInput" type="range" min="0.6" max="1.5" step="0.005">
      <h2>Общий размер пола</h2>
      <div class="row">
        <div>
          <label for="genderScaleNumber">Размер голов</label>
          <input id="genderScaleNumber" type="number" step="0.005" min="0.75" max="1.15">
        </div>
        <button id="resetGenderScaleBtn" type="button">Сброс размера</button>
      </div>
      <input id="genderScaleInput" type="range" min="0.75" max="1.15" step="0.005">
      <div class="row-3">
        <button class="hidden" type="button"></button>
        <button data-nudge="0,-1" type="button">Вверх</button>
        <button class="hidden" type="button"></button>
        <button data-nudge="-1,0" type="button">Влево</button>
        <button data-nudge="0,1" type="button">Вниз</button>
        <button data-nudge="1,0" type="button">Вправо</button>
      </div>
      <div class="row">
        <div>
          <label for="stepInput">Шаг</label>
          <input id="stepInput" type="number" step="0.25" value="0.5">
        </div>
        <div>
          <label for="zoomSelect">Вид</label>
          <select id="zoomSelect">
            <option value="1">Все тело</option>
            <option value="1.35" selected>Верх тела</option>
            <option value="1.7">Крупно</option>
          </select>
        </div>
      </div>
      <div class="row">
        <button id="saveBtn" type="button" class="primary">Сохранить</button>
        <button id="resetBtn" type="button" class="danger">Сбросить тело</button>
      </div>
      <p class="small">В рамке один палец двигает всю голову. Два пальца меняют масштаб головы целиком.</p>
    </section>

    <section class="panel stack">
      <h2>Сохранения</h2>
      <div class="row">
        <button id="storageReportBtn" type="button">Проверить головы</button>
        <button id="copyBtn" type="button">Копировать JSON</button>
      </div>
      <textarea id="jsonBox" spellcheck="false"></textarea>
      <div class="row">
        <button id="importBtn" type="button" class="primary">Импорт JSON</button>
        <button id="clearBodyBtn" type="button" class="danger">Очистить тела</button>
      </div>
      <p class="small">Если сохранение голов не найдено, вставь сюда JSON из редактора волос и нажми импорт.</p>
    </section>
  </main>

  <script>
__SHARED_ASSETS_BLOCK__

    const hairStorageKey = 'khroniki.avatarHairFit.v1';
    const bodyStorageKey = 'khroniki.avatarBodyHeadFit.v1';
    const bodyRenderVersion = 2;
    const internalEditorZoom = 2.25;
    const bodyRoot = 'avatar_editor_hq_assets';
    const outfitDefault = { dx: -0.3, dy: 9.18, scale: 0.82 };
    const groupDefault = { dx: 0, dy: 0, scale: 0.4444 };
    const genderScaleDefaults = { male: 1, female: 0.94 };

    const els = {
      maleBtn: document.getElementById('maleBtn'),
      femaleBtn: document.getElementById('femaleBtn'),
      prevBtn: document.getElementById('prevBtn'),
      nextBtn: document.getElementById('nextBtn'),
      pass: document.getElementById('passInput'),
      jumpBtn: document.getElementById('jumpBtn'),
      findBtn: document.getElementById('findBtn'),
      bodySelect: document.getElementById('bodySelect'),
      levelSelect: document.getElementById('levelSelect'),
      numberSelect: document.getElementById('numberSelect'),
      headSelect: document.getElementById('headSelect'),
      eyesSelect: document.getElementById('eyesSelect'),
      hairSelect: document.getElementById('hairSelect'),
      stage: document.getElementById('stage'),
      body: document.getElementById('bodyImg'),
      hairBackGroup: document.getElementById('hairBackGroup'),
      headGroup: document.getElementById('headGroup'),
      imgs: {
        hairBack: document.getElementById('hairBackImg'),
        head: document.getElementById('headImg'),
        eyes: document.getElementById('eyesImg'),
        hairFront: document.getElementById('hairFrontImg'),
      },
      status: document.getElementById('status'),
      dx: document.getElementById('dxInput'),
      dy: document.getElementById('dyInput'),
      scale: document.getElementById('scaleInput'),
      scaleNumber: document.getElementById('scaleNumber'),
      genderScale: document.getElementById('genderScaleInput'),
      genderScaleNumber: document.getElementById('genderScaleNumber'),
      resetGenderScaleBtn: document.getElementById('resetGenderScaleBtn'),
      step: document.getElementById('stepInput'),
      zoom: document.getElementById('zoomSelect'),
      saveBtn: document.getElementById('saveBtn'),
      resetBtn: document.getElementById('resetBtn'),
      storageReportBtn: document.getElementById('storageReportBtn'),
      copyBtn: document.getElementById('copyBtn'),
      importBtn: document.getElementById('importBtn'),
      clearBodyBtn: document.getElementById('clearBodyBtn'),
      json: document.getElementById('jsonBox'),
    };

    let hairState = loadHairState();
    let bodyState = loadBodyState();
    let gender = 'male';
    let bodyIndex = 0;

    function emptyHairState() {
      return { version: 1, presets: { male: { heads: {} }, female: { heads: {} } }, progress: {} };
    }

    function emptyBodyState() {
      return {
        version: 1,
        unit: 'RewardAvatarStack headGroup AvatarLayerTweak dx/dy/scale',
        renderVersion: bodyRenderVersion,
        createdAt: new Date().toISOString(),
        genderScale: { ...genderScaleDefaults },
        progress: { male: { bodyIndex: 0 }, female: { bodyIndex: 0 } },
        presets: { male: { bodies: {} }, female: { bodies: {} } },
      };
    }

    function normalizeHairState(data) {
      const normalized = emptyHairState();
      if (data?.presets) {
        normalized.version = data.version || 1;
        normalized.createdAt = data.createdAt;
        normalized.updatedAt = data.updatedAt;
        normalized.progress = data.progress || {};
        normalized.presets.male.heads = data.presets.male?.heads || {};
        normalized.presets.female.heads = data.presets.female?.heads || {};
      }
      return normalized;
    }

    function normalizeBodyState(data) {
      const normalized = emptyBodyState();
      if (data?.presets) {
        normalized.version = data.version || 1;
        normalized.unit = data.unit || normalized.unit;
        normalized.renderVersion = data.renderVersion || 1;
        normalized.createdAt = data.createdAt || normalized.createdAt;
        normalized.updatedAt = data.updatedAt;
        normalized.genderScale = {
          ...genderScaleDefaults,
          ...(data.genderScale || {}),
        };
        normalized.progress = data.progress || normalized.progress;
        normalized.presets.male.bodies = data.presets.male?.bodies || {};
        normalized.presets.female.bodies = data.presets.female?.bodies || {};
      }
      normalized.progress.male ||= { bodyIndex: 0 };
      normalized.progress.female ||= { bodyIndex: 0 };
      normalized.genderScale ||= { ...genderScaleDefaults };
      normalized.genderScale.male = Number.isFinite(Number(normalized.genderScale.male))
        ? Number(normalized.genderScale.male)
        : genderScaleDefaults.male;
      normalized.genderScale.female = Number.isFinite(Number(normalized.genderScale.female))
        ? Number(normalized.genderScale.female)
        : genderScaleDefaults.female;
      normalized.presets.male ||= { bodies: {} };
      normalized.presets.female ||= { bodies: {} };
      normalized.presets.male.bodies ||= {};
      normalized.presets.female.bodies ||= {};
      if (normalized.renderVersion !== bodyRenderVersion) {
        for (const bodies of [normalized.presets.male.bodies, normalized.presets.female.bodies]) {
          for (const tweak of Object.values(bodies || {})) {
            if (Number.isFinite(Number(tweak?.scale))) {
              tweak.scale = round(Number(tweak.scale) / internalEditorZoom, 4);
            }
          }
        }
        normalized.renderVersion = bodyRenderVersion;
      }
      return normalized;
    }

    function loadHairState() {
      try { return normalizeHairState(JSON.parse(localStorage.getItem(hairStorageKey) || 'null')); }
      catch { return emptyHairState(); }
    }

    function loadBodyState() {
      try { return normalizeBodyState(JSON.parse(localStorage.getItem(bodyStorageKey) || 'null')); }
      catch { return emptyBodyState(); }
    }

    function saveBodyState() {
      bodyState.renderVersion = bodyRenderVersion;
      bodyState.updatedAt = new Date().toISOString();
      localStorage.setItem(bodyStorageKey, JSON.stringify(bodyState));
    }

    function sourceFor(path) {
      return embeddedAssets[path] || path;
    }

    function round(value, digits = 2) {
      return Number(Number(value).toFixed(digits));
    }

    function cloneTweak(tweak) {
      return { dx: Number(tweak.dx), dy: Number(tweak.dy), scale: Number(tweak.scale) };
    }

    function bodyEntriesFor(nextGender = gender) {
      const prefix = nextGender === 'male' ? 'm' : 'f';
      const dir = nextGender === 'male' ? 'male' : 'female';
      const levels = nextGender === 'male'
        ? Array.from({ length: 11 }, (_, i) => i + 1)
        : Array.from({ length: 4 }, (_, i) => i + 8);
      return levels.flatMap(level => Array.from({ length: 10 }, (_, i) => {
        const number = i + 1;
        const id = `outfit_${prefix}_lvl${pad(level)}_fullbody_${pad(number)}`;
        return { id, level, number, path: `${bodyRoot}/${dir}/${id}_hq.png` };
      }));
    }

    function bodies() {
      return bodyEntriesFor(gender);
    }

    function currentBody() {
      const list = bodies();
      return list[Math.max(0, Math.min(list.length - 1, bodyIndex))] || list[0];
    }

    function currentIds() {
      const headId = els.headSelect.value || idFromPath(assets[gender].heads[0]);
      const eyesId = els.eyesSelect.value || defaultEyesFor(gender, headId);
      const hairId = els.hairSelect.value || assets[gender].hairs[0].id;
      const hair = assets[gender].hairs.find(item => item.id === hairId) || assets[gender].hairs[0];
      return { gender, headId, eyesId, hairId, hair };
    }

    function defaultEyesFor(nextGender, headId) {
      const number = headId.match(/_(\d{2})$/)?.[1] || '01';
      if (nextGender === 'female') return `eyes_f_gen_${number}`;
      if (headId.includes('_gen_b_')) return `eyes_m_gen_b_${number}`;
      return `eyes_m_gen_${number}`;
    }

    function firstFemaleHeadId() {
      return idFromPath(assets.female.heads[0]);
    }

    function femaleTemplateTweak(layer, eyesId, hairId) {
      const template = hairState.presets.female?.heads?.[firstFemaleHeadId()];
      if (!template) return null;
      if (layer === 'eyes') return template.eyes?.[eyesId] || null;
      if (layer === 'hairBack') return template.hair?.[hairId]?.back || null;
      if (layer === 'hairFront') return template.hair?.[hairId]?.front || null;
      return null;
    }

    function baseTweakFor(layer, nextGender, eyesId, hairId) {
      const base = (nextGender === 'female' ? femaleDefaults : defaults)[layer] || defaults[layer];
      return (nextGender === 'female' ? femaleTemplateTweak(layer, eyesId, hairId) : null) || base;
    }

    function savedLayerTweak(layer) {
      const ids = currentIds();
      const head = hairState.presets[ids.gender]?.heads?.[ids.headId];
      const base = baseTweakFor(layer, ids.gender, ids.eyesId, ids.hairId);
      if (!head) return cloneTweak(base);
      if (layer === 'head') return cloneTweak(head.head || base);
      if (layer === 'eyes') return cloneTweak(head.eyes?.[ids.eyesId] || base);
      if (layer === 'hairBack') return cloneTweak(head.hair?.[ids.hairId]?.back || base);
      if (layer === 'hairFront') return cloneTweak(head.hair?.[ids.hairId]?.front || base);
      return cloneTweak(base);
    }

    function bodyPreset() {
      return bodyState.presets[gender].bodies[currentBody().id] || cloneTweak(groupDefault);
    }

    function currentGenderScale() {
      return Number(bodyState.genderScale?.[gender] || genderScaleDefaults[gender] || 1);
    }

    function setCurrentGenderScale(value) {
      bodyState.genderScale ||= { ...genderScaleDefaults };
      bodyState.genderScale[gender] = round(Math.max(0.75, Math.min(1.15, Number(value) || 1)), 4);
      saveBodyState();
    }

    function setBodyPreset(tweak) {
      bodyState.presets[gender].bodies[currentBody().id] = cloneTweak(tweak);
      bodyState.progress[gender] ||= {};
      bodyState.progress[gender].bodyIndex = bodyIndex;
      saveBodyState();
    }

    function countHairPieces(heads) {
      const entries = Object.entries(heads || {});
      let headTweaks = 0;
      let eyesTweaks = 0;
      let hairBackTweaks = 0;
      let hairFrontTweaks = 0;
      for (const [, head] of entries) {
        if (head?.head) headTweaks += 1;
        eyesTweaks += Object.keys(head?.eyes || {}).length;
        for (const hair of Object.values(head?.hair || {})) {
          if (hair?.back) hairBackTweaks += 1;
          if (hair?.front) hairFrontTweaks += 1;
        }
      }
      return { heads: entries.length, headTweaks, eyesTweaks, hairBackTweaks, hairFrontTweaks };
    }

    function populateSelect(select, values, labelFn) {
      const previous = select.value;
      select.innerHTML = '';
      values.forEach((value, index) => {
        const option = document.createElement('option');
        option.value = typeof value === 'string' ? idFromPath(value) : value.id;
        option.textContent = labelFn(value, index);
        select.appendChild(option);
      });
      if ([...select.options].some(option => option.value === previous)) select.value = previous;
    }

    function populateAvatarSelects() {
      populateSelect(els.headSelect, assets[gender].heads, value => idFromPath(value));
      populateSelect(els.eyesSelect, assets[gender].eyes, value => idFromPath(value));
      populateSelect(els.hairSelect, assets[gender].hairs, value => value.id);
      els.headSelect.value ||= idFromPath(assets[gender].heads[0]);
      els.eyesSelect.value = defaultEyesFor(gender, els.headSelect.value);
      els.hairSelect.value ||= assets[gender].hairs[0].id;
    }

    function populateBodyControls() {
      const list = bodies();
      populateSelect(els.bodySelect, list, (value, index) => `${index + 1}. lvl${pad(value.level)} body${pad(value.number)}`);
      els.bodySelect.value = currentBody().id;
      const levels = [...new Set(list.map(item => item.level))];
      els.levelSelect.innerHTML = '';
      levels.forEach(level => {
        const option = document.createElement('option');
        option.value = String(level);
        option.textContent = `lvl${pad(level)}`;
        els.levelSelect.appendChild(option);
      });
      els.levelSelect.value = String(currentBody().level);
      els.numberSelect.innerHTML = '';
      for (let number = 1; number <= 10; number += 1) {
        const option = document.createElement('option');
        option.value = String(number);
        option.textContent = `body${pad(number)}`;
        els.numberSelect.appendChild(option);
      }
      els.numberSelect.value = String(currentBody().number);
      els.pass.max = list.length;
      els.pass.value = bodyIndex + 1;
    }

    function setGender(nextGender) {
      saveCurrent({ silent: true });
      gender = nextGender;
      bodyIndex = Math.max(0, Math.min(bodies().length - 1, Number(bodyState.progress?.[gender]?.bodyIndex || 0)));
      populateAvatarSelects();
      populateBodyControls();
      render();
    }

    function findFirstUnsaved() {
      const list = bodies();
      const store = bodyState.presets[gender].bodies || {};
      const first = list.findIndex(item => !store[item.id]);
      bodyIndex = first < 0 ? list.length - 1 : first;
      populateBodyControls();
      render();
    }

    function moveBody(delta) {
      saveCurrent({ silent: true });
      bodyIndex = Math.max(0, Math.min(bodies().length - 1, bodyIndex + delta));
      bodyState.progress[gender] ||= {};
      bodyState.progress[gender].bodyIndex = bodyIndex;
      saveBodyState();
      populateBodyControls();
      render();
    }

    function jumpToBodyIndex(index) {
      saveCurrent({ silent: true });
      bodyIndex = Math.max(0, Math.min(bodies().length - 1, index));
      bodyState.progress[gender] ||= {};
      bodyState.progress[gender].bodyIndex = bodyIndex;
      saveBodyState();
      populateBodyControls();
      render();
    }

    function jumpToLevelNumber() {
      const level = Number(els.levelSelect.value);
      const number = Number(els.numberSelect.value);
      const index = bodies().findIndex(item => item.level === level && item.number === number);
      if (index >= 0) jumpToBodyIndex(index);
    }

    function renderLayer(layer, tweak) {
      const unit = els.stage.clientWidth / 128;
      els.imgs[layer].style.transform = `translate(${tweak.dx * unit}px, ${tweak.dy * unit}px) scale(${tweak.scale * internalEditorZoom})`;
    }

    function render() {
      const body = currentBody();
      const ids = currentIds();
      const group = bodyPreset();
      const unit = els.stage.clientWidth / 128;
      const viewZoom = Number(els.zoom.value || 1);
      const viewY = viewZoom === 1 ? 0 : (viewZoom === 1.35 ? 30 : 48);
      const finalHeadScale = group.scale * currentGenderScale() * viewZoom;

      els.body.src = body.path;
      els.body.style.transform = `translate(${outfitDefault.dx * unit}px, ${(outfitDefault.dy + viewY) * unit}px) scale(${outfitDefault.scale * viewZoom})`;
      els.hairBackGroup.style.transform = `translate(${group.dx * unit}px, ${(group.dy + viewY) * unit}px) scale(${finalHeadScale})`;
      els.headGroup.style.transform = `translate(${group.dx * unit}px, ${(group.dy + viewY) * unit}px) scale(${finalHeadScale})`;

      els.imgs.hairBack.src = sourceFor(ids.hair.back);
      els.imgs.head.src = sourceFor(assets[gender].heads.find(path => idFromPath(path) === ids.headId) || assets[gender].heads[0]);
      els.imgs.eyes.src = sourceFor(assets[gender].eyes.find(path => idFromPath(path) === ids.eyesId) || assets[gender].eyes[0]);
      els.imgs.hairFront.src = sourceFor(ids.hair.front);

      renderLayer('hairBack', savedLayerTweak('hairBack'));
      renderLayer('head', savedLayerTweak('head'));
      renderLayer('eyes', savedLayerTweak('eyes'));
      renderLayer('hairFront', savedLayerTweak('hairFront'));

      els.dx.value = round(group.dx);
      els.dy.value = round(group.dy);
      els.scale.value = round(group.scale, 4);
      els.scaleNumber.value = round(group.scale, 4);
      els.genderScale.value = round(currentGenderScale(), 4);
      els.genderScaleNumber.value = round(currentGenderScale(), 4);
      els.maleBtn.classList.toggle('active', gender === 'male');
      els.femaleBtn.classList.toggle('active', gender === 'female');
      updateStatus();
      els.json.value = exportBodyJson();
    }

    function updateStatus() {
      const body = currentBody();
      const ids = currentIds();
      const male = countHairPieces(hairState.presets.male?.heads);
      const female = countHairPieces(hairState.presets.female?.heads);
      const savedBodies = Object.keys(bodyState.presets[gender].bodies || {}).length;
      const totalBodies = bodies().length;
      els.status.innerHTML = `
        <b>${gender === 'male' ? 'Мужской' : 'Женский'} проход:</b> ${bodyIndex + 1}/${totalBodies}<br>
        Тело: <b>${body.id}</b>, сохранено тел: <b>${savedBodies}/${totalBodies}</b><br>
        Общий размер голов пола: <b>${round(currentGenderScale(), 4)}</b><br>
        Проверочная голова: <b>${ids.headId}</b>, глаза: <b>${ids.eyesId}</b>, волосы: <b>${ids.hairId}</b><br>
        Сохраненные головы: мужские <b>${male.heads}</b>, женские <b>${female.heads}</b>. Если здесь нули, вставь экспорт из редактора волос в поле JSON и нажми импорт.
      `;
    }

    function saveCurrent(options = {}) {
      if (!currentBody()) return;
      setBodyPreset({
        dx: Number(els.dx.value || 0),
        dy: Number(els.dy.value || 0),
        scale: Number(els.scaleNumber.value || els.scale.value || 1),
      });
      if (!options.silent) render();
    }

    function updateFromInputs() {
      saveCurrent({ silent: true });
      render();
    }

    function nudge(dx, dy) {
      const step = Number(els.step.value || 0.5);
      const group = bodyPreset();
      group.dx = round(group.dx + dx * step);
      group.dy = round(group.dy + dy * step);
      setBodyPreset(group);
      render();
    }

    function resetCurrentBody() {
      delete bodyState.presets[gender].bodies[currentBody().id];
      saveBodyState();
      render();
    }

    function exportBodyJson() {
      bodyState.updatedAt = new Date().toISOString();
      return JSON.stringify(bodyState, null, 2);
    }

    function showStorageReport() {
      hairState = loadHairState();
      const male = countHairPieces(hairState.presets.male?.heads);
      const female = countHairPieces(hairState.presets.female?.heads);
      els.json.value = JSON.stringify({
        hairStorageKey,
        hairUpdatedAt: hairState.updatedAt || null,
        male,
        female,
        bodyStorageKey,
        bodyUpdatedAt: bodyState.updatedAt || null,
        genderScale: bodyState.genderScale || null,
        savedBodies: {
          male: Object.keys(bodyState.presets.male.bodies || {}).length,
          female: Object.keys(bodyState.presets.female.bodies || {}).length,
        },
      }, null, 2);
      updateStatus();
    }

    async function copyJson() {
      const text = exportBodyJson();
      els.json.value = text;
      try { await navigator.clipboard.writeText(text); }
      catch { els.json.select(); document.execCommand('copy'); }
    }

    function importJson() {
      const parsed = JSON.parse(els.json.value);
      if (parsed?.unit === 'RewardAvatarStack AvatarLayerTweak dx/dy/scale' || parsed?.presets?.male?.heads || parsed?.presets?.female?.heads) {
        hairState = normalizeHairState(parsed);
        hairState.updatedAt = new Date().toISOString();
        localStorage.setItem(hairStorageKey, JSON.stringify(hairState));
      } else {
        bodyState = normalizeBodyState(parsed);
        saveBodyState();
      }
      populateAvatarSelects();
      populateBodyControls();
      render();
      showStorageReport();
    }

    function clearBodySettings() {
      if (!confirm('Очистить сохраненную подстановку голов к телам? Настройки волос и глаз не трогаю.')) return;
      localStorage.removeItem(bodyStorageKey);
      bodyState = emptyBodyState();
      bodyIndex = 0;
      populateBodyControls();
      render();
    }

    function distanceBetween(a, b) {
      return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    }

    function midpointBetween(a, b) {
      return { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 };
    }

    const pointers = new Map();
    let gesture = null;

    function stageUnit() {
      return els.stage.clientWidth / 128;
    }

    function startDrag(pointer) {
      gesture = {
        type: 'drag',
        pointerId: pointer.pointerId,
        startX: pointer.clientX,
        startY: pointer.clientY,
        startTweak: bodyPreset(),
      };
    }

    function startPinch() {
      const active = [...pointers.values()];
      if (active.length < 2) return;
      const [a, b] = active;
      gesture = {
        type: 'pinch',
        startDistance: Math.max(1, distanceBetween(a, b)),
        startMid: midpointBetween(a, b),
        startTweak: bodyPreset(),
      };
    }

    function applyGesture() {
      if (!gesture) return;
      const unit = stageUnit();
      if (!unit) return;
      if (gesture.type === 'drag') {
        const pointer = pointers.get(gesture.pointerId);
        if (!pointer) return;
        const next = cloneTweak(gesture.startTweak);
        next.dx = round(gesture.startTweak.dx + (pointer.clientX - gesture.startX) / unit);
        next.dy = round(gesture.startTweak.dy + (pointer.clientY - gesture.startY) / unit);
        setBodyPreset(next);
        render();
        return;
      }
      if (gesture.type === 'pinch' && pointers.size >= 2) {
        const [a, b] = [...pointers.values()];
        const distance = Math.max(1, distanceBetween(a, b));
        const mid = midpointBetween(a, b);
        const next = cloneTweak(gesture.startTweak);
        next.dx = round(gesture.startTweak.dx + (mid.x - gesture.startMid.x) / unit);
        next.dy = round(gesture.startTweak.dy + (mid.y - gesture.startMid.y) / unit);
        next.scale = round(Math.max(0.6, Math.min(1.5, gesture.startTweak.scale * distance / gesture.startDistance)), 4);
        setBodyPreset(next);
        render();
      }
    }

    function finishGesture(pointerId) {
      pointers.delete(pointerId);
      if (pointers.size >= 2) startPinch();
      else if (pointers.size === 1) startDrag([...pointers.values()][0]);
      else {
        gesture = null;
        saveCurrent({ silent: true });
        els.json.value = exportBodyJson();
      }
    }

    els.maleBtn.addEventListener('click', () => setGender('male'));
    els.femaleBtn.addEventListener('click', () => setGender('female'));
    els.prevBtn.addEventListener('click', () => moveBody(-1));
    els.nextBtn.addEventListener('click', () => moveBody(1));
    els.jumpBtn.addEventListener('click', () => jumpToBodyIndex(Number(els.pass.value || 1) - 1));
    els.findBtn.addEventListener('click', findFirstUnsaved);
    els.bodySelect.addEventListener('change', () => jumpToBodyIndex(bodies().findIndex(item => item.id === els.bodySelect.value)));
    els.levelSelect.addEventListener('change', jumpToLevelNumber);
    els.numberSelect.addEventListener('change', jumpToLevelNumber);
    els.headSelect.addEventListener('change', () => { els.eyesSelect.value = defaultEyesFor(gender, els.headSelect.value); render(); });
    els.eyesSelect.addEventListener('change', render);
    els.hairSelect.addEventListener('change', render);
    els.dx.addEventListener('change', updateFromInputs);
    els.dy.addEventListener('change', updateFromInputs);
    els.scale.addEventListener('input', () => { els.scaleNumber.value = els.scale.value; updateFromInputs(); });
    els.scaleNumber.addEventListener('change', () => { els.scale.value = els.scaleNumber.value; updateFromInputs(); });
    els.genderScale.addEventListener('input', () => {
      els.genderScaleNumber.value = els.genderScale.value;
      setCurrentGenderScale(els.genderScale.value);
      render();
    });
    els.genderScaleNumber.addEventListener('change', () => {
      els.genderScale.value = els.genderScaleNumber.value;
      setCurrentGenderScale(els.genderScaleNumber.value);
      render();
    });
    els.resetGenderScaleBtn.addEventListener('click', () => {
      setCurrentGenderScale(genderScaleDefaults[gender] || 1);
      render();
    });
    els.zoom.addEventListener('change', render);
    els.saveBtn.addEventListener('click', () => saveCurrent());
    els.resetBtn.addEventListener('click', resetCurrentBody);
    els.storageReportBtn.addEventListener('click', showStorageReport);
    els.copyBtn.addEventListener('click', copyJson);
    els.importBtn.addEventListener('click', importJson);
    els.clearBodyBtn.addEventListener('click', clearBodySettings);
    document.querySelectorAll('[data-nudge]').forEach(button => {
      button.addEventListener('click', () => {
        const [dx, dy] = button.dataset.nudge.split(',').map(Number);
        nudge(dx, dy);
      });
    });

    els.stage.addEventListener('pointerdown', event => {
      els.stage.setPointerCapture(event.pointerId);
      pointers.set(event.pointerId, event);
      if (pointers.size >= 2) startPinch();
      else startDrag(event);
    });
    els.stage.addEventListener('pointermove', event => {
      if (!pointers.has(event.pointerId)) return;
      pointers.set(event.pointerId, event);
      applyGesture();
    });
    els.stage.addEventListener('pointerup', event => finishGesture(event.pointerId));
    els.stage.addEventListener('pointercancel', event => finishGesture(event.pointerId));
    window.addEventListener('resize', render);

    populateAvatarSelects();
    bodyIndex = Math.max(0, Math.min(bodies().length - 1, Number(bodyState.progress?.[gender]?.bodyIndex || 0)));
    populateBodyControls();
    render();
  </script>
</body>
</html>
HTML_TEMPLATE_END */

fs.writeFileSync(outPath, html.replace('__SHARED_ASSETS_BLOCK__', sharedAssetsBlock), 'utf8');
console.log(`Wrote ${outPath}`);

function extractHtmlTemplate() {
  const source = fs.readFileSync(__filename, 'utf8');
  const startMarker = '/* HTML_TEMPLATE_START';
  const endMarker = 'HTML_TEMPLATE_END */';
  const templateStart = source.indexOf(startMarker);
  const templateEnd = source.indexOf(endMarker, templateStart);
  if (templateStart < 0 || templateEnd < 0) {
    throw new Error('Cannot read embedded HTML template');
  }
  return source
    .slice(templateStart + startMarker.length, templateEnd)
    .replace(/^\r?\n/, '');
}
