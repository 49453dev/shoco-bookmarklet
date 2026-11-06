(() => {
  const panelId = "bm-sort-panel";
  document.getElementById(panelId)?.remove();

  const fields = {
    commission: "수수료",
    price: "가격",
    discount: "할인율"
  };

  const number = value => Number(value.replace(/,/g, ""));

  const readCard = card => {
    const text = (card.innerText || "").replace(/[ \t\u00a0]+/g, " ");

    const commission = text.match(
      /(?:수수료율|수수료|커미션)\s*[:：]?\s*(\d+(?:\.\d+)?)\s*%/
    );

    // 할인율 문구가 없으면 가격 바로 앞에 표시된 퍼센트를 확인합니다./
    const discount = text.match(
      /할인(?:율)?\s*[:：]?\s*(\d+(?:\.\d+)?)\s*%/
    ) ?? text.match(
      /(?:^|\n)\s*(\d+(?:\.\d+)?)\s*%\s*(?:\n\s*)?[\d,]+\s*원/
    );

    const labeledPrice = text.match(
      /(?:할인\s*적용가|할인가|최종\s*판매가|판매가)\s*[:：]?\s*([\d,]+)\s*원/
    );

    const visiblePrices = [...text.matchAll(/(\d[\d,]*)\s*원/g)]
      .map(match => number(match[1]));

    // 라벨이 없는 가격이 여러 개면 판매가를 추측하지 않습니다.
    const price = labeledPrice
      ? number(labeledPrice[1])
      : visiblePrices.length === 1
        ? visiblePrices[0]
        : null;

    return {
      card,
      commission: commission ? number(commission[1]) : null,
      price,
      discount: discount ? number(discount[1]) : null,
      hasPrice: visiblePrices.length > 0
    };
  };

  const collectGroups = () => {
    const matches = [...document.querySelectorAll('li,[role="listitem"]')]
      .filter(card => card.getClientRects().length)
      .map(readCard)
      .filter(item =>
        item.hasPrice && (item.commission !== null || item.discount !== null)
      );

    const groups = new Map();

    for (const item of matches) {
      const { card } = item;

      // 목록 전체를 감싸는 상위 항목은 제외합니다.
      if (matches.some(other => other.card !== card && card.contains(other.card))) {
        continue;
      }

      const parent = card.parentElement;
      if (!parent) continue;

      if (!groups.has(parent)) groups.set(parent, []);
      groups.get(parent).push(item);
    }

    return [...groups.values()].filter(group => group.length >= 2);
  };

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
    "background:#fff",
    "color:#222",
    "border:1px solid #ddd",
    "border-radius:8px",
    "box-shadow:0 2px 8px #0002",
    "font-size:12px"
  ].join(";");

  const status = document.createElement("span");

  const makeButton = (label, onClick) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.style.cssText =
      "padding:5px 8px;border:0;border-radius:4px;background:#ff7a00;" +
      "color:#fff;font-size:12px;cursor:pointer;white-space:nowrap;";
    button.addEventListener("click", onClick);
    return button;
  };

  panel.append(status);

  for (const [key, label] of Object.entries(fields)) {
    let descending = true;

    const button = makeButton(`${label} ↓`, () => {
      const groups = collectGroups();
      let sortedCount = 0;

      for (const group of groups) {
        // 값이 확인된 카드끼리만 위치를 바꿉니다.
        const sortable = group.filter(item => Number.isFinite(item[key]));
        if (sortable.length < 2) continue;

        const sorted = [...sortable].sort((a, b) =>
          descending ? b[key] - a[key] : a[key] - b[key]
        );

        const slots = sortable.map(({ card }) => {
          const slot = document.createComment("shopping-connect-sort");
          card.before(slot);
          return slot;
        });

        slots.forEach((slot, index) => slot.replaceWith(sorted[index].card));
        sortedCount += sortable.length;
      }

      if (!sortedCount) {
        status.textContent = `정렬할 ${label} 값이 있는 카드가 부족합니다.`;
        return;
      }

      status.textContent =
        `${label} ${descending ? "높은 순" : "낮은 순"} · ${sortedCount}개`;
      descending = !descending;
      button.textContent = `${label} ${descending ? "↓" : "↑"}`;
    });

    panel.append(button);
  }

  panel.append(makeButton("닫기", () => panel.remove()));
  document.body.appendChild(panel);

  const count = collectGroups().reduce((sum, group) => sum + group.length, 0);
  status.textContent = `감지된 상품 ${count}개`;
})();
