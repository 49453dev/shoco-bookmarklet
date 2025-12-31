(function() {
    const run = async () => {
        const loader = document.createElement('div');
        loader.style = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);padding:30px;background:#1e3a8a;color:#fff;z-index:10000;border-radius:20px;text-align:center;font-family:sans-serif;';
        loader.innerHTML = '데이터 수집 중...<br>잠시만 기다려주세요.';
        document.body.appendChild(loader);

        const sleep = (ms) => new Promise(res => setTimeout(res, ms));
        let data = [];
        let seen = new Set();

        const imgs = document.querySelectorAll('img');
        imgs.forEach(img => {
            let src = img.getAttribute('data-src') || img.src;
            if (src && src.startsWith('http') && !seen.has(src)) {
                data.push({ type: 'image', content: src });
                seen.add(src);
            }
        });

        const texts = document.querySelectorAll('.se-text-paragraph, .se-content');
        texts.forEach(t => {
            let txt = t.innerText.trim();
            if (txt.length > 5 && !seen.has(txt)) {
                data.push({ type: 'text', content: txt });
                seen.add(txt);
            }
        });

        document.body.removeChild(loader);
        const win = window.open();
        let html = '<html><head><style>body{background:#000;color:#fff;font-family:sans-serif;padding:20px;} .masonry{column-width:250px;column-gap:10px;} .item{break-inside:avoid;margin-bottom:10px;background:#111;padding:10px;border:1px solid #333;border-radius:8px;} img{width:100%;border-radius:4px;}</style></head><body><div class="masonry">';
        
        data.forEach(item => {
            html += '<div class="item">';
            if (item.type === 'image') html += '<img src="' + item.content + '">';
            else html += '<p>' + item.content + '</p>';
            html += '</div>';
        });
        
        html += '</div></body></html>';
        win.document.write(html);
        win.document.close();
    };
    run();
})();
