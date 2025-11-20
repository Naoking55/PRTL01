/**
 * Telop Editor - Batch Processing
 * バッチ処理機能
 */

const BatchProcessor = {
    /**
     * CSVファイルをパース
     * @param {string} csvText - CSV文字列
     * @returns {Array} パースされたデータ
     */
    parseCSV(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim());
        if (lines.length === 0) return [];

        const headers = lines[0].split(',').map(h => h.trim());
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            data.push(row);
        }

        return { headers, data };
    },

    /**
     * CSVからテロップを一括生成
     * @param {Array} data - CSVデータ
     * @param {Object} template - テンプレートオブジェクト
     * @param {Object} options - オプション
     */
    generateTelopsFromCSV(data, template, options = {}) {
        const {
            textColumn = 'text',
            nameColumn = 'name',
            xOffset = 0,
            yOffset = 100,
            autoPosition = true
        } = options;

        const generatedObjects = [];
        let currentY = template.y || 540;

        data.forEach((row, index) => {
            const text = row[textColumn] || `テキスト${index + 1}`;
            const name = row[nameColumn] || `テロップ${index + 1}`;

            // テンプレートをクローン
            const newObj = JSON.parse(JSON.stringify(template));
            newObj.id = Date.now() + index;
            newObj.name = name;

            // テキストを置換
            if (newObj.chars) {
                newObj.chars = this.stringToChars(text, newObj.chars[0] || {});
            }

            // 位置を調整
            if (autoPosition) {
                newObj.x = (template.x || 960) + xOffset;
                newObj.y = currentY + yOffset * index;
            } else {
                // カラム指定で位置を取得
                if (row.x) newObj.x = parseFloat(row.x);
                if (row.y) newObj.y = parseFloat(row.y);
            }

            // 追加プロパティの適用
            if (row.opacity) newObj.opacity = parseFloat(row.opacity);
            if (row.rotation) newObj.rotation = parseFloat(row.rotation);
            if (row.fontSize && newObj.chars) {
                const size = parseFloat(row.fontSize);
                newObj.chars.forEach(c => c.fontSize = size);
            }
            if (row.color && newObj.chars) {
                newObj.chars.forEach(c => c.color = row.color);
            }

            generatedObjects.push(newObj);
        });

        return generatedObjects;
    },

    /**
     * 文字列をchars配列に変換
     * @param {string} text - テキスト
     * @param {Object} baseStyle - ベーススタイル
     */
    stringToChars(text, baseStyle = {}) {
        return text.split('').map(char => ({
            ...baseStyle,
            char: char
        }));
    },

    /**
     * 字幕ファイル（SRT）をパース
     * @param {string} srtText - SRT文字列
     */
    parseSRT(srtText) {
        const blocks = srtText.trim().split('\n\n');
        const subtitles = [];

        blocks.forEach(block => {
            const lines = block.split('\n');
            if (lines.length < 3) return;

            const index = parseInt(lines[0]);
            const timeMatch = lines[1].match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);

            if (timeMatch) {
                const text = lines.slice(2).join('\n');
                subtitles.push({
                    index,
                    start: this.srtTimeToSeconds(timeMatch[1]),
                    end: this.srtTimeToSeconds(timeMatch[2]),
                    text: text
                });
            }
        });

        return subtitles;
    },

    /**
     * Premiere Pro XML字幕形式をパース
     * @param {string} xmlText - XML文字列
     */
    parsePremiereXML(xmlText) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

        // エラーチェック
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
            throw new Error('XMLパースエラー: ' + parserError.textContent);
        }

        const subtitles = [];

        // Premiere Pro形式: <captions><caption>タグ
        let captions = xmlDoc.querySelectorAll('caption');

        // 別形式も試す: <subtitle>タグ
        if (captions.length === 0) {
            captions = xmlDoc.querySelectorAll('subtitle');
        }

        captions.forEach((caption, index) => {
            const start = caption.getAttribute('start') || caption.getAttribute('in');
            const end = caption.getAttribute('end') || caption.getAttribute('out');
            const textElement = caption.querySelector('text') || caption;
            const text = textElement.textContent.trim();

            if (start && end && text) {
                subtitles.push({
                    index: index + 1,
                    start: this.premiereTimeToSeconds(start),
                    end: this.premiereTimeToSeconds(end),
                    text: text
                });
            }
        });

        return subtitles;
    },

    /**
     * Premiere Pro時間文字列を秒数に変換
     * @param {string} timeStr - 時間文字列 (複数形式対応)
     * 対応形式: HH:MM:SS:FF, HH:MM:SS.mmm, フレーム数
     */
    premiereTimeToSeconds(timeStr) {
        // フレーム数のみの場合（整数）
        if (/^\d+$/.test(timeStr)) {
            const frameRate = 30; // デフォルト30fps
            return parseInt(timeStr) / frameRate;
        }

        // HH:MM:SS.mmm形式
        if (timeStr.includes('.')) {
            const [time, ms] = timeStr.split('.');
            const parts = time.split(':');
            if (parts.length === 3) {
                const [hours, minutes, seconds] = parts.map(Number);
                return hours * 3600 + minutes * 60 + seconds + (parseInt(ms) / 1000);
            }
        }

        // HH:MM:SS:FF形式（最後はフレーム）
        if (timeStr.split(':').length === 4) {
            const [hours, minutes, seconds, frames] = timeStr.split(':').map(Number);
            const frameRate = 30; // デフォルト30fps
            return hours * 3600 + minutes * 60 + seconds + (frames / frameRate);
        }

        // HH:MM:SS形式
        const parts = timeStr.split(':');
        if (parts.length === 3) {
            const [hours, minutes, seconds] = parts.map(Number);
            return hours * 3600 + minutes * 60 + seconds;
        }

        return 0;
    },

    /**
     * SRT時間文字列を秒数に変換
     * @param {string} timeStr - 時間文字列 (HH:MM:SS,mmm)
     */
    srtTimeToSeconds(timeStr) {
        const [time, ms] = timeStr.split(',');
        const [hours, minutes, seconds] = time.split(':').map(Number);
        return hours * 3600 + minutes * 60 + seconds + ms / 1000;
    },

    /**
     * 字幕からテロップを生成
     * @param {Array} subtitles - 字幕データ
     * @param {Object} template - テンプレート
     */
    generateTelopsFromSubtitles(subtitles, template) {
        const generatedObjects = [];

        subtitles.forEach((subtitle, index) => {
            const newObj = JSON.parse(JSON.stringify(template));
            newObj.id = Date.now() + index;
            newObj.name = `字幕 ${subtitle.index}`;

            // テキストを設定
            if (newObj.chars) {
                newObj.chars = this.stringToChars(subtitle.text, newObj.chars[0] || {});
            }

            // アニメーション設定
            if (!newObj.animation) {
                newObj.animation = { keyframes: [] };
            }

            // フェードイン・フェードアウト
            newObj.animation.keyframes = [
                { time: subtitle.start, property: 'opacity', value: 0 },
                { time: subtitle.start + 0.3, property: 'opacity', value: 100 },
                { time: subtitle.end - 0.3, property: 'opacity', value: 100 },
                { time: subtitle.end, property: 'opacity', value: 0 }
            ];

            generatedObjects.push(newObj);
        });

        return generatedObjects;
    },

    /**
     * テンプレート変数を置換
     * @param {Object} template - テンプレート
     * @param {Object} variables - 変数マップ
     */
    applyTemplateVariables(template, variables) {
        const result = JSON.parse(JSON.stringify(template));

        // テキスト内の変数を置換 {{variable}}
        if (result.chars) {
            let text = result.chars.map(c => c.char).join('');
            Object.keys(variables).forEach(key => {
                const regex = new RegExp(`{{${key}}}`, 'g');
                text = text.replace(regex, variables[key]);
            });
            result.chars = this.stringToChars(text, result.chars[0] || {});
        }

        return result;
    },

    /**
     * 音声ファイルから文字起こし（Web Speech API）
     * @param {File} audioFile - 音声ファイル
     * @param {Object} options - オプション
     * @returns {Promise<Array>} 文字起こし結果
     */
    async transcribeAudioFile(audioFile, options = {}) {
        const {
            language = 'ja-JP',
            continuous = true,
            interimResults = false,
            maxAlternatives = 1
        } = options;

        // Web Speech API対応チェック
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            throw new Error('このブラウザはWeb Speech APIに対応していません');
        }

        return new Promise((resolve, reject) => {
            const recognition = new SpeechRecognition();
            recognition.lang = language;
            recognition.continuous = continuous;
            recognition.interimResults = interimResults;
            recognition.maxAlternatives = maxAlternatives;

            const results = [];
            let startTime = 0;

            // 音声ファイルを再生用のAudioオブジェクトとして読み込み
            const audioUrl = URL.createObjectURL(audioFile);
            const audio = new Audio(audioUrl);

            recognition.onstart = () => {
                startTime = Date.now();
                audio.play();
            };

            recognition.onresult = (event) => {
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const result = event.results[i];
                    if (result.isFinal) {
                        const transcript = result[0].transcript;
                        const timestamp = (Date.now() - startTime) / 1000;
                        results.push({
                            text: transcript,
                            timestamp: timestamp,
                            confidence: result[0].confidence
                        });
                    }
                }
            };

            recognition.onerror = (event) => {
                audio.pause();
                URL.revokeObjectURL(audioUrl);
                reject(new Error('文字起こしエラー: ' + event.error));
            };

            recognition.onend = () => {
                audio.pause();
                URL.revokeObjectURL(audioUrl);
                resolve(results);
            };

            audio.onended = () => {
                recognition.stop();
            };

            recognition.start();
        });
    },

    /**
     * 外部API（Whisper等）で文字起こし
     * @param {File} audioFile - 音声ファイル
     * @param {Object} options - オプション
     * @returns {Promise<Array>} 文字起こし結果
     */
    async transcribeWithExternalAPI(audioFile, options = {}) {
        const {
            apiEndpoint = '',
            apiKey = '',
            language = 'ja',
            model = 'whisper-1',
            responseFormat = 'json'
        } = options;

        if (!apiEndpoint) {
            throw new Error('APIエンドポイントが指定されていません');
        }

        const formData = new FormData();
        formData.append('file', audioFile);
        formData.append('model', model);
        formData.append('language', language);
        formData.append('response_format', responseFormat);

        const headers = {};
        if (apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`;
        }

        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: headers,
                body: formData
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Whisper API形式のレスポンスを処理
            if (data.segments) {
                return data.segments.map(segment => ({
                    text: segment.text,
                    start: segment.start,
                    end: segment.end,
                    confidence: segment.avg_logprob ? Math.exp(segment.avg_logprob) : 1.0
                }));
            }

            // 汎用形式
            if (data.transcription) {
                return [{
                    text: data.transcription,
                    start: 0,
                    end: 0,
                    confidence: data.confidence || 1.0
                }];
            }

            return data;
        } catch (error) {
            throw new Error(`文字起こしAPI呼び出しエラー: ${error.message}`);
        }
    },

    /**
     * 文字起こし結果からテロップを生成
     * @param {Array} transcriptionResults - 文字起こし結果
     * @param {Object} template - テンプレート
     * @param {Object} options - オプション
     */
    generateTelopsFromTranscription(transcriptionResults, template, options = {}) {
        const {
            minDuration = 1.0,
            maxDuration = 5.0,
            fadeInDuration = 0.3,
            fadeOutDuration = 0.3
        } = options;

        const generatedObjects = [];

        transcriptionResults.forEach((result, index) => {
            const newObj = JSON.parse(JSON.stringify(template));
            newObj.id = Date.now() + index;
            newObj.name = `文字起こし ${index + 1}`;

            // テキストを設定
            if (newObj.chars) {
                newObj.chars = this.stringToChars(result.text, newObj.chars[0] || {});
            }

            // タイムスタンプがある場合
            let startTime = result.start || result.timestamp || 0;
            let endTime = result.end || (startTime + minDuration);

            // 継続時間の制限
            const duration = endTime - startTime;
            if (duration > maxDuration) {
                endTime = startTime + maxDuration;
            } else if (duration < minDuration) {
                endTime = startTime + minDuration;
            }

            // アニメーション設定（フェードイン・アウト）
            if (!newObj.animation) {
                newObj.animation = { keyframes: [] };
            }

            newObj.animation.keyframes = [
                { time: startTime, property: 'opacity', value: 0, easing: 'linear' },
                { time: startTime + fadeInDuration, property: 'opacity', value: 100, easing: 'easeOutQuad' },
                { time: endTime - fadeOutDuration, property: 'opacity', value: 100, easing: 'linear' },
                { time: endTime, property: 'opacity', value: 0, easing: 'easeInQuad' }
            ];

            // 信頼度をメタデータとして保存
            if (result.confidence !== undefined) {
                newObj.metadata = newObj.metadata || {};
                newObj.metadata.transcriptionConfidence = result.confidence;
            }

            generatedObjects.push(newObj);
        });

        return generatedObjects;
    },

    /**
     * 複数テロップを一括書き出し
     * @param {Array} objects - オブジェクト配列
     * @param {Object} options - オプション
     */
    async batchExport(objects, options = {}) {
        const {
            format = 'png',
            quality = 0.95,
            width = 1920,
            height = 1080,
            prefix = 'telop'
        } = options;

        const results = [];

        for (let i = 0; i < objects.length; i++) {
            const obj = objects[i];
            try {
                // 仮のキャンバスに描画
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = width;
                tempCanvas.height = height;
                const ctx = tempCanvas.getContext('2d');

                // オブジェクトを描画（実際の描画関数を呼び出す必要あり）
                // ここではプレースホルダー
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, width, height);

                // 書き出し
                const dataUrl = tempCanvas.toDataURL(`image/${format}`, quality);
                const link = document.createElement('a');
                link.download = `${prefix}_${i + 1}_${obj.name || 'unnamed'}.${format}`;
                link.href = dataUrl;
                link.click();

                results.push({ success: true, index: i, name: obj.name });
            } catch (err) {
                results.push({ success: false, index: i, name: obj.name, error: err.message });
            }

            // 進捗通知
            if (options.onProgress) {
                options.onProgress(i + 1, objects.length);
            }
        }

        return results;
    },

    /**
     * JSONからバッチインポート
     * @param {File} file - JSONファイル
     */
    importBatchJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.type === 'telop_batch') {
                        resolve(data.objects);
                    } else {
                        reject(new Error('無効なバッチファイル形式です'));
                    }
                } catch (err) {
                    reject(err);
                }
            };
            reader.readAsText(file);
        });
    },

    /**
     * バッチデータをエクスポート
     * @param {Array} objects - オブジェクト配列
     */
    exportBatchJSON(objects) {
        const data = {
            type: 'telop_batch',
            version: '1.0',
            count: objects.length,
            objects: objects,
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.download = `batch_telops_${Date.now()}.json`;
        link.href = URL.createObjectURL(blob);
        link.click();
        return { success: true, count: objects.length };
    }
};
