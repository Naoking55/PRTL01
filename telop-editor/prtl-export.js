/**
 * PRTL Export Integration
 * new_index.htmlとPRTLGeneratorを統合するための関数
 */

// PRTL Export Function
function exportPRTL() {
    try {
        // 現在のキャンバスのデータを取得
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
