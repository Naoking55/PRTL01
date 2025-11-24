/**
 * PRTL Import Integration
 * PRTLファイル(Adobe Premiere Pro レガシータイトル)を読み込んでキャンバスに表示
 */

class PRTLImporter {
    constructor() {
        this.parser = new DOMParser();
    }

    /**
     * PRTLファイルを読み込んでキャンバスデータに変換
     * @param {File} file - PRTLファイル
     * @returns {Promise<Object>} キャンバスデータ {resolution, objects: textObjects[]}
     */
    async importPRTL(file) {
        try {
            // ファイルをArrayBufferとして読み込む
            const arrayBuffer = await this._readFileAsArrayBuffer(file);

            // UTF-16 LE デコード
            const xml = this._decodeUTF16LE(arrayBuffer);

            // XMLパース
            const xmlDoc = this.parser.parseFromString(xml, 'text/xml');

            // パースエラーチェック
            const parserError = xmlDoc.querySelector('parsererror');
            if (parserError) {
                throw new Error('XML Parse Error: ' + parserError.textContent);
            }

            // PRTLデータを抽出
            const canvasData = this._parsePRTLXML(xmlDoc);

            return canvasData;
        } catch (error) {
            console.error('PRTL import error:', error);
            throw error;
        }
    }

    /**
     * ファイルをArrayBufferとして読み込む
     */
    _readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('File read error'));
            reader.readAsArrayBuffer(file);
        });
    }

    /**
     * UTF-16 LE デコード（BOMを考慮）
     */
    _decodeUTF16LE(arrayBuffer) {
        const uint8Array = new Uint8Array(arrayBuffer);

        // BOM確認 (0xFF 0xFE)
        let offset = 0;
        if (uint8Array.length >= 2 && uint8Array[0] === 0xFF && uint8Array[1] === 0xFE) {
            offset = 2; // BOMをスキップ
        }

        // UTF-16 LE デコード
        const uint16Array = new Uint16Array(arrayBuffer, offset);
        let str = '';
        for (let i = 0; i < uint16Array.length; i++) {
            str += String.fromCharCode(uint16Array[i]);
        }

        return str;
    }

    /**
     * PRTLのXMLをパースしてキャンバスデータに変換
     */
    _parsePRTLXML(xmlDoc) {
        // 解像度を取得
        const pXPIXELS = xmlDoc.querySelector('pXPIXELS');
        const pYLINES = xmlDoc.querySelector('pYLINES');
        const width = pXPIXELS ? parseInt(pXPIXELS.textContent) : 1920;
        const height = pYLINES ? parseInt(pYLINES.textContent) : 1080;
        const resolution = `${width}x${height}`;

        // TextDescriptions（フォント定義）を取得
        const textDescriptions = this._parseTextDescriptions(xmlDoc);

        // Styles（縁取り・エフェクト定義）を取得
        const styles = this._parseStyles(xmlDoc);

        // Shaders（色定義）を取得
        const shaders = this._parseShaders(xmlDoc);

        // Objects（テキストオブジェクト配置）を取得
        const objects = this._parseObjects(xmlDoc);

        // TextChains（テキスト内容）を取得
        const textChains = this._parseTextChains(xmlDoc);

        // オブジェクトにテキスト内容とスタイルを適用
        const textObjects = this._buildTextObjects(objects, textChains, textDescriptions, styles, shaders);

        return {
            resolution,
            objects: textObjects
        };
    }

    /**
     * TextDescriptions（フォント定義）をパース
     */
    _parseTextDescriptions(xmlDoc) {
        const textDescMap = {};
        const textDescriptions = xmlDoc.querySelectorAll('TextDescription');

        textDescriptions.forEach(td => {
            const ref = td.getAttribute('Reference');
            const fontFamily = td.querySelector('fifontFamilyName')?.textContent || 'Yu Gothic UI';
            const fontSize = td.querySelector('size')?.textContent || '616';

            textDescMap[ref] = {
                fontFamily,
                fontSize: parseInt(fontSize) / 8 // PRTLのサイズを8で割る（近似）
            };
        });

        return textDescMap;
    }

    /**
     * Styles（縁取り・エフェクト定義）をパース
     */
    _parseStyles(xmlDoc) {
        const styleMap = {};
        const styles = xmlDoc.querySelectorAll('Style');

        styles.forEach(style => {
            const id = style.getAttribute('ID');
            const fragments = style.querySelectorAll('Fragment');
            const shaderRefs = style.querySelectorAll('ShaderRef');

            const strokes = [];
            const shaderRefMap = {};

            // ShaderRefマップを作成
            shaderRefs.forEach(sr => {
                const painterNum = sr.getAttribute('PainterNumber');
                const shaderRef = sr.querySelector('shaderRef')?.textContent;
                if (shaderRef) {
                    shaderRefMap[painterNum] = shaderRef;
                }
            });

            // Fragmentsをパース
            fragments.forEach(frag => {
                const annotation = frag.querySelector('annotation')?.textContent;
                const fragmentOff = frag.querySelector('fragmentOff')?.textContent === 'true';
                const eFragmentType = frag.querySelector('eFragmentType')?.textContent;
                const size = parseFloat(frag.querySelector('size')?.textContent || '0');
                const painterMix = frag.querySelector('painterMix')?.textContent;

                // ストロークレイヤー（annotation=1,2,3,4...）
                if (annotation && annotation !== '65538' && annotation !== '65537' && !fragmentOff && eFragmentType === '2') {
                    const painterNum = painterMix ? painterMix.trim().split(' ')[0] : null;
                    strokes.push({
                        width: size / 2, // PRTLのサイズは直径なので半径に変換
                        painterNum: painterNum,
                        enabled: !fragmentOff
                    });
                }
            });

            styleMap[id] = {
                strokes,
                shaderRefMap
            };
        });

        return styleMap;
    }

    /**
     * Shaders（色定義）をパース
     */
    _parseShaders(xmlDoc) {
        const shaderMap = {};
        const shaders = xmlDoc.querySelectorAll('Shader');

        shaders.forEach(shader => {
            const ref = shader.querySelector('cReference')?.textContent;
            const colorSpecs = shader.querySelectorAll('ColorSpec');

            let color = '#ffffff';
            // ColorSpec index="4" が実際の色（PRTLの仕様）
            colorSpecs.forEach(cs => {
                const index = cs.getAttribute('index');
                if (index === '4' || index === '0') {
                    const r = parseInt(cs.querySelector('red')?.textContent || '255');
                    const g = parseInt(cs.querySelector('green')?.textContent || '255');
                    const b = parseInt(cs.querySelector('blue')?.textContent || '255');
                    color = this._rgbToHex(r, g, b);
                }
            });

            shaderMap[ref] = { color };
        });

        return shaderMap;
    }

    /**
     * Objects（テキストオブジェクト配置）をパース
     */
    _parseObjects(xmlDoc) {
        const objectsList = [];
        const objects = xmlDoc.querySelectorAll('Object');

        objects.forEach(obj => {
            const baseClassType = obj.querySelector('BaseClassType')?.textContent;

            if (baseClassType === 'TextObject') {
                const objectID = obj.querySelector('ObjectID')?.textContent;
                const x = parseFloat(obj.querySelector('Position x')?.textContent || '0');
                const y = parseFloat(obj.querySelector('Position y')?.textContent || '0');
                const textRef = obj.querySelector('TextRef')?.getAttribute('Reference');
                const styleRef = obj.querySelector('StyleReference')?.getAttribute('Reference');
                const opacity = parseFloat(obj.querySelector('Opacity')?.textContent || '1') * 100;
                const rotation = parseFloat(obj.querySelector('Rotation')?.textContent || '0');

                objectsList.push({
                    objectID,
                    x,
                    y,
                    textRef,
                    styleRef,
                    opacity,
                    rotation
                });
            }
        });

        return objectsList;
    }

    /**
     * TextChains（テキスト内容）をパース
     */
    _parseTextChains(xmlDoc) {
        const textChainMap = {};
        const textChains = xmlDoc.querySelectorAll('TextChain');

        textChains.forEach(tc => {
            const ref = tc.getAttribute('Reference');
            const text = tc.querySelector('Text')?.textContent || '';
            const textDescRef = tc.querySelector('TextDescriptionReference')?.getAttribute('Reference');
            const textStyleRef = tc.querySelector('TextStyleReference')?.getAttribute('Reference');

            textChainMap[ref] = {
                text,
                textDescRef,
                textStyleRef
            };
        });

        return textChainMap;
    }

    /**
     * オブジェクトにテキスト内容とスタイルを適用
     */
    _buildTextObjects(objects, textChains, textDescriptions, styles, shaders) {
        return objects.map((obj, index) => {
            const textChain = textChains[obj.textRef] || {};
            const textDesc = textDescriptions[textChain.textDescRef] || {};
            const style = styles[obj.styleRef] || {};

            // 文字を個別のcharオブジェクトに変換
            const text = textChain.text || '';
            const chars = text.split('').map(char => {
                // ストロークを色情報とマージ
                const charStrokes = (style.strokes || []).map(stroke => {
                    const painterNum = stroke.painterNum;
                    const shaderRef = style.shaderRefMap?.[painterNum];
                    const shader = shaders[shaderRef] || {};

                    return {
                        color: shader.color || '#000000',
                        width: stroke.width,
                        opacity: 100,
                        enabled: stroke.enabled,
                        type: 'normal',
                        join: 'round'
                    };
                });

                // メインテキスト色を取得（PainterNumber="-1"）
                const mainShaderRef = style.shaderRefMap?.['-1'];
                const mainShader = shaders[mainShaderRef] || {};
                const mainColor = mainShader.color || '#ffffff';

                return {
                    char,
                    fontSize: textDesc.fontSize || 48,
                    fontFamily: textDesc.fontFamily || 'Yu Gothic UI',
                    color: mainColor,
                    opacity: 100,
                    bold: false,
                    italic: false,
                    fillType: 'solid',
                    scaleX: 100,
                    scaleY: 100,
                    tracking: 0,
                    kerning: 0,
                    strokes: charStrokes,
                    shadowEnabled: false,
                    shadowColor: '#000000',
                    shadowOpacity: 0.5,
                    shadowAngle: 135,
                    shadowDistance: 10,
                    shadowBlur: 5
                };
            });

            return {
                id: Date.now() + index,
                type: 'text',
                name: `インポート ${index + 1}`,
                x: obj.x,
                y: obj.y,
                rotation: obj.rotation,
                opacity: obj.opacity,
                lineHeight: 1.2,
                textAlign: 'left',
                verticalAlign: 'middle',
                vertical: false,
                chars,
                nameTag: {
                    enabled: false,
                    text: '',
                    font: 'Yu Gothic UI',
                    position: 'top-left',
                    gap: 10,
                    color: '#ffffff',
                    size: 36,
                    bgEnabled: true,
                    bgShape: 'rounded',
                    bgRadius: 5,
                    bgColor: '#0066cc',
                    bgOpacity: 100,
                    padX: 10,
                    padY: 5,
                    strokeEnabled: false,
                    strokeColor: '#ffffff',
                    strokeWidth: 2
                },
                balloon: {
                    enabled: false,
                    shape: 'rounded',
                    radius: 20,
                    padX: 30,
                    padY: 20,
                    fill: '#ffffff',
                    fillOpacity: 100,
                    strokeEnabled: true,
                    strokeColor: '#000000',
                    strokeWidth: 3,
                    tailEnabled: true,
                    tailDir: 'bottom',
                    tailPos: 50,
                    tailWidth: 20,
                    tailLength: 30
                }
            };
        });
    }

    /**
     * RGBをHEXに変換
     */
    _rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }
}

/**
 * PRTL Import Function
 * ファイル選択ダイアログを表示してPRTLファイルを読み込む
 */
async function importPRTL() {
    try {
        // ファイル選択ダイアログを作成
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.prtl';

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const statusEl = document.getElementById('statusText');
            if (statusEl) {
                statusEl.textContent = 'PRTL読み込み中...';
            }

            try {
                const importer = new PRTLImporter();
                const canvasData = await importer.importPRTL(file);

                // 現在のキャンバスに追加、または新しいキャンバスを作成
                const shouldCreateNew = confirm('新しいキャンバスとして読み込みますか？\n「キャンセル」で現在のキャンバスに追加されます。');

                if (shouldCreateNew) {
                    // 新しいキャンバスを作成
                    const newCanvas = {
                        id: Date.now(),
                        name: file.name.replace('.prtl', ''),
                        objects: canvasData.objects
                    };
                    window.canvases = window.canvases || [];
                    window.canvases.push(newCanvas);
                    window.activeCanvasId = newCanvas.id;

                    // 解像度を設定
                    const resolutionSelect = document.getElementById('resolution');
                    if (resolutionSelect && resolutionSelect.value !== canvasData.resolution) {
                        resolutionSelect.value = canvasData.resolution;
                        // 解像度変更イベントを発火
                        if (typeof updateResolution === 'function') {
                            updateResolution();
                        }
                    }
                } else {
                    // 現在のキャンバスに追加
                    window.textObjects = window.textObjects || [];
                    canvasData.objects.forEach(obj => {
                        window.textObjects.push(obj);
                    });
                }

                // UIを更新
                if (typeof updateLayerList === 'function') updateLayerList();
                if (typeof render === 'function') render();
                if (typeof saveState === 'function') saveState();

                if (statusEl) {
                    statusEl.textContent = `PRTL読み込み完了: ${file.name}`;
                    setTimeout(() => statusEl.textContent = '', 3000);
                }

                console.log('PRTL imported successfully:', file.name, canvasData);
            } catch (error) {
                console.error('PRTL import error:', error);
                alert('PRTL読み込みに失敗しました: ' + error.message);

                if (statusEl) {
                    statusEl.textContent = 'PRTL読み込み失敗';
                    setTimeout(() => statusEl.textContent = '', 3000);
                }
            }
        };

        input.click();
    } catch (error) {
        console.error('PRTL import error:', error);
        alert('PRTL読み込みに失敗しました: ' + error.message);
    }
}

// グローバルに公開
if (typeof window !== 'undefined') {
    window.PRTLImporter = PRTLImporter;
    window.importPRTL = importPRTL;
}
