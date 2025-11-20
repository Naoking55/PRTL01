/**
 * Telop Editor - ExtendScript Host
 * Premiere Pro連携機能
 */

// グローバル名前空間
var TelopEditor = TelopEditor || {};

/**
 * アクティブシーケンスを取得
 */
TelopEditor.getActiveSequence = function() {
    if (app.project.activeSequence) {
        return {
            success: true,
            name: app.project.activeSequence.name,
            frameRate: app.project.activeSequence.timebase,
            videoTracks: app.project.activeSequence.videoTracks.numTracks,
            audioTracks: app.project.activeSequence.audioTracks.numTracks
        };
    }
    return { success: false, error: "アクティブなシーケンスがありません" };
};

/**
 * プロジェクトアイテムを作成
 * @param {string} name - アイテム名
 * @param {number} width - 幅
 * @param {number} height - 高さ
 */
TelopEditor.createGraphicLayer = function(name, width, height) {
    try {
        var seq = app.project.activeSequence;
        if (!seq) {
            return { success: false, error: "アクティブなシーケンスがありません" };
        }

        // カラーマットを作成（テンポラリ）
        var colorMatte = app.project.createNewColorMatte(
            name || "Telop",
            width || 1920,
            height || 1080,
            new RGBColor(0, 0, 0, 0) // 透明
        );

        if (colorMatte) {
            return {
                success: true,
                itemID: colorMatte.nodeId,
                message: "グラフィックレイヤーを作成しました"
            };
        } else {
            return { success: false, error: "グラフィックレイヤーの作成に失敗しました" };
        }
    } catch (e) {
        return { success: false, error: e.toString() };
    }
};

/**
 * タイムラインにクリップを追加
 * @param {string} itemID - プロジェクトアイテムID
 * @param {number} trackIndex - ビデオトラックインデックス
 * @param {number} timeSeconds - 挿入時間（秒）
 */
TelopEditor.addClipToTimeline = function(itemID, trackIndex, timeSeconds) {
    try {
        var seq = app.project.activeSequence;
        if (!seq) {
            return { success: false, error: "アクティブなシーケンスがありません" };
        }

        var item = app.project.rootItem.findItemsMatchingMediaPath(itemID, true);
        if (!item || item.length === 0) {
            return { success: false, error: "アイテムが見つかりません" };
        }

        var track = seq.videoTracks[trackIndex || 0];
        if (!track) {
            return { success: false, error: "指定されたトラックが存在しません" };
        }

        // タイムラインに挿入
        var time = timeSeconds || seq.getPlayerPosition().seconds;
        track.insertClip(item[0], time);

        return {
            success: true,
            message: "タイムラインに追加しました",
            time: time
        };
    } catch (e) {
        return { success: false, error: e.toString() };
    }
};

/**
 * エッセンシャルグラフィックスとしてテロップを作成
 * @param {Object} telopData - テロップデータ
 */
TelopEditor.createEssentialGraphic = function(telopData) {
    try {
        var seq = app.project.activeSequence;
        if (!seq) {
            return { success: false, error: "アクティブなシーケンスがありません" };
        }

        // エッセンシャルグラフィックスの作成
        // 注意: Premiere Pro ExtendScriptではエッセンシャルグラフィックスの直接作成は制限されている
        // 代わりに、Canvasで描画したPNGを書き出してインポートする方法を推奨

        return {
            success: false,
            error: "エッセンシャルグラフィックスの作成は現在サポートされていません。\nPNG書き出し → インポート方式をご利用ください。"
        };
    } catch (e) {
        return { success: false, error: e.toString() };
    }
};

/**
 * MOGRTファイルを書き出し
 * @param {string} outputPath - 出力パス
 * @param {Object} mogrtData - MOGRTデータ
 */
TelopEditor.exportMOGRT = function(outputPath, mogrtData) {
    try {
        // MOGRTの書き出しは複雑なため、代替アプローチを使用
        // 1. After Effectsプロジェクトを作成
        // 2. Canvasデータを元にコンポジションを構築
        // 3. MOGRTとして書き出し

        // 注意: これはPremiere Pro単体では完全にサポートされていない
        // After Effects連携が必要

        return {
            success: false,
            error: "MOGRT書き出しはAfter Effects連携が必要です。\n代わりにPNG/MP4書き出しをご利用ください。"
        };
    } catch (e) {
        return { success: false, error: e.toString() };
    }
};

/**
 * PNG画像としてテロップを書き出し
 * @param {string} base64Data - Base64エンコードされた画像データ
 * @param {string} outputPath - 出力パス
 */
TelopEditor.exportPNG = function(base64Data, outputPath) {
    try {
        // Base64デコードとファイル保存
        // 注意: ExtendScriptではBase64デコードとバイナリファイル書き込みが複雑
        // クライアント側で処理することを推奨

        var file = new File(outputPath);
        if (file.open("w")) {
            file.encoding = "BINARY";
            // Base64デコード処理が必要
            file.write(base64Data);
            file.close();
            return { success: true, path: outputPath };
        } else {
            return { success: false, error: "ファイルを開けませんでした" };
        }
    } catch (e) {
        return { success: false, error: e.toString() };
    }
};

/**
 * プロジェクトに画像をインポート
 * @param {string} imagePath - 画像パス
 * @param {string} binPath - ビンパス（オプション）
 */
TelopEditor.importImage = function(imagePath, binPath) {
    try {
        var targetBin = app.project.rootItem;

        // ビンパスが指定されている場合は作成または取得
        if (binPath) {
            targetBin = app.project.rootItem.createBin(binPath);
        }

        // 画像をインポート
        var importedFile = app.project.importFiles(
            [imagePath],
            true, // suppressUI
            targetBin,
            false // importAsNumberedStills
        );

        if (importedFile) {
            return {
                success: true,
                message: "画像をインポートしました",
                path: imagePath
            };
        } else {
            return { success: false, error: "インポートに失敗しました" };
        }
    } catch (e) {
        return { success: false, error: e.toString() };
    }
};

/**
 * ユーティリティ: JSON文字列をパース
 */
TelopEditor.parseJSON = function(jsonString) {
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        return { error: "JSON parse error: " + e.toString() };
    }
};

/**
 * ユーティリティ: オブジェクトをJSON文字列に変換
 */
TelopEditor.stringifyJSON = function(obj) {
    try {
        return JSON.stringify(obj);
    } catch (e) {
        return '{"error": "JSON stringify error"}';
    }
};

// デバッグ用: 利用可能な関数をリスト
TelopEditor.getFunctionList = function() {
    var functions = [];
    for (var key in TelopEditor) {
        if (typeof TelopEditor[key] === 'function') {
            functions.push(key);
        }
    }
    return { success: true, functions: functions };
};

// テスト用
TelopEditor.test = function() {
    return {
        success: true,
        message: "Telop Editor ExtendScript is running!",
        version: "1.0.0",
        host: app.name + " " + app.version
    };
};
