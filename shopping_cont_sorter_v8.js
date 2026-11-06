(async () => {
  const query = new URLSearchParams(location.search).get("query");

  if (!query) {
    alert("검색어를 찾지 못했습니다.");
    return;
  }

  const api = new URL(
    "https://gw-brandconnect.naver.com/affiliate/query/affiliate-products/search-by-query"
  );
  api.searchParams.set("query", query);
  api.searchParams.set("limit", "100");

  let res;
  try {
    res = await fetch(api, { credentials: "include" });
  } catch (error) {
    console.error("[쇼핑커넥트] 상품 API 연결 실패", error);
    alert("상품 API에 연결하지 못했습니다. F12 콘솔을 확인해 주세요.");
    return;
  }

  if (!res.ok) {
    alert(`상품 API 요청 실패 (HTTP ${res.status})`);
    return;
  }

  let json;
  try {
    json = await res.json();
  } catch (error) {
    console.error("[쇼핑커넥트] JSON 파싱 실패", error);
    alert("상품 API 응답을 JSON으로 읽을 수 없습니다.");
    return;
  }

  const items = json?.data;

  if (!Array.isArray(items)) {
    console.warn("[쇼핑커넥트] 응답 구조", {
      responseKeys: Object.keys(json ?? {}),
      dataKeys: items && typeof items === "object" ? Object.keys(items) : [],
      dataType: items === null ? "null" : typeof items
    });
    alert("상품 API 응답 형식이 예상과 다릅니다. F12 콘솔을 확인해 주세요.");
    return;
  }

  if (items.length === 0) {
    alert("상품 API가 빈 목록을 반환했습니다.");
    return;
  }

  try {
    const anchor = [...document.querySelectorAll("span")].find(element =>
      element.innerText?.replace(/\s+/g, "").includes("노출됩니다")
    );

    if (!anchor) {
      alert("쇼핑커넥트 상품찾기 검색 결과에서 실행해 주세요.");
      return;
    }

    const cards = [];

    document.querySelectorAll("li").forEach(card => {
      const text = card.innerText || "";
      const item = items.find(
        product => product?.productName && text.includes(product.productName)
      );

      if (!item) return;

      card.dataset.commission = item.commissionRate ?? 0;
      card.dataset.price = item.salePrice ?? 0;
      card.dataset.discount = item.discountRate ?? 0;
      cards.push(card);

      if (!item.productUrl || card.querySelector(".__product_url")) return;

      const box = document.createElement("div");
      box.className = "__product_url";
      box.style.cssText =
        "margin:6px 0;padding-bottom:4px;font-size:11px;color:#0a7;" +
        "border-bottom:1px dashed #ddd;word-break:break-all;";

      const link = document.createElement("a");
      link.href = item.productUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.style.cssText = "color:#0a7;text-decoration:none;";
      link.textContent = "🔗 " + item.productUrl;
      box.appendChild(link);

      const controls = card.querySelectorAll("button,[role='button'],a");
      const lastControl = controls[controls.length - 1];

      if (lastControl?.parentNode) {
        lastControl.parentNode.insertBefore(box, lastControl);
      } else {
        card.appendChild(box);
      }
    });

    if (cards.length === 0) {
      alert(`API 상품 ${items.length}개를 받았지만 화면에서 일치하는 카드를 찾지 못했습니다.`);
      return;
    }

    const container = anchor.parentElement;
    container.style.display = "flex";
    container.style.alignItems = "center";
    document.getElementById("bm-sort-panel")?.remove();

    const panel = document.createElement("div");
    panel.id = "bm-sort-panel";
    panel.style.cssText = "display:flex;gap:6px;margin-right:8px;";

    const makeButton = (label, key) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.dir = "desc";
      button.textContent = label + "↓";
      button.style.cssText =
        "padding:4px 8px;border:0;border-radius:4px;background:#ff7a00;" +
        "color:#fff;font-size:12px;cursor:pointer;white-space:nowrap;";

      button.onclick = () => {
        const isDescending = button.dataset.dir === "desc";
        const direction = isDescending ? 1 : -1;
        const sorted = [...cards].sort((a, b) =>
          direction * (parseFloat(b.dataset[key]) - parseFloat(a.dataset[key]))
        );

        sorted.forEach(card => card.parentElement?.appendChild(card));
        button.dataset.dir = isDescending ? "asc" : "desc";
        button.textContent = label + (isDescending ? "↓" : "↑");
      };

      return button;
    };

    panel.append(
      makeButton("수수료", "commission"),
      makeButton("가격", "price"),
      makeButton("할인율", "discount")
    );

    container.insertBefore(panel, anchor);
  } catch (error) {
    console.error("[쇼핑커넥트] 화면 처리 오류", error);
    alert("상품 화면을 처리하는 중 오류가 발생했습니다. F12 콘솔을 확인해 주세요.");
  }
})();
