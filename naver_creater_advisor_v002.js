(function() {
    const T = "https://creator-advisor.naver.com/naver_blog/monkey_diary/trends";
    const S = "#root > div > div > div.u_ni_container.container_wrapper > div.u_ni_section_wrap > div > div.u_ni_section_unit.menu-sub-menu-tabs.show-sub-menu > div.u_ni_nav_section.u_ni_bottom_line > div.u_ni_nav_component.u_ni_type_square.panel_navigation > nav > ul > div > li.swiper-slide.swiper-slide-next.u_ni_nav_item > div";

    if (!window.location.href.includes(T)) {
        window.location.href = T;
        return;
    }

    const CSS_CAT = `body{font-family:"Pretendard",sans-serif;padding:20px;background:#0f1114;color:#e0e0e0;line-height:1.4;margin:0}h2{text-align:center;color:#fff;margin:25px 0 5px 0;font-size:22px;font-weight:300;letter-spacing:1px}.dt{text-align:center;color:#666;margin-bottom:10px;font-size:12px}.ee{text-align:center;margin-bottom:30px;font-size:13px}.ee a{color:#444;text-decoration:none;transition:0.3s}.ee a:hover{color:#ff007b;text-shadow:0 0 8px #ff007b;}.sec-t{width:100%;color:#00ff95;font-size:16px;font-weight:400;margin:40px 0 15px 0;padding-left:10px;border-left:3px solid #00ff95;text-transform:uppercase;letter-spacing:1px}.w{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:15px;max-width:1850px;margin:0 auto;margin-bottom:50px}.c{background:#1a1d23;border-radius:12px;padding:15px;border:1px solid #2a2d33}.ct{color:#00ff95;font-weight:400;font-size:15px;border-bottom:1px solid #333;padding-bottom:8px;margin-bottom:12px;text-shadow:0 0 5px rgba(0,255,149,0.3)}.i{display:flex;margin-bottom:8px;gap:8px;align-items:center}.n{color:#00ff95;font-size:12px;font-weight:300;min-width:20px}.tx{flex:1}.t{display:block;color:#eee;font-size:13px;font-weight:300;word-break:keep-all;text-decoration:none}.rb{font-size:10px;font-weight:300;min-width:30px;text-align:right}.up{color:#ff4d4f}.down{color:#1890ff}.new{color:#eb2f96}.stay{color:#555}`;
    const CSS_HOME = `body{font-family:"Pretendard",sans-serif;padding:20px;background:#0f1114;color:#e0e0e0;line-height:1.6;margin:0}h2{text-align:center;color:#fff;margin:30px 0 5px 0;font-size:26px;font-weight:300;text-shadow:0 0 10px rgba(255,255,255,0.3)}.dt{text-align:center;color:#888;margin-bottom:10px;font-size:14px;letter-spacing:1px}.ee{text-align:center;margin-bottom:40px;font-size:14px}.ee a{color:#555;text-decoration:none;transition:0.3s}.ee a:hover{color:#ff007b;text-shadow:0 0 10px #ff007b;}.w{display:flex;gap:30px;justify-content:center;flex-wrap:wrap;max-width:1600px;margin:0 auto}.c{background:#1a1d23;border-radius:16px;padding:25px;border:1px solid #333;width:500px;box-shadow:0 10px 30px rgba(0,0,0,0.5);min-height:720px}.ct{color:#00ff95;font-weight:400;font-size:20px;border-bottom:1px solid #333;padding-bottom:12px;margin-bottom:25px;text-transform:uppercase;text-shadow:0 0 8px rgba(0,255,149,0.4)}.i{display:flex;margin-bottom:22px;gap:12px}.n{color:#00ff95;font-size:16px;font-weight:700;min-width:30px;padding-top:1px}.tx{flex:1}.t{display:block;color:#fff;font-size:16px;font-weight:300;margin-bottom:6px;word-break:keep-all;line-height:1.4}.u{font-size:12px;color:#00d9ff;text-decoration:none;word-break:break-all;opacity:0.7;font-weight:300}a{text-decoration:none}`;

    async function start() {
        const l = document.createElement('div');
        l.style = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);padding:20px;background:rgba(0,0,0,0.9);color:#fff;z-index:9999;border-radius:10px;text-align:center;font-size:14px;';
        l.innerHTML = '초고속 데이터 수집 중...';
        document.body.appendChild(l);

        async function sS(idx) {
            let data = [];
            const c = document.querySelectorAll('.swiper-container');
            if (!c[idx]) return data;
            const s = c[idx].swiper;
            if (s) {
                for (let i = 0; i < s.slides.length; i++) {
                    const boxes = c[idx].querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate)');
                    boxes.forEach(b => { if (b.querySelector('h3')) data.push(b) });
                    s.slideNext(100);
                    await new Promise(r => setTimeout(r, 150))
                }
                s.slideTo(0, 0)
            }
            return data
        }

        const d1 = await sS(0);
        window.scrollTo(0, document.body.scrollHeight);
        await new Promise(r => setTimeout(r, 300));
        const d2 = await sS(1);
        const dE = document.querySelector('span.u_ni_range.cursor_pointer'), dt = dE ? dE.innerText.trim() : '';
        const EE = `<div class="ee"><a href="https://www.threads.net/@49453" target="_blank">made by 49453</a></div>`;

        function gen(boxes) {
            let sC = new Set(), html = '';
            boxes.forEach(b => {
                const t = b.querySelector('h3').innerText.trim();
                if (sC.has(t)) return;
                sC.add(t);
                html += `<div class="c"><div class="ct">${t}</div>`;
                b.querySelectorAll('ul li a').forEach((item, idx) => {
                    const kN = item.firstChild.textContent.trim();
                    const rE = item.querySelector('span.u_ni_data');
                    let rH = '-';
                    if (rE) {
                        const rT = rE.innerText.trim(), rC = rE.classList.contains('up') ? 'up' : rE.classList.contains('down') ? 'down' : rE.classList.contains('new') ? 'new' : 'stay';
                        rH = `<span class="rb ${rC}">${rT}</span>`
                    }
                    html += `<div class="i"><div class="n">${(idx + 1).toString().padStart(2, "0")}</div><div class="tx"><a href="https://search.naver.com/search.naver?query=${encodeURIComponent(kN)}" target="_blank" class="t">${kN}</a></div>${rH}</div>`
                });
                html += '</div>'
            });
            return html
        }

        let h1 = `<html><head><meta charset="UTF-8"><style>${CSS_CAT}</style></head><body><h2>CATEGORY TREND REPORT</h2><div class="dt">${dt}</div>${EE}<div class="sec-t">Subject Categories</div><div class="w">${gen(d1)}</div><div class="sec-t">Demographic Categories</div><div class="w">${gen(d2)}</div></body></html>`;
        const w1 = window.open();
        if (w1) { w1.document.write(h1); w1.document.close() }

        const btn = document.querySelector(S);
        if (btn) {
            btn.click();
            await new Promise(r => setTimeout(r, 800))
        }

        const items = document.querySelectorAll(".u_ni_search_box ul li a");
        let h2 = `<html><head><meta charset="UTF-8"><style>${CSS_HOME}</style></head><body><h2>Naver main TOP POSTING LIST</h2><div class="dt">기준일: ${dt}</div>${EE}<div class="w">`;
        for (let t = 0; t < 2; t++) {
            h2 += `<div class="c"><div class="ct">${t === 0 ? "RANK 01 - 10" : "RANK 11 - 20"}</div>`;
            for (let r = 0; r < 10; r++) {
                const o = t * 10 + r;
                if (o >= items.length) break;
                const m = items[o], tt = m.querySelector("p") ? m.querySelector("p").innerText.trim() : "";
                h2 += `<div class="i"><div class="n">${(o + 1).toString().padStart(2, "0")}</div><div class="tx"><span class="t">${tt}</span><a href="${m.href}" class="u" target="_blank">${m.href}</a></div></div>`
            }
            h2 += '</div>'
        }
        h2 += '</div></body></html>';
        const w2 = window.open();
        if (w2) { w2.document.write(h2); w2.document.close() }
        document.body.removeChild(l)
    }
    start();
})();
