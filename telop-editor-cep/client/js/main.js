/**
 * Telop Editor - CEP Integration
 * Premiere Pro連携のためのクライアント側コード
 */

// CSInterface インスタンス（CSInterface.jsが読み込まれている必要があります）
var csInterface = null;

/**
 * 初期化
 */
function initCEP() {
    if (typeof CSInterface !== 'undefined') {
        csInterface = new CSInterface();
        console.log('CEP initialized successfully');

        // ホスト環境情報を取得
        var hostEnv = csInterface.getHostEnvironment();
        console.log('Host Environment:', JSON.parse(hostEnv));

        // テスト実行
        testConnection();

        // システムフォントを読み込み（new_index.htmlのloadSystemFonts関数を呼び出し）
        setTimeout(function() {
            if (typeof loadSystemFonts === 'function') {
                loadSystemFonts().then(function() {
                    console.log('System fonts loaded in CEP mode');
                }).catch(function(err) {
                    console.error('Failed to load system fonts:', err);
                });
            }
        }, 1000);
    } else {
        console.warn('CSInterface not found. Running in standalone mode.');
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
    evalScript('TelopEditor.test()', function(result) {
        console.log('Connection test result:', result);
        if (result.success) {
            showNotification('Premiere Proとの接続に成功しました', 'success');
        } else {
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
    if (!csInterface) {
        alert('CEPモードではありません。\nスタンドアローンモードではこの機能は使用できません。');
        return;
    }

    // Canvasから画像を生成
    var canvas = document.getElementById('canvas');
    var imageData = canvas.toDataURL('image/png');

    // 一時ファイルとして保存し、Premiere Proにインポート
    var timestamp = Date.now();
    var tempPath = csInterface.getSystemPath(SystemPath.USER_DATA) + '/telop_' + timestamp + '.png';

    // Base64データをファイルに保存（Node.jsのfsモジュールを使用）
    var fs = require('fs');
    var base64Data = imageData.replace(/^data:image\/png;base64,/, '');

    try {
        fs.writeFileSync(tempPath, base64Data, 'base64');

        // Premiere Proにインポート
        var script = 'TelopEditor.importImage("' + tempPath.replace(/\\/g, '\\\\') + '", "Telops")';
        evalScript(script, function(result) {
            if (result.success) {
                showNotification('タイムラインに追加しました', 'success');

                // 一時ファイルを削除
                setTimeout(function() {
                    try {
                        fs.unlinkSync(tempPath);
                    } catch (e) {
                        console.warn('Failed to delete temp file:', e);
                    }
                }, 1000);
            } else {
                showNotification('追加に失敗: ' + result.error, 'error');
            }
        });
    } catch (e) {
        console.error('File save error:', e);
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
 * UIボタンを追加
 */
function addCEPButtons() {
    var toolbar = document.querySelector('.toolbar');
    if (!toolbar) return;

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
