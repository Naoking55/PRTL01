/**
 * Animation Presets System
 * テロップアニメーションプリセット管理
 * 参考: textylepremiere
 */

window.AnimationPresets = (function() {
    'use strict';

    // プリセットカテゴリ
    const CATEGORIES = {
        SIMPLE: { id: 'simple', name: 'シンプル', icon: 'opacity.png' },
        MODERN: { id: 'modern', name: 'モダン', icon: 'magic-wand.png' },
        DYNAMIC: { id: 'dynamic', name: 'ダイナミック', icon: 'shuffle.png' },
        ELASTIC: { id: 'elastic', name: 'エラスティック', icon: 'speed.png' },
        CREATIVE: { id: 'creative', name: 'クリエイティブ', icon: 'creative.png' }
    };

    // アニメーションタイプ
    const ANIMATION_TYPES = {
        IN: 'in',      // 登場アニメーション
        OUT: 'out',    // 退場アニメーション
        LOOP: 'loop'   // ループアニメーション
    };

    // 適用単位
    const APPLY_UNITS = {
        ALL: 'all',           // 全体
        CHARACTER: 'character', // 文字単位
        WORD: 'word',         // 単語単位
        LINE: 'line'          // 行単位
    };

    // イージング関数
    const EASINGS = {
        linear: t => t,
        easeInQuad: t => t * t,
        easeOutQuad: t => t * (2 - t),
        easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        easeInCubic: t => t * t * t,
        easeOutCubic: t => (--t) * t * t + 1,
        easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
        easeInElastic: t => {
            if (t === 0 || t === 1) return t;
            return -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
        },
        easeOutElastic: t => {
            if (t === 0 || t === 1) return t;
            return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
        },
        easeOutBounce: t => {
            if (t < 1 / 2.75) return 7.5625 * t * t;
            if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
            if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
            return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
        }
    };

    // ビルトインプリセット
    const BUILTIN_PRESETS = {
        // シンプル - IN
        'simple-fade-in': {
            id: 'simple-fade-in',
            name: 'フェードイン',
            category: 'simple',
            type: 'in',
            unit: 'all',
            duration: 500,
            easing: 'easeOutQuad',
            keyframes: [
                { time: 0, opacity: 0 },
                { time: 1, opacity: 1 }
            ]
        },
        'simple-slide-up-in': {
            id: 'simple-slide-up-in',
            name: 'スライドアップ',
            category: 'simple',
            type: 'in',
            unit: 'all',
            duration: 500,
            easing: 'easeOutCubic',
            keyframes: [
                { time: 0, opacity: 0, translateY: 50 },
                { time: 1, opacity: 1, translateY: 0 }
            ]
        },
        'simple-slide-down-in': {
            id: 'simple-slide-down-in',
            name: 'スライドダウン',
            category: 'simple',
            type: 'in',
            unit: 'all',
            duration: 500,
            easing: 'easeOutCubic',
            keyframes: [
                { time: 0, opacity: 0, translateY: -50 },
                { time: 1, opacity: 1, translateY: 0 }
            ]
        },
        'simple-slide-left-in': {
            id: 'simple-slide-left-in',
            name: 'スライド左から',
            category: 'simple',
            type: 'in',
            unit: 'all',
            duration: 500,
            easing: 'easeOutCubic',
            keyframes: [
                { time: 0, opacity: 0, translateX: -100 },
                { time: 1, opacity: 1, translateX: 0 }
            ]
        },
        'simple-slide-right-in': {
            id: 'simple-slide-right-in',
            name: 'スライド右から',
            category: 'simple',
            type: 'in',
            unit: 'all',
            duration: 500,
            easing: 'easeOutCubic',
            keyframes: [
                { time: 0, opacity: 0, translateX: 100 },
                { time: 1, opacity: 1, translateX: 0 }
            ]
        },
        'simple-scale-in': {
            id: 'simple-scale-in',
            name: 'スケールイン',
            category: 'simple',
            type: 'in',
            unit: 'all',
            duration: 500,
            easing: 'easeOutCubic',
            keyframes: [
                { time: 0, opacity: 0, scale: 0.5 },
                { time: 1, opacity: 1, scale: 1 }
            ]
        },

        // シンプル - OUT
        'simple-fade-out': {
            id: 'simple-fade-out',
            name: 'フェードアウト',
            category: 'simple',
            type: 'out',
            unit: 'all',
            duration: 500,
            easing: 'easeInQuad',
            keyframes: [
                { time: 0, opacity: 1 },
                { time: 1, opacity: 0 }
            ]
        },
        'simple-slide-up-out': {
            id: 'simple-slide-up-out',
            name: 'スライドアップ',
            category: 'simple',
            type: 'out',
            unit: 'all',
            duration: 500,
            easing: 'easeInCubic',
            keyframes: [
                { time: 0, opacity: 1, translateY: 0 },
                { time: 1, opacity: 0, translateY: -50 }
            ]
        },
        'simple-slide-down-out': {
            id: 'simple-slide-down-out',
            name: 'スライドダウン',
            category: 'simple',
            type: 'out',
            unit: 'all',
            duration: 500,
            easing: 'easeInCubic',
            keyframes: [
                { time: 0, opacity: 1, translateY: 0 },
                { time: 1, opacity: 0, translateY: 50 }
            ]
        },

        // モダン - IN (文字単位)
        'modern-typewriter-in': {
            id: 'modern-typewriter-in',
            name: 'タイプライター',
            category: 'modern',
            type: 'in',
            unit: 'character',
            duration: 100,
            stagger: 50,
            easing: 'linear',
            keyframes: [
                { time: 0, opacity: 0 },
                { time: 1, opacity: 1 }
            ]
        },
        'modern-wave-in': {
            id: 'modern-wave-in',
            name: 'ウェーブ',
            category: 'modern',
            type: 'in',
            unit: 'character',
            duration: 400,
            stagger: 30,
            easing: 'easeOutCubic',
            keyframes: [
                { time: 0, opacity: 0, translateY: 30 },
                { time: 0.6, translateY: -10 },
                { time: 1, opacity: 1, translateY: 0 }
            ]
        },
        'modern-cascade-in': {
            id: 'modern-cascade-in',
            name: 'カスケード',
            category: 'modern',
            type: 'in',
            unit: 'character',
            duration: 300,
            stagger: 40,
            easing: 'easeOutQuad',
            keyframes: [
                { time: 0, opacity: 0, translateY: -20, translateX: -10 },
                { time: 1, opacity: 1, translateY: 0, translateX: 0 }
            ]
        },

        // ダイナミック - IN
        'dynamic-bounce-in': {
            id: 'dynamic-bounce-in',
            name: 'バウンス',
            category: 'dynamic',
            type: 'in',
            unit: 'all',
            duration: 800,
            easing: 'easeOutBounce',
            keyframes: [
                { time: 0, opacity: 0, scale: 0.3, translateY: -100 },
                { time: 1, opacity: 1, scale: 1, translateY: 0 }
            ]
        },
        'dynamic-zoom-in': {
            id: 'dynamic-zoom-in',
            name: 'ズームイン',
            category: 'dynamic',
            type: 'in',
            unit: 'all',
            duration: 600,
            easing: 'easeOutCubic',
            keyframes: [
                { time: 0, opacity: 0, scale: 2.5 },
                { time: 1, opacity: 1, scale: 1 }
            ]
        },
        'dynamic-rotate-in': {
            id: 'dynamic-rotate-in',
            name: '回転イン',
            category: 'dynamic',
            type: 'in',
            unit: 'all',
            duration: 700,
            easing: 'easeOutCubic',
            keyframes: [
                { time: 0, opacity: 0, rotate: -180, scale: 0.5 },
                { time: 1, opacity: 1, rotate: 0, scale: 1 }
            ]
        },

        // エラスティック - IN
        'elastic-pop-in': {
            id: 'elastic-pop-in',
            name: 'ポップイン',
            category: 'elastic',
            type: 'in',
            unit: 'all',
            duration: 600,
            easing: 'easeOutElastic',
            keyframes: [
                { time: 0, opacity: 0, scale: 0.5 },
                { time: 1, opacity: 1, scale: 1 }
            ]
        },
        'elastic-spring-in': {
            id: 'elastic-spring-in',
            name: 'スプリング',
            category: 'elastic',
            type: 'in',
            unit: 'character',
            duration: 500,
            stagger: 50,
            easing: 'easeOutElastic',
            keyframes: [
                { time: 0, opacity: 0, translateY: 50, scale: 0.8 },
                { time: 1, opacity: 1, translateY: 0, scale: 1 }
            ]
        },

        // クリエイティブ - IN
        'creative-glitch-in': {
            id: 'creative-glitch-in',
            name: 'グリッチ',
            category: 'creative',
            type: 'in',
            unit: 'all',
            duration: 400,
            easing: 'linear',
            keyframes: [
                { time: 0, opacity: 0, translateX: -5 },
                { time: 0.2, opacity: 1, translateX: 5 },
                { time: 0.4, translateX: -3 },
                { time: 0.6, translateX: 3 },
                { time: 0.8, translateX: -1 },
                { time: 1, translateX: 0 }
            ]
        },
        'creative-blur-in': {
            id: 'creative-blur-in',
            name: 'ブラーイン',
            category: 'creative',
            type: 'in',
            unit: 'all',
            duration: 500,
            easing: 'easeOutQuad',
            keyframes: [
                { time: 0, opacity: 0, blur: 20 },
                { time: 1, opacity: 1, blur: 0 }
            ]
        }
    };

    // ユーザーカスタムプリセット（LocalStorageから読み込み）
    let customPresets = {};

    /**
     * 初期化
     */
    function init() {
        loadCustomPresets();
        console.log('[AnimationPresets] Initialized with', Object.keys(BUILTIN_PRESETS).length, 'builtin presets');
    }

    /**
     * カスタムプリセットをLocalStorageから読み込み
     */
    function loadCustomPresets() {
        try {
            const saved = localStorage.getItem('telopEditor_animationPresets');
            if (saved) {
                customPresets = JSON.parse(saved);
            }
        } catch (e) {
            console.error('[AnimationPresets] Failed to load custom presets:', e);
        }
    }

    /**
     * カスタムプリセットをLocalStorageに保存
     */
    function saveCustomPresets() {
        try {
            localStorage.setItem('telopEditor_animationPresets', JSON.stringify(customPresets));
        } catch (e) {
            console.error('[AnimationPresets] Failed to save custom presets:', e);
        }
    }

    /**
     * プリセット取得
     * @param {string} id - プリセットID
     * @returns {Object|null} プリセットデータ
     */
    function getPreset(id) {
        return BUILTIN_PRESETS[id] || customPresets[id] || null;
    }

    /**
     * カテゴリ別プリセット取得
     * @param {string} category - カテゴリID
     * @param {string} type - アニメーションタイプ (in/out/loop)
     * @returns {Array} プリセット配列
     */
    function getPresetsByCategory(category, type) {
        const allPresets = { ...BUILTIN_PRESETS, ...customPresets };
        return Object.values(allPresets).filter(p => {
            const categoryMatch = !category || p.category === category;
            const typeMatch = !type || p.type === type;
            return categoryMatch && typeMatch;
        });
    }

    /**
     * 全カテゴリ取得
     * @returns {Object} カテゴリオブジェクト
     */
    function getCategories() {
        return CATEGORIES;
    }

    /**
     * カスタムプリセット追加
     * @param {Object} preset - プリセットデータ
     * @returns {boolean} 成功/失敗
     */
    function addCustomPreset(preset) {
        if (!preset.id || !preset.name) {
            console.error('[AnimationPresets] Invalid preset: missing id or name');
            return false;
        }
        preset.id = 'custom-' + preset.id;
        customPresets[preset.id] = preset;
        saveCustomPresets();
        return true;
    }

    /**
     * カスタムプリセット削除
     * @param {string} id - プリセットID
     * @returns {boolean} 成功/失敗
     */
    function removeCustomPreset(id) {
        if (customPresets[id]) {
            delete customPresets[id];
            saveCustomPresets();
            return true;
        }
        return false;
    }

    /**
     * アニメーション値を補間
     * @param {Array} keyframes - キーフレーム配列
     * @param {number} progress - 進捗 (0-1)
     * @param {string} easingName - イージング名
     * @returns {Object} 補間された値
     */
    function interpolate(keyframes, progress, easingName) {
        const easing = EASINGS[easingName] || EASINGS.linear;
        const easedProgress = easing(Math.max(0, Math.min(1, progress)));

        // 該当するキーフレーム区間を見つける
        let prevFrame = keyframes[0];
        let nextFrame = keyframes[keyframes.length - 1];

        for (let i = 0; i < keyframes.length - 1; i++) {
            if (easedProgress >= keyframes[i].time && easedProgress <= keyframes[i + 1].time) {
                prevFrame = keyframes[i];
                nextFrame = keyframes[i + 1];
                break;
            }
        }

        // 区間内での進捗を計算
        const segmentProgress = (nextFrame.time === prevFrame.time) ? 1 :
            (easedProgress - prevFrame.time) / (nextFrame.time - prevFrame.time);

        // 各プロパティを補間
        const result = { time: easedProgress };
        const properties = ['opacity', 'translateX', 'translateY', 'scale', 'rotate', 'blur'];

        properties.forEach(prop => {
            const prevVal = prevFrame[prop];
            const nextVal = nextFrame[prop];
            if (prevVal !== undefined || nextVal !== undefined) {
                const pv = prevVal !== undefined ? prevVal : (prop === 'opacity' || prop === 'scale' ? 1 : 0);
                const nv = nextVal !== undefined ? nextVal : (prop === 'opacity' || prop === 'scale' ? 1 : 0);
                result[prop] = pv + (nv - pv) * segmentProgress;
            }
        });

        return result;
    }

    /**
     * アニメーションをCanvasに適用
     * @param {CanvasRenderingContext2D} ctx - Canvasコンテキスト
     * @param {Object} preset - プリセット
     * @param {number} progress - 進捗 (0-1)
     * @param {Object} bounds - 描画範囲 {x, y, width, height}
     */
    function applyToCanvas(ctx, preset, progress, bounds) {
        const values = interpolate(preset.keyframes, progress, preset.easing);

        ctx.save();

        // 透明度
        if (values.opacity !== undefined) {
            ctx.globalAlpha *= values.opacity;
        }

        // 変形の中心点
        const centerX = bounds.x + bounds.width / 2;
        const centerY = bounds.y + bounds.height / 2;

        ctx.translate(centerX, centerY);

        // 回転
        if (values.rotate) {
            ctx.rotate(values.rotate * Math.PI / 180);
        }

        // スケール
        if (values.scale !== undefined) {
            ctx.scale(values.scale, values.scale);
        }

        ctx.translate(-centerX, -centerY);

        // 移動
        if (values.translateX || values.translateY) {
            ctx.translate(values.translateX || 0, values.translateY || 0);
        }

        ctx.restore();

        return values;
    }

    /**
     * プリセットをエクスポート
     * @returns {string} JSON文字列
     */
    function exportPresets() {
        return JSON.stringify(customPresets, null, 2);
    }

    /**
     * プリセットをインポート
     * @param {string} jsonString - JSON文字列
     * @returns {boolean} 成功/失敗
     */
    function importPresets(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            Object.assign(customPresets, imported);
            saveCustomPresets();
            return true;
        } catch (e) {
            console.error('[AnimationPresets] Import failed:', e);
            return false;
        }
    }

    // 初期化
    init();

    // Public API
    return {
        CATEGORIES,
        ANIMATION_TYPES,
        APPLY_UNITS,
        EASINGS,
        getPreset,
        getPresetsByCategory,
        getCategories,
        addCustomPreset,
        removeCustomPreset,
        interpolate,
        applyToCanvas,
        exportPresets,
        importPresets
    };
})();
