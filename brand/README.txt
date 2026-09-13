配信サービスの公式ロゴ画像を置くフォルダです。
=============================================================

【いま入っているもの】

    youtube.png  ... YouTube 公式アイコン Almost Black
                     出どころ: brand.youtube の YouTube_Icon パック
                     YouTube_Icon\Digital\02 Almost Black\
                       yt_icon_almostblack_digital.png
                     赤（フルカラー）版に変えたいときは、同じパックの
                     01 Red\yt_icon_red_digital.png を youtube.png と
                     いう名前でここに上書きしてください。

    tiktok.png   ... TikTok 公式アイコン Black Circle
                     出どころ: 開発者向け logo-pack
                     TikTok Logo Pack\TikTok - Icons\
                       TikTok_Icon_Black_Circle.png
                     四角版がよければ TikTok_Icon_Black_Square.png を
                     tiktok.png という名前で上書きしてください。

  どちらも縮小も加工もしていません。元ファイルそのままです。
  表示の大きさだけ CSS で 26px に指定しています。


【AWA について】

  公式の配布ファイルが見つからないため、丸の中は「AWA」という文字です。
  サイトの書体（Cinzel）で組んでいます。ロゴの書体に似せてはいません。

  あとで許諾とファイルをもらえたら、awa.png（または awa.svg）をここに
  置いたうえで、index.html と links.html の

      <span class="card__ic">AWA</span>

  を、この1行に差し替えてください。

      <span class="card__ic"><img src="assets/img/brand/awa.png" alt="" data-fallback="AWA"></span>

  こうしておくと、ファイルが読めなかったときは自動で「AWA」の文字に戻ります。


【使い続けるうえでの注意】

  ロゴは各社の商標です。ガイドラインで改変が禁じられているので、
  サイトの配色に合わせて色を変えることはできません。
  変えてよいのは大きさだけです（YouTubeは「適切な大きさへの変更は可」と明記）。

  ・YouTube … 色の変更は不可。Almost Black は公式パットに入っている
              正規のバリエーションなので、そのまま使えます。
  ・TikTok  … 開発者向けガイドラインに「事前の書面による許諾が必要」と
              書かれています。ご自身のアカウントへ誘導する用途とはいえ、
              念のため確認しておくと安心です。


【大きさを変えたいとき】

  assets\css\style.css の  .card__ic img  の行（26px）です。
  丸そのものは .card__ic（40px）。26pxより大きくすると丸からはみ出します。
