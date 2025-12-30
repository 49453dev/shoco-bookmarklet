(function() {
    async function collectAllData() {
        const loader = document.createElement('div');
        loader.style = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);padding:25px;background:rgba(0,0,0,0.85);color:#fff;z-index:9999;border-radius:15px;text-align:center;font-size:16px;line-height:1.5;';
        loader.innerHTML = '데이터 수집 중...(몇초 걸려요~ 까꿍~!)';
        document.body.appendChild(loader);

        const dateElement = document.querySelector('span.u_ni_range.cursor_pointer');
        const dateText = dateElement ? dateElement.innerText.trim() : '';

        async function scrollSwiper(index) {
            const containers = document.querySelectorAll('.swiper-container');
            if (!containers[index]) return;
            const swiper = containers[index].swiper;
            if (swiper) {
                const total = swiper.slides.length;
                for (let i = 0; i < total; i++) {
                    swiper.slideNext(300);
                    await new Promise(r => setTimeout(r, 400));
                }
                swiper.slideTo(0, 0);
            } else {
                const wrapper = containers[index].querySelector('.swiper-wrapper');
                if (wrapper) {
                    let x = 0;
                    while (x < wrapper.scrollWidth) {
                        x += 1000;
                        wrapper.style.transform = `translate3d(-${x}px, 0px, 0px)`;
                        await new Promise(r => setTimeout(r, 400));
                    }
                }
            }
        }

        await scrollSwiper(0);
        window.scrollTo(0, document.body.scrollHeight);
        await new Promise(r => setTimeout(r, 800));
        await scrollSwiper(1);

        const seenCategories = new Set();
        const categoryBoxes = document.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate)');
        
        let resultHtml = '<html><head><title>통합 리포트</title><style>';
        resultHtml += 'body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;padding:30px;background-color:#f0f2f5;margin:0;}';
        resultHtml += '.header{margin-bottom:30px;padding-left:10px;} h2{font-size:22px;color:#00c73c;margin:0;} .date{color:#666;font-size:14px;margin-top:5px;}';
        resultHtml += '.main-grid{display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:15px;align-items:start;}';
        resultHtml += '.category-card{background:#fff;border-radius:10px;box-shadow:0 2px 6px rgba(0,0,0,0.06);border:1px solid #e1e4e8;overflow:hidden;}';
        resultHtml += '.category-header{background:#fafafa;padding:12px 15px;border-bottom:1px solid #eee;font-size:14px;font-weight:bold;color:#333;border-left:5px solid #00c73c;}';
        resultHtml += '.keyword-list{padding:8px 0;margin:0;list-style:none;}';
        resultHtml += '.keyword-item{display:flex;justify-content:space-between;padding:6px 15px;border-bottom:1px solid #f9f9f9;align-items:center;}';
        resultHtml += '.keyword-link{text-decoration:none;color:#333;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px;}';
        resultHtml += '.keyword-link:hover{text-decoration:underline;color:#00c73c;}';
        resultHtml += '.rank-badge{font-size:11px;font-weight:bold;min-width:35px;text-align:right;}';
        resultHtml += '.up{color:#ff4d4f;} .down{color:#1890ff;} .new{color:#eb2f96;} .stay{color:#999;}';
        resultHtml += '</style></head><body>';
        resultHtml += `<div class="header"><h2>모든 카테고리 다나와라 뿅~!</h2><div class="date">(${dateText})</div></div><div class="main-grid">`;

        categoryBoxes.forEach(box => {
            const catTitleElement = box.querySelector('h3');
            if (!catTitleElement) return;
            const catTitle = catTitleElement.innerText.trim();
            if (seenCategories.has(catTitle)) return;
            seenCategories.add(catTitle);
            
            resultHtml += `<div class="category-card"><div class="category-header">${catTitle}</div><ul class="keyword-list">`;
            const keywordItems = box.querySelectorAll('ul li a');
            keywordItems.forEach((item, index) => {
                const keywordName = item.firstChild.textContent.trim();
                const searchUrl = `https://search.naver.com/search.naver?query=${encodeURIComponent(keywordName)}`;
                const rankElement = item.querySelector('span.u_ni_data');
                let rankHtml = '<span class="rank-badge stay">-</span>';
                if (rankElement) {
                    const rankText = rankElement.innerText.trim();
                    let rankClass = rankElement.classList.contains('up') ? 'up' : rankElement.classList.contains('down') ? 'down' : rankElement.classList.contains('new') ? 'new' : 'stay';
                    rankHtml = `<span class="rank-badge ${rankClass}">${rankText}</span>`;
                }
                resultHtml += `<li class="keyword-item"><a href="${searchUrl}" target="_blank" class="keyword-link">${index + 1}. ${keywordName}</a>${rankHtml}</li>`;
            });
            resultHtml += `</ul></div>`;
        });

        resultHtml += '</div></body></html>';
        document.body.removeChild(loader);
        const newWindow = window.open();
        if(newWindow) {
            newWindow.document.write(resultHtml);
            newWindow.document.close();
        }
    }
    collectAllData();
})();
