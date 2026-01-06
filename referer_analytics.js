(async function() {
    const targetUrl = 'https://blog.stat.naver.com/m/blog/daily/cv';
    if (!location.hostname.includes('stat.naver.com')) {
        location.href = targetUrl;
        return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const borderColors = ['#00ff95', '#00bfff', '#ba68c8', '#ffa726', '#4db6ac'];
    
    const CSS = 'body{font-family:"Pretendard",sans-serif;padding:30px;background:#0f1114;color:#e0e0e0;line-height:1.4;margin:0}h1{text-align:center;color:#fff;margin:0;font-size:26px;font-weight:300;text-transform:lowercase}.ee{text-align:center;margin-bottom:30px;font-size:12px;letter-spacing:1px}.ee a{color:#333;text-decoration:none;transition:0.3s}.ee a:hover{color:#ff007b;text-shadow:0 0 8px #ff007b}.date-nav{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:30px}.nav-btn{background:#2a2d33;color:#fff;border:none;padding:5px 12px;border-radius:6px;cursor:pointer;font-size:16px;transition:0.1s}.nav-btn:hover{background:#444}.today-btn{background:rgba(0,255,149,0.1);color:#00ff95;border:1px solid #00ff95;padding:5px 15px;border-radius:6px;cursor:pointer;font-weight:bold;font-size:12px;transition:0.1s}.today-btn:hover{background:rgba(0,255,149,0.2);box-shadow:0 0 8px rgba(0,255,149,0.4)}#datePicker{background:#1a1d23;color:#00ff95;border:1px solid #333;padding:5px 10px;border-radius:6px;cursor:pointer;font-family:inherit}.main-layout{display:grid;grid-template-columns:380px 1fr;gap:30px;max-width:1650px;margin:0 auto}.side-panel{background:#1a1d23;border:1px solid #333;border-radius:16px;padding:20px;height:90vh;overflow-y:auto}.panel-title{color:#00ff95;font-size:15px;margin-bottom:20px;padding-left:10px;border-left:3px solid #00ff95;text-transform:uppercase;letter-spacing:1px}.post-item{display:flex;gap:12px;padding:12px 0;border-bottom:1px solid #2a2d33}.post-rank{color:#00ff95;font-weight:600;font-size:16px;min-width:25px}.post-info{flex:1;min-width:0}.post-title{display:block;color:#eee;font-size:13px;text-decoration:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:4px}.post-meta{font-size:11px;color:#666}.post-cv{font-weight:bold;font-size:12px}.dashboard{display:flex;gap:15px;margin-bottom:30px}.stat-card{background:#1a1d23;border:1px solid #2a2d33;border-radius:12px;padding:15px 25px;text-align:center;flex:1}.stat-label{color:#888;font-size:11px;margin-bottom:5px;text-transform:uppercase}.stat-value{color:#00ff95;font-size:22px;font-weight:bold}.btn-container{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:30px}.channel-btn{background:#1a1d23;border:1px solid #333;border-radius:12px;padding:15px 20px;cursor:pointer;text-align:left;transition:all 0.1s ease-out;width:calc(33.33% - 8px);box-sizing:border-box}.channel-btn:hover{transform:translateY(-2px);background:rgba(255,255,255,0.06)}.channel-btn.active{border-color:#00ff95!important;background:rgba(255,255,255,0.08)!important}.btn-name{color:#fff;font-size:14px;display:block;margin-bottom:8px;font-weight:500}.btn-meta{display:flex;gap:10px;align-items:baseline}.btn-share{color:#00ff95;font-size:16px;font-weight:bold}.cv-text{font-weight:bold;color:#00ff95}.channel-card{background:#1a1d23;border-radius:16px;padding:25px;border:1px solid #333;display:none;margin-bottom:20px}.channel-card.active{display:block}table{width:100%;border-collapse:collapse;table-layout:fixed}td{padding:10px 0;border-bottom:1px solid #2a2d33;font-size:13px}.rank-td{color:#00ff95;width:30px}.label-cell a{color:#eee;text-decoration:none}.cv-cell{text-align:right;color:#00ff95;width:60px;font-weight:bold}#loading{position:fixed;bottom:20px;right:20px;background:rgba(0,255,149,0.9);color:#000;padding:10px 20px;border-radius:30px;font-weight:bold;z-index:9999;font-size:12px;display:none}';

    const simplifyUrl = function(url, query) {
        if (query && query !== '-') return "🔍 " + query;
        if (!url || url === '#') return "직접 유입";
        try {
            const urlObj = new URL(url);
            const p = urlObj.searchParams, path = urlObj.pathname;
            if (url.includes("place.naver.com")) return "📍 플레이스_" + (path.split("/")[2] || "ID");
            if (url.includes("blog.naver.com")) {
                const pathParts = path.split("/").filter(v => v);
                const postNo = p.get("logNo") || (pathParts.length >= 2 && /^\d+$/.test(pathParts[1]) ? pathParts[1] : "");
                const blogId = pathParts[0] || "blog";
                return postNo ? "📝 포스트_" + blogId + "/" + postNo : "🏠 홈";
            }
            return urlObj.hostname;
        } catch (e) { return "LINK"; }
    };

    const reportHtml = '<html><head><meta charset="UTF-8"><style>' + CSS + '</style></head><body><div id="loading"></div><h1>referer analytics</h1><div class="ee"><a href="https://www.threads.com/@49453_" target="_blank">made by 49453</a></div><div class="date-nav"><button class="nav-btn" id="prevDay">◀</button><button class="today-btn" id="goToday">TODAY</button><input type="date" id="datePicker" value="' + todayStr + '"><button class="nav-btn" id="nextDay">▶</button></div><div class="main-layout"><div class="side-panel"><div class="panel-title">Top 100 Posts (CV)</div><div id="post-rank-list"></div></div><div class="content-panel"><div id="stats-area"></div><div id="btn-area" class="btn-container"></div><div id="detail-area"></div></div></div></body></html>';

    try {
        const userInfo = await fetch('https://blog.stat.naver.com/api/blog/user-info').then(r => r.json());
        const realBlogId = userInfo?.result?.blogId || 'monkey_diary';
        const newWin = window.open('', '_blank');
        newWin.document.write(reportHtml);
        newWin.document.close();
        const doc = newWin.document;

        async function fetchData(date) {
            const loader = doc.getElementById('loading');
            loader.style.display = 'block'; loader.innerText = 'Syncing...';
            try {
                const rankRes = await fetch(`https://blog.stat.naver.com/api/blog/daily/rankCv?timeDimension=DATE&additionalTimeDimension=WEEK&startDate=${date}&size=100`).then(r => r.json());
                const rankRows = rankRes?.result?.statDataList?.[0]?.data?.rows || {};
                let rHtml = '';
                if (rankRows.title) {
                    rankRows.title.forEach((t, i) => {
                        const postNo = (rankRows.uri[i] || '').match(/\d+$/)?.[0] || '';
                        rHtml += `<div class="post-item"><div class="post-rank">${i + 1}</div><div class="post-info"><a href="https://blog.naver.com/${realBlogId}/${postNo}" target="_blank" class="post-title">${t}</a><div class="post-meta"><span class="post-cv" style="color:#00ff95">${rankRows.cv[i].toLocaleString()} CV</span> | <span>${rankRows.createDate[i]}</span></div></div></div>`;
                    });
                }
                doc.getElementById('post-rank-list').innerHTML = rHtml;

                const sumRes = await fetch(`https://blog.stat.naver.com/api/blog/daily/referer/total?timeDimension=DATE&additionalTimeDimension=WEEK&startDate=${date}&size=100`).then(r => r.json());
                const statList = sumRes?.result?.statDataList || [];
                const db = statList.find(i => i.dataId === 'dashboard')?.data?.value || {};
                doc.getElementById('stats-area').innerHTML = `<div class="dashboard"><div class="stat-card"><div class="stat-label">Total Visit</div><div class="stat-value">${(db.dailyCv || 0).toLocaleString()}</div></div><div class="stat-card"><div class="stat-label">Likes</div><div class="stat-value">${(db.dailyLike || 0).toLocaleString()}</div></div><div class="stat-card"><div class="stat-label">Comments</div><div class="stat-value">${(db.dailyComment || 0).toLocaleString()}</div></div></div>`;

                const totalData = statList.find(i => i.dataId === 'refererTotal')?.data?.rows || {};
                const domains = totalData.referrerDomain || [];
                doc.getElementById('btn-area').innerHTML = ''; doc.getElementById('detail-area').innerHTML = '';

                for (let i = 0; i < domains.length; i++) {
                    const dRes = await fetch(`https://blog.stat.naver.com/api/blog/daily/referer/total/detail?timeDimension=DATE&additionalTimeDimension=WEEK&startDate=${date}&searchEngine=${totalData.referrerSearchEngine[i]}&refererDomain=${encodeURIComponent(domains[i])}&size=100&offset=0`).then(r => r.json());
                    const rows = dRes?.result?.statDataList?.[0]?.data?.rows || {};
                    const bColor = borderColors[i % 5];
                    const btn = doc.createElement('button');
                    btn.className = 'channel-btn'; btn.style = `border-left:4px solid ${bColor}`;
                    btn.onmouseover = function() { this.style.boxShadow = `0 0 10px ${bColor}4D`; };
                    btn.onmouseout = function() { this.style.boxShadow = 'none'; };
                    btn.innerHTML = `<span class="btn-name">${domains[i]}</span><div class="btn-meta"><span class="btn-share">${(totalData.cv_p[i] || 0).toFixed(1)}%</span><span class="cv-text">${(totalData.cv[i] || 0).toLocaleString()} CV</span></div>`;
                    
                    const card = doc.createElement('div');
                    card.className = 'channel-card'; card.id = `card-${i}`; card.style = `border-top:2px solid ${bColor}`;
                    let rowsHtml = '';
                    for (let j = 0; j < (rows.cv || []).length; j++) {
                        rowsHtml += `<tr><td class="rank-td">${j + 1}</td><td class="label-cell"><a href="${rows.referrerUrl[j] || '#'}" target="_blank">${simplifyUrl(rows.referrerUrl[j], rows.searchQuery[j])}</a></td><td class="cv-cell">${rows.cv[j].toLocaleString()}</td></tr>`;
                    }
                    card.innerHTML = `<table><tbody>${rowsHtml}</tbody></table>`;
                    btn.onclick = () => {
                        const active = card.classList.contains('active');
                        doc.querySelectorAll('.channel-card, .channel-btn').forEach(el => el.classList.remove('active'));
                        if (!active) { card.classList.add('active'); btn.classList.add('active'); }
                    };
                    doc.getElementById('btn-area').appendChild(btn); doc.getElementById('detail-area').appendChild(card);
                }
            } catch (e) { loader.innerText = 'Error!'; }
            loader.style.display = 'none';
        }

        doc.getElementById('prevDay').onclick = () => { let d = new Date(doc.getElementById('datePicker').value); d.setDate(d.getDate() - 1); doc.getElementById('datePicker').value = d.toISOString().split('T')[0]; fetchData(doc.getElementById('datePicker').value); };
        doc.getElementById('nextDay').onclick = () => { let d = new Date(doc.getElementById('datePicker').value); d.setDate(d.getDate() + 1); doc.getElementById('datePicker').value = d.toISOString().split('T')[0]; fetchData(doc.getElementById('datePicker').value); };
        doc.getElementById('goToday').onclick = () => { doc.getElementById('datePicker').value = todayStr; fetchData(todayStr); };
        doc.getElementById('datePicker').onchange = (e) => fetchData(e.target.value);
        fetchData(todayStr);
    } catch (err) { console.error(err); }
})();
