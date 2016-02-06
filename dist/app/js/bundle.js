(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Controller = function Controller(devtool) {
  _classCallCheck(this, Controller);

  this.devtool = devtool;
  var g = devtool.game;
  var debugUi = devtool.debugUi;
  // 制御画面
  var toggle = devtool.toggleGame();

  var controllerData = [
  //　ゲームプレイ
  {
    name: 'play',
    func: function func() {
      this.attr('class', toggle.next(false).value);
    }
  }];

  var controller = debugUi.append('div').attr('id', 'control').classed('controller', true);
  var buttons = controller.selectAll('button').data(controllerData).enter().append('button');
  buttons.attr('class', function (d) {
    return d.name;
  });

  buttons.on('click', function (d) {
    d.func.apply(d3.select(this));
  });

  controller.append('span').text('ステージ').style({ 'width': '100px', 'display': 'inline-block', 'text-align': 'center' });

  var stage = controller.append('input').attr({ 'type': 'text', 'value': g.stage.no }).style({ 'width': '40px', 'text-align': 'right' });
  g.stage.on('update', function (d) {
    stage.node().value = d.no;
  });

  stage.on('change', function () {
    var v = parseInt(this.value);
    if (g.stage.no != v) {
      g.stage.jump(v);
    }
  });
};

exports.default = Controller;

},{}],2:[function(require,module,exports){
"use strict";
//var STAGE_MAX = 1;

var _global = require('../../js/global');

var sfg = _interopRequireWildcard(_global);

var _util = require('../../js/util');

var util = _interopRequireWildcard(_util);

var _audio = require('../../js/audio');

var audio = _interopRequireWildcard(_audio);

var _graphics = require('../../js/graphics');

var graphics = _interopRequireWildcard(_graphics);

var _io = require('../../js/io');

var io = _interopRequireWildcard(_io);

var _comm = require('../../js/comm');

var comm = _interopRequireWildcard(_comm);

var _text = require('../../js/text');

var text = _interopRequireWildcard(_text);

var _gameobj = require('../../js/gameobj');

var gameobj = _interopRequireWildcard(_gameobj);

var _myship = require('../../js/myship');

var myship = _interopRequireWildcard(_myship);

var _enemies = require('../../js/enemies');

var enemies = _interopRequireWildcard(_enemies);

var _effectobj = require('../../js/effectobj');

var effectobj = _interopRequireWildcard(_effectobj);

var _devtool = require('./devtool');

var _game = require('../../js/game');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/// メイン

//import * as song from './song';
window.onload = function () {
  sfg.game = new _game.Game();
  sfg.devTool = new _devtool.DevTool(sfg.game);
  sfg.game.exec();
};

},{"../../js/audio":5,"../../js/comm":6,"../../js/effectobj":7,"../../js/enemies":8,"../../js/game":10,"../../js/gameobj":11,"../../js/global":12,"../../js/graphics":13,"../../js/io":14,"../../js/myship":15,"../../js/text":16,"../../js/util":17,"./devtool":3}],3:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DevTool = undefined;

var _global = require('../../js/global');

var sfg = _interopRequireWildcard(_global);

var _audio = require('../../js/audio');

var audio = _interopRequireWildcard(_audio);

var _controller = require('./controller');

var _controller2 = _interopRequireDefault(_controller);

var _enemyEditor = require('./enemyEditor');

var _enemyEditor2 = _interopRequireDefault(_enemyEditor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DevTool = exports.DevTool = function () {
  function DevTool(game) {
    var _this = this;

    _classCallCheck(this, DevTool);

    this.game = game;
    //    this.status = DevTool.STATUS.STOP;
    this.keydown = this.keydown_();
    this.keydown.next();
    d3.select('body').on('keydown.DevTool', function () {
      var e = d3.event;
      if (_this.keydown.next(e).value) {
        d3.event.preventDefault();
        d3.event.cancelBubble = true;
        return false;
      };
    });

    var this_ = this;
    var initConsole = game.initConsole;
    game.initConsole = function () {
      initConsole.apply(game, ['console-debug']);
      this_.initConsole();
      d3.select('#console').attr('tabIndex', 1);
    }.bind(game);

    game.basicInput.bind = function () {
      d3.select('#console').on('keydown.basicInput', game.basicInput.keydown.bind(game.basicInput));
      d3.select('#console').on('keyup.basicInput', game.basicInput.keyup.bind(game.basicInput));
    };

    game.basicInput.unbind = function () {
      d3.select('#console').on('keydown.basicInput', null);
      d3.select('#console').on('keyup.basicInput', null);
    };

    game.gameInit = function* (taskIndex) {
      taskIndex = yield;

      // オーディオの開始
      this.audio_.start();
      this.sequencer.load(audio.seqData);
      this.sequencer.start();
      //sfg.stage.reset();
      this.textPlane.cls();
      this.enemies.reset();

      // 自機の初期化
      this.myship_.init();
      sfg.gameTimer.start();
      this.score = 0;
      this.textPlane.print(2, 0, 'Score    High Score');
      this.textPlane.print(20, 39, 'Rest:   ' + sfg.myship_.rest);
      this.printScore();
      this.tasks.setNextTask(taskIndex, this.stageInit.bind(this) /*gameAction*/);
    };
    game.init = function* (taskIndex) {
      taskIndex = yield;
      this.init_();
    }.bind(game);
  }

  _createClass(DevTool, [{
    key: 'keydown_',
    value: function* keydown_() {
      var e = yield;
      while (true) {
        var process = false;
        if (e.keyCode == 192) {
          // @ Key
          sfg.CHECK_COLLISION = !sfg.CHECK_COLLISION;
          process = true;
        };

        // if (e.keyCode == 80 /* P */) {
        //   if (!sfg.pause) {
        //     this.game.pause();
        //   } else {
        //     this.game.resume();
        //   }
        //   process = true;
        // }

        if (e.keyCode == 88 /* X */ && sfg.DEBUG) {
          if (!sfg.pause) {
            this.game.pause();
          } else {
            this.game.resume();
          }
          process = true;
        }
        e = yield process;
      }
    }

    //

  }, {
    key: 'initConsole',
    value: function initConsole() {
      // Stats オブジェクト(FPS表示)の作成表示
      var g = this.game;
      var this_ = this;
      g.stats = new Stats();
      g.stats.domElement.style.position = 'absolute';
      g.stats.domElement.style.top = '0px';
      g.stats.domElement.style.left = '0px';
      g.stats.domElement.style.left = parseFloat(g.renderer.domElement.style.left) - parseFloat(g.stats.domElement.style.width) + 'px';

      var debugUi = this.debugUi = d3.select('#content').append('div').attr('class', 'devtool').style('height', g.CONSOLE_HEIGHT + 'px');
      debugUi.node().appendChild(g.stats.domElement);

      // タブ設定
      var menu = debugUi.append('ul').classed('menu', true);
      menu.selectAll('li').data([{ name: '制御', id: '#control', editor: _controller2.default }, { name: '敵', id: '#enemy', editor: _enemyEditor2.default } /*,{name:'音源',id:'#audio'},{name:'画像',id:'#graphics'}*/]).enter().append('li').text(function (d) {
        return d.name;
      }).on('click', function (d, i) {
        var self = this;
        menu.selectAll('li').each(function (d, idx) {
          if (self == this) {
            d3.select(this).classed('active', true);
            d3.select(d.id).style('display', 'block');
          } else {
            d3.select(this).classed('active', false);
            d3.select(d.id).style('display', 'none');
          }
        });
      }).each(function (d, i) {
        if (!i) {
          d3.select(this).classed('active', true);
          d3.select(d.id).style('display', 'block');
        }
        d.inst = new d.editor(this_);
      });
    }
  }, {
    key: 'toggleGame',
    value: function* toggleGame() {
      var _this2 = this;

      // 開始処理
      var cancel = false;

      var _loop = function* _loop() {
        var g = _this2.game;
        g.tasks.pushTask(g.basicInput.update.bind(g.basicInput));
        g.basicInput.bind();
        g.tasks.pushTask(g.render.bind(g), g.RENDERER_PRIORITY);
        g.tasks.pushTask(g.gameInit.bind(g));

        if (g.spaceField) {
          g.tasks.pushTask(g.moveSpaceField.bind(g));
        } else {
          g.showSpaceField();
        }

        if (!g.tasks.enable) {
          g.tasks.enable = true;
          g.main();
        }

        cancel = yield 'stop';
        if (cancel) return 'break';

        // 停止処理

        // 画面消去
        if (g.tasks.enable) {
          g.tasks.stopProcess().then(function () {
            g.enemies.reset();
            g.enemyBullets.reset();
            g.bombs.reset();
            g.myship_.reset();
            g.tasks.clear();
            g.textPlane.cls();
            g.renderer.clear();
            g.sequencer.stop();
            g.basicInput.unbind();
          });
        }
        cancel = yield 'play';
      };

      while (!cancel) {
        var _ret = yield* _loop();

        if (_ret === 'break') break;
      }
    }
  }]);

  return DevTool;
}();

},{"../../js/audio":5,"../../js/global":12,"./controller":1,"./enemyEditor":4}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EnemyEditor = function EnemyEditor(devTool) {
  _classCallCheck(this, EnemyEditor);

  this.devTool = devTool;
  // 敵
  devTool.debugUi.append('div').attr('id', 'enemy').text('enemy').style('display', 'none');
};

exports.default = EnemyEditor;

},{}],5:[function(require,module,exports){
/// <reference path="graphics.js" />
/// <reference path="io.js" />
/// <reference path="song.js" />
/// <reference path="text.js" />
/// <reference path="util.js" />
/// <reference path="dsp.js" />
"use strict";
//// Web Audio API ラッパークラス ////

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.decodeStr = decodeStr;
exports.WaveSample = WaveSample;
exports.createWaveSampleFromWaves = createWaveSampleFromWaves;
exports.WaveTexture = WaveTexture;
exports.EnvelopeGenerator = EnvelopeGenerator;
exports.Voice = Voice;
exports.Audio = Audio;
exports.Note = Note;
exports.Sequencer = Sequencer;
exports.SoundEffects = SoundEffects;
var fft = new FFT(4096, 44100);
var BUFFER_SIZE = 1024;
var TIME_BASE = 96;

var noteFreq = [];
for (var i = -81; i < 46; ++i) {
  noteFreq.push(Math.pow(2, i / 12));
}

var SquareWave = {
  bits: 4,
  wavedata: [0xf, 0xf, 0xf, 0xf, 0xf, 0xf, 0xf, 0xf, 0, 0, 0, 0, 0, 0, 0, 0]
}; // 4bit wave form

var SawWave = {
  bits: 4,
  wavedata: [0x0, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa, 0xb, 0xc, 0xd, 0xe, 0xf]
}; // 4bit wave form

var TriWave = {
  bits: 4,
  wavedata: [0x0, 0x2, 0x4, 0x6, 0x8, 0xA, 0xC, 0xE, 0xF, 0xE, 0xC, 0xA, 0x8, 0x6, 0x4, 0x2]
};

function decodeStr(bits, wavestr) {
  var arr = [];
  var n = bits / 4 | 0;
  var c = 0;
  var zeropos = 1 << bits - 1;
  while (c < wavestr.length) {
    var d = 0;
    for (var i = 0; i < n; ++i) {
      eval("d = (d << 4) + 0x" + wavestr.charAt(c++) + ";");
    }
    arr.push((d - zeropos) / zeropos);
  }
  return arr;
}

var waves = [decodeStr(4, 'EEEEEEEEEEEEEEEE0000000000000000'), decodeStr(4, '00112233445566778899AABBCCDDEEFF'), decodeStr(4, '023466459AA8A7A977965656ACAACDEF'), decodeStr(4, 'BDCDCA999ACDCDB94212367776321247'), decodeStr(4, '7ACDEDCA742101247BDEDB7320137E78'), decodeStr(4, 'ACCA779BDEDA66679994101267742247'), decodeStr(4, '7EC9CEA7CFD8AB728D94572038513531'), decodeStr(4, 'EE77EE77EE77EE770077007700770077'), decodeStr(4, 'EEEE8888888888880000888888888888') //ノイズ用のダミー波形
];

var waveSamples = [];
function WaveSample(audioctx, ch, sampleLength, sampleRate) {

  this.sample = audioctx.createBuffer(ch, sampleLength, sampleRate || audioctx.sampleRate);
  this.loop = false;
  this.start = 0;
  this.end = (sampleLength - 1) / (sampleRate || audioctx.sampleRate);
}

function createWaveSampleFromWaves(audioctx, sampleLength) {
  for (var i = 0, end = waves.length; i < end; ++i) {
    var sample = new WaveSample(audioctx, 1, sampleLength);
    waveSamples.push(sample);
    if (i != 8) {
      var wavedata = waves[i];
      var delta = 440.0 * wavedata.length / audioctx.sampleRate;
      var stime = 0;
      var output = sample.sample.getChannelData(0);
      var len = wavedata.length;
      var index = 0;
      var endsample = 0;
      for (var j = 0; j < sampleLength; ++j) {
        index = stime | 0;
        output[j] = wavedata[index];
        stime += delta;
        if (stime >= len) {
          stime = stime - len;
          endsample = j;
        }
      }
      sample.end = endsample / audioctx.sampleRate;
      sample.loop = true;
    } else {
      // ボイス8はノイズ波形とする
      var output = sample.sample.getChannelData(0);
      for (var j = 0; j < sampleLength; ++j) {
        output[j] = Math.random() * 2.0 - 1.0;
      }
      sample.end = sampleLength / audioctx.sampleRate;
      sample.loop = true;
    }
  }
}

function WaveTexture(wave) {
  this.wave = wave || waves[0];
  this.tex = new CanvasTexture(320, 10 * 16);
  this.render();
}

WaveTexture.prototype = {
  render: function render() {
    var ctx = this.tex.ctx;
    var wave = this.wave;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.beginPath();
    ctx.strokeStyle = 'white';
    for (var i = 0; i < 320; i += 10) {
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 255);
    }
    for (var i = 0; i < 160; i += 10) {
      ctx.moveTo(0, i);
      ctx.lineTo(320, i);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.stroke();
    for (var i = 0, c = 0; i < ctx.canvas.width; i += 10, ++c) {
      ctx.fillRect(i, wave[c] > 0 ? 80 - wave[c] * 80 : 80, 10, Math.abs(wave[c]) * 80);
    }
    this.tex.texture.needsUpdate = true;
  }
};

/// エンベロープジェネレーター
function EnvelopeGenerator(voice, attack, decay, sustain, release) {
  this.voice = voice;
  //this.keyon = false;
  this.attack = attack || 0.0005;
  this.decay = decay || 0.05;
  this.sustain = sustain || 0.5;
  this.release = release || 0.5;
  this.v = 1.0;
};

EnvelopeGenerator.prototype = {
  keyon: function keyon(t, vel) {
    this.v = vel || 1.0;
    var v = this.v;
    var t0 = t || this.voice.audioctx.currentTime;
    var t1 = t0 + this.attack * v;
    var gain = this.voice.gain.gain;
    gain.cancelScheduledValues(t0);
    gain.setValueAtTime(0, t0);
    gain.linearRampToValueAtTime(v, t1);
    gain.linearRampToValueAtTime(this.sustain * v, t0 + this.decay / v);
    //gain.setTargetAtTime(this.sustain * v, t1, t1 + this.decay / v);
  },
  keyoff: function keyoff(t) {
    var voice = this.voice;
    var gain = voice.gain.gain;
    var t0 = t || voice.audioctx.currentTime;
    gain.cancelScheduledValues(t0);
    //gain.setValueAtTime(0, t0 + this.release / this.v);
    //gain.setTargetAtTime(0, t0, t0 + this.release / this.v);
    gain.linearRampToValueAtTime(0, t0 + this.release / this.v);
  }
};

/// ボイス
function Voice(audioctx) {
  this.audioctx = audioctx;
  this.sample = waveSamples[6];
  this.gain = audioctx.createGain();
  this.gain.gain.value = 0.0;
  this.volume = audioctx.createGain();
  this.envelope = new EnvelopeGenerator(this);
  this.initProcessor();
  this.detune = 1.0;
  this.volume.gain.value = 1.0;
  this.gain.connect(this.volume);
  this.output = this.volume;
};

Voice.prototype = {
  initProcessor: function initProcessor() {
    this.processor = this.audioctx.createBufferSource();
    this.processor.buffer = this.sample.sample;
    this.processor.loop = this.sample.loop;
    this.processor.loopStart = 0;
    this.processor.playbackRate.value = 1.0;
    this.processor.loopEnd = this.sample.end;
    this.processor.connect(this.gain);
  },

  setSample: function setSample(sample) {
    this.envelope.keyoff(0);
    this.processor.disconnect(this.gain);
    this.sample = sample;
    this.initProcessor();
    this.processor.start();
  },
  start: function start(startTime) {
    //   if (this.processor.playbackState == 3) {
    this.processor.disconnect(this.gain);
    this.initProcessor();
    //    } else {
    //      this.envelope.keyoff();
    //
    //    }
    this.processor.start(startTime);
  },
  stop: function stop(time) {
    this.processor.stop(time);
    this.reset();
  },
  keyon: function keyon(t, note, vel) {
    this.processor.playbackRate.setValueAtTime(noteFreq[note] * this.detune, t);
    this.envelope.keyon(t, vel);
  },
  keyoff: function keyoff(t) {
    this.envelope.keyoff(t);
  },
  reset: function reset() {
    this.processor.playbackRate.cancelScheduledValues(0);
    this.gain.gain.cancelScheduledValues(0);
    this.gain.gain.value = 0;
  }
};

function Audio() {
  this.enable = false;
  this.audioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;

  if (this.audioContext) {
    this.audioctx = new this.audioContext();
    this.enable = true;
  }

  this.voices = [];
  if (this.enable) {
    createWaveSampleFromWaves(this.audioctx, BUFFER_SIZE);
    this.filter = this.audioctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 20000;
    this.filter.Q.value = 0.0001;
    this.noiseFilter = this.audioctx.createBiquadFilter();
    this.noiseFilter.type = 'lowpass';
    this.noiseFilter.frequency.value = 1000;
    this.noiseFilter.Q.value = 1.8;
    this.comp = this.audioctx.createDynamicsCompressor();
    this.filter.connect(this.comp);
    this.noiseFilter.connect(this.comp);
    this.comp.connect(this.audioctx.destination);
    for (var i = 0, end = this.VOICES; i < end; ++i) {
      var v = new Voice(this.audioctx);
      this.voices.push(v);
      if (i == this.VOICES - 1) {
        v.output.connect(this.noiseFilter);
      } else {
        v.output.connect(this.filter);
      }
    }
    //  this.started = false;

    //this.voices[0].output.connect();
  }
}

Audio.prototype = {
  start: function start() {
    //  if (this.started) return;

    var voices = this.voices;
    for (var i = 0, end = voices.length; i < end; ++i) {
      voices[i].start(0);
    }
    //this.started = true;
  },
  stop: function stop() {
    //if(this.started)
    //{
    var voices = this.voices;
    for (var i = 0, end = voices.length; i < end; ++i) {
      voices[i].stop(0);
    }
    //  this.started = false;
    //}
  },
  VOICES: 12
};

/**********************************************/
/* シーケンサーコマンド                       */
/**********************************************/

function Note(no, name) {
  this.no = no;
  this.name = name;
}

Note.prototype = {
  process: function process(track) {
    var back = track.back;
    var note = this;
    var oct = this.oct || back.oct;
    var step = this.step || back.step;
    var gate = this.gate || back.gate;
    var vel = this.vel || back.vel;
    setQueue(track, note, oct, step, gate, vel);
  }
};

var C = new Note(0, 'C '),
    Db = new Note(1, 'Db'),
    D = new Note(2, 'D '),
    Eb = new Note(3, 'Eb'),
    E = new Note(4, 'E '),
    F = new Note(5, 'F '),
    Gb = new Note(6, 'Gb'),
    G = new Note(7, 'G '),
    Ab = new Note(8, 'Ab'),
    A = new Note(9, 'A '),
    Bb = new Note(10, 'Bb'),
    B = new Note(11, 'B ');

// R = new Rest();

function SeqData(note, oct, step, gate, vel) {
  this.note = note;
  this.oct = oct;
  //this.no = note.no + oct * 12;
  this.step = step;
  this.gate = gate;
  this.vel = vel;
}

function setQueue(track, note, oct, step, gate, vel) {
  var no = note.no + oct * 12;
  var step_time = track.playingTime;
  var gate_time = (gate >= 0 ? gate * 60 : step * gate * 60 * -1.0) / (TIME_BASE * track.localTempo) + track.playingTime;
  var voice = track.audio.voices[track.channel];
  //console.log(track.sequencer.tempo);
  voice.keyon(step_time, no, vel);
  voice.keyoff(gate_time);
  track.playingTime = step * 60 / (TIME_BASE * track.localTempo) + track.playingTime;
  var back = track.back;
  back.note = note;
  back.oct = oct;
  back.step = step;
  back.gate = gate;
  back.vel = vel;
}

SeqData.prototype = {
  process: function process(track) {

    var back = track.back;
    var note = this.note || back.note;
    var oct = this.oct || back.oct;
    var step = this.step || back.step;
    var gate = this.gate || back.gate;
    var vel = this.vel || back.vel;
    setQueue(track, note, oct, step, gate, vel);
  }
};

function S(note, oct, step, gate, vel) {
  var args = Array.prototype.slice.call(arguments);
  if (S.length != args.length) {
    if (_typeof(args[args.length - 1]) == 'object' && !(args[args.length - 1] instanceof Note)) {
      var args1 = args[args.length - 1];
      var l = args.length - 1;
      return new SeqData((l != 0 ? note : false) || args1.note || args1.n || null, (l != 1 ? oct : false) || args1.oct || args1.o || null, (l != 2 ? step : false) || args1.step || args1.s || null, (l != 3 ? gate : false) || args1.gate || args1.g || null, (l != 4 ? vel : false) || args1.vel || args1.v || null);
    }
  }
  return new SeqData(note || null, oct || null, step || null, gate || null, vel || null);
}

function S1(note, oct, step, gate, vel) {
  return S(note, oct, l(step), gate, vel);
}

function S2(note, len, dot, oct, gate, vel) {
  return S(note, oct, l(len, dot), gate, vel);
}

function S3(note, step, gate, vel, oct) {
  return S(note, oct, step, gate, vel);
}

/// 音符の長さ指定

function l(len, dot) {
  var d = false;
  if (dot) d = dot;
  return TIME_BASE * (4 + (d ? 2 : 0)) / len;
}

function Step(step) {
  this.step = step;
}

Step.prototype.process = function (track) {
  track.back.step = this.step;
};

function ST(step) {
  return new Step(step);
}

function L(len, dot) {
  return new Step(l(len, dot));
}

/// ゲートタイム指定

function GateTime(gate) {
  this.gate = gate;
}

GateTime.prototype.process = function (track) {
  track.back.gate = this.gate;
};

function GT(gate) {
  return new GateTime(gate);
}

/// ベロシティ指定

function Velocity(vel) {
  this.vel = vel;
}

Velocity.prototype.process = function (track) {
  track.back.vel = this.vel;
};

function V(vel) {
  return new Velocity(vel);
}

function Jump(pos) {
  this.pos = pos;
};
Jump.prototype.process = function (track) {
  track.seqPos = this.pos;
};

/// 音色設定
function Tone(no) {
  this.no = no;
  //this.sample = waveSamples[this.no];
}

Tone.prototype = {
  process: function process(track) {
    track.audio.voices[track.channel].setSample(waveSamples[this.no]);
  }
};
function TONE(no) {
  return new Tone(no);
}

function JUMP(pos) {
  return new Jump(pos);
}

function Rest(step) {
  this.step = step;
}

Rest.prototype.process = function (track) {
  var step = this.step || track.back.step;
  track.playingTime = track.playingTime + this.step * 60 / (TIME_BASE * track.localTempo);
  track.back.step = this.step;
};

function R1(step) {
  return new Rest(step);
}
function R(len, dot) {
  return new Rest(l(len, dot));
}

function Octave(oct) {
  this.oct = oct;
}
Octave.prototype.process = function (track) {
  track.back.oct = this.oct;
};

function O(oct) {
  return new Octave(oct);
}

function OctaveUp(v) {
  this.v = v;
};
OctaveUp.prototype.process = function (track) {
  track.back.oct += this.v;
};

var OU = new OctaveUp(1);
var OD = new OctaveUp(-1);

function Tempo(tempo) {
  this.tempo = tempo;
}

Tempo.prototype.process = function (track) {
  track.localTempo = this.tempo;
  //track.sequencer.tempo = this.tempo;
};

function TEMPO(tempo) {
  return new Tempo(tempo);
}

function Envelope(attack, decay, sustain, release) {
  this.attack = attack;
  this.decay = decay;
  this.sustain = sustain;
  this.release = release;
}

Envelope.prototype.process = function (track) {
  var envelope = track.audio.voices[track.channel].envelope;
  envelope.attack = this.attack;
  envelope.decay = this.decay;
  envelope.sustain = this.sustain;
  envelope.release = this.release;
};

function ENV(attack, decay, sustain, release) {
  return new Envelope(attack, decay, sustain, release);
}

/// デチューン
function Detune(detune) {
  this.detune = detune;
}

Detune.prototype.process = function (track) {
  var voice = track.audio.voices[track.channel];
  voice.detune = this.detune;
};

function DETUNE(detune) {
  return new Detune(detune);
}

function Volume(volume) {
  this.volume = volume;
}

Volume.prototype.process = function (track) {
  track.audio.voices[track.channel].volume.gain.setValueAtTime(this.volume, track.playingTime);
};

function VOLUME(volume) {
  return new Volume(volume);
}

function LoopData(obj, varname, count, seqPos) {
  this.varname = varname;
  this.count = count;
  this.obj = obj;
  this.seqPos = seqPos;
}

function Loop(varname, count) {
  this.loopData = new LoopData(this, varname, count, 0);
}

Loop.prototype.process = function (track) {
  var stack = track.stack;
  if (stack.length == 0 || stack[stack.length - 1].obj !== this) {
    var ld = this.loopData;
    stack.push(new LoopData(this, ld.varname, ld.count, track.seqPos));
  }
};

function LOOP(varname, count) {
  return new Loop(varname, count);
}

function LoopEnd() {}

LoopEnd.prototype.process = function (track) {
  var ld = track.stack[track.stack.length - 1];
  ld.count--;
  if (ld.count > 0) {
    track.seqPos = ld.seqPos;
  } else {
    track.stack.pop();
  }
};

var LOOP_END = new LoopEnd();

/// シーケンサートラック
function Track(sequencer, seqdata, audio) {
  this.name = '';
  this.end = false;
  this.oneshot = false;
  this.sequencer = sequencer;
  this.seqData = seqdata;
  this.seqPos = 0;
  this.mute = false;
  this.playingTime = -1;
  this.localTempo = sequencer.tempo;
  this.trackVolume = 1.0;
  this.transpose = 0;
  this.solo = false;
  this.channel = -1;
  this.track = -1;
  this.audio = audio;
  this.back = {
    note: 72,
    oct: 5,
    step: 96,
    gate: 48,
    vel: 1.0
  };
  this.stack = [];
}

Track.prototype = {
  process: function process(currentTime) {

    if (this.end) return;

    if (this.oneshot) {
      this.reset();
    }

    var seqSize = this.seqData.length;
    if (this.seqPos >= seqSize) {
      if (this.sequencer.repeat) {
        this.seqPos = 0;
      } else {
        this.end = true;
        return;
      }
    }

    var seq = this.seqData;
    this.playingTime = this.playingTime > -1 ? this.playingTime : currentTime;
    var endTime = currentTime + 0.2 /*sec*/;

    while (this.seqPos < seqSize) {
      if (this.playingTime >= endTime && !this.oneshot) {
        break;
      } else {
        var d = seq[this.seqPos];
        d.process(this);
        this.seqPos++;
      }
    }
  },
  reset: function reset() {
    var curVoice = this.audio.voices[this.channel];
    curVoice.gain.gain.cancelScheduledValues(0);
    curVoice.processor.playbackRate.cancelScheduledValues(0);
    curVoice.gain.gain.value = 0;
    this.playingTime = -1;
    this.seqPos = 0;
    this.end = false;
  }

};

function loadTracks(self, tracks, trackdata) {
  for (var i = 0; i < trackdata.length; ++i) {
    var track = new Track(self, trackdata[i].data, self.audio);
    track.channel = trackdata[i].channel;
    track.oneshot = !trackdata[i].oneshot ? false : true;
    track.track = i;
    tracks.push(track);
  }
}

function createTracks(trackdata) {
  var tracks = [];
  loadTracks(this, tracks, trackdata);
  return tracks;
}

/// シーケンサー本体
function Sequencer(audio) {
  this.audio = audio;
  this.tempo = 100.0;
  this.repeat = false;
  this.play = false;
  this.tracks = [];
  this.pauseTime = 0;
  this.status = this.STOP;
}

Sequencer.prototype = {
  load: function load(data) {
    if (this.play) {
      this.stop();
    }
    this.tracks.length = 0;
    loadTracks(this, this.tracks, data.tracks, this.audio);
  },
  start: function start() {
    //    this.handle = window.setTimeout(function () { self.process() }, 50);
    this.status = this.PLAY;
    this.process();
  },
  process: function process() {
    if (this.status == this.PLAY) {
      this.playTracks(this.tracks);
      this.handle = window.setTimeout(this.process.bind(this), 100);
    }
  },
  playTracks: function playTracks(tracks) {
    var currentTime = this.audio.audioctx.currentTime;
    //   console.log(this.audio.audioctx.currentTime);
    for (var i = 0, end = tracks.length; i < end; ++i) {
      tracks[i].process(currentTime);
    }
  },
  pause: function pause() {
    this.status = this.PAUSE;
    this.pauseTime = this.audio.audioctx.currentTime;
  },
  resume: function resume() {
    if (this.status == this.PAUSE) {
      this.status = this.PLAY;
      var tracks = this.tracks;
      var adjust = this.audio.audioctx.currentTime - this.pauseTime;
      for (var i = 0, end = tracks.length; i < end; ++i) {
        tracks[i].playingTime += adjust;
      }
      this.process();
    }
  },
  stop: function stop() {
    if (this.status != this.STOP) {
      clearTimeout(this.handle);
      //    clearInterval(this.handle);
      this.status = this.STOP;
      this.reset();
    }
  },
  reset: function reset() {
    for (var i = 0, end = this.tracks.length; i < end; ++i) {
      this.tracks[i].reset();
    }
  },
  STOP: 0 | 0,
  PLAY: 1 | 0,
  PAUSE: 2 | 0
};

/// 簡易鍵盤の実装
function Piano(audio) {
  this.audio = audio;
  this.table = [90, 83, 88, 68, 67, 86, 71, 66, 72, 78, 74, 77, 188];
  this.keyon = new Array(13);
}

Piano.prototype = {
  on: function on(e) {
    var index = this.table.indexOf(e.keyCode, 0);
    if (index == -1) {
      if (e.keyCode > 48 && e.keyCode < 57) {
        var timbre = e.keyCode - 49;
        this.audio.voices[7].setSample(waveSamples[timbre]);
        waveGraph.wave = waves[timbre];
        waveGraph.render();
        textPlane.print(5, 10, "Wave " + (timbre + 1));
      }
      return true;
    } else {
      //audio.voices[0].processor.playbackRate.value = sequencer.noteFreq[];
      if (!this.keyon[index]) {
        this.audio.voices[7].keyon(0, index + (e.shiftKey ? 84 : 72), 1.0);
        this.keyon[index] = true;
      }
      return false;
    }
  },
  off: function off(e) {
    var index = this.table.indexOf(e.keyCode, 0);
    if (index == -1) {
      return true;
    } else {
      if (this.keyon[index]) {
        audio.voices[7].envelope.keyoff(0);
        this.keyon[index] = false;
      }
      return false;
    }
  }
};

var seqData = exports.seqData = {
  name: 'Test',
  tracks: [{
    name: 'part1',
    channel: 0,
    data: [ENV(0.01, 0.02, 0.5, 0.07), TEMPO(180), TONE(0), VOLUME(0.5), L(8), GT(-0.5), O(4), LOOP('i', 4), C, C, C, C, C, C, C, C, LOOP_END, JUMP(5)]
  }, {
    name: 'part2',
    channel: 1,
    data: [ENV(0.01, 0.05, 0.6, 0.07), TEMPO(180), TONE(6), VOLUME(0.2), L(8), GT(-0.8), R(1), R(1), O(6), L(1), F, E, OD, L(8, true), Bb, G, L(4), Bb, OU, L(4), F, L(8), D, L(4, true), E, L(2), C, R(8), JUMP(8)]
  }, {
    name: 'part3',
    channel: 2,
    data: [ENV(0.01, 0.05, 0.6, 0.07), TEMPO(180), TONE(6), VOLUME(0.1), L(8), GT(-0.5), R(1), R(1), O(6), L(1), C, C, OD, L(8, true), G, D, L(4), G, OU, L(4), D, L(8), OD, G, L(4, true), OU, C, L(2), OD, G, R(8), JUMP(7)]
  }]
};

function SoundEffects(sequencer) {
  this.soundEffects = [
  // Effect 0 ////////////////////////////////////
  createTracks.call(sequencer, [{
    channel: 8,
    oneshot: true,
    data: [VOLUME(0.5), ENV(0.0001, 0.01, 1.0, 0.0001), GT(-0.999), TONE(0), TEMPO(200), O(8), ST(3), C, D, E, F, G, A, B, OU, C, D, E, G, A, B, B, B, B]
  }, {
    channel: 9,
    oneshot: true,
    data: [VOLUME(0.5), ENV(0.0001, 0.01, 1.0, 0.0001), DETUNE(0.9), GT(-0.999), TONE(0), TEMPO(200), O(5), ST(3), C, D, E, F, G, A, B, OU, C, D, E, G, A, B, B, B, B]
  }]),
  // Effect 1 /////////////////////////////////////
  createTracks.call(sequencer, [{
    channel: 10,
    oneshot: true,
    data: [TONE(4), TEMPO(150), ST(4), GT(-0.9999), ENV(0.0001, 0.0001, 1.0, 0.0001), O(6), G, A, B, O(7), B, A, G, F, E, D, C, E, G, A, B, OD, B, A, G, F, E, D, C, OD, B, A, G, F, E, D, C]
  }]),
  // Effect 2//////////////////////////////////////
  createTracks.call(sequencer, [{
    channel: 10,
    oneshot: true,
    data: [TONE(0), TEMPO(150), ST(2), GT(-0.9999), ENV(0.0001, 0.0001, 1.0, 0.0001), O(8), C, D, E, F, G, A, B, OU, C, D, E, F, OD, G, OU, A, OD, B, OU, A, OD, G, OU, F, OD, E, OU, E]
  }]),
  // Effect 3 ////////////////////////////////////
  createTracks.call(sequencer, [{
    channel: 10,
    oneshot: true,
    data: [TONE(5), TEMPO(150), L(64), GT(-0.9999), ENV(0.0001, 0.0001, 1.0, 0.0001), O(6), C, OD, C, OU, C, OD, C, OU, C, OD, C, OU, C, OD]
  }]),
  // Effect 4 ////////////////////////////////////////
  createTracks.call(sequencer, [{
    channel: 11,
    oneshot: true,
    data: [TONE(8), VOLUME(2.0), TEMPO(120), L(2), GT(-0.9999), ENV(0.0001, 0.0001, 1.0, 0.25), O(1), C]
  }])];
}

},{}],6:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Comm = exports.Comm = function () {
  function Comm() {
    var _this = this;

    _classCallCheck(this, Comm);

    var host = window.location.hostname.match(/www\.sfpgmr\.net/ig) ? 'www.sfpgmr.net' : 'localhost';
    this.enable = false;
    try {
      this.socket = io.connect('http://' + host + ':8081/test');
      this.enable = true;
      var self = this;
      this.socket.on('sendHighScores', function (data) {
        if (_this.updateHighScores) {
          _this.updateHighScores(data);
        }
      });
      this.socket.on('sendHighScore', function (data) {
        _this.updateHighScore(data);
      });

      this.socket.on('sendRank', function (data) {
        _this.updateHighScores(data.highScores);
      });

      this.socket.on('errorConnectionMax', function () {
        alert('同時接続の上限に達しました。');
        self.enable = false;
      });

      this.socket.on('disconnect', function () {
        if (self.enable) {
          self.enable = false;
          alert('サーバー接続が切断されました。');
        }
      });
    } catch (e) {
      alert('Socket.IOが利用できないため、ハイスコア情報が取得できません。' + e);
    }
  }

  _createClass(Comm, [{
    key: 'sendScore',
    value: function sendScore(score) {
      if (this.enable) {
        this.socket.emit('sendScore', score);
      }
    }
  }, {
    key: 'disconnect',
    value: function disconnect() {
      if (this.enable) {
        this.enable = false;
        this.socket.disconnect();
      }
    }
  }]);

  return Comm;
}();

},{}],7:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Bombs = exports.Bomb = undefined;

var _global = require('./global');

var sfg = _interopRequireWildcard(_global);

var _gameobj = require('./gameobj');

var gameobj = _interopRequireWildcard(_gameobj);

var _graphics = require('./graphics');

var graphics = _interopRequireWildcard(_graphics);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/// 爆発

var Bomb = exports.Bomb = function (_gameobj$GameObj) {
  _inherits(Bomb, _gameobj$GameObj);

  function Bomb(scene, se) {
    _classCallCheck(this, Bomb);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Bomb).call(this, 0, 0, 0));

    var tex = sfg.textureFiles.bomb;
    var material = graphics.createSpriteMaterial(tex);
    material.blending = THREE.AdditiveBlending;
    material.needsUpdate = true;
    var geometry = graphics.createSpriteGeometry(16);
    graphics.createSpriteUV(geometry, tex, 16, 16, 0);
    _this.mesh = new THREE.Mesh(geometry, material);
    _this.mesh.position.z = 0.1;
    _this.index = 0;
    _this.mesh.visible = false;
    _this.scene = scene;
    _this.se = se;
    scene.add(_this.mesh);
    return _this;
  }

  _createClass(Bomb, [{
    key: 'start',
    value: function start(x, y, z, delay) {
      if (this.enable_) {
        return false;
      }
      this.delay = delay | 0;
      this.x = x;
      this.y = y;
      this.z = z | 0.00002;
      this.enable_ = true;
      graphics.updateSpriteUV(this.mesh.geometry, sfg.textureFiles.bomb, 16, 16, this.index);
      this.task = sfg.tasks.pushTask(this.move.bind(this));
      this.mesh.material.opacity = 1.0;
      return true;
    }
  }, {
    key: 'move',
    value: function* move(taskIndex) {

      for (var i = 0, e = this.delay; i < e && taskIndex >= 0; ++i) {
        taskIndex = yield;
      }
      this.mesh.visible = true;

      for (var i = 0; i < 7 && taskIndex >= 0; ++i) {
        graphics.updateSpriteUV(this.mesh.geometry, sfg.textureFiles.bomb, 16, 16, i);
        taskIndex = yield;
      }

      this.enable_ = false;
      this.mesh.visible = false;
      sfg.tasks.removeTask(taskIndex);
    }
  }, {
    key: 'x',
    get: function get() {
      return this.x_;
    },
    set: function set(v) {
      this.x_ = this.mesh.position.x = v;
    }
  }, {
    key: 'y',
    get: function get() {
      return this.y_;
    },
    set: function set(v) {
      this.y_ = this.mesh.position.y = v;
    }
  }, {
    key: 'z',
    get: function get() {
      return this.z_;
    },
    set: function set(v) {
      this.z_ = this.mesh.position.z = v;
    }
  }]);

  return Bomb;
}(gameobj.GameObj);

var Bombs = exports.Bombs = function () {
  function Bombs(scene, se) {
    _classCallCheck(this, Bombs);

    this.bombs = new Array(0);
    for (var i = 0; i < 32; ++i) {
      this.bombs.push(new Bomb(scene, se));
    }
  }

  _createClass(Bombs, [{
    key: 'start',
    value: function start(x, y, z) {
      var boms = this.bombs;
      var count = 3;
      for (var i = 0, end = boms.length; i < end; ++i) {
        if (!boms[i].enable_) {
          if (count == 2) {
            boms[i].start(x, y, z, 0);
          } else {
            boms[i].start(x + (Math.random() * 16 - 8), y + (Math.random() * 16 - 8), z, Math.random() * 8);
          }
          count--;
          if (!count) break;
        }
      }
    }
  }, {
    key: 'reset',
    value: function reset() {
      this.bombs.forEach(function (d) {
        if (d.enable_) {
          while (!sfg.tasks.array[d.task.index].genInst.next(-(1 + d.task.index)).done) {}
        }
      });
    }
  }]);

  return Bombs;
}();

},{"./gameobj":11,"./global":12,"./graphics":13}],8:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Enemies = exports.Enemy = exports.EnemyBullets = exports.EnemyBullet = undefined;

var _gameobj = require('./gameobj');

var gameobj = _interopRequireWildcard(_gameobj);

var _global = require('./global');

var sfg = _interopRequireWildcard(_global);

var _graphics = require('./graphics');

var graphics = _interopRequireWildcard(_graphics);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/// 敵弾

var EnemyBullet = exports.EnemyBullet = function (_gameobj$GameObj) {
  _inherits(EnemyBullet, _gameobj$GameObj);

  function EnemyBullet(scene, se) {
    _classCallCheck(this, EnemyBullet);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(EnemyBullet).call(this, 0, 0, 0));

    _this.NONE = 0;
    _this.MOVE = 1;
    _this.BOMB = 2;
    _this.collisionArea.width = 2;
    _this.collisionArea.height = 2;
    var tex = sfg.textureFiles.enemy;
    var material = graphics.createSpriteMaterial(tex);
    var geometry = graphics.createSpriteGeometry(16);
    graphics.createSpriteUV(geometry, tex, 16, 16, 0);
    _this.mesh = new THREE.Mesh(geometry, material);
    _this.z = 0.0;
    _this.mvPattern = null;
    _this.mv = null;
    _this.mesh.visible = false;
    _this.type = null;
    _this.life = 0;
    _this.dx = 0;
    _this.dy = 0;
    _this.speed = 2.0;
    _this.enable = false;
    _this.hit_ = null;
    _this.status = _this.NONE;
    _this.scene = scene;
    scene.add(_this.mesh);
    _this.se = se;
    return _this;
  }

  _createClass(EnemyBullet, [{
    key: 'move',
    value: function* move(taskIndex) {
      for (; this.x >= sfg.V_LEFT - 16 && this.x <= sfg.V_RIGHT + 16 && this.y >= sfg.V_BOTTOM - 16 && this.y <= sfg.V_TOP + 16 && taskIndex >= 0; this.x += this.dx, this.y += this.dy) {
        taskIndex = yield;
      }

      if (taskIndex >= 0) {
        taskIndex = yield;
      }
      this.mesh.visible = false;
      this.status = this.NONE;
      this.enable = false;
      sfg.tasks.removeTask(taskIndex);
    }
  }, {
    key: 'start',
    value: function start(x, y, z) {
      if (this.enable) {
        return false;
      }
      this.x = x || 0;
      this.y = y || 0;
      this.z = z || 0;
      this.enable = true;
      if (this.status != this.NONE) {
        debugger;
      }
      this.status = this.MOVE;
      var aimRadian = Math.atan2(sfg.myship_.y - y, sfg.myship_.x - x);
      this.mesh.rotation.z = aimRadian;
      this.dx = Math.cos(aimRadian) * (this.speed + sfg.stage.difficulty);
      this.dy = Math.sin(aimRadian) * (this.speed + sfg.stage.difficulty);
      //    console.log('dx:' + this.dx + ' dy:' + this.dy);

      this.task = sfg.tasks.pushTask(this.move.bind(this));
      return true;
    }
  }, {
    key: 'hit',
    value: function hit() {
      this.enable = false;
      sfg.tasks.removeTask(this.task.index);
      this.status = this.NONE;
    }
  }, {
    key: 'x',
    get: function get() {
      return this.x_;
    },
    set: function set(v) {
      this.x_ = this.mesh.position.x = v;
    }
  }, {
    key: 'y',
    get: function get() {
      return this.y_;
    },
    set: function set(v) {
      this.y_ = this.mesh.position.y = v;
    }
  }, {
    key: 'z',
    get: function get() {
      return this.z_;
    },
    set: function set(v) {
      this.z_ = this.mesh.position.z = v;
    }
  }, {
    key: 'enable',
    get: function get() {
      return this.enable_;
    },
    set: function set(v) {
      this.enable_ = v;
      this.mesh.visible = v;
    }
  }]);

  return EnemyBullet;
}(gameobj.GameObj);

var EnemyBullets = exports.EnemyBullets = function () {
  function EnemyBullets(scene, se) {
    _classCallCheck(this, EnemyBullets);

    this.scene = scene;
    this.enemyBullets = [];
    for (var i = 0; i < 48; ++i) {
      this.enemyBullets.push(new EnemyBullet(this.scene, se));
    }
  }

  _createClass(EnemyBullets, [{
    key: 'start',
    value: function start(x, y, z) {
      var ebs = this.enemyBullets;
      for (var i = 0, end = ebs.length; i < end; ++i) {
        if (!ebs[i].enable) {
          ebs[i].start(x, y, z);
          break;
        }
      }
    }
  }, {
    key: 'reset',
    value: function reset() {
      this.enemyBullets.forEach(function (d, i) {
        if (d.enable) {
          while (!sfg.tasks.array[d.task.index].genInst.next(-(1 + d.task.index)).done) {}
        }
      });
    }
  }]);

  return EnemyBullets;
}();

/// 敵キャラの動き ///////////////////////////////
/// 直線運動

var LineMove = function () {
  function LineMove(rad, speed, step) {
    _classCallCheck(this, LineMove);

    this.rad = rad;
    this.speed = speed;
    this.step = step;
    this.currentStep = step;
    this.dx = Math.cos(rad) * speed;
    this.dy = Math.sin(rad) * speed;
  }

  _createClass(LineMove, [{
    key: 'move',
    value: function* move(self, x, y) {

      if (self.xrev) {
        self.charRad = Math.PI - (this.rad - Math.PI / 2);
      } else {
        self.charRad = this.rad - Math.PI / 2;
      }

      var dy = this.dy;
      var dx = this.dx;
      var step = this.step;

      if (self.xrev) {
        dx = -dx;
      }
      var cancel = false;
      for (var i = 0; i < step && !cancel; ++i) {
        self.x += dx;
        self.y += dy;
        cancel = yield;
      }
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return ["LineMove", this.rad, this.speed, this.step];
    }
  }], [{
    key: 'fromArray',
    value: function fromArray(array) {
      return new LineMove(array[1], array[2], array[3]);
    }
  }]);

  return LineMove;
}();

/// 円運動

var CircleMove = function () {
  function CircleMove(startRad, stopRad, r, speed, left) {
    _classCallCheck(this, CircleMove);

    this.startRad = (startRad || 0) * Math.PI;
    this.stopRad = (stopRad || 0) * Math.PI;
    this.r = r || 0;
    this.speed = speed || 0;
    this.left = !left ? false : true;
    this.deltas = [];
    var rad = this.startRad;
    var step = (left ? 1 : -1) * speed / r;
    var end = false;
    while (!end) {
      rad += step;
      if (left && rad >= this.stopRad || !left && rad <= this.stopRad) {
        rad = this.stopRad;
        end = true;
      }
      this.deltas.push({
        x: this.r * Math.cos(rad),
        y: this.r * Math.sin(rad),
        rad: rad
      });
    }
  }

  _createClass(CircleMove, [{
    key: 'move',
    value: function* move(self, x, y) {
      // 初期化
      var sx = undefined,
          sy = undefined;
      if (self.xrev) {
        sx = x - this.r * Math.cos(this.startRad + Math.PI);
      } else {
        sx = x - this.r * Math.cos(this.startRad);
      }
      sy = y - this.r * Math.sin(this.startRad);

      var cancel = false;
      // 移動
      for (var i = 0, e = this.deltas.length; i < e && !cancel; ++i) {
        var delta = this.deltas[i];
        if (self.xrev) {
          self.x = sx - delta.x;
        } else {
          self.x = sx + delta.x;
        }

        self.y = sy + delta.y;
        if (self.xrev) {
          self.charRad = Math.PI - delta.rad + (this.left ? -1 : 0) * Math.PI;
        } else {
          self.charRad = delta.rad + (this.left ? 0 : -1) * Math.PI;
        }
        self.rad = delta.rad;
        cancel = yield;
      }
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return;
      ["LineMove", this.startRad, this.stopRad, this.r, this.speed, this.left];
    }
  }], [{
    key: 'fromArray',
    value: function fromArray(a) {
      return new CircleMove(a[1], a[2], a[3], a[4], a[5]);
    }
  }]);

  return CircleMove;
}();

/// ホームポジションに戻る

var GotoHome = function () {
  function GotoHome() {
    _classCallCheck(this, GotoHome);
  }

  _createClass(GotoHome, [{
    key: 'move',
    value: function* move(self, x, y) {
      var rad = Math.atan2(self.homeY - self.y, self.homeX - self.x);
      var speed = 4;

      self.charRad = rad - Math.PI / 2;
      var dx = Math.cos(rad) * speed;
      var dy = Math.sin(rad) * speed;
      self.z = 0.0;

      var cancel = false;
      for (; (Math.abs(self.x - self.homeX) >= 2 || Math.abs(self.y - self.homeY) >= 2) && !cancel; self.x += dx, self.y += dy) {
        cancel = yield;
      }

      self.charRad = 0;
      self.x = self.homeX;
      self.y = self.homeY;
      if (self.status == self.START) {
        var groupID = self.groupID;
        var groupData = self.enemies.groupData;
        groupData[groupID].push(self);
        self.enemies.homeEnemiesCount++;
      }
      self.status = self.HOME;
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return ['GotoHome'];
    }
  }], [{
    key: 'fromArray',
    value: function fromArray(a) {
      return new GotoHome();
    }
  }]);

  return GotoHome;
}();

/// 待機中の敵の動き

var HomeMove = function () {
  function HomeMove() {
    _classCallCheck(this, HomeMove);

    this.CENTER_X = 0;
    this.CENTER_Y = 100;
  }

  _createClass(HomeMove, [{
    key: 'move',
    value: function* move(self, x, y) {

      var dx = self.homeX - this.CENTER_X;
      var dy = self.homeY - this.CENTER_Y;
      self.z = -0.1;

      while (self.status != self.ATTACK) {
        self.x = self.homeX + dx * self.enemies.homeDelta;
        self.y = self.homeY + dy * self.enemies.homeDelta;
        self.mesh.scale.x = self.enemies.homeDelta2;
        yield;
      }

      self.mesh.scale.x = 1.0;
      self.z = 0.0;
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return ['HomeMove'];
    }
  }], [{
    key: 'fromArray',
    value: function fromArray(a) {
      return new HomeMove();
    }
  }]);

  return HomeMove;
}();

/// 指定シーケンスに移動する

var Goto = function () {
  function Goto(pos) {
    _classCallCheck(this, Goto);

    this.pos = pos;
  }

  _createClass(Goto, [{
    key: 'move',
    value: function* move(self, x, y) {
      self.index = this.pos - 1;
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return ['Goto', this.pos];
    }
  }], [{
    key: 'fromArray',
    value: function fromArray(a) {
      return new Goto(a[1]);
    }
  }]);

  return Goto;
}();

/// 敵弾発射

var Fire = function () {
  function Fire() {
    _classCallCheck(this, Fire);
  }

  _createClass(Fire, [{
    key: 'move',
    value: function* move(self, x, y) {
      var d = sfg.stage.no / 20 * sfg.stage.difficulty;
      if (d > 1) {
        d = 1.0;
      }
      if (Math.random() < d) {
        self.enemies.enemyBullets.start(self.x, self.y);
      }
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return ['Fire'];
    }
  }], [{
    key: 'fromArray',
    value: function fromArray(a) {
      return new Fire();
    }
  }]);

  return Fire;
}();

/// 敵本体

var Enemy = exports.Enemy = function (_gameobj$GameObj2) {
  _inherits(Enemy, _gameobj$GameObj2);

  function Enemy(enemies, scene, se) {
    _classCallCheck(this, Enemy);

    var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(Enemy).call(this, 0, 0, 0));

    _this2.NONE = 0;
    _this2.START = 1;
    _this2.HOME = 2;
    _this2.ATTACK = 3;
    _this2.BOMB = 4;
    _this2.collisionArea.width = 12;
    _this2.collisionArea.height = 8;
    var tex = sfg.textureFiles.enemy;
    var material = graphics.createSpriteMaterial(tex);
    var geometry = graphics.createSpriteGeometry(16);
    graphics.createSpriteUV(geometry, tex, 16, 16, 0);
    _this2.mesh = new THREE.Mesh(geometry, material);
    _this2.groupID = 0;
    _this2.z = 0.0;
    _this2.index = 0;
    _this2.score = 0;
    _this2.mvPattern = null;
    _this2.mv = null;
    _this2.mesh.visible = false;
    _this2.status = _this2.NONE;
    _this2.type = null;
    _this2.life = 0;
    _this2.task = null;
    _this2.hit_ = null;
    _this2.scene = scene;
    _this2.scene.add(_this2.mesh);
    _this2.se = se;
    _this2.enemies = enemies;

    return _this2;
  }

  _createClass(Enemy, [{
    key: 'move',

    ///敵の動き
    value: function* move(taskIndex) {
      taskIndex = yield;
      while (taskIndex >= 0) {
        while (!this.mv.next().done && taskIndex >= 0) {
          this.mesh.scale.x = this.enemies.homeDelta2;
          this.mesh.rotation.z = this.charRad;
          taskIndex = yield;
        };

        if (taskIndex < 0) {
          taskIndex = - ++taskIndex;
          return;
        }

        var end = false;
        while (!end) {
          if (this.index < this.mvPattern.length - 1) {
            this.index++;
            this.mv = this.mvPattern[this.index].move(this, this.x, this.y);
            end = !this.mv.next().done;
          } else {
            break;
          }
        }
        this.mesh.scale.x = this.enemies.homeDelta2;
        this.mesh.rotation.z = this.charRad;
      }
    }

    /// 初期化

  }, {
    key: 'start',
    value: function start(x, y, z, homeX, homeY, mvPattern, xrev, type, clearTarget, groupID) {
      if (this.enable_) {
        return false;
      }
      this.type = type;
      type(this);
      this.x = x;
      this.y = y;
      this.z = z;
      this.xrev = xrev;
      this.enable_ = true;
      this.homeX = homeX || 0;
      this.homeY = homeY || 0;
      this.index = 0;
      this.groupID = groupID;
      this.mvPattern = mvPattern;
      this.clearTarget = clearTarget || true;
      this.mesh.material.color.setHex(0xFFFFFF);
      this.mv = mvPattern[0].move(this, x, y);
      //this.mv.start(this, x, y);
      //if (this.status != this.NONE) {
      //  debugger;
      //}
      this.status = this.START;
      this.task = sfg.tasks.pushTask(this.move.bind(this), 10000);
      if (this.task.index == 0) {
        debugger;
      }
      this.mesh.visible = true;
      return true;
    }
  }, {
    key: 'hit',
    value: function hit(mybullet) {
      if (this.hit_ == null) {
        var life = this.life;
        this.life -= mybullet.power || 1;
        mybullet.power -= life;
        //      this.life--;
        if (this.life <= 0) {
          sfg.bombs.start(this.x, this.y);
          this.se(1);
          sfg.addScore(this.score);
          if (this.clearTarget) {
            this.enemies.hitEnemiesCount++;
            if (this.status == this.START) {
              this.enemies.homeEnemiesCount++;
              this.enemies.groupData[this.groupID].push(this);
            }
            this.enemies.groupData[this.groupID].goneCount++;
          }
          if (this.task.index == 0) {
            console.log('hit', this.task.index);
            debugger;
          }

          this.mesh.visible = false;
          this.enable_ = false;
          this.status = this.NONE;
          sfg.tasks.array[this.task.index].genInst.next(-(this.task.index + 1));
          sfg.tasks.removeTask(this.task.index);
        } else {
          this.se(2);
          this.mesh.material.color.setHex(0xFF8080);
        }
      } else {
        this.hit_(mybullet);
      }
    }
  }, {
    key: 'x',
    get: function get() {
      return this.x_;
    },
    set: function set(v) {
      this.x_ = this.mesh.position.x = v;
    }
  }, {
    key: 'y',
    get: function get() {
      return this.y_;
    },
    set: function set(v) {
      this.y_ = this.mesh.position.y = v;
    }
  }, {
    key: 'z',
    get: function get() {
      return this.z_;
    },
    set: function set(v) {
      this.z_ = this.mesh.position.z = v;
    }
  }]);

  return Enemy;
}(gameobj.GameObj);

function Zako(self) {
  self.score = 50;
  self.life = 1;
  graphics.updateSpriteUV(self.mesh.geometry, sfg.textureFiles.enemy, 16, 16, 7);
}

function Zako1(self) {
  self.score = 100;
  self.life = 1;
  graphics.updateSpriteUV(self.mesh.geometry, sfg.textureFiles.enemy, 16, 16, 6);
}

function MBoss(self) {
  self.score = 300;
  self.life = 2;
  self.mesh.blending = THREE.NormalBlending;
  graphics.updateSpriteUV(self.mesh.geometry, sfg.textureFiles.enemy, 16, 16, 4);
}

var Enemies = exports.Enemies = function () {
  function Enemies(scene, se, enemyBullets) {
    _classCallCheck(this, Enemies);

    this.enemyBullets = enemyBullets;
    this.scene = scene;
    this.nextTime = 0;
    this.currentIndex = 0;
    this.enemies = new Array(0);
    for (var i = 0; i < 64; ++i) {
      this.enemies.push(new Enemy(this, scene, se));
    }
    for (var i = 0; i < 5; ++i) {
      this.groupData[i] = new Array(0);
    }
  }

  /// 敵編隊の動きをコントロールする

  _createClass(Enemies, [{
    key: 'move',
    value: function move() {
      var currentTime = sfg.gameTimer.elapsedTime;
      var moveSeqs = this.moveSeqs;
      var len = moveSeqs[sfg.stage.privateNo].length;
      // データ配列をもとに敵を生成
      while (this.currentIndex < len) {
        var data = moveSeqs[sfg.stage.privateNo][this.currentIndex];
        var nextTime = this.nextTime != null ? this.nextTime : data[0];
        if (currentTime >= this.nextTime + data[0]) {
          var enemies = this.enemies;
          for (var i = 0, e = enemies.length; i < e; ++i) {
            var enemy = enemies[i];
            if (!enemy.enable_) {
              enemy.start(data[1], data[2], 0, data[3], data[4], this.movePatterns[Math.abs(data[5])], data[5] < 0, data[6], data[7], data[8] || 0);
              break;
            }
          }
          this.currentIndex++;
          if (this.currentIndex < len) {
            this.nextTime = currentTime + moveSeqs[sfg.stage.privateNo][this.currentIndex][0];
          }
        } else {
          break;
        }
      }
      // ホームポジションに敵がすべて整列したか確認する。
      if (this.homeEnemiesCount == this.totalEnemiesCount && this.status == this.START) {
        // 整列していたら整列モードに移行する。
        this.status = this.HOME;
        this.endTime = sfg.gameTimer.elapsedTime + 0.5 * (2.0 - sfg.stage.difficulty);
      }

      // ホームポジションで一定時間待機する
      if (this.status == this.HOME) {
        if (sfg.gameTimer.elapsedTime > this.endTime) {
          this.status = this.ATTACK;
          this.endTime = sfg.gameTimer.elapsedTime + (sfg.stage.DIFFICULTY_MAX - sfg.stage.difficulty) * 3;
          this.group = 0;
          this.count = 0;
        }
      }

      // 攻撃する
      if (this.status == this.ATTACK && sfg.gameTimer.elapsedTime > this.endTime) {
        this.endTime = sfg.gameTimer.elapsedTime + (sfg.stage.DIFFICULTY_MAX - sfg.stage.difficulty) * 3;
        var groupData = this.groupData;
        var attackCount = 1 + 0.25 * sfg.stage.difficulty | 0;
        var group = groupData[this.group];

        if (!group || group.length == 0) {
          this.group = 0;
          var group = groupData[0];
        }

        if (group.length > 0 && group.length > group.goneCount) {
          if (!group.index) {
            group.index = 0;
          }
          if (!this.group) {
            var count = 0,
                endg = group.length;
            while (count < endg && attackCount > 0) {
              var en = group[group.index];
              if (en.enable_ && en.status == en.HOME) {
                en.status = en.ATTACK;
                --attackCount;
              }
              count++;
              group.index++;
              if (group.index >= group.length) group.index = 0;
            }
          } else {
            for (var i = 0, end = group.length; i < end; ++i) {
              var en = group[i];
              if (en.enable_ && en.status == en.HOME) {
                en.status = en.ATTACK;
              }
            }
          }
        }

        this.group++;
        if (this.group >= this.groupData.length) {
          this.group = 0;
        }
      }

      // ホームポジションでの待機動作
      this.homeDeltaCount += 0.025;
      this.homeDelta = Math.sin(this.homeDeltaCount) * 0.08;
      this.homeDelta2 = 1.0 + Math.sin(this.homeDeltaCount * 8) * 0.1;
    }
  }, {
    key: 'reset',
    value: function reset() {
      for (var i = 0, end = this.enemies.length; i < end; ++i) {
        var en = this.enemies[i];
        if (en.enable_) {
          sfg.tasks.removeTask(en.task.index);
          en.status = en.NONE;
          en.enable_ = false;
          en.mesh.visible = false;
        }
      }
    }
  }, {
    key: 'calcEnemiesCount',
    value: function calcEnemiesCount() {
      var seqs = this.moveSeqs[sfg.stage.privateNo];
      this.totalEnemiesCount = 0;
      for (var i = 0, end = seqs.length; i < end; ++i) {
        if (seqs[i][7]) {
          this.totalEnemiesCount++;
        }
      }
    }
  }, {
    key: 'start',
    value: function start() {
      this.nextTime = 0;
      this.currentIndex = 0;
      this.totalEnemiesCount = 0;
      this.hitEnemiesCount = 0;
      this.homeEnemiesCount = 0;
      this.status = this.START;
      var groupData = this.groupData;
      for (var i = 0, end = groupData.length; i < end; ++i) {
        groupData[i].length = 0;
        groupData[i].goneCount = 0;
      }
    }
  }]);

  return Enemies;
}();

Enemies.prototype.movePatterns = [
// 0
[new CircleMove(Math.PI, 1.125 * Math.PI, 300, 3, true), new CircleMove(1.125 * Math.PI, 1.25 * Math.PI, 200, 3, true), new Fire(), new CircleMove(Math.PI / 4, -3 * Math.PI, 40, 5, false), new GotoHome(), new HomeMove(), new CircleMove(Math.PI, 0, 10, 3, false), new CircleMove(0, -0.125 * Math.PI, 200, 3, false), new Fire(), new CircleMove(-0.125 * Math.PI, -0.25 * Math.PI, 150, 2.5, false), new CircleMove(3 * Math.PI / 4, 4 * Math.PI, 40, 2.5, true), new Goto(4)], // 1
[new CircleMove(Math.PI, 1.125 * Math.PI, 300, 5, true), new CircleMove(1.125 * Math.PI, 1.25 * Math.PI, 200, 5, true), new Fire(), new CircleMove(Math.PI / 4, -3 * Math.PI, 40, 6, false), new GotoHome(), new HomeMove(), new CircleMove(Math.PI, 0, 10, 3, false), new CircleMove(0, -0.125 * Math.PI, 200, 3, false), new Fire(), new CircleMove(-0.125 * Math.PI, -0.25 * Math.PI, 250, 3, false), new CircleMove(3 * Math.PI / 4, 4 * Math.PI, 40, 3, true), new Goto(4)], // 2
[new CircleMove(0, -0.125 * Math.PI, 300, 3, false), new CircleMove(-0.125 * Math.PI, -0.25 * Math.PI, 200, 3, false), new Fire(), new CircleMove(3 * Math.PI / 4, (2 + 0.25) * Math.PI, 40, 5, true), new GotoHome(), new HomeMove(), new CircleMove(0, Math.PI, 10, 3, true), new CircleMove(Math.PI, 1.125 * Math.PI, 200, 3, true), new Fire(), new CircleMove(1.125 * Math.PI, 1.25 * Math.PI, 150, 2.5, true), new CircleMove(0.25 * Math.PI, -3 * Math.PI, 40, 2.5, false), new Goto(4)], // 3
[new CircleMove(0, -0.125 * Math.PI, 300, 5, false), new CircleMove(-0.125 * Math.PI, -0.25 * Math.PI, 200, 5, false), new Fire(), new CircleMove(3 * Math.PI / 4, (4 + 0.25) * Math.PI, 40, 6, true), new Fire(), new GotoHome(), new HomeMove(), new CircleMove(0, Math.PI, 10, 3, true), new CircleMove(Math.PI, 1.125 * Math.PI, 200, 3, true), new Fire(), new CircleMove(1.125 * Math.PI, 1.25 * Math.PI, 150, 3, true), new CircleMove(0.25 * Math.PI, -3 * Math.PI, 40, 3, false), new Goto(4)], [// 4
new CircleMove(0, -0.25 * Math.PI, 176, 4, false), new CircleMove(0.75 * Math.PI, Math.PI, 112, 4, true), new CircleMove(Math.PI, 3.125 * Math.PI, 64, 4, true), new GotoHome(), new HomeMove(), new CircleMove(0, 0.125 * Math.PI, 250, 3, true), new CircleMove(0.125 * Math.PI, Math.PI, 80, 3, true), new Fire(), new CircleMove(Math.PI, 1.75 * Math.PI, 50, 3, true), new CircleMove(0.75 * Math.PI, 0.5 * Math.PI, 100, 3, false), new CircleMove(0.5 * Math.PI, -2 * Math.PI, 20, 3, false), new Goto(3)], [// 5
new CircleMove(0, -0.125 * Math.PI, 300, 3, false), new CircleMove(-0.125 * Math.PI, -0.25 * Math.PI, 200, 3, false), new CircleMove(3 * Math.PI / 4, 3 * Math.PI, 40, 5, true), new GotoHome(), new HomeMove(), new CircleMove(Math.PI, 0.875 * Math.PI, 250, 3, false), new CircleMove(0.875 * Math.PI, 0, 80, 3, false), new Fire(), new CircleMove(0, -0.75 * Math.PI, 50, 3, false), new CircleMove(0.25 * Math.PI, 0.5 * Math.PI, 100, 3, true), new CircleMove(0.5 * Math.PI, 3 * Math.PI, 20, 3, true), new Goto(3)], [// 6 ///////////////////////
new CircleMove(1.5 * Math.PI, Math.PI, 96, 4, false), new CircleMove(0, 2 * Math.PI, 48, 4, true), new CircleMove(Math.PI, 0.75 * Math.PI, 32, 4, false), new GotoHome(), new HomeMove(), new CircleMove(Math.PI, 0, 10, 3, false), new CircleMove(0, -0.125 * Math.PI, 200, 3, false), new Fire(), new CircleMove(-0.125 * Math.PI, -0.25 * Math.PI, 150, 2.5, false), new CircleMove(3 * Math.PI / 4, 4 * Math.PI, 40, 2.5, true), new Goto(3)], [// 7 ///////////////////
new CircleMove(0, -0.25 * Math.PI, 176, 4, false), new Fire(), new CircleMove(0.75 * Math.PI, Math.PI, 112, 4, true), new CircleMove(Math.PI, 2.125 * Math.PI, 48, 4, true), new CircleMove(1.125 * Math.PI, Math.PI, 48, 4, false), new GotoHome(), new HomeMove(), new CircleMove(Math.PI, 0, 10, 3, false), new Fire(), new CircleMove(0, -0.125 * Math.PI, 200, 3, false), new CircleMove(-0.125 * Math.PI, -0.25 * Math.PI, 150, 2.5, false), new CircleMove(3 * Math.PI / 4, 4 * Math.PI, 40, 2.5, true), new Goto(5)]];
Enemies.prototype.moveSeqs = [[
// *** STAGE 1 *** //
// interval,start x,start y,home x,home y,move pattern + x反転,clear target,group ID
[0.8, 56, 176, 75, 40, 7, Zako, true], [0.04, 56, 176, 35, 40, 7, Zako, true], [0.04, 56, 176, 55, 40, 7, Zako, true], [0.04, 56, 176, 15, 40, 7, Zako, true], [0.04, 56, 176, 75, -120, 4, Zako, true], [0.8, -56, 176, -75, 40, -7, Zako, true], [0.04, -56, 176, -35, 40, -7, Zako, true], [0.04, -56, 176, -55, 40, -7, Zako, true], [0.04, -56, 176, -15, 40, -7, Zako, true], [0.04, -56, 176, -75, -120, -4, Zako, true], [0.8, 128, -128, 75, 60, 6, Zako, true], [0.04, 128, -128, 35, 60, 6, Zako, true], [0.04, 128, -128, 55, 60, 6, Zako, true], [0.04, 128, -128, 15, 60, 6, Zako, true], [0.04, 128, -128, 95, 60, 6, Zako, true], [0.8, -128, -128, -75, 60, -6, Zako, true], [0.04, -128, -128, -35, 60, -6, Zako, true], [0.04, -128, -128, -55, 60, -6, Zako, true], [0.04, -128, -128, -15, 60, -6, Zako, true], [0.04, -128, -128, -95, 60, -6, Zako, true], [0.8, 0, 176, 75, 80, 1, Zako1, true], [0.03, 0, 176, 35, 80, 1, Zako1, true], [0.03, 0, 176, 55, 80, 1, Zako1, true], [0.03, 0, 176, 15, 80, 1, Zako1, true], [0.03, 0, 176, 95, 80, 1, Zako1, true], [0.8, 0, 176, -75, 80, 3, Zako1, true], [0.03, 0, 176, -35, 80, 3, Zako1, true], [0.03, 0, 176, -55, 80, 3, Zako1, true], [0.03, 0, 176, -15, 80, 3, Zako1, true], [0.03, 0, 176, -95, 80, 3, Zako1, true], [0.8, 0, 176, 85, 120, 1, MBoss, true, 1], [0.03, 0, 176, 95, 100, 1, Zako1, true, 1], [0.03, 0, 176, 75, 100, 1, Zako1, true, 1], [0.03, 0, 176, 45, 120, 1, MBoss, true, 2], [0.03, 0, 176, 55, 100, 1, Zako1, true, 2], [0.03, 0, 176, 35, 100, 1, Zako1, true, 2], [0.03, 0, 176, 65, 120, 1, MBoss, true], [0.03, 0, 176, 15, 100, 1, Zako1, true], [0.03, 0, 176, 25, 120, 1, MBoss, true], [0.8, 0, 176, -85, 120, 3, MBoss, true, 3], [0.03, 0, 176, -95, 100, 3, Zako1, true, 3], [0.03, 0, 176, -75, 100, 3, Zako1, true, 3], [0.03, 0, 176, -45, 120, 3, MBoss, true, 4], [0.03, 0, 176, -55, 100, 3, Zako1, true, 4], [0.03, 0, 176, -35, 100, 3, Zako1, true, 4], [0.03, 0, 176, -65, 120, 3, MBoss, true], [0.03, 0, 176, -15, 100, 3, Zako1, true], [0.03, 0, 176, -25, 120, 3, MBoss, true]]];

Enemies.prototype.totalEnemiesCount = 0;
Enemies.prototype.hitEnemiesCount = 0;
Enemies.prototype.homeEnemiesCount = 0;
Enemies.prototype.homeDelta = 0;
Enemies.prototype.homeDeltaCount = 0;
Enemies.prototype.homeDelta2 = 0;
Enemies.prototype.groupData = [];
Enemies.prototype.NONE = 0 | 0;
Enemies.prototype.START = 1 | 0;
Enemies.prototype.HOME = 2 | 0;
Enemies.prototype.ATTACK = 3 | 0;

},{"./gameobj":11,"./global":12,"./graphics":13}],9:[function(require,module,exports){
'use strict';

//
// We store our EE objects in a plain object whose properties are event names.
// If `Object.create(null)` is not supported we prefix the event names with a
// `~` to make sure that the built-in object properties are not overridden or
// used as an attack vector.
// We also assume that `Object.create(null)` is available when the event name
// is an ES6 Symbol.
//

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = EventEmitter;
var prefix = typeof Object.create !== 'function' ? '~' : false;

/**
 * Representation of a single EventEmitter function.
 *
 * @param {Function} fn Event handler to be called.
 * @param {Mixed} context Context for function execution.
 * @param {Boolean} once Only emit once
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal EventEmitter interface that is molded against the Node.js
 * EventEmitter interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() {} /* Nothing to set */

/**
 * Holds the assigned EventEmitters by name.
 *
 * @type {Object}
 * @private
 */
EventEmitter.prototype._events = undefined;

/**
 * Return a list of assigned event listeners.
 *
 * @param {String} event The events that should be listed.
 * @param {Boolean} exists We only need to know if there are listeners.
 * @returns {Array|Boolean}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event, exists) {
  var evt = prefix ? prefix + event : event,
      available = this._events && this._events[evt];

  if (exists) return !!available;
  if (!available) return [];
  if (available.fn) return [available.fn];

  for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
    ee[i] = available[i].fn;
  }

  return ee;
};

/**
 * Emit an event to all registered event listeners.
 *
 * @param {String} event The name of the event.
 * @returns {Boolean} Indication if we've emitted an event.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return false;

  var listeners = this._events[evt],
      len = arguments.length,
      args,
      i;

  if ('function' === typeof listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1:
        return listeners.fn.call(listeners.context), true;
      case 2:
        return listeners.fn.call(listeners.context, a1), true;
      case 3:
        return listeners.fn.call(listeners.context, a1, a2), true;
      case 4:
        return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5:
        return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6:
        return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len - 1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length,
        j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1:
          listeners[i].fn.call(listeners[i].context);break;
        case 2:
          listeners[i].fn.call(listeners[i].context, a1);break;
        case 3:
          listeners[i].fn.call(listeners[i].context, a1, a2);break;
        default:
          if (!args) for (j = 1, args = new Array(len - 1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Functon} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  var listener = new EE(fn, context || this),
      evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;else {
    if (!this._events[evt].fn) this._events[evt].push(listener);else this._events[evt] = [this._events[evt], listener];
  }

  return this;
};

/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  var listener = new EE(fn, context || this, true),
      evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;else {
    if (!this._events[evt].fn) this._events[evt].push(listener);else this._events[evt] = [this._events[evt], listener];
  }

  return this;
};

/**
 * Remove event listeners.
 *
 * @param {String} event The event we want to remove.
 * @param {Function} fn The listener that we need to find.
 * @param {Mixed} context Only remove listeners matching this context.
 * @param {Boolean} once Only remove once listeners.
 * @api public
 */

EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return this;

  var listeners = this._events[evt],
      events = [];

  if (fn) {
    if (listeners.fn) {
      if (listeners.fn !== fn || once && !listeners.once || context && listeners.context !== context) {
        events.push(listeners);
      }
    } else {
      for (var i = 0, length = listeners.length; i < length; i++) {
        if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
          events.push(listeners[i]);
        }
      }
    }
  }

  //
  // Reset the array, or remove it completely if we have no more listeners.
  //
  if (events.length) {
    this._events[evt] = events.length === 1 ? events[0] : events;
  } else {
    delete this._events[evt];
  }

  return this;
};

/**
 * Remove all listeners or only the listeners for the specified event.
 *
 * @param {String} event The event want to remove all listeners for.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  if (!this._events) return this;

  if (event) delete this._events[prefix ? prefix + event : event];else this._events = prefix ? {} : Object.create(null);

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
  module.exports = EventEmitter;
}

},{}],10:[function(require,module,exports){
"use strict";
//var STAGE_MAX = 1;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Game = undefined;

var _global = require('./global');

var sfg = _interopRequireWildcard(_global);

var _util = require('./util');

var util = _interopRequireWildcard(_util);

var _audio = require('./audio');

var audio = _interopRequireWildcard(_audio);

var _graphics = require('./graphics');

var graphics = _interopRequireWildcard(_graphics);

var _io = require('./io');

var io = _interopRequireWildcard(_io);

var _comm = require('./comm');

var comm = _interopRequireWildcard(_comm);

var _text = require('./text');

var text = _interopRequireWildcard(_text);

var _gameobj = require('./gameobj');

var gameobj = _interopRequireWildcard(_gameobj);

var _myship = require('./myship');

var myship = _interopRequireWildcard(_myship);

var _enemies = require('./enemies');

var enemies = _interopRequireWildcard(_enemies);

var _effectobj = require('./effectobj');

var effectobj = _interopRequireWildcard(_effectobj);

var _eventEmitter = require('./eventEmitter3');

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
//import * as song from './song';

var ScoreEntry = function ScoreEntry(name, score) {
  _classCallCheck(this, ScoreEntry);

  this.name = name;
  this.score = score;
};

var Stage = function (_EventEmitter) {
  _inherits(Stage, _EventEmitter);

  function Stage() {
    _classCallCheck(this, Stage);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Stage).call(this));

    _this.MAX = 1;
    _this.DIFFICULTY_MAX = 2.0;
    _this.no = 1;
    _this.privateNo = 0;
    _this.difficulty = 1;
    return _this;
  }

  _createClass(Stage, [{
    key: 'reset',
    value: function reset() {
      this.no = 1;
      this.privateNo = 0;
      this.difficulty = 1;
    }
  }, {
    key: 'advance',
    value: function advance() {
      this.no++;
      this.privateNo++;
      this.update();
    }
  }, {
    key: 'jump',
    value: function jump(stageNo) {
      this.no = stageNo;
      this.privateNo = this.no - 1;
      this.update();
    }
  }, {
    key: 'update',
    value: function update() {
      if (this.difficulty < this.DIFFICULTY_MAX) {
        this.difficulty = 1 + 0.05 * (this.no - 1);
      }

      if (this.privateNo >= this.MAX) {
        this.privateNo = 0;
        //    this.no = 1;
      }
      this.emit('update', this);
    }
  }]);

  return Stage;
}(_eventEmitter2.default);

var Game = exports.Game = function () {
  function Game() {
    _classCallCheck(this, Game);

    this.CONSOLE_WIDTH = 0;
    this.CONSOLE_HEIGHT = 0;
    this.RENDERER_PRIORITY = 100000 | 0;
    this.renderer = null;
    this.stats = null;
    this.scene = null;
    this.camera = null;
    this.author = null;
    this.progress = null;
    this.textPlane = null;
    this.basicInput = new io.BasicInput();
    this.tasks = new util.Tasks();
    sfg.tasks = this.tasks;
    this.waveGraph = null;
    this.start = false;
    this.baseTime = new Date();
    this.d = -0.2;
    this.audio_ = null;
    this.sequencer = null;
    this.piano = null;
    this.score = 0;
    this.highScore = 0;
    this.highScores = [];
    this.isHidden = false;
    this.myship_ = null;
    this.enemies = null;
    this.enemyBullets = null;
    this.PI = Math.PI;
    this.comm_ = null;
    this.handleName = '';
    this.storage = null;
    this.rank = -1;
    this.soundEffects = null;
    this.ens = null;
    this.enbs = null;
    this.stage = sfg.stage = new Stage();
    this.title = null; // タイトルメッシュ
    this.spaceField = null; // 宇宙空間パーティクル
    this.editHandleName = null;
    sfg.addScore = this.addScore.bind(this);
    this.checkVisibilityAPI();
    this.audio_ = new audio.Audio();
  }

  _createClass(Game, [{
    key: 'exec',
    value: function exec() {
      var _this2 = this;

      if (!this.checkBrowserSupport('#content')) {
        return;
      }

      this.sequencer = new audio.Sequencer(this.audio_);
      //piano = new audio.Piano(audio_);
      this.soundEffects = new audio.SoundEffects(this.sequencer);

      document.addEventListener(window.visibilityChange, this.onVisibilityChange.bind(this), false);
      sfg.gameTimer = new util.GameTimer(this.getCurrentTime.bind(this));

      /// ゲームコンソールの初期化
      this.initConsole();
      this.loadResources().then(function () {
        _this2.scene.remove(_this2.progress.mesh);
        _this2.renderer.render(_this2.scene, _this2.camera);
        _this2.tasks.clear();
        _this2.tasks.pushTask(_this2.basicInput.update.bind(_this2.basicInput));
        _this2.tasks.pushTask(_this2.init.bind(_this2));
        _this2.start = true;
        _this2.main();
      });
    }
  }, {
    key: 'checkVisibilityAPI',
    value: function checkVisibilityAPI() {
      // hidden プロパティおよび可視性の変更イベントの名前を設定
      if (typeof document.hidden !== "undefined") {
        // Opera 12.10 や Firefox 18 以降でサポート
        this.hidden = "hidden";
        window.visibilityChange = "visibilitychange";
      } else if (typeof document.mozHidden !== "undefined") {
        this.hidden = "mozHidden";
        window.visibilityChange = "mozvisibilitychange";
      } else if (typeof document.msHidden !== "undefined") {
        this.hidden = "msHidden";
        window.visibilityChange = "msvisibilitychange";
      } else if (typeof document.webkitHidden !== "undefined") {
        this.hidden = "webkitHidden";
        window.visibilityChange = "webkitvisibilitychange";
      }
    }
  }, {
    key: 'calcScreenSize',
    value: function calcScreenSize() {
      var width = window.innerWidth;
      var height = window.innerHeight;
      if (width >= height) {
        width = height * sfg.VIRTUAL_WIDTH / sfg.VIRTUAL_HEIGHT;
        while (width > window.innerWidth) {
          --height;
          width = height * sfg.VIRTUAL_WIDTH / sfg.VIRTUAL_HEIGHT;
        }
      } else {
        height = width * sfg.VIRTUAL_HEIGHT / sfg.VIRTUAL_WIDTH;
        while (height > window.innerHeight) {
          --width;
          height = width * sfg.VIRTUAL_HEIGHT / sfg.VIRTUAL_WIDTH;
        }
      }
      this.CONSOLE_WIDTH = width;
      this.CONSOLE_HEIGHT = height;
    }

    /// コンソール画面の初期化

  }, {
    key: 'initConsole',
    value: function initConsole(consoleClass) {
      var _this3 = this;

      // レンダラーの作成
      this.renderer = new THREE.WebGLRenderer({ antialias: false, sortObjects: true });
      var renderer = this.renderer;
      this.calcScreenSize();
      renderer.setSize(this.CONSOLE_WIDTH, this.CONSOLE_HEIGHT);
      renderer.setClearColor(0, 1);
      renderer.domElement.id = 'console';
      renderer.domElement.className = consoleClass || 'console';
      renderer.domElement.style.zIndex = 0;

      d3.select('#content').node().appendChild(renderer.domElement);

      window.addEventListener('resize', function () {
        _this3.calcScreenSize();
        renderer.setSize(_this3.CONSOLE_WIDTH, _this3.CONSOLE_HEIGHT);
      });

      // シーンの作成
      this.scene = new THREE.Scene();

      // カメラの作成
      this.camera = new THREE.PerspectiveCamera(90.0, sfg.VIRTUAL_WIDTH / sfg.VIRTUAL_HEIGHT);
      this.camera.position.z = sfg.VIRTUAL_HEIGHT / 2;
      this.camera.lookAt(new THREE.Vector3(0, 0, 0));

      // ライトの作成
      //var light = new THREE.DirectionalLight(0xffffff);
      //light.position = new THREE.Vector3(0.577, 0.577, 0.577);
      //scene.add(light);

      //var ambient = new THREE.AmbientLight(0xffffff);
      //scene.add(ambient);
      renderer.clear();
    }

    /// エラーで終了する。

  }, {
    key: 'ExitError',
    value: function ExitError(e) {
      //ctx.fillStyle = "red";
      //ctx.fillRect(0, 0, CONSOLE_WIDTH, CONSOLE_HEIGHT);
      //ctx.fillStyle = "white";
      //ctx.fillText("Error : " + e, 0, 20);
      ////alert(e);
      this.start = false;
      throw e;
    }
  }, {
    key: 'onVisibilityChange',
    value: function onVisibilityChange() {
      var h = document[this.hidden];
      this.isHidden = h;
      if (h) {
        this.pause();
      } else {
        this.resume();
      }
    }
  }, {
    key: 'pause',
    value: function pause() {
      if (sfg.gameTimer.status == sfg.gameTimer.START) {
        sfg.gameTimer.pause();
      }
      if (this.sequencer.status == this.sequencer.PLAY) {
        this.sequencer.pause();
      }
      sfg.pause = true;
    }
  }, {
    key: 'resume',
    value: function resume() {
      if (sfg.gameTimer.status == sfg.gameTimer.PAUSE) {
        sfg.gameTimer.resume();
      }
      if (this.sequencer.status == this.sequencer.PAUSE) {
        this.sequencer.resume();
      }
      sfg.pause = false;
    }

    /// 現在時間の取得

  }, {
    key: 'getCurrentTime',
    value: function getCurrentTime() {
      return this.audio_.audioctx.currentTime;
    }

    /// ブラウザの機能チェック

  }, {
    key: 'checkBrowserSupport',
    value: function checkBrowserSupport() {
      var content = '<img class="errorimg" src="http://public.blu.livefilestore.com/y2pbY3aqBz6wz4ah87RXEVk5ClhD2LujC5Ns66HKvR89ajrFdLM0TxFerYYURt83c_bg35HSkqc3E8GxaFD8-X94MLsFV5GU6BYp195IvegevQ/20131001.png?psid=1" width="479" height="640" class="alignnone" />';
      // WebGLのサポートチェック
      if (!Detector.webgl) {
        d3.select('#content').append('div').classed('error', true).html(content + '<p class="errortext">ブラウザが<br/>WebGLをサポートしていないため<br/>動作いたしません。</p>');
        return false;
      }

      // Web Audio APIラッパー
      if (!this.audio_.enable) {
        d3.select('#content').append('div').classed('error', true).html(content + '<p class="errortext">ブラウザが<br/>Web Audio APIをサポートしていないため<br/>動作いたしません。</p>');
        return false;
      }

      // ブラウザがPage Visibility API をサポートしない場合に警告
      if (typeof this.hidden === 'undefined') {
        d3.select('#content').append('div').classed('error', true).html(content + '<p class="errortext">ブラウザが<br/>Page Visibility APIをサポートしていないため<br/>動作いたしません。</p>');
        return false;
      }

      if (typeof localStorage === 'undefined') {
        d3.select('#content').append('div').classed('error', true).html(content + '<p class="errortext">ブラウザが<br/>Web Local Storageをサポートしていないため<br/>動作いたしません。</p>');
        return false;
      } else {
        this.storage = localStorage;
      }
      return true;
    }

    /// ゲームメイン

  }, {
    key: 'main',
    value: function main() {
      // タスクの呼び出し
      // メインに描画
      if (this.start) {
        this.tasks.process(this);
      }
    }
  }, {
    key: 'loadResources',
    value: function loadResources() {
      var _this4 = this;

      /// ゲーム中のテクスチャー定義
      var textures = {
        font: 'Font.png',
        font1: 'Font2.png',
        author: 'author.png',
        title: 'TITLE.png',
        myship: 'myship2.png',
        enemy: 'enemy.png',
        bomb: 'bomb.png'
      };
      /// テクスチャーのロード

      var loadPromise = Promise.resolve();
      var loader = new THREE.TextureLoader();
      function loadTexture(src) {
        return new Promise(function (resolve, reject) {
          loader.load(src, function (texture) {
            texture.magFilter = THREE.NearestFilter;
            texture.minFilter = THREE.LinearMipMapLinearFilter;
            resolve(texture);
          }, null, function (xhr) {
            reject(xhr);
          });
        });
      }

      var texLength = Object.keys(textures).length;
      var texCount = 0;
      this.progress = new graphics.Progress();
      this.progress.mesh.position.z = 0.001;
      this.progress.render('Loading Resouces ...', 0);
      this.scene.add(this.progress.mesh);
      for (var n in textures) {
        (function (name, texPath) {
          loadPromise = loadPromise.then(function () {
            return loadTexture('./res/' + texPath);
          }).then(function (tex) {
            texCount++;
            _this4.progress.render('Loading Resouces ...', texCount / texLength * 100 | 0);
            sfg.textureFiles[name] = tex;
            _this4.renderer.render(_this4.scene, _this4.camera);
            return Promise.resolve();
          });
        })(n, textures[n]);
      }
      return loadPromise;
    }
  }, {
    key: 'render',
    value: function* render(taskIndex) {
      while (taskIndex >= 0) {
        this.renderer.render(this.scene, this.camera);
        this.textPlane.render();
        this.stats && this.stats.update();
        taskIndex = yield;
      }
    }
  }, {
    key: 'init_',
    value: function init_() {
      var _this5 = this;

      this.scene = new THREE.Scene();
      this.enemyBullets = new enemies.EnemyBullets(this.scene, this.se.bind(this));
      this.enemies = new enemies.Enemies(this.scene, this.se.bind(this), this.enemyBullets);
      this.bombs = sfg.bombs = new effectobj.Bombs(this.scene, this.se.bind(this));
      this.myship_ = new myship.MyShip(0, -100, 0.1, this.scene, this.se.bind(this));
      sfg.myship_ = this.myship_;
      this.myship_.mesh.visible = false;

      this.spaceField = null;

      // ハンドルネームの取得
      this.handleName = this.storage.getItem('handleName');

      this.textPlane = new text.TextPlane(this.scene);
      // textPlane.print(0, 0, "Web Audio API Test", new TextAttribute(true));
      // スコア情報 通信用
      this.comm_ = new comm.Comm();
      this.comm_.updateHighScores = function (data) {
        _this5.highScores = data;
        _this5.highScore = _this5.highScores[0].score;
      };

      this.comm_.updateHighScore = function (data) {
        if (_this5.highScore < data.score) {
          _this5.highScore = data.score;
          _this5.printScore();
        }
      };
    }
  }, {
    key: 'init',
    value: function* init(taskIndex) {
      taskIndex = yield;
      this.init_();
      this.basicInput.bind();
      this.tasks.pushTask(this.render.bind(this), this.RENDERER_PRIORITY);
      this.tasks.setNextTask(taskIndex, this.printAuthor.bind(this));
    }

    /// 作者表示

  }, {
    key: 'printAuthor',
    value: function* printAuthor(taskIndex) {
      var _this6 = this;

      var wait = 60;
      this.basicInput.keyBuffer.length = 0;

      var nextTask = function nextTask() {
        _this6.scene.remove(_this6.author);
        //scene.needsUpdate = true;
        _this6.tasks.setNextTask(taskIndex, _this6.initTitle.bind(_this6));
      };

      var checkKeyInput = function checkKeyInput() {
        if (_this6.basicInput.keyBuffer.length > 0 || _this6.basicInput.start) {
          _this6.basicInput.keyBuffer.length = 0;
          nextTask();
          return true;
        }
        return false;
      };

      // 初期化
      var canvas = document.createElement('canvas');
      var w = sfg.textureFiles.author.image.width;
      var h = sfg.textureFiles.author.image.height;
      canvas.width = w;
      canvas.height = h;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(sfg.textureFiles.author.image, 0, 0);
      var data = ctx.getImageData(0, 0, w, h);
      var geometry = new THREE.Geometry();

      geometry.vert_start = [];
      geometry.vert_end = [];

      {
        var i = 0;

        for (var y = 0; y < h; ++y) {
          for (var x = 0; x < w; ++x) {
            var color = new THREE.Color();

            var r = data.data[i++];
            var g = data.data[i++];
            var b = data.data[i++];
            var a = data.data[i++];
            if (a != 0) {
              color.setRGB(r / 255.0, g / 255.0, b / 255.0);
              var vert = new THREE.Vector3(x - w / 2.0, (y - h / 2) * -1, 0.0);
              var vert2 = new THREE.Vector3(1200 * Math.random() - 600, 1200 * Math.random() - 600, 1200 * Math.random() - 600);
              geometry.vert_start.push(new THREE.Vector3(vert2.x - vert.x, vert2.y - vert.y, vert2.z - vert.z));
              geometry.vertices.push(vert2);
              geometry.vert_end.push(vert);
              geometry.colors.push(color);
            }
          }
        }
      }

      // マテリアルを作成
      //var texture = THREE.ImageUtils.loadTexture('images/particle1.png');
      var material = new THREE.PointsMaterial({ size: 20, blending: THREE.AdditiveBlending,
        transparent: true, vertexColors: true, depthTest: false //, map: texture
      });

      this.author = new THREE.Points(geometry, material);
      //    author.position.x author.position.y=  =0.0, 0.0, 0.0);

      //mesh.sortParticles = false;
      //var mesh1 = new THREE.ParticleSystem();
      //mesh.scale.x = mesh.scale.y = 8.0;

      this.scene.add(this.author);

      // 作者表示ステップ１
      for (var count = 1.0; count > 0; count <= 0.01 ? count -= 0.0005 : count -= 0.0025) {
        // 何かキー入力があった場合は次のタスクへ
        if (checkKeyInput()) {
          return;
        }

        var end = this.author.geometry.vertices.length;
        var v = this.author.geometry.vertices;
        var d = this.author.geometry.vert_start;
        var v2 = this.author.geometry.vert_end;
        for (var i = 0; i < end; ++i) {
          v[i].x = v2[i].x + d[i].x * count;
          v[i].y = v2[i].y + d[i].y * count;
          v[i].z = v2[i].z + d[i].z * count;
        }
        this.author.geometry.verticesNeedUpdate = true;
        this.author.rotation.x = this.author.rotation.y = this.author.rotation.z = count * 4.0;
        this.author.material.opacity = 1.0;
        yield;
      }
      this.author.rotation.x = this.author.rotation.y = this.author.rotation.z = 0.0;

      for (var _i = 0, e = this.author.geometry.vertices.length; _i < e; ++_i) {
        this.author.geometry.vertices[_i].x = this.author.geometry.vert_end[_i].x;
        this.author.geometry.vertices[_i].y = this.author.geometry.vert_end[_i].y;
        this.author.geometry.vertices[_i].z = this.author.geometry.vert_end[_i].z;
      }
      this.author.geometry.verticesNeedUpdate = true;

      // 待ち
      for (var _i2 = 0; _i2 < wait; ++_i2) {
        // 何かキー入力があった場合は次のタスクへ
        if (checkKeyInput()) {
          return;
        }
        if (this.author.material.size > 2) {
          this.author.material.size -= 0.5;
          this.author.material.needsUpdate = true;
        }
        yield;
      }

      // フェードアウト
      for (var count = 0.0; count <= 1.0; count += 0.05) {
        // 何かキー入力があった場合は次のタスクへ
        if (checkKeyInput()) {
          return;
        }
        this.author.material.opacity = 1.0 - count;
        this.author.material.needsUpdate = true;

        yield;
      }

      this.author.material.opacity = 0.0;
      this.author.material.needsUpdate = true;

      // 待ち
      for (var _i3 = 0; _i3 < wait; ++_i3) {
        // 何かキー入力があった場合は次のタスクへ
        if (checkKeyInput()) {
          return;
        }
        yield;
      }
      nextTask();
    }

    /// タイトル画面初期化 ///

  }, {
    key: 'initTitle',
    value: function* initTitle(taskIndex) {

      taskIndex = yield;

      this.basicInput.clear();

      // タイトルメッシュの作成・表示 ///
      var material = new THREE.MeshBasicMaterial({ map: sfg.textureFiles.title });
      material.shading = THREE.FlatShading;
      //material.antialias = false;
      material.transparent = true;
      material.alphaTest = 0.5;
      material.depthTest = true;
      this.title = new THREE.Mesh(new THREE.PlaneGeometry(sfg.textureFiles.title.image.width, sfg.textureFiles.title.image.height), material);
      this.title.scale.x = this.title.scale.y = 0.8;
      this.title.position.y = 80;
      this.scene.add(this.title);
      this.showSpaceField();
      /// テキスト表示
      this.textPlane.print(3, 25, "Push z or START button", new text.TextAttribute(true));
      sfg.gameTimer.start();
      this.showTitle.endTime = sfg.gameTimer.elapsedTime + 10 /*秒*/;
      this.tasks.setNextTask(taskIndex, this.showTitle.bind(this));
      return;
    }

    /// 背景パーティクル表示

  }, {
    key: 'showSpaceField',
    value: function showSpaceField() {
      /// 背景パーティクル表示
      if (!this.spaceField) {
        var geometry = new THREE.Geometry();

        geometry.endy = [];
        for (var i = 0; i < 250; ++i) {
          var color = new THREE.Color();
          var z = -1800.0 * Math.random() - 300.0;
          color.setHSL(0.05 + Math.random() * 0.05, 1.0, (-2100 - z) / -2100);
          var endy = sfg.VIRTUAL_HEIGHT / 2 - z * sfg.VIRTUAL_HEIGHT / sfg.VIRTUAL_WIDTH;
          var vert2 = new THREE.Vector3((sfg.VIRTUAL_WIDTH - z * 2) * Math.random() - (sfg.VIRTUAL_WIDTH - z * 2) / 2, endy * 2 * Math.random() - endy, z);
          geometry.vertices.push(vert2);
          geometry.endy.push(endy);

          geometry.colors.push(color);
        }

        // マテリアルを作成
        //var texture = THREE.ImageUtils.loadTexture('images/particle1.png');
        var material = new THREE.PointsMaterial({
          size: 4, blending: THREE.AdditiveBlending,
          transparent: true, vertexColors: true, depthTest: true //, map: texture
        });

        this.spaceField = new THREE.Points(geometry, material);
        this.spaceField.position.x = this.spaceField.position.y = this.spaceField.position.z = 0.0;
        this.scene.add(this.spaceField);
        this.tasks.pushTask(this.moveSpaceField.bind(this));
      }
    }

    /// 宇宙空間の表示

  }, {
    key: 'moveSpaceField',
    value: function* moveSpaceField(taskIndex) {
      while (true) {
        var verts = this.spaceField.geometry.vertices;
        var endys = this.spaceField.geometry.endy;
        for (var i = 0, end = verts.length; i < end; ++i) {
          verts[i].y -= 4;
          if (verts[i].y < -endys[i]) {
            verts[i].y = endys[i];
          }
        }
        this.spaceField.geometry.verticesNeedUpdate = true;
        taskIndex = yield;
      }
    }

    /// タイトル表示

  }, {
    key: 'showTitle',
    value: function* showTitle(taskIndex) {
      while (true) {
        sfg.gameTimer.update();

        if (this.basicInput.z || this.basicInput.start) {
          this.scene.remove(this.title);
          this.tasks.setNextTask(taskIndex, this.initHandleName.bind(this));
        }
        if (this.showTitle.endTime < sfg.gameTimer.elapsedTime) {
          this.scene.remove(this.title);
          this.tasks.setNextTask(taskIndex, this.initTop10.bind(this));
        }
        yield;
      }
    }

    /// ハンドルネームのエントリ前初期化

  }, {
    key: 'initHandleName',
    value: function* initHandleName(taskIndex) {
      var _this7 = this;

      var end = false;
      if (this.editHandleName) {
        this.tasks.setNextTask(taskIndex, this.gameInit.bind(this));
      } else {
        var elm;
        var inputArea;
        var inputNode;

        var _ret = yield* function* () {
          _this7.editHandleName = _this7.handleName || '';
          _this7.textPlane.cls();
          _this7.textPlane.print(4, 18, 'Input your handle name.');
          _this7.textPlane.print(8, 19, '(Max 8 Char)');
          _this7.textPlane.print(10, 21, _this7.editHandleName);
          //    textPlane.print(10, 21, handleName[0], TextAttribute(true));
          _this7.basicInput.unbind();
          elm = d3.select('#content').append('input');

          var this_ = _this7;
          elm.attr('type', 'text').attr('pattern', '[a-zA-Z0-9_\@\#\$\-]{0,8}').attr('maxlength', 8).attr('id', 'input-area').attr('value', this_.editHandleName).call(function (d) {
            d.node().selectionStart = this_.editHandleName.length;
          }).on('blur', function () {
            var _this8 = this;

            d3.event.preventDefault();
            d3.event.stopImmediatePropagation();
            //let this_ = this;
            setTimeout(function () {
              _this8.focus();
            }, 10);
            return false;
          }).on('keyup', function () {
            if (d3.event.keyCode == 13) {
              this_.editHandleName = this.value;
              var _s = this.selectionStart;
              var e = this.selectionEnd;
              this_.textPlane.print(10, 21, this_.editHandleName);
              this_.textPlane.print(10 + _s, 21, '_', new text.TextAttribute(true));
              d3.select(this).on('keyup', null);
              this_.basicInput.bind();
              // このタスクを終わらせる
              this_.tasks.array[taskIndex].genInst.next(-(taskIndex + 1));
              // 次のタスクを設定する
              this_.tasks.setNextTask(taskIndex, this_.gameInit.bind(this_));
              this_.storage.setItem('handleName', this_.editHandleName);
              d3.select('#input-area').remove();
              return false;
            }
            this_.editHandleName = this.value;
            var s = this.selectionStart;
            this_.textPlane.print(10, 21, '           ');
            this_.textPlane.print(10, 21, this_.editHandleName);
            this_.textPlane.print(10 + s, 21, '_', new text.TextAttribute(true));
          }).call(function () {
            var s = this.node().selectionStart;
            this_.textPlane.print(10, 21, '           ');
            this_.textPlane.print(10, 21, this_.editHandleName);
            this_.textPlane.print(10 + s, 21, '_', new text.TextAttribute(true));
            this.node().focus();
          });

          while (taskIndex >= 0) {
            _this7.basicInput.clear();
            if (_this7.basicInput.aButton || _this7.basicInput.start) {
              inputArea = d3.select('#input-area');
              inputNode = inputArea.node();

              _this7.editHandleName = inputNode.value;
              var s = inputNode.selectionStart;
              var e = inputNode.selectionEnd;
              _this7.textPlane.print(10, 21, _this7.editHandleName);
              _this7.textPlane.print(10 + s, 21, '_', new text.TextAttribute(true));
              inputArea.on('keyup', null);
              _this7.basicInput.bind();
              // このタスクを終わらせる
              //this.tasks.array[taskIndex].genInst.next(-(taskIndex + 1));
              // 次のタスクを設定する
              _this7.tasks.setNextTask(taskIndex, _this7.gameInit.bind(_this7));
              _this7.storage.setItem('handleName', _this7.editHandleName);
              inputArea.remove();
              return {
                v: undefined
              };
            }
            taskIndex = yield;
          }
          taskIndex = - ++taskIndex;
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
      }
    }

    /// スコア加算

  }, {
    key: 'addScore',
    value: function addScore(s) {
      this.score += s;
      if (this.score > this.highScore) {
        this.highScore = this.score;
      }
    }

    /// スコア表示

  }, {
    key: 'printScore',
    value: function printScore() {
      var s = ('00000000' + this.score.toString()).slice(-8);
      this.textPlane.print(1, 1, s);

      var h = ('00000000' + this.highScore.toString()).slice(-8);
      this.textPlane.print(12, 1, h);
    }

    /// サウンドエフェクト

  }, {
    key: 'se',
    value: function se(index) {
      this.sequencer.playTracks(this.soundEffects.soundEffects[index]);
    }

    /// ゲームの初期化

  }, {
    key: 'gameInit',
    value: function* gameInit(taskIndex) {

      taskIndex = yield;

      // オーディオの開始
      this.audio_.start();
      this.sequencer.load(audio.seqData);
      this.sequencer.start();
      sfg.stage.reset();
      this.textPlane.cls();
      this.enemies.reset();

      // 自機の初期化
      this.myship_.init();
      sfg.gameTimer.start();
      this.score = 0;
      this.textPlane.print(2, 0, 'Score    High Score');
      this.textPlane.print(20, 39, 'Rest:   ' + sfg.myship_.rest);
      this.printScore();
      this.tasks.setNextTask(taskIndex, this.stageInit.bind(this) /*gameAction*/);
    }

    /// ステージの初期化

  }, {
    key: 'stageInit',
    value: function* stageInit(taskIndex) {

      taskIndex = yield;

      this.textPlane.print(0, 39, 'Stage:' + sfg.stage.no);
      sfg.gameTimer.start();
      this.enemies.reset();
      this.enemies.start();
      this.enemies.calcEnemiesCount(sfg.stage.privateNo);
      this.enemies.hitEnemiesCount = 0;
      this.textPlane.print(8, 15, 'Stage ' + sfg.stage.no + ' Start !!', new text.TextAttribute(true));
      this.tasks.setNextTask(taskIndex, this.stageStart.bind(this));
    }

    /// ステージ開始

  }, {
    key: 'stageStart',
    value: function* stageStart(taskIndex) {
      var endTime = sfg.gameTimer.elapsedTime + 2;
      while (taskIndex >= 0 && endTime >= sfg.gameTimer.elapsedTime) {
        sfg.gameTimer.update();
        sfg.myship_.action(this.basicInput);
        taskIndex = yield;
      }
      this.textPlane.print(8, 15, '                  ', new text.TextAttribute(true));
      this.tasks.setNextTask(taskIndex, this.gameAction.bind(this), 5000);
    }

    /// ゲーム中

  }, {
    key: 'gameAction',
    value: function* gameAction(taskIndex) {
      while (taskIndex >= 0) {
        this.printScore();
        sfg.myship_.action(this.basicInput);
        sfg.gameTimer.update();
        //console.log(sfg.gameTimer.elapsedTime);
        this.enemies.move();

        if (!this.processCollision()) {
          // 面クリアチェック
          if (this.enemies.hitEnemiesCount == this.enemies.totalEnemiesCount) {
            this.printScore();
            this.stage.advance();
            this.tasks.setNextTask(taskIndex, this.stageInit.bind(this));
            return;
          }
        } else {
          this.myShipBomb.endTime = sfg.gameTimer.elapsedTime + 3;
          this.tasks.setNextTask(taskIndex, this.myShipBomb.bind(this));
          return;
        };
        taskIndex = yield;
      }
    }

    /// 当たり判定

  }, {
    key: 'processCollision',
    value: function processCollision(taskIndex) {
      //　自機弾と敵とのあたり判定
      var myBullets = sfg.myship_.myBullets;
      this.ens = this.enemies.enemies;
      for (var i = 0, end = myBullets.length; i < end; ++i) {
        var myb = myBullets[i];
        if (myb.enable_) {
          var mybco = myBullets[i].collisionArea;
          var left = mybco.left + myb.x;
          var right = mybco.right + myb.x;
          var top = mybco.top + myb.y;
          var bottom = mybco.bottom - myb.speed + myb.y;
          for (var j = 0, endj = this.ens.length; j < endj; ++j) {
            var en = this.ens[j];
            if (en.enable_) {
              var enco = en.collisionArea;
              if (top > en.y + enco.bottom && en.y + enco.top > bottom && left < en.x + enco.right && en.x + enco.left < right) {
                en.hit(myb);
                if (myb.power <= 0) {
                  myb.enable_ = false;
                }
                break;
              }
            }
          }
        }
      }

      // 敵と自機とのあたり判定
      if (sfg.CHECK_COLLISION) {
        var myco = sfg.myship_.collisionArea;
        var _left = sfg.myship_.x + myco.left;
        var _right = myco.right + sfg.myship_.x;
        var _top = myco.top + sfg.myship_.y;
        var _bottom = myco.bottom + sfg.myship_.y;

        for (var i = 0, end = this.ens.length; i < end; ++i) {
          var _en = this.ens[i];
          if (_en.enable_) {
            var _enco = _en.collisionArea;
            if (_top > _en.y + _enco.bottom && _en.y + _enco.top > _bottom && _left < _en.x + _enco.right && _en.x + _enco.left < _right) {
              _en.hit(myship);
              sfg.myship_.hit();
              return true;
            }
          }
        }
        // 敵弾と自機とのあたり判定
        this.enbs = this.enemyBullets.enemyBullets;
        for (var i = 0, end = this.enbs.length; i < end; ++i) {
          var _en2 = this.enbs[i];
          if (_en2.enable) {
            var _enco2 = _en2.collisionArea;
            if (_top > _en2.y + _enco2.bottom && _en2.y + _enco2.top > _bottom && _left < _en2.x + _enco2.right && _en2.x + _enco2.left < _right) {
              _en2.hit();
              sfg.myship_.hit();
              return true;
            }
          }
        }
      }
      return false;
    }

    /// 自機爆発

  }, {
    key: 'myShipBomb',
    value: function* myShipBomb(taskIndex) {
      while (sfg.gameTimer.elapsedTime <= this.myShipBomb.endTime && taskIndex >= 0) {
        this.enemies.move();
        sfg.gameTimer.update();
        taskIndex = yield;
      }
      sfg.myship_.rest--;
      if (sfg.myship_.rest == 0) {
        this.textPlane.print(10, 18, 'GAME OVER', new text.TextAttribute(true));
        this.printScore();
        this.textPlane.print(20, 39, 'Rest:   ' + sfg.myship_.rest);
        this.comm_.socket.on('sendRank', this.checkRankIn);
        this.comm_.sendScore(new ScoreEntry(this.editHandleName, this.score));
        this.gameOver.endTime = sfg.gameTimer.elapsedTime + 5;
        this.rank = -1;
        this.tasks.setNextTask(taskIndex, this.gameOver.bind(this));
        this.sequencer.stop();
      } else {
        sfg.myship_.mesh.visible = true;
        this.textPlane.print(20, 39, 'Rest:   ' + sfg.myship_.rest);
        this.textPlane.print(8, 15, 'Stage ' + sfg.stage.no + ' Start !!', new text.TextAttribute(true));
        this.stageStart.endTime = sfg.gameTimer.elapsedTime + 2;
        this.tasks.setNextTask(taskIndex, this.stageStart.bind(this));
      }
    }

    /// ゲームオーバー

  }, {
    key: 'gameOver',
    value: function* gameOver(taskIndex) {
      while (this.gameOver.endTime >= sfg.gameTimer.elapsedTime && taskIndex >= 0) {
        sfg.gameTimer.update();
        taskIndex = yield;
      }

      this.textPlane.cls();
      this.enemies.reset();
      this.enemyBullets.reset();
      if (this.rank >= 0) {
        this.tasks.setNextTask(taskIndex, this.initTop10.bind(this));
      } else {
        this.tasks.setNextTask(taskIndex, this.initTitle.bind(this));
      }
    }

    /// ランキングしたかどうかのチェック

  }, {
    key: 'checkRankIn',
    value: function checkRankIn(data) {
      this.rank = data.rank;
    }

    /// ハイスコアエントリの表示

  }, {
    key: 'printTop10',
    value: function printTop10() {
      var rankname = [' 1st', ' 2nd', ' 3rd', ' 4th', ' 5th', ' 6th', ' 7th', ' 8th', ' 9th', '10th'];
      this.textPlane.print(8, 4, 'Top 10 Score');
      var y = 8;
      for (var i = 0, end = this.highScores.length; i < end; ++i) {
        var scoreStr = '00000000' + this.highScores[i].score;
        scoreStr = scoreStr.substr(scoreStr.length - 8, 8);
        if (this.rank == i) {
          this.textPlane.print(3, y, rankname[i] + ' ' + scoreStr + ' ' + this.highScores[i].name, new text.TextAttribute(true));
        } else {
          this.textPlane.print(3, y, rankname[i] + ' ' + scoreStr + ' ' + this.highScores[i].name);
        }
        y += 2;
      }
    }
  }, {
    key: 'initTop10',
    value: function* initTop10(taskIndex) {
      taskIndex = yield;
      this.textPlane.cls();
      this.printTop10();
      this.showTop10.endTime = sfg.gameTimer.elapsedTime + 5;
      this.tasks.setNextTask(taskIndex, this.showTop10.bind(this));
    }
  }, {
    key: 'showTop10',
    value: function* showTop10(taskIndex) {
      while (this.showTop10.endTime >= sfg.gameTimer.elapsedTime && this.basicInput.keyBuffer.length == 0 && taskIndex >= 0) {
        sfg.gameTimer.update();
        taskIndex = yield;
      }

      this.basicInput.keyBuffer.length = 0;
      this.textPlane.cls();
      this.tasks.setNextTask(taskIndex, this.initTitle.bind(this));
    }
  }]);

  return Game;
}();

},{"./audio":5,"./comm":6,"./effectobj":7,"./enemies":8,"./eventEmitter3":9,"./gameobj":11,"./global":12,"./graphics":13,"./io":14,"./myship":15,"./text":16,"./util":17}],11:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CollisionArea = exports.CollisionArea = function () {
  function CollisionArea(offsetX, offsetY, width, height) {
    _classCallCheck(this, CollisionArea);

    this.offsetX = offsetX || 0;
    this.offsetY = offsetY || 0;
    this.top = 0;
    this.bottom = 0;
    this.left = 0;
    this.right = 0;
    this.width = width || 0;
    this.height = height || 0;
    this.width_ = 0;
    this.height_ = 0;
  }

  _createClass(CollisionArea, [{
    key: "width",
    get: function get() {
      return this.width_;
    },
    set: function set(v) {
      this.width_ = v;
      this.left = this.offsetX - v / 2;
      this.right = this.offsetX + v / 2;
    }
  }, {
    key: "height",
    get: function get() {
      return this.height_;
    },
    set: function set(v) {
      this.height_ = v;
      this.top = this.offsetY + v / 2;
      this.bottom = this.offsetY - v / 2;
    }
  }]);

  return CollisionArea;
}();

var GameObj = exports.GameObj = function () {
  function GameObj(x, y, z) {
    _classCallCheck(this, GameObj);

    this.x_ = x || 0;
    this.y_ = y || 0;
    this.z_ = z || 0.0;
    this.enable_ = false;
    this.width = 0;
    this.height = 0;
    this.collisionArea = new CollisionArea();
  }

  _createClass(GameObj, [{
    key: "x",
    get: function get() {
      return this.x_;
    },
    set: function set(v) {
      this.x_ = v;
    }
  }, {
    key: "y",
    get: function get() {
      return this.y_;
    },
    set: function set(v) {
      this.y_ = v;
    }
  }, {
    key: "z",
    get: function get() {
      return this.z_;
    },
    set: function set(v) {
      this.z_ = v;
    }
  }]);

  return GameObj;
}();

},{}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var VIRTUAL_WIDTH = exports.VIRTUAL_WIDTH = 240;
var VIRTUAL_HEIGHT = exports.VIRTUAL_HEIGHT = 320;

var V_RIGHT = exports.V_RIGHT = VIRTUAL_WIDTH / 2.0;
var V_TOP = exports.V_TOP = VIRTUAL_HEIGHT / 2.0;
var V_LEFT = exports.V_LEFT = -1 * VIRTUAL_WIDTH / 2.0;
var V_BOTTOM = exports.V_BOTTOM = -1 * VIRTUAL_HEIGHT / 2.0;

var CHAR_SIZE = exports.CHAR_SIZE = 8;
var TEXT_WIDTH = exports.TEXT_WIDTH = VIRTUAL_WIDTH / CHAR_SIZE;
var TEXT_HEIGHT = exports.TEXT_HEIGHT = VIRTUAL_HEIGHT / CHAR_SIZE;
var PIXEL_SIZE = exports.PIXEL_SIZE = 1;
var ACTUAL_CHAR_SIZE = exports.ACTUAL_CHAR_SIZE = CHAR_SIZE * PIXEL_SIZE;
var SPRITE_SIZE_X = exports.SPRITE_SIZE_X = 16.0;
var SPRITE_SIZE_Y = exports.SPRITE_SIZE_Y = 16.0;
var CHECK_COLLISION = exports.CHECK_COLLISION = false;
var DEBUG = exports.DEBUG = false;
var textureFiles = exports.textureFiles = {};
var stage = exports.stage = undefined;
var tasks = exports.tasks = undefined;
var gameTimer = exports.gameTimer = undefined;
var bombs = exports.bombs = undefined;
var addScore = exports.addScore = undefined;
var myship_ = exports.myship_ = undefined;
var textureRoot = exports.textureRoot = './res/';
var pause = exports.pause = false;
var game = exports.game = undefined;

},{}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CanvasTexture = CanvasTexture;
exports.Progress = Progress;
exports.createGeometryFromImage = createGeometryFromImage;
exports.createSpriteGeometry = createSpriteGeometry;
exports.createSpriteUV = createSpriteUV;
exports.updateSpriteUV = updateSpriteUV;
exports.createSpriteMaterial = createSpriteMaterial;

var _global = require('./global');

var g = _interopRequireWildcard(_global);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/// テクスチャーとしてcanvasを使う場合のヘルパー
function CanvasTexture(width, height) {
  this.canvas = document.createElement('canvas');
  this.canvas.width = width || g.VIRTUAL_WIDTH;
  this.canvas.height = height || g.VIRTUAL_HEIGHT;
  this.ctx = this.canvas.getContext('2d');
  this.texture = new THREE.Texture(this.canvas);
  this.texture.magFilter = THREE.NearestFilter;
  this.texture.minFilter = THREE.LinearMipMapLinearFilter;
  this.material = new THREE.MeshBasicMaterial({ map: this.texture, transparent: true });
  this.geometry = new THREE.PlaneGeometry(this.canvas.width, this.canvas.height);
  this.mesh = new THREE.Mesh(this.geometry, this.material);
  this.mesh.position.z = 0.001;
  // スムージングを切る
  this.ctx.msImageSmoothingEnabled = false;
  this.ctx.imageSmoothingEnabled = false;
  //this.ctx.webkitImageSmoothingEnabled = false;
  this.ctx.mozImageSmoothingEnabled = false;
}

/// プログレスバー表示クラス
function Progress() {
  this.canvas = document.createElement('canvas');;
  var width = 1;
  while (width <= g.VIRTUAL_WIDTH) {
    width *= 2;
  }
  var height = 1;
  while (height <= g.VIRTUAL_HEIGHT) {
    height *= 2;
  }
  this.canvas.width = width;
  this.canvas.height = height;
  this.ctx = this.canvas.getContext('2d');
  this.texture = new THREE.Texture(this.canvas);
  this.texture.magFilter = THREE.NearestFilter;
  this.texture.minFilter = THREE.LinearMipMapLinearFilter;
  // スムージングを切る
  this.ctx.msImageSmoothingEnabled = false;
  this.ctx.imageSmoothingEnabled = false;
  //this.ctx.webkitImageSmoothingEnabled = false;
  this.ctx.mozImageSmoothingEnabled = false;

  this.material = new THREE.MeshBasicMaterial({ map: this.texture, transparent: true });
  this.geometry = new THREE.PlaneGeometry(this.canvas.width, this.canvas.height);
  this.mesh = new THREE.Mesh(this.geometry, this.material);
  this.mesh.position.x = (width - g.VIRTUAL_WIDTH) / 2;
  this.mesh.position.y = -(height - g.VIRTUAL_HEIGHT) / 2;

  //this.texture.premultiplyAlpha = true;
}

/// プログレスバーを表示する。
Progress.prototype.render = function (message, percent) {
  var ctx = this.ctx;
  var width = this.canvas.width,
      height = this.canvas.height;
  //      ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  var textWidth = ctx.measureText(message).width;
  ctx.strokeStyle = ctx.fillStyle = 'rgba(255,255,255,1.0)';

  ctx.fillText(message, (width - textWidth) / 2, 100);
  ctx.beginPath();
  ctx.rect(20, 75, width - 20 * 2, 10);
  ctx.stroke();
  ctx.fillRect(20, 75, (width - 20 * 2) * percent / 100, 10);
  this.texture.needsUpdate = true;
};

/// imgからジオメトリを作成する
function createGeometryFromImage(image) {
  var canvas = document.createElement('canvas');
  var w = textureFiles.author.texture.image.width;
  var h = textureFiles.author.texture.image.height;
  canvas.width = w;
  canvas.height = h;
  var ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);
  var data = ctx.getImageData(0, 0, w, h);
  var geometry = new THREE.Geometry();
  {
    var i = 0;

    for (var y = 0; y < h; ++y) {
      for (var x = 0; x < w; ++x) {
        var color = new THREE.Color();

        var r = data.data[i++];
        var g = data.data[i++];
        var b = data.data[i++];
        var a = data.data[i++];
        if (a != 0) {
          color.setRGB(r / 255.0, g / 255.0, b / 255.0);
          var vert = new THREE.Vector3((x - w / 2.0) * 2.0, (y - h / 2) * -2.0, 0.0);
          geometry.vertices.push(vert);
          geometry.colors.push(color);
        }
      }
    }
  }
}

function createSpriteGeometry(size) {
  var geometry = new THREE.Geometry();
  var sizeHalf = size / 2;
  // geometry.
  geometry.vertices.push(new THREE.Vector3(-sizeHalf, sizeHalf, 0));
  geometry.vertices.push(new THREE.Vector3(sizeHalf, sizeHalf, 0));
  geometry.vertices.push(new THREE.Vector3(sizeHalf, -sizeHalf, 0));
  geometry.vertices.push(new THREE.Vector3(-sizeHalf, -sizeHalf, 0));
  geometry.faces.push(new THREE.Face3(0, 2, 1));
  geometry.faces.push(new THREE.Face3(0, 3, 2));
  return geometry;
}

/// テクスチャー上の指定スプライトのUV座標を求める
function createSpriteUV(geometry, texture, cellWidth, cellHeight, cellNo) {
  var width = texture.image.width;
  var height = texture.image.height;

  var uCellCount = width / cellWidth | 0;
  var vCellCount = height / cellHeight | 0;
  var vPos = vCellCount - (cellNo / uCellCount | 0);
  var uPos = cellNo % uCellCount;
  var uUnit = cellWidth / width;
  var vUnit = cellHeight / height;

  geometry.faceVertexUvs[0].push([new THREE.Vector2(uPos * cellWidth / width, vPos * cellHeight / height), new THREE.Vector2((uPos + 1) * cellWidth / width, (vPos - 1) * cellHeight / height), new THREE.Vector2((uPos + 1) * cellWidth / width, vPos * cellHeight / height)]);
  geometry.faceVertexUvs[0].push([new THREE.Vector2(uPos * cellWidth / width, vPos * cellHeight / height), new THREE.Vector2(uPos * cellWidth / width, (vPos - 1) * cellHeight / height), new THREE.Vector2((uPos + 1) * cellWidth / width, (vPos - 1) * cellHeight / height)]);
}

function updateSpriteUV(geometry, texture, cellWidth, cellHeight, cellNo) {
  var width = texture.image.width;
  var height = texture.image.height;

  var uCellCount = width / cellWidth | 0;
  var vCellCount = height / cellHeight | 0;
  var vPos = vCellCount - (cellNo / uCellCount | 0);
  var uPos = cellNo % uCellCount;
  var uUnit = cellWidth / width;
  var vUnit = cellHeight / height;
  var uvs = geometry.faceVertexUvs[0][0];

  uvs[0].x = uPos * uUnit;
  uvs[0].y = vPos * vUnit;
  uvs[1].x = (uPos + 1) * uUnit;
  uvs[1].y = (vPos - 1) * vUnit;
  uvs[2].x = (uPos + 1) * uUnit;
  uvs[2].y = vPos * vUnit;

  uvs = geometry.faceVertexUvs[0][1];

  uvs[0].x = uPos * uUnit;
  uvs[0].y = vPos * vUnit;
  uvs[1].x = uPos * uUnit;
  uvs[1].y = (vPos - 1) * vUnit;
  uvs[2].x = (uPos + 1) * uUnit;
  uvs[2].y = (vPos - 1) * vUnit;

  geometry.uvsNeedUpdate = true;
}

function createSpriteMaterial(texture) {
  // メッシュの作成・表示 ///
  var material = new THREE.MeshBasicMaterial({ map: texture /*,depthTest:true*/, transparent: true });
  material.shading = THREE.FlatShading;
  material.side = THREE.FrontSide;
  material.alphaTest = 0.5;
  material.needsUpdate = true;
  //  material.
  return material;
}

},{"./global":12}],14:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BasicInput = undefined;

var _global = require('./global');

var sfg = _interopRequireWildcard(_global);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// キー入力

var BasicInput = exports.BasicInput = function () {
  function BasicInput() {
    var _this = this;

    _classCallCheck(this, BasicInput);

    this.keyCheck = { up: false, down: false, left: false, right: false, z: false, x: false };
    this.keyBuffer = [];
    this.keyup_ = null;
    this.keydown_ = null;
    //this.gamepadCheck = { up: false, down: false, left: false, right: false, z: false ,x:false};
    window.addEventListener('gamepadconnected', function (e) {
      _this.gamepad = e.gamepad;
    });

    window.addEventListener('gamepaddisconnected', function (e) {
      delete _this.gamepad;
    });

    if (window.navigator.getGamepads) {
      this.gamepad = window.navigator.getGamepads()[0];
    }
  }

  _createClass(BasicInput, [{
    key: 'clear',
    value: function clear() {
      for (var d in this.keyCheck) {
        this.keyCheck[d] = false;
      }
      this.keyBuffer.length = 0;
    }
  }, {
    key: 'keydown',
    value: function keydown(e) {
      var e = d3.event;
      var keyBuffer = this.keyBuffer;
      var keyCheck = this.keyCheck;
      var handle = true;

      if (keyBuffer.length > 16) {
        keyBuffer.shift();
      }

      if (e.keyCode == 80 /* P */) {
          if (!sfg.pause) {
            sfg.game.pause();
          } else {
            sfg.game.resume();
          }
        }

      keyBuffer.push(e.keyCode);
      switch (e.keyCode) {
        case 74:
        case 37:
        case 100:
          keyCheck.left = true;
          handle = true;
          break;
        case 73:
        case 38:
        case 104:
          keyCheck.up = true;
          handle = true;
          break;
        case 76:
        case 39:
        case 102:
          keyCheck.right = true;
          handle = true;
          break;
        case 75:
        case 40:
        case 98:
          keyCheck.down = true;
          handle = true;
          break;
        case 90:
          keyCheck.z = true;
          handle = true;
          break;
        case 88:
          keyCheck.x = true;
          handle = true;
          break;
      }
      if (handle) {
        e.preventDefault();
        e.returnValue = false;
        return false;
      }
    }
  }, {
    key: 'keyup',
    value: function keyup() {
      var e = d3.event;
      var keyBuffer = this.keyBuffer;
      var keyCheck = this.keyCheck;
      var handle = false;
      switch (e.keyCode) {
        case 74:
        case 37:
        case 100:
          keyCheck.left = false;
          handle = true;
          break;
        case 73:
        case 38:
        case 104:
          keyCheck.up = false;
          handle = true;
          break;
        case 76:
        case 39:
        case 102:
          keyCheck.right = false;
          handle = true;
          break;
        case 75:
        case 40:
        case 98:
          keyCheck.down = false;
          handle = true;
          break;
        case 90:
          keyCheck.z = false;
          handle = true;
          break;
        case 88:
          keyCheck.x = false;
          handle = true;
          break;
      }
      if (handle) {
        e.preventDefault();
        e.returnValue = false;
        return false;
      }
    }
    //イベントにバインドする

  }, {
    key: 'bind',
    value: function bind() {
      d3.select('body').on('keydown.basicInput', this.keydown.bind(this));
      d3.select('body').on('keyup.basicInput', this.keyup.bind(this));
    }
    // アンバインドする

  }, {
    key: 'unbind',
    value: function unbind() {
      d3.select('body').on('keydown.basicInput', null);
      d3.select('body').on('keyup.basicInput', null);
    }
  }, {
    key: 'update',
    value: function* update(taskIndex) {
      while (taskIndex >= 0) {
        if (window.navigator.getGamepads) {
          this.gamepad = window.navigator.getGamepads()[0];
        }
        taskIndex = yield;
      }
    }
  }, {
    key: 'up',
    get: function get() {
      return this.keyCheck.up || this.gamepad && (this.gamepad.buttons[12].pressed || this.gamepad.axes[1] < -0.1);
    }
  }, {
    key: 'down',
    get: function get() {
      return this.keyCheck.down || this.gamepad && (this.gamepad.buttons[13].pressed || this.gamepad.axes[1] > 0.1);
    }
  }, {
    key: 'left',
    get: function get() {
      return this.keyCheck.left || this.gamepad && (this.gamepad.buttons[14].pressed || this.gamepad.axes[0] < -0.1);
    }
  }, {
    key: 'right',
    get: function get() {
      return this.keyCheck.right || this.gamepad && (this.gamepad.buttons[15].pressed || this.gamepad.axes[0] > 0.1);
    }
  }, {
    key: 'z',
    get: function get() {
      var ret = this.keyCheck.z || (!this.zButton || this.zButton && !this.zButton) && this.gamepad && this.gamepad.buttons[0].pressed;
      this.zButton = this.gamepad && this.gamepad.buttons[0].pressed;
      return ret;
    }
  }, {
    key: 'start',
    get: function get() {
      var ret = (!this.startButton_ || this.startButton_ && !this.startButton_) && this.gamepad && this.gamepad.buttons[9].pressed;
      this.startButton_ = this.gamepad && this.gamepad.buttons[9].pressed;
      return ret;
    }
  }, {
    key: 'aButton',
    get: function get() {
      var ret = (!this.aButton_ || this.aButton_ && !this.aButton_) && this.gamepad && this.gamepad.buttons[0].pressed;
      this.aButton_ = this.gamepad && this.gamepad.buttons[0].pressed;
      return ret;
    }
  }]);

  return BasicInput;
}();

},{"./global":12}],15:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MyShip = exports.MyBullet = undefined;

var _global = require('./global');

var sfg = _interopRequireWildcard(_global);

var _gameobj = require('./gameobj');

var gameobj = _interopRequireWildcard(_gameobj);

var _graphics = require('./graphics');

var graphics = _interopRequireWildcard(_graphics);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var myBullets = [];

/// 自機弾

var MyBullet = exports.MyBullet = function (_gameobj$GameObj) {
  _inherits(MyBullet, _gameobj$GameObj);

  function MyBullet(scene, se) {
    _classCallCheck(this, MyBullet);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(MyBullet).call(this, 0, 0, 0));

    _this.collisionArea.width = 4;
    _this.collisionArea.height = 6;
    _this.speed = 8;
    _this.power = 1;

    _this.textureWidth = sfg.textureFiles.myship.image.width;
    _this.textureHeight = sfg.textureFiles.myship.image.height;

    // メッシュの作成・表示 ///

    var material = graphics.createSpriteMaterial(sfg.textureFiles.myship);
    var geometry = graphics.createSpriteGeometry(16);
    graphics.createSpriteUV(geometry, sfg.textureFiles.myship, 16, 16, 1);
    _this.mesh = new THREE.Mesh(geometry, material);

    _this.mesh.position.x = _this.x_;
    _this.mesh.position.y = _this.y_;
    _this.mesh.position.z = _this.z_;
    _this.se = se;
    //se(0);
    //sequencer.playTracks(soundEffects.soundEffects[0]);
    scene.add(_this.mesh);
    _this.mesh.visible = _this.enable_ = false;
    //  sfg.tasks.pushTask(function (taskIndex) { self.move(taskIndex); });
    return _this;
  }

  _createClass(MyBullet, [{
    key: 'move',
    value: function* move(taskIndex) {

      while (taskIndex >= 0 && this.enable_ && this.y <= sfg.V_TOP + 16 && this.y >= sfg.V_BOTTOM - 16 && this.x <= sfg.V_RIGHT + 16 && this.x >= sfg.V_LEFT - 16) {

        this.y += this.dy;
        this.x += this.dx;

        taskIndex = yield;
      }

      taskIndex = yield;
      sfg.tasks.removeTask(taskIndex);
      this.enable_ = this.mesh.visible = false;
    }
  }, {
    key: 'start',
    value: function start(x, y, z, aimRadian, power) {
      if (this.enable_) {
        return false;
      }
      this.x = x;
      this.y = y;
      this.z = z - 0.1;
      this.power = power | 1;
      this.dx = Math.cos(aimRadian) * this.speed;
      this.dy = Math.sin(aimRadian) * this.speed;
      this.enable_ = this.mesh.visible = true;
      this.se(0);
      //sequencer.playTracks(soundEffects.soundEffects[0]);
      this.task = sfg.tasks.pushTask(this.move.bind(this));
      return true;
    }
  }, {
    key: 'x',
    get: function get() {
      return this.x_;
    },
    set: function set(v) {
      this.x_ = this.mesh.position.x = v;
    }
  }, {
    key: 'y',
    get: function get() {
      return this.y_;
    },
    set: function set(v) {
      this.y_ = this.mesh.position.y = v;
    }
  }, {
    key: 'z',
    get: function get() {
      return this.z_;
    },
    set: function set(v) {
      this.z_ = this.mesh.position.z = v;
    }
  }]);

  return MyBullet;
}(gameobj.GameObj);

/// 自機オブジェクト

var MyShip = exports.MyShip = function (_gameobj$GameObj2) {
  _inherits(MyShip, _gameobj$GameObj2);

  function MyShip(x, y, z, scene, se) {
    _classCallCheck(this, MyShip);

    // extend

    var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(MyShip).call(this, x, y, z));

    _this2.collisionArea.width = 6;
    _this2.collisionArea.height = 8;
    _this2.se = se;
    _this2.scene = scene;
    _this2.textureWidth = sfg.textureFiles.myship.image.width;
    _this2.textureHeight = sfg.textureFiles.myship.image.height;
    _this2.width = 16;
    _this2.height = 16;

    // 移動範囲を求める
    _this2.top = sfg.V_TOP - _this2.height / 2 | 0;
    _this2.bottom = sfg.V_BOTTOM + _this2.height / 2 | 0;
    _this2.left = sfg.V_LEFT + _this2.width / 2 | 0;
    _this2.right = sfg.V_RIGHT - _this2.width / 2 | 0;

    // メッシュの作成・表示
    // マテリアルの作成
    var material = graphics.createSpriteMaterial(sfg.textureFiles.myship);
    // ジオメトリの作成
    var geometry = graphics.createSpriteGeometry(_this2.width);
    graphics.createSpriteUV(geometry, sfg.textureFiles.myship, _this2.width, _this2.height, 0);

    _this2.mesh = new THREE.Mesh(geometry, material);

    _this2.mesh.position.x = _this2.x_;
    _this2.mesh.position.y = _this2.y_;
    _this2.mesh.position.z = _this2.z_;
    _this2.rest = 3;
    _this2.myBullets = function () {
      var arr = [];
      for (var i = 0; i < 2; ++i) {
        arr.push(new MyBullet(_this2.scene, _this2.se));
      }
      return arr;
    }();
    scene.add(_this2.mesh);

    _this2.bulletPower = 1;

    return _this2;
  }

  _createClass(MyShip, [{
    key: 'shoot',
    value: function shoot(aimRadian) {
      for (var i = 0, end = this.myBullets.length; i < end; ++i) {
        if (this.myBullets[i].start(this.x, this.y, this.z, aimRadian, this.bulletPower)) {
          break;
        }
      }
    }
  }, {
    key: 'action',
    value: function action(basicInput) {
      if (basicInput.left) {
        if (this.x > this.left) {
          this.x -= 2;
        }
      }

      if (basicInput.right) {
        if (this.x < this.right) {
          this.x += 2;
        }
      }

      if (basicInput.up) {
        if (this.y < this.top) {
          this.y += 2;
        }
      }

      if (basicInput.down) {
        if (this.y > this.bottom) {
          this.y -= 2;
        }
      }

      if (basicInput.z) {
        basicInput.keyCheck.z = false;
        this.shoot(0.5 * Math.PI);
      }

      if (basicInput.x) {
        basicInput.keyCheck.x = false;
        this.shoot(1.5 * Math.PI);
      }
    }
  }, {
    key: 'hit',
    value: function hit() {
      this.mesh.visible = false;
      sfg.bombs.start(this.x, this.y, 0.2);
      this.se(4);
    }
  }, {
    key: 'reset',
    value: function reset() {
      this.myBullets.forEach(function (d) {
        if (d.enable_) {
          while (!sfg.tasks.array[d.task.index].genInst.next(-(1 + d.task.index)).done) {}
        }
      });
    }
  }, {
    key: 'init',
    value: function init() {
      this.x = 0;
      this.y = -100;
      this.z = 0.1;
      this.mesh.visible = true;
    }
  }, {
    key: 'x',
    get: function get() {
      return this.x_;
    },
    set: function set(v) {
      this.x_ = this.mesh.position.x = v;
    }
  }, {
    key: 'y',
    get: function get() {
      return this.y_;
    },
    set: function set(v) {
      this.y_ = this.mesh.position.y = v;
    }
  }, {
    key: 'z',
    get: function get() {
      return this.z_;
    },
    set: function set(v) {
      this.z_ = this.mesh.position.z = v;
    }
  }]);

  return MyShip;
}(gameobj.GameObj);

},{"./gameobj":11,"./global":12,"./graphics":13}],16:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TextPlane = exports.TextAttribute = undefined;

var _global = require('./global');

var sfg = _interopRequireWildcard(_global);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//import *  as gameobj from './gameobj';
//import * as graphics from './graphics';

/// テキスト属性

var TextAttribute = exports.TextAttribute = function TextAttribute(blink, font) {
  _classCallCheck(this, TextAttribute);

  if (blink) {
    this.blink = blink;
  } else {
    this.blink = false;
  }
  if (font) {
    this.font = font;
  } else {
    this.font = sfg.textureFiles.font;
  }
};

/// テキストプレーン

var TextPlane = exports.TextPlane = function () {
  function TextPlane(scene) {
    _classCallCheck(this, TextPlane);

    this.textBuffer = new Array(sfg.TEXT_HEIGHT);
    this.attrBuffer = new Array(sfg.TEXT_HEIGHT);
    this.textBackBuffer = new Array(sfg.TEXT_HEIGHT);
    this.attrBackBuffer = new Array(sfg.TEXT_HEIGHT);
    var endi = this.textBuffer.length;
    for (var i = 0; i < endi; ++i) {
      this.textBuffer[i] = new Array(sfg.TEXT_WIDTH);
      this.attrBuffer[i] = new Array(sfg.TEXT_WIDTH);
      this.textBackBuffer[i] = new Array(sfg.TEXT_WIDTH);
      this.attrBackBuffer[i] = new Array(sfg.TEXT_WIDTH);
    }

    // 描画用キャンバスのセットアップ

    this.canvas = document.createElement('canvas');
    var width = 1;
    while (width <= sfg.VIRTUAL_WIDTH) {
      width *= 2;
    }
    var height = 1;
    while (height <= sfg.VIRTUAL_HEIGHT) {
      height *= 2;
    }

    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');
    this.texture = new THREE.Texture(this.canvas);
    this.texture.magFilter = THREE.NearestFilter;
    this.texture.minFilter = THREE.LinearMipMapLinearFilter;
    this.material = new THREE.MeshBasicMaterial({ map: this.texture, alphaTest: 0.5, transparent: true, depthTest: true, shading: THREE.FlatShading });
    //  this.geometry = new THREE.PlaneGeometry(sfg.VIRTUAL_WIDTH, sfg.VIRTUAL_HEIGHT);
    this.geometry = new THREE.PlaneGeometry(width, height);
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.z = 0.4;
    this.mesh.position.x = (width - sfg.VIRTUAL_WIDTH) / 2;
    this.mesh.position.y = -(height - sfg.VIRTUAL_HEIGHT) / 2;
    this.fonts = { font: sfg.textureFiles.font, font1: sfg.textureFiles.font1 };
    this.blinkCount = 0;
    this.blink = false;

    // スムージングを切る
    this.ctx.msImageSmoothingEnabled = false;
    this.ctx.imageSmoothingEnabled = false;
    //this.ctx.webkitImageSmoothingEnabled = false;
    this.ctx.mozImageSmoothingEnabled = false;

    this.cls();
    scene.add(this.mesh);
  }

  /// 画面消去

  _createClass(TextPlane, [{
    key: 'cls',
    value: function cls() {
      for (var i = 0, endi = this.textBuffer.length; i < endi; ++i) {
        var line = this.textBuffer[i];
        var attr_line = this.attrBuffer[i];
        var line_back = this.textBackBuffer[i];
        var attr_line_back = this.attrBackBuffer[i];

        for (var j = 0, endj = this.textBuffer[i].length; j < endj; ++j) {
          line[j] = 0x20;
          attr_line[j] = 0x00;
          //line_back[j] = 0x20;
          //attr_line_back[j] = 0x00;
        }
      }
      this.ctx.clearRect(0, 0, sfg.VIRTUAL_WIDTH, sfg.VIRTUAL_HEIGHT);
    }

    /// 文字表示する

  }, {
    key: 'print',
    value: function print(x, y, str, attribute) {
      var line = this.textBuffer[y];
      var attr = this.attrBuffer[y];
      if (!attribute) {
        attribute = 0;
      }
      for (var i = 0; i < str.length; ++i) {
        var c = str.charCodeAt(i);
        if (c == 0xa) {
          ++y;
          if (y >= this.textBuffer.length) {
            // スクロール
            this.textBuffer = this.textBuffer.slice(1, this.textBuffer.length - 1);
            this.textBuffer.push(new Array(sfg.VIRTUAL_WIDTH / 8));
            this.attrBuffer = this.attrBuffer.slice(1, this.attrBuffer.length - 1);
            this.attrBuffer.push(new Array(sfg.VIRTUAL_WIDTH / 8));
            --y;
            var endj = this.textBuffer[y].length;
            for (var j = 0; j < endj; ++j) {
              this.textBuffer[y][j] = 0x20;
              this.attrBuffer[y][j] = 0x00;
            }
          }
          line = this.textBuffer[y];
          attr = this.attrBuffer[y];
          x = 0;
        } else {
          line[x] = c;
          attr[x] = attribute;
          ++x;
        }
      }
    }

    /// テキストデータをもとにテクスチャーに描画する

  }, {
    key: 'render',
    value: function render() {
      var ctx = this.ctx;
      this.blinkCount = this.blinkCount + 1 & 0xf;

      var draw_blink = false;
      if (!this.blinkCount) {
        this.blink = !this.blink;
        draw_blink = true;
      }
      var update = false;
      //    ctx.clearRect(0, 0, CONSOLE_WIDTH, CONSOLE_HEIGHT);
      //    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (var y = 0, gy = 0; y < sfg.TEXT_HEIGHT; ++y, gy += sfg.ACTUAL_CHAR_SIZE) {
        var line = this.textBuffer[y];
        var attr_line = this.attrBuffer[y];
        var line_back = this.textBackBuffer[y];
        var attr_line_back = this.attrBackBuffer[y];
        for (var x = 0, gx = 0; x < sfg.TEXT_WIDTH; ++x, gx += sfg.ACTUAL_CHAR_SIZE) {
          var process_blink = attr_line[x] && attr_line[x].blink;
          if (line[x] != line_back[x] || attr_line[x] != attr_line_back[x] || process_blink && draw_blink) {
            update = true;

            line_back[x] = line[x];
            attr_line_back[x] = attr_line[x];
            var c = 0;
            if (!process_blink || this.blink) {
              c = line[x] - 0x20;
            }
            var ypos = c >> 4 << 3;
            var xpos = (c & 0xf) << 3;
            ctx.clearRect(gx, gy, sfg.ACTUAL_CHAR_SIZE, sfg.ACTUAL_CHAR_SIZE);
            var font = attr_line[x] ? attr_line[x].font : sfg.textureFiles.font;
            if (c) {
              ctx.drawImage(font.image, xpos, ypos, sfg.CHAR_SIZE, sfg.CHAR_SIZE, gx, gy, sfg.ACTUAL_CHAR_SIZE, sfg.ACTUAL_CHAR_SIZE);
            }
          }
        }
      }
      this.texture.needsUpdate = update;
    }
  }]);

  return TextPlane;
}();

},{"./global":12}],17:[function(require,module,exports){

"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GameTimer = exports.Tasks = exports.nullTask = exports.Task = undefined;

var _global = require('./global');

var sfg = _interopRequireWildcard(_global);

var _eventEmitter = require('./eventEmitter3');

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Task = exports.Task = function Task(genInst, priority) {
  _classCallCheck(this, Task);

  this.priority = priority || 10000;
  this.genInst = genInst;
  // 初期化
  this.index = 0;
};

var nullTask = exports.nullTask = new Task(function* () {}());

/// タスク管理

var Tasks = exports.Tasks = function (_EventEmitter) {
  _inherits(Tasks, _EventEmitter);

  function Tasks() {
    _classCallCheck(this, Tasks);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Tasks).call(this));

    _this.array = new Array(0);
    _this.needSort = false;
    _this.needCompress = false;
    _this.enable = true;
    _this.stopped = false;
    return _this;
  }
  // indexの位置のタスクを置き換える

  _createClass(Tasks, [{
    key: 'setNextTask',
    value: function setNextTask(index, genInst, priority) {
      if (index < 0) {
        index = - ++index;
      }
      if (this.array[index].priority == 100000) {
        debugger;
      }
      var t = new Task(genInst(index), priority);
      t.index = index;
      this.array[index] = t;
      this.needSort = true;
    }
  }, {
    key: 'pushTask',
    value: function pushTask(genInst, priority) {
      var t = undefined;
      for (var i = 0; i < this.array.length; ++i) {
        if (this.array[i] == nullTask) {
          t = new Task(genInst(i), priority);
          this.array[i] = t;
          t.index = i;
          return t;
        }
      }
      t = new Task(genInst(this.array.length), priority);
      t.index = this.array.length;
      this.array[this.array.length] = t;
      this.needSort = true;
      return t;
    }

    // 配列を取得する

  }, {
    key: 'getArray',
    value: function getArray() {
      return this.array;
    }
    // タスクをクリアする

  }, {
    key: 'clear',
    value: function clear() {
      this.array.length = 0;
    }
    // ソートが必要かチェックし、ソートする

  }, {
    key: 'checkSort',
    value: function checkSort() {
      if (this.needSort) {
        this.array.sort(function (a, b) {
          if (a.priority > b.priority) return 1;
          if (a.priority < b.priority) return -1;
          return 0;
        });
        // インデックスの振り直し
        for (var i = 0, e = this.array.length; i < e; ++i) {
          this.array[i].index = i;
        }
        this.needSort = false;
      }
    }
  }, {
    key: 'removeTask',
    value: function removeTask(index) {
      if (index < 0) {
        index = - ++index;
      }
      if (this.array[index].priority == 100000) {
        debugger;
      }
      this.array[index] = nullTask;
      this.needCompress = true;
    }
  }, {
    key: 'compress',
    value: function compress() {
      if (!this.needCompress) {
        return;
      }
      var dest = [];
      var src = this.array;
      var destIndex = 0;
      dest = src.filter(function (v, i) {
        var ret = v != nullTask;
        if (ret) {
          v.index = destIndex++;
        }
        return ret;
      });
      this.array = dest;
      this.needCompress = false;
    }
  }, {
    key: 'process',
    value: function process(game) {
      if (this.enable) {
        requestAnimationFrame(this.process.bind(this, game));
        this.stopped = false;
        if (!sfg.pause) {
          if (!game.isHidden) {
            this.checkSort();
            this.array.forEach(function (task, i) {
              if (task != nullTask) {
                if (task.index != i) {
                  debugger;
                }
                task.genInst.next(task.index);
              }
            });
            this.compress();
          }
        }
      } else {
        this.emit('stopped');
        this.stopped = true;
      }
    }
  }, {
    key: 'stopProcess',
    value: function stopProcess() {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        _this2.enable = false;
        _this2.on('stopped', function () {
          resolve();
        });
      });
    }
  }]);

  return Tasks;
}(_eventEmitter2.default);

/// ゲーム用タイマー

var GameTimer = exports.GameTimer = function () {
  function GameTimer(getCurrentTime) {
    _classCallCheck(this, GameTimer);

    this.elapsedTime = 0;
    this.currentTime = 0;
    this.pauseTime = 0;
    this.status = this.STOP;
    this.getCurrentTime = getCurrentTime;
    this.STOP = 1;
    this.START = 2;
    this.PAUSE = 3;
  }

  _createClass(GameTimer, [{
    key: 'start',
    value: function start() {
      this.elapsedTime = 0;
      this.deltaTime = 0;
      this.currentTime = this.getCurrentTime();
      this.status = this.START;
    }
  }, {
    key: 'resume',
    value: function resume() {
      var nowTime = this.getCurrentTime();
      this.currentTime = this.currentTime + nowTime - this.pauseTime;
      this.status = this.START;
    }
  }, {
    key: 'pause',
    value: function pause() {
      this.pauseTime = this.getCurrentTime();
      this.status = this.PAUSE;
    }
  }, {
    key: 'stop',
    value: function stop() {
      this.status = this.STOP;
    }
  }, {
    key: 'update',
    value: function update() {
      if (this.status != this.START) return;
      var nowTime = this.getCurrentTime();
      this.deltaTime = nowTime - this.currentTime;
      this.elapsedTime = this.elapsedTime + this.deltaTime;
      this.currentTime = nowTime;
    }
  }]);

  return GameTimer;
}();

},{"./eventEmitter3":9,"./global":12}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGFwcFxcanNcXGNvbnRyb2xsZXIuanMiLCJzcmNcXGFwcFxcanNcXGRldk1haW4uanMiLCJzcmNcXGFwcFxcanNcXGRldnRvb2wuanMiLCJzcmNcXGFwcFxcanNcXGVuZW15RWRpdG9yLmpzIiwic3JjXFxqc1xcYXVkaW8uanMiLCJzcmNcXGpzXFxjb21tLmpzIiwic3JjXFxqc1xcZWZmZWN0b2JqLmpzIiwic3JjXFxqc1xcZW5lbWllcy5qcyIsInNyY1xcanNcXGV2ZW50RW1pdHRlcjMuanMiLCJzcmNcXGpzXFxnYW1lLmpzIiwic3JjXFxqc1xcZ2FtZW9iai5qcyIsInNyY1xcanNcXGdsb2JhbC5qcyIsInNyY1xcanNcXGdyYXBoaWNzLmpzIiwic3JjXFxqc1xcaW8uanMiLCJzcmNcXGpzXFxteXNoaXAuanMiLCJzcmNcXGpzXFx0ZXh0LmpzIiwic3JjXFxqc1xcdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLFlBQVksQ0FBQzs7Ozs7Ozs7SUFFUSxVQUFVLEdBQzdCLFNBRG1CLFVBQVUsQ0FDakIsT0FBTyxFQUNuQjt3QkFGbUIsVUFBVTs7QUFHM0IsTUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7QUFDdkIsTUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztBQUNyQixNQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTzs7QUFBQyxBQUU5QixNQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7O0FBRWxDLE1BQUksY0FBYyxHQUNsQjs7QUFFRTtBQUNFLFFBQUksRUFBQyxNQUFNO0FBQ1gsUUFBSSxrQkFBRTtBQUNKLFVBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDN0M7R0FDRixDQUNGLENBQUM7O0FB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LFNBQVMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUU7QUFDN0IsTUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDYixNQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztDQUNsQjs7QUFFRCxJQUFJLENBQUMsU0FBUyxHQUFHO0FBQ2YsU0FBTyxFQUFFLGlCQUFTLEtBQUssRUFDdkI7QUFDRSxRQUFJLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO0FBQ3RCLFFBQUksSUFBSSxHQUFHLElBQUksQ0FBQztBQUNoQixRQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUM7QUFDL0IsUUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQ2xDLFFBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQztBQUNsQyxRQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUM7QUFDL0IsWUFBUSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7R0FFNUM7Q0FDRixDQUFBOztBQUVELElBQ0UsQ0FBQyxHQUFJLElBQUksSUFBSSxDQUFFLENBQUMsRUFBQyxJQUFJLENBQUM7SUFDdEIsRUFBRSxHQUFHLElBQUksSUFBSSxDQUFFLENBQUMsRUFBQyxJQUFJLENBQUM7SUFDdEIsQ0FBQyxHQUFJLElBQUksSUFBSSxDQUFFLENBQUMsRUFBQyxJQUFJLENBQUM7SUFDdEIsRUFBRSxHQUFHLElBQUksSUFBSSxDQUFFLENBQUMsRUFBQyxJQUFJLENBQUM7SUFDdEIsQ0FBQyxHQUFJLElBQUksSUFBSSxDQUFFLENBQUMsRUFBQyxJQUFJLENBQUM7SUFDdEIsQ0FBQyxHQUFJLElBQUksSUFBSSxDQUFFLENBQUMsRUFBQyxJQUFJLENBQUM7SUFDdEIsRUFBRSxHQUFHLElBQUksSUFBSSxDQUFFLENBQUMsRUFBQyxJQUFJLENBQUM7SUFDdEIsQ0FBQyxHQUFJLElBQUksSUFBSSxDQUFFLENBQUMsRUFBQyxJQUFJLENBQUM7SUFDdEIsRUFBRSxHQUFHLElBQUksSUFBSSxDQUFFLENBQUMsRUFBQyxJQUFJLENBQUM7SUFDdEIsQ0FBQyxHQUFJLElBQUksSUFBSSxDQUFFLENBQUMsRUFBQyxJQUFJLENBQUM7SUFDdEIsRUFBRSxHQUFHLElBQUksSUFBSSxDQUFDLEVBQUUsRUFBQyxJQUFJLENBQUM7SUFDdEIsQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUM7Ozs7QUFBQyxBQUl6QixTQUFTLE9BQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUMzQztBQUNFLE1BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLE1BQUksQ0FBQyxHQUFHLEdBQUcsR0FBRzs7QUFBQyxBQUVmLE1BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLE1BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLE1BQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0NBQ2hCOztBQUVELFNBQVMsUUFBUSxDQUFDLEtBQUssRUFBQyxJQUFJLEVBQUMsR0FBRyxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsR0FBRyxFQUM5QztBQUNFLE1BQUksRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQztBQUM1QixNQUFJLFNBQVMsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDO0FBQ2xDLE1BQUksU0FBUyxHQUFHLENBQUMsQUFBQyxJQUFJLElBQUksQ0FBQyxHQUFJLElBQUksR0FBRyxFQUFFLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUEsSUFBSyxTQUFTLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQSxB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SyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsQ0FBQyxJQUFJLElBQUksRUFDMUQsQ0FBQyxBQUFDLENBQUMsSUFBSSxDQUFDLEdBQUksSUFBSSxHQUFHLEtBQUssQ0FBQSxJQUFLLEtBQUssQ0FBQyxJQUFJLElBQUksS0FBSyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQzFELENBQUMsQUFBQyxDQUFDLElBQUksQ0FBQyxHQUFJLEdBQUcsR0FBRyxLQUFLLENBQUEsSUFBSyxLQUFLLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQyxDQUFDLElBQUksSUFBSSxDQUN2RCxDQUFDO0tBQ0g7R0FDRjtBQUNELFNBQU8sSUFBSSxPQUFPLENBQUMsSUFBSSxJQUFJLElBQUksRUFBRSxHQUFHLElBQUksSUFBSSxFQUFFLElBQUksSUFBSSxJQUFJLEVBQUUsSUFBSSxJQUFJLElBQUksRUFBRSxHQUFHLElBQUksSUFBSSxDQUFDLENBQUM7Q0FDeEY7O0FBRUQsU0FBUyxFQUFFLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRTtBQUN0QyxTQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7Q0FDekM7O0FBRUQsU0FBUyxFQUFFLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUcsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUU7QUFDM0MsU0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztDQUM1Qzs7QUFFRCxTQUFTLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFO0FBQ3RDLFNBQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztDQUN0Qzs7OztBQUFBLEFBS0QsU0FBUyxDQUFDLENBQUMsR0FBRyxFQUFDLEdBQUcsRUFDbEI7QUFDRSxNQUFJLENBQUMsR0FBRyxLQUFLLENBQUM7QUFDZCxNQUFJLEdBQUcsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ2pCLFNBQU8sQUFBQyxTQUFTLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFBLENBQUMsQUFBQyxHQUFJLEdBQUcsQ0FBQztDQUMxQzs7QUFFRCxTQUFTLElBQUksQ0FBQyxJQUFJLEVBQUU7QUFDbEIsTUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7Q0FDbEI7O0FBRUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsVUFBVSxLQUFLLEVBQ3hDO0FBQ0UsT0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztDQUM3QixDQUFBOztBQUVELFNBQVMsRUFBRSxDQUFDLElBQUksRUFDaEI7QUFDRSxTQUFPLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQ3ZCOztBQUVELFNBQVMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUU7QUFDbkIsU0FBTyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7Q0FDOUI7Ozs7QUFBQSxBQUlELFNBQVMsUUFBUSxDQUFDLElBQUksRUFBRTtBQUN0QixNQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztDQUNsQjs7QUFFRCxRQUFRLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxVQUFVLEtBQUssRUFBRTtBQUM1QyxPQUFLLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0NBQzdCLENBQUE7O0FBRUQsU0FBUyxFQUFFLENBQUMsSUFBSSxFQUFFO0FBQ2hCLFNBQU8sSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDM0I7Ozs7QUFBQSxBQUlELFNBQVMsUUFBUSxDQUFDLEdBQUcsRUFBRTtBQUNyQixNQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztDQUNoQjs7QUFFRCxRQUFRLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxVQUFVLEtBQUssRUFBRTtBQUM1QyxPQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO0NBQzNCLENBQUE7O0FBRUQsU0FBUyxDQUFDLENBQUMsR0FBRyxFQUFFO0FBQ2QsU0FBTyxJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUMxQjs7QUFHRCxTQUFTLElBQUksQ0FBQyxHQUFHLEVBQUU7QUFBRSxNQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztDQUFDLENBQUM7QUFDdEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsVUFBVSxLQUFLLEVBQ3hDO0FBQ0UsT0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO0NBQ3pCOzs7QUFBQSxBQUdELFNBQVMsSUFBSSxDQUFDLEVBQUUsRUFDaEI7QUFDRSxNQUFJLENBQUMsRUFBRSxHQUFHLEVBQUU7O0FBQUMsQ0FFZDs7QUFFRCxJQUFJLENBQUMsU0FBUyxHQUNkO0FBQ0UsU0FBTyxFQUFFLGlCQUFVLEtBQUssRUFDeEI7QUFDRSxTQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztHQUNuRTtDQUNGLENBQUE7QUFDRCxTQUFTLElBQUksQ0FBQyxFQUFFLEVBQ2hCO0FBQ0UsU0FBTyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztDQUNyQjs7QUFFRCxTQUFTLElBQUksQ0FBQyxHQUFHLEVBQUU7QUFDakIsU0FBTyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUN0Qjs7QUFFRCxTQUFTLElBQUksQ0FBQyxJQUFJLEVBQ2xCO0FBQ0UsTUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7Q0FDbEI7O0FBRUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsVUFBUyxLQUFLLEVBQ3ZDO0FBQ0UsTUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztBQUN4QyxPQUFLLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQyxXQUFXLEdBQUcsQUFBQyxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsSUFBSyxTQUFTLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQSxBQUFDLENBQUM7QUFDMUYsT0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztDQUM3QixDQUFBOztBQUVELFNBQVMsRUFBRSxDQUFDLElBQUksRUFBRTtBQUNoQixTQUFPLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQ3ZCO0FBQ0QsU0FBUyxDQUFDLENBQUMsR0FBRyxFQUFDLEdBQUcsRUFBRTtBQUNsQixTQUFPLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztDQUM3Qjs7QUFFRCxTQUFTLE1BQU0sQ0FBQyxHQUFHLEVBQUU7QUFDbkIsTUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7Q0FDaEI7QUFDRCxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxVQUFTLEtBQUssRUFDekM7QUFDRSxPQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO0NBQzNCLENBQUE7O0FBRUQsU0FBUyxDQUFDLENBQUMsR0FBRyxFQUFFO0FBQ2QsU0FBTyxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUN4Qjs7QUFFRCxTQUFTLFFBQVEsQ0FBQyxDQUFDLEVBQUU7QUFBRSxNQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUFFLENBQUM7QUFDckMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsVUFBUyxLQUFLLEVBQUU7QUFDM0MsT0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztDQUMxQixDQUFBOztBQUVELElBQUksRUFBRSxHQUFHLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3pCLElBQUksRUFBRSxHQUFHLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRTFCLFNBQVMsS0FBSyxDQUFDLEtBQUssRUFDcEI7QUFDRSxNQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztDQUNwQjs7QUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxVQUFTLEtBQUssRUFDeEM7QUFDRSxPQUFLLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLOztBQUFDLENBRS9CLENBQUE7O0FBRUQsU0FBUyxLQUFLLENBQUMsS0FBSyxFQUNwQjtBQUNFLFNBQU8sSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7Q0FDekI7O0FBRUQsU0FBUyxRQUFRLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUNqRDtBQUNFLE1BQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQ3JCLE1BQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQ25CLE1BQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQ3ZCLE1BQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0NBQ3hCOztBQUVELFFBQVEsQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFVBQVMsS0FBSyxFQUMzQztBQUNFLE1BQUksUUFBUSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUM7QUFDMUQsVUFBUSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBQzlCLFVBQVEsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUM1QixVQUFRLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7QUFDaEMsVUFBUSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO0NBQ2pDLENBQUE7O0FBRUQsU0FBUyxHQUFHLENBQUMsTUFBTSxFQUFDLEtBQUssRUFBQyxPQUFPLEVBQUUsT0FBTyxFQUMxQztBQUNFLFNBQU8sSUFBSSxRQUFRLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7Q0FDdEQ7OztBQUFBLEFBR0QsU0FBUyxNQUFNLENBQUMsTUFBTSxFQUN0QjtBQUNFLE1BQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0NBQ3RCOztBQUVELE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFVBQVMsS0FBSyxFQUN6QztBQUNFLE1BQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM5QyxPQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7Q0FDNUIsQ0FBQTs7QUFFRCxTQUFTLE1BQU0sQ0FBQyxNQUFNLEVBQ3RCO0FBQ0UsU0FBTyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztDQUMzQjs7QUFFRCxTQUFTLE1BQU0sQ0FBQyxNQUFNLEVBQ3RCO0FBQ0UsTUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7Q0FDdEI7O0FBRUQsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsVUFBUyxLQUFLLEVBQ3pDO0FBQ0UsT0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0NBQzlGLENBQUE7O0FBRUQsU0FBUyxNQUFNLENBQUMsTUFBTSxFQUN0QjtBQUNFLFNBQU8sSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7Q0FDM0I7O0FBRUQsU0FBUyxRQUFRLENBQUMsR0FBRyxFQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUMsTUFBTSxFQUMzQztBQUNFLE1BQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQ3ZCLE1BQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQ25CLE1BQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQ2YsTUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7Q0FDdEI7O0FBRUQsU0FBUyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRTtBQUM1QixNQUFJLENBQUMsUUFBUSxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksRUFBQyxPQUFPLEVBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3BEOztBQUVELElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFVBQVUsS0FBSyxFQUN4QztBQUNFLE1BQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7QUFDeEIsTUFBSSxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssSUFBSSxFQUM3RDtBQUNFLFFBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7QUFDdkIsU0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0dBQ3BFO0NBQ0YsQ0FBQTs7QUFFRCxTQUFTLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFO0FBQzVCLFNBQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFDLEtBQUssQ0FBQyxDQUFDO0NBQ2hDOztBQUVELFNBQVMsT0FBTyxHQUNoQixFQUNDOztBQUVELE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFVBQVMsS0FBSyxFQUMxQztBQUNFLE1BQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDN0MsSUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ1gsTUFBSSxFQUFFLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRTtBQUNoQixTQUFLLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUM7R0FDMUIsTUFBTTtBQUNMLFNBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7R0FDbkI7Q0FDRixDQUFBOztBQUVELElBQUksUUFBUSxHQUFHLElBQUksT0FBTyxFQUFFOzs7QUFBQyxBQUc3QixTQUFTLEtBQUssQ0FBQyxTQUFTLEVBQUMsT0FBTyxFQUFDLEtBQUssRUFDdEM7QUFDRSxNQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNmLE1BQUksQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDO0FBQ2pCLE1BQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0FBQ3JCLE1BQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0FBQzNCLE1BQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQ3ZCLE1BQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ2hCLE1BQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO0FBQ2xCLE1BQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdEIsTUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDO0FBQ2xDLE1BQUksQ0FBQyxXQUFXLEdBQUcsR0FBRyxDQUFDO0FBQ3ZCLE1BQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO0FBQ25CLE1BQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO0FBQ2xCLE1BQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbEIsTUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNoQixNQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztBQUNuQixNQUFJLENBQUMsSUFBSSxHQUFHO0FBQ1YsUUFBSSxFQUFFLEVBQUU7QUFDUixPQUFHLEVBQUUsQ0FBQztBQUNOLFFBQUksRUFBRSxFQUFFO0FBQ1IsUUFBSSxFQUFFLEVBQUU7QUFDUixPQUFHLEVBQUMsR0FBRztHQUNSLENBQUE7QUFDRCxNQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztDQUNqQjs7QUFFRCxLQUFLLENBQUMsU0FBUyxHQUFHO0FBQ2hCLFNBQU8sRUFBRSxpQkFBVSxXQUFXLEVBQUU7O0FBRTlCLFFBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxPQUFPOztBQUVyQixRQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDaEIsVUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ2Q7O0FBRUQsUUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7QUFDbEMsUUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLE9BQU8sRUFBRTtBQUMxQixVQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUN4QjtBQUNFLFlBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO09BQ2pCLE1BQU07QUFDTCxZQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQztBQUNoQixlQUFPO09BQ1I7S0FDRjs7QUFFRCxRQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBQ3ZCLFFBQUksQ0FBQyxXQUFXLEdBQUcsQUFBQyxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQyxHQUFJLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO0FBQzVFLFFBQUksT0FBTyxHQUFHLFdBQVcsR0FBRyxHQUFHLFFBQUEsQ0FBUTs7QUFFdkMsV0FBTyxJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sRUFBRTtBQUM1QixVQUFJLElBQUksQ0FBQyxXQUFXLElBQUksT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNoRCxjQUFNO09BQ1AsTUFBTTtBQUNMLFlBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDekIsU0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQixZQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7T0FDZjtLQUNGO0dBQ0Y7QUFDRCxPQUFLLEVBQUMsaUJBQ047QUFDRSxRQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDL0MsWUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUMsWUFBUSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDekQsWUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUM3QixRQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3RCLFFBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ2hCLFFBQUksQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDO0dBQ2xCOztDQUVGLENBQUE7O0FBRUQsU0FBUyxVQUFVLENBQUMsSUFBSSxFQUFDLE1BQU0sRUFBRSxTQUFTLEVBQzFDO0FBQ0UsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUU7QUFDekMsUUFBSSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzFELFNBQUssQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztBQUNyQyxTQUFLLENBQUMsT0FBTyxHQUFHLEFBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFFLEtBQUssR0FBQyxJQUFJLENBQUM7QUFDbkQsU0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDaEIsVUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUNwQjtDQUNGOztBQUVELFNBQVMsWUFBWSxDQUFDLFNBQVMsRUFDL0I7QUFDRSxNQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDaEIsWUFBVSxDQUFDLElBQUksRUFBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDbkMsU0FBTyxNQUFNLENBQUM7Q0FDZjs7O0FBQUEsQUFHTSxTQUFTLFNBQVMsQ0FBQyxLQUFLLEVBQUU7QUFDL0IsTUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDbkIsTUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDbkIsTUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7QUFDcEIsTUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7QUFDbEIsTUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDakIsTUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7QUFDbkIsTUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0NBQ3pCOztBQUVELFNBQVMsQ0FBQyxTQUFTLEdBQUc7QUFDcEIsTUFBSSxFQUFFLGNBQVMsSUFBSSxFQUNuQjtBQUNFLFFBQUcsSUFBSSxDQUFDLElBQUksRUFBRTtBQUNaLFVBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUNiO0FBQ0QsUUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZCLGNBQVUsQ0FBQyxJQUFJLEVBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUN0RDtBQUNELE9BQUssRUFBQyxpQkFDTjs7QUFFRSxRQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDeEIsUUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0dBQ2hCO0FBQ0QsU0FBTyxFQUFDLG1CQUNSO0FBQ0UsUUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7QUFDNUIsVUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0IsVUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0tBQy9EO0dBQ0Y7QUFDRCxZQUFVLEVBQUUsb0JBQVUsTUFBTSxFQUFDO0FBQzNCLFFBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFdBQVc7O0FBQUMsQUFFbEQsU0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRTtBQUNqRCxZQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0tBQ2hDO0dBQ0Y7QUFDRCxPQUFLLEVBQUMsaUJBQ047QUFDRSxRQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDekIsUUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUM7R0FDbEQ7QUFDRCxRQUFNLEVBQUMsa0JBQ1A7QUFDRSxRQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtBQUM3QixVQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDeEIsVUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUN6QixVQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztBQUM5RCxXQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFO0FBQ2pELGNBQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLElBQUksTUFBTSxDQUFDO09BQ2pDO0FBQ0QsVUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ2hCO0dBQ0Y7QUFDRCxNQUFJLEVBQUUsZ0JBQ047QUFDRSxRQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtBQUM1QixrQkFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7O0FBQUMsQUFFMUIsVUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQ3hCLFVBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUNkO0dBQ0Y7QUFDRCxPQUFLLEVBQUMsaUJBQ047QUFDRSxTQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFDdEQ7QUFDRSxVQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ3hCO0dBQ0Y7QUFDRCxNQUFJLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDWCxNQUFJLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDWCxPQUFLLEVBQUMsQ0FBQyxHQUFHLENBQUM7Q0FDWjs7O0FBQUEsQUFHRCxTQUFTLEtBQUssQ0FBQyxLQUFLLEVBQUU7QUFDcEIsTUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDbkIsTUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ25FLE1BQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7Q0FDNUI7O0FBRUQsS0FBSyxDQUFDLFNBQVMsR0FBRztBQUNoQixJQUFFLEVBQUUsWUFBVSxDQUFDLEVBQUU7QUFDZixRQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzdDLFFBQUksS0FBSyxJQUFJLENBQUMsQ0FBQyxFQUFFO0FBQ2YsVUFBSSxDQUFDLENBQUMsT0FBTyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsT0FBTyxHQUFHLEVBQUUsRUFBRTtBQUNwQyxZQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztBQUM1QixZQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDcEQsaUJBQVMsQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQy9CLGlCQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDbkIsaUJBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxPQUFPLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQSxBQUFDLENBQUMsQ0FBQztPQUNoRDtBQUNELGFBQU8sSUFBSSxDQUFDO0tBQ2IsTUFBTTs7QUFFTCxVQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUN0QixZQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsUUFBUSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUEsQUFBQyxFQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2pFLFlBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDO09BQzFCO0FBQ0QsYUFBTyxLQUFLLENBQUM7S0FDZDtHQUVGO0FBQ0QsS0FBRyxFQUFFLGFBQVUsQ0FBQyxFQUFFO0FBQ2hCLFFBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDN0MsUUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDLEVBQUU7QUFDZixhQUFPLElBQUksQ0FBQztLQUNiLE1BQU07QUFDTCxVQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDckIsYUFBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25DLFlBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFDO09BQzNCO0FBQ0QsYUFBTyxLQUFLLENBQUM7S0FDZDtHQUNGO0NBQ0YsQ0FBQTs7QUFFTSxJQUFJLE9BQU8sV0FBUCxPQUFPLEdBQUc7QUFDbkIsTUFBSSxFQUFFLE1BQU07QUFDWixRQUFNLEVBQUUsQ0FDTjtBQUNFLFFBQUksRUFBRSxPQUFPO0FBQ2IsV0FBTyxFQUFFLENBQUM7QUFDVixRQUFJLEVBQ0osQ0FDRSxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEVBQzFCLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ3JELElBQUksQ0FBQyxHQUFHLEVBQUMsQ0FBQyxDQUFDLEVBQ1gsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFDdEIsUUFBUSxFQUNSLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FDUjtHQUNGLEVBQ0Q7QUFDRSxRQUFJLEVBQUUsT0FBTztBQUNiLFdBQU8sRUFBRSxDQUFDO0FBQ1YsUUFBSSxFQUNGLENBQ0EsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxFQUMxQixLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQy9DLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ1osQ0FBQyxFQUNELEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNyRCxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDM0IsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUNOO0dBQ0osRUFDRDtBQUNFLFFBQUksRUFBRSxPQUFPO0FBQ2IsV0FBTyxFQUFFLENBQUM7QUFDVixRQUFJLEVBQ0YsQ0FD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LENBQUMsRUFDN0QsSUFBSSxJQUFJLEVBQUUsRUFDVixJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQ3ZELElBQUksUUFBUSxFQUFFLEVBQ2QsSUFBSSxRQUFRLEVBQUUsRUFDZCxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUN4QyxJQUFJLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUNsRCxJQUFJLElBQUksRUFBRSxFQUNWLElBQUksVUFBVSxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxFQUNsRSxJQUFJLFVBQVUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsRUFDM0QsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQ1o7QUFDRCxDQUNFLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsRUFDdEQsSUFBSSxVQUFVLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsRUFDN0QsSUFBSSxJQUFJLEVBQUUsRUFDVixJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQ3ZELElBQUksUUFBUSxFQUFFLEVBQ2QsSUFBSSxRQUFRLEVBQUUsRUFDZCxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUN4QyxJQUFJLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUNsRCxJQUFJLElBQUksRUFBRSxFQUNWLElBQUksVUFBVSxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUNoRSxJQUFJLFVBQVUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsRUFDekQsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQ1o7QUFDRCxDQUNFLElBQUksVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQ2xELElBQUksVUFBVSxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUNoRSxJQUFJLElBQUksRUFBRSxFQUNWLElBQUksVUFBVSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUEsR0FBSSxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQ2xFLElBQUksUUFBUSxFQUFFLEVBQ2QsSUFBSSxRQUFRLEVBQUUsRUFDZCxJQUFJLFVBQVUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUN2QyxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQ3RELElBQUksSUFBSSxFQUFFLEVBQ1YsSUFBSSxVQUFVLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsRUFDL0QsSUFBSSxVQUFVLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxFQUM1RCxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FDWjtBQUNELENBQ0UsSUFBSSxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsRUFDbEQsSUFBSSxVQUFVLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQ2hFLElBQUksSUFBSSxFQUFFLEVBQ1YsSUFBSSxVQUFVLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQSxHQUFJLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsRUFDbEUsSUFBSSxJQUFJLEVBQUUsRUFDVixJQUFJLFFBQVEsRUFBRSxFQUNkLElBQUksUUFBUSxFQUFFLEVBQ2QsSUFBSSxVQUFVLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsRUFDdkMsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUN0RCxJQUFJLElBQUksRUFBRSxFQUNWLElBQUksVUFBVSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQzdELElBQUksVUFBVSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsRUFDMUQsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQ1osRUFDRDtBQUNFLElBQUksVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQ2pELElBQUksVUFBVSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsRUFDckQsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUNyRCxJQUFJLFFBQVEsRUFBRSxFQUNkLElBQUksUUFBUSxFQUFFLEVBQ2QsSUFBSSxVQUFVLENBQUMsQ0FBQyxFQUFFLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQ2hELElBQUksVUFBVSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsRUFDckQsSUFBSSxJQUFJLEVBQUUsRUFDVixJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQ3BELElBQUksVUFBVSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQzVELElBQUksVUFBVSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsRUFDekQsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQ1osRUFDRDtBQUNFLElBQUksVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQ2xELElBQUksVUFBVSxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUNoRSxJQUFJLFVBQVUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQUFBQyxDQUFDLEdBQUksSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUMzRCxJQUFJLFFBQVEsRUFBRSxFQUNkLElBQUksUUFBUSxFQUFFLEVBQ2QsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUN2RCxJQUFJLFVBQVUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsRUFDaEQsSUFBSSxJQUFJLEVBQUUsRUFDVixJQUFJLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUNoRCxJQUFJLFVBQVUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUMzRCxJQUFJLFVBQVUsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUN2RCxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FDWixFQUNEO0FBQ0UsSUFBSSxVQUFVLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUNwRCxJQUFJLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsRUFDM0MsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUNyRCxJQUFJLFFBQVEsRUFBRSxFQUNkLElBQUksUUFBUSxFQUFFLEVBQ2QsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsRUFDeEMsSUFBSSxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsRUFDbEQsSUFBSSxJQUFJLEVBQUUsRUFDVixJQUFJLFVBQVUsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFDbEUsSUFBSSxVQUFVLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEVBQzNELElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUNaLEVBQ0Q7QUFDRSxJQUFJLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUNqRCxJQUFJLElBQUksRUFBRSxFQUNWLElBQUksVUFBVSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsRUFDckQsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUNyRCxJQUFJLFVBQVUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQ3RELElBQUksUUFBUSxFQUFFLEVBQ2QsSUFBSSxRQUFRLEVBQUUsRUFDZCxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUN4QyxJQUFJLElBQUksRUFBRSxFQUNWLElBQUksVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQ2xELElBQUksVUFBVSxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxFQUNsRSxJQUFJLFVBQVUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsRUFDM0QsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQ1osQ0FDRixDQUNBO0FBQ0QsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsQ0FDM0I7OztBQUdFLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUNyQyxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFDdEMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQ3RDLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUN0QyxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUV4QyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFDeEMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQ3pDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUN6QyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFDekMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFFM0MsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFDdkMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFDeEMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFDeEMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFDeEMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFFeEMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFDMUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFDM0MsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFDM0MsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFDM0MsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFFM0MsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQ3JDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUN0QyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsRUFDdEMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQ3RDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUV0QyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUN0QyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUN2QyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUN2QyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUN2QyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUV2QyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQ3pDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsRUFDMUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUMxQyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQzFDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsRUFDMUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUMxQyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsRUFDdkMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQ3ZDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUV2QyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsRUFDMUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQzNDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUMzQyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsRUFDM0MsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQzNDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUMzQyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUN4QyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUN4QyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxF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RUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEFBQzFFLFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsS0FDL0U7O0FBRUQsU0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLEdBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNsRCxVQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUM1Qjs7QUFFRCxhQUFTLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0dBQzdDLE1BQU07QUFDTCxRQUFJLE1BQU0sR0FBRyxTQUFTLENBQUMsTUFBTTtRQUN6QixDQUFDLENBQUM7O0FBRU4sU0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDM0IsVUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUVwRixjQUFRLEdBQUc7QUFDVCxhQUFLLENBQUM7QUFBRSxtQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEFBQUMsTUFBTTtBQUFBLEFBQzFELGFBQUssQ0FBQztBQUFFLG1CQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEFBQUMsTUFBTTtBQUFBLEFBQzlELGFBQUssQ0FBQztBQUFFLG1CQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxBQUFDLE1BQU07QUFBQSxBQUNsRTtBQUNFLGNBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLEdBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUM3RCxnQkFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7V0FDNUI7O0FBRUQsbUJBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFBQSxPQUNyRDtLQUNGO0dBQ0Y7O0FBRUQsU0FBTyxJQUFJLENBQUM7Q0FDYjs7Ozs7Ozs7OztBQUFDLEFBVUYsWUFBWSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEdBQUcsU0FBUyxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUU7QUFDMUQsTUFBSSxRQUFRLEdBQUcsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLE9BQU8sSUFBSSxJQUFJLENBQUM7TUFDdEMsR0FBRyxHQUFHLE1BQU0sR0FBRyxNQUFNLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQzs7QUFFMUMsTUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDcEUsTUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxRQUFRLENBQUMsS0FDaEQ7QUFDSCxRQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsS0FDdkQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUN2QixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLFFBQVEsQ0FDNUIsQ0FBQztHQUNIOztBQUVELFNBQU8sSUFBSSxDQUFDO0NBQ2I7Ozs7Ozs7Ozs7QUFBQyxBQVVGLFlBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLFNBQVMsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFO0FBQzlELE1BQUksUUFBUSxHQUFHLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxPQUFPLElBQUksSUFBSSxFQUFFLElBQUksQ0FBQztNQUM1QyxHQUFHLEdBQUcsTUFBTSxHQUFHLE1BQU0sR0FBRyxLQUFLLEdBQUcsS0FBSyxDQUFDOztBQUUxQyxNQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNwRSxNQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxLQUNoRDtBQUNILFFBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsT0FBTyxD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QyxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7QUFDaEQsTUFBSSxDQUFDLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztBQUNqRCxRQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUNqQixRQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUNsQixNQUFJLEdBQUcsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2xDLEtBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMzQixNQUFJLElBQUksR0FBRyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3hDLE1BQUksUUFBUSxHQUFHLElBQUksS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ3BDO0FBQ0UsUUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDOztBQUVWLFNBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUU7QUFDMUIsV0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRTtBQUMxQixZQUFJLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQzs7QUFFOUIsWUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZCLFlBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN2QixZQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdkIsWUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLElB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IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb250cm9sbGVyIHtcclxuICBjb25zdHJ1Y3RvcihkZXZ0b29sKVxyXG4gIHtcclxuICAgIHRoaXMuZGV2dG9vbCA9IGRldnRvb2w7XHJcbiAgICBsZXQgZyA9IGRldnRvb2wuZ2FtZTtcclxuICAgIGxldCBkZWJ1Z1VpID0gZGV2dG9vbC5kZWJ1Z1VpO1xyXG4gICAgLy8g5Yi25b6h55S76Z2iIFxyXG4gICAgbGV0IHRvZ2dsZSA9IGRldnRvb2wudG9nZ2xlR2FtZSgpO1xyXG4gICAgXHJcbiAgICBsZXQgY29udHJvbGxlckRhdGEgPSBcclxuICAgIFtcclxuICAgICAgLy/jgIDjgrLjg7zjg6Djg5fjg6zjgqRcclxuICAgICAge1xyXG4gICAgICAgIG5hbWU6J3BsYXknLFxyXG4gICAgICAgIGZ1bmMoKXtcclxuICAgICAgICAgIHRoaXMuYXR0cignY2xhc3MnLHRvZ2dsZS5uZXh0KGZhbHNlKS52YWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICBdO1xyXG4gICAgXHJcbiAgICBsZXQgY29udHJvbGxlciA9IGRlYnVnVWkuYXBwZW5kKCdkaXYnKS5hdHRyKCdpZCcsJ2NvbnRyb2wnKS5jbGFzc2VkKCdjb250cm9sbGVyJyx0cnVlKTtcclxuICAgIGxldCBidXR0b25zID0gY29udHJvbGxlci5zZWxlY3RBbGwoJ2J1dHRvbicpLmRhdGEoY29udHJvbGxlckRhdGEpXHJcbiAgICAuZW50ZXIoKS5hcHBlbmQoJ2J1dHRvbicpO1xyXG4gICAgYnV0dG9ucy5hdHRyKCdjbGFzcycsZD0+ZC5uYW1lKTtcclxuICAgIFxyXG4gICAgYnV0dG9ucy5vbignY2xpY2snLGZ1bmN0aW9uKGQpe1xyXG4gICAgICBkLmZ1bmMuYXBwbHkoZDMuc2VsZWN0KHRoaXMpKTtcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICBjb250cm9sbGVyLmFwcGVuZCgnc3BhbicpLnRleHQoJ+OCueODhuODvOOCuCcpLnN0eWxlKHsnd2lkdGgnOicxMDBweCcsJ2Rpc3BsYXknOidpbmxpbmUtYmxvY2snLCd0ZXh0LWFsaWduJzonY2VudGVyJ30pO1xyXG4gICAgXHJcbiAgICB2YXIgc3RhZ2UgPSBjb250cm9sbGVyXHJcbiAgICAuYXBwZW5kKCdpbnB1dCcpXHJcbiAgICAuYXR0cih7J3R5cGUnOid0ZXh0JywndmFsdWUnOmcuc3RhZ2Uubm99KVxyXG4gICAgLnN0eWxlKHsnd2lkdGgnOic0MHB4JywndGV4dC1hbGlnbic6J3JpZ2h0J30pO1xyXG4gICAgZy5zdGFnZS5vbigndXBkYXRlJywoZCk9PntcclxuICAgICAgc3RhZ2Uubm9kZSgpLnZhbHVlID0gZC5ubztcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICBzdGFnZS5vbignY2hhbmdlJyxmdW5jdGlvbigpe1xyXG4gICAgICBsZXQgdiA9ICBwYXJzZUludCh0aGlzLnZhbHVlKTtcclxuICAgICAgaWYoZy5zdGFnZS5ubyAhPSB2KXtcclxuICAgICAgICBnLnN0YWdlLmp1bXAodik7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICBcclxuICB9XHJcbn1cclxuIiwiIFwidXNlIHN0cmljdFwiO1xyXG4vL3ZhciBTVEFHRV9NQVggPSAxO1xyXG5pbXBvcnQgKiBhcyBzZmcgZnJvbSAnLi4vLi4vanMvZ2xvYmFsJzsgXHJcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi4vLi4vanMvdXRpbCc7XHJcbmltcG9ydCAqIGFzIGF1ZGlvIGZyb20gJy4uLy4uL2pzL2F1ZGlvJztcclxuLy9pbXBvcnQgKiBhcyBzb25nIGZyb20gJy4vc29uZyc7XHJcbmltcG9ydCAqIGFzIGdyYXBoaWNzIGZyb20gJy4uLy4uL2pzL2dyYXBoaWNzJztcclxuaW1wb3J0ICogYXMgaW8gZnJvbSAnLi4vLi4vanMvaW8nO1xyXG5pbXBvcnQgKiBhcyBjb21tIGZyb20gJy4uLy4uL2pzL2NvbW0nO1xyXG5pbXBvcnQgKiBhcyB0ZXh0IGZyb20gJy4uLy4uL2pzL3RleHQnO1xyXG5pbXBvcnQgKiBhcyBnYW1lb2JqIGZyb20gJy4uLy4uL2pzL2dhbWVvYmonO1xyXG5pbXBvcnQgKiBhcyBteXNoaXAgZnJvbSAnLi4vLi4vanMvbXlzaGlwJztcclxuaW1wb3J0ICogYXMgZW5lbWllcyBmcm9tICcuLi8uLi9qcy9lbmVtaWVzJztcclxuaW1wb3J0ICogYXMgZWZmZWN0b2JqIGZyb20gJy4uLy4uL2pzL2VmZmVjdG9iaic7XHJcbmltcG9ydCB7IERldlRvb2wgfSBmcm9tICcuL2RldnRvb2wnO1xyXG5pbXBvcnQgeyBHYW1lIH0gZnJvbSAnLi4vLi4vanMvZ2FtZSc7XHJcblxyXG4vLy8g44Oh44Kk44OzXHJcbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgc2ZnLmdhbWUgPSBuZXcgR2FtZSgpO1xyXG4gIHNmZy5kZXZUb29sID0gbmV3IERldlRvb2woc2ZnLmdhbWUpOyAgXHJcbiAgc2ZnLmdhbWUuZXhlYygpO1xyXG59O1xyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmltcG9ydCAqIGFzIHNmZyBmcm9tICcuLi8uLi9qcy9nbG9iYWwnO1xyXG5pbXBvcnQgKiBhcyBhdWRpbyBmcm9tICcuLi8uLi9qcy9hdWRpbyc7XHJcbmltcG9ydCBDb250cm9sbGVyIGZyb20gJy4vY29udHJvbGxlcic7XHJcbmltcG9ydCBFbmVteUVkaXRvciBmcm9tICcuL2VuZW15RWRpdG9yJztcclxuXHJcblxyXG5leHBvcnQgY2xhc3MgRGV2VG9vbCB7XHJcbiAgY29uc3RydWN0b3IoZ2FtZSkge1xyXG4gICAgdGhpcy5nYW1lID0gZ2FtZTtcclxuLy8gICAgdGhpcy5zdGF0dXMgPSBEZXZUb29sLlNUQVRVUy5TVE9QO1xyXG4gICAgdGhpcy5rZXlkb3duID0gdGhpcy5rZXlkb3duXygpO1xyXG4gICAgdGhpcy5rZXlkb3duLm5leHQoKTtcclxuICAgIGQzLnNlbGVjdCgnYm9keScpLm9uKCdrZXlkb3duLkRldlRvb2wnLCAoKSA9PiB7XHJcbiAgICAgIHZhciBlID0gZDMuZXZlbnQ7XHJcbiAgICAgIGlmKHRoaXMua2V5ZG93bi5uZXh0KGUpLnZhbHVlKXtcclxuICAgICAgICBkMy5ldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIGQzLmV2ZW50LmNhbmNlbEJ1YmJsZSA9IHRydWU7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9O1xyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIHZhciB0aGlzXyA9IHRoaXM7XHJcbiAgICB2YXIgaW5pdENvbnNvbGUgPSBnYW1lLmluaXRDb25zb2xlO1xyXG4gICAgZ2FtZS5pbml0Q29uc29sZSA9IChmdW5jdGlvbigpXHJcbiAgICB7XHJcbiAgICAgIGluaXRDb25zb2xlLmFwcGx5KGdhbWUsWydjb25zb2xlLWRlYnVnJ10pO1xyXG4gICAgICB0aGlzXy5pbml0Q29uc29sZSgpO1xyXG4gICAgICBkMy5zZWxlY3QoJyNjb25zb2xlJykuYXR0cigndGFiSW5kZXgnLDEpO1xyXG4gICAgfSkuYmluZChnYW1lKTtcclxuICAgIFxyXG4gICAgZ2FtZS5iYXNpY0lucHV0LmJpbmQgPSBmdW5jdGlvbigpe1xyXG4gICAgICBkMy5zZWxlY3QoJyNjb25zb2xlJykub24oJ2tleWRvd24uYmFzaWNJbnB1dCcsZ2FtZS5iYXNpY0lucHV0LmtleWRvd24uYmluZChnYW1lLmJhc2ljSW5wdXQpKTtcclxuICAgICAgZDMuc2VsZWN0KCcjY29uc29sZScpLm9uKCdrZXl1cC5iYXNpY0lucHV0JyxnYW1lLmJhc2ljSW5wdXQua2V5dXAuYmluZChnYW1lLmJhc2ljSW5wdXQpKTtcclxuICAgIH07XHJcbiAgICBcclxuICAgIGdhbWUuYmFzaWNJbnB1dC51bmJpbmQgPSBmdW5jdGlvbigpe1xyXG4gICAgICBkMy5zZWxlY3QoJyNjb25zb2xlJykub24oJ2tleWRvd24uYmFzaWNJbnB1dCcsbnVsbCk7XHJcbiAgICAgIGQzLnNlbGVjdCgnI2NvbnNvbGUnKS5vbigna2V5dXAuYmFzaWNJbnB1dCcsbnVsbCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGdhbWUuZ2FtZUluaXQgPSBmdW5jdGlvbiogKHRhc2tJbmRleCkge1xyXG4gICAgICB0YXNrSW5kZXggPSB5aWVsZDtcclxuXHJcbiAgICAgIC8vIOOCquODvOODh+OCo+OCquOBrumWi+Wni1xyXG4gICAgICB0aGlzLmF1ZGlvXy5zdGFydCgpO1xyXG4gICAgICB0aGlzLnNlcXVlbmNlci5sb2FkKGF1ZGlvLnNlcURhdGEpO1xyXG4gICAgICB0aGlzLnNlcXVlbmNlci5zdGFydCgpO1xyXG4gICAgICAvL3NmZy5zdGFnZS5yZXNldCgpO1xyXG4gICAgICB0aGlzLnRleHRQbGFuZS5jbHMoKTtcclxuICAgICAgdGhpcy5lbmVtaWVzLnJlc2V0KCk7XHJcblxyXG4gICAgICAvLyDoh6rmqZ/jga7liJ3mnJ/ljJZcclxuICAgICAgdGhpcy5teXNoaXBfLmluaXQoKTtcclxuICAgICAgc2ZnLmdhbWVUaW1lci5zdGFydCgpO1xyXG4gICAgICB0aGlzLnNjb3JlID0gMDtcclxuICAgICAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMiwgMCwgJ1Njb3JlICAgIEhpZ2ggU2NvcmUnKTtcclxuICAgICAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMjAsIDM5LCAnUmVzdDogICAnICsgc2ZnLm15c2hpcF8ucmVzdCk7XHJcbiAgICAgIHRoaXMucHJpbnRTY29yZSgpO1xyXG4gICAgICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5zdGFnZUluaXQuYmluZCh0aGlzKS8qZ2FtZUFjdGlvbiovKTtcclxuICAgXHJcbiAgICB9O1xyXG4gICAgZ2FtZS5pbml0ID0gKGZ1bmN0aW9uKih0YXNrSW5kZXgpe1xyXG4gICAgICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICAgICAgdGhpcy5pbml0XygpO1xyXG4gICAgfSkuYmluZChnYW1lKTsgICAgICBcclxuICAgIFxyXG4gIH1cclxuXHJcbiAgKmtleWRvd25fKCkge1xyXG4gICAgdmFyIGUgPSB5aWVsZDtcclxuICAgIHdoaWxlICh0cnVlKSB7XHJcbiAgICAgIHZhciBwcm9jZXNzID0gZmFsc2U7XHJcbiAgICAgIGlmIChlLmtleUNvZGUgPT0gMTkyKSB7IC8vIEAgS2V5XHJcbiAgICAgICAgc2ZnLkNIRUNLX0NPTExJU0lPTiA9ICFzZmcuQ0hFQ0tfQ09MTElTSU9OO1xyXG4gICAgICAgIHByb2Nlc3MgPSB0cnVlO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgLy8gaWYgKGUua2V5Q29kZSA9PSA4MCAvKiBQICovKSB7XHJcbiAgICAgIC8vICAgaWYgKCFzZmcucGF1c2UpIHtcclxuICAgICAgLy8gICAgIHRoaXMuZ2FtZS5wYXVzZSgpO1xyXG4gICAgICAvLyAgIH0gZWxzZSB7XHJcbiAgICAgIC8vICAgICB0aGlzLmdhbWUucmVzdW1lKCk7XHJcbiAgICAgIC8vICAgfVxyXG4gICAgICAvLyAgIHByb2Nlc3MgPSB0cnVlO1xyXG4gICAgICAvLyB9XHJcblxyXG4gICAgICBpZiAoZS5rZXlDb2RlID09IDg4IC8qIFggKi8gJiYgc2ZnLkRFQlVHKSB7XHJcbiAgICAgICAgaWYgKCFzZmcucGF1c2UpIHtcclxuICAgICAgICAgIHRoaXMuZ2FtZS5wYXVzZSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmdhbWUucmVzdW1lKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByb2Nlc3MgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGUgPSB5aWVsZCBwcm9jZXNzO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gXHJcbiAgaW5pdENvbnNvbGUoKXtcclxuICAgIC8vIFN0YXRzIOOCquODluOCuOOCp+OCr+ODiChGUFPooajnpLop44Gu5L2c5oiQ6KGo56S6XHJcbiAgICBsZXQgZyA9IHRoaXMuZ2FtZTtcclxuICAgIGxldCB0aGlzXyA9IHRoaXM7XHJcbiAgICBnLnN0YXRzID0gbmV3IFN0YXRzKCk7XHJcbiAgICBnLnN0YXRzLmRvbUVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xyXG4gICAgZy5zdGF0cy5kb21FbGVtZW50LnN0eWxlLnRvcCA9ICcwcHgnO1xyXG4gICAgZy5zdGF0cy5kb21FbGVtZW50LnN0eWxlLmxlZnQgPSAnMHB4JztcclxuICAgIGcuc3RhdHMuZG9tRWxlbWVudC5zdHlsZS5sZWZ0ID0gcGFyc2VGbG9hdChnLnJlbmRlcmVyLmRvbUVsZW1lbnQuc3R5bGUubGVmdCkgLSBwYXJzZUZsb2F0KGcuc3RhdHMuZG9tRWxlbWVudC5zdHlsZS53aWR0aCkgKyAncHgnO1xyXG5cclxuICAgIGxldCBkZWJ1Z1VpID0gdGhpcy5kZWJ1Z1VpID0gZDMuc2VsZWN0KCcjY29udGVudCcpXHJcbiAgICAuYXBwZW5kKCdkaXYnKS5hdHRyKCdjbGFzcycsJ2RldnRvb2wnKVxyXG4gICAgLnN0eWxlKCdoZWlnaHQnLGcuQ09OU09MRV9IRUlHSFQgKyAncHgnKTtcclxuICAgIGRlYnVnVWkubm9kZSgpLmFwcGVuZENoaWxkKGcuc3RhdHMuZG9tRWxlbWVudCk7XHJcbiAgICBcclxuICAgIC8vIOOCv+ODluioreWumlxyXG4gICAgbGV0IG1lbnUgPSBkZWJ1Z1VpLmFwcGVuZCgndWwnKS5jbGFzc2VkKCdtZW51Jyx0cnVlKTtcclxuICAgIG1lbnUuc2VsZWN0QWxsKCdsaScpLmRhdGEoXHJcbiAgICAgIFt7bmFtZTon5Yi25b6hJyxpZDonI2NvbnRyb2wnLGVkaXRvcjpDb250cm9sbGVyfSx7bmFtZTon5pW1JyxpZDonI2VuZW15JyxlZGl0b3I6RW5lbXlFZGl0b3J9Lyose25hbWU6J+mfs+a6kCcsaWQ6JyNhdWRpbyd9LHtuYW1lOifnlLvlg48nLGlkOicjZ3JhcGhpY3MnfSovXVxyXG4gICAgKVxyXG4gICAgLmVudGVyKCkuYXBwZW5kKCdsaScpXHJcbiAgICAudGV4dCgoZCk9PmQubmFtZSlcclxuICAgIC5vbignY2xpY2snLGZ1bmN0aW9uKGQsaSl7XHJcbiAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgbWVudS5zZWxlY3RBbGwoJ2xpJykuZWFjaChmdW5jdGlvbihkLGlkeCl7XHJcbiAgICAgICAgIGlmKHNlbGYgPT0gdGhpcyl7XHJcbiAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmNsYXNzZWQoJ2FjdGl2ZScsdHJ1ZSk7XHJcbiAgICAgICAgICAgZDMuc2VsZWN0KGQuaWQpLnN0eWxlKCdkaXNwbGF5JywnYmxvY2snKTtcclxuICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICBkMy5zZWxlY3QodGhpcykuY2xhc3NlZCgnYWN0aXZlJyxmYWxzZSk7XHJcbiAgICAgICAgICAgZDMuc2VsZWN0KGQuaWQpLnN0eWxlKCdkaXNwbGF5Jywnbm9uZScpO1xyXG4gICAgICAgICB9ICAgICAgIFxyXG4gICAgICB9KTtcclxuICAgIH0pLmVhY2goZnVuY3Rpb24oZCxpKXtcclxuICAgICAgaWYoIWkpe1xyXG4gICAgICAgIGQzLnNlbGVjdCh0aGlzKS5jbGFzc2VkKCdhY3RpdmUnLHRydWUpO1xyXG4gICAgICAgIGQzLnNlbGVjdChkLmlkKS5zdHlsZSgnZGlzcGxheScsJ2Jsb2NrJyk7XHJcbiAgICAgIH1cclxuICAgICAgZC5pbnN0ID0gbmV3IGQuZWRpdG9yKHRoaXNfKTtcclxuICAgIH0pXHJcbiAgICA7XHJcbiAgICBcclxuXHJcbiAgfVxyXG4gIFxyXG4gIFxyXG4gICp0b2dnbGVHYW1lKCkge1xyXG4gICAgLy8g6ZaL5aeL5Yem55CGXHJcbiAgICBsZXQgY2FuY2VsID0gZmFsc2U7XHJcbiAgICB3aGlsZSAoIWNhbmNlbCkge1xyXG4gICAgICBsZXQgZyA9IHRoaXMuZ2FtZTtcclxuICAgICAgZy50YXNrcy5wdXNoVGFzayhnLmJhc2ljSW5wdXQudXBkYXRlLmJpbmQoZy5iYXNpY0lucHV0KSk7XHJcbiAgICAgIGcuYmFzaWNJbnB1dC5iaW5kKCk7XHJcbiAgICAgIGcudGFza3MucHVzaFRhc2soZy5yZW5kZXIuYmluZChnKSwgZy5SRU5ERVJFUl9QUklPUklUWSk7XHJcbiAgICAgIGcudGFza3MucHVzaFRhc2soZy5nYW1lSW5pdC5iaW5kKGcpKTtcclxuXHJcbiAgICAgIGlmIChnLnNwYWNlRmllbGQpIHtcclxuICAgICAgICBnLnRhc2tzLnB1c2hUYXNrKGcubW92ZVNwYWNlRmllbGQuYmluZChnKSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZy5zaG93U3BhY2VGaWVsZCgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIWcudGFza3MuZW5hYmxlKSB7XHJcbiAgICAgICAgZy50YXNrcy5lbmFibGUgPSB0cnVlO1xyXG4gICAgICAgIGcubWFpbigpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjYW5jZWwgPSB5aWVsZCAnc3RvcCc7XHJcbiAgICAgIGlmIChjYW5jZWwpIGJyZWFrO1xyXG4gICAgICBcclxuICAgICAgLy8g5YGc5q2i5Yem55CGXHJcbiAgICBcclxuICAgICAgLy8g55S76Z2i5raI5Y67XHJcbiAgICAgIGlmIChnLnRhc2tzLmVuYWJsZSl7XHJcbiAgICAgICAgZy50YXNrcy5zdG9wUHJvY2VzcygpXHJcbiAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgIGcuZW5lbWllcy5yZXNldCgpO1xyXG4gICAgICAgICAgICBnLmVuZW15QnVsbGV0cy5yZXNldCgpO1xyXG4gICAgICAgICAgICBnLmJvbWJzLnJlc2V0KCk7XHJcbiAgICAgICAgICAgIGcubXlzaGlwXy5yZXNldCgpO1xyXG4gICAgICAgICAgICBnLnRhc2tzLmNsZWFyKCk7XHJcbiAgICAgICAgICAgIGcudGV4dFBsYW5lLmNscygpO1xyXG4gICAgICAgICAgICBnLnJlbmRlcmVyLmNsZWFyKCk7XHJcbiAgICAgICAgICAgIGcuc2VxdWVuY2VyLnN0b3AoKTtcclxuICAgICAgICAgICAgZy5iYXNpY0lucHV0LnVuYmluZCgpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgICAgY2FuY2VsID0geWllbGQgJ3BsYXknO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFbmVteUVkaXRvciB7XHJcbiAgY29uc3RydWN0b3IoZGV2VG9vbClcclxuICB7XHJcbiAgICB0aGlzLmRldlRvb2wgPSBkZXZUb29sO1xyXG4gICAgLy8g5pW1XHJcbiAgICBkZXZUb29sLmRlYnVnVWkuYXBwZW5kKCdkaXYnKS5hdHRyKCdpZCcsJ2VuZW15JykudGV4dCgnZW5lbXknKS5zdHlsZSgnZGlzcGxheScsJ25vbmUnKTtcclxuXHJcbiAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cImdyYXBoaWNzLmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cImlvLmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInNvbmcuanNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwidGV4dC5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJ1dGlsLmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cImRzcC5qc1wiIC8+XHJcblwidXNlIHN0cmljdFwiO1xyXG4vLy8vIFdlYiBBdWRpbyBBUEkg44Op44OD44OR44O844Kv44Op44K5IC8vLy9cclxudmFyIGZmdCA9IG5ldyBGRlQoNDA5NiwgNDQxMDApO1xyXG52YXIgQlVGRkVSX1NJWkUgPSAxMDI0O1xyXG52YXIgVElNRV9CQVNFID0gOTY7XHJcblxyXG52YXIgbm90ZUZyZXEgPSBbXTtcclxuZm9yICh2YXIgaSA9IC04MTsgaSA8IDQ2OyArK2kpIHtcclxuICBub3RlRnJlcS5wdXNoKE1hdGgucG93KDIsIGkgLyAxMikpO1xyXG59XHJcblxyXG52YXIgU3F1YXJlV2F2ZSA9IHtcclxuICBiaXRzOiA0LFxyXG4gIHdhdmVkYXRhOiBbMHhmLCAweGYsIDB4ZiwgMHhmLCAweGYsIDB4ZiwgMHhmLCAweGYsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdXHJcbn07Ly8gNGJpdCB3YXZlIGZvcm1cclxuXHJcbnZhciBTYXdXYXZlID0ge1xyXG4gIGJpdHM6IDQsXHJcbiAgd2F2ZWRhdGE6IFsweDAsIDB4MSwgMHgyLCAweDMsIDB4NCwgMHg1LCAweDYsIDB4NywgMHg4LCAweDksIDB4YSwgMHhiLCAweGMsIDB4ZCwgMHhlLCAweGZdXHJcbn07Ly8gNGJpdCB3YXZlIGZvcm1cclxuXHJcbnZhciBUcmlXYXZlID0ge1xyXG4gIGJpdHM6IDQsXHJcbiAgd2F2ZWRhdGE6IFsweDAsIDB4MiwgMHg0LCAweDYsIDB4OCwgMHhBLCAweEMsIDB4RSwgMHhGLCAweEUsIDB4QywgMHhBLCAweDgsIDB4NiwgMHg0LCAweDJdXHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZGVjb2RlU3RyKGJpdHMsIHdhdmVzdHIpIHtcclxuICB2YXIgYXJyID0gW107XHJcbiAgdmFyIG4gPSBiaXRzIC8gNCB8IDA7XHJcbiAgdmFyIGMgPSAwO1xyXG4gIHZhciB6ZXJvcG9zID0gMSA8PCAoYml0cyAtIDEpO1xyXG4gIHdoaWxlIChjIDwgd2F2ZXN0ci5sZW5ndGgpIHtcclxuICAgIHZhciBkID0gMDtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgKytpKSB7XHJcbiAgICAgIGV2YWwoXCJkID0gKGQgPDwgNCkgKyAweFwiICsgd2F2ZXN0ci5jaGFyQXQoYysrKSArIFwiO1wiKTtcclxuICAgIH1cclxuICAgIGFyci5wdXNoKChkIC0gemVyb3BvcykgLyB6ZXJvcG9zKTtcclxuICB9XHJcbiAgcmV0dXJuIGFycjtcclxufVxyXG5cclxudmFyIHdhdmVzID0gW1xyXG4gICAgZGVjb2RlU3RyKDQsICdFRUVFRUVFRUVFRUVFRUVFMDAwMDAwMDAwMDAwMDAwMCcpLFxyXG4gICAgZGVjb2RlU3RyKDQsICcwMDExMjIzMzQ0NTU2Njc3ODg5OUFBQkJDQ0RERUVGRicpLFxyXG4gICAgZGVjb2RlU3RyKDQsICcwMjM0NjY0NTlBQThBN0E5Nzc5NjU2NTZBQ0FBQ0RFRicpLFxyXG4gICAgZGVjb2RlU3RyKDQsICdCRENEQ0E5OTlBQ0RDREI5NDIxMjM2Nzc3NjMyMTI0NycpLFxyXG4gICAgZGVjb2RlU3RyKDQsICc3QUNERURDQTc0MjEwMTI0N0JERURCNzMyMDEzN0U3OCcpLFxyXG4gICAgZGVjb2RlU3RyKDQsICdBQ0NBNzc5QkRFREE2NjY3OTk5NDEwMTI2Nzc0MjI0NycpLFxyXG4gICAgZGVjb2RlU3RyKDQsICc3RUM5Q0VBN0NGRDhBQjcyOEQ5NDU3MjAzODUxMzUzMScpLFxyXG4gICAgZGVjb2RlU3RyKDQsICdFRTc3RUU3N0VFNzdFRTc3MDA3NzAwNzcwMDc3MDA3NycpLFxyXG4gICAgZGVjb2RlU3RyKDQsICdFRUVFODg4ODg4ODg4ODg4MDAwMDg4ODg4ODg4ODg4OCcpLy/jg47jgqTjgrrnlKjjga7jg4Djg5/jg7zms6LlvaJcclxuXTtcclxuXHJcbnZhciB3YXZlU2FtcGxlcyA9IFtdO1xyXG5leHBvcnQgZnVuY3Rpb24gV2F2ZVNhbXBsZShhdWRpb2N0eCwgY2gsIHNhbXBsZUxlbmd0aCwgc2FtcGxlUmF0ZSkge1xyXG5cclxuICB0aGlzLnNhbXBsZSA9IGF1ZGlvY3R4LmNyZWF0ZUJ1ZmZlcihjaCwgc2FtcGxlTGVuZ3RoLCBzYW1wbGVSYXRlIHx8IGF1ZGlvY3R4LnNhbXBsZVJhdGUpO1xyXG4gIHRoaXMubG9vcCA9IGZhbHNlO1xyXG4gIHRoaXMuc3RhcnQgPSAwO1xyXG4gIHRoaXMuZW5kID0gKHNhbXBsZUxlbmd0aCAtIDEpIC8gKHNhbXBsZVJhdGUgfHwgYXVkaW9jdHguc2FtcGxlUmF0ZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVXYXZlU2FtcGxlRnJvbVdhdmVzKGF1ZGlvY3R4LCBzYW1wbGVMZW5ndGgpIHtcclxuICBmb3IgKHZhciBpID0gMCwgZW5kID0gd2F2ZXMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgIHZhciBzYW1wbGUgPSBuZXcgV2F2ZVNhbXBsZShhdWRpb2N0eCwgMSwgc2FtcGxlTGVuZ3RoKTtcclxuICAgIHdhdmVTYW1wbGVzLnB1c2goc2FtcGxlKTtcclxuICAgIGlmIChpICE9IDgpIHtcclxuICAgICAgdmFyIHdhdmVkYXRhID0gd2F2ZXNbaV07XHJcbiAgICAgIHZhciBkZWx0YSA9IDQ0MC4wICogd2F2ZWRhdGEubGVuZ3RoIC8gYXVkaW9jdHguc2FtcGxlUmF0ZTtcclxuICAgICAgdmFyIHN0aW1lID0gMDtcclxuICAgICAgdmFyIG91dHB1dCA9IHNhbXBsZS5zYW1wbGUuZ2V0Q2hhbm5lbERhdGEoMCk7XHJcbiAgICAgIHZhciBsZW4gPSB3YXZlZGF0YS5sZW5ndGg7XHJcbiAgICAgIHZhciBpbmRleCA9IDA7XHJcbiAgICAgIHZhciBlbmRzYW1wbGUgPSAwO1xyXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHNhbXBsZUxlbmd0aDsgKytqKSB7XHJcbiAgICAgICAgaW5kZXggPSBzdGltZSB8IDA7XHJcbiAgICAgICAgb3V0cHV0W2pdID0gd2F2ZWRhdGFbaW5kZXhdO1xyXG4gICAgICAgIHN0aW1lICs9IGRlbHRhO1xyXG4gICAgICAgIGlmIChzdGltZSA+PSBsZW4pIHtcclxuICAgICAgICAgIHN0aW1lID0gc3RpbWUgLSBsZW47XHJcbiAgICAgICAgICBlbmRzYW1wbGUgPSBqO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBzYW1wbGUuZW5kID0gZW5kc2FtcGxlIC8gYXVkaW9jdHguc2FtcGxlUmF0ZTtcclxuICAgICAgc2FtcGxlLmxvb3AgPSB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8g44Oc44Kk44K5OOOBr+ODjuOCpOOCuuazouW9ouOBqOOBmeOCi1xyXG4gICAgICB2YXIgb3V0cHV0ID0gc2FtcGxlLnNhbXBsZS5nZXRDaGFubmVsRGF0YSgwKTtcclxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBzYW1wbGVMZW5ndGg7ICsraikge1xyXG4gICAgICAgIG91dHB1dFtqXSA9IE1hdGgucmFuZG9tKCkgKiAyLjAgLSAxLjA7XHJcbiAgICAgIH1cclxuICAgICAgc2FtcGxlLmVuZCA9IHNhbXBsZUxlbmd0aCAvIGF1ZGlvY3R4LnNhbXBsZVJhdGU7XHJcbiAgICAgIHNhbXBsZS5sb29wID0gdHJ1ZTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBXYXZlVGV4dHVyZSh3YXZlKSB7XHJcbiAgdGhpcy53YXZlID0gd2F2ZSB8fCB3YXZlc1swXTtcclxuICB0aGlzLnRleCA9IG5ldyBDYW52YXNUZXh0dXJlKDMyMCwgMTAgKiAxNik7XHJcbiAgdGhpcy5yZW5kZXIoKTtcclxufVxyXG5cclxuV2F2ZVRleHR1cmUucHJvdG90eXBlID0ge1xyXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGN0eCA9IHRoaXMudGV4LmN0eDtcclxuICAgIHZhciB3YXZlID0gdGhpcy53YXZlO1xyXG4gICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjdHguY2FudmFzLndpZHRoLCBjdHguY2FudmFzLmhlaWdodCk7XHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnd2hpdGUnO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzMjA7IGkgKz0gMTApIHtcclxuICAgICAgY3R4Lm1vdmVUbyhpLCAwKTtcclxuICAgICAgY3R4LmxpbmVUbyhpLCAyNTUpO1xyXG4gICAgfVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxNjA7IGkgKz0gMTApIHtcclxuICAgICAgY3R4Lm1vdmVUbygwLCBpKTtcclxuICAgICAgY3R4LmxpbmVUbygzMjAsIGkpO1xyXG4gICAgfVxyXG4gICAgY3R4LmZpbGxTdHlsZSA9ICdyZ2JhKDI1NSwyNTUsMjU1LDAuNyknO1xyXG4gICAgY3R4LnJlY3QoMCwgMCwgY3R4LmNhbnZhcy53aWR0aCwgY3R4LmNhbnZhcy5oZWlnaHQpO1xyXG4gICAgY3R4LnN0cm9rZSgpO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGMgPSAwOyBpIDwgY3R4LmNhbnZhcy53aWR0aDsgaSArPSAxMCwgKytjKSB7XHJcbiAgICAgIGN0eC5maWxsUmVjdChpLCAod2F2ZVtjXSA+IDApID8gODAgLSB3YXZlW2NdICogODAgOiA4MCwgMTAsIE1hdGguYWJzKHdhdmVbY10pICogODApO1xyXG4gICAgfVxyXG4gICAgdGhpcy50ZXgudGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgfVxyXG59O1xyXG5cclxuLy8vIOOCqOODs+ODmeODreODvOODl+OCuOOCp+ODjeODrOODvOOCv+ODvFxyXG5leHBvcnQgZnVuY3Rpb24gRW52ZWxvcGVHZW5lcmF0b3Iodm9pY2UsIGF0dGFjaywgZGVjYXksIHN1c3RhaW4sIHJlbGVhc2UpIHtcclxuICB0aGlzLnZvaWNlID0gdm9pY2U7XHJcbiAgLy90aGlzLmtleW9uID0gZmFsc2U7XHJcbiAgdGhpcy5hdHRhY2sgPSBhdHRhY2sgfHwgMC4wMDA1O1xyXG4gIHRoaXMuZGVjYXkgPSBkZWNheSB8fCAwLjA1O1xyXG4gIHRoaXMuc3VzdGFpbiA9IHN1c3RhaW4gfHwgMC41O1xyXG4gIHRoaXMucmVsZWFzZSA9IHJlbGVhc2UgfHwgMC41O1xyXG4gIHRoaXMudiA9IDEuMDtcclxuXHJcbn07XHJcblxyXG5FbnZlbG9wZUdlbmVyYXRvci5wcm90b3R5cGUgPVxyXG57XHJcbiAga2V5b246IGZ1bmN0aW9uICh0LHZlbCkge1xyXG4gICAgdGhpcy52ID0gdmVsIHx8IDEuMDtcclxuICAgIHZhciB2ID0gdGhpcy52O1xyXG4gICAgdmFyIHQwID0gdCB8fCB0aGlzLnZvaWNlLmF1ZGlvY3R4LmN1cnJlbnRUaW1lO1xyXG4gICAgdmFyIHQxID0gdDAgKyB0aGlzLmF0dGFjayAqIHY7XHJcbiAgICB2YXIgZ2FpbiA9IHRoaXMudm9pY2UuZ2Fpbi5nYWluO1xyXG4gICAgZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXModDApO1xyXG4gICAgZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLCB0MCk7XHJcbiAgICBnYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHYsIHQxKTtcclxuICAgIGdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUodGhpcy5zdXN0YWluICogdiwgdDAgKyB0aGlzLmRlY2F5IC8gdik7XHJcbiAgICAvL2dhaW4uc2V0VGFyZ2V0QXRUaW1lKHRoaXMuc3VzdGFpbiAqIHYsIHQxLCB0MSArIHRoaXMuZGVjYXkgLyB2KTtcclxuICB9LFxyXG4gIGtleW9mZjogZnVuY3Rpb24gKHQpIHtcclxuICAgIHZhciB2b2ljZSA9IHRoaXMudm9pY2U7XHJcbiAgICB2YXIgZ2FpbiA9IHZvaWNlLmdhaW4uZ2FpbjtcclxuICAgIHZhciB0MCA9IHQgfHwgdm9pY2UuYXVkaW9jdHguY3VycmVudFRpbWU7XHJcbiAgICBnYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyh0MCk7XHJcbiAgICAvL2dhaW4uc2V0VmFsdWVBdFRpbWUoMCwgdDAgKyB0aGlzLnJlbGVhc2UgLyB0aGlzLnYpO1xyXG4gICAgLy9nYWluLnNldFRhcmdldEF0VGltZSgwLCB0MCwgdDAgKyB0aGlzLnJlbGVhc2UgLyB0aGlzLnYpO1xyXG4gICAgZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCB0MCArIHRoaXMucmVsZWFzZSAvIHRoaXMudik7XHJcbiAgfVxyXG59O1xyXG5cclxuLy8vIOODnOOCpOOCuVxyXG5leHBvcnQgZnVuY3Rpb24gVm9pY2UoYXVkaW9jdHgpIHtcclxuICB0aGlzLmF1ZGlvY3R4ID0gYXVkaW9jdHg7XHJcbiAgdGhpcy5zYW1wbGUgPSB3YXZlU2FtcGxlc1s2XTtcclxuICB0aGlzLmdhaW4gPSBhdWRpb2N0eC5jcmVhdGVHYWluKCk7XHJcbiAgdGhpcy5nYWluLmdhaW4udmFsdWUgPSAwLjA7XHJcbiAgdGhpcy52b2x1bWUgPSBhdWRpb2N0eC5jcmVhdGVHYWluKCk7XHJcbiAgdGhpcy5lbnZlbG9wZSA9IG5ldyBFbnZlbG9wZUdlbmVyYXRvcih0aGlzKTtcclxuICB0aGlzLmluaXRQcm9jZXNzb3IoKTtcclxuICB0aGlzLmRldHVuZSA9IDEuMDtcclxuICB0aGlzLnZvbHVtZS5nYWluLnZhbHVlID0gMS4wO1xyXG4gIHRoaXMuZ2Fpbi5jb25uZWN0KHRoaXMudm9sdW1lKTtcclxuICB0aGlzLm91dHB1dCA9IHRoaXMudm9sdW1lO1xyXG59O1xyXG5cclxuVm9pY2UucHJvdG90eXBlID0ge1xyXG4gIGluaXRQcm9jZXNzb3I6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMucHJvY2Vzc29yID0gdGhpcy5hdWRpb2N0eC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcclxuICAgIHRoaXMucHJvY2Vzc29yLmJ1ZmZlciA9IHRoaXMuc2FtcGxlLnNhbXBsZTtcclxuICAgIHRoaXMucHJvY2Vzc29yLmxvb3AgPSB0aGlzLnNhbXBsZS5sb29wO1xyXG4gICAgdGhpcy5wcm9jZXNzb3IubG9vcFN0YXJ0ID0gMDtcclxuICAgIHRoaXMucHJvY2Vzc29yLnBsYXliYWNrUmF0ZS52YWx1ZSA9IDEuMDtcclxuICAgIHRoaXMucHJvY2Vzc29yLmxvb3BFbmQgPSB0aGlzLnNhbXBsZS5lbmQ7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5jb25uZWN0KHRoaXMuZ2Fpbik7XHJcbiAgfSxcclxuXHJcbiAgc2V0U2FtcGxlOiBmdW5jdGlvbiAoc2FtcGxlKSB7XHJcbiAgICAgIHRoaXMuZW52ZWxvcGUua2V5b2ZmKDApO1xyXG4gICAgICB0aGlzLnByb2Nlc3Nvci5kaXNjb25uZWN0KHRoaXMuZ2Fpbik7XHJcbiAgICAgIHRoaXMuc2FtcGxlID0gc2FtcGxlO1xyXG4gICAgICB0aGlzLmluaXRQcm9jZXNzb3IoKTtcclxuICAgICAgdGhpcy5wcm9jZXNzb3Iuc3RhcnQoKTtcclxuICB9LFxyXG4gIHN0YXJ0OiBmdW5jdGlvbiAoc3RhcnRUaW1lKSB7XHJcbiAvLyAgIGlmICh0aGlzLnByb2Nlc3Nvci5wbGF5YmFja1N0YXRlID09IDMpIHtcclxuICAgICAgdGhpcy5wcm9jZXNzb3IuZGlzY29ubmVjdCh0aGlzLmdhaW4pO1xyXG4gICAgICB0aGlzLmluaXRQcm9jZXNzb3IoKTtcclxuLy8gICAgfSBlbHNlIHtcclxuLy8gICAgICB0aGlzLmVudmVsb3BlLmtleW9mZigpO1xyXG4vL1xyXG4vLyAgICB9XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5zdGFydChzdGFydFRpbWUpO1xyXG4gIH0sXHJcbiAgc3RvcDogZnVuY3Rpb24gKHRpbWUpIHtcclxuICAgIHRoaXMucHJvY2Vzc29yLnN0b3AodGltZSk7XHJcbiAgICB0aGlzLnJlc2V0KCk7XHJcbiAgfSxcclxuICBrZXlvbjpmdW5jdGlvbih0LG5vdGUsdmVsKVxyXG4gIHtcclxuICAgIHRoaXMucHJvY2Vzc29yLnBsYXliYWNrUmF0ZS5zZXRWYWx1ZUF0VGltZShub3RlRnJlcVtub3RlXSAqIHRoaXMuZGV0dW5lLCB0KTtcclxuICAgIHRoaXMuZW52ZWxvcGUua2V5b24odCx2ZWwpO1xyXG4gIH0sXHJcbiAga2V5b2ZmOmZ1bmN0aW9uKHQpXHJcbiAge1xyXG4gICAgdGhpcy5lbnZlbG9wZS5rZXlvZmYodCk7XHJcbiAgfSxcclxuICByZXNldDpmdW5jdGlvbigpXHJcbiAge1xyXG4gICAgdGhpcy5wcm9jZXNzb3IucGxheWJhY2tSYXRlLmNhbmNlbFNjaGVkdWxlZFZhbHVlcygwKTtcclxuICAgIHRoaXMuZ2Fpbi5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcygwKTtcclxuICAgIHRoaXMuZ2Fpbi5nYWluLnZhbHVlID0gMDtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBBdWRpbygpIHtcclxuICB0aGlzLmVuYWJsZSA9IGZhbHNlO1xyXG4gIHRoaXMuYXVkaW9Db250ZXh0ID0gd2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0IHx8IHdpbmRvdy5tb3pBdWRpb0NvbnRleHQ7XHJcblxyXG4gIGlmICh0aGlzLmF1ZGlvQ29udGV4dCkge1xyXG4gICAgdGhpcy5hdWRpb2N0eCA9IG5ldyB0aGlzLmF1ZGlvQ29udGV4dCgpO1xyXG4gICAgdGhpcy5lbmFibGUgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgdGhpcy52b2ljZXMgPSBbXTtcclxuICBpZiAodGhpcy5lbmFibGUpIHtcclxuICAgIGNyZWF0ZVdhdmVTYW1wbGVGcm9tV2F2ZXModGhpcy5hdWRpb2N0eCwgQlVGRkVSX1NJWkUpO1xyXG4gICAgdGhpcy5maWx0ZXIgPSB0aGlzLmF1ZGlvY3R4LmNyZWF0ZUJpcXVhZEZpbHRlcigpO1xyXG4gICAgdGhpcy5maWx0ZXIudHlwZSA9ICdsb3dwYXNzJztcclxuICAgIHRoaXMuZmlsdGVyLmZyZXF1ZW5jeS52YWx1ZSA9IDIwMDAwO1xyXG4gICAgdGhpcy5maWx0ZXIuUS52YWx1ZSA9IDAuMDAwMTtcclxuICAgIHRoaXMubm9pc2VGaWx0ZXIgPSB0aGlzLmF1ZGlvY3R4LmNyZWF0ZUJpcXVhZEZpbHRlcigpO1xyXG4gICAgdGhpcy5ub2lzZUZpbHRlci50eXBlID0gJ2xvd3Bhc3MnO1xyXG4gICAgdGhpcy5ub2lzZUZpbHRlci5mcmVxdWVuY3kudmFsdWUgPSAxMDAwO1xyXG4gICAgdGhpcy5ub2lzZUZpbHRlci5RLnZhbHVlID0gMS44O1xyXG4gICAgdGhpcy5jb21wID0gdGhpcy5hdWRpb2N0eC5jcmVhdGVEeW5hbWljc0NvbXByZXNzb3IoKTtcclxuICAgIHRoaXMuZmlsdGVyLmNvbm5lY3QodGhpcy5jb21wKTtcclxuICAgIHRoaXMubm9pc2VGaWx0ZXIuY29ubmVjdCh0aGlzLmNvbXApO1xyXG4gICAgdGhpcy5jb21wLmNvbm5lY3QodGhpcy5hdWRpb2N0eC5kZXN0aW5hdGlvbik7XHJcbiAgICBmb3IgKHZhciBpID0gMCxlbmQgPSB0aGlzLlZPSUNFUzsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIHZhciB2ID0gbmV3IFZvaWNlKHRoaXMuYXVkaW9jdHgpO1xyXG4gICAgICB0aGlzLnZvaWNlcy5wdXNoKHYpO1xyXG4gICAgICBpZihpID09ICh0aGlzLlZPSUNFUyAtIDEpKXtcclxuICAgICAgICB2Lm91dHB1dC5jb25uZWN0KHRoaXMubm9pc2VGaWx0ZXIpO1xyXG4gICAgICB9IGVsc2V7XHJcbiAgICAgICAgdi5vdXRwdXQuY29ubmVjdCh0aGlzLmZpbHRlcik7XHJcbiAgICAgIH1cclxuICAgIH1cclxuLy8gIHRoaXMuc3RhcnRlZCA9IGZhbHNlO1xyXG5cclxuICAgIC8vdGhpcy52b2ljZXNbMF0ub3V0cHV0LmNvbm5lY3QoKTtcclxuICB9XHJcblxyXG59XHJcblxyXG5BdWRpby5wcm90b3R5cGUgPSB7XHJcbiAgc3RhcnQ6IGZ1bmN0aW9uICgpXHJcbiAge1xyXG4gIC8vICBpZiAodGhpcy5zdGFydGVkKSByZXR1cm47XHJcblxyXG4gICAgdmFyIHZvaWNlcyA9IHRoaXMudm9pY2VzO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHZvaWNlcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSlcclxuICAgIHtcclxuICAgICAgdm9pY2VzW2ldLnN0YXJ0KDApO1xyXG4gICAgfVxyXG4gICAgLy90aGlzLnN0YXJ0ZWQgPSB0cnVlO1xyXG4gIH0sXHJcbiAgc3RvcDogZnVuY3Rpb24gKClcclxuICB7XHJcbiAgICAvL2lmKHRoaXMuc3RhcnRlZClcclxuICAgIC8ve1xyXG4gICAgICB2YXIgdm9pY2VzID0gdGhpcy52b2ljZXM7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB2b2ljZXMubGVuZ3RoOyBpIDwgZW5kOyArK2kpXHJcbiAgICAgIHtcclxuICAgICAgICB2b2ljZXNbaV0uc3RvcCgwKTtcclxuICAgICAgfVxyXG4gICAgLy8gIHRoaXMuc3RhcnRlZCA9IGZhbHNlO1xyXG4gICAgLy99XHJcbiAgfSxcclxuICBWT0lDRVM6IDEyXHJcbn1cclxuXHJcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4vKiDjgrfjg7zjgrHjg7PjgrXjg7zjgrPjg57jg7Pjg4kgICAgICAgICAgICAgICAgICAgICAgICovXHJcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIE5vdGUobm8sIG5hbWUpIHtcclxuICB0aGlzLm5vID0gbm87XHJcbiAgdGhpcy5uYW1lID0gbmFtZTtcclxufVxyXG5cclxuTm90ZS5wcm90b3R5cGUgPSB7XHJcbiAgcHJvY2VzczogZnVuY3Rpb24odHJhY2spIFxyXG4gIHtcclxuICAgIHZhciBiYWNrID0gdHJhY2suYmFjaztcclxuICAgIHZhciBub3RlID0gdGhpcztcclxuICAgIHZhciBvY3QgPSB0aGlzLm9jdCB8fCBiYWNrLm9jdDtcclxuICAgIHZhciBzdGVwID0gdGhpcy5zdGVwIHx8IGJhY2suc3RlcDtcclxuICAgIHZhciBnYXRlID0gdGhpcy5nYXRlIHx8IGJhY2suZ2F0ZTtcclxuICAgIHZhciB2ZWwgPSB0aGlzLnZlbCB8fCBiYWNrLnZlbDtcclxuICAgIHNldFF1ZXVlKHRyYWNrLCBub3RlLCBvY3Qsc3RlcCwgZ2F0ZSwgdmVsKTtcclxuXHJcbiAgfVxyXG59XHJcblxyXG52YXIgXHJcbiAgQyAgPSBuZXcgTm90ZSggMCwnQyAnKSxcclxuICBEYiA9IG5ldyBOb3RlKCAxLCdEYicpLFxyXG4gIEQgID0gbmV3IE5vdGUoIDIsJ0QgJyksXHJcbiAgRWIgPSBuZXcgTm90ZSggMywnRWInKSxcclxuICBFICA9IG5ldyBOb3RlKCA0LCdFICcpLFxyXG4gIEYgID0gbmV3IE5vdGUoIDUsJ0YgJyksXHJcbiAgR2IgPSBuZXcgTm90ZSggNiwnR2InKSxcclxuICBHICA9IG5ldyBOb3RlKCA3LCdHICcpLFxyXG4gIEFiID0gbmV3IE5vdGUoIDgsJ0FiJyksXHJcbiAgQSAgPSBuZXcgTm90ZSggOSwnQSAnKSxcclxuICBCYiA9IG5ldyBOb3RlKDEwLCdCYicpLFxyXG4gIEIgPSBuZXcgTm90ZSgxMSwgJ0IgJyk7XHJcblxyXG4gLy8gUiA9IG5ldyBSZXN0KCk7XHJcblxyXG5mdW5jdGlvbiBTZXFEYXRhKG5vdGUsIG9jdCwgc3RlcCwgZ2F0ZSwgdmVsKVxyXG57XHJcbiAgdGhpcy5ub3RlID0gbm90ZTtcclxuICB0aGlzLm9jdCA9IG9jdDtcclxuICAvL3RoaXMubm8gPSBub3RlLm5vICsgb2N0ICogMTI7XHJcbiAgdGhpcy5zdGVwID0gc3RlcDtcclxuICB0aGlzLmdhdGUgPSBnYXRlO1xyXG4gIHRoaXMudmVsID0gdmVsO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZXRRdWV1ZSh0cmFjayxub3RlLG9jdCxzdGVwLGdhdGUsdmVsKVxyXG57XHJcbiAgdmFyIG5vID0gbm90ZS5ubyArIG9jdCAqIDEyO1xyXG4gIHZhciBzdGVwX3RpbWUgPSB0cmFjay5wbGF5aW5nVGltZTtcclxuICB2YXIgZ2F0ZV90aW1lID0gKChnYXRlID49IDApID8gZ2F0ZSAqIDYwIDogc3RlcCAqIGdhdGUgKiA2MCAqIC0xLjApIC8gKFRJTUVfQkFTRSAqIHRyYWNrLmxvY2FsVGVtcG8pICsgdHJhY2sucGxheWluZ1RpbWU7XHJcbiAgdmFyIHZvaWNlID0gdHJhY2suYXVkaW8udm9pY2VzW3RyYWNrLmNoYW5uZWxdO1xyXG4gIC8vY29uc29sZS5sb2codHJhY2suc2VxdWVuY2VyLnRlbXBvKTtcclxuICB2b2ljZS5rZXlvbihzdGVwX3RpbWUsIG5vLCB2ZWwpO1xyXG4gIHZvaWNlLmtleW9mZihnYXRlX3RpbWUpO1xyXG4gIHRyYWNrLnBsYXlpbmdUaW1lID0gKHN0ZXAgKiA2MCkgLyAoVElNRV9CQVNFICogdHJhY2subG9jYWxUZW1wbykgKyB0cmFjay5wbGF5aW5nVGltZTtcclxuICB2YXIgYmFjayA9IHRyYWNrLmJhY2s7XHJcbiAgYmFjay5ub3RlID0gbm90ZTtcclxuICBiYWNrLm9jdCA9IG9jdDtcclxuICBiYWNrLnN0ZXAgPSBzdGVwO1xyXG4gIGJhY2suZ2F0ZSA9IGdhdGU7XHJcbiAgYmFjay52ZWwgPSB2ZWw7XHJcbn1cclxuXHJcblNlcURhdGEucHJvdG90eXBlID0ge1xyXG4gIHByb2Nlc3M6IGZ1bmN0aW9uICh0cmFjaykge1xyXG5cclxuICAgIHZhciBiYWNrID0gdHJhY2suYmFjaztcclxuICAgIHZhciBub3RlID0gdGhpcy5ub3RlIHx8IGJhY2subm90ZTtcclxuICAgIHZhciBvY3QgPSB0aGlzLm9jdCB8fCBiYWNrLm9jdDtcclxuICAgIHZhciBzdGVwID0gdGhpcy5zdGVwIHx8IGJhY2suc3RlcDtcclxuICAgIHZhciBnYXRlID0gdGhpcy5nYXRlIHx8IGJhY2suZ2F0ZTtcclxuICAgIHZhciB2ZWwgPSB0aGlzLnZlbCB8fCBiYWNrLnZlbDtcclxuICAgIHNldFF1ZXVlKHRyYWNrLG5vdGUsb2N0LHN0ZXAsZ2F0ZSx2ZWwpO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gUyhub3RlLCBvY3QsIHN0ZXAsIGdhdGUsIHZlbCkge1xyXG4gIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcclxuICBpZiAoUy5sZW5ndGggIT0gYXJncy5sZW5ndGgpXHJcbiAge1xyXG4gICAgaWYodHlwZW9mKGFyZ3NbYXJncy5sZW5ndGggLSAxXSkgPT0gJ29iamVjdCcgJiYgICEoYXJnc1thcmdzLmxlbmd0aCAtIDFdIGluc3RhbmNlb2YgTm90ZSkpXHJcbiAgICB7XHJcbiAgICAgIHZhciBhcmdzMSA9IGFyZ3NbYXJncy5sZW5ndGggLSAxXTtcclxuICAgICAgdmFyIGwgPSBhcmdzLmxlbmd0aCAtIDE7XHJcbiAgICAgIHJldHVybiBuZXcgU2VxRGF0YShcclxuICAgICAgKChsICE9IDApP25vdGU6ZmFsc2UpIHx8IGFyZ3MxLm5vdGUgfHwgYXJnczEubiB8fCBudWxsLFxyXG4gICAgICAoKGwgIT0gMSkgPyBvY3QgOiBmYWxzZSkgfHwgYXJnczEub2N0IHx8IGFyZ3MxLm8gfHwgbnVsbCxcclxuICAgICAgKChsICE9IDIpID8gc3RlcCA6IGZhbHNlKSB8fCBhcmdzMS5zdGVwIHx8IGFyZ3MxLnMgfHwgbnVsbCxcclxuICAgICAgKChsICE9IDMpID8gZ2F0ZSA6IGZhbHNlKSB8fCBhcmdzMS5nYXRlIHx8IGFyZ3MxLmcgfHwgbnVsbCxcclxuICAgICAgKChsICE9IDQpID8gdmVsIDogZmFsc2UpIHx8IGFyZ3MxLnZlbCB8fCBhcmdzMS52IHx8IG51bGxcclxuICAgICAgKTtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIG5ldyBTZXFEYXRhKG5vdGUgfHwgbnVsbCwgb2N0IHx8IG51bGwsIHN0ZXAgfHwgbnVsbCwgZ2F0ZSB8fCBudWxsLCB2ZWwgfHwgbnVsbCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFMxKG5vdGUsIG9jdCwgc3RlcCwgZ2F0ZSwgdmVsKSB7XHJcbiAgcmV0dXJuIFMobm90ZSwgb2N0LCBsKHN0ZXApLCBnYXRlLCB2ZWwpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBTMihub3RlLCBsZW4sIGRvdCAsIG9jdCwgZ2F0ZSwgdmVsKSB7XHJcbiAgcmV0dXJuIFMobm90ZSwgb2N0LCBsKGxlbixkb3QpLCBnYXRlLCB2ZWwpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBTMyhub3RlLCBzdGVwLCBnYXRlLCB2ZWwsIG9jdCkge1xyXG4gIHJldHVybiBTKG5vdGUsIG9jdCwgc3RlcCwgZ2F0ZSwgdmVsKTtcclxufVxyXG5cclxuXHJcbi8vLyDpn7PnrKbjga7plbfjgZXmjIflrppcclxuXHJcbmZ1bmN0aW9uIGwobGVuLGRvdClcclxue1xyXG4gIHZhciBkID0gZmFsc2U7XHJcbiAgaWYgKGRvdCkgZCA9IGRvdDtcclxuICByZXR1cm4gKFRJTUVfQkFTRSAqICg0ICsgKGQ/MjowKSkpIC8gbGVuO1xyXG59XHJcblxyXG5mdW5jdGlvbiBTdGVwKHN0ZXApIHtcclxuICB0aGlzLnN0ZXAgPSBzdGVwO1xyXG59XHJcblxyXG5TdGVwLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKHRyYWNrKVxyXG57XHJcbiAgdHJhY2suYmFjay5zdGVwID0gdGhpcy5zdGVwO1xyXG59XHJcblxyXG5mdW5jdGlvbiBTVChzdGVwKVxyXG57XHJcbiAgcmV0dXJuIG5ldyBTdGVwKHN0ZXApO1xyXG59XHJcblxyXG5mdW5jdGlvbiBMKGxlbiwgZG90KSB7XHJcbiAgcmV0dXJuIG5ldyBTdGVwKGwobGVuLCBkb3QpKTtcclxufVxyXG5cclxuLy8vIOOCsuODvOODiOOCv+OCpOODoOaMh+WumlxyXG5cclxuZnVuY3Rpb24gR2F0ZVRpbWUoZ2F0ZSkge1xyXG4gIHRoaXMuZ2F0ZSA9IGdhdGU7XHJcbn1cclxuXHJcbkdhdGVUaW1lLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKHRyYWNrKSB7XHJcbiAgdHJhY2suYmFjay5nYXRlID0gdGhpcy5nYXRlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBHVChnYXRlKSB7XHJcbiAgcmV0dXJuIG5ldyBHYXRlVGltZShnYXRlKTtcclxufVxyXG5cclxuLy8vIOODmeODreOCt+ODhuOCo+aMh+WumlxyXG5cclxuZnVuY3Rpb24gVmVsb2NpdHkodmVsKSB7XHJcbiAgdGhpcy52ZWwgPSB2ZWw7XHJcbn1cclxuXHJcblZlbG9jaXR5LnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKHRyYWNrKSB7XHJcbiAgdHJhY2suYmFjay52ZWwgPSB0aGlzLnZlbDtcclxufVxyXG5cclxuZnVuY3Rpb24gVih2ZWwpIHtcclxuICByZXR1cm4gbmV3IFZlbG9jaXR5KHZlbCk7XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBKdW1wKHBvcykgeyB0aGlzLnBvcyA9IHBvczt9O1xyXG5KdW1wLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKHRyYWNrKVxyXG57XHJcbiAgdHJhY2suc2VxUG9zID0gdGhpcy5wb3M7XHJcbn1cclxuXHJcbi8vLyDpn7PoibLoqK3lrppcclxuZnVuY3Rpb24gVG9uZShubylcclxue1xyXG4gIHRoaXMubm8gPSBubztcclxuICAvL3RoaXMuc2FtcGxlID0gd2F2ZVNhbXBsZXNbdGhpcy5ub107XHJcbn1cclxuXHJcblRvbmUucHJvdG90eXBlID1cclxue1xyXG4gIHByb2Nlc3M6IGZ1bmN0aW9uICh0cmFjaylcclxuICB7XHJcbiAgICB0cmFjay5hdWRpby52b2ljZXNbdHJhY2suY2hhbm5lbF0uc2V0U2FtcGxlKHdhdmVTYW1wbGVzW3RoaXMubm9dKTtcclxuICB9XHJcbn1cclxuZnVuY3Rpb24gVE9ORShubylcclxue1xyXG4gIHJldHVybiBuZXcgVG9uZShubyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIEpVTVAocG9zKSB7XHJcbiAgcmV0dXJuIG5ldyBKdW1wKHBvcyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFJlc3Qoc3RlcClcclxue1xyXG4gIHRoaXMuc3RlcCA9IHN0ZXA7XHJcbn1cclxuXHJcblJlc3QucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbih0cmFjaylcclxue1xyXG4gIHZhciBzdGVwID0gdGhpcy5zdGVwIHx8IHRyYWNrLmJhY2suc3RlcDtcclxuICB0cmFjay5wbGF5aW5nVGltZSA9IHRyYWNrLnBsYXlpbmdUaW1lICsgKHRoaXMuc3RlcCAqIDYwKSAvIChUSU1FX0JBU0UgKiB0cmFjay5sb2NhbFRlbXBvKTtcclxuICB0cmFjay5iYWNrLnN0ZXAgPSB0aGlzLnN0ZXA7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFIxKHN0ZXApIHtcclxuICByZXR1cm4gbmV3IFJlc3Qoc3RlcCk7XHJcbn1cclxuZnVuY3Rpb24gUihsZW4sZG90KSB7XHJcbiAgcmV0dXJuIG5ldyBSZXN0KGwobGVuLGRvdCkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBPY3RhdmUob2N0KSB7XHJcbiAgdGhpcy5vY3QgPSBvY3Q7XHJcbn1cclxuT2N0YXZlLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24odHJhY2spXHJcbntcclxuICB0cmFjay5iYWNrLm9jdCA9IHRoaXMub2N0O1xyXG59XHJcblxyXG5mdW5jdGlvbiBPKG9jdCkge1xyXG4gIHJldHVybiBuZXcgT2N0YXZlKG9jdCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIE9jdGF2ZVVwKHYpIHsgdGhpcy52ID0gdjsgfTtcclxuT2N0YXZlVXAucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbih0cmFjaykge1xyXG4gIHRyYWNrLmJhY2sub2N0ICs9IHRoaXMudjtcclxufVxyXG5cclxudmFyIE9VID0gbmV3IE9jdGF2ZVVwKDEpO1xyXG52YXIgT0QgPSBuZXcgT2N0YXZlVXAoLTEpO1xyXG5cclxuZnVuY3Rpb24gVGVtcG8odGVtcG8pXHJcbntcclxuICB0aGlzLnRlbXBvID0gdGVtcG87XHJcbn1cclxuXHJcblRlbXBvLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24odHJhY2spXHJcbntcclxuICB0cmFjay5sb2NhbFRlbXBvID0gdGhpcy50ZW1wbztcclxuICAvL3RyYWNrLnNlcXVlbmNlci50ZW1wbyA9IHRoaXMudGVtcG87XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFRFTVBPKHRlbXBvKVxyXG57XHJcbiAgcmV0dXJuIG5ldyBUZW1wbyh0ZW1wbyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIEVudmVsb3BlKGF0dGFjaywgZGVjYXksIHN1c3RhaW4sIHJlbGVhc2UpXHJcbntcclxuICB0aGlzLmF0dGFjayA9IGF0dGFjaztcclxuICB0aGlzLmRlY2F5ID0gZGVjYXk7XHJcbiAgdGhpcy5zdXN0YWluID0gc3VzdGFpbjtcclxuICB0aGlzLnJlbGVhc2UgPSByZWxlYXNlO1xyXG59XHJcblxyXG5FbnZlbG9wZS5wcm90b3R5cGUucHJvY2VzcyA9IGZ1bmN0aW9uKHRyYWNrKVxyXG57XHJcbiAgdmFyIGVudmVsb3BlID0gdHJhY2suYXVkaW8udm9pY2VzW3RyYWNrLmNoYW5uZWxdLmVudmVsb3BlO1xyXG4gIGVudmVsb3BlLmF0dGFjayA9IHRoaXMuYXR0YWNrO1xyXG4gIGVudmVsb3BlLmRlY2F5ID0gdGhpcy5kZWNheTtcclxuICBlbnZlbG9wZS5zdXN0YWluID0gdGhpcy5zdXN0YWluO1xyXG4gIGVudmVsb3BlLnJlbGVhc2UgPSB0aGlzLnJlbGVhc2U7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIEVOVihhdHRhY2ssZGVjYXksc3VzdGFpbiAscmVsZWFzZSlcclxue1xyXG4gIHJldHVybiBuZXcgRW52ZWxvcGUoYXR0YWNrLCBkZWNheSwgc3VzdGFpbiwgcmVsZWFzZSk7XHJcbn1cclxuXHJcbi8vLyDjg4fjg4Hjg6Xjg7zjg7NcclxuZnVuY3Rpb24gRGV0dW5lKGRldHVuZSlcclxue1xyXG4gIHRoaXMuZGV0dW5lID0gZGV0dW5lO1xyXG59XHJcblxyXG5EZXR1bmUucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbih0cmFjaylcclxue1xyXG4gIHZhciB2b2ljZSA9IHRyYWNrLmF1ZGlvLnZvaWNlc1t0cmFjay5jaGFubmVsXTtcclxuICB2b2ljZS5kZXR1bmUgPSB0aGlzLmRldHVuZTtcclxufVxyXG5cclxuZnVuY3Rpb24gREVUVU5FKGRldHVuZSlcclxue1xyXG4gIHJldHVybiBuZXcgRGV0dW5lKGRldHVuZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFZvbHVtZSh2b2x1bWUpXHJcbntcclxuICB0aGlzLnZvbHVtZSA9IHZvbHVtZTtcclxufVxyXG5cclxuVm9sdW1lLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24odHJhY2spXHJcbntcclxuICB0cmFjay5hdWRpby52b2ljZXNbdHJhY2suY2hhbm5lbF0udm9sdW1lLmdhaW4uc2V0VmFsdWVBdFRpbWUodGhpcy52b2x1bWUsIHRyYWNrLnBsYXlpbmdUaW1lKTtcclxufVxyXG5cclxuZnVuY3Rpb24gVk9MVU1FKHZvbHVtZSlcclxue1xyXG4gIHJldHVybiBuZXcgVm9sdW1lKHZvbHVtZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIExvb3BEYXRhKG9iaix2YXJuYW1lLCBjb3VudCxzZXFQb3MpXHJcbntcclxuICB0aGlzLnZhcm5hbWUgPSB2YXJuYW1lO1xyXG4gIHRoaXMuY291bnQgPSBjb3VudDtcclxuICB0aGlzLm9iaiA9IG9iajtcclxuICB0aGlzLnNlcVBvcyA9IHNlcVBvcztcclxufVxyXG5cclxuZnVuY3Rpb24gTG9vcCh2YXJuYW1lLCBjb3VudCkge1xyXG4gIHRoaXMubG9vcERhdGEgPSBuZXcgTG9vcERhdGEodGhpcyx2YXJuYW1lLGNvdW50LDApO1xyXG59XHJcblxyXG5Mb29wLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKHRyYWNrKVxyXG57XHJcbiAgdmFyIHN0YWNrID0gdHJhY2suc3RhY2s7XHJcbiAgaWYgKHN0YWNrLmxlbmd0aCA9PSAwIHx8IHN0YWNrW3N0YWNrLmxlbmd0aCAtIDFdLm9iaiAhPT0gdGhpcylcclxuICB7XHJcbiAgICB2YXIgbGQgPSB0aGlzLmxvb3BEYXRhO1xyXG4gICAgc3RhY2sucHVzaChuZXcgTG9vcERhdGEodGhpcywgbGQudmFybmFtZSwgbGQuY291bnQsIHRyYWNrLnNlcVBvcykpO1xyXG4gIH0gXHJcbn1cclxuXHJcbmZ1bmN0aW9uIExPT1AodmFybmFtZSwgY291bnQpIHtcclxuICByZXR1cm4gbmV3IExvb3AodmFybmFtZSxjb3VudCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIExvb3BFbmQoKVxyXG57XHJcbn1cclxuXHJcbkxvb3BFbmQucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbih0cmFjaylcclxue1xyXG4gIHZhciBsZCA9IHRyYWNrLnN0YWNrW3RyYWNrLnN0YWNrLmxlbmd0aCAtIDFdO1xyXG4gIGxkLmNvdW50LS07XHJcbiAgaWYgKGxkLmNvdW50ID4gMCkge1xyXG4gICAgdHJhY2suc2VxUG9zID0gbGQuc2VxUG9zO1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0cmFjay5zdGFjay5wb3AoKTtcclxuICB9XHJcbn1cclxuXHJcbnZhciBMT09QX0VORCA9IG5ldyBMb29wRW5kKCk7XHJcblxyXG4vLy8g44K344O844Kx44Oz44K144O844OI44Op44OD44KvXHJcbmZ1bmN0aW9uIFRyYWNrKHNlcXVlbmNlcixzZXFkYXRhLGF1ZGlvKVxyXG57XHJcbiAgdGhpcy5uYW1lID0gJyc7XHJcbiAgdGhpcy5lbmQgPSBmYWxzZTtcclxuICB0aGlzLm9uZXNob3QgPSBmYWxzZTtcclxuICB0aGlzLnNlcXVlbmNlciA9IHNlcXVlbmNlcjtcclxuICB0aGlzLnNlcURhdGEgPSBzZXFkYXRhO1xyXG4gIHRoaXMuc2VxUG9zID0gMDtcclxuICB0aGlzLm11dGUgPSBmYWxzZTtcclxuICB0aGlzLnBsYXlpbmdUaW1lID0gLTE7XHJcbiAgdGhpcy5sb2NhbFRlbXBvID0gc2VxdWVuY2VyLnRlbXBvO1xyXG4gIHRoaXMudHJhY2tWb2x1bWUgPSAxLjA7XHJcbiAgdGhpcy50cmFuc3Bvc2UgPSAwO1xyXG4gIHRoaXMuc29sbyA9IGZhbHNlO1xyXG4gIHRoaXMuY2hhbm5lbCA9IC0xO1xyXG4gIHRoaXMudHJhY2sgPSAtMTtcclxuICB0aGlzLmF1ZGlvID0gYXVkaW87XHJcbiAgdGhpcy5iYWNrID0ge1xyXG4gICAgbm90ZTogNzIsXHJcbiAgICBvY3Q6IDUsXHJcbiAgICBzdGVwOiA5NixcclxuICAgIGdhdGU6IDQ4LFxyXG4gICAgdmVsOjEuMFxyXG4gIH1cclxuICB0aGlzLnN0YWNrID0gW107XHJcbn1cclxuXHJcblRyYWNrLnByb3RvdHlwZSA9IHtcclxuICBwcm9jZXNzOiBmdW5jdGlvbiAoY3VycmVudFRpbWUpIHtcclxuXHJcbiAgICBpZiAodGhpcy5lbmQpIHJldHVybjtcclxuICAgIFxyXG4gICAgaWYgKHRoaXMub25lc2hvdCkge1xyXG4gICAgICB0aGlzLnJlc2V0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHNlcVNpemUgPSB0aGlzLnNlcURhdGEubGVuZ3RoO1xyXG4gICAgaWYgKHRoaXMuc2VxUG9zID49IHNlcVNpemUpIHtcclxuICAgICAgaWYodGhpcy5zZXF1ZW5jZXIucmVwZWF0KVxyXG4gICAgICB7XHJcbiAgICAgICAgdGhpcy5zZXFQb3MgPSAwO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZW5kID0gdHJ1ZTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgc2VxID0gdGhpcy5zZXFEYXRhO1xyXG4gICAgdGhpcy5wbGF5aW5nVGltZSA9ICh0aGlzLnBsYXlpbmdUaW1lID4gLTEpID8gdGhpcy5wbGF5aW5nVGltZSA6IGN1cnJlbnRUaW1lO1xyXG4gICAgdmFyIGVuZFRpbWUgPSBjdXJyZW50VGltZSArIDAuMi8qc2VjKi87XHJcblxyXG4gICAgd2hpbGUgKHRoaXMuc2VxUG9zIDwgc2VxU2l6ZSkge1xyXG4gICAgICBpZiAodGhpcy5wbGF5aW5nVGltZSA+PSBlbmRUaW1lICYmICF0aGlzLm9uZXNob3QpIHtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgZCA9IHNlcVt0aGlzLnNlcVBvc107XHJcbiAgICAgICAgZC5wcm9jZXNzKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuc2VxUG9zKys7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG4gIHJlc2V0OmZ1bmN0aW9uKClcclxuICB7XHJcbiAgICB2YXIgY3VyVm9pY2UgPSB0aGlzLmF1ZGlvLnZvaWNlc1t0aGlzLmNoYW5uZWxdO1xyXG4gICAgY3VyVm9pY2UuZ2Fpbi5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcygwKTtcclxuICAgIGN1clZvaWNlLnByb2Nlc3Nvci5wbGF5YmFja1JhdGUuY2FuY2VsU2NoZWR1bGVkVmFsdWVzKDApO1xyXG4gICAgY3VyVm9pY2UuZ2Fpbi5nYWluLnZhbHVlID0gMDtcclxuICAgIHRoaXMucGxheWluZ1RpbWUgPSAtMTtcclxuICAgIHRoaXMuc2VxUG9zID0gMDtcclxuICAgIHRoaXMuZW5kID0gZmFsc2U7XHJcbiAgfVxyXG5cclxufVxyXG5cclxuZnVuY3Rpb24gbG9hZFRyYWNrcyhzZWxmLHRyYWNrcywgdHJhY2tkYXRhKVxyXG57XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0cmFja2RhdGEubGVuZ3RoOyArK2kpIHtcclxuICAgIHZhciB0cmFjayA9IG5ldyBUcmFjayhzZWxmLCB0cmFja2RhdGFbaV0uZGF0YSxzZWxmLmF1ZGlvKTtcclxuICAgIHRyYWNrLmNoYW5uZWwgPSB0cmFja2RhdGFbaV0uY2hhbm5lbDtcclxuICAgIHRyYWNrLm9uZXNob3QgPSAoIXRyYWNrZGF0YVtpXS5vbmVzaG90KT9mYWxzZTp0cnVlO1xyXG4gICAgdHJhY2sudHJhY2sgPSBpO1xyXG4gICAgdHJhY2tzLnB1c2godHJhY2spO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlVHJhY2tzKHRyYWNrZGF0YSlcclxue1xyXG4gIHZhciB0cmFja3MgPSBbXTtcclxuICBsb2FkVHJhY2tzKHRoaXMsdHJhY2tzLCB0cmFja2RhdGEpO1xyXG4gIHJldHVybiB0cmFja3M7XHJcbn1cclxuXHJcbi8vLyDjgrfjg7zjgrHjg7PjgrXjg7zmnKzkvZNcclxuZXhwb3J0IGZ1bmN0aW9uIFNlcXVlbmNlcihhdWRpbykge1xyXG4gIHRoaXMuYXVkaW8gPSBhdWRpbztcclxuICB0aGlzLnRlbXBvID0gMTAwLjA7XHJcbiAgdGhpcy5yZXBlYXQgPSBmYWxzZTtcclxuICB0aGlzLnBsYXkgPSBmYWxzZTtcclxuICB0aGlzLnRyYWNrcyA9IFtdO1xyXG4gIHRoaXMucGF1c2VUaW1lID0gMDtcclxuICB0aGlzLnN0YXR1cyA9IHRoaXMuU1RPUDtcclxufVxyXG5cclxuU2VxdWVuY2VyLnByb3RvdHlwZSA9IHtcclxuICBsb2FkOiBmdW5jdGlvbihkYXRhKVxyXG4gIHtcclxuICAgIGlmKHRoaXMucGxheSkge1xyXG4gICAgICB0aGlzLnN0b3AoKTtcclxuICAgIH1cclxuICAgIHRoaXMudHJhY2tzLmxlbmd0aCA9IDA7XHJcbiAgICBsb2FkVHJhY2tzKHRoaXMsdGhpcy50cmFja3MsIGRhdGEudHJhY2tzLHRoaXMuYXVkaW8pO1xyXG4gIH0sXHJcbiAgc3RhcnQ6ZnVuY3Rpb24oKVxyXG4gIHtcclxuICAgIC8vICAgIHRoaXMuaGFuZGxlID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkgeyBzZWxmLnByb2Nlc3MoKSB9LCA1MCk7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuUExBWTtcclxuICAgIHRoaXMucHJvY2VzcygpO1xyXG4gIH0sXHJcbiAgcHJvY2VzczpmdW5jdGlvbigpXHJcbiAge1xyXG4gICAgaWYgKHRoaXMuc3RhdHVzID09IHRoaXMuUExBWSkge1xyXG4gICAgICB0aGlzLnBsYXlUcmFja3ModGhpcy50cmFja3MpO1xyXG4gICAgICB0aGlzLmhhbmRsZSA9IHdpbmRvdy5zZXRUaW1lb3V0KHRoaXMucHJvY2Vzcy5iaW5kKHRoaXMpLCAxMDApO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgcGxheVRyYWNrczogZnVuY3Rpb24gKHRyYWNrcyl7XHJcbiAgICB2YXIgY3VycmVudFRpbWUgPSB0aGlzLmF1ZGlvLmF1ZGlvY3R4LmN1cnJlbnRUaW1lO1xyXG4gLy8gICBjb25zb2xlLmxvZyh0aGlzLmF1ZGlvLmF1ZGlvY3R4LmN1cnJlbnRUaW1lKTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0cmFja3MubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgdHJhY2tzW2ldLnByb2Nlc3MoY3VycmVudFRpbWUpO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgcGF1c2U6ZnVuY3Rpb24oKVxyXG4gIHtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5QQVVTRTtcclxuICAgIHRoaXMucGF1c2VUaW1lID0gdGhpcy5hdWRpby5hdWRpb2N0eC5jdXJyZW50VGltZTtcclxuICB9LFxyXG4gIHJlc3VtZTpmdW5jdGlvbiAoKVxyXG4gIHtcclxuICAgIGlmICh0aGlzLnN0YXR1cyA9PSB0aGlzLlBBVVNFKSB7XHJcbiAgICAgIHRoaXMuc3RhdHVzID0gdGhpcy5QTEFZO1xyXG4gICAgICB2YXIgdHJhY2tzID0gdGhpcy50cmFja3M7XHJcbiAgICAgIHZhciBhZGp1c3QgPSB0aGlzLmF1ZGlvLmF1ZGlvY3R4LmN1cnJlbnRUaW1lIC0gdGhpcy5wYXVzZVRpbWU7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0cmFja3MubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgICB0cmFja3NbaV0ucGxheWluZ1RpbWUgKz0gYWRqdXN0O1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMucHJvY2VzcygpO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgc3RvcDogZnVuY3Rpb24gKClcclxuICB7XHJcbiAgICBpZiAodGhpcy5zdGF0dXMgIT0gdGhpcy5TVE9QKSB7XHJcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLmhhbmRsZSk7XHJcbiAgICAgIC8vICAgIGNsZWFySW50ZXJ2YWwodGhpcy5oYW5kbGUpO1xyXG4gICAgICB0aGlzLnN0YXR1cyA9IHRoaXMuU1RPUDtcclxuICAgICAgdGhpcy5yZXNldCgpO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgcmVzZXQ6ZnVuY3Rpb24oKVxyXG4gIHtcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0aGlzLnRyYWNrcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSlcclxuICAgIHtcclxuICAgICAgdGhpcy50cmFja3NbaV0ucmVzZXQoKTtcclxuICAgIH1cclxuICB9LFxyXG4gIFNUT1A6IDAgfCAwLFxyXG4gIFBMQVk6IDEgfCAwLFxyXG4gIFBBVVNFOjIgfCAwXHJcbn1cclxuXHJcbi8vLyDnsKHmmJPpjbXnm6Tjga7lrp/oo4VcclxuZnVuY3Rpb24gUGlhbm8oYXVkaW8pIHtcclxuICB0aGlzLmF1ZGlvID0gYXVkaW87XHJcbiAgdGhpcy50YWJsZSA9IFs5MCwgODMsIDg4LCA2OCwgNjcsIDg2LCA3MSwgNjYsIDcyLCA3OCwgNzQsIDc3LCAxODhdO1xyXG4gIHRoaXMua2V5b24gPSBuZXcgQXJyYXkoMTMpO1xyXG59XHJcblxyXG5QaWFuby5wcm90b3R5cGUgPSB7XHJcbiAgb246IGZ1bmN0aW9uIChlKSB7XHJcbiAgICB2YXIgaW5kZXggPSB0aGlzLnRhYmxlLmluZGV4T2YoZS5rZXlDb2RlLCAwKTtcclxuICAgIGlmIChpbmRleCA9PSAtMSkge1xyXG4gICAgICBpZiAoZS5rZXlDb2RlID4gNDggJiYgZS5rZXlDb2RlIDwgNTcpIHtcclxuICAgICAgICB2YXIgdGltYnJlID0gZS5rZXlDb2RlIC0gNDk7XHJcbiAgICAgICAgdGhpcy5hdWRpby52b2ljZXNbN10uc2V0U2FtcGxlKHdhdmVTYW1wbGVzW3RpbWJyZV0pO1xyXG4gICAgICAgIHdhdmVHcmFwaC53YXZlID0gd2F2ZXNbdGltYnJlXTtcclxuICAgICAgICB3YXZlR3JhcGgucmVuZGVyKCk7XHJcbiAgICAgICAgdGV4dFBsYW5lLnByaW50KDUsIDEwLCBcIldhdmUgXCIgKyAodGltYnJlICsgMSkpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy9hdWRpby52b2ljZXNbMF0ucHJvY2Vzc29yLnBsYXliYWNrUmF0ZS52YWx1ZSA9IHNlcXVlbmNlci5ub3RlRnJlcVtdO1xyXG4gICAgICBpZiAoIXRoaXMua2V5b25baW5kZXhdKSB7XHJcbiAgICAgICAgdGhpcy5hdWRpby52b2ljZXNbN10ua2V5b24oMCxpbmRleCArIChlLnNoaWZ0S2V5ID8gODQgOiA3MiksMS4wKTtcclxuICAgICAgICB0aGlzLmtleW9uW2luZGV4XSA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICB9LFxyXG4gIG9mZjogZnVuY3Rpb24gKGUpIHtcclxuICAgIHZhciBpbmRleCA9IHRoaXMudGFibGUuaW5kZXhPZihlLmtleUNvZGUsIDApO1xyXG4gICAgaWYgKGluZGV4ID09IC0xKSB7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKHRoaXMua2V5b25baW5kZXhdKSB7XHJcbiAgICAgICAgYXVkaW8udm9pY2VzWzddLmVudmVsb3BlLmtleW9mZigwKTtcclxuICAgICAgICB0aGlzLmtleW9uW2luZGV4XSA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgc2VxRGF0YSA9IHtcclxuICBuYW1lOiAnVGVzdCcsXHJcbiAgdHJhY2tzOiBbXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6ICdwYXJ0MScsXHJcbiAgICAgIGNoYW5uZWw6IDAsXHJcbiAgICAgIGRhdGE6XHJcbiAgICAgIFtcclxuICAgICAgICBFTlYoMC4wMSwgMC4wMiwgMC41LCAwLjA3KSxcclxuICAgICAgICBURU1QTygxODApLCBUT05FKDApLCBWT0xVTUUoMC41KSwgTCg4KSwgR1QoLTAuNSksTyg0KSxcclxuICAgICAgICBMT09QKCdpJyw0KSxcclxuICAgICAgICBDLCBDLCBDLCBDLCBDLCBDLCBDLCBDLFxyXG4gICAgICAgIExPT1BfRU5ELFxyXG4gICAgICAgIEpVTVAoNSlcclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgbmFtZTogJ3BhcnQyJyxcclxuICAgICAgY2hhbm5lbDogMSxcclxuICAgICAgZGF0YTpcclxuICAgICAgICBbXHJcbiAgICAgICAgRU5WKDAuMDEsIDAuMDUsIDAuNiwgMC4wNyksXHJcbiAgICAgICAgVEVNUE8oMTgwKSxUT05FKDYpLCBWT0xVTUUoMC4yKSwgTCg4KSwgR1QoLTAuOCksXHJcbiAgICAgICAgUigxKSwgUigxKSxcclxuICAgICAgICBPKDYpLEwoMSksIEYsXHJcbiAgICAgICAgRSxcclxuICAgICAgICBPRCwgTCg4LCB0cnVlKSwgQmIsIEcsIEwoNCksIEJiLCBPVSwgTCg0KSwgRiwgTCg4KSwgRCxcclxuICAgICAgICBMKDQsIHRydWUpLCBFLCBMKDIpLCBDLFIoOCksXHJcbiAgICAgICAgSlVNUCg4KVxyXG4gICAgICAgIF1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6ICdwYXJ0MycsXHJcbiAgICAgIGNoYW5uZWw6IDIsXHJcbiAgICAgIGRhdGE6XHJcbiAgICAgICAgW1xyXG4gICAgICAgIEVOVigwLjAxLCAwLjA1LCAwLjYsIDAuMDcpLFxyXG4gICAgICAgIFRFTVBPKDE4MCksVE9ORSg2KSwgVk9MVU1FKDAuMSksIEwoOCksIEdUKC0wLjUpLCBcclxuICAgICAgICBSKDEpLCBSKDEpLFxyXG4gICAgICAgIE8oNiksTCgxKSwgQyxDLFxyXG4gICAgICAgIE9ELCBMKDgsIHRydWUpLCBHLCBELCBMKDQpLCBHLCBPVSwgTCg0KSwgRCwgTCg4KSxPRCwgRyxcclxuICAgICAgICBMKDQsIHRydWUpLCBPVSxDLCBMKDIpLE9ELCBHLCBSKDgpLFxyXG4gICAgICAgIEpVTVAoNylcclxuICAgICAgICBdXHJcbiAgICB9XHJcbiAgXVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gU291bmRFZmZlY3RzKHNlcXVlbmNlcikge1xyXG4gICB0aGlzLnNvdW5kRWZmZWN0cyA9XHJcbiAgICBbXHJcbiAgICAvLyBFZmZlY3QgMCAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgIGNyZWF0ZVRyYWNrcy5jYWxsKHNlcXVlbmNlcixbXHJcbiAgICB7XHJcbiAgICAgIGNoYW5uZWw6IDgsXHJcbiAgICAgIG9uZXNob3Q6dHJ1ZSxcclxuICAgICAgZGF0YTogW1ZPTFVNRSgwLjUpLFxyXG4gICAgICAgIEVOVigwLjAwMDEsIDAuMDEsIDEuMCwgMC4wMDAxKSxHVCgtMC45OTkpLFRPTkUoMCksIFRFTVBPKDIwMCksIE8oOCksU1QoMyksIEMsIEQsIEUsIEYsIEcsIEEsIEIsIE9VLCBDLCBELCBFLCBHLCBBLCBCLEIsQixCXHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGNoYW5uZWw6IDksXHJcbiAgICAgIG9uZXNob3Q6IHRydWUsXHJcbiAgICAgIGRhdGE6IFtWT0xVTUUoMC41KSxcclxuICAgICAgICBFTlYoMC4wMDAxLCAwLjAxLCAxLjAsIDAuMDAwMSksIERFVFVORSgwLjkpLCBHVCgtMC45OTkpLCBUT05FKDApLCBURU1QTygyMDApLCBPKDUpLCBTVCgzKSwgQywgRCwgRSwgRiwgRywgQSwgQiwgT1UsIEMsIEQsIEUsIEcsIEEsIEIsQixCLEJcclxuICAgICAgXVxyXG4gICAgfVxyXG4gICAgXSksXHJcbiAgICAvLyBFZmZlY3QgMSAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICBjcmVhdGVUcmFja3MuY2FsbChzZXF1ZW5jZXIsXHJcbiAgICAgIFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBjaGFubmVsOiAxMCxcclxuICAgICAgICAgIG9uZXNob3Q6IHRydWUsXHJcbiAgICAgICAgICBkYXRhOiBbXHJcbiAgICAgICAgICAgVE9ORSg0KSwgVEVNUE8oMTUwKSwgU1QoNCksIEdUKC0wLjk5OTkpLCBFTlYoMC4wMDAxLCAwLjAwMDEsIDEuMCwgMC4wMDAxKSxcclxuICAgICAgICAgICBPKDYpLCBHLCBBLCBCLCBPKDcpLCBCLCBBLCBHLCBGLCBFLCBELCBDLCBFLCBHLCBBLCBCLCBPRCwgQiwgQSwgRywgRiwgRSwgRCwgQywgT0QsIEIsIEEsIEcsIEYsIEUsIEQsIENcclxuICAgICAgICAgIF1cclxuICAgICAgICB9XHJcbiAgICAgIF0pLFxyXG4gICAgLy8gRWZmZWN0IDIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgY3JlYXRlVHJhY2tzLmNhbGwoc2VxdWVuY2VyLFxyXG4gICAgICBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgY2hhbm5lbDogMTAsXHJcbiAgICAgICAgICBvbmVzaG90OiB0cnVlLFxyXG4gICAgICAgICAgZGF0YTogW1xyXG4gICAgICAgICAgIFRPTkUoMCksIFRFTVBPKDE1MCksIFNUKDIpLCBHVCgtMC45OTk5KSwgRU5WKDAuMDAwMSwgMC4wMDAxLCAxLjAsIDAuMDAwMSksXHJcbiAgICAgICAgICAgTyg4KSwgQyxELEUsRixHLEEsQixPVSxDLEQsRSxGLE9ELEcsT1UsQSxPRCxCLE9VLEEsT0QsRyxPVSxGLE9ELEUsT1UsRVxyXG4gICAgICAgICAgXVxyXG4gICAgICAgIH1cclxuICAgICAgXSksXHJcbiAgICAgIC8vIEVmZmVjdCAzIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgICBjcmVhdGVUcmFja3MuY2FsbChzZXF1ZW5jZXIsXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBjaGFubmVsOiAxMCxcclxuICAgICAgICAgICAgb25lc2hvdDogdHJ1ZSxcclxuICAgICAgICAgICAgZGF0YTogW1xyXG4gICAgICAgICAgICAgVE9ORSg1KSwgVEVNUE8oMTUwKSwgTCg2NCksIEdUKC0wLjk5OTkpLCBFTlYoMC4wMDAxLCAwLjAwMDEsIDEuMCwgMC4wMDAxKSxcclxuICAgICAgICAgICAgIE8oNiksQyxPRCxDLE9VLEMsT0QsQyxPVSxDLE9ELEMsT1UsQyxPRFxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgXSksXHJcbiAgICAgIC8vIEVmZmVjdCA0IC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgICAgY3JlYXRlVHJhY2tzLmNhbGwoc2VxdWVuY2VyLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgY2hhbm5lbDogMTEsXHJcbiAgICAgICAgICAgIG9uZXNob3Q6IHRydWUsXHJcbiAgICAgICAgICAgIGRhdGE6IFtcclxuICAgICAgICAgICAgIFRPTkUoOCksIFZPTFVNRSgyLjApLFRFTVBPKDEyMCksIEwoMiksIEdUKC0wLjk5OTkpLCBFTlYoMC4wMDAxLCAwLjAwMDEsIDEuMCwgMC4yNSksXHJcbiAgICAgICAgICAgICBPKDEpLCBDXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICAgIH1cclxuICAgICAgICBdKVxyXG4gICBdO1xyXG4gfVxyXG5cclxuXHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBDb21tIHtcclxuICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgdmFyIGhvc3QgPSB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUubWF0Y2goL3d3d1xcLnNmcGdtclxcLm5ldC9pZyk/J3d3dy5zZnBnbXIubmV0JzonbG9jYWxob3N0JztcclxuICAgIHRoaXMuZW5hYmxlID0gZmFsc2U7XHJcbiAgICB0cnkge1xyXG4gICAgICB0aGlzLnNvY2tldCA9IGlvLmNvbm5lY3QoJ2h0dHA6Ly8nICsgaG9zdCArICc6ODA4MS90ZXN0Jyk7XHJcbiAgICAgIHRoaXMuZW5hYmxlID0gdHJ1ZTtcclxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICB0aGlzLnNvY2tldC5vbignc2VuZEhpZ2hTY29yZXMnLCAoZGF0YSk9PntcclxuICAgICAgICBpZih0aGlzLnVwZGF0ZUhpZ2hTY29yZXMpe1xyXG4gICAgICAgICAgdGhpcy51cGRhdGVIaWdoU2NvcmVzKGRhdGEpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIHRoaXMuc29ja2V0Lm9uKCdzZW5kSGlnaFNjb3JlJywgKGRhdGEpPT57XHJcbiAgICAgICAgdGhpcy51cGRhdGVIaWdoU2NvcmUoZGF0YSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdGhpcy5zb2NrZXQub24oJ3NlbmRSYW5rJywgKGRhdGEpID0+IHtcclxuICAgICAgICB0aGlzLnVwZGF0ZUhpZ2hTY29yZXMoZGF0YS5oaWdoU2NvcmVzKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLnNvY2tldC5vbignZXJyb3JDb25uZWN0aW9uTWF4JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGFsZXJ0KCflkIzmmYLmjqXntprjga7kuIrpmZDjgavpgZTjgZfjgb7jgZfjgZ/jgIInKTtcclxuICAgICAgICBzZWxmLmVuYWJsZSA9IGZhbHNlO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMuc29ja2V0Lm9uKCdkaXNjb25uZWN0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmIChzZWxmLmVuYWJsZSkge1xyXG4gICAgICAgICAgc2VsZi5lbmFibGUgPSBmYWxzZTtcclxuICAgICAgICAgIGFsZXJ0KCfjgrXjg7zjg5Djg7zmjqXntprjgYzliIfmlq3jgZXjgozjgb7jgZfjgZ/jgIInKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgYWxlcnQoJ1NvY2tldC5JT+OBjOWIqeeUqOOBp+OBjeOBquOBhOOBn+OCgeOAgeODj+OCpOOCueOCs+OCouaDheWgseOBjOWPluW+l+OBp+OBjeOBvuOBm+OCk+OAgicgKyBlKTtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgc2VuZFNjb3JlKHNjb3JlKVxyXG4gIHtcclxuICAgIGlmICh0aGlzLmVuYWJsZSkge1xyXG4gICAgICB0aGlzLnNvY2tldC5lbWl0KCdzZW5kU2NvcmUnLCBzY29yZSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIGRpc2Nvbm5lY3QoKVxyXG4gIHtcclxuICAgIGlmICh0aGlzLmVuYWJsZSkge1xyXG4gICAgICB0aGlzLmVuYWJsZSA9IGZhbHNlO1xyXG4gICAgICB0aGlzLnNvY2tldC5kaXNjb25uZWN0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgKiBhcyBzZmcgZnJvbSAnLi9nbG9iYWwnO1xyXG5pbXBvcnQgKiAgYXMgZ2FtZW9iaiBmcm9tICcuL2dhbWVvYmonO1xyXG5pbXBvcnQgKiBhcyBncmFwaGljcyBmcm9tICcuL2dyYXBoaWNzJztcclxuXHJcblxyXG4vLy8g54iG55m6XHJcbmV4cG9ydCBjbGFzcyBCb21iIGV4dGVuZHMgZ2FtZW9iai5HYW1lT2JqIFxyXG57XHJcbiAgY29uc3RydWN0b3Ioc2NlbmUsc2UpIHtcclxuICAgIHN1cGVyKDAsMCwwKTtcclxuICAgIHZhciB0ZXggPSBzZmcudGV4dHVyZUZpbGVzLmJvbWI7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVNYXRlcmlhbCh0ZXgpO1xyXG4gICAgbWF0ZXJpYWwuYmxlbmRpbmcgPSBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nO1xyXG4gICAgbWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gZ3JhcGhpY3MuY3JlYXRlU3ByaXRlR2VvbWV0cnkoMTYpO1xyXG4gICAgZ3JhcGhpY3MuY3JlYXRlU3ByaXRlVVYoZ2VvbWV0cnksIHRleCwgMTYsIDE2LCAwKTtcclxuICAgIHRoaXMubWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgICB0aGlzLm1lc2gucG9zaXRpb24ueiA9IDAuMTtcclxuICAgIHRoaXMuaW5kZXggPSAwO1xyXG4gICAgdGhpcy5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxuICAgIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuICAgIHRoaXMuc2UgPSBzZTtcclxuICAgIHNjZW5lLmFkZCh0aGlzLm1lc2gpO1xyXG4gIH1cclxuICBnZXQgeCgpIHsgcmV0dXJuIHRoaXMueF87IH1cclxuICBzZXQgeCh2KSB7IHRoaXMueF8gPSB0aGlzLm1lc2gucG9zaXRpb24ueCA9IHY7IH1cclxuICBnZXQgeSgpIHsgcmV0dXJuIHRoaXMueV87IH1cclxuICBzZXQgeSh2KSB7IHRoaXMueV8gPSB0aGlzLm1lc2gucG9zaXRpb24ueSA9IHY7IH1cclxuICBnZXQgeigpIHsgcmV0dXJuIHRoaXMuel87IH1cclxuICBzZXQgeih2KSB7IHRoaXMuel8gPSB0aGlzLm1lc2gucG9zaXRpb24ueiA9IHY7IH1cclxuICBcclxuICBzdGFydCh4LCB5LCB6LCBkZWxheSkge1xyXG4gICAgaWYgKHRoaXMuZW5hYmxlXykge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB0aGlzLmRlbGF5ID0gZGVsYXkgfCAwO1xyXG4gICAgdGhpcy54ID0geDtcclxuICAgIHRoaXMueSA9IHk7XHJcbiAgICB0aGlzLnogPSB6IHwgMC4wMDAwMjtcclxuICAgIHRoaXMuZW5hYmxlXyA9IHRydWU7XHJcbiAgICBncmFwaGljcy51cGRhdGVTcHJpdGVVVih0aGlzLm1lc2guZ2VvbWV0cnksIHNmZy50ZXh0dXJlRmlsZXMuYm9tYiwgMTYsIDE2LCB0aGlzLmluZGV4KTtcclxuICAgIHRoaXMudGFzayA9IHNmZy50YXNrcy5wdXNoVGFzayh0aGlzLm1vdmUuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLm1lc2gubWF0ZXJpYWwub3BhY2l0eSA9IDEuMDtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuICBcclxuICAqbW92ZSh0YXNrSW5kZXgpIHtcclxuICAgIFxyXG4gICAgZm9yKCBsZXQgaSA9IDAsZSA9IHRoaXMuZGVsYXk7aSA8IGUgJiYgdGFza0luZGV4ID49IDA7KytpKVxyXG4gICAge1xyXG4gICAgICB0YXNrSW5kZXggPSB5aWVsZDsgICAgICBcclxuICAgIH1cclxuICAgIHRoaXMubWVzaC52aXNpYmxlID0gdHJ1ZTtcclxuXHJcbiAgICBmb3IobGV0IGkgPSAwO2kgPCA3ICYmIHRhc2tJbmRleCA+PSAwOysraSlcclxuICAgIHtcclxuICAgICAgZ3JhcGhpY3MudXBkYXRlU3ByaXRlVVYodGhpcy5tZXNoLmdlb21ldHJ5LCBzZmcudGV4dHVyZUZpbGVzLmJvbWIsIDE2LCAxNiwgaSk7XHJcbiAgICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICB0aGlzLmVuYWJsZV8gPSBmYWxzZTtcclxuICAgIHRoaXMubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICBzZmcudGFza3MucmVtb3ZlVGFzayh0YXNrSW5kZXgpO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEJvbWJzIHtcclxuICBjb25zdHJ1Y3RvcihzY2VuZSwgc2UpIHtcclxuICAgIHRoaXMuYm9tYnMgPSBuZXcgQXJyYXkoMCk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDMyOyArK2kpIHtcclxuICAgICAgdGhpcy5ib21icy5wdXNoKG5ldyBCb21iKHNjZW5lLCBzZSkpO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBzdGFydCh4LCB5LCB6KSB7XHJcbiAgICB2YXIgYm9tcyA9IHRoaXMuYm9tYnM7XHJcbiAgICB2YXIgY291bnQgPSAzO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IGJvbXMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgaWYgKCFib21zW2ldLmVuYWJsZV8pIHtcclxuICAgICAgICBpZiAoY291bnQgPT0gMikge1xyXG4gICAgICAgICAgYm9tc1tpXS5zdGFydCh4LCB5LCB6LCAwKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgYm9tc1tpXS5zdGFydCh4ICsgKE1hdGgucmFuZG9tKCkgKiAxNiAtIDgpLCB5ICsgKE1hdGgucmFuZG9tKCkgKiAxNiAtIDgpLCB6LCBNYXRoLnJhbmRvbSgpICogOCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvdW50LS07XHJcbiAgICAgICAgaWYgKCFjb3VudCkgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJlc2V0KCl7XHJcbiAgICB0aGlzLmJvbWJzLmZvckVhY2goKGQpPT57XHJcbiAgICAgIGlmKGQuZW5hYmxlXyl7XHJcbiAgICAgICAgd2hpbGUoIXNmZy50YXNrcy5hcnJheVtkLnRhc2suaW5kZXhdLmdlbkluc3QubmV4dCgtKDErZC50YXNrLmluZGV4KSkuZG9uZSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmltcG9ydCAqICBhcyBnYW1lb2JqIGZyb20gJy4vZ2FtZW9iaic7XHJcbmltcG9ydCAqIGFzIHNmZyBmcm9tICcuL2dsb2JhbCc7XHJcbmltcG9ydCAqIGFzIGdyYXBoaWNzIGZyb20gJy4vZ3JhcGhpY3MnO1xyXG5cclxuLy8vIOaVteW8vlxyXG5leHBvcnQgY2xhc3MgRW5lbXlCdWxsZXQgZXh0ZW5kcyBnYW1lb2JqLkdhbWVPYmoge1xyXG4gIGNvbnN0cnVjdG9yKHNjZW5lLCBzZSkge1xyXG4gICAgc3VwZXIoMCwgMCwgMCk7XHJcbiAgICB0aGlzLk5PTkUgPSAwO1xyXG4gICAgdGhpcy5NT1ZFID0gMTtcclxuICAgIHRoaXMuQk9NQiA9IDI7XHJcbiAgICB0aGlzLmNvbGxpc2lvbkFyZWEud2lkdGggPSAyO1xyXG4gICAgdGhpcy5jb2xsaXNpb25BcmVhLmhlaWdodCA9IDI7XHJcbiAgICB2YXIgdGV4ID0gc2ZnLnRleHR1cmVGaWxlcy5lbmVteTtcclxuICAgIHZhciBtYXRlcmlhbCA9IGdyYXBoaWNzLmNyZWF0ZVNwcml0ZU1hdGVyaWFsKHRleCk7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVHZW9tZXRyeSgxNik7XHJcbiAgICBncmFwaGljcy5jcmVhdGVTcHJpdGVVVihnZW9tZXRyeSwgdGV4LCAxNiwgMTYsIDApO1xyXG4gICAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICAgIHRoaXMueiA9IDAuMDtcclxuICAgIHRoaXMubXZQYXR0ZXJuID0gbnVsbDtcclxuICAgIHRoaXMubXYgPSBudWxsO1xyXG4gICAgdGhpcy5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxuICAgIHRoaXMudHlwZSA9IG51bGw7XHJcbiAgICB0aGlzLmxpZmUgPSAwO1xyXG4gICAgdGhpcy5keCA9IDA7XHJcbiAgICB0aGlzLmR5ID0gMDtcclxuICAgIHRoaXMuc3BlZWQgPSAyLjA7XHJcbiAgICB0aGlzLmVuYWJsZSA9IGZhbHNlO1xyXG4gICAgdGhpcy5oaXRfID0gbnVsbDtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5OT05FO1xyXG4gICAgdGhpcy5zY2VuZSA9IHNjZW5lO1xyXG4gICAgc2NlbmUuYWRkKHRoaXMubWVzaCk7XHJcbiAgICB0aGlzLnNlID0gc2U7XHJcbiAgfVxyXG5cclxuICBnZXQgeCgpIHsgcmV0dXJuIHRoaXMueF87IH1cclxuICBzZXQgeCh2KSB7IHRoaXMueF8gPSB0aGlzLm1lc2gucG9zaXRpb24ueCA9IHY7IH1cclxuICBnZXQgeSgpIHsgcmV0dXJuIHRoaXMueV87IH1cclxuICBzZXQgeSh2KSB7IHRoaXMueV8gPSB0aGlzLm1lc2gucG9zaXRpb24ueSA9IHY7IH1cclxuICBnZXQgeigpIHsgcmV0dXJuIHRoaXMuel87IH1cclxuICBzZXQgeih2KSB7IHRoaXMuel8gPSB0aGlzLm1lc2gucG9zaXRpb24ueiA9IHY7IH1cclxuICBnZXQgZW5hYmxlKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZW5hYmxlXztcclxuICB9XHJcbiAgXHJcbiAgc2V0IGVuYWJsZSh2KSB7XHJcbiAgICB0aGlzLmVuYWJsZV8gPSB2O1xyXG4gICAgdGhpcy5tZXNoLnZpc2libGUgPSB2O1xyXG4gIH1cclxuICBcclxuICAqbW92ZSh0YXNrSW5kZXgpIHtcclxuICAgIGZvcig7dGhpcy54ID49IChzZmcuVl9MRUZUIC0gMTYpICYmXHJcbiAgICAgICAgdGhpcy54IDw9IChzZmcuVl9SSUdIVCArIDE2KSAmJlxyXG4gICAgICAgIHRoaXMueSA+PSAoc2ZnLlZfQk9UVE9NIC0gMTYpICYmXHJcbiAgICAgICAgdGhpcy55IDw9IChzZmcuVl9UT1AgKyAxNikgJiYgdGFza0luZGV4ID49IDA7XHJcbiAgICAgICAgdGhpcy54ICs9IHRoaXMuZHgsdGhpcy55ICs9IHRoaXMuZHkpXHJcbiAgICB7XHJcbiAgICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpZih0YXNrSW5kZXggPj0gMCl7XHJcbiAgICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gICAgfVxyXG4gICAgdGhpcy5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5OT05FO1xyXG4gICAgdGhpcy5lbmFibGUgPSBmYWxzZTtcclxuICAgIHNmZy50YXNrcy5yZW1vdmVUYXNrKHRhc2tJbmRleCk7XHJcbiAgfVxyXG4gICBcclxuICBzdGFydCh4LCB5LCB6KSB7XHJcbiAgICBpZiAodGhpcy5lbmFibGUpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgdGhpcy54ID0geCB8fCAwO1xyXG4gICAgdGhpcy55ID0geSB8fCAwO1xyXG4gICAgdGhpcy56ID0geiB8fCAwO1xyXG4gICAgdGhpcy5lbmFibGUgPSB0cnVlO1xyXG4gICAgaWYgKHRoaXMuc3RhdHVzICE9IHRoaXMuTk9ORSlcclxuICAgIHtcclxuICAgICAgZGVidWdnZXI7XHJcbiAgICB9XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuTU9WRTtcclxuICAgIHZhciBhaW1SYWRpYW4gPSBNYXRoLmF0YW4yKHNmZy5teXNoaXBfLnkgLSB5LCBzZmcubXlzaGlwXy54IC0geCk7XHJcbiAgICB0aGlzLm1lc2gucm90YXRpb24ueiA9IGFpbVJhZGlhbjtcclxuICAgIHRoaXMuZHggPSBNYXRoLmNvcyhhaW1SYWRpYW4pICogKHRoaXMuc3BlZWQgKyBzZmcuc3RhZ2UuZGlmZmljdWx0eSk7XHJcbiAgICB0aGlzLmR5ID0gTWF0aC5zaW4oYWltUmFkaWFuKSAqICh0aGlzLnNwZWVkICsgc2ZnLnN0YWdlLmRpZmZpY3VsdHkpO1xyXG4vLyAgICBjb25zb2xlLmxvZygnZHg6JyArIHRoaXMuZHggKyAnIGR5OicgKyB0aGlzLmR5KTtcclxuXHJcbiAgICB0aGlzLnRhc2sgPSBzZmcudGFza3MucHVzaFRhc2sodGhpcy5tb3ZlLmJpbmQodGhpcykpO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG4gXHJcbiAgaGl0KCkge1xyXG4gICAgdGhpcy5lbmFibGUgPSBmYWxzZTtcclxuICAgIHNmZy50YXNrcy5yZW1vdmVUYXNrKHRoaXMudGFzay5pbmRleCk7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuTk9ORTtcclxuICB9XHJcbn1cclxuXHJcblxyXG5leHBvcnQgY2xhc3MgRW5lbXlCdWxsZXRzIHtcclxuICBjb25zdHJ1Y3RvcihzY2VuZSwgc2UpIHtcclxuICAgIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuICAgIHRoaXMuZW5lbXlCdWxsZXRzID0gW107XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDQ4OyArK2kpIHtcclxuICAgICAgdGhpcy5lbmVteUJ1bGxldHMucHVzaChuZXcgRW5lbXlCdWxsZXQodGhpcy5zY2VuZSwgc2UpKTtcclxuICAgIH1cclxuICB9XHJcbiAgc3RhcnQoeCwgeSwgeikge1xyXG4gICAgdmFyIGVicyA9IHRoaXMuZW5lbXlCdWxsZXRzO1xyXG4gICAgZm9yKHZhciBpID0gMCxlbmQgPSBlYnMubGVuZ3RoO2k8IGVuZDsrK2kpe1xyXG4gICAgICBpZighZWJzW2ldLmVuYWJsZSl7XHJcbiAgICAgICAgZWJzW2ldLnN0YXJ0KHgsIHksIHopO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIHJlc2V0KClcclxuICB7XHJcbiAgICB0aGlzLmVuZW15QnVsbGV0cy5mb3JFYWNoKChkLGkpPT57XHJcbiAgICAgIGlmKGQuZW5hYmxlKXtcclxuICAgICAgICB3aGlsZSghc2ZnLnRhc2tzLmFycmF5W2QudGFzay5pbmRleF0uZ2VuSW5zdC5uZXh0KC0oMSArIGQudGFzay5pbmRleCkpLmRvbmUpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDmlbXjgq3jg6Pjg6njga7li5XjgY0gLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4vLy8g55u057ea6YGL5YuVXHJcbmNsYXNzIExpbmVNb3ZlIHtcclxuICBjb25zdHJ1Y3RvcihyYWQsIHNwZWVkLCBzdGVwKSB7XHJcbiAgICB0aGlzLnJhZCA9IHJhZDtcclxuICAgIHRoaXMuc3BlZWQgPSBzcGVlZDtcclxuICAgIHRoaXMuc3RlcCA9IHN0ZXA7XHJcbiAgICB0aGlzLmN1cnJlbnRTdGVwID0gc3RlcDtcclxuICAgIHRoaXMuZHggPSBNYXRoLmNvcyhyYWQpICogc3BlZWQ7XHJcbiAgICB0aGlzLmR5ID0gTWF0aC5zaW4ocmFkKSAqIHNwZWVkO1xyXG4gIH1cclxuICBcclxuICAqbW92ZShzZWxmLHgseSkgXHJcbiAge1xyXG4gICAgXHJcbiAgICBpZiAoc2VsZi54cmV2KSB7XHJcbiAgICAgIHNlbGYuY2hhclJhZCA9IE1hdGguUEkgLSAodGhpcy5yYWQgLSBNYXRoLlBJIC8gMik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzZWxmLmNoYXJSYWQgPSB0aGlzLnJhZCAtIE1hdGguUEkgLyAyO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsZXQgZHkgPSB0aGlzLmR5O1xyXG4gICAgbGV0IGR4ID0gdGhpcy5keDtcclxuICAgIGNvbnN0IHN0ZXAgPSB0aGlzLnN0ZXA7XHJcbiAgICBcclxuICAgIGlmKHNlbGYueHJldil7XHJcbiAgICAgIGR4ID0gLWR4OyAgICAgIFxyXG4gICAgfVxyXG4gICAgbGV0IGNhbmNlbCA9IGZhbHNlO1xyXG4gICAgZm9yKGxldCBpID0gMDtpIDwgc3RlcCAmJiAhY2FuY2VsOysraSl7XHJcbiAgICAgIHNlbGYueCArPSBkeDtcclxuICAgICAgc2VsZi55ICs9IGR5O1xyXG4gICAgICBjYW5jZWwgPSB5aWVsZDtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgdG9KU09OKCl7XHJcbiAgICByZXR1cm4gW1xyXG4gICAgICBcIkxpbmVNb3ZlXCIsXHJcbiAgICAgIHRoaXMucmFkLFxyXG4gICAgICB0aGlzLnNwZWVkLFxyXG4gICAgICB0aGlzLnN0ZXBcclxuICAgIF07XHJcbiAgfVxyXG4gIFxyXG4gIHN0YXRpYyBmcm9tQXJyYXkoYXJyYXkpXHJcbiAge1xyXG4gICAgcmV0dXJuIG5ldyBMaW5lTW92ZShhcnJheVsxXSxhcnJheVsyXSxhcnJheVszXSk7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g5YaG6YGL5YuVXHJcbmNsYXNzIENpcmNsZU1vdmUge1xyXG4gIGNvbnN0cnVjdG9yKHN0YXJ0UmFkLCBzdG9wUmFkLCByLCBzcGVlZCwgbGVmdCkge1xyXG4gICAgdGhpcy5zdGFydFJhZCA9IChzdGFydFJhZCB8fCAwKSAqIE1hdGguUEk7XHJcbiAgICB0aGlzLnN0b3BSYWQgPSAgKHN0b3BSYWQgfHwgMCkgKiBNYXRoLlBJIDtcclxuICAgIHRoaXMuciA9IHIgfHwgMDtcclxuICAgIHRoaXMuc3BlZWQgPSBzcGVlZCB8fCAwO1xyXG4gICAgdGhpcy5sZWZ0ID0gIWxlZnQgPyBmYWxzZSA6IHRydWU7XHJcbiAgICB0aGlzLmRlbHRhcyA9IFtdO1xyXG4gICAgdmFyIHJhZCA9IHRoaXMuc3RhcnRSYWQ7XHJcbiAgICB2YXIgc3RlcCA9IChsZWZ0ID8gMSA6IC0xKSAqIHNwZWVkIC8gcjtcclxuICAgIHZhciBlbmQgPSBmYWxzZTtcclxuICAgIHdoaWxlICghZW5kKSB7XHJcbiAgICAgIHJhZCArPSBzdGVwO1xyXG4gICAgICBpZiAoKGxlZnQgJiYgKHJhZCA+PSB0aGlzLnN0b3BSYWQpKSB8fCAoIWxlZnQgJiYgcmFkIDw9IHRoaXMuc3RvcFJhZCkpIHtcclxuICAgICAgICByYWQgPSB0aGlzLnN0b3BSYWQ7XHJcbiAgICAgICAgZW5kID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmRlbHRhcy5wdXNoKHtcclxuICAgICAgICB4OiB0aGlzLnIgKiBNYXRoLmNvcyhyYWQpLFxyXG4gICAgICAgIHk6IHRoaXMuciAqIE1hdGguc2luKHJhZCksXHJcbiAgICAgICAgcmFkOiByYWRcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgXHJcbiAgKm1vdmUoc2VsZix4LHkpIHtcclxuICAgIC8vIOWIneacn+WMllxyXG4gICAgbGV0IHN4LHN5O1xyXG4gICAgaWYgKHNlbGYueHJldikge1xyXG4gICAgICBzeCA9IHggLSB0aGlzLnIgKiBNYXRoLmNvcyh0aGlzLnN0YXJ0UmFkICsgTWF0aC5QSSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzeCA9IHggLSB0aGlzLnIgKiBNYXRoLmNvcyh0aGlzLnN0YXJ0UmFkKTtcclxuICAgIH1cclxuICAgIHN5ID0geSAtIHRoaXMuciAqIE1hdGguc2luKHRoaXMuc3RhcnRSYWQpO1xyXG5cclxuICAgIGxldCBjYW5jZWwgPSBmYWxzZTtcclxuICAgIC8vIOenu+WLlVxyXG4gICAgZm9yKGxldCBpID0gMCxlID0gdGhpcy5kZWx0YXMubGVuZ3RoOyhpIDwgZSkgJiYgIWNhbmNlbDsrK2kpXHJcbiAgICB7XHJcbiAgICAgIHZhciBkZWx0YSA9IHRoaXMuZGVsdGFzW2ldO1xyXG4gICAgICBpZihzZWxmLnhyZXYpe1xyXG4gICAgICAgIHNlbGYueCA9IHN4IC0gZGVsdGEueDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzZWxmLnggPSBzeCArIGRlbHRhLng7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNlbGYueSA9IHN5ICsgZGVsdGEueTtcclxuICAgICAgaWYgKHNlbGYueHJldikge1xyXG4gICAgICAgIHNlbGYuY2hhclJhZCA9IChNYXRoLlBJIC0gZGVsdGEucmFkKSArICh0aGlzLmxlZnQgPyAtMSA6IDApICogTWF0aC5QSTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzZWxmLmNoYXJSYWQgPSBkZWx0YS5yYWQgKyAodGhpcy5sZWZ0ID8gMCA6IC0xKSAqIE1hdGguUEk7XHJcbiAgICAgIH1cclxuICAgICAgc2VsZi5yYWQgPSBkZWx0YS5yYWQ7XHJcbiAgICAgIGNhbmNlbCA9IHlpZWxkO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICB0b0pTT04oKXtcclxuICAgIHJldHVybiBcclxuICAgIFtcclxuICAgICAgXCJMaW5lTW92ZVwiLFxyXG4gICAgICB0aGlzLnN0YXJ0UmFkLFxyXG4gICAgICB0aGlzLnN0b3BSYWQsXHJcbiAgICAgIHRoaXMucixcclxuICAgICAgdGhpcy5zcGVlZCxcclxuICAgICAgdGhpcy5sZWZ0XHJcbiAgICBdO1xyXG4gIH1cclxuICBcclxuICBzdGF0aWMgZnJvbUFycmF5KGEpe1xyXG4gICAgcmV0dXJuIG5ldyBDaXJjbGVNb3ZlKGFbMV0sYVsyXSxhWzNdLGFbNF0sYVs1XSk7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g44Ob44O844Og44Od44K444K344On44Oz44Gr5oi744KLXHJcbmNsYXNzIEdvdG9Ib21lIHtcclxuXHJcbiAqbW92ZShzZWxmLCB4LCB5KSB7XHJcbiAgICBsZXQgcmFkID0gTWF0aC5hdGFuMihzZWxmLmhvbWVZIC0gc2VsZi55LCBzZWxmLmhvbWVYIC0gc2VsZi54KTtcclxuICAgIGxldCBzcGVlZCA9IDQ7XHJcblxyXG4gICAgc2VsZi5jaGFyUmFkID0gcmFkIC0gTWF0aC5QSSAvIDI7XHJcbiAgICBsZXQgZHggPSBNYXRoLmNvcyhyYWQpICogc3BlZWQ7XHJcbiAgICBsZXQgZHkgPSBNYXRoLnNpbihyYWQpICogc3BlZWQ7XHJcbiAgICBzZWxmLnogPSAwLjA7XHJcbiAgICBcclxuICAgIGxldCBjYW5jZWwgPSBmYWxzZTtcclxuICAgIGZvcig7KE1hdGguYWJzKHNlbGYueCAtIHNlbGYuaG9tZVgpID49IDIgfHwgTWF0aC5hYnMoc2VsZi55IC0gc2VsZi5ob21lWSkgPj0gMikgJiYgIWNhbmNlbFxyXG4gICAgICA7c2VsZi54ICs9IGR4LHNlbGYueSArPSBkeSlcclxuICAgIHtcclxuICAgICAgY2FuY2VsID0geWllbGQ7XHJcbiAgICB9XHJcblxyXG4gICAgc2VsZi5jaGFyUmFkID0gMDtcclxuICAgIHNlbGYueCA9IHNlbGYuaG9tZVg7XHJcbiAgICBzZWxmLnkgPSBzZWxmLmhvbWVZO1xyXG4gICAgaWYgKHNlbGYuc3RhdHVzID09IHNlbGYuU1RBUlQpIHtcclxuICAgICAgdmFyIGdyb3VwSUQgPSBzZWxmLmdyb3VwSUQ7XHJcbiAgICAgIHZhciBncm91cERhdGEgPSBzZWxmLmVuZW1pZXMuZ3JvdXBEYXRhO1xyXG4gICAgICBncm91cERhdGFbZ3JvdXBJRF0ucHVzaChzZWxmKTtcclxuICAgICAgc2VsZi5lbmVtaWVzLmhvbWVFbmVtaWVzQ291bnQrKztcclxuICAgIH1cclxuICAgIHNlbGYuc3RhdHVzID0gc2VsZi5IT01FO1xyXG4gIH1cclxuICBcclxuICB0b0pTT04oKXtcclxuICAgIHJldHVybiBbJ0dvdG9Ib21lJ107XHJcbiAgfVxyXG4gIFxyXG4gIHN0YXRpYyBmcm9tQXJyYXkoYSlcclxuICB7XHJcbiAgICByZXR1cm4gbmV3IEdvdG9Ib21lKCk7XHJcbiAgfVxyXG59XHJcblxyXG5cclxuLy8vIOW+heapn+S4reOBruaVteOBruWLleOBjVxyXG5jbGFzcyBIb21lTW92ZXtcclxuICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgdGhpcy5DRU5URVJfWCA9IDA7XHJcbiAgICB0aGlzLkNFTlRFUl9ZID0gMTAwO1xyXG4gIH1cclxuXHJcbiAgKm1vdmUoc2VsZiwgeCwgeSkge1xyXG5cclxuICAgIGxldCBkeCA9IHNlbGYuaG9tZVggLSB0aGlzLkNFTlRFUl9YO1xyXG4gICAgbGV0IGR5ID0gc2VsZi5ob21lWSAtIHRoaXMuQ0VOVEVSX1k7XHJcbiAgICBzZWxmLnogPSAtMC4xO1xyXG5cclxuICAgIHdoaWxlKHNlbGYuc3RhdHVzICE9IHNlbGYuQVRUQUNLKVxyXG4gICAge1xyXG4gICAgICBzZWxmLnggPSBzZWxmLmhvbWVYICsgZHggKiBzZWxmLmVuZW1pZXMuaG9tZURlbHRhO1xyXG4gICAgICBzZWxmLnkgPSBzZWxmLmhvbWVZICsgZHkgKiBzZWxmLmVuZW1pZXMuaG9tZURlbHRhO1xyXG4gICAgICBzZWxmLm1lc2guc2NhbGUueCA9IHNlbGYuZW5lbWllcy5ob21lRGVsdGEyO1xyXG4gICAgICB5aWVsZDtcclxuICAgIH1cclxuXHJcbiAgICBzZWxmLm1lc2guc2NhbGUueCA9IDEuMDtcclxuICAgIHNlbGYueiA9IDAuMDtcclxuXHJcbiAgfVxyXG4gIFxyXG4gIHRvSlNPTigpe1xyXG4gICAgcmV0dXJuIFsnSG9tZU1vdmUnXTtcclxuICB9XHJcbiAgXHJcbiAgc3RhdGljIGZyb21BcnJheShhKVxyXG4gIHtcclxuICAgIHJldHVybiBuZXcgSG9tZU1vdmUoKTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDmjIflrprjgrfjg7zjgrHjg7Pjgrnjgavnp7vli5XjgZnjgotcclxuY2xhc3MgR290byB7XHJcbiAgY29uc3RydWN0b3IocG9zKSB7IHRoaXMucG9zID0gcG9zOyB9O1xyXG4gICptb3ZlKHNlbGYsIHgsIHkpIHtcclxuICAgIHNlbGYuaW5kZXggPSB0aGlzLnBvcyAtIDE7XHJcbiAgfVxyXG4gIFxyXG4gIHRvSlNPTigpe1xyXG4gICAgcmV0dXJuIFtcclxuICAgICAgJ0dvdG8nLFxyXG4gICAgICB0aGlzLnBvc1xyXG4gICAgXTtcclxuICB9XHJcbiAgXHJcbiAgc3RhdGljIGZyb21BcnJheShhKXtcclxuICAgIHJldHVybiBuZXcgR290byhhWzFdKTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDmlbXlvL7nmbrlsIRcclxuY2xhc3MgRmlyZSB7XHJcbiAgKm1vdmUoc2VsZiwgeCwgeSkge1xyXG4gICAgbGV0IGQgPSAoc2ZnLnN0YWdlLm5vIC8gMjApICogKCBzZmcuc3RhZ2UuZGlmZmljdWx0eSk7XHJcbiAgICBpZiAoZCA+IDEpIHsgZCA9IDEuMDt9XHJcbiAgICBpZiAoTWF0aC5yYW5kb20oKSA8IGQpIHtcclxuICAgICAgc2VsZi5lbmVtaWVzLmVuZW15QnVsbGV0cy5zdGFydChzZWxmLngsIHNlbGYueSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIHRvSlNPTigpe1xyXG4gICAgcmV0dXJuIFsnRmlyZSddO1xyXG4gIH1cclxuICBcclxuICBzdGF0aWMgZnJvbUFycmF5KGEpXHJcbiAge1xyXG4gICAgcmV0dXJuIG5ldyBGaXJlKCk7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g5pW15pys5L2TXHJcbmV4cG9ydCBjbGFzcyBFbmVteSBleHRlbmRzIGdhbWVvYmouR2FtZU9iaiB7IFxyXG4gIGNvbnN0cnVjdG9yKGVuZW1pZXMsc2NlbmUsc2UpIHtcclxuICBzdXBlcigwLCAwLCAwKTtcclxuICB0aGlzLk5PTkUgPSAgMCA7XHJcbiAgdGhpcy5TVEFSVCA9ICAxIDtcclxuICB0aGlzLkhPTUUgPSAgMiA7XHJcbiAgdGhpcy5BVFRBQ0sgPSAgMyA7XHJcbiAgdGhpcy5CT01CID0gIDQgO1xyXG4gIHRoaXMuY29sbGlzaW9uQXJlYS53aWR0aCA9IDEyO1xyXG4gIHRoaXMuY29sbGlzaW9uQXJlYS5oZWlnaHQgPSA4O1xyXG4gIHZhciB0ZXggPSBzZmcudGV4dHVyZUZpbGVzLmVuZW15O1xyXG4gIHZhciBtYXRlcmlhbCA9IGdyYXBoaWNzLmNyZWF0ZVNwcml0ZU1hdGVyaWFsKHRleCk7XHJcbiAgdmFyIGdlb21ldHJ5ID0gZ3JhcGhpY3MuY3JlYXRlU3ByaXRlR2VvbWV0cnkoMTYpO1xyXG4gIGdyYXBoaWNzLmNyZWF0ZVNwcml0ZVVWKGdlb21ldHJ5LCB0ZXgsIDE2LCAxNiwgMCk7XHJcbiAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICB0aGlzLmdyb3VwSUQgPSAwO1xyXG4gIHRoaXMueiA9IDAuMDtcclxuICB0aGlzLmluZGV4ID0gMDtcclxuICB0aGlzLnNjb3JlID0gMDtcclxuICB0aGlzLm12UGF0dGVybiA9IG51bGw7XHJcbiAgdGhpcy5tdiA9IG51bGw7XHJcbiAgdGhpcy5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxuICB0aGlzLnN0YXR1cyA9IHRoaXMuTk9ORTtcclxuICB0aGlzLnR5cGUgPSBudWxsO1xyXG4gIHRoaXMubGlmZSA9IDA7XHJcbiAgdGhpcy50YXNrID0gbnVsbDtcclxuICB0aGlzLmhpdF8gPSBudWxsO1xyXG4gIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuICB0aGlzLnNjZW5lLmFkZCh0aGlzLm1lc2gpO1xyXG4gIHRoaXMuc2UgPSBzZTtcclxuICB0aGlzLmVuZW1pZXMgPSBlbmVtaWVzO1xyXG4gIFxyXG59XHJcbiAgZ2V0IHgoKSB7IHJldHVybiB0aGlzLnhfOyB9XHJcbiAgc2V0IHgodikgeyB0aGlzLnhfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnggPSB2OyB9XHJcbiAgZ2V0IHkoKSB7IHJldHVybiB0aGlzLnlfOyB9XHJcbiAgc2V0IHkodikgeyB0aGlzLnlfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnkgPSB2OyB9XHJcbiAgZ2V0IHooKSB7IHJldHVybiB0aGlzLnpfOyB9XHJcbiAgc2V0IHoodikgeyB0aGlzLnpfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnogPSB2OyB9XHJcbiAgXHJcbiAgLy8v5pW144Gu5YuV44GNXHJcbiAgKm1vdmUodGFza0luZGV4KSB7XHJcbiAgICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICAgIHdoaWxlICh0YXNrSW5kZXggPj0gMCl7XHJcbiAgICAgIHdoaWxlKCF0aGlzLm12Lm5leHQoKS5kb25lICYmIHRhc2tJbmRleCA+PSAwKVxyXG4gICAgICB7XHJcbiAgICAgICAgdGhpcy5tZXNoLnNjYWxlLnggPSB0aGlzLmVuZW1pZXMuaG9tZURlbHRhMjtcclxuICAgICAgICB0aGlzLm1lc2gucm90YXRpb24ueiA9IHRoaXMuY2hhclJhZDtcclxuICAgICAgICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIGlmKHRhc2tJbmRleCA8IDApe1xyXG4gICAgICAgIHRhc2tJbmRleCA9IC0oKyt0YXNrSW5kZXgpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgbGV0IGVuZCA9IGZhbHNlO1xyXG4gICAgICB3aGlsZSAoIWVuZCkge1xyXG4gICAgICAgIGlmICh0aGlzLmluZGV4IDwgKHRoaXMubXZQYXR0ZXJuLmxlbmd0aCAtIDEpKSB7XHJcbiAgICAgICAgICB0aGlzLmluZGV4Kys7XHJcbiAgICAgICAgICB0aGlzLm12ID0gdGhpcy5tdlBhdHRlcm5bdGhpcy5pbmRleF0ubW92ZSh0aGlzLHRoaXMueCx0aGlzLnkpO1xyXG4gICAgICAgICAgZW5kID0gIXRoaXMubXYubmV4dCgpLmRvbmU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICB0aGlzLm1lc2guc2NhbGUueCA9IHRoaXMuZW5lbWllcy5ob21lRGVsdGEyO1xyXG4gICAgICB0aGlzLm1lc2gucm90YXRpb24ueiA9IHRoaXMuY2hhclJhZDtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgLy8vIOWIneacn+WMllxyXG4gIHN0YXJ0KHgsIHksIHosIGhvbWVYLCBob21lWSwgbXZQYXR0ZXJuLCB4cmV2LHR5cGUsIGNsZWFyVGFyZ2V0LGdyb3VwSUQpIHtcclxuICAgIGlmICh0aGlzLmVuYWJsZV8pIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgdGhpcy50eXBlID0gdHlwZTtcclxuICAgIHR5cGUodGhpcyk7XHJcbiAgICB0aGlzLnggPSB4O1xyXG4gICAgdGhpcy55ID0geTtcclxuICAgIHRoaXMueiA9IHo7XHJcbiAgICB0aGlzLnhyZXYgPSB4cmV2O1xyXG4gICAgdGhpcy5lbmFibGVfID0gdHJ1ZTtcclxuICAgIHRoaXMuaG9tZVggPSBob21lWCB8fCAwO1xyXG4gICAgdGhpcy5ob21lWSA9IGhvbWVZIHx8IDA7XHJcbiAgICB0aGlzLmluZGV4ID0gMDtcclxuICAgIHRoaXMuZ3JvdXBJRCA9IGdyb3VwSUQ7XHJcbiAgICB0aGlzLm12UGF0dGVybiA9IG12UGF0dGVybjtcclxuICAgIHRoaXMuY2xlYXJUYXJnZXQgPSBjbGVhclRhcmdldCB8fCB0cnVlO1xyXG4gICAgdGhpcy5tZXNoLm1hdGVyaWFsLmNvbG9yLnNldEhleCgweEZGRkZGRik7XHJcbiAgICB0aGlzLm12ID0gbXZQYXR0ZXJuWzBdLm1vdmUodGhpcyx4LHkpO1xyXG4gICAgLy90aGlzLm12LnN0YXJ0KHRoaXMsIHgsIHkpO1xyXG4gICAgLy9pZiAodGhpcy5zdGF0dXMgIT0gdGhpcy5OT05FKSB7XHJcbiAgICAvLyAgZGVidWdnZXI7XHJcbiAgICAvL31cclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5TVEFSVDtcclxuICAgIHRoaXMudGFzayA9IHNmZy50YXNrcy5wdXNoVGFzayh0aGlzLm1vdmUuYmluZCh0aGlzKSwgMTAwMDApO1xyXG4gICAgaWYodGhpcy50YXNrLmluZGV4ID09IDApe1xyXG4gICAgICBkZWJ1Z2dlcjtcclxuICAgIH1cclxuICAgIHRoaXMubWVzaC52aXNpYmxlID0gdHJ1ZTtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuICBcclxuICBoaXQobXlidWxsZXQpIHtcclxuICAgIGlmICh0aGlzLmhpdF8gPT0gbnVsbCkge1xyXG4gICAgICBsZXQgbGlmZSA9IHRoaXMubGlmZTtcclxuICAgICAgdGhpcy5saWZlIC09IG15YnVsbGV0LnBvd2VyIHx8IDE7XHJcbiAgICAgIG15YnVsbGV0LnBvd2VyIC09IGxpZmU7IFxyXG4vLyAgICAgIHRoaXMubGlmZS0tO1xyXG4gICAgICBpZiAodGhpcy5saWZlIDw9IDApIHtcclxuICAgICAgICBzZmcuYm9tYnMuc3RhcnQodGhpcy54LCB0aGlzLnkpO1xyXG4gICAgICAgIHRoaXMuc2UoMSk7XHJcbiAgICAgICAgc2ZnLmFkZFNjb3JlKHRoaXMuc2NvcmUpO1xyXG4gICAgICAgIGlmICh0aGlzLmNsZWFyVGFyZ2V0KSB7XHJcbiAgICAgICAgICB0aGlzLmVuZW1pZXMuaGl0RW5lbWllc0NvdW50Kys7XHJcbiAgICAgICAgICBpZiAodGhpcy5zdGF0dXMgPT0gdGhpcy5TVEFSVCkge1xyXG4gICAgICAgICAgICB0aGlzLmVuZW1pZXMuaG9tZUVuZW1pZXNDb3VudCsrO1xyXG4gICAgICAgICAgICB0aGlzLmVuZW1pZXMuZ3JvdXBEYXRhW3RoaXMuZ3JvdXBJRF0ucHVzaCh0aGlzKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHRoaXMuZW5lbWllcy5ncm91cERhdGFbdGhpcy5ncm91cElEXS5nb25lQ291bnQrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodGhpcy50YXNrLmluZGV4ID09IDApe1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ2hpdCcsdGhpcy50YXNrLmluZGV4KTtcclxuICAgICAgICAgIGRlYnVnZ2VyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmVuYWJsZV8gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnN0YXR1cyA9IHRoaXMuTk9ORTtcclxuICAgICAgICBzZmcudGFza3MuYXJyYXlbdGhpcy50YXNrLmluZGV4XS5nZW5JbnN0Lm5leHQoLSh0aGlzLnRhc2suaW5kZXggKyAxKSk7XHJcbiAgICAgICAgc2ZnLnRhc2tzLnJlbW92ZVRhc2sodGhpcy50YXNrLmluZGV4KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnNlKDIpO1xyXG4gICAgICAgIHRoaXMubWVzaC5tYXRlcmlhbC5jb2xvci5zZXRIZXgoMHhGRjgwODApO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmhpdF8obXlidWxsZXQpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gWmFrbyhzZWxmKSB7XHJcbiAgc2VsZi5zY29yZSA9IDUwO1xyXG4gIHNlbGYubGlmZSA9IDE7XHJcbiAgZ3JhcGhpY3MudXBkYXRlU3ByaXRlVVYoc2VsZi5tZXNoLmdlb21ldHJ5LCBzZmcudGV4dHVyZUZpbGVzLmVuZW15LCAxNiwgMTYsIDcpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBaYWtvMShzZWxmKSB7XHJcbiAgc2VsZi5zY29yZSA9IDEwMDtcclxuICBzZWxmLmxpZmUgPSAxO1xyXG4gIGdyYXBoaWNzLnVwZGF0ZVNwcml0ZVVWKHNlbGYubWVzaC5nZW9tZXRyeSwgc2ZnLnRleHR1cmVGaWxlcy5lbmVteSwgMTYsIDE2LCA2KTtcclxufVxyXG5cclxuZnVuY3Rpb24gTUJvc3Moc2VsZikge1xyXG4gIHNlbGYuc2NvcmUgPSAzMDA7XHJcbiAgc2VsZi5saWZlID0gMjtcclxuICBzZWxmLm1lc2guYmxlbmRpbmcgPSBUSFJFRS5Ob3JtYWxCbGVuZGluZztcclxuICBncmFwaGljcy51cGRhdGVTcHJpdGVVVihzZWxmLm1lc2guZ2VvbWV0cnksIHNmZy50ZXh0dXJlRmlsZXMuZW5lbXksIDE2LCAxNiwgNCk7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBFbmVtaWVze1xyXG4gIGNvbnN0cnVjdG9yKHNjZW5lLCBzZSwgZW5lbXlCdWxsZXRzKSB7XHJcbiAgICB0aGlzLmVuZW15QnVsbGV0cyA9IGVuZW15QnVsbGV0cztcclxuICAgIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuICAgIHRoaXMubmV4dFRpbWUgPSAwO1xyXG4gICAgdGhpcy5jdXJyZW50SW5kZXggPSAwO1xyXG4gICAgdGhpcy5lbmVtaWVzID0gbmV3IEFycmF5KDApO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA2NDsgKytpKSB7XHJcbiAgICAgIHRoaXMuZW5lbWllcy5wdXNoKG5ldyBFbmVteSh0aGlzLCBzY2VuZSwgc2UpKTtcclxuICAgIH1cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNTsgKytpKSB7XHJcbiAgICAgIHRoaXMuZ3JvdXBEYXRhW2ldID0gbmV3IEFycmF5KDApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8vIOaVtee3qOmaiuOBruWLleOBjeOCkuOCs+ODs+ODiOODreODvOODq+OBmeOCi1xyXG4gIG1vdmUoKSB7XHJcbiAgICB2YXIgY3VycmVudFRpbWUgPSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lO1xyXG4gICAgdmFyIG1vdmVTZXFzID0gdGhpcy5tb3ZlU2VxcztcclxuICAgIHZhciBsZW4gPSBtb3ZlU2Vxc1tzZmcuc3RhZ2UucHJpdmF0ZU5vXS5sZW5ndGg7XHJcbiAgICAvLyDjg4fjg7zjgr/phY3liJfjgpLjgoLjgajjgavmlbXjgpLnlJ/miJBcclxuICAgIHdoaWxlICh0aGlzLmN1cnJlbnRJbmRleCA8IGxlbikge1xyXG4gICAgICB2YXIgZGF0YSA9IG1vdmVTZXFzW3NmZy5zdGFnZS5wcml2YXRlTm9dW3RoaXMuY3VycmVudEluZGV4XTtcclxuICAgICAgdmFyIG5leHRUaW1lID0gdGhpcy5uZXh0VGltZSAhPSBudWxsID8gdGhpcy5uZXh0VGltZSA6IGRhdGFbMF07XHJcbiAgICAgIGlmIChjdXJyZW50VGltZSA+PSAodGhpcy5uZXh0VGltZSArIGRhdGFbMF0pKSB7XHJcbiAgICAgICAgdmFyIGVuZW1pZXMgPSB0aGlzLmVuZW1pZXM7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGUgPSBlbmVtaWVzLmxlbmd0aDsgaSA8IGU7ICsraSkge1xyXG4gICAgICAgICAgdmFyIGVuZW15ID0gZW5lbWllc1tpXTtcclxuICAgICAgICAgIGlmICghZW5lbXkuZW5hYmxlXykge1xyXG4gICAgICAgICAgICBlbmVteS5zdGFydChkYXRhWzFdLCBkYXRhWzJdLCAwLCBkYXRhWzNdLCBkYXRhWzRdLCB0aGlzLm1vdmVQYXR0ZXJuc1tNYXRoLmFicyhkYXRhWzVdKV0sIGRhdGFbNV0gPCAwLCBkYXRhWzZdLCBkYXRhWzddLCBkYXRhWzhdIHx8IDApO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jdXJyZW50SW5kZXgrKztcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50SW5kZXggPCBsZW4pIHtcclxuICAgICAgICAgIHRoaXMubmV4dFRpbWUgPSBjdXJyZW50VGltZSArIG1vdmVTZXFzW3NmZy5zdGFnZS5wcml2YXRlTm9dW3RoaXMuY3VycmVudEluZGV4XVswXTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIOODm+ODvOODoOODneOCuOOCt+ODp+ODs+OBq+aVteOBjOOBmeOBueOBpuaVtOWIl+OBl+OBn+OBi+eiuuiqjeOBmeOCi+OAglxyXG4gICAgaWYgKHRoaXMuaG9tZUVuZW1pZXNDb3VudCA9PSB0aGlzLnRvdGFsRW5lbWllc0NvdW50ICYmIHRoaXMuc3RhdHVzID09IHRoaXMuU1RBUlQpIHtcclxuICAgICAgLy8g5pW05YiX44GX44Gm44GE44Gf44KJ5pW05YiX44Oi44O844OJ44Gr56e76KGM44GZ44KL44CCXHJcbiAgICAgIHRoaXMuc3RhdHVzID0gdGhpcy5IT01FO1xyXG4gICAgICB0aGlzLmVuZFRpbWUgPSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lICsgMC41ICogKDIuMCAtIHNmZy5zdGFnZS5kaWZmaWN1bHR5KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyDjg5vjg7zjg6Djg53jgrjjgrfjg6fjg7PjgafkuIDlrprmmYLplpPlvoXmqZ/jgZnjgotcclxuICAgIGlmICh0aGlzLnN0YXR1cyA9PSB0aGlzLkhPTUUpIHtcclxuICAgICAgaWYgKHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgPiB0aGlzLmVuZFRpbWUpIHtcclxuICAgICAgICB0aGlzLnN0YXR1cyA9IHRoaXMuQVRUQUNLO1xyXG4gICAgICAgIHRoaXMuZW5kVGltZSA9IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgKyAoc2ZnLnN0YWdlLkRJRkZJQ1VMVFlfTUFYIC0gc2ZnLnN0YWdlLmRpZmZpY3VsdHkpICogMztcclxuICAgICAgICB0aGlzLmdyb3VwID0gMDtcclxuICAgICAgICB0aGlzLmNvdW50ID0gMDtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIOaUu+aSg+OBmeOCi1xyXG4gICAgaWYgKHRoaXMuc3RhdHVzID09IHRoaXMuQVRUQUNLICYmIHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgPiB0aGlzLmVuZFRpbWUpIHtcclxuICAgICAgdGhpcy5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIChzZmcuc3RhZ2UuRElGRklDVUxUWV9NQVggLSBzZmcuc3RhZ2UuZGlmZmljdWx0eSkgKiAzO1xyXG4gICAgICB2YXIgZ3JvdXBEYXRhID0gdGhpcy5ncm91cERhdGE7XHJcbiAgICAgIHZhciBhdHRhY2tDb3VudCA9ICgxICsgMC4yNSAqIChzZmcuc3RhZ2UuZGlmZmljdWx0eSkpIHwgMDtcclxuICAgICAgdmFyIGdyb3VwID0gZ3JvdXBEYXRhW3RoaXMuZ3JvdXBdO1xyXG5cclxuICAgICAgaWYgKCFncm91cCB8fCBncm91cC5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSAwO1xyXG4gICAgICAgIHZhciBncm91cCA9IGdyb3VwRGF0YVswXTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGdyb3VwLmxlbmd0aCA+IDAgJiYgZ3JvdXAubGVuZ3RoID4gZ3JvdXAuZ29uZUNvdW50KSB7XHJcbiAgICAgICAgaWYgKCFncm91cC5pbmRleCkge1xyXG4gICAgICAgICAgZ3JvdXAuaW5kZXggPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXMuZ3JvdXApIHtcclxuICAgICAgICAgIHZhciBjb3VudCA9IDAsIGVuZGcgPSBncm91cC5sZW5ndGg7XHJcbiAgICAgICAgICB3aGlsZSAoY291bnQgPCBlbmRnICYmIGF0dGFja0NvdW50ID4gMCkge1xyXG4gICAgICAgICAgICB2YXIgZW4gPSBncm91cFtncm91cC5pbmRleF07XHJcbiAgICAgICAgICAgIGlmIChlbi5lbmFibGVfICYmIGVuLnN0YXR1cyA9PSBlbi5IT01FKSB7XHJcbiAgICAgICAgICAgICAgZW4uc3RhdHVzID0gZW4uQVRUQUNLO1xyXG4gICAgICAgICAgICAgIC0tYXR0YWNrQ291bnQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY291bnQrKztcclxuICAgICAgICAgICAgZ3JvdXAuaW5kZXgrKztcclxuICAgICAgICAgICAgaWYgKGdyb3VwLmluZGV4ID49IGdyb3VwLmxlbmd0aCkgZ3JvdXAuaW5kZXggPSAwO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gZ3JvdXAubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgICAgICAgdmFyIGVuID0gZ3JvdXBbaV07XHJcbiAgICAgICAgICAgIGlmIChlbi5lbmFibGVfICYmIGVuLnN0YXR1cyA9PSBlbi5IT01FKSB7XHJcbiAgICAgICAgICAgICAgZW4uc3RhdHVzID0gZW4uQVRUQUNLO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLmdyb3VwKys7XHJcbiAgICAgIGlmICh0aGlzLmdyb3VwID49IHRoaXMuZ3JvdXBEYXRhLmxlbmd0aCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSAwO1xyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIOODm+ODvOODoOODneOCuOOCt+ODp+ODs+OBp+OBruW+heapn+WLleS9nFxyXG4gICAgdGhpcy5ob21lRGVsdGFDb3VudCArPSAwLjAyNTtcclxuICAgIHRoaXMuaG9tZURlbHRhID0gTWF0aC5zaW4odGhpcy5ob21lRGVsdGFDb3VudCkgKiAwLjA4O1xyXG4gICAgdGhpcy5ob21lRGVsdGEyID0gMS4wICsgTWF0aC5zaW4odGhpcy5ob21lRGVsdGFDb3VudCAqIDgpICogMC4xO1xyXG5cclxuICB9XHJcblxyXG4gIHJlc2V0KCkge1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHRoaXMuZW5lbWllcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgICB2YXIgZW4gPSB0aGlzLmVuZW1pZXNbaV07XHJcbiAgICAgIGlmIChlbi5lbmFibGVfKSB7XHJcbiAgICAgICAgc2ZnLnRhc2tzLnJlbW92ZVRhc2soZW4udGFzay5pbmRleCk7XHJcbiAgICAgICAgZW4uc3RhdHVzID0gZW4uTk9ORTtcclxuICAgICAgICBlbi5lbmFibGVfID0gZmFsc2U7XHJcbiAgICAgICAgZW4ubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNhbGNFbmVtaWVzQ291bnQoKSB7XHJcbiAgICB2YXIgc2VxcyA9IHRoaXMubW92ZVNlcXNbc2ZnLnN0YWdlLnByaXZhdGVOb107XHJcbiAgICB0aGlzLnRvdGFsRW5lbWllc0NvdW50ID0gMDtcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSBzZXFzLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIGlmIChzZXFzW2ldWzddKSB7XHJcbiAgICAgICAgdGhpcy50b3RhbEVuZW1pZXNDb3VudCsrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBzdGFydCgpIHtcclxuICAgIHRoaXMubmV4dFRpbWUgPSAwO1xyXG4gICAgdGhpcy5jdXJyZW50SW5kZXggPSAwO1xyXG4gICAgdGhpcy50b3RhbEVuZW1pZXNDb3VudCA9IDA7XHJcbiAgICB0aGlzLmhpdEVuZW1pZXNDb3VudCA9IDA7XHJcbiAgICB0aGlzLmhvbWVFbmVtaWVzQ291bnQgPSAwO1xyXG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLlNUQVJUO1xyXG4gICAgdmFyIGdyb3VwRGF0YSA9IHRoaXMuZ3JvdXBEYXRhO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IGdyb3VwRGF0YS5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgICBncm91cERhdGFbaV0ubGVuZ3RoID0gMDtcclxuICAgICAgZ3JvdXBEYXRhW2ldLmdvbmVDb3VudCA9IDA7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxufVxyXG5cclxuRW5lbWllcy5wcm90b3R5cGUubW92ZVBhdHRlcm5zID0gW1xyXG4gIC8vIDBcclxuICBbXHJcbiAgICBuZXcgQ2lyY2xlTW92ZShNYXRoLlBJLCAxLjEyNSAqIE1hdGguUEksIDMwMCwgMywgdHJ1ZSksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgxLjEyNSAqIE1hdGguUEksIDEuMjUgKiBNYXRoLlBJLCAyMDAsIDMsIHRydWUpLFxyXG4gICAgbmV3IEZpcmUoKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKE1hdGguUEkgLyA0LCAtMyAqIE1hdGguUEksIDQwLCA1LCBmYWxzZSksXHJcbiAgICBuZXcgR290b0hvbWUoKSxcclxuICAgIG5ldyBIb21lTW92ZSgpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoTWF0aC5QSSwgMCwgMTAsIDMsIGZhbHNlKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDAsIC0wLjEyNSAqIE1hdGguUEksIDIwMCwgMywgZmFsc2UpLFxyXG4gICAgbmV3IEZpcmUoKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKC0wLjEyNSAqIE1hdGguUEksIC0wLjI1ICogTWF0aC5QSSwgMTUwLCAyLjUsIGZhbHNlKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDMgKiBNYXRoLlBJIC8gNCwgNCAqIE1hdGguUEksIDQwLCAyLjUsIHRydWUpLFxyXG4gICAgbmV3IEdvdG8oNClcclxuICBdLC8vIDFcclxuICBbXHJcbiAgICBuZXcgQ2lyY2xlTW92ZShNYXRoLlBJLCAxLjEyNSAqIE1hdGguUEksIDMwMCwgNSwgdHJ1ZSksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgxLjEyNSAqIE1hdGguUEksIDEuMjUgKiBNYXRoLlBJLCAyMDAsIDUsIHRydWUpLFxyXG4gICAgbmV3IEZpcmUoKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKE1hdGguUEkgLyA0LCAtMyAqIE1hdGguUEksIDQwLCA2LCBmYWxzZSksXHJcbiAgICBuZXcgR290b0hvbWUoKSxcclxuICAgIG5ldyBIb21lTW92ZSgpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoTWF0aC5QSSwgMCwgMTAsIDMsIGZhbHNlKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDAsIC0wLjEyNSAqIE1hdGguUEksIDIwMCwgMywgZmFsc2UpLFxyXG4gICAgbmV3IEZpcmUoKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKC0wLjEyNSAqIE1hdGguUEksIC0wLjI1ICogTWF0aC5QSSwgMjUwLCAzLCBmYWxzZSksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgzICogTWF0aC5QSSAvIDQsIDQgKiBNYXRoLlBJLCA0MCwgMywgdHJ1ZSksXHJcbiAgICBuZXcgR290byg0KVxyXG4gIF0sLy8gMlxyXG4gIFtcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDAsIC0wLjEyNSAqIE1hdGguUEksIDMwMCwgMywgZmFsc2UpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoLTAuMTI1ICogTWF0aC5QSSwgLTAuMjUgKiBNYXRoLlBJLCAyMDAsIDMsIGZhbHNlKSxcclxuICAgIG5ldyBGaXJlKCksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgzICogTWF0aC5QSSAvIDQsICgyICsgMC4yNSkgKiBNYXRoLlBJLCA0MCwgNSwgdHJ1ZSksXHJcbiAgICBuZXcgR290b0hvbWUoKSxcclxuICAgIG5ldyBIb21lTW92ZSgpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMCwgTWF0aC5QSSwgMTAsIDMsIHRydWUpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoTWF0aC5QSSwgMS4xMjUgKiBNYXRoLlBJLCAyMDAsIDMsIHRydWUpLFxyXG4gICAgbmV3IEZpcmUoKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDEuMTI1ICogTWF0aC5QSSwgMS4yNSAqIE1hdGguUEksIDE1MCwgMi41LCB0cnVlKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDAuMjUgKiBNYXRoLlBJLCAtMyAqIE1hdGguUEksIDQwLCAyLjUsIGZhbHNlKSxcclxuICAgIG5ldyBHb3RvKDQpXHJcbiAgXSwvLyAzXHJcbiAgW1xyXG4gICAgbmV3IENpcmNsZU1vdmUoMCwgLTAuMTI1ICogTWF0aC5QSSwgMzAwLCA1LCBmYWxzZSksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgtMC4xMjUgKiBNYXRoLlBJLCAtMC4yNSAqIE1hdGguUEksIDIwMCwgNSwgZmFsc2UpLFxyXG4gICAgbmV3IEZpcmUoKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDMgKiBNYXRoLlBJIC8gNCwgKDQgKyAwLjI1KSAqIE1hdGguUEksIDQwLCA2LCB0cnVlKSxcclxuICAgIG5ldyBGaXJlKCksXHJcbiAgICBuZXcgR290b0hvbWUoKSxcclxuICAgIG5ldyBIb21lTW92ZSgpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMCwgTWF0aC5QSSwgMTAsIDMsIHRydWUpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoTWF0aC5QSSwgMS4xMjUgKiBNYXRoLlBJLCAyMDAsIDMsIHRydWUpLFxyXG4gICAgbmV3IEZpcmUoKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDEuMTI1ICogTWF0aC5QSSwgMS4yNSAqIE1hdGguUEksIDE1MCwgMywgdHJ1ZSksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgwLjI1ICogTWF0aC5QSSwgLTMgKiBNYXRoLlBJLCA0MCwgMywgZmFsc2UpLFxyXG4gICAgbmV3IEdvdG8oNClcclxuICBdLFxyXG4gIFsgLy8gNFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMCwgLTAuMjUgKiBNYXRoLlBJLCAxNzYsIDQsIGZhbHNlKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDAuNzUgKiBNYXRoLlBJLCBNYXRoLlBJLCAxMTIsIDQsIHRydWUpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoTWF0aC5QSSwgMy4xMjUgKiBNYXRoLlBJLCA2NCwgNCwgdHJ1ZSksXHJcbiAgICBuZXcgR290b0hvbWUoKSxcclxuICAgIG5ldyBIb21lTW92ZSgpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMCwgMC4xMjUgKiBNYXRoLlBJLCAyNTAsIDMsIHRydWUpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMC4xMjUgKiBNYXRoLlBJLCBNYXRoLlBJLCA4MCwgMywgdHJ1ZSksXHJcbiAgICBuZXcgRmlyZSgpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoTWF0aC5QSSwgMS43NSAqIE1hdGguUEksIDUwLCAzLCB0cnVlKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDAuNzUgKiBNYXRoLlBJLCAwLjUgKiBNYXRoLlBJLCAxMDAsIDMsIGZhbHNlKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDAuNSAqIE1hdGguUEksIC0yICogTWF0aC5QSSwgMjAsIDMsIGZhbHNlKSxcclxuICAgIG5ldyBHb3RvKDMpXHJcbiAgXSxcclxuICBbLy8gNVxyXG4gICAgbmV3IENpcmNsZU1vdmUoMCwgLTAuMTI1ICogTWF0aC5QSSwgMzAwLCAzLCBmYWxzZSksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgtMC4xMjUgKiBNYXRoLlBJLCAtMC4yNSAqIE1hdGguUEksIDIwMCwgMywgZmFsc2UpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMyAqIE1hdGguUEkgLyA0LCAoMykgKiBNYXRoLlBJLCA0MCwgNSwgdHJ1ZSksXHJcbiAgICBuZXcgR290b0hvbWUoKSxcclxuICAgIG5ldyBIb21lTW92ZSgpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoTWF0aC5QSSwgMC44NzUgKiBNYXRoLlBJLCAyNTAsIDMsIGZhbHNlKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDAuODc1ICogTWF0aC5QSSwgMCwgODAsIDMsIGZhbHNlKSxcclxuICAgIG5ldyBGaXJlKCksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgwLCAtMC43NSAqIE1hdGguUEksIDUwLCAzLCBmYWxzZSksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgwLjI1ICogTWF0aC5QSSwgMC41ICogTWF0aC5QSSwgMTAwLCAzLCB0cnVlKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDAuNSAqIE1hdGguUEksIDMgKiBNYXRoLlBJLCAyMCwgMywgdHJ1ZSksXHJcbiAgICBuZXcgR290bygzKVxyXG4gIF0sXHJcbiAgWyAvLyA2IC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgxLjUgKiBNYXRoLlBJLCBNYXRoLlBJLCA5NiwgNCwgZmFsc2UpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMCwgMiAqIE1hdGguUEksIDQ4LCA0LCB0cnVlKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKE1hdGguUEksIDAuNzUgKiBNYXRoLlBJLCAzMiwgNCwgZmFsc2UpLFxyXG4gICAgbmV3IEdvdG9Ib21lKCksXHJcbiAgICBuZXcgSG9tZU1vdmUoKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKE1hdGguUEksIDAsIDEwLCAzLCBmYWxzZSksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgwLCAtMC4xMjUgKiBNYXRoLlBJLCAyMDAsIDMsIGZhbHNlKSxcclxuICAgIG5ldyBGaXJlKCksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgtMC4xMjUgKiBNYXRoLlBJLCAtMC4yNSAqIE1hdGguUEksIDE1MCwgMi41LCBmYWxzZSksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgzICogTWF0aC5QSSAvIDQsIDQgKiBNYXRoLlBJLCA0MCwgMi41LCB0cnVlKSxcclxuICAgIG5ldyBHb3RvKDMpXHJcbiAgXSxcclxuICBbIC8vIDcgLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgbmV3IENpcmNsZU1vdmUoMCwgLTAuMjUgKiBNYXRoLlBJLCAxNzYsIDQsIGZhbHNlKSxcclxuICAgIG5ldyBGaXJlKCksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgwLjc1ICogTWF0aC5QSSwgTWF0aC5QSSwgMTEyLCA0LCB0cnVlKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKE1hdGguUEksIDIuMTI1ICogTWF0aC5QSSwgNDgsIDQsIHRydWUpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMS4xMjUgKiBNYXRoLlBJLCBNYXRoLlBJLCA0OCwgNCwgZmFsc2UpLFxyXG4gICAgbmV3IEdvdG9Ib21lKCksXHJcbiAgICBuZXcgSG9tZU1vdmUoKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKE1hdGguUEksIDAsIDEwLCAzLCBmYWxzZSksXHJcbiAgICBuZXcgRmlyZSgpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMCwgLTAuMTI1ICogTWF0aC5QSSwgMjAwLCAzLCBmYWxzZSksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgtMC4xMjUgKiBNYXRoLlBJLCAtMC4yNSAqIE1hdGguUEksIDE1MCwgMi41LCBmYWxzZSksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgzICogTWF0aC5QSSAvIDQsIDQgKiBNYXRoLlBJLCA0MCwgMi41LCB0cnVlKSxcclxuICAgIG5ldyBHb3RvKDUpXHJcbiAgXVxyXG5dXHJcbjtcclxuRW5lbWllcy5wcm90b3R5cGUubW92ZVNlcXMgPSBbXHJcbiAgW1xyXG4gICAgLy8gKioqIFNUQUdFIDEgKioqIC8vXHJcbiAgICAvLyBpbnRlcnZhbCxzdGFydCB4LHN0YXJ0IHksaG9tZSB4LGhvbWUgeSxtb3ZlIHBhdHRlcm4gKyB45Y+N6LuiLGNsZWFyIHRhcmdldCxncm91cCBJRFxyXG4gICAgWzAuOCwgNTYsIDE3NiwgNzUsIDQwLCA3LCBaYWtvLCB0cnVlXSxcclxuICAgIFswLjA0LCA1NiwgMTc2LCAzNSwgNDAsIDcsIFpha28sIHRydWVdLFxyXG4gICAgWzAuMDQsIDU2LCAxNzYsIDU1LCA0MCwgNywgWmFrbywgdHJ1ZV0sXHJcbiAgICBbMC4wNCwgNTYsIDE3NiwgMTUsIDQwLCA3LCBaYWtvLCB0cnVlXSxcclxuICAgIFswLjA0LCA1NiwgMTc2LCA3NSwgLTEyMCwgNCwgWmFrbywgdHJ1ZV0sXHJcblxyXG4gICAgWzAuOCwgLTU2LCAxNzYsIC03NSwgNDAsIC03LCBaYWtvLCB0cnVlXSxcclxuICAgIFswLjA0LCAtNTYsIDE3NiwgLTM1LCA0MCwgLTcsIFpha28sIHRydWVdLFxyXG4gICAgWzAuMDQsIC01NiwgMTc2LCAtNTUsIDQwLCAtNywgWmFrbywgdHJ1ZV0sXHJcbiAgICBbMC4wNCwgLTU2LCAxNzYsIC0xNSwgNDAsIC03LCBaYWtvLCB0cnVlXSxcclxuICAgIFswLjA0LCAtNTYsIDE3NiwgLTc1LCAtMTIwLCAtNCwgWmFrbywgdHJ1ZV0sXHJcblxyXG4gICAgWzAuOCwgMTI4LCAtMTI4LCA3NSwgNjAsIDYsIFpha28sIHRydWVdLFxyXG4gICAgWzAuMDQsIDEyOCwgLTEyOCwgMzUsIDYwLCA2LCBaYWtvLCB0cnVlXSxcclxuICAgIFswLjA0LCAxMjgsIC0xMjgsIDU1LCA2MCwgNiwgWmFrbywgdHJ1ZV0sXHJcbiAgICBbMC4wNCwgMTI4LCAtMTI4LCAxNSwgNjAsIDYsIFpha28sIHRydWVdLFxyXG4gICAgWzAuMDQsIDEyOCwgLTEyOCwgOTUsIDYwLCA2LCBaYWtvLCB0cnVlXSxcclxuXHJcbiAgICBbMC44LCAtMTI4LCAtMTI4LCAtNzUsIDYwLCAtNiwgWmFrbywgdHJ1ZV0sXHJcbiAgICBbMC4wNCwgLTEyOCwgLTEyOCwgLTM1LCA2MCwgLTYsIFpha28sIHRydWVdLFxyXG4gICAgWzAuMDQsIC0xMjgsIC0xMjgsIC01NSwgNjAsIC02LCBaYWtvLCB0cnVlXSxcclxuICAgIFswLjA0LCAtMTI4LCAtMTI4LCAtMTUsIDYwLCAtNiwgWmFrbywgdHJ1ZV0sXHJcbiAgICBbMC4wNCwgLTEyOCwgLTEyOCwgLTk1LCA2MCwgLTYsIFpha28sIHRydWVdLFxyXG5cclxuICAgIFswLjgsIDAsIDE3NiwgNzUsIDgwLCAxLCBaYWtvMSwgdHJ1ZV0sXHJcbiAgICBbMC4wMywgMCwgMTc2LCAzNSwgODAsIDEsIFpha28xLCB0cnVlXSxcclxuICAgIFswLjAzLCAwLCAxNzYsIDU1LCA4MCwgMSwgWmFrbzEsIHRydWVdLFxyXG4gICAgWzAuMDMsIDAsIDE3NiwgMTUsIDgwLCAxLCBaYWtvMSwgdHJ1ZV0sXHJcbiAgICBbMC4wMywgMCwgMTc2LCA5NSwgODAsIDEsIFpha28xLCB0cnVlXSxcclxuXHJcbiAgICBbMC44LCAwLCAxNzYsIC03NSwgODAsIDMsIFpha28xLCB0cnVlXSxcclxuICAgIFswLjAzLCAwLCAxNzYsIC0zNSwgODAsIDMsIFpha28xLCB0cnVlXSxcclxuICAgIFswLjAzLCAwLCAxNzYsIC01NSwgODAsIDMsIFpha28xLCB0cnVlXSxcclxuICAgIFswLjAzLCAwLCAxNzYsIC0xNSwgODAsIDMsIFpha28xLCB0cnVlXSxcclxuICAgIFswLjAzLCAwLCAxNzYsIC05NSwgODAsIDMsIFpha28xLCB0cnVlXSxcclxuXHJcbiAgICBbMC44LCAwLCAxNzYsIDg1LCAxMjAsIDEsIE1Cb3NzLCB0cnVlLCAxXSxcclxuICAgIFswLjAzLCAwLCAxNzYsIDk1LCAxMDAsIDEsIFpha28xLCB0cnVlLCAxXSxcclxuICAgIFswLjAzLCAwLCAxNzYsIDc1LCAxMDAsIDEsIFpha28xLCB0cnVlLCAxXSxcclxuICAgIFswLjAzLCAwLCAxNzYsIDQ1LCAxMjAsIDEsIE1Cb3NzLCB0cnVlLCAyXSxcclxuICAgIFswLjAzLCAwLCAxNzYsIDU1LCAxMDAsIDEsIFpha28xLCB0cnVlLCAyXSxcclxuICAgIFswLjAzLCAwLCAxNzYsIDM1LCAxMDAsIDEsIFpha28xLCB0cnVlLCAyXSxcclxuICAgIFswLjAzLCAwLCAxNzYsIDY1LCAxMjAsIDEsIE1Cb3NzLCB0cnVlXSxcclxuICAgIFswLjAzLCAwLCAxNzYsIDE1LCAxMDAsIDEsIFpha28xLCB0cnVlXSxcclxuICAgIFswLjAzLCAwLCAxNzYsIDI1LCAxMjAsIDEsIE1Cb3NzLCB0cnVlXSxcclxuXHJcbiAgICBbMC44LCAwLCAxNzYsIC04NSwgMTIwLCAzLCBNQm9zcywgdHJ1ZSwgM10sXHJcbiAgICBbMC4wMywgMCwgMTc2LCAtOTUsIDEwMCwgMywgWmFrbzEsIHRydWUsIDNdLFxyXG4gICAgWzAuMDMsIDAsIDE3NiwgLTc1LCAxMDAsIDMsIFpha28xLCB0cnVlLCAzXSxcclxuICAgIFswLjAzLCAwLCAxNzYsIC00NSwgMTIwLCAzLCBNQm9zcywgdHJ1ZSwgNF0sXHJcbiAgICBbMC4wMywgMCwgMTc2LCAtNTUsIDEwMCwgMywgWmFrbzEsIHRydWUsIDRdLFxyXG4gICAgWzAuMDMsIDAsIDE3NiwgLTM1LCAxMDAsIDMsIFpha28xLCB0cnVlLCA0XSxcclxuICAgIFswLjAzLCAwLCAxNzYsIC02NSwgMTIwLCAzLCBNQm9zcywgdHJ1ZV0sXHJcbiAgICBbMC4wMywgMCwgMTc2LCAtMTUsIDEwMCwgMywgWmFrbzEsIHRydWVdLFxyXG4gICAgWzAuMDMsIDAsIDE3NiwgLTI1LCAxMjAsIDMsIE1Cb3NzLCB0cnVlXVxyXG4gIF1cclxuXTtcclxuXHJcbkVuZW1pZXMucHJvdG90eXBlLnRvdGFsRW5lbWllc0NvdW50ID0gMDtcclxuRW5lbWllcy5wcm90b3R5cGUuaGl0RW5lbWllc0NvdW50ID0gMDtcclxuRW5lbWllcy5wcm90b3R5cGUuaG9tZUVuZW1pZXNDb3VudCA9IDA7XHJcbkVuZW1pZXMucHJvdG90eXBlLmhvbWVEZWx0YSA9IDA7XHJcbkVuZW1pZXMucHJvdG90eXBlLmhvbWVEZWx0YUNvdW50ID0gMDtcclxuRW5lbWllcy5wcm90b3R5cGUuaG9tZURlbHRhMiA9IDA7XHJcbkVuZW1pZXMucHJvdG90eXBlLmdyb3VwRGF0YSA9IFtdO1xyXG5FbmVtaWVzLnByb3RvdHlwZS5OT05FID0gMCB8IDA7XHJcbkVuZW1pZXMucHJvdG90eXBlLlNUQVJUID0gMSB8IDA7XHJcbkVuZW1pZXMucHJvdG90eXBlLkhPTUUgPSAyIHwgMDtcclxuRW5lbWllcy5wcm90b3R5cGUuQVRUQUNLID0gMyB8IDA7XHJcblxyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG4vL1xyXG4vLyBXZSBzdG9yZSBvdXIgRUUgb2JqZWN0cyBpbiBhIHBsYWluIG9iamVjdCB3aG9zZSBwcm9wZXJ0aWVzIGFyZSBldmVudCBuYW1lcy5cclxuLy8gSWYgYE9iamVjdC5jcmVhdGUobnVsbClgIGlzIG5vdCBzdXBwb3J0ZWQgd2UgcHJlZml4IHRoZSBldmVudCBuYW1lcyB3aXRoIGFcclxuLy8gYH5gIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSBidWlsdC1pbiBvYmplY3QgcHJvcGVydGllcyBhcmUgbm90IG92ZXJyaWRkZW4gb3JcclxuLy8gdXNlZCBhcyBhbiBhdHRhY2sgdmVjdG9yLlxyXG4vLyBXZSBhbHNvIGFzc3VtZSB0aGF0IGBPYmplY3QuY3JlYXRlKG51bGwpYCBpcyBhdmFpbGFibGUgd2hlbiB0aGUgZXZlbnQgbmFtZVxyXG4vLyBpcyBhbiBFUzYgU3ltYm9sLlxyXG4vL1xyXG52YXIgcHJlZml4ID0gdHlwZW9mIE9iamVjdC5jcmVhdGUgIT09ICdmdW5jdGlvbicgPyAnficgOiBmYWxzZTtcclxuXHJcbi8qKlxyXG4gKiBSZXByZXNlbnRhdGlvbiBvZiBhIHNpbmdsZSBFdmVudEVtaXR0ZXIgZnVuY3Rpb24uXHJcbiAqXHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEV2ZW50IGhhbmRsZXIgdG8gYmUgY2FsbGVkLlxyXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IENvbnRleHQgZm9yIGZ1bmN0aW9uIGV4ZWN1dGlvbi5cclxuICogQHBhcmFtIHtCb29sZWFufSBvbmNlIE9ubHkgZW1pdCBvbmNlXHJcbiAqIEBhcGkgcHJpdmF0ZVxyXG4gKi9cclxuZnVuY3Rpb24gRUUoZm4sIGNvbnRleHQsIG9uY2UpIHtcclxuICB0aGlzLmZuID0gZm47XHJcbiAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcclxuICB0aGlzLm9uY2UgPSBvbmNlIHx8IGZhbHNlO1xyXG59XHJcblxyXG4vKipcclxuICogTWluaW1hbCBFdmVudEVtaXR0ZXIgaW50ZXJmYWNlIHRoYXQgaXMgbW9sZGVkIGFnYWluc3QgdGhlIE5vZGUuanNcclxuICogRXZlbnRFbWl0dGVyIGludGVyZmFjZS5cclxuICpcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7IC8qIE5vdGhpbmcgdG8gc2V0ICovIH1cclxuXHJcbi8qKlxyXG4gKiBIb2xkcyB0aGUgYXNzaWduZWQgRXZlbnRFbWl0dGVycyBieSBuYW1lLlxyXG4gKlxyXG4gKiBAdHlwZSB7T2JqZWN0fVxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xyXG5cclxuLyoqXHJcbiAqIFJldHVybiBhIGxpc3Qgb2YgYXNzaWduZWQgZXZlbnQgbGlzdGVuZXJzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50cyB0aGF0IHNob3VsZCBiZSBsaXN0ZWQuXHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gZXhpc3RzIFdlIG9ubHkgbmVlZCB0byBrbm93IGlmIHRoZXJlIGFyZSBsaXN0ZW5lcnMuXHJcbiAqIEByZXR1cm5zIHtBcnJheXxCb29sZWFufVxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbiBsaXN0ZW5lcnMoZXZlbnQsIGV4aXN0cykge1xyXG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50XHJcbiAgICAsIGF2YWlsYWJsZSA9IHRoaXMuX2V2ZW50cyAmJiB0aGlzLl9ldmVudHNbZXZ0XTtcclxuXHJcbiAgaWYgKGV4aXN0cykgcmV0dXJuICEhYXZhaWxhYmxlO1xyXG4gIGlmICghYXZhaWxhYmxlKSByZXR1cm4gW107XHJcbiAgaWYgKGF2YWlsYWJsZS5mbikgcmV0dXJuIFthdmFpbGFibGUuZm5dO1xyXG5cclxuICBmb3IgKHZhciBpID0gMCwgbCA9IGF2YWlsYWJsZS5sZW5ndGgsIGVlID0gbmV3IEFycmF5KGwpOyBpIDwgbDsgaSsrKSB7XHJcbiAgICBlZVtpXSA9IGF2YWlsYWJsZVtpXS5mbjtcclxuICB9XHJcblxyXG4gIHJldHVybiBlZTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBFbWl0IGFuIGV2ZW50IHRvIGFsbCByZWdpc3RlcmVkIGV2ZW50IGxpc3RlbmVycy5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBuYW1lIG9mIHRoZSBldmVudC5cclxuICogQHJldHVybnMge0Jvb2xlYW59IEluZGljYXRpb24gaWYgd2UndmUgZW1pdHRlZCBhbiBldmVudC5cclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIGVtaXQoZXZlbnQsIGExLCBhMiwgYTMsIGE0LCBhNSkge1xyXG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xyXG5cclxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW2V2dF0pIHJldHVybiBmYWxzZTtcclxuXHJcbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldnRdXHJcbiAgICAsIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGhcclxuICAgICwgYXJnc1xyXG4gICAgLCBpO1xyXG5cclxuICBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGxpc3RlbmVycy5mbikge1xyXG4gICAgaWYgKGxpc3RlbmVycy5vbmNlKSB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcnMuZm4sIHVuZGVmaW5lZCwgdHJ1ZSk7XHJcblxyXG4gICAgc3dpdGNoIChsZW4pIHtcclxuICAgICAgY2FzZSAxOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQpLCB0cnVlO1xyXG4gICAgICBjYXNlIDI6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEpLCB0cnVlO1xyXG4gICAgICBjYXNlIDM6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyKSwgdHJ1ZTtcclxuICAgICAgY2FzZSA0OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMpLCB0cnVlO1xyXG4gICAgICBjYXNlIDU6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMywgYTQpLCB0cnVlO1xyXG4gICAgICBjYXNlIDY6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMywgYTQsIGE1KSwgdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKGkgPSAxLCBhcmdzID0gbmV3IEFycmF5KGxlbiAtMSk7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcclxuICAgIH1cclxuXHJcbiAgICBsaXN0ZW5lcnMuZm4uYXBwbHkobGlzdGVuZXJzLmNvbnRleHQsIGFyZ3MpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICB2YXIgbGVuZ3RoID0gbGlzdGVuZXJzLmxlbmd0aFxyXG4gICAgICAsIGo7XHJcblxyXG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGlmIChsaXN0ZW5lcnNbaV0ub25jZSkgdGhpcy5yZW1vdmVMaXN0ZW5lcihldmVudCwgbGlzdGVuZXJzW2ldLmZuLCB1bmRlZmluZWQsIHRydWUpO1xyXG5cclxuICAgICAgc3dpdGNoIChsZW4pIHtcclxuICAgICAgICBjYXNlIDE6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0KTsgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAyOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgYTEpOyBicmVhaztcclxuICAgICAgICBjYXNlIDM6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhMSwgYTIpOyBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgaWYgKCFhcmdzKSBmb3IgKGogPSAxLCBhcmdzID0gbmV3IEFycmF5KGxlbiAtMSk7IGogPCBsZW47IGorKykge1xyXG4gICAgICAgICAgICBhcmdzW2ogLSAxXSA9IGFyZ3VtZW50c1tqXTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBsaXN0ZW5lcnNbaV0uZm4uYXBwbHkobGlzdGVuZXJzW2ldLmNvbnRleHQsIGFyZ3MpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdHJ1ZTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZWdpc3RlciBhIG5ldyBFdmVudExpc3RlbmVyIGZvciB0aGUgZ2l2ZW4gZXZlbnQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBOYW1lIG9mIHRoZSBldmVudC5cclxuICogQHBhcmFtIHtGdW5jdG9ufSBmbiBDYWxsYmFjayBmdW5jdGlvbi5cclxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBUaGUgY29udGV4dCBvZiB0aGUgZnVuY3Rpb24uXHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gb24oZXZlbnQsIGZuLCBjb250ZXh0KSB7XHJcbiAgdmFyIGxpc3RlbmVyID0gbmV3IEVFKGZuLCBjb250ZXh0IHx8IHRoaXMpXHJcbiAgICAsIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XHJcblxyXG4gIGlmICghdGhpcy5fZXZlbnRzKSB0aGlzLl9ldmVudHMgPSBwcmVmaXggPyB7fSA6IE9iamVjdC5jcmVhdGUobnVsbCk7XHJcbiAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XSkgdGhpcy5fZXZlbnRzW2V2dF0gPSBsaXN0ZW5lcjtcclxuICBlbHNlIHtcclxuICAgIGlmICghdGhpcy5fZXZlbnRzW2V2dF0uZm4pIHRoaXMuX2V2ZW50c1tldnRdLnB1c2gobGlzdGVuZXIpO1xyXG4gICAgZWxzZSB0aGlzLl9ldmVudHNbZXZ0XSA9IFtcclxuICAgICAgdGhpcy5fZXZlbnRzW2V2dF0sIGxpc3RlbmVyXHJcbiAgICBdO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogQWRkIGFuIEV2ZW50TGlzdGVuZXIgdGhhdCdzIG9ubHkgY2FsbGVkIG9uY2UuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBOYW1lIG9mIHRoZSBldmVudC5cclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gQ2FsbGJhY2sgZnVuY3Rpb24uXHJcbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgVGhlIGNvbnRleHQgb2YgdGhlIGZ1bmN0aW9uLlxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24gb25jZShldmVudCwgZm4sIGNvbnRleHQpIHtcclxuICB2YXIgbGlzdGVuZXIgPSBuZXcgRUUoZm4sIGNvbnRleHQgfHwgdGhpcywgdHJ1ZSlcclxuICAgICwgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcclxuXHJcbiAgaWYgKCF0aGlzLl9ldmVudHMpIHRoaXMuX2V2ZW50cyA9IHByZWZpeCA/IHt9IDogT2JqZWN0LmNyZWF0ZShudWxsKTtcclxuICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdKSB0aGlzLl9ldmVudHNbZXZ0XSA9IGxpc3RlbmVyO1xyXG4gIGVsc2Uge1xyXG4gICAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XS5mbikgdGhpcy5fZXZlbnRzW2V2dF0ucHVzaChsaXN0ZW5lcik7XHJcbiAgICBlbHNlIHRoaXMuX2V2ZW50c1tldnRdID0gW1xyXG4gICAgICB0aGlzLl9ldmVudHNbZXZ0XSwgbGlzdGVuZXJcclxuICAgIF07XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZW1vdmUgZXZlbnQgbGlzdGVuZXJzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IHdlIHdhbnQgdG8gcmVtb3ZlLlxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgbGlzdGVuZXIgdGhhdCB3ZSBuZWVkIHRvIGZpbmQuXHJcbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgT25seSByZW1vdmUgbGlzdGVuZXJzIG1hdGNoaW5nIHRoaXMgY29udGV4dC5cclxuICogQHBhcmFtIHtCb29sZWFufSBvbmNlIE9ubHkgcmVtb3ZlIG9uY2UgbGlzdGVuZXJzLlxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuXHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcihldmVudCwgZm4sIGNvbnRleHQsIG9uY2UpIHtcclxuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcclxuXHJcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1tldnRdKSByZXR1cm4gdGhpcztcclxuXHJcbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldnRdXHJcbiAgICAsIGV2ZW50cyA9IFtdO1xyXG5cclxuICBpZiAoZm4pIHtcclxuICAgIGlmIChsaXN0ZW5lcnMuZm4pIHtcclxuICAgICAgaWYgKFxyXG4gICAgICAgICAgIGxpc3RlbmVycy5mbiAhPT0gZm5cclxuICAgICAgICB8fCAob25jZSAmJiAhbGlzdGVuZXJzLm9uY2UpXHJcbiAgICAgICAgfHwgKGNvbnRleHQgJiYgbGlzdGVuZXJzLmNvbnRleHQgIT09IGNvbnRleHQpXHJcbiAgICAgICkge1xyXG4gICAgICAgIGV2ZW50cy5wdXNoKGxpc3RlbmVycyk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBsaXN0ZW5lcnMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICBsaXN0ZW5lcnNbaV0uZm4gIT09IGZuXHJcbiAgICAgICAgICB8fCAob25jZSAmJiAhbGlzdGVuZXJzW2ldLm9uY2UpXHJcbiAgICAgICAgICB8fCAoY29udGV4dCAmJiBsaXN0ZW5lcnNbaV0uY29udGV4dCAhPT0gY29udGV4dClcclxuICAgICAgICApIHtcclxuICAgICAgICAgIGV2ZW50cy5wdXNoKGxpc3RlbmVyc1tpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvL1xyXG4gIC8vIFJlc2V0IHRoZSBhcnJheSwgb3IgcmVtb3ZlIGl0IGNvbXBsZXRlbHkgaWYgd2UgaGF2ZSBubyBtb3JlIGxpc3RlbmVycy5cclxuICAvL1xyXG4gIGlmIChldmVudHMubGVuZ3RoKSB7XHJcbiAgICB0aGlzLl9ldmVudHNbZXZ0XSA9IGV2ZW50cy5sZW5ndGggPT09IDEgPyBldmVudHNbMF0gOiBldmVudHM7XHJcbiAgfSBlbHNlIHtcclxuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbZXZ0XTtcclxuICB9XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlbW92ZSBhbGwgbGlzdGVuZXJzIG9yIG9ubHkgdGhlIGxpc3RlbmVycyBmb3IgdGhlIHNwZWNpZmllZCBldmVudC5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCB3YW50IHRvIHJlbW92ZSBhbGwgbGlzdGVuZXJzIGZvci5cclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24gcmVtb3ZlQWxsTGlzdGVuZXJzKGV2ZW50KSB7XHJcbiAgaWYgKCF0aGlzLl9ldmVudHMpIHJldHVybiB0aGlzO1xyXG5cclxuICBpZiAoZXZlbnQpIGRlbGV0ZSB0aGlzLl9ldmVudHNbcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudF07XHJcbiAgZWxzZSB0aGlzLl9ldmVudHMgPSBwcmVmaXggPyB7fSA6IE9iamVjdC5jcmVhdGUobnVsbCk7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLy9cclxuLy8gQWxpYXMgbWV0aG9kcyBuYW1lcyBiZWNhdXNlIHBlb3BsZSByb2xsIGxpa2UgdGhhdC5cclxuLy9cclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vZmYgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyO1xyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbjtcclxuXHJcbi8vXHJcbi8vIFRoaXMgZnVuY3Rpb24gZG9lc24ndCBhcHBseSBhbnltb3JlLlxyXG4vL1xyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uIHNldE1heExpc3RlbmVycygpIHtcclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8vXHJcbi8vIEV4cG9zZSB0aGUgcHJlZml4LlxyXG4vL1xyXG5FdmVudEVtaXR0ZXIucHJlZml4ZWQgPSBwcmVmaXg7XHJcblxyXG4vL1xyXG4vLyBFeHBvc2UgdGhlIG1vZHVsZS5cclxuLy9cclxuaWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgbW9kdWxlKSB7XHJcbiAgbW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XHJcbn1cclxuXHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG4vL3ZhciBTVEFHRV9NQVggPSAxO1xyXG5pbXBvcnQgKiBhcyBzZmcgZnJvbSAnLi9nbG9iYWwnO1xyXG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbCc7XHJcbmltcG9ydCAqIGFzIGF1ZGlvIGZyb20gJy4vYXVkaW8nO1xyXG4vL2ltcG9ydCAqIGFzIHNvbmcgZnJvbSAnLi9zb25nJztcclxuaW1wb3J0ICogYXMgZ3JhcGhpY3MgZnJvbSAnLi9ncmFwaGljcyc7XHJcbmltcG9ydCAqIGFzIGlvIGZyb20gJy4vaW8nO1xyXG5pbXBvcnQgKiBhcyBjb21tIGZyb20gJy4vY29tbSc7XHJcbmltcG9ydCAqIGFzIHRleHQgZnJvbSAnLi90ZXh0JztcclxuaW1wb3J0ICogYXMgZ2FtZW9iaiBmcm9tICcuL2dhbWVvYmonO1xyXG5pbXBvcnQgKiBhcyBteXNoaXAgZnJvbSAnLi9teXNoaXAnO1xyXG5pbXBvcnQgKiBhcyBlbmVtaWVzIGZyb20gJy4vZW5lbWllcyc7XHJcbmltcG9ydCAqIGFzIGVmZmVjdG9iaiBmcm9tICcuL2VmZmVjdG9iaic7XHJcbmltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSAnLi9ldmVudEVtaXR0ZXIzJztcclxuXHJcblxyXG5jbGFzcyBTY29yZUVudHJ5IHtcclxuICBjb25zdHJ1Y3RvcihuYW1lLCBzY29yZSkge1xyXG4gICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgIHRoaXMuc2NvcmUgPSBzY29yZTtcclxuICB9XHJcbn1cclxuXHJcblxyXG5jbGFzcyBTdGFnZSBleHRlbmRzIEV2ZW50RW1pdHRlciB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcigpO1xyXG4gICAgdGhpcy5NQVggPSAxO1xyXG4gICAgdGhpcy5ESUZGSUNVTFRZX01BWCA9IDIuMDtcclxuICAgIHRoaXMubm8gPSAxO1xyXG4gICAgdGhpcy5wcml2YXRlTm8gPSAwO1xyXG4gICAgdGhpcy5kaWZmaWN1bHR5ID0gMTtcclxuICB9XHJcblxyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5ubyA9IDE7XHJcbiAgICB0aGlzLnByaXZhdGVObyA9IDA7XHJcbiAgICB0aGlzLmRpZmZpY3VsdHkgPSAxO1xyXG4gIH1cclxuXHJcbiAgYWR2YW5jZSgpIHtcclxuICAgIHRoaXMubm8rKztcclxuICAgIHRoaXMucHJpdmF0ZU5vKys7XHJcbiAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAganVtcChzdGFnZU5vKSB7XHJcbiAgICB0aGlzLm5vID0gc3RhZ2VObztcclxuICAgIHRoaXMucHJpdmF0ZU5vID0gdGhpcy5ubyAtIDE7XHJcbiAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlKCkge1xyXG4gICAgaWYgKHRoaXMuZGlmZmljdWx0eSA8IHRoaXMuRElGRklDVUxUWV9NQVgpIHtcclxuICAgICAgdGhpcy5kaWZmaWN1bHR5ID0gMSArIDAuMDUgKiAodGhpcy5ubyAtIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLnByaXZhdGVObyA+PSB0aGlzLk1BWCkge1xyXG4gICAgICB0aGlzLnByaXZhdGVObyA9IDA7XHJcbiAgLy8gICAgdGhpcy5ubyA9IDE7XHJcbiAgICB9XHJcbiAgICB0aGlzLmVtaXQoJ3VwZGF0ZScsdGhpcyk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgR2FtZSB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLkNPTlNPTEVfV0lEVEggPSAwO1xyXG4gICAgdGhpcy5DT05TT0xFX0hFSUdIVCA9IDA7XHJcbiAgICB0aGlzLlJFTkRFUkVSX1BSSU9SSVRZID0gMTAwMDAwIHwgMDtcclxuICAgIHRoaXMucmVuZGVyZXIgPSBudWxsO1xyXG4gICAgdGhpcy5zdGF0cyA9IG51bGw7XHJcbiAgICB0aGlzLnNjZW5lID0gbnVsbDtcclxuICAgIHRoaXMuY2FtZXJhID0gbnVsbDtcclxuICAgIHRoaXMuYXV0aG9yID0gbnVsbDtcclxuICAgIHRoaXMucHJvZ3Jlc3MgPSBudWxsO1xyXG4gICAgdGhpcy50ZXh0UGxhbmUgPSBudWxsO1xyXG4gICAgdGhpcy5iYXNpY0lucHV0ID0gbmV3IGlvLkJhc2ljSW5wdXQoKTtcclxuICAgIHRoaXMudGFza3MgPSBuZXcgdXRpbC5UYXNrcygpO1xyXG4gICAgc2ZnLnRhc2tzID0gdGhpcy50YXNrcztcclxuICAgIHRoaXMud2F2ZUdyYXBoID0gbnVsbDtcclxuICAgIHRoaXMuc3RhcnQgPSBmYWxzZTtcclxuICAgIHRoaXMuYmFzZVRpbWUgPSBuZXcgRGF0ZTtcclxuICAgIHRoaXMuZCA9IC0wLjI7XHJcbiAgICB0aGlzLmF1ZGlvXyA9IG51bGw7XHJcbiAgICB0aGlzLnNlcXVlbmNlciA9IG51bGw7XHJcbiAgICB0aGlzLnBpYW5vID0gbnVsbDtcclxuICAgIHRoaXMuc2NvcmUgPSAwO1xyXG4gICAgdGhpcy5oaWdoU2NvcmUgPSAwO1xyXG4gICAgdGhpcy5oaWdoU2NvcmVzID0gW107XHJcbiAgICB0aGlzLmlzSGlkZGVuID0gZmFsc2U7XHJcbiAgICB0aGlzLm15c2hpcF8gPSBudWxsO1xyXG4gICAgdGhpcy5lbmVtaWVzID0gbnVsbDtcclxuICAgIHRoaXMuZW5lbXlCdWxsZXRzID0gbnVsbDtcclxuICAgIHRoaXMuUEkgPSBNYXRoLlBJO1xyXG4gICAgdGhpcy5jb21tXyA9IG51bGw7XHJcbiAgICB0aGlzLmhhbmRsZU5hbWUgPSAnJztcclxuICAgIHRoaXMuc3RvcmFnZSA9IG51bGw7XHJcbiAgICB0aGlzLnJhbmsgPSAtMTtcclxuICAgIHRoaXMuc291bmRFZmZlY3RzID0gbnVsbDtcclxuICAgIHRoaXMuZW5zID0gbnVsbDtcclxuICAgIHRoaXMuZW5icyA9IG51bGw7XHJcbiAgICB0aGlzLnN0YWdlID0gc2ZnLnN0YWdlID0gbmV3IFN0YWdlKCk7XHJcbiAgICB0aGlzLnRpdGxlID0gbnVsbDsvLyDjgr/jgqTjg4jjg6vjg6Hjg4Pjgrfjg6VcclxuICAgIHRoaXMuc3BhY2VGaWVsZCA9IG51bGw7Ly8g5a6H5a6Z56m66ZaT44OR44O844OG44Kj44Kv44OrXHJcbiAgICB0aGlzLmVkaXRIYW5kbGVOYW1lID0gbnVsbDtcclxuICAgIHNmZy5hZGRTY29yZSA9IHRoaXMuYWRkU2NvcmUuYmluZCh0aGlzKTtcclxuICAgIHRoaXMuY2hlY2tWaXNpYmlsaXR5QVBJKCk7XHJcbiAgICB0aGlzLmF1ZGlvXyA9IG5ldyBhdWRpby5BdWRpbygpO1xyXG4gIH1cclxuXHJcbiAgZXhlYygpIHtcclxuICAgIFxyXG4gICAgaWYgKCF0aGlzLmNoZWNrQnJvd3NlclN1cHBvcnQoJyNjb250ZW50Jykpe1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5zZXF1ZW5jZXIgPSBuZXcgYXVkaW8uU2VxdWVuY2VyKHRoaXMuYXVkaW9fKTtcclxuICAgIC8vcGlhbm8gPSBuZXcgYXVkaW8uUGlhbm8oYXVkaW9fKTtcclxuICAgIHRoaXMuc291bmRFZmZlY3RzID0gbmV3IGF1ZGlvLlNvdW5kRWZmZWN0cyh0aGlzLnNlcXVlbmNlcik7XHJcblxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcih3aW5kb3cudmlzaWJpbGl0eUNoYW5nZSwgdGhpcy5vblZpc2liaWxpdHlDaGFuZ2UuYmluZCh0aGlzKSwgZmFsc2UpO1xyXG4gICAgc2ZnLmdhbWVUaW1lciA9IG5ldyB1dGlsLkdhbWVUaW1lcih0aGlzLmdldEN1cnJlbnRUaW1lLmJpbmQodGhpcykpO1xyXG5cclxuICAgIC8vLyDjgrLjg7zjg6DjgrPjg7Pjgr3jg7zjg6vjga7liJ3mnJ/ljJZcclxuICAgIHRoaXMuaW5pdENvbnNvbGUoKTtcclxuICAgIHRoaXMubG9hZFJlc291cmNlcygpXHJcbiAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICB0aGlzLnNjZW5lLnJlbW92ZSh0aGlzLnByb2dyZXNzLm1lc2gpO1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIucmVuZGVyKHRoaXMuc2NlbmUsIHRoaXMuY2FtZXJhKTtcclxuICAgICAgICB0aGlzLnRhc2tzLmNsZWFyKCk7XHJcbiAgICAgICAgdGhpcy50YXNrcy5wdXNoVGFzayh0aGlzLmJhc2ljSW5wdXQudXBkYXRlLmJpbmQodGhpcy5iYXNpY0lucHV0KSk7XHJcbiAgICAgICAgdGhpcy50YXNrcy5wdXNoVGFzayh0aGlzLmluaXQuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zdGFydCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5tYWluKCk7XHJcbiAgICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgY2hlY2tWaXNpYmlsaXR5QVBJKCkge1xyXG4gICAgLy8gaGlkZGVuIOODl+ODreODkeODhuOCo+OBiuOCiOOBs+WPr+imluaAp+OBruWkieabtOOCpOODmeODs+ODiOOBruWQjeWJjeOCkuioreWumlxyXG4gICAgaWYgKHR5cGVvZiBkb2N1bWVudC5oaWRkZW4gIT09IFwidW5kZWZpbmVkXCIpIHsgLy8gT3BlcmEgMTIuMTAg44KEIEZpcmVmb3ggMTgg5Lul6ZmN44Gn44K144Od44O844OIIFxyXG4gICAgICB0aGlzLmhpZGRlbiA9IFwiaGlkZGVuXCI7XHJcbiAgICAgIHdpbmRvdy52aXNpYmlsaXR5Q2hhbmdlID0gXCJ2aXNpYmlsaXR5Y2hhbmdlXCI7XHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkb2N1bWVudC5tb3pIaWRkZW4gIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgdGhpcy5oaWRkZW4gPSBcIm1vekhpZGRlblwiO1xyXG4gICAgICB3aW5kb3cudmlzaWJpbGl0eUNoYW5nZSA9IFwibW96dmlzaWJpbGl0eWNoYW5nZVwiO1xyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZG9jdW1lbnQubXNIaWRkZW4gIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgdGhpcy5oaWRkZW4gPSBcIm1zSGlkZGVuXCI7XHJcbiAgICAgIHdpbmRvdy52aXNpYmlsaXR5Q2hhbmdlID0gXCJtc3Zpc2liaWxpdHljaGFuZ2VcIjtcclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRvY3VtZW50LndlYmtpdEhpZGRlbiAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICB0aGlzLmhpZGRlbiA9IFwid2Via2l0SGlkZGVuXCI7XHJcbiAgICAgIHdpbmRvdy52aXNpYmlsaXR5Q2hhbmdlID0gXCJ3ZWJraXR2aXNpYmlsaXR5Y2hhbmdlXCI7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIGNhbGNTY3JlZW5TaXplKCkge1xyXG4gICAgdmFyIHdpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XHJcbiAgICB2YXIgaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xyXG4gICAgaWYgKHdpZHRoID49IGhlaWdodCkge1xyXG4gICAgICB3aWR0aCA9IGhlaWdodCAqIHNmZy5WSVJUVUFMX1dJRFRIIC8gc2ZnLlZJUlRVQUxfSEVJR0hUO1xyXG4gICAgICB3aGlsZSAod2lkdGggPiB3aW5kb3cuaW5uZXJXaWR0aCkge1xyXG4gICAgICAgIC0taGVpZ2h0O1xyXG4gICAgICAgIHdpZHRoID0gaGVpZ2h0ICogc2ZnLlZJUlRVQUxfV0lEVEggLyBzZmcuVklSVFVBTF9IRUlHSFQ7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGhlaWdodCA9IHdpZHRoICogc2ZnLlZJUlRVQUxfSEVJR0hUIC8gc2ZnLlZJUlRVQUxfV0lEVEg7XHJcbiAgICAgIHdoaWxlIChoZWlnaHQgPiB3aW5kb3cuaW5uZXJIZWlnaHQpIHtcclxuICAgICAgICAtLXdpZHRoO1xyXG4gICAgICAgIGhlaWdodCA9IHdpZHRoICogc2ZnLlZJUlRVQUxfSEVJR0hUIC8gc2ZnLlZJUlRVQUxfV0lEVEg7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMuQ09OU09MRV9XSURUSCA9IHdpZHRoO1xyXG4gICAgdGhpcy5DT05TT0xFX0hFSUdIVCA9IGhlaWdodDtcclxuICB9XHJcbiAgXHJcbiAgLy8vIOOCs+ODs+OCveODvOODq+eUu+mdouOBruWIneacn+WMllxyXG4gIGluaXRDb25zb2xlKGNvbnNvbGVDbGFzcykge1xyXG4gICAgLy8g44Os44Oz44OA44Op44O844Gu5L2c5oiQXHJcbiAgICB0aGlzLnJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoeyBhbnRpYWxpYXM6IGZhbHNlLCBzb3J0T2JqZWN0czogdHJ1ZSB9KTtcclxuICAgIHZhciByZW5kZXJlciA9IHRoaXMucmVuZGVyZXI7XHJcbiAgICB0aGlzLmNhbGNTY3JlZW5TaXplKCk7XHJcbiAgICByZW5kZXJlci5zZXRTaXplKHRoaXMuQ09OU09MRV9XSURUSCwgdGhpcy5DT05TT0xFX0hFSUdIVCk7XHJcbiAgICByZW5kZXJlci5zZXRDbGVhckNvbG9yKDAsIDEpO1xyXG4gICAgcmVuZGVyZXIuZG9tRWxlbWVudC5pZCA9ICdjb25zb2xlJztcclxuICAgIHJlbmRlcmVyLmRvbUVsZW1lbnQuY2xhc3NOYW1lID0gY29uc29sZUNsYXNzIHx8ICdjb25zb2xlJztcclxuICAgIHJlbmRlcmVyLmRvbUVsZW1lbnQuc3R5bGUuekluZGV4ID0gMDtcclxuXHJcblxyXG4gICAgZDMuc2VsZWN0KCcjY29udGVudCcpLm5vZGUoKS5hcHBlbmRDaGlsZChyZW5kZXJlci5kb21FbGVtZW50KTtcclxuXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xyXG4gICAgICB0aGlzLmNhbGNTY3JlZW5TaXplKCk7XHJcbiAgICAgIHJlbmRlcmVyLnNldFNpemUodGhpcy5DT05TT0xFX1dJRFRILCB0aGlzLkNPTlNPTEVfSEVJR0hUKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIOOCt+ODvOODs+OBruS9nOaIkFxyXG4gICAgdGhpcy5zY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xyXG5cclxuICAgIC8vIOOCq+ODoeODqeOBruS9nOaIkFxyXG4gICAgdGhpcy5jYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoOTAuMCwgc2ZnLlZJUlRVQUxfV0lEVEggLyBzZmcuVklSVFVBTF9IRUlHSFQpO1xyXG4gICAgdGhpcy5jYW1lcmEucG9zaXRpb24ueiA9IHNmZy5WSVJUVUFMX0hFSUdIVCAvIDI7XHJcbiAgICB0aGlzLmNhbWVyYS5sb29rQXQobmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMCkpO1xyXG5cclxuICAgIC8vIOODqeOCpOODiOOBruS9nOaIkFxyXG4gICAgLy92YXIgbGlnaHQgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCgweGZmZmZmZik7XHJcbiAgICAvL2xpZ2h0LnBvc2l0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjMoMC41NzcsIDAuNTc3LCAwLjU3Nyk7XHJcbiAgICAvL3NjZW5lLmFkZChsaWdodCk7XHJcblxyXG4gICAgLy92YXIgYW1iaWVudCA9IG5ldyBUSFJFRS5BbWJpZW50TGlnaHQoMHhmZmZmZmYpO1xyXG4gICAgLy9zY2VuZS5hZGQoYW1iaWVudCk7XHJcbiAgICByZW5kZXJlci5jbGVhcigpO1xyXG4gIH1cclxuXHJcbiAgLy8vIOOCqOODqeODvOOBp+e1guS6huOBmeOCi+OAglxyXG4gIEV4aXRFcnJvcihlKSB7XHJcbiAgICAvL2N0eC5maWxsU3R5bGUgPSBcInJlZFwiO1xyXG4gICAgLy9jdHguZmlsbFJlY3QoMCwgMCwgQ09OU09MRV9XSURUSCwgQ09OU09MRV9IRUlHSFQpO1xyXG4gICAgLy9jdHguZmlsbFN0eWxlID0gXCJ3aGl0ZVwiO1xyXG4gICAgLy9jdHguZmlsbFRleHQoXCJFcnJvciA6IFwiICsgZSwgMCwgMjApO1xyXG4gICAgLy8vL2FsZXJ0KGUpO1xyXG4gICAgdGhpcy5zdGFydCA9IGZhbHNlO1xyXG4gICAgdGhyb3cgZTtcclxuICB9XHJcblxyXG4gIG9uVmlzaWJpbGl0eUNoYW5nZSgpIHtcclxuICAgIHZhciBoID0gZG9jdW1lbnRbdGhpcy5oaWRkZW5dO1xyXG4gICAgdGhpcy5pc0hpZGRlbiA9IGg7XHJcbiAgICBpZiAoaCkge1xyXG4gICAgICB0aGlzLnBhdXNlKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnJlc3VtZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcGF1c2UoKSB7XHJcbiAgICBpZiAoc2ZnLmdhbWVUaW1lci5zdGF0dXMgPT0gc2ZnLmdhbWVUaW1lci5TVEFSVCkge1xyXG4gICAgICBzZmcuZ2FtZVRpbWVyLnBhdXNlKCk7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5zZXF1ZW5jZXIuc3RhdHVzID09IHRoaXMuc2VxdWVuY2VyLlBMQVkpIHtcclxuICAgICAgdGhpcy5zZXF1ZW5jZXIucGF1c2UoKTtcclxuICAgIH1cclxuICAgIHNmZy5wYXVzZSA9IHRydWU7XHJcbiAgfVxyXG5cclxuICByZXN1bWUoKSB7XHJcbiAgICBpZiAoc2ZnLmdhbWVUaW1lci5zdGF0dXMgPT0gc2ZnLmdhbWVUaW1lci5QQVVTRSkge1xyXG4gICAgICBzZmcuZ2FtZVRpbWVyLnJlc3VtZSgpO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuc2VxdWVuY2VyLnN0YXR1cyA9PSB0aGlzLnNlcXVlbmNlci5QQVVTRSkge1xyXG4gICAgICB0aGlzLnNlcXVlbmNlci5yZXN1bWUoKTtcclxuICAgIH1cclxuICAgIHNmZy5wYXVzZSA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLy8vIOePvuWcqOaZgumWk+OBruWPluW+l1xyXG4gIGdldEN1cnJlbnRUaW1lKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuYXVkaW9fLmF1ZGlvY3R4LmN1cnJlbnRUaW1lO1xyXG4gIH1cclxuXHJcbiAgLy8vIOODluODqeOCpuOCtuOBruapn+iDveODgeOCp+ODg+OCr1xyXG4gIGNoZWNrQnJvd3NlclN1cHBvcnQoKSB7XHJcbiAgICB2YXIgY29udGVudCA9ICc8aW1nIGNsYXNzPVwiZXJyb3JpbWdcIiBzcmM9XCJodHRwOi8vcHVibGljLmJsdS5saXZlZmlsZXN0b3JlLmNvbS95MnBiWTNhcUJ6Nnd6NGFoODdSWEVWazVDbGhEMkx1akM1TnM2NkhLdlI4OWFqckZkTE0wVHhGZXJZWVVSdDgzY19iZzM1SFNrcWMzRThHeGFGRDgtWDk0TUxzRlY1R1U2QllwMTk1SXZlZ2V2US8yMDEzMTAwMS5wbmc/cHNpZD0xXCIgd2lkdGg9XCI0NzlcIiBoZWlnaHQ9XCI2NDBcIiBjbGFzcz1cImFsaWdubm9uZVwiIC8+JztcclxuICAgIC8vIFdlYkdM44Gu44K144Od44O844OI44OB44Kn44OD44KvXHJcbiAgICBpZiAoIURldGVjdG9yLndlYmdsKSB7XHJcbiAgICAgIGQzLnNlbGVjdCgnI2NvbnRlbnQnKS5hcHBlbmQoJ2RpdicpLmNsYXNzZWQoJ2Vycm9yJywgdHJ1ZSkuaHRtbChcclxuICAgICAgICBjb250ZW50ICsgJzxwIGNsYXNzPVwiZXJyb3J0ZXh0XCI+44OW44Op44Km44K244GMPGJyLz5XZWJHTOOCkuOCteODneODvOODiOOBl+OBpuOBhOOBquOBhOOBn+OCgTxici8+5YuV5L2c44GE44Gf44GX44G+44Gb44KT44CCPC9wPicpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gV2ViIEF1ZGlvIEFQSeODqeODg+ODkeODvFxyXG4gICAgaWYgKCF0aGlzLmF1ZGlvXy5lbmFibGUpIHtcclxuICAgICAgZDMuc2VsZWN0KCcjY29udGVudCcpLmFwcGVuZCgnZGl2JykuY2xhc3NlZCgnZXJyb3InLCB0cnVlKS5odG1sKFxyXG4gICAgICAgIGNvbnRlbnQgKyAnPHAgY2xhc3M9XCJlcnJvcnRleHRcIj7jg5bjg6njgqbjgrbjgYw8YnIvPldlYiBBdWRpbyBBUEnjgpLjgrXjg53jg7zjg4jjgZfjgabjgYTjgarjgYTjgZ/jgoE8YnIvPuWLleS9nOOBhOOBn+OBl+OBvuOBm+OCk+OAgjwvcD4nKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIOODluODqeOCpuOCtuOBjFBhZ2UgVmlzaWJpbGl0eSBBUEkg44KS44K144Od44O844OI44GX44Gq44GE5aC05ZCI44Gr6K2m5ZGKIFxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLmhpZGRlbiA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgZDMuc2VsZWN0KCcjY29udGVudCcpLmFwcGVuZCgnZGl2JykuY2xhc3NlZCgnZXJyb3InLCB0cnVlKS5odG1sKFxyXG4gICAgICAgIGNvbnRlbnQgKyAnPHAgY2xhc3M9XCJlcnJvcnRleHRcIj7jg5bjg6njgqbjgrbjgYw8YnIvPlBhZ2UgVmlzaWJpbGl0eSBBUEnjgpLjgrXjg53jg7zjg4jjgZfjgabjgYTjgarjgYTjgZ/jgoE8YnIvPuWLleS9nOOBhOOBn+OBl+OBvuOBm+OCk+OAgjwvcD4nKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0eXBlb2YgbG9jYWxTdG9yYWdlID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICBkMy5zZWxlY3QoJyNjb250ZW50JykuYXBwZW5kKCdkaXYnKS5jbGFzc2VkKCdlcnJvcicsIHRydWUpLmh0bWwoXHJcbiAgICAgICAgY29udGVudCArICc8cCBjbGFzcz1cImVycm9ydGV4dFwiPuODluODqeOCpuOCtuOBjDxici8+V2ViIExvY2FsIFN0b3JhZ2XjgpLjgrXjg53jg7zjg4jjgZfjgabjgYTjgarjgYTjgZ/jgoE8YnIvPuWLleS9nOOBhOOBn+OBl+OBvuOBm+OCk+OAgjwvcD4nKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5zdG9yYWdlID0gbG9jYWxTdG9yYWdlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG4gXHJcbiAgLy8vIOOCsuODvOODoOODoeOCpOODs1xyXG4gIG1haW4oKSB7XHJcbiAgICAvLyDjgr/jgrnjgq/jga7lkbzjgbPlh7rjgZdcclxuICAgIC8vIOODoeOCpOODs+OBq+aPj+eUu1xyXG4gICAgaWYgKHRoaXMuc3RhcnQpIHtcclxuICAgICAgdGhpcy50YXNrcy5wcm9jZXNzKHRoaXMpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbG9hZFJlc291cmNlcygpIHtcclxuICAgIC8vLyDjgrLjg7zjg6DkuK3jga7jg4bjgq/jgrnjg4Hjg6Pjg7zlrprnvqlcclxuICAgIHZhciB0ZXh0dXJlcyA9IHtcclxuICAgICAgZm9udDogJ0ZvbnQucG5nJyxcclxuICAgICAgZm9udDE6ICdGb250Mi5wbmcnLFxyXG4gICAgICBhdXRob3I6ICdhdXRob3IucG5nJyxcclxuICAgICAgdGl0bGU6ICdUSVRMRS5wbmcnLFxyXG4gICAgICBteXNoaXA6ICdteXNoaXAyLnBuZycsXHJcbiAgICAgIGVuZW15OiAnZW5lbXkucG5nJyxcclxuICAgICAgYm9tYjogJ2JvbWIucG5nJ1xyXG4gICAgfTtcclxuICAgIC8vLyDjg4bjgq/jgrnjg4Hjg6Pjg7zjga7jg63jg7zjg4lcclxuICBcclxuICAgIHZhciBsb2FkUHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgpO1xyXG4gICAgdmFyIGxvYWRlciA9IG5ldyBUSFJFRS5UZXh0dXJlTG9hZGVyKCk7XHJcbiAgICBmdW5jdGlvbiBsb2FkVGV4dHVyZShzcmMpIHtcclxuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICBsb2FkZXIubG9hZChzcmMsICh0ZXh0dXJlKSA9PiB7XHJcbiAgICAgICAgICB0ZXh0dXJlLm1hZ0ZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XHJcbiAgICAgICAgICB0ZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLkxpbmVhck1pcE1hcExpbmVhckZpbHRlcjtcclxuICAgICAgICAgIHJlc29sdmUodGV4dHVyZSk7XHJcbiAgICAgICAgfSwgbnVsbCwgKHhocikgPT4geyByZWplY3QoeGhyKSB9KTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHRleExlbmd0aCA9IE9iamVjdC5rZXlzKHRleHR1cmVzKS5sZW5ndGg7XHJcbiAgICB2YXIgdGV4Q291bnQgPSAwO1xyXG4gICAgdGhpcy5wcm9ncmVzcyA9IG5ldyBncmFwaGljcy5Qcm9ncmVzcygpO1xyXG4gICAgdGhpcy5wcm9ncmVzcy5tZXNoLnBvc2l0aW9uLnogPSAwLjAwMTtcclxuICAgIHRoaXMucHJvZ3Jlc3MucmVuZGVyKCdMb2FkaW5nIFJlc291Y2VzIC4uLicsIDApO1xyXG4gICAgdGhpcy5zY2VuZS5hZGQodGhpcy5wcm9ncmVzcy5tZXNoKTtcclxuICAgIGZvciAodmFyIG4gaW4gdGV4dHVyZXMpIHtcclxuICAgICAgKChuYW1lLCB0ZXhQYXRoKSA9PiB7XHJcbiAgICAgICAgbG9hZFByb21pc2UgPSBsb2FkUHJvbWlzZVxyXG4gICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbG9hZFRleHR1cmUoJy4vcmVzLycgKyB0ZXhQYXRoKTtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAudGhlbigodGV4KSA9PiB7XHJcbiAgICAgICAgICAgIHRleENvdW50Kys7XHJcbiAgICAgICAgICAgIHRoaXMucHJvZ3Jlc3MucmVuZGVyKCdMb2FkaW5nIFJlc291Y2VzIC4uLicsICh0ZXhDb3VudCAvIHRleExlbmd0aCAqIDEwMCkgfCAwKTtcclxuICAgICAgICAgICAgc2ZnLnRleHR1cmVGaWxlc1tuYW1lXSA9IHRleDtcclxuICAgICAgICAgICAgdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5zY2VuZSwgdGhpcy5jYW1lcmEpO1xyXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSkobiwgdGV4dHVyZXNbbl0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGxvYWRQcm9taXNlO1xyXG4gIH1cclxuXHJcbipyZW5kZXIodGFza0luZGV4KSB7XHJcbiAgd2hpbGUodGFza0luZGV4ID49IDApe1xyXG4gICAgdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5zY2VuZSwgdGhpcy5jYW1lcmEpO1xyXG4gICAgdGhpcy50ZXh0UGxhbmUucmVuZGVyKCk7XHJcbiAgICB0aGlzLnN0YXRzICYmIHRoaXMuc3RhdHMudXBkYXRlKCk7XHJcbiAgICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICB9XHJcbn1cclxuXHJcbmluaXRfKClcclxue1xyXG4gIHRoaXMuc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcclxuICB0aGlzLmVuZW15QnVsbGV0cyA9IG5ldyBlbmVtaWVzLkVuZW15QnVsbGV0cyh0aGlzLnNjZW5lLCB0aGlzLnNlLmJpbmQodGhpcykpO1xyXG4gIHRoaXMuZW5lbWllcyA9IG5ldyBlbmVtaWVzLkVuZW1pZXModGhpcy5zY2VuZSwgdGhpcy5zZS5iaW5kKHRoaXMpLCB0aGlzLmVuZW15QnVsbGV0cyk7XHJcbiAgdGhpcy5ib21icyA9IHNmZy5ib21icyA9IG5ldyBlZmZlY3RvYmouQm9tYnModGhpcy5zY2VuZSwgdGhpcy5zZS5iaW5kKHRoaXMpKTtcclxuICB0aGlzLm15c2hpcF8gPSBuZXcgbXlzaGlwLk15U2hpcCgwLCAtMTAwLCAwLjEsIHRoaXMuc2NlbmUsIHRoaXMuc2UuYmluZCh0aGlzKSk7XHJcbiAgc2ZnLm15c2hpcF8gPSB0aGlzLm15c2hpcF87XHJcbiAgdGhpcy5teXNoaXBfLm1lc2gudmlzaWJsZSA9IGZhbHNlO1xyXG5cclxuICB0aGlzLnNwYWNlRmllbGQgPSBudWxsO1xyXG5cclxuICAvLyDjg4/jg7Pjg4njg6vjg43jg7zjg6Djga7lj5blvpdcclxuICB0aGlzLmhhbmRsZU5hbWUgPSB0aGlzLnN0b3JhZ2UuZ2V0SXRlbSgnaGFuZGxlTmFtZScpO1xyXG5cclxuICB0aGlzLnRleHRQbGFuZSA9IG5ldyB0ZXh0LlRleHRQbGFuZSh0aGlzLnNjZW5lKTtcclxuICAvLyB0ZXh0UGxhbmUucHJpbnQoMCwgMCwgXCJXZWIgQXVkaW8gQVBJIFRlc3RcIiwgbmV3IFRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gIC8vIOOCueOCs+OCouaDheWgsSDpgJrkv6HnlKhcclxuICB0aGlzLmNvbW1fID0gbmV3IGNvbW0uQ29tbSgpO1xyXG4gIHRoaXMuY29tbV8udXBkYXRlSGlnaFNjb3JlcyA9IChkYXRhKSA9PiB7XHJcbiAgICB0aGlzLmhpZ2hTY29yZXMgPSBkYXRhO1xyXG4gICAgdGhpcy5oaWdoU2NvcmUgPSB0aGlzLmhpZ2hTY29yZXNbMF0uc2NvcmU7XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5jb21tXy51cGRhdGVIaWdoU2NvcmUgPSAoZGF0YSkgPT4ge1xyXG4gICAgaWYgKHRoaXMuaGlnaFNjb3JlIDwgZGF0YS5zY29yZSkge1xyXG4gICAgICB0aGlzLmhpZ2hTY29yZSA9IGRhdGEuc2NvcmU7XHJcbiAgICAgIHRoaXMucHJpbnRTY29yZSgpO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgXHJcbn1cclxuXHJcbippbml0KHRhc2tJbmRleCkge1xyXG4gICAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgICB0aGlzLmluaXRfKCk7XHJcbiAgICB0aGlzLmJhc2ljSW5wdXQuYmluZCgpO1xyXG4gICAgdGhpcy50YXNrcy5wdXNoVGFzayh0aGlzLnJlbmRlci5iaW5kKHRoaXMpLCB0aGlzLlJFTkRFUkVSX1BSSU9SSVRZKTtcclxuICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLnByaW50QXV0aG9yLmJpbmQodGhpcykpO1xyXG59XHJcblxyXG4vLy8g5L2c6ICF6KGo56S6XHJcbipwcmludEF1dGhvcih0YXNrSW5kZXgpIHtcclxuICBjb25zdCB3YWl0ID0gNjA7XHJcbiAgdGhpcy5iYXNpY0lucHV0LmtleUJ1ZmZlci5sZW5ndGggPSAwO1xyXG4gIFxyXG4gIGxldCBuZXh0VGFzayA9ICgpPT57XHJcbiAgICB0aGlzLnNjZW5lLnJlbW92ZSh0aGlzLmF1dGhvcik7XHJcbiAgICAvL3NjZW5lLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLmluaXRUaXRsZS5iaW5kKHRoaXMpKTtcclxuICB9XHJcbiAgXHJcbiAgbGV0IGNoZWNrS2V5SW5wdXQgPSAoKT0+IHtcclxuICAgIGlmICh0aGlzLmJhc2ljSW5wdXQua2V5QnVmZmVyLmxlbmd0aCA+IDAgfHwgdGhpcy5iYXNpY0lucHV0LnN0YXJ0KSB7XHJcbiAgICAgIHRoaXMuYmFzaWNJbnB1dC5rZXlCdWZmZXIubGVuZ3RoID0gMDtcclxuICAgICAgbmV4dFRhc2soKTtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfSAgXHJcblxyXG4gIC8vIOWIneacn+WMllxyXG4gIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICB2YXIgdyA9IHNmZy50ZXh0dXJlRmlsZXMuYXV0aG9yLmltYWdlLndpZHRoO1xyXG4gIHZhciBoID0gc2ZnLnRleHR1cmVGaWxlcy5hdXRob3IuaW1hZ2UuaGVpZ2h0O1xyXG4gIGNhbnZhcy53aWR0aCA9IHc7XHJcbiAgY2FudmFzLmhlaWdodCA9IGg7XHJcbiAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gIGN0eC5kcmF3SW1hZ2Uoc2ZnLnRleHR1cmVGaWxlcy5hdXRob3IuaW1hZ2UsIDAsIDApO1xyXG4gIHZhciBkYXRhID0gY3R4LmdldEltYWdlRGF0YSgwLCAwLCB3LCBoKTtcclxuICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTtcclxuXHJcbiAgZ2VvbWV0cnkudmVydF9zdGFydCA9IFtdO1xyXG4gIGdlb21ldHJ5LnZlcnRfZW5kID0gW107XHJcblxyXG4gIHtcclxuICAgIHZhciBpID0gMDtcclxuXHJcbiAgICBmb3IgKHZhciB5ID0gMDsgeSA8IGg7ICsreSkge1xyXG4gICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHc7ICsreCkge1xyXG4gICAgICAgIHZhciBjb2xvciA9IG5ldyBUSFJFRS5Db2xvcigpO1xyXG5cclxuICAgICAgICB2YXIgciA9IGRhdGEuZGF0YVtpKytdO1xyXG4gICAgICAgIHZhciBnID0gZGF0YS5kYXRhW2krK107XHJcbiAgICAgICAgdmFyIGIgPSBkYXRhLmRhdGFbaSsrXTtcclxuICAgICAgICB2YXIgYSA9IGRhdGEuZGF0YVtpKytdO1xyXG4gICAgICAgIGlmIChhICE9IDApIHtcclxuICAgICAgICAgIGNvbG9yLnNldFJHQihyIC8gMjU1LjAsIGcgLyAyNTUuMCwgYiAvIDI1NS4wKTtcclxuICAgICAgICAgIHZhciB2ZXJ0ID0gbmV3IFRIUkVFLlZlY3RvcjMoKCh4IC0gdyAvIDIuMCkpLCAoKHkgLSBoIC8gMikpICogLTEsIDAuMCk7XHJcbiAgICAgICAgICB2YXIgdmVydDIgPSBuZXcgVEhSRUUuVmVjdG9yMygxMjAwICogTWF0aC5yYW5kb20oKSAtIDYwMCwgMTIwMCAqIE1hdGgucmFuZG9tKCkgLSA2MDAsIDEyMDAgKiBNYXRoLnJhbmRvbSgpIC0gNjAwKTtcclxuICAgICAgICAgIGdlb21ldHJ5LnZlcnRfc3RhcnQucHVzaChuZXcgVEhSRUUuVmVjdG9yMyh2ZXJ0Mi54IC0gdmVydC54LCB2ZXJ0Mi55IC0gdmVydC55LCB2ZXJ0Mi56IC0gdmVydC56KSk7XHJcbiAgICAgICAgICBnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKHZlcnQyKTtcclxuICAgICAgICAgIGdlb21ldHJ5LnZlcnRfZW5kLnB1c2godmVydCk7XHJcbiAgICAgICAgICBnZW9tZXRyeS5jb2xvcnMucHVzaChjb2xvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyDjg57jg4bjg6rjgqLjg6vjgpLkvZzmiJBcclxuICAvL3ZhciB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSgnaW1hZ2VzL3BhcnRpY2xlMS5wbmcnKTtcclxuICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuUG9pbnRzTWF0ZXJpYWwoe3NpemU6IDIwLCBibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZyxcclxuICAgIHRyYW5zcGFyZW50OiB0cnVlLCB2ZXJ0ZXhDb2xvcnM6IHRydWUsIGRlcHRoVGVzdDogZmFsc2UvLywgbWFwOiB0ZXh0dXJlXHJcbiAgfSk7XHJcblxyXG4gIHRoaXMuYXV0aG9yID0gbmV3IFRIUkVFLlBvaW50cyhnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gIC8vICAgIGF1dGhvci5wb3NpdGlvbi54IGF1dGhvci5wb3NpdGlvbi55PSAgPTAuMCwgMC4wLCAwLjApO1xyXG5cclxuICAvL21lc2guc29ydFBhcnRpY2xlcyA9IGZhbHNlO1xyXG4gIC8vdmFyIG1lc2gxID0gbmV3IFRIUkVFLlBhcnRpY2xlU3lzdGVtKCk7XHJcbiAgLy9tZXNoLnNjYWxlLnggPSBtZXNoLnNjYWxlLnkgPSA4LjA7XHJcblxyXG4gIHRoaXMuc2NlbmUuYWRkKHRoaXMuYXV0aG9yKTsgIFxyXG5cclxuIFxyXG4gIC8vIOS9nOiAheihqOekuuOCueODhuODg+ODl++8kVxyXG4gIGZvcihsZXQgY291bnQgPSAxLjA7Y291bnQgPiAwOyhjb3VudCA8PSAwLjAxKT9jb3VudCAtPSAwLjAwMDU6Y291bnQgLT0gMC4wMDI1KVxyXG4gIHtcclxuICAgIC8vIOS9leOBi+OCreODvOWFpeWKm+OBjOOBguOBo+OBn+WgtOWQiOOBr+asoeOBruOCv+OCueOCr+OBuFxyXG4gICAgaWYoY2hlY2tLZXlJbnB1dCgpKXtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsZXQgZW5kID0gdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydGljZXMubGVuZ3RoO1xyXG4gICAgbGV0IHYgPSB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlcztcclxuICAgIGxldCBkID0gdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydF9zdGFydDtcclxuICAgIGxldCB2MiA9IHRoaXMuYXV0aG9yLmdlb21ldHJ5LnZlcnRfZW5kO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgICB2W2ldLnggPSB2MltpXS54ICsgZFtpXS54ICogY291bnQ7XHJcbiAgICAgIHZbaV0ueSA9IHYyW2ldLnkgKyBkW2ldLnkgKiBjb3VudDtcclxuICAgICAgdltpXS56ID0gdjJbaV0ueiArIGRbaV0ueiAqIGNvdW50O1xyXG4gICAgfVxyXG4gICAgdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydGljZXNOZWVkVXBkYXRlID0gdHJ1ZTtcclxuICAgIHRoaXMuYXV0aG9yLnJvdGF0aW9uLnggPSB0aGlzLmF1dGhvci5yb3RhdGlvbi55ID0gdGhpcy5hdXRob3Iucm90YXRpb24ueiA9IGNvdW50ICogNC4wO1xyXG4gICAgdGhpcy5hdXRob3IubWF0ZXJpYWwub3BhY2l0eSA9IDEuMDtcclxuICAgIHlpZWxkO1xyXG4gIH1cclxuICB0aGlzLmF1dGhvci5yb3RhdGlvbi54ID0gdGhpcy5hdXRob3Iucm90YXRpb24ueSA9IHRoaXMuYXV0aG9yLnJvdGF0aW9uLnogPSAwLjA7XHJcblxyXG4gIGZvciAobGV0IGkgPSAwLGUgPSB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlcy5sZW5ndGg7IGkgPCBlOyArK2kpIHtcclxuICAgIHRoaXMuYXV0aG9yLmdlb21ldHJ5LnZlcnRpY2VzW2ldLnggPSB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0X2VuZFtpXS54O1xyXG4gICAgdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydGljZXNbaV0ueSA9IHRoaXMuYXV0aG9yLmdlb21ldHJ5LnZlcnRfZW5kW2ldLnk7XHJcbiAgICB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlc1tpXS56ID0gdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydF9lbmRbaV0uejtcclxuICB9XHJcbiAgdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydGljZXNOZWVkVXBkYXRlID0gdHJ1ZTtcclxuXHJcbiAgLy8g5b6F44GhXHJcbiAgZm9yKGxldCBpID0gMDtpIDwgd2FpdDsrK2kpe1xyXG4gICAgLy8g5L2V44GL44Kt44O85YWl5Yqb44GM44GC44Gj44Gf5aC05ZCI44Gv5qyh44Gu44K/44K544Kv44G4XHJcbiAgICBpZihjaGVja0tleUlucHV0KCkpe1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5hdXRob3IubWF0ZXJpYWwuc2l6ZSA+IDIpIHtcclxuICAgICAgdGhpcy5hdXRob3IubWF0ZXJpYWwuc2l6ZSAtPSAwLjU7XHJcbiAgICAgIHRoaXMuYXV0aG9yLm1hdGVyaWFsLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIH0gICAgXHJcbiAgICB5aWVsZDtcclxuICB9XHJcblxyXG4gIC8vIOODleOCp+ODvOODieOCouOCpuODiFxyXG4gIGZvcihsZXQgY291bnQgPSAwLjA7Y291bnQgPD0gMS4wO2NvdW50ICs9IDAuMDUpXHJcbiAge1xyXG4gICAgLy8g5L2V44GL44Kt44O85YWl5Yqb44GM44GC44Gj44Gf5aC05ZCI44Gv5qyh44Gu44K/44K544Kv44G4XHJcbiAgICBpZihjaGVja0tleUlucHV0KCkpe1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB0aGlzLmF1dGhvci5tYXRlcmlhbC5vcGFjaXR5ID0gMS4wIC0gY291bnQ7XHJcbiAgICB0aGlzLmF1dGhvci5tYXRlcmlhbC5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICBcclxuICAgIHlpZWxkO1xyXG4gIH1cclxuXHJcbiAgdGhpcy5hdXRob3IubWF0ZXJpYWwub3BhY2l0eSA9IDAuMDsgXHJcbiAgdGhpcy5hdXRob3IubWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG5cclxuICAvLyDlvoXjgaFcclxuICBmb3IobGV0IGkgPSAwO2kgPCB3YWl0OysraSl7XHJcbiAgICAvLyDkvZXjgYvjgq3jg7zlhaXlipvjgYzjgYLjgaPjgZ/loLTlkIjjga/mrKHjga7jgr/jgrnjgq/jgbhcclxuICAgIGlmKGNoZWNrS2V5SW5wdXQoKSl7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHlpZWxkO1xyXG4gIH1cclxuICBuZXh0VGFzaygpO1xyXG59XHJcblxyXG4vLy8g44K/44Kk44OI44Or55S76Z2i5Yid5pyf5YyWIC8vL1xyXG4qaW5pdFRpdGxlKHRhc2tJbmRleCkge1xyXG4gIFxyXG4gIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gIFxyXG4gIHRoaXMuYmFzaWNJbnB1dC5jbGVhcigpO1xyXG5cclxuICAvLyDjgr/jgqTjg4jjg6vjg6Hjg4Pjgrfjg6Xjga7kvZzmiJDjg7vooajnpLogLy8vXHJcbiAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgbWFwOiBzZmcudGV4dHVyZUZpbGVzLnRpdGxlIH0pO1xyXG4gIG1hdGVyaWFsLnNoYWRpbmcgPSBUSFJFRS5GbGF0U2hhZGluZztcclxuICAvL21hdGVyaWFsLmFudGlhbGlhcyA9IGZhbHNlO1xyXG4gIG1hdGVyaWFsLnRyYW5zcGFyZW50ID0gdHJ1ZTtcclxuICBtYXRlcmlhbC5hbHBoYVRlc3QgPSAwLjU7XHJcbiAgbWF0ZXJpYWwuZGVwdGhUZXN0ID0gdHJ1ZTtcclxuICB0aGlzLnRpdGxlID0gbmV3IFRIUkVFLk1lc2goXHJcbiAgICBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeShzZmcudGV4dHVyZUZpbGVzLnRpdGxlLmltYWdlLndpZHRoLCBzZmcudGV4dHVyZUZpbGVzLnRpdGxlLmltYWdlLmhlaWdodCksXHJcbiAgICBtYXRlcmlhbFxyXG4gICAgKTtcclxuICB0aGlzLnRpdGxlLnNjYWxlLnggPSB0aGlzLnRpdGxlLnNjYWxlLnkgPSAwLjg7XHJcbiAgdGhpcy50aXRsZS5wb3NpdGlvbi55ID0gODA7XHJcbiAgdGhpcy5zY2VuZS5hZGQodGhpcy50aXRsZSk7XHJcbiAgdGhpcy5zaG93U3BhY2VGaWVsZCgpO1xyXG4gIC8vLyDjg4bjgq3jgrnjg4jooajnpLpcclxuICB0aGlzLnRleHRQbGFuZS5wcmludCgzLCAyNSwgXCJQdXNoIHogb3IgU1RBUlQgYnV0dG9uXCIsIG5ldyB0ZXh0LlRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gIHNmZy5nYW1lVGltZXIuc3RhcnQoKTtcclxuICB0aGlzLnNob3dUaXRsZS5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDEwLyrnp5IqLztcclxuICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5zaG93VGl0bGUuYmluZCh0aGlzKSk7XHJcbiAgcmV0dXJuO1xyXG59XHJcblxyXG4vLy8g6IOM5pmv44OR44O844OG44Kj44Kv44Or6KGo56S6XHJcbnNob3dTcGFjZUZpZWxkKCkge1xyXG4gIC8vLyDog4zmma/jg5Hjg7zjg4bjgqPjgq/jg6vooajnpLpcclxuICBpZiAoIXRoaXMuc3BhY2VGaWVsZCkge1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkdlb21ldHJ5KCk7XHJcblxyXG4gICAgZ2VvbWV0cnkuZW5keSA9IFtdO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAyNTA7ICsraSkge1xyXG4gICAgICB2YXIgY29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoKTtcclxuICAgICAgdmFyIHogPSAtMTgwMC4wICogTWF0aC5yYW5kb20oKSAtIDMwMC4wO1xyXG4gICAgICBjb2xvci5zZXRIU0woMC4wNSArIE1hdGgucmFuZG9tKCkgKiAwLjA1LCAxLjAsICgtMjEwMCAtIHopIC8gLTIxMDApO1xyXG4gICAgICB2YXIgZW5keSA9IHNmZy5WSVJUVUFMX0hFSUdIVCAvIDIgLSB6ICogc2ZnLlZJUlRVQUxfSEVJR0hUIC8gc2ZnLlZJUlRVQUxfV0lEVEg7XHJcbiAgICAgIHZhciB2ZXJ0MiA9IG5ldyBUSFJFRS5WZWN0b3IzKChzZmcuVklSVFVBTF9XSURUSCAtIHogKiAyKSAqIE1hdGgucmFuZG9tKCkgLSAoKHNmZy5WSVJUVUFMX1dJRFRIIC0geiAqIDIpIC8gMilcclxuICAgICAgICAsIGVuZHkgKiAyICogTWF0aC5yYW5kb20oKSAtIGVuZHksIHopO1xyXG4gICAgICBnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKHZlcnQyKTtcclxuICAgICAgZ2VvbWV0cnkuZW5keS5wdXNoKGVuZHkpO1xyXG5cclxuICAgICAgZ2VvbWV0cnkuY29sb3JzLnB1c2goY29sb3IpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIOODnuODhuODquOCouODq+OCkuS9nOaIkFxyXG4gICAgLy92YXIgdGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoJ2ltYWdlcy9wYXJ0aWNsZTEucG5nJyk7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuUG9pbnRzTWF0ZXJpYWwoe1xyXG4gICAgICBzaXplOiA0LCBibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZyxcclxuICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsIHZlcnRleENvbG9yczogdHJ1ZSwgZGVwdGhUZXN0OiB0cnVlLy8sIG1hcDogdGV4dHVyZVxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5zcGFjZUZpZWxkID0gbmV3IFRIUkVFLlBvaW50cyhnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gICAgdGhpcy5zcGFjZUZpZWxkLnBvc2l0aW9uLnggPSB0aGlzLnNwYWNlRmllbGQucG9zaXRpb24ueSA9IHRoaXMuc3BhY2VGaWVsZC5wb3NpdGlvbi56ID0gMC4wO1xyXG4gICAgdGhpcy5zY2VuZS5hZGQodGhpcy5zcGFjZUZpZWxkKTtcclxuICAgIHRoaXMudGFza3MucHVzaFRhc2sodGhpcy5tb3ZlU3BhY2VGaWVsZC5iaW5kKHRoaXMpKTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDlroflrpnnqbrplpPjga7ooajnpLpcclxuKm1vdmVTcGFjZUZpZWxkKHRhc2tJbmRleCkge1xyXG4gIHdoaWxlKHRydWUpe1xyXG4gICAgdmFyIHZlcnRzID0gdGhpcy5zcGFjZUZpZWxkLmdlb21ldHJ5LnZlcnRpY2VzO1xyXG4gICAgdmFyIGVuZHlzID0gdGhpcy5zcGFjZUZpZWxkLmdlb21ldHJ5LmVuZHk7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gdmVydHMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgdmVydHNbaV0ueSAtPSA0O1xyXG4gICAgICBpZiAodmVydHNbaV0ueSA8IC1lbmR5c1tpXSkge1xyXG4gICAgICAgIHZlcnRzW2ldLnkgPSBlbmR5c1tpXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5zcGFjZUZpZWxkLmdlb21ldHJ5LnZlcnRpY2VzTmVlZFVwZGF0ZSA9IHRydWU7XHJcbiAgICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDjgr/jgqTjg4jjg6vooajnpLpcclxuKnNob3dUaXRsZSh0YXNrSW5kZXgpIHtcclxuIHdoaWxlKHRydWUpe1xyXG4gIHNmZy5nYW1lVGltZXIudXBkYXRlKCk7XHJcblxyXG4gIGlmICh0aGlzLmJhc2ljSW5wdXQueiB8fCB0aGlzLmJhc2ljSW5wdXQuc3RhcnQgKSB7XHJcbiAgICB0aGlzLnNjZW5lLnJlbW92ZSh0aGlzLnRpdGxlKTtcclxuICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLmluaXRIYW5kbGVOYW1lLmJpbmQodGhpcykpO1xyXG4gIH1cclxuICBpZiAodGhpcy5zaG93VGl0bGUuZW5kVGltZSA8IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUpIHtcclxuICAgIHRoaXMuc2NlbmUucmVtb3ZlKHRoaXMudGl0bGUpO1xyXG4gICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuaW5pdFRvcDEwLmJpbmQodGhpcykpO1xyXG4gIH1cclxuICB5aWVsZDtcclxuIH1cclxufVxyXG5cclxuLy8vIOODj+ODs+ODieODq+ODjeODvOODoOOBruOCqOODs+ODiOODquWJjeWIneacn+WMllxyXG4qaW5pdEhhbmRsZU5hbWUodGFza0luZGV4KSB7XHJcbiAgbGV0IGVuZCA9IGZhbHNlO1xyXG4gIGlmICh0aGlzLmVkaXRIYW5kbGVOYW1lKXtcclxuICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLmdhbWVJbml0LmJpbmQodGhpcykpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0aGlzLmVkaXRIYW5kbGVOYW1lID0gdGhpcy5oYW5kbGVOYW1lIHx8ICcnO1xyXG4gICAgdGhpcy50ZXh0UGxhbmUuY2xzKCk7XHJcbiAgICB0aGlzLnRleHRQbGFuZS5wcmludCg0LCAxOCwgJ0lucHV0IHlvdXIgaGFuZGxlIG5hbWUuJyk7XHJcbiAgICB0aGlzLnRleHRQbGFuZS5wcmludCg4LCAxOSwgJyhNYXggOCBDaGFyKScpO1xyXG4gICAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMTAsIDIxLCB0aGlzLmVkaXRIYW5kbGVOYW1lKTtcclxuICAgIC8vICAgIHRleHRQbGFuZS5wcmludCgxMCwgMjEsIGhhbmRsZU5hbWVbMF0sIFRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gICAgdGhpcy5iYXNpY0lucHV0LnVuYmluZCgpO1xyXG4gICAgdmFyIGVsbSA9IGQzLnNlbGVjdCgnI2NvbnRlbnQnKS5hcHBlbmQoJ2lucHV0Jyk7XHJcbiAgICBsZXQgdGhpc18gPSB0aGlzO1xyXG4gICAgZWxtXHJcbiAgICAgIC5hdHRyKCd0eXBlJywgJ3RleHQnKVxyXG4gICAgICAuYXR0cigncGF0dGVybicsICdbYS16QS1aMC05X1xcQFxcI1xcJFxcLV17MCw4fScpXHJcbiAgICAgIC5hdHRyKCdtYXhsZW5ndGgnLCA4KVxyXG4gICAgICAuYXR0cignaWQnLCAnaW5wdXQtYXJlYScpXHJcbiAgICAgIC5hdHRyKCd2YWx1ZScsIHRoaXNfLmVkaXRIYW5kbGVOYW1lKVxyXG4gICAgICAuY2FsbChmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgIGQubm9kZSgpLnNlbGVjdGlvblN0YXJ0ID0gdGhpc18uZWRpdEhhbmRsZU5hbWUubGVuZ3RoO1xyXG4gICAgICB9KVxyXG4gICAgICAub24oJ2JsdXInLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgZDMuZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBkMy5ldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAvL2xldCB0aGlzXyA9IHRoaXM7XHJcbiAgICAgICAgc2V0VGltZW91dCggKCkgPT4geyB0aGlzLmZvY3VzKCk7IH0sIDEwKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5vbigna2V5dXAnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoZDMuZXZlbnQua2V5Q29kZSA9PSAxMykge1xyXG4gICAgICAgICAgdGhpc18uZWRpdEhhbmRsZU5hbWUgPSB0aGlzLnZhbHVlO1xyXG4gICAgICAgICAgbGV0IHMgPSB0aGlzLnNlbGVjdGlvblN0YXJ0O1xyXG4gICAgICAgICAgbGV0IGUgPSB0aGlzLnNlbGVjdGlvbkVuZDtcclxuICAgICAgICAgIHRoaXNfLnRleHRQbGFuZS5wcmludCgxMCwgMjEsIHRoaXNfLmVkaXRIYW5kbGVOYW1lKTtcclxuICAgICAgICAgIHRoaXNfLnRleHRQbGFuZS5wcmludCgxMCArIHMsIDIxLCAnXycsIG5ldyB0ZXh0LlRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLm9uKCdrZXl1cCcsIG51bGwpO1xyXG4gICAgICAgICAgdGhpc18uYmFzaWNJbnB1dC5iaW5kKCk7XHJcbiAgICAgICAgICAvLyDjgZPjga7jgr/jgrnjgq/jgpLntYLjgo/jgonjgZvjgotcclxuICAgICAgICAgIHRoaXNfLnRhc2tzLmFycmF5W3Rhc2tJbmRleF0uZ2VuSW5zdC5uZXh0KC0odGFza0luZGV4ICsgMSkpO1xyXG4gICAgICAgICAgLy8g5qyh44Gu44K/44K544Kv44KS6Kit5a6a44GZ44KLXHJcbiAgICAgICAgICB0aGlzXy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXNfLmdhbWVJbml0LmJpbmQodGhpc18pKTtcclxuICAgICAgICAgIHRoaXNfLnN0b3JhZ2Uuc2V0SXRlbSgnaGFuZGxlTmFtZScsIHRoaXNfLmVkaXRIYW5kbGVOYW1lKTtcclxuICAgICAgICAgIGQzLnNlbGVjdCgnI2lucHV0LWFyZWEnKS5yZW1vdmUoKTtcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpc18uZWRpdEhhbmRsZU5hbWUgPSB0aGlzLnZhbHVlO1xyXG4gICAgICAgIGxldCBzID0gdGhpcy5zZWxlY3Rpb25TdGFydDtcclxuICAgICAgICB0aGlzXy50ZXh0UGxhbmUucHJpbnQoMTAsIDIxLCAnICAgICAgICAgICAnKTtcclxuICAgICAgICB0aGlzXy50ZXh0UGxhbmUucHJpbnQoMTAsIDIxLCB0aGlzXy5lZGl0SGFuZGxlTmFtZSk7XHJcbiAgICAgICAgdGhpc18udGV4dFBsYW5lLnByaW50KDEwICsgcywgMjEsICdfJywgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5jYWxsKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLm5vZGUoKS5zZWxlY3Rpb25TdGFydDtcclxuICAgICAgICB0aGlzXy50ZXh0UGxhbmUucHJpbnQoMTAsIDIxLCAnICAgICAgICAgICAnKTtcclxuICAgICAgICB0aGlzXy50ZXh0UGxhbmUucHJpbnQoMTAsIDIxLCB0aGlzXy5lZGl0SGFuZGxlTmFtZSk7XHJcbiAgICAgICAgdGhpc18udGV4dFBsYW5lLnByaW50KDEwICsgcywgMjEsICdfJywgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgICAgICAgdGhpcy5ub2RlKCkuZm9jdXMoKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgd2hpbGUodGFza0luZGV4ID49IDApXHJcbiAgICB7XHJcbiAgICAgIHRoaXMuYmFzaWNJbnB1dC5jbGVhcigpO1xyXG4gICAgICBpZih0aGlzLmJhc2ljSW5wdXQuYUJ1dHRvbiB8fCB0aGlzLmJhc2ljSW5wdXQuc3RhcnQpXHJcbiAgICAgIHtcclxuICAgICAgICAgIHZhciBpbnB1dEFyZWEgPSBkMy5zZWxlY3QoJyNpbnB1dC1hcmVhJyk7XHJcbiAgICAgICAgICB2YXIgaW5wdXROb2RlID0gaW5wdXRBcmVhLm5vZGUoKTtcclxuICAgICAgICAgIHRoaXMuZWRpdEhhbmRsZU5hbWUgPSBpbnB1dE5vZGUudmFsdWU7XHJcbiAgICAgICAgICBsZXQgcyA9IGlucHV0Tm9kZS5zZWxlY3Rpb25TdGFydDtcclxuICAgICAgICAgIGxldCBlID0gaW5wdXROb2RlLnNlbGVjdGlvbkVuZDtcclxuICAgICAgICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDEwLCAyMSwgdGhpcy5lZGl0SGFuZGxlTmFtZSk7XHJcbiAgICAgICAgICB0aGlzLnRleHRQbGFuZS5wcmludCgxMCArIHMsIDIxLCAnXycsIG5ldyB0ZXh0LlRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gICAgICAgICAgaW5wdXRBcmVhLm9uKCdrZXl1cCcsIG51bGwpO1xyXG4gICAgICAgICAgdGhpcy5iYXNpY0lucHV0LmJpbmQoKTtcclxuICAgICAgICAgIC8vIOOBk+OBruOCv+OCueOCr+OCkue1guOCj+OCieOBm+OCi1xyXG4gICAgICAgICAgLy90aGlzLnRhc2tzLmFycmF5W3Rhc2tJbmRleF0uZ2VuSW5zdC5uZXh0KC0odGFza0luZGV4ICsgMSkpO1xyXG4gICAgICAgICAgLy8g5qyh44Gu44K/44K544Kv44KS6Kit5a6a44GZ44KLXHJcbiAgICAgICAgICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5nYW1lSW5pdC5iaW5kKHRoaXMpKTtcclxuICAgICAgICAgIHRoaXMuc3RvcmFnZS5zZXRJdGVtKCdoYW5kbGVOYW1lJywgdGhpcy5lZGl0SGFuZGxlTmFtZSk7XHJcbiAgICAgICAgICBpbnB1dEFyZWEucmVtb3ZlKCk7XHJcbiAgICAgICAgICByZXR1cm47ICAgICAgICBcclxuICAgICAgfVxyXG4gICAgICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICAgIH1cclxuICAgIHRhc2tJbmRleCA9IC0oKyt0YXNrSW5kZXgpO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOOCueOCs+OCouWKoOeul1xyXG5hZGRTY29yZShzKSB7XHJcbiAgdGhpcy5zY29yZSArPSBzO1xyXG4gIGlmICh0aGlzLnNjb3JlID4gdGhpcy5oaWdoU2NvcmUpIHtcclxuICAgIHRoaXMuaGlnaFNjb3JlID0gdGhpcy5zY29yZTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDjgrnjgrPjgqLooajnpLpcclxucHJpbnRTY29yZSgpIHtcclxuICB2YXIgcyA9ICgnMDAwMDAwMDAnICsgdGhpcy5zY29yZS50b1N0cmluZygpKS5zbGljZSgtOCk7XHJcbiAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMSwgMSwgcyk7XHJcblxyXG4gIHZhciBoID0gKCcwMDAwMDAwMCcgKyB0aGlzLmhpZ2hTY29yZS50b1N0cmluZygpKS5zbGljZSgtOCk7XHJcbiAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMTIsIDEsIGgpO1xyXG5cclxufVxyXG5cclxuLy8vIOOCteOCpuODs+ODieOCqOODleOCp+OCr+ODiFxyXG5zZShpbmRleCkge1xyXG4gIHRoaXMuc2VxdWVuY2VyLnBsYXlUcmFja3ModGhpcy5zb3VuZEVmZmVjdHMuc291bmRFZmZlY3RzW2luZGV4XSk7XHJcbn1cclxuXHJcbi8vLyDjgrLjg7zjg6Djga7liJ3mnJ/ljJZcclxuKmdhbWVJbml0KHRhc2tJbmRleCkge1xyXG5cclxuICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICBcclxuXHJcbiAgLy8g44Kq44O844OH44Kj44Kq44Gu6ZaL5aeLXHJcbiAgdGhpcy5hdWRpb18uc3RhcnQoKTtcclxuICB0aGlzLnNlcXVlbmNlci5sb2FkKGF1ZGlvLnNlcURhdGEpO1xyXG4gIHRoaXMuc2VxdWVuY2VyLnN0YXJ0KCk7XHJcbiAgc2ZnLnN0YWdlLnJlc2V0KCk7XHJcbiAgdGhpcy50ZXh0UGxhbmUuY2xzKCk7XHJcbiAgdGhpcy5lbmVtaWVzLnJlc2V0KCk7XHJcblxyXG4gIC8vIOiHquapn+OBruWIneacn+WMllxyXG4gIHRoaXMubXlzaGlwXy5pbml0KCk7XHJcbiAgc2ZnLmdhbWVUaW1lci5zdGFydCgpO1xyXG4gIHRoaXMuc2NvcmUgPSAwO1xyXG4gIHRoaXMudGV4dFBsYW5lLnByaW50KDIsIDAsICdTY29yZSAgICBIaWdoIFNjb3JlJyk7XHJcbiAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMjAsIDM5LCAnUmVzdDogICAnICsgc2ZnLm15c2hpcF8ucmVzdCk7XHJcbiAgdGhpcy5wcmludFNjb3JlKCk7XHJcbiAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuc3RhZ2VJbml0LmJpbmQodGhpcykvKmdhbWVBY3Rpb24qLyk7XHJcbn1cclxuXHJcbi8vLyDjgrnjg4bjg7zjgrjjga7liJ3mnJ/ljJZcclxuKnN0YWdlSW5pdCh0YXNrSW5kZXgpIHtcclxuICBcclxuICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICBcclxuICB0aGlzLnRleHRQbGFuZS5wcmludCgwLCAzOSwgJ1N0YWdlOicgKyBzZmcuc3RhZ2Uubm8pO1xyXG4gIHNmZy5nYW1lVGltZXIuc3RhcnQoKTtcclxuICB0aGlzLmVuZW1pZXMucmVzZXQoKTtcclxuICB0aGlzLmVuZW1pZXMuc3RhcnQoKTtcclxuICB0aGlzLmVuZW1pZXMuY2FsY0VuZW1pZXNDb3VudChzZmcuc3RhZ2UucHJpdmF0ZU5vKTtcclxuICB0aGlzLmVuZW1pZXMuaGl0RW5lbWllc0NvdW50ID0gMDtcclxuICB0aGlzLnRleHRQbGFuZS5wcmludCg4LCAxNSwgJ1N0YWdlICcgKyAoc2ZnLnN0YWdlLm5vKSArICcgU3RhcnQgISEnLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5zdGFnZVN0YXJ0LmJpbmQodGhpcykpO1xyXG59XHJcblxyXG4vLy8g44K544OG44O844K46ZaL5aeLXHJcbipzdGFnZVN0YXJ0KHRhc2tJbmRleCkge1xyXG4gIGxldCBlbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDI7XHJcbiAgd2hpbGUodGFza0luZGV4ID49IDAgJiYgZW5kVGltZSA+PSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lKXtcclxuICAgIHNmZy5nYW1lVGltZXIudXBkYXRlKCk7XHJcbiAgICBzZmcubXlzaGlwXy5hY3Rpb24odGhpcy5iYXNpY0lucHV0KTtcclxuICAgIHRhc2tJbmRleCA9IHlpZWxkOyAgICBcclxuICB9XHJcbiAgdGhpcy50ZXh0UGxhbmUucHJpbnQoOCwgMTUsICcgICAgICAgICAgICAgICAgICAnLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5nYW1lQWN0aW9uLmJpbmQodGhpcyksIDUwMDApO1xyXG59XHJcblxyXG4vLy8g44Ky44O844Og5LitXHJcbipnYW1lQWN0aW9uKHRhc2tJbmRleCkge1xyXG4gIHdoaWxlICh0YXNrSW5kZXggPj0gMCl7XHJcbiAgICB0aGlzLnByaW50U2NvcmUoKTtcclxuICAgIHNmZy5teXNoaXBfLmFjdGlvbih0aGlzLmJhc2ljSW5wdXQpO1xyXG4gICAgc2ZnLmdhbWVUaW1lci51cGRhdGUoKTtcclxuICAgIC8vY29uc29sZS5sb2coc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSk7XHJcbiAgICB0aGlzLmVuZW1pZXMubW92ZSgpO1xyXG5cclxuICAgIGlmICghdGhpcy5wcm9jZXNzQ29sbGlzaW9uKCkpIHtcclxuICAgICAgLy8g6Z2i44Kv44Oq44Ki44OB44Kn44OD44KvXHJcbiAgICAgIGlmICh0aGlzLmVuZW1pZXMuaGl0RW5lbWllc0NvdW50ID09IHRoaXMuZW5lbWllcy50b3RhbEVuZW1pZXNDb3VudCkge1xyXG4gICAgICAgIHRoaXMucHJpbnRTY29yZSgpO1xyXG4gICAgICAgIHRoaXMuc3RhZ2UuYWR2YW5jZSgpO1xyXG4gICAgICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLnN0YWdlSW5pdC5iaW5kKHRoaXMpKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMubXlTaGlwQm9tYi5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDM7XHJcbiAgICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLm15U2hpcEJvbWIuYmluZCh0aGlzKSk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH07XHJcbiAgICB0YXNrSW5kZXggPSB5aWVsZDsgXHJcbiAgfVxyXG59XHJcblxyXG4vLy8g5b2T44Gf44KK5Yik5a6aXHJcbnByb2Nlc3NDb2xsaXNpb24odGFza0luZGV4KSB7XHJcbiAgLy/jgIDoh6rmqZ/lvL7jgajmlbXjgajjga7jgYLjgZ/jgorliKTlrppcclxuICBsZXQgbXlCdWxsZXRzID0gc2ZnLm15c2hpcF8ubXlCdWxsZXRzO1xyXG4gIHRoaXMuZW5zID0gdGhpcy5lbmVtaWVzLmVuZW1pZXM7XHJcbiAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IG15QnVsbGV0cy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgbGV0IG15YiA9IG15QnVsbGV0c1tpXTtcclxuICAgIGlmIChteWIuZW5hYmxlXykge1xyXG4gICAgICB2YXIgbXliY28gPSBteUJ1bGxldHNbaV0uY29sbGlzaW9uQXJlYTtcclxuICAgICAgdmFyIGxlZnQgPSBteWJjby5sZWZ0ICsgbXliLng7XHJcbiAgICAgIHZhciByaWdodCA9IG15YmNvLnJpZ2h0ICsgbXliLng7XHJcbiAgICAgIHZhciB0b3AgPSBteWJjby50b3AgKyBteWIueTtcclxuICAgICAgdmFyIGJvdHRvbSA9IG15YmNvLmJvdHRvbSAtIG15Yi5zcGVlZCArIG15Yi55O1xyXG4gICAgICBmb3IgKHZhciBqID0gMCwgZW5kaiA9IHRoaXMuZW5zLmxlbmd0aDsgaiA8IGVuZGo7ICsraikge1xyXG4gICAgICAgIHZhciBlbiA9IHRoaXMuZW5zW2pdO1xyXG4gICAgICAgIGlmIChlbi5lbmFibGVfKSB7XHJcbiAgICAgICAgICB2YXIgZW5jbyA9IGVuLmNvbGxpc2lvbkFyZWE7XHJcbiAgICAgICAgICBpZiAodG9wID4gKGVuLnkgKyBlbmNvLmJvdHRvbSkgJiZcclxuICAgICAgICAgICAgKGVuLnkgKyBlbmNvLnRvcCkgPiBib3R0b20gJiZcclxuICAgICAgICAgICAgbGVmdCA8IChlbi54ICsgZW5jby5yaWdodCkgJiZcclxuICAgICAgICAgICAgKGVuLnggKyBlbmNvLmxlZnQpIDwgcmlnaHRcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIGVuLmhpdChteWIpO1xyXG4gICAgICAgICAgICBpZiAobXliLnBvd2VyIDw9IDApIHtcclxuICAgICAgICAgICAgICBteWIuZW5hYmxlXyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8g5pW144Go6Ieq5qmf44Go44Gu44GC44Gf44KK5Yik5a6aXHJcbiAgaWYgKHNmZy5DSEVDS19DT0xMSVNJT04pIHtcclxuICAgIGxldCBteWNvID0gc2ZnLm15c2hpcF8uY29sbGlzaW9uQXJlYTtcclxuICAgIGxldCBsZWZ0ID0gc2ZnLm15c2hpcF8ueCArIG15Y28ubGVmdDtcclxuICAgIGxldCByaWdodCA9IG15Y28ucmlnaHQgKyBzZmcubXlzaGlwXy54O1xyXG4gICAgbGV0IHRvcCA9IG15Y28udG9wICsgc2ZnLm15c2hpcF8ueTtcclxuICAgIGxldCBib3R0b20gPSBteWNvLmJvdHRvbSArIHNmZy5teXNoaXBfLnk7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHRoaXMuZW5zLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIGxldCBlbiA9IHRoaXMuZW5zW2ldO1xyXG4gICAgICBpZiAoZW4uZW5hYmxlXykge1xyXG4gICAgICAgIGxldCBlbmNvID0gZW4uY29sbGlzaW9uQXJlYTtcclxuICAgICAgICBpZiAodG9wID4gKGVuLnkgKyBlbmNvLmJvdHRvbSkgJiZcclxuICAgICAgICAgIChlbi55ICsgZW5jby50b3ApID4gYm90dG9tICYmXHJcbiAgICAgICAgICBsZWZ0IDwgKGVuLnggKyBlbmNvLnJpZ2h0KSAmJlxyXG4gICAgICAgICAgKGVuLnggKyBlbmNvLmxlZnQpIDwgcmlnaHRcclxuICAgICAgICAgICkge1xyXG4gICAgICAgICAgZW4uaGl0KG15c2hpcCk7XHJcbiAgICAgICAgICBzZmcubXlzaGlwXy5oaXQoKTtcclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8g5pW15by+44Go6Ieq5qmf44Go44Gu44GC44Gf44KK5Yik5a6aXHJcbiAgICB0aGlzLmVuYnMgPSB0aGlzLmVuZW15QnVsbGV0cy5lbmVteUJ1bGxldHM7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gdGhpcy5lbmJzLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIGxldCBlbiA9IHRoaXMuZW5ic1tpXTtcclxuICAgICAgaWYgKGVuLmVuYWJsZSkge1xyXG4gICAgICAgIGxldCBlbmNvID0gZW4uY29sbGlzaW9uQXJlYTtcclxuICAgICAgICBpZiAodG9wID4gKGVuLnkgKyBlbmNvLmJvdHRvbSkgJiZcclxuICAgICAgICAgIChlbi55ICsgZW5jby50b3ApID4gYm90dG9tICYmXHJcbiAgICAgICAgICBsZWZ0IDwgKGVuLnggKyBlbmNvLnJpZ2h0KSAmJlxyXG4gICAgICAgICAgKGVuLnggKyBlbmNvLmxlZnQpIDwgcmlnaHRcclxuICAgICAgICAgICkge1xyXG4gICAgICAgICAgZW4uaGl0KCk7XHJcbiAgICAgICAgICBzZmcubXlzaGlwXy5oaXQoKTtcclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICB9XHJcbiAgcmV0dXJuIGZhbHNlO1xyXG59XHJcblxyXG4vLy8g6Ieq5qmf54iG55m6IFxyXG4qbXlTaGlwQm9tYih0YXNrSW5kZXgpIHtcclxuICB3aGlsZShzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lIDw9IHRoaXMubXlTaGlwQm9tYi5lbmRUaW1lICYmIHRhc2tJbmRleCA+PSAwKXtcclxuICAgIHRoaXMuZW5lbWllcy5tb3ZlKCk7XHJcbiAgICBzZmcuZ2FtZVRpbWVyLnVwZGF0ZSgpO1xyXG4gICAgdGFza0luZGV4ID0geWllbGQ7ICBcclxuICB9XHJcbiAgc2ZnLm15c2hpcF8ucmVzdC0tO1xyXG4gIGlmIChzZmcubXlzaGlwXy5yZXN0ID09IDApIHtcclxuICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDEwLCAxOCwgJ0dBTUUgT1ZFUicsIG5ldyB0ZXh0LlRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gICAgdGhpcy5wcmludFNjb3JlKCk7XHJcbiAgICB0aGlzLnRleHRQbGFuZS5wcmludCgyMCwgMzksICdSZXN0OiAgICcgKyBzZmcubXlzaGlwXy5yZXN0KTtcclxuICAgIHRoaXMuY29tbV8uc29ja2V0Lm9uKCdzZW5kUmFuaycsIHRoaXMuY2hlY2tSYW5rSW4pO1xyXG4gICAgdGhpcy5jb21tXy5zZW5kU2NvcmUobmV3IFNjb3JlRW50cnkodGhpcy5lZGl0SGFuZGxlTmFtZSwgdGhpcy5zY29yZSkpO1xyXG4gICAgdGhpcy5nYW1lT3Zlci5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDU7XHJcbiAgICB0aGlzLnJhbmsgPSAtMTtcclxuICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLmdhbWVPdmVyLmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5zZXF1ZW5jZXIuc3RvcCgpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBzZmcubXlzaGlwXy5tZXNoLnZpc2libGUgPSB0cnVlO1xyXG4gICAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMjAsIDM5LCAnUmVzdDogICAnICsgc2ZnLm15c2hpcF8ucmVzdCk7XHJcbiAgICB0aGlzLnRleHRQbGFuZS5wcmludCg4LCAxNSwgJ1N0YWdlICcgKyAoc2ZnLnN0YWdlLm5vKSArICcgU3RhcnQgISEnLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICAgIHRoaXMuc3RhZ2VTdGFydC5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDI7XHJcbiAgICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5zdGFnZVN0YXJ0LmJpbmQodGhpcykpO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOOCsuODvOODoOOCquODvOODkOODvFxyXG4qZ2FtZU92ZXIodGFza0luZGV4KSB7XHJcbiAgd2hpbGUodGhpcy5nYW1lT3Zlci5lbmRUaW1lID49IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgJiYgdGFza0luZGV4ID49IDApXHJcbiAge1xyXG4gICAgc2ZnLmdhbWVUaW1lci51cGRhdGUoKTtcclxuICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gIH1cclxuICBcclxuXHJcbiAgdGhpcy50ZXh0UGxhbmUuY2xzKCk7XHJcbiAgdGhpcy5lbmVtaWVzLnJlc2V0KCk7XHJcbiAgdGhpcy5lbmVteUJ1bGxldHMucmVzZXQoKTtcclxuICBpZiAodGhpcy5yYW5rID49IDApIHtcclxuICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLmluaXRUb3AxMC5iaW5kKHRoaXMpKTtcclxuICB9IGVsc2Uge1xyXG4gICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuaW5pdFRpdGxlLmJpbmQodGhpcykpO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOODqeODs+OCreODs+OCsOOBl+OBn+OBi+OBqeOBhuOBi+OBruODgeOCp+ODg+OCr1xyXG5jaGVja1JhbmtJbihkYXRhKSB7XHJcbiAgdGhpcy5yYW5rID0gZGF0YS5yYW5rO1xyXG59XHJcblxyXG5cclxuLy8vIOODj+OCpOOCueOCs+OCouOCqOODs+ODiOODquOBruihqOekulxyXG5wcmludFRvcDEwKCkge1xyXG4gIHZhciByYW5rbmFtZSA9IFsnIDFzdCcsICcgMm5kJywgJyAzcmQnLCAnIDR0aCcsICcgNXRoJywgJyA2dGgnLCAnIDd0aCcsICcgOHRoJywgJyA5dGgnLCAnMTB0aCddO1xyXG4gIHRoaXMudGV4dFBsYW5lLnByaW50KDgsIDQsICdUb3AgMTAgU2NvcmUnKTtcclxuICB2YXIgeSA9IDg7XHJcbiAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHRoaXMuaGlnaFNjb3Jlcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgdmFyIHNjb3JlU3RyID0gJzAwMDAwMDAwJyArIHRoaXMuaGlnaFNjb3Jlc1tpXS5zY29yZTtcclxuICAgIHNjb3JlU3RyID0gc2NvcmVTdHIuc3Vic3RyKHNjb3JlU3RyLmxlbmd0aCAtIDgsIDgpO1xyXG4gICAgaWYgKHRoaXMucmFuayA9PSBpKSB7XHJcbiAgICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDMsIHksIHJhbmtuYW1lW2ldICsgJyAnICsgc2NvcmVTdHIgKyAnICcgKyB0aGlzLmhpZ2hTY29yZXNbaV0ubmFtZSwgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnRleHRQbGFuZS5wcmludCgzLCB5LCByYW5rbmFtZVtpXSArICcgJyArIHNjb3JlU3RyICsgJyAnICsgdGhpcy5oaWdoU2NvcmVzW2ldLm5hbWUpO1xyXG4gICAgfVxyXG4gICAgeSArPSAyO1xyXG4gIH1cclxufVxyXG5cclxuXHJcbippbml0VG9wMTAodGFza0luZGV4KSB7XHJcbiAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgdGhpcy50ZXh0UGxhbmUuY2xzKCk7XHJcbiAgdGhpcy5wcmludFRvcDEwKCk7XHJcbiAgdGhpcy5zaG93VG9wMTAuZW5kVGltZSA9IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgKyA1O1xyXG4gIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLnNob3dUb3AxMC5iaW5kKHRoaXMpKTtcclxufVxyXG5cclxuKnNob3dUb3AxMCh0YXNrSW5kZXgpIHtcclxuICB3aGlsZSh0aGlzLnNob3dUb3AxMC5lbmRUaW1lID49IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgJiYgdGhpcy5iYXNpY0lucHV0LmtleUJ1ZmZlci5sZW5ndGggPT0gMCAmJiB0YXNrSW5kZXggPj0gMClcclxuICB7XHJcbiAgICBzZmcuZ2FtZVRpbWVyLnVwZGF0ZSgpO1xyXG4gICAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgfSBcclxuICBcclxuICB0aGlzLmJhc2ljSW5wdXQua2V5QnVmZmVyLmxlbmd0aCA9IDA7XHJcbiAgdGhpcy50ZXh0UGxhbmUuY2xzKCk7XHJcbiAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuaW5pdFRpdGxlLmJpbmQodGhpcykpO1xyXG59XHJcbn1cclxuXHJcblxyXG5cclxuXHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBDb2xsaXNpb25BcmVhIHtcclxuICBjb25zdHJ1Y3RvcihvZmZzZXRYLCBvZmZzZXRZLCB3aWR0aCwgaGVpZ2h0KVxyXG4gIHtcclxuICAgIHRoaXMub2Zmc2V0WCA9IG9mZnNldFggfHwgMDtcclxuICAgIHRoaXMub2Zmc2V0WSA9IG9mZnNldFkgfHwgMDtcclxuICAgIHRoaXMudG9wID0gMDtcclxuICAgIHRoaXMuYm90dG9tID0gMDtcclxuICAgIHRoaXMubGVmdCA9IDA7XHJcbiAgICB0aGlzLnJpZ2h0ID0gMDtcclxuICAgIHRoaXMud2lkdGggPSB3aWR0aCB8fCAwO1xyXG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQgfHwgMDtcclxuICAgIHRoaXMud2lkdGhfID0gMDtcclxuICAgIHRoaXMuaGVpZ2h0XyA9IDA7XHJcbiAgfVxyXG4gIGdldCB3aWR0aCgpIHsgcmV0dXJuIHRoaXMud2lkdGhfOyB9XHJcbiAgc2V0IHdpZHRoKHYpIHtcclxuICAgIHRoaXMud2lkdGhfID0gdjtcclxuICAgIHRoaXMubGVmdCA9IHRoaXMub2Zmc2V0WCAtIHYgLyAyO1xyXG4gICAgdGhpcy5yaWdodCA9IHRoaXMub2Zmc2V0WCArIHYgLyAyO1xyXG4gIH1cclxuICBnZXQgaGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5oZWlnaHRfOyB9XHJcbiAgc2V0IGhlaWdodCh2KSB7XHJcbiAgICB0aGlzLmhlaWdodF8gPSB2O1xyXG4gICAgdGhpcy50b3AgPSB0aGlzLm9mZnNldFkgKyB2IC8gMjtcclxuICAgIHRoaXMuYm90dG9tID0gdGhpcy5vZmZzZXRZIC0gdiAvIDI7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgR2FtZU9iaiB7XHJcbiAgY29uc3RydWN0b3IoeCwgeSwgeikge1xyXG4gICAgdGhpcy54XyA9IHggfHwgMDtcclxuICAgIHRoaXMueV8gPSB5IHx8IDA7XHJcbiAgICB0aGlzLnpfID0geiB8fCAwLjA7XHJcbiAgICB0aGlzLmVuYWJsZV8gPSBmYWxzZTtcclxuICAgIHRoaXMud2lkdGggPSAwO1xyXG4gICAgdGhpcy5oZWlnaHQgPSAwO1xyXG4gICAgdGhpcy5jb2xsaXNpb25BcmVhID0gbmV3IENvbGxpc2lvbkFyZWEoKTtcclxuICB9XHJcbiAgZ2V0IHgoKSB7IHJldHVybiB0aGlzLnhfOyB9XHJcbiAgc2V0IHgodikgeyB0aGlzLnhfID0gdjsgfVxyXG4gIGdldCB5KCkgeyByZXR1cm4gdGhpcy55XzsgfVxyXG4gIHNldCB5KHYpIHsgdGhpcy55XyA9IHY7IH1cclxuICBnZXQgeigpIHsgcmV0dXJuIHRoaXMuel87IH1cclxuICBzZXQgeih2KSB7IHRoaXMuel8gPSB2OyB9XHJcbn1cclxuXHJcbiIsImV4cG9ydCBjb25zdCBWSVJUVUFMX1dJRFRIID0gMjQwO1xyXG5leHBvcnQgY29uc3QgVklSVFVBTF9IRUlHSFQgPSAzMjA7XHJcblxyXG5leHBvcnQgY29uc3QgVl9SSUdIVCA9IFZJUlRVQUxfV0lEVEggLyAyLjA7XHJcbmV4cG9ydCBjb25zdCBWX1RPUCA9IFZJUlRVQUxfSEVJR0hUIC8gMi4wO1xyXG5leHBvcnQgY29uc3QgVl9MRUZUID0gLTEgKiBWSVJUVUFMX1dJRFRIIC8gMi4wO1xyXG5leHBvcnQgY29uc3QgVl9CT1RUT00gPSAtMSAqIFZJUlRVQUxfSEVJR0hUIC8gMi4wO1xyXG5cclxuZXhwb3J0IGNvbnN0IENIQVJfU0laRSA9IDg7XHJcbmV4cG9ydCBjb25zdCBURVhUX1dJRFRIID0gVklSVFVBTF9XSURUSCAvIENIQVJfU0laRTtcclxuZXhwb3J0IGNvbnN0IFRFWFRfSEVJR0hUID0gVklSVFVBTF9IRUlHSFQgLyBDSEFSX1NJWkU7XHJcbmV4cG9ydCBjb25zdCBQSVhFTF9TSVpFID0gMTtcclxuZXhwb3J0IGNvbnN0IEFDVFVBTF9DSEFSX1NJWkUgPSBDSEFSX1NJWkUgKiBQSVhFTF9TSVpFO1xyXG5leHBvcnQgY29uc3QgU1BSSVRFX1NJWkVfWCA9IDE2LjA7XHJcbmV4cG9ydCBjb25zdCBTUFJJVEVfU0laRV9ZID0gMTYuMDtcclxuZXhwb3J0IHZhciBDSEVDS19DT0xMSVNJT04gPSBmYWxzZTtcclxuZXhwb3J0IHZhciBERUJVRyA9IGZhbHNlO1xyXG5leHBvcnQgdmFyIHRleHR1cmVGaWxlcyA9IHt9O1xyXG5leHBvcnQgdmFyIHN0YWdlO1xyXG5leHBvcnQgdmFyIHRhc2tzO1xyXG5leHBvcnQgdmFyIGdhbWVUaW1lcjtcclxuZXhwb3J0IHZhciBib21icztcclxuZXhwb3J0IHZhciBhZGRTY29yZTtcclxuZXhwb3J0IHZhciBteXNoaXBfO1xyXG5leHBvcnQgY29uc3QgdGV4dHVyZVJvb3QgPSAnLi9yZXMvJztcclxuZXhwb3J0IHZhciBwYXVzZSA9IGZhbHNlO1xyXG5leHBvcnQgdmFyIGdhbWU7XHJcblxyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmltcG9ydCAqIGFzIGcgZnJvbSAnLi9nbG9iYWwnO1xyXG5cclxuLy8vIOODhuOCr+OCueODgeODo+ODvOOBqOOBl+OBpmNhbnZhc+OCkuS9v+OBhuWgtOWQiOOBruODmOODq+ODkeODvFxyXG5leHBvcnQgZnVuY3Rpb24gQ2FudmFzVGV4dHVyZSh3aWR0aCwgaGVpZ2h0KSB7XHJcbiAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICB0aGlzLmNhbnZhcy53aWR0aCA9IHdpZHRoIHx8IGcuVklSVFVBTF9XSURUSDtcclxuICB0aGlzLmNhbnZhcy5oZWlnaHQgPSBoZWlnaHQgfHwgZy5WSVJUVUFMX0hFSUdIVDtcclxuICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgdGhpcy50ZXh0dXJlID0gbmV3IFRIUkVFLlRleHR1cmUodGhpcy5jYW52YXMpO1xyXG4gIHRoaXMudGV4dHVyZS5tYWdGaWx0ZXIgPSBUSFJFRS5OZWFyZXN0RmlsdGVyO1xyXG4gIHRoaXMudGV4dHVyZS5taW5GaWx0ZXIgPSBUSFJFRS5MaW5lYXJNaXBNYXBMaW5lYXJGaWx0ZXI7XHJcbiAgdGhpcy5tYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7IG1hcDogdGhpcy50ZXh0dXJlLCB0cmFuc3BhcmVudDogdHJ1ZSB9KTtcclxuICB0aGlzLmdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkodGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcbiAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2godGhpcy5nZW9tZXRyeSwgdGhpcy5tYXRlcmlhbCk7XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnogPSAwLjAwMTtcclxuICAvLyDjgrnjg6Djg7zjgrjjg7PjgrDjgpLliIfjgotcclxuICB0aGlzLmN0eC5tc0ltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIHRoaXMuY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIC8vdGhpcy5jdHgud2Via2l0SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgdGhpcy5jdHgubW96SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbn1cclxuXHJcbi8vLyDjg5fjg63jgrDjg6zjgrnjg5Djg7zooajnpLrjgq/jg6njgrlcclxuZXhwb3J0IGZ1bmN0aW9uIFByb2dyZXNzKCkge1xyXG4gIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7O1xyXG4gIHZhciB3aWR0aCA9IDE7XHJcbiAgd2hpbGUgKHdpZHRoIDw9IGcuVklSVFVBTF9XSURUSCl7XHJcbiAgICB3aWR0aCAqPSAyO1xyXG4gIH1cclxuICB2YXIgaGVpZ2h0ID0gMTtcclxuICB3aGlsZSAoaGVpZ2h0IDw9IGcuVklSVFVBTF9IRUlHSFQpe1xyXG4gICAgaGVpZ2h0ICo9IDI7XHJcbiAgfVxyXG4gIHRoaXMuY2FudmFzLndpZHRoID0gd2lkdGg7XHJcbiAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG4gIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICB0aGlzLnRleHR1cmUgPSBuZXcgVEhSRUUuVGV4dHVyZSh0aGlzLmNhbnZhcyk7XHJcbiAgdGhpcy50ZXh0dXJlLm1hZ0ZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XHJcbiAgdGhpcy50ZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLkxpbmVhck1pcE1hcExpbmVhckZpbHRlcjtcclxuICAvLyDjgrnjg6Djg7zjgrjjg7PjgrDjgpLliIfjgotcclxuICB0aGlzLmN0eC5tc0ltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIHRoaXMuY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIC8vdGhpcy5jdHgud2Via2l0SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgdGhpcy5jdHgubW96SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcblxyXG4gIHRoaXMubWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBtYXA6IHRoaXMudGV4dHVyZSwgdHJhbnNwYXJlbnQ6IHRydWUgfSk7XHJcbiAgdGhpcy5nZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG4gIHRoaXMubWVzaCA9IG5ldyBUSFJFRS5NZXNoKHRoaXMuZ2VvbWV0cnksIHRoaXMubWF0ZXJpYWwpO1xyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi54ID0gKHdpZHRoIC0gZy5WSVJUVUFMX1dJRFRIKSAvIDI7XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnkgPSAgLSAoaGVpZ2h0IC0gZy5WSVJUVUFMX0hFSUdIVCkgLyAyO1xyXG5cclxuICAvL3RoaXMudGV4dHVyZS5wcmVtdWx0aXBseUFscGhhID0gdHJ1ZTtcclxufVxyXG5cclxuLy8vIOODl+ODreOCsOODrOOCueODkOODvOOCkuihqOekuuOBmeOCi+OAglxyXG5Qcm9ncmVzcy5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gKG1lc3NhZ2UsIHBlcmNlbnQpIHtcclxuICB2YXIgY3R4ID0gdGhpcy5jdHg7XHJcbiAgdmFyIHdpZHRoID0gdGhpcy5jYW52YXMud2lkdGgsIGhlaWdodCA9IHRoaXMuY2FudmFzLmhlaWdodDtcclxuICAvLyAgICAgIGN0eC5maWxsU3R5bGUgPSAncmdiYSgwLDAsMCwwKSc7XHJcbiAgY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuICB2YXIgdGV4dFdpZHRoID0gY3R4Lm1lYXN1cmVUZXh0KG1lc3NhZ2UpLndpZHRoO1xyXG4gIGN0eC5zdHJva2VTdHlsZSA9IGN0eC5maWxsU3R5bGUgPSAncmdiYSgyNTUsMjU1LDI1NSwxLjApJztcclxuXHJcbiAgY3R4LmZpbGxUZXh0KG1lc3NhZ2UsICh3aWR0aCAtIHRleHRXaWR0aCkgLyAyLCAxMDApO1xyXG4gIGN0eC5iZWdpblBhdGgoKTtcclxuICBjdHgucmVjdCgyMCwgNzUsIHdpZHRoIC0gMjAgKiAyLCAxMCk7XHJcbiAgY3R4LnN0cm9rZSgpO1xyXG4gIGN0eC5maWxsUmVjdCgyMCwgNzUsICh3aWR0aCAtIDIwICogMikgKiBwZXJjZW50IC8gMTAwLCAxMCk7XHJcbiAgdGhpcy50ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxufVxyXG5cclxuLy8vIGltZ+OBi+OCieOCuOOCquODoeODiOODquOCkuS9nOaIkOOBmeOCi1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlR2VvbWV0cnlGcm9tSW1hZ2UoaW1hZ2UpIHtcclxuICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgdmFyIHcgPSB0ZXh0dXJlRmlsZXMuYXV0aG9yLnRleHR1cmUuaW1hZ2Uud2lkdGg7XHJcbiAgdmFyIGggPSB0ZXh0dXJlRmlsZXMuYXV0aG9yLnRleHR1cmUuaW1hZ2UuaGVpZ2h0O1xyXG4gIGNhbnZhcy53aWR0aCA9IHc7XHJcbiAgY2FudmFzLmhlaWdodCA9IGg7XHJcbiAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gIGN0eC5kcmF3SW1hZ2UoaW1hZ2UsIDAsIDApO1xyXG4gIHZhciBkYXRhID0gY3R4LmdldEltYWdlRGF0YSgwLCAwLCB3LCBoKTtcclxuICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTtcclxuICB7XHJcbiAgICB2YXIgaSA9IDA7XHJcblxyXG4gICAgZm9yICh2YXIgeSA9IDA7IHkgPCBoOyArK3kpIHtcclxuICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB3OyArK3gpIHtcclxuICAgICAgICB2YXIgY29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoKTtcclxuXHJcbiAgICAgICAgdmFyIHIgPSBkYXRhLmRhdGFbaSsrXTtcclxuICAgICAgICB2YXIgZyA9IGRhdGEuZGF0YVtpKytdO1xyXG4gICAgICAgIHZhciBiID0gZGF0YS5kYXRhW2krK107XHJcbiAgICAgICAgdmFyIGEgPSBkYXRhLmRhdGFbaSsrXTtcclxuICAgICAgICBpZiAoYSAhPSAwKSB7XHJcbiAgICAgICAgICBjb2xvci5zZXRSR0IociAvIDI1NS4wLCBnIC8gMjU1LjAsIGIgLyAyNTUuMCk7XHJcbiAgICAgICAgICB2YXIgdmVydCA9IG5ldyBUSFJFRS5WZWN0b3IzKCgoeCAtIHcgLyAyLjApKSAqIDIuMCwgKCh5IC0gaCAvIDIpKSAqIC0yLjAsIDAuMCk7XHJcbiAgICAgICAgICBnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKHZlcnQpO1xyXG4gICAgICAgICAgZ2VvbWV0cnkuY29sb3JzLnB1c2goY29sb3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNwcml0ZUdlb21ldHJ5KHNpemUpXHJcbntcclxuICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTtcclxuICB2YXIgc2l6ZUhhbGYgPSBzaXplIC8gMjtcclxuICAvLyBnZW9tZXRyeS5cclxuICBnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKG5ldyBUSFJFRS5WZWN0b3IzKC1zaXplSGFsZiwgc2l6ZUhhbGYsIDApKTtcclxuICBnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKG5ldyBUSFJFRS5WZWN0b3IzKHNpemVIYWxmLCBzaXplSGFsZiwgMCkpO1xyXG4gIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2gobmV3IFRIUkVFLlZlY3RvcjMoc2l6ZUhhbGYsIC1zaXplSGFsZiwgMCkpO1xyXG4gIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2gobmV3IFRIUkVFLlZlY3RvcjMoLXNpemVIYWxmLCAtc2l6ZUhhbGYsIDApKTtcclxuICBnZW9tZXRyeS5mYWNlcy5wdXNoKG5ldyBUSFJFRS5GYWNlMygwLCAyLCAxKSk7XHJcbiAgZ2VvbWV0cnkuZmFjZXMucHVzaChuZXcgVEhSRUUuRmFjZTMoMCwgMywgMikpO1xyXG4gIHJldHVybiBnZW9tZXRyeTtcclxufVxyXG5cclxuLy8vIOODhuOCr+OCueODgeODo+ODvOS4iuOBruaMh+WumuOCueODl+ODqeOCpOODiOOBrlVW5bqn5qiZ44KS5rGC44KB44KLXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTcHJpdGVVVihnZW9tZXRyeSwgdGV4dHVyZSwgY2VsbFdpZHRoLCBjZWxsSGVpZ2h0LCBjZWxsTm8pXHJcbntcclxuICB2YXIgd2lkdGggPSB0ZXh0dXJlLmltYWdlLndpZHRoO1xyXG4gIHZhciBoZWlnaHQgPSB0ZXh0dXJlLmltYWdlLmhlaWdodDtcclxuXHJcbiAgdmFyIHVDZWxsQ291bnQgPSAod2lkdGggLyBjZWxsV2lkdGgpIHwgMDtcclxuICB2YXIgdkNlbGxDb3VudCA9IChoZWlnaHQgLyBjZWxsSGVpZ2h0KSB8IDA7XHJcbiAgdmFyIHZQb3MgPSB2Q2VsbENvdW50IC0gKChjZWxsTm8gLyB1Q2VsbENvdW50KSB8IDApO1xyXG4gIHZhciB1UG9zID0gY2VsbE5vICUgdUNlbGxDb3VudDtcclxuICB2YXIgdVVuaXQgPSBjZWxsV2lkdGggLyB3aWR0aDsgXHJcbiAgdmFyIHZVbml0ID0gY2VsbEhlaWdodCAvIGhlaWdodDtcclxuXHJcbiAgZ2VvbWV0cnkuZmFjZVZlcnRleFV2c1swXS5wdXNoKFtcclxuICAgIG5ldyBUSFJFRS5WZWN0b3IyKCh1UG9zKSAqIGNlbGxXaWR0aCAvIHdpZHRoLCAodlBvcykgKiBjZWxsSGVpZ2h0IC8gaGVpZ2h0KSxcclxuICAgIG5ldyBUSFJFRS5WZWN0b3IyKCh1UG9zICsgMSkgKiBjZWxsV2lkdGggLyB3aWR0aCwgKHZQb3MgLSAxKSAqIGNlbGxIZWlnaHQgLyBoZWlnaHQpLFxyXG4gICAgbmV3IFRIUkVFLlZlY3RvcjIoKHVQb3MgKyAxKSAqIGNlbGxXaWR0aCAvIHdpZHRoLCAodlBvcykgKiBjZWxsSGVpZ2h0IC8gaGVpZ2h0KVxyXG4gIF0pO1xyXG4gIGdlb21ldHJ5LmZhY2VWZXJ0ZXhVdnNbMF0ucHVzaChbXHJcbiAgICBuZXcgVEhSRUUuVmVjdG9yMigodVBvcykgKiBjZWxsV2lkdGggLyB3aWR0aCwgKHZQb3MpICogY2VsbEhlaWdodCAvIGhlaWdodCksXHJcbiAgICBuZXcgVEhSRUUuVmVjdG9yMigodVBvcykgKiBjZWxsV2lkdGggLyB3aWR0aCwgKHZQb3MgLSAxKSAqIGNlbGxIZWlnaHQgLyBoZWlnaHQpLFxyXG4gICAgbmV3IFRIUkVFLlZlY3RvcjIoKHVQb3MgKyAxKSAqIGNlbGxXaWR0aCAvIHdpZHRoLCAodlBvcyAtIDEpICogY2VsbEhlaWdodCAvIGhlaWdodClcclxuICBdKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZVNwcml0ZVVWKGdlb21ldHJ5LCB0ZXh0dXJlLCBjZWxsV2lkdGgsIGNlbGxIZWlnaHQsIGNlbGxObylcclxue1xyXG4gIHZhciB3aWR0aCA9IHRleHR1cmUuaW1hZ2Uud2lkdGg7XHJcbiAgdmFyIGhlaWdodCA9IHRleHR1cmUuaW1hZ2UuaGVpZ2h0O1xyXG5cclxuICB2YXIgdUNlbGxDb3VudCA9ICh3aWR0aCAvIGNlbGxXaWR0aCkgfCAwO1xyXG4gIHZhciB2Q2VsbENvdW50ID0gKGhlaWdodCAvIGNlbGxIZWlnaHQpIHwgMDtcclxuICB2YXIgdlBvcyA9IHZDZWxsQ291bnQgLSAoKGNlbGxObyAvIHVDZWxsQ291bnQpIHwgMCk7XHJcbiAgdmFyIHVQb3MgPSBjZWxsTm8gJSB1Q2VsbENvdW50O1xyXG4gIHZhciB1VW5pdCA9IGNlbGxXaWR0aCAvIHdpZHRoO1xyXG4gIHZhciB2VW5pdCA9IGNlbGxIZWlnaHQgLyBoZWlnaHQ7XHJcbiAgdmFyIHV2cyA9IGdlb21ldHJ5LmZhY2VWZXJ0ZXhVdnNbMF1bMF07XHJcblxyXG4gIHV2c1swXS54ID0gKHVQb3MpICogdVVuaXQ7XHJcbiAgdXZzWzBdLnkgPSAodlBvcykgKiB2VW5pdDtcclxuICB1dnNbMV0ueCA9ICh1UG9zICsgMSkgKiB1VW5pdDtcclxuICB1dnNbMV0ueSA9ICh2UG9zIC0gMSkgKiB2VW5pdDtcclxuICB1dnNbMl0ueCA9ICh1UG9zICsgMSkgKiB1VW5pdDtcclxuICB1dnNbMl0ueSA9ICh2UG9zKSAqIHZVbml0O1xyXG5cclxuICB1dnMgPSBnZW9tZXRyeS5mYWNlVmVydGV4VXZzWzBdWzFdO1xyXG5cclxuICB1dnNbMF0ueCA9ICh1UG9zKSAqIHVVbml0O1xyXG4gIHV2c1swXS55ID0gKHZQb3MpICogdlVuaXQ7XHJcbiAgdXZzWzFdLnggPSAodVBvcykgKiB1VW5pdDtcclxuICB1dnNbMV0ueSA9ICh2UG9zIC0gMSkgKiB2VW5pdDtcclxuICB1dnNbMl0ueCA9ICh1UG9zICsgMSkgKiB1VW5pdDtcclxuICB1dnNbMl0ueSA9ICh2UG9zIC0gMSkgKiB2VW5pdDtcclxuXHJcbiBcclxuICBnZW9tZXRyeS51dnNOZWVkVXBkYXRlID0gdHJ1ZTtcclxuXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTcHJpdGVNYXRlcmlhbCh0ZXh0dXJlKVxyXG57XHJcbiAgLy8g44Oh44OD44K344Ol44Gu5L2c5oiQ44O76KGo56S6IC8vL1xyXG4gIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7IG1hcDogdGV4dHVyZSAvKixkZXB0aFRlc3Q6dHJ1ZSovLCB0cmFuc3BhcmVudDogdHJ1ZSB9KTtcclxuICBtYXRlcmlhbC5zaGFkaW5nID0gVEhSRUUuRmxhdFNoYWRpbmc7XHJcbiAgbWF0ZXJpYWwuc2lkZSA9IFRIUkVFLkZyb250U2lkZTtcclxuICBtYXRlcmlhbC5hbHBoYVRlc3QgPSAwLjU7XHJcbiAgbWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4vLyAgbWF0ZXJpYWwuXHJcbiAgcmV0dXJuIG1hdGVyaWFsO1xyXG59XHJcblxyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmltcG9ydCAqIGFzIHNmZyBmcm9tICcuL2dsb2JhbCc7IFxyXG5cclxuLy8g44Kt44O85YWl5YqbXHJcbmV4cG9ydCBjbGFzcyBCYXNpY0lucHV0e1xyXG5jb25zdHJ1Y3RvciAoKSB7XHJcbiAgdGhpcy5rZXlDaGVjayA9IHsgdXA6IGZhbHNlLCBkb3duOiBmYWxzZSwgbGVmdDogZmFsc2UsIHJpZ2h0OiBmYWxzZSwgejogZmFsc2UgLHg6ZmFsc2V9O1xyXG4gIHRoaXMua2V5QnVmZmVyID0gW107XHJcbiAgdGhpcy5rZXl1cF8gPSBudWxsO1xyXG4gIHRoaXMua2V5ZG93bl8gPSBudWxsO1xyXG4gIC8vdGhpcy5nYW1lcGFkQ2hlY2sgPSB7IHVwOiBmYWxzZSwgZG93bjogZmFsc2UsIGxlZnQ6IGZhbHNlLCByaWdodDogZmFsc2UsIHo6IGZhbHNlICx4OmZhbHNlfTtcclxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignZ2FtZXBhZGNvbm5lY3RlZCcsKGUpPT57XHJcbiAgICB0aGlzLmdhbWVwYWQgPSBlLmdhbWVwYWQ7XHJcbiAgfSk7XHJcbiBcclxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignZ2FtZXBhZGRpc2Nvbm5lY3RlZCcsKGUpPT57XHJcbiAgICBkZWxldGUgdGhpcy5nYW1lcGFkO1xyXG4gIH0pOyBcclxuIFxyXG4gaWYod2luZG93Lm5hdmlnYXRvci5nZXRHYW1lcGFkcyl7XHJcbiAgIHRoaXMuZ2FtZXBhZCA9IHdpbmRvdy5uYXZpZ2F0b3IuZ2V0R2FtZXBhZHMoKVswXTtcclxuIH0gXHJcbn1cclxuXHJcbiAgY2xlYXIoKVxyXG4gIHtcclxuICAgIGZvcih2YXIgZCBpbiB0aGlzLmtleUNoZWNrKXtcclxuICAgICAgdGhpcy5rZXlDaGVja1tkXSA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgdGhpcy5rZXlCdWZmZXIubGVuZ3RoID0gMDtcclxuICB9XHJcbiAgXHJcbiAga2V5ZG93bihlKSB7XHJcbiAgICB2YXIgZSA9IGQzLmV2ZW50O1xyXG4gICAgdmFyIGtleUJ1ZmZlciA9IHRoaXMua2V5QnVmZmVyO1xyXG4gICAgdmFyIGtleUNoZWNrID0gdGhpcy5rZXlDaGVjaztcclxuICAgIHZhciBoYW5kbGUgPSB0cnVlO1xyXG4gICAgIFxyXG4gICAgaWYgKGtleUJ1ZmZlci5sZW5ndGggPiAxNikge1xyXG4gICAgICBrZXlCdWZmZXIuc2hpZnQoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgaWYgKGUua2V5Q29kZSA9PSA4MCAvKiBQICovKSB7XHJcbiAgICAgIGlmICghc2ZnLnBhdXNlKSB7XHJcbiAgICAgICAgc2ZnLmdhbWUucGF1c2UoKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzZmcuZ2FtZS5yZXN1bWUoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgICAgICAgXHJcbiAgICBrZXlCdWZmZXIucHVzaChlLmtleUNvZGUpO1xyXG4gICAgc3dpdGNoIChlLmtleUNvZGUpIHtcclxuICAgICAgY2FzZSA3NDpcclxuICAgICAgY2FzZSAzNzpcclxuICAgICAgY2FzZSAxMDA6XHJcbiAgICAgICAga2V5Q2hlY2subGVmdCA9IHRydWU7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA3MzpcclxuICAgICAgY2FzZSAzODpcclxuICAgICAgY2FzZSAxMDQ6XHJcbiAgICAgICAga2V5Q2hlY2sudXAgPSB0cnVlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgNzY6XHJcbiAgICAgIGNhc2UgMzk6XHJcbiAgICAgIGNhc2UgMTAyOlxyXG4gICAgICAgIGtleUNoZWNrLnJpZ2h0ID0gdHJ1ZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDc1OlxyXG4gICAgICBjYXNlIDQwOlxyXG4gICAgICBjYXNlIDk4OlxyXG4gICAgICAgIGtleUNoZWNrLmRvd24gPSB0cnVlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgOTA6XHJcbiAgICAgICAga2V5Q2hlY2sueiA9IHRydWU7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA4ODpcclxuICAgICAgICBrZXlDaGVjay54ID0gdHJ1ZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgaWYgKGhhbmRsZSkge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIGUucmV0dXJuVmFsdWUgPSBmYWxzZTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBrZXl1cCgpIHtcclxuICAgIHZhciBlID0gZDMuZXZlbnQ7XHJcbiAgICB2YXIga2V5QnVmZmVyID0gdGhpcy5rZXlCdWZmZXI7XHJcbiAgICB2YXIga2V5Q2hlY2sgPSB0aGlzLmtleUNoZWNrO1xyXG4gICAgdmFyIGhhbmRsZSA9IGZhbHNlO1xyXG4gICAgc3dpdGNoIChlLmtleUNvZGUpIHtcclxuICAgICAgY2FzZSA3NDpcclxuICAgICAgY2FzZSAzNzpcclxuICAgICAgY2FzZSAxMDA6XHJcbiAgICAgICAga2V5Q2hlY2subGVmdCA9IGZhbHNlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgNzM6XHJcbiAgICAgIGNhc2UgMzg6XHJcbiAgICAgIGNhc2UgMTA0OlxyXG4gICAgICAgIGtleUNoZWNrLnVwID0gZmFsc2U7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA3NjpcclxuICAgICAgY2FzZSAzOTpcclxuICAgICAgY2FzZSAxMDI6XHJcbiAgICAgICAga2V5Q2hlY2sucmlnaHQgPSBmYWxzZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDc1OlxyXG4gICAgICBjYXNlIDQwOlxyXG4gICAgICBjYXNlIDk4OlxyXG4gICAgICAgIGtleUNoZWNrLmRvd24gPSBmYWxzZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDkwOlxyXG4gICAgICAgIGtleUNoZWNrLnogPSBmYWxzZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDg4OlxyXG4gICAgICAgIGtleUNoZWNrLnggPSBmYWxzZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgaWYgKGhhbmRsZSkge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIGUucmV0dXJuVmFsdWUgPSBmYWxzZTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuICAvL+OCpOODmeODs+ODiOOBq+ODkOOCpOODs+ODieOBmeOCi1xyXG4gIGJpbmQoKVxyXG4gIHtcclxuICAgIGQzLnNlbGVjdCgnYm9keScpLm9uKCdrZXlkb3duLmJhc2ljSW5wdXQnLHRoaXMua2V5ZG93bi5iaW5kKHRoaXMpKTtcclxuICAgIGQzLnNlbGVjdCgnYm9keScpLm9uKCdrZXl1cC5iYXNpY0lucHV0Jyx0aGlzLmtleXVwLmJpbmQodGhpcykpO1xyXG4gIH1cclxuICAvLyDjgqLjg7Pjg5DjgqTjg7Pjg4njgZnjgotcclxuICB1bmJpbmQoKVxyXG4gIHtcclxuICAgIGQzLnNlbGVjdCgnYm9keScpLm9uKCdrZXlkb3duLmJhc2ljSW5wdXQnLG51bGwpO1xyXG4gICAgZDMuc2VsZWN0KCdib2R5Jykub24oJ2tleXVwLmJhc2ljSW5wdXQnLG51bGwpO1xyXG4gIH1cclxuICBcclxuICBnZXQgdXAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5rZXlDaGVjay51cCB8fCAodGhpcy5nYW1lcGFkICYmICh0aGlzLmdhbWVwYWQuYnV0dG9uc1sxMl0ucHJlc3NlZCB8fCB0aGlzLmdhbWVwYWQuYXhlc1sxXSA8IC0wLjEpKTtcclxuICB9XHJcblxyXG4gIGdldCBkb3duKCkge1xyXG4gICAgcmV0dXJuIHRoaXMua2V5Q2hlY2suZG93biB8fCAodGhpcy5nYW1lcGFkICYmICh0aGlzLmdhbWVwYWQuYnV0dG9uc1sxM10ucHJlc3NlZCB8fCB0aGlzLmdhbWVwYWQuYXhlc1sxXSA+IDAuMSkpO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGxlZnQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5rZXlDaGVjay5sZWZ0IHx8ICh0aGlzLmdhbWVwYWQgJiYgKHRoaXMuZ2FtZXBhZC5idXR0b25zWzE0XS5wcmVzc2VkIHx8IHRoaXMuZ2FtZXBhZC5heGVzWzBdIDwgLTAuMSkpO1xyXG4gIH1cclxuXHJcbiAgZ2V0IHJpZ2h0KCkge1xyXG4gICAgcmV0dXJuIHRoaXMua2V5Q2hlY2sucmlnaHQgfHwgKHRoaXMuZ2FtZXBhZCAmJiAodGhpcy5nYW1lcGFkLmJ1dHRvbnNbMTVdLnByZXNzZWQgfHwgdGhpcy5nYW1lcGFkLmF4ZXNbMF0gPiAwLjEpKTtcclxuICB9XHJcbiAgXHJcbiAgZ2V0IHooKSB7XHJcbiAgICAgbGV0IHJldCA9IHRoaXMua2V5Q2hlY2sueiBcclxuICAgIHx8ICgoKCF0aGlzLnpCdXR0b24gfHwgKHRoaXMuekJ1dHRvbiAmJiAhdGhpcy56QnV0dG9uKSApICYmIHRoaXMuZ2FtZXBhZCAmJiB0aGlzLmdhbWVwYWQuYnV0dG9uc1swXS5wcmVzc2VkKSkgO1xyXG4gICAgdGhpcy56QnV0dG9uID0gdGhpcy5nYW1lcGFkICYmIHRoaXMuZ2FtZXBhZC5idXR0b25zWzBdLnByZXNzZWQ7XHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH1cclxuICBcclxuICBnZXQgc3RhcnQoKSB7XHJcbiAgICBsZXQgcmV0ID0gKCghdGhpcy5zdGFydEJ1dHRvbl8gfHwgKHRoaXMuc3RhcnRCdXR0b25fICYmICF0aGlzLnN0YXJ0QnV0dG9uXykgKSAmJiB0aGlzLmdhbWVwYWQgJiYgdGhpcy5nYW1lcGFkLmJ1dHRvbnNbOV0ucHJlc3NlZCkgO1xyXG4gICAgdGhpcy5zdGFydEJ1dHRvbl8gPSB0aGlzLmdhbWVwYWQgJiYgdGhpcy5nYW1lcGFkLmJ1dHRvbnNbOV0ucHJlc3NlZDtcclxuICAgIHJldHVybiByZXQ7XHJcbiAgfVxyXG4gIFxyXG4gIGdldCBhQnV0dG9uKCl7XHJcbiAgICAgbGV0IHJldCA9ICgoKCF0aGlzLmFCdXR0b25fIHx8ICh0aGlzLmFCdXR0b25fICYmICF0aGlzLmFCdXR0b25fKSApICYmIHRoaXMuZ2FtZXBhZCAmJiB0aGlzLmdhbWVwYWQuYnV0dG9uc1swXS5wcmVzc2VkKSkgO1xyXG4gICAgdGhpcy5hQnV0dG9uXyA9IHRoaXMuZ2FtZXBhZCAmJiB0aGlzLmdhbWVwYWQuYnV0dG9uc1swXS5wcmVzc2VkO1xyXG4gICAgcmV0dXJuIHJldDtcclxuICB9XHJcbiAgXHJcbiAgKnVwZGF0ZSh0YXNrSW5kZXgpXHJcbiAge1xyXG4gICAgd2hpbGUodGFza0luZGV4ID49IDApe1xyXG4gICAgICBpZih3aW5kb3cubmF2aWdhdG9yLmdldEdhbWVwYWRzKXtcclxuICAgICAgICB0aGlzLmdhbWVwYWQgPSB3aW5kb3cubmF2aWdhdG9yLmdldEdhbWVwYWRzKClbMF07XHJcbiAgICAgIH0gXHJcbiAgICAgIHRhc2tJbmRleCA9IHlpZWxkOyAgICAgXHJcbiAgICB9XHJcbiAgfVxyXG59IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5pbXBvcnQgKiBhcyBzZmcgZnJvbSAnLi9nbG9iYWwnO1xyXG5pbXBvcnQgKiBhcyBnYW1lb2JqIGZyb20gJy4vZ2FtZW9iaic7XHJcbmltcG9ydCAqIGFzIGdyYXBoaWNzIGZyb20gJy4vZ3JhcGhpY3MnO1xyXG5cclxudmFyIG15QnVsbGV0cyA9IFtdO1xyXG5cclxuLy8vIOiHquapn+W8viBcclxuZXhwb3J0IGNsYXNzIE15QnVsbGV0IGV4dGVuZHMgZ2FtZW9iai5HYW1lT2JqIHtcclxuICBjb25zdHJ1Y3RvcihzY2VuZSxzZSkge1xyXG4gIHN1cGVyKDAsIDAsIDApO1xyXG5cclxuICB0aGlzLmNvbGxpc2lvbkFyZWEud2lkdGggPSA0O1xyXG4gIHRoaXMuY29sbGlzaW9uQXJlYS5oZWlnaHQgPSA2O1xyXG4gIHRoaXMuc3BlZWQgPSA4O1xyXG4gIHRoaXMucG93ZXIgPSAxO1xyXG5cclxuICB0aGlzLnRleHR1cmVXaWR0aCA9IHNmZy50ZXh0dXJlRmlsZXMubXlzaGlwLmltYWdlLndpZHRoO1xyXG4gIHRoaXMudGV4dHVyZUhlaWdodCA9IHNmZy50ZXh0dXJlRmlsZXMubXlzaGlwLmltYWdlLmhlaWdodDtcclxuXHJcbiAgLy8g44Oh44OD44K344Ol44Gu5L2c5oiQ44O76KGo56S6IC8vL1xyXG5cclxuICB2YXIgbWF0ZXJpYWwgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVNYXRlcmlhbChzZmcudGV4dHVyZUZpbGVzLm15c2hpcCk7XHJcbiAgdmFyIGdlb21ldHJ5ID0gZ3JhcGhpY3MuY3JlYXRlU3ByaXRlR2VvbWV0cnkoMTYpO1xyXG4gIGdyYXBoaWNzLmNyZWF0ZVNwcml0ZVVWKGdlb21ldHJ5LCBzZmcudGV4dHVyZUZpbGVzLm15c2hpcCwgMTYsIDE2LCAxKTtcclxuICB0aGlzLm1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG5cclxuICB0aGlzLm1lc2gucG9zaXRpb24ueCA9IHRoaXMueF87XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnkgPSB0aGlzLnlfO1xyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi56ID0gdGhpcy56XztcclxuICB0aGlzLnNlID0gc2U7XHJcbiAgLy9zZSgwKTtcclxuICAvL3NlcXVlbmNlci5wbGF5VHJhY2tzKHNvdW5kRWZmZWN0cy5zb3VuZEVmZmVjdHNbMF0pO1xyXG4gIHNjZW5lLmFkZCh0aGlzLm1lc2gpO1xyXG4gIHRoaXMubWVzaC52aXNpYmxlID0gdGhpcy5lbmFibGVfID0gZmFsc2U7XHJcbiAgLy8gIHNmZy50YXNrcy5wdXNoVGFzayhmdW5jdGlvbiAodGFza0luZGV4KSB7IHNlbGYubW92ZSh0YXNrSW5kZXgpOyB9KTtcclxuIH1cclxuXHJcbiAgZ2V0IHgoKSB7IHJldHVybiB0aGlzLnhfOyB9XHJcbiAgc2V0IHgodikgeyB0aGlzLnhfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnggPSB2OyB9XHJcbiAgZ2V0IHkoKSB7IHJldHVybiB0aGlzLnlfOyB9XHJcbiAgc2V0IHkodikgeyB0aGlzLnlfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnkgPSB2OyB9XHJcbiAgZ2V0IHooKSB7IHJldHVybiB0aGlzLnpfOyB9XHJcbiAgc2V0IHoodikgeyB0aGlzLnpfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnogPSB2OyB9XHJcbiAgKm1vdmUodGFza0luZGV4KSB7XHJcbiAgICBcclxuICAgIHdoaWxlICh0YXNrSW5kZXggPj0gMCBcclxuICAgICAgJiYgdGhpcy5lbmFibGVfXHJcbiAgICAgICYmIHRoaXMueSA8PSAoc2ZnLlZfVE9QICsgMTYpIFxyXG4gICAgICAmJiB0aGlzLnkgPj0gKHNmZy5WX0JPVFRPTSAtIDE2KSBcclxuICAgICAgJiYgdGhpcy54IDw9IChzZmcuVl9SSUdIVCArIDE2KSBcclxuICAgICAgJiYgdGhpcy54ID49IChzZmcuVl9MRUZUIC0gMTYpKVxyXG4gICAge1xyXG4gICAgICBcclxuICAgICAgdGhpcy55ICs9IHRoaXMuZHk7XHJcbiAgICAgIHRoaXMueCArPSB0aGlzLmR4O1xyXG4gICAgICBcclxuICAgICAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgICB9XHJcblxyXG4gICAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgICBzZmcudGFza3MucmVtb3ZlVGFzayh0YXNrSW5kZXgpO1xyXG4gICAgdGhpcy5lbmFibGVfID0gdGhpcy5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxufVxyXG5cclxuICBzdGFydCh4LCB5LCB6LCBhaW1SYWRpYW4scG93ZXIpIHtcclxuICAgIGlmICh0aGlzLmVuYWJsZV8pIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgdGhpcy54ID0geDtcclxuICAgIHRoaXMueSA9IHk7XHJcbiAgICB0aGlzLnogPSB6IC0gMC4xO1xyXG4gICAgdGhpcy5wb3dlciA9IHBvd2VyIHwgMTtcclxuICAgIHRoaXMuZHggPSBNYXRoLmNvcyhhaW1SYWRpYW4pICogdGhpcy5zcGVlZDtcclxuICAgIHRoaXMuZHkgPSBNYXRoLnNpbihhaW1SYWRpYW4pICogdGhpcy5zcGVlZDtcclxuICAgIHRoaXMuZW5hYmxlXyA9IHRoaXMubWVzaC52aXNpYmxlID0gdHJ1ZTtcclxuICAgIHRoaXMuc2UoMCk7XHJcbiAgICAvL3NlcXVlbmNlci5wbGF5VHJhY2tzKHNvdW5kRWZmZWN0cy5zb3VuZEVmZmVjdHNbMF0pO1xyXG4gICAgdGhpcy50YXNrID0gc2ZnLnRhc2tzLnB1c2hUYXNrKHRoaXMubW92ZS5iaW5kKHRoaXMpKTtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOiHquapn+OCquODluOCuOOCp+OCr+ODiFxyXG5leHBvcnQgY2xhc3MgTXlTaGlwIGV4dGVuZHMgZ2FtZW9iai5HYW1lT2JqIHsgXHJcbiAgY29uc3RydWN0b3IoeCwgeSwgeixzY2VuZSxzZSkge1xyXG4gIHN1cGVyKHgsIHksIHopOy8vIGV4dGVuZFxyXG5cclxuICB0aGlzLmNvbGxpc2lvbkFyZWEud2lkdGggPSA2O1xyXG4gIHRoaXMuY29sbGlzaW9uQXJlYS5oZWlnaHQgPSA4O1xyXG4gIHRoaXMuc2UgPSBzZTtcclxuICB0aGlzLnNjZW5lID0gc2NlbmU7XHJcbiAgdGhpcy50ZXh0dXJlV2lkdGggPSBzZmcudGV4dHVyZUZpbGVzLm15c2hpcC5pbWFnZS53aWR0aDtcclxuICB0aGlzLnRleHR1cmVIZWlnaHQgPSBzZmcudGV4dHVyZUZpbGVzLm15c2hpcC5pbWFnZS5oZWlnaHQ7XHJcbiAgdGhpcy53aWR0aCA9IDE2O1xyXG4gIHRoaXMuaGVpZ2h0ID0gMTY7XHJcblxyXG4gIC8vIOenu+WLleevhOWbsuOCkuaxguOCgeOCi1xyXG4gIHRoaXMudG9wID0gKHNmZy5WX1RPUCAtIHRoaXMuaGVpZ2h0IC8gMikgfCAwO1xyXG4gIHRoaXMuYm90dG9tID0gKHNmZy5WX0JPVFRPTSArIHRoaXMuaGVpZ2h0IC8gMikgfCAwO1xyXG4gIHRoaXMubGVmdCA9IChzZmcuVl9MRUZUICsgdGhpcy53aWR0aCAvIDIpIHwgMDtcclxuICB0aGlzLnJpZ2h0ID0gKHNmZy5WX1JJR0hUIC0gdGhpcy53aWR0aCAvIDIpIHwgMDtcclxuXHJcbiAgLy8g44Oh44OD44K344Ol44Gu5L2c5oiQ44O76KGo56S6XHJcbiAgLy8g44Oe44OG44Oq44Ki44Or44Gu5L2c5oiQXHJcbiAgdmFyIG1hdGVyaWFsID0gZ3JhcGhpY3MuY3JlYXRlU3ByaXRlTWF0ZXJpYWwoc2ZnLnRleHR1cmVGaWxlcy5teXNoaXApO1xyXG4gIC8vIOOCuOOCquODoeODiOODquOBruS9nOaIkFxyXG4gIHZhciBnZW9tZXRyeSA9IGdyYXBoaWNzLmNyZWF0ZVNwcml0ZUdlb21ldHJ5KHRoaXMud2lkdGgpO1xyXG4gIGdyYXBoaWNzLmNyZWF0ZVNwcml0ZVVWKGdlb21ldHJ5LCBzZmcudGV4dHVyZUZpbGVzLm15c2hpcCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIDApO1xyXG5cclxuICB0aGlzLm1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG5cclxuICB0aGlzLm1lc2gucG9zaXRpb24ueCA9IHRoaXMueF87XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnkgPSB0aGlzLnlfO1xyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi56ID0gdGhpcy56XztcclxuICB0aGlzLnJlc3QgPSAzO1xyXG4gIHRoaXMubXlCdWxsZXRzID0gKCAoKT0+IHtcclxuICAgIHZhciBhcnIgPSBbXTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMjsgKytpKSB7XHJcbiAgICAgIGFyci5wdXNoKG5ldyBNeUJ1bGxldCh0aGlzLnNjZW5lLHRoaXMuc2UpKTtcclxuICAgIH1cclxuICAgIHJldHVybiBhcnI7XHJcbiAgfSkoKTtcclxuICBzY2VuZS5hZGQodGhpcy5tZXNoKTtcclxuICBcclxuICB0aGlzLmJ1bGxldFBvd2VyID0gMTtcclxuXHJcbn1cclxuICBnZXQgeCgpIHsgcmV0dXJuIHRoaXMueF87IH1cclxuICBzZXQgeCh2KSB7IHRoaXMueF8gPSB0aGlzLm1lc2gucG9zaXRpb24ueCA9IHY7IH1cclxuICBnZXQgeSgpIHsgcmV0dXJuIHRoaXMueV87IH1cclxuICBzZXQgeSh2KSB7IHRoaXMueV8gPSB0aGlzLm1lc2gucG9zaXRpb24ueSA9IHY7IH1cclxuICBnZXQgeigpIHsgcmV0dXJuIHRoaXMuel87IH1cclxuICBzZXQgeih2KSB7IHRoaXMuel8gPSB0aGlzLm1lc2gucG9zaXRpb24ueiA9IHY7IH1cclxuICBcclxuICBzaG9vdChhaW1SYWRpYW4pIHtcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0aGlzLm15QnVsbGV0cy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgICBpZiAodGhpcy5teUJ1bGxldHNbaV0uc3RhcnQodGhpcy54LCB0aGlzLnkgLCB0aGlzLnosYWltUmFkaWFuLHRoaXMuYnVsbGV0UG93ZXIpKSB7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgYWN0aW9uKGJhc2ljSW5wdXQpIHtcclxuICAgIGlmIChiYXNpY0lucHV0LmxlZnQpIHtcclxuICAgICAgaWYgKHRoaXMueCA+IHRoaXMubGVmdCkge1xyXG4gICAgICAgIHRoaXMueCAtPSAyO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGJhc2ljSW5wdXQucmlnaHQpIHtcclxuICAgICAgaWYgKHRoaXMueCA8IHRoaXMucmlnaHQpIHtcclxuICAgICAgICB0aGlzLnggKz0gMjtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChiYXNpY0lucHV0LnVwKSB7XHJcbiAgICAgIGlmICh0aGlzLnkgPCB0aGlzLnRvcCkge1xyXG4gICAgICAgIHRoaXMueSArPSAyO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGJhc2ljSW5wdXQuZG93bikge1xyXG4gICAgICBpZiAodGhpcy55ID4gdGhpcy5ib3R0b20pIHtcclxuICAgICAgICB0aGlzLnkgLT0gMjtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBpZiAoYmFzaWNJbnB1dC56KSB7XHJcbiAgICAgIGJhc2ljSW5wdXQua2V5Q2hlY2sueiA9IGZhbHNlO1xyXG4gICAgICB0aGlzLnNob290KDAuNSAqIE1hdGguUEkpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChiYXNpY0lucHV0LngpIHtcclxuICAgICAgYmFzaWNJbnB1dC5rZXlDaGVjay54ID0gZmFsc2U7XHJcbiAgICAgIHRoaXMuc2hvb3QoMS41ICogTWF0aC5QSSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIGhpdCgpIHtcclxuICAgIHRoaXMubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICBzZmcuYm9tYnMuc3RhcnQodGhpcy54LCB0aGlzLnksIDAuMik7XHJcbiAgICB0aGlzLnNlKDQpO1xyXG4gIH1cclxuICBcclxuICByZXNldCgpe1xyXG4gICAgdGhpcy5teUJ1bGxldHMuZm9yRWFjaCgoZCk9PntcclxuICAgICAgaWYoZC5lbmFibGVfKXtcclxuICAgICAgICB3aGlsZSghc2ZnLnRhc2tzLmFycmF5W2QudGFzay5pbmRleF0uZ2VuSW5zdC5uZXh0KC0oMSArIGQudGFzay5pbmRleCkpLmRvbmUpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcbiAgXHJcbiAgaW5pdCgpe1xyXG4gICAgICB0aGlzLnggPSAwO1xyXG4gICAgICB0aGlzLnkgPSAtMTAwO1xyXG4gICAgICB0aGlzLnogPSAwLjE7XHJcbiAgICAgIHRoaXMubWVzaC52aXNpYmxlID0gdHJ1ZTtcclxuICB9XHJcblxyXG59IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmltcG9ydCAqIGFzIHNmZyBmcm9tICcuL2dsb2JhbCc7XHJcbi8vaW1wb3J0ICogIGFzIGdhbWVvYmogZnJvbSAnLi9nYW1lb2JqJztcclxuLy9pbXBvcnQgKiBhcyBncmFwaGljcyBmcm9tICcuL2dyYXBoaWNzJztcclxuXHJcbi8vLyDjg4bjgq3jgrnjg4jlsZ7mgKdcclxuZXhwb3J0IGNsYXNzIFRleHRBdHRyaWJ1dGUge1xyXG4gIGNvbnN0cnVjdG9yKGJsaW5rLCBmb250KSB7XHJcbiAgICBpZiAoYmxpbmspIHtcclxuICAgICAgdGhpcy5ibGluayA9IGJsaW5rO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5ibGluayA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgaWYgKGZvbnQpIHtcclxuICAgICAgdGhpcy5mb250ID0gZm9udDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuZm9udCA9IHNmZy50ZXh0dXJlRmlsZXMuZm9udDtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8vLyDjg4bjgq3jgrnjg4jjg5fjg6zjg7zjg7NcclxuZXhwb3J0IGNsYXNzIFRleHRQbGFuZXsgXHJcbiAgY29uc3RydWN0b3IgKHNjZW5lKSB7XHJcbiAgdGhpcy50ZXh0QnVmZmVyID0gbmV3IEFycmF5KHNmZy5URVhUX0hFSUdIVCk7XHJcbiAgdGhpcy5hdHRyQnVmZmVyID0gbmV3IEFycmF5KHNmZy5URVhUX0hFSUdIVCk7XHJcbiAgdGhpcy50ZXh0QmFja0J1ZmZlciA9IG5ldyBBcnJheShzZmcuVEVYVF9IRUlHSFQpO1xyXG4gIHRoaXMuYXR0ckJhY2tCdWZmZXIgPSBuZXcgQXJyYXkoc2ZnLlRFWFRfSEVJR0hUKTtcclxuICB2YXIgZW5kaSA9IHRoaXMudGV4dEJ1ZmZlci5sZW5ndGg7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbmRpOyArK2kpIHtcclxuICAgIHRoaXMudGV4dEJ1ZmZlcltpXSA9IG5ldyBBcnJheShzZmcuVEVYVF9XSURUSCk7XHJcbiAgICB0aGlzLmF0dHJCdWZmZXJbaV0gPSBuZXcgQXJyYXkoc2ZnLlRFWFRfV0lEVEgpO1xyXG4gICAgdGhpcy50ZXh0QmFja0J1ZmZlcltpXSA9IG5ldyBBcnJheShzZmcuVEVYVF9XSURUSCk7XHJcbiAgICB0aGlzLmF0dHJCYWNrQnVmZmVyW2ldID0gbmV3IEFycmF5KHNmZy5URVhUX1dJRFRIKTtcclxuICB9XHJcblxyXG5cclxuICAvLyDmj4/nlLvnlKjjgq3jg6Pjg7Pjg5Djgrnjga7jgrvjg4Pjg4jjgqLjg4Pjg5dcclxuXHJcbiAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICB2YXIgd2lkdGggPSAxO1xyXG4gIHdoaWxlICh3aWR0aCA8PSBzZmcuVklSVFVBTF9XSURUSCl7XHJcbiAgICB3aWR0aCAqPSAyO1xyXG4gIH1cclxuICB2YXIgaGVpZ2h0ID0gMTtcclxuICB3aGlsZSAoaGVpZ2h0IDw9IHNmZy5WSVJUVUFMX0hFSUdIVCl7XHJcbiAgICBoZWlnaHQgKj0gMjtcclxuICB9XHJcbiAgXHJcbiAgdGhpcy5jYW52YXMud2lkdGggPSB3aWR0aDtcclxuICB0aGlzLmNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gIHRoaXMudGV4dHVyZSA9IG5ldyBUSFJFRS5UZXh0dXJlKHRoaXMuY2FudmFzKTtcclxuICB0aGlzLnRleHR1cmUubWFnRmlsdGVyID0gVEhSRUUuTmVhcmVzdEZpbHRlcjtcclxuICB0aGlzLnRleHR1cmUubWluRmlsdGVyID0gVEhSRUUuTGluZWFyTWlwTWFwTGluZWFyRmlsdGVyO1xyXG4gIHRoaXMubWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBtYXA6IHRoaXMudGV4dHVyZSxhbHBoYVRlc3Q6MC41LCB0cmFuc3BhcmVudDogdHJ1ZSxkZXB0aFRlc3Q6dHJ1ZSxzaGFkaW5nOlRIUkVFLkZsYXRTaGFkaW5nfSk7XHJcbi8vICB0aGlzLmdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoc2ZnLlZJUlRVQUxfV0lEVEgsIHNmZy5WSVJUVUFMX0hFSUdIVCk7XHJcbiAgdGhpcy5nZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KHdpZHRoLCBoZWlnaHQpO1xyXG4gIHRoaXMubWVzaCA9IG5ldyBUSFJFRS5NZXNoKHRoaXMuZ2VvbWV0cnksIHRoaXMubWF0ZXJpYWwpO1xyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi56ID0gMC40O1xyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi54ID0gKHdpZHRoIC0gc2ZnLlZJUlRVQUxfV0lEVEgpIC8gMjtcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueSA9ICAtIChoZWlnaHQgLSBzZmcuVklSVFVBTF9IRUlHSFQpIC8gMjtcclxuICB0aGlzLmZvbnRzID0geyBmb250OiBzZmcudGV4dHVyZUZpbGVzLmZvbnQsIGZvbnQxOiBzZmcudGV4dHVyZUZpbGVzLmZvbnQxIH07XHJcbiAgdGhpcy5ibGlua0NvdW50ID0gMDtcclxuICB0aGlzLmJsaW5rID0gZmFsc2U7XHJcblxyXG4gIC8vIOOCueODoOODvOOCuOODs+OCsOOCkuWIh+OCi1xyXG4gIHRoaXMuY3R4Lm1zSW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgdGhpcy5jdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgLy90aGlzLmN0eC53ZWJraXRJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICB0aGlzLmN0eC5tb3pJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuXHJcbiAgdGhpcy5jbHMoKTtcclxuICBzY2VuZS5hZGQodGhpcy5tZXNoKTtcclxufVxyXG5cclxuICAvLy8g55S76Z2i5raI5Y67XHJcbiAgY2xzKCkge1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZGkgPSB0aGlzLnRleHRCdWZmZXIubGVuZ3RoOyBpIDwgZW5kaTsgKytpKSB7XHJcbiAgICAgIHZhciBsaW5lID0gdGhpcy50ZXh0QnVmZmVyW2ldO1xyXG4gICAgICB2YXIgYXR0cl9saW5lID0gdGhpcy5hdHRyQnVmZmVyW2ldO1xyXG4gICAgICB2YXIgbGluZV9iYWNrID0gdGhpcy50ZXh0QmFja0J1ZmZlcltpXTtcclxuICAgICAgdmFyIGF0dHJfbGluZV9iYWNrID0gdGhpcy5hdHRyQmFja0J1ZmZlcltpXTtcclxuXHJcbiAgICAgIGZvciAodmFyIGogPSAwLCBlbmRqID0gdGhpcy50ZXh0QnVmZmVyW2ldLmxlbmd0aDsgaiA8IGVuZGo7ICsraikge1xyXG4gICAgICAgIGxpbmVbal0gPSAweDIwO1xyXG4gICAgICAgIGF0dHJfbGluZVtqXSA9IDB4MDA7XHJcbiAgICAgICAgLy9saW5lX2JhY2tbal0gPSAweDIwO1xyXG4gICAgICAgIC8vYXR0cl9saW5lX2JhY2tbal0gPSAweDAwO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgc2ZnLlZJUlRVQUxfV0lEVEgsIHNmZy5WSVJUVUFMX0hFSUdIVCk7XHJcbiAgfVxyXG5cclxuICAvLy8g5paH5a2X6KGo56S644GZ44KLXHJcbiAgcHJpbnQoeCwgeSwgc3RyLCBhdHRyaWJ1dGUpIHtcclxuICAgIHZhciBsaW5lID0gdGhpcy50ZXh0QnVmZmVyW3ldO1xyXG4gICAgdmFyIGF0dHIgPSB0aGlzLmF0dHJCdWZmZXJbeV07XHJcbiAgICBpZiAoIWF0dHJpYnV0ZSkge1xyXG4gICAgICBhdHRyaWJ1dGUgPSAwO1xyXG4gICAgfVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyArK2kpIHtcclxuICAgICAgdmFyIGMgPSBzdHIuY2hhckNvZGVBdChpKTtcclxuICAgICAgaWYgKGMgPT0gMHhhKSB7XHJcbiAgICAgICAgKyt5O1xyXG4gICAgICAgIGlmICh5ID49IHRoaXMudGV4dEJ1ZmZlci5sZW5ndGgpIHtcclxuICAgICAgICAgIC8vIOOCueOCr+ODreODvOODq1xyXG4gICAgICAgICAgdGhpcy50ZXh0QnVmZmVyID0gdGhpcy50ZXh0QnVmZmVyLnNsaWNlKDEsIHRoaXMudGV4dEJ1ZmZlci5sZW5ndGggLSAxKTtcclxuICAgICAgICAgIHRoaXMudGV4dEJ1ZmZlci5wdXNoKG5ldyBBcnJheShzZmcuVklSVFVBTF9XSURUSCAvIDgpKTtcclxuICAgICAgICAgIHRoaXMuYXR0ckJ1ZmZlciA9IHRoaXMuYXR0ckJ1ZmZlci5zbGljZSgxLCB0aGlzLmF0dHJCdWZmZXIubGVuZ3RoIC0gMSk7XHJcbiAgICAgICAgICB0aGlzLmF0dHJCdWZmZXIucHVzaChuZXcgQXJyYXkoc2ZnLlZJUlRVQUxfV0lEVEggLyA4KSk7XHJcbiAgICAgICAgICAtLXk7XHJcbiAgICAgICAgICB2YXIgZW5kaiA9IHRoaXMudGV4dEJ1ZmZlclt5XS5sZW5ndGg7XHJcbiAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGVuZGo7ICsraikge1xyXG4gICAgICAgICAgICB0aGlzLnRleHRCdWZmZXJbeV1bal0gPSAweDIwO1xyXG4gICAgICAgICAgICB0aGlzLmF0dHJCdWZmZXJbeV1bal0gPSAweDAwO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBsaW5lID0gdGhpcy50ZXh0QnVmZmVyW3ldO1xyXG4gICAgICAgIGF0dHIgPSB0aGlzLmF0dHJCdWZmZXJbeV07XHJcbiAgICAgICAgeCA9IDA7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGluZVt4XSA9IGM7XHJcbiAgICAgICAgYXR0clt4XSA9IGF0dHJpYnV0ZTtcclxuICAgICAgICArK3g7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgLy8vIOODhuOCreOCueODiOODh+ODvOOCv+OCkuOCguOBqOOBq+ODhuOCr+OCueODgeODo+ODvOOBq+aPj+eUu+OBmeOCi1xyXG4gIHJlbmRlcigpIHtcclxuICAgIHZhciBjdHggPSB0aGlzLmN0eDtcclxuICAgIHRoaXMuYmxpbmtDb3VudCA9ICh0aGlzLmJsaW5rQ291bnQgKyAxKSAmIDB4ZjtcclxuXHJcbiAgICB2YXIgZHJhd19ibGluayA9IGZhbHNlO1xyXG4gICAgaWYgKCF0aGlzLmJsaW5rQ291bnQpIHtcclxuICAgICAgdGhpcy5ibGluayA9ICF0aGlzLmJsaW5rO1xyXG4gICAgICBkcmF3X2JsaW5rID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIHZhciB1cGRhdGUgPSBmYWxzZTtcclxuLy8gICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBDT05TT0xFX1dJRFRILCBDT05TT0xFX0hFSUdIVCk7XHJcbi8vICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcblxyXG4gICAgZm9yICh2YXIgeSA9IDAsIGd5ID0gMDsgeSA8IHNmZy5URVhUX0hFSUdIVDsgKyt5LCBneSArPSBzZmcuQUNUVUFMX0NIQVJfU0laRSkge1xyXG4gICAgICB2YXIgbGluZSA9IHRoaXMudGV4dEJ1ZmZlclt5XTtcclxuICAgICAgdmFyIGF0dHJfbGluZSA9IHRoaXMuYXR0ckJ1ZmZlclt5XTtcclxuICAgICAgdmFyIGxpbmVfYmFjayA9IHRoaXMudGV4dEJhY2tCdWZmZXJbeV07XHJcbiAgICAgIHZhciBhdHRyX2xpbmVfYmFjayA9IHRoaXMuYXR0ckJhY2tCdWZmZXJbeV07XHJcbiAgICAgIGZvciAodmFyIHggPSAwLCBneCA9IDA7IHggPCBzZmcuVEVYVF9XSURUSDsgKyt4LCBneCArPSBzZmcuQUNUVUFMX0NIQVJfU0laRSkge1xyXG4gICAgICAgIHZhciBwcm9jZXNzX2JsaW5rID0gKGF0dHJfbGluZVt4XSAmJiBhdHRyX2xpbmVbeF0uYmxpbmspO1xyXG4gICAgICAgIGlmIChsaW5lW3hdICE9IGxpbmVfYmFja1t4XSB8fCBhdHRyX2xpbmVbeF0gIT0gYXR0cl9saW5lX2JhY2tbeF0gfHwgKHByb2Nlc3NfYmxpbmsgJiYgZHJhd19ibGluaykpIHtcclxuICAgICAgICAgIHVwZGF0ZSA9IHRydWU7XHJcblxyXG4gICAgICAgICAgbGluZV9iYWNrW3hdID0gbGluZVt4XTtcclxuICAgICAgICAgIGF0dHJfbGluZV9iYWNrW3hdID0gYXR0cl9saW5lW3hdO1xyXG4gICAgICAgICAgdmFyIGMgPSAwO1xyXG4gICAgICAgICAgaWYgKCFwcm9jZXNzX2JsaW5rIHx8IHRoaXMuYmxpbmspIHtcclxuICAgICAgICAgICAgYyA9IGxpbmVbeF0gLSAweDIwO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdmFyIHlwb3MgPSAoYyA+PiA0KSA8PCAzO1xyXG4gICAgICAgICAgdmFyIHhwb3MgPSAoYyAmIDB4ZikgPDwgMztcclxuICAgICAgICAgIGN0eC5jbGVhclJlY3QoZ3gsIGd5LCBzZmcuQUNUVUFMX0NIQVJfU0laRSwgc2ZnLkFDVFVBTF9DSEFSX1NJWkUpO1xyXG4gICAgICAgICAgdmFyIGZvbnQgPSBhdHRyX2xpbmVbeF0gPyBhdHRyX2xpbmVbeF0uZm9udCA6IHNmZy50ZXh0dXJlRmlsZXMuZm9udDtcclxuICAgICAgICAgIGlmIChjKSB7XHJcbiAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoZm9udC5pbWFnZSwgeHBvcywgeXBvcywgc2ZnLkNIQVJfU0laRSwgc2ZnLkNIQVJfU0laRSwgZ3gsIGd5LCBzZmcuQUNUVUFMX0NIQVJfU0laRSwgc2ZnLkFDVFVBTF9DSEFSX1NJWkUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy50ZXh0dXJlLm5lZWRzVXBkYXRlID0gdXBkYXRlO1xyXG4gIH1cclxufVxyXG4iLCJcclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbmltcG9ydCAqIGFzIHNmZyBmcm9tICcuL2dsb2JhbCc7XHJcbmltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSAnLi9ldmVudEVtaXR0ZXIzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBUYXNrIHtcclxuICBjb25zdHJ1Y3RvcihnZW5JbnN0LHByaW9yaXR5KSB7XHJcbiAgICB0aGlzLnByaW9yaXR5ID0gcHJpb3JpdHkgfHwgMTAwMDA7XHJcbiAgICB0aGlzLmdlbkluc3QgPSBnZW5JbnN0O1xyXG4gICAgLy8g5Yid5pyf5YyWXHJcbiAgICB0aGlzLmluZGV4ID0gMDtcclxuICB9XHJcbiAgXHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgbnVsbFRhc2sgPSBuZXcgVGFzaygoZnVuY3Rpb24qKCl7fSkoKSk7XHJcblxyXG4vLy8g44K/44K544Kv566h55CGXHJcbmV4cG9ydCBjbGFzcyBUYXNrcyBleHRlbmRzIEV2ZW50RW1pdHRlciB7XHJcbiAgY29uc3RydWN0b3IoKXtcclxuICAgIHN1cGVyKCk7XHJcbiAgICB0aGlzLmFycmF5ID0gbmV3IEFycmF5KDApO1xyXG4gICAgdGhpcy5uZWVkU29ydCA9IGZhbHNlO1xyXG4gICAgdGhpcy5uZWVkQ29tcHJlc3MgPSBmYWxzZTtcclxuICAgIHRoaXMuZW5hYmxlID0gdHJ1ZTtcclxuICAgIHRoaXMuc3RvcHBlZCA9IGZhbHNlO1xyXG4gIH1cclxuICAvLyBpbmRleOOBruS9jee9ruOBruOCv+OCueOCr+OCkue9ruOBjeaPm+OBiOOCi1xyXG4gIHNldE5leHRUYXNrKGluZGV4LCBnZW5JbnN0LCBwcmlvcml0eSkgXHJcbiAge1xyXG4gICAgaWYoaW5kZXggPCAwKXtcclxuICAgICAgaW5kZXggPSAtKCsraW5kZXgpO1xyXG4gICAgfVxyXG4gICAgaWYodGhpcy5hcnJheVtpbmRleF0ucHJpb3JpdHkgPT0gMTAwMDAwKXtcclxuICAgICAgZGVidWdnZXI7XHJcbiAgICB9XHJcbiAgICB2YXIgdCA9IG5ldyBUYXNrKGdlbkluc3QoaW5kZXgpLCBwcmlvcml0eSk7XHJcbiAgICB0LmluZGV4ID0gaW5kZXg7XHJcbiAgICB0aGlzLmFycmF5W2luZGV4XSA9IHQ7XHJcbiAgICB0aGlzLm5lZWRTb3J0ID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIHB1c2hUYXNrKGdlbkluc3QsIHByaW9yaXR5KSB7XHJcbiAgICBsZXQgdDtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5hcnJheS5sZW5ndGg7ICsraSkge1xyXG4gICAgICBpZiAodGhpcy5hcnJheVtpXSA9PSBudWxsVGFzaykge1xyXG4gICAgICAgIHQgPSBuZXcgVGFzayhnZW5JbnN0KGkpLCBwcmlvcml0eSk7XHJcbiAgICAgICAgdGhpcy5hcnJheVtpXSA9IHQ7XHJcbiAgICAgICAgdC5pbmRleCA9IGk7XHJcbiAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHQgPSBuZXcgVGFzayhnZW5JbnN0KHRoaXMuYXJyYXkubGVuZ3RoKSxwcmlvcml0eSk7XHJcbiAgICB0LmluZGV4ID0gdGhpcy5hcnJheS5sZW5ndGg7XHJcbiAgICB0aGlzLmFycmF5W3RoaXMuYXJyYXkubGVuZ3RoXSA9IHQ7XHJcbiAgICB0aGlzLm5lZWRTb3J0ID0gdHJ1ZTtcclxuICAgIHJldHVybiB0O1xyXG4gIH1cclxuXHJcbiAgLy8g6YWN5YiX44KS5Y+W5b6X44GZ44KLXHJcbiAgZ2V0QXJyYXkoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5hcnJheTtcclxuICB9XHJcbiAgLy8g44K/44K544Kv44KS44Kv44Oq44Ki44GZ44KLXHJcbiAgY2xlYXIoKSB7XHJcbiAgICB0aGlzLmFycmF5Lmxlbmd0aCA9IDA7XHJcbiAgfVxyXG4gIC8vIOOCveODvOODiOOBjOW/heimgeOBi+ODgeOCp+ODg+OCr+OBl+OAgeOCveODvOODiOOBmeOCi1xyXG4gIGNoZWNrU29ydCgpIHtcclxuICAgIGlmICh0aGlzLm5lZWRTb3J0KSB7XHJcbiAgICAgIHRoaXMuYXJyYXkuc29ydChmdW5jdGlvbiAoYSwgYikge1xyXG4gICAgICAgIGlmKGEucHJpb3JpdHkgPiBiLnByaW9yaXR5KSByZXR1cm4gMTtcclxuICAgICAgICBpZiAoYS5wcmlvcml0eSA8IGIucHJpb3JpdHkpIHJldHVybiAtMTtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgICAgfSk7XHJcbiAgICAgIC8vIOOCpOODs+ODh+ODg+OCr+OCueOBruaMr+OCiuebtOOBl1xyXG4gICAgICBmb3IgKHZhciBpID0gMCwgZSA9IHRoaXMuYXJyYXkubGVuZ3RoOyBpIDwgZTsgKytpKSB7XHJcbiAgICAgICAgdGhpcy5hcnJheVtpXS5pbmRleCA9IGk7XHJcbiAgICAgIH1cclxuICAgICB0aGlzLm5lZWRTb3J0ID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZW1vdmVUYXNrKGluZGV4KSB7XHJcbiAgICBpZihpbmRleCA8IDApe1xyXG4gICAgICBpbmRleCA9IC0oKytpbmRleCk7XHJcbiAgICB9XHJcbiAgICBpZih0aGlzLmFycmF5W2luZGV4XS5wcmlvcml0eSA9PSAxMDAwMDApe1xyXG4gICAgICBkZWJ1Z2dlcjtcclxuICAgIH1cclxuICAgIHRoaXMuYXJyYXlbaW5kZXhdID0gbnVsbFRhc2s7XHJcbiAgICB0aGlzLm5lZWRDb21wcmVzcyA9IHRydWU7XHJcbiAgfVxyXG4gIFxyXG4gIGNvbXByZXNzKCkge1xyXG4gICAgaWYgKCF0aGlzLm5lZWRDb21wcmVzcykge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB2YXIgZGVzdCA9IFtdO1xyXG4gICAgdmFyIHNyYyA9IHRoaXMuYXJyYXk7XHJcbiAgICB2YXIgZGVzdEluZGV4ID0gMDtcclxuICAgIGRlc3QgPSBzcmMuZmlsdGVyKCh2LGkpPT57XHJcbiAgICAgIGxldCByZXQgPSB2ICE9IG51bGxUYXNrO1xyXG4gICAgICBpZihyZXQpe1xyXG4gICAgICAgIHYuaW5kZXggPSBkZXN0SW5kZXgrKztcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gcmV0O1xyXG4gICAgfSk7XHJcbiAgICB0aGlzLmFycmF5ID0gZGVzdDtcclxuICAgIHRoaXMubmVlZENvbXByZXNzID0gZmFsc2U7XHJcbiAgfVxyXG4gIFxyXG4gIHByb2Nlc3MoZ2FtZSlcclxuICB7XHJcbiAgICBpZih0aGlzLmVuYWJsZSl7XHJcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLnByb2Nlc3MuYmluZCh0aGlzLGdhbWUpKTtcclxuICAgICAgdGhpcy5zdG9wcGVkID0gZmFsc2U7XHJcbiAgICAgIGlmICghc2ZnLnBhdXNlKSB7XHJcbiAgICAgICAgaWYgKCFnYW1lLmlzSGlkZGVuKSB7XHJcbiAgICAgICAgICB0aGlzLmNoZWNrU29ydCgpO1xyXG4gICAgICAgICAgdGhpcy5hcnJheS5mb3JFYWNoKCAodGFzayxpKSA9PntcclxuICAgICAgICAgICAgaWYgKHRhc2sgIT0gbnVsbFRhc2spIHtcclxuICAgICAgICAgICAgICBpZih0YXNrLmluZGV4ICE9IGkgKXtcclxuICAgICAgICAgICAgICAgIGRlYnVnZ2VyO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB0YXNrLmdlbkluc3QubmV4dCh0YXNrLmluZGV4KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICB0aGlzLmNvbXByZXNzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICAgIFxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5lbWl0KCdzdG9wcGVkJyk7XHJcbiAgICAgIHRoaXMuc3RvcHBlZCA9IHRydWU7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIHN0b3BQcm9jZXNzKCl7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUscmVqZWN0KT0+e1xyXG4gICAgICB0aGlzLmVuYWJsZSA9IGZhbHNlO1xyXG4gICAgICB0aGlzLm9uKCdzdG9wcGVkJywoKT0+e1xyXG4gICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDjgrLjg7zjg6DnlKjjgr/jgqTjg57jg7xcclxuZXhwb3J0IGNsYXNzIEdhbWVUaW1lciB7XHJcbiAgY29uc3RydWN0b3IoZ2V0Q3VycmVudFRpbWUpIHtcclxuICAgIHRoaXMuZWxhcHNlZFRpbWUgPSAwO1xyXG4gICAgdGhpcy5jdXJyZW50VGltZSA9IDA7XHJcbiAgICB0aGlzLnBhdXNlVGltZSA9IDA7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuU1RPUDtcclxuICAgIHRoaXMuZ2V0Q3VycmVudFRpbWUgPSBnZXRDdXJyZW50VGltZTtcclxuICAgIHRoaXMuU1RPUCA9IDE7XHJcbiAgICB0aGlzLlNUQVJUID0gMjtcclxuICAgIHRoaXMuUEFVU0UgPSAzO1xyXG5cclxuICB9XHJcbiAgXHJcbiAgc3RhcnQoKSB7XHJcbiAgICB0aGlzLmVsYXBzZWRUaW1lID0gMDtcclxuICAgIHRoaXMuZGVsdGFUaW1lID0gMDtcclxuICAgIHRoaXMuY3VycmVudFRpbWUgPSB0aGlzLmdldEN1cnJlbnRUaW1lKCk7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuU1RBUlQ7XHJcbiAgfVxyXG5cclxuICByZXN1bWUoKSB7XHJcbiAgICB2YXIgbm93VGltZSA9IHRoaXMuZ2V0Q3VycmVudFRpbWUoKTtcclxuICAgIHRoaXMuY3VycmVudFRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lICsgbm93VGltZSAtIHRoaXMucGF1c2VUaW1lO1xyXG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLlNUQVJUO1xyXG4gIH1cclxuXHJcbiAgcGF1c2UoKSB7XHJcbiAgICB0aGlzLnBhdXNlVGltZSA9IHRoaXMuZ2V0Q3VycmVudFRpbWUoKTtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5QQVVTRTtcclxuICB9XHJcblxyXG4gIHN0b3AoKSB7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuU1RPUDtcclxuICB9XHJcblxyXG4gIHVwZGF0ZSgpIHtcclxuICAgIGlmICh0aGlzLnN0YXR1cyAhPSB0aGlzLlNUQVJUKSByZXR1cm47XHJcbiAgICB2YXIgbm93VGltZSA9IHRoaXMuZ2V0Q3VycmVudFRpbWUoKTtcclxuICAgIHRoaXMuZGVsdGFUaW1lID0gbm93VGltZSAtIHRoaXMuY3VycmVudFRpbWU7XHJcbiAgICB0aGlzLmVsYXBzZWRUaW1lID0gdGhpcy5lbGFwc2VkVGltZSArIHRoaXMuZGVsdGFUaW1lO1xyXG4gICAgdGhpcy5jdXJyZW50VGltZSA9IG5vd1RpbWU7XHJcbiAgfVxyXG59XHJcblxyXG4iXX0=
