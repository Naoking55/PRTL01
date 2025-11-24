/**
 * PRTL Generator - Premiere Pro Legacy Title File Generator
 * キャンバスデータからPRTLファイル(Adobe Premiere Pro レガシータイトル)を生成
 */

class PRTLGenerator {
    constructor() {
        this.idCounter = 4096; // PRTL Reference ID counter
        this.shaderCounter = 4096;
        this.styleCounter = 4096;
    }

    /**
     * キャンバスデータからPRTL XMLを生成
     * @param {Object} canvasData - キャンバスデータ {resolution, objects: textObjects[]}
     * @returns {string} PRTL形式のXML文字列
     */
    generatePRTL(canvasData) {
        const [width, height] = (canvasData.resolution || '1920x1080').split('x').map(Number);
        const objects = canvasData.objects || [];

        // PRTLのXML構造を構築
        const xml = this._buildPRTLXML(width, height, objects);

        return xml;
    }

    /**
     * PRTLのXML構造を構築
     */
    _buildPRTLXML(width, height, objects) {
        // ユニークなフォント・スタイル・シェーダーを収集
        const fonts = this._collectUniqueFonts(objects);
        const styles = this._buildStyles(objects);
        const shaders = this._buildShaders(objects);
        const textDescriptions = this._buildTextDescriptions(fonts);
        const textures = this._buildTextures();
        const logos = this._buildLogos();
        const layers = this._buildLayers(objects);

        return `<?xml version="1.0" encoding="UTF-16" ?><Adobe_Root><Adobe_Title><Version>20080702</Version><Motion_Settings><Play_Forward>true</Play_Forward><Start_on_Screen>false</Start_on_Screen><Pre_Roll>0</Pre_Roll><Ease_In>0</Ease_In><End_off_Screen>false</End_off_Screen><Post_Roll>0</Post_Roll><Ease_Out>0</Ease_Out></Motion_Settings></Adobe_Title><InscriberLayouts Version="1.0"><Layout><LayoutEffectInfo Version="2"><EffectType>0</EffectType><Indic>false</Indic><Ligatures>false</Ligatures><HindiDigits>false</HindiDigits></LayoutEffectInfo><LayoutDimension Version="2"><pXPIXELS>${width}</pXPIXELS><pYLINES>${height}</pYLINES><pSCREENAR>1</pSCREENAR><growthDirection>growRightDown</growthDirection></LayoutDimension><LayoutAttributes><SafeTitleArea><left>0.1</left><top>0.1</top><right>0.9</right><bottom>0.9</bottom></SafeTitleArea><SafeActionArea><left>0.05</left><top>0.05</top><right>0.95</right><bottom>0.95</bottom></SafeActionArea></LayoutAttributes><Background Version="4"><ShaderReference>4098</ShaderReference><On>false</On><paintingRange>normalLayout</paintingRange></Background><DefaultStyle><Reference>${this.styleCounter}</Reference></DefaultStyle><DefaultTextDescription><Reference>${this.idCounter}</Reference></DefaultTextDescription><GraphicObjectDefaults><endCapType>square</endCapType><joinTypeClosed>round</joinTypeClosed><joinTypeOpen>round</joinTypeOpen><lineWidth>5</lineWidth><miterLimit>5</miterLimit><windBeziers>false</windBeziers><roundCornerFillets>37.5 37.5 37.5 37.5 37.5 37.5 37.5 37.5 </roundCornerFillets><clippedCornerFillets>37.5 37.5 37.5 37.5 37.5 37.5 37.5 37.5 </clippedCornerFillets></GraphicObjectDefaults><TextChainDefaults><normal><leading>0</leading><boxCanGrow>false</boxCanGrow><wordWrap>true</wordWrap><lockedLinesX>false</lockedLinesX><lockedLinesY>false</lockedLinesY><Alignment>left</Alignment><tabModeStyle>Word</tabModeStyle><implicitTabSpacing>100</implicitTabSpacing><implicitTabType>left</implicitTabType><rtl>false</rtl><tabs></tabs></normal><boxNormal><leading>0</leading><boxCanGrow>false</boxCanGrow><wordWrap>true</wordWrap><lockedLinesX>true</lockedLinesX><lockedLinesY>true</lockedLinesY><Alignment>left</Alignment><tabModeStyle>Word</tabModeStyle><implicitTabSpacing>100</implicitTabSpacing><implicitTabType>left</implicitTabType><rtl>false</rtl><tabs></tabs></boxNormal><blockNormal><leading>0</leading><boxCanGrow>false</boxCanGrow><wordWrap>false</wordWrap><lockedLinesX>true</lockedLinesX><lockedLinesY>true</lockedLinesY><Alignment>left</Alignment><tabModeStyle>Word</tabModeStyle><implicitTabSpacing>100</implicitTabSpacing><implicitTabType>left</implicitTabType><rtl>false</rtl><tabs></tabs></blockNormal><spline><leading>0</leading><boxCanGrow>false</boxCanGrow><wordWrap>false</wordWrap><lockedLinesX>false</lockedLinesX><lockedLinesY>false</lockedLinesY><Alignment>left</Alignment><tabModeStyle>Word</tabModeStyle><implicitTabSpacing>100</implicitTabSpacing><implicitTabType>left</implicitTabType><rtl>false</rtl><tabs></tabs></spline></TextChainDefaults>${textDescriptions}${styles}${shaders}${textures}${logos}${layers}<VLS><FileReference Version="1"><fileString></fileString><seClass>2</seClass><seCode>1000</seCode></FileReference></VLS></Layout></InscriberLayouts></Adobe_Root>`;
    }

    /**
     * ユニークなフォントを収集
     */
    _collectUniqueFonts(objects) {
        const fontSet = new Set();
        objects.forEach(obj => {
            if (obj.type === 'text' && obj.chars) {
                obj.chars.forEach(char => {
                    if (char.fontFamily) {
                        fontSet.add(char.fontFamily);
                    }
                });
            }
        });
        return Array.from(fontSet);
    }

    /**
     * TextDescriptions(フォント定義)を構築
     */
    _buildTextDescriptions(fonts) {
        if (fonts.length === 0) {
            fonts = ['Yu Gothic UI']; // デフォルト
        }

        let xml = '<TextDescriptions Version="4">';

        fonts.forEach((fontFamily, index) => {
            const ref = this.idCounter + index;
            xml += `<TextDescription Reference="${ref}"><TypeSpec><size>616</size><txHeight>75</txHeight><txKern>0</txKern><baselineShift>0</baselineShift><leading>0</leading><txSCaps>75</txSCaps><txSCapsOn>false</txSCapsOn><txSlant>0</txSlant><txUnderline>false</txUnderline><txWidth>67.5</txWidth><linked>false</linked><fiBold>0</fiBold><fiItalic>0</fiItalic><fifullName>${this._escapeXML(fontFamily)}</fifullName><fifontFamilyName>${this._escapeXML(fontFamily)}</fifontFamilyName><fifontStyle>Regular</fifontStyle><fifontType>5</fifontType><ficategory>1</ficategory></TypeSpec></TextDescription>`;
        });

        xml += '</TextDescriptions>';

        return xml;
    }

    /**
     * Styles(縁取り・エフェクト定義)を構築
     */
    _buildStyles(objects) {
        let xml = '<Styles>';

        // 各テキストオブジェクトの固有スタイルを生成
        objects.forEach((obj, index) => {
            if (obj.type === 'text' && obj.chars && obj.chars.length > 0) {
                const style = this._buildSingleStyle(obj, index);
                xml += style;
            }
        });

        // 少なくとも1つのデフォルトスタイルを追加
        if (objects.length === 0) {
            xml += this._buildDefaultStyle();
        }

        xml += '</Styles>';
        return xml;
    }

    /**
     * 単一のスタイルを構築(Fragment構造)
     */
    _buildSingleStyle(obj, index) {
        const styleId = this.styleCounter + index;
        const firstChar = obj.chars[0];
        const strokes = firstChar.strokes || [];

        // Fragmentsを構築: ストローク(外側→内側) + メインテキスト + 影
        let fragments = '';

        // ストロークレイヤー (外側から内側へ)
        strokes.slice().reverse().forEach((stroke, i) => {
            if (stroke.enabled) {
                const annotation = strokes.length - i; // 1, 2, 3, 4
                const painterNum = 10 + (strokes.length - i - 1); // 10, 11, 12, 13
                fragments += `<Fragment><size>${stroke.width * 2}</size><offset>0</offset><angle>0</angle><ghost>false</ghost><isExtendedShadowFragment>false</isExtendedShadowFragment><eFragmentType>2</eFragmentType><fragmentOff>${!stroke.enabled}</fragmentOff><placeHolder>false</placeHolder><annotation>${annotation}</annotation><placeHolderShaderIndex>4294967295</placeHolderShaderIndex><painterMix>${painterNum} ${painterNum} ${painterNum} ${painterNum} ${painterNum} ${painterNum} ${painterNum} ${painterNum} ${painterNum} ${painterNum} ${painterNum} ${painterNum} ${painterNum} ${painterNum} ${painterNum} ${painterNum} </painterMix></Fragment>`;
            }
        });

        // メインテキスト (annotation=65538)
        fragments += `<Fragment><size>0</size><offset>0</offset><angle>0</angle><ghost>false</ghost><isExtendedShadowFragment>false</isExtendedShadowFragment><eFragmentType>0</eFragmentType><fragmentOff>false</fragmentOff><placeHolder>false</placeHolder><annotation>65538</annotation><placeHolderShaderIndex>4294967295</placeHolderShaderIndex><painterMix>15 15 15 15 15 15 15 15 15 15 15 15 15 15 15 15 </painterMix></Fragment>`;

        // 影 (annotation=65537) - デフォルトでOFF
        const shadowEnabled = firstChar.shadowEnabled || false;
        const shadowDistance = firstChar.shadowDistance || 10;
        const shadowAngle = firstChar.shadowAngle || -45;
        fragments += `<Fragment><size>0</size><offset>${shadowDistance}</offset><angle>${shadowAngle}</angle><ghost>false</ghost><isExtendedShadowFragment>true</isExtendedShadowFragment><eFragmentType>0</eFragmentType><fragmentOff>${!shadowEnabled}</fragmentOff><placeHolder>false</placeHolder><annotation>65537</annotation><placeHolderShaderIndex>4294967295</placeHolderShaderIndex><painterMix>0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 </painterMix></Fragment>`;

        // ShaderList構築
        let shaderList = '';
        for (let i = 2; i <= 15; i++) {
            const shaderRef = i >= 10 && i <= 13 ? (this.shaderCounter + index * 20 + (i - 10)) : 0;
            shaderList += `<ShaderRef PainterNumber="${i}"><shaderRef>${shaderRef}</shaderRef></ShaderRef>`;
        }
        shaderList += `<ShaderRef PainterNumber="-1"><shaderRef>${this.shaderCounter + index * 20 + 15}</shaderRef></ShaderRef>`;
        for (let i = 1000; i <= 1015; i++) {
            shaderList += `<ShaderRef PainterNumber="${i}"><shaderRef>0</shaderRef></ShaderRef>`;
        }

        return `<Style ID="${styleId}"><StyleBase Version="4"><type>50000</type><positionDominance>0</positionDominance><lineGradient>false</lineGradient><styleRef>${styleId}</styleRef><faceDistortX>0</faceDistortX><faceDistortY>0</faceDistortY><shadow_softness>30</shadow_softness><personality>0</personality><linked>false</linked><EmbellishmentSizeRule>false</EmbellishmentSizeRule><PainterRampType>Basic</PainterRampType></StyleBase><FragmentList Version="5">${fragments}</FragmentList><ShaderList Version="1">${shaderList}</ShaderList></Style>`;
    }

    /**
     * デフォルトスタイルを構築
     */
    _buildDefaultStyle() {
        const styleId = this.styleCounter;
        const fragments = `<Fragment><size>60</size><offset>0</offset><angle>0</angle><ghost>false</ghost><isExtendedShadowFragment>false</isExtendedShadowFragment><eFragmentType>2</eFragmentType><fragmentOff>false</fragmentOff><placeHolder>false</placeHolder><annotation>2</annotation><placeHolderShaderIndex>4294967295</placeHolderShaderIndex><painterMix>12 12 12 12 12 12 12 12 12 12 12 12 12 12 12 12 </painterMix></Fragment><Fragment><size>30</size><offset>0</offset><angle>0</angle><ghost>false</ghost><isExtendedShadowFragment>false</isExtendedShadowFragment><eFragmentType>2</eFragmentType><fragmentOff>false</fragmentOff><placeHolder>false</placeHolder><annotation>1</annotation><placeHolderShaderIndex>4294967295</placeHolderShaderIndex><painterMix>13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 </painterMix></Fragment><Fragment><size>0</size><offset>0</offset><angle>0</angle><ghost>false</ghost><isExtendedShadowFragment>false</isExtendedShadowFragment><eFragmentType>0</eFragmentType><fragmentOff>false</fragmentOff><placeHolder>false</placeHolder><annotation>65538</annotation><placeHolderShaderIndex>4294967295</placeHolderShaderIndex><painterMix>15 15 15 15 15 15 15 15 15 15 15 15 15 15 15 15 </painterMix></Fragment><Fragment><size>0</size><offset>10</offset><angle>-45</angle><ghost>false</ghost><isExtendedShadowFragment>true</isExtendedShadowFragment><eFragmentType>0</eFragmentType><fragmentOff>true</fragmentOff><placeHolder>false</placeHolder><annotation>65537</annotation><placeHolderShaderIndex>4294967295</placeHolderShaderIndex><painterMix>0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 </painterMix></Fragment>`;

        return `<Style ID="${styleId}"><StyleBase Version="4"><type>50000</type><positionDominance>0</positionDominance><lineGradient>false</lineGradient><styleRef>${styleId}</styleRef><faceDistortX>0</faceDistortX><faceDistortY>0</faceDistortY><shadow_softness>30</shadow_softness><personality>0</personality><linked>false</linked><EmbellishmentSizeRule>false</EmbellishmentSizeRule><PainterRampType>Basic</PainterRampType></StyleBase><FragmentList Version="5">${fragments}</FragmentList><ShaderList Version="1"><ShaderRef PainterNumber="12"><shaderRef>4099</shaderRef></ShaderRef><ShaderRef PainterNumber="13"><shaderRef>4100</shaderRef></ShaderRef><ShaderRef PainterNumber="15"><shaderRef>4101</shaderRef></ShaderRef><ShaderRef PainterNumber="-1"><shaderRef>4102</shaderRef></ShaderRef></ShaderList></Style>`;
    }

    /**
     * Shaders(色定義)を構築
     */
    _buildShaders(objects) {
        let xml = '<Shaders>';

        objects.forEach((obj, index) => {
            if (obj.type === 'text' && obj.chars && obj.chars.length > 0) {
                const char = obj.chars[0];
                const strokes = char.strokes || [];

                // ストローク用シェーダー
                strokes.forEach((stroke, i) => {
                    const ref = this.shaderCounter + index * 20 + i;
                    const rgb = this._hexToRGB(stroke.color);
                    xml += `<Shader Version="4"><cReference>${ref}</cReference><textureRef>0</textureRef><colorOption>4</colorOption><shaderOn>true</shaderOn><glintSize>10</glintSize><glintOffset>0</glintOffset><rampPosTop>75</rampPosTop><rampPosBottom>25</rampPosBottom><rampAngle>0</rampAngle><bevelBalance>0</bevelBalance><rampCycle>0</rampCycle><classicStyle>0</classicStyle><rampType>0</rampType><ColorSpec index="0"><red>0</red><green>0</green><blue>0</blue><xpar>0</xpar></ColorSpec><ColorSpec index="1"><red>0</red><green>0</green><blue>0</blue><xpar>0</xpar></ColorSpec><ColorSpec index="2"><red>0</red><green>0</green><blue>0</blue><xpar>0</xpar></ColorSpec><ColorSpec index="3"><red>0</red><green>0</green><blue>0</blue><xpar>0</xpar></ColorSpec><ColorSpec index="4"><red>${rgb.r}</red><green>${rgb.g}</green><blue>${rgb.b}</blue><xpar>0</xpar></ColorSpec><glintAngle>0</glintAngle><bevelSize>0</bevelSize><bevelDirection>0</bevelDirection><bevelPipe>false</bevelPipe><bevelAngle>0</bevelAngle><bevelShape>1</bevelShape><bevelShining>0</bevelShining><bevelLight>false</bevelLight><bevelMerge>true</bevelMerge><sheenOn>false</sheenOn></Shader>`;
                });

                // メインテキスト用シェーダー
                const mainRef = this.shaderCounter + index * 20 + 15;
                const mainRGB = this._hexToRGB(char.color || '#ffffff');
                xml += `<Shader Version="4"><cReference>${mainRef}</cReference><textureRef>0</textureRef><colorOption>4</colorOption><shaderOn>true</shaderOn><glintSize>10</glintSize><glintOffset>0</glintOffset><rampPosTop>75</rampPosTop><rampPosBottom>25</rampPosBottom><rampAngle>0</rampAngle><bevelBalance>0</bevelBalance><rampCycle>0</rampCycle><classicStyle>0</classicStyle><rampType>0</rampType><ColorSpec index="0"><red>${mainRGB.r}</red><green>${mainRGB.g}</green><blue>${mainRGB.b}</blue><xpar>0</xpar></ColorSpec><ColorSpec index="1"><red>0</red><green>0</green><blue>0</blue><xpar>0</xpar></ColorSpec><ColorSpec index="2"><red>0</red><green>0</green><blue>0</blue><xpar>0</xpar></ColorSpec><ColorSpec index="3"><red>0</red><green>0</green><blue>0</blue><xpar>0</xpar></ColorSpec><ColorSpec index="4"><red>250</red><green>250</green><blue>250</blue><xpar>0</xpar></ColorSpec><glintAngle>0</glintAngle><bevelSize>0</bevelSize><bevelDirection>0</bevelDirection><bevelPipe>false</bevelPipe><bevelAngle>0</bevelAngle><bevelShape>1</bevelShape><bevelShining>0</bevelShining><bevelLight>false</bevelLight><bevelMerge>true</bevelMerge><sheenOn>false</sheenOn></Shader>`;
            }
        });

        xml += '</Shaders>';
        return xml;
    }

    /**
     * Textures(テクスチャ定義)を構築
     */
    _buildTextures() {
        // 参考PRTLファイルのTextures構造（最小限）
        return '<Textures></Textures>';
    }

    /**
     * Logos(ロゴ定義)を構築
     */
    _buildLogos() {
        return '<Logos></Logos>';
    }

    /**
     * Layers(レイヤー構造)を構築
     * 参考PRTLファイルの構造に完全準拠
     */
    _buildLayers(objects) {
        let xml = '<Layers><Layer><DrawPage></DrawPage><TextPage>';

        // 各テキストオブジェクトに対してTextChainを生成
        objects.forEach((obj, index) => {
            if (obj.type === 'text' && obj.chars) {
                xml += this._buildTextChain(obj, index);
            }
        });

        xml += '</TextPage><MergeGroups>';

        // 各オブジェクトに対してGroupを生成
        objects.forEach((obj, index) => {
            if (obj.type === 'text' && obj.chars) {
                const groupID = index + 1;
                const objectID = index + 1;
                const opacity = (obj.opacity || 100) / 100;
                xml += `<Group groupID="${groupID}"><punchThru>false</punchThru><opacity>${opacity}</opacity><ObjectID value="${objectID}" /></Group>`;
            }
        });

        xml += '</MergeGroups></Layer></Layers>';
        return xml;
    }

    /**
     * TextChain(テキスト内容)を構築
     * 参考PRTLファイルに合わせた複雑な構造を生成
     */
    _buildTextChain(obj, index) {
        const styleRef = this.styleCounter + index;
        const textDescRef = this.idCounter; // デフォルトフォント参照
        const text = obj.chars.map(c => c.char).join('');
        const textLength = text.length;

        // オブジェクトの位置とサイズ
        const x = obj.x || 0;
        const y = obj.y || 0;

        // テキストの幅を計算（文字数 × フォントサイズ × 係数）
        const fontSize = obj.chars[0]?.fontSize || 48;
        const estimatedWidth = textLength * fontSize * 0.8;
        const width = obj.width || estimatedWidth;
        const height = obj.height || fontSize * 1.5;

        let xml = '<TextChain>';

        // ChainProperty: テキストボックスのプロパティ
        xml += `<ChainProperty Version="9">`;
        xml += `<wordWrap>false</wordWrap>`;
        xml += `<Position><x>${x}</x><y>${y}</y></Position>`;
        xml += `<Size><x>${width}</x><y>${height}</y></Size>`;
        xml += `<leading>0</leading>`;
        xml += `<lockedLinesX>true</lockedLinesX>`;
        xml += `<lockedLinesY>true</lockedLinesY>`;
        xml += `<boxCanGrow>false</boxCanGrow>`;
        xml += `<tabModeStyle>Word</tabModeStyle>`;
        xml += `<implicitTabSpacing>100</implicitTabSpacing>`;
        xml += `<implicitTabType>left</implicitTabType>`;
        xml += `</ChainProperty>`;

        // ChainTabs: タブ設定（空）
        xml += `<ChainTabs><TabList></TabList></ChainTabs>`;

        // TextLine: テキストの内容とスタイル
        const objectID = index + 1;
        const persistentID = index + 3;
        xml += `<TextLine Version="2" objectID="${objectID}" persistentID="${persistentID}">`;

        // BaseProperties: テキストの基本プロパティ
        const txBase = fontSize * 1.2; // ベースライン高さ
        xml += `<BaseProperties Version="5">`;
        xml += `<txBase>${txBase}</txBase>`;
        xml += `<XPos>${x}</XPos>`;
        xml += `<angle>${obj.rotation || 0}</angle>`;
        xml += `<verticalText>false</verticalText>`;
        xml += `<objectLeading>0</objectLeading>`;
        xml += `</BaseProperties>`;

        // テキストタイプと配置
        xml += `<EnclosingObjectType>block</EnclosingObjectType>`;
        xml += `<Alignment>left</Alignment>`;
        xml += `<RTL>false</RTL>`;

        // TRString: 実際のテキスト内容
        xml += `<TRString>${this._escapeXML(text)}</TRString>`;

        // RunLengthEncodedCharacterAttributes: 文字毎のスタイル属性
        xml += `<RunLengthEncodedCharacterAttributes>`;
        xml += `<CharacterAttributes RunCount="${textLength}" StyleRef="${styleRef}" TextRef="${textDescRef}" TXKerning="0" TXPostKerning="0" BaselineShifting="0" />`;
        xml += `</RunLengthEncodedCharacterAttributes>`;

        xml += `<tagName></tagName>`;
        xml += `</TextLine>`;
        xml += '</TextChain>';

        return xml;
    }

    /**
     * ヘックスカラーをRGBに変換
     */
    _hexToRGB(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 255, g: 255, b: 255 };
    }

    /**
     * XML特殊文字をエスケープ
     */
    _escapeXML(str) {
        if (!str) return '';
        return str.toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    /**
     * UTF-16 LE エンコーディング（BOM付き）
     * PRTLファイルは UTF-16 LE (BOM付き) でエンコードする必要がある
     */
    _encodeUTF16LE(str) {
        // BOM: 0xFF 0xFE
        const bom = new Uint8Array([0xFF, 0xFE]);

        // 文字列をUTF-16 LEにエンコード
        const utf16Array = new Uint16Array(str.length);
        for (let i = 0; i < str.length; i++) {
            utf16Array[i] = str.charCodeAt(i);
        }

        // BOMとUTF-16データを結合
        const utf16Bytes = new Uint8Array(utf16Array.buffer);
        const result = new Uint8Array(bom.length + utf16Bytes.length);
        result.set(bom, 0);
        result.set(utf16Bytes, bom.length);

        return result;
    }

    /**
     * ブラウザでのダウンロード用: PRTLファイルをダウンロード
     */
    downloadPRTL(xml, filename = 'telop.prtl') {
        // UTF-16 LE（BOM付き）でエンコード
        const utf16Array = this._encodeUTF16LE(xml);
        const blob = new Blob([utf16Array], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// グローバルに公開
if (typeof window !== 'undefined') {
    window.PRTLGenerator = PRTLGenerator;
}
