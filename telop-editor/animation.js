/**
 * Telop Editor - Animation System
 * アニメーション機能強化
 */

const AnimationSystem = {
    /**
     * イージング関数
     */
    easings: {
        linear: t => t,
        easeInQuad: t => t * t,
        easeOutQuad: t => t * (2 - t),
        easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        easeInCubic: t => t * t * t,
        easeOutCubic: t => (--t) * t * t + 1,
        easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
        easeInQuart: t => t * t * t * t,
        easeOutQuart: t => 1 - (--t) * t * t * t,
        easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
        easeInExpo: t => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
        easeOutExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
        easeInOutExpo: t => {
            if (t === 0 || t === 1) return t;
            if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2;
            return (2 - Math.pow(2, -20 * t + 10)) / 2;
        },
        easeInBack: t => {
            const c1 = 1.70158;
            return (c1 + 1) * t * t * t - c1 * t * t;
        },
        easeOutBack: t => {
            const c1 = 1.70158;
            return 1 + (c1 + 1) * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
        },
        easeInOutBack: t => {
            const c1 = 1.70158;
            const c2 = c1 * 1.525;
            return t < 0.5
                ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
                : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
        },
        easeInElastic: t => {
            const c4 = (2 * Math.PI) / 3;
            return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
        },
        easeOutElastic: t => {
            const c4 = (2 * Math.PI) / 3;
            return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
        },
        easeInBounce: t => 1 - AnimationSystem.easings.easeOutBounce(1 - t),
        easeOutBounce: t => {
            const n1 = 7.5625;
            const d1 = 2.75;
            if (t < 1 / d1) return n1 * t * t;
            else if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
            else if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
            else return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    },

    /**
     * キーフレームを追加
     * @param {Object} obj - オブジェクト
     * @param {number} time - 時間（秒）
     * @param {string} property - プロパティ名
     * @param {*} value - 値
     * @param {string} easing - イージング
     */
    addKeyframe(obj, time, property, value, easing = 'linear') {
        if (!obj.animation) {
            obj.animation = { keyframes: [] };
        }

        // 既存のキーフレームをチェック
        const existingIndex = obj.animation.keyframes.findIndex(
            kf => kf.time === time && kf.property === property
        );

        const keyframe = { time, property, value, easing };

        if (existingIndex >= 0) {
            obj.animation.keyframes[existingIndex] = keyframe;
        } else {
            obj.animation.keyframes.push(keyframe);
            obj.animation.keyframes.sort((a, b) => a.time - b.time);
        }
    },

    /**
     * キーフレームを削除
     * @param {Object} obj - オブジェクト
     * @param {number} time - 時間
     * @param {string} property - プロパティ名
     */
    removeKeyframe(obj, time, property) {
        if (!obj.animation) return;
        obj.animation.keyframes = obj.animation.keyframes.filter(
            kf => !(kf.time === time && kf.property === property)
        );
    },

    /**
     * 指定時間のプロパティ値を計算
     * @param {Object} obj - オブジェクト
     * @param {number} currentTime - 現在時間
     * @param {string} property - プロパティ名
     * @param {*} defaultValue - デフォルト値
     */
    getAnimatedValue(obj, currentTime, property, defaultValue) {
        if (!obj.animation || !obj.animation.keyframes) {
            return defaultValue;
        }

        const keyframes = obj.animation.keyframes.filter(kf => kf.property === property);
        if (keyframes.length === 0) return defaultValue;

        // currentTime以前の最後のキーフレームと、以降の最初のキーフレームを取得
        let prevKf = null;
        let nextKf = null;

        for (let i = 0; i < keyframes.length; i++) {
            if (keyframes[i].time <= currentTime) {
                prevKf = keyframes[i];
            }
            if (keyframes[i].time > currentTime && !nextKf) {
                nextKf = keyframes[i];
                break;
            }
        }

        // キーフレーム間の補間
        if (prevKf && nextKf) {
            const duration = nextKf.time - prevKf.time;
            const elapsed = currentTime - prevKf.time;
            const t = elapsed / duration;

            // イージング適用
            const easingFunc = this.easings[prevKf.easing || 'linear'] || this.easings.linear;
            const easedT = easingFunc(t);

            // 値の補間
            if (typeof prevKf.value === 'number' && typeof nextKf.value === 'number') {
                return prevKf.value + (nextKf.value - prevKf.value) * easedT;
            } else if (typeof prevKf.value === 'string' && prevKf.value.startsWith('#')) {
                // カラー補間
                return this.interpolateColor(prevKf.value, nextKf.value, easedT);
            }
            return prevKf.value; // その他の型はそのまま
        } else if (prevKf) {
            return prevKf.value;
        } else if (nextKf) {
            return nextKf.value;
        }

        return defaultValue;
    },

    /**
     * カラー補間
     * @param {string} color1 - 開始色 (#RRGGBB)
     * @param {string} color2 - 終了色 (#RRGGBB)
     * @param {number} t - 補間値 (0-1)
     */
    interpolateColor(color1, color2, t) {
        const r1 = parseInt(color1.slice(1, 3), 16);
        const g1 = parseInt(color1.slice(3, 5), 16);
        const b1 = parseInt(color1.slice(5, 7), 16);

        const r2 = parseInt(color2.slice(1, 3), 16);
        const g2 = parseInt(color2.slice(3, 5), 16);
        const b2 = parseInt(color2.slice(5, 7), 16);

        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);

        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    },

    /**
     * アニメーションプリセット
     */
    presets: {
        fadeIn: (obj, duration = 1) => {
            AnimationSystem.addKeyframe(obj, 0, 'opacity', 0, 'linear');
            AnimationSystem.addKeyframe(obj, duration, 'opacity', 100, 'easeOutQuad');
        },
        fadeOut: (obj, startTime, duration = 1) => {
            AnimationSystem.addKeyframe(obj, startTime, 'opacity', 100, 'linear');
            AnimationSystem.addKeyframe(obj, startTime + duration, 'opacity', 0, 'easeInQuad');
        },
        slideInLeft: (obj, startX = -100, duration = 1) => {
            const endX = obj.x;
            AnimationSystem.addKeyframe(obj, 0, 'x', startX, 'linear');
            AnimationSystem.addKeyframe(obj, duration, 'x', endX, 'easeOutCubic');
            AnimationSystem.addKeyframe(obj, 0, 'opacity', 0, 'linear');
            AnimationSystem.addKeyframe(obj, duration, 'opacity', 100, 'linear');
        },
        slideInRight: (obj, startX = 2020, duration = 1) => {
            const endX = obj.x;
            AnimationSystem.addKeyframe(obj, 0, 'x', startX, 'linear');
            AnimationSystem.addKeyframe(obj, duration, 'x', endX, 'easeOutCubic');
            AnimationSystem.addKeyframe(obj, 0, 'opacity', 0, 'linear');
            AnimationSystem.addKeyframe(obj, duration, 'opacity', 100, 'linear');
        },
        slideInTop: (obj, startY = -100, duration = 1) => {
            const endY = obj.y;
            AnimationSystem.addKeyframe(obj, 0, 'y', startY, 'linear');
            AnimationSystem.addKeyframe(obj, duration, 'y', endY, 'easeOutCubic');
            AnimationSystem.addKeyframe(obj, 0, 'opacity', 0, 'linear');
            AnimationSystem.addKeyframe(obj, duration, 'opacity', 100, 'linear');
        },
        slideInBottom: (obj, startY = 1180, duration = 1) => {
            const endY = obj.y;
            AnimationSystem.addKeyframe(obj, 0, 'y', startY, 'linear');
            AnimationSystem.addKeyframe(obj, duration, 'y', endY, 'easeOutCubic');
            AnimationSystem.addKeyframe(obj, 0, 'opacity', 0, 'linear');
            AnimationSystem.addKeyframe(obj, duration, 'opacity', 100, 'linear');
        },
        zoomIn: (obj, duration = 1) => {
            // スケール実装が必要
            AnimationSystem.addKeyframe(obj, 0, 'scale', 0, 'linear');
            AnimationSystem.addKeyframe(obj, duration, 'scale', 1, 'easeOutBack');
            AnimationSystem.addKeyframe(obj, 0, 'opacity', 0, 'linear');
            AnimationSystem.addKeyframe(obj, duration, 'opacity', 100, 'linear');
        },
        bounce: (obj, startTime, duration = 1) => {
            const baseY = obj.y;
            AnimationSystem.addKeyframe(obj, startTime, 'y', baseY, 'linear');
            AnimationSystem.addKeyframe(obj, startTime + duration, 'y', baseY, 'easeOutBounce');
        }
    },

    /**
     * キーフレームデータをJSONエクスポート
     * @param {Object} obj - オブジェクト
     */
    exportKeyframes(obj) {
        if (!obj.animation) return null;
        return JSON.stringify(obj.animation, null, 2);
    },

    /**
     * キーフレームデータをインポート
     * @param {Object} obj - オブジェクト
     * @param {string} jsonData - JSONデータ
     */
    importKeyframes(obj, jsonData) {
        try {
            const animation = JSON.parse(jsonData);
            obj.animation = animation;
            return { success: true };
        } catch (e) {
            return { success: false, error: e.message };
        }
    },

    /**
     * タイムライン同期用のデータを生成
     * Premiere Pro向けキーフレームデータ
     */
    generatePremiereKeyframes(obj) {
        if (!obj.animation || !obj.animation.keyframes) {
            return null;
        }

        const premiere = {
            name: obj.name || 'Telop',
            keyframes: {}
        };

        // プロパティごとにグループ化
        obj.animation.keyframes.forEach(kf => {
            if (!premiere.keyframes[kf.property]) {
                premiere.keyframes[kf.property] = [];
            }
            premiere.keyframes[kf.property].push({
                time: kf.time,
                value: kf.value,
                easing: kf.easing
            });
        });

        return premiere;
    }
};
