(async () => {
  /* [1] 데이터 호출 및 매칭 로직 */
  const qs = new URLSearchParams(location.search);
  const query = qs.get("query");
  if (!query) {
    alert("검색어를 찾지 못했습니다");
    return;
  }

  const api = "https://gw-brandconnect.naver.com/affiliate/query/affiliate-products/search-by-query?query=" + encodeURIComponent(query) + "&limit=100";
  
  try {
    const res = await fetch(api, { credentials: "include" });
    const json = await res.json();
    const items = (json && json.data) ? json.data : [];
    
    if (!items.length) {
      alert("상품 데이터 없음");
      return;
    }

    /* [2] 기준 문구(anchor) 찾기 및 패널 준비 */
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

    /* [3] 카드 수집 및 데이터 주입 */
    const cards = [];
    document.querySelectorAll("li").forEach(card => {
      const text = card.innerText || "";
      const item = items.find(i => text.indexOf(i.productName) > -1);
      
      if (item) {
        // 정렬을 위한 정확한 수치 주입 (텍스트 파싱보다 정확함)
        card.dataset.commission = item.commissionRate || 0;
        card.dataset.price = item.salePrice || 0;
        card.dataset.discount = item.discountRate || 0;
        cards.push(card);

        // 상품 링크 박스 생성
        if (!card.querySelector(".__product_url")) {
          const box = document.createElement("div");
          box.className = "__product_url";
          box.style.cssText = "margin:6px 0;padding-bottom:4px;font-size:11px;color:#0a7;border-bottom:1px dashed #ddd;word-break:break-all;";
          const a = document.createElement("a");
          a.href = item.productUrl;
          a.target = "_blank";
          a.style.cssText = "color:#0a7;text-decoration:none;";
          a.innerText = "🔗 " + item.productUrl;
          box.appendChild(a);
          
          const btns = card.querySelectorAll("button,[role='button'],a");
          if (btns.length > 0 && btns[btns.length - 1].parentNode) {
            btns[btns.length - 1].parentNode.insertBefore(box, btns[btns.length - 1]);
          } else {
            card.appendChild(box);
          }
        }
      }
    });

    if (!cards.length) return;

    /* [4] 정렬 버튼 생성 */
    const panel = document.createElement('div');
    panel.id = 'bm-sort-panel';
    panel.style.cssText = 'display:flex;gap:6px;margin-right:8px';

    const apply = list => list.forEach(el => el.parentElement && el.parentElement.appendChild(el));

    const makeBtn = (label, key) => {
      const b = document.createElement('button');
      b.dataset.dir = 'desc';
      b.innerText = label + '↓';
      b.style.cssText = 'padding:4px 8px;border:0;border-radius:4px;background:#ff7a00;color:#fff;font-size:12px;cursor:pointer;white-space:nowrap';

      b.onclick = () => {
        const isDesc = b.dataset.dir === 'desc';
        const dir = isDesc ? 1 : -1;
        b.dataset.dir = isDesc ? 'asc' : 'desc';
        b.innerText = label + (isDesc ? '↓' : '↑');
        
        const sorted = [...cards].sort((a, c) => {
          return dir * (parseFloat(c.dataset[key]) - parseFloat(a.dataset[key]));
        });
        apply(sorted);
      };
      return b;
    };

    panel.appendChild(makeBtn('수수료', 'commission'));
    panel.appendChild(makeBtn('가격', 'price'));
    panel.appendChild(makeBtn('할인율', 'discount'));

    container.insertBefore(panel, anchor);

  } catch (e) {
    console.error("실행 오류:", e);
  }
})();
