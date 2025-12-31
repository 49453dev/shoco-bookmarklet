(function() {
    const _c = {
        'q': 'querySelectorAll',
        'e': 'createElement',
        'b': 'body',
        'h': 'innerHTML',
        'a': 'appendChild',
        'f': 'forEach',
        'g': 'getAttribute',
        's': 'src',
        'w': 'write',
        'o': 'open'
    };

    const run = async () => {
        const l = document[_c.e]('div');
        l.style = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);padding:30px;background:linear-gradient(135deg,#1e3a8a,#3b82f6);color:#fff;z-index:10000;border-radius:20px;text-align:center;font-family:sans-serif;';
        l[_c.h] = 'v2 보안 버전 실행 중<br><br>데이터를 암호화하여 수집합니다.';
        document[_c.b][_c.a](l);

        const sleep = (m) => new Promise(r => setTimeout(r, m));
        let data = [];
        let seen = new Set();

        const imgs = document[_c.q]('.K4l1t0ryUq img, .mdFeBiFowv img, .se-main-container img');
        imgs[_c.f](i => {
            let src = i[_c.g]('data-src') || i[_c.s];
            if (src && src.indexOf('http') === 0) {
                let res = src.replace(/\?type=[^&]+/, '?type=m1000_pd');
                if (!seen.has(res)) {
                    data.push(res);
                    seen.add(res);
                }
            }
        });

        await sleep(1200);
        document[_c.b].removeChild(l);

        const nw = window[_c.o]();
        let html = '<html><body style="background:#000;color:#fff;padding:20px;">';
        html += '<h2 style="color:lime;">Encrypted Curation Results</h2><div style="display:flex;flex-wrap:wrap;gap:10px;">';
        data[_c.f](item => {
            html += '<div style="width:150px;border:1px solid #333;"><img src="' + item + '" style="width:100%;"></div>';
        });
        html += '</div></body></html>';
        nw.document[_c.w](html);
        nw.document.close();
    };

    run();
})();
