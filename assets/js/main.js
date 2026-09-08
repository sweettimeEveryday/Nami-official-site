/* 西園寺ナミ OFFICIAL SITE — 共通スクリプト
   STUDIO で再現する場合、ここでやっていることは3つだけです:
   1) スクロールでヘッダーに背景が付く
   2) スマホのハンバーガーメニュー開閉
   3) 要素がビューポートに入ったらフェードアップ
   いずれも STUDIO の「スクロールアニメーション」「メニュー」機能で置き換えられます。 */
(function () {
  'use strict';

  /* ---- 1. ヘッダー ----
     ヘッダーが透けてよいのは、下に暗いヒーローが敷いてあるトップだけ。
     ヒーローの無い下層ページは HTML の時点で is-stuck を付けてあるので、
     ここで外さない。外すと、明るい地の上に白っぽい文字が乗って読めなくなる。 */
  var hd = document.querySelector('.hd');
  if (hd && document.querySelector('.hero')) {
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
    var shut = function () {
      document.body.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    document.querySelectorAll('.nav a').forEach(function (a) {
      a.addEventListener('click', shut);
    });
    /* 開いたまま画面を広げると、PC幅ではメニューが消えるのに
       本文のスクロールが止まったままになる。幅が変わったら閉じる。 */
    var wide = window.matchMedia('(min-width: 721px)');
    var onWide = function (e) { if (e.matches) { shut(); } };
    if (wide.addEventListener) { wide.addEventListener('change', onWide); }
    else if (wide.addListener) { wide.addListener(onWide); }
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
    var square = window.matchMedia('(max-aspect-ratio: 1/1)').matches;

    /* 再生後に重ねる静止画。動画は 2560x1440 しかないので、Retina では
       1.25〜1.36倍に引き伸ばされてぼやける。この1枚は 3840x2160 あるので
       拡大されずに済む。読み込みは動画と同時に始めておき、表示だけ後にする。 */
    var still = document.getElementById('heroStill');
    var showStill = function (fade) {
      if (!still) { return; }
      if (!fade) { still.style.transition = 'none'; }
      still.classList.add('is-in');
    };
    if (still) {
      still.src = square
        ? 'assets/video/logo_final_2160x2160.jpg'
        : 'assets/video/logo_final_3840x2160.jpg';
      /* 静止画が用意されていないときは、動画の最後のフレームのまま見せる */
      still.addEventListener('error', function () { still.removeAttribute('src'); });
    }

    if (reduce) {
      /* 動きを減らす設定の人には、動画を読ませずに静止画だけを出す */
      hero.removeAttribute('autoplay');
      hero.poster = square
        ? 'assets/video/logo_poster_1440x1440.jpg'
        : 'assets/video/logo_poster_2560x1440.jpg';
      hero.load();
      showStill(false);
    } else {
      // 高解像度版を使う（1440p）。細部がつぶれないように、あえて大きめの素材を読ませています
      hero.src = square
        ? 'assets/video/logo_motion_1440x1440.mp4'
        : 'assets/video/logo_motion_2560x1440.mp4';
      hero.poster = square
        ? 'assets/video/logo_poster_1440x1440.jpg'
        : 'assets/video/logo_poster_2560x1440.jpg';
      hero.addEventListener('ended', function () { showStill(true); });
      var p = hero.play();
      if (p && p.catch) {
        /* 自動再生が拒否されたときは、ポスターのままにせず静止画を出す
           （ended が来ないので、待っていると永久に切り替わらない） */
        p.catch(function () { showStill(true); });
      }
    }
  }

  /* ---- 5. 現在ページをナビでハイライト ---- */
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a').forEach(function (a) {
    if (a.getAttribute('href') === here) { a.setAttribute('aria-current', 'page'); }
  });
})();

/* 西園寺ナミ OFFICIAL SITE — image stream
   1) .stream__src に書いた項目を左右のレールに振り分けてカードを組む
   2) カーソルの位置で消失点をわずかに動かす（視点が寄ってくる感じ）
   3) カードを押すと中央にカードが開く
        リンクのある絵 … 説明文とリンク
        リンクのない絵 … 感想を X に届ける入力欄（鑑賞導線）
   編集するのは index.html の .stream__item だけで、ここは触らなくて大丈夫です。 */
(function () {
  'use strict';

  var box = document.querySelector('[data-stream]');
  if (!box) { return; }

  var items = Array.prototype.slice.call(box.querySelectorAll('.stream__item'));
  if (!items.length) { return; }

  var SPEED = 18;  /* 1枚がコリドーを渡りきる秒数。style.css の animation-duration と対 */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* スマホは通信量を抑えるため assets/img/sp/ の軽い画像を読む。
     PCは 640px の元画像のまま。sp が無ければ自動で元画像に戻す。 */
  var SP = !window.matchMedia('(min-width: 900px)').matches;
  function light(path) {
    return SP ? path.replace('assets/img/', 'assets/img/sp/') : path;
  }

  /* 1レールに同時に出す枚数。
     以前は左右16枚ずつ（計32枚）出していて、手前でカードが3〜4枚
     重なり、絵が読めなくなっていた。半分に減らすと間隔が倍になって
     1枚ずつ見えるようになる。減らしたぶんの絵は「1周し終えたカードの
     中身を次の絵に差し替える」ことで出す。差し替えるのは奥の
     いちばん小さい瞬間（幅にして帯の 2% ほど）なので目に見えない。
     「動きを減らす」設定のときはカードが止まったままで差し替えが
     起きないので、そのときだけ以前と同じく全部を並べる。 */
  var PER_RAIL = reduce ? 99 : (SP ? 6 : 8);

  /* 左右への振り分け。1枚おきに交互へ入れるので、右レールと左レールに
     同じ絵が入ることはない。以前は剰余の折り返しで1枚だけ両側に出ていた。 */
  var queues = [[], []];
  items.forEach(function (it, i) { queues[i % 2].push(it); });

  var seats = [];   /* カード1枚ぶんの状態 { q, at, el, img, item } */
  var lit = false;  /* 画像の読み込みを始めたか */

  /* 押せることを知らせる印。左右のレールに1枚ずつ、ゆっくり明滅させる。
     見出しの下の一文だけだと、帯を見ている人の目には入らないため。
     一度でもカードを開いた人には二度と出さない。 */
  var TAP_KEY = 'nami.tapped';
  var hinting = true;
  try { hinting = window.localStorage.getItem(TAP_KEY) !== '1'; } catch (e) { /* 拒否されることがある */ }
  var hinted = [];

  /* ---- 1. レールを組む ---- */
  Array.prototype.forEach.call(box.querySelectorAll('.stream__rail'), function (rail, ri) {
    var q = queues[ri];
    if (!q.length) { return; }
    var n = Math.min(PER_RAIL, q.length);
    /* 印をつける席。うしろの席ほど手前に居るので、スクロールして
       帯が見えた直後から目に入る位置を選ぶ。左右で1つずらす。 */
    var mark = Math.max(0, n - 3 + ri);
    /* このレールが次に配る絵。最初の n 枚は席に配ってあるので n から。 */
    var cursor = { i: n % q.length };
    for (var i = 0; i < n; i++) {
      /* コリドーは装飾（.stream に aria-hidden）。同じ行き先は下の
         Stream & Music / Goods & Support のカードから辿れるので、
         キーボードとスクリーンリーダーはそちらに任せます。 */
      var el = document.createElement('button');
      el.className = 'stream__card';
      el.type = 'button';
      el.tabIndex = -1;
      /* 最初のフレームから帯が埋まって見えるよう、負のディレイで散らす */
      el.style.setProperty('--sd', (-(i * SPEED) / n).toFixed(3) + 's');

      var img = document.createElement('img');
      img.alt = '';
      img.decoding = 'async';
      img.draggable = false;
      el.appendChild(img);

      if (hinting && i === mark) { el.classList.add('is-hint'); hinted.push(el); }

      var seat = { q: q, at: i, el: el, img: img, item: null };
      face(seat);
      seats.push(seat);

      /* 触れた瞬間に光らせる。スマホにはカーソルが無く、hover の
         明るさが効かないので、押したことがここで分かるようにする。 */
      el.addEventListener('pointerdown', function (e) {
        var c = e.currentTarget;
        c.classList.add('is-tap');
        setTimeout(function () { c.classList.remove('is-tap'); }, 420);
      });
      el.addEventListener('click', function (s) {
        return function () { open(s.item); };
      }(seat));
      /* 1周したら、そのレールの列から次の絵を1枚もらう。
         0% は z=-258cqw の最奥なので、入れ替わったことは見えない。
         もらう順は1枚ずつ進むだけなので、いま出ている n 枚と
         かぶることがない（列の長さ 15〜16 ＞ 同時枚数 6〜8）。 */
      el.addEventListener('animationiteration', function (s, c) {
        return function () {
          s.at = c.i;
          c.i = (c.i + 1) % s.q.length;
          face(s);
        };
      }(seat, cursor));

      rail.appendChild(el);
    }
  });

  /* カードに絵を当てる。
     カードは 18:25 の縦長。元画像がそれと違う比率のとき、
     data-pos でどこを残すかを決める。
       "20"     … 上下の位置だけ（0=上寄せ / 100=下寄せ）
       "30 50"  … 左右と上下の両方（横長の画像用） */
  function face(seat) {
    var item = seat.q[seat.at];
    seat.item = item;
    var title = item.getAttribute('data-title');
    seat.el.setAttribute('aria-label', title ? title + ' を開く' : 'この一枚をひらく');
    var pos = (item.getAttribute('data-pos') || '50').trim().split(/\s+/);
    seat.img.style.objectPosition = pos.length > 1
      ? pos[0] + '% ' + pos[1] + '%'
      : 'center ' + pos[0] + '%';
    seat.img.setAttribute('data-src', item.getAttribute('data-img'));
    if (lit) { paint(seat.img); }
  }

  function paint(im) {
    var path = im.getAttribute('data-src');
    if (!path) { return; }
    im.removeAttribute('data-src');
    var lp = light(path);
    /* sp\ がまだ無いときは元の画像に戻す */
    im.onerror = (lp === path) ? null
      : function () { this.onerror = null; this.src = path; };
    im.src = lp;
  }

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
    lit = true;
    Array.prototype.forEach.call(box.querySelectorAll('img[data-src]'), paint);

    /* いま出ていない絵も、少し遅れて温めておく。差し替えの瞬間に
       読み込みが始まると一瞬白くなるため。取りに行く総量は
       以前（32枚ぶん）と変わらない。 */
    setTimeout(function () {
      items.forEach(function (it) {
        var path = it.getAttribute('data-img');
        var im = new Image();
        im.decoding = 'async';
        var back = false;
        im.onerror = function () {
          if (back) { return; }
          back = true; im.src = path;
        };
        im.src = light(path);
      });
    }, 1200);

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
  var panel = lb.querySelector('.lb__panel');
  var lbImg = document.getElementById('lbImg');
  var lbInfo = document.getElementById('lbInfo');
  var lbEn = document.getElementById('lbEn');
  var lbTitle = document.getElementById('lbTitle');
  var lbText = document.getElementById('lbText');
  var lbBtns = document.getElementById('lbBtns');
  var last = null;

  /* ---- 5. 鑑賞導線（リンクのない絵）----
     仕様は claude/鑑賞導線-CTA仕様.md。画面に置くのは
     ビジュアル → 問いかけ → 補助文 → 空の入力欄 → 届け先 → ボタン、これだけ。
     選択肢も書き方の例もプレースホルダも置かない。 */
  var cta = document.getElementById('lbCta');
  var ORIGIN = 'https://twitter.com';   /* /intent/post はモバイルで無限リダイレクトの報告あり */
  var MENTION = '@nami_live4u';
  var TAIL = '\n\n' + MENTION;
  var MAX_W = 280;                      /* X の上限は重み付き280 */
  var TAIL_W = 14;                      /* 改行2 ＋ @nami_live4u（半角12） */
  var BODY_W = MAX_W - TAIL_W;          /* 266 ＝ 日本語で133字 */

  /* 見出しの3案。ボタンは全案「感じたことを届ける」で固定して、
     見出しの効果だけを分けて測る。割り当ては端末ごとに1回きり。 */
  var ASKS = [
    { id: 'accept', h: 'この一枚から、何を受け取りましたか。', s: '感じたことを、あなたの言葉で。' },
    { id: 'sight',  h: 'あなたには、何が見えましたか。',       s: '正解はありません。あなたに見えたものを、あなたの言葉で。' },
    { id: 'trace',  h: 'あなたの中に、何が残りましたか。',     s: '感じたことを、あなたの言葉で。' }
  ];

  var state = '', work = '', variant = '', wrote = false, copyT = null;

  /* 計測。GA4 / GTM が入っていればそこへ流し、無ければ何もしない。
     このために外部スクリプトを足すことはしません。 */
  function track(name, params) {
    var d = params || {};
    try {
      if (window.dataLayer && window.dataLayer.push) {
        var g = { event: name };
        for (var k in d) { if (Object.prototype.hasOwnProperty.call(d, k)) { g[k] = d[k]; } }
        window.dataLayer.push(g);
      }
      if (typeof window.gtag === 'function') { window.gtag('event', name, d); }
    } catch (e) { /* 計測で本体を止めない */ }
  }

  function workId(item) {
    var m = (item.getAttribute('data-img') || '').match(/([^\/]+)\.[a-z0-9]+$/i);
    return m ? m[1] : '';
  }

  function pickAsk() {
    var id = null, i;
    try { id = window.localStorage.getItem('nami.ask'); } catch (e) { /* 拒否されることがある */ }
    for (i = 0; i < ASKS.length; i++) { if (ASKS[i].id === id) { return ASKS[i]; } }
    var hit = ASKS[Math.floor(Math.random() * ASKS.length)];
    try { window.localStorage.setItem('nami.ask', hit.id); } catch (e) {}
    return hit;
  }

  /* X の重み付き文字数。twitter-text の既定（v3）と同じ範囲で、
     この範囲の文字が1、それ以外（日本語・絵文字など）が2。 */
  function wOf(c) {
    return (c <= 0x10FF
      || (c >= 0x2000 && c <= 0x200D)
      || (c >= 0x2010 && c <= 0x201F)
      || (c >= 0x2032 && c <= 0x2037)) ? 1 : 2;
  }
  function weigh(s) {
    var w = 0, i = 0, c;
    while (i < s.length) {
      c = s.codePointAt(i);
      w += wOf(c);
      i += (c > 0xFFFF) ? 2 : 1;
    }
    return w;
  }
  /* 上限を超えはじめる位置（文字列の添字）。収まっていれば -1 */
  function overAt(s) {
    var w = 0, i = 0, c, a;
    while (i < s.length) {
      c = s.codePointAt(i);
      a = wOf(c);
      if (w + a > BODY_W) { return i; }
      w += a;
      i += (c > 0xFFFF) ? 2 : 1;
    }
    return -1;
  }

  function esc(s) {
    return s.replace(/[&<>]/g, function (c) {
      return c === '&' ? '&amp;' : (c === '<' ? '&lt;' : '&gt;');
    });
  }

  function intentUrl(v) {
    /* URLSearchParams は空白を + にするので使わない */
    return ORIGIN + '/intent/tweet?text=' + encodeURIComponent(v.replace(/\s+$/, '') + TAIL);
  }

  var ctaAsk, ctaSub, ctaWrap, ctaMirror, ctaBox, ctaN, ctaWarn, ctaGo, ctaCopy;

  if (cta) {
    ctaAsk = document.getElementById('ctaAsk');
    ctaSub = document.getElementById('ctaSub');
    ctaWrap = document.getElementById('ctaWrap');
    ctaMirror = document.getElementById('ctaMirror');
    ctaBox = document.getElementById('ctaText');
    ctaN = document.getElementById('ctaN');
    ctaWarn = document.getElementById('ctaWarn');
    ctaGo = document.getElementById('ctaGo');
    ctaCopy = document.getElementById('ctaCopy');

    ctaBox.addEventListener('input', draw);
    /* 日本語を変換しているあいだは、未確定の文字が見えるように
       textarea の文字色を戻し、ミラーを隠す */
    ctaBox.addEventListener('compositionstart', function () { ctaWrap.classList.add('is-ime'); });
    ctaBox.addEventListener('compositionend', function () { ctaWrap.classList.remove('is-ime'); draw(); });

    ctaGo.addEventListener('click', function (e) {
      if (!ctaGo.getAttribute('href')) { e.preventDefault(); return; }
      state = 'intent';
      track('intent_open', { work_id: work, ask_variant: variant });
    });

    ctaCopy.addEventListener('click', function () {
      var full = ctaBox.value.replace(/\s+$/, '') + TAIL;
      var done = function () {
        ctaCopy.textContent = 'コピーしました';
        clearTimeout(copyT);
        copyT = setTimeout(function () { ctaCopy.textContent = '下書きをコピー'; }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(full).then(done, function () { copyOld(full, done); });
      } else {
        copyOld(full, done);
      }
    });
  }

  function copyOld(text, done) {
    var t = document.createElement('textarea');
    t.value = text;
    t.setAttribute('readonly', '');
    t.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.appendChild(t);
    t.select();
    try { document.execCommand('copy'); done(); } catch (e) { /* できない環境もある */ }
    document.body.removeChild(t);
  }

  /* 入力のたびに、文字数・超過ぶんの赤・ボタンの状態を描き直す */
  function draw() {
    var v = ctaBox.value;
    var k = overAt(v);
    ctaMirror.innerHTML = (k < 0
      ? esc(v)
      : esc(v.slice(0, k)) + '<span class="over">' + esc(v.slice(k)) + '</span>') + '<br>';

    ctaN.textContent = Math.ceil((weigh(v) + TAIL_W) / 2);
    ctaWrap.classList.toggle('is-over', k >= 0);
    /* @ で始まる投稿は X 上で返信として配信され、届けたい相手以外に
       ほとんど表示されない */
    ctaWarn.hidden = !/^\s*@/.test(v);

    var ok = (k < 0) && v.trim() !== '';
    if (ok) {
      ctaGo.href = intentUrl(v);
      ctaGo.classList.remove('is-off');
      ctaGo.removeAttribute('aria-disabled');
    } else {
      ctaGo.removeAttribute('href');
      ctaGo.classList.add('is-off');
      ctaGo.setAttribute('aria-disabled', 'true');
    }

    /* ミラーとずれないよう、内容に合わせて高さを伸ばす */
    ctaBox.style.height = 'auto';
    ctaBox.style.height = ctaBox.scrollHeight + 'px';

    if (v !== '' && !wrote) {
      wrote = true;
      if (state !== 'intent') { state = 'draft'; }
      track('draft_write', { work_id: work, ask_variant: variant });
    }
  }

  function open(item) {
    if (!item) { return; }
    /* 一度でも開いた人には、もう「押せます」の印を出さない */
    if (hinting) {
      hinting = false;
      hinted.forEach(function (el) { el.classList.remove('is-hint'); });
      try { window.localStorage.setItem(TAP_KEY, '1'); } catch (e) {}
    }
    /* 帯で読み込んだのと同じ1枚を使う（キャッシュに乗っている） */
    var lpath = item.getAttribute('data-img');
    lbImg.onerror = function () { this.onerror = null; this.src = lpath; };
    lbImg.src = light(lpath);
    lbImg.alt = item.getAttribute('data-title') || '';
    /* パネルの写真枠は 4:3。縦長の絵をそのまま入れると真ん中＝
       腰のあたりが出て顔が切れるので、カードと同じ data-pos を効かせる。 */
    var lpos = (item.getAttribute('data-pos') || '50').trim().split(/\s+/);
    lbImg.style.objectPosition = lpos.length > 1
      ? lpos[0] + '% ' + lpos[1] + '%'
      : 'center ' + lpos[0] + '%';

    var href = item.getAttribute('href');
    var ask = (!href && cta);
    work = workId(item);
    variant = '';

    lbInfo.hidden = !!ask;
    if (cta) { cta.hidden = !ask; }
    panel.classList.toggle('lb--cta', !!ask);
    panel.setAttribute('aria-labelledby', ask ? 'ctaAsk' : 'lbTitle');

    if (ask) {
      var a = pickAsk();
      variant = a.id;
      ctaAsk.textContent = a.h;
      ctaSub.textContent = a.s;
      ctaBox.value = '';
      wrote = false;
      state = 'shown';
      draw();
    } else {
      lbEn.textContent = item.getAttribute('data-en') || '';
      lbTitle.textContent = item.getAttribute('data-title') || '';
      lbText.textContent = (item.textContent || '').trim();
      lbBtns.innerHTML = '';
      if (href) {
        var a2 = document.createElement('a');
        a2.className = 'btn btn--fill';
        a2.href = href;
        a2.textContent = item.getAttribute('data-cta') || 'ひらく';
        if (item.getAttribute('target')) { a2.target = item.getAttribute('target'); }
        a2.rel = 'noopener';
        lbBtns.appendChild(a2);
      }
      state = 'view';
    }

    track('panel_view', { work_id: work, has_link: href ? 1 : 0 });
    if (ask) { track('cta_shown', { work_id: work, ask_variant: variant }); }

    last = document.activeElement;
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () { lb.classList.add('is-in'); });
    /* 入力欄ではなく × に当てる。開いた瞬間にスマホのキーボードが
       立ち上がると、見てほしい絵がその下に隠れてしまうため。 */
    lb.querySelector('.lb__x').focus();
  }

  function close() {
    if (state) { track('panel_close', { work_id: work, reached_state: state }); }
    state = '';
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
    var f = Array.prototype.filter.call(
      lb.querySelectorAll('button, a[href], textarea'),
      function (n) { return n.offsetParent !== null; }
    );
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

/* 西園寺ナミ OFFICIAL SITE — ブランドのロゴ
   assets/img/brand/ に公式のロゴ画像を置くと、カードの丸の中がその画像に
   なります。まだ置いていない（か読めなかった）ときは、もとの英字
   （YT / TT / AW）に戻すので、置くまでは何も壊れません。
   .svg を先に見て、無ければ同じ名前の .png を見ます。 */
(function () {
  'use strict';
  Array.prototype.forEach.call(
    document.querySelectorAll('.card__ic img[data-fallback]'),
    function (im) {
      function fail() {
        var src = im.getAttribute('src') || '';
        if (/\.svg$/i.test(src)) { im.src = src.replace(/\.svg$/i, '.png'); return; }
        var box = im.parentNode;
        if (box) { box.textContent = im.getAttribute('data-fallback') || ''; }
      }
      im.addEventListener('error', fail);
      /* このスクリプトが動くころには読み込みが終わっていることがある。
         そのときは error が飛ばないので、ここで自分で確かめる。 */
      if (im.complete && !im.naturalWidth) { fail(); }
    }
  );
})();
