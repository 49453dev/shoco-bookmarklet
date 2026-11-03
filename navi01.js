(async () => {
  if (window.__navbyLoading) {
    return alert('상품을 로딩하고 있습니다. 잠시 기다려 주세요.');
  }

  window.__navbyLoading = true;
  window.__navbyRankCleanup?.();

  [
    'navby-style',
    'navby-grid-test',
    'navby-gap-fix',
    'navby-fit-style'
  ].forEach(id => document.getElementById(id)?.remove());

  document.querySelectorAll(
    '[data-navby-visby],[data-navby-grid],[data-navby-row]'
  ).forEach(el => {
    el.removeAttribute('data-navby-visby');
    el.removeAttribute('data-navby-grid');
    el.removeAttribute('data-navby-row');
  });

  const CARD =
    'li[class*="adProduct_list_item"],li[class*="product_list_item"]';

  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  const loading = document.createElement('div');
  loading.textContent = '상품을 불러오는 중입니다…';
  loading.style.cssText =
    'position:fixed;top:15px;right:15px;z-index:2147483647;' +
    'background:#18365c;color:white;padding:12px 16px;' +
    'border-radius:8px;font:bold 14px Arial;pointer-events:none;';
  document.body.appendChild(loading);

  try {
    if (!document.querySelector(CARD)) {
      alert('상품 카드를 찾지 못했습니다.');
      return;
    }

    const start = Date.now();
    let stable = 0;
    let previous = '';
    let completed = false;

    while (Date.now() - start < 60000) {
      const page = document.scrollingElement || document.documentElement;
      const bottom = Math.max(0, page.scrollHeight - innerHeight);
      const next = Math.min(bottom, page.scrollTop + innerHeight * 0.9);

      window.scrollTo({ top: next, behavior: 'instant' });
      await wait(120);

      const current = document.scrollingElement || document.documentElement;
      const atBottom =
        current.scrollTop + innerHeight >= current.scrollHeight - 5;

      if (!atBottom) {
        stable = 0;
        previous = '';
        continue;
      }

      await wait(600);

      const latest = document.scrollingElement || document.documentElement;
      const stillBottom =
        latest.scrollTop + innerHeight >= latest.scrollHeight - 5;

      const images = [...document.querySelectorAll(
        'a[class*="thumbnail_thumb"] img'
      )];

      const signature = [
        latest.scrollHeight,
        document.querySelectorAll(CARD).length,
        images.map(img => img.currentSrc || img.src).join('|'),
        images.filter(img => img.complete).length
      ].join(':');

      stable = stillBottom && signature === previous ? stable + 1 : 0;
      previous = signature;

      loading.textContent =
        `상품 ${document.querySelectorAll(CARD).length}개 로딩 확인 중…`;

      if (stable >= 4) {
        completed = true;
        break;
      }
    }

    if (!completed) {
      alert(
        '60초 동안 로딩이 안정되지 않아 중단했습니다.\n' +
        '페이지 상태를 확인한 뒤 북마크를 다시 실행해 주세요.'
      );
      return;
    }

    window.scrollTo({ top: 0, behavior: 'instant' });
    await wait(150);

    const lists = [...document.querySelectorAll(
      'ul[class*="imgList_search_list"]'
    )].filter(el =>
      el.getClientRects().length && el.querySelector(CARD)
    );

    if (!lists.length) {
      alert('상품 목록을 찾지 못했습니다.');
      return;
    }

    const groups = new Map();

    lists.forEach(list => {
      const parent = list.parentElement;
      if (!groups.has(parent)) groups.set(parent, []);
      groups.get(parent).push(list);
    });

    groups.forEach((items, parent) => {
      if (items.length < 2) return;
      parent.setAttribute('data-navby-grid', '');
      items.forEach(list => list.setAttribute('data-navby-row', ''));
    });

    const cards = [...document.querySelectorAll(CARD)].filter(el =>
      lists.includes(el.parentElement) && el.getClientRects().length
    );

    if (!cards.length) {
      alert('집계할 상품 카드를 찾지 못했습니다.');
      return;
    }

    const style = document.createElement('style');
    style.id = 'navby-style';
    style.textContent = `
      [data-navby-grid]{
        display:grid!important;
        grid-template-columns:repeat(10,minmax(0,1fr))!important;
        gap:16px 8px!important;
        align-items:start!important;
      }
      [data-navby-grid]>:not([data-navby-row]){
        grid-column:1/-1!important;
      }
      [data-navby-grid]>[data-navby-row]{
        display:contents!important;
      }
      [data-navby-grid]::before,
      [data-navby-grid]::after,
      [data-navby-row]::before,
      [data-navby-row]::after{
        content:none!important;
        display:none!important;
      }
      [data-navby-row]>:empty{
        display:none!important;
      }
      [data-navby-row]>li{
        zoom:.5!important;
        width:auto!important;
        min-width:0!important;
        max-width:none!important;
        margin:0!important;
        padding:12px!important;
        box-sizing:border-box!important;
        align-self:stretch!important;
      }
      [data-navby-row]>li>div[class*="thumbnail_thumb_wrap"],
      [data-navby-row]>li>div[class*="product_info_area"],
      [data-navby-row]>li>div[class*="adProduct_info_area"]{
        width:100%!important;
        min-width:0!important;
        max-width:100%!important;
        box-sizing:border-box!important;
      }
      [data-navby-row]>li a[class*="thumbnail_thumb"]{
        display:block!important;
        width:100%!important;
        max-width:100%!important;
        height:auto!important;
        box-sizing:border-box!important;
      }
      [data-navby-row]>li a[class*="thumbnail_thumb"]>img{
        display:block!important;
        width:100%!important;
        height:auto!important;
        object-fit:contain!important;
      }
      [data-navby-row]>li [class*="product_title"],
      [data-navby-row]>li [class*="adProduct_title"]{
        width:auto!important;
        min-width:0!important;
        max-width:100%!important;
      }
      [data-navby-row]>li a[class*="product_link"],
      [data-navby-row]>li a[class*="adProduct_link"]{
        display:-webkit-box!important;
        -webkit-box-orient:vertical!important;
        -webkit-line-clamp:2!important;
        overflow:hidden!important;
        white-space:normal!important;
        overflow-wrap:anywhere!important;
        max-width:100%!important;
      }
      [data-navby-row]>li [class*="groupOption_option_area"],
      [data-navby-row]>li button[class*="groupOption_btn_option_more"]{
        width:100%!important;
        max-width:100%!important;
        min-width:0!important;
        box-sizing:border-box!important;
      }
      [data-navby-visby]{
        background:#A1FFDC!important;
        border-radius:10px!important;
        outline:2px solid #00E6AD!important;
        outline-offset:-2px!important;
        box-shadow:0 0 14px rgba(0,230,173,.38)!important;
      }
      [data-navby-visby] a[class*="product_link"],
      [data-navby-visby] a[class*="adProduct_link"]{
        color:#152B28!important;
      }
    `;
    document.head.appendChild(style);

    const layer = document.createElement('div');
    layer.style.cssText =
      'position:fixed;inset:0;pointer-events:none;z-index:2147483646;';
    document.body.appendChild(layer);

    const hits = [];
    const labels = [];

    cards.forEach((card, i) => {
      const title = card.querySelector(
        'a[class*="adProduct_link"],a[class*="product_link"]'
      );
      const name = title?.getAttribute('title') || title?.textContent || '';

      
      const group = title?.getAttribute('data-shp-contents-grp');

      const isAd =
        group === 'ad' ||
        !!card.querySelector('svg.svg_ad, svg.svg_super');

      const ad =
        isAd ? '광고' :
        group === 'prod' ? '일반' : '미확인';

      const image = card.querySelector(
        'a[class*="thumbnail_thumb"] img'
      );
      
      if (image) {
        const label = document.createElement('span');
        label.textContent = `${i + 1}위`;
        label.style.cssText =
          'position:absolute;padding:1px 3px;' +
          
          `background:${isAd ? '#FF6728' : '#18365c'};` +


          
          'color:white;border-radius:3px;font:bold 10px/15px Arial;' +
          'white-space:nowrap;transform:translateX(-100%);';

        layer.appendChild(label);
        labels.push({ image, label });
      }

      if (!/비스비|\bVISBYH?\b/i.test(name)) return;

      card.setAttribute('data-navby-visby', '');
      hits.push(`${i + 1}위(${ad})`);
    });

    const update = () => {
      labels.forEach(({ image, label }) => {
        const r = image.getBoundingClientRect();
        const show =
          image.isConnected && r.width > 0 && r.height > 0 &&
          r.bottom > 0 && r.top < innerHeight &&
          r.right > 0 && r.left < innerWidth;

        label.style.display = show ? 'block' : 'none';
        label.style.left = `${r.right - 2}px`;
        label.style.top = `${r.top + 2}px`;
      });
    };

    let frame = 0;

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', schedule, true);
    window.addEventListener('resize', schedule);
    document.addEventListener('load', schedule, true);

    window.__navbyRankCleanup = () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('load', schedule, true);
      layer.remove();
      delete window.__navbyRankCleanup;
    };

    loading.remove();
    schedule();

    alert(
      `현재 페이지 로딩 확인 후 집계\n` +
      `인식 상품: ${cards.length}개\n` +
      `비스비: ${hits.length}개\n` +
      `순위: ${hits.join(', ') || '없음'}`
    );
  } catch (error) {
    console.error('네비 실행 오류:', error);
    alert('실행 중 오류가 발생했습니다. 새로고침 후 다시 실행해 주세요.');
  } finally {
    loading.remove();
    delete window.__navbyLoading;
  }
})();
