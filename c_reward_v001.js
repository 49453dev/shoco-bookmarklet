(async function() {
    const baseUrl = "https://creator-advisor.naver.com/naver_blog/";
    const currentUrl = location.href;

    if (currentUrl === baseUrl || currentUrl === baseUrl.slice(0, -1)) {
        location.href = baseUrl;
        return;
    }

    const pathParts = location.pathname.split('/');
    const currentId = pathParts[2];
    const targetService = "naver_blog";

    if (!currentId || ['home', 'redirect-to-my-channel', 'undefined'].includes(currentId)) {
        location.href = baseUrl;
        return;
    }

    const getDt = (ref, offset) => {
        const d = new Date(ref);
        d.setDate(d.getDate() - offset);
        return d.toISOString().split('T')[0]
    };
    const fmtDt = (ts) => {
        if (!ts) return '날짜 미상';
        const d = new Date(ts);
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
    };

    let lastData = [];
    let popTimer = null;
    let win = window.open('about:blank', '_blank');
    if (!win) {
        alert("팝업 차단을 해제해주세요.");
        return;
    }

    const CSS = `body{font-family:"Pretendard",sans-serif;background:#0f1114;color:#e0e0e0;margin:0;overflow-y:hidden;user-select:none}#top-ctrl{position:sticky;top:0;z-index:100;background:#1a1d23;padding:15px;border-bottom:1px solid #333;display:flex;justify-content:center;align-items:center;gap:12px;box-shadow:0 4px 20px rgba(0,0,0,0.5)}.nav-btn{background:#00ff95;color:#0f1114;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-weight:700;font-size:15px}.stat-btn{background:#333;color:#00ff95;border:1px solid #00ff95}.mask-btn{background:#444;color:#fff;border:none;padding:6px 10px;border-radius:4px;cursor:pointer;font-weight:700;font-size:11px;margin-left:5px}input#day-count{background:#0f1114;color:#00ff95;border:1px solid #444;padding:8px;width:55px;text-align:center;border-radius:6px;font-weight:700;font-size:16px}#base-date-disp{font-size:17px;font-weight:300;color:#fff;min-width:130px;text-align:center}.main-wrapper{display:flex;flex-direction:row;justify-content:flex-start;align-items:flex-start;gap:20px;padding:30px;overflow-x:auto;height:calc(100vh - 85px);cursor:grab;scroll-behavior:auto}.main-wrapper:active{cursor:grabbing}.ee-link{color:#444;text-decoration:none;font-size:11px;margin-left:10px;transition:0.3s}.ee-link:hover{color:#ff007b;text-shadow:0 0 8px #ff007b}.pop-ee{margin-top:12px;display:block;font-size:10px;color:rgba(0,0,0,0.3);text-decoration:none;transition:0.3s}.pop-ee:hover{color:#ff007b}::-webkit-scrollbar{width:8px;height:8px}::-webkit-scrollbar-thumb{background:#333;border-radius:10px;border:2px solid #0f1114}::-webkit-scrollbar-track{background:#0f1114}.day-section{background:#1a1d23;border:1px solid #2a2d33;border-radius:20px;min-width:450px;max-width:500px;flex-shrink:0;height:100%;display:flex;flex-direction:column;box-shadow:0 10px 40px rgba(0,0,0,0.6);transition:all 0.3s ease;border:1px solid rgba(0,255,149,0.05)}.day-section:hover{border-color:rgba(0,255,149,0.3);box-shadow:0 15px 50px rgba(0,255,149,0.1)}.day-header{padding:20px;text-align:center;border-bottom:1px solid #333;flex-shrink:0}.total-rev{font-size:26px;color:#00ff95;margin:8px 0;font-weight:300}.table-wrap{padding:5px 10px;overflow-y:auto;flex-grow:1}table{width:100%;border-collapse:collapse;font-size:12px;table-layout:fixed}th,td{padding:10px 5px;text-align:left;border-bottom:1px solid #262a31;vertical-align:middle}th{color:#00ff95;background:#252930;position:sticky;top:0;z-index:10;font-weight:400}.rk{width:25px;color:#888;text-align:center}.ttl{font-weight:300;line-height:1.4;transition:all 0.2s ease;position:relative}.ttl a{color:#e0e0e0;text-decoration:none;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;transition:all 0.2s ease}.ttl-glow a{color:#00ff95 !important;text-shadow:0 0 10px rgba(0,255,149,0.8);font-weight:700 !important}.row-highlight{background:rgba(0,255,149,0.08)}.is-masked .ttl a,.is-masked .pop-ttl{filter:blur(6px);pointer-events:none}.p-date{font-size:10px;color:#666;margin-top:4px;display:flex;align-items:center;gap:8px}.mini-stat-btn{background:#333;color:#00ff95;border:1px solid #00ff95;padding:2px 6px;border-radius:4px;font-size:9px;cursor:pointer;position:relative;z-index:200}.mini-stat-btn:hover{background:#00ff95;color:#0f1114}.st-col{color:#777;font-size:11px;white-space:nowrap;width:65px;text-align:right}.rev-col{color:#00ff95;font-weight:500;text-align:right;width:70px}#post-popup{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#00ff95;color:#0f1114;padding:20px 30px;border-radius:30px;font-size:13px;font-weight:700;display:none;z-index:10000;box-shadow:0 0 50px rgba(0,255,149,0.5);min-width:320px;text-align:center}.pop-ttl{font-size:15px;margin-bottom:8px;line-height:1.4;word-break:keep-all;display:block}.pop-stats{display:flex;gap:15px;justify-content:center;margin-top:15px;padding-top:10px;border-top:1px solid rgba(0,0,0,0.1)}#loading-status{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#00ff95;color:#0f1114;padding:15px 35px;border-radius:35px;font-size:13px;font-weight:700;display:none;z-index:10000;box-shadow:0 0 50px rgba(0,255,149,0.5)}.pop-bg{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.4);display:none;z-index:9999}`;

    win.document.write(`<html><head><title>Dashboard</title><style>${CSS}</style></head><body><div id="top-ctrl"><button class="nav-btn" id="pD">◀</button><div id="base-date-disp"></div><button class="nav-btn" id="nD">▶</button><span style="margin-left:10px;font-size:13px;color:#888">조회:</span><input type="number" id="day-count" value="30" min="1" max="90"><button class="nav-btn" id="apply">적용</button><button class="nav-btn stat-btn" id="openStat">컨텐츠별 통계</button><button class="mask-btn" id="toggleMask">MASK OFF</button><a href="https://www.threads.net/@49453_" target="_blank" class="ee-link">made by 49453</a></div><div class="main-wrapper" id="cont"></div><div id="loading-status"></div><div id="pop-bg" class="pop-bg"></div><div id="post-popup"></div></body></html>`);
    win.document.close();

    const initDrag = () => {
        const slider = win.document.getElementById('cont');
        let isDown = false,
            startX, scrollLeft;
        slider.onmousedown = (e) => {
            if (e.target.closest('.mini-stat-btn') || e.target.closest('a')) return;
            isDown = true;
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        };
        slider.onmouseleave = () => isDown = false;
        slider.onmouseup = () => isDown = false;
        slider.onmousemove = (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            slider.scrollLeft = scrollLeft - (x - startX) * 2;
        };
    };

    win.hHover = (id, isEnter) => {
        if (!id) return;
        const selector = `[data-pid="${id}"]`;
        win.document.querySelectorAll(`.ttl${selector}`).forEach(c => isEnter ? c.classList.add('ttl-glow') : c.classList.remove('ttl-glow'));
        win.document.querySelectorAll(`tr${selector}`).forEach(r => isEnter ? r.classList.add('row-highlight') : r.classList.remove('row-highlight'));
    };

    const setupMasking = (targetDoc) => {
        const btn = targetDoc.getElementById('toggleMask');
        if (!btn) return;
        btn.onclick = function() {
            const isM = targetDoc.body.classList.toggle('is-masked');
            this.innerText = isM ? 'MASK ON' : 'MASK OFF';
            this.style.background = isM ? '#00ff95' : '#444';
            this.style.color = isM ? '#0f1114' : '#fff';
        };
    };
    setupMasking(win.document);

    const showPostStat = (title, url, created) => {
        const agg = {v: 0,c: 0,r: 0};
        lastData.forEach(day => {
            const item = day.ranks.find(r => (r.contentId || r.metaUrl) === url);
            if (item) {
                agg.v += Math.round(day.stat.impression * item.impression);
                agg.c += Math.round(day.stat.click * item.click);
                agg.r += Math.round(day.rev.revenue * item.click);
            }
        });
        const diffDays = Math.ceil(Math.abs(new Date() - new Date(created)) / (1000 * 60 * 60 * 24));
        const count = win.document.getElementById('day-count').value;
        const pop = win.document.getElementById('post-popup');
        const bg = win.document.getElementById('pop-bg');
        pop.innerHTML = `<div class="pop-ttl">"${title || "제목 없음"}"</div><div style="font-size:11px;color:rgba(0,0,0,0.6);margin-bottom:5px">발행 ${diffDays}일 경과 (조회:${count}일)</div><div class="pop-stats"><span style="color:#004d30">V: ${agg.v.toLocaleString()}</span><span style="color:#0000ff">C: ${agg.c.toLocaleString()}</span><span style="color:#cc0000">₩: ${agg.r.toLocaleString()}원</span></div><a href="https://www.threads.net/@49453_" target="_blank" class="pop-ee">made by 49453</a>`;
        pop.style.display = 'block';
        bg.style.display = 'block';
        if (popTimer) clearTimeout(popTimer);
        popTimer = setTimeout(() => {
            pop.style.display = 'none';
            bg.style.display = 'none';
        }, 10000);
    };

    win.document.getElementById('pop-bg').onclick = () => {
        win.document.getElementById('post-popup').style.display = 'none';
        win.document.getElementById('pop-bg').style.display = 'none';
    };

    const fD = async (u) => fetch(u).then(r => {
        if (!r.ok) throw new Error();
        return r.json()
    });
    const renderAll = async (refDate) => {
        const cont = win.document.getElementById('cont');
        const loader = win.document.getElementById('loading-status');
        const count = parseInt(win.document.getElementById('day-count').value) || 30;
        win.document.getElementById('base-date-disp').innerText = refDate;
        cont.innerHTML = '';
        lastData = [];
        loader.style.display = 'block';
        const dates = [];
        for (let i = count - 1; i >= 0; i--) dates.push(getDt(refDate, i));

        for (let i = 0; i < dates.length; i += 5) {
            const chunk = dates.slice(i, i + 5);
            loader.innerText = `수집 중... (${i + chunk.length} / ${count})`;
            try {
                const results = await Promise.all(chunk.map(async (d) => {
                    const [rR, rI, rK] = await Promise.all([
                        fD(`/api/v6/revenue/trend?channelId=${currentId}&contentType=text&endDate=${d}&interval=day&service=${targetService}&startDate=${d}`),
                        fD(`/api/v6/revenue/impression-click-trend?channelId=${currentId}&contentType=text&endDate=${d}&interval=day&service=${targetService}&startDate=${d}`),
                        fD(`/api/v6/revenue/impression-click-ranks?channelId=${currentId}&clickLimit=50&contentType=text&date=${d}&impressionLimit=50&interval=day&service=${targetService}`)
                    ]);
                    return {date: d,rev: rR.data[0] || {revenue: 0},stat: rI.data[0] || {impression: 0,click: 0},ranks: rK.clickData.data || []};
                }));
                lastData.push(...results);
                results.forEach(res => {
                    const div = win.document.createElement('div');
                    div.className = 'day-section';
                    let rows = '';
                    res.ranks.forEach(item => {
                        const pUrl = item.contentId || item.metaUrl || "#";
                        const pId = encodeURIComponent(pUrl);
                        const dTitle = (item.title || "").replace(/'/g, "");
                        rows += `<tr data-pid="${pId}"><td class="rk">${item.rank}</td><td class="ttl" data-pid="${pId}" onmouseenter="window.hHover('${pId}',true)" onmouseleave="window.hHover('${pId}',false)"><a href="${pUrl}" target="_blank">${item.title||"제목없음"}</a><div class="p-date"><span>${fmtDt(item.createdAt)}</span><button class="mini-stat-btn" data-title='${dTitle}' data-url='${pUrl}' data-created='${item.createdAt}'>📊 누적</button></div></td><td class="st-col">${Math.round(res.stat.impression*item.impression).toLocaleString()}<br>${Math.round(res.stat.click*item.click).toLocaleString()}</td><td class="rev-col">${Math.round(res.rev.revenue*item.click).toLocaleString()}원</td></tr>`;
                    });
                    div.innerHTML = `<div class="day-header"><h3>${res.date}</h3><div class="total-rev">${res.rev.revenue.toLocaleString()}원</div><div style="font-size:12px;color:#666">V ${res.stat.impression.toLocaleString()} | C ${res.stat.click.toLocaleString()}</div></div><div class="table-wrap"><table><thead><tr><th class="rk">#</th><th>포스팅 정보</th><th class="st-col">V / C</th><th class="rev-col">수익</th></tr></thead><tbody>${rows}</tbody></table></div>`;
                    cont.appendChild(div);
                });
                await new Promise(r => setTimeout(r, 100));
            } catch (e) {
                break;
            }
        }
        win.document.querySelectorAll('.mini-stat-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                e.preventDefault();
                showPostStat(btn.dataset.title, btn.dataset.url, parseInt(btn.dataset.created));
            };
        });
        loader.style.display = 'none';
        initDrag();
        cont.scrollLeft = cont.scrollWidth;
    };

    win.document.getElementById('pD').onclick = () => renderAll(getDt(win.document.getElementById('base-date-disp').innerText, 1));
    win.document.getElementById('nD').onclick = () => renderAll(getDt(win.document.getElementById('base-date-disp').innerText, -1));
    win.document.getElementById('apply').onclick = () => renderAll(win.document.getElementById('base-date-disp').innerText);

    win.document.getElementById('openStat').onclick = () => {
        const agg = {};
        lastData.forEach(day => {
            day.ranks.forEach(item => {
                const id = item.contentId || item.metaUrl;
                if (!agg[id]) agg[id] = {title: item.title || "무제",v: 0,c: 0,r: 0,url: id,created: item.createdAt};
                agg[id].v += Math.round(day.stat.impression * item.impression);
                agg[id].c += Math.round(day.stat.click * item.click);
                agg[id].r += Math.round(day.rev.revenue * item.click)
            })
        });
        const sorted = Object.values(agg).sort((a, b) => b.r - a.r);
        const swin = window.open('', '_blank');
        swin.document.write(`<html><head><title>누적 통계</title><style>${CSS.replace('overflow-y:hidden','overflow-y:auto')}.main-wrapper{justify-content:center;height:auto;padding-bottom:100px}.day-section{min-width:600px;max-width:700px;height:auto}</style></head><body><div id="top-ctrl"><div style="font-size:18px;color:#00ff95;font-weight:700">컨텐츠별 누적 성과 통계</div><button class="mask-btn" id="toggleMask">MASK OFF</button><a href="https://www.threads.net/@49453_" target="_blank" class="ee-link">made by 49453</a></div><div class="main-wrapper"><div class="day-section"><div class="table-wrap"><table><thead><tr><th class="rk">순위</th><th>포스팅 정보</th><th class="st-col">누적 V / C</th><th class="rev-col">누적 수익</th></tr></thead><tbody>${sorted.map((i,idx)=>`<tr><td class="rk">${idx+1}</td><td class="ttl"><a href="${i.url}" target="_blank">${i.title}</a><div class="p-date">${fmtDt(i.created)}</div></td><td class="st-col">${i.v.toLocaleString()}<br>${i.c.toLocaleString()}</td><td class="rev-col">${i.r.toLocaleString()}원</td></tr>`).join('')}</tbody></table></div></div></div></body></html>`);
        swin.document.close();
        setupMasking(swin.document);
    };

    renderAll(getDt(new Date(), 1));
})();
