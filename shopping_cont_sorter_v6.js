(async () => {
  /* 1. 데이터 매칭 로직 */
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

    /* 2. 상품 카드 처리 및 데이터 매칭 */
    document.querySelectorAll("li").forEach(function(card) {
      if (card.querySelector(".__product_url")) return;
      
      var text = card.innerText || "";
      var item = items.find(function(i) {
        return text.indexOf(i.productName) > -1;
      });

      if (!item || !item.productUrl) return;

      // 정렬을 위한 데이터 저장 (이후 업데이트를 위해 미리 심어둠)
      card.dataset.commission = item.commissionRate || 0;
      card.dataset.price = item.salePrice || 0;

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

    /* 3. [확장성] 사용자님이 나중에 버튼이나 정렬 기능을 추가하고 싶을 때 여기에 작성하면 즉시 배포됨 */
    console.log("쇼핑커넥트 툴 로드 완료");

  } catch (e) {
    console.error("데이터 로드 중 오류 발생:", e);
  }
})();
