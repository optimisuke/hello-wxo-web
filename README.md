# hello-wxo-web

watsonx Orchestrate Embedded Chat を最小構成で動かすためのサンプルです。

## 使い方（最小）

1. `index.html` をブラウザで開く
2. チャットが表示されれば OK

## 事前設定（セキュリティ無効化）

Embedded chat はデフォルトでセキュリティが有効ですが未設定のため、そのままだと動きません。
まずは匿名アクセスで動かすためにセキュリティを無効化します。

### 必要な情報

- ORCHESTRATE_URL（Service instance URL）
- ORCHESTRATE_APIKEY（IBM Cloud API Key）

例（`.env` など）:

```
ORCHESTRATE_APIKEY=xxxxxxxxxxxxxxxxxxxxxxxx
ORCHESTRATE_URL=https://api.jp-tok.watson-orchestrate.cloud.ibm.com/instances/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### 無効化コマンド

```bash
TOKEN=$(curl -sS -X POST "https://iam.cloud.ibm.com/identity/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=$ORCHESTRATE_APIKEY" | jq -r .access_token)

curl -sS -X POST \
  "$ORCHESTRATE_URL/v1/embed/secure/config" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"is_security_enabled": false}' | jq .
```

成功すると `is_security_enabled: false` が返ります。

## 注意

セキュリティ無効化は匿名アクセスになります。公開サイトで使う場合は、権限や公開範囲に注意してください。
