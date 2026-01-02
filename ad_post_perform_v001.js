(async function() {
  let pubId = '';
  try {
    const resources = performance.getEntriesByType("resource");
    for (const res of resources) {
      const match = res.name.match(/publisherId=(\d+)/);
      if (match) { pubId = match[1]; break; }
    }
    
    if (!pubId) {
      const bodyText = document.documentElement.innerHTML;
      const textMatch = bodyText.match(/publisherId=(\d+)/) || bodyText.match(/"publisherId"\s*:\s*"(\d+)"/);
      if (textMatch) pubId = textMatch[1];
    }
  } catch(e) { console.error("ID 추출 중 오류:", e); }

  if (!pubId) {
    alert('사용자 식별 번호를 찾을 수 없습니다. 페이지 새로고침(F5) 후 1~2초 뒤에 다시 실행해 주세요.');
    return;
  }

  const brandColor = '#63A1FF';
  const today = new Date();
  
  let monthOptions = '';
  for(let i=0; i<36; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const val = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    const label = d.getFullYear() + '년 ' + (d.getMonth() + 1) + '월';
    monthOptions += `<option value="${val}">${label}</option>`;
  }

  const newWin = window.open('', '_blank');
  const css = `
    body{font-family:"Pretendard",sans-serif;background:#050505;color:#fff;padding:40px;margin:0;position:relative}
    .easter-egg {position:fixed; top:15px; left:15px; font-size:11px; color:#333; text-decoration:none; z-index:9999;}
    .easter-egg:hover {color:${brandColor}; text-shadow:0 0 10px ${brandColor}; cursor:pointer;}
    .header-area{display:flex; flex-direction:column; align-items:center; margin-bottom:40px;}
    .nav-box{margin-bottom:20px; display:flex; gap:10px; align-items:center;}
    select{background:#111; color:#fff; border:1px solid #333; padding:10px 15px; border-radius:8px; font-size:15px; outline:none; cursor:pointer; min-width: 180px; text-align: center;}
    h1{text-align:center; font-size:32px; margin:0 0 25px 0; letter-spacing:1px; font-weight:200; text-transform: uppercase;}
    h1 span {color:${brandColor}; font-weight:700; text-shadow: 0 0 15px rgba(99, 161, 255, 0.5);}
    .container{display:flex;flex-direction:row;gap:20px;justify-content:center;align-items:flex-start;overflow-x:auto;padding-bottom:40px}
    .month-box{background:#111;border:1px solid #222;border-radius:18px;padding:20px;min-width:300px;box-shadow:0 10px 40px rgba(0,0,0,0.8)}
    .month-title{text-align:center;font-size:18px;margin-bottom:20px;color:#fff;font-weight:500}
    .grid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}
    .h{color:#555;font-size:10px;padding:8px;text-align:center;font-weight:600;}
    .d{min-height:100px;padding:8px;background:#181818;border:1px solid #252525;border-radius:8px;display:flex;flex-direction:column;gap:4px;transition:0.3s}
    .d:hover{border-color:${brandColor}; transform:translateY(-3px); box-shadow:0 0 15px rgba(99,161,255,0.2);}
    .date{font-size:11px;color:#444;font-weight:600;}
    .row{display:flex; flex-direction:column; align-items:flex-end; gap:2px;}
    .amt{font-size:15px; font-weight:300; color:${brandColor}; text-shadow:0 0 8px rgba(99,161,255,0.3);}
    .unit{font-size:10px; opacity:0.7; margin-right:2px;}
    .stat{font-size:10px; color:#777; text-align:right;}
    .stat-val{color:#aaa;}
    .sat .date{color:#4d8dff} .sun .date{color:#ff4d4d} .empty{background:transparent;border:none}
    #loadBtn{padding:10px 25px; background:${brandColor}; color:#000; border:none; border-radius:8px; cursor:pointer; font-weight:700;}
  `;

  let html = `<html><head><meta charset="utf-8"><style>${css}</style></head><body>
    <a href="https://www.threads.net/@49453" target="_blank" class="easter-egg">made by 49453@thread</a>
    <div class="header-area">
      <h1><span>AdPost</span> Performance</h1>
      <div class="nav-box">
        <select id="monthSelect">${monthOptions}</select>
        <button id="loadBtn">데이터 조회</button>
      </div>
    </div>
    <div id="calendarContainer" class="container"></div>
    <script>
      const pubId = "${pubId}";
      const container = document.getElementById('calendarContainer');
      const select = document.getElementById('monthSelect');
      const btn = document.getElementById('loadBtn');

      async function fetchAdPost(y, m) {
        const start = new Date(y, m - 1, 1);
        const end = new Date(y, m, 0);
        const f = (d) => d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
        try {
          const res = await fetch("https://adpost.naver.com/api/report/revenue?startDate=" + f(start) + "&endDate=" + f(end) + "&publisherId=" + pubId + "&clipRequired=true");
          const raw = await res.json();
          const map = {};
          raw.forEach(item => {
            const ds = item.date.replace(/(\\d{4})(\\d{2})(\\d{2})/, '$1-$2-$3');
            if(!map[ds]) map[ds] = {rev:0, clk:0, view:0};
            map[ds].rev += item.revenueAmount;
            map[ds].clk += item.clickCount;
            map[ds].view += item.impressionCount;
          });
          return map;
        } catch (e) { return {}; }
      }

      function generateMonthHtml(year, month, dataMap) {
        const first = new Date(year, month - 1, 1);
        const last = new Date(year, month, 0);
        let h = '<div class="month-box"><div class="month-title">' + year + '.' + String(month).padStart(2, "0") + '</div><div class="grid">';
        ['S','M','T','W','T','F','S'].forEach(w => h += '<div class="h">' + w + '</div>');
        for(let i=0; i<first.getDay(); i++) h += '<div class="d empty"></div>';
        for(let day=1; day<=last.getDate(); day++) {
          const dObj = new Date(year, month - 1, day);
          const dStr = year + "-" + String(month).padStart(2, "0") + "-" + String(day).padStart(2, "0");
          const info = dataMap[dStr];
          const dayType = dObj.getDay() === 6 ? "sat" : (dObj.getDay() === 0 ? "sun" : "");
          let inner = info ? '<div class="row"><div class="amt"><span class="unit">₩</span>' + Math.floor(info.rev).toLocaleString() + '</div><div class="stat">c: <span class="stat-val">' + info.clk + '</span></div><div class="stat">v: <span class="stat-val">' + info.view.toLocaleString() + '</span></div></div>' : "";
          h += '<div class="d ' + dayType + '"><div class="date">' + day + '</div>' + inner + '</div>';
        }
        return h + '</div></div>';
      }

      async function render(selectedMonthStr) {
        container.innerHTML = "데이터를 불러오는 중...";
        const [y, m] = selectedMonthStr.split("-").map(Number);
        const targetMonths = [new Date(y, m - 3, 1), new Date(y, m - 2, 1), new Date(y, m - 1, 1)];
        let fullHtml = "";
        for (const targetDate of targetMonths) {
          const ty = targetDate.getFullYear();
          const tm = targetDate.getMonth() + 1;
          const dataMap = await fetchAdPost(ty, tm);
          fullHtml += generateMonthHtml(ty, tm, dataMap);
        }
        container.innerHTML = fullHtml;
      }

      btn.addEventListener("click", () => render(select.value));
      render(select.value);
    </script>
  </body></html>`;

  newWin.document.write(html);
  newWin.document.close();
})();
