/**
 * PRTL (Premiere Pro Legacy Title) Generator
 * PRTLファイルを生成するためのクラス
 */
class PRTLGenerator {
  constructor(templateXML) {
    this.parser = new DOMParser();
    this.xmlDoc = this.parser.parseFromString(templateXML, 'text/xml');

    // パースエラーチェック
    const parserError = this.xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error('XML Parse Error: ' + parserError.textContent);
    }
  }

  /**
   * テキスト内容を設定
   * @param {number} index - TextLineのインデックス
   * @param {string} text - 設定するテキスト
   */
  setText(index, text) {
    const textLine = this.xmlDoc.querySelector(`TextLine[Index="${index}"]`);
    if (!textLine) {
      throw new Error(`TextLine with index ${index} not found`);
    }

    // テキストを更新
    const textElement = textLine.querySelector('Text');
    if (textElement) {
      textElement.textContent = text;
    }

    // RunCountを更新 (文字数 + 1)
    const runCount = text.length + 1;
    const runCountElement = textLine.querySelector('RunCount');
    if (runCountElement) {
      runCountElement.textContent = runCount;
    }

    // TextStyle内のRunCountも更新
    const textStyleRunCount = textLine.querySelector('TextStyle RunCount');
    if (textStyleRunCount) {
      textStyleRunCount.textContent = runCount;
    }

    return this;
  }

  /**
   * テキストの位置を設定
   * @param {number} drawIndex - DrawObjectのインデックス
   * @param {number} x - 横位置
   * @param {number} y - 縦位置
   */
  setPosition(drawIndex, x, y) {
    const drawObject = this.xmlDoc.querySelector(`DrawObject[Index="${drawIndex}"]`);
    if (!drawObject) {
      throw new Error(`DrawObject with index ${drawIndex} not found`);
    }

    const position = drawObject.querySelector('DrawObjectPosition');
    if (position) {
      const hPos = position.querySelector('HorizontalPos');
      const vPos = position.querySelector('VerticalPos');
      if (hPos) hPos.textContent = x;
      if (vPos) vPos.textContent = y;
    }

    return this;
  }

  /**
   * フォントを設定
   * @param {number} textLineIndex - TextLineのインデックス
   * @param {string} fontName - フォント名
   * @param {number} fontSize - フォントサイズ
   * @param {string} fontFace - フォントフェイス (Regular, Bold, Italic等)
   */
  setFont(textLineIndex, fontName, fontSize, fontFace = 'Regular') {
    const textLine = this.xmlDoc.querySelector(`TextLine[Index="${textLineIndex}"]`);
    if (!textLine) {
      throw new Error(`TextLine with index ${textLineIndex} not found`);
    }

    const textStyle = textLine.querySelector('TextStyle');
    if (textStyle) {
      const fontNameElem = textStyle.querySelector('FontName');
      const fontSizeElem = textStyle.querySelector('FontSize');
      const fontFaceElem = textStyle.querySelector('FontFace');

      if (fontNameElem) fontNameElem.textContent = fontName;
      if (fontSizeElem) fontSizeElem.textContent = fontSize;
      if (fontFaceElem) fontFaceElem.textContent = fontFace;
    }

    return this;
  }

  /**
   * テキストの色を設定
   * @param {number} textLineIndex - TextLineのインデックス
   * @param {number} r - 赤 (0-255)
   * @param {number} g - 緑 (0-255)
   * @param {number} b - 青 (0-255)
   */
  setTextColor(textLineIndex, r, g, b) {
    const textLine = this.xmlDoc.querySelector(`TextLine[Index="${textLineIndex}"]`);
    if (!textLine) {
      throw new Error(`TextLine with index ${textLineIndex} not found`);
    }

    // TextStyleのFontColorを更新
    const fontColor = textLine.querySelector('TextStyle FontColor');
    if (fontColor) {
      fontColor.textContent = `${r} ${g} ${b}`;
    }

    // PainterStyleIDを取得
    const painterStyleID = textLine.querySelector('TextStyle PainterStyleID');
    if (painterStyleID) {
      const styleId = painterStyleID.textContent;
      this.setPainterColor(styleId, r, g, b);
    }

    return this;
  }

  /**
   * PainterStyleの色を設定
   * @param {string} styleId - PainterStyleのID
   * @param {number} r - 赤 (0-255)
   * @param {number} g - 緑 (0-255)
   * @param {number} b - 青 (0-255)
   */
  setPainterColor(styleId, r, g, b) {
    const painterStyle = this.xmlDoc.querySelector(`PainterStyle[ID="${styleId}"]`);
    if (painterStyle) {
      const solidColor = painterStyle.querySelector('SolidColorColor');
      if (solidColor) {
        solidColor.textContent = `${r} ${g} ${b}`;
      }
    }
    return this;
  }

  /**
   * 解像度を設定
   * @param {number} width - 幅
   * @param {number} height - 高さ
   * @param {number} pixelAspectRatio - ピクセルアスペクト比
   * @param {string} fieldType - フィールドタイプ (progressiveScan, upperField等)
   */
  setResolution(width, height, pixelAspectRatio = 1, fieldType = 'progressiveScan') {
    const titleSpecs = this.xmlDoc.querySelector('TitleSpecifics');
    if (titleSpecs) {
      const widthElem = titleSpecs.querySelector('Width');
      const heightElem = titleSpecs.querySelector('Height');
      const parElem = titleSpecs.querySelector('PixelAspectRatio');
      const fieldElem = titleSpecs.querySelector('FieldType');

      if (widthElem) widthElem.textContent = width;
      if (heightElem) heightElem.textContent = height;
      if (parElem) parElem.textContent = pixelAspectRatio;
      if (fieldElem) fieldElem.textContent = fieldType;
    }
    return this;
  }

  /**
   * 水平方向の配置を設定
   * @param {number} textLineIndex - TextLineのインデックス
   * @param {string} alignment - 配置 (left, center, right)
   */
  setHorizontalAlignment(textLineIndex, alignment) {
    const textLine = this.xmlDoc.querySelector(`TextLine[Index="${textLineIndex}"]`);
    if (!textLine) {
      throw new Error(`TextLine with index ${textLineIndex} not found`);
    }

    const alignmentElem = textLine.querySelector('HorizontalAlignmentAttribute');
    if (alignmentElem) {
      alignmentElem.textContent = alignment;
    }

    return this;
  }

  /**
   * 垂直方向の配置を設定
   * @param {number} textLineIndex - TextLineのインデックス
   * @param {string} alignment - 配置 (top, center, bottom)
   */
  setVerticalAlignment(textLineIndex, alignment) {
    const textLine = this.xmlDoc.querySelector(`TextLine[Index="${textLineIndex}"]`);
    if (!textLine) {
      throw new Error(`TextLine with index ${textLineIndex} not found`);
    }

    const alignmentElem = textLine.querySelector('VerticalAlignmentAttribute');
    if (alignmentElem) {
      alignmentElem.textContent = alignment;
    }

    return this;
  }

  /**
   * XML文字列を取得
   * @returns {string} XML文字列
   */
  toXMLString() {
    const serializer = new XMLSerializer();
    let xmlString = serializer.serializeToString(this.xmlDoc);

    // XMLヘッダーを確実にUTF-16指定にする
    if (!xmlString.startsWith('<?xml')) {
      xmlString = '<?xml version="1.0" encoding="UTF-16"?>\n' + xmlString;
    } else {
      xmlString = xmlString.replace(/encoding="[^"]*"/, 'encoding="UTF-16"');
    }

    return xmlString;
  }

  /**
   * PRTLファイルとしてダウンロード
   * @param {string} filename - ファイル名
   */
  download(filename = 'output.prtl') {
    const xmlString = this.toXMLString();

    // UTF-16 LE BOM付きでBlobを作成
    const BOM = new Uint8Array([0xFF, 0xFE]); // UTF-16 LE BOM
    const encoder = new TextEncoder();

    // UTF-16 LEエンコーディング
    const utf16leArray = this.stringToUTF16LE(xmlString);

    // BOMと本文を結合
    const combinedArray = new Uint8Array(BOM.length + utf16leArray.length);
    combinedArray.set(BOM, 0);
    combinedArray.set(utf16leArray, BOM.length);

    const blob = new Blob([combinedArray], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * 文字列をUTF-16 LEバイト配列に変換
   * @param {string} str - 変換する文字列
   * @returns {Uint8Array} UTF-16 LEバイト配列
   */
  stringToUTF16LE(str) {
    const buf = new ArrayBuffer(str.length * 2);
    const bufView = new Uint16Array(buf);
    for (let i = 0; i < str.length; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return new Uint8Array(buf);
  }
}

// エクスポート（ブラウザとNode.js両対応）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PRTLGenerator;
}
