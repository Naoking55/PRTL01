/**
 * Telop Editor - Custom Style Manager
 * カスタムスタイル保存・管理機能
 */

const CustomStyleManager = {
    STORAGE_KEY: 'telop_editor_custom_styles',
    styles: [],
    stylesDir: null, // CEP環境でのスタイル保存ディレクトリ

    /**
     * 初期化
     */
    init() {
        this.loadStyles();
        this.setupUI();
        console.log('CustomStyleManager initialized with', this.styles.length, 'styles');
    },

    /**
     * CEP環境でのスタイルディレクトリを設定
     * @param {string} basePath - CEPエクステンションのベースパス
     */
    setStylesDirectory(basePath) {
        if (typeof require !== 'undefined') {
            try {
                const path = require('path');
                const fs = require('fs');
                this.stylesDir = path.join(basePath, 'styles');

                // ディレクトリが存在しない場合は作成
                if (!fs.existsSync(this.stylesDir)) {
                    fs.mkdirSync(this.stylesDir, { recursive: true });
                    console.log('Created styles directory:', this.stylesDir);
                }
            } catch (e) {
                console.warn('Failed to set styles directory:', e);
                this.stylesDir = null;
            }
        }
    },

    /**
     * スタイルを保存
     * @param {string} name - スタイル名
     * @param {Object} styleData - スタイルデータ
     * @returns {Object} 結果
     */
    saveStyle(name, styleData) {
        const id = 'style_' + Date.now();
        const newStyle = {
            id: id,
            name: name,
            order: this.styles.length,
            savedAt: new Date().toISOString(),
            style: JSON.parse(JSON.stringify(styleData)) // Deep copy
        };

        this.styles.push(newStyle);
        this._persistStyles();
        this.renderStyleList();

        return { success: true, id: id, name: name };
    },

    /**
     * 選択中の文字からスタイルを抽出
     * @param {Object} charData - 文字データ
     * @returns {Object} スタイルデータ
     */
    extractStyleFromChar(charData) {
        return {
            fontFamily: charData.fontFamily || 'Yu Gothic UI',
            fontSize: charData.fontSize || 72,
            bold: charData.bold !== false,
            italic: charData.italic || false,
            opacity: charData.opacity || 100,
            tracking: charData.tracking || 0,
            slant: charData.slant || 0,
            scaleX: charData.scaleX || 100,

            // 塗り
            fillType: charData.fillType || 'solid',
            color: charData.color || '#ffffff',
            gradientAngle: charData.gradientAngle || 90,
            gradientStops: charData.gradientStops ?
                JSON.parse(JSON.stringify(charData.gradientStops)) :
                [{ color: '#ffffff', ratio: 50 }, { color: '#ffcc00', ratio: 50 }],

            // ストローク
            strokes: charData.strokes ?
                JSON.parse(JSON.stringify(charData.strokes)) :
                [{ enabled: true, type: 'edge', color: '#000000', width: 4, opacity: 100, angle: 45, join: 'round' }],

            // 影
            shadow: {
                enabled: charData.shadowEnabled || charData.shadow?.enabled || false,
                color: charData.shadowColor || charData.shadow?.color || '#000000',
                opacity: charData.shadowOpacity || charData.shadow?.opacity || 50,
                angle: charData.shadowAngle || charData.shadow?.angle || 45,
                distance: charData.shadowDistance || charData.shadow?.distance || 5,
                size: charData.shadowSize || charData.shadow?.size || 0,
                blur: charData.shadowBlur || charData.shadow?.blur || 5
            },

            // 光沢
            gloss: {
                enabled: charData.glossEnabled || charData.gloss?.enabled || false,
                color: charData.glossColor || charData.gloss?.color || '#ffffff',
                opacity: charData.glossOpacity || charData.gloss?.opacity || 50,
                width: charData.glossWidth || charData.gloss?.width || 10,
                blur: charData.glossBlur || charData.gloss?.blur || 5
            }
        };
    },

    /**
     * スタイルを適用
     * @param {string} styleId - スタイルID
     * @param {Object} targetChar - 適用先の文字オブジェクト
     */
    applyStyleToChar(styleId, targetChar) {
        const styleEntry = this.styles.find(s => s.id === styleId);
        if (!styleEntry) return { success: false, error: 'スタイルが見つかりません' };

        const style = styleEntry.style;

        // 基本プロパティ
        targetChar.fontFamily = style.fontFamily;
        targetChar.fontSize = style.fontSize;
        targetChar.bold = style.bold;
        targetChar.italic = style.italic;
        targetChar.opacity = style.opacity;
        targetChar.tracking = style.tracking;
        targetChar.slant = style.slant;
        targetChar.scaleX = style.scaleX;

        // 塗り
        targetChar.fillType = style.fillType;
        targetChar.color = style.color;
        targetChar.gradientAngle = style.gradientAngle;
        targetChar.gradientStops = JSON.parse(JSON.stringify(style.gradientStops));

        // ストローク
        targetChar.strokes = JSON.parse(JSON.stringify(style.strokes));

        // 影
        targetChar.shadowEnabled = style.shadow.enabled;
        targetChar.shadowColor = style.shadow.color;
        targetChar.shadowOpacity = style.shadow.opacity;
        targetChar.shadowAngle = style.shadow.angle;
        targetChar.shadowDistance = style.shadow.distance;
        targetChar.shadowSize = style.shadow.size;
        targetChar.shadowBlur = style.shadow.blur;

        // 光沢
        targetChar.glossEnabled = style.gloss.enabled;
        targetChar.glossColor = style.gloss.color;
        targetChar.glossOpacity = style.gloss.opacity;
        targetChar.glossWidth = style.gloss.width;
        targetChar.glossBlur = style.gloss.blur;

        return { success: true };
    },

    /**
     * スタイルを削除
     * @param {string} styleId - スタイルID
     */
    deleteStyle(styleId) {
        const index = this.styles.findIndex(s => s.id === styleId);
        if (index === -1) return { success: false, error: 'スタイルが見つかりません' };

        const deleted = this.styles.splice(index, 1)[0];

        // 順序を再割り当て
        this.styles.forEach((s, i) => s.order = i);

        this._persistStyles();
        this.renderStyleList();

        return { success: true, name: deleted.name };
    },

    /**
     * スタイル名を編集
     * @param {string} styleId - スタイルID
     * @param {string} newName - 新しい名前
     */
    renameStyle(styleId, newName) {
        const style = this.styles.find(s => s.id === styleId);
        if (!style) return { success: false, error: 'スタイルが見つかりません' };

        style.name = newName;
        this._persistStyles();
        this.renderStyleList();

        return { success: true };
    },

    /**
     * スタイルの順序を変更
     * @param {Array} orderedIds - 順序付けされたID配列
     */
    reorderStyles(orderedIds) {
        const reordered = [];
        orderedIds.forEach((id, index) => {
            const style = this.styles.find(s => s.id === id);
            if (style) {
                style.order = index;
                reordered.push(style);
            }
        });
        this.styles = reordered;
        this._persistStyles();
    },

    /**
     * スタイルをエクスポート
     * @param {Array} styleIds - エクスポートするスタイルのID配列（空なら全て）
     */
    exportStyles(styleIds = []) {
        const toExport = styleIds.length > 0
            ? this.styles.filter(s => styleIds.includes(s.id))
            : this.styles;

        if (toExport.length === 0) {
            return { success: false, error: 'エクスポートするスタイルがありません' };
        }

        const data = {
            type: 'telop_custom_styles',
            version: '1.0',
            exportedAt: new Date().toISOString(),
            count: toExport.length,
            styles: toExport
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.download = `custom_styles_${Date.now()}.json`;
        link.href = URL.createObjectURL(blob);
        link.click();

        return { success: true, count: toExport.length };
    },

    /**
     * スタイルをインポート
     * @param {File} file - インポートするファイル
     * @returns {Promise}
     */
    importStyles(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);

                    if (data.type !== 'telop_custom_styles') {
                        reject(new Error('無効なスタイルファイルです'));
                        return;
                    }

                    let importedCount = 0;
                    data.styles.forEach(styleEntry => {
                        // IDを再生成して重複を避ける
                        const newId = 'style_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                        styleEntry.id = newId;
                        styleEntry.order = this.styles.length + importedCount;
                        styleEntry.savedAt = new Date().toISOString();
                        this.styles.push(styleEntry);
                        importedCount++;
                    });

                    this._persistStyles();
                    this.renderStyleList();

                    resolve({ success: true, count: importedCount });
                } catch (err) {
                    reject(err);
                }
            };
            reader.readAsText(file);
        });
    },

    /**
     * スタイルを読み込み
     */
    loadStyles() {
        // CEP環境でファイルから読み込み
        if (this.stylesDir) {
            try {
                const fs = require('fs');
                const path = require('path');
                const stylesFile = path.join(this.stylesDir, 'custom-styles.json');

                if (fs.existsSync(stylesFile)) {
                    const data = fs.readFileSync(stylesFile, 'utf8');
                    const parsed = JSON.parse(data);
                    this.styles = parsed.styles || [];
                    console.log('Loaded styles from file:', this.styles.length);
                    return;
                }
            } catch (e) {
                console.warn('Failed to load styles from file:', e);
            }
        }

        // LocalStorageから読み込み（フォールバック）
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (data) {
                const parsed = JSON.parse(data);
                this.styles = parsed.styles || [];
            }
        } catch (e) {
            console.error('Failed to load styles from localStorage:', e);
            this.styles = [];
        }
    },

    /**
     * スタイルを永続化
     */
    _persistStyles() {
        const data = {
            version: '1.0',
            savedAt: new Date().toISOString(),
            styles: this.styles
        };

        // CEP環境でファイルに保存
        if (this.stylesDir) {
            try {
                const fs = require('fs');
                const path = require('path');
                const stylesFile = path.join(this.stylesDir, 'custom-styles.json');
                fs.writeFileSync(stylesFile, JSON.stringify(data, null, 2), 'utf8');
                console.log('Saved styles to file:', stylesFile);
            } catch (e) {
                console.warn('Failed to save styles to file:', e);
            }
        }

        // LocalStorageにも保存（バックアップ）
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save styles to localStorage:', e);
        }
    },

    /**
     * UIをセットアップ
     */
    setupUI() {
        // スタイルリストコンテナを探す
        const container = document.getElementById('customStylesContainer');
        if (container) {
            this.renderStyleList();
        }
    },

    /**
     * スタイルリストを描画
     */
    renderStyleList() {
        const list = document.getElementById('customStyleList');
        if (!list) return;

        list.innerHTML = '';

        if (this.styles.length === 0) {
            list.innerHTML = '<div style="color:#888;font-size:10px;padding:8px;text-align:center;">保存されたスタイルはありません</div>';
            return;
        }

        // グリッドレイアウト
        list.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:4px;max-height:200px;overflow-y:auto;padding:4px;';

        // 順序でソート
        const sortedStyles = [...this.styles].sort((a, b) => a.order - b.order);

        sortedStyles.forEach((styleEntry) => {
            const container = this._createStylePreview(styleEntry);
            list.appendChild(container);
        });

        // ドラッグ&ドロップを有効化
        this._enableDragAndDrop(list);
    },

    /**
     * スタイルプレビューを作成
     * @param {Object} styleEntry - スタイルエントリ
     */
    _createStylePreview(styleEntry) {
        const container = document.createElement('div');
        container.className = 'custom-style-item';
        container.dataset.styleId = styleEntry.id;
        container.draggable = true;
        container.style.cssText = 'cursor:pointer;border:2px solid #444;border-radius:3px;overflow:hidden;transition:border-color 0.2s;position:relative;';
        container.title = `${styleEntry.name}\nクリックで適用 | 右クリックでメニュー`;

        // クリックで適用
        container.onclick = () => this._onStyleClick(styleEntry.id);

        // ホバー効果
        container.onmouseenter = () => container.style.borderColor = '#0066cc';
        container.onmouseleave = () => container.style.borderColor = '#444';

        // 右クリックメニュー
        container.oncontextmenu = (e) => {
            e.preventDefault();
            this._showContextMenu(e, styleEntry.id);
        };

        // Canvasでプレビュー描画
        const canvas = document.createElement('canvas');
        canvas.width = 80;
        canvas.height = 60;
        this._drawStylePreview(canvas, styleEntry.style);
        container.appendChild(canvas);

        // スタイル名ラベル
        const label = document.createElement('div');
        label.style.cssText = 'background:#222;color:#ccc;font-size:8px;padding:2px;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
        label.textContent = styleEntry.name;
        container.appendChild(label);

        return container;
    },

    /**
     * スタイルプレビューを描画
     * @param {HTMLCanvasElement} canvas - キャンバス
     * @param {Object} style - スタイルデータ
     */
    _drawStylePreview(canvas, style) {
        const ctx = canvas.getContext('2d');

        // チェッカーボード背景
        const checkerSize = 8;
        for (let y = 0; y < canvas.height; y += checkerSize) {
            for (let x = 0; x < canvas.width; x += checkerSize) {
                ctx.fillStyle = ((x + y) / checkerSize) % 2 === 0 ? '#555' : '#777';
                ctx.fillRect(x, y, checkerSize, checkerSize);
            }
        }

        // フォント設定
        const fontStyle = (style.italic ? 'italic ' : '') + (style.bold ? 'bold ' : '');
        const fontSize = Math.min(32, style.fontSize * 0.4);
        ctx.font = `${fontStyle}${fontSize}px "${style.fontFamily}"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const x = canvas.width / 2;
        const y = canvas.height / 2;

        // 影
        if (style.shadow && style.shadow.enabled) {
            const shadowAngle = (style.shadow.angle || 45) * Math.PI / 180;
            const shadowDist = Math.min(3, style.shadow.distance * 0.3);
            ctx.shadowColor = style.shadow.color;
            ctx.shadowBlur = Math.min(5, style.shadow.blur * 0.5);
            ctx.shadowOffsetX = Math.cos(shadowAngle) * shadowDist;
            ctx.shadowOffsetY = Math.sin(shadowAngle) * shadowDist;
        }

        // ストローク
        if (style.strokes && style.strokes.length > 0) {
            const mainStroke = style.strokes[0];
            if (mainStroke && mainStroke.enabled) {
                ctx.strokeStyle = mainStroke.color;
                ctx.lineWidth = Math.min(4, mainStroke.width * 0.3);
                ctx.lineJoin = 'round';
                ctx.strokeText('Aa', x, y);
            }
        }

        // 影をリセット
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // 塗り
        if (style.fillType === 'linear' || style.fillType === 'radial') {
            const grad = ctx.createLinearGradient(x - 20, y - 15, x + 20, y + 15);
            if (style.gradientStops && style.gradientStops.length >= 2) {
                let pos = 0;
                style.gradientStops.forEach(stop => {
                    grad.addColorStop(Math.min(1, pos), stop.color);
                    pos += (stop.ratio / 100);
                });
            }
            ctx.fillStyle = grad;
        } else {
            ctx.fillStyle = style.color || '#ffffff';
        }

        ctx.fillText('Aa', x, y);

        // 光沢（簡易表現）
        if (style.gloss && style.gloss.enabled) {
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = style.gloss.color || '#ffffff';
            ctx.fillRect(x - 15, y - fontSize / 2, 30, fontSize / 3);
            ctx.globalAlpha = 1;
        }
    },

    /**
     * スタイルクリック時の処理
     * @param {string} styleId - スタイルID
     */
    _onStyleClick(styleId) {
        // グローバル関数を呼び出し（new_index.htmlで定義）
        if (typeof applyCustomStyle === 'function') {
            applyCustomStyle(styleId);
        } else {
            console.warn('applyCustomStyle function not found');
        }
    },

    /**
     * コンテキストメニューを表示
     * @param {Event} e - イベント
     * @param {string} styleId - スタイルID
     */
    _showContextMenu(e, styleId) {
        // 既存のメニューを削除
        const existing = document.getElementById('customStyleContextMenu');
        if (existing) existing.remove();

        const menu = document.createElement('div');
        menu.id = 'customStyleContextMenu';
        menu.style.cssText = `
            position: fixed;
            left: ${e.clientX}px;
            top: ${e.clientY}px;
            background: #2a2a2a;
            border: 1px solid #555;
            border-radius: 4px;
            padding: 4px 0;
            z-index: 10001;
            box-shadow: 0 2px 10px rgba(0,0,0,0.5);
            min-width: 120px;
        `;

        const menuItems = [
            { label: '適用', action: () => this._onStyleClick(styleId) },
            { label: '名前を変更', action: () => this._promptRename(styleId) },
            { label: 'エクスポート', action: () => this.exportStyles([styleId]) },
            { label: '---' },
            { label: '削除', action: () => this._confirmDelete(styleId), danger: true }
        ];

        menuItems.forEach(item => {
            if (item.label === '---') {
                const hr = document.createElement('div');
                hr.style.cssText = 'height:1px;background:#555;margin:4px 0;';
                menu.appendChild(hr);
            } else {
                const menuItem = document.createElement('div');
                menuItem.style.cssText = `
                    padding: 6px 12px;
                    cursor: pointer;
                    font-size: 11px;
                    color: ${item.danger ? '#ff6b6b' : '#e0e0e0'};
                `;
                menuItem.textContent = item.label;
                menuItem.onmouseenter = () => menuItem.style.background = '#3a3a3a';
                menuItem.onmouseleave = () => menuItem.style.background = 'transparent';
                menuItem.onclick = () => {
                    menu.remove();
                    item.action();
                };
                menu.appendChild(menuItem);
            }
        });

        document.body.appendChild(menu);

        // クリックで閉じる
        const closeMenu = (ev) => {
            if (!menu.contains(ev.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        setTimeout(() => document.addEventListener('click', closeMenu), 10);
    },

    /**
     * 名前変更プロンプト
     * @param {string} styleId - スタイルID
     */
    _promptRename(styleId) {
        const style = this.styles.find(s => s.id === styleId);
        if (!style) return;

        const newName = prompt('新しいスタイル名を入力:', style.name);
        if (newName && newName.trim()) {
            this.renameStyle(styleId, newName.trim());
        }
    },

    /**
     * 削除確認
     * @param {string} styleId - スタイルID
     */
    _confirmDelete(styleId) {
        const style = this.styles.find(s => s.id === styleId);
        if (!style) return;

        if (confirm(`スタイル「${style.name}」を削除しますか？`)) {
            this.deleteStyle(styleId);
        }
    },

    /**
     * ドラッグ&ドロップを有効化
     * @param {HTMLElement} list - リスト要素
     */
    _enableDragAndDrop(list) {
        let draggedItem = null;

        list.querySelectorAll('.custom-style-item').forEach(item => {
            item.addEventListener('dragstart', (e) => {
                draggedItem = item;
                item.style.opacity = '0.5';
                e.dataTransfer.effectAllowed = 'move';
            });

            item.addEventListener('dragend', () => {
                if (draggedItem) {
                    draggedItem.style.opacity = '1';
                    draggedItem = null;
                }
            });

            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            });

            item.addEventListener('drop', (e) => {
                e.preventDefault();
                if (draggedItem && draggedItem !== item) {
                    // DOM上での位置を入れ替え
                    const allItems = [...list.querySelectorAll('.custom-style-item')];
                    const draggedIndex = allItems.indexOf(draggedItem);
                    const targetIndex = allItems.indexOf(item);

                    if (draggedIndex < targetIndex) {
                        item.parentNode.insertBefore(draggedItem, item.nextSibling);
                    } else {
                        item.parentNode.insertBefore(draggedItem, item);
                    }

                    // 順序を保存
                    const newOrder = [...list.querySelectorAll('.custom-style-item')].map(el => el.dataset.styleId);
                    this.reorderStyles(newOrder);
                }
            });
        });
    },

    /**
     * スタイル一覧を取得
     */
    getStyles() {
        return [...this.styles].sort((a, b) => a.order - b.order);
    },

    /**
     * スタイルを取得
     * @param {string} styleId - スタイルID
     */
    getStyle(styleId) {
        return this.styles.find(s => s.id === styleId);
    }
};

// グローバルに公開
if (typeof window !== 'undefined') {
    window.CustomStyleManager = CustomStyleManager;
}
