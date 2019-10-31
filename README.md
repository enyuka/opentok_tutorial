# OpenTokのチュートリアルやってみた

## tokboxのアカウント作成

[https://tokbox.com/account/user/signup](https://tokbox.com/account/user/signup)

上記URLからアカウント作成します。

作成したアカウントで`Video Chat Embed`と`OpenTok API`のテンプレートを利用した  
プロジェクトを作成しておきます。

## .envの準備

```
cp .envsample .env
```

.envファイルに下記3つを設定します。  
* `Video Chat Embed`プロジェクトからダウンロードできるiframeから、`embedId=`の値をコピーし、`EMBED_ID`にペーストします
* `OpenTok API`プロジェクトから`PROJECT API KEY`をコピーし、`API_KEY`にペーストします
* `OpenTok API`プロジェクトから`PROJECT SECRET`をコピーし、`API_SECRET`にペーストします

## 起動

```
npm i; npm start
```

http://localhost:3000 で表示されます。

## index画面

### Embedリンク

iframeで埋め込まれたビデオチャットが表示されます。  
クエリストリングのroomの後ろを適当に変えると、別の部屋に割り振ります。

### Pubリンク

APIでsessionを作成したビデオチャットが表示されます。  
ランダムで4桁の番号が表示されるので、Subリンクで利用します。

### Subフォーム

Pubリンクで表示された4桁の番号を入力し、送信することで、同じ番号のセッションに入ることが出来ます。