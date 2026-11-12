(function() {
  // ---- 결과 탭에 주입되는 함수 (Function.toString으로 그대로 삽입) ----
  function updateCount() {
    const n = document.querySelectorAll('.item-wrapper.selected').length;
    const imgN = document.querySelectorAll('.item-wrapper.selected img').length;
    const el = document.getElementById('sel-count');
    if (el) el.textContent = '선택 ' + n + '개 (이미지 ' + imgN + ')';
  }

  function selectAllImages() {
    document.querySelectorAll('.item-wrapper').forEach(el => {
      if (el.querySelector('img')) {
        el.classList.add('selected');
        el.querySelector('.chk-box').checked = true;
      }
    });
    updateCount();
  }

  async function downloadSelected() {
    const imgs = Array.from(document.querySelectorAll('.item-wrapper.selected img'));
    if (imgs.length === 0) { alert('다운로드할 이미지를 선택해주세요.'); return; }
    const btn = document.getElementById('dl-btn');
    btn.disabled = true;
    let ok = 0;
    const failed = [];
    for (let i = 0; i < imgs.length; i++) {
      const src = imgs[i].src;
      btn.textContent = '다운로드 ' + (i + 1) + '/' + imgs.length;
      const isThumb = !!imgs[i].closest('.item-wrapper').querySelector('.thumb-tag');
      const base = DL_PREFIX + String(i + 1).padStart(3, '0') + (isThumb ? '_thumb' : '');
      try {
        const res = await fetch(src);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const blob = await res.blob();
        let ext = (blob.type.split('/')[1] || 'jpg').split(';')[0].split('+')[0];
        if (ext === 'jpeg') ext = 'jpg';
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = base + '.' + ext;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        ok++;
      } catch (e) {
        failed.push(src);
      }
      await new Promise(r => setTimeout(r, 300));
    }
    btn.disabled = false;
    btn.textContent = '선택 이미지 다운로드';
    if (failed.length === 0) {
      alert('이미지 ' + ok + '개 다운로드 완료');
    } else {
      alert('완료 ' + ok + '개 / 실패 ' + failed.length + '개\n실패한 이미지는 새 탭 목록에서 직접 저장해주세요.');
      const w = window.open();
      if (w) {
        w.document.write('<html><body style="background:#000;color:#ccc;font-family:sans-serif">' +
          failed.map(u => '<p><a style="color:lime" href="' + u + '" target="_blank">' + u + '</a></p>').join('') +
          '</body></html>');
        w.document.close();
      }
    }
  }

  const runProcess = async () => {
    const loader = document.createElement('div');
    loader.style = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);padding:30px 50px;background:linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);color:#fff;z-index:10000;border-radius:20px;text-align:center;font-size:18px;font-weight:600;line-height:1.6;box-shadow: 0 20px 50px rgba(0,0,0,0.4);font-family:"Pretendard",-apple-system,BlinkMacSystemFont,system-ui,Roboto,sans-serif;border:1px solid rgba(255,255,255,0.2);backdrop-filter:blur(10px);';
    loader.innerHTML = '데이터 수집 중...<br><br>몇초 걸려요~<br><br>까꿍ㅎ';
    document.body.appendChild(loader);

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    let rawData = [];
    let seenMedia = new Set();
    let seenTexts = new Set();

    const thumbItems = document.querySelectorAll('.K4l1t0ryUq ul li img, .mdFeBiFowv img.TgO1N1wWTm');
    thumbItems.forEach(img => {
      let src = img.getAttribute('data-src') || img.src;
      if (src && src.startsWith('http')) {
        let highRes = src.replace(/\?type=[^&]+/, '?type=m1000_pd');
        if (src.includes('dthumb')) highRes = src;
        if (!seenMedia.has(highRes)) {
          rawData.push({ type: 'image', content: highRes, label: 'THUMB' });
          seenMedia.add(highRes);
        }
      }
    });

    let expandButton = document.querySelector('#INTRODUCE button, [class*="Button_expand"], ._1_vAasS8Tq');
    if (!expandButton) {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.innerText.includes('펼쳐보기')) { expandButton = btn; break; }
      }
    }
    if (expandButton) {
      expandButton.scrollIntoView({block: 'center'});
      await sleep(500);
      expandButton.click();
      await sleep(1500);
    }

    let lastHeight = 0;
    let sameCount = 0;
    while (sameCount < 2) {
      window.scrollTo(0, document.body.scrollHeight);
      await sleep(1000);
      let newHeight = document.body.scrollHeight;
      if (newHeight === lastHeight) sameCount++;
      else { sameCount = 0; lastHeight = newHeight; }
      window.scrollBy(0, -600);
      await sleep(300);
    }

    const contentModules = document.querySelectorAll('[id^="SE-"], [id^="wpc-"], .se-module, .se-section-video, .se-main-container img, .se-text-paragraph');
    contentModules.forEach(module => {
      const video = module.tagName === 'VIDEO' ? module : module.querySelector('video');
      if (video) {
        const vSrc = video.src || video.getAttribute('src');
        if (vSrc && !seenMedia.has(vSrc)) {
          rawData.push({ type: 'video', content: vSrc });
          seenMedia.add(vSrc);
          return;
        }
      }
      
      const imgs = module.tagName === 'IMG' ? [module] : module.querySelectorAll('img');
      imgs.forEach(img => {
        let iSrc = img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || img.src;
        if (iSrc && iSrc.startsWith('http') && !iSrc.includes('space_ball')) {
          if (!seenMedia.has(iSrc)) {
            rawData.push({ type: 'image', content: iSrc });
            seenMedia.add(iSrc);
          }
        }
      });

      let text = module.innerText ? module.innerText.trim() : '';
      if (text.length > 1 && !seenTexts.has(text) && !module.querySelector('img')) {
        const isCss = /\{|:.*;|\.wpc-|width:|height:|display:|position:|background-color:|UTF-8/.test(text);
        if (!isCss) {
          rawData.push({ type: 'text', content: text });
          seenTexts.add(text);
        }
      }
    });

    let finalData = [];
    let textBuffer = [];
    rawData.forEach(item => {
      if (item.type === 'text') {
        textBuffer.push(item.content);
      } else {
        if (textBuffer.length > 0) {
          finalData.push({ type: 'text', content: textBuffer.join('\n') });
          textBuffer = [];
        }
        finalData.push(item);
      }
    });
    if (textBuffer.length > 0) finalData.push({ type: 'text', content: textBuffer.join('\n') });

    document.body.removeChild(loader);

    const newTab = window.open();
    let html = '<html><head><title>텍스트 통합 큐레이션</title><style>';
    html += 'body { margin: 0; padding: 5px; background: #000; color: #fff; font-family: sans-serif; }';
    html += '.btn-container { position: fixed; top: 15px; right: 15px; z-index: 1000; display: flex; gap: 8px; }';
    html += '.signature { position: fixed; top: 15px; left: 15px; z-index: 1000; font-family: monospace; }';
    html += '.signature a { font-size: 11px; color: #666; text-decoration: none; letter-spacing: 0.5px; transition: color 0.2s; }';
    html += '.signature a:hover { color: lime; }';
    html += '.masonry { column-width: 200px; column-gap: 6px; width: 100%; margin-top: 55px; }';
    html += '.item-wrapper { break-inside: avoid; margin-bottom: 6px; background: #111; border: 1px solid #222; cursor: pointer; position: relative; border-radius: 4px; overflow: hidden; transition: transform 0.1s; }';
    html += '.item-wrapper:hover { transform: scale(1.02); z-index: 10; }';
    html += '.item-wrapper.selected { border: 2px solid lime; box-shadow: 0 0 10px lime; }';
    html += 'img, video { width: 100%; height: auto; display: block; pointer-events: none; }';
    html += '.text-content { padding: 12px; font-size: 12px; line-height: 1.6; white-space: pre-wrap; word-break: break-all; color: #ccc; background: #151515; pointer-events: none; }';
    html += '.thumb-tag { position: absolute; bottom: 5px; right: 5px; background: #00c73c; color: #000; padding: 2px 5px; font-size: 9px; font-weight: bold; border-radius: 2px; }';
    html += '.chk-box { position: absolute; top: 5px; left: 5px; width: 18px; height: 18px; z-index: 20; accent-color: lime; cursor: pointer; }';
    html += '.base-btn { padding: 8px 16px; font-size: 12px; font-weight: bold; border-radius: 15px; cursor: pointer; border: none; }';
    html += '.export-btn { background: #3b82f6; color: #fff; }';
    html += '.deselect-btn { background: #444; color: #fff; }';
    html += '.select-btn { background: #16a34a; color: #fff; }';
    html += '.dl-btn { background: #f59e0b; color: #000; }';
    html += '.dl-btn:disabled { opacity: 0.6; cursor: wait; }';
    html += '.sel-count { align-self: center; font-size: 12px; color: #aaa; margin-right: 4px; }';
    html += '</style></head><body>';
    html += '<div class="signature"><a href="https://www.threads.net/@49453_" target="_blank">made by 49453 @스레드</a></div>';
    html += '<div class="btn-container"><span id="sel-count" class="sel-count">선택 0개 (이미지 0)</span><button class="base-btn select-btn" onclick="selectAllImages()">이미지 전체선택</button><button class="base-btn deselect-btn" onclick="deselectAll()">전체해제</button><button id="dl-btn" class="base-btn dl-btn" onclick="downloadSelected()">선택 이미지 다운로드</button><button class="base-btn export-btn" onclick="exportSelected()">선택 모아보기</button></div>';
    html += '<div class="masonry">';

    finalData.forEach((item, idx) => {
      const targetUrl = (item.type !== 'text') ? item.content : '';
      html += `<div class="item-wrapper" onclick="toggleItem(this)" ondblclick="if('${targetUrl}') window.open('${targetUrl}', '_blank')">`;
      html += `<input type="checkbox" class="chk-box" onclick="event.stopPropagation(); toggleItem(this.parentElement)">`;
      if (item.label === 'THUMB') html += `<div class="thumb-tag">대표</div>`;
      if (item.type === 'image') html += `<img src="${item.content}">`;
      else if (item.type === 'video') html += `<video src="${item.content}" controls></video>`;
      else html += `<div class="text-content">${item.content}</div>`;
      html += '</div>';
    });

    html += '</div><script>';
    html += 'function toggleItem(el) { const chk = el.querySelector(".chk-box"); if (event.target.type !== "checkbox") { chk.checked = !chk.checked; } el.classList.toggle("selected", chk.checked); updateCount(); }';
    html += 'function deselectAll() { document.querySelectorAll(".item-wrapper").forEach(el => { el.classList.remove("selected"); el.querySelector(".chk-box").checked = false; }); updateCount(); }';
    const dlPrefix = ((document.querySelector('meta[property="og:title"]') || {}).content || document.title || '')
      .replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, '_').slice(0, 40);
    html += 'var DL_PREFIX = ' + JSON.stringify(dlPrefix ? dlPrefix + '_' : '').replace(/</g, '\\u003c') + ';';
    html += updateCount.toString() + selectAllImages.toString() + downloadSelected.toString();
    html += 'function exportSelected() { const selected = document.querySelectorAll(".item-wrapper.selected"); if (selected.length === 0) { alert("항목을 선택해주세요."); return; } const win = window.open(); let out = "<html><head><style>body{background:#000;margin:0;padding:10px;} .masonry{column-width:200px;column-gap:6px;} .box{break-inside:avoid;margin-bottom:6px;background:#111;border-radius:4px;overflow:hidden;} img,video{width:100%;} .txt{color:#ccc;padding:12px;font-size:12px;line-height:1.6;white-space:pre-wrap;}</style></head><body><div class=\'masonry\'>"; selected.forEach(el => { const img = el.querySelector("img"); const vid = el.querySelector("video"); const txt = el.querySelector(".text-content"); if(img) out += "<div class=\'box\'><img src=\'"+img.src+"\'></div>"; else if(vid) out += "<div class=\'box\'><video src=\'"+vid.src+"\' controls></video></div>"; else if(txt) out += "<div class=\'box\'><div class=\'txt\'>"+txt.innerText+"</div></div>"; }); out += "</div></body></html>"; win.document.write(out); win.document.close(); }';
    html += '<\/script></body></html>';
    
    newTab.document.write(html);
    newTab.document.close();
  };

  runProcess();
})();
