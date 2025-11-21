/**
 * Style Presets System
 * テロップスタイルプリセット管理
 * 参考: textylepremiere のスタイルカテゴリ
 */

window.StylePresets = (function() {
    'use strict';

    // スタイルカテゴリ（textylepremiere参考）
    const CATEGORIES = {
        CARTOON: {
            id: 'cartoon',
            name: 'カートゥーン',
            description: 'ポップで楽しいスタイル',
            icon: 'Cartoon.png',
            color: '#FF6B6B'
        },
        CINEMATIC: {
            id: 'cinematic',
            name: 'シネマティック',
            description: '映画的で高級感のあるスタイル',
            icon: 'Cinematic.png',
            color: '#4A4A4A'
        },
        MODERN: {
            id: 'modern',
            name: 'モダン',
            description: '現代的でスタイリッシュ',
            icon: 'Modern.png',
            color: '#00D9FF'
        },
        SIMPLE: {
            id: 'simple',
            name: 'シンプル',
            description: 'シンプルで使いやすい',
            icon: 'Simple.png',
            color: '#FFFFFF'
        },
        NEWS: {
            id: 'news',
            name: 'ニュース',
            description: 'ニュース番組風',
            icon: 'News.png',
            color: '#0066CC'
        },
        VARIETY: {
            id: 'variety',
            name: 'バラエティ',
            description: 'バラエティ番組風',
            icon: 'Variety.png',
            color: '#FFD700'
        }
    };

    // ビルトインスタイルプリセット
    const BUILTIN_PRESETS = {
        // カートゥーン
        'cartoon-pop': {
            id: 'cartoon-pop',
            name: 'ポップ',
            category: 'cartoon',
            style: {
                fontFamily: 'Rounded Mplus 1c',
                fontSize: 72,
                color: '#FFFFFF',
                fillType: 'linear',
                gradientStops: [
                    { pos: 0, color: '#FF6B6B' },
                    { pos: 100, color: '#FFE66D' }
                ],
                gradientAngle: 90,
                strokes: [
                    { enabled: true, type: 'edge', color: '#FFFFFF', width: 4, opacity: 100, join: 'round' },
                    { enabled: true, type: 'edge', color: '#333333', width: 8, opacity: 100, join: 'round' }
                ],
                shadowEnabled: true,
                shadowColor: '#000000',
                shadowOpacity: 50,
                shadowAngle: 135,
                shadowDistance: 5,
                shadowBlur: 10
            }
        },
        'cartoon-bubble': {
            id: 'cartoon-bubble',
            name: 'バブル',
            category: 'cartoon',
            style: {
                fontFamily: 'Hiragino Maru Gothic Pro',
                fontSize: 72,
                color: '#00BFFF',
                fillType: 'solid',
                strokes: [
                    { enabled: true, type: 'edge', color: '#FFFFFF', width: 6, opacity: 100, join: 'round' },
                    { enabled: true, type: 'edge', color: '#0088CC', width: 10, opacity: 100, join: 'round' }
                ],
                glossEnabled: true,
                glossOpacity: 60,
                glossHeight: 40
            }
        },
        'cartoon-comic': {
            id: 'cartoon-comic',
            name: 'コミック',
            category: 'cartoon',
            style: {
                fontFamily: 'Impact',
                fontSize: 80,
                color: '#FFFF00',
                fillType: 'solid',
                strokes: [
                    { enabled: true, type: 'edge', color: '#000000', width: 6, opacity: 100, join: 'miter' }
                ],
                shadowEnabled: true,
                shadowColor: '#FF0000',
                shadowOpacity: 100,
                shadowAngle: 135,
                shadowDistance: 8,
                shadowBlur: 0
            }
        },

        // シネマティック
        'cinematic-gold': {
            id: 'cinematic-gold',
            name: 'ゴールド',
            category: 'cinematic',
            style: {
                fontFamily: 'Times New Roman',
                fontSize: 72,
                fillType: 'linear',
                gradientStops: [
                    { pos: 0, color: '#FFD700' },
                    { pos: 30, color: '#FFF8DC' },
                    { pos: 50, color: '#FFD700' },
                    { pos: 70, color: '#B8860B' },
                    { pos: 100, color: '#8B4513' }
                ],
                gradientAngle: 90,
                strokes: [
                    { enabled: true, type: 'edge', color: '#8B4513', width: 2, opacity: 100, join: 'round' }
                ],
                shadowEnabled: true,
                shadowColor: '#000000',
                shadowOpacity: 80,
                shadowDistance: 4,
                shadowBlur: 8
            }
        },
        'cinematic-silver': {
            id: 'cinematic-silver',
            name: 'シルバー',
            category: 'cinematic',
            style: {
                fontFamily: 'Arial',
                fontSize: 72,
                fillType: 'linear',
                gradientStops: [
                    { pos: 0, color: '#C0C0C0' },
                    { pos: 30, color: '#FFFFFF' },
                    { pos: 50, color: '#C0C0C0' },
                    { pos: 70, color: '#808080' },
                    { pos: 100, color: '#404040' }
                ],
                gradientAngle: 90,
                strokes: [
                    { enabled: true, type: 'edge', color: '#2F2F2F', width: 2, opacity: 100, join: 'round' }
                ],
                shadowEnabled: true,
                shadowColor: '#000000',
                shadowOpacity: 60,
                shadowDistance: 3,
                shadowBlur: 6
            }
        },
        'cinematic-dark': {
            id: 'cinematic-dark',
            name: 'ダーク',
            category: 'cinematic',
            style: {
                fontFamily: 'Georgia',
                fontSize: 72,
                color: '#CCCCCC',
                fillType: 'solid',
                strokes: [
                    { enabled: true, type: 'edge', color: '#1A1A1A', width: 4, opacity: 100, join: 'round' }
                ],
                shadowEnabled: true,
                shadowColor: '#000000',
                shadowOpacity: 100,
                shadowDistance: 0,
                shadowBlur: 20
            }
        },

        // モダン
        'modern-neon': {
            id: 'modern-neon',
            name: 'ネオン',
            category: 'modern',
            style: {
                fontFamily: 'Helvetica Neue',
                fontSize: 72,
                color: '#00FFFF',
                fillType: 'solid',
                strokes: [
                    { enabled: true, type: 'edge', color: '#00FFFF', width: 2, opacity: 80, join: 'round', blur: true, blurAmount: 10 },
                    { enabled: true, type: 'edge', color: '#00FFFF', width: 8, opacity: 40, join: 'round', blur: true, blurAmount: 20 }
                ],
                shadowEnabled: true,
                shadowColor: '#00FFFF',
                shadowOpacity: 60,
                shadowDistance: 0,
                shadowBlur: 30
            }
        },
        'modern-gradient': {
            id: 'modern-gradient',
            name: 'グラデーション',
            category: 'modern',
            style: {
                fontFamily: 'Yu Gothic UI',
                fontSize: 72,
                fillType: 'linear',
                gradientStops: [
                    { pos: 0, color: '#667eea' },
                    { pos: 100, color: '#764ba2' }
                ],
                gradientAngle: 45,
                strokes: [
                    { enabled: true, type: 'edge', color: '#FFFFFF', width: 3, opacity: 100, join: 'round' }
                ]
            }
        },
        'modern-glass': {
            id: 'modern-glass',
            name: 'ガラス',
            category: 'modern',
            style: {
                fontFamily: 'Segoe UI',
                fontSize: 72,
                fillType: 'linear',
                gradientStops: [
                    { pos: 0, color: 'rgba(255,255,255,0.9)' },
                    { pos: 50, color: 'rgba(255,255,255,0.5)' },
                    { pos: 100, color: 'rgba(255,255,255,0.8)' }
                ],
                gradientAngle: 90,
                strokes: [
                    { enabled: true, type: 'edge', color: 'rgba(255,255,255,0.5)', width: 2, opacity: 100, join: 'round' }
                ],
                glossEnabled: true,
                glossOpacity: 80,
                glossHeight: 50
            }
        },

        // シンプル
        'simple-white': {
            id: 'simple-white',
            name: '白文字',
            category: 'simple',
            style: {
                fontFamily: 'Yu Gothic UI',
                fontSize: 72,
                color: '#FFFFFF',
                fillType: 'solid',
                strokes: [
                    { enabled: true, type: 'edge', color: '#000000', width: 4, opacity: 100, join: 'round' }
                ],
                shadowEnabled: true,
                shadowColor: '#000000',
                shadowOpacity: 50,
                shadowDistance: 2,
                shadowBlur: 4
            }
        },
        'simple-black': {
            id: 'simple-black',
            name: '黒文字',
            category: 'simple',
            style: {
                fontFamily: 'Yu Gothic UI',
                fontSize: 72,
                color: '#000000',
                fillType: 'solid',
                strokes: [
                    { enabled: true, type: 'edge', color: '#FFFFFF', width: 4, opacity: 100, join: 'round' }
                ]
            }
        },
        'simple-yellow': {
            id: 'simple-yellow',
            name: '黄色文字',
            category: 'simple',
            style: {
                fontFamily: 'Yu Gothic UI',
                fontSize: 72,
                color: '#FFFF00',
                fillType: 'solid',
                strokes: [
                    { enabled: true, type: 'edge', color: '#000000', width: 4, opacity: 100, join: 'round' }
                ],
                shadowEnabled: true,
                shadowColor: '#000000',
                shadowOpacity: 60,
                shadowDistance: 2,
                shadowBlur: 4
            }
        },

        // ニュース
        'news-headline': {
            id: 'news-headline',
            name: 'ヘッドライン',
            category: 'news',
            style: {
                fontFamily: 'Hiragino Kaku Gothic Pro',
                fontSize: 64,
                color: '#FFFFFF',
                fillType: 'solid',
                strokes: [
                    { enabled: true, type: 'edge', color: '#003366', width: 3, opacity: 100, join: 'miter' }
                ],
                shadowEnabled: false
            }
        },
        'news-breaking': {
            id: 'news-breaking',
            name: '速報',
            category: 'news',
            style: {
                fontFamily: 'Hiragino Kaku Gothic Pro',
                fontSize: 72,
                color: '#FFFFFF',
                fillType: 'solid',
                strokes: [
                    { enabled: true, type: 'edge', color: '#CC0000', width: 4, opacity: 100, join: 'miter' },
                    { enabled: true, type: 'edge', color: '#FFFFFF', width: 6, opacity: 100, join: 'miter' }
                ]
            }
        },
        'news-ticker': {
            id: 'news-ticker',
            name: 'ティッカー',
            category: 'news',
            style: {
                fontFamily: 'Meiryo',
                fontSize: 48,
                color: '#FFFFFF',
                fillType: 'solid',
                strokes: [
                    { enabled: true, type: 'edge', color: '#1A1A1A', width: 2, opacity: 100, join: 'round' }
                ]
            }
        },

        // バラエティ
        'variety-impact': {
            id: 'variety-impact',
            name: 'インパクト',
            category: 'variety',
            style: {
                fontFamily: 'Hiragino Sans',
                fontSize: 80,
                color: '#FF0000',
                fillType: 'solid',
                strokes: [
                    { enabled: true, type: 'edge', color: '#FFFF00', width: 6, opacity: 100, join: 'miter' },
                    { enabled: true, type: 'edge', color: '#000000', width: 10, opacity: 100, join: 'miter' }
                ],
                shadowEnabled: true,
                shadowColor: '#000000',
                shadowOpacity: 80,
                shadowDistance: 5,
                shadowBlur: 0
            }
        },
        'variety-cute': {
            id: 'variety-cute',
            name: 'キュート',
            category: 'variety',
            style: {
                fontFamily: 'Rounded Mplus 1c',
                fontSize: 72,
                fillType: 'linear',
                gradientStops: [
                    { pos: 0, color: '#FF69B4' },
                    { pos: 100, color: '#FFB6C1' }
                ],
                gradientAngle: 90,
                strokes: [
                    { enabled: true, type: 'edge', color: '#FFFFFF', width: 4, opacity: 100, join: 'round' },
                    { enabled: true, type: 'edge', color: '#FF1493', width: 8, opacity: 100, join: 'round' }
                ],
                glossEnabled: true,
                glossOpacity: 50,
                glossHeight: 40
            }
        },
        'variety-powerful': {
            id: 'variety-powerful',
            name: 'パワフル',
            category: 'variety',
            style: {
                fontFamily: 'Impact',
                fontSize: 84,
                color: '#FFD700',
                fillType: 'solid',
                strokes: [
                    { enabled: true, type: 'edge', color: '#FF4500', width: 5, opacity: 100, join: 'miter' },
                    { enabled: true, type: 'edge', color: '#000000', width: 10, opacity: 100, join: 'miter' }
                ],
                shadowEnabled: true,
                shadowColor: '#FF4500',
                shadowOpacity: 60,
                shadowDistance: 4,
                shadowBlur: 8
            }
        }
    };

    // ユーザーカスタムプリセット
    let customPresets = {};

    /**
     * 初期化
     */
    function init() {
        loadCustomPresets();
        console.log('[StylePresets] Initialized with', Object.keys(BUILTIN_PRESETS).length, 'builtin presets');
    }

    /**
     * カスタムプリセット読み込み
     */
    function loadCustomPresets() {
        try {
            const saved = localStorage.getItem('telopEditor_stylePresets');
            if (saved) {
                customPresets = JSON.parse(saved);
            }
        } catch (e) {
            console.error('[StylePresets] Failed to load:', e);
        }
    }

    /**
     * カスタムプリセット保存
     */
    function saveCustomPresets() {
        try {
            localStorage.setItem('telopEditor_stylePresets', JSON.stringify(customPresets));
        } catch (e) {
            console.error('[StylePresets] Failed to save:', e);
        }
    }

    /**
     * プリセット取得
     */
    function getPreset(id) {
        return BUILTIN_PRESETS[id] || customPresets[id] || null;
    }

    /**
     * カテゴリ別プリセット取得
     */
    function getPresetsByCategory(category) {
        const all = { ...BUILTIN_PRESETS, ...customPresets };
        if (!category) return Object.values(all);
        return Object.values(all).filter(p => p.category === category);
    }

    /**
     * 全カテゴリ取得
     */
    function getCategories() {
        return CATEGORIES;
    }

    /**
     * カスタムプリセット追加
     */
    function addCustomPreset(preset) {
        if (!preset.id || !preset.name || !preset.style) {
            console.error('[StylePresets] Invalid preset');
            return false;
        }
        preset.id = 'custom-' + Date.now();
        customPresets[preset.id] = preset;
        saveCustomPresets();
        return preset.id;
    }

    /**
     * カスタムプリセット削除
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
     * スタイルを文字データに適用
     * @param {Object} charData - 文字データ
     * @param {Object} style - スタイルデータ
     * @returns {Object} 適用後の文字データ
     */
    function applyStyleToChar(charData, style) {
        return {
            ...charData,
            fontFamily: style.fontFamily || charData.fontFamily,
            fontSize: style.fontSize || charData.fontSize,
            color: style.color || charData.color,
            fillType: style.fillType || charData.fillType,
            gradientStops: style.gradientStops || charData.gradientStops,
            gradientAngle: style.gradientAngle !== undefined ? style.gradientAngle : charData.gradientAngle,
            strokes: style.strokes || charData.strokes,
            shadowEnabled: style.shadowEnabled !== undefined ? style.shadowEnabled : charData.shadowEnabled,
            shadowColor: style.shadowColor || charData.shadowColor,
            shadowOpacity: style.shadowOpacity !== undefined ? style.shadowOpacity : charData.shadowOpacity,
            shadowAngle: style.shadowAngle !== undefined ? style.shadowAngle : charData.shadowAngle,
            shadowDistance: style.shadowDistance !== undefined ? style.shadowDistance : charData.shadowDistance,
            shadowBlur: style.shadowBlur !== undefined ? style.shadowBlur : charData.shadowBlur,
            glossEnabled: style.glossEnabled !== undefined ? style.glossEnabled : charData.glossEnabled,
            glossOpacity: style.glossOpacity !== undefined ? style.glossOpacity : charData.glossOpacity,
            glossHeight: style.glossHeight !== undefined ? style.glossHeight : charData.glossHeight
        };
    }

    /**
     * エクスポート
     */
    function exportPresets() {
        return JSON.stringify(customPresets, null, 2);
    }

    /**
     * インポート
     */
    function importPresets(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            Object.assign(customPresets, imported);
            saveCustomPresets();
            return true;
        } catch (e) {
            console.error('[StylePresets] Import failed:', e);
            return false;
        }
    }

    // 初期化
    init();

    return {
        CATEGORIES,
        getPreset,
        getPresetsByCategory,
        getCategories,
        addCustomPreset,
        removeCustomPreset,
        applyStyleToChar,
        exportPresets,
        importPresets
    };
})();
