(async () => {
  /* 1. 검색어 추출 및 초기화 */
  const params = new URLSearchParams(location.search);
  const query = params.get("query");
  
  if (!query) {
    alert("검색어를 찾지 못했습니다. 검색 결과 페이지인지 확인해주세요.");
    return;
  }

  /* 2. 네이버 브랜드커넥트 API 호출 */
  const api = "https://gw-brandconnect.naver.com/affiliate/query/affiliate-products/search-by-query?query=" + encodeURIComponent(query) + "&limit=100";
  
  try {
    const res = await fetch(api, { credentials: "include" });
    const json = await res.json();
    const items = (json && json.data) ? json.data : [];
    
    if (!items.length) {
      alert("상품 데이터 없음 (API 응답이 비어있습니다)");
      return;
    }

    /* 3. 기준 위치(anchor) 및 정렬 패널 생성 */
    const anchor = [...document.querySelectorAll('span')]
      .find(e => e.innerText && e.innerText.replace(/\s+/g,'').includes('노출됩니다'));
    
    if (!anchor) {
      console.log("버튼 위치(anchor)를 찾을 수 없어 상단에 출력합니다.");
    }

    const container = anchor ? anchor.parentElement : document.body;
    document.getElementById('bm-sort-panel')?.remove();

    const panel = document.createElement('div');
    panel.id = 'bm-sort-panel';
    panel.style.cssText = 'display:flex;gap:6px;padding:10px;background:#fff;z-index:9999;';

    /* 4. 카드 매칭 및 데이터 주입 */
    const cards = [];
    document.querySelectorAll("li").forEach(card => {
      const text = card.innerText || "";
      const item = items.find(i => text.indexOf(i.productName) > -1);
      
      if (item) {
        // 정렬용 데이터 저장
        card.dataset.commission = item.commissionRate || 0;
        card.dataset.price = item.salePrice || 0;
        card.dataset.discount = item.discountRate || 0;
        cards.push(card);

        // 상품 링크 삽입 (중복 방지)
        if (!card.querySelector(".__product_url")) {
          const box = document.createElement("div");
          box.className = "__product_url";
          box.style.cssText = "margin:6px 0;padding:4px;font-size:11px;color:#0a7;border-bottom:1px dashed #ddd;";
          
          const a = document.createElement("a");
          a.href = item.productUrl;
          a.target = "_blank";
          a.style.cssText = "color:#0a7;text-decoration:none;";
          a.innerText = "🔗 수수료 " + item.commissionRate + "% 링크";
          
          box.appendChild(a);
          const btns = card.querySelectorAll("button, a");
          if (btns.length > 0) {
            btns[btns.length - 1].parentNode.insertBefore(box, btns[btns.length - 1]);
          } else {
            card.appendChild(box);
          }
        }
      }
    });

    /* 5. 버튼 생성 및 정렬 로직 연동 */
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

    if (anchor) {
      container.insertBefore(panel, anchor);
    } else {
      document.body.prepend(panel);
    }

  } catch (err) {
    console.error("실행 중 오류:", err);
  }
})();
