(async () => {
  /* 1. 네이버 브랜드커넥트 데이터 매칭 로직 */
  var qs = new URLSearchParams(location.search);
  var query = qs.get("query");
  if (!query) {
    alert("검색어를 찾지 못했습니다");
    return;
  }

  var api = "https://gw-brandconnect.naver.com/affiliate/query/affiliate-products/search-by-query?query=" + encodeURIComponent(query) + "&limit=100";
  
  try {
    var res = await fetch(api, { credentials: "include" });
    var json = await res.json();
    var items = (json && json.data) ? json.data : [];
    if (!items.length) {
      alert("상품 데이터 없음");
      return;
    }

    /* 2. 기준 위치(anchor) 찾기 및 패널 생성 */
    const anchor = [...document.querySelectorAll('span')]
      .find(e => e.innerText && e.innerText.replace(/\s+/g,'').includes('노출됩니다'));
    
    if (anchor) {
      const container = anchor.parentElement;
      container.style.display = 'flex';
      container.style.alignItems = 'center';
      document.getElementById('bm-sort-panel')?.remove();
      
      const panel = document.createElement('div');
      panel.id = 'bm-sort-panel';
      panel.style.cssText = 'display:flex;gap:6px;margin-right:12px';
      
      // 정렬 버튼 생성 함수
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
          const sorted = [...cards].sort((a, c) => isDesc ? c.dataset[key] - a.dataset[key] : a.dataset[key] - c.dataset[key]);
          const parent = cards[0].parentElement;
          sorted.forEach(el => parent.appendChild(el));
        };
        return b;
      };

      panel.appendChild(makeBtn('수수료', 'commission'));
      panel.appendChild(makeBtn('가격', 'price'));
      panel.appendChild(makeBtn('할인율', 'discount'));
      container.insertBefore(panel, anchor);
    }

    /* 3. 카드 데이터 매칭 및 UI 삽입 */
    const cards = [];
    document.querySelectorAll("li").forEach(function(card) {
      var text = card.innerText || "";
      var item = items.find(function(i) { return text.indexOf(i.productName) > -1; });
      if (!item) return;

      // 정렬을 위한 데이터 저장
      card.dataset.commission = item.commissionRate || 0;
      card.dataset.price = item.salePrice || 0;
      card.dataset.discount = item.discountRate || 0;
      cards.push(card);

      if (card.querySelector(".__product_url")) return;

      var box = document.createElement("div");
      box.className = "__product_url";
      box.style.cssText = "margin:6px 0;padding-bottom:4px;font-size:11px;color:#0a7;border-bottom:1px dashed #ddd;word-break:break-all;";
      
      var a = document.createElement("a");
      a.href = item.productUrl;
      a.target = "_blank";
      a.style.cssText = "color:#0a7;text-decoration:none;";
      a.innerText = "🔗 상품링크: " + item.productUrl;
      
      box.appendChild(a);
      var buttons = card.querySelectorAll("button,[role='button'],a");
      if (buttons.length > 0 && buttons[buttons.length - 1].parentNode) {
        buttons[buttons.length - 1].parentNode.insertBefore(box, buttons[buttons.length - 1]);
      } else {
        card.appendChild(box);
      }
    });

  } catch (e) {
    console.error("데이터 로드 중 오류 발생:", e);
  }
})();
