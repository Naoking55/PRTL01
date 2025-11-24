/**
 * PRTL Export Integration
 * new_index.htmlとPRTLGeneratorを統合するための関数
 */

// PRTL Export Function
function exportPRTL() {
    try {
        // 現在のキャンバスのデータを取得
        const canvases = window.canvases || [];
        const activeCanvasId = window.activeCanvasId;
        const textObjects = window.textObjects || [];

        const currentCanvas = canvases.find(c => c.id === activeCanvasId);
        if (!currentCanvas) {
            alert('キャンバスが見つかりません');
            return;
        }

        // 現在のtextObjectsを保存
        currentCanvas.objects = JSON.parse(JSON.stringify(textObjects));

        // PRTLジェネレーターのインスタンスを作成
        const generator = new PRTLGenerator();

        // キャンバスデータからPRTL XMLを生成
        const prtlXML = generator.generatePRTL({
            resolution: document.getElementById('resolution').value,
            objects: textObjects
        });

        // ファイル名を生成
        const timestamp = new Date().toISOString().slice(0,19).replace(/:/g,'-');
        const filename = `${currentCanvas.name || 'telop'}_${timestamp}.prtl`;

        // ダウンロード
        generator.downloadPRTL(prtlXML, filename);

        const statusEl = document.getElementById('statusText');
        if (statusEl) {
            statusEl.textContent = `PRTL書き出し完了: ${filename}`;
            setTimeout(() => statusEl.textContent = '', 3000);
        }

        console.log('PRTL exported successfully:', filename);
    } catch (error) {
        console.error('PRTL export error:', error);
        alert('PRTL書き出しに失敗しました: ' + error.message);
    }
}

/**
 * Batch PRTL Export Function
 * 全キャンバスを連番(_000, _001, _002...)でPRTL書き出し
 */
async function batchExportPRTL() {
    try {
        const canvases = window.canvases || [];
        const activeCanvasId = window.activeCanvasId;

        if (!canvases || canvases.length === 0) {
            alert('エクスポートするキャンバスがありません');
            return;
        }

        // ベースファイル名を入力
        const baseName = prompt('ベースファイル名を入力してください:', 'telop');
        if (!baseName) return;

        const statusEl = document.getElementById('statusText');
        const generator = new PRTLGenerator();
        const resolution = document.getElementById('resolution').value;

        // 元のキャンバスIDを保存
        const originalCanvasId = activeCanvasId;

        let successCount = 0;
        let failCount = 0;

        // 各キャンバスを順次エクスポート
        for (let i = 0; i < canvases.length; i++) {
            try {
                const canvas = canvases[i];

                // ステータス表示
                if (statusEl) {
                    statusEl.textContent = `PRTL書き出し中... (${i + 1}/${canvases.length})`;
                }

                // キャンバスのオブジェクトを取得
                const objects = canvas.objects || [];

                // PRTL XMLを生成
                const prtlXML = generator.generatePRTL({
                    resolution: resolution,
                    objects: objects
                });

                // 連番ファイル名を生成（_000, _001, _002...）
                const paddedIndex = String(i).padStart(3, '0');
                const filename = `${baseName}_${paddedIndex}.prtl`;

                // ダウンロード
                generator.downloadPRTL(prtlXML, filename);

                successCount++;

                // ブラウザが連続ダウンロードを処理できるように少し待機
                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (error) {
                console.error(`Canvas ${i} export failed:`, error);
                failCount++;
            }
        }

        // 元のキャンバスに戻す（必要に応じて）
        if (originalCanvasId) {
            // キャンバスを元に戻す処理は必要に応じて実装
        }

        // 結果表示
        if (statusEl) {
            statusEl.textContent = `バッチPRTL書き出し完了: 成功 ${successCount}件, 失敗 ${failCount}件`;
            setTimeout(() => statusEl.textContent = '', 5000);
        }

        alert(`バッチPRTL書き出し完了\n成功: ${successCount}件\n失敗: ${failCount}件`);

        console.log(`Batch PRTL export completed: ${successCount} success, ${failCount} failed`);

    } catch (error) {
        console.error('Batch PRTL export error:', error);
        alert('バッチPRTL書き出しに失敗しました: ' + error.message);
    }
}
