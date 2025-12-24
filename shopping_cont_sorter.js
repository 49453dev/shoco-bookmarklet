(() => {
  /* ===============================
     기준 문구(anchor) 찾기
  =============================== */
  const anchor = [...document.querySelectorAll('span')]
    .find(e => e.innerText && e.innerText.replace(/\s+/g,'').includes('노출됩니다'));

  if (!anchor) {
    alert('쇼핑커넥트 상품찾기 검색결과에서 작동합니다');
    return;
  }

  const container = anchor.parentElement;
  container.style.display = 'flex';
  container.style.alignItems = 'center';

  document.getElementById('bm-sort-panel')?.remove();

  /* ===============================
     카드 수집
  =============================== */
  const TARGET = 'li,div';
  const cards = [...document.querySelectorAll(TARGET)]
    .filter(e => /원|수수료|%/.test(e.innerText));

  if (!cards.length) return;

  window.__ORIG__ ||= cards.slice();

  /* ===============================
     값 추출
  =============================== */
  const RE_COMMISSION = /수수료\s*([\d.]+)%/i;
  const RE_PRICE = /([\d,]+)\s*원/;
  const RE_DISCOUNT = /(\d{1,2})\s*%/;

  const getCommission = el => {
    const m = el.innerText.match(RE_COMMISSION);
    return m ? parseFloat(m[1]) : 0;
  };

  const getPrice = el => {
    const m = el.innerText.match(RE_PRICE);
    return m ? parseInt(m[1].replace(/,/g,''),10) : 0;
  };

  const getDiscount = el => {
    const m = el.innerText.match(RE_DISCOUNT);
    return m ? parseInt(m[1],10) : 0;
  };

  const apply = list =>
    list.forEach(el => el.parentElement && el.parentElement.appendChild(el));

  /* ===============================
     버튼 생성
  =============================== */
  const panel = document.createElement('div');
  panel.id = 'bm-sort-panel';
  panel.style.cssText = 'display:flex;gap:6px;margin-right:8px';

  const makeBtn = (label, getter) => {
    const b = document.createElement('button');
    b.dataset.dir = 'desc';
    b.innerText = label + '↓';
    b.style.cssText =
      'padding:4px 8px;border:0;border-radius:4px;background:#ff7a00;color:#fff;font-size:12px;cursor:pointer;white-space:nowrap';

    b.onclick = () => {
      const dir = b.dataset.dir === 'desc' ? 1 : -1;
      b.dataset.dir = b.dataset.dir === 'desc' ? 'asc' : 'desc';
      b.innerText = label + (b.dataset.dir === 'desc' ? '↓' : '↑');
      apply([...cards].sort((a,c) => dir * (getter(c) - getter(a))));
    };

    return b;
  };

  panel.appendChild(makeBtn('수수료', getCommission));
  panel.appendChild(makeBtn('가격', getPrice));
  panel.appendChild(makeBtn('할인율', getDiscount));

  container.insertBefore(panel, anchor);
})();

