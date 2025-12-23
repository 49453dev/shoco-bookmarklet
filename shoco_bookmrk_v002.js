(() => {
  /* ===============================
     META
     =============================== */
  const VERSION = "v1.0.3";
  const BUILD_DATE = "20251223";

  /* ===============================
     CONFIG
     =============================== */
  const BANNER_WIDTH = 760;
  const IMG_SIZE = 300;
  const NAME_WORD_LIMIT = 10;

  const FONT_STACK =
    '-apple-system,BlinkMacSystemFont,"Segoe UI","Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",Arial,sans-serif';

  /* ===============================
     UTIL
     =============================== */
  const clean = s => (s || "").replace(/\s+/g, " ").trim();

  const limitWords = s => {
    const t = clean(s);
    if (!t) return "";
    const words = t.split(" ");
    return (words.length > NAME_WORD_LIMIT
      ? words.slice(0, NAME_WORD_LIMIT)
      : words
    ).join(" ");
  };

  const ensureWon = s => {
    if (!s) return "";
    return /원$/.test(s) ? s : `${s}원`;
  };

  /* ===============================
     SELECT PRODUCT LIST
     =============================== */
  const listItems = [
    ...document.querySelectorAll(
      "div.ProductSearchResult_section__poTKw ul > li"
    )
  ];

  if (!listItems.length) {
    alert("쇼핑커넥트 상품 카드(li)를 찾지 못했습니다.");
    return;
  }

  /* ===============================
     EXTRACT DATA
     =============================== */
  const items = [];

  listItems.forEach(li => {
    const img = li.querySelector("img");
    const info = li.querySelector("div.ProductItem_info_wrap__7YDVd");

    if (!img || !info) return;

    const originEl = info.querySelector(
      "span.ProductItem_price_wrap__KALw2 > del"
    );
    const rateEl = info.querySelector(
      "span.ProductItem_price_wrap__KALw2 > ins > strong.ProductItem_discount_rate__sDmkV"
    );
    const saleEl = info.querySelector(
      "span.ProductItem_price_wrap__KALw2 > ins > strong:nth-child(3)"
    );

    let salePrice = "";
    if (saleEl) {
      salePrice = ensureWon(clean(saleEl.textContent));
    } else {
      const normalPriceEl = info.querySelector(
        "span.ProductItem_price_wrap__KALw2 > span"
      );
      if (normalPriceEl) {
        salePrice = ensureWon(clean(normalPriceEl.textContent));
      }
    }

    const storeTextEl = info.querySelector(
      "span.ProductItem_name_wrap__ydO6F > span.ProductItem_brand_name__4elwS > span"
    );
    const storeIconEl = info.querySelector(
      "span.ProductItem_name_wrap__ydO6F > span.ProductItem_brand_icon__L8_dZ > img"
    );

    const titleEl = [...info.querySelectorAll("*")]
      .filter(
        el =>
          el.children.length === 0 &&
          !/원|%/.test(el.textContent || "")
      )
      .sort(
        (a, b) =>
          (b.textContent || "").length -
          (a.textContent || "").length
      )[0];

    items.push({
      img: img.currentSrc || img.src,
      origin: originEl ? clean(originEl.textContent) : "",
      rate: rateEl ? clean(rateEl.textContent) : "",
      sale: salePrice,
      title: titleEl ? limitWords(titleEl.textContent) : "",
      store: storeTextEl ? clean(storeTextEl.textContent) : "",
      brandIcon: storeIconEl ? storeIconEl.src : ""
    });
  });

  if (!items.length) {
    alert("상품 정보 추출 실패");
    return;
  }

  /* ===============================
     OPEN WINDOW
     =============================== */
  const w = window.open("about:blank", "_blank");
  if (!w) {
    alert("팝업 차단을 해제해주세요.");
    return;
  }

  /* ===============================
     RENDER HTML
     =============================== */
  w.document.open();
  w.document.write(`<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>쇼핑커넥트 배너</title>
<style>
body{
  margin:0;
  padding:32px;
  background:#f5f6f8;
  font-family:${FONT_STACK};
}
.list{
  max-width:980px;
  margin:0 auto;
  display:flex;
  flex-direction:column;
  gap:16px;
}
.banner{
  width:${BANNER_WIDTH}px;
  background:#fff;
  border-radius:16px;
  padding:32px;
  display:flex;
  gap:32px;
  box-sizing:border-box;
}
.thumb{
  width:${IMG_SIZE}px;
  height:${IMG_SIZE}px;
  object-fit:cover;
  border-radius:12px;
  flex:0 0 ${IMG_SIZE}px;
}
.info{
  display:flex;
  flex-direction:column;
}
.price-origin{
  font-size:22px;
  color:#9aa0a6;
  text-decoration:line-through;
  margin-bottom:4px;
}
.price-row{
  display:flex;
  align-items:baseline;
  margin-bottom:10px;
}
.price-rate{
  font-size:22px;
  font-weight:700;
  color:#ff3b30;
  margin-right:8px;
}
.price-sale{
  font-size:30px;
  font-weight:700;
  color:#111;
  line-height:1.25;
}
.price-sale .price-won{
  font-size:.85em;
  font-weight:600;
}
.title{
  font-size:22px;
  font-weight:600;
  color:#202124;
  line-height:1.45;
  word-break:keep-all;
}
.store{
  margin-top:6px;
  font-size:20px;
  font-weight:500;
  color:#5f6368;
  display:flex;
  align-items:center;
  gap:6px;
}
.store img.brand-icon{
  width:16px;
  height:16px;
  object-fit:contain;
}


.easter-egg{
  position:fixed;
  left:12px;
  top:8px;
  font-size:11px;
  color:#b0b5bb;
  opacity:.6;
  user-select:none;
  pointer-events:none;
}


.easter-egg a{
  margin-left:6px;
  font-size:11px;
  color:#b0b5bb;
  text-decoration:none;
  opacity:.5;
  pointer-events:auto;
}
.easter-egg a:hover{
  opacity:1;
  text-decoration:underline;
}



</style>
</head>


<body>
  <div class="list" id="list"></div>
  <div class="easter-egg">
    🥚 made by 49453 · ${VERSION} · (${BUILD_DATE})
    <a href="https://open.kakao.com/o/xxxx" target="_blank">쇼핑커넥트 공부하는 사람들</a>
  </div>
</body>



</html>`);
  w.document.close();

  /* ===============================
     FILL DATA
     =============================== */
  const doc = w.document;
  const list = doc.getElementById("list");

  items.forEach(item => {
    const div = doc.createElement("div");
    div.className = "banner";

    div.innerHTML = `
      <img class="thumb" src="${item.img}">
      <div class="info">
        ${
          item.origin && item.rate
            ? `<div class="price-origin">${item.origin}</div>`
            : ""
        }
        <div class="price-row">
          ${
            item.rate
              ? `<span class="price-rate">${item.rate}</span>`
              : ""
          }
          ${
            item.sale
              ? `<span class="price-sale">
                   <span class="price-num">${item.sale.replace(/원$/, "")}</span>
                   <span class="price-won">원</span>
                 </span>`
              : ""
          }
        </div>
        ${item.title ? `<div class="title">${item.title}</div>` : ""}
        ${
          item.store
            ? `<div class="store">
                 ${
                   item.brandIcon
                     ? `<img class="brand-icon" src="${item.brandIcon}">`
                     : ""
                 }
                 <span>${item.store}</span>
               </div>`
            : ""
        }
      </div>
    `;

    list.appendChild(div);
  });

})();
