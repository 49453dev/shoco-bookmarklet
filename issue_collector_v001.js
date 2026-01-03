(async function(){
    const N = "https://www.nate.com/", B = "https://blackkiwi.net/service/trend", K = "SH_TRD";
    const cur = window.location.href;

    if(cur.includes("nate.com")){
        const res = Array.from(document.querySelectorAll('#olLiveIssueKeyword li'))
            .map(li => li.querySelector('a')?.innerText.replace(/[0-9]/g, '').trim()).filter(t => t).slice(0, 10);
        sessionStorage.setItem(K + "_N", JSON.stringify(res));
        location.href = B; return;
    }

    if(cur.includes("blackkiwi.net")){
        await new Promise(r => setTimeout(r, 2500));
        const res = Array.from(document.querySelectorAll('#popularKeywordList a'))
            .map(a => a.innerText.trim()).filter(t => t).slice(0, 10);
        const nate = JSON.parse(sessionStorage.getItem(K + "_N") || "[]");
        
        const CSS = `body{font-family:sans-serif;padding:20px;background:#0f1114;color:#e0e0e0}h2{text-align:center;color:#fff}.ee{text-align:center;margin-bottom:30px;font-size:13px}.ee a{color:#444;text-decoration:none}.w{display:flex;gap:20px;justify-content:center}.c{background:#1a1d23;border-radius:12px;padding:20px;border:1px solid #333;width:300px}.ct{color:#00ff95;font-size:18px;border-bottom:1px solid #333;padding-bottom:10px;margin-bottom:15px}.i{display:flex;margin-bottom:10px;gap:10px}.n{color:#00ff95;font-weight:700}.t{color:#fff;text-decoration:none}`;
        const gen = (title, data, url) => `<div class="c"><div class="ct">${title}</div>` + data.map((t,i)=>`<div class="i"><div class="n">${i+1}</div><a href="${url}${encodeURIComponent(t)}" target="_blank" class="t">${t}</a></div>`).join('') + `</div>`;
        
        const win = window.open();
        win.document.write(`<html><head><style>${CSS}</style></head><body><h2>TREND REPORT</h2><div class="ee"><a href="https://www.threads.net/@49453">made by 49453</a></div><div class="w">${gen('NATE ISSUE', nate, 'https://search.daum.net/search?q=')}${gen('BLACKKIWI', res, 'https://search.naver.com/search.naver?query=')}</div></body></html>`);
        win.document.close(); return;
    }
    location.href = N;
})();
