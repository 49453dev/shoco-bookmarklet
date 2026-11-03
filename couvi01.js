
(() => {
  'use strict';

  const VERSION = '5.8';
  const STYLE_ID = 'koobi-main-style';
  const OVERLAY_ID = 'koobi-overlay';
  const LIST_ATTR = 'data-koobi-list';
  const VISBY_ATTR = 'data-visbyh-highlight';
  const CARD_SELECTOR = 'li[class*="ProductUnit_productUnit"]';

  // 이전 쿠비 실행 결과 정리
  [
    'koobi-v4-style',
    'koobi-v5-style',
    'koobi-v51-style',
    'koobi-v52-style',
    'koobi-v53-style',
    'koobi-v54-style',
    'koobi-v55-style',
    'visbyh-highlight-style',
    STYLE_ID
  ].forEach(id => document.getElementById(id)?.remove());

  [
    'visbyh-neon-overlay',
    OVERLAY_ID
  ].forEach(id => document.getElementById(id)?.remove());

  document.querySelectorAll('.koobi-rankbar, .koobi-rank')
    .forEach(el => el.remove());

  document.querySelectorAll('.koobi-original-ad, .koobi-ad-neon')
    .forEach(el => {
      el.classList.remove('koobi-original-ad', 'koobi-ad-neon');
    });

  document.querySelectorAll(`[${VISBY_ATTR}]`)
    .forEach(el => el.removeAttribute(VISBY_ATTR));

  document.querySelectorAll(`[${LIST_ATTR}]`)
    .forEach(el => el.removeAttribute(LIST_ATTR));

  // 이전 버전에서 설정한 인라인 스타일 정리
  document.querySelectorAll(CARD_SELECTOR).forEach(card => {
    card.style.removeProperty('position');
  });

  const cards = [...document.querySelectorAll(CARD_SELECTOR)];

  if (!cards.length) {
    alert('쿠비: 쿠팡 검색 결과 상품카드를 찾지 못했습니다.');
    return;
  }

  const keyword =
    new URLSearchParams(location.search).get('q') ||
    document.querySelector('input[name="q"]')?.value ||
    '검색어 확인 불가';

  const list = cards[0].parentElement;
  list.setAttribute(LIST_ATTR, '');

  let columns = 6;
  let visbyCount = 0;
  let adCount = 0;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  document.head.appendChild(style);

  // 상품카드 전체 배율
  const getScale = () => {
    if (columns === 8) return 0.65;
    if (columns === 6) return 0.78;
    return 1;
  };

  function applyStyle() {
    const scale = getScale();

    style.textContent = `
      /* 검색 결과 목록 */
      [${LIST_ATTR}] {
        display: grid !important;
        grid-template-columns:
          repeat(${columns}, minmax(0, 1fr)) !important;
        gap: 16px 8px !important;
        width: 100% !important;
        align-items: start !important;
      }

      /* 카드 외부 영역 */
      [${LIST_ATTR}] > ${CARD_SELECTOR} {
        position: relative !important;
        display: block !important;
        width: 100% !important;
        min-width: 0 !important;
        max-width: none !important;
        height: auto !important;
        margin: 0 !important;
        padding: 36px 3px 8px !important;
        box-sizing: border-box !important;
        overflow: visible !important;
      }

      /* 카드 내부 전체를 동일한 비율로 축소 */
      [${LIST_ATTR}] > ${CARD_SELECTOR} > a {
        zoom: ${scale} !important;
        display: block !important;
        width: 100% !important;
        min-width: 0 !important;
        max-width: 100% !important;
        height: auto !important;
        box-sizing: border-box !important;
      }

      /* 기존 이미지·가격·배송·평점 크기 규칙은 유지 */
      [${LIST_ATTR}] > ${CARD_SELECTOR} > a img {
        max-width: 100% !important;
      }

      /* 비스비 카드 강조 */
      [${VISBY_ATTR}] {
        background: #A1FFDC !important;
        border: 2px solid #00E6AD !important;
        border-radius: 10px !important;
        box-shadow:
          0 0 14px rgba(0,230,173,.38) !important;
        box-sizing: border-box !important;
      }

      [${VISBY_ATTR}]
      [class*="ProductUnit_productName"] {
        color: #152B28 !important;
      }

      /* 순위·광고 표시 영역 */
      .koobi-rankbar {
        position: absolute !important;
        top: 3px !important;
        left: 4px !important;
        z-index: 20 !important;
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
        pointer-events: none !important;
      }

      /* 일반 순위 - 블루 네온 */
      .koobi-rank {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 4px 10px !important;
        border: 2px solid #36BFFF !important;
        border-radius: 7px !important;
        background: #102D55 !important;
        color: #B9EFFF !important;
        box-shadow:
          0 0 8px rgba(54,191,255,.65),
          0 0 16px rgba(54,191,255,.3) !important;
        text-shadow:
          0 0 7px rgba(54,191,255,.8) !important;
        font: 800 13px/18px Arial,sans-serif !important;
        white-space: nowrap !important;
        box-sizing: border-box !important;
      }

      /* 비스비 순위 - 민트 네온 */
      [${VISBY_ATTR}]
      > .koobi-rankbar > .koobi-rank {
        background: #063B35 !important;
        border-color: #00E6AD !important;
        color: #54FFD0 !important;
        box-shadow:
          0 0 9px rgba(0,230,173,.7),
          0 0 18px rgba(0,230,173,.35) !important;
        text-shadow:
          0 0 8px rgba(0,230,173,.9) !important;
      }

      /* 광고 - 오렌지 네온 */
      .koobi-ad {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 4px 9px !important;
        border: 2px solid #FF6728 !important;
        border-radius: 7px !important;
        background: #431508 !important;
        color: #FFD0A8 !important;
        box-shadow:
          0 0 8px rgba(255,103,40,.8),
          0 0 16px rgba(255,103,40,.4) !important;
        text-shadow:
          0 0 7px rgba(255,130,60,.8) !important;
        font: 800 12px/18px Arial,sans-serif !important;
        white-space: nowrap !important;
        box-sizing: border-box !important;
      }

      /* 원래 광고 문구 숨김 */
      .koobi-original-ad {
        visibility: hidden !important;
        opacity: 0 !important;
      }
    `;
  }

  // 상품 분석 및 순위 생성
  cards.forEach((card, index) => {
    const title = card.querySelector(
      '[class*="ProductUnit_productName"]'
    );

    const isVisby = Boolean(
      title && /(VISBYH|VISBY|비스비)/i.test(title.textContent)
    );

    if (isVisby) {
      card.setAttribute(VISBY_ATTR, '');
      visbyCount++;
    }

    const adElements = [...card.querySelectorAll('span')]
      .filter(el =>
        el.children.length === 0 &&
        el.textContent.trim() === '광고'
      );

    const isAd = adElements.length > 0;

    if (isAd) {
      adCount++;
      adElements.forEach(el => {
        el.classList.add('koobi-original-ad');
      });
    }

    const rankBar = document.createElement('div');
    rankBar.className = 'koobi-rankbar';

    const rank = document.createElement('span');
    rank.className = 'koobi-rank';
    rank.textContent = `${index + 1}위`;
    rankBar.appendChild(rank);

    if (isAd) {
      const ad = document.createElement('span');
      ad.className = 'koobi-ad';
      ad.textContent = '광고';
      rankBar.appendChild(ad);
    }

    card.prepend(rankBar);
  });

  applyStyle();

  // 팝업
  const overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;

  overlay.style.cssText = `
    position:fixed;
    inset:0;
    z-index:2147483647;
    background:rgba(2,8,20,.65);
    backdrop-filter:blur(5px);
    display:flex;
    align-items:center;
    justify-content:flex-start;
    padding-left:min(80px,5vw);
    box-sizing:border-box;
    font-family:Pretendard,-apple-system,
      BlinkMacSystemFont,Arial,sans-serif;
  `;

  const panel = document.createElement('div');

  panel.style.cssText = `
    width:320px;
    max-width:calc(100vw - 40px);
    padding:28px 24px;
    box-sizing:border-box;
    background:linear-gradient(145deg,#101e31,#0b1220);
    border:1px solid #00eac0;
    border-radius:20px;
    box-shadow:
      0 0 24px rgba(0,255,195,.3),
      0 20px 60px rgba(0,0,0,.55);
    text-align:center;
    color:#fff;
  `;

  panel.innerHTML = `
    <div style="
      width:52px;height:52px;border-radius:50%;
      background:#063b35;color:#55ffd2;
      font-size:30px;line-height:52px;
      margin:0 auto 14px;
      text-shadow:0 0 12px #00ffb7
    ">✓</div>

    <div style="font-size:21px;font-weight:800">
      비스비 강조 완료!
    </div>

    <div style="
      font-size:12px;color:#8fa7b9;margin-top:7px
    ">
      쿠팡 검색 결과 분석 · 쿠비 v${VERSION}
    </div>

    <div style="
      height:1px;background:#24414c;margin:20px 0
    "></div>

    <div style="
      font-size:12px;color:#8fa7b9;margin-bottom:6px
    ">
      현재 검색 키워드
    </div>

    <div id="koobi-keyword" style="
      font-size:16px;font-weight:700;color:#fff;
      overflow-wrap:anywhere;margin-bottom:20px
    "></div>

    <div style="font-size:14px;color:#a6c1cb">
      비스비 상품
    </div>

    <div style="
      font-size:52px;font-weight:800;color:#54ffd0;
      text-shadow:0 0 20px rgba(0,255,190,.55);
      margin:4px 0 16px
    ">
      ${visbyCount}
      <span style="font-size:18px;margin-left:5px">개</span>
    </div>

    <div style="
      font-size:12px;color:#ffb184;margin-bottom:15px
    ">
      광고 상품 ${adCount}개 감지
    </div>

    <button id="koobi-cols-toggle" style="
      width:100%;
      border:1px solid #00dfb7;
      border-radius:10px;
      padding:12px;
      background:#123a37;
      color:#54ffd0;
      font-size:14px;
      font-weight:700;
      cursor:pointer;
      margin-bottom:9px
    ">
      6열 보기 적용 중 (클릭 시 8열)
    </button>

    <button id="koobi-close" style="
      width:100%;
      border:0;
      border-radius:10px;
      padding:13px;
      background:#00dfb7;
      color:#06201b;
      font-size:14px;
      font-weight:800;
      cursor:pointer
    ">
      확인
    </button>
  `;

  panel.querySelector('#koobi-keyword').textContent = keyword;

  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  // 6열 → 8열 → 4열
  const toggle = panel.querySelector('#koobi-cols-toggle');

  toggle.addEventListener('click', () => {
    columns = columns === 6 ? 8 : columns === 8 ? 4 : 6;

    applyStyle();

    const next =
      columns === 6 ? 8 :
      columns === 8 ? 4 : 6;

    toggle.textContent =
      `${columns}열 보기 적용 중 (클릭 시 ${next}열)`;
  });




  // 팝업 닫기: Enter / ESC / 확인 버튼 / 바깥 클릭
  const handleKeydown = (event) => {
    if (event.key === 'Enter' || event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      close();
    }
  };

  const close = () => {
    document.removeEventListener('keydown', handleKeydown, true);
    overlay.remove();
  };

  document.addEventListener('keydown', handleKeydown, true);

  panel.querySelector('#koobi-close')
    .addEventListener('click', close);

  overlay.addEventListener('click', event => {
    if (event.target === overlay) {
      close();
    }
  });




  console.log(`[쿠비 v${VERSION}]`, {
    keyword,
    total: cards.length,
    visby: visbyCount,
    ads: adCount,
    columns,
    scale: getScale()
  });
})();
