//
// loader_mhac.jsx
//


app.enableQE();

(function mhsc() {

	if (typeof $.mhsc == 'undefined') {

		function generateJsUUID() {
			var dt = new Date().getTime();
			var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
				var r = (dt + Math.random() * 16) % 16 | 0;
				dt = Math.floor(dt / 16);
				return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
			});
			return uuid;
		}

		$.mhsc = {
			sessionId: generateJsUUID()
		}
	}

})()

mhsc = $.mhsc

if (typeof console == 'undefined') {
	new ExternalObject("lib:PlugPlugExternalObject");

	console = {
		log: function() {
			var payload = [];
			for (var i = 0; i < arguments.length; i++) {
				payload.push(arguments[i]);
			}

			var eventObj = new CSXSEvent();
			eventObj.type = 'mhac.console.log';
			eventObj.data = JSON.stringify(payload);
			eventObj.dispatch();
		},

		info: function () {
			var output = [];
			for (var i = 0; i < arguments.length; i++) {
				if (typeof arguments[i] === 'object' && arguments[i] !== null) {
					output.push(JSON.stringify(arguments[i], '', '  '));
				} else {
					output.push(arguments[i].toString());
				}
			}

			app.setSDKEventMessage(output.join(' '), 'info');
		}
	};
}

(function mhac() {
	$.mhac = {
		extensionPath: '',
		tempPath: '',
		mhExtObj: null,
	};

	var self = $.mhac;
	var isWin = (File.fs == "Windows");

	self.setPaths = function(extensionPath, tempPath) {
		self.extensionPath = extensionPath.replace(/[\\\/]$/, '');
		self.tempPath = tempPath.replace(/[\\\/]$/, '');
	}

	self.include = function(filename) {
		var sep = self.extensionPath.match(/\\/) ? '\\' : '/';
		var includePath = self.extensionPath + sep + 'host' + sep;
		filename = filename.replace(/[\\\/]/g, sep);

		try {
			$.evalFile(includePath + filename);
		} catch (e) {
			throw new Error('Error including script ' + includePath + filename + '\nPlease restart Premiere');
		}
	}

	self.initMHExtObj = function() {
		self.mhExtObj = new ExternalObject('lib:' + getMHLibPath());
	}

	self.checkDependencies = function() {
		return parseAndCheckErrors(self.mhExtObj.checkDependencies());
	}

	self.executeCommand = function(command) {
		checkMHLib();
		return parseAndCheckErrors(self.mhExtObj.doCommand(command));
	}

	self.getUserData = function() {
		checkMHLib();
		return parseAndCheckErrors(self.mhExtObj.getUserData());
	}

	self.refreshUserData = function() {
		checkMHLib();
		return parseAndCheckErrors(self.mhExtObj.fetchUserData());
	}

	self.openManagerApp = function(action) {
		checkMHLib();
		return parseAndCheckErrors(self.mhExtObj.openProductManagerApp());
	}

	self.getFontList = function() {
		checkMHLib();
		return parseAndCheckErrors(self.mhExtObj.enumerateFonts());
	}

	self.getAeGraphicParams = function(path) {
		checkMHLib();
		return parseAndCheckErrors(self.mhExtObj.getAeGraphicParams(path));
	}

	self.getMogrtInfo = function(path) {
		checkMHLib();
		return parseAndCheckErrors(self.mhExtObj.getMogrtInfo(path));
	}

	self.pickColor = function() {
		checkMHLib();
		return parseAndCheckErrors(self.mhExtObj.pickColor()) || '';
	}

	self.duplicateMogrtWithSize = function(srcPath, dstPath, width, height, duration) {
		checkMHLib();
		if (!duration) duration = 0;
		return parseAndCheckErrors(self.mhExtObj.duplicateMogrtWithSize(srcPath, dstPath, width, height, duration));
	}

	self.openDirDialog = function() {
		if (isWin) {
			checkMHLib();
			return parseAndCheckErrors(self.mhExtObj.browseForDir());
		} else {
			var selection = Folder.selectDialog();
			return selection ? selection.fsName : '';
		}
	}

	self.logout = function(action) {
		checkMHLib();
		return parseAndCheckErrors(self.mhExtObj.logout());
	}

	checkMHLib = function() {
		if (!self.mhExtObj) throw new Error('PLUGIN:' + 'Mister Horse helper library not initialized')
	}

	getMHLibPath = function() {
		if (isWin) {
			return self.extensionPath + '\\support_files\\MHPC_ExternalObject.dll';
		} else {
			return self.extensionPath + '/support_files/MHPC_ExternalObjectBundle.bundle';
		}
	}

	self.getNativeHelperPath = function () {
		if (isWin) {
			return self.extensionPath + '\\support_files\\MHPC_NativeHelper.exe';
		} else {
			return self.extensionPath + '/support_files/MHPC_NativeHelper.app/Contents/MacOS/MHPC_NativeHelper';
		}
	}

	parseAndCheckErrors = function(apiJSON) {
		var ret = JSON.parse(apiJSON);
		if (ret.error) throw new Error('PLUGIN:' + ret.error.message + '|DETAILS|' + apiJSON);
		
		if (typeof ret.result == 'object') {
			return JSON.stringify(ret.result);
		} else {
			return ret.result;
		}
	}

	self.loadIncludes = function() {

	}
})();

mhac = $.mhac

//
// json2.jsx
//


if (typeof JSON !== "object") {
    JSON = {};
}

(function () {
    "use strict";

    var rx_one = /^[\],:{}\s]*$/;
    var rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
    var rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
    var rx_four = /(?:^|:|,)(?:\s*\[)+/g;
    var rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    var rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

    function f(n) {

        return (n < 10)
            ? "0" + n
            : n;
    }

    function this_value() {
        return this.valueOf();
    }

    if (typeof Date.prototype.toJSON !== "function") {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf())
                ? (
                    this.getUTCFullYear()
                    + "-"
                    + f(this.getUTCMonth() + 1)
                    + "-"
                    + f(this.getUTCDate())
                    + "T"
                    + f(this.getUTCHours())
                    + ":"
                    + f(this.getUTCMinutes())
                    + ":"
                    + f(this.getUTCSeconds())
                    + "Z"
                )
                : null;
        };

        Boolean.prototype.toJSON = this_value;
        Number.prototype.toJSON = this_value;
        String.prototype.toJSON = this_value;
    }

    var gap;
    var indent;
    var meta;
    var rep;

    function quote(string) {

        rx_escapable.lastIndex = 0;
        return rx_escapable.test(string)
            ? "\"" + string.replace(rx_escapable, function (a) {
                var c = meta[a];
                return typeof c === "string"
                    ? c
                    : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
            }) + "\""
            : "\"" + string + "\"";
    }

    function str(key, holder) {

        var i;
        var k;
        var v;
        var length;
        var mind = gap;
        var partial;
        var value = holder[key];

        if (
            value
            && typeof value === "object"
            && typeof value.toJSON === "function"
        ) {
            value = value.toJSON(key);
        }

        if (typeof rep === "function") {
            value = rep.call(holder, key, value);
        }

        switch (typeof value) {
        case "string":
            return quote(value);

        case "number":

            return (isFinite(value))
                ? String(value)
                : "null";

        case "boolean":
        case "null":

            return String(value);

        case "object":

            if (!value) {
                return "null";
            }

            gap += indent;
            partial = [];

            if (Object.prototype.toString.apply(value) === "[object Array]") {

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || "null";
                }

                v = partial.length === 0
                    ? "[]"
                    : gap
                        ? (
                            "[\n"
                            + gap
                            + partial.join(",\n" + gap)
                            + "\n"
                            + mind
                            + "]"
                        )
                        : "[" + partial.join(",") + "]";
                gap = mind;
                return v;
            }

            if (rep && typeof rep === "object") {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === "string") {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                (gap)
                                    ? ": "
                                    : ":"
                            ) + v);
                        }
                    }
                }
            } else {

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                (gap)
                                    ? ": "
                                    : ":"
                            ) + v);
                        }
                    }
                }
            }

            v = partial.length === 0
                ? "{}"
                : gap
                    ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}"
                    : "{" + partial.join(",") + "}";
            gap = mind;
            return v;
        }
    }

    if (typeof JSON.stringify !== "function") {
        meta = {
            "\b": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            "\"": "\\\"",
            "\\": "\\\\"
        };
        JSON.stringify = function (value, replacer, space) {

            var i;
            gap = "";
            indent = "";

            if (typeof space === "number") {
                for (i = 0; i < space; i += 1) {
                    indent += " ";
                }

            } else if (typeof space === "string") {
                indent = space;
            }

            rep = replacer;
            if (replacer && typeof replacer !== "function" && (
                typeof replacer !== "object"
                || typeof replacer.length !== "number"
            )) {
                throw new Error("JSON.stringify");
            }

            return str("", {"": value});
        };
    }

    if (typeof JSON.parse !== "function") {
        JSON.parse = function (text, reviver) {

            var j;

            function walk(holder, key) {

                var k;
                var v;
                var value = holder[key];
                if (value && typeof value === "object") {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }

            text = String(text);
            rx_dangerous.lastIndex = 0;
            if (rx_dangerous.test(text)) {
                text = text.replace(rx_dangerous, function (a) {
                    return (
                        "\\u"
                        + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
                    );
                });
            }

            if (
                rx_one.test(
                    text
                        .replace(rx_two, "@")
                        .replace(rx_three, "]")
                        .replace(rx_four, "")
                )
            ) {

                j = eval("(" + text + ")");

                return (typeof reviver === "function")
                    ? walk({"": j}, "")
                    : j;
            }

            throw new SyntaxError("JSON.parse");
        };
    }
}());

//
// base64.jsx
//

(function base64() {
	$.base64 = {
	};

	var self = $.base64;

  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  function InvalidCharacterError(message) {
    this.message = message;
  }
  InvalidCharacterError.prototype = new Error ();
  InvalidCharacterError.prototype.name = 'InvalidCharacterError';

	self.btoa = function (input) {
    var str = String (input);
    for (

      var block, charCode, idx = 0, map = chars, output = '';

      str.charAt (idx | 0) || (map = '=', idx % 1);

      output += map.charAt (63 & block >> 8 - idx % 1 * 8)
    ) {
      charCode = str.charCodeAt (idx += 3 / 4);
      if (charCode > 0xFF) {
        throw new InvalidCharacterError ("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
      }
      block = block << 8 | charCode;
    }
    return output;
  }

	self.atob = function (input) {
    var str = (String (input)).replace (/[=]+$/, '');
    if (str.length % 4 === 1) {
      throw new InvalidCharacterError ("'atob' failed: The string to be decoded is not correctly encoded.");
    }
    for (

      var bc = 0, bs, buffer, idx = 0, output = '';

      buffer = str.charAt (idx++);

      ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,

        bc++ % 4) ? output += String.fromCharCode (255 & bs >> (-2 * bc & 6)) : 0
    ) {

      buffer = chars.indexOf (buffer);
    }
    return output;
  }
})();

//
// mhac/activeClips.jsx
//


(function mhac_activeClips() {
	$.mhac.activeClips = {
		_savedClips: null,
		_seq: null,
		video: [],
		audio: [],

		_savedTrackTargeting: {
			audio: {},
			video: {},
		},
	};

	var self = $.mhac.activeClips;

	self.getVideo = function(index) {
		var indices = self.video[index];
		if (!indices) return null;

		return getClipInternal(indices[0], indices[1], 'videoTracks');
	}

	self.getAudio = function(index) {
		var indices = self.audio[index];
		if (!indices) return null;

		return getClipInternal(indices[0], indices[1], 'audioTracks');
	}

	self.getQEVideo = function(index) {
		var indices = self.video[index];
		if (!indices) return null;

		var trackIndex = indices[0];
		var clipIndex = indices[1];
		var seq = $.mhac.helpers.getActiveQESeq();
		var track = seq.getVideoTrackAt(trackIndex);

		var curIndex = -1;
		for (var i = 0; i < track.numItems; i++) {
		var item = track.getItemAt(i);
			if (item.type == 'Empty') continue;
			curIndex++;
			if (curIndex == clipIndex) return item;
		}

		return null;
	}

	self.getQEAudio = function(index) {
		var indices = self.audio[index];
		if (!indices) return null;

		var trackIndex = indices[0];
		var clipIndex = indices[1];
		var seq = $.mhac.helpers.getActiveQESeq();
		var track = seq.getAudioTrackAt(trackIndex);

		var curIndex = -1;
		for (var i = 0; i < track.numItems; i++) {
		var item = track.getItemAt(i);
			if (item.type == 'Empty') continue;
			curIndex++;
			if (curIndex == clipIndex) return item;
		}

		return null;
	}

	function getClipInternal(trackIndex, clipIndex, tracksName) {
		return self._seq[tracksName][trackIndex].clips[clipIndex];
	}

	self.makeSequenceSnapshot = function() {
		self._savedClips = {};
		self._seq = app.project.activeSequence;
		if (!self._seq) return;

		for (var i = 0; i < self._seq.videoTracks.numTracks; i++) {
			var track = self._seq.videoTracks[i];

			for (var j = 0; j < track.clips.numItems; j++) {
				var clip = track.clips[j];
				self._savedClips[clip.nodeId] = clip;
			}
		}

		for (var i = 0; i < self._seq.audioTracks.numTracks; i++) {
			var track = self._seq.audioTracks[i];

			for (var j = 0; j < track.clips.numItems; j++) {
				var clip = track.clips[j];
				self._savedClips[clip.nodeId] = clip;
			}
		}
	}

	self.setFromLastAdded = function() {
		self.video = [];
		self.audio = [];

		if (!self._savedClips) return;
		if (!self._seq) return;
		if (!app.project.activeSequence || app.project.activeSequence.sequenceID != self._seq.sequenceID) {
			throw new Error('The active sequence has changed unexpectedly.');
		}

		for (var trk = 0; trk < self._seq.videoTracks.numTracks; trk++) {
			var track = self._seq.videoTracks[trk];

			for (var clp = 0; clp < track.clips.numItems; clp++) {
				if (!(track.clips[clp].nodeId in self._savedClips)) {
					self.video.push([trk, clp]);
				}
			}
		}

		for (var trk = 0; trk < self._seq.audioTracks.numTracks; trk++) {
			var track = self._seq.audioTracks[trk];

			for (var clp = 0; clp < track.clips.numItems; clp++) {
				if (!(track.clips[clp].nodeId in self._savedClips)) {
					self.audio.push([trk, clp]);
				}
			}
		}

		return self.video.length + self.audio.length;
	}

	self.setFromMHBricks = function() {
		self.video = [];
		self.audio = [];
		self._seq = app.project.activeSequence;
		if (!self._seq) return;

		var bricksRegex = /\.mhbricks$/i

		for (var trk = 0; trk < self._seq.videoTracks.numTracks; trk++) {
			var track = self._seq.videoTracks[trk];

			for (var clp = 0; clp < track.clips.numItems; clp++) {
				if (track.clips[clp].name.match(bricksRegex)) {
					self.video.push([trk, clp]);
				}
			}
		}

		for (var trk = 0; trk < self._seq.audioTracks.numTracks; trk++) {
			var track = self._seq.audioTracks[trk];

			for (var clp = 0; clp < track.clips.numItems; clp++) {
				if (track.clips[clp].name.match(bricksRegex)) {
					self.audio.push([trk, clp]);
				}
			}
		}

		return self.video.length + self.audio.length;
	}

	self.setFromSingleClip = function(clip) {
		if (!clip) {
			self.video = [];
			self.audio = [];
			return;
		}

		self._seq = app.project.activeSequence;

		var linkedItems = clip.getLinkedItems();
		if (linkedItems) {
			self.setFromClips([ linkedItems[0], linkedItems[1] ]);
		} else {
			self.setFromClips([ clip ]);
		}
	}

	self.setFromClips = function(clips) {
		self.video = [];
		self.audio = [];

		if (!clips) return;

		self._seq = app.project.activeSequence;

		var clipDict = {};
		for (var i = 0; i < clips.length; i++) {
			clipDict[clips[i].nodeId] = true;
		}

		for (var trk = 0; trk < self._seq.videoTracks.numTracks; trk++) {
			var track = self._seq.videoTracks[trk];

			for (var clp = 0; clp < track.clips.numItems; clp++) {
				if (clipDict[track.clips[clp].nodeId]) {
					self.video.push([trk, clp]);
				}
			}
		}

		for (var trk = 0; trk < self._seq.audioTracks.numTracks; trk++) {
			var track = self._seq.audioTracks[trk];

			for (var clp = 0; clp < track.clips.numItems; clp++) {
				if (clipDict[track.clips[clp].nodeId]) {
					self.audio.push([trk, clp]);
				}
			}
		}
	}

	self.setFromIndices = function(videoIndices, audioIndices) {
		self._seq = app.project.activeSequence;

		self.video = videoIndices;
		self.audio = audioIndices;
	}

	self.select = function() {
		var clips = [];

		for (var i = 0; i < self.video.length; i++) {
			var vid = self.getVideo(i);
			vid && clips.push(vid);
		}
		for (var i = 0; i < self.audio.length; i++) {
			var aud = self.getAudio(i);
			aud && clips.push(aud);
		}

		self._seq.setSelection(clips);
	}

	self.delete = function() {
		for (var i = 0; i < self.video.length; i++) {
			var vid = self.getVideo(i);
			vid && vid.remove(false, false);
		}
		for (var i = 0; i < self.audio.length; i++) {
			var aud = self.getAudio(i);
			aud && aud.remove(false, false);
		}

		self.video = [];
		self.audio = [];
	}

	self.replacePlaceholderWithMogrt = function(filePath, withAudio, isUserFile, resize, mogrtInfo, textParams) {
		var vclip = self.getVideo(0);
		if (!vclip) {

			$.mhac.helpers.checkForWrongBricksPlacement();
			return;
		}

		var vTrack = self.video[0][0];
		var aTrack = self.audio[0] ? self.audio[0][0] : vTrack;
		var time = vclip.start;

		self.removePlaceholderBricks(function() { $.mhac.undoGroups.start() });

		var seqWidth = self._seq.frameSizeHorizontal;
		var seqHeight = self._seq.frameSizeVertical;
		var resizedPath = filePath
		if (resize) {
			resizedPath = $.mhac.tempPath + filePath.match(/[\\\/]/)[0]
				+ 'resized_' + new Date().getTime() + '.mogrt';

			$.mhac.duplicateMogrtWithSize(filePath, resizedPath, seqWidth, seqHeight);
		}

		if (withAudio) {
			self.setFromSingleClip(self._seq.importMGT(resizedPath, time, vTrack, aTrack));
		} else {
			self.setFromSingleClip($.mhac.importUtils.importMogrtWithoutAudio(resizedPath, time, vTrack));
		}

		var insertedClip = self.getVideo(0);
		if (insertedClip) {

			if (mogrtInfo.durationControl) {
				var mogrtMeta = $.mhac.params.getMHPCMetaPropertyObject(insertedClip);
				if (mogrtMeta && mogrtMeta.maxDur) $.mhac.helpers.setClipOutPoint(insertedClip, mogrtMeta.maxDur);
			}

			$.mhac.importUtils.mogrtApplyLastUsedFont(insertedClip, textParams, mogrtMeta)

			if (!isUserFile) {
				insertedClip.name = insertedClip.name + ' by Mister Horse';
			}
			self.ensureCorrectMogrtScale();
			self.select();
		} else {
			throw new Error('Failed to import the MOGRT');
		}

		$.mhac.undoGroups.end();
	}

	self.removePlaceholderBricks = function (afterRemoveCallback) {
		var vTracksBefore = self._seq.videoTracks.numTracks;
		var aTracksBefore = self._seq.audioTracks.numTracks;

		qe.project.undo();

		if (afterRemoveCallback) afterRemoveCallback();

		var vTracksAfter = self._seq.videoTracks.numTracks;
		var aTracksAfter = self._seq.audioTracks.numTracks;

		if (vTracksAfter < vTracksBefore || aTracksAfter < aTracksBefore) {
			var vidTracksToAdd = vTracksBefore - vTracksAfter
			var audTracksToAdd = aTracksBefore - aTracksAfter
			var audTrackType = 1;

			var seq = $.mhac.helpers.getActiveQESeq();
			seq.addTracks(vidTracksToAdd, vTracksAfter, audTracksToAdd, audTrackType, aTracksAfter, 0, 0);
		}
	}

	self.replacePlaceholderWithAudio = function(filePath, speed, reverse, isUserFile) {
		var clip = self.getAudio(0);
		if (!clip) {

			$.mhac.helpers.checkForWrongBricksPlacement();
			return;
		}

		var aTrack = self.audio[0][0];
		var time = clip.start;
		var projectItem = clip.projectItem;

		self.removePlaceholderBricks(function() { $.mhac.undoGroups.start() });

		var projectItem;
		if (isUserFile) {
			projectItem = $.mhac.project.getOrImportItemToBin(filePath, app.project.rootItem);
		} else {
			projectItem = $.mhac.project.getOrImportItemToACBin(filePath);
		}

		self.makeSequenceSnapshot();
		self._seq.overwriteClip(projectItem, time, 0, aTrack);
		self.setFromLastAdded();

		if (speed != 1 || reverse) self.setSpeed(speed, reverse);
		$.mhac.undoGroups.end();
	}

	self.setSpeed = function (speed, reverse) {
		if (!self.getQEAudio(0)) return;

		self.getQEAudio(0).setSpeed(speed, '', reverse, false, false);
		if (speed != 1) {

			self.getQEAudio(0).setSpeed(speed, '00;30;00;00', reverse, false, false);
		}
	}

	self.replacePlaceholderWithTransition = function(filePath, withAudio) {
		var vclip = self.getVideo(0);
		if (!vclip) {

			throw new Error('Couldn\'t find any dropped clips.');
		}

		$.mhac.project.ensureACBinSelected();

		var insertionPointTicks = vclip.start.ticks;

		self.removePlaceholderBricks(function() { $.mhac.undoGroups.start() });
		self.saveTrackTargeting();
		self.setTrackTargetingToSelected(!withAudio);

		$.mhac.importUtils._importSequence_1(filePath, withAudio, insertionPointTicks);
	}

	self.replacePlaceholderWithTransition_part2 = function() {
		$.mhac.importUtils._importSequence_2();
	}

	self.replacePlaceholderWithTransition_part3 = function() {
		$.mhac.importUtils._importSequence_3();
	}

	self.replacePlaceholderWithTransition_part4 = function() {
		return $.mhac.importUtils._importSequence_4();
	}

	self.replacePlaceholderWithTransition_part5 = function() {
		return $.mhac.importUtils._importSequence_5();
	}

	self.scaleClipsToFit = function (looseAdjLayerMatching) {
		if (!self._seq) return;

		var seqWidth = self._seq.frameSizeHorizontal;
		var seqHeight = self._seq.frameSizeVertical;

		for (var v = 0; v < self.video.length; v++) {
			var clip = self.getVideo(v);
			var qeClip = self.getQEVideo(v);
			if (!clip || !qeClip) continue;

			var isAdjLayer;
			if (looseAdjLayerMatching) {
				isAdjLayer = clip.name == 'Graphic' || clip.isAdjustmentLayer();
			} else {
				isAdjLayer = $.mhac.helpers.isMHAdjustmentClip(clip) || clip.isAdjustmentLayer();
			}
			if (!qeClip.scaleToFrameSize && !isAdjLayer && !clip.isMGT()) continue;

			var clipWidth;
			var clipHeight;

			if (isAdjLayer) {

				clipWidth = 1920;
				clipHeight = 1080;
			} else {
				try {
					clipWidth = qeClip.getProjectItem().clip.videoFrameWidth;
					clipHeight = qeClip.getProjectItem().clip.videoFrameHeight;
				} catch (ex) {
					console.log('qeClip.getProjectItem() failed for', clip.name);

					clipWidth = 3840;
					clipHeight = 2160;
				}
			}

			var targetScaleX = seqWidth / clipWidth;
			var targetScaleY = seqHeight / clipHeight;
			var targetScaleContain = Math.min(targetScaleX, targetScaleY);
			var targetScaleCover = Math.max(targetScaleX, targetScaleY);
			var scaleParamIndex = 1;

			if (isAdjLayer) {
				var shapeFound = false;
				var effects = clip.components;

				for (var i = 0; i < effects.numItems; i++) {
					if (effects[i].matchName !== 'AE.ADBE Shape') continue;

					effects[i].properties[4].setValue(targetScaleCover * 100, true);
					effects[i].properties[5].setValue(targetScaleCover * 100, true);
					shapeFound = true;
				}

				if (!shapeFound) {
					for (var i = 0; i < effects.numItems; i++) {
						if (effects[i].matchName !== 'AE.ADBE Motion') continue;

						effects[i].properties[scaleParamIndex].setValue(
							(targetScaleCover / targetScaleContain) * 100, true
						);
					}
				}
			} else if (qeClip.scaleToFrameSize) {
				var effects = clip.components;
				for (var i = 0; i < effects.numItems; i++) {
					if (effects[i].matchName !== 'AE.ADBE Motion') continue;

					effects[i].properties[scaleParamIndex].setValue(
						(targetScaleCover / targetScaleContain) * 100, true
					);
					break;
				}
			} else if (clip.isMGT() && clip.getMGTComponent()) {
				var props = clip.getMGTComponent().properties;
				for (var i = 0; i < props.numItems; i++) {
					if (props[i].displayName.toLowerCase() !== 'size') continue;

					props[i].setValue(targetScaleCover * 100, true);
					break;
				}

				var effects = clip.components;
				for (var i = 0; i < effects.numItems; i++) {
					if (effects[i].matchName !== 'AE.ADBE Motion') continue;

					if (effects[i].properties[scaleParamIndex].getValue() != 100) {
						effects[i].properties[scaleParamIndex].setValue(100);
					}
					break;
				}
			}
		}
	}

	self.ensureCorrectMogrtScale = function() {
		var scaleParamIndex = 1;

		for (var v = 0; v < self.video.length; v++) {
			var clip = self.getVideo(v);
			if (!clip) continue;

			if (clip.isMGT() && clip.getMGTComponent()) {

				var effects = clip.components;
				for (var i = 0; i < effects.numItems; i++) {
					if (effects[i].matchName !== 'AE.ADBE Motion') continue;

					if (effects[i].properties[scaleParamIndex].getValue() != 100) {
						effects[i].properties[scaleParamIndex].setValue(100);
					}
					break;
				}
			}
		}
	}

	self.setTrackTargetingToSelected = function(ignoreAudio) {
		if (!self._seq) return;

		var vTracksToActivate = {};
		var aTracksToActivate = {};

		for (var i = 0; i < self.video.length; i++) {
			vTracksToActivate[self.video[i][0]] = true;
		}

		for (var i = 0; i < self.audio.length; i++) {
			aTracksToActivate[self.audio[i][0]] = true;
		}

		for (var i = 0; i < self._seq.videoTracks.numTracks; i++) {
			var track = self._seq.videoTracks[i];
			track.setTargeted(!!vTracksToActivate[i], true);
		}

		for (var i = 0; i < self._seq.audioTracks.numTracks; i++) {
			var track = self._seq.audioTracks[i];
			var activate = ignoreAudio ? false : !!aTracksToActivate[i];
			track.setTargeted(activate, true);
		}
	}

	self.setTrackTargetingToAll = function() {
		if (!self._seq) return;

		for (var i = 0; i < self._seq.videoTracks.numTracks; i++) {
			self._seq.videoTracks[i].setTargeted(true, true);
		}

		for (var i = 0; i < self._seq.audioTracks.numTracks; i++) {
			self._seq.audioTracks[i].setTargeted(true, true);
		}
	}

	self.saveTrackTargeting = function() {
		this._savedTrackTargeting.audio = {};
		this._savedTrackTargeting.video = {};

		if (!self._seq) return;

		for (var i = 0; i < self._seq.videoTracks.numTracks; i++) {
			this._savedTrackTargeting.video[i] = self._seq.videoTracks[i].isTargeted();
		}

		for (var i = 0; i < self._seq.audioTracks.numTracks; i++) {
			this._savedTrackTargeting.audio[i] = self._seq.audioTracks[i].isTargeted();
		}
	}

	self.restoreTrackTargeting = function() {
		if (!self._seq) return;

		for (var i = 0; i < self._seq.videoTracks.numTracks; i++) {
			var isActive = this._savedTrackTargeting.video[i];

			self._seq.videoTracks[i].setTargeted(
				isActive === undefined ? true : isActive,
				true
			);
		}

		for (var i = 0; i < self._seq.audioTracks.numTracks; i++) {
			var isActive = this._savedTrackTargeting.audio[i];

			self._seq.audioTracks[i].setTargeted(
				isActive === undefined ? true : isActive,
				true
			);
		}
	}
})();

//
// mhac/helpers.jsx
//

(function mhac_helpers() {
	$.mhac.helpers = {
	};

	var self = $.mhac.helpers;

	self.getSessionId = function () {
		return $.mhsc.sessionId;
	}

	self.getOrCreateFreeTracks = function(time, length, reqVidRows, reqAudRows, allowDesync) {
		if (!reqVidRows && !reqAudRows) return [-1, -1];

		var videoTracks = app.project.activeSequence.videoTracks;
		var audioTracks = app.project.activeSequence.audioTracks;

		var maxTrackCount = Math.max(videoTracks.numTracks, audioTracks.numTracks)
		var freeVT = createArrayValues(maxTrackCount + reqVidRows, true)
		var freeAT = createArrayValues(maxTrackCount + reqAudRows, true)

		if (reqVidRows) for (var i = 0; i < videoTracks.numTracks; i++) {
			freeVT[i] = self.isTrackFree(videoTracks[i], time, time + length);
		}

		if (reqAudRows) for (var i = 0; i < audioTracks.numTracks; i++) {
			freeAT[i] = self.isTrackFree(audioTracks[i], time, time + length);
		}

		var vidTrackIndex;
		var audTrackIndex;

		if (allowDesync) {

			vidTrackIndex = videoTracks.numTracks;
			audTrackIndex = audioTracks.numTracks;

			for (var trk = 0; trk < maxTrackCount; trk++) {
				var hasSpace = true;

				for (var i = 0; i < reqVidRows; i++) {
					if (!freeVT[trk + i]) {
						hasSpace = false;
						break;
					}
				}

				if (hasSpace) {
					vidTrackIndex = trk;
					break;
				}
			}

			for (var trk = 0; trk < maxTrackCount; trk++) {
				var hasSpace = true;

				for (var i = 0; i < reqAudRows; i++) {
					if (!freeAT[trk + i]) {
						hasSpace = false;
						break;
					}
				}

				if (hasSpace) {
					audTrackIndex = trk;
					break;
				}
			}
		} else {

			vidTrackIndex = maxTrackCount;
			audTrackIndex = maxTrackCount;

			for (var trk = 0; trk < maxTrackCount; trk++) {
				var hasSpace = true;

				for (var i = 0; i < reqVidRows; i++) {
					if (!freeVT[trk + i]) {
						hasSpace = false;
						break;
					}
				}
				if (!hasSpace) continue;

				for (var i = 0; i < reqAudRows; i++) {
					if (!freeAT[trk + i]) {
						hasSpace = false;
						break;
					}
				}
				if (!hasSpace) continue;

				vidTrackIndex = trk;
				audTrackIndex = trk;
				break;
			}
		}

		if (
			(reqVidRows && vidTrackIndex + reqVidRows > videoTracks.numTracks) ||
			(reqAudRows && audTrackIndex + reqAudRows > audioTracks.numTracks)
		) {

			var vidTracksToAdd = 0;
			if (reqVidRows) {
				vidTracksToAdd = Math.max(0, vidTrackIndex + reqVidRows - videoTracks.numTracks);
			}
			var vidAddIndex = videoTracks.numTracks;

			var audTracksToAdd = 0;
			if (reqAudRows) {
				audTracksToAdd = Math.max(0, audTrackIndex + reqAudRows - audioTracks.numTracks);
			}
			var audAddIndex = audioTracks.numTracks;
			var audTrackType = 1;

			var seq = self.getActiveQESeq();
			seq.addTracks(vidTracksToAdd, vidAddIndex, audTracksToAdd, audTrackType, audAddIndex, 0, 0);
		}

		return [
			reqVidRows ? vidTrackIndex : -1,
			reqAudRows ? audTrackIndex : -1,
		];
	}

	function createArrayValues(size, defaultValue) {
		var arr = Array(size);
		for (var i = 0; i < size; i++) arr[i] = defaultValue;
		return arr
	}

	self.isTrackFree = function(track, startTime, endTime) {
		for (var i = 0; i < track.clips.numItems; i++) {
			var clip = track.clips[i];

			if (startTime < clip.end.seconds && clip.start.seconds < endTime) {
				return false;
			}
		}

		return true;
	}

	self.checkForWrongBricksPlacement = function() {
		var wasPlacedIncorrectly = false;

		while (true) {
			try {
				if (app.sourceMonitor.getProjectItem().name.match(/\.mhbricks$/i)) {
					app.sourceMonitor.closeClip();
					wasPlacedIncorrectly = true;
					continue;
				}
			} catch (ex) {}

			break;
		}

		for (var i = 0; i < app.projects.numProjects; i++) {
			var project = app.projects[i];

			if ($.mhac.project.findProjectItemByNameRecursive(/\.mhbricks$/i, project.rootItem)) {
				wasPlacedIncorrectly = true;
				qe.project.undo();
				$.mhac.undoGroups.preventRedo(project);
				break;
			}
		}

		if (wasPlacedIncorrectly) {
			throw new Error('USER:It seems that you are dragging the item to a wrong place. Please drag it to the Timeline, or use the "Add" button.')
		}
	}

	self.fixClipsAfterResize = function() {
		if (!app.project.activeSequence) throw new Error('USER:No sequence is currently open');

		var clipsToAdjust = [];
		var clipsToResize = [];

		for (var i = 0; i < app.project.activeSequence.videoTracks.numTracks; i++) {
			var track = app.project.activeSequence.videoTracks[i];

			for (var j = 0; j < track.clips.numItems; j++) {
				var clip = track.clips[j];

				if (!self.isMHClip(clip)) continue;
				clipsToResize.push(clip);

				if (self.isMHAdjustmentClip(clip) && !clip.isAdjustmentLayer()) {
					clipsToAdjust.push(clip);
				}
			}
		}

		app.project.activeSequence.setSelection(clipsToAdjust);

		$.mhac.activeClips.setFromClips(clipsToResize);
		$.mhac.activeClips.scaleClipsToFit();

		return JSON.stringify({
			resized: clipsToResize.length,
			needAdjustment: clipsToAdjust.length
		});
	}

	self.fixClipsAfterResizeManual = function() {
		if (!app.project.activeSequence) throw new Error('USER:No sequence is currently open');

		var selection = app.project.activeSequence.getSelection();
		if (!selection.length) throw new Error('USER:No clips selected');

		$.mhac.activeClips.setFromClips(selection);
		$.mhac.activeClips.scaleClipsToFit(true);
		var resized = $.mhac.activeClips.video.length;

		app.project.activeSequence.setSelection([]);

		var clipsToAdjust = [];

		for (var i = 0; i < $.mhac.activeClips.video.length; i++) {
			var clip = $.mhac.activeClips.getVideo(i);
			if (clip.isAdjustmentLayer()) continue;
			if (clip.name != 'Graphic') continue;

			clipsToAdjust.push(clip);
		}

		app.project.activeSequence.setSelection(clipsToAdjust);

		return JSON.stringify({
			resized: resized,
			needAdjustment: clipsToAdjust.length
		});
	}

	var mhRegex = /mister horse/i;
	var adjLayerRegex = /mister horse adjustment/i;

	self.isMHClip = function(clip) {
		if (clip.name.match(mhRegex)) return true;
		if (!clip.isMGT()) return false;

		var effects = clip.components;
		for (var i = 0; i < effects.numItems; i++) {
			if (effects[i].matchName == 'AE.ADBE Text') {

				if (effects[i].properties[0].getValue().match(mhRegex)) return true;
			}
		}

		return false;
	}

	self.isMHAdjustmentClip = function(clip) {
		if (clip.name.match(adjLayerRegex)) return true;
		if (!clip.isMGT()) return false;

		var effects = clip.components;
		for (var i = 0; i < effects.numItems; i++) {
			if (effects[i].matchName == 'AE.ADBE Text') {
				if (effects[i].properties[0].getValue().match(adjLayerRegex)) return true;
			}
		}

		return false;
	}

	self.hasCorruptedClips = function(clipsArr) {
		if (!clipsArr) return false;

		for (var i = 0; i < clipsArr.length; i++) {
			if (self.isMHAdjustmentClip(clipsArr[i]) && !clipsArr[i].isAdjustmentLayer()) {
				return true;
			}
		}

		return false;
	}

	self.getActiveQESeq = function() {

		if (app.version.match(/^14\.1\./)) {
			qe.project.init();

			var seqId = app.project.activeSequence.sequenceID;
			return findQESeqInBinRec(qe.project, seqId);
		} else {
			return qe.project.getActiveSequence();
		}

		return null;
	}

	function findQESeqInBinRec(bin, seqId) {

		if (!bin) return null;

		for (var i = 0; i < bin.numSequenceItems; i++) {
			var seq = bin.getSequenceAt(i);
			if (seq.guid == seqId) return seq;
		}

		for (var j = 0; j < bin.numBins; j++) {
			var childSeq = findQESeqInBinRec(bin.getBinAt(j), seqId);
			if (childSeq) return childSeq;
		}

		return null;
	}

	self.getActiveProject = function() {
		var seq;
		var seqTreePath;
		try {
			seq = app.project.activeSequence;
		} catch(ex) {

			throw new Error('Can\'t get the active sequence.');
		}

		if (!seq) throw new Error('USER:Please select active sequence.')

		try {
			seqTreePath = seq.projectItem.treePath;
		} catch(ex) {

			throw new Error('Can\'t get the active sequence item.');
		}

		for (var i = 0; i < app.projects.numProjects; i++) {
			var proj = app.projects[i];
			if (seqTreePath.indexOf(proj.name) === 1) return proj;
		}

		return null;
	}

	self.ensureProjAndSeqMatch = function() {
		var project = self.getActiveProject();
		if (!project) return;
		if (project.path == app.project.path) return;

		app.openDocument(project.path);
	}

	self.getActiveSequenceName = function() {
		return (app.project.activeSequence ? app.project.activeSequence.name : null);
	}

	self.getQeClip = function (sequence, qeSequence, appClip) {
		var trackNo = -1;
		var clipNo = -1;

		for (var i = 0; i < sequence.videoTracks.length; i++) {
			var videoTrackClips = sequence.videoTracks[i].clips;
			for (var j = 0; j < videoTrackClips.length; j++) {
				if (videoTrackClips[j].nodeId === appClip.nodeId) {
					trackNo = i;
					clipNo = j;
					break;
				}
			}
		}

		if (trackNo === -1 || clipNo === -1) return null;

		var qeTrack = qeSequence.getVideoTrackAt(trackNo);

		var qeClipIndex = -1;
		for (var i = 0; i < qeTrack.numItems; i++) {
			var qeSequenceClip = qeTrack.getItemAt(i);

			if (!qeSequenceClip.duration) continue;

			qeClipIndex += 1;
			if (qeClipIndex !== clipNo) continue;

			return qeSequenceClip;
		}

		return null;
	}

	self.getClipTimelineLocation = function(sequence, clipNodeId) {
		var tracks = sequence.videoTracks;
		for(var trackNo = 0; trackNo < tracks.length; trackNo++) {
			var clips = tracks[trackNo].clips;
			for (var clipNo = 0; clipNo < clips.length; clipNo++) {
				if (clips[clipNo].nodeId === clipNodeId) {
					return {
						track: trackNo,
						clip: clipNo
					}
				}
			}
		}

		return null;
	}

	self.getTransitionTimelineLocation = function(sequence, transitionNodeId) {
		var tracks = sequence.videoTracks;
		for(var trackNo = 0; trackNo < tracks.length; trackNo++) {
			var transitions = tracks[trackNo].transitions;
			for (var transitionNo = 0; transitionNo < transitions.length; transitionNo++) {
				if (transitions[transitionNo].nodeId === transitionNodeId) {
					return {
						track: trackNo,
						transition: transitionNo
					}
				}
			}
		}

		return null;
	}

	self.setClipEnd = function(clip, end) {
		try {
			clip.end = end;
		} catch (e) {
		 	if (app.version.match(/^15\.[0123]\./) && e.name === "TypeError" && e.message === "Cannot set property end") {

		 	} else {
		   throw e;
			}
		}
	}

	self.setClipOutPoint = function(clip, outPoint) {
		try {
			clip.outPoint = outPoint;
		} catch (e) {
			if (app.version.match(/^15\.[0123]\./) && e.name === "TypeError" && e.message === "Cannot set property outPoint") {

			} else {
				throw e;
			}
		}
	}

	self.throwMogrtIncompatible = function () {
		var details = JSON.stringify({ error: { data: { url: null } } });
		throw new Error("PLUGIN:Current version of Premiere Pro ("+ app.version +") contains critical bug for this functionality. Please use different version of Premiere Pro.|DETAILS|" + details);
	}

})();

//
// mhac/importUtils.jsx
//

(function mhac_importUtils() {
	$.mhac.importUtils = {};

	var self = $.mhac.importUtils;

	self.safeInsertImageSeq = function(framePaths) {
		self.sanityCheck();

		var time = app.project.activeSequence.getPlayerPosition();

		$.mhac.undoGroups.start();

		var project = $.mhac.helpers.getActiveProject();
		var item = $.mhac.project.getOrImportSequenceToBin(framePaths, project.rootItem);
		var length = item.getOutPoint().seconds - item.getInPoint().seconds;

		var indices = $.mhac.helpers.getOrCreateFreeTracks(time.seconds, length, 1, 0, false);

		var vTrack = indices[0];

		var success = app.project.activeSequence.insertClip(item, time, vTrack, 0);
		if (!success) throw new Error('Failed to import the file');
		$.mhac.undoGroups.end();
	}

	self.openImageSeqInSourceMonitor = function(framePaths) {
		var project = $.mhac.helpers.getActiveProject();
		var item = $.mhac.project.getOrImportSequenceToBin(framePaths, project.rootItem);
		app.sourceMonitor.openProjectItem(item);
	}

	self.importDroppedBricksAsImageSeq = function(framePaths) {
		var clipsAdded = $.mhac.activeClips.setFromMHBricks();
		if (clipsAdded) {
			var vTrack = $.mhac.activeClips.video[0][0];
			var time = $.mhac.activeClips.getVideo(0).start;

			$.mhac.activeClips.removePlaceholderBricks(function() { $.mhac.undoGroups.start() });

			var project = $.mhac.helpers.getActiveProject();
			var item = $.mhac.project.getOrImportSequenceToBin(framePaths, project.rootItem);

			app.project.activeSequence.insertClip(item, time, vTrack, 0);

			$.mhac.undoGroups.end();
		} else {

			var openInSourceMon = false;

			while (true) {
				try {
					if (app.sourceMonitor.getProjectItem().name.match(/\.mhbricks$/i)) {
						app.sourceMonitor.closeClip();
						openInSourceMon = true;
						continue;
					}
				} catch (ex) {}

				break;
			}

			if (openInSourceMon) {
				self.openImageSeqInSourceMonitor(framePaths);
				return
			}

			for (var i = 0; i < app.projects.numProjects; i++) {
				var project = app.projects[i];

				if ($.mhac.project.findProjectItemByNameRecursive(/\.mhbricks$/i, project.rootItem)) {
					qe.project.undo();
					$.mhac.project.getOrImportSequenceToBin(framePaths, project.rootItem);
					return;
				}
			}
		}
	}

	self.safeInsertFootage = function(filePath) {
		self.sanityCheck();

		var time = app.project.activeSequence.getPlayerPosition();
		var lastAudioTrackCount = app.project.activeSequence.audioTracks.numTracks;

		$.mhac.undoGroups.start();

		var hasAudio = false;
		var item = $.mhac.project.getOrImportItemToBin(filePath, app.project.rootItem);
		if (!filePath.match(/\.(ai|eps|bmp|dib|rle|dpx|gif|ico|jpeg|jpg|jpe|jfif|png|psd|ptl|prtl|tga|tiff?)$/i)) {
			item.clearInPoint();
			item.clearOutPoint();
			hasAudio = item.getOutPoint(2).seconds > 0;
		}
		var length = item.getOutPoint().seconds - item.getInPoint().seconds;

		var withAudio = true;
		var allowDesync = !withAudio;
		var indices = $.mhac.helpers.getOrCreateFreeTracks(
			time.seconds,
			length,
			1,
			hasAudio ? 1 : 0,
			false
		);

		var vTrack = indices[0];
		var aTrack = indices[1] == -1 ? 0 : indices[1];

		var success = app.project.activeSequence.insertClip(item, time, vTrack, aTrack);
		if (!success) throw new Error('Failed to import the file');

		$.mhac.undoGroups.end();

		qe.project.getActiveSequence().makeCurrent();
	}

	self.mogrtApplyLastUsedFont = function (clip, textParams, mogrtMeta) {
		if (!mogrtMeta || !mogrtMeta.fontReuseGroupId || !textParams || !textParams.fontGroups) return;
		var fontReuseGroupId = mogrtMeta.fontReuseGroupId;
		if (!textParams.fontGroups[fontReuseGroupId] || textParams.fontGroups[fontReuseGroupId].length === 0) return;

		var properties = clip.getMGTComponent().properties;
		for (var i = 0; i < properties.length; i++) {
			var property = properties[i];
			var value = property.getValue();
			if (typeof value === 'string' && value.indexOf("\"fontEditValue\":[") > -1) {
				var textPropertyValue = JSON.parse(property.getValue());
				textPropertyValue['fontEditValue'] = [textParams.fontGroups[fontReuseGroupId]]
				property.setValue(JSON.stringify(textPropertyValue))
			}
		}
	}

	self.safeInsertMogrt = function(filePath, withAudio, isUserFile, resize, insertAt, textParams) {
		self.sanityCheck();

		var mogrtInfo = JSON.parse($.mhac.getMogrtInfo(filePath));
		self.compatibilityCheck(mogrtInfo);

		var time = app.project.activeSequence.getPlayerPosition();
		if (insertAt != null) {
			time.seconds = insertAt;
		}
		var lastAudioTrackCount = app.project.activeSequence.audioTracks.numTracks;

		$.mhac.undoGroups.start();

		var allowDesync = !withAudio;
		var indices = $.mhac.helpers.getOrCreateFreeTracks(
			time.seconds,
			mogrtInfo.duration,
			1,
			mogrtInfo.hasAudio ? 1 : 0,
			allowDesync
		);

		var seqWidth = app.project.activeSequence.frameSizeHorizontal;
		var seqHeight = app.project.activeSequence.frameSizeVertical;
		var resizedPath = filePath;
		if (resize) {
			resizedPath = $.mhac.tempPath + filePath.match(/[\\\/]/)[0]
				+ 'resized_' + new Date().getTime() + '.mogrt';

			$.mhac.duplicateMogrtWithSize(filePath, resizedPath, seqWidth, seqHeight);
		}

		var clip = app.project.activeSequence.importMGT(resizedPath, time, indices[0], indices[1]);

		var mogrtMeta = $.mhac.params.getMHPCMetaPropertyObject(clip);
		if (mogrtMeta && mogrtMeta.maxDur) $.mhac.helpers.setClipOutPoint(clip, mogrtMeta.maxDur)

		if (!clip) throw new Error('Failed to import the MOGRT');
		$.mhac.activeClips.setFromSingleClip(clip);

		if (!isUserFile) {
			clip.name = clip.name + ' by Mister Horse';
		}

		if (!withAudio && mogrtInfo.hasAudio) {
			if (indices[1] == lastAudioTrackCount) {
				$.mhac.helpers.getActiveQESeq().removeAudioTrack(indices[1]);
			} else {
				$.mhac.activeClips.getAudio(0).remove(false, false);
			}
		}

		self.mogrtApplyLastUsedFont(clip, textParams, mogrtMeta);

		$.mhac.activeClips.ensureCorrectMogrtScale();
		$.mhac.activeClips.select();
		$.mhac.undoGroups.end();

		qe.project.getActiveSequence().makeCurrent();
	}

	self.checkSelectionSafelyReplaceableByMogrt = function(mogrtPath) {
		var mogrtInfo = JSON.parse($.mhac.getMogrtInfo(mogrtPath));
		self.compatibilityCheck(mogrtInfo);

		$.mhac.activeClips.setFromClips(app.project.activeSequence.getSelection());
		if ($.mhac.activeClips.video.length !== 1) throw new Error('USER:A single video clip must be selected');

		var videoClip = $.mhac.activeClips.getVideo(0);

		if (mogrtInfo.durationControl && mogrtInfo.meta && mogrtInfo.meta.maxDur) return true;

		var sequence = app.project.activeSequence;
		var clipLocation = $.mhac.helpers.getClipTimelineLocation(sequence, videoClip.nodeId);
		var videoTrack = sequence.videoTracks[clipLocation.track];

		if (videoTrack.clips.length === (clipLocation.clip + 1)) return true;
		var emptySpaceInSeconds = videoTrack.clips[clipLocation.clip + 1].start.seconds - videoClip.start.seconds;

		return emptySpaceInSeconds + 0.035 > mogrtInfo.duration;
	}

	self.safeReplaceMogrt = function(filePath, withAudio, isUserFile, resize, textParams) {
		var videoClip = $.mhac.activeClips.getVideo(0);
		if (!videoClip) throw new Error('USER:A video clip must be selected');

		var time = videoClip.start.seconds;

		self.safeInsertMogrt(filePath, withAudio, isUserFile, resize, time, textParams);
	}

	function getEmptySpaceInSeconds(videoTrackIndex, startTime) {
		var emptyTime = -1;

		var trackClips = app.project.activeSequence.videoTracks[videoTrackIndex].clips;
		for (var i = 0; i < trackClips.length; i++) {
			if (trackClips[i].start.seconds > startTime) {
				emptyTime = trackClips[i].start.seconds - startTime;
				break;
			}
		}

		return emptyTime;
	}

	self.replaceSelectionWithMogrt = function(filePath, withAudio, isUserFile, resize, mogrtInfo, textParams) {
		self.sanityCheck();
		self.compatibilityCheck(mogrtInfo);

		$.mhac.activeClips.setFromClips(app.project.activeSequence.getSelection());

		var videoClip = $.mhac.activeClips.getVideo(0);
		if (!videoClip) throw new Error('USER:A video clip must be selected');
		var originalClipDuration = videoClip.end.seconds - videoClip.start.seconds;
		var keepDuration = ( mogrtInfo.durationControl && mogrtInfo.meta && mogrtInfo.meta.maxDur ) ? true : false

		$.mhac.undoGroups.start();

		var time = videoClip.start.seconds;
		var vTrack = $.mhac.activeClips.video[0][0];
		var aTrack = $.mhac.activeClips.audio[0] ? $.mhac.activeClips.audio[0][0] : vTrack;
		var emptySpaceInSeconds = getEmptySpaceInSeconds(vTrack, time);

		$.mhac.activeClips.delete();

		var seqWidth = app.project.activeSequence.frameSizeHorizontal;
		var seqHeight = app.project.activeSequence.frameSizeVertical;
		var resizedPath = filePath;
		if (resize || keepDuration) {
			resizedPath = $.mhac.tempPath + filePath.match(/[\\\/]/)[0]
				+ 'resized_' + new Date().getTime() + '.mogrt';

			$.mhac.duplicateMogrtWithSize(filePath, resizedPath, seqWidth, seqHeight, keepDuration ? originalClipDuration : null);
		}

		var importIndices = {
			vTrack: vTrack,
			aTrack: aTrack,
		}

		var importToTempTrack = !keepDuration && (mogrtInfo.durationControl && emptySpaceInSeconds > 0 && mogrtInfo.duration > emptySpaceInSeconds);

		if (importToTempTrack) {
			var allowDesync = !withAudio;
			var indices = $.mhac.helpers.getOrCreateFreeTracks(
				time,
				mogrtInfo.duration,
				1,
				mogrtInfo.hasAudio ? 1 : 0,
				allowDesync
			);

			importIndices.vTrack = indices[0];
			importIndices.aTrack = indices[1] == -1 ? 0 : indices[1];
		}

		var clip
		if (withAudio) {
			clip = app.project.activeSequence.importMGT(resizedPath, time, importIndices.vTrack, importIndices.aTrack);
		} else {
			clip = self.importMogrtWithoutAudio(resizedPath, time, importIndices.vTrack);
		}
		if (!clip) throw new Error('Failed to import the MOGRT');

		$.mhac.activeClips.setFromSingleClip(clip);
		if (!isUserFile) {
			clip.name = clip.name + ' by Mister Horse';
		}

		var mogrtMeta = $.mhac.params.getMHPCMetaPropertyObject(clip);

		if (mogrtMeta) {

			$.mhac.helpers.setClipOutPoint(clip, mogrtMeta.maxDur);
			if (keepDuration) $.mhac.params.getMGTProperty(clip, "Duration").setValue(originalClipDuration, true);

			self.mogrtApplyLastUsedFont(clip, textParams, mogrtMeta);
		}

		if (importToTempTrack) {
			if (vTrack != importIndices.vTrack || aTrack != importIndices.aTrack) {
				var qeClip = $.mhac.activeClips.getQEVideo(0);
				qeClip.moveToTrack(vTrack - importIndices.vTrack, aTrack - importIndices.aTrack, "0")
				$.mhac.activeClips.setFromSingleClip(clip);
			}
		}

		$.mhac.activeClips.ensureCorrectMogrtScale();
		$.mhac.activeClips.select();
		$.mhac.undoGroups.end();
		qe.project.getActiveSequence().makeCurrent();
	}

	self.importMogrtWithoutAudio = function(filePath, time, vidTrackIndex) {
		self.sanityCheck();

		var audTracksToAdd = 1;
		var audTrackIndex = app.project.activeSequence.audioTracks.numTracks;
		var audTrackType = 1;

		var seq = $.mhac.helpers.getActiveQESeq();
		seq.addTracks(0, 0, audTracksToAdd, audTrackType, audTrackIndex - 1, 0, 0);

		var clip = app.project.activeSequence.importMGT(filePath, time, vidTrackIndex, audTrackIndex);
		seq.removeAudioTrack(audTrackIndex);
		return clip;
	}

	self.safeInsertSound = function(filePath, length, speed, reversed, isUserFile) {
		self.sanityCheck();

		var time = app.project.activeSequence.getPlayerPosition();
		$.mhac.undoGroups.start();

		var spaceNeeded = Math.max(length / speed, length);

		var indices = $.mhac.helpers.getOrCreateFreeTracks(time.seconds, spaceNeeded, 0, 1);

		var projectItem;
		if (isUserFile) {
			projectItem = $.mhac.project.getOrImportItemToBin(filePath, app.project.rootItem);
		} else {
			projectItem = $.mhac.project.getOrImportItemToACBin(filePath);
		}

		if (speed != 1 || reversed) {
			$.mhac.activeClips.makeSequenceSnapshot();
			app.project.activeSequence.overwriteClip(projectItem, time, 0, indices[1]);
			$.mhac.activeClips.setFromLastAdded();
			$.mhac.activeClips.setSpeed(speed, reversed);
		} else {
			app.project.activeSequence.overwriteClip(projectItem, time, 0, indices[1]);
		}

		$.mhac.undoGroups.end();

		qe.project.getActiveSequence().makeCurrent();
	}

	self.replaceSelectionWithSound = function(filePath, speed, reversed, isUserFile) {
		self.sanityCheck();

		$.mhac.activeClips.setFromClips(app.project.activeSequence.getSelection());
		$.mhac.activeClips.video = [];

		var audioClip = $.mhac.activeClips.getAudio(0);
		if (!audioClip) throw new Error('USER:An audio clip must be selected');

		var time = audioClip.start.seconds;
		var audTrack = $.mhac.activeClips.audio[0][0];
		var projectItem;
		if (isUserFile) {
			projectItem = $.mhac.project.getOrImportItemToBin(filePath, app.project.rootItem);
		} else {
			projectItem = $.mhac.project.getOrImportItemToACBin(filePath);
		}

		$.mhac.undoGroups.start();
		$.mhac.activeClips.delete();

		if (speed != 1 || reversed) {
			$.mhac.activeClips.makeSequenceSnapshot();
			app.project.activeSequence.overwriteClip(projectItem, time, 0, audTrack);
			$.mhac.activeClips.setFromLastAdded();
			$.mhac.activeClips.setSpeed(speed, reversed);
		} else {
			app.project.activeSequence.overwriteClip(projectItem, time, 0, audTrack);
		}

		$.mhac.undoGroups.end();

		qe.project.getActiveSequence().makeCurrent();
	}

	self.safeInsertTransition = function(filePath, transitionInfo, withAudio) {
		self.sanityCheck();

		$.mhac.undoGroups.start();

		var time = app.project.activeSequence.getPlayerPosition();
		if (transitionInfo.splitPoints && transitionInfo.splitPoints.length) {
			time.seconds = time.seconds - transitionInfo.splitPoints[0]
		}

		var indices = $.mhac.helpers.getOrCreateFreeTracks(
			time.seconds,
			transitionInfo.duration,
			transitionInfo.videoTracks,
			withAudio ? transitionInfo.audioTracks : 0,
			true
		);

		$.mhac.activeClips.saveTrackTargeting();

		for (var i = 0; i < app.project.activeSequence.videoTracks.numTracks; i++) {
			var track = app.project.activeSequence.videoTracks[i];
			track.setTargeted(i >= indices[0], true);
		}

		for (var i = 0; i < app.project.activeSequence.audioTracks.numTracks; i++) {
			var track = app.project.activeSequence.audioTracks[i];
			track.setTargeted(i >= indices[1], true);
		}

		self._importSequence_1(filePath, withAudio, time.ticks);
	}

	self.safeInsertTransition_part2 = function() {
		self._importSequence_2();
	}

	self.safeInsertTransition_part3 = function() {
		self._importSequence_3();
	}

	self.safeInsertTransition_part4 = function() {
		return self._importSequence_4();
	}

	self.safeInsertTransition_part5 = function() {
		return self._importSequence_5();
	}

	self._importSequence_1 = function(path, withAudio, insertionPointTicks) {
		var activeSequence = app.project.activeSequence;
		var activeQESeq = $.mhac.helpers.getActiveQESeq();
		var activeProject = $.mhac.helpers.getActiveProject();

		$.mhac.events.pauseEvents();

		var lastPositionTicks = activeSequence.getPlayerPosition().ticks;
		activeSequence.setPlayerPosition(insertionPointTicks);

		var project = $.mhac.helpers.getActiveProject()
		var previousSequences = {};
		for (var i = 0; i < project.sequences.numSequences; i++) {
			var seq = project.sequences[i];

			previousSequences[seq.sequenceID] = true;
		}

		var revertDuplicateProperty = false;
		var duplicatePropertyID = 'BE.Project.CreateDupesOnImportPropertyKey';

		if (app.properties.doesPropertyExist(duplicatePropertyID) && !app.properties.isPropertyReadOnly(duplicatePropertyID)) {
			var propertyValue = app.properties.getProperty(duplicatePropertyID);
			if (propertyValue === true || propertyValue === "true") {
				revertDuplicateProperty = true;
				app.properties.setProperty(duplicatePropertyID, "false", false, false);
			}
		}

		try {
			project.importFiles(
				[path],
				true,
				project.rootItem,
				false
			);
		} catch (exception) {
			if (revertDuplicateProperty) app.properties.setProperty(duplicatePropertyID, "true", false, false);
			throw exception;
		}

		var insertedSequence;
		for (var i = 0; i < project.sequences.numSequences; i++) {
			var seq = project.sequences[i];

			if (!previousSequences[seq.sequenceID]) {
				insertedSequence = seq;
				break;
			}
		}

		if (!insertedSequence) throw new Error('Unable to import the transition sequence');

		project.openSequence(insertedSequence.sequenceID);

		self._transitionContext = {
			activeSequence: activeSequence,
			insertedSequence: insertedSequence,
			activeQESeq: activeQESeq,
			activeProject: activeProject,
			lastPositionTicks: lastPositionTicks,
			withAudio: withAudio,
			path: path,
		};

	}

	self._importSequence_2 = function() {

		if (!self._transitionContext) throw new Error('Failed to import transition - context lost');

		var withAudio = self._transitionContext.withAudio
		var insertedSequence = self._transitionContext.insertedSequence

		var clipsToSelect = [];

		for (var i = 0; i < insertedSequence.videoTracks.numTracks; i++) {
			var track = insertedSequence.videoTracks[i];
			for (var j = 0; j < track.clips.numItems; j++) {
				clipsToSelect.push(track.clips[j]);
			}
		}

		if (withAudio) {
			for (var i = 0; i < insertedSequence.audioTracks.numTracks; i++) {
				var track = insertedSequence.audioTracks[i];
				for (var j = 0; j < track.clips.numItems; j++) {
					clipsToSelect.push(track.clips[j]);
				}
			}
		}

		insertedSequence.setSelection(clipsToSelect);

	}

	self._importSequence_3 = function() {

		var ctx = self._transitionContext;

		ctx.activeProject.openSequence(ctx.activeSequence.sequenceID);

		ctx.activeQESeq.makeCurrent();

		$.mhac.activeClips.makeSequenceSnapshot();

	}

	self._importSequence_4 = function() {

		var ctx = self._transitionContext;

		$.mhac.activeClips.setFromLastAdded();

		if (!$.mhac.activeClips.getVideo(0)) {
			throw new Error('No items were copied into the sequence. This shouldn\'t happen. If the problem persists, try restarting Premiere.')
		}

		var insertedSequence = ctx.insertedSequence;

		var adjClips = {};
		for (var t = 0; t < insertedSequence.videoTracks.numTracks; t++) {
			var track = insertedSequence.videoTracks[t];

			for (var c = 0; c < track.clips.numItems; c++) {
				if (track.clips[c].isAdjustmentLayer()) {
					adjClips[t + '_' + c] = true;
				}
			}
		}

		var wrapperBin;
		var project = ctx.activeProject;

		try {
			var wrapperBinName = ctx.path.match(/([^\/\\]+)\.[^\.]+/)[1];
			wrapperBin = $.mhac.project.findBinByName(wrapperBinName, project.rootItem);
		} catch (ex) {}

		insertedSequence.close();
		if (wrapperBin) {

			if (wrapperBin.children.numItems > 0) {
				var wrappedACBin = wrapperBin.children[0];
				var acBin = $.mhac.project.getOrCreateACBin(project);

				for (var i = 0; i < wrappedACBin.children.numItems; i++) {
					if (wrappedACBin.children[i].type != 2) continue;
					wrappedACBin.children[i].moveBin(acBin);
				}
			}

			wrapperBin.deleteBin();
		} else {

			insertedSequence.projectItem.moveBin($.mhac.undoGroups.getTempBin());
		}

		ctx.activeProject.openSequence(ctx.activeSequence.sequenceID);
		ctx.activeQESeq.makeCurrent();

		$.mhac.activeClips.restoreTrackTargeting();

		var track = 0;
		var clip = 0;
		var lastTrackId = $.mhac.activeClips.video[0][0];
		var clipsToAdjust = [];

		for (var i = 0; i < $.mhac.activeClips.video.length; i++) {
			var video = $.mhac.activeClips.video[i];
			if (lastTrackId != video[0]) {
				lastTrackId = video[0];
				track++;
				clip = 0;
			}

			if (
				adjClips[track + '_' + clip]
				&& !$.mhac.activeClips.getVideo(i).isAdjustmentLayer()
			) {
				clipsToAdjust.push($.mhac.activeClips.getVideo(i));
			}

			clip++;
		}

		app.project.activeSequence.setSelection(clipsToAdjust);

		return clipsToAdjust.length;

	}

	self._importSequence_5 = function() {
		$.mhac.activeClips.scaleClipsToFit();

		var clipsWithAdjLayer = 0;

		for (var i = 0; i < $.mhac.activeClips.video.length; i++) {
			if ($.mhac.activeClips.getVideo(i).isAdjustmentLayer()) {
				clipsWithAdjLayer++;
			}
		}

		app.project.activeSequence.setPlayerPosition(self._transitionContext.lastPositionTicks);

		$.mhac.activeClips.select();

		self._transitionContext = undefined;

		$.mhac.events.unpauseEvents();

		return clipsWithAdjLayer;
	}

	self.sanityCheck = function() {
		if (!app.project.activeSequence) throw new Error('USER:No sequence is currently open');
	}

	self.compatibilityCheck = function (mogrtInfo) {
		if (!mogrtInfo || !mogrtInfo.durationControl) return;
		if (!app.version.match(/^22\.1\./)) return;

		$.mhac.helpers.throwMogrtIncompatible();
	}
})();

//
// mhac/project.jsx
//

(function mhac_project() {
	$.mhac.project = {};

	var self = $.mhac.project;
	var AC_BIN_NAME = 'Premiere Composer Files';

	self.ensureACBinSelected = function() {
		for (var i = 0; i < app.projects.numProjects; i++) {
			var proj = app.projects[i];
			var bin = self.getOrCreateACBin(proj);
			bin.select();
		}
	}

	self.deleteItem = function(projectItem) {
		var tempBin = $.mhac.helpers.getActiveProject().rootItem.createBin("_to_delete_");
		qe.project.undo();
		projectItem.moveBin(tempBin);
		tempBin.deleteBin();
	}

	self.deleteItems = function(projectItemArr) {
		var tempBin = $.mhac.helpers.getActiveProject().rootItem.createBin("_to_delete_");
		qe.project.undo();
		for (var i = 0; i < projectItemArr.length; i++) {
			projectItemArr[i].moveBin(tempBin);
		}
		tempBin.deleteBin();
	}

	self.moveItemToACBinByPath = function(filePath) {
		var filename = getFilenameFromPath(filePath);
		var acBin = self.getOrCreateACBin();

		var itemInAcBin = self.findProjectItemByName(filename, acBin);
		if (itemInAcBin) return;

		var itemInRoot = self.findProjectItemByName(filename, $.mhac.helpers.getActiveProject().rootItem);
		if (!itemInRoot) return;

		itemInRoot.moveBin(acBin);
	}

	self.getOrImportItemToACBin = function(filePath) {
		var filename = getFilenameFromPath(filePath);
		var bin = self.getOrCreateACBin();
		var foundItem = self.findProjectItemByName(filename, bin);

		if (!foundItem) {
			$.mhac.helpers.getActiveProject().importFiles([ filePath ], true, bin, false);
			foundItem = self.findProjectItemByName(filename, bin);
		}

		if (!foundItem) {
			throw new Error('Failed to import:' + filePath);
		}

		return foundItem;
	}

	self.getOrImportItemToBin = function(filePath, bin) {
		var filename = getFilenameFromPath(filePath);
		var foundItem = self.findProjectItemByNameRecursive(filename, bin);

		if (!foundItem) {
			$.mhac.helpers.getActiveProject().importFiles([ filePath ], true, bin, false);
			foundItem = self.findProjectItemByName(filename, bin);
		}

		if (!foundItem) {
			throw new Error('Failed to import:' + filePath);
		}

		return foundItem;
	}

	self.getOrImportSequenceToBin = function(filePaths, bin) {
		var filename = getFilenameFromPath(filePaths[0]);
		var foundItem = self.findProjectItemByNameRecursive(filename, bin);

		if (!foundItem) {
			$.mhac.helpers.getActiveProject().importFiles(filePaths, true, bin, true);
			foundItem = self.findProjectItemByName(filename, bin);
		}

		if (!foundItem) {
			throw new Error('Failed to import:' + filePath);
		}

		return foundItem;
	}

	self.getOrCreateACBin = function(project) {
		if (project === undefined) project = $.mhac.helpers.getActiveProject();

		var acBin = self.findBinByName(AC_BIN_NAME, project.rootItem);
		if (!acBin) {
			acBin = project.rootItem.createBin(AC_BIN_NAME);
		}

		return acBin;
	}

	self.ensureNoLeftoversInACBin = function() {
		var project = $.mhac.helpers.getActiveProject();

		var acBin = self.findBinByName(AC_BIN_NAME, project.rootItem);
		if (!acBin) return 0

		var seqPathsToDelete = {};
		var clean = true;

		var items = acBin.children;
		for (var i = 0; i < items.numItems; i++) {
			var item = items[i];
			if (item.isSequence()) {
				seqPathsToDelete[item.treePath] = true;
				clean = false;
			}
		}

		if (clean) return 0;

		var seqsToDelete = [];
		for (var i = 0; i < project.sequences.numSequences; i++) {
			var seq = project.sequences[i];
			var seqItem = seq.projectItem;

			if (seqPathsToDelete[seqItem.treePath]) {
				seqsToDelete.push(seq);
			}
		}

		for (var i = 0; i < seqsToDelete.length; i++) {
			project.deleteSequence(seqsToDelete[i]);
		}

		return seqsToDelete.length;
	}

	function getFilenameFromPath(filePath) {
		try {
			return filePath.match(/([^\/\\]+$)/)[1];
		} catch (ex) {
			return filePath;
		}
	}

	self.findBinByName = function(name, bin) {
		for (var i = 0; i < bin.children.numItems; i++) {
			var item = bin.children[i];

			if (item.type == ProjectItemType.BIN) {
				if (item.name == name) return item;
			}
		}

		return null;
	}

	self.findProjectItemByName = function(name, bin) {
		for (var i = 0; i < bin.children.numItems; i++) {
			var item = bin.children[i];

			if (item.type == ProjectItemType.CLIP || item.type == ProjectItemType.FILE) {
				if (item.name == name) return item;
			}
		}

		return null;
	}

	self.findProjectItemByNameRecursive = function(name, bin) {
		for (var i = 0; i < bin.children.numItems; i++) {
			var item = bin.children[i];

			if (item.type == ProjectItemType.BIN) {
				var found = self.findProjectItemByNameRecursive(name, item);
				if (found) return item;
			} else if (item.type == ProjectItemType.CLIP || item.type == ProjectItemType.FILE) {
				if (item.name.match(name)) return item;
			}
		}

		return null;
	}

	self.refreshOfflineMediaInACBin = function(proj) {

		var refreshMediaRec = function(targetBin) {
			for (var i = (targetBin.children.length - 1); i >= 0; i--) {
				var childItem = targetBin.children[i];        
				if (childItem.type === ProjectItemType.BIN) {
					refreshMediaRec(childItem);
				} else if (childItem.type === ProjectItemType.CLIP) {
					var origMediaPath = childItem.getMediaPath();
					if (childItem.isOffline()) {
						childItem.setOffline();
						childItem.changeMediaPath(origMediaPath, true);
					}
				}
			}
		};

		refreshMediaRec($.mhac.project.getOrCreateACBin(proj));
	}
	
})();

//
// mhac/undoGroups.jsx
//

(function mhac_undoGroups() {
	$.mhac.undoGroups = {
		_groups: [],
		_currentIndex: null,
		_currentProjPath: null,
		_tempBin: null,
		_qeProjects: {}
	};

	var self = $.mhac.undoGroups;

	self.start = function() {
		if (self._currentIndex !== null) {
			self._currentIndex = null;
			throw new Error('An undo group has been left open by a previous operation. Press OK to fix this.');

		}

		var acBin = $.mhac.project.getOrCreateACBin(app.project);
		var tempBinName = 'MH_UNDO_' + (+new Date());
		self._tempBin = acBin.createBin(tempBinName);

		var qeProject = self.getQeProject(app.project.path);
		qeProject.undo();

		qeProject.init();

		self._currentProjPath = app.project.path;
		self._currentIndex = qe.project.undoStackIndex();
	}

	self.end = function() {
		if (self._currentIndex === null) throw new Error('No undo group has been started.');
		if (app.project.path != self._currentProjPath) {
			self._currentIndex = null;
			self._tempBin.deleteBin();
			throw new Error('The project has changed during undo group creation, aborting undo group.');
		}

		var qeProject = self.getQeProject(self._currentProjPath);
		var endIndex = qeProject.undoStackIndex();
		self._groups.push([ self._currentIndex, endIndex, self._currentProjPath ]);

		if (self._groups.length > 32) {
			self._groups = self._groups.slice(-32);
		}

		self._tempBin.deleteBin();

		self._currentIndex = null;
	}

	self.abort = function() {
		if (self._currentIndex === null) return;

		var qeProject = self.getQeProject(self._currentProjPath);

		for (var i = 0; i < 32; i++) {
			if (qeProject.undoStackIndex() < self._currentIndex) break;
			qeProject.undo();
		}

		self.preventRedo();

		self._currentIndex = null;
	}

	self.getTempBin = function() {
		return self._tempBin;
	}

	self.preventRedo = function(project) {

		var acBin = $.mhac.project.getOrCreateACBin(project);
		acBin.renameBin(acBin.name);
		var qeProject = self.getQeProject(self._currentProjPath);
		qeProject.undo();
	}

	self.onProjectChanged = function(projectId, appProject) {
		if (self._currentIndex !== null) return;

		var qeProject = self.getQeProject(appProject.path, true);
		self._currentIndex = -1;
		var projectPath = appProject.path;

		var failSafeCounter = 0;

		var stackIndex = qeProject.undoStackIndex();

		for (var i = 0; i < self._groups.length; i++) {
			var group = self._groups[i];

			if (stackIndex >= group[0] && stackIndex <= group[1] && group[2] == projectPath) {
				if (stackIndex - group[0] < group[1] - stackIndex) {

					while (qeProject.undoStackIndex() <= group[1]) {
						qeProject.redo();
						if (++failSafeCounter > 32) break;
					}
				} else {

					while (qeProject.undoStackIndex() >= group[0]) {
						qeProject.undo();
						if (++failSafeCounter > 32) break;
					}
				}
			}

			if (failSafeCounter > 32) break;
		}

		if (failSafeCounter > 32) {
			self._groups = [];
			self._currentIndex = null;
			throw new Error('A fatal error has occured in undo groups - discarding them to prevent further errors.');
		}

		self._currentIndex = null;
	}

	self.onProjectClosed = function() {

		var projPathDict = {};

		for (var i = 0; i < app.projects.numProjects; i++) {
			projPathDict[app.projects[i].path] = true;
		}

		var newGroups = [];
		for (var i = 0; i < self._groups.length; i++) {
			if (projPathDict[self._groups[i][2]]) {
				newGroups.push(self._groups[i]);
			}
		}

		self._groups = newGroups;

		delete self._qeProjects[app.projects[i].path];
	}

	function toFileUrl(filePath) {
		if (filePath.match(/^[A-Z]:\\/i)) {

			filePath = '/' + filePath;
		}

		filePath = filePath.replace(/\\\\\?(\\UNC\\)?/, '');

		return "file:/" + "/" + encodeURI(filePath.replace(/\\/g, '/')).replace(/#/g, '%23');
	}

	self.getQeProject = function (path, openIfMissing) {
		if (toFileUrl(qe.project.path) === toFileUrl(path)) {
			self._qeProjects[path] = qe.project;
		}

		try {
			var testPath = self._qeProjects[path].path;
		} catch (e) {
			if (openIfMissing) {
				qe.open(path);
				self._qeProjects[path] = qe.project;
			} else {
				delete self._qeProjects[path];
			}
		}

		return self._qeProjects[path];
	}

})();

//
// mhac/events.jsx
//

(function mhac_events() {
	$.mhac.events = {
		_eventsBound: false,
		_lastSelectionIds: [],
		_eventsPausedUntil: 0,
		_lastProjectCount: 0,
	};

	var self = $.mhac.events;

	self.init = function() {
		if (!self._eventsBound) {

			app.bind('onProjectChanged', function(projectId) {
				if (!app.project || !app.project.activeSequence) return;

				$.mhac.events._onProjectChanged(projectId);
				$.mhac.events._onSelectionChanged();
			});

			app.bind('onActiveSequenceSelectionChanged', function() {
				if (!app.project || !app.project.activeSequence) return;

				$.mhac.events._onSelectionChanged();
			});

			app.bind('onActiveSequenceStructureChanged', function() {

			})

			self._eventsBound = true;
		}
	}

	self._onProjectChanged = function(projectId) {

		var project = app.project;

		if (project.documentID !== projectId) {
			var projectsWithId = [];

			var projs = []
			for (var i = 0; i < app.projects.length; i++) {
				projs.push(app.projects[i].documentID);
			}

			for (var i = 0; i < app.projects.length; i++) {
				if (app.projects[i].documentID !== projectId) continue;
				projectsWithId.push(app.projects[i]);
			}

			if (projectsWithId.length === 1) {
				project = projectsWithId[0];
			} else if (projectsWithId.length === 0) {
				throw new Error('Project not found.');
			} else if (projectsWithId.length > 1) {
				var paths = []

				for (var i = 0; i < projectsWithId.length; i++) {
					paths.push(projectsWithId[i].path);
				}

				throw new Error('You have opened multiple projects with the same ID\n\n' + paths.join('\n'));
			}
		}

		$.mhac.undoGroups.onProjectChanged(projectId, project);
		$.mhac.params.onProjectChanged(projectId, project);

		self.sendProjectChangedToJS();
	}

	self._onSelectionChanged = function() {
		try {
			if (self._eventsPausedUntil >= +new Date()) return;
			maybeFireOnProjectClosed();

			var seq = app.project.activeSequence;

			var sel = seq ? seq.getSelection() : [];
			var length = Math.min(10, sel.length);
			if (length == 0 && self._lastSelectionIds.length == 0) return;
			if (length == self._lastSelectionIds.length && sel[0].nodeId == self._lastSelectionIds[0]) {
				return;
			}

			self._lastSelectionIds = [];
			for (var i = 0; i < length; i++) {
				self._lastSelectionIds.push(sel[i].nodeId);
			}

			detectCorruptedClipsInSelection();
			self.sendSelectionToJS();
		} catch (ex) {
			console.log(ex);
		}
	}

	function maybeFireOnProjectClosed() {
		if (app.projects.numProjects < self._lastProjectCount) {
			$.mhac.undoGroups.onProjectClosed();
			$.mhac.params.onProjectClosed();
		}

		self._lastProjectCount = app.projects.numProjects
	}

	self.pauseEvents = function() {
		self._eventsPausedUntil = +new Date() + 8000;
	}

	self.unpauseEvents = function() {
		self._eventsPausedUntil = 0;
	}

	function detectCorruptedClipsInSelection() {
		var sel = app.project.activeSequence.getSelection();
		if ($.mhac.helpers.hasCorruptedClips(sel)) {
			var eventObj = new CSXSEvent();
			eventObj.type = 'mhac.selectionHasCorruptedClips';
			eventObj.data = '';
			eventObj.dispatch();
		}
	}

	var aegraphicRegex = /\.aegraphic$/;

	parseParamValues = function (clip) {
		var paramValues = [];

		try {
			var props = clip.getMGTComponent().properties

			for (var p = 0; p < props.numItems; p++) {
				var val = props[p].getValue();
				if (val >= 0x1000000000000) {
					try {
						var c = props[p].getColorValue();
						val = ('0' + c[1].toString(16)).slice(-2)
							+ ('0' + c[2].toString(16)).slice(-2)
							+ ('0' + c[3].toString(16)).slice(-2);
					} catch (ex) {
					}
				}
				paramValues.push(val);
			}
		} catch (ex) {
			paramValues = undefined;
		}

		return paramValues;
	}

	self.sendSelectionToJS = function() {
		var sel = app.project.activeSequence.getSelection();
		var ret = [];
		var selSize = Math.min(8, sel.length);

		for (var i = 0; i < selSize; i++) {
			var projItemPath = '';
			var paramValues = [];

			var selectedClip = sel[i];

			if (selectedClip.projectItem) projItemPath = selectedClip.projectItem.getMediaPath();
			if (projItemPath.match(aegraphicRegex)) {
				paramValues = parseParamValues(selectedClip)
			}

			ret.push({
				nodeId: selectedClip.nodeId,
				name: selectedClip.name,
				path: projItemPath,
				paramValues: paramValues,
				type: selectedClip.mediaType == 'Audio' ? 'audio' : 'video',
			});
		}

		var eventObj = new CSXSEvent();
		eventObj.type = 'mhac.selectionChanged';
		eventObj.data = JSON.stringify(ret);
		eventObj.dispatch();
	}

	self.sendProjectChangedToJS = function() {
		var eventObj = new CSXSEvent();
		eventObj.type = 'mhac.projectChanged';
		eventObj.dispatch();
	}

	self.init();
})();

//
// mhac/params.jsx
//

(function mhac_params() {
	$.mhac.params = {
		_lastIndex: {},
		_undoStack: [],
		_disableOnProjectChanged: false,
	};

	$.mhac.params._lastIndex[qe.project.path] = qe.project.undoStackIndex();

	var self = $.mhac.params;

	self.changeSelectionParams = function(clipUpdates, continuesLastUpdate) {
		compatibilityCheckClipEnd(clipUpdates)

		var sel = app.project.activeSequence.getSelection();
		var sequenceSettings = app.project.activeSequence.getSettings();
		var framerate = Math.round(1000 / sequenceSettings.videoFrameRate.seconds) / 1000;

		var nodeIdsOfInterest = {};
		for (var i = 0; i < clipUpdates.length; i++) nodeIdsOfInterest[clipUpdates[i].nodeId] = true

		var clipsByNodeId = {};
		for (var i = 0; i < sel.length; i++) {
			if (!nodeIdsOfInterest[sel[i].nodeId]) continue;
			clipsByNodeId[sel[i].nodeId] = sel[i]
		}

		prepareUndoStackForChanges(continuesLastUpdate, clipUpdates, clipsByNodeId);

		for (var i = 0; i < clipUpdates.length; i++) {
			var isLast = (i === (clipUpdates.length - 1))
			var upd = clipUpdates[i];
			var clip = clipsByNodeId[upd.nodeId];

			if (!clip) continue;

			if (typeof upd.value == 'object' && 'type' in upd.value) {
				switch (upd.value.type) {
					case "time":
						var meta = $.mhac.params.getMHPCMetaPropertyObject(clip);
						if (!meta) throw new Error('PLUGIN:' + "time operation not allowed");

						var totalDuration = meta.maxDur;
						var maxDuration = getVideoClipMaxDuration(app.project.activeSequence, clip);

						var inPointAdjustment = clip.inPoint.seconds;
						var outPointAdjustment = totalDuration > 0 ? totalDuration - clip.outPoint.seconds : 0;
						var clipDuration = upd.value.seconds - inPointAdjustment - outPointAdjustment;
						if (clipDuration <= 0) clipDuration = 1 / framerate;

						if (maxDuration !== -1 && maxDuration < clipDuration) {
							clipDuration = maxDuration
							upd.value.seconds = maxDuration + inPointAdjustment + outPointAdjustment
						}

						clip.getMGTComponent().properties[upd.paramIndex].setValue(upd.value.seconds, isLast);

						$.mhac.helpers.setClipEnd(clip, clip.start.seconds + clipDuration);
						break;

					default:
						throw new Error('PLUGIN:' + "invalid parameter type ("+upd.value.type+")");
				}
			} else
			if (typeof upd.value == 'object' && 'r' in upd.value) {
				clip.getMGTComponent().properties[upd.paramIndex].setColorValue(
					1, upd.value.r, upd.value.g, upd.value.b, isLast
				);
			} else {
				clip.getMGTComponent().properties[upd.paramIndex].setValue(upd.value, isLast);
			}

		}
	}

	function prepareUndoStackForChanges(continuesLastUpdate, clipUpdates, clipsByNodeId) {

		if (continuesLastUpdate && self._undoStack.length) {
			self._undoStack[self._undoStack.length - 1].valuesTo = clipUpdates;
		} else {
			var newUndoStack = [];
			var curIndex = qe.project.undoStackIndex();

			for (var i = 0; i < self._undoStack.length; i++) {
				var currentProject = self._undoStack[i].projPath === qe.project.path;
				if (!currentProject || self._undoStack[i].index <= curIndex) {
					newUndoStack.push(self._undoStack[i]);
				}
			}

			self._disableOnProjectChanged = true
			var acBin = $.mhac.project.getOrCreateACBin();
			acBin.renameBin(acBin.name);

			self._lastIndex[qe.project.path] = qe.project.undoStackIndex();

			newUndoStack.push({
				projPath: $.mhac.helpers.getActiveProject().path,
				seqId: app.project.activeSequence.sequenceID,
				index: self._lastIndex[qe.project.path],
				valuesFrom: getPrevValues(clipUpdates, clipsByNodeId),
				valuesTo: clipUpdates,
			})

			if (newUndoStack.length > 50) {
				newUndoStack = newUndoStack.slice(-50);
			}

			self._undoStack = newUndoStack;

			self._disableOnProjectChanged = false
		}
	}

	function getPrevValues(clipUpdates, clipsByNodeId) {
		var prevValues = [];

		for (var i = 0; i < clipUpdates.length; i++) {
			var upd = clipUpdates[i]
			var clip = clipsByNodeId[upd.nodeId];

			if (clip) {
				var prevVal
				if (typeof upd.value == 'object' && 'type' in upd.value) {
					switch (upd.value.type) {
						case "time":

							prevVal = {
								type: 'time',
								seconds: clip.getMGTComponent().properties[upd.paramIndex].getValue(),
							}
							break;
						default:
							throw new Error('PLUGIN:' + "Invalid update parameter type ("+upd.value.type+")");
					}
				} else
				if (typeof upd.value == 'object' && 'r' in upd.value) {
					var tmp = clip.getMGTComponent().properties[upd.paramIndex].getColorValue();
					prevVal = {
						r: tmp[1],
						g: tmp[2],
						b: tmp[3],
					};
				} else {
 					prevVal = clip.getMGTComponent().properties[upd.paramIndex].getValue()
				}

				prevValues.push({
					nodeId: upd.nodeId,
					paramIndex: upd.paramIndex,
					value: prevVal,
				})
			} else {
				prevValues.push(upd);
			}
		}

		return prevValues;
	}

	self.onProjectChanged = function(projectId, appProject) {
		var qeProject = $.mhac.undoGroups.getQeProject(appProject.path, true);
		var curIndex = qeProject.undoStackIndex();

		if (self._lastIndex[qeProject.path] == curIndex || self._disableOnProjectChanged) return;

		var paramsUpdated = false

		if (curIndex < self._lastIndex[qeProject.path]) {
			for (var i = self._undoStack.length - 1; i >= 0; i--) {
				var entry = self._undoStack[i]
				if (entry.index <= self._lastIndex[qeProject.path] && entry.index > curIndex && entry.projPath === appProject.path) {
					changeAnyParams(entry.projPath, entry.seqId, entry.valuesFrom, entry.index);
					paramsUpdated = true;

				}
			}
		} else if (curIndex > self._lastIndex[qeProject.path]) {
			for (var i = 0; i < self._undoStack.length; i++) {
				var entry = self._undoStack[i]
				if (entry.index > self._lastIndex[qeProject.path] && entry.index <= curIndex && entry.projPath === appProject.path) {
					changeAnyParams(entry.projPath, entry.seqId, entry.valuesTo, entry.index);
					paramsUpdated = true;

				}
			}
		}

		if (paramsUpdated) {
			var eventObj = new CSXSEvent();
			eventObj.type = 'mhac.paramChangedByUndoRedo';
			eventObj.data = '';
			eventObj.dispatch();
		}

		self._lastIndex[qeProject.path] = curIndex;
	}

	function changeAnyParams(projPath, seqId, clipUpdates, _dbgUndoIndex) {
		var proj, seq

		for (var i = 0; i < app.projects.numProjects; i++) {
			if (app.projects[i].path == projPath) {
				proj = app.projects[i];
				break;
			}
		}

		if (!proj) {
			return;
		}

		for (var i = 0; i < proj.sequences.numSequences; i++) {
			if (proj.sequences[i].sequenceID == seqId) {
				seq = proj.sequences[i];
				break;
			}
		}

		if (!seq) {
			return;
		}

		var nodeIdsOfInterest = {};
		for (var i = 0; i < clipUpdates.length; i++) nodeIdsOfInterest[clipUpdates[i].nodeId] = true

		var clipsByNodeId = {};
		for (var i = 0; i < seq.videoTracks.numTracks; i++) {
			var track = seq.videoTracks[i];

			for (var j = 0; j < track.clips.numItems; j++) {
				if (!nodeIdsOfInterest[track.clips[j].nodeId]) continue;
				clipsByNodeId[track.clips[j].nodeId] = track.clips[j];
			}
		}

		var sequenceSettings = seq.getSettings();
		var framerate = Math.round(1000 / sequenceSettings.videoFrameRate.seconds) / 1000;

		for (var i = 0; i < clipUpdates.length; i++) {
			var isLast = (i === (clipUpdates.length - 1))
			var upd = clipUpdates[i];
			var clip = clipsByNodeId[upd.nodeId];
			if (!clip) continue;

			if (typeof upd.value == 'object' && 'type' in upd.value) {
				switch (upd.value.type) {
					case "time":
						var meta = $.mhac.params.getMHPCMetaPropertyObject(clip);
						if (!meta) throw new Error('PLUGIN:' + "time operation not allowed");

						var totalDuration = meta.maxDur;
						var maxDuration = getVideoClipMaxDuration(app.project.activeSequence, clip);

						var inPointAdjustment = clip.inPoint.seconds;
						var outPointAdjustment = totalDuration > 0 ? totalDuration - clip.outPoint.seconds : 0;
						var clipDuration = upd.value.seconds - inPointAdjustment - outPointAdjustment;
						if (clipDuration <= 0) clipDuration = 1 / framerate;

						if (maxDuration !== -1 && maxDuration < clipDuration) {
							clipDuration = maxDuration
							upd.value.seconds = maxDuration + inPointAdjustment + outPointAdjustment
						}

						clip.getMGTComponent().properties[upd.paramIndex].setValue(upd.value.seconds, isLast);

						$.mhac.helpers.setClipEnd(clip, clip.start.seconds + clipDuration);
						break;
					default:
						throw new Error('PLUGIN:' + "invalid parameter type ("+upd.value.type+")");
				}
			} else
			if (typeof upd.value == 'object' && 'r' in upd.value) {
				clip.getMGTComponent().properties[upd.paramIndex].setColorValue(
					1, upd.value.r, upd.value.g, upd.value.b, isLast
				);
			} else {
				clip.getMGTComponent().properties[upd.paramIndex].setValue(upd.value, isLast);
			}
		}
	}

	self.onProjectClosed = function() {

		var projPathDict = {};

		for (var i = 0; i < app.projects.numProjects; i++) {
			projPathDict[app.projects[i].path] = true;
		}

		var newStack = [];
		for (var i = 0; i < self._undoStack.length; i++) {
			if (projPathDict[self._undoStack[i].projPath]) {
				newStack.push(self._undoStack[i]);
			}
		}

		self._undoStack = newStack;
	}

	self.getMGTProperty = function (clip, propertyName) {
		if (clip == null) return null;
		if (clip.getMGTComponent() == null) return null;

		var properties = clip.getMGTComponent().properties;
		for (var i = 0; i < properties.length; i++) {
			if (properties[i].displayName === propertyName) return properties[i];
		}
		return null;
	}

	self.getSequenceInfo = function () {
		var sequence = app.project.activeSequence;
		if (!sequence) return JSON.stringify(null)
		var sequenceSettings = sequence.getSettings();

		var framerate = Math.round(1000 / sequenceSettings.videoFrameRate.seconds) / 1000;

		return JSON.stringify({
			framerate: framerate,
			width: sequenceSettings.videoFrameWidth,
			height: sequenceSettings.videoFrameHeight
		});
	}

	function compatibilityCheckClipEnd(clipUpdates) {
		if (!app.version.match(/^22\.1\./)) return;

		for (var i = 0; i < clipUpdates.length; i++) {
			var upd = clipUpdates[i];
			if (typeof upd.value == 'object' && 'type' in upd.value && upd.value.type === "time") {
				$.mhac.helpers.throwMogrtIncompatible();
			}
		}
	}

	self.getMHPCMetaPropertyObject = function (clip) {
		var property = this.getMGTProperty(clip, "mhpc-meta");
		if (!property) return null;

		try {
			var metaBase64 = property.getValue();
			var metaJson = $.base64.atob(metaBase64);
			var metaObject = JSON.parse(metaJson);
			return metaObject;
		} catch (e) {
			console.log(e)
			throw new Error('PLUGIN:' + "Invalid item metadata!");
		}
	}

	function getVideoClipMaxDuration(sequence, clip) {
		var clipLocation = $.mhac.helpers.getClipTimelineLocation(sequence, clip.nodeId);
		var videoTrack = sequence.videoTracks[clipLocation.track];

		if (videoTrack.clips.length === (clipLocation.clip + 1)) return -1;
		return videoTrack.clips[clipLocation.clip + 1].start.seconds - clip.start.seconds;
	}

})();

//
// mhac/timeUtils.jsx
//

(function mhac_timeUtils() {
	$.mhac.timeUtils = {};

	var self = $.mhac.timeUtils;

	self.convertTicksToSeconds = function(ticks) {
		var timeConvert = new Time();
		timeConvert.ticks = ticks.toString();
		return timeConvert.seconds;
	}

	self.convertSecondsToTicks = function(seconds) {
		var timeConvert = new Time();
		timeConvert.seconds = seconds;
		return parseInt(timeConvert.ticks);
	}

	self.convertSecondsToTime = function(seconds) {
		var timeConvert = new Time();
		timeConvert.seconds = seconds;
		return timeConvert;
	}

	self.convertTicksToTime = function(ticks) {
		var timeConvert = new Time();
		timeConvert.ticks = ticks.toString();
		return timeConvert;
	}

	self.convertSecondsToString = function(seconds, sequence) {
		var timeConvert = new Time();
		if (!sequence) sequence = app.project.activeSequence;
		if (!seconds || seconds.length == 0) seconds = 0;
		if (typeof seconds == "string") seconds = parseFloat(seconds);
		timeConvert.seconds = seconds;
		return timeConvert.getFormatted(sequence.getSettings().videoFrameRate, sequence.videoDisplayFormat);
	}

	self.convertTicksToString = function(ticks, sequence) {
		var timeConvert = new Time();
		if (!sequence) sequence = app.project.activeSequence;
		if (!ticks || ticks.length == 0) ticks = "0";
		timeConvert.ticks = ticks.toString();
		return timeConvert.getFormatted(sequence.getSettings().videoFrameRate, sequence.videoDisplayFormat);
	}

	self.convertTimeToString = function(time, sequence) {
		if (!sequence) sequence = app.project.activeSequence;
		return time.getFormatted(sequence.getSettings().videoFrameRate, sequence.videoDisplayFormat);
	}

	self.convertStringToFrames = function(timeString, aTimeScale, fps, throwOnInvalidInput) {

		if (aTimeScale == 0)
			throw Error("Time scale cannot be 0");

		if (fps == 0)
			throw Error("fps cannot be 0");

		var resultFrames = 0;

		var isInputDropframe = false;
		if (timeString.indexOf(0, ";") > -1) isInputDropframe = true;

		const re = /\s*[:;.]\s*/
		const timeTokens = timeString.split(re)

		if (timeTokens.length > 4)
		{
			if (throwOnInvalidInput) {
				throw new Error("Invalid input: invalid num of time tokens ("+ timeTokens.length +")");
				throw InvalidInputException(EStr("invalid num of time tokens"), String(timeTokens.size()));
			} else {
				return 0;
			}
		}

		var negativeValue = false;

		for (var i = 0; i < timeTokens.length; i++)
		{
			var testString = timeTokens[i];
			if (i == 0)
			{
				if (testString.indexOf("-") > -1)
					negativeValue = true;
			}

			if (testString.replace(/[-\d]/g,'').length > 0)
			{
				if (throwOnInvalidInput) {
					throw new Error("Invalid input: invalid time token string ("+ testString + ")");

				}
				else {
					return 0;
				}
			}
		}

		var hours = 0;
		var minutes = 0;
		var seconds = 0;
		var frames = 0;

		if (timeTokens.length == 1)
		{
			frames = timeTokens[0].toInteger();
			return frames;
		}

		var tokenIndex = timeTokens.size() - 1;

		if (tokenIndex >= 0) {
			frames = timeTokens[tokenIndex].toInteger();
			tokenIndex--;
		}

		if (tokenIndex >= 0) {
			seconds = timeTokens[tokenIndex].toInteger();
			tokenIndex--;
		}

		if (tokenIndex >= 0) {
			minutes = timeTokens[tokenIndex].toInteger();
			tokenIndex--;
		}

		if (tokenIndex >= 0) {
			hours = timeTokens[tokenIndex].toInteger();
		}

		if (hours < 0) {
			hours *= -1;
			negativeValue = true;
		}

		if (minutes < 0) {
			minutes *= -1;
			negativeValue = true;
		}

		if (seconds < 0) {
			seconds *= -1;
			negativeValue = true;
		}

		if (frames < 0) {
			frames *= -1;
			negativeValue = true;
		}

		var frameCount = frames;
		frameCount += seconds * fpsBase;
		frameCount += minutes * 60 * fpsBase;
		frameCount += hours * 3600 * fpsBase;

		if (isInputDropframe) {
			frameCount = this.dropframeToNormalFrame(frameCount, fpsBase);
		}

		 var timeVal = frameCount / fps;

		if (negativeValue) {
			timeVal *= -1;
		}

		return resultFrames;
	}

	self.getCurrentClipsDurations = function () {
		var sel = app.project.activeSequence.getSelection();
		var result = {}

		for (var i = 0; i < sel.length; i++) {
			var durationTime = sel[i].duration;

			var meta = $.mhac.params.getMHPCMetaPropertyObject(sel[i]);

			var mogrtPropertyValue = null
			var mogrtTotalDuration = meta && meta.maxDur ? meta.maxDur : 0

			if (sel[i] && sel[i].getMGTComponent()) {
				var mogrt = sel[i].getMGTComponent().properties;
				for(var j = 0; j < mogrt.length; j++) {
					switch (mogrt[j].displayName) {
						case "Duration":
							mogrtPropertyValue = mogrt[j].getValue()
							break;
					}
				}
			}

			var TIMEDISPLAY_Frames = 109;
			var currentSeqSettings = app.project.activeSequence.getSettings();

			var timeObject = {
				seconds: durationTime.seconds,
				ticks: durationTime.ticks,
				frames: parseInt(durationTime.getFormatted(currentSeqSettings.videoFrameRate, TIMEDISPLAY_Frames)),
				text: durationTime.getFormatted(currentSeqSettings.videoFrameRate, app.project.activeSequence.videoDisplayFormat),
			}

			result[sel[i].nodeId] = {
				time: timeObject,
				text: self.convertTimeToString(durationTime),
				mogrt: mogrtPropertyValue,
				inPoint: sel[i].inPoint.seconds,
				outPoint: sel[i].outPoint.seconds,
				totalDuration: mogrtTotalDuration,
			}
		}

		return JSON.stringify(result);
	}

	self.alignClipEndsToPlayhead = function (param) {
		var playhead = app.project.activeSequence.getPlayerPosition();
		var sel = app.project.activeSequence.getSelection();

		var clipsByNodeId = {};
		for (var i = 0; i < sel.length; i++) {
			clipsByNodeId[sel[i].nodeId] = sel[i]
		}

		var clipUpdates = [];

		for (var i = 0; i < param.clips.length; i++) {
			var paramClip = param.clips[i];
			var nodeId = paramClip.clip.nodeId;
			if (!clipsByNodeId[nodeId]) continue;

			var clip = clipsByNodeId[nodeId];

			var meta = $.mhac.params.getMHPCMetaPropertyObject(clip);
			if (!meta) throw new Error('PLUGIN:' + "time operation not allowed");

			var totalDuration = meta.maxDur;

			var inPointAdjustment = clip.inPoint.seconds;
			var outPointAdjustment = totalDuration - clip.outPoint.seconds;
			var diffSeconds = inPointAdjustment + ( playhead.seconds - clip.start.seconds ) + outPointAdjustment;

			clipUpdates.push({
				nodeId: paramClip.clip.nodeId,
				paramIndex: paramClip.controlIndex,
				value: { type: "time", seconds: diffSeconds },
			});
		}

		if (clipUpdates.length) {
			$.mhac.params.changeSelectionParams(clipUpdates, false);
		}

		return JSON.stringify(clipUpdates)
	}

})();
