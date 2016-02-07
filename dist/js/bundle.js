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

},{"./gameobj":7,"./global":8,"./graphics":9}],4:[function(require,module,exports){
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

    this.startRad = startRad || 0;
    this.stopRad = stopRad || 0;
    this.r = r || 0;
    this.speed = speed || 0;
    this.left = !left ? false : true;
    this.deltas = [];
    this.startRad_ = this.startRad * Math.PI;
    this.stopRad_ = this.stopRad * Math.PI;
    var rad = this.startRad_;
    var step = (left ? 1 : -1) * speed / r;
    var end = false;

    while (!end) {
      rad += step;
      if (left && rad >= this.stopRad_ || !left && rad <= this.stopRad_) {
        rad = this.stopRad_;
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
        sx = x - this.r * Math.cos(this.startRad_ + Math.PI);
      } else {
        sx = x - this.r * Math.cos(this.startRad_);
      }
      sy = y - this.r * Math.sin(this.startRad_);

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
      return ['CircleMove', this.startRad, this.stopRad, this.r, this.speed, this.left];
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

Zako.toJSON = function () {
  return 'Zako';
};

function Zako1(self) {
  self.score = 100;
  self.life = 1;
  graphics.updateSpriteUV(self.mesh.geometry, sfg.textureFiles.enemy, 16, 16, 6);
}

Zako1.toJSON = function () {
  return 'Zako1';
};

function MBoss(self) {
  self.score = 300;
  self.life = 2;
  self.mesh.blending = THREE.NormalBlending;
  graphics.updateSpriteUV(self.mesh.geometry, sfg.textureFiles.enemy, 16, 16, 4);
}

MBoss.toJSON = function () {
  return 'MBoss';
};

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
  }, {
    key: 'loadPatterns',
    value: function loadPatterns() {
      var _this3 = this;

      this.movePatterns = [];
      var this_ = this;
      return new Promise(function (resolve, reject) {
        d3.json('./res/enemyMovePattern.json', function (err, data) {
          if (err) {
            reject(err);
          }
          data.forEach(function (comArray, i) {
            var com = [];
            _this3.movePatterns.push(com);
            comArray.forEach(function (d, i) {
              switch (d[0]) {
                case 'LineMove':
                  com.push(LineMove.fromArray(d));
                  break;
                case 'CircleMove':
                  com.push(CircleMove.fromArray(d));
                  break;
                case 'GotoHome':
                  com.push(GotoHome.fromArray(d));
                  break;
                case 'HomeMove':
                  com.push(HomeMove.fromArray(d));
                  break;
                case 'Goto':
                  com.push(Goto.fromArray(d));
                  break;
                case 'Fire':
                  com.push(Fire.fromArray(d));
                  break;
              }
            });
          });
          resolve();
        });
      });
    }
  }, {
    key: 'loadFormations',
    value: function loadFormations() {
      var _this4 = this;

      this.moveSeqs = [];
      var funcs = new Map([["Zako", Zako], ["Zako1", Zako1], ["MBoss", MBoss]]);
      var this_ = this;
      return new Promise(function (resolve, reject) {
        d3.json('./res/enemyFormationPattern.json', function (err, data) {
          if (err) reject(err);
          data.forEach(function (form, i) {
            var stage = [];
            _this4.moveSeqs.push(stage);
            form.forEach(function (d, i) {
              d[6] = funcs.get(d[6]);
              stage.push(d);
            });
          });
          resolve();
        });
      });
    }
  }]);

  return Enemies;
}();

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

},{"./gameobj":7,"./global":8,"./graphics":9}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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
    key: 'initActors',
    value: function initActors() {
      var promises = [];
      this.scene = this.scene || new THREE.Scene();
      this.enemyBullets = this.enemyBullets || new enemies.EnemyBullets(this.scene, this.se.bind(this));
      this.enemies = this.enemies || new enemies.Enemies(this.scene, this.se.bind(this), this.enemyBullets);
      promises.push(this.enemies.loadPatterns());
      promises.push(this.enemies.loadFormations());
      this.bombs = sfg.bombs = this.bombs || new effectobj.Bombs(this.scene, this.se.bind(this));
      this.myship_ = this.myship_ || new myship.MyShip(0, -100, 0.1, this.scene, this.se.bind(this));
      sfg.myship_ = this.myship_;
      this.myship_.mesh.visible = false;

      this.spaceField = null;
      return Promise.all(promises);
    }
  }, {
    key: 'initCommAndHighScore',
    value: function initCommAndHighScore() {
      var _this5 = this;

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
      var _this6 = this;

      taskIndex = yield;
      this.initCommAndHighScore();
      this.basicInput.bind();
      this.initActors().then(function () {
        _this6.tasks.pushTask(_this6.render.bind(_this6), _this6.RENDERER_PRIORITY);
        _this6.tasks.setNextTask(taskIndex, _this6.printAuthor.bind(_this6));
      });
    }

    /// 作者表示

  }, {
    key: 'printAuthor',
    value: function* printAuthor(taskIndex) {
      var _this7 = this;

      var wait = 60;
      this.basicInput.keyBuffer.length = 0;

      var nextTask = function nextTask() {
        _this7.scene.remove(_this7.author);
        //scene.needsUpdate = true;
        _this7.tasks.setNextTask(taskIndex, _this7.initTitle.bind(_this7));
      };

      var checkKeyInput = function checkKeyInput() {
        if (_this7.basicInput.keyBuffer.length > 0 || _this7.basicInput.start) {
          _this7.basicInput.keyBuffer.length = 0;
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
      var _this8 = this;

      var end = false;
      if (this.editHandleName) {
        this.tasks.setNextTask(taskIndex, this.gameInit.bind(this));
      } else {
        var elm;
        var inputArea;
        var inputNode;

        var _ret = yield* function* () {
          _this8.editHandleName = _this8.handleName || '';
          _this8.textPlane.cls();
          _this8.textPlane.print(4, 18, 'Input your handle name.');
          _this8.textPlane.print(8, 19, '(Max 8 Char)');
          _this8.textPlane.print(10, 21, _this8.editHandleName);
          //    textPlane.print(10, 21, handleName[0], TextAttribute(true));
          _this8.basicInput.unbind();
          elm = d3.select('#content').append('input');

          var this_ = _this8;
          elm.attr('type', 'text').attr('pattern', '[a-zA-Z0-9_\@\#\$\-]{0,8}').attr('maxlength', 8).attr('id', 'input-area').attr('value', this_.editHandleName).call(function (d) {
            d.node().selectionStart = this_.editHandleName.length;
          }).on('blur', function () {
            var _this9 = this;

            d3.event.preventDefault();
            d3.event.stopImmediatePropagation();
            //let this_ = this;
            setTimeout(function () {
              _this9.focus();
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
            _this8.basicInput.clear();
            if (_this8.basicInput.aButton || _this8.basicInput.start) {
              inputArea = d3.select('#input-area');
              inputNode = inputArea.node();

              _this8.editHandleName = inputNode.value;
              var s = inputNode.selectionStart;
              var e = inputNode.selectionEnd;
              _this8.textPlane.print(10, 21, _this8.editHandleName);
              _this8.textPlane.print(10 + s, 21, '_', new text.TextAttribute(true));
              inputArea.on('keyup', null);
              _this8.basicInput.bind();
              // このタスクを終わらせる
              //this.tasks.array[taskIndex].genInst.next(-(taskIndex + 1));
              // 次のタスクを設定する
              _this8.tasks.setNextTask(taskIndex, _this8.gameInit.bind(_this8));
              _this8.storage.setItem('handleName', _this8.editHandleName);
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

},{"./audio":1,"./comm":2,"./effectobj":3,"./enemies":4,"./eventEmitter3":5,"./gameobj":7,"./global":8,"./graphics":9,"./io":10,"./myship":12,"./text":13,"./util":14}],7:[function(require,module,exports){
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

var _game = require('./game');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/// メイン
window.onload = function () {

  sfg.game = new _game.Game();
  sfg.game.exec();
};
//import * as song from './song';

},{"./audio":1,"./comm":2,"./effectobj":3,"./enemies":4,"./game":6,"./gameobj":7,"./global":8,"./graphics":9,"./io":10,"./myship":12,"./text":13,"./util":14}],12:[function(require,module,exports){
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

},{"./eventEmitter3":5,"./global":8}]},{},[11])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGpzXFxhdWRpby5qcyIsInNyY1xcanNcXGNvbW0uanMiLCJzcmNcXGpzXFxlZmZlY3RvYmouanMiLCJzcmNcXGpzXFxlbmVtaWVzLmpzIiwic3JjXFxqc1xcZXZlbnRFbWl0dGVyMy5qcyIsInNyY1xcanNcXGdhbWUuanMiLCJzcmNcXGpzXFxnYW1lb2JqLmpzIiwic3JjXFxqc1xcZ2xvYmFsLmpzIiwic3JjXFxqc1xcZ3JhcGhpY3MuanMiLCJzcmNcXGpzXFxpby5qcyIsInNyY1xcanNcXG1haW4uanMiLCJzcmNcXGpzXFxteXNoaXAuanMiLCJzcmNcXGpzXFx0ZXh0LmpzIiwic3JjXFxqc1xcdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7OztBQ01BLFlBQVk7O0FBQUM7Ozs7OztRQTBCRyxTQUFTLEdBQVQsU0FBUztRQTRCVCxVQUFVLEdBQVYsVUFBVTtRQVFWLHlCQUF5QixHQUF6Qix5QkFBeUI7UUFtQ3pCLFdBQVcsR0FBWCxXQUFXO1FBZ0NYLGlCQUFpQixHQUFqQixpQkFBaUI7UUFxQ2pCLEtBQUssR0FBTCxLQUFLO1FBK0RMLEtBQUssR0FBTCxLQUFLO1FBdUVMLElBQUksR0FBSixJQUFJO1FBd2JKLFNBQVMsR0FBVCxTQUFTO1FBd0tULFlBQVksR0FBWixZQUFZO0FBMTRCNUIsSUFBSSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQy9CLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQztBQUN2QixJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUM7O0FBRW5CLElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQztBQUNsQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUU7QUFDN0IsVUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENB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LEdBQUcsQ0FBQztBQUMvQixZQUFRLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztHQUU1QztDQUNGLENBQUE7O0FBRUQsSUFDRSxDQUFDLEdBQUksSUFBSSxJQUFJLENBQUUsQ0FBQyxFQUFDLElBQUksQ0FBQztJQUN0QixFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUUsQ0FBQyxFQUFDLElBQUksQ0FBQztJQUN0QixDQUFDLEdBQUksSUFBSSxJQUFJLENBQUUsQ0FBQyxFQUFDLElBQUksQ0FBQztJQUN0QixFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUUsQ0FBQyxFQUFDLElBQUksQ0FBQztJQUN0QixDQUFDLEdBQUksSUFBSSxJQUFJLENBQUUsQ0FBQyxFQUFDLElBQUksQ0FBQztJQUN0QixDQUFDLEdBQUksSUFBSSxJQUFJLENBQUUsQ0FBQyxFQUFDLElBQUksQ0FBQztJQUN0QixFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUUsQ0FBQyxFQUFDLElBQUksQ0FBQztJQUN0QixDQUFDLEdBQUksSUFBSSxJQUFJLENBQUUsQ0FBQyxFQUFDLElBQUksQ0FBQztJQUN0QixFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUUsQ0FBQyxFQUFDLElBQUksQ0FBQztJQUN0QixDQUFDLEdBQUksSUFBSSxJQUFJLENBQUUsQ0FBQyxFQUFDLElBQUksQ0FBQztJQUN0QixFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUMsRUFBRSxFQUFDLElBQUksQ0FBQztJQUN0QixDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQzs7OztBQUFDLEFBSXpCLFNBQVMsT0FBTyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQzNDO0FBQ0UsTUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDakIsTUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHOztBQUFDLEFBRWYsTUFBSSxDQUFDLElBQUksR0FB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Q0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFDWixDQUFDLEVBQ0QsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ3JELENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUMzQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQ047R0FDSixFQUNEO0FBQ0UsUUFBSSxFQUFFLE9BQU87QUFDYixXQUFPLEVBQUUsQ0FBQztBQUNWLFFBQUksRUFDRixDQUNBLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsRUFDMUIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUMvQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsRUFDZCxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxF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QUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsQUFDMUQsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEFBQzlELFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsQUFDbEUsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsQUFDdEUsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEFBQzFFLFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsS0FDL0U7O0FBRUQsU0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLEdBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNsRCxVQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUM1Qjs7QUFFRCxhQUFTLENBQUMsRUFBRSxDQUFDLEtB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LENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO1NBQ25DO0FBQ0QsWUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDO0FBQy9DLFlBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUM7QUFDdkYsWUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQztBQUNuQyxhQUFLLENBQUM7T0FDUDtBQUNELFVBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQzs7QUFFL0UsV0FBSyxJQUFJLEVBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsRUFBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUMsRUFBRTtBQUNuRSxZQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDeEUsWUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFR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WSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztBQUNqRCxRQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUNqQixRQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUNsQixNQUFJLEdBQUcsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2xDLEtBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMzQixNQUFJLElBQUksR0FBRyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3hDLE1BQUksUUFBUSxHQUFHLElBQUksS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ3BDO0FBQ0UsUUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDOztBQUVWLFNBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUU7QUFDMUIsV0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRTtBQUMxQixZQUFJLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQzs7QUFFOUIsWUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZCLFlBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN2QixZQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdkIsWUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZCLFlBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUNWLGVBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQztBQUM5QyxjQUFJLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQSxHQUFLLEdBQUcsRUFBRSxDQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBLEdBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDL0Usa0JBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzdCLGtCQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUM3QjtPQUNGO0tBQ0Y7R0FDRjtDQUNGOztBQUVNLFNBQVMsb0JBQW9CLENBQUMsSUFBSSxFQUN6QztBQUNFLE1BQUksUUFBUSxHQUFHLElBQUksS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ3BDLE1BQUksUUFBUSxHQUFHLElBQUksR0FBRyxDQUFDOztBQUFDLEFBRXhCLFVBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsRSxVQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pFLFVBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsRSxVQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuRSxVQUFRLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlDLFVBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDOUMsU0FBTyxRQUFRLENBQUM7Q0FDakI7OztBQUFBLEFBR00sU0FBUyxjQUFjLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFDL0U7QUFDRSxNQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztBQUNoQyxNQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQzs7QUFFbEMsTUFBSSxVQUFVLEdBQUcsQUFBQyxLQUFLLEdBQUcsU0FBUyxHQUFJLENBQUMsQ0FBQztBQUN6QyxNQUFJLFVBQVUsR0FBRyxBQUFDLE1BQU0sR0FBRyxVQUFVLEdBQUksQ0FBQyxDQUFDO0FBQzNDLE1BQUksSUFBSSxHQUFHLFVBQVUsSUFBSSxBQUFDLE1BQU0sR0FBRyxVQUFVLEdBQUksQ0FBQyxDQUFBLEFBQUMsQ0FBQztBQUNwRCxNQUFJLElBQUksR0FBRyxNQUFNLEdBQUcsVUFBVSxDQUFDO0FBQy9CLE1BQUksS0FBSyxHQUFHLFNBQVMsR0FBRyxLQUFLLENBQUM7QUFDOUIsTUFBSSxLQUFLLEdBQUcsVUFBVSxHQUFHLE1BQU0sQ0FBQzs7QUFFaEMsVUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FDN0IsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEFBQUMsSUFBSSxHQUFJLFNBQVMsR0FBRyxLQUFLLEVBQUUsQUFBQyxJQUFJLEdBQUksVUFBVSxHQUFHLE1BQU0sQ0FBQyxFQUMzRSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFBLEdBQUksU0FBUyxHQUFHLEtBQUssRUFBRSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUEsR0FBSSxVQUFVLEdBQUcsTUFBTSxDQUFDLEVBQ25GLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUEsR0FBSSxTQUFTLEdBQUcsS0FBSyxFQUFFLEFBQUMsSUFBSSxHQUFJLFVBQVUsR0FBRyxNQUFNLENBQUMsQ0FDaEYsQ0FBQyxDQUFDO0FBQ0gsVUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FDN0IsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEFBQUMsSUFBSSxHQUFJLFNBQVMsR0FBRyxLQUFLLEVBQUUsQUFBQyxJQUFJLEdBQUksVUFBVSxHQUFHLE1BQU0sQ0FBQyxFQUMzRSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQUFBQyxJQUFJLEdBQUksU0FBUyxHQUFHLEtBQUssRUFBRSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUEsR0FBSSxVQUFVLEdBQUcsTUFBTSxDQUFDLEVBQy9FLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUEsR0FBSSxTQUFTLEdBQUcsS0FBSyxFQUFFLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQSxHQUFJLFVBQVUsR0FBRyxNQUFNLENBQUMsQ0FDcEYsQ0FBQyxDQUFDO0NBQ0o7O0FBRU0sU0FBUyxjQUFjLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFDL0U7QUFDRSxNQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztBQUNoQyxNQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQzs7QUFFbEMsTUFBSSxVQUFVLEdBQUcsQUFBQyxLQUFLLEdBQUcsU0FBUyxHQUFJLENBQUMsQ0FBQztBQUN6QyxNQUFJLFVBQVUsR0FBRyxBQUFDLE1BQU0sR0FBRyxVQUFVLEdBQUksQ0FBQyxDQUFDO0FBQzNDLE1BQUksSUFBSSxHQUFHLFVBQVUsSUFBSSxBQUFDLE1BQU0sR0FBRyxVQUFVLEdBQUksQ0FBQyxDQUFBLEFBQUMsQ0FBQztBQUNwRCxNQUFJLElBQUksR0FBRyxNQUFNLEdBQUcsVUFBVSxDQUFDO0FBQy9CLE1BQUksS0FBSyxHQUFHLFNBQVMsR0FBRyxLQUFLLENBQUM7QUFDOUIsTUFBSSxLQUFLLEdBQUcsVUFBVSxHQUFHLE1BQU0sQ0FBQztBQUNoQyxNQUFJLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUV2QyxLQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEFBQUMsSUFBSSxHQUFJLEtBQUssQ0FBQztBQUMxQixLQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEFBQUMsSUFBSSxHQUFJLEtBQUssQ0FBQztBQUMxQixLQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQSxHQUFJLEtBQUssQ0FBQztBQUM5QixLQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQSxHQUFJLEtBQUssQ0FBQztBQUM5QixLQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQSxHQUFJLEtBQUssQ0FBQztBQUM5QixLQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEFBQUMsSUFBSSxHQUFJLEtBQUssQ0FBQzs7QUFFMUIsS0FBRyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRW5DLEtBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQUFBQyxJQUFJLEdBQUksS0FBSyxDQUFDO0FBQzFCLEtBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQUFBQyxJQUFJLEdBQUksS0FBSyxDQUFDO0FBQzFCLEtBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQUFBQyxJQUFJLEdBQUksS0FBSyxDQUFDO0FBQzFCLEtBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFBLEdBQUksS0FBSyxDQUFDO0FBQzlCLEtBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFBLEdBQUksS0FBSyxDQUFDO0FBQzlCLEtBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFBLEdBQUksS0FBSyxDQUFDOztBQUc5QixVQUFRLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztDQUUvQjs7QUFFTSxTQUFTLG9CQUFvQixDQUFDLE9BQU8sRUFDNUM7O0FBRUUsTUFBSSxRQUFRLEdBQUcsSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsRUFBRSxHQUFHLEVBQUUsT0FBTyxvQkFBQSxFQUFzQixXQUFXLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUNwRyxVQUFRLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7QUFDckMsVUFBUSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDO0FBQ2hDLFVBQVEsQ0FBQyxTQUFTLEdBQUcsR0FBRyxDQUFDO0FBQ3pCLFVBQVEsQ0FBQyxXQUFXLEdBQUcsSUFBSTs7QUFBQyxBQUU1QixTQUFPLFFBQVEsQ0FBQztDQUNqQjs7O0FDNUxELFlBQVksQ0FBQzs7Ozs7Ozs7Ozs7SUFDRCxHQUFHOzs7Ozs7OztJQUdGLFVBQVUsV0FBVixVQUFVO0FBQ3ZCLFdBRGEsVUFBVSxHQUNSOzs7MEJBREYsVUFBVTs7QUFFckIsUUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUMsS0FBSyxFQUFDLENBQUM7QUFDeEYsUUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7QUFDcEIsUUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDbkIsUUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJOztBQUFDLEFBRXJCLFVBQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBQyxVQUFDLENBQUMsRUFBRztBQUM5QyxZQUFLLE9BQU8sR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDO0tBQzFCLENBQUMsQ0FBQzs7QUFFSCxVQUFNLENBQUMsZ0JBQWdCLENBQUMscUJBQXFCLEVBQUMsVUFBQyxDQUFDLEVBQUc7QUFDakQsYUFBTyxNQUFLLE9BQU8sQ0FBQztLQUNyQixDQUFDLENBQUM7O0FBRUosUUFBRyxNQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBQztBQUM5QixVQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDbEQ7R0FDRDs7ZUFsQlksVUFBVTs7NEJBcUJyQjtBQUNFLFdBQUksSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBQztBQUN6QixZQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztPQUMxQjtBQUNELFVBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztLQUMzQjs7OzRCQUVPLENBQUMsRUFBRTtBQUNULFVBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUM7QUFDakIsVUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztBQUMvQixVQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0FBQzdCLFVBQUksTUFBTSxHQUFHLElBQUksQ0FBQzs7QUFFbEIsVUFBSSxTQUFTLENBQUMsTUFBTSxHQUFHLEVBQUUsRUFBRTtBQUN6QixpQkFBUyxDQUFDLEtBQUssRUFBRSxDQUFDO09BQ25COztBQUVELFVBQUksQ0FBQyxDQUFDLE9BQU8sSUFBSSxFQUFFLFFBQUEsRUFBVTtBQUMzQixjQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRTtBQUNkLGVBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7V0FDbEIsTUFBTTtBQUNMLGVBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7V0FDbkI7U0FDRjs7QUFFRCxlQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMxQixjQUFRLENBQUMsQ0FBQyxPQUFPO0FBQ2YsYUFBSyxFQUFFLENBQUM7QUFDUixhQUFLLEVBQUUsQ0FBQztBQUNSLGFBQUssR0FBRztBQUNOLGtCQUFRLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUNyQixnQkFBTSxHQUFHLElBQUksQ0FBQztBQUNkLGdCQUFNO0FBQUEsQUFDUixhQUFLLEVBQUUsQ0FBQztBQUNSLGFBQUssRUFBRSxDQUFDO0FBQ1IsYUFBSyxHQUFHO0FBQ04sa0JBQVEsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBQ25CLGdCQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ2QsZ0JBQU07QUFBQSxBQUNSLGFBQUssRUFBRSxDQUFDO0FBQ1IsYUFBSyxFQUFFLENBQUM7QUFDUixhQUFLLEdBQUc7QUFDTixrQkFBUSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDdEIsZ0JBQU0sR0FBRyxJQUFJLENBQUM7QUFDZCxnQkFBTTtBQUFBLEFBQ1IsYUFBSyxFQUFFLENBQUM7QUFDUixhQUFLLEVBQUUsQ0FBQztBQUNSLGFBQUssRUFBRTtBQUNMLGtCQUFRLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUNyQixnQkFBTSxHQUFHLElBQUksQ0FBQztBQUNkLGdCQUFNO0FBQUEsQUFDUixhQUFLLEVBQUU7QUFDTCxrQkFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDbEIsZ0JBQU0sR0FBRyxJQUFJLENBQUM7QUFDZCxnQkFBTTtBQUFBLEFBQ1IsYUFBSyxFQUFFO0FBQ0wsa0JBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLGdCQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ2QsZ0JBQU07QUFBQSxPQUNUO0FBQ0QsVUFBSSxNQUFNLEVBQUU7QUFDVixTQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDbkIsU0FBQyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7QUFDdEIsZUFBTyxLQUFLLENBQUM7T0FDZDtLQUNGOzs7NEJBRU87QUFDTixVQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO0FBQ2pCLFVBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7QUFDL0IsVUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUM3QixVQUFJLE1BQU0sR0FBRyxLQUFLLENBQUM7QUFDbkIsY0FBUSxDQUFDLENBQUMsT0FBTztBQUNmLGFBQUssRUFBRSxDQUFDO0FBQ1IsYUFBSyxFQUFFLENBQUM7QUFDUixhQUFLLEdBQUc7QUFDTixrQkFBUSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7QUFDdEIsZ0JBQU0sR0FBRyxJQUFJLENBQUM7QUFDZCxnQkFBTTtBQUFBLEFBQ1IsYUFBSyxFQUFFLENBQUM7QUFDUixhQUFLLEVBQUUsQ0FBQztBQUNSLGFBQUssR0FBRztBQUNOLGtCQUFRLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQztBQUNwQixnQkFBTSxHQUFHLElBQUksQ0FBQztBQUNkLGdCQUFNO0FBQUEsQUFDUixhQUFLLEVBQUUsQ0FBQztBQUNSLGFBQUssRUFBRSxDQUFDO0FBQ1IsYUFBSyxHQUFHO0FBQ04sa0JBQVEsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQ3ZCLGdCQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ2QsZ0JBQU07QUFBQSxBQUNSLGFBQUssRUFBRSxDQUFDO0FBQ1IsYUFBSyxFQUFFLENBQUM7QUFDUixhQUFLLEVBQUU7QUFDTCxrQkFBUSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7QUFDdEIsZ0JBQU0sR0FBRyxJQUFJLENBQUM7QUFDZCxnQkFBTTtBQUFBLEFBQ1IsYUFBSyxFQUFFO0FBQ0wsa0JBQVEsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO0FBQ25CLGdCQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ2QsZ0JBQU07QUFBQSxBQUNSLGFBQUssRUFBRTtBQUNMLGtCQUFRLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztBQUNuQixnQkFBTSxHQUFHLElBQUksQ0FBQztBQUNkLGdCQUFNO0FBQUEsT0FDVDtBQUNELFVBQUksTUFBTSxFQUFFO0FBQ1YsU0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQ25CLFNBQUMsQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO0FBQ3RCLGVBQU8sS0FBSyxDQUFDO09BQ2Q7S0FDRjs7Ozs7MkJBR0Q7QUFDRSxRQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsRUFBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ25FLFFBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLGtCQUFrQixFQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7S0FDaEU7Ozs7OzZCQUdEO0FBQ0UsUUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsb0JBQW9CLEVBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEQsUUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsa0JBQWtCLEVBQUMsSUFBSSxDQUFDLENBQUM7S0FDL0M7Ozs0QkFxQ08sU0FBUyxFQUNqQjtBQUNFLGFBQU0sU0FBUyxJQUFJLENBQUMsRUFBQztBQUNuQixZQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFDO0FBQzlCLGNBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNsRDtBQUNELGlCQUFTLEdBQUcsS0FBSyxDQUFDO09BQ25CO0tBQ0Y7Ozt3QkEzQ1E7QUFDUCxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxJQUFLLElBQUksQ0FBQyxPQUFPLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFBLEFBQUMsQUFBQyxDQUFDO0tBQ2hIOzs7d0JBRVU7QUFDVCxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFLLElBQUksQ0FBQyxPQUFPLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQSxBQUFDLEFBQUMsQ0FBQztLQUNqSDs7O3dCQUVVO0FBQ1QsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSyxJQUFJLENBQUMsT0FBTyxLQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQSxBQUFDLEFBQUMsQ0FBQztLQUNsSDs7O3dCQUVXO0FBQ1YsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssSUFBSyxJQUFJLENBQUMsT0FBTyxLQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUEsQUFBQyxBQUFDLENBQUM7S0FDbEg7Ozt3QkFFTztBQUNMLFVBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUNyQixDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSyxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFNLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxBQUFFLENBQUU7QUFDL0csVUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztBQUMvRCxhQUFPLEdBQUcsQ0FBQztLQUNaOzs7d0JBRVc7QUFDVixVQUFJLEdBQUcsR0FBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSyxJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFNLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxBQUFDLENBQUU7QUFDbkksVUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztBQUNwRSxhQUFPLEdBQUcsQ0FBQztLQUNaOzs7d0JBRVk7QUFDVixVQUFJLEdBQUcsR0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSyxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFNLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxBQUFFLENBQUU7QUFDMUgsVUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztBQUNoRSxhQUFPLEdBQUcsQ0FBQztLQUNaOzs7U0FuTFUsVUFBVTs7OztBQ0p2QixZQUFZOztBQUFDOzs7SUFFRCxHQUFHOzs7O0lBQ0gsSUFBSTs7OztJQUNKLEtBQUs7Ozs7SUFFTCxRQUFROzs7O0lBQ1IsRUFBRTs7OztJQUNGLElBQUk7Ozs7SUFDSixJQUFJOzs7O0lBQ0osT0FBTzs7OztJQUNQLE1BQU07Ozs7SUFDTixPQUFPOzs7O0lBQ1AsU0FBUzs7Ozs7OztBQUlyQixNQUFNLENBQUMsTUFBTSxHQUFHLFlBQVk7O0FBRTFCLEtBQUcsQ0FBQyxJQUFJLEdBQUcsVUFMSixJQUFJLEVBS1UsQ0FBQztBQUN0QixLQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0NBRWpCOztBQUFDOztBQ3RCRixZQUFZLENBQUM7Ozs7Ozs7Ozs7O0lBRUQsR0FBRzs7OztJQUNILE9BQU87Ozs7SUFDUCxRQUFROzs7Ozs7Ozs7O0FBRXBCLElBQUksU0FBUyxHQUFHLEVBQUU7OztBQUFDO0lBR04sUUFBUSxXQUFSLFFBQVE7WUFBUixRQUFROztBQUNuQixXQURXLFFBQVEsQ0FDUCxLQUFLLEVBQUMsRUFBRSxFQUFFOzBCQURYLFFBQVE7O3VFQUFSLFFBQVEsYUFFYixDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7O0FBRWIsVUFBSyxhQUFhLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUM3QixVQUFLLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQzlCLFVBQUssS0FBSyxHQUFHLENBQUMsQ0FBQztBQUNmLFVBQUssS0FBSyxHQUFHLENBQUMsQ0FBQzs7QUFFZixVQUFLLFlBQVksR0FBRyxHQUFHLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQ3hELFVBQUssYUFBYSxHQUFHLEdBQUcsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNOzs7O0FBQUMsQUFJMUQsUUFBSSxRQUFRLEdBQUcsUUFBUSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDdEUsUUFBSSxRQUFRLEdBQUcsUUFBUSxDQUFDLG9CQUFvQixDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2pELFlBQVEsQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDdEUsVUFBSyxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQzs7QUFFL0MsVUFBSyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxNQUFLLEVBQUUsQ0FBQztBQUMvQixVQUFLLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLE1BQUssRUFBRSxDQUFDO0FBQy9CLFVBQUssSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsTUFBSyxFQUFFLENBQUM7QUFDL0IsVUFBSyxFQUFFLEdBQUcsRUFBRTs7O0FBQUMsQUFHYixTQUFLLENBQUMsR0FBRyxDQUFDLE1BQUssSUFBSSxDQUFDLENBQUM7QUFDckIsVUFBSyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQUssT0FBTyxHQUFHLEtBQUs7O0FBQUM7R0FFekM7O2VBNUJXLFFBQVE7OzBCQW9DYixTQUFTLEVBQUU7O0FBRWYsYUFBTyxTQUFTLElBQUksQ0FBQyxJQUNoQixJQUFJLENBQUMsT0FBTyxJQUNaLElBQUksQ0FBQyxDQUFDLElBQUssR0FBRyxDQUFDLEtBQUssR0FBRyxFQUFFLEFBQUMsSUFDMUIsSUFBSSxDQUFDLENBQUMsSUFBSyxHQUFHLENBQUMsUUFBUSxHQUFHLEVBQUUsQUFBQyxJQUM3QixJQUFJLENBQUMsQ0FBQyxJQUFLLEdBQUcsQ0FBQyxPQUFPLEdBQUcsRUFBRSxBQUFDLElBQzVCLElBQUksQ0FBQyxDQUFDLElBQUssR0FBRyxDQUFDLE1BQU0sR0FBRyxFQUFFLEFBQUMsRUFDaEM7O0FBRUUsWUFBSSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDO0FBQ2xCLFlBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQzs7QUFFbEIsaUJBQVMsR0FBRyxLQUFLLENBQUM7T0FDbkI7O0FBRUQsZUFBUyxHQUFHLEtBQUssQ0FBQztBQUNsQixTQUFHLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNoQyxVQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztLQUM1Qzs7OzBCQUVPLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBQyxLQUFLLEVBQUU7QUFDOUIsVUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ2hCLGVBQU8sS0FBSyxDQUFDO09BQ2Q7QUFDRCxVQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNYLFVBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ1gsVUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ2pCLFVBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUN2QixVQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUMzQyxVQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUMzQyxVQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztBQUN4QyxVQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzs7QUFBQyxBQUVYLFVBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNyRCxhQUFPLElBQUksQ0FBQztLQUNiOzs7d0JBMUNPO0FBQUUsYUFBTyxJQUFJLENBQUMsRUFBRSxDQUFDO0tBQUU7c0JBQ3JCLENBQUMsRUFBRTtBQUFFLFVBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUFFOzs7d0JBQ3hDO0FBQUUsYUFBTyxJQUFJLENBQUMsRUFBRSxDQUFDO0tBQUU7c0JBQ3JCLENBQUMsRUFBRTtBQUFFLFVBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUFFOzs7d0JBQ3hDO0FBQUUsYUFBTyxJQUFJLENBQUMsRUFBRSxDQUFDO0tBQUU7c0JBQ3JCLENBQUMsRUFBRTtBQUFFLFVBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUFFOzs7U0FuQ3JDLFFBQVE7RUFBUyxPQUFPLENBQUMsT0FBTzs7OztJQTRFaEMsTUFBTSxXQUFOLE1BQU07WUFBTixNQUFNOztBQUNqQixXQURXLE1BQU0sQ0FDTCxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBQyxLQUFLLEVBQUMsRUFBRSxFQUFFOzBCQURuQixNQUFNOzs7O3dFQUFOLE1BQU0sYUFFWCxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7O0FBRWIsV0FBSyxhQUFhLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUM3QixXQUFLLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQzlCLFdBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUNiLFdBQUssS0FBSyxHQUFHLEtBQUssQ0FBQztBQUNuQixXQUFLLFlBQVksR0FBRyxHQUFHLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQ3hELFdBQUssYUFBYSxHQUFHLEdBQUcsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7QUFDMUQsV0FBSyxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBQ2hCLFdBQUssTUFBTSxHQUFHLEVBQUU7OztBQUFDLEFBR2pCLFdBQUssR0FBRyxHQUFHLEFBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxPQUFLLE1BQU0sR0FBRyxDQUFDLEdBQUksQ0FBQyxDQUFDO0FBQzdDLFdBQUssTUFBTSxHQUFHLEFBQUMsR0FBRyxDQUFDLFFBQVEsR0FBRyxPQUFLLE1BQU0sR0FBRyxDQUFDLEdBQUksQ0FBQyxDQUFDO0FBQ25ELFdBQUssSUFBSSxHQUFHLEFBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxPQUFLLEtBQUssR0FBRyxDQUFDLEdBQUksQ0FBQyxDQUFDO0FBQzlDLFdBQUssS0FBSyxHQUFHLEFBQUMsR0FBRyxDQUFDLE9BQU8sR0FBRyxPQUFLLEtBQUssR0FBRyxDQUFDLEdBQUksQ0FBQzs7OztBQUFDLEFBSWhELFFBQUksUUFBUSxHQUFHLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQzs7QUFBQyxBQUV0RSxRQUFJLFFBQVEsR0FBRyxRQUFRLENBQUMsb0JBQW9CLENBQUMsT0FBSyxLQUFLLENBQUMsQ0FBQztBQUN6RCxZQUFRLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxPQUFLLEtBQUssRUFBRSxPQUFLLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQzs7QUFFdkYsV0FBSyxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQzs7QUFFL0MsV0FBSyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxPQUFLLEVBQUUsQ0FBQztBQUMvQixXQUFLLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLE9BQUssRUFBRSxDQUFDO0FBQy9CLFdBQUssSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsT0FBSyxFQUFFLENBQUM7QUFDL0IsV0FBSyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0FBQ2QsV0FBSyxTQUFTLEdBQUcsQUFBRSxZQUFLO0FBQ3RCLFVBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztBQUNiLFdBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUU7QUFDMUIsV0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLFFBQVEsQ0FBQyxPQUFLLEtBQUssRUFBQyxPQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7T0FDNUM7QUFDRCxhQUFPLEdBQUcsQ0FBQztLQUNaLEVBQUcsQ0FBQztBQUNMLFNBQUssQ0FBQyxHQUFHLENBQUMsT0FBSyxJQUFJLENBQUMsQ0FBQzs7QUFFckIsV0FBSyxXQUFXLEdBQUcsQ0FBQyxDQUFDOzs7R0FFdEI7O2VBM0NZLE1BQU07OzBCQW1EWCxTQUFTLEVBQUU7QUFDZixXQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRTtBQUN6RCxZQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRyxJQUFJLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUU7QUFDL0UsZ0JBQU07U0FDUDtPQUNGO0tBQ0Y7OzsyQkFFTSxVQUFVLEVBQUU7QUFDakIsVUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFO0FBQ25CLFlBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFO0FBQ3RCLGNBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ2I7T0FDRjs7QUFFRCxVQUFJLFVBQVUsQ0FBQyxLQUFLLEVBQUU7QUFDcEIsWUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUU7QUFDdkIsY0FBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDYjtPQUNGOztBQUVELFVBQUksVUFBVSxDQUFDLEVBQUUsRUFBRTtBQUNqQixZQUFJLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRTtBQUNyQixjQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNiO09BQ0Y7O0FBRUQsVUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFO0FBQ25CLFlBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFO0FBQ3hCLGNBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ2I7T0FDRjs7QUFHRCxVQUFJLFVBQVUsQ0FBQyxDQUFDLEVBQUU7QUFDaEIsa0JBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztBQUM5QixZQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7T0FDM0I7O0FBRUQsVUFBSSxVQUFVLENBQUMsQ0FBQyxFQUFFO0FBQ2hCLGtCQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7QUFDOUIsWUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO09BQzNCO0tBQ0Y7OzswQkFFSztBQUNKLFVBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztBQUMxQixTQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDckMsVUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNaOzs7NEJBRU07QUFDTCxVQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFDLENBQUMsRUFBRztBQUMxQixZQUFHLENBQUMsQ0FBQyxPQUFPLEVBQUM7QUFDWCxpQkFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQSxBQUFDLENBQUMsQ0FBQyxJQUFJLElBQUU7U0FDOUU7T0FDRixDQUFDLENBQUM7S0FDSjs7OzJCQUVLO0FBQ0YsVUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDWCxVQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDO0FBQ2QsVUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDYixVQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7S0FDNUI7Ozt3QkF2RU87QUFBRSxhQUFPLElBQUksQ0FBQyxFQUFFLENBQUM7S0FBRTtzQkFDckIsQ0FBQyxFQUFFO0FBQUUsVUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQUU7Ozt3QkFDeEM7QUFBRSxhQUFPLElBQUksQ0FBQyxFQUFFLENBQUM7S0FBRTtzQkFDckIsQ0FBQyxFQUFFO0FBQUUsVUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQUU7Ozt3QkFDeEM7QUFBRSxhQUFPLElBQUksQ0FBQyxFQUFFLENBQUM7S0FBRTtzQkFDckIsQ0FBQyxFQUFFO0FBQUUsVUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQUU7OztTQWpEckMsTUFBTTtFQUFTLE9BQU8sQ0FBQyxPQUFPOzs7QUNyRjNDLFlBQVksQ0FBQzs7Ozs7Ozs7Ozs7SUFDRCxHQUFHOzs7Ozs7Ozs7OztJQUtGLGFBQWEsV0FBYixhQUFhLEdBQ3hCLFNBRFcsYUFBYSxDQUNaLEtBQUssRUFBRSxJQUFJLEVBQUU7d0JBRGQsYUFBYTs7QUFFdEIsTUFBSSxLQUFLLEVBQUU7QUFDVCxRQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztHQUNwQixNQUFNO0FBQ0wsUUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7R0FDcEI7QUFDRCxNQUFJLElBQUksRUFBRTtBQUNSLFFBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0dBQ2xCLE1BQU07QUFDTCxRQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDO0dBQ25DO0NBQ0Y7Ozs7SUFJVSxTQUFTLFdBQVQsU0FBUztBQUNwQixXQURXLFNBQVMsQ0FDUCxLQUFLLEVBQUU7MEJBRFQsU0FBUzs7QUFFcEIsUUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDN0MsUUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDN0MsUUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDakQsUUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDakQsUUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUM7QUFDbEMsU0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRTtBQUM3QixVQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUMvQyxVQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUMvQyxVQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNuRCxVQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztLQUNwRDs7OztBQUFBLEFBS0QsUUFBSSxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQy9DLFFBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztBQUNkLFdBQU8sS0FBSyxJQUFJLEdBQUcsQ0FBQyxhQUFhLEVBQUM7QUFDaEMsV0FBSyxJQUFJLENBQUMsQ0FBQztLQUNaO0FBQ0QsUUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ2YsV0FBTyxNQUFNLElBQUksR0FBRyxDQUFDLGNBQWMsRUFBQztBQUNsQyxZQUFNLElBQUksQ0FBQyxDQUFDO0tBQ2I7O0FBRUQsUUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQzFCLFFBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUM1QixRQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3hDLFFBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM5QyxRQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDO0FBQzdDLFFBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQztBQUN4RCxRQUFJLENBQUMsUUFBUSxHQUFHLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUMsU0FBUyxFQUFDLEdBQUcsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFDLFNBQVMsRUFBQyxJQUFJLEVBQUMsT0FBTyxFQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUMsQ0FBQzs7QUFBQyxBQUU1SSxRQUFJLENBQUMsUUFBUSxHQUFHLElBQUksS0FBSyxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDdkQsUUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDekQsUUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUMzQixRQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLGFBQWEsQ0FBQSxHQUFJLENBQUMsQ0FBQztBQUN2RCxRQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUksRUFBRyxNQUFNLEdBQUcsR0FBRyxDQUFDLGNBQWMsQ0FBQSxBQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzVELFFBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDNUUsUUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7QUFDcEIsUUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLOzs7QUFBQyxBQUduQixRQUFJLENBQUMsR0FBRyxDQUFDLHVCQUF1QixHQUFHLEtBQUssQ0FBQztBQUN6QyxRQUFJLENBQUMsR0FBRyxDQUFDLHFCQUFxQixHQUFHLEtBQUs7O0FBQUMsQUFFdkMsUUFBSSxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsR0FBRyxLQUFLLENBQUM7O0FBRTFDLFFBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNYLFNBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3RCOzs7QUFBQTtlQXBEWSxTQUFTOzswQkF1RGQ7QUFDSixXQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRTtBQUM1RCxZQUFJLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlCLFlBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkMsWUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QyxZQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUU1QyxhQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRTtBQUMvRCxjQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ2YsbUJBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJOzs7QUFBQyxTQUdyQjtPQUNGO0FBQ0QsVUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztLQUNqRTs7Ozs7OzBCQUdLLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRTtBQUMxQixVQUFJLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlCLFVBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDOUIsVUFBSSxDQUFDLFNBQVMsRUFBRTtBQUNkLGlCQUFTLEdBQUcsQ0FBQyxDQUFDO09BQ2Y7QUFDRCxXQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRTtBQUNuQyxZQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFCLFlBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRTtBQUNaLFlBQUUsQ0FBQyxDQUFDO0FBQ0osY0FBSSxDQUFDLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUU7O0FBRS9CLGdCQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2RSxnQkFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZELGdCQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2RSxnQkFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZELGNBQUUsQ0FBQyxDQUFDO0FBQ0osZ0JBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO0FBQ3JDLGlCQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxFQUFFLEVBQUUsQ0FBQyxFQUFFO0FBQzdCLGtCQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUM3QixrQkFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7YUFDOUI7V0FDRjtBQUNELGNBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFCLGNBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFCLFdBQUMsR0FBRyxDQUFDLENBQUM7U0FDUCxNQUFNO0FBQ0wsY0FBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNaLGNBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUM7QUFDcEIsWUFBRSxDQUFDLENBQUM7U0FDTDtPQUNGO0tBQ0Y7Ozs7Ozs2QkFHUTtBQUNQLFVBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7QUFDbkIsVUFBSSxDQUFDLFVBQVUsR0FBRyxBQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxHQUFJLEdBQUcsQ0FBQzs7QUFFOUMsVUFBSSxVQUFVLEdBQUcsS0FBSyxDQUFDO0FBQ3ZCLFVBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO0FBQ3BCLFlBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ3pCLGtCQUFVLEdBQUcsSUFBSSxDQUFDO09BQ25CO0FBQ0QsVUFBSSxNQUFNLEdBQUcsS0FBSzs7OztBQUFDLEFBSW5CLFdBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtBQUM1RSxZQUFJLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlCLFlBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkMsWUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QyxZQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVDLGFBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtBQUMzRSxjQUFJLGFBQWEsR0FBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQUFBQyxDQUFDO0FBQ3pELGNBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksY0FBYyxDQUFDLENBQUMsQ0FBQyxJQUFLLGFBQWEsSUFBSSxVQUFVLEFBQUMsRUFBRTtBQUNqRyxrQkFBTSxHQUFHLElBQUksQ0FBQzs7QUFFZCxxQkFBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QiwwQkFBYyxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQyxnQkFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ1YsZ0JBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtBQUNoQyxlQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQzthQUNwQjtBQUNELGdCQUFJLElBQUksR0FBRyxBQUFDLENBQUMsSUFBSSxDQUFDLElBQUssQ0FBQyxDQUFDO0FBQ3pCLGdCQUFJLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUEsSUFBSyxDQUFDLENBQUM7QUFDMUIsZUFBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNsRSxnQkFBSSxJQUFJLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUM7QUFDcEUsZ0JBQUksQ0FBQyxFQUFFO0FBQ0wsaUJBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLFNBQVMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzthQUN6SDtXQUNGO1NBQ0Y7T0FDRjtBQUNELFVBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQztLQUNuQzs7O1NBcEpVLFNBQVM7Ozs7O0FDckJ0QixZQUFZLENBQUM7Ozs7Ozs7Ozs7O0lBQ0QsR0FBRzs7Ozs7Ozs7Ozs7Ozs7OztJQUdGLElBQUksV0FBSixJQUFJLEdBQ2YsU0FEVyxJQUFJLENBQ0gsT0FBTyxFQUFDLFFBQVEsRUFBRTt3QkFEbkIsSUFBSTs7QUFFYixNQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsSUFBSSxLQUFLLENBQUM7QUFDbEMsTUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPOztBQUFDLEFBRXZCLE1BQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0NBQ2hCOztBQUlJLElBQUksUUFBUSxXQUFSLFFBQVEsR0FBRyxJQUFJLElBQUksQ0FBQyxBQUFDLGFBQVcsRUFBRSxFQUFHLENBQUM7OztBQUFDO0lBR3JDLEtBQUssV0FBTCxLQUFLO1lBQUwsS0FBSzs7QUFDaEIsV0FEVyxLQUFLLEdBQ0g7MEJBREYsS0FBSzs7dUVBQUwsS0FBSzs7QUFHZCxVQUFLLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxQixVQUFLLFFBQVEsR0FBRyxLQUFLLENBQUM7QUFDdEIsVUFBSyxZQUFZLEdBQUcsS0FBSyxDQUFDO0FBQzFCLFVBQUssTUFBTSxHQUFHLElBQUksQ0FBQztBQUNuQixVQUFLLE9BQU8sR0FBRyxLQUFLLENBQUM7O0dBQ3RCOztBQUFBO2VBUlUsS0FBSzs7Z0NBVUosS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQ3BDO0FBQ0UsVUFBRyxLQUFLLEdBQUcsQ0FBQyxFQUFDO0FBQ1gsYUFBSyxHQUFHLEVBQUUsRUFBRSxLQUFLLEFBQUMsQ0FBQztPQUNwQjtBQUNELFVBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxRQUFRLElBQUksTUFBTSxFQUFDO0FBQ3RDLGlCQUFTO09BQ1Y7QUFDRCxVQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDM0MsT0FBQyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDaEIsVUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdEIsVUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7S0FDdEI7Ozs2QkFFUSxPQUFPLEVBQUUsUUFBUSxFQUFFO0FBQzFCLFVBQUksQ0FBQyxZQUFBLENBQUM7QUFDTixXQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUU7QUFDMUMsWUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLFFBQVEsRUFBRTtBQUM3QixXQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ25DLGNBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2xCLFdBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ1osaUJBQU8sQ0FBQyxDQUFDO1NBQ1Y7T0FDRjtBQUNELE9BQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBQyxRQUFRLENBQUMsQ0FBQztBQUNsRCxPQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0FBQzVCLFVBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbEMsVUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7QUFDckIsYUFBTyxDQUFDLENBQUM7S0FDVjs7Ozs7OytCQUdVO0FBQ1QsYUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0tBQ25COzs7Ozs0QkFFTztBQUNOLFVBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztLQUN2Qjs7Ozs7Z0NBRVc7QUFDVixVQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDakIsWUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQzlCLGNBQUcsQ0FBQyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ3JDLGNBQUksQ0FBQyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDdkMsaUJBQU8sQ0FBQyxDQUFDO1NBQ1YsQ0FBQzs7QUFBQyxBQUVILGFBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFO0FBQ2pELGNBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztTQUN6QjtBQUNGLFlBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO09BQ3RCO0tBQ0Y7OzsrQkFFVSxLQUFLLEVBQUU7QUFDaEIsVUFBRyxLQUFLLEdBQUcsQ0FBQyxFQUFDO0FBQ1gsYUFBSyxHQUFHLEVBQUUsRUFBRSxLQUFLLEFBQUMsQ0FBQztPQUNwQjtBQUNELFVBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxRQUFRLElBQUksTUFBTSxFQUFDO0FBQ3RDLGlCQUFTO09BQ1Y7QUFDRCxVQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLFFBQVEsQ0FBQztBQUM3QixVQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztLQUMxQjs7OytCQUVVO0FBQ1QsVUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUU7QUFDdEIsZUFBTztPQUNSO0FBQ0QsVUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ2QsVUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUNyQixVQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7QUFDbEIsVUFBSSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsVUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFHO0FBQ3ZCLFlBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxRQUFRLENBQUM7QUFDeEIsWUFBRyxHQUFHLEVBQUM7QUFDTCxXQUFDLENBQUMsS0FBSyxHQUFHLFNBQVMsRUFBRSxDQUFDO1NBQ3ZCO0FBQ0QsZUFBTyxHQUFHLENBQUM7T0FDWixDQUFDLENBQUM7QUFDSCxVQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztBQUNsQixVQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztLQUMzQjs7OzRCQUVPLElBQUksRUFDWjtBQUNFLFVBQUcsSUFBSSxDQUFDLE1BQU0sRUFBQztBQUNiLDZCQUFxQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksRUFBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3BELFlBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0FBQ3JCLFlBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFO0FBQ2QsY0FBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDbEIsZ0JBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUNqQixnQkFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUUsVUFBQyxJQUFJLEVBQUMsQ0FBQyxFQUFJO0FBQzdCLGtCQUFJLElBQUksSUFBSSxRQUFRLEVBQUU7QUFDcEIsb0JBQUcsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLEVBQUU7QUFDbEIsMkJBQVM7aUJBQ1Y7QUFDRCxvQkFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2VBQy9CO2FBQ0YsQ0FBQyxDQUFDO0FBQ0gsZ0JBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztXQUNqQjtTQUNGO09BQ0YsTUFBTTtBQUNMLFlBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDckIsWUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7T0FDckI7S0FDRjs7O2tDQUVZOzs7QUFDWCxhQUFPLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFDLE1BQU0sRUFBRztBQUNuQyxlQUFLLE1BQU0sR0FBRyxLQUFLLENBQUM7QUFDcEIsZUFBSyxFQUFFLENBQUMsU0FBUyxFQUFDLFlBQUk7QUFDcEIsaUJBQU8sRUFBRSxDQUFDO1NBQ1gsQ0FBQyxDQUFDO09BQ0osQ0FBQyxDQUFDO0tBQ0o7OztTQTlIVSxLQUFLOzs7OztJQWtJTCxTQUFTLFdBQVQsU0FBUztBQUNwQixXQURXLFNBQVMsQ0FDUixjQUFjLEVBQUU7MEJBRGpCLFNBQVM7O0FBRWxCLFFBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO0FBQ3JCLFFBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO0FBQ3JCLFFBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO0FBQ25CLFFBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztBQUN4QixRQUFJLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztBQUNyQyxRQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztBQUNkLFFBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ2YsUUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7R0FFaEI7O2VBWFUsU0FBUzs7NEJBYVo7QUFDTixVQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztBQUNyQixVQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztBQUNuQixVQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUN6QyxVQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7S0FDMUI7Ozs2QkFFUTtBQUNQLFVBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUNwQyxVQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7QUFDL0QsVUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0tBQzFCOzs7NEJBRU87QUFDTixVQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUN2QyxVQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7S0FDMUI7OzsyQkFFTTtBQUNMLFVBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztLQUN6Qjs7OzZCQUVRO0FBQ1AsVUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUUsT0FBTztBQUN0QyxVQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDcEMsVUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztBQUM1QyxVQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztBQUNyRCxVQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQztLQUM1Qjs7O1NBekNVLFNBQVMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cImdyYXBoaWNzLmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cImlvLmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInNvbmcuanNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwidGV4dC5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJ1dGlsLmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cImRzcC5qc1wiIC8+XHJcblwidXNlIHN0cmljdFwiO1xyXG4vLy8vIFdlYiBBdWRpbyBBUEkg44Op44OD44OR44O844Kv44Op44K5IC8vLy9cclxudmFyIGZmdCA9IG5ldyBGRlQoNDA5NiwgNDQxMDApO1xyXG52YXIgQlVGRkVSX1NJWkUgPSAxMDI0O1xyXG52YXIgVElNRV9CQVNFID0gOTY7XHJcblxyXG52YXIgbm90ZUZyZXEgPSBbXTtcclxuZm9yICh2YXIgaSA9IC04MTsgaSA8IDQ2OyArK2kpIHtcclxuICBub3RlRnJlcS5wdXNoKE1hdGgucG93KDIsIGkgLyAxMikpO1xyXG59XHJcblxyXG52YXIgU3F1YXJlV2F2ZSA9IHtcclxuICBiaXRzOiA0LFxyXG4gIHdhdmVkYXRhOiBbMHhmLCAweGYsIDB4ZiwgMHhmLCAweGYsIDB4ZiwgMHhmLCAweGYsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdXHJcbn07Ly8gNGJpdCB3YXZlIGZvcm1cclxuXHJcbnZhciBTYXdXYXZlID0ge1xyXG4gIGJpdHM6IDQsXHJcbiAgd2F2ZWRhdGE6IFsweDAsIDB4MSwgMHgyLCAweDMsIDB4NCwgMHg1LCAweDYsIDB4NywgMHg4LCAweDksIDB4YSwgMHhiLCAweGMsIDB4ZCwgMHhlLCAweGZdXHJcbn07Ly8gNGJpdCB3YXZlIGZvcm1cclxuXHJcbnZhciBUcmlXYXZlID0ge1xyXG4gIGJpdHM6IDQsXHJcbiAgd2F2ZWRhdGE6IFsweDAsIDB4MiwgMHg0LCAweDYsIDB4OCwgMHhBLCAweEMsIDB4RSwgMHhGLCAweEUsIDB4QywgMHhBLCAweDgsIDB4NiwgMHg0LCAweDJdXHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZGVjb2RlU3RyKGJpdHMsIHdhdmVzdHIpIHtcclxuICB2YXIgYXJyID0gW107XHJcbiAgdmFyIG4gPSBiaXRzIC8gNCB8IDA7XHJcbiAgdmFyIGMgPSAwO1xyXG4gIHZhciB6ZXJvcG9zID0gMSA8PCAoYml0cyAtIDEpO1xyXG4gIHdoaWxlIChjIDwgd2F2ZXN0ci5sZW5ndGgpIHtcclxuICAgIHZhciBkID0gMDtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgKytpKSB7XHJcbiAgICAgIGV2YWwoXCJkID0gKGQgPDwgNCkgKyAweFwiICsgd2F2ZXN0ci5jaGFyQXQoYysrKSArIFwiO1wiKTtcclxuICAgIH1cclxuICAgIGFyci5wdXNoKChkIC0gemVyb3BvcykgLyB6ZXJvcG9zKTtcclxuICB9XHJcbiAgcmV0dXJuIGFycjtcclxufVxyXG5cclxudmFyIHdhdmVzID0gW1xyXG4gICAgZGVjb2RlU3RyKDQsICdFRUVFRUVFRUVFRUVFRUVFMDAwMDAwMDAwMDAwMDAwMCcpLFxyXG4gICAgZGVjb2RlU3RyKDQsICcwMDExMjIzMzQ0NTU2Njc3ODg5OUFBQkJDQ0RERUVGRicpLFxyXG4gICAgZGVjb2RlU3RyKDQsICcwMjM0NjY0NTlBQThBN0E5Nzc5NjU2NTZBQ0FBQ0RFRicpLFxyXG4gICAgZGVjb2RlU3RyKDQsICdCRENEQ0E5OTlBQ0RDREI5NDIxMjM2Nzc3NjMyMTI0NycpLFxyXG4gICAgZGVjb2RlU3RyKDQsICc3QUNERURDQTc0MjEwMTI0N0JERURCNzMyMDEzN0U3OCcpLFxyXG4gICAgZGVjb2RlU3RyKDQsICdBQ0NBNzc5QkRFREE2NjY3OTk5NDEwMTI2Nzc0MjI0NycpLFxyXG4gICAgZGVjb2RlU3RyKDQsICc3RUM5Q0VBN0NGRDhBQjcyOEQ5NDU3MjAzODUxMzUzMScpLFxyXG4gICAgZGVjb2RlU3RyKDQsICdFRTc3RUU3N0VFNzdFRTc3MDA3NzAwNzcwMDc3MDA3NycpLFxyXG4gICAgZGVjb2RlU3RyKDQsICdFRUVFODg4ODg4ODg4ODg4MDAwMDg4ODg4ODg4ODg4OCcpLy/jg47jgqTjgrrnlKjjga7jg4Djg5/jg7zms6LlvaJcclxuXTtcclxuXHJcbnZhciB3YXZlU2FtcGxlcyA9IFtdO1xyXG5leHBvcnQgZnVuY3Rpb24gV2F2ZVNhbXBsZShhdWRpb2N0eCwgY2gsIHNhbXBsZUxlbmd0aCwgc2FtcGxlUmF0ZSkge1xyXG5cclxuICB0aGlzLnNhbXBsZSA9IGF1ZGlvY3R4LmNyZWF0ZUJ1ZmZlcihjaCwgc2FtcGxlTGVuZ3RoLCBzYW1wbGVSYXRlIHx8IGF1ZGlvY3R4LnNhbXBsZVJhdGUpO1xyXG4gIHRoaXMubG9vcCA9IGZhbHNlO1xyXG4gIHRoaXMuc3RhcnQgPSAwO1xyXG4gIHRoaXMuZW5kID0gKHNhbXBsZUxlbmd0aCAtIDEpIC8gKHNhbXBsZVJhdGUgfHwgYXVkaW9jdHguc2FtcGxlUmF0ZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVXYXZlU2FtcGxlRnJvbVdhdmVzKGF1ZGlvY3R4LCBzYW1wbGVMZW5ndGgpIHtcclxuICBmb3IgKHZhciBpID0gMCwgZW5kID0gd2F2ZXMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgIHZhciBzYW1wbGUgPSBuZXcgV2F2ZVNhbXBsZShhdWRpb2N0eCwgMSwgc2FtcGxlTGVuZ3RoKTtcclxuICAgIHdhdmVTYW1wbGVzLnB1c2goc2FtcGxlKTtcclxuICAgIGlmIChpICE9IDgpIHtcclxuICAgICAgdmFyIHdhdmVkYXRhID0gd2F2ZXNbaV07XHJcbiAgICAgIHZhciBkZWx0YSA9IDQ0MC4wICogd2F2ZWRhdGEubGVuZ3RoIC8gYXVkaW9jdHguc2FtcGxlUmF0ZTtcclxuICAgICAgdmFyIHN0aW1lID0gMDtcclxuICAgICAgdmFyIG91dHB1dCA9IHNhbXBsZS5zYW1wbGUuZ2V0Q2hhbm5lbERhdGEoMCk7XHJcbiAgICAgIHZhciBsZW4gPSB3YXZlZGF0YS5sZW5ndGg7XHJcbiAgICAgIHZhciBpbmRleCA9IDA7XHJcbiAgICAgIHZhciBlbmRzYW1wbGUgPSAwO1xyXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHNhbXBsZUxlbmd0aDsgKytqKSB7XHJcbiAgICAgICAgaW5kZXggPSBzdGltZSB8IDA7XHJcbiAgICAgICAgb3V0cHV0W2pdID0gd2F2ZWRhdGFbaW5kZXhdO1xyXG4gICAgICAgIHN0aW1lICs9IGRlbHRhO1xyXG4gICAgICAgIGlmIChzdGltZSA+PSBsZW4pIHtcclxuICAgICAgICAgIHN0aW1lID0gc3RpbWUgLSBsZW47XHJcbiAgICAgICAgICBlbmRzYW1wbGUgPSBqO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBzYW1wbGUuZW5kID0gZW5kc2FtcGxlIC8gYXVkaW9jdHguc2FtcGxlUmF0ZTtcclxuICAgICAgc2FtcGxlLmxvb3AgPSB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8g44Oc44Kk44K5OOOBr+ODjuOCpOOCuuazouW9ouOBqOOBmeOCi1xyXG4gICAgICB2YXIgb3V0cHV0ID0gc2FtcGxlLnNhbXBsZS5nZXRDaGFubmVsRGF0YSgwKTtcclxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBzYW1wbGVMZW5ndGg7ICsraikge1xyXG4gICAgICAgIG91dHB1dFtqXSA9IE1hdGgucmFuZG9tKCkgKiAyLjAgLSAxLjA7XHJcbiAgICAgIH1cclxuICAgICAgc2FtcGxlLmVuZCA9IHNhbXBsZUxlbmd0aCAvIGF1ZGlvY3R4LnNhbXBsZVJhdGU7XHJcbiAgICAgIHNhbXBsZS5sb29wID0gdHJ1ZTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBXYXZlVGV4dHVyZSh3YXZlKSB7XHJcbiAgdGhpcy53YXZlID0gd2F2ZSB8fCB3YXZlc1swXTtcclxuICB0aGlzLnRleCA9IG5ldyBDYW52YXNUZXh0dXJlKDMyMCwgMTAgKiAxNik7XHJcbiAgdGhpcy5yZW5kZXIoKTtcclxufVxyXG5cclxuV2F2ZVRleHR1cmUucHJvdG90eXBlID0ge1xyXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGN0eCA9IHRoaXMudGV4LmN0eDtcclxuICAgIHZhciB3YXZlID0gdGhpcy53YXZlO1xyXG4gICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjdHguY2FudmFzLndpZHRoLCBjdHguY2FudmFzLmhlaWdodCk7XHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnd2hpdGUnO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzMjA7IGkgKz0gMTApIHtcclxuICAgICAgY3R4Lm1vdmVUbyhpLCAwKTtcclxuICAgICAgY3R4LmxpbmVUbyhpLCAyNTUpO1xyXG4gICAgfVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxNjA7IGkgKz0gMTApIHtcclxuICAgICAgY3R4Lm1vdmVUbygwLCBpKTtcclxuICAgICAgY3R4LmxpbmVUbygzMjAsIGkpO1xyXG4gICAgfVxyXG4gICAgY3R4LmZpbGxTdHlsZSA9ICdyZ2JhKDI1NSwyNTUsMjU1LDAuNyknO1xyXG4gICAgY3R4LnJlY3QoMCwgMCwgY3R4LmNhbnZhcy53aWR0aCwgY3R4LmNhbnZhcy5oZWlnaHQpO1xyXG4gICAgY3R4LnN0cm9rZSgpO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGMgPSAwOyBpIDwgY3R4LmNhbnZhcy53aWR0aDsgaSArPSAxMCwgKytjKSB7XHJcbiAgICAgIGN0eC5maWxsUmVjdChpLCAod2F2ZVtjXSA+IDApID8gODAgLSB3YXZlW2NdICogODAgOiA4MCwgMTAsIE1hdGguYWJzKHdhdmVbY10pICogODApO1xyXG4gICAgfVxyXG4gICAgdGhpcy50ZXgudGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgfVxyXG59O1xyXG5cclxuLy8vIOOCqOODs+ODmeODreODvOODl+OCuOOCp+ODjeODrOODvOOCv+ODvFxyXG5leHBvcnQgZnVuY3Rpb24gRW52ZWxvcGVHZW5lcmF0b3Iodm9pY2UsIGF0dGFjaywgZGVjYXksIHN1c3RhaW4sIHJlbGVhc2UpIHtcclxuICB0aGlzLnZvaWNlID0gdm9pY2U7XHJcbiAgLy90aGlzLmtleW9uID0gZmFsc2U7XHJcbiAgdGhpcy5hdHRhY2sgPSBhdHRhY2sgfHwgMC4wMDA1O1xyXG4gIHRoaXMuZGVjYXkgPSBkZWNheSB8fCAwLjA1O1xyXG4gIHRoaXMuc3VzdGFpbiA9IHN1c3RhaW4gfHwgMC41O1xyXG4gIHRoaXMucmVsZWFzZSA9IHJlbGVhc2UgfHwgMC41O1xyXG4gIHRoaXMudiA9IDEuMDtcclxuXHJcbn07XHJcblxyXG5FbnZlbG9wZUdlbmVyYXRvci5wcm90b3R5cGUgPVxyXG57XHJcbiAga2V5b246IGZ1bmN0aW9uICh0LHZlbCkge1xyXG4gICAgdGhpcy52ID0gdmVsIHx8IDEuMDtcclxuICAgIHZhciB2ID0gdGhpcy52O1xyXG4gICAgdmFyIHQwID0gdCB8fCB0aGlzLnZvaWNlLmF1ZGlvY3R4LmN1cnJlbnRUaW1lO1xyXG4gICAgdmFyIHQxID0gdDAgKyB0aGlzLmF0dGFjayAqIHY7XHJcbiAgICB2YXIgZ2FpbiA9IHRoaXMudm9pY2UuZ2Fpbi5nYWluO1xyXG4gICAgZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXModDApO1xyXG4gICAgZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLCB0MCk7XHJcbiAgICBnYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHYsIHQxKTtcclxuICAgIGdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUodGhpcy5zdXN0YWluICogdiwgdDAgKyB0aGlzLmRlY2F5IC8gdik7XHJcbiAgICAvL2dhaW4uc2V0VGFyZ2V0QXRUaW1lKHRoaXMuc3VzdGFpbiAqIHYsIHQxLCB0MSArIHRoaXMuZGVjYXkgLyB2KTtcclxuICB9LFxyXG4gIGtleW9mZjogZnVuY3Rpb24gKHQpIHtcclxuICAgIHZhciB2b2ljZSA9IHRoaXMudm9pY2U7XHJcbiAgICB2YXIgZ2FpbiA9IHZvaWNlLmdhaW4uZ2FpbjtcclxuICAgIHZhciB0MCA9IHQgfHwgdm9pY2UuYXVkaW9jdHguY3VycmVudFRpbWU7XHJcbiAgICBnYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyh0MCk7XHJcbiAgICAvL2dhaW4uc2V0VmFsdWVBdFRpbWUoMCwgdDAgKyB0aGlzLnJlbGVhc2UgLyB0aGlzLnYpO1xyXG4gICAgLy9nYWluLnNldFRhcmdldEF0VGltZSgwLCB0MCwgdDAgKyB0aGlzLnJlbGVhc2UgLyB0aGlzLnYpO1xyXG4gICAgZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCB0MCArIHRoaXMucmVsZWFzZSAvIHRoaXMudik7XHJcbiAgfVxyXG59O1xyXG5cclxuLy8vIOODnOOCpOOCuVxyXG5leHBvcnQgZnVuY3Rpb24gVm9pY2UoYXVkaW9jdHgpIHtcclxuICB0aGlzLmF1ZGlvY3R4ID0gYXVkaW9jdHg7XHJcbiAgdGhpcy5zYW1wbGUgPSB3YXZlU2FtcGxlc1s2XTtcclxuICB0aGlzLmdhaW4gPSBhdWRpb2N0eC5jcmVhdGVHYWluKCk7XHJcbiAgdGhpcy5nYWluLmdhaW4udmFsdWUgPSAwLjA7XHJcbiAgdGhpcy52b2x1bWUgPSBhdWRpb2N0eC5jcmVhdGVHYWluKCk7XHJcbiAgdGhpcy5lbnZlbG9wZSA9IG5ldyBFbnZlbG9wZUdlbmVyYXRvcih0aGlzKTtcclxuICB0aGlzLmluaXRQcm9jZXNzb3IoKTtcclxuICB0aGlzLmRldHVuZSA9IDEuMDtcclxuICB0aGlzLnZvbHVtZS5nYWluLnZhbHVlID0gMS4wO1xyXG4gIHRoaXMuZ2Fpbi5jb25uZWN0KHRoaXMudm9sdW1lKTtcclxuICB0aGlzLm91dHB1dCA9IHRoaXMudm9sdW1lO1xyXG59O1xyXG5cclxuVm9pY2UucHJvdG90eXBlID0ge1xyXG4gIGluaXRQcm9jZXNzb3I6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMucHJvY2Vzc29yID0gdGhpcy5hdWRpb2N0eC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcclxuICAgIHRoaXMucHJvY2Vzc29yLmJ1ZmZlciA9IHRoaXMuc2FtcGxlLnNhbXBsZTtcclxuICAgIHRoaXMucHJvY2Vzc29yLmxvb3AgPSB0aGlzLnNhbXBsZS5sb29wO1xyXG4gICAgdGhpcy5wcm9jZXNzb3IubG9vcFN0YXJ0ID0gMDtcclxuICAgIHRoaXMucHJvY2Vzc29yLnBsYXliYWNrUmF0ZS52YWx1ZSA9IDEuMDtcclxuICAgIHRoaXMucHJvY2Vzc29yLmxvb3BFbmQgPSB0aGlzLnNhbXBsZS5lbmQ7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5jb25uZWN0KHRoaXMuZ2Fpbik7XHJcbiAgfSxcclxuXHJcbiAgc2V0U2FtcGxlOiBmdW5jdGlvbiAoc2FtcGxlKSB7XHJcbiAgICAgIHRoaXMuZW52ZWxvcGUua2V5b2ZmKDApO1xyXG4gICAgICB0aGlzLnByb2Nlc3Nvci5kaXNjb25uZWN0KHRoaXMuZ2Fpbik7XHJcbiAgICAgIHRoaXMuc2FtcGxlID0gc2FtcGxlO1xyXG4gICAgICB0aGlzLmluaXRQcm9jZXNzb3IoKTtcclxuICAgICAgdGhpcy5wcm9jZXNzb3Iuc3RhcnQoKTtcclxuICB9LFxyXG4gIHN0YXJ0OiBmdW5jdGlvbiAoc3RhcnRUaW1lKSB7XHJcbiAvLyAgIGlmICh0aGlzLnByb2Nlc3Nvci5wbGF5YmFja1N0YXRlID09IDMpIHtcclxuICAgICAgdGhpcy5wcm9jZXNzb3IuZGlzY29ubmVjdCh0aGlzLmdhaW4pO1xyXG4gICAgICB0aGlzLmluaXRQcm9jZXNzb3IoKTtcclxuLy8gICAgfSBlbHNlIHtcclxuLy8gICAgICB0aGlzLmVudmVsb3BlLmtleW9mZigpO1xyXG4vL1xyXG4vLyAgICB9XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5zdGFydChzdGFydFRpbWUpO1xyXG4gIH0sXHJcbiAgc3RvcDogZnVuY3Rpb24gKHRpbWUpIHtcclxuICAgIHRoaXMucHJvY2Vzc29yLnN0b3AodGltZSk7XHJcbiAgICB0aGlzLnJlc2V0KCk7XHJcbiAgfSxcclxuICBrZXlvbjpmdW5jdGlvbih0LG5vdGUsdmVsKVxyXG4gIHtcclxuICAgIHRoaXMucHJvY2Vzc29yLnBsYXliYWNrUmF0ZS5zZXRWYWx1ZUF0VGltZShub3RlRnJlcVtub3RlXSAqIHRoaXMuZGV0dW5lLCB0KTtcclxuICAgIHRoaXMuZW52ZWxvcGUua2V5b24odCx2ZWwpO1xyXG4gIH0sXHJcbiAga2V5b2ZmOmZ1bmN0aW9uKHQpXHJcbiAge1xyXG4gICAgdGhpcy5lbnZlbG9wZS5rZXlvZmYodCk7XHJcbiAgfSxcclxuICByZXNldDpmdW5jdGlvbigpXHJcbiAge1xyXG4gICAgdGhpcy5wcm9jZXNzb3IucGxheWJhY2tSYXRlLmNhbmNlbFNjaGVkdWxlZFZhbHVlcygwKTtcclxuICAgIHRoaXMuZ2Fpbi5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcygwKTtcclxuICAgIHRoaXMuZ2Fpbi5nYWluLnZhbHVlID0gMDtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBBdWRpbygpIHtcclxuICB0aGlzLmVuYWJsZSA9IGZhbHNlO1xyXG4gIHRoaXMuYXVkaW9Db250ZXh0ID0gd2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0IHx8IHdpbmRvdy5tb3pBdWRpb0NvbnRleHQ7XHJcblxyXG4gIGlmICh0aGlzLmF1ZGlvQ29udGV4dCkge1xyXG4gICAgdGhpcy5hdWRpb2N0eCA9IG5ldyB0aGlzLmF1ZGlvQ29udGV4dCgpO1xyXG4gICAgdGhpcy5lbmFibGUgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgdGhpcy52b2ljZXMgPSBbXTtcclxuICBpZiAodGhpcy5lbmFibGUpIHtcclxuICAgIGNyZWF0ZVdhdmVTYW1wbGVGcm9tV2F2ZXModGhpcy5hdWRpb2N0eCwgQlVGRkVSX1NJWkUpO1xyXG4gICAgdGhpcy5maWx0ZXIgPSB0aGlzLmF1ZGlvY3R4LmNyZWF0ZUJpcXVhZEZpbHRlcigpO1xyXG4gICAgdGhpcy5maWx0ZXIudHlwZSA9ICdsb3dwYXNzJztcclxuICAgIHRoaXMuZmlsdGVyLmZyZXF1ZW5jeS52YWx1ZSA9IDIwMDAwO1xyXG4gICAgdGhpcy5maWx0ZXIuUS52YWx1ZSA9IDAuMDAwMTtcclxuICAgIHRoaXMubm9pc2VGaWx0ZXIgPSB0aGlzLmF1ZGlvY3R4LmNyZWF0ZUJpcXVhZEZpbHRlcigpO1xyXG4gICAgdGhpcy5ub2lzZUZpbHRlci50eXBlID0gJ2xvd3Bhc3MnO1xyXG4gICAgdGhpcy5ub2lzZUZpbHRlci5mcmVxdWVuY3kudmFsdWUgPSAxMDAwO1xyXG4gICAgdGhpcy5ub2lzZUZpbHRlci5RLnZhbHVlID0gMS44O1xyXG4gICAgdGhpcy5jb21wID0gdGhpcy5hdWRpb2N0eC5jcmVhdGVEeW5hbWljc0NvbXByZXNzb3IoKTtcclxuICAgIHRoaXMuZmlsdGVyLmNvbm5lY3QodGhpcy5jb21wKTtcclxuICAgIHRoaXMubm9pc2VGaWx0ZXIuY29ubmVjdCh0aGlzLmNvbXApO1xyXG4gICAgdGhpcy5jb21wLmNvbm5lY3QodGhpcy5hdWRpb2N0eC5kZXN0aW5hdGlvbik7XHJcbiAgICBmb3IgKHZhciBpID0gMCxlbmQgPSB0aGlzLlZPSUNFUzsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIHZhciB2ID0gbmV3IFZvaWNlKHRoaXMuYXVkaW9jdHgpO1xyXG4gICAgICB0aGlzLnZvaWNlcy5wdXNoKHYpO1xyXG4gICAgICBpZihpID09ICh0aGlzLlZPSUNFUyAtIDEpKXtcclxuICAgICAgICB2Lm91dHB1dC5jb25uZWN0KHRoaXMubm9pc2VGaWx0ZXIpO1xyXG4gICAgICB9IGVsc2V7XHJcbiAgICAgICAgdi5vdXRwdXQuY29ubmVjdCh0aGlzLmZpbHRlcik7XHJcbiAgICAgIH1cclxuICAgIH1cclxuLy8gIHRoaXMuc3RhcnRlZCA9IGZhbHNlO1xyXG5cclxuICAgIC8vdGhpcy52b2ljZXNbMF0ub3V0cHV0LmNvbm5lY3QoKTtcclxuICB9XHJcblxyXG59XHJcblxyXG5BdWRpby5wcm90b3R5cGUgPSB7XHJcbiAgc3RhcnQ6IGZ1bmN0aW9uICgpXHJcbiAge1xyXG4gIC8vICBpZiAodGhpcy5zdGFydGVkKSByZXR1cm47XHJcblxyXG4gICAgdmFyIHZvaWNlcyA9IHRoaXMudm9pY2VzO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHZvaWNlcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSlcclxuICAgIHtcclxuICAgICAgdm9pY2VzW2ldLnN0YXJ0KDApO1xyXG4gICAgfVxyXG4gICAgLy90aGlzLnN0YXJ0ZWQgPSB0cnVlO1xyXG4gIH0sXHJcbiAgc3RvcDogZnVuY3Rpb24gKClcclxuICB7XHJcbiAgICAvL2lmKHRoaXMuc3RhcnRlZClcclxuICAgIC8ve1xyXG4gICAgICB2YXIgdm9pY2VzID0gdGhpcy52b2ljZXM7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB2b2ljZXMubGVuZ3RoOyBpIDwgZW5kOyArK2kpXHJcbiAgICAgIHtcclxuICAgICAgICB2b2ljZXNbaV0uc3RvcCgwKTtcclxuICAgICAgfVxyXG4gICAgLy8gIHRoaXMuc3RhcnRlZCA9IGZhbHNlO1xyXG4gICAgLy99XHJcbiAgfSxcclxuICBWT0lDRVM6IDEyXHJcbn1cclxuXHJcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4vKiDjgrfjg7zjgrHjg7PjgrXjg7zjgrPjg57jg7Pjg4kgICAgICAgICAgICAgICAgICAgICAgICovXHJcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIE5vdGUobm8sIG5hbWUpIHtcclxuICB0aGlzLm5vID0gbm87XHJcbiAgdGhpcy5uYW1lID0gbmFtZTtcclxufVxyXG5cclxuTm90ZS5wcm90b3R5cGUgPSB7XHJcbiAgcHJvY2VzczogZnVuY3Rpb24odHJhY2spIFxyXG4gIHtcclxuICAgIHZhciBiYWNrID0gdHJhY2suYmFjaztcclxuICAgIHZhciBub3RlID0gdGhpcztcclxuICAgIHZhciBvY3QgPSB0aGlzLm9jdCB8fCBiYWNrLm9jdDtcclxuICAgIHZhciBzdGVwID0gdGhpcy5zdGVwIHx8IGJhY2suc3RlcDtcclxuICAgIHZhciBnYXRlID0gdGhpcy5nYXRlIHx8IGJhY2suZ2F0ZTtcclxuICAgIHZhciB2ZWwgPSB0aGlzLnZlbCB8fCBiYWNrLnZlbDtcclxuICAgIHNldFF1ZXVlKHRyYWNrLCBub3RlLCBvY3Qsc3RlcCwgZ2F0ZSwgdmVsKTtcclxuXHJcbiAgfVxyXG59XHJcblxyXG52YXIgXHJcbiAgQyAgPSBuZXcgTm90ZSggMCwnQyAnKSxcclxuICBEYiA9IG5ldyBOb3RlKCAxLCdEYicpLFxyXG4gIEQgID0gbmV3IE5vdGUoIDIsJ0QgJyksXHJcbiAgRWIgPSBuZXcgTm90ZSggMywnRWInKSxcclxuICBFICA9IG5ldyBOb3RlKCA0LCdFICcpLFxyXG4gIEYgID0gbmV3IE5vdGUoIDUsJ0YgJyksXHJcbiAgR2IgPSBuZXcgTm90ZSggNiwnR2InKSxcclxuICBHICA9IG5ldyBOb3RlKCA3LCdHICcpLFxyXG4gIEFiID0gbmV3IE5vdGUoIDgsJ0FiJyksXHJcbiAgQSAgPSBuZXcgTm90ZSggOSwnQSAnKSxcclxuICBCYiA9IG5ldyBOb3RlKDEwLCdCYicpLFxyXG4gIEIgPSBuZXcgTm90ZSgxMSwgJ0IgJyk7XHJcblxyXG4gLy8gUiA9IG5ldyBSZXN0KCk7XHJcblxyXG5mdW5jdGlvbiBTZXFEYXRhKG5vdGUsIG9jdCwgc3RlcCwgZ2F0ZSwgdmVsKVxyXG57XHJcbiAgdGhpcy5ub3RlID0gbm90ZTtcclxuICB0aGlzLm9jdCA9IG9jdDtcclxuICAvL3RoaXMubm8gPSBub3RlLm5vICsgb2N0ICogMTI7XHJcbiAgdGhpcy5zdGVwID0gc3RlcDtcclxuICB0aGlzLmdhdGUgPSBnYXRlO1xyXG4gIHRoaXMudmVsID0gdmVsO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZXRRdWV1ZSh0cmFjayxub3RlLG9jdCxzdGVwLGdhdGUsdmVsKVxyXG57XHJcbiAgdmFyIG5vID0gbm90ZS5ubyArIG9jdCAqIDEyO1xyXG4gIHZhciBzdGVwX3RpbWUgPSB0cmFjay5wbGF5aW5nVGltZTtcclxuICB2YXIgZ2F0ZV90aW1lID0gKChnYXRlID49IDApID8gZ2F0ZSAqIDYwIDogc3RlcCAqIGdhdGUgKiA2MCAqIC0xLjApIC8gKFRJTUVfQkFTRSAqIHRyYWNrLmxvY2FsVGVtcG8pICsgdHJhY2sucGxheWluZ1RpbWU7XHJcbiAgdmFyIHZvaWNlID0gdHJhY2suYXVkaW8udm9pY2VzW3RyYWNrLmNoYW5uZWxdO1xyXG4gIC8vY29uc29sZS5sb2codHJhY2suc2VxdWVuY2VyLnRlbXBvKTtcclxuICB2b2ljZS5rZXlvbihzdGVwX3RpbWUsIG5vLCB2ZWwpO1xyXG4gIHZvaWNlLmtleW9mZihnYXRlX3RpbWUpO1xyXG4gIHRyYWNrLnBsYXlpbmdUaW1lID0gKHN0ZXAgKiA2MCkgLyAoVElNRV9CQVNFICogdHJhY2subG9jYWxUZW1wbykgKyB0cmFjay5wbGF5aW5nVGltZTtcclxuICB2YXIgYmFjayA9IHRyYWNrLmJhY2s7XHJcbiAgYmFjay5ub3RlID0gbm90ZTtcclxuICBiYWNrLm9jdCA9IG9jdDtcclxuICBiYWNrLnN0ZXAgPSBzdGVwO1xyXG4gIGJhY2suZ2F0ZSA9IGdhdGU7XHJcbiAgYmFjay52ZWwgPSB2ZWw7XHJcbn1cclxuXHJcblNlcURhdGEucHJvdG90eXBlID0ge1xyXG4gIHByb2Nlc3M6IGZ1bmN0aW9uICh0cmFjaykge1xyXG5cclxuICAgIHZhciBiYWNrID0gdHJhY2suYmFjaztcclxuICAgIHZhciBub3RlID0gdGhpcy5ub3RlIHx8IGJhY2subm90ZTtcclxuICAgIHZhciBvY3QgPSB0aGlzLm9jdCB8fCBiYWNrLm9jdDtcclxuICAgIHZhciBzdGVwID0gdGhpcy5zdGVwIHx8IGJhY2suc3RlcDtcclxuICAgIHZhciBnYXRlID0gdGhpcy5nYXRlIHx8IGJhY2suZ2F0ZTtcclxuICAgIHZhciB2ZWwgPSB0aGlzLnZlbCB8fCBiYWNrLnZlbDtcclxuICAgIHNldFF1ZXVlKHRyYWNrLG5vdGUsb2N0LHN0ZXAsZ2F0ZSx2ZWwpO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gUyhub3RlLCBvY3QsIHN0ZXAsIGdhdGUsIHZlbCkge1xyXG4gIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcclxuICBpZiAoUy5sZW5ndGggIT0gYXJncy5sZW5ndGgpXHJcbiAge1xyXG4gICAgaWYodHlwZW9mKGFyZ3NbYXJncy5sZW5ndGggLSAxXSkgPT0gJ29iamVjdCcgJiYgICEoYXJnc1thcmdzLmxlbmd0aCAtIDFdIGluc3RhbmNlb2YgTm90ZSkpXHJcbiAgICB7XHJcbiAgICAgIHZhciBhcmdzMSA9IGFyZ3NbYXJncy5sZW5ndGggLSAxXTtcclxuICAgICAgdmFyIGwgPSBhcmdzLmxlbmd0aCAtIDE7XHJcbiAgICAgIHJldHVybiBuZXcgU2VxRGF0YShcclxuICAgICAgKChsICE9IDApP25vdGU6ZmFsc2UpIHx8IGFyZ3MxLm5vdGUgfHwgYXJnczEubiB8fCBudWxsLFxyXG4gICAgICAoKGwgIT0gMSkgPyBvY3QgOiBmYWxzZSkgfHwgYXJnczEub2N0IHx8IGFyZ3MxLm8gfHwgbnVsbCxcclxuICAgICAgKChsICE9IDIpID8gc3RlcCA6IGZhbHNlKSB8fCBhcmdzMS5zdGVwIHx8IGFyZ3MxLnMgfHwgbnVsbCxcclxuICAgICAgKChsICE9IDMpID8gZ2F0ZSA6IGZhbHNlKSB8fCBhcmdzMS5nYXRlIHx8IGFyZ3MxLmcgfHwgbnVsbCxcclxuICAgICAgKChsICE9IDQpID8gdmVsIDogZmFsc2UpIHx8IGFyZ3MxLnZlbCB8fCBhcmdzMS52IHx8IG51bGxcclxuICAgICAgKTtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIG5ldyBTZXFEYXRhKG5vdGUgfHwgbnVsbCwgb2N0IHx8IG51bGwsIHN0ZXAgfHwgbnVsbCwgZ2F0ZSB8fCBudWxsLCB2ZWwgfHwgbnVsbCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFMxKG5vdGUsIG9jdCwgc3RlcCwgZ2F0ZSwgdmVsKSB7XHJcbiAgcmV0dXJuIFMobm90ZSwgb2N0LCBsKHN0ZXApLCBnYXRlLCB2ZWwpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBTMihub3RlLCBsZW4sIGRvdCAsIG9jdCwgZ2F0ZSwgdmVsKSB7XHJcbiAgcmV0dXJuIFMobm90ZSwgb2N0LCBsKGxlbixkb3QpLCBnYXRlLCB2ZWwpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBTMyhub3RlLCBzdGVwLCBnYXRlLCB2ZWwsIG9jdCkge1xyXG4gIHJldHVybiBTKG5vdGUsIG9jdCwgc3RlcCwgZ2F0ZSwgdmVsKTtcclxufVxyXG5cclxuXHJcbi8vLyDpn7PnrKbjga7plbfjgZXmjIflrppcclxuXHJcbmZ1bmN0aW9uIGwobGVuLGRvdClcclxue1xyXG4gIHZhciBkID0gZmFsc2U7XHJcbiAgaWYgKGRvdCkgZCA9IGRvdDtcclxuICByZXR1cm4gKFRJTUVfQkFTRSAqICg0ICsgKGQ/MjowKSkpIC8gbGVuO1xyXG59XHJcblxyXG5mdW5jdGlvbiBTdGVwKHN0ZXApIHtcclxuICB0aGlzLnN0ZXAgPSBzdGVwO1xyXG59XHJcblxyXG5TdGVwLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKHRyYWNrKVxyXG57XHJcbiAgdHJhY2suYmFjay5zdGVwID0gdGhpcy5zdGVwO1xyXG59XHJcblxyXG5mdW5jdGlvbiBTVChzdGVwKVxyXG57XHJcbiAgcmV0dXJuIG5ldyBTdGVwKHN0ZXApO1xyXG59XHJcblxyXG5mdW5jdGlvbiBMKGxlbiwgZG90KSB7XHJcbiAgcmV0dXJuIG5ldyBTdGVwKGwobGVuLCBkb3QpKTtcclxufVxyXG5cclxuLy8vIOOCsuODvOODiOOCv+OCpOODoOaMh+WumlxyXG5cclxuZnVuY3Rpb24gR2F0ZVRpbWUoZ2F0ZSkge1xyXG4gIHRoaXMuZ2F0ZSA9IGdhdGU7XHJcbn1cclxuXHJcbkdhdGVUaW1lLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKHRyYWNrKSB7XHJcbiAgdHJhY2suYmFjay5nYXRlID0gdGhpcy5nYXRlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBHVChnYXRlKSB7XHJcbiAgcmV0dXJuIG5ldyBHYXRlVGltZShnYXRlKTtcclxufVxyXG5cclxuLy8vIOODmeODreOCt+ODhuOCo+aMh+WumlxyXG5cclxuZnVuY3Rpb24gVmVsb2NpdHkodmVsKSB7XHJcbiAgdGhpcy52ZWwgPSB2ZWw7XHJcbn1cclxuXHJcblZlbG9jaXR5LnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKHRyYWNrKSB7XHJcbiAgdHJhY2suYmFjay52ZWwgPSB0aGlzLnZlbDtcclxufVxyXG5cclxuZnVuY3Rpb24gVih2ZWwpIHtcclxuICByZXR1cm4gbmV3IFZlbG9jaXR5KHZlbCk7XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBKdW1wKHBvcykgeyB0aGlzLnBvcyA9IHBvczt9O1xyXG5KdW1wLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKHRyYWNrKVxyXG57XHJcbiAgdHJhY2suc2VxUG9zID0gdGhpcy5wb3M7XHJcbn1cclxuXHJcbi8vLyDpn7PoibLoqK3lrppcclxuZnVuY3Rpb24gVG9uZShubylcclxue1xyXG4gIHRoaXMubm8gPSBubztcclxuICAvL3RoaXMuc2FtcGxlID0gd2F2ZVNhbXBsZXNbdGhpcy5ub107XHJcbn1cclxuXHJcblRvbmUucHJvdG90eXBlID1cclxue1xyXG4gIHByb2Nlc3M6IGZ1bmN0aW9uICh0cmFjaylcclxuICB7XHJcbiAgICB0cmFjay5hdWRpby52b2ljZXNbdHJhY2suY2hhbm5lbF0uc2V0U2FtcGxlKHdhdmVTYW1wbGVzW3RoaXMubm9dKTtcclxuICB9XHJcbn1cclxuZnVuY3Rpb24gVE9ORShubylcclxue1xyXG4gIHJldHVybiBuZXcgVG9uZShubyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIEpVTVAocG9zKSB7XHJcbiAgcmV0dXJuIG5ldyBKdW1wKHBvcyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFJlc3Qoc3RlcClcclxue1xyXG4gIHRoaXMuc3RlcCA9IHN0ZXA7XHJcbn1cclxuXHJcblJlc3QucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbih0cmFjaylcclxue1xyXG4gIHZhciBzdGVwID0gdGhpcy5zdGVwIHx8IHRyYWNrLmJhY2suc3RlcDtcclxuICB0cmFjay5wbGF5aW5nVGltZSA9IHRyYWNrLnBsYXlpbmdUaW1lICsgKHRoaXMuc3RlcCAqIDYwKSAvIChUSU1FX0JBU0UgKiB0cmFjay5sb2NhbFRlbXBvKTtcclxuICB0cmFjay5iYWNrLnN0ZXAgPSB0aGlzLnN0ZXA7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFIxKHN0ZXApIHtcclxuICByZXR1cm4gbmV3IFJlc3Qoc3RlcCk7XHJcbn1cclxuZnVuY3Rpb24gUihsZW4sZG90KSB7XHJcbiAgcmV0dXJuIG5ldyBSZXN0KGwobGVuLGRvdCkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBPY3RhdmUob2N0KSB7XHJcbiAgdGhpcy5vY3QgPSBvY3Q7XHJcbn1cclxuT2N0YXZlLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24odHJhY2spXHJcbntcclxuICB0cmFjay5iYWNrLm9jdCA9IHRoaXMub2N0O1xyXG59XHJcblxyXG5mdW5jdGlvbiBPKG9jdCkge1xyXG4gIHJldHVybiBuZXcgT2N0YXZlKG9jdCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIE9jdGF2ZVVwKHYpIHsgdGhpcy52ID0gdjsgfTtcclxuT2N0YXZlVXAucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbih0cmFjaykge1xyXG4gIHRyYWNrLmJhY2sub2N0ICs9IHRoaXMudjtcclxufVxyXG5cclxudmFyIE9VID0gbmV3IE9jdGF2ZVVwKDEpO1xyXG52YXIgT0QgPSBuZXcgT2N0YXZlVXAoLTEpO1xyXG5cclxuZnVuY3Rpb24gVGVtcG8odGVtcG8pXHJcbntcclxuICB0aGlzLnRlbXBvID0gdGVtcG87XHJcbn1cclxuXHJcblRlbXBvLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24odHJhY2spXHJcbntcclxuICB0cmFjay5sb2NhbFRlbXBvID0gdGhpcy50ZW1wbztcclxuICAvL3RyYWNrLnNlcXVlbmNlci50ZW1wbyA9IHRoaXMudGVtcG87XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFRFTVBPKHRlbXBvKVxyXG57XHJcbiAgcmV0dXJuIG5ldyBUZW1wbyh0ZW1wbyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIEVudmVsb3BlKGF0dGFjaywgZGVjYXksIHN1c3RhaW4sIHJlbGVhc2UpXHJcbntcclxuICB0aGlzLmF0dGFjayA9IGF0dGFjaztcclxuICB0aGlzLmRlY2F5ID0gZGVjYXk7XHJcbiAgdGhpcy5zdXN0YWluID0gc3VzdGFpbjtcclxuICB0aGlzLnJlbGVhc2UgPSByZWxlYXNlO1xyXG59XHJcblxyXG5FbnZlbG9wZS5wcm90b3R5cGUucHJvY2VzcyA9IGZ1bmN0aW9uKHRyYWNrKVxyXG57XHJcbiAgdmFyIGVudmVsb3BlID0gdHJhY2suYXVkaW8udm9pY2VzW3RyYWNrLmNoYW5uZWxdLmVudmVsb3BlO1xyXG4gIGVudmVsb3BlLmF0dGFjayA9IHRoaXMuYXR0YWNrO1xyXG4gIGVudmVsb3BlLmRlY2F5ID0gdGhpcy5kZWNheTtcclxuICBlbnZlbG9wZS5zdXN0YWluID0gdGhpcy5zdXN0YWluO1xyXG4gIGVudmVsb3BlLnJlbGVhc2UgPSB0aGlzLnJlbGVhc2U7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIEVOVihhdHRhY2ssZGVjYXksc3VzdGFpbiAscmVsZWFzZSlcclxue1xyXG4gIHJldHVybiBuZXcgRW52ZWxvcGUoYXR0YWNrLCBkZWNheSwgc3VzdGFpbiwgcmVsZWFzZSk7XHJcbn1cclxuXHJcbi8vLyDjg4fjg4Hjg6Xjg7zjg7NcclxuZnVuY3Rpb24gRGV0dW5lKGRldHVuZSlcclxue1xyXG4gIHRoaXMuZGV0dW5lID0gZGV0dW5lO1xyXG59XHJcblxyXG5EZXR1bmUucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbih0cmFjaylcclxue1xyXG4gIHZhciB2b2ljZSA9IHRyYWNrLmF1ZGlvLnZvaWNlc1t0cmFjay5jaGFubmVsXTtcclxuICB2b2ljZS5kZXR1bmUgPSB0aGlzLmRldHVuZTtcclxufVxyXG5cclxuZnVuY3Rpb24gREVUVU5FKGRldHVuZSlcclxue1xyXG4gIHJldHVybiBuZXcgRGV0dW5lKGRldHVuZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFZvbHVtZSh2b2x1bWUpXHJcbntcclxuICB0aGlzLnZvbHVtZSA9IHZvbHVtZTtcclxufVxyXG5cclxuVm9sdW1lLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24odHJhY2spXHJcbntcclxuICB0cmFjay5hdWRpby52b2ljZXNbdHJhY2suY2hhbm5lbF0udm9sdW1lLmdhaW4uc2V0VmFsdWVBdFRpbWUodGhpcy52b2x1bWUsIHRyYWNrLnBsYXlpbmdUaW1lKTtcclxufVxyXG5cclxuZnVuY3Rpb24gVk9MVU1FKHZvbHVtZSlcclxue1xyXG4gIHJldHVybiBuZXcgVm9sdW1lKHZvbHVtZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIExvb3BEYXRhKG9iaix2YXJuYW1lLCBjb3VudCxzZXFQb3MpXHJcbntcclxuICB0aGlzLnZhcm5hbWUgPSB2YXJuYW1lO1xyXG4gIHRoaXMuY291bnQgPSBjb3VudDtcclxuICB0aGlzLm9iaiA9IG9iajtcclxuICB0aGlzLnNlcVBvcyA9IHNlcVBvcztcclxufVxyXG5cclxuZnVuY3Rpb24gTG9vcCh2YXJuYW1lLCBjb3VudCkge1xyXG4gIHRoaXMubG9vcERhdGEgPSBuZXcgTG9vcERhdGEodGhpcyx2YXJuYW1lLGNvdW50LDApO1xyXG59XHJcblxyXG5Mb29wLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKHRyYWNrKVxyXG57XHJcbiAgdmFyIHN0YWNrID0gdHJhY2suc3RhY2s7XHJcbiAgaWYgKHN0YWNrLmxlbmd0aCA9PSAwIHx8IHN0YWNrW3N0YWNrLmxlbmd0aCAtIDFdLm9iaiAhPT0gdGhpcylcclxuICB7XHJcbiAgICB2YXIgbGQgPSB0aGlzLmxvb3BEYXRhO1xyXG4gICAgc3RhY2sucHVzaChuZXcgTG9vcERhdGEodGhpcywgbGQudmFybmFtZSwgbGQuY291bnQsIHRyYWNrLnNlcVBvcykpO1xyXG4gIH0gXHJcbn1cclxuXHJcbmZ1bmN0aW9uIExPT1AodmFybmFtZSwgY291bnQpIHtcclxuICByZXR1cm4gbmV3IExvb3AodmFybmFtZSxjb3VudCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIExvb3BFbmQoKVxyXG57XHJcbn1cclxuXHJcbkxvb3BFbmQucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbih0cmFjaylcclxue1xyXG4gIHZhciBsZCA9IHRyYWNrLnN0YWNrW3RyYWNrLnN0YWNrLmxlbmd0aCAtIDFdO1xyXG4gIGxkLmNvdW50LS07XHJcbiAgaWYgKGxkLmNvdW50ID4gMCkge1xyXG4gICAgdHJhY2suc2VxUG9zID0gbGQuc2VxUG9zO1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0cmFjay5zdGFjay5wb3AoKTtcclxuICB9XHJcbn1cclxuXHJcbnZhciBMT09QX0VORCA9IG5ldyBMb29wRW5kKCk7XHJcblxyXG4vLy8g44K344O844Kx44Oz44K144O844OI44Op44OD44KvXHJcbmZ1bmN0aW9uIFRyYWNrKHNlcXVlbmNlcixzZXFkYXRhLGF1ZGlvKVxyXG57XHJcbiAgdGhpcy5uYW1lID0gJyc7XHJcbiAgdGhpcy5lbmQgPSBmYWxzZTtcclxuICB0aGlzLm9uZXNob3QgPSBmYWxzZTtcclxuICB0aGlzLnNlcXVlbmNlciA9IHNlcXVlbmNlcjtcclxuICB0aGlzLnNlcURhdGEgPSBzZXFkYXRhO1xyXG4gIHRoaXMuc2VxUG9zID0gMDtcclxuICB0aGlzLm11dGUgPSBmYWxzZTtcclxuICB0aGlzLnBsYXlpbmdUaW1lID0gLTE7XHJcbiAgdGhpcy5sb2NhbFRlbXBvID0gc2VxdWVuY2VyLnRlbXBvO1xyXG4gIHRoaXMudHJhY2tWb2x1bWUgPSAxLjA7XHJcbiAgdGhpcy50cmFuc3Bvc2UgPSAwO1xyXG4gIHRoaXMuc29sbyA9IGZhbHNlO1xyXG4gIHRoaXMuY2hhbm5lbCA9IC0xO1xyXG4gIHRoaXMudHJhY2sgPSAtMTtcclxuICB0aGlzLmF1ZGlvID0gYXVkaW87XHJcbiAgdGhpcy5iYWNrID0ge1xyXG4gICAgbm90ZTogNzIsXHJcbiAgICBvY3Q6IDUsXHJcbiAgICBzdGVwOiA5NixcclxuICAgIGdhdGU6IDQ4LFxyXG4gICAgdmVsOjEuMFxyXG4gIH1cclxuICB0aGlzLnN0YWNrID0gW107XHJcbn1cclxuXHJcblRyYWNrLnByb3RvdHlwZSA9IHtcclxuICBwcm9jZXNzOiBmdW5jdGlvbiAoY3VycmVudFRpbWUpIHtcclxuXHJcbiAgICBpZiAodGhpcy5lbmQpIHJldHVybjtcclxuICAgIFxyXG4gICAgaWYgKHRoaXMub25lc2hvdCkge1xyXG4gICAgICB0aGlzLnJlc2V0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHNlcVNpemUgPSB0aGlzLnNlcURhdGEubGVuZ3RoO1xyXG4gICAgaWYgKHRoaXMuc2VxUG9zID49IHNlcVNpemUpIHtcclxuICAgICAgaWYodGhpcy5zZXF1ZW5jZXIucmVwZWF0KVxyXG4gICAgICB7XHJcbiAgICAgICAgdGhpcy5zZXFQb3MgPSAwO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZW5kID0gdHJ1ZTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgc2VxID0gdGhpcy5zZXFEYXRhO1xyXG4gICAgdGhpcy5wbGF5aW5nVGltZSA9ICh0aGlzLnBsYXlpbmdUaW1lID4gLTEpID8gdGhpcy5wbGF5aW5nVGltZSA6IGN1cnJlbnRUaW1lO1xyXG4gICAgdmFyIGVuZFRpbWUgPSBjdXJyZW50VGltZSArIDAuMi8qc2VjKi87XHJcblxyXG4gICAgd2hpbGUgKHRoaXMuc2VxUG9zIDwgc2VxU2l6ZSkge1xyXG4gICAgICBpZiAodGhpcy5wbGF5aW5nVGltZSA+PSBlbmRUaW1lICYmICF0aGlzLm9uZXNob3QpIHtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgZCA9IHNlcVt0aGlzLnNlcVBvc107XHJcbiAgICAgICAgZC5wcm9jZXNzKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuc2VxUG9zKys7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG4gIHJlc2V0OmZ1bmN0aW9uKClcclxuICB7XHJcbiAgICB2YXIgY3VyVm9pY2UgPSB0aGlzLmF1ZGlvLnZvaWNlc1t0aGlzLmNoYW5uZWxdO1xyXG4gICAgY3VyVm9pY2UuZ2Fpbi5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcygwKTtcclxuICAgIGN1clZvaWNlLnByb2Nlc3Nvci5wbGF5YmFja1JhdGUuY2FuY2VsU2NoZWR1bGVkVmFsdWVzKDApO1xyXG4gICAgY3VyVm9pY2UuZ2Fpbi5nYWluLnZhbHVlID0gMDtcclxuICAgIHRoaXMucGxheWluZ1RpbWUgPSAtMTtcclxuICAgIHRoaXMuc2VxUG9zID0gMDtcclxuICAgIHRoaXMuZW5kID0gZmFsc2U7XHJcbiAgfVxyXG5cclxufVxyXG5cclxuZnVuY3Rpb24gbG9hZFRyYWNrcyhzZWxmLHRyYWNrcywgdHJhY2tkYXRhKVxyXG57XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0cmFja2RhdGEubGVuZ3RoOyArK2kpIHtcclxuICAgIHZhciB0cmFjayA9IG5ldyBUcmFjayhzZWxmLCB0cmFja2RhdGFbaV0uZGF0YSxzZWxmLmF1ZGlvKTtcclxuICAgIHRyYWNrLmNoYW5uZWwgPSB0cmFja2RhdGFbaV0uY2hhbm5lbDtcclxuICAgIHRyYWNrLm9uZXNob3QgPSAoIXRyYWNrZGF0YVtpXS5vbmVzaG90KT9mYWxzZTp0cnVlO1xyXG4gICAgdHJhY2sudHJhY2sgPSBpO1xyXG4gICAgdHJhY2tzLnB1c2godHJhY2spO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlVHJhY2tzKHRyYWNrZGF0YSlcclxue1xyXG4gIHZhciB0cmFja3MgPSBbXTtcclxuICBsb2FkVHJhY2tzKHRoaXMsdHJhY2tzLCB0cmFja2RhdGEpO1xyXG4gIHJldHVybiB0cmFja3M7XHJcbn1cclxuXHJcbi8vLyDjgrfjg7zjgrHjg7PjgrXjg7zmnKzkvZNcclxuZXhwb3J0IGZ1bmN0aW9uIFNlcXVlbmNlcihhdWRpbykge1xyXG4gIHRoaXMuYXVkaW8gPSBhdWRpbztcclxuICB0aGlzLnRlbXBvID0gMTAwLjA7XHJcbiAgdGhpcy5yZXBlYXQgPSBmYWxzZTtcclxuICB0aGlzLnBsYXkgPSBmYWxzZTtcclxuICB0aGlzLnRyYWNrcyA9IFtdO1xyXG4gIHRoaXMucGF1c2VUaW1lID0gMDtcclxuICB0aGlzLnN0YXR1cyA9IHRoaXMuU1RPUDtcclxufVxyXG5cclxuU2VxdWVuY2VyLnByb3RvdHlwZSA9IHtcclxuICBsb2FkOiBmdW5jdGlvbihkYXRhKVxyXG4gIHtcclxuICAgIGlmKHRoaXMucGxheSkge1xyXG4gICAgICB0aGlzLnN0b3AoKTtcclxuICAgIH1cclxuICAgIHRoaXMudHJhY2tzLmxlbmd0aCA9IDA7XHJcbiAgICBsb2FkVHJhY2tzKHRoaXMsdGhpcy50cmFja3MsIGRhdGEudHJhY2tzLHRoaXMuYXVkaW8pO1xyXG4gIH0sXHJcbiAgc3RhcnQ6ZnVuY3Rpb24oKVxyXG4gIHtcclxuICAgIC8vICAgIHRoaXMuaGFuZGxlID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkgeyBzZWxmLnByb2Nlc3MoKSB9LCA1MCk7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuUExBWTtcclxuICAgIHRoaXMucHJvY2VzcygpO1xyXG4gIH0sXHJcbiAgcHJvY2VzczpmdW5jdGlvbigpXHJcbiAge1xyXG4gICAgaWYgKHRoaXMuc3RhdHVzID09IHRoaXMuUExBWSkge1xyXG4gICAgICB0aGlzLnBsYXlUcmFja3ModGhpcy50cmFja3MpO1xyXG4gICAgICB0aGlzLmhhbmRsZSA9IHdpbmRvdy5zZXRUaW1lb3V0KHRoaXMucHJvY2Vzcy5iaW5kKHRoaXMpLCAxMDApO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgcGxheVRyYWNrczogZnVuY3Rpb24gKHRyYWNrcyl7XHJcbiAgICB2YXIgY3VycmVudFRpbWUgPSB0aGlzLmF1ZGlvLmF1ZGlvY3R4LmN1cnJlbnRUaW1lO1xyXG4gLy8gICBjb25zb2xlLmxvZyh0aGlzLmF1ZGlvLmF1ZGlvY3R4LmN1cnJlbnRUaW1lKTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0cmFja3MubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgdHJhY2tzW2ldLnByb2Nlc3MoY3VycmVudFRpbWUpO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgcGF1c2U6ZnVuY3Rpb24oKVxyXG4gIHtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5QQVVTRTtcclxuICAgIHRoaXMucGF1c2VUaW1lID0gdGhpcy5hdWRpby5hdWRpb2N0eC5jdXJyZW50VGltZTtcclxuICB9LFxyXG4gIHJlc3VtZTpmdW5jdGlvbiAoKVxyXG4gIHtcclxuICAgIGlmICh0aGlzLnN0YXR1cyA9PSB0aGlzLlBBVVNFKSB7XHJcbiAgICAgIHRoaXMuc3RhdHVzID0gdGhpcy5QTEFZO1xyXG4gICAgICB2YXIgdHJhY2tzID0gdGhpcy50cmFja3M7XHJcbiAgICAgIHZhciBhZGp1c3QgPSB0aGlzLmF1ZGlvLmF1ZGlvY3R4LmN1cnJlbnRUaW1lIC0gdGhpcy5wYXVzZVRpbWU7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0cmFja3MubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgICB0cmFja3NbaV0ucGxheWluZ1RpbWUgKz0gYWRqdXN0O1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMucHJvY2VzcygpO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgc3RvcDogZnVuY3Rpb24gKClcclxuICB7XHJcbiAgICBpZiAodGhpcy5zdGF0dXMgIT0gdGhpcy5TVE9QKSB7XHJcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLmhhbmRsZSk7XHJcbiAgICAgIC8vICAgIGNsZWFySW50ZXJ2YWwodGhpcy5oYW5kbGUpO1xyXG4gICAgICB0aGlzLnN0YXR1cyA9IHRoaXMuU1RPUDtcclxuICAgICAgdGhpcy5yZXNldCgpO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgcmVzZXQ6ZnVuY3Rpb24oKVxyXG4gIHtcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0aGlzLnRyYWNrcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSlcclxuICAgIHtcclxuICAgICAgdGhpcy50cmFja3NbaV0ucmVzZXQoKTtcclxuICAgIH1cclxuICB9LFxyXG4gIFNUT1A6IDAgfCAwLFxyXG4gIFBMQVk6IDEgfCAwLFxyXG4gIFBBVVNFOjIgfCAwXHJcbn1cclxuXHJcbi8vLyDnsKHmmJPpjbXnm6Tjga7lrp/oo4VcclxuZnVuY3Rpb24gUGlhbm8oYXVkaW8pIHtcclxuICB0aGlzLmF1ZGlvID0gYXVkaW87XHJcbiAgdGhpcy50YWJsZSA9IFs5MCwgODMsIDg4LCA2OCwgNjcsIDg2LCA3MSwgNjYsIDcyLCA3OCwgNzQsIDc3LCAxODhdO1xyXG4gIHRoaXMua2V5b24gPSBuZXcgQXJyYXkoMTMpO1xyXG59XHJcblxyXG5QaWFuby5wcm90b3R5cGUgPSB7XHJcbiAgb246IGZ1bmN0aW9uIChlKSB7XHJcbiAgICB2YXIgaW5kZXggPSB0aGlzLnRhYmxlLmluZGV4T2YoZS5rZXlDb2RlLCAwKTtcclxuICAgIGlmIChpbmRleCA9PSAtMSkge1xyXG4gICAgICBpZiAoZS5rZXlDb2RlID4gNDggJiYgZS5rZXlDb2RlIDwgNTcpIHtcclxuICAgICAgICB2YXIgdGltYnJlID0gZS5rZXlDb2RlIC0gNDk7XHJcbiAgICAgICAgdGhpcy5hdWRpby52b2ljZXNbN10uc2V0U2FtcGxlKHdhdmVTYW1wbGVzW3RpbWJyZV0pO1xyXG4gICAgICAgIHdhdmVHcmFwaC53YXZlID0gd2F2ZXNbdGltYnJlXTtcclxuICAgICAgICB3YXZlR3JhcGgucmVuZGVyKCk7XHJcbiAgICAgICAgdGV4dFBsYW5lLnByaW50KDUsIDEwLCBcIldhdmUgXCIgKyAodGltYnJlICsgMSkpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy9hdWRpby52b2ljZXNbMF0ucHJvY2Vzc29yLnBsYXliYWNrUmF0ZS52YWx1ZSA9IHNlcXVlbmNlci5ub3RlRnJlcVtdO1xyXG4gICAgICBpZiAoIXRoaXMua2V5b25baW5kZXhdKSB7XHJcbiAgICAgICAgdGhpcy5hdWRpby52b2ljZXNbN10ua2V5b24oMCxpbmRleCArIChlLnNoaWZ0S2V5ID8gODQgOiA3MiksMS4wKTtcclxuICAgICAgICB0aGlzLmtleW9uW2luZGV4XSA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICB9LFxyXG4gIG9mZjogZnVuY3Rpb24gKGUpIHtcclxuICAgIHZhciBpbmRleCA9IHRoaXMudGFibGUuaW5kZXhPZihlLmtleUNvZGUsIDApO1xyXG4gICAgaWYgKGluZGV4ID09IC0xKSB7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKHRoaXMua2V5b25baW5kZXhdKSB7XHJcbiAgICAgICAgYXVkaW8udm9pY2VzWzddLmVudmVsb3BlLmtleW9mZigwKTtcclxuICAgICAgICB0aGlzLmtleW9uW2luZGV4XSA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgc2VxRGF0YSA9IHtcclxuICBuYW1lOiAnVGVzdCcsXHJcbiAgdHJhY2tzOiBbXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6ICdwYXJ0MScsXHJcbiAgICAgIGNoYW5uZWw6IDAsXHJcbiAgICAgIGRhdGE6XHJcbiAgICAgIFtcclxuICAgICAgICBFTlYoMC4wMSwgMC4wMiwgMC41LCAwLjA3KSxcclxuICAgICAgICBURU1QTygxODApLCBUT05FKDApLCBWT0xVTUUoMC41KSwgTCg4KSwgR1QoLTAuNSksTyg0KSxcclxuICAgICAgICBMT09QKCdpJyw0KSxcclxuICAgICAgICBDLCBDLCBDLCBDLCBDLCBDLCBDLCBDLFxyXG4gICAgICAgIExPT1BfRU5ELFxyXG4gICAgICAgIEpVTVAoNSlcclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgbmFtZTogJ3BhcnQyJyxcclxuICAgICAgY2hhbm5lbDogMSxcclxuICAgICAgZGF0YTpcclxuICAgICAgICBbXHJcbiAgICAgICAgRU5WKDAuMDEsIDAuMDUsIDAuNiwgMC4wNyksXHJcbiAgICAgICAgVEVNUE8oMTgwKSxUT05FKDYpLCBWT0xVTUUoMC4yKSwgTCg4KSwgR1QoLTAuOCksXHJcbiAgICAgICAgUigxKSwgUigxKSxcclxuICAgICAgICBPKDYpLEwoMSksIEYsXHJcbiAgICAgICAgRSxcclxuICAgICAgICBPRCwgTCg4LCB0cnVlKSwgQmIsIEcsIEwoNCksIEJiLCBPVSwgTCg0KSwgRiwgTCg4KSwgRCxcclxuICAgICAgICBMKDQsIHRydWUpLCBFLCBMKDIpLCBDLFIoOCksXHJcbiAgICAgICAgSlVNUCg4KVxyXG4gICAgICAgIF1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6ICdwYXJ0MycsXHJcbiAgICAgIGNoYW5uZWw6IDIsXHJcbiAgICAgIGRhdGE6XHJcbiAgICAgICAgW1xyXG4gICAgICAgIEVOVigwLjAxLCAwLjA1LCAwLjYsIDAuMDcpLFxyXG4gICAgICAgIFRFTVBPKDE4MCksVE9ORSg2KSwgVk9MVU1FKDAuMSksIEwoOCksIEdUKC0wLjUpLCBcclxuICAgICAgICBSKDEpLCBSKDEpLFxyXG4gICAgICAgIE8oNiksTCgxKSwgQyxDLFxyXG4gICAgICAgIE9ELCBMKDgsIHRydWUpLCBHLCBELCBMKDQpLCBHLCBPVSwgTCg0KSwgRCwgTCg4KSxPRCwgRyxcclxuICAgICAgICBMKDQsIHRydWUpLCBPVSxDLCBMKDIpLE9ELCBHLCBSKDgpLFxyXG4gICAgICAgIEpVTVAoNylcclxuICAgICAgICBdXHJcbiAgICB9XHJcbiAgXVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gU291bmRFZmZlY3RzKHNlcXVlbmNlcikge1xyXG4gICB0aGlzLnNvdW5kRWZmZWN0cyA9XHJcbiAgICBbXHJcbiAgICAvLyBFZmZlY3QgMCAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgIGNyZWF0ZVRyYWNrcy5jYWxsKHNlcXVlbmNlcixbXHJcbiAgICB7XHJcbiAgICAgIGNoYW5uZWw6IDgsXHJcbiAgICAgIG9uZXNob3Q6dHJ1ZSxcclxuICAgICAgZGF0YTogW1ZPTFVNRSgwLjUpLFxyXG4gICAgICAgIEVOVigwLjAwMDEsIDAuMDEsIDEuMCwgMC4wMDAxKSxHVCgtMC45OTkpLFRPTkUoMCksIFRFTVBPKDIwMCksIE8oOCksU1QoMyksIEMsIEQsIEUsIEYsIEcsIEEsIEIsIE9VLCBDLCBELCBFLCBHLCBBLCBCLEIsQixCXHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGNoYW5uZWw6IDksXHJcbiAgICAgIG9uZXNob3Q6IHRydWUsXHJcbiAgICAgIGRhdGE6IFtWT0xVTUUoMC41KSxcclxuICAgICAgICBFTlYoMC4wMDAxLCAwLjAxLCAxLjAsIDAuMDAwMSksIERFVFVORSgwLjkpLCBHVCgtMC45OTkpLCBUT05FKDApLCBURU1QTygyMDApLCBPKDUpLCBTVCgzKSwgQywgRCwgRSwgRiwgRywgQSwgQiwgT1UsIEMsIEQsIEUsIEcsIEEsIEIsQixCLEJcclxuICAgICAgXVxyXG4gICAgfVxyXG4gICAgXSksXHJcbiAgICAvLyBFZmZlY3QgMSAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICBjcmVhdGVUcmFja3MuY2FsbChzZXF1ZW5jZXIsXHJcbiAgICAgIFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBjaGFubmVsOiAxMCxcclxuICAgICAgICAgIG9uZXNob3Q6IHRydWUsXHJcbiAgICAgICAgICBkYXRhOiBbXHJcbiAgICAgICAgICAgVE9ORSg0KSwgVEVNUE8oMTUwKSwgU1QoNCksIEdUKC0wLjk5OTkpLCBFTlYoMC4wMDAxLCAwLjAwMDEsIDEuMCwgMC4wMDAxKSxcclxuICAgICAgICAgICBPKDYpLCBHLCBBLCBCLCBPKDcpLCBCLCBBLCBHLCBGLCBFLCBELCBDLCBFLCBHLCBBLCBCLCBPRCwgQiwgQSwgRywgRiwgRSwgRCwgQywgT0QsIEIsIEEsIEcsIEYsIEUsIEQsIENcclxuICAgICAgICAgIF1cclxuICAgICAgICB9XHJcbiAgICAgIF0pLFxyXG4gICAgLy8gRWZmZWN0IDIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgY3JlYXRlVHJhY2tzLmNhbGwoc2VxdWVuY2VyLFxyXG4gICAgICBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgY2hhbm5lbDogMTAsXHJcbiAgICAgICAgICBvbmVzaG90OiB0cnVlLFxyXG4gICAgICAgICAgZGF0YTogW1xyXG4gICAgICAgICAgIFRPTkUoMCksIFRFTVBPKDE1MCksIFNUKDIpLCBHVCgtMC45OTk5KSwgRU5WKDAuMDAwMSwgMC4wMDAxLCAxLjAsIDAuMDAwMSksXHJcbiAgICAgICAgICAgTyg4KSwgQyxELEUsRixHLEEsQixPVSxDLEQsRSxGLE9ELEcsT1UsQSxPRCxCLE9VLEEsT0QsRyxPVSxGLE9ELEUsT1UsRVxyXG4gICAgICAgICAgXVxyXG4gICAgICAgIH1cclxuICAgICAgXSksXHJcbiAgICAgIC8vIEVmZmVjdCAzIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgICBjcmVhdGVUcmFja3MuY2FsbChzZXF1ZW5jZXIsXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBjaGFubmVsOiAxMCxcclxuICAgICAgICAgICAgb25lc2hvdDogdHJ1ZSxcclxuICAgICAgICAgICAgZGF0YTogW1xyXG4gICAgICAgICAgICAgVE9ORSg1KSwgVEVNUE8oMTUwKSwgTCg2NCksIEdUKC0wLjk5OTkpLCBFTlYoMC4wMDAxLCAwLjAwMDEsIDEuMCwgMC4wMDAxKSxcclxuICAgICAgICAgICAgIE8oNiksQyxPRCxDLE9VLEMsT0QsQyxPVSxDLE9ELEMsT1UsQyxPRFxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgXSksXHJcbiAgICAgIC8vIEVmZmVjdCA0IC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgICAgY3JlYXRlVHJhY2tzLmNhbGwoc2VxdWVuY2VyLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgY2hhbm5lbDogMTEsXHJcbiAgICAgICAgICAgIG9uZXNob3Q6IHRydWUsXHJcbiAgICAgICAgICAgIGRhdGE6IFtcclxuICAgICAgICAgICAgIFRPTkUoOCksIFZPTFVNRSgyLjApLFRFTVBPKDEyMCksIEwoMiksIEdUKC0wLjk5OTkpLCBFTlYoMC4wMDAxLCAwLjAwMDEsIDEuMCwgMC4yNSksXHJcbiAgICAgICAgICAgICBPKDEpLCBDXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICAgIH1cclxuICAgICAgICBdKVxyXG4gICBdO1xyXG4gfVxyXG5cclxuXHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBDb21tIHtcclxuICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgdmFyIGhvc3QgPSB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUubWF0Y2goL3d3d1xcLnNmcGdtclxcLm5ldC9pZyk/J3d3dy5zZnBnbXIubmV0JzonbG9jYWxob3N0JztcclxuICAgIHRoaXMuZW5hYmxlID0gZmFsc2U7XHJcbiAgICB0cnkge1xyXG4gICAgICB0aGlzLnNvY2tldCA9IGlvLmNvbm5lY3QoJ2h0dHA6Ly8nICsgaG9zdCArICc6ODA4MS90ZXN0Jyk7XHJcbiAgICAgIHRoaXMuZW5hYmxlID0gdHJ1ZTtcclxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICB0aGlzLnNvY2tldC5vbignc2VuZEhpZ2hTY29yZXMnLCAoZGF0YSk9PntcclxuICAgICAgICBpZih0aGlzLnVwZGF0ZUhpZ2hTY29yZXMpe1xyXG4gICAgICAgICAgdGhpcy51cGRhdGVIaWdoU2NvcmVzKGRhdGEpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIHRoaXMuc29ja2V0Lm9uKCdzZW5kSGlnaFNjb3JlJywgKGRhdGEpPT57XHJcbiAgICAgICAgdGhpcy51cGRhdGVIaWdoU2NvcmUoZGF0YSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdGhpcy5zb2NrZXQub24oJ3NlbmRSYW5rJywgKGRhdGEpID0+IHtcclxuICAgICAgICB0aGlzLnVwZGF0ZUhpZ2hTY29yZXMoZGF0YS5oaWdoU2NvcmVzKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLnNvY2tldC5vbignZXJyb3JDb25uZWN0aW9uTWF4JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGFsZXJ0KCflkIzmmYLmjqXntprjga7kuIrpmZDjgavpgZTjgZfjgb7jgZfjgZ/jgIInKTtcclxuICAgICAgICBzZWxmLmVuYWJsZSA9IGZhbHNlO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMuc29ja2V0Lm9uKCdkaXNjb25uZWN0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmIChzZWxmLmVuYWJsZSkge1xyXG4gICAgICAgICAgc2VsZi5lbmFibGUgPSBmYWxzZTtcclxuICAgICAgICAgIGFsZXJ0KCfjgrXjg7zjg5Djg7zmjqXntprjgYzliIfmlq3jgZXjgozjgb7jgZfjgZ/jgIInKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgYWxlcnQoJ1NvY2tldC5JT+OBjOWIqeeUqOOBp+OBjeOBquOBhOOBn+OCgeOAgeODj+OCpOOCueOCs+OCouaDheWgseOBjOWPluW+l+OBp+OBjeOBvuOBm+OCk+OAgicgKyBlKTtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgc2VuZFNjb3JlKHNjb3JlKVxyXG4gIHtcclxuICAgIGlmICh0aGlzLmVuYWJsZSkge1xyXG4gICAgICB0aGlzLnNvY2tldC5lbWl0KCdzZW5kU2NvcmUnLCBzY29yZSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIGRpc2Nvbm5lY3QoKVxyXG4gIHtcclxuICAgIGlmICh0aGlzLmVuYWJsZSkge1xyXG4gICAgICB0aGlzLmVuYWJsZSA9IGZhbHNlO1xyXG4gICAgICB0aGlzLnNvY2tldC5kaXNjb25uZWN0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgKiBhcyBzZmcgZnJvbSAnLi9nbG9iYWwnO1xyXG5pbXBvcnQgKiAgYXMgZ2FtZW9iaiBmcm9tICcuL2dhbWVvYmonO1xyXG5pbXBvcnQgKiBhcyBncmFwaGljcyBmcm9tICcuL2dyYXBoaWNzJztcclxuXHJcblxyXG4vLy8g54iG55m6XHJcbmV4cG9ydCBjbGFzcyBCb21iIGV4dGVuZHMgZ2FtZW9iai5HYW1lT2JqIFxyXG57XHJcbiAgY29uc3RydWN0b3Ioc2NlbmUsc2UpIHtcclxuICAgIHN1cGVyKDAsMCwwKTtcclxuICAgIHZhciB0ZXggPSBzZmcudGV4dHVyZUZpbGVzLmJvbWI7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVNYXRlcmlhbCh0ZXgpO1xyXG4gICAgbWF0ZXJpYWwuYmxlbmRpbmcgPSBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nO1xyXG4gICAgbWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gZ3JhcGhpY3MuY3JlYXRlU3ByaXRlR2VvbWV0cnkoMTYpO1xyXG4gICAgZ3JhcGhpY3MuY3JlYXRlU3ByaXRlVVYoZ2VvbWV0cnksIHRleCwgMTYsIDE2LCAwKTtcclxuICAgIHRoaXMubWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgICB0aGlzLm1lc2gucG9zaXRpb24ueiA9IDAuMTtcclxuICAgIHRoaXMuaW5kZXggPSAwO1xyXG4gICAgdGhpcy5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxuICAgIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuICAgIHRoaXMuc2UgPSBzZTtcclxuICAgIHNjZW5lLmFkZCh0aGlzLm1lc2gpO1xyXG4gIH1cclxuICBnZXQgeCgpIHsgcmV0dXJuIHRoaXMueF87IH1cclxuICBzZXQgeCh2KSB7IHRoaXMueF8gPSB0aGlzLm1lc2gucG9zaXRpb24ueCA9IHY7IH1cclxuICBnZXQgeSgpIHsgcmV0dXJuIHRoaXMueV87IH1cclxuICBzZXQgeSh2KSB7IHRoaXMueV8gPSB0aGlzLm1lc2gucG9zaXRpb24ueSA9IHY7IH1cclxuICBnZXQgeigpIHsgcmV0dXJuIHRoaXMuel87IH1cclxuICBzZXQgeih2KSB7IHRoaXMuel8gPSB0aGlzLm1lc2gucG9zaXRpb24ueiA9IHY7IH1cclxuICBcclxuICBzdGFydCh4LCB5LCB6LCBkZWxheSkge1xyXG4gICAgaWYgKHRoaXMuZW5hYmxlXykge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB0aGlzLmRlbGF5ID0gZGVsYXkgfCAwO1xyXG4gICAgdGhpcy54ID0geDtcclxuICAgIHRoaXMueSA9IHk7XHJcbiAgICB0aGlzLnogPSB6IHwgMC4wMDAwMjtcclxuICAgIHRoaXMuZW5hYmxlXyA9IHRydWU7XHJcbiAgICBncmFwaGljcy51cGRhdGVTcHJpdGVVVih0aGlzLm1lc2guZ2VvbWV0cnksIHNmZy50ZXh0dXJlRmlsZXMuYm9tYiwgMTYsIDE2LCB0aGlzLmluZGV4KTtcclxuICAgIHRoaXMudGFzayA9IHNmZy50YXNrcy5wdXNoVGFzayh0aGlzLm1vdmUuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLm1lc2gubWF0ZXJpYWwub3BhY2l0eSA9IDEuMDtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuICBcclxuICAqbW92ZSh0YXNrSW5kZXgpIHtcclxuICAgIFxyXG4gICAgZm9yKCBsZXQgaSA9IDAsZSA9IHRoaXMuZGVsYXk7aSA8IGUgJiYgdGFza0luZGV4ID49IDA7KytpKVxyXG4gICAge1xyXG4gICAgICB0YXNrSW5kZXggPSB5aWVsZDsgICAgICBcclxuICAgIH1cclxuICAgIHRoaXMubWVzaC52aXNpYmxlID0gdHJ1ZTtcclxuXHJcbiAgICBmb3IobGV0IGkgPSAwO2kgPCA3ICYmIHRhc2tJbmRleCA+PSAwOysraSlcclxuICAgIHtcclxuICAgICAgZ3JhcGhpY3MudXBkYXRlU3ByaXRlVVYodGhpcy5tZXNoLmdlb21ldHJ5LCBzZmcudGV4dHVyZUZpbGVzLmJvbWIsIDE2LCAxNiwgaSk7XHJcbiAgICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICB0aGlzLmVuYWJsZV8gPSBmYWxzZTtcclxuICAgIHRoaXMubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICBzZmcudGFza3MucmVtb3ZlVGFzayh0YXNrSW5kZXgpO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEJvbWJzIHtcclxuICBjb25zdHJ1Y3RvcihzY2VuZSwgc2UpIHtcclxuICAgIHRoaXMuYm9tYnMgPSBuZXcgQXJyYXkoMCk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDMyOyArK2kpIHtcclxuICAgICAgdGhpcy5ib21icy5wdXNoKG5ldyBCb21iKHNjZW5lLCBzZSkpO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBzdGFydCh4LCB5LCB6KSB7XHJcbiAgICB2YXIgYm9tcyA9IHRoaXMuYm9tYnM7XHJcbiAgICB2YXIgY291bnQgPSAzO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IGJvbXMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgaWYgKCFib21zW2ldLmVuYWJsZV8pIHtcclxuICAgICAgICBpZiAoY291bnQgPT0gMikge1xyXG4gICAgICAgICAgYm9tc1tpXS5zdGFydCh4LCB5LCB6LCAwKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgYm9tc1tpXS5zdGFydCh4ICsgKE1hdGgucmFuZG9tKCkgKiAxNiAtIDgpLCB5ICsgKE1hdGgucmFuZG9tKCkgKiAxNiAtIDgpLCB6LCBNYXRoLnJhbmRvbSgpICogOCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvdW50LS07XHJcbiAgICAgICAgaWYgKCFjb3VudCkgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJlc2V0KCl7XHJcbiAgICB0aGlzLmJvbWJzLmZvckVhY2goKGQpPT57XHJcbiAgICAgIGlmKGQuZW5hYmxlXyl7XHJcbiAgICAgICAgd2hpbGUoIXNmZy50YXNrcy5hcnJheVtkLnRhc2suaW5kZXhdLmdlbkluc3QubmV4dCgtKDErZC50YXNrLmluZGV4KSkuZG9uZSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmltcG9ydCAqICBhcyBnYW1lb2JqIGZyb20gJy4vZ2FtZW9iaic7XHJcbmltcG9ydCAqIGFzIHNmZyBmcm9tICcuL2dsb2JhbCc7XHJcbmltcG9ydCAqIGFzIGdyYXBoaWNzIGZyb20gJy4vZ3JhcGhpY3MnO1xyXG5cclxuLy8vIOaVteW8vlxyXG5leHBvcnQgY2xhc3MgRW5lbXlCdWxsZXQgZXh0ZW5kcyBnYW1lb2JqLkdhbWVPYmoge1xyXG4gIGNvbnN0cnVjdG9yKHNjZW5lLCBzZSkge1xyXG4gICAgc3VwZXIoMCwgMCwgMCk7XHJcbiAgICB0aGlzLk5PTkUgPSAwO1xyXG4gICAgdGhpcy5NT1ZFID0gMTtcclxuICAgIHRoaXMuQk9NQiA9IDI7XHJcbiAgICB0aGlzLmNvbGxpc2lvbkFyZWEud2lkdGggPSAyO1xyXG4gICAgdGhpcy5jb2xsaXNpb25BcmVhLmhlaWdodCA9IDI7XHJcbiAgICB2YXIgdGV4ID0gc2ZnLnRleHR1cmVGaWxlcy5lbmVteTtcclxuICAgIHZhciBtYXRlcmlhbCA9IGdyYXBoaWNzLmNyZWF0ZVNwcml0ZU1hdGVyaWFsKHRleCk7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVHZW9tZXRyeSgxNik7XHJcbiAgICBncmFwaGljcy5jcmVhdGVTcHJpdGVVVihnZW9tZXRyeSwgdGV4LCAxNiwgMTYsIDApO1xyXG4gICAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICAgIHRoaXMueiA9IDAuMDtcclxuICAgIHRoaXMubXZQYXR0ZXJuID0gbnVsbDtcclxuICAgIHRoaXMubXYgPSBudWxsO1xyXG4gICAgdGhpcy5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxuICAgIHRoaXMudHlwZSA9IG51bGw7XHJcbiAgICB0aGlzLmxpZmUgPSAwO1xyXG4gICAgdGhpcy5keCA9IDA7XHJcbiAgICB0aGlzLmR5ID0gMDtcclxuICAgIHRoaXMuc3BlZWQgPSAyLjA7XHJcbiAgICB0aGlzLmVuYWJsZSA9IGZhbHNlO1xyXG4gICAgdGhpcy5oaXRfID0gbnVsbDtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5OT05FO1xyXG4gICAgdGhpcy5zY2VuZSA9IHNjZW5lO1xyXG4gICAgc2NlbmUuYWRkKHRoaXMubWVzaCk7XHJcbiAgICB0aGlzLnNlID0gc2U7XHJcbiAgfVxyXG5cclxuICBnZXQgeCgpIHsgcmV0dXJuIHRoaXMueF87IH1cclxuICBzZXQgeCh2KSB7IHRoaXMueF8gPSB0aGlzLm1lc2gucG9zaXRpb24ueCA9IHY7IH1cclxuICBnZXQgeSgpIHsgcmV0dXJuIHRoaXMueV87IH1cclxuICBzZXQgeSh2KSB7IHRoaXMueV8gPSB0aGlzLm1lc2gucG9zaXRpb24ueSA9IHY7IH1cclxuICBnZXQgeigpIHsgcmV0dXJuIHRoaXMuel87IH1cclxuICBzZXQgeih2KSB7IHRoaXMuel8gPSB0aGlzLm1lc2gucG9zaXRpb24ueiA9IHY7IH1cclxuICBnZXQgZW5hYmxlKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZW5hYmxlXztcclxuICB9XHJcbiAgXHJcbiAgc2V0IGVuYWJsZSh2KSB7XHJcbiAgICB0aGlzLmVuYWJsZV8gPSB2O1xyXG4gICAgdGhpcy5tZXNoLnZpc2libGUgPSB2O1xyXG4gIH1cclxuICBcclxuICAqbW92ZSh0YXNrSW5kZXgpIHtcclxuICAgIGZvcig7dGhpcy54ID49IChzZmcuVl9MRUZUIC0gMTYpICYmXHJcbiAgICAgICAgdGhpcy54IDw9IChzZmcuVl9SSUdIVCArIDE2KSAmJlxyXG4gICAgICAgIHRoaXMueSA+PSAoc2ZnLlZfQk9UVE9NIC0gMTYpICYmXHJcbiAgICAgICAgdGhpcy55IDw9IChzZmcuVl9UT1AgKyAxNikgJiYgdGFza0luZGV4ID49IDA7XHJcbiAgICAgICAgdGhpcy54ICs9IHRoaXMuZHgsdGhpcy55ICs9IHRoaXMuZHkpXHJcbiAgICB7XHJcbiAgICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpZih0YXNrSW5kZXggPj0gMCl7XHJcbiAgICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gICAgfVxyXG4gICAgdGhpcy5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5OT05FO1xyXG4gICAgdGhpcy5lbmFibGUgPSBmYWxzZTtcclxuICAgIHNmZy50YXNrcy5yZW1vdmVUYXNrKHRhc2tJbmRleCk7XHJcbiAgfVxyXG4gICBcclxuICBzdGFydCh4LCB5LCB6KSB7XHJcbiAgICBpZiAodGhpcy5lbmFibGUpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgdGhpcy54ID0geCB8fCAwO1xyXG4gICAgdGhpcy55ID0geSB8fCAwO1xyXG4gICAgdGhpcy56ID0geiB8fCAwO1xyXG4gICAgdGhpcy5lbmFibGUgPSB0cnVlO1xyXG4gICAgaWYgKHRoaXMuc3RhdHVzICE9IHRoaXMuTk9ORSlcclxuICAgIHtcclxuICAgICAgZGVidWdnZXI7XHJcbiAgICB9XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuTU9WRTtcclxuICAgIHZhciBhaW1SYWRpYW4gPSBNYXRoLmF0YW4yKHNmZy5teXNoaXBfLnkgLSB5LCBzZmcubXlzaGlwXy54IC0geCk7XHJcbiAgICB0aGlzLm1lc2gucm90YXRpb24ueiA9IGFpbVJhZGlhbjtcclxuICAgIHRoaXMuZHggPSBNYXRoLmNvcyhhaW1SYWRpYW4pICogKHRoaXMuc3BlZWQgKyBzZmcuc3RhZ2UuZGlmZmljdWx0eSk7XHJcbiAgICB0aGlzLmR5ID0gTWF0aC5zaW4oYWltUmFkaWFuKSAqICh0aGlzLnNwZWVkICsgc2ZnLnN0YWdlLmRpZmZpY3VsdHkpO1xyXG4vLyAgICBjb25zb2xlLmxvZygnZHg6JyArIHRoaXMuZHggKyAnIGR5OicgKyB0aGlzLmR5KTtcclxuXHJcbiAgICB0aGlzLnRhc2sgPSBzZmcudGFza3MucHVzaFRhc2sodGhpcy5tb3ZlLmJpbmQodGhpcykpO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG4gXHJcbiAgaGl0KCkge1xyXG4gICAgdGhpcy5lbmFibGUgPSBmYWxzZTtcclxuICAgIHNmZy50YXNrcy5yZW1vdmVUYXNrKHRoaXMudGFzay5pbmRleCk7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuTk9ORTtcclxuICB9XHJcbn1cclxuXHJcblxyXG5leHBvcnQgY2xhc3MgRW5lbXlCdWxsZXRzIHtcclxuICBjb25zdHJ1Y3RvcihzY2VuZSwgc2UpIHtcclxuICAgIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuICAgIHRoaXMuZW5lbXlCdWxsZXRzID0gW107XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDQ4OyArK2kpIHtcclxuICAgICAgdGhpcy5lbmVteUJ1bGxldHMucHVzaChuZXcgRW5lbXlCdWxsZXQodGhpcy5zY2VuZSwgc2UpKTtcclxuICAgIH1cclxuICB9XHJcbiAgc3RhcnQoeCwgeSwgeikge1xyXG4gICAgdmFyIGVicyA9IHRoaXMuZW5lbXlCdWxsZXRzO1xyXG4gICAgZm9yKHZhciBpID0gMCxlbmQgPSBlYnMubGVuZ3RoO2k8IGVuZDsrK2kpe1xyXG4gICAgICBpZighZWJzW2ldLmVuYWJsZSl7XHJcbiAgICAgICAgZWJzW2ldLnN0YXJ0KHgsIHksIHopO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIHJlc2V0KClcclxuICB7XHJcbiAgICB0aGlzLmVuZW15QnVsbGV0cy5mb3JFYWNoKChkLGkpPT57XHJcbiAgICAgIGlmKGQuZW5hYmxlKXtcclxuICAgICAgICB3aGlsZSghc2ZnLnRhc2tzLmFycmF5W2QudGFzay5pbmRleF0uZ2VuSW5zdC5uZXh0KC0oMSArIGQudGFzay5pbmRleCkpLmRvbmUpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDmlbXjgq3jg6Pjg6njga7li5XjgY0gLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4vLy8g55u057ea6YGL5YuVXHJcbmNsYXNzIExpbmVNb3ZlIHtcclxuICBjb25zdHJ1Y3RvcihyYWQsIHNwZWVkLCBzdGVwKSB7XHJcbiAgICB0aGlzLnJhZCA9IHJhZDtcclxuICAgIHRoaXMuc3BlZWQgPSBzcGVlZDtcclxuICAgIHRoaXMuc3RlcCA9IHN0ZXA7XHJcbiAgICB0aGlzLmN1cnJlbnRTdGVwID0gc3RlcDtcclxuICAgIHRoaXMuZHggPSBNYXRoLmNvcyhyYWQpICogc3BlZWQ7XHJcbiAgICB0aGlzLmR5ID0gTWF0aC5zaW4ocmFkKSAqIHNwZWVkO1xyXG4gIH1cclxuICBcclxuICAqbW92ZShzZWxmLHgseSkgXHJcbiAge1xyXG4gICAgXHJcbiAgICBpZiAoc2VsZi54cmV2KSB7XHJcbiAgICAgIHNlbGYuY2hhclJhZCA9IE1hdGguUEkgLSAodGhpcy5yYWQgLSBNYXRoLlBJIC8gMik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzZWxmLmNoYXJSYWQgPSB0aGlzLnJhZCAtIE1hdGguUEkgLyAyO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsZXQgZHkgPSB0aGlzLmR5O1xyXG4gICAgbGV0IGR4ID0gdGhpcy5keDtcclxuICAgIGNvbnN0IHN0ZXAgPSB0aGlzLnN0ZXA7XHJcbiAgICBcclxuICAgIGlmKHNlbGYueHJldil7XHJcbiAgICAgIGR4ID0gLWR4OyAgICAgIFxyXG4gICAgfVxyXG4gICAgbGV0IGNhbmNlbCA9IGZhbHNlO1xyXG4gICAgZm9yKGxldCBpID0gMDtpIDwgc3RlcCAmJiAhY2FuY2VsOysraSl7XHJcbiAgICAgIHNlbGYueCArPSBkeDtcclxuICAgICAgc2VsZi55ICs9IGR5O1xyXG4gICAgICBjYW5jZWwgPSB5aWVsZDtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgdG9KU09OKCl7XHJcbiAgICByZXR1cm4gW1xyXG4gICAgICBcIkxpbmVNb3ZlXCIsXHJcbiAgICAgIHRoaXMucmFkLFxyXG4gICAgICB0aGlzLnNwZWVkLFxyXG4gICAgICB0aGlzLnN0ZXBcclxuICAgIF07XHJcbiAgfVxyXG4gIFxyXG4gIHN0YXRpYyBmcm9tQXJyYXkoYXJyYXkpXHJcbiAge1xyXG4gICAgcmV0dXJuIG5ldyBMaW5lTW92ZShhcnJheVsxXSxhcnJheVsyXSxhcnJheVszXSk7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g5YaG6YGL5YuVXHJcbmNsYXNzIENpcmNsZU1vdmUge1xyXG4gIGNvbnN0cnVjdG9yKHN0YXJ0UmFkLCBzdG9wUmFkLCByLCBzcGVlZCwgbGVmdCkge1xyXG4gICAgdGhpcy5zdGFydFJhZCA9IChzdGFydFJhZCB8fCAwKTtcclxuICAgIHRoaXMuc3RvcFJhZCA9ICAoc3RvcFJhZCB8fCAwKTtcclxuICAgIHRoaXMuciA9IHIgfHwgMDtcclxuICAgIHRoaXMuc3BlZWQgPSBzcGVlZCB8fCAwO1xyXG4gICAgdGhpcy5sZWZ0ID0gIWxlZnQgPyBmYWxzZSA6IHRydWU7XHJcbiAgICB0aGlzLmRlbHRhcyA9IFtdO1xyXG4gICAgdGhpcy5zdGFydFJhZF8gPSB0aGlzLnN0YXJ0UmFkICogTWF0aC5QSTtcclxuICAgIHRoaXMuc3RvcFJhZF8gPSB0aGlzLnN0b3BSYWQgKiBNYXRoLlBJO1xyXG4gICAgdmFyIHJhZCA9IHRoaXMuc3RhcnRSYWRfO1xyXG4gICAgdmFyIHN0ZXAgPSAobGVmdCA/IDEgOiAtMSkgKiBzcGVlZCAvIHI7XHJcbiAgICB2YXIgZW5kID0gZmFsc2U7XHJcbiAgICBcclxuICAgIHdoaWxlICghZW5kKSB7XHJcbiAgICAgIHJhZCArPSBzdGVwO1xyXG4gICAgICBpZiAoKGxlZnQgJiYgKHJhZCA+PSB0aGlzLnN0b3BSYWRfKSkgfHwgKCFsZWZ0ICYmIHJhZCA8PSB0aGlzLnN0b3BSYWRfKSkge1xyXG4gICAgICAgIHJhZCA9IHRoaXMuc3RvcFJhZF87XHJcbiAgICAgICAgZW5kID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmRlbHRhcy5wdXNoKHtcclxuICAgICAgICB4OiB0aGlzLnIgKiBNYXRoLmNvcyhyYWQpLFxyXG4gICAgICAgIHk6IHRoaXMuciAqIE1hdGguc2luKHJhZCksXHJcbiAgICAgICAgcmFkOiByYWRcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgXHJcbiAgKm1vdmUoc2VsZix4LHkpIHtcclxuICAgIC8vIOWIneacn+WMllxyXG4gICAgbGV0IHN4LHN5O1xyXG4gICAgaWYgKHNlbGYueHJldikge1xyXG4gICAgICBzeCA9IHggLSB0aGlzLnIgKiBNYXRoLmNvcyh0aGlzLnN0YXJ0UmFkXyArIE1hdGguUEkpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc3ggPSB4IC0gdGhpcy5yICogTWF0aC5jb3ModGhpcy5zdGFydFJhZF8pO1xyXG4gICAgfVxyXG4gICAgc3kgPSB5IC0gdGhpcy5yICogTWF0aC5zaW4odGhpcy5zdGFydFJhZF8pO1xyXG5cclxuICAgIGxldCBjYW5jZWwgPSBmYWxzZTtcclxuICAgIC8vIOenu+WLlVxyXG4gICAgZm9yKGxldCBpID0gMCxlID0gdGhpcy5kZWx0YXMubGVuZ3RoOyhpIDwgZSkgJiYgIWNhbmNlbDsrK2kpXHJcbiAgICB7XHJcbiAgICAgIHZhciBkZWx0YSA9IHRoaXMuZGVsdGFzW2ldO1xyXG4gICAgICBpZihzZWxmLnhyZXYpe1xyXG4gICAgICAgIHNlbGYueCA9IHN4IC0gZGVsdGEueDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzZWxmLnggPSBzeCArIGRlbHRhLng7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNlbGYueSA9IHN5ICsgZGVsdGEueTtcclxuICAgICAgaWYgKHNlbGYueHJldikge1xyXG4gICAgICAgIHNlbGYuY2hhclJhZCA9IChNYXRoLlBJIC0gZGVsdGEucmFkKSArICh0aGlzLmxlZnQgPyAtMSA6IDApICogTWF0aC5QSTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzZWxmLmNoYXJSYWQgPSBkZWx0YS5yYWQgKyAodGhpcy5sZWZ0ID8gMCA6IC0xKSAqIE1hdGguUEk7XHJcbiAgICAgIH1cclxuICAgICAgc2VsZi5yYWQgPSBkZWx0YS5yYWQ7XHJcbiAgICAgIGNhbmNlbCA9IHlpZWxkO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICB0b0pTT04oKXtcclxuICAgIHJldHVybiBbICdDaXJjbGVNb3ZlJyxcclxuICAgICAgdGhpcy5zdGFydFJhZCxcclxuICAgICAgdGhpcy5zdG9wUmFkLFxyXG4gICAgICB0aGlzLnIsXHJcbiAgICAgIHRoaXMuc3BlZWQsXHJcbiAgICAgIHRoaXMubGVmdFxyXG4gICAgXTtcclxuICB9XHJcbiAgXHJcbiAgc3RhdGljIGZyb21BcnJheShhKXtcclxuICAgIHJldHVybiBuZXcgQ2lyY2xlTW92ZShhWzFdLGFbMl0sYVszXSxhWzRdLGFbNV0pO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOODm+ODvOODoOODneOCuOOCt+ODp+ODs+OBq+aIu+OCi1xyXG5jbGFzcyBHb3RvSG9tZSB7XHJcblxyXG4gKm1vdmUoc2VsZiwgeCwgeSkge1xyXG4gICAgbGV0IHJhZCA9IE1hdGguYXRhbjIoc2VsZi5ob21lWSAtIHNlbGYueSwgc2VsZi5ob21lWCAtIHNlbGYueCk7XHJcbiAgICBsZXQgc3BlZWQgPSA0O1xyXG5cclxuICAgIHNlbGYuY2hhclJhZCA9IHJhZCAtIE1hdGguUEkgLyAyO1xyXG4gICAgbGV0IGR4ID0gTWF0aC5jb3MocmFkKSAqIHNwZWVkO1xyXG4gICAgbGV0IGR5ID0gTWF0aC5zaW4ocmFkKSAqIHNwZWVkO1xyXG4gICAgc2VsZi56ID0gMC4wO1xyXG4gICAgXHJcbiAgICBsZXQgY2FuY2VsID0gZmFsc2U7XHJcbiAgICBmb3IoOyhNYXRoLmFicyhzZWxmLnggLSBzZWxmLmhvbWVYKSA+PSAyIHx8IE1hdGguYWJzKHNlbGYueSAtIHNlbGYuaG9tZVkpID49IDIpICYmICFjYW5jZWxcclxuICAgICAgO3NlbGYueCArPSBkeCxzZWxmLnkgKz0gZHkpXHJcbiAgICB7XHJcbiAgICAgIGNhbmNlbCA9IHlpZWxkO1xyXG4gICAgfVxyXG5cclxuICAgIHNlbGYuY2hhclJhZCA9IDA7XHJcbiAgICBzZWxmLnggPSBzZWxmLmhvbWVYO1xyXG4gICAgc2VsZi55ID0gc2VsZi5ob21lWTtcclxuICAgIGlmIChzZWxmLnN0YXR1cyA9PSBzZWxmLlNUQVJUKSB7XHJcbiAgICAgIHZhciBncm91cElEID0gc2VsZi5ncm91cElEO1xyXG4gICAgICB2YXIgZ3JvdXBEYXRhID0gc2VsZi5lbmVtaWVzLmdyb3VwRGF0YTtcclxuICAgICAgZ3JvdXBEYXRhW2dyb3VwSURdLnB1c2goc2VsZik7XHJcbiAgICAgIHNlbGYuZW5lbWllcy5ob21lRW5lbWllc0NvdW50Kys7XHJcbiAgICB9XHJcbiAgICBzZWxmLnN0YXR1cyA9IHNlbGYuSE9NRTtcclxuICB9XHJcbiAgXHJcbiAgdG9KU09OKCl7XHJcbiAgICByZXR1cm4gWydHb3RvSG9tZSddO1xyXG4gIH1cclxuICBcclxuICBzdGF0aWMgZnJvbUFycmF5KGEpXHJcbiAge1xyXG4gICAgcmV0dXJuIG5ldyBHb3RvSG9tZSgpO1xyXG4gIH1cclxufVxyXG5cclxuXHJcbi8vLyDlvoXmqZ/kuK3jga7mlbXjga7li5XjgY1cclxuY2xhc3MgSG9tZU1vdmV7XHJcbiAgY29uc3RydWN0b3IoKXtcclxuICAgIHRoaXMuQ0VOVEVSX1ggPSAwO1xyXG4gICAgdGhpcy5DRU5URVJfWSA9IDEwMDtcclxuICB9XHJcblxyXG4gICptb3ZlKHNlbGYsIHgsIHkpIHtcclxuXHJcbiAgICBsZXQgZHggPSBzZWxmLmhvbWVYIC0gdGhpcy5DRU5URVJfWDtcclxuICAgIGxldCBkeSA9IHNlbGYuaG9tZVkgLSB0aGlzLkNFTlRFUl9ZO1xyXG4gICAgc2VsZi56ID0gLTAuMTtcclxuXHJcbiAgICB3aGlsZShzZWxmLnN0YXR1cyAhPSBzZWxmLkFUVEFDSylcclxuICAgIHtcclxuICAgICAgc2VsZi54ID0gc2VsZi5ob21lWCArIGR4ICogc2VsZi5lbmVtaWVzLmhvbWVEZWx0YTtcclxuICAgICAgc2VsZi55ID0gc2VsZi5ob21lWSArIGR5ICogc2VsZi5lbmVtaWVzLmhvbWVEZWx0YTtcclxuICAgICAgc2VsZi5tZXNoLnNjYWxlLnggPSBzZWxmLmVuZW1pZXMuaG9tZURlbHRhMjtcclxuICAgICAgeWllbGQ7XHJcbiAgICB9XHJcblxyXG4gICAgc2VsZi5tZXNoLnNjYWxlLnggPSAxLjA7XHJcbiAgICBzZWxmLnogPSAwLjA7XHJcblxyXG4gIH1cclxuICBcclxuICB0b0pTT04oKXtcclxuICAgIHJldHVybiBbJ0hvbWVNb3ZlJ107XHJcbiAgfVxyXG4gIFxyXG4gIHN0YXRpYyBmcm9tQXJyYXkoYSlcclxuICB7XHJcbiAgICByZXR1cm4gbmV3IEhvbWVNb3ZlKCk7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g5oyH5a6a44K344O844Kx44Oz44K544Gr56e75YuV44GZ44KLXHJcbmNsYXNzIEdvdG8ge1xyXG4gIGNvbnN0cnVjdG9yKHBvcykgeyB0aGlzLnBvcyA9IHBvczsgfTtcclxuICAqbW92ZShzZWxmLCB4LCB5KSB7XHJcbiAgICBzZWxmLmluZGV4ID0gdGhpcy5wb3MgLSAxO1xyXG4gIH1cclxuICBcclxuICB0b0pTT04oKXtcclxuICAgIHJldHVybiBbXHJcbiAgICAgICdHb3RvJyxcclxuICAgICAgdGhpcy5wb3NcclxuICAgIF07XHJcbiAgfVxyXG4gIFxyXG4gIHN0YXRpYyBmcm9tQXJyYXkoYSl7XHJcbiAgICByZXR1cm4gbmV3IEdvdG8oYVsxXSk7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g5pW15by+55m65bCEXHJcbmNsYXNzIEZpcmUge1xyXG4gICptb3ZlKHNlbGYsIHgsIHkpIHtcclxuICAgIGxldCBkID0gKHNmZy5zdGFnZS5ubyAvIDIwKSAqICggc2ZnLnN0YWdlLmRpZmZpY3VsdHkpO1xyXG4gICAgaWYgKGQgPiAxKSB7IGQgPSAxLjA7fVxyXG4gICAgaWYgKE1hdGgucmFuZG9tKCkgPCBkKSB7XHJcbiAgICAgIHNlbGYuZW5lbWllcy5lbmVteUJ1bGxldHMuc3RhcnQoc2VsZi54LCBzZWxmLnkpO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICB0b0pTT04oKXtcclxuICAgIHJldHVybiBbJ0ZpcmUnXTtcclxuICB9XHJcbiAgXHJcbiAgc3RhdGljIGZyb21BcnJheShhKVxyXG4gIHtcclxuICAgIHJldHVybiBuZXcgRmlyZSgpO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOaVteacrOS9k1xyXG5leHBvcnQgY2xhc3MgRW5lbXkgZXh0ZW5kcyBnYW1lb2JqLkdhbWVPYmogeyBcclxuICBjb25zdHJ1Y3RvcihlbmVtaWVzLHNjZW5lLHNlKSB7XHJcbiAgc3VwZXIoMCwgMCwgMCk7XHJcbiAgdGhpcy5OT05FID0gIDAgO1xyXG4gIHRoaXMuU1RBUlQgPSAgMSA7XHJcbiAgdGhpcy5IT01FID0gIDIgO1xyXG4gIHRoaXMuQVRUQUNLID0gIDMgO1xyXG4gIHRoaXMuQk9NQiA9ICA0IDtcclxuICB0aGlzLmNvbGxpc2lvbkFyZWEud2lkdGggPSAxMjtcclxuICB0aGlzLmNvbGxpc2lvbkFyZWEuaGVpZ2h0ID0gODtcclxuICB2YXIgdGV4ID0gc2ZnLnRleHR1cmVGaWxlcy5lbmVteTtcclxuICB2YXIgbWF0ZXJpYWwgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVNYXRlcmlhbCh0ZXgpO1xyXG4gIHZhciBnZW9tZXRyeSA9IGdyYXBoaWNzLmNyZWF0ZVNwcml0ZUdlb21ldHJ5KDE2KTtcclxuICBncmFwaGljcy5jcmVhdGVTcHJpdGVVVihnZW9tZXRyeSwgdGV4LCAxNiwgMTYsIDApO1xyXG4gIHRoaXMubWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgdGhpcy5ncm91cElEID0gMDtcclxuICB0aGlzLnogPSAwLjA7XHJcbiAgdGhpcy5pbmRleCA9IDA7XHJcbiAgdGhpcy5zY29yZSA9IDA7XHJcbiAgdGhpcy5tdlBhdHRlcm4gPSBudWxsO1xyXG4gIHRoaXMubXYgPSBudWxsO1xyXG4gIHRoaXMubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcbiAgdGhpcy5zdGF0dXMgPSB0aGlzLk5PTkU7XHJcbiAgdGhpcy50eXBlID0gbnVsbDtcclxuICB0aGlzLmxpZmUgPSAwO1xyXG4gIHRoaXMudGFzayA9IG51bGw7XHJcbiAgdGhpcy5oaXRfID0gbnVsbDtcclxuICB0aGlzLnNjZW5lID0gc2NlbmU7XHJcbiAgdGhpcy5zY2VuZS5hZGQodGhpcy5tZXNoKTtcclxuICB0aGlzLnNlID0gc2U7XHJcbiAgdGhpcy5lbmVtaWVzID0gZW5lbWllcztcclxufVxyXG5cclxuICBnZXQgeCgpIHsgcmV0dXJuIHRoaXMueF87IH1cclxuICBzZXQgeCh2KSB7IHRoaXMueF8gPSB0aGlzLm1lc2gucG9zaXRpb24ueCA9IHY7IH1cclxuICBnZXQgeSgpIHsgcmV0dXJuIHRoaXMueV87IH1cclxuICBzZXQgeSh2KSB7IHRoaXMueV8gPSB0aGlzLm1lc2gucG9zaXRpb24ueSA9IHY7IH1cclxuICBnZXQgeigpIHsgcmV0dXJuIHRoaXMuel87IH1cclxuICBzZXQgeih2KSB7IHRoaXMuel8gPSB0aGlzLm1lc2gucG9zaXRpb24ueiA9IHY7IH1cclxuICBcclxuICAvLy/mlbXjga7li5XjgY1cclxuICAqbW92ZSh0YXNrSW5kZXgpIHtcclxuICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gICAgd2hpbGUgKHRhc2tJbmRleCA+PSAwKXtcclxuICAgICAgd2hpbGUoIXRoaXMubXYubmV4dCgpLmRvbmUgJiYgdGFza0luZGV4ID49IDApXHJcbiAgICAgIHtcclxuICAgICAgICB0aGlzLm1lc2guc2NhbGUueCA9IHRoaXMuZW5lbWllcy5ob21lRGVsdGEyO1xyXG4gICAgICAgIHRoaXMubWVzaC5yb3RhdGlvbi56ID0gdGhpcy5jaGFyUmFkO1xyXG4gICAgICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgaWYodGFza0luZGV4IDwgMCl7XHJcbiAgICAgICAgdGFza0luZGV4ID0gLSgrK3Rhc2tJbmRleCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBsZXQgZW5kID0gZmFsc2U7XHJcbiAgICAgIHdoaWxlICghZW5kKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaW5kZXggPCAodGhpcy5tdlBhdHRlcm4ubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgICAgIHRoaXMuaW5kZXgrKztcclxuICAgICAgICAgIHRoaXMubXYgPSB0aGlzLm12UGF0dGVyblt0aGlzLmluZGV4XS5tb3ZlKHRoaXMsdGhpcy54LHRoaXMueSk7XHJcbiAgICAgICAgICBlbmQgPSAhdGhpcy5tdi5uZXh0KCkuZG9uZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHRoaXMubWVzaC5zY2FsZS54ID0gdGhpcy5lbmVtaWVzLmhvbWVEZWx0YTI7XHJcbiAgICAgIHRoaXMubWVzaC5yb3RhdGlvbi56ID0gdGhpcy5jaGFyUmFkO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICAvLy8g5Yid5pyf5YyWXHJcbiAgc3RhcnQoeCwgeSwgeiwgaG9tZVgsIGhvbWVZLCBtdlBhdHRlcm4sIHhyZXYsdHlwZSwgY2xlYXJUYXJnZXQsZ3JvdXBJRCkge1xyXG4gICAgaWYgKHRoaXMuZW5hYmxlXykge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xyXG4gICAgdHlwZSh0aGlzKTtcclxuICAgIHRoaXMueCA9IHg7XHJcbiAgICB0aGlzLnkgPSB5O1xyXG4gICAgdGhpcy56ID0gejtcclxuICAgIHRoaXMueHJldiA9IHhyZXY7XHJcbiAgICB0aGlzLmVuYWJsZV8gPSB0cnVlO1xyXG4gICAgdGhpcy5ob21lWCA9IGhvbWVYIHx8IDA7XHJcbiAgICB0aGlzLmhvbWVZID0gaG9tZVkgfHwgMDtcclxuICAgIHRoaXMuaW5kZXggPSAwO1xyXG4gICAgdGhpcy5ncm91cElEID0gZ3JvdXBJRDtcclxuICAgIHRoaXMubXZQYXR0ZXJuID0gbXZQYXR0ZXJuO1xyXG4gICAgdGhpcy5jbGVhclRhcmdldCA9IGNsZWFyVGFyZ2V0IHx8IHRydWU7XHJcbiAgICB0aGlzLm1lc2gubWF0ZXJpYWwuY29sb3Iuc2V0SGV4KDB4RkZGRkZGKTtcclxuICAgIHRoaXMubXYgPSBtdlBhdHRlcm5bMF0ubW92ZSh0aGlzLHgseSk7XHJcbiAgICAvL3RoaXMubXYuc3RhcnQodGhpcywgeCwgeSk7XHJcbiAgICAvL2lmICh0aGlzLnN0YXR1cyAhPSB0aGlzLk5PTkUpIHtcclxuICAgIC8vICBkZWJ1Z2dlcjtcclxuICAgIC8vfVxyXG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLlNUQVJUO1xyXG4gICAgdGhpcy50YXNrID0gc2ZnLnRhc2tzLnB1c2hUYXNrKHRoaXMubW92ZS5iaW5kKHRoaXMpLCAxMDAwMCk7XHJcbiAgICBpZih0aGlzLnRhc2suaW5kZXggPT0gMCl7XHJcbiAgICAgIGRlYnVnZ2VyO1xyXG4gICAgfVxyXG4gICAgdGhpcy5tZXNoLnZpc2libGUgPSB0cnVlO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG4gIFxyXG4gIGhpdChteWJ1bGxldCkge1xyXG4gICAgaWYgKHRoaXMuaGl0XyA9PSBudWxsKSB7XHJcbiAgICAgIGxldCBsaWZlID0gdGhpcy5saWZlO1xyXG4gICAgICB0aGlzLmxpZmUgLT0gbXlidWxsZXQucG93ZXIgfHwgMTtcclxuICAgICAgbXlidWxsZXQucG93ZXIgLT0gbGlmZTsgXHJcbi8vICAgICAgdGhpcy5saWZlLS07XHJcbiAgICAgIGlmICh0aGlzLmxpZmUgPD0gMCkge1xyXG4gICAgICAgIHNmZy5ib21icy5zdGFydCh0aGlzLngsIHRoaXMueSk7XHJcbiAgICAgICAgdGhpcy5zZSgxKTtcclxuICAgICAgICBzZmcuYWRkU2NvcmUodGhpcy5zY29yZSk7XHJcbiAgICAgICAgaWYgKHRoaXMuY2xlYXJUYXJnZXQpIHtcclxuICAgICAgICAgIHRoaXMuZW5lbWllcy5oaXRFbmVtaWVzQ291bnQrKztcclxuICAgICAgICAgIGlmICh0aGlzLnN0YXR1cyA9PSB0aGlzLlNUQVJUKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZW5lbWllcy5ob21lRW5lbWllc0NvdW50Kys7XHJcbiAgICAgICAgICAgIHRoaXMuZW5lbWllcy5ncm91cERhdGFbdGhpcy5ncm91cElEXS5wdXNoKHRoaXMpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5lbmVtaWVzLmdyb3VwRGF0YVt0aGlzLmdyb3VwSURdLmdvbmVDb3VudCsrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0aGlzLnRhc2suaW5kZXggPT0gMCl7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnaGl0Jyx0aGlzLnRhc2suaW5kZXgpO1xyXG4gICAgICAgICAgZGVidWdnZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLm1lc2gudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuZW5hYmxlXyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuc3RhdHVzID0gdGhpcy5OT05FO1xyXG4gICAgICAgIHNmZy50YXNrcy5hcnJheVt0aGlzLnRhc2suaW5kZXhdLmdlbkluc3QubmV4dCgtKHRoaXMudGFzay5pbmRleCArIDEpKTtcclxuICAgICAgICBzZmcudGFza3MucmVtb3ZlVGFzayh0aGlzLnRhc2suaW5kZXgpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuc2UoMik7XHJcbiAgICAgICAgdGhpcy5tZXNoLm1hdGVyaWFsLmNvbG9yLnNldEhleCgweEZGODA4MCk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuaGl0XyhteWJ1bGxldCk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBaYWtvKHNlbGYpIHtcclxuICBzZWxmLnNjb3JlID0gNTA7XHJcbiAgc2VsZi5saWZlID0gMTtcclxuICBncmFwaGljcy51cGRhdGVTcHJpdGVVVihzZWxmLm1lc2guZ2VvbWV0cnksIHNmZy50ZXh0dXJlRmlsZXMuZW5lbXksIDE2LCAxNiwgNyk7XHJcbn1cclxuXHJcblpha28udG9KU09OID0gZnVuY3Rpb24gKClcclxue1xyXG4gIHJldHVybiAnWmFrbyc7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFpha28xKHNlbGYpIHtcclxuICBzZWxmLnNjb3JlID0gMTAwO1xyXG4gIHNlbGYubGlmZSA9IDE7XHJcbiAgZ3JhcGhpY3MudXBkYXRlU3ByaXRlVVYoc2VsZi5tZXNoLmdlb21ldHJ5LCBzZmcudGV4dHVyZUZpbGVzLmVuZW15LCAxNiwgMTYsIDYpO1xyXG59XHJcblxyXG5aYWtvMS50b0pTT04gPSBmdW5jdGlvbiAoKVxyXG57XHJcbiAgcmV0dXJuICdaYWtvMSc7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIE1Cb3NzKHNlbGYpIHtcclxuICBzZWxmLnNjb3JlID0gMzAwO1xyXG4gIHNlbGYubGlmZSA9IDI7XHJcbiAgc2VsZi5tZXNoLmJsZW5kaW5nID0gVEhSRUUuTm9ybWFsQmxlbmRpbmc7XHJcbiAgZ3JhcGhpY3MudXBkYXRlU3ByaXRlVVYoc2VsZi5tZXNoLmdlb21ldHJ5LCBzZmcudGV4dHVyZUZpbGVzLmVuZW15LCAxNiwgMTYsIDQpO1xyXG59XHJcblxyXG5NQm9zcy50b0pTT04gPSBmdW5jdGlvbiAoKVxyXG57XHJcbiAgcmV0dXJuICdNQm9zcyc7XHJcbn1cclxuXHJcblxyXG5leHBvcnQgY2xhc3MgRW5lbWllc3tcclxuICBjb25zdHJ1Y3RvcihzY2VuZSwgc2UsIGVuZW15QnVsbGV0cykge1xyXG4gICAgdGhpcy5lbmVteUJ1bGxldHMgPSBlbmVteUJ1bGxldHM7XHJcbiAgICB0aGlzLnNjZW5lID0gc2NlbmU7XHJcbiAgICB0aGlzLm5leHRUaW1lID0gMDtcclxuICAgIHRoaXMuY3VycmVudEluZGV4ID0gMDtcclxuICAgIHRoaXMuZW5lbWllcyA9IG5ldyBBcnJheSgwKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNjQ7ICsraSkge1xyXG4gICAgICB0aGlzLmVuZW1pZXMucHVzaChuZXcgRW5lbXkodGhpcywgc2NlbmUsIHNlKSk7XHJcbiAgICB9XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDU7ICsraSkge1xyXG4gICAgICB0aGlzLmdyb3VwRGF0YVtpXSA9IG5ldyBBcnJheSgwKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vLyDmlbXnt6jpmorjga7li5XjgY3jgpLjgrPjg7Pjg4jjg63jg7zjg6vjgZnjgotcclxuICBtb3ZlKCkge1xyXG4gICAgdmFyIGN1cnJlbnRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZTtcclxuICAgIHZhciBtb3ZlU2VxcyA9IHRoaXMubW92ZVNlcXM7XHJcbiAgICB2YXIgbGVuID0gbW92ZVNlcXNbc2ZnLnN0YWdlLnByaXZhdGVOb10ubGVuZ3RoO1xyXG4gICAgLy8g44OH44O844K/6YWN5YiX44KS44KC44Go44Gr5pW144KS55Sf5oiQXHJcbiAgICB3aGlsZSAodGhpcy5jdXJyZW50SW5kZXggPCBsZW4pIHtcclxuICAgICAgdmFyIGRhdGEgPSBtb3ZlU2Vxc1tzZmcuc3RhZ2UucHJpdmF0ZU5vXVt0aGlzLmN1cnJlbnRJbmRleF07XHJcbiAgICAgIHZhciBuZXh0VGltZSA9IHRoaXMubmV4dFRpbWUgIT0gbnVsbCA/IHRoaXMubmV4dFRpbWUgOiBkYXRhWzBdO1xyXG4gICAgICBpZiAoY3VycmVudFRpbWUgPj0gKHRoaXMubmV4dFRpbWUgKyBkYXRhWzBdKSkge1xyXG4gICAgICAgIHZhciBlbmVtaWVzID0gdGhpcy5lbmVtaWVzO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBlID0gZW5lbWllcy5sZW5ndGg7IGkgPCBlOyArK2kpIHtcclxuICAgICAgICAgIHZhciBlbmVteSA9IGVuZW1pZXNbaV07XHJcbiAgICAgICAgICBpZiAoIWVuZW15LmVuYWJsZV8pIHtcclxuICAgICAgICAgICAgZW5lbXkuc3RhcnQoZGF0YVsxXSwgZGF0YVsyXSwgMCwgZGF0YVszXSwgZGF0YVs0XSwgdGhpcy5tb3ZlUGF0dGVybnNbTWF0aC5hYnMoZGF0YVs1XSldLCBkYXRhWzVdIDwgMCwgZGF0YVs2XSwgZGF0YVs3XSwgZGF0YVs4XSB8fCAwKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY3VycmVudEluZGV4Kys7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudEluZGV4IDwgbGVuKSB7XHJcbiAgICAgICAgICB0aGlzLm5leHRUaW1lID0gY3VycmVudFRpbWUgKyBtb3ZlU2Vxc1tzZmcuc3RhZ2UucHJpdmF0ZU5vXVt0aGlzLmN1cnJlbnRJbmRleF1bMF07XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyDjg5vjg7zjg6Djg53jgrjjgrfjg6fjg7PjgavmlbXjgYzjgZnjgbnjgabmlbTliJfjgZfjgZ/jgYvnorroqo3jgZnjgovjgIJcclxuICAgIGlmICh0aGlzLmhvbWVFbmVtaWVzQ291bnQgPT0gdGhpcy50b3RhbEVuZW1pZXNDb3VudCAmJiB0aGlzLnN0YXR1cyA9PSB0aGlzLlNUQVJUKSB7XHJcbiAgICAgIC8vIOaVtOWIl+OBl+OBpuOBhOOBn+OCieaVtOWIl+ODouODvOODieOBq+enu+ihjOOBmeOCi+OAglxyXG4gICAgICB0aGlzLnN0YXR1cyA9IHRoaXMuSE9NRTtcclxuICAgICAgdGhpcy5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDAuNSAqICgyLjAgLSBzZmcuc3RhZ2UuZGlmZmljdWx0eSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8g44Ob44O844Og44Od44K444K344On44Oz44Gn5LiA5a6a5pmC6ZaT5b6F5qmf44GZ44KLXHJcbiAgICBpZiAodGhpcy5zdGF0dXMgPT0gdGhpcy5IT01FKSB7XHJcbiAgICAgIGlmIChzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lID4gdGhpcy5lbmRUaW1lKSB7XHJcbiAgICAgICAgdGhpcy5zdGF0dXMgPSB0aGlzLkFUVEFDSztcclxuICAgICAgICB0aGlzLmVuZFRpbWUgPSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lICsgKHNmZy5zdGFnZS5ESUZGSUNVTFRZX01BWCAtIHNmZy5zdGFnZS5kaWZmaWN1bHR5KSAqIDM7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IDA7XHJcbiAgICAgICAgdGhpcy5jb3VudCA9IDA7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyDmlLvmkoPjgZnjgotcclxuICAgIGlmICh0aGlzLnN0YXR1cyA9PSB0aGlzLkFUVEFDSyAmJiBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lID4gdGhpcy5lbmRUaW1lKSB7XHJcbiAgICAgIHRoaXMuZW5kVGltZSA9IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgKyAoc2ZnLnN0YWdlLkRJRkZJQ1VMVFlfTUFYIC0gc2ZnLnN0YWdlLmRpZmZpY3VsdHkpICogMztcclxuICAgICAgdmFyIGdyb3VwRGF0YSA9IHRoaXMuZ3JvdXBEYXRhO1xyXG4gICAgICB2YXIgYXR0YWNrQ291bnQgPSAoMSArIDAuMjUgKiAoc2ZnLnN0YWdlLmRpZmZpY3VsdHkpKSB8IDA7XHJcbiAgICAgIHZhciBncm91cCA9IGdyb3VwRGF0YVt0aGlzLmdyb3VwXTtcclxuXHJcbiAgICAgIGlmICghZ3JvdXAgfHwgZ3JvdXAubGVuZ3RoID09IDApIHtcclxuICAgICAgICB0aGlzLmdyb3VwID0gMDtcclxuICAgICAgICB2YXIgZ3JvdXAgPSBncm91cERhdGFbMF07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChncm91cC5sZW5ndGggPiAwICYmIGdyb3VwLmxlbmd0aCA+IGdyb3VwLmdvbmVDb3VudCkge1xyXG4gICAgICAgIGlmICghZ3JvdXAuaW5kZXgpIHtcclxuICAgICAgICAgIGdyb3VwLmluZGV4ID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF0aGlzLmdyb3VwKSB7XHJcbiAgICAgICAgICB2YXIgY291bnQgPSAwLCBlbmRnID0gZ3JvdXAubGVuZ3RoO1xyXG4gICAgICAgICAgd2hpbGUgKGNvdW50IDwgZW5kZyAmJiBhdHRhY2tDb3VudCA+IDApIHtcclxuICAgICAgICAgICAgdmFyIGVuID0gZ3JvdXBbZ3JvdXAuaW5kZXhdO1xyXG4gICAgICAgICAgICBpZiAoZW4uZW5hYmxlXyAmJiBlbi5zdGF0dXMgPT0gZW4uSE9NRSkge1xyXG4gICAgICAgICAgICAgIGVuLnN0YXR1cyA9IGVuLkFUVEFDSztcclxuICAgICAgICAgICAgICAtLWF0dGFja0NvdW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvdW50Kys7XHJcbiAgICAgICAgICAgIGdyb3VwLmluZGV4Kys7XHJcbiAgICAgICAgICAgIGlmIChncm91cC5pbmRleCA+PSBncm91cC5sZW5ndGgpIGdyb3VwLmluZGV4ID0gMDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IGdyb3VwLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgICAgICAgIHZhciBlbiA9IGdyb3VwW2ldO1xyXG4gICAgICAgICAgICBpZiAoZW4uZW5hYmxlXyAmJiBlbi5zdGF0dXMgPT0gZW4uSE9NRSkge1xyXG4gICAgICAgICAgICAgIGVuLnN0YXR1cyA9IGVuLkFUVEFDSztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5ncm91cCsrO1xyXG4gICAgICBpZiAodGhpcy5ncm91cCA+PSB0aGlzLmdyb3VwRGF0YS5sZW5ndGgpIHtcclxuICAgICAgICB0aGlzLmdyb3VwID0gMDtcclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyDjg5vjg7zjg6Djg53jgrjjgrfjg6fjg7Pjgafjga7lvoXmqZ/li5XkvZxcclxuICAgIHRoaXMuaG9tZURlbHRhQ291bnQgKz0gMC4wMjU7XHJcbiAgICB0aGlzLmhvbWVEZWx0YSA9IE1hdGguc2luKHRoaXMuaG9tZURlbHRhQ291bnQpICogMC4wODtcclxuICAgIHRoaXMuaG9tZURlbHRhMiA9IDEuMCArIE1hdGguc2luKHRoaXMuaG9tZURlbHRhQ291bnQgKiA4KSAqIDAuMTtcclxuXHJcbiAgfVxyXG5cclxuICByZXNldCgpIHtcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0aGlzLmVuZW1pZXMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgdmFyIGVuID0gdGhpcy5lbmVtaWVzW2ldO1xyXG4gICAgICBpZiAoZW4uZW5hYmxlXykge1xyXG4gICAgICAgIHNmZy50YXNrcy5yZW1vdmVUYXNrKGVuLnRhc2suaW5kZXgpO1xyXG4gICAgICAgIGVuLnN0YXR1cyA9IGVuLk5PTkU7XHJcbiAgICAgICAgZW4uZW5hYmxlXyA9IGZhbHNlO1xyXG4gICAgICAgIGVuLm1lc2gudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjYWxjRW5lbWllc0NvdW50KCkge1xyXG4gICAgdmFyIHNlcXMgPSB0aGlzLm1vdmVTZXFzW3NmZy5zdGFnZS5wcml2YXRlTm9dO1xyXG4gICAgdGhpcy50b3RhbEVuZW1pZXNDb3VudCA9IDA7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gc2Vxcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgICBpZiAoc2Vxc1tpXVs3XSkge1xyXG4gICAgICAgIHRoaXMudG90YWxFbmVtaWVzQ291bnQrKztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc3RhcnQoKSB7XHJcbiAgICB0aGlzLm5leHRUaW1lID0gMDtcclxuICAgIHRoaXMuY3VycmVudEluZGV4ID0gMDtcclxuICAgIHRoaXMudG90YWxFbmVtaWVzQ291bnQgPSAwO1xyXG4gICAgdGhpcy5oaXRFbmVtaWVzQ291bnQgPSAwO1xyXG4gICAgdGhpcy5ob21lRW5lbWllc0NvdW50ID0gMDtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5TVEFSVDtcclxuICAgIHZhciBncm91cERhdGEgPSB0aGlzLmdyb3VwRGF0YTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSBncm91cERhdGEubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgZ3JvdXBEYXRhW2ldLmxlbmd0aCA9IDA7XHJcbiAgICAgIGdyb3VwRGF0YVtpXS5nb25lQ291bnQgPSAwO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBsb2FkUGF0dGVybnMoKXtcclxuICAgIHRoaXMubW92ZVBhdHRlcm5zID0gW107XHJcbiAgICBsZXQgdGhpc18gPSB0aGlzOyAgICBcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSxyZWplY3QpPT57XHJcbiAgICAgIGQzLmpzb24oJy4vcmVzL2VuZW15TW92ZVBhdHRlcm4uanNvbicsKGVycixkYXRhKT0+e1xyXG4gICAgICAgIGlmKGVycil7XHJcbiAgICAgICAgICByZWplY3QoZXJyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZGF0YS5mb3JFYWNoKChjb21BcnJheSxpKT0+e1xyXG4gICAgICAgICAgbGV0IGNvbSA9IFtdO1xyXG4gICAgICAgICAgdGhpcy5tb3ZlUGF0dGVybnMucHVzaChjb20pO1xyXG4gICAgICAgICAgY29tQXJyYXkuZm9yRWFjaCgoZCxpKT0+e1xyXG4gICAgICAgICAgICBzd2l0Y2goZFswXSl7XHJcbiAgICAgICAgICAgICAgY2FzZSAnTGluZU1vdmUnOlxyXG4gICAgICAgICAgICAgICAgY29tLnB1c2goTGluZU1vdmUuZnJvbUFycmF5KGQpKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgIGNhc2UgJ0NpcmNsZU1vdmUnOlxyXG4gICAgICAgICAgICAgICAgY29tLnB1c2goQ2lyY2xlTW92ZS5mcm9tQXJyYXkoZCkpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgY2FzZSAnR290b0hvbWUnOlxyXG4gICAgICAgICAgICAgICAgY29tLnB1c2goR290b0hvbWUuZnJvbUFycmF5KGQpKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgIGNhc2UgJ0hvbWVNb3ZlJzpcclxuICAgICAgICAgICAgICAgIGNvbS5wdXNoKEhvbWVNb3ZlLmZyb21BcnJheShkKSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICBjYXNlICdHb3RvJzpcclxuICAgICAgICAgICAgICAgIGNvbS5wdXNoKEdvdG8uZnJvbUFycmF5KGQpKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgIGNhc2UgJ0ZpcmUnOlxyXG4gICAgICAgICAgICAgICAgY29tLnB1c2goRmlyZS5mcm9tQXJyYXkoZCkpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuICBcclxuICBsb2FkRm9ybWF0aW9ucygpe1xyXG4gICAgdGhpcy5tb3ZlU2VxcyA9IFtdO1xyXG4gICAgbGV0IGZ1bmNzID0gbmV3IE1hcChbXHJcbiAgICAgIFtcIlpha29cIixaYWtvXSxcclxuICAgICAgW1wiWmFrbzFcIixaYWtvMV0sXHJcbiAgICAgIFtcIk1Cb3NzXCIsTUJvc3NdXHJcbiAgICBdKTtcclxuICAgIGxldCB0aGlzXyA9IHRoaXM7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUscmVqZWN0KT0+e1xyXG4gICAgICBkMy5qc29uKCcuL3Jlcy9lbmVteUZvcm1hdGlvblBhdHRlcm4uanNvbicsKGVycixkYXRhKT0+e1xyXG4gICAgICAgIGlmKGVycikgcmVqZWN0KGVycik7XHJcbiAgICAgICAgZGF0YS5mb3JFYWNoKChmb3JtLGkpPT57XHJcbiAgICAgICAgICBsZXQgc3RhZ2UgPSBbXTtcclxuICAgICAgICAgIHRoaXMubW92ZVNlcXMucHVzaChzdGFnZSk7XHJcbiAgICAgICAgICBmb3JtLmZvckVhY2goKGQsaSk9PntcclxuICAgICAgICAgICAgZFs2XSA9IGZ1bmNzLmdldChkWzZdKTtcclxuICAgICAgICAgICAgc3RhZ2UucHVzaChkKTtcclxuICAgICAgICAgIH0pOyAgICAgICAgICBcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxufVxyXG5cclxuRW5lbWllcy5wcm90b3R5cGUudG90YWxFbmVtaWVzQ291bnQgPSAwO1xyXG5FbmVtaWVzLnByb3RvdHlwZS5oaXRFbmVtaWVzQ291bnQgPSAwO1xyXG5FbmVtaWVzLnByb3RvdHlwZS5ob21lRW5lbWllc0NvdW50ID0gMDtcclxuRW5lbWllcy5wcm90b3R5cGUuaG9tZURlbHRhID0gMDtcclxuRW5lbWllcy5wcm90b3R5cGUuaG9tZURlbHRhQ291bnQgPSAwO1xyXG5FbmVtaWVzLnByb3RvdHlwZS5ob21lRGVsdGEyID0gMDtcclxuRW5lbWllcy5wcm90b3R5cGUuZ3JvdXBEYXRhID0gW107XHJcbkVuZW1pZXMucHJvdG90eXBlLk5PTkUgPSAwIHwgMDtcclxuRW5lbWllcy5wcm90b3R5cGUuU1RBUlQgPSAxIHwgMDtcclxuRW5lbWllcy5wcm90b3R5cGUuSE9NRSA9IDIgfCAwO1xyXG5FbmVtaWVzLnByb3RvdHlwZS5BVFRBQ0sgPSAzIHwgMDtcclxuXHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbi8vXHJcbi8vIFdlIHN0b3JlIG91ciBFRSBvYmplY3RzIGluIGEgcGxhaW4gb2JqZWN0IHdob3NlIHByb3BlcnRpZXMgYXJlIGV2ZW50IG5hbWVzLlxyXG4vLyBJZiBgT2JqZWN0LmNyZWF0ZShudWxsKWAgaXMgbm90IHN1cHBvcnRlZCB3ZSBwcmVmaXggdGhlIGV2ZW50IG5hbWVzIHdpdGggYVxyXG4vLyBgfmAgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIGJ1aWx0LWluIG9iamVjdCBwcm9wZXJ0aWVzIGFyZSBub3Qgb3ZlcnJpZGRlbiBvclxyXG4vLyB1c2VkIGFzIGFuIGF0dGFjayB2ZWN0b3IuXHJcbi8vIFdlIGFsc28gYXNzdW1lIHRoYXQgYE9iamVjdC5jcmVhdGUobnVsbClgIGlzIGF2YWlsYWJsZSB3aGVuIHRoZSBldmVudCBuYW1lXHJcbi8vIGlzIGFuIEVTNiBTeW1ib2wuXHJcbi8vXHJcbnZhciBwcmVmaXggPSB0eXBlb2YgT2JqZWN0LmNyZWF0ZSAhPT0gJ2Z1bmN0aW9uJyA/ICd+JyA6IGZhbHNlO1xyXG5cclxuLyoqXHJcbiAqIFJlcHJlc2VudGF0aW9uIG9mIGEgc2luZ2xlIEV2ZW50RW1pdHRlciBmdW5jdGlvbi5cclxuICpcclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gRXZlbnQgaGFuZGxlciB0byBiZSBjYWxsZWQuXHJcbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgQ29udGV4dCBmb3IgZnVuY3Rpb24gZXhlY3V0aW9uLlxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG9uY2UgT25seSBlbWl0IG9uY2VcclxuICogQGFwaSBwcml2YXRlXHJcbiAqL1xyXG5mdW5jdGlvbiBFRShmbiwgY29udGV4dCwgb25jZSkge1xyXG4gIHRoaXMuZm4gPSBmbjtcclxuICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xyXG4gIHRoaXMub25jZSA9IG9uY2UgfHwgZmFsc2U7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBNaW5pbWFsIEV2ZW50RW1pdHRlciBpbnRlcmZhY2UgdGhhdCBpcyBtb2xkZWQgYWdhaW5zdCB0aGUgTm9kZS5qc1xyXG4gKiBFdmVudEVtaXR0ZXIgaW50ZXJmYWNlLlxyXG4gKlxyXG4gKiBAY29uc3RydWN0b3JcclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHsgLyogTm90aGluZyB0byBzZXQgKi8gfVxyXG5cclxuLyoqXHJcbiAqIEhvbGRzIHRoZSBhc3NpZ25lZCBFdmVudEVtaXR0ZXJzIGJ5IG5hbWUuXHJcbiAqXHJcbiAqIEB0eXBlIHtPYmplY3R9XHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XHJcblxyXG4vKipcclxuICogUmV0dXJuIGEgbGlzdCBvZiBhc3NpZ25lZCBldmVudCBsaXN0ZW5lcnMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnRzIHRoYXQgc2hvdWxkIGJlIGxpc3RlZC5cclxuICogQHBhcmFtIHtCb29sZWFufSBleGlzdHMgV2Ugb25seSBuZWVkIHRvIGtub3cgaWYgdGhlcmUgYXJlIGxpc3RlbmVycy5cclxuICogQHJldHVybnMge0FycmF5fEJvb2xlYW59XHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uIGxpc3RlbmVycyhldmVudCwgZXhpc3RzKSB7XHJcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnRcclxuICAgICwgYXZhaWxhYmxlID0gdGhpcy5fZXZlbnRzICYmIHRoaXMuX2V2ZW50c1tldnRdO1xyXG5cclxuICBpZiAoZXhpc3RzKSByZXR1cm4gISFhdmFpbGFibGU7XHJcbiAgaWYgKCFhdmFpbGFibGUpIHJldHVybiBbXTtcclxuICBpZiAoYXZhaWxhYmxlLmZuKSByZXR1cm4gW2F2YWlsYWJsZS5mbl07XHJcblxyXG4gIGZvciAodmFyIGkgPSAwLCBsID0gYXZhaWxhYmxlLmxlbmd0aCwgZWUgPSBuZXcgQXJyYXkobCk7IGkgPCBsOyBpKyspIHtcclxuICAgIGVlW2ldID0gYXZhaWxhYmxlW2ldLmZuO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGVlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEVtaXQgYW4gZXZlbnQgdG8gYWxsIHJlZ2lzdGVyZWQgZXZlbnQgbGlzdGVuZXJzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIG5hbWUgb2YgdGhlIGV2ZW50LlxyXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gSW5kaWNhdGlvbiBpZiB3ZSd2ZSBlbWl0dGVkIGFuIGV2ZW50LlxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gZW1pdChldmVudCwgYTEsIGEyLCBhMywgYTQsIGE1KSB7XHJcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XHJcblxyXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbZXZ0XSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW2V2dF1cclxuICAgICwgbGVuID0gYXJndW1lbnRzLmxlbmd0aFxyXG4gICAgLCBhcmdzXHJcbiAgICAsIGk7XHJcblxyXG4gIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgbGlzdGVuZXJzLmZuKSB7XHJcbiAgICBpZiAobGlzdGVuZXJzLm9uY2UpIHRoaXMucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVycy5mbiwgdW5kZWZpbmVkLCB0cnVlKTtcclxuXHJcbiAgICBzd2l0Y2ggKGxlbikge1xyXG4gICAgICBjYXNlIDE6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCksIHRydWU7XHJcbiAgICAgIGNhc2UgMjogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSksIHRydWU7XHJcbiAgICAgIGNhc2UgMzogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIpLCB0cnVlO1xyXG4gICAgICBjYXNlIDQ6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMyksIHRydWU7XHJcbiAgICAgIGNhc2UgNTogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzLCBhNCksIHRydWU7XHJcbiAgICAgIGNhc2UgNjogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzLCBhNCwgYTUpLCB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGZvciAoaSA9IDEsIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0xKTsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xyXG4gICAgfVxyXG5cclxuICAgIGxpc3RlbmVycy5mbi5hcHBseShsaXN0ZW5lcnMuY29udGV4dCwgYXJncyk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHZhciBsZW5ndGggPSBsaXN0ZW5lcnMubGVuZ3RoXHJcbiAgICAgICwgajtcclxuXHJcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgaWYgKGxpc3RlbmVyc1tpXS5vbmNlKSB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcnNbaV0uZm4sIHVuZGVmaW5lZCwgdHJ1ZSk7XHJcblxyXG4gICAgICBzd2l0Y2ggKGxlbikge1xyXG4gICAgICAgIGNhc2UgMTogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQpOyBicmVhaztcclxuICAgICAgICBjYXNlIDI6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhMSk7IGJyZWFrO1xyXG4gICAgICAgIGNhc2UgMzogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGExLCBhMik7IGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICBpZiAoIWFyZ3MpIGZvciAoaiA9IDEsIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0xKTsgaiA8IGxlbjsgaisrKSB7XHJcbiAgICAgICAgICAgIGFyZ3NbaiAtIDFdID0gYXJndW1lbnRzW2pdO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGxpc3RlbmVyc1tpXS5mbi5hcHBseShsaXN0ZW5lcnNbaV0uY29udGV4dCwgYXJncyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlZ2lzdGVyIGEgbmV3IEV2ZW50TGlzdGVuZXIgZm9yIHRoZSBnaXZlbiBldmVudC5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IE5hbWUgb2YgdGhlIGV2ZW50LlxyXG4gKiBAcGFyYW0ge0Z1bmN0b259IGZuIENhbGxiYWNrIGZ1bmN0aW9uLlxyXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IFRoZSBjb250ZXh0IG9mIHRoZSBmdW5jdGlvbi5cclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBmdW5jdGlvbiBvbihldmVudCwgZm4sIGNvbnRleHQpIHtcclxuICB2YXIgbGlzdGVuZXIgPSBuZXcgRUUoZm4sIGNvbnRleHQgfHwgdGhpcylcclxuICAgICwgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcclxuXHJcbiAgaWYgKCF0aGlzLl9ldmVudHMpIHRoaXMuX2V2ZW50cyA9IHByZWZpeCA/IHt9IDogT2JqZWN0LmNyZWF0ZShudWxsKTtcclxuICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdKSB0aGlzLl9ldmVudHNbZXZ0XSA9IGxpc3RlbmVyO1xyXG4gIGVsc2Uge1xyXG4gICAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XS5mbikgdGhpcy5fZXZlbnRzW2V2dF0ucHVzaChsaXN0ZW5lcik7XHJcbiAgICBlbHNlIHRoaXMuX2V2ZW50c1tldnRdID0gW1xyXG4gICAgICB0aGlzLl9ldmVudHNbZXZ0XSwgbGlzdGVuZXJcclxuICAgIF07XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBBZGQgYW4gRXZlbnRMaXN0ZW5lciB0aGF0J3Mgb25seSBjYWxsZWQgb25jZS5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IE5hbWUgb2YgdGhlIGV2ZW50LlxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBDYWxsYmFjayBmdW5jdGlvbi5cclxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBUaGUgY29udGV4dCBvZiB0aGUgZnVuY3Rpb24uXHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbiBvbmNlKGV2ZW50LCBmbiwgY29udGV4dCkge1xyXG4gIHZhciBsaXN0ZW5lciA9IG5ldyBFRShmbiwgY29udGV4dCB8fCB0aGlzLCB0cnVlKVxyXG4gICAgLCBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xyXG5cclxuICBpZiAoIXRoaXMuX2V2ZW50cykgdGhpcy5fZXZlbnRzID0gcHJlZml4ID8ge30gOiBPYmplY3QuY3JlYXRlKG51bGwpO1xyXG4gIGlmICghdGhpcy5fZXZlbnRzW2V2dF0pIHRoaXMuX2V2ZW50c1tldnRdID0gbGlzdGVuZXI7XHJcbiAgZWxzZSB7XHJcbiAgICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdLmZuKSB0aGlzLl9ldmVudHNbZXZ0XS5wdXNoKGxpc3RlbmVyKTtcclxuICAgIGVsc2UgdGhpcy5fZXZlbnRzW2V2dF0gPSBbXHJcbiAgICAgIHRoaXMuX2V2ZW50c1tldnRdLCBsaXN0ZW5lclxyXG4gICAgXTtcclxuICB9XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlbW92ZSBldmVudCBsaXN0ZW5lcnMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgd2Ugd2FudCB0byByZW1vdmUuXHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBsaXN0ZW5lciB0aGF0IHdlIG5lZWQgdG8gZmluZC5cclxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBPbmx5IHJlbW92ZSBsaXN0ZW5lcnMgbWF0Y2hpbmcgdGhpcyBjb250ZXh0LlxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG9uY2UgT25seSByZW1vdmUgb25jZSBsaXN0ZW5lcnMuXHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5cclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKGV2ZW50LCBmbiwgY29udGV4dCwgb25jZSkge1xyXG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xyXG5cclxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW2V2dF0pIHJldHVybiB0aGlzO1xyXG5cclxuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW2V2dF1cclxuICAgICwgZXZlbnRzID0gW107XHJcblxyXG4gIGlmIChmbikge1xyXG4gICAgaWYgKGxpc3RlbmVycy5mbikge1xyXG4gICAgICBpZiAoXHJcbiAgICAgICAgICAgbGlzdGVuZXJzLmZuICE9PSBmblxyXG4gICAgICAgIHx8IChvbmNlICYmICFsaXN0ZW5lcnMub25jZSlcclxuICAgICAgICB8fCAoY29udGV4dCAmJiBsaXN0ZW5lcnMuY29udGV4dCAhPT0gY29udGV4dClcclxuICAgICAgKSB7XHJcbiAgICAgICAgZXZlbnRzLnB1c2gobGlzdGVuZXJzKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGxpc3RlbmVycy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGlmIChcclxuICAgICAgICAgICAgIGxpc3RlbmVyc1tpXS5mbiAhPT0gZm5cclxuICAgICAgICAgIHx8IChvbmNlICYmICFsaXN0ZW5lcnNbaV0ub25jZSlcclxuICAgICAgICAgIHx8IChjb250ZXh0ICYmIGxpc3RlbmVyc1tpXS5jb250ZXh0ICE9PSBjb250ZXh0KVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgZXZlbnRzLnB1c2gobGlzdGVuZXJzW2ldKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vXHJcbiAgLy8gUmVzZXQgdGhlIGFycmF5LCBvciByZW1vdmUgaXQgY29tcGxldGVseSBpZiB3ZSBoYXZlIG5vIG1vcmUgbGlzdGVuZXJzLlxyXG4gIC8vXHJcbiAgaWYgKGV2ZW50cy5sZW5ndGgpIHtcclxuICAgIHRoaXMuX2V2ZW50c1tldnRdID0gZXZlbnRzLmxlbmd0aCA9PT0gMSA/IGV2ZW50c1swXSA6IGV2ZW50cztcclxuICB9IGVsc2Uge1xyXG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1tldnRdO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogUmVtb3ZlIGFsbCBsaXN0ZW5lcnMgb3Igb25seSB0aGUgbGlzdGVuZXJzIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50LlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IHdhbnQgdG8gcmVtb3ZlIGFsbCBsaXN0ZW5lcnMgZm9yLlxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbiByZW1vdmVBbGxMaXN0ZW5lcnMoZXZlbnQpIHtcclxuICBpZiAoIXRoaXMuX2V2ZW50cykgcmV0dXJuIHRoaXM7XHJcblxyXG4gIGlmIChldmVudCkgZGVsZXRlIHRoaXMuX2V2ZW50c1twcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50XTtcclxuICBlbHNlIHRoaXMuX2V2ZW50cyA9IHByZWZpeCA/IHt9IDogT2JqZWN0LmNyZWF0ZShudWxsKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vL1xyXG4vLyBBbGlhcyBtZXRob2RzIG5hbWVzIGJlY2F1c2UgcGVvcGxlIHJvbGwgbGlrZSB0aGF0LlxyXG4vL1xyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9mZiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXI7XHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uO1xyXG5cclxuLy9cclxuLy8gVGhpcyBmdW5jdGlvbiBkb2Vzbid0IGFwcGx5IGFueW1vcmUuXHJcbi8vXHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24gc2V0TWF4TGlzdGVuZXJzKCkge1xyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLy9cclxuLy8gRXhwb3NlIHRoZSBwcmVmaXguXHJcbi8vXHJcbkV2ZW50RW1pdHRlci5wcmVmaXhlZCA9IHByZWZpeDtcclxuXHJcbi8vXHJcbi8vIEV4cG9zZSB0aGUgbW9kdWxlLlxyXG4vL1xyXG5pZiAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiBtb2R1bGUpIHtcclxuICBtb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcclxufVxyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8vdmFyIFNUQUdFX01BWCA9IDE7XHJcbmltcG9ydCAqIGFzIHNmZyBmcm9tICcuL2dsb2JhbCc7XHJcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsJztcclxuaW1wb3J0ICogYXMgYXVkaW8gZnJvbSAnLi9hdWRpbyc7XHJcbi8vaW1wb3J0ICogYXMgc29uZyBmcm9tICcuL3NvbmcnO1xyXG5pbXBvcnQgKiBhcyBncmFwaGljcyBmcm9tICcuL2dyYXBoaWNzJztcclxuaW1wb3J0ICogYXMgaW8gZnJvbSAnLi9pbyc7XHJcbmltcG9ydCAqIGFzIGNvbW0gZnJvbSAnLi9jb21tJztcclxuaW1wb3J0ICogYXMgdGV4dCBmcm9tICcuL3RleHQnO1xyXG5pbXBvcnQgKiBhcyBnYW1lb2JqIGZyb20gJy4vZ2FtZW9iaic7XHJcbmltcG9ydCAqIGFzIG15c2hpcCBmcm9tICcuL215c2hpcCc7XHJcbmltcG9ydCAqIGFzIGVuZW1pZXMgZnJvbSAnLi9lbmVtaWVzJztcclxuaW1wb3J0ICogYXMgZWZmZWN0b2JqIGZyb20gJy4vZWZmZWN0b2JqJztcclxuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICcuL2V2ZW50RW1pdHRlcjMnO1xyXG5cclxuXHJcbmNsYXNzIFNjb3JlRW50cnkge1xyXG4gIGNvbnN0cnVjdG9yKG5hbWUsIHNjb3JlKSB7XHJcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgdGhpcy5zY29yZSA9IHNjb3JlO1xyXG4gIH1cclxufVxyXG5cclxuXHJcbmNsYXNzIFN0YWdlIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKCk7XHJcbiAgICB0aGlzLk1BWCA9IDE7XHJcbiAgICB0aGlzLkRJRkZJQ1VMVFlfTUFYID0gMi4wO1xyXG4gICAgdGhpcy5ubyA9IDE7XHJcbiAgICB0aGlzLnByaXZhdGVObyA9IDA7XHJcbiAgICB0aGlzLmRpZmZpY3VsdHkgPSAxO1xyXG4gIH1cclxuXHJcbiAgcmVzZXQoKSB7XHJcbiAgICB0aGlzLm5vID0gMTtcclxuICAgIHRoaXMucHJpdmF0ZU5vID0gMDtcclxuICAgIHRoaXMuZGlmZmljdWx0eSA9IDE7XHJcbiAgfVxyXG5cclxuICBhZHZhbmNlKCkge1xyXG4gICAgdGhpcy5ubysrO1xyXG4gICAgdGhpcy5wcml2YXRlTm8rKztcclxuICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgfVxyXG5cclxuICBqdW1wKHN0YWdlTm8pIHtcclxuICAgIHRoaXMubm8gPSBzdGFnZU5vO1xyXG4gICAgdGhpcy5wcml2YXRlTm8gPSB0aGlzLm5vIC0gMTtcclxuICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgfVxyXG5cclxuICB1cGRhdGUoKSB7XHJcbiAgICBpZiAodGhpcy5kaWZmaWN1bHR5IDwgdGhpcy5ESUZGSUNVTFRZX01BWCkge1xyXG4gICAgICB0aGlzLmRpZmZpY3VsdHkgPSAxICsgMC4wNSAqICh0aGlzLm5vIC0gMSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMucHJpdmF0ZU5vID49IHRoaXMuTUFYKSB7XHJcbiAgICAgIHRoaXMucHJpdmF0ZU5vID0gMDtcclxuICAvLyAgICB0aGlzLm5vID0gMTtcclxuICAgIH1cclxuICAgIHRoaXMuZW1pdCgndXBkYXRlJyx0aGlzKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBHYW1lIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMuQ09OU09MRV9XSURUSCA9IDA7XHJcbiAgICB0aGlzLkNPTlNPTEVfSEVJR0hUID0gMDtcclxuICAgIHRoaXMuUkVOREVSRVJfUFJJT1JJVFkgPSAxMDAwMDAgfCAwO1xyXG4gICAgdGhpcy5yZW5kZXJlciA9IG51bGw7XHJcbiAgICB0aGlzLnN0YXRzID0gbnVsbDtcclxuICAgIHRoaXMuc2NlbmUgPSBudWxsO1xyXG4gICAgdGhpcy5jYW1lcmEgPSBudWxsO1xyXG4gICAgdGhpcy5hdXRob3IgPSBudWxsO1xyXG4gICAgdGhpcy5wcm9ncmVzcyA9IG51bGw7XHJcbiAgICB0aGlzLnRleHRQbGFuZSA9IG51bGw7XHJcbiAgICB0aGlzLmJhc2ljSW5wdXQgPSBuZXcgaW8uQmFzaWNJbnB1dCgpO1xyXG4gICAgdGhpcy50YXNrcyA9IG5ldyB1dGlsLlRhc2tzKCk7XHJcbiAgICBzZmcudGFza3MgPSB0aGlzLnRhc2tzO1xyXG4gICAgdGhpcy53YXZlR3JhcGggPSBudWxsO1xyXG4gICAgdGhpcy5zdGFydCA9IGZhbHNlO1xyXG4gICAgdGhpcy5iYXNlVGltZSA9IG5ldyBEYXRlO1xyXG4gICAgdGhpcy5kID0gLTAuMjtcclxuICAgIHRoaXMuYXVkaW9fID0gbnVsbDtcclxuICAgIHRoaXMuc2VxdWVuY2VyID0gbnVsbDtcclxuICAgIHRoaXMucGlhbm8gPSBudWxsO1xyXG4gICAgdGhpcy5zY29yZSA9IDA7XHJcbiAgICB0aGlzLmhpZ2hTY29yZSA9IDA7XHJcbiAgICB0aGlzLmhpZ2hTY29yZXMgPSBbXTtcclxuICAgIHRoaXMuaXNIaWRkZW4gPSBmYWxzZTtcclxuICAgIHRoaXMubXlzaGlwXyA9IG51bGw7XHJcbiAgICB0aGlzLmVuZW1pZXMgPSBudWxsO1xyXG4gICAgdGhpcy5lbmVteUJ1bGxldHMgPSBudWxsO1xyXG4gICAgdGhpcy5QSSA9IE1hdGguUEk7XHJcbiAgICB0aGlzLmNvbW1fID0gbnVsbDtcclxuICAgIHRoaXMuaGFuZGxlTmFtZSA9ICcnO1xyXG4gICAgdGhpcy5zdG9yYWdlID0gbnVsbDtcclxuICAgIHRoaXMucmFuayA9IC0xO1xyXG4gICAgdGhpcy5zb3VuZEVmZmVjdHMgPSBudWxsO1xyXG4gICAgdGhpcy5lbnMgPSBudWxsO1xyXG4gICAgdGhpcy5lbmJzID0gbnVsbDtcclxuICAgIHRoaXMuc3RhZ2UgPSBzZmcuc3RhZ2UgPSBuZXcgU3RhZ2UoKTtcclxuICAgIHRoaXMudGl0bGUgPSBudWxsOy8vIOOCv+OCpOODiOODq+ODoeODg+OCt+ODpVxyXG4gICAgdGhpcy5zcGFjZUZpZWxkID0gbnVsbDsvLyDlroflrpnnqbrplpPjg5Hjg7zjg4bjgqPjgq/jg6tcclxuICAgIHRoaXMuZWRpdEhhbmRsZU5hbWUgPSBudWxsO1xyXG4gICAgc2ZnLmFkZFNjb3JlID0gdGhpcy5hZGRTY29yZS5iaW5kKHRoaXMpO1xyXG4gICAgdGhpcy5jaGVja1Zpc2liaWxpdHlBUEkoKTtcclxuICAgIHRoaXMuYXVkaW9fID0gbmV3IGF1ZGlvLkF1ZGlvKCk7XHJcbiAgfVxyXG5cclxuICBleGVjKCkge1xyXG4gICAgXHJcbiAgICBpZiAoIXRoaXMuY2hlY2tCcm93c2VyU3VwcG9ydCgnI2NvbnRlbnQnKSl7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnNlcXVlbmNlciA9IG5ldyBhdWRpby5TZXF1ZW5jZXIodGhpcy5hdWRpb18pO1xyXG4gICAgLy9waWFubyA9IG5ldyBhdWRpby5QaWFubyhhdWRpb18pO1xyXG4gICAgdGhpcy5zb3VuZEVmZmVjdHMgPSBuZXcgYXVkaW8uU291bmRFZmZlY3RzKHRoaXMuc2VxdWVuY2VyKTtcclxuXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKHdpbmRvdy52aXNpYmlsaXR5Q2hhbmdlLCB0aGlzLm9uVmlzaWJpbGl0eUNoYW5nZS5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcbiAgICBzZmcuZ2FtZVRpbWVyID0gbmV3IHV0aWwuR2FtZVRpbWVyKHRoaXMuZ2V0Q3VycmVudFRpbWUuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgLy8vIOOCsuODvOODoOOCs+ODs+OCveODvOODq+OBruWIneacn+WMllxyXG4gICAgdGhpcy5pbml0Q29uc29sZSgpO1xyXG4gICAgdGhpcy5sb2FkUmVzb3VyY2VzKClcclxuICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuc2NlbmUucmVtb3ZlKHRoaXMucHJvZ3Jlc3MubWVzaCk7XHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5zY2VuZSwgdGhpcy5jYW1lcmEpO1xyXG4gICAgICAgIHRoaXMudGFza3MuY2xlYXIoKTtcclxuICAgICAgICB0aGlzLnRhc2tzLnB1c2hUYXNrKHRoaXMuYmFzaWNJbnB1dC51cGRhdGUuYmluZCh0aGlzLmJhc2ljSW5wdXQpKTtcclxuICAgICAgICB0aGlzLnRhc2tzLnB1c2hUYXNrKHRoaXMuaW5pdC5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnN0YXJ0ID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLm1haW4oKTtcclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICBjaGVja1Zpc2liaWxpdHlBUEkoKSB7XHJcbiAgICAvLyBoaWRkZW4g44OX44Ot44OR44OG44Kj44GK44KI44Gz5Y+v6KaW5oCn44Gu5aSJ5pu044Kk44OZ44Oz44OI44Gu5ZCN5YmN44KS6Kit5a6aXHJcbiAgICBpZiAodHlwZW9mIGRvY3VtZW50LmhpZGRlbiAhPT0gXCJ1bmRlZmluZWRcIikgeyAvLyBPcGVyYSAxMi4xMCDjgoQgRmlyZWZveCAxOCDku6XpmY3jgafjgrXjg53jg7zjg4ggXHJcbiAgICAgIHRoaXMuaGlkZGVuID0gXCJoaWRkZW5cIjtcclxuICAgICAgd2luZG93LnZpc2liaWxpdHlDaGFuZ2UgPSBcInZpc2liaWxpdHljaGFuZ2VcIjtcclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRvY3VtZW50Lm1vekhpZGRlbiAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICB0aGlzLmhpZGRlbiA9IFwibW96SGlkZGVuXCI7XHJcbiAgICAgIHdpbmRvdy52aXNpYmlsaXR5Q2hhbmdlID0gXCJtb3p2aXNpYmlsaXR5Y2hhbmdlXCI7XHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkb2N1bWVudC5tc0hpZGRlbiAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICB0aGlzLmhpZGRlbiA9IFwibXNIaWRkZW5cIjtcclxuICAgICAgd2luZG93LnZpc2liaWxpdHlDaGFuZ2UgPSBcIm1zdmlzaWJpbGl0eWNoYW5nZVwiO1xyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZG9jdW1lbnQud2Via2l0SGlkZGVuICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgIHRoaXMuaGlkZGVuID0gXCJ3ZWJraXRIaWRkZW5cIjtcclxuICAgICAgd2luZG93LnZpc2liaWxpdHlDaGFuZ2UgPSBcIndlYmtpdHZpc2liaWxpdHljaGFuZ2VcIjtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgY2FsY1NjcmVlblNpemUoKSB7XHJcbiAgICB2YXIgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcclxuICAgIHZhciBoZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcbiAgICBpZiAod2lkdGggPj0gaGVpZ2h0KSB7XHJcbiAgICAgIHdpZHRoID0gaGVpZ2h0ICogc2ZnLlZJUlRVQUxfV0lEVEggLyBzZmcuVklSVFVBTF9IRUlHSFQ7XHJcbiAgICAgIHdoaWxlICh3aWR0aCA+IHdpbmRvdy5pbm5lcldpZHRoKSB7XHJcbiAgICAgICAgLS1oZWlnaHQ7XHJcbiAgICAgICAgd2lkdGggPSBoZWlnaHQgKiBzZmcuVklSVFVBTF9XSURUSCAvIHNmZy5WSVJUVUFMX0hFSUdIVDtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaGVpZ2h0ID0gd2lkdGggKiBzZmcuVklSVFVBTF9IRUlHSFQgLyBzZmcuVklSVFVBTF9XSURUSDtcclxuICAgICAgd2hpbGUgKGhlaWdodCA+IHdpbmRvdy5pbm5lckhlaWdodCkge1xyXG4gICAgICAgIC0td2lkdGg7XHJcbiAgICAgICAgaGVpZ2h0ID0gd2lkdGggKiBzZmcuVklSVFVBTF9IRUlHSFQgLyBzZmcuVklSVFVBTF9XSURUSDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5DT05TT0xFX1dJRFRIID0gd2lkdGg7XHJcbiAgICB0aGlzLkNPTlNPTEVfSEVJR0hUID0gaGVpZ2h0O1xyXG4gIH1cclxuICBcclxuICAvLy8g44Kz44Oz44K944O844Or55S76Z2i44Gu5Yid5pyf5YyWXHJcbiAgaW5pdENvbnNvbGUoY29uc29sZUNsYXNzKSB7XHJcbiAgICAvLyDjg6zjg7Pjg4Djg6njg7zjga7kvZzmiJBcclxuICAgIHRoaXMucmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcih7IGFudGlhbGlhczogZmFsc2UsIHNvcnRPYmplY3RzOiB0cnVlIH0pO1xyXG4gICAgdmFyIHJlbmRlcmVyID0gdGhpcy5yZW5kZXJlcjtcclxuICAgIHRoaXMuY2FsY1NjcmVlblNpemUoKTtcclxuICAgIHJlbmRlcmVyLnNldFNpemUodGhpcy5DT05TT0xFX1dJRFRILCB0aGlzLkNPTlNPTEVfSEVJR0hUKTtcclxuICAgIHJlbmRlcmVyLnNldENsZWFyQ29sb3IoMCwgMSk7XHJcbiAgICByZW5kZXJlci5kb21FbGVtZW50LmlkID0gJ2NvbnNvbGUnO1xyXG4gICAgcmVuZGVyZXIuZG9tRWxlbWVudC5jbGFzc05hbWUgPSBjb25zb2xlQ2xhc3MgfHwgJ2NvbnNvbGUnO1xyXG4gICAgcmVuZGVyZXIuZG9tRWxlbWVudC5zdHlsZS56SW5kZXggPSAwO1xyXG5cclxuXHJcbiAgICBkMy5zZWxlY3QoJyNjb250ZW50Jykubm9kZSgpLmFwcGVuZENoaWxkKHJlbmRlcmVyLmRvbUVsZW1lbnQpO1xyXG5cclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuY2FsY1NjcmVlblNpemUoKTtcclxuICAgICAgcmVuZGVyZXIuc2V0U2l6ZSh0aGlzLkNPTlNPTEVfV0lEVEgsIHRoaXMuQ09OU09MRV9IRUlHSFQpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8g44K344O844Oz44Gu5L2c5oiQXHJcbiAgICB0aGlzLnNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XHJcblxyXG4gICAgLy8g44Kr44Oh44Op44Gu5L2c5oiQXHJcbiAgICB0aGlzLmNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSg5MC4wLCBzZmcuVklSVFVBTF9XSURUSCAvIHNmZy5WSVJUVUFMX0hFSUdIVCk7XHJcbiAgICB0aGlzLmNhbWVyYS5wb3NpdGlvbi56ID0gc2ZnLlZJUlRVQUxfSEVJR0hUIC8gMjtcclxuICAgIHRoaXMuY2FtZXJhLmxvb2tBdChuZXcgVEhSRUUuVmVjdG9yMygwLCAwLCAwKSk7XHJcblxyXG4gICAgLy8g44Op44Kk44OI44Gu5L2c5oiQXHJcbiAgICAvL3ZhciBsaWdodCA9IG5ldyBUSFJFRS5EaXJlY3Rpb25hbExpZ2h0KDB4ZmZmZmZmKTtcclxuICAgIC8vbGlnaHQucG9zaXRpb24gPSBuZXcgVEhSRUUuVmVjdG9yMygwLjU3NywgMC41NzcsIDAuNTc3KTtcclxuICAgIC8vc2NlbmUuYWRkKGxpZ2h0KTtcclxuXHJcbiAgICAvL3ZhciBhbWJpZW50ID0gbmV3IFRIUkVFLkFtYmllbnRMaWdodCgweGZmZmZmZik7XHJcbiAgICAvL3NjZW5lLmFkZChhbWJpZW50KTtcclxuICAgIHJlbmRlcmVyLmNsZWFyKCk7XHJcbiAgfVxyXG5cclxuICAvLy8g44Ko44Op44O844Gn57WC5LqG44GZ44KL44CCXHJcbiAgRXhpdEVycm9yKGUpIHtcclxuICAgIC8vY3R4LmZpbGxTdHlsZSA9IFwicmVkXCI7XHJcbiAgICAvL2N0eC5maWxsUmVjdCgwLCAwLCBDT05TT0xFX1dJRFRILCBDT05TT0xFX0hFSUdIVCk7XHJcbiAgICAvL2N0eC5maWxsU3R5bGUgPSBcIndoaXRlXCI7XHJcbiAgICAvL2N0eC5maWxsVGV4dChcIkVycm9yIDogXCIgKyBlLCAwLCAyMCk7XHJcbiAgICAvLy8vYWxlcnQoZSk7XHJcbiAgICB0aGlzLnN0YXJ0ID0gZmFsc2U7XHJcbiAgICB0aHJvdyBlO1xyXG4gIH1cclxuXHJcbiAgb25WaXNpYmlsaXR5Q2hhbmdlKCkge1xyXG4gICAgdmFyIGggPSBkb2N1bWVudFt0aGlzLmhpZGRlbl07XHJcbiAgICB0aGlzLmlzSGlkZGVuID0gaDtcclxuICAgIGlmIChoKSB7XHJcbiAgICAgIHRoaXMucGF1c2UoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMucmVzdW1lKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwYXVzZSgpIHtcclxuICAgIGlmIChzZmcuZ2FtZVRpbWVyLnN0YXR1cyA9PSBzZmcuZ2FtZVRpbWVyLlNUQVJUKSB7XHJcbiAgICAgIHNmZy5nYW1lVGltZXIucGF1c2UoKTtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnNlcXVlbmNlci5zdGF0dXMgPT0gdGhpcy5zZXF1ZW5jZXIuUExBWSkge1xyXG4gICAgICB0aGlzLnNlcXVlbmNlci5wYXVzZSgpO1xyXG4gICAgfVxyXG4gICAgc2ZnLnBhdXNlID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIHJlc3VtZSgpIHtcclxuICAgIGlmIChzZmcuZ2FtZVRpbWVyLnN0YXR1cyA9PSBzZmcuZ2FtZVRpbWVyLlBBVVNFKSB7XHJcbiAgICAgIHNmZy5nYW1lVGltZXIucmVzdW1lKCk7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5zZXF1ZW5jZXIuc3RhdHVzID09IHRoaXMuc2VxdWVuY2VyLlBBVVNFKSB7XHJcbiAgICAgIHRoaXMuc2VxdWVuY2VyLnJlc3VtZSgpO1xyXG4gICAgfVxyXG4gICAgc2ZnLnBhdXNlID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvLy8g54++5Zyo5pmC6ZaT44Gu5Y+W5b6XXHJcbiAgZ2V0Q3VycmVudFRpbWUoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5hdWRpb18uYXVkaW9jdHguY3VycmVudFRpbWU7XHJcbiAgfVxyXG5cclxuICAvLy8g44OW44Op44Km44K244Gu5qmf6IO944OB44Kn44OD44KvXHJcbiAgY2hlY2tCcm93c2VyU3VwcG9ydCgpIHtcclxuICAgIHZhciBjb250ZW50ID0gJzxpbWcgY2xhc3M9XCJlcnJvcmltZ1wiIHNyYz1cImh0dHA6Ly9wdWJsaWMuYmx1LmxpdmVmaWxlc3RvcmUuY29tL3kycGJZM2FxQno2d3o0YWg4N1JYRVZrNUNsaEQyTHVqQzVOczY2SEt2Ujg5YWpyRmRMTTBUeEZlcllZVVJ0ODNjX2JnMzVIU2txYzNFOEd4YUZEOC1YOTRNTHNGVjVHVTZCWXAxOTVJdmVnZXZRLzIwMTMxMDAxLnBuZz9wc2lkPTFcIiB3aWR0aD1cIjQ3OVwiIGhlaWdodD1cIjY0MFwiIGNsYXNzPVwiYWxpZ25ub25lXCIgLz4nO1xyXG4gICAgLy8gV2ViR0zjga7jgrXjg53jg7zjg4jjg4Hjgqfjg4Pjgq9cclxuICAgIGlmICghRGV0ZWN0b3Iud2ViZ2wpIHtcclxuICAgICAgZDMuc2VsZWN0KCcjY29udGVudCcpLmFwcGVuZCgnZGl2JykuY2xhc3NlZCgnZXJyb3InLCB0cnVlKS5odG1sKFxyXG4gICAgICAgIGNvbnRlbnQgKyAnPHAgY2xhc3M9XCJlcnJvcnRleHRcIj7jg5bjg6njgqbjgrbjgYw8YnIvPldlYkdM44KS44K144Od44O844OI44GX44Gm44GE44Gq44GE44Gf44KBPGJyLz7li5XkvZzjgYTjgZ/jgZfjgb7jgZvjgpPjgII8L3A+Jyk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBXZWIgQXVkaW8gQVBJ44Op44OD44OR44O8XHJcbiAgICBpZiAoIXRoaXMuYXVkaW9fLmVuYWJsZSkge1xyXG4gICAgICBkMy5zZWxlY3QoJyNjb250ZW50JykuYXBwZW5kKCdkaXYnKS5jbGFzc2VkKCdlcnJvcicsIHRydWUpLmh0bWwoXHJcbiAgICAgICAgY29udGVudCArICc8cCBjbGFzcz1cImVycm9ydGV4dFwiPuODluODqeOCpuOCtuOBjDxici8+V2ViIEF1ZGlvIEFQSeOCkuOCteODneODvOODiOOBl+OBpuOBhOOBquOBhOOBn+OCgTxici8+5YuV5L2c44GE44Gf44GX44G+44Gb44KT44CCPC9wPicpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8g44OW44Op44Km44K244GMUGFnZSBWaXNpYmlsaXR5IEFQSSDjgpLjgrXjg53jg7zjg4jjgZfjgarjgYTloLTlkIjjgavorablkYogXHJcbiAgICBpZiAodHlwZW9mIHRoaXMuaGlkZGVuID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICBkMy5zZWxlY3QoJyNjb250ZW50JykuYXBwZW5kKCdkaXYnKS5jbGFzc2VkKCdlcnJvcicsIHRydWUpLmh0bWwoXHJcbiAgICAgICAgY29udGVudCArICc8cCBjbGFzcz1cImVycm9ydGV4dFwiPuODluODqeOCpuOCtuOBjDxici8+UGFnZSBWaXNpYmlsaXR5IEFQSeOCkuOCteODneODvOODiOOBl+OBpuOBhOOBquOBhOOBn+OCgTxici8+5YuV5L2c44GE44Gf44GX44G+44Gb44KT44CCPC9wPicpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHR5cGVvZiBsb2NhbFN0b3JhZ2UgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIGQzLnNlbGVjdCgnI2NvbnRlbnQnKS5hcHBlbmQoJ2RpdicpLmNsYXNzZWQoJ2Vycm9yJywgdHJ1ZSkuaHRtbChcclxuICAgICAgICBjb250ZW50ICsgJzxwIGNsYXNzPVwiZXJyb3J0ZXh0XCI+44OW44Op44Km44K244GMPGJyLz5XZWIgTG9jYWwgU3RvcmFnZeOCkuOCteODneODvOODiOOBl+OBpuOBhOOBquOBhOOBn+OCgTxici8+5YuV5L2c44GE44Gf44GX44G+44Gb44KT44CCPC9wPicpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnN0b3JhZ2UgPSBsb2NhbFN0b3JhZ2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbiBcclxuICAvLy8g44Ky44O844Og44Oh44Kk44OzXHJcbiAgbWFpbigpIHtcclxuICAgIC8vIOOCv+OCueOCr+OBruWRvOOBs+WHuuOBl1xyXG4gICAgLy8g44Oh44Kk44Oz44Gr5o+P55S7XHJcbiAgICBpZiAodGhpcy5zdGFydCkge1xyXG4gICAgICB0aGlzLnRhc2tzLnByb2Nlc3ModGhpcyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBsb2FkUmVzb3VyY2VzKCkge1xyXG4gICAgLy8vIOOCsuODvOODoOS4reOBruODhuOCr+OCueODgeODo+ODvOWumue+qVxyXG4gICAgdmFyIHRleHR1cmVzID0ge1xyXG4gICAgICBmb250OiAnRm9udC5wbmcnLFxyXG4gICAgICBmb250MTogJ0ZvbnQyLnBuZycsXHJcbiAgICAgIGF1dGhvcjogJ2F1dGhvci5wbmcnLFxyXG4gICAgICB0aXRsZTogJ1RJVExFLnBuZycsXHJcbiAgICAgIG15c2hpcDogJ215c2hpcDIucG5nJyxcclxuICAgICAgZW5lbXk6ICdlbmVteS5wbmcnLFxyXG4gICAgICBib21iOiAnYm9tYi5wbmcnXHJcbiAgICB9O1xyXG4gICAgLy8vIOODhuOCr+OCueODgeODo+ODvOOBruODreODvOODiVxyXG4gIFxyXG4gICAgdmFyIGxvYWRQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKCk7XHJcbiAgICB2YXIgbG9hZGVyID0gbmV3IFRIUkVFLlRleHR1cmVMb2FkZXIoKTtcclxuICAgIGZ1bmN0aW9uIGxvYWRUZXh0dXJlKHNyYykge1xyXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgIGxvYWRlci5sb2FkKHNyYywgKHRleHR1cmUpID0+IHtcclxuICAgICAgICAgIHRleHR1cmUubWFnRmlsdGVyID0gVEhSRUUuTmVhcmVzdEZpbHRlcjtcclxuICAgICAgICAgIHRleHR1cmUubWluRmlsdGVyID0gVEhSRUUuTGluZWFyTWlwTWFwTGluZWFyRmlsdGVyO1xyXG4gICAgICAgICAgcmVzb2x2ZSh0ZXh0dXJlKTtcclxuICAgICAgICB9LCBudWxsLCAoeGhyKSA9PiB7IHJlamVjdCh4aHIpIH0pO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgdGV4TGVuZ3RoID0gT2JqZWN0LmtleXModGV4dHVyZXMpLmxlbmd0aDtcclxuICAgIHZhciB0ZXhDb3VudCA9IDA7XHJcbiAgICB0aGlzLnByb2dyZXNzID0gbmV3IGdyYXBoaWNzLlByb2dyZXNzKCk7XHJcbiAgICB0aGlzLnByb2dyZXNzLm1lc2gucG9zaXRpb24ueiA9IDAuMDAxO1xyXG4gICAgdGhpcy5wcm9ncmVzcy5yZW5kZXIoJ0xvYWRpbmcgUmVzb3VjZXMgLi4uJywgMCk7XHJcbiAgICB0aGlzLnNjZW5lLmFkZCh0aGlzLnByb2dyZXNzLm1lc2gpO1xyXG4gICAgZm9yICh2YXIgbiBpbiB0ZXh0dXJlcykge1xyXG4gICAgICAoKG5hbWUsIHRleFBhdGgpID0+IHtcclxuICAgICAgICBsb2FkUHJvbWlzZSA9IGxvYWRQcm9taXNlXHJcbiAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBsb2FkVGV4dHVyZSgnLi9yZXMvJyArIHRleFBhdGgpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC50aGVuKCh0ZXgpID0+IHtcclxuICAgICAgICAgICAgdGV4Q291bnQrKztcclxuICAgICAgICAgICAgdGhpcy5wcm9ncmVzcy5yZW5kZXIoJ0xvYWRpbmcgUmVzb3VjZXMgLi4uJywgKHRleENvdW50IC8gdGV4TGVuZ3RoICogMTAwKSB8IDApO1xyXG4gICAgICAgICAgICBzZmcudGV4dHVyZUZpbGVzW25hbWVdID0gdGV4O1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLnNjZW5lLCB0aGlzLmNhbWVyYSk7XHJcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9KShuLCB0ZXh0dXJlc1tuXSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbG9hZFByb21pc2U7XHJcbiAgfVxyXG5cclxuKnJlbmRlcih0YXNrSW5kZXgpIHtcclxuICB3aGlsZSh0YXNrSW5kZXggPj0gMCl7XHJcbiAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLnNjZW5lLCB0aGlzLmNhbWVyYSk7XHJcbiAgICB0aGlzLnRleHRQbGFuZS5yZW5kZXIoKTtcclxuICAgIHRoaXMuc3RhdHMgJiYgdGhpcy5zdGF0cy51cGRhdGUoKTtcclxuICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gIH1cclxufVxyXG5cclxuaW5pdEFjdG9ycygpXHJcbntcclxuICBsZXQgcHJvbWlzZXMgPSBbXTtcclxuICB0aGlzLnNjZW5lID0gdGhpcy5zY2VuZSB8fCBuZXcgVEhSRUUuU2NlbmUoKTtcclxuICB0aGlzLmVuZW15QnVsbGV0cyA9IHRoaXMuZW5lbXlCdWxsZXRzIHx8IG5ldyBlbmVtaWVzLkVuZW15QnVsbGV0cyh0aGlzLnNjZW5lLCB0aGlzLnNlLmJpbmQodGhpcykpO1xyXG4gIHRoaXMuZW5lbWllcyA9IHRoaXMuZW5lbWllcyB8fCBuZXcgZW5lbWllcy5FbmVtaWVzKHRoaXMuc2NlbmUsIHRoaXMuc2UuYmluZCh0aGlzKSwgdGhpcy5lbmVteUJ1bGxldHMpO1xyXG4gIHByb21pc2VzLnB1c2godGhpcy5lbmVtaWVzLmxvYWRQYXR0ZXJucygpKTtcclxuICBwcm9taXNlcy5wdXNoKHRoaXMuZW5lbWllcy5sb2FkRm9ybWF0aW9ucygpKTtcclxuICB0aGlzLmJvbWJzID0gc2ZnLmJvbWJzID0gdGhpcy5ib21icyB8fCBuZXcgZWZmZWN0b2JqLkJvbWJzKHRoaXMuc2NlbmUsIHRoaXMuc2UuYmluZCh0aGlzKSk7XHJcbiAgdGhpcy5teXNoaXBfID0gdGhpcy5teXNoaXBfIHx8IG5ldyBteXNoaXAuTXlTaGlwKDAsIC0xMDAsIDAuMSwgdGhpcy5zY2VuZSwgdGhpcy5zZS5iaW5kKHRoaXMpKTtcclxuICBzZmcubXlzaGlwXyA9IHRoaXMubXlzaGlwXztcclxuICB0aGlzLm15c2hpcF8ubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcblxyXG4gIHRoaXMuc3BhY2VGaWVsZCA9IG51bGw7XHJcbiAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcclxufVxyXG5cclxuaW5pdENvbW1BbmRIaWdoU2NvcmUoKVxyXG57XHJcbiAgLy8g44OP44Oz44OJ44Or44ON44O844Og44Gu5Y+W5b6XXHJcbiAgdGhpcy5oYW5kbGVOYW1lID0gdGhpcy5zdG9yYWdlLmdldEl0ZW0oJ2hhbmRsZU5hbWUnKTtcclxuXHJcbiAgdGhpcy50ZXh0UGxhbmUgPSBuZXcgdGV4dC5UZXh0UGxhbmUodGhpcy5zY2VuZSk7XHJcbiAgLy8gdGV4dFBsYW5lLnByaW50KDAsIDAsIFwiV2ViIEF1ZGlvIEFQSSBUZXN0XCIsIG5ldyBUZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICAvLyDjgrnjgrPjgqLmg4XloLEg6YCa5L+h55SoXHJcbiAgdGhpcy5jb21tXyA9IG5ldyBjb21tLkNvbW0oKTtcclxuICB0aGlzLmNvbW1fLnVwZGF0ZUhpZ2hTY29yZXMgPSAoZGF0YSkgPT4ge1xyXG4gICAgdGhpcy5oaWdoU2NvcmVzID0gZGF0YTtcclxuICAgIHRoaXMuaGlnaFNjb3JlID0gdGhpcy5oaWdoU2NvcmVzWzBdLnNjb3JlO1xyXG4gIH07XHJcblxyXG4gIHRoaXMuY29tbV8udXBkYXRlSGlnaFNjb3JlID0gKGRhdGEpID0+IHtcclxuICAgIGlmICh0aGlzLmhpZ2hTY29yZSA8IGRhdGEuc2NvcmUpIHtcclxuICAgICAgdGhpcy5oaWdoU2NvcmUgPSBkYXRhLnNjb3JlO1xyXG4gICAgICB0aGlzLnByaW50U2NvcmUoKTtcclxuICAgIH1cclxuICB9O1xyXG4gIFxyXG59XHJcblxyXG4qaW5pdCh0YXNrSW5kZXgpIHtcclxuICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gICAgdGhpcy5pbml0Q29tbUFuZEhpZ2hTY29yZSgpO1xyXG4gICAgdGhpcy5iYXNpY0lucHV0LmJpbmQoKTtcclxuICAgIHRoaXMuaW5pdEFjdG9ycygpXHJcbiAgICAudGhlbigoKT0+e1xyXG4gICAgICB0aGlzLnRhc2tzLnB1c2hUYXNrKHRoaXMucmVuZGVyLmJpbmQodGhpcyksIHRoaXMuUkVOREVSRVJfUFJJT1JJVFkpO1xyXG4gICAgICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5wcmludEF1dGhvci5iaW5kKHRoaXMpKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG4vLy8g5L2c6ICF6KGo56S6XHJcbipwcmludEF1dGhvcih0YXNrSW5kZXgpIHtcclxuICBjb25zdCB3YWl0ID0gNjA7XHJcbiAgdGhpcy5iYXNpY0lucHV0LmtleUJ1ZmZlci5sZW5ndGggPSAwO1xyXG4gIFxyXG4gIGxldCBuZXh0VGFzayA9ICgpPT57XHJcbiAgICB0aGlzLnNjZW5lLnJlbW92ZSh0aGlzLmF1dGhvcik7XHJcbiAgICAvL3NjZW5lLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLmluaXRUaXRsZS5iaW5kKHRoaXMpKTtcclxuICB9XHJcbiAgXHJcbiAgbGV0IGNoZWNrS2V5SW5wdXQgPSAoKT0+IHtcclxuICAgIGlmICh0aGlzLmJhc2ljSW5wdXQua2V5QnVmZmVyLmxlbmd0aCA+IDAgfHwgdGhpcy5iYXNpY0lucHV0LnN0YXJ0KSB7XHJcbiAgICAgIHRoaXMuYmFzaWNJbnB1dC5rZXlCdWZmZXIubGVuZ3RoID0gMDtcclxuICAgICAgbmV4dFRhc2soKTtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfSAgXHJcblxyXG4gIC8vIOWIneacn+WMllxyXG4gIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICB2YXIgdyA9IHNmZy50ZXh0dXJlRmlsZXMuYXV0aG9yLmltYWdlLndpZHRoO1xyXG4gIHZhciBoID0gc2ZnLnRleHR1cmVGaWxlcy5hdXRob3IuaW1hZ2UuaGVpZ2h0O1xyXG4gIGNhbnZhcy53aWR0aCA9IHc7XHJcbiAgY2FudmFzLmhlaWdodCA9IGg7XHJcbiAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gIGN0eC5kcmF3SW1hZ2Uoc2ZnLnRleHR1cmVGaWxlcy5hdXRob3IuaW1hZ2UsIDAsIDApO1xyXG4gIHZhciBkYXRhID0gY3R4LmdldEltYWdlRGF0YSgwLCAwLCB3LCBoKTtcclxuICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTtcclxuXHJcbiAgZ2VvbWV0cnkudmVydF9zdGFydCA9IFtdO1xyXG4gIGdlb21ldHJ5LnZlcnRfZW5kID0gW107XHJcblxyXG4gIHtcclxuICAgIHZhciBpID0gMDtcclxuXHJcbiAgICBmb3IgKHZhciB5ID0gMDsgeSA8IGg7ICsreSkge1xyXG4gICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHc7ICsreCkge1xyXG4gICAgICAgIHZhciBjb2xvciA9IG5ldyBUSFJFRS5Db2xvcigpO1xyXG5cclxuICAgICAgICB2YXIgciA9IGRhdGEuZGF0YVtpKytdO1xyXG4gICAgICAgIHZhciBnID0gZGF0YS5kYXRhW2krK107XHJcbiAgICAgICAgdmFyIGIgPSBkYXRhLmRhdGFbaSsrXTtcclxuICAgICAgICB2YXIgYSA9IGRhdGEuZGF0YVtpKytdO1xyXG4gICAgICAgIGlmIChhICE9IDApIHtcclxuICAgICAgICAgIGNvbG9yLnNldFJHQihyIC8gMjU1LjAsIGcgLyAyNTUuMCwgYiAvIDI1NS4wKTtcclxuICAgICAgICAgIHZhciB2ZXJ0ID0gbmV3IFRIUkVFLlZlY3RvcjMoKCh4IC0gdyAvIDIuMCkpLCAoKHkgLSBoIC8gMikpICogLTEsIDAuMCk7XHJcbiAgICAgICAgICB2YXIgdmVydDIgPSBuZXcgVEhSRUUuVmVjdG9yMygxMjAwICogTWF0aC5yYW5kb20oKSAtIDYwMCwgMTIwMCAqIE1hdGgucmFuZG9tKCkgLSA2MDAsIDEyMDAgKiBNYXRoLnJhbmRvbSgpIC0gNjAwKTtcclxuICAgICAgICAgIGdlb21ldHJ5LnZlcnRfc3RhcnQucHVzaChuZXcgVEhSRUUuVmVjdG9yMyh2ZXJ0Mi54IC0gdmVydC54LCB2ZXJ0Mi55IC0gdmVydC55LCB2ZXJ0Mi56IC0gdmVydC56KSk7XHJcbiAgICAgICAgICBnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKHZlcnQyKTtcclxuICAgICAgICAgIGdlb21ldHJ5LnZlcnRfZW5kLnB1c2godmVydCk7XHJcbiAgICAgICAgICBnZW9tZXRyeS5jb2xvcnMucHVzaChjb2xvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyDjg57jg4bjg6rjgqLjg6vjgpLkvZzmiJBcclxuICAvL3ZhciB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSgnaW1hZ2VzL3BhcnRpY2xlMS5wbmcnKTtcclxuICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuUG9pbnRzTWF0ZXJpYWwoe3NpemU6IDIwLCBibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZyxcclxuICAgIHRyYW5zcGFyZW50OiB0cnVlLCB2ZXJ0ZXhDb2xvcnM6IHRydWUsIGRlcHRoVGVzdDogZmFsc2UvLywgbWFwOiB0ZXh0dXJlXHJcbiAgfSk7XHJcblxyXG4gIHRoaXMuYXV0aG9yID0gbmV3IFRIUkVFLlBvaW50cyhnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gIC8vICAgIGF1dGhvci5wb3NpdGlvbi54IGF1dGhvci5wb3NpdGlvbi55PSAgPTAuMCwgMC4wLCAwLjApO1xyXG5cclxuICAvL21lc2guc29ydFBhcnRpY2xlcyA9IGZhbHNlO1xyXG4gIC8vdmFyIG1lc2gxID0gbmV3IFRIUkVFLlBhcnRpY2xlU3lzdGVtKCk7XHJcbiAgLy9tZXNoLnNjYWxlLnggPSBtZXNoLnNjYWxlLnkgPSA4LjA7XHJcblxyXG4gIHRoaXMuc2NlbmUuYWRkKHRoaXMuYXV0aG9yKTsgIFxyXG5cclxuIFxyXG4gIC8vIOS9nOiAheihqOekuuOCueODhuODg+ODl++8kVxyXG4gIGZvcihsZXQgY291bnQgPSAxLjA7Y291bnQgPiAwOyhjb3VudCA8PSAwLjAxKT9jb3VudCAtPSAwLjAwMDU6Y291bnQgLT0gMC4wMDI1KVxyXG4gIHtcclxuICAgIC8vIOS9leOBi+OCreODvOWFpeWKm+OBjOOBguOBo+OBn+WgtOWQiOOBr+asoeOBruOCv+OCueOCr+OBuFxyXG4gICAgaWYoY2hlY2tLZXlJbnB1dCgpKXtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsZXQgZW5kID0gdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydGljZXMubGVuZ3RoO1xyXG4gICAgbGV0IHYgPSB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlcztcclxuICAgIGxldCBkID0gdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydF9zdGFydDtcclxuICAgIGxldCB2MiA9IHRoaXMuYXV0aG9yLmdlb21ldHJ5LnZlcnRfZW5kO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgICB2W2ldLnggPSB2MltpXS54ICsgZFtpXS54ICogY291bnQ7XHJcbiAgICAgIHZbaV0ueSA9IHYyW2ldLnkgKyBkW2ldLnkgKiBjb3VudDtcclxuICAgICAgdltpXS56ID0gdjJbaV0ueiArIGRbaV0ueiAqIGNvdW50O1xyXG4gICAgfVxyXG4gICAgdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydGljZXNOZWVkVXBkYXRlID0gdHJ1ZTtcclxuICAgIHRoaXMuYXV0aG9yLnJvdGF0aW9uLnggPSB0aGlzLmF1dGhvci5yb3RhdGlvbi55ID0gdGhpcy5hdXRob3Iucm90YXRpb24ueiA9IGNvdW50ICogNC4wO1xyXG4gICAgdGhpcy5hdXRob3IubWF0ZXJpYWwub3BhY2l0eSA9IDEuMDtcclxuICAgIHlpZWxkO1xyXG4gIH1cclxuICB0aGlzLmF1dGhvci5yb3RhdGlvbi54ID0gdGhpcy5hdXRob3Iucm90YXRpb24ueSA9IHRoaXMuYXV0aG9yLnJvdGF0aW9uLnogPSAwLjA7XHJcblxyXG4gIGZvciAobGV0IGkgPSAwLGUgPSB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlcy5sZW5ndGg7IGkgPCBlOyArK2kpIHtcclxuICAgIHRoaXMuYXV0aG9yLmdlb21ldHJ5LnZlcnRpY2VzW2ldLnggPSB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0X2VuZFtpXS54O1xyXG4gICAgdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydGljZXNbaV0ueSA9IHRoaXMuYXV0aG9yLmdlb21ldHJ5LnZlcnRfZW5kW2ldLnk7XHJcbiAgICB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlc1tpXS56ID0gdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydF9lbmRbaV0uejtcclxuICB9XHJcbiAgdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydGljZXNOZWVkVXBkYXRlID0gdHJ1ZTtcclxuXHJcbiAgLy8g5b6F44GhXHJcbiAgZm9yKGxldCBpID0gMDtpIDwgd2FpdDsrK2kpe1xyXG4gICAgLy8g5L2V44GL44Kt44O85YWl5Yqb44GM44GC44Gj44Gf5aC05ZCI44Gv5qyh44Gu44K/44K544Kv44G4XHJcbiAgICBpZihjaGVja0tleUlucHV0KCkpe1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5hdXRob3IubWF0ZXJpYWwuc2l6ZSA+IDIpIHtcclxuICAgICAgdGhpcy5hdXRob3IubWF0ZXJpYWwuc2l6ZSAtPSAwLjU7XHJcbiAgICAgIHRoaXMuYXV0aG9yLm1hdGVyaWFsLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIH0gICAgXHJcbiAgICB5aWVsZDtcclxuICB9XHJcblxyXG4gIC8vIOODleOCp+ODvOODieOCouOCpuODiFxyXG4gIGZvcihsZXQgY291bnQgPSAwLjA7Y291bnQgPD0gMS4wO2NvdW50ICs9IDAuMDUpXHJcbiAge1xyXG4gICAgLy8g5L2V44GL44Kt44O85YWl5Yqb44GM44GC44Gj44Gf5aC05ZCI44Gv5qyh44Gu44K/44K544Kv44G4XHJcbiAgICBpZihjaGVja0tleUlucHV0KCkpe1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB0aGlzLmF1dGhvci5tYXRlcmlhbC5vcGFjaXR5ID0gMS4wIC0gY291bnQ7XHJcbiAgICB0aGlzLmF1dGhvci5tYXRlcmlhbC5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICBcclxuICAgIHlpZWxkO1xyXG4gIH1cclxuXHJcbiAgdGhpcy5hdXRob3IubWF0ZXJpYWwub3BhY2l0eSA9IDAuMDsgXHJcbiAgdGhpcy5hdXRob3IubWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG5cclxuICAvLyDlvoXjgaFcclxuICBmb3IobGV0IGkgPSAwO2kgPCB3YWl0OysraSl7XHJcbiAgICAvLyDkvZXjgYvjgq3jg7zlhaXlipvjgYzjgYLjgaPjgZ/loLTlkIjjga/mrKHjga7jgr/jgrnjgq/jgbhcclxuICAgIGlmKGNoZWNrS2V5SW5wdXQoKSl7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHlpZWxkO1xyXG4gIH1cclxuICBuZXh0VGFzaygpO1xyXG59XHJcblxyXG4vLy8g44K/44Kk44OI44Or55S76Z2i5Yid5pyf5YyWIC8vL1xyXG4qaW5pdFRpdGxlKHRhc2tJbmRleCkge1xyXG4gIFxyXG4gIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gIFxyXG4gIHRoaXMuYmFzaWNJbnB1dC5jbGVhcigpO1xyXG5cclxuICAvLyDjgr/jgqTjg4jjg6vjg6Hjg4Pjgrfjg6Xjga7kvZzmiJDjg7vooajnpLogLy8vXHJcbiAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgbWFwOiBzZmcudGV4dHVyZUZpbGVzLnRpdGxlIH0pO1xyXG4gIG1hdGVyaWFsLnNoYWRpbmcgPSBUSFJFRS5GbGF0U2hhZGluZztcclxuICAvL21hdGVyaWFsLmFudGlhbGlhcyA9IGZhbHNlO1xyXG4gIG1hdGVyaWFsLnRyYW5zcGFyZW50ID0gdHJ1ZTtcclxuICBtYXRlcmlhbC5hbHBoYVRlc3QgPSAwLjU7XHJcbiAgbWF0ZXJpYWwuZGVwdGhUZXN0ID0gdHJ1ZTtcclxuICB0aGlzLnRpdGxlID0gbmV3IFRIUkVFLk1lc2goXHJcbiAgICBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeShzZmcudGV4dHVyZUZpbGVzLnRpdGxlLmltYWdlLndpZHRoLCBzZmcudGV4dHVyZUZpbGVzLnRpdGxlLmltYWdlLmhlaWdodCksXHJcbiAgICBtYXRlcmlhbFxyXG4gICAgKTtcclxuICB0aGlzLnRpdGxlLnNjYWxlLnggPSB0aGlzLnRpdGxlLnNjYWxlLnkgPSAwLjg7XHJcbiAgdGhpcy50aXRsZS5wb3NpdGlvbi55ID0gODA7XHJcbiAgdGhpcy5zY2VuZS5hZGQodGhpcy50aXRsZSk7XHJcbiAgdGhpcy5zaG93U3BhY2VGaWVsZCgpO1xyXG4gIC8vLyDjg4bjgq3jgrnjg4jooajnpLpcclxuICB0aGlzLnRleHRQbGFuZS5wcmludCgzLCAyNSwgXCJQdXNoIHogb3IgU1RBUlQgYnV0dG9uXCIsIG5ldyB0ZXh0LlRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gIHNmZy5nYW1lVGltZXIuc3RhcnQoKTtcclxuICB0aGlzLnNob3dUaXRsZS5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDEwLyrnp5IqLztcclxuICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5zaG93VGl0bGUuYmluZCh0aGlzKSk7XHJcbiAgcmV0dXJuO1xyXG59XHJcblxyXG4vLy8g6IOM5pmv44OR44O844OG44Kj44Kv44Or6KGo56S6XHJcbnNob3dTcGFjZUZpZWxkKCkge1xyXG4gIC8vLyDog4zmma/jg5Hjg7zjg4bjgqPjgq/jg6vooajnpLpcclxuICBpZiAoIXRoaXMuc3BhY2VGaWVsZCkge1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkdlb21ldHJ5KCk7XHJcblxyXG4gICAgZ2VvbWV0cnkuZW5keSA9IFtdO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAyNTA7ICsraSkge1xyXG4gICAgICB2YXIgY29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoKTtcclxuICAgICAgdmFyIHogPSAtMTgwMC4wICogTWF0aC5yYW5kb20oKSAtIDMwMC4wO1xyXG4gICAgICBjb2xvci5zZXRIU0woMC4wNSArIE1hdGgucmFuZG9tKCkgKiAwLjA1LCAxLjAsICgtMjEwMCAtIHopIC8gLTIxMDApO1xyXG4gICAgICB2YXIgZW5keSA9IHNmZy5WSVJUVUFMX0hFSUdIVCAvIDIgLSB6ICogc2ZnLlZJUlRVQUxfSEVJR0hUIC8gc2ZnLlZJUlRVQUxfV0lEVEg7XHJcbiAgICAgIHZhciB2ZXJ0MiA9IG5ldyBUSFJFRS5WZWN0b3IzKChzZmcuVklSVFVBTF9XSURUSCAtIHogKiAyKSAqIE1hdGgucmFuZG9tKCkgLSAoKHNmZy5WSVJUVUFMX1dJRFRIIC0geiAqIDIpIC8gMilcclxuICAgICAgICAsIGVuZHkgKiAyICogTWF0aC5yYW5kb20oKSAtIGVuZHksIHopO1xyXG4gICAgICBnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKHZlcnQyKTtcclxuICAgICAgZ2VvbWV0cnkuZW5keS5wdXNoKGVuZHkpO1xyXG5cclxuICAgICAgZ2VvbWV0cnkuY29sb3JzLnB1c2goY29sb3IpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIOODnuODhuODquOCouODq+OCkuS9nOaIkFxyXG4gICAgLy92YXIgdGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoJ2ltYWdlcy9wYXJ0aWNsZTEucG5nJyk7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuUG9pbnRzTWF0ZXJpYWwoe1xyXG4gICAgICBzaXplOiA0LCBibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZyxcclxuICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsIHZlcnRleENvbG9yczogdHJ1ZSwgZGVwdGhUZXN0OiB0cnVlLy8sIG1hcDogdGV4dHVyZVxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5zcGFjZUZpZWxkID0gbmV3IFRIUkVFLlBvaW50cyhnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gICAgdGhpcy5zcGFjZUZpZWxkLnBvc2l0aW9uLnggPSB0aGlzLnNwYWNlRmllbGQucG9zaXRpb24ueSA9IHRoaXMuc3BhY2VGaWVsZC5wb3NpdGlvbi56ID0gMC4wO1xyXG4gICAgdGhpcy5zY2VuZS5hZGQodGhpcy5zcGFjZUZpZWxkKTtcclxuICAgIHRoaXMudGFza3MucHVzaFRhc2sodGhpcy5tb3ZlU3BhY2VGaWVsZC5iaW5kKHRoaXMpKTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDlroflrpnnqbrplpPjga7ooajnpLpcclxuKm1vdmVTcGFjZUZpZWxkKHRhc2tJbmRleCkge1xyXG4gIHdoaWxlKHRydWUpe1xyXG4gICAgdmFyIHZlcnRzID0gdGhpcy5zcGFjZUZpZWxkLmdlb21ldHJ5LnZlcnRpY2VzO1xyXG4gICAgdmFyIGVuZHlzID0gdGhpcy5zcGFjZUZpZWxkLmdlb21ldHJ5LmVuZHk7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gdmVydHMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgdmVydHNbaV0ueSAtPSA0O1xyXG4gICAgICBpZiAodmVydHNbaV0ueSA8IC1lbmR5c1tpXSkge1xyXG4gICAgICAgIHZlcnRzW2ldLnkgPSBlbmR5c1tpXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5zcGFjZUZpZWxkLmdlb21ldHJ5LnZlcnRpY2VzTmVlZFVwZGF0ZSA9IHRydWU7XHJcbiAgICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDjgr/jgqTjg4jjg6vooajnpLpcclxuKnNob3dUaXRsZSh0YXNrSW5kZXgpIHtcclxuIHdoaWxlKHRydWUpe1xyXG4gIHNmZy5nYW1lVGltZXIudXBkYXRlKCk7XHJcblxyXG4gIGlmICh0aGlzLmJhc2ljSW5wdXQueiB8fCB0aGlzLmJhc2ljSW5wdXQuc3RhcnQgKSB7XHJcbiAgICB0aGlzLnNjZW5lLnJlbW92ZSh0aGlzLnRpdGxlKTtcclxuICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLmluaXRIYW5kbGVOYW1lLmJpbmQodGhpcykpO1xyXG4gIH1cclxuICBpZiAodGhpcy5zaG93VGl0bGUuZW5kVGltZSA8IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUpIHtcclxuICAgIHRoaXMuc2NlbmUucmVtb3ZlKHRoaXMudGl0bGUpO1xyXG4gICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuaW5pdFRvcDEwLmJpbmQodGhpcykpO1xyXG4gIH1cclxuICB5aWVsZDtcclxuIH1cclxufVxyXG5cclxuLy8vIOODj+ODs+ODieODq+ODjeODvOODoOOBruOCqOODs+ODiOODquWJjeWIneacn+WMllxyXG4qaW5pdEhhbmRsZU5hbWUodGFza0luZGV4KSB7XHJcbiAgbGV0IGVuZCA9IGZhbHNlO1xyXG4gIGlmICh0aGlzLmVkaXRIYW5kbGVOYW1lKXtcclxuICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLmdhbWVJbml0LmJpbmQodGhpcykpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0aGlzLmVkaXRIYW5kbGVOYW1lID0gdGhpcy5oYW5kbGVOYW1lIHx8ICcnO1xyXG4gICAgdGhpcy50ZXh0UGxhbmUuY2xzKCk7XHJcbiAgICB0aGlzLnRleHRQbGFuZS5wcmludCg0LCAxOCwgJ0lucHV0IHlvdXIgaGFuZGxlIG5hbWUuJyk7XHJcbiAgICB0aGlzLnRleHRQbGFuZS5wcmludCg4LCAxOSwgJyhNYXggOCBDaGFyKScpO1xyXG4gICAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMTAsIDIxLCB0aGlzLmVkaXRIYW5kbGVOYW1lKTtcclxuICAgIC8vICAgIHRleHRQbGFuZS5wcmludCgxMCwgMjEsIGhhbmRsZU5hbWVbMF0sIFRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gICAgdGhpcy5iYXNpY0lucHV0LnVuYmluZCgpO1xyXG4gICAgdmFyIGVsbSA9IGQzLnNlbGVjdCgnI2NvbnRlbnQnKS5hcHBlbmQoJ2lucHV0Jyk7XHJcbiAgICBsZXQgdGhpc18gPSB0aGlzO1xyXG4gICAgZWxtXHJcbiAgICAgIC5hdHRyKCd0eXBlJywgJ3RleHQnKVxyXG4gICAgICAuYXR0cigncGF0dGVybicsICdbYS16QS1aMC05X1xcQFxcI1xcJFxcLV17MCw4fScpXHJcbiAgICAgIC5hdHRyKCdtYXhsZW5ndGgnLCA4KVxyXG4gICAgICAuYXR0cignaWQnLCAnaW5wdXQtYXJlYScpXHJcbiAgICAgIC5hdHRyKCd2YWx1ZScsIHRoaXNfLmVkaXRIYW5kbGVOYW1lKVxyXG4gICAgICAuY2FsbChmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgIGQubm9kZSgpLnNlbGVjdGlvblN0YXJ0ID0gdGhpc18uZWRpdEhhbmRsZU5hbWUubGVuZ3RoO1xyXG4gICAgICB9KVxyXG4gICAgICAub24oJ2JsdXInLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgZDMuZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBkMy5ldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAvL2xldCB0aGlzXyA9IHRoaXM7XHJcbiAgICAgICAgc2V0VGltZW91dCggKCkgPT4geyB0aGlzLmZvY3VzKCk7IH0sIDEwKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5vbigna2V5dXAnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoZDMuZXZlbnQua2V5Q29kZSA9PSAxMykge1xyXG4gICAgICAgICAgdGhpc18uZWRpdEhhbmRsZU5hbWUgPSB0aGlzLnZhbHVlO1xyXG4gICAgICAgICAgbGV0IHMgPSB0aGlzLnNlbGVjdGlvblN0YXJ0O1xyXG4gICAgICAgICAgbGV0IGUgPSB0aGlzLnNlbGVjdGlvbkVuZDtcclxuICAgICAgICAgIHRoaXNfLnRleHRQbGFuZS5wcmludCgxMCwgMjEsIHRoaXNfLmVkaXRIYW5kbGVOYW1lKTtcclxuICAgICAgICAgIHRoaXNfLnRleHRQbGFuZS5wcmludCgxMCArIHMsIDIxLCAnXycsIG5ldyB0ZXh0LlRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLm9uKCdrZXl1cCcsIG51bGwpO1xyXG4gICAgICAgICAgdGhpc18uYmFzaWNJbnB1dC5iaW5kKCk7XHJcbiAgICAgICAgICAvLyDjgZPjga7jgr/jgrnjgq/jgpLntYLjgo/jgonjgZvjgotcclxuICAgICAgICAgIHRoaXNfLnRhc2tzLmFycmF5W3Rhc2tJbmRleF0uZ2VuSW5zdC5uZXh0KC0odGFza0luZGV4ICsgMSkpO1xyXG4gICAgICAgICAgLy8g5qyh44Gu44K/44K544Kv44KS6Kit5a6a44GZ44KLXHJcbiAgICAgICAgICB0aGlzXy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXNfLmdhbWVJbml0LmJpbmQodGhpc18pKTtcclxuICAgICAgICAgIHRoaXNfLnN0b3JhZ2Uuc2V0SXRlbSgnaGFuZGxlTmFtZScsIHRoaXNfLmVkaXRIYW5kbGVOYW1lKTtcclxuICAgICAgICAgIGQzLnNlbGVjdCgnI2lucHV0LWFyZWEnKS5yZW1vdmUoKTtcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpc18uZWRpdEhhbmRsZU5hbWUgPSB0aGlzLnZhbHVlO1xyXG4gICAgICAgIGxldCBzID0gdGhpcy5zZWxlY3Rpb25TdGFydDtcclxuICAgICAgICB0aGlzXy50ZXh0UGxhbmUucHJpbnQoMTAsIDIxLCAnICAgICAgICAgICAnKTtcclxuICAgICAgICB0aGlzXy50ZXh0UGxhbmUucHJpbnQoMTAsIDIxLCB0aGlzXy5lZGl0SGFuZGxlTmFtZSk7XHJcbiAgICAgICAgdGhpc18udGV4dFBsYW5lLnByaW50KDEwICsgcywgMjEsICdfJywgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5jYWxsKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLm5vZGUoKS5zZWxlY3Rpb25TdGFydDtcclxuICAgICAgICB0aGlzXy50ZXh0UGxhbmUucHJpbnQoMTAsIDIxLCAnICAgICAgICAgICAnKTtcclxuICAgICAgICB0aGlzXy50ZXh0UGxhbmUucHJpbnQoMTAsIDIxLCB0aGlzXy5lZGl0SGFuZGxlTmFtZSk7XHJcbiAgICAgICAgdGhpc18udGV4dFBsYW5lLnByaW50KDEwICsgcywgMjEsICdfJywgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgICAgICAgdGhpcy5ub2RlKCkuZm9jdXMoKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgd2hpbGUodGFza0luZGV4ID49IDApXHJcbiAgICB7XHJcbiAgICAgIHRoaXMuYmFzaWNJbnB1dC5jbGVhcigpO1xyXG4gICAgICBpZih0aGlzLmJhc2ljSW5wdXQuYUJ1dHRvbiB8fCB0aGlzLmJhc2ljSW5wdXQuc3RhcnQpXHJcbiAgICAgIHtcclxuICAgICAgICAgIHZhciBpbnB1dEFyZWEgPSBkMy5zZWxlY3QoJyNpbnB1dC1hcmVhJyk7XHJcbiAgICAgICAgICB2YXIgaW5wdXROb2RlID0gaW5wdXRBcmVhLm5vZGUoKTtcclxuICAgICAgICAgIHRoaXMuZWRpdEhhbmRsZU5hbWUgPSBpbnB1dE5vZGUudmFsdWU7XHJcbiAgICAgICAgICBsZXQgcyA9IGlucHV0Tm9kZS5zZWxlY3Rpb25TdGFydDtcclxuICAgICAgICAgIGxldCBlID0gaW5wdXROb2RlLnNlbGVjdGlvbkVuZDtcclxuICAgICAgICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDEwLCAyMSwgdGhpcy5lZGl0SGFuZGxlTmFtZSk7XHJcbiAgICAgICAgICB0aGlzLnRleHRQbGFuZS5wcmludCgxMCArIHMsIDIxLCAnXycsIG5ldyB0ZXh0LlRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gICAgICAgICAgaW5wdXRBcmVhLm9uKCdrZXl1cCcsIG51bGwpO1xyXG4gICAgICAgICAgdGhpcy5iYXNpY0lucHV0LmJpbmQoKTtcclxuICAgICAgICAgIC8vIOOBk+OBruOCv+OCueOCr+OCkue1guOCj+OCieOBm+OCi1xyXG4gICAgICAgICAgLy90aGlzLnRhc2tzLmFycmF5W3Rhc2tJbmRleF0uZ2VuSW5zdC5uZXh0KC0odGFza0luZGV4ICsgMSkpO1xyXG4gICAgICAgICAgLy8g5qyh44Gu44K/44K544Kv44KS6Kit5a6a44GZ44KLXHJcbiAgICAgICAgICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5nYW1lSW5pdC5iaW5kKHRoaXMpKTtcclxuICAgICAgICAgIHRoaXMuc3RvcmFnZS5zZXRJdGVtKCdoYW5kbGVOYW1lJywgdGhpcy5lZGl0SGFuZGxlTmFtZSk7XHJcbiAgICAgICAgICBpbnB1dEFyZWEucmVtb3ZlKCk7XHJcbiAgICAgICAgICByZXR1cm47ICAgICAgICBcclxuICAgICAgfVxyXG4gICAgICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICAgIH1cclxuICAgIHRhc2tJbmRleCA9IC0oKyt0YXNrSW5kZXgpO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOOCueOCs+OCouWKoOeul1xyXG5hZGRTY29yZShzKSB7XHJcbiAgdGhpcy5zY29yZSArPSBzO1xyXG4gIGlmICh0aGlzLnNjb3JlID4gdGhpcy5oaWdoU2NvcmUpIHtcclxuICAgIHRoaXMuaGlnaFNjb3JlID0gdGhpcy5zY29yZTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDjgrnjgrPjgqLooajnpLpcclxucHJpbnRTY29yZSgpIHtcclxuICB2YXIgcyA9ICgnMDAwMDAwMDAnICsgdGhpcy5zY29yZS50b1N0cmluZygpKS5zbGljZSgtOCk7XHJcbiAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMSwgMSwgcyk7XHJcblxyXG4gIHZhciBoID0gKCcwMDAwMDAwMCcgKyB0aGlzLmhpZ2hTY29yZS50b1N0cmluZygpKS5zbGljZSgtOCk7XHJcbiAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMTIsIDEsIGgpO1xyXG5cclxufVxyXG5cclxuLy8vIOOCteOCpuODs+ODieOCqOODleOCp+OCr+ODiFxyXG5zZShpbmRleCkge1xyXG4gIHRoaXMuc2VxdWVuY2VyLnBsYXlUcmFja3ModGhpcy5zb3VuZEVmZmVjdHMuc291bmRFZmZlY3RzW2luZGV4XSk7XHJcbn1cclxuXHJcbi8vLyDjgrLjg7zjg6Djga7liJ3mnJ/ljJZcclxuKmdhbWVJbml0KHRhc2tJbmRleCkge1xyXG5cclxuICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICBcclxuXHJcbiAgLy8g44Kq44O844OH44Kj44Kq44Gu6ZaL5aeLXHJcbiAgdGhpcy5hdWRpb18uc3RhcnQoKTtcclxuICB0aGlzLnNlcXVlbmNlci5sb2FkKGF1ZGlvLnNlcURhdGEpO1xyXG4gIHRoaXMuc2VxdWVuY2VyLnN0YXJ0KCk7XHJcbiAgc2ZnLnN0YWdlLnJlc2V0KCk7XHJcbiAgdGhpcy50ZXh0UGxhbmUuY2xzKCk7XHJcbiAgdGhpcy5lbmVtaWVzLnJlc2V0KCk7XHJcblxyXG4gIC8vIOiHquapn+OBruWIneacn+WMllxyXG4gIHRoaXMubXlzaGlwXy5pbml0KCk7XHJcbiAgc2ZnLmdhbWVUaW1lci5zdGFydCgpO1xyXG4gIHRoaXMuc2NvcmUgPSAwO1xyXG4gIHRoaXMudGV4dFBsYW5lLnByaW50KDIsIDAsICdTY29yZSAgICBIaWdoIFNjb3JlJyk7XHJcbiAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMjAsIDM5LCAnUmVzdDogICAnICsgc2ZnLm15c2hpcF8ucmVzdCk7XHJcbiAgdGhpcy5wcmludFNjb3JlKCk7XHJcbiAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuc3RhZ2VJbml0LmJpbmQodGhpcykvKmdhbWVBY3Rpb24qLyk7XHJcbn1cclxuXHJcbi8vLyDjgrnjg4bjg7zjgrjjga7liJ3mnJ/ljJZcclxuKnN0YWdlSW5pdCh0YXNrSW5kZXgpIHtcclxuICBcclxuICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICBcclxuICB0aGlzLnRleHRQbGFuZS5wcmludCgwLCAzOSwgJ1N0YWdlOicgKyBzZmcuc3RhZ2Uubm8pO1xyXG4gIHNmZy5nYW1lVGltZXIuc3RhcnQoKTtcclxuICB0aGlzLmVuZW1pZXMucmVzZXQoKTtcclxuICB0aGlzLmVuZW1pZXMuc3RhcnQoKTtcclxuICB0aGlzLmVuZW1pZXMuY2FsY0VuZW1pZXNDb3VudChzZmcuc3RhZ2UucHJpdmF0ZU5vKTtcclxuICB0aGlzLmVuZW1pZXMuaGl0RW5lbWllc0NvdW50ID0gMDtcclxuICB0aGlzLnRleHRQbGFuZS5wcmludCg4LCAxNSwgJ1N0YWdlICcgKyAoc2ZnLnN0YWdlLm5vKSArICcgU3RhcnQgISEnLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5zdGFnZVN0YXJ0LmJpbmQodGhpcykpO1xyXG59XHJcblxyXG4vLy8g44K544OG44O844K46ZaL5aeLXHJcbipzdGFnZVN0YXJ0KHRhc2tJbmRleCkge1xyXG4gIGxldCBlbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDI7XHJcbiAgd2hpbGUodGFza0luZGV4ID49IDAgJiYgZW5kVGltZSA+PSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lKXtcclxuICAgIHNmZy5nYW1lVGltZXIudXBkYXRlKCk7XHJcbiAgICBzZmcubXlzaGlwXy5hY3Rpb24odGhpcy5iYXNpY0lucHV0KTtcclxuICAgIHRhc2tJbmRleCA9IHlpZWxkOyAgICBcclxuICB9XHJcbiAgdGhpcy50ZXh0UGxhbmUucHJpbnQoOCwgMTUsICcgICAgICAgICAgICAgICAgICAnLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5nYW1lQWN0aW9uLmJpbmQodGhpcyksIDUwMDApO1xyXG59XHJcblxyXG4vLy8g44Ky44O844Og5LitXHJcbipnYW1lQWN0aW9uKHRhc2tJbmRleCkge1xyXG4gIHdoaWxlICh0YXNrSW5kZXggPj0gMCl7XHJcbiAgICB0aGlzLnByaW50U2NvcmUoKTtcclxuICAgIHNmZy5teXNoaXBfLmFjdGlvbih0aGlzLmJhc2ljSW5wdXQpO1xyXG4gICAgc2ZnLmdhbWVUaW1lci51cGRhdGUoKTtcclxuICAgIC8vY29uc29sZS5sb2coc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSk7XHJcbiAgICB0aGlzLmVuZW1pZXMubW92ZSgpO1xyXG5cclxuICAgIGlmICghdGhpcy5wcm9jZXNzQ29sbGlzaW9uKCkpIHtcclxuICAgICAgLy8g6Z2i44Kv44Oq44Ki44OB44Kn44OD44KvXHJcbiAgICAgIGlmICh0aGlzLmVuZW1pZXMuaGl0RW5lbWllc0NvdW50ID09IHRoaXMuZW5lbWllcy50b3RhbEVuZW1pZXNDb3VudCkge1xyXG4gICAgICAgIHRoaXMucHJpbnRTY29yZSgpO1xyXG4gICAgICAgIHRoaXMuc3RhZ2UuYWR2YW5jZSgpO1xyXG4gICAgICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLnN0YWdlSW5pdC5iaW5kKHRoaXMpKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMubXlTaGlwQm9tYi5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDM7XHJcbiAgICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLm15U2hpcEJvbWIuYmluZCh0aGlzKSk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH07XHJcbiAgICB0YXNrSW5kZXggPSB5aWVsZDsgXHJcbiAgfVxyXG59XHJcblxyXG4vLy8g5b2T44Gf44KK5Yik5a6aXHJcbnByb2Nlc3NDb2xsaXNpb24odGFza0luZGV4KSB7XHJcbiAgLy/jgIDoh6rmqZ/lvL7jgajmlbXjgajjga7jgYLjgZ/jgorliKTlrppcclxuICBsZXQgbXlCdWxsZXRzID0gc2ZnLm15c2hpcF8ubXlCdWxsZXRzO1xyXG4gIHRoaXMuZW5zID0gdGhpcy5lbmVtaWVzLmVuZW1pZXM7XHJcbiAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IG15QnVsbGV0cy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgbGV0IG15YiA9IG15QnVsbGV0c1tpXTtcclxuICAgIGlmIChteWIuZW5hYmxlXykge1xyXG4gICAgICB2YXIgbXliY28gPSBteUJ1bGxldHNbaV0uY29sbGlzaW9uQXJlYTtcclxuICAgICAgdmFyIGxlZnQgPSBteWJjby5sZWZ0ICsgbXliLng7XHJcbiAgICAgIHZhciByaWdodCA9IG15YmNvLnJpZ2h0ICsgbXliLng7XHJcbiAgICAgIHZhciB0b3AgPSBteWJjby50b3AgKyBteWIueTtcclxuICAgICAgdmFyIGJvdHRvbSA9IG15YmNvLmJvdHRvbSAtIG15Yi5zcGVlZCArIG15Yi55O1xyXG4gICAgICBmb3IgKHZhciBqID0gMCwgZW5kaiA9IHRoaXMuZW5zLmxlbmd0aDsgaiA8IGVuZGo7ICsraikge1xyXG4gICAgICAgIHZhciBlbiA9IHRoaXMuZW5zW2pdO1xyXG4gICAgICAgIGlmIChlbi5lbmFibGVfKSB7XHJcbiAgICAgICAgICB2YXIgZW5jbyA9IGVuLmNvbGxpc2lvbkFyZWE7XHJcbiAgICAgICAgICBpZiAodG9wID4gKGVuLnkgKyBlbmNvLmJvdHRvbSkgJiZcclxuICAgICAgICAgICAgKGVuLnkgKyBlbmNvLnRvcCkgPiBib3R0b20gJiZcclxuICAgICAgICAgICAgbGVmdCA8IChlbi54ICsgZW5jby5yaWdodCkgJiZcclxuICAgICAgICAgICAgKGVuLnggKyBlbmNvLmxlZnQpIDwgcmlnaHRcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIGVuLmhpdChteWIpO1xyXG4gICAgICAgICAgICBpZiAobXliLnBvd2VyIDw9IDApIHtcclxuICAgICAgICAgICAgICBteWIuZW5hYmxlXyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8g5pW144Go6Ieq5qmf44Go44Gu44GC44Gf44KK5Yik5a6aXHJcbiAgaWYgKHNmZy5DSEVDS19DT0xMSVNJT04pIHtcclxuICAgIGxldCBteWNvID0gc2ZnLm15c2hpcF8uY29sbGlzaW9uQXJlYTtcclxuICAgIGxldCBsZWZ0ID0gc2ZnLm15c2hpcF8ueCArIG15Y28ubGVmdDtcclxuICAgIGxldCByaWdodCA9IG15Y28ucmlnaHQgKyBzZmcubXlzaGlwXy54O1xyXG4gICAgbGV0IHRvcCA9IG15Y28udG9wICsgc2ZnLm15c2hpcF8ueTtcclxuICAgIGxldCBib3R0b20gPSBteWNvLmJvdHRvbSArIHNmZy5teXNoaXBfLnk7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHRoaXMuZW5zLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIGxldCBlbiA9IHRoaXMuZW5zW2ldO1xyXG4gICAgICBpZiAoZW4uZW5hYmxlXykge1xyXG4gICAgICAgIGxldCBlbmNvID0gZW4uY29sbGlzaW9uQXJlYTtcclxuICAgICAgICBpZiAodG9wID4gKGVuLnkgKyBlbmNvLmJvdHRvbSkgJiZcclxuICAgICAgICAgIChlbi55ICsgZW5jby50b3ApID4gYm90dG9tICYmXHJcbiAgICAgICAgICBsZWZ0IDwgKGVuLnggKyBlbmNvLnJpZ2h0KSAmJlxyXG4gICAgICAgICAgKGVuLnggKyBlbmNvLmxlZnQpIDwgcmlnaHRcclxuICAgICAgICAgICkge1xyXG4gICAgICAgICAgZW4uaGl0KG15c2hpcCk7XHJcbiAgICAgICAgICBzZmcubXlzaGlwXy5oaXQoKTtcclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8g5pW15by+44Go6Ieq5qmf44Go44Gu44GC44Gf44KK5Yik5a6aXHJcbiAgICB0aGlzLmVuYnMgPSB0aGlzLmVuZW15QnVsbGV0cy5lbmVteUJ1bGxldHM7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gdGhpcy5lbmJzLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIGxldCBlbiA9IHRoaXMuZW5ic1tpXTtcclxuICAgICAgaWYgKGVuLmVuYWJsZSkge1xyXG4gICAgICAgIGxldCBlbmNvID0gZW4uY29sbGlzaW9uQXJlYTtcclxuICAgICAgICBpZiAodG9wID4gKGVuLnkgKyBlbmNvLmJvdHRvbSkgJiZcclxuICAgICAgICAgIChlbi55ICsgZW5jby50b3ApID4gYm90dG9tICYmXHJcbiAgICAgICAgICBsZWZ0IDwgKGVuLnggKyBlbmNvLnJpZ2h0KSAmJlxyXG4gICAgICAgICAgKGVuLnggKyBlbmNvLmxlZnQpIDwgcmlnaHRcclxuICAgICAgICAgICkge1xyXG4gICAgICAgICAgZW4uaGl0KCk7XHJcbiAgICAgICAgICBzZmcubXlzaGlwXy5oaXQoKTtcclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICB9XHJcbiAgcmV0dXJuIGZhbHNlO1xyXG59XHJcblxyXG4vLy8g6Ieq5qmf54iG55m6IFxyXG4qbXlTaGlwQm9tYih0YXNrSW5kZXgpIHtcclxuICB3aGlsZShzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lIDw9IHRoaXMubXlTaGlwQm9tYi5lbmRUaW1lICYmIHRhc2tJbmRleCA+PSAwKXtcclxuICAgIHRoaXMuZW5lbWllcy5tb3ZlKCk7XHJcbiAgICBzZmcuZ2FtZVRpbWVyLnVwZGF0ZSgpO1xyXG4gICAgdGFza0luZGV4ID0geWllbGQ7ICBcclxuICB9XHJcbiAgc2ZnLm15c2hpcF8ucmVzdC0tO1xyXG4gIGlmIChzZmcubXlzaGlwXy5yZXN0ID09IDApIHtcclxuICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDEwLCAxOCwgJ0dBTUUgT1ZFUicsIG5ldyB0ZXh0LlRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gICAgdGhpcy5wcmludFNjb3JlKCk7XHJcbiAgICB0aGlzLnRleHRQbGFuZS5wcmludCgyMCwgMzksICdSZXN0OiAgICcgKyBzZmcubXlzaGlwXy5yZXN0KTtcclxuICAgIHRoaXMuY29tbV8uc29ja2V0Lm9uKCdzZW5kUmFuaycsIHRoaXMuY2hlY2tSYW5rSW4pO1xyXG4gICAgdGhpcy5jb21tXy5zZW5kU2NvcmUobmV3IFNjb3JlRW50cnkodGhpcy5lZGl0SGFuZGxlTmFtZSwgdGhpcy5zY29yZSkpO1xyXG4gICAgdGhpcy5nYW1lT3Zlci5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDU7XHJcbiAgICB0aGlzLnJhbmsgPSAtMTtcclxuICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLmdhbWVPdmVyLmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5zZXF1ZW5jZXIuc3RvcCgpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBzZmcubXlzaGlwXy5tZXNoLnZpc2libGUgPSB0cnVlO1xyXG4gICAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMjAsIDM5LCAnUmVzdDogICAnICsgc2ZnLm15c2hpcF8ucmVzdCk7XHJcbiAgICB0aGlzLnRleHRQbGFuZS5wcmludCg4LCAxNSwgJ1N0YWdlICcgKyAoc2ZnLnN0YWdlLm5vKSArICcgU3RhcnQgISEnLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICAgIHRoaXMuc3RhZ2VTdGFydC5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDI7XHJcbiAgICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5zdGFnZVN0YXJ0LmJpbmQodGhpcykpO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOOCsuODvOODoOOCquODvOODkOODvFxyXG4qZ2FtZU92ZXIodGFza0luZGV4KSB7XHJcbiAgd2hpbGUodGhpcy5nYW1lT3Zlci5lbmRUaW1lID49IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgJiYgdGFza0luZGV4ID49IDApXHJcbiAge1xyXG4gICAgc2ZnLmdhbWVUaW1lci51cGRhdGUoKTtcclxuICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gIH1cclxuICBcclxuXHJcbiAgdGhpcy50ZXh0UGxhbmUuY2xzKCk7XHJcbiAgdGhpcy5lbmVtaWVzLnJlc2V0KCk7XHJcbiAgdGhpcy5lbmVteUJ1bGxldHMucmVzZXQoKTtcclxuICBpZiAodGhpcy5yYW5rID49IDApIHtcclxuICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLmluaXRUb3AxMC5iaW5kKHRoaXMpKTtcclxuICB9IGVsc2Uge1xyXG4gICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuaW5pdFRpdGxlLmJpbmQodGhpcykpO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOODqeODs+OCreODs+OCsOOBl+OBn+OBi+OBqeOBhuOBi+OBruODgeOCp+ODg+OCr1xyXG5jaGVja1JhbmtJbihkYXRhKSB7XHJcbiAgdGhpcy5yYW5rID0gZGF0YS5yYW5rO1xyXG59XHJcblxyXG5cclxuLy8vIOODj+OCpOOCueOCs+OCouOCqOODs+ODiOODquOBruihqOekulxyXG5wcmludFRvcDEwKCkge1xyXG4gIHZhciByYW5rbmFtZSA9IFsnIDFzdCcsICcgMm5kJywgJyAzcmQnLCAnIDR0aCcsICcgNXRoJywgJyA2dGgnLCAnIDd0aCcsICcgOHRoJywgJyA5dGgnLCAnMTB0aCddO1xyXG4gIHRoaXMudGV4dFBsYW5lLnByaW50KDgsIDQsICdUb3AgMTAgU2NvcmUnKTtcclxuICB2YXIgeSA9IDg7XHJcbiAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHRoaXMuaGlnaFNjb3Jlcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgdmFyIHNjb3JlU3RyID0gJzAwMDAwMDAwJyArIHRoaXMuaGlnaFNjb3Jlc1tpXS5zY29yZTtcclxuICAgIHNjb3JlU3RyID0gc2NvcmVTdHIuc3Vic3RyKHNjb3JlU3RyLmxlbmd0aCAtIDgsIDgpO1xyXG4gICAgaWYgKHRoaXMucmFuayA9PSBpKSB7XHJcbiAgICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDMsIHksIHJhbmtuYW1lW2ldICsgJyAnICsgc2NvcmVTdHIgKyAnICcgKyB0aGlzLmhpZ2hTY29yZXNbaV0ubmFtZSwgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnRleHRQbGFuZS5wcmludCgzLCB5LCByYW5rbmFtZVtpXSArICcgJyArIHNjb3JlU3RyICsgJyAnICsgdGhpcy5oaWdoU2NvcmVzW2ldLm5hbWUpO1xyXG4gICAgfVxyXG4gICAgeSArPSAyO1xyXG4gIH1cclxufVxyXG5cclxuXHJcbippbml0VG9wMTAodGFza0luZGV4KSB7XHJcbiAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgdGhpcy50ZXh0UGxhbmUuY2xzKCk7XHJcbiAgdGhpcy5wcmludFRvcDEwKCk7XHJcbiAgdGhpcy5zaG93VG9wMTAuZW5kVGltZSA9IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgKyA1O1xyXG4gIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLnNob3dUb3AxMC5iaW5kKHRoaXMpKTtcclxufVxyXG5cclxuKnNob3dUb3AxMCh0YXNrSW5kZXgpIHtcclxuICB3aGlsZSh0aGlzLnNob3dUb3AxMC5lbmRUaW1lID49IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgJiYgdGhpcy5iYXNpY0lucHV0LmtleUJ1ZmZlci5sZW5ndGggPT0gMCAmJiB0YXNrSW5kZXggPj0gMClcclxuICB7XHJcbiAgICBzZmcuZ2FtZVRpbWVyLnVwZGF0ZSgpO1xyXG4gICAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgfSBcclxuICBcclxuICB0aGlzLmJhc2ljSW5wdXQua2V5QnVmZmVyLmxlbmd0aCA9IDA7XHJcbiAgdGhpcy50ZXh0UGxhbmUuY2xzKCk7XHJcbiAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuaW5pdFRpdGxlLmJpbmQodGhpcykpO1xyXG59XHJcbn1cclxuXHJcblxyXG5cclxuXHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBDb2xsaXNpb25BcmVhIHtcclxuICBjb25zdHJ1Y3RvcihvZmZzZXRYLCBvZmZzZXRZLCB3aWR0aCwgaGVpZ2h0KVxyXG4gIHtcclxuICAgIHRoaXMub2Zmc2V0WCA9IG9mZnNldFggfHwgMDtcclxuICAgIHRoaXMub2Zmc2V0WSA9IG9mZnNldFkgfHwgMDtcclxuICAgIHRoaXMudG9wID0gMDtcclxuICAgIHRoaXMuYm90dG9tID0gMDtcclxuICAgIHRoaXMubGVmdCA9IDA7XHJcbiAgICB0aGlzLnJpZ2h0ID0gMDtcclxuICAgIHRoaXMud2lkdGggPSB3aWR0aCB8fCAwO1xyXG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQgfHwgMDtcclxuICAgIHRoaXMud2lkdGhfID0gMDtcclxuICAgIHRoaXMuaGVpZ2h0XyA9IDA7XHJcbiAgfVxyXG4gIGdldCB3aWR0aCgpIHsgcmV0dXJuIHRoaXMud2lkdGhfOyB9XHJcbiAgc2V0IHdpZHRoKHYpIHtcclxuICAgIHRoaXMud2lkdGhfID0gdjtcclxuICAgIHRoaXMubGVmdCA9IHRoaXMub2Zmc2V0WCAtIHYgLyAyO1xyXG4gICAgdGhpcy5yaWdodCA9IHRoaXMub2Zmc2V0WCArIHYgLyAyO1xyXG4gIH1cclxuICBnZXQgaGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5oZWlnaHRfOyB9XHJcbiAgc2V0IGhlaWdodCh2KSB7XHJcbiAgICB0aGlzLmhlaWdodF8gPSB2O1xyXG4gICAgdGhpcy50b3AgPSB0aGlzLm9mZnNldFkgKyB2IC8gMjtcclxuICAgIHRoaXMuYm90dG9tID0gdGhpcy5vZmZzZXRZIC0gdiAvIDI7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgR2FtZU9iaiB7XHJcbiAgY29uc3RydWN0b3IoeCwgeSwgeikge1xyXG4gICAgdGhpcy54XyA9IHggfHwgMDtcclxuICAgIHRoaXMueV8gPSB5IHx8IDA7XHJcbiAgICB0aGlzLnpfID0geiB8fCAwLjA7XHJcbiAgICB0aGlzLmVuYWJsZV8gPSBmYWxzZTtcclxuICAgIHRoaXMud2lkdGggPSAwO1xyXG4gICAgdGhpcy5oZWlnaHQgPSAwO1xyXG4gICAgdGhpcy5jb2xsaXNpb25BcmVhID0gbmV3IENvbGxpc2lvbkFyZWEoKTtcclxuICB9XHJcbiAgZ2V0IHgoKSB7IHJldHVybiB0aGlzLnhfOyB9XHJcbiAgc2V0IHgodikgeyB0aGlzLnhfID0gdjsgfVxyXG4gIGdldCB5KCkgeyByZXR1cm4gdGhpcy55XzsgfVxyXG4gIHNldCB5KHYpIHsgdGhpcy55XyA9IHY7IH1cclxuICBnZXQgeigpIHsgcmV0dXJuIHRoaXMuel87IH1cclxuICBzZXQgeih2KSB7IHRoaXMuel8gPSB2OyB9XHJcbn1cclxuXHJcbiIsImV4cG9ydCBjb25zdCBWSVJUVUFMX1dJRFRIID0gMjQwO1xyXG5leHBvcnQgY29uc3QgVklSVFVBTF9IRUlHSFQgPSAzMjA7XHJcblxyXG5leHBvcnQgY29uc3QgVl9SSUdIVCA9IFZJUlRVQUxfV0lEVEggLyAyLjA7XHJcbmV4cG9ydCBjb25zdCBWX1RPUCA9IFZJUlRVQUxfSEVJR0hUIC8gMi4wO1xyXG5leHBvcnQgY29uc3QgVl9MRUZUID0gLTEgKiBWSVJUVUFMX1dJRFRIIC8gMi4wO1xyXG5leHBvcnQgY29uc3QgVl9CT1RUT00gPSAtMSAqIFZJUlRVQUxfSEVJR0hUIC8gMi4wO1xyXG5cclxuZXhwb3J0IGNvbnN0IENIQVJfU0laRSA9IDg7XHJcbmV4cG9ydCBjb25zdCBURVhUX1dJRFRIID0gVklSVFVBTF9XSURUSCAvIENIQVJfU0laRTtcclxuZXhwb3J0IGNvbnN0IFRFWFRfSEVJR0hUID0gVklSVFVBTF9IRUlHSFQgLyBDSEFSX1NJWkU7XHJcbmV4cG9ydCBjb25zdCBQSVhFTF9TSVpFID0gMTtcclxuZXhwb3J0IGNvbnN0IEFDVFVBTF9DSEFSX1NJWkUgPSBDSEFSX1NJWkUgKiBQSVhFTF9TSVpFO1xyXG5leHBvcnQgY29uc3QgU1BSSVRFX1NJWkVfWCA9IDE2LjA7XHJcbmV4cG9ydCBjb25zdCBTUFJJVEVfU0laRV9ZID0gMTYuMDtcclxuZXhwb3J0IHZhciBDSEVDS19DT0xMSVNJT04gPSB0cnVlO1xyXG5leHBvcnQgdmFyIERFQlVHID0gZmFsc2U7XHJcbmV4cG9ydCB2YXIgdGV4dHVyZUZpbGVzID0ge307XHJcbmV4cG9ydCB2YXIgc3RhZ2U7XHJcbmV4cG9ydCB2YXIgdGFza3M7XHJcbmV4cG9ydCB2YXIgZ2FtZVRpbWVyO1xyXG5leHBvcnQgdmFyIGJvbWJzO1xyXG5leHBvcnQgdmFyIGFkZFNjb3JlO1xyXG5leHBvcnQgdmFyIG15c2hpcF87XHJcbmV4cG9ydCBjb25zdCB0ZXh0dXJlUm9vdCA9ICcuL3Jlcy8nO1xyXG5leHBvcnQgdmFyIHBhdXNlID0gZmFsc2U7XHJcbmV4cG9ydCB2YXIgZ2FtZTtcclxuXHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0ICogYXMgZyBmcm9tICcuL2dsb2JhbCc7XHJcblxyXG4vLy8g44OG44Kv44K544OB44Oj44O844Go44GX44GmY2FudmFz44KS5L2/44GG5aC05ZCI44Gu44OY44Or44OR44O8XHJcbmV4cG9ydCBmdW5jdGlvbiBDYW52YXNUZXh0dXJlKHdpZHRoLCBoZWlnaHQpIHtcclxuICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gIHRoaXMuY2FudmFzLndpZHRoID0gd2lkdGggfHwgZy5WSVJUVUFMX1dJRFRIO1xyXG4gIHRoaXMuY2FudmFzLmhlaWdodCA9IGhlaWdodCB8fCBnLlZJUlRVQUxfSEVJR0hUO1xyXG4gIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICB0aGlzLnRleHR1cmUgPSBuZXcgVEhSRUUuVGV4dHVyZSh0aGlzLmNhbnZhcyk7XHJcbiAgdGhpcy50ZXh0dXJlLm1hZ0ZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XHJcbiAgdGhpcy50ZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLkxpbmVhck1pcE1hcExpbmVhckZpbHRlcjtcclxuICB0aGlzLm1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgbWFwOiB0aGlzLnRleHR1cmUsIHRyYW5zcGFyZW50OiB0cnVlIH0pO1xyXG4gIHRoaXMuZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSh0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuICB0aGlzLm1lc2ggPSBuZXcgVEhSRUUuTWVzaCh0aGlzLmdlb21ldHJ5LCB0aGlzLm1hdGVyaWFsKTtcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueiA9IDAuMDAxO1xyXG4gIC8vIOOCueODoOODvOOCuOODs+OCsOOCkuWIh+OCi1xyXG4gIHRoaXMuY3R4Lm1zSW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgdGhpcy5jdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgLy90aGlzLmN0eC53ZWJraXRJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICB0aGlzLmN0eC5tb3pJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxufVxyXG5cclxuLy8vIOODl+ODreOCsOODrOOCueODkOODvOihqOekuuOCr+ODqeOCuVxyXG5leHBvcnQgZnVuY3Rpb24gUHJvZ3Jlc3MoKSB7XHJcbiAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTs7XHJcbiAgdmFyIHdpZHRoID0gMTtcclxuICB3aGlsZSAod2lkdGggPD0gZy5WSVJUVUFMX1dJRFRIKXtcclxuICAgIHdpZHRoICo9IDI7XHJcbiAgfVxyXG4gIHZhciBoZWlnaHQgPSAxO1xyXG4gIHdoaWxlIChoZWlnaHQgPD0gZy5WSVJUVUFMX0hFSUdIVCl7XHJcbiAgICBoZWlnaHQgKj0gMjtcclxuICB9XHJcbiAgdGhpcy5jYW52YXMud2lkdGggPSB3aWR0aDtcclxuICB0aGlzLmNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gIHRoaXMudGV4dHVyZSA9IG5ldyBUSFJFRS5UZXh0dXJlKHRoaXMuY2FudmFzKTtcclxuICB0aGlzLnRleHR1cmUubWFnRmlsdGVyID0gVEhSRUUuTmVhcmVzdEZpbHRlcjtcclxuICB0aGlzLnRleHR1cmUubWluRmlsdGVyID0gVEhSRUUuTGluZWFyTWlwTWFwTGluZWFyRmlsdGVyO1xyXG4gIC8vIOOCueODoOODvOOCuOODs+OCsOOCkuWIh+OCi1xyXG4gIHRoaXMuY3R4Lm1zSW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgdGhpcy5jdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgLy90aGlzLmN0eC53ZWJraXRJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICB0aGlzLmN0eC5tb3pJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuXHJcbiAgdGhpcy5tYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7IG1hcDogdGhpcy50ZXh0dXJlLCB0cmFuc3BhcmVudDogdHJ1ZSB9KTtcclxuICB0aGlzLmdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkodGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcbiAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2godGhpcy5nZW9tZXRyeSwgdGhpcy5tYXRlcmlhbCk7XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnggPSAod2lkdGggLSBnLlZJUlRVQUxfV0lEVEgpIC8gMjtcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueSA9ICAtIChoZWlnaHQgLSBnLlZJUlRVQUxfSEVJR0hUKSAvIDI7XHJcblxyXG4gIC8vdGhpcy50ZXh0dXJlLnByZW11bHRpcGx5QWxwaGEgPSB0cnVlO1xyXG59XHJcblxyXG4vLy8g44OX44Ot44Kw44Os44K544OQ44O844KS6KGo56S644GZ44KL44CCXHJcblByb2dyZXNzLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiAobWVzc2FnZSwgcGVyY2VudCkge1xyXG4gIHZhciBjdHggPSB0aGlzLmN0eDtcclxuICB2YXIgd2lkdGggPSB0aGlzLmNhbnZhcy53aWR0aCwgaGVpZ2h0ID0gdGhpcy5jYW52YXMuaGVpZ2h0O1xyXG4gIC8vICAgICAgY3R4LmZpbGxTdHlsZSA9ICdyZ2JhKDAsMCwwLDApJztcclxuICBjdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG4gIHZhciB0ZXh0V2lkdGggPSBjdHgubWVhc3VyZVRleHQobWVzc2FnZSkud2lkdGg7XHJcbiAgY3R4LnN0cm9rZVN0eWxlID0gY3R4LmZpbGxTdHlsZSA9ICdyZ2JhKDI1NSwyNTUsMjU1LDEuMCknO1xyXG5cclxuICBjdHguZmlsbFRleHQobWVzc2FnZSwgKHdpZHRoIC0gdGV4dFdpZHRoKSAvIDIsIDEwMCk7XHJcbiAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gIGN0eC5yZWN0KDIwLCA3NSwgd2lkdGggLSAyMCAqIDIsIDEwKTtcclxuICBjdHguc3Ryb2tlKCk7XHJcbiAgY3R4LmZpbGxSZWN0KDIwLCA3NSwgKHdpZHRoIC0gMjAgKiAyKSAqIHBlcmNlbnQgLyAxMDAsIDEwKTtcclxuICB0aGlzLnRleHR1cmUubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG59XHJcblxyXG4vLy8gaW1n44GL44KJ44K444Kq44Oh44OI44Oq44KS5L2c5oiQ44GZ44KLXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVHZW9tZXRyeUZyb21JbWFnZShpbWFnZSkge1xyXG4gIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICB2YXIgdyA9IHRleHR1cmVGaWxlcy5hdXRob3IudGV4dHVyZS5pbWFnZS53aWR0aDtcclxuICB2YXIgaCA9IHRleHR1cmVGaWxlcy5hdXRob3IudGV4dHVyZS5pbWFnZS5oZWlnaHQ7XHJcbiAgY2FudmFzLndpZHRoID0gdztcclxuICBjYW52YXMuaGVpZ2h0ID0gaDtcclxuICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgY3R4LmRyYXdJbWFnZShpbWFnZSwgMCwgMCk7XHJcbiAgdmFyIGRhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIHcsIGgpO1xyXG4gIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5HZW9tZXRyeSgpO1xyXG4gIHtcclxuICAgIHZhciBpID0gMDtcclxuXHJcbiAgICBmb3IgKHZhciB5ID0gMDsgeSA8IGg7ICsreSkge1xyXG4gICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHc7ICsreCkge1xyXG4gICAgICAgIHZhciBjb2xvciA9IG5ldyBUSFJFRS5Db2xvcigpO1xyXG5cclxuICAgICAgICB2YXIgciA9IGRhdGEuZGF0YVtpKytdO1xyXG4gICAgICAgIHZhciBnID0gZGF0YS5kYXRhW2krK107XHJcbiAgICAgICAgdmFyIGIgPSBkYXRhLmRhdGFbaSsrXTtcclxuICAgICAgICB2YXIgYSA9IGRhdGEuZGF0YVtpKytdO1xyXG4gICAgICAgIGlmIChhICE9IDApIHtcclxuICAgICAgICAgIGNvbG9yLnNldFJHQihyIC8gMjU1LjAsIGcgLyAyNTUuMCwgYiAvIDI1NS4wKTtcclxuICAgICAgICAgIHZhciB2ZXJ0ID0gbmV3IFRIUkVFLlZlY3RvcjMoKCh4IC0gdyAvIDIuMCkpICogMi4wLCAoKHkgLSBoIC8gMikpICogLTIuMCwgMC4wKTtcclxuICAgICAgICAgIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2godmVydCk7XHJcbiAgICAgICAgICBnZW9tZXRyeS5jb2xvcnMucHVzaChjb2xvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3ByaXRlR2VvbWV0cnkoc2l6ZSlcclxue1xyXG4gIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5HZW9tZXRyeSgpO1xyXG4gIHZhciBzaXplSGFsZiA9IHNpemUgLyAyO1xyXG4gIC8vIGdlb21ldHJ5LlxyXG4gIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2gobmV3IFRIUkVFLlZlY3RvcjMoLXNpemVIYWxmLCBzaXplSGFsZiwgMCkpO1xyXG4gIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2gobmV3IFRIUkVFLlZlY3RvcjMoc2l6ZUhhbGYsIHNpemVIYWxmLCAwKSk7XHJcbiAgZ2VvbWV0cnkudmVydGljZXMucHVzaChuZXcgVEhSRUUuVmVjdG9yMyhzaXplSGFsZiwgLXNpemVIYWxmLCAwKSk7XHJcbiAgZ2VvbWV0cnkudmVydGljZXMucHVzaChuZXcgVEhSRUUuVmVjdG9yMygtc2l6ZUhhbGYsIC1zaXplSGFsZiwgMCkpO1xyXG4gIGdlb21ldHJ5LmZhY2VzLnB1c2gobmV3IFRIUkVFLkZhY2UzKDAsIDIsIDEpKTtcclxuICBnZW9tZXRyeS5mYWNlcy5wdXNoKG5ldyBUSFJFRS5GYWNlMygwLCAzLCAyKSk7XHJcbiAgcmV0dXJuIGdlb21ldHJ5O1xyXG59XHJcblxyXG4vLy8g44OG44Kv44K544OB44Oj44O85LiK44Gu5oyH5a6a44K544OX44Op44Kk44OI44GuVVbluqfmqJnjgpLmsYLjgoHjgotcclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNwcml0ZVVWKGdlb21ldHJ5LCB0ZXh0dXJlLCBjZWxsV2lkdGgsIGNlbGxIZWlnaHQsIGNlbGxObylcclxue1xyXG4gIHZhciB3aWR0aCA9IHRleHR1cmUuaW1hZ2Uud2lkdGg7XHJcbiAgdmFyIGhlaWdodCA9IHRleHR1cmUuaW1hZ2UuaGVpZ2h0O1xyXG5cclxuICB2YXIgdUNlbGxDb3VudCA9ICh3aWR0aCAvIGNlbGxXaWR0aCkgfCAwO1xyXG4gIHZhciB2Q2VsbENvdW50ID0gKGhlaWdodCAvIGNlbGxIZWlnaHQpIHwgMDtcclxuICB2YXIgdlBvcyA9IHZDZWxsQ291bnQgLSAoKGNlbGxObyAvIHVDZWxsQ291bnQpIHwgMCk7XHJcbiAgdmFyIHVQb3MgPSBjZWxsTm8gJSB1Q2VsbENvdW50O1xyXG4gIHZhciB1VW5pdCA9IGNlbGxXaWR0aCAvIHdpZHRoOyBcclxuICB2YXIgdlVuaXQgPSBjZWxsSGVpZ2h0IC8gaGVpZ2h0O1xyXG5cclxuICBnZW9tZXRyeS5mYWNlVmVydGV4VXZzWzBdLnB1c2goW1xyXG4gICAgbmV3IFRIUkVFLlZlY3RvcjIoKHVQb3MpICogY2VsbFdpZHRoIC8gd2lkdGgsICh2UG9zKSAqIGNlbGxIZWlnaHQgLyBoZWlnaHQpLFxyXG4gICAgbmV3IFRIUkVFLlZlY3RvcjIoKHVQb3MgKyAxKSAqIGNlbGxXaWR0aCAvIHdpZHRoLCAodlBvcyAtIDEpICogY2VsbEhlaWdodCAvIGhlaWdodCksXHJcbiAgICBuZXcgVEhSRUUuVmVjdG9yMigodVBvcyArIDEpICogY2VsbFdpZHRoIC8gd2lkdGgsICh2UG9zKSAqIGNlbGxIZWlnaHQgLyBoZWlnaHQpXHJcbiAgXSk7XHJcbiAgZ2VvbWV0cnkuZmFjZVZlcnRleFV2c1swXS5wdXNoKFtcclxuICAgIG5ldyBUSFJFRS5WZWN0b3IyKCh1UG9zKSAqIGNlbGxXaWR0aCAvIHdpZHRoLCAodlBvcykgKiBjZWxsSGVpZ2h0IC8gaGVpZ2h0KSxcclxuICAgIG5ldyBUSFJFRS5WZWN0b3IyKCh1UG9zKSAqIGNlbGxXaWR0aCAvIHdpZHRoLCAodlBvcyAtIDEpICogY2VsbEhlaWdodCAvIGhlaWdodCksXHJcbiAgICBuZXcgVEhSRUUuVmVjdG9yMigodVBvcyArIDEpICogY2VsbFdpZHRoIC8gd2lkdGgsICh2UG9zIC0gMSkgKiBjZWxsSGVpZ2h0IC8gaGVpZ2h0KVxyXG4gIF0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlU3ByaXRlVVYoZ2VvbWV0cnksIHRleHR1cmUsIGNlbGxXaWR0aCwgY2VsbEhlaWdodCwgY2VsbE5vKVxyXG57XHJcbiAgdmFyIHdpZHRoID0gdGV4dHVyZS5pbWFnZS53aWR0aDtcclxuICB2YXIgaGVpZ2h0ID0gdGV4dHVyZS5pbWFnZS5oZWlnaHQ7XHJcblxyXG4gIHZhciB1Q2VsbENvdW50ID0gKHdpZHRoIC8gY2VsbFdpZHRoKSB8IDA7XHJcbiAgdmFyIHZDZWxsQ291bnQgPSAoaGVpZ2h0IC8gY2VsbEhlaWdodCkgfCAwO1xyXG4gIHZhciB2UG9zID0gdkNlbGxDb3VudCAtICgoY2VsbE5vIC8gdUNlbGxDb3VudCkgfCAwKTtcclxuICB2YXIgdVBvcyA9IGNlbGxObyAlIHVDZWxsQ291bnQ7XHJcbiAgdmFyIHVVbml0ID0gY2VsbFdpZHRoIC8gd2lkdGg7XHJcbiAgdmFyIHZVbml0ID0gY2VsbEhlaWdodCAvIGhlaWdodDtcclxuICB2YXIgdXZzID0gZ2VvbWV0cnkuZmFjZVZlcnRleFV2c1swXVswXTtcclxuXHJcbiAgdXZzWzBdLnggPSAodVBvcykgKiB1VW5pdDtcclxuICB1dnNbMF0ueSA9ICh2UG9zKSAqIHZVbml0O1xyXG4gIHV2c1sxXS54ID0gKHVQb3MgKyAxKSAqIHVVbml0O1xyXG4gIHV2c1sxXS55ID0gKHZQb3MgLSAxKSAqIHZVbml0O1xyXG4gIHV2c1syXS54ID0gKHVQb3MgKyAxKSAqIHVVbml0O1xyXG4gIHV2c1syXS55ID0gKHZQb3MpICogdlVuaXQ7XHJcblxyXG4gIHV2cyA9IGdlb21ldHJ5LmZhY2VWZXJ0ZXhVdnNbMF1bMV07XHJcblxyXG4gIHV2c1swXS54ID0gKHVQb3MpICogdVVuaXQ7XHJcbiAgdXZzWzBdLnkgPSAodlBvcykgKiB2VW5pdDtcclxuICB1dnNbMV0ueCA9ICh1UG9zKSAqIHVVbml0O1xyXG4gIHV2c1sxXS55ID0gKHZQb3MgLSAxKSAqIHZVbml0O1xyXG4gIHV2c1syXS54ID0gKHVQb3MgKyAxKSAqIHVVbml0O1xyXG4gIHV2c1syXS55ID0gKHZQb3MgLSAxKSAqIHZVbml0O1xyXG5cclxuIFxyXG4gIGdlb21ldHJ5LnV2c05lZWRVcGRhdGUgPSB0cnVlO1xyXG5cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNwcml0ZU1hdGVyaWFsKHRleHR1cmUpXHJcbntcclxuICAvLyDjg6Hjg4Pjgrfjg6Xjga7kvZzmiJDjg7vooajnpLogLy8vXHJcbiAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgbWFwOiB0ZXh0dXJlIC8qLGRlcHRoVGVzdDp0cnVlKi8sIHRyYW5zcGFyZW50OiB0cnVlIH0pO1xyXG4gIG1hdGVyaWFsLnNoYWRpbmcgPSBUSFJFRS5GbGF0U2hhZGluZztcclxuICBtYXRlcmlhbC5zaWRlID0gVEhSRUUuRnJvbnRTaWRlO1xyXG4gIG1hdGVyaWFsLmFscGhhVGVzdCA9IDAuNTtcclxuICBtYXRlcmlhbC5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbi8vICBtYXRlcmlhbC5cclxuICByZXR1cm4gbWF0ZXJpYWw7XHJcbn1cclxuXHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0ICogYXMgc2ZnIGZyb20gJy4vZ2xvYmFsJzsgXHJcblxyXG4vLyDjgq3jg7zlhaXliptcclxuZXhwb3J0IGNsYXNzIEJhc2ljSW5wdXR7XHJcbmNvbnN0cnVjdG9yICgpIHtcclxuICB0aGlzLmtleUNoZWNrID0geyB1cDogZmFsc2UsIGRvd246IGZhbHNlLCBsZWZ0OiBmYWxzZSwgcmlnaHQ6IGZhbHNlLCB6OiBmYWxzZSAseDpmYWxzZX07XHJcbiAgdGhpcy5rZXlCdWZmZXIgPSBbXTtcclxuICB0aGlzLmtleXVwXyA9IG51bGw7XHJcbiAgdGhpcy5rZXlkb3duXyA9IG51bGw7XHJcbiAgLy90aGlzLmdhbWVwYWRDaGVjayA9IHsgdXA6IGZhbHNlLCBkb3duOiBmYWxzZSwgbGVmdDogZmFsc2UsIHJpZ2h0OiBmYWxzZSwgejogZmFsc2UgLHg6ZmFsc2V9O1xyXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdnYW1lcGFkY29ubmVjdGVkJywoZSk9PntcclxuICAgIHRoaXMuZ2FtZXBhZCA9IGUuZ2FtZXBhZDtcclxuICB9KTtcclxuIFxyXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdnYW1lcGFkZGlzY29ubmVjdGVkJywoZSk9PntcclxuICAgIGRlbGV0ZSB0aGlzLmdhbWVwYWQ7XHJcbiAgfSk7IFxyXG4gXHJcbiBpZih3aW5kb3cubmF2aWdhdG9yLmdldEdhbWVwYWRzKXtcclxuICAgdGhpcy5nYW1lcGFkID0gd2luZG93Lm5hdmlnYXRvci5nZXRHYW1lcGFkcygpWzBdO1xyXG4gfSBcclxufVxyXG5cclxuICBjbGVhcigpXHJcbiAge1xyXG4gICAgZm9yKHZhciBkIGluIHRoaXMua2V5Q2hlY2spe1xyXG4gICAgICB0aGlzLmtleUNoZWNrW2RdID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB0aGlzLmtleUJ1ZmZlci5sZW5ndGggPSAwO1xyXG4gIH1cclxuICBcclxuICBrZXlkb3duKGUpIHtcclxuICAgIHZhciBlID0gZDMuZXZlbnQ7XHJcbiAgICB2YXIga2V5QnVmZmVyID0gdGhpcy5rZXlCdWZmZXI7XHJcbiAgICB2YXIga2V5Q2hlY2sgPSB0aGlzLmtleUNoZWNrO1xyXG4gICAgdmFyIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgXHJcbiAgICBpZiAoa2V5QnVmZmVyLmxlbmd0aCA+IDE2KSB7XHJcbiAgICAgIGtleUJ1ZmZlci5zaGlmdCgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpZiAoZS5rZXlDb2RlID09IDgwIC8qIFAgKi8pIHtcclxuICAgICAgaWYgKCFzZmcucGF1c2UpIHtcclxuICAgICAgICBzZmcuZ2FtZS5wYXVzZSgpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNmZy5nYW1lLnJlc3VtZSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAgICAgICBcclxuICAgIGtleUJ1ZmZlci5wdXNoKGUua2V5Q29kZSk7XHJcbiAgICBzd2l0Y2ggKGUua2V5Q29kZSkge1xyXG4gICAgICBjYXNlIDc0OlxyXG4gICAgICBjYXNlIDM3OlxyXG4gICAgICBjYXNlIDEwMDpcclxuICAgICAgICBrZXlDaGVjay5sZWZ0ID0gdHJ1ZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDczOlxyXG4gICAgICBjYXNlIDM4OlxyXG4gICAgICBjYXNlIDEwNDpcclxuICAgICAgICBrZXlDaGVjay51cCA9IHRydWU7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA3NjpcclxuICAgICAgY2FzZSAzOTpcclxuICAgICAgY2FzZSAxMDI6XHJcbiAgICAgICAga2V5Q2hlY2sucmlnaHQgPSB0cnVlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgNzU6XHJcbiAgICAgIGNhc2UgNDA6XHJcbiAgICAgIGNhc2UgOTg6XHJcbiAgICAgICAga2V5Q2hlY2suZG93biA9IHRydWU7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA5MDpcclxuICAgICAgICBrZXlDaGVjay56ID0gdHJ1ZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDg4OlxyXG4gICAgICAgIGtleUNoZWNrLnggPSB0cnVlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICBpZiAoaGFuZGxlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIGtleXVwKCkge1xyXG4gICAgdmFyIGUgPSBkMy5ldmVudDtcclxuICAgIHZhciBrZXlCdWZmZXIgPSB0aGlzLmtleUJ1ZmZlcjtcclxuICAgIHZhciBrZXlDaGVjayA9IHRoaXMua2V5Q2hlY2s7XHJcbiAgICB2YXIgaGFuZGxlID0gZmFsc2U7XHJcbiAgICBzd2l0Y2ggKGUua2V5Q29kZSkge1xyXG4gICAgICBjYXNlIDc0OlxyXG4gICAgICBjYXNlIDM3OlxyXG4gICAgICBjYXNlIDEwMDpcclxuICAgICAgICBrZXlDaGVjay5sZWZ0ID0gZmFsc2U7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA3MzpcclxuICAgICAgY2FzZSAzODpcclxuICAgICAgY2FzZSAxMDQ6XHJcbiAgICAgICAga2V5Q2hlY2sudXAgPSBmYWxzZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDc2OlxyXG4gICAgICBjYXNlIDM5OlxyXG4gICAgICBjYXNlIDEwMjpcclxuICAgICAgICBrZXlDaGVjay5yaWdodCA9IGZhbHNlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgNzU6XHJcbiAgICAgIGNhc2UgNDA6XHJcbiAgICAgIGNhc2UgOTg6XHJcbiAgICAgICAga2V5Q2hlY2suZG93biA9IGZhbHNlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgOTA6XHJcbiAgICAgICAga2V5Q2hlY2sueiA9IGZhbHNlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgODg6XHJcbiAgICAgICAga2V5Q2hlY2sueCA9IGZhbHNlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICBpZiAoaGFuZGxlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG4gIC8v44Kk44OZ44Oz44OI44Gr44OQ44Kk44Oz44OJ44GZ44KLXHJcbiAgYmluZCgpXHJcbiAge1xyXG4gICAgZDMuc2VsZWN0KCdib2R5Jykub24oJ2tleWRvd24uYmFzaWNJbnB1dCcsdGhpcy5rZXlkb3duLmJpbmQodGhpcykpO1xyXG4gICAgZDMuc2VsZWN0KCdib2R5Jykub24oJ2tleXVwLmJhc2ljSW5wdXQnLHRoaXMua2V5dXAuYmluZCh0aGlzKSk7XHJcbiAgfVxyXG4gIC8vIOOCouODs+ODkOOCpOODs+ODieOBmeOCi1xyXG4gIHVuYmluZCgpXHJcbiAge1xyXG4gICAgZDMuc2VsZWN0KCdib2R5Jykub24oJ2tleWRvd24uYmFzaWNJbnB1dCcsbnVsbCk7XHJcbiAgICBkMy5zZWxlY3QoJ2JvZHknKS5vbigna2V5dXAuYmFzaWNJbnB1dCcsbnVsbCk7XHJcbiAgfVxyXG4gIFxyXG4gIGdldCB1cCgpIHtcclxuICAgIHJldHVybiB0aGlzLmtleUNoZWNrLnVwIHx8ICh0aGlzLmdhbWVwYWQgJiYgKHRoaXMuZ2FtZXBhZC5idXR0b25zWzEyXS5wcmVzc2VkIHx8IHRoaXMuZ2FtZXBhZC5heGVzWzFdIDwgLTAuMSkpO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGRvd24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5rZXlDaGVjay5kb3duIHx8ICh0aGlzLmdhbWVwYWQgJiYgKHRoaXMuZ2FtZXBhZC5idXR0b25zWzEzXS5wcmVzc2VkIHx8IHRoaXMuZ2FtZXBhZC5heGVzWzFdID4gMC4xKSk7XHJcbiAgfVxyXG5cclxuICBnZXQgbGVmdCgpIHtcclxuICAgIHJldHVybiB0aGlzLmtleUNoZWNrLmxlZnQgfHwgKHRoaXMuZ2FtZXBhZCAmJiAodGhpcy5nYW1lcGFkLmJ1dHRvbnNbMTRdLnByZXNzZWQgfHwgdGhpcy5nYW1lcGFkLmF4ZXNbMF0gPCAtMC4xKSk7XHJcbiAgfVxyXG5cclxuICBnZXQgcmlnaHQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5rZXlDaGVjay5yaWdodCB8fCAodGhpcy5nYW1lcGFkICYmICh0aGlzLmdhbWVwYWQuYnV0dG9uc1sxNV0ucHJlc3NlZCB8fCB0aGlzLmdhbWVwYWQuYXhlc1swXSA+IDAuMSkpO1xyXG4gIH1cclxuICBcclxuICBnZXQgeigpIHtcclxuICAgICBsZXQgcmV0ID0gdGhpcy5rZXlDaGVjay56IFxyXG4gICAgfHwgKCgoIXRoaXMuekJ1dHRvbiB8fCAodGhpcy56QnV0dG9uICYmICF0aGlzLnpCdXR0b24pICkgJiYgdGhpcy5nYW1lcGFkICYmIHRoaXMuZ2FtZXBhZC5idXR0b25zWzBdLnByZXNzZWQpKSA7XHJcbiAgICB0aGlzLnpCdXR0b24gPSB0aGlzLmdhbWVwYWQgJiYgdGhpcy5nYW1lcGFkLmJ1dHRvbnNbMF0ucHJlc3NlZDtcclxuICAgIHJldHVybiByZXQ7XHJcbiAgfVxyXG4gIFxyXG4gIGdldCBzdGFydCgpIHtcclxuICAgIGxldCByZXQgPSAoKCF0aGlzLnN0YXJ0QnV0dG9uXyB8fCAodGhpcy5zdGFydEJ1dHRvbl8gJiYgIXRoaXMuc3RhcnRCdXR0b25fKSApICYmIHRoaXMuZ2FtZXBhZCAmJiB0aGlzLmdhbWVwYWQuYnV0dG9uc1s5XS5wcmVzc2VkKSA7XHJcbiAgICB0aGlzLnN0YXJ0QnV0dG9uXyA9IHRoaXMuZ2FtZXBhZCAmJiB0aGlzLmdhbWVwYWQuYnV0dG9uc1s5XS5wcmVzc2VkO1xyXG4gICAgcmV0dXJuIHJldDtcclxuICB9XHJcbiAgXHJcbiAgZ2V0IGFCdXR0b24oKXtcclxuICAgICBsZXQgcmV0ID0gKCgoIXRoaXMuYUJ1dHRvbl8gfHwgKHRoaXMuYUJ1dHRvbl8gJiYgIXRoaXMuYUJ1dHRvbl8pICkgJiYgdGhpcy5nYW1lcGFkICYmIHRoaXMuZ2FtZXBhZC5idXR0b25zWzBdLnByZXNzZWQpKSA7XHJcbiAgICB0aGlzLmFCdXR0b25fID0gdGhpcy5nYW1lcGFkICYmIHRoaXMuZ2FtZXBhZC5idXR0b25zWzBdLnByZXNzZWQ7XHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH1cclxuICBcclxuICAqdXBkYXRlKHRhc2tJbmRleClcclxuICB7XHJcbiAgICB3aGlsZSh0YXNrSW5kZXggPj0gMCl7XHJcbiAgICAgIGlmKHdpbmRvdy5uYXZpZ2F0b3IuZ2V0R2FtZXBhZHMpe1xyXG4gICAgICAgIHRoaXMuZ2FtZXBhZCA9IHdpbmRvdy5uYXZpZ2F0b3IuZ2V0R2FtZXBhZHMoKVswXTtcclxuICAgICAgfSBcclxuICAgICAgdGFza0luZGV4ID0geWllbGQ7ICAgICBcclxuICAgIH1cclxuICB9XHJcbn0iLCJcInVzZSBzdHJpY3RcIjtcclxuLy92YXIgU1RBR0VfTUFYID0gMTtcclxuaW1wb3J0ICogYXMgc2ZnIGZyb20gJy4vZ2xvYmFsJzsgXHJcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsJztcclxuaW1wb3J0ICogYXMgYXVkaW8gZnJvbSAnLi9hdWRpbyc7XHJcbi8vaW1wb3J0ICogYXMgc29uZyBmcm9tICcuL3NvbmcnO1xyXG5pbXBvcnQgKiBhcyBncmFwaGljcyBmcm9tICcuL2dyYXBoaWNzJztcclxuaW1wb3J0ICogYXMgaW8gZnJvbSAnLi9pbyc7XHJcbmltcG9ydCAqIGFzIGNvbW0gZnJvbSAnLi9jb21tJztcclxuaW1wb3J0ICogYXMgdGV4dCBmcm9tICcuL3RleHQnO1xyXG5pbXBvcnQgKiBhcyBnYW1lb2JqIGZyb20gJy4vZ2FtZW9iaic7XHJcbmltcG9ydCAqIGFzIG15c2hpcCBmcm9tICcuL215c2hpcCc7XHJcbmltcG9ydCAqIGFzIGVuZW1pZXMgZnJvbSAnLi9lbmVtaWVzJztcclxuaW1wb3J0ICogYXMgZWZmZWN0b2JqIGZyb20gJy4vZWZmZWN0b2JqJztcclxuaW1wb3J0IHsgR2FtZSB9IGZyb20gJy4vZ2FtZSc7XHJcblxyXG4vLy8g44Oh44Kk44OzXHJcbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcblxyXG4gIHNmZy5nYW1lID0gbmV3IEdhbWUoKTtcclxuICBzZmcuZ2FtZS5leGVjKCk7XHJcblxyXG59O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCAqIGFzIHNmZyBmcm9tICcuL2dsb2JhbCc7XHJcbmltcG9ydCAqIGFzIGdhbWVvYmogZnJvbSAnLi9nYW1lb2JqJztcclxuaW1wb3J0ICogYXMgZ3JhcGhpY3MgZnJvbSAnLi9ncmFwaGljcyc7XHJcblxyXG52YXIgbXlCdWxsZXRzID0gW107XHJcblxyXG4vLy8g6Ieq5qmf5by+IFxyXG5leHBvcnQgY2xhc3MgTXlCdWxsZXQgZXh0ZW5kcyBnYW1lb2JqLkdhbWVPYmoge1xyXG4gIGNvbnN0cnVjdG9yKHNjZW5lLHNlKSB7XHJcbiAgc3VwZXIoMCwgMCwgMCk7XHJcblxyXG4gIHRoaXMuY29sbGlzaW9uQXJlYS53aWR0aCA9IDQ7XHJcbiAgdGhpcy5jb2xsaXNpb25BcmVhLmhlaWdodCA9IDY7XHJcbiAgdGhpcy5zcGVlZCA9IDg7XHJcbiAgdGhpcy5wb3dlciA9IDE7XHJcblxyXG4gIHRoaXMudGV4dHVyZVdpZHRoID0gc2ZnLnRleHR1cmVGaWxlcy5teXNoaXAuaW1hZ2Uud2lkdGg7XHJcbiAgdGhpcy50ZXh0dXJlSGVpZ2h0ID0gc2ZnLnRleHR1cmVGaWxlcy5teXNoaXAuaW1hZ2UuaGVpZ2h0O1xyXG5cclxuICAvLyDjg6Hjg4Pjgrfjg6Xjga7kvZzmiJDjg7vooajnpLogLy8vXHJcblxyXG4gIHZhciBtYXRlcmlhbCA9IGdyYXBoaWNzLmNyZWF0ZVNwcml0ZU1hdGVyaWFsKHNmZy50ZXh0dXJlRmlsZXMubXlzaGlwKTtcclxuICB2YXIgZ2VvbWV0cnkgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVHZW9tZXRyeSgxNik7XHJcbiAgZ3JhcGhpY3MuY3JlYXRlU3ByaXRlVVYoZ2VvbWV0cnksIHNmZy50ZXh0dXJlRmlsZXMubXlzaGlwLCAxNiwgMTYsIDEpO1xyXG4gIHRoaXMubWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcblxyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi54ID0gdGhpcy54XztcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueSA9IHRoaXMueV87XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnogPSB0aGlzLnpfO1xyXG4gIHRoaXMuc2UgPSBzZTtcclxuICAvL3NlKDApO1xyXG4gIC8vc2VxdWVuY2VyLnBsYXlUcmFja3Moc291bmRFZmZlY3RzLnNvdW5kRWZmZWN0c1swXSk7XHJcbiAgc2NlbmUuYWRkKHRoaXMubWVzaCk7XHJcbiAgdGhpcy5tZXNoLnZpc2libGUgPSB0aGlzLmVuYWJsZV8gPSBmYWxzZTtcclxuICAvLyAgc2ZnLnRhc2tzLnB1c2hUYXNrKGZ1bmN0aW9uICh0YXNrSW5kZXgpIHsgc2VsZi5tb3ZlKHRhc2tJbmRleCk7IH0pO1xyXG4gfVxyXG5cclxuICBnZXQgeCgpIHsgcmV0dXJuIHRoaXMueF87IH1cclxuICBzZXQgeCh2KSB7IHRoaXMueF8gPSB0aGlzLm1lc2gucG9zaXRpb24ueCA9IHY7IH1cclxuICBnZXQgeSgpIHsgcmV0dXJuIHRoaXMueV87IH1cclxuICBzZXQgeSh2KSB7IHRoaXMueV8gPSB0aGlzLm1lc2gucG9zaXRpb24ueSA9IHY7IH1cclxuICBnZXQgeigpIHsgcmV0dXJuIHRoaXMuel87IH1cclxuICBzZXQgeih2KSB7IHRoaXMuel8gPSB0aGlzLm1lc2gucG9zaXRpb24ueiA9IHY7IH1cclxuICAqbW92ZSh0YXNrSW5kZXgpIHtcclxuICAgIFxyXG4gICAgd2hpbGUgKHRhc2tJbmRleCA+PSAwIFxyXG4gICAgICAmJiB0aGlzLmVuYWJsZV9cclxuICAgICAgJiYgdGhpcy55IDw9IChzZmcuVl9UT1AgKyAxNikgXHJcbiAgICAgICYmIHRoaXMueSA+PSAoc2ZnLlZfQk9UVE9NIC0gMTYpIFxyXG4gICAgICAmJiB0aGlzLnggPD0gKHNmZy5WX1JJR0hUICsgMTYpIFxyXG4gICAgICAmJiB0aGlzLnggPj0gKHNmZy5WX0xFRlQgLSAxNikpXHJcbiAgICB7XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLnkgKz0gdGhpcy5keTtcclxuICAgICAgdGhpcy54ICs9IHRoaXMuZHg7XHJcbiAgICAgIFxyXG4gICAgICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICAgIH1cclxuXHJcbiAgICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICAgIHNmZy50YXNrcy5yZW1vdmVUYXNrKHRhc2tJbmRleCk7XHJcbiAgICB0aGlzLmVuYWJsZV8gPSB0aGlzLm1lc2gudmlzaWJsZSA9IGZhbHNlO1xyXG59XHJcblxyXG4gIHN0YXJ0KHgsIHksIHosIGFpbVJhZGlhbixwb3dlcikge1xyXG4gICAgaWYgKHRoaXMuZW5hYmxlXykge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB0aGlzLnggPSB4O1xyXG4gICAgdGhpcy55ID0geTtcclxuICAgIHRoaXMueiA9IHogLSAwLjE7XHJcbiAgICB0aGlzLnBvd2VyID0gcG93ZXIgfCAxO1xyXG4gICAgdGhpcy5keCA9IE1hdGguY29zKGFpbVJhZGlhbikgKiB0aGlzLnNwZWVkO1xyXG4gICAgdGhpcy5keSA9IE1hdGguc2luKGFpbVJhZGlhbikgKiB0aGlzLnNwZWVkO1xyXG4gICAgdGhpcy5lbmFibGVfID0gdGhpcy5tZXNoLnZpc2libGUgPSB0cnVlO1xyXG4gICAgdGhpcy5zZSgwKTtcclxuICAgIC8vc2VxdWVuY2VyLnBsYXlUcmFja3Moc291bmRFZmZlY3RzLnNvdW5kRWZmZWN0c1swXSk7XHJcbiAgICB0aGlzLnRhc2sgPSBzZmcudGFza3MucHVzaFRhc2sodGhpcy5tb3ZlLmJpbmQodGhpcykpO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g6Ieq5qmf44Kq44OW44K444Kn44Kv44OIXHJcbmV4cG9ydCBjbGFzcyBNeVNoaXAgZXh0ZW5kcyBnYW1lb2JqLkdhbWVPYmogeyBcclxuICBjb25zdHJ1Y3Rvcih4LCB5LCB6LHNjZW5lLHNlKSB7XHJcbiAgc3VwZXIoeCwgeSwgeik7Ly8gZXh0ZW5kXHJcblxyXG4gIHRoaXMuY29sbGlzaW9uQXJlYS53aWR0aCA9IDY7XHJcbiAgdGhpcy5jb2xsaXNpb25BcmVhLmhlaWdodCA9IDg7XHJcbiAgdGhpcy5zZSA9IHNlO1xyXG4gIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuICB0aGlzLnRleHR1cmVXaWR0aCA9IHNmZy50ZXh0dXJlRmlsZXMubXlzaGlwLmltYWdlLndpZHRoO1xyXG4gIHRoaXMudGV4dHVyZUhlaWdodCA9IHNmZy50ZXh0dXJlRmlsZXMubXlzaGlwLmltYWdlLmhlaWdodDtcclxuICB0aGlzLndpZHRoID0gMTY7XHJcbiAgdGhpcy5oZWlnaHQgPSAxNjtcclxuXHJcbiAgLy8g56e75YuV56+E5Zuy44KS5rGC44KB44KLXHJcbiAgdGhpcy50b3AgPSAoc2ZnLlZfVE9QIC0gdGhpcy5oZWlnaHQgLyAyKSB8IDA7XHJcbiAgdGhpcy5ib3R0b20gPSAoc2ZnLlZfQk9UVE9NICsgdGhpcy5oZWlnaHQgLyAyKSB8IDA7XHJcbiAgdGhpcy5sZWZ0ID0gKHNmZy5WX0xFRlQgKyB0aGlzLndpZHRoIC8gMikgfCAwO1xyXG4gIHRoaXMucmlnaHQgPSAoc2ZnLlZfUklHSFQgLSB0aGlzLndpZHRoIC8gMikgfCAwO1xyXG5cclxuICAvLyDjg6Hjg4Pjgrfjg6Xjga7kvZzmiJDjg7vooajnpLpcclxuICAvLyDjg57jg4bjg6rjgqLjg6vjga7kvZzmiJBcclxuICB2YXIgbWF0ZXJpYWwgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVNYXRlcmlhbChzZmcudGV4dHVyZUZpbGVzLm15c2hpcCk7XHJcbiAgLy8g44K444Kq44Oh44OI44Oq44Gu5L2c5oiQXHJcbiAgdmFyIGdlb21ldHJ5ID0gZ3JhcGhpY3MuY3JlYXRlU3ByaXRlR2VvbWV0cnkodGhpcy53aWR0aCk7XHJcbiAgZ3JhcGhpY3MuY3JlYXRlU3ByaXRlVVYoZ2VvbWV0cnksIHNmZy50ZXh0dXJlRmlsZXMubXlzaGlwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgMCk7XHJcblxyXG4gIHRoaXMubWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcblxyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi54ID0gdGhpcy54XztcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueSA9IHRoaXMueV87XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnogPSB0aGlzLnpfO1xyXG4gIHRoaXMucmVzdCA9IDM7XHJcbiAgdGhpcy5teUJ1bGxldHMgPSAoICgpPT4ge1xyXG4gICAgdmFyIGFyciA9IFtdO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAyOyArK2kpIHtcclxuICAgICAgYXJyLnB1c2gobmV3IE15QnVsbGV0KHRoaXMuc2NlbmUsdGhpcy5zZSkpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFycjtcclxuICB9KSgpO1xyXG4gIHNjZW5lLmFkZCh0aGlzLm1lc2gpO1xyXG4gIFxyXG4gIHRoaXMuYnVsbGV0UG93ZXIgPSAxO1xyXG5cclxufVxyXG4gIGdldCB4KCkgeyByZXR1cm4gdGhpcy54XzsgfVxyXG4gIHNldCB4KHYpIHsgdGhpcy54XyA9IHRoaXMubWVzaC5wb3NpdGlvbi54ID0gdjsgfVxyXG4gIGdldCB5KCkgeyByZXR1cm4gdGhpcy55XzsgfVxyXG4gIHNldCB5KHYpIHsgdGhpcy55XyA9IHRoaXMubWVzaC5wb3NpdGlvbi55ID0gdjsgfVxyXG4gIGdldCB6KCkgeyByZXR1cm4gdGhpcy56XzsgfVxyXG4gIHNldCB6KHYpIHsgdGhpcy56XyA9IHRoaXMubWVzaC5wb3NpdGlvbi56ID0gdjsgfVxyXG4gIFxyXG4gIHNob290KGFpbVJhZGlhbikge1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHRoaXMubXlCdWxsZXRzLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIGlmICh0aGlzLm15QnVsbGV0c1tpXS5zdGFydCh0aGlzLngsIHRoaXMueSAsIHRoaXMueixhaW1SYWRpYW4sdGhpcy5idWxsZXRQb3dlcikpIHtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBhY3Rpb24oYmFzaWNJbnB1dCkge1xyXG4gICAgaWYgKGJhc2ljSW5wdXQubGVmdCkge1xyXG4gICAgICBpZiAodGhpcy54ID4gdGhpcy5sZWZ0KSB7XHJcbiAgICAgICAgdGhpcy54IC09IDI7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoYmFzaWNJbnB1dC5yaWdodCkge1xyXG4gICAgICBpZiAodGhpcy54IDwgdGhpcy5yaWdodCkge1xyXG4gICAgICAgIHRoaXMueCArPSAyO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGJhc2ljSW5wdXQudXApIHtcclxuICAgICAgaWYgKHRoaXMueSA8IHRoaXMudG9wKSB7XHJcbiAgICAgICAgdGhpcy55ICs9IDI7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoYmFzaWNJbnB1dC5kb3duKSB7XHJcbiAgICAgIGlmICh0aGlzLnkgPiB0aGlzLmJvdHRvbSkge1xyXG4gICAgICAgIHRoaXMueSAtPSAyO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGlmIChiYXNpY0lucHV0LnopIHtcclxuICAgICAgYmFzaWNJbnB1dC5rZXlDaGVjay56ID0gZmFsc2U7XHJcbiAgICAgIHRoaXMuc2hvb3QoMC41ICogTWF0aC5QSSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGJhc2ljSW5wdXQueCkge1xyXG4gICAgICBiYXNpY0lucHV0LmtleUNoZWNrLnggPSBmYWxzZTtcclxuICAgICAgdGhpcy5zaG9vdCgxLjUgKiBNYXRoLlBJKTtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgaGl0KCkge1xyXG4gICAgdGhpcy5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxuICAgIHNmZy5ib21icy5zdGFydCh0aGlzLngsIHRoaXMueSwgMC4yKTtcclxuICAgIHRoaXMuc2UoNCk7XHJcbiAgfVxyXG4gIFxyXG4gIHJlc2V0KCl7XHJcbiAgICB0aGlzLm15QnVsbGV0cy5mb3JFYWNoKChkKT0+e1xyXG4gICAgICBpZihkLmVuYWJsZV8pe1xyXG4gICAgICAgIHdoaWxlKCFzZmcudGFza3MuYXJyYXlbZC50YXNrLmluZGV4XS5nZW5JbnN0Lm5leHQoLSgxICsgZC50YXNrLmluZGV4KSkuZG9uZSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuICBcclxuICBpbml0KCl7XHJcbiAgICAgIHRoaXMueCA9IDA7XHJcbiAgICAgIHRoaXMueSA9IC0xMDA7XHJcbiAgICAgIHRoaXMueiA9IDAuMTtcclxuICAgICAgdGhpcy5tZXNoLnZpc2libGUgPSB0cnVlO1xyXG4gIH1cclxuXHJcbn0iLCJcInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0ICogYXMgc2ZnIGZyb20gJy4vZ2xvYmFsJztcclxuLy9pbXBvcnQgKiAgYXMgZ2FtZW9iaiBmcm9tICcuL2dhbWVvYmonO1xyXG4vL2ltcG9ydCAqIGFzIGdyYXBoaWNzIGZyb20gJy4vZ3JhcGhpY3MnO1xyXG5cclxuLy8vIOODhuOCreOCueODiOWxnuaAp1xyXG5leHBvcnQgY2xhc3MgVGV4dEF0dHJpYnV0ZSB7XHJcbiAgY29uc3RydWN0b3IoYmxpbmssIGZvbnQpIHtcclxuICAgIGlmIChibGluaykge1xyXG4gICAgICB0aGlzLmJsaW5rID0gYmxpbms7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmJsaW5rID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBpZiAoZm9udCkge1xyXG4gICAgICB0aGlzLmZvbnQgPSBmb250O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5mb250ID0gc2ZnLnRleHR1cmVGaWxlcy5mb250O1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLy8vIOODhuOCreOCueODiOODl+ODrOODvOODs1xyXG5leHBvcnQgY2xhc3MgVGV4dFBsYW5leyBcclxuICBjb25zdHJ1Y3RvciAoc2NlbmUpIHtcclxuICB0aGlzLnRleHRCdWZmZXIgPSBuZXcgQXJyYXkoc2ZnLlRFWFRfSEVJR0hUKTtcclxuICB0aGlzLmF0dHJCdWZmZXIgPSBuZXcgQXJyYXkoc2ZnLlRFWFRfSEVJR0hUKTtcclxuICB0aGlzLnRleHRCYWNrQnVmZmVyID0gbmV3IEFycmF5KHNmZy5URVhUX0hFSUdIVCk7XHJcbiAgdGhpcy5hdHRyQmFja0J1ZmZlciA9IG5ldyBBcnJheShzZmcuVEVYVF9IRUlHSFQpO1xyXG4gIHZhciBlbmRpID0gdGhpcy50ZXh0QnVmZmVyLmxlbmd0aDtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGVuZGk7ICsraSkge1xyXG4gICAgdGhpcy50ZXh0QnVmZmVyW2ldID0gbmV3IEFycmF5KHNmZy5URVhUX1dJRFRIKTtcclxuICAgIHRoaXMuYXR0ckJ1ZmZlcltpXSA9IG5ldyBBcnJheShzZmcuVEVYVF9XSURUSCk7XHJcbiAgICB0aGlzLnRleHRCYWNrQnVmZmVyW2ldID0gbmV3IEFycmF5KHNmZy5URVhUX1dJRFRIKTtcclxuICAgIHRoaXMuYXR0ckJhY2tCdWZmZXJbaV0gPSBuZXcgQXJyYXkoc2ZnLlRFWFRfV0lEVEgpO1xyXG4gIH1cclxuXHJcblxyXG4gIC8vIOaPj+eUu+eUqOOCreODo+ODs+ODkOOCueOBruOCu+ODg+ODiOOCouODg+ODl1xyXG5cclxuICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gIHZhciB3aWR0aCA9IDE7XHJcbiAgd2hpbGUgKHdpZHRoIDw9IHNmZy5WSVJUVUFMX1dJRFRIKXtcclxuICAgIHdpZHRoICo9IDI7XHJcbiAgfVxyXG4gIHZhciBoZWlnaHQgPSAxO1xyXG4gIHdoaWxlIChoZWlnaHQgPD0gc2ZnLlZJUlRVQUxfSEVJR0hUKXtcclxuICAgIGhlaWdodCAqPSAyO1xyXG4gIH1cclxuICBcclxuICB0aGlzLmNhbnZhcy53aWR0aCA9IHdpZHRoO1xyXG4gIHRoaXMuY2FudmFzLmhlaWdodCA9IGhlaWdodDtcclxuICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgdGhpcy50ZXh0dXJlID0gbmV3IFRIUkVFLlRleHR1cmUodGhpcy5jYW52YXMpO1xyXG4gIHRoaXMudGV4dHVyZS5tYWdGaWx0ZXIgPSBUSFJFRS5OZWFyZXN0RmlsdGVyO1xyXG4gIHRoaXMudGV4dHVyZS5taW5GaWx0ZXIgPSBUSFJFRS5MaW5lYXJNaXBNYXBMaW5lYXJGaWx0ZXI7XHJcbiAgdGhpcy5tYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7IG1hcDogdGhpcy50ZXh0dXJlLGFscGhhVGVzdDowLjUsIHRyYW5zcGFyZW50OiB0cnVlLGRlcHRoVGVzdDp0cnVlLHNoYWRpbmc6VEhSRUUuRmxhdFNoYWRpbmd9KTtcclxuLy8gIHRoaXMuZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeShzZmcuVklSVFVBTF9XSURUSCwgc2ZnLlZJUlRVQUxfSEVJR0hUKTtcclxuICB0aGlzLmdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkod2lkdGgsIGhlaWdodCk7XHJcbiAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2godGhpcy5nZW9tZXRyeSwgdGhpcy5tYXRlcmlhbCk7XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnogPSAwLjQ7XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnggPSAod2lkdGggLSBzZmcuVklSVFVBTF9XSURUSCkgLyAyO1xyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi55ID0gIC0gKGhlaWdodCAtIHNmZy5WSVJUVUFMX0hFSUdIVCkgLyAyO1xyXG4gIHRoaXMuZm9udHMgPSB7IGZvbnQ6IHNmZy50ZXh0dXJlRmlsZXMuZm9udCwgZm9udDE6IHNmZy50ZXh0dXJlRmlsZXMuZm9udDEgfTtcclxuICB0aGlzLmJsaW5rQ291bnQgPSAwO1xyXG4gIHRoaXMuYmxpbmsgPSBmYWxzZTtcclxuXHJcbiAgLy8g44K544Og44O844K444Oz44Kw44KS5YiH44KLXHJcbiAgdGhpcy5jdHgubXNJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICB0aGlzLmN0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICAvL3RoaXMuY3R4LndlYmtpdEltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIHRoaXMuY3R4Lm1vekltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG5cclxuICB0aGlzLmNscygpO1xyXG4gIHNjZW5lLmFkZCh0aGlzLm1lc2gpO1xyXG59XHJcblxyXG4gIC8vLyDnlLvpnaLmtojljrtcclxuICBjbHMoKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kaSA9IHRoaXMudGV4dEJ1ZmZlci5sZW5ndGg7IGkgPCBlbmRpOyArK2kpIHtcclxuICAgICAgdmFyIGxpbmUgPSB0aGlzLnRleHRCdWZmZXJbaV07XHJcbiAgICAgIHZhciBhdHRyX2xpbmUgPSB0aGlzLmF0dHJCdWZmZXJbaV07XHJcbiAgICAgIHZhciBsaW5lX2JhY2sgPSB0aGlzLnRleHRCYWNrQnVmZmVyW2ldO1xyXG4gICAgICB2YXIgYXR0cl9saW5lX2JhY2sgPSB0aGlzLmF0dHJCYWNrQnVmZmVyW2ldO1xyXG5cclxuICAgICAgZm9yICh2YXIgaiA9IDAsIGVuZGogPSB0aGlzLnRleHRCdWZmZXJbaV0ubGVuZ3RoOyBqIDwgZW5kajsgKytqKSB7XHJcbiAgICAgICAgbGluZVtqXSA9IDB4MjA7XHJcbiAgICAgICAgYXR0cl9saW5lW2pdID0gMHgwMDtcclxuICAgICAgICAvL2xpbmVfYmFja1tqXSA9IDB4MjA7XHJcbiAgICAgICAgLy9hdHRyX2xpbmVfYmFja1tqXSA9IDB4MDA7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCBzZmcuVklSVFVBTF9XSURUSCwgc2ZnLlZJUlRVQUxfSEVJR0hUKTtcclxuICB9XHJcblxyXG4gIC8vLyDmloflrZfooajnpLrjgZnjgotcclxuICBwcmludCh4LCB5LCBzdHIsIGF0dHJpYnV0ZSkge1xyXG4gICAgdmFyIGxpbmUgPSB0aGlzLnRleHRCdWZmZXJbeV07XHJcbiAgICB2YXIgYXR0ciA9IHRoaXMuYXR0ckJ1ZmZlclt5XTtcclxuICAgIGlmICghYXR0cmlidXRlKSB7XHJcbiAgICAgIGF0dHJpYnV0ZSA9IDA7XHJcbiAgICB9XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7ICsraSkge1xyXG4gICAgICB2YXIgYyA9IHN0ci5jaGFyQ29kZUF0KGkpO1xyXG4gICAgICBpZiAoYyA9PSAweGEpIHtcclxuICAgICAgICArK3k7XHJcbiAgICAgICAgaWYgKHkgPj0gdGhpcy50ZXh0QnVmZmVyLmxlbmd0aCkge1xyXG4gICAgICAgICAgLy8g44K544Kv44Ot44O844OrXHJcbiAgICAgICAgICB0aGlzLnRleHRCdWZmZXIgPSB0aGlzLnRleHRCdWZmZXIuc2xpY2UoMSwgdGhpcy50ZXh0QnVmZmVyLmxlbmd0aCAtIDEpO1xyXG4gICAgICAgICAgdGhpcy50ZXh0QnVmZmVyLnB1c2gobmV3IEFycmF5KHNmZy5WSVJUVUFMX1dJRFRIIC8gOCkpO1xyXG4gICAgICAgICAgdGhpcy5hdHRyQnVmZmVyID0gdGhpcy5hdHRyQnVmZmVyLnNsaWNlKDEsIHRoaXMuYXR0ckJ1ZmZlci5sZW5ndGggLSAxKTtcclxuICAgICAgICAgIHRoaXMuYXR0ckJ1ZmZlci5wdXNoKG5ldyBBcnJheShzZmcuVklSVFVBTF9XSURUSCAvIDgpKTtcclxuICAgICAgICAgIC0teTtcclxuICAgICAgICAgIHZhciBlbmRqID0gdGhpcy50ZXh0QnVmZmVyW3ldLmxlbmd0aDtcclxuICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgZW5kajsgKytqKSB7XHJcbiAgICAgICAgICAgIHRoaXMudGV4dEJ1ZmZlclt5XVtqXSA9IDB4MjA7XHJcbiAgICAgICAgICAgIHRoaXMuYXR0ckJ1ZmZlclt5XVtqXSA9IDB4MDA7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxpbmUgPSB0aGlzLnRleHRCdWZmZXJbeV07XHJcbiAgICAgICAgYXR0ciA9IHRoaXMuYXR0ckJ1ZmZlclt5XTtcclxuICAgICAgICB4ID0gMDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBsaW5lW3hdID0gYztcclxuICAgICAgICBhdHRyW3hdID0gYXR0cmlidXRlO1xyXG4gICAgICAgICsreDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICAvLy8g44OG44Kt44K544OI44OH44O844K/44KS44KC44Go44Gr44OG44Kv44K544OB44Oj44O844Gr5o+P55S744GZ44KLXHJcbiAgcmVuZGVyKCkge1xyXG4gICAgdmFyIGN0eCA9IHRoaXMuY3R4O1xyXG4gICAgdGhpcy5ibGlua0NvdW50ID0gKHRoaXMuYmxpbmtDb3VudCArIDEpICYgMHhmO1xyXG5cclxuICAgIHZhciBkcmF3X2JsaW5rID0gZmFsc2U7XHJcbiAgICBpZiAoIXRoaXMuYmxpbmtDb3VudCkge1xyXG4gICAgICB0aGlzLmJsaW5rID0gIXRoaXMuYmxpbms7XHJcbiAgICAgIGRyYXdfYmxpbmsgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgdmFyIHVwZGF0ZSA9IGZhbHNlO1xyXG4vLyAgICBjdHguY2xlYXJSZWN0KDAsIDAsIENPTlNPTEVfV0lEVEgsIENPTlNPTEVfSEVJR0hUKTtcclxuLy8gICAgY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuXHJcbiAgICBmb3IgKHZhciB5ID0gMCwgZ3kgPSAwOyB5IDwgc2ZnLlRFWFRfSEVJR0hUOyArK3ksIGd5ICs9IHNmZy5BQ1RVQUxfQ0hBUl9TSVpFKSB7XHJcbiAgICAgIHZhciBsaW5lID0gdGhpcy50ZXh0QnVmZmVyW3ldO1xyXG4gICAgICB2YXIgYXR0cl9saW5lID0gdGhpcy5hdHRyQnVmZmVyW3ldO1xyXG4gICAgICB2YXIgbGluZV9iYWNrID0gdGhpcy50ZXh0QmFja0J1ZmZlclt5XTtcclxuICAgICAgdmFyIGF0dHJfbGluZV9iYWNrID0gdGhpcy5hdHRyQmFja0J1ZmZlclt5XTtcclxuICAgICAgZm9yICh2YXIgeCA9IDAsIGd4ID0gMDsgeCA8IHNmZy5URVhUX1dJRFRIOyArK3gsIGd4ICs9IHNmZy5BQ1RVQUxfQ0hBUl9TSVpFKSB7XHJcbiAgICAgICAgdmFyIHByb2Nlc3NfYmxpbmsgPSAoYXR0cl9saW5lW3hdICYmIGF0dHJfbGluZVt4XS5ibGluayk7XHJcbiAgICAgICAgaWYgKGxpbmVbeF0gIT0gbGluZV9iYWNrW3hdIHx8IGF0dHJfbGluZVt4XSAhPSBhdHRyX2xpbmVfYmFja1t4XSB8fCAocHJvY2Vzc19ibGluayAmJiBkcmF3X2JsaW5rKSkge1xyXG4gICAgICAgICAgdXBkYXRlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICBsaW5lX2JhY2tbeF0gPSBsaW5lW3hdO1xyXG4gICAgICAgICAgYXR0cl9saW5lX2JhY2tbeF0gPSBhdHRyX2xpbmVbeF07XHJcbiAgICAgICAgICB2YXIgYyA9IDA7XHJcbiAgICAgICAgICBpZiAoIXByb2Nlc3NfYmxpbmsgfHwgdGhpcy5ibGluaykge1xyXG4gICAgICAgICAgICBjID0gbGluZVt4XSAtIDB4MjA7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB2YXIgeXBvcyA9IChjID4+IDQpIDw8IDM7XHJcbiAgICAgICAgICB2YXIgeHBvcyA9IChjICYgMHhmKSA8PCAzO1xyXG4gICAgICAgICAgY3R4LmNsZWFyUmVjdChneCwgZ3ksIHNmZy5BQ1RVQUxfQ0hBUl9TSVpFLCBzZmcuQUNUVUFMX0NIQVJfU0laRSk7XHJcbiAgICAgICAgICB2YXIgZm9udCA9IGF0dHJfbGluZVt4XSA/IGF0dHJfbGluZVt4XS5mb250IDogc2ZnLnRleHR1cmVGaWxlcy5mb250O1xyXG4gICAgICAgICAgaWYgKGMpIHtcclxuICAgICAgICAgICAgY3R4LmRyYXdJbWFnZShmb250LmltYWdlLCB4cG9zLCB5cG9zLCBzZmcuQ0hBUl9TSVpFLCBzZmcuQ0hBUl9TSVpFLCBneCwgZ3ksIHNmZy5BQ1RVQUxfQ0hBUl9TSVpFLCBzZmcuQUNUVUFMX0NIQVJfU0laRSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLnRleHR1cmUubmVlZHNVcGRhdGUgPSB1cGRhdGU7XHJcbiAgfVxyXG59XHJcbiIsIlxyXG5cInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0ICogYXMgc2ZnIGZyb20gJy4vZ2xvYmFsJztcclxuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICcuL2V2ZW50RW1pdHRlcjMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFRhc2sge1xyXG4gIGNvbnN0cnVjdG9yKGdlbkluc3QscHJpb3JpdHkpIHtcclxuICAgIHRoaXMucHJpb3JpdHkgPSBwcmlvcml0eSB8fCAxMDAwMDtcclxuICAgIHRoaXMuZ2VuSW5zdCA9IGdlbkluc3Q7XHJcbiAgICAvLyDliJ3mnJ/ljJZcclxuICAgIHRoaXMuaW5kZXggPSAwO1xyXG4gIH1cclxuICBcclxufVxyXG5cclxuZXhwb3J0IHZhciBudWxsVGFzayA9IG5ldyBUYXNrKChmdW5jdGlvbiooKXt9KSgpKTtcclxuXHJcbi8vLyDjgr/jgrnjgq/nrqHnkIZcclxuZXhwb3J0IGNsYXNzIFRhc2tzIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcclxuICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgc3VwZXIoKTtcclxuICAgIHRoaXMuYXJyYXkgPSBuZXcgQXJyYXkoMCk7XHJcbiAgICB0aGlzLm5lZWRTb3J0ID0gZmFsc2U7XHJcbiAgICB0aGlzLm5lZWRDb21wcmVzcyA9IGZhbHNlO1xyXG4gICAgdGhpcy5lbmFibGUgPSB0cnVlO1xyXG4gICAgdGhpcy5zdG9wcGVkID0gZmFsc2U7XHJcbiAgfVxyXG4gIC8vIGluZGV444Gu5L2N572u44Gu44K/44K544Kv44KS572u44GN5o+b44GI44KLXHJcbiAgc2V0TmV4dFRhc2soaW5kZXgsIGdlbkluc3QsIHByaW9yaXR5KSBcclxuICB7XHJcbiAgICBpZihpbmRleCA8IDApe1xyXG4gICAgICBpbmRleCA9IC0oKytpbmRleCk7XHJcbiAgICB9XHJcbiAgICBpZih0aGlzLmFycmF5W2luZGV4XS5wcmlvcml0eSA9PSAxMDAwMDApe1xyXG4gICAgICBkZWJ1Z2dlcjtcclxuICAgIH1cclxuICAgIHZhciB0ID0gbmV3IFRhc2soZ2VuSW5zdChpbmRleCksIHByaW9yaXR5KTtcclxuICAgIHQuaW5kZXggPSBpbmRleDtcclxuICAgIHRoaXMuYXJyYXlbaW5kZXhdID0gdDtcclxuICAgIHRoaXMubmVlZFNvcnQgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgcHVzaFRhc2soZ2VuSW5zdCwgcHJpb3JpdHkpIHtcclxuICAgIGxldCB0O1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmFycmF5Lmxlbmd0aDsgKytpKSB7XHJcbiAgICAgIGlmICh0aGlzLmFycmF5W2ldID09IG51bGxUYXNrKSB7XHJcbiAgICAgICAgdCA9IG5ldyBUYXNrKGdlbkluc3QoaSksIHByaW9yaXR5KTtcclxuICAgICAgICB0aGlzLmFycmF5W2ldID0gdDtcclxuICAgICAgICB0LmluZGV4ID0gaTtcclxuICAgICAgICByZXR1cm4gdDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdCA9IG5ldyBUYXNrKGdlbkluc3QodGhpcy5hcnJheS5sZW5ndGgpLHByaW9yaXR5KTtcclxuICAgIHQuaW5kZXggPSB0aGlzLmFycmF5Lmxlbmd0aDtcclxuICAgIHRoaXMuYXJyYXlbdGhpcy5hcnJheS5sZW5ndGhdID0gdDtcclxuICAgIHRoaXMubmVlZFNvcnQgPSB0cnVlO1xyXG4gICAgcmV0dXJuIHQ7XHJcbiAgfVxyXG5cclxuICAvLyDphY3liJfjgpLlj5blvpfjgZnjgotcclxuICBnZXRBcnJheSgpIHtcclxuICAgIHJldHVybiB0aGlzLmFycmF5O1xyXG4gIH1cclxuICAvLyDjgr/jgrnjgq/jgpLjgq/jg6rjgqLjgZnjgotcclxuICBjbGVhcigpIHtcclxuICAgIHRoaXMuYXJyYXkubGVuZ3RoID0gMDtcclxuICB9XHJcbiAgLy8g44K944O844OI44GM5b+F6KaB44GL44OB44Kn44OD44Kv44GX44CB44K944O844OI44GZ44KLXHJcbiAgY2hlY2tTb3J0KCkge1xyXG4gICAgaWYgKHRoaXMubmVlZFNvcnQpIHtcclxuICAgICAgdGhpcy5hcnJheS5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XHJcbiAgICAgICAgaWYoYS5wcmlvcml0eSA+IGIucHJpb3JpdHkpIHJldHVybiAxO1xyXG4gICAgICAgIGlmIChhLnByaW9yaXR5IDwgYi5wcmlvcml0eSkgcmV0dXJuIC0xO1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgICB9KTtcclxuICAgICAgLy8g44Kk44Oz44OH44OD44Kv44K544Gu5oyv44KK55u044GXXHJcbiAgICAgIGZvciAodmFyIGkgPSAwLCBlID0gdGhpcy5hcnJheS5sZW5ndGg7IGkgPCBlOyArK2kpIHtcclxuICAgICAgICB0aGlzLmFycmF5W2ldLmluZGV4ID0gaTtcclxuICAgICAgfVxyXG4gICAgIHRoaXMubmVlZFNvcnQgPSBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJlbW92ZVRhc2soaW5kZXgpIHtcclxuICAgIGlmKGluZGV4IDwgMCl7XHJcbiAgICAgIGluZGV4ID0gLSgrK2luZGV4KTtcclxuICAgIH1cclxuICAgIGlmKHRoaXMuYXJyYXlbaW5kZXhdLnByaW9yaXR5ID09IDEwMDAwMCl7XHJcbiAgICAgIGRlYnVnZ2VyO1xyXG4gICAgfVxyXG4gICAgdGhpcy5hcnJheVtpbmRleF0gPSBudWxsVGFzaztcclxuICAgIHRoaXMubmVlZENvbXByZXNzID0gdHJ1ZTtcclxuICB9XHJcbiAgXHJcbiAgY29tcHJlc3MoKSB7XHJcbiAgICBpZiAoIXRoaXMubmVlZENvbXByZXNzKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHZhciBkZXN0ID0gW107XHJcbiAgICB2YXIgc3JjID0gdGhpcy5hcnJheTtcclxuICAgIHZhciBkZXN0SW5kZXggPSAwO1xyXG4gICAgZGVzdCA9IHNyYy5maWx0ZXIoKHYsaSk9PntcclxuICAgICAgbGV0IHJldCA9IHYgIT0gbnVsbFRhc2s7XHJcbiAgICAgIGlmKHJldCl7XHJcbiAgICAgICAgdi5pbmRleCA9IGRlc3RJbmRleCsrO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiByZXQ7XHJcbiAgICB9KTtcclxuICAgIHRoaXMuYXJyYXkgPSBkZXN0O1xyXG4gICAgdGhpcy5uZWVkQ29tcHJlc3MgPSBmYWxzZTtcclxuICB9XHJcbiAgXHJcbiAgcHJvY2VzcyhnYW1lKVxyXG4gIHtcclxuICAgIGlmKHRoaXMuZW5hYmxlKXtcclxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMucHJvY2Vzcy5iaW5kKHRoaXMsZ2FtZSkpO1xyXG4gICAgICB0aGlzLnN0b3BwZWQgPSBmYWxzZTtcclxuICAgICAgaWYgKCFzZmcucGF1c2UpIHtcclxuICAgICAgICBpZiAoIWdhbWUuaXNIaWRkZW4pIHtcclxuICAgICAgICAgIHRoaXMuY2hlY2tTb3J0KCk7XHJcbiAgICAgICAgICB0aGlzLmFycmF5LmZvckVhY2goICh0YXNrLGkpID0+e1xyXG4gICAgICAgICAgICBpZiAodGFzayAhPSBudWxsVGFzaykge1xyXG4gICAgICAgICAgICAgIGlmKHRhc2suaW5kZXggIT0gaSApe1xyXG4gICAgICAgICAgICAgICAgZGVidWdnZXI7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIHRhc2suZ2VuSW5zdC5uZXh0KHRhc2suaW5kZXgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHRoaXMuY29tcHJlc3MoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gICAgXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmVtaXQoJ3N0b3BwZWQnKTtcclxuICAgICAgdGhpcy5zdG9wcGVkID0gdHJ1ZTtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgc3RvcFByb2Nlc3MoKXtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSxyZWplY3QpPT57XHJcbiAgICAgIHRoaXMuZW5hYmxlID0gZmFsc2U7XHJcbiAgICAgIHRoaXMub24oJ3N0b3BwZWQnLCgpPT57XHJcbiAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOOCsuODvOODoOeUqOOCv+OCpOODnuODvFxyXG5leHBvcnQgY2xhc3MgR2FtZVRpbWVyIHtcclxuICBjb25zdHJ1Y3RvcihnZXRDdXJyZW50VGltZSkge1xyXG4gICAgdGhpcy5lbGFwc2VkVGltZSA9IDA7XHJcbiAgICB0aGlzLmN1cnJlbnRUaW1lID0gMDtcclxuICAgIHRoaXMucGF1c2VUaW1lID0gMDtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5TVE9QO1xyXG4gICAgdGhpcy5nZXRDdXJyZW50VGltZSA9IGdldEN1cnJlbnRUaW1lO1xyXG4gICAgdGhpcy5TVE9QID0gMTtcclxuICAgIHRoaXMuU1RBUlQgPSAyO1xyXG4gICAgdGhpcy5QQVVTRSA9IDM7XHJcblxyXG4gIH1cclxuICBcclxuICBzdGFydCgpIHtcclxuICAgIHRoaXMuZWxhcHNlZFRpbWUgPSAwO1xyXG4gICAgdGhpcy5kZWx0YVRpbWUgPSAwO1xyXG4gICAgdGhpcy5jdXJyZW50VGltZSA9IHRoaXMuZ2V0Q3VycmVudFRpbWUoKTtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5TVEFSVDtcclxuICB9XHJcblxyXG4gIHJlc3VtZSgpIHtcclxuICAgIHZhciBub3dUaW1lID0gdGhpcy5nZXRDdXJyZW50VGltZSgpO1xyXG4gICAgdGhpcy5jdXJyZW50VGltZSA9IHRoaXMuY3VycmVudFRpbWUgKyBub3dUaW1lIC0gdGhpcy5wYXVzZVRpbWU7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuU1RBUlQ7XHJcbiAgfVxyXG5cclxuICBwYXVzZSgpIHtcclxuICAgIHRoaXMucGF1c2VUaW1lID0gdGhpcy5nZXRDdXJyZW50VGltZSgpO1xyXG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLlBBVVNFO1xyXG4gIH1cclxuXHJcbiAgc3RvcCgpIHtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5TVE9QO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlKCkge1xyXG4gICAgaWYgKHRoaXMuc3RhdHVzICE9IHRoaXMuU1RBUlQpIHJldHVybjtcclxuICAgIHZhciBub3dUaW1lID0gdGhpcy5nZXRDdXJyZW50VGltZSgpO1xyXG4gICAgdGhpcy5kZWx0YVRpbWUgPSBub3dUaW1lIC0gdGhpcy5jdXJyZW50VGltZTtcclxuICAgIHRoaXMuZWxhcHNlZFRpbWUgPSB0aGlzLmVsYXBzZWRUaW1lICsgdGhpcy5kZWx0YVRpbWU7XHJcbiAgICB0aGlzLmN1cnJlbnRUaW1lID0gbm93VGltZTtcclxuICB9XHJcbn1cclxuXHJcbiJdfQ==
