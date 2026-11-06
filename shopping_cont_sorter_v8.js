(async () => {
  const query = new URLSearchParams(location.search).get("query")?.trim();

  if (!query) {
    alert("검색어를 찾지 못했습니다. 쇼핑커넥트 상품 검색 결과에서 실행해 주세요.");
    return;
  }

  const panelId = "bm-sort-panel";
  document.getElementById(panelId)?.remove();

  const panel = document.createElement("div");
  panel.id = panelId;
  panel.style.cssText = [
    "position:fixed",
    "top:80px",
    "right:16px",
    "z-index:2147483647",
    "display:flex",
    "align-items:center",
    "gap:6px",
    "padding:8px",
    "background:white",
    "border:1px solid #ddd",
    "border-radius:8px",
    "box-shadow:0 2px 8px #0002",
    "font-size:12px"
  ].join(";");

  const status = document.createElement("span");
  status.textContent = "상품 불러오는 중…";

  const close = document.createElement("button");
  close.type = "button";
  close.textContent = "닫기";
  close.onclick = () => panel.remove();

  panel.append(status, close);
  document.body.appendChild(panel);

  const api = new URL(
    "https://gw-brandconnect.naver.com/affiliate/query/affiliate-products/search-by-query"
  );
  api.searchParams.set("query", query);
  api.searchParams.set("limit", "100");

  const normalize = text => text.replace(/\s+/g, "").trim();

  try {
    const response = await fetch(api, { credentials: "include" });

    if (!response.ok) {
      status.textContent = `상품 API 오류 (HTTP ${response.status})`;
      return;
    }

    const json = await response.json();

    if (!Array.isArray(json?.data)) {
      status.textContent = "상품 API 응답 형식이 다릅니다.";
      console.warn("[쇼핑커넥트] 응답 필드", Object.keys(json ?? {}));
      return;
    }

    const items = json.data;

    if (!items.length) {
      status.textContent = "상품 API가 빈 목록을 반환했습니다.";
      return;
    }

    const products = items
      .filter(item => typeof item?.productName === "string")
      .map(item => ({ item, name: normalize(item.productName) }))
      .filter(product => product.name)
      .sort((a, b) => b.name.length - a.name.length);

    const matches = [];

    for (const card of document.querySelectorAll("li")) {
      if (!card.getClientRects().length) continue;

      const text = normalize(card.innerText || "");
      const product = products.find(({ name }) => text.includes(name));

      if (product) matches.push({ card, item: product.item });
    }

    // 중첩 목록에서는 상품명에 일치한 가장 안쪽 li를 사용합니다.
    const cards = matches.filter(({ card }) =>
      !matches.some(other => other.card !== card && card.contains(other.card))
    );

    if (!cards.length) {
      status.textContent = `API ${items.length}개 · 화면 매칭 0개`;
      console.warn("[쇼핑커넥트] 상품 카드 매칭 실패", {
        apiItems: items.length,
        liCount: document.querySelectorAll("li").length,
        sampleProductName: items[0]?.productName
      });
      return;
    }

    for (const { card, item } of cards) {
      card.dataset.commission = item.commissionRate ?? 0;
      card.dataset.price = item.discountedSalePrice ?? item.salePrice ?? 0;
      card.dataset.discount = item.discountedRate ?? 0;

      if (typeof item.productUrl !== "string") continue;

      let url;
      try {
        url = new URL(item.productUrl);
      } catch {
        continue;
      }
      if (url.protocol !== "https:" && url.protocol !== "http:") continue;

      let box = card.querySelector(".__product_url");

      if (!box) {
        box = document.createElement("div");
        box.className = "__product_url";
        box.style.cssText =
          "margin:6px 0;padding-bottom:4px;font-size:11px;" +
          "border-bottom:1px dashed #ddd;overflow-wrap:anywhere;";
        card.appendChild(box);
      }

      const link = document.createElement("a");
      link.href = url.href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.style.cssText = "color:#087;text-decoration:none;";
      link.textContent = "🔗 " + url.href;
      box.replaceChildren(link);
    }

    const makeButton = (label, key) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = `${label} ↓`;
      button.style.cssText =
        "padding:4px 8px;border:0;border-radius:4px;background:#ff7a00;" +
        "color:#fff;font-size:12px;cursor:pointer;white-space:nowrap;";

      let descending = true;

      button.onclick = () => {
        const byParent = new Map();

        for (const { card } of cards) {
          const parent = card.parentElement;
          if (!parent || !card.isConnected) continue;

          if (!byParent.has(parent)) byParent.set(parent, new Set());
          byParent.get(parent).add(card);
        }

        for (const [parent, group] of byParent) {
          // 매칭된 카드끼리만 순서를 바꾸고, 다른 항목의 위치는 유지합니다.
          const current = [...parent.children].filter(card => group.has(card));
          const direction = descending ? -1 : 1;
          const sorted = [...current].sort((a, b) =>
            direction * (Number(a.dataset[key]) - Number(b.dataset[key]))
          );

          const slots = current.map(card => {
            const slot = document.createComment("shopping-connect-sort");
            card.before(slot);
            return slot;
          });

          slots.forEach((slot, index) => slot.replaceWith(sorted[index]));
        }

        status.textContent = `${label} ${descending ? "높은 순" : "낮은 순"}`;
        descending = !descending;
        button.textContent = `${label} ${descending ? "↓" : "↑"}`;
      };

      return button;
    };

    status.textContent = `상품 ${cards.length}개`;
    close.before(
      makeButton("수수료", "commission"),
      makeButton("가격", "price"),
      makeButton("할인율", "discount")
    );
  } catch (error) {
    status.textContent = "상품 처리 실패 · F12 콘솔 확인";
    console.error("[쇼핑커넥트] 실행 오류", error);
  }
})();
