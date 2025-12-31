(function() {
    const run = async () => {
        console.log('Curation Start');
        const loader = document.createElement('div');
        loader.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);padding:20px;background:#1e3a8a;color:#fff;z-index:10000;border-radius:15px;text-align:center;font-family:sans-serif;';
        loader.innerHTML = '수집 중...';
        document.body.appendChild(loader);

        let data = [];
        document.querySelectorAll('img').forEach(img => {
            let src = img.getAttribute('data-src') || img.src;
            if (src && src.startsWith('http')) data.push(src);
        });

        setTimeout(() => {
            document.body.removeChild(loader);
            if (data.length > 0) {
                const win = window.open();
                win.document.write('<html><body style="background:#000">' + data.map(s => '<img src="'+s+'" style="width:200px;margin:5px">').join('') + '</body></html>');
                win.document.close();
            } else {
                alert('이미지를 찾지 못했습니다.');
            }
        }, 1000);
    };
    run();
})();
