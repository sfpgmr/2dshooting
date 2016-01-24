(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
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

    var host = window.location.hostname.match(/localhost/ig) ? 'localhost' : 'www.sfpgmr.net';
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

},{}],3:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DevTool = undefined;

var _global = require("./global");

var sfg = _interopRequireWildcard(_global);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DevTool = exports.DevTool = function () {
  function DevTool(game) {
    _classCallCheck(this, DevTool);

    this.game = game;
    this.keydown = this.keydown_();
    this.keydown.next();
  }

  _createClass(DevTool, [{
    key: "keydown_",
    value: function* keydown_() {
      var e = yield;
      while (true) {
        var process = false;
        if (e.keyCode == 192) {
          // @ Key
          sfg.CHECK_COLLISION = !sfg.CHECK_COLLISION;
          process = true;
        };

        if (e.keyCode == 80 /* P */) {
            if (!sfg.pause) {
              this.game.pause();
            } else {
              this.game.resume();
            }
            process = true;
          }

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
  }]);

  return DevTool;
}();

},{"./global":8}],4:[function(require,module,exports){
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
      sfg.tasks.pushTask(this.move.bind(this));
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
  }]);

  return Bombs;
}();

},{"./gameobj":7,"./global":8,"./graphics":9}],5:[function(require,module,exports){
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
      var ebs = this.enemyBullets;
      for (var i = 0, end = ebs.length; i < end; ++i) {
        var eb = ebs[i];
        if (eb.enable) {
          // タスクのキャンセル
          sfg.tasks[eb.task.index].next(true);
        }
      }
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
  }]);

  return LineMove;
}();

/// 円運動

var CircleMove = function () {
  function CircleMove(startRad, stopRad, r, speed, left) {
    _classCallCheck(this, CircleMove);

    this.startRad = startRad || 0;
    this.stopRad = stopRad || 0;
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

},{"./gameobj":7,"./global":8,"./graphics":9}],6:[function(require,module,exports){
"use strict";
//var STAGE_MAX = 1;

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

var _devtool = require('./devtool');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
//import * as song from './song';

var ScoreEntry = function ScoreEntry(name, score) {
  _classCallCheck(this, ScoreEntry);

  this.name = name;
  this.score = score;
};

var Stage = function () {
  function Stage() {
    _classCallCheck(this, Stage);

    this.MAX = 1;
    this.DIFFICULTY_MAX = 2.0;
    this.no = 1;
    this.privateNo = 0;
    this.difficulty = 1;
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
    value: function update(game) {
      if (this.difficulty < this.DIFFICULTY_MAX) {
        this.difficulty = 1 + 0.05 * (this.no - 1);
      }

      if (this.privateNo >= this.MAX) {
        this.privateNo = 0;
        //    this.no = 1;
      }
    }
  }]);

  return Stage;
}();

var Game = exports.Game = function () {
  function Game() {
    _classCallCheck(this, Game);

    this.CONSOLE_WIDTH = 0;
    this.CONSOLE_HEIGHT = 0;
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
    this.DevTool = new _devtool.DevTool(this);
    this.title = null; // タイトルメッシュ
    this.spaceField = null; // 宇宙空間パーティクル
    this.editHandleName = null;
    sfg.addScore = this.addScore.bind(this);
    this.checkVisibilityAPI();
    this.audio_ = new audio.Audio();
    this.status = null;
  }

  _createClass(Game, [{
    key: 'exec',
    value: function exec() {
      var _this = this;

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
        _this.scene.remove(_this.progress.mesh);
        _this.renderer.render(_this.scene, _this.camera);
        _this.tasks.clear();
        _this.tasks.pushTask(_this.init.bind(_this));
        _this.tasks.pushTask(_this.render.bind(_this), 100000);
        _this.start = true;
        _this.main();
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
    value: function initConsole() {
      var _this2 = this;

      // レンダラーの作成
      this.renderer = new THREE.WebGLRenderer({ antialias: false, sortObjects: true });
      var renderer = this.renderer;
      this.calcScreenSize();
      renderer.setSize(this.CONSOLE_WIDTH, this.CONSOLE_HEIGHT);
      renderer.setClearColor(0, 1);
      renderer.domElement.id = 'console';
      if (sfg.DEBUG) {
        renderer.domElement.className = 'console-debug';
      } else {
        renderer.domElement.className = 'console';
      }
      renderer.domElement.style.zIndex = 0;

      d3.select('#content').node().appendChild(renderer.domElement);
      if (sfg.DEBUG) {
        // Stats オブジェクト(FPS表示)の作成表示
        this.stats = new Stats();
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.top = '0px';
        this.stats.domElement.style.left = '0px';
        this.stats.domElement.style.left = renderer.domElement.style.left;

        d3.select('#content').append('div').attr('class', 'debug-ui').text('test').style('height', this.CONSOLE_HEIGHT + 'px').node().appendChild(this.stats.domElement);
      }

      window.addEventListener('resize', function () {
        _this2.calcScreenSize();
        renderer.setSize(_this2.CONSOLE_WIDTH, _this2.CONSOLE_HEIGHT);
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
      if (sfg.DEBUG) {
        d3.select('body').on('keydown.DevTool', function () {
          var e = d3.event;
          if (_this2.DevTool.keydown.next(e).value) {
            d3.event.preventDefault();
            d3.event.cancelBubble = true;
            return false;
          };
        });
      }
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
      var _this3 = this;

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
            _this3.progress.render('Loading Resouces ...', texCount / texLength * 100 | 0);
            sfg.textureFiles[name] = tex;
            _this3.renderer.render(_this3.scene, _this3.camera);
            return Promise.resolve();
          });
        })(n, textures[n]);
      }
      return loadPromise;
    }
  }, {
    key: 'render',
    value: function* render(taskIndex) {
      while (true) {
        this.renderer.render(this.scene, this.camera);
        this.textPlane.render();
        this.stats && this.stats.update();
        yield;
      }
    }
  }, {
    key: 'init',
    value: function* init(taskIndex) {
      var _this4 = this;

      this.scene = new THREE.Scene();
      this.enemyBullets = new enemies.EnemyBullets(this.scene, this.se.bind(this));
      this.enemies = new enemies.Enemies(this.scene, this.se.bind(this), this.enemyBullets);
      sfg.bombs = new effectobj.Bombs(this.scene, this.se.bind(this));
      this.stage = sfg.stage = new Stage();
      this.spaceField = null;

      // ハンドルネームの取得
      this.handleName = this.storage.getItem('handleName');

      this.textPlane = new text.TextPlane(this.scene);
      // textPlane.print(0, 0, "Web Audio API Test", new TextAttribute(true));
      // スコア情報 通信用
      this.comm_ = new comm.Comm();
      this.comm_.updateHighScores = function (data) {
        _this4.highScores = data;
        _this4.highScore = _this4.highScores[0].score;
      };

      this.comm_.updateHighScore = function (data) {
        if (_this4.highScore < data.score) {
          _this4.highScore = data.score;
          _this4.printScore();
        }
      };

      // scene.add(textPlane.mesh);

      //作者名パーティクルを作成

      if (!sfg.DEBUG) {
        this.basicInput.bind();
        this.tasks.setNextTask(taskIndex, this.printAuthor.bind(this));
        return;
      } else {
        this.basicInput.bind();
        this.tasks.setNextTask(taskIndex, this.gameInit.bind(this));
        this.showSpaceField();
        return;
      }
    }

    /// 作者表示

  }, {
    key: 'printAuthor',
    value: function* printAuthor(taskIndex) {
      var _this5 = this;

      var wait = 60;
      this.basicInput.keyBuffer.length = 0;

      var nextTask = function nextTask() {
        _this5.scene.remove(_this5.author);
        //scene.needsUpdate = true;
        _this5.tasks.setNextTask(taskIndex, _this5.initTitle.bind(_this5));
      };

      var checkKeyInput = function checkKeyInput() {
        if (_this5.basicInput.keyBuffer.length > 0) {
          _this5.basicInput.keyBuffer.length = 0;
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
      this.textPlane.print(3, 25, "Push z key to Start Game", new text.TextAttribute(true));
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

        if (this.basicInput.keyCheck.z) {
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
      var _this6 = this;

      var end = false;
      if (this.editHandleName) {
        this.tasks.setNextTask(taskIndex, this.gameInit.bind(this));
      } else {
        var elm;
        yield* function* () {
          _this6.editHandleName = _this6.handleName || '';
          _this6.textPlane.cls();
          _this6.textPlane.print(4, 18, 'Input your handle name.');
          _this6.textPlane.print(8, 19, '(Max 8 Char)');
          _this6.textPlane.print(10, 21, _this6.editHandleName);
          //    textPlane.print(10, 21, handleName[0], TextAttribute(true));
          _this6.basicInput.unbind();
          elm = d3.select('#content').append('input');

          var this_ = _this6;
          elm.attr('type', 'text').attr('pattern', '[a-zA-Z0-9_\@\#\$\-]{0,8}').attr('maxlength', 8).attr('id', 'input-area').attr('value', this_.editHandleName).call(function (d) {
            d.node().selectionStart = this_.editHandleName.length;
          }).on('blur', function () {
            d3.event.preventDefault();
            d3.event.stopImmediatePropagation();
            setTimeout(function () {
              this.focus();
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
          }).node().focus();

          while (taskIndex >= 0) {
            taskIndex = yield;
          }
          taskIndex = - ++taskIndex;
        }();
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
      this.myship_ = new myship.MyShip(0, -100, 0.1, this.scene, this.se.bind(this));
      sfg.myship_ = this.myship_;
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
      this.status = this.STATUS.INGAME;
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

Game.prototype.STATUS = {
  INGAME: 1
};

},{"./audio":1,"./comm":2,"./devtool":3,"./effectobj":4,"./enemies":5,"./gameobj":7,"./global":8,"./graphics":9,"./io":10,"./myship":12,"./text":13,"./util":14}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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
var CHECK_COLLISION = exports.CHECK_COLLISION = true;
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

},{}],9:[function(require,module,exports){
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

},{"./global":8}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BasicInput = BasicInput;

var _global = require('./global');

var sfg = _interopRequireWildcard(_global);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// キー入力
function BasicInput() {
  this.keyCheck = { up: false, down: false, left: false, right: false, z: false, x: false };
  this.keyBuffer = [];
  this.keyup_ = null;
  this.keydown_ = null;
}

BasicInput.prototype = {
  clear: function clear() {
    for (var d in this.keyCheck) {
      this.keyCheck[d] = false;
    }
    this.keyBuffer.length = 0;
  },
  keydown: function keydown(e) {
    var e = d3.event;
    var keyBuffer = this.keyBuffer;
    var keyCheck = this.keyCheck;
    var handle = true;

    if (keyBuffer.length > 16) {
      keyBuffer.shift();
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
  },
  keyup: function keyup() {
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
  },
  //イベントにバインドする
  bind: function bind() {
    d3.select('body').on('keydown.basicInput', this.keydown.bind(this));
    d3.select('body').on('keyup.basicInput', this.keyup.bind(this));
  },
  // アンバインドする
  unbind: function unbind() {
    d3.select('body').on('keydown.basicInput', null);
    d3.select('body').on('keyup.basicInput', null);
  }
};

},{"./global":8}],11:[function(require,module,exports){
"use strict";
//var STAGE_MAX = 1;

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

var _devtool = require('./devtool');

var _game = require('./game');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/// メイン

//import * as song from './song';
window.onload = function () {

  sfg.game = new _game.Game();
  sfg.game.exec();
};

},{"./audio":1,"./comm":2,"./devtool":3,"./effectobj":4,"./enemies":5,"./game":6,"./gameobj":7,"./global":8,"./graphics":9,"./io":10,"./myship":12,"./text":13,"./util":14}],12:[function(require,module,exports){
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
      sfg.tasks.pushTask(this.move.bind(this));
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
      if (basicInput.keyCheck.left) {
        if (this.x > this.left) {
          this.x -= 2;
        }
      }

      if (basicInput.keyCheck.right) {
        if (this.x < this.right) {
          this.x += 2;
        }
      }

      if (basicInput.keyCheck.up) {
        if (this.y < this.top) {
          this.y += 2;
        }
      }

      if (basicInput.keyCheck.down) {
        if (this.y > this.bottom) {
          this.y -= 2;
        }
      }

      if (basicInput.keyCheck.z) {
        basicInput.keyCheck.z = false;
        this.shoot(0.5 * Math.PI);
      }

      if (basicInput.keyCheck.x) {
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

},{"./gameobj":7,"./global":8,"./graphics":9}],13:[function(require,module,exports){
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

},{"./global":8}],14:[function(require,module,exports){

"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GameTimer = exports.Tasks = exports.nullTask = exports.Task = undefined;

var _global = require("./global");

var sfg = _interopRequireWildcard(_global);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

var Tasks = exports.Tasks = function () {
  function Tasks() {
    _classCallCheck(this, Tasks);

    this.array = new Array(0);
    this.needSort = false;
    this.needCompress = false;
  }
  // indexの位置のタスクを置き換える

  _createClass(Tasks, [{
    key: "setNextTask",
    value: function setNextTask(index, genInst, priority) {
      if (index < 0) {
        index = - ++index;
      }
      var t = new Task(genInst(index), priority);
      t.index = index;
      this.array[index] = t;
      this.needSort = true;
    }
  }, {
    key: "pushTask",
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
    key: "getArray",
    value: function getArray() {
      return this.array;
    }
    // タスクをクリアする

  }, {
    key: "clear",
    value: function clear() {
      this.array.length = 0;
    }
    // ソートが必要かチェックし、ソートする

  }, {
    key: "checkSort",
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
    key: "removeTask",
    value: function removeTask(index) {
      if (index < 0) {
        index = - ++index;
      }
      this.array[index] = nullTask;
      this.needCompress = true;
    }
  }, {
    key: "compress",
    value: function compress() {
      if (!this.needCompress) {
        return;
      }
      var dest = [];
      var src = this.array;
      var destIndex = 0;
      for (var i = 0, end = src.length; i < end; ++i) {
        var s = src[i];
        if (s != nullTask) {
          s.index = destIndex;
          dest.push(s);
          destIndex++;
        }
      }
      this.array = dest;
      this.needCompress = false;
    }
  }, {
    key: "process",
    value: function process(game) {
      requestAnimationFrame(this.process.bind(this, game));
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
    }
  }]);

  return Tasks;
}();

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
    key: "start",
    value: function start() {
      this.elapsedTime = 0;
      this.deltaTime = 0;
      this.currentTime = this.getCurrentTime();
      this.status = this.START;
    }
  }, {
    key: "resume",
    value: function resume() {
      var nowTime = this.getCurrentTime();
      this.currentTime = this.currentTime + nowTime - this.pauseTime;
      this.status = this.START;
    }
  }, {
    key: "pause",
    value: function pause() {
      this.pauseTime = this.getCurrentTime();
      this.status = this.PAUSE;
    }
  }, {
    key: "stop",
    value: function stop() {
      this.status = this.STOP;
    }
  }, {
    key: "update",
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

},{"./global":8}]},{},[11])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGpzXFxhdWRpby5qcyIsInNyY1xcanNcXGNvbW0uanMiLCJzcmNcXGpzXFxkZXZ0b29sLmpzIiwic3JjXFxqc1xcZWZmZWN0b2JqLmpzIiwic3JjXFxqc1xcZW5lbWllcy5qcyIsInNyY1xcanNcXGdhbWUuanMiLCJzcmNcXGpzXFxnYW1lb2JqLmpzIiwic3JjXFxqc1xcZ2xvYmFsLmpzIiwic3JjXFxqc1xcZ3JhcGhpY3MuanMiLCJzcmNcXGpzXFxpby5qcyIsInNyY1xcanNcXG1haW4uanMiLCJzcmNcXGpzXFxteXNoaXAuanMiLCJzcmNcXGpzXFx0ZXh0LmpzIiwic3JjXFxqc1xcdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7OztBQ01BLFlBQVk7O0FBQUM7Ozs7OztRQTBCRyxTQUFTLEdBQVQsU0FBUztRQTRCVCxVQUFVLEdBQVYsVUFBVTtRQVFWLHlCQUF5QixHQUF6Qix5QkFBeUI7UUFtQ3pCLFdBQVcsR0FBWCxXQUFXO1FBZ0NYLGlCQUFpQixHQUFqQixpQkFBaUI7UUFxQ2pCLEtBQUssR0FBTCxLQUFLO1FBK0RMLEtBQUssR0FBTCxLQUFLO1FBdUVMLElBQUksR0FBSixJQUFJO1FBd2JKLFNBQVMsR0FBVCxTQUFTO1FBd0tULFlBQVksR0FBWixZQUFZO0FBMTRCNUIsSUFBSSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQy9CLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQztBQUN2QixJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUM7O0FBRW5CLElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQztBQUNsQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUU7QUFDN0IsVUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FB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Q0FBQztBQUMvQixZQUFRLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztHQUU1QztDQUNGLENBQUE7O0FBRUQsSUFDRSxDQUFDLEdBQUksSUFBSSxJQUFJLENBQUUsQ0FBQyxFQUFDLElBQUksQ0FBQztJQUN0QixFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUUsQ0FBQyxFQUFDLElBQUksQ0FBQztJQUN0QixDQUFDLEdBQUksSUFBSSxJQUFJLENBQUUsQ0FBQyxFQUFDLElBQUksQ0FBQztJQUN0QixFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUUsQ0FBQyxFQUFDLElBQUksQ0FBQztJQUN0QixDQUFDLEdBQUksSUFBSSxJQUFJLENBQUUsQ0FBQyxFQUFDLElBQUksQ0FBQztJQUN0QixDQUFDLEdBQUksSUFBSSxJQUFJLENBQUUsQ0FBQyxFQUFDLElBQUksQ0FBQztJQUN0QixFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUUsQ0FBQyxFQUFDLElBQUksQ0FBQztJQUN0QixDQUFDLEdBQUksSUFBSSxJQUFJLENBQUUsQ0FBQyxFQUFDLElBQUksQ0FBQztJQUN0QixFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUUsQ0FBQyxFQUFDLElBQUksQ0FBQztJQUN0QixDQUFDLEdBQUksSUFBSSxJQUFJLENBQUUsQ0FBQyxFQUFDLElBQUksQ0FBQztJQUN0QixFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUMsRUFBRSxFQUFDLElBQUksQ0FBQztJQUN0QixDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQzs7OztBQUFDLEFBSXpCLFNBQVMsT0FBTyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQzNDO0FBQ0UsTUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDakIsTUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHOztBQUFDLEFBRWYsTUFBSSxDQUFDLElBQUksR0FBRyxJQUFJ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QUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFDWixDQUFDLEVBQ0QsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ3JELENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUMzQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQ047R0FDSixFQUNEO0FBQ0UsUUFBSSxFQUFFLE9BQU87QUFDYixXQUFPLEVBQUUsQ0FBQztBQUNWLFFBQUksRUFDRixDQUNBLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsRUFDMUIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUMvQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsRUFDZCxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBRSxDQUFDLEVBQ3RELENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2xDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FDTjtHQUNKLENBQ0Y7Q0FDRixDQUFBOztBQUVNLFNBQVMsWUFBWSxDQUFDLFNBQVMsRUFBRTtBQUNyQyxNQUFJLENBQUMsWUFBWSxHQUNoQjs7QUFFQSxjQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBQyxDQUM1QjtBQUNFLFdBQU8sRUFBRSxDQUFDO0FBQ1YsV0FBTyxFQUFDLElBQUk7QUFDWixRQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQ2hCLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsRUFBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FDM0g7R0FDRixFQUNEO0FBQ0UsV0FBTyxFQUFFLENBQUM7QUFDVixXQUFPLEVBQUUsSUFBSTtBQUNiLFFBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFDaEIsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FDM0k7R0FDRixDQUNBLENBQUM7O0FBRUYsY0FBWSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQ3pCLENBQ0U7QUFDRSxXQUFPLEVBQUUsRUFBRTtBQUNYLFdBQU8sRUFBRSxJQUFJO0FBQ2IsUUFBSSxFQUFFLENBQ0wsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsR0FBRyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxFQUN6RSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUN0RztHQUNGLENBQ0YsQ0FBQzs7QUFFSixjQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFDekIsQ0FDRTtBQUNFLFdBQU8sRUFBRSxFQUFFO0FBQ1gsV0FBTyxFQUFFLElBQUk7QUFDYixRQUFJLEVBQUUsQ0FDTCxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxHQUFHLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDLEVBQ3pFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsRUFBRSxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxFQUFFLEVBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBQyxDQUFDLEVBQUMsRUFBRSxFQUFDLENBQUMsRUFBQyxFQUFFLEVBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBQyxDQUFDLEVBQUMsRUFBRSxFQUFDLENBQUMsRUFBQyxFQUFFLEVBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBQyxDQUFDLENBQ3RFO0dBQ0YsQ0FDRixDQUFDOztBQUVGLGNBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUN6QixDQUNFO0FBQ0UsV0FBTyxFQUFFLEVBQUU7QUFDWCxXQUFPLEVBQUUsSUFBSTtBQUNiLFFBQUksRUFBRSxDQUNMLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsRUFDekUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxFQUFFLEVBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBQyxDQUFDLEVBQUMsRUFBRSxFQUFDLENBQUMsRUFBQyxFQUFFLEVBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBQyxDQUFDLEVBQUMsRUFBRSxFQUFDLENBQUMsRUFBQyxFQUFFLENBQ3ZDO0dBQ0YsQ0FDRixDQUFDOztBQUVKLGNBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUN6QixDQUNFO0FBQ0UsV0FBTyxFQUFFLEVBQUU7QUFDWCxXQUFPLEVBQUUsSUFBSTtBQUNiLFFBQUksRUFBRSxDQUNMLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxHQUFHLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEVBQ2xGLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQ1A7R0FDRixDQUNGLENBQUMsQ0FDTixDQUFDO0NBQ0g7OztBQ3Y5QkYsWUFBWSxDQUFDOzs7Ozs7Ozs7O0lBRUEsSUFBSSxXQUFKLElBQUk7QUFDZixXQURXLElBQUksR0FDRjs7OzBCQURGLElBQUk7O0FBRWIsUUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFDLFdBQVcsR0FBQyxnQkFBZ0IsQ0FBQztBQUN0RixRQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUNwQixRQUFJO0FBQ0YsVUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxJQUFJLEdBQUcsWUFBWSxDQUFDLENBQUM7QUFDMUQsVUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDbkIsVUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2hCLFVBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLGdCQUFnQixFQUFFLFVBQUMsSUFBSSxFQUFHO0FBQ3ZDLFlBQUcsTUFBSyxnQkFBZ0IsRUFBQztBQUN2QixnQkFBSyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUM3QjtPQUNGLENBQUMsQ0FBQztBQUNILFVBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLGVBQWUsRUFBRSxVQUFDLElBQUksRUFBRztBQUN0QyxjQUFLLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUM1QixDQUFDLENBQUM7O0FBRUgsVUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLFVBQUMsSUFBSSxFQUFLO0FBQ25DLGNBQUssZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO09BQ3hDLENBQUMsQ0FBQzs7QUFFSCxVQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxZQUFZO0FBQy9DLGFBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ3hCLFlBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO09BQ3JCLENBQUMsQ0FBQzs7QUFFSCxVQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsWUFBWTtBQUN2QyxZQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7QUFDZixjQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUNwQixlQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztTQUMxQjtPQUNGLENBQUMsQ0FBQztLQUVKLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixXQUFLLENBQUMscUNBQXFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7S0FDbEQ7R0FDRjs7ZUFwQ1UsSUFBSTs7OEJBc0NMLEtBQUssRUFDZjtBQUNFLFVBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNmLFlBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQztPQUN0QztLQUNGOzs7aUNBR0Q7QUFDRSxVQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7QUFDZixZQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUNwQixZQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO09BQzFCO0tBQ0Y7OztTQW5EVSxJQUFJOzs7O0FDRmpCLFlBQVksQ0FBQzs7Ozs7Ozs7Ozs7SUFDRCxHQUFHOzs7Ozs7SUFFRixPQUFPLFdBQVAsT0FBTztBQUNsQixXQURXLE9BQU8sQ0FDTixJQUFJLEVBQUU7MEJBRFAsT0FBTzs7QUFFaEIsUUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDakIsUUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDL0IsUUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztHQUNyQjs7ZUFMVSxPQUFPOztnQ0FPTjtBQUNWLFVBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQztBQUNkLGFBQU8sSUFBSSxFQUFFO0FBQ1gsWUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDO0FBQ3BCLFlBQUksQ0FBQyxDQUFDLE9BQU8sSUFBSSxHQUFHLEVBQUU7O0FBQ3BCLGFBQUcsQ0FBQyxlQUFlLEdBQUcsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDO0FBQzNDLGlCQUFPLEdBQUcsSUFBSSxDQUFDO1NBQ2hCLENBQUM7O0FBRUYsWUFBSSxDQUFDLENBQUMsT0FBTyxJQUFJLEVBQUUsUUFBQSxFQUFVO0FBQzNCLGdCQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRTtBQUNkLGtCQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO2FBQ25CLE1BQU07QUFDTCxrQkFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQzthQUNwQjtBQUNELG1CQUFPLEdBQUcsSUFBSSxDQUFDO1dBQ2hCOztBQUVELFlBQUksQ0FBQyxDQUFDLE9BQU8sSUFBSSxFQUFFLFFBQUEsSUFBWSxHQUFHLENBQUMsS0FBSyxFQUFFO0FBQ3hDLGNBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFO0FBQ2QsZ0JBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7V0FDbkIsTUFBTTtBQUNMLGdCQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1dBQ3BCO0FBQ0QsaUJBQU8sR0FBRyxJQUFJLENBQUM7U0FDaEI7QUFDRCxTQUFDLEdBQUcsTUFBTSxPQUFPLENBQUM7T0FDbkI7S0FDRjs7O1NBbkNVLE9BQU87Ozs7QUNIcEIsWUFBWSxDQUFDOzs7Ozs7Ozs7OztJQUNELEdBQUc7Ozs7SUFDRixPQUFPOzs7O0lBQ1IsUUFBUTs7Ozs7Ozs7Ozs7O0lBSVAsSUFBSSxXQUFKLElBQUk7WUFBSixJQUFJOztBQUVmLFdBRlcsSUFBSSxDQUVILEtBQUssRUFBQyxFQUFFLEVBQUU7MEJBRlgsSUFBSTs7dUVBQUosSUFBSSxhQUdQLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQzs7QUFDWCxRQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQztBQUNoQyxRQUFJLFFBQVEsR0FBRyxRQUFRLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbEQsWUFBUSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsZ0JBQWdCLENBQUM7QUFDM0MsWUFBUSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7QUFDNUIsUUFBSSxRQUFRLEdBQUcsUUFBUSxDQUFDLG9CQUFvQixDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2pELFlBQVEsQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2xELFVBQUssSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDL0MsVUFBSyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDM0IsVUFBSyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ2YsVUFBSyxJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztBQUMxQixVQUFLLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDbkIsVUFBSyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQ2IsU0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFLLElBQUksQ0FBQyxDQUFDOztHQUN0Qjs7ZUFqQlUsSUFBSTs7MEJBeUJULENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRTtBQUNwQixVQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDaEIsZUFBTyxLQUFLLENBQUM7T0FDZDtBQUNELFVBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUN2QixVQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNYLFVBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ1gsVUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDO0FBQ3JCLFVBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0FBQ3BCLGNBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDdkYsU0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUN6QyxVQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO0FBQ2pDLGFBQU8sSUFBSSxDQUFDO0tBQ2I7OzswQkFFSyxTQUFTLEVBQUU7O0FBRWYsV0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxTQUFTLElBQUksQ0FBQyxFQUFDLEVBQUUsQ0FBQyxFQUN6RDtBQUNFLGlCQUFTLEdBQUcsS0FBSyxDQUFDO09BQ25CO0FBQ0QsVUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDOztBQUV6QixXQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLFNBQVMsSUFBSSxDQUFDLEVBQUMsRUFBRSxDQUFDLEVBQ3pDO0FBQ0UsZ0JBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUM5RSxpQkFBUyxHQUFHLEtBQUssQ0FBQztPQUNuQjs7QUFFRCxVQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztBQUNyQixVQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFDMUIsU0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7S0FDakM7Ozt3QkF2Q087QUFBRSxhQUFPLElBQUksQ0FBQyxFQUFFLENBQUM7S0FBRTtzQkFDckIsQ0FBQyxFQUFFO0FBQUUsVUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQUU7Ozt3QkFDeEM7QUFBRSxhQUFPLElBQUksQ0FBQyxFQUFFLENBQUM7S0FBRTtzQkFDckIsQ0FBQyxFQUFFO0FBQUUsVUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQUU7Ozt3QkFDeEM7QUFBRSxhQUFPLElBQUksQ0FBQyxFQUFFLENBQUM7S0FBRTtzQkFDckIsQ0FBQyxFQUFFO0FBQUUsVUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQUU7OztTQXZCckMsSUFBSTtFQUFTLE9BQU8sQ0FBQyxPQUFPOztJQTRENUIsS0FBSyxXQUFMLEtBQUs7QUFDaEIsV0FEVyxLQUFLLENBQ0osS0FBSyxFQUFFLEVBQUUsRUFBRTswQkFEWixLQUFLOztBQUVkLFFBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUIsU0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRTtBQUMzQixVQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUN0QztHQUNGOztlQU5VLEtBQUs7OzBCQVFWLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ2IsVUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUN0QixVQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDZCxXQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFO0FBQy9DLFlBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFO0FBQ3BCLGNBQUksS0FBSyxJQUFJLENBQUMsRUFBRTtBQUNkLGdCQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1dBQzNCLE1BQU07QUFDTCxnQkFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUEsQUFBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQSxBQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztXQUNqRztBQUNELGVBQUssRUFBRSxDQUFDO0FBQ1IsY0FBSSxDQUFDLEtBQUssRUFBRSxNQUFNO1NBQ25CO09BQ0Y7S0FDRjs7O1NBdEJVLEtBQUs7Ozs7QUNuRWxCLFlBQVksQ0FBQzs7Ozs7Ozs7Ozs7SUFDQSxPQUFPOzs7O0lBQ1IsR0FBRzs7OztJQUNILFFBQVE7Ozs7Ozs7Ozs7OztJQUdQLFdBQVcsV0FBWCxXQUFXO1lBQVgsV0FBVzs7QUFDdEIsV0FEVyxXQUFXLENBQ1YsS0FBSyxFQUFFLEVBQUUsRUFBRTswQkFEWixXQUFXOzt1RUFBWCxXQUFXLGFBRWQsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDOztBQUNiLFVBQUssSUFBSSxHQUFHLENBQUMsQ0FBQztBQUNkLFVBQUssSUFBSSxHQUFHLENBQUMsQ0FBQztBQUNkLFVBQUssSUFBSSxHQUFHLENBQUMsQ0FBQztBQUNkLFVBQUssYUFBYSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDN0IsVUFBSyxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUM5QixRQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQztBQUNqQyxRQUFJLFFBQVEsR0FBRyxRQUFRLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbEQsUUFBSSxRQUFRLEdBQUcsUUFBUSxDQUFDLG9CQUFvQixDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2pELFlBQVEsQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2xELFVBQUssSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDL0MsVUFBSyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ2IsVUFBSyxTQUFTLEdBQUcsSUFBSSxDQUFDO0FBQ3RCLFVBQUssRUFBRSxHQUFHLElBQUksQ0FBQztBQUNmLFVBQUssSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFDMUIsVUFBSyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLFVBQUssSUFBSSxHQUFHLENBQUMsQ0FBQztBQUNkLFVBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNaLFVBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNaLFVBQUssS0FBSyxHQUFHLEdBQUcsQ0FBQztBQUNqQixVQUFLLE1BQU0sR0FBRyxLQUFLLENBQUM7QUFDcEIsVUFBSyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLFVBQUssTUFBTSxHQUFHLE1BQUssSUFBSSxDQUFDO0FBQ3hCLFVBQUssS0FBSyxHQUFHLEtBQUssQ0FBQztBQUNuQixTQUFLLENBQUMsR0FBRyxDQUFDLE1BQUssSUFBSSxDQUFDLENBQUM7QUFDckIsVUFBSyxFQUFFLEdBQUcsRUFBRSxDQUFDOztHQUNkOztlQTVCVSxXQUFXOzswQkE2Q2hCLFNBQVMsRUFBRTtBQUNmLGFBQUssSUFBSSxDQUFDLENBQUMsSUFBSyxHQUFHLENBQUMsTUFBTSxHQUFHLEVBQUUsQUFBQyxJQUM1QixJQUFJLENBQUMsQ0FBQyxJQUFLLEdBQUcsQ0FBQyxPQUFPLEdBQUcsRUFBRSxBQUFDLElBQzVCLElBQUksQ0FBQyxDQUFDLElBQUssR0FBRyxDQUFDLFFBQVEsR0FBRyxFQUFFLEFBQUMsSUFDN0IsSUFBSSxDQUFDLENBQUMsSUFBSyxHQUFHLENBQUMsS0FBSyxHQUFHLEVBQUUsQUFBQyxJQUFJLFNBQVMsSUFBSSxDQUFDLEVBQzVDLElBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsRUFBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFLEVBQ3ZDO0FBQ0UsaUJBQVMsR0FBRyxLQUFLLENBQUM7T0FDbkI7O0FBRUQsVUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0FBQzFCLFVBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztBQUN4QixVQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUNwQixTQUFHLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUNqQzs7OzBCQUVLLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ2IsVUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO0FBQ2YsZUFBTyxLQUFLLENBQUM7T0FDZDtBQUNELFVBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQixVQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEIsVUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2hCLFVBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ25CLFVBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxFQUM1QjtBQUNFLGlCQUFTO09BQ1Y7QUFDRCxVQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDeEIsVUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDakUsVUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQztBQUNqQyxVQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQSxBQUFDLENBQUM7QUFDcEUsVUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUEsQUFBQzs7O0FBQUMsQUFHcEUsVUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3JELGFBQU8sSUFBSSxDQUFDO0tBQ2I7OzswQkFFSztBQUNKLFVBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0FBQ3BCLFNBQUcsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDdEMsVUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0tBQ3pCOzs7d0JBMURPO0FBQUUsYUFBTyxJQUFJLENBQUMsRUFBRSxDQUFDO0tBQUU7c0JBQ3JCLENBQUMsRUFBRTtBQUFFLFVBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUFFOzs7d0JBQ3hDO0FBQUUsYUFBTyxJQUFJLENBQUMsRUFBRSxDQUFDO0tBQUU7c0JBQ3JCLENBQUMsRUFBRTtBQUFFLFVBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUFFOzs7d0JBQ3hDO0FBQUUsYUFBTyxJQUFJLENBQUMsRUFBRSxDQUFDO0tBQUU7c0JBQ3JCLENBQUMsRUFBRTtBQUFFLFVBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUFFOzs7d0JBQ25DO0FBQ1gsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0tBQ3JCO3NCQUVVLENBQUMsRUFBRTtBQUNaLFVBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO0FBQ2pCLFVBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztLQUN2Qjs7O1NBM0NVLFdBQVc7RUFBUyxPQUFPLENBQUMsT0FBTzs7SUE0Rm5DLFlBQVksV0FBWixZQUFZO0FBQ3ZCLFdBRFcsWUFBWSxDQUNYLEtBQUssRUFBRSxFQUFFLEVBQUU7MEJBRFosWUFBWTs7QUFFckIsUUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDbkIsUUFBSSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUM7QUFDdkIsU0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRTtBQUMzQixVQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDekQ7R0FDRjs7ZUFQVSxZQUFZOzswQkFRakIsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDYixVQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO0FBQzVCLFdBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFDLENBQUMsR0FBRSxHQUFHLEVBQUMsRUFBRSxDQUFDLEVBQUM7QUFDeEMsWUFBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUM7QUFDaEIsYUFBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3RCLGdCQUFNO1NBQ1A7T0FDRjtLQUNGOzs7NEJBR0Q7QUFDRSxVQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO0FBQzVCLFdBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUU7QUFDOUMsWUFBSSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hCLFlBQUksRUFBRSxDQUFDLE1BQU0sRUFBRTs7QUFFYixhQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3JDO09BQ0Y7S0FDRjs7O1NBNUJVLFlBQVk7Ozs7OztJQWlDbkIsUUFBUTtBQUNaLFdBREksUUFBUSxDQUNBLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFOzBCQUQxQixRQUFROztBQUVWLFFBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQ2YsUUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDbkIsUUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDakIsUUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7QUFDeEIsUUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztBQUNoQyxRQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO0dBQ2pDOztlQVJHLFFBQVE7OzBCQVVOLElBQUksRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUNkOztBQUVFLFVBQUksSUFBSSxDQUFDLElBQUksRUFBRTtBQUNiLFlBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBLEFBQUMsQ0FBQztPQUNuRCxNQUFNO0FBQ0wsWUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO09BQ3ZDOztBQUVELFVBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7QUFDakIsVUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztBQUNqQixVQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDOztBQUV2QixVQUFHLElBQUksQ0FBQyxJQUFJLEVBQUM7QUFDWCxVQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUM7T0FDVjtBQUNELFVBQUksTUFBTSxHQUFHLEtBQUssQ0FBQztBQUNuQixXQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBQyxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFDLEVBQUUsQ0FBQyxFQUFDO0FBQ3BDLFlBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ2IsWUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDYixjQUFNLEdBQUcsS0FBSyxDQUFDO09BQ2hCO0tBQ0Y7OztTQWhDRyxRQUFROzs7OztJQW9DUixVQUFVO0FBQ2QsV0FESSxVQUFVLENBQ0YsUUFBUSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTswQkFEM0MsVUFBVTs7QUFFWixRQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsSUFBSSxDQUFDLENBQUM7QUFDOUIsUUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLElBQUksQ0FBQyxDQUFDO0FBQzVCLFFBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQixRQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssSUFBSSxDQUFDLENBQUM7QUFDeEIsUUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ2pDLFFBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQ2pCLFFBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7QUFDeEIsUUFBSSxJQUFJLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBLEdBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztBQUN2QyxRQUFJLEdBQUcsR0FBRyxLQUFLLENBQUM7QUFDaEIsV0FBTyxDQUFDLEdBQUcsRUFBRTtBQUNYLFNBQUcsSUFBSSxJQUFJLENBQUM7QUFDWixVQUFJLEFBQUMsSUFBSSxJQUFLLEdBQUcsSUFBSSxJQUFJLENBQUMsT0FBTyxBQUFDLElBQU0sQ0FBQyxJQUFJLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxPQUFPLEFBQUMsRUFBRTtBQUNyRSxXQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztBQUNuQixXQUFHLEdBQUcsSUFBSSxDQUFDO09BQ1o7QUFDRCxVQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztBQUNmLFNBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDO0FBQ3pCLFNBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDO0FBQ3pCLFdBQUcsRUFBRSxHQUFHO09BQ1QsQ0FBQyxDQUFDO0tBQ0o7R0FDRjs7ZUF2QkcsVUFBVTs7MEJBMEJSLElBQUksRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFFOztBQUVkLFVBQUksRUFBRSxZQUFBO1VBQUMsRUFBRSxZQUFBLENBQUM7QUFDVixVQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7QUFDYixVQUFFLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztPQUNyRCxNQUFNO0FBQ0wsVUFBRSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO09BQzNDO0FBQ0QsUUFBRSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDOztBQUUxQyxVQUFJLE1BQU0sR0FBRyxLQUFLOztBQUFDLEFBRW5CLFdBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBQyxBQUFDLENBQUMsR0FBRyxDQUFDLElBQUssQ0FBQyxNQUFNLEVBQUMsRUFBRSxDQUFDLEVBQzNEO0FBQ0UsWUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzQixZQUFHLElBQUksQ0FBQyxJQUFJLEVBQUM7QUFDWCxjQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO1NBQ3ZCLE1BQU07QUFDTCxjQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO1NBQ3ZCOztBQUVELFlBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDdEIsWUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO0FBQ2IsY0FBSSxDQUFDLE9BQU8sR0FBRyxBQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFDLEdBQUcsR0FBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBLEdBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQztTQUN2RSxNQUFNO0FBQ0wsY0FBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUEsR0FBSSxJQUFJLENBQUMsRUFBRSxDQUFDO1NBQzNEO0FBQ0QsWUFBSSxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDO0FBQ3JCLGNBQU0sR0FBRyxLQUFLLENBQUM7T0FDaEI7S0FDRjs7O1NBeERHLFVBQVU7Ozs7O0lBNERWLFFBQVE7V0FBUixRQUFROzBCQUFSLFFBQVE7OztlQUFSLFFBQVE7OzBCQUVQLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ2YsVUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDL0QsVUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDOztBQUVkLFVBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ2pDLFVBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO0FBQy9CLFVBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO0FBQy9CLFVBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDOztBQUViLFVBQUksTUFBTSxHQUFHLEtBQUssQ0FBQztBQUNuQixhQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUEsSUFBSyxDQUFDLE1BQU0sRUFDdkYsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQzVCO0FBQ0UsY0FBTSxHQUFHLEtBQUssQ0FBQztPQUNoQjs7QUFFRCxVQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztBQUNqQixVQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDcEIsVUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ3BCLFVBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO0FBQzdCLFlBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7QUFDM0IsWUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7QUFDdkMsaUJBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDOUIsWUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO09BQ2pDO0FBQ0QsVUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0tBQ3pCOzs7U0E1QkcsUUFBUTs7Ozs7SUFpQ1IsUUFBUTtBQUNaLFdBREksUUFBUSxHQUNDOzBCQURULFFBQVE7O0FBRVYsUUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7QUFDbEIsUUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUM7R0FDckI7O2VBSkcsUUFBUTs7MEJBTU4sSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7O0FBRWhCLFVBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUNwQyxVQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7QUFDcEMsVUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQzs7QUFFZCxhQUFNLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sRUFDaEM7QUFDRSxZQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDO0FBQ2xELFlBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7QUFDbEQsWUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDO0FBQzVDLGFBQUssQ0FBQztPQUNQOztBQUVELFVBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDeEIsVUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7S0FFZDs7O1NBdkJHLFFBQVE7Ozs7O0lBMkJSLElBQUk7QUFDUixXQURJLElBQUksQ0FDSSxHQUFHLEVBQUU7MEJBRGIsSUFBSTs7QUFDVyxRQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztHQUFFOztlQURoQyxJQUFJOzswQkFFRixJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUNoQixVQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0tBQzNCOzs7U0FKRyxJQUFJOzs7OztJQVFKLElBQUk7V0FBSixJQUFJOzBCQUFKLElBQUk7OztlQUFKLElBQUk7OzBCQUNGLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ2hCLFVBQUksQ0FBQyxHQUFHLEFBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUMsVUFBVSxBQUFDLENBQUM7QUFDdEQsVUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQUUsU0FBQyxHQUFHLEdBQUcsQ0FBQztPQUFDO0FBQ3RCLFVBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsRUFBRTtBQUNyQixZQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7T0FDakQ7S0FDRjs7O1NBUEcsSUFBSTs7Ozs7SUFXRyxLQUFLLFdBQUwsS0FBSztZQUFMLEtBQUs7O0FBQ2hCLFdBRFcsS0FBSyxDQUNKLE9BQU8sRUFBQyxLQUFLLEVBQUMsRUFBRSxFQUFFOzBCQURuQixLQUFLOzt3RUFBTCxLQUFLLGFBRVYsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDOztBQUNiLFdBQUssSUFBSSxHQUFJLENBQUMsQ0FBRTtBQUNoQixXQUFLLEtBQUssR0FBSSxDQUFDLENBQUU7QUFDakIsV0FBSyxJQUFJLEdBQUksQ0FBQyxDQUFFO0FBQ2hCLFdBQUssTUFBTSxHQUFJLENBQUMsQ0FBRTtBQUNsQixXQUFLLElBQUksR0FBSSxDQUFDLENBQUU7QUFDaEIsV0FBSyxhQUFhLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztBQUM5QixXQUFLLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQzlCLFFBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDO0FBQ2pDLFFBQUksUUFBUSxHQUFHLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNsRCxRQUFJLFFBQVEsR0FBRyxRQUFRLENBQUMsb0JBQW9CLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDakQsWUFBUSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDbEQsV0FBSyxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUMvQyxXQUFLLE9BQU8sR0FBRyxDQUFDLENBQUM7QUFDakIsV0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ2IsV0FBSyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ2YsV0FBSyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ2YsV0FBSyxTQUFTLEdBQUcsSUFBSSxDQUFDO0FBQ3RCLFdBQUssRUFBRSxHQUFHLElBQUksQ0FBQztBQUNmLFdBQUssSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFDMUIsV0FBSyxNQUFNLEdBQUcsT0FBSyxJQUFJLENBQUM7QUFDeEIsV0FBSyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLFdBQUssSUFBSSxHQUFHLENBQUMsQ0FBQztBQUNkLFdBQUssSUFBSSxHQUFHLElBQUksQ0FBQztBQUNqQixXQUFLLElBQUksR0FBRyxJQUFJLENBQUM7QUFDakIsV0FBSyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQ25CLFdBQUssS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFLLElBQUksQ0FBQyxDQUFDO0FBQzFCLFdBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUNiLFdBQUssT0FBTyxHQUFHLE9BQU8sQ0FBQzs7O0dBRXhCOztlQWhDWSxLQUFLOzs7OzBCQXlDVixTQUFTLEVBQUU7QUFDZixlQUFTLEdBQUcsS0FBSyxDQUFDO0FBQ2xCLGFBQU8sU0FBUyxJQUFJLENBQUMsRUFBQztBQUNwQixlQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLElBQUksU0FBUyxJQUFJLENBQUMsRUFDNUM7QUFDRSxjQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUM7QUFDNUMsY0FBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7QUFDcEMsbUJBQVMsR0FBRyxLQUFLLENBQUM7U0FDbkIsQ0FBQzs7QUFFRixZQUFHLFNBQVMsR0FBRyxDQUFDLEVBQUM7QUFDZixtQkFBUyxHQUFHLEVBQUUsRUFBRSxTQUFTLEFBQUMsQ0FBQztBQUMzQixpQkFBTztTQUNSOztBQUVELFlBQUksR0FBRyxHQUFHLEtBQUssQ0FBQztBQUNoQixlQUFPLENBQUMsR0FBRyxFQUFFO0FBQ1gsY0FBSSxJQUFJLENBQUMsS0FBSyxHQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQUFBQyxFQUFFO0FBQzVDLGdCQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDYixnQkFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFDLElBQUksQ0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlELGVBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDO1dBQzVCLE1BQU07QUFDTCxrQkFBTTtXQUNQO1NBQ0Y7QUFDRCxZQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUM7QUFDNUMsWUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7T0FDckM7S0FDRjs7Ozs7OzBCQUdLLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBQyxJQUFJLEVBQUUsV0FBVyxFQUFDLE9BQU8sRUFBRTtBQUN0RSxVQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDaEIsZUFBTyxLQUFLLENBQUM7T0FDZDtBQUNELFVBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLFVBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNYLFVBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ1gsVUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDWCxVQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNYLFVBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLFVBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0FBQ3BCLFVBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxJQUFJLENBQUMsQ0FBQztBQUN4QixVQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssSUFBSSxDQUFDLENBQUM7QUFDeEIsVUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDZixVQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUN2QixVQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztBQUMzQixVQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsSUFBSSxJQUFJLENBQUM7QUFDdkMsVUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMxQyxVQUFJLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7Ozs7O0FBQUMsQUFLdEMsVUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ3pCLFVBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDNUQsVUFBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLEVBQUM7QUFDdEIsaUJBQVM7T0FDVjtBQUNELFVBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztBQUN6QixhQUFPLElBQUksQ0FBQztLQUNiOzs7d0JBRUcsUUFBUSxFQUFFO0FBQ1osVUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksRUFBRTtBQUNyQixZQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQ3JCLFlBQUksQ0FBQyxJQUFJLElBQUksUUFBUSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUM7QUFDakMsZ0JBQVEsQ0FBQyxLQUFLLElBQUksSUFBSTs7QUFBQyxBQUV2QixZQUFJLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFO0FBQ2xCLGFBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hDLGNBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDWCxhQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN6QixjQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7QUFDcEIsZ0JBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLENBQUM7QUFDL0IsZ0JBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO0FBQzdCLGtCQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixFQUFFLENBQUM7QUFDaEMsa0JBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDakQ7QUFDRCxnQkFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO1dBQ2xEO0FBQ0QsY0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLEVBQUM7QUFDdEIsbUJBQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDbkMscUJBQVM7V0FDVjs7QUFFRCxjQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFDMUIsY0FBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFDckIsY0FBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQ3hCLGFBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQSxBQUFDLENBQUMsQ0FBQztBQUN0RSxhQUFHLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3ZDLE1BQU07QUFDTCxjQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ1gsY0FBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUMzQztPQUNGLE1BQU07QUFDTCxZQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO09BQ3JCO0tBQ0Y7Ozt3QkExR087QUFBRSxhQUFPLElBQUksQ0FBQyxFQUFFLENBQUM7S0FBRTtzQkFDckIsQ0FBQyxFQUFFO0FBQUUsVUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQUU7Ozt3QkFDeEM7QUFBRSxhQUFPLElBQUksQ0FBQyxFQUFFLENBQUM7S0FBRTtzQkFDckIsQ0FBQyxFQUFFO0FBQUUsVUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQUU7Ozt3QkFDeEM7QUFBRSxhQUFPLElBQUksQ0FBQyxFQUFFLENBQUM7S0FBRTtzQkFDckIsQ0FBQyxFQUFFO0FBQUUsVUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQUU7OztTQXRDckMsS0FBSztFQUFTLE9BQU8sQ0FBQyxPQUFPOztBQThJMUMsU0FBUyxJQUFJLENBQUMsSUFBSSxFQUFFO0FBQ2xCLE1BQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBQ2hCLE1BQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0FBQ2QsVUFBUSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQ2hGOztBQUVELFNBQVMsS0FBSyxDQUFDLElBQUksRUFBRTtBQUNuQixNQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQztBQUNqQixNQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztBQUNkLFVBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUNoRjs7QUFFRCxTQUFTLEtBQUssQ0FBQyxJQUFJLEVBQUU7QUFDbkIsTUFBSSxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUM7QUFDakIsTUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7QUFDZCxNQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDO0FBQzFDLFVBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUNoRjs7SUFFWSxPQUFPLFdBQVAsT0FBTztBQUNsQixXQURXLE9BQU8sQ0FDTixLQUFLLEVBQUUsRUFBRSxFQUFFLFlBQVksRUFBRTswQkFEMUIsT0FBTzs7QUFFaEIsUUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7QUFDakMsUUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDbkIsUUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7QUFDbEIsUUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUM7QUFDdEIsUUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1QixTQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFO0FBQzNCLFVBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUMvQztBQUNELFNBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUU7QUFDMUIsVUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNsQztHQUNGOzs7QUFBQTtlQWJVLE9BQU87OzJCQWdCWDtBQUNMLFVBQUksV0FBVyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDO0FBQzVDLFVBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7QUFDN0IsVUFBSSxHQUFHLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsTUFBTTs7QUFBQyxBQUUvQyxhQUFPLElBQUksQ0FBQyxZQUFZLEdBQUcsR0FBRyxFQUFFO0FBQzlCLFlBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUM1RCxZQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvRCxZQUFJLFdBQVcsSUFBSyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQUFBQyxFQUFFO0FBQzVDLGNBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7QUFDM0IsZUFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRTtBQUM5QyxnQkFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZCLGdCQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRTtBQUNsQixtQkFBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDdEksb0JBQU07YUFDUDtXQUNGO0FBQ0QsY0FBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0FBQ3BCLGNBQUksSUFBSSxDQUFDLFlBQVksR0FBRyxHQUFHLEVBQUU7QUFDM0IsZ0JBQUksQ0FBQyxRQUFRLEdBQUcsV0FBVyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztXQUNuRjtTQUNGLE1BQU07QUFDTCxnQkFBTTtTQUNQO09BQ0Y7O0FBQUEsQUFFRCxVQUFJLElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsaUJBQWlCLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFOztBQUVoRixZQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDeEIsWUFBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFBLEFBQUMsQ0FBQztPQUMvRTs7O0FBQUEsQUFHRCxVQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtBQUM1QixZQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDNUMsY0FBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBQzFCLGNBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLGNBQWMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQSxHQUFJLENBQUMsQ0FBQztBQUNqRyxjQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUNmLGNBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1NBQ2hCO09BQ0Y7OztBQUFBLEFBR0QsVUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUMxRSxZQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxjQUFjLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUEsR0FBSSxDQUFDLENBQUM7QUFDakcsWUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztBQUMvQixZQUFJLFdBQVcsR0FBRyxBQUFDLENBQUMsR0FBRyxJQUFJLEdBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFVLEFBQUMsR0FBSSxDQUFDLENBQUM7QUFDMUQsWUFBSSxLQUFLLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFbEMsWUFBSSxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtBQUMvQixjQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUNmLGNBQUksS0FBSyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUMxQjs7QUFFRCxZQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLFNBQVMsRUFBRTtBQUN0RCxjQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRTtBQUNoQixpQkFBSyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7V0FDakI7QUFDRCxjQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtBQUNmLGdCQUFJLEtBQUssR0FBRyxDQUFDO2dCQUFFLElBQUksR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO0FBQ25DLG1CQUFPLEtBQUssR0FBRyxJQUFJLElBQUksV0FBVyxHQUFHLENBQUMsRUFBRTtBQUN0QyxrQkFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM1QixrQkFBSSxFQUFFLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDLElBQUksRUFBRTtBQUN0QyxrQkFBRSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO0FBQ3RCLGtCQUFFLFdBQVcsQ0FBQztlQUNmO0FBQ0QsbUJBQUssRUFBRSxDQUFDO0FBQ1IsbUJBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNkLGtCQUFJLEtBQUssQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQzthQUNsRDtXQUNGLE1BQU07QUFDTCxpQkFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRTtBQUNoRCxrQkFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xCLGtCQUFJLEVBQUUsQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFO0FBQ3RDLGtCQUFFLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUM7ZUFDdkI7YUFDRjtXQUNGO1NBQ0Y7O0FBRUQsWUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ2IsWUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFO0FBQ3ZDLGNBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1NBQ2hCO09BRUY7OztBQUFBLEFBR0QsVUFBSSxDQUFDLGNBQWMsSUFBSSxLQUFLLENBQUM7QUFDN0IsVUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDdEQsVUFBSSxDQUFDLFVBQVUsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztLQUVqRTs7OzRCQUVPO0FBQ04sV0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUU7QUFDdkQsWUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN6QixZQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUU7QUFDZCxhQUFHLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3BDLFlBQUUsQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQztBQUNwQixZQUFFLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztBQUNuQixZQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7U0FDekI7T0FDRjtLQUNGOzs7dUNBRWtCO0FBQ2pCLFVBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUM5QyxVQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO0FBQzNCLFdBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUU7QUFDL0MsWUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDZCxjQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztTQUMxQjtPQUNGO0tBQ0Y7Ozs0QkFFTztBQUNOLFVBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO0FBQ2xCLFVBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDO0FBQ3RCLFVBQUksQ0FBQyxpQkFBaUIsR0FBRyxDQUFDLENBQUM7QUFDM0IsVUFBSSxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUM7QUFDekIsVUFBSSxDQUFDLGdCQUFnQixHQUFHLENBQUMsQ0FBQztBQUMxQixVQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDekIsVUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztBQUMvQixXQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFO0FBQ3BELGlCQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUN4QixpQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7T0FDNUI7S0FDRjs7O1NBaEpVLE9BQU87OztBQW9KcEIsT0FBTyxDQUFDLFNBQVMsQ0FBQyxZQUFZLEdBQUc7O0FBRS9CLENBQ0UsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUN0RCxJQUFJLFVBQVUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUM3RCxJQUFJLElBQUksRUFBRSxFQUNWLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsRUFDdkQsSUFBSSxRQUFRLEVBQUUsRUFDZCxJQUFJLFFBQVEsRUFBRSxFQUNkLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQ3hDLElBQUksVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQ2xELElBQUksSUFBSSxFQUFFLEVBQ1YsSUFBSSxVQUFVLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQ2xFLElBQUksVUFBVSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxFQUMzRCxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FDWjtBQUNELENBQ0UsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUN0RCxJQUFJLFVBQVUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUM3RCxJQUFJLElBQUksRUFBRSxFQUNWLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsRUFDdkQsSUFBSSxRQUFRLEVBQUUsRUFDZCxJQUFJLFFBQVEsRUFBRSxFQUNkLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQ3hDLElBQUksVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQ2xELElBQUksSUFBSSxFQUFFLEVBQ1YsSUFBSSxVQUFVLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQ2hFLElBQUksVUFBVSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUN6RCxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FDWjtBQUNELENBQ0UsSUFBSSxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsRUFDbEQsSUFBSSxVQUFVLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQ2hFLElBQUksSUFBSSxFQUFFLEVBQ1YsSUFBSSxVQUFVLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQSxHQUFJLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsRUFDbEUsSUFBSSxRQUFRLEVBQUUsRUFDZCxJQUFJLFFBQVEsRUFBRSxFQUNkLElBQUksVUFBVSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQ3ZDLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsRUFDdEQsSUFBSSxJQUFJLEVBQUUsRUFDVixJQUFJLFVBQVUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxFQUMvRCxJQUFJLFVBQVUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQzVELElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUNaO0FBQ0QsQ0FDRSxJQUFJLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUNsRCxJQUFJLFVBQVUsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsRUFDaEUsSUFBSSxJQUFJLEVBQUUsRUFDVixJQUFJLFVBQVUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFBLEdBQUksSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUNsRSxJQUFJLElBQUksRUFBRSxFQUNWLElBQUksUUFBUSxFQUFFLEVBQ2QsSUFBSSxRQUFRLEVBQUUsRUFDZCxJQUFJLFVBQVUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUN2QyxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQ3RELElBQUksSUFBSSxFQUFFLEVBQ1YsSUFBSSxVQUFVLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsRUFDN0QsSUFBSSxVQUFVLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUMxRCxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FDWixFQUNEO0FBQ0UsSUFBSSxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsRUFDakQsSUFBSSxVQUFVLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUNyRCxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQ3JELElBQUksUUFBUSxFQUFFLEVBQ2QsSUFBSSxRQUFRLEVBQUUsRUFDZCxJQUFJLFVBQVUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsRUFDaEQsSUFBSSxVQUFVLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUNyRCxJQUFJLElBQUksRUFBRSxFQUNWLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsRUFDcEQsSUFBSSxVQUFVLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsRUFDNUQsSUFBSSxVQUFVLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUN6RCxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FDWixFQUNEO0FBQ0UsSUFBSSxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsRUFDbEQsSUFBSSxVQUFVLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQ2hFLElBQUksVUFBVSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxBQUFDLENBQUMsR0FBSSxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQzNELElBQUksUUFBUSxFQUFFLEVBQ2QsSUFBSSxRQUFRLEVBQUUsRUFDZCxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQ3ZELElBQUksVUFBVSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUNoRCxJQUFJLElBQUksRUFBRSxFQUNWLElBQUksVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQ2hELElBQUksVUFBVSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQzNELElBQUksVUFBVSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQ3ZELElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUNaLEVBQ0Q7QUFDRSxJQUFJLFVBQVUsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQ3BELElBQUksVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUMzQyxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQ3JELElBQUksUUFBUSxFQUFFLEVBQ2QsSUFBSSxRQUFRLEVBQUUsRUFDZCxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUN4QyxJQUFJLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUNsRCxJQUFJLElBQUksRUFBRSxFQUNWLElBQUksVUFBVSxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxFQUNsRSxJQUFJLFVBQVUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsRUFDM0QsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQ1osRUFDRDtBQUNFLElBQUksVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQ2pELElBQUksSUFBSSxFQUFFLEVBQ1YsSUFBSSxVQUFVLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUNyRCxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQ3JELElBQUksVUFBVSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsRUFDdEQsSUFBSSxRQUFRLEVBQUUsRUFDZCxJQUFJLFFBQVEsRUFBRSxFQUNkLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQ3hDLElBQUksSUFBSSxFQUFFLEVBQ1YsSUFBSSxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsRUFDbEQsSUFBSSxVQUFVLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQ2xFLElBQUksVUFBVSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxFQUMzRCxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FDWixDQUNGLENBQ0E7QUFDRCxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxDQUMzQjs7O0FBR0UsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQ3JDLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUN0QyxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFDdEMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQ3RDLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBRXhDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUN4QyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFDekMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQ3pDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUN6QyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUUzQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUN2QyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUN4QyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUN4QyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUN4QyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUV4QyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUMxQyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUMzQyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUMzQyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUMzQyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUUzQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsRUFDckMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQ3RDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUN0QyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsRUFDdEMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBRXRDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQ3RDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQ3ZDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQ3ZDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQ3ZDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBRXZDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsRUFDekMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUMxQyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQzFDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsRUFDMUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUMxQyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQzFDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUN2QyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsRUFDdkMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBRXZDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUMxQyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsRUFDM0MsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQzNDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUMzQyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsRUFDM0MsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQzNDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQ3hDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQ3hDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUs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QUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxhQUFhLENBQUEsR0FBSSxDQUFDLENBQUM7QUFDckQsTUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFJLEVBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUEsQUFBQyxHQUFHLENBQUM7OztBQUFDLENBRzNEOzs7QUFBQSxBQUdELFFBQVEsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLFVBQVUsT0FBTyxFQUFFLE9BQU8sRUFBRTtBQUN0RCxNQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO0FBQ25CLE1BQUksS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSztNQUFFLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU07O0FBQUMsQUFFM0QsS0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDM0QsTUFBSSxTQUFTLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDL0MsS0FBRyxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUMsU0FBUyxHQUFHLHVCQUF1QixDQUFDOztBQUUxRCxLQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUEsR0FBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDcEQsS0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ2hCLEtBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxLQUFLLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUNyQyxLQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDYixLQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFB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TUFBTSxHQUFHLFVBQVUsR0FBSSxDQUFDLENBQUEsQUFBQyxDQUFDO0FBQ3BELE1BQUksSUFBSSxHQUFHLE1BQU0sR0FBRyxVQUFVLENBQUM7QUFDL0IsTUFBSSxLQUFLLEdBQUcsU0FBUyxHQUFHLEtBQUssQ0FBQztBQUM5QixNQUFJLEtBQUssR0FBRyxVQUFVLEdBQUcsTUFBTSxDQUFDOztBQUVoQyxVQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUM3QixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQUFBQyxJQUFJLEdBQUksU0FBUyxHQUFHLEtBQUssRUFBRSxBQUFDLElBQUksR0FBSSxVQUFVLEdBQUcsTUFBTSxDQUFDLEVBQzNFLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUEsR0FBSSxTQUFTLEdBQUcsS0FBSyxFQUFFLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQSxHQUFJLFVBQVUsR0FBRyxNQUFNLENBQUMsRUFDbkYsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQSxHQUFJLFNBQVMsR0FBRyxLQUFLLEVBQUUsQUFBQyxJQUFJLEdBQUksVUFBVSxHQUFHLE1BQU0sQ0FBQyxDQUNoRixDQUFDLENBQUM7QUFDSCxVQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUM3QixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQUFBQyxJQUFJLEdBQUksU0FBUyxHQUFHLEtBQUssRUFBRSxBQUFDLElBQUksR0FBSSxVQUFVLEdBQUcsTUFBTSxDQUFDLEVBQzNFLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxBQUFDLElBQUksR0FBSSxTQUFTLEdBQUcsS0FBSyxFQUFFLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQSxHQUFJLFVBQVUsR0FBRyxNQUFNLENBQUMsRUFDL0UsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FB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QUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7S0FDMUI7Ozs2QkFFUTtBQUNQLFVBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUNwQyxVQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7QUFDL0QsVUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0tBQzFCOzs7NEJBRU87QUFDTixVQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUN2QyxVQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7S0FDMUI7OzsyQkFFTTtBQUNMLFVBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztLQUN6Qjs7OzZCQUVRO0FBQ1AsVUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUUsT0FBTztBQUN0QyxVQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDcEMsVUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztBQUM1QyxVQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztBQUNyRCxVQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQztLQUM1Qjs7O1NBekNVLFNBQVMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cImdyYXBoaWNzLmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cImlvLmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInNvbmcuanNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwidGV4dC5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJ1dGlsLmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cImRzcC5qc1wiIC8+XHJcblwidXNlIHN0cmljdFwiO1xyXG4vLy8vIFdlYiBBdWRpbyBBUEkg44Op44OD44OR44O844Kv44Op44K5IC8vLy9cclxudmFyIGZmdCA9IG5ldyBGRlQoNDA5NiwgNDQxMDApO1xyXG52YXIgQlVGRkVSX1NJWkUgPSAxMDI0O1xyXG52YXIgVElNRV9CQVNFID0gOTY7XHJcblxyXG52YXIgbm90ZUZyZXEgPSBbXTtcclxuZm9yICh2YXIgaSA9IC04MTsgaSA8IDQ2OyArK2kpIHtcclxuICBub3RlRnJlcS5wdXNoKE1hdGgucG93KDIsIGkgLyAxMikpO1xyXG59XHJcblxyXG52YXIgU3F1YXJlV2F2ZSA9IHtcclxuICBiaXRzOiA0LFxyXG4gIHdhdmVkYXRhOiBbMHhmLCAweGYsIDB4ZiwgMHhmLCAweGYsIDB4ZiwgMHhmLCAweGYsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdXHJcbn07Ly8gNGJpdCB3YXZlIGZvcm1cclxuXHJcbnZhciBTYXdXYXZlID0ge1xyXG4gIGJpdHM6IDQsXHJcbiAgd2F2ZWRhdGE6IFsweDAsIDB4MSwgMHgyLCAweDMsIDB4NCwgMHg1LCAweDYsIDB4NywgMHg4LCAweDksIDB4YSwgMHhiLCAweGMsIDB4ZCwgMHhlLCAweGZdXHJcbn07Ly8gNGJpdCB3YXZlIGZvcm1cclxuXHJcbnZhciBUcmlXYXZlID0ge1xyXG4gIGJpdHM6IDQsXHJcbiAgd2F2ZWRhdGE6IFsweDAsIDB4MiwgMHg0LCAweDYsIDB4OCwgMHhBLCAweEMsIDB4RSwgMHhGLCAweEUsIDB4QywgMHhBLCAweDgsIDB4NiwgMHg0LCAweDJdXHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZGVjb2RlU3RyKGJpdHMsIHdhdmVzdHIpIHtcclxuICB2YXIgYXJyID0gW107XHJcbiAgdmFyIG4gPSBiaXRzIC8gNCB8IDA7XHJcbiAgdmFyIGMgPSAwO1xyXG4gIHZhciB6ZXJvcG9zID0gMSA8PCAoYml0cyAtIDEpO1xyXG4gIHdoaWxlIChjIDwgd2F2ZXN0ci5sZW5ndGgpIHtcclxuICAgIHZhciBkID0gMDtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgKytpKSB7XHJcbiAgICAgIGV2YWwoXCJkID0gKGQgPDwgNCkgKyAweFwiICsgd2F2ZXN0ci5jaGFyQXQoYysrKSArIFwiO1wiKTtcclxuICAgIH1cclxuICAgIGFyci5wdXNoKChkIC0gemVyb3BvcykgLyB6ZXJvcG9zKTtcclxuICB9XHJcbiAgcmV0dXJuIGFycjtcclxufVxyXG5cclxudmFyIHdhdmVzID0gW1xyXG4gICAgZGVjb2RlU3RyKDQsICdFRUVFRUVFRUVFRUVFRUVFMDAwMDAwMDAwMDAwMDAwMCcpLFxyXG4gICAgZGVjb2RlU3RyKDQsICcwMDExMjIzMzQ0NTU2Njc3ODg5OUFBQkJDQ0RERUVGRicpLFxyXG4gICAgZGVjb2RlU3RyKDQsICcwMjM0NjY0NTlBQThBN0E5Nzc5NjU2NTZBQ0FBQ0RFRicpLFxyXG4gICAgZGVjb2RlU3RyKDQsICdCRENEQ0E5OTlBQ0RDREI5NDIxMjM2Nzc3NjMyMTI0NycpLFxyXG4gICAgZGVjb2RlU3RyKDQsICc3QUNERURDQTc0MjEwMTI0N0JERURCNzMyMDEzN0U3OCcpLFxyXG4gICAgZGVjb2RlU3RyKDQsICdBQ0NBNzc5QkRFREE2NjY3OTk5NDEwMTI2Nzc0MjI0NycpLFxyXG4gICAgZGVjb2RlU3RyKDQsICc3RUM5Q0VBN0NGRDhBQjcyOEQ5NDU3MjAzODUxMzUzMScpLFxyXG4gICAgZGVjb2RlU3RyKDQsICdFRTc3RUU3N0VFNzdFRTc3MDA3NzAwNzcwMDc3MDA3NycpLFxyXG4gICAgZGVjb2RlU3RyKDQsICdFRUVFODg4ODg4ODg4ODg4MDAwMDg4ODg4ODg4ODg4OCcpLy/jg47jgqTjgrrnlKjjga7jg4Djg5/jg7zms6LlvaJcclxuXTtcclxuXHJcbnZhciB3YXZlU2FtcGxlcyA9IFtdO1xyXG5leHBvcnQgZnVuY3Rpb24gV2F2ZVNhbXBsZShhdWRpb2N0eCwgY2gsIHNhbXBsZUxlbmd0aCwgc2FtcGxlUmF0ZSkge1xyXG5cclxuICB0aGlzLnNhbXBsZSA9IGF1ZGlvY3R4LmNyZWF0ZUJ1ZmZlcihjaCwgc2FtcGxlTGVuZ3RoLCBzYW1wbGVSYXRlIHx8IGF1ZGlvY3R4LnNhbXBsZVJhdGUpO1xyXG4gIHRoaXMubG9vcCA9IGZhbHNlO1xyXG4gIHRoaXMuc3RhcnQgPSAwO1xyXG4gIHRoaXMuZW5kID0gKHNhbXBsZUxlbmd0aCAtIDEpIC8gKHNhbXBsZVJhdGUgfHwgYXVkaW9jdHguc2FtcGxlUmF0ZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVXYXZlU2FtcGxlRnJvbVdhdmVzKGF1ZGlvY3R4LCBzYW1wbGVMZW5ndGgpIHtcclxuICBmb3IgKHZhciBpID0gMCwgZW5kID0gd2F2ZXMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgIHZhciBzYW1wbGUgPSBuZXcgV2F2ZVNhbXBsZShhdWRpb2N0eCwgMSwgc2FtcGxlTGVuZ3RoKTtcclxuICAgIHdhdmVTYW1wbGVzLnB1c2goc2FtcGxlKTtcclxuICAgIGlmIChpICE9IDgpIHtcclxuICAgICAgdmFyIHdhdmVkYXRhID0gd2F2ZXNbaV07XHJcbiAgICAgIHZhciBkZWx0YSA9IDQ0MC4wICogd2F2ZWRhdGEubGVuZ3RoIC8gYXVkaW9jdHguc2FtcGxlUmF0ZTtcclxuICAgICAgdmFyIHN0aW1lID0gMDtcclxuICAgICAgdmFyIG91dHB1dCA9IHNhbXBsZS5zYW1wbGUuZ2V0Q2hhbm5lbERhdGEoMCk7XHJcbiAgICAgIHZhciBsZW4gPSB3YXZlZGF0YS5sZW5ndGg7XHJcbiAgICAgIHZhciBpbmRleCA9IDA7XHJcbiAgICAgIHZhciBlbmRzYW1wbGUgPSAwO1xyXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHNhbXBsZUxlbmd0aDsgKytqKSB7XHJcbiAgICAgICAgaW5kZXggPSBzdGltZSB8IDA7XHJcbiAgICAgICAgb3V0cHV0W2pdID0gd2F2ZWRhdGFbaW5kZXhdO1xyXG4gICAgICAgIHN0aW1lICs9IGRlbHRhO1xyXG4gICAgICAgIGlmIChzdGltZSA+PSBsZW4pIHtcclxuICAgICAgICAgIHN0aW1lID0gc3RpbWUgLSBsZW47XHJcbiAgICAgICAgICBlbmRzYW1wbGUgPSBqO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBzYW1wbGUuZW5kID0gZW5kc2FtcGxlIC8gYXVkaW9jdHguc2FtcGxlUmF0ZTtcclxuICAgICAgc2FtcGxlLmxvb3AgPSB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8g44Oc44Kk44K5OOOBr+ODjuOCpOOCuuazouW9ouOBqOOBmeOCi1xyXG4gICAgICB2YXIgb3V0cHV0ID0gc2FtcGxlLnNhbXBsZS5nZXRDaGFubmVsRGF0YSgwKTtcclxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBzYW1wbGVMZW5ndGg7ICsraikge1xyXG4gICAgICAgIG91dHB1dFtqXSA9IE1hdGgucmFuZG9tKCkgKiAyLjAgLSAxLjA7XHJcbiAgICAgIH1cclxuICAgICAgc2FtcGxlLmVuZCA9IHNhbXBsZUxlbmd0aCAvIGF1ZGlvY3R4LnNhbXBsZVJhdGU7XHJcbiAgICAgIHNhbXBsZS5sb29wID0gdHJ1ZTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBXYXZlVGV4dHVyZSh3YXZlKSB7XHJcbiAgdGhpcy53YXZlID0gd2F2ZSB8fCB3YXZlc1swXTtcclxuICB0aGlzLnRleCA9IG5ldyBDYW52YXNUZXh0dXJlKDMyMCwgMTAgKiAxNik7XHJcbiAgdGhpcy5yZW5kZXIoKTtcclxufVxyXG5cclxuV2F2ZVRleHR1cmUucHJvdG90eXBlID0ge1xyXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGN0eCA9IHRoaXMudGV4LmN0eDtcclxuICAgIHZhciB3YXZlID0gdGhpcy53YXZlO1xyXG4gICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjdHguY2FudmFzLndpZHRoLCBjdHguY2FudmFzLmhlaWdodCk7XHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnd2hpdGUnO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzMjA7IGkgKz0gMTApIHtcclxuICAgICAgY3R4Lm1vdmVUbyhpLCAwKTtcclxuICAgICAgY3R4LmxpbmVUbyhpLCAyNTUpO1xyXG4gICAgfVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxNjA7IGkgKz0gMTApIHtcclxuICAgICAgY3R4Lm1vdmVUbygwLCBpKTtcclxuICAgICAgY3R4LmxpbmVUbygzMjAsIGkpO1xyXG4gICAgfVxyXG4gICAgY3R4LmZpbGxTdHlsZSA9ICdyZ2JhKDI1NSwyNTUsMjU1LDAuNyknO1xyXG4gICAgY3R4LnJlY3QoMCwgMCwgY3R4LmNhbnZhcy53aWR0aCwgY3R4LmNhbnZhcy5oZWlnaHQpO1xyXG4gICAgY3R4LnN0cm9rZSgpO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGMgPSAwOyBpIDwgY3R4LmNhbnZhcy53aWR0aDsgaSArPSAxMCwgKytjKSB7XHJcbiAgICAgIGN0eC5maWxsUmVjdChpLCAod2F2ZVtjXSA+IDApID8gODAgLSB3YXZlW2NdICogODAgOiA4MCwgMTAsIE1hdGguYWJzKHdhdmVbY10pICogODApO1xyXG4gICAgfVxyXG4gICAgdGhpcy50ZXgudGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgfVxyXG59O1xyXG5cclxuLy8vIOOCqOODs+ODmeODreODvOODl+OCuOOCp+ODjeODrOODvOOCv+ODvFxyXG5leHBvcnQgZnVuY3Rpb24gRW52ZWxvcGVHZW5lcmF0b3Iodm9pY2UsIGF0dGFjaywgZGVjYXksIHN1c3RhaW4sIHJlbGVhc2UpIHtcclxuICB0aGlzLnZvaWNlID0gdm9pY2U7XHJcbiAgLy90aGlzLmtleW9uID0gZmFsc2U7XHJcbiAgdGhpcy5hdHRhY2sgPSBhdHRhY2sgfHwgMC4wMDA1O1xyXG4gIHRoaXMuZGVjYXkgPSBkZWNheSB8fCAwLjA1O1xyXG4gIHRoaXMuc3VzdGFpbiA9IHN1c3RhaW4gfHwgMC41O1xyXG4gIHRoaXMucmVsZWFzZSA9IHJlbGVhc2UgfHwgMC41O1xyXG4gIHRoaXMudiA9IDEuMDtcclxuXHJcbn07XHJcblxyXG5FbnZlbG9wZUdlbmVyYXRvci5wcm90b3R5cGUgPVxyXG57XHJcbiAga2V5b246IGZ1bmN0aW9uICh0LHZlbCkge1xyXG4gICAgdGhpcy52ID0gdmVsIHx8IDEuMDtcclxuICAgIHZhciB2ID0gdGhpcy52O1xyXG4gICAgdmFyIHQwID0gdCB8fCB0aGlzLnZvaWNlLmF1ZGlvY3R4LmN1cnJlbnRUaW1lO1xyXG4gICAgdmFyIHQxID0gdDAgKyB0aGlzLmF0dGFjayAqIHY7XHJcbiAgICB2YXIgZ2FpbiA9IHRoaXMudm9pY2UuZ2Fpbi5nYWluO1xyXG4gICAgZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXModDApO1xyXG4gICAgZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLCB0MCk7XHJcbiAgICBnYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHYsIHQxKTtcclxuICAgIGdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUodGhpcy5zdXN0YWluICogdiwgdDAgKyB0aGlzLmRlY2F5IC8gdik7XHJcbiAgICAvL2dhaW4uc2V0VGFyZ2V0QXRUaW1lKHRoaXMuc3VzdGFpbiAqIHYsIHQxLCB0MSArIHRoaXMuZGVjYXkgLyB2KTtcclxuICB9LFxyXG4gIGtleW9mZjogZnVuY3Rpb24gKHQpIHtcclxuICAgIHZhciB2b2ljZSA9IHRoaXMudm9pY2U7XHJcbiAgICB2YXIgZ2FpbiA9IHZvaWNlLmdhaW4uZ2FpbjtcclxuICAgIHZhciB0MCA9IHQgfHwgdm9pY2UuYXVkaW9jdHguY3VycmVudFRpbWU7XHJcbiAgICBnYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyh0MCk7XHJcbiAgICAvL2dhaW4uc2V0VmFsdWVBdFRpbWUoMCwgdDAgKyB0aGlzLnJlbGVhc2UgLyB0aGlzLnYpO1xyXG4gICAgLy9nYWluLnNldFRhcmdldEF0VGltZSgwLCB0MCwgdDAgKyB0aGlzLnJlbGVhc2UgLyB0aGlzLnYpO1xyXG4gICAgZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCB0MCArIHRoaXMucmVsZWFzZSAvIHRoaXMudik7XHJcbiAgfVxyXG59O1xyXG5cclxuLy8vIOODnOOCpOOCuVxyXG5leHBvcnQgZnVuY3Rpb24gVm9pY2UoYXVkaW9jdHgpIHtcclxuICB0aGlzLmF1ZGlvY3R4ID0gYXVkaW9jdHg7XHJcbiAgdGhpcy5zYW1wbGUgPSB3YXZlU2FtcGxlc1s2XTtcclxuICB0aGlzLmdhaW4gPSBhdWRpb2N0eC5jcmVhdGVHYWluKCk7XHJcbiAgdGhpcy5nYWluLmdhaW4udmFsdWUgPSAwLjA7XHJcbiAgdGhpcy52b2x1bWUgPSBhdWRpb2N0eC5jcmVhdGVHYWluKCk7XHJcbiAgdGhpcy5lbnZlbG9wZSA9IG5ldyBFbnZlbG9wZUdlbmVyYXRvcih0aGlzKTtcclxuICB0aGlzLmluaXRQcm9jZXNzb3IoKTtcclxuICB0aGlzLmRldHVuZSA9IDEuMDtcclxuICB0aGlzLnZvbHVtZS5nYWluLnZhbHVlID0gMS4wO1xyXG4gIHRoaXMuZ2Fpbi5jb25uZWN0KHRoaXMudm9sdW1lKTtcclxuICB0aGlzLm91dHB1dCA9IHRoaXMudm9sdW1lO1xyXG59O1xyXG5cclxuVm9pY2UucHJvdG90eXBlID0ge1xyXG4gIGluaXRQcm9jZXNzb3I6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMucHJvY2Vzc29yID0gdGhpcy5hdWRpb2N0eC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcclxuICAgIHRoaXMucHJvY2Vzc29yLmJ1ZmZlciA9IHRoaXMuc2FtcGxlLnNhbXBsZTtcclxuICAgIHRoaXMucHJvY2Vzc29yLmxvb3AgPSB0aGlzLnNhbXBsZS5sb29wO1xyXG4gICAgdGhpcy5wcm9jZXNzb3IubG9vcFN0YXJ0ID0gMDtcclxuICAgIHRoaXMucHJvY2Vzc29yLnBsYXliYWNrUmF0ZS52YWx1ZSA9IDEuMDtcclxuICAgIHRoaXMucHJvY2Vzc29yLmxvb3BFbmQgPSB0aGlzLnNhbXBsZS5lbmQ7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5jb25uZWN0KHRoaXMuZ2Fpbik7XHJcbiAgfSxcclxuXHJcbiAgc2V0U2FtcGxlOiBmdW5jdGlvbiAoc2FtcGxlKSB7XHJcbiAgICAgIHRoaXMuZW52ZWxvcGUua2V5b2ZmKDApO1xyXG4gICAgICB0aGlzLnByb2Nlc3Nvci5kaXNjb25uZWN0KHRoaXMuZ2Fpbik7XHJcbiAgICAgIHRoaXMuc2FtcGxlID0gc2FtcGxlO1xyXG4gICAgICB0aGlzLmluaXRQcm9jZXNzb3IoKTtcclxuICAgICAgdGhpcy5wcm9jZXNzb3Iuc3RhcnQoKTtcclxuICB9LFxyXG4gIHN0YXJ0OiBmdW5jdGlvbiAoc3RhcnRUaW1lKSB7XHJcbiAvLyAgIGlmICh0aGlzLnByb2Nlc3Nvci5wbGF5YmFja1N0YXRlID09IDMpIHtcclxuICAgICAgdGhpcy5wcm9jZXNzb3IuZGlzY29ubmVjdCh0aGlzLmdhaW4pO1xyXG4gICAgICB0aGlzLmluaXRQcm9jZXNzb3IoKTtcclxuLy8gICAgfSBlbHNlIHtcclxuLy8gICAgICB0aGlzLmVudmVsb3BlLmtleW9mZigpO1xyXG4vL1xyXG4vLyAgICB9XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5zdGFydChzdGFydFRpbWUpO1xyXG4gIH0sXHJcbiAgc3RvcDogZnVuY3Rpb24gKHRpbWUpIHtcclxuICAgIHRoaXMucHJvY2Vzc29yLnN0b3AodGltZSk7XHJcbiAgICB0aGlzLnJlc2V0KCk7XHJcbiAgfSxcclxuICBrZXlvbjpmdW5jdGlvbih0LG5vdGUsdmVsKVxyXG4gIHtcclxuICAgIHRoaXMucHJvY2Vzc29yLnBsYXliYWNrUmF0ZS5zZXRWYWx1ZUF0VGltZShub3RlRnJlcVtub3RlXSAqIHRoaXMuZGV0dW5lLCB0KTtcclxuICAgIHRoaXMuZW52ZWxvcGUua2V5b24odCx2ZWwpO1xyXG4gIH0sXHJcbiAga2V5b2ZmOmZ1bmN0aW9uKHQpXHJcbiAge1xyXG4gICAgdGhpcy5lbnZlbG9wZS5rZXlvZmYodCk7XHJcbiAgfSxcclxuICByZXNldDpmdW5jdGlvbigpXHJcbiAge1xyXG4gICAgdGhpcy5wcm9jZXNzb3IucGxheWJhY2tSYXRlLmNhbmNlbFNjaGVkdWxlZFZhbHVlcygwKTtcclxuICAgIHRoaXMuZ2Fpbi5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcygwKTtcclxuICAgIHRoaXMuZ2Fpbi5nYWluLnZhbHVlID0gMDtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBBdWRpbygpIHtcclxuICB0aGlzLmVuYWJsZSA9IGZhbHNlO1xyXG4gIHRoaXMuYXVkaW9Db250ZXh0ID0gd2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0IHx8IHdpbmRvdy5tb3pBdWRpb0NvbnRleHQ7XHJcblxyXG4gIGlmICh0aGlzLmF1ZGlvQ29udGV4dCkge1xyXG4gICAgdGhpcy5hdWRpb2N0eCA9IG5ldyB0aGlzLmF1ZGlvQ29udGV4dCgpO1xyXG4gICAgdGhpcy5lbmFibGUgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgdGhpcy52b2ljZXMgPSBbXTtcclxuICBpZiAodGhpcy5lbmFibGUpIHtcclxuICAgIGNyZWF0ZVdhdmVTYW1wbGVGcm9tV2F2ZXModGhpcy5hdWRpb2N0eCwgQlVGRkVSX1NJWkUpO1xyXG4gICAgdGhpcy5maWx0ZXIgPSB0aGlzLmF1ZGlvY3R4LmNyZWF0ZUJpcXVhZEZpbHRlcigpO1xyXG4gICAgdGhpcy5maWx0ZXIudHlwZSA9ICdsb3dwYXNzJztcclxuICAgIHRoaXMuZmlsdGVyLmZyZXF1ZW5jeS52YWx1ZSA9IDIwMDAwO1xyXG4gICAgdGhpcy5maWx0ZXIuUS52YWx1ZSA9IDAuMDAwMTtcclxuICAgIHRoaXMubm9pc2VGaWx0ZXIgPSB0aGlzLmF1ZGlvY3R4LmNyZWF0ZUJpcXVhZEZpbHRlcigpO1xyXG4gICAgdGhpcy5ub2lzZUZpbHRlci50eXBlID0gJ2xvd3Bhc3MnO1xyXG4gICAgdGhpcy5ub2lzZUZpbHRlci5mcmVxdWVuY3kudmFsdWUgPSAxMDAwO1xyXG4gICAgdGhpcy5ub2lzZUZpbHRlci5RLnZhbHVlID0gMS44O1xyXG4gICAgdGhpcy5jb21wID0gdGhpcy5hdWRpb2N0eC5jcmVhdGVEeW5hbWljc0NvbXByZXNzb3IoKTtcclxuICAgIHRoaXMuZmlsdGVyLmNvbm5lY3QodGhpcy5jb21wKTtcclxuICAgIHRoaXMubm9pc2VGaWx0ZXIuY29ubmVjdCh0aGlzLmNvbXApO1xyXG4gICAgdGhpcy5jb21wLmNvbm5lY3QodGhpcy5hdWRpb2N0eC5kZXN0aW5hdGlvbik7XHJcbiAgICBmb3IgKHZhciBpID0gMCxlbmQgPSB0aGlzLlZPSUNFUzsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIHZhciB2ID0gbmV3IFZvaWNlKHRoaXMuYXVkaW9jdHgpO1xyXG4gICAgICB0aGlzLnZvaWNlcy5wdXNoKHYpO1xyXG4gICAgICBpZihpID09ICh0aGlzLlZPSUNFUyAtIDEpKXtcclxuICAgICAgICB2Lm91dHB1dC5jb25uZWN0KHRoaXMubm9pc2VGaWx0ZXIpO1xyXG4gICAgICB9IGVsc2V7XHJcbiAgICAgICAgdi5vdXRwdXQuY29ubmVjdCh0aGlzLmZpbHRlcik7XHJcbiAgICAgIH1cclxuICAgIH1cclxuLy8gIHRoaXMuc3RhcnRlZCA9IGZhbHNlO1xyXG5cclxuICAgIC8vdGhpcy52b2ljZXNbMF0ub3V0cHV0LmNvbm5lY3QoKTtcclxuICB9XHJcblxyXG59XHJcblxyXG5BdWRpby5wcm90b3R5cGUgPSB7XHJcbiAgc3RhcnQ6IGZ1bmN0aW9uICgpXHJcbiAge1xyXG4gIC8vICBpZiAodGhpcy5zdGFydGVkKSByZXR1cm47XHJcblxyXG4gICAgdmFyIHZvaWNlcyA9IHRoaXMudm9pY2VzO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHZvaWNlcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSlcclxuICAgIHtcclxuICAgICAgdm9pY2VzW2ldLnN0YXJ0KDApO1xyXG4gICAgfVxyXG4gICAgLy90aGlzLnN0YXJ0ZWQgPSB0cnVlO1xyXG4gIH0sXHJcbiAgc3RvcDogZnVuY3Rpb24gKClcclxuICB7XHJcbiAgICAvL2lmKHRoaXMuc3RhcnRlZClcclxuICAgIC8ve1xyXG4gICAgICB2YXIgdm9pY2VzID0gdGhpcy52b2ljZXM7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB2b2ljZXMubGVuZ3RoOyBpIDwgZW5kOyArK2kpXHJcbiAgICAgIHtcclxuICAgICAgICB2b2ljZXNbaV0uc3RvcCgwKTtcclxuICAgICAgfVxyXG4gICAgLy8gIHRoaXMuc3RhcnRlZCA9IGZhbHNlO1xyXG4gICAgLy99XHJcbiAgfSxcclxuICBWT0lDRVM6IDEyXHJcbn1cclxuXHJcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4vKiDjgrfjg7zjgrHjg7PjgrXjg7zjgrPjg57jg7Pjg4kgICAgICAgICAgICAgICAgICAgICAgICovXHJcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIE5vdGUobm8sIG5hbWUpIHtcclxuICB0aGlzLm5vID0gbm87XHJcbiAgdGhpcy5uYW1lID0gbmFtZTtcclxufVxyXG5cclxuTm90ZS5wcm90b3R5cGUgPSB7XHJcbiAgcHJvY2VzczogZnVuY3Rpb24odHJhY2spIFxyXG4gIHtcclxuICAgIHZhciBiYWNrID0gdHJhY2suYmFjaztcclxuICAgIHZhciBub3RlID0gdGhpcztcclxuICAgIHZhciBvY3QgPSB0aGlzLm9jdCB8fCBiYWNrLm9jdDtcclxuICAgIHZhciBzdGVwID0gdGhpcy5zdGVwIHx8IGJhY2suc3RlcDtcclxuICAgIHZhciBnYXRlID0gdGhpcy5nYXRlIHx8IGJhY2suZ2F0ZTtcclxuICAgIHZhciB2ZWwgPSB0aGlzLnZlbCB8fCBiYWNrLnZlbDtcclxuICAgIHNldFF1ZXVlKHRyYWNrLCBub3RlLCBvY3Qsc3RlcCwgZ2F0ZSwgdmVsKTtcclxuXHJcbiAgfVxyXG59XHJcblxyXG52YXIgXHJcbiAgQyAgPSBuZXcgTm90ZSggMCwnQyAnKSxcclxuICBEYiA9IG5ldyBOb3RlKCAxLCdEYicpLFxyXG4gIEQgID0gbmV3IE5vdGUoIDIsJ0QgJyksXHJcbiAgRWIgPSBuZXcgTm90ZSggMywnRWInKSxcclxuICBFICA9IG5ldyBOb3RlKCA0LCdFICcpLFxyXG4gIEYgID0gbmV3IE5vdGUoIDUsJ0YgJyksXHJcbiAgR2IgPSBuZXcgTm90ZSggNiwnR2InKSxcclxuICBHICA9IG5ldyBOb3RlKCA3LCdHICcpLFxyXG4gIEFiID0gbmV3IE5vdGUoIDgsJ0FiJyksXHJcbiAgQSAgPSBuZXcgTm90ZSggOSwnQSAnKSxcclxuICBCYiA9IG5ldyBOb3RlKDEwLCdCYicpLFxyXG4gIEIgPSBuZXcgTm90ZSgxMSwgJ0IgJyk7XHJcblxyXG4gLy8gUiA9IG5ldyBSZXN0KCk7XHJcblxyXG5mdW5jdGlvbiBTZXFEYXRhKG5vdGUsIG9jdCwgc3RlcCwgZ2F0ZSwgdmVsKVxyXG57XHJcbiAgdGhpcy5ub3RlID0gbm90ZTtcclxuICB0aGlzLm9jdCA9IG9jdDtcclxuICAvL3RoaXMubm8gPSBub3RlLm5vICsgb2N0ICogMTI7XHJcbiAgdGhpcy5zdGVwID0gc3RlcDtcclxuICB0aGlzLmdhdGUgPSBnYXRlO1xyXG4gIHRoaXMudmVsID0gdmVsO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZXRRdWV1ZSh0cmFjayxub3RlLG9jdCxzdGVwLGdhdGUsdmVsKVxyXG57XHJcbiAgdmFyIG5vID0gbm90ZS5ubyArIG9jdCAqIDEyO1xyXG4gIHZhciBzdGVwX3RpbWUgPSB0cmFjay5wbGF5aW5nVGltZTtcclxuICB2YXIgZ2F0ZV90aW1lID0gKChnYXRlID49IDApID8gZ2F0ZSAqIDYwIDogc3RlcCAqIGdhdGUgKiA2MCAqIC0xLjApIC8gKFRJTUVfQkFTRSAqIHRyYWNrLmxvY2FsVGVtcG8pICsgdHJhY2sucGxheWluZ1RpbWU7XHJcbiAgdmFyIHZvaWNlID0gdHJhY2suYXVkaW8udm9pY2VzW3RyYWNrLmNoYW5uZWxdO1xyXG4gIC8vY29uc29sZS5sb2codHJhY2suc2VxdWVuY2VyLnRlbXBvKTtcclxuICB2b2ljZS5rZXlvbihzdGVwX3RpbWUsIG5vLCB2ZWwpO1xyXG4gIHZvaWNlLmtleW9mZihnYXRlX3RpbWUpO1xyXG4gIHRyYWNrLnBsYXlpbmdUaW1lID0gKHN0ZXAgKiA2MCkgLyAoVElNRV9CQVNFICogdHJhY2subG9jYWxUZW1wbykgKyB0cmFjay5wbGF5aW5nVGltZTtcclxuICB2YXIgYmFjayA9IHRyYWNrLmJhY2s7XHJcbiAgYmFjay5ub3RlID0gbm90ZTtcclxuICBiYWNrLm9jdCA9IG9jdDtcclxuICBiYWNrLnN0ZXAgPSBzdGVwO1xyXG4gIGJhY2suZ2F0ZSA9IGdhdGU7XHJcbiAgYmFjay52ZWwgPSB2ZWw7XHJcbn1cclxuXHJcblNlcURhdGEucHJvdG90eXBlID0ge1xyXG4gIHByb2Nlc3M6IGZ1bmN0aW9uICh0cmFjaykge1xyXG5cclxuICAgIHZhciBiYWNrID0gdHJhY2suYmFjaztcclxuICAgIHZhciBub3RlID0gdGhpcy5ub3RlIHx8IGJhY2subm90ZTtcclxuICAgIHZhciBvY3QgPSB0aGlzLm9jdCB8fCBiYWNrLm9jdDtcclxuICAgIHZhciBzdGVwID0gdGhpcy5zdGVwIHx8IGJhY2suc3RlcDtcclxuICAgIHZhciBnYXRlID0gdGhpcy5nYXRlIHx8IGJhY2suZ2F0ZTtcclxuICAgIHZhciB2ZWwgPSB0aGlzLnZlbCB8fCBiYWNrLnZlbDtcclxuICAgIHNldFF1ZXVlKHRyYWNrLG5vdGUsb2N0LHN0ZXAsZ2F0ZSx2ZWwpO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gUyhub3RlLCBvY3QsIHN0ZXAsIGdhdGUsIHZlbCkge1xyXG4gIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcclxuICBpZiAoUy5sZW5ndGggIT0gYXJncy5sZW5ndGgpXHJcbiAge1xyXG4gICAgaWYodHlwZW9mKGFyZ3NbYXJncy5sZW5ndGggLSAxXSkgPT0gJ29iamVjdCcgJiYgICEoYXJnc1thcmdzLmxlbmd0aCAtIDFdIGluc3RhbmNlb2YgTm90ZSkpXHJcbiAgICB7XHJcbiAgICAgIHZhciBhcmdzMSA9IGFyZ3NbYXJncy5sZW5ndGggLSAxXTtcclxuICAgICAgdmFyIGwgPSBhcmdzLmxlbmd0aCAtIDE7XHJcbiAgICAgIHJldHVybiBuZXcgU2VxRGF0YShcclxuICAgICAgKChsICE9IDApP25vdGU6ZmFsc2UpIHx8IGFyZ3MxLm5vdGUgfHwgYXJnczEubiB8fCBudWxsLFxyXG4gICAgICAoKGwgIT0gMSkgPyBvY3QgOiBmYWxzZSkgfHwgYXJnczEub2N0IHx8IGFyZ3MxLm8gfHwgbnVsbCxcclxuICAgICAgKChsICE9IDIpID8gc3RlcCA6IGZhbHNlKSB8fCBhcmdzMS5zdGVwIHx8IGFyZ3MxLnMgfHwgbnVsbCxcclxuICAgICAgKChsICE9IDMpID8gZ2F0ZSA6IGZhbHNlKSB8fCBhcmdzMS5nYXRlIHx8IGFyZ3MxLmcgfHwgbnVsbCxcclxuICAgICAgKChsICE9IDQpID8gdmVsIDogZmFsc2UpIHx8IGFyZ3MxLnZlbCB8fCBhcmdzMS52IHx8IG51bGxcclxuICAgICAgKTtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIG5ldyBTZXFEYXRhKG5vdGUgfHwgbnVsbCwgb2N0IHx8IG51bGwsIHN0ZXAgfHwgbnVsbCwgZ2F0ZSB8fCBudWxsLCB2ZWwgfHwgbnVsbCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFMxKG5vdGUsIG9jdCwgc3RlcCwgZ2F0ZSwgdmVsKSB7XHJcbiAgcmV0dXJuIFMobm90ZSwgb2N0LCBsKHN0ZXApLCBnYXRlLCB2ZWwpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBTMihub3RlLCBsZW4sIGRvdCAsIG9jdCwgZ2F0ZSwgdmVsKSB7XHJcbiAgcmV0dXJuIFMobm90ZSwgb2N0LCBsKGxlbixkb3QpLCBnYXRlLCB2ZWwpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBTMyhub3RlLCBzdGVwLCBnYXRlLCB2ZWwsIG9jdCkge1xyXG4gIHJldHVybiBTKG5vdGUsIG9jdCwgc3RlcCwgZ2F0ZSwgdmVsKTtcclxufVxyXG5cclxuXHJcbi8vLyDpn7PnrKbjga7plbfjgZXmjIflrppcclxuXHJcbmZ1bmN0aW9uIGwobGVuLGRvdClcclxue1xyXG4gIHZhciBkID0gZmFsc2U7XHJcbiAgaWYgKGRvdCkgZCA9IGRvdDtcclxuICByZXR1cm4gKFRJTUVfQkFTRSAqICg0ICsgKGQ/MjowKSkpIC8gbGVuO1xyXG59XHJcblxyXG5mdW5jdGlvbiBTdGVwKHN0ZXApIHtcclxuICB0aGlzLnN0ZXAgPSBzdGVwO1xyXG59XHJcblxyXG5TdGVwLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKHRyYWNrKVxyXG57XHJcbiAgdHJhY2suYmFjay5zdGVwID0gdGhpcy5zdGVwO1xyXG59XHJcblxyXG5mdW5jdGlvbiBTVChzdGVwKVxyXG57XHJcbiAgcmV0dXJuIG5ldyBTdGVwKHN0ZXApO1xyXG59XHJcblxyXG5mdW5jdGlvbiBMKGxlbiwgZG90KSB7XHJcbiAgcmV0dXJuIG5ldyBTdGVwKGwobGVuLCBkb3QpKTtcclxufVxyXG5cclxuLy8vIOOCsuODvOODiOOCv+OCpOODoOaMh+WumlxyXG5cclxuZnVuY3Rpb24gR2F0ZVRpbWUoZ2F0ZSkge1xyXG4gIHRoaXMuZ2F0ZSA9IGdhdGU7XHJcbn1cclxuXHJcbkdhdGVUaW1lLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKHRyYWNrKSB7XHJcbiAgdHJhY2suYmFjay5nYXRlID0gdGhpcy5nYXRlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBHVChnYXRlKSB7XHJcbiAgcmV0dXJuIG5ldyBHYXRlVGltZShnYXRlKTtcclxufVxyXG5cclxuLy8vIOODmeODreOCt+ODhuOCo+aMh+WumlxyXG5cclxuZnVuY3Rpb24gVmVsb2NpdHkodmVsKSB7XHJcbiAgdGhpcy52ZWwgPSB2ZWw7XHJcbn1cclxuXHJcblZlbG9jaXR5LnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKHRyYWNrKSB7XHJcbiAgdHJhY2suYmFjay52ZWwgPSB0aGlzLnZlbDtcclxufVxyXG5cclxuZnVuY3Rpb24gVih2ZWwpIHtcclxuICByZXR1cm4gbmV3IFZlbG9jaXR5KHZlbCk7XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBKdW1wKHBvcykgeyB0aGlzLnBvcyA9IHBvczt9O1xyXG5KdW1wLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKHRyYWNrKVxyXG57XHJcbiAgdHJhY2suc2VxUG9zID0gdGhpcy5wb3M7XHJcbn1cclxuXHJcbi8vLyDpn7PoibLoqK3lrppcclxuZnVuY3Rpb24gVG9uZShubylcclxue1xyXG4gIHRoaXMubm8gPSBubztcclxuICAvL3RoaXMuc2FtcGxlID0gd2F2ZVNhbXBsZXNbdGhpcy5ub107XHJcbn1cclxuXHJcblRvbmUucHJvdG90eXBlID1cclxue1xyXG4gIHByb2Nlc3M6IGZ1bmN0aW9uICh0cmFjaylcclxuICB7XHJcbiAgICB0cmFjay5hdWRpby52b2ljZXNbdHJhY2suY2hhbm5lbF0uc2V0U2FtcGxlKHdhdmVTYW1wbGVzW3RoaXMubm9dKTtcclxuICB9XHJcbn1cclxuZnVuY3Rpb24gVE9ORShubylcclxue1xyXG4gIHJldHVybiBuZXcgVG9uZShubyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIEpVTVAocG9zKSB7XHJcbiAgcmV0dXJuIG5ldyBKdW1wKHBvcyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFJlc3Qoc3RlcClcclxue1xyXG4gIHRoaXMuc3RlcCA9IHN0ZXA7XHJcbn1cclxuXHJcblJlc3QucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbih0cmFjaylcclxue1xyXG4gIHZhciBzdGVwID0gdGhpcy5zdGVwIHx8IHRyYWNrLmJhY2suc3RlcDtcclxuICB0cmFjay5wbGF5aW5nVGltZSA9IHRyYWNrLnBsYXlpbmdUaW1lICsgKHRoaXMuc3RlcCAqIDYwKSAvIChUSU1FX0JBU0UgKiB0cmFjay5sb2NhbFRlbXBvKTtcclxuICB0cmFjay5iYWNrLnN0ZXAgPSB0aGlzLnN0ZXA7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFIxKHN0ZXApIHtcclxuICByZXR1cm4gbmV3IFJlc3Qoc3RlcCk7XHJcbn1cclxuZnVuY3Rpb24gUihsZW4sZG90KSB7XHJcbiAgcmV0dXJuIG5ldyBSZXN0KGwobGVuLGRvdCkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBPY3RhdmUob2N0KSB7XHJcbiAgdGhpcy5vY3QgPSBvY3Q7XHJcbn1cclxuT2N0YXZlLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24odHJhY2spXHJcbntcclxuICB0cmFjay5iYWNrLm9jdCA9IHRoaXMub2N0O1xyXG59XHJcblxyXG5mdW5jdGlvbiBPKG9jdCkge1xyXG4gIHJldHVybiBuZXcgT2N0YXZlKG9jdCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIE9jdGF2ZVVwKHYpIHsgdGhpcy52ID0gdjsgfTtcclxuT2N0YXZlVXAucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbih0cmFjaykge1xyXG4gIHRyYWNrLmJhY2sub2N0ICs9IHRoaXMudjtcclxufVxyXG5cclxudmFyIE9VID0gbmV3IE9jdGF2ZVVwKDEpO1xyXG52YXIgT0QgPSBuZXcgT2N0YXZlVXAoLTEpO1xyXG5cclxuZnVuY3Rpb24gVGVtcG8odGVtcG8pXHJcbntcclxuICB0aGlzLnRlbXBvID0gdGVtcG87XHJcbn1cclxuXHJcblRlbXBvLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24odHJhY2spXHJcbntcclxuICB0cmFjay5sb2NhbFRlbXBvID0gdGhpcy50ZW1wbztcclxuICAvL3RyYWNrLnNlcXVlbmNlci50ZW1wbyA9IHRoaXMudGVtcG87XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFRFTVBPKHRlbXBvKVxyXG57XHJcbiAgcmV0dXJuIG5ldyBUZW1wbyh0ZW1wbyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIEVudmVsb3BlKGF0dGFjaywgZGVjYXksIHN1c3RhaW4sIHJlbGVhc2UpXHJcbntcclxuICB0aGlzLmF0dGFjayA9IGF0dGFjaztcclxuICB0aGlzLmRlY2F5ID0gZGVjYXk7XHJcbiAgdGhpcy5zdXN0YWluID0gc3VzdGFpbjtcclxuICB0aGlzLnJlbGVhc2UgPSByZWxlYXNlO1xyXG59XHJcblxyXG5FbnZlbG9wZS5wcm90b3R5cGUucHJvY2VzcyA9IGZ1bmN0aW9uKHRyYWNrKVxyXG57XHJcbiAgdmFyIGVudmVsb3BlID0gdHJhY2suYXVkaW8udm9pY2VzW3RyYWNrLmNoYW5uZWxdLmVudmVsb3BlO1xyXG4gIGVudmVsb3BlLmF0dGFjayA9IHRoaXMuYXR0YWNrO1xyXG4gIGVudmVsb3BlLmRlY2F5ID0gdGhpcy5kZWNheTtcclxuICBlbnZlbG9wZS5zdXN0YWluID0gdGhpcy5zdXN0YWluO1xyXG4gIGVudmVsb3BlLnJlbGVhc2UgPSB0aGlzLnJlbGVhc2U7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIEVOVihhdHRhY2ssZGVjYXksc3VzdGFpbiAscmVsZWFzZSlcclxue1xyXG4gIHJldHVybiBuZXcgRW52ZWxvcGUoYXR0YWNrLCBkZWNheSwgc3VzdGFpbiwgcmVsZWFzZSk7XHJcbn1cclxuXHJcbi8vLyDjg4fjg4Hjg6Xjg7zjg7NcclxuZnVuY3Rpb24gRGV0dW5lKGRldHVuZSlcclxue1xyXG4gIHRoaXMuZGV0dW5lID0gZGV0dW5lO1xyXG59XHJcblxyXG5EZXR1bmUucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbih0cmFjaylcclxue1xyXG4gIHZhciB2b2ljZSA9IHRyYWNrLmF1ZGlvLnZvaWNlc1t0cmFjay5jaGFubmVsXTtcclxuICB2b2ljZS5kZXR1bmUgPSB0aGlzLmRldHVuZTtcclxufVxyXG5cclxuZnVuY3Rpb24gREVUVU5FKGRldHVuZSlcclxue1xyXG4gIHJldHVybiBuZXcgRGV0dW5lKGRldHVuZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFZvbHVtZSh2b2x1bWUpXHJcbntcclxuICB0aGlzLnZvbHVtZSA9IHZvbHVtZTtcclxufVxyXG5cclxuVm9sdW1lLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24odHJhY2spXHJcbntcclxuICB0cmFjay5hdWRpby52b2ljZXNbdHJhY2suY2hhbm5lbF0udm9sdW1lLmdhaW4uc2V0VmFsdWVBdFRpbWUodGhpcy52b2x1bWUsIHRyYWNrLnBsYXlpbmdUaW1lKTtcclxufVxyXG5cclxuZnVuY3Rpb24gVk9MVU1FKHZvbHVtZSlcclxue1xyXG4gIHJldHVybiBuZXcgVm9sdW1lKHZvbHVtZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIExvb3BEYXRhKG9iaix2YXJuYW1lLCBjb3VudCxzZXFQb3MpXHJcbntcclxuICB0aGlzLnZhcm5hbWUgPSB2YXJuYW1lO1xyXG4gIHRoaXMuY291bnQgPSBjb3VudDtcclxuICB0aGlzLm9iaiA9IG9iajtcclxuICB0aGlzLnNlcVBvcyA9IHNlcVBvcztcclxufVxyXG5cclxuZnVuY3Rpb24gTG9vcCh2YXJuYW1lLCBjb3VudCkge1xyXG4gIHRoaXMubG9vcERhdGEgPSBuZXcgTG9vcERhdGEodGhpcyx2YXJuYW1lLGNvdW50LDApO1xyXG59XHJcblxyXG5Mb29wLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKHRyYWNrKVxyXG57XHJcbiAgdmFyIHN0YWNrID0gdHJhY2suc3RhY2s7XHJcbiAgaWYgKHN0YWNrLmxlbmd0aCA9PSAwIHx8IHN0YWNrW3N0YWNrLmxlbmd0aCAtIDFdLm9iaiAhPT0gdGhpcylcclxuICB7XHJcbiAgICB2YXIgbGQgPSB0aGlzLmxvb3BEYXRhO1xyXG4gICAgc3RhY2sucHVzaChuZXcgTG9vcERhdGEodGhpcywgbGQudmFybmFtZSwgbGQuY291bnQsIHRyYWNrLnNlcVBvcykpO1xyXG4gIH0gXHJcbn1cclxuXHJcbmZ1bmN0aW9uIExPT1AodmFybmFtZSwgY291bnQpIHtcclxuICByZXR1cm4gbmV3IExvb3AodmFybmFtZSxjb3VudCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIExvb3BFbmQoKVxyXG57XHJcbn1cclxuXHJcbkxvb3BFbmQucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbih0cmFjaylcclxue1xyXG4gIHZhciBsZCA9IHRyYWNrLnN0YWNrW3RyYWNrLnN0YWNrLmxlbmd0aCAtIDFdO1xyXG4gIGxkLmNvdW50LS07XHJcbiAgaWYgKGxkLmNvdW50ID4gMCkge1xyXG4gICAgdHJhY2suc2VxUG9zID0gbGQuc2VxUG9zO1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0cmFjay5zdGFjay5wb3AoKTtcclxuICB9XHJcbn1cclxuXHJcbnZhciBMT09QX0VORCA9IG5ldyBMb29wRW5kKCk7XHJcblxyXG4vLy8g44K344O844Kx44Oz44K144O844OI44Op44OD44KvXHJcbmZ1bmN0aW9uIFRyYWNrKHNlcXVlbmNlcixzZXFkYXRhLGF1ZGlvKVxyXG57XHJcbiAgdGhpcy5uYW1lID0gJyc7XHJcbiAgdGhpcy5lbmQgPSBmYWxzZTtcclxuICB0aGlzLm9uZXNob3QgPSBmYWxzZTtcclxuICB0aGlzLnNlcXVlbmNlciA9IHNlcXVlbmNlcjtcclxuICB0aGlzLnNlcURhdGEgPSBzZXFkYXRhO1xyXG4gIHRoaXMuc2VxUG9zID0gMDtcclxuICB0aGlzLm11dGUgPSBmYWxzZTtcclxuICB0aGlzLnBsYXlpbmdUaW1lID0gLTE7XHJcbiAgdGhpcy5sb2NhbFRlbXBvID0gc2VxdWVuY2VyLnRlbXBvO1xyXG4gIHRoaXMudHJhY2tWb2x1bWUgPSAxLjA7XHJcbiAgdGhpcy50cmFuc3Bvc2UgPSAwO1xyXG4gIHRoaXMuc29sbyA9IGZhbHNlO1xyXG4gIHRoaXMuY2hhbm5lbCA9IC0xO1xyXG4gIHRoaXMudHJhY2sgPSAtMTtcclxuICB0aGlzLmF1ZGlvID0gYXVkaW87XHJcbiAgdGhpcy5iYWNrID0ge1xyXG4gICAgbm90ZTogNzIsXHJcbiAgICBvY3Q6IDUsXHJcbiAgICBzdGVwOiA5NixcclxuICAgIGdhdGU6IDQ4LFxyXG4gICAgdmVsOjEuMFxyXG4gIH1cclxuICB0aGlzLnN0YWNrID0gW107XHJcbn1cclxuXHJcblRyYWNrLnByb3RvdHlwZSA9IHtcclxuICBwcm9jZXNzOiBmdW5jdGlvbiAoY3VycmVudFRpbWUpIHtcclxuXHJcbiAgICBpZiAodGhpcy5lbmQpIHJldHVybjtcclxuICAgIFxyXG4gICAgaWYgKHRoaXMub25lc2hvdCkge1xyXG4gICAgICB0aGlzLnJlc2V0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHNlcVNpemUgPSB0aGlzLnNlcURhdGEubGVuZ3RoO1xyXG4gICAgaWYgKHRoaXMuc2VxUG9zID49IHNlcVNpemUpIHtcclxuICAgICAgaWYodGhpcy5zZXF1ZW5jZXIucmVwZWF0KVxyXG4gICAgICB7XHJcbiAgICAgICAgdGhpcy5zZXFQb3MgPSAwO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZW5kID0gdHJ1ZTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgc2VxID0gdGhpcy5zZXFEYXRhO1xyXG4gICAgdGhpcy5wbGF5aW5nVGltZSA9ICh0aGlzLnBsYXlpbmdUaW1lID4gLTEpID8gdGhpcy5wbGF5aW5nVGltZSA6IGN1cnJlbnRUaW1lO1xyXG4gICAgdmFyIGVuZFRpbWUgPSBjdXJyZW50VGltZSArIDAuMi8qc2VjKi87XHJcblxyXG4gICAgd2hpbGUgKHRoaXMuc2VxUG9zIDwgc2VxU2l6ZSkge1xyXG4gICAgICBpZiAodGhpcy5wbGF5aW5nVGltZSA+PSBlbmRUaW1lICYmICF0aGlzLm9uZXNob3QpIHtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgZCA9IHNlcVt0aGlzLnNlcVBvc107XHJcbiAgICAgICAgZC5wcm9jZXNzKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuc2VxUG9zKys7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG4gIHJlc2V0OmZ1bmN0aW9uKClcclxuICB7XHJcbiAgICB2YXIgY3VyVm9pY2UgPSB0aGlzLmF1ZGlvLnZvaWNlc1t0aGlzLmNoYW5uZWxdO1xyXG4gICAgY3VyVm9pY2UuZ2Fpbi5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcygwKTtcclxuICAgIGN1clZvaWNlLnByb2Nlc3Nvci5wbGF5YmFja1JhdGUuY2FuY2VsU2NoZWR1bGVkVmFsdWVzKDApO1xyXG4gICAgY3VyVm9pY2UuZ2Fpbi5nYWluLnZhbHVlID0gMDtcclxuICAgIHRoaXMucGxheWluZ1RpbWUgPSAtMTtcclxuICAgIHRoaXMuc2VxUG9zID0gMDtcclxuICAgIHRoaXMuZW5kID0gZmFsc2U7XHJcbiAgfVxyXG5cclxufVxyXG5cclxuZnVuY3Rpb24gbG9hZFRyYWNrcyhzZWxmLHRyYWNrcywgdHJhY2tkYXRhKVxyXG57XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0cmFja2RhdGEubGVuZ3RoOyArK2kpIHtcclxuICAgIHZhciB0cmFjayA9IG5ldyBUcmFjayhzZWxmLCB0cmFja2RhdGFbaV0uZGF0YSxzZWxmLmF1ZGlvKTtcclxuICAgIHRyYWNrLmNoYW5uZWwgPSB0cmFja2RhdGFbaV0uY2hhbm5lbDtcclxuICAgIHRyYWNrLm9uZXNob3QgPSAoIXRyYWNrZGF0YVtpXS5vbmVzaG90KT9mYWxzZTp0cnVlO1xyXG4gICAgdHJhY2sudHJhY2sgPSBpO1xyXG4gICAgdHJhY2tzLnB1c2godHJhY2spO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlVHJhY2tzKHRyYWNrZGF0YSlcclxue1xyXG4gIHZhciB0cmFja3MgPSBbXTtcclxuICBsb2FkVHJhY2tzKHRoaXMsdHJhY2tzLCB0cmFja2RhdGEpO1xyXG4gIHJldHVybiB0cmFja3M7XHJcbn1cclxuXHJcbi8vLyDjgrfjg7zjgrHjg7PjgrXjg7zmnKzkvZNcclxuZXhwb3J0IGZ1bmN0aW9uIFNlcXVlbmNlcihhdWRpbykge1xyXG4gIHRoaXMuYXVkaW8gPSBhdWRpbztcclxuICB0aGlzLnRlbXBvID0gMTAwLjA7XHJcbiAgdGhpcy5yZXBlYXQgPSBmYWxzZTtcclxuICB0aGlzLnBsYXkgPSBmYWxzZTtcclxuICB0aGlzLnRyYWNrcyA9IFtdO1xyXG4gIHRoaXMucGF1c2VUaW1lID0gMDtcclxuICB0aGlzLnN0YXR1cyA9IHRoaXMuU1RPUDtcclxufVxyXG5cclxuU2VxdWVuY2VyLnByb3RvdHlwZSA9IHtcclxuICBsb2FkOiBmdW5jdGlvbihkYXRhKVxyXG4gIHtcclxuICAgIGlmKHRoaXMucGxheSkge1xyXG4gICAgICB0aGlzLnN0b3AoKTtcclxuICAgIH1cclxuICAgIHRoaXMudHJhY2tzLmxlbmd0aCA9IDA7XHJcbiAgICBsb2FkVHJhY2tzKHRoaXMsdGhpcy50cmFja3MsIGRhdGEudHJhY2tzLHRoaXMuYXVkaW8pO1xyXG4gIH0sXHJcbiAgc3RhcnQ6ZnVuY3Rpb24oKVxyXG4gIHtcclxuICAgIC8vICAgIHRoaXMuaGFuZGxlID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkgeyBzZWxmLnByb2Nlc3MoKSB9LCA1MCk7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuUExBWTtcclxuICAgIHRoaXMucHJvY2VzcygpO1xyXG4gIH0sXHJcbiAgcHJvY2VzczpmdW5jdGlvbigpXHJcbiAge1xyXG4gICAgaWYgKHRoaXMuc3RhdHVzID09IHRoaXMuUExBWSkge1xyXG4gICAgICB0aGlzLnBsYXlUcmFja3ModGhpcy50cmFja3MpO1xyXG4gICAgICB0aGlzLmhhbmRsZSA9IHdpbmRvdy5zZXRUaW1lb3V0KHRoaXMucHJvY2Vzcy5iaW5kKHRoaXMpLCAxMDApO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgcGxheVRyYWNrczogZnVuY3Rpb24gKHRyYWNrcyl7XHJcbiAgICB2YXIgY3VycmVudFRpbWUgPSB0aGlzLmF1ZGlvLmF1ZGlvY3R4LmN1cnJlbnRUaW1lO1xyXG4gLy8gICBjb25zb2xlLmxvZyh0aGlzLmF1ZGlvLmF1ZGlvY3R4LmN1cnJlbnRUaW1lKTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0cmFja3MubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgdHJhY2tzW2ldLnByb2Nlc3MoY3VycmVudFRpbWUpO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgcGF1c2U6ZnVuY3Rpb24oKVxyXG4gIHtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5QQVVTRTtcclxuICAgIHRoaXMucGF1c2VUaW1lID0gdGhpcy5hdWRpby5hdWRpb2N0eC5jdXJyZW50VGltZTtcclxuICB9LFxyXG4gIHJlc3VtZTpmdW5jdGlvbiAoKVxyXG4gIHtcclxuICAgIGlmICh0aGlzLnN0YXR1cyA9PSB0aGlzLlBBVVNFKSB7XHJcbiAgICAgIHRoaXMuc3RhdHVzID0gdGhpcy5QTEFZO1xyXG4gICAgICB2YXIgdHJhY2tzID0gdGhpcy50cmFja3M7XHJcbiAgICAgIHZhciBhZGp1c3QgPSB0aGlzLmF1ZGlvLmF1ZGlvY3R4LmN1cnJlbnRUaW1lIC0gdGhpcy5wYXVzZVRpbWU7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0cmFja3MubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgICB0cmFja3NbaV0ucGxheWluZ1RpbWUgKz0gYWRqdXN0O1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMucHJvY2VzcygpO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgc3RvcDogZnVuY3Rpb24gKClcclxuICB7XHJcbiAgICBpZiAodGhpcy5zdGF0dXMgIT0gdGhpcy5TVE9QKSB7XHJcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLmhhbmRsZSk7XHJcbiAgICAgIC8vICAgIGNsZWFySW50ZXJ2YWwodGhpcy5oYW5kbGUpO1xyXG4gICAgICB0aGlzLnN0YXR1cyA9IHRoaXMuU1RPUDtcclxuICAgICAgdGhpcy5yZXNldCgpO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgcmVzZXQ6ZnVuY3Rpb24oKVxyXG4gIHtcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0aGlzLnRyYWNrcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSlcclxuICAgIHtcclxuICAgICAgdGhpcy50cmFja3NbaV0ucmVzZXQoKTtcclxuICAgIH1cclxuICB9LFxyXG4gIFNUT1A6IDAgfCAwLFxyXG4gIFBMQVk6IDEgfCAwLFxyXG4gIFBBVVNFOjIgfCAwXHJcbn1cclxuXHJcbi8vLyDnsKHmmJPpjbXnm6Tjga7lrp/oo4VcclxuZnVuY3Rpb24gUGlhbm8oYXVkaW8pIHtcclxuICB0aGlzLmF1ZGlvID0gYXVkaW87XHJcbiAgdGhpcy50YWJsZSA9IFs5MCwgODMsIDg4LCA2OCwgNjcsIDg2LCA3MSwgNjYsIDcyLCA3OCwgNzQsIDc3LCAxODhdO1xyXG4gIHRoaXMua2V5b24gPSBuZXcgQXJyYXkoMTMpO1xyXG59XHJcblxyXG5QaWFuby5wcm90b3R5cGUgPSB7XHJcbiAgb246IGZ1bmN0aW9uIChlKSB7XHJcbiAgICB2YXIgaW5kZXggPSB0aGlzLnRhYmxlLmluZGV4T2YoZS5rZXlDb2RlLCAwKTtcclxuICAgIGlmIChpbmRleCA9PSAtMSkge1xyXG4gICAgICBpZiAoZS5rZXlDb2RlID4gNDggJiYgZS5rZXlDb2RlIDwgNTcpIHtcclxuICAgICAgICB2YXIgdGltYnJlID0gZS5rZXlDb2RlIC0gNDk7XHJcbiAgICAgICAgdGhpcy5hdWRpby52b2ljZXNbN10uc2V0U2FtcGxlKHdhdmVTYW1wbGVzW3RpbWJyZV0pO1xyXG4gICAgICAgIHdhdmVHcmFwaC53YXZlID0gd2F2ZXNbdGltYnJlXTtcclxuICAgICAgICB3YXZlR3JhcGgucmVuZGVyKCk7XHJcbiAgICAgICAgdGV4dFBsYW5lLnByaW50KDUsIDEwLCBcIldhdmUgXCIgKyAodGltYnJlICsgMSkpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy9hdWRpby52b2ljZXNbMF0ucHJvY2Vzc29yLnBsYXliYWNrUmF0ZS52YWx1ZSA9IHNlcXVlbmNlci5ub3RlRnJlcVtdO1xyXG4gICAgICBpZiAoIXRoaXMua2V5b25baW5kZXhdKSB7XHJcbiAgICAgICAgdGhpcy5hdWRpby52b2ljZXNbN10ua2V5b24oMCxpbmRleCArIChlLnNoaWZ0S2V5ID8gODQgOiA3MiksMS4wKTtcclxuICAgICAgICB0aGlzLmtleW9uW2luZGV4XSA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICB9LFxyXG4gIG9mZjogZnVuY3Rpb24gKGUpIHtcclxuICAgIHZhciBpbmRleCA9IHRoaXMudGFibGUuaW5kZXhPZihlLmtleUNvZGUsIDApO1xyXG4gICAgaWYgKGluZGV4ID09IC0xKSB7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKHRoaXMua2V5b25baW5kZXhdKSB7XHJcbiAgICAgICAgYXVkaW8udm9pY2VzWzddLmVudmVsb3BlLmtleW9mZigwKTtcclxuICAgICAgICB0aGlzLmtleW9uW2luZGV4XSA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgc2VxRGF0YSA9IHtcclxuICBuYW1lOiAnVGVzdCcsXHJcbiAgdHJhY2tzOiBbXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6ICdwYXJ0MScsXHJcbiAgICAgIGNoYW5uZWw6IDAsXHJcbiAgICAgIGRhdGE6XHJcbiAgICAgIFtcclxuICAgICAgICBFTlYoMC4wMSwgMC4wMiwgMC41LCAwLjA3KSxcclxuICAgICAgICBURU1QTygxODApLCBUT05FKDApLCBWT0xVTUUoMC41KSwgTCg4KSwgR1QoLTAuNSksTyg0KSxcclxuICAgICAgICBMT09QKCdpJyw0KSxcclxuICAgICAgICBDLCBDLCBDLCBDLCBDLCBDLCBDLCBDLFxyXG4gICAgICAgIExPT1BfRU5ELFxyXG4gICAgICAgIEpVTVAoNSlcclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgbmFtZTogJ3BhcnQyJyxcclxuICAgICAgY2hhbm5lbDogMSxcclxuICAgICAgZGF0YTpcclxuICAgICAgICBbXHJcbiAgICAgICAgRU5WKDAuMDEsIDAuMDUsIDAuNiwgMC4wNyksXHJcbiAgICAgICAgVEVNUE8oMTgwKSxUT05FKDYpLCBWT0xVTUUoMC4yKSwgTCg4KSwgR1QoLTAuOCksXHJcbiAgICAgICAgUigxKSwgUigxKSxcclxuICAgICAgICBPKDYpLEwoMSksIEYsXHJcbiAgICAgICAgRSxcclxuICAgICAgICBPRCwgTCg4LCB0cnVlKSwgQmIsIEcsIEwoNCksIEJiLCBPVSwgTCg0KSwgRiwgTCg4KSwgRCxcclxuICAgICAgICBMKDQsIHRydWUpLCBFLCBMKDIpLCBDLFIoOCksXHJcbiAgICAgICAgSlVNUCg4KVxyXG4gICAgICAgIF1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6ICdwYXJ0MycsXHJcbiAgICAgIGNoYW5uZWw6IDIsXHJcbiAgICAgIGRhdGE6XHJcbiAgICAgICAgW1xyXG4gICAgICAgIEVOVigwLjAxLCAwLjA1LCAwLjYsIDAuMDcpLFxyXG4gICAgICAgIFRFTVBPKDE4MCksVE9ORSg2KSwgVk9MVU1FKDAuMSksIEwoOCksIEdUKC0wLjUpLCBcclxuICAgICAgICBSKDEpLCBSKDEpLFxyXG4gICAgICAgIE8oNiksTCgxKSwgQyxDLFxyXG4gICAgICAgIE9ELCBMKDgsIHRydWUpLCBHLCBELCBMKDQpLCBHLCBPVSwgTCg0KSwgRCwgTCg4KSxPRCwgRyxcclxuICAgICAgICBMKDQsIHRydWUpLCBPVSxDLCBMKDIpLE9ELCBHLCBSKDgpLFxyXG4gICAgICAgIEpVTVAoNylcclxuICAgICAgICBdXHJcbiAgICB9XHJcbiAgXVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gU291bmRFZmZlY3RzKHNlcXVlbmNlcikge1xyXG4gICB0aGlzLnNvdW5kRWZmZWN0cyA9XHJcbiAgICBbXHJcbiAgICAvLyBFZmZlY3QgMCAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgIGNyZWF0ZVRyYWNrcy5jYWxsKHNlcXVlbmNlcixbXHJcbiAgICB7XHJcbiAgICAgIGNoYW5uZWw6IDgsXHJcbiAgICAgIG9uZXNob3Q6dHJ1ZSxcclxuICAgICAgZGF0YTogW1ZPTFVNRSgwLjUpLFxyXG4gICAgICAgIEVOVigwLjAwMDEsIDAuMDEsIDEuMCwgMC4wMDAxKSxHVCgtMC45OTkpLFRPTkUoMCksIFRFTVBPKDIwMCksIE8oOCksU1QoMyksIEMsIEQsIEUsIEYsIEcsIEEsIEIsIE9VLCBDLCBELCBFLCBHLCBBLCBCLEIsQixCXHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGNoYW5uZWw6IDksXHJcbiAgICAgIG9uZXNob3Q6IHRydWUsXHJcbiAgICAgIGRhdGE6IFtWT0xVTUUoMC41KSxcclxuICAgICAgICBFTlYoMC4wMDAxLCAwLjAxLCAxLjAsIDAuMDAwMSksIERFVFVORSgwLjkpLCBHVCgtMC45OTkpLCBUT05FKDApLCBURU1QTygyMDApLCBPKDUpLCBTVCgzKSwgQywgRCwgRSwgRiwgRywgQSwgQiwgT1UsIEMsIEQsIEUsIEcsIEEsIEIsQixCLEJcclxuICAgICAgXVxyXG4gICAgfVxyXG4gICAgXSksXHJcbiAgICAvLyBFZmZlY3QgMSAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICBjcmVhdGVUcmFja3MuY2FsbChzZXF1ZW5jZXIsXHJcbiAgICAgIFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBjaGFubmVsOiAxMCxcclxuICAgICAgICAgIG9uZXNob3Q6IHRydWUsXHJcbiAgICAgICAgICBkYXRhOiBbXHJcbiAgICAgICAgICAgVE9ORSg0KSwgVEVNUE8oMTUwKSwgU1QoNCksIEdUKC0wLjk5OTkpLCBFTlYoMC4wMDAxLCAwLjAwMDEsIDEuMCwgMC4wMDAxKSxcclxuICAgICAgICAgICBPKDYpLCBHLCBBLCBCLCBPKDcpLCBCLCBBLCBHLCBGLCBFLCBELCBDLCBFLCBHLCBBLCBCLCBPRCwgQiwgQSwgRywgRiwgRSwgRCwgQywgT0QsIEIsIEEsIEcsIEYsIEUsIEQsIENcclxuICAgICAgICAgIF1cclxuICAgICAgICB9XHJcbiAgICAgIF0pLFxyXG4gICAgLy8gRWZmZWN0IDIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgY3JlYXRlVHJhY2tzLmNhbGwoc2VxdWVuY2VyLFxyXG4gICAgICBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgY2hhbm5lbDogMTAsXHJcbiAgICAgICAgICBvbmVzaG90OiB0cnVlLFxyXG4gICAgICAgICAgZGF0YTogW1xyXG4gICAgICAgICAgIFRPTkUoMCksIFRFTVBPKDE1MCksIFNUKDIpLCBHVCgtMC45OTk5KSwgRU5WKDAuMDAwMSwgMC4wMDAxLCAxLjAsIDAuMDAwMSksXHJcbiAgICAgICAgICAgTyg4KSwgQyxELEUsRixHLEEsQixPVSxDLEQsRSxGLE9ELEcsT1UsQSxPRCxCLE9VLEEsT0QsRyxPVSxGLE9ELEUsT1UsRVxyXG4gICAgICAgICAgXVxyXG4gICAgICAgIH1cclxuICAgICAgXSksXHJcbiAgICAgIC8vIEVmZmVjdCAzIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgICBjcmVhdGVUcmFja3MuY2FsbChzZXF1ZW5jZXIsXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBjaGFubmVsOiAxMCxcclxuICAgICAgICAgICAgb25lc2hvdDogdHJ1ZSxcclxuICAgICAgICAgICAgZGF0YTogW1xyXG4gICAgICAgICAgICAgVE9ORSg1KSwgVEVNUE8oMTUwKSwgTCg2NCksIEdUKC0wLjk5OTkpLCBFTlYoMC4wMDAxLCAwLjAwMDEsIDEuMCwgMC4wMDAxKSxcclxuICAgICAgICAgICAgIE8oNiksQyxPRCxDLE9VLEMsT0QsQyxPVSxDLE9ELEMsT1UsQyxPRFxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgXSksXHJcbiAgICAgIC8vIEVmZmVjdCA0IC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgICAgY3JlYXRlVHJhY2tzLmNhbGwoc2VxdWVuY2VyLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgY2hhbm5lbDogMTEsXHJcbiAgICAgICAgICAgIG9uZXNob3Q6IHRydWUsXHJcbiAgICAgICAgICAgIGRhdGE6IFtcclxuICAgICAgICAgICAgIFRPTkUoOCksIFZPTFVNRSgyLjApLFRFTVBPKDEyMCksIEwoMiksIEdUKC0wLjk5OTkpLCBFTlYoMC4wMDAxLCAwLjAwMDEsIDEuMCwgMC4yNSksXHJcbiAgICAgICAgICAgICBPKDEpLCBDXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICAgIH1cclxuICAgICAgICBdKVxyXG4gICBdO1xyXG4gfVxyXG5cclxuXHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBDb21tIHtcclxuICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgdmFyIGhvc3QgPSB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUubWF0Y2goL2xvY2FsaG9zdC9pZyk/J2xvY2FsaG9zdCc6J3d3dy5zZnBnbXIubmV0JztcclxuICAgIHRoaXMuZW5hYmxlID0gZmFsc2U7XHJcbiAgICB0cnkge1xyXG4gICAgICB0aGlzLnNvY2tldCA9IGlvLmNvbm5lY3QoJ2h0dHA6Ly8nICsgaG9zdCArICc6ODA4MS90ZXN0Jyk7XHJcbiAgICAgIHRoaXMuZW5hYmxlID0gdHJ1ZTtcclxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICB0aGlzLnNvY2tldC5vbignc2VuZEhpZ2hTY29yZXMnLCAoZGF0YSk9PntcclxuICAgICAgICBpZih0aGlzLnVwZGF0ZUhpZ2hTY29yZXMpe1xyXG4gICAgICAgICAgdGhpcy51cGRhdGVIaWdoU2NvcmVzKGRhdGEpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIHRoaXMuc29ja2V0Lm9uKCdzZW5kSGlnaFNjb3JlJywgKGRhdGEpPT57XHJcbiAgICAgICAgdGhpcy51cGRhdGVIaWdoU2NvcmUoZGF0YSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdGhpcy5zb2NrZXQub24oJ3NlbmRSYW5rJywgKGRhdGEpID0+IHtcclxuICAgICAgICB0aGlzLnVwZGF0ZUhpZ2hTY29yZXMoZGF0YS5oaWdoU2NvcmVzKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLnNvY2tldC5vbignZXJyb3JDb25uZWN0aW9uTWF4JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGFsZXJ0KCflkIzmmYLmjqXntprjga7kuIrpmZDjgavpgZTjgZfjgb7jgZfjgZ/jgIInKTtcclxuICAgICAgICBzZWxmLmVuYWJsZSA9IGZhbHNlO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMuc29ja2V0Lm9uKCdkaXNjb25uZWN0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmIChzZWxmLmVuYWJsZSkge1xyXG4gICAgICAgICAgc2VsZi5lbmFibGUgPSBmYWxzZTtcclxuICAgICAgICAgIGFsZXJ0KCfjgrXjg7zjg5Djg7zmjqXntprjgYzliIfmlq3jgZXjgozjgb7jgZfjgZ/jgIInKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgYWxlcnQoJ1NvY2tldC5JT+OBjOWIqeeUqOOBp+OBjeOBquOBhOOBn+OCgeOAgeODj+OCpOOCueOCs+OCouaDheWgseOBjOWPluW+l+OBp+OBjeOBvuOBm+OCk+OAgicgKyBlKTtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgc2VuZFNjb3JlKHNjb3JlKVxyXG4gIHtcclxuICAgIGlmICh0aGlzLmVuYWJsZSkge1xyXG4gICAgICB0aGlzLnNvY2tldC5lbWl0KCdzZW5kU2NvcmUnLCBzY29yZSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIGRpc2Nvbm5lY3QoKVxyXG4gIHtcclxuICAgIGlmICh0aGlzLmVuYWJsZSkge1xyXG4gICAgICB0aGlzLmVuYWJsZSA9IGZhbHNlO1xyXG4gICAgICB0aGlzLnNvY2tldC5kaXNjb25uZWN0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgKiBhcyBzZmcgZnJvbSAnLi9nbG9iYWwnO1xyXG5cclxuZXhwb3J0IGNsYXNzIERldlRvb2wge1xyXG4gIGNvbnN0cnVjdG9yKGdhbWUpIHtcclxuICAgIHRoaXMuZ2FtZSA9IGdhbWU7XHJcbiAgICB0aGlzLmtleWRvd24gPSB0aGlzLmtleWRvd25fKCk7XHJcbiAgICB0aGlzLmtleWRvd24ubmV4dCgpO1xyXG4gIH1cclxuXHJcbiAgKmtleWRvd25fKCkge1xyXG4gICAgdmFyIGUgPSB5aWVsZDtcclxuICAgIHdoaWxlICh0cnVlKSB7XHJcbiAgICAgIHZhciBwcm9jZXNzID0gZmFsc2U7XHJcbiAgICAgIGlmIChlLmtleUNvZGUgPT0gMTkyKSB7IC8vIEAgS2V5XHJcbiAgICAgICAgc2ZnLkNIRUNLX0NPTExJU0lPTiA9ICFzZmcuQ0hFQ0tfQ09MTElTSU9OO1xyXG4gICAgICAgIHByb2Nlc3MgPSB0cnVlO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgaWYgKGUua2V5Q29kZSA9PSA4MCAvKiBQICovKSB7XHJcbiAgICAgICAgaWYgKCFzZmcucGF1c2UpIHtcclxuICAgICAgICAgIHRoaXMuZ2FtZS5wYXVzZSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmdhbWUucmVzdW1lKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByb2Nlc3MgPSB0cnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoZS5rZXlDb2RlID09IDg4IC8qIFggKi8gJiYgc2ZnLkRFQlVHKSB7XHJcbiAgICAgICAgaWYgKCFzZmcucGF1c2UpIHtcclxuICAgICAgICAgIHRoaXMuZ2FtZS5wYXVzZSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmdhbWUucmVzdW1lKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByb2Nlc3MgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGUgPSB5aWVsZCBwcm9jZXNzO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmltcG9ydCAqIGFzIHNmZyBmcm9tICcuL2dsb2JhbCc7XHJcbmltcG9ydCAqICBhcyBnYW1lb2JqIGZyb20gJy4vZ2FtZW9iaic7XHJcbmltcG9ydCAqIGFzIGdyYXBoaWNzIGZyb20gJy4vZ3JhcGhpY3MnO1xyXG5cclxuXHJcbi8vLyDniIbnmbpcclxuZXhwb3J0IGNsYXNzIEJvbWIgZXh0ZW5kcyBnYW1lb2JqLkdhbWVPYmogXHJcbntcclxuICBjb25zdHJ1Y3RvcihzY2VuZSxzZSkge1xyXG4gICAgc3VwZXIoMCwwLDApO1xyXG4gICAgdmFyIHRleCA9IHNmZy50ZXh0dXJlRmlsZXMuYm9tYjtcclxuICAgIHZhciBtYXRlcmlhbCA9IGdyYXBoaWNzLmNyZWF0ZVNwcml0ZU1hdGVyaWFsKHRleCk7XHJcbiAgICBtYXRlcmlhbC5ibGVuZGluZyA9IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmc7XHJcbiAgICBtYXRlcmlhbC5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVHZW9tZXRyeSgxNik7XHJcbiAgICBncmFwaGljcy5jcmVhdGVTcHJpdGVVVihnZW9tZXRyeSwgdGV4LCAxNiwgMTYsIDApO1xyXG4gICAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICAgIHRoaXMubWVzaC5wb3NpdGlvbi56ID0gMC4xO1xyXG4gICAgdGhpcy5pbmRleCA9IDA7XHJcbiAgICB0aGlzLm1lc2gudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgdGhpcy5zY2VuZSA9IHNjZW5lO1xyXG4gICAgdGhpcy5zZSA9IHNlO1xyXG4gICAgc2NlbmUuYWRkKHRoaXMubWVzaCk7XHJcbiAgfVxyXG4gIGdldCB4KCkgeyByZXR1cm4gdGhpcy54XzsgfVxyXG4gIHNldCB4KHYpIHsgdGhpcy54XyA9IHRoaXMubWVzaC5wb3NpdGlvbi54ID0gdjsgfVxyXG4gIGdldCB5KCkgeyByZXR1cm4gdGhpcy55XzsgfVxyXG4gIHNldCB5KHYpIHsgdGhpcy55XyA9IHRoaXMubWVzaC5wb3NpdGlvbi55ID0gdjsgfVxyXG4gIGdldCB6KCkgeyByZXR1cm4gdGhpcy56XzsgfVxyXG4gIHNldCB6KHYpIHsgdGhpcy56XyA9IHRoaXMubWVzaC5wb3NpdGlvbi56ID0gdjsgfVxyXG4gIFxyXG4gIHN0YXJ0KHgsIHksIHosIGRlbGF5KSB7XHJcbiAgICBpZiAodGhpcy5lbmFibGVfKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHRoaXMuZGVsYXkgPSBkZWxheSB8IDA7XHJcbiAgICB0aGlzLnggPSB4O1xyXG4gICAgdGhpcy55ID0geTtcclxuICAgIHRoaXMueiA9IHogfCAwLjAwMDAyO1xyXG4gICAgdGhpcy5lbmFibGVfID0gdHJ1ZTtcclxuICAgIGdyYXBoaWNzLnVwZGF0ZVNwcml0ZVVWKHRoaXMubWVzaC5nZW9tZXRyeSwgc2ZnLnRleHR1cmVGaWxlcy5ib21iLCAxNiwgMTYsIHRoaXMuaW5kZXgpO1xyXG4gICAgc2ZnLnRhc2tzLnB1c2hUYXNrKHRoaXMubW92ZS5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMubWVzaC5tYXRlcmlhbC5vcGFjaXR5ID0gMS4wO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG4gIFxyXG4gICptb3ZlKHRhc2tJbmRleCkge1xyXG4gICAgXHJcbiAgICBmb3IoIGxldCBpID0gMCxlID0gdGhpcy5kZWxheTtpIDwgZSAmJiB0YXNrSW5kZXggPj0gMDsrK2kpXHJcbiAgICB7XHJcbiAgICAgIHRhc2tJbmRleCA9IHlpZWxkOyAgICAgIFxyXG4gICAgfVxyXG4gICAgdGhpcy5tZXNoLnZpc2libGUgPSB0cnVlO1xyXG5cclxuICAgIGZvcihsZXQgaSA9IDA7aSA8IDcgJiYgdGFza0luZGV4ID49IDA7KytpKVxyXG4gICAge1xyXG4gICAgICBncmFwaGljcy51cGRhdGVTcHJpdGVVVih0aGlzLm1lc2guZ2VvbWV0cnksIHNmZy50ZXh0dXJlRmlsZXMuYm9tYiwgMTYsIDE2LCBpKTtcclxuICAgICAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHRoaXMuZW5hYmxlXyA9IGZhbHNlO1xyXG4gICAgdGhpcy5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxuICAgIHNmZy50YXNrcy5yZW1vdmVUYXNrKHRhc2tJbmRleCk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQm9tYnMge1xyXG4gIGNvbnN0cnVjdG9yKHNjZW5lLCBzZSkge1xyXG4gICAgdGhpcy5ib21icyA9IG5ldyBBcnJheSgwKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMzI7ICsraSkge1xyXG4gICAgICB0aGlzLmJvbWJzLnB1c2gobmV3IEJvbWIoc2NlbmUsIHNlKSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIHN0YXJ0KHgsIHksIHopIHtcclxuICAgIHZhciBib21zID0gdGhpcy5ib21icztcclxuICAgIHZhciBjb3VudCA9IDM7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gYm9tcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgICBpZiAoIWJvbXNbaV0uZW5hYmxlXykge1xyXG4gICAgICAgIGlmIChjb3VudCA9PSAyKSB7XHJcbiAgICAgICAgICBib21zW2ldLnN0YXJ0KHgsIHksIHosIDApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBib21zW2ldLnN0YXJ0KHggKyAoTWF0aC5yYW5kb20oKSAqIDE2IC0gOCksIHkgKyAoTWF0aC5yYW5kb20oKSAqIDE2IC0gOCksIHosIE1hdGgucmFuZG9tKCkgKiA4KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY291bnQtLTtcclxuICAgICAgICBpZiAoIWNvdW50KSBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbn1cclxuXHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgKiAgYXMgZ2FtZW9iaiBmcm9tICcuL2dhbWVvYmonO1xyXG5pbXBvcnQgKiBhcyBzZmcgZnJvbSAnLi9nbG9iYWwnO1xyXG5pbXBvcnQgKiBhcyBncmFwaGljcyBmcm9tICcuL2dyYXBoaWNzJztcclxuXHJcbi8vLyDmlbXlvL5cclxuZXhwb3J0IGNsYXNzIEVuZW15QnVsbGV0IGV4dGVuZHMgZ2FtZW9iai5HYW1lT2JqIHtcclxuICBjb25zdHJ1Y3RvcihzY2VuZSwgc2UpIHtcclxuICAgIHN1cGVyKDAsIDAsIDApO1xyXG4gICAgdGhpcy5OT05FID0gMDtcclxuICAgIHRoaXMuTU9WRSA9IDE7XHJcbiAgICB0aGlzLkJPTUIgPSAyO1xyXG4gICAgdGhpcy5jb2xsaXNpb25BcmVhLndpZHRoID0gMjtcclxuICAgIHRoaXMuY29sbGlzaW9uQXJlYS5oZWlnaHQgPSAyO1xyXG4gICAgdmFyIHRleCA9IHNmZy50ZXh0dXJlRmlsZXMuZW5lbXk7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVNYXRlcmlhbCh0ZXgpO1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gZ3JhcGhpY3MuY3JlYXRlU3ByaXRlR2VvbWV0cnkoMTYpO1xyXG4gICAgZ3JhcGhpY3MuY3JlYXRlU3ByaXRlVVYoZ2VvbWV0cnksIHRleCwgMTYsIDE2LCAwKTtcclxuICAgIHRoaXMubWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgICB0aGlzLnogPSAwLjA7XHJcbiAgICB0aGlzLm12UGF0dGVybiA9IG51bGw7XHJcbiAgICB0aGlzLm12ID0gbnVsbDtcclxuICAgIHRoaXMubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICB0aGlzLnR5cGUgPSBudWxsO1xyXG4gICAgdGhpcy5saWZlID0gMDtcclxuICAgIHRoaXMuZHggPSAwO1xyXG4gICAgdGhpcy5keSA9IDA7XHJcbiAgICB0aGlzLnNwZWVkID0gMi4wO1xyXG4gICAgdGhpcy5lbmFibGUgPSBmYWxzZTtcclxuICAgIHRoaXMuaGl0XyA9IG51bGw7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuTk9ORTtcclxuICAgIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuICAgIHNjZW5lLmFkZCh0aGlzLm1lc2gpO1xyXG4gICAgdGhpcy5zZSA9IHNlO1xyXG4gIH1cclxuXHJcbiAgZ2V0IHgoKSB7IHJldHVybiB0aGlzLnhfOyB9XHJcbiAgc2V0IHgodikgeyB0aGlzLnhfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnggPSB2OyB9XHJcbiAgZ2V0IHkoKSB7IHJldHVybiB0aGlzLnlfOyB9XHJcbiAgc2V0IHkodikgeyB0aGlzLnlfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnkgPSB2OyB9XHJcbiAgZ2V0IHooKSB7IHJldHVybiB0aGlzLnpfOyB9XHJcbiAgc2V0IHoodikgeyB0aGlzLnpfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnogPSB2OyB9XHJcbiAgZ2V0IGVuYWJsZSgpIHtcclxuICAgIHJldHVybiB0aGlzLmVuYWJsZV87XHJcbiAgfVxyXG4gIFxyXG4gIHNldCBlbmFibGUodikge1xyXG4gICAgdGhpcy5lbmFibGVfID0gdjtcclxuICAgIHRoaXMubWVzaC52aXNpYmxlID0gdjtcclxuICB9XHJcbiAgXHJcbiAgKm1vdmUodGFza0luZGV4KSB7XHJcbiAgICBmb3IoO3RoaXMueCA+PSAoc2ZnLlZfTEVGVCAtIDE2KSAmJlxyXG4gICAgICAgIHRoaXMueCA8PSAoc2ZnLlZfUklHSFQgKyAxNikgJiZcclxuICAgICAgICB0aGlzLnkgPj0gKHNmZy5WX0JPVFRPTSAtIDE2KSAmJlxyXG4gICAgICAgIHRoaXMueSA8PSAoc2ZnLlZfVE9QICsgMTYpICYmIHRhc2tJbmRleCA+PSAwO1xyXG4gICAgICAgIHRoaXMueCArPSB0aGlzLmR4LHRoaXMueSArPSB0aGlzLmR5KVxyXG4gICAge1xyXG4gICAgICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLm1lc2gudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLk5PTkU7XHJcbiAgICB0aGlzLmVuYWJsZSA9IGZhbHNlO1xyXG4gICAgc2ZnLnRhc2tzLnJlbW92ZVRhc2sodGFza0luZGV4KTtcclxuICB9XHJcbiAgIFxyXG4gIHN0YXJ0KHgsIHksIHopIHtcclxuICAgIGlmICh0aGlzLmVuYWJsZSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB0aGlzLnggPSB4IHx8IDA7XHJcbiAgICB0aGlzLnkgPSB5IHx8IDA7XHJcbiAgICB0aGlzLnogPSB6IHx8IDA7XHJcbiAgICB0aGlzLmVuYWJsZSA9IHRydWU7XHJcbiAgICBpZiAodGhpcy5zdGF0dXMgIT0gdGhpcy5OT05FKVxyXG4gICAge1xyXG4gICAgICBkZWJ1Z2dlcjtcclxuICAgIH1cclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5NT1ZFO1xyXG4gICAgdmFyIGFpbVJhZGlhbiA9IE1hdGguYXRhbjIoc2ZnLm15c2hpcF8ueSAtIHksIHNmZy5teXNoaXBfLnggLSB4KTtcclxuICAgIHRoaXMubWVzaC5yb3RhdGlvbi56ID0gYWltUmFkaWFuO1xyXG4gICAgdGhpcy5keCA9IE1hdGguY29zKGFpbVJhZGlhbikgKiAodGhpcy5zcGVlZCArIHNmZy5zdGFnZS5kaWZmaWN1bHR5KTtcclxuICAgIHRoaXMuZHkgPSBNYXRoLnNpbihhaW1SYWRpYW4pICogKHRoaXMuc3BlZWQgKyBzZmcuc3RhZ2UuZGlmZmljdWx0eSk7XHJcbi8vICAgIGNvbnNvbGUubG9nKCdkeDonICsgdGhpcy5keCArICcgZHk6JyArIHRoaXMuZHkpO1xyXG5cclxuICAgIHRoaXMudGFzayA9IHNmZy50YXNrcy5wdXNoVGFzayh0aGlzLm1vdmUuYmluZCh0aGlzKSk7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbiBcclxuICBoaXQoKSB7XHJcbiAgICB0aGlzLmVuYWJsZSA9IGZhbHNlO1xyXG4gICAgc2ZnLnRhc2tzLnJlbW92ZVRhc2sodGhpcy50YXNrLmluZGV4KTtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5OT05FO1xyXG4gIH1cclxufVxyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBFbmVteUJ1bGxldHMge1xyXG4gIGNvbnN0cnVjdG9yKHNjZW5lLCBzZSkge1xyXG4gICAgdGhpcy5zY2VuZSA9IHNjZW5lO1xyXG4gICAgdGhpcy5lbmVteUJ1bGxldHMgPSBbXTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNDg7ICsraSkge1xyXG4gICAgICB0aGlzLmVuZW15QnVsbGV0cy5wdXNoKG5ldyBFbmVteUJ1bGxldCh0aGlzLnNjZW5lLCBzZSkpO1xyXG4gICAgfVxyXG4gIH1cclxuICBzdGFydCh4LCB5LCB6KSB7XHJcbiAgICB2YXIgZWJzID0gdGhpcy5lbmVteUJ1bGxldHM7XHJcbiAgICBmb3IodmFyIGkgPSAwLGVuZCA9IGVicy5sZW5ndGg7aTwgZW5kOysraSl7XHJcbiAgICAgIGlmKCFlYnNbaV0uZW5hYmxlKXtcclxuICAgICAgICBlYnNbaV0uc3RhcnQoeCwgeSwgeik7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgcmVzZXQoKVxyXG4gIHtcclxuICAgIHZhciBlYnMgPSB0aGlzLmVuZW15QnVsbGV0cztcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSBlYnMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgbGV0IGViID0gZWJzW2ldO1xyXG4gICAgICBpZiAoZWIuZW5hYmxlKSB7XHJcbiAgICAgICAgLy8g44K/44K544Kv44Gu44Kt44Oj44Oz44K744OrXHJcbiAgICAgICAgc2ZnLnRhc2tzW2ViLnRhc2suaW5kZXhdLm5leHQodHJ1ZSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8vLyDmlbXjgq3jg6Pjg6njga7li5XjgY0gLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4vLy8g55u057ea6YGL5YuVXHJcbmNsYXNzIExpbmVNb3ZlIHtcclxuICBjb25zdHJ1Y3RvcihyYWQsIHNwZWVkLCBzdGVwKSB7XHJcbiAgICB0aGlzLnJhZCA9IHJhZDtcclxuICAgIHRoaXMuc3BlZWQgPSBzcGVlZDtcclxuICAgIHRoaXMuc3RlcCA9IHN0ZXA7XHJcbiAgICB0aGlzLmN1cnJlbnRTdGVwID0gc3RlcDtcclxuICAgIHRoaXMuZHggPSBNYXRoLmNvcyhyYWQpICogc3BlZWQ7XHJcbiAgICB0aGlzLmR5ID0gTWF0aC5zaW4ocmFkKSAqIHNwZWVkO1xyXG4gIH1cclxuICBcclxuICAqbW92ZShzZWxmLHgseSkgXHJcbiAge1xyXG4gICAgXHJcbiAgICBpZiAoc2VsZi54cmV2KSB7XHJcbiAgICAgIHNlbGYuY2hhclJhZCA9IE1hdGguUEkgLSAodGhpcy5yYWQgLSBNYXRoLlBJIC8gMik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzZWxmLmNoYXJSYWQgPSB0aGlzLnJhZCAtIE1hdGguUEkgLyAyO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsZXQgZHkgPSB0aGlzLmR5O1xyXG4gICAgbGV0IGR4ID0gdGhpcy5keDtcclxuICAgIGNvbnN0IHN0ZXAgPSB0aGlzLnN0ZXA7XHJcbiAgICBcclxuICAgIGlmKHNlbGYueHJldil7XHJcbiAgICAgIGR4ID0gLWR4OyAgICAgIFxyXG4gICAgfVxyXG4gICAgbGV0IGNhbmNlbCA9IGZhbHNlO1xyXG4gICAgZm9yKGxldCBpID0gMDtpIDwgc3RlcCAmJiAhY2FuY2VsOysraSl7XHJcbiAgICAgIHNlbGYueCArPSBkeDtcclxuICAgICAgc2VsZi55ICs9IGR5O1xyXG4gICAgICBjYW5jZWwgPSB5aWVsZDtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8vLyDlhobpgYvli5VcclxuY2xhc3MgQ2lyY2xlTW92ZSB7XHJcbiAgY29uc3RydWN0b3Ioc3RhcnRSYWQsIHN0b3BSYWQsIHIsIHNwZWVkLCBsZWZ0KSB7XHJcbiAgICB0aGlzLnN0YXJ0UmFkID0gc3RhcnRSYWQgfHwgMDtcclxuICAgIHRoaXMuc3RvcFJhZCA9IHN0b3BSYWQgfHwgMDtcclxuICAgIHRoaXMuciA9IHIgfHwgMDtcclxuICAgIHRoaXMuc3BlZWQgPSBzcGVlZCB8fCAwO1xyXG4gICAgdGhpcy5sZWZ0ID0gIWxlZnQgPyBmYWxzZSA6IHRydWU7XHJcbiAgICB0aGlzLmRlbHRhcyA9IFtdO1xyXG4gICAgdmFyIHJhZCA9IHRoaXMuc3RhcnRSYWQ7XHJcbiAgICB2YXIgc3RlcCA9IChsZWZ0ID8gMSA6IC0xKSAqIHNwZWVkIC8gcjtcclxuICAgIHZhciBlbmQgPSBmYWxzZTtcclxuICAgIHdoaWxlICghZW5kKSB7XHJcbiAgICAgIHJhZCArPSBzdGVwO1xyXG4gICAgICBpZiAoKGxlZnQgJiYgKHJhZCA+PSB0aGlzLnN0b3BSYWQpKSB8fCAoIWxlZnQgJiYgcmFkIDw9IHRoaXMuc3RvcFJhZCkpIHtcclxuICAgICAgICByYWQgPSB0aGlzLnN0b3BSYWQ7XHJcbiAgICAgICAgZW5kID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmRlbHRhcy5wdXNoKHtcclxuICAgICAgICB4OiB0aGlzLnIgKiBNYXRoLmNvcyhyYWQpLFxyXG4gICAgICAgIHk6IHRoaXMuciAqIE1hdGguc2luKHJhZCksXHJcbiAgICAgICAgcmFkOiByYWRcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgXHJcbiAgKm1vdmUoc2VsZix4LHkpIHtcclxuICAgIC8vIOWIneacn+WMllxyXG4gICAgbGV0IHN4LHN5O1xyXG4gICAgaWYgKHNlbGYueHJldikge1xyXG4gICAgICBzeCA9IHggLSB0aGlzLnIgKiBNYXRoLmNvcyh0aGlzLnN0YXJ0UmFkICsgTWF0aC5QSSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzeCA9IHggLSB0aGlzLnIgKiBNYXRoLmNvcyh0aGlzLnN0YXJ0UmFkKTtcclxuICAgIH1cclxuICAgIHN5ID0geSAtIHRoaXMuciAqIE1hdGguc2luKHRoaXMuc3RhcnRSYWQpO1xyXG5cclxuICAgIGxldCBjYW5jZWwgPSBmYWxzZTtcclxuICAgIC8vIOenu+WLlVxyXG4gICAgZm9yKGxldCBpID0gMCxlID0gdGhpcy5kZWx0YXMubGVuZ3RoOyhpIDwgZSkgJiYgIWNhbmNlbDsrK2kpXHJcbiAgICB7XHJcbiAgICAgIHZhciBkZWx0YSA9IHRoaXMuZGVsdGFzW2ldO1xyXG4gICAgICBpZihzZWxmLnhyZXYpe1xyXG4gICAgICAgIHNlbGYueCA9IHN4IC0gZGVsdGEueDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzZWxmLnggPSBzeCArIGRlbHRhLng7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNlbGYueSA9IHN5ICsgZGVsdGEueTtcclxuICAgICAgaWYgKHNlbGYueHJldikge1xyXG4gICAgICAgIHNlbGYuY2hhclJhZCA9IChNYXRoLlBJIC0gZGVsdGEucmFkKSArICh0aGlzLmxlZnQgPyAtMSA6IDApICogTWF0aC5QSTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzZWxmLmNoYXJSYWQgPSBkZWx0YS5yYWQgKyAodGhpcy5sZWZ0ID8gMCA6IC0xKSAqIE1hdGguUEk7XHJcbiAgICAgIH1cclxuICAgICAgc2VsZi5yYWQgPSBkZWx0YS5yYWQ7XHJcbiAgICAgIGNhbmNlbCA9IHlpZWxkO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLy8vIOODm+ODvOODoOODneOCuOOCt+ODp+ODs+OBq+aIu+OCi1xyXG5jbGFzcyBHb3RvSG9tZSB7XHJcblxyXG4gKm1vdmUoc2VsZiwgeCwgeSkge1xyXG4gICAgbGV0IHJhZCA9IE1hdGguYXRhbjIoc2VsZi5ob21lWSAtIHNlbGYueSwgc2VsZi5ob21lWCAtIHNlbGYueCk7XHJcbiAgICBsZXQgc3BlZWQgPSA0O1xyXG5cclxuICAgIHNlbGYuY2hhclJhZCA9IHJhZCAtIE1hdGguUEkgLyAyO1xyXG4gICAgbGV0IGR4ID0gTWF0aC5jb3MocmFkKSAqIHNwZWVkO1xyXG4gICAgbGV0IGR5ID0gTWF0aC5zaW4ocmFkKSAqIHNwZWVkO1xyXG4gICAgc2VsZi56ID0gMC4wO1xyXG4gICAgXHJcbiAgICBsZXQgY2FuY2VsID0gZmFsc2U7XHJcbiAgICBmb3IoOyhNYXRoLmFicyhzZWxmLnggLSBzZWxmLmhvbWVYKSA+PSAyIHx8IE1hdGguYWJzKHNlbGYueSAtIHNlbGYuaG9tZVkpID49IDIpICYmICFjYW5jZWxcclxuICAgICAgO3NlbGYueCArPSBkeCxzZWxmLnkgKz0gZHkpXHJcbiAgICB7XHJcbiAgICAgIGNhbmNlbCA9IHlpZWxkO1xyXG4gICAgfVxyXG5cclxuICAgIHNlbGYuY2hhclJhZCA9IDA7XHJcbiAgICBzZWxmLnggPSBzZWxmLmhvbWVYO1xyXG4gICAgc2VsZi55ID0gc2VsZi5ob21lWTtcclxuICAgIGlmIChzZWxmLnN0YXR1cyA9PSBzZWxmLlNUQVJUKSB7XHJcbiAgICAgIHZhciBncm91cElEID0gc2VsZi5ncm91cElEO1xyXG4gICAgICB2YXIgZ3JvdXBEYXRhID0gc2VsZi5lbmVtaWVzLmdyb3VwRGF0YTtcclxuICAgICAgZ3JvdXBEYXRhW2dyb3VwSURdLnB1c2goc2VsZik7XHJcbiAgICAgIHNlbGYuZW5lbWllcy5ob21lRW5lbWllc0NvdW50Kys7XHJcbiAgICB9XHJcbiAgICBzZWxmLnN0YXR1cyA9IHNlbGYuSE9NRTtcclxuICB9XHJcbn1cclxuXHJcblxyXG4vLy8g5b6F5qmf5Lit44Gu5pW144Gu5YuV44GNXHJcbmNsYXNzIEhvbWVNb3Zle1xyXG4gIGNvbnN0cnVjdG9yKCl7XHJcbiAgICB0aGlzLkNFTlRFUl9YID0gMDtcclxuICAgIHRoaXMuQ0VOVEVSX1kgPSAxMDA7XHJcbiAgfVxyXG5cclxuICAqbW92ZShzZWxmLCB4LCB5KSB7XHJcblxyXG4gICAgbGV0IGR4ID0gc2VsZi5ob21lWCAtIHRoaXMuQ0VOVEVSX1g7XHJcbiAgICBsZXQgZHkgPSBzZWxmLmhvbWVZIC0gdGhpcy5DRU5URVJfWTtcclxuICAgIHNlbGYueiA9IC0wLjE7XHJcblxyXG4gICAgd2hpbGUoc2VsZi5zdGF0dXMgIT0gc2VsZi5BVFRBQ0spXHJcbiAgICB7XHJcbiAgICAgIHNlbGYueCA9IHNlbGYuaG9tZVggKyBkeCAqIHNlbGYuZW5lbWllcy5ob21lRGVsdGE7XHJcbiAgICAgIHNlbGYueSA9IHNlbGYuaG9tZVkgKyBkeSAqIHNlbGYuZW5lbWllcy5ob21lRGVsdGE7XHJcbiAgICAgIHNlbGYubWVzaC5zY2FsZS54ID0gc2VsZi5lbmVtaWVzLmhvbWVEZWx0YTI7XHJcbiAgICAgIHlpZWxkO1xyXG4gICAgfVxyXG5cclxuICAgIHNlbGYubWVzaC5zY2FsZS54ID0gMS4wO1xyXG4gICAgc2VsZi56ID0gMC4wO1xyXG5cclxuICB9XHJcbn1cclxuXHJcbi8vLyDmjIflrprjgrfjg7zjgrHjg7Pjgrnjgavnp7vli5XjgZnjgotcclxuY2xhc3MgR290byB7XHJcbiAgY29uc3RydWN0b3IocG9zKSB7IHRoaXMucG9zID0gcG9zOyB9O1xyXG4gICptb3ZlKHNlbGYsIHgsIHkpIHtcclxuICAgIHNlbGYuaW5kZXggPSB0aGlzLnBvcyAtIDE7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g5pW15by+55m65bCEXHJcbmNsYXNzIEZpcmUge1xyXG4gICptb3ZlKHNlbGYsIHgsIHkpIHtcclxuICAgIGxldCBkID0gKHNmZy5zdGFnZS5ubyAvIDIwKSAqICggc2ZnLnN0YWdlLmRpZmZpY3VsdHkpO1xyXG4gICAgaWYgKGQgPiAxKSB7IGQgPSAxLjA7fVxyXG4gICAgaWYgKE1hdGgucmFuZG9tKCkgPCBkKSB7XHJcbiAgICAgIHNlbGYuZW5lbWllcy5lbmVteUJ1bGxldHMuc3RhcnQoc2VsZi54LCBzZWxmLnkpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLy8vIOaVteacrOS9k1xyXG5leHBvcnQgY2xhc3MgRW5lbXkgZXh0ZW5kcyBnYW1lb2JqLkdhbWVPYmogeyBcclxuICBjb25zdHJ1Y3RvcihlbmVtaWVzLHNjZW5lLHNlKSB7XHJcbiAgc3VwZXIoMCwgMCwgMCk7XHJcbiAgdGhpcy5OT05FID0gIDAgO1xyXG4gIHRoaXMuU1RBUlQgPSAgMSA7XHJcbiAgdGhpcy5IT01FID0gIDIgO1xyXG4gIHRoaXMuQVRUQUNLID0gIDMgO1xyXG4gIHRoaXMuQk9NQiA9ICA0IDtcclxuICB0aGlzLmNvbGxpc2lvbkFyZWEud2lkdGggPSAxMjtcclxuICB0aGlzLmNvbGxpc2lvbkFyZWEuaGVpZ2h0ID0gODtcclxuICB2YXIgdGV4ID0gc2ZnLnRleHR1cmVGaWxlcy5lbmVteTtcclxuICB2YXIgbWF0ZXJpYWwgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVNYXRlcmlhbCh0ZXgpO1xyXG4gIHZhciBnZW9tZXRyeSA9IGdyYXBoaWNzLmNyZWF0ZVNwcml0ZUdlb21ldHJ5KDE2KTtcclxuICBncmFwaGljcy5jcmVhdGVTcHJpdGVVVihnZW9tZXRyeSwgdGV4LCAxNiwgMTYsIDApO1xyXG4gIHRoaXMubWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgdGhpcy5ncm91cElEID0gMDtcclxuICB0aGlzLnogPSAwLjA7XHJcbiAgdGhpcy5pbmRleCA9IDA7XHJcbiAgdGhpcy5zY29yZSA9IDA7XHJcbiAgdGhpcy5tdlBhdHRlcm4gPSBudWxsO1xyXG4gIHRoaXMubXYgPSBudWxsO1xyXG4gIHRoaXMubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcbiAgdGhpcy5zdGF0dXMgPSB0aGlzLk5PTkU7XHJcbiAgdGhpcy50eXBlID0gbnVsbDtcclxuICB0aGlzLmxpZmUgPSAwO1xyXG4gIHRoaXMudGFzayA9IG51bGw7XHJcbiAgdGhpcy5oaXRfID0gbnVsbDtcclxuICB0aGlzLnNjZW5lID0gc2NlbmU7XHJcbiAgdGhpcy5zY2VuZS5hZGQodGhpcy5tZXNoKTtcclxuICB0aGlzLnNlID0gc2U7XHJcbiAgdGhpcy5lbmVtaWVzID0gZW5lbWllcztcclxuICBcclxufVxyXG4gIGdldCB4KCkgeyByZXR1cm4gdGhpcy54XzsgfVxyXG4gIHNldCB4KHYpIHsgdGhpcy54XyA9IHRoaXMubWVzaC5wb3NpdGlvbi54ID0gdjsgfVxyXG4gIGdldCB5KCkgeyByZXR1cm4gdGhpcy55XzsgfVxyXG4gIHNldCB5KHYpIHsgdGhpcy55XyA9IHRoaXMubWVzaC5wb3NpdGlvbi55ID0gdjsgfVxyXG4gIGdldCB6KCkgeyByZXR1cm4gdGhpcy56XzsgfVxyXG4gIHNldCB6KHYpIHsgdGhpcy56XyA9IHRoaXMubWVzaC5wb3NpdGlvbi56ID0gdjsgfVxyXG4gIFxyXG4gIC8vL+aVteOBruWLleOBjVxyXG4gICptb3ZlKHRhc2tJbmRleCkge1xyXG4gICAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgICB3aGlsZSAodGFza0luZGV4ID49IDApe1xyXG4gICAgICB3aGlsZSghdGhpcy5tdi5uZXh0KCkuZG9uZSAmJiB0YXNrSW5kZXggPj0gMClcclxuICAgICAge1xyXG4gICAgICAgIHRoaXMubWVzaC5zY2FsZS54ID0gdGhpcy5lbmVtaWVzLmhvbWVEZWx0YTI7XHJcbiAgICAgICAgdGhpcy5tZXNoLnJvdGF0aW9uLnogPSB0aGlzLmNoYXJSYWQ7XHJcbiAgICAgICAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICBpZih0YXNrSW5kZXggPCAwKXtcclxuICAgICAgICB0YXNrSW5kZXggPSAtKCsrdGFza0luZGV4KTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGxldCBlbmQgPSBmYWxzZTtcclxuICAgICAgd2hpbGUgKCFlbmQpIHtcclxuICAgICAgICBpZiAodGhpcy5pbmRleCA8ICh0aGlzLm12UGF0dGVybi5sZW5ndGggLSAxKSkge1xyXG4gICAgICAgICAgdGhpcy5pbmRleCsrO1xyXG4gICAgICAgICAgdGhpcy5tdiA9IHRoaXMubXZQYXR0ZXJuW3RoaXMuaW5kZXhdLm1vdmUodGhpcyx0aGlzLngsdGhpcy55KTtcclxuICAgICAgICAgIGVuZCA9ICF0aGlzLm12Lm5leHQoKS5kb25lO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5tZXNoLnNjYWxlLnggPSB0aGlzLmVuZW1pZXMuaG9tZURlbHRhMjtcclxuICAgICAgdGhpcy5tZXNoLnJvdGF0aW9uLnogPSB0aGlzLmNoYXJSYWQ7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIC8vLyDliJ3mnJ/ljJZcclxuICBzdGFydCh4LCB5LCB6LCBob21lWCwgaG9tZVksIG12UGF0dGVybiwgeHJldix0eXBlLCBjbGVhclRhcmdldCxncm91cElEKSB7XHJcbiAgICBpZiAodGhpcy5lbmFibGVfKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHRoaXMudHlwZSA9IHR5cGU7XHJcbiAgICB0eXBlKHRoaXMpO1xyXG4gICAgdGhpcy54ID0geDtcclxuICAgIHRoaXMueSA9IHk7XHJcbiAgICB0aGlzLnogPSB6O1xyXG4gICAgdGhpcy54cmV2ID0geHJldjtcclxuICAgIHRoaXMuZW5hYmxlXyA9IHRydWU7XHJcbiAgICB0aGlzLmhvbWVYID0gaG9tZVggfHwgMDtcclxuICAgIHRoaXMuaG9tZVkgPSBob21lWSB8fCAwO1xyXG4gICAgdGhpcy5pbmRleCA9IDA7XHJcbiAgICB0aGlzLmdyb3VwSUQgPSBncm91cElEO1xyXG4gICAgdGhpcy5tdlBhdHRlcm4gPSBtdlBhdHRlcm47XHJcbiAgICB0aGlzLmNsZWFyVGFyZ2V0ID0gY2xlYXJUYXJnZXQgfHwgdHJ1ZTtcclxuICAgIHRoaXMubWVzaC5tYXRlcmlhbC5jb2xvci5zZXRIZXgoMHhGRkZGRkYpO1xyXG4gICAgdGhpcy5tdiA9IG12UGF0dGVyblswXS5tb3ZlKHRoaXMseCx5KTtcclxuICAgIC8vdGhpcy5tdi5zdGFydCh0aGlzLCB4LCB5KTtcclxuICAgIC8vaWYgKHRoaXMuc3RhdHVzICE9IHRoaXMuTk9ORSkge1xyXG4gICAgLy8gIGRlYnVnZ2VyO1xyXG4gICAgLy99XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuU1RBUlQ7XHJcbiAgICB0aGlzLnRhc2sgPSBzZmcudGFza3MucHVzaFRhc2sodGhpcy5tb3ZlLmJpbmQodGhpcyksIDEwMDAwKTtcclxuICAgIGlmKHRoaXMudGFzay5pbmRleCA9PSAwKXtcclxuICAgICAgZGVidWdnZXI7XHJcbiAgICB9XHJcbiAgICB0aGlzLm1lc2gudmlzaWJsZSA9IHRydWU7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbiAgXHJcbiAgaGl0KG15YnVsbGV0KSB7XHJcbiAgICBpZiAodGhpcy5oaXRfID09IG51bGwpIHtcclxuICAgICAgbGV0IGxpZmUgPSB0aGlzLmxpZmU7XHJcbiAgICAgIHRoaXMubGlmZSAtPSBteWJ1bGxldC5wb3dlciB8fCAxO1xyXG4gICAgICBteWJ1bGxldC5wb3dlciAtPSBsaWZlOyBcclxuLy8gICAgICB0aGlzLmxpZmUtLTtcclxuICAgICAgaWYgKHRoaXMubGlmZSA8PSAwKSB7XHJcbiAgICAgICAgc2ZnLmJvbWJzLnN0YXJ0KHRoaXMueCwgdGhpcy55KTtcclxuICAgICAgICB0aGlzLnNlKDEpO1xyXG4gICAgICAgIHNmZy5hZGRTY29yZSh0aGlzLnNjb3JlKTtcclxuICAgICAgICBpZiAodGhpcy5jbGVhclRhcmdldCkge1xyXG4gICAgICAgICAgdGhpcy5lbmVtaWVzLmhpdEVuZW1pZXNDb3VudCsrO1xyXG4gICAgICAgICAgaWYgKHRoaXMuc3RhdHVzID09IHRoaXMuU1RBUlQpIHtcclxuICAgICAgICAgICAgdGhpcy5lbmVtaWVzLmhvbWVFbmVtaWVzQ291bnQrKztcclxuICAgICAgICAgICAgdGhpcy5lbmVtaWVzLmdyb3VwRGF0YVt0aGlzLmdyb3VwSURdLnB1c2godGhpcyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0aGlzLmVuZW1pZXMuZ3JvdXBEYXRhW3RoaXMuZ3JvdXBJRF0uZ29uZUNvdW50Kys7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHRoaXMudGFzay5pbmRleCA9PSAwKXtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdoaXQnLHRoaXMudGFzay5pbmRleCk7XHJcbiAgICAgICAgICBkZWJ1Z2dlcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5lbmFibGVfID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5zdGF0dXMgPSB0aGlzLk5PTkU7XHJcbiAgICAgICAgc2ZnLnRhc2tzLmFycmF5W3RoaXMudGFzay5pbmRleF0uZ2VuSW5zdC5uZXh0KC0odGhpcy50YXNrLmluZGV4ICsgMSkpO1xyXG4gICAgICAgIHNmZy50YXNrcy5yZW1vdmVUYXNrKHRoaXMudGFzay5pbmRleCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5zZSgyKTtcclxuICAgICAgICB0aGlzLm1lc2gubWF0ZXJpYWwuY29sb3Iuc2V0SGV4KDB4RkY4MDgwKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5oaXRfKG15YnVsbGV0KTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFpha28oc2VsZikge1xyXG4gIHNlbGYuc2NvcmUgPSA1MDtcclxuICBzZWxmLmxpZmUgPSAxO1xyXG4gIGdyYXBoaWNzLnVwZGF0ZVNwcml0ZVVWKHNlbGYubWVzaC5nZW9tZXRyeSwgc2ZnLnRleHR1cmVGaWxlcy5lbmVteSwgMTYsIDE2LCA3KTtcclxufVxyXG5cclxuZnVuY3Rpb24gWmFrbzEoc2VsZikge1xyXG4gIHNlbGYuc2NvcmUgPSAxMDA7XHJcbiAgc2VsZi5saWZlID0gMTtcclxuICBncmFwaGljcy51cGRhdGVTcHJpdGVVVihzZWxmLm1lc2guZ2VvbWV0cnksIHNmZy50ZXh0dXJlRmlsZXMuZW5lbXksIDE2LCAxNiwgNik7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIE1Cb3NzKHNlbGYpIHtcclxuICBzZWxmLnNjb3JlID0gMzAwO1xyXG4gIHNlbGYubGlmZSA9IDI7XHJcbiAgc2VsZi5tZXNoLmJsZW5kaW5nID0gVEhSRUUuTm9ybWFsQmxlbmRpbmc7XHJcbiAgZ3JhcGhpY3MudXBkYXRlU3ByaXRlVVYoc2VsZi5tZXNoLmdlb21ldHJ5LCBzZmcudGV4dHVyZUZpbGVzLmVuZW15LCAxNiwgMTYsIDQpO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgRW5lbWllc3tcclxuICBjb25zdHJ1Y3RvcihzY2VuZSwgc2UsIGVuZW15QnVsbGV0cykge1xyXG4gICAgdGhpcy5lbmVteUJ1bGxldHMgPSBlbmVteUJ1bGxldHM7XHJcbiAgICB0aGlzLnNjZW5lID0gc2NlbmU7XHJcbiAgICB0aGlzLm5leHRUaW1lID0gMDtcclxuICAgIHRoaXMuY3VycmVudEluZGV4ID0gMDtcclxuICAgIHRoaXMuZW5lbWllcyA9IG5ldyBBcnJheSgwKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNjQ7ICsraSkge1xyXG4gICAgICB0aGlzLmVuZW1pZXMucHVzaChuZXcgRW5lbXkodGhpcywgc2NlbmUsIHNlKSk7XHJcbiAgICB9XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDU7ICsraSkge1xyXG4gICAgICB0aGlzLmdyb3VwRGF0YVtpXSA9IG5ldyBBcnJheSgwKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vLyDmlbXnt6jpmorjga7li5XjgY3jgpLjgrPjg7Pjg4jjg63jg7zjg6vjgZnjgotcclxuICBtb3ZlKCkge1xyXG4gICAgdmFyIGN1cnJlbnRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZTtcclxuICAgIHZhciBtb3ZlU2VxcyA9IHRoaXMubW92ZVNlcXM7XHJcbiAgICB2YXIgbGVuID0gbW92ZVNlcXNbc2ZnLnN0YWdlLnByaXZhdGVOb10ubGVuZ3RoO1xyXG4gICAgLy8g44OH44O844K/6YWN5YiX44KS44KC44Go44Gr5pW144KS55Sf5oiQXHJcbiAgICB3aGlsZSAodGhpcy5jdXJyZW50SW5kZXggPCBsZW4pIHtcclxuICAgICAgdmFyIGRhdGEgPSBtb3ZlU2Vxc1tzZmcuc3RhZ2UucHJpdmF0ZU5vXVt0aGlzLmN1cnJlbnRJbmRleF07XHJcbiAgICAgIHZhciBuZXh0VGltZSA9IHRoaXMubmV4dFRpbWUgIT0gbnVsbCA/IHRoaXMubmV4dFRpbWUgOiBkYXRhWzBdO1xyXG4gICAgICBpZiAoY3VycmVudFRpbWUgPj0gKHRoaXMubmV4dFRpbWUgKyBkYXRhWzBdKSkge1xyXG4gICAgICAgIHZhciBlbmVtaWVzID0gdGhpcy5lbmVtaWVzO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBlID0gZW5lbWllcy5sZW5ndGg7IGkgPCBlOyArK2kpIHtcclxuICAgICAgICAgIHZhciBlbmVteSA9IGVuZW1pZXNbaV07XHJcbiAgICAgICAgICBpZiAoIWVuZW15LmVuYWJsZV8pIHtcclxuICAgICAgICAgICAgZW5lbXkuc3RhcnQoZGF0YVsxXSwgZGF0YVsyXSwgMCwgZGF0YVszXSwgZGF0YVs0XSwgdGhpcy5tb3ZlUGF0dGVybnNbTWF0aC5hYnMoZGF0YVs1XSldLCBkYXRhWzVdIDwgMCwgZGF0YVs2XSwgZGF0YVs3XSwgZGF0YVs4XSB8fCAwKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY3VycmVudEluZGV4Kys7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudEluZGV4IDwgbGVuKSB7XHJcbiAgICAgICAgICB0aGlzLm5leHRUaW1lID0gY3VycmVudFRpbWUgKyBtb3ZlU2Vxc1tzZmcuc3RhZ2UucHJpdmF0ZU5vXVt0aGlzLmN1cnJlbnRJbmRleF1bMF07XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyDjg5vjg7zjg6Djg53jgrjjgrfjg6fjg7PjgavmlbXjgYzjgZnjgbnjgabmlbTliJfjgZfjgZ/jgYvnorroqo3jgZnjgovjgIJcclxuICAgIGlmICh0aGlzLmhvbWVFbmVtaWVzQ291bnQgPT0gdGhpcy50b3RhbEVuZW1pZXNDb3VudCAmJiB0aGlzLnN0YXR1cyA9PSB0aGlzLlNUQVJUKSB7XHJcbiAgICAgIC8vIOaVtOWIl+OBl+OBpuOBhOOBn+OCieaVtOWIl+ODouODvOODieOBq+enu+ihjOOBmeOCi+OAglxyXG4gICAgICB0aGlzLnN0YXR1cyA9IHRoaXMuSE9NRTtcclxuICAgICAgdGhpcy5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDAuNSAqICgyLjAgLSBzZmcuc3RhZ2UuZGlmZmljdWx0eSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8g44Ob44O844Og44Od44K444K344On44Oz44Gn5LiA5a6a5pmC6ZaT5b6F5qmf44GZ44KLXHJcbiAgICBpZiAodGhpcy5zdGF0dXMgPT0gdGhpcy5IT01FKSB7XHJcbiAgICAgIGlmIChzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lID4gdGhpcy5lbmRUaW1lKSB7XHJcbiAgICAgICAgdGhpcy5zdGF0dXMgPSB0aGlzLkFUVEFDSztcclxuICAgICAgICB0aGlzLmVuZFRpbWUgPSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lICsgKHNmZy5zdGFnZS5ESUZGSUNVTFRZX01BWCAtIHNmZy5zdGFnZS5kaWZmaWN1bHR5KSAqIDM7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IDA7XHJcbiAgICAgICAgdGhpcy5jb3VudCA9IDA7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyDmlLvmkoPjgZnjgotcclxuICAgIGlmICh0aGlzLnN0YXR1cyA9PSB0aGlzLkFUVEFDSyAmJiBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lID4gdGhpcy5lbmRUaW1lKSB7XHJcbiAgICAgIHRoaXMuZW5kVGltZSA9IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgKyAoc2ZnLnN0YWdlLkRJRkZJQ1VMVFlfTUFYIC0gc2ZnLnN0YWdlLmRpZmZpY3VsdHkpICogMztcclxuICAgICAgdmFyIGdyb3VwRGF0YSA9IHRoaXMuZ3JvdXBEYXRhO1xyXG4gICAgICB2YXIgYXR0YWNrQ291bnQgPSAoMSArIDAuMjUgKiAoc2ZnLnN0YWdlLmRpZmZpY3VsdHkpKSB8IDA7XHJcbiAgICAgIHZhciBncm91cCA9IGdyb3VwRGF0YVt0aGlzLmdyb3VwXTtcclxuXHJcbiAgICAgIGlmICghZ3JvdXAgfHwgZ3JvdXAubGVuZ3RoID09IDApIHtcclxuICAgICAgICB0aGlzLmdyb3VwID0gMDtcclxuICAgICAgICB2YXIgZ3JvdXAgPSBncm91cERhdGFbMF07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChncm91cC5sZW5ndGggPiAwICYmIGdyb3VwLmxlbmd0aCA+IGdyb3VwLmdvbmVDb3VudCkge1xyXG4gICAgICAgIGlmICghZ3JvdXAuaW5kZXgpIHtcclxuICAgICAgICAgIGdyb3VwLmluZGV4ID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF0aGlzLmdyb3VwKSB7XHJcbiAgICAgICAgICB2YXIgY291bnQgPSAwLCBlbmRnID0gZ3JvdXAubGVuZ3RoO1xyXG4gICAgICAgICAgd2hpbGUgKGNvdW50IDwgZW5kZyAmJiBhdHRhY2tDb3VudCA+IDApIHtcclxuICAgICAgICAgICAgdmFyIGVuID0gZ3JvdXBbZ3JvdXAuaW5kZXhdO1xyXG4gICAgICAgICAgICBpZiAoZW4uZW5hYmxlXyAmJiBlbi5zdGF0dXMgPT0gZW4uSE9NRSkge1xyXG4gICAgICAgICAgICAgIGVuLnN0YXR1cyA9IGVuLkFUVEFDSztcclxuICAgICAgICAgICAgICAtLWF0dGFja0NvdW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvdW50Kys7XHJcbiAgICAgICAgICAgIGdyb3VwLmluZGV4Kys7XHJcbiAgICAgICAgICAgIGlmIChncm91cC5pbmRleCA+PSBncm91cC5sZW5ndGgpIGdyb3VwLmluZGV4ID0gMDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IGdyb3VwLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgICAgICAgIHZhciBlbiA9IGdyb3VwW2ldO1xyXG4gICAgICAgICAgICBpZiAoZW4uZW5hYmxlXyAmJiBlbi5zdGF0dXMgPT0gZW4uSE9NRSkge1xyXG4gICAgICAgICAgICAgIGVuLnN0YXR1cyA9IGVuLkFUVEFDSztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5ncm91cCsrO1xyXG4gICAgICBpZiAodGhpcy5ncm91cCA+PSB0aGlzLmdyb3VwRGF0YS5sZW5ndGgpIHtcclxuICAgICAgICB0aGlzLmdyb3VwID0gMDtcclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyDjg5vjg7zjg6Djg53jgrjjgrfjg6fjg7Pjgafjga7lvoXmqZ/li5XkvZxcclxuICAgIHRoaXMuaG9tZURlbHRhQ291bnQgKz0gMC4wMjU7XHJcbiAgICB0aGlzLmhvbWVEZWx0YSA9IE1hdGguc2luKHRoaXMuaG9tZURlbHRhQ291bnQpICogMC4wODtcclxuICAgIHRoaXMuaG9tZURlbHRhMiA9IDEuMCArIE1hdGguc2luKHRoaXMuaG9tZURlbHRhQ291bnQgKiA4KSAqIDAuMTtcclxuXHJcbiAgfVxyXG5cclxuICByZXNldCgpIHtcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0aGlzLmVuZW1pZXMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgdmFyIGVuID0gdGhpcy5lbmVtaWVzW2ldO1xyXG4gICAgICBpZiAoZW4uZW5hYmxlXykge1xyXG4gICAgICAgIHNmZy50YXNrcy5yZW1vdmVUYXNrKGVuLnRhc2suaW5kZXgpO1xyXG4gICAgICAgIGVuLnN0YXR1cyA9IGVuLk5PTkU7XHJcbiAgICAgICAgZW4uZW5hYmxlXyA9IGZhbHNlO1xyXG4gICAgICAgIGVuLm1lc2gudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjYWxjRW5lbWllc0NvdW50KCkge1xyXG4gICAgdmFyIHNlcXMgPSB0aGlzLm1vdmVTZXFzW3NmZy5zdGFnZS5wcml2YXRlTm9dO1xyXG4gICAgdGhpcy50b3RhbEVuZW1pZXNDb3VudCA9IDA7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gc2Vxcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgICBpZiAoc2Vxc1tpXVs3XSkge1xyXG4gICAgICAgIHRoaXMudG90YWxFbmVtaWVzQ291bnQrKztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc3RhcnQoKSB7XHJcbiAgICB0aGlzLm5leHRUaW1lID0gMDtcclxuICAgIHRoaXMuY3VycmVudEluZGV4ID0gMDtcclxuICAgIHRoaXMudG90YWxFbmVtaWVzQ291bnQgPSAwO1xyXG4gICAgdGhpcy5oaXRFbmVtaWVzQ291bnQgPSAwO1xyXG4gICAgdGhpcy5ob21lRW5lbWllc0NvdW50ID0gMDtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5TVEFSVDtcclxuICAgIHZhciBncm91cERhdGEgPSB0aGlzLmdyb3VwRGF0YTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSBncm91cERhdGEubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgZ3JvdXBEYXRhW2ldLmxlbmd0aCA9IDA7XHJcbiAgICAgIGdyb3VwRGF0YVtpXS5nb25lQ291bnQgPSAwO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbn1cclxuXHJcbkVuZW1pZXMucHJvdG90eXBlLm1vdmVQYXR0ZXJucyA9IFtcclxuICAvLyAwXHJcbiAgW1xyXG4gICAgbmV3IENpcmNsZU1vdmUoTWF0aC5QSSwgMS4xMjUgKiBNYXRoLlBJLCAzMDAsIDMsIHRydWUpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMS4xMjUgKiBNYXRoLlBJLCAxLjI1ICogTWF0aC5QSSwgMjAwLCAzLCB0cnVlKSxcclxuICAgIG5ldyBGaXJlKCksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZShNYXRoLlBJIC8gNCwgLTMgKiBNYXRoLlBJLCA0MCwgNSwgZmFsc2UpLFxyXG4gICAgbmV3IEdvdG9Ib21lKCksXHJcbiAgICBuZXcgSG9tZU1vdmUoKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKE1hdGguUEksIDAsIDEwLCAzLCBmYWxzZSksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgwLCAtMC4xMjUgKiBNYXRoLlBJLCAyMDAsIDMsIGZhbHNlKSxcclxuICAgIG5ldyBGaXJlKCksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgtMC4xMjUgKiBNYXRoLlBJLCAtMC4yNSAqIE1hdGguUEksIDE1MCwgMi41LCBmYWxzZSksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgzICogTWF0aC5QSSAvIDQsIDQgKiBNYXRoLlBJLCA0MCwgMi41LCB0cnVlKSxcclxuICAgIG5ldyBHb3RvKDQpXHJcbiAgXSwvLyAxXHJcbiAgW1xyXG4gICAgbmV3IENpcmNsZU1vdmUoTWF0aC5QSSwgMS4xMjUgKiBNYXRoLlBJLCAzMDAsIDUsIHRydWUpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMS4xMjUgKiBNYXRoLlBJLCAxLjI1ICogTWF0aC5QSSwgMjAwLCA1LCB0cnVlKSxcclxuICAgIG5ldyBGaXJlKCksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZShNYXRoLlBJIC8gNCwgLTMgKiBNYXRoLlBJLCA0MCwgNiwgZmFsc2UpLFxyXG4gICAgbmV3IEdvdG9Ib21lKCksXHJcbiAgICBuZXcgSG9tZU1vdmUoKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKE1hdGguUEksIDAsIDEwLCAzLCBmYWxzZSksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgwLCAtMC4xMjUgKiBNYXRoLlBJLCAyMDAsIDMsIGZhbHNlKSxcclxuICAgIG5ldyBGaXJlKCksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgtMC4xMjUgKiBNYXRoLlBJLCAtMC4yNSAqIE1hdGguUEksIDI1MCwgMywgZmFsc2UpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMyAqIE1hdGguUEkgLyA0LCA0ICogTWF0aC5QSSwgNDAsIDMsIHRydWUpLFxyXG4gICAgbmV3IEdvdG8oNClcclxuICBdLC8vIDJcclxuICBbXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgwLCAtMC4xMjUgKiBNYXRoLlBJLCAzMDAsIDMsIGZhbHNlKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKC0wLjEyNSAqIE1hdGguUEksIC0wLjI1ICogTWF0aC5QSSwgMjAwLCAzLCBmYWxzZSksXHJcbiAgICBuZXcgRmlyZSgpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMyAqIE1hdGguUEkgLyA0LCAoMiArIDAuMjUpICogTWF0aC5QSSwgNDAsIDUsIHRydWUpLFxyXG4gICAgbmV3IEdvdG9Ib21lKCksXHJcbiAgICBuZXcgSG9tZU1vdmUoKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDAsIE1hdGguUEksIDEwLCAzLCB0cnVlKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKE1hdGguUEksIDEuMTI1ICogTWF0aC5QSSwgMjAwLCAzLCB0cnVlKSxcclxuICAgIG5ldyBGaXJlKCksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgxLjEyNSAqIE1hdGguUEksIDEuMjUgKiBNYXRoLlBJLCAxNTAsIDIuNSwgdHJ1ZSksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgwLjI1ICogTWF0aC5QSSwgLTMgKiBNYXRoLlBJLCA0MCwgMi41LCBmYWxzZSksXHJcbiAgICBuZXcgR290byg0KVxyXG4gIF0sLy8gM1xyXG4gIFtcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDAsIC0wLjEyNSAqIE1hdGguUEksIDMwMCwgNSwgZmFsc2UpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoLTAuMTI1ICogTWF0aC5QSSwgLTAuMjUgKiBNYXRoLlBJLCAyMDAsIDUsIGZhbHNlKSxcclxuICAgIG5ldyBGaXJlKCksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgzICogTWF0aC5QSSAvIDQsICg0ICsgMC4yNSkgKiBNYXRoLlBJLCA0MCwgNiwgdHJ1ZSksXHJcbiAgICBuZXcgRmlyZSgpLFxyXG4gICAgbmV3IEdvdG9Ib21lKCksXHJcbiAgICBuZXcgSG9tZU1vdmUoKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDAsIE1hdGguUEksIDEwLCAzLCB0cnVlKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKE1hdGguUEksIDEuMTI1ICogTWF0aC5QSSwgMjAwLCAzLCB0cnVlKSxcclxuICAgIG5ldyBGaXJlKCksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgxLjEyNSAqIE1hdGguUEksIDEuMjUgKiBNYXRoLlBJLCAxNTAsIDMsIHRydWUpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMC4yNSAqIE1hdGguUEksIC0zICogTWF0aC5QSSwgNDAsIDMsIGZhbHNlKSxcclxuICAgIG5ldyBHb3RvKDQpXHJcbiAgXSxcclxuICBbIC8vIDRcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDAsIC0wLjI1ICogTWF0aC5QSSwgMTc2LCA0LCBmYWxzZSksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgwLjc1ICogTWF0aC5QSSwgTWF0aC5QSSwgMTEyLCA0LCB0cnVlKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKE1hdGguUEksIDMuMTI1ICogTWF0aC5QSSwgNjQsIDQsIHRydWUpLFxyXG4gICAgbmV3IEdvdG9Ib21lKCksXHJcbiAgICBuZXcgSG9tZU1vdmUoKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDAsIDAuMTI1ICogTWF0aC5QSSwgMjUwLCAzLCB0cnVlKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDAuMTI1ICogTWF0aC5QSSwgTWF0aC5QSSwgODAsIDMsIHRydWUpLFxyXG4gICAgbmV3IEZpcmUoKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKE1hdGguUEksIDEuNzUgKiBNYXRoLlBJLCA1MCwgMywgdHJ1ZSksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgwLjc1ICogTWF0aC5QSSwgMC41ICogTWF0aC5QSSwgMTAwLCAzLCBmYWxzZSksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgwLjUgKiBNYXRoLlBJLCAtMiAqIE1hdGguUEksIDIwLCAzLCBmYWxzZSksXHJcbiAgICBuZXcgR290bygzKVxyXG4gIF0sXHJcbiAgWy8vIDVcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDAsIC0wLjEyNSAqIE1hdGguUEksIDMwMCwgMywgZmFsc2UpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoLTAuMTI1ICogTWF0aC5QSSwgLTAuMjUgKiBNYXRoLlBJLCAyMDAsIDMsIGZhbHNlKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDMgKiBNYXRoLlBJIC8gNCwgKDMpICogTWF0aC5QSSwgNDAsIDUsIHRydWUpLFxyXG4gICAgbmV3IEdvdG9Ib21lKCksXHJcbiAgICBuZXcgSG9tZU1vdmUoKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKE1hdGguUEksIDAuODc1ICogTWF0aC5QSSwgMjUwLCAzLCBmYWxzZSksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgwLjg3NSAqIE1hdGguUEksIDAsIDgwLCAzLCBmYWxzZSksXHJcbiAgICBuZXcgRmlyZSgpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMCwgLTAuNzUgKiBNYXRoLlBJLCA1MCwgMywgZmFsc2UpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMC4yNSAqIE1hdGguUEksIDAuNSAqIE1hdGguUEksIDEwMCwgMywgdHJ1ZSksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgwLjUgKiBNYXRoLlBJLCAzICogTWF0aC5QSSwgMjAsIDMsIHRydWUpLFxyXG4gICAgbmV3IEdvdG8oMylcclxuICBdLFxyXG4gIFsgLy8gNiAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgbmV3IENpcmNsZU1vdmUoMS41ICogTWF0aC5QSSwgTWF0aC5QSSwgOTYsIDQsIGZhbHNlKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDAsIDIgKiBNYXRoLlBJLCA0OCwgNCwgdHJ1ZSksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZShNYXRoLlBJLCAwLjc1ICogTWF0aC5QSSwgMzIsIDQsIGZhbHNlKSxcclxuICAgIG5ldyBHb3RvSG9tZSgpLFxyXG4gICAgbmV3IEhvbWVNb3ZlKCksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZShNYXRoLlBJLCAwLCAxMCwgMywgZmFsc2UpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMCwgLTAuMTI1ICogTWF0aC5QSSwgMjAwLCAzLCBmYWxzZSksXHJcbiAgICBuZXcgRmlyZSgpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoLTAuMTI1ICogTWF0aC5QSSwgLTAuMjUgKiBNYXRoLlBJLCAxNTAsIDIuNSwgZmFsc2UpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMyAqIE1hdGguUEkgLyA0LCA0ICogTWF0aC5QSSwgNDAsIDIuNSwgdHJ1ZSksXHJcbiAgICBuZXcgR290bygzKVxyXG4gIF0sXHJcbiAgWyAvLyA3IC8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgIG5ldyBDaXJjbGVNb3ZlKDAsIC0wLjI1ICogTWF0aC5QSSwgMTc2LCA0LCBmYWxzZSksXHJcbiAgICBuZXcgRmlyZSgpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMC43NSAqIE1hdGguUEksIE1hdGguUEksIDExMiwgNCwgdHJ1ZSksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZShNYXRoLlBJLCAyLjEyNSAqIE1hdGguUEksIDQ4LCA0LCB0cnVlKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDEuMTI1ICogTWF0aC5QSSwgTWF0aC5QSSwgNDgsIDQsIGZhbHNlKSxcclxuICAgIG5ldyBHb3RvSG9tZSgpLFxyXG4gICAgbmV3IEhvbWVNb3ZlKCksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZShNYXRoLlBJLCAwLCAxMCwgMywgZmFsc2UpLFxyXG4gICAgbmV3IEZpcmUoKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDAsIC0wLjEyNSAqIE1hdGguUEksIDIwMCwgMywgZmFsc2UpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoLTAuMTI1ICogTWF0aC5QSSwgLTAuMjUgKiBNYXRoLlBJLCAxNTAsIDIuNSwgZmFsc2UpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMyAqIE1hdGguUEkgLyA0LCA0ICogTWF0aC5QSSwgNDAsIDIuNSwgdHJ1ZSksXHJcbiAgICBuZXcgR290byg1KVxyXG4gIF1cclxuXVxyXG47XHJcbkVuZW1pZXMucHJvdG90eXBlLm1vdmVTZXFzID0gW1xyXG4gIFtcclxuICAgIC8vICoqKiBTVEFHRSAxICoqKiAvL1xyXG4gICAgLy8gaW50ZXJ2YWwsc3RhcnQgeCxzdGFydCB5LGhvbWUgeCxob21lIHksbW92ZSBwYXR0ZXJuICsgeOWPjei7oixjbGVhciB0YXJnZXQsZ3JvdXAgSURcclxuICAgIFswLjgsIDU2LCAxNzYsIDc1LCA0MCwgNywgWmFrbywgdHJ1ZV0sXHJcbiAgICBbMC4wNCwgNTYsIDE3NiwgMzUsIDQwLCA3LCBaYWtvLCB0cnVlXSxcclxuICAgIFswLjA0LCA1NiwgMTc2LCA1NSwgNDAsIDcsIFpha28sIHRydWVdLFxyXG4gICAgWzAuMDQsIDU2LCAxNzYsIDE1LCA0MCwgNywgWmFrbywgdHJ1ZV0sXHJcbiAgICBbMC4wNCwgNTYsIDE3NiwgNzUsIC0xMjAsIDQsIFpha28sIHRydWVdLFxyXG5cclxuICAgIFswLjgsIC01NiwgMTc2LCAtNzUsIDQwLCAtNywgWmFrbywgdHJ1ZV0sXHJcbiAgICBbMC4wNCwgLTU2LCAxNzYsIC0zNSwgNDAsIC03LCBaYWtvLCB0cnVlXSxcclxuICAgIFswLjA0LCAtNTYsIDE3NiwgLTU1LCA0MCwgLTcsIFpha28sIHRydWVdLFxyXG4gICAgWzAuMDQsIC01NiwgMTc2LCAtMTUsIDQwLCAtNywgWmFrbywgdHJ1ZV0sXHJcbiAgICBbMC4wNCwgLTU2LCAxNzYsIC03NSwgLTEyMCwgLTQsIFpha28sIHRydWVdLFxyXG5cclxuICAgIFswLjgsIDEyOCwgLTEyOCwgNzUsIDYwLCA2LCBaYWtvLCB0cnVlXSxcclxuICAgIFswLjA0LCAxMjgsIC0xMjgsIDM1LCA2MCwgNiwgWmFrbywgdHJ1ZV0sXHJcbiAgICBbMC4wNCwgMTI4LCAtMTI4LCA1NSwgNjAsIDYsIFpha28sIHRydWVdLFxyXG4gICAgWzAuMDQsIDEyOCwgLTEyOCwgMTUsIDYwLCA2LCBaYWtvLCB0cnVlXSxcclxuICAgIFswLjA0LCAxMjgsIC0xMjgsIDk1LCA2MCwgNiwgWmFrbywgdHJ1ZV0sXHJcblxyXG4gICAgWzAuOCwgLTEyOCwgLTEyOCwgLTc1LCA2MCwgLTYsIFpha28sIHRydWVdLFxyXG4gICAgWzAuMDQsIC0xMjgsIC0xMjgsIC0zNSwgNjAsIC02LCBaYWtvLCB0cnVlXSxcclxuICAgIFswLjA0LCAtMTI4LCAtMTI4LCAtNTUsIDYwLCAtNiwgWmFrbywgdHJ1ZV0sXHJcbiAgICBbMC4wNCwgLTEyOCwgLTEyOCwgLTE1LCA2MCwgLTYsIFpha28sIHRydWVdLFxyXG4gICAgWzAuMDQsIC0xMjgsIC0xMjgsIC05NSwgNjAsIC02LCBaYWtvLCB0cnVlXSxcclxuXHJcbiAgICBbMC44LCAwLCAxNzYsIDc1LCA4MCwgMSwgWmFrbzEsIHRydWVdLFxyXG4gICAgWzAuMDMsIDAsIDE3NiwgMzUsIDgwLCAxLCBaYWtvMSwgdHJ1ZV0sXHJcbiAgICBbMC4wMywgMCwgMTc2LCA1NSwgODAsIDEsIFpha28xLCB0cnVlXSxcclxuICAgIFswLjAzLCAwLCAxNzYsIDE1LCA4MCwgMSwgWmFrbzEsIHRydWVdLFxyXG4gICAgWzAuMDMsIDAsIDE3NiwgOTUsIDgwLCAxLCBaYWtvMSwgdHJ1ZV0sXHJcblxyXG4gICAgWzAuOCwgMCwgMTc2LCAtNzUsIDgwLCAzLCBaYWtvMSwgdHJ1ZV0sXHJcbiAgICBbMC4wMywgMCwgMTc2LCAtMzUsIDgwLCAzLCBaYWtvMSwgdHJ1ZV0sXHJcbiAgICBbMC4wMywgMCwgMTc2LCAtNTUsIDgwLCAzLCBaYWtvMSwgdHJ1ZV0sXHJcbiAgICBbMC4wMywgMCwgMTc2LCAtMTUsIDgwLCAzLCBaYWtvMSwgdHJ1ZV0sXHJcbiAgICBbMC4wMywgMCwgMTc2LCAtOTUsIDgwLCAzLCBaYWtvMSwgdHJ1ZV0sXHJcblxyXG4gICAgWzAuOCwgMCwgMTc2LCA4NSwgMTIwLCAxLCBNQm9zcywgdHJ1ZSwgMV0sXHJcbiAgICBbMC4wMywgMCwgMTc2LCA5NSwgMTAwLCAxLCBaYWtvMSwgdHJ1ZSwgMV0sXHJcbiAgICBbMC4wMywgMCwgMTc2LCA3NSwgMTAwLCAxLCBaYWtvMSwgdHJ1ZSwgMV0sXHJcbiAgICBbMC4wMywgMCwgMTc2LCA0NSwgMTIwLCAxLCBNQm9zcywgdHJ1ZSwgMl0sXHJcbiAgICBbMC4wMywgMCwgMTc2LCA1NSwgMTAwLCAxLCBaYWtvMSwgdHJ1ZSwgMl0sXHJcbiAgICBbMC4wMywgMCwgMTc2LCAzNSwgMTAwLCAxLCBaYWtvMSwgdHJ1ZSwgMl0sXHJcbiAgICBbMC4wMywgMCwgMTc2LCA2NSwgMTIwLCAxLCBNQm9zcywgdHJ1ZV0sXHJcbiAgICBbMC4wMywgMCwgMTc2LCAxNSwgMTAwLCAxLCBaYWtvMSwgdHJ1ZV0sXHJcbiAgICBbMC4wMywgMCwgMTc2LCAyNSwgMTIwLCAxLCBNQm9zcywgdHJ1ZV0sXHJcblxyXG4gICAgWzAuOCwgMCwgMTc2LCAtODUsIDEyMCwgMywgTUJvc3MsIHRydWUsIDNdLFxyXG4gICAgWzAuMDMsIDAsIDE3NiwgLTk1LCAxMDAsIDMsIFpha28xLCB0cnVlLCAzXSxcclxuICAgIFswLjAzLCAwLCAxNzYsIC03NSwgMTAwLCAzLCBaYWtvMSwgdHJ1ZSwgM10sXHJcbiAgICBbMC4wMywgMCwgMTc2LCAtNDUsIDEyMCwgMywgTUJvc3MsIHRydWUsIDRdLFxyXG4gICAgWzAuMDMsIDAsIDE3NiwgLTU1LCAxMDAsIDMsIFpha28xLCB0cnVlLCA0XSxcclxuICAgIFswLjAzLCAwLCAxNzYsIC0zNSwgMTAwLCAzLCBaYWtvMSwgdHJ1ZSwgNF0sXHJcbiAgICBbMC4wMywgMCwgMTc2LCAtNjUsIDEyMCwgMywgTUJvc3MsIHRydWVdLFxyXG4gICAgWzAuMDMsIDAsIDE3NiwgLTE1LCAxMDAsIDMsIFpha28xLCB0cnVlXSxcclxuICAgIFswLjAzLCAwLCAxNzYsIC0yNSwgMTIwLCAzLCBNQm9zcywgdHJ1ZV1cclxuICBdXHJcbl07XHJcblxyXG5FbmVtaWVzLnByb3RvdHlwZS50b3RhbEVuZW1pZXNDb3VudCA9IDA7XHJcbkVuZW1pZXMucHJvdG90eXBlLmhpdEVuZW1pZXNDb3VudCA9IDA7XHJcbkVuZW1pZXMucHJvdG90eXBlLmhvbWVFbmVtaWVzQ291bnQgPSAwO1xyXG5FbmVtaWVzLnByb3RvdHlwZS5ob21lRGVsdGEgPSAwO1xyXG5FbmVtaWVzLnByb3RvdHlwZS5ob21lRGVsdGFDb3VudCA9IDA7XHJcbkVuZW1pZXMucHJvdG90eXBlLmhvbWVEZWx0YTIgPSAwO1xyXG5FbmVtaWVzLnByb3RvdHlwZS5ncm91cERhdGEgPSBbXTtcclxuRW5lbWllcy5wcm90b3R5cGUuTk9ORSA9IDAgfCAwO1xyXG5FbmVtaWVzLnByb3RvdHlwZS5TVEFSVCA9IDEgfCAwO1xyXG5FbmVtaWVzLnByb3RvdHlwZS5IT01FID0gMiB8IDA7XHJcbkVuZW1pZXMucHJvdG90eXBlLkFUVEFDSyA9IDMgfCAwO1xyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8vdmFyIFNUQUdFX01BWCA9IDE7XHJcbmltcG9ydCAqIGFzIHNmZyBmcm9tICcuL2dsb2JhbCc7XHJcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsJztcclxuaW1wb3J0ICogYXMgYXVkaW8gZnJvbSAnLi9hdWRpbyc7XHJcbi8vaW1wb3J0ICogYXMgc29uZyBmcm9tICcuL3NvbmcnO1xyXG5pbXBvcnQgKiBhcyBncmFwaGljcyBmcm9tICcuL2dyYXBoaWNzJztcclxuaW1wb3J0ICogYXMgaW8gZnJvbSAnLi9pbyc7XHJcbmltcG9ydCAqIGFzIGNvbW0gZnJvbSAnLi9jb21tJztcclxuaW1wb3J0ICogYXMgdGV4dCBmcm9tICcuL3RleHQnO1xyXG5pbXBvcnQgKiBhcyBnYW1lb2JqIGZyb20gJy4vZ2FtZW9iaic7XHJcbmltcG9ydCAqIGFzIG15c2hpcCBmcm9tICcuL215c2hpcCc7XHJcbmltcG9ydCAqIGFzIGVuZW1pZXMgZnJvbSAnLi9lbmVtaWVzJztcclxuaW1wb3J0ICogYXMgZWZmZWN0b2JqIGZyb20gJy4vZWZmZWN0b2JqJztcclxuaW1wb3J0IHsgRGV2VG9vbCB9IGZyb20gJy4vZGV2dG9vbCc7XHJcblxyXG5cclxuY2xhc3MgU2NvcmVFbnRyeSB7XHJcbiAgY29uc3RydWN0b3IobmFtZSwgc2NvcmUpIHtcclxuICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICB0aGlzLnNjb3JlID0gc2NvcmU7XHJcbiAgfVxyXG59XHJcblxyXG5cclxuY2xhc3MgU3RhZ2Uge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgdGhpcy5NQVggPSAxO1xyXG4gICAgdGhpcy5ESUZGSUNVTFRZX01BWCA9IDIuMDtcclxuICAgIHRoaXMubm8gPSAxO1xyXG4gICAgdGhpcy5wcml2YXRlTm8gPSAwO1xyXG4gICAgdGhpcy5kaWZmaWN1bHR5ID0gMTtcclxuICB9XHJcblxyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5ubyA9IDE7XHJcbiAgICB0aGlzLnByaXZhdGVObyA9IDA7XHJcbiAgICB0aGlzLmRpZmZpY3VsdHkgPSAxO1xyXG4gIH1cclxuXHJcbiAgYWR2YW5jZSgpIHtcclxuICAgIHRoaXMubm8rKztcclxuICAgIHRoaXMucHJpdmF0ZU5vKys7XHJcbiAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAganVtcChzdGFnZU5vKSB7XHJcbiAgICB0aGlzLm5vID0gc3RhZ2VObztcclxuICAgIHRoaXMucHJpdmF0ZU5vID0gdGhpcy5ubyAtIDE7XHJcbiAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlKGdhbWUpIHtcclxuICAgIGlmICh0aGlzLmRpZmZpY3VsdHkgPCB0aGlzLkRJRkZJQ1VMVFlfTUFYKSB7XHJcbiAgICAgIHRoaXMuZGlmZmljdWx0eSA9IDEgKyAwLjA1ICogKHRoaXMubm8gLSAxKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5wcml2YXRlTm8gPj0gdGhpcy5NQVgpIHtcclxuICAgICAgdGhpcy5wcml2YXRlTm8gPSAwO1xyXG4gIC8vICAgIHRoaXMubm8gPSAxO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEdhbWUge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgdGhpcy5DT05TT0xFX1dJRFRIID0gMDtcclxuICAgIHRoaXMuQ09OU09MRV9IRUlHSFQgPSAwO1xyXG4gICAgdGhpcy5yZW5kZXJlciA9IG51bGw7XHJcbiAgICB0aGlzLnN0YXRzID0gbnVsbDtcclxuICAgIHRoaXMuc2NlbmUgPSBudWxsO1xyXG4gICAgdGhpcy5jYW1lcmEgPSBudWxsO1xyXG4gICAgdGhpcy5hdXRob3IgPSBudWxsO1xyXG4gICAgdGhpcy5wcm9ncmVzcyA9IG51bGw7XHJcbiAgICB0aGlzLnRleHRQbGFuZSA9IG51bGw7XHJcbiAgICB0aGlzLmJhc2ljSW5wdXQgPSBuZXcgaW8uQmFzaWNJbnB1dCgpO1xyXG4gICAgdGhpcy50YXNrcyA9IG5ldyB1dGlsLlRhc2tzKCk7XHJcbiAgICBzZmcudGFza3MgPSB0aGlzLnRhc2tzO1xyXG4gICAgdGhpcy53YXZlR3JhcGggPSBudWxsO1xyXG4gICAgdGhpcy5zdGFydCA9IGZhbHNlO1xyXG4gICAgdGhpcy5iYXNlVGltZSA9IG5ldyBEYXRlO1xyXG4gICAgdGhpcy5kID0gLTAuMjtcclxuICAgIHRoaXMuYXVkaW9fID0gbnVsbDtcclxuICAgIHRoaXMuc2VxdWVuY2VyID0gbnVsbDtcclxuICAgIHRoaXMucGlhbm8gPSBudWxsO1xyXG4gICAgdGhpcy5zY29yZSA9IDA7XHJcbiAgICB0aGlzLmhpZ2hTY29yZSA9IDA7XHJcbiAgICB0aGlzLmhpZ2hTY29yZXMgPSBbXTtcclxuICAgIHRoaXMuaXNIaWRkZW4gPSBmYWxzZTtcclxuICAgIHRoaXMubXlzaGlwXyA9IG51bGw7XHJcbiAgICB0aGlzLmVuZW1pZXMgPSBudWxsO1xyXG4gICAgdGhpcy5lbmVteUJ1bGxldHMgPSBudWxsO1xyXG4gICAgdGhpcy5QSSA9IE1hdGguUEk7XHJcbiAgICB0aGlzLmNvbW1fID0gbnVsbDtcclxuICAgIHRoaXMuaGFuZGxlTmFtZSA9ICcnO1xyXG4gICAgdGhpcy5zdG9yYWdlID0gbnVsbDtcclxuICAgIHRoaXMucmFuayA9IC0xO1xyXG4gICAgdGhpcy5zb3VuZEVmZmVjdHMgPSBudWxsO1xyXG4gICAgdGhpcy5lbnMgPSBudWxsO1xyXG4gICAgdGhpcy5lbmJzID0gbnVsbDtcclxuICAgIHRoaXMuRGV2VG9vbCA9IG5ldyBEZXZUb29sKHRoaXMpO1xyXG4gICAgdGhpcy50aXRsZSA9IG51bGw7Ly8g44K/44Kk44OI44Or44Oh44OD44K344OlXHJcbiAgICB0aGlzLnNwYWNlRmllbGQgPSBudWxsOy8vIOWuh+WumeepuumWk+ODkeODvOODhuOCo+OCr+ODq1xyXG4gICAgdGhpcy5lZGl0SGFuZGxlTmFtZSA9IG51bGw7XHJcbiAgICBzZmcuYWRkU2NvcmUgPSB0aGlzLmFkZFNjb3JlLmJpbmQodGhpcyk7XHJcbiAgICB0aGlzLmNoZWNrVmlzaWJpbGl0eUFQSSgpO1xyXG4gICAgdGhpcy5hdWRpb18gPSBuZXcgYXVkaW8uQXVkaW8oKTtcclxuICAgIHRoaXMuc3RhdHVzID0gbnVsbDtcclxuICB9XHJcblxyXG4gIGV4ZWMoKSB7XHJcbiAgICBcclxuICAgIGlmICghdGhpcy5jaGVja0Jyb3dzZXJTdXBwb3J0KCcjY29udGVudCcpKXtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc2VxdWVuY2VyID0gbmV3IGF1ZGlvLlNlcXVlbmNlcih0aGlzLmF1ZGlvXyk7XHJcbiAgICAvL3BpYW5vID0gbmV3IGF1ZGlvLlBpYW5vKGF1ZGlvXyk7XHJcbiAgICB0aGlzLnNvdW5kRWZmZWN0cyA9IG5ldyBhdWRpby5Tb3VuZEVmZmVjdHModGhpcy5zZXF1ZW5jZXIpO1xyXG5cclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIod2luZG93LnZpc2liaWxpdHlDaGFuZ2UsIHRoaXMub25WaXNpYmlsaXR5Q2hhbmdlLmJpbmQodGhpcyksIGZhbHNlKTtcclxuICAgIHNmZy5nYW1lVGltZXIgPSBuZXcgdXRpbC5HYW1lVGltZXIodGhpcy5nZXRDdXJyZW50VGltZS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLy8g44Ky44O844Og44Kz44Oz44K944O844Or44Gu5Yid5pyf5YyWXHJcbiAgICB0aGlzLmluaXRDb25zb2xlKCk7XHJcbiAgICB0aGlzLmxvYWRSZXNvdXJjZXMoKVxyXG4gICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5zY2VuZS5yZW1vdmUodGhpcy5wcm9ncmVzcy5tZXNoKTtcclxuICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLnNjZW5lLCB0aGlzLmNhbWVyYSk7XHJcbiAgICAgICAgdGhpcy50YXNrcy5jbGVhcigpO1xyXG4gICAgICAgIHRoaXMudGFza3MucHVzaFRhc2sodGhpcy5pbml0LmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMudGFza3MucHVzaFRhc2sodGhpcy5yZW5kZXIuYmluZCh0aGlzKSwgMTAwMDAwKTtcclxuICAgICAgICB0aGlzLnN0YXJ0ID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLm1haW4oKTtcclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICBjaGVja1Zpc2liaWxpdHlBUEkoKSB7XHJcbiAgICAvLyBoaWRkZW4g44OX44Ot44OR44OG44Kj44GK44KI44Gz5Y+v6KaW5oCn44Gu5aSJ5pu044Kk44OZ44Oz44OI44Gu5ZCN5YmN44KS6Kit5a6aXHJcbiAgICBpZiAodHlwZW9mIGRvY3VtZW50LmhpZGRlbiAhPT0gXCJ1bmRlZmluZWRcIikgeyAvLyBPcGVyYSAxMi4xMCDjgoQgRmlyZWZveCAxOCDku6XpmY3jgafjgrXjg53jg7zjg4ggXHJcbiAgICAgIHRoaXMuaGlkZGVuID0gXCJoaWRkZW5cIjtcclxuICAgICAgd2luZG93LnZpc2liaWxpdHlDaGFuZ2UgPSBcInZpc2liaWxpdHljaGFuZ2VcIjtcclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRvY3VtZW50Lm1vekhpZGRlbiAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICB0aGlzLmhpZGRlbiA9IFwibW96SGlkZGVuXCI7XHJcbiAgICAgIHdpbmRvdy52aXNpYmlsaXR5Q2hhbmdlID0gXCJtb3p2aXNpYmlsaXR5Y2hhbmdlXCI7XHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkb2N1bWVudC5tc0hpZGRlbiAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICB0aGlzLmhpZGRlbiA9IFwibXNIaWRkZW5cIjtcclxuICAgICAgd2luZG93LnZpc2liaWxpdHlDaGFuZ2UgPSBcIm1zdmlzaWJpbGl0eWNoYW5nZVwiO1xyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZG9jdW1lbnQud2Via2l0SGlkZGVuICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgIHRoaXMuaGlkZGVuID0gXCJ3ZWJraXRIaWRkZW5cIjtcclxuICAgICAgd2luZG93LnZpc2liaWxpdHlDaGFuZ2UgPSBcIndlYmtpdHZpc2liaWxpdHljaGFuZ2VcIjtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgY2FsY1NjcmVlblNpemUoKSB7XHJcbiAgICB2YXIgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcclxuICAgIHZhciBoZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcbiAgICBpZiAod2lkdGggPj0gaGVpZ2h0KSB7XHJcbiAgICAgIHdpZHRoID0gaGVpZ2h0ICogc2ZnLlZJUlRVQUxfV0lEVEggLyBzZmcuVklSVFVBTF9IRUlHSFQ7XHJcbiAgICAgIHdoaWxlICh3aWR0aCA+IHdpbmRvdy5pbm5lcldpZHRoKSB7XHJcbiAgICAgICAgLS1oZWlnaHQ7XHJcbiAgICAgICAgd2lkdGggPSBoZWlnaHQgKiBzZmcuVklSVFVBTF9XSURUSCAvIHNmZy5WSVJUVUFMX0hFSUdIVDtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaGVpZ2h0ID0gd2lkdGggKiBzZmcuVklSVFVBTF9IRUlHSFQgLyBzZmcuVklSVFVBTF9XSURUSDtcclxuICAgICAgd2hpbGUgKGhlaWdodCA+IHdpbmRvdy5pbm5lckhlaWdodCkge1xyXG4gICAgICAgIC0td2lkdGg7XHJcbiAgICAgICAgaGVpZ2h0ID0gd2lkdGggKiBzZmcuVklSVFVBTF9IRUlHSFQgLyBzZmcuVklSVFVBTF9XSURUSDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5DT05TT0xFX1dJRFRIID0gd2lkdGg7XHJcbiAgICB0aGlzLkNPTlNPTEVfSEVJR0hUID0gaGVpZ2h0O1xyXG4gIH1cclxuICBcclxuICAvLy8g44Kz44Oz44K944O844Or55S76Z2i44Gu5Yid5pyf5YyWXHJcbiAgaW5pdENvbnNvbGUoKSB7XHJcbiAgICAvLyDjg6zjg7Pjg4Djg6njg7zjga7kvZzmiJBcclxuICAgIHRoaXMucmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcih7IGFudGlhbGlhczogZmFsc2UsIHNvcnRPYmplY3RzOiB0cnVlIH0pO1xyXG4gICAgdmFyIHJlbmRlcmVyID0gdGhpcy5yZW5kZXJlcjtcclxuICAgIHRoaXMuY2FsY1NjcmVlblNpemUoKTtcclxuICAgIHJlbmRlcmVyLnNldFNpemUodGhpcy5DT05TT0xFX1dJRFRILCB0aGlzLkNPTlNPTEVfSEVJR0hUKTtcclxuICAgIHJlbmRlcmVyLnNldENsZWFyQ29sb3IoMCwgMSk7XHJcbiAgICByZW5kZXJlci5kb21FbGVtZW50LmlkID0gJ2NvbnNvbGUnO1xyXG4gICAgaWYoc2ZnLkRFQlVHKXtcclxuICAgICAgcmVuZGVyZXIuZG9tRWxlbWVudC5jbGFzc05hbWUgPSAnY29uc29sZS1kZWJ1Zyc7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZW5kZXJlci5kb21FbGVtZW50LmNsYXNzTmFtZSA9ICdjb25zb2xlJztcclxuICAgIH1cclxuICAgIHJlbmRlcmVyLmRvbUVsZW1lbnQuc3R5bGUuekluZGV4ID0gMDtcclxuXHJcblxyXG4gICAgZDMuc2VsZWN0KCcjY29udGVudCcpLm5vZGUoKS5hcHBlbmRDaGlsZChyZW5kZXJlci5kb21FbGVtZW50KTtcclxuICAgIGlmKHNmZy5ERUJVRyl7XHJcbiAgICAgICAgLy8gU3RhdHMg44Kq44OW44K444Kn44Kv44OIKEZQU+ihqOekuinjga7kvZzmiJDooajnpLpcclxuICAgICAgICB0aGlzLnN0YXRzID0gbmV3IFN0YXRzKCk7XHJcbiAgICAgICAgdGhpcy5zdGF0cy5kb21FbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcclxuICAgICAgICB0aGlzLnN0YXRzLmRvbUVsZW1lbnQuc3R5bGUudG9wID0gJzBweCc7XHJcbiAgICAgICAgdGhpcy5zdGF0cy5kb21FbGVtZW50LnN0eWxlLmxlZnQgPSAnMHB4JztcclxuICAgICAgICB0aGlzLnN0YXRzLmRvbUVsZW1lbnQuc3R5bGUubGVmdCA9IHJlbmRlcmVyLmRvbUVsZW1lbnQuc3R5bGUubGVmdDtcclxuXHJcbiAgICAgICBkMy5zZWxlY3QoJyNjb250ZW50JykuYXBwZW5kKCdkaXYnKS5hdHRyKCdjbGFzcycsJ2RlYnVnLXVpJykudGV4dCgndGVzdCcpXHJcbiAgICAgICAuc3R5bGUoJ2hlaWdodCcsdGhpcy5DT05TT0xFX0hFSUdIVCArICdweCcpXHJcbiAgICAgICAubm9kZSgpLmFwcGVuZENoaWxkKHRoaXMuc3RhdHMuZG9tRWxlbWVudCk7XHJcbiAgICAgfSAgICAgICBcclxuXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xyXG4gICAgICB0aGlzLmNhbGNTY3JlZW5TaXplKCk7XHJcbiAgICAgIHJlbmRlcmVyLnNldFNpemUodGhpcy5DT05TT0xFX1dJRFRILCB0aGlzLkNPTlNPTEVfSEVJR0hUKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIOOCt+ODvOODs+OBruS9nOaIkFxyXG4gICAgdGhpcy5zY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xyXG5cclxuICAgIC8vIOOCq+ODoeODqeOBruS9nOaIkFxyXG4gICAgdGhpcy5jYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoOTAuMCwgc2ZnLlZJUlRVQUxfV0lEVEggLyBzZmcuVklSVFVBTF9IRUlHSFQpO1xyXG4gICAgdGhpcy5jYW1lcmEucG9zaXRpb24ueiA9IHNmZy5WSVJUVUFMX0hFSUdIVCAvIDI7XHJcbiAgICB0aGlzLmNhbWVyYS5sb29rQXQobmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMCkpO1xyXG5cclxuICAgIC8vIOODqeOCpOODiOOBruS9nOaIkFxyXG4gICAgLy92YXIgbGlnaHQgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCgweGZmZmZmZik7XHJcbiAgICAvL2xpZ2h0LnBvc2l0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjMoMC41NzcsIDAuNTc3LCAwLjU3Nyk7XHJcbiAgICAvL3NjZW5lLmFkZChsaWdodCk7XHJcblxyXG4gICAgLy92YXIgYW1iaWVudCA9IG5ldyBUSFJFRS5BbWJpZW50TGlnaHQoMHhmZmZmZmYpO1xyXG4gICAgLy9zY2VuZS5hZGQoYW1iaWVudCk7XHJcbiAgICBpZiAoc2ZnLkRFQlVHKSB7XHJcbiAgICAgIGQzLnNlbGVjdCgnYm9keScpLm9uKCdrZXlkb3duLkRldlRvb2wnLCAoKSA9PiB7XHJcbiAgICAgICAgdmFyIGUgPSBkMy5ldmVudDtcclxuICAgICAgICBpZih0aGlzLkRldlRvb2wua2V5ZG93bi5uZXh0KGUpLnZhbHVlKXtcclxuICAgICAgICAgIGQzLmV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICBkMy5ldmVudC5jYW5jZWxCdWJibGUgPSB0cnVlO1xyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH07XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcmVuZGVyZXIuY2xlYXIoKTtcclxuICB9XHJcblxyXG4gIC8vLyDjgqjjg6njg7zjgafntYLkuobjgZnjgovjgIJcclxuICBFeGl0RXJyb3IoZSkge1xyXG4gICAgLy9jdHguZmlsbFN0eWxlID0gXCJyZWRcIjtcclxuICAgIC8vY3R4LmZpbGxSZWN0KDAsIDAsIENPTlNPTEVfV0lEVEgsIENPTlNPTEVfSEVJR0hUKTtcclxuICAgIC8vY3R4LmZpbGxTdHlsZSA9IFwid2hpdGVcIjtcclxuICAgIC8vY3R4LmZpbGxUZXh0KFwiRXJyb3IgOiBcIiArIGUsIDAsIDIwKTtcclxuICAgIC8vLy9hbGVydChlKTtcclxuICAgIHRoaXMuc3RhcnQgPSBmYWxzZTtcclxuICAgIHRocm93IGU7XHJcbiAgfVxyXG5cclxuICBvblZpc2liaWxpdHlDaGFuZ2UoKSB7XHJcbiAgICB2YXIgaCA9IGRvY3VtZW50W3RoaXMuaGlkZGVuXTtcclxuICAgIHRoaXMuaXNIaWRkZW4gPSBoO1xyXG4gICAgaWYgKGgpIHtcclxuICAgICAgdGhpcy5wYXVzZSgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5yZXN1bWUoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHBhdXNlKCkge1xyXG4gICAgaWYgKHNmZy5nYW1lVGltZXIuc3RhdHVzID09IHNmZy5nYW1lVGltZXIuU1RBUlQpIHtcclxuICAgICAgc2ZnLmdhbWVUaW1lci5wYXVzZSgpO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuc2VxdWVuY2VyLnN0YXR1cyA9PSB0aGlzLnNlcXVlbmNlci5QTEFZKSB7XHJcbiAgICAgIHRoaXMuc2VxdWVuY2VyLnBhdXNlKCk7XHJcbiAgICB9XHJcbiAgICBzZmcucGF1c2UgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgcmVzdW1lKCkge1xyXG4gICAgaWYgKHNmZy5nYW1lVGltZXIuc3RhdHVzID09IHNmZy5nYW1lVGltZXIuUEFVU0UpIHtcclxuICAgICAgc2ZnLmdhbWVUaW1lci5yZXN1bWUoKTtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnNlcXVlbmNlci5zdGF0dXMgPT0gdGhpcy5zZXF1ZW5jZXIuUEFVU0UpIHtcclxuICAgICAgdGhpcy5zZXF1ZW5jZXIucmVzdW1lKCk7XHJcbiAgICB9XHJcbiAgICBzZmcucGF1c2UgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8vLyDnj77lnKjmmYLplpPjga7lj5blvpdcclxuICBnZXRDdXJyZW50VGltZSgpIHtcclxuICAgIHJldHVybiB0aGlzLmF1ZGlvXy5hdWRpb2N0eC5jdXJyZW50VGltZTtcclxuICB9XHJcblxyXG4gIC8vLyDjg5bjg6njgqbjgrbjga7mqZ/og73jg4Hjgqfjg4Pjgq9cclxuICBjaGVja0Jyb3dzZXJTdXBwb3J0KCkge1xyXG4gICAgdmFyIGNvbnRlbnQgPSAnPGltZyBjbGFzcz1cImVycm9yaW1nXCIgc3JjPVwiaHR0cDovL3B1YmxpYy5ibHUubGl2ZWZpbGVzdG9yZS5jb20veTJwYlkzYXFCejZ3ejRhaDg3UlhFVms1Q2xoRDJMdWpDNU5zNjZIS3ZSODlhanJGZExNMFR4RmVyWVlVUnQ4M2NfYmczNUhTa3FjM0U4R3hhRkQ4LVg5NE1Mc0ZWNUdVNkJZcDE5NUl2ZWdldlEvMjAxMzEwMDEucG5nP3BzaWQ9MVwiIHdpZHRoPVwiNDc5XCIgaGVpZ2h0PVwiNjQwXCIgY2xhc3M9XCJhbGlnbm5vbmVcIiAvPic7XHJcbiAgICAvLyBXZWJHTOOBruOCteODneODvOODiOODgeOCp+ODg+OCr1xyXG4gICAgaWYgKCFEZXRlY3Rvci53ZWJnbCkge1xyXG4gICAgICBkMy5zZWxlY3QoJyNjb250ZW50JykuYXBwZW5kKCdkaXYnKS5jbGFzc2VkKCdlcnJvcicsIHRydWUpLmh0bWwoXHJcbiAgICAgICAgY29udGVudCArICc8cCBjbGFzcz1cImVycm9ydGV4dFwiPuODluODqeOCpuOCtuOBjDxici8+V2ViR0zjgpLjgrXjg53jg7zjg4jjgZfjgabjgYTjgarjgYTjgZ/jgoE8YnIvPuWLleS9nOOBhOOBn+OBl+OBvuOBm+OCk+OAgjwvcD4nKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFdlYiBBdWRpbyBBUEnjg6njg4Pjg5Hjg7xcclxuICAgIGlmICghdGhpcy5hdWRpb18uZW5hYmxlKSB7XHJcbiAgICAgIGQzLnNlbGVjdCgnI2NvbnRlbnQnKS5hcHBlbmQoJ2RpdicpLmNsYXNzZWQoJ2Vycm9yJywgdHJ1ZSkuaHRtbChcclxuICAgICAgICBjb250ZW50ICsgJzxwIGNsYXNzPVwiZXJyb3J0ZXh0XCI+44OW44Op44Km44K244GMPGJyLz5XZWIgQXVkaW8gQVBJ44KS44K144Od44O844OI44GX44Gm44GE44Gq44GE44Gf44KBPGJyLz7li5XkvZzjgYTjgZ/jgZfjgb7jgZvjgpPjgII8L3A+Jyk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyDjg5bjg6njgqbjgrbjgYxQYWdlIFZpc2liaWxpdHkgQVBJIOOCkuOCteODneODvOODiOOBl+OBquOBhOWgtOWQiOOBq+itpuWRiiBcclxuICAgIGlmICh0eXBlb2YgdGhpcy5oaWRkZW4gPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIGQzLnNlbGVjdCgnI2NvbnRlbnQnKS5hcHBlbmQoJ2RpdicpLmNsYXNzZWQoJ2Vycm9yJywgdHJ1ZSkuaHRtbChcclxuICAgICAgICBjb250ZW50ICsgJzxwIGNsYXNzPVwiZXJyb3J0ZXh0XCI+44OW44Op44Km44K244GMPGJyLz5QYWdlIFZpc2liaWxpdHkgQVBJ44KS44K144Od44O844OI44GX44Gm44GE44Gq44GE44Gf44KBPGJyLz7li5XkvZzjgYTjgZ/jgZfjgb7jgZvjgpPjgII8L3A+Jyk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodHlwZW9mIGxvY2FsU3RvcmFnZSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgZDMuc2VsZWN0KCcjY29udGVudCcpLmFwcGVuZCgnZGl2JykuY2xhc3NlZCgnZXJyb3InLCB0cnVlKS5odG1sKFxyXG4gICAgICAgIGNvbnRlbnQgKyAnPHAgY2xhc3M9XCJlcnJvcnRleHRcIj7jg5bjg6njgqbjgrbjgYw8YnIvPldlYiBMb2NhbCBTdG9yYWdl44KS44K144Od44O844OI44GX44Gm44GE44Gq44GE44Gf44KBPGJyLz7li5XkvZzjgYTjgZ/jgZfjgb7jgZvjgpPjgII8L3A+Jyk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuc3RvcmFnZSA9IGxvY2FsU3RvcmFnZTtcclxuICAgIH1cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuIFxyXG4gIC8vLyDjgrLjg7zjg6Djg6HjgqTjg7NcclxuICBtYWluKCkge1xyXG4gICAgLy8g44K/44K544Kv44Gu5ZG844Gz5Ye644GXXHJcbiAgICAvLyDjg6HjgqTjg7Pjgavmj4/nlLtcclxuICAgIGlmICh0aGlzLnN0YXJ0KSB7XHJcbiAgICAgIHRoaXMudGFza3MucHJvY2Vzcyh0aGlzKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGxvYWRSZXNvdXJjZXMoKSB7XHJcbiAgICAvLy8g44Ky44O844Og5Lit44Gu44OG44Kv44K544OB44Oj44O85a6a576pXHJcbiAgICB2YXIgdGV4dHVyZXMgPSB7XHJcbiAgICAgIGZvbnQ6ICdGb250LnBuZycsXHJcbiAgICAgIGZvbnQxOiAnRm9udDIucG5nJyxcclxuICAgICAgYXV0aG9yOiAnYXV0aG9yLnBuZycsXHJcbiAgICAgIHRpdGxlOiAnVElUTEUucG5nJyxcclxuICAgICAgbXlzaGlwOiAnbXlzaGlwMi5wbmcnLFxyXG4gICAgICBlbmVteTogJ2VuZW15LnBuZycsXHJcbiAgICAgIGJvbWI6ICdib21iLnBuZydcclxuICAgIH07XHJcbiAgICAvLy8g44OG44Kv44K544OB44Oj44O844Gu44Ot44O844OJXHJcbiAgXHJcbiAgICB2YXIgbG9hZFByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoKTtcclxuICAgIHZhciBsb2FkZXIgPSBuZXcgVEhSRUUuVGV4dHVyZUxvYWRlcigpO1xyXG4gICAgZnVuY3Rpb24gbG9hZFRleHR1cmUoc3JjKSB7XHJcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgbG9hZGVyLmxvYWQoc3JjLCAodGV4dHVyZSkgPT4ge1xyXG4gICAgICAgICAgdGV4dHVyZS5tYWdGaWx0ZXIgPSBUSFJFRS5OZWFyZXN0RmlsdGVyO1xyXG4gICAgICAgICAgdGV4dHVyZS5taW5GaWx0ZXIgPSBUSFJFRS5MaW5lYXJNaXBNYXBMaW5lYXJGaWx0ZXI7XHJcbiAgICAgICAgICByZXNvbHZlKHRleHR1cmUpO1xyXG4gICAgICAgIH0sIG51bGwsICh4aHIpID0+IHsgcmVqZWN0KHhocikgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciB0ZXhMZW5ndGggPSBPYmplY3Qua2V5cyh0ZXh0dXJlcykubGVuZ3RoO1xyXG4gICAgdmFyIHRleENvdW50ID0gMDtcclxuICAgIHRoaXMucHJvZ3Jlc3MgPSBuZXcgZ3JhcGhpY3MuUHJvZ3Jlc3MoKTtcclxuICAgIHRoaXMucHJvZ3Jlc3MubWVzaC5wb3NpdGlvbi56ID0gMC4wMDE7XHJcbiAgICB0aGlzLnByb2dyZXNzLnJlbmRlcignTG9hZGluZyBSZXNvdWNlcyAuLi4nLCAwKTtcclxuICAgIHRoaXMuc2NlbmUuYWRkKHRoaXMucHJvZ3Jlc3MubWVzaCk7XHJcbiAgICBmb3IgKHZhciBuIGluIHRleHR1cmVzKSB7XHJcbiAgICAgICgobmFtZSwgdGV4UGF0aCkgPT4ge1xyXG4gICAgICAgIGxvYWRQcm9taXNlID0gbG9hZFByb21pc2VcclxuICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGxvYWRUZXh0dXJlKCcuL3Jlcy8nICsgdGV4UGF0aCk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLnRoZW4oKHRleCkgPT4ge1xyXG4gICAgICAgICAgICB0ZXhDb3VudCsrO1xyXG4gICAgICAgICAgICB0aGlzLnByb2dyZXNzLnJlbmRlcignTG9hZGluZyBSZXNvdWNlcyAuLi4nLCAodGV4Q291bnQgLyB0ZXhMZW5ndGggKiAxMDApIHwgMCk7XHJcbiAgICAgICAgICAgIHNmZy50ZXh0dXJlRmlsZXNbbmFtZV0gPSB0ZXg7XHJcbiAgICAgICAgICAgIHRoaXMucmVuZGVyZXIucmVuZGVyKHRoaXMuc2NlbmUsIHRoaXMuY2FtZXJhKTtcclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH0pKG4sIHRleHR1cmVzW25dKTtcclxuICAgIH1cclxuICAgIHJldHVybiBsb2FkUHJvbWlzZTtcclxuICB9XHJcblxyXG4qcmVuZGVyKHRhc2tJbmRleCkge1xyXG4gIHdoaWxlKHRydWUpe1xyXG4gICAgdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5zY2VuZSwgdGhpcy5jYW1lcmEpO1xyXG4gICAgdGhpcy50ZXh0UGxhbmUucmVuZGVyKCk7XHJcbiAgICB0aGlzLnN0YXRzICYmIHRoaXMuc3RhdHMudXBkYXRlKCk7XHJcbiAgICB5aWVsZDtcclxuICB9XHJcbn1cclxuXHJcbippbml0KHRhc2tJbmRleCkge1xyXG5cclxuICB0aGlzLnNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XHJcbiAgdGhpcy5lbmVteUJ1bGxldHMgPSBuZXcgZW5lbWllcy5FbmVteUJ1bGxldHModGhpcy5zY2VuZSwgdGhpcy5zZS5iaW5kKHRoaXMpKTtcclxuICB0aGlzLmVuZW1pZXMgPSBuZXcgZW5lbWllcy5FbmVtaWVzKHRoaXMuc2NlbmUsIHRoaXMuc2UuYmluZCh0aGlzKSwgdGhpcy5lbmVteUJ1bGxldHMpO1xyXG4gIHNmZy5ib21icyA9IG5ldyBlZmZlY3RvYmouQm9tYnModGhpcy5zY2VuZSwgdGhpcy5zZS5iaW5kKHRoaXMpKTtcclxuICB0aGlzLnN0YWdlID0gc2ZnLnN0YWdlID0gbmV3IFN0YWdlKCk7XHJcbiAgdGhpcy5zcGFjZUZpZWxkID0gbnVsbDtcclxuXHJcbiAgLy8g44OP44Oz44OJ44Or44ON44O844Og44Gu5Y+W5b6XXHJcbiAgdGhpcy5oYW5kbGVOYW1lID0gdGhpcy5zdG9yYWdlLmdldEl0ZW0oJ2hhbmRsZU5hbWUnKTtcclxuXHJcbiAgdGhpcy50ZXh0UGxhbmUgPSBuZXcgdGV4dC5UZXh0UGxhbmUodGhpcy5zY2VuZSk7XHJcbiAgLy8gdGV4dFBsYW5lLnByaW50KDAsIDAsIFwiV2ViIEF1ZGlvIEFQSSBUZXN0XCIsIG5ldyBUZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICAvLyDjgrnjgrPjgqLmg4XloLEg6YCa5L+h55SoXHJcbiAgdGhpcy5jb21tXyA9IG5ldyBjb21tLkNvbW0oKTtcclxuICB0aGlzLmNvbW1fLnVwZGF0ZUhpZ2hTY29yZXMgPSAoZGF0YSkgPT4ge1xyXG4gICAgdGhpcy5oaWdoU2NvcmVzID0gZGF0YTtcclxuICAgIHRoaXMuaGlnaFNjb3JlID0gdGhpcy5oaWdoU2NvcmVzWzBdLnNjb3JlO1xyXG4gIH07XHJcblxyXG4gIHRoaXMuY29tbV8udXBkYXRlSGlnaFNjb3JlID0gKGRhdGEpID0+IHtcclxuICAgIGlmICh0aGlzLmhpZ2hTY29yZSA8IGRhdGEuc2NvcmUpIHtcclxuICAgICAgdGhpcy5oaWdoU2NvcmUgPSBkYXRhLnNjb3JlO1xyXG4gICAgICB0aGlzLnByaW50U2NvcmUoKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAvLyBzY2VuZS5hZGQodGV4dFBsYW5lLm1lc2gpO1xyXG5cclxuICAvL+S9nOiAheWQjeODkeODvOODhuOCo+OCr+ODq+OCkuS9nOaIkFxyXG5cclxuICBpZiAoIXNmZy5ERUJVRykge1xyXG4gICAgdGhpcy5iYXNpY0lucHV0LmJpbmQoKTtcclxuICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLnByaW50QXV0aG9yLmJpbmQodGhpcykpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0aGlzLmJhc2ljSW5wdXQuYmluZCgpO1xyXG4gICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuZ2FtZUluaXQuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLnNob3dTcGFjZUZpZWxkKCk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g5L2c6ICF6KGo56S6XHJcbipwcmludEF1dGhvcih0YXNrSW5kZXgpIHtcclxuICBjb25zdCB3YWl0ID0gNjA7XHJcbiAgdGhpcy5iYXNpY0lucHV0LmtleUJ1ZmZlci5sZW5ndGggPSAwO1xyXG4gIFxyXG4gIGxldCBuZXh0VGFzayA9ICgpPT57XHJcbiAgICB0aGlzLnNjZW5lLnJlbW92ZSh0aGlzLmF1dGhvcik7XHJcbiAgICAvL3NjZW5lLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLmluaXRUaXRsZS5iaW5kKHRoaXMpKTtcclxuICB9XHJcbiAgXHJcbiAgbGV0IGNoZWNrS2V5SW5wdXQgPSAoKT0+IHtcclxuICAgIGlmICh0aGlzLmJhc2ljSW5wdXQua2V5QnVmZmVyLmxlbmd0aCA+IDApIHtcclxuICAgICAgdGhpcy5iYXNpY0lucHV0LmtleUJ1ZmZlci5sZW5ndGggPSAwO1xyXG4gICAgICBuZXh0VGFzaygpO1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9ICBcclxuXHJcbiAgLy8g5Yid5pyf5YyWXHJcbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gIHZhciB3ID0gc2ZnLnRleHR1cmVGaWxlcy5hdXRob3IuaW1hZ2Uud2lkdGg7XHJcbiAgdmFyIGggPSBzZmcudGV4dHVyZUZpbGVzLmF1dGhvci5pbWFnZS5oZWlnaHQ7XHJcbiAgY2FudmFzLndpZHRoID0gdztcclxuICBjYW52YXMuaGVpZ2h0ID0gaDtcclxuICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgY3R4LmRyYXdJbWFnZShzZmcudGV4dHVyZUZpbGVzLmF1dGhvci5pbWFnZSwgMCwgMCk7XHJcbiAgdmFyIGRhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIHcsIGgpO1xyXG4gIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5HZW9tZXRyeSgpO1xyXG5cclxuICBnZW9tZXRyeS52ZXJ0X3N0YXJ0ID0gW107XHJcbiAgZ2VvbWV0cnkudmVydF9lbmQgPSBbXTtcclxuXHJcbiAge1xyXG4gICAgdmFyIGkgPSAwO1xyXG5cclxuICAgIGZvciAodmFyIHkgPSAwOyB5IDwgaDsgKyt5KSB7XHJcbiAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgdzsgKyt4KSB7XHJcbiAgICAgICAgdmFyIGNvbG9yID0gbmV3IFRIUkVFLkNvbG9yKCk7XHJcblxyXG4gICAgICAgIHZhciByID0gZGF0YS5kYXRhW2krK107XHJcbiAgICAgICAgdmFyIGcgPSBkYXRhLmRhdGFbaSsrXTtcclxuICAgICAgICB2YXIgYiA9IGRhdGEuZGF0YVtpKytdO1xyXG4gICAgICAgIHZhciBhID0gZGF0YS5kYXRhW2krK107XHJcbiAgICAgICAgaWYgKGEgIT0gMCkge1xyXG4gICAgICAgICAgY29sb3Iuc2V0UkdCKHIgLyAyNTUuMCwgZyAvIDI1NS4wLCBiIC8gMjU1LjApO1xyXG4gICAgICAgICAgdmFyIHZlcnQgPSBuZXcgVEhSRUUuVmVjdG9yMygoKHggLSB3IC8gMi4wKSksICgoeSAtIGggLyAyKSkgKiAtMSwgMC4wKTtcclxuICAgICAgICAgIHZhciB2ZXJ0MiA9IG5ldyBUSFJFRS5WZWN0b3IzKDEyMDAgKiBNYXRoLnJhbmRvbSgpIC0gNjAwLCAxMjAwICogTWF0aC5yYW5kb20oKSAtIDYwMCwgMTIwMCAqIE1hdGgucmFuZG9tKCkgLSA2MDApO1xyXG4gICAgICAgICAgZ2VvbWV0cnkudmVydF9zdGFydC5wdXNoKG5ldyBUSFJFRS5WZWN0b3IzKHZlcnQyLnggLSB2ZXJ0LngsIHZlcnQyLnkgLSB2ZXJ0LnksIHZlcnQyLnogLSB2ZXJ0LnopKTtcclxuICAgICAgICAgIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2godmVydDIpO1xyXG4gICAgICAgICAgZ2VvbWV0cnkudmVydF9lbmQucHVzaCh2ZXJ0KTtcclxuICAgICAgICAgIGdlb21ldHJ5LmNvbG9ycy5wdXNoKGNvbG9yKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIOODnuODhuODquOCouODq+OCkuS9nOaIkFxyXG4gIC8vdmFyIHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKCdpbWFnZXMvcGFydGljbGUxLnBuZycpO1xyXG4gIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5Qb2ludHNNYXRlcmlhbCh7c2l6ZTogMjAsIGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLFxyXG4gICAgdHJhbnNwYXJlbnQ6IHRydWUsIHZlcnRleENvbG9yczogdHJ1ZSwgZGVwdGhUZXN0OiBmYWxzZS8vLCBtYXA6IHRleHR1cmVcclxuICB9KTtcclxuXHJcbiAgdGhpcy5hdXRob3IgPSBuZXcgVEhSRUUuUG9pbnRzKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgLy8gICAgYXV0aG9yLnBvc2l0aW9uLnggYXV0aG9yLnBvc2l0aW9uLnk9ICA9MC4wLCAwLjAsIDAuMCk7XHJcblxyXG4gIC8vbWVzaC5zb3J0UGFydGljbGVzID0gZmFsc2U7XHJcbiAgLy92YXIgbWVzaDEgPSBuZXcgVEhSRUUuUGFydGljbGVTeXN0ZW0oKTtcclxuICAvL21lc2guc2NhbGUueCA9IG1lc2guc2NhbGUueSA9IDguMDtcclxuXHJcbiAgdGhpcy5zY2VuZS5hZGQodGhpcy5hdXRob3IpOyAgXHJcblxyXG4gXHJcbiAgLy8g5L2c6ICF6KGo56S644K544OG44OD44OX77yRXHJcbiAgZm9yKGxldCBjb3VudCA9IDEuMDtjb3VudCA+IDA7KGNvdW50IDw9IDAuMDEpP2NvdW50IC09IDAuMDAwNTpjb3VudCAtPSAwLjAwMjUpXHJcbiAge1xyXG4gICAgLy8g5L2V44GL44Kt44O85YWl5Yqb44GM44GC44Gj44Gf5aC05ZCI44Gv5qyh44Gu44K/44K544Kv44G4XHJcbiAgICBpZihjaGVja0tleUlucHV0KCkpe1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxldCBlbmQgPSB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlcy5sZW5ndGg7XHJcbiAgICBsZXQgdiA9IHRoaXMuYXV0aG9yLmdlb21ldHJ5LnZlcnRpY2VzO1xyXG4gICAgbGV0IGQgPSB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0X3N0YXJ0O1xyXG4gICAgbGV0IHYyID0gdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydF9lbmQ7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIHZbaV0ueCA9IHYyW2ldLnggKyBkW2ldLnggKiBjb3VudDtcclxuICAgICAgdltpXS55ID0gdjJbaV0ueSArIGRbaV0ueSAqIGNvdW50O1xyXG4gICAgICB2W2ldLnogPSB2MltpXS56ICsgZFtpXS56ICogY291bnQ7XHJcbiAgICB9XHJcbiAgICB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlc05lZWRVcGRhdGUgPSB0cnVlO1xyXG4gICAgdGhpcy5hdXRob3Iucm90YXRpb24ueCA9IHRoaXMuYXV0aG9yLnJvdGF0aW9uLnkgPSB0aGlzLmF1dGhvci5yb3RhdGlvbi56ID0gY291bnQgKiA0LjA7XHJcbiAgICB0aGlzLmF1dGhvci5tYXRlcmlhbC5vcGFjaXR5ID0gMS4wO1xyXG4gICAgeWllbGQ7XHJcbiAgfVxyXG4gIHRoaXMuYXV0aG9yLnJvdGF0aW9uLnggPSB0aGlzLmF1dGhvci5yb3RhdGlvbi55ID0gdGhpcy5hdXRob3Iucm90YXRpb24ueiA9IDAuMDtcclxuXHJcbiAgZm9yIChsZXQgaSA9IDAsZSA9IHRoaXMuYXV0aG9yLmdlb21ldHJ5LnZlcnRpY2VzLmxlbmd0aDsgaSA8IGU7ICsraSkge1xyXG4gICAgdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydGljZXNbaV0ueCA9IHRoaXMuYXV0aG9yLmdlb21ldHJ5LnZlcnRfZW5kW2ldLng7XHJcbiAgICB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlc1tpXS55ID0gdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydF9lbmRbaV0ueTtcclxuICAgIHRoaXMuYXV0aG9yLmdlb21ldHJ5LnZlcnRpY2VzW2ldLnogPSB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0X2VuZFtpXS56O1xyXG4gIH1cclxuICB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlc05lZWRVcGRhdGUgPSB0cnVlO1xyXG5cclxuICAvLyDlvoXjgaFcclxuICBmb3IobGV0IGkgPSAwO2kgPCB3YWl0OysraSl7XHJcbiAgICAvLyDkvZXjgYvjgq3jg7zlhaXlipvjgYzjgYLjgaPjgZ/loLTlkIjjga/mrKHjga7jgr/jgrnjgq/jgbhcclxuICAgIGlmKGNoZWNrS2V5SW5wdXQoKSl7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLmF1dGhvci5tYXRlcmlhbC5zaXplID4gMikge1xyXG4gICAgICB0aGlzLmF1dGhvci5tYXRlcmlhbC5zaXplIC09IDAuNTtcclxuICAgICAgdGhpcy5hdXRob3IubWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgfSAgICBcclxuICAgIHlpZWxkO1xyXG4gIH1cclxuXHJcbiAgLy8g44OV44Kn44O844OJ44Ki44Km44OIXHJcbiAgZm9yKGxldCBjb3VudCA9IDAuMDtjb3VudCA8PSAxLjA7Y291bnQgKz0gMC4wNSlcclxuICB7XHJcbiAgICAvLyDkvZXjgYvjgq3jg7zlhaXlipvjgYzjgYLjgaPjgZ/loLTlkIjjga/mrKHjga7jgr/jgrnjgq/jgbhcclxuICAgIGlmKGNoZWNrS2V5SW5wdXQoKSl7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHRoaXMuYXV0aG9yLm1hdGVyaWFsLm9wYWNpdHkgPSAxLjAgLSBjb3VudDtcclxuICAgIHRoaXMuYXV0aG9yLm1hdGVyaWFsLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIFxyXG4gICAgeWllbGQ7XHJcbiAgfVxyXG5cclxuICB0aGlzLmF1dGhvci5tYXRlcmlhbC5vcGFjaXR5ID0gMC4wOyBcclxuICB0aGlzLmF1dGhvci5tYXRlcmlhbC5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcblxyXG4gIC8vIOW+heOBoVxyXG4gIGZvcihsZXQgaSA9IDA7aSA8IHdhaXQ7KytpKXtcclxuICAgIC8vIOS9leOBi+OCreODvOWFpeWKm+OBjOOBguOBo+OBn+WgtOWQiOOBr+asoeOBruOCv+OCueOCr+OBuFxyXG4gICAgaWYoY2hlY2tLZXlJbnB1dCgpKXtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgeWllbGQ7XHJcbiAgfVxyXG4gIG5leHRUYXNrKCk7XHJcbn1cclxuXHJcbi8vLyDjgr/jgqTjg4jjg6vnlLvpnaLliJ3mnJ/ljJYgLy8vXHJcbippbml0VGl0bGUodGFza0luZGV4KSB7XHJcbiAgXHJcbiAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgXHJcbiAgdGhpcy5iYXNpY0lucHV0LmNsZWFyKCk7XHJcblxyXG4gIC8vIOOCv+OCpOODiOODq+ODoeODg+OCt+ODpeOBruS9nOaIkOODu+ihqOekuiAvLy9cclxuICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBtYXA6IHNmZy50ZXh0dXJlRmlsZXMudGl0bGUgfSk7XHJcbiAgbWF0ZXJpYWwuc2hhZGluZyA9IFRIUkVFLkZsYXRTaGFkaW5nO1xyXG4gIC8vbWF0ZXJpYWwuYW50aWFsaWFzID0gZmFsc2U7XHJcbiAgbWF0ZXJpYWwudHJhbnNwYXJlbnQgPSB0cnVlO1xyXG4gIG1hdGVyaWFsLmFscGhhVGVzdCA9IDAuNTtcclxuICBtYXRlcmlhbC5kZXB0aFRlc3QgPSB0cnVlO1xyXG4gIHRoaXMudGl0bGUgPSBuZXcgVEhSRUUuTWVzaChcclxuICAgIG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KHNmZy50ZXh0dXJlRmlsZXMudGl0bGUuaW1hZ2Uud2lkdGgsIHNmZy50ZXh0dXJlRmlsZXMudGl0bGUuaW1hZ2UuaGVpZ2h0KSxcclxuICAgIG1hdGVyaWFsXHJcbiAgICApO1xyXG4gIHRoaXMudGl0bGUuc2NhbGUueCA9IHRoaXMudGl0bGUuc2NhbGUueSA9IDAuODtcclxuICB0aGlzLnRpdGxlLnBvc2l0aW9uLnkgPSA4MDtcclxuICB0aGlzLnNjZW5lLmFkZCh0aGlzLnRpdGxlKTtcclxuICB0aGlzLnNob3dTcGFjZUZpZWxkKCk7XHJcbiAgLy8vIOODhuOCreOCueODiOihqOekulxyXG4gIHRoaXMudGV4dFBsYW5lLnByaW50KDMsIDI1LCBcIlB1c2ggeiBrZXkgdG8gU3RhcnQgR2FtZVwiLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICBzZmcuZ2FtZVRpbWVyLnN0YXJ0KCk7XHJcbiAgdGhpcy5zaG93VGl0bGUuZW5kVGltZSA9IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgKyAxMC8q56eSKi87XHJcbiAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuc2hvd1RpdGxlLmJpbmQodGhpcykpO1xyXG4gIHJldHVybjtcclxufVxyXG5cclxuLy8vIOiDjOaZr+ODkeODvOODhuOCo+OCr+ODq+ihqOekulxyXG5zaG93U3BhY2VGaWVsZCgpIHtcclxuICAvLy8g6IOM5pmv44OR44O844OG44Kj44Kv44Or6KGo56S6XHJcbiAgaWYgKCF0aGlzLnNwYWNlRmllbGQpIHtcclxuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5HZW9tZXRyeSgpO1xyXG5cclxuICAgIGdlb21ldHJ5LmVuZHkgPSBbXTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMjUwOyArK2kpIHtcclxuICAgICAgdmFyIGNvbG9yID0gbmV3IFRIUkVFLkNvbG9yKCk7XHJcbiAgICAgIHZhciB6ID0gLTE4MDAuMCAqIE1hdGgucmFuZG9tKCkgLSAzMDAuMDtcclxuICAgICAgY29sb3Iuc2V0SFNMKDAuMDUgKyBNYXRoLnJhbmRvbSgpICogMC4wNSwgMS4wLCAoLTIxMDAgLSB6KSAvIC0yMTAwKTtcclxuICAgICAgdmFyIGVuZHkgPSBzZmcuVklSVFVBTF9IRUlHSFQgLyAyIC0geiAqIHNmZy5WSVJUVUFMX0hFSUdIVCAvIHNmZy5WSVJUVUFMX1dJRFRIO1xyXG4gICAgICB2YXIgdmVydDIgPSBuZXcgVEhSRUUuVmVjdG9yMygoc2ZnLlZJUlRVQUxfV0lEVEggLSB6ICogMikgKiBNYXRoLnJhbmRvbSgpIC0gKChzZmcuVklSVFVBTF9XSURUSCAtIHogKiAyKSAvIDIpXHJcbiAgICAgICAgLCBlbmR5ICogMiAqIE1hdGgucmFuZG9tKCkgLSBlbmR5LCB6KTtcclxuICAgICAgZ2VvbWV0cnkudmVydGljZXMucHVzaCh2ZXJ0Mik7XHJcbiAgICAgIGdlb21ldHJ5LmVuZHkucHVzaChlbmR5KTtcclxuXHJcbiAgICAgIGdlb21ldHJ5LmNvbG9ycy5wdXNoKGNvbG9yKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyDjg57jg4bjg6rjgqLjg6vjgpLkvZzmiJBcclxuICAgIC8vdmFyIHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKCdpbWFnZXMvcGFydGljbGUxLnBuZycpO1xyXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLlBvaW50c01hdGVyaWFsKHtcclxuICAgICAgc2l6ZTogNCwgYmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcsXHJcbiAgICAgIHRyYW5zcGFyZW50OiB0cnVlLCB2ZXJ0ZXhDb2xvcnM6IHRydWUsIGRlcHRoVGVzdDogdHJ1ZS8vLCBtYXA6IHRleHR1cmVcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuc3BhY2VGaWVsZCA9IG5ldyBUSFJFRS5Qb2ludHMoZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICAgIHRoaXMuc3BhY2VGaWVsZC5wb3NpdGlvbi54ID0gdGhpcy5zcGFjZUZpZWxkLnBvc2l0aW9uLnkgPSB0aGlzLnNwYWNlRmllbGQucG9zaXRpb24ueiA9IDAuMDtcclxuICAgIHRoaXMuc2NlbmUuYWRkKHRoaXMuc3BhY2VGaWVsZCk7XHJcbiAgICB0aGlzLnRhc2tzLnB1c2hUYXNrKHRoaXMubW92ZVNwYWNlRmllbGQuYmluZCh0aGlzKSk7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g5a6H5a6Z56m66ZaT44Gu6KGo56S6XHJcbiptb3ZlU3BhY2VGaWVsZCh0YXNrSW5kZXgpIHtcclxuICB3aGlsZSh0cnVlKXtcclxuICAgIHZhciB2ZXJ0cyA9IHRoaXMuc3BhY2VGaWVsZC5nZW9tZXRyeS52ZXJ0aWNlcztcclxuICAgIHZhciBlbmR5cyA9IHRoaXMuc3BhY2VGaWVsZC5nZW9tZXRyeS5lbmR5O1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHZlcnRzLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIHZlcnRzW2ldLnkgLT0gNDtcclxuICAgICAgaWYgKHZlcnRzW2ldLnkgPCAtZW5keXNbaV0pIHtcclxuICAgICAgICB2ZXJ0c1tpXS55ID0gZW5keXNbaV07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMuc3BhY2VGaWVsZC5nZW9tZXRyeS52ZXJ0aWNlc05lZWRVcGRhdGUgPSB0cnVlO1xyXG4gICAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g44K/44Kk44OI44Or6KGo56S6XHJcbipzaG93VGl0bGUodGFza0luZGV4KSB7XHJcbiB3aGlsZSh0cnVlKXtcclxuICBzZmcuZ2FtZVRpbWVyLnVwZGF0ZSgpO1xyXG5cclxuICBpZiAodGhpcy5iYXNpY0lucHV0LmtleUNoZWNrLnopIHtcclxuICAgIHRoaXMuc2NlbmUucmVtb3ZlKHRoaXMudGl0bGUpO1xyXG4gICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuaW5pdEhhbmRsZU5hbWUuYmluZCh0aGlzKSk7XHJcbiAgfVxyXG4gIGlmICh0aGlzLnNob3dUaXRsZS5lbmRUaW1lIDwgc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSkge1xyXG4gICAgdGhpcy5zY2VuZS5yZW1vdmUodGhpcy50aXRsZSk7XHJcbiAgICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5pbml0VG9wMTAuYmluZCh0aGlzKSk7XHJcbiAgfVxyXG4gIHlpZWxkO1xyXG4gfVxyXG59XHJcblxyXG4vLy8g44OP44Oz44OJ44Or44ON44O844Og44Gu44Ko44Oz44OI44Oq5YmN5Yid5pyf5YyWXHJcbippbml0SGFuZGxlTmFtZSh0YXNrSW5kZXgpIHtcclxuICBsZXQgZW5kID0gZmFsc2U7XHJcbiAgaWYgKHRoaXMuZWRpdEhhbmRsZU5hbWUpe1xyXG4gICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuZ2FtZUluaXQuYmluZCh0aGlzKSk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHRoaXMuZWRpdEhhbmRsZU5hbWUgPSB0aGlzLmhhbmRsZU5hbWUgfHwgJyc7XHJcbiAgICB0aGlzLnRleHRQbGFuZS5jbHMoKTtcclxuICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDQsIDE4LCAnSW5wdXQgeW91ciBoYW5kbGUgbmFtZS4nKTtcclxuICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDgsIDE5LCAnKE1heCA4IENoYXIpJyk7XHJcbiAgICB0aGlzLnRleHRQbGFuZS5wcmludCgxMCwgMjEsIHRoaXMuZWRpdEhhbmRsZU5hbWUpO1xyXG4gICAgLy8gICAgdGV4dFBsYW5lLnByaW50KDEwLCAyMSwgaGFuZGxlTmFtZVswXSwgVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgICB0aGlzLmJhc2ljSW5wdXQudW5iaW5kKCk7XHJcbiAgICB2YXIgZWxtID0gZDMuc2VsZWN0KCcjY29udGVudCcpLmFwcGVuZCgnaW5wdXQnKTtcclxuICAgIGxldCB0aGlzXyA9IHRoaXM7XHJcbiAgICBlbG1cclxuICAgICAgLmF0dHIoJ3R5cGUnLCAndGV4dCcpXHJcbiAgICAgIC5hdHRyKCdwYXR0ZXJuJywgJ1thLXpBLVowLTlfXFxAXFwjXFwkXFwtXXswLDh9JylcclxuICAgICAgLmF0dHIoJ21heGxlbmd0aCcsIDgpXHJcbiAgICAgIC5hdHRyKCdpZCcsICdpbnB1dC1hcmVhJylcclxuICAgICAgLmF0dHIoJ3ZhbHVlJywgdGhpc18uZWRpdEhhbmRsZU5hbWUpXHJcbiAgICAgIC5jYWxsKGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgZC5ub2RlKCkuc2VsZWN0aW9uU3RhcnQgPSB0aGlzXy5lZGl0SGFuZGxlTmFtZS5sZW5ndGg7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5vbignYmx1cicsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBkMy5ldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIGQzLmV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkgeyB0aGlzLmZvY3VzKCk7IH0sIDEwKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5vbigna2V5dXAnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoZDMuZXZlbnQua2V5Q29kZSA9PSAxMykge1xyXG4gICAgICAgICAgdGhpc18uZWRpdEhhbmRsZU5hbWUgPSB0aGlzLnZhbHVlO1xyXG4gICAgICAgICAgbGV0IHMgPSB0aGlzLnNlbGVjdGlvblN0YXJ0O1xyXG4gICAgICAgICAgbGV0IGUgPSB0aGlzLnNlbGVjdGlvbkVuZDtcclxuICAgICAgICAgIHRoaXNfLnRleHRQbGFuZS5wcmludCgxMCwgMjEsIHRoaXNfLmVkaXRIYW5kbGVOYW1lKTtcclxuICAgICAgICAgIHRoaXNfLnRleHRQbGFuZS5wcmludCgxMCArIHMsIDIxLCAnXycsIG5ldyB0ZXh0LlRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLm9uKCdrZXl1cCcsIG51bGwpO1xyXG4gICAgICAgICAgdGhpc18uYmFzaWNJbnB1dC5iaW5kKCk7XHJcbiAgICAgICAgICAvLyDjgZPjga7jgr/jgrnjgq/jgpLntYLjgo/jgonjgZvjgotcclxuICAgICAgICAgIHRoaXNfLnRhc2tzLmFycmF5W3Rhc2tJbmRleF0uZ2VuSW5zdC5uZXh0KC0odGFza0luZGV4ICsgMSkpO1xyXG4gICAgICAgICAgLy8g5qyh44Gu44K/44K544Kv44KS6Kit5a6a44GZ44KLXHJcbiAgICAgICAgICB0aGlzXy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXNfLmdhbWVJbml0LmJpbmQodGhpc18pKTtcclxuICAgICAgICAgIHRoaXNfLnN0b3JhZ2Uuc2V0SXRlbSgnaGFuZGxlTmFtZScsIHRoaXNfLmVkaXRIYW5kbGVOYW1lKTtcclxuICAgICAgICAgIGQzLnNlbGVjdCgnI2lucHV0LWFyZWEnKS5yZW1vdmUoKTtcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpc18uZWRpdEhhbmRsZU5hbWUgPSB0aGlzLnZhbHVlO1xyXG4gICAgICAgIGxldCBzID0gdGhpcy5zZWxlY3Rpb25TdGFydDtcclxuICAgICAgICB0aGlzXy50ZXh0UGxhbmUucHJpbnQoMTAsIDIxLCAnICAgICAgICAgICAnKTtcclxuICAgICAgICB0aGlzXy50ZXh0UGxhbmUucHJpbnQoMTAsIDIxLCB0aGlzXy5lZGl0SGFuZGxlTmFtZSk7XHJcbiAgICAgICAgdGhpc18udGV4dFBsYW5lLnByaW50KDEwICsgcywgMjEsICdfJywgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5ub2RlKCkuZm9jdXMoKTtcclxuXHJcbiAgICB3aGlsZSh0YXNrSW5kZXggPj0gMClcclxuICAgIHtcclxuICAgICAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgICB9XHJcbiAgICB0YXNrSW5kZXggPSAtKCsrdGFza0luZGV4KTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDjgrnjgrPjgqLliqDnrpdcclxuYWRkU2NvcmUocykge1xyXG4gIHRoaXMuc2NvcmUgKz0gcztcclxuICBpZiAodGhpcy5zY29yZSA+IHRoaXMuaGlnaFNjb3JlKSB7XHJcbiAgICB0aGlzLmhpZ2hTY29yZSA9IHRoaXMuc2NvcmU7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g44K544Kz44Ki6KGo56S6XHJcbnByaW50U2NvcmUoKSB7XHJcbiAgdmFyIHMgPSAoJzAwMDAwMDAwJyArIHRoaXMuc2NvcmUudG9TdHJpbmcoKSkuc2xpY2UoLTgpO1xyXG4gIHRoaXMudGV4dFBsYW5lLnByaW50KDEsIDEsIHMpO1xyXG5cclxuICB2YXIgaCA9ICgnMDAwMDAwMDAnICsgdGhpcy5oaWdoU2NvcmUudG9TdHJpbmcoKSkuc2xpY2UoLTgpO1xyXG4gIHRoaXMudGV4dFBsYW5lLnByaW50KDEyLCAxLCBoKTtcclxuXHJcbn1cclxuXHJcbi8vLyDjgrXjgqbjg7Pjg4njgqjjg5Xjgqfjgq/jg4hcclxuc2UoaW5kZXgpIHtcclxuICB0aGlzLnNlcXVlbmNlci5wbGF5VHJhY2tzKHRoaXMuc291bmRFZmZlY3RzLnNvdW5kRWZmZWN0c1tpbmRleF0pO1xyXG59XHJcblxyXG4vLy8g44Ky44O844Og44Gu5Yid5pyf5YyWXHJcbipnYW1lSW5pdCh0YXNrSW5kZXgpIHtcclxuXHJcbiAgdGFza0luZGV4ID0geWllbGQ7XHJcblxyXG4gIC8vIOOCquODvOODh+OCo+OCquOBrumWi+Wni1xyXG4gIHRoaXMuYXVkaW9fLnN0YXJ0KCk7XHJcbiAgdGhpcy5zZXF1ZW5jZXIubG9hZChhdWRpby5zZXFEYXRhKTtcclxuICB0aGlzLnNlcXVlbmNlci5zdGFydCgpO1xyXG4gIHNmZy5zdGFnZS5yZXNldCgpO1xyXG4gIHRoaXMudGV4dFBsYW5lLmNscygpO1xyXG4gIHRoaXMuZW5lbWllcy5yZXNldCgpO1xyXG5cclxuICAvLyDoh6rmqZ/jga7liJ3mnJ/ljJZcclxuICB0aGlzLm15c2hpcF8gPSBuZXcgbXlzaGlwLk15U2hpcCgwLCAtMTAwLCAwLjEsIHRoaXMuc2NlbmUsIHRoaXMuc2UuYmluZCh0aGlzKSk7XHJcbiAgc2ZnLm15c2hpcF8gPSB0aGlzLm15c2hpcF87XHJcbiAgc2ZnLmdhbWVUaW1lci5zdGFydCgpO1xyXG4gIHRoaXMuc2NvcmUgPSAwO1xyXG4gIHRoaXMudGV4dFBsYW5lLnByaW50KDIsIDAsICdTY29yZSAgICBIaWdoIFNjb3JlJyk7XHJcbiAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMjAsIDM5LCAnUmVzdDogICAnICsgc2ZnLm15c2hpcF8ucmVzdCk7XHJcbiAgdGhpcy5wcmludFNjb3JlKCk7XHJcbiAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuc3RhZ2VJbml0LmJpbmQodGhpcykvKmdhbWVBY3Rpb24qLyk7XHJcbn1cclxuXHJcbi8vLyDjgrnjg4bjg7zjgrjjga7liJ3mnJ/ljJZcclxuKnN0YWdlSW5pdCh0YXNrSW5kZXgpIHtcclxuICBcclxuICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICBcclxuICB0aGlzLnRleHRQbGFuZS5wcmludCgwLCAzOSwgJ1N0YWdlOicgKyBzZmcuc3RhZ2Uubm8pO1xyXG4gIHNmZy5nYW1lVGltZXIuc3RhcnQoKTtcclxuICB0aGlzLmVuZW1pZXMucmVzZXQoKTtcclxuICB0aGlzLmVuZW1pZXMuc3RhcnQoKTtcclxuICB0aGlzLmVuZW1pZXMuY2FsY0VuZW1pZXNDb3VudChzZmcuc3RhZ2UucHJpdmF0ZU5vKTtcclxuICB0aGlzLmVuZW1pZXMuaGl0RW5lbWllc0NvdW50ID0gMDtcclxuICB0aGlzLnRleHRQbGFuZS5wcmludCg4LCAxNSwgJ1N0YWdlICcgKyAoc2ZnLnN0YWdlLm5vKSArICcgU3RhcnQgISEnLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5zdGFnZVN0YXJ0LmJpbmQodGhpcykpO1xyXG59XHJcblxyXG4vLy8g44K544OG44O844K46ZaL5aeLXHJcbipzdGFnZVN0YXJ0KHRhc2tJbmRleCkge1xyXG4gIGxldCBlbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDI7XHJcbiAgd2hpbGUodGFza0luZGV4ID49IDAgJiYgZW5kVGltZSA+PSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lKXtcclxuICAgIHNmZy5nYW1lVGltZXIudXBkYXRlKCk7XHJcbiAgICBzZmcubXlzaGlwXy5hY3Rpb24odGhpcy5iYXNpY0lucHV0KTtcclxuICAgIHRhc2tJbmRleCA9IHlpZWxkOyAgICBcclxuICB9XHJcbiAgdGhpcy50ZXh0UGxhbmUucHJpbnQoOCwgMTUsICcgICAgICAgICAgICAgICAgICAnLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5nYW1lQWN0aW9uLmJpbmQodGhpcyksIDUwMDApO1xyXG4gIHRoaXMuc3RhdHVzID0gdGhpcy5TVEFUVVMuSU5HQU1FO1xyXG59XHJcblxyXG4vLy8g44Ky44O844Og5LitXHJcbipnYW1lQWN0aW9uKHRhc2tJbmRleCkge1xyXG4gIHdoaWxlICh0YXNrSW5kZXggPj0gMCl7XHJcbiAgICB0aGlzLnByaW50U2NvcmUoKTtcclxuICAgIHNmZy5teXNoaXBfLmFjdGlvbih0aGlzLmJhc2ljSW5wdXQpO1xyXG4gICAgc2ZnLmdhbWVUaW1lci51cGRhdGUoKTtcclxuICAgIC8vY29uc29sZS5sb2coc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSk7XHJcbiAgICB0aGlzLmVuZW1pZXMubW92ZSgpO1xyXG5cclxuICAgIGlmICghdGhpcy5wcm9jZXNzQ29sbGlzaW9uKCkpIHtcclxuICAgICAgLy8g6Z2i44Kv44Oq44Ki44OB44Kn44OD44KvXHJcbiAgICAgIGlmICh0aGlzLmVuZW1pZXMuaGl0RW5lbWllc0NvdW50ID09IHRoaXMuZW5lbWllcy50b3RhbEVuZW1pZXNDb3VudCkge1xyXG4gICAgICAgIHRoaXMucHJpbnRTY29yZSgpO1xyXG4gICAgICAgIHRoaXMuc3RhZ2UuYWR2YW5jZSgpO1xyXG4gICAgICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLnN0YWdlSW5pdC5iaW5kKHRoaXMpKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMubXlTaGlwQm9tYi5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDM7XHJcbiAgICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLm15U2hpcEJvbWIuYmluZCh0aGlzKSk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH07XHJcbiAgICB0YXNrSW5kZXggPSB5aWVsZDsgXHJcbiAgfVxyXG59XHJcblxyXG4vLy8g5b2T44Gf44KK5Yik5a6aXHJcbnByb2Nlc3NDb2xsaXNpb24odGFza0luZGV4KSB7XHJcbiAgLy/jgIDoh6rmqZ/lvL7jgajmlbXjgajjga7jgYLjgZ/jgorliKTlrppcclxuICBsZXQgbXlCdWxsZXRzID0gc2ZnLm15c2hpcF8ubXlCdWxsZXRzO1xyXG4gIHRoaXMuZW5zID0gdGhpcy5lbmVtaWVzLmVuZW1pZXM7XHJcbiAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IG15QnVsbGV0cy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgbGV0IG15YiA9IG15QnVsbGV0c1tpXTtcclxuICAgIGlmIChteWIuZW5hYmxlXykge1xyXG4gICAgICB2YXIgbXliY28gPSBteUJ1bGxldHNbaV0uY29sbGlzaW9uQXJlYTtcclxuICAgICAgdmFyIGxlZnQgPSBteWJjby5sZWZ0ICsgbXliLng7XHJcbiAgICAgIHZhciByaWdodCA9IG15YmNvLnJpZ2h0ICsgbXliLng7XHJcbiAgICAgIHZhciB0b3AgPSBteWJjby50b3AgKyBteWIueTtcclxuICAgICAgdmFyIGJvdHRvbSA9IG15YmNvLmJvdHRvbSAtIG15Yi5zcGVlZCArIG15Yi55O1xyXG4gICAgICBmb3IgKHZhciBqID0gMCwgZW5kaiA9IHRoaXMuZW5zLmxlbmd0aDsgaiA8IGVuZGo7ICsraikge1xyXG4gICAgICAgIHZhciBlbiA9IHRoaXMuZW5zW2pdO1xyXG4gICAgICAgIGlmIChlbi5lbmFibGVfKSB7XHJcbiAgICAgICAgICB2YXIgZW5jbyA9IGVuLmNvbGxpc2lvbkFyZWE7XHJcbiAgICAgICAgICBpZiAodG9wID4gKGVuLnkgKyBlbmNvLmJvdHRvbSkgJiZcclxuICAgICAgICAgICAgKGVuLnkgKyBlbmNvLnRvcCkgPiBib3R0b20gJiZcclxuICAgICAgICAgICAgbGVmdCA8IChlbi54ICsgZW5jby5yaWdodCkgJiZcclxuICAgICAgICAgICAgKGVuLnggKyBlbmNvLmxlZnQpIDwgcmlnaHRcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIGVuLmhpdChteWIpO1xyXG4gICAgICAgICAgICBpZiAobXliLnBvd2VyIDw9IDApIHtcclxuICAgICAgICAgICAgICBteWIuZW5hYmxlXyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8g5pW144Go6Ieq5qmf44Go44Gu44GC44Gf44KK5Yik5a6aXHJcbiAgaWYgKHNmZy5DSEVDS19DT0xMSVNJT04pIHtcclxuICAgIGxldCBteWNvID0gc2ZnLm15c2hpcF8uY29sbGlzaW9uQXJlYTtcclxuICAgIGxldCBsZWZ0ID0gc2ZnLm15c2hpcF8ueCArIG15Y28ubGVmdDtcclxuICAgIGxldCByaWdodCA9IG15Y28ucmlnaHQgKyBzZmcubXlzaGlwXy54O1xyXG4gICAgbGV0IHRvcCA9IG15Y28udG9wICsgc2ZnLm15c2hpcF8ueTtcclxuICAgIGxldCBib3R0b20gPSBteWNvLmJvdHRvbSArIHNmZy5teXNoaXBfLnk7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHRoaXMuZW5zLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIGxldCBlbiA9IHRoaXMuZW5zW2ldO1xyXG4gICAgICBpZiAoZW4uZW5hYmxlXykge1xyXG4gICAgICAgIGxldCBlbmNvID0gZW4uY29sbGlzaW9uQXJlYTtcclxuICAgICAgICBpZiAodG9wID4gKGVuLnkgKyBlbmNvLmJvdHRvbSkgJiZcclxuICAgICAgICAgIChlbi55ICsgZW5jby50b3ApID4gYm90dG9tICYmXHJcbiAgICAgICAgICBsZWZ0IDwgKGVuLnggKyBlbmNvLnJpZ2h0KSAmJlxyXG4gICAgICAgICAgKGVuLnggKyBlbmNvLmxlZnQpIDwgcmlnaHRcclxuICAgICAgICAgICkge1xyXG4gICAgICAgICAgZW4uaGl0KG15c2hpcCk7XHJcbiAgICAgICAgICBzZmcubXlzaGlwXy5oaXQoKTtcclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8g5pW15by+44Go6Ieq5qmf44Go44Gu44GC44Gf44KK5Yik5a6aXHJcbiAgICB0aGlzLmVuYnMgPSB0aGlzLmVuZW15QnVsbGV0cy5lbmVteUJ1bGxldHM7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gdGhpcy5lbmJzLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIGxldCBlbiA9IHRoaXMuZW5ic1tpXTtcclxuICAgICAgaWYgKGVuLmVuYWJsZSkge1xyXG4gICAgICAgIGxldCBlbmNvID0gZW4uY29sbGlzaW9uQXJlYTtcclxuICAgICAgICBpZiAodG9wID4gKGVuLnkgKyBlbmNvLmJvdHRvbSkgJiZcclxuICAgICAgICAgIChlbi55ICsgZW5jby50b3ApID4gYm90dG9tICYmXHJcbiAgICAgICAgICBsZWZ0IDwgKGVuLnggKyBlbmNvLnJpZ2h0KSAmJlxyXG4gICAgICAgICAgKGVuLnggKyBlbmNvLmxlZnQpIDwgcmlnaHRcclxuICAgICAgICAgICkge1xyXG4gICAgICAgICAgZW4uaGl0KCk7XHJcbiAgICAgICAgICBzZmcubXlzaGlwXy5oaXQoKTtcclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICB9XHJcbiAgcmV0dXJuIGZhbHNlO1xyXG59XHJcblxyXG4vLy8g6Ieq5qmf54iG55m6IFxyXG4qbXlTaGlwQm9tYih0YXNrSW5kZXgpIHtcclxuICB3aGlsZShzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lIDw9IHRoaXMubXlTaGlwQm9tYi5lbmRUaW1lICYmIHRhc2tJbmRleCA+PSAwKXtcclxuICAgIHRoaXMuZW5lbWllcy5tb3ZlKCk7XHJcbiAgICBzZmcuZ2FtZVRpbWVyLnVwZGF0ZSgpO1xyXG4gICAgdGFza0luZGV4ID0geWllbGQ7ICBcclxuICB9XHJcbiAgc2ZnLm15c2hpcF8ucmVzdC0tO1xyXG4gIGlmIChzZmcubXlzaGlwXy5yZXN0ID09IDApIHtcclxuICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDEwLCAxOCwgJ0dBTUUgT1ZFUicsIG5ldyB0ZXh0LlRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gICAgdGhpcy5wcmludFNjb3JlKCk7XHJcbiAgICB0aGlzLnRleHRQbGFuZS5wcmludCgyMCwgMzksICdSZXN0OiAgICcgKyBzZmcubXlzaGlwXy5yZXN0KTtcclxuICAgIHRoaXMuY29tbV8uc29ja2V0Lm9uKCdzZW5kUmFuaycsIHRoaXMuY2hlY2tSYW5rSW4pO1xyXG4gICAgdGhpcy5jb21tXy5zZW5kU2NvcmUobmV3IFNjb3JlRW50cnkodGhpcy5lZGl0SGFuZGxlTmFtZSwgdGhpcy5zY29yZSkpO1xyXG4gICAgdGhpcy5nYW1lT3Zlci5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDU7XHJcbiAgICB0aGlzLnJhbmsgPSAtMTtcclxuICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLmdhbWVPdmVyLmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5zZXF1ZW5jZXIuc3RvcCgpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBzZmcubXlzaGlwXy5tZXNoLnZpc2libGUgPSB0cnVlO1xyXG4gICAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMjAsIDM5LCAnUmVzdDogICAnICsgc2ZnLm15c2hpcF8ucmVzdCk7XHJcbiAgICB0aGlzLnRleHRQbGFuZS5wcmludCg4LCAxNSwgJ1N0YWdlICcgKyAoc2ZnLnN0YWdlLm5vKSArICcgU3RhcnQgISEnLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICAgIHRoaXMuc3RhZ2VTdGFydC5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDI7XHJcbiAgICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5zdGFnZVN0YXJ0LmJpbmQodGhpcykpO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOOCsuODvOODoOOCquODvOODkOODvFxyXG4qZ2FtZU92ZXIodGFza0luZGV4KSB7XHJcbiAgd2hpbGUodGhpcy5nYW1lT3Zlci5lbmRUaW1lID49IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgJiYgdGFza0luZGV4ID49IDApXHJcbiAge1xyXG4gICAgc2ZnLmdhbWVUaW1lci51cGRhdGUoKTtcclxuICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gIH1cclxuICBcclxuXHJcbiAgdGhpcy50ZXh0UGxhbmUuY2xzKCk7XHJcbiAgdGhpcy5lbmVtaWVzLnJlc2V0KCk7XHJcbiAgdGhpcy5lbmVteUJ1bGxldHMucmVzZXQoKTtcclxuICBpZiAodGhpcy5yYW5rID49IDApIHtcclxuICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLmluaXRUb3AxMC5iaW5kKHRoaXMpKTtcclxuICB9IGVsc2Uge1xyXG4gICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuaW5pdFRpdGxlLmJpbmQodGhpcykpO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOODqeODs+OCreODs+OCsOOBl+OBn+OBi+OBqeOBhuOBi+OBruODgeOCp+ODg+OCr1xyXG5jaGVja1JhbmtJbihkYXRhKSB7XHJcbiAgdGhpcy5yYW5rID0gZGF0YS5yYW5rO1xyXG59XHJcblxyXG5cclxuLy8vIOODj+OCpOOCueOCs+OCouOCqOODs+ODiOODquOBruihqOekulxyXG5wcmludFRvcDEwKCkge1xyXG4gIHZhciByYW5rbmFtZSA9IFsnIDFzdCcsICcgMm5kJywgJyAzcmQnLCAnIDR0aCcsICcgNXRoJywgJyA2dGgnLCAnIDd0aCcsICcgOHRoJywgJyA5dGgnLCAnMTB0aCddO1xyXG4gIHRoaXMudGV4dFBsYW5lLnByaW50KDgsIDQsICdUb3AgMTAgU2NvcmUnKTtcclxuICB2YXIgeSA9IDg7XHJcbiAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHRoaXMuaGlnaFNjb3Jlcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgdmFyIHNjb3JlU3RyID0gJzAwMDAwMDAwJyArIHRoaXMuaGlnaFNjb3Jlc1tpXS5zY29yZTtcclxuICAgIHNjb3JlU3RyID0gc2NvcmVTdHIuc3Vic3RyKHNjb3JlU3RyLmxlbmd0aCAtIDgsIDgpO1xyXG4gICAgaWYgKHRoaXMucmFuayA9PSBpKSB7XHJcbiAgICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDMsIHksIHJhbmtuYW1lW2ldICsgJyAnICsgc2NvcmVTdHIgKyAnICcgKyB0aGlzLmhpZ2hTY29yZXNbaV0ubmFtZSwgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnRleHRQbGFuZS5wcmludCgzLCB5LCByYW5rbmFtZVtpXSArICcgJyArIHNjb3JlU3RyICsgJyAnICsgdGhpcy5oaWdoU2NvcmVzW2ldLm5hbWUpO1xyXG4gICAgfVxyXG4gICAgeSArPSAyO1xyXG4gIH1cclxufVxyXG5cclxuXHJcbippbml0VG9wMTAodGFza0luZGV4KSB7XHJcbiAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgdGhpcy50ZXh0UGxhbmUuY2xzKCk7XHJcbiAgdGhpcy5wcmludFRvcDEwKCk7XHJcbiAgdGhpcy5zaG93VG9wMTAuZW5kVGltZSA9IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgKyA1O1xyXG4gIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLnNob3dUb3AxMC5iaW5kKHRoaXMpKTtcclxufVxyXG5cclxuKnNob3dUb3AxMCh0YXNrSW5kZXgpIHtcclxuICB3aGlsZSh0aGlzLnNob3dUb3AxMC5lbmRUaW1lID49IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgJiYgdGhpcy5iYXNpY0lucHV0LmtleUJ1ZmZlci5sZW5ndGggPT0gMCAmJiB0YXNrSW5kZXggPj0gMClcclxuICB7XHJcbiAgICBzZmcuZ2FtZVRpbWVyLnVwZGF0ZSgpO1xyXG4gICAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgfSBcclxuICBcclxuICB0aGlzLmJhc2ljSW5wdXQua2V5QnVmZmVyLmxlbmd0aCA9IDA7XHJcbiAgdGhpcy50ZXh0UGxhbmUuY2xzKCk7XHJcbiAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuaW5pdFRpdGxlLmJpbmQodGhpcykpO1xyXG59XHJcbn1cclxuXHJcbkdhbWUucHJvdG90eXBlLlNUQVRVUyA9IHtcclxuICBJTkdBTUU6MVxyXG59O1xyXG5cclxuXHJcblxyXG5cclxuXHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIENvbGxpc2lvbkFyZWEge1xyXG4gIGNvbnN0cnVjdG9yKG9mZnNldFgsIG9mZnNldFksIHdpZHRoLCBoZWlnaHQpXHJcbiAge1xyXG4gICAgdGhpcy5vZmZzZXRYID0gb2Zmc2V0WCB8fCAwO1xyXG4gICAgdGhpcy5vZmZzZXRZID0gb2Zmc2V0WSB8fCAwO1xyXG4gICAgdGhpcy50b3AgPSAwO1xyXG4gICAgdGhpcy5ib3R0b20gPSAwO1xyXG4gICAgdGhpcy5sZWZ0ID0gMDtcclxuICAgIHRoaXMucmlnaHQgPSAwO1xyXG4gICAgdGhpcy53aWR0aCA9IHdpZHRoIHx8IDA7XHJcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodCB8fCAwO1xyXG4gICAgdGhpcy53aWR0aF8gPSAwO1xyXG4gICAgdGhpcy5oZWlnaHRfID0gMDtcclxuICB9XHJcbiAgZ2V0IHdpZHRoKCkgeyByZXR1cm4gdGhpcy53aWR0aF87IH1cclxuICBzZXQgd2lkdGgodikge1xyXG4gICAgdGhpcy53aWR0aF8gPSB2O1xyXG4gICAgdGhpcy5sZWZ0ID0gdGhpcy5vZmZzZXRYIC0gdiAvIDI7XHJcbiAgICB0aGlzLnJpZ2h0ID0gdGhpcy5vZmZzZXRYICsgdiAvIDI7XHJcbiAgfVxyXG4gIGdldCBoZWlnaHQoKSB7IHJldHVybiB0aGlzLmhlaWdodF87IH1cclxuICBzZXQgaGVpZ2h0KHYpIHtcclxuICAgIHRoaXMuaGVpZ2h0XyA9IHY7XHJcbiAgICB0aGlzLnRvcCA9IHRoaXMub2Zmc2V0WSArIHYgLyAyO1xyXG4gICAgdGhpcy5ib3R0b20gPSB0aGlzLm9mZnNldFkgLSB2IC8gMjtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBHYW1lT2JqIHtcclxuICBjb25zdHJ1Y3Rvcih4LCB5LCB6KSB7XHJcbiAgICB0aGlzLnhfID0geCB8fCAwO1xyXG4gICAgdGhpcy55XyA9IHkgfHwgMDtcclxuICAgIHRoaXMuel8gPSB6IHx8IDAuMDtcclxuICAgIHRoaXMuZW5hYmxlXyA9IGZhbHNlO1xyXG4gICAgdGhpcy53aWR0aCA9IDA7XHJcbiAgICB0aGlzLmhlaWdodCA9IDA7XHJcbiAgICB0aGlzLmNvbGxpc2lvbkFyZWEgPSBuZXcgQ29sbGlzaW9uQXJlYSgpO1xyXG4gIH1cclxuICBnZXQgeCgpIHsgcmV0dXJuIHRoaXMueF87IH1cclxuICBzZXQgeCh2KSB7IHRoaXMueF8gPSB2OyB9XHJcbiAgZ2V0IHkoKSB7IHJldHVybiB0aGlzLnlfOyB9XHJcbiAgc2V0IHkodikgeyB0aGlzLnlfID0gdjsgfVxyXG4gIGdldCB6KCkgeyByZXR1cm4gdGhpcy56XzsgfVxyXG4gIHNldCB6KHYpIHsgdGhpcy56XyA9IHY7IH1cclxufVxyXG5cclxuIiwiZXhwb3J0IGNvbnN0IFZJUlRVQUxfV0lEVEggPSAyNDA7XHJcbmV4cG9ydCBjb25zdCBWSVJUVUFMX0hFSUdIVCA9IDMyMDtcclxuXHJcbmV4cG9ydCBjb25zdCBWX1JJR0hUID0gVklSVFVBTF9XSURUSCAvIDIuMDtcclxuZXhwb3J0IGNvbnN0IFZfVE9QID0gVklSVFVBTF9IRUlHSFQgLyAyLjA7XHJcbmV4cG9ydCBjb25zdCBWX0xFRlQgPSAtMSAqIFZJUlRVQUxfV0lEVEggLyAyLjA7XHJcbmV4cG9ydCBjb25zdCBWX0JPVFRPTSA9IC0xICogVklSVFVBTF9IRUlHSFQgLyAyLjA7XHJcblxyXG5leHBvcnQgY29uc3QgQ0hBUl9TSVpFID0gODtcclxuZXhwb3J0IGNvbnN0IFRFWFRfV0lEVEggPSBWSVJUVUFMX1dJRFRIIC8gQ0hBUl9TSVpFO1xyXG5leHBvcnQgY29uc3QgVEVYVF9IRUlHSFQgPSBWSVJUVUFMX0hFSUdIVCAvIENIQVJfU0laRTtcclxuZXhwb3J0IGNvbnN0IFBJWEVMX1NJWkUgPSAxO1xyXG5leHBvcnQgY29uc3QgQUNUVUFMX0NIQVJfU0laRSA9IENIQVJfU0laRSAqIFBJWEVMX1NJWkU7XHJcbmV4cG9ydCBjb25zdCBTUFJJVEVfU0laRV9YID0gMTYuMDtcclxuZXhwb3J0IGNvbnN0IFNQUklURV9TSVpFX1kgPSAxNi4wO1xyXG5leHBvcnQgdmFyIENIRUNLX0NPTExJU0lPTiA9IHRydWU7XHJcbmV4cG9ydCBjb25zdCBERUJVRyA9IGZhbHNlO1xyXG5leHBvcnQgdmFyIHRleHR1cmVGaWxlcyA9IHt9O1xyXG5leHBvcnQgdmFyIHN0YWdlO1xyXG5leHBvcnQgdmFyIHRhc2tzO1xyXG5leHBvcnQgdmFyIGdhbWVUaW1lcjtcclxuZXhwb3J0IHZhciBib21icztcclxuZXhwb3J0IHZhciBhZGRTY29yZTtcclxuZXhwb3J0IHZhciBteXNoaXBfO1xyXG5leHBvcnQgY29uc3QgdGV4dHVyZVJvb3QgPSAnLi9yZXMvJztcclxuZXhwb3J0IHZhciBwYXVzZSA9IGZhbHNlO1xyXG5leHBvcnQgdmFyIGdhbWU7XHJcblxyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmltcG9ydCAqIGFzIGcgZnJvbSAnLi9nbG9iYWwnO1xyXG5cclxuLy8vIOODhuOCr+OCueODgeODo+ODvOOBqOOBl+OBpmNhbnZhc+OCkuS9v+OBhuWgtOWQiOOBruODmOODq+ODkeODvFxyXG5leHBvcnQgZnVuY3Rpb24gQ2FudmFzVGV4dHVyZSh3aWR0aCwgaGVpZ2h0KSB7XHJcbiAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICB0aGlzLmNhbnZhcy53aWR0aCA9IHdpZHRoIHx8IGcuVklSVFVBTF9XSURUSDtcclxuICB0aGlzLmNhbnZhcy5oZWlnaHQgPSBoZWlnaHQgfHwgZy5WSVJUVUFMX0hFSUdIVDtcclxuICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgdGhpcy50ZXh0dXJlID0gbmV3IFRIUkVFLlRleHR1cmUodGhpcy5jYW52YXMpO1xyXG4gIHRoaXMudGV4dHVyZS5tYWdGaWx0ZXIgPSBUSFJFRS5OZWFyZXN0RmlsdGVyO1xyXG4gIHRoaXMudGV4dHVyZS5taW5GaWx0ZXIgPSBUSFJFRS5MaW5lYXJNaXBNYXBMaW5lYXJGaWx0ZXI7XHJcbiAgdGhpcy5tYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7IG1hcDogdGhpcy50ZXh0dXJlLCB0cmFuc3BhcmVudDogdHJ1ZSB9KTtcclxuICB0aGlzLmdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkodGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcbiAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2godGhpcy5nZW9tZXRyeSwgdGhpcy5tYXRlcmlhbCk7XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnogPSAwLjAwMTtcclxuICAvLyDjgrnjg6Djg7zjgrjjg7PjgrDjgpLliIfjgotcclxuICB0aGlzLmN0eC5tc0ltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIHRoaXMuY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIC8vdGhpcy5jdHgud2Via2l0SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgdGhpcy5jdHgubW96SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbn1cclxuXHJcbi8vLyDjg5fjg63jgrDjg6zjgrnjg5Djg7zooajnpLrjgq/jg6njgrlcclxuZXhwb3J0IGZ1bmN0aW9uIFByb2dyZXNzKCkge1xyXG4gIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7O1xyXG4gIHZhciB3aWR0aCA9IDE7XHJcbiAgd2hpbGUgKHdpZHRoIDw9IGcuVklSVFVBTF9XSURUSCl7XHJcbiAgICB3aWR0aCAqPSAyO1xyXG4gIH1cclxuICB2YXIgaGVpZ2h0ID0gMTtcclxuICB3aGlsZSAoaGVpZ2h0IDw9IGcuVklSVFVBTF9IRUlHSFQpe1xyXG4gICAgaGVpZ2h0ICo9IDI7XHJcbiAgfVxyXG4gIHRoaXMuY2FudmFzLndpZHRoID0gd2lkdGg7XHJcbiAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG4gIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICB0aGlzLnRleHR1cmUgPSBuZXcgVEhSRUUuVGV4dHVyZSh0aGlzLmNhbnZhcyk7XHJcbiAgdGhpcy50ZXh0dXJlLm1hZ0ZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XHJcbiAgdGhpcy50ZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLkxpbmVhck1pcE1hcExpbmVhckZpbHRlcjtcclxuICAvLyDjgrnjg6Djg7zjgrjjg7PjgrDjgpLliIfjgotcclxuICB0aGlzLmN0eC5tc0ltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIHRoaXMuY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIC8vdGhpcy5jdHgud2Via2l0SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgdGhpcy5jdHgubW96SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcblxyXG4gIHRoaXMubWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBtYXA6IHRoaXMudGV4dHVyZSwgdHJhbnNwYXJlbnQ6IHRydWUgfSk7XHJcbiAgdGhpcy5nZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG4gIHRoaXMubWVzaCA9IG5ldyBUSFJFRS5NZXNoKHRoaXMuZ2VvbWV0cnksIHRoaXMubWF0ZXJpYWwpO1xyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi54ID0gKHdpZHRoIC0gZy5WSVJUVUFMX1dJRFRIKSAvIDI7XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnkgPSAgLSAoaGVpZ2h0IC0gZy5WSVJUVUFMX0hFSUdIVCkgLyAyO1xyXG5cclxuICAvL3RoaXMudGV4dHVyZS5wcmVtdWx0aXBseUFscGhhID0gdHJ1ZTtcclxufVxyXG5cclxuLy8vIOODl+ODreOCsOODrOOCueODkOODvOOCkuihqOekuuOBmeOCi+OAglxyXG5Qcm9ncmVzcy5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gKG1lc3NhZ2UsIHBlcmNlbnQpIHtcclxuICB2YXIgY3R4ID0gdGhpcy5jdHg7XHJcbiAgdmFyIHdpZHRoID0gdGhpcy5jYW52YXMud2lkdGgsIGhlaWdodCA9IHRoaXMuY2FudmFzLmhlaWdodDtcclxuICAvLyAgICAgIGN0eC5maWxsU3R5bGUgPSAncmdiYSgwLDAsMCwwKSc7XHJcbiAgY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuICB2YXIgdGV4dFdpZHRoID0gY3R4Lm1lYXN1cmVUZXh0KG1lc3NhZ2UpLndpZHRoO1xyXG4gIGN0eC5zdHJva2VTdHlsZSA9IGN0eC5maWxsU3R5bGUgPSAncmdiYSgyNTUsMjU1LDI1NSwxLjApJztcclxuXHJcbiAgY3R4LmZpbGxUZXh0KG1lc3NhZ2UsICh3aWR0aCAtIHRleHRXaWR0aCkgLyAyLCAxMDApO1xyXG4gIGN0eC5iZWdpblBhdGgoKTtcclxuICBjdHgucmVjdCgyMCwgNzUsIHdpZHRoIC0gMjAgKiAyLCAxMCk7XHJcbiAgY3R4LnN0cm9rZSgpO1xyXG4gIGN0eC5maWxsUmVjdCgyMCwgNzUsICh3aWR0aCAtIDIwICogMikgKiBwZXJjZW50IC8gMTAwLCAxMCk7XHJcbiAgdGhpcy50ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxufVxyXG5cclxuLy8vIGltZ+OBi+OCieOCuOOCquODoeODiOODquOCkuS9nOaIkOOBmeOCi1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlR2VvbWV0cnlGcm9tSW1hZ2UoaW1hZ2UpIHtcclxuICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgdmFyIHcgPSB0ZXh0dXJlRmlsZXMuYXV0aG9yLnRleHR1cmUuaW1hZ2Uud2lkdGg7XHJcbiAgdmFyIGggPSB0ZXh0dXJlRmlsZXMuYXV0aG9yLnRleHR1cmUuaW1hZ2UuaGVpZ2h0O1xyXG4gIGNhbnZhcy53aWR0aCA9IHc7XHJcbiAgY2FudmFzLmhlaWdodCA9IGg7XHJcbiAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gIGN0eC5kcmF3SW1hZ2UoaW1hZ2UsIDAsIDApO1xyXG4gIHZhciBkYXRhID0gY3R4LmdldEltYWdlRGF0YSgwLCAwLCB3LCBoKTtcclxuICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTtcclxuICB7XHJcbiAgICB2YXIgaSA9IDA7XHJcblxyXG4gICAgZm9yICh2YXIgeSA9IDA7IHkgPCBoOyArK3kpIHtcclxuICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB3OyArK3gpIHtcclxuICAgICAgICB2YXIgY29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoKTtcclxuXHJcbiAgICAgICAgdmFyIHIgPSBkYXRhLmRhdGFbaSsrXTtcclxuICAgICAgICB2YXIgZyA9IGRhdGEuZGF0YVtpKytdO1xyXG4gICAgICAgIHZhciBiID0gZGF0YS5kYXRhW2krK107XHJcbiAgICAgICAgdmFyIGEgPSBkYXRhLmRhdGFbaSsrXTtcclxuICAgICAgICBpZiAoYSAhPSAwKSB7XHJcbiAgICAgICAgICBjb2xvci5zZXRSR0IociAvIDI1NS4wLCBnIC8gMjU1LjAsIGIgLyAyNTUuMCk7XHJcbiAgICAgICAgICB2YXIgdmVydCA9IG5ldyBUSFJFRS5WZWN0b3IzKCgoeCAtIHcgLyAyLjApKSAqIDIuMCwgKCh5IC0gaCAvIDIpKSAqIC0yLjAsIDAuMCk7XHJcbiAgICAgICAgICBnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKHZlcnQpO1xyXG4gICAgICAgICAgZ2VvbWV0cnkuY29sb3JzLnB1c2goY29sb3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNwcml0ZUdlb21ldHJ5KHNpemUpXHJcbntcclxuICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTtcclxuICB2YXIgc2l6ZUhhbGYgPSBzaXplIC8gMjtcclxuICAvLyBnZW9tZXRyeS5cclxuICBnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKG5ldyBUSFJFRS5WZWN0b3IzKC1zaXplSGFsZiwgc2l6ZUhhbGYsIDApKTtcclxuICBnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKG5ldyBUSFJFRS5WZWN0b3IzKHNpemVIYWxmLCBzaXplSGFsZiwgMCkpO1xyXG4gIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2gobmV3IFRIUkVFLlZlY3RvcjMoc2l6ZUhhbGYsIC1zaXplSGFsZiwgMCkpO1xyXG4gIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2gobmV3IFRIUkVFLlZlY3RvcjMoLXNpemVIYWxmLCAtc2l6ZUhhbGYsIDApKTtcclxuICBnZW9tZXRyeS5mYWNlcy5wdXNoKG5ldyBUSFJFRS5GYWNlMygwLCAyLCAxKSk7XHJcbiAgZ2VvbWV0cnkuZmFjZXMucHVzaChuZXcgVEhSRUUuRmFjZTMoMCwgMywgMikpO1xyXG4gIHJldHVybiBnZW9tZXRyeTtcclxufVxyXG5cclxuLy8vIOODhuOCr+OCueODgeODo+ODvOS4iuOBruaMh+WumuOCueODl+ODqeOCpOODiOOBrlVW5bqn5qiZ44KS5rGC44KB44KLXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTcHJpdGVVVihnZW9tZXRyeSwgdGV4dHVyZSwgY2VsbFdpZHRoLCBjZWxsSGVpZ2h0LCBjZWxsTm8pXHJcbntcclxuICB2YXIgd2lkdGggPSB0ZXh0dXJlLmltYWdlLndpZHRoO1xyXG4gIHZhciBoZWlnaHQgPSB0ZXh0dXJlLmltYWdlLmhlaWdodDtcclxuXHJcbiAgdmFyIHVDZWxsQ291bnQgPSAod2lkdGggLyBjZWxsV2lkdGgpIHwgMDtcclxuICB2YXIgdkNlbGxDb3VudCA9IChoZWlnaHQgLyBjZWxsSGVpZ2h0KSB8IDA7XHJcbiAgdmFyIHZQb3MgPSB2Q2VsbENvdW50IC0gKChjZWxsTm8gLyB1Q2VsbENvdW50KSB8IDApO1xyXG4gIHZhciB1UG9zID0gY2VsbE5vICUgdUNlbGxDb3VudDtcclxuICB2YXIgdVVuaXQgPSBjZWxsV2lkdGggLyB3aWR0aDsgXHJcbiAgdmFyIHZVbml0ID0gY2VsbEhlaWdodCAvIGhlaWdodDtcclxuXHJcbiAgZ2VvbWV0cnkuZmFjZVZlcnRleFV2c1swXS5wdXNoKFtcclxuICAgIG5ldyBUSFJFRS5WZWN0b3IyKCh1UG9zKSAqIGNlbGxXaWR0aCAvIHdpZHRoLCAodlBvcykgKiBjZWxsSGVpZ2h0IC8gaGVpZ2h0KSxcclxuICAgIG5ldyBUSFJFRS5WZWN0b3IyKCh1UG9zICsgMSkgKiBjZWxsV2lkdGggLyB3aWR0aCwgKHZQb3MgLSAxKSAqIGNlbGxIZWlnaHQgLyBoZWlnaHQpLFxyXG4gICAgbmV3IFRIUkVFLlZlY3RvcjIoKHVQb3MgKyAxKSAqIGNlbGxXaWR0aCAvIHdpZHRoLCAodlBvcykgKiBjZWxsSGVpZ2h0IC8gaGVpZ2h0KVxyXG4gIF0pO1xyXG4gIGdlb21ldHJ5LmZhY2VWZXJ0ZXhVdnNbMF0ucHVzaChbXHJcbiAgICBuZXcgVEhSRUUuVmVjdG9yMigodVBvcykgKiBjZWxsV2lkdGggLyB3aWR0aCwgKHZQb3MpICogY2VsbEhlaWdodCAvIGhlaWdodCksXHJcbiAgICBuZXcgVEhSRUUuVmVjdG9yMigodVBvcykgKiBjZWxsV2lkdGggLyB3aWR0aCwgKHZQb3MgLSAxKSAqIGNlbGxIZWlnaHQgLyBoZWlnaHQpLFxyXG4gICAgbmV3IFRIUkVFLlZlY3RvcjIoKHVQb3MgKyAxKSAqIGNlbGxXaWR0aCAvIHdpZHRoLCAodlBvcyAtIDEpICogY2VsbEhlaWdodCAvIGhlaWdodClcclxuICBdKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZVNwcml0ZVVWKGdlb21ldHJ5LCB0ZXh0dXJlLCBjZWxsV2lkdGgsIGNlbGxIZWlnaHQsIGNlbGxObylcclxue1xyXG4gIHZhciB3aWR0aCA9IHRleHR1cmUuaW1hZ2Uud2lkdGg7XHJcbiAgdmFyIGhlaWdodCA9IHRleHR1cmUuaW1hZ2UuaGVpZ2h0O1xyXG5cclxuICB2YXIgdUNlbGxDb3VudCA9ICh3aWR0aCAvIGNlbGxXaWR0aCkgfCAwO1xyXG4gIHZhciB2Q2VsbENvdW50ID0gKGhlaWdodCAvIGNlbGxIZWlnaHQpIHwgMDtcclxuICB2YXIgdlBvcyA9IHZDZWxsQ291bnQgLSAoKGNlbGxObyAvIHVDZWxsQ291bnQpIHwgMCk7XHJcbiAgdmFyIHVQb3MgPSBjZWxsTm8gJSB1Q2VsbENvdW50O1xyXG4gIHZhciB1VW5pdCA9IGNlbGxXaWR0aCAvIHdpZHRoO1xyXG4gIHZhciB2VW5pdCA9IGNlbGxIZWlnaHQgLyBoZWlnaHQ7XHJcbiAgdmFyIHV2cyA9IGdlb21ldHJ5LmZhY2VWZXJ0ZXhVdnNbMF1bMF07XHJcblxyXG4gIHV2c1swXS54ID0gKHVQb3MpICogdVVuaXQ7XHJcbiAgdXZzWzBdLnkgPSAodlBvcykgKiB2VW5pdDtcclxuICB1dnNbMV0ueCA9ICh1UG9zICsgMSkgKiB1VW5pdDtcclxuICB1dnNbMV0ueSA9ICh2UG9zIC0gMSkgKiB2VW5pdDtcclxuICB1dnNbMl0ueCA9ICh1UG9zICsgMSkgKiB1VW5pdDtcclxuICB1dnNbMl0ueSA9ICh2UG9zKSAqIHZVbml0O1xyXG5cclxuICB1dnMgPSBnZW9tZXRyeS5mYWNlVmVydGV4VXZzWzBdWzFdO1xyXG5cclxuICB1dnNbMF0ueCA9ICh1UG9zKSAqIHVVbml0O1xyXG4gIHV2c1swXS55ID0gKHZQb3MpICogdlVuaXQ7XHJcbiAgdXZzWzFdLnggPSAodVBvcykgKiB1VW5pdDtcclxuICB1dnNbMV0ueSA9ICh2UG9zIC0gMSkgKiB2VW5pdDtcclxuICB1dnNbMl0ueCA9ICh1UG9zICsgMSkgKiB1VW5pdDtcclxuICB1dnNbMl0ueSA9ICh2UG9zIC0gMSkgKiB2VW5pdDtcclxuXHJcbiBcclxuICBnZW9tZXRyeS51dnNOZWVkVXBkYXRlID0gdHJ1ZTtcclxuXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTcHJpdGVNYXRlcmlhbCh0ZXh0dXJlKVxyXG57XHJcbiAgLy8g44Oh44OD44K344Ol44Gu5L2c5oiQ44O76KGo56S6IC8vL1xyXG4gIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7IG1hcDogdGV4dHVyZSAvKixkZXB0aFRlc3Q6dHJ1ZSovLCB0cmFuc3BhcmVudDogdHJ1ZSB9KTtcclxuICBtYXRlcmlhbC5zaGFkaW5nID0gVEhSRUUuRmxhdFNoYWRpbmc7XHJcbiAgbWF0ZXJpYWwuc2lkZSA9IFRIUkVFLkZyb250U2lkZTtcclxuICBtYXRlcmlhbC5hbHBoYVRlc3QgPSAwLjU7XHJcbiAgbWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4vLyAgbWF0ZXJpYWwuXHJcbiAgcmV0dXJuIG1hdGVyaWFsO1xyXG59XHJcblxyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmltcG9ydCAqIGFzIHNmZyBmcm9tICcuL2dsb2JhbCc7IFxyXG5cclxuLy8g44Kt44O85YWl5YqbXHJcbmV4cG9ydCBmdW5jdGlvbiBCYXNpY0lucHV0KCkge1xyXG4gIHRoaXMua2V5Q2hlY2sgPSB7IHVwOiBmYWxzZSwgZG93bjogZmFsc2UsIGxlZnQ6IGZhbHNlLCByaWdodDogZmFsc2UsIHo6IGZhbHNlICx4OmZhbHNlfTtcclxuICB0aGlzLmtleUJ1ZmZlciA9IFtdO1xyXG4gIHRoaXMua2V5dXBfID0gbnVsbDtcclxuICB0aGlzLmtleWRvd25fID0gbnVsbDtcclxufVxyXG5cclxuQmFzaWNJbnB1dC5wcm90b3R5cGUgPSB7XHJcbiAgY2xlYXI6IGZ1bmN0aW9uKClcclxuICB7XHJcbiAgICBmb3IodmFyIGQgaW4gdGhpcy5rZXlDaGVjayl7XHJcbiAgICAgIHRoaXMua2V5Q2hlY2tbZF0gPSBmYWxzZTtcclxuICAgIH1cclxuICAgIHRoaXMua2V5QnVmZmVyLmxlbmd0aCA9IDA7XHJcbiAgfSxcclxuICBrZXlkb3duOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgdmFyIGUgPSBkMy5ldmVudDtcclxuICAgIHZhciBrZXlCdWZmZXIgPSB0aGlzLmtleUJ1ZmZlcjtcclxuICAgIHZhciBrZXlDaGVjayA9IHRoaXMua2V5Q2hlY2s7XHJcbiAgICB2YXIgaGFuZGxlID0gdHJ1ZTtcclxuICAgICBcclxuICAgIGlmIChrZXlCdWZmZXIubGVuZ3RoID4gMTYpIHtcclxuICAgICAga2V5QnVmZmVyLnNoaWZ0KCk7XHJcbiAgICB9XHJcbiAgICBrZXlCdWZmZXIucHVzaChlLmtleUNvZGUpO1xyXG4gICAgc3dpdGNoIChlLmtleUNvZGUpIHtcclxuICAgICAgY2FzZSA3NDpcclxuICAgICAgY2FzZSAzNzpcclxuICAgICAgY2FzZSAxMDA6XHJcbiAgICAgICAga2V5Q2hlY2subGVmdCA9IHRydWU7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA3MzpcclxuICAgICAgY2FzZSAzODpcclxuICAgICAgY2FzZSAxMDQ6XHJcbiAgICAgICAga2V5Q2hlY2sudXAgPSB0cnVlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgNzY6XHJcbiAgICAgIGNhc2UgMzk6XHJcbiAgICAgIGNhc2UgMTAyOlxyXG4gICAgICAgIGtleUNoZWNrLnJpZ2h0ID0gdHJ1ZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDc1OlxyXG4gICAgICBjYXNlIDQwOlxyXG4gICAgICBjYXNlIDk4OlxyXG4gICAgICAgIGtleUNoZWNrLmRvd24gPSB0cnVlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgOTA6XHJcbiAgICAgICAga2V5Q2hlY2sueiA9IHRydWU7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA4ODpcclxuICAgICAgICBrZXlDaGVjay54ID0gdHJ1ZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgaWYgKGhhbmRsZSkge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIGUucmV0dXJuVmFsdWUgPSBmYWxzZTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAga2V5dXA6IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBlID0gZDMuZXZlbnQ7XHJcbiAgICB2YXIga2V5QnVmZmVyID0gdGhpcy5rZXlCdWZmZXI7XHJcbiAgICB2YXIga2V5Q2hlY2sgPSB0aGlzLmtleUNoZWNrO1xyXG4gICAgdmFyIGhhbmRsZSA9IGZhbHNlO1xyXG4gICAgc3dpdGNoIChlLmtleUNvZGUpIHtcclxuICAgICAgY2FzZSA3NDpcclxuICAgICAgY2FzZSAzNzpcclxuICAgICAgY2FzZSAxMDA6XHJcbiAgICAgICAga2V5Q2hlY2subGVmdCA9IGZhbHNlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgNzM6XHJcbiAgICAgIGNhc2UgMzg6XHJcbiAgICAgIGNhc2UgMTA0OlxyXG4gICAgICAgIGtleUNoZWNrLnVwID0gZmFsc2U7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA3NjpcclxuICAgICAgY2FzZSAzOTpcclxuICAgICAgY2FzZSAxMDI6XHJcbiAgICAgICAga2V5Q2hlY2sucmlnaHQgPSBmYWxzZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDc1OlxyXG4gICAgICBjYXNlIDQwOlxyXG4gICAgICBjYXNlIDk4OlxyXG4gICAgICAgIGtleUNoZWNrLmRvd24gPSBmYWxzZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDkwOlxyXG4gICAgICAgIGtleUNoZWNrLnogPSBmYWxzZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDg4OlxyXG4gICAgICAgIGtleUNoZWNrLnggPSBmYWxzZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgaWYgKGhhbmRsZSkge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIGUucmV0dXJuVmFsdWUgPSBmYWxzZTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgLy/jgqTjg5njg7Pjg4jjgavjg5DjgqTjg7Pjg4njgZnjgotcclxuICBiaW5kOmZ1bmN0aW9uKClcclxuICB7XHJcbiAgICBkMy5zZWxlY3QoJ2JvZHknKS5vbigna2V5ZG93bi5iYXNpY0lucHV0Jyx0aGlzLmtleWRvd24uYmluZCh0aGlzKSk7XHJcbiAgICBkMy5zZWxlY3QoJ2JvZHknKS5vbigna2V5dXAuYmFzaWNJbnB1dCcsdGhpcy5rZXl1cC5iaW5kKHRoaXMpKTtcclxuICB9LFxyXG4gIC8vIOOCouODs+ODkOOCpOODs+ODieOBmeOCi1xyXG4gIHVuYmluZDpmdW5jdGlvbigpXHJcbiAge1xyXG4gICAgZDMuc2VsZWN0KCdib2R5Jykub24oJ2tleWRvd24uYmFzaWNJbnB1dCcsbnVsbCk7XHJcbiAgICBkMy5zZWxlY3QoJ2JvZHknKS5vbigna2V5dXAuYmFzaWNJbnB1dCcsbnVsbCk7XHJcbiAgfVxyXG59IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8vdmFyIFNUQUdFX01BWCA9IDE7XHJcbmltcG9ydCAqIGFzIHNmZyBmcm9tICcuL2dsb2JhbCc7IFxyXG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbCc7XHJcbmltcG9ydCAqIGFzIGF1ZGlvIGZyb20gJy4vYXVkaW8nO1xyXG4vL2ltcG9ydCAqIGFzIHNvbmcgZnJvbSAnLi9zb25nJztcclxuaW1wb3J0ICogYXMgZ3JhcGhpY3MgZnJvbSAnLi9ncmFwaGljcyc7XHJcbmltcG9ydCAqIGFzIGlvIGZyb20gJy4vaW8nO1xyXG5pbXBvcnQgKiBhcyBjb21tIGZyb20gJy4vY29tbSc7XHJcbmltcG9ydCAqIGFzIHRleHQgZnJvbSAnLi90ZXh0JztcclxuaW1wb3J0ICogYXMgZ2FtZW9iaiBmcm9tICcuL2dhbWVvYmonO1xyXG5pbXBvcnQgKiBhcyBteXNoaXAgZnJvbSAnLi9teXNoaXAnO1xyXG5pbXBvcnQgKiBhcyBlbmVtaWVzIGZyb20gJy4vZW5lbWllcyc7XHJcbmltcG9ydCAqIGFzIGVmZmVjdG9iaiBmcm9tICcuL2VmZmVjdG9iaic7XHJcbmltcG9ydCB7IERldlRvb2wgfSBmcm9tICcuL2RldnRvb2wnO1xyXG5pbXBvcnQgeyBHYW1lIH0gZnJvbSAnLi9nYW1lJztcclxuXHJcbi8vLyDjg6HjgqTjg7Ncclxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgc2ZnLmdhbWUgPSBuZXcgR2FtZSgpO1xyXG4gIHNmZy5nYW1lLmV4ZWMoKTtcclxuXHJcbn07XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuaW1wb3J0ICogYXMgc2ZnIGZyb20gJy4vZ2xvYmFsJztcclxuaW1wb3J0ICogYXMgZ2FtZW9iaiBmcm9tICcuL2dhbWVvYmonO1xyXG5pbXBvcnQgKiBhcyBncmFwaGljcyBmcm9tICcuL2dyYXBoaWNzJztcclxuXHJcbnZhciBteUJ1bGxldHMgPSBbXTtcclxuXHJcbi8vLyDoh6rmqZ/lvL4gXHJcbmV4cG9ydCBjbGFzcyBNeUJ1bGxldCBleHRlbmRzIGdhbWVvYmouR2FtZU9iaiB7XHJcbiAgY29uc3RydWN0b3Ioc2NlbmUsc2UpIHtcclxuICBzdXBlcigwLCAwLCAwKTtcclxuXHJcbiAgdGhpcy5jb2xsaXNpb25BcmVhLndpZHRoID0gNDtcclxuICB0aGlzLmNvbGxpc2lvbkFyZWEuaGVpZ2h0ID0gNjtcclxuICB0aGlzLnNwZWVkID0gODtcclxuICB0aGlzLnBvd2VyID0gMTtcclxuXHJcbiAgdGhpcy50ZXh0dXJlV2lkdGggPSBzZmcudGV4dHVyZUZpbGVzLm15c2hpcC5pbWFnZS53aWR0aDtcclxuICB0aGlzLnRleHR1cmVIZWlnaHQgPSBzZmcudGV4dHVyZUZpbGVzLm15c2hpcC5pbWFnZS5oZWlnaHQ7XHJcblxyXG4gIC8vIOODoeODg+OCt+ODpeOBruS9nOaIkOODu+ihqOekuiAvLy9cclxuXHJcbiAgdmFyIG1hdGVyaWFsID0gZ3JhcGhpY3MuY3JlYXRlU3ByaXRlTWF0ZXJpYWwoc2ZnLnRleHR1cmVGaWxlcy5teXNoaXApO1xyXG4gIHZhciBnZW9tZXRyeSA9IGdyYXBoaWNzLmNyZWF0ZVNwcml0ZUdlb21ldHJ5KDE2KTtcclxuICBncmFwaGljcy5jcmVhdGVTcHJpdGVVVihnZW9tZXRyeSwgc2ZnLnRleHR1cmVGaWxlcy5teXNoaXAsIDE2LCAxNiwgMSk7XHJcbiAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuXHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnggPSB0aGlzLnhfO1xyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi55ID0gdGhpcy55XztcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueiA9IHRoaXMuel87XHJcbiAgdGhpcy5zZSA9IHNlO1xyXG4gIC8vc2UoMCk7XHJcbiAgLy9zZXF1ZW5jZXIucGxheVRyYWNrcyhzb3VuZEVmZmVjdHMuc291bmRFZmZlY3RzWzBdKTtcclxuICBzY2VuZS5hZGQodGhpcy5tZXNoKTtcclxuICB0aGlzLm1lc2gudmlzaWJsZSA9IHRoaXMuZW5hYmxlXyA9IGZhbHNlO1xyXG4gIC8vICBzZmcudGFza3MucHVzaFRhc2soZnVuY3Rpb24gKHRhc2tJbmRleCkgeyBzZWxmLm1vdmUodGFza0luZGV4KTsgfSk7XHJcbiB9XHJcblxyXG4gIGdldCB4KCkgeyByZXR1cm4gdGhpcy54XzsgfVxyXG4gIHNldCB4KHYpIHsgdGhpcy54XyA9IHRoaXMubWVzaC5wb3NpdGlvbi54ID0gdjsgfVxyXG4gIGdldCB5KCkgeyByZXR1cm4gdGhpcy55XzsgfVxyXG4gIHNldCB5KHYpIHsgdGhpcy55XyA9IHRoaXMubWVzaC5wb3NpdGlvbi55ID0gdjsgfVxyXG4gIGdldCB6KCkgeyByZXR1cm4gdGhpcy56XzsgfVxyXG4gIHNldCB6KHYpIHsgdGhpcy56XyA9IHRoaXMubWVzaC5wb3NpdGlvbi56ID0gdjsgfVxyXG4gICptb3ZlKHRhc2tJbmRleCkge1xyXG4gICAgXHJcbiAgICB3aGlsZSAodGFza0luZGV4ID49IDAgXHJcbiAgICAgICYmIHRoaXMuZW5hYmxlX1xyXG4gICAgICAmJiB0aGlzLnkgPD0gKHNmZy5WX1RPUCArIDE2KSBcclxuICAgICAgJiYgdGhpcy55ID49IChzZmcuVl9CT1RUT00gLSAxNikgXHJcbiAgICAgICYmIHRoaXMueCA8PSAoc2ZnLlZfUklHSFQgKyAxNikgXHJcbiAgICAgICYmIHRoaXMueCA+PSAoc2ZnLlZfTEVGVCAtIDE2KSlcclxuICAgIHtcclxuICAgICAgXHJcbiAgICAgIHRoaXMueSArPSB0aGlzLmR5O1xyXG4gICAgICB0aGlzLnggKz0gdGhpcy5keDtcclxuICAgICAgXHJcbiAgICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gICAgfVxyXG5cclxuICAgIHNmZy50YXNrcy5yZW1vdmVUYXNrKHRhc2tJbmRleCk7XHJcbiAgICB0aGlzLmVuYWJsZV8gPSB0aGlzLm1lc2gudmlzaWJsZSA9IGZhbHNlO1xyXG59XHJcblxyXG4gIHN0YXJ0KHgsIHksIHosIGFpbVJhZGlhbixwb3dlcikge1xyXG4gICAgaWYgKHRoaXMuZW5hYmxlXykge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB0aGlzLnggPSB4O1xyXG4gICAgdGhpcy55ID0geTtcclxuICAgIHRoaXMueiA9IHogLSAwLjE7XHJcbiAgICB0aGlzLnBvd2VyID0gcG93ZXIgfCAxO1xyXG4gICAgdGhpcy5keCA9IE1hdGguY29zKGFpbVJhZGlhbikgKiB0aGlzLnNwZWVkO1xyXG4gICAgdGhpcy5keSA9IE1hdGguc2luKGFpbVJhZGlhbikgKiB0aGlzLnNwZWVkO1xyXG4gICAgdGhpcy5lbmFibGVfID0gdGhpcy5tZXNoLnZpc2libGUgPSB0cnVlO1xyXG4gICAgdGhpcy5zZSgwKTtcclxuICAgIC8vc2VxdWVuY2VyLnBsYXlUcmFja3Moc291bmRFZmZlY3RzLnNvdW5kRWZmZWN0c1swXSk7XHJcbiAgICBzZmcudGFza3MucHVzaFRhc2sodGhpcy5tb3ZlLmJpbmQodGhpcykpO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g6Ieq5qmf44Kq44OW44K444Kn44Kv44OIXHJcbmV4cG9ydCBjbGFzcyBNeVNoaXAgZXh0ZW5kcyBnYW1lb2JqLkdhbWVPYmogeyBcclxuICBjb25zdHJ1Y3Rvcih4LCB5LCB6LHNjZW5lLHNlKSB7XHJcbiAgc3VwZXIoeCwgeSwgeik7Ly8gZXh0ZW5kXHJcblxyXG4gIHRoaXMuY29sbGlzaW9uQXJlYS53aWR0aCA9IDY7XHJcbiAgdGhpcy5jb2xsaXNpb25BcmVhLmhlaWdodCA9IDg7XHJcbiAgdGhpcy5zZSA9IHNlO1xyXG4gIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuICB0aGlzLnRleHR1cmVXaWR0aCA9IHNmZy50ZXh0dXJlRmlsZXMubXlzaGlwLmltYWdlLndpZHRoO1xyXG4gIHRoaXMudGV4dHVyZUhlaWdodCA9IHNmZy50ZXh0dXJlRmlsZXMubXlzaGlwLmltYWdlLmhlaWdodDtcclxuICB0aGlzLndpZHRoID0gMTY7XHJcbiAgdGhpcy5oZWlnaHQgPSAxNjtcclxuXHJcbiAgLy8g56e75YuV56+E5Zuy44KS5rGC44KB44KLXHJcbiAgdGhpcy50b3AgPSAoc2ZnLlZfVE9QIC0gdGhpcy5oZWlnaHQgLyAyKSB8IDA7XHJcbiAgdGhpcy5ib3R0b20gPSAoc2ZnLlZfQk9UVE9NICsgdGhpcy5oZWlnaHQgLyAyKSB8IDA7XHJcbiAgdGhpcy5sZWZ0ID0gKHNmZy5WX0xFRlQgKyB0aGlzLndpZHRoIC8gMikgfCAwO1xyXG4gIHRoaXMucmlnaHQgPSAoc2ZnLlZfUklHSFQgLSB0aGlzLndpZHRoIC8gMikgfCAwO1xyXG5cclxuICAvLyDjg6Hjg4Pjgrfjg6Xjga7kvZzmiJDjg7vooajnpLpcclxuICAvLyDjg57jg4bjg6rjgqLjg6vjga7kvZzmiJBcclxuICB2YXIgbWF0ZXJpYWwgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVNYXRlcmlhbChzZmcudGV4dHVyZUZpbGVzLm15c2hpcCk7XHJcbiAgLy8g44K444Kq44Oh44OI44Oq44Gu5L2c5oiQXHJcbiAgdmFyIGdlb21ldHJ5ID0gZ3JhcGhpY3MuY3JlYXRlU3ByaXRlR2VvbWV0cnkodGhpcy53aWR0aCk7XHJcbiAgZ3JhcGhpY3MuY3JlYXRlU3ByaXRlVVYoZ2VvbWV0cnksIHNmZy50ZXh0dXJlRmlsZXMubXlzaGlwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgMCk7XHJcblxyXG4gIHRoaXMubWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcblxyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi54ID0gdGhpcy54XztcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueSA9IHRoaXMueV87XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnogPSB0aGlzLnpfO1xyXG4gIHRoaXMucmVzdCA9IDM7XHJcbiAgdGhpcy5teUJ1bGxldHMgPSAoICgpPT4ge1xyXG4gICAgdmFyIGFyciA9IFtdO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAyOyArK2kpIHtcclxuICAgICAgYXJyLnB1c2gobmV3IE15QnVsbGV0KHRoaXMuc2NlbmUsdGhpcy5zZSkpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFycjtcclxuICB9KSgpO1xyXG4gIHNjZW5lLmFkZCh0aGlzLm1lc2gpO1xyXG4gIFxyXG4gIHRoaXMuYnVsbGV0UG93ZXIgPSAxO1xyXG5cclxufVxyXG4gIGdldCB4KCkgeyByZXR1cm4gdGhpcy54XzsgfVxyXG4gIHNldCB4KHYpIHsgdGhpcy54XyA9IHRoaXMubWVzaC5wb3NpdGlvbi54ID0gdjsgfVxyXG4gIGdldCB5KCkgeyByZXR1cm4gdGhpcy55XzsgfVxyXG4gIHNldCB5KHYpIHsgdGhpcy55XyA9IHRoaXMubWVzaC5wb3NpdGlvbi55ID0gdjsgfVxyXG4gIGdldCB6KCkgeyByZXR1cm4gdGhpcy56XzsgfVxyXG4gIHNldCB6KHYpIHsgdGhpcy56XyA9IHRoaXMubWVzaC5wb3NpdGlvbi56ID0gdjsgfVxyXG4gIFxyXG4gIHNob290KGFpbVJhZGlhbikge1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHRoaXMubXlCdWxsZXRzLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIGlmICh0aGlzLm15QnVsbGV0c1tpXS5zdGFydCh0aGlzLngsIHRoaXMueSAsIHRoaXMueixhaW1SYWRpYW4sdGhpcy5idWxsZXRQb3dlcikpIHtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBhY3Rpb24oYmFzaWNJbnB1dCkge1xyXG4gICAgaWYgKGJhc2ljSW5wdXQua2V5Q2hlY2subGVmdCkge1xyXG4gICAgICBpZiAodGhpcy54ID4gdGhpcy5sZWZ0KSB7XHJcbiAgICAgICAgdGhpcy54IC09IDI7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoYmFzaWNJbnB1dC5rZXlDaGVjay5yaWdodCkge1xyXG4gICAgICBpZiAodGhpcy54IDwgdGhpcy5yaWdodCkge1xyXG4gICAgICAgIHRoaXMueCArPSAyO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGJhc2ljSW5wdXQua2V5Q2hlY2sudXApIHtcclxuICAgICAgaWYgKHRoaXMueSA8IHRoaXMudG9wKSB7XHJcbiAgICAgICAgdGhpcy55ICs9IDI7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoYmFzaWNJbnB1dC5rZXlDaGVjay5kb3duKSB7XHJcbiAgICAgIGlmICh0aGlzLnkgPiB0aGlzLmJvdHRvbSkge1xyXG4gICAgICAgIHRoaXMueSAtPSAyO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGlmIChiYXNpY0lucHV0LmtleUNoZWNrLnopIHtcclxuICAgICAgYmFzaWNJbnB1dC5rZXlDaGVjay56ID0gZmFsc2U7XHJcbiAgICAgIHRoaXMuc2hvb3QoMC41ICogTWF0aC5QSSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGJhc2ljSW5wdXQua2V5Q2hlY2sueCkge1xyXG4gICAgICBiYXNpY0lucHV0LmtleUNoZWNrLnggPSBmYWxzZTtcclxuICAgICAgdGhpcy5zaG9vdCgxLjUgKiBNYXRoLlBJKTtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgaGl0KCkge1xyXG4gICAgdGhpcy5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxuICAgIHNmZy5ib21icy5zdGFydCh0aGlzLngsIHRoaXMueSwgMC4yKTtcclxuICAgIHRoaXMuc2UoNCk7XHJcbiAgfVxyXG5cclxufSIsIlwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgKiBhcyBzZmcgZnJvbSAnLi9nbG9iYWwnO1xyXG4vL2ltcG9ydCAqICBhcyBnYW1lb2JqIGZyb20gJy4vZ2FtZW9iaic7XHJcbi8vaW1wb3J0ICogYXMgZ3JhcGhpY3MgZnJvbSAnLi9ncmFwaGljcyc7XHJcblxyXG4vLy8g44OG44Kt44K544OI5bGe5oCnXHJcbmV4cG9ydCBjbGFzcyBUZXh0QXR0cmlidXRlIHtcclxuICBjb25zdHJ1Y3RvcihibGluaywgZm9udCkge1xyXG4gICAgaWYgKGJsaW5rKSB7XHJcbiAgICAgIHRoaXMuYmxpbmsgPSBibGluaztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuYmxpbmsgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIGlmIChmb250KSB7XHJcbiAgICAgIHRoaXMuZm9udCA9IGZvbnQ7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmZvbnQgPSBzZmcudGV4dHVyZUZpbGVzLmZvbnQ7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g44OG44Kt44K544OI44OX44Os44O844OzXHJcbmV4cG9ydCBjbGFzcyBUZXh0UGxhbmV7IFxyXG4gIGNvbnN0cnVjdG9yIChzY2VuZSkge1xyXG4gIHRoaXMudGV4dEJ1ZmZlciA9IG5ldyBBcnJheShzZmcuVEVYVF9IRUlHSFQpO1xyXG4gIHRoaXMuYXR0ckJ1ZmZlciA9IG5ldyBBcnJheShzZmcuVEVYVF9IRUlHSFQpO1xyXG4gIHRoaXMudGV4dEJhY2tCdWZmZXIgPSBuZXcgQXJyYXkoc2ZnLlRFWFRfSEVJR0hUKTtcclxuICB0aGlzLmF0dHJCYWNrQnVmZmVyID0gbmV3IEFycmF5KHNmZy5URVhUX0hFSUdIVCk7XHJcbiAgdmFyIGVuZGkgPSB0aGlzLnRleHRCdWZmZXIubGVuZ3RoO1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZW5kaTsgKytpKSB7XHJcbiAgICB0aGlzLnRleHRCdWZmZXJbaV0gPSBuZXcgQXJyYXkoc2ZnLlRFWFRfV0lEVEgpO1xyXG4gICAgdGhpcy5hdHRyQnVmZmVyW2ldID0gbmV3IEFycmF5KHNmZy5URVhUX1dJRFRIKTtcclxuICAgIHRoaXMudGV4dEJhY2tCdWZmZXJbaV0gPSBuZXcgQXJyYXkoc2ZnLlRFWFRfV0lEVEgpO1xyXG4gICAgdGhpcy5hdHRyQmFja0J1ZmZlcltpXSA9IG5ldyBBcnJheShzZmcuVEVYVF9XSURUSCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLy8g5o+P55S755So44Kt44Oj44Oz44OQ44K544Gu44K744OD44OI44Ki44OD44OXXHJcblxyXG4gIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgdmFyIHdpZHRoID0gMTtcclxuICB3aGlsZSAod2lkdGggPD0gc2ZnLlZJUlRVQUxfV0lEVEgpe1xyXG4gICAgd2lkdGggKj0gMjtcclxuICB9XHJcbiAgdmFyIGhlaWdodCA9IDE7XHJcbiAgd2hpbGUgKGhlaWdodCA8PSBzZmcuVklSVFVBTF9IRUlHSFQpe1xyXG4gICAgaGVpZ2h0ICo9IDI7XHJcbiAgfVxyXG4gIFxyXG4gIHRoaXMuY2FudmFzLndpZHRoID0gd2lkdGg7XHJcbiAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG4gIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICB0aGlzLnRleHR1cmUgPSBuZXcgVEhSRUUuVGV4dHVyZSh0aGlzLmNhbnZhcyk7XHJcbiAgdGhpcy50ZXh0dXJlLm1hZ0ZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XHJcbiAgdGhpcy50ZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLkxpbmVhck1pcE1hcExpbmVhckZpbHRlcjtcclxuICB0aGlzLm1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgbWFwOiB0aGlzLnRleHR1cmUsYWxwaGFUZXN0OjAuNSwgdHJhbnNwYXJlbnQ6IHRydWUsZGVwdGhUZXN0OnRydWUsc2hhZGluZzpUSFJFRS5GbGF0U2hhZGluZ30pO1xyXG4vLyAgdGhpcy5nZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KHNmZy5WSVJUVUFMX1dJRFRILCBzZmcuVklSVFVBTF9IRUlHSFQpO1xyXG4gIHRoaXMuZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSh3aWR0aCwgaGVpZ2h0KTtcclxuICB0aGlzLm1lc2ggPSBuZXcgVEhSRUUuTWVzaCh0aGlzLmdlb21ldHJ5LCB0aGlzLm1hdGVyaWFsKTtcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueiA9IDAuNDtcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueCA9ICh3aWR0aCAtIHNmZy5WSVJUVUFMX1dJRFRIKSAvIDI7XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnkgPSAgLSAoaGVpZ2h0IC0gc2ZnLlZJUlRVQUxfSEVJR0hUKSAvIDI7XHJcbiAgdGhpcy5mb250cyA9IHsgZm9udDogc2ZnLnRleHR1cmVGaWxlcy5mb250LCBmb250MTogc2ZnLnRleHR1cmVGaWxlcy5mb250MSB9O1xyXG4gIHRoaXMuYmxpbmtDb3VudCA9IDA7XHJcbiAgdGhpcy5ibGluayA9IGZhbHNlO1xyXG5cclxuICAvLyDjgrnjg6Djg7zjgrjjg7PjgrDjgpLliIfjgotcclxuICB0aGlzLmN0eC5tc0ltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIHRoaXMuY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIC8vdGhpcy5jdHgud2Via2l0SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgdGhpcy5jdHgubW96SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcblxyXG4gIHRoaXMuY2xzKCk7XHJcbiAgc2NlbmUuYWRkKHRoaXMubWVzaCk7XHJcbn1cclxuXHJcbiAgLy8vIOeUu+mdoua2iOWOu1xyXG4gIGNscygpIHtcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmRpID0gdGhpcy50ZXh0QnVmZmVyLmxlbmd0aDsgaSA8IGVuZGk7ICsraSkge1xyXG4gICAgICB2YXIgbGluZSA9IHRoaXMudGV4dEJ1ZmZlcltpXTtcclxuICAgICAgdmFyIGF0dHJfbGluZSA9IHRoaXMuYXR0ckJ1ZmZlcltpXTtcclxuICAgICAgdmFyIGxpbmVfYmFjayA9IHRoaXMudGV4dEJhY2tCdWZmZXJbaV07XHJcbiAgICAgIHZhciBhdHRyX2xpbmVfYmFjayA9IHRoaXMuYXR0ckJhY2tCdWZmZXJbaV07XHJcblxyXG4gICAgICBmb3IgKHZhciBqID0gMCwgZW5kaiA9IHRoaXMudGV4dEJ1ZmZlcltpXS5sZW5ndGg7IGogPCBlbmRqOyArK2opIHtcclxuICAgICAgICBsaW5lW2pdID0gMHgyMDtcclxuICAgICAgICBhdHRyX2xpbmVbal0gPSAweDAwO1xyXG4gICAgICAgIC8vbGluZV9iYWNrW2pdID0gMHgyMDtcclxuICAgICAgICAvL2F0dHJfbGluZV9iYWNrW2pdID0gMHgwMDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHNmZy5WSVJUVUFMX1dJRFRILCBzZmcuVklSVFVBTF9IRUlHSFQpO1xyXG4gIH1cclxuXHJcbiAgLy8vIOaWh+Wtl+ihqOekuuOBmeOCi1xyXG4gIHByaW50KHgsIHksIHN0ciwgYXR0cmlidXRlKSB7XHJcbiAgICB2YXIgbGluZSA9IHRoaXMudGV4dEJ1ZmZlclt5XTtcclxuICAgIHZhciBhdHRyID0gdGhpcy5hdHRyQnVmZmVyW3ldO1xyXG4gICAgaWYgKCFhdHRyaWJ1dGUpIHtcclxuICAgICAgYXR0cmlidXRlID0gMDtcclxuICAgIH1cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgIHZhciBjID0gc3RyLmNoYXJDb2RlQXQoaSk7XHJcbiAgICAgIGlmIChjID09IDB4YSkge1xyXG4gICAgICAgICsreTtcclxuICAgICAgICBpZiAoeSA+PSB0aGlzLnRleHRCdWZmZXIubGVuZ3RoKSB7XHJcbiAgICAgICAgICAvLyDjgrnjgq/jg63jg7zjg6tcclxuICAgICAgICAgIHRoaXMudGV4dEJ1ZmZlciA9IHRoaXMudGV4dEJ1ZmZlci5zbGljZSgxLCB0aGlzLnRleHRCdWZmZXIubGVuZ3RoIC0gMSk7XHJcbiAgICAgICAgICB0aGlzLnRleHRCdWZmZXIucHVzaChuZXcgQXJyYXkoc2ZnLlZJUlRVQUxfV0lEVEggLyA4KSk7XHJcbiAgICAgICAgICB0aGlzLmF0dHJCdWZmZXIgPSB0aGlzLmF0dHJCdWZmZXIuc2xpY2UoMSwgdGhpcy5hdHRyQnVmZmVyLmxlbmd0aCAtIDEpO1xyXG4gICAgICAgICAgdGhpcy5hdHRyQnVmZmVyLnB1c2gobmV3IEFycmF5KHNmZy5WSVJUVUFMX1dJRFRIIC8gOCkpO1xyXG4gICAgICAgICAgLS15O1xyXG4gICAgICAgICAgdmFyIGVuZGogPSB0aGlzLnRleHRCdWZmZXJbeV0ubGVuZ3RoO1xyXG4gICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBlbmRqOyArK2opIHtcclxuICAgICAgICAgICAgdGhpcy50ZXh0QnVmZmVyW3ldW2pdID0gMHgyMDtcclxuICAgICAgICAgICAgdGhpcy5hdHRyQnVmZmVyW3ldW2pdID0gMHgwMDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgbGluZSA9IHRoaXMudGV4dEJ1ZmZlclt5XTtcclxuICAgICAgICBhdHRyID0gdGhpcy5hdHRyQnVmZmVyW3ldO1xyXG4gICAgICAgIHggPSAwO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxpbmVbeF0gPSBjO1xyXG4gICAgICAgIGF0dHJbeF0gPSBhdHRyaWJ1dGU7XHJcbiAgICAgICAgKyt4O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIC8vLyDjg4bjgq3jgrnjg4jjg4fjg7zjgr/jgpLjgoLjgajjgavjg4bjgq/jgrnjg4Hjg6Pjg7zjgavmj4/nlLvjgZnjgotcclxuICByZW5kZXIoKSB7XHJcbiAgICB2YXIgY3R4ID0gdGhpcy5jdHg7XHJcbiAgICB0aGlzLmJsaW5rQ291bnQgPSAodGhpcy5ibGlua0NvdW50ICsgMSkgJiAweGY7XHJcblxyXG4gICAgdmFyIGRyYXdfYmxpbmsgPSBmYWxzZTtcclxuICAgIGlmICghdGhpcy5ibGlua0NvdW50KSB7XHJcbiAgICAgIHRoaXMuYmxpbmsgPSAhdGhpcy5ibGluaztcclxuICAgICAgZHJhd19ibGluayA9IHRydWU7XHJcbiAgICB9XHJcbiAgICB2YXIgdXBkYXRlID0gZmFsc2U7XHJcbi8vICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgQ09OU09MRV9XSURUSCwgQ09OU09MRV9IRUlHSFQpO1xyXG4vLyAgICBjdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG5cclxuICAgIGZvciAodmFyIHkgPSAwLCBneSA9IDA7IHkgPCBzZmcuVEVYVF9IRUlHSFQ7ICsreSwgZ3kgKz0gc2ZnLkFDVFVBTF9DSEFSX1NJWkUpIHtcclxuICAgICAgdmFyIGxpbmUgPSB0aGlzLnRleHRCdWZmZXJbeV07XHJcbiAgICAgIHZhciBhdHRyX2xpbmUgPSB0aGlzLmF0dHJCdWZmZXJbeV07XHJcbiAgICAgIHZhciBsaW5lX2JhY2sgPSB0aGlzLnRleHRCYWNrQnVmZmVyW3ldO1xyXG4gICAgICB2YXIgYXR0cl9saW5lX2JhY2sgPSB0aGlzLmF0dHJCYWNrQnVmZmVyW3ldO1xyXG4gICAgICBmb3IgKHZhciB4ID0gMCwgZ3ggPSAwOyB4IDwgc2ZnLlRFWFRfV0lEVEg7ICsreCwgZ3ggKz0gc2ZnLkFDVFVBTF9DSEFSX1NJWkUpIHtcclxuICAgICAgICB2YXIgcHJvY2Vzc19ibGluayA9IChhdHRyX2xpbmVbeF0gJiYgYXR0cl9saW5lW3hdLmJsaW5rKTtcclxuICAgICAgICBpZiAobGluZVt4XSAhPSBsaW5lX2JhY2tbeF0gfHwgYXR0cl9saW5lW3hdICE9IGF0dHJfbGluZV9iYWNrW3hdIHx8IChwcm9jZXNzX2JsaW5rICYmIGRyYXdfYmxpbmspKSB7XHJcbiAgICAgICAgICB1cGRhdGUgPSB0cnVlO1xyXG5cclxuICAgICAgICAgIGxpbmVfYmFja1t4XSA9IGxpbmVbeF07XHJcbiAgICAgICAgICBhdHRyX2xpbmVfYmFja1t4XSA9IGF0dHJfbGluZVt4XTtcclxuICAgICAgICAgIHZhciBjID0gMDtcclxuICAgICAgICAgIGlmICghcHJvY2Vzc19ibGluayB8fCB0aGlzLmJsaW5rKSB7XHJcbiAgICAgICAgICAgIGMgPSBsaW5lW3hdIC0gMHgyMDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHZhciB5cG9zID0gKGMgPj4gNCkgPDwgMztcclxuICAgICAgICAgIHZhciB4cG9zID0gKGMgJiAweGYpIDw8IDM7XHJcbiAgICAgICAgICBjdHguY2xlYXJSZWN0KGd4LCBneSwgc2ZnLkFDVFVBTF9DSEFSX1NJWkUsIHNmZy5BQ1RVQUxfQ0hBUl9TSVpFKTtcclxuICAgICAgICAgIHZhciBmb250ID0gYXR0cl9saW5lW3hdID8gYXR0cl9saW5lW3hdLmZvbnQgOiBzZmcudGV4dHVyZUZpbGVzLmZvbnQ7XHJcbiAgICAgICAgICBpZiAoYykge1xyXG4gICAgICAgICAgICBjdHguZHJhd0ltYWdlKGZvbnQuaW1hZ2UsIHhwb3MsIHlwb3MsIHNmZy5DSEFSX1NJWkUsIHNmZy5DSEFSX1NJWkUsIGd4LCBneSwgc2ZnLkFDVFVBTF9DSEFSX1NJWkUsIHNmZy5BQ1RVQUxfQ0hBUl9TSVpFKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMudGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHVwZGF0ZTtcclxuICB9XHJcbn1cclxuIiwiXHJcblwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgKiBhcyBzZmcgZnJvbSAnLi9nbG9iYWwnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFRhc2sge1xyXG4gIGNvbnN0cnVjdG9yKGdlbkluc3QscHJpb3JpdHkpIHtcclxuICAgIHRoaXMucHJpb3JpdHkgPSBwcmlvcml0eSB8fCAxMDAwMDtcclxuICAgIHRoaXMuZ2VuSW5zdCA9IGdlbkluc3Q7XHJcbiAgICAvLyDliJ3mnJ/ljJZcclxuICAgIHRoaXMuaW5kZXggPSAwO1xyXG4gIH1cclxuICBcclxufVxyXG5cclxuZXhwb3J0IHZhciBudWxsVGFzayA9IG5ldyBUYXNrKChmdW5jdGlvbiooKXt9KSgpKTtcclxuXHJcbi8vLyDjgr/jgrnjgq/nrqHnkIZcclxuZXhwb3J0IGNsYXNzIFRhc2tzIHtcclxuICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgdGhpcy5hcnJheSA9IG5ldyBBcnJheSgwKTtcclxuICAgIHRoaXMubmVlZFNvcnQgPSBmYWxzZTtcclxuICAgIHRoaXMubmVlZENvbXByZXNzID0gZmFsc2U7XHJcbiAgfVxyXG4gIC8vIGluZGV444Gu5L2N572u44Gu44K/44K544Kv44KS572u44GN5o+b44GI44KLXHJcbiAgc2V0TmV4dFRhc2soaW5kZXgsIGdlbkluc3QsIHByaW9yaXR5KSBcclxuICB7XHJcbiAgICBpZihpbmRleCA8IDApe1xyXG4gICAgICBpbmRleCA9IC0oKytpbmRleCk7XHJcbiAgICB9XHJcbiAgICB2YXIgdCA9IG5ldyBUYXNrKGdlbkluc3QoaW5kZXgpLCBwcmlvcml0eSk7XHJcbiAgICB0LmluZGV4ID0gaW5kZXg7XHJcbiAgICB0aGlzLmFycmF5W2luZGV4XSA9IHQ7XHJcbiAgICB0aGlzLm5lZWRTb3J0ID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIHB1c2hUYXNrKGdlbkluc3QsIHByaW9yaXR5KSB7XHJcbiAgICBsZXQgdDtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5hcnJheS5sZW5ndGg7ICsraSkge1xyXG4gICAgICBpZiAodGhpcy5hcnJheVtpXSA9PSBudWxsVGFzaykge1xyXG4gICAgICAgIHQgPSBuZXcgVGFzayhnZW5JbnN0KGkpLCBwcmlvcml0eSk7XHJcbiAgICAgICAgdGhpcy5hcnJheVtpXSA9IHQ7XHJcbiAgICAgICAgdC5pbmRleCA9IGk7XHJcbiAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHQgPSBuZXcgVGFzayhnZW5JbnN0KHRoaXMuYXJyYXkubGVuZ3RoKSxwcmlvcml0eSk7XHJcbiAgICB0LmluZGV4ID0gdGhpcy5hcnJheS5sZW5ndGg7XHJcbiAgICB0aGlzLmFycmF5W3RoaXMuYXJyYXkubGVuZ3RoXSA9IHQ7XHJcbiAgICB0aGlzLm5lZWRTb3J0ID0gdHJ1ZTtcclxuICAgIHJldHVybiB0O1xyXG4gIH1cclxuXHJcbiAgLy8g6YWN5YiX44KS5Y+W5b6X44GZ44KLXHJcbiAgZ2V0QXJyYXkoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5hcnJheTtcclxuICB9XHJcbiAgLy8g44K/44K544Kv44KS44Kv44Oq44Ki44GZ44KLXHJcbiAgY2xlYXIoKSB7XHJcbiAgICB0aGlzLmFycmF5Lmxlbmd0aCA9IDA7XHJcbiAgfVxyXG4gIC8vIOOCveODvOODiOOBjOW/heimgeOBi+ODgeOCp+ODg+OCr+OBl+OAgeOCveODvOODiOOBmeOCi1xyXG4gIGNoZWNrU29ydCgpIHtcclxuICAgIGlmICh0aGlzLm5lZWRTb3J0KSB7XHJcbiAgICAgIHRoaXMuYXJyYXkuc29ydChmdW5jdGlvbiAoYSwgYikge1xyXG4gICAgICAgIGlmKGEucHJpb3JpdHkgPiBiLnByaW9yaXR5KSByZXR1cm4gMTtcclxuICAgICAgICBpZiAoYS5wcmlvcml0eSA8IGIucHJpb3JpdHkpIHJldHVybiAtMTtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgICAgfSk7XHJcbiAgICAgIC8vIOOCpOODs+ODh+ODg+OCr+OCueOBruaMr+OCiuebtOOBl1xyXG4gICAgICBmb3IgKHZhciBpID0gMCwgZSA9IHRoaXMuYXJyYXkubGVuZ3RoOyBpIDwgZTsgKytpKSB7XHJcbiAgICAgICAgdGhpcy5hcnJheVtpXS5pbmRleCA9IGk7XHJcbiAgICAgIH1cclxuICAgICB0aGlzLm5lZWRTb3J0ID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZW1vdmVUYXNrKGluZGV4KSB7XHJcbiAgICBpZihpbmRleCA8IDApe1xyXG4gICAgICBpbmRleCA9IC0oKytpbmRleCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmFycmF5W2luZGV4XSA9IG51bGxUYXNrO1xyXG4gICAgdGhpcy5uZWVkQ29tcHJlc3MgPSB0cnVlO1xyXG4gIH1cclxuICBcclxuICBjb21wcmVzcygpIHtcclxuICAgIGlmICghdGhpcy5uZWVkQ29tcHJlc3MpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdmFyIGRlc3QgPSBbXTtcclxuICAgIHZhciBzcmMgPSB0aGlzLmFycmF5O1xyXG4gICAgdmFyIGRlc3RJbmRleCA9IDA7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gc3JjLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIHZhciBzID0gc3JjW2ldO1xyXG4gICAgICBpZiAocyAhPSBudWxsVGFzaykge1xyXG4gICAgICAgIHMuaW5kZXggPSBkZXN0SW5kZXg7XHJcbiAgICAgICAgZGVzdC5wdXNoKHMpO1xyXG4gICAgICAgIGRlc3RJbmRleCsrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLmFycmF5ID0gZGVzdDtcclxuICAgIHRoaXMubmVlZENvbXByZXNzID0gZmFsc2U7XHJcbiAgfVxyXG4gIFxyXG4gIHByb2Nlc3MoZ2FtZSlcclxuICB7XHJcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5wcm9jZXNzLmJpbmQodGhpcyxnYW1lKSk7XHJcbiAgICBpZiAoIXNmZy5wYXVzZSkge1xyXG4gICAgICBpZiAoIWdhbWUuaXNIaWRkZW4pIHtcclxuICAgICAgICB0aGlzLmNoZWNrU29ydCgpO1xyXG4gICAgICAgIHRoaXMuYXJyYXkuZm9yRWFjaCggKHRhc2ssaSkgPT57XHJcbiAgICAgICAgICBpZiAodGFzayAhPSBudWxsVGFzaykge1xyXG4gICAgICAgICAgICBpZih0YXNrLmluZGV4ICE9IGkgKXtcclxuICAgICAgICAgICAgICBkZWJ1Z2dlcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0YXNrLmdlbkluc3QubmV4dCh0YXNrLmluZGV4KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmNvbXByZXNzKCk7XHJcbiAgICAgIH1cclxuICAgIH0gICAgXHJcbiAgICBcclxuICB9XHJcbn1cclxuXHJcbi8vLyDjgrLjg7zjg6DnlKjjgr/jgqTjg57jg7xcclxuZXhwb3J0IGNsYXNzIEdhbWVUaW1lciB7XHJcbiAgY29uc3RydWN0b3IoZ2V0Q3VycmVudFRpbWUpIHtcclxuICAgIHRoaXMuZWxhcHNlZFRpbWUgPSAwO1xyXG4gICAgdGhpcy5jdXJyZW50VGltZSA9IDA7XHJcbiAgICB0aGlzLnBhdXNlVGltZSA9IDA7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuU1RPUDtcclxuICAgIHRoaXMuZ2V0Q3VycmVudFRpbWUgPSBnZXRDdXJyZW50VGltZTtcclxuICAgIHRoaXMuU1RPUCA9IDE7XHJcbiAgICB0aGlzLlNUQVJUID0gMjtcclxuICAgIHRoaXMuUEFVU0UgPSAzO1xyXG5cclxuICB9XHJcbiAgXHJcbiAgc3RhcnQoKSB7XHJcbiAgICB0aGlzLmVsYXBzZWRUaW1lID0gMDtcclxuICAgIHRoaXMuZGVsdGFUaW1lID0gMDtcclxuICAgIHRoaXMuY3VycmVudFRpbWUgPSB0aGlzLmdldEN1cnJlbnRUaW1lKCk7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuU1RBUlQ7XHJcbiAgfVxyXG5cclxuICByZXN1bWUoKSB7XHJcbiAgICB2YXIgbm93VGltZSA9IHRoaXMuZ2V0Q3VycmVudFRpbWUoKTtcclxuICAgIHRoaXMuY3VycmVudFRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lICsgbm93VGltZSAtIHRoaXMucGF1c2VUaW1lO1xyXG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLlNUQVJUO1xyXG4gIH1cclxuXHJcbiAgcGF1c2UoKSB7XHJcbiAgICB0aGlzLnBhdXNlVGltZSA9IHRoaXMuZ2V0Q3VycmVudFRpbWUoKTtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5QQVVTRTtcclxuICB9XHJcblxyXG4gIHN0b3AoKSB7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuU1RPUDtcclxuICB9XHJcblxyXG4gIHVwZGF0ZSgpIHtcclxuICAgIGlmICh0aGlzLnN0YXR1cyAhPSB0aGlzLlNUQVJUKSByZXR1cm47XHJcbiAgICB2YXIgbm93VGltZSA9IHRoaXMuZ2V0Q3VycmVudFRpbWUoKTtcclxuICAgIHRoaXMuZGVsdGFUaW1lID0gbm93VGltZSAtIHRoaXMuY3VycmVudFRpbWU7XHJcbiAgICB0aGlzLmVsYXBzZWRUaW1lID0gdGhpcy5lbGFwc2VkVGltZSArIHRoaXMuZGVsdGFUaW1lO1xyXG4gICAgdGhpcy5jdXJyZW50VGltZSA9IG5vd1RpbWU7XHJcbiAgfVxyXG59XHJcblxyXG4iXX0=
