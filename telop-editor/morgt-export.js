/**
 * MOGRT Export Integration
 * new_index.htmlとMORGTGeneratorを統合するための関数
 */

// MOGRT Export Function
async function exportMOGRT() {
    try {
        // JSZipライブラリの存在確認
        if (typeof JSZip === 'undefined') {
            alert('JSZipライブラリが読み込まれていません。\n\nHTMLファイルに以下を追加してください:\n<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>');
            return;
        }

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

        // サムネイル用のキャンバスを生成
        const thumbnailCanvas = await generateMOGRTThumbnail();

        // MORGTジェネレーターのインスタンスを作成
        const generator = new MORGTGenerator();

        // キャンバスデータからMOGRT ZIPを生成
        const statusEl = document.getElementById('statusText');
        if (statusEl) {
            statusEl.textContent = 'MOGRT生成中...';
        }

        const mogrtBlob = await generator.generateMOGRT({
            resolution: document.getElementById('resolution').value,
            objects: textObjects,
            name: currentCanvas.name || 'telop',
            duration: 5000 // デフォルト5秒
        }, thumbnailCanvas);

        // ファイル名を生成
        const timestamp = new Date().toISOString().slice(0,19).replace(/:/g,'-');
        const filename = `${currentCanvas.name || 'telop'}_${timestamp}.mogrt`;

        // ダウンロード
        generator.downloadMOGRT(mogrtBlob, filename);

        if (statusEl) {
            statusEl.textContent = `MOGRT書き出し完了: ${filename}`;
            setTimeout(() => statusEl.textContent = '', 3000);
        }

        console.log('MOGRT exported successfully:', filename);
    } catch (error) {
        console.error('MOGRT export error:', error);
        alert('MOGRT書き出しに失敗しました: ' + error.message);

        const statusEl = document.getElementById('statusText');
        if (statusEl) {
            statusEl.textContent = 'MOGRT書き出し失敗';
            setTimeout(() => statusEl.textContent = '', 3000);
        }
    }
}

/**
 * MOGRT用のサムネイルを生成
 * @returns {Promise<HTMLCanvasElement>}
 */
async function generateMOGRTThumbnail() {
    return new Promise((resolve, reject) => {
        try {
            // 新しいキャンバスを作成（320x180のサムネイルサイズ）
            const thumbCanvas = document.createElement('canvas');
            thumbCanvas.width = 320;
            thumbCanvas.height = 180;
            const thumbCtx = thumbCanvas.getContext('2d');

            // 現在のメインキャンバスをサムネイルにコピー
            const mainCanvas = document.getElementById('canvas');
            if (!mainCanvas) {
                // キャンバスが見つからない場合、空のサムネイルを生成
                thumbCtx.fillStyle = '#1a1a1a';
                thumbCtx.fillRect(0, 0, 320, 180);
                resolve(thumbCanvas);
                return;
            }

            // メインキャンバスの内容をサムネイルサイズに縮小してコピー
            thumbCtx.drawImage(mainCanvas, 0, 0, mainCanvas.width, mainCanvas.height, 0, 0, 320, 180);

            resolve(thumbCanvas);
        } catch (error) {
            console.error('Thumbnail generation error:', error);
            // エラーが発生した場合でも、空のサムネイルを返す
            const thumbCanvas = document.createElement('canvas');
            thumbCanvas.width = 320;
            thumbCanvas.height = 180;
            const thumbCtx = thumbCanvas.getContext('2d');
            thumbCtx.fillStyle = '#1a1a1a';
            thumbCtx.fillRect(0, 0, 320, 180);
            resolve(thumbCanvas);
        }
    });
}
