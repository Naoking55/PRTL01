# Telop Editor - 配布ガイド

## エンドユーザー向け配布

### 配布するファイル

**方法1: macOS PKGインストーラー（macOSユーザー推奨）**
```
package/TelopEditor-macOS.pkg
```
- ダブルクリックでGUIインストール
- 自動的に設定完了

**方法2: ZXPパッケージ（全プラットフォーム）**
```
package/TelopEditor.zxp
```
- Anastasiy's Extension Manager でインストール
- Windows/macOS/Linux対応

### ビルド手順

**macOS PKGをビルド:**
```bash
cd telop-editor-cep
bash build-mac-pkg.sh
# 出力: package/TelopEditor-macOS.pkg
```

**ZXPをビルド:**
```bash
cd telop-editor-cep
bash package-zxp.sh  # macOS/Linux
# または
package-zxp.bat      # Windows

# 出力: package/TelopEditor.zxp
```

### GitHub Releasesでの配布例

```yaml
Release v1.1.0
├── TelopEditor-v1.1.0-macOS.pkg    (macOS用)
├── TelopEditor-v1.1.0.zxp          (全OS用)
└── インストールガイド.md
```

**リリースノート例:**
```markdown
## インストール方法

### macOS
1. `TelopEditor-v1.1.0-macOS.pkg` をダウンロード
2. ダブルクリックしてインストーラーを起動
3. Premiere Pro を再起動

### Windows/Linux
1. `TelopEditor-v1.1.0.zxp` をダウンロード
2. Anastasiy's Extension Manager (https://install.anastasiy.com/) でインストール
3. Premiere Pro を再起動
```

## 開発者向け配布

### 必要なフォルダ全体

開発・カスタマイズする場合は、リポジトリ全体をクローン:

```bash
git clone https://github.com/YOUR-USERNAME/PRTL01.git
cd PRTL01/telop-editor-cep
```

### 手動インストール（開発用）

**Windows:**
```bash
install.bat（管理者権限で実行）
```

**macOS/Linux:**
```bash
sudo bash install.sh
```

## まとめ

| 配布対象 | 必要なファイル | サイズ |
|---------|---------------|--------|
| **一般ユーザー** | `.pkg` または `.zxp` のみ | ~数MB |
| **開発者** | telop-editor-cep フォルダ全体 | ~数MB |

**推奨:**
- 一般ユーザーには、ビルド済みパッケージ（PKGまたはZXP）のみを配布
- GitHubのReleasesページにアップロード
- ソースコードは自動的にzipで提供される
