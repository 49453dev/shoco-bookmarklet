(async () => {
  /* 1. 검색어 추출 및 정규화 */
  const qs = new URLSearchParams(location.search);
  let query = qs.get("query");
  
  // 검색어가 없을 경우 페이지 내 입력창에서 시도
  if (!query) {
    const searchInput = document.querySelector('input[type="search"], input[placeholder*="검색"]');
    if (searchInput) query = searchInput.value;
  }

  if (!query) {
    alert("검색어를 찾지 못했습니다. 검색 후 다시 실행해주세요.");
    return;
  }

  console.log("현재 검색어:", query);

  /* 2. API 호출 (수수료 데이터 가져오기) */
  const api = `https://gw-brandconnect.naver.com/affiliate/query/affiliate-products/search-by-query?query=${encodeURIComponent(query)}&limit=100`;
  
  try {
    const res = await fetch(api, { credentials: "include" });
    const json = await res.json();
    const items = (json && json.data) ? json.data : [];
    
    if (!items.length) {
      console.log("API 응답 결과:", json);
      alert(`'${query}'에 대한 상품 데이터가 없습니다. (브랜드커넥트 연동 상품인지 확인 필요)`);
      return;
    }

    /* 3. 버튼 위치 선정 및 패널 생성 */
    const anchor = [...document.querySelectorAll('span, div')]
      .find(e => e.innerText && e.innerText.replace(/\s+/g,'').includes('노출됩니다'));
    
    let container;
    if (anchor) {
      container = anchor.parentElement;
      container.style.display = 'flex';
      container.style.alignItems = 'center';
    } else {
      // 위치를 못 찾으면 상단 영역에 강제 삽입
      container = document.createElement('div');
      container.style.cssText = 'padding:10px; background:#fff; border-bottom:1px solid #ddd;';
      document.body.prepend(container);
    }

    document.getElementById('bm-sort-panel')?.remove();
    const panel = document.createElement('div');
    panel.id = 'bm-sort-panel';
    panel.style.cssText = 'display:flex;gap:6px;margin-right:12px';

    /* 4. 카드 데이터 매칭 */
    const cards = [];
    const liElements = document.querySelectorAll("li");

    liElements.forEach(function(card) {
      const text = card.innerText || "";
      // 상품명 매칭 (공백 제거 후 비교하여 정확도 향상)
      const item = items.find(i => {
        const cleanName = i.productName.replace(/\s+/g,'');
        return text.replace(/\s+/g,'').indexOf(cleanName) > -1;
      });

      if (item) {
        card.dataset.commission = item.commissionRate || 0;
        card.dataset.price = item.salePrice || 0;
        card.dataset.discount = item.discountRate || 0;
        cards.push(card);

        if (!card.querySelector(".__product_url")) {
          const box = document.createElement("div");
          box.className = "__product_url";
          box.style.cssText = "margin:6px 0;padding:4px;font-size:11px;color:#0a7;background:#f0fcf5;border-radius:4px;";
          box.innerHTML = `<a href="${item.productUrl}" target="_blank" style="color:#0a7;text-decoration:none;">🔗 수수료 ${item.commissionRate}% 상품링크</a>`;
          
          const targetBtn = card.querySelector("button, a:last-child");
          if (targetBtn) targetBtn.parentNode.insertBefore(box, targetBtn);
          else card.appendChild(box);
        }
      }
    });

    /* 5. 정렬 버튼 생성 */
    const makeBtn = (label, key) => {
      const b = document.createElement('button');
      b.dataset.dir = 'desc';
      b.innerText = label + '↓';
      b.style.cssText = 'padding:4px 8px;border:0;border-radius:4px;background:#ff7a00;color:#fff;font-size:12px;cursor:pointer;';
      b.onclick = (e) => {
        e.preventDefault();
        const isDesc = b.dataset.dir === 'desc';
        b.dataset.dir = isDesc ? 'asc' : 'desc';
        b.innerText = label + (isDesc ? '↑' : '↓');
        
        const sorted = [...cards].sort((a, c) => {
          const vA = parseFloat(a.dataset[key]);
          const vC = parseFloat(c.dataset[key]);
          return isDesc ? vC - vA : vA - vC;
        });
        
        const parent = cards[0].parentElement;
        sorted.forEach(el => parent.appendChild(el));
      };
      return b;
    };

    panel.appendChild(makeBtn('수수료', 'commission'));
    panel.appendChild(makeBtn('가격', 'price'));
    panel.appendChild(makeBtn('할인율', 'discount'));
    container.prepend(panel);

  } catch (e) {
    console.error("실행 중 오류:", e);
    alert("데이터를 불러오는 중 오류가 발생했습니다. 콘솔(F12)을 확인해주세요.");
  }
})();
