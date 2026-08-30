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
