/**
 * PRTL01 Host Script
 * Adobe Premiere Pro / After Effects との連携スクリプト
 */

// Premiere Pro 用の関数
if (typeof app !== 'undefined' && app.name === 'Adobe Premiere Pro') {

    /**
     * アクティブシーケンスの情報を取得
     */
    function getActiveSequenceInfo() {
        if (!app.project.activeSequence) {
            return JSON.stringify({ error: 'アクティブなシーケンスがありません' });
        }

        var seq = app.project.activeSequence;
        return JSON.stringify({
            name: seq.name,
            frameRate: seq.framerate,
            width: seq.frameSizeHorizontal,
            height: seq.frameSizeVertical
        });
    }

    /**
     * PRTLファイルをタイムラインに追加
     */
    function importPRTLToTimeline(prtlPath) {
        try {
            if (!app.project.activeSequence) {
                return JSON.stringify({ error: 'アクティブなシーケンスがありません' });
            }

            // PRTLファイルをインポート
            var importedFile = app.project.importFiles([prtlPath], true, null, false);

            if (importedFile && importedFile[0]) {
                // タイムラインに追加
                var seq = app.project.activeSequence;
                var videoTrack = seq.videoTracks[0];
                var currentTime = seq.getPlayerPosition();

                videoTrack.insertClip(importedFile[0], currentTime);

                return JSON.stringify({
                    success: true,
                    message: 'PRTLをタイムラインに追加しました'
                });
            } else {
                return JSON.stringify({ error: 'ファイルのインポートに失敗しました' });
            }
        } catch (e) {
            return JSON.stringify({ error: e.toString() });
        }
    }

    /**
     * プロジェクトのパスを取得
     */
    function getProjectPath() {
        if (app.project.path) {
            return JSON.stringify({ path: app.project.path });
        } else {
            return JSON.stringify({ error: 'プロジェクトが保存されていません' });
        }
    }
}

// After Effects 用の関数
if (typeof app !== 'undefined' && app.name === 'After Effects') {

    /**
     * アクティブコンポジションの情報を取得
     */
    function getActiveCompInfo() {
        if (!app.project.activeItem || !(app.project.activeItem instanceof CompItem)) {
            return JSON.stringify({ error: 'アクティブなコンポジションがありません' });
        }

        var comp = app.project.activeItem;
        return JSON.stringify({
            name: comp.name,
            frameRate: comp.frameRate,
            width: comp.width,
            height: comp.height,
            duration: comp.duration
        });
    }

    /**
     * MOGRT書き出し用のコンポジションを作成
     */
    function createMOGRTComp(data) {
        try {
            var parsedData = typeof data === 'string' ? JSON.parse(data) : data;

            // 新規コンポジションを作成
            var comp = app.project.items.addComp(
                parsedData.name || 'PRTL01 Title',
                parsedData.width || 1920,
                parsedData.height || 1080,
                1.0,
                parsedData.duration || 5,
                parsedData.frameRate || 30
            );

            // テキストレイヤーを追加
            if (parsedData.text) {
                var textLayer = comp.layers.addText(parsedData.text);
                var textProp = textLayer.property("Source Text");
                var textDocument = textProp.value;

                if (parsedData.fontSize) textDocument.fontSize = parsedData.fontSize;
                if (parsedData.fontName) textDocument.font = parsedData.fontName;
                if (parsedData.color) {
                    textDocument.fillColor = parsedData.color;
                }

                textProp.setValue(textDocument);

                // 位置を設定
                if (parsedData.x && parsedData.y) {
                    textLayer.property("Position").setValue([parsedData.x, parsedData.y]);
                }

                // Essential Graphics に追加
                textProp.addToMotionGraphicsTemplateAs(comp, "テキスト");
                textLayer.property("Position").addToMotionGraphicsTemplateAs(comp, "位置");
            }

            // MOGRT名を設定
            comp.motionGraphicsTemplateName = parsedData.name || 'PRTL01 Title';

            return JSON.stringify({
                success: true,
                message: 'コンポジションを作成しました',
                compName: comp.name
            });
        } catch (e) {
            return JSON.stringify({ error: e.toString() });
        }
    }

    /**
     * MOGRT書き出し
     */
    function exportMOGRT(compName, outputPath) {
        try {
            var comp = null;

            // コンポジションを検索
            for (var i = 1; i <= app.project.items.length; i++) {
                if (app.project.items[i] instanceof CompItem &&
                    app.project.items[i].name === compName) {
                    comp = app.project.items[i];
                    break;
                }
            }

            if (!comp) {
                return JSON.stringify({ error: 'コンポジションが見つかりません' });
            }

            // MOGRT書き出し
            var outputFile = new File(outputPath);
            var success = comp.exportAsMotionGraphicsTemplate(true, outputFile);

            if (success) {
                return JSON.stringify({
                    success: true,
                    message: 'MOGRTを書き出しました',
                    path: outputPath
                });
            } else {
                return JSON.stringify({ error: 'MOGRT書き出しに失敗しました' });
            }
        } catch (e) {
            return JSON.stringify({ error: e.toString() });
        }
    }
}

// 共通関数
function getHostInfo() {
    return JSON.stringify({
        name: app.name,
        version: app.version,
        buildNumber: app.buildNumber
    });
}

// テスト用関数
function testConnection() {
    return JSON.stringify({
        success: true,
        message: 'ホストスクリプトとの接続成功',
        host: app.name
    });
}
