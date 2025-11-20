@echo off
chcp 65001 >nul
echo ========================================
echo Telop Editor CEP Extension - Installer
echo ========================================
echo.

:: 管理者権限チェック
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [エラー] 管理者権限が必要です。
    echo 右クリック → 「管理者として実行」で再実行してください。
    pause
    exit /b 1
)

echo [1/6] インストール準備...
set "SCRIPT_DIR=%~dp0"
set "CEP_DIR=%CommonProgramFiles(x86)%\Adobe\CEP\extensions\TelopEditor"

echo インストール元: %SCRIPT_DIR%
echo インストール先: %CEP_DIR%
echo.

:: ディレクトリ作成
echo [2/6] インストールディレクトリ作成...
if not exist "%CEP_DIR%" (
    mkdir "%CEP_DIR%"
    echo ✓ ディレクトリを作成しました
) else (
    echo ! 既存のディレクトリが見つかりました
    echo   上書きインストールしますか？ [Y/N]
    set /p confirm=
    if /i not "%confirm%"=="Y" (
        echo インストールをキャンセルしました。
        pause
        exit /b 0
    )
)

:: ファイルコピー
echo [3/6] ファイルをコピー中...
xcopy /E /I /Y "%SCRIPT_DIR%CSXS" "%CEP_DIR%\CSXS" >nul
xcopy /E /I /Y "%SCRIPT_DIR%client" "%CEP_DIR%\client" >nul
xcopy /E /I /Y "%SCRIPT_DIR%host" "%CEP_DIR%\host" >nul
echo ✓ ファイルコピー完了

:: シンボリックリンク作成（index.html）
echo [4/6] index.html のシンボリックリンク作成...
if exist "%CEP_DIR%\client\index.html" (
    del "%CEP_DIR%\client\index.html"
)

set "TARGET_HTML=%SCRIPT_DIR%..\telop-editor\new_index.html"
mklink "%CEP_DIR%\client\index.html" "%TARGET_HTML%" >nul 2>&1

if %errorLevel% equ 0 (
    echo ✓ シンボリックリンク作成成功
) else (
    echo ! シンボリックリンク作成失敗。ファイルをコピーします...
    copy /Y "%TARGET_HTML%" "%CEP_DIR%\client\index.html" >nul
    echo ✓ index.html をコピーしました
)

:: CSInterface.js チェック
echo [5/6] CSInterface.js チェック...
if not exist "%CEP_DIR%\client\js\CSInterface.js" (
    echo ! CSInterface.js が見つかりません。
    echo.
    echo 以下のURLからダウンロードして、手動で配置してください：
    echo https://github.com/Adobe-CEP/CEP-Resources/blob/master/CEP_10.x/CSInterface.js
    echo.
    echo 配置先: %CEP_DIR%\client\js\CSInterface.js
    echo.
) else (
    echo ✓ CSInterface.js が存在します
)

:: デバッグモード有効化
echo [6/6] デバッグモード有効化...
reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.10" /v PlayerDebugMode /t REG_SZ /d 1 /f >nul 2>&1
reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.11" /v PlayerDebugMode /t REG_SZ /d 1 /f >nul 2>&1

if %errorLevel% equ 0 (
    echo ✓ デバッグモード有効化成功 (CSXS.10, CSXS.11)
) else (
    echo ! デバッグモード有効化に失敗しました
    echo   レジストリエディタで手動設定が必要な場合があります
)

echo.
echo ========================================
echo インストール完了！
echo ========================================
echo.
echo 次のステップ:
echo 1. Premiere Pro を再起動してください
echo 2. ウィンドウ ^> エクステンション ^> Telop Editor を選択
echo.
echo ※ CSInterface.js が未配置の場合は手動でダウンロードしてください
echo.
pause
