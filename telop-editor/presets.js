/**
 * Telop Editor - Preset & Template Management
 * プリセット・テンプレート管理機能
 */

// プリセットストレージ
const PresetManager = {
    STORAGE_KEY: 'telop_editor_presets',
    TEMPLATE_KEY: 'telop_editor_templates',

    /**
     * スタイルプリセットを保存
     * @param {string} name - プリセット名
     * @param {Object} style - スタイルデータ
     */
    saveStylePreset(name, style) {
        const presets = this.getStylePresets();
        presets[name] = {
            ...style,
            savedAt: new Date().toISOString(),
            version: '1.0'
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(presets));
        return { success: true, name };
    },

    /**
     * スタイルプリセットを取得
     */
    getStylePresets() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.error('Failed to load presets:', e);
            return {};
        }
    },

    /**
     * スタイルプリセットを削除
     * @param {string} name - プリセット名
     */
    deleteStylePreset(name) {
        const presets = this.getStylePresets();
        delete presets[name];
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(presets));
        return { success: true };
    },

    /**
     * テンプレートを保存
     * @param {string} name - テンプレート名
     * @param {Array} objects - オブジェクト配列
     * @param {Object} meta - メタデータ
     */
    saveTemplate(name, objects, meta = {}) {
        const templates = this.getTemplates();
        templates[name] = {
            objects: JSON.parse(JSON.stringify(objects)), // Deep copy
            meta: {
                ...meta,
                savedAt: new Date().toISOString(),
                version: '1.0',
                objectCount: objects.length
            }
        };
        localStorage.setItem(this.TEMPLATE_KEY, JSON.stringify(templates));
        return { success: true, name };
    },

    /**
     * テンプレートを取得
     */
    getTemplates() {
        try {
            const data = localStorage.getItem(this.TEMPLATE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.error('Failed to load templates:', e);
            return {};
        }
    },

    /**
     * テンプレートを削除
     * @param {string} name - テンプレート名
     */
    deleteTemplate(name) {
        const templates = this.getTemplates();
        delete templates[name];
        localStorage.setItem(this.TEMPLATE_KEY, JSON.stringify(templates));
        return { success: true };
    },

    /**
     * スタイルプリセットをエクスポート
     * @param {string} name - プリセット名
     */
    exportStylePreset(name) {
        const presets = this.getStylePresets();
        if (!presets[name]) {
            return { success: false, error: 'プリセットが見つかりません' };
        }

        const data = {
            type: 'telop_style_preset',
            version: '1.0',
            name: name,
            data: presets[name]
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.download = `preset_${name}_${Date.now()}.json`;
        link.href = URL.createObjectURL(blob);
        link.click();
        return { success: true };
    },

    /**
     * スタイルプリセットをインポート
     * @param {File} file - ファイル
     */
    importStylePreset(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.type !== 'telop_style_preset') {
                        reject(new Error('無効なプリセットファイルです'));
                        return;
                    }
                    this.saveStylePreset(data.name, data.data);
                    resolve({ success: true, name: data.name });
                } catch (err) {
                    reject(err);
                }
            };
            reader.readAsText(file);
        });
    },

    /**
     * テンプレートをエクスポート
     * @param {string} name - テンプレート名
     */
    exportTemplate(name) {
        const templates = this.getTemplates();
        if (!templates[name]) {
            return { success: false, error: 'テンプレートが見つかりません' };
        }

        const data = {
            type: 'telop_template',
            version: '1.0',
            name: name,
            data: templates[name]
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.download = `template_${name}_${Date.now()}.json`;
        link.href = URL.createObjectURL(blob);
        link.click();
        return { success: true };
    },

    /**
     * テンプレートをインポート
     * @param {File} file - ファイル
     */
    importTemplate(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.type !== 'telop_template') {
                        reject(new Error('無効なテンプレートファイルです'));
                        return;
                    }
                    this.saveTemplate(data.name, data.data.objects, data.data.meta);
                    resolve({ success: true, name: data.name });
                } catch (err) {
                    reject(err);
                }
            };
            reader.readAsText(file);
        });
    },

    /**
     * デフォルトプリセットを作成
     */
    createDefaultPresets() {
        const defaults = {
            '標準テロップ': {
                fontFamily: 'Yu Gothic UI',
                fontSize: 72,
                color: '#ffffff',
                fillType: 'solid',
                strokes: [{
                    enabled: true,
                    type: 'edge',
                    color: '#000000',
                    width: 4,
                    opacity: 100
                }],
                shadow: {
                    enabled: true,
                    color: '#000000',
                    opacity: 50,
                    angle: 45,
                    distance: 5,
                    blur: 5
                }
            },
            'グラデーション': {
                fontFamily: 'Yu Gothic UI',
                fontSize: 72,
                fillType: 'gradient',
                gradientStops: [
                    { color: '#ffffff', ratio: 50 },
                    { color: '#ffcc00', ratio: 50 }
                ],
                gradientAngle: 90,
                strokes: [{
                    enabled: true,
                    type: 'edge',
                    color: '#000000',
                    width: 3,
                    opacity: 100
                }]
            },
            '光沢付き': {
                fontFamily: 'Yu Gothic UI',
                fontSize: 72,
                color: '#0066cc',
                fillType: 'solid',
                gloss: {
                    enabled: true,
                    width: 10,
                    blur: 5,
                    color: '#ffffff',
                    opacity: 70
                },
                strokes: [{
                    enabled: true,
                    type: 'edge',
                    color: '#003366',
                    width: 4,
                    opacity: 100
                }],
                shadow: {
                    enabled: true,
                    color: '#000000',
                    opacity: 40,
                    angle: 45,
                    distance: 8,
                    blur: 10
                }
            }
        };

        const existing = this.getStylePresets();
        if (Object.keys(existing).length === 0) {
            Object.keys(defaults).forEach(name => {
                this.saveStylePreset(name, defaults[name]);
            });
        }
    }
};

// 初期化時にデフォルトプリセットを作成
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        PresetManager.createDefaultPresets();
    });
}
