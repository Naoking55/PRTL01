/**
 * Telop Editor - CEP Integration
 * Premiere Pro連携のためのクライアント側コード
 */

// CSInterface インスタンス（CSInterface.jsが読み込まれている必要があります）
var csInterface = null;

// デバッグログ配列
var debugLogs = [];

/**
 * デバッグログ機能
 * @param {string} message - ログメッセージ
 * @param {string} level - ログレベル (info/warn/error)
 */
function debugLog(message, level) {
    level = level || 'info';
    var timestamp = new Date().toISOString();
    var logEntry = '[' + timestamp + '] [' + level.toUpperCase() + '] ' + message;

    // コンソールに出力
    console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](logEntry);

    // ログ配列に追加
    debugLogs.push(logEntry);
    if (debugLogs.length > 100) {
        debugLogs.shift(); // 最大100件まで保持
    }

    // ExtendScript経由でログファイルに書き出し
    if (csInterface) {
        var safeMessage = message.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ');
        csInterface.evalScript('$.writeln("[CEP] ' + safeMessage + '")');
    }

    // 画面上のログエリアに表示
    updateDebugPanel();
}

/**
 * デバッグパネルを更新
 */
function updateDebugPanel() {
    var debugPanel = document.getElementById('debug-log-panel');
    if (debugPanel) {
        var lastLogs = debugLogs.slice(-20).reverse(); // 最新20件を表示
        debugPanel.innerHTML = lastLogs.map(function(log) {
            var color = log.includes('[ERROR]') ? '#ff6b6b' :
                       log.includes('[WARN]') ? '#ffd93d' : '#6bcf7f';
            return '<div style="color: ' + color + '; font-size: 9px; margin: 2px 0; font-family: monospace;">' +
                   log.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</div>';
        }).join('');
    }
}

/**
 * デバッグパネルを作成
 */
function createDebugPanel() {
    var panel = document.createElement('div');
    panel.id = 'debug-log-panel';
    panel.style.cssText =
        'position: fixed; bottom: 10px; right: 10px; width: 400px; max-height: 200px; ' +
        'background: rgba(0, 0, 0, 0.9); border: 1px solid #444; border-radius: 4px; ' +
        'padding: 8px; overflow-y: auto; z-index: 9999; font-size: 9px; display: none;';

    var header = document.createElement('div');
    header.style.cssText = 'display: flex; justify-content: space-between; margin-bottom: 5px;';
    header.innerHTML =
        '<span style="color: #aaa; font-weight: bold;">Debug Log</span>' +
        '<button onclick="toggleDebugPanel()" style="background: #444; border: none; color: #fff; padding: 2px 6px; cursor: pointer; border-radius: 2px;">閉じる</button>';

    panel.appendChild(header);
    document.body.appendChild(panel);

    // トグルボタンを追加
    var toggleBtn = document.createElement('button');
    toggleBtn.id = 'debug-toggle-btn';
    toggleBtn.textContent = '🐛 Debug';
    toggleBtn.style.cssText =
        'position: fixed; bottom: 10px; right: 10px; background: #0066cc; color: #fff; ' +
        'border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; z-index: 9998; font-size: 11px;';
    toggleBtn.onclick = toggleDebugPanel;
    document.body.appendChild(toggleBtn);

    debugLog('Debug panel created', 'info');
}

/**
 * デバッグパネルの表示切り替え
 */
function toggleDebugPanel() {
    var panel = document.getElementById('debug-log-panel');
    var btn = document.getElementById('debug-toggle-btn');
    if (panel && btn) {
        if (panel.style.display === 'none') {
            panel.style.display = 'block';
            btn.style.display = 'none';
        } else {
            panel.style.display = 'none';
            btn.style.display = 'block';
        }
    }
}

/**
 * 初期化
 */
function initCEP() {
    debugLog('initCEP() called', 'info');

    // デバッグパネルを作成
    setTimeout(createDebugPanel, 100);

    if (typeof CSInterface !== 'undefined') {
        csInterface = new CSInterface();
        debugLog('CEP initialized successfully', 'info');

        // ホスト環境情報を取得
        var hostEnv = csInterface.getHostEnvironment();
        var hostEnvData = JSON.parse(hostEnv);
        debugLog('Host: ' + hostEnvData.appName + ' ' + hostEnvData.appVersion, 'info');

        // テスト実行
        testConnection();

        // システムフォントを読み込み（new_index.htmlのloadSystemFonts関数を呼び出し）
        debugLog('Attempting to load system fonts...', 'info');
        setTimeout(function() {
            if (typeof loadSystemFonts === 'function') {
                debugLog('loadSystemFonts function found, calling it', 'info');
                loadSystemFonts().then(function(fonts) {
                    debugLog('System fonts loaded successfully: ' + (fonts ? fonts.length : '?') + ' fonts', 'info');
                }).catch(function(err) {
                    debugLog('Failed to load system fonts: ' + err.message, 'error');
                });
            } else {
                debugLog('loadSystemFonts function not found!', 'error');
            }
        }, 1000);
    } else {
        debugLog('CSInterface not found. Running in standalone mode.', 'warn');
        setTimeout(createDebugPanel, 100);
    }
}

/**
 * ExtendScriptを実行
 * @param {string} script - 実行するスクリプト
 * @param {function} callback - コールバック関数
 */
function evalScript(script, callback) {
    if (!csInterface) {
        console.error('CEP not initialized');
        if (callback) callback({ success: false, error: 'CEP not initialized' });
        return;
    }

    csInterface.evalScript(script, function(result) {
        try {
            var parsedResult = JSON.parse(result);
            if (callback) callback(parsedResult);
        } catch (e) {
            if (callback) callback({ success: false, error: 'Failed to parse result', raw: result });
        }
    });
}

/**
 * 接続テスト
 */
function testConnection() {
    debugLog('Testing connection to Premiere Pro...', 'info');
    evalScript('TelopEditor.test()', function(result) {
        debugLog('Connection test result: ' + JSON.stringify(result), 'info');
        if (result.success) {
            debugLog('Connection successful: ' + result.message, 'info');
            showNotification('Premiere Proとの接続に成功しました', 'success');
        } else {
            debugLog('Connection failed: ' + (result.error || 'unknown error'), 'error');
            showNotification('Premiere Proとの接続に失敗しました', 'error');
        }
    });
}

/**
 * アクティブシーケンス情報を取得
 */
function getActiveSequenceInfo() {
    evalScript('TelopEditor.getActiveSequence()', function(result) {
        console.log('Active Sequence:', result);
        if (result.success) {
            document.getElementById('sequenceInfo').textContent =
                `シーケンス: ${result.name} | フレームレート: ${result.frameRate}`;
        } else {
            showNotification(result.error, 'error');
        }
    });
}

/**
 * Premiere Proタイムラインにテロップを追加
 */
function addToTimeline() {
    debugLog('addToTimeline() called', 'info');

    if (!csInterface) {
        debugLog('Not in CEP mode', 'warn');
        alert('CEPモードではありません。\nスタンドアローンモードではこの機能は使用できません。');
        return;
    }

    // Canvasから画像を生成
    var canvas = document.getElementById('canvas');
    if (!canvas) {
        debugLog('Canvas element not found', 'error');
        showNotification('キャンバスが見つかりません', 'error');
        return;
    }

    var imageData = canvas.toDataURL('image/png');
    debugLog('Canvas data generated: ' + imageData.length + ' bytes', 'info');

    // 一時ファイルとして保存し、Premiere Proにインポート
    var timestamp = Date.now();
    var tempPath = csInterface.getSystemPath(SystemPath.USER_DATA) + '/telop_' + timestamp + '.png';
    debugLog('Temp file path: ' + tempPath, 'info');

    // Base64データをファイルに保存（Node.jsのfsモジュールを使用）
    try {
        var fs = require('fs');
        var base64Data = imageData.replace(/^data:image\/png;base64,/, '');

        fs.writeFileSync(tempPath, base64Data, 'base64');
        debugLog('File saved successfully', 'info');

        // Premiere Proにインポート
        var script = 'TelopEditor.importImage("' + tempPath.replace(/\\/g, '\\\\') + '", "Telops")';
        debugLog('Executing ExtendScript: ' + script, 'info');

        evalScript(script, function(result) {
            debugLog('Import result: ' + JSON.stringify(result), 'info');
            if (result.success) {
                debugLog('Successfully added to timeline', 'info');
                showNotification('タイムラインに追加しました', 'success');

                // 一時ファイルを削除
                setTimeout(function() {
                    try {
                        fs.unlinkSync(tempPath);
                        debugLog('Temp file deleted', 'info');
                    } catch (e) {
                        debugLog('Failed to delete temp file: ' + e.message, 'warn');
                    }
                }, 1000);
            } else {
                debugLog('Failed to add to timeline: ' + result.error, 'error');
                showNotification('追加に失敗: ' + result.error, 'error');
            }
        });
    } catch (e) {
        debugLog('File save error: ' + e.message, 'error');
        showNotification('ファイル保存エラー: ' + e.message, 'error');
    }
}

/**
 * PNG として書き出し（Premiere Pro用に最適化）
 */
function exportForPremiere() {
    var canvas = document.getElementById('canvas');
    var link = document.createElement('a');
    link.download = `telop_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    showNotification('PNG書き出しが完了しました。\nPremiere Proの「メディアブラウザー」からインポートしてください。', 'success');
}

/**
 * 通知を表示
 * @param {string} message - メッセージ
 * @param {string} type - タイプ（success/error/info）
 */
function showNotification(message, type) {
    var notificationDiv = document.getElementById('cep-notification');
    if (!notificationDiv) {
        notificationDiv = document.createElement('div');
        notificationDiv.id = 'cep-notification';
        notificationDiv.style.cssText =
            'position: fixed; top: 10px; right: 10px; padding: 12px 20px; ' +
            'border-radius: 4px; font-size: 12px; z-index: 10000; ' +
            'box-shadow: 0 2px 8px rgba(0,0,0,0.3); max-width: 300px;';
        document.body.appendChild(notificationDiv);
    }

    var bgColor = type === 'success' ? '#4caf50' :
                  type === 'error' ? '#f44336' : '#2196f3';
    notificationDiv.style.backgroundColor = bgColor;
    notificationDiv.style.color = '#fff';
    notificationDiv.textContent = message;
    notificationDiv.style.display = 'block';

    setTimeout(function() {
        notificationDiv.style.display = 'none';
    }, 3000);
}

/**
 * システムフォントをファイルシステムから直接読み込む（Node.js使用）
 * @returns {Array} フォント名の配列
 */
function loadSystemFontsFromFilesystem() {
    debugLog('loadSystemFontsFromFilesystem() called', 'info');

    try {
        var fs = require('fs');
        var path = require('path');
        var fonts = [];
        var fontDirs = [];

        // OSに応じてフォントディレクトリを設定
        var platform = navigator.platform.toLowerCase();
        debugLog('Platform detected: ' + platform, 'info');

        if (platform.indexOf('mac') !== -1) {
            // macOS
            fontDirs = [
                '/Library/Fonts',
                '/System/Library/Fonts',
                path.join(process.env.HOME, 'Library/Fonts')
            ];
        } else if (platform.indexOf('win') !== -1) {
            // Windows
            var windir = process.env.WINDIR || 'C:\\Windows';
            fontDirs = [
                path.join(windir, 'Fonts'),
                path.join(process.env.LOCALAPPDATA || '', 'Microsoft\\Windows\\Fonts')
            ];
        } else {
            // Linux
            fontDirs = [
                '/usr/share/fonts',
                '/usr/local/share/fonts',
                path.join(process.env.HOME, '.fonts')
            ];
        }

        debugLog('Font directories: ' + fontDirs.join(', '), 'info');

        // フォントファイル拡張子
        var fontExtensions = ['.ttf', '.otf', '.ttc', '.dfont'];

        // 各ディレクトリからフォントを読み込み
        fontDirs.forEach(function(dir) {
            try {
                if (fs.existsSync(dir)) {
                    debugLog('Scanning directory: ' + dir, 'info');
                    var files = fs.readdirSync(dir);
                    var fontCount = 0;

                    files.forEach(function(file) {
                        var ext = path.extname(file).toLowerCase();
                        if (fontExtensions.indexOf(ext) !== -1) {
                            // 拡張子を除いたファイル名をフォント名とする
                            var fontName = path.basename(file, ext);

                            // ハイフンやアンダースコアをスペースに変換
                            fontName = fontName.replace(/[-_]/g, ' ');

                            // 重複を避けるため追加
                            if (fonts.indexOf(fontName) === -1) {
                                fonts.push(fontName);
                                fontCount++;
                            }
                        }
                    });

                    debugLog('Found ' + fontCount + ' fonts in ' + dir, 'info');
                } else {
                    debugLog('Directory not found: ' + dir, 'warn');
                }
            } catch (e) {
                debugLog('Error reading directory ' + dir + ': ' + e.message, 'warn');
            }
        });

        fonts.sort();
        debugLog('Total unique fonts found: ' + fonts.length, 'info');
        return fonts;

    } catch (e) {
        debugLog('Error in loadSystemFontsFromFilesystem: ' + e.message, 'error');
        return [];
    }
}

/**
 * UIボタンを追加
 */
function addCEPButtons() {
    debugLog('addCEPButtons() called', 'info');

    var toolbar = document.querySelector('.toolbar');
    if (!toolbar) {
        debugLog('Toolbar not found, cannot add CEP buttons', 'warn');
        return;
    }

    debugLog('Toolbar found, adding CEP buttons', 'info');

    // Premiere Pro連携ボタンを追加
    var cepButtonsHTML = `
        <button class="btn btn-secondary" onclick="getActiveSequenceInfo()" style="margin-left: 10px;">
            シーケンス情報
        </button>
        <button class="btn btn-primary" onclick="addToTimeline()">
            タイムラインに追加
        </button>
        <button class="btn btn-secondary" onclick="exportForPremiere()">
            PNG書き出し
        </button>
    `;

    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = cepButtonsHTML;
    tempDiv.style.display = 'inline-block';
    tempDiv.style.marginLeft = '10px';

    toolbar.appendChild(tempDiv);

    // シーケンス情報表示エリアを追加
    var infoDiv = document.createElement('div');
    infoDiv.id = 'sequenceInfo';
    infoDiv.style.cssText = 'margin-left: 10px; font-size: 11px; color: #aaa;';
    infoDiv.textContent = 'シーケンス情報を取得してください';
    toolbar.appendChild(infoDiv);

    debugLog('CEP buttons added successfully', 'info');
}

// ページ読み込み時に初期化
if (typeof window !== 'undefined') {
    window.addEventListener('load', function() {
        initCEP();

        // CEPモードの場合のみボタンを追加
        if (csInterface) {
            addCEPButtons();
        }
    });
}
