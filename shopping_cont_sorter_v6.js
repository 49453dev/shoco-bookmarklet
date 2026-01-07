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

    /* [추가] 버튼을 넣을 위치 찾기 */
    const anchor = [...document.querySelectorAll('span')].find(e => e.innerText && e.innerText.includes('노출됩니다'));
    const cards = [];

    document.querySelectorAll("li").forEach(function(card) {
      if (card.querySelector(".__product_url")) return;
      var text = card.innerText || "";
      var item = items.find(function(i) {
        return text.indexOf(i.productName) > -1;
      });

      if (!item || !item.productUrl) return;

      /* [추가] 정렬을 위한 데이터 심기 */
      card.dataset.commission = item.commissionRate || 0;
      card.dataset.price = item.salePrice || 0;
      card.dataset.discount = item.discountRate || 0;
      cards.push(card);

      var box = document.createElement("div");
      box.className = "__product_url";
      box.style.cssText = "margin:6px 0;padding-bottom:4px;font-size:11px;color:#0a7;border-bottom:1px dashed #ddd;word-break:break-all;";
      
      var a = document.createElement("a");
      a.href = item.productUrl;
      a.target = "_blank";
      a.style.cssText = "color:#0a7;text-decoration:none;";
      a.innerText = item.productUrl;
      
      box.appendChild(a);
      var buttons = card.querySelectorAll("button,[role='button'],a");
      if (buttons.length > 0 && buttons[buttons.length - 1].parentNode) {
        buttons[buttons.length - 1].parentNode.insertBefore(box, buttons[buttons.length - 1]);
      } else {
        card.appendChild(box);
      }
    });

    /* [추가] 상단 정렬 버튼 생성 로직 */
    if (anchor && cards.length > 0) {
      const container = anchor.parentElement;
      container.style.display = 'flex';
      container.style.alignItems = 'center';
      document.getElementById('bm-sort-panel')?.remove();

      const panel = document.createElement('div');
      panel.id = 'bm-sort-panel';
      panel.style.cssText = 'display:flex;gap:6px;margin-right:12px';

      const makeBtn = (label, key) => {
        const b = document.createElement('button');
        b.dataset.dir = 'desc';
        b.innerText = label + '↓';
        b.style.cssText = 'padding:4px 8px;border:0;border-radius:4px;background:#ff7a00;color:#fff;font-size:12px;cursor:pointer;';
        b.onclick = () => {
          const isDesc = b.dataset.dir === 'desc';
          b.dataset.dir = isDesc ? 'asc' : 'desc';
          b.innerText = label + (isDesc ? '↓' : '↑');
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

  } catch (e) {
    console.error("데이터 로드 중 오류 발생:", e);
  }
})();
