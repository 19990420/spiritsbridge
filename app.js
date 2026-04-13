/**
 * SpiritsBridge — app.js
 * SPA transitions · Forms (localStorage) · Price slider · Video lightbox · Connect form
 */
(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════
     1. INJECT STYLES
  ══════════════════════════════════════════════════════ */
  const STYLES = `
    /* ── Page transitions ── */
    body { opacity: 0; transition: opacity .25s ease; }
    body.sb-ready { opacity: 1; }
    body.sb-leaving { opacity: 0 !important; pointer-events: none; }

    /* ── Back button ── */
    .sb-back-btn {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.18);
      color: rgba(255,255,255,.75); font-size: 13px; font-family: sans-serif;
      padding: 6px 14px; border-radius: 20px; cursor: pointer;
      text-decoration: none; transition: all .2s; flex-shrink: 0;
    }
    .sb-back-btn:hover { background: rgba(255,255,255,.18); color: #fff; }

    /* ── Price slider ── */
    .sb-slider-wrap { padding: 8px 0 0; }
    .sb-slider-track {
      position: relative; height: 4px; background: #ddd; border-radius: 2px; margin: 20px 6px 8px;
    }
    .sb-slider-fill {
      position: absolute; height: 100%; background: #C97B2A; border-radius: 2px;
    }
    .sb-slider-input {
      position: absolute; width: 100%; height: 4px;
      -webkit-appearance: none; appearance: none; background: transparent;
      pointer-events: none; top: 0; left: 0; margin: 0;
    }
    .sb-slider-input::-webkit-slider-thumb {
      -webkit-appearance: none; appearance: none;
      width: 16px; height: 16px; border-radius: 50%;
      background: #C97B2A; border: 2px solid #fff;
      box-shadow: 0 1px 4px rgba(0,0,0,.3); pointer-events: all; cursor: pointer;
    }
    .sb-slider-labels {
      display: flex; justify-content: space-between; font-size: 12px; color: #6B6057;
      font-family: sans-serif; margin-top: 6px;
    }
    .sb-slider-labels span { font-weight: 700; color: #1A1208; }

    /* ── Video lightbox ── */
    .sb-lightbox {
      position: fixed; inset: 0; z-index: 9000;
      background: rgba(0,0,0,.92); display: flex; align-items: center; justify-content: center;
      padding: 24px; opacity: 0; pointer-events: none; transition: opacity .3s;
    }
    .sb-lightbox.open { opacity: 1; pointer-events: all; }
    .sb-lightbox-inner {
      width: 100%; max-width: 880px; border-radius: 12px; overflow: hidden;
      position: relative; background: #000; aspect-ratio: 16/9;
      transform: scale(.95); transition: transform .3s;
    }
    .sb-lightbox.open .sb-lightbox-inner { transform: scale(1); }
    .sb-lightbox-inner iframe { width: 100%; height: 100%; border: none; display: block; }
    .sb-lightbox-close {
      position: absolute; top: -14px; right: -14px;
      width: 36px; height: 36px; background: #fff; border-radius: 50%; border: none;
      font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,.4); z-index: 1; transition: background .2s;
    }
    .sb-lightbox-close:hover { background: #f0e8d0; }

    /* ── Video URL input overlay ── */
    .sb-url-panel {
      position: absolute; inset: 0; background: rgba(9,21,41,.95);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 14px; padding: 24px; border-radius: 10px;
    }
    .sb-url-panel p { color: rgba(255,255,255,.65); font-size: 13px; font-family: sans-serif; text-align: center; }
    .sb-url-panel label { color: #E8C97A; font-size: 12px; font-family: sans-serif; letter-spacing: 1px; text-transform: uppercase; }
    .sb-url-row { display: flex; gap: 8px; width: 100%; max-width: 480px; }
    .sb-url-row input {
      flex: 1; border: 1px solid rgba(255,255,255,.2); border-radius: 6px;
      background: rgba(255,255,255,.08); color: #fff; padding: 9px 14px; font-size: 13px;
      font-family: sans-serif; outline: none;
    }
    .sb-url-row input::placeholder { color: rgba(255,255,255,.3); }
    .sb-url-row input:focus { border-color: #C9A84C; }
    .sb-url-row button {
      background: #C9A84C; border: none; color: #091529; padding: 9px 16px;
      border-radius: 6px; font-size: 13px; font-weight: 700; font-family: sans-serif; cursor: pointer;
    }
    .sb-url-row button:hover { background: #E8C97A; }
    .sb-url-skip {
      background: transparent; border: none; color: rgba(255,255,255,.4);
      font-size: 12px; font-family: sans-serif; cursor: pointer; text-decoration: underline;
    }

    /* ── Connect inline form ── */
    .sb-connect-panel {
      overflow: hidden; max-height: 0; transition: max-height .4s ease, opacity .3s;
      opacity: 0;
    }
    .sb-connect-panel.open { max-height: 700px; opacity: 1; }
    .sb-connect-panel-inner {
      border: 1px solid #EDE5D4; border-radius: 10px; padding: 20px; margin-top: 14px;
      background: #FDFAF5;
    }
    .sb-connect-panel h4 {
      font-size: 14px; font-family: sans-serif; font-weight: 700; margin-bottom: 14px;
      color: #0E1F3D;
    }
    .sb-form-row { margin-bottom: 12px; }
    .sb-form-row label {
      display: block; font-size: 11px; font-family: sans-serif; font-weight: 700;
      color: #9B9088; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 5px;
    }
    .sb-form-row input, .sb-form-row select, .sb-form-row textarea {
      width: 100%; border: 1px solid #EDE5D4; border-radius: 6px; padding: 9px 12px;
      font-size: 13px; font-family: sans-serif; color: #1A1208; background: #fff; outline: none;
      transition: border-color .2s;
    }
    .sb-form-row input:focus, .sb-form-row select:focus, .sb-form-row textarea:focus {
      border-color: #0E1F3D; box-shadow: 0 0 0 3px rgba(14,31,61,.07);
    }
    .sb-form-row textarea { min-height: 90px; resize: vertical; }
    .sb-form-submit {
      width: 100%; background: #C9A84C; border: none; color: #091529;
      padding: 12px; border-radius: 7px; font-size: 14px; font-weight: 800;
      font-family: sans-serif; cursor: pointer; transition: all .2s; margin-top: 4px;
    }
    .sb-form-submit:hover { background: #E8C97A; transform: translateY(-1px); }

    /* ── Form success state ── */
    .sb-success {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 10px; padding: 24px; text-align: center;
    }
    .sb-success-icon { font-size: 48px; animation: sb-pop .4s cubic-bezier(.175,.885,.32,1.275); }
    @keyframes sb-pop { from { transform: scale(0); } to { transform: scale(1); } }
    .sb-success h4 { font-size: 16px; color: #0E1F3D; font-family: sans-serif; }
    .sb-success p  { font-size: 13px; color: #6B6057; font-family: sans-serif; line-height: 1.6; }

    /* ── Sent messages inbox ── */
    .sb-inbox-toggle {
      font-size: 12px; font-family: sans-serif; color: #C9A84C; cursor: pointer;
      text-align: center; display: block; margin-top: 8px; text-decoration: underline;
    }
    .sb-inbox {
      background: #0E1F3D; border-radius: 8px; padding: 14px; margin-top: 10px;
      max-height: 200px; overflow-y: auto;
    }
    .sb-inbox-item {
      padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,.08);
      font-size: 12px; font-family: sans-serif; color: rgba(255,255,255,.7);
    }
    .sb-inbox-item:last-child { border-bottom: none; }
    .sb-inbox-item .sb-inbox-date { color: rgba(255,255,255,.3); font-size: 10px; margin-top: 3px; }
    .sb-inbox-empty { color: rgba(255,255,255,.35); font-size: 12px; text-align: center; font-family: sans-serif; }

    /* ── Filter active state ── */
    .product-card.sb-filtered { display: none !important; }
    .sb-no-results {
      grid-column: 1/-1; text-align: center; padding: 40px 20px;
      color: #6B6057; font-family: sans-serif; font-size: 14px;
    }

    /* ── Distillery card hover CTA ── */
    .distillery-card .sb-card-cta {
      display: block; margin-top: 8px;
      font-size: 12px; font-family: sans-serif; color: #C97B2A;
      font-weight: 600; text-decoration: none;
    }
    .distillery-card { cursor: pointer; text-decoration: none; }

    /* ── Page indicator ── */
    .sb-page-loading {
      position: fixed; top: 0; left: 0; right: 0; height: 3px; z-index: 9999;
      background: linear-gradient(90deg, #C9A84C, #E8C97A);
      transform: scaleX(0); transform-origin: left;
      transition: transform .4s ease; border-radius: 0 2px 2px 0;
    }
    .sb-page-loading.active { transform: scaleX(.7); }
    .sb-page-loading.done   { transform: scaleX(1); opacity: 0; transition: transform .2s, opacity .3s .1s; }
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = STYLES;
  document.head.appendChild(styleEl);

  /* ══════════════════════════════════════════════════════
     2. UTILITIES
  ══════════════════════════════════════════════════════ */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const isIndex = () => location.pathname.endsWith('index.html') || location.pathname.endsWith('/') || location.pathname === '';
  const isDistillery = () => location.pathname.includes('distillery.html');

  function parsePrice(el) {
    if (!el) return 0;
    return parseInt((el.textContent || '').replace(/[^0-9]/g, ''), 10) || 0;
  }

  function formatYen(n) { return '¥' + n.toLocaleString('ja-JP'); }

  function getMessages() {
    return JSON.parse(localStorage.getItem('sb_messages') || '[]');
  }
  function saveMessage(type, data) {
    const list = getMessages();
    list.unshift({ type, data, ts: Date.now() });
    localStorage.setItem('sb_messages', JSON.stringify(list.slice(0, 50)));
  }
  function fmtDate(ts) {
    return new Date(ts).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  /* ══════════════════════════════════════════════════════
     3. PAGE TRANSITION + PROGRESS BAR
  ══════════════════════════════════════════════════════ */
  const loader = document.createElement('div');
  loader.className = 'sb-page-loading';
  document.body.prepend(loader);

  function pageIn() {
    loader.classList.add('active');
    requestAnimationFrame(() => {
      document.body.classList.add('sb-ready');
      setTimeout(() => { loader.classList.add('done'); }, 300);
    });
  }
  function pageOut(cb) {
    loader.classList.remove('done');
    loader.classList.add('active');
    document.body.classList.add('sb-leaving');
    setTimeout(cb, 220);
  }

  function navigateTo(url) {
    pageOut(() => { window.location.href = url; });
  }

  window.addEventListener('DOMContentLoaded', pageIn);

  /* ══════════════════════════════════════════════════════
     4. NAVIGATION — distillery cards → detail page
  ══════════════════════════════════════════════════════ */
  function initNavigation() {
    // Distillery cards in index.html
    $$('.distillery-card').forEach((card, i) => {
      card.setAttribute('role', 'link');
      card.setAttribute('tabindex', '0');
      card.addEventListener('click', (e) => {
        if (e.target.closest('.follow-btn')) return; // don't navigate on follow
        navigateTo('distillery.html');
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') navigateTo('distillery.html');
      });
    });

    // Logo in index.html → top
    $$('.logo[href="index.html"], .nav-logo[href="index.html"]').forEach(el => {
      el.addEventListener('click', e => {
        if (isIndex()) return;
        e.preventDefault();
        navigateTo('index.html');
      });
    });
  }

  /* ══════════════════════════════════════════════════════
     5. BACK BUTTON (distillery page)
  ══════════════════════════════════════════════════════ */
  function initBackButton() {
    if (!isDistillery()) return;
    const nav = $('.global-nav');
    if (!nav) return;
    const backBtn = document.createElement('a');
    backBtn.className = 'sb-back-btn';
    backBtn.innerHTML = '← 蒸留所一覧に戻る';
    backBtn.href = 'index.html';
    backBtn.addEventListener('click', e => {
      e.preventDefault();
      navigateTo('index.html');
    });
    // Insert before breadcrumb
    const crumb = nav.querySelector('.breadcrumb') || nav.querySelector('.nav-divider');
    if (crumb) nav.insertBefore(backBtn, crumb);
    else nav.appendChild(backBtn);
  }

  /* ══════════════════════════════════════════════════════
     6. FORM HANDLING — localStorage save + success UI
  ══════════════════════════════════════════════════════ */
  function initForms() {
    // Override the existing submitForm on distillery.html
    if (!isDistillery()) return;

    window.submitForm = function (id) {
      const modal = document.getElementById('modal-' + id);
      if (!modal) return;

      // Collect form data
      const data = {};
      modal.querySelectorAll('input, select, textarea').forEach(el => {
        if (el.name || el.placeholder || el.tagName === 'SELECT') {
          data[el.placeholder || el.tagName + '_' + el.type] = el.value;
        }
      });
      // Selected request tags
      const tags = [...modal.querySelectorAll('.request-tag.selected')].map(t => t.textContent.trim());
      if (tags.length) data.tags = tags;
      data.distillery = '余市クラフト蒸留所';

      saveMessage(id, data);

      // Show success inside modal body
      const body = modal.querySelector('.modal-body');
      const footer = modal.querySelector('.modal-footer');
      const successMessages = {
        connect: { icon: '🤝', title: 'つながり申請を送りました！', body: '余市クラフト蒸留所から 48時間以内に返信が届きます。\nマイページ → 受信箱でご確認いただけます。' },
        message: { icon: '✉️', title: 'メッセージを送りました', body: '職人に直接届きます。通常 1〜2 営業日以内に返信があります。' },
        request: { icon: '📋', title: 'リストに追加しました', body: '新商品・在庫復活時にメールで通知します。' },
      };
      const m = successMessages[id] || { icon: '✅', title: '送信しました', body: '' };
      if (body) {
        body.innerHTML = `<div class="sb-success">
          <div class="sb-success-icon">${m.icon}</div>
          <h4>${m.title}</h4>
          <p>${m.body}</p>
        </div>`;
      }
      if (footer) footer.style.display = 'none';

      setTimeout(() => {
        if (window.closeModal) closeModal(id);
        if (footer) footer.style.display = '';
        setTimeout(() => showToast(m.icon, m.title), 100);
      }, 1800);
    };

    // Show saved messages link in sidebar
    const sideCtas = $('.connect-cta');
    if (sideCtas) {
      const msgs = getMessages();
      if (msgs.length > 0) {
        const toggle = document.createElement('span');
        toggle.className = 'sb-inbox-toggle';
        toggle.textContent = `📨 送信済みメッセージ (${msgs.length}件)`;
        let inboxOpen = false;
        const inbox = document.createElement('div');
        inbox.className = 'sb-inbox';
        inbox.style.display = 'none';
        msgs.forEach(m => {
          const item = document.createElement('div');
          item.className = 'sb-inbox-item';
          const typeLabel = { connect: 'つながり申請', message: 'メッセージ', request: 'リストに追加' }[m.type] || m.type;
          item.innerHTML = `<strong>${typeLabel}</strong> — ${m.data.distillery || ''}
            <div class="sb-inbox-date">${fmtDate(m.ts)}</div>`;
          inbox.appendChild(item);
        });
        toggle.addEventListener('click', () => {
          inboxOpen = !inboxOpen;
          inbox.style.display = inboxOpen ? 'block' : 'none';
        });
        sideCtas.parentNode.appendChild(toggle);
        sideCtas.parentNode.appendChild(inbox);
      }
    }
  }

  /* ══════════════════════════════════════════════════════
     7. PRICE RANGE SLIDER (index.html sidebar)
  ══════════════════════════════════════════════════════ */
  function initPriceSlider() {
    const block = document.querySelector('.sidebar-block');
    if (!block) return;
    // Find the price range block
    const priceBlock = $$('.sidebar-block').find(b => b.querySelector('h3')?.textContent.includes('価格帯'));
    if (!priceBlock) return;

    const MIN = 0, MAX = 30000, STEP = 500;
    let lo = MIN, hi = MAX;

    priceBlock.innerHTML = `
      <h3>💰 価格帯（1本）</h3>
      <div class="sb-slider-wrap">
        <div class="sb-slider-track" id="sbTrack">
          <div class="sb-slider-fill" id="sbFill"></div>
          <input class="sb-slider-input" id="sbLo" type="range" min="${MIN}" max="${MAX}" step="${STEP}" value="${lo}">
          <input class="sb-slider-input" id="sbHi" type="range" min="${MIN}" max="${MAX}" step="${STEP}" value="${hi}">
        </div>
        <div class="sb-slider-labels">
          <span id="sbLoLabel">${formatYen(lo)}</span>
          <span id="sbHiLabel">${formatYen(hi)}</span>
        </div>
      </div>
    `;

    const loEl = document.getElementById('sbLo');
    const hiEl = document.getElementById('sbHi');
    const loLabel = document.getElementById('sbLoLabel');
    const hiLabel = document.getElementById('sbHiLabel');
    const fill = document.getElementById('sbFill');

    function updateSlider() {
      lo = parseInt(loEl.value, 10);
      hi = parseInt(hiEl.value, 10);
      if (lo > hi) { [lo, hi] = [hi, lo]; loEl.value = lo; hiEl.value = hi; }
      const pct = v => ((v - MIN) / (MAX - MIN)) * 100;
      fill.style.left = pct(lo) + '%';
      fill.style.width = (pct(hi) - pct(lo)) + '%';
      loLabel.textContent = formatYen(lo);
      hiLabel.textContent = hi >= MAX ? '上限なし' : formatYen(hi);
      filterByPrice(lo, hi >= MAX ? Infinity : hi);
    }
    loEl.addEventListener('input', updateSlider);
    hiEl.addEventListener('input', updateSlider);
    updateSlider();
  }

  function filterByPrice(lo, hi) {
    let any = false;
    $$('.product-card').forEach(card => {
      const priceEl = card.querySelector('.price-main');
      const price = parsePrice(priceEl);
      const hidden = price < lo || price > hi;
      card.classList.toggle('sb-filtered', hidden);
      if (!hidden) any = true;
    });
    let noRes = document.getElementById('sb-no-results');
    if (!any) {
      if (!noRes) {
        noRes = document.createElement('div');
        noRes.id = 'sb-no-results';
        noRes.className = 'sb-no-results';
        noRes.textContent = '該当する商品が見つかりません';
        document.querySelector('.product-grid')?.appendChild(noRes);
      }
    } else {
      noRes?.remove();
    }
  }

  /* ══════════════════════════════════════════════════════
     8. VIDEO LIGHTBOX (distillery.html)
  ══════════════════════════════════════════════════════ */
  // Video URL storage key
  const VID_KEY = 'sb_video_urls';
  function getVideoUrls() { return JSON.parse(localStorage.getItem(VID_KEY) || '{}'); }
  function saveVideoUrl(idx, url) {
    const urls = getVideoUrls(); urls[idx] = url;
    localStorage.setItem(VID_KEY, JSON.stringify(urls));
  }

  function parseVideoEmbed(url) {
    if (!url) return null;
    // YouTube
    let m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
    if (m) return `https://www.youtube.com/embed/${m[1]}?autoplay=1&rel=0`;
    // Vimeo
    m = url.match(/vimeo\.com\/(\d+)/);
    if (m) return `https://player.vimeo.com/video/${m[1]}?autoplay=1`;
    return null;
  }

  function initVideoLightbox() {
    if (!isDistillery()) return;

    // Build lightbox DOM
    const lb = document.createElement('div');
    lb.className = 'sb-lightbox';
    lb.id = 'sbLightbox';
    lb.innerHTML = `
      <div class="sb-lightbox-inner" id="sbLbInner">
        <button class="sb-lightbox-close" id="sbLbClose">✕</button>
      </div>`;
    document.body.appendChild(lb);

    document.getElementById('sbLbClose').addEventListener('click', closeLightbox);
    lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

    function closeLightbox() {
      lb.classList.remove('open');
      const inner = document.getElementById('sbLbInner');
      // remove iframe to stop video
      const frame = inner.querySelector('iframe');
      if (frame) frame.remove();
    }

    function openLightbox(embedUrl) {
      const inner = document.getElementById('sbLbInner');
      inner.querySelectorAll('iframe, .sb-url-panel').forEach(el => el.remove());
      const iframe = document.createElement('iframe');
      iframe.src = embedUrl;
      iframe.allow = 'autoplay; fullscreen; picture-in-picture';
      iframe.allowFullscreen = true;
      inner.appendChild(iframe);
      lb.classList.add('open');
    }

    function showUrlPanel(videoIdx) {
      const inner = document.getElementById('sbLbInner');
      inner.querySelectorAll('iframe, .sb-url-panel').forEach(el => el.remove());
      const saved = getVideoUrls()[videoIdx] || '';
      const panel = document.createElement('div');
      panel.className = 'sb-url-panel';
      panel.innerHTML = `
        <label>YouTube / Vimeo URL を入力して再生</label>
        <p>例: https://www.youtube.com/watch?v=xxxxx</p>
        <div class="sb-url-row">
          <input type="url" id="sbUrlIn" placeholder="https://www.youtube.com/watch?v=..." value="${saved}">
          <button id="sbUrlPlay">▶ 再生</button>
        </div>
        <button class="sb-url-skip" id="sbUrlSkip">スキップして閉じる</button>`;
      inner.appendChild(panel);
      lb.classList.add('open');
      document.getElementById('sbUrlSkip').addEventListener('click', closeLightbox);
      document.getElementById('sbUrlPlay').addEventListener('click', () => {
        const url = document.getElementById('sbUrlIn').value.trim();
        const embed = parseVideoEmbed(url);
        if (embed) { saveVideoUrl(videoIdx, url); openLightbox(embed); }
        else { document.getElementById('sbUrlIn').style.borderColor = '#B03A2E'; }
      });
    }

    // Wire up play button on main video frame
    const videoFrame = document.getElementById('videoFrame');
    if (videoFrame) {
      videoFrame.style.cursor = 'pointer';
      videoFrame.addEventListener('click', () => {
        const activeItem = document.querySelector('.playlist-item.active');
        const idx = activeItem ? [...document.querySelectorAll('.playlist-item')].indexOf(activeItem) : 0;
        const saved = getVideoUrls()[idx];
        const embed = saved ? parseVideoEmbed(saved) : null;
        if (embed) openLightbox(embed);
        else showUrlPanel(idx);
      });
    }

    // Wire playlist items
    $$('.playlist-item').forEach((item, idx) => {
      item.addEventListener('click', () => {
        // activate
        $$('.playlist-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        // update main frame title/sub
        if (window.videoData && window.videoData[idx]) {
          const t = document.getElementById('videoTitle');
          const s = document.getElementById('videoSub');
          if (t) t.textContent = window.videoData[idx].title;
          if (s) s.textContent = window.videoData[idx].sub;
        }
      });
    });
  }

  /* ══════════════════════════════════════════════════════
     9. CONNECT INLINE FORM (distillery.html sidebar)
  ══════════════════════════════════════════════════════ */
  function initConnectForm() {
    if (!isDistillery()) return;
    const ctaMain = document.querySelector('.cta-main');
    if (!ctaMain) return;

    // Build inline panel
    const panel = document.createElement('div');
    panel.className = 'sb-connect-panel';
    panel.innerHTML = `
      <div class="sb-connect-panel-inner">
        <h4>🤝 つながり申請フォーム</h4>
        <div class="sb-form-row">
          <label>申請の目的</label>
          <select name="purpose">
            <option>定期仕入れ・卸取引</option>
            <option>スポット購入（単発）</option>
            <option>メニュー開発・コラボ</option>
            <option>試飲サンプル請求</option>
            <option>蒸留所見学・取材</option>
          </select>
        </div>
        <div class="sb-form-row">
          <label>バー・店舗名</label>
          <input type="text" name="bar_name" placeholder="例：Bar NORTH 渋谷店">
        </div>
        <div class="sb-form-row">
          <label>月間発注見込み（本数）</label>
          <select name="volume">
            <option>6〜12本</option>
            <option>13〜24本</option>
            <option>25〜50本</option>
            <option>50本以上</option>
          </select>
        </div>
        <div class="sb-form-row">
          <label>自己紹介・メッセージ</label>
          <textarea name="message" placeholder="あなたのバーのコンセプトや、この蒸留所への思いを書いてください..."></textarea>
        </div>
        <button class="sb-form-submit" id="sbConnectSubmit">申請を送る →</button>
      </div>`;
    ctaMain.parentNode.insertBefore(panel, ctaMain.nextSibling);

    // Toggle
    ctaMain.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.classList.toggle('open');
      ctaMain.textContent = panel.classList.contains('open')
        ? '✕ フォームを閉じる'
        : '🤝 つながりを申請する';
    });

    // Submit
    document.getElementById('sbConnectSubmit').addEventListener('click', () => {
      const data = {};
      panel.querySelectorAll('input, select, textarea').forEach(el => {
        data[el.name] = el.value;
      });
      data.distillery = '余市クラフト蒸留所';
      if (!data.bar_name?.trim()) {
        panel.querySelector('[name="bar_name"]').focus();
        panel.querySelector('[name="bar_name"]').style.borderColor = '#B03A2E';
        return;
      }
      saveMessage('connect', data);

      panel.querySelector('.sb-connect-panel-inner').innerHTML = `
        <div class="sb-success">
          <div class="sb-success-icon">🤝</div>
          <h4>申請を送りました！</h4>
          <p>余市クラフト蒸留所から 48時間以内に返信が届きます。</p>
        </div>`;
      ctaMain.textContent = '✅ 申請済み';
      ctaMain.style.background = '#1E6B45';
      ctaMain.disabled = true;
      showToast('🤝', 'つながり申請を送りました！');
    });
  }

  /* ══════════════════════════════════════════════════════
     10. FOLLOW BUTTON (index.html)
  ══════════════════════════════════════════════════════ */
  function initFollowButtons() {
    $$('.follow-btn').forEach(btn => {
      const key = 'sb_follow_' + btn.closest('.distillery-card')?.querySelector('.distillery-name')?.textContent;
      if (localStorage.getItem(key) === '1') {
        btn.textContent = 'フォロー中';
        btn.style.background = 'var(--amber, #C97B2A)';
        btn.style.color = '#fff';
      }
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const following = btn.textContent === 'フォロー中';
        if (!following) {
          btn.textContent = 'フォロー中';
          btn.style.background = 'var(--amber, #C97B2A)';
          btn.style.color = '#fff';
          localStorage.setItem(key, '1');
          showToast('⭐', 'フォローしました！新着情報をお知らせします');
        } else {
          btn.textContent = 'フォロー';
          btn.style.background = '';
          btn.style.color = '';
          localStorage.removeItem(key);
        }
      });
    });
  }

  /* ══════════════════════════════════════════════════════
     11. TOAST (shared)
  ══════════════════════════════════════════════════════ */
  // Override/inject showToast globally for both pages
  window.showToast = function (icon, msg) {
    let toast = document.getElementById('sb-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'sb-toast';
      toast.className = 'toast';
      toast.innerHTML = '<span class="toast-icon" id="sb-toast-icon"></span><span id="sb-toast-msg"></span>';
      document.body.appendChild(toast);
      const toastStyle = document.createElement('style');
      toastStyle.textContent = `
        #sb-toast {
          position:fixed;bottom:24px;right:24px;
          background:#1A1208;color:#fff;padding:12px 18px;
          border-radius:10px;font-size:14px;font-family:sans-serif;
          box-shadow:0 8px 24px rgba(0,0,0,.3);
          display:flex;align-items:center;gap:10px;z-index:8000;
          transform:translateY(80px);transition:transform .4s cubic-bezier(.175,.885,.32,1.275);
        }
        #sb-toast.show{transform:translateY(0);}
      `;
      document.head.appendChild(toastStyle);
    }
    document.getElementById('sb-toast-icon').textContent = icon;
    document.getElementById('sb-toast-msg').textContent = msg;
    clearTimeout(toast._t);
    toast.classList.add('show');
    toast._t = setTimeout(() => toast.classList.remove('show'), 3200);
  };

  /* ══════════════════════════════════════════════════════
     12. CART MANAGEMENT (shared)
  ══════════════════════════════════════════════════════ */
  function initCart() {
    const CART_KEY = 'sb_cart_count';
    let count = parseInt(localStorage.getItem(CART_KEY) || '3', 10);

    function updateCartBadge(n) {
      count = n;
      localStorage.setItem(CART_KEY, n);
      $$('.cart-count, .nav-pill').forEach(el => {
        if (el.textContent.includes('カート')) el.textContent = `🛒 カート (${n})`;
      });
      const badge = document.querySelector('.cart-count');
      if (badge) {
        badge.textContent = n;
        badge.style.transform = 'scale(1.4)';
        setTimeout(() => badge.style.transform = '', 300);
      }
    }
    updateCartBadge(count);

    // Override addToCart for both pages
    window.addToCart = function (btn) {
      const orig = btn.textContent;
      btn.textContent = '✓ 追加済';
      btn.style.background = '#1E6B45';
      btn.disabled = true;
      updateCartBadge(count + 1);
      showToast('🛒', 'カートに追加しました');
      setTimeout(() => { btn.textContent = orig; btn.style.background = ''; btn.disabled = false; }, 2500);
    };
  }

  /* ══════════════════════════════════════════════════════
     13. PRODUCT FILTER ENHANCEMENTS (distillery.html)
  ══════════════════════════════════════════════════════ */
  function initDistilleryFilter() {
    if (!isDistillery()) return;
    // The existing filterProducts() is already in the inline script.
    // Just ensure tab clicks work even if the inline override fires first.
    $$('.product-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        // Slight delay so existing inline handler fires first
        setTimeout(() => {
          $$('.product-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
        }, 10);
      });
    });
  }

  /* ══════════════════════════════════════════════════════
     13b. INDEX PAGE — wire add-to-cart + distillery card hints
  ══════════════════════════════════════════════════════ */
  function initIndexPage() {
    if (!isIndex()) return;

    // Wire "カートに追加" buttons
    $$('.add-to-cart').forEach(btn => {
      btn.addEventListener('click', () => window.addToCart(btn));
    });

    // Add "詳細を見る →" hint to distillery cards
    $$('.distillery-card').forEach(card => {
      const body = card.querySelector('.distillery-body');
      if (body && !body.querySelector('.sb-card-cta')) {
        const cta = document.createElement('span');
        cta.className = 'sb-card-cta';
        cta.textContent = '詳細ページを見る →';
        body.appendChild(cta);
      }
    });
  }

  /* ══════════════════════════════════════════════════════
     14. BOOTSTRAP
  ══════════════════════════════════════════════════════ */
  window.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initBackButton();
    initForms();
    initPriceSlider();
    initVideoLightbox();
    initConnectForm();
    initFollowButtons();
    initCart();
    initDistilleryFilter();
    initIndexPage();
  });

})();
