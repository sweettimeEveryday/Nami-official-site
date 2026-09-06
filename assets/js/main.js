/* 西園寺ナミ OFFICIAL SITE — 共通スクリプト
   STUDIO で再現する場合、ここでやっていることは3つだけです:
   1) スクロールでヘッダーに背景が付く
   2) スマホのハンバーガーメニュー開閉
   3) 要素がビューポートに入ったらフェードアップ
   いずれも STUDIO の「スクロールアニメーション」「メニュー」機能で置き換えられます。 */
(function () {
  'use strict';

  /* ---- 1. ヘッダー ---- */
  var hd = document.querySelector('.hd');
  if (hd) {
    var onScroll = function () {
      hd.classList.toggle('is-stuck', window.scrollY > 40);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- 2. ハンバーガー ---- */
  var burger = document.querySelector('.burger');
  if (burger) {
    burger.addEventListener('click', function () {
      var open = document.body.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    document.querySelectorAll('.nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---- 3. スクロールリビール ---- */
  var targets = document.querySelectorAll('.rv');
  if (targets.length) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
      targets.forEach(function (t) { io.observe(t); });
    } else {
      targets.forEach(function (t) { t.classList.add('is-in'); });
    }
  }

  /* ---- 4. ヒーロー動画: 画面比率に合わせて素材を出し分け ----
     縦長の画面では正方形版、それ以外は 16:9 版を読み込む。
     motion を減らす設定の人にはポスター画像だけを見せる。 */
  var hero = document.getElementById('heroVideo');
  if (hero) {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      hero.removeAttribute('autoplay');
      hero.load();
    } else {
      var square = window.matchMedia('(max-aspect-ratio: 1/1)').matches;
      // 高解像度版を使う（1440p）。細部がつぶれないように、あえて大きめの素材を読ませています
      hero.src = square
        ? 'assets/video/logo_motion_1440x1440.mp4'
        : 'assets/video/logo_motion_2560x1440.mp4';
      hero.poster = square
        ? 'assets/video/logo_poster_1440x1440.jpg'
        : 'assets/video/logo_poster_2560x1440.jpg';
      var p = hero.play();
      if (p && p.catch) { p.catch(function () { /* 自動再生が拒否されてもポスターが残る */ }); }
    }
  }

  /* ---- 5. 現在ページをナビでハイライト ---- */
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a').forEach(function (a) {
    if (a.getAttribute('href') === here) { a.setAttribute('aria-current', 'page'); }
  });
})();

/* 西園寺ナミ OFFICIAL SITE — image stream
   1) .stream__src に書いた項目から、左右のレールに9枚ずつカードを組む
   2) カーソルの位置で消失点をわずかに動かす（視点が寄ってくる感じ）
   3) カードを押すと中央にカードが開き、説明文とリンクを出す
   編集するのは index.html の .stream__item だけで、ここは触らなくて大丈夫です。 */
(function () {
  'use strict';

  var box = document.querySelector('[data-stream]');
  if (!box) { return; }

  var items = Array.prototype.slice.call(box.querySelectorAll('.stream__item'));
  if (!items.length) { return; }

  var SPEED = 18;  /* 1枚がコリドーを渡りきる秒数。style.css の animation-duration と対 */
  /* 1レールあたりの枚数。左右2本で全部の絵が出るように画像数から決める。
     少なすぎると帯が切れ、多すぎると重くなるので 9〜14 に収める。 */
  var CARDS = Math.min(14, Math.max(9, Math.ceil(items.length / 2)));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- 1. レールを組む ---- */
  Array.prototype.forEach.call(box.querySelectorAll('.stream__rail'), function (rail, ri) {
    /* 画像が1レールの枚数より多いとき、左右で開始位置をずらして
       すべての絵が画面に出るようにする（同じ並びだと先頭9枚しか出ない）。 */
    var shift = ri * Math.floor(items.length / 2);
    for (var i = 0; i < CARDS; i++) {
      var src = items[(i + shift) % items.length];
      var title = src.getAttribute('data-title');
      /* data-title のない行は飾り。押せないので div で作る。 */
      var el = document.createElement(title ? 'button' : 'div');
      el.className = 'stream__card';
      if (title) {
        el.type = 'button';
        /* コリドーは装飾（.stream に aria-hidden）。同じ行き先は下の
           Stream & Music / Goods & Support のカードから辿れるので、
           キーボードとスクリーンリーダーはそちらに任せます。 */
        el.tabIndex = -1;
        el.setAttribute('aria-label', title + ' を開く');
        el.addEventListener('click', function (item) {
          return function () { open(item); };
        }(src));
      }
      /* 最初のフレームから帯が埋まって見えるよう、負のディレイで散らす */
      el.style.setProperty('--sd', (-(i * SPEED) / CARDS).toFixed(3) + 's');
      var img = document.createElement('img');
      img.setAttribute('data-src', src.getAttribute('data-img'));
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.draggable = false;
      /* カードは 18:25 の縦長。元画像がそれと違う比率のとき、
         data-pos でどこを残すかを決める。
           "20"     … 上下の位置だけ（0=上寄せ / 100=下寄せ）
           "30 50"  … 左右と上下の両方（横長の画像用） */
      var pos = (src.getAttribute('data-pos') || '50').trim().split(/\s+/);
      img.style.objectPosition = pos.length > 1
        ? pos[0] + '% ' + pos[1] + '%'
        : 'center ' + pos[0] + '%';
      el.appendChild(img);
      rail.appendChild(el);
    }
  });

  /* ---- 2. カーソルで消失点を動かす ----
     ±8% / ±6% だけ。大きく振ると酔うので、あくまで気配程度に留めています。 */
  if (!reduce) {
    var cx = 50, cy = 55, tx = 50, ty = 55, raf = null;
    var tick = function () {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      box.style.setProperty('--stream-ox', cx.toFixed(2) + '%');
      box.style.setProperty('--stream-oy', cy.toFixed(2) + '%');
      raf = (Math.abs(tx - cx) > 0.02 || Math.abs(ty - cy) > 0.02)
        ? requestAnimationFrame(tick) : null;
    };
    var aim = function (x, y) {
      var r = box.getBoundingClientRect();
      tx = 50 + ((x - r.left) / r.width - 0.5) * 16;
      ty = 55 + ((y - r.top) / r.height - 0.5) * 12;
      if (!raf) { raf = requestAnimationFrame(tick); }
    };
    box.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') { return; }
      aim(e.clientX, e.clientY);
    }, { passive: true });
    box.addEventListener('pointerleave', function () {
      tx = 50; ty = 55;
      if (!raf) { raf = requestAnimationFrame(tick); }
    });
  }

  /* ---- 3. 画像と背景動画の読み込み ----
     コリドーはページの先頭ではないので、開いた瞬間に全部取りに行くと
     初回表示が数MB重くなる。帯が画面に近づいてから読み込む。
     （カードは3D変形されているぶん、loading="lazy" だけでは効きません） */
  function loadMedia() {
    Array.prototype.forEach.call(box.querySelectorAll('img[data-src]'), function (im) {
      im.src = im.getAttribute('data-src');
      im.removeAttribute('data-src');
    });
    var bg = document.getElementById('streamBg');
    if (!bg) { return; }
    if (bg.getAttribute('data-poster')) {
      bg.poster = bg.getAttribute('data-poster');
      bg.removeAttribute('data-poster');
    }
    /* 動きを減らす設定の人には動画を読み込ませず、ポスター画像だけを見せる */
    if (reduce || bg.src) { return; }
    bg.src = window.matchMedia('(min-width: 900px)').matches
      ? 'assets/video/stream_bg_1440.mp4'
      : 'assets/video/stream_bg_900.mp4';
    bg.load();
    var bp = bg.play();
    if (bp && bp.catch) { bp.catch(function () { /* 拒否されてもポスターが残る */ }); }
  }

  /* ヒーローとフォントの読み込みが済んでから見張りはじめる。
     コリドーはヒーローのすぐ下なので、先に走らせると初回描画と
     帯域を奪い合ってしまう。 */
  function watch() {
    if (!('IntersectionObserver' in window)) { loadMedia(); return; }
    var mio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { loadMedia(); mio.disconnect(); }
      });
    }, { rootMargin: '150px 0px' });
    mio.observe(box);
  }
  if (document.readyState === 'complete') { watch(); }
  else { window.addEventListener('load', watch); }

  /* ---- 4. 中央に開くカード ---- */
  var lb = document.getElementById('streamLb');
  if (!lb) { return; }
  var lbImg = document.getElementById('lbImg');
  var lbEn = document.getElementById('lbEn');
  var lbTitle = document.getElementById('lbTitle');
  var lbText = document.getElementById('lbText');
  var lbBtns = document.getElementById('lbBtns');
  var last = null;

  function open(item) {
    lbImg.src = item.getAttribute('data-img');
    lbImg.alt = item.getAttribute('data-title') || '';
    lbEn.textContent = item.getAttribute('data-en') || '';
    lbTitle.textContent = item.getAttribute('data-title') || '';
    lbText.textContent = (item.textContent || '').trim();

    lbBtns.innerHTML = '';
    var href = item.getAttribute('href');
    if (href) {
      var a = document.createElement('a');
      a.className = 'btn btn--fill';
      a.href = href;
      a.textContent = item.getAttribute('data-cta') || 'ひらく';
      if (item.getAttribute('target')) { a.target = item.getAttribute('target'); }
      a.rel = 'noopener';
      lbBtns.appendChild(a);
    }

    last = document.activeElement;
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () { lb.classList.add('is-in'); });
    lb.querySelector('.lb__x').focus();
  }

  function close() {
    lb.classList.remove('is-in');
    document.body.style.overflow = '';
    var done = function () { lb.hidden = true; };
    if (reduce) { done(); } else { setTimeout(done, 400); }
    if (last && last.focus) { last.focus(); }
  }

  lb.addEventListener('click', function (e) {
    if (e.target.closest('[data-lb-close]')) { close(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !lb.hidden) { close(); }
  });
  /* パネルの外にフォーカスが逃げないように、末尾から先頭へ巻き戻す */
  lb.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') { return; }
    var f = lb.querySelectorAll('button, a[href]');
    if (!f.length) { return; }
    var first = f[0], lastEl = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
    else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
  });
})();

/* 西園寺ナミ OFFICIAL SITE — スクロール領域
   端まで来たら、その側のぼかしと案内を消すだけの処理。
   スクロール自体は CSS（overflow-y:auto）が担当しています。 */
(function () {
  'use strict';
  Array.prototype.forEach.call(document.querySelectorAll('[data-sarea]'), function (box) {
    var vp = box.querySelector('.sarea__vp');
    if (!vp) { return; }
    var update = function () {
      var max = vp.scrollHeight - vp.clientHeight;
      box.classList.toggle('is-top', vp.scrollTop <= 1);
      box.classList.toggle('is-end', max <= 1 || vp.scrollTop >= max - 1);
    };
    update();
    vp.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    /* 画像やフォントの読み込みで高さが変わることがあるので、念のためもう一度 */
    window.addEventListener('load', update);
  });
})();
