/* 깃허브 저장용 수정 코드 (shopping_cont_sorter.js) */
(async () => {
  const qs = new URLSearchParams(location.search);
  const query = qs.get("query");
  if (!query) return;

  // 1. 브랜드커넥트 API 데이터 호출
  const api = "https://gw-brandconnect.naver.com/affiliate/query/affiliate-products/search-by-query?query=" + encodeURIComponent(query) + "&limit=100";
  
  try {
    const res = await fetch(api, { credentials: "include" });
    const json = await res.json();
    const items = (json && json.data) ? json.data : [];
    if (!items.length) return;

    // 2. 기준 위치(anchor) 찾기
    const anchor = [...document.querySelectorAll('span')]
      .find(e => e.innerText && e.innerText.replace(/\s+/g,'').includes('노출됩니다'));
    
    if (!anchor) return;

    const container = anchor.parentElement;
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    document.getElementById('bm-sort-panel')?.remove();

    // 3. 카드 수집 및 데이터 매칭
    const cards = [];
    document.querySelectorAll("li").forEach(card => {
      const text = card.innerText || "";
      const item = items.find(i => text.indexOf(i.productName) > -1);
      
      if (item) {
        // 정렬을 위한 데이터 저장
        card.dataset.commission = item.commissionRate || 0;
        card.dataset.price = item.salePrice || 0;
        card.dataset.discount = item.discountRate || 0;
        cards.push(card);

        // 링크가 없을 때만 삽입 (중복 방지)
        if (!card.querySelector(".__product_url")) {
          const a = document.createElement("a");
          a.className = "__product_url";
          a.href = item.productUrl;
          a.target = "_blank";
          a.style.cssText = "display:block;margin:4px 0;color:#0a7;font-size:11px;text-decoration:none;word-break:break-all;";
          a.innerText = "🔗 상품링크: " + item.productUrl;
          
          const btns = card.querySelectorAll("button, a");
          if (btns.length > 0) {
            btns[btns.length - 1].parentNode.insertBefore(a, btns[btns.length - 1]);
          } else {
            card.appendChild(a);
          }
        }
      }
    });

    // 4. 정렬 버튼 생성 로직
    const panel = document.createElement('div');
    panel.id = 'bm-sort-panel';
    panel.style.cssText = 'display:flex;gap:6px;margin-right:12px';

    const makeBtn = (label, key) => {
      const b = document.createElement('button');
      b.dataset.dir = 'desc';
      b.innerText = label + '↓';
      b.style.cssText = 'padding:4px 8px;border:0;border-radius:4px;background:#ff7a00;color:#fff;font-size:12px;cursor:pointer;white-space:nowrap';

      b.onclick = (e) => {
        e.preventDefault();
        const isDesc = b.dataset.dir === 'desc';
        b.dataset.dir = isDesc ? 'asc' : 'desc';
        b.innerText = label + (isDesc ? '↑' : '↓');
        
        const sorted = [...cards].sort((a, c) => {
          const valA = parseFloat(a.dataset[key]);
          const valC = parseFloat(c.dataset[key]);
          return isDesc ? valC - valA : valA - valC;
        });

        const parent = cards[0].parentElement;
        sorted.forEach(el => parent.appendChild(el));
      };
      return b;
    };

    // 버튼 3개 추가 (수수료, 가격, 할인율)
    panel.appendChild(makeBtn('수수료', 'commission'));
    panel.appendChild(makeBtn('가격', 'price'));
    panel.appendChild(makeBtn('할인율', 'discount'));

    container.insertBefore(panel, anchor);

  } catch (e) {
    console.error("오류 발생:", e);
  }
})();
