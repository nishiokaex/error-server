# Error Server

Node.js + ExpressでJavaScriptエラーを受信・保存するサーバーです。

## 機能

- `POST /log` エンドポイントでJavaScriptエラーを受信
- 受信したエラーをマークダウンファイルに時系列順で追記保存

## セットアップ

```bash
# 依存関係のインストール
npm install

# サーバー起動
npm start
```

## 環境変数

- `PORT`: サーバーのポート番号（デフォルト: 3000）
- `LOG_FILE_PATH`: ログファイルの保存先ディレクトリ（デフォルト: `./logs`）

## 使用方法

### エラーログの送信

```bash
curl -X POST http://localhost:3000/log \
  -H "Content-Type: application/json" \
  -d '{
    "error": "TypeError: Cannot read property of undefined",
    "stack": "at main.js:15:10",
    "url": "http://example.com",
    "userAgent": "Mozilla/5.0"
  }'
```

### ブラウザでのエラー収集

Webサイトに以下のJavaScriptコードを組み込むことで、自動的にエラーをサーバーに送信できます：

```javascript
// エラーログ送信用の設定
const ERROR_LOG_SERVER = 'http://localhost:3000/log'; // サーバーのURLを設定

// グローバルエラーハンドラー
window.addEventListener('error', function(event) {
  const errorData = {
    error: event.error ? event.error.toString() : event.message,
    stack: event.error ? event.error.stack : '',
    url: event.filename || window.location.href,
    line: event.lineno,
    column: event.colno,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  };
  
  sendErrorToServer(errorData);
});

// Promiseの未処理エラーハンドラー
window.addEventListener('unhandledrejection', function(event) {
  const errorData = {
    error: 'Unhandled Promise Rejection: ' + event.reason,
    stack: event.reason && event.reason.stack ? event.reason.stack : '',
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  };
  
  sendErrorToServer(errorData);
});

// エラーデータをサーバーに送信する関数
function sendErrorToServer(errorData) {
  fetch(ERROR_LOG_SERVER, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(errorData)
  }).catch(function(err) {
    console.error('Failed to send error to server:', err);
  });
}
```

#### 使用手順

1. 上記のJavaScriptコードをHTMLファイルの`<head>`タグ内に配置
2. `ERROR_LOG_SERVER`変数をお使いのサーバーURLに変更
3. Webサイトを公開し、JavaScriptエラーが自動的にサーバーに送信されることを確認
