(async function() {
  const sid = location.pathname.split('/')[1];
  if (!sid || isNaN(sid)) {
    alert('브랜드커넥트 대시보드 페이지에서 실행해 주세요.');
    return;
  }

  const brandColor = '#FF8329';
  const today = new Date();
  
  let monthOptions = '';
  for(let i=0; i<36; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const val = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    const label = `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
    monthOptions += `<option value="${val}">${label}</option>`;
  }

  const newWin = window.open('', '_blank');
  
  let html = `<html><head><style>
    body{font-family:"Pretendard", "Segoe UI", Roboto, sans-serif;background:#0a0a0a;color:#fff;padding:40px;margin:0}
    .header-area{display:flex; flex-direction:column; align-items:center; margin-bottom:40px;}
    .nav-box{margin-bottom:20px; display:flex; gap:10px; align-items:center;}
    select{
      background:#1a1a1a; color:#fff; border:1px solid #333; padding:10px 15px; 
      border-radius:8px; font-size:15px; outline:none; cursor:pointer;
      appearance: none; -webkit-appearance: none; min-width: 180px; text-align: center;
    }
    h1{
      text-align:center; font-size:36px; margin:0 0 25px 0; letter-spacing:-0.5px;
      color:#fff; font-weight:200; text-transform: uppercase;
    }
    h1 span {
      color:${brandColor}; font-weight:600;
      text-shadow: 0 0 15px rgba(255, 131, 41, 0.4);
    }
    .container{display:flex;flex-direction:row;gap:20px;justify-content:center;align-items:flex-start;overflow-x:auto;padding-bottom:40px}
    .month-box{background:#1a1a1a;border:1px solid #333;border-radius:15px;padding:15px;min-width:280px;box-shadow:0 10px 30px rgba(0,0,0,0.5)}
    .month-title{text-align:center;font-size:18px;margin-bottom:15px;color:#fff;letter-spacing:1px;font-weight:400}
    .grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
    .h{color:#666;font-size:10px;padding:5px;text-align:center;text-transform:uppercase;letter-spacing:1px}
    .d{min-height:60px;padding:6px;background:#222;border-radius:6px;display:flex;flex-direction:column;justify-content:space-between;transition:0.3s}
    .date{font-size:11px;color:#555;font-weight:400}
    .amt{font-size:13px;font-weight:300;color:#00ff95;text-align:right;text-shadow:0 0 5px rgba(0,255,149,0.4)}
    .unit{font-size:10px; opacity:0.7; margin-right:1px; font-weight:400}
    .amt.minus{color:#ff3b30; text-shadow:0 0 5px rgba(255,59,48,0.4)}
    .acc{font-size:9px;color:#00d9ff;text-align:right;opacity:0.6}
    .sat .date{color:#00d9ff} .sun .date{color:#ff3b30} .empty{background:transparent;border:none}
    #loadBtn{
      padding:10px 20px; background:${brandColor}; color:#fff; border:none; 
      border-radius:8px; cursor:pointer; font-weight:600; transition: 0.2s;
    }
    #loadBtn:hover{ opacity: 0.8; }
  </style></head><body>
    <div class="header-area">
      <h1><span>Shopping Connect</span> Performance</h1>
      <div class="nav-box">
        <select id="monthSelect">${monthOptions}</select>
        <button id="loadBtn">데이터 조회</button>
      </div>
    </div>
    <div id="calendarContainer" class="container"></div>
    <script>
      const sid = "${sid}";
      const container = document.getElementById('calendarContainer');
      const select = document.getElementById('monthSelect');
      const btn = document.getElementById('loadBtn');

      async function fetchPerformance(dateStr) {
        try {
          const res = await fetch(\`https://gw-brandconnect.naver.com/affiliate/query/sales-performance/summary?date=\${dateStr}&salesPeriod=LAST_30_DAYS\`, {
            headers: { 'x-space-id': sid },
            credentials: 'include'
          });
          const json = await res.json();
          return (json.data && json.data.chart) || json.chart || [];
        } catch (e) { return []; }
      }

      function generateMonthHtml(year, month, dataMap) {
        const first = new Date(year, month - 1, 1);
        const last = new Date(year, month, 0);
        let html = \`<div class="month-box"><div class="month-title">\${year}.\${String(month).padStart(2, '0')}</div><div class="grid">\`;
        ['S','M','T','W','T','F','S'].forEach(w => html += \`<div class="h">\${w}</div>\`);
        for(let i=0; i<first.getDay(); i++) html += '<div class="d empty"></div>';
        for(let day=1; day<=last.getDate(); day++) {
          const dObj = new Date(year, month - 1, day);
          const dStr = \`\${year}-\${String(month).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
          const info = dataMap[dStr];
          const dayType = dObj.getDay() === 6 ? 'sat' : (dObj.getDay() === 0 ? 'sun' : '');
          let amtHtml = '';
          if(info) {
            const isMinus = info.salesAmount < 0;
            const amtClass = isMinus ? 'amt minus' : 'amt';
            amtHtml = \`<div class="\${amtClass}"><span class="unit">₩</span>\${Math.floor(info.salesAmount).toLocaleString()}</div><div class="acc">\${info.accessCnt}v</div>\`;
          }
          html += \`<div class="d \${dayType}"><div class="date">\${day}</div>\${amtHtml}</div>\`;
        }
        html += '</div></div>';
        return html;
      }

      async function render(selectedMonthStr) {
        container.innerHTML = '데이터를 분석 중입니다...';
        const [y, m] = selectedMonthStr.split('-').map(Number);
        const monthsToRender = [
          new Date(y, m - 3, 1),
          new Date(y, m - 2, 1),
          new Date(y, m - 1, 1)
        ];

        let fullHtml = '';
        for (const targetDate of monthsToRender) {
          const ty = targetDate.getFullYear();
          const tm = targetDate.getMonth() + 1;
          const lastDay = new Date(ty, tm, 0).getDate();
          const requestDate = \`\${ty}-\${String(tm).padStart(2, '0')}-\${String(lastDay).padStart(2, '0')}\`;
          
          const chartData = await fetchPerformance(requestDate);
          const dataMap = {};
          chartData.forEach(item => { dataMap[item.startDate] = item; });
          
          fullHtml += generateMonthHtml(ty, tm, dataMap);
        }
        container.innerHTML = fullHtml;
      }

      btn.addEventListener('click', () => render(select.value));
      render(select.value);
    </script>
  </body></html>\`;

  newWin.document.write(html);
  newWin.document.close();
})();
