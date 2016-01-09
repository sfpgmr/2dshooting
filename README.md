2dshooting
==========

HTML5で2Dシューティングゲームを作る。

## 開発の画像

![開発中の画像](https://41.media.tumblr.com/74084258d0cd7fc22dbe6ba6a38e9fea/tumblr_o0pl6yRyjt1s44dwzo1_1280.png)

## 開発中バージョンのURL

http://github.sfpgmr.net/2dshooting/dist/

## プレイ方法

* タイトル画面で<kbd>z</kbd>キーを押す。
* プレイヤーのハンドル名を入力し<kbd>Enter</kbd>
* 右・左・上・下カーソルで移動、スペースキーで弾を発射
* スコアがトップ10入りするとハンドル名でハイスコアを更新。ハイスコアはプレイヤー間で共有。

## 技術的なこと

* gulp + babael + browserifyで開発
* WebGLで2Dグラフィックを描画
* WebAudioを使用し、波形メモリ音源をシミュレート
* socket.ioを使ったハイスコアの共有

## ライセンス

MIT

