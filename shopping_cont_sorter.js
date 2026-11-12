(() => {
  'use strict';

  const PANEL_ID = 'bm-sort-panel';
  window.__SHOCO_SORTER__?.destroy();
  document.getElementById(PANEL_ID)?.remove();

  const PRODUCT_PATH = /^\/\d+\/affiliate\/products\/\d+\/?$/;
  const originalDisplay = new Map();
  const originalOrder = new WeakMap();
  let nextOrder = 0;
  let cards = [];
  let sort = null;
  let timer;
  let observer;
  const settings = { commission: 15, reviews: 51, enabled: true };

  const textOf = element => element.innerText || element.textContent || '';
  const number = value => Number(value.replace(/,/g, ''));
  const commissionOf = text => {
    const match = text.match(/수수료\s*([\d.]+)\s*%/);
    return match ? Number(match[1]) : null;
  };
  const reviewsOf = text => {
    const match = text.match(/(?:리뷰|후기)\s*(?:수\s*)?[:(]?\s*([\d,]+(?:\.\d+)?)\s*(만|천)?/);
    if (!match) return null;
    return Math.round(number(match[1]) * (match[2] === '만' ? 10000 : match[2] === '천' ? 1000 : 1));
  };
  const priceOf = text => {
    const matches = [...text.matchAll(/([\d,]+)\s*원/g)];
    return matches.length ? number(matches[matches.length - 1][1]) : null;
  };
  const discountOf = text => {
    const match = text.match(/할인(?:율)?\s*([\d.]+)\s*%/);
    return match ? Number(match[1]) : null;
  };
  const isProductLink = link => {
    try {
      const url = new URL(link.getAttribute('href'), location.href);
      return url.origin === location.origin && PRODUCT_PATH.test(url.pathname);
    } catch { return false; }
  };

  function collectCards() {
    const links = [...document.querySelectorAll('a[href]')].filter(isProductLink);
    const found = new Set();
    for (const link of links) {
      let card = link.closest('li');
      if (!card) {
        // Stop before a shared list wrapper; never move a page-level container.
        let candidate = link;
        while (candidate && candidate !== document.body) {
          const productLinks = [...candidate.querySelectorAll('a[href]')].filter(isProductLink);
          if (candidate !== link && productLinks.length > 1) break;
          if (/수수료/.test(textOf(candidate)) && candidate.querySelector('button,[role="button"]')) {
            card = candidate;
            break;
          }
          candidate = candidate.parentElement;
        }
      }
      if (card && /수수료/.test(textOf(card))) found.add(card);
    }
    // Fallback for cards without a product-detail anchor.
    if (!found.size) {
      for (const card of document.querySelectorAll('li')) {
        const text = textOf(card);
        if (!card.querySelector('li') && commissionOf(text) !== null &&
            card.querySelector('button,[role="button"]')) found.add(card);
      }
    }
    return [...found];
  }

  const panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-label', '쇼핑커넥트 상품 필터 및 정렬');
  panel.style.cssText = 'display:flex;align-items:center;flex-wrap:wrap;gap:8px;padding:10px;margin:8px 0;background:#fff8e8;border:1px solid #edc97b;border-radius:6px;font-size:12px;color:#222';
  const controls = document.createElement('div');
  controls.style.cssText = 'display:flex;align-items:center;flex-wrap:wrap;gap:8px';
  const summary = document.createElement('span');
  summary.setAttribute('role', 'status');
  summary.style.cssText = 'font-weight:bold';

  function numericInput(labelText, value, max) {
    const label = document.createElement('label');
    label.textContent = labelText + ' ';
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    if (max !== undefined) input.max = String(max);
    input.step = labelText.includes('수수료') ? '0.1' : '1';
    input.value = String(value);
    input.style.cssText = 'width:70px;padding:4px;border:1px solid #aaa;border-radius:3px;background:white;color:#222';
    label.appendChild(input);
    controls.appendChild(label);
    return input;
  }
  const commissionInput = numericInput('수수료 최소(%)', 15, 100);
  const reviewInput = numericInput('리뷰 최소(개)', 51);

  function button(label, handler) {
    const element = document.createElement('button');
    element.type = 'button';
    element.textContent = label;
    element.style.cssText = 'padding:5px 8px;border:0;border-radius:4px;background:#b95d00;color:white;font-size:12px;cursor:pointer;white-space:nowrap';
    element.addEventListener('click', handler);
    controls.appendChild(element);
    return element;
  }

  function refresh() {
    cards = collectCards();
    let visible = 0;
    let unknown = 0;
    for (const card of cards) {
      if (!originalDisplay.has(card)) originalDisplay.set(card, card.style.display);
      if (!originalOrder.has(card)) originalOrder.set(card, nextOrder++);
      const text = textOf(card);
      const commission = commissionOf(text);
      const reviews = reviewsOf(text);
      const missing = commission === null || reviews === null;
      if (missing) unknown++;
      const passes = !settings.enabled ||
        (!missing && commission >= settings.commission && reviews >= settings.reviews);
      card.style.display = passes ? originalDisplay.get(card) : 'none';
      if (passes) visible++;
    }
    const groups = new Map();
    for (const card of cards) {
      const parent = card.parentElement;
      if (!parent) continue;
      if (!groups.has(parent)) groups.set(parent, []);
      groups.get(parent).push(card);
    }
    for (const [parent, group] of groups) {
      const getter = sort?.getter;
      const ordered = [...group].sort((a, b) => {
        if (!getter) return originalOrder.get(a) - originalOrder.get(b);
        const av = getter(textOf(a));
        const bv = getter(textOf(b));
        if (av === null) return bv === null ? 0 : 1;
        if (bv === null) return -1;
        return sort.direction * (av - bv);
      });
      // Preserve non-card siblings and avoid observer loops when order is unchanged.
      if (group.some((card, index) => card !== ordered[index])) {
        const slots = group.map(card => {
          const marker = document.createComment('shoco-card');
          parent.insertBefore(marker, card);
          card.remove();
          return marker;
        });
        slots.forEach((slot, index) => slot.replaceWith(ordered[index]));
      }
    }
    const message = (settings.enabled ? '조건 충족 ' : '전체 표시 ') +
      visible + ' / ' + cards.length + '개 · 값 확인 불가 ' + unknown +
      '개 · 현재 화면에 로드된 상품 기준';
    if (summary.textContent !== message) summary.textContent = message;
  }

  function applyFilters() {
    const commission = Number(commissionInput.value);
    const reviews = Number(reviewInput.value);
    if (!commissionInput.value.trim() || !reviewInput.value.trim() ||
        !Number.isFinite(commission) || commission < 0 || commission > 100 ||
        !Number.isInteger(reviews) || reviews < 0) {
      alert('수수료는 0~100, 리뷰 수는 0 이상의 정수로 입력하세요.');
      return;
    }
    settings.commission = commission;
    settings.reviews = reviews;
    settings.enabled = true;
    refresh();
  }
  button('필터 적용', applyFilters);
  button('필터 해제', () => { settings.enabled = false; refresh(); });
  button('새로 확인', refresh);
  for (const input of [commissionInput, reviewInput]) {
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter') { event.preventDefault(); applyFilters(); }
    });
  }

  const sortButtons = [];
  for (const [label, getter] of [['수수료', commissionOf], ['리뷰', reviewsOf],
    ['가격', priceOf], ['할인율', discountOf]]) {
    const element = button(label + ' ↓', () => {
      const direction = sort?.getter === getter ? -sort.direction : -1;
      sort = { getter, direction };
      for (const item of sortButtons) item.element.textContent = item.label + ' ↓';
      element.textContent = label + (direction === -1 ? ' ↓' : ' ↑');
      refresh();
    });
    sortButtons.push({ element, label });
  }
  button('원래 순서', () => { sort = null; refresh(); });
  panel.append(controls, summary);

  const anchor = [...document.querySelectorAll('span')]
    .find(element => textOf(element).replace(/\s+/g, '').includes('노출됩니다'));
  const search = document.querySelector('input[type="search"],input[placeholder*="검색"]');
  const host = anchor?.parentElement || search?.parentElement || document.querySelector('main');
  if (!host) {
    alert('쇼핑커넥트 상품찾기 검색결과에서 실행하세요.');
    return;
  }
  host.insertBefore(panel, anchor || host.firstChild);

  observer = new MutationObserver(records => {
    if (records.every(record => panel.contains(record.target))) return;
    clearTimeout(timer);
    timer = setTimeout(refresh, 150);
  });
  observer.observe(document.querySelector('main') || document.body, { childList: true, subtree: true });
  window.__SHOCO_SORTER__ = {
    destroy() {
      observer.disconnect();
      clearTimeout(timer);
      for (const [card, display] of originalDisplay) card.style.display = display;
      panel.remove();
    }
  };
  refresh();
})();
