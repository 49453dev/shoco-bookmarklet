/*
[수정된 통합 코드: 깃허브 업로드용]
- 기능: API 데이터 매칭 + 상품 카드 내 정보 표시 + 상단 정렬 버튼 생성
*/

(async () => {
  // 1. 검색어 추출
  const qs = new URLSearchParams(location.search);
  const query = qs.get("query");
  if (!query) {
    alert("검색어를 찾지 못했습니다. 검색 결과 페이지에서 실행해주세요.");
    return;
  }

  // 2. 기준 위치(Anchor) 찾기 및 패널 생성 공간 확보
  const anchor = [...document.querySelectorAll('span')]
    .find(e => e.innerText && e.innerText.replace(/\s+/g, '').includes('노출됩니다'));
  
  if (!anchor) {
    console.log("정렬 버튼을 배치할 기준 위치를 찾지 못해 상단에 고정합니다.");
  }

  // 3. 브랜드커넥트 API 데이터 호출
  const api = "https://gw-brandconnect.naver.com/affiliate/query/affiliate-products/search-by-query?query=" + encodeURIComponent(query) + "&limit=100";
  
  try {
    const res = await fetch(api, { credentials: "include" });
    const json = await res.json();
    const items = (json && json.data) ? json.data : [];
    
    if (!items.length) {
      alert("매칭할 상품 데이터가 없습니다.");
      return;
    }

    // 4. 상품 카드 매칭 및 데이터 주입
    const cards = [];
    document.querySelectorAll("li").forEach(card => {
      const text = card.innerText || "";
      const item = items.find(i => text.indexOf(i.productName) > -1);
      
      if (item) {
        // 정렬을 위한 데이터 속성 부여
        card.dataset.commission = item.commissionRate || 0;
        card.dataset.price = item.salePrice || 0;
        card.dataset.name = item.productName;
        cards.push(card);

        // UI 표시 (중복 생성 방지)
        if (!card.querySelector(".__added_info")) {
          const infoBox = document.createElement("div");
          infoBox.className = "__added_info";
          infoBox.style.cssText = "margin:6px 0;padding:4px;font-size:11px;background:#f9f9f9;border-radius:4px;border:1px solid #eee;";
          
          infoBox.innerHTML = `
            <div style="color:#ff7a00;font-weight:bold;">수수료: ${item.commissionRate}%</div>
            <a href="${item.productUrl}" target="_blank" style="color:#0a7;text-decoration:none;word-break:break-all;">[상품링크 이동]</a>
          `;
          
          const buttons = card.querySelectorAll("button, a");
          if (buttons.length > 0) {
            buttons[buttons.length - 1].parentNode.insertBefore(infoBox, buttons[buttons.length - 1]);
          } else {
            card.appendChild(infoBox);
          }
        }
      }
    });

    // 5. 정렬 버튼 패널 생성
    document.getElementById('bm-sort-panel')?.remove();
    const panel = document.createElement('div');
    panel.id = 'bm-sort-panel';
    panel.style.cssText = 'display:flex;gap:8px;padding:10px;background:#fff;border-bottom:2px solid #ff7a00;margin-bottom:10px;';

    const sortCards = (type, btn) => {
      const isDesc = btn.dataset.dir !== 'asc';
      btn.dataset.dir = isDesc ? 'asc' : 'desc';
      btn.innerText = (type === 'comm' ? '수수료 ' : '가격 ') + (isDesc ? '↑' : '↓');
      
      const sorted = [...cards].sort((a, b) => {
        const valA = parseFloat(type === 'comm' ? a.dataset.commission : a.dataset.price);
        const valB = parseFloat(type === 'comm' ? b.dataset.commission : b.dataset.price);
        return isDesc ? valB - valA : valA - valB;
      });

      const container = cards[0].parentElement;
      sorted.forEach(el => container.appendChild(el));
    };

    const commBtn = document.createElement('button');
    commBtn.innerText = '수수료순';
    commBtn.style.cssText = 'padding:6px 12px;border:0;border-radius:4px;background:#ff7a00;color:#fff;cursor:pointer;';
    commBtn.onclick = () => sortCards('comm', commBtn);

    const priceBtn = document.createElement('button');
    priceBtn.innerText = '가격순';
    priceBtn.style.cssText = 'padding:6px 12px;border:0;border-radius:4px;background:#333;color:#fff;cursor:pointer;';
    priceBtn.onclick = () => sortCards('price', priceBtn);

    panel.appendChild(commBtn);
    panel.appendChild(priceBtn);

    if (anchor) {
      anchor.parentElement.insertBefore(panel, anchor);
    } else {
      document.body.prepend(panel);
    }

  } catch (e) {
    console.error("데이터 로드 중 오류 발생:", e);
    alert("데이터를 가져오는 중 오류가 발생했습니다.");
  }
})();
