@echo off
chcp 65001 >nul
echo ========================================
echo Telop Editor - ZXP Package Builder
echo ========================================
echo.

set "SCRIPT_DIR=%~dp0"
set "BUILD_DIR=%SCRIPT_DIR%build"
set "PACKAGE_DIR=%SCRIPT_DIR%package"
set "ZXP_OUTPUT=TelopEditor.zxp"
set "CERT_FILE=cert.p12"

:: ZXPSignCmd チェック
where ZXPSignCmd >nul 2>&1
if %errorLevel% neq 0 (
    echo [エラー] ZXPSignCmd が見つかりません
    echo.
    echo ZXPSignCmd をインストールしてください:
    echo https://github.com/Adobe-CEP/Getting-Started-guides
    echo.
    pause
    exit /b 1
)

echo ✓ ZXPSignCmd が見つかりました
echo.

:: [1/5] ビルドディレクトリ準備
echo [1/5] ビルドディレクトリ準備...
if exist "%BUILD_DIR%" rmdir /S /Q "%BUILD_DIR%"
mkdir "%BUILD_DIR%\TelopEditor"
if not exist "%PACKAGE_DIR%" mkdir "%PACKAGE_DIR%"
echo ✓ ディレクトリ作成完了

:: [2/5] ファイルコピー
echo [2/5] 必要なファイルをコピー...
xcopy /E /I /Y "%SCRIPT_DIR%CSXS" "%BUILD_DIR%\TelopEditor\CSXS" >nul
xcopy /E /I /Y "%SCRIPT_DIR%client" "%BUILD_DIR%\TelopEditor\client" >nul
xcopy /E /I /Y "%SCRIPT_DIR%host" "%BUILD_DIR%\TelopEditor\host" >nul
copy /Y "%SCRIPT_DIR%README.md" "%BUILD_DIR%\TelopEditor\" >nul 2>&1
copy /Y "%SCRIPT_DIR%INSTALL.md" "%BUILD_DIR%\TelopEditor\" >nul 2>&1

:: index.html を実ファイルとしてコピー
if exist "%BUILD_DIR%\TelopEditor\client\index.html" (
    del "%BUILD_DIR%\TelopEditor\client\index.html"
)

set "TARGET_HTML=%SCRIPT_DIR%..\telop-editor\new_index.html"
if exist "%TARGET_HTML%" (
    copy /Y "%TARGET_HTML%" "%BUILD_DIR%\TelopEditor\client\index.html" >nul
    echo ✓ index.html をコピーしました
) else (
    echo ✗ new_index.html が見つかりません
    pause
    exit /b 1
)

:: CSInterface.js チェック
if not exist "%BUILD_DIR%\TelopEditor\client\js\CSInterface.js" (
    echo ! CSInterface.js が見つかりません
    echo   ダウンロードを試みます...

    curl -L "https://raw.githubusercontent.com/Adobe-CEP/CEP-Resources/master/CEP_10.x/CSInterface.js" -o "%BUILD_DIR%\TelopEditor\client\js\CSInterface.js" 2>nul

    if exist "%BUILD_DIR%\TelopEditor\client\js\CSInterface.js" (
        echo ✓ CSInterface.js ダウンロード成功
    ) else (
        echo ✗ CSInterface.js のダウンロードに失敗
        pause
        exit /b 1
    )
)

echo ✓ ファイルコピー完了

:: [3/5] 証明書チェック/作成
echo [3/5] 証明書チェック...
cd /d "%SCRIPT_DIR%"

if not exist "%CERT_FILE%" (
    echo 証明書が見つかりません。自己署名証明書を作成します
    echo.

    set /p COUNTRY="国コード (例: JP): "
    set /p CITY="都市 (例: Tokyo): "
    set /p ORG="組織名 (例: MyCompany): "
    set /p CERT_NAME="証明書名 (例: TelopEditor): "
    set /p PASSWORD="パスワード: "

    if "%COUNTRY%"=="" set "COUNTRY=JP"
    if "%CITY%"=="" set "CITY=Tokyo"
    if "%ORG%"=="" set "ORG=TelopEditor"
    if "%CERT_NAME%"=="" set "CERT_NAME=TelopEditor"
    if "%PASSWORD%"=="" set "PASSWORD=password"

    ZXPSignCmd -selfSignedCert "%COUNTRY%" "%CITY%" "%ORG%" "%CERT_NAME%" "%PASSWORD%" "%CERT_FILE%"

    if %errorLevel% equ 0 (
        echo ✓ 自己署名証明書を作成しました
    ) else (
        echo ✗ 証明書作成に失敗
        pause
        exit /b 1
    )
) else (
    echo ✓ 既存の証明書を使用します
    set /p PASSWORD="証明書のパスワードを入力: "
)

:: [4/5] ZXP パッケージング
echo [4/5] ZXP パッケージング中...

ZXPSignCmd -sign "%BUILD_DIR%\TelopEditor" "%PACKAGE_DIR%\%ZXP_OUTPUT%" "%CERT_FILE%" "%PASSWORD%"

if %errorLevel% equ 0 (
    echo ✓ ZXP パッケージング成功
) else (
    echo ✗ ZXP パッケージングに失敗
    pause
    exit /b 1
)

:: [5/5] クリーンアップ
echo [5/5] クリーンアップ...
rmdir /S /Q "%BUILD_DIR%"
echo ✓ 一時ファイル削除完了

:: 結果表示
echo.
echo ========================================
echo パッケージング完了！
echo ========================================
echo.
echo 出力ファイル:
echo   %PACKAGE_DIR%\%ZXP_OUTPUT%
echo.
for %%A in ("%PACKAGE_DIR%\%ZXP_OUTPUT%") do echo ファイルサイズ: %%~zA bytes
echo.
echo インストール方法:
echo 1. Adobe Extension Manager または ExManCmd を使用
echo 2. または Anastasiy's Extension Manager:
echo    https://install.anastasiy.com/
echo.
echo コマンドラインインストール:
echo   ExManCmd /install %PACKAGE_DIR%\%ZXP_OUTPUT%
echo.
pause
