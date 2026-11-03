/* 네비01 v1.0
 * 대상: search.shopping.naver.com
 * 실제 네이버 DOM·광고 판별·화면 배치는 검증 필요.
 * DOM 순위와 카운트는 현재 문서에서 탐지한 상품 기준.
 */
(() => {
  'use strict';

  if (location.hostname !== 'search.shopping.naver.com') {
    alert('네이버 쇼핑 검색결과에서 실행하세요.');
    return;
  }

  const KEY = '__NEVI01_V1__';
  const old = window[KEY];
  old?.dispose?.();

  const abort = new AbortController();
  const state = { dispose, done: null };
  window[KEY] = state;

  const CARD = [
    '[class*="product_item_"]',
    '[class*="basicList_item_"]',
    '[class*="adProduct_item_"]',
    '[class*="productCard_item_"]',
    '[data-shp-contents-type="product"]'
  ].join(',');

  const TITLE = [
    '[class*="product_title"]',
    '[class*="basicList_title"]',
    '[class*="adProduct_title"]',
    '[class*="productCard_title"]'
  ].join(',');

  const LINK = [
    'a[href*="/catalog/"]',
    'a[href*="/products/"]',
    'a[href*="cr.shopping.naver.com"]',
    'a[href*="adcr.naver.com"]'
  ].join(',');

  const route = location.href;
  let dead = false, loading = false, stopped = false, cols = 6;
  let origin, popup, previousFocus, observer, resizeTimer, routeTimer;
  let records = [], groups = [], marks = [], undo = [];
  let removePopupKey = () => {};
  let reason = '준비';

  const host = document.createElement('div');
  const ui = host.attachShadow({ mode: 'open' });

  ui.innerHTML = `
    <style>
      :host{all:initial;font:14px/1.5 system-ui;color:#edf5ff}
      *{box-sizing:border-box}
      button{font:inherit;color:inherit;background:#24364b;border:1px solid #71859f;
        border-radius:6px;padding:6px 9px;cursor:pointer}
      button:disabled{opacity:.5;cursor:default}
      button:focus-visible{outline:3px solid #40eaff}
      button[aria-pressed=true]{background:#09617a}
      #bar{position:fixed;right:12px;bottom:12px;z-index:2147483646;
        max-width:calc(100vw - 24px);background:#101d2ff5;padding:12px;
        border:1px solid #40d9ff;border-radius:10px;box-shadow:0 0 15px #19baff66}
      #status{max-width:480px;overflow-wrap:anywhere}
      #buttons{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
      .veil{position:fixed;inset:0;z-index:2147483647;background:#0009;
        display:flex;align-items:center;justify-content:center}
      .panel{width:440px;max-width:calc(100vw - 32px);max-height:85vh;overflow:auto;
        background:#101d2f;padding:24px;border:1px solid #40d9ff;border-radius:12px;
        box-shadow:0 0 24px #19baff66;overflow-wrap:anywhere}
      h2{font-size:20px;margin:0 0 12px}p{white-space:pre-line}small{color:#bcd0e5}
    </style>
    <div id="bar">
      <b>네비01 v1.0</b>
      <div id="status" role="status" aria-live="polite"></div>
      <div id="buttons"></div>
    </div>`;

  const $ = s => ui.querySelector(s);
  const status = text => { $('#status').textContent = text; };

  function button(text, fn) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = text;
    b.addEventListener('click', fn, { signal: abort.signal });
    $('#buttons').append(b);
    return b;
  }

  const columns = [6, 8, 4].map(n =>
    button(`${n}열`, () => { cols = n; layout(); })
  );
  const stopButton = button('로딩 중단', () => {
    stopped = true;
    status('중단 요청 중…');
  });
  const summaryButton = button('분석 보기', summary);
  const scanButton = button('다시 분석', () => {
    if (!loading) finishAnalysis();
  });
  button('원상복구 / 종료', dispose);

  function style(el, values) {
    const saved = Object.keys(values).map(k => [
      k, el.style.getPropertyValue(k), el.style.getPropertyPriority(k)
    ]);
    undo.push(() => saved.forEach(([k, v, p]) =>
      v ? el.style.setProperty(k, v, p) : el.style.removeProperty(k)
    ));
    Object.entries(values).forEach(([k, v]) =>
      el.style.setProperty(k, String(v), 'important')
    );
  }

  function clearAnalysis() {
    observer?.disconnect();
    observer = null;
    marks.splice(0).forEach(el => el.remove());
    undo.splice(0).reverse().forEach(fn => fn());
    records = [];
    groups = [];
  }

  function closePopup() {
    removePopupKey();
    removePopupKey = () => {};
    popup?.remove();
    popup = null;
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    previousFocus = null;
  }

  function restoreScroll() {
    if (origin) {
      scrollTo({ left: origin.x, top: origin.y, behavior: 'instant' });
    }
  }

  function dispose() {
    if (dead) return;
    dead = true;
    stopped = true;
    abort.abort();
    clearInterval(routeTimer);
    clearTimeout(resizeTimer);
    closePopup();
    clearAnalysis();
    host.remove();
    if (loading) restoreScroll();
    if (window[KEY] === state) delete window[KEY];
  }

  function findCards() {
    const found = [...document.querySelectorAll(CARD)];
    document.querySelectorAll(TITLE).forEach(title => {
      const card = title.closest(CARD) || title.closest('li');
      if (card) found.push(card);
    });
    const valid = [...new Set(found)].filter(el => {
      const r = el.getBoundingClientRect();
      return r.width > 40 && r.height > 40 &&
        getComputedStyle(el).visibility !== 'hidden' &&
        el.querySelector('img') && el.querySelector(`${TITLE},${LINK}`);
    });
    return valid
      .filter(el => !valid.some(other => other !== el && el.contains(other)))
      .sort((a, b) =>
        a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
      );
  }

  function badge(text, orange = false) {
    const el = document.createElement('span');
    el.textContent = text;
    el.style.cssText = `
      display:inline-block!important;background:#07111e!important;
      color:${orange ? '#ffad45' : '#7eeaff'}!important;
      border:1px solid currentColor!important;border-radius:5px!important;
      box-shadow:0 0 8px ${orange ? '#ff8a00' : '#00c8ff'}!important;
      font:bold 12px/1.5 system-ui!important;padding:2px 5px!important;
      margin:2px!important;white-space:nowrap!important;pointer-events:none!important`;
    marks.push(el);
    return el;
  }

  function pin(el, top) {
    Object.entries({
      position: 'absolute', top: `${top}px`, left: '5px', 'z-index': '100'
    }).forEach(([k, v]) => el.style.setProperty(k, v, 'important'));
  }

  function analyze() {
    clearAnalysis();

    records = findCards().map((card, i) => {
      const label = [...card.querySelectorAll('span,em,i,b,button,a')].find(el =>
        /^(광고|AD|쇼핑광고)$/i.test((el.textContent || '').trim()) &&
        !el.closest(TITLE) && !el.children.length &&
        el.getBoundingClientRect().width > 0
      );
      const r = card.getBoundingClientRect();
      return {
        card, label, rank: i + 1, width: r.width, height: r.height, scaled: false,
        visby: /비스비|\bVISBYH\b/i.test(card.textContent || ''),
        ad: Boolean(label) ||
          /(?:^|\s)adProduct_/.test(card.className || '') ||
          Boolean(card.querySelector('a[href*="adcr.naver.com"]')) ||
          card.getAttribute('data-ad') === 'true'
      };
    });

    const parents = new Map();
    records.forEach(r => {
      const p = r.card.parentElement;
      if (!parents.has(p)) parents.set(p, []);
      parents.get(p).push(r);
    });

    for (const [parent, items] of parents) {
      const cards = new Set(items.map(r => r.card));
      const children = [...parent.children].filter(el =>
        !['SCRIPT', 'STYLE', 'TEMPLATE'].includes(el.tagName) &&
        getComputedStyle(el).display !== 'none'
      );

      // 세로형 상품만 있는 일반 목록에 한해 원본 비율로 축소합니다.
      const safe = children.every(el => cards.has(el)) && items.every(r => {
        const s = getComputedStyle(r.card);
        return r.height >= r.width * 1.05 &&
          !['absolute', 'fixed'].includes(s.position) &&
          s.transform === 'none' &&
          Math.abs(parseFloat(s.zoom || '1') - 1) < .01;
      });

      if (!safe || getComputedStyle(parent).transform !== 'none') continue;

      style(parent, {
        display: 'grid',
        'grid-template-columns': `repeat(${cols},minmax(0,1fr))`,
        gap: '14px', 'align-items': 'start', 'justify-items': 'start'
      });
      items.forEach(r => {
        style(r.card, {
          width: `${r.width}px`, height: `${r.height}px`,
          'box-sizing': 'border-box', 'min-width': '0', 'max-width': 'none',
          margin: '0', zoom: '1', 'grid-column': 'auto', 'grid-row': 'auto',
          'align-self': 'start'
        });
        r.scaled = true;
      });
      groups.push({ parent, items });
    }

    records.forEach(r => {
      if (getComputedStyle(r.card).position === 'static') {
        style(r.card, { position: 'relative' });
      }
      if (r.visby) {
        style(r.card, {
          outline: '3px solid #38ffcf', 'outline-offset': '-3px',
          'box-shadow': '0 0 15px #00ffc999'
        });
      }
      const rank = badge(`DOM ${r.rank}`);
      pin(rank, 5);
      r.card.append(rank);

      if (r.ad) {
        const ad = badge('광고', true);
        if (r.label) r.label.after(ad);
        else { pin(ad, 31); r.card.append(ad); }
      }
    });

    layout();
    if (typeof ResizeObserver === 'function') {
      observer = new ResizeObserver(scheduleLayout);
      groups.forEach(g => observer.observe(g.parent));
    }
    status(`${reason} · 탐지 ${records.length}개 · 배치 ${records.filter(r => r.scaled).length}개`);
  }

  function layout() {
    if (dead) return;
    columns.forEach((b, i) =>
      b.setAttribute('aria-pressed', String([6, 8, 4][i] === cols))
    );
    groups.forEach(({ parent, items }) => {
      const s = getComputedStyle(parent);
      const width = parent.clientWidth -
        parseFloat(s.paddingLeft || 0) - parseFloat(s.paddingRight || 0);
      if (width <= 0) return;
      parent.style.setProperty(
        'grid-template-columns', `repeat(${cols},minmax(0,1fr))`, 'important'
      );
      const cell = Math.max(1, (width - 14 * (cols - 1)) / cols);
      items.forEach(r =>
        r.card.style.setProperty('zoom', String(Math.min(1, cell / r.width)), 'important')
      );
    });
  }

  function scheduleLayout() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layout, 100);
  }

  function summary(message) {
    if (dead || loading) return;
    closePopup();
    previousFocus = ui.activeElement || document.activeElement;

    const query = new URL(location.href).searchParams;
    const keyword = query.get('query') || query.get('origQuery') ||
      document.querySelector('input[name="query"]')?.value || '(확인 필요)';
    const count = key => records.filter(r => r[key]).length;

    popup = document.createElement('div');
    popup.className = 'veil';
    const panel = document.createElement('div');
    panel.className = 'panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-labelledby', 'nevi01-heading');

    const title = document.createElement('h2');
    title.id = 'nevi01-heading';
    title.textContent = '네비01 v1.0 분석';
    const text = document.createElement('p');
    text.textContent = message || [
      `검색어: ${keyword}`,
      `종료 사유: ${reason}`,
      `탐지 상품: ${records.length}개`,
      `비스비 / VISBYH: ${count('visby')}개`,
      `광고 추정: ${count('ad')}개`,
      `세로형 배치: ${count('scaled')}개 / ${cols}열`,
      `원본 배치 유지: ${records.length - count('scaled')}개`
    ].join('\n');

    const note = document.createElement('small');
    note.textContent =
      '현재 DOM 기준의 부분 집계입니다. DOM 순위는 광고 포함 문서 순서이며 공식 순위가 아닙니다. ' +
      '가로형·혼합·가상 목록은 원본 배치를 유지합니다. ' +
      '실제 카드 구조·광고 판별·화면 배치는 검증 필요. 추가 로딩 후에는 다시 분석을 누르세요.';

    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = '확인 (Enter / Esc)';
    close.addEventListener('click', closePopup, { once: true });

    panel.append(title, text, note, document.createElement('br'), close);
    popup.append(panel);
    ui.append(popup);
    popup.addEventListener('click', e => {
      if (e.target === popup) closePopup();
    });

    const onKey = e => {
      if (e.isComposing) return;
      if (e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        closePopup();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        close.focus();
      }
    };
    document.addEventListener('keydown', onKey, true);
    removePopupKey = () => document.removeEventListener('keydown', onKey, true);
    close.focus({ preventScroll: true });
  }

  function finishAnalysis() {
    if (dead) return;
    try {
      analyze();
      summary();
    } catch (e) {
      clearAnalysis();
      reason = '분석 오류';
      status(`${reason}: ${e.message}`);
      summary(`분석 오류로 카드 변경을 복구했습니다.\n${e.message}`);
      console.warn('[네비01]', e);
    }
  }

  function wait(ms) {
    return new Promise(resolve => {
      const finish = () => {
        clearTimeout(id);
        abort.signal.removeEventListener('abort', finish);
        resolve();
      };
      const id = setTimeout(finish, ms);
      abort.signal.addEventListener('abort', finish, { once: true });
      if (abort.signal.aborted) finish();
    });
  }

  async function run() {
    await old?.done;
    if (dead) return;

    document.documentElement.append(host);
    origin = { x: scrollX, y: scrollY };
    loading = true;
    summaryButton.disabled = scanButton.disabled = true;

    const start = performance.now();
    let stable = 0, last = '', step = 0;
    reason = '로딩 중';

    try {
      for (; step < 100; step++) {
        if (dead) return;
        if (stopped) { reason = '사용자 중단'; break; }
        if (location.href !== route) { dispose(); return; }

        const remaining = 60000 - (performance.now() - start);
        if (remaining <= 0) { reason = '60초 시간 제한'; break; }

        const root = document.scrollingElement || document.documentElement;
        scrollTo({
          left: origin.x,
          top: Math.min(scrollY + Math.max(400, innerHeight * .85), root.scrollHeight),
          behavior: 'instant'
        });
        await wait(Math.min(850, remaining));

        if (dead) return;
        if (stopped) { reason = '사용자 중단'; break; }
        if (location.href !== route) { dispose(); return; }

        const cards = findCards();
        const tail = cards.slice(-3).map(card =>
          card.querySelector(LINK)?.getAttribute('href') ||
          card.textContent?.slice(0, 100) || ''
        ).join('|');
        const signature = `${root.scrollHeight}:${cards.length}:${tail}`;
        const bottom = scrollY + innerHeight >= root.scrollHeight - 8;

        stable = bottom && signature === last ? stable + 1 : 0;
        last = signature;
        status(`자동 로딩 ${step + 1}/100 · 탐지 ${cards.length}개 · 중단 가능`);

        if (stable >= 5) {
          reason = '하단 변화 없음 (로딩 종료 추정)';
          break;
        }
      }
      if (step >= 100) reason = '최대 스크롤 횟수 도달';
      else if (performance.now() - start >= 60000 && !stopped) {
        reason = '60초 시간 제한';
      }
    } catch (e) {
      reason = `로딩 오류: ${e.message}`;
      console.warn('[네비01]', e);
    } finally {
      if (!dead) restoreScroll();
      loading = false;
    }

    if (dead) return;
    if (location.href !== route) { dispose(); return; }

    finishAnalysis();
    // 문서 높이가 줄어든 경우 브라우저가 가능한 좌표로 제한할 수 있습니다.
    restoreScroll();
    stopButton.disabled = true;
    summaryButton.disabled = scanButton.disabled = false;

    window.addEventListener('resize', scheduleLayout, { signal: abort.signal });
    routeTimer = setInterval(() => {
      if (location.href !== route) dispose();
    }, 800);
  }

  state.done = run().catch(e => {
    console.error('[네비01]', e);
    dispose();
  });
})();
