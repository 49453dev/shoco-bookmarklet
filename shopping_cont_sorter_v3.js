/* 깃허브 파일 내용 (shopping_cont_sorter.js) */
(async () => {
  // 1. 검색어 추출
  const qs = new URLSearchParams(location.search);
  const query = qs.get("query");
  if (!query) {
    alert("검색어를 찾을 수 없습니다.");
    return;
  }

  // 2. 브랜드커넥트 API 호출 (데이터 가져오기)
  const api = `https://gw-brandconnect.naver.com/affiliate/query/affiliate-products/search-by-query?query=${encodeURIComponent(query)}&limit=100`;
  
  try {
    const res = await fetch(api, { credentials: "include" });
    const json = await res.json();
    const items = (json && json.data) ? json.data : [];
    
    if (!items.length) {
      alert("매칭할 상품 데이터가 없습니다.");
      return;
    }

    // 3. 버튼을 넣을 기준 위치 찾기
    const anchor = [...document.querySelectorAll('span')]
      .find(e => e.innerText && e.innerText.replace(/\s+/g,'').includes('노출됩니다'));
    
    if (!anchor) {
      alert("버튼 위치를 찾을 수 없습니다.");
      return;
    }

    const container = anchor.parentElement;
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    document.getElementById('bm-sort-panel')?.remove();

    // 4. 상품 카드 매칭 및 데이터 속성 부여
    const cards = [];
    document.querySelectorAll("li").forEach(card => {
      const text = card.innerText || "";
      const item = items.find(i => text.indexOf(i.productName) > -1);
      
      if (item) {
        // 정렬용 데이터 저장 (API 값 기준)
        card.dataset.commission = item.commissionRate || 0;
        card.dataset.price = item.salePrice || 0;
        card.dataset.discount = item.discountRate || 0;
        cards.push(card);

        // 상품 링크 UI 추가 (중복 방지)
        if (!card.querySelector(".__product_url")) {
          const link = document.createElement("div");
          link.className = "__product_url";
          link.style.cssText = "margin:4px 0; font-size:11px; color:#0a7;";
          link.innerHTML = `<a href="${item.productUrl}" target="_blank" style="color:#0a7; text-decoration:none;">[상품링크] ${item.commissionRate}% 수수료</a>`;
          
          const btns = card.querySelectorAll("button, a");
          if (btns.length > 0) {
            btns[btns.length - 1].parentNode.insertBefore(link, btns[btns.length - 1]);
          } else {
            card.appendChild(link);
          }
        }
      }
    });

    // 5. 버튼 3개 생성 (수수료, 가격, 할인율)
    const panel = document.createElement('div');
    panel.id = 'bm-sort-panel';
    panel.style.cssText = 'display:flex; gap:6px; margin-right:12px;';

    const makeBtn = (label, key) => {
      const b = document.createElement('button');
      b.dataset.dir = 'desc';
      b.innerText = label + '↓';
      b.style.cssText = 'padding:4px 8px; border:0; border-radius:4px; background:#ff7a00; color:#fff; font-size:12px; cursor:pointer; white-space:nowrap;';

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

    panel.appendChild(makeBtn('수수료', 'commission'));
    panel.appendChild(makeBtn('가격', 'price'));
    panel.appendChild(makeBtn('할인율', 'discount'));

    container.insertBefore(panel, anchor);

  } catch (err) {
    console.error("데이터 로드 실패:", err);
  }
})();
