/* 我推一览编辑器 · OSHI MATRIX
   纯前端单页应用：编辑、拖拽换位、自动保存、导出高清 PNG */
(() => {
  'use strict';

  /* ------------------------------------------------------------------ *
   * 基础常量
   * ------------------------------------------------------------------ */
  const STORAGE_KEY = 'oshi-matrix-v1';
  const DB_NAME = 'oshi-matrix-db';
  const DB_STORE = 'kv';
  const DB_KEY = 'state';
  const XHS_META_KEY = 'oshi-matrix-v1-meta';
  const XHS_CHUNK_KEY = 'oshi-matrix-v1-part-';
  const XHS_CHUNK_SIZE = 400000;
  const ARCHIVE_DB_KEY = 'archives-v1';
  const ARCHIVE_STORAGE_KEY = 'oshi-matrix-archives-v1';
  const ARCHIVE_META_KEY = 'oshi-matrix-v1-archives-meta';
  const ARCHIVE_CHUNK_KEY = 'oshi-matrix-v1-archives-part-';
  const ARCHIVE_LIMIT = 5;
  const CONTAINER_MODE = typeof window !== 'undefined' && Boolean(window.xhs);
  const MIN_SIZE = 1;
  const MAX_SIZE = 10;
  const LONG_PRESS = 360;
  const FONT = '"OSHI Rounded", "PingFang SC", "Microsoft YaHei", sans-serif';
  const DEFAULT_TITLE = '我推一览';

  const COLORS = [
    { id: 'black',  label: '黑色', hex: '#3E343A', colName: '黑毛', rowName: '黑眼' },
    { id: 'brown',  label: '棕色', hex: '#8A5A45', colName: '棕毛', rowName: '棕眼' },
    { id: 'tea',    label: '茶色', hex: '#B08A6A', colName: '茶毛', rowName: '茶眼' },
    { id: 'gold',   label: '金色', hex: '#D8B25C', colName: '金毛', rowName: '金眼' },
    { id: 'yellow', label: '黄色', hex: '#F0D477', colName: '黄毛', rowName: '黄眼' },
    { id: 'white',  label: '白色', hex: '#F7F1E8', colName: '白毛', rowName: '白眼' },
    { id: 'silver', label: '银色', hex: '#C7CBD3', colName: '银毛', rowName: '银眼' },
    { id: 'pink',   label: '粉色', hex: '#E8A2B6', colName: '粉毛', rowName: '粉眼' },
    { id: 'blue',   label: '蓝色', hex: '#7D9FC6', colName: '蓝毛', rowName: '蓝眼' },
    { id: 'red',    label: '红色', hex: '#C75B5B', colName: '红毛', rowName: '红眼' },
    { id: 'green',  label: '绿色', hex: '#7FA98A', colName: '绿毛', rowName: '绿眼' },
    { id: 'purple', label: '紫色', hex: '#A087BE', colName: '紫毛', rowName: '紫眼' },
    { id: 'orange', label: '橙色', hex: '#E3A06A', colName: '橙毛', rowName: '橙眼' },
    { id: 'gray',   label: '灰色', hex: '#9B9BA0', colName: '灰毛', rowName: '灰眼' },
    { id: 'hetero', label: '异色', hex: '#C49AAF', colName: '异色', rowName: '异瞳' },
    { id: 'other',  label: '其他色', hex: '#B6A6AE', colName: '其他', rowName: '其他' },
  ];
  const COLOR_MAP = new Map(COLORS.map(c => [c.id, c]));

  const DEFAULT_COLS = ['black', 'green', 'blue', 'red', 'purple', 'pink'];
  const DEFAULT_ROWS = ['black', 'green', 'blue', 'red', 'purple', 'pink', 'gray'];

  const DEFAULT_BG = {
    mode: 'dots',
    c1: '#FBF4E8',
    c2: '#F7E8EC',
    angle: 135,
    dot: '#E7B4C3',
    dotSize: 6,
    dotGap: 34,
  };

  const $ = id => document.getElementById(id);
  const matrix = $('matrix');
  const tableScroll = $('tableScroll');
  const board = $('board');
  const boardCount = $('boardCount');
  const titleInput = $('titleInput');
  const creatorInput = $('creatorInput');
  const boardByline = $('boardByline');
  const boardCreator = $('boardCreator');
  const saveStateEl = $('saveState');
  const rowCountEl = $('rowCount');
  const colCountEl = $('colCount');
  const shapeOptions = $('shapeOptions');
  const showNameEl = $('showName');
  const showIPEl = $('showIP');
  const showDividerEl = $('showDivider');
  const showHeadersEl = $('showHeaders');
  const showSubtitleEl = $('showSubtitle');
  const showTitleEl = $('showTitle');
  const showBrandEl = $('showBrand');
  const showCreatorEl = $('showCreator');
  const showCountEl = $('showCount');
  const showEmptyLinesEl = $('showEmptyLines');
  const tagStylesEl = $('tagStyles');
  const tagFontSizeEl = $('tagFontSize');
  const tagFontSizeOut = $('tagFontSizeOut');
  const gridGapEl = $('gridGap');
  const gridGapOut = $('gridGapOut');
  const tagOffsetEl = $('tagOffset');
  const tagOffsetOut = $('tagOffsetOut');
  const tagPadEl = $('tagPad');
  const tagPadOut = $('tagPadOut');
  const tagTextGapEl = $('tagTextGap');
  const tagTextGapOut = $('tagTextGapOut');
  const dividerRow = $('dividerRow');
  const boardSub = $('boardSub');
  const boardKicker = $('boardKicker');
  const boardTitleRow = $('boardTitleRow');
  const boardFoot = $('boardFoot');
  const btnArchive = $('btnArchive');
  const btnShare = $('btnShare');
  const archiveModal = $('archiveModal');
  const archiveList = $('archiveList');
  const btnNewArchive = $('btnNewArchive');
  const shareModal = $('shareModal');
  const qrImage = $('qrImage');
  const btnDownloadQr = $('btnDownloadQr');
  const qrNote = $('qrNote');
  const btnScanImport = $('btnScanImport');
  const qrFile = $('qrFile');
  const bgModes = $('bgModes');
  const bgPresets = $('bgPresets');
  const headerPopover = $('headerPopover');
  const popoverEyebrow = $('popoverEyebrow');
  const popoverCurrent = $('popoverCurrent');
  const popoverClose = $('popoverClose');
  const colorGrid = $('colorGrid');
  const customFields = $('customFields');
  const customName = $('customName');
  const customApply = $('customApply');
  const characterModal = $('characterModal');
  const confirmModal = $('confirmModal');
  const uploadZone = $('uploadZone');
  const previewImage = $('previewImage');
  const uploadEmpty = $('uploadEmpty');
  const imageFile = $('imageFile');
  const cropControls = $('cropControls');
  const imgZoom = $('imgZoom');
  const imgZoomOut = $('imgZoomOut');
  const imgAngle = $('imgAngle');
  const imgAngleOut = $('imgAngleOut');
  const imgFitGroup = $('imgFitGroup');
  const imgFitButtons = imgFitGroup ? Array.from(imgFitGroup.querySelectorAll('[data-fit]')) : [];
  const btnResetCrop = $('btnResetCrop');
  const charName = $('charName');
  const charIP = $('charIP');
  const modalCoord = $('modalCoord');
  const coordDot = $('coordDot');
  const btnSaveCell = $('btnSaveCell');
  const btnClearCell = $('btnClearCell');
  const btnConfirmReset = $('btnConfirmReset');
  const confirmTitle = $('confirmTitle');
  const confirmMessage = $('confirmMessage');
  const toastEl = $('toast');
  const exportVeil = $('exportVeil');
  const btnExport = $('btnExport');
  const btnReset = $('btnReset');

  /* ------------------------------------------------------------------ *
   * 状态
   * ------------------------------------------------------------------ */
  let state;
  let dbPromise;
  let dbTried = false;
  let saveTimer = null;
  let saveQueued = false;
  let toastTimer = null;
  let layoutRaf = 0;
  let exporting = false;
  let quotaWarned = false;
  let archives = null;
  let archiveBusy = false;

  let editing = null;          // { col, row }
  let draft = { image: '', name: '', ip: '', imgZoom: 1, imgX: 0, imgY: 0, imgRotate: 0 };
  let lastFocus = null;
  let confirmAction = null;
  let cropDrag = null;

  let popoverContext = null;   // { axis, index, el }
  let suppressClick = false;
  let suppressTimer = null;
  let press = null;
  let drag = null;

  /* ------------------------------------------------------------------ *
   * 小工具
   * ------------------------------------------------------------------ */
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const panLimit = zoom => 120 + Math.max(0, zoom - 1) * 40;
  const cellKey = (c, r) => `${c}:${r}`;
  const uid = () => Math.random().toString(36).slice(2, 9);

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[ch]));
  }

  function isHex(value) {
    return typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value);
  }

  function normalizeHex(value, fallback) {
    return isHex(value) ? value.toUpperCase() : fallback;
  }

  function hexToRgb(hex) {
    const value = isHex(hex) ? hex.slice(1) : '000000';
    return {
      r: parseInt(value.slice(0, 2), 16),
      g: parseInt(value.slice(2, 4), 16),
      b: parseInt(value.slice(4, 6), 16),
    };
  }

  function rgbToHex(r, g, b) {
    const part = n => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
    return `#${part(r)}${part(g)}${part(b)}`.toUpperCase();
  }

  function mixHex(hex, target, amount) {
    const a = hexToRgb(hex);
    const b = hexToRgb(target);
    return rgbToHex(
      a.r + (b.r - a.r) * amount,
      a.g + (b.g - a.g) * amount,
      a.b + (b.b - a.b) * amount
    );
  }

  function withAlpha(hex, alpha) {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function luminance(hex) {
    const { r, g, b } = hexToRgb(hex);
    const convert = v => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * convert(r) + 0.7152 * convert(g) + 0.0722 * convert(b);
  }

  function axisName(colorId, axis) {
    const color = COLOR_MAP.get(colorId) || COLOR_MAP.get('gray');
    return axis === 'col' ? color.colName : color.rowName;
  }

  function colorHex(colorId) {
    return (COLOR_MAP.get(colorId) || COLOR_MAP.get('gray')).hex;
  }

  function makeHeader(colorId, axis) {
    return { color: colorId, name: axisName(colorId, axis) };
  }

  function toast(message) {
    if (!message) return;
    toastEl.textContent = message;
    toastEl.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-show'), 2300);
  }

  function setSaveStatus(kind) {
    saveStateEl.classList.toggle('is-saving', kind === 'saving');
    saveStateEl.classList.toggle('is-error', kind === 'error');
    const text = kind === 'saving' ? '正在保存…' : kind === 'error' ? '保存失败' : '已自动保存';
    saveStateEl.innerHTML = `<i></i>${text}`;
  }

  /* ------------------------------------------------------------------ *
   * 默认状态 / 状态标准化
   * ------------------------------------------------------------------ */
  function createDefaultState() {
    return {
      version: 1,
      title: DEFAULT_TITLE,
      creator: '',
      shape: 'rounded',
      showName: true,
      showIP: true,
      showDivider: true,
      showHeaders: true,
      showSubtitle: true,
      showTitle: true,
      showBrand: true,
      showCreator: true,
      showCount: true,
      showEmptyLines: true,
      gap: 10,
      tagOffset: 4,
      tagPad: 3,
      tagTextGap: 3,
      tagFontSize: 100,
      tagStyle: 'glass',
      rows: DEFAULT_ROWS.length,
      cols: DEFAULT_COLS.length,
      colHeaders: DEFAULT_COLS.map(id => makeHeader(id, 'col')),
      rowHeaders: DEFAULT_ROWS.map(id => makeHeader(id, 'row')),
      cells: {},
      bg: { ...DEFAULT_BG },
    };
  }

  function normalizeHeader(header, axis, index) {
    const fallback = COLORS[index % COLORS.length].id;
    const color = header && COLOR_MAP.has(header.color) ? header.color : fallback;
    let name = header && typeof header.name === 'string' ? header.name.trim().slice(0, 10) : '';
    if (!name) name = axisName(color, axis);
    return { color, name };
  }

  function normalizeCell(cell) {
    if (!cell || typeof cell !== 'object') return null;
    const image = typeof cell.image === 'string' && cell.image.startsWith('data:image/')
      ? cell.image : '';
    const name = typeof cell.name === 'string' ? cell.name : '';
    const ip = typeof cell.ip === 'string' ? cell.ip : '';
    if (!image && !name.trim() && !ip.trim()) return null;
    const imgZoom = clamp(Number(cell.imgZoom) || 1, 1, 3);
    const maxOffset = panLimit(imgZoom);
    return {
      image,
      name,
      ip,
      imgZoom,
      imgX: clamp(Number(cell.imgX) || 0, -maxOffset, maxOffset),
      imgY: clamp(Number(cell.imgY) || 0, -maxOffset, maxOffset),
      imgRotate: clamp(Number(cell.imgRotate) || 0, -180, 180),
      imgFit: cell.imgFit === 'contain' ? 'contain' : 'cover',
    };
  }

  function normalizeState(raw) {
    const next = createDefaultState();
    if (!raw || typeof raw !== 'object') return next;

    next.title = typeof raw.title === 'string' && raw.title.trim()
      ? raw.title : DEFAULT_TITLE;
    next.creator = typeof raw.creator === 'string' ? raw.creator : '';
    next.shape = ['rounded', 'circle', 'heart', 'square'].includes(raw.shape)
      ? raw.shape : 'rounded';
    next.showName = raw.showName !== false;
    next.showIP = raw.showIP !== false;
    next.showDivider = raw.showDivider !== false;
    next.showHeaders = raw.showHeaders !== false;
    next.showSubtitle = raw.showSubtitle !== false;
    next.showTitle = raw.showTitle !== false;
    next.showBrand = raw.showBrand !== false;
    next.showCreator = raw.showCreator !== false;
    next.showCount = raw.showCount !== false;
    next.showEmptyLines = raw.showEmptyLines !== false;
    next.gap = clamp(Number(raw.gap) || 10, 0, 20);
    next.tagOffset = clamp(Number.isFinite(Number(raw.tagOffset)) ? Number(raw.tagOffset) : 4, 0, 10);
    next.tagPad = clamp(Number.isFinite(Number(raw.tagPad)) ? Number(raw.tagPad) : 3, 0, 10);
    next.tagTextGap = clamp(Number.isFinite(Number(raw.tagTextGap)) ? Number(raw.tagTextGap) : 3, 0, 10);
    next.tagFontSize = clamp(Number(raw.tagFontSize) || 100, 70, 150);
    next.tagStyle = ['glass', 'underline', 'none'].includes(raw.tagStyle) ? raw.tagStyle : 'glass';
    next.rows = clamp(Number.parseInt(raw.rows, 10) || DEFAULT_ROWS.length, MIN_SIZE, MAX_SIZE);
    next.cols = clamp(Number.parseInt(raw.cols, 10) || DEFAULT_COLS.length, MIN_SIZE, MAX_SIZE);

    next.colHeaders = Array.from({ length: next.cols }, (_, i) =>
      normalizeHeader(raw.colHeaders && raw.colHeaders[i], 'col', i));
    next.rowHeaders = Array.from({ length: next.rows }, (_, i) =>
      normalizeHeader(raw.rowHeaders && raw.rowHeaders[i], 'row', i));

    if (raw.cells && typeof raw.cells === 'object') {
      for (const [key, value] of Object.entries(raw.cells)) {
        const match = /^(\d+):(\d+)$/.exec(key);
        if (!match) continue;
        const c = Number(match[1]);
        const r = Number(match[2]);
        if (c >= next.cols || r >= next.rows) continue;
        const normalized = normalizeCell(value);
        if (normalized) next.cells[cellKey(c, r)] = normalized;
      }
    }

    const bg = raw.bg && typeof raw.bg === 'object' ? raw.bg : {};
    next.bg = {
      mode: ['solid', 'gradient', 'dots'].includes(bg.mode) ? bg.mode : DEFAULT_BG.mode,
      c1: normalizeHex(bg.c1, DEFAULT_BG.c1),
      c2: normalizeHex(bg.c2, DEFAULT_BG.c2),
      angle: clamp(Number.parseInt(bg.angle, 10) || DEFAULT_BG.angle, 0, 360),
      dot: normalizeHex(bg.dot, DEFAULT_BG.dot),
      dotSize: clamp(Number.parseInt(bg.dotSize, 10) || DEFAULT_BG.dotSize, 4, 40),
      dotGap: clamp(Number.parseInt(bg.dotGap, 10) || DEFAULT_BG.dotGap, 14, 80),
    };

    return next;
  }

  /* ------------------------------------------------------------------ *
   * 小红书小工具适配：平台存储、版本检测、相册保存、安全区
   * ------------------------------------------------------------------ */
  let miniVersionPromise = null;
  let miniStoragePromise = null;

  function readBuildVersion(source) {
    if (!source || typeof source !== 'object') return null;
    const env = source.miniToolEnv || source;
    const candidates = [
      source.buildVersion,
      env.buildVersion,
      source.launchOptions && source.launchOptions.buildVersion,
    ];
    for (const value of candidates) {
      const number = Number(value);
      if (Number.isFinite(number) && number > 0) return number;
    }
    return null;
  }

  function callMiniTool(name, options) {
    return new Promise((resolve, reject) => {
      const mini = window.xhs && window.xhs.miniTool;
      if (!mini || typeof mini[name] !== 'function') {
        reject(new Error(`miniTool.${name} unavailable`));
        return;
      }
      let settled = false;
      const timer = setTimeout(() => {
        fail(new Error(`${name} timeout`));
      }, 15000);
      const done = result => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(result && typeof result === 'object' ? result : {});
      };
      const fail = error => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(error instanceof Error ? error : new Error(`${name} failed`));
      };
      const payload = Object.assign({}, options, { success: done, fail });
      let returned;
      try {
        returned = mini[name](payload);
      } catch (error) {
        fail(error);
        return;
      }
      if (returned && typeof returned.then === 'function') returned.then(done, fail);
    });
  }

  function getContainerVersion() {
    if (!miniVersionPromise) {
      miniVersionPromise = (async () => {
        const direct = readBuildVersion(window.xhs && window.xhs.launchOptions);
        if (direct) return direct;
        const mini = window.xhs && window.xhs.miniTool;
        if (!mini || typeof mini.getLaunchOptions !== 'function') return null;
        try {
          const result = await callMiniTool('getLaunchOptions', {});
          return readBuildVersion(result)
            || readBuildVersion(result && result.launchOptions)
            || readBuildVersion(result && result.miniToolEnv);
        } catch (error) {
          return null;
        }
      })();
    }
    return miniVersionPromise;
  }

  function getMiniTool(minVersion, methods) {
    return getContainerVersion().then(buildVersion => {
      if (buildVersion === null) return null;
      if (Math.floor(buildVersion / 1000) < minVersion) return null;
      const mini = window.xhs && window.xhs.miniTool;
      if (!mini) return null;
      for (const method of methods) {
        if (typeof mini[method] !== 'function') return null;
      }
      return mini;
    }).catch(() => null);
  }

  function getContainerStorage() {
    if (!miniStoragePromise) {
      miniStoragePromise = getMiniTool(9460, ['setStorage', 'getStorage']);
    }
    return miniStoragePromise;
  }

  async function readContainerState() {
    const mini = await getContainerStorage();
    if (!mini) throw new Error('container storage unavailable');
    const metaResult = await callMiniTool('getStorage', { key: XHS_META_KEY });
    const rawMeta = metaResult && metaResult.data;
    if (typeof rawMeta !== 'string') return null;
    let meta;
    try {
      meta = JSON.parse(rawMeta);
      if (typeof meta === 'string') meta = JSON.parse(meta);
    } catch (error) {
      return null;
    }
    const count = Number(meta && meta.chunks);
    if (!Number.isInteger(count) || count < 1 || count > 64) return null;
    let json = '';
    for (let i = 0; i < count; i += 1) {
      const result = await callMiniTool('getStorage', { key: `${XHS_CHUNK_KEY}${i}` });
      if (!result || typeof result.data !== 'string') throw new Error('storage chunk missing');
      let chunk = result.data;
      try {
        const decoded = JSON.parse(chunk);
        if (typeof decoded === 'string') chunk = decoded;
      } catch (error) {
        /* Some clients return the raw chunk instead of a JSON string. */
      }
      json += chunk;
    }
    if (json.length > 10 * 1024 * 1024) throw new Error('stored state too large');
    return JSON.parse(json);
  }

  async function writeContainerState() {
    const mini = await getContainerStorage();
    if (!mini) throw new Error('container storage unavailable');
    const json = JSON.stringify(state);
    const chunks = [];
    for (let start = 0; start < json.length; start += XHS_CHUNK_SIZE) {
      chunks.push(json.slice(start, start + XHS_CHUNK_SIZE));
    }
    for (let i = 0; i < chunks.length; i += 1) {
      const result = await callMiniTool('setStorage', {
        key: `${XHS_CHUNK_KEY}${i}`,
        data: JSON.stringify(chunks[i]),
      });
      if (result && result.errMsg && !/:ok$/.test(result.errMsg)) {
        throw new Error(result.errMsg);
      }
    }
    const metaResult = await callMiniTool('setStorage', {
      key: XHS_META_KEY,
      data: JSON.stringify({ chunks: chunks.length, savedAt: Date.now() }),
    });
    if (metaResult && metaResult.errMsg && !/:ok$/.test(metaResult.errMsg)) {
      throw new Error(metaResult.errMsg);
    }
  }

  async function readArchiveStore() {
    if (CONTAINER_MODE) {
      const mini = await getContainerStorage();
      if (!mini) return [];
      const metaResult = await callMiniTool('getStorage', { key: ARCHIVE_META_KEY });
      const rawMeta = metaResult && metaResult.data;
      if (typeof rawMeta !== 'string') return [];
      let meta;
      try {
        meta = JSON.parse(rawMeta);
        if (typeof meta === 'string') meta = JSON.parse(meta);
      } catch (error) {
        return [];
      }
      const count = Number(meta && meta.chunks);
      if (!Number.isInteger(count) || count < 1 || count > 64) return [];
      let json = '';
      for (let i = 0; i < count; i += 1) {
        const result = await callMiniTool('getStorage', { key: `${ARCHIVE_CHUNK_KEY}${i}` });
        if (!result || typeof result.data !== 'string') throw new Error('archive chunk missing');
        let chunk = result.data;
        try {
          const decoded = JSON.parse(chunk);
          if (typeof decoded === 'string') chunk = decoded;
        } catch (error) { /* raw chunk */ }
        json += chunk;
      }
      try {
        const parsed = JSON.parse(json);
        return Array.isArray(parsed) ? parsed.slice(0, ARCHIVE_LIMIT) : [];
      } catch (error) {
        return [];
      }
    }

    try {
      const saved = await idbRequest('readonly', store => store.get(ARCHIVE_DB_KEY));
      if (Array.isArray(saved)) return saved.slice(0, ARCHIVE_LIMIT);
    } catch (error) { /* ignore */ }
    try {
      const raw = localStorage.getItem(ARCHIVE_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return Array.isArray(parsed) ? parsed.slice(0, ARCHIVE_LIMIT) : [];
    } catch (error) {
      return [];
    }
  }

  async function writeArchiveStore() {
    const json = JSON.stringify(archives || []);
    if (CONTAINER_MODE) {
      const mini = await getContainerStorage();
      if (!mini) throw new Error('container storage unavailable');
      const chunks = [];
      for (let start = 0; start < json.length; start += XHS_CHUNK_SIZE) {
        chunks.push(json.slice(start, start + XHS_CHUNK_SIZE));
      }
      for (let i = 0; i < chunks.length; i += 1) {
        const result = await callMiniTool('setStorage', {
          key: `${ARCHIVE_CHUNK_KEY}${i}`,
          data: JSON.stringify(chunks[i]),
        });
        if (result && result.errMsg && !/:ok$/.test(result.errMsg)) throw new Error(result.errMsg);
      }
      const metaResult = await callMiniTool('setStorage', {
        key: ARCHIVE_META_KEY,
        data: JSON.stringify({ chunks: chunks.length, savedAt: Date.now() }),
      });
      if (metaResult && metaResult.errMsg && !/:ok$/.test(metaResult.errMsg)) {
        throw new Error(metaResult.errMsg);
      }
      return;
    }

    try {
      await idbRequest('readwrite', store => store.put(archives || [], ARCHIVE_DB_KEY));
    } catch (error) {
      localStorage.setItem(ARCHIVE_STORAGE_KEY, json);
    }
  }

  function cloneState(value) {
    return JSON.parse(JSON.stringify(value));
  }

  async function loadArchives(force) {
    if (archives && !force) return archives;
    try {
      archives = await readArchiveStore();
    } catch (error) {
      console.warn('archive read failed', error);
      archives = [];
    }
    if (!Array.isArray(archives)) archives = [];
    return archives;
  }

  async function saveArchives() {
    await writeArchiveStore();
  }

  async function saveToAlbum(canvas) {
    const mini = await getMiniTool(9420, ['saveImageToPhotosAlbum']);
    if (!mini) throw new Error('saveImageToPhotosAlbum unavailable');
    const dataUrl = canvas.toDataURL('image/png');
    await callMiniTool('saveImageToPhotosAlbum', { filePath: dataUrl });
  }

  async function applyContainerSafeArea() {
    if (!CONTAINER_MODE) return;
    const mini = await getMiniTool(9490, ['getWindowInfo']);
    if (!mini) return;
    try {
      const info = await callMiniTool('getWindowInfo', {});
      const safeTop = info.safeArea && Number(info.safeArea.top) || 0;
      const capsule = info.menuButtons && info.menuButtons.capsule;
      const capsuleBottom = capsule && Number(capsule.bottom) || 0;
      const contentTop = Math.max(safeTop, capsuleBottom) + 6;
      if (contentTop > 0) {
        document.documentElement.style.setProperty('--content-top', `${contentTop}px`);
      }
    } catch (error) {
      /* older clients keep the normal page padding */
    }
  }

  /* ------------------------------------------------------------------ *
   * IndexedDB 持久化（独立网页版；小红书容器内改用平台 Storage）
   * ------------------------------------------------------------------ */
  function openDB() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error('no indexedDB'));
        return;
      }
      let request;
      try {
        request = indexedDB.open(DB_NAME, 1);
      } catch (error) {
        reject(error);
        return;
      }
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('db error'));
      request.onblocked = () => reject(new Error('db blocked'));
    });
  }

  function getDB() {
    if (!dbTried) {
      dbTried = true;
      dbPromise = Promise.race([
        openDB().catch(() => null),
        new Promise(resolve => setTimeout(() => resolve(null), 900)),
      ]);
    }
    return dbPromise;
  }

  function idbRequest(mode, action) {
    return getDB().then(db => new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('no db'));
        return;
      }
      let tx;
      try {
        tx = db.transaction(DB_STORE, mode);
      } catch (error) {
        reject(error);
        return;
      }
      const store = tx.objectStore(DB_STORE);
      let request;
      try {
        request = action(store);
      } catch (error) {
        reject(error);
        return;
      }
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('request error'));
      tx.onabort = () => reject(tx.error || new Error('transaction aborted'));
    }));
  }

  async function loadSavedState() {
    if (CONTAINER_MODE) {
      try {
        return await readContainerState();
      } catch (error) {
        console.warn('container storage read failed', error);
        return null;
      }
    }
    try {
      const saved = await idbRequest('readonly', store => store.get(DB_KEY));
      if (saved) return saved;
    } catch (error) {
      /* ignore and try localStorage */
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (error) {
      /* ignore */
    }
    return null;
  }

  function markUnsaved() {
    clearTimeout(saveTimer);
    setSaveStatus('saving');
    saveQueued = true;
    saveTimer = setTimeout(persistState, 420);
  }

  async function persistState() {
    if (!state) return;
    clearTimeout(saveTimer);
    saveTimer = null;
    saveQueued = false;

    if (CONTAINER_MODE) {
      try {
        await writeContainerState();
        setSaveStatus('saved');
      } catch (error) {
        console.warn('container storage write failed', error);
        setSaveStatus('error');
        if (!quotaWarned) {
          quotaWarned = true;
          toast('保存空间不足或当前版本不支持，请升级小红书后重试');
        }
      }
      return;
    }

    try {
      await idbRequest('readwrite', store => store.put(state, DB_KEY));
      setSaveStatus('saved');
    } catch (error) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        setSaveStatus('saved');
      } catch (fallbackError) {
        setSaveStatus('error');
        if (!quotaWarned) {
          quotaWarned = true;
          toast('本地空间不足，最近的修改可能无法保存');
        }
      }
    }
  }

  function flushSave() {
    if (!saveQueued) return;
    clearTimeout(saveTimer);
    persistState();
  }

  /* ------------------------------------------------------------------ *
   * 背景 / 主题
   * ------------------------------------------------------------------ */
  function applyBackground() {
    const bg = state.bg;
    const c1 = normalizeHex(bg.c1, DEFAULT_BG.c1);
    const c2 = normalizeHex(bg.c2, DEFAULT_BG.c2);
    const angle = clamp(Number(bg.angle) || 0, 0, 360);
    const dot = normalizeHex(bg.dot, DEFAULT_BG.dot);
    const dotSize = clamp(Number(bg.dotSize) || 10, 4, 40);
    const dotGap = clamp(Number(bg.dotGap) || 32, 14, 80);

    let image = 'none';
    let size = 'auto';
    let position = '0 0';

    if (bg.mode === 'gradient') {
      image = `linear-gradient(${angle}deg, ${c1}, ${c2})`;
    } else if (bg.mode === 'dots') {
      const radius = dotSize / 2;
      image = `radial-gradient(circle at 50% 50%, ${withAlpha(dot, 0.42)} 0 ${radius}px, transparent ${radius + 0.8}px), ` +
        `linear-gradient(${angle}deg, ${c1}, ${c2})`;
      size = `${dotGap}px ${dotGap}px, auto`;
      position = '0 0, 0 0';
    }

    board.style.backgroundColor = c1;
    board.style.backgroundImage = image;
    board.style.backgroundSize = size;
    board.style.backgroundPosition = position;

    const average = mixHex(c1, c2, 0.5);
    const dark = luminance(average) < 0.42;

    board.style.setProperty('--ink', dark ? '#FFF8F2' : '#47333E');
    board.style.setProperty('--ink-soft', dark ? 'rgba(255, 246, 240, .72)' : '#8F7883');
    board.style.setProperty('--ink-faint', dark ? 'rgba(255, 246, 240, .48)' : '#B9A5AE');
    board.style.setProperty('--header-bg', dark ? 'rgba(255, 255, 255, .13)' : 'rgba(255, 255, 255, .38)');
    board.style.setProperty('--header-line', dark ? 'rgba(255, 255, 255, .2)' : 'rgba(255, 255, 255, .52)');
    board.style.setProperty('--empty-bg', dark ? 'rgba(255, 255, 255, .07)' : 'rgba(255, 255, 255, .18)');
    board.style.setProperty('--empty-line', dark ? 'rgba(255, 255, 255, .24)' : 'rgba(91, 62, 76, .18)');
    board.style.setProperty('--name-ink', '#4C3540');
  }

  function applyTagSettings() {
    matrix.dataset.tagStyle = state.tagStyle;
    matrix.style.setProperty('--tag-offset', `${state.tagOffset}px`);
    matrix.style.setProperty('--tag-pad', `${state.tagPad}px`);
    matrix.style.setProperty('--tag-text-gap', `${state.tagTextGap}px`);
  }

  function fitTagText() {
    if (!state) return;
    const cell = Number.parseFloat(getComputedStyle(matrix).getPropertyValue('--cell')) || 88;
    const scale = clamp(state.tagFontSize / 100, 0.7, 1.5);
    const base = Math.max(7.2, cell * 0.086) * scale;
    matrix.querySelectorAll('.name-ip-tag').forEach(tag => {
      let size = base;
      tag.style.fontSize = `${size}px`;
      let guard = 0;
      while (tag.scrollWidth > tag.clientWidth + 0.5 && size > 2.2 && guard < 120) {
        size = Math.round((size - 0.3) * 10) / 10;
        tag.style.fontSize = `${size}px`;
        guard += 1;
      }
    });
  }

  /* ------------------------------------------------------------------ *
   * 表格渲染
   * ------------------------------------------------------------------ */
  function cellData(c, r) {
    return state.cells[cellKey(c, r)] || null;
  }

  function hasContent(data) {
    return !!(data && (data.image || String(data.name || '').trim() || String(data.ip || '').trim()));
  }

  function buildCorner() {
    const el = document.createElement('div');
    el.className = 'corner';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<i>EYE</i><span>×</span><i>HAIR</i>';
    return el;
  }

  function buildHeader(axis, index) {
    const header = axis === 'col' ? state.colHeaders[index] : state.rowHeaders[index];
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `axis-header ${axis === 'col' ? 'col-header' : 'row-header'}`;
    button.dataset.axis = axis;
    button.dataset.index = String(index);
    button.style.setProperty('--dot', colorHex(header.color));
    button.title = `${header.name} · 单击换色，长按拖动整${axis === 'col' ? '列' : '行'}`;
    button.setAttribute('aria-label', `${header.name}，单击编辑，长按拖动整${axis === 'col' ? '列' : '行'}`);

    const dot = document.createElement('span');
    dot.className = 'header-dot';
    if (header.color === 'hetero') dot.classList.add('is-hetero');
    if (header.color === 'other') dot.classList.add('is-other');
    dot.setAttribute('aria-hidden', 'true');

    const label = document.createElement('span');
    label.className = 'header-label';
    label.textContent = header.name;

    button.append(dot, label);
    return button;
  }

  function buildTagHtml(name, ip) {
    const tagName = state.showName ? name : '';
    const tagIP = state.showIP ? ip : '';
    if (!tagName && !tagIP) return '';
    const divider = tagName && tagIP && state.showDivider
      ? '<i class="tag-sep" aria-hidden="true">|</i>'
      : '';
    const nameHtml = tagName
      ? `<span class="tag-name">${esc(tagName)}</span>`
      : '';
    const ipHtml = tagIP
      ? `<span class="tag-ip">${tagName ? '' : '<span class="tag-ip-kicker">IP</span>'}<span class="tag-ip-value">${esc(tagIP)}</span></span>`
      : '';
    return `<div class="name-ip-tag${divider ? ' has-divider' : ''}" title="点击编辑名字和 IP">${nameHtml}${divider}${ipHtml}</div>`;
  }

  function buildCell(c, r) {
    const colHeader = state.colHeaders[c];
    const rowHeader = state.rowHeaders[r];
    const data = cellData(c, r);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'cell';
    button.dataset.col = String(c);
    button.dataset.row = String(r);
    button.style.setProperty('--hair-soft', mixHex(colorHex(colHeader.color), '#FFFFFF', 0.64));
    button.style.setProperty('--eye-soft', mixHex(colorHex(rowHeader.color), '#FFFFFF', 0.7));

    if (!hasContent(data)) {
      button.classList.add('is-empty');
      button.setAttribute('aria-label', `在 ${colHeader.name} × ${rowHeader.name} 添加角色`);
      button.innerHTML = '<div class="empty"><span class="empty-plus" aria-hidden="true">＋</span></div>';
      return button;
    }

    const name = String(data.name || '').trim();
    const ip = String(data.ip || '').trim();
    const initial = name ? Array.from(name)[0] : '♡';

    button.classList.add('has-character');
    button.setAttribute('aria-label',
      `编辑角色${name ? ` ${name}` : ''}${ip ? `，IP ${ip}` : ''}，位置 ${colHeader.name} × ${rowHeader.name}`);

    const imageHtml = data.image
      ? `<img class="character-image" src="${data.image}" alt="" draggable="false" style="--img-zoom:${data.imgZoom};--img-x:${data.imgX}%;--img-y:${data.imgY}%;--img-rot:${data.imgRotate}deg;--img-fit:${data.imgFit || 'cover'}">`
      : '';
    const initialHtml = data.image
      ? ''
      : `<span class="art-initial" aria-hidden="true">${esc(initial)}</span>`;
    const tagHtml = buildTagHtml(name, ip);

    button.innerHTML = `
      <div class="cell-inner">
        <div class="art-wrap">
          <div class="art">
            ${imageHtml}
            ${initialHtml}
          </div>
        </div>
        <span class="cell-edit" aria-hidden="true">✎</span>
      </div>
      ${tagHtml}`;

    return button;
  }

  function renderMatrix() {
    if (!state) return;
    const fragment = document.createDocumentFragment();
    if (state.showHeaders) {
      fragment.append(buildCorner());
      for (let c = 0; c < state.cols; c += 1) fragment.append(buildHeader('col', c));
    }
    for (let r = 0; r < state.rows; r += 1) {
      if (state.showHeaders) fragment.append(buildHeader('row', r));
      for (let c = 0; c < state.cols; c += 1) fragment.append(buildCell(c, r));
    }
    matrix.innerHTML = '';
    matrix.appendChild(fragment);
    matrix.dataset.shape = state.shape;
    matrix.dataset.ip = state.showIP ? 'true' : 'false';
    matrix.dataset.headers = state.showHeaders ? 'true' : 'false';
    layoutTable();
    updateCounters();
  }

  function layoutTable() {
    if (!state) return;
    const hasTag = Boolean(state.showName || state.showIP);
    const available = Math.max(260, tableScroll.clientWidth - 6);
    const compact = available < 520;
    let gap = clamp(Number(state.gap) || 10, 0, 20);
    let maxCell = 104;
    if (state.rows >= 8) maxCell = 78;
    else if (state.rows >= 6) maxCell = hasTag ? 88 : 96;
    if (state.cols === 1) maxCell = 200;
    else if (state.cols === 2) maxCell = 160;
    else if (state.cols === 3) maxCell = 132;

    const roughLabel = state.showHeaders ? (compact ? 44 : 54) : 0;
    const fit = Math.floor((available - roughLabel - gap * state.cols) / state.cols);
    const cell = clamp(fit, compact ? 30 : 48, maxCell);
    const labelW = state.showHeaders
      ? Math.round(clamp(cell * (compact ? 1.16 : 0.68), compact ? 44 : 54, 64))
      : 0;
    const headH = Math.round(clamp(cell * 0.48, 34, 48));

    matrix.style.setProperty('--cell', `${cell}px`);
    matrix.style.setProperty('--label-w', `${labelW}px`);
    matrix.style.setProperty('--head-h', `${headH}px`);
    matrix.style.setProperty('--gap', `${gap}px`);
    matrix.style.gridTemplateColumns = state.showHeaders
      ? `${labelW}px repeat(${state.cols}, ${cell}px)`
      : `repeat(${state.cols}, ${cell}px)`;

    const tagH = hasTag
      ? Math.max(15, Math.ceil((cell / 5.5) * clamp(state.tagFontSize / 100, 0.7, 1.5)))
      : 0;
    const rowTrack = cell + (hasTag ? tagH + Math.max(8, state.tagOffset + 4) : 0);
    matrix.style.setProperty('--tag-height', `${tagH}px`);
    matrix.style.gridTemplateRows = state.showHeaders
      ? `${headH}px repeat(${state.rows}, ${rowTrack}px)`
      : `repeat(${state.rows}, ${rowTrack}px)`;
    applyTagSettings();
    fitTagText();
  }

  function scheduleLayout() {
    cancelAnimationFrame(layoutRaf);
    layoutRaf = requestAnimationFrame(layoutTable);
  }

  function updateCounters() {
    const filled = Object.values(state.cells).filter(hasContent).length;
    rowCountEl.textContent = String(state.rows);
    colCountEl.textContent = String(state.cols);
    boardCount.textContent = `${state.cols} × ${state.rows} · ${filled} / ${state.cols * state.rows}`;

    document.querySelectorAll('[data-step]').forEach(button => {
      const isRows = button.dataset.step === 'rows';
      const delta = Number(button.dataset.delta);
      const current = isRows ? state.rows : state.cols;
      button.disabled = delta < 0 ? current <= MIN_SIZE : current >= MAX_SIZE;
    });
  }

  function renderAll({ sync = false } = {}) {
    if (sync) syncAllControls();
    applyBackground();
    renderMatrix();
  }

  /* ------------------------------------------------------------------ *
   * 控件同步
   * ------------------------------------------------------------------ */
  function setHexField(colorEl, textEl, value) {
    colorEl.value = value.toLowerCase();
    textEl.value = value.toUpperCase();
  }

  function updateBgVisibility() {
    document.querySelectorAll('[data-bg-only]').forEach(el => {
      const modes = (el.dataset.bgOnly || '').split(/\s+/);
      el.hidden = !modes.includes(state.bg.mode);
    });
    $('bg1Label').textContent = state.bg.mode === 'gradient' ? '渐变起点' : '底色';
    $('bg2Label').textContent = state.bg.mode === 'dots' ? '渐层终点' : '渐变终点';
  }

  function syncBgControls() {
    const bg = state.bg;
    setHexField($('bg1Color'), $('bg1Hex'), bg.c1);
    setHexField($('bg2Color'), $('bg2Hex'), bg.c2);
    setHexField($('dotColor'), $('dotHex'), bg.dot);
    $('bgAngle').value = String(bg.angle);
    $('angleOut').textContent = `${bg.angle}°`;
    $('dotSize').value = String(bg.dotSize);
    $('dotSizeOut').textContent = `${bg.dotSize}px`;
    $('dotGap').value = String(bg.dotGap);
    $('dotGapOut').textContent = `${bg.dotGap}px`;
    bgModes.querySelectorAll('[data-mode]').forEach(button => {
      const active = button.dataset.mode === bg.mode;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    updateBgVisibility();
  }

  function syncShapeButtons() {
    shapeOptions.querySelectorAll('[data-shape]').forEach(button => {
      const active = button.dataset.shape === state.shape;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function updateDividerState() {
    const bothVisible = Boolean(state.showName && state.showIP);
    dividerRow.classList.toggle('is-muted', !bothVisible);
    showDividerEl.setAttribute('aria-disabled', String(!bothVisible));
  }

  function renderByline() {
    const creator = String(state.creator || '').trim();
    boardCreator.textContent = creator;
    boardByline.hidden = !state.showCreator || !creator;
  }

  function applyTextVisibility() {
    boardKicker.hidden = !state.showBrand;
    boardTitleRow.hidden = !state.showTitle;
    boardSub.hidden = !state.showSubtitle;
    boardFoot.hidden = !state.showCount;
    matrix.classList.toggle('hide-empty-lines', !state.showEmptyLines);
    renderByline();
  }

  function syncTagStyleButtons() {
    tagStylesEl.querySelectorAll('[data-tag-style]').forEach(button => {
      const active = button.dataset.tagStyle === state.tagStyle;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function syncAllControls() {
    titleInput.value = state.title;
    creatorInput.value = state.creator;
    renderByline();
    showNameEl.checked = state.showName;
    showIPEl.checked = state.showIP;
    showDividerEl.checked = state.showDivider;
    showHeadersEl.checked = state.showHeaders;
    showSubtitleEl.checked = state.showSubtitle;
    showTitleEl.checked = state.showTitle;
    showBrandEl.checked = state.showBrand;
    showCreatorEl.checked = state.showCreator;
    showCountEl.checked = state.showCount;
    showEmptyLinesEl.checked = state.showEmptyLines;
    tagFontSizeEl.value = state.tagFontSize;
    tagFontSizeOut.textContent = `${state.tagFontSize}%`;
    gridGapEl.value = state.gap;
    gridGapOut.textContent = `${state.gap}px`;
    tagOffsetEl.value = state.tagOffset;
    tagOffsetOut.textContent = `${state.tagOffset}px`;
    tagPadEl.value = state.tagPad;
    tagPadOut.textContent = `${state.tagPad}px`;
    tagTextGapEl.value = state.tagTextGap;
    tagTextGapOut.textContent = `${state.tagTextGap}px`;
    syncTagStyleButtons();
    applyTextVisibility();
    updateDividerState();
    syncShapeButtons();
    syncBgControls();
    updateCounters();
    matrix.dataset.shape = state.shape;
    matrix.dataset.ip = state.showIP ? 'true' : 'false';
    applyTagSettings();
  }

  /* ------------------------------------------------------------------ *
   * 表头颜色浮层
   * ------------------------------------------------------------------ */
  function renderColorGrid() {
    const context = popoverContext;
    if (!context) return;
    const header = context.axis === 'col'
      ? state.colHeaders[context.index] : state.rowHeaders[context.index];
    if (!header) return;

    const grid = document.createDocumentFragment();
    for (const color of COLORS) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'color-choice';
      button.dataset.color = color.id;
      button.setAttribute('aria-pressed', String(header.color === color.id));
      if (header.color === color.id) button.classList.add('is-active');

      const swatch = document.createElement('span');
      swatch.className = 'swatch';
      if (color.id === 'hetero') swatch.classList.add('is-hetero');
      else if (color.id === 'other') swatch.classList.add('is-other');
      else swatch.style.setProperty('--swatch', color.hex);

      const label = document.createElement('span');
      label.textContent = color.label;
      button.append(swatch, label);
      grid.append(button);
    }
    colorGrid.innerHTML = '';
    colorGrid.appendChild(grid);

    popoverCurrent.textContent = header.name;
    popoverEyebrow.textContent = context.axis === 'col' ? '发色 · 列' : '瞳色 · 行';

    const isOther = header.color === 'other';
    customFields.hidden = !isOther;
    if (isOther) {
      if (document.activeElement !== customName) customName.value = header.name === '其他' ? '' : header.name;
    }
  }

  function positionPopover() {
    if (headerPopover.hidden || !popoverContext || !popoverContext.el) return;
    const rect = popoverContext.el.getBoundingClientRect();
    const width = headerPopover.offsetWidth;
    const height = headerPopover.offsetHeight;
    let left = rect.left + rect.width / 2 - width / 2;
    left = clamp(left, 10, window.innerWidth - width - 10);
    let top = rect.bottom + 9;
    if (top + height > window.innerHeight - 10) {
      top = Math.max(10, rect.top - height - 9);
    }
    headerPopover.style.left = `${Math.round(left)}px`;
    headerPopover.style.top = `${Math.round(top)}px`;
  }

  function openHeaderPopover(axis, index, el) {
    if (!el) return;
    popoverContext = { axis, index, el };
    renderColorGrid();
    headerPopover.hidden = false;
    positionPopover();
    customName.value = '';
  }

  function closeHeaderPopover() {
    if (headerPopover.hidden) return;
    headerPopover.hidden = true;
    popoverContext = null;
  }

  function updateHeader(axis, index, colorId, name) {
    const headers = axis === 'col' ? state.colHeaders : state.rowHeaders;
    const header = headers[index];
    if (!header) return;
    header.color = colorId;
    header.name = name;
    renderMatrix();
    markUnsaved();
  }

  colorGrid.addEventListener('click', event => {
    const choice = event.target.closest('[data-color]');
    if (!choice || !popoverContext) return;
    const colorId = choice.dataset.color;
    const header = popoverContext.axis === 'col'
      ? state.colHeaders[popoverContext.index] : state.rowHeaders[popoverContext.index];
    if (!header) return;
    const name = axisName(colorId, popoverContext.axis);
    header.color = colorId;
    header.name = name;
    renderMatrix();
    markUnsaved();
    renderColorGrid();
    if (colorId === 'other') {
      customFields.hidden = false;
      customName.value = '';
      customName.focus();
    } else {
      closeHeaderPopover();
    }
  });

  customApply.addEventListener('click', () => {
    if (!popoverContext) return;
    const value = customName.value.trim().slice(0, 10) || '其他';
    const header = popoverContext.axis === 'col'
      ? state.colHeaders[popoverContext.index] : state.rowHeaders[popoverContext.index];
    if (!header) return;
    header.color = 'other';
    header.name = value;
    renderMatrix();
    markUnsaved();
    closeHeaderPopover();
  });

  customName.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      customApply.click();
    }
  });

  popoverClose.addEventListener('click', closeHeaderPopover);

  document.addEventListener('pointerdown', event => {
    if (headerPopover.hidden) return;
    if (headerPopover.contains(event.target)) return;
    if (event.target.closest('.axis-header')) return;
    closeHeaderPopover();
  }, true);

  window.addEventListener('scroll', () => {
    if (!headerPopover.hidden) positionPopover();
  }, true);
  window.addEventListener('resize', () => {
    if (!headerPopover.hidden) positionPopover();
  });

  /* ------------------------------------------------------------------ *
   * 背景控件
   * ------------------------------------------------------------------ */
  function bindHexPair(colorId, hexId, key) {
    const colorEl = $(colorId);
    const hexEl = $(hexId);

    colorEl.addEventListener('input', () => {
      state.bg[key] = colorEl.value.toUpperCase();
      hexEl.value = state.bg[key];
      applyBackground();
      markUnsaved();
    });

    hexEl.addEventListener('input', () => {
      let value = hexEl.value.trim();
      if (!value.startsWith('#')) value = `#${value}`;
      if (isHex(value)) {
        state.bg[key] = value.toUpperCase();
        colorEl.value = value.toLowerCase();
        applyBackground();
        markUnsaved();
      }
    });

    hexEl.addEventListener('blur', () => {
      hexEl.value = state.bg[key].toUpperCase();
    });

    hexEl.addEventListener('keydown', event => {
      if (event.key === 'Enter') hexEl.blur();
    });
  }

  function bindRange(rangeId, outputId, key, unit = '') {
    const range = $(rangeId);
    const output = $(outputId);
    range.addEventListener('input', () => {
      state.bg[key] = Number(range.value);
      output.textContent = `${range.value}${unit}`;
      applyBackground();
      markUnsaved();
    });
  }

  bgModes.addEventListener('click', event => {
    const button = event.target.closest('[data-mode]');
    if (!button) return;
    state.bg.mode = button.dataset.mode;
    syncBgControls();
    applyBackground();
    markUnsaved();
  });

  bgPresets.addEventListener('click', event => {
    const button = event.target.closest('[data-preset]');
    if (!button) return;
    const presets = {
      cream: { mode: 'dots', c1: '#FBF4E8', c2: '#FBF4E8', dot: '#E7B4C3', dotSize: 6, dotGap: 34, angle: 135 },
      peach: { mode: 'gradient', c1: '#FFD9C8', c2: '#F2BBD1', dot: '#E7A5B7', dotSize: 6, dotGap: 34, angle: 145 },
      mist: { mode: 'gradient', c1: '#DCEAF5', c2: '#E6DFF2', dot: '#B9C9DD', dotSize: 6, dotGap: 34, angle: 130 },
      plain: { mode: 'solid', c1: '#FCF8F1', c2: '#FCF8F1', dot: '#E7D7CF', dotSize: 6, dotGap: 34, angle: 135 },
    };
    state.bg = { ...state.bg, ...presets[button.dataset.preset] };
    syncBgControls();
    applyBackground();
    markUnsaved();
  });

  /* ------------------------------------------------------------------ *
   * 尺寸 / 形状 / 显示
   * ------------------------------------------------------------------ */
  function nextColorFor(axis) {
    const headers = axis === 'col' ? state.colHeaders : state.rowHeaders;
    const used = new Set(headers.map(header => header.color));
    const unused = COLORS.find(color => !used.has(color.id));
    return unused ? unused.id : COLORS[headers.length % COLORS.length].id;
  }

  function applySize(kind, target) {
    if (kind === 'rows') {
      while (state.rowHeaders.length < target) {
        state.rowHeaders.push(makeHeader(nextColorFor('row'), 'row'));
      }
      state.rowHeaders.length = target;
      state.rows = target;
    } else {
      while (state.colHeaders.length < target) {
        state.colHeaders.push(makeHeader(nextColorFor('col'), 'col'));
      }
      state.colHeaders.length = target;
      state.cols = target;
    }

    for (const key of Object.keys(state.cells)) {
      const [c, r] = key.split(':').map(Number);
      if (c >= state.cols || r >= state.rows) delete state.cells[key];
    }

    renderMatrix();
    scheduleLayout();
    markUnsaved();
  }

  function requestSizeChange(kind, delta) {
    const current = kind === 'rows' ? state.rows : state.cols;
    const target = clamp(current + delta, MIN_SIZE, MAX_SIZE);
    if (target === current) return;

    if (target < current) {
      let removed = 0;
      for (const key of Object.keys(state.cells)) {
        const [c, r] = key.split(':').map(Number);
        if (kind === 'rows' ? r >= target : c >= target) removed += 1;
      }
      if (removed > 0) {
        openConfirm({
          title: kind === 'rows' ? '缩小行数？' : '缩小列数？',
          message: `会移除第 ${target + 1} ${kind === 'rows' ? '行' : '列'}及之后的内容，其中有 ${removed} 张角色卡，移除后无法撤销。`,
          confirmLabel: '确认缩小',
          onConfirm: () => applySize(kind, target),
        });
        return;
      }
    }

    applySize(kind, target);
  }

  document.querySelectorAll('[data-step]').forEach(button => {
    button.addEventListener('click', () => {
      requestSizeChange(button.dataset.step, Number(button.dataset.delta));
    });
  });

  shapeOptions.addEventListener('click', event => {
    const button = event.target.closest('[data-shape]');
    if (!button) return;
    state.shape = button.dataset.shape;
    matrix.dataset.shape = state.shape;
    syncShapeButtons();
    scheduleLayout();
    markUnsaved();
  });

  showNameEl.addEventListener('change', () => {
    state.showName = showNameEl.checked;
    updateDividerState();
    renderMatrix();
    scheduleLayout();
    markUnsaved();
  });

  showIPEl.addEventListener('change', () => {
    state.showIP = showIPEl.checked;
    matrix.dataset.ip = state.showIP ? 'true' : 'false';
    updateDividerState();
    renderMatrix();
    scheduleLayout();
    markUnsaved();
  });

  showDividerEl.addEventListener('change', () => {
    state.showDivider = showDividerEl.checked;
    renderMatrix();
    markUnsaved();
  });

  showHeadersEl.addEventListener('change', () => {
    state.showHeaders = showHeadersEl.checked;
    renderMatrix();
    markUnsaved();
  });

  showSubtitleEl.addEventListener('change', () => {
    state.showSubtitle = showSubtitleEl.checked;
    boardSub.hidden = !state.showSubtitle;
    markUnsaved();
  });

  [
    [showTitleEl, 'showTitle'],
    [showBrandEl, 'showBrand'],
    [showCreatorEl, 'showCreator'],
    [showCountEl, 'showCount'],
  ].forEach(([element, key]) => {
    element.addEventListener('change', () => {
      state[key] = element.checked;
      applyTextVisibility();
      markUnsaved();
    });
  });

  showEmptyLinesEl.addEventListener('change', () => {
    state.showEmptyLines = showEmptyLinesEl.checked;
    applyTextVisibility();
    markUnsaved();
  });

  tagStylesEl.addEventListener('click', event => {
    const button = event.target.closest('[data-tag-style]');
    if (!button) return;
    state.tagStyle = button.dataset.tagStyle;
    syncTagStyleButtons();
    applyTagSettings();
    markUnsaved();
  });

  tagFontSizeEl.addEventListener('input', () => {
    state.tagFontSize = clamp(Number(tagFontSizeEl.value) || 100, 70, 150);
    tagFontSizeOut.textContent = `${state.tagFontSize}%`;
    scheduleLayout();
    markUnsaved();
  });

  gridGapEl.addEventListener('input', () => {
    state.gap = clamp(Number(gridGapEl.value) || 0, 0, 20);
    gridGapOut.textContent = `${state.gap}px`;
    scheduleLayout();
    markUnsaved();
  });

  tagOffsetEl.addEventListener('input', () => {
    state.tagOffset = clamp(Number(tagOffsetEl.value) || 0, 0, 10);
    tagOffsetOut.textContent = `${state.tagOffset}px`;
    applyTagSettings();
    fitTagText();
    markUnsaved();
  });

  tagPadEl.addEventListener('input', () => {
    state.tagPad = clamp(Number(tagPadEl.value) || 0, 0, 10);
    tagPadOut.textContent = `${state.tagPad}px`;
    applyTagSettings();
    fitTagText();
    markUnsaved();
  });

  tagTextGapEl.addEventListener('input', () => {
    state.tagTextGap = clamp(Number(tagTextGapEl.value) || 0, 0, 10);
    tagTextGapOut.textContent = `${state.tagTextGap}px`;
    applyTagSettings();
    fitTagText();
    markUnsaved();
  });

  titleInput.addEventListener('input', () => {
    state.title = titleInput.value;
    markUnsaved();
  });
  titleInput.addEventListener('blur', () => {
    const value = titleInput.value.trim() || DEFAULT_TITLE;
    titleInput.value = value;
    state.title = value;
    markUnsaved();
  });
  titleInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      titleInput.blur();
    }
  });

  creatorInput.addEventListener('input', () => {
    state.creator = creatorInput.value;
    renderByline();
    markUnsaved();
  });
  creatorInput.addEventListener('blur', () => {
    const value = creatorInput.value.trim();
    creatorInput.value = value;
    state.creator = value;
    renderByline();
    markUnsaved();
  });
  creatorInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      creatorInput.blur();
    }
  });

  /* ------------------------------------------------------------------ *
   * 角色弹窗
   * ------------------------------------------------------------------ */
  function blankDraft() {
    return { image: '', name: '', ip: '', imgZoom: 1, imgX: 0, imgY: 0, imgRotate: 0, imgFit: 'contain' };
  }

  function clampDraftOffset() {
    draft.imgZoom = clamp(Number(draft.imgZoom) || 1, 1, 3);
    draft.imgRotate = clamp(Number(draft.imgRotate) || 0, -180, 180);
    const maxOffset = panLimit(draft.imgZoom);
    draft.imgX = clamp(Number(draft.imgX) || 0, -maxOffset, maxOffset);
    draft.imgY = clamp(Number(draft.imgY) || 0, -maxOffset, maxOffset);
  }

  function applyDraftImage() {
    clampDraftOffset();
    previewImage.style.setProperty('--img-zoom', String(draft.imgZoom));
    previewImage.style.setProperty('--img-x', `${draft.imgX}%`);
    previewImage.style.setProperty('--img-y', `${draft.imgY}%`);
    previewImage.style.setProperty('--img-rot', `${draft.imgRotate}deg`);
    previewImage.style.setProperty('--img-fit', draft.imgFit || 'cover');
    imgFitButtons.forEach(button => {
      const active = button.dataset.fit === (draft.imgFit || 'cover');
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    imgZoom.value = String(Math.round(draft.imgZoom * 100));
    imgZoomOut.textContent = `${Math.round(draft.imgZoom * 100)}%`;
    imgAngle.value = String(Math.round(draft.imgRotate));
    imgAngleOut.textContent = `${Math.round(draft.imgRotate)}°`;
  }

  function updateUploadUI() {
    const hasImage = !!draft.image;
    uploadZone.classList.toggle('has-image', hasImage);
    if (hasImage) {
      if (previewImage.getAttribute('src') !== draft.image) previewImage.src = draft.image;
      previewImage.hidden = false;
      previewImage.alt = `${draft.name || '角色'}的图片`;
      applyDraftImage();
    } else {
      previewImage.removeAttribute('src');
      previewImage.hidden = true;
      previewImage.alt = '';
    }
    uploadEmpty.hidden = hasImage;
    cropControls.hidden = !hasImage;
  }

  function openCharacter(c, r, sourceEl) {
    editing = { col: c, row: r };
    lastFocus = sourceEl || null;
    const data = cellData(c, r);
    draft = data
      ? {
        image: data.image || '',
        name: data.name || '',
        ip: data.ip || '',
        imgZoom: data.imgZoom || 1,
        imgX: data.imgX || 0,
        imgY: data.imgY || 0,
        imgRotate: data.imgRotate || 0,
        imgFit: data.imgFit === 'contain' ? 'contain' : 'cover',
      }
      : blankDraft();

    $('characterTitle').textContent = data && hasContent(data) ? '编辑这一格' : '放一个角色进来';
    charName.value = draft.name;
    charIP.value = draft.ip;
    modalCoord.textContent = `${state.colHeaders[c].name} × ${state.rowHeaders[r].name}`;
    coordDot.style.setProperty('--dot-a', colorHex(state.colHeaders[c].color));
    coordDot.style.setProperty('--dot-b', colorHex(state.rowHeaders[r].color));
    updateUploadUI();

    characterModal.hidden = false;
    document.body.classList.add('modal-open');
    requestAnimationFrame(() => {
      if (window.innerWidth > 760) charName.focus();
      else $('[data-close-modal="character"]').focus();
    });
  }

  function closeCharacter() {
    if (characterModal.hidden) return;
    characterModal.hidden = true;
    editing = null;
    draft = blankDraft();
    cropDrag = null;
    updateUploadUI();
    refreshModalOpen();
    if (lastFocus && document.contains(lastFocus)) {
      try { lastFocus.focus({ preventScroll: true }); } catch (error) { /* ignore */ }
    }
    lastFocus = null;
  }

  btnSaveCell.addEventListener('click', () => {
    if (!editing) return;
    const name = charName.value.trim();
    const ip = charIP.value.trim();
    const key = cellKey(editing.col, editing.row);
    if (!draft.image && !name && !ip) {
      delete state.cells[key];
    } else {
      clampDraftOffset();
      state.cells[key] = {
        image: draft.image,
        name,
        ip,
        imgZoom: draft.imgZoom,
        imgX: draft.imgX,
        imgY: draft.imgY,
        imgRotate: draft.imgRotate,
        imgFit: draft.imgFit || 'cover',
      };
    }
    closeCharacter();
    renderMatrix();
    markUnsaved();
    toast('已保存这一格');
  });

  btnClearCell.addEventListener('click', () => {
    draft = blankDraft();
    charName.value = '';
    charIP.value = '';
    updateUploadUI();
    toast('内容已清空，点“保存这一格”生效');
  });

  charName.addEventListener('input', () => { draft.name = charName.value; });
  charIP.addEventListener('input', () => { draft.ip = charIP.value; });
  characterModal.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      btnSaveCell.click();
    }
  });

  document.querySelectorAll('[data-close-modal]').forEach(el => {
    el.addEventListener('click', () => {
      const name = el.dataset.closeModal;
      if (name === 'character') closeCharacter();
      else if (name === 'confirm') closeConfirm();
    });
  });

  /* ---------------- 图片处理 ---------------- */
  function loadImage(src) {
    return new Promise(resolve => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = src;
    });
  }

  const supportsWebP = (() => {
    try {
      return document.createElement('canvas').toDataURL('image/webp').startsWith('data:image/webp');
    } catch (error) {
      return false;
    }
  })();

  async function compressImage(file) {
    const objectUrl = URL.createObjectURL(file);
    try {
      const image = await loadImage(objectUrl);
      if (!image) throw new Error('图片读取失败');
      const maxSide = CONTAINER_MODE ? 560 : 820;
      const quality = CONTAINER_MODE ? 0.78 : 0.82;
      const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
      const width = Math.max(1, Math.round(image.naturalWidth * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(image, 0, 0, width, height);
      if (supportsWebP) {
        return canvas.toDataURL('image/webp', quality);
      }
      return canvas.toDataURL('image/png');
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  async function handleImageFile(file) {
    if (!file) return;
    if (!file.type || !file.type.startsWith('image/')) {
      toast('请选择图片文件');
      return;
    }
    uploadZone.classList.add('is-loading');
    try {
      const data = await compressImage(file);
      draft.image = data;
      draft.imgZoom = 1;
      draft.imgX = 0;
      draft.imgY = 0;
      draft.imgRotate = 0;
      draft.imgFit = 'contain';
      updateUploadUI();
    } catch (error) {
      toast('这张图片读取失败，换一张试试');
    } finally {
      uploadZone.classList.remove('is-loading');
    }
  }

  function chooseImage() {
    imageFile.value = '';
    imageFile.click();
  }

  $('btnPickImage').addEventListener('click', chooseImage);
  uploadZone.addEventListener('click', () => {
    if (draft.image) return;
    chooseImage();
  });
  uploadZone.addEventListener('keydown', event => {
    if (draft.image) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      chooseImage();
    }
  });

  uploadZone.addEventListener('pointerdown', event => {
    if (!draft.image) return;
    if (event.button !== undefined && event.button !== 0) return;
    const rect = uploadZone.getBoundingClientRect();
    cropDrag = {
      id: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: draft.imgX,
      startY: draft.imgY,
      width: Math.max(1, rect.width),
      height: Math.max(1, rect.height),
      moved: false,
    };
    uploadZone.classList.add('is-cropping');
    try { uploadZone.setPointerCapture(event.pointerId); } catch (error) { /* ignore */ }
  });

  uploadZone.addEventListener('pointermove', event => {
    if (!cropDrag || event.pointerId !== cropDrag.id) return;
    const dx = event.clientX - cropDrag.startClientX;
    const dy = event.clientY - cropDrag.startClientY;
    if (Math.abs(dx) + Math.abs(dy) > 2) cropDrag.moved = true;
    const maxOffset = panLimit(draft.imgZoom);
    draft.imgX = clamp(cropDrag.startX + (dx / cropDrag.width) * 100, -maxOffset, maxOffset);
    draft.imgY = clamp(cropDrag.startY + (dy / cropDrag.height) * 100, -maxOffset, maxOffset);
    applyDraftImage();
  });

  function endCropDrag(event) {
    if (!cropDrag) return;
    if (event && event.pointerId !== cropDrag.id) return;
    try { uploadZone.releasePointerCapture(cropDrag.id); } catch (error) { /* ignore */ }
    cropDrag = null;
    uploadZone.classList.remove('is-cropping');
  }

  uploadZone.addEventListener('pointerup', endCropDrag);
  uploadZone.addEventListener('pointercancel', endCropDrag);
  uploadZone.addEventListener('lostpointercapture', () => {
    cropDrag = null;
    uploadZone.classList.remove('is-cropping');
  });

  imgZoom.addEventListener('input', () => {
    draft.imgZoom = clamp(Number(imgZoom.value) / 100, 1, 3);
    applyDraftImage();
  });

  imgAngle.addEventListener('input', () => {
    draft.imgRotate = clamp(Number(imgAngle.value) || 0, -180, 180);
    applyDraftImage();
  });

  btnResetCrop.addEventListener('click', () => {
    draft.imgZoom = 1;
    draft.imgX = 0;
    draft.imgY = 0;
    draft.imgRotate = 0;
    draft.imgFit = 'contain';
    applyDraftImage();
  });

  imgFitButtons.forEach(button => {
    button.addEventListener('click', () => {
      draft.imgFit = button.dataset.fit === 'cover' ? 'cover' : 'contain';
      applyDraftImage();
    });
  });

  imageFile.addEventListener('change', () => {
    const file = imageFile.files && imageFile.files[0];
    if (file) handleImageFile(file);
  });

  uploadZone.addEventListener('dragover', event => {
    event.preventDefault();
    uploadZone.classList.add('is-dragover');
  });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('is-dragover'));
  uploadZone.addEventListener('drop', event => {
    event.preventDefault();
    uploadZone.classList.remove('is-dragover');
    const file = Array.from((event.dataTransfer && event.dataTransfer.files) || []).find(item => item.type.startsWith('image/'));
    if (file) handleImageFile(file);
  });

  $('btnRemoveImage').addEventListener('click', () => {
    draft.image = '';
    draft.imgRotate = 0;
    updateUploadUI();
  });

  document.addEventListener('paste', event => {
    if (characterModal.hidden) return;
    const item = Array.from((event.clipboardData && event.clipboardData.items) || []).find(entry => entry.type.startsWith('image/'));
    if (!item) return;
    const file = item.getAsFile();
    if (file) {
      event.preventDefault();
      handleImageFile(file);
    }
  });

  /* ------------------------------------------------------------------ *
   * 确认弹窗
   * ------------------------------------------------------------------ */
  function openConfirm({ title, message, confirmLabel = '确认', onConfirm }) {
    confirmTitle.textContent = title;
    confirmMessage.textContent = message;
    btnConfirmReset.textContent = confirmLabel;
    confirmAction = onConfirm || null;
    confirmModal.hidden = false;
    document.body.classList.add('modal-open');
  }

  function refreshModalOpen() {
    const anyOpen = [characterModal, confirmModal, archiveModal, shareModal]
      .some(modal => modal && !modal.hidden);
    document.body.classList.toggle('modal-open', anyOpen);
  }

  function closeConfirm() {
    if (confirmModal.hidden) return;
    confirmModal.hidden = true;
    confirmAction = null;
    refreshModalOpen();
  }

  btnConfirmReset.addEventListener('click', () => {
    const action = confirmAction;
    closeConfirm();
    if (typeof action === 'function') action();
  });

  /* ------------------------------------------------------------------ *
   * 本地存档
   * ------------------------------------------------------------------ */
  function archiveWhen(ts) {
    const date = new Date(Number(ts) || Date.now());
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${date.getMonth() + 1}月${date.getDate()}日 ${hh}:${mm}`;
  }

  function archiveMetaText(item) {
    const snapshot = item && item.state ? item.state : {};
    const rows = Number(snapshot.rows) || 0;
    const cols = Number(snapshot.cols) || 0;
    const filled = Object.values(snapshot.cells || {}).filter(hasContent).length;
    return `${rows} × ${cols} · ${filled} / ${rows * cols} · ${archiveWhen(item.createdAt)}`;
  }

  function renderArchiveList() {
    archiveList.innerHTML = '';
    if (!archives || !archives.length) {
      const empty = document.createElement('div');
      empty.className = 'archive-empty';
      const mark = document.createElement('span');
      mark.textContent = '＋';
      const copy = document.createElement('p');
      copy.textContent = '还没有存档。点上方「新建存档」，把这一张表留在本机。';
      empty.appendChild(mark);
      empty.appendChild(copy);
      archiveList.appendChild(empty);
      return;
    }

    archives.forEach(item => {
      const row = document.createElement('article');
      row.className = 'archive-item';

      const copy = document.createElement('div');
      copy.className = 'archive-item-copy';
      const name = document.createElement('b');
      name.textContent = item.name || '未命名存档';
      const meta = document.createElement('small');
      meta.textContent = archiveMetaText(item);
      copy.appendChild(name);
      copy.appendChild(meta);

      const actions = document.createElement('div');
      actions.className = 'archive-item-actions';
      const load = document.createElement('button');
      load.type = 'button';
      load.className = 'mini-btn';
      load.dataset.archiveLoad = item.id;
      load.textContent = '载入';
      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'mini-btn ghost';
      del.dataset.archiveDelete = item.id;
      del.textContent = '删除';
      actions.appendChild(load);
      actions.appendChild(del);

      row.appendChild(copy);
      row.appendChild(actions);
      archiveList.appendChild(row);
    });
  }

  async function openArchiveDialog() {
    archiveModal.hidden = false;
    refreshModalOpen();
    archiveList.innerHTML = '<div class="archive-loading">正在读取本机存档…</div>';
    await loadArchives(true);
    if (!archiveModal.hidden) renderArchiveList();
  }

  function closeArchiveDialog() {
    if (archiveModal.hidden) return;
    archiveModal.hidden = true;
    refreshModalOpen();
  }

  async function createArchive() {
    if (archiveBusy) return;
    archiveBusy = true;
    try {
      await loadArchives();
      if (archives.length >= ARCHIVE_LIMIT) {
        toast(`最多只能存 ${ARCHIVE_LIMIT} 个，先删掉一个吧`);
        return;
      }
      const now = Date.now();
      const title = String(state.title || DEFAULT_TITLE).trim() || DEFAULT_TITLE;
      archives.unshift({
        id: `a${now}${Math.floor(Math.random() * 1000)}`,
        name: title,
        createdAt: now,
        state: cloneState(state),
      });
      archives = archives.slice(0, ARCHIVE_LIMIT);
      await saveArchives();
      renderArchiveList();
      toast('已存到本机');
    } catch (error) {
      console.warn('archive save failed', error);
      toast('存档失败，可能是本机空间不足');
    } finally {
      archiveBusy = false;
    }
  }

  function loadArchive(item) {
    if (!item || !item.state) return;
    openConfirm({
      title: '载入这个存档？',
      message: '当前表格会被这份存档替换。没有存下来的改动将丢失。',
      confirmLabel: '载入存档',
      onConfirm: () => {
        state = normalizeState(cloneState(item.state));
        syncAllControls();
        renderAll({ sync: true });
        scheduleLayout();
        markUnsaved();
        closeArchiveDialog();
        toast('存档已载入');
      },
    });
  }

  function deleteArchive(item) {
    if (!item) return;
    openConfirm({
      title: '删除这个存档？',
      message: `「${item.name || '未命名存档'}」会被永久删除，无法恢复。`,
      confirmLabel: '删除存档',
      onConfirm: async () => {
        archives = (archives || []).filter(entry => entry.id !== item.id);
        try {
          await saveArchives();
          renderArchiveList();
          toast('存档已删除');
        } catch (error) {
          toast('删除失败，请稍后再试');
        }
      },
    });
  }

  /* ------------------------------------------------------------------ *
   * 二维码 / 分享链接
   * ------------------------------------------------------------------ */
  function shareSnapshot() {
    const snapshot = cloneState(state);
    let stripped = 0;
    Object.keys(snapshot.cells || {}).forEach(key => {
      if (snapshot.cells[key] && snapshot.cells[key].image) {
        delete snapshot.cells[key].image;
        stripped += 1;
      }
    });
    return { snapshot, stripped };
  }

  function buildSharePayload() {
    const { snapshot, stripped } = shareSnapshot();
    if (typeof LZString === 'undefined') throw new Error('LZString missing');
    const payload = LZString.compressToEncodedURIComponent(JSON.stringify(snapshot));
    if (!payload) throw new Error('compress failed');
    return { payload, stripped };
  }

  function readShareHash() {
    const raw = String(location.hash || '').replace(/^#/, '');
    if (!raw.startsWith('oshi=')) return null;
    if (typeof LZString === 'undefined') return null;
    try {
      const packed = decodeURIComponent(raw.slice(5));
      const json = LZString.decompressFromEncodedURIComponent(packed);
      if (!json) return null;
      return JSON.parse(json);
    } catch (error) {
      return null;
    }
  }

  let currentQrDataUrl = '';

  function openShareDialog() {
    shareModal.hidden = false;
    refreshModalOpen();
    qrImage.innerHTML = '';
    currentQrDataUrl = '';
    btnDownloadQr.disabled = true;
    try {
      const { payload, stripped } = buildSharePayload();
      const qr = qrcode(0, 'L');
      qr.addData(payload);
      qr.make();
      currentQrDataUrl = qr.createDataURL(6, 4);
      const image = document.createElement('img');
      image.alt = '表格二维码';
      image.src = currentQrDataUrl;
      qrImage.appendChild(image);
      btnDownloadQr.disabled = false;
      qrNote.textContent = stripped > 0
        ? `二维码只带文字与排版；这 ${stripped} 张图片不会随二维码传输。`
        : '二维码只包含文字和版面，不会上传服务器。';
    } catch (error) {
      console.warn('qr generation failed', error);
      qrImage.innerHTML = '<div class="qr-error">这张表的内容太多，二维码装不下。<br>可以先减少文字，或用本地存档。</div>';
      qrNote.textContent = '二维码单个最多约 3KB，图片和过长的文字无法编码。';
    }
  }

  function closeShareDialog() {
    if (shareModal.hidden) return;
    shareModal.hidden = true;
    refreshModalOpen();
  }

  function readQrImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        URL.revokeObjectURL(url);
        resolve(image);
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('image load failed'));
      };
      image.src = url;
    });
  }

  function parseSharePayload(text) {
    let raw = String(text || '').trim();
    const marker = raw.lastIndexOf('#oshi=');
    if (marker >= 0) raw = decodeURIComponent(raw.slice(marker + 6));
    if (!raw || /^https?:/i.test(raw)) throw new Error('not an oshi payload');
    if (typeof LZString === 'undefined') throw new Error('LZString missing');
    const json = LZString.decompressFromEncodedURIComponent(raw);
    if (!json) throw new Error('decompress failed');
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== 'object' || !parsed.cells) throw new Error('invalid payload');
    return normalizeState(parsed);
  }

  async function scanQrFile(file) {
    if (!file) return;
    if (typeof jsQR !== 'function') {
      toast('二维码识别组件没有加载，请刷新后再试');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast('图片太大了，换一张小一点的二维码');
      return;
    }
    btnScanImport.disabled = true;
    const oldLabel = btnScanImport.textContent;
    btnScanImport.textContent = '识别中…';
    try {
      const image = await readQrImage(file);
      const maxSide = 1600;
      const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
      const width = Math.max(1, Math.round(image.naturalWidth * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) throw new Error('canvas unavailable');
      context.drawImage(image, 0, 0, width, height);
      const pixels = context.getImageData(0, 0, width, height);
      const result = jsQR(pixels.data, width, height, { inversionAttempts: 'attemptBoth' });
      if (!result || !result.data) {
        toast('没有识别到二维码，换一张清晰、完整的图片试试');
        return;
      }
      const scanned = parseSharePayload(result.data);
      openConfirm({
        title: '导入这个二维码？',
        message: '当前表格会被二维码里的内容替换。二维码不包含图片，导入后需要重新添加图片。',
        confirmLabel: '导入二维码',
        onConfirm: () => {
          state = scanned;
          syncAllControls();
          renderAll({ sync: true });
          scheduleLayout();
          markUnsaved();
          closeArchiveDialog();
          toast('二维码存档已导入');
        },
      });
    } catch (error) {
      console.warn('qr scan failed', error);
      toast('这张图里没有找到可用的表格二维码');
    } finally {
      btnScanImport.disabled = false;
      btnScanImport.textContent = oldLabel;
      qrFile.value = '';
    }
  }

  async function downloadQrImage() {
    if (!currentQrDataUrl) return;
    if (CONTAINER_MODE) {
      const mini = await getMiniTool(9420, ['saveImageToPhotosAlbum']);
      if (!mini) {
        toast('当前版本不支持保存到相册');
        return;
      }
      try {
        await callMiniTool('saveImageToPhotosAlbum', { filePath: currentQrDataUrl });
        toast('二维码已保存到相册');
      } catch (error) {
        toast('保存失败，请截屏保存二维码');
      }
      return;
    }
    const link = document.createElement('a');
    link.href = currentQrDataUrl;
    link.download = '我推一览_二维码.png';
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast('二维码已下载');
  }

  btnArchive.addEventListener('click', openArchiveDialog);
  btnShare.addEventListener('click', openShareDialog);
  btnNewArchive.addEventListener('click', createArchive);

  archiveList.addEventListener('click', event => {
    const load = event.target.closest('[data-archive-load]');
    if (load) {
      const item = (archives || []).find(entry => entry.id === load.dataset.archiveLoad);
      loadArchive(item);
      return;
    }
    const del = event.target.closest('[data-archive-delete]');
    if (del) {
      const item = (archives || []).find(entry => entry.id === del.dataset.archiveDelete);
      deleteArchive(item);
    }
  });

  btnScanImport.addEventListener('click', () => qrFile.click());
  qrFile.addEventListener('change', () => {
    const file = qrFile.files && qrFile.files[0];
    if (file) scanQrFile(file);
  });
  btnDownloadQr.addEventListener('click', downloadQrImage);

  document.querySelectorAll('[data-close-modal]').forEach(el => {
    el.addEventListener('click', () => {
      const name = el.dataset.closeModal;
      if (name === 'character') closeCharacter();
      else if (name === 'confirm') closeConfirm();
      else if (name === 'archive') closeArchiveDialog();
      else if (name === 'share') closeShareDialog();
    });
  });


  btnReset.addEventListener('click', () => {
    openConfirm({
      title: '一键回正？',
      message: '表格会恢复成 6 × 7 的初始状态，角色卡片、表头颜色和背景设置都会被清空。',
      confirmLabel: '确认回正',
      onConfirm: () => {
        state = createDefaultState();
        syncAllControls();
        renderAll({ sync: true });
        markUnsaved();
        toast('已经回正到初始状态');
      },
    });
  });

  /* ------------------------------------------------------------------ *
   * 拖拽
   * ------------------------------------------------------------------ */
  function clearPress() {
    if (!press) return;
    clearTimeout(press.timer);
    press = null;
  }

  function suppressNextClick() {
    suppressClick = true;
    clearTimeout(suppressTimer);
    suppressTimer = setTimeout(() => { suppressClick = false; }, 600);
  }

  function makeCellGhost(sourceEl) {
    const rect = sourceEl.getBoundingClientRect();
    const ghost = document.createElement('div');
    ghost.className = `drag-ghost shape-${state.shape}`;
    ghost.style.width = `${rect.width}px`;
    ghost.style.height = `${rect.height}px`;
    const inner = sourceEl.querySelector('.cell-inner');
    if (inner) ghost.innerHTML = inner.outerHTML;
    return ghost;
  }

  function makeHeaderGhost(sourceEl) {
    const labelNode = sourceEl.querySelector('.header-label');
    const label = labelNode ? labelNode.textContent : '';
    const dot = sourceEl.querySelector('.header-dot');
    const ghost = document.createElement('div');
    ghost.className = 'drag-ghost header-ghost';
    if (dot) ghost.append(dot.cloneNode(true));
    const text = document.createElement('span');
    text.textContent = label;
    ghost.append(text);
    return ghost;
  }

  function setGhostPosition(ghost, x, y) {
    ghost.style.left = `${x}px`;
    ghost.style.top = `${y}px`;
  }

  function startDrag() {
    if (!press || press.active) return;
    press.active = true;
    const info = press.info;
    const sourceEl = press.el;

    const ghost = info.kind === 'cell' ? makeCellGhost(sourceEl) : makeHeaderGhost(sourceEl);
    document.body.appendChild(ghost);
    setGhostPosition(ghost, press.lastX, press.lastY);

    drag = {
      kind: info.kind,
      axis: info.axis,
      index: info.index,
      col: info.col,
      row: info.row,
      pointerId: press.pointerId,
      sourceEl,
      ghost,
      targetEl: null,
    };

    sourceEl.classList.add('is-drag-source');
    document.body.classList.add('is-dragging');
    try { sourceEl.setPointerCapture(press.pointerId); } catch (error) { /* ignore */ }
    if (navigator.vibrate) {
      try { navigator.vibrate(12); } catch (error) { /* ignore */ }
    }
  }

  function findDropTarget(x, y) {
    if (!drag) return null;
    const under = document.elementFromPoint(x, y);
    if (!under) return null;
    if (drag.kind === 'cell') {
      const cell = under.closest('.cell');
      if (!cell || cell === drag.sourceEl) return null;
      return cell;
    }
    const header = under.closest('.axis-header');
    if (!header || header === drag.sourceEl) return null;
    if (header.dataset.axis !== drag.axis) return null;
    return header;
  }

  function updateDrag(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    setGhostPosition(drag.ghost, event.clientX, event.clientY);
    const target = findDropTarget(event.clientX, event.clientY);
    if (target === drag.targetEl) return;
    if (drag.targetEl) drag.targetEl.classList.remove('is-drop-target');
    drag.targetEl = target;
    if (target) target.classList.add('is-drop-target');
  }

  function cleanupDrag() {
    if (!drag) return;
    if (drag.targetEl) drag.targetEl.classList.remove('is-drop-target');
    drag.sourceEl.classList.remove('is-drag-source');
    drag.ghost.remove();
    document.body.classList.remove('is-dragging');
    drag = null;
  }

  function swapCells(from, to) {
    const a = cellKey(from.col, from.row);
    const b = cellKey(to.col, to.row);
    const first = state.cells[a];
    const second = state.cells[b];
    if (second) state.cells[a] = second;
    else delete state.cells[a];
    if (first) state.cells[b] = first;
    else delete state.cells[b];
    renderMatrix();
    markUnsaved();
    toast(second ? '已交换两张角色卡' : '已把角色移动到这一格');
  }

  function moveAxis(axis, from, to) {
    if (from === to) return;
    const headers = axis === 'col' ? state.colHeaders : state.rowHeaders;
    const [moved] = headers.splice(from, 1);
    headers.splice(to, 0, moved);

    const mapIndex = index => {
      if (index === from) return to;
      if (from < to && index > from && index <= to) return index - 1;
      if (to < from && index >= to && index < from) return index + 1;
      return index;
    };

    const nextCells = {};
    for (const [key, value] of Object.entries(state.cells)) {
      const [c, r] = key.split(':').map(Number);
      const nc = axis === 'col' ? mapIndex(c) : c;
      const nr = axis === 'row' ? mapIndex(r) : r;
      nextCells[cellKey(nc, nr)] = value;
    }
    state.cells = nextCells;
    closeHeaderPopover();
    renderMatrix();
    markUnsaved();
    toast(axis === 'col' ? '已移动整列' : '已移动整行');
  }

  function finishDrag() {
    if (!drag) return;
    const current = drag;
    const target = current.targetEl;
    const cellSource = current.kind === 'cell'
      ? { col: current.col, row: current.row } : null;
    cleanupDrag();
    suppressNextClick();

    if (!target) return;
    if (current.kind === 'cell') {
      const destination = { col: Number(target.dataset.col), row: Number(target.dataset.row) };
      if (destination.col === cellSource.col && destination.row === cellSource.row) return;
      swapCells(cellSource, destination);
    } else {
      const index = Number(target.dataset.index);
      moveAxis(current.axis, current.index, index);
    }
  }

  function onPointerDown(event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (!characterModal.hidden || !confirmModal.hidden) return;
    const header = event.target.closest('.axis-header');
    const cell = event.target.closest('.cell');
    const source = header || cell;
    if (!source) return;
    if (cell && cell.classList.contains('is-empty')) return;
    if (cell && cell.classList.contains('has-character') === false) return;

    if (press) clearPress();

    const info = header
      ? { kind: 'header', axis: header.dataset.axis, index: Number(header.dataset.index) }
      : { kind: 'cell', col: Number(cell.dataset.col), row: Number(cell.dataset.row) };

    press = {
      pointerId: event.pointerId,
      el: source,
      info,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      active: false,
      timer: 0,
    };
    press.timer = setTimeout(startDrag, LONG_PRESS);
  }

  function onPointerMove(event) {
    if (drag && event.pointerId === drag.pointerId) {
      if (event.cancelable) event.preventDefault();
      updateDrag(event);
      return;
    }
    if (!press || event.pointerId !== press.pointerId) return;
    press.lastX = event.clientX;
    press.lastY = event.clientY;
    const distance = Math.hypot(event.clientX - press.startX, event.clientY - press.startY);
    if (!press.active && distance > 7) clearPress();
  }

  function onPointerUp(event) {
    if (drag && event.pointerId === drag.pointerId) {
      finishDrag();
      clearPress();
      return;
    }
    if (press && event.pointerId === press.pointerId) clearPress();
  }

  function onPointerCancel(event) {
    if (drag && event.pointerId === drag.pointerId) {
      cleanupDrag();
      suppressNextClick();
    }
    clearPress();
  }

  matrix.addEventListener('pointerdown', onPointerDown);
  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('pointerup', onPointerUp);
  document.addEventListener('pointercancel', onPointerCancel);

  document.addEventListener('touchmove', event => {
    if (drag && event.cancelable) event.preventDefault();
  }, { passive: false });

  matrix.addEventListener('contextmenu', event => {
    if (event.target.closest('.cell, .axis-header')) event.preventDefault();
  });

  matrix.addEventListener('click', event => {
    if (suppressClick) {
      suppressClick = false;
      clearTimeout(suppressTimer);
      return;
    }
    const header = event.target.closest('.axis-header');
    if (header) {
      openHeaderPopover(header.dataset.axis, Number(header.dataset.index), header);
      return;
    }
    const cell = event.target.closest('.cell');
    if (cell) {
      openCharacter(Number(cell.dataset.col), Number(cell.dataset.row), cell);
    }
  });

  window.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (!headerPopover.hidden) {
      closeHeaderPopover();
      return;
    }
    if (!characterModal.hidden) {
      closeCharacter();
      return;
    }
    if (!confirmModal.hidden) closeConfirm();
  });

  window.addEventListener('resize', scheduleLayout);
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(scheduleLayout);
    observer.observe(tableScroll);
  }

  /* ------------------------------------------------------------------ *
   * 导出 PNG
   * ------------------------------------------------------------------ */
  function roundRectPath(ctx, x, y, w, h, radius) {
    const r = Math.max(0, Math.min(radius, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function heartPath(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.moveTo(x + w * 0.5, y + h * 0.94);
    ctx.bezierCurveTo(x + w * 0.40, y + h * 0.85, x + w * 0.04, y + h * 0.63, x + w * 0.04, y + h * 0.34);
    ctx.bezierCurveTo(x + w * 0.04, y + h * 0.13, x + w * 0.20, y + h * 0.02, x + w * 0.35, y + h * 0.02);
    ctx.bezierCurveTo(x + w * 0.44, y + h * 0.02, x + w * 0.49, y + h * 0.08, x + w * 0.50, y + h * 0.14);
    ctx.bezierCurveTo(x + w * 0.51, y + h * 0.08, x + w * 0.56, y + h * 0.02, x + w * 0.65, y + h * 0.02);
    ctx.bezierCurveTo(x + w * 0.80, y + h * 0.02, x + w * 0.96, y + h * 0.13, x + w * 0.96, y + h * 0.34);
    ctx.bezierCurveTo(x + w * 0.96, y + h * 0.63, x + w * 0.60, y + h * 0.85, x + w * 0.50, y + h * 0.94);
    ctx.closePath();
  }

  function traceShape(ctx, x, y, w, h, shape) {
    if (shape === 'circle') {
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.closePath();
    } else if (shape === 'heart') {
      heartPath(ctx, x, y, w, h);
    } else if (shape === 'square') {
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.closePath();
    } else {
      roundRectPath(ctx, x, y, w, h, w * 0.17);
    }
  }

  function fitText(ctx, text, maxWidth) {
    const value = String(text || '');
    if (ctx.measureText(value).width <= maxWidth) return value;
    const chars = Array.from(value);
    while (chars.length > 0) {
      chars.pop();
      const candidate = `${chars.join('')}…`;
      if (ctx.measureText(candidate).width <= maxWidth) return candidate;
    }
    return '…';
  }

  function drawDot(ctx, colorId, cx, cy, radius) {
    ctx.save();
    if (colorId === 'hetero') {
      let gradient;
      if (ctx.createConicGradient) {
        gradient = ctx.createConicGradient(0, cx, cy);
        gradient.addColorStop(0, '#E98A8A');
        gradient.addColorStop(0.2, '#EFC56F');
        gradient.addColorStop(0.4, '#91C49D');
        gradient.addColorStop(0.6, '#7EB3D9');
        gradient.addColorStop(0.8, '#B393D6');
        gradient.addColorStop(1, '#E98A8A');
      } else {
        gradient = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
        gradient.addColorStop(0, '#E98A8A');
        gradient.addColorStop(0.5, '#7EB3D9');
        gradient.addColorStop(1, '#B393D6');
      }
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    } else if (colorId === 'other') {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = '#FFF8F4';
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
      ctx.strokeStyle = '#A88D98';
      ctx.lineWidth = Math.max(1, radius * 0.36);
      for (let offset = -radius * 2; offset <= radius * 2; offset += radius * 0.8) {
        ctx.beginPath();
        ctx.moveTo(cx - radius + offset, cy + radius);
        ctx.lineTo(cx + radius + offset, cy - radius);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = colorHex(colorId);
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function exportGradient(ctx, width, height, angle, c1, c2) {
    const rad = (angle * Math.PI) / 180;
    const dx = Math.sin(rad);
    const dy = -Math.cos(rad);
    const length = Math.abs(width * dx) + Math.abs(height * dy);
    const cx = width / 2;
    const cy = height / 2;
    const gradient = ctx.createLinearGradient(
      cx - dx * length / 2, cy - dy * length / 2,
      cx + dx * length / 2, cy + dy * length / 2
    );
    gradient.addColorStop(0, c1);
    gradient.addColorStop(1, c2);
    return gradient;
  }

  function drawExportBackground(ctx, width, height, bg) {
    const c1 = normalizeHex(bg.c1, DEFAULT_BG.c1);
    const c2 = normalizeHex(bg.c2, DEFAULT_BG.c2);
    const angle = clamp(Number(bg.angle) || 0, 0, 360);
    ctx.fillStyle = c1;
    ctx.fillRect(0, 0, width, height);

    if (bg.mode === 'gradient' || bg.mode === 'dots') {
      ctx.fillStyle = exportGradient(ctx, width, height, angle, c1, c2);
      ctx.fillRect(0, 0, width, height);
    }

    if (bg.mode === 'dots') {
      const dotSize = clamp(Number(bg.dotSize) || 10, 4, 40);
      const dotGap = clamp(Number(bg.dotGap) || 32, 14, 80);
      const radius = Math.max(1.8, dotSize * 0.3);
      const gap = Math.max(18, dotGap * 0.85);
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = normalizeHex(bg.dot, DEFAULT_BG.dot);
      for (let y = gap / 2; y < height; y += gap) {
        for (let x = gap / 2; x < width; x += gap) {
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }
  }

  function drawExportHeader(ctx, x, y, w, h, header, axis, dark) {
    roundRectPath(ctx, x, y, w, h, Math.min(12, h * 0.24));
    ctx.fillStyle = dark ? 'rgba(255,255,255,.13)' : 'rgba(255,255,255,.38)';
    ctx.fill();
    ctx.strokeStyle = dark ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.55)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    const ink = dark ? '#FFF8F2' : '#47333E';
    const dotRadius = 4.5;
    const dotX = axis === 'col' ? x + w / 2 : x + 10;
    const dotY = axis === 'col' ? y + 12 : y + h / 2;
    drawDot(ctx, header.color, dotX, dotY, dotRadius);

    ctx.font = `400 ${Math.max(9, Math.min(14, w * 0.17))}px ${FONT}`;
    ctx.fillStyle = ink;
    ctx.textAlign = axis === 'col' ? 'center' : 'left';
    ctx.textBaseline = 'middle';
    const maxTextWidth = axis === 'col' ? w - 10 : w - (dotX - x) - dotRadius - 12;
    const text = fitText(ctx, header.name, maxTextWidth);
    if (axis === 'col') {
      ctx.fillText(text, x + w / 2, y + h * 0.66);
    } else {
      ctx.fillText(text, dotX + dotRadius + 6, y + h / 2 + 0.5);
    }
  }

  function drawExportCell(ctx, x, y, size, data, colHeader, rowHeader, images, bgDark) {
    const shape = state.shape;
    const hasData = hasContent(data);
    const ink = bgDark ? '#FFF8F2' : '#47333E';

    if (!hasData) {
      if (!state.showEmptyLines) return;
      traceShape(ctx, x, y, size, size, shape);
      ctx.save();
      ctx.strokeStyle = bgDark ? 'rgba(255,255,255,.25)' : 'rgba(91,62,76,.2)';
      ctx.lineWidth = 1.4;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = bgDark ? 'rgba(255,255,255,.35)' : 'rgba(91,62,76,.3)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(x + size * 0.42, y + size * 0.5);
      ctx.lineTo(x + size * 0.58, y + size * 0.5);
      ctx.moveTo(x + size * 0.5, y + size * 0.42);
      ctx.lineTo(x + size * 0.5, y + size * 0.58);
      ctx.stroke();
      ctx.restore();
      return;
    }

    const art = data.image ? images.get(data.image) : null;

    ctx.save();
    traceShape(ctx, x, y, size, size, shape);
    ctx.clip();

    if (art && art.naturalWidth) {
      const imgZoom = clamp(Number(data.imgZoom) || 1, 1, 3);
      const maxOffset = panLimit(imgZoom);
      const imgX = clamp(Number(data.imgX) || 0, -maxOffset, maxOffset);
      const imgY = clamp(Number(data.imgY) || 0, -maxOffset, maxOffset);
      const imgRotate = clamp(Number(data.imgRotate) || 0, -180, 180);
      const baseScale = data.imgFit === 'contain'
        ? Math.min(size / art.naturalWidth, size / art.naturalHeight)
        : Math.max(size / art.naturalWidth, size / art.naturalHeight);
      const drawW = art.naturalWidth * baseScale * imgZoom;
      const drawH = art.naturalHeight * baseScale * imgZoom;
      const centerX = x + size / 2 + (size * imgX) / 100;
      const centerY = y + size / 2 + (size * imgY) / 100;
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(imgRotate * Math.PI / 180);
      ctx.drawImage(art, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    } else {
      const name = String(data.name || '').trim();
      const initial = name ? Array.from(name)[0] : '♡';
      ctx.font = `800 ${size * 0.34}px ${FONT}`;
      ctx.fillStyle = 'rgba(66,45,56,.55)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(initial, x + size / 2, y + size * 0.44);
    }

    ctx.restore();

    traceShape(ctx, x, y, size, size, shape);
    ctx.strokeStyle = 'rgba(255,255,255,.55)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    const nameText = state.showName ? String(data.name || '').trim() : '';
    const ipText = state.showIP ? String(data.ip || '').trim() : '';
    if (nameText || ipText) {
      const scale = clamp(state.tagFontSize / 100, 0.7, 1.5);
      const tagHeight = Math.max(15, (size / 5.5) * scale);
      const tagX = x + size * 0.02;
      const tagW = size * 0.96;
      const tagY = y + size + clamp(state.tagOffset, 0, 10);
      const tagPad = clamp(state.tagPad, 0, 10);
      const textGap = clamp(state.tagTextGap, 0, 10);

      if (state.tagStyle === 'glass') {
        roundRectPath(ctx, tagX, tagY, tagW, tagHeight, tagHeight / 2);
        ctx.fillStyle = bgDark ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.42)';
        ctx.fill();
        ctx.strokeStyle = bgDark ? 'rgba(255,255,255,.22)' : 'rgba(255,255,255,.58)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      let fontSize = clamp(size * 0.088, 7.2, 13) * scale;
      const maxWidth = Math.max(8, tagW - tagPad * 2);
      const measureParts = () => {
        ctx.font = `700 ${fontSize}px ${FONT}`;
        const nw = nameText ? ctx.measureText(nameText).width : 0;
        ctx.font = `400 ${fontSize}px ${FONT}`;
        const sw = nameText && ipText && state.showDivider ? ctx.measureText('|').width : 0;
        const iw = ipText ? ctx.measureText(state.showName ? ipText : `IP · ${ipText}`).width : 0;
        const gaps = (nameText && ipText) ? textGap * (state.showDivider ? 2 : 1) : 0;
        return { nw, sw, iw, total: nw + sw + iw + gaps };
      };
      let parts = measureParts();
      while (parts.total > maxWidth && fontSize > 2.2) {
        fontSize = Math.max(4, fontSize - 0.3);
        parts = measureParts();
      }

      ctx.fillStyle = ink;
      ctx.textBaseline = 'middle';
      const midY = tagY + tagHeight / 2 + 0.4;
      let startX;
      let total = parts.total;
      if (nameText && ipText) {
        startX = x + size / 2 - total / 2;
        ctx.textAlign = 'left';
        ctx.font = `700 ${fontSize}px ${FONT}`;
        ctx.fillText(nameText, startX, midY);
        let cursor = startX + parts.nw;
        if (state.showDivider) {
          cursor += textGap;
          ctx.font = `400 ${fontSize}px ${FONT}`;
          ctx.globalAlpha = 0.34;
          ctx.fillText('|', cursor, midY);
          ctx.globalAlpha = 1;
          cursor += parts.sw;
        }
        cursor += textGap;
        ctx.font = `400 ${fontSize}px ${FONT}`;
        ctx.globalAlpha = 0.78;
        ctx.fillText(ipText, cursor, midY);
        ctx.globalAlpha = 1;
      } else {
        const label = nameText || `IP · ${ipText}`;
        ctx.textAlign = 'center';
        ctx.font = `400 ${fontSize}px ${FONT}`;
        ctx.fillText(label, x + size / 2, midY);
        total = ctx.measureText(label).width;
        startX = x + size / 2 - total / 2;
      }

      if (state.tagStyle === 'underline') {
        ctx.strokeStyle = ink;
        ctx.globalAlpha = 0.42;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(startX, tagY + tagHeight - 1);
        ctx.lineTo(startX + total, tagY + tagHeight - 1);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  }

  async function preloadExportImages() {
    const sources = new Set();
    for (const data of Object.values(state.cells)) {
      if (data && data.image) sources.add(data.image);
    }
    const map = new Map();
    await Promise.all(Array.from(sources).map(async src => {
      const image = await loadImage(src);
      if (image) map.set(src, image);
    }));
    return map;
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 12000);
  }

  async function exportPNG() {
    if (exporting) return;
    exporting = true;
    btnExport.disabled = true;
    exportVeil.hidden = false;
    document.body.classList.add('modal-open');

    try {
      await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 60));
      const images = await preloadExportImages();

      const cell = state.cols === 1 ? 200 : state.cols === 2 ? 170 : state.cols === 3 ? 140 : 110;
      const gap = clamp(Number(state.gap) || 10, 0, 20);
      const showHeaders = state.showHeaders;
      const labelW = showHeaders ? Math.round(clamp(cell * 0.44, 58, 84)) : 0;
      const headH = showHeaders ? Math.round(Math.max(42, cell * 0.34)) : 0;
      const hasTag = Boolean(state.showName || state.showIP);
      const tagH = hasTag
        ? Math.max(15, (cell / 5.5) * clamp(state.tagFontSize / 100, 0.7, 1.5))
        : 0;
      const rowH = cell + (hasTag ? tagH + Math.max(8, clamp(state.tagOffset, 0, 10) + 4) : 0);
      const tableW = (showHeaders ? labelW + gap : 0) + state.cols * cell + Math.max(0, state.cols - 1) * gap;
      const tableH = (showHeaders ? headH + gap : 0) + state.rows * rowH + Math.max(0, state.rows - 1) * gap;

      const padX = 58;
      const width = Math.max(780, tableW + padX * 2);
      const top = 48;
      const showTitle = state.showTitle;
      const showBrand = state.showBrand;
      const kickerH = showBrand ? 18 : 0;
      const titleSize = Math.min(64, width * 0.07);
      const titleH = showTitle ? titleSize * 1.3 : 0;
      const subtitleH = state.showSubtitle ? 30 : 0;
      const creator = String(state.creator || '').trim();
      const creatorH = state.showCreator && creator ? 26 : 0;
      const beforeTable = 26;
      const showFooter = state.showBrand || state.showCount;
      const footerH = showFooter ? 72 : 0;
      const bottom = 34;
      const height = top + kickerH + (showBrand ? 8 : 0) + titleH + subtitleH + creatorH + beforeTable + tableH + footerH + bottom;

      const canvas = document.createElement('canvas');
      const ratio = 2;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      const ctx = canvas.getContext('2d');
      ctx.scale(ratio, ratio);
      ctx.imageSmoothingQuality = 'high';

      drawExportBackground(ctx, width, height, state.bg);

      const avg = mixHex(state.bg.c1, state.bg.c2, 0.5);
      const dark = luminance(avg) < 0.42;
      const ink = dark ? '#FFF8F2' : '#47333E';
      const softInk = dark ? 'rgba(255,246,240,.68)' : '#8F7883';

      ctx.save();
      roundRectPath(ctx, 18, 18, width - 36, height - 36, 26);
      ctx.strokeStyle = dark ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.55)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();

      const centerX = width / 2;
      let cursorY = top;

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (showBrand) {
        ctx.font = `400 10px ${FONT}`;
        ctx.fillStyle = softInk;
        ctx.fillText('M Y   O S H I   M A T R I X', centerX, cursorY + kickerH / 2);
        cursorY += kickerH + 8;
      }

      if (showTitle) {
        let finalTitleSize = titleSize;
        ctx.font = `800 ${finalTitleSize}px ${FONT}`;
        while (ctx.measureText(state.title || DEFAULT_TITLE).width > width * 0.9 && finalTitleSize > 24) {
          finalTitleSize -= 2;
          ctx.font = `800 ${finalTitleSize}px ${FONT}`;
        }
        ctx.fillStyle = ink;
        ctx.fillText(state.title || DEFAULT_TITLE, centerX, cursorY + titleH / 2);
        cursorY += titleH;
      }

      if (state.showSubtitle) {
        ctx.font = `400 11px ${FONT}`;
        ctx.fillStyle = softInk;
        ctx.fillText('把喜欢的角色，按发色 × 瞳色收进一张表', centerX, cursorY + subtitleH / 2);
        cursorY += subtitleH;
      }

      if (state.showCreator && creator) {
        ctx.font = `400 10px ${FONT}`;
        ctx.fillStyle = softInk;
        ctx.fillText(`填表人 · ${creator}`, centerX, cursorY + creatorH / 2);
        cursorY += creatorH;
      }
      cursorY += beforeTable;

      const tableX = (width - tableW) / 2;
      const tableY = cursorY;
      const contentX = tableX + (showHeaders ? labelW + gap : 0);
      const contentY = tableY + (showHeaders ? headH + gap : 0);

      if (showHeaders) {
        drawExportHeader(ctx, tableX, tableY, labelW, headH, { color: 'gray', name: '瞳×发' }, 'row', dark);

        for (let c = 0; c < state.cols; c += 1) {
          const x = contentX + c * (cell + gap);
          drawExportHeader(ctx, x, tableY, cell, headH, state.colHeaders[c], 'col', dark);
        }
      }

      for (let r = 0; r < state.rows; r += 1) {
        const y = contentY + r * (rowH + gap);
        if (showHeaders) drawExportHeader(ctx, tableX, y, labelW, cell, state.rowHeaders[r], 'row', dark);
        for (let c = 0; c < state.cols; c += 1) {
          const x = contentX + c * (cell + gap);
          drawExportCell(ctx, x, y, cell, cellData(c, r), state.colHeaders[c], state.rowHeaders[r], images, dark);
        }
      }

      if (showFooter) {
        const footerY = tableY + tableH + footerH / 2;
        ctx.save();
        ctx.strokeStyle = dark ? 'rgba(255,255,255,.15)' : 'rgba(128,91,108,.16)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tableX, footerY - 24);
        ctx.lineTo(tableX + tableW, footerY - 24);
        ctx.stroke();
        ctx.restore();

        const filled = Object.values(state.cells).filter(hasContent).length;
        ctx.font = `400 9px ${FONT}`;
        ctx.fillStyle = softInk;
        ctx.textBaseline = 'middle';
        if (state.showBrand) {
          ctx.textAlign = 'left';
          ctx.fillText('OSHI MATRIX', tableX, footerY + 2);
        }
        if (state.showCount) {
          ctx.textAlign = 'right';
          ctx.fillText(`${state.cols} × ${state.rows} · ${filled} / ${state.cols * state.rows}`, tableX + tableW, footerY + 2);
        }
      }

      if (CONTAINER_MODE) {
        await saveToAlbum(canvas);
        toast('已保存到相册');
      } else {
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        if (!blob) throw new Error('canvas toBlob failed');
        const safeTitle = (state.title || DEFAULT_TITLE).replace(/[\\/:*?"<>|]/g, '_').slice(0, 30);
        const date = new Date();
        const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
        downloadBlob(blob, `${safeTitle}_${stamp}.png`);
        toast('高清图片已导出');
      }
    } catch (error) {
      console.error(error);
      toast('导出失败，请稍后再试');
    } finally {
      exporting = false;
      btnExport.disabled = false;
      exportVeil.hidden = true;
      document.body.classList.remove('modal-open');
    }
  }

  btnExport.addEventListener('click', exportPNG);

  /* ------------------------------------------------------------------ *
   * 启动
   * ------------------------------------------------------------------ */
  async function boot() {
    bindHexPair('bg1Color', 'bg1Hex', 'c1');
    bindHexPair('bg2Color', 'bg2Hex', 'c2');
    bindHexPair('dotColor', 'dotHex', 'dot');
    bindRange('bgAngle', 'angleOut', 'angle', '°');
    bindRange('dotSize', 'dotSizeOut', 'dotSize', 'px');
    bindRange('dotGap', 'dotGapOut', 'dotGap', 'px');

    let saved = null;
    try {
      saved = await loadSavedState();
    } catch (error) {
      saved = null;
    }
    const shared = readShareHash();
    state = normalizeState(shared || saved);
    syncAllControls();
    renderAll({ sync: true });
    scheduleLayout();
    requestAnimationFrame(layoutTable);

    if (shared) {
      markUnsaved();
      try {
        history.replaceState(null, '', location.pathname + location.search);
      } catch (error) { /* file URL may disallow */ }
      toast('已载入扫码存档');
    }

    if (CONTAINER_MODE) {
      applyContainerSafeArea();
      getMiniTool(9420, ['saveImageToPhotosAlbum']).then(mini => {
        if (!mini) return;
        const label = btnExport.querySelector('span');
        if (label) label.textContent = '保存到相册';
        if (btnDownloadQr) btnDownloadQr.textContent = '保存二维码';
      });
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(scheduleLayout).catch(() => {});
    }

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flushSave();
    });
    window.addEventListener('pagehide', flushSave);
  }

  boot();
})();
