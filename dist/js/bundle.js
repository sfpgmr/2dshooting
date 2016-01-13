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
      this.index = 0;
      graphics.updateSpriteUV(this.mesh.geometry, sfg.textureFiles.bomb, 16, 16, this.index);
      var self = this;
      sfg.tasks.pushTask(function (i) {
        self.move(i);
      });
      this.mesh.material.opacity = 1.0;
      return true;
    }
  }, {
    key: 'move',
    value: function move(taskIndex) {
      if (!this.delay) {
        this.mesh.visible = true;
      } else {
        this.delay--;
        return;
      }
      this.index++;
      if (this.index < 7) {
        graphics.updateSpriteUV(this.mesh.geometry, sfg.textureFiles.bomb, 16, 16, this.index);
      } else {
        this.enable_ = false;
        this.mesh.visible = false;
        sfg.tasks.removeTask(taskIndex);
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

},{"./gameobj":6,"./global":7,"./graphics":8}],4:[function(require,module,exports){
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
    value: function move(taskIndex) {
      if (this.status == this.NONE) {
        debugger;
      }

      this.x = this.x + this.dx;
      this.y = this.y + this.dy;

      if (this.x < sfg.V_LEFT - 16 || this.x > sfg.V_RIGHT + 16 || this.y < sfg.V_BOTTOM - 16 || this.y > sfg.V_TOP + 16) {
        this.mesh.visible = false;
        this.status = this.NONE;
        this.enable = false;
        sfg.tasks.removeTask(taskIndex);
      }
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

      var enb = this;
      this.task = sfg.tasks.pushTask(enb.move.bind(enb));
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
        if (ebs[i].enable) {
          ebs[i].enable = false;
          ebs[i].status = ebs[i].NONE;
          sfg.tasks.removeTask(ebs[i].task.index);
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
    key: 'start',
    value: function start(self, x, y) {
      self.moveEnd = false;
      self.step = this.step;
      if (self.xrev) {
        self.charRad = PI - (this.rad - PI / 2);
      } else {
        self.charRad = this.rad - PI / 2;
      }
    }
  }, {
    key: 'move',
    value: function move(self) {
      if (self.moveEnd) {
        return;
      }
      if (self.xrev) {
        self.x -= this.dx;
      } else {
        self.x += this.dx;
      }
      self.y += this.dy;
      self.step--;
      if (!self.step) {
        self.moveEnd = true;
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
    key: 'start',
    value: function start(self, x, y) {
      self.moveEnd = false;
      self.step = 0;
      if (self.xrev) {
        self.sx = x - this.r * Math.cos(this.startRad + Math.PI);
      } else {
        self.sx = x - this.r * Math.cos(this.startRad);
      }
      self.sy = y - this.r * Math.sin(this.startRad);
      self.z = 0.0;
      return true;
    }
  }, {
    key: 'move',
    value: function move(self) {
      if (self.moveEnd) {
        return;
      }
      var delta = this.deltas[self.step];

      self.x = self.sx + (self.xrev ? delta.x * -1 : delta.x);
      self.y = self.sy + delta.y;
      if (self.xrev) {
        self.charRad = Math.PI - delta.rad + (this.left ? -1 : 0) * Math.PI;
      } else {
        self.charRad = delta.rad + (this.left ? 0 : -1) * Math.PI;
      }
      self.rad = delta.rad;
      self.step++;
      if (self.step >= this.deltas.length) {
        self.step--;
        self.moveEnd = true;
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
    key: 'start',
    value: function start(self, x, y) {
      var rad = Math.atan2(self.homeY - self.y, self.homeX - self.x);
      self.charRad = rad - Math.PI / 2;
      self.rad = rad;
      self.speed = 4;
      self.dx = Math.cos(self.rad) * self.speed;
      self.dy = Math.sin(self.rad) * self.speed;
      self.moveEnd = false;
      self.z = 0.0;
      return true;
    }
  }, {
    key: 'move',
    value: function move(self) {
      if (self.moveEnd) {
        return;
      }
      if (Math.abs(self.x - self.homeX) < 2 && Math.abs(self.y - self.homeY) < 2) {
        self.charRad = 0;
        self.rad = Math.PI;
        self.x = self.homeX;
        self.y = self.homeY;
        self.moveEnd = true;
        if (self.status == self.START) {
          var groupID = self.groupID;
          var groupData = self.enemies.groupData;
          groupData[groupID].push(self);
          self.enemies.homeEnemiesCount++;
        }
        self.status = self.HOME;
        return;
      }
      self.x += self.dx;
      self.y += self.dy;
    }
  }]);

  return GotoHome;
}();

///

var HomeMove = function () {
  function HomeMove() {
    _classCallCheck(this, HomeMove);

    this.CENTER_X = 0;
    this.CENTER_Y = 100;
  }

  _createClass(HomeMove, [{
    key: 'start',
    value: function start(self, x, y) {
      self.dx = self.homeX - this.CENTER_X;
      self.dy = self.homeY - this.CENTER_Y;
      self.moveEnd = false;
      self.z = -0.1;
      return true;
    }
  }, {
    key: 'move',
    value: function move(self) {
      if (self.moveEnd) {
        return;
      }
      if (self.status == self.ATTACK) {
        self.moveEnd = true;
        self.mesh.scale.x = 1.0;
        self.z = 0.0;
        return;
      }
      self.x = self.homeX + self.dx * self.enemies.homeDelta;
      self.y = self.homeY + self.dy * self.enemies.homeDelta;
      self.mesh.scale.x = self.enemies.homeDelta2;
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
    key: 'start',
    value: function start(self, x, y) {
      self.index = this.pos - 1;
      return false;
    }
  }, {
    key: 'move',
    value: function move(self) {}
  }]);

  return Goto;
}();

/// 敵弾発射

var Fire = function () {
  function Fire() {
    _classCallCheck(this, Fire);
  }

  _createClass(Fire, [{
    key: 'start',
    value: function start(self, x, y) {
      var d = sfg.stage.no / 20 * sfg.stage.difficulty;
      if (d > 1) {
        d = 1.0;
      }
      if (Math.random() < d) {
        self.enemies.enemyBullets.start(self.x, self.y);
        self.moveEnd = true;
      }
      return false;
    }
  }, {
    key: 'move',
    value: function move(self) {
      if (self.moveEnd) {
        return;
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
    _this2.NONE = 0;
    _this2.START = 1;
    _this2.HOME = 2;
    _this2.ATTACK = 3;
    _this2.BOMB = 4;

    return _this2;
  }

  _createClass(Enemy, [{
    key: 'move',

    ///敵の動き
    value: function move(taskIndex) {
      if (this.status == this.NONE) {
        debugger;
      }
      var end = false;
      while (!end) {
        if (this.moveEnd && this.index < this.mvPattern.length - 1) {
          this.index++;
          this.mv = this.mvPattern[this.index];
          end = this.mv.start(this, this.x, this.y);
        } else {
          break;
        }
      }
      this.mv.move(this);
      this.mesh.scale.x = this.enemies.homeDelta2;
      this.mesh.rotation.z = this.charRad;
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
      this.mv = mvPattern[0];
      this.mv.start(this, x, y);
      //if (this.status != this.NONE) {
      //  debugger;
      //}
      this.status = this.START;
      var self = this;
      this.task = sfg.tasks.pushTask(function (i) {
        self.move(i);
      }, 10000);
      this.mesh.visible = true;
      return true;
    }
  }, {
    key: 'hit',
    value: function hit() {
      if (this.hit_ == null) {
        this.life--;
        if (this.life == 0) {
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
          this.mesh.visible = false;
          this.enable_ = false;
          this.status = this.NONE;
          sfg.tasks.removeTask(this.task.index);
        } else {
          this.se(2);
          this.mesh.material.color.setHex(0xFF8080);
        }
      } else {
        this.hit_();
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
        this.endTime = sfg.gameTimer.elapsedTime + 1.0 * (2.0 - sfg.stage.difficulty);
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
[0.8, 56, 176, 75, 40, 7, Zako, true], [0.08, 56, 176, 35, 40, 7, Zako, true], [0.08, 56, 176, 55, 40, 7, Zako, true], [0.08, 56, 176, 15, 40, 7, Zako, true], [0.08, 56, 176, 75, -120, 4, Zako, true], [0.8, -56, 176, -75, 40, -7, Zako, true], [0.08, -56, 176, -35, 40, -7, Zako, true], [0.08, -56, 176, -55, 40, -7, Zako, true], [0.08, -56, 176, -15, 40, -7, Zako, true], [0.08, -56, 176, -75, -120, -4, Zako, true], [0.8, 128, -128, 75, 60, 6, Zako, true], [0.08, 128, -128, 35, 60, 6, Zako, true], [0.08, 128, -128, 55, 60, 6, Zako, true], [0.08, 128, -128, 15, 60, 6, Zako, true], [0.08, 128, -128, 95, 60, 6, Zako, true], [0.8, -128, -128, -75, 60, -6, Zako, true], [0.08, -128, -128, -35, 60, -6, Zako, true], [0.08, -128, -128, -55, 60, -6, Zako, true], [0.08, -128, -128, -15, 60, -6, Zako, true], [0.08, -128, -128, -95, 60, -6, Zako, true], [0.7, 0, 176, 75, 80, 1, Zako1, true], [0.05, 0, 176, 35, 80, 1, Zako1, true], [0.05, 0, 176, 55, 80, 1, Zako1, true], [0.05, 0, 176, 15, 80, 1, Zako1, true], [0.05, 0, 176, 95, 80, 1, Zako1, true], [0.7, 0, 176, -75, 80, 3, Zako1, true], [0.05, 0, 176, -35, 80, 3, Zako1, true], [0.05, 0, 176, -55, 80, 3, Zako1, true], [0.05, 0, 176, -15, 80, 3, Zako1, true], [0.05, 0, 176, -95, 80, 3, Zako1, true], [0.7, 0, 176, 85, 120, 1, MBoss, true, 1], [0.05, 0, 176, 95, 100, 1, Zako1, true, 1], [0.05, 0, 176, 75, 100, 1, Zako1, true, 1], [0.05, 0, 176, 45, 120, 1, MBoss, true, 2], [0.05, 0, 176, 55, 100, 1, Zako1, true, 2], [0.05, 0, 176, 35, 100, 1, Zako1, true, 2], [0.05, 0, 176, 65, 120, 1, MBoss, true], [0.05, 0, 176, 15, 100, 1, Zako1, true], [0.05, 0, 176, 25, 120, 1, MBoss, true], [0.8, 0, 176, -85, 120, 3, MBoss, true, 3], [0.05, 0, 176, -95, 100, 3, Zako1, true, 3], [0.05, 0, 176, -75, 100, 3, Zako1, true, 3], [0.05, 0, 176, -45, 120, 3, MBoss, true, 4], [0.05, 0, 176, -55, 100, 3, Zako1, true, 4], [0.05, 0, 176, -35, 100, 3, Zako1, true, 4], [0.05, 0, 176, -65, 120, 3, MBoss, true], [0.05, 0, 176, -15, 100, 3, Zako1, true], [0.05, 0, 176, -25, 120, 3, MBoss, true]]];

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

},{"./gameobj":6,"./global":7,"./graphics":8}],5:[function(require,module,exports){
"use strict";
//var STAGE_MAX = 1;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.calcScreenSize = calcScreenSize;

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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
//import * as song from './song';

function calcScreenSize() {
  CONSOLE_WIDTH = window.innerWidth;
  CONSOLE_HEIGHT = window.innerHeight;
  if (CONSOLE_WIDTH >= CONSOLE_HEIGHT) {
    CONSOLE_WIDTH = CONSOLE_HEIGHT * sfg.VIRTUAL_WIDTH / sfg.VIRTUAL_HEIGHT;
    while (CONSOLE_WIDTH > window.innerWidth) {
      --CONSOLE_HEIGHT;
      CONSOLE_WIDTH = CONSOLE_HEIGHT * sfg.VIRTUAL_WIDTH / sfg.VIRTUAL_HEIGHT;
    }
  } else {
    CONSOLE_HEIGHT = CONSOLE_WIDTH * sfg.VIRTUAL_HEIGHT / sfg.VIRTUAL_WIDTH;
    while (CONSOLE_HEIGHT > window.innerHeight) {
      --CONSOLE_WIDTH;
      CONSOLE_HEIGHT = CONSOLE_WIDTH * sfg.VIRTUAL_HEIGHT / sfg.VIRTUAL_WIDTH;
    }
  }
  console.log(CONSOLE_WIDTH, CONSOLE_HEIGHT);
}

var CONSOLE_WIDTH;
var CONSOLE_HEIGHT;

var renderer;
var stats;
var scene;
var camera;
var author;
var progress;
var textPlane;
var basicInput = new io.BasicInput();
var tasks = new util.Tasks();
sfg.tasks = tasks;
var waveGraph;
var start = false;
var baseTime = +new Date();
var d = -0.2;
var audio_;
var sequencer;
var piano;
var score = 0;
var highScore = 0;
var highScores = [];
var isHidden = false;
//var stageNo = 1;
//var sfg.stage;
//var stageState = ;
var enemies_;
var enemyBullets;
var PI = Math.PI;
var comm_;
var handleName = '';
var storage;
var rank = -1;
var soundEffects;
var ens;
var enbs;

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

      if (this.difficulty < this.DIFFICULTY_MAX) {
        this.difficulty += 0.05;
      }

      if (this.privateNo >= this.MAX) {
        this.privateNo = 0;
      }
    }
  }]);

  return Stage;
}();

// hidden プロパティおよび可視性の変更イベントの名前を設定

var hidden, visibilityChange;
if (typeof document.hidden !== "undefined") {
  // Opera 12.10 や Firefox 18 以降でサポート
  hidden = "hidden";
  visibilityChange = "visibilitychange";
} else if (typeof document.mozHidden !== "undefined") {
  hidden = "mozHidden";
  visibilityChange = "mozvisibilitychange";
} else if (typeof document.msHidden !== "undefined") {
  hidden = "msHidden";
  visibilityChange = "msvisibilitychange";
} else if (typeof document.webkitHidden !== "undefined") {
  hidden = "webkitHidden";
  visibilityChange = "webkitvisibilitychange";
}

/// ブラウザの機能チェック
function checkBrowserSupport(output) {
  var content = '<img class="errorimg" src="http://public.blu.livefilestore.com/y2pbY3aqBz6wz4ah87RXEVk5ClhD2LujC5Ns66HKvR89ajrFdLM0TxFerYYURt83c_bg35HSkqc3E8GxaFD8-X94MLsFV5GU6BYp195IvegevQ/20131001.png?psid=1" width="479" height="640" class="alignnone" />';
  // WebGLのサポートチェック
  if (!Detector.webgl) {
    d3.select('#content').append('div').classed('error', true).html(content + '<p class="errortext">ブラウザが<br/>WebGLをサポートしていないため<br/>動作いたしません。</p>');
    return false;
  }

  // Web Audio APIラッパー
  if (!audio_.enable) {
    d3.select('#content').append('div').classed('error', true).html(content + '<p class="errortext">ブラウザが<br/>Web Audio APIをサポートしていないため<br/>動作いたしません。</p>');
    return false;
  }

  // ブラウザがPage Visibility API をサポートしない場合に警告
  if (typeof hidden === 'undefined') {
    d3.select('#content').append('div').classed('error', true).html(content + '<p class="errortext">ブラウザが<br/>Page Visibility APIをサポートしていないため<br/>動作いたしません。</p>');
    return false;
  }

  if (typeof localStorage === 'undefined') {
    d3.select('#content').append('div').classed('error', true).html(content + '<p class="errortext">ブラウザが<br/>Web Local Storageをサポートしていないため<br/>動作いたしません。</p>');
    return false;
  } else {
    storage = localStorage;
  }
  return true;
}

/// コンソール画面の初期化
function initConsole() {
  // レンダラーの作成
  renderer = new THREE.WebGLRenderer({ antialias: false, sortObjects: true });
  calcScreenSize();
  renderer.setSize(CONSOLE_WIDTH, CONSOLE_HEIGHT);
  renderer.setClearColor(0, 1);
  renderer.domElement.id = 'console';
  renderer.domElement.className = 'console';
  renderer.domElement.style.zIndex = 0;

  d3.select('#content').node().appendChild(renderer.domElement);

  window.addEventListener('resize', function () {
    calcScreenSize();
    renderer.setSize(CONSOLE_WIDTH, CONSOLE_HEIGHT);
  });
  // Stats オブジェクト(FPS表示)の作成表示
  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  d3.select('#content').node().appendChild(stats.domElement);
  stats.domElement.style.left = renderer.domElement.style.left;

  //2D描画コンテキストの表示

  /*      ctx = $('#info-display').css('z-index', 2);
        ctx = $('#info-display')[0].getContext('2d');
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.font = "12px 'ＭＳ ゴシック'";*/

  // シーンの作成
  scene = new THREE.Scene();

  // カメラの作成
  camera = new THREE.PerspectiveCamera(90.0, sfg.VIRTUAL_WIDTH / sfg.VIRTUAL_HEIGHT);
  camera.position.z = sfg.VIRTUAL_HEIGHT / 2;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  //var camera = new THREE.Camera();
  //camera.position.z = 1.0;

  // ライトの作成
  //var light = new THREE.DirectionalLight(0xffffff);
  //light.position = new THREE.Vector3(0.577, 0.577, 0.577);
  //scene.add(light);

  //var ambient = new THREE.AmbientLight(0xffffff);
  //scene.add(ambient);
  renderer.clear();
}

/// エラーで終了する。
function ExitError(e) {
  //ctx.fillStyle = "red";
  //ctx.fillRect(0, 0, CONSOLE_WIDTH, CONSOLE_HEIGHT);
  //ctx.fillStyle = "white";
  //ctx.fillText("Error : " + e, 0, 20);
  ////alert(e);
  start = false;
  throw e;
}

function onVisibilityChange() {
  var h = document[hidden];
  isHidden = h;
  if (h) {
    if (sfg.gameTimer.status == sfg.gameTimer.START) {
      sfg.gameTimer.pause();
      console.log(sfg.gameTimer.elapsedTime);
    }
    if (sequencer.status == sequencer.PLAY) {
      sequencer.pause();
    }
    //document.title = '(Pause) Galaxy Fight Game ';
  } else {
      if (sfg.gameTimer.status == sfg.gameTimer.PAUSE) {
        sfg.gameTimer.resume();
        console.log(sfg.gameTimer.elapsedTime);
      }
      if (sequencer.status == sequencer.PAUSE) {
        sequencer.resume();
      }
      //document.title = 'Galaxy Fight Game ';
      //game();
    }
}
/// 現在時間の取得
function getCurrentTime() {
  return audio_.audioctx.currentTime;
}

/// メイン
window.onload = function () {

  audio_ = new audio.Audio();

  if (!checkBrowserSupport('#content')) {
    return;
  }

  sequencer = new audio.Sequencer(audio_);
  //piano = new audio.Piano(audio_);
  soundEffects = new audio.SoundEffects(sequencer);

  document.addEventListener(visibilityChange, onVisibilityChange, false);
  sfg.gameTimer = new util.GameTimer(getCurrentTime);

  /// ゲームコンソールの初期化
  initConsole();
  // キー入力処理の設定 //
  //d3.select('body').on('keydown',function () { return basicInput.keydown(d3.event); });
  //d3.select('body').on('keyup',function () { return basicInput.keyup(d3.event); });

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
  progress = new graphics.Progress();
  progress.mesh.position.z = 0.001;
  progress.render('Loading Resouces ...', 0);
  scene.add(progress.mesh);
  for (var n in textures) {
    (function (name, texPath) {
      loadPromise = loadPromise.then(function () {
        return loadTexture('./res/' + texPath);
      }).then(function (tex) {
        texCount++;
        progress.render('Loading Resouces ...', texCount / texLength * 100 | 0);
        sfg.textureFiles[name] = tex;
        renderer.render(scene, camera);
        return Promise.resolve();
      });
    })(n, textures[n]);
  }

  loadPromise.then(function () {
    scene.remove(progress.mesh);
    renderer.render(scene, camera);
    tasks.clear();
    tasks.pushTask(init);
    tasks.pushTask(render, 100000);
    start = true;
    game();
  });
};

/// ゲームメイン
function game() {
  // タスクの呼び出し
  // メインに描画
  if (start) {
    requestAnimationFrame(game);
  }

  if (!isHidden) {
    try {
      tasks.checkSort();
      var arr = tasks.getArray();
      for (var i = 0; i < arr.length; ++i) {
        var task = arr[i];
        if (task != util.nullTask) {
          task.func(task.index);
        }
      }
      tasks.compress();
    } catch (e) {
      ExitError(e);
    }
  }
};

function render(taskIndex) {
  renderer.render(scene, camera);
  textPlane.render();
  stats.update();
}

function init(taskIndex) {

  scene = new THREE.Scene();
  enemyBullets = new enemies.EnemyBullets(scene, se);
  enemies_ = new enemies.Enemies(scene, se, enemyBullets);
  sfg.bombs = new effectobj.Bombs(scene, se);
  sfg.stage = new Stage();
  spaceField = null;

  // ハンドルネームの取得
  handleName = storage.getItem('handleName');

  textPlane = new text.TextPlane(scene);
  // textPlane.print(0, 0, "Web Audio API Test", new TextAttribute(true));
  // スコア情報 通信用
  comm_ = new comm.Comm();
  comm_.updateHighScores = function (data) {
    highScores = data;
    highScore = highScores[0].score;
  };

  comm_.updateHighScore = function (data) {
    if (highScore < data.score) {
      highScore = data.score;
      printScore();
    }
  };

  // scene.add(textPlane.mesh);

  //作者名パーティクルを作成
  {
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
    var material = new THREE.PointsMaterial({
      size: 20, blending: THREE.AdditiveBlending,
      transparent: true, vertexColors: true, depthTest: false //, map: texture
    });

    author = new THREE.Points(geometry, material);
    //    author.position.x author.position.y=  =0.0, 0.0, 0.0);

    //mesh.sortParticles = false;
    //var mesh1 = new THREE.ParticleSystem();
    //mesh.scale.x = mesh.scale.y = 8.0;

    basicInput.bind();
    scene.add(author);
  }

  tasks.setNextTask(taskIndex, printAuthor());
}

/// 作者表示
function printAuthor() {
  var step = 0;
  var count = 1.0;
  var wait = 60;
  var proc_count = 0;
  basicInput.keyBuffer.length = 0;
  return function (taskIndex) {

    // 何かキー入力があった場合は次のタスクへ
    if (basicInput.keyBuffer.length > 0) {
      basicInput.keyBuffer.length = 0;
      step = 4;
    }

    switch (step) {
      // フェード・イン
      case 0:
        if (count <= 0.01) {
          count -= 0.0005;
        } else {
          count -= 0.0025;
        }
        if (count < 0.0) {
          author.rotation.x = author.rotation.y = author.rotation.z = 0.0;
          var end = author.geometry.vertices.length;

          for (var i = 0; i < end; ++i) {
            author.geometry.vertices[i].x = author.geometry.vert_end[i].x;
            author.geometry.vertices[i].y = author.geometry.vert_end[i].y;
            author.geometry.vertices[i].z = author.geometry.vert_end[i].z;
          }
          author.geometry.verticesNeedUpdate = true;
          step++;
        } else {
          var end = author.geometry.vertices.length;
          var v = author.geometry.vertices;
          var d = author.geometry.vert_start;
          var v2 = author.geometry.vert_end;
          for (var i = 0; i < end; ++i) {
            v[i].x = v2[i].x + d[i].x * count;
            v[i].y = v2[i].y + d[i].y * count;
            v[i].z = v2[i].z + d[i].z * count;
          }
          author.geometry.verticesNeedUpdate = true;
          author.rotation.x = author.rotation.y = author.rotation.z = count * 4.0;
          author.material.opacity = 1.0;
        }
        break;
      // 待ち
      case 1:
        if (author.material.size > 2) {
          author.material.size -= 0.5;
          author.material.needsUpdate = true;
        }
        if (! --wait) step++;
        break;
      //フェードアウト
      case 2:
        count += 0.05;
        author.material.opacity = 1.0 - count;
        if (count >= 1.0) {
          count = 1.0;
          wait = 60;
          step++;
        }
        break;
      // 少し待ち
      case 3:
        if (! --wait) {
          wait = 60;
          step++;
        }
        break;
      // 次のタスクへ
      case 4:
        {
          scene.remove(author);
          //scene.needsUpdate = true;
          tasks.setNextTask(taskIndex, initTitle);
        }
        break;
    }

    //progress.render("proccesing", count * 100);

    //ctx.fillStyle = "rgba(127,127,0,1.0)";
    //ctx.fillRect(0, 0, CONSOLE_WIDTH, CONSOLE_HEIGHT);
    //var backup = ctx.globalAlpha;
    //ctx.globalAlpha = count;
    //ctx.drawImage(imageFiles.font.image, (CONSOLE_WIDTH - imageFiles.font.image.width) / 2, (CONSOLE_HEIGHT - imageFiles.font.image.height) / 2);
    //ctx.globalAlpha = backup;
  };
}

var title; // タイトルメッシュ
var spaceField; // 宇宙空間パーティクル

/// タイトル画面初期化 ///
function initTitle(taskIndex) {
  basicInput.clear();

  // タイトルメッシュの作成・表示 ///
  var material = new THREE.MeshBasicMaterial({ map: sfg.textureFiles.title });
  material.shading = THREE.FlatShading;
  //material.antialias = false;
  material.transparent = true;
  material.alphaTest = 0.5;
  material.depthTest = true;
  title = new THREE.Mesh(new THREE.PlaneGeometry(sfg.textureFiles.title.image.width, sfg.textureFiles.title.image.height), material);
  title.scale.x = title.scale.y = 0.8;
  title.position.y = 80;
  scene.add(title);

  /// 背景パーティクル表示
  if (!spaceField) {
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

    spaceField = new THREE.Points(geometry, material);
    spaceField.position.x = spaceField.position.y = spaceField.position.z = 0.0;
    scene.add(spaceField);
    tasks.pushTask(moveSpaceField);
  }

  /// テキスト表示
  textPlane.print(3, 25, "Push z key to Start Game", new text.TextAttribute(true));
  sfg.gameTimer.start();
  showTitle.endTime = sfg.gameTimer.elapsedTime + 10 /*秒*/;
  tasks.setNextTask(taskIndex, showTitle);
}

/// 宇宙空間の表示
function moveSpaceField(taskIndex) {
  var verts = spaceField.geometry.vertices;
  var endys = spaceField.geometry.endy;
  for (var i = 0, end = verts.length; i < end; ++i) {
    verts[i].y -= 4;
    if (verts[i].y < -endys[i]) {
      verts[i].y = endys[i];
    }
  }
  spaceField.geometry.verticesNeedUpdate = true;
}

/// タイトル表示
function showTitle(taskIndex) {
  sfg.gameTimer.update();

  if (basicInput.keyCheck.z) {
    scene.remove(title);
    tasks.setNextTask(taskIndex, initHandleName);
  }
  if (showTitle.endTime < sfg.gameTimer.elapsedTime) {
    scene.remove(title);
    tasks.setNextTask(taskIndex, initTop10);
  }
}

var editHandleName = null;
/// ハンドルネームのエントリ前初期化
function initHandleName(taskIndex) {
  if (editHandleName != null) {
    tasks.setNextTask(taskIndex, gameInit);
  } else {
    editHandleName = handleName || '';
    textPlane.cls();
    textPlane.print(4, 18, 'Input your handle name.');
    textPlane.print(8, 19, '(Max 8 Char)');
    textPlane.print(10, 21, editHandleName);
    //    textPlane.print(10, 21, handleName[0], TextAttribute(true));
    basicInput.unbind();
    var elm = d3.select('#content').append('input');
    elm.attr('type', 'text').attr('pattern', '[a-zA-Z0-9_\@\#\$\-]{0,8}').attr('maxlength', 8).attr('id', 'input-area').attr('value', editHandleName).on('blur', function () {
      d3.event.preventDefault();
      d3.event.stopImmediatePropagation();
      setTimeout(function () {
        this.focus();
      }, 10);
      return false;
    }).on('keyup', function (e) {
      if (d3.event.keyCode == 13) {
        editHandleName = this.value;
        var s = this.selectionStart;
        var e = this.selectionEnd;
        textPlane.print(10, 21, editHandleName);
        textPlane.print(10 + s, 21, '_', new text.TextAttribute(true));
        d3.select(this).on('keyup', null);
        basicInput.bind();
        tasks.setNextTask(taskIndex, gameInit);
        storage.setItem('handleName', editHandleName);
        d3.select('#input-area').remove();
        return false;
      }
      editHandleName = this.value;
      var s = this.selectionStart;
      textPlane.print(10, 21, '           ');
      textPlane.print(10, 21, editHandleName);
      textPlane.print(10 + s, 21, '_', new text.TextAttribute(true));
    }).node().focus();
    tasks.setNextTask(taskIndex, inputHandleName);
  }
}

/// ハンドルネームのエントリ
function inputHandleName(taskIndex) {}

/// スコア加算
function addScore(s) {
  score += s;
  if (score > highScore) {
    highScore = score;
  }
}

sfg.addScore = addScore;

/// スコア表示
function printScore() {
  var s = '00000000' + score.toString();
  s = s.substr(s.length - 8, 8);

  textPlane.print(1, 1, s);

  var h = '00000000' + highScore.toString();
  h = h.substr(h.length - 8, 8);
  textPlane.print(12, 1, h);
}

function se(index) {
  sequencer.playTracks(soundEffects.soundEffects[index]);
}

/// ハイスコア表示

/// ゲームの初期化
function gameInit(taskIndex) {

  // オーディオの開始
  audio_.start();
  sequencer.load(audio.seqData);
  sequencer.start();
  sfg.stage.reset();
  textPlane.cls();

  enemies_.reset();

  // 自機の初期化
  sfg.myship_ = new myship.MyShip(0, -100, 0.1, scene, se);
  sfg.gameTimer.start();
  score = 0;
  textPlane.print(2, 0, 'Score    High Score');
  textPlane.print(20, 39, 'Rest:   ' + sfg.myship_.rest);
  printScore();
  tasks.setNextTask(taskIndex, stageInit /*gameAction*/);
}

/// ステージの初期化
function stageInit(taskIndex) {
  textPlane.print(0, 39, 'Stage:' + sfg.stage.no);
  sfg.gameTimer.start();
  enemies_.reset();
  enemies_.start();
  enemies_.calcEnemiesCount(sfg.stage.privateNo);
  enemies_.hitEnemiesCount = 0;
  textPlane.print(8, 15, 'Stage ' + sfg.stage.no + ' Start !!', new text.TextAttribute(true));
  stageStart.endTime = sfg.gameTimer.elapsedTime + 2;
  tasks.setNextTask(taskIndex, stageStart /*gameAction*/);
}

/// ステージ開始
function stageStart(taskIndex) {
  sfg.gameTimer.update();
  sfg.myship_.action(basicInput);
  if (stageStart.endTime < sfg.gameTimer.elapsedTime) {
    textPlane.print(8, 15, '                  ', new text.TextAttribute(true));
    tasks.setNextTask(taskIndex, gameAction, 5000);
  }
}

/// 自機の動きを制御する
function gameAction(taskIndex) {
  printScore();
  sfg.myship_.action(basicInput);
  sfg.gameTimer.update();
  //console.log(sfg.gameTimer.elapsedTime);
  enemies_.move();

  if (!processCollision()) {
    if (enemies_.hitEnemiesCount == enemies_.totalEnemiesCount) {
      printScore();
      sfg.stage.advance();
      tasks.setNextTask(taskIndex, stageInit);
    }
  } else {
    myShipBomb.endTime = sfg.gameTimer.elapsedTime + 3;
    tasks.setNextTask(taskIndex, myShipBomb);
  };
}

/// 当たり判定
function processCollision(taskIndex) {
  //　自機弾と敵とのあたり判定
  var myBullets = sfg.myship_.myBullets;
  ens = enemies_.enemies;
  for (var i = 0, end = myBullets.length; i < end; ++i) {
    var myb = myBullets[i];
    if (myb.enable_) {
      var mybco = myBullets[i].collisionArea;
      var left = mybco.left + myb.x;
      var right = mybco.right + myb.x;
      var top = mybco.top + myb.y;
      var bottom = mybco.bottom - myb.speed + myb.y;
      for (var j = 0, endj = ens.length; j < endj; ++j) {
        var en = ens[j];
        if (en.enable_) {
          var enco = en.collisionArea;
          if (top > en.y + enco.bottom && en.y + enco.top > bottom && left < en.x + enco.right && en.x + enco.left < right) {
            myb.enable_ = false;
            en.hit();
            break;
          }
        }
      }
    }
  }

  // 敵と自機とのあたり判定
  if (sfg.CHECK_COLLISION) {
    var myco = sfg.myship_.collisionArea;
    var left = sfg.myship_.x + myco.left;
    var right = myco.right + sfg.myship_.x;
    var top = myco.top + sfg.myship_.y;
    var bottom = myco.bottom + sfg.myship_.y;

    for (var i = 0, end = ens.length; i < end; ++i) {
      var en = ens[i];
      if (en.enable_) {
        var enco = en.collisionArea;
        if (top > en.y + enco.bottom && en.y + enco.top > bottom && left < en.x + enco.right && en.x + enco.left < right) {
          en.hit();
          sfg.myship_.hit();
          return true;
        }
      }
    }
    // 敵弾と自機とのあたり判定
    enbs = enemyBullets.enemyBullets;
    for (var i = 0, end = enbs.length; i < end; ++i) {
      var en = enbs[i];
      if (en.enable) {
        var enco = en.collisionArea;
        if (top > en.y + enco.bottom && en.y + enco.top > bottom && left < en.x + enco.right && en.x + enco.left < right) {
          en.hit();
          sfg.myship_.hit();
          return true;
        }
      }
    }
  }
  return false;
}

/// 自機爆発
function myShipBomb(taskIndex) {
  sfg.gameTimer.update();
  enemies_.move();
  if (sfg.gameTimer.elapsedTime > myShipBomb.endTime) {
    sfg.myship_.rest--;
    if (sfg.myship_.rest == 0) {
      textPlane.print(10, 18, 'GAME OVER', new text.TextAttribute(true));
      printScore();
      textPlane.print(20, 39, 'Rest:   ' + sfg.myship_.rest);
      comm_.socket.on('sendRank', checkRankIn);
      comm_.sendScore(new ScoreEntry(editHandleName, score));
      gameOver.endTime = sfg.gameTimer.elapsedTime + 5;
      rank = -1;
      tasks.setNextTask(taskIndex, gameOver);
    } else {
      sfg.myship_.mesh.visible = true;
      textPlane.print(20, 39, 'Rest:   ' + sfg.myship_.rest);
      textPlane.print(8, 15, 'Stage ' + sfg.stage.no + ' Start !!', new text.TextAttribute(true));
      stageStart.endTime = sfg.gameTimer.elapsedTime + 2;
      tasks.setNextTask(taskIndex, stageStart /*gameAction*/);
    }
  }
}

/// ゲームオーバー
function gameOver(taskIndex) {
  sfg.gameTimer.update();
  if (gameOver.endTime < sfg.gameTimer.elapsedTime) {
    textPlane.cls();
    enemies_.reset();
    enemyBullets.reset();
    if (rank >= 0) {
      tasks.setNextTask(taskIndex, initTop10);
    } else {
      tasks.setNextTask(taskIndex, initTitle);
    }
  }
}

/// ランキングしたかどうかのチェック
function checkRankIn(data) {
  rank = data.rank;
}

/// ハイスコアエントリの表示
function printTop10() {
  var rankname = [' 1st', ' 2nd', ' 3rd', ' 4th', ' 5th', ' 6th', ' 7th', ' 8th', ' 9th', '10th'];
  textPlane.print(8, 4, 'Top 10 Score');
  var y = 8;
  for (var i = 0, end = highScores.length; i < end; ++i) {
    var scoreStr = '00000000' + highScores[i].score;
    scoreStr = scoreStr.substr(scoreStr.length - 8, 8);
    if (rank == i) {
      textPlane.print(3, y, rankname[i] + ' ' + scoreStr + ' ' + highScores[i].name, new text.TextAttribute(true));
    } else {
      textPlane.print(3, y, rankname[i] + ' ' + scoreStr + ' ' + highScores[i].name);
    }
    y += 2;
  }
}

function initTop10(taskIndex) {
  textPlane.cls();
  printTop10();
  showTop10.endTime = sfg.gameTimer.elapsedTime + 5;
  tasks.setNextTask(taskIndex, showTop10);
}

function showTop10(taskIndex) {
  sfg.gameTimer.update();
  if (showTop10.endTime < sfg.gameTimer.elapsedTime || basicInput.keyBuffer.length > 0) {
    basicInput.keyBuffer.length = 0;
    textPlane.cls();
    tasks.setNextTask(taskIndex, initTitle);
  }
}

},{"./audio":1,"./comm":2,"./effectobj":3,"./enemies":4,"./gameobj":6,"./global":7,"./graphics":8,"./io":9,"./myship":10,"./text":11,"./util":12}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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
var textureFiles = exports.textureFiles = {};
var stage = exports.stage = undefined;
var tasks = exports.tasks = undefined;
var gameTimer = exports.gameTimer = undefined;
var bombs = exports.bombs = undefined;
var addScore = exports.addScore = undefined;
var myship_ = exports.myship_ = undefined;
var textureRoot = exports.textureRoot = './res/';

},{}],8:[function(require,module,exports){
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

},{"./global":7}],9:[function(require,module,exports){
"use strict";

// キー入力

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BasicInput = BasicInput;
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

    if (e.keyCode == 192) {
      CHECK_COLLISION = !CHECK_COLLISION;
    };

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
    d3.select('body').on('keydown', this.keydown.bind(this));
    d3.select('body').on('keyup', this.keyup.bind(this));
  },
  // アンバインドする
  unbind: function unbind() {
    d3.select('body').on('keydown', null);
    d3.select('body').on('keyup', null);
  }
};

},{}],10:[function(require,module,exports){
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
    value: function move(taskIndex) {
      if (!this.enable_) {
        this.mesh.visible = false;
        sfg.tasks.removeTask(taskIndex);
        return;
      }

      this.y += this.dy;
      this.x += this.dx;

      if (this.y > sfg.V_TOP + 16 || this.y < sfg.V_BOTTOM - 16 || this.x > sfg.V_RIGHT + 16 || this.x < sfg.V_LEFT - 16) {
        sfg.tasks.removeTask(taskIndex);
        this.enable_ = this.mesh.visible = false;
      };
    }
  }, {
    key: 'start',
    value: function start(x, y, z, aimRadian) {
      if (this.enable_) {
        return false;
      }
      this.x = x;
      this.y = y;
      this.z = z - 0.1;
      this.dx = Math.cos(aimRadian) * this.speed;
      this.dy = Math.sin(aimRadian) * this.speed;
      this.enable_ = this.mesh.visible = true;
      this.se(0);
      //sequencer.playTracks(soundEffects.soundEffects[0]);
      var self = this;
      sfg.tasks.pushTask(function (i) {
        self.move(i);
      });
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
    return _this2;
  }

  _createClass(MyShip, [{
    key: 'shoot',
    value: function shoot(aimRadian) {
      for (var i = 0, end = this.myBullets.length; i < end; ++i) {
        if (this.myBullets[i].start(this.x, this.y, this.z, aimRadian)) {
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

},{"./gameobj":6,"./global":7,"./graphics":8}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TextAttribute = TextAttribute;
exports.TextPlane = TextPlane;

var _global = require('./global');

var sfg = _interopRequireWildcard(_global);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

//import *  as gameobj from './gameobj';
//import * as graphics from './graphics';

/// テキスト属性
function TextAttribute(blink, font) {
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
}

/// テキストプレーン
function TextPlane(scene) {
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

TextPlane.prototype = {
  constructor: TextPlane,
  /// 画面消去
  cls: function cls() {
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
  },

  /// 文字表示する
  print: function print(x, y, str, attribute) {
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
  },
  /// テキストデータをもとにテクスチャーに描画する
  render: function render() {
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
};

},{"./global":7}],12:[function(require,module,exports){

"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Task = exports.Task = function Task(func, priority) {
  _classCallCheck(this, Task);

  this.priority = priority || 10000;
  this.func = func;
  this.index = 0;
};

var nullTask = exports.nullTask = new Task(null);

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
    value: function setNextTask(index, func, priority) {
      var t = new Task(func, priority);
      t.index = index;
      this.array[index] = t;
      this.needSort = true;
    }
  }, {
    key: "pushTask",
    value: function pushTask(func, priority) {
      var t = new Task(func, priority);
      for (var i = 0; i < this.array.length; ++i) {
        if (this.array[i] == nullTask) {
          this.array[i] = t;
          t.index = i;
          return t;
        }
      }
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
    value: function process() {}
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

},{}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGpzXFxhdWRpby5qcyIsInNyY1xcanNcXGNvbW0uanMiLCJzcmNcXGpzXFxlZmZlY3RvYmouanMiLCJzcmNcXGpzXFxlbmVtaWVzLmpzIiwic3JjXFxqc1xcZ2FtZS5qcyIsInNyY1xcanNcXGdhbWVvYmouanMiLCJzcmNcXGpzXFxnbG9iYWwuanMiLCJzcmNcXGpzXFxncmFwaGljcy5qcyIsInNyY1xcanNcXGlvLmpzIiwic3JjXFxqc1xcbXlzaGlwLmpzIiwic3JjXFxqc1xcdGV4dC5qcyIsInNyY1xcanNcXHV0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUNNQSxZQUFZOztBQUFDOzs7Ozs7UUEwQkcsU0FBUyxHQUFULFNBQVM7UUE0QlQsVUFBVSxHQUFWLFVBQVU7UUFRVix5QkFBeUIsR0FBekIseUJBQXlCO1FBbUN6QixXQUFXLEdBQVgsV0FBVztRQWdDWCxpQkFBaUIsR0FBakIsaUJBQWlCO1FBcUNqQixLQUFLLEdBQUwsS0FBSztRQStETCxLQUFLLEdBQUwsS0FBSztRQXVFTCxJQUFJLEdBQUosSUFBSTtRQXdiSixTQUFTLEdBQVQsU0FBUztRQXdLVCxZQUFZLEdBQVosWUFBWTtBQTE0QjVCLElBQUksR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztBQUMvQixJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUM7QUFDdkIsSUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDOztBQUVuQixJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7QUFDbEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFO0FBQzdCLFVBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDcEM7O0FBRUQsSUFBSSxVQUFVLEdBQUc7QUFDZixNQUFJLEVBQUUsQ0FBQztBQUNQLFVBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztDQUMzRTs7QUFBQyxBQUVGLElBQUksT0FBTyxHQUFHO0FBQ1osTUFBSSxFQUFFLENBQUM7QUFDUCxVQUFRLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7Q0FDM0Y7O0FBQUMsQUFFRixJQUFJLE9BQU8sR0FBRztBQUNaLE1BQUksRUFBRSxDQUFDO0FBQ1AsVUFBUSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQzNGLENBQUM7O0FBRUssU0FBUyxTQUFTLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRTtBQUN2QyxNQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7QUFDYixNQUFJLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNyQixNQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDVixNQUFJLE9BQU8sR0FBRyxDQUFDLElBQUssSUFBSSxHQUFH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R0FBRyxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7R0FFNUM7Q0FDRixDQUFBOztBQUVELElBQ0UsQ0FBQyxHQUFJLElBQUksSUFBSSxDQUFFLENBQUMsRUFBQyxJQUFJLENBQUM7SUFDdEIsRUFBRSxHQUFHLElBQUksSUFBSSxDQUFFLENBQUMsRUFBQyxJQUFJLENBQUM7SUFDdEIsQ0FBQyxHQUFJLElBQUksSUFBSSxDQUFFLENBQUMsRUFBQyxJQUFJLENBQUM7SUFDdEIsRUFBRSxHQUFHLElBQUksSUFBSSxDQUFFLENBQUMsRUFBQyxJQUFJLENBQUM7SUFDdEIsQ0FBQyxHQUFJLElBQUksSUFBSSxDQUFFLENBQUMsRUFBQyxJQUFJLENBQUM7SUFDdEIsQ0FBQyxHQUFJLElBQUksSUFBSSxDQUFFLENBQUMsRUFBQyxJQUFJLENBQUM7SUFDdEIsRUFBRSxHQUFHLElBQUksSUFBSSxDQUFFLENBQUMsRUFBQyxJQUFJLENBQUM7SUFDdEIsQ0FBQyxHQUFJLElBQUksSUFBSSxDQUFFLENBQUMsRUFBQyxJQUFJLENBQUM7SUFDdEIsRUFBRSxHQUFHLElBQUksSUFBSSxDQUFFLENBQUMsRUFBQyxJQUFJLENBQUM7SUFDdEIsQ0FBQyxHQUFJLElBQUksSUFBSSxDQUFFLENBQUMsRUFBQyxJQUFJLENBQUM7SUFDdEIsRUFBRSxHQUFHLElBQUksSUFBSSxDQUFDLEVBQUUsRUFBQyxJQUFJLENBQUM7SUFDdEIsQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUM7Ozs7QUFBQyxBQUl6QixTQUFTLE9BQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUMzQztBQUNFLE1BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLE1BQUksQ0FBQyxHQUFHLEdBQUcsR0FBRzs7QUFBQyxBQUVmLE1BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLE1BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFD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QUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNyRCxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDM0IsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUNOO0dBQ0osRUFDRDtBQUNFLFFBQUksRUFBRSxPQUFPO0FBQ2IsV0FBTyxFQUFFLENBQUM7QUFDVixRQUFJLEVBQ0YsQ0FDQSxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEVBQzFCLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFDL0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxDQUFDLEVBQ2QsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxFQUFFLEVBQUUsQ0FBQyxFQUN0RCxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNsQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQ047R0FDSixDQUNGO0NBQ0YsQ0FBQTs7QUFFTSxTQUFTLFlBQVksQ0FBQyxTQUFTLEVBQUU7QUFDckMsTUFBSSxDQUFDLFlBQVksR0FDaEI7O0FBRUEsY0FBWSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUMsQ0FDNUI7QUFDRSxXQUFPLEVBQUUsQ0FBQztBQUNWLFdBQU8sRUFBQyxJQUFJO0FBQ1osUUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUNoQixHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDLEVBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQzNIO0dBQ0YsRUFDRDtBQUNFLFdBQU8sRUFBRSxDQUFDO0FBQ1YsV0FBTyxFQUFFLElBQUk7QUFDYixRQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQ2hCLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQzNJO0dBQ0YsQ0FDQSxDQUFDOztBQUVGLGNBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUN6QixDQUNFO0FBQ0UsV0FBTyxFQUFFLEVBQUU7QUFDWCxXQUFPLEVBQUUsSUFBSTtBQUNiLFFBQUksRUFBRSxDQUNMLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsRUFDekUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FDdEc7R0FD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LElBQUksVUFBVSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQzdELElBQUksSUFBSSxFQUFFLEVBQ1YsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUN2RCxJQUFJLFFBQVEsRUFBRSxFQUNkLElBQUksUUFBUSxFQUFFLEVBQ2QsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBQyxDQUFDLEVBQUMsRUFBRSxFQUFDLENBQUMsRUFBQyxLQUFLLENBQUMsRUFDcEMsSUFBSSxVQUFVLENBQUMsQ0FBQyxFQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUMsR0FBRyxFQUFDLENBQUMsRUFBQyxLQUFLLENBQUMsRUFDOUMsSUFBSSxJQUFJLEVBQUUsRUFDVixJQUFJLFVBQVUsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFDbEUsSUFBSSxVQUFVLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxHQUFHLEVBQUMsSUFBSSxDQUFDLEVBQ3ZELElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUNkO0FBQ0MsQ0FDRSxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQ3RELElBQUksVUFBVSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQzdELElBQUksSUFBSSxFQUFFLEVBQ1YsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUN2RCxJQUFJLFFBQVEsRUFBRSxFQUNkLElBQUksUUFBUSxFQUFFLEVBQ2QsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBQyxDQUFDLEVBQUMsRUFBRSxFQUFDLENBQUMsRUFBQyxLQUFLLENBQUMsRUFDcEMsSUFBSSxVQUFVLENBQUMsQ0FBQyxFQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUMsR0FBRyxFQUFDLENBQUMsRUFBQyxLQUFLLENBQUMsRUFDOUMsSUFBSSxJQUFJLEVBQUUsRUFDVixJQUFJLFVBQVUsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsRUFDaEUsSUFBSSxVQUFVLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQ3pELElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUNaO0FBQ0QsQ0FDRSxJQUFJLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUNsRCxJQUFJLFVBQVUsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsRUFDaEUsSUFBSSxJQUFJLEVBQUUsRUFDVixJQUFJLFVBQVUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFBLEdBQUksSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUNsRSxJQUFJLFFBQVEsRUFBRSxFQUNkLElBQUksUUFBUSxFQUFFLEVBQ2QsSUFBSSxVQUFVLENBQUMsQ0FBQyxFQUFDLElBQUksQ0FBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsRUFDbkMsSUFBSSxVQUFVLENBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUN2RCxJQUFJLElBQUksRUFBRSxFQUNWLElBQUksVUFBVSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEVBQy9ELElBQUksVUFBVSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEdBQUcsRUFBQyxLQUFLLENBQUMsRUFDeEQsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQ1o7QUFDRCxDQUNFLElBQUksVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQ2xELElBQUksVUFBVSxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUNoRSxJQUFJLElBQUksRUFBRSxFQUNWLElBQUksVUFBVSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUEsR0FBSSxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQ2xFLElBQUksSUFBSSxFQUFFLEVBQ1YsSUFBSSxRQUFRLEVBQUUsRUFDZCxJQUFJLFFBQVEsRUFBRSxFQUNkLElBQUksVUFBVSxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLEVBQ25DLElBQUksVUFBVSxDQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsRUFDdkQsSUFBSSxJQUFJLEVBQUUsRUFDVixJQUFJLFVBQVUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUM3RCxJQUFJLFVBQVUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxDQUFDLEVBQUMsS0FBSyxDQUFDLEVBQ3RELElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUNaLEVBQ0Q7QUFDRSxJQUFJLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUNqRCxJQUFJLFVBQVUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQ3JELElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsRUFDckQsSUFBSSxRQUFRLEVBQUUsRUFDZCxJQUFJLFFBQVEsRUFBRSxFQUNkLElBQUksVUFBVSxDQUFDLENBQUMsRUFBRSxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUNoRCxJQUFJLFVBQVUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQ3JELElBQUksSUFBSSxFQUFFLEVBQ1YsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUNwRCxJQUFJLFVBQVUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUM1RCxJQUFJLFVBQVUsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQ3pELElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUNaLEVBQ0Q7QUFDRSxJQUFJLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUNsRCxJQUFJLFVBQVUsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsRUFDaEUsSUFBSSxVQUFVLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEFBQUMsQ0FBQyxHQUFJLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsRUFDM0QsSUFBSSxRQUFRLEVBQUUsRUFDZCxJQUFJLFFBQVEsRUFBRSxFQUNkLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsRUFDdkQsSUFBSSxVQUFVLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQ2hELElBQUksSUFBSSxFQUFFLEVBQ1YsSUFBSSxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsRUFDaEQsSUFBSSxVQUFVLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsRUFDM0QsSUFBSSxVQUFVLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsRUFDdkQsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQ1osRUFDRDtBQUNFLElBQUksVUFBVSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsRUFDcEQsSUFBSSxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQzNDLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsRUFDckQsSUFBSSxRQUFRLEVBQUUsRUFDZCxJQUFJLFFBQVEsRUFBRSxFQUNkLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBQyxDQUFDLEVBQUMsS0FBSyxDQUFDLEVBQ3BDLElBQUksVUFBVSxDQUFDLENBQUMsRUFBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFDLEdBQUcsRUFBQyxDQUFDLEVBQUMsS0FBSyxDQUFDLEVBQzlDLElBQUksSUFBSSxFQUFFLEVBQ1YsSUFBSSxVQUFVLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQ2xFLElBQUksVUFBVSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsR0FBRyxFQUFDLElBQUksQ0FBQyxFQUN2RCxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FDWixFQUNEO0FBQ0UsSUFBSSxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsRUFDakQsSUFBSSxJQUFJLEVBQUUsRUFDVixJQUFJLFVBQVUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQ3JELElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsRUFDckQsSUFBSSxVQUFVLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUN2RCxJQUFJLFFBQVEsRUFBRSxFQUNkLElBQUksUUFBUSxFQUFFLEVBQ2QsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsRUFDeEMsSUFBSSxJQUFJLEVBQUUsRUFDVixJQUFJLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUNsRCxJQUFJLFVBQVUsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFDbEUsSUFBSSxVQUFVLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEVBQzNELElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUNaLENBQ0YsQ0FDQTtBQUNELE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLENBQzNCOztBQUVFLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUNyQyxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFDdEMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQ3RDLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUN0QyxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUV4QyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFDeEMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQ3pDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUN6QyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFDekMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFFM0MsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFDdkMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFDeEMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFDeEMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFDeEMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFFeEMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFDMUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFDM0MsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFDM0MsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFDM0MsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFFM0MsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQ3JDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUN0QyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsRUFDdEMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQ3RDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUV0QyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUN0QyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUN2QyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUN2QyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUN2QyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUV2QyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDLEVBQ3hDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUMsRUFDekMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxFQUN6QyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDLEVBQ3pDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUMsRUFDekMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxFQUN6QyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsRUFDdkMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQ3ZDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUV2QyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUMsRUFDekMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDLEVBQzFDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxFQUMxQyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUMsRUFDMUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDLEVBQzFDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxFQUMxQyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUN4QyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsR0FB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QUFBQyxNQUFNLEdBQUcsVUFBVSxHQUFJLENBQUMsQ0FBQSxBQUFDLENBQUM7QUFDcEQsTUFBSSxJQUFJLEdBQUcsTUFBTSxHQUFHLFVBQVUsQ0FBQztBQUMvQixNQUFJLEtBQUssR0FBRyxTQUFTLEdBQUcsS0FBSyxDQUFDO0FBQzlCLE1BQUksS0FBSyxHQUFHLFVBQVUsR0FBRyxNQUFNLENBQUM7QUFDaEMsTUFBSSxHQUFHLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFdkMsS0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxBQUFDLElBQUksR0FBSSxLQUFLLENBQUM7QUFDMUIsS0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxBQUFDLElBQUksR0FBSSxLQUFLLENBQUM7QUFDMUIsS0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUEsR0FBSSxLQUFLLENBQUM7QUFDOUIsS0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUEsR0FBSSxLQUFLLENBQUM7QUFDOUIsS0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUEsR0FBSSxLQUFLLENBQUM7QUFDOUIsS0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxBQUFDLElBQUksR0FBSSxLQUFLLENBQUM7O0FBRTFCLEtBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUVuQyxLQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEFBQUMsSUFBSSxHQUFJLEtBQUssQ0FBQztBQUMxQixLQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEFBQUMsSUFBSSxHQUFJLEtBQUssQ0FBQztBQUMxQixLQUFHLENBQUMsQ0FB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T0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7QUFDNUMsVUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7QUFDckQsVUFBSSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUM7S0FDNUI7OztTQXpDVSxTQUFTIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJncmFwaGljcy5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJpby5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJzb25nLmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInRleHQuanNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwidXRpbC5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJkc3AuanNcIiAvPlxyXG5cInVzZSBzdHJpY3RcIjtcclxuLy8vLyBXZWIgQXVkaW8gQVBJIOODqeODg+ODkeODvOOCr+ODqeOCuSAvLy8vXHJcbnZhciBmZnQgPSBuZXcgRkZUKDQwOTYsIDQ0MTAwKTtcclxudmFyIEJVRkZFUl9TSVpFID0gMTAyNDtcclxudmFyIFRJTUVfQkFTRSA9IDk2O1xyXG5cclxudmFyIG5vdGVGcmVxID0gW107XHJcbmZvciAodmFyIGkgPSAtODE7IGkgPCA0NjsgKytpKSB7XHJcbiAgbm90ZUZyZXEucHVzaChNYXRoLnBvdygyLCBpIC8gMTIpKTtcclxufVxyXG5cclxudmFyIFNxdWFyZVdhdmUgPSB7XHJcbiAgYml0czogNCxcclxuICB3YXZlZGF0YTogWzB4ZiwgMHhmLCAweGYsIDB4ZiwgMHhmLCAweGYsIDB4ZiwgMHhmLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXVxyXG59Oy8vIDRiaXQgd2F2ZSBmb3JtXHJcblxyXG52YXIgU2F3V2F2ZSA9IHtcclxuICBiaXRzOiA0LFxyXG4gIHdhdmVkYXRhOiBbMHgwLCAweDEsIDB4MiwgMHgzLCAweDQsIDB4NSwgMHg2LCAweDcsIDB4OCwgMHg5LCAweGEsIDB4YiwgMHhjLCAweGQsIDB4ZSwgMHhmXVxyXG59Oy8vIDRiaXQgd2F2ZSBmb3JtXHJcblxyXG52YXIgVHJpV2F2ZSA9IHtcclxuICBiaXRzOiA0LFxyXG4gIHdhdmVkYXRhOiBbMHgwLCAweDIsIDB4NCwgMHg2LCAweDgsIDB4QSwgMHhDLCAweEUsIDB4RiwgMHhFLCAweEMsIDB4QSwgMHg4LCAweDYsIDB4NCwgMHgyXVxyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGRlY29kZVN0cihiaXRzLCB3YXZlc3RyKSB7XHJcbiAgdmFyIGFyciA9IFtdO1xyXG4gIHZhciBuID0gYml0cyAvIDQgfCAwO1xyXG4gIHZhciBjID0gMDtcclxuICB2YXIgemVyb3BvcyA9IDEgPDwgKGJpdHMgLSAxKTtcclxuICB3aGlsZSAoYyA8IHdhdmVzdHIubGVuZ3RoKSB7XHJcbiAgICB2YXIgZCA9IDA7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG47ICsraSkge1xyXG4gICAgICBldmFsKFwiZCA9IChkIDw8IDQpICsgMHhcIiArIHdhdmVzdHIuY2hhckF0KGMrKykgKyBcIjtcIik7XHJcbiAgICB9XHJcbiAgICBhcnIucHVzaCgoZCAtIHplcm9wb3MpIC8gemVyb3Bvcyk7XHJcbiAgfVxyXG4gIHJldHVybiBhcnI7XHJcbn1cclxuXHJcbnZhciB3YXZlcyA9IFtcclxuICAgIGRlY29kZVN0cig0LCAnRUVFRUVFRUVFRUVFRUVFRTAwMDAwMDAwMDAwMDAwMDAnKSxcclxuICAgIGRlY29kZVN0cig0LCAnMDAxMTIyMzM0NDU1NjY3Nzg4OTlBQUJCQ0NEREVFRkYnKSxcclxuICAgIGRlY29kZVN0cig0LCAnMDIzNDY2NDU5QUE4QTdBOTc3OTY1NjU2QUNBQUNERUYnKSxcclxuICAgIGRlY29kZVN0cig0LCAnQkRDRENBOTk5QUNEQ0RCOTQyMTIzNjc3NzYzMjEyNDcnKSxcclxuICAgIGRlY29kZVN0cig0LCAnN0FDREVEQ0E3NDIxMDEyNDdCREVEQjczMjAxMzdFNzgnKSxcclxuICAgIGRlY29kZVN0cig0LCAnQUNDQTc3OUJERURBNjY2Nzk5OTQxMDEyNjc3NDIyNDcnKSxcclxuICAgIGRlY29kZVN0cig0LCAnN0VDOUNFQTdDRkQ4QUI3MjhEOTQ1NzIwMzg1MTM1MzEnKSxcclxuICAgIGRlY29kZVN0cig0LCAnRUU3N0VFNzdFRTc3RUU3NzAwNzcwMDc3MDA3NzAwNzcnKSxcclxuICAgIGRlY29kZVN0cig0LCAnRUVFRTg4ODg4ODg4ODg4ODAwMDA4ODg4ODg4ODg4ODgnKS8v44OO44Kk44K655So44Gu44OA44Of44O85rOi5b2iXHJcbl07XHJcblxyXG52YXIgd2F2ZVNhbXBsZXMgPSBbXTtcclxuZXhwb3J0IGZ1bmN0aW9uIFdhdmVTYW1wbGUoYXVkaW9jdHgsIGNoLCBzYW1wbGVMZW5ndGgsIHNhbXBsZVJhdGUpIHtcclxuXHJcbiAgdGhpcy5zYW1wbGUgPSBhdWRpb2N0eC5jcmVhdGVCdWZmZXIoY2gsIHNhbXBsZUxlbmd0aCwgc2FtcGxlUmF0ZSB8fCBhdWRpb2N0eC5zYW1wbGVSYXRlKTtcclxuICB0aGlzLmxvb3AgPSBmYWxzZTtcclxuICB0aGlzLnN0YXJ0ID0gMDtcclxuICB0aGlzLmVuZCA9IChzYW1wbGVMZW5ndGggLSAxKSAvIChzYW1wbGVSYXRlIHx8IGF1ZGlvY3R4LnNhbXBsZVJhdGUpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlV2F2ZVNhbXBsZUZyb21XYXZlcyhhdWRpb2N0eCwgc2FtcGxlTGVuZ3RoKSB7XHJcbiAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHdhdmVzLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICB2YXIgc2FtcGxlID0gbmV3IFdhdmVTYW1wbGUoYXVkaW9jdHgsIDEsIHNhbXBsZUxlbmd0aCk7XHJcbiAgICB3YXZlU2FtcGxlcy5wdXNoKHNhbXBsZSk7XHJcbiAgICBpZiAoaSAhPSA4KSB7XHJcbiAgICAgIHZhciB3YXZlZGF0YSA9IHdhdmVzW2ldO1xyXG4gICAgICB2YXIgZGVsdGEgPSA0NDAuMCAqIHdhdmVkYXRhLmxlbmd0aCAvIGF1ZGlvY3R4LnNhbXBsZVJhdGU7XHJcbiAgICAgIHZhciBzdGltZSA9IDA7XHJcbiAgICAgIHZhciBvdXRwdXQgPSBzYW1wbGUuc2FtcGxlLmdldENoYW5uZWxEYXRhKDApO1xyXG4gICAgICB2YXIgbGVuID0gd2F2ZWRhdGEubGVuZ3RoO1xyXG4gICAgICB2YXIgaW5kZXggPSAwO1xyXG4gICAgICB2YXIgZW5kc2FtcGxlID0gMDtcclxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBzYW1wbGVMZW5ndGg7ICsraikge1xyXG4gICAgICAgIGluZGV4ID0gc3RpbWUgfCAwO1xyXG4gICAgICAgIG91dHB1dFtqXSA9IHdhdmVkYXRhW2luZGV4XTtcclxuICAgICAgICBzdGltZSArPSBkZWx0YTtcclxuICAgICAgICBpZiAoc3RpbWUgPj0gbGVuKSB7XHJcbiAgICAgICAgICBzdGltZSA9IHN0aW1lIC0gbGVuO1xyXG4gICAgICAgICAgZW5kc2FtcGxlID0gajtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgc2FtcGxlLmVuZCA9IGVuZHNhbXBsZSAvIGF1ZGlvY3R4LnNhbXBsZVJhdGU7XHJcbiAgICAgIHNhbXBsZS5sb29wID0gdHJ1ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIOODnOOCpOOCuTjjga/jg47jgqTjgrrms6LlvaLjgajjgZnjgotcclxuICAgICAgdmFyIG91dHB1dCA9IHNhbXBsZS5zYW1wbGUuZ2V0Q2hhbm5lbERhdGEoMCk7XHJcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgc2FtcGxlTGVuZ3RoOyArK2opIHtcclxuICAgICAgICBvdXRwdXRbal0gPSBNYXRoLnJhbmRvbSgpICogMi4wIC0gMS4wO1xyXG4gICAgICB9XHJcbiAgICAgIHNhbXBsZS5lbmQgPSBzYW1wbGVMZW5ndGggLyBhdWRpb2N0eC5zYW1wbGVSYXRlO1xyXG4gICAgICBzYW1wbGUubG9vcCA9IHRydWU7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gV2F2ZVRleHR1cmUod2F2ZSkge1xyXG4gIHRoaXMud2F2ZSA9IHdhdmUgfHwgd2F2ZXNbMF07XHJcbiAgdGhpcy50ZXggPSBuZXcgQ2FudmFzVGV4dHVyZSgzMjAsIDEwICogMTYpO1xyXG4gIHRoaXMucmVuZGVyKCk7XHJcbn1cclxuXHJcbldhdmVUZXh0dXJlLnByb3RvdHlwZSA9IHtcclxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBjdHggPSB0aGlzLnRleC5jdHg7XHJcbiAgICB2YXIgd2F2ZSA9IHRoaXMud2F2ZTtcclxuICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgY3R4LmNhbnZhcy53aWR0aCwgY3R4LmNhbnZhcy5oZWlnaHQpO1xyXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gJ3doaXRlJztcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMzIwOyBpICs9IDEwKSB7XHJcbiAgICAgIGN0eC5tb3ZlVG8oaSwgMCk7XHJcbiAgICAgIGN0eC5saW5lVG8oaSwgMjU1KTtcclxuICAgIH1cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTYwOyBpICs9IDEwKSB7XHJcbiAgICAgIGN0eC5tb3ZlVG8oMCwgaSk7XHJcbiAgICAgIGN0eC5saW5lVG8oMzIwLCBpKTtcclxuICAgIH1cclxuICAgIGN0eC5maWxsU3R5bGUgPSAncmdiYSgyNTUsMjU1LDI1NSwwLjcpJztcclxuICAgIGN0eC5yZWN0KDAsIDAsIGN0eC5jYW52YXMud2lkdGgsIGN0eC5jYW52YXMuaGVpZ2h0KTtcclxuICAgIGN0eC5zdHJva2UoKTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBjID0gMDsgaSA8IGN0eC5jYW52YXMud2lkdGg7IGkgKz0gMTAsICsrYykge1xyXG4gICAgICBjdHguZmlsbFJlY3QoaSwgKHdhdmVbY10gPiAwKSA/IDgwIC0gd2F2ZVtjXSAqIDgwIDogODAsIDEwLCBNYXRoLmFicyh3YXZlW2NdKSAqIDgwKTtcclxuICAgIH1cclxuICAgIHRoaXMudGV4LnRleHR1cmUubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gIH1cclxufTtcclxuXHJcbi8vLyDjgqjjg7Pjg5njg63jg7zjg5fjgrjjgqfjg43jg6zjg7zjgr/jg7xcclxuZXhwb3J0IGZ1bmN0aW9uIEVudmVsb3BlR2VuZXJhdG9yKHZvaWNlLCBhdHRhY2ssIGRlY2F5LCBzdXN0YWluLCByZWxlYXNlKSB7XHJcbiAgdGhpcy52b2ljZSA9IHZvaWNlO1xyXG4gIC8vdGhpcy5rZXlvbiA9IGZhbHNlO1xyXG4gIHRoaXMuYXR0YWNrID0gYXR0YWNrIHx8IDAuMDAwNTtcclxuICB0aGlzLmRlY2F5ID0gZGVjYXkgfHwgMC4wNTtcclxuICB0aGlzLnN1c3RhaW4gPSBzdXN0YWluIHx8IDAuNTtcclxuICB0aGlzLnJlbGVhc2UgPSByZWxlYXNlIHx8IDAuNTtcclxuICB0aGlzLnYgPSAxLjA7XHJcblxyXG59O1xyXG5cclxuRW52ZWxvcGVHZW5lcmF0b3IucHJvdG90eXBlID1cclxue1xyXG4gIGtleW9uOiBmdW5jdGlvbiAodCx2ZWwpIHtcclxuICAgIHRoaXMudiA9IHZlbCB8fCAxLjA7XHJcbiAgICB2YXIgdiA9IHRoaXMudjtcclxuICAgIHZhciB0MCA9IHQgfHwgdGhpcy52b2ljZS5hdWRpb2N0eC5jdXJyZW50VGltZTtcclxuICAgIHZhciB0MSA9IHQwICsgdGhpcy5hdHRhY2sgKiB2O1xyXG4gICAgdmFyIGdhaW4gPSB0aGlzLnZvaWNlLmdhaW4uZ2FpbjtcclxuICAgIGdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKHQwKTtcclxuICAgIGdhaW4uc2V0VmFsdWVBdFRpbWUoMCwgdDApO1xyXG4gICAgZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSh2LCB0MSk7XHJcbiAgICBnYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHRoaXMuc3VzdGFpbiAqIHYsIHQwICsgdGhpcy5kZWNheSAvIHYpO1xyXG4gICAgLy9nYWluLnNldFRhcmdldEF0VGltZSh0aGlzLnN1c3RhaW4gKiB2LCB0MSwgdDEgKyB0aGlzLmRlY2F5IC8gdik7XHJcbiAgfSxcclxuICBrZXlvZmY6IGZ1bmN0aW9uICh0KSB7XHJcbiAgICB2YXIgdm9pY2UgPSB0aGlzLnZvaWNlO1xyXG4gICAgdmFyIGdhaW4gPSB2b2ljZS5nYWluLmdhaW47XHJcbiAgICB2YXIgdDAgPSB0IHx8IHZvaWNlLmF1ZGlvY3R4LmN1cnJlbnRUaW1lO1xyXG4gICAgZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXModDApO1xyXG4gICAgLy9nYWluLnNldFZhbHVlQXRUaW1lKDAsIHQwICsgdGhpcy5yZWxlYXNlIC8gdGhpcy52KTtcclxuICAgIC8vZ2Fpbi5zZXRUYXJnZXRBdFRpbWUoMCwgdDAsIHQwICsgdGhpcy5yZWxlYXNlIC8gdGhpcy52KTtcclxuICAgIGdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCwgdDAgKyB0aGlzLnJlbGVhc2UgLyB0aGlzLnYpO1xyXG4gIH1cclxufTtcclxuXHJcbi8vLyDjg5zjgqTjgrlcclxuZXhwb3J0IGZ1bmN0aW9uIFZvaWNlKGF1ZGlvY3R4KSB7XHJcbiAgdGhpcy5hdWRpb2N0eCA9IGF1ZGlvY3R4O1xyXG4gIHRoaXMuc2FtcGxlID0gd2F2ZVNhbXBsZXNbNl07XHJcbiAgdGhpcy5nYWluID0gYXVkaW9jdHguY3JlYXRlR2FpbigpO1xyXG4gIHRoaXMuZ2Fpbi5nYWluLnZhbHVlID0gMC4wO1xyXG4gIHRoaXMudm9sdW1lID0gYXVkaW9jdHguY3JlYXRlR2FpbigpO1xyXG4gIHRoaXMuZW52ZWxvcGUgPSBuZXcgRW52ZWxvcGVHZW5lcmF0b3IodGhpcyk7XHJcbiAgdGhpcy5pbml0UHJvY2Vzc29yKCk7XHJcbiAgdGhpcy5kZXR1bmUgPSAxLjA7XHJcbiAgdGhpcy52b2x1bWUuZ2Fpbi52YWx1ZSA9IDEuMDtcclxuICB0aGlzLmdhaW4uY29ubmVjdCh0aGlzLnZvbHVtZSk7XHJcbiAgdGhpcy5vdXRwdXQgPSB0aGlzLnZvbHVtZTtcclxufTtcclxuXHJcblZvaWNlLnByb3RvdHlwZSA9IHtcclxuICBpbml0UHJvY2Vzc29yOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLnByb2Nlc3NvciA9IHRoaXMuYXVkaW9jdHguY3JlYXRlQnVmZmVyU291cmNlKCk7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5idWZmZXIgPSB0aGlzLnNhbXBsZS5zYW1wbGU7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5sb29wID0gdGhpcy5zYW1wbGUubG9vcDtcclxuICAgIHRoaXMucHJvY2Vzc29yLmxvb3BTdGFydCA9IDA7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5wbGF5YmFja1JhdGUudmFsdWUgPSAxLjA7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5sb29wRW5kID0gdGhpcy5zYW1wbGUuZW5kO1xyXG4gICAgdGhpcy5wcm9jZXNzb3IuY29ubmVjdCh0aGlzLmdhaW4pO1xyXG4gIH0sXHJcblxyXG4gIHNldFNhbXBsZTogZnVuY3Rpb24gKHNhbXBsZSkge1xyXG4gICAgICB0aGlzLmVudmVsb3BlLmtleW9mZigwKTtcclxuICAgICAgdGhpcy5wcm9jZXNzb3IuZGlzY29ubmVjdCh0aGlzLmdhaW4pO1xyXG4gICAgICB0aGlzLnNhbXBsZSA9IHNhbXBsZTtcclxuICAgICAgdGhpcy5pbml0UHJvY2Vzc29yKCk7XHJcbiAgICAgIHRoaXMucHJvY2Vzc29yLnN0YXJ0KCk7XHJcbiAgfSxcclxuICBzdGFydDogZnVuY3Rpb24gKHN0YXJ0VGltZSkge1xyXG4gLy8gICBpZiAodGhpcy5wcm9jZXNzb3IucGxheWJhY2tTdGF0ZSA9PSAzKSB7XHJcbiAgICAgIHRoaXMucHJvY2Vzc29yLmRpc2Nvbm5lY3QodGhpcy5nYWluKTtcclxuICAgICAgdGhpcy5pbml0UHJvY2Vzc29yKCk7XHJcbi8vICAgIH0gZWxzZSB7XHJcbi8vICAgICAgdGhpcy5lbnZlbG9wZS5rZXlvZmYoKTtcclxuLy9cclxuLy8gICAgfVxyXG4gICAgdGhpcy5wcm9jZXNzb3Iuc3RhcnQoc3RhcnRUaW1lKTtcclxuICB9LFxyXG4gIHN0b3A6IGZ1bmN0aW9uICh0aW1lKSB7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5zdG9wKHRpbWUpO1xyXG4gICAgdGhpcy5yZXNldCgpO1xyXG4gIH0sXHJcbiAga2V5b246ZnVuY3Rpb24odCxub3RlLHZlbClcclxuICB7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5wbGF5YmFja1JhdGUuc2V0VmFsdWVBdFRpbWUobm90ZUZyZXFbbm90ZV0gKiB0aGlzLmRldHVuZSwgdCk7XHJcbiAgICB0aGlzLmVudmVsb3BlLmtleW9uKHQsdmVsKTtcclxuICB9LFxyXG4gIGtleW9mZjpmdW5jdGlvbih0KVxyXG4gIHtcclxuICAgIHRoaXMuZW52ZWxvcGUua2V5b2ZmKHQpO1xyXG4gIH0sXHJcbiAgcmVzZXQ6ZnVuY3Rpb24oKVxyXG4gIHtcclxuICAgIHRoaXMucHJvY2Vzc29yLnBsYXliYWNrUmF0ZS5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoMCk7XHJcbiAgICB0aGlzLmdhaW4uZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoMCk7XHJcbiAgICB0aGlzLmdhaW4uZ2Fpbi52YWx1ZSA9IDA7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gQXVkaW8oKSB7XHJcbiAgdGhpcy5lbmFibGUgPSBmYWxzZTtcclxuICB0aGlzLmF1ZGlvQ29udGV4dCA9IHdpbmRvdy5BdWRpb0NvbnRleHQgfHwgd2luZG93LndlYmtpdEF1ZGlvQ29udGV4dCB8fCB3aW5kb3cubW96QXVkaW9Db250ZXh0O1xyXG5cclxuICBpZiAodGhpcy5hdWRpb0NvbnRleHQpIHtcclxuICAgIHRoaXMuYXVkaW9jdHggPSBuZXcgdGhpcy5hdWRpb0NvbnRleHQoKTtcclxuICAgIHRoaXMuZW5hYmxlID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIHRoaXMudm9pY2VzID0gW107XHJcbiAgaWYgKHRoaXMuZW5hYmxlKSB7XHJcbiAgICBjcmVhdGVXYXZlU2FtcGxlRnJvbVdhdmVzKHRoaXMuYXVkaW9jdHgsIEJVRkZFUl9TSVpFKTtcclxuICAgIHRoaXMuZmlsdGVyID0gdGhpcy5hdWRpb2N0eC5jcmVhdGVCaXF1YWRGaWx0ZXIoKTtcclxuICAgIHRoaXMuZmlsdGVyLnR5cGUgPSAnbG93cGFzcyc7XHJcbiAgICB0aGlzLmZpbHRlci5mcmVxdWVuY3kudmFsdWUgPSAyMDAwMDtcclxuICAgIHRoaXMuZmlsdGVyLlEudmFsdWUgPSAwLjAwMDE7XHJcbiAgICB0aGlzLm5vaXNlRmlsdGVyID0gdGhpcy5hdWRpb2N0eC5jcmVhdGVCaXF1YWRGaWx0ZXIoKTtcclxuICAgIHRoaXMubm9pc2VGaWx0ZXIudHlwZSA9ICdsb3dwYXNzJztcclxuICAgIHRoaXMubm9pc2VGaWx0ZXIuZnJlcXVlbmN5LnZhbHVlID0gMTAwMDtcclxuICAgIHRoaXMubm9pc2VGaWx0ZXIuUS52YWx1ZSA9IDEuODtcclxuICAgIHRoaXMuY29tcCA9IHRoaXMuYXVkaW9jdHguY3JlYXRlRHluYW1pY3NDb21wcmVzc29yKCk7XHJcbiAgICB0aGlzLmZpbHRlci5jb25uZWN0KHRoaXMuY29tcCk7XHJcbiAgICB0aGlzLm5vaXNlRmlsdGVyLmNvbm5lY3QodGhpcy5jb21wKTtcclxuICAgIHRoaXMuY29tcC5jb25uZWN0KHRoaXMuYXVkaW9jdHguZGVzdGluYXRpb24pO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsZW5kID0gdGhpcy5WT0lDRVM7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgICB2YXIgdiA9IG5ldyBWb2ljZSh0aGlzLmF1ZGlvY3R4KTtcclxuICAgICAgdGhpcy52b2ljZXMucHVzaCh2KTtcclxuICAgICAgaWYoaSA9PSAodGhpcy5WT0lDRVMgLSAxKSl7XHJcbiAgICAgICAgdi5vdXRwdXQuY29ubmVjdCh0aGlzLm5vaXNlRmlsdGVyKTtcclxuICAgICAgfSBlbHNle1xyXG4gICAgICAgIHYub3V0cHV0LmNvbm5lY3QodGhpcy5maWx0ZXIpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbi8vICB0aGlzLnN0YXJ0ZWQgPSBmYWxzZTtcclxuXHJcbiAgICAvL3RoaXMudm9pY2VzWzBdLm91dHB1dC5jb25uZWN0KCk7XHJcbiAgfVxyXG5cclxufVxyXG5cclxuQXVkaW8ucHJvdG90eXBlID0ge1xyXG4gIHN0YXJ0OiBmdW5jdGlvbiAoKVxyXG4gIHtcclxuICAvLyAgaWYgKHRoaXMuc3RhcnRlZCkgcmV0dXJuO1xyXG5cclxuICAgIHZhciB2b2ljZXMgPSB0aGlzLnZvaWNlcztcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB2b2ljZXMubGVuZ3RoOyBpIDwgZW5kOyArK2kpXHJcbiAgICB7XHJcbiAgICAgIHZvaWNlc1tpXS5zdGFydCgwKTtcclxuICAgIH1cclxuICAgIC8vdGhpcy5zdGFydGVkID0gdHJ1ZTtcclxuICB9LFxyXG4gIHN0b3A6IGZ1bmN0aW9uICgpXHJcbiAge1xyXG4gICAgLy9pZih0aGlzLnN0YXJ0ZWQpXHJcbiAgICAvL3tcclxuICAgICAgdmFyIHZvaWNlcyA9IHRoaXMudm9pY2VzO1xyXG4gICAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gdm9pY2VzLmxlbmd0aDsgaSA8IGVuZDsgKytpKVxyXG4gICAgICB7XHJcbiAgICAgICAgdm9pY2VzW2ldLnN0b3AoMCk7XHJcbiAgICAgIH1cclxuICAgIC8vICB0aGlzLnN0YXJ0ZWQgPSBmYWxzZTtcclxuICAgIC8vfVxyXG4gIH0sXHJcbiAgVk9JQ0VTOiAxMlxyXG59XHJcblxyXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuLyog44K344O844Kx44Oz44K144O844Kz44Oe44Oz44OJICAgICAgICAgICAgICAgICAgICAgICAqL1xyXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBOb3RlKG5vLCBuYW1lKSB7XHJcbiAgdGhpcy5ubyA9IG5vO1xyXG4gIHRoaXMubmFtZSA9IG5hbWU7XHJcbn1cclxuXHJcbk5vdGUucHJvdG90eXBlID0ge1xyXG4gIHByb2Nlc3M6IGZ1bmN0aW9uKHRyYWNrKSBcclxuICB7XHJcbiAgICB2YXIgYmFjayA9IHRyYWNrLmJhY2s7XHJcbiAgICB2YXIgbm90ZSA9IHRoaXM7XHJcbiAgICB2YXIgb2N0ID0gdGhpcy5vY3QgfHwgYmFjay5vY3Q7XHJcbiAgICB2YXIgc3RlcCA9IHRoaXMuc3RlcCB8fCBiYWNrLnN0ZXA7XHJcbiAgICB2YXIgZ2F0ZSA9IHRoaXMuZ2F0ZSB8fCBiYWNrLmdhdGU7XHJcbiAgICB2YXIgdmVsID0gdGhpcy52ZWwgfHwgYmFjay52ZWw7XHJcbiAgICBzZXRRdWV1ZSh0cmFjaywgbm90ZSwgb2N0LHN0ZXAsIGdhdGUsIHZlbCk7XHJcblxyXG4gIH1cclxufVxyXG5cclxudmFyIFxyXG4gIEMgID0gbmV3IE5vdGUoIDAsJ0MgJyksXHJcbiAgRGIgPSBuZXcgTm90ZSggMSwnRGInKSxcclxuICBEICA9IG5ldyBOb3RlKCAyLCdEICcpLFxyXG4gIEViID0gbmV3IE5vdGUoIDMsJ0ViJyksXHJcbiAgRSAgPSBuZXcgTm90ZSggNCwnRSAnKSxcclxuICBGICA9IG5ldyBOb3RlKCA1LCdGICcpLFxyXG4gIEdiID0gbmV3IE5vdGUoIDYsJ0diJyksXHJcbiAgRyAgPSBuZXcgTm90ZSggNywnRyAnKSxcclxuICBBYiA9IG5ldyBOb3RlKCA4LCdBYicpLFxyXG4gIEEgID0gbmV3IE5vdGUoIDksJ0EgJyksXHJcbiAgQmIgPSBuZXcgTm90ZSgxMCwnQmInKSxcclxuICBCID0gbmV3IE5vdGUoMTEsICdCICcpO1xyXG5cclxuIC8vIFIgPSBuZXcgUmVzdCgpO1xyXG5cclxuZnVuY3Rpb24gU2VxRGF0YShub3RlLCBvY3QsIHN0ZXAsIGdhdGUsIHZlbClcclxue1xyXG4gIHRoaXMubm90ZSA9IG5vdGU7XHJcbiAgdGhpcy5vY3QgPSBvY3Q7XHJcbiAgLy90aGlzLm5vID0gbm90ZS5ubyArIG9jdCAqIDEyO1xyXG4gIHRoaXMuc3RlcCA9IHN0ZXA7XHJcbiAgdGhpcy5nYXRlID0gZ2F0ZTtcclxuICB0aGlzLnZlbCA9IHZlbDtcclxufVxyXG5cclxuZnVuY3Rpb24gc2V0UXVldWUodHJhY2ssbm90ZSxvY3Qsc3RlcCxnYXRlLHZlbClcclxue1xyXG4gIHZhciBubyA9IG5vdGUubm8gKyBvY3QgKiAxMjtcclxuICB2YXIgc3RlcF90aW1lID0gdHJhY2sucGxheWluZ1RpbWU7XHJcbiAgdmFyIGdhdGVfdGltZSA9ICgoZ2F0ZSA+PSAwKSA/IGdhdGUgKiA2MCA6IHN0ZXAgKiBnYXRlICogNjAgKiAtMS4wKSAvIChUSU1FX0JBU0UgKiB0cmFjay5sb2NhbFRlbXBvKSArIHRyYWNrLnBsYXlpbmdUaW1lO1xyXG4gIHZhciB2b2ljZSA9IHRyYWNrLmF1ZGlvLnZvaWNlc1t0cmFjay5jaGFubmVsXTtcclxuICAvL2NvbnNvbGUubG9nKHRyYWNrLnNlcXVlbmNlci50ZW1wbyk7XHJcbiAgdm9pY2Uua2V5b24oc3RlcF90aW1lLCBubywgdmVsKTtcclxuICB2b2ljZS5rZXlvZmYoZ2F0ZV90aW1lKTtcclxuICB0cmFjay5wbGF5aW5nVGltZSA9IChzdGVwICogNjApIC8gKFRJTUVfQkFTRSAqIHRyYWNrLmxvY2FsVGVtcG8pICsgdHJhY2sucGxheWluZ1RpbWU7XHJcbiAgdmFyIGJhY2sgPSB0cmFjay5iYWNrO1xyXG4gIGJhY2subm90ZSA9IG5vdGU7XHJcbiAgYmFjay5vY3QgPSBvY3Q7XHJcbiAgYmFjay5zdGVwID0gc3RlcDtcclxuICBiYWNrLmdhdGUgPSBnYXRlO1xyXG4gIGJhY2sudmVsID0gdmVsO1xyXG59XHJcblxyXG5TZXFEYXRhLnByb3RvdHlwZSA9IHtcclxuICBwcm9jZXNzOiBmdW5jdGlvbiAodHJhY2spIHtcclxuXHJcbiAgICB2YXIgYmFjayA9IHRyYWNrLmJhY2s7XHJcbiAgICB2YXIgbm90ZSA9IHRoaXMubm90ZSB8fCBiYWNrLm5vdGU7XHJcbiAgICB2YXIgb2N0ID0gdGhpcy5vY3QgfHwgYmFjay5vY3Q7XHJcbiAgICB2YXIgc3RlcCA9IHRoaXMuc3RlcCB8fCBiYWNrLnN0ZXA7XHJcbiAgICB2YXIgZ2F0ZSA9IHRoaXMuZ2F0ZSB8fCBiYWNrLmdhdGU7XHJcbiAgICB2YXIgdmVsID0gdGhpcy52ZWwgfHwgYmFjay52ZWw7XHJcbiAgICBzZXRRdWV1ZSh0cmFjayxub3RlLG9jdCxzdGVwLGdhdGUsdmVsKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFMobm90ZSwgb2N0LCBzdGVwLCBnYXRlLCB2ZWwpIHtcclxuICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XHJcbiAgaWYgKFMubGVuZ3RoICE9IGFyZ3MubGVuZ3RoKVxyXG4gIHtcclxuICAgIGlmKHR5cGVvZihhcmdzW2FyZ3MubGVuZ3RoIC0gMV0pID09ICdvYmplY3QnICYmICAhKGFyZ3NbYXJncy5sZW5ndGggLSAxXSBpbnN0YW5jZW9mIE5vdGUpKVxyXG4gICAge1xyXG4gICAgICB2YXIgYXJnczEgPSBhcmdzW2FyZ3MubGVuZ3RoIC0gMV07XHJcbiAgICAgIHZhciBsID0gYXJncy5sZW5ndGggLSAxO1xyXG4gICAgICByZXR1cm4gbmV3IFNlcURhdGEoXHJcbiAgICAgICgobCAhPSAwKT9ub3RlOmZhbHNlKSB8fCBhcmdzMS5ub3RlIHx8IGFyZ3MxLm4gfHwgbnVsbCxcclxuICAgICAgKChsICE9IDEpID8gb2N0IDogZmFsc2UpIHx8IGFyZ3MxLm9jdCB8fCBhcmdzMS5vIHx8IG51bGwsXHJcbiAgICAgICgobCAhPSAyKSA/IHN0ZXAgOiBmYWxzZSkgfHwgYXJnczEuc3RlcCB8fCBhcmdzMS5zIHx8IG51bGwsXHJcbiAgICAgICgobCAhPSAzKSA/IGdhdGUgOiBmYWxzZSkgfHwgYXJnczEuZ2F0ZSB8fCBhcmdzMS5nIHx8IG51bGwsXHJcbiAgICAgICgobCAhPSA0KSA/IHZlbCA6IGZhbHNlKSB8fCBhcmdzMS52ZWwgfHwgYXJnczEudiB8fCBudWxsXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBuZXcgU2VxRGF0YShub3RlIHx8IG51bGwsIG9jdCB8fCBudWxsLCBzdGVwIHx8IG51bGwsIGdhdGUgfHwgbnVsbCwgdmVsIHx8IG51bGwpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBTMShub3RlLCBvY3QsIHN0ZXAsIGdhdGUsIHZlbCkge1xyXG4gIHJldHVybiBTKG5vdGUsIG9jdCwgbChzdGVwKSwgZ2F0ZSwgdmVsKTtcclxufVxyXG5cclxuZnVuY3Rpb24gUzIobm90ZSwgbGVuLCBkb3QgLCBvY3QsIGdhdGUsIHZlbCkge1xyXG4gIHJldHVybiBTKG5vdGUsIG9jdCwgbChsZW4sZG90KSwgZ2F0ZSwgdmVsKTtcclxufVxyXG5cclxuZnVuY3Rpb24gUzMobm90ZSwgc3RlcCwgZ2F0ZSwgdmVsLCBvY3QpIHtcclxuICByZXR1cm4gUyhub3RlLCBvY3QsIHN0ZXAsIGdhdGUsIHZlbCk7XHJcbn1cclxuXHJcblxyXG4vLy8g6Z+z56ym44Gu6ZW344GV5oyH5a6aXHJcblxyXG5mdW5jdGlvbiBsKGxlbixkb3QpXHJcbntcclxuICB2YXIgZCA9IGZhbHNlO1xyXG4gIGlmIChkb3QpIGQgPSBkb3Q7XHJcbiAgcmV0dXJuIChUSU1FX0JBU0UgKiAoNCArIChkPzI6MCkpKSAvIGxlbjtcclxufVxyXG5cclxuZnVuY3Rpb24gU3RlcChzdGVwKSB7XHJcbiAgdGhpcy5zdGVwID0gc3RlcDtcclxufVxyXG5cclxuU3RlcC5wcm90b3R5cGUucHJvY2VzcyA9IGZ1bmN0aW9uICh0cmFjaylcclxue1xyXG4gIHRyYWNrLmJhY2suc3RlcCA9IHRoaXMuc3RlcDtcclxufVxyXG5cclxuZnVuY3Rpb24gU1Qoc3RlcClcclxue1xyXG4gIHJldHVybiBuZXcgU3RlcChzdGVwKTtcclxufVxyXG5cclxuZnVuY3Rpb24gTChsZW4sIGRvdCkge1xyXG4gIHJldHVybiBuZXcgU3RlcChsKGxlbiwgZG90KSk7XHJcbn1cclxuXHJcbi8vLyDjgrLjg7zjg4jjgr/jgqTjg6DmjIflrppcclxuXHJcbmZ1bmN0aW9uIEdhdGVUaW1lKGdhdGUpIHtcclxuICB0aGlzLmdhdGUgPSBnYXRlO1xyXG59XHJcblxyXG5HYXRlVGltZS5wcm90b3R5cGUucHJvY2VzcyA9IGZ1bmN0aW9uICh0cmFjaykge1xyXG4gIHRyYWNrLmJhY2suZ2F0ZSA9IHRoaXMuZ2F0ZTtcclxufVxyXG5cclxuZnVuY3Rpb24gR1QoZ2F0ZSkge1xyXG4gIHJldHVybiBuZXcgR2F0ZVRpbWUoZ2F0ZSk7XHJcbn1cclxuXHJcbi8vLyDjg5njg63jgrfjg4bjgqPmjIflrppcclxuXHJcbmZ1bmN0aW9uIFZlbG9jaXR5KHZlbCkge1xyXG4gIHRoaXMudmVsID0gdmVsO1xyXG59XHJcblxyXG5WZWxvY2l0eS5wcm90b3R5cGUucHJvY2VzcyA9IGZ1bmN0aW9uICh0cmFjaykge1xyXG4gIHRyYWNrLmJhY2sudmVsID0gdGhpcy52ZWw7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFYodmVsKSB7XHJcbiAgcmV0dXJuIG5ldyBWZWxvY2l0eSh2ZWwpO1xyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gSnVtcChwb3MpIHsgdGhpcy5wb3MgPSBwb3M7fTtcclxuSnVtcC5wcm90b3R5cGUucHJvY2VzcyA9IGZ1bmN0aW9uICh0cmFjaylcclxue1xyXG4gIHRyYWNrLnNlcVBvcyA9IHRoaXMucG9zO1xyXG59XHJcblxyXG4vLy8g6Z+z6Imy6Kit5a6aXHJcbmZ1bmN0aW9uIFRvbmUobm8pXHJcbntcclxuICB0aGlzLm5vID0gbm87XHJcbiAgLy90aGlzLnNhbXBsZSA9IHdhdmVTYW1wbGVzW3RoaXMubm9dO1xyXG59XHJcblxyXG5Ub25lLnByb3RvdHlwZSA9XHJcbntcclxuICBwcm9jZXNzOiBmdW5jdGlvbiAodHJhY2spXHJcbiAge1xyXG4gICAgdHJhY2suYXVkaW8udm9pY2VzW3RyYWNrLmNoYW5uZWxdLnNldFNhbXBsZSh3YXZlU2FtcGxlc1t0aGlzLm5vXSk7XHJcbiAgfVxyXG59XHJcbmZ1bmN0aW9uIFRPTkUobm8pXHJcbntcclxuICByZXR1cm4gbmV3IFRvbmUobm8pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBKVU1QKHBvcykge1xyXG4gIHJldHVybiBuZXcgSnVtcChwb3MpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBSZXN0KHN0ZXApXHJcbntcclxuICB0aGlzLnN0ZXAgPSBzdGVwO1xyXG59XHJcblxyXG5SZXN0LnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24odHJhY2spXHJcbntcclxuICB2YXIgc3RlcCA9IHRoaXMuc3RlcCB8fCB0cmFjay5iYWNrLnN0ZXA7XHJcbiAgdHJhY2sucGxheWluZ1RpbWUgPSB0cmFjay5wbGF5aW5nVGltZSArICh0aGlzLnN0ZXAgKiA2MCkgLyAoVElNRV9CQVNFICogdHJhY2subG9jYWxUZW1wbyk7XHJcbiAgdHJhY2suYmFjay5zdGVwID0gdGhpcy5zdGVwO1xyXG59XHJcblxyXG5mdW5jdGlvbiBSMShzdGVwKSB7XHJcbiAgcmV0dXJuIG5ldyBSZXN0KHN0ZXApO1xyXG59XHJcbmZ1bmN0aW9uIFIobGVuLGRvdCkge1xyXG4gIHJldHVybiBuZXcgUmVzdChsKGxlbixkb3QpKTtcclxufVxyXG5cclxuZnVuY3Rpb24gT2N0YXZlKG9jdCkge1xyXG4gIHRoaXMub2N0ID0gb2N0O1xyXG59XHJcbk9jdGF2ZS5wcm90b3R5cGUucHJvY2VzcyA9IGZ1bmN0aW9uKHRyYWNrKVxyXG57XHJcbiAgdHJhY2suYmFjay5vY3QgPSB0aGlzLm9jdDtcclxufVxyXG5cclxuZnVuY3Rpb24gTyhvY3QpIHtcclxuICByZXR1cm4gbmV3IE9jdGF2ZShvY3QpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBPY3RhdmVVcCh2KSB7IHRoaXMudiA9IHY7IH07XHJcbk9jdGF2ZVVwLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24odHJhY2spIHtcclxuICB0cmFjay5iYWNrLm9jdCArPSB0aGlzLnY7XHJcbn1cclxuXHJcbnZhciBPVSA9IG5ldyBPY3RhdmVVcCgxKTtcclxudmFyIE9EID0gbmV3IE9jdGF2ZVVwKC0xKTtcclxuXHJcbmZ1bmN0aW9uIFRlbXBvKHRlbXBvKVxyXG57XHJcbiAgdGhpcy50ZW1wbyA9IHRlbXBvO1xyXG59XHJcblxyXG5UZW1wby5wcm90b3R5cGUucHJvY2VzcyA9IGZ1bmN0aW9uKHRyYWNrKVxyXG57XHJcbiAgdHJhY2subG9jYWxUZW1wbyA9IHRoaXMudGVtcG87XHJcbiAgLy90cmFjay5zZXF1ZW5jZXIudGVtcG8gPSB0aGlzLnRlbXBvO1xyXG59XHJcblxyXG5mdW5jdGlvbiBURU1QTyh0ZW1wbylcclxue1xyXG4gIHJldHVybiBuZXcgVGVtcG8odGVtcG8pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBFbnZlbG9wZShhdHRhY2ssIGRlY2F5LCBzdXN0YWluLCByZWxlYXNlKVxyXG57XHJcbiAgdGhpcy5hdHRhY2sgPSBhdHRhY2s7XHJcbiAgdGhpcy5kZWNheSA9IGRlY2F5O1xyXG4gIHRoaXMuc3VzdGFpbiA9IHN1c3RhaW47XHJcbiAgdGhpcy5yZWxlYXNlID0gcmVsZWFzZTtcclxufVxyXG5cclxuRW52ZWxvcGUucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbih0cmFjaylcclxue1xyXG4gIHZhciBlbnZlbG9wZSA9IHRyYWNrLmF1ZGlvLnZvaWNlc1t0cmFjay5jaGFubmVsXS5lbnZlbG9wZTtcclxuICBlbnZlbG9wZS5hdHRhY2sgPSB0aGlzLmF0dGFjaztcclxuICBlbnZlbG9wZS5kZWNheSA9IHRoaXMuZGVjYXk7XHJcbiAgZW52ZWxvcGUuc3VzdGFpbiA9IHRoaXMuc3VzdGFpbjtcclxuICBlbnZlbG9wZS5yZWxlYXNlID0gdGhpcy5yZWxlYXNlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBFTlYoYXR0YWNrLGRlY2F5LHN1c3RhaW4gLHJlbGVhc2UpXHJcbntcclxuICByZXR1cm4gbmV3IEVudmVsb3BlKGF0dGFjaywgZGVjYXksIHN1c3RhaW4sIHJlbGVhc2UpO1xyXG59XHJcblxyXG4vLy8g44OH44OB44Ol44O844OzXHJcbmZ1bmN0aW9uIERldHVuZShkZXR1bmUpXHJcbntcclxuICB0aGlzLmRldHVuZSA9IGRldHVuZTtcclxufVxyXG5cclxuRGV0dW5lLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24odHJhY2spXHJcbntcclxuICB2YXIgdm9pY2UgPSB0cmFjay5hdWRpby52b2ljZXNbdHJhY2suY2hhbm5lbF07XHJcbiAgdm9pY2UuZGV0dW5lID0gdGhpcy5kZXR1bmU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIERFVFVORShkZXR1bmUpXHJcbntcclxuICByZXR1cm4gbmV3IERldHVuZShkZXR1bmUpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBWb2x1bWUodm9sdW1lKVxyXG57XHJcbiAgdGhpcy52b2x1bWUgPSB2b2x1bWU7XHJcbn1cclxuXHJcblZvbHVtZS5wcm90b3R5cGUucHJvY2VzcyA9IGZ1bmN0aW9uKHRyYWNrKVxyXG57XHJcbiAgdHJhY2suYXVkaW8udm9pY2VzW3RyYWNrLmNoYW5uZWxdLnZvbHVtZS5nYWluLnNldFZhbHVlQXRUaW1lKHRoaXMudm9sdW1lLCB0cmFjay5wbGF5aW5nVGltZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFZPTFVNRSh2b2x1bWUpXHJcbntcclxuICByZXR1cm4gbmV3IFZvbHVtZSh2b2x1bWUpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBMb29wRGF0YShvYmosdmFybmFtZSwgY291bnQsc2VxUG9zKVxyXG57XHJcbiAgdGhpcy52YXJuYW1lID0gdmFybmFtZTtcclxuICB0aGlzLmNvdW50ID0gY291bnQ7XHJcbiAgdGhpcy5vYmogPSBvYmo7XHJcbiAgdGhpcy5zZXFQb3MgPSBzZXFQb3M7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIExvb3AodmFybmFtZSwgY291bnQpIHtcclxuICB0aGlzLmxvb3BEYXRhID0gbmV3IExvb3BEYXRhKHRoaXMsdmFybmFtZSxjb3VudCwwKTtcclxufVxyXG5cclxuTG9vcC5wcm90b3R5cGUucHJvY2VzcyA9IGZ1bmN0aW9uICh0cmFjaylcclxue1xyXG4gIHZhciBzdGFjayA9IHRyYWNrLnN0YWNrO1xyXG4gIGlmIChzdGFjay5sZW5ndGggPT0gMCB8fCBzdGFja1tzdGFjay5sZW5ndGggLSAxXS5vYmogIT09IHRoaXMpXHJcbiAge1xyXG4gICAgdmFyIGxkID0gdGhpcy5sb29wRGF0YTtcclxuICAgIHN0YWNrLnB1c2gobmV3IExvb3BEYXRhKHRoaXMsIGxkLnZhcm5hbWUsIGxkLmNvdW50LCB0cmFjay5zZXFQb3MpKTtcclxuICB9IFxyXG59XHJcblxyXG5mdW5jdGlvbiBMT09QKHZhcm5hbWUsIGNvdW50KSB7XHJcbiAgcmV0dXJuIG5ldyBMb29wKHZhcm5hbWUsY291bnQpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBMb29wRW5kKClcclxue1xyXG59XHJcblxyXG5Mb29wRW5kLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24odHJhY2spXHJcbntcclxuICB2YXIgbGQgPSB0cmFjay5zdGFja1t0cmFjay5zdGFjay5sZW5ndGggLSAxXTtcclxuICBsZC5jb3VudC0tO1xyXG4gIGlmIChsZC5jb3VudCA+IDApIHtcclxuICAgIHRyYWNrLnNlcVBvcyA9IGxkLnNlcVBvcztcclxuICB9IGVsc2Uge1xyXG4gICAgdHJhY2suc3RhY2sucG9wKCk7XHJcbiAgfVxyXG59XHJcblxyXG52YXIgTE9PUF9FTkQgPSBuZXcgTG9vcEVuZCgpO1xyXG5cclxuLy8vIOOCt+ODvOOCseODs+OCteODvOODiOODqeODg+OCr1xyXG5mdW5jdGlvbiBUcmFjayhzZXF1ZW5jZXIsc2VxZGF0YSxhdWRpbylcclxue1xyXG4gIHRoaXMubmFtZSA9ICcnO1xyXG4gIHRoaXMuZW5kID0gZmFsc2U7XHJcbiAgdGhpcy5vbmVzaG90ID0gZmFsc2U7XHJcbiAgdGhpcy5zZXF1ZW5jZXIgPSBzZXF1ZW5jZXI7XHJcbiAgdGhpcy5zZXFEYXRhID0gc2VxZGF0YTtcclxuICB0aGlzLnNlcVBvcyA9IDA7XHJcbiAgdGhpcy5tdXRlID0gZmFsc2U7XHJcbiAgdGhpcy5wbGF5aW5nVGltZSA9IC0xO1xyXG4gIHRoaXMubG9jYWxUZW1wbyA9IHNlcXVlbmNlci50ZW1wbztcclxuICB0aGlzLnRyYWNrVm9sdW1lID0gMS4wO1xyXG4gIHRoaXMudHJhbnNwb3NlID0gMDtcclxuICB0aGlzLnNvbG8gPSBmYWxzZTtcclxuICB0aGlzLmNoYW5uZWwgPSAtMTtcclxuICB0aGlzLnRyYWNrID0gLTE7XHJcbiAgdGhpcy5hdWRpbyA9IGF1ZGlvO1xyXG4gIHRoaXMuYmFjayA9IHtcclxuICAgIG5vdGU6IDcyLFxyXG4gICAgb2N0OiA1LFxyXG4gICAgc3RlcDogOTYsXHJcbiAgICBnYXRlOiA0OCxcclxuICAgIHZlbDoxLjBcclxuICB9XHJcbiAgdGhpcy5zdGFjayA9IFtdO1xyXG59XHJcblxyXG5UcmFjay5wcm90b3R5cGUgPSB7XHJcbiAgcHJvY2VzczogZnVuY3Rpb24gKGN1cnJlbnRUaW1lKSB7XHJcblxyXG4gICAgaWYgKHRoaXMuZW5kKSByZXR1cm47XHJcbiAgICBcclxuICAgIGlmICh0aGlzLm9uZXNob3QpIHtcclxuICAgICAgdGhpcy5yZXNldCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBzZXFTaXplID0gdGhpcy5zZXFEYXRhLmxlbmd0aDtcclxuICAgIGlmICh0aGlzLnNlcVBvcyA+PSBzZXFTaXplKSB7XHJcbiAgICAgIGlmKHRoaXMuc2VxdWVuY2VyLnJlcGVhdClcclxuICAgICAge1xyXG4gICAgICAgIHRoaXMuc2VxUG9zID0gMDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmVuZCA9IHRydWU7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHNlcSA9IHRoaXMuc2VxRGF0YTtcclxuICAgIHRoaXMucGxheWluZ1RpbWUgPSAodGhpcy5wbGF5aW5nVGltZSA+IC0xKSA/IHRoaXMucGxheWluZ1RpbWUgOiBjdXJyZW50VGltZTtcclxuICAgIHZhciBlbmRUaW1lID0gY3VycmVudFRpbWUgKyAwLjIvKnNlYyovO1xyXG5cclxuICAgIHdoaWxlICh0aGlzLnNlcVBvcyA8IHNlcVNpemUpIHtcclxuICAgICAgaWYgKHRoaXMucGxheWluZ1RpbWUgPj0gZW5kVGltZSAmJiAhdGhpcy5vbmVzaG90KSB7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIGQgPSBzZXFbdGhpcy5zZXFQb3NdO1xyXG4gICAgICAgIGQucHJvY2Vzcyh0aGlzKTtcclxuICAgICAgICB0aGlzLnNlcVBvcysrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuICByZXNldDpmdW5jdGlvbigpXHJcbiAge1xyXG4gICAgdmFyIGN1clZvaWNlID0gdGhpcy5hdWRpby52b2ljZXNbdGhpcy5jaGFubmVsXTtcclxuICAgIGN1clZvaWNlLmdhaW4uZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoMCk7XHJcbiAgICBjdXJWb2ljZS5wcm9jZXNzb3IucGxheWJhY2tSYXRlLmNhbmNlbFNjaGVkdWxlZFZhbHVlcygwKTtcclxuICAgIGN1clZvaWNlLmdhaW4uZ2Fpbi52YWx1ZSA9IDA7XHJcbiAgICB0aGlzLnBsYXlpbmdUaW1lID0gLTE7XHJcbiAgICB0aGlzLnNlcVBvcyA9IDA7XHJcbiAgICB0aGlzLmVuZCA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGxvYWRUcmFja3Moc2VsZix0cmFja3MsIHRyYWNrZGF0YSlcclxue1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdHJhY2tkYXRhLmxlbmd0aDsgKytpKSB7XHJcbiAgICB2YXIgdHJhY2sgPSBuZXcgVHJhY2soc2VsZiwgdHJhY2tkYXRhW2ldLmRhdGEsc2VsZi5hdWRpbyk7XHJcbiAgICB0cmFjay5jaGFubmVsID0gdHJhY2tkYXRhW2ldLmNoYW5uZWw7XHJcbiAgICB0cmFjay5vbmVzaG90ID0gKCF0cmFja2RhdGFbaV0ub25lc2hvdCk/ZmFsc2U6dHJ1ZTtcclxuICAgIHRyYWNrLnRyYWNrID0gaTtcclxuICAgIHRyYWNrcy5wdXNoKHRyYWNrKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVRyYWNrcyh0cmFja2RhdGEpXHJcbntcclxuICB2YXIgdHJhY2tzID0gW107XHJcbiAgbG9hZFRyYWNrcyh0aGlzLHRyYWNrcywgdHJhY2tkYXRhKTtcclxuICByZXR1cm4gdHJhY2tzO1xyXG59XHJcblxyXG4vLy8g44K344O844Kx44Oz44K144O85pys5L2TXHJcbmV4cG9ydCBmdW5jdGlvbiBTZXF1ZW5jZXIoYXVkaW8pIHtcclxuICB0aGlzLmF1ZGlvID0gYXVkaW87XHJcbiAgdGhpcy50ZW1wbyA9IDEwMC4wO1xyXG4gIHRoaXMucmVwZWF0ID0gZmFsc2U7XHJcbiAgdGhpcy5wbGF5ID0gZmFsc2U7XHJcbiAgdGhpcy50cmFja3MgPSBbXTtcclxuICB0aGlzLnBhdXNlVGltZSA9IDA7XHJcbiAgdGhpcy5zdGF0dXMgPSB0aGlzLlNUT1A7XHJcbn1cclxuXHJcblNlcXVlbmNlci5wcm90b3R5cGUgPSB7XHJcbiAgbG9hZDogZnVuY3Rpb24oZGF0YSlcclxuICB7XHJcbiAgICBpZih0aGlzLnBsYXkpIHtcclxuICAgICAgdGhpcy5zdG9wKCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnRyYWNrcy5sZW5ndGggPSAwO1xyXG4gICAgbG9hZFRyYWNrcyh0aGlzLHRoaXMudHJhY2tzLCBkYXRhLnRyYWNrcyx0aGlzLmF1ZGlvKTtcclxuICB9LFxyXG4gIHN0YXJ0OmZ1bmN0aW9uKClcclxuICB7XHJcbiAgICAvLyAgICB0aGlzLmhhbmRsZSA9IHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHsgc2VsZi5wcm9jZXNzKCkgfSwgNTApO1xyXG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLlBMQVk7XHJcbiAgICB0aGlzLnByb2Nlc3MoKTtcclxuICB9LFxyXG4gIHByb2Nlc3M6ZnVuY3Rpb24oKVxyXG4gIHtcclxuICAgIGlmICh0aGlzLnN0YXR1cyA9PSB0aGlzLlBMQVkpIHtcclxuICAgICAgdGhpcy5wbGF5VHJhY2tzKHRoaXMudHJhY2tzKTtcclxuICAgICAgdGhpcy5oYW5kbGUgPSB3aW5kb3cuc2V0VGltZW91dCh0aGlzLnByb2Nlc3MuYmluZCh0aGlzKSwgMTAwKTtcclxuICAgIH1cclxuICB9LFxyXG4gIHBsYXlUcmFja3M6IGZ1bmN0aW9uICh0cmFja3Mpe1xyXG4gICAgdmFyIGN1cnJlbnRUaW1lID0gdGhpcy5hdWRpby5hdWRpb2N0eC5jdXJyZW50VGltZTtcclxuIC8vICAgY29uc29sZS5sb2codGhpcy5hdWRpby5hdWRpb2N0eC5jdXJyZW50VGltZSk7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gdHJhY2tzLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIHRyYWNrc1tpXS5wcm9jZXNzKGN1cnJlbnRUaW1lKTtcclxuICAgIH1cclxuICB9LFxyXG4gIHBhdXNlOmZ1bmN0aW9uKClcclxuICB7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuUEFVU0U7XHJcbiAgICB0aGlzLnBhdXNlVGltZSA9IHRoaXMuYXVkaW8uYXVkaW9jdHguY3VycmVudFRpbWU7XHJcbiAgfSxcclxuICByZXN1bWU6ZnVuY3Rpb24gKClcclxuICB7XHJcbiAgICBpZiAodGhpcy5zdGF0dXMgPT0gdGhpcy5QQVVTRSkge1xyXG4gICAgICB0aGlzLnN0YXR1cyA9IHRoaXMuUExBWTtcclxuICAgICAgdmFyIHRyYWNrcyA9IHRoaXMudHJhY2tzO1xyXG4gICAgICB2YXIgYWRqdXN0ID0gdGhpcy5hdWRpby5hdWRpb2N0eC5jdXJyZW50VGltZSAtIHRoaXMucGF1c2VUaW1lO1xyXG4gICAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gdHJhY2tzLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgICAgdHJhY2tzW2ldLnBsYXlpbmdUaW1lICs9IGFkanVzdDtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLnByb2Nlc3MoKTtcclxuICAgIH1cclxuICB9LFxyXG4gIHN0b3A6IGZ1bmN0aW9uICgpXHJcbiAge1xyXG4gICAgaWYgKHRoaXMuc3RhdHVzICE9IHRoaXMuU1RPUCkge1xyXG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5oYW5kbGUpO1xyXG4gICAgICAvLyAgICBjbGVhckludGVydmFsKHRoaXMuaGFuZGxlKTtcclxuICAgICAgdGhpcy5zdGF0dXMgPSB0aGlzLlNUT1A7XHJcbiAgICAgIHRoaXMucmVzZXQoKTtcclxuICAgIH1cclxuICB9LFxyXG4gIHJlc2V0OmZ1bmN0aW9uKClcclxuICB7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gdGhpcy50cmFja3MubGVuZ3RoOyBpIDwgZW5kOyArK2kpXHJcbiAgICB7XHJcbiAgICAgIHRoaXMudHJhY2tzW2ldLnJlc2V0KCk7XHJcbiAgICB9XHJcbiAgfSxcclxuICBTVE9QOiAwIHwgMCxcclxuICBQTEFZOiAxIHwgMCxcclxuICBQQVVTRToyIHwgMFxyXG59XHJcblxyXG4vLy8g57Ch5piT6Y2155uk44Gu5a6f6KOFXHJcbmZ1bmN0aW9uIFBpYW5vKGF1ZGlvKSB7XHJcbiAgdGhpcy5hdWRpbyA9IGF1ZGlvO1xyXG4gIHRoaXMudGFibGUgPSBbOTAsIDgzLCA4OCwgNjgsIDY3LCA4NiwgNzEsIDY2LCA3MiwgNzgsIDc0LCA3NywgMTg4XTtcclxuICB0aGlzLmtleW9uID0gbmV3IEFycmF5KDEzKTtcclxufVxyXG5cclxuUGlhbm8ucHJvdG90eXBlID0ge1xyXG4gIG9uOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgdmFyIGluZGV4ID0gdGhpcy50YWJsZS5pbmRleE9mKGUua2V5Q29kZSwgMCk7XHJcbiAgICBpZiAoaW5kZXggPT0gLTEpIHtcclxuICAgICAgaWYgKGUua2V5Q29kZSA+IDQ4ICYmIGUua2V5Q29kZSA8IDU3KSB7XHJcbiAgICAgICAgdmFyIHRpbWJyZSA9IGUua2V5Q29kZSAtIDQ5O1xyXG4gICAgICAgIHRoaXMuYXVkaW8udm9pY2VzWzddLnNldFNhbXBsZSh3YXZlU2FtcGxlc1t0aW1icmVdKTtcclxuICAgICAgICB3YXZlR3JhcGgud2F2ZSA9IHdhdmVzW3RpbWJyZV07XHJcbiAgICAgICAgd2F2ZUdyYXBoLnJlbmRlcigpO1xyXG4gICAgICAgIHRleHRQbGFuZS5wcmludCg1LCAxMCwgXCJXYXZlIFwiICsgKHRpbWJyZSArIDEpKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vYXVkaW8udm9pY2VzWzBdLnByb2Nlc3Nvci5wbGF5YmFja1JhdGUudmFsdWUgPSBzZXF1ZW5jZXIubm90ZUZyZXFbXTtcclxuICAgICAgaWYgKCF0aGlzLmtleW9uW2luZGV4XSkge1xyXG4gICAgICAgIHRoaXMuYXVkaW8udm9pY2VzWzddLmtleW9uKDAsaW5kZXggKyAoZS5zaGlmdEtleSA/IDg0IDogNzIpLDEuMCk7XHJcbiAgICAgICAgdGhpcy5rZXlvbltpbmRleF0gPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgfSxcclxuICBvZmY6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICB2YXIgaW5kZXggPSB0aGlzLnRhYmxlLmluZGV4T2YoZS5rZXlDb2RlLCAwKTtcclxuICAgIGlmIChpbmRleCA9PSAtMSkge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmICh0aGlzLmtleW9uW2luZGV4XSkge1xyXG4gICAgICAgIGF1ZGlvLnZvaWNlc1s3XS5lbnZlbG9wZS5rZXlvZmYoMCk7XHJcbiAgICAgICAgdGhpcy5rZXlvbltpbmRleF0gPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgdmFyIHNlcURhdGEgPSB7XHJcbiAgbmFtZTogJ1Rlc3QnLFxyXG4gIHRyYWNrczogW1xyXG4gICAge1xyXG4gICAgICBuYW1lOiAncGFydDEnLFxyXG4gICAgICBjaGFubmVsOiAwLFxyXG4gICAgICBkYXRhOlxyXG4gICAgICBbXHJcbiAgICAgICAgRU5WKDAuMDEsIDAuMDIsIDAuNSwgMC4wNyksXHJcbiAgICAgICAgVEVNUE8oMTgwKSwgVE9ORSgwKSwgVk9MVU1FKDAuNSksIEwoOCksIEdUKC0wLjUpLE8oNCksXHJcbiAgICAgICAgTE9PUCgnaScsNCksXHJcbiAgICAgICAgQywgQywgQywgQywgQywgQywgQywgQyxcclxuICAgICAgICBMT09QX0VORCxcclxuICAgICAgICBKVU1QKDUpXHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6ICdwYXJ0MicsXHJcbiAgICAgIGNoYW5uZWw6IDEsXHJcbiAgICAgIGRhdGE6XHJcbiAgICAgICAgW1xyXG4gICAgICAgIEVOVigwLjAxLCAwLjA1LCAwLjYsIDAuMDcpLFxyXG4gICAgICAgIFRFTVBPKDE4MCksVE9ORSg2KSwgVk9MVU1FKDAuMiksIEwoOCksIEdUKC0wLjgpLFxyXG4gICAgICAgIFIoMSksIFIoMSksXHJcbiAgICAgICAgTyg2KSxMKDEpLCBGLFxyXG4gICAgICAgIEUsXHJcbiAgICAgICAgT0QsIEwoOCwgdHJ1ZSksIEJiLCBHLCBMKDQpLCBCYiwgT1UsIEwoNCksIEYsIEwoOCksIEQsXHJcbiAgICAgICAgTCg0LCB0cnVlKSwgRSwgTCgyKSwgQyxSKDgpLFxyXG4gICAgICAgIEpVTVAoOClcclxuICAgICAgICBdXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBuYW1lOiAncGFydDMnLFxyXG4gICAgICBjaGFubmVsOiAyLFxyXG4gICAgICBkYXRhOlxyXG4gICAgICAgIFtcclxuICAgICAgICBFTlYoMC4wMSwgMC4wNSwgMC42LCAwLjA3KSxcclxuICAgICAgICBURU1QTygxODApLFRPTkUoNiksIFZPTFVNRSgwLjEpLCBMKDgpLCBHVCgtMC41KSwgXHJcbiAgICAgICAgUigxKSwgUigxKSxcclxuICAgICAgICBPKDYpLEwoMSksIEMsQyxcclxuICAgICAgICBPRCwgTCg4LCB0cnVlKSwgRywgRCwgTCg0KSwgRywgT1UsIEwoNCksIEQsIEwoOCksT0QsIEcsXHJcbiAgICAgICAgTCg0LCB0cnVlKSwgT1UsQywgTCgyKSxPRCwgRywgUig4KSxcclxuICAgICAgICBKVU1QKDcpXHJcbiAgICAgICAgXVxyXG4gICAgfVxyXG4gIF1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIFNvdW5kRWZmZWN0cyhzZXF1ZW5jZXIpIHtcclxuICAgdGhpcy5zb3VuZEVmZmVjdHMgPVxyXG4gICAgW1xyXG4gICAgLy8gRWZmZWN0IDAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICBjcmVhdGVUcmFja3MuY2FsbChzZXF1ZW5jZXIsW1xyXG4gICAge1xyXG4gICAgICBjaGFubmVsOiA4LFxyXG4gICAgICBvbmVzaG90OnRydWUsXHJcbiAgICAgIGRhdGE6IFtWT0xVTUUoMC41KSxcclxuICAgICAgICBFTlYoMC4wMDAxLCAwLjAxLCAxLjAsIDAuMDAwMSksR1QoLTAuOTk5KSxUT05FKDApLCBURU1QTygyMDApLCBPKDgpLFNUKDMpLCBDLCBELCBFLCBGLCBHLCBBLCBCLCBPVSwgQywgRCwgRSwgRywgQSwgQixCLEIsQlxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBjaGFubmVsOiA5LFxyXG4gICAgICBvbmVzaG90OiB0cnVlLFxyXG4gICAgICBkYXRhOiBbVk9MVU1FKDAuNSksXHJcbiAgICAgICAgRU5WKDAuMDAwMSwgMC4wMSwgMS4wLCAwLjAwMDEpLCBERVRVTkUoMC45KSwgR1QoLTAuOTk5KSwgVE9ORSgwKSwgVEVNUE8oMjAwKSwgTyg1KSwgU1QoMyksIEMsIEQsIEUsIEYsIEcsIEEsIEIsIE9VLCBDLCBELCBFLCBHLCBBLCBCLEIsQixCXHJcbiAgICAgIF1cclxuICAgIH1cclxuICAgIF0pLFxyXG4gICAgLy8gRWZmZWN0IDEgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgY3JlYXRlVHJhY2tzLmNhbGwoc2VxdWVuY2VyLFxyXG4gICAgICBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgY2hhbm5lbDogMTAsXHJcbiAgICAgICAgICBvbmVzaG90OiB0cnVlLFxyXG4gICAgICAgICAgZGF0YTogW1xyXG4gICAgICAgICAgIFRPTkUoNCksIFRFTVBPKDE1MCksIFNUKDQpLCBHVCgtMC45OTk5KSwgRU5WKDAuMDAwMSwgMC4wMDAxLCAxLjAsIDAuMDAwMSksXHJcbiAgICAgICAgICAgTyg2KSwgRywgQSwgQiwgTyg3KSwgQiwgQSwgRywgRiwgRSwgRCwgQywgRSwgRywgQSwgQiwgT0QsIEIsIEEsIEcsIEYsIEUsIEQsIEMsIE9ELCBCLCBBLCBHLCBGLCBFLCBELCBDXHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgICBdKSxcclxuICAgIC8vIEVmZmVjdCAyLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgIGNyZWF0ZVRyYWNrcy5jYWxsKHNlcXVlbmNlcixcclxuICAgICAgW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIGNoYW5uZWw6IDEwLFxyXG4gICAgICAgICAgb25lc2hvdDogdHJ1ZSxcclxuICAgICAgICAgIGRhdGE6IFtcclxuICAgICAgICAgICBUT05FKDApLCBURU1QTygxNTApLCBTVCgyKSwgR1QoLTAuOTk5OSksIEVOVigwLjAwMDEsIDAuMDAwMSwgMS4wLCAwLjAwMDEpLFxyXG4gICAgICAgICAgIE8oOCksIEMsRCxFLEYsRyxBLEIsT1UsQyxELEUsRixPRCxHLE9VLEEsT0QsQixPVSxBLE9ELEcsT1UsRixPRCxFLE9VLEVcclxuICAgICAgICAgIF1cclxuICAgICAgICB9XHJcbiAgICAgIF0pLFxyXG4gICAgICAvLyBFZmZlY3QgMyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgICAgY3JlYXRlVHJhY2tzLmNhbGwoc2VxdWVuY2VyLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgY2hhbm5lbDogMTAsXHJcbiAgICAgICAgICAgIG9uZXNob3Q6IHRydWUsXHJcbiAgICAgICAgICAgIGRhdGE6IFtcclxuICAgICAgICAgICAgIFRPTkUoNSksIFRFTVBPKDE1MCksIEwoNjQpLCBHVCgtMC45OTk5KSwgRU5WKDAuMDAwMSwgMC4wMDAxLCAxLjAsIDAuMDAwMSksXHJcbiAgICAgICAgICAgICBPKDYpLEMsT0QsQyxPVSxDLE9ELEMsT1UsQyxPRCxDLE9VLEMsT0RcclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIF0pLFxyXG4gICAgICAvLyBFZmZlY3QgNCAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICAgIGNyZWF0ZVRyYWNrcy5jYWxsKHNlcXVlbmNlcixcclxuICAgICAgICBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGNoYW5uZWw6IDExLFxyXG4gICAgICAgICAgICBvbmVzaG90OiB0cnVlLFxyXG4gICAgICAgICAgICBkYXRhOiBbXHJcbiAgICAgICAgICAgICBUT05FKDgpLCBWT0xVTUUoMi4wKSxURU1QTygxMjApLCBMKDIpLCBHVCgtMC45OTk5KSwgRU5WKDAuMDAwMSwgMC4wMDAxLCAxLjAsIDAuMjUpLFxyXG4gICAgICAgICAgICAgTygxKSwgQ1xyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgXSlcclxuICAgXTtcclxuIH1cclxuXHJcblxyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5leHBvcnQgY2xhc3MgQ29tbSB7XHJcbiAgY29uc3RydWN0b3IoKXtcclxuICAgIHZhciBob3N0ID0gd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLm1hdGNoKC9sb2NhbGhvc3QvaWcpPydsb2NhbGhvc3QnOid3d3cuc2ZwZ21yLm5ldCc7XHJcbiAgICB0aGlzLmVuYWJsZSA9IGZhbHNlO1xyXG4gICAgdHJ5IHtcclxuICAgICAgdGhpcy5zb2NrZXQgPSBpby5jb25uZWN0KCdodHRwOi8vJyArIGhvc3QgKyAnOjgwODEvdGVzdCcpO1xyXG4gICAgICB0aGlzLmVuYWJsZSA9IHRydWU7XHJcbiAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgdGhpcy5zb2NrZXQub24oJ3NlbmRIaWdoU2NvcmVzJywgKGRhdGEpPT57XHJcbiAgICAgICAgaWYodGhpcy51cGRhdGVIaWdoU2NvcmVzKXtcclxuICAgICAgICAgIHRoaXMudXBkYXRlSGlnaFNjb3JlcyhkYXRhKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICB0aGlzLnNvY2tldC5vbignc2VuZEhpZ2hTY29yZScsIChkYXRhKT0+e1xyXG4gICAgICAgIHRoaXMudXBkYXRlSGlnaFNjb3JlKGRhdGEpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMuc29ja2V0Lm9uKCdzZW5kUmFuaycsIChkYXRhKSA9PiB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVIaWdoU2NvcmVzKGRhdGEuaGlnaFNjb3Jlcyk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdGhpcy5zb2NrZXQub24oJ2Vycm9yQ29ubmVjdGlvbk1heCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBhbGVydCgn5ZCM5pmC5o6l57aa44Gu5LiK6ZmQ44Gr6YGU44GX44G+44GX44Gf44CCJyk7XHJcbiAgICAgICAgc2VsZi5lbmFibGUgPSBmYWxzZTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLnNvY2tldC5vbignZGlzY29ubmVjdCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAoc2VsZi5lbmFibGUpIHtcclxuICAgICAgICAgIHNlbGYuZW5hYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICBhbGVydCgn44K144O844OQ44O85o6l57aa44GM5YiH5pat44GV44KM44G+44GX44Gf44CCJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIGFsZXJ0KCdTb2NrZXQuSU/jgYzliKnnlKjjgafjgY3jgarjgYTjgZ/jgoHjgIHjg4/jgqTjgrnjgrPjgqLmg4XloLHjgYzlj5blvpfjgafjgY3jgb7jgZvjgpPjgIInICsgZSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIHNlbmRTY29yZShzY29yZSlcclxuICB7XHJcbiAgICBpZiAodGhpcy5lbmFibGUpIHtcclxuICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnc2VuZFNjb3JlJywgc2NvcmUpO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBkaXNjb25uZWN0KClcclxuICB7XHJcbiAgICBpZiAodGhpcy5lbmFibGUpIHtcclxuICAgICAgdGhpcy5lbmFibGUgPSBmYWxzZTtcclxuICAgICAgdGhpcy5zb2NrZXQuZGlzY29ubmVjdCgpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0ICogYXMgc2ZnIGZyb20gJy4vZ2xvYmFsJztcclxuaW1wb3J0ICogIGFzIGdhbWVvYmogZnJvbSAnLi9nYW1lb2JqJztcclxuaW1wb3J0ICogYXMgZ3JhcGhpY3MgZnJvbSAnLi9ncmFwaGljcyc7XHJcblxyXG5cclxuLy8vIOeIhueZulxyXG5leHBvcnQgY2xhc3MgQm9tYiBleHRlbmRzIGdhbWVvYmouR2FtZU9iaiBcclxue1xyXG4gIGNvbnN0cnVjdG9yKHNjZW5lLHNlKSB7XHJcbiAgICBzdXBlcigwLDAsMCk7XHJcbiAgICB2YXIgdGV4ID0gc2ZnLnRleHR1cmVGaWxlcy5ib21iO1xyXG4gICAgdmFyIG1hdGVyaWFsID0gZ3JhcGhpY3MuY3JlYXRlU3ByaXRlTWF0ZXJpYWwodGV4KTtcclxuICAgIG1hdGVyaWFsLmJsZW5kaW5nID0gVEhSRUUuQWRkaXRpdmVCbGVuZGluZztcclxuICAgIG1hdGVyaWFsLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIHZhciBnZW9tZXRyeSA9IGdyYXBoaWNzLmNyZWF0ZVNwcml0ZUdlb21ldHJ5KDE2KTtcclxuICAgIGdyYXBoaWNzLmNyZWF0ZVNwcml0ZVVWKGdlb21ldHJ5LCB0ZXgsIDE2LCAxNiwgMCk7XHJcbiAgICB0aGlzLm1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gICAgdGhpcy5tZXNoLnBvc2l0aW9uLnogPSAwLjE7XHJcbiAgICB0aGlzLmluZGV4ID0gMDtcclxuICAgIHRoaXMubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICB0aGlzLnNjZW5lID0gc2NlbmU7XHJcbiAgICB0aGlzLnNlID0gc2U7XHJcbiAgICBzY2VuZS5hZGQodGhpcy5tZXNoKTtcclxuICB9XHJcbiAgZ2V0IHgoKSB7IHJldHVybiB0aGlzLnhfOyB9XHJcbiAgc2V0IHgodikgeyB0aGlzLnhfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnggPSB2OyB9XHJcbiAgZ2V0IHkoKSB7IHJldHVybiB0aGlzLnlfOyB9XHJcbiAgc2V0IHkodikgeyB0aGlzLnlfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnkgPSB2OyB9XHJcbiAgZ2V0IHooKSB7IHJldHVybiB0aGlzLnpfOyB9XHJcbiAgc2V0IHoodikgeyB0aGlzLnpfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnogPSB2OyB9XHJcbiAgXHJcbiAgc3RhcnQoeCwgeSwgeiwgZGVsYXkpIHtcclxuICAgIGlmICh0aGlzLmVuYWJsZV8pIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgdGhpcy5kZWxheSA9IGRlbGF5IHwgMDtcclxuICAgIHRoaXMueCA9IHg7XHJcbiAgICB0aGlzLnkgPSB5O1xyXG4gICAgdGhpcy56ID0geiB8IDAuMDAwMDI7XHJcbiAgICB0aGlzLmVuYWJsZV8gPSB0cnVlO1xyXG4gICAgdGhpcy5pbmRleCA9IDA7XHJcbiAgICBncmFwaGljcy51cGRhdGVTcHJpdGVVVih0aGlzLm1lc2guZ2VvbWV0cnksIHNmZy50ZXh0dXJlRmlsZXMuYm9tYiwgMTYsIDE2LCB0aGlzLmluZGV4KTtcclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgIHNmZy50YXNrcy5wdXNoVGFzayhmdW5jdGlvbiAoaSkgeyBzZWxmLm1vdmUoaSk7IH0pO1xyXG4gICAgdGhpcy5tZXNoLm1hdGVyaWFsLm9wYWNpdHkgPSAxLjA7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbiAgXHJcbiAgbW92ZSh0YXNrSW5kZXgpIHtcclxuICAgIGlmICghdGhpcy5kZWxheSkge1xyXG4gICAgICB0aGlzLm1lc2gudmlzaWJsZSA9IHRydWU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmRlbGF5LS07XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHRoaXMuaW5kZXgrKztcclxuICAgIGlmICh0aGlzLmluZGV4IDwgNykge1xyXG4gICAgICBncmFwaGljcy51cGRhdGVTcHJpdGVVVih0aGlzLm1lc2guZ2VvbWV0cnksIHNmZy50ZXh0dXJlRmlsZXMuYm9tYiwgMTYsIDE2LCB0aGlzLmluZGV4KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuZW5hYmxlXyA9IGZhbHNlO1xyXG4gICAgICB0aGlzLm1lc2gudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICBzZmcudGFza3MucmVtb3ZlVGFzayh0YXNrSW5kZXgpO1xyXG4gICAgfVxyXG4gIH1cclxuIFxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQm9tYnMge1xyXG4gIGNvbnN0cnVjdG9yKHNjZW5lLCBzZSkge1xyXG4gICAgdGhpcy5ib21icyA9IG5ldyBBcnJheSgwKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMzI7ICsraSkge1xyXG4gICAgICB0aGlzLmJvbWJzLnB1c2gobmV3IEJvbWIoc2NlbmUsIHNlKSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIHN0YXJ0KHgsIHksIHopIHtcclxuICAgIHZhciBib21zID0gdGhpcy5ib21icztcclxuICAgIHZhciBjb3VudCA9IDM7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gYm9tcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgICBpZiAoIWJvbXNbaV0uZW5hYmxlXykge1xyXG4gICAgICAgIGlmIChjb3VudCA9PSAyKSB7XHJcbiAgICAgICAgICBib21zW2ldLnN0YXJ0KHgsIHksIHosIDApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBib21zW2ldLnN0YXJ0KHggKyAoTWF0aC5yYW5kb20oKSAqIDE2IC0gOCksIHkgKyAoTWF0aC5yYW5kb20oKSAqIDE2IC0gOCksIHosIE1hdGgucmFuZG9tKCkgKiA4KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY291bnQtLTtcclxuICAgICAgICBpZiAoIWNvdW50KSBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbn1cclxuXHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgKiAgYXMgZ2FtZW9iaiBmcm9tICcuL2dhbWVvYmonO1xyXG5pbXBvcnQgKiBhcyBzZmcgZnJvbSAnLi9nbG9iYWwnO1xyXG5pbXBvcnQgKiBhcyBncmFwaGljcyBmcm9tICcuL2dyYXBoaWNzJztcclxuXHJcbi8vLyDmlbXlvL5cclxuZXhwb3J0IGNsYXNzIEVuZW15QnVsbGV0IGV4dGVuZHMgZ2FtZW9iai5HYW1lT2JqIHtcclxuICBjb25zdHJ1Y3RvcihzY2VuZSwgc2UpIHtcclxuICAgIHN1cGVyKDAsIDAsIDApO1xyXG4gICAgdGhpcy5OT05FID0gMDtcclxuICAgIHRoaXMuTU9WRSA9IDE7XHJcbiAgICB0aGlzLkJPTUIgPSAyO1xyXG4gICAgdGhpcy5jb2xsaXNpb25BcmVhLndpZHRoID0gMjtcclxuICAgIHRoaXMuY29sbGlzaW9uQXJlYS5oZWlnaHQgPSAyO1xyXG4gICAgdmFyIHRleCA9IHNmZy50ZXh0dXJlRmlsZXMuZW5lbXk7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVNYXRlcmlhbCh0ZXgpO1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gZ3JhcGhpY3MuY3JlYXRlU3ByaXRlR2VvbWV0cnkoMTYpO1xyXG4gICAgZ3JhcGhpY3MuY3JlYXRlU3ByaXRlVVYoZ2VvbWV0cnksIHRleCwgMTYsIDE2LCAwKTtcclxuICAgIHRoaXMubWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgICB0aGlzLnogPSAwLjA7XHJcbiAgICB0aGlzLm12UGF0dGVybiA9IG51bGw7XHJcbiAgICB0aGlzLm12ID0gbnVsbDtcclxuICAgIHRoaXMubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICB0aGlzLnR5cGUgPSBudWxsO1xyXG4gICAgdGhpcy5saWZlID0gMDtcclxuICAgIHRoaXMuZHggPSAwO1xyXG4gICAgdGhpcy5keSA9IDA7XHJcbiAgICB0aGlzLnNwZWVkID0gMi4wO1xyXG4gICAgdGhpcy5lbmFibGUgPSBmYWxzZTtcclxuICAgIHRoaXMuaGl0XyA9IG51bGw7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuTk9ORTtcclxuICAgIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuICAgIHNjZW5lLmFkZCh0aGlzLm1lc2gpO1xyXG4gICAgdGhpcy5zZSA9IHNlO1xyXG4gIH1cclxuXHJcbiAgZ2V0IHgoKSB7IHJldHVybiB0aGlzLnhfOyB9XHJcbiAgc2V0IHgodikgeyB0aGlzLnhfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnggPSB2OyB9XHJcbiAgZ2V0IHkoKSB7IHJldHVybiB0aGlzLnlfOyB9XHJcbiAgc2V0IHkodikgeyB0aGlzLnlfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnkgPSB2OyB9XHJcbiAgZ2V0IHooKSB7IHJldHVybiB0aGlzLnpfOyB9XHJcbiAgc2V0IHoodikgeyB0aGlzLnpfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnogPSB2OyB9XHJcbiAgZ2V0IGVuYWJsZSgpIHtcclxuICAgIHJldHVybiB0aGlzLmVuYWJsZV87XHJcbiAgfVxyXG4gIFxyXG4gIHNldCBlbmFibGUodikge1xyXG4gICAgdGhpcy5lbmFibGVfID0gdjtcclxuICAgIHRoaXMubWVzaC52aXNpYmxlID0gdjtcclxuICB9XHJcbiAgXHJcbiAgbW92ZSh0YXNrSW5kZXgpIHtcclxuICAgIGlmICh0aGlzLnN0YXR1cyA9PSB0aGlzLk5PTkUpXHJcbiAgICB7XHJcbiAgICAgIGRlYnVnZ2VyO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMueCA9IHRoaXMueCArIHRoaXMuZHg7XHJcbiAgICB0aGlzLnkgPSB0aGlzLnkgKyB0aGlzLmR5O1xyXG5cclxuICAgIGlmKHRoaXMueCA8IChzZmcuVl9MRUZUIC0gMTYpIHx8XHJcbiAgICAgICB0aGlzLnggPiAoc2ZnLlZfUklHSFQgKyAxNikgfHxcclxuICAgICAgIHRoaXMueSA8IChzZmcuVl9CT1RUT00gLSAxNikgfHxcclxuICAgICAgIHRoaXMueSA+IChzZmcuVl9UT1AgKyAxNikpIHtcclxuICAgICAgIHRoaXMubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICB0aGlzLnN0YXR1cyA9IHRoaXMuTk9ORTtcclxuICAgICAgIHRoaXMuZW5hYmxlID0gZmFsc2U7XHJcbiAgICAgICBzZmcudGFza3MucmVtb3ZlVGFzayh0YXNrSW5kZXgpO1xyXG4gICAgfVxyXG4gICB9XHJcbiAgIFxyXG4gIHN0YXJ0KHgsIHksIHopIHtcclxuICAgIGlmICh0aGlzLmVuYWJsZSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB0aGlzLnggPSB4IHx8IDA7XHJcbiAgICB0aGlzLnkgPSB5IHx8IDA7XHJcbiAgICB0aGlzLnogPSB6IHx8IDA7XHJcbiAgICB0aGlzLmVuYWJsZSA9IHRydWU7XHJcbiAgICBpZiAodGhpcy5zdGF0dXMgIT0gdGhpcy5OT05FKVxyXG4gICAge1xyXG4gICAgICBkZWJ1Z2dlcjtcclxuICAgIH1cclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5NT1ZFO1xyXG4gICAgdmFyIGFpbVJhZGlhbiA9IE1hdGguYXRhbjIoc2ZnLm15c2hpcF8ueSAtIHksIHNmZy5teXNoaXBfLnggLSB4KTtcclxuICAgIHRoaXMubWVzaC5yb3RhdGlvbi56ID0gYWltUmFkaWFuO1xyXG4gICAgdGhpcy5keCA9IE1hdGguY29zKGFpbVJhZGlhbikgKiAodGhpcy5zcGVlZCArIHNmZy5zdGFnZS5kaWZmaWN1bHR5KTtcclxuICAgIHRoaXMuZHkgPSBNYXRoLnNpbihhaW1SYWRpYW4pICogKHRoaXMuc3BlZWQgKyBzZmcuc3RhZ2UuZGlmZmljdWx0eSk7XHJcbi8vICAgIGNvbnNvbGUubG9nKCdkeDonICsgdGhpcy5keCArICcgZHk6JyArIHRoaXMuZHkpO1xyXG5cclxuICAgIHZhciBlbmIgPSB0aGlzO1xyXG4gICAgdGhpcy50YXNrID0gc2ZnLnRhc2tzLnB1c2hUYXNrKGVuYi5tb3ZlLmJpbmQoZW5iKSk7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbiAgaGl0KCkge1xyXG4gICAgdGhpcy5lbmFibGUgPSBmYWxzZTtcclxuICAgIHNmZy50YXNrcy5yZW1vdmVUYXNrKHRoaXMudGFzay5pbmRleCk7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuTk9ORTtcclxuICB9XHJcbn1cclxuXHJcblxyXG5leHBvcnQgY2xhc3MgRW5lbXlCdWxsZXRzIHtcclxuICBjb25zdHJ1Y3RvcihzY2VuZSwgc2UpIHtcclxuICAgIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuICAgIHRoaXMuZW5lbXlCdWxsZXRzID0gW107XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDQ4OyArK2kpIHtcclxuICAgICAgdGhpcy5lbmVteUJ1bGxldHMucHVzaChuZXcgRW5lbXlCdWxsZXQodGhpcy5zY2VuZSwgc2UpKTtcclxuICAgIH1cclxuICB9XHJcbiAgc3RhcnQoeCwgeSwgeikge1xyXG4gICAgdmFyIGVicyA9IHRoaXMuZW5lbXlCdWxsZXRzO1xyXG4gICAgZm9yKHZhciBpID0gMCxlbmQgPSBlYnMubGVuZ3RoO2k8IGVuZDsrK2kpe1xyXG4gICAgICBpZighZWJzW2ldLmVuYWJsZSl7XHJcbiAgICAgICAgZWJzW2ldLnN0YXJ0KHgsIHksIHopO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIHJlc2V0KClcclxuICB7XHJcbiAgICB2YXIgZWJzID0gdGhpcy5lbmVteUJ1bGxldHM7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gZWJzLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIGlmIChlYnNbaV0uZW5hYmxlKSB7XHJcbiAgICAgICAgZWJzW2ldLmVuYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIGVic1tpXS5zdGF0dXMgPSBlYnNbaV0uTk9ORTtcclxuICAgICAgICBzZmcudGFza3MucmVtb3ZlVGFzayhlYnNbaV0udGFzay5pbmRleCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8vLyDmlbXjgq3jg6Pjg6njga7li5XjgY0gLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4vLy8g55u057ea6YGL5YuVXHJcbmNsYXNzIExpbmVNb3ZlIHtcclxuICBjb25zdHJ1Y3RvcihyYWQsIHNwZWVkLCBzdGVwKSB7XHJcbiAgICB0aGlzLnJhZCA9IHJhZDtcclxuICAgIHRoaXMuc3BlZWQgPSBzcGVlZDtcclxuICAgIHRoaXMuc3RlcCA9IHN0ZXA7XHJcbiAgICB0aGlzLmN1cnJlbnRTdGVwID0gc3RlcDtcclxuICAgIHRoaXMuZHggPSBNYXRoLmNvcyhyYWQpICogc3BlZWQ7XHJcbiAgICB0aGlzLmR5ID0gTWF0aC5zaW4ocmFkKSAqIHNwZWVkO1xyXG4gIH1cclxuICBzdGFydChzZWxmLCB4LCB5KSB7XHJcbiAgICBzZWxmLm1vdmVFbmQgPSBmYWxzZTtcclxuICAgIHNlbGYuc3RlcCA9IHRoaXMuc3RlcDtcclxuICAgIGlmIChzZWxmLnhyZXYpIHtcclxuICAgICAgc2VsZi5jaGFyUmFkID0gUEkgLSAodGhpcy5yYWQgLSBQSSAvIDIpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2VsZi5jaGFyUmFkID0gdGhpcy5yYWQgLSBQSSAvIDI7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBtb3ZlKHNlbGYpIHtcclxuICAgIGlmIChzZWxmLm1vdmVFbmQpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaWYgKHNlbGYueHJldikge1xyXG4gICAgICBzZWxmLnggLT0gdGhpcy5keDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNlbGYueCArPSB0aGlzLmR4O1xyXG4gICAgfVxyXG4gICAgc2VsZi55ICs9IHRoaXMuZHk7XHJcbiAgICBzZWxmLnN0ZXAtLTtcclxuICAgIGlmICghc2VsZi5zdGVwKSB7XHJcbiAgICAgIHNlbGYubW92ZUVuZCA9IHRydWU7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g5YaG6YGL5YuVXHJcbmNsYXNzIENpcmNsZU1vdmUge1xyXG4gIGNvbnN0cnVjdG9yKHN0YXJ0UmFkLCBzdG9wUmFkLCByLCBzcGVlZCwgbGVmdCkge1xyXG4gICAgdGhpcy5zdGFydFJhZCA9IHN0YXJ0UmFkIHx8IDA7XHJcbiAgICB0aGlzLnN0b3BSYWQgPSBzdG9wUmFkIHx8IDA7XHJcbiAgICB0aGlzLnIgPSByIHx8IDA7XHJcbiAgICB0aGlzLnNwZWVkID0gc3BlZWQgfHwgMDtcclxuICAgIHRoaXMubGVmdCA9ICFsZWZ0ID8gZmFsc2UgOiB0cnVlO1xyXG4gICAgdGhpcy5kZWx0YXMgPSBbXTtcclxuICAgIHZhciByYWQgPSB0aGlzLnN0YXJ0UmFkO1xyXG4gICAgdmFyIHN0ZXAgPSAobGVmdCA/IDEgOiAtMSkgKiBzcGVlZCAvIHI7XHJcbiAgICB2YXIgZW5kID0gZmFsc2U7XHJcbiAgICB3aGlsZSAoIWVuZCkge1xyXG4gICAgICByYWQgKz0gc3RlcDtcclxuICAgICAgaWYgKChsZWZ0ICYmIChyYWQgPj0gdGhpcy5zdG9wUmFkKSkgfHwgKCFsZWZ0ICYmIHJhZCA8PSB0aGlzLnN0b3BSYWQpKSB7XHJcbiAgICAgICAgcmFkID0gdGhpcy5zdG9wUmFkO1xyXG4gICAgICAgIGVuZCA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5kZWx0YXMucHVzaCh7XHJcbiAgICAgICAgeDogdGhpcy5yICogTWF0aC5jb3MocmFkKSxcclxuICAgICAgICB5OiB0aGlzLnIgKiBNYXRoLnNpbihyYWQpLFxyXG4gICAgICAgIHJhZDogcmFkXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHN0YXJ0KHNlbGYsIHgsIHkpIHtcclxuICAgIHNlbGYubW92ZUVuZCA9IGZhbHNlO1xyXG4gICAgc2VsZi5zdGVwID0gMDtcclxuICAgIGlmIChzZWxmLnhyZXYpIHtcclxuICAgICAgc2VsZi5zeCA9IHggLSB0aGlzLnIgKiBNYXRoLmNvcyh0aGlzLnN0YXJ0UmFkICsgTWF0aC5QSSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzZWxmLnN4ID0geCAtIHRoaXMuciAqIE1hdGguY29zKHRoaXMuc3RhcnRSYWQpO1xyXG4gICAgfVxyXG4gICAgc2VsZi5zeSA9IHkgLSB0aGlzLnIgKiBNYXRoLnNpbih0aGlzLnN0YXJ0UmFkKTtcclxuICAgIHNlbGYueiA9IDAuMDtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuICBtb3ZlKHNlbGYpIHtcclxuICAgIGlmIChzZWxmLm1vdmVFbmQpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdmFyIGRlbHRhID0gdGhpcy5kZWx0YXNbc2VsZi5zdGVwXTtcclxuXHJcbiAgICBzZWxmLnggPSBzZWxmLnN4ICsgKHNlbGYueHJldiA/IGRlbHRhLnggKiAtMSA6IGRlbHRhLngpO1xyXG4gICAgc2VsZi55ID0gc2VsZi5zeSArIGRlbHRhLnk7XHJcbiAgICBpZiAoc2VsZi54cmV2KSB7XHJcbiAgICAgIHNlbGYuY2hhclJhZCA9IChNYXRoLlBJIC0gZGVsdGEucmFkKSArICh0aGlzLmxlZnQgPyAtMSA6IDApICogTWF0aC5QSTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNlbGYuY2hhclJhZCA9IGRlbHRhLnJhZCArICh0aGlzLmxlZnQgPyAwIDogLTEpICogTWF0aC5QSTtcclxuICAgIH1cclxuICAgIHNlbGYucmFkID0gZGVsdGEucmFkO1xyXG4gICAgc2VsZi5zdGVwKys7XHJcbiAgICBpZiAoc2VsZi5zdGVwID49IHRoaXMuZGVsdGFzLmxlbmd0aCkge1xyXG4gICAgICBzZWxmLnN0ZXAtLTtcclxuICAgICAgc2VsZi5tb3ZlRW5kID0gdHJ1ZTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8vLyDjg5vjg7zjg6Djg53jgrjjgrfjg6fjg7PjgavmiLvjgotcclxuY2xhc3MgR290b0hvbWUge1xyXG5cclxuICBzdGFydChzZWxmLCB4LCB5KSB7XHJcbiAgICB2YXIgcmFkID0gTWF0aC5hdGFuMihzZWxmLmhvbWVZIC0gc2VsZi55LCBzZWxmLmhvbWVYIC0gc2VsZi54KTtcclxuICAgIHNlbGYuY2hhclJhZCA9IHJhZCAtIE1hdGguUEkgLyAyO1xyXG4gICAgc2VsZi5yYWQgPSByYWQ7XHJcbiAgICBzZWxmLnNwZWVkID0gNDtcclxuICAgIHNlbGYuZHggPSBNYXRoLmNvcyhzZWxmLnJhZCkgKiBzZWxmLnNwZWVkO1xyXG4gICAgc2VsZi5keSA9IE1hdGguc2luKHNlbGYucmFkKSAqIHNlbGYuc3BlZWQ7XHJcbiAgICBzZWxmLm1vdmVFbmQgPSBmYWxzZTtcclxuICAgIHNlbGYueiA9IDAuMDtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuICBtb3ZlKHNlbGYpIHtcclxuICAgIGlmIChzZWxmLm1vdmVFbmQpIHsgcmV0dXJuOyB9XHJcbiAgICBpZiAoTWF0aC5hYnMoc2VsZi54IC0gc2VsZi5ob21lWCkgPCAyICYmIE1hdGguYWJzKHNlbGYueSAtIHNlbGYuaG9tZVkpIDwgMikge1xyXG4gICAgICBzZWxmLmNoYXJSYWQgPSAwO1xyXG4gICAgICBzZWxmLnJhZCA9IE1hdGguUEk7XHJcbiAgICAgIHNlbGYueCA9IHNlbGYuaG9tZVg7XHJcbiAgICAgIHNlbGYueSA9IHNlbGYuaG9tZVk7XHJcbiAgICAgIHNlbGYubW92ZUVuZCA9IHRydWU7XHJcbiAgICAgIGlmIChzZWxmLnN0YXR1cyA9PSBzZWxmLlNUQVJUKSB7XHJcbiAgICAgICAgdmFyIGdyb3VwSUQgPSBzZWxmLmdyb3VwSUQ7XHJcbiAgICAgICAgdmFyIGdyb3VwRGF0YSA9IHNlbGYuZW5lbWllcy5ncm91cERhdGE7XHJcbiAgICAgICAgZ3JvdXBEYXRhW2dyb3VwSURdLnB1c2goc2VsZik7XHJcbiAgICAgICAgc2VsZi5lbmVtaWVzLmhvbWVFbmVtaWVzQ291bnQrKztcclxuICAgICAgfVxyXG4gICAgICBzZWxmLnN0YXR1cyA9IHNlbGYuSE9NRTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgc2VsZi54ICs9IHNlbGYuZHg7XHJcbiAgICBzZWxmLnkgKz0gc2VsZi5keTtcclxuICB9XHJcbn1cclxuXHJcbi8vL1xyXG5jbGFzcyBIb21lTW92ZXtcclxuICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgdGhpcy5DRU5URVJfWCA9IDA7XHJcbiAgICB0aGlzLkNFTlRFUl9ZID0gMTAwO1xyXG4gIH1cclxuXHJcbiAgc3RhcnQoc2VsZiwgeCwgeSkge1xyXG4gICAgc2VsZi5keCA9IHNlbGYuaG9tZVggLSB0aGlzLkNFTlRFUl9YO1xyXG4gICAgc2VsZi5keSA9IHNlbGYuaG9tZVkgLSB0aGlzLkNFTlRFUl9ZO1xyXG4gICAgc2VsZi5tb3ZlRW5kID0gZmFsc2U7XHJcbiAgICBzZWxmLnogPSAtMC4xO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG4gIG1vdmUoc2VsZikge1xyXG4gICAgaWYgKHNlbGYubW92ZUVuZCkgeyByZXR1cm47IH1cclxuICAgIGlmIChzZWxmLnN0YXR1cyA9PSBzZWxmLkFUVEFDSykge1xyXG4gICAgICBzZWxmLm1vdmVFbmQgPSB0cnVlO1xyXG4gICAgICBzZWxmLm1lc2guc2NhbGUueCA9IDEuMDtcclxuICAgICAgc2VsZi56ID0gMC4wO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBzZWxmLnggPSAgc2VsZi5ob21lWCArIHNlbGYuZHggKiBzZWxmLmVuZW1pZXMuaG9tZURlbHRhO1xyXG4gICAgc2VsZi55ID0gc2VsZi5ob21lWSArIHNlbGYuZHkgKiBzZWxmLmVuZW1pZXMuaG9tZURlbHRhO1xyXG4gICAgc2VsZi5tZXNoLnNjYWxlLnggPSBzZWxmLmVuZW1pZXMuaG9tZURlbHRhMjtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDmjIflrprjgrfjg7zjgrHjg7Pjgrnjgavnp7vli5XjgZnjgotcclxuY2xhc3MgR290byB7XHJcbiAgY29uc3RydWN0b3IocG9zKSB7IHRoaXMucG9zID0gcG9zOyB9O1xyXG4gIHN0YXJ0KHNlbGYsIHgsIHkpIHtcclxuICAgIHNlbGYuaW5kZXggPSB0aGlzLnBvcyAtIDE7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG4gIG1vdmUoc2VsZikge1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOaVteW8vueZuuWwhFxyXG5jbGFzcyBGaXJlIHtcclxuICBzdGFydChzZWxmLCB4LCB5KSB7XHJcbiAgICBsZXQgZCA9IChzZmcuc3RhZ2Uubm8gLyAyMCkgKiAoIHNmZy5zdGFnZS5kaWZmaWN1bHR5KTtcclxuICAgIGlmIChkID4gMSkgeyBkID0gMS4wO31cclxuICAgIGlmIChNYXRoLnJhbmRvbSgpIDwgZCkge1xyXG4gICAgICBzZWxmLmVuZW1pZXMuZW5lbXlCdWxsZXRzLnN0YXJ0KHNlbGYueCwgc2VsZi55KTtcclxuICAgICAgc2VsZi5tb3ZlRW5kID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbiAgbW92ZShzZWxmKSB7XHJcbiAgICBpZiAoc2VsZi5tb3ZlRW5kKSB7IHJldHVybjsgfVxyXG4gIH1cclxufVxyXG5cclxuLy8vIOaVteacrOS9k1xyXG5leHBvcnQgY2xhc3MgRW5lbXkgZXh0ZW5kcyBnYW1lb2JqLkdhbWVPYmogeyBcclxuICBjb25zdHJ1Y3RvcihlbmVtaWVzLHNjZW5lLHNlKSB7XHJcbiAgc3VwZXIoMCwgMCwgMCk7XHJcbiAgdGhpcy5jb2xsaXNpb25BcmVhLndpZHRoID0gMTI7XHJcbiAgdGhpcy5jb2xsaXNpb25BcmVhLmhlaWdodCA9IDg7XHJcbiAgdmFyIHRleCA9IHNmZy50ZXh0dXJlRmlsZXMuZW5lbXk7XHJcbiAgdmFyIG1hdGVyaWFsID0gZ3JhcGhpY3MuY3JlYXRlU3ByaXRlTWF0ZXJpYWwodGV4KTtcclxuICB2YXIgZ2VvbWV0cnkgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVHZW9tZXRyeSgxNik7XHJcbiAgZ3JhcGhpY3MuY3JlYXRlU3ByaXRlVVYoZ2VvbWV0cnksIHRleCwgMTYsIDE2LCAwKTtcclxuICB0aGlzLm1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gIHRoaXMuZ3JvdXBJRCA9IDA7XHJcbiAgdGhpcy56ID0gMC4wO1xyXG4gIHRoaXMuaW5kZXggPSAwO1xyXG4gIHRoaXMuc2NvcmUgPSAwO1xyXG4gIHRoaXMubXZQYXR0ZXJuID0gbnVsbDtcclxuICB0aGlzLm12ID0gbnVsbDtcclxuICB0aGlzLm1lc2gudmlzaWJsZSA9IGZhbHNlO1xyXG4gIHRoaXMuc3RhdHVzID0gdGhpcy5OT05FO1xyXG4gIHRoaXMudHlwZSA9IG51bGw7XHJcbiAgdGhpcy5saWZlID0gMDtcclxuICB0aGlzLnRhc2sgPSBudWxsO1xyXG4gIHRoaXMuaGl0XyA9IG51bGw7XHJcbiAgdGhpcy5zY2VuZSA9IHNjZW5lO1xyXG4gIHRoaXMuc2NlbmUuYWRkKHRoaXMubWVzaCk7XHJcbiAgdGhpcy5zZSA9IHNlO1xyXG4gIHRoaXMuZW5lbWllcyA9IGVuZW1pZXM7XHJcbiAgdGhpcy5OT05FID0gIDAgO1xyXG4gIHRoaXMuU1RBUlQgPSAgMSA7XHJcbiAgdGhpcy5IT01FID0gIDIgO1xyXG4gIHRoaXMuQVRUQUNLID0gIDMgO1xyXG4gIHRoaXMuQk9NQiA9ICA0IDtcclxuICBcclxufVxyXG4gIGdldCB4KCkgeyByZXR1cm4gdGhpcy54XzsgfVxyXG4gIHNldCB4KHYpIHsgdGhpcy54XyA9IHRoaXMubWVzaC5wb3NpdGlvbi54ID0gdjsgfVxyXG4gIGdldCB5KCkgeyByZXR1cm4gdGhpcy55XzsgfVxyXG4gIHNldCB5KHYpIHsgdGhpcy55XyA9IHRoaXMubWVzaC5wb3NpdGlvbi55ID0gdjsgfVxyXG4gIGdldCB6KCkgeyByZXR1cm4gdGhpcy56XzsgfVxyXG4gIHNldCB6KHYpIHsgdGhpcy56XyA9IHRoaXMubWVzaC5wb3NpdGlvbi56ID0gdjsgfVxyXG4gIFxyXG4gIC8vL+aVteOBruWLleOBjVxyXG4gIG1vdmUodGFza0luZGV4KSB7XHJcbiAgICBpZiAodGhpcy5zdGF0dXMgPT0gdGhpcy5OT05FKVxyXG4gICAge1xyXG4gICAgICBkZWJ1Z2dlcjtcclxuICAgIH1cclxuICAgIHZhciBlbmQgPSBmYWxzZTtcclxuICAgIHdoaWxlICghZW5kKSB7XHJcbiAgICAgIGlmICh0aGlzLm1vdmVFbmQgJiYgdGhpcy5pbmRleCA8ICh0aGlzLm12UGF0dGVybi5sZW5ndGggLSAxKSkge1xyXG4gICAgICAgIHRoaXMuaW5kZXgrKztcclxuICAgICAgICB0aGlzLm12ID0gdGhpcy5tdlBhdHRlcm5bdGhpcy5pbmRleF07XHJcbiAgICAgICAgZW5kID0gdGhpcy5tdi5zdGFydCh0aGlzLCB0aGlzLngsIHRoaXMueSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMubXYubW92ZSh0aGlzKTtcclxuICAgIHRoaXMubWVzaC5zY2FsZS54ID0gdGhpcy5lbmVtaWVzLmhvbWVEZWx0YTI7XHJcbiAgICB0aGlzLm1lc2gucm90YXRpb24ueiA9IHRoaXMuY2hhclJhZDtcclxuICB9XHJcbiAgXHJcbiAgLy8vIOWIneacn+WMllxyXG4gIHN0YXJ0KHgsIHksIHosIGhvbWVYLCBob21lWSwgbXZQYXR0ZXJuLCB4cmV2LHR5cGUsIGNsZWFyVGFyZ2V0LGdyb3VwSUQpIHtcclxuICAgIGlmICh0aGlzLmVuYWJsZV8pIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgdGhpcy50eXBlID0gdHlwZTtcclxuICAgIHR5cGUodGhpcyk7XHJcbiAgICB0aGlzLnggPSB4O1xyXG4gICAgdGhpcy55ID0geTtcclxuICAgIHRoaXMueiA9IHo7XHJcbiAgICB0aGlzLnhyZXYgPSB4cmV2O1xyXG4gICAgdGhpcy5lbmFibGVfID0gdHJ1ZTtcclxuICAgIHRoaXMuaG9tZVggPSBob21lWCB8fCAwO1xyXG4gICAgdGhpcy5ob21lWSA9IGhvbWVZIHx8IDA7XHJcbiAgICB0aGlzLmluZGV4ID0gMDtcclxuICAgIHRoaXMuZ3JvdXBJRCA9IGdyb3VwSUQ7XHJcbiAgICB0aGlzLm12UGF0dGVybiA9IG12UGF0dGVybjtcclxuICAgIHRoaXMuY2xlYXJUYXJnZXQgPSBjbGVhclRhcmdldCB8fCB0cnVlO1xyXG4gICAgdGhpcy5tZXNoLm1hdGVyaWFsLmNvbG9yLnNldEhleCgweEZGRkZGRik7XHJcbiAgICB0aGlzLm12ID0gbXZQYXR0ZXJuWzBdO1xyXG4gICAgdGhpcy5tdi5zdGFydCh0aGlzLCB4LCB5KTtcclxuICAgIC8vaWYgKHRoaXMuc3RhdHVzICE9IHRoaXMuTk9ORSkge1xyXG4gICAgLy8gIGRlYnVnZ2VyO1xyXG4gICAgLy99XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuU1RBUlQ7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICB0aGlzLnRhc2sgPSBzZmcudGFza3MucHVzaFRhc2soZnVuY3Rpb24gKGkpIHsgc2VsZi5tb3ZlKGkpOyB9LCAxMDAwMCk7XHJcbiAgICB0aGlzLm1lc2gudmlzaWJsZSA9IHRydWU7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbiAgXHJcbiAgaGl0KCkge1xyXG4gICAgaWYgKHRoaXMuaGl0XyA9PSBudWxsKSB7XHJcbiAgICAgIHRoaXMubGlmZS0tO1xyXG4gICAgICBpZiAodGhpcy5saWZlID09IDApIHtcclxuICAgICAgICBzZmcuYm9tYnMuc3RhcnQodGhpcy54LCB0aGlzLnkpO1xyXG4gICAgICAgIHRoaXMuc2UoMSk7XHJcbiAgICAgICAgc2ZnLmFkZFNjb3JlKHRoaXMuc2NvcmUpO1xyXG4gICAgICAgIGlmICh0aGlzLmNsZWFyVGFyZ2V0KSB7XHJcbiAgICAgICAgICB0aGlzLmVuZW1pZXMuaGl0RW5lbWllc0NvdW50Kys7XHJcbiAgICAgICAgICBpZiAodGhpcy5zdGF0dXMgPT0gdGhpcy5TVEFSVCkge1xyXG4gICAgICAgICAgICB0aGlzLmVuZW1pZXMuaG9tZUVuZW1pZXNDb3VudCsrO1xyXG4gICAgICAgICAgICB0aGlzLmVuZW1pZXMuZ3JvdXBEYXRhW3RoaXMuZ3JvdXBJRF0ucHVzaCh0aGlzKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHRoaXMuZW5lbWllcy5ncm91cERhdGFbdGhpcy5ncm91cElEXS5nb25lQ291bnQrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmVuYWJsZV8gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnN0YXR1cyA9IHRoaXMuTk9ORTtcclxuICAgICAgICBzZmcudGFza3MucmVtb3ZlVGFzayh0aGlzLnRhc2suaW5kZXgpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuc2UoMik7XHJcbiAgICAgICAgdGhpcy5tZXNoLm1hdGVyaWFsLmNvbG9yLnNldEhleCgweEZGODA4MCk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuaGl0XygpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gWmFrbyhzZWxmKSB7XHJcbiAgc2VsZi5zY29yZSA9IDUwO1xyXG4gIHNlbGYubGlmZSA9IDE7XHJcbiAgZ3JhcGhpY3MudXBkYXRlU3ByaXRlVVYoc2VsZi5tZXNoLmdlb21ldHJ5LCBzZmcudGV4dHVyZUZpbGVzLmVuZW15LCAxNiwgMTYsIDcpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBaYWtvMShzZWxmKSB7XHJcbiAgc2VsZi5zY29yZSA9IDEwMDtcclxuICBzZWxmLmxpZmUgPSAxO1xyXG4gIGdyYXBoaWNzLnVwZGF0ZVNwcml0ZVVWKHNlbGYubWVzaC5nZW9tZXRyeSwgc2ZnLnRleHR1cmVGaWxlcy5lbmVteSwgMTYsIDE2LCA2KTtcclxufVxyXG5cclxuZnVuY3Rpb24gTUJvc3Moc2VsZikge1xyXG4gIHNlbGYuc2NvcmUgPSAzMDA7XHJcbiAgc2VsZi5saWZlID0gMjtcclxuICBzZWxmLm1lc2guYmxlbmRpbmcgPSBUSFJFRS5Ob3JtYWxCbGVuZGluZztcclxuICBncmFwaGljcy51cGRhdGVTcHJpdGVVVihzZWxmLm1lc2guZ2VvbWV0cnksIHNmZy50ZXh0dXJlRmlsZXMuZW5lbXksIDE2LCAxNiwgNCk7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBFbmVtaWVze1xyXG4gIGNvbnN0cnVjdG9yKHNjZW5lLHNlLGVuZW15QnVsbGV0cykge1xyXG4gIHRoaXMuZW5lbXlCdWxsZXRzID0gZW5lbXlCdWxsZXRzO1xyXG4gIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuICB0aGlzLm5leHRUaW1lID0gMDtcclxuICB0aGlzLmN1cnJlbnRJbmRleCA9IDA7XHJcbiAgdGhpcy5lbmVtaWVzID0gbmV3IEFycmF5KDApO1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgNjQ7ICsraSkge1xyXG4gICAgdGhpcy5lbmVtaWVzLnB1c2gobmV3IEVuZW15KHRoaXMsc2NlbmUsc2UpKTtcclxuICB9XHJcbiAgZm9yKHZhciBpID0gMDtpIDwgNTsrK2kpe1xyXG4gICAgdGhpcy5ncm91cERhdGFbaV0gPSBuZXcgQXJyYXkoMCk7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g5pW157eo6ZqK44Gu5YuV44GN44KS44Kz44Oz44OI44Ot44O844Or44GZ44KLXHJcbm1vdmUoKSB7XHJcbiAgdmFyIGN1cnJlbnRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZTtcclxuICB2YXIgbW92ZVNlcXMgPSB0aGlzLm1vdmVTZXFzO1xyXG4gIHZhciBsZW4gPSBtb3ZlU2Vxc1tzZmcuc3RhZ2UucHJpdmF0ZU5vXS5sZW5ndGg7XHJcbiAgLy8g44OH44O844K/6YWN5YiX44KS44KC44Go44Gr5pW144KS55Sf5oiQXHJcbiAgd2hpbGUgKHRoaXMuY3VycmVudEluZGV4IDwgbGVuKSB7XHJcbiAgICB2YXIgZGF0YSA9IG1vdmVTZXFzW3NmZy5zdGFnZS5wcml2YXRlTm9dW3RoaXMuY3VycmVudEluZGV4XTtcclxuICAgIHZhciBuZXh0VGltZSA9IHRoaXMubmV4dFRpbWUgIT0gbnVsbCA/IHRoaXMubmV4dFRpbWUgOiBkYXRhWzBdO1xyXG4gICAgaWYgKGN1cnJlbnRUaW1lID49ICh0aGlzLm5leHRUaW1lICsgZGF0YVswXSkpIHtcclxuICAgICAgdmFyIGVuZW1pZXMgPSB0aGlzLmVuZW1pZXM7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwLCBlID0gZW5lbWllcy5sZW5ndGg7IGkgPCBlOyArK2kpIHtcclxuICAgICAgICB2YXIgZW5lbXkgPSBlbmVtaWVzW2ldO1xyXG4gICAgICAgIGlmICghZW5lbXkuZW5hYmxlXykge1xyXG4gICAgICAgICAgZW5lbXkuc3RhcnQoZGF0YVsxXSwgZGF0YVsyXSwgMCwgZGF0YVszXSwgZGF0YVs0XSwgdGhpcy5tb3ZlUGF0dGVybnNbTWF0aC5hYnMoZGF0YVs1XSldLGRhdGFbNV0gPCAwLCBkYXRhWzZdLCBkYXRhWzddLGRhdGFbOF0gfHwgMCk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5jdXJyZW50SW5kZXgrKztcclxuICAgICAgaWYgKHRoaXMuY3VycmVudEluZGV4IDwgbGVuKSB7XHJcbiAgICAgICAgdGhpcy5uZXh0VGltZSA9IGN1cnJlbnRUaW1lICsgbW92ZVNlcXNbc2ZnLnN0YWdlLnByaXZhdGVOb11bdGhpcy5jdXJyZW50SW5kZXhdWzBdO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcbiAgLy8g44Ob44O844Og44Od44K444K344On44Oz44Gr5pW144GM44GZ44G544Gm5pW05YiX44GX44Gf44GL56K66KqN44GZ44KL44CCXHJcbiAgaWYgKHRoaXMuaG9tZUVuZW1pZXNDb3VudCA9PSB0aGlzLnRvdGFsRW5lbWllc0NvdW50ICYmIHRoaXMuc3RhdHVzID09IHRoaXMuU1RBUlQpIHtcclxuICAgIC8vIOaVtOWIl+OBl+OBpuOBhOOBn+OCieaVtOWIl+ODouODvOODieOBq+enu+ihjOOBmeOCi+OAglxyXG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLkhPTUU7XHJcbiAgICB0aGlzLmVuZFRpbWUgPSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lICsgMS4wICogKDIuMCAtIHNmZy5zdGFnZS5kaWZmaWN1bHR5KTtcclxuICB9XHJcblxyXG4gIC8vIOODm+ODvOODoOODneOCuOOCt+ODp+ODs+OBp+S4gOWumuaZgumWk+W+heapn+OBmeOCi1xyXG4gIGlmICh0aGlzLnN0YXR1cyA9PSB0aGlzLkhPTUUpIHtcclxuICAgIGlmIChzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lID4gdGhpcy5lbmRUaW1lKSB7XHJcbiAgICAgIHRoaXMuc3RhdHVzID0gdGhpcy5BVFRBQ0s7XHJcbiAgICAgIHRoaXMuZW5kVGltZSA9IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgKyAoc2ZnLnN0YWdlLkRJRkZJQ1VMVFlfTUFYIC0gc2ZnLnN0YWdlLmRpZmZpY3VsdHkpICogMztcclxuICAgICAgdGhpcy5ncm91cCA9IDA7XHJcbiAgICAgIHRoaXMuY291bnQgPSAwO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8g5pS75pKD44GZ44KLXHJcbiAgaWYgKHRoaXMuc3RhdHVzID09IHRoaXMuQVRUQUNLICYmIHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgPiB0aGlzLmVuZFRpbWUpIHtcclxuICAgIHRoaXMuZW5kVGltZSA9IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgKyAoc2ZnLnN0YWdlLkRJRkZJQ1VMVFlfTUFYIC0gc2ZnLnN0YWdlLmRpZmZpY3VsdHkpICogMztcclxuICAgIHZhciBncm91cERhdGEgPSB0aGlzLmdyb3VwRGF0YTtcclxuICAgIHZhciBhdHRhY2tDb3VudCA9ICgxICsgMC4yNSAqIChzZmcuc3RhZ2UuZGlmZmljdWx0eSkpIHwgMDtcclxuICAgIHZhciBncm91cCA9IGdyb3VwRGF0YVt0aGlzLmdyb3VwXTtcclxuXHJcbiAgICBpZiAoIWdyb3VwIHx8IGdyb3VwLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgIHRoaXMuZ3JvdXAgPSAwO1xyXG4gICAgICB2YXIgZ3JvdXAgPSBncm91cERhdGFbMF07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGdyb3VwLmxlbmd0aCA+IDAgJiYgZ3JvdXAubGVuZ3RoID4gZ3JvdXAuZ29uZUNvdW50KSB7XHJcbiAgICAgIGlmICghZ3JvdXAuaW5kZXgpIHtcclxuICAgICAgICBncm91cC5pbmRleCA9IDA7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCF0aGlzLmdyb3VwKSB7XHJcbiAgICAgICAgdmFyIGNvdW50ID0gMCwgZW5kZyA9IGdyb3VwLmxlbmd0aDtcclxuICAgICAgICB3aGlsZSAoY291bnQgPCBlbmRnICYmIGF0dGFja0NvdW50ID4gMCkge1xyXG4gICAgICAgICAgdmFyIGVuID0gZ3JvdXBbZ3JvdXAuaW5kZXhdO1xyXG4gICAgICAgICAgaWYgKGVuLmVuYWJsZV8gJiYgZW4uc3RhdHVzID09IGVuLkhPTUUpIHtcclxuICAgICAgICAgICAgZW4uc3RhdHVzID0gZW4uQVRUQUNLO1xyXG4gICAgICAgICAgICAtLWF0dGFja0NvdW50O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY291bnQrKztcclxuICAgICAgICAgIGdyb3VwLmluZGV4Kys7XHJcbiAgICAgICAgICBpZiAoZ3JvdXAuaW5kZXggPj0gZ3JvdXAubGVuZ3RoKSBncm91cC5pbmRleCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSBncm91cC5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgICAgICAgdmFyIGVuID0gZ3JvdXBbaV07XHJcbiAgICAgICAgICBpZiAoZW4uZW5hYmxlXyAmJiBlbi5zdGF0dXMgPT0gZW4uSE9NRSkge1xyXG4gICAgICAgICAgICBlbi5zdGF0dXMgPSBlbi5BVFRBQ0s7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5ncm91cCsrO1xyXG4gICAgaWYgKHRoaXMuZ3JvdXAgPj0gdGhpcy5ncm91cERhdGEubGVuZ3RoKSB7XHJcbiAgICAgIHRoaXMuZ3JvdXAgPSAwO1xyXG4gICAgfVxyXG5cclxuICB9XHJcblxyXG4gIC8vIOODm+ODvOODoOODneOCuOOCt+ODp+ODs+OBp+OBruW+heapn+WLleS9nFxyXG4gIHRoaXMuaG9tZURlbHRhQ291bnQgKz0gMC4wMjU7XHJcbiAgdGhpcy5ob21lRGVsdGEgPSBNYXRoLnNpbih0aGlzLmhvbWVEZWx0YUNvdW50KSAqIDAuMDg7XHJcbiAgdGhpcy5ob21lRGVsdGEyID0gMS4wICsgTWF0aC5zaW4odGhpcy5ob21lRGVsdGFDb3VudCAqIDgpICogMC4xO1xyXG5cclxufVxyXG5cclxucmVzZXQoKSB7XHJcbiAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHRoaXMuZW5lbWllcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgdmFyIGVuID0gdGhpcy5lbmVtaWVzW2ldO1xyXG4gICAgaWYgKGVuLmVuYWJsZV8pXHJcbiAgICB7XHJcbiAgICAgIHNmZy50YXNrcy5yZW1vdmVUYXNrKGVuLnRhc2suaW5kZXgpO1xyXG4gICAgICBlbi5zdGF0dXMgPSBlbi5OT05FO1xyXG4gICAgICBlbi5lbmFibGVfID0gZmFsc2U7XHJcbiAgICAgIGVuLm1lc2gudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuY2FsY0VuZW1pZXNDb3VudCgpIHtcclxuICB2YXIgc2VxcyA9IHRoaXMubW92ZVNlcXNbc2ZnLnN0YWdlLnByaXZhdGVOb107XHJcbiAgdGhpcy50b3RhbEVuZW1pZXNDb3VudCA9IDA7XHJcbiAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHNlcXMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgIGlmIChzZXFzW2ldWzddKSB7XHJcbiAgICAgIHRoaXMudG90YWxFbmVtaWVzQ291bnQrKztcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbnN0YXJ0KCkge1xyXG4gIHRoaXMubmV4dFRpbWUgPSAwO1xyXG4gIHRoaXMuY3VycmVudEluZGV4ID0gMDtcclxuICB0aGlzLnRvdGFsRW5lbWllc0NvdW50ID0gMDtcclxuICB0aGlzLmhpdEVuZW1pZXNDb3VudCA9IDA7XHJcbiAgdGhpcy5ob21lRW5lbWllc0NvdW50ID0gMDtcclxuICB0aGlzLnN0YXR1cyA9IHRoaXMuU1RBUlQ7XHJcbiAgdmFyIGdyb3VwRGF0YSA9IHRoaXMuZ3JvdXBEYXRhO1xyXG4gIGZvciAodmFyIGkgPSAwLCBlbmQgPSBncm91cERhdGEubGVuZ3RoOyBpIDwgZW5kIDsgKytpKSB7XHJcbiAgICBncm91cERhdGFbaV0ubGVuZ3RoID0gMDtcclxuICAgIGdyb3VwRGF0YVtpXS5nb25lQ291bnQgPSAwO1xyXG4gIH1cclxufVxyXG5cclxufVxyXG5cclxuRW5lbWllcy5wcm90b3R5cGUubW92ZVBhdHRlcm5zID0gW1xyXG4gIC8vIDBcclxuICBbXHJcbiAgICBuZXcgQ2lyY2xlTW92ZShNYXRoLlBJLCAxLjEyNSAqIE1hdGguUEksIDMwMCwgMywgdHJ1ZSksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgxLjEyNSAqIE1hdGguUEksIDEuMjUgKiBNYXRoLlBJLCAyMDAsIDMsIHRydWUpLFxyXG4gICAgbmV3IEZpcmUoKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKE1hdGguUEkgLyA0LCAtMyAqIE1hdGguUEksIDQwLCA1LCBmYWxzZSksXHJcbiAgICBuZXcgR290b0hvbWUoKSxcclxuICAgIG5ldyBIb21lTW92ZSgpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoTWF0aC5QSSwwLDEwLDMsZmFsc2UpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMCwtMC4xMjUgKiBNYXRoLlBJLDIwMCwzLGZhbHNlKSxcclxuICAgIG5ldyBGaXJlKCksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgtMC4xMjUgKiBNYXRoLlBJLCAtMC4yNSAqIE1hdGguUEksIDE1MCwgMi41LCBmYWxzZSksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgzICogTWF0aC5QSSAvIDQsNCAqIE1hdGguUEksNDAsMi41LHRydWUpLFxyXG4gICAgbmV3IEdvdG8oNClcclxuXSwvLyAxXHJcbiAgW1xyXG4gICAgbmV3IENpcmNsZU1vdmUoTWF0aC5QSSwgMS4xMjUgKiBNYXRoLlBJLCAzMDAsIDUsIHRydWUpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMS4xMjUgKiBNYXRoLlBJLCAxLjI1ICogTWF0aC5QSSwgMjAwLCA1LCB0cnVlKSxcclxuICAgIG5ldyBGaXJlKCksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZShNYXRoLlBJIC8gNCwgLTMgKiBNYXRoLlBJLCA0MCwgNiwgZmFsc2UpLFxyXG4gICAgbmV3IEdvdG9Ib21lKCksXHJcbiAgICBuZXcgSG9tZU1vdmUoKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKE1hdGguUEksMCwxMCwzLGZhbHNlKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDAsLTAuMTI1ICogTWF0aC5QSSwyMDAsMyxmYWxzZSksXHJcbiAgICBuZXcgRmlyZSgpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoLTAuMTI1ICogTWF0aC5QSSwgLTAuMjUgKiBNYXRoLlBJLCAyNTAsIDMsIGZhbHNlKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDMgKiBNYXRoLlBJIC8gNCwgNCAqIE1hdGguUEksIDQwLCAzLCB0cnVlKSxcclxuICAgIG5ldyBHb3RvKDQpXHJcbiAgXSwvLyAyXHJcbiAgW1xyXG4gICAgbmV3IENpcmNsZU1vdmUoMCwgLTAuMTI1ICogTWF0aC5QSSwgMzAwLCAzLCBmYWxzZSksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgtMC4xMjUgKiBNYXRoLlBJLCAtMC4yNSAqIE1hdGguUEksIDIwMCwgMywgZmFsc2UpLFxyXG4gICAgbmV3IEZpcmUoKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDMgKiBNYXRoLlBJIC8gNCwgKDIgKyAwLjI1KSAqIE1hdGguUEksIDQwLCA1LCB0cnVlKSxcclxuICAgIG5ldyBHb3RvSG9tZSgpLFxyXG4gICAgbmV3IEhvbWVNb3ZlKCksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgwLE1hdGguUEksMTAsMyx0cnVlKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKCBNYXRoLlBJLCAxLjEyNSAqIE1hdGguUEksIDIwMCwgMywgdHJ1ZSksXHJcbiAgICBuZXcgRmlyZSgpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMS4xMjUgKiBNYXRoLlBJLCAxLjI1ICogTWF0aC5QSSwgMTUwLCAyLjUsIHRydWUpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMC4yNSAqIE1hdGguUEksLTMgKiBNYXRoLlBJLDQwLDIuNSxmYWxzZSksXHJcbiAgICBuZXcgR290byg0KVxyXG4gIF0sLy8gM1xyXG4gIFtcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDAsIC0wLjEyNSAqIE1hdGguUEksIDMwMCwgNSwgZmFsc2UpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoLTAuMTI1ICogTWF0aC5QSSwgLTAuMjUgKiBNYXRoLlBJLCAyMDAsIDUsIGZhbHNlKSxcclxuICAgIG5ldyBGaXJlKCksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgzICogTWF0aC5QSSAvIDQsICg0ICsgMC4yNSkgKiBNYXRoLlBJLCA0MCwgNiwgdHJ1ZSksXHJcbiAgICBuZXcgRmlyZSgpLFxyXG4gICAgbmV3IEdvdG9Ib21lKCksXHJcbiAgICBuZXcgSG9tZU1vdmUoKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDAsTWF0aC5QSSwxMCwzLHRydWUpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoIE1hdGguUEksIDEuMTI1ICogTWF0aC5QSSwgMjAwLCAzLCB0cnVlKSxcclxuICAgIG5ldyBGaXJlKCksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgxLjEyNSAqIE1hdGguUEksIDEuMjUgKiBNYXRoLlBJLCAxNTAsIDMsIHRydWUpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMC4yNSAqIE1hdGguUEksLTMgKiBNYXRoLlBJLDQwLDMsZmFsc2UpLFxyXG4gICAgbmV3IEdvdG8oNClcclxuICBdLFxyXG4gIFsgLy8gNFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMCwgLTAuMjUgKiBNYXRoLlBJLCAxNzYsIDQsIGZhbHNlKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDAuNzUgKiBNYXRoLlBJLCBNYXRoLlBJLCAxMTIsIDQsIHRydWUpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoTWF0aC5QSSwgMy4xMjUgKiBNYXRoLlBJLCA2NCwgNCwgdHJ1ZSksXHJcbiAgICBuZXcgR290b0hvbWUoKSxcclxuICAgIG5ldyBIb21lTW92ZSgpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMCwgMC4xMjUgKiBNYXRoLlBJLCAyNTAsIDMsIHRydWUpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMC4xMjUgKiBNYXRoLlBJLCBNYXRoLlBJLCA4MCwgMywgdHJ1ZSksXHJcbiAgICBuZXcgRmlyZSgpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoTWF0aC5QSSwgMS43NSAqIE1hdGguUEksIDUwLCAzLCB0cnVlKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDAuNzUgKiBNYXRoLlBJLCAwLjUgKiBNYXRoLlBJLCAxMDAsIDMsIGZhbHNlKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDAuNSAqIE1hdGguUEksIC0yICogTWF0aC5QSSwgMjAsIDMsIGZhbHNlKSxcclxuICAgIG5ldyBHb3RvKDMpXHJcbiAgXSxcclxuICBbLy8gNVxyXG4gICAgbmV3IENpcmNsZU1vdmUoMCwgLTAuMTI1ICogTWF0aC5QSSwgMzAwLCAzLCBmYWxzZSksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgtMC4xMjUgKiBNYXRoLlBJLCAtMC4yNSAqIE1hdGguUEksIDIwMCwgMywgZmFsc2UpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMyAqIE1hdGguUEkgLyA0LCAoMykgKiBNYXRoLlBJLCA0MCwgNSwgdHJ1ZSksXHJcbiAgICBuZXcgR290b0hvbWUoKSxcclxuICAgIG5ldyBIb21lTW92ZSgpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoTWF0aC5QSSwgMC44NzUgKiBNYXRoLlBJLCAyNTAsIDMsIGZhbHNlKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDAuODc1ICogTWF0aC5QSSwgMCwgODAsIDMsIGZhbHNlKSxcclxuICAgIG5ldyBGaXJlKCksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgwLCAtMC43NSAqIE1hdGguUEksIDUwLCAzLCBmYWxzZSksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgwLjI1ICogTWF0aC5QSSwgMC41ICogTWF0aC5QSSwgMTAwLCAzLCB0cnVlKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDAuNSAqIE1hdGguUEksIDMgKiBNYXRoLlBJLCAyMCwgMywgdHJ1ZSksXHJcbiAgICBuZXcgR290bygzKVxyXG4gIF0sXHJcbiAgWyAvLyA2IC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgxLjUgKiBNYXRoLlBJLCBNYXRoLlBJLCA5NiwgNCwgZmFsc2UpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMCwgMiAqIE1hdGguUEksIDQ4LCA0LCB0cnVlKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKE1hdGguUEksIDAuNzUgKiBNYXRoLlBJLCAzMiwgNCwgZmFsc2UpLFxyXG4gICAgbmV3IEdvdG9Ib21lKCksXHJcbiAgICBuZXcgSG9tZU1vdmUoKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKE1hdGguUEksMCwxMCwzLGZhbHNlKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDAsLTAuMTI1ICogTWF0aC5QSSwyMDAsMyxmYWxzZSksXHJcbiAgICBuZXcgRmlyZSgpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoLTAuMTI1ICogTWF0aC5QSSwgLTAuMjUgKiBNYXRoLlBJLCAxNTAsIDIuNSwgZmFsc2UpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMyAqIE1hdGguUEkgLyA0LDQgKiBNYXRoLlBJLDQwLDIuNSx0cnVlKSxcclxuICAgIG5ldyBHb3RvKDMpXHJcbiAgXSxcclxuICBbIC8vIDcgLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgbmV3IENpcmNsZU1vdmUoMCwgLTAuMjUgKiBNYXRoLlBJLCAxNzYsIDQsIGZhbHNlKSxcclxuICAgIG5ldyBGaXJlKCksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgwLjc1ICogTWF0aC5QSSwgTWF0aC5QSSwgMTEyLCA0LCB0cnVlKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKE1hdGguUEksIDIuMTI1ICogTWF0aC5QSSwgNDgsIDQsIHRydWUpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMS4xMjUgKiBNYXRoLlBJLCAgTWF0aC5QSSwgNDgsIDQsIGZhbHNlKSxcclxuICAgIG5ldyBHb3RvSG9tZSgpLFxyXG4gICAgbmV3IEhvbWVNb3ZlKCksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZShNYXRoLlBJLCAwLCAxMCwgMywgZmFsc2UpLFxyXG4gICAgbmV3IEZpcmUoKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDAsIC0wLjEyNSAqIE1hdGguUEksIDIwMCwgMywgZmFsc2UpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoLTAuMTI1ICogTWF0aC5QSSwgLTAuMjUgKiBNYXRoLlBJLCAxNTAsIDIuNSwgZmFsc2UpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMyAqIE1hdGguUEkgLyA0LCA0ICogTWF0aC5QSSwgNDAsIDIuNSwgdHJ1ZSksXHJcbiAgICBuZXcgR290byg1KVxyXG4gIF1cclxuXVxyXG47XHJcbkVuZW1pZXMucHJvdG90eXBlLm1vdmVTZXFzID0gW1xyXG4gIFtcclxuICAgIC8vICoqKiBTVEFHRSAxICoqKiAvL1xyXG4gICAgWzAuOCwgNTYsIDE3NiwgNzUsIDQwLCA3LCBaYWtvLCB0cnVlXSxcclxuICAgIFswLjA4LCA1NiwgMTc2LCAzNSwgNDAsIDcsIFpha28sIHRydWVdLFxyXG4gICAgWzAuMDgsIDU2LCAxNzYsIDU1LCA0MCwgNywgWmFrbywgdHJ1ZV0sXHJcbiAgICBbMC4wOCwgNTYsIDE3NiwgMTUsIDQwLCA3LCBaYWtvLCB0cnVlXSxcclxuICAgIFswLjA4LCA1NiwgMTc2LCA3NSwgLTEyMCwgNCwgWmFrbywgdHJ1ZV0sXHJcblxyXG4gICAgWzAuOCwgLTU2LCAxNzYsIC03NSwgNDAsIC03LCBaYWtvLCB0cnVlXSxcclxuICAgIFswLjA4LCAtNTYsIDE3NiwgLTM1LCA0MCwgLTcsIFpha28sIHRydWVdLFxyXG4gICAgWzAuMDgsIC01NiwgMTc2LCAtNTUsIDQwLCAtNywgWmFrbywgdHJ1ZV0sXHJcbiAgICBbMC4wOCwgLTU2LCAxNzYsIC0xNSwgNDAsIC03LCBaYWtvLCB0cnVlXSxcclxuICAgIFswLjA4LCAtNTYsIDE3NiwgLTc1LCAtMTIwLCAtNCwgWmFrbywgdHJ1ZV0sXHJcblxyXG4gICAgWzAuOCwgMTI4LCAtMTI4LCA3NSwgNjAsIDYsIFpha28sIHRydWVdLFxyXG4gICAgWzAuMDgsIDEyOCwgLTEyOCwgMzUsIDYwLCA2LCBaYWtvLCB0cnVlXSxcclxuICAgIFswLjA4LCAxMjgsIC0xMjgsIDU1LCA2MCwgNiwgWmFrbywgdHJ1ZV0sXHJcbiAgICBbMC4wOCwgMTI4LCAtMTI4LCAxNSwgNjAsIDYsIFpha28sIHRydWVdLFxyXG4gICAgWzAuMDgsIDEyOCwgLTEyOCwgOTUsIDYwLCA2LCBaYWtvLCB0cnVlXSxcclxuXHJcbiAgICBbMC44LCAtMTI4LCAtMTI4LCAtNzUsIDYwLCAtNiwgWmFrbywgdHJ1ZV0sXHJcbiAgICBbMC4wOCwgLTEyOCwgLTEyOCwgLTM1LCA2MCwgLTYsIFpha28sIHRydWVdLFxyXG4gICAgWzAuMDgsIC0xMjgsIC0xMjgsIC01NSwgNjAsIC02LCBaYWtvLCB0cnVlXSxcclxuICAgIFswLjA4LCAtMTI4LCAtMTI4LCAtMTUsIDYwLCAtNiwgWmFrbywgdHJ1ZV0sXHJcbiAgICBbMC4wOCwgLTEyOCwgLTEyOCwgLTk1LCA2MCwgLTYsIFpha28sIHRydWVdLFxyXG5cclxuICAgIFswLjcsIDAsIDE3NiwgNzUsIDgwLCAxLCBaYWtvMSwgdHJ1ZV0sXHJcbiAgICBbMC4wNSwgMCwgMTc2LCAzNSwgODAsIDEsIFpha28xLCB0cnVlXSxcclxuICAgIFswLjA1LCAwLCAxNzYsIDU1LCA4MCwgMSwgWmFrbzEsIHRydWVdLFxyXG4gICAgWzAuMDUsIDAsIDE3NiwgMTUsIDgwLCAxLCBaYWtvMSwgdHJ1ZV0sXHJcbiAgICBbMC4wNSwgMCwgMTc2LCA5NSwgODAsIDEsIFpha28xLCB0cnVlXSxcclxuXHJcbiAgICBbMC43LCAwLCAxNzYsIC03NSwgODAsIDMsIFpha28xLCB0cnVlXSxcclxuICAgIFswLjA1LCAwLCAxNzYsIC0zNSwgODAsIDMsIFpha28xLCB0cnVlXSxcclxuICAgIFswLjA1LCAwLCAxNzYsIC01NSwgODAsIDMsIFpha28xLCB0cnVlXSxcclxuICAgIFswLjA1LCAwLCAxNzYsIC0xNSwgODAsIDMsIFpha28xLCB0cnVlXSxcclxuICAgIFswLjA1LCAwLCAxNzYsIC05NSwgODAsIDMsIFpha28xLCB0cnVlXSxcclxuXHJcbiAgICBbMC43LCAwLCAxNzYsIDg1LCAxMjAsIDEsIE1Cb3NzLCB0cnVlLDFdLFxyXG4gICAgWzAuMDUsIDAsIDE3NiwgOTUsIDEwMCwgMSwgWmFrbzEsIHRydWUsMV0sXHJcbiAgICBbMC4wNSwgMCwgMTc2LCA3NSwgMTAwLCAxLCBaYWtvMSwgdHJ1ZSwxXSxcclxuICAgIFswLjA1LCAwLCAxNzYsIDQ1LCAxMjAsIDEsIE1Cb3NzLCB0cnVlLDJdLFxyXG4gICAgWzAuMDUsIDAsIDE3NiwgNTUsIDEwMCwgMSwgWmFrbzEsIHRydWUsMl0sXHJcbiAgICBbMC4wNSwgMCwgMTc2LCAzNSwgMTAwLCAxLCBaYWtvMSwgdHJ1ZSwyXSxcclxuICAgIFswLjA1LCAwLCAxNzYsIDY1LCAxMjAsIDEsIE1Cb3NzLCB0cnVlXSxcclxuICAgIFswLjA1LCAwLCAxNzYsIDE1LCAxMDAsIDEsIFpha28xLCB0cnVlXSxcclxuICAgIFswLjA1LCAwLCAxNzYsIDI1LCAxMjAsIDEsIE1Cb3NzLCB0cnVlXSxcclxuXHJcbiAgICBbMC44LCAwLCAxNzYsIC04NSwgMTIwLCAzLCBNQm9zcywgdHJ1ZSwzXSxcclxuICAgIFswLjA1LCAwLCAxNzYsIC05NSwgMTAwLCAzLCBaYWtvMSwgdHJ1ZSwzXSxcclxuICAgIFswLjA1LCAwLCAxNzYsIC03NSwgMTAwLCAzLCBaYWtvMSwgdHJ1ZSwzXSxcclxuICAgIFswLjA1LCAwLCAxNzYsIC00NSwgMTIwLCAzLCBNQm9zcywgdHJ1ZSw0XSxcclxuICAgIFswLjA1LCAwLCAxNzYsIC01NSwgMTAwLCAzLCBaYWtvMSwgdHJ1ZSw0XSxcclxuICAgIFswLjA1LCAwLCAxNzYsIC0zNSwgMTAwLCAzLCBaYWtvMSwgdHJ1ZSw0XSxcclxuICAgIFswLjA1LCAwLCAxNzYsIC02NSwgMTIwLCAzLCBNQm9zcywgdHJ1ZV0sXHJcbiAgICBbMC4wNSwgMCwgMTc2LCAtMTUsIDEwMCwgMywgWmFrbzEsIHRydWVdLFxyXG4gICAgWzAuMDUsIDAsIDE3NiwgLTI1LCAxMjAsIDMsIE1Cb3NzLCB0cnVlXVxyXG4gIF1cclxuXTtcclxuXHJcbkVuZW1pZXMucHJvdG90eXBlLnRvdGFsRW5lbWllc0NvdW50ID0gMDtcclxuRW5lbWllcy5wcm90b3R5cGUuaGl0RW5lbWllc0NvdW50ID0gMDtcclxuRW5lbWllcy5wcm90b3R5cGUuaG9tZUVuZW1pZXNDb3VudCA9IDA7XHJcbkVuZW1pZXMucHJvdG90eXBlLmhvbWVEZWx0YSA9IDA7XHJcbkVuZW1pZXMucHJvdG90eXBlLmhvbWVEZWx0YUNvdW50ID0gMDtcclxuRW5lbWllcy5wcm90b3R5cGUuaG9tZURlbHRhMiA9IDA7XHJcbkVuZW1pZXMucHJvdG90eXBlLmdyb3VwRGF0YSA9IFtdO1xyXG5FbmVtaWVzLnByb3RvdHlwZS5OT05FID0gMCB8IDA7XHJcbkVuZW1pZXMucHJvdG90eXBlLlNUQVJUID0gMSB8IDA7XHJcbkVuZW1pZXMucHJvdG90eXBlLkhPTUUgPSAyIHwgMDtcclxuRW5lbWllcy5wcm90b3R5cGUuQVRUQUNLID0gMyB8IDA7XHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuLy92YXIgU1RBR0VfTUFYID0gMTtcclxuaW1wb3J0ICogYXMgc2ZnIGZyb20gJy4vZ2xvYmFsJzsgXHJcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsJztcclxuaW1wb3J0ICogYXMgYXVkaW8gZnJvbSAnLi9hdWRpbyc7XHJcbi8vaW1wb3J0ICogYXMgc29uZyBmcm9tICcuL3NvbmcnO1xyXG5pbXBvcnQgKiBhcyBncmFwaGljcyBmcm9tICcuL2dyYXBoaWNzJztcclxuaW1wb3J0ICogYXMgaW8gZnJvbSAnLi9pbyc7XHJcbmltcG9ydCAqIGFzIGNvbW0gZnJvbSAnLi9jb21tJztcclxuaW1wb3J0ICogYXMgdGV4dCBmcm9tICcuL3RleHQnO1xyXG5pbXBvcnQgKiBhcyBnYW1lb2JqIGZyb20gJy4vZ2FtZW9iaic7XHJcbmltcG9ydCAqIGFzIG15c2hpcCBmcm9tICcuL215c2hpcCc7XHJcbmltcG9ydCAqIGFzIGVuZW1pZXMgZnJvbSAnLi9lbmVtaWVzJztcclxuaW1wb3J0ICogYXMgZWZmZWN0b2JqIGZyb20gJy4vZWZmZWN0b2JqJztcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjYWxjU2NyZWVuU2l6ZSgpIHtcclxuICAgIENPTlNPTEVfV0lEVEggPSB3aW5kb3cuaW5uZXJXaWR0aDtcclxuICAgIENPTlNPTEVfSEVJR0hUID0gd2luZG93LmlubmVySGVpZ2h0O1xyXG4gICAgaWYgKENPTlNPTEVfV0lEVEggPj0gQ09OU09MRV9IRUlHSFQpIHtcclxuICAgICAgQ09OU09MRV9XSURUSCA9IENPTlNPTEVfSEVJR0hUICogc2ZnLlZJUlRVQUxfV0lEVEggLyBzZmcuVklSVFVBTF9IRUlHSFQ7XHJcbiAgICAgIHdoaWxlKENPTlNPTEVfV0lEVEggPiB3aW5kb3cuaW5uZXJXaWR0aCl7XHJcbiAgICAgICAgLS1DT05TT0xFX0hFSUdIVDtcclxuICAgICAgICBDT05TT0xFX1dJRFRIID0gQ09OU09MRV9IRUlHSFQgKiBzZmcuVklSVFVBTF9XSURUSCAvIHNmZy5WSVJUVUFMX0hFSUdIVDtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgQ09OU09MRV9IRUlHSFQgPSBDT05TT0xFX1dJRFRIICogc2ZnLlZJUlRVQUxfSEVJR0hUIC8gc2ZnLlZJUlRVQUxfV0lEVEg7XHJcbiAgICAgIHdoaWxlKENPTlNPTEVfSEVJR0hUID4gd2luZG93LmlubmVySGVpZ2h0KXtcclxuICAgICAgICAtLUNPTlNPTEVfV0lEVEg7XHJcbiAgICAgICAgQ09OU09MRV9IRUlHSFQgPSBDT05TT0xFX1dJRFRIICogc2ZnLlZJUlRVQUxfSEVJR0hUIC8gc2ZnLlZJUlRVQUxfV0lEVEg7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGNvbnNvbGUubG9nKENPTlNPTEVfV0lEVEgsQ09OU09MRV9IRUlHSFQpO1xyXG59XHJcblxyXG52YXIgQ09OU09MRV9XSURUSDtcclxudmFyIENPTlNPTEVfSEVJR0hUO1xyXG5cclxudmFyIHJlbmRlcmVyO1xyXG52YXIgc3RhdHM7XHJcbnZhciBzY2VuZTtcclxudmFyIGNhbWVyYTtcclxudmFyIGF1dGhvcjtcclxudmFyIHByb2dyZXNzO1xyXG52YXIgdGV4dFBsYW5lO1xyXG52YXIgYmFzaWNJbnB1dCA9IG5ldyBpby5CYXNpY0lucHV0KCk7XHJcbnZhciB0YXNrcyA9IG5ldyB1dGlsLlRhc2tzKCk7XHJcbnNmZy50YXNrcyA9IHRhc2tzO1xyXG52YXIgd2F2ZUdyYXBoO1xyXG52YXIgc3RhcnQgPSBmYWxzZTtcclxudmFyIGJhc2VUaW1lID0gK25ldyBEYXRlO1xyXG52YXIgZCA9IC0wLjI7XHJcbnZhciBhdWRpb187XHJcbnZhciBzZXF1ZW5jZXI7XHJcbnZhciBwaWFubztcclxudmFyIHNjb3JlID0gMDtcclxudmFyIGhpZ2hTY29yZSA9IDA7XHJcbnZhciBoaWdoU2NvcmVzID0gW107XHJcbnZhciBpc0hpZGRlbiA9IGZhbHNlO1xyXG4vL3ZhciBzdGFnZU5vID0gMTtcclxuLy92YXIgc2ZnLnN0YWdlO1xyXG4vL3ZhciBzdGFnZVN0YXRlID0gO1xyXG52YXIgZW5lbWllc187XHJcbnZhciBlbmVteUJ1bGxldHM7XHJcbnZhciBQSSA9IE1hdGguUEk7XHJcbnZhciBjb21tXztcclxudmFyIGhhbmRsZU5hbWUgPSAnJztcclxudmFyIHN0b3JhZ2U7XHJcbnZhciByYW5rID0gLTE7XHJcbnZhciBzb3VuZEVmZmVjdHM7XHJcbnZhciBlbnM7XHJcbnZhciBlbmJzO1xyXG5cclxuY2xhc3MgU2NvcmVFbnRyeXtcclxuICBjb25zdHJ1Y3RvcihuYW1lLCBzY29yZSkge1xyXG4gIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgdGhpcy5zY29yZSA9IHNjb3JlO1xyXG59XHJcbn1cclxuXHJcblxyXG5jbGFzcyBTdGFnZSB7XHJcbiAgY29uc3RydWN0b3IoKXtcclxuICAgIHRoaXMuTUFYID0gMTtcclxuICAgIHRoaXMuRElGRklDVUxUWV9NQVggPSAyLjA7XHJcbiAgICB0aGlzLm5vID0gMTtcclxuICAgIHRoaXMucHJpdmF0ZU5vID0gMDtcclxuICAgIHRoaXMuZGlmZmljdWx0eSA9IDE7XHJcbiAgfVxyXG4gIHJlc2V0KCl7XHJcbiAgICB0aGlzLm5vID0gMTtcclxuICAgIHRoaXMucHJpdmF0ZU5vID0gMDtcclxuICAgIHRoaXMuZGlmZmljdWx0eSA9IDE7XHJcbiAgfVxyXG4gIGFkdmFuY2UoKXtcclxuICAgIHRoaXMubm8rKztcclxuICAgIHRoaXMucHJpdmF0ZU5vKys7XHJcblxyXG4gICAgaWYgKHRoaXMuZGlmZmljdWx0eSA8IHRoaXMuRElGRklDVUxUWV9NQVgpIHtcclxuICAgICAgdGhpcy5kaWZmaWN1bHR5ICs9IDAuMDU7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMucHJpdmF0ZU5vID49IHRoaXMuTUFYKSB7XHJcbiAgICAgIHRoaXMucHJpdmF0ZU5vID0gMDtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8vIGhpZGRlbiDjg5fjg63jg5Hjg4bjgqPjgYrjgojjgbPlj6/oppbmgKfjga7lpInmm7TjgqTjg5njg7Pjg4jjga7lkI3liY3jgpLoqK3lrppcclxudmFyIGhpZGRlbiwgdmlzaWJpbGl0eUNoYW5nZTtcclxuaWYgKHR5cGVvZiBkb2N1bWVudC5oaWRkZW4gIT09IFwidW5kZWZpbmVkXCIpIHsgLy8gT3BlcmEgMTIuMTAg44KEIEZpcmVmb3ggMTgg5Lul6ZmN44Gn44K144Od44O844OIIFxyXG4gIGhpZGRlbiA9IFwiaGlkZGVuXCI7XHJcbiAgdmlzaWJpbGl0eUNoYW5nZSA9IFwidmlzaWJpbGl0eWNoYW5nZVwiO1xyXG59IGVsc2UgaWYgKHR5cGVvZiBkb2N1bWVudC5tb3pIaWRkZW4gIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICBoaWRkZW4gPSBcIm1vekhpZGRlblwiO1xyXG4gIHZpc2liaWxpdHlDaGFuZ2UgPSBcIm1venZpc2liaWxpdHljaGFuZ2VcIjtcclxufSBlbHNlIGlmICh0eXBlb2YgZG9jdW1lbnQubXNIaWRkZW4gIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICBoaWRkZW4gPSBcIm1zSGlkZGVuXCI7XHJcbiAgdmlzaWJpbGl0eUNoYW5nZSA9IFwibXN2aXNpYmlsaXR5Y2hhbmdlXCI7XHJcbn0gZWxzZSBpZiAodHlwZW9mIGRvY3VtZW50LndlYmtpdEhpZGRlbiAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gIGhpZGRlbiA9IFwid2Via2l0SGlkZGVuXCI7XHJcbiAgdmlzaWJpbGl0eUNoYW5nZSA9IFwid2Via2l0dmlzaWJpbGl0eWNoYW5nZVwiO1xyXG59XHJcblxyXG4vLy8g44OW44Op44Km44K244Gu5qmf6IO944OB44Kn44OD44KvXHJcbmZ1bmN0aW9uIGNoZWNrQnJvd3NlclN1cHBvcnQob3V0cHV0KSB7XHJcbiAgdmFyIGNvbnRlbnQgPSAnPGltZyBjbGFzcz1cImVycm9yaW1nXCIgc3JjPVwiaHR0cDovL3B1YmxpYy5ibHUubGl2ZWZpbGVzdG9yZS5jb20veTJwYlkzYXFCejZ3ejRhaDg3UlhFVms1Q2xoRDJMdWpDNU5zNjZIS3ZSODlhanJGZExNMFR4RmVyWVlVUnQ4M2NfYmczNUhTa3FjM0U4R3hhRkQ4LVg5NE1Mc0ZWNUdVNkJZcDE5NUl2ZWdldlEvMjAxMzEwMDEucG5nP3BzaWQ9MVwiIHdpZHRoPVwiNDc5XCIgaGVpZ2h0PVwiNjQwXCIgY2xhc3M9XCJhbGlnbm5vbmVcIiAvPic7XHJcbiAgLy8gV2ViR0zjga7jgrXjg53jg7zjg4jjg4Hjgqfjg4Pjgq9cclxuICBpZiAoIURldGVjdG9yLndlYmdsKSB7XHJcbiAgICBkMy5zZWxlY3QoJyNjb250ZW50JykuYXBwZW5kKCdkaXYnKS5jbGFzc2VkKCdlcnJvcicsdHJ1ZSkuaHRtbChcclxuICAgICAgY29udGVudCArICc8cCBjbGFzcz1cImVycm9ydGV4dFwiPuODluODqeOCpuOCtuOBjDxici8+V2ViR0zjgpLjgrXjg53jg7zjg4jjgZfjgabjgYTjgarjgYTjgZ/jgoE8YnIvPuWLleS9nOOBhOOBn+OBl+OBvuOBm+OCk+OAgjwvcD4nKTtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8vIFdlYiBBdWRpbyBBUEnjg6njg4Pjg5Hjg7xcclxuICBpZiAoIWF1ZGlvXy5lbmFibGUpIHtcclxuICAgIGQzLnNlbGVjdCgnI2NvbnRlbnQnKS5hcHBlbmQoJ2RpdicpLmNsYXNzZWQoJ2Vycm9yJyx0cnVlKS5odG1sKFxyXG4gICAgICBjb250ZW50ICsgJzxwIGNsYXNzPVwiZXJyb3J0ZXh0XCI+44OW44Op44Km44K244GMPGJyLz5XZWIgQXVkaW8gQVBJ44KS44K144Od44O844OI44GX44Gm44GE44Gq44GE44Gf44KBPGJyLz7li5XkvZzjgYTjgZ/jgZfjgb7jgZvjgpPjgII8L3A+Jyk7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvLyDjg5bjg6njgqbjgrbjgYxQYWdlIFZpc2liaWxpdHkgQVBJIOOCkuOCteODneODvOODiOOBl+OBquOBhOWgtOWQiOOBq+itpuWRiiBcclxuICBpZiAodHlwZW9mIGhpZGRlbiA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgIGQzLnNlbGVjdCgnI2NvbnRlbnQnKS5hcHBlbmQoJ2RpdicpLmNsYXNzZWQoJ2Vycm9yJyx0cnVlKS5odG1sKFxyXG4gICAgICBjb250ZW50ICsgJzxwIGNsYXNzPVwiZXJyb3J0ZXh0XCI+44OW44Op44Km44K244GMPGJyLz5QYWdlIFZpc2liaWxpdHkgQVBJ44KS44K144Od44O844OI44GX44Gm44GE44Gq44GE44Gf44KBPGJyLz7li5XkvZzjgYTjgZ/jgZfjgb7jgZvjgpPjgII8L3A+Jyk7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBpZiAodHlwZW9mIGxvY2FsU3RvcmFnZSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgIGQzLnNlbGVjdCgnI2NvbnRlbnQnKS5hcHBlbmQoJ2RpdicpLmNsYXNzZWQoJ2Vycm9yJyx0cnVlKS5odG1sKFxyXG4gICAgICBjb250ZW50ICsgJzxwIGNsYXNzPVwiZXJyb3J0ZXh0XCI+44OW44Op44Km44K244GMPGJyLz5XZWIgTG9jYWwgU3RvcmFnZeOCkuOCteODneODvOODiOOBl+OBpuOBhOOBquOBhOOBn+OCgTxici8+5YuV5L2c44GE44Gf44GX44G+44Gb44KT44CCPC9wPicpO1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBzdG9yYWdlID0gbG9jYWxTdG9yYWdlO1xyXG4gIH1cclxuICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxuLy8vIOOCs+ODs+OCveODvOODq+eUu+mdouOBruWIneacn+WMllxyXG5mdW5jdGlvbiBpbml0Q29uc29sZSgpIHtcclxuICAvLyDjg6zjg7Pjg4Djg6njg7zjga7kvZzmiJBcclxuICByZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKHsgYW50aWFsaWFzOiBmYWxzZSxzb3J0T2JqZWN0czogdHJ1ZSB9KTtcclxuICBjYWxjU2NyZWVuU2l6ZSgpO1xyXG4gIHJlbmRlcmVyLnNldFNpemUoQ09OU09MRV9XSURUSCwgQ09OU09MRV9IRUlHSFQpO1xyXG4gIHJlbmRlcmVyLnNldENsZWFyQ29sb3IoMCwxKTtcclxuICByZW5kZXJlci5kb21FbGVtZW50LmlkID0gJ2NvbnNvbGUnO1xyXG4gIHJlbmRlcmVyLmRvbUVsZW1lbnQuY2xhc3NOYW1lID0gJ2NvbnNvbGUnO1xyXG4gIHJlbmRlcmVyLmRvbUVsZW1lbnQuc3R5bGUuekluZGV4ID0gMDtcclxuXHJcbiAgZDMuc2VsZWN0KCcjY29udGVudCcpLm5vZGUoKS5hcHBlbmRDaGlsZChyZW5kZXJlci5kb21FbGVtZW50KTtcclxuXHJcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgY2FsY1NjcmVlblNpemUoKTtcclxuICAgICAgcmVuZGVyZXIuc2V0U2l6ZShDT05TT0xFX1dJRFRILCBDT05TT0xFX0hFSUdIVCk7XHJcbiAgfSk7XHJcbiAgLy8gU3RhdHMg44Kq44OW44K444Kn44Kv44OIKEZQU+ihqOekuinjga7kvZzmiJDooajnpLpcclxuICBzdGF0cyA9IG5ldyBTdGF0cygpO1xyXG4gIHN0YXRzLmRvbUVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xyXG4gIHN0YXRzLmRvbUVsZW1lbnQuc3R5bGUudG9wID0gJzBweCc7XHJcbiAgZDMuc2VsZWN0KCcjY29udGVudCcpLm5vZGUoKS5hcHBlbmRDaGlsZChzdGF0cy5kb21FbGVtZW50KTtcclxuICBzdGF0cy5kb21FbGVtZW50LnN0eWxlLmxlZnQgPSByZW5kZXJlci5kb21FbGVtZW50LnN0eWxlLmxlZnQ7XHJcblxyXG4gIC8vMkTmj4/nlLvjgrPjg7Pjg4bjgq3jgrnjg4jjga7ooajnpLpcclxuXHJcbiAgLyogICAgICBjdHggPSAkKCcjaW5mby1kaXNwbGF5JykuY3NzKCd6LWluZGV4JywgMik7XHJcbiAgICAgICAgY3R4ID0gJCgnI2luZm8tZGlzcGxheScpWzBdLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICAgICAgY3R4LnNldFRyYW5zZm9ybSgxLCAwLCAwLCAxLCAwLCAwKTtcclxuICAgICAgICBjdHguZm9udCA9IFwiMTJweCAn77yt77yzIOOCtOOCt+ODg+OCrydcIjsqL1xyXG5cclxuXHJcbiAgLy8g44K344O844Oz44Gu5L2c5oiQXHJcbiAgc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcclxuXHJcbiAgLy8g44Kr44Oh44Op44Gu5L2c5oiQXHJcbiAgY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDkwLjAsIHNmZy5WSVJUVUFMX1dJRFRIIC8gc2ZnLlZJUlRVQUxfSEVJR0hUKTtcclxuICBjYW1lcmEucG9zaXRpb24ueiA9IHNmZy5WSVJUVUFMX0hFSUdIVCAvIDI7XHJcbiAgY2FtZXJhLmxvb2tBdChuZXcgVEhSRUUuVmVjdG9yMygwLCAwLCAwKSk7XHJcblxyXG4gIC8vdmFyIGNhbWVyYSA9IG5ldyBUSFJFRS5DYW1lcmEoKTtcclxuICAvL2NhbWVyYS5wb3NpdGlvbi56ID0gMS4wO1xyXG5cclxuICAvLyDjg6njgqTjg4jjga7kvZzmiJBcclxuICAvL3ZhciBsaWdodCA9IG5ldyBUSFJFRS5EaXJlY3Rpb25hbExpZ2h0KDB4ZmZmZmZmKTtcclxuICAvL2xpZ2h0LnBvc2l0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjMoMC41NzcsIDAuNTc3LCAwLjU3Nyk7XHJcbiAgLy9zY2VuZS5hZGQobGlnaHQpO1xyXG5cclxuICAvL3ZhciBhbWJpZW50ID0gbmV3IFRIUkVFLkFtYmllbnRMaWdodCgweGZmZmZmZik7XHJcbiAgLy9zY2VuZS5hZGQoYW1iaWVudCk7XHJcbiAgcmVuZGVyZXIuY2xlYXIoKTtcclxufVxyXG5cclxuLy8vIOOCqOODqeODvOOBp+e1guS6huOBmeOCi+OAglxyXG5mdW5jdGlvbiBFeGl0RXJyb3IoZSkge1xyXG4gIC8vY3R4LmZpbGxTdHlsZSA9IFwicmVkXCI7XHJcbiAgLy9jdHguZmlsbFJlY3QoMCwgMCwgQ09OU09MRV9XSURUSCwgQ09OU09MRV9IRUlHSFQpO1xyXG4gIC8vY3R4LmZpbGxTdHlsZSA9IFwid2hpdGVcIjtcclxuICAvL2N0eC5maWxsVGV4dChcIkVycm9yIDogXCIgKyBlLCAwLCAyMCk7XHJcbiAgLy8vL2FsZXJ0KGUpO1xyXG4gIHN0YXJ0ID0gZmFsc2U7XHJcbiAgdGhyb3cgZTtcclxufVxyXG5cclxuZnVuY3Rpb24gb25WaXNpYmlsaXR5Q2hhbmdlKClcclxue1xyXG4gIHZhciBoID0gZG9jdW1lbnRbaGlkZGVuXTtcclxuICBpc0hpZGRlbiA9IGg7XHJcbiAgaWYgKGgpIHtcclxuICAgIGlmKHNmZy5nYW1lVGltZXIuc3RhdHVzID09IHNmZy5nYW1lVGltZXIuU1RBUlQpXHJcbiAgICB7XHJcbiAgICAgIHNmZy5nYW1lVGltZXIucGF1c2UoKTtcclxuICAgICAgY29uc29sZS5sb2coc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSk7XHJcbiAgICB9XHJcbiAgICBpZiAoc2VxdWVuY2VyLnN0YXR1cyA9PSBzZXF1ZW5jZXIuUExBWSkge1xyXG4gICAgICBzZXF1ZW5jZXIucGF1c2UoKTtcclxuICAgIH1cclxuICAgIC8vZG9jdW1lbnQudGl0bGUgPSAnKFBhdXNlKSBHYWxheHkgRmlnaHQgR2FtZSAnO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBpZiAoc2ZnLmdhbWVUaW1lci5zdGF0dXMgPT0gc2ZnLmdhbWVUaW1lci5QQVVTRSkge1xyXG4gICAgICBzZmcuZ2FtZVRpbWVyLnJlc3VtZSgpO1xyXG4gICAgICBjb25zb2xlLmxvZyhzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lKTtcclxuICAgIH1cclxuICAgIGlmIChzZXF1ZW5jZXIuc3RhdHVzID09IHNlcXVlbmNlci5QQVVTRSkge1xyXG4gICAgICBzZXF1ZW5jZXIucmVzdW1lKCk7XHJcbiAgICB9XHJcbiAgICAvL2RvY3VtZW50LnRpdGxlID0gJ0dhbGF4eSBGaWdodCBHYW1lICc7XHJcbiAgICAvL2dhbWUoKTtcclxuICB9XHJcbn1cclxuLy8vIOePvuWcqOaZgumWk+OBruWPluW+l1xyXG5mdW5jdGlvbiBnZXRDdXJyZW50VGltZSgpIHtcclxuICByZXR1cm4gYXVkaW9fLmF1ZGlvY3R4LmN1cnJlbnRUaW1lO1xyXG59XHJcblxyXG5cclxuLy8vIOODoeOCpOODs1xyXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24gKCkge1xyXG5cclxuICBhdWRpb18gPSBuZXcgYXVkaW8uQXVkaW8oKTtcclxuXHJcbiAgaWYgKCFjaGVja0Jyb3dzZXJTdXBwb3J0KCcjY29udGVudCcpKSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBzZXF1ZW5jZXIgPSBuZXcgYXVkaW8uU2VxdWVuY2VyKGF1ZGlvXyk7XHJcbiAgLy9waWFubyA9IG5ldyBhdWRpby5QaWFubyhhdWRpb18pO1xyXG4gIHNvdW5kRWZmZWN0cyA9IG5ldyBhdWRpby5Tb3VuZEVmZmVjdHMoc2VxdWVuY2VyKTtcclxuXHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcih2aXNpYmlsaXR5Q2hhbmdlLCBvblZpc2liaWxpdHlDaGFuZ2UsIGZhbHNlKTtcclxuICBzZmcuZ2FtZVRpbWVyID0gbmV3IHV0aWwuR2FtZVRpbWVyKGdldEN1cnJlbnRUaW1lKTtcclxuXHJcbiAgLy8vIOOCsuODvOODoOOCs+ODs+OCveODvOODq+OBruWIneacn+WMllxyXG4gIGluaXRDb25zb2xlKCk7XHJcbiAgLy8g44Kt44O85YWl5Yqb5Yem55CG44Gu6Kit5a6aIC8vXHJcbiAgLy9kMy5zZWxlY3QoJ2JvZHknKS5vbigna2V5ZG93bicsZnVuY3Rpb24gKCkgeyByZXR1cm4gYmFzaWNJbnB1dC5rZXlkb3duKGQzLmV2ZW50KTsgfSk7XHJcbiAgLy9kMy5zZWxlY3QoJ2JvZHknKS5vbigna2V5dXAnLGZ1bmN0aW9uICgpIHsgcmV0dXJuIGJhc2ljSW5wdXQua2V5dXAoZDMuZXZlbnQpOyB9KTtcclxuXHJcbiAgLy8vIOOCsuODvOODoOS4reOBruODhuOCr+OCueODgeODo+ODvOWumue+qVxyXG4gIHZhciB0ZXh0dXJlcyA9IHtcclxuICAgIGZvbnQ6ICdGb250LnBuZycsXHJcbiAgICBmb250MTonRm9udDIucG5nJyxcclxuICAgIGF1dGhvcjonYXV0aG9yLnBuZycsXHJcbiAgICB0aXRsZTogJ1RJVExFLnBuZycsXHJcbiAgICBteXNoaXA6J215c2hpcDIucG5nJyxcclxuICAgIGVuZW15OidlbmVteS5wbmcnLFxyXG4gICAgYm9tYjonYm9tYi5wbmcnXHJcbiAgfTtcclxuICAvLy8g44OG44Kv44K544OB44Oj44O844Gu44Ot44O844OJXHJcbiAgXHJcbiAgdmFyIGxvYWRQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKCk7XHJcbiAgdmFyIGxvYWRlciA9IG5ldyBUSFJFRS5UZXh0dXJlTG9hZGVyKCk7XHJcbiAgZnVuY3Rpb24gbG9hZFRleHR1cmUoc3JjKVxyXG4gIHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSxyZWplY3QpPT57XHJcbiAgICAgIGxvYWRlci5sb2FkKHNyYywodGV4dHVyZSk9PntcclxuICAgICAgICB0ZXh0dXJlLm1hZ0ZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XHJcbiAgICAgICAgdGV4dHVyZS5taW5GaWx0ZXIgPSBUSFJFRS5MaW5lYXJNaXBNYXBMaW5lYXJGaWx0ZXI7XHJcbiAgICAgICAgcmVzb2x2ZSh0ZXh0dXJlKTtcclxuICAgICAgfSxudWxsLCh4aHIpPT57cmVqZWN0KHhocil9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuICBcclxuICB2YXIgdGV4TGVuZ3RoID0gT2JqZWN0LmtleXModGV4dHVyZXMpLmxlbmd0aDtcclxuICB2YXIgdGV4Q291bnQgPSAwOyBcclxuICBwcm9ncmVzcyA9IG5ldyBncmFwaGljcy5Qcm9ncmVzcygpO1xyXG4gIHByb2dyZXNzLm1lc2gucG9zaXRpb24ueiA9IDAuMDAxO1xyXG4gIHByb2dyZXNzLnJlbmRlcignTG9hZGluZyBSZXNvdWNlcyAuLi4nLCAwKTtcclxuICBzY2VuZS5hZGQocHJvZ3Jlc3MubWVzaCk7XHJcbiAgZm9yKHZhciBuIGluIHRleHR1cmVzKXtcclxuICAgICgobmFtZSx0ZXhQYXRoKT0+e1xyXG4gICAgICBsb2FkUHJvbWlzZSA9IGxvYWRQcm9taXNlXHJcbiAgICAgIC50aGVuKCgpPT57XHJcbiAgICAgICAgcmV0dXJuIGxvYWRUZXh0dXJlKCcuL3Jlcy8nICsgdGV4UGF0aCk7ICAgICAgXHJcbiAgICAgIH0pXHJcbiAgICAgIC50aGVuKCh0ZXgpPT57XHJcbiAgICAgICAgdGV4Q291bnQrKztcclxuICAgICAgICBwcm9ncmVzcy5yZW5kZXIoJ0xvYWRpbmcgUmVzb3VjZXMgLi4uJywgKHRleENvdW50IC8gdGV4TGVuZ3RoICogMTAwKSB8IDApOyAgICAgICAgXHJcbiAgICAgICAgc2ZnLnRleHR1cmVGaWxlc1tuYW1lXSA9IHRleDtcclxuICAgICAgICByZW5kZXJlci5yZW5kZXIoc2NlbmUsIGNhbWVyYSk7XHJcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xyXG4gICAgICB9KTtcclxuICAgIH0pKG4sdGV4dHVyZXNbbl0pO1xyXG4gIH1cclxuICBcclxuICBsb2FkUHJvbWlzZS50aGVuKCgpPT57XHJcbiAgICBzY2VuZS5yZW1vdmUocHJvZ3Jlc3MubWVzaCk7XHJcbiAgICByZW5kZXJlci5yZW5kZXIoc2NlbmUsIGNhbWVyYSk7XHJcbiAgICB0YXNrcy5jbGVhcigpO1xyXG4gICAgdGFza3MucHVzaFRhc2soaW5pdCk7XHJcbiAgICB0YXNrcy5wdXNoVGFzayhyZW5kZXIsMTAwMDAwKTtcclxuICAgIHN0YXJ0ID0gdHJ1ZTtcclxuICAgIGdhbWUoKTtcclxuICB9KTtcclxufTtcclxuXHJcbi8vLyDjgrLjg7zjg6Djg6HjgqTjg7NcclxuZnVuY3Rpb24gZ2FtZSgpIHtcclxuICAvLyDjgr/jgrnjgq/jga7lkbzjgbPlh7rjgZdcclxuICAvLyDjg6HjgqTjg7Pjgavmj4/nlLtcclxuICBpZiAoc3RhcnQpIHtcclxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShnYW1lKTtcclxuICB9XHJcblxyXG4gICAgaWYgKCFpc0hpZGRlbikge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIHRhc2tzLmNoZWNrU29ydCgpO1xyXG4gICAgICAgIHZhciBhcnIgPSB0YXNrcy5nZXRBcnJheSgpO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwIDsgaSA8IGFyci5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgdmFyIHRhc2sgPSBhcnJbaV07XHJcbiAgICAgICAgICBpZiAodGFzayAhPSB1dGlsLm51bGxUYXNrKSB7XHJcbiAgICAgICAgICAgIHRhc2suZnVuYyh0YXNrLmluZGV4KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGFza3MuY29tcHJlc3MoKTtcclxuICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIEV4aXRFcnJvcihlKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuZnVuY3Rpb24gcmVuZGVyKHRhc2tJbmRleCkgXHJcbntcclxuICByZW5kZXJlci5yZW5kZXIoc2NlbmUsIGNhbWVyYSk7XHJcbiAgdGV4dFBsYW5lLnJlbmRlcigpO1xyXG4gIHN0YXRzLnVwZGF0ZSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0KHRhc2tJbmRleCkge1xyXG5cclxuICBzY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xyXG4gIGVuZW15QnVsbGV0cyA9IG5ldyBlbmVtaWVzLkVuZW15QnVsbGV0cyhzY2VuZSxzZSk7XHJcbiAgZW5lbWllc18gPSBuZXcgZW5lbWllcy5FbmVtaWVzKHNjZW5lLHNlLGVuZW15QnVsbGV0cyk7XHJcbiAgc2ZnLmJvbWJzID0gbmV3IGVmZmVjdG9iai5Cb21icyhzY2VuZSxzZSk7XHJcbiAgc2ZnLnN0YWdlID0gbmV3IFN0YWdlKCk7XHJcbiAgc3BhY2VGaWVsZCA9IG51bGw7XHJcblxyXG4gIC8vIOODj+ODs+ODieODq+ODjeODvOODoOOBruWPluW+l1xyXG4gIGhhbmRsZU5hbWUgPSBzdG9yYWdlLmdldEl0ZW0oJ2hhbmRsZU5hbWUnKSA7XHJcblxyXG4gIHRleHRQbGFuZSA9IG5ldyB0ZXh0LlRleHRQbGFuZShzY2VuZSk7XHJcbiAvLyB0ZXh0UGxhbmUucHJpbnQoMCwgMCwgXCJXZWIgQXVkaW8gQVBJIFRlc3RcIiwgbmV3IFRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gLy8g44K544Kz44Ki5oOF5aCxIOmAmuS/oeeUqFxyXG4gIGNvbW1fID0gbmV3IGNvbW0uQ29tbSgpO1xyXG4gIGNvbW1fLnVwZGF0ZUhpZ2hTY29yZXMgPSAoZGF0YSk9PlxyXG4gIHtcclxuICAgIGhpZ2hTY29yZXMgPSBkYXRhO1xyXG4gICAgaGlnaFNjb3JlID0gaGlnaFNjb3Jlc1swXS5zY29yZTtcclxuICB9O1xyXG4gIFxyXG4gIGNvbW1fLnVwZGF0ZUhpZ2hTY29yZSA9IChkYXRhKT0+XHJcbiAge1xyXG4gICAgaWYgKGhpZ2hTY29yZSA8IGRhdGEuc2NvcmUpIHtcclxuICAgICAgaGlnaFNjb3JlID0gZGF0YS5zY29yZTtcclxuICAgICAgcHJpbnRTY29yZSgpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG5cclxuIC8vIHNjZW5lLmFkZCh0ZXh0UGxhbmUubWVzaCk7XHJcblxyXG4gIC8v5L2c6ICF5ZCN44OR44O844OG44Kj44Kv44Or44KS5L2c5oiQXHJcbiAge1xyXG4gICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG5cclxuICAgIHZhciB3ID0gc2ZnLnRleHR1cmVGaWxlcy5hdXRob3IuaW1hZ2Uud2lkdGg7XHJcbiAgICB2YXIgaCA9IHNmZy50ZXh0dXJlRmlsZXMuYXV0aG9yLmltYWdlLmhlaWdodDtcclxuICAgIGNhbnZhcy53aWR0aCA9IHc7XHJcbiAgICBjYW52YXMuaGVpZ2h0ID0gaDtcclxuICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgIGN0eC5kcmF3SW1hZ2Uoc2ZnLnRleHR1cmVGaWxlcy5hdXRob3IuaW1hZ2UsIDAsIDApO1xyXG4gICAgdmFyIGRhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIHcsIGgpO1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkdlb21ldHJ5KCk7XHJcblxyXG4gICAgZ2VvbWV0cnkudmVydF9zdGFydCA9IFtdO1xyXG4gICAgZ2VvbWV0cnkudmVydF9lbmQgPSBbXTtcclxuXHJcbiAgICB7XHJcbiAgICAgIHZhciBpID0gMDtcclxuXHJcbiAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgaDsgKyt5KSB7XHJcbiAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB3OyArK3gpIHtcclxuICAgICAgICAgIHZhciBjb2xvciA9IG5ldyBUSFJFRS5Db2xvcigpO1xyXG5cclxuICAgICAgICAgIHZhciByID0gZGF0YS5kYXRhW2krK107XHJcbiAgICAgICAgICB2YXIgZyA9IGRhdGEuZGF0YVtpKytdO1xyXG4gICAgICAgICAgdmFyIGIgPSBkYXRhLmRhdGFbaSsrXTtcclxuICAgICAgICAgIHZhciBhID0gZGF0YS5kYXRhW2krK107XHJcbiAgICAgICAgICBpZiAoYSAhPSAwKSB7XHJcbiAgICAgICAgICAgIGNvbG9yLnNldFJHQihyIC8gMjU1LjAsIGcgLyAyNTUuMCwgYiAvIDI1NS4wKTtcclxuICAgICAgICAgICAgdmFyIHZlcnQgPSBuZXcgVEhSRUUuVmVjdG9yMygoKHggLSB3IC8gMi4wKSksICgoeSAtIGggLyAyKSkgKiAtMSwgMC4wKTtcclxuICAgICAgICAgICAgdmFyIHZlcnQyID0gbmV3IFRIUkVFLlZlY3RvcjMoMTIwMCAqIE1hdGgucmFuZG9tKCkgLSA2MDAsIDEyMDAgKiBNYXRoLnJhbmRvbSgpIC0gNjAwLCAxMjAwICogTWF0aC5yYW5kb20oKSAtIDYwMCk7XHJcbiAgICAgICAgICAgIGdlb21ldHJ5LnZlcnRfc3RhcnQucHVzaChuZXcgVEhSRUUuVmVjdG9yMyh2ZXJ0Mi54IC0gdmVydC54LCB2ZXJ0Mi55IC0gdmVydC55LCB2ZXJ0Mi56IC0gdmVydC56KSk7XHJcbiAgICAgICAgICAgIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2godmVydDIpO1xyXG4gICAgICAgICAgICBnZW9tZXRyeS52ZXJ0X2VuZC5wdXNoKHZlcnQpO1xyXG4gICAgICAgICAgICBnZW9tZXRyeS5jb2xvcnMucHVzaChjb2xvcik7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8g44Oe44OG44Oq44Ki44Or44KS5L2c5oiQXHJcbiAgICAvL3ZhciB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSgnaW1hZ2VzL3BhcnRpY2xlMS5wbmcnKTtcclxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5Qb2ludHNNYXRlcmlhbCh7XHJcbiAgICAgIHNpemU6IDIwLCBibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZyxcclxuICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsIHZlcnRleENvbG9yczogdHJ1ZSwgZGVwdGhUZXN0OiBmYWxzZS8vLCBtYXA6IHRleHR1cmVcclxuICAgIH0pO1xyXG5cclxuICAgIGF1dGhvciA9IG5ldyBUSFJFRS5Qb2ludHMoZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuLy8gICAgYXV0aG9yLnBvc2l0aW9uLnggYXV0aG9yLnBvc2l0aW9uLnk9ICA9MC4wLCAwLjAsIDAuMCk7XHJcblxyXG4gICAgLy9tZXNoLnNvcnRQYXJ0aWNsZXMgPSBmYWxzZTtcclxuICAgIC8vdmFyIG1lc2gxID0gbmV3IFRIUkVFLlBhcnRpY2xlU3lzdGVtKCk7XHJcbiAgICAvL21lc2guc2NhbGUueCA9IG1lc2guc2NhbGUueSA9IDguMDtcclxuXHJcbiAgICBiYXNpY0lucHV0LmJpbmQoKTtcclxuICAgIHNjZW5lLmFkZChhdXRob3IpO1xyXG4gIH1cclxuXHJcbiAgdGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCBwcmludEF1dGhvcigpKTtcclxufVxyXG5cclxuLy8vIOS9nOiAheihqOekulxyXG5mdW5jdGlvbiBwcmludEF1dGhvcigpIHtcclxuICB2YXIgc3RlcCA9IDA7XHJcbiAgdmFyIGNvdW50ID0gMS4wO1xyXG4gIHZhciB3YWl0ID0gNjA7XHJcbiAgdmFyIHByb2NfY291bnQgPSAwO1xyXG4gIGJhc2ljSW5wdXQua2V5QnVmZmVyLmxlbmd0aCA9IDA7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uICh0YXNrSW5kZXgpIHtcclxuXHJcbiAgICAvLyDkvZXjgYvjgq3jg7zlhaXlipvjgYzjgYLjgaPjgZ/loLTlkIjjga/mrKHjga7jgr/jgrnjgq/jgbhcclxuICAgIGlmIChiYXNpY0lucHV0LmtleUJ1ZmZlci5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGJhc2ljSW5wdXQua2V5QnVmZmVyLmxlbmd0aCA9IDA7XHJcbiAgICAgIHN0ZXAgPSA0O1xyXG4gICAgfVxyXG5cclxuICAgIHN3aXRjaCAoc3RlcCkge1xyXG4gICAgICAvLyDjg5Xjgqfjg7zjg4njg7vjgqTjg7NcclxuICAgICAgY2FzZSAwOlxyXG4gICAgICAgIGlmIChjb3VudCA8PSAwLjAxKSB7XHJcbiAgICAgICAgICBjb3VudCAtPSAwLjAwMDU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGNvdW50IC09IDAuMDAyNTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNvdW50IDwgMC4wKSB7XHJcbiAgICAgICAgICBhdXRob3Iucm90YXRpb24ueCA9IGF1dGhvci5yb3RhdGlvbi55ID0gYXV0aG9yLnJvdGF0aW9uLnogPSAwLjA7XHJcbiAgICAgICAgICB2YXIgZW5kID0gYXV0aG9yLmdlb21ldHJ5LnZlcnRpY2VzLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgICAgICAgIGF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlc1tpXS54ID0gYXV0aG9yLmdlb21ldHJ5LnZlcnRfZW5kW2ldLng7XHJcbiAgICAgICAgICAgIGF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlc1tpXS55ID0gYXV0aG9yLmdlb21ldHJ5LnZlcnRfZW5kW2ldLnk7XHJcbiAgICAgICAgICAgIGF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlc1tpXS56ID0gYXV0aG9yLmdlb21ldHJ5LnZlcnRfZW5kW2ldLno7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBhdXRob3IuZ2VvbWV0cnkudmVydGljZXNOZWVkVXBkYXRlID0gdHJ1ZTtcclxuICAgICAgICAgIHN0ZXArKztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdmFyIGVuZCA9IGF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlcy5sZW5ndGg7XHJcbiAgICAgICAgICB2YXIgdiA9IGF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlcztcclxuICAgICAgICAgIHZhciBkID0gYXV0aG9yLmdlb21ldHJ5LnZlcnRfc3RhcnQ7XHJcbiAgICAgICAgICB2YXIgdjIgPSBhdXRob3IuZ2VvbWV0cnkudmVydF9lbmQ7XHJcbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgICAgICAgIHZbaV0ueCA9IHYyW2ldLnggKyBkW2ldLnggKiBjb3VudDtcclxuICAgICAgICAgICAgdltpXS55ID0gdjJbaV0ueSArIGRbaV0ueSAqIGNvdW50O1xyXG4gICAgICAgICAgICB2W2ldLnogPSB2MltpXS56ICsgZFtpXS56ICogY291bnQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBhdXRob3IuZ2VvbWV0cnkudmVydGljZXNOZWVkVXBkYXRlID0gdHJ1ZTtcclxuICAgICAgICAgIGF1dGhvci5yb3RhdGlvbi54ID0gYXV0aG9yLnJvdGF0aW9uLnkgPSBhdXRob3Iucm90YXRpb24ueiA9IGNvdW50ICogNC4wO1xyXG4gICAgICAgICAgYXV0aG9yLm1hdGVyaWFsLm9wYWNpdHkgPSAxLjA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIC8vIOW+heOBoVxyXG4gICAgICBjYXNlIDE6XHJcbiAgICAgICAgaWYgKGF1dGhvci5tYXRlcmlhbC5zaXplID4gMikge1xyXG4gICAgICAgICAgYXV0aG9yLm1hdGVyaWFsLnNpemUgLT0gMC41O1xyXG4gICAgICAgICAgYXV0aG9yLm1hdGVyaWFsLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCEgLS13YWl0KSBzdGVwKys7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgLy/jg5Xjgqfjg7zjg4njgqLjgqbjg4hcclxuICAgICAgY2FzZSAyOlxyXG4gICAgICAgIGNvdW50ICs9IDAuMDU7XHJcbiAgICAgICAgYXV0aG9yLm1hdGVyaWFsLm9wYWNpdHkgPSAxLjAgLSBjb3VudDtcclxuICAgICAgICBpZiAoY291bnQgPj0gMS4wKSB7XHJcbiAgICAgICAgICBjb3VudCA9IDEuMDtcclxuICAgICAgICAgIHdhaXQgPSA2MDtcclxuICAgICAgICAgIHN0ZXArKztcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgLy8g5bCR44GX5b6F44GhXHJcbiAgICAgIGNhc2UgMzpcclxuICAgICAgICBpZiAoISAtLXdhaXQpIHtcclxuICAgICAgICAgIHdhaXQgPSA2MDtcclxuICAgICAgICAgIHN0ZXArKztcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgLy8g5qyh44Gu44K/44K544Kv44G4XHJcbiAgICAgIGNhc2UgNDpcclxuICAgICAgICB7XHJcbiAgICAgICAgICBzY2VuZS5yZW1vdmUoYXV0aG9yKTtcclxuICAgICAgICAgIC8vc2NlbmUubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgICAgICAgdGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCBpbml0VGl0bGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuXHJcbiAgICAvL3Byb2dyZXNzLnJlbmRlcihcInByb2NjZXNpbmdcIiwgY291bnQgKiAxMDApO1xyXG5cclxuICAgIC8vY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgxMjcsMTI3LDAsMS4wKVwiO1xyXG4gICAgLy9jdHguZmlsbFJlY3QoMCwgMCwgQ09OU09MRV9XSURUSCwgQ09OU09MRV9IRUlHSFQpO1xyXG4gICAgLy92YXIgYmFja3VwID0gY3R4Lmdsb2JhbEFscGhhO1xyXG4gICAgLy9jdHguZ2xvYmFsQWxwaGEgPSBjb3VudDtcclxuICAgIC8vY3R4LmRyYXdJbWFnZShpbWFnZUZpbGVzLmZvbnQuaW1hZ2UsIChDT05TT0xFX1dJRFRIIC0gaW1hZ2VGaWxlcy5mb250LmltYWdlLndpZHRoKSAvIDIsIChDT05TT0xFX0hFSUdIVCAtIGltYWdlRmlsZXMuZm9udC5pbWFnZS5oZWlnaHQpIC8gMik7XHJcbiAgICAvL2N0eC5nbG9iYWxBbHBoYSA9IGJhY2t1cDtcclxuICB9O1xyXG59XHJcblxyXG52YXIgdGl0bGU7Ly8g44K/44Kk44OI44Or44Oh44OD44K344OlXHJcbnZhciBzcGFjZUZpZWxkOy8vIOWuh+WumeepuumWk+ODkeODvOODhuOCo+OCr+ODq1xyXG5cclxuLy8vIOOCv+OCpOODiOODq+eUu+mdouWIneacn+WMliAvLy9cclxuZnVuY3Rpb24gaW5pdFRpdGxlKHRhc2tJbmRleCkge1xyXG4gIGJhc2ljSW5wdXQuY2xlYXIoKTtcclxuXHJcbiAgLy8g44K/44Kk44OI44Or44Oh44OD44K344Ol44Gu5L2c5oiQ44O76KGo56S6IC8vL1xyXG4gIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7IG1hcDogc2ZnLnRleHR1cmVGaWxlcy50aXRsZSB9KTtcclxuICBtYXRlcmlhbC5zaGFkaW5nID0gVEhSRUUuRmxhdFNoYWRpbmc7XHJcbiAgLy9tYXRlcmlhbC5hbnRpYWxpYXMgPSBmYWxzZTtcclxuICBtYXRlcmlhbC50cmFuc3BhcmVudCA9IHRydWU7XHJcbiAgbWF0ZXJpYWwuYWxwaGFUZXN0ID0gMC41O1xyXG4gIG1hdGVyaWFsLmRlcHRoVGVzdCA9IHRydWU7XHJcbiAgdGl0bGUgPSBuZXcgVEhSRUUuTWVzaChcclxuICAgIG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KHNmZy50ZXh0dXJlRmlsZXMudGl0bGUuaW1hZ2Uud2lkdGgsIHNmZy50ZXh0dXJlRmlsZXMudGl0bGUuaW1hZ2UuaGVpZ2h0KSxcclxuICAgIG1hdGVyaWFsXHJcbiAgICApO1xyXG4gIHRpdGxlLnNjYWxlLnggPSB0aXRsZS5zY2FsZS55ID0gMC44O1xyXG4gIHRpdGxlLnBvc2l0aW9uLnkgPSA4MDtcclxuICBzY2VuZS5hZGQodGl0bGUpO1xyXG5cclxuICAvLy8g6IOM5pmv44OR44O844OG44Kj44Kv44Or6KGo56S6XHJcbiAgaWYgKCFzcGFjZUZpZWxkKSB7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTtcclxuXHJcbiAgICBnZW9tZXRyeS5lbmR5ID0gW107XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDI1MDsgKytpKSB7XHJcbiAgICAgIHZhciBjb2xvciA9IG5ldyBUSFJFRS5Db2xvcigpO1xyXG4gICAgICB2YXIgeiA9IC0xODAwLjAgKiBNYXRoLnJhbmRvbSgpIC0gMzAwLjA7XHJcbiAgICAgIGNvbG9yLnNldEhTTCgwLjA1ICsgTWF0aC5yYW5kb20oKSAqIDAuMDUsIDEuMCwgKC0yMTAwIC0geikgLyAtMjEwMCk7XHJcbiAgICAgIHZhciBlbmR5ID0gc2ZnLlZJUlRVQUxfSEVJR0hUIC8gMiAtIHogKiBzZmcuVklSVFVBTF9IRUlHSFQgLyBzZmcuVklSVFVBTF9XSURUSDtcclxuICAgICAgdmFyIHZlcnQyID0gbmV3IFRIUkVFLlZlY3RvcjMoKHNmZy5WSVJUVUFMX1dJRFRIIC0geiAqIDIpICogTWF0aC5yYW5kb20oKSAtICgoc2ZnLlZJUlRVQUxfV0lEVEggLSB6ICogMikgLyAyKVxyXG4gICAgICAgICwgZW5keSAqIDIgKiBNYXRoLnJhbmRvbSgpIC0gZW5keSwgeik7XHJcbiAgICAgIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2godmVydDIpO1xyXG4gICAgICBnZW9tZXRyeS5lbmR5LnB1c2goZW5keSk7XHJcblxyXG4gICAgICBnZW9tZXRyeS5jb2xvcnMucHVzaChjb2xvcik7XHJcbiAgICB9XHJcblxyXG4gICAgLy8g44Oe44OG44Oq44Ki44Or44KS5L2c5oiQXHJcbiAgICAvL3ZhciB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSgnaW1hZ2VzL3BhcnRpY2xlMS5wbmcnKTtcclxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5Qb2ludHNNYXRlcmlhbCh7XHJcbiAgICAgIHNpemU6IDQsIGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLFxyXG4gICAgICB0cmFuc3BhcmVudDogdHJ1ZSwgdmVydGV4Q29sb3JzOiB0cnVlLCBkZXB0aFRlc3Q6IHRydWUvLywgbWFwOiB0ZXh0dXJlXHJcbiAgICB9KTtcclxuXHJcbiAgICBzcGFjZUZpZWxkID0gbmV3IFRIUkVFLlBvaW50cyhnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gICAgc3BhY2VGaWVsZC5wb3NpdGlvbi54ID0gc3BhY2VGaWVsZC5wb3NpdGlvbi55ID0gc3BhY2VGaWVsZC5wb3NpdGlvbi56ID0gMC4wO1xyXG4gICAgc2NlbmUuYWRkKHNwYWNlRmllbGQpO1xyXG4gICAgdGFza3MucHVzaFRhc2sobW92ZVNwYWNlRmllbGQpO1xyXG4gIH1cclxuXHJcbiAgICAvLy8g44OG44Kt44K544OI6KGo56S6XHJcbiAgICB0ZXh0UGxhbmUucHJpbnQoMywgMjUsIFwiUHVzaCB6IGtleSB0byBTdGFydCBHYW1lXCIsIG5ldyB0ZXh0LlRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gICAgc2ZnLmdhbWVUaW1lci5zdGFydCgpO1xyXG4gICAgc2hvd1RpdGxlLmVuZFRpbWUgPSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lICsgMTAvKuenkiovO1xyXG4gICAgdGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCBzaG93VGl0bGUpO1xyXG59XHJcblxyXG4vLy8g5a6H5a6Z56m66ZaT44Gu6KGo56S6XHJcbmZ1bmN0aW9uIG1vdmVTcGFjZUZpZWxkKHRhc2tJbmRleClcclxue1xyXG4gIHZhciB2ZXJ0cyA9IHNwYWNlRmllbGQuZ2VvbWV0cnkudmVydGljZXM7XHJcbiAgdmFyIGVuZHlzID0gc3BhY2VGaWVsZC5nZW9tZXRyeS5lbmR5O1xyXG4gIGZvciAodmFyIGkgPSAwLCBlbmQgPSB2ZXJ0cy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgdmVydHNbaV0ueSAtPSA0O1xyXG4gICAgaWYgKHZlcnRzW2ldLnkgPCAtZW5keXNbaV0pIHtcclxuICAgICAgdmVydHNbaV0ueSA9IGVuZHlzW2ldO1xyXG4gICAgfVxyXG4gIH1cclxuICBzcGFjZUZpZWxkLmdlb21ldHJ5LnZlcnRpY2VzTmVlZFVwZGF0ZSA9IHRydWU7XHJcbn1cclxuXHJcbi8vLyDjgr/jgqTjg4jjg6vooajnpLpcclxuZnVuY3Rpb24gc2hvd1RpdGxlKHRhc2tJbmRleCkge1xyXG4gIHNmZy5nYW1lVGltZXIudXBkYXRlKCk7XHJcblxyXG4gIGlmIChiYXNpY0lucHV0LmtleUNoZWNrLnopIHtcclxuICAgIHNjZW5lLnJlbW92ZSh0aXRsZSk7XHJcbiAgICB0YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIGluaXRIYW5kbGVOYW1lKTtcclxuICB9XHJcbiAgaWYgKHNob3dUaXRsZS5lbmRUaW1lIDwgc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSkge1xyXG4gICAgc2NlbmUucmVtb3ZlKHRpdGxlKTtcclxuICAgIHRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgaW5pdFRvcDEwKTtcclxuICB9XHJcblxyXG59XHJcblxyXG52YXIgZWRpdEhhbmRsZU5hbWUgPSBudWxsO1xyXG4vLy8g44OP44Oz44OJ44Or44ON44O844Og44Gu44Ko44Oz44OI44Oq5YmN5Yid5pyf5YyWXHJcbmZ1bmN0aW9uIGluaXRIYW5kbGVOYW1lKHRhc2tJbmRleClcclxue1xyXG4gIGlmIChlZGl0SGFuZGxlTmFtZSAhPSBudWxsKSB7XHJcbiAgICB0YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsZ2FtZUluaXQpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBlZGl0SGFuZGxlTmFtZSA9IGhhbmRsZU5hbWUgfHwgJyc7XHJcbiAgICB0ZXh0UGxhbmUuY2xzKCk7XHJcbiAgICB0ZXh0UGxhbmUucHJpbnQoNCwgMTgsICdJbnB1dCB5b3VyIGhhbmRsZSBuYW1lLicpO1xyXG4gICAgdGV4dFBsYW5lLnByaW50KDgsIDE5LCAnKE1heCA4IENoYXIpJyk7XHJcbiAgICB0ZXh0UGxhbmUucHJpbnQoMTAsIDIxLCBlZGl0SGFuZGxlTmFtZSk7XHJcbiAgICAvLyAgICB0ZXh0UGxhbmUucHJpbnQoMTAsIDIxLCBoYW5kbGVOYW1lWzBdLCBUZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICAgIGJhc2ljSW5wdXQudW5iaW5kKCk7XHJcbiAgICB2YXIgZWxtID0gZDMuc2VsZWN0KCcjY29udGVudCcpLmFwcGVuZCgnaW5wdXQnKTtcclxuICAgIGVsbVxyXG4gICAgICAuYXR0cigndHlwZScsICd0ZXh0JylcclxuICAgICAgLmF0dHIoJ3BhdHRlcm4nLCAnW2EtekEtWjAtOV9cXEBcXCNcXCRcXC1dezAsOH0nKVxyXG4gICAgICAuYXR0cignbWF4bGVuZ3RoJywgOClcclxuICAgICAgLmF0dHIoJ2lkJywnaW5wdXQtYXJlYScpXHJcbiAgICAgIC5hdHRyKCd2YWx1ZScsZWRpdEhhbmRsZU5hbWUpXHJcbiAgICAgIC5vbignYmx1cicsZnVuY3Rpb24oKXtcclxuICAgICAgICBkMy5ldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIGQzLmV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkgeyB0aGlzLmZvY3VzKCk7fSwgMTApO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfSlcclxuICAgICAgLm9uKCdrZXl1cCcsZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICBpZiAoZDMuZXZlbnQua2V5Q29kZSA9PSAxMykge1xyXG4gICAgICAgICAgZWRpdEhhbmRsZU5hbWUgPSB0aGlzLnZhbHVlO1xyXG4gICAgICAgICAgdmFyIHMgPSB0aGlzLnNlbGVjdGlvblN0YXJ0O1xyXG4gICAgICAgICAgdmFyIGUgPSB0aGlzLnNlbGVjdGlvbkVuZDtcclxuICAgICAgICAgIHRleHRQbGFuZS5wcmludCgxMCwgMjEsIGVkaXRIYW5kbGVOYW1lKTtcclxuICAgICAgICAgIHRleHRQbGFuZS5wcmludCgxMCArIHMsIDIxLCAnXycsIG5ldyB0ZXh0LlRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLm9uKCdrZXl1cCcsbnVsbCk7XHJcbiAgICAgICAgICBiYXNpY0lucHV0LmJpbmQoKTtcclxuICAgICAgICAgIHRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgZ2FtZUluaXQpO1xyXG4gICAgICAgICAgc3RvcmFnZS5zZXRJdGVtKCdoYW5kbGVOYW1lJywgZWRpdEhhbmRsZU5hbWUpO1xyXG4gICAgICAgICAgZDMuc2VsZWN0KCcjaW5wdXQtYXJlYScpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlZGl0SGFuZGxlTmFtZSA9IHRoaXMudmFsdWU7XHJcbiAgICAgICAgdmFyIHMgPSB0aGlzLnNlbGVjdGlvblN0YXJ0O1xyXG4gICAgICAgIHRleHRQbGFuZS5wcmludCgxMCwgMjEsICcgICAgICAgICAgICcpO1xyXG4gICAgICAgIHRleHRQbGFuZS5wcmludCgxMCwgMjEsIGVkaXRIYW5kbGVOYW1lKTtcclxuICAgICAgICB0ZXh0UGxhbmUucHJpbnQoMTAgKyBzLCAyMSwnXycsIG5ldyB0ZXh0LlRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gICAgICB9KVxyXG4gICAgLm5vZGUoKS5mb2N1cygpO1xyXG4gICAgdGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCBpbnB1dEhhbmRsZU5hbWUpO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOODj+ODs+ODieODq+ODjeODvOODoOOBruOCqOODs+ODiOODqlxyXG5mdW5jdGlvbiBpbnB1dEhhbmRsZU5hbWUodGFza0luZGV4KVxyXG57XHJcblxyXG59XHJcblxyXG4vLy8g44K544Kz44Ki5Yqg566XXHJcbmZ1bmN0aW9uIGFkZFNjb3JlKHMpIHtcclxuICBzY29yZSArPSBzO1xyXG4gIGlmIChzY29yZSA+IGhpZ2hTY29yZSkge1xyXG4gICAgaGlnaFNjb3JlID0gc2NvcmU7XHJcbiAgfVxyXG59XHJcblxyXG5zZmcuYWRkU2NvcmUgPSBhZGRTY29yZTtcclxuXHJcbi8vLyDjgrnjgrPjgqLooajnpLpcclxuZnVuY3Rpb24gcHJpbnRTY29yZSgpXHJcbntcclxuICB2YXIgcyA9ICcwMDAwMDAwMCcgKyBzY29yZS50b1N0cmluZygpO1xyXG4gIHMgPSBzLnN1YnN0cihzLmxlbmd0aCAtIDgsIDgpO1xyXG5cclxuICB0ZXh0UGxhbmUucHJpbnQoMSwgMSwgcyk7XHJcblxyXG4gIHZhciBoID0gJzAwMDAwMDAwJyArIGhpZ2hTY29yZS50b1N0cmluZygpO1xyXG4gIGggPSBoLnN1YnN0cihoLmxlbmd0aCAtIDgsIDgpO1xyXG4gIHRleHRQbGFuZS5wcmludCgxMiwgMSwgaCk7XHJcblxyXG59XHJcblxyXG5mdW5jdGlvbiBzZShpbmRleCl7XHJcbiAgc2VxdWVuY2VyLnBsYXlUcmFja3Moc291bmRFZmZlY3RzLnNvdW5kRWZmZWN0c1tpbmRleF0pO1xyXG59XHJcblxyXG4vLy8g44OP44Kk44K544Kz44Ki6KGo56S6XHJcblxyXG4vLy8g44Ky44O844Og44Gu5Yid5pyf5YyWXHJcbmZ1bmN0aW9uIGdhbWVJbml0KHRhc2tJbmRleCkge1xyXG5cclxuICAvLyDjgqrjg7zjg4fjgqPjgqrjga7plovlp4tcclxuICBhdWRpb18uc3RhcnQoKTtcclxuICBzZXF1ZW5jZXIubG9hZChhdWRpby5zZXFEYXRhKTtcclxuICBzZXF1ZW5jZXIuc3RhcnQoKTtcclxuICBzZmcuc3RhZ2UucmVzZXQoKTtcclxuICB0ZXh0UGxhbmUuY2xzKCk7XHJcblxyXG4gIGVuZW1pZXNfLnJlc2V0KCk7XHJcblxyXG4gIC8vIOiHquapn+OBruWIneacn+WMllxyXG4gIHNmZy5teXNoaXBfID0gbmV3IG15c2hpcC5NeVNoaXAoMCwgLTEwMCwgMC4xLHNjZW5lLHNlKTtcclxuICBzZmcuZ2FtZVRpbWVyLnN0YXJ0KCk7XHJcbiAgc2NvcmUgPSAwO1xyXG4gIHRleHRQbGFuZS5wcmludCgyLCAwLCAnU2NvcmUgICAgSGlnaCBTY29yZScpO1xyXG4gIHRleHRQbGFuZS5wcmludCgyMCwgMzksICdSZXN0OiAgICcgKyBzZmcubXlzaGlwXy5yZXN0KTtcclxuICBwcmludFNjb3JlKCk7XHJcbiAgdGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCBzdGFnZUluaXQvKmdhbWVBY3Rpb24qLyk7XHJcbn1cclxuXHJcbi8vLyDjgrnjg4bjg7zjgrjjga7liJ3mnJ/ljJZcclxuZnVuY3Rpb24gc3RhZ2VJbml0KHRhc2tJbmRleCkge1xyXG4gIHRleHRQbGFuZS5wcmludCgwLCAzOSwgJ1N0YWdlOicgKyBzZmcuc3RhZ2Uubm8pO1xyXG4gIHNmZy5nYW1lVGltZXIuc3RhcnQoKTtcclxuICBlbmVtaWVzXy5yZXNldCgpO1xyXG4gIGVuZW1pZXNfLnN0YXJ0KCk7XHJcbiAgZW5lbWllc18uY2FsY0VuZW1pZXNDb3VudChzZmcuc3RhZ2UucHJpdmF0ZU5vKTtcclxuICBlbmVtaWVzXy5oaXRFbmVtaWVzQ291bnQgPSAwO1xyXG4gIHRleHRQbGFuZS5wcmludCg4LCAxNSwgJ1N0YWdlICcgKyAoc2ZnLnN0YWdlLm5vKSArICcgU3RhcnQgISEnLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICBzdGFnZVN0YXJ0LmVuZFRpbWUgPSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lICsgMjtcclxuICB0YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHN0YWdlU3RhcnQvKmdhbWVBY3Rpb24qLyk7XHJcbn1cclxuXHJcbi8vLyDjgrnjg4bjg7zjgrjplovlp4tcclxuZnVuY3Rpb24gc3RhZ2VTdGFydCh0YXNrSW5kZXgpXHJcbntcclxuICBzZmcuZ2FtZVRpbWVyLnVwZGF0ZSgpO1xyXG4gIHNmZy5teXNoaXBfLmFjdGlvbihiYXNpY0lucHV0KTtcclxuICBpZiAoc3RhZ2VTdGFydC5lbmRUaW1lIDwgc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSkge1xyXG4gICAgdGV4dFBsYW5lLnByaW50KDgsIDE1LCAnICAgICAgICAgICAgICAgICAgJywgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgICB0YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIGdhbWVBY3Rpb24sNTAwMCk7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g6Ieq5qmf44Gu5YuV44GN44KS5Yi25b6h44GZ44KLXHJcbmZ1bmN0aW9uIGdhbWVBY3Rpb24odGFza0luZGV4KSB7XHJcbiAgcHJpbnRTY29yZSgpO1xyXG4gIHNmZy5teXNoaXBfLmFjdGlvbihiYXNpY0lucHV0KTtcclxuICBzZmcuZ2FtZVRpbWVyLnVwZGF0ZSgpO1xyXG4gIC8vY29uc29sZS5sb2coc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSk7XHJcbiAgZW5lbWllc18ubW92ZSgpO1xyXG5cclxuICBpZiAoIXByb2Nlc3NDb2xsaXNpb24oKSkge1xyXG4gICAgaWYgKGVuZW1pZXNfLmhpdEVuZW1pZXNDb3VudCA9PSBlbmVtaWVzXy50b3RhbEVuZW1pZXNDb3VudCkge1xyXG4gICAgICBwcmludFNjb3JlKCk7XHJcbiAgICAgIHNmZy5zdGFnZS5hZHZhbmNlKCk7XHJcbiAgICAgIHRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgc3RhZ2VJbml0KTtcclxuICAgIH1cclxuICB9IGVsc2Uge1xyXG4gICAgbXlTaGlwQm9tYi5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDM7XHJcbiAgICB0YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIG15U2hpcEJvbWIpO1xyXG4gIH07XHJcblxyXG59XHJcblxyXG4vLy8g5b2T44Gf44KK5Yik5a6aXHJcbmZ1bmN0aW9uIHByb2Nlc3NDb2xsaXNpb24odGFza0luZGV4KVxyXG57XHJcbiAgLy/jgIDoh6rmqZ/lvL7jgajmlbXjgajjga7jgYLjgZ/jgorliKTlrppcclxuICB2YXIgbXlCdWxsZXRzID0gc2ZnLm15c2hpcF8ubXlCdWxsZXRzO1xyXG4gIGVucyA9IGVuZW1pZXNfLmVuZW1pZXM7XHJcbiAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IG15QnVsbGV0cy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgdmFyIG15YiA9IG15QnVsbGV0c1tpXTtcclxuICAgIGlmIChteWIuZW5hYmxlXykge1xyXG4gICAgICB2YXIgbXliY28gPSBteUJ1bGxldHNbaV0uY29sbGlzaW9uQXJlYTtcclxuICAgICAgdmFyIGxlZnQgPSBteWJjby5sZWZ0ICsgbXliLng7XHJcbiAgICAgIHZhciByaWdodCA9IG15YmNvLnJpZ2h0ICsgbXliLng7XHJcbiAgICAgIHZhciB0b3AgPSBteWJjby50b3AgKyBteWIueTtcclxuICAgICAgdmFyIGJvdHRvbSA9IG15YmNvLmJvdHRvbSAtIG15Yi5zcGVlZCArIG15Yi55O1xyXG4gICAgICBmb3IgKHZhciBqID0gMCwgZW5kaiA9IGVucy5sZW5ndGg7IGogPCBlbmRqOyArK2opIHtcclxuICAgICAgICB2YXIgZW4gPSBlbnNbal07XHJcbiAgICAgICAgaWYgKGVuLmVuYWJsZV8pIHtcclxuICAgICAgICAgIHZhciBlbmNvID0gZW4uY29sbGlzaW9uQXJlYTtcclxuICAgICAgICAgIGlmICh0b3AgPiAoZW4ueSArIGVuY28uYm90dG9tKSAmJlxyXG4gICAgICAgICAgICAgIChlbi55ICsgZW5jby50b3ApID4gYm90dG9tICYmXHJcbiAgICAgICAgICAgIGxlZnQgPCAoZW4ueCArIGVuY28ucmlnaHQpICYmXHJcbiAgICAgICAgICAgIChlbi54ICsgZW5jby5sZWZ0KSA8IHJpZ2h0XHJcbiAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICBteWIuZW5hYmxlXyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBlbi5oaXQoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyDmlbXjgajoh6rmqZ/jgajjga7jgYLjgZ/jgorliKTlrppcclxuICBpZihzZmcuQ0hFQ0tfQ09MTElTSU9OKXtcclxuICAgIHZhciBteWNvID0gc2ZnLm15c2hpcF8uY29sbGlzaW9uQXJlYTtcclxuICAgIHZhciBsZWZ0ID0gc2ZnLm15c2hpcF8ueCArIG15Y28ubGVmdDtcclxuICAgIHZhciByaWdodCA9IG15Y28ucmlnaHQgKyBzZmcubXlzaGlwXy54O1xyXG4gICAgdmFyIHRvcCA9IG15Y28udG9wICsgc2ZnLm15c2hpcF8ueTtcclxuICAgIHZhciBib3R0b20gPSBteWNvLmJvdHRvbSArIHNmZy5teXNoaXBfLnk7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IGVucy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgICB2YXIgZW4gPSBlbnNbaV07XHJcbiAgICAgIGlmIChlbi5lbmFibGVfKSB7XHJcbiAgICAgICAgdmFyIGVuY28gPSBlbi5jb2xsaXNpb25BcmVhO1xyXG4gICAgICAgIGlmICh0b3AgPiAoZW4ueSArIGVuY28uYm90dG9tKSAmJlxyXG4gICAgICAgICAgICAoZW4ueSArIGVuY28udG9wKSA+IGJvdHRvbSAmJlxyXG4gICAgICAgICAgbGVmdCA8IChlbi54ICsgZW5jby5yaWdodCkgJiZcclxuICAgICAgICAgIChlbi54ICsgZW5jby5sZWZ0KSA8IHJpZ2h0XHJcbiAgICAgICAgICApIHtcclxuICAgICAgICAgIGVuLmhpdCgpO1xyXG4gICAgICAgICAgc2ZnLm15c2hpcF8uaGl0KCk7XHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIOaVteW8vuOBqOiHquapn+OBqOOBruOBguOBn+OCiuWIpOWumlxyXG4gICAgZW5icyA9IGVuZW15QnVsbGV0cy5lbmVteUJ1bGxldHM7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gZW5icy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgICB2YXIgZW4gPSBlbmJzW2ldO1xyXG4gICAgICBpZiAoZW4uZW5hYmxlKSB7XHJcbiAgICAgICAgdmFyIGVuY28gPSBlbi5jb2xsaXNpb25BcmVhO1xyXG4gICAgICAgIGlmICh0b3AgPiAoZW4ueSArIGVuY28uYm90dG9tKSAmJlxyXG4gICAgICAgICAgICAoZW4ueSArIGVuY28udG9wKSA+IGJvdHRvbSAmJlxyXG4gICAgICAgICAgbGVmdCA8IChlbi54ICsgZW5jby5yaWdodCkgJiZcclxuICAgICAgICAgIChlbi54ICsgZW5jby5sZWZ0KSA8IHJpZ2h0XHJcbiAgICAgICAgICApIHtcclxuICAgICAgICAgIGVuLmhpdCgpO1xyXG4gICAgICAgICAgc2ZnLm15c2hpcF8uaGl0KCk7XHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gIH1cclxuICByZXR1cm4gZmFsc2U7XHJcbn1cclxuXHJcbi8vLyDoh6rmqZ/niIbnmbogXHJcbmZ1bmN0aW9uIG15U2hpcEJvbWIodGFza0luZGV4KSB7XHJcbiAgc2ZnLmdhbWVUaW1lci51cGRhdGUoKTtcclxuICBlbmVtaWVzXy5tb3ZlKCk7XHJcbiAgaWYgKHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgPiBteVNoaXBCb21iLmVuZFRpbWUpIHtcclxuICAgIHNmZy5teXNoaXBfLnJlc3QtLTtcclxuICAgIGlmIChzZmcubXlzaGlwXy5yZXN0ID09IDApIHtcclxuICAgICAgdGV4dFBsYW5lLnByaW50KDEwLCAxOCwgJ0dBTUUgT1ZFUicsIG5ldyB0ZXh0LlRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gICAgICBwcmludFNjb3JlKCk7XHJcbiAgICAgIHRleHRQbGFuZS5wcmludCgyMCwgMzksICdSZXN0OiAgICcgKyBzZmcubXlzaGlwXy5yZXN0KTtcclxuICAgICAgY29tbV8uc29ja2V0Lm9uKCdzZW5kUmFuaycsIGNoZWNrUmFua0luKTtcclxuICAgICAgY29tbV8uc2VuZFNjb3JlKG5ldyBTY29yZUVudHJ5KGVkaXRIYW5kbGVOYW1lLHNjb3JlKSk7XHJcbiAgICAgIGdhbWVPdmVyLmVuZFRpbWUgPSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lICsgNTtcclxuICAgICAgcmFuayA9IC0xO1xyXG4gICAgICB0YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIGdhbWVPdmVyKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNmZy5teXNoaXBfLm1lc2gudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgIHRleHRQbGFuZS5wcmludCgyMCwgMzksICdSZXN0OiAgICcgKyBzZmcubXlzaGlwXy5yZXN0KTtcclxuICAgICAgdGV4dFBsYW5lLnByaW50KDgsIDE1LCAnU3RhZ2UgJyArIChzZmcuc3RhZ2Uubm8pICsgJyBTdGFydCAhIScsIG5ldyB0ZXh0LlRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gICAgICBzdGFnZVN0YXJ0LmVuZFRpbWUgPSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lICsgMjtcclxuICAgICAgdGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCBzdGFnZVN0YXJ0LypnYW1lQWN0aW9uKi8pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbn1cclxuXHJcbi8vLyDjgrLjg7zjg6Djgqrjg7zjg5Djg7xcclxuZnVuY3Rpb24gZ2FtZU92ZXIodGFza0luZGV4KVxyXG57XHJcbiAgc2ZnLmdhbWVUaW1lci51cGRhdGUoKTtcclxuICBpZiAoZ2FtZU92ZXIuZW5kVGltZSA8IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUpIHtcclxuICAgIHRleHRQbGFuZS5jbHMoKTtcclxuICAgIGVuZW1pZXNfLnJlc2V0KCk7XHJcbiAgICBlbmVteUJ1bGxldHMucmVzZXQoKTtcclxuICAgIGlmIChyYW5rID49IDApIHtcclxuICAgICAgdGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCBpbml0VG9wMTApO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCBpbml0VGl0bGUpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLy8vIOODqeODs+OCreODs+OCsOOBl+OBn+OBi+OBqeOBhuOBi+OBruODgeOCp+ODg+OCr1xyXG5mdW5jdGlvbiBjaGVja1JhbmtJbihkYXRhKVxyXG57XHJcbiAgcmFuayA9IGRhdGEucmFuaztcclxufVxyXG5cclxuXHJcbi8vLyDjg4/jgqTjgrnjgrPjgqLjgqjjg7Pjg4jjg6rjga7ooajnpLpcclxuZnVuY3Rpb24gcHJpbnRUb3AxMCgpXHJcbntcclxuICB2YXIgcmFua25hbWUgPSBbJyAxc3QnLCAnIDJuZCcsICcgM3JkJywgJyA0dGgnLCAnIDV0aCcsICcgNnRoJywgJyA3dGgnLCAnIDh0aCcsICcgOXRoJywgJzEwdGgnXTtcclxuICB0ZXh0UGxhbmUucHJpbnQoOCwgNCwgJ1RvcCAxMCBTY29yZScpO1xyXG4gIHZhciB5ID0gODtcclxuICBmb3IgKHZhciBpID0gMCwgZW5kID0gaGlnaFNjb3Jlcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgdmFyIHNjb3JlU3RyID0gJzAwMDAwMDAwJyArIGhpZ2hTY29yZXNbaV0uc2NvcmU7XHJcbiAgICBzY29yZVN0ciA9IHNjb3JlU3RyLnN1YnN0cihzY29yZVN0ci5sZW5ndGggLSA4LCA4KTtcclxuICAgIGlmIChyYW5rID09IGkpIHtcclxuICAgICAgdGV4dFBsYW5lLnByaW50KDMsIHksIHJhbmtuYW1lW2ldICsgJyAnICsgc2NvcmVTdHIgKyAnICcgKyBoaWdoU2NvcmVzW2ldLm5hbWUsIG5ldyB0ZXh0LlRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGV4dFBsYW5lLnByaW50KDMsIHksIHJhbmtuYW1lW2ldICsgJyAnICsgc2NvcmVTdHIgKyAnICcgKyBoaWdoU2NvcmVzW2ldLm5hbWUpO1xyXG4gICAgfVxyXG4gICAgeSArPSAyO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdFRvcDEwKHRhc2tJbmRleCkge1xyXG4gIHRleHRQbGFuZS5jbHMoKTtcclxuICBwcmludFRvcDEwKCk7XHJcbiAgc2hvd1RvcDEwLmVuZFRpbWUgPSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lICsgNTtcclxuICB0YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHNob3dUb3AxMCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNob3dUb3AxMCh0YXNrSW5kZXgpIHtcclxuICBzZmcuZ2FtZVRpbWVyLnVwZGF0ZSgpO1xyXG4gIGlmIChzaG93VG9wMTAuZW5kVGltZSA8IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgfHwgYmFzaWNJbnB1dC5rZXlCdWZmZXIubGVuZ3RoID4gMCkge1xyXG4gICAgYmFzaWNJbnB1dC5rZXlCdWZmZXIubGVuZ3RoID0gMDtcclxuICAgIHRleHRQbGFuZS5jbHMoKTtcclxuICAgIHRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgaW5pdFRpdGxlKTtcclxuICB9XHJcbn1cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5leHBvcnQgY2xhc3MgQ29sbGlzaW9uQXJlYSB7XHJcbiAgY29uc3RydWN0b3Iob2Zmc2V0WCwgb2Zmc2V0WSwgd2lkdGgsIGhlaWdodClcclxuICB7XHJcbiAgICB0aGlzLm9mZnNldFggPSBvZmZzZXRYIHx8IDA7XHJcbiAgICB0aGlzLm9mZnNldFkgPSBvZmZzZXRZIHx8IDA7XHJcbiAgICB0aGlzLnRvcCA9IDA7XHJcbiAgICB0aGlzLmJvdHRvbSA9IDA7XHJcbiAgICB0aGlzLmxlZnQgPSAwO1xyXG4gICAgdGhpcy5yaWdodCA9IDA7XHJcbiAgICB0aGlzLndpZHRoID0gd2lkdGggfHwgMDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0IHx8IDA7XHJcbiAgICB0aGlzLndpZHRoXyA9IDA7XHJcbiAgICB0aGlzLmhlaWdodF8gPSAwO1xyXG4gIH1cclxuICBnZXQgd2lkdGgoKSB7IHJldHVybiB0aGlzLndpZHRoXzsgfVxyXG4gIHNldCB3aWR0aCh2KSB7XHJcbiAgICB0aGlzLndpZHRoXyA9IHY7XHJcbiAgICB0aGlzLmxlZnQgPSB0aGlzLm9mZnNldFggLSB2IC8gMjtcclxuICAgIHRoaXMucmlnaHQgPSB0aGlzLm9mZnNldFggKyB2IC8gMjtcclxuICB9XHJcbiAgZ2V0IGhlaWdodCgpIHsgcmV0dXJuIHRoaXMuaGVpZ2h0XzsgfVxyXG4gIHNldCBoZWlnaHQodikge1xyXG4gICAgdGhpcy5oZWlnaHRfID0gdjtcclxuICAgIHRoaXMudG9wID0gdGhpcy5vZmZzZXRZICsgdiAvIDI7XHJcbiAgICB0aGlzLmJvdHRvbSA9IHRoaXMub2Zmc2V0WSAtIHYgLyAyO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEdhbWVPYmoge1xyXG4gIGNvbnN0cnVjdG9yKHgsIHksIHopIHtcclxuICAgIHRoaXMueF8gPSB4IHx8IDA7XHJcbiAgICB0aGlzLnlfID0geSB8fCAwO1xyXG4gICAgdGhpcy56XyA9IHogfHwgMC4wO1xyXG4gICAgdGhpcy5lbmFibGVfID0gZmFsc2U7XHJcbiAgICB0aGlzLndpZHRoID0gMDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gMDtcclxuICAgIHRoaXMuY29sbGlzaW9uQXJlYSA9IG5ldyBDb2xsaXNpb25BcmVhKCk7XHJcbiAgfVxyXG4gIGdldCB4KCkgeyByZXR1cm4gdGhpcy54XzsgfVxyXG4gIHNldCB4KHYpIHsgdGhpcy54XyA9IHY7IH1cclxuICBnZXQgeSgpIHsgcmV0dXJuIHRoaXMueV87IH1cclxuICBzZXQgeSh2KSB7IHRoaXMueV8gPSB2OyB9XHJcbiAgZ2V0IHooKSB7IHJldHVybiB0aGlzLnpfOyB9XHJcbiAgc2V0IHoodikgeyB0aGlzLnpfID0gdjsgfVxyXG59XHJcblxyXG4iLCJleHBvcnQgY29uc3QgVklSVFVBTF9XSURUSCA9IDI0MDtcclxuZXhwb3J0IGNvbnN0IFZJUlRVQUxfSEVJR0hUID0gMzIwO1xyXG5cclxuZXhwb3J0IGNvbnN0IFZfUklHSFQgPSBWSVJUVUFMX1dJRFRIIC8gMi4wO1xyXG5leHBvcnQgY29uc3QgVl9UT1AgPSBWSVJUVUFMX0hFSUdIVCAvIDIuMDtcclxuZXhwb3J0IGNvbnN0IFZfTEVGVCA9IC0xICogVklSVFVBTF9XSURUSCAvIDIuMDtcclxuZXhwb3J0IGNvbnN0IFZfQk9UVE9NID0gLTEgKiBWSVJUVUFMX0hFSUdIVCAvIDIuMDtcclxuXHJcbmV4cG9ydCBjb25zdCBDSEFSX1NJWkUgPSA4O1xyXG5leHBvcnQgY29uc3QgVEVYVF9XSURUSCA9IFZJUlRVQUxfV0lEVEggLyBDSEFSX1NJWkU7XHJcbmV4cG9ydCBjb25zdCBURVhUX0hFSUdIVCA9IFZJUlRVQUxfSEVJR0hUIC8gQ0hBUl9TSVpFO1xyXG5leHBvcnQgY29uc3QgUElYRUxfU0laRSA9IDE7XHJcbmV4cG9ydCBjb25zdCBBQ1RVQUxfQ0hBUl9TSVpFID0gQ0hBUl9TSVpFICogUElYRUxfU0laRTtcclxuZXhwb3J0IGNvbnN0IFNQUklURV9TSVpFX1ggPSAxNi4wO1xyXG5leHBvcnQgY29uc3QgU1BSSVRFX1NJWkVfWSA9IDE2LjA7XHJcbmV4cG9ydCBjb25zdCBDSEVDS19DT0xMSVNJT04gPSBmYWxzZTtcclxuZXhwb3J0IHZhciB0ZXh0dXJlRmlsZXMgPSB7fTtcclxuZXhwb3J0IHZhciBzdGFnZTtcclxuZXhwb3J0IHZhciB0YXNrcztcclxuZXhwb3J0IHZhciBnYW1lVGltZXI7XHJcbmV4cG9ydCB2YXIgYm9tYnM7XHJcbmV4cG9ydCB2YXIgYWRkU2NvcmU7XHJcbmV4cG9ydCB2YXIgbXlzaGlwXztcclxuZXhwb3J0IGNvbnN0IHRleHR1cmVSb290ID0gJy4vcmVzLyc7XHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0ICogYXMgZyBmcm9tICcuL2dsb2JhbCc7XHJcblxyXG4vLy8g44OG44Kv44K544OB44Oj44O844Go44GX44GmY2FudmFz44KS5L2/44GG5aC05ZCI44Gu44OY44Or44OR44O8XHJcbmV4cG9ydCBmdW5jdGlvbiBDYW52YXNUZXh0dXJlKHdpZHRoLCBoZWlnaHQpIHtcclxuICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gIHRoaXMuY2FudmFzLndpZHRoID0gd2lkdGggfHwgZy5WSVJUVUFMX1dJRFRIO1xyXG4gIHRoaXMuY2FudmFzLmhlaWdodCA9IGhlaWdodCB8fCBnLlZJUlRVQUxfSEVJR0hUO1xyXG4gIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICB0aGlzLnRleHR1cmUgPSBuZXcgVEhSRUUuVGV4dHVyZSh0aGlzLmNhbnZhcyk7XHJcbiAgdGhpcy50ZXh0dXJlLm1hZ0ZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XHJcbiAgdGhpcy50ZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLkxpbmVhck1pcE1hcExpbmVhckZpbHRlcjtcclxuICB0aGlzLm1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgbWFwOiB0aGlzLnRleHR1cmUsIHRyYW5zcGFyZW50OiB0cnVlIH0pO1xyXG4gIHRoaXMuZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSh0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuICB0aGlzLm1lc2ggPSBuZXcgVEhSRUUuTWVzaCh0aGlzLmdlb21ldHJ5LCB0aGlzLm1hdGVyaWFsKTtcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueiA9IDAuMDAxO1xyXG4gIC8vIOOCueODoOODvOOCuOODs+OCsOOCkuWIh+OCi1xyXG4gIHRoaXMuY3R4Lm1zSW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgdGhpcy5jdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgLy90aGlzLmN0eC53ZWJraXRJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICB0aGlzLmN0eC5tb3pJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxufVxyXG5cclxuLy8vIOODl+ODreOCsOODrOOCueODkOODvOihqOekuuOCr+ODqeOCuVxyXG5leHBvcnQgZnVuY3Rpb24gUHJvZ3Jlc3MoKSB7XHJcbiAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTs7XHJcbiAgdmFyIHdpZHRoID0gMTtcclxuICB3aGlsZSAod2lkdGggPD0gZy5WSVJUVUFMX1dJRFRIKXtcclxuICAgIHdpZHRoICo9IDI7XHJcbiAgfVxyXG4gIHZhciBoZWlnaHQgPSAxO1xyXG4gIHdoaWxlIChoZWlnaHQgPD0gZy5WSVJUVUFMX0hFSUdIVCl7XHJcbiAgICBoZWlnaHQgKj0gMjtcclxuICB9XHJcbiAgdGhpcy5jYW52YXMud2lkdGggPSB3aWR0aDtcclxuICB0aGlzLmNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gIHRoaXMudGV4dHVyZSA9IG5ldyBUSFJFRS5UZXh0dXJlKHRoaXMuY2FudmFzKTtcclxuICB0aGlzLnRleHR1cmUubWFnRmlsdGVyID0gVEhSRUUuTmVhcmVzdEZpbHRlcjtcclxuICB0aGlzLnRleHR1cmUubWluRmlsdGVyID0gVEhSRUUuTGluZWFyTWlwTWFwTGluZWFyRmlsdGVyO1xyXG4gIC8vIOOCueODoOODvOOCuOODs+OCsOOCkuWIh+OCi1xyXG4gIHRoaXMuY3R4Lm1zSW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgdGhpcy5jdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgLy90aGlzLmN0eC53ZWJraXRJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICB0aGlzLmN0eC5tb3pJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuXHJcbiAgdGhpcy5tYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7IG1hcDogdGhpcy50ZXh0dXJlLCB0cmFuc3BhcmVudDogdHJ1ZSB9KTtcclxuICB0aGlzLmdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkodGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcbiAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2godGhpcy5nZW9tZXRyeSwgdGhpcy5tYXRlcmlhbCk7XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnggPSAod2lkdGggLSBnLlZJUlRVQUxfV0lEVEgpIC8gMjtcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueSA9ICAtIChoZWlnaHQgLSBnLlZJUlRVQUxfSEVJR0hUKSAvIDI7XHJcblxyXG4gIC8vdGhpcy50ZXh0dXJlLnByZW11bHRpcGx5QWxwaGEgPSB0cnVlO1xyXG59XHJcblxyXG4vLy8g44OX44Ot44Kw44Os44K544OQ44O844KS6KGo56S644GZ44KL44CCXHJcblByb2dyZXNzLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiAobWVzc2FnZSwgcGVyY2VudCkge1xyXG4gIHZhciBjdHggPSB0aGlzLmN0eDtcclxuICB2YXIgd2lkdGggPSB0aGlzLmNhbnZhcy53aWR0aCwgaGVpZ2h0ID0gdGhpcy5jYW52YXMuaGVpZ2h0O1xyXG4gIC8vICAgICAgY3R4LmZpbGxTdHlsZSA9ICdyZ2JhKDAsMCwwLDApJztcclxuICBjdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG4gIHZhciB0ZXh0V2lkdGggPSBjdHgubWVhc3VyZVRleHQobWVzc2FnZSkud2lkdGg7XHJcbiAgY3R4LnN0cm9rZVN0eWxlID0gY3R4LmZpbGxTdHlsZSA9ICdyZ2JhKDI1NSwyNTUsMjU1LDEuMCknO1xyXG5cclxuICBjdHguZmlsbFRleHQobWVzc2FnZSwgKHdpZHRoIC0gdGV4dFdpZHRoKSAvIDIsIDEwMCk7XHJcbiAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gIGN0eC5yZWN0KDIwLCA3NSwgd2lkdGggLSAyMCAqIDIsIDEwKTtcclxuICBjdHguc3Ryb2tlKCk7XHJcbiAgY3R4LmZpbGxSZWN0KDIwLCA3NSwgKHdpZHRoIC0gMjAgKiAyKSAqIHBlcmNlbnQgLyAxMDAsIDEwKTtcclxuICB0aGlzLnRleHR1cmUubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG59XHJcblxyXG4vLy8gaW1n44GL44KJ44K444Kq44Oh44OI44Oq44KS5L2c5oiQ44GZ44KLXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVHZW9tZXRyeUZyb21JbWFnZShpbWFnZSkge1xyXG4gIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICB2YXIgdyA9IHRleHR1cmVGaWxlcy5hdXRob3IudGV4dHVyZS5pbWFnZS53aWR0aDtcclxuICB2YXIgaCA9IHRleHR1cmVGaWxlcy5hdXRob3IudGV4dHVyZS5pbWFnZS5oZWlnaHQ7XHJcbiAgY2FudmFzLndpZHRoID0gdztcclxuICBjYW52YXMuaGVpZ2h0ID0gaDtcclxuICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgY3R4LmRyYXdJbWFnZShpbWFnZSwgMCwgMCk7XHJcbiAgdmFyIGRhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIHcsIGgpO1xyXG4gIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5HZW9tZXRyeSgpO1xyXG4gIHtcclxuICAgIHZhciBpID0gMDtcclxuXHJcbiAgICBmb3IgKHZhciB5ID0gMDsgeSA8IGg7ICsreSkge1xyXG4gICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHc7ICsreCkge1xyXG4gICAgICAgIHZhciBjb2xvciA9IG5ldyBUSFJFRS5Db2xvcigpO1xyXG5cclxuICAgICAgICB2YXIgciA9IGRhdGEuZGF0YVtpKytdO1xyXG4gICAgICAgIHZhciBnID0gZGF0YS5kYXRhW2krK107XHJcbiAgICAgICAgdmFyIGIgPSBkYXRhLmRhdGFbaSsrXTtcclxuICAgICAgICB2YXIgYSA9IGRhdGEuZGF0YVtpKytdO1xyXG4gICAgICAgIGlmIChhICE9IDApIHtcclxuICAgICAgICAgIGNvbG9yLnNldFJHQihyIC8gMjU1LjAsIGcgLyAyNTUuMCwgYiAvIDI1NS4wKTtcclxuICAgICAgICAgIHZhciB2ZXJ0ID0gbmV3IFRIUkVFLlZlY3RvcjMoKCh4IC0gdyAvIDIuMCkpICogMi4wLCAoKHkgLSBoIC8gMikpICogLTIuMCwgMC4wKTtcclxuICAgICAgICAgIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2godmVydCk7XHJcbiAgICAgICAgICBnZW9tZXRyeS5jb2xvcnMucHVzaChjb2xvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3ByaXRlR2VvbWV0cnkoc2l6ZSlcclxue1xyXG4gIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5HZW9tZXRyeSgpO1xyXG4gIHZhciBzaXplSGFsZiA9IHNpemUgLyAyO1xyXG4gIC8vIGdlb21ldHJ5LlxyXG4gIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2gobmV3IFRIUkVFLlZlY3RvcjMoLXNpemVIYWxmLCBzaXplSGFsZiwgMCkpO1xyXG4gIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2gobmV3IFRIUkVFLlZlY3RvcjMoc2l6ZUhhbGYsIHNpemVIYWxmLCAwKSk7XHJcbiAgZ2VvbWV0cnkudmVydGljZXMucHVzaChuZXcgVEhSRUUuVmVjdG9yMyhzaXplSGFsZiwgLXNpemVIYWxmLCAwKSk7XHJcbiAgZ2VvbWV0cnkudmVydGljZXMucHVzaChuZXcgVEhSRUUuVmVjdG9yMygtc2l6ZUhhbGYsIC1zaXplSGFsZiwgMCkpO1xyXG4gIGdlb21ldHJ5LmZhY2VzLnB1c2gobmV3IFRIUkVFLkZhY2UzKDAsIDIsIDEpKTtcclxuICBnZW9tZXRyeS5mYWNlcy5wdXNoKG5ldyBUSFJFRS5GYWNlMygwLCAzLCAyKSk7XHJcbiAgcmV0dXJuIGdlb21ldHJ5O1xyXG59XHJcblxyXG4vLy8g44OG44Kv44K544OB44Oj44O85LiK44Gu5oyH5a6a44K544OX44Op44Kk44OI44GuVVbluqfmqJnjgpLmsYLjgoHjgotcclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNwcml0ZVVWKGdlb21ldHJ5LCB0ZXh0dXJlLCBjZWxsV2lkdGgsIGNlbGxIZWlnaHQsIGNlbGxObylcclxue1xyXG4gIHZhciB3aWR0aCA9IHRleHR1cmUuaW1hZ2Uud2lkdGg7XHJcbiAgdmFyIGhlaWdodCA9IHRleHR1cmUuaW1hZ2UuaGVpZ2h0O1xyXG5cclxuICB2YXIgdUNlbGxDb3VudCA9ICh3aWR0aCAvIGNlbGxXaWR0aCkgfCAwO1xyXG4gIHZhciB2Q2VsbENvdW50ID0gKGhlaWdodCAvIGNlbGxIZWlnaHQpIHwgMDtcclxuICB2YXIgdlBvcyA9IHZDZWxsQ291bnQgLSAoKGNlbGxObyAvIHVDZWxsQ291bnQpIHwgMCk7XHJcbiAgdmFyIHVQb3MgPSBjZWxsTm8gJSB1Q2VsbENvdW50O1xyXG4gIHZhciB1VW5pdCA9IGNlbGxXaWR0aCAvIHdpZHRoOyBcclxuICB2YXIgdlVuaXQgPSBjZWxsSGVpZ2h0IC8gaGVpZ2h0O1xyXG5cclxuICBnZW9tZXRyeS5mYWNlVmVydGV4VXZzWzBdLnB1c2goW1xyXG4gICAgbmV3IFRIUkVFLlZlY3RvcjIoKHVQb3MpICogY2VsbFdpZHRoIC8gd2lkdGgsICh2UG9zKSAqIGNlbGxIZWlnaHQgLyBoZWlnaHQpLFxyXG4gICAgbmV3IFRIUkVFLlZlY3RvcjIoKHVQb3MgKyAxKSAqIGNlbGxXaWR0aCAvIHdpZHRoLCAodlBvcyAtIDEpICogY2VsbEhlaWdodCAvIGhlaWdodCksXHJcbiAgICBuZXcgVEhSRUUuVmVjdG9yMigodVBvcyArIDEpICogY2VsbFdpZHRoIC8gd2lkdGgsICh2UG9zKSAqIGNlbGxIZWlnaHQgLyBoZWlnaHQpXHJcbiAgXSk7XHJcbiAgZ2VvbWV0cnkuZmFjZVZlcnRleFV2c1swXS5wdXNoKFtcclxuICAgIG5ldyBUSFJFRS5WZWN0b3IyKCh1UG9zKSAqIGNlbGxXaWR0aCAvIHdpZHRoLCAodlBvcykgKiBjZWxsSGVpZ2h0IC8gaGVpZ2h0KSxcclxuICAgIG5ldyBUSFJFRS5WZWN0b3IyKCh1UG9zKSAqIGNlbGxXaWR0aCAvIHdpZHRoLCAodlBvcyAtIDEpICogY2VsbEhlaWdodCAvIGhlaWdodCksXHJcbiAgICBuZXcgVEhSRUUuVmVjdG9yMigodVBvcyArIDEpICogY2VsbFdpZHRoIC8gd2lkdGgsICh2UG9zIC0gMSkgKiBjZWxsSGVpZ2h0IC8gaGVpZ2h0KVxyXG4gIF0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlU3ByaXRlVVYoZ2VvbWV0cnksIHRleHR1cmUsIGNlbGxXaWR0aCwgY2VsbEhlaWdodCwgY2VsbE5vKVxyXG57XHJcbiAgdmFyIHdpZHRoID0gdGV4dHVyZS5pbWFnZS53aWR0aDtcclxuICB2YXIgaGVpZ2h0ID0gdGV4dHVyZS5pbWFnZS5oZWlnaHQ7XHJcblxyXG4gIHZhciB1Q2VsbENvdW50ID0gKHdpZHRoIC8gY2VsbFdpZHRoKSB8IDA7XHJcbiAgdmFyIHZDZWxsQ291bnQgPSAoaGVpZ2h0IC8gY2VsbEhlaWdodCkgfCAwO1xyXG4gIHZhciB2UG9zID0gdkNlbGxDb3VudCAtICgoY2VsbE5vIC8gdUNlbGxDb3VudCkgfCAwKTtcclxuICB2YXIgdVBvcyA9IGNlbGxObyAlIHVDZWxsQ291bnQ7XHJcbiAgdmFyIHVVbml0ID0gY2VsbFdpZHRoIC8gd2lkdGg7XHJcbiAgdmFyIHZVbml0ID0gY2VsbEhlaWdodCAvIGhlaWdodDtcclxuICB2YXIgdXZzID0gZ2VvbWV0cnkuZmFjZVZlcnRleFV2c1swXVswXTtcclxuXHJcbiAgdXZzWzBdLnggPSAodVBvcykgKiB1VW5pdDtcclxuICB1dnNbMF0ueSA9ICh2UG9zKSAqIHZVbml0O1xyXG4gIHV2c1sxXS54ID0gKHVQb3MgKyAxKSAqIHVVbml0O1xyXG4gIHV2c1sxXS55ID0gKHZQb3MgLSAxKSAqIHZVbml0O1xyXG4gIHV2c1syXS54ID0gKHVQb3MgKyAxKSAqIHVVbml0O1xyXG4gIHV2c1syXS55ID0gKHZQb3MpICogdlVuaXQ7XHJcblxyXG4gIHV2cyA9IGdlb21ldHJ5LmZhY2VWZXJ0ZXhVdnNbMF1bMV07XHJcblxyXG4gIHV2c1swXS54ID0gKHVQb3MpICogdVVuaXQ7XHJcbiAgdXZzWzBdLnkgPSAodlBvcykgKiB2VW5pdDtcclxuICB1dnNbMV0ueCA9ICh1UG9zKSAqIHVVbml0O1xyXG4gIHV2c1sxXS55ID0gKHZQb3MgLSAxKSAqIHZVbml0O1xyXG4gIHV2c1syXS54ID0gKHVQb3MgKyAxKSAqIHVVbml0O1xyXG4gIHV2c1syXS55ID0gKHZQb3MgLSAxKSAqIHZVbml0O1xyXG5cclxuIFxyXG4gIGdlb21ldHJ5LnV2c05lZWRVcGRhdGUgPSB0cnVlO1xyXG5cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNwcml0ZU1hdGVyaWFsKHRleHR1cmUpXHJcbntcclxuICAvLyDjg6Hjg4Pjgrfjg6Xjga7kvZzmiJDjg7vooajnpLogLy8vXHJcbiAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgbWFwOiB0ZXh0dXJlIC8qLGRlcHRoVGVzdDp0cnVlKi8sIHRyYW5zcGFyZW50OiB0cnVlIH0pO1xyXG4gIG1hdGVyaWFsLnNoYWRpbmcgPSBUSFJFRS5GbGF0U2hhZGluZztcclxuICBtYXRlcmlhbC5zaWRlID0gVEhSRUUuRnJvbnRTaWRlO1xyXG4gIG1hdGVyaWFsLmFscGhhVGVzdCA9IDAuNTtcclxuICBtYXRlcmlhbC5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbi8vICBtYXRlcmlhbC5cclxuICByZXR1cm4gbWF0ZXJpYWw7XHJcbn1cclxuXHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbi8vIOOCreODvOWFpeWKm1xyXG5leHBvcnQgZnVuY3Rpb24gQmFzaWNJbnB1dCgpIHtcclxuICB0aGlzLmtleUNoZWNrID0geyB1cDogZmFsc2UsIGRvd246IGZhbHNlLCBsZWZ0OiBmYWxzZSwgcmlnaHQ6IGZhbHNlLCB6OiBmYWxzZSAseDpmYWxzZSB9O1xyXG4gIHRoaXMua2V5QnVmZmVyID0gW107XHJcbiAgdGhpcy5rZXl1cF8gPSBudWxsO1xyXG4gIHRoaXMua2V5ZG93bl8gPSBudWxsO1xyXG59XHJcblxyXG5CYXNpY0lucHV0LnByb3RvdHlwZSA9IHtcclxuICBjbGVhcjogZnVuY3Rpb24oKVxyXG4gIHtcclxuICAgIGZvcih2YXIgZCBpbiB0aGlzLmtleUNoZWNrKXtcclxuICAgICAgdGhpcy5rZXlDaGVja1tkXSA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgdGhpcy5rZXlCdWZmZXIubGVuZ3RoID0gMDtcclxuICB9LFxyXG4gIGtleWRvd246IGZ1bmN0aW9uIChlKSB7XHJcbiAgICB2YXIgZSA9IGQzLmV2ZW50O1xyXG4gICAgdmFyIGtleUJ1ZmZlciA9IHRoaXMua2V5QnVmZmVyO1xyXG4gICAgdmFyIGtleUNoZWNrID0gdGhpcy5rZXlDaGVjaztcclxuICAgIHZhciBoYW5kbGUgPSB0cnVlO1xyXG4gICAgIFxyXG4gICAgaWYgKGUua2V5Q29kZSA9PSAxOTIpIHtcclxuICAgICAgQ0hFQ0tfQ09MTElTSU9OID0gIUNIRUNLX0NPTExJU0lPTjtcclxuICAgIH07XHJcblxyXG4gICAgaWYgKGtleUJ1ZmZlci5sZW5ndGggPiAxNikge1xyXG4gICAgICBrZXlCdWZmZXIuc2hpZnQoKTtcclxuICAgIH1cclxuICAgIGtleUJ1ZmZlci5wdXNoKGUua2V5Q29kZSk7XHJcbiAgICBzd2l0Y2ggKGUua2V5Q29kZSkge1xyXG4gICAgICBjYXNlIDc0OlxyXG4gICAgICBjYXNlIDM3OlxyXG4gICAgICBjYXNlIDEwMDpcclxuICAgICAgICBrZXlDaGVjay5sZWZ0ID0gdHJ1ZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDczOlxyXG4gICAgICBjYXNlIDM4OlxyXG4gICAgICBjYXNlIDEwNDpcclxuICAgICAgICBrZXlDaGVjay51cCA9IHRydWU7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA3NjpcclxuICAgICAgY2FzZSAzOTpcclxuICAgICAgY2FzZSAxMDI6XHJcbiAgICAgICAga2V5Q2hlY2sucmlnaHQgPSB0cnVlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgNzU6XHJcbiAgICAgIGNhc2UgNDA6XHJcbiAgICAgIGNhc2UgOTg6XHJcbiAgICAgICAga2V5Q2hlY2suZG93biA9IHRydWU7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA5MDpcclxuICAgICAgICBrZXlDaGVjay56ID0gdHJ1ZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDg4OlxyXG4gICAgICAgIGtleUNoZWNrLnggPSB0cnVlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICBpZiAoaGFuZGxlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfSxcclxuICBrZXl1cDogZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGUgPSBkMy5ldmVudDtcclxuICAgIHZhciBrZXlCdWZmZXIgPSB0aGlzLmtleUJ1ZmZlcjtcclxuICAgIHZhciBrZXlDaGVjayA9IHRoaXMua2V5Q2hlY2s7XHJcbiAgICB2YXIgaGFuZGxlID0gZmFsc2U7XHJcbiAgICBzd2l0Y2ggKGUua2V5Q29kZSkge1xyXG4gICAgICBjYXNlIDc0OlxyXG4gICAgICBjYXNlIDM3OlxyXG4gICAgICBjYXNlIDEwMDpcclxuICAgICAgICBrZXlDaGVjay5sZWZ0ID0gZmFsc2U7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA3MzpcclxuICAgICAgY2FzZSAzODpcclxuICAgICAgY2FzZSAxMDQ6XHJcbiAgICAgICAga2V5Q2hlY2sudXAgPSBmYWxzZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDc2OlxyXG4gICAgICBjYXNlIDM5OlxyXG4gICAgICBjYXNlIDEwMjpcclxuICAgICAgICBrZXlDaGVjay5yaWdodCA9IGZhbHNlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgNzU6XHJcbiAgICAgIGNhc2UgNDA6XHJcbiAgICAgIGNhc2UgOTg6XHJcbiAgICAgICAga2V5Q2hlY2suZG93biA9IGZhbHNlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgOTA6XHJcbiAgICAgICAga2V5Q2hlY2sueiA9IGZhbHNlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgODg6XHJcbiAgICAgICAga2V5Q2hlY2sueCA9IGZhbHNlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICBpZiAoaGFuZGxlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfSxcclxuICAvL+OCpOODmeODs+ODiOOBq+ODkOOCpOODs+ODieOBmeOCi1xyXG4gIGJpbmQ6ZnVuY3Rpb24oKVxyXG4gIHtcclxuICAgIGQzLnNlbGVjdCgnYm9keScpLm9uKCdrZXlkb3duJyx0aGlzLmtleWRvd24uYmluZCh0aGlzKSk7XHJcbiAgICBkMy5zZWxlY3QoJ2JvZHknKS5vbigna2V5dXAnLHRoaXMua2V5dXAuYmluZCh0aGlzKSk7XHJcbiAgfSxcclxuICAvLyDjgqLjg7Pjg5DjgqTjg7Pjg4njgZnjgotcclxuICB1bmJpbmQ6ZnVuY3Rpb24oKVxyXG4gIHtcclxuICAgIGQzLnNlbGVjdCgnYm9keScpLm9uKCdrZXlkb3duJyxudWxsKTtcclxuICAgIGQzLnNlbGVjdCgnYm9keScpLm9uKCdrZXl1cCcsbnVsbCk7XHJcbiAgfVxyXG59IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5pbXBvcnQgKiBhcyBzZmcgZnJvbSAnLi9nbG9iYWwnO1xyXG5pbXBvcnQgKiBhcyBnYW1lb2JqIGZyb20gJy4vZ2FtZW9iaic7XHJcbmltcG9ydCAqIGFzIGdyYXBoaWNzIGZyb20gJy4vZ3JhcGhpY3MnO1xyXG5cclxudmFyIG15QnVsbGV0cyA9IFtdO1xyXG5cclxuLy8vIOiHquapn+W8viBcclxuZXhwb3J0IGNsYXNzIE15QnVsbGV0IGV4dGVuZHMgZ2FtZW9iai5HYW1lT2JqIHtcclxuICBjb25zdHJ1Y3RvcihzY2VuZSxzZSkge1xyXG4gIHN1cGVyKDAsIDAsIDApO1xyXG5cclxuICB0aGlzLmNvbGxpc2lvbkFyZWEud2lkdGggPSA0O1xyXG4gIHRoaXMuY29sbGlzaW9uQXJlYS5oZWlnaHQgPSA2O1xyXG4gIHRoaXMuc3BlZWQgPSA4O1xyXG5cclxuICB0aGlzLnRleHR1cmVXaWR0aCA9IHNmZy50ZXh0dXJlRmlsZXMubXlzaGlwLmltYWdlLndpZHRoO1xyXG4gIHRoaXMudGV4dHVyZUhlaWdodCA9IHNmZy50ZXh0dXJlRmlsZXMubXlzaGlwLmltYWdlLmhlaWdodDtcclxuXHJcbiAgLy8g44Oh44OD44K344Ol44Gu5L2c5oiQ44O76KGo56S6IC8vL1xyXG5cclxuICB2YXIgbWF0ZXJpYWwgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVNYXRlcmlhbChzZmcudGV4dHVyZUZpbGVzLm15c2hpcCk7XHJcbiAgdmFyIGdlb21ldHJ5ID0gZ3JhcGhpY3MuY3JlYXRlU3ByaXRlR2VvbWV0cnkoMTYpO1xyXG4gIGdyYXBoaWNzLmNyZWF0ZVNwcml0ZVVWKGdlb21ldHJ5LCBzZmcudGV4dHVyZUZpbGVzLm15c2hpcCwgMTYsIDE2LCAxKTtcclxuICB0aGlzLm1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG5cclxuICB0aGlzLm1lc2gucG9zaXRpb24ueCA9IHRoaXMueF87XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnkgPSB0aGlzLnlfO1xyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi56ID0gdGhpcy56XztcclxuICB0aGlzLnNlID0gc2U7XHJcbiAgLy9zZSgwKTtcclxuICAvL3NlcXVlbmNlci5wbGF5VHJhY2tzKHNvdW5kRWZmZWN0cy5zb3VuZEVmZmVjdHNbMF0pO1xyXG4gIHNjZW5lLmFkZCh0aGlzLm1lc2gpO1xyXG4gIHRoaXMubWVzaC52aXNpYmxlID0gdGhpcy5lbmFibGVfID0gZmFsc2U7XHJcbiAgLy8gIHNmZy50YXNrcy5wdXNoVGFzayhmdW5jdGlvbiAodGFza0luZGV4KSB7IHNlbGYubW92ZSh0YXNrSW5kZXgpOyB9KTtcclxuIH1cclxuXHJcbiAgZ2V0IHgoKSB7IHJldHVybiB0aGlzLnhfOyB9XHJcbiAgc2V0IHgodikgeyB0aGlzLnhfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnggPSB2OyB9XHJcbiAgZ2V0IHkoKSB7IHJldHVybiB0aGlzLnlfOyB9XHJcbiAgc2V0IHkodikgeyB0aGlzLnlfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnkgPSB2OyB9XHJcbiAgZ2V0IHooKSB7IHJldHVybiB0aGlzLnpfOyB9XHJcbiAgc2V0IHoodikgeyB0aGlzLnpfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnogPSB2OyB9XHJcbiAgbW92ZSh0YXNrSW5kZXgpIHtcclxuICAgIGlmICghdGhpcy5lbmFibGVfKSB7XHJcbiAgICAgIHRoaXMubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgIHNmZy50YXNrcy5yZW1vdmVUYXNrKHRhc2tJbmRleCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnkgKz0gdGhpcy5keTtcclxuICAgIHRoaXMueCArPSB0aGlzLmR4O1xyXG5cclxuICAgIGlmICh0aGlzLnkgPiAoc2ZnLlZfVE9QICsgMTYpIHx8IHRoaXMueSA8IChzZmcuVl9CT1RUT00gLSAxNikgfHwgdGhpcy54ID4gKHNmZy5WX1JJR0hUICsgMTYpIHx8IHRoaXMueCA8IChzZmcuVl9MRUZUIC0gMTYpKSB7XHJcbiAgICAgIHNmZy50YXNrcy5yZW1vdmVUYXNrKHRhc2tJbmRleCk7XHJcbiAgICAgIHRoaXMuZW5hYmxlXyA9IHRoaXMubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgc3RhcnQoeCwgeSwgeiwgYWltUmFkaWFuKSB7XHJcbiAgICBpZiAodGhpcy5lbmFibGVfKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHRoaXMueCA9IHg7XHJcbiAgICB0aGlzLnkgPSB5O1xyXG4gICAgdGhpcy56ID0geiAtIDAuMTtcclxuICAgIHRoaXMuZHggPSBNYXRoLmNvcyhhaW1SYWRpYW4pICogdGhpcy5zcGVlZDtcclxuICAgIHRoaXMuZHkgPSBNYXRoLnNpbihhaW1SYWRpYW4pICogdGhpcy5zcGVlZDtcclxuICAgIHRoaXMuZW5hYmxlXyA9IHRoaXMubWVzaC52aXNpYmxlID0gdHJ1ZTtcclxuICAgIHRoaXMuc2UoMCk7XHJcbiAgICAvL3NlcXVlbmNlci5wbGF5VHJhY2tzKHNvdW5kRWZmZWN0cy5zb3VuZEVmZmVjdHNbMF0pO1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgc2ZnLnRhc2tzLnB1c2hUYXNrKGZ1bmN0aW9uIChpKSB7IHNlbGYubW92ZShpKTsgfSk7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDoh6rmqZ/jgqrjg5bjgrjjgqfjgq/jg4hcclxuZXhwb3J0IGNsYXNzIE15U2hpcCBleHRlbmRzIGdhbWVvYmouR2FtZU9iaiB7IFxyXG4gIGNvbnN0cnVjdG9yKHgsIHksIHosc2NlbmUsc2UpIHtcclxuICBzdXBlcih4LCB5LCB6KTsvLyBleHRlbmRcclxuXHJcbiAgdGhpcy5jb2xsaXNpb25BcmVhLndpZHRoID0gNjtcclxuICB0aGlzLmNvbGxpc2lvbkFyZWEuaGVpZ2h0ID0gODtcclxuICB0aGlzLnNlID0gc2U7XHJcbiAgdGhpcy5zY2VuZSA9IHNjZW5lO1xyXG5cclxuICB0aGlzLnRleHR1cmVXaWR0aCA9IHNmZy50ZXh0dXJlRmlsZXMubXlzaGlwLmltYWdlLndpZHRoO1xyXG4gIHRoaXMudGV4dHVyZUhlaWdodCA9IHNmZy50ZXh0dXJlRmlsZXMubXlzaGlwLmltYWdlLmhlaWdodDtcclxuXHJcbiAgdGhpcy53aWR0aCA9IDE2O1xyXG4gIHRoaXMuaGVpZ2h0ID0gMTY7XHJcblxyXG4gIC8vIOenu+WLleevhOWbsuOCkuaxguOCgeOCi1xyXG4gIHRoaXMudG9wID0gKHNmZy5WX1RPUCAtIHRoaXMuaGVpZ2h0IC8gMikgfCAwO1xyXG4gIHRoaXMuYm90dG9tID0gKHNmZy5WX0JPVFRPTSArIHRoaXMuaGVpZ2h0IC8gMikgfCAwO1xyXG4gIHRoaXMubGVmdCA9IChzZmcuVl9MRUZUICsgdGhpcy53aWR0aCAvIDIpIHwgMDtcclxuICB0aGlzLnJpZ2h0ID0gKHNmZy5WX1JJR0hUIC0gdGhpcy53aWR0aCAvIDIpIHwgMDtcclxuXHJcbiAgLy8g44Oh44OD44K344Ol44Gu5L2c5oiQ44O76KGo56S6XHJcbiAgLy8g44Oe44OG44Oq44Ki44Or44Gu5L2c5oiQXHJcbiAgdmFyIG1hdGVyaWFsID0gZ3JhcGhpY3MuY3JlYXRlU3ByaXRlTWF0ZXJpYWwoc2ZnLnRleHR1cmVGaWxlcy5teXNoaXApO1xyXG4gIC8vIOOCuOOCquODoeODiOODquOBruS9nOaIkFxyXG4gIHZhciBnZW9tZXRyeSA9IGdyYXBoaWNzLmNyZWF0ZVNwcml0ZUdlb21ldHJ5KHRoaXMud2lkdGgpO1xyXG4gIGdyYXBoaWNzLmNyZWF0ZVNwcml0ZVVWKGdlb21ldHJ5LCBzZmcudGV4dHVyZUZpbGVzLm15c2hpcCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIDApO1xyXG5cclxuICB0aGlzLm1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG5cclxuICB0aGlzLm1lc2gucG9zaXRpb24ueCA9IHRoaXMueF87XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnkgPSB0aGlzLnlfO1xyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi56ID0gdGhpcy56XztcclxuICB0aGlzLnJlc3QgPSAzO1xyXG4gIHRoaXMubXlCdWxsZXRzID0gKCAoKT0+IHtcclxuICAgIHZhciBhcnIgPSBbXTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMjsgKytpKSB7XHJcbiAgICAgIGFyci5wdXNoKG5ldyBNeUJ1bGxldCh0aGlzLnNjZW5lLHRoaXMuc2UpKTtcclxuICAgIH1cclxuICAgIHJldHVybiBhcnI7XHJcbiAgfSkoKTtcclxuICBzY2VuZS5hZGQodGhpcy5tZXNoKTtcclxufVxyXG4gIGdldCB4KCkgeyByZXR1cm4gdGhpcy54XzsgfVxyXG4gIHNldCB4KHYpIHsgdGhpcy54XyA9IHRoaXMubWVzaC5wb3NpdGlvbi54ID0gdjsgfVxyXG4gIGdldCB5KCkgeyByZXR1cm4gdGhpcy55XzsgfVxyXG4gIHNldCB5KHYpIHsgdGhpcy55XyA9IHRoaXMubWVzaC5wb3NpdGlvbi55ID0gdjsgfVxyXG4gIGdldCB6KCkgeyByZXR1cm4gdGhpcy56XzsgfVxyXG4gIHNldCB6KHYpIHsgdGhpcy56XyA9IHRoaXMubWVzaC5wb3NpdGlvbi56ID0gdjsgfVxyXG4gIFxyXG4gIHNob290KGFpbVJhZGlhbikge1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHRoaXMubXlCdWxsZXRzLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIGlmICh0aGlzLm15QnVsbGV0c1tpXS5zdGFydCh0aGlzLngsIHRoaXMueSAsIHRoaXMueixhaW1SYWRpYW4pKSB7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgYWN0aW9uKGJhc2ljSW5wdXQpIHtcclxuICAgIGlmIChiYXNpY0lucHV0LmtleUNoZWNrLmxlZnQpIHtcclxuICAgICAgaWYgKHRoaXMueCA+IHRoaXMubGVmdCkge1xyXG4gICAgICAgIHRoaXMueCAtPSAyO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGJhc2ljSW5wdXQua2V5Q2hlY2sucmlnaHQpIHtcclxuICAgICAgaWYgKHRoaXMueCA8IHRoaXMucmlnaHQpIHtcclxuICAgICAgICB0aGlzLnggKz0gMjtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChiYXNpY0lucHV0LmtleUNoZWNrLnVwKSB7XHJcbiAgICAgIGlmICh0aGlzLnkgPCB0aGlzLnRvcCkge1xyXG4gICAgICAgIHRoaXMueSArPSAyO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGJhc2ljSW5wdXQua2V5Q2hlY2suZG93bikge1xyXG4gICAgICBpZiAodGhpcy55ID4gdGhpcy5ib3R0b20pIHtcclxuICAgICAgICB0aGlzLnkgLT0gMjtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBpZiAoYmFzaWNJbnB1dC5rZXlDaGVjay56KSB7XHJcbiAgICAgIGJhc2ljSW5wdXQua2V5Q2hlY2sueiA9IGZhbHNlO1xyXG4gICAgICB0aGlzLnNob290KDAuNSAqIE1hdGguUEkpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChiYXNpY0lucHV0LmtleUNoZWNrLngpIHtcclxuICAgICAgYmFzaWNJbnB1dC5rZXlDaGVjay54ID0gZmFsc2U7XHJcbiAgICAgIHRoaXMuc2hvb3QoMS41ICogTWF0aC5QSSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIGhpdCgpIHtcclxuICAgIHRoaXMubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICBzZmcuYm9tYnMuc3RhcnQodGhpcy54LCB0aGlzLnksIDAuMik7XHJcbiAgICB0aGlzLnNlKDQpO1xyXG4gIH1cclxuXHJcbn0iLCJcInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0ICogYXMgc2ZnIGZyb20gJy4vZ2xvYmFsJztcclxuLy9pbXBvcnQgKiAgYXMgZ2FtZW9iaiBmcm9tICcuL2dhbWVvYmonO1xyXG4vL2ltcG9ydCAqIGFzIGdyYXBoaWNzIGZyb20gJy4vZ3JhcGhpY3MnO1xyXG5cclxuLy8vIOODhuOCreOCueODiOWxnuaAp1xyXG5leHBvcnQgZnVuY3Rpb24gVGV4dEF0dHJpYnV0ZShibGluaywgZm9udCkge1xyXG4gIGlmIChibGluaykge1xyXG4gICAgdGhpcy5ibGluayA9IGJsaW5rO1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0aGlzLmJsaW5rID0gZmFsc2U7XHJcbiAgfVxyXG4gIGlmIChmb250KSB7XHJcbiAgICB0aGlzLmZvbnQgPSBmb250O1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0aGlzLmZvbnQgPSBzZmcudGV4dHVyZUZpbGVzLmZvbnQ7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g44OG44Kt44K544OI44OX44Os44O844OzXHJcbmV4cG9ydCBmdW5jdGlvbiBUZXh0UGxhbmUoc2NlbmUpIHtcclxuICB0aGlzLnRleHRCdWZmZXIgPSBuZXcgQXJyYXkoc2ZnLlRFWFRfSEVJR0hUKTtcclxuICB0aGlzLmF0dHJCdWZmZXIgPSBuZXcgQXJyYXkoc2ZnLlRFWFRfSEVJR0hUKTtcclxuICB0aGlzLnRleHRCYWNrQnVmZmVyID0gbmV3IEFycmF5KHNmZy5URVhUX0hFSUdIVCk7XHJcbiAgdGhpcy5hdHRyQmFja0J1ZmZlciA9IG5ldyBBcnJheShzZmcuVEVYVF9IRUlHSFQpO1xyXG4gIHZhciBlbmRpID0gdGhpcy50ZXh0QnVmZmVyLmxlbmd0aDtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGVuZGk7ICsraSkge1xyXG4gICAgdGhpcy50ZXh0QnVmZmVyW2ldID0gbmV3IEFycmF5KHNmZy5URVhUX1dJRFRIKTtcclxuICAgIHRoaXMuYXR0ckJ1ZmZlcltpXSA9IG5ldyBBcnJheShzZmcuVEVYVF9XSURUSCk7XHJcbiAgICB0aGlzLnRleHRCYWNrQnVmZmVyW2ldID0gbmV3IEFycmF5KHNmZy5URVhUX1dJRFRIKTtcclxuICAgIHRoaXMuYXR0ckJhY2tCdWZmZXJbaV0gPSBuZXcgQXJyYXkoc2ZnLlRFWFRfV0lEVEgpO1xyXG4gIH1cclxuXHJcblxyXG4gIC8vIOaPj+eUu+eUqOOCreODo+ODs+ODkOOCueOBruOCu+ODg+ODiOOCouODg+ODl1xyXG5cclxuICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gIHZhciB3aWR0aCA9IDE7XHJcbiAgd2hpbGUgKHdpZHRoIDw9IHNmZy5WSVJUVUFMX1dJRFRIKXtcclxuICAgIHdpZHRoICo9IDI7XHJcbiAgfVxyXG4gIHZhciBoZWlnaHQgPSAxO1xyXG4gIHdoaWxlIChoZWlnaHQgPD0gc2ZnLlZJUlRVQUxfSEVJR0hUKXtcclxuICAgIGhlaWdodCAqPSAyO1xyXG4gIH1cclxuICBcclxuICB0aGlzLmNhbnZhcy53aWR0aCA9IHdpZHRoO1xyXG4gIHRoaXMuY2FudmFzLmhlaWdodCA9IGhlaWdodDtcclxuICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgdGhpcy50ZXh0dXJlID0gbmV3IFRIUkVFLlRleHR1cmUodGhpcy5jYW52YXMpO1xyXG4gIHRoaXMudGV4dHVyZS5tYWdGaWx0ZXIgPSBUSFJFRS5OZWFyZXN0RmlsdGVyO1xyXG4gIHRoaXMudGV4dHVyZS5taW5GaWx0ZXIgPSBUSFJFRS5MaW5lYXJNaXBNYXBMaW5lYXJGaWx0ZXI7XHJcbiAgdGhpcy5tYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7IG1hcDogdGhpcy50ZXh0dXJlLGFscGhhVGVzdDowLjUsIHRyYW5zcGFyZW50OiB0cnVlLGRlcHRoVGVzdDp0cnVlLHNoYWRpbmc6VEhSRUUuRmxhdFNoYWRpbmd9KTtcclxuLy8gIHRoaXMuZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeShzZmcuVklSVFVBTF9XSURUSCwgc2ZnLlZJUlRVQUxfSEVJR0hUKTtcclxuICB0aGlzLmdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkod2lkdGgsIGhlaWdodCk7XHJcbiAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2godGhpcy5nZW9tZXRyeSwgdGhpcy5tYXRlcmlhbCk7XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnogPSAwLjQ7XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnggPSAod2lkdGggLSBzZmcuVklSVFVBTF9XSURUSCkgLyAyO1xyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi55ID0gIC0gKGhlaWdodCAtIHNmZy5WSVJUVUFMX0hFSUdIVCkgLyAyO1xyXG4gIHRoaXMuZm9udHMgPSB7IGZvbnQ6IHNmZy50ZXh0dXJlRmlsZXMuZm9udCwgZm9udDE6IHNmZy50ZXh0dXJlRmlsZXMuZm9udDEgfTtcclxuICB0aGlzLmJsaW5rQ291bnQgPSAwO1xyXG4gIHRoaXMuYmxpbmsgPSBmYWxzZTtcclxuXHJcbiAgLy8g44K544Og44O844K444Oz44Kw44KS5YiH44KLXHJcbiAgdGhpcy5jdHgubXNJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICB0aGlzLmN0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICAvL3RoaXMuY3R4LndlYmtpdEltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIHRoaXMuY3R4Lm1vekltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG5cclxuICB0aGlzLmNscygpO1xyXG4gIHNjZW5lLmFkZCh0aGlzLm1lc2gpO1xyXG59XHJcblxyXG5UZXh0UGxhbmUucHJvdG90eXBlID0ge1xyXG4gIGNvbnN0cnVjdG9yOlRleHRQbGFuZSxcclxuICAvLy8g55S76Z2i5raI5Y67XHJcbiAgY2xzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kaSA9IHRoaXMudGV4dEJ1ZmZlci5sZW5ndGg7IGkgPCBlbmRpOyArK2kpIHtcclxuICAgICAgdmFyIGxpbmUgPSB0aGlzLnRleHRCdWZmZXJbaV07XHJcbiAgICAgIHZhciBhdHRyX2xpbmUgPSB0aGlzLmF0dHJCdWZmZXJbaV07XHJcbiAgICAgIHZhciBsaW5lX2JhY2sgPSB0aGlzLnRleHRCYWNrQnVmZmVyW2ldO1xyXG4gICAgICB2YXIgYXR0cl9saW5lX2JhY2sgPSB0aGlzLmF0dHJCYWNrQnVmZmVyW2ldO1xyXG5cclxuICAgICAgZm9yICh2YXIgaiA9IDAsIGVuZGogPSB0aGlzLnRleHRCdWZmZXJbaV0ubGVuZ3RoOyBqIDwgZW5kajsgKytqKSB7XHJcbiAgICAgICAgbGluZVtqXSA9IDB4MjA7XHJcbiAgICAgICAgYXR0cl9saW5lW2pdID0gMHgwMDtcclxuICAgICAgICAvL2xpbmVfYmFja1tqXSA9IDB4MjA7XHJcbiAgICAgICAgLy9hdHRyX2xpbmVfYmFja1tqXSA9IDB4MDA7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCBzZmcuVklSVFVBTF9XSURUSCwgc2ZnLlZJUlRVQUxfSEVJR0hUKTtcclxuICB9LFxyXG5cclxuICAvLy8g5paH5a2X6KGo56S644GZ44KLXHJcbiAgcHJpbnQ6IGZ1bmN0aW9uICh4LCB5LCBzdHIsIGF0dHJpYnV0ZSkge1xyXG4gICAgdmFyIGxpbmUgPSB0aGlzLnRleHRCdWZmZXJbeV07XHJcbiAgICB2YXIgYXR0ciA9IHRoaXMuYXR0ckJ1ZmZlclt5XTtcclxuICAgIGlmICghYXR0cmlidXRlKSB7XHJcbiAgICAgIGF0dHJpYnV0ZSA9IDA7XHJcbiAgICB9XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7ICsraSkge1xyXG4gICAgICB2YXIgYyA9IHN0ci5jaGFyQ29kZUF0KGkpO1xyXG4gICAgICBpZiAoYyA9PSAweGEpIHtcclxuICAgICAgICArK3k7XHJcbiAgICAgICAgaWYgKHkgPj0gdGhpcy50ZXh0QnVmZmVyLmxlbmd0aCkge1xyXG4gICAgICAgICAgLy8g44K544Kv44Ot44O844OrXHJcbiAgICAgICAgICB0aGlzLnRleHRCdWZmZXIgPSB0aGlzLnRleHRCdWZmZXIuc2xpY2UoMSwgdGhpcy50ZXh0QnVmZmVyLmxlbmd0aCAtIDEpO1xyXG4gICAgICAgICAgdGhpcy50ZXh0QnVmZmVyLnB1c2gobmV3IEFycmF5KHNmZy5WSVJUVUFMX1dJRFRIIC8gOCkpO1xyXG4gICAgICAgICAgdGhpcy5hdHRyQnVmZmVyID0gdGhpcy5hdHRyQnVmZmVyLnNsaWNlKDEsIHRoaXMuYXR0ckJ1ZmZlci5sZW5ndGggLSAxKTtcclxuICAgICAgICAgIHRoaXMuYXR0ckJ1ZmZlci5wdXNoKG5ldyBBcnJheShzZmcuVklSVFVBTF9XSURUSCAvIDgpKTtcclxuICAgICAgICAgIC0teTtcclxuICAgICAgICAgIHZhciBlbmRqID0gdGhpcy50ZXh0QnVmZmVyW3ldLmxlbmd0aDtcclxuICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgZW5kajsgKytqKSB7XHJcbiAgICAgICAgICAgIHRoaXMudGV4dEJ1ZmZlclt5XVtqXSA9IDB4MjA7XHJcbiAgICAgICAgICAgIHRoaXMuYXR0ckJ1ZmZlclt5XVtqXSA9IDB4MDA7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxpbmUgPSB0aGlzLnRleHRCdWZmZXJbeV07XHJcbiAgICAgICAgYXR0ciA9IHRoaXMuYXR0ckJ1ZmZlclt5XTtcclxuICAgICAgICB4ID0gMDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBsaW5lW3hdID0gYztcclxuICAgICAgICBhdHRyW3hdID0gYXR0cmlidXRlO1xyXG4gICAgICAgICsreDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgLy8vIOODhuOCreOCueODiOODh+ODvOOCv+OCkuOCguOBqOOBq+ODhuOCr+OCueODgeODo+ODvOOBq+aPj+eUu+OBmeOCi1xyXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGN0eCA9IHRoaXMuY3R4O1xyXG4gICAgdGhpcy5ibGlua0NvdW50ID0gKHRoaXMuYmxpbmtDb3VudCArIDEpICYgMHhmO1xyXG5cclxuICAgIHZhciBkcmF3X2JsaW5rID0gZmFsc2U7XHJcbiAgICBpZiAoIXRoaXMuYmxpbmtDb3VudCkge1xyXG4gICAgICB0aGlzLmJsaW5rID0gIXRoaXMuYmxpbms7XHJcbiAgICAgIGRyYXdfYmxpbmsgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgdmFyIHVwZGF0ZSA9IGZhbHNlO1xyXG4vLyAgICBjdHguY2xlYXJSZWN0KDAsIDAsIENPTlNPTEVfV0lEVEgsIENPTlNPTEVfSEVJR0hUKTtcclxuLy8gICAgY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuXHJcbiAgICBmb3IgKHZhciB5ID0gMCwgZ3kgPSAwOyB5IDwgc2ZnLlRFWFRfSEVJR0hUOyArK3ksIGd5ICs9IHNmZy5BQ1RVQUxfQ0hBUl9TSVpFKSB7XHJcbiAgICAgIHZhciBsaW5lID0gdGhpcy50ZXh0QnVmZmVyW3ldO1xyXG4gICAgICB2YXIgYXR0cl9saW5lID0gdGhpcy5hdHRyQnVmZmVyW3ldO1xyXG4gICAgICB2YXIgbGluZV9iYWNrID0gdGhpcy50ZXh0QmFja0J1ZmZlclt5XTtcclxuICAgICAgdmFyIGF0dHJfbGluZV9iYWNrID0gdGhpcy5hdHRyQmFja0J1ZmZlclt5XTtcclxuICAgICAgZm9yICh2YXIgeCA9IDAsIGd4ID0gMDsgeCA8IHNmZy5URVhUX1dJRFRIOyArK3gsIGd4ICs9IHNmZy5BQ1RVQUxfQ0hBUl9TSVpFKSB7XHJcbiAgICAgICAgdmFyIHByb2Nlc3NfYmxpbmsgPSAoYXR0cl9saW5lW3hdICYmIGF0dHJfbGluZVt4XS5ibGluayk7XHJcbiAgICAgICAgaWYgKGxpbmVbeF0gIT0gbGluZV9iYWNrW3hdIHx8IGF0dHJfbGluZVt4XSAhPSBhdHRyX2xpbmVfYmFja1t4XSB8fCAocHJvY2Vzc19ibGluayAmJiBkcmF3X2JsaW5rKSkge1xyXG4gICAgICAgICAgdXBkYXRlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICBsaW5lX2JhY2tbeF0gPSBsaW5lW3hdO1xyXG4gICAgICAgICAgYXR0cl9saW5lX2JhY2tbeF0gPSBhdHRyX2xpbmVbeF07XHJcbiAgICAgICAgICB2YXIgYyA9IDA7XHJcbiAgICAgICAgICBpZiAoIXByb2Nlc3NfYmxpbmsgfHwgdGhpcy5ibGluaykge1xyXG4gICAgICAgICAgICBjID0gbGluZVt4XSAtIDB4MjA7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB2YXIgeXBvcyA9IChjID4+IDQpIDw8IDM7XHJcbiAgICAgICAgICB2YXIgeHBvcyA9IChjICYgMHhmKSA8PCAzO1xyXG4gICAgICAgICAgY3R4LmNsZWFyUmVjdChneCwgZ3ksIHNmZy5BQ1RVQUxfQ0hBUl9TSVpFLCBzZmcuQUNUVUFMX0NIQVJfU0laRSk7XHJcbiAgICAgICAgICB2YXIgZm9udCA9IGF0dHJfbGluZVt4XSA/IGF0dHJfbGluZVt4XS5mb250IDogc2ZnLnRleHR1cmVGaWxlcy5mb250O1xyXG4gICAgICAgICAgaWYgKGMpIHtcclxuICAgICAgICAgICAgY3R4LmRyYXdJbWFnZShmb250LmltYWdlLCB4cG9zLCB5cG9zLCBzZmcuQ0hBUl9TSVpFLCBzZmcuQ0hBUl9TSVpFLCBneCwgZ3ksIHNmZy5BQ1RVQUxfQ0hBUl9TSVpFLCBzZmcuQUNUVUFMX0NIQVJfU0laRSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLnRleHR1cmUubmVlZHNVcGRhdGUgPSB1cGRhdGU7XHJcbiAgfVxyXG59XHJcbiIsIlxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBUYXNrIHtcclxuICBjb25zdHJ1Y3RvcihmdW5jLHByaW9yaXR5KSB7XHJcbiAgICB0aGlzLnByaW9yaXR5ID0gcHJpb3JpdHkgfHwgMTAwMDA7XHJcbiAgICB0aGlzLmZ1bmMgPSBmdW5jO1xyXG4gICAgdGhpcy5pbmRleCA9IDA7XHJcbiAgfVxyXG4gIFxyXG59XHJcblxyXG5leHBvcnQgdmFyIG51bGxUYXNrID0gbmV3IFRhc2sobnVsbCk7XHJcblxyXG4vLy8g44K/44K544Kv566h55CGXHJcbmV4cG9ydCBjbGFzcyBUYXNrcyB7XHJcbiAgY29uc3RydWN0b3IoKXtcclxuICAgIHRoaXMuYXJyYXkgPSBuZXcgQXJyYXkoMCk7XHJcbiAgICB0aGlzLm5lZWRTb3J0ID0gZmFsc2U7XHJcbiAgICB0aGlzLm5lZWRDb21wcmVzcyA9IGZhbHNlO1xyXG4gIH1cclxuICAvLyBpbmRleOOBruS9jee9ruOBruOCv+OCueOCr+OCkue9ruOBjeaPm+OBiOOCi1xyXG4gIHNldE5leHRUYXNrKGluZGV4LCBmdW5jLCBwcmlvcml0eSkge1xyXG4gICAgdmFyIHQgPSBuZXcgVGFzayhmdW5jLCBwcmlvcml0eSk7XHJcbiAgICB0LmluZGV4ID0gaW5kZXg7XHJcbiAgICB0aGlzLmFycmF5W2luZGV4XSA9IHQ7XHJcbiAgICB0aGlzLm5lZWRTb3J0ID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIHB1c2hUYXNrKGZ1bmMsIHByaW9yaXR5KSB7XHJcbiAgICB2YXIgdCA9IG5ldyBUYXNrKGZ1bmMsIHByaW9yaXR5KTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5hcnJheS5sZW5ndGg7ICsraSkge1xyXG4gICAgICBpZiAodGhpcy5hcnJheVtpXSA9PSBudWxsVGFzaykge1xyXG4gICAgICAgIHRoaXMuYXJyYXlbaV0gPSB0O1xyXG4gICAgICAgIHQuaW5kZXggPSBpO1xyXG4gICAgICAgIHJldHVybiB0O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0LmluZGV4ID0gdGhpcy5hcnJheS5sZW5ndGg7XHJcbiAgICB0aGlzLmFycmF5W3RoaXMuYXJyYXkubGVuZ3RoXSA9IHQ7XHJcbiAgICB0aGlzLm5lZWRTb3J0ID0gdHJ1ZTtcclxuICAgIHJldHVybiB0O1xyXG4gIH1cclxuXHJcbiAgLy8g6YWN5YiX44KS5Y+W5b6X44GZ44KLXHJcbiAgZ2V0QXJyYXkoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5hcnJheTtcclxuICB9XHJcbiAgLy8g44K/44K544Kv44KS44Kv44Oq44Ki44GZ44KLXHJcbiAgY2xlYXIoKSB7XHJcbiAgICB0aGlzLmFycmF5Lmxlbmd0aCA9IDA7XHJcbiAgfVxyXG4gIC8vIOOCveODvOODiOOBjOW/heimgeOBi+ODgeOCp+ODg+OCr+OBl+OAgeOCveODvOODiOOBmeOCi1xyXG4gIGNoZWNrU29ydCgpIHtcclxuICAgIGlmICh0aGlzLm5lZWRTb3J0KSB7XHJcbiAgICAgIHRoaXMuYXJyYXkuc29ydChmdW5jdGlvbiAoYSwgYikge1xyXG4gICAgICAgIGlmKGEucHJpb3JpdHkgPiBiLnByaW9yaXR5KSByZXR1cm4gMTtcclxuICAgICAgICBpZiAoYS5wcmlvcml0eSA8IGIucHJpb3JpdHkpIHJldHVybiAtMTtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgICAgfSk7XHJcbiAgICAgIC8vIOOCpOODs+ODh+ODg+OCr+OCueOBruaMr+OCiuebtOOBl1xyXG4gICAgICBmb3IgKHZhciBpID0gMCwgZSA9IHRoaXMuYXJyYXkubGVuZ3RoOyBpIDwgZTsgKytpKSB7XHJcbiAgICAgICAgdGhpcy5hcnJheVtpXS5pbmRleCA9IGk7XHJcbiAgICAgIH1cclxuICAgICB0aGlzLm5lZWRTb3J0ID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZW1vdmVUYXNrKGluZGV4KSB7XHJcbiAgICB0aGlzLmFycmF5W2luZGV4XSA9IG51bGxUYXNrO1xyXG4gICAgdGhpcy5uZWVkQ29tcHJlc3MgPSB0cnVlO1xyXG4gIH1cclxuICBcclxuICBjb21wcmVzcygpIHtcclxuICAgIGlmICghdGhpcy5uZWVkQ29tcHJlc3MpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdmFyIGRlc3QgPSBbXTtcclxuICAgIHZhciBzcmMgPSB0aGlzLmFycmF5O1xyXG4gICAgdmFyIGRlc3RJbmRleCA9IDA7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gc3JjLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIHZhciBzID0gc3JjW2ldO1xyXG4gICAgICBpZiAocyAhPSBudWxsVGFzaykge1xyXG4gICAgICAgIHMuaW5kZXggPSBkZXN0SW5kZXg7XHJcbiAgICAgICAgZGVzdC5wdXNoKHMpO1xyXG4gICAgICAgIGRlc3RJbmRleCsrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLmFycmF5ID0gZGVzdDtcclxuICAgIHRoaXMubmVlZENvbXByZXNzID0gZmFsc2U7XHJcbiAgfVxyXG4gIFxyXG4gIHByb2Nlc3MoKVxyXG4gIHtcclxuICAgIFxyXG4gICAgXHJcbiAgfVxyXG59XHJcblxyXG4vLy8g44Ky44O844Og55So44K/44Kk44Oe44O8XHJcbmV4cG9ydCBjbGFzcyBHYW1lVGltZXIge1xyXG4gIGNvbnN0cnVjdG9yKGdldEN1cnJlbnRUaW1lKSB7XHJcbiAgICB0aGlzLmVsYXBzZWRUaW1lID0gMDtcclxuICAgIHRoaXMuY3VycmVudFRpbWUgPSAwO1xyXG4gICAgdGhpcy5wYXVzZVRpbWUgPSAwO1xyXG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLlNUT1A7XHJcbiAgICB0aGlzLmdldEN1cnJlbnRUaW1lID0gZ2V0Q3VycmVudFRpbWU7XHJcbiAgICB0aGlzLlNUT1AgPSAxO1xyXG4gICAgdGhpcy5TVEFSVCA9IDI7XHJcbiAgICB0aGlzLlBBVVNFID0gMztcclxuXHJcbiAgfVxyXG4gIFxyXG4gIHN0YXJ0KCkge1xyXG4gICAgdGhpcy5lbGFwc2VkVGltZSA9IDA7XHJcbiAgICB0aGlzLmRlbHRhVGltZSA9IDA7XHJcbiAgICB0aGlzLmN1cnJlbnRUaW1lID0gdGhpcy5nZXRDdXJyZW50VGltZSgpO1xyXG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLlNUQVJUO1xyXG4gIH1cclxuXHJcbiAgcmVzdW1lKCkge1xyXG4gICAgdmFyIG5vd1RpbWUgPSB0aGlzLmdldEN1cnJlbnRUaW1lKCk7XHJcbiAgICB0aGlzLmN1cnJlbnRUaW1lID0gdGhpcy5jdXJyZW50VGltZSArIG5vd1RpbWUgLSB0aGlzLnBhdXNlVGltZTtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5TVEFSVDtcclxuICB9XHJcblxyXG4gIHBhdXNlKCkge1xyXG4gICAgdGhpcy5wYXVzZVRpbWUgPSB0aGlzLmdldEN1cnJlbnRUaW1lKCk7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuUEFVU0U7XHJcbiAgfVxyXG5cclxuICBzdG9wKCkge1xyXG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLlNUT1A7XHJcbiAgfVxyXG5cclxuICB1cGRhdGUoKSB7XHJcbiAgICBpZiAodGhpcy5zdGF0dXMgIT0gdGhpcy5TVEFSVCkgcmV0dXJuO1xyXG4gICAgdmFyIG5vd1RpbWUgPSB0aGlzLmdldEN1cnJlbnRUaW1lKCk7XHJcbiAgICB0aGlzLmRlbHRhVGltZSA9IG5vd1RpbWUgLSB0aGlzLmN1cnJlbnRUaW1lO1xyXG4gICAgdGhpcy5lbGFwc2VkVGltZSA9IHRoaXMuZWxhcHNlZFRpbWUgKyB0aGlzLmRlbHRhVGltZTtcclxuICAgIHRoaXMuY3VycmVudFRpbWUgPSBub3dUaW1lO1xyXG4gIH1cclxufVxyXG5cclxuIl19
