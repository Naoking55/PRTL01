/**
 * Telop Editor - Performance Optimization
 * パフォーマンス最適化
 */

const PerformanceOptimizer = {
    /**
     * レンダリングキャッシュ
     */
    renderCache: new Map(),
    cacheMaxSize: 50,

    /**
     * オフスクリーンキャンバスプール
     */
    offscreenCanvasPool: [],
    maxPoolSize: 10,

    /**
     * レンダリングのデバウンス
     */
    renderDebounceTimer: null,
    renderDebounceDelay: 16, // ~60fps

    /**
     * オフスクリーンキャンバスを取得
     * @param {number} width - 幅
     * @param {number} height - 高さ
     */
    getOffscreenCanvas(width, height) {
        // プールから利用可能なキャンバスを探す
        const available = this.offscreenCanvasPool.find(
            canvas => canvas.width >= width && canvas.height >= height && !canvas.inUse
        );

        if (available) {
            available.inUse = true;
            return available;
        }

        // 新規作成
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.inUse = true;

        if (this.offscreenCanvasPool.length < this.maxPoolSize) {
            this.offscreenCanvasPool.push(canvas);
        }

        return canvas;
    },

    /**
     * オフスクリーンキャンバスを返却
     * @param {HTMLCanvasElement} canvas - キャンバス
     */
    releaseOffscreenCanvas(canvas) {
        canvas.inUse = false;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    },

    /**
     * レンダリングキャッシュキーを生成
     * @param {Object} obj - オブジェクト
     */
    generateCacheKey(obj) {
        // 重要なプロパティからハッシュを生成
        const keyProps = {
            id: obj.id,
            text: obj.chars ? obj.chars.map(c => c.char).join('') : '',
            fontSize: obj.chars && obj.chars[0] ? obj.chars[0].fontSize : 0,
            color: obj.chars && obj.chars[0] ? obj.chars[0].color : '',
            rotation: obj.rotation || 0,
            opacity: obj.opacity || 100
        };
        return JSON.stringify(keyProps);
    },

    /**
     * レンダリング結果をキャッシュ
     * @param {string} key - キャッシュキー
     * @param {ImageData} imageData - 画像データ
     */
    cacheRender(key, imageData) {
        // キャッシュサイズ制限
        if (this.renderCache.size >= this.cacheMaxSize) {
            const firstKey = this.renderCache.keys().next().value;
            this.renderCache.delete(firstKey);
        }
        this.renderCache.set(key, {
            imageData: imageData,
            timestamp: Date.now()
        });
    },

    /**
     * キャッシュから取得
     * @param {string} key - キャッシュキー
     */
    getCachedRender(key) {
        const cached = this.renderCache.get(key);
        if (cached) {
            // 古いキャッシュ（10秒以上）は削除
            if (Date.now() - cached.timestamp > 10000) {
                this.renderCache.delete(key);
                return null;
            }
            return cached.imageData;
        }
        return null;
    },

    /**
     * キャッシュをクリア
     */
    clearCache() {
        this.renderCache.clear();
    },

    /**
     * デバウンスされたレンダリング
     * @param {Function} renderFunc - レンダリング関数
     * @param {number} delay - 遅延（ミリ秒）
     */
    debouncedRender(renderFunc, delay = this.renderDebounceDelay) {
        if (this.renderDebounceTimer) {
            cancelAnimationFrame(this.renderDebounceTimer);
        }
        this.renderDebounceTimer = requestAnimationFrame(() => {
            renderFunc();
            this.renderDebounceTimer = null;
        });
    },

    /**
     * バッチレンダリング
     * 複数のオブジェクトを効率的にレンダリング
     * @param {Array} objects - オブジェクト配列
     * @param {HTMLCanvasElement} targetCanvas - ターゲットキャンバス
     * @param {Function} renderObject - オブジェクト描画関数
     */
    batchRender(objects, targetCanvas, renderObject) {
        const ctx = targetCanvas.getContext('2d');
        ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);

        // 不透明度でソート（不透明なものを先に描画）
        const sorted = [...objects].sort((a, b) => (b.opacity || 100) - (a.opacity || 100));

        // オフスクリーンキャンバスで個別に描画
        sorted.forEach(obj => {
            const offscreen = this.getOffscreenCanvas(targetCanvas.width, targetCanvas.height);
            const offCtx = offscreen.getContext('2d');

            renderObject(offCtx, obj);

            // メインキャンバスに合成
            ctx.drawImage(offscreen, 0, 0);
            this.releaseOffscreenCanvas(offscreen);
        });
    },

    /**
     * 仮想スクロール用のビューポート計算
     * @param {Array} items - アイテム配列
     * @param {number} scrollTop - スクロール位置
     * @param {number} viewportHeight - ビューポート高さ
     * @param {number} itemHeight - アイテム高さ
     */
    calculateVisibleRange(items, scrollTop, viewportHeight, itemHeight) {
        const startIndex = Math.floor(scrollTop / itemHeight);
        const endIndex = Math.ceil((scrollTop + viewportHeight) / itemHeight);
        const buffer = 5; // バッファ

        return {
            start: Math.max(0, startIndex - buffer),
            end: Math.min(items.length, endIndex + buffer),
            totalHeight: items.length * itemHeight
        };
    },

    /**
     * メモリ使用量を監視
     */
    monitorMemory() {
        if (performance.memory) {
            const used = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
            const total = (performance.memory.totalJSHeapSize / 1048576).toFixed(2);
            const limit = (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2);

            console.log(`Memory: ${used}MB / ${total}MB (Limit: ${limit}MB)`);

            // メモリ使用量が80%を超えたら警告
            if (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit > 0.8) {
                console.warn('High memory usage detected. Consider clearing cache.');
                this.clearCache();
            }
        }
    },

    /**
     * レンダリングパフォーマンスを測定
     * @param {Function} renderFunc - レンダリング関数
     * @param {string} label - ラベル
     */
    measureRender(renderFunc, label = 'Render') {
        const start = performance.now();
        renderFunc();
        const end = performance.now();
        const duration = end - start;

        console.log(`${label}: ${duration.toFixed(2)}ms`);

        // 60fps (16.67ms) を超えたら警告
        if (duration > 16.67) {
            console.warn(`Slow render detected: ${duration.toFixed(2)}ms`);
        }

        return duration;
    },

    /**
     * WebWorkerで重い処理を実行
     * @param {string} workerScript - Worker スクリプト
     * @param {*} data - データ
     */
    runInWorker(workerScript, data) {
        return new Promise((resolve, reject) => {
            const blob = new Blob([workerScript], { type: 'application/javascript' });
            const workerUrl = URL.createObjectURL(blob);
            const worker = new Worker(workerUrl);

            worker.onmessage = (e) => {
                resolve(e.data);
                worker.terminate();
                URL.revokeObjectURL(workerUrl);
            };

            worker.onerror = (e) => {
                reject(e);
                worker.terminate();
                URL.revokeObjectURL(workerUrl);
            };

            worker.postMessage(data);
        });
    },

    /**
     * 画像の最適化（リサイズ・圧縮）
     * @param {HTMLImageElement} img - 画像
     * @param {number} maxWidth - 最大幅
     * @param {number} maxHeight - 最大高さ
     * @param {number} quality - 品質 (0-1)
     */
    optimizeImage(img, maxWidth = 1920, maxHeight = 1080, quality = 0.9) {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // アスペクト比を維持してリサイズ
        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        return canvas.toDataURL('image/jpeg', quality);
    },

    /**
     * ガベージコレクションのヒント
     * 未使用リソースを解放
     */
    cleanup() {
        // キャッシュクリア
        this.clearCache();

        // オフスクリーンキャンバスプールをクリア
        this.offscreenCanvasPool.forEach(canvas => {
            canvas.width = 1;
            canvas.height = 1;
        });
        this.offscreenCanvasPool = [];

        // 強制GC（Chrome DevToolsでのみ利用可能）
        if (window.gc) {
            console.log('Running garbage collection...');
            window.gc();
        }
    },

    /**
     * パフォーマンス統計を取得
     */
    getStats() {
        return {
            cacheSize: this.renderCache.size,
            cacheMaxSize: this.cacheMaxSize,
            offscreenPoolSize: this.offscreenCanvasPool.length,
            memory: performance.memory ? {
                used: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + 'MB',
                total: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + 'MB',
                limit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + 'MB'
            } : 'Not available'
        };
    }
};

// 定期的なメモリ監視（開発モードのみ）
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    setInterval(() => {
        PerformanceOptimizer.monitorMemory();
    }, 30000); // 30秒ごと
}
