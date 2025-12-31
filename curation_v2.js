(function(){
    const _0x1a2b = ['querySelectorAll','createElement','body','innerHTML','appendChild','forEach','getAttribute','src','startsWith','replace','includes','push','querySelector','innerText','scrollTo','scrollHeight','removeChild','open','write','close','style'];
    const _0x3c4d = (idx) => _0x1a2b[idx];

    const runProcess = async () => {
        const loader = document[_0x3c4d(1)](_0x3c4d(13) === 'div' ? 'div' : 'div');
        loader[_0x3c4d(20)] = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);padding:30px 50px;background:linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);color:#fff;z-index:10000;border-radius:20px;text-align:center;font-size:18px;font-weight:600;box-shadow:0 20px 50px rgba(0,0,0,0.4);font-family:sans-serif;';
        loader[_0x3c4d(3)] = '데이터 암호화 수집 중...<br><br>안정화 버전 실행<br><br>까꿍ㅎ';
        document[_0x3c4d(2)][_0x3c4d(4)](loader);

        const wait = (ms) => new Promise(res => setTimeout(res, ms));
        let results = [];
        let cache = new Set();

        const images = document[_0x3c4d(0)]('.K4l1t0ryUq img, .mdFeBiFowv img, .se-main-container img');
        images[_0x3c4d(5)](img => {
            let path = img[_0x3c4d(6)]('data-src') || img[_0x3c4d(7)];
            if (path && path[_0x3c4d(8)]('http')) {
                let high = path[_0x3c4d(9)](/\?type=[^&]+/, '?type=m1000_pd');
                if (!cache.has(high)) {
                    results[_0x3c4d(11)]({type: 'image', content: high});
                    cache.add(high);
                }
            }
        });

        await wait(1500);
        document[_0x3c4d(2)][_0x3c4d(16)](loader);

        const win = window[_0x3c4d(17)]();
        let doc = '<html><body style="background:#000;color:#fff;padding:20px;font-family:sans-serif;">';
        doc += '<h2 style="color:lime;">Curation v2 (Encrypted)</h2><div style="display:flex;flex-wrap:wrap;gap:10px;">';
        results[_0x3c4d(5)](item => {
            doc += '<div style="width:200px;border:1px solid #333;border-radius:8px;overflow:hidden;"><img src="' + item.content + '" style="width:100%;display:block;"></div>';
        });
        doc += '</div></body></html>';
        win.document[_0x3c4d(18)](doc);
        win.document[_0x3c4d(19)]();
    };

    runProcess();
})();
