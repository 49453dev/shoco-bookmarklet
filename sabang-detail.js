
(() => {
  const id = 'sabangnet-detail-expand';

  // 사방넷 상세페이지 스크롤 영역 확장
  if (!document.getElementById(id)) {
    const style = document.createElement('style');
    style.id = id;

    style.textContent = `
      .el-scrollbar,
      .el-scrollbar__wrap,
      .el-scrollbar__view {
        height: auto !important;
        max-height: none !important;
        overflow: visible !important;
      }

      html, body, #app {
        height: auto !important;
        min-height: 100% !important;
        max-height: none !important;
        overflow-y: auto !important;
      }

      .el-scrollbar__bar {
        display: none !important;
      }
    `;

    document.head.appendChild(style);
  }

  document.querySelectorAll('.el-scrollbar__wrap')
    .forEach(element => element.scrollTop = 0);

  // 상세페이지 이미지 수집
  const images = [
    ...document.querySelectorAll('.el-scrollbar__view img')
  ].filter(img =>
    (img.currentSrc || img.src) &&
    img.getBoundingClientRect().width > 30
  );

  const urls = [
    ...new Set(images.map(img => img.currentSrc || img.src))
  ];

  if (!urls.length) {
    alert('상세페이지 이미지를 찾지 못했습니다.');
    return;
  }

  // 이미지 목록 창 생성
  const viewer = window.open('', '_blank');

  if (!viewer) {
    alert('팝업 차단을 해제해 주세요.');
    return;
  }

  const doc = viewer.document;
  doc.title = '사방넷 상세페이지 이미지 모아보기';

  const style = doc.createElement('style');

  style.textContent = `
    body {
      background: #101010;
      color: #fff;
      font: 14px sans-serif;
      margin: 0;
      padding: 65px 12px 20px;
    }

    .bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #222;
      padding: 12px;
      z-index: 10;
      display: flex;
      gap: 10px;
      align-items: center;
    }

    button {
      padding: 8px 14px;
      cursor: pointer;
    }

    .grid {
      columns: 220px;
      column-gap: 8px;
    }

    .item {
      break-inside: avoid;
      margin-bottom: 8px;
      background: #222;
      padding: 5px;
      border: 2px solid transparent;
      cursor: pointer;
    }

    .item.selected {
      border-color: #5f5;
    }

    .item img {
      width: 100%;
      height: auto;
      display: block;
    }

    .item input {
      margin: 5px;
    }
  `;

  doc.head.appendChild(style);

  // 상단 버튼
  const bar = doc.createElement('div');
  bar.className = 'bar';

  const count = doc.createElement('span');
  count.textContent = `총 ${urls.length}개`;

  const clearButton = doc.createElement('button');
  clearButton.textContent = '전체 해제';

  const exportButton = doc.createElement('button');
  exportButton.textContent = '선택 모아보기';

  bar.append(count, clearButton, exportButton);
  doc.body.appendChild(bar);

  // 이미지 그리드
  const grid = doc.createElement('div');
  grid.className = 'grid';
  doc.body.appendChild(grid);

  urls.forEach(url => {
    const item = doc.createElement('div');
    item.className = 'item';

    const checkbox = doc.createElement('input');
    checkbox.type = 'checkbox';

    const img = doc.createElement('img');
    img.src = url;
    img.loading = 'lazy';

    item.append(checkbox, img);

    const update = () => {
      item.classList.toggle('selected', checkbox.checked);
    };

    checkbox.addEventListener('change', update);

    item.addEventListener('click', event => {
      if (event.target === checkbox) return;
      checkbox.checked = !checkbox.checked;
      update();
    });

    grid.appendChild(item);
  });

  // 전체 선택 해제
  clearButton.onclick = () => {
    grid.querySelectorAll('input').forEach(checkbox => {
      checkbox.checked = false;
      checkbox.parentElement.classList.remove('selected');
    });
  };

  // 선택 이미지 모아보기
  exportButton.onclick = () => {
    const selected = [
      ...grid.querySelectorAll('.item')
    ]
      .filter(item => item.querySelector('input').checked)
      .map(item => item.querySelector('img').src);

    if (!selected.length) {
      viewer.alert('이미지를 선택해 주세요.');
      return;
    }

    const output = window.open('', '_blank');

    if (!output) {
      viewer.alert('팝업 차단을 확인해 주세요.');
      return;
    }

    output.document.title = '선택한 상세페이지 이미지';
    output.document.body.style.cssText =
      'margin:0;background:#111;text-align:center';

    selected.forEach(url => {
      const img = output.document.createElement('img');
      img.src = url;
      img.style.cssText =
        'display:block;max-width:100%;height:auto;margin:0 auto 8px';

      output.document.body.appendChild(img);
    });
  };
})();
