(() => {
  if (!/(^|\.)coupang\.com$/.test(location.hostname) ||
      !/\/products\/\d+/.test(location.pathname)) {
    alert('쿠팡 상품 페이지를 열고 실행해 주세요.');
    return;
  }

  const urls = new Set();
  const detail = '#productDetail, #product-detail, .product-detail-content, .product-detail-seemore, .product-description, .vendor-item-product-detail, .detail-item';
  function collect(doc, inDetail = false) {
    for (const node of doc.querySelectorAll('img, iframe')) {
      const scoped = inDetail || Boolean(node.closest(detail));
      if (node.tagName === 'IFRAME') {
        if (scoped && node.contentDocument) collect(node.contentDocument, true);
        continue;
      }
      const source = node.getAttribute('data-src') || node.getAttribute('data-original') ||
        node.currentSrc || node.getAttribute('src');
      if (!source) continue;
      let url;
      try { url = new URL(source, doc.baseURI); } catch { continue; }
      if (!['http:', 'https:'].includes(url.protocol)) continue;
      const coupangDetail = /(^|\.)coupangcdn\.com$/.test(url.hostname) &&
        url.pathname.includes('/vendor_inventory/');
      if (!scoped && !coupangDetail) continue;
      if (node.naturalWidth > 0 && node.naturalWidth <= 30) continue;
      if (url.protocol === 'http:' && /(^|\.)coupangcdn\.com$/.test(url.hostname)) {
        url.protocol = 'https:';
      }
      urls.add(url.href);
    }
  }
  collect(document);
  if (!urls.size) {
    alert('상세 이미지를 찾지 못했습니다. 상품상세를 펼치고 이미지가 표시된 뒤 다시 실행해 주세요.');
    return;
  }

  const viewer = window.open('about:blank', '_blank');
  if (!viewer) {
    alert('쿠팡 페이지의 팝업을 허용해 주세요.');
    return;
  }
  const doc = viewer.document;
  doc.title = '쿠팡 상세 이미지';
  const style = doc.createElement('style');
  style.textContent = `
    body { margin:0; padding:16px; background:#111; color:#fff; font:14px sans-serif }
    header { position:sticky; top:0; background:#222; padding:12px; display:flex; gap:10px; align-items:center; z-index:1 }
    main { columns:165px; column-gap:8px; margin-top:8px }
    label { display:block; break-inside:avoid; margin-bottom:8px; background:#222; border:2px solid transparent; padding:5px; cursor:pointer }
    label:has(input:checked) { border-color:#70e795 }
    img { display:block; width:100%; height:auto }
  `;
  doc.head.append(style);
  const bar = doc.createElement('header');
  const count = doc.createElement('span');
  const grid = doc.createElement('main');
  const entries = [];
  const refresh = () => {
    count.textContent = `총 ${urls.size}장 · 선택 ${entries.filter(entry => entry.check.checked).length}장`;
  };
  const button = (label, action) => {
    const element = doc.createElement('button');
    element.textContent = label;
    element.onclick = action;
    return element;
  };
  bar.append(count, button('전체 해제', () => {
    entries.forEach(entry => { entry.check.checked = false; });
    refresh();
  }), button('선택 모아보기', () => {
    const selected = entries.filter(entry => entry.check.checked);
    if (!selected.length) return viewer.alert('이미지를 선택해 주세요.');
    const output = viewer.open('about:blank', '_blank');
    if (!output) return viewer.alert('팝업을 허용해 주세요.');
    output.document.title = '선택한 쿠팡 상세 이미지';
    output.document.body.style.cssText = 'margin:0;background:#111';
    for (const { url } of selected) {
      const image = output.document.createElement('img');
      image.src = url;
      image.style.cssText = 'display:block;max-width:100%;height:auto;margin:0 auto 8px';
      output.document.body.append(image);
    }
  }));
  doc.body.append(bar, grid);
  for (const url of urls) {
    const item = doc.createElement('label');
    const check = doc.createElement('input');
    check.type = 'checkbox';
    check.setAttribute('aria-label', `상세 이미지 ${entries.length + 1} 선택`);
    check.onchange = refresh;
    const img = doc.createElement('img');
    img.src = url;
    img.loading = 'lazy';
    img.alt = `상세 이미지 ${entries.length + 1}`;
    item.append(check, img);
    grid.append(item);
    entries.push({ url, check });
  }
  refresh();
})();
