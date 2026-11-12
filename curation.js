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
    // 선택한 이미지를 브라우저 기본 다운로드 폴더에 개별 파일로 저장한다.
    // 폴더 선택 창·완료 알림창 없이 진행 상황은 버튼과 상단 문구로만 표시한다.
    const imgs = Array.from(document.querySelectorAll('.item-wrapper.selected img'));
    const status = document.getElementById('sel-count');
    if (imgs.length === 0) { status.textContent = '다운로드할 이미지를 선택해주세요'; return; }
    const btn = document.getElementById('dl-btn');
    btn.disabled = true;
    let ok = 0;
    const failed = [];
    for (let i = 0; i < imgs.length; i++) {
      const src = imgs[i].src;
      btn.textContent = '다운로드 ' + (i + 1) + '/' + imgs.length;
      const isThumb = !!imgs[i].closest('.item-wrapper').querySelector('.thumb-tag');
      const base = DL_FOLDER + '_' + String(i + 1).padStart(3, '0') + (isThumb ? '_thumb' : '');
      try {
        const res = await fetch(src, { credentials: 'omit' });
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
        setTimeout(() => URL.revokeObjectURL(url), 30000);
        ok++;
      } catch (e) {
        console.warn('[다운로드 실패]', src, e);
        failed.push(src);
      }
      await new Promise(r => setTimeout(r, 250));
    }
    btn.disabled = false;
    btn.textContent = '선택 이미지 다운로드';
    status.textContent = failed.length
      ? '저장 ' + ok + '개 · 실패 ' + failed.length + '개 (콘솔에 주소 표시)'
      : '저장 완료 ' + ok + '개 (다운로드 폴더)';
  }

  const runProcess = async () => {
    const loader = document.createElement('div');
    loader.style = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);padding:28px 44px;background:rgba(17,17,17,0.92);color:#f5f5f5;z-index:10000;border-radius:16px;text-align:center;font-size:15px;font-weight:500;line-height:1.7;letter-spacing:-0.2px;box-shadow:0 18px 48px rgba(0,0,0,0.35);font-family:"Pretendard",-apple-system,BlinkMacSystemFont,system-ui,Roboto,sans-serif;border:1px solid rgba(255,255,255,0.08);backdrop-filter:blur(8px);';
    loader.innerHTML = '<style>@keyframes shocoSpin{to{transform:rotate(360deg)}}</style>' +
      '<div style="width:28px;height:28px;margin:0 auto 14px;border:3px solid rgba(255,255,255,0.12);border-top-color:#a3e635;border-radius:50%;animation:shocoSpin 0.8s linear infinite"></div>' +
      '<div style="font-size:16px;font-weight:700;color:#fff">데이터 수집 중</div>' +
      '<div style="color:#a3a3a3;font-size:13px">몇 초 걸려요~ <span style="color:#a3e635">까꿍ㅎ</span></div>';
    document.body.appendChild(loader);

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    let rawData = [];
    let seenMedia = new Set();
    let seenTexts = new Set();

    // ---- 대표(썸네일) 이미지 수집 ----
    // 네이버가 갤러리 클래스명(.K4l1t0ryUq 등)을 바꾸면서 기존 선택자로는 대표 이미지를 못 찾게 됨.
    // 대시보드(naver_download.py)와 같은 순서로 찾는다:
    // ① 페이지 초기 데이터(__PRELOADED_STATE__)의 대표·추가 이미지 ② img[alt="대표이미지"]
    // ③ 기존 갤러리 선택자 ④ og:image
    const absUrl = (u) => { try { return u ? new URL(u, location.href).href : ''; } catch (e) { return ''; } };
    const imgSrc = (el) => el.getAttribute('data-src') || el.getAttribute('data-lazy-src') || el.currentSrc || el.src;
    const thumbUrls = [];
    try {
      const state = window.__PRELOADED_STATE__;
      const product = state && (state.simpleProductForDetailPage || (state.product && state.product.A) || state.product);
      const pushProduct = (v) => {
        const u = absUrl(typeof v === 'string' ? v : (v && (v.originalUrl || v.url)) || '');
        if (u) thumbUrls.push(u);
      };
      if (product) {
        pushProduct(product.representativeImageUrl || product.representativeImage);
        (product.optionalImageUrls || product.optionalImages || []).forEach(pushProduct);
      }
    } catch (e) { /* 초기 데이터가 없는 페이지 */ }
    if (thumbUrls.length === 0) {
      document.querySelectorAll('img[alt="대표이미지"], .K4l1t0ryUq ul li img, .mdFeBiFowv img.TgO1N1wWTm').forEach(img => {
        let src = absUrl(imgSrc(img));
        if (src && !src.includes('dthumb')) src = src.replace(/([?&])type=[^&]+/, '$1type=m1000_pd');
        if (src) thumbUrls.push(src);
      });
    }
    if (thumbUrls.length === 0) {
      const og = (document.querySelector('meta[property="og:image"]') || {}).content;
      if (og) thumbUrls.push(absUrl(og));
    }
    const seenThumbKeys = new Set();
    thumbUrls.forEach(u => {
      if (!u.startsWith('http')) return;
      const key = u.includes('pstatic.net') ? u.split('?')[0] : u;
      if (seenThumbKeys.has(key) || seenMedia.has(u)) return;
      seenThumbKeys.add(key);
      seenMedia.add(u);
      rawData.push({ type: 'image', content: u, label: 'THUMB' });
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
    // 상품명: 상품 정보 영역의 제목(h3) → og:title(' : 스토어명' 제거) → 문서 제목 순
    const h3 = document.querySelector('h3');
    const ogTitle = (document.querySelector('meta[property="og:title"]') || {}).content || '';
    const dlFolder = ((h3 && h3.innerText.trim()) || ogTitle.split(' : ')[0] || document.title.split(' : ')[0] || '')
      .replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, ' ').trim().replace(/[. ]+$/, '').slice(0, 60) || '상품이미지';
    html += 'var DL_FOLDER = ' + JSON.stringify(dlFolder).replace(/</g, '\\u003c') + ';';
    html += updateCount.toString() + selectAllImages.toString() + downloadSelected.toString();
    html += 'function exportSelected() { const selected = document.querySelectorAll(".item-wrapper.selected"); if (selected.length === 0) { alert("항목을 선택해주세요."); return; } const win = window.open(); let out = "<html><head><style>body{background:#000;margin:0;padding:10px;} .masonry{column-width:200px;column-gap:6px;} .box{break-inside:avoid;margin-bottom:6px;background:#111;border-radius:4px;overflow:hidden;} img,video{width:100%;} .txt{color:#ccc;padding:12px;font-size:12px;line-height:1.6;white-space:pre-wrap;}</style></head><body><div class=\'masonry\'>"; selected.forEach(el => { const img = el.querySelector("img"); const vid = el.querySelector("video"); const txt = el.querySelector(".text-content"); if(img) out += "<div class=\'box\'><img src=\'"+img.src+"\'></div>"; else if(vid) out += "<div class=\'box\'><video src=\'"+vid.src+"\' controls></video></div>"; else if(txt) out += "<div class=\'box\'><div class=\'txt\'>"+txt.innerText+"</div></div>"; }); out += "</div></body></html>"; win.document.write(out); win.document.close(); }';
    html += '<\/script></body></html>';
    
    newTab.document.write(html);
    newTab.document.close();
  };

  runProcess();
})();
