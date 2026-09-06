# 西園寺ナミ｜OFFICIAL SITE

> 夜の静けさに溶けるような声で、あなたの心にそっと触れること。
> あなたの居場所になれるまで。

歌と声劇を中心に活動する **西園寺ナミ** のオフィシャルサイトです。

**公開URL** → <https://sweettimeeveryday.github.io/Nami-official-site/>

---

## このサイトについて

「遠くから眺める存在ではなく、あなたのお耳のすぐ隣にいる存在でありたい」——
サイト全体をその考え方で組み立てています。

説明を先に置くのではなく、まず作品と姿を見てもらう。
そのためにトップは、**画像が奥から手前へ流れてくる帯**から始まります。
流れてくるカードは押すと開き、YouTube や AWA など、その場所へつながります。

配色は「白磁」。白磁の白に墨の文字、朱を一点だけ。
ページ上で色を持つのが朱だけになるよう、ほかの色は徹底して抑えています。
ヒーローと帯だけが暗いのは、ロゴと背景動画が黒地の素材だからです。

---

## ページ構成

| ページ | 内容 |
|---|---|
| `index.html` | トップ。ヒーロー → World（流れる帯）→ はじめまして → 配信と歌 → 最新情報 → グッズと応援 |
| `profile.html` | プロフィール |
| `links.html` | 配信アカウントとSNSの一覧 |
| `goods.html` | グッズと応援 |
| `contact.html` | お問い合わせ（XのDMへ） |

### トップのセクション

- **World / これまでの思い出と、これから** — 奥から手前へ画像が流れるコリドー。カードを押すと中央にパネルが開きます
- **Introduction / はじめまして** — 長文プロフィール。高さを固定した枠の中でスクロールします
- **Stream & Music / 配信と歌** — YouTube・TikTok・AWA へのリンク
- **Latest / 最新情報** — Xのフォロー導線
- **Goods & Support / グッズと応援** — BOOTH・SUZURI・Doneru

---

## 技術

**素の HTML + CSS + JavaScript です。** フレームワークもビルド工程もありません。
`index.html` をブラウザで開けばそのまま動きます。GitHub Pages で公開しています。

- 外部依存は Google Fonts（Cinzel / Shippori Mincho / Zen Kaku Gothic New）のみ
- JavaScript は `assets/js/main.js` の1本だけ
- 「動きを減らす」設定（`prefers-reduced-motion`）に対応。動画を読み込まず、コリドーも静止画として止まります

```
.
├── index.html / profile.html / links.html / goods.html / contact.html
└── assets/
    ├── css/style.css     デザイントークンと全スタイル
    ├── js/main.js        ヘッダー・メニュー・コリドー・スクロール領域
    ├── img/              カード画像・ロゴ・favicon・OGP
    └── video/            ヒーローのロゴモーション、Worldの背景動画
```

---

## よく触るところ

### コリドーのカードを足す・差し替える

`index.html` の `.stream__item` の行を編集します。**左右のレールは JavaScript が自動で組み直す**ので、枚数は何枚でも構いません。

```html
<a class="stream__item" href="リンク先" target="_blank" rel="noopener"
   data-img="assets/img/card-12-xxx.jpg"
   data-pos="20"
   data-en="Song" data-title="タイトル" data-cta="ボタンの文字">説明文</a>
```

| 属性 | 意味 |
|---|---|
| `data-img` | カードに使う画像 |
| `data-pos` | 切り取り位置。`20`＝上下の位置、`30 50`＝左右と上下 |
| `data-title` | **これがある行だけ押せます。** 無い行は飾りのカードになります |

カードは **18:25 の縦長**です。元画像がそれと違う比率だと、はみ出した側が切られます。
`data-pos` は「どこを残すか」を決める数字です（0＝上／左寄せ、100＝下／右寄せ）。

### 配色を変える

`assets/css/style.css` の末尾、`配色: 白磁（Porcelain）` のブロックを編集します。
`:root` の変数だけでなく、**そのすぐ下の上書きブロックも一緒に見てください**。
もとのCSSには黒が直接書かれた箇所が8つあり、そこを変数化して上書きしています。

### 背景動画を差し替える

`assets/video/` に置き、ファイル名を変えなければコードの変更は不要です。
PC用（`stream_bg_1440.mp4`）とスマホ用（`stream_bg_900.mp4`）を画面幅で出し分けています。
色を変えたときは、帯の端を溶かす `--band-stream` を動画の暗部に合わせて測り直してください。

---

## 触る前に知っておきたいこと

**遠近法は `.stream` ではなく `.stream__scene` に置いています。**
`.stream` 自身に `perspective` を持たせると、z がマイナスのカード（＝奥のカード）が
背景動画より後ろに描かれて消えます。この入れ子を平らにしないでください。

**`.stream__card` の `!important` は意図的です。**
`style.css` 末尾の `@media (prefers-reduced-motion:reduce){ *{animation:none!important} }` が
コリドーのアニメーションを消してしまい、全カードが中央に潰れます。
そのため打ち消したうえで、停止ではなく一時停止（`animation-play-state:paused`）にしています。

**`.stream__rail` は `pointer-events:none` です。**
レールが帯の全面を覆うため、クリックを通してカードだけで受けています。

**コリドーは装飾扱いです。**
`.stream` に `aria-hidden`、各カードに `tabIndex = -1` を設定しています。
同じ行き先は下のカードセクションから辿れるので、キーボード操作はそちらが担当します。

**JavaScript が無効だとコリドーは空になります。**
レールを JavaScript で組み立てているためです。

---

## 制作用ツール

サイト本体には含めていません（制作フォルダ側にあります）。

| ツール | 用途 |
|---|---|
| `カード画像づくり.html` | 切り取り位置（`data-pos`）を目で見て決めるツール。左に元画像と切り取り枠、右にカードでの見え方が並び、スライダーで合わせると数字が出ます |
| `カード画像を取り込む.bat` | `02_素材\card_原本` に入れた画像を、連番・リネーム・リサイズ・圧縮・配置・HTML書き出しまで一度に処理します |
| `色替え台.html` | 背景動画の色を作り替えるツール |

---

© Nami Saionji
