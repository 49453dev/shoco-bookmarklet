(function() {
    const runCuration = async () => {
        const loader = document.createElement('div');
        loader.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);padding:30px 50px;background:linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);color:#fff;z-index:10000;border-radius:20px;text-align:center;font-size:18px;font-weight:600;box-shadow:0 20px 50px rgba(0,0,0,0.4);font-family:sans-serif;';
        loader.innerHTML = '데이터 수집 중...<br><br>잠시만 기다려주세요.';
        document.body.appendChild(loader);

        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        let collectedData = [];
        let mediaSet = new Set();
        let textSet = new Set();

        const images = document.querySelectorAll('img');
        images.forEach(img => {
            let src = img.getAttribute('data-src') || img.src;
            if (src && src.startsWith('http') && !mediaSet.has(src)) {
                collectedData.push({ type: 'image', content: src });
                mediaSet.add(src);
            }
        });

        const paragraphs = document.querySelectorAll('.se-text-paragraph, .se-content, p');
        paragraphs.forEach(p => {
            let txt = p.innerText.trim();
            if (txt.length > 10 && !textSet.has(txt)) {
                collectedData.push({ type: 'text', content: txt });
                textSet.add(txt);
            }
        });

        await sleep(1000);
        document.body.removeChild(loader);

        if (collectedData.length === 0) {
            alert('수집된 데이터가 없습니다.');
            return;
        }

        const resultWin = window.open();
        let htmlContent = '<html><head><title>큐레이션 결과</title><style>body{background:#000;color:#fff;font-family:sans-serif;padding:20px;}.masonry{column-width:250px;column-gap:10px;}.item{break-inside:avoid;margin-bottom:10px;background:#111;padding:15px;border:1px solid #333;border-radius:8px;}img{width:100%;border-radius:4px;margin-bottom:10px;}</style></head><body>';
        htmlContent += '<div class="masonry">';
        collectedData.forEach(item => {
            htmlContent += '<div class="item">';
            if (item.type === 'image') htmlContent += '<img src="' + item.content + '">';
            else htmlContent += '<p>' + item.content + '</p>';
            htmlContent += '</div>';
        });
        htmlContent += '</div></body></html>';

        resultWin.document.write(htmlContent);
        resultWin.document.close();
    };

    runCuration();
})();
