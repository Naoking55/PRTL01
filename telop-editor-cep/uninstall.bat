@echo off
chcp 65001 >nul
echo ==========================================
echo Telop Editor CEP Extension - Uninstaller
echo ==========================================
echo.

:: 管理者権限チェック
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [エラー] 管理者権限が必要です。
    echo 右クリック → 「管理者として実行」で再実行してください。
    pause
    exit /b 1
)

set "CEP_DIR=%CommonProgramFiles(x86)%\Adobe\CEP\extensions\TelopEditor"

echo アンインストール対象: %CEP_DIR%
echo.

:: 存在チェック
if not exist "%CEP_DIR%" (
    echo [情報] Telop Editor はインストールされていません。
    echo.
    pause
    exit /b 0
)

:: 確認
echo ⚠ 本当にアンインストールしますか？
echo この操作は元に戻せません。
echo.
set /p confirm=続行しますか？ [Y/N]:

if /i not "%confirm%"=="Y" (
    echo アンインストールをキャンセルしました。
    pause
    exit /b 0
)

echo.
echo [1/3] Premiere Pro の終了確認...
tasklist /FI "IMAGENAME eq Adobe Premiere Pro.exe" 2>nul | find /I "Adobe Premiere Pro.exe" >nul
if %errorLevel% equ 0 (
    echo ⚠ Premiere Pro が実行中です。
    echo   終了してからアンインストールしてください。
    pause
    exit /b 1
)
echo ✓ Premiere Pro は実行されていません

:: ファイル削除
echo [2/3] ファイル削除中...
rmdir /S /Q "%CEP_DIR%" 2>nul

if exist "%CEP_DIR%" (
    echo ✗ ファイル削除に失敗しました
    echo   ファイルが使用中の可能性があります
    pause
    exit /b 1
) else (
    echo ✓ ファイル削除完了
)

:: デバッグモード無効化（オプション）
echo [3/3] デバッグモード無効化...
echo.
echo デバッグモードを無効化しますか？
echo （他のCEPエクステンションを使用している場合は「N」を推奨）
set /p disable_debug=無効化する？ [Y/N]:

if /i "%disable_debug%"=="Y" (
    reg delete "HKEY_CURRENT_USER\Software\Adobe\CSXS.10" /v PlayerDebugMode /f >nul 2>&1
    reg delete "HKEY_CURRENT_USER\Software\Adobe\CSXS.11" /v PlayerDebugMode /f >nul 2>&1
    echo ✓ デバッグモードを無効化しました
) else (
    echo - デバッグモードは維持されます
)

echo.
echo ==========================================
echo アンインストール完了！
echo ==========================================
echo.
echo Telop Editor CEP Extension が削除されました。
echo Premiere Pro を再起動すると、エクステンションメニューから消えます。
echo.
pause
