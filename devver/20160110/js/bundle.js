(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/// <reference path="graphics.js" />
/// <reference path="io.js" />
/// <reference path="song.js" />
/// <reference path="text.js" />
/// <reference path="util.js" />
/// <reference path="dsp.js" />
"use strict";
//// Web Audio API ラッパークラス ////

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
  render: function () {
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
  keyon: function (t, vel) {
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
  keyoff: function (t) {
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
  initProcessor: function () {
    this.processor = this.audioctx.createBufferSource();
    this.processor.buffer = this.sample.sample;
    this.processor.loop = this.sample.loop;
    this.processor.loopStart = 0;
    this.processor.playbackRate.value = 1.0;
    this.processor.loopEnd = this.sample.end;
    this.processor.connect(this.gain);
  },

  setSample: function (sample) {
    this.envelope.keyoff(0);
    this.processor.disconnect(this.gain);
    this.sample = sample;
    this.initProcessor();
    this.processor.start();
  },
  start: function (startTime) {
    //   if (this.processor.playbackState == 3) {
    this.processor.disconnect(this.gain);
    this.initProcessor();
    //    } else {
    //      this.envelope.keyoff();
    //
    //    }
    this.processor.start(startTime);
  },
  stop: function (time) {
    this.processor.stop(time);
    this.reset();
  },
  keyon: function (t, note, vel) {
    this.processor.playbackRate.setValueAtTime(noteFreq[note] * this.detune, t);
    this.envelope.keyon(t, vel);
  },
  keyoff: function (t) {
    this.envelope.keyoff(t);
  },
  reset: function () {
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
  start: function () {
    //  if (this.started) return;

    var voices = this.voices;
    for (var i = 0, end = voices.length; i < end; ++i) {
      voices[i].start(0);
    }
    //this.started = true;
  },
  stop: function () {
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
  process: function (track) {
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
  process: function (track) {

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
    if (typeof args[args.length - 1] == 'object' && !(args[args.length - 1] instanceof Note)) {
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
  process: function (track) {
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
  process: function (currentTime) {

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
  reset: function () {
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
  load: function (data) {
    if (this.play) {
      this.stop();
    }
    this.tracks.length = 0;
    loadTracks(this, this.tracks, data.tracks, this.audio);
  },
  start: function () {
    //    this.handle = window.setTimeout(function () { self.process() }, 50);
    this.status = this.PLAY;
    this.process();
  },
  process: function () {
    if (this.status == this.PLAY) {
      this.playTracks(this.tracks);
      this.handle = window.setTimeout(this.process.bind(this), 100);
    }
  },
  playTracks: function (tracks) {
    var currentTime = this.audio.audioctx.currentTime;
    //   console.log(this.audio.audioctx.currentTime);
    for (var i = 0, end = tracks.length; i < end; ++i) {
      tracks[i].process(currentTime);
    }
  },
  pause: function () {
    this.status = this.PAUSE;
    this.pauseTime = this.audio.audioctx.currentTime;
  },
  resume: function () {
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
  stop: function () {
    if (this.status != this.STOP) {
      clearTimeout(this.handle);
      //    clearInterval(this.handle);
      this.status = this.STOP;
      this.reset();
    }
  },
  reset: function () {
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
  on: function (e) {
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
  off: function (e) {
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

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Comm = Comm;
function Comm() {
  var _this = this;

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

Comm.prototype = {
  sendScore: function (score) {
    if (this.enable) {
      this.socket.emit('sendScore', score);
    }
  },
  disconnect: function () {
    if (this.enable) {
      this.enable = false;
      this.socket.disconnect();
    }
  }
};

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Bomb = Bomb;
exports.Bombs = Bombs;

var _global = require('./global');

var sfg = _interopRequireWildcard(_global);

var _gameobj = require('./gameobj');

var gameobj = _interopRequireWildcard(_gameobj);

var _graphics = require('./graphics');

var graphics = _interopRequireWildcard(_graphics);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/// 爆発
function Bomb(scene, se) {
  gameobj.GameObj.call(this, 0, 0, 0);
  var tex = sfg.textureFiles.bomb;
  var material = graphics.createSpriteMaterial(tex);
  material.blending = THREE.AdditiveBlending;
  material.needsUpdate = true;
  var geometry = graphics.createSpriteGeometry(16);
  graphics.createSpriteUV(geometry, tex, 16, 16, 0);
  this.mesh = new THREE.Mesh(geometry, material);
  this.mesh.position.z = 0.1;
  this.index = 0;
  this.mesh.visible = false;
  this.scene = scene;
  this.se = se;
  scene.add(this.mesh);
}

Bomb.prototype = {
  get x() {
    return this.x_;
  },
  set x(v) {
    this.x_ = this.mesh.position.x = v;
  },
  get y() {
    return this.y_;
  },
  set y(v) {
    this.y_ = this.mesh.position.y = v;
  },
  get z() {
    return this.z_;
  },
  set z(v) {
    this.z_ = this.mesh.position.z = v;
  },
  start: function (x, y, z, delay) {
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
  },
  move: function (taskIndex) {
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
};

function Bombs(scene, se) {
  this.bombs = new Array(0);
  for (var i = 0; i < 32; ++i) {
    this.bombs.push(new Bomb(scene, se));
  }
}

Bombs.prototype = {
  start: function (x, y, z) {
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
};

},{"./gameobj":6,"./global":7,"./graphics":8}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EnemyBullet = EnemyBullet;
exports.EnemyBullets = EnemyBullets;
exports.GotoHome = GotoHome;
exports.HomeMove = HomeMove;
exports.Goto = Goto;
exports.Fire = Fire;
exports.Enemy = Enemy;
exports.Enemies = Enemies;

var _gameobj = require('./gameobj');

var gameobj = _interopRequireWildcard(_gameobj);

var _global = require('./global');

var sfg = _interopRequireWildcard(_global);

var _graphics = require('./graphics');

var graphics = _interopRequireWildcard(_graphics);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/// 敵弾
function EnemyBullet(scene, se) {
  gameobj.GameObj.call(this, 0, 0, 0);
  this.collisionArea.width = 2;
  this.collisionArea.height = 2;
  var tex = sfg.textureFiles.enemy;
  var material = graphics.createSpriteMaterial(tex);
  var geometry = graphics.createSpriteGeometry(16);
  graphics.createSpriteUV(geometry, tex, 16, 16, 0);
  this.mesh = new THREE.Mesh(geometry, material);
  this.z = 0.0;
  this.mvPattern = null;
  this.mv = null;
  this.mesh.visible = false;
  this.type = null;
  this.life = 0;
  this.dx = 0;
  this.dy = 0;
  this.speed = 2.0;
  this.enable = false;
  this.hit_ = null;
  this.status = this.NONE;
  this.scene = scene;
  scene.add(this.mesh);
  this.se = se;
}

EnemyBullet.prototype = {
  get x() {
    return this.x_;
  },
  set x(v) {
    this.x_ = this.mesh.position.x = v;
  },
  get y() {
    return this.y_;
  },
  set y(v) {
    this.y_ = this.mesh.position.y = v;
  },
  get z() {
    return this.z_;
  },
  set z(v) {
    this.z_ = this.mesh.position.z = v;
  },
  get enable() {
    return this.enable_;
  },
  set enable(v) {
    this.enable_ = v;
    this.mesh.visible = v;
  },
  move: function (taskIndex) {
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
  },
  start: function (x, y, z) {
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
    this.task = sfg.tasks.pushTask(function (i) {
      enb.move(i);
    });
    return true;
  },
  hit: function () {
    this.enable = false;
    sfg.tasks.removeTask(this.task.index);
    this.status = this.NONE;
  },
  NONE: 0,
  MOVE: 1,
  BOMB: 2
};

function EnemyBullets(scene, se) {
  this.scene = scene;
  this.enemyBullets = [];
  for (var i = 0; i < 48; ++i) {
    this.enemyBullets.push(new EnemyBullet(this.scene, se));
  }
}

EnemyBullets.prototype = {
  start: function (x, y, z) {
    var ebs = this.enemyBullets;
    for (var i = 0, end = ebs.length; i < end; ++i) {
      if (!ebs[i].enable) {
        ebs[i].start(x, y, z);
        break;
      }
    }
  },
  reset: function () {
    var ebs = this.enemyBullets;
    for (var i = 0, end = ebs.length; i < end; ++i) {
      if (ebs[i].enable) {
        ebs[i].enable = false;
        ebs[i].status = ebs[i].NONE;
        sfg.tasks.removeTask(ebs[i].task.index);
      }
    }
  }
};

/// 敵キャラの動き ///////////////////////////////
/// 直線運動
function LineMove(rad, speed, step) {
  this.rad = rad;
  this.speed = speed;
  this.step = step;
  this.currentStep = step;
  this.dx = Math.cos(rad) * speed;
  this.dy = Math.sin(rad) * speed;
}

LineMove.prototype = {
  start: function (self, x, y) {
    self.moveEnd = false;
    self.step = this.step;
    if (self.xrev) {
      self.charRad = PI - (this.rad - PI / 2);
    } else {
      self.charRad = this.rad - PI / 2;
    }
  },
  move: function (self) {
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
};

/// 円運動
function CircleMove(startRad, stopRad, r, speed, left) {
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
};

CircleMove.prototype = {
  start: function (self, x, y) {
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
  },
  move: function (self) {
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
};

/// ホームポジションに戻る
function GotoHome() {}

GotoHome.prototype = {
  start: function (self, x, y) {
    var rad = Math.atan2(self.homeY - self.y, self.homeX - self.x);
    self.charRad = rad - Math.PI / 2;
    self.rad = rad;
    self.speed = 4;
    self.dx = Math.cos(self.rad) * self.speed;
    self.dy = Math.sin(self.rad) * self.speed;
    self.moveEnd = false;
    self.z = 0.0;
    return true;
  },
  move: function (self) {
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
};

///
function HomeMove() {};
HomeMove.prototype = {
  CENTER_X: 0,
  CENTER_Y: 100,
  start: function (self, x, y) {
    self.dx = self.homeX - this.CENTER_X;
    self.dy = self.homeY - this.CENTER_Y;
    self.moveEnd = false;
    self.z = -0.1;
    return true;
  },
  move: function (self) {
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
};

/// 指定シーケンスに移動する
function Goto(pos) {
  this.pos = pos;
};
Goto.prototype = {
  start: function (self, x, y) {
    self.index = this.pos - 1;
    return false;
  },
  move: function (self) {}
};

/// 敵弾発射
function Fire() {}

Fire.prototype = {
  start: function (self, x, y) {
    var d = sfg.stage.no / 20 * sfg.stage.difficulty;
    if (d > 1) {
      d = 1.0;
    }
    if (Math.random() < d) {
      self.enemies.enemyBullets.start(self.x, self.y);
      self.moveEnd = true;
    }
    return false;
  },
  move: function (self) {
    if (self.moveEnd) {
      return;
    }
  }
};

/// 敵本体
function Enemy(enemies, scene, se) {
  gameobj.GameObj.call(this, 0, 0, 0);
  this.collisionArea.width = 12;
  this.collisionArea.height = 8;
  var tex = sfg.textureFiles.enemy;
  var material = graphics.createSpriteMaterial(tex);
  var geometry = graphics.createSpriteGeometry(16);
  graphics.createSpriteUV(geometry, tex, 16, 16, 0);
  this.mesh = new THREE.Mesh(geometry, material);
  this.groupID = 0;
  this.z = 0.0;
  this.index = 0;
  this.score = 0;
  this.mvPattern = null;
  this.mv = null;
  this.mesh.visible = false;
  this.status = this.NONE;
  this.type = null;
  this.life = 0;
  this.task = null;
  this.hit_ = null;
  this.scene = scene;
  this.scene.add(this.mesh);
  this.se = se;
  this.enemies = enemies;
}

Enemy.prototype = {
  get x() {
    return this.x_;
  },
  set x(v) {
    this.x_ = this.mesh.position.x = v;
  },
  get y() {
    return this.y_;
  },
  set y(v) {
    this.y_ = this.mesh.position.y = v;
  },
  get z() {
    return this.z_;
  },
  set z(v) {
    this.z_ = this.mesh.position.z = v;
  },
  ///敵の動き
  move: function (taskIndex) {
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
  },
  /// 初期化
  start: function (x, y, z, homeX, homeY, mvPattern, xrev, type, clearTarget, groupID) {
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
  },
  hit: function () {
    if (this.hit_ == null) {
      this.life--;
      if (this.life == 0) {
        //        this.enable_ = false;
        sfg.bombs.start(this.x, this.y);
        this.se(1);
        //        sequencer.playTracks(soundEffects.soundEffects[1]);
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
        //        sequencer.playTracks(soundEffects.soundEffects[2]);
        this.mesh.material.color.setHex(0xFF8080);
        //        this.mesh.material.needsUpdate = true;
      }
    } else {
        this.hit_();
      }
  },
  NONE: 0 | 0,
  START: 1 | 0,
  HOME: 2 | 0,
  ATTACK: 3 | 0,
  BOMB: 4 | 0
};

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

function Enemies(scene, se, enemyBullets) {
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
};

/// 敵編隊の動きをコントロールする
Enemies.prototype.move = function () {
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
};

Enemies.prototype.reset = function () {
  for (var i = 0, end = this.enemies.length; i < end; ++i) {
    var en = this.enemies[i];
    if (en.enable_) {
      sfg.tasks.removeTask(en.task.index);
      en.status = en.NONE;
      en.enable_ = false;
      en.mesh.visible = false;
    }
  }
};

Enemies.prototype.calcEnemiesCount = function () {
  var seqs = this.moveSeqs[sfg.stage.privateNo];
  this.totalEnemiesCount = 0;
  for (var i = 0, end = seqs.length; i < end; ++i) {
    if (seqs[i][7]) {
      this.totalEnemiesCount++;
    }
  }
};

Enemies.prototype.start = function () {
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
};

Enemies.prototype.movePatterns = [
// 0
[new CircleMove(Math.PI, 1.125 * Math.PI, 300, 3, true), new CircleMove(1.125 * Math.PI, 1.25 * Math.PI, 200, 3, true), new Fire(), new CircleMove(Math.PI / 4, -3 * Math.PI, 40, 5, false), new GotoHome(), new HomeMove(), new CircleMove(Math.PI, 0, 10, 3, false), new CircleMove(0, -0.125 * Math.PI, 200, 3, false), new Fire(), new CircleMove(-0.125 * Math.PI, -0.25 * Math.PI, 150, 2.5, false), new CircleMove(3 * Math.PI / 4, 4 * Math.PI, 40, 2.5, true), new Goto(4)], // 1
[new CircleMove(Math.PI, 1.125 * Math.PI, 300, 5, true), new CircleMove(1.125 * Math.PI, 1.25 * Math.PI, 200, 5, true), new Fire(), new CircleMove(Math.PI / 4, -3 * Math.PI, 40, 6, false), new GotoHome(), new HomeMove(), new CircleMove(Math.PI, 0, 10, 3, false), new CircleMove(0, -0.125 * Math.PI, 200, 3, false), new Fire(), new CircleMove(-0.125 * Math.PI, -0.25 * Math.PI, 250, 3, false), new CircleMove(3 * Math.PI / 4, 4 * Math.PI, 40, 3, true), new Goto(4)], // 2
[new CircleMove(0, -0.125 * Math.PI, 300, 3, false), new CircleMove(-0.125 * Math.PI, -0.25 * Math.PI, 200, 3, false), new Fire(), new CircleMove(3 * Math.PI / 4, (2 + 0.25) * Math.PI, 40, 5, true), new GotoHome(), new HomeMove(), new CircleMove(0, Math.PI, 10, 3, true), new CircleMove(Math.PI, 1.125 * Math.PI, 200, 3, true), new Fire(), new CircleMove(1.125 * Math.PI, 1.25 * Math.PI, 150, 2.5, true), new CircleMove(0.25 * Math.PI, -3 * Math.PI, 40, 2.5, false), new Goto(4)], // 3
[new CircleMove(0, -0.125 * Math.PI, 300, 5, false), new CircleMove(-0.125 * Math.PI, -0.25 * Math.PI, 200, 5, false), new Fire(), new CircleMove(3 * Math.PI / 4, (4 + 0.25) * Math.PI, 40, 6, true), new Fire(), new GotoHome(), new HomeMove(), new CircleMove(0, Math.PI, 10, 3, true), new CircleMove(Math.PI, 1.125 * Math.PI, 200, 3, true), new Fire(), new CircleMove(1.125 * Math.PI, 1.25 * Math.PI, 150, 3, true), new CircleMove(0.25 * Math.PI, -3 * Math.PI, 40, 3, false), new Goto(4)], [// 4
new CircleMove(0, -0.25 * Math.PI, 176, 4, false), new CircleMove(0.75 * Math.PI, Math.PI, 112, 4, true), new CircleMove(Math.PI, 3.125 * Math.PI, 64, 4, true), new GotoHome(), new HomeMove(), new CircleMove(0, 0.125 * Math.PI, 250, 3, true), new CircleMove(0.125 * Math.PI, Math.PI, 80, 3, true), new Fire(), new CircleMove(Math.PI, 1.75 * Math.PI, 50, 3, true), new CircleMove(0.75 * Math.PI, 0.5 * Math.PI, 100, 3, false), new CircleMove(0.5 * Math.PI, -2 * Math.PI, 20, 3, false), new Goto(3)], [// 5
new CircleMove(0, -0.125 * Math.PI, 300, 3, false), new CircleMove(-0.125 * Math.PI, -0.25 * Math.PI, 200, 3, false), new CircleMove(3 * Math.PI / 4, 3 * Math.PI, 40, 5, true), new GotoHome(), new HomeMove(), new CircleMove(Math.PI, 0.875 * Math.PI, 250, 3, false), new CircleMove(0.875 * Math.PI, 0, 80, 3, false), new Fire(), new CircleMove(0, -0.75 * Math.PI, 50, 3, false), new CircleMove(0.25 * Math.PI, 0.5 * Math.PI, 100, 3, true), new CircleMove(0.5 * Math.PI, 3 * Math.PI, 20, 3, true), new Goto(3)], [// 6 ///////////////////////
new CircleMove(1.5 * Math.PI, Math.PI, 96, 4, false),
//    new LineMove(0.5 * PI,4,50),
new CircleMove(0, 2 * Math.PI, 48, 4, true),
//new CircleMove(0, 2 * PI, 56, 3, true),
new CircleMove(Math.PI, 0.75 * Math.PI, 32, 4, false),
//  new CircleMove(1.5 * PI, 2 * PI, 32, 3, true),
new GotoHome(), new HomeMove(), new CircleMove(Math.PI, 0, 10, 3, false), new CircleMove(0, -0.125 * Math.PI, 200, 3, false), new Fire(), new CircleMove(-0.125 * Math.PI, -0.25 * Math.PI, 150, 2.5, false), new CircleMove(3 * Math.PI / 4, 4 * Math.PI, 40, 2.5, true), new Goto(3)], [// 7 ///////////////////
new CircleMove(0, -0.25 * Math.PI, 176, 4, false), new Fire(), new CircleMove(0.75 * Math.PI, Math.PI, 112, 4, true), new CircleMove(Math.PI, 2.125 * Math.PI, 48, 4, true), new CircleMove(1.125 * Math.PI, Math.PI, 48, 4, false), new GotoHome(), new HomeMove(), new CircleMove(Math.PI, 0, 10, 3, false), new Fire(), new CircleMove(0, -0.125 * Math.PI, 200, 3, false), new CircleMove(-0.125 * Math.PI, -0.25 * Math.PI, 150, 2.5, false), new CircleMove(3 * Math.PI / 4, 4 * Math.PI, 40, 2.5, true), new Goto(5)]];
Enemies.prototype.moveSeqs = [[
// *** STAGE 1 *** //
[0.8, 56, 176, 75, 40, 7, Zako, true], [0.08, 56, 176, 35, 40, 7, Zako, true], [0.08, 56, 176, 55, 40, 7, Zako, true], [0.08, 56, 176, 15, 40, 7, Zako, true], [0.08, 56, 176, 75, -120, 4, Zako, true], [0.8, -56, 176, -75, 40, -7, Zako, true], [0.08, -56, 176, -35, 40, -7, Zako, true], [0.08, -56, 176, -55, 40, -7, Zako, true], [0.08, -56, 176, -15, 40, -7, Zako, true], [0.08, -56, 176, -75, -120, -4, Zako, true],

/*    [0.5, 0, 176, 75, 60, 0, Zako, true],
    [0.05, 0, 176, 35, 60, 0, Zako, true],
    [0.05, 0, 176, 55, 60, 0, Zako, true],
    [0.05, 0, 176, 15, 60, 0, Zako, true],
    [0.05, 0, 176, 95, 60, 0, Zako, true],*/

[0.8, 128, -128, 75, 60, 6, Zako, true], [0.08, 128, -128, 35, 60, 6, Zako, true], [0.08, 128, -128, 55, 60, 6, Zako, true], [0.08, 128, -128, 15, 60, 6, Zako, true], [0.08, 128, -128, 95, 60, 6, Zako, true],
/*
    [0.5, 0, 176, -75, 60, 2, Zako, true],
    [0.05, 0, 176, -35, 60, 2, Zako, true],
    [0.05, 0, 176, -55, 60, 2, Zako, true],
    [0.05, 0, 176, -15, 60, 2, Zako, true],
    [0.05, 0, 176, -95, 60, 2, Zako, true],
    */

[0.8, -128, -128, -75, 60, -6, Zako, true], [0.08, -128, -128, -35, 60, -6, Zako, true], [0.08, -128, -128, -55, 60, -6, Zako, true], [0.08, -128, -128, -15, 60, -6, Zako, true], [0.08, -128, -128, -95, 60, -6, Zako, true], [0.7, 0, 176, 75, 80, 1, Zako1, true], [0.05, 0, 176, 35, 80, 1, Zako1, true], [0.05, 0, 176, 55, 80, 1, Zako1, true], [0.05, 0, 176, 15, 80, 1, Zako1, true], [0.05, 0, 176, 95, 80, 1, Zako1, true], [0.7, 0, 176, -75, 80, 3, Zako1, true], [0.05, 0, 176, -35, 80, 3, Zako1, true], [0.05, 0, 176, -55, 80, 3, Zako1, true], [0.05, 0, 176, -15, 80, 3, Zako1, true], [0.05, 0, 176, -95, 80, 3, Zako1, true], [0.7, 0, 176, 85, 120, 1, MBoss, true, 1], [0.05, 0, 176, 95, 100, 1, Zako1, true, 1], [0.05, 0, 176, 75, 100, 1, Zako1, true, 1], [0.05, 0, 176, 45, 120, 1, MBoss, true, 2], [0.05, 0, 176, 55, 100, 1, Zako1, true, 2], [0.05, 0, 176, 35, 100, 1, Zako1, true, 2], [0.05, 0, 176, 65, 120, 1, MBoss, true], [0.05, 0, 176, 15, 100, 1, Zako1, true], [0.05, 0, 176, 25, 120, 1, MBoss, true], [0.8, 0, 176, -85, 120, 3, MBoss, true, 3], [0.05, 0, 176, -95, 100, 3, Zako1, true, 3], [0.05, 0, 176, -75, 100, 3, Zako1, true, 3], [0.05, 0, 176, -45, 120, 3, MBoss, true, 4], [0.05, 0, 176, -55, 100, 3, Zako1, true, 4], [0.05, 0, 176, -35, 100, 3, Zako1, true, 4], [0.05, 0, 176, -65, 120, 3, MBoss, true], [0.05, 0, 176, -15, 100, 3, Zako1, true], [0.05, 0, 176, -25, 120, 3, MBoss, true]]];

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
//import * as song from './song';

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

function calcScreenSize() {
  CONSOLE_WIDTH = window.innerWidth;
  CONSOLE_HEIGHT = window.innerHeight;
  if (CONSOLE_WIDTH >= CONSOLE_HEIGHT) {
    CONSOLE_WIDTH = CONSOLE_HEIGHT * sfg.VIRTUAL_WIDTH / sfg.VIRTUAL_HEIGHT;
  } else {
    CONSOLE_HEIGHT = CONSOLE_WIDTH * sfg.VIRTUAL_HEIGHT / sfg.VIRTUAL_WIDTH;
  }
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

function ScoreEntry(name, score) {
  this.name = name;
  this.score = score;
}

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

  // var texLoader = function(src){
  //   return new Promise(function(resolve,reject){
  //    
  //   });
  // }
  // for(var p in textures){
  //   v
  // }

  // (function () {
  //   progress = new graphics.Progress();
  //   progress.mesh.position.z = 0.001;
  //   progress.render('Loading Resouces ...', 0);
  //   scene.add(progress.mesh);
  //   function loadResouces() {
  //     renderer.render(scene, camera);
  //     if (sfg.textureFiles.loadCompletedCount == sfg.textureFiles.totalTextureCount)
  //     {
  //       scene.remove(progress.mesh);
  //       //progress.render('Loading Complete.', 100);
  //     } else {
  //       progress.render('Loading Resouces ...', (textureFiles.loadCompletedCount / textureFiles.totalTextureCount * 100) | 0);
  //       window.setTimeout(loadResources, 100);
  //     }
  //   }
  //   loadResouces();
  // }
  // )();
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
      var z = -1000.0 * Math.random() - 100.0;
      color.setHSL(0.05 + Math.random() * 0.05, 1.0, (-1100 - z) / -1100);
      var endy = sfg.VIRTUAL_HEIGHT / 2 - z * sfg.VIRTUAL_HEIGHT / sfg.VIRTUAL_WIDTH;
      var vert2 = new THREE.Vector3((sfg.VIRTUAL_WIDTH - z * 2) * Math.random() - (sfg.VIRTUAL_WIDTH - z * 2) / 2, endy * 2 * Math.random() - endy, z);
      geometry.vertices.push(vert2);
      geometry.endy.push(endy);

      geometry.colors.push(color);
    }

    // マテリアルを作成
    //var texture = THREE.ImageUtils.loadTexture('images/particle1.png');
    var material = new THREE.ParticleBasicMaterial({
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

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CollisionArea = CollisionArea;
exports.GameObj = GameObj;
function CollisionArea(offsetX, offsetY, width, height) {
  this.offsetX = offsetX || 0;
  this.offsetY = offsetY || 0;
  this.top = 0;
  this.bottom = 0;
  this.left = 0;
  this.right = 0;
  this.width = width || 0;
  this.height = height || 0;
}

CollisionArea.prototype = {
  width_: 0,
  height_: 0,
  get width() {
    return width_;
  },
  set width(v) {
    this.width_ = v;
    this.left = this.offsetX - v / 2;
    this.right = this.offsetX + v / 2;
  },
  get height() {
    return height_;
  },
  set height(v) {
    this.height_ = v;
    this.top = this.offsetY + v / 2;
    this.bottom = this.offsetY - v / 2;
  }
};

function GameObj(x, y, z) {
  this.x_ = x || 0;
  this.y_ = y || 0;
  this.z_ = z || 0.0;
  this.enable_ = false;
  this.width = 0;
  this.height = 0;
  this.collisionArea = new CollisionArea();
}

GameObj.prototype = {
  get x() {
    return this.x_;
  },
  set x(v) {
    this.x_ = v;
  },
  get y() {
    return this.y_;
  },
  set y(v) {
    this.y_ = v;
  },
  get z() {
    return this.z_;
  },
  set z(v) {
    this.z_ = v;
  }
};

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
var CHECK_COLLISION = exports.CHECK_COLLISION = true;
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
  clear: function () {
    for (var d in this.keyCheck) {
      this.keyCheck[d] = false;
    }
    this.keyBuffer.length = 0;
  },
  keydown: function (e) {
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
  keyup: function () {
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
  bind: function () {
    d3.select('body').on('keydown', this.keydown.bind(this));
    d3.select('body').on('keyup', this.keyup.bind(this));
  },
  // アンバインドする
  unbind: function () {
    d3.select('body').on('keydown', null);
    d3.select('body').on('keyup', null);
  }
};

},{}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MyBullet = MyBullet;
exports.MyShip = MyShip;

var _global = require('./global');

var sfg = _interopRequireWildcard(_global);

var _gameobj = require('./gameobj');

var gameobj = _interopRequireWildcard(_gameobj);

var _graphics = require('./graphics');

var graphics = _interopRequireWildcard(_graphics);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/// 自機弾
function MyBullet(scene, se) {
  gameobj.GameObj.call(this, 0, 0, 0);

  this.collisionArea.width = 4;
  this.collisionArea.height = 6;
  this.speed = 8;

  this.textureWidth = sfg.textureFiles.myship.image.width;
  this.textureHeight = sfg.textureFiles.myship.image.height;

  // メッシュの作成・表示 ///

  var material = graphics.createSpriteMaterial(sfg.textureFiles.myship);
  var geometry = graphics.createSpriteGeometry(16);
  graphics.createSpriteUV(geometry, sfg.textureFiles.myship, 16, 16, 1);
  this.mesh = new THREE.Mesh(geometry, material);

  this.mesh.position.x = this.x_;
  this.mesh.position.y = this.y_;
  this.mesh.position.z = this.z_;
  this.se = se;
  //se(0);
  //sequencer.playTracks(soundEffects.soundEffects[0]);
  scene.add(this.mesh);
  this.mesh.visible = this.enable_ = false;
  //  sfg.tasks.pushTask(function (taskIndex) { self.move(taskIndex); });
}

var myBullets = [];

MyBullet.prototype = {
  get x() {
    return this.x_;
  },
  set x(v) {
    this.x_ = this.mesh.position.x = v;
  },
  get y() {
    return this.y_;
  },
  set y(v) {
    this.y_ = this.mesh.position.y = v;
  },
  get z() {
    return this.z_;
  },
  set z(v) {
    this.z_ = this.mesh.position.z = v;
  },
  move: function (taskIndex) {
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
  },

  start: function (x, y, z, aimRadian) {
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
};

/// 自機オブジェクト
function MyShip(x, y, z, scene, se) {
  var _this = this;

  gameobj.GameObj.call(this, x, y, z); // extend

  this.collisionArea.width = 6;
  this.collisionArea.height = 8;
  this.se = se;
  this.scene = scene;

  this.textureWidth = sfg.textureFiles.myship.image.width;
  this.textureHeight = sfg.textureFiles.myship.image.height;

  this.width = 16;
  this.height = 16;

  // 移動範囲を求める
  this.top = sfg.V_TOP - this.height / 2 | 0;
  this.bottom = sfg.V_BOTTOM + this.height / 2 | 0;
  this.left = sfg.V_LEFT + this.width / 2 | 0;
  this.right = sfg.V_RIGHT - this.width / 2 | 0;

  // メッシュの作成・表示
  // マテリアルの作成
  var material = graphics.createSpriteMaterial(sfg.textureFiles.myship);
  // ジオメトリの作成
  var geometry = graphics.createSpriteGeometry(this.width);
  graphics.createSpriteUV(geometry, sfg.textureFiles.myship, this.width, this.height, 0);

  this.mesh = new THREE.Mesh(geometry, material);

  this.mesh.position.x = this.x_;
  this.mesh.position.y = this.y_;
  this.mesh.position.z = this.z_;
  this.rest = 3;
  this.myBullets = function () {
    var arr = [];
    for (var i = 0; i < 2; ++i) {
      arr.push(new MyBullet(_this.scene, _this.se));
    }
    return arr;
  }();
  scene.add(this.mesh);
}

//MyShip.prototype = new GameObj();

MyShip.prototype = {
  get x() {
    return this.x_;
  },
  set x(v) {
    this.x_ = this.mesh.position.x = v;
  },
  get y() {
    return this.y_;
  },
  set y(v) {
    this.y_ = this.mesh.position.y = v;
  },
  get z() {
    return this.z_;
  },
  set z(v) {
    this.z_ = this.mesh.position.z = v;
  },
  shoot: function (aimRadian) {
    for (var i = 0, end = this.myBullets.length; i < end; ++i) {
      if (this.myBullets[i].start(this.x, this.y, this.z, aimRadian)) {
        break;
      }
    }
  },
  action: function (basicInput) {
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
  },
  hit: function () {
    this.mesh.visible = false;
    sfg.bombs.start(this.x, this.y, 0.2);
    this.se(4);
  }

};

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
  cls: function () {
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
  print: function (x, y, str, attribute) {
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
  render: function () {
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

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Task = Task;
exports.Tasks = Tasks;
exports.GameTimer = GameTimer;
function Task(func, priority) {
  this.priority = priority || 10000;
  this.func = func;
  this.index = 0;
}

var nullTask = exports.nullTask = new Task(null);

/// タスク管理
function Tasks() {
  this.array = new Array(0);
  this.needSort = false;
  this.needCompress = false;
}

Tasks.prototype = {
  // indexの位置のタスクを置き換える
  setNextTask: function (index, func, priority) {
    var t = new Task(func, priority);
    t.index = index;
    this.array[index] = t;
    this.needSort = true;
  },

  pushTask: function (func, priority) {
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
  },
  // 配列を取得する
  getArray: function () {
    return this.array;
  },
  // タスクをクリアする
  clear: function () {
    this.array.length = 0;
  },
  // ソートが必要かチェックし、ソートする
  checkSort: function () {
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
  },
  removeTask: function (index) {
    this.array[index] = nullTask;
    this.needCompress = true;
  },
  compress: function () {
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
};

/// ゲーム用タイマー
function GameTimer(getCurrentTime) {
  this.elapsedTime = 0;
  this.currentTime = 0;
  this.pauseTime = 0;
  this.status = this.STOP;
  this.getCurrentTime = getCurrentTime;
}

GameTimer.prototype = {
  start: function () {
    this.elapsedTime = 0;
    this.deltaTime = 0;
    this.currentTime = this.getCurrentTime();
    this.status = this.START;
  },
  resume: function () {
    var nowTime = this.getCurrentTime();
    this.currentTime = this.currentTime + nowTime - this.pauseTime;
    this.status = this.START;
  },
  pause: function () {
    this.pauseTime = this.getCurrentTime();
    this.status = this.PAUSE;
  },
  stop: function () {
    this.status = this.STOP;
  },
  update: function () {
    if (this.status != this.START) return;
    var nowTime = this.getCurrentTime();
    this.deltaTime = nowTime - this.currentTime;
    this.elapsedTime = this.elapsedTime + this.deltaTime;
    this.currentTime = nowTime;
  },
  STOP: 1,
  START: 2,
  PAUSE: 3
};

},{}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGpzXFxhdWRpby5qcyIsInNyY1xcanNcXGNvbW0uanMiLCJzcmNcXGpzXFxlZmZlY3RvYmouanMiLCJzcmNcXGpzXFxlbmVtaWVzLmpzIiwic3JjXFxqc1xcZ2FtZS5qcyIsInNyY1xcanNcXGdhbWVvYmouanMiLCJzcmNcXGpzXFxnbG9iYWwuanMiLCJzcmNcXGpzXFxncmFwaGljcy5qcyIsInNyY1xcanNcXGlvLmpzIiwic3JjXFxqc1xcbXlzaGlwLmpzIiwic3JjXFxqc1xcdGV4dC5qcyIsInNyY1xcanNcXHV0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUNNQSxZQUFZOztBQUFDOzs7O1FBMEJHLFNBQVMsR0FBVCxTQUFTO1FBNEJULFVBQVUsR0FBVixVQUFVO1FBUVYseUJBQXlCLEdBQXpCLHlCQUF5QjtRQW1DekIsV0FBVyxHQUFYLFdBQVc7UUFnQ1gsaUJBQWlCLEdBQWpCLGlCQUFpQjtRQXFDakIsS0FBSyxHQUFMLEtBQUs7UUErREwsS0FBSyxHQUFMLEtBQUs7UUF1RUwsSUFBSSxHQUFKLElBQUk7UUF3YkosU0FBUyxHQUFULFNBQVM7UUF3S1QsWUFBWSxHQUFaLFlBQVk7QUExNEI1QixJQUFJLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDL0IsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDO0FBQ3ZCLElBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQzs7QUFFbkIsSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDO0FBQ2xCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRTtBQUM3QixVQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxD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QUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0dBRTVDO0NBQ0YsQ0FBQTs7QUFFRCxJQUNFLENBQUMsR0FBSSxJQUFJLElBQUksQ0FBRSxDQUFDLEVBQUMsSUFBSSxDQUFDO0lBQ3RCLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBRSxDQUFDLEVBQUMsSUFBSSxDQUFDO0lBQ3RCLENBQUMsR0FBSSxJQUFJLElBQUksQ0FBRSxDQUFDLEVBQUMsSUFBSSxDQUFDO0lBQ3RCLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBRSxDQUFDLEVBQUMsSUFBSSxDQUFDO0lBQ3RCLENBQUMsR0FBSSxJQUFJLElBQUksQ0FBRSxDQUFDLEVBQUMsSUFBSSxDQUFDO0lBQ3RCLENBQUMsR0FBSSxJQUFJLElBQUksQ0FBRSxDQUFDLEVBQUMsSUFBSSxDQUFDO0lBQ3RCLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBRSxDQUFDLEVBQUMsSUFBSSxDQUFDO0lBQ3RCLENBQUMsR0FBSSxJQUFJLElBQUksQ0FBRSxDQUFDLEVBQUMsSUFBSSxDQUFDO0lBQ3RCLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBRSxDQUFDLEVBQUMsSUFBSSxDQUFDO0lBQ3RCLENBQUMsR0FBSSxJQUFJLElBQUksQ0FBRSxDQUFDLEVBQUMsSUFBSSxDQUFDO0lBQ3RCLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBQyxFQUFFLEVBQUMsSUFBSSxDQUFDO0lBQ3RCLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDOzs7O0FBQUMsQUFJekIsU0FBUyxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFDM0M7QUFDRSxNQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUNqQixNQUFJLENBQUMsR0FBRyxHQUFHLEdBQUc7O0FBQUMsQUFFZixNQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUNqQixNQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUNqQixNQUFJ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QU0sR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNsQyxVQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUN4QixhQUFPLElBQUksT0FBTyxDQUNsQixDQUFDLEFBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRSxJQUFJLEdBQUMsS0FBSyxDQUFBLElBQUssS0FBSyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsQ0FBQyxJQUFJLElBQUksRUFDdEQsQ0FBQyxBQUFDLENBQUMsSUFBSSxDQUFDLEdBQUksR0FBRyxHQUFHLEtBQUssQ0FBQSxJQUFLLEtBQUssQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQ3hELENBQUMsQUFBQyxDQUFDLElBQUksQ0FBQyxHQUFJLElBQUksR0FBRyxLQUFLLENBQUEsSUFBSyxLQUFLLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxDQUFDLElBQUksSUFBSSxFQUMxRCxDQUFDLEFBQUMsQ0FBQyxJQUFJLENBQUMsR0FBSSxJQUFJLEdBQUcsS0FBSyxDQUFBLElBQUssS0FBSyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsQ0FBQyxJQUFJLElBQUksRUFDMUQsQ0FBQyxBQUFDLENBQUMsSUFBSSxDQUFDLEdBQUksR0FBRyxHQUFHLEtBQUssQ0FBQSxJQUFLLEtBQUssQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQ3ZELENBQUM7S0FDSDtHQUNGO0FBQ0QsU0FBTyxJQUFJLE9BQU8sQ0FBQyxJQUFJLElBQUksSUFBSSxFQUFFLEdBQUcsSUFBSSxJQUFJLEVBQUUsSUFBSSxJQUFJLElBQUksRUFBRSxJQUFJLElBQUksSUFBSSxFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQztDQUN4Rjs7QUFFRCxTQUFTLEVBQUUsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFO0FBQ3RDLFNBQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxD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LENBQUMsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFDckQsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQzNCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FDTjtHQUNKLEVBQ0Q7QUFDRSxRQUFJLEVBQUUsT0FBTztBQUNiLFdBQU8sRUFBRSxDQUFDO0FBQ1YsUUFBSSxFQUNGLENBQ0EsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxFQUMxQixLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQy9DLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxFQUNkLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsRUFBRSxFQUFFLENBQUMsRUFDdEQsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDbEMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUNOO0dBQ0osQ0FDRjtDQUNGLENBQUE7O0FBRU0sU0FBUyxZQUFZLENBQUMsU0FBUyxFQUFFO0FBQ3JDLE1BQUksQ0FBQyxZQUFZLEdBQ2hCOztBQUVBLGNBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFDLENBQzVCO0FBQ0UsV0FBTyxFQUFFLENBQUM7QUFDVixXQUFPLEVBQUMsSUFBSTtBQUNaLFFBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFDaEIsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxFQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUMzSDtHQUNGLEVBQ0Q7QUFDRSxXQUFPLEVBQUUsQ0FBQztBQUNWLFdBQU8sRUFBRSxJQUFJO0FBQ2IsUUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUNoQixHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUMzSTtHQUNGLENBQ0EsQ0FBQzs7QUFFRixjQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFDekIsQ0FDRTtBQUNFLFdBQU8sRUFBRSxFQUFFO0FBQ1gsV0FBTyxFQUFFLElBQUk7QUFDYixRQUFJLEVBQUUsQ0FDTCxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxHQUFHLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDLEVBQ3pFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQ3RHO0dBQ0YsQ0FDRixDQUFDOztBQUVKLGNBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUN6QixDQUNFO0FBQ0UsV0FBTyxFQUFFLEVBQUU7QUFDWCxXQUFPLEVBQUUsSUFBSTtBQUNiLFFBQUksRUFBRSxDQUNMLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsRUFDekUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxFQUFFLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBQyxDQUFDLEVBQUMsRUFBRSxFQUFDLENBQUMsRUFBQyxFQUFFLEVBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBQyxDQUFDLEVBQUMsRUFBRSxFQUFDLENBQUMsRUFBQyxFQUFFLEVBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBQyxDQUFDLEVBQUMsRUFBRSxFQUFDLENBQUMsQ0FDdEU7R0FDRixDQUNGLENBQUM7O0FBRUYsY0FBWSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQ3pCLENBQ0U7QUFDRSxXQUFPLEVBQUUsRUFBRTtBQUNYLFdBQU8sRUFBRSxJQUFJO0FBQ2IsUUFBSSxFQUFFLENBQ0wsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsR0FBRyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxFQUN6RSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBQyxDQUFDLEVBQUMsRUFBRSxFQUFDLENBQUMsRUFBQyxFQUFFLEVBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBQyxDQUFDLEVBQUMsRUFBRSxFQUFDLENBQUMsRUFBQyxFQUFFLEVBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FDdkM7R0FDRixDQUNGLENBQUM7O0FBRUosY0FBWSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQ3pCLENBQ0U7QUFDRSxXQUFPLEVBQUUsRUFBRTtBQUNYLFdBQU8sRUFBRSxJQUFJO0FBQ2IsUUFBSSxFQUFFLENBQ0wsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsRUFDbEYsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FDUDtHQUNGLENBQ0YsQ0FBQyxDQUNOLENBQUM7Q0FDSDs7O0FDdjlCRixZQUFZLENBQUM7Ozs7O1FBRUcsSUFBSSxHQUFKLElBQUk7QUFBYixTQUFTLElBQUksR0FBRzs7O0FBQ3JCLE1BQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBQyxXQUFXLEdBQUMsZ0JBQWdCLENBQUM7QUFDdEYsTUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7QUFDcEIsTUFBSTtBQUNGLFFBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsSUFBSSxHQUFHLFlBQVksQ0FBQyxDQUFDO0FBQzFELFFBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ25CLFFBQUksSUFBSSxHQUFHLElBQUksQ0FBQztBQUNoQixRQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxVQUFDLElBQUksRUFBRztBQUN2QyxVQUFHLE1BQUssZ0JBQWdCLEVBQUM7QUFDdkIsY0FBSyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUM3QjtLQUNGLENBQUMsQ0FBQztBQUNILFFBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLGVBQWUsRUFBRSxVQUFDLElBQUksRUFBRztBQUN0QyxZQUFLLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUM1QixDQUFDLENBQUM7O0FBRUgsUUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLFVBQUMsSUFBSSxFQUFLO0FBQ25DLFlBQUssZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0tBQ3hDLENBQUMsQ0FBQzs7QUFFSCxRQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxZQUFZO0FBQy9DLFdBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ3hCLFVBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0tBQ3JCLENBQUMsQ0FBQzs7QUFFSCxRQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsWUFBWTtBQUN2QyxVQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7QUFDZixZQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUNwQixhQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztPQUMxQjtLQUNGLENBQUMsQ0FBQztHQUVKLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixTQUFLLENBQUMscUNBQXFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7R0FDbEQ7Q0FDRjs7QUFFRCxJQUFJLENBQUMsU0FBUyxHQUFHO0FBQ2YsV0FBUyxFQUFDLFVBQVMsS0FBSyxFQUN4QjtBQUNFLFFBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNmLFVBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQztLQUN0QztHQUNGO0FBQ0QsWUFBVSxFQUFDLFlBQ1g7QUFDRSxRQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7QUFDZixVQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUNwQixVQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO0tBQzFCO0dBQ0Y7Q0FDRixDQUFBOzs7QUNyREQsWUFBWSxDQUFDOzs7OztRQU9HLElBQUksR0FBSixJQUFJO1FBMkRKLEtBQUssR0FBTCxLQUFLOzs7O0lBakVULEdBQUc7Ozs7SUFDRixPQUFPOzs7O0lBQ1IsUUFBUTs7Ozs7QUFJYixTQUFTLElBQUksQ0FBQyxLQUFLLEVBQUMsRUFBRSxFQUFFO0FBQzdCLFNBQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3BDLE1BQUksR0FBRyxHQUFHLEdBQUcsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDO0FBQ2hDLE1BQUksUUFBUSxHQUFHLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNsRCxVQUFRLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQztBQUMzQyxVQUFRLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztBQUM1QixNQUFJLFFBQVEsR0FBRyxRQUFRLENBQUMsb0JBQW9CLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDakQsVUFBUSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDbEQsTUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQy9DLE1BQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDM0IsTUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDZixNQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFDMUIsTUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDbkIsTUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDYixPQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUN0Qjs7QUFFRCxJQUFJLENBQUMsU0FBUyxHQUFHO0FBQ2YsTUFBSSxDQUFDLEdBQUc7QUFBRSxXQUFPLElBQUksQ0FBQyxFQUFFLENBQUM7R0FBRTtBQUMzQixNQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFBRSxRQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7R0FBRTtBQUNoRCxNQUFJLENBQUMsR0FBRztBQUFFLFdBQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQztHQUFFO0FBQzNCLE1BQUksQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUFFLFFBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztHQUFFO0FBQ2hELE1BQUksQ0FBQyxHQUFHO0FBQUUsV0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDO0dBQUU7QUFDM0IsTUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQUUsUUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0dBQUU7QUFDaEQsT0FBSyxFQUFFLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFO0FBQy9CLFFBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNoQixhQUFPLEtBQUssQ0FBQztLQUNkO0FBQ0QsUUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZCLFFBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ1gsUUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDWCxRQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUM7QUFDckIsUUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7QUFDcEIsUUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDZixZQUFRLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3ZGLFFBQUksSUFBSSxHQUFHLElBQUksQ0FBQztBQUNoQixPQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRTtBQUFFLFVBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FBRSxDQUFDLENBQUM7QUFDbkQsUUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQztBQUNqQyxXQUFPLElBQUksQ0FBQztHQUNiO0FBQ0QsTUFBSSxFQUFFLFVBQVUsU0FBUyxFQUFFO0FBQ3pCLFFBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO0FBQ2YsVUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0tBQzFCLE1BQU07QUFDTCxVQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDYixhQUFPO0tBQ1I7QUFDRCxRQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDYixRQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUFFO0FBQ2xCLGNBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDeEYsTUFBTTtBQUNMLFVBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0FBQ3JCLFVBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztBQUMxQixTQUFHLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUNqQztHQUVGO0NBQ0YsQ0FBQTs7QUFFTSxTQUFTLEtBQUssQ0FBQyxLQUFLLEVBQUMsRUFBRSxFQUFFO0FBQzlCLE1BQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUIsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRTtBQUMzQixRQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztHQUNyQztDQUNGOztBQUVELEtBQUssQ0FBQyxTQUFTLEdBQUc7QUFDaEIsT0FBSyxFQUFFLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDeEIsUUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUN0QixRQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDZCxTQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFO0FBQy9DLFVBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFO0FBQ3BCLFlBQUksS0FBSyxJQUFJLENBQUMsRUFBRTtBQUNkLGNBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDM0IsTUFBTTtBQUNMLGNBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFBLEFBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVB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Q0FBQztHQUNsQztDQUNGOzs7QUFBQyxBQUdGLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLFlBQVk7QUFDbkMsTUFBSSxXQUFXLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUM7QUFDNUMsTUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUM3QixNQUFJLEdBQUcsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFNOztBQUFDLEFBRS9DLFNBQU8sSUFBSSxDQUFDLFlBQVksR0FBRyxHQUFHLEVBQUU7QUFDOUIsUUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzVELFFBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9ELFFBQUksV0FBVyxJQUFLLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxBQUFDLEVBQUU7QUFDNUMsVUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztBQUMzQixXQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFO0FBQzlDLFlBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QixZQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRTtBQUNsQixlQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFD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QUFJLENBQUMsRUFBRSxFQUFFLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQzdELElBQUksSUFBSSxFQUFFLEVBQ1YsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUN2RCxJQUFJLFFBQVEsRUFBRSxFQUNkLElBQUksUUFBUSxFQUFFLEVBQ2QsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBQyxDQUFDLEVBQUMsRUFBRSxFQUFDLENBQUMsRUFBQyxLQUFLLENBQUMsRUFDcEMsSUFBSSxVQUFVLENBQUMsQ0FBQyxFQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUMsR0FBRyxFQUFDLENBQUMsRUFBQyxLQUFLLENBQUMsRUFDOUMsSUFBSSxJQUFJLEVBQUUsRUFDVixJQUFJLFVBQVUsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFDbEUsSUFBSSxVQUFVLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxHQUFHLEVBQUMsSUFBSSxDQUFDLEVBQ3ZELElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUNkO0FBQ0MsQ0FDRSxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQ3RELElBQUksVUFBVSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQzdELElBQUksSUFBSSxFQUFFLEVBQ1YsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUN2RCxJQUFJLFFBQVEsRUFBRSxFQUNkLElBQUksUUFBUSxFQUFFLEVBQ2QsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBQyxDQUFDLEVBQUMsRUFBRSxFQUFDLENBQUMsRUFBQyxLQUFLLENBQUMsRUFDcEMsSUFBSSxVQUFVLENBQUMsQ0FBQyxFQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUMsR0FBRyxFQUFDLENBQUMsRUFBQyxLQUFLLENBQUMsRUFDOUMsSUFBSSxJQUFJLEVBQUUsRUFDVixJQUFJLFVBQVUsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsRUFDaEUsSUFBSSxVQUFVLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQ3pELElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUNaO0FBQ0QsQ0FDRSxJQUFJLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUNsRCxJQUFJLFVBQVUsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsRUFDaEUsSUFBSSxJQUFJLEVBQUUsRUFDVixJQUFJLFVBQVUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFBLEdBQUksSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUNsRSxJQUFJLFFBQVEsRUFBRSxFQUNkLElBQUksUUFBUSxFQUFFLEVBQ2QsSUFBSSxVQUFVLENBQUMsQ0FBQyxFQUFDLElBQUksQ0FBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsRUFDbkMsSUFBSSxVQUFVLENBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUN2RCxJQUFJLElBQUksRUFBRSxFQUNWLElBQUksVUFBVSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEVBQy9ELElBQUksVUFBVSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEdBQUcsRUFBQyxLQUFLLENBQUMsRUFDeEQsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQ1o7QUFDRCxDQUNFLElBQUksVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQ2xELElBQUksVUFBVSxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUNoRSxJQUFJLElBQUksRUFBRSxFQUNWLElBQUksVUFBVSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUEsR0FBSSxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQ2xFLElBQUksSUFBSSxFQUFFLEVBQ1YsSUFBSSxRQUFRLEVBQUUsRUFDZCxJQUFJLFFBQVEsRUFBRSxFQUNkLElBQUksVUFBVSxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLEVBQ25DLElBQUksVUFBVSxDQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsRUFDdkQsSUFBSSxJQUFJLEVBQUUsRUFDVixJQUFJLFVBQVUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUM3RCxJQUFJLFVBQVUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxDQUFDLEVBQUMsS0FBSyxDQUFDLEVBQ3RELElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUNaLEVBQ0Q7QUFDRSxJQUFJLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUNqRCxJQUFJLFVBQVUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQ3JELElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsRUFDckQsSUFBSSxRQUFRLEVBQUUsRUFDZCxJQUFJLFFBQVEsRUFBRSxFQUNkLElBQUksVUFBVSxDQUFDLENBQUMsRUFBRSxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUNoRCxJQUFJLFVBQVUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQ3JELElBQUksSUFBSSxFQUFFLEVBQ1YsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUNwRCxJQUFJLFVBQVUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUM1RCxJQUFJLFVBQVUsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQ3pELElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUNaLEVBQ0Q7QUFDRSxJQUFJLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUNsRCxJQUFJLFVBQVUsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsRUFDaEUsSUFBSSxVQUFVLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEFBQUMsQ0FBQyxHQUFJLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsRUFDM0QsSUFBSSxRQUFRLEVBQUUsRUFDZCxJQUFJLFFBQVEsRUFBRSxFQUNkLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsRUFDdkQsSUFBSSxVQUFVLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQ2hELElBQUksSUFBSSxFQUFFLEVBQ1YsSUFBSSxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsRUFDaEQsSUFBSSxVQUFVLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsRUFDM0QsSUFBSSxVQUFVLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsRUFDdkQsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQ1osRUFDRDtBQUNFLElBQUksVUFBVSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUM7O0FBRXBELElBQUksVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQzs7QUFFM0MsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQzs7QUFFckQsSUFBSSxRQUFRLEVBQUUsRUFDZCxJQUFJLFFBQVEsRUFBRSxFQUNkLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBQyxDQUFDLEVBQUMsS0FBSyxDQUFDLEVBQ3BDLElBQUksVUFBVSxDQUFDLENBQUMsRUFBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFDLEdBQUcsRUFBQyxDQUFDLEVBQUMsS0FBSyxDQUFDLEVBQzlDLElBQUksSUFBSSxFQUFFLEVBQ1YsSUFBSSxVQUFVLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQ2xFLElBQUksVUFBVSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsR0FBRyxFQUFDLElBQUksQ0FBQyxFQUN2RCxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FDWixFQUNEO0FBQ0UsSUFBSSxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsRUFDakQsSUFBSSxJQUFJLEVBQUUsRUFDVixJQUFJLFVBQVUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQ3JELElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsRUFDckQsSUFBSSxVQUFVLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUN2RCxJQUFJLFFBQVEsRUFBRSxFQUNkLElBQUksUUFBUSxFQUFFLEVBQ2QsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsRUFDeEMsSUFBSSxJQUFJLEVBQUUsRUFDVixJQUFJLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUNsRCxJQUFJLFVBQVUsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFDbEUsSUFBSSxVQUFVLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEVBQzNELElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUNaLENBQ0YsQ0FDQTtBQUNELE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLENBQzNCOztBQUVFLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUNyQyxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFDdEMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQ3RDLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUN0QyxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUV4QyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFDeEMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQ3pDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUN6QyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFDekMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUM7Ozs7Ozs7O0FBUTNDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQ3ZDLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQ3hDLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQ3hDLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQ3hDLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDOzs7Ozs7Ozs7QUFTeEMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFDMUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFDM0MsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFDM0MsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFDM0MsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFFM0MsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQ3JDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUN0QyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsRUFDdEMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQ3RDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUV0QyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUN0QyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUN2QyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUN2QyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUN2QyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUV2QyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDLEVBQ3hDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUMsRUFDekMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxFQUN6QyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDLEVBQ3pDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUMsRUFDekMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxFQUN6QyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsRUFDdkMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQ3ZDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUV2QyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUMsRUFDekMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDLEVBQzFDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxFQUMxQyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUMsRUFDMUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDLEVBQzFDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxFQUMxQyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUN4QyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENB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Q0UsTUFBSSxRQUFRLEdBQUcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztBQUNoRyxXQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUM7QUFDdEMsTUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ1YsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRTtBQUNyRCxRQUFJLFFBQVEsR0FBRyxVQUFVLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUNoRCxZQUFRLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNuRCxRQUFJLElBQUksSUFBSSxDQUFDLEVBQUU7QUFDYixlQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxRQUFRLEdBQUcsR0FBRyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7S0FDOUcsTUFBTTtBQUNMLGVBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLFFBQVEsR0FBRyxHQUFHLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ2hGO0FBQ0QsS0FBQyxJQUFJLENBQUMsQ0FBQztHQUNSO0NBQ0Y7O0FBRUQsU0FBUyxTQUFTLENBQUMsU0FBUyxFQUFF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QUFDLEFBQUMsSUFBSSxHQUFJLFNBQVMsR0FBRyxLQUFLLEVBQUUsQUFBQyxJQUFJLEdBQUksVUFBVSxHQUFHLE1BQU0sQ0FBQyxFQUMzRSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQUFBQyxJQUFJLEdBQUksU0FBUyxHQUFHLEtBQUssRUFBRSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUEsR0FBSSxVQUFVLEdBQUcsTUFBTSxDQUFDLEVBQy9FLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUEsR0FBSSxTQUFTLEdBQUcsS0FBSyxFQUFFLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQSxHQUFJLFVBQVUsR0FBRyxNQUFNLENBQUMsQ0FDcEYsQ0FBQyxDQUFDO0NBQ0o7O0FBRU0sU0FBUyxjQUFjLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFDL0U7QUFDRSxNQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztBQUNoQyxNQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQzs7QUFFbEMsTUFBSSxVQUFVLEdBQUcsQUFBQyxLQUFLLEdBQUcsU0FBUyxHQUFJLENBQUMsQ0FBQztBQUN6QyxNQUFJLFVBQVUsR0FBRyxBQUFDLE1BQU0sR0FBRyxVQUFVLEdBQUksQ0FBQyxDQUFDO0FBQzNDLE1BQUksSUFBSSxHQUFHLFVBQVUsSUFBSSxBQUFDLE1BQU0sR0FBRyxVQUFVLEdBQUksQ0FBQyxDQUFBLEFBQUMsQ0FBQztBQUNwRCxNQUFJLElBQUksR0FBRyxNQUFNLEdBQUcsVUFBVSxDQUFDO0FBQy9CLE1BQUksS0FBSyxHQUFHLFNBQVMsR0FBRyxLQUFLLENBQUM7QUFDOUIsTUFBSSxLQUFLLEdBQUcsVUFBVSxHQUFHLE1BQU0sQ0FBQztBQUNoQyxNQUFJLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUV2QyxLQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEFBQUMsSUFBSSxHQUFJLEtBQUssQ0FBQztBQUMxQixLQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEFBQUMsSUFBSSxHQUFJLEtBQUssQ0FBQztBQUMxQixLQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQSxHQUFJLEtBQUssQ0FBQztBQUM5QixLQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQSxHQUFJLEtBQUssQ0FBQztBQUM5QixLQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQSxHQUFJLEtBQUssQ0FBQztBQUM5QixLQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEFBQUMsSUFBSSxHQUFJLEtBQUssQ0FBQzs7QUFFMUIsS0FBRyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRW5DLEtBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQUFBQyxJQUFJLEdBQUksS0FBSyxDQUFDO0FBQzFCLEtBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQUFBQyxJQUFJLEdBQUksS0FBSyxDQUFDO0FBQzFCLEtBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQUFBQyxJQUFJLEdBQUksS0FBSyxDQUFDO0FBQzFCLEtBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFBLEdBQUksS0FBSyxDQUFDO0FBQzlCLEtBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFBLEdBQUksS0FBSyxDQUFDO0FBQzlCLEtBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFBLEdBQUksS0FBSyxDQUFDOztBQUc5QixVQUFRLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztDQUUvQjs7QUFFTSxTQUFTLG9CQUFvQixDQUFDLE9BQU8sRUFDNUM7O0FBRUUsTUFBSSxRQUFRLEdBQUcsSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsRUFBRSxHQUFHLEVBQUUsT0FBTyxvQkFBQSxFQUFzQixXQUFXLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUNwRyxVQUFRLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7QUFDckMsVUFBUSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDO0FBQ2hDLFVBQVEsQ0FBQyxTQUFTLEdBQUcsR0FBRyxDQUFDO0FBQ3pCLFVBQVEsQ0FBQyxXQUFXLEdBQUcsSUFBSTs7QUFBQyxBQUU1QixTQUFPLFFBQVEsQ0FBQztDQUNqQjs7O0FDNUxELFlBQVk7OztBQUFDOzs7O1FBR0csVUFBVSxHQUFWLFVBQVU7QUFBbkIsU0FBUyxVQUFVLEdBQUc7QUFDM0IsTUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUMsS0FBSyxFQUFFLENBQUM7QUFDekYsTUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7QUFDcEIsTUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDbkIsTUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7Q0FDdEI7O0FBRUQsVUFBVSxDQUFDLFNBQVMsR0FBRztBQUNyQixPQUFLLEVBQUUsWUFDUDtBQUNFLFNBQUksSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBQztBQUN6QixVQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztLQUMxQjtBQUNELFFBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztHQUMzQjtBQUNELFNBQU8sRUFBRSxVQUFVLENBQUMsRUFBRTtBQUNwQixRQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO0FBQ2pCLFFBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7QUFDL0IsUUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUM3QixRQUFJLE1BQU0sR0FBRyxJQUFJLENBQUM7O0FBRWxCLFFBQUksQ0FBQyxDQUFDLE9BQU8sSUFBSSxHQUFHLEVBQUU7QUFDcEIscUJBQWUsR0FBRyxDQUFDLGVBQWUsQ0FBQztLQUNwQyxDQUFDOztBQUVGLFFBQUksU0FBUyxDQUFDLE1BQU0sR0FBRyxFQUFFLEVBQUU7QUFDekIsZUFBUyxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ25CO0FBQ0QsYUFBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDMUIsWUFBUSxDQUFDLENBQUMsT0FBTztBQUNmLFdBQUssRUFBRSxDQUFDO0FBQ1IsV0FBSyxFQUFFLENBQUM7QUFDUixXQUFLLEdBQUc7QUFDTixnQkFBUSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDckIsY0FBTSxHQUFHLElBQUksQ0FBQztBQUNkLGNBQU07QUFBQSxBQUNSLFdBQUssRUFBRSxDQUFDO0FBQ1IsV0FBSyxFQUFFLENBQUM7QUFDUixXQUFLLEdBQUc7QUFDTixnQkFBUSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFDbkIsY0FBTSxHQUFHLElBQUksQ0FBQztBQUNkLGNBQU07QUFBQSxBQUNSLFdBQUssRUFBRSxDQUFDO0FBQ1IsV0FBSyxFQUFFLENBQUM7QUFDUixXQUFLLEdBQUc7QUFDTixnQkFBUSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDdEIsY0FBTSxHQUFHLElBQUksQ0FBQztBQUNkLGNBQU07QUFBQSxBQUNSLFdBQUssRUFBRSxDQUFDO0FBQ1IsV0FBSyxFQUFFLENBQUM7QUFDUixXQUFLLEVBQUU7QUFDTCxnQkFBUSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDckIsY0FBTSxHQUFHLElBQUksQ0FBQztBQUNkLGNBQU07QUFBQSxBQUNSLFdBQUssRUFBRTtBQUNMLGdCQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUNsQixjQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ2QsY0FBTTtBQUFBLEFBQ1IsV0FBSyxFQUFFO0FBQ0wsZ0JBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLGNBQU0sR0FBRyxJQUFJLENBQUM7QUFDZCxjQUFNO0FBQUEsS0FDVDtBQUNELFFBQUksTUFBTSxFQUFFO0FBQ1YsT0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQ25CLE9BQUMsQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO0FBQ3RCLGFBQU8sS0FBSyxDQUFDO0tBQ2Q7R0FDRjtBQUNELE9BQUssRUFBRSxZQUFZO0FBQ2pCLFFBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUM7QUFDakIsUUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztBQUMvQixRQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0FBQzdCLFFBQUksTUFBTSxHQUFHLEtBQUssQ0FBQztBQUNuQixZQUFRLENBQUMsQ0FBQyxPQUFPO0FBQ2YsV0FBSyxFQUFFLENBQUM7QUFDUixXQUFLLEVBQUUsQ0FBQztBQUNSLFdBQUssR0FBRztBQUNOLGdCQUFRLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQztBQUN0QixjQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ2QsY0FBTTtBQUFBLEFBQ1IsV0FBSyxFQUFFLENBQUM7QUFDUixXQUFLLEVBQUUsQ0FBQztBQUNSLFdBQUssR0FBRztBQUNOLGdCQUFRLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQztBQUNwQixjQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ2QsY0FBTTtBQUFBLEFBQ1IsV0FBSyxFQUFFLENBQUM7QUFDUixXQUFLLEVBQUUsQ0FBQztBQUNSLFdBQUssR0FBRztBQUNOLGdCQUFRLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztBQUN2QixjQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ2QsY0FBTTtBQUFBLEFBQ1IsV0FBSyxFQUFFLENBQUM7QUFDUixXQUFLLEVBQUUsQ0FBQztBQUNSLFdBQUssRUFBRTtBQUNMLGdCQUFRLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQztBQUN0QixjQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ2QsY0FBTTtBQUFBLEFBQ1IsV0FBSyxFQUFFO0FBQ0wsZ0JBQVEsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO0FBQ25CLGNBQU0sR0FBRyxJQUFJLENBQUM7QUFDZCxjQUFNO0FBQUEsQUFDUixXQUFLLEVBQUU7QUFDTCxnQkFBUSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7QUFDbkIsY0FBTSxHQUFHLElBQUksQ0FBQztBQUNkLGNBQU07QUFBQSxLQUNUO0FBQ0QsUUFBSSxNQUFNLEVBQUU7QUFDVixPQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDbkIsT0FBQyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7QUFDdEIsYUFBTyxLQUFLLENBQUM7S0FDZDtHQUNGOztBQUVELE1BQUksRUFBQyxZQUNMO0FBQ0UsTUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDeEQsTUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7R0FDckQ7O0FBRUQsUUFBTSxFQUFDLFlBQ1A7QUFDRSxNQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUMsSUFBSSxDQUFDLENBQUM7QUFDckMsTUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3BDO0NBQ0YsQ0FBQTs7O0FDaklELFlBQVksQ0FBQzs7Ozs7UUFPRyxRQUFRLEdBQVIsUUFBUTtRQXdFUixNQUFNLEdBQU4sTUFBTTs7OztJQTdFVixHQUFHOzs7O0lBQ0gsT0FBTzs7OztJQUNQLFFBQVE7Ozs7O0FBR2IsU0FBUyxRQUFRLENBQUMsS0FBSyxFQUFDLEVBQUUsRUFBRTtBQUNqQyxTQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzs7QUFFcEMsTUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQzdCLE1BQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUM5QixNQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQzs7QUFFZixNQUFJLENBQUMsWUFBWSxHQUFHLEdBQUcsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7QUFDeEQsTUFBSSxDQUFDLGFBQWEsR0FBRyxHQUFHLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTTs7OztBQUFDLEFBSTFELE1BQUksUUFBUSxHQUFHLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3RFLE1BQUksUUFBUSxHQUFHLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNqRCxVQUFRLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3RFLE1BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQzs7QUFFL0MsTUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7QUFDL0IsTUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7QUFDL0IsTUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7QUFDL0IsTUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFOzs7QUFBQyxBQUdiLE9BQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3JCLE1BQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSzs7QUFBQyxDQUUxQzs7QUFFRCxJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUM7O0FBRW5CLFFBQVEsQ0FBQyxTQUFTLEdBQUc7QUFDbkIsTUFBSSxDQUFDLEdBQUc7QUFBRSxXQUFPLElBQUksQ0FBQyxFQUFFLENBQUM7R0FBRTtBQUMzQixNQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFBRSxRQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7R0FBRTtBQUNoRCxNQUFJLENBQUMsR0FBRztBQUFFLFdBQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQztHQUFFO0FBQzNCLE1BQUksQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUFFLFFBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztHQUFFO0FBQ2hELE1BQUksQ0FBQyxHQUFHO0FBQUUsV0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDO0dBQUU7QUFDM0IsTUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQUUsUUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0dBQUU7QUFDaEQsTUFBSSxFQUFFLFVBQVUsU0FBUyxFQUFFO0FBQ3pCLFFBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ2pCLFVBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztBQUMxQixTQUFHLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNoQyxhQUFPO0tBQ1I7O0FBRUQsUUFBSSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDO0FBQ2xCLFFBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQzs7QUFFbEIsUUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFJLEdBQUcsQ0FBQyxLQUFLLEdBQUcsRUFBRSxBQUFDLElBQUksSUFBSSxDQUFDLENBQUMsR0FBSSxHQUFHLENBQUMsUUFBUSxHQUFHLEVBQUUsQUFBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEdBQUksR0FBRyxDQUFDLE9BQU8sR0FBRyxFQUFFLEFBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFJLEdBQUcsQ0FBQyxNQUFNLEdBQUcsRUFBRSxBQUFDLEVBQUU7QUFDMUgsU0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDaEMsVUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7S0FDMUMsQ0FBQztHQUNIOztBQUVELE9BQUssRUFBRSxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRTtBQUNuQyxRQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDaEIsYUFBTyxLQUFLLENBQUM7S0FDZDtBQUNELFFBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ1gsUUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDWCxRQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDakIsUUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDM0MsUUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDM0MsUUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7QUFDeEMsUUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7O0FBQUMsQUFFWCxRQUFJLElBQUksR0FBRyxJQUFJLENBQUM7QUFDaEIsT0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUU7QUFBRSxVQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQUUsQ0FBQyxDQUFDO0FBQ25ELFdBQU8sSUFBSSxDQUFDO0dBQ2I7Q0FDRjs7O0FBQUEsQUFHTSxTQUFTLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBQyxLQUFLLEVBQUMsRUFBRSxFQUFFOzs7QUFDdkMsU0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDOztBQUFDLEFBRXBDLE1BQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUM3QixNQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDOUIsTUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDYixNQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQzs7QUFFbkIsTUFBSSxDQUFDLFlBQVksR0FBRyxHQUFHLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQ3hELE1BQUksQ0FBQyxhQUFhLEdBQUcsR0FBRyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQzs7QUFFMUQsTUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7QUFDaEIsTUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFOzs7QUFBQyxBQUdqQixNQUFJLENBQUMsR0FBRyxHQUFHLEFBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBSSxDQUFDLENBQUM7QUFDN0MsTUFBSSxDQUFDLE1BQU0sR0FBRyxBQUFDLEdBQUcsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUksQ0FBQyxDQUFDO0FBQ25ELE1BQUksQ0FBQyxJQUFJLEdBQUcsQUFBQyxHQUFHLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFJLENBQUMsQ0FBQztBQUM5QyxNQUFJLENBQUMsS0FBSyxHQUFHLEFBQUMsR0FBRyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBSSxDQUFDOzs7O0FBQUMsQUFJaEQsTUFBSSxRQUFRLEdBQUcsUUFBUSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDOztBQUFDLEFBRXRFLE1BQUksUUFBUSxHQUFHLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDekQsVUFBUSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDOztBQUV2RixNQUFJLENBQUMsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7O0FBRS9DLE1BQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO0FBQy9CLE1BQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO0FBQy9CLE1BQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO0FBQy9CLE1BQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0FBQ2QsTUFBSSxDQUFDLFNBQVMsR0FBRyxBQUFFLFlBQUs7QUFDdEIsUUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBQ2IsU0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRTtBQUMxQixTQUFHLENBQUMsSUFBSSxDQUFDLElBQUksUUFBUSxDQUFDLE1BQUssS0FBSyxFQUFDLE1BQUssRUFBRSxDQUFDLENBQUMsQ0FBQztLQUM1QztBQUNELFdBQU8sR0FBRyxDQUFDO0dBQ1osRUFBRyxDQUFDO0FBQ0wsT0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDdEI7Ozs7QUFBQSxBQUtELE1BQU0sQ0FBQyxTQUFTLEdBQUc7QUFDakIsTUFBSSxDQUFDLEdBQUc7QUFBRSxXQUFPLElBQUksQ0FBQyxFQUFFLENBQUM7R0FBRTtBQUMzQixNQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFBRSxRQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7R0FBRTtBQUNoRCxNQUFJLENBQUMsR0FBRztBQUFFLFdBQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQztHQUFFO0FBQzNCLE1BQUksQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUFFLFFBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztHQUFFO0FBQ2hELE1BQUksQ0FBQyxHQUFHO0FBQUUsV0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDO0dBQUU7QUFDM0IsTUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQUUsUUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0dBQUU7QUFDaEQsT0FBSyxFQUFFLFVBQVUsU0FBUyxFQUFFO0FBQzFCLFNBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFO0FBQ3pELFVBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFHLElBQUksQ0FBQyxDQUFDLEVBQUMsU0FBUyxDQUFDLEVBQUU7QUFDOUQsY0FBTTtPQUNQO0tBQ0Y7R0FDRjtBQUNELFFBQU0sRUFBRSxVQUFVLFVBQVUsRUFBRTtBQUM1QixRQUFJLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFO0FBQzVCLFVBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFO0FBQ3RCLFlBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO09BQ2I7S0FDRjs7QUFFRCxRQUFJLFVBQVUsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFO0FBQzdCLFVBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFO0FBQ3ZCLFlBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO09BQ2I7S0FDRjs7QUFFRCxRQUFJLFVBQVUsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFO0FBQzFCLFVBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFO0FBQ3JCLFlBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO09BQ2I7S0FDRjs7QUFFRCxRQUFJLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFO0FBQzVCLFVBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFO0FBQ3hCLFlBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO09BQ2I7S0FDRjs7QUFHRCxRQUFJLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFO0FBQ3pCLGdCQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7QUFDOUIsVUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQzNCOztBQUVELFFBQUksVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUU7QUFDekIsZ0JBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztBQUM5QixVQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDM0I7R0FDRjtBQUNELEtBQUcsRUFBRSxZQUFZO0FBQ2YsUUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0FBQzFCLE9BQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNyQyxRQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQ1o7O0NBRUYsQ0FBQTs7O0FDckxELFlBQVksQ0FBQzs7Ozs7UUFNRyxhQUFhLEdBQWIsYUFBYTtRQWNiLFNBQVMsR0FBVCxTQUFTOzs7O0lBbkJiLEdBQUc7Ozs7Ozs7O0FBS1IsU0FBUyxhQUFhLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRTtBQUN6QyxNQUFJLEtBQUssRUFBRTtBQUNULFFBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0dBQ3BCLE1BQU07QUFDTCxRQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztHQUNwQjtBQUNELE1BQUksSUFBSSxFQUFFO0FBQ1IsUUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7R0FDbEIsTUFBTTtBQUNMLFFBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUM7R0FDbkM7Q0FDRjs7O0FBQUEsQUFHTSxTQUFTLFNBQVMsQ0FBQyxLQUFLLEVBQUU7QUFDL0IsTUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDN0MsTUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDN0MsTUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDakQsTUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDakQsTUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUM7QUFDbEMsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRTtBQUM3QixRQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUMvQyxRQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUMvQyxRQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNuRCxRQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztHQUNwRDs7OztBQUFBLEFBS0QsTUFBSSxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQy9DLE1BQUksS0FBSyxHQUFHLENBQUMsQ0FBQztBQUNkLFNBQU8sS0FBSyxJQUFJLEdBQUcsQ0FBQyxhQUFhLEVBQUM7QUFDaEMsU0FBSyxJQUFJLENBQUMsQ0FBQztHQUNaO0FBQ0QsTUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ2YsU0FBTyxNQUFNLElBQUksR0FBRyxDQUFDLGNBQWMsRUFBQztBQUNsQyxVQUFNLElBQUksQ0FBQyxDQUFDO0dBQ2I7O0FBRUQsTUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQzFCLE1BQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUM1QixNQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3hDLE1BQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM5QyxNQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDO0FBQzdDLE1BQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQztBQUN4RCxNQUFJLENBQUMsUUFBUSxHQUFHLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUMsU0FBUyxFQUFDLEdBQUcsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFDLFNBQVMsRUFBQyxJQUFJLEVBQUMsT0FBTyxFQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUMsQ0FBQzs7QUFBQyxBQUU1SSxNQUFJLENBQUMsUUFBUSxHQUFHLElBQUksS0FBSyxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDdkQsTUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDekQsTUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUMzQixNQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLGFBQWEsQ0FBQSxHQUFJLENBQUMsQ0FBQztBQUN2RCxNQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUksRUFBRyxNQUFNLEdBQUcsR0FBRyxDQUFDLGNBQWMsQ0FBQSxBQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzVELE1BQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDNUUsTUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7QUFDcEIsTUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLOzs7QUFBQyxBQUduQixNQUFJLENBQUMsR0FBRyxDQUFDLHVCQUF1QixHQUFHLEtBQUssQ0FBQztBQUN6QyxNQUFJLENBQUMsR0FBRyxDQUFDLHFCQUFxQixHQUFHLEtBQUs7O0FBQUMsQUFFdkMsTUFBSSxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsR0FBRyxLQUFLLENBQUM7O0FBRTFDLE1BQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNYLE9BQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQ3RCOztBQUVELFNBQVMsQ0FBQyxTQUFTLEdBQUc7QUFDcEIsYUFBVyxFQUFDLFNBQVM7O0FBRXJCLEtBQUcsRUFBRSxZQUFZO0FBQ2YsU0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxJQUFJLEVBQUUsRUFBRSxDQUFDLEVBQUU7QUFDNUQsVUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM5QixVQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25DLFVBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkMsVUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFNUMsV0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxJQUFJLEVBQUUsRUFBRSxDQUFDLEVBQUU7QUFDL0QsWUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUNmLGlCQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSTs7O0FBQUMsT0FHckI7S0FDRjtBQUNELFFBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLGFBQWEsRUFBRSxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7R0FDakU7OztBQUdELE9BQUssRUFBRSxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRTtBQUNyQyxRQUFJLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlCLFFBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDOUIsUUFBSSxDQUFDLFNBQVMsRUFBRTtBQUNkLGVBQVMsR0FBRyxDQUFDLENBQUM7S0FDZjtBQUNELFNBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFO0FBQ25DLFVBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUIsVUFBSSxDQUFDLElBQUksR0FBRyxFQUFFO0FBQ1osVUFBRSxDQUFDLENBQUM7QUFDSixZQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRTs7QUFFL0IsY0FBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkUsY0FBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZELGNBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZFLGNBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2RCxZQUFFLENBQUMsQ0FBQztBQUNKLGNBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO0FBQ3JDLGVBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLEVBQUUsRUFBRSxDQUFDLEVBQUU7QUFDN0IsZ0JBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQzdCLGdCQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztXQUM5QjtTQUNGO0FBQ0QsWUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUIsWUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUIsU0FBQyxHQUFHLENBQUMsQ0FBQztPQUNQLE1BQU07QUFDTCxZQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ1osWUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQztBQUNwQixVQUFFLENBQUMsQ0FBQztPQUNMO0tBQ0Y7R0FDRjs7QUFFRCxRQUFNLEVBQUUsWUFBWTtBQUNsQixRQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO0FBQ25CLFFBQUksQ0FBQyxVQUFVLEdBQUcsQUFBQyxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsR0FBSSxHQUFHLENBQUM7O0FBRTlDLFFBQUksVUFBVSxHQUFHLEtBQUssQ0FBQztBQUN2QixRQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTtBQUNwQixVQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUN6QixnQkFBVSxHQUFHLElBQUksQ0FBQztLQUNuQjtBQUNELFFBQUksTUFBTSxHQUFHLEtBQUs7Ozs7QUFBQyxBQUluQixTQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsSUFBSSxHQUFHLENBQUMsZ0JBQWdCLEVBQUU7QUFDNUUsVUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM5QixVQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25DLFVBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkMsVUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1QyxXQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsSUFBSSxHQUFHLENBQUMsZ0JBQWdCLEVBQUU7QUFDM0UsWUFBSSxhQUFhLEdBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEFBQUMsQ0FBQztBQUN6RCxZQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLGNBQWMsQ0FBQyxDQUFDLENBQUMsSUFBSyxhQUFhLElBQUksVUFBVSxBQUFDLEVBQUU7QUFDakcsZ0JBQU0sR0FBRyxJQUFJLENBQUM7O0FBRWQsbUJBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkIsd0JBQWMsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakMsY0FBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ1YsY0FBSSxDQUFDLGFBQWEsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO0FBQ2hDLGFBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO1dBQ3BCO0FBQ0QsY0FBSSxJQUFJLEdBQUcsQUFBQyxDQUFDLElBQUksQ0FBQyxJQUFLLENBQUMsQ0FBQztBQUN6QixjQUFJLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUEsSUFBSyxDQUFDLENBQUM7QUFDMUIsYUFBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNsRSxjQUFJLElBQUksR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQztBQUNwRSxjQUFJLENBQUMsRUFBRTtBQUNMLGVBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLFNBQVMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztXQUN6SDtTQUNGO09BQ0Y7S0FDRjtBQUNELFFBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQztHQUNuQztDQUNGLENBQUE7Ozs7QUN4S0QsWUFBWSxDQUFDOzs7OztRQUVHLElBQUksR0FBSixJQUFJO1FBU0osS0FBSyxHQUFMLEtBQUs7UUErRUwsU0FBUyxHQUFULFNBQVM7QUF4RmxCLFNBQVMsSUFBSSxDQUFDLElBQUksRUFBQyxRQUFRLEVBQUU7QUFDbEMsTUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLElBQUksS0FBSyxDQUFDO0FBQ2xDLE1BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLE1BQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0NBQ2hCOztBQUVNLElBQUksUUFBUSxXQUFSLFFBQVEsR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUM7OztBQUFDLEFBRzlCLFNBQVMsS0FBSyxHQUFHO0FBQ3RCLE1BQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUIsTUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7QUFDdEIsTUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7Q0FDM0I7O0FBR0QsS0FBSyxDQUFDLFNBQVMsR0FBRzs7QUFFaEIsYUFBVyxFQUFFLFVBQVUsS0FBSyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7QUFDNUMsUUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ2pDLEtBQUMsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQ2hCLFFBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3RCLFFBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0dBQ3RCOztBQUVELFVBQVEsRUFBRSxVQUFVLElBQUksRUFBRSxRQUFRLEVBQUU7QUFDbEMsUUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ2pDLFNBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRTtBQUMxQyxVQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksUUFBUSxFQUFFO0FBQzdCLFlBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2xCLFNBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ1osZUFBTyxDQUFDLENBQUM7T0FDVjtLQUNGO0FBQ0QsS0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztBQUM1QixRQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2xDLFFBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0FBQ3JCLFdBQU8sQ0FBQyxDQUFDO0dBQ1Y7O0FBRUQsVUFBUSxFQUFFLFlBQVk7QUFDcEIsV0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0dBQ25COztBQUVELE9BQUssRUFBRSxZQUFZO0FBQ2pCLFFBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztHQUN2Qjs7QUFFRCxXQUFTLEVBQUUsWUFBWTtBQUNyQixRQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDakIsVUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQzlCLFlBQUcsQ0FBQyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ3JDLFlBQUksQ0FBQyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDdkMsZUFBTyxDQUFDLENBQUM7T0FDVixDQUFDOztBQUFDLEFBRUgsV0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUU7QUFDakQsWUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO09BQ3pCO0FBQ0YsVUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7S0FDdEI7R0FDRjtBQUNELFlBQVUsRUFBRSxVQUFVLEtBQUssRUFBRTtBQUMzQixRQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLFFBQVEsQ0FBQztBQUM3QixRQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztHQUMxQjtBQUNELFVBQVEsRUFBRSxZQUFZO0FBQ3BCLFFBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFO0FBQ3RCLGFBQU87S0FDUjtBQUNELFFBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNkLFFBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDckIsUUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO0FBQ2xCLFNBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUU7QUFDOUMsVUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2YsVUFBSSxDQUFDLElBQUksUUFBUSxFQUFFO0FBQ2pCLFNBQUMsQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDO0FBQ3BCLFlBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDYixpQkFBUyxFQUFFLENBQUM7T0FDYjtLQUNGO0FBQ0QsUUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDbEIsUUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7R0FDM0I7Q0FDRjs7O0FBQUMsQUFJSyxTQUFTLFNBQVMsQ0FBQyxjQUFjLEVBQUU7QUFDeEMsTUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7QUFDckIsTUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7QUFDckIsTUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7QUFDbkIsTUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQ3hCLE1BQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFDO0NBQ3RDOztBQUVELFNBQVMsQ0FBQyxTQUFTLEdBQUc7QUFDcEIsT0FBSyxFQUFFLFlBQVk7QUFDakIsUUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7QUFDckIsUUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7QUFDbkIsUUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDekMsUUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0dBQzFCO0FBQ0QsUUFBTSxFQUFFLFlBQVk7QUFDbEIsUUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQ3BDLFFBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsR0FBRyxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztBQUMvRCxRQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7R0FDMUI7QUFDRCxPQUFLLEVBQUUsWUFBWTtBQUNqQixRQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUN2QyxRQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7R0FDMUI7QUFDRCxNQUFJLEVBQUUsWUFBWTtBQUNoQixRQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7R0FDekI7QUFDRCxRQUFNLEVBQUUsWUFBWTtBQUNsQixRQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRSxPQUFPO0FBQ3RDLFFBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUNwQyxRQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO0FBQzVDLFFBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO0FBQ3JELFFBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDO0dBQzVCO0FBQ0QsTUFBSSxFQUFFLENBQUM7QUFDUCxPQUFLLEVBQUUsQ0FBQztBQUNSLE9BQUssRUFBRSxDQUFDO0NBQ1QsQ0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiZ3JhcGhpY3MuanNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiaW8uanNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwic29uZy5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJ0ZXh0LmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInV0aWwuanNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiZHNwLmpzXCIgLz5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbi8vLy8gV2ViIEF1ZGlvIEFQSSDjg6njg4Pjg5Hjg7zjgq/jg6njgrkgLy8vL1xyXG52YXIgZmZ0ID0gbmV3IEZGVCg0MDk2LCA0NDEwMCk7XHJcbnZhciBCVUZGRVJfU0laRSA9IDEwMjQ7XHJcbnZhciBUSU1FX0JBU0UgPSA5NjtcclxuXHJcbnZhciBub3RlRnJlcSA9IFtdO1xyXG5mb3IgKHZhciBpID0gLTgxOyBpIDwgNDY7ICsraSkge1xyXG4gIG5vdGVGcmVxLnB1c2goTWF0aC5wb3coMiwgaSAvIDEyKSk7XHJcbn1cclxuXHJcbnZhciBTcXVhcmVXYXZlID0ge1xyXG4gIGJpdHM6IDQsXHJcbiAgd2F2ZWRhdGE6IFsweGYsIDB4ZiwgMHhmLCAweGYsIDB4ZiwgMHhmLCAweGYsIDB4ZiwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF1cclxufTsvLyA0Yml0IHdhdmUgZm9ybVxyXG5cclxudmFyIFNhd1dhdmUgPSB7XHJcbiAgYml0czogNCxcclxuICB3YXZlZGF0YTogWzB4MCwgMHgxLCAweDIsIDB4MywgMHg0LCAweDUsIDB4NiwgMHg3LCAweDgsIDB4OSwgMHhhLCAweGIsIDB4YywgMHhkLCAweGUsIDB4Zl1cclxufTsvLyA0Yml0IHdhdmUgZm9ybVxyXG5cclxudmFyIFRyaVdhdmUgPSB7XHJcbiAgYml0czogNCxcclxuICB3YXZlZGF0YTogWzB4MCwgMHgyLCAweDQsIDB4NiwgMHg4LCAweEEsIDB4QywgMHhFLCAweEYsIDB4RSwgMHhDLCAweEEsIDB4OCwgMHg2LCAweDQsIDB4Ml1cclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBkZWNvZGVTdHIoYml0cywgd2F2ZXN0cikge1xyXG4gIHZhciBhcnIgPSBbXTtcclxuICB2YXIgbiA9IGJpdHMgLyA0IHwgMDtcclxuICB2YXIgYyA9IDA7XHJcbiAgdmFyIHplcm9wb3MgPSAxIDw8IChiaXRzIC0gMSk7XHJcbiAgd2hpbGUgKGMgPCB3YXZlc3RyLmxlbmd0aCkge1xyXG4gICAgdmFyIGQgPSAwO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyArK2kpIHtcclxuICAgICAgZXZhbChcImQgPSAoZCA8PCA0KSArIDB4XCIgKyB3YXZlc3RyLmNoYXJBdChjKyspICsgXCI7XCIpO1xyXG4gICAgfVxyXG4gICAgYXJyLnB1c2goKGQgLSB6ZXJvcG9zKSAvIHplcm9wb3MpO1xyXG4gIH1cclxuICByZXR1cm4gYXJyO1xyXG59XHJcblxyXG52YXIgd2F2ZXMgPSBbXHJcbiAgICBkZWNvZGVTdHIoNCwgJ0VFRUVFRUVFRUVFRUVFRUUwMDAwMDAwMDAwMDAwMDAwJyksXHJcbiAgICBkZWNvZGVTdHIoNCwgJzAwMTEyMjMzNDQ1NTY2Nzc4ODk5QUFCQkNDRERFRUZGJyksXHJcbiAgICBkZWNvZGVTdHIoNCwgJzAyMzQ2NjQ1OUFBOEE3QTk3Nzk2NTY1NkFDQUFDREVGJyksXHJcbiAgICBkZWNvZGVTdHIoNCwgJ0JEQ0RDQTk5OUFDRENEQjk0MjEyMzY3Nzc2MzIxMjQ3JyksXHJcbiAgICBkZWNvZGVTdHIoNCwgJzdBQ0RFRENBNzQyMTAxMjQ3QkRFREI3MzIwMTM3RTc4JyksXHJcbiAgICBkZWNvZGVTdHIoNCwgJ0FDQ0E3NzlCREVEQTY2Njc5OTk0MTAxMjY3NzQyMjQ3JyksXHJcbiAgICBkZWNvZGVTdHIoNCwgJzdFQzlDRUE3Q0ZEOEFCNzI4RDk0NTcyMDM4NTEzNTMxJyksXHJcbiAgICBkZWNvZGVTdHIoNCwgJ0VFNzdFRTc3RUU3N0VFNzcwMDc3MDA3NzAwNzcwMDc3JyksXHJcbiAgICBkZWNvZGVTdHIoNCwgJ0VFRUU4ODg4ODg4ODg4ODgwMDAwODg4ODg4ODg4ODg4JykvL+ODjuOCpOOCuueUqOOBruODgOODn+ODvOazouW9olxyXG5dO1xyXG5cclxudmFyIHdhdmVTYW1wbGVzID0gW107XHJcbmV4cG9ydCBmdW5jdGlvbiBXYXZlU2FtcGxlKGF1ZGlvY3R4LCBjaCwgc2FtcGxlTGVuZ3RoLCBzYW1wbGVSYXRlKSB7XHJcblxyXG4gIHRoaXMuc2FtcGxlID0gYXVkaW9jdHguY3JlYXRlQnVmZmVyKGNoLCBzYW1wbGVMZW5ndGgsIHNhbXBsZVJhdGUgfHwgYXVkaW9jdHguc2FtcGxlUmF0ZSk7XHJcbiAgdGhpcy5sb29wID0gZmFsc2U7XHJcbiAgdGhpcy5zdGFydCA9IDA7XHJcbiAgdGhpcy5lbmQgPSAoc2FtcGxlTGVuZ3RoIC0gMSkgLyAoc2FtcGxlUmF0ZSB8fCBhdWRpb2N0eC5zYW1wbGVSYXRlKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVdhdmVTYW1wbGVGcm9tV2F2ZXMoYXVkaW9jdHgsIHNhbXBsZUxlbmd0aCkge1xyXG4gIGZvciAodmFyIGkgPSAwLCBlbmQgPSB3YXZlcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgdmFyIHNhbXBsZSA9IG5ldyBXYXZlU2FtcGxlKGF1ZGlvY3R4LCAxLCBzYW1wbGVMZW5ndGgpO1xyXG4gICAgd2F2ZVNhbXBsZXMucHVzaChzYW1wbGUpO1xyXG4gICAgaWYgKGkgIT0gOCkge1xyXG4gICAgICB2YXIgd2F2ZWRhdGEgPSB3YXZlc1tpXTtcclxuICAgICAgdmFyIGRlbHRhID0gNDQwLjAgKiB3YXZlZGF0YS5sZW5ndGggLyBhdWRpb2N0eC5zYW1wbGVSYXRlO1xyXG4gICAgICB2YXIgc3RpbWUgPSAwO1xyXG4gICAgICB2YXIgb3V0cHV0ID0gc2FtcGxlLnNhbXBsZS5nZXRDaGFubmVsRGF0YSgwKTtcclxuICAgICAgdmFyIGxlbiA9IHdhdmVkYXRhLmxlbmd0aDtcclxuICAgICAgdmFyIGluZGV4ID0gMDtcclxuICAgICAgdmFyIGVuZHNhbXBsZSA9IDA7XHJcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgc2FtcGxlTGVuZ3RoOyArK2opIHtcclxuICAgICAgICBpbmRleCA9IHN0aW1lIHwgMDtcclxuICAgICAgICBvdXRwdXRbal0gPSB3YXZlZGF0YVtpbmRleF07XHJcbiAgICAgICAgc3RpbWUgKz0gZGVsdGE7XHJcbiAgICAgICAgaWYgKHN0aW1lID49IGxlbikge1xyXG4gICAgICAgICAgc3RpbWUgPSBzdGltZSAtIGxlbjtcclxuICAgICAgICAgIGVuZHNhbXBsZSA9IGo7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHNhbXBsZS5lbmQgPSBlbmRzYW1wbGUgLyBhdWRpb2N0eC5zYW1wbGVSYXRlO1xyXG4gICAgICBzYW1wbGUubG9vcCA9IHRydWU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyDjg5zjgqTjgrk444Gv44OO44Kk44K65rOi5b2i44Go44GZ44KLXHJcbiAgICAgIHZhciBvdXRwdXQgPSBzYW1wbGUuc2FtcGxlLmdldENoYW5uZWxEYXRhKDApO1xyXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHNhbXBsZUxlbmd0aDsgKytqKSB7XHJcbiAgICAgICAgb3V0cHV0W2pdID0gTWF0aC5yYW5kb20oKSAqIDIuMCAtIDEuMDtcclxuICAgICAgfVxyXG4gICAgICBzYW1wbGUuZW5kID0gc2FtcGxlTGVuZ3RoIC8gYXVkaW9jdHguc2FtcGxlUmF0ZTtcclxuICAgICAgc2FtcGxlLmxvb3AgPSB0cnVlO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIFdhdmVUZXh0dXJlKHdhdmUpIHtcclxuICB0aGlzLndhdmUgPSB3YXZlIHx8IHdhdmVzWzBdO1xyXG4gIHRoaXMudGV4ID0gbmV3IENhbnZhc1RleHR1cmUoMzIwLCAxMCAqIDE2KTtcclxuICB0aGlzLnJlbmRlcigpO1xyXG59XHJcblxyXG5XYXZlVGV4dHVyZS5wcm90b3R5cGUgPSB7XHJcbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgY3R4ID0gdGhpcy50ZXguY3R4O1xyXG4gICAgdmFyIHdhdmUgPSB0aGlzLndhdmU7XHJcbiAgICBjdHguY2xlYXJSZWN0KDAsIDAsIGN0eC5jYW52YXMud2lkdGgsIGN0eC5jYW52YXMuaGVpZ2h0KTtcclxuICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9ICd3aGl0ZSc7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDMyMDsgaSArPSAxMCkge1xyXG4gICAgICBjdHgubW92ZVRvKGksIDApO1xyXG4gICAgICBjdHgubGluZVRvKGksIDI1NSk7XHJcbiAgICB9XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDE2MDsgaSArPSAxMCkge1xyXG4gICAgICBjdHgubW92ZVRvKDAsIGkpO1xyXG4gICAgICBjdHgubGluZVRvKDMyMCwgaSk7XHJcbiAgICB9XHJcbiAgICBjdHguZmlsbFN0eWxlID0gJ3JnYmEoMjU1LDI1NSwyNTUsMC43KSc7XHJcbiAgICBjdHgucmVjdCgwLCAwLCBjdHguY2FudmFzLndpZHRoLCBjdHguY2FudmFzLmhlaWdodCk7XHJcbiAgICBjdHguc3Ryb2tlKCk7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgYyA9IDA7IGkgPCBjdHguY2FudmFzLndpZHRoOyBpICs9IDEwLCArK2MpIHtcclxuICAgICAgY3R4LmZpbGxSZWN0KGksICh3YXZlW2NdID4gMCkgPyA4MCAtIHdhdmVbY10gKiA4MCA6IDgwLCAxMCwgTWF0aC5hYnMod2F2ZVtjXSkgKiA4MCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnRleC50ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICB9XHJcbn07XHJcblxyXG4vLy8g44Ko44Oz44OZ44Ot44O844OX44K444Kn44ON44Os44O844K/44O8XHJcbmV4cG9ydCBmdW5jdGlvbiBFbnZlbG9wZUdlbmVyYXRvcih2b2ljZSwgYXR0YWNrLCBkZWNheSwgc3VzdGFpbiwgcmVsZWFzZSkge1xyXG4gIHRoaXMudm9pY2UgPSB2b2ljZTtcclxuICAvL3RoaXMua2V5b24gPSBmYWxzZTtcclxuICB0aGlzLmF0dGFjayA9IGF0dGFjayB8fCAwLjAwMDU7XHJcbiAgdGhpcy5kZWNheSA9IGRlY2F5IHx8IDAuMDU7XHJcbiAgdGhpcy5zdXN0YWluID0gc3VzdGFpbiB8fCAwLjU7XHJcbiAgdGhpcy5yZWxlYXNlID0gcmVsZWFzZSB8fCAwLjU7XHJcbiAgdGhpcy52ID0gMS4wO1xyXG5cclxufTtcclxuXHJcbkVudmVsb3BlR2VuZXJhdG9yLnByb3RvdHlwZSA9XHJcbntcclxuICBrZXlvbjogZnVuY3Rpb24gKHQsdmVsKSB7XHJcbiAgICB0aGlzLnYgPSB2ZWwgfHwgMS4wO1xyXG4gICAgdmFyIHYgPSB0aGlzLnY7XHJcbiAgICB2YXIgdDAgPSB0IHx8IHRoaXMudm9pY2UuYXVkaW9jdHguY3VycmVudFRpbWU7XHJcbiAgICB2YXIgdDEgPSB0MCArIHRoaXMuYXR0YWNrICogdjtcclxuICAgIHZhciBnYWluID0gdGhpcy52b2ljZS5nYWluLmdhaW47XHJcbiAgICBnYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyh0MCk7XHJcbiAgICBnYWluLnNldFZhbHVlQXRUaW1lKDAsIHQwKTtcclxuICAgIGdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUodiwgdDEpO1xyXG4gICAgZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSh0aGlzLnN1c3RhaW4gKiB2LCB0MCArIHRoaXMuZGVjYXkgLyB2KTtcclxuICAgIC8vZ2Fpbi5zZXRUYXJnZXRBdFRpbWUodGhpcy5zdXN0YWluICogdiwgdDEsIHQxICsgdGhpcy5kZWNheSAvIHYpO1xyXG4gIH0sXHJcbiAga2V5b2ZmOiBmdW5jdGlvbiAodCkge1xyXG4gICAgdmFyIHZvaWNlID0gdGhpcy52b2ljZTtcclxuICAgIHZhciBnYWluID0gdm9pY2UuZ2Fpbi5nYWluO1xyXG4gICAgdmFyIHQwID0gdCB8fCB2b2ljZS5hdWRpb2N0eC5jdXJyZW50VGltZTtcclxuICAgIGdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKHQwKTtcclxuICAgIC8vZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLCB0MCArIHRoaXMucmVsZWFzZSAvIHRoaXMudik7XHJcbiAgICAvL2dhaW4uc2V0VGFyZ2V0QXRUaW1lKDAsIHQwLCB0MCArIHRoaXMucmVsZWFzZSAvIHRoaXMudik7XHJcbiAgICBnYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIHQwICsgdGhpcy5yZWxlYXNlIC8gdGhpcy52KTtcclxuICB9XHJcbn07XHJcblxyXG4vLy8g44Oc44Kk44K5XHJcbmV4cG9ydCBmdW5jdGlvbiBWb2ljZShhdWRpb2N0eCkge1xyXG4gIHRoaXMuYXVkaW9jdHggPSBhdWRpb2N0eDtcclxuICB0aGlzLnNhbXBsZSA9IHdhdmVTYW1wbGVzWzZdO1xyXG4gIHRoaXMuZ2FpbiA9IGF1ZGlvY3R4LmNyZWF0ZUdhaW4oKTtcclxuICB0aGlzLmdhaW4uZ2Fpbi52YWx1ZSA9IDAuMDtcclxuICB0aGlzLnZvbHVtZSA9IGF1ZGlvY3R4LmNyZWF0ZUdhaW4oKTtcclxuICB0aGlzLmVudmVsb3BlID0gbmV3IEVudmVsb3BlR2VuZXJhdG9yKHRoaXMpO1xyXG4gIHRoaXMuaW5pdFByb2Nlc3NvcigpO1xyXG4gIHRoaXMuZGV0dW5lID0gMS4wO1xyXG4gIHRoaXMudm9sdW1lLmdhaW4udmFsdWUgPSAxLjA7XHJcbiAgdGhpcy5nYWluLmNvbm5lY3QodGhpcy52b2x1bWUpO1xyXG4gIHRoaXMub3V0cHV0ID0gdGhpcy52b2x1bWU7XHJcbn07XHJcblxyXG5Wb2ljZS5wcm90b3R5cGUgPSB7XHJcbiAgaW5pdFByb2Nlc3NvcjogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5wcm9jZXNzb3IgPSB0aGlzLmF1ZGlvY3R4LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xyXG4gICAgdGhpcy5wcm9jZXNzb3IuYnVmZmVyID0gdGhpcy5zYW1wbGUuc2FtcGxlO1xyXG4gICAgdGhpcy5wcm9jZXNzb3IubG9vcCA9IHRoaXMuc2FtcGxlLmxvb3A7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5sb29wU3RhcnQgPSAwO1xyXG4gICAgdGhpcy5wcm9jZXNzb3IucGxheWJhY2tSYXRlLnZhbHVlID0gMS4wO1xyXG4gICAgdGhpcy5wcm9jZXNzb3IubG9vcEVuZCA9IHRoaXMuc2FtcGxlLmVuZDtcclxuICAgIHRoaXMucHJvY2Vzc29yLmNvbm5lY3QodGhpcy5nYWluKTtcclxuICB9LFxyXG5cclxuICBzZXRTYW1wbGU6IGZ1bmN0aW9uIChzYW1wbGUpIHtcclxuICAgICAgdGhpcy5lbnZlbG9wZS5rZXlvZmYoMCk7XHJcbiAgICAgIHRoaXMucHJvY2Vzc29yLmRpc2Nvbm5lY3QodGhpcy5nYWluKTtcclxuICAgICAgdGhpcy5zYW1wbGUgPSBzYW1wbGU7XHJcbiAgICAgIHRoaXMuaW5pdFByb2Nlc3NvcigpO1xyXG4gICAgICB0aGlzLnByb2Nlc3Nvci5zdGFydCgpO1xyXG4gIH0sXHJcbiAgc3RhcnQ6IGZ1bmN0aW9uIChzdGFydFRpbWUpIHtcclxuIC8vICAgaWYgKHRoaXMucHJvY2Vzc29yLnBsYXliYWNrU3RhdGUgPT0gMykge1xyXG4gICAgICB0aGlzLnByb2Nlc3Nvci5kaXNjb25uZWN0KHRoaXMuZ2Fpbik7XHJcbiAgICAgIHRoaXMuaW5pdFByb2Nlc3NvcigpO1xyXG4vLyAgICB9IGVsc2Uge1xyXG4vLyAgICAgIHRoaXMuZW52ZWxvcGUua2V5b2ZmKCk7XHJcbi8vXHJcbi8vICAgIH1cclxuICAgIHRoaXMucHJvY2Vzc29yLnN0YXJ0KHN0YXJ0VGltZSk7XHJcbiAgfSxcclxuICBzdG9wOiBmdW5jdGlvbiAodGltZSkge1xyXG4gICAgdGhpcy5wcm9jZXNzb3Iuc3RvcCh0aW1lKTtcclxuICAgIHRoaXMucmVzZXQoKTtcclxuICB9LFxyXG4gIGtleW9uOmZ1bmN0aW9uKHQsbm90ZSx2ZWwpXHJcbiAge1xyXG4gICAgdGhpcy5wcm9jZXNzb3IucGxheWJhY2tSYXRlLnNldFZhbHVlQXRUaW1lKG5vdGVGcmVxW25vdGVdICogdGhpcy5kZXR1bmUsIHQpO1xyXG4gICAgdGhpcy5lbnZlbG9wZS5rZXlvbih0LHZlbCk7XHJcbiAgfSxcclxuICBrZXlvZmY6ZnVuY3Rpb24odClcclxuICB7XHJcbiAgICB0aGlzLmVudmVsb3BlLmtleW9mZih0KTtcclxuICB9LFxyXG4gIHJlc2V0OmZ1bmN0aW9uKClcclxuICB7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5wbGF5YmFja1JhdGUuY2FuY2VsU2NoZWR1bGVkVmFsdWVzKDApO1xyXG4gICAgdGhpcy5nYWluLmdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKDApO1xyXG4gICAgdGhpcy5nYWluLmdhaW4udmFsdWUgPSAwO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIEF1ZGlvKCkge1xyXG4gIHRoaXMuZW5hYmxlID0gZmFsc2U7XHJcbiAgdGhpcy5hdWRpb0NvbnRleHQgPSB3aW5kb3cuQXVkaW9Db250ZXh0IHx8IHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQgfHwgd2luZG93Lm1vekF1ZGlvQ29udGV4dDtcclxuXHJcbiAgaWYgKHRoaXMuYXVkaW9Db250ZXh0KSB7XHJcbiAgICB0aGlzLmF1ZGlvY3R4ID0gbmV3IHRoaXMuYXVkaW9Db250ZXh0KCk7XHJcbiAgICB0aGlzLmVuYWJsZSA9IHRydWU7XHJcbiAgfVxyXG5cclxuICB0aGlzLnZvaWNlcyA9IFtdO1xyXG4gIGlmICh0aGlzLmVuYWJsZSkge1xyXG4gICAgY3JlYXRlV2F2ZVNhbXBsZUZyb21XYXZlcyh0aGlzLmF1ZGlvY3R4LCBCVUZGRVJfU0laRSk7XHJcbiAgICB0aGlzLmZpbHRlciA9IHRoaXMuYXVkaW9jdHguY3JlYXRlQmlxdWFkRmlsdGVyKCk7XHJcbiAgICB0aGlzLmZpbHRlci50eXBlID0gJ2xvd3Bhc3MnO1xyXG4gICAgdGhpcy5maWx0ZXIuZnJlcXVlbmN5LnZhbHVlID0gMjAwMDA7XHJcbiAgICB0aGlzLmZpbHRlci5RLnZhbHVlID0gMC4wMDAxO1xyXG4gICAgdGhpcy5ub2lzZUZpbHRlciA9IHRoaXMuYXVkaW9jdHguY3JlYXRlQmlxdWFkRmlsdGVyKCk7XHJcbiAgICB0aGlzLm5vaXNlRmlsdGVyLnR5cGUgPSAnbG93cGFzcyc7XHJcbiAgICB0aGlzLm5vaXNlRmlsdGVyLmZyZXF1ZW5jeS52YWx1ZSA9IDEwMDA7XHJcbiAgICB0aGlzLm5vaXNlRmlsdGVyLlEudmFsdWUgPSAxLjg7XHJcbiAgICB0aGlzLmNvbXAgPSB0aGlzLmF1ZGlvY3R4LmNyZWF0ZUR5bmFtaWNzQ29tcHJlc3NvcigpO1xyXG4gICAgdGhpcy5maWx0ZXIuY29ubmVjdCh0aGlzLmNvbXApO1xyXG4gICAgdGhpcy5ub2lzZUZpbHRlci5jb25uZWN0KHRoaXMuY29tcCk7XHJcbiAgICB0aGlzLmNvbXAuY29ubmVjdCh0aGlzLmF1ZGlvY3R4LmRlc3RpbmF0aW9uKTtcclxuICAgIGZvciAodmFyIGkgPSAwLGVuZCA9IHRoaXMuVk9JQ0VTOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgdmFyIHYgPSBuZXcgVm9pY2UodGhpcy5hdWRpb2N0eCk7XHJcbiAgICAgIHRoaXMudm9pY2VzLnB1c2godik7XHJcbiAgICAgIGlmKGkgPT0gKHRoaXMuVk9JQ0VTIC0gMSkpe1xyXG4gICAgICAgIHYub3V0cHV0LmNvbm5lY3QodGhpcy5ub2lzZUZpbHRlcik7XHJcbiAgICAgIH0gZWxzZXtcclxuICAgICAgICB2Lm91dHB1dC5jb25uZWN0KHRoaXMuZmlsdGVyKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4vLyAgdGhpcy5zdGFydGVkID0gZmFsc2U7XHJcblxyXG4gICAgLy90aGlzLnZvaWNlc1swXS5vdXRwdXQuY29ubmVjdCgpO1xyXG4gIH1cclxuXHJcbn1cclxuXHJcbkF1ZGlvLnByb3RvdHlwZSA9IHtcclxuICBzdGFydDogZnVuY3Rpb24gKClcclxuICB7XHJcbiAgLy8gIGlmICh0aGlzLnN0YXJ0ZWQpIHJldHVybjtcclxuXHJcbiAgICB2YXIgdm9pY2VzID0gdGhpcy52b2ljZXM7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gdm9pY2VzLmxlbmd0aDsgaSA8IGVuZDsgKytpKVxyXG4gICAge1xyXG4gICAgICB2b2ljZXNbaV0uc3RhcnQoMCk7XHJcbiAgICB9XHJcbiAgICAvL3RoaXMuc3RhcnRlZCA9IHRydWU7XHJcbiAgfSxcclxuICBzdG9wOiBmdW5jdGlvbiAoKVxyXG4gIHtcclxuICAgIC8vaWYodGhpcy5zdGFydGVkKVxyXG4gICAgLy97XHJcbiAgICAgIHZhciB2b2ljZXMgPSB0aGlzLnZvaWNlcztcclxuICAgICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHZvaWNlcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSlcclxuICAgICAge1xyXG4gICAgICAgIHZvaWNlc1tpXS5zdG9wKDApO1xyXG4gICAgICB9XHJcbiAgICAvLyAgdGhpcy5zdGFydGVkID0gZmFsc2U7XHJcbiAgICAvL31cclxuICB9LFxyXG4gIFZPSUNFUzogMTJcclxufVxyXG5cclxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcbi8qIOOCt+ODvOOCseODs+OCteODvOOCs+ODnuODs+ODiSAgICAgICAgICAgICAgICAgICAgICAgKi9cclxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gTm90ZShubywgbmFtZSkge1xyXG4gIHRoaXMubm8gPSBubztcclxuICB0aGlzLm5hbWUgPSBuYW1lO1xyXG59XHJcblxyXG5Ob3RlLnByb3RvdHlwZSA9IHtcclxuICBwcm9jZXNzOiBmdW5jdGlvbih0cmFjaykgXHJcbiAge1xyXG4gICAgdmFyIGJhY2sgPSB0cmFjay5iYWNrO1xyXG4gICAgdmFyIG5vdGUgPSB0aGlzO1xyXG4gICAgdmFyIG9jdCA9IHRoaXMub2N0IHx8IGJhY2sub2N0O1xyXG4gICAgdmFyIHN0ZXAgPSB0aGlzLnN0ZXAgfHwgYmFjay5zdGVwO1xyXG4gICAgdmFyIGdhdGUgPSB0aGlzLmdhdGUgfHwgYmFjay5nYXRlO1xyXG4gICAgdmFyIHZlbCA9IHRoaXMudmVsIHx8IGJhY2sudmVsO1xyXG4gICAgc2V0UXVldWUodHJhY2ssIG5vdGUsIG9jdCxzdGVwLCBnYXRlLCB2ZWwpO1xyXG5cclxuICB9XHJcbn1cclxuXHJcbnZhciBcclxuICBDICA9IG5ldyBOb3RlKCAwLCdDICcpLFxyXG4gIERiID0gbmV3IE5vdGUoIDEsJ0RiJyksXHJcbiAgRCAgPSBuZXcgTm90ZSggMiwnRCAnKSxcclxuICBFYiA9IG5ldyBOb3RlKCAzLCdFYicpLFxyXG4gIEUgID0gbmV3IE5vdGUoIDQsJ0UgJyksXHJcbiAgRiAgPSBuZXcgTm90ZSggNSwnRiAnKSxcclxuICBHYiA9IG5ldyBOb3RlKCA2LCdHYicpLFxyXG4gIEcgID0gbmV3IE5vdGUoIDcsJ0cgJyksXHJcbiAgQWIgPSBuZXcgTm90ZSggOCwnQWInKSxcclxuICBBICA9IG5ldyBOb3RlKCA5LCdBICcpLFxyXG4gIEJiID0gbmV3IE5vdGUoMTAsJ0JiJyksXHJcbiAgQiA9IG5ldyBOb3RlKDExLCAnQiAnKTtcclxuXHJcbiAvLyBSID0gbmV3IFJlc3QoKTtcclxuXHJcbmZ1bmN0aW9uIFNlcURhdGEobm90ZSwgb2N0LCBzdGVwLCBnYXRlLCB2ZWwpXHJcbntcclxuICB0aGlzLm5vdGUgPSBub3RlO1xyXG4gIHRoaXMub2N0ID0gb2N0O1xyXG4gIC8vdGhpcy5ubyA9IG5vdGUubm8gKyBvY3QgKiAxMjtcclxuICB0aGlzLnN0ZXAgPSBzdGVwO1xyXG4gIHRoaXMuZ2F0ZSA9IGdhdGU7XHJcbiAgdGhpcy52ZWwgPSB2ZWw7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNldFF1ZXVlKHRyYWNrLG5vdGUsb2N0LHN0ZXAsZ2F0ZSx2ZWwpXHJcbntcclxuICB2YXIgbm8gPSBub3RlLm5vICsgb2N0ICogMTI7XHJcbiAgdmFyIHN0ZXBfdGltZSA9IHRyYWNrLnBsYXlpbmdUaW1lO1xyXG4gIHZhciBnYXRlX3RpbWUgPSAoKGdhdGUgPj0gMCkgPyBnYXRlICogNjAgOiBzdGVwICogZ2F0ZSAqIDYwICogLTEuMCkgLyAoVElNRV9CQVNFICogdHJhY2subG9jYWxUZW1wbykgKyB0cmFjay5wbGF5aW5nVGltZTtcclxuICB2YXIgdm9pY2UgPSB0cmFjay5hdWRpby52b2ljZXNbdHJhY2suY2hhbm5lbF07XHJcbiAgLy9jb25zb2xlLmxvZyh0cmFjay5zZXF1ZW5jZXIudGVtcG8pO1xyXG4gIHZvaWNlLmtleW9uKHN0ZXBfdGltZSwgbm8sIHZlbCk7XHJcbiAgdm9pY2Uua2V5b2ZmKGdhdGVfdGltZSk7XHJcbiAgdHJhY2sucGxheWluZ1RpbWUgPSAoc3RlcCAqIDYwKSAvIChUSU1FX0JBU0UgKiB0cmFjay5sb2NhbFRlbXBvKSArIHRyYWNrLnBsYXlpbmdUaW1lO1xyXG4gIHZhciBiYWNrID0gdHJhY2suYmFjaztcclxuICBiYWNrLm5vdGUgPSBub3RlO1xyXG4gIGJhY2sub2N0ID0gb2N0O1xyXG4gIGJhY2suc3RlcCA9IHN0ZXA7XHJcbiAgYmFjay5nYXRlID0gZ2F0ZTtcclxuICBiYWNrLnZlbCA9IHZlbDtcclxufVxyXG5cclxuU2VxRGF0YS5wcm90b3R5cGUgPSB7XHJcbiAgcHJvY2VzczogZnVuY3Rpb24gKHRyYWNrKSB7XHJcblxyXG4gICAgdmFyIGJhY2sgPSB0cmFjay5iYWNrO1xyXG4gICAgdmFyIG5vdGUgPSB0aGlzLm5vdGUgfHwgYmFjay5ub3RlO1xyXG4gICAgdmFyIG9jdCA9IHRoaXMub2N0IHx8IGJhY2sub2N0O1xyXG4gICAgdmFyIHN0ZXAgPSB0aGlzLnN0ZXAgfHwgYmFjay5zdGVwO1xyXG4gICAgdmFyIGdhdGUgPSB0aGlzLmdhdGUgfHwgYmFjay5nYXRlO1xyXG4gICAgdmFyIHZlbCA9IHRoaXMudmVsIHx8IGJhY2sudmVsO1xyXG4gICAgc2V0UXVldWUodHJhY2ssbm90ZSxvY3Qsc3RlcCxnYXRlLHZlbCk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBTKG5vdGUsIG9jdCwgc3RlcCwgZ2F0ZSwgdmVsKSB7XHJcbiAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xyXG4gIGlmIChTLmxlbmd0aCAhPSBhcmdzLmxlbmd0aClcclxuICB7XHJcbiAgICBpZih0eXBlb2YoYXJnc1thcmdzLmxlbmd0aCAtIDFdKSA9PSAnb2JqZWN0JyAmJiAgIShhcmdzW2FyZ3MubGVuZ3RoIC0gMV0gaW5zdGFuY2VvZiBOb3RlKSlcclxuICAgIHtcclxuICAgICAgdmFyIGFyZ3MxID0gYXJnc1thcmdzLmxlbmd0aCAtIDFdO1xyXG4gICAgICB2YXIgbCA9IGFyZ3MubGVuZ3RoIC0gMTtcclxuICAgICAgcmV0dXJuIG5ldyBTZXFEYXRhKFxyXG4gICAgICAoKGwgIT0gMCk/bm90ZTpmYWxzZSkgfHwgYXJnczEubm90ZSB8fCBhcmdzMS5uIHx8IG51bGwsXHJcbiAgICAgICgobCAhPSAxKSA/IG9jdCA6IGZhbHNlKSB8fCBhcmdzMS5vY3QgfHwgYXJnczEubyB8fCBudWxsLFxyXG4gICAgICAoKGwgIT0gMikgPyBzdGVwIDogZmFsc2UpIHx8IGFyZ3MxLnN0ZXAgfHwgYXJnczEucyB8fCBudWxsLFxyXG4gICAgICAoKGwgIT0gMykgPyBnYXRlIDogZmFsc2UpIHx8IGFyZ3MxLmdhdGUgfHwgYXJnczEuZyB8fCBudWxsLFxyXG4gICAgICAoKGwgIT0gNCkgPyB2ZWwgOiBmYWxzZSkgfHwgYXJnczEudmVsIHx8IGFyZ3MxLnYgfHwgbnVsbFxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gbmV3IFNlcURhdGEobm90ZSB8fCBudWxsLCBvY3QgfHwgbnVsbCwgc3RlcCB8fCBudWxsLCBnYXRlIHx8IG51bGwsIHZlbCB8fCBudWxsKTtcclxufVxyXG5cclxuZnVuY3Rpb24gUzEobm90ZSwgb2N0LCBzdGVwLCBnYXRlLCB2ZWwpIHtcclxuICByZXR1cm4gUyhub3RlLCBvY3QsIGwoc3RlcCksIGdhdGUsIHZlbCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFMyKG5vdGUsIGxlbiwgZG90ICwgb2N0LCBnYXRlLCB2ZWwpIHtcclxuICByZXR1cm4gUyhub3RlLCBvY3QsIGwobGVuLGRvdCksIGdhdGUsIHZlbCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFMzKG5vdGUsIHN0ZXAsIGdhdGUsIHZlbCwgb2N0KSB7XHJcbiAgcmV0dXJuIFMobm90ZSwgb2N0LCBzdGVwLCBnYXRlLCB2ZWwpO1xyXG59XHJcblxyXG5cclxuLy8vIOmfs+espuOBrumVt+OBleaMh+WumlxyXG5cclxuZnVuY3Rpb24gbChsZW4sZG90KVxyXG57XHJcbiAgdmFyIGQgPSBmYWxzZTtcclxuICBpZiAoZG90KSBkID0gZG90O1xyXG4gIHJldHVybiAoVElNRV9CQVNFICogKDQgKyAoZD8yOjApKSkgLyBsZW47XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFN0ZXAoc3RlcCkge1xyXG4gIHRoaXMuc3RlcCA9IHN0ZXA7XHJcbn1cclxuXHJcblN0ZXAucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbiAodHJhY2spXHJcbntcclxuICB0cmFjay5iYWNrLnN0ZXAgPSB0aGlzLnN0ZXA7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFNUKHN0ZXApXHJcbntcclxuICByZXR1cm4gbmV3IFN0ZXAoc3RlcCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIEwobGVuLCBkb3QpIHtcclxuICByZXR1cm4gbmV3IFN0ZXAobChsZW4sIGRvdCkpO1xyXG59XHJcblxyXG4vLy8g44Ky44O844OI44K/44Kk44Og5oyH5a6aXHJcblxyXG5mdW5jdGlvbiBHYXRlVGltZShnYXRlKSB7XHJcbiAgdGhpcy5nYXRlID0gZ2F0ZTtcclxufVxyXG5cclxuR2F0ZVRpbWUucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbiAodHJhY2spIHtcclxuICB0cmFjay5iYWNrLmdhdGUgPSB0aGlzLmdhdGU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIEdUKGdhdGUpIHtcclxuICByZXR1cm4gbmV3IEdhdGVUaW1lKGdhdGUpO1xyXG59XHJcblxyXG4vLy8g44OZ44Ot44K344OG44Kj5oyH5a6aXHJcblxyXG5mdW5jdGlvbiBWZWxvY2l0eSh2ZWwpIHtcclxuICB0aGlzLnZlbCA9IHZlbDtcclxufVxyXG5cclxuVmVsb2NpdHkucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbiAodHJhY2spIHtcclxuICB0cmFjay5iYWNrLnZlbCA9IHRoaXMudmVsO1xyXG59XHJcblxyXG5mdW5jdGlvbiBWKHZlbCkge1xyXG4gIHJldHVybiBuZXcgVmVsb2NpdHkodmVsKTtcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIEp1bXAocG9zKSB7IHRoaXMucG9zID0gcG9zO307XHJcbkp1bXAucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbiAodHJhY2spXHJcbntcclxuICB0cmFjay5zZXFQb3MgPSB0aGlzLnBvcztcclxufVxyXG5cclxuLy8vIOmfs+iJsuioreWumlxyXG5mdW5jdGlvbiBUb25lKG5vKVxyXG57XHJcbiAgdGhpcy5ubyA9IG5vO1xyXG4gIC8vdGhpcy5zYW1wbGUgPSB3YXZlU2FtcGxlc1t0aGlzLm5vXTtcclxufVxyXG5cclxuVG9uZS5wcm90b3R5cGUgPVxyXG57XHJcbiAgcHJvY2VzczogZnVuY3Rpb24gKHRyYWNrKVxyXG4gIHtcclxuICAgIHRyYWNrLmF1ZGlvLnZvaWNlc1t0cmFjay5jaGFubmVsXS5zZXRTYW1wbGUod2F2ZVNhbXBsZXNbdGhpcy5ub10pO1xyXG4gIH1cclxufVxyXG5mdW5jdGlvbiBUT05FKG5vKVxyXG57XHJcbiAgcmV0dXJuIG5ldyBUb25lKG5vKTtcclxufVxyXG5cclxuZnVuY3Rpb24gSlVNUChwb3MpIHtcclxuICByZXR1cm4gbmV3IEp1bXAocG9zKTtcclxufVxyXG5cclxuZnVuY3Rpb24gUmVzdChzdGVwKVxyXG57XHJcbiAgdGhpcy5zdGVwID0gc3RlcDtcclxufVxyXG5cclxuUmVzdC5wcm90b3R5cGUucHJvY2VzcyA9IGZ1bmN0aW9uKHRyYWNrKVxyXG57XHJcbiAgdmFyIHN0ZXAgPSB0aGlzLnN0ZXAgfHwgdHJhY2suYmFjay5zdGVwO1xyXG4gIHRyYWNrLnBsYXlpbmdUaW1lID0gdHJhY2sucGxheWluZ1RpbWUgKyAodGhpcy5zdGVwICogNjApIC8gKFRJTUVfQkFTRSAqIHRyYWNrLmxvY2FsVGVtcG8pO1xyXG4gIHRyYWNrLmJhY2suc3RlcCA9IHRoaXMuc3RlcDtcclxufVxyXG5cclxuZnVuY3Rpb24gUjEoc3RlcCkge1xyXG4gIHJldHVybiBuZXcgUmVzdChzdGVwKTtcclxufVxyXG5mdW5jdGlvbiBSKGxlbixkb3QpIHtcclxuICByZXR1cm4gbmV3IFJlc3QobChsZW4sZG90KSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIE9jdGF2ZShvY3QpIHtcclxuICB0aGlzLm9jdCA9IG9jdDtcclxufVxyXG5PY3RhdmUucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbih0cmFjaylcclxue1xyXG4gIHRyYWNrLmJhY2sub2N0ID0gdGhpcy5vY3Q7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIE8ob2N0KSB7XHJcbiAgcmV0dXJuIG5ldyBPY3RhdmUob2N0KTtcclxufVxyXG5cclxuZnVuY3Rpb24gT2N0YXZlVXAodikgeyB0aGlzLnYgPSB2OyB9O1xyXG5PY3RhdmVVcC5wcm90b3R5cGUucHJvY2VzcyA9IGZ1bmN0aW9uKHRyYWNrKSB7XHJcbiAgdHJhY2suYmFjay5vY3QgKz0gdGhpcy52O1xyXG59XHJcblxyXG52YXIgT1UgPSBuZXcgT2N0YXZlVXAoMSk7XHJcbnZhciBPRCA9IG5ldyBPY3RhdmVVcCgtMSk7XHJcblxyXG5mdW5jdGlvbiBUZW1wbyh0ZW1wbylcclxue1xyXG4gIHRoaXMudGVtcG8gPSB0ZW1wbztcclxufVxyXG5cclxuVGVtcG8ucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbih0cmFjaylcclxue1xyXG4gIHRyYWNrLmxvY2FsVGVtcG8gPSB0aGlzLnRlbXBvO1xyXG4gIC8vdHJhY2suc2VxdWVuY2VyLnRlbXBvID0gdGhpcy50ZW1wbztcclxufVxyXG5cclxuZnVuY3Rpb24gVEVNUE8odGVtcG8pXHJcbntcclxuICByZXR1cm4gbmV3IFRlbXBvKHRlbXBvKTtcclxufVxyXG5cclxuZnVuY3Rpb24gRW52ZWxvcGUoYXR0YWNrLCBkZWNheSwgc3VzdGFpbiwgcmVsZWFzZSlcclxue1xyXG4gIHRoaXMuYXR0YWNrID0gYXR0YWNrO1xyXG4gIHRoaXMuZGVjYXkgPSBkZWNheTtcclxuICB0aGlzLnN1c3RhaW4gPSBzdXN0YWluO1xyXG4gIHRoaXMucmVsZWFzZSA9IHJlbGVhc2U7XHJcbn1cclxuXHJcbkVudmVsb3BlLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24odHJhY2spXHJcbntcclxuICB2YXIgZW52ZWxvcGUgPSB0cmFjay5hdWRpby52b2ljZXNbdHJhY2suY2hhbm5lbF0uZW52ZWxvcGU7XHJcbiAgZW52ZWxvcGUuYXR0YWNrID0gdGhpcy5hdHRhY2s7XHJcbiAgZW52ZWxvcGUuZGVjYXkgPSB0aGlzLmRlY2F5O1xyXG4gIGVudmVsb3BlLnN1c3RhaW4gPSB0aGlzLnN1c3RhaW47XHJcbiAgZW52ZWxvcGUucmVsZWFzZSA9IHRoaXMucmVsZWFzZTtcclxufVxyXG5cclxuZnVuY3Rpb24gRU5WKGF0dGFjayxkZWNheSxzdXN0YWluICxyZWxlYXNlKVxyXG57XHJcbiAgcmV0dXJuIG5ldyBFbnZlbG9wZShhdHRhY2ssIGRlY2F5LCBzdXN0YWluLCByZWxlYXNlKTtcclxufVxyXG5cclxuLy8vIOODh+ODgeODpeODvOODs1xyXG5mdW5jdGlvbiBEZXR1bmUoZGV0dW5lKVxyXG57XHJcbiAgdGhpcy5kZXR1bmUgPSBkZXR1bmU7XHJcbn1cclxuXHJcbkRldHVuZS5wcm90b3R5cGUucHJvY2VzcyA9IGZ1bmN0aW9uKHRyYWNrKVxyXG57XHJcbiAgdmFyIHZvaWNlID0gdHJhY2suYXVkaW8udm9pY2VzW3RyYWNrLmNoYW5uZWxdO1xyXG4gIHZvaWNlLmRldHVuZSA9IHRoaXMuZGV0dW5lO1xyXG59XHJcblxyXG5mdW5jdGlvbiBERVRVTkUoZGV0dW5lKVxyXG57XHJcbiAgcmV0dXJuIG5ldyBEZXR1bmUoZGV0dW5lKTtcclxufVxyXG5cclxuZnVuY3Rpb24gVm9sdW1lKHZvbHVtZSlcclxue1xyXG4gIHRoaXMudm9sdW1lID0gdm9sdW1lO1xyXG59XHJcblxyXG5Wb2x1bWUucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbih0cmFjaylcclxue1xyXG4gIHRyYWNrLmF1ZGlvLnZvaWNlc1t0cmFjay5jaGFubmVsXS52b2x1bWUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSh0aGlzLnZvbHVtZSwgdHJhY2sucGxheWluZ1RpbWUpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBWT0xVTUUodm9sdW1lKVxyXG57XHJcbiAgcmV0dXJuIG5ldyBWb2x1bWUodm9sdW1lKTtcclxufVxyXG5cclxuZnVuY3Rpb24gTG9vcERhdGEob2JqLHZhcm5hbWUsIGNvdW50LHNlcVBvcylcclxue1xyXG4gIHRoaXMudmFybmFtZSA9IHZhcm5hbWU7XHJcbiAgdGhpcy5jb3VudCA9IGNvdW50O1xyXG4gIHRoaXMub2JqID0gb2JqO1xyXG4gIHRoaXMuc2VxUG9zID0gc2VxUG9zO1xyXG59XHJcblxyXG5mdW5jdGlvbiBMb29wKHZhcm5hbWUsIGNvdW50KSB7XHJcbiAgdGhpcy5sb29wRGF0YSA9IG5ldyBMb29wRGF0YSh0aGlzLHZhcm5hbWUsY291bnQsMCk7XHJcbn1cclxuXHJcbkxvb3AucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbiAodHJhY2spXHJcbntcclxuICB2YXIgc3RhY2sgPSB0cmFjay5zdGFjaztcclxuICBpZiAoc3RhY2subGVuZ3RoID09IDAgfHwgc3RhY2tbc3RhY2subGVuZ3RoIC0gMV0ub2JqICE9PSB0aGlzKVxyXG4gIHtcclxuICAgIHZhciBsZCA9IHRoaXMubG9vcERhdGE7XHJcbiAgICBzdGFjay5wdXNoKG5ldyBMb29wRGF0YSh0aGlzLCBsZC52YXJuYW1lLCBsZC5jb3VudCwgdHJhY2suc2VxUG9zKSk7XHJcbiAgfSBcclxufVxyXG5cclxuZnVuY3Rpb24gTE9PUCh2YXJuYW1lLCBjb3VudCkge1xyXG4gIHJldHVybiBuZXcgTG9vcCh2YXJuYW1lLGNvdW50KTtcclxufVxyXG5cclxuZnVuY3Rpb24gTG9vcEVuZCgpXHJcbntcclxufVxyXG5cclxuTG9vcEVuZC5wcm90b3R5cGUucHJvY2VzcyA9IGZ1bmN0aW9uKHRyYWNrKVxyXG57XHJcbiAgdmFyIGxkID0gdHJhY2suc3RhY2tbdHJhY2suc3RhY2subGVuZ3RoIC0gMV07XHJcbiAgbGQuY291bnQtLTtcclxuICBpZiAobGQuY291bnQgPiAwKSB7XHJcbiAgICB0cmFjay5zZXFQb3MgPSBsZC5zZXFQb3M7XHJcbiAgfSBlbHNlIHtcclxuICAgIHRyYWNrLnN0YWNrLnBvcCgpO1xyXG4gIH1cclxufVxyXG5cclxudmFyIExPT1BfRU5EID0gbmV3IExvb3BFbmQoKTtcclxuXHJcbi8vLyDjgrfjg7zjgrHjg7PjgrXjg7zjg4jjg6njg4Pjgq9cclxuZnVuY3Rpb24gVHJhY2soc2VxdWVuY2VyLHNlcWRhdGEsYXVkaW8pXHJcbntcclxuICB0aGlzLm5hbWUgPSAnJztcclxuICB0aGlzLmVuZCA9IGZhbHNlO1xyXG4gIHRoaXMub25lc2hvdCA9IGZhbHNlO1xyXG4gIHRoaXMuc2VxdWVuY2VyID0gc2VxdWVuY2VyO1xyXG4gIHRoaXMuc2VxRGF0YSA9IHNlcWRhdGE7XHJcbiAgdGhpcy5zZXFQb3MgPSAwO1xyXG4gIHRoaXMubXV0ZSA9IGZhbHNlO1xyXG4gIHRoaXMucGxheWluZ1RpbWUgPSAtMTtcclxuICB0aGlzLmxvY2FsVGVtcG8gPSBzZXF1ZW5jZXIudGVtcG87XHJcbiAgdGhpcy50cmFja1ZvbHVtZSA9IDEuMDtcclxuICB0aGlzLnRyYW5zcG9zZSA9IDA7XHJcbiAgdGhpcy5zb2xvID0gZmFsc2U7XHJcbiAgdGhpcy5jaGFubmVsID0gLTE7XHJcbiAgdGhpcy50cmFjayA9IC0xO1xyXG4gIHRoaXMuYXVkaW8gPSBhdWRpbztcclxuICB0aGlzLmJhY2sgPSB7XHJcbiAgICBub3RlOiA3MixcclxuICAgIG9jdDogNSxcclxuICAgIHN0ZXA6IDk2LFxyXG4gICAgZ2F0ZTogNDgsXHJcbiAgICB2ZWw6MS4wXHJcbiAgfVxyXG4gIHRoaXMuc3RhY2sgPSBbXTtcclxufVxyXG5cclxuVHJhY2sucHJvdG90eXBlID0ge1xyXG4gIHByb2Nlc3M6IGZ1bmN0aW9uIChjdXJyZW50VGltZSkge1xyXG5cclxuICAgIGlmICh0aGlzLmVuZCkgcmV0dXJuO1xyXG4gICAgXHJcbiAgICBpZiAodGhpcy5vbmVzaG90KSB7XHJcbiAgICAgIHRoaXMucmVzZXQoKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgc2VxU2l6ZSA9IHRoaXMuc2VxRGF0YS5sZW5ndGg7XHJcbiAgICBpZiAodGhpcy5zZXFQb3MgPj0gc2VxU2l6ZSkge1xyXG4gICAgICBpZih0aGlzLnNlcXVlbmNlci5yZXBlYXQpXHJcbiAgICAgIHtcclxuICAgICAgICB0aGlzLnNlcVBvcyA9IDA7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5lbmQgPSB0cnVlO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBzZXEgPSB0aGlzLnNlcURhdGE7XHJcbiAgICB0aGlzLnBsYXlpbmdUaW1lID0gKHRoaXMucGxheWluZ1RpbWUgPiAtMSkgPyB0aGlzLnBsYXlpbmdUaW1lIDogY3VycmVudFRpbWU7XHJcbiAgICB2YXIgZW5kVGltZSA9IGN1cnJlbnRUaW1lICsgMC4yLypzZWMqLztcclxuXHJcbiAgICB3aGlsZSAodGhpcy5zZXFQb3MgPCBzZXFTaXplKSB7XHJcbiAgICAgIGlmICh0aGlzLnBsYXlpbmdUaW1lID49IGVuZFRpbWUgJiYgIXRoaXMub25lc2hvdCkge1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHZhciBkID0gc2VxW3RoaXMuc2VxUG9zXTtcclxuICAgICAgICBkLnByb2Nlc3ModGhpcyk7XHJcbiAgICAgICAgdGhpcy5zZXFQb3MrKztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgcmVzZXQ6ZnVuY3Rpb24oKVxyXG4gIHtcclxuICAgIHZhciBjdXJWb2ljZSA9IHRoaXMuYXVkaW8udm9pY2VzW3RoaXMuY2hhbm5lbF07XHJcbiAgICBjdXJWb2ljZS5nYWluLmdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKDApO1xyXG4gICAgY3VyVm9pY2UucHJvY2Vzc29yLnBsYXliYWNrUmF0ZS5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoMCk7XHJcbiAgICBjdXJWb2ljZS5nYWluLmdhaW4udmFsdWUgPSAwO1xyXG4gICAgdGhpcy5wbGF5aW5nVGltZSA9IC0xO1xyXG4gICAgdGhpcy5zZXFQb3MgPSAwO1xyXG4gICAgdGhpcy5lbmQgPSBmYWxzZTtcclxuICB9XHJcblxyXG59XHJcblxyXG5mdW5jdGlvbiBsb2FkVHJhY2tzKHNlbGYsdHJhY2tzLCB0cmFja2RhdGEpXHJcbntcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRyYWNrZGF0YS5sZW5ndGg7ICsraSkge1xyXG4gICAgdmFyIHRyYWNrID0gbmV3IFRyYWNrKHNlbGYsIHRyYWNrZGF0YVtpXS5kYXRhLHNlbGYuYXVkaW8pO1xyXG4gICAgdHJhY2suY2hhbm5lbCA9IHRyYWNrZGF0YVtpXS5jaGFubmVsO1xyXG4gICAgdHJhY2sub25lc2hvdCA9ICghdHJhY2tkYXRhW2ldLm9uZXNob3QpP2ZhbHNlOnRydWU7XHJcbiAgICB0cmFjay50cmFjayA9IGk7XHJcbiAgICB0cmFja3MucHVzaCh0cmFjayk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVUcmFja3ModHJhY2tkYXRhKVxyXG57XHJcbiAgdmFyIHRyYWNrcyA9IFtdO1xyXG4gIGxvYWRUcmFja3ModGhpcyx0cmFja3MsIHRyYWNrZGF0YSk7XHJcbiAgcmV0dXJuIHRyYWNrcztcclxufVxyXG5cclxuLy8vIOOCt+ODvOOCseODs+OCteODvOacrOS9k1xyXG5leHBvcnQgZnVuY3Rpb24gU2VxdWVuY2VyKGF1ZGlvKSB7XHJcbiAgdGhpcy5hdWRpbyA9IGF1ZGlvO1xyXG4gIHRoaXMudGVtcG8gPSAxMDAuMDtcclxuICB0aGlzLnJlcGVhdCA9IGZhbHNlO1xyXG4gIHRoaXMucGxheSA9IGZhbHNlO1xyXG4gIHRoaXMudHJhY2tzID0gW107XHJcbiAgdGhpcy5wYXVzZVRpbWUgPSAwO1xyXG4gIHRoaXMuc3RhdHVzID0gdGhpcy5TVE9QO1xyXG59XHJcblxyXG5TZXF1ZW5jZXIucHJvdG90eXBlID0ge1xyXG4gIGxvYWQ6IGZ1bmN0aW9uKGRhdGEpXHJcbiAge1xyXG4gICAgaWYodGhpcy5wbGF5KSB7XHJcbiAgICAgIHRoaXMuc3RvcCgpO1xyXG4gICAgfVxyXG4gICAgdGhpcy50cmFja3MubGVuZ3RoID0gMDtcclxuICAgIGxvYWRUcmFja3ModGhpcyx0aGlzLnRyYWNrcywgZGF0YS50cmFja3MsdGhpcy5hdWRpbyk7XHJcbiAgfSxcclxuICBzdGFydDpmdW5jdGlvbigpXHJcbiAge1xyXG4gICAgLy8gICAgdGhpcy5oYW5kbGUgPSB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IHNlbGYucHJvY2VzcygpIH0sIDUwKTtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5QTEFZO1xyXG4gICAgdGhpcy5wcm9jZXNzKCk7XHJcbiAgfSxcclxuICBwcm9jZXNzOmZ1bmN0aW9uKClcclxuICB7XHJcbiAgICBpZiAodGhpcy5zdGF0dXMgPT0gdGhpcy5QTEFZKSB7XHJcbiAgICAgIHRoaXMucGxheVRyYWNrcyh0aGlzLnRyYWNrcyk7XHJcbiAgICAgIHRoaXMuaGFuZGxlID0gd2luZG93LnNldFRpbWVvdXQodGhpcy5wcm9jZXNzLmJpbmQodGhpcyksIDEwMCk7XHJcbiAgICB9XHJcbiAgfSxcclxuICBwbGF5VHJhY2tzOiBmdW5jdGlvbiAodHJhY2tzKXtcclxuICAgIHZhciBjdXJyZW50VGltZSA9IHRoaXMuYXVkaW8uYXVkaW9jdHguY3VycmVudFRpbWU7XHJcbiAvLyAgIGNvbnNvbGUubG9nKHRoaXMuYXVkaW8uYXVkaW9jdHguY3VycmVudFRpbWUpO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHRyYWNrcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgICB0cmFja3NbaV0ucHJvY2VzcyhjdXJyZW50VGltZSk7XHJcbiAgICB9XHJcbiAgfSxcclxuICBwYXVzZTpmdW5jdGlvbigpXHJcbiAge1xyXG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLlBBVVNFO1xyXG4gICAgdGhpcy5wYXVzZVRpbWUgPSB0aGlzLmF1ZGlvLmF1ZGlvY3R4LmN1cnJlbnRUaW1lO1xyXG4gIH0sXHJcbiAgcmVzdW1lOmZ1bmN0aW9uICgpXHJcbiAge1xyXG4gICAgaWYgKHRoaXMuc3RhdHVzID09IHRoaXMuUEFVU0UpIHtcclxuICAgICAgdGhpcy5zdGF0dXMgPSB0aGlzLlBMQVk7XHJcbiAgICAgIHZhciB0cmFja3MgPSB0aGlzLnRyYWNrcztcclxuICAgICAgdmFyIGFkanVzdCA9IHRoaXMuYXVkaW8uYXVkaW9jdHguY3VycmVudFRpbWUgLSB0aGlzLnBhdXNlVGltZTtcclxuICAgICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHRyYWNrcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgICAgIHRyYWNrc1tpXS5wbGF5aW5nVGltZSArPSBhZGp1c3Q7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5wcm9jZXNzKCk7XHJcbiAgICB9XHJcbiAgfSxcclxuICBzdG9wOiBmdW5jdGlvbiAoKVxyXG4gIHtcclxuICAgIGlmICh0aGlzLnN0YXR1cyAhPSB0aGlzLlNUT1ApIHtcclxuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuaGFuZGxlKTtcclxuICAgICAgLy8gICAgY2xlYXJJbnRlcnZhbCh0aGlzLmhhbmRsZSk7XHJcbiAgICAgIHRoaXMuc3RhdHVzID0gdGhpcy5TVE9QO1xyXG4gICAgICB0aGlzLnJlc2V0KCk7XHJcbiAgICB9XHJcbiAgfSxcclxuICByZXNldDpmdW5jdGlvbigpXHJcbiAge1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHRoaXMudHJhY2tzLmxlbmd0aDsgaSA8IGVuZDsgKytpKVxyXG4gICAge1xyXG4gICAgICB0aGlzLnRyYWNrc1tpXS5yZXNldCgpO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgU1RPUDogMCB8IDAsXHJcbiAgUExBWTogMSB8IDAsXHJcbiAgUEFVU0U6MiB8IDBcclxufVxyXG5cclxuLy8vIOewoeaYk+mNteebpOOBruWun+ijhVxyXG5mdW5jdGlvbiBQaWFubyhhdWRpbykge1xyXG4gIHRoaXMuYXVkaW8gPSBhdWRpbztcclxuICB0aGlzLnRhYmxlID0gWzkwLCA4MywgODgsIDY4LCA2NywgODYsIDcxLCA2NiwgNzIsIDc4LCA3NCwgNzcsIDE4OF07XHJcbiAgdGhpcy5rZXlvbiA9IG5ldyBBcnJheSgxMyk7XHJcbn1cclxuXHJcblBpYW5vLnByb3RvdHlwZSA9IHtcclxuICBvbjogZnVuY3Rpb24gKGUpIHtcclxuICAgIHZhciBpbmRleCA9IHRoaXMudGFibGUuaW5kZXhPZihlLmtleUNvZGUsIDApO1xyXG4gICAgaWYgKGluZGV4ID09IC0xKSB7XHJcbiAgICAgIGlmIChlLmtleUNvZGUgPiA0OCAmJiBlLmtleUNvZGUgPCA1Nykge1xyXG4gICAgICAgIHZhciB0aW1icmUgPSBlLmtleUNvZGUgLSA0OTtcclxuICAgICAgICB0aGlzLmF1ZGlvLnZvaWNlc1s3XS5zZXRTYW1wbGUod2F2ZVNhbXBsZXNbdGltYnJlXSk7XHJcbiAgICAgICAgd2F2ZUdyYXBoLndhdmUgPSB3YXZlc1t0aW1icmVdO1xyXG4gICAgICAgIHdhdmVHcmFwaC5yZW5kZXIoKTtcclxuICAgICAgICB0ZXh0UGxhbmUucHJpbnQoNSwgMTAsIFwiV2F2ZSBcIiArICh0aW1icmUgKyAxKSk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvL2F1ZGlvLnZvaWNlc1swXS5wcm9jZXNzb3IucGxheWJhY2tSYXRlLnZhbHVlID0gc2VxdWVuY2VyLm5vdGVGcmVxW107XHJcbiAgICAgIGlmICghdGhpcy5rZXlvbltpbmRleF0pIHtcclxuICAgICAgICB0aGlzLmF1ZGlvLnZvaWNlc1s3XS5rZXlvbigwLGluZGV4ICsgKGUuc2hpZnRLZXkgPyA4NCA6IDcyKSwxLjApO1xyXG4gICAgICAgIHRoaXMua2V5b25baW5kZXhdID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gIH0sXHJcbiAgb2ZmOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgdmFyIGluZGV4ID0gdGhpcy50YWJsZS5pbmRleE9mKGUua2V5Q29kZSwgMCk7XHJcbiAgICBpZiAoaW5kZXggPT0gLTEpIHtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAodGhpcy5rZXlvbltpbmRleF0pIHtcclxuICAgICAgICBhdWRpby52b2ljZXNbN10uZW52ZWxvcGUua2V5b2ZmKDApO1xyXG4gICAgICAgIHRoaXMua2V5b25baW5kZXhdID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IHZhciBzZXFEYXRhID0ge1xyXG4gIG5hbWU6ICdUZXN0JyxcclxuICB0cmFja3M6IFtcclxuICAgIHtcclxuICAgICAgbmFtZTogJ3BhcnQxJyxcclxuICAgICAgY2hhbm5lbDogMCxcclxuICAgICAgZGF0YTpcclxuICAgICAgW1xyXG4gICAgICAgIEVOVigwLjAxLCAwLjAyLCAwLjUsIDAuMDcpLFxyXG4gICAgICAgIFRFTVBPKDE4MCksIFRPTkUoMCksIFZPTFVNRSgwLjUpLCBMKDgpLCBHVCgtMC41KSxPKDQpLFxyXG4gICAgICAgIExPT1AoJ2knLDQpLFxyXG4gICAgICAgIEMsIEMsIEMsIEMsIEMsIEMsIEMsIEMsXHJcbiAgICAgICAgTE9PUF9FTkQsXHJcbiAgICAgICAgSlVNUCg1KVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBuYW1lOiAncGFydDInLFxyXG4gICAgICBjaGFubmVsOiAxLFxyXG4gICAgICBkYXRhOlxyXG4gICAgICAgIFtcclxuICAgICAgICBFTlYoMC4wMSwgMC4wNSwgMC42LCAwLjA3KSxcclxuICAgICAgICBURU1QTygxODApLFRPTkUoNiksIFZPTFVNRSgwLjIpLCBMKDgpLCBHVCgtMC44KSxcclxuICAgICAgICBSKDEpLCBSKDEpLFxyXG4gICAgICAgIE8oNiksTCgxKSwgRixcclxuICAgICAgICBFLFxyXG4gICAgICAgIE9ELCBMKDgsIHRydWUpLCBCYiwgRywgTCg0KSwgQmIsIE9VLCBMKDQpLCBGLCBMKDgpLCBELFxyXG4gICAgICAgIEwoNCwgdHJ1ZSksIEUsIEwoMiksIEMsUig4KSxcclxuICAgICAgICBKVU1QKDgpXHJcbiAgICAgICAgXVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgbmFtZTogJ3BhcnQzJyxcclxuICAgICAgY2hhbm5lbDogMixcclxuICAgICAgZGF0YTpcclxuICAgICAgICBbXHJcbiAgICAgICAgRU5WKDAuMDEsIDAuMDUsIDAuNiwgMC4wNyksXHJcbiAgICAgICAgVEVNUE8oMTgwKSxUT05FKDYpLCBWT0xVTUUoMC4xKSwgTCg4KSwgR1QoLTAuNSksIFxyXG4gICAgICAgIFIoMSksIFIoMSksXHJcbiAgICAgICAgTyg2KSxMKDEpLCBDLEMsXHJcbiAgICAgICAgT0QsIEwoOCwgdHJ1ZSksIEcsIEQsIEwoNCksIEcsIE9VLCBMKDQpLCBELCBMKDgpLE9ELCBHLFxyXG4gICAgICAgIEwoNCwgdHJ1ZSksIE9VLEMsIEwoMiksT0QsIEcsIFIoOCksXHJcbiAgICAgICAgSlVNUCg3KVxyXG4gICAgICAgIF1cclxuICAgIH1cclxuICBdXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBTb3VuZEVmZmVjdHMoc2VxdWVuY2VyKSB7XHJcbiAgIHRoaXMuc291bmRFZmZlY3RzID1cclxuICAgIFtcclxuICAgIC8vIEVmZmVjdCAwIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgY3JlYXRlVHJhY2tzLmNhbGwoc2VxdWVuY2VyLFtcclxuICAgIHtcclxuICAgICAgY2hhbm5lbDogOCxcclxuICAgICAgb25lc2hvdDp0cnVlLFxyXG4gICAgICBkYXRhOiBbVk9MVU1FKDAuNSksXHJcbiAgICAgICAgRU5WKDAuMDAwMSwgMC4wMSwgMS4wLCAwLjAwMDEpLEdUKC0wLjk5OSksVE9ORSgwKSwgVEVNUE8oMjAwKSwgTyg4KSxTVCgzKSwgQywgRCwgRSwgRiwgRywgQSwgQiwgT1UsIEMsIEQsIEUsIEcsIEEsIEIsQixCLEJcclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgY2hhbm5lbDogOSxcclxuICAgICAgb25lc2hvdDogdHJ1ZSxcclxuICAgICAgZGF0YTogW1ZPTFVNRSgwLjUpLFxyXG4gICAgICAgIEVOVigwLjAwMDEsIDAuMDEsIDEuMCwgMC4wMDAxKSwgREVUVU5FKDAuOSksIEdUKC0wLjk5OSksIFRPTkUoMCksIFRFTVBPKDIwMCksIE8oNSksIFNUKDMpLCBDLCBELCBFLCBGLCBHLCBBLCBCLCBPVSwgQywgRCwgRSwgRywgQSwgQixCLEIsQlxyXG4gICAgICBdXHJcbiAgICB9XHJcbiAgICBdKSxcclxuICAgIC8vIEVmZmVjdCAxIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgIGNyZWF0ZVRyYWNrcy5jYWxsKHNlcXVlbmNlcixcclxuICAgICAgW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIGNoYW5uZWw6IDEwLFxyXG4gICAgICAgICAgb25lc2hvdDogdHJ1ZSxcclxuICAgICAgICAgIGRhdGE6IFtcclxuICAgICAgICAgICBUT05FKDQpLCBURU1QTygxNTApLCBTVCg0KSwgR1QoLTAuOTk5OSksIEVOVigwLjAwMDEsIDAuMDAwMSwgMS4wLCAwLjAwMDEpLFxyXG4gICAgICAgICAgIE8oNiksIEcsIEEsIEIsIE8oNyksIEIsIEEsIEcsIEYsIEUsIEQsIEMsIEUsIEcsIEEsIEIsIE9ELCBCLCBBLCBHLCBGLCBFLCBELCBDLCBPRCwgQiwgQSwgRywgRiwgRSwgRCwgQ1xyXG4gICAgICAgICAgXVxyXG4gICAgICAgIH1cclxuICAgICAgXSksXHJcbiAgICAvLyBFZmZlY3QgMi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICBjcmVhdGVUcmFja3MuY2FsbChzZXF1ZW5jZXIsXHJcbiAgICAgIFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBjaGFubmVsOiAxMCxcclxuICAgICAgICAgIG9uZXNob3Q6IHRydWUsXHJcbiAgICAgICAgICBkYXRhOiBbXHJcbiAgICAgICAgICAgVE9ORSgwKSwgVEVNUE8oMTUwKSwgU1QoMiksIEdUKC0wLjk5OTkpLCBFTlYoMC4wMDAxLCAwLjAwMDEsIDEuMCwgMC4wMDAxKSxcclxuICAgICAgICAgICBPKDgpLCBDLEQsRSxGLEcsQSxCLE9VLEMsRCxFLEYsT0QsRyxPVSxBLE9ELEIsT1UsQSxPRCxHLE9VLEYsT0QsRSxPVSxFXHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgICBdKSxcclxuICAgICAgLy8gRWZmZWN0IDMgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICAgIGNyZWF0ZVRyYWNrcy5jYWxsKHNlcXVlbmNlcixcclxuICAgICAgICBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGNoYW5uZWw6IDEwLFxyXG4gICAgICAgICAgICBvbmVzaG90OiB0cnVlLFxyXG4gICAgICAgICAgICBkYXRhOiBbXHJcbiAgICAgICAgICAgICBUT05FKDUpLCBURU1QTygxNTApLCBMKDY0KSwgR1QoLTAuOTk5OSksIEVOVigwLjAwMDEsIDAuMDAwMSwgMS4wLCAwLjAwMDEpLFxyXG4gICAgICAgICAgICAgTyg2KSxDLE9ELEMsT1UsQyxPRCxDLE9VLEMsT0QsQyxPVSxDLE9EXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICAgIH1cclxuICAgICAgICBdKSxcclxuICAgICAgLy8gRWZmZWN0IDQgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgICBjcmVhdGVUcmFja3MuY2FsbChzZXF1ZW5jZXIsXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBjaGFubmVsOiAxMSxcclxuICAgICAgICAgICAgb25lc2hvdDogdHJ1ZSxcclxuICAgICAgICAgICAgZGF0YTogW1xyXG4gICAgICAgICAgICAgVE9ORSg4KSwgVk9MVU1FKDIuMCksVEVNUE8oMTIwKSwgTCgyKSwgR1QoLTAuOTk5OSksIEVOVigwLjAwMDEsIDAuMDAwMSwgMS4wLCAwLjI1KSxcclxuICAgICAgICAgICAgIE8oMSksIENcclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIF0pXHJcbiAgIF07XHJcbiB9XHJcblxyXG5cclxuXHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIENvbW0oKSB7XHJcbiAgdmFyIGhvc3QgPSB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUubWF0Y2goL2xvY2FsaG9zdC9pZyk/J2xvY2FsaG9zdCc6J3d3dy5zZnBnbXIubmV0JztcclxuICB0aGlzLmVuYWJsZSA9IGZhbHNlO1xyXG4gIHRyeSB7XHJcbiAgICB0aGlzLnNvY2tldCA9IGlvLmNvbm5lY3QoJ2h0dHA6Ly8nICsgaG9zdCArICc6ODA4MS90ZXN0Jyk7XHJcbiAgICB0aGlzLmVuYWJsZSA9IHRydWU7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICB0aGlzLnNvY2tldC5vbignc2VuZEhpZ2hTY29yZXMnLCAoZGF0YSk9PntcclxuICAgICAgaWYodGhpcy51cGRhdGVIaWdoU2NvcmVzKXtcclxuICAgICAgICB0aGlzLnVwZGF0ZUhpZ2hTY29yZXMoZGF0YSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgdGhpcy5zb2NrZXQub24oJ3NlbmRIaWdoU2NvcmUnLCAoZGF0YSk9PntcclxuICAgICAgdGhpcy51cGRhdGVIaWdoU2NvcmUoZGF0YSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLnNvY2tldC5vbignc2VuZFJhbmsnLCAoZGF0YSkgPT4ge1xyXG4gICAgICB0aGlzLnVwZGF0ZUhpZ2hTY29yZXMoZGF0YS5oaWdoU2NvcmVzKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuc29ja2V0Lm9uKCdlcnJvckNvbm5lY3Rpb25NYXgnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGFsZXJ0KCflkIzmmYLmjqXntprjga7kuIrpmZDjgavpgZTjgZfjgb7jgZfjgZ/jgIInKTtcclxuICAgICAgc2VsZi5lbmFibGUgPSBmYWxzZTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuc29ja2V0Lm9uKCdkaXNjb25uZWN0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICBpZiAoc2VsZi5lbmFibGUpIHtcclxuICAgICAgICBzZWxmLmVuYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIGFsZXJ0KCfjgrXjg7zjg5Djg7zmjqXntprjgYzliIfmlq3jgZXjgozjgb7jgZfjgZ/jgIInKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIGFsZXJ0KCdTb2NrZXQuSU/jgYzliKnnlKjjgafjgY3jgarjgYTjgZ/jgoHjgIHjg4/jgqTjgrnjgrPjgqLmg4XloLHjgYzlj5blvpfjgafjgY3jgb7jgZvjgpPjgIInICsgZSk7XHJcbiAgfVxyXG59XHJcblxyXG5Db21tLnByb3RvdHlwZSA9IHtcclxuICBzZW5kU2NvcmU6ZnVuY3Rpb24oc2NvcmUpXHJcbiAge1xyXG4gICAgaWYgKHRoaXMuZW5hYmxlKSB7XHJcbiAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ3NlbmRTY29yZScsIHNjb3JlKTtcclxuICAgIH1cclxuICB9LFxyXG4gIGRpc2Nvbm5lY3Q6ZnVuY3Rpb24oKVxyXG4gIHtcclxuICAgIGlmICh0aGlzLmVuYWJsZSkge1xyXG4gICAgICB0aGlzLmVuYWJsZSA9IGZhbHNlO1xyXG4gICAgICB0aGlzLnNvY2tldC5kaXNjb25uZWN0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgKiBhcyBzZmcgZnJvbSAnLi9nbG9iYWwnO1xyXG5pbXBvcnQgKiAgYXMgZ2FtZW9iaiBmcm9tICcuL2dhbWVvYmonO1xyXG5pbXBvcnQgKiBhcyBncmFwaGljcyBmcm9tICcuL2dyYXBoaWNzJztcclxuXHJcblxyXG4vLy8g54iG55m6XHJcbmV4cG9ydCBmdW5jdGlvbiBCb21iKHNjZW5lLHNlKSB7XHJcbiAgZ2FtZW9iai5HYW1lT2JqLmNhbGwodGhpcywgMCwgMCwgMCk7XHJcbiAgdmFyIHRleCA9IHNmZy50ZXh0dXJlRmlsZXMuYm9tYjtcclxuICB2YXIgbWF0ZXJpYWwgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVNYXRlcmlhbCh0ZXgpO1xyXG4gIG1hdGVyaWFsLmJsZW5kaW5nID0gVEhSRUUuQWRkaXRpdmVCbGVuZGluZztcclxuICBtYXRlcmlhbC5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgdmFyIGdlb21ldHJ5ID0gZ3JhcGhpY3MuY3JlYXRlU3ByaXRlR2VvbWV0cnkoMTYpO1xyXG4gIGdyYXBoaWNzLmNyZWF0ZVNwcml0ZVVWKGdlb21ldHJ5LCB0ZXgsIDE2LCAxNiwgMCk7XHJcbiAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueiA9IDAuMTtcclxuICB0aGlzLmluZGV4ID0gMDtcclxuICB0aGlzLm1lc2gudmlzaWJsZSA9IGZhbHNlO1xyXG4gIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuICB0aGlzLnNlID0gc2U7XHJcbiAgc2NlbmUuYWRkKHRoaXMubWVzaCk7XHJcbn1cclxuXHJcbkJvbWIucHJvdG90eXBlID0ge1xyXG4gIGdldCB4KCkgeyByZXR1cm4gdGhpcy54XzsgfSxcclxuICBzZXQgeCh2KSB7IHRoaXMueF8gPSB0aGlzLm1lc2gucG9zaXRpb24ueCA9IHY7IH0sXHJcbiAgZ2V0IHkoKSB7IHJldHVybiB0aGlzLnlfOyB9LFxyXG4gIHNldCB5KHYpIHsgdGhpcy55XyA9IHRoaXMubWVzaC5wb3NpdGlvbi55ID0gdjsgfSxcclxuICBnZXQgeigpIHsgcmV0dXJuIHRoaXMuel87IH0sXHJcbiAgc2V0IHoodikgeyB0aGlzLnpfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnogPSB2OyB9LFxyXG4gIHN0YXJ0OiBmdW5jdGlvbiAoeCwgeSwgeiwgZGVsYXkpIHtcclxuICAgIGlmICh0aGlzLmVuYWJsZV8pIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgdGhpcy5kZWxheSA9IGRlbGF5IHwgMDtcclxuICAgIHRoaXMueCA9IHg7XHJcbiAgICB0aGlzLnkgPSB5O1xyXG4gICAgdGhpcy56ID0geiB8IDAuMDAwMDI7XHJcbiAgICB0aGlzLmVuYWJsZV8gPSB0cnVlO1xyXG4gICAgdGhpcy5pbmRleCA9IDA7XHJcbiAgICBncmFwaGljcy51cGRhdGVTcHJpdGVVVih0aGlzLm1lc2guZ2VvbWV0cnksIHNmZy50ZXh0dXJlRmlsZXMuYm9tYiwgMTYsIDE2LCB0aGlzLmluZGV4KTtcclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgIHNmZy50YXNrcy5wdXNoVGFzayhmdW5jdGlvbiAoaSkgeyBzZWxmLm1vdmUoaSk7IH0pO1xyXG4gICAgdGhpcy5tZXNoLm1hdGVyaWFsLm9wYWNpdHkgPSAxLjA7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9LFxyXG4gIG1vdmU6IGZ1bmN0aW9uICh0YXNrSW5kZXgpIHtcclxuICAgIGlmICghdGhpcy5kZWxheSkge1xyXG4gICAgICB0aGlzLm1lc2gudmlzaWJsZSA9IHRydWU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmRlbGF5LS07XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHRoaXMuaW5kZXgrKztcclxuICAgIGlmICh0aGlzLmluZGV4IDwgNykge1xyXG4gICAgICBncmFwaGljcy51cGRhdGVTcHJpdGVVVih0aGlzLm1lc2guZ2VvbWV0cnksIHNmZy50ZXh0dXJlRmlsZXMuYm9tYiwgMTYsIDE2LCB0aGlzLmluZGV4KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuZW5hYmxlXyA9IGZhbHNlO1xyXG4gICAgICB0aGlzLm1lc2gudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICBzZmcudGFza3MucmVtb3ZlVGFzayh0YXNrSW5kZXgpO1xyXG4gICAgfVxyXG5cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBCb21icyhzY2VuZSxzZSkge1xyXG4gIHRoaXMuYm9tYnMgPSBuZXcgQXJyYXkoMCk7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCAzMjsgKytpKSB7XHJcbiAgICB0aGlzLmJvbWJzLnB1c2gobmV3IEJvbWIoc2NlbmUsc2UpKTtcclxuICB9XHJcbn1cclxuXHJcbkJvbWJzLnByb3RvdHlwZSA9IHtcclxuICBzdGFydDogZnVuY3Rpb24gKHgsIHksIHopIHtcclxuICAgIHZhciBib21zID0gdGhpcy5ib21icztcclxuICAgIHZhciBjb3VudCA9IDM7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gYm9tcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgICBpZiAoIWJvbXNbaV0uZW5hYmxlXykge1xyXG4gICAgICAgIGlmIChjb3VudCA9PSAyKSB7XHJcbiAgICAgICAgICBib21zW2ldLnN0YXJ0KHgsIHksIHosIDApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBib21zW2ldLnN0YXJ0KHggKyAoTWF0aC5yYW5kb20oKSAqIDE2IC0gOCksIHkgKyAoTWF0aC5yYW5kb20oKSAqIDE2IC0gOCksIHosIE1hdGgucmFuZG9tKCkgKiA4KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY291bnQtLTtcclxuICAgICAgICBpZiAoIWNvdW50KSBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0ICogIGFzIGdhbWVvYmogZnJvbSAnLi9nYW1lb2JqJztcclxuaW1wb3J0ICogYXMgc2ZnIGZyb20gJy4vZ2xvYmFsJztcclxuaW1wb3J0ICogYXMgZ3JhcGhpY3MgZnJvbSAnLi9ncmFwaGljcyc7XHJcblxyXG4vLy8g5pW15by+XHJcbmV4cG9ydCBmdW5jdGlvbiBFbmVteUJ1bGxldChzY2VuZSxzZSlcclxue1xyXG4gIGdhbWVvYmouR2FtZU9iai5jYWxsKHRoaXMsIDAsIDAsIDApO1xyXG4gIHRoaXMuY29sbGlzaW9uQXJlYS53aWR0aCA9IDI7XHJcbiAgdGhpcy5jb2xsaXNpb25BcmVhLmhlaWdodCA9IDI7XHJcbiAgdmFyIHRleCA9IHNmZy50ZXh0dXJlRmlsZXMuZW5lbXk7XHJcbiAgdmFyIG1hdGVyaWFsID0gZ3JhcGhpY3MuY3JlYXRlU3ByaXRlTWF0ZXJpYWwodGV4KTtcclxuICB2YXIgZ2VvbWV0cnkgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVHZW9tZXRyeSgxNik7XHJcbiAgZ3JhcGhpY3MuY3JlYXRlU3ByaXRlVVYoZ2VvbWV0cnksIHRleCwgMTYsIDE2LCAwKTtcclxuICB0aGlzLm1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gIHRoaXMueiA9IDAuMDtcclxuICB0aGlzLm12UGF0dGVybiA9IG51bGw7XHJcbiAgdGhpcy5tdiA9IG51bGw7XHJcbiAgdGhpcy5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxuICB0aGlzLnR5cGUgPSBudWxsO1xyXG4gIHRoaXMubGlmZSA9IDA7XHJcbiAgdGhpcy5keCA9IDA7XHJcbiAgdGhpcy5keSA9IDA7XHJcbiAgdGhpcy5zcGVlZCA9IDIuMDtcclxuICB0aGlzLmVuYWJsZSA9IGZhbHNlO1xyXG4gIHRoaXMuaGl0XyA9IG51bGw7XHJcbiAgdGhpcy5zdGF0dXMgPSB0aGlzLk5PTkU7XHJcbiAgdGhpcy5zY2VuZSA9IHNjZW5lO1xyXG4gIHNjZW5lLmFkZCh0aGlzLm1lc2gpO1xyXG4gIHRoaXMuc2UgPSBzZTtcclxufVxyXG5cclxuRW5lbXlCdWxsZXQucHJvdG90eXBlID0ge1xyXG4gIGdldCB4KCkgeyByZXR1cm4gdGhpcy54XzsgfSxcclxuICBzZXQgeCh2KSB7IHRoaXMueF8gPSB0aGlzLm1lc2gucG9zaXRpb24ueCA9IHY7IH0sXHJcbiAgZ2V0IHkoKSB7IHJldHVybiB0aGlzLnlfOyB9LFxyXG4gIHNldCB5KHYpIHsgdGhpcy55XyA9IHRoaXMubWVzaC5wb3NpdGlvbi55ID0gdjsgfSxcclxuICBnZXQgeigpIHsgcmV0dXJuIHRoaXMuel87IH0sXHJcbiAgc2V0IHoodikgeyB0aGlzLnpfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnogPSB2OyB9LFxyXG4gIGdldCBlbmFibGUoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lbmFibGVfO1xyXG4gIH0sXHJcbiAgc2V0IGVuYWJsZSh2KSB7XHJcbiAgICB0aGlzLmVuYWJsZV8gPSB2O1xyXG4gICAgdGhpcy5tZXNoLnZpc2libGUgPSB2O1xyXG4gIH0sXHJcbiAgbW92ZTogZnVuY3Rpb24gKHRhc2tJbmRleCkge1xyXG4gICAgaWYgKHRoaXMuc3RhdHVzID09IHRoaXMuTk9ORSlcclxuICAgIHtcclxuICAgICAgZGVidWdnZXI7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy54ID0gdGhpcy54ICsgdGhpcy5keDtcclxuICAgIHRoaXMueSA9IHRoaXMueSArIHRoaXMuZHk7XHJcblxyXG4gICAgaWYodGhpcy54IDwgKHNmZy5WX0xFRlQgLSAxNikgfHxcclxuICAgICAgIHRoaXMueCA+IChzZmcuVl9SSUdIVCArIDE2KSB8fFxyXG4gICAgICAgdGhpcy55IDwgKHNmZy5WX0JPVFRPTSAtIDE2KSB8fFxyXG4gICAgICAgdGhpcy55ID4gKHNmZy5WX1RPUCArIDE2KSkge1xyXG4gICAgICAgdGhpcy5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgIHRoaXMuc3RhdHVzID0gdGhpcy5OT05FO1xyXG4gICAgICAgdGhpcy5lbmFibGUgPSBmYWxzZTtcclxuICAgICAgIHNmZy50YXNrcy5yZW1vdmVUYXNrKHRhc2tJbmRleCk7XHJcbiAgICB9XHJcbiAgIH0sXHJcbiAgc3RhcnQ6IGZ1bmN0aW9uICh4LCB5LCB6KSB7XHJcbiAgICBpZiAodGhpcy5lbmFibGUpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgdGhpcy54ID0geCB8fCAwO1xyXG4gICAgdGhpcy55ID0geSB8fCAwO1xyXG4gICAgdGhpcy56ID0geiB8fCAwO1xyXG4gICAgdGhpcy5lbmFibGUgPSB0cnVlO1xyXG4gICAgaWYgKHRoaXMuc3RhdHVzICE9IHRoaXMuTk9ORSlcclxuICAgIHtcclxuICAgICAgZGVidWdnZXI7XHJcbiAgICB9XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuTU9WRTtcclxuICAgIHZhciBhaW1SYWRpYW4gPSBNYXRoLmF0YW4yKHNmZy5teXNoaXBfLnkgLSB5LCBzZmcubXlzaGlwXy54IC0geCk7XHJcbiAgICB0aGlzLm1lc2gucm90YXRpb24ueiA9IGFpbVJhZGlhbjtcclxuICAgIHRoaXMuZHggPSBNYXRoLmNvcyhhaW1SYWRpYW4pICogKHRoaXMuc3BlZWQgKyBzZmcuc3RhZ2UuZGlmZmljdWx0eSk7XHJcbiAgICB0aGlzLmR5ID0gTWF0aC5zaW4oYWltUmFkaWFuKSAqICh0aGlzLnNwZWVkICsgc2ZnLnN0YWdlLmRpZmZpY3VsdHkpO1xyXG4vLyAgICBjb25zb2xlLmxvZygnZHg6JyArIHRoaXMuZHggKyAnIGR5OicgKyB0aGlzLmR5KTtcclxuXHJcbiAgICB2YXIgZW5iID0gdGhpcztcclxuICAgIHRoaXMudGFzayA9IHNmZy50YXNrcy5wdXNoVGFzayhmdW5jdGlvbiAoaSkgeyBlbmIubW92ZShpKTsgfSk7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9LFxyXG4gIGhpdDogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5lbmFibGUgPSBmYWxzZTtcclxuICAgIHNmZy50YXNrcy5yZW1vdmVUYXNrKHRoaXMudGFzay5pbmRleCk7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuTk9ORTtcclxuICB9LFxyXG4gIE5PTkU6IDAsXHJcbiAgTU9WRTogMSxcclxuICBCT01COiAyXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBFbmVteUJ1bGxldHMoc2NlbmUsc2UpXHJcbntcclxuICB0aGlzLnNjZW5lID0gc2NlbmU7XHJcbiAgdGhpcy5lbmVteUJ1bGxldHMgPSBbXTtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IDQ4OyArK2kpIHtcclxuICAgIHRoaXMuZW5lbXlCdWxsZXRzLnB1c2gobmV3IEVuZW15QnVsbGV0KHRoaXMuc2NlbmUsc2UpKTtcclxuICB9XHJcbn1cclxuXHJcbkVuZW15QnVsbGV0cy5wcm90b3R5cGUgPSB7XHJcbiAgc3RhcnQ6IGZ1bmN0aW9uICh4LCB5LCB6KSB7XHJcbiAgICB2YXIgZWJzID0gdGhpcy5lbmVteUJ1bGxldHM7XHJcbiAgICBmb3IodmFyIGkgPSAwLGVuZCA9IGVicy5sZW5ndGg7aTwgZW5kOysraSl7XHJcbiAgICAgIGlmKCFlYnNbaV0uZW5hYmxlKXtcclxuICAgICAgICBlYnNbaV0uc3RhcnQoeCwgeSwgeik7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG4gIHJlc2V0OiBmdW5jdGlvbigpXHJcbiAge1xyXG4gICAgdmFyIGVicyA9IHRoaXMuZW5lbXlCdWxsZXRzO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IGVicy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgICBpZiAoZWJzW2ldLmVuYWJsZSkge1xyXG4gICAgICAgIGVic1tpXS5lbmFibGUgPSBmYWxzZTtcclxuICAgICAgICBlYnNbaV0uc3RhdHVzID0gZWJzW2ldLk5PTkU7XHJcbiAgICAgICAgc2ZnLnRhc2tzLnJlbW92ZVRhc2soZWJzW2ldLnRhc2suaW5kZXgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g5pW144Kt44Oj44Op44Gu5YuV44GNIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuLy8vIOebtOe3mumBi+WLlVxyXG5mdW5jdGlvbiBMaW5lTW92ZShyYWQsIHNwZWVkLCBzdGVwKVxyXG57XHJcbiAgdGhpcy5yYWQgPSByYWQ7XHJcbiAgdGhpcy5zcGVlZCA9IHNwZWVkO1xyXG4gIHRoaXMuc3RlcCA9IHN0ZXA7XHJcbiAgdGhpcy5jdXJyZW50U3RlcCA9IHN0ZXA7XHJcbiAgdGhpcy5keCA9IE1hdGguY29zKHJhZCkgKiBzcGVlZDtcclxuICB0aGlzLmR5ID0gTWF0aC5zaW4ocmFkKSAqIHNwZWVkO1xyXG59XHJcblxyXG5MaW5lTW92ZS5wcm90b3R5cGUgPSB7XHJcbiAgc3RhcnQ6IGZ1bmN0aW9uIChzZWxmLCB4LCB5KSB7XHJcbiAgICBzZWxmLm1vdmVFbmQgPSBmYWxzZTtcclxuICAgIHNlbGYuc3RlcCA9IHRoaXMuc3RlcDtcclxuICAgIGlmIChzZWxmLnhyZXYpIHtcclxuICAgICAgc2VsZi5jaGFyUmFkID0gUEkgLSAodGhpcy5yYWQgLSBQSSAvIDIpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2VsZi5jaGFyUmFkID0gdGhpcy5yYWQgLSBQSSAvIDI7XHJcbiAgICB9XHJcbiAgfSxcclxuICBtb3ZlOiBmdW5jdGlvbiAoc2VsZikge1xyXG4gICAgaWYgKHNlbGYubW92ZUVuZCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBpZiAoc2VsZi54cmV2KSB7XHJcbiAgICAgIHNlbGYueCAtPSB0aGlzLmR4O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2VsZi54ICs9IHRoaXMuZHg7XHJcbiAgICB9XHJcbiAgICBzZWxmLnkgKz0gdGhpcy5keTtcclxuICAgIHNlbGYuc3RlcC0tO1xyXG4gICAgaWYgKCFzZWxmLnN0ZXApIHtcclxuICAgICAgc2VsZi5tb3ZlRW5kID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgfVxyXG59XHJcblxyXG4vLy8g5YaG6YGL5YuVXHJcbmZ1bmN0aW9uIENpcmNsZU1vdmUoc3RhcnRSYWQsIHN0b3BSYWQsIHIsIHNwZWVkLCBsZWZ0KSB7XHJcbiAgdGhpcy5zdGFydFJhZCA9IHN0YXJ0UmFkIHx8IDA7XHJcbiAgdGhpcy5zdG9wUmFkID0gc3RvcFJhZCB8fCAwO1xyXG4gIHRoaXMuciA9IHIgfHwgMDtcclxuICB0aGlzLnNwZWVkID0gc3BlZWQgfHwgMDtcclxuICB0aGlzLmxlZnQgPSAhbGVmdCA/IGZhbHNlIDogdHJ1ZTtcclxuICB0aGlzLmRlbHRhcyA9IFtdO1xyXG4gIHZhciByYWQgPSB0aGlzLnN0YXJ0UmFkO1xyXG4gIHZhciBzdGVwID0gKGxlZnQgPyAxIDogLTEpICogc3BlZWQgLyByO1xyXG4gIHZhciBlbmQgPSBmYWxzZTtcclxuICB3aGlsZSAoIWVuZCkge1xyXG4gICAgcmFkICs9IHN0ZXA7XHJcbiAgICBpZiAoKGxlZnQgJiYgKHJhZCA+PSB0aGlzLnN0b3BSYWQpKSB8fCAoIWxlZnQgJiYgcmFkIDw9IHRoaXMuc3RvcFJhZCkpIHtcclxuICAgICAgcmFkID0gdGhpcy5zdG9wUmFkO1xyXG4gICAgICBlbmQgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgdGhpcy5kZWx0YXMucHVzaCh7XHJcbiAgICAgIHg6IHRoaXMuciAqIE1hdGguY29zKHJhZCksXHJcbiAgICAgIHk6IHRoaXMuciAqIE1hdGguc2luKHJhZCksXHJcbiAgICAgIHJhZDogcmFkXHJcbiAgICB9KTtcclxuICB9XHJcbn07XHJcblxyXG5DaXJjbGVNb3ZlLnByb3RvdHlwZSA9IHtcclxuICBzdGFydDogZnVuY3Rpb24gKHNlbGYsIHgsIHkpIHtcclxuICAgIHNlbGYubW92ZUVuZCA9IGZhbHNlO1xyXG4gICAgc2VsZi5zdGVwID0gMDtcclxuICAgIGlmIChzZWxmLnhyZXYpIHtcclxuICAgICAgc2VsZi5zeCA9IHggLSB0aGlzLnIgKiBNYXRoLmNvcyh0aGlzLnN0YXJ0UmFkICsgTWF0aC5QSSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzZWxmLnN4ID0geCAtIHRoaXMuciAqIE1hdGguY29zKHRoaXMuc3RhcnRSYWQpO1xyXG4gICAgfVxyXG4gICAgc2VsZi5zeSA9IHkgLSB0aGlzLnIgKiBNYXRoLnNpbih0aGlzLnN0YXJ0UmFkKTtcclxuICAgIHNlbGYueiA9IDAuMDtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH0sXHJcbiAgbW92ZTogZnVuY3Rpb24gKHNlbGYpIHtcclxuICAgIGlmIChzZWxmLm1vdmVFbmQpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdmFyIGRlbHRhID0gdGhpcy5kZWx0YXNbc2VsZi5zdGVwXTtcclxuXHJcbiAgICBzZWxmLnggPSBzZWxmLnN4ICsgKHNlbGYueHJldj9kZWx0YS54ICogLTE6ZGVsdGEueCk7XHJcbiAgICBzZWxmLnkgPSBzZWxmLnN5ICsgZGVsdGEueTtcclxuICAgIGlmIChzZWxmLnhyZXYpIHtcclxuICAgICAgc2VsZi5jaGFyUmFkID0gKE1hdGguUEkgLSBkZWx0YS5yYWQpICsgKHRoaXMubGVmdCA/IC0xIDogMCkgKiBNYXRoLlBJO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2VsZi5jaGFyUmFkID0gZGVsdGEucmFkICsgKHRoaXMubGVmdCA/IDAgOiAtMSkgKiBNYXRoLlBJO1xyXG4gICAgfVxyXG4gICAgc2VsZi5yYWQgPSBkZWx0YS5yYWQ7XHJcbiAgICBzZWxmLnN0ZXArKztcclxuICAgIGlmIChzZWxmLnN0ZXAgPj0gdGhpcy5kZWx0YXMubGVuZ3RoKSB7XHJcbiAgICAgIHNlbGYuc3RlcC0tO1xyXG4gICAgICBzZWxmLm1vdmVFbmQgPSB0cnVlO1xyXG4gICAgfVxyXG4gIH1cclxufTtcclxuXHJcbi8vLyDjg5vjg7zjg6Djg53jgrjjgrfjg6fjg7PjgavmiLvjgotcclxuZXhwb3J0IGZ1bmN0aW9uIEdvdG9Ib21lKCkge1xyXG5cclxufVxyXG5cclxuR290b0hvbWUucHJvdG90eXBlID0ge1xyXG4gIHN0YXJ0OiBmdW5jdGlvbiAoc2VsZiwgeCwgeSkge1xyXG4gICAgdmFyIHJhZCA9IE1hdGguYXRhbjIoc2VsZi5ob21lWSAtIHNlbGYueSwgc2VsZi5ob21lWCAtIHNlbGYueCk7XHJcbiAgICBzZWxmLmNoYXJSYWQgPSByYWQgLSBNYXRoLlBJIC8gMjtcclxuICAgIHNlbGYucmFkID0gcmFkO1xyXG4gICAgc2VsZi5zcGVlZCA9IDQ7XHJcbiAgICBzZWxmLmR4ID0gTWF0aC5jb3Moc2VsZi5yYWQpICogc2VsZi5zcGVlZDtcclxuICAgIHNlbGYuZHkgPSBNYXRoLnNpbihzZWxmLnJhZCkgKiBzZWxmLnNwZWVkO1xyXG4gICAgc2VsZi5tb3ZlRW5kID0gZmFsc2U7XHJcbiAgICBzZWxmLnogPSAwLjA7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9LFxyXG4gIG1vdmU6IGZ1bmN0aW9uIChzZWxmKSB7XHJcbiAgICBpZiAoc2VsZi5tb3ZlRW5kKSB7IHJldHVybjsgfVxyXG4gICAgaWYgKE1hdGguYWJzKHNlbGYueCAtIHNlbGYuaG9tZVgpIDwgMiAmJiBNYXRoLmFicyhzZWxmLnkgLSBzZWxmLmhvbWVZKSA8IDIpIHtcclxuICAgICAgc2VsZi5jaGFyUmFkID0gMDtcclxuICAgICAgc2VsZi5yYWQgPSBNYXRoLlBJO1xyXG4gICAgICBzZWxmLnggPSBzZWxmLmhvbWVYO1xyXG4gICAgICBzZWxmLnkgPSBzZWxmLmhvbWVZO1xyXG4gICAgICBzZWxmLm1vdmVFbmQgPSB0cnVlO1xyXG4gICAgICBpZiAoc2VsZi5zdGF0dXMgPT0gc2VsZi5TVEFSVCkge1xyXG4gICAgICAgIHZhciBncm91cElEID0gc2VsZi5ncm91cElEO1xyXG4gICAgICAgIHZhciBncm91cERhdGEgPSBzZWxmLmVuZW1pZXMuZ3JvdXBEYXRhO1xyXG4gICAgICAgIGdyb3VwRGF0YVtncm91cElEXS5wdXNoKHNlbGYpO1xyXG4gICAgICAgIHNlbGYuZW5lbWllcy5ob21lRW5lbWllc0NvdW50Kys7XHJcbiAgICAgIH1cclxuICAgICAgc2VsZi5zdGF0dXMgPSBzZWxmLkhPTUU7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHNlbGYueCArPSBzZWxmLmR4O1xyXG4gICAgc2VsZi55ICs9IHNlbGYuZHk7XHJcbiAgfVxyXG59XHJcblxyXG4vLy9cclxuZXhwb3J0IGZ1bmN0aW9uIEhvbWVNb3ZlKCl7fTtcclxuSG9tZU1vdmUucHJvdG90eXBlID0gXHJcbntcclxuICBDRU5URVJfWDowLFxyXG4gIENFTlRFUl9ZOjEwMCxcclxuICBzdGFydDogZnVuY3Rpb24gKHNlbGYsIHgsIHkpIHtcclxuICAgIHNlbGYuZHggPSBzZWxmLmhvbWVYIC0gdGhpcy5DRU5URVJfWDtcclxuICAgIHNlbGYuZHkgPSBzZWxmLmhvbWVZIC0gdGhpcy5DRU5URVJfWTtcclxuICAgIHNlbGYubW92ZUVuZCA9IGZhbHNlO1xyXG4gICAgc2VsZi56ID0gLTAuMTtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH0sXHJcbiAgbW92ZTogZnVuY3Rpb24gKHNlbGYpIHtcclxuICAgIGlmIChzZWxmLm1vdmVFbmQpIHsgcmV0dXJuOyB9XHJcbiAgICBpZiAoc2VsZi5zdGF0dXMgPT0gc2VsZi5BVFRBQ0spIHtcclxuICAgICAgc2VsZi5tb3ZlRW5kID0gdHJ1ZTtcclxuICAgICAgc2VsZi5tZXNoLnNjYWxlLnggPSAxLjA7XHJcbiAgICAgIHNlbGYueiA9IDAuMDtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgc2VsZi54ID0gIHNlbGYuaG9tZVggKyBzZWxmLmR4ICogc2VsZi5lbmVtaWVzLmhvbWVEZWx0YTtcclxuICAgIHNlbGYueSA9IHNlbGYuaG9tZVkgKyBzZWxmLmR5ICogc2VsZi5lbmVtaWVzLmhvbWVEZWx0YTtcclxuICAgIHNlbGYubWVzaC5zY2FsZS54ID0gc2VsZi5lbmVtaWVzLmhvbWVEZWx0YTI7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g5oyH5a6a44K344O844Kx44Oz44K544Gr56e75YuV44GZ44KLXHJcbmV4cG9ydCBmdW5jdGlvbiBHb3RvKHBvcykgeyB0aGlzLnBvcyA9IHBvczsgfTtcclxuR290by5wcm90b3R5cGUgPVxyXG57XHJcbiAgc3RhcnQ6IGZ1bmN0aW9uIChzZWxmLCB4LCB5KSB7XHJcbiAgICBzZWxmLmluZGV4ID0gdGhpcy5wb3MgLSAxO1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH0sXHJcbiAgbW92ZTogZnVuY3Rpb24gKHNlbGYpIHtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDmlbXlvL7nmbrlsIRcclxuZXhwb3J0IGZ1bmN0aW9uIEZpcmUoKSB7XHJcbn1cclxuXHJcbkZpcmUucHJvdG90eXBlID0ge1xyXG4gIHN0YXJ0OiBmdW5jdGlvbiAoc2VsZiwgeCwgeSkge1xyXG4gICAgbGV0IGQgPSAoc2ZnLnN0YWdlLm5vIC8gMjApICogKCBzZmcuc3RhZ2UuZGlmZmljdWx0eSk7XHJcbiAgICBpZiAoZCA+IDEpIHsgZCA9IDEuMDt9XHJcbiAgICBpZiAoTWF0aC5yYW5kb20oKSA8IGQpIHtcclxuICAgICAgc2VsZi5lbmVtaWVzLmVuZW15QnVsbGV0cy5zdGFydChzZWxmLngsIHNlbGYueSk7XHJcbiAgICAgIHNlbGYubW92ZUVuZCA9IHRydWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfSxcclxuICBtb3ZlOiBmdW5jdGlvbiAoc2VsZikge1xyXG4gICAgaWYgKHNlbGYubW92ZUVuZCkgeyByZXR1cm47IH1cclxuICB9XHJcbn1cclxuXHJcbi8vLyDmlbXmnKzkvZNcclxuZXhwb3J0IGZ1bmN0aW9uIEVuZW15KGVuZW1pZXMsc2NlbmUsc2UpIHtcclxuICBnYW1lb2JqLkdhbWVPYmouY2FsbCh0aGlzLCAwLCAwLCAwKTtcclxuICB0aGlzLmNvbGxpc2lvbkFyZWEud2lkdGggPSAxMjtcclxuICB0aGlzLmNvbGxpc2lvbkFyZWEuaGVpZ2h0ID0gODtcclxuICB2YXIgdGV4ID0gc2ZnLnRleHR1cmVGaWxlcy5lbmVteTtcclxuICB2YXIgbWF0ZXJpYWwgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVNYXRlcmlhbCh0ZXgpO1xyXG4gIHZhciBnZW9tZXRyeSA9IGdyYXBoaWNzLmNyZWF0ZVNwcml0ZUdlb21ldHJ5KDE2KTtcclxuICBncmFwaGljcy5jcmVhdGVTcHJpdGVVVihnZW9tZXRyeSwgdGV4LCAxNiwgMTYsIDApO1xyXG4gIHRoaXMubWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgdGhpcy5ncm91cElEID0gMDtcclxuICB0aGlzLnogPSAwLjA7XHJcbiAgdGhpcy5pbmRleCA9IDA7XHJcbiAgdGhpcy5zY29yZSA9IDA7XHJcbiAgdGhpcy5tdlBhdHRlcm4gPSBudWxsO1xyXG4gIHRoaXMubXYgPSBudWxsO1xyXG4gIHRoaXMubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcbiAgdGhpcy5zdGF0dXMgPSB0aGlzLk5PTkU7XHJcbiAgdGhpcy50eXBlID0gbnVsbDtcclxuICB0aGlzLmxpZmUgPSAwO1xyXG4gIHRoaXMudGFzayA9IG51bGw7XHJcbiAgdGhpcy5oaXRfID0gbnVsbDtcclxuICB0aGlzLnNjZW5lID0gc2NlbmU7XHJcbiAgdGhpcy5zY2VuZS5hZGQodGhpcy5tZXNoKTtcclxuICB0aGlzLnNlID0gc2U7XHJcbiAgdGhpcy5lbmVtaWVzID0gZW5lbWllcztcclxufVxyXG5cclxuRW5lbXkucHJvdG90eXBlID0ge1xyXG4gIGdldCB4KCkgeyByZXR1cm4gdGhpcy54XzsgfSxcclxuICBzZXQgeCh2KSB7IHRoaXMueF8gPSB0aGlzLm1lc2gucG9zaXRpb24ueCA9IHY7IH0sXHJcbiAgZ2V0IHkoKSB7IHJldHVybiB0aGlzLnlfOyB9LFxyXG4gIHNldCB5KHYpIHsgdGhpcy55XyA9IHRoaXMubWVzaC5wb3NpdGlvbi55ID0gdjsgfSxcclxuICBnZXQgeigpIHsgcmV0dXJuIHRoaXMuel87IH0sXHJcbiAgc2V0IHoodikgeyB0aGlzLnpfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnogPSB2OyB9LFxyXG4gIC8vL+aVteOBruWLleOBjVxyXG4gIG1vdmU6IGZ1bmN0aW9uICh0YXNrSW5kZXgpIHtcclxuICAgIGlmICh0aGlzLnN0YXR1cyA9PSB0aGlzLk5PTkUpXHJcbiAgICB7XHJcbiAgICAgIGRlYnVnZ2VyO1xyXG4gICAgfVxyXG4gICAgdmFyIGVuZCA9IGZhbHNlO1xyXG4gICAgd2hpbGUgKCFlbmQpIHtcclxuICAgICAgaWYgKHRoaXMubW92ZUVuZCAmJiB0aGlzLmluZGV4IDwgKHRoaXMubXZQYXR0ZXJuLmxlbmd0aCAtIDEpKSB7XHJcbiAgICAgICAgdGhpcy5pbmRleCsrO1xyXG4gICAgICAgIHRoaXMubXYgPSB0aGlzLm12UGF0dGVyblt0aGlzLmluZGV4XTtcclxuICAgICAgICBlbmQgPSB0aGlzLm12LnN0YXJ0KHRoaXMsIHRoaXMueCwgdGhpcy55KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5tdi5tb3ZlKHRoaXMpO1xyXG4gICAgdGhpcy5tZXNoLnNjYWxlLnggPSB0aGlzLmVuZW1pZXMuaG9tZURlbHRhMjtcclxuICAgIHRoaXMubWVzaC5yb3RhdGlvbi56ID0gdGhpcy5jaGFyUmFkO1xyXG4gIH0sXHJcbiAgLy8vIOWIneacn+WMllxyXG4gIHN0YXJ0OiBmdW5jdGlvbiAoeCwgeSwgeiwgaG9tZVgsIGhvbWVZLCBtdlBhdHRlcm4sIHhyZXYsdHlwZSwgY2xlYXJUYXJnZXQsZ3JvdXBJRCkge1xyXG4gICAgaWYgKHRoaXMuZW5hYmxlXykge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xyXG4gICAgdHlwZSh0aGlzKTtcclxuICAgIHRoaXMueCA9IHg7XHJcbiAgICB0aGlzLnkgPSB5O1xyXG4gICAgdGhpcy56ID0gejtcclxuICAgIHRoaXMueHJldiA9IHhyZXY7XHJcbiAgICB0aGlzLmVuYWJsZV8gPSB0cnVlO1xyXG4gICAgdGhpcy5ob21lWCA9IGhvbWVYIHx8IDA7XHJcbiAgICB0aGlzLmhvbWVZID0gaG9tZVkgfHwgMDtcclxuICAgIHRoaXMuaW5kZXggPSAwO1xyXG4gICAgdGhpcy5ncm91cElEID0gZ3JvdXBJRDtcclxuICAgIHRoaXMubXZQYXR0ZXJuID0gbXZQYXR0ZXJuO1xyXG4gICAgdGhpcy5jbGVhclRhcmdldCA9IGNsZWFyVGFyZ2V0IHx8IHRydWU7XHJcbiAgICB0aGlzLm1lc2gubWF0ZXJpYWwuY29sb3Iuc2V0SGV4KDB4RkZGRkZGKTtcclxuICAgIHRoaXMubXYgPSBtdlBhdHRlcm5bMF07XHJcbiAgICB0aGlzLm12LnN0YXJ0KHRoaXMsIHgsIHkpO1xyXG4gICAgLy9pZiAodGhpcy5zdGF0dXMgIT0gdGhpcy5OT05FKSB7XHJcbiAgICAvLyAgZGVidWdnZXI7XHJcbiAgICAvL31cclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5TVEFSVDtcclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgIHRoaXMudGFzayA9IHNmZy50YXNrcy5wdXNoVGFzayhmdW5jdGlvbiAoaSkgeyBzZWxmLm1vdmUoaSk7IH0sIDEwMDAwKTtcclxuICAgIHRoaXMubWVzaC52aXNpYmxlID0gdHJ1ZTtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH0sXHJcbiAgaGl0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAodGhpcy5oaXRfID09IG51bGwpIHtcclxuICAgICAgdGhpcy5saWZlLS07XHJcbiAgICAgIGlmICh0aGlzLmxpZmUgPT0gMCkge1xyXG4vLyAgICAgICAgdGhpcy5lbmFibGVfID0gZmFsc2U7XHJcbiAgICAgICAgc2ZnLmJvbWJzLnN0YXJ0KHRoaXMueCwgdGhpcy55KTtcclxuICAgICAgICB0aGlzLnNlKDEpO1xyXG4vLyAgICAgICAgc2VxdWVuY2VyLnBsYXlUcmFja3Moc291bmRFZmZlY3RzLnNvdW5kRWZmZWN0c1sxXSk7XHJcbiAgICAgICAgc2ZnLmFkZFNjb3JlKHRoaXMuc2NvcmUpO1xyXG4gICAgICAgIGlmICh0aGlzLmNsZWFyVGFyZ2V0KSB7XHJcbiAgICAgICAgICB0aGlzLmVuZW1pZXMuaGl0RW5lbWllc0NvdW50Kys7XHJcbiAgICAgICAgICBpZiAodGhpcy5zdGF0dXMgPT0gdGhpcy5TVEFSVCkge1xyXG4gICAgICAgICAgICB0aGlzLmVuZW1pZXMuaG9tZUVuZW1pZXNDb3VudCsrO1xyXG4gICAgICAgICAgICB0aGlzLmVuZW1pZXMuZ3JvdXBEYXRhW3RoaXMuZ3JvdXBJRF0ucHVzaCh0aGlzKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHRoaXMuZW5lbWllcy5ncm91cERhdGFbdGhpcy5ncm91cElEXS5nb25lQ291bnQrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmVuYWJsZV8gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnN0YXR1cyA9IHRoaXMuTk9ORTtcclxuICAgICAgICBzZmcudGFza3MucmVtb3ZlVGFzayh0aGlzLnRhc2suaW5kZXgpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuc2UoMik7XHJcbi8vICAgICAgICBzZXF1ZW5jZXIucGxheVRyYWNrcyhzb3VuZEVmZmVjdHMuc291bmRFZmZlY3RzWzJdKTtcclxuICAgICAgICB0aGlzLm1lc2gubWF0ZXJpYWwuY29sb3Iuc2V0SGV4KDB4RkY4MDgwKTtcclxuICAgICAgICAvLyAgICAgICAgdGhpcy5tZXNoLm1hdGVyaWFsLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5oaXRfKCk7XHJcbiAgICB9XHJcbiAgfSxcclxuICBOT05FOiAwIHwgMCxcclxuICBTVEFSVDogMSB8IDAsXHJcbiAgSE9NRTogMiB8IDAsXHJcbiAgQVRUQUNLOiAzIHwgMCxcclxuICBCT01COiA0IHwgMFxyXG59XHJcblxyXG5mdW5jdGlvbiBaYWtvKHNlbGYpIHtcclxuICBzZWxmLnNjb3JlID0gNTA7XHJcbiAgc2VsZi5saWZlID0gMTtcclxuICBncmFwaGljcy51cGRhdGVTcHJpdGVVVihzZWxmLm1lc2guZ2VvbWV0cnksIHNmZy50ZXh0dXJlRmlsZXMuZW5lbXksIDE2LCAxNiwgNyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFpha28xKHNlbGYpIHtcclxuICBzZWxmLnNjb3JlID0gMTAwO1xyXG4gIHNlbGYubGlmZSA9IDE7XHJcbiAgZ3JhcGhpY3MudXBkYXRlU3ByaXRlVVYoc2VsZi5tZXNoLmdlb21ldHJ5LCBzZmcudGV4dHVyZUZpbGVzLmVuZW15LCAxNiwgMTYsIDYpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBNQm9zcyhzZWxmKSB7XHJcbiAgc2VsZi5zY29yZSA9IDMwMDtcclxuICBzZWxmLmxpZmUgPSAyO1xyXG4gIHNlbGYubWVzaC5ibGVuZGluZyA9IFRIUkVFLk5vcm1hbEJsZW5kaW5nO1xyXG4gIGdyYXBoaWNzLnVwZGF0ZVNwcml0ZVVWKHNlbGYubWVzaC5nZW9tZXRyeSwgc2ZnLnRleHR1cmVGaWxlcy5lbmVteSwgMTYsIDE2LCA0KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIEVuZW1pZXMoc2NlbmUsc2UsZW5lbXlCdWxsZXRzKSB7XHJcbiAgdGhpcy5lbmVteUJ1bGxldHMgPSBlbmVteUJ1bGxldHM7XHJcbiAgdGhpcy5zY2VuZSA9IHNjZW5lO1xyXG4gIHRoaXMubmV4dFRpbWUgPSAwO1xyXG4gIHRoaXMuY3VycmVudEluZGV4ID0gMDtcclxuICB0aGlzLmVuZW1pZXMgPSBuZXcgQXJyYXkoMCk7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCA2NDsgKytpKSB7XHJcbiAgICB0aGlzLmVuZW1pZXMucHVzaChuZXcgRW5lbXkodGhpcyxzY2VuZSxzZSkpO1xyXG4gIH1cclxuICBmb3IodmFyIGkgPSAwO2kgPCA1OysraSl7XHJcbiAgICB0aGlzLmdyb3VwRGF0YVtpXSA9IG5ldyBBcnJheSgwKTtcclxuICB9XHJcbn07XHJcblxyXG4vLy8g5pW157eo6ZqK44Gu5YuV44GN44KS44Kz44Oz44OI44Ot44O844Or44GZ44KLXHJcbkVuZW1pZXMucHJvdG90eXBlLm1vdmUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgdmFyIGN1cnJlbnRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZTtcclxuICB2YXIgbW92ZVNlcXMgPSB0aGlzLm1vdmVTZXFzO1xyXG4gIHZhciBsZW4gPSBtb3ZlU2Vxc1tzZmcuc3RhZ2UucHJpdmF0ZU5vXS5sZW5ndGg7XHJcbiAgLy8g44OH44O844K/6YWN5YiX44KS44KC44Go44Gr5pW144KS55Sf5oiQXHJcbiAgd2hpbGUgKHRoaXMuY3VycmVudEluZGV4IDwgbGVuKSB7XHJcbiAgICB2YXIgZGF0YSA9IG1vdmVTZXFzW3NmZy5zdGFnZS5wcml2YXRlTm9dW3RoaXMuY3VycmVudEluZGV4XTtcclxuICAgIHZhciBuZXh0VGltZSA9IHRoaXMubmV4dFRpbWUgIT0gbnVsbCA/IHRoaXMubmV4dFRpbWUgOiBkYXRhWzBdO1xyXG4gICAgaWYgKGN1cnJlbnRUaW1lID49ICh0aGlzLm5leHRUaW1lICsgZGF0YVswXSkpIHtcclxuICAgICAgdmFyIGVuZW1pZXMgPSB0aGlzLmVuZW1pZXM7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwLCBlID0gZW5lbWllcy5sZW5ndGg7IGkgPCBlOyArK2kpIHtcclxuICAgICAgICB2YXIgZW5lbXkgPSBlbmVtaWVzW2ldO1xyXG4gICAgICAgIGlmICghZW5lbXkuZW5hYmxlXykge1xyXG4gICAgICAgICAgZW5lbXkuc3RhcnQoZGF0YVsxXSwgZGF0YVsyXSwgMCwgZGF0YVszXSwgZGF0YVs0XSwgdGhpcy5tb3ZlUGF0dGVybnNbTWF0aC5hYnMoZGF0YVs1XSldLGRhdGFbNV0gPCAwLCBkYXRhWzZdLCBkYXRhWzddLGRhdGFbOF0gfHwgMCk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5jdXJyZW50SW5kZXgrKztcclxuICAgICAgaWYgKHRoaXMuY3VycmVudEluZGV4IDwgbGVuKSB7XHJcbiAgICAgICAgdGhpcy5uZXh0VGltZSA9IGN1cnJlbnRUaW1lICsgbW92ZVNlcXNbc2ZnLnN0YWdlLnByaXZhdGVOb11bdGhpcy5jdXJyZW50SW5kZXhdWzBdO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcbiAgLy8g44Ob44O844Og44Od44K444K344On44Oz44Gr5pW144GM44GZ44G544Gm5pW05YiX44GX44Gf44GL56K66KqN44GZ44KL44CCXHJcbiAgaWYgKHRoaXMuaG9tZUVuZW1pZXNDb3VudCA9PSB0aGlzLnRvdGFsRW5lbWllc0NvdW50ICYmIHRoaXMuc3RhdHVzID09IHRoaXMuU1RBUlQpIHtcclxuICAgIC8vIOaVtOWIl+OBl+OBpuOBhOOBn+OCieaVtOWIl+ODouODvOODieOBq+enu+ihjOOBmeOCi+OAglxyXG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLkhPTUU7XHJcbiAgICB0aGlzLmVuZFRpbWUgPSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lICsgMS4wICogKDIuMCAtIHNmZy5zdGFnZS5kaWZmaWN1bHR5KTtcclxuICB9XHJcblxyXG4gIC8vIOODm+ODvOODoOODneOCuOOCt+ODp+ODs+OBp+S4gOWumuaZgumWk+W+heapn+OBmeOCi1xyXG4gIGlmICh0aGlzLnN0YXR1cyA9PSB0aGlzLkhPTUUpIHtcclxuICAgIGlmIChzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lID4gdGhpcy5lbmRUaW1lKSB7XHJcbiAgICAgIHRoaXMuc3RhdHVzID0gdGhpcy5BVFRBQ0s7XHJcbiAgICAgIHRoaXMuZW5kVGltZSA9IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgKyAoc2ZnLnN0YWdlLkRJRkZJQ1VMVFlfTUFYIC0gc2ZnLnN0YWdlLmRpZmZpY3VsdHkpICogMztcclxuICAgICAgdGhpcy5ncm91cCA9IDA7XHJcbiAgICAgIHRoaXMuY291bnQgPSAwO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8g5pS75pKD44GZ44KLXHJcbiAgaWYgKHRoaXMuc3RhdHVzID09IHRoaXMuQVRUQUNLICYmIHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgPiB0aGlzLmVuZFRpbWUpIHtcclxuICAgIHRoaXMuZW5kVGltZSA9IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgKyAoc2ZnLnN0YWdlLkRJRkZJQ1VMVFlfTUFYIC0gc2ZnLnN0YWdlLmRpZmZpY3VsdHkpICogMztcclxuICAgIHZhciBncm91cERhdGEgPSB0aGlzLmdyb3VwRGF0YTtcclxuICAgIHZhciBhdHRhY2tDb3VudCA9ICgxICsgMC4yNSAqIChzZmcuc3RhZ2UuZGlmZmljdWx0eSkpIHwgMDtcclxuICAgIHZhciBncm91cCA9IGdyb3VwRGF0YVt0aGlzLmdyb3VwXTtcclxuXHJcbiAgICBpZiAoIWdyb3VwIHx8IGdyb3VwLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgIHRoaXMuZ3JvdXAgPSAwO1xyXG4gICAgICB2YXIgZ3JvdXAgPSBncm91cERhdGFbMF07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGdyb3VwLmxlbmd0aCA+IDAgJiYgZ3JvdXAubGVuZ3RoID4gZ3JvdXAuZ29uZUNvdW50KSB7XHJcbiAgICAgIGlmICghZ3JvdXAuaW5kZXgpIHtcclxuICAgICAgICBncm91cC5pbmRleCA9IDA7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCF0aGlzLmdyb3VwKSB7XHJcbiAgICAgICAgdmFyIGNvdW50ID0gMCwgZW5kZyA9IGdyb3VwLmxlbmd0aDtcclxuICAgICAgICB3aGlsZSAoY291bnQgPCBlbmRnICYmIGF0dGFja0NvdW50ID4gMCkge1xyXG4gICAgICAgICAgdmFyIGVuID0gZ3JvdXBbZ3JvdXAuaW5kZXhdO1xyXG4gICAgICAgICAgaWYgKGVuLmVuYWJsZV8gJiYgZW4uc3RhdHVzID09IGVuLkhPTUUpIHtcclxuICAgICAgICAgICAgZW4uc3RhdHVzID0gZW4uQVRUQUNLO1xyXG4gICAgICAgICAgICAtLWF0dGFja0NvdW50O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY291bnQrKztcclxuICAgICAgICAgIGdyb3VwLmluZGV4Kys7XHJcbiAgICAgICAgICBpZiAoZ3JvdXAuaW5kZXggPj0gZ3JvdXAubGVuZ3RoKSBncm91cC5pbmRleCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSBncm91cC5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgICAgICAgdmFyIGVuID0gZ3JvdXBbaV07XHJcbiAgICAgICAgICBpZiAoZW4uZW5hYmxlXyAmJiBlbi5zdGF0dXMgPT0gZW4uSE9NRSkge1xyXG4gICAgICAgICAgICBlbi5zdGF0dXMgPSBlbi5BVFRBQ0s7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5ncm91cCsrO1xyXG4gICAgaWYgKHRoaXMuZ3JvdXAgPj0gdGhpcy5ncm91cERhdGEubGVuZ3RoKSB7XHJcbiAgICAgIHRoaXMuZ3JvdXAgPSAwO1xyXG4gICAgfVxyXG5cclxuICB9XHJcblxyXG4gIC8vIOODm+ODvOODoOODneOCuOOCt+ODp+ODs+OBp+OBruW+heapn+WLleS9nFxyXG4gIHRoaXMuaG9tZURlbHRhQ291bnQgKz0gMC4wMjU7XHJcbiAgdGhpcy5ob21lRGVsdGEgPSBNYXRoLnNpbih0aGlzLmhvbWVEZWx0YUNvdW50KSAqIDAuMDg7XHJcbiAgdGhpcy5ob21lRGVsdGEyID0gMS4wICsgTWF0aC5zaW4odGhpcy5ob21lRGVsdGFDb3VudCAqIDgpICogMC4xO1xyXG5cclxufVxyXG5cclxuRW5lbWllcy5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHRoaXMuZW5lbWllcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgdmFyIGVuID0gdGhpcy5lbmVtaWVzW2ldO1xyXG4gICAgaWYgKGVuLmVuYWJsZV8pXHJcbiAgICB7XHJcbiAgICAgIHNmZy50YXNrcy5yZW1vdmVUYXNrKGVuLnRhc2suaW5kZXgpO1xyXG4gICAgICBlbi5zdGF0dXMgPSBlbi5OT05FO1xyXG4gICAgICBlbi5lbmFibGVfID0gZmFsc2U7XHJcbiAgICAgIGVuLm1lc2gudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuRW5lbWllcy5wcm90b3R5cGUuY2FsY0VuZW1pZXNDb3VudCA9IGZ1bmN0aW9uICgpIHtcclxuICB2YXIgc2VxcyA9IHRoaXMubW92ZVNlcXNbc2ZnLnN0YWdlLnByaXZhdGVOb107XHJcbiAgdGhpcy50b3RhbEVuZW1pZXNDb3VudCA9IDA7XHJcbiAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHNlcXMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgIGlmIChzZXFzW2ldWzddKSB7XHJcbiAgICAgIHRoaXMudG90YWxFbmVtaWVzQ291bnQrKztcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbkVuZW1pZXMucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24gKCkge1xyXG4gIHRoaXMubmV4dFRpbWUgPSAwO1xyXG4gIHRoaXMuY3VycmVudEluZGV4ID0gMDtcclxuICB0aGlzLnRvdGFsRW5lbWllc0NvdW50ID0gMDtcclxuICB0aGlzLmhpdEVuZW1pZXNDb3VudCA9IDA7XHJcbiAgdGhpcy5ob21lRW5lbWllc0NvdW50ID0gMDtcclxuICB0aGlzLnN0YXR1cyA9IHRoaXMuU1RBUlQ7XHJcbiAgdmFyIGdyb3VwRGF0YSA9IHRoaXMuZ3JvdXBEYXRhO1xyXG4gIGZvciAodmFyIGkgPSAwLCBlbmQgPSBncm91cERhdGEubGVuZ3RoOyBpIDwgZW5kIDsgKytpKSB7XHJcbiAgICBncm91cERhdGFbaV0ubGVuZ3RoID0gMDtcclxuICAgIGdyb3VwRGF0YVtpXS5nb25lQ291bnQgPSAwO1xyXG4gIH1cclxufVxyXG5cclxuRW5lbWllcy5wcm90b3R5cGUubW92ZVBhdHRlcm5zID0gW1xyXG4gIC8vIDBcclxuICBbXHJcbiAgICBuZXcgQ2lyY2xlTW92ZShNYXRoLlBJLCAxLjEyNSAqIE1hdGguUEksIDMwMCwgMywgdHJ1ZSksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgxLjEyNSAqIE1hdGguUEksIDEuMjUgKiBNYXRoLlBJLCAyMDAsIDMsIHRydWUpLFxyXG4gICAgbmV3IEZpcmUoKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKE1hdGguUEkgLyA0LCAtMyAqIE1hdGguUEksIDQwLCA1LCBmYWxzZSksXHJcbiAgICBuZXcgR290b0hvbWUoKSxcclxuICAgIG5ldyBIb21lTW92ZSgpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoTWF0aC5QSSwwLDEwLDMsZmFsc2UpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMCwtMC4xMjUgKiBNYXRoLlBJLDIwMCwzLGZhbHNlKSxcclxuICAgIG5ldyBGaXJlKCksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgtMC4xMjUgKiBNYXRoLlBJLCAtMC4yNSAqIE1hdGguUEksIDE1MCwgMi41LCBmYWxzZSksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgzICogTWF0aC5QSSAvIDQsNCAqIE1hdGguUEksNDAsMi41LHRydWUpLFxyXG4gICAgbmV3IEdvdG8oNClcclxuXSwvLyAxXHJcbiAgW1xyXG4gICAgbmV3IENpcmNsZU1vdmUoTWF0aC5QSSwgMS4xMjUgKiBNYXRoLlBJLCAzMDAsIDUsIHRydWUpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMS4xMjUgKiBNYXRoLlBJLCAxLjI1ICogTWF0aC5QSSwgMjAwLCA1LCB0cnVlKSxcclxuICAgIG5ldyBGaXJlKCksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZShNYXRoLlBJIC8gNCwgLTMgKiBNYXRoLlBJLCA0MCwgNiwgZmFsc2UpLFxyXG4gICAgbmV3IEdvdG9Ib21lKCksXHJcbiAgICBuZXcgSG9tZU1vdmUoKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKE1hdGguUEksMCwxMCwzLGZhbHNlKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDAsLTAuMTI1ICogTWF0aC5QSSwyMDAsMyxmYWxzZSksXHJcbiAgICBuZXcgRmlyZSgpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoLTAuMTI1ICogTWF0aC5QSSwgLTAuMjUgKiBNYXRoLlBJLCAyNTAsIDMsIGZhbHNlKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDMgKiBNYXRoLlBJIC8gNCwgNCAqIE1hdGguUEksIDQwLCAzLCB0cnVlKSxcclxuICAgIG5ldyBHb3RvKDQpXHJcbiAgXSwvLyAyXHJcbiAgW1xyXG4gICAgbmV3IENpcmNsZU1vdmUoMCwgLTAuMTI1ICogTWF0aC5QSSwgMzAwLCAzLCBmYWxzZSksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgtMC4xMjUgKiBNYXRoLlBJLCAtMC4yNSAqIE1hdGguUEksIDIwMCwgMywgZmFsc2UpLFxyXG4gICAgbmV3IEZpcmUoKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDMgKiBNYXRoLlBJIC8gNCwgKDIgKyAwLjI1KSAqIE1hdGguUEksIDQwLCA1LCB0cnVlKSxcclxuICAgIG5ldyBHb3RvSG9tZSgpLFxyXG4gICAgbmV3IEhvbWVNb3ZlKCksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgwLE1hdGguUEksMTAsMyx0cnVlKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKCBNYXRoLlBJLCAxLjEyNSAqIE1hdGguUEksIDIwMCwgMywgdHJ1ZSksXHJcbiAgICBuZXcgRmlyZSgpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMS4xMjUgKiBNYXRoLlBJLCAxLjI1ICogTWF0aC5QSSwgMTUwLCAyLjUsIHRydWUpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMC4yNSAqIE1hdGguUEksLTMgKiBNYXRoLlBJLDQwLDIuNSxmYWxzZSksXHJcbiAgICBuZXcgR290byg0KVxyXG4gIF0sLy8gM1xyXG4gIFtcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDAsIC0wLjEyNSAqIE1hdGguUEksIDMwMCwgNSwgZmFsc2UpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoLTAuMTI1ICogTWF0aC5QSSwgLTAuMjUgKiBNYXRoLlBJLCAyMDAsIDUsIGZhbHNlKSxcclxuICAgIG5ldyBGaXJlKCksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgzICogTWF0aC5QSSAvIDQsICg0ICsgMC4yNSkgKiBNYXRoLlBJLCA0MCwgNiwgdHJ1ZSksXHJcbiAgICBuZXcgRmlyZSgpLFxyXG4gICAgbmV3IEdvdG9Ib21lKCksXHJcbiAgICBuZXcgSG9tZU1vdmUoKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDAsTWF0aC5QSSwxMCwzLHRydWUpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoIE1hdGguUEksIDEuMTI1ICogTWF0aC5QSSwgMjAwLCAzLCB0cnVlKSxcclxuICAgIG5ldyBGaXJlKCksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgxLjEyNSAqIE1hdGguUEksIDEuMjUgKiBNYXRoLlBJLCAxNTAsIDMsIHRydWUpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMC4yNSAqIE1hdGguUEksLTMgKiBNYXRoLlBJLDQwLDMsZmFsc2UpLFxyXG4gICAgbmV3IEdvdG8oNClcclxuICBdLFxyXG4gIFsgLy8gNFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMCwgLTAuMjUgKiBNYXRoLlBJLCAxNzYsIDQsIGZhbHNlKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDAuNzUgKiBNYXRoLlBJLCBNYXRoLlBJLCAxMTIsIDQsIHRydWUpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoTWF0aC5QSSwgMy4xMjUgKiBNYXRoLlBJLCA2NCwgNCwgdHJ1ZSksXHJcbiAgICBuZXcgR290b0hvbWUoKSxcclxuICAgIG5ldyBIb21lTW92ZSgpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMCwgMC4xMjUgKiBNYXRoLlBJLCAyNTAsIDMsIHRydWUpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMC4xMjUgKiBNYXRoLlBJLCBNYXRoLlBJLCA4MCwgMywgdHJ1ZSksXHJcbiAgICBuZXcgRmlyZSgpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoTWF0aC5QSSwgMS43NSAqIE1hdGguUEksIDUwLCAzLCB0cnVlKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDAuNzUgKiBNYXRoLlBJLCAwLjUgKiBNYXRoLlBJLCAxMDAsIDMsIGZhbHNlKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDAuNSAqIE1hdGguUEksIC0yICogTWF0aC5QSSwgMjAsIDMsIGZhbHNlKSxcclxuICAgIG5ldyBHb3RvKDMpXHJcbiAgXSxcclxuICBbLy8gNVxyXG4gICAgbmV3IENpcmNsZU1vdmUoMCwgLTAuMTI1ICogTWF0aC5QSSwgMzAwLCAzLCBmYWxzZSksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgtMC4xMjUgKiBNYXRoLlBJLCAtMC4yNSAqIE1hdGguUEksIDIwMCwgMywgZmFsc2UpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMyAqIE1hdGguUEkgLyA0LCAoMykgKiBNYXRoLlBJLCA0MCwgNSwgdHJ1ZSksXHJcbiAgICBuZXcgR290b0hvbWUoKSxcclxuICAgIG5ldyBIb21lTW92ZSgpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoTWF0aC5QSSwgMC44NzUgKiBNYXRoLlBJLCAyNTAsIDMsIGZhbHNlKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDAuODc1ICogTWF0aC5QSSwgMCwgODAsIDMsIGZhbHNlKSxcclxuICAgIG5ldyBGaXJlKCksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgwLCAtMC43NSAqIE1hdGguUEksIDUwLCAzLCBmYWxzZSksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgwLjI1ICogTWF0aC5QSSwgMC41ICogTWF0aC5QSSwgMTAwLCAzLCB0cnVlKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDAuNSAqIE1hdGguUEksIDMgKiBNYXRoLlBJLCAyMCwgMywgdHJ1ZSksXHJcbiAgICBuZXcgR290bygzKVxyXG4gIF0sXHJcbiAgWyAvLyA2IC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgxLjUgKiBNYXRoLlBJLCBNYXRoLlBJLCA5NiwgNCwgZmFsc2UpLFxyXG4vLyAgICBuZXcgTGluZU1vdmUoMC41ICogUEksNCw1MCksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgwLCAyICogTWF0aC5QSSwgNDgsIDQsIHRydWUpLFxyXG4gICAgLy9uZXcgQ2lyY2xlTW92ZSgwLCAyICogUEksIDU2LCAzLCB0cnVlKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKE1hdGguUEksIDAuNzUgKiBNYXRoLlBJLCAzMiwgNCwgZmFsc2UpLFxyXG4gIC8vICBuZXcgQ2lyY2xlTW92ZSgxLjUgKiBQSSwgMiAqIFBJLCAzMiwgMywgdHJ1ZSksXHJcbiAgICBuZXcgR290b0hvbWUoKSxcclxuICAgIG5ldyBIb21lTW92ZSgpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoTWF0aC5QSSwwLDEwLDMsZmFsc2UpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMCwtMC4xMjUgKiBNYXRoLlBJLDIwMCwzLGZhbHNlKSxcclxuICAgIG5ldyBGaXJlKCksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgtMC4xMjUgKiBNYXRoLlBJLCAtMC4yNSAqIE1hdGguUEksIDE1MCwgMi41LCBmYWxzZSksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgzICogTWF0aC5QSSAvIDQsNCAqIE1hdGguUEksNDAsMi41LHRydWUpLFxyXG4gICAgbmV3IEdvdG8oMylcclxuICBdLFxyXG4gIFsgLy8gNyAvLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgwLCAtMC4yNSAqIE1hdGguUEksIDE3NiwgNCwgZmFsc2UpLFxyXG4gICAgbmV3IEZpcmUoKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKDAuNzUgKiBNYXRoLlBJLCBNYXRoLlBJLCAxMTIsIDQsIHRydWUpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoTWF0aC5QSSwgMi4xMjUgKiBNYXRoLlBJLCA0OCwgNCwgdHJ1ZSksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgxLjEyNSAqIE1hdGguUEksICBNYXRoLlBJLCA0OCwgNCwgZmFsc2UpLFxyXG4gICAgbmV3IEdvdG9Ib21lKCksXHJcbiAgICBuZXcgSG9tZU1vdmUoKSxcclxuICAgIG5ldyBDaXJjbGVNb3ZlKE1hdGguUEksIDAsIDEwLCAzLCBmYWxzZSksXHJcbiAgICBuZXcgRmlyZSgpLFxyXG4gICAgbmV3IENpcmNsZU1vdmUoMCwgLTAuMTI1ICogTWF0aC5QSSwgMjAwLCAzLCBmYWxzZSksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgtMC4xMjUgKiBNYXRoLlBJLCAtMC4yNSAqIE1hdGguUEksIDE1MCwgMi41LCBmYWxzZSksXHJcbiAgICBuZXcgQ2lyY2xlTW92ZSgzICogTWF0aC5QSSAvIDQsIDQgKiBNYXRoLlBJLCA0MCwgMi41LCB0cnVlKSxcclxuICAgIG5ldyBHb3RvKDUpXHJcbiAgXVxyXG5dXHJcbjtcclxuRW5lbWllcy5wcm90b3R5cGUubW92ZVNlcXMgPSBbXHJcbiAgW1xyXG4gICAgLy8gKioqIFNUQUdFIDEgKioqIC8vXHJcbiAgICBbMC44LCA1NiwgMTc2LCA3NSwgNDAsIDcsIFpha28sIHRydWVdLFxyXG4gICAgWzAuMDgsIDU2LCAxNzYsIDM1LCA0MCwgNywgWmFrbywgdHJ1ZV0sXHJcbiAgICBbMC4wOCwgNTYsIDE3NiwgNTUsIDQwLCA3LCBaYWtvLCB0cnVlXSxcclxuICAgIFswLjA4LCA1NiwgMTc2LCAxNSwgNDAsIDcsIFpha28sIHRydWVdLFxyXG4gICAgWzAuMDgsIDU2LCAxNzYsIDc1LCAtMTIwLCA0LCBaYWtvLCB0cnVlXSxcclxuXHJcbiAgICBbMC44LCAtNTYsIDE3NiwgLTc1LCA0MCwgLTcsIFpha28sIHRydWVdLFxyXG4gICAgWzAuMDgsIC01NiwgMTc2LCAtMzUsIDQwLCAtNywgWmFrbywgdHJ1ZV0sXHJcbiAgICBbMC4wOCwgLTU2LCAxNzYsIC01NSwgNDAsIC03LCBaYWtvLCB0cnVlXSxcclxuICAgIFswLjA4LCAtNTYsIDE3NiwgLTE1LCA0MCwgLTcsIFpha28sIHRydWVdLFxyXG4gICAgWzAuMDgsIC01NiwgMTc2LCAtNzUsIC0xMjAsIC00LCBaYWtvLCB0cnVlXSxcclxuXHJcbi8qICAgIFswLjUsIDAsIDE3NiwgNzUsIDYwLCAwLCBaYWtvLCB0cnVlXSxcclxuICAgIFswLjA1LCAwLCAxNzYsIDM1LCA2MCwgMCwgWmFrbywgdHJ1ZV0sXHJcbiAgICBbMC4wNSwgMCwgMTc2LCA1NSwgNjAsIDAsIFpha28sIHRydWVdLFxyXG4gICAgWzAuMDUsIDAsIDE3NiwgMTUsIDYwLCAwLCBaYWtvLCB0cnVlXSxcclxuICAgIFswLjA1LCAwLCAxNzYsIDk1LCA2MCwgMCwgWmFrbywgdHJ1ZV0sKi9cclxuXHJcbiAgICBbMC44LCAxMjgsIC0xMjgsIDc1LCA2MCwgNiwgWmFrbywgdHJ1ZV0sXHJcbiAgICBbMC4wOCwgMTI4LCAtMTI4LCAzNSwgNjAsIDYsIFpha28sIHRydWVdLFxyXG4gICAgWzAuMDgsIDEyOCwgLTEyOCwgNTUsIDYwLCA2LCBaYWtvLCB0cnVlXSxcclxuICAgIFswLjA4LCAxMjgsIC0xMjgsIDE1LCA2MCwgNiwgWmFrbywgdHJ1ZV0sXHJcbiAgICBbMC4wOCwgMTI4LCAtMTI4LCA5NSwgNjAsIDYsIFpha28sIHRydWVdLFxyXG4vKlxyXG4gICAgWzAuNSwgMCwgMTc2LCAtNzUsIDYwLCAyLCBaYWtvLCB0cnVlXSxcclxuICAgIFswLjA1LCAwLCAxNzYsIC0zNSwgNjAsIDIsIFpha28sIHRydWVdLFxyXG4gICAgWzAuMDUsIDAsIDE3NiwgLTU1LCA2MCwgMiwgWmFrbywgdHJ1ZV0sXHJcbiAgICBbMC4wNSwgMCwgMTc2LCAtMTUsIDYwLCAyLCBaYWtvLCB0cnVlXSxcclxuICAgIFswLjA1LCAwLCAxNzYsIC05NSwgNjAsIDIsIFpha28sIHRydWVdLFxyXG4gICAgKi9cclxuXHJcbiAgICBbMC44LCAtMTI4LCAtMTI4LCAtNzUsIDYwLCAtNiwgWmFrbywgdHJ1ZV0sXHJcbiAgICBbMC4wOCwgLTEyOCwgLTEyOCwgLTM1LCA2MCwgLTYsIFpha28sIHRydWVdLFxyXG4gICAgWzAuMDgsIC0xMjgsIC0xMjgsIC01NSwgNjAsIC02LCBaYWtvLCB0cnVlXSxcclxuICAgIFswLjA4LCAtMTI4LCAtMTI4LCAtMTUsIDYwLCAtNiwgWmFrbywgdHJ1ZV0sXHJcbiAgICBbMC4wOCwgLTEyOCwgLTEyOCwgLTk1LCA2MCwgLTYsIFpha28sIHRydWVdLFxyXG5cclxuICAgIFswLjcsIDAsIDE3NiwgNzUsIDgwLCAxLCBaYWtvMSwgdHJ1ZV0sXHJcbiAgICBbMC4wNSwgMCwgMTc2LCAzNSwgODAsIDEsIFpha28xLCB0cnVlXSxcclxuICAgIFswLjA1LCAwLCAxNzYsIDU1LCA4MCwgMSwgWmFrbzEsIHRydWVdLFxyXG4gICAgWzAuMDUsIDAsIDE3NiwgMTUsIDgwLCAxLCBaYWtvMSwgdHJ1ZV0sXHJcbiAgICBbMC4wNSwgMCwgMTc2LCA5NSwgODAsIDEsIFpha28xLCB0cnVlXSxcclxuXHJcbiAgICBbMC43LCAwLCAxNzYsIC03NSwgODAsIDMsIFpha28xLCB0cnVlXSxcclxuICAgIFswLjA1LCAwLCAxNzYsIC0zNSwgODAsIDMsIFpha28xLCB0cnVlXSxcclxuICAgIFswLjA1LCAwLCAxNzYsIC01NSwgODAsIDMsIFpha28xLCB0cnVlXSxcclxuICAgIFswLjA1LCAwLCAxNzYsIC0xNSwgODAsIDMsIFpha28xLCB0cnVlXSxcclxuICAgIFswLjA1LCAwLCAxNzYsIC05NSwgODAsIDMsIFpha28xLCB0cnVlXSxcclxuXHJcbiAgICBbMC43LCAwLCAxNzYsIDg1LCAxMjAsIDEsIE1Cb3NzLCB0cnVlLDFdLFxyXG4gICAgWzAuMDUsIDAsIDE3NiwgOTUsIDEwMCwgMSwgWmFrbzEsIHRydWUsMV0sXHJcbiAgICBbMC4wNSwgMCwgMTc2LCA3NSwgMTAwLCAxLCBaYWtvMSwgdHJ1ZSwxXSxcclxuICAgIFswLjA1LCAwLCAxNzYsIDQ1LCAxMjAsIDEsIE1Cb3NzLCB0cnVlLDJdLFxyXG4gICAgWzAuMDUsIDAsIDE3NiwgNTUsIDEwMCwgMSwgWmFrbzEsIHRydWUsMl0sXHJcbiAgICBbMC4wNSwgMCwgMTc2LCAzNSwgMTAwLCAxLCBaYWtvMSwgdHJ1ZSwyXSxcclxuICAgIFswLjA1LCAwLCAxNzYsIDY1LCAxMjAsIDEsIE1Cb3NzLCB0cnVlXSxcclxuICAgIFswLjA1LCAwLCAxNzYsIDE1LCAxMDAsIDEsIFpha28xLCB0cnVlXSxcclxuICAgIFswLjA1LCAwLCAxNzYsIDI1LCAxMjAsIDEsIE1Cb3NzLCB0cnVlXSxcclxuXHJcbiAgICBbMC44LCAwLCAxNzYsIC04NSwgMTIwLCAzLCBNQm9zcywgdHJ1ZSwzXSxcclxuICAgIFswLjA1LCAwLCAxNzYsIC05NSwgMTAwLCAzLCBaYWtvMSwgdHJ1ZSwzXSxcclxuICAgIFswLjA1LCAwLCAxNzYsIC03NSwgMTAwLCAzLCBaYWtvMSwgdHJ1ZSwzXSxcclxuICAgIFswLjA1LCAwLCAxNzYsIC00NSwgMTIwLCAzLCBNQm9zcywgdHJ1ZSw0XSxcclxuICAgIFswLjA1LCAwLCAxNzYsIC01NSwgMTAwLCAzLCBaYWtvMSwgdHJ1ZSw0XSxcclxuICAgIFswLjA1LCAwLCAxNzYsIC0zNSwgMTAwLCAzLCBaYWtvMSwgdHJ1ZSw0XSxcclxuICAgIFswLjA1LCAwLCAxNzYsIC02NSwgMTIwLCAzLCBNQm9zcywgdHJ1ZV0sXHJcbiAgICBbMC4wNSwgMCwgMTc2LCAtMTUsIDEwMCwgMywgWmFrbzEsIHRydWVdLFxyXG4gICAgWzAuMDUsIDAsIDE3NiwgLTI1LCAxMjAsIDMsIE1Cb3NzLCB0cnVlXVxyXG5cclxuXHJcbiAgXVxyXG5dO1xyXG5cclxuRW5lbWllcy5wcm90b3R5cGUudG90YWxFbmVtaWVzQ291bnQgPSAwO1xyXG5FbmVtaWVzLnByb3RvdHlwZS5oaXRFbmVtaWVzQ291bnQgPSAwO1xyXG5FbmVtaWVzLnByb3RvdHlwZS5ob21lRW5lbWllc0NvdW50ID0gMDtcclxuRW5lbWllcy5wcm90b3R5cGUuaG9tZURlbHRhID0gMDtcclxuRW5lbWllcy5wcm90b3R5cGUuaG9tZURlbHRhQ291bnQgPSAwO1xyXG5FbmVtaWVzLnByb3RvdHlwZS5ob21lRGVsdGEyID0gMDtcclxuRW5lbWllcy5wcm90b3R5cGUuZ3JvdXBEYXRhID0gW107XHJcbkVuZW1pZXMucHJvdG90eXBlLk5PTkUgPSAwIHwgMDtcclxuRW5lbWllcy5wcm90b3R5cGUuU1RBUlQgPSAxIHwgMDtcclxuRW5lbWllcy5wcm90b3R5cGUuSE9NRSA9IDIgfCAwO1xyXG5FbmVtaWVzLnByb3RvdHlwZS5BVFRBQ0sgPSAzIHwgMDtcclxuXHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG4vL3ZhciBTVEFHRV9NQVggPSAxO1xyXG5pbXBvcnQgKiBhcyBzZmcgZnJvbSAnLi9nbG9iYWwnOyBcclxuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwnO1xyXG5pbXBvcnQgKiBhcyBhdWRpbyBmcm9tICcuL2F1ZGlvJztcclxuLy9pbXBvcnQgKiBhcyBzb25nIGZyb20gJy4vc29uZyc7XHJcbmltcG9ydCAqIGFzIGdyYXBoaWNzIGZyb20gJy4vZ3JhcGhpY3MnO1xyXG5pbXBvcnQgKiBhcyBpbyBmcm9tICcuL2lvJztcclxuaW1wb3J0ICogYXMgY29tbSBmcm9tICcuL2NvbW0nO1xyXG5pbXBvcnQgKiBhcyB0ZXh0IGZyb20gJy4vdGV4dCc7XHJcbmltcG9ydCAqIGFzIGdhbWVvYmogZnJvbSAnLi9nYW1lb2JqJztcclxuaW1wb3J0ICogYXMgbXlzaGlwIGZyb20gJy4vbXlzaGlwJztcclxuaW1wb3J0ICogYXMgZW5lbWllcyBmcm9tICcuL2VuZW1pZXMnO1xyXG5pbXBvcnQgKiBhcyBlZmZlY3RvYmogZnJvbSAnLi9lZmZlY3RvYmonO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNhbGNTY3JlZW5TaXplKCkge1xyXG4gICAgQ09OU09MRV9XSURUSCA9IHdpbmRvdy5pbm5lcldpZHRoO1xyXG4gICAgQ09OU09MRV9IRUlHSFQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcbiAgICBpZiAoQ09OU09MRV9XSURUSCA+PSBDT05TT0xFX0hFSUdIVCkge1xyXG4gICAgICAgIENPTlNPTEVfV0lEVEggPSBDT05TT0xFX0hFSUdIVCAqIHNmZy5WSVJUVUFMX1dJRFRIIC8gc2ZnLlZJUlRVQUxfSEVJR0hUO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBDT05TT0xFX0hFSUdIVCA9IENPTlNPTEVfV0lEVEggKiBzZmcuVklSVFVBTF9IRUlHSFQgLyBzZmcuVklSVFVBTF9XSURUSDtcclxuICAgIH1cclxufVxyXG5cclxudmFyIENPTlNPTEVfV0lEVEg7XHJcbnZhciBDT05TT0xFX0hFSUdIVDtcclxuXHJcbnZhciByZW5kZXJlcjtcclxudmFyIHN0YXRzO1xyXG52YXIgc2NlbmU7XHJcbnZhciBjYW1lcmE7XHJcbnZhciBhdXRob3I7XHJcbnZhciBwcm9ncmVzcztcclxudmFyIHRleHRQbGFuZTtcclxudmFyIGJhc2ljSW5wdXQgPSBuZXcgaW8uQmFzaWNJbnB1dCgpO1xyXG52YXIgdGFza3MgPSBuZXcgdXRpbC5UYXNrcygpO1xyXG5zZmcudGFza3MgPSB0YXNrcztcclxudmFyIHdhdmVHcmFwaDtcclxudmFyIHN0YXJ0ID0gZmFsc2U7XHJcbnZhciBiYXNlVGltZSA9ICtuZXcgRGF0ZTtcclxudmFyIGQgPSAtMC4yO1xyXG52YXIgYXVkaW9fO1xyXG52YXIgc2VxdWVuY2VyO1xyXG52YXIgcGlhbm87XHJcbnZhciBzY29yZSA9IDA7XHJcbnZhciBoaWdoU2NvcmUgPSAwO1xyXG52YXIgaGlnaFNjb3JlcyA9IFtdO1xyXG52YXIgaXNIaWRkZW4gPSBmYWxzZTtcclxuLy92YXIgc3RhZ2VObyA9IDE7XHJcbi8vdmFyIHNmZy5zdGFnZTtcclxuLy92YXIgc3RhZ2VTdGF0ZSA9IDtcclxudmFyIGVuZW1pZXNfO1xyXG52YXIgZW5lbXlCdWxsZXRzO1xyXG52YXIgUEkgPSBNYXRoLlBJO1xyXG52YXIgY29tbV87XHJcbnZhciBoYW5kbGVOYW1lID0gJyc7XHJcbnZhciBzdG9yYWdlO1xyXG52YXIgcmFuayA9IC0xO1xyXG52YXIgc291bmRFZmZlY3RzO1xyXG52YXIgZW5zO1xyXG52YXIgZW5icztcclxuXHJcbmZ1bmN0aW9uIFNjb3JlRW50cnkobmFtZSwgc2NvcmUpIHtcclxuICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gIHRoaXMuc2NvcmUgPSBzY29yZTtcclxufVxyXG5cclxuXHJcbmNsYXNzIFN0YWdlIHtcclxuICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgdGhpcy5NQVggPSAxO1xyXG4gICAgdGhpcy5ESUZGSUNVTFRZX01BWCA9IDIuMDtcclxuICAgIHRoaXMubm8gPSAxO1xyXG4gICAgdGhpcy5wcml2YXRlTm8gPSAwO1xyXG4gICAgdGhpcy5kaWZmaWN1bHR5ID0gMTtcclxuICB9XHJcbiAgcmVzZXQoKXtcclxuICAgIHRoaXMubm8gPSAxO1xyXG4gICAgdGhpcy5wcml2YXRlTm8gPSAwO1xyXG4gICAgdGhpcy5kaWZmaWN1bHR5ID0gMTtcclxuICB9XHJcbiAgYWR2YW5jZSgpe1xyXG4gICAgdGhpcy5ubysrO1xyXG4gICAgdGhpcy5wcml2YXRlTm8rKztcclxuXHJcbiAgICBpZiAodGhpcy5kaWZmaWN1bHR5IDwgdGhpcy5ESUZGSUNVTFRZX01BWCkge1xyXG4gICAgICB0aGlzLmRpZmZpY3VsdHkgKz0gMC4wNTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5wcml2YXRlTm8gPj0gdGhpcy5NQVgpIHtcclxuICAgICAgdGhpcy5wcml2YXRlTm8gPSAwO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLy8gaGlkZGVuIOODl+ODreODkeODhuOCo+OBiuOCiOOBs+WPr+imluaAp+OBruWkieabtOOCpOODmeODs+ODiOOBruWQjeWJjeOCkuioreWumlxyXG52YXIgaGlkZGVuLCB2aXNpYmlsaXR5Q2hhbmdlO1xyXG5pZiAodHlwZW9mIGRvY3VtZW50LmhpZGRlbiAhPT0gXCJ1bmRlZmluZWRcIikgeyAvLyBPcGVyYSAxMi4xMCDjgoQgRmlyZWZveCAxOCDku6XpmY3jgafjgrXjg53jg7zjg4ggXHJcbiAgaGlkZGVuID0gXCJoaWRkZW5cIjtcclxuICB2aXNpYmlsaXR5Q2hhbmdlID0gXCJ2aXNpYmlsaXR5Y2hhbmdlXCI7XHJcbn0gZWxzZSBpZiAodHlwZW9mIGRvY3VtZW50Lm1vekhpZGRlbiAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gIGhpZGRlbiA9IFwibW96SGlkZGVuXCI7XHJcbiAgdmlzaWJpbGl0eUNoYW5nZSA9IFwibW96dmlzaWJpbGl0eWNoYW5nZVwiO1xyXG59IGVsc2UgaWYgKHR5cGVvZiBkb2N1bWVudC5tc0hpZGRlbiAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gIGhpZGRlbiA9IFwibXNIaWRkZW5cIjtcclxuICB2aXNpYmlsaXR5Q2hhbmdlID0gXCJtc3Zpc2liaWxpdHljaGFuZ2VcIjtcclxufSBlbHNlIGlmICh0eXBlb2YgZG9jdW1lbnQud2Via2l0SGlkZGVuICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgaGlkZGVuID0gXCJ3ZWJraXRIaWRkZW5cIjtcclxuICB2aXNpYmlsaXR5Q2hhbmdlID0gXCJ3ZWJraXR2aXNpYmlsaXR5Y2hhbmdlXCI7XHJcbn1cclxuXHJcbi8vLyDjg5bjg6njgqbjgrbjga7mqZ/og73jg4Hjgqfjg4Pjgq9cclxuZnVuY3Rpb24gY2hlY2tCcm93c2VyU3VwcG9ydChvdXRwdXQpIHtcclxuICB2YXIgY29udGVudCA9ICc8aW1nIGNsYXNzPVwiZXJyb3JpbWdcIiBzcmM9XCJodHRwOi8vcHVibGljLmJsdS5saXZlZmlsZXN0b3JlLmNvbS95MnBiWTNhcUJ6Nnd6NGFoODdSWEVWazVDbGhEMkx1akM1TnM2NkhLdlI4OWFqckZkTE0wVHhGZXJZWVVSdDgzY19iZzM1SFNrcWMzRThHeGFGRDgtWDk0TUxzRlY1R1U2QllwMTk1SXZlZ2V2US8yMDEzMTAwMS5wbmc/cHNpZD0xXCIgd2lkdGg9XCI0NzlcIiBoZWlnaHQ9XCI2NDBcIiBjbGFzcz1cImFsaWdubm9uZVwiIC8+JztcclxuICAvLyBXZWJHTOOBruOCteODneODvOODiOODgeOCp+ODg+OCr1xyXG4gIGlmICghRGV0ZWN0b3Iud2ViZ2wpIHtcclxuICAgIGQzLnNlbGVjdCgnI2NvbnRlbnQnKS5hcHBlbmQoJ2RpdicpLmNsYXNzZWQoJ2Vycm9yJyx0cnVlKS5odG1sKFxyXG4gICAgICBjb250ZW50ICsgJzxwIGNsYXNzPVwiZXJyb3J0ZXh0XCI+44OW44Op44Km44K244GMPGJyLz5XZWJHTOOCkuOCteODneODvOODiOOBl+OBpuOBhOOBquOBhOOBn+OCgTxici8+5YuV5L2c44GE44Gf44GX44G+44Gb44KT44CCPC9wPicpO1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLy8gV2ViIEF1ZGlvIEFQSeODqeODg+ODkeODvFxyXG4gIGlmICghYXVkaW9fLmVuYWJsZSkge1xyXG4gICAgZDMuc2VsZWN0KCcjY29udGVudCcpLmFwcGVuZCgnZGl2JykuY2xhc3NlZCgnZXJyb3InLHRydWUpLmh0bWwoXHJcbiAgICAgIGNvbnRlbnQgKyAnPHAgY2xhc3M9XCJlcnJvcnRleHRcIj7jg5bjg6njgqbjgrbjgYw8YnIvPldlYiBBdWRpbyBBUEnjgpLjgrXjg53jg7zjg4jjgZfjgabjgYTjgarjgYTjgZ/jgoE8YnIvPuWLleS9nOOBhOOBn+OBl+OBvuOBm+OCk+OAgjwvcD4nKTtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8vIOODluODqeOCpuOCtuOBjFBhZ2UgVmlzaWJpbGl0eSBBUEkg44KS44K144Od44O844OI44GX44Gq44GE5aC05ZCI44Gr6K2m5ZGKIFxyXG4gIGlmICh0eXBlb2YgaGlkZGVuID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgZDMuc2VsZWN0KCcjY29udGVudCcpLmFwcGVuZCgnZGl2JykuY2xhc3NlZCgnZXJyb3InLHRydWUpLmh0bWwoXHJcbiAgICAgIGNvbnRlbnQgKyAnPHAgY2xhc3M9XCJlcnJvcnRleHRcIj7jg5bjg6njgqbjgrbjgYw8YnIvPlBhZ2UgVmlzaWJpbGl0eSBBUEnjgpLjgrXjg53jg7zjg4jjgZfjgabjgYTjgarjgYTjgZ/jgoE8YnIvPuWLleS9nOOBhOOBn+OBl+OBvuOBm+OCk+OAgjwvcD4nKTtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIGlmICh0eXBlb2YgbG9jYWxTdG9yYWdlID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgZDMuc2VsZWN0KCcjY29udGVudCcpLmFwcGVuZCgnZGl2JykuY2xhc3NlZCgnZXJyb3InLHRydWUpLmh0bWwoXHJcbiAgICAgIGNvbnRlbnQgKyAnPHAgY2xhc3M9XCJlcnJvcnRleHRcIj7jg5bjg6njgqbjgrbjgYw8YnIvPldlYiBMb2NhbCBTdG9yYWdl44KS44K144Od44O844OI44GX44Gm44GE44Gq44GE44Gf44KBPGJyLz7li5XkvZzjgYTjgZ/jgZfjgb7jgZvjgpPjgII8L3A+Jyk7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfSBlbHNlIHtcclxuICAgIHN0b3JhZ2UgPSBsb2NhbFN0b3JhZ2U7XHJcbiAgfVxyXG4gIHJldHVybiB0cnVlO1xyXG59XHJcblxyXG4vLy8g44Kz44Oz44K944O844Or55S76Z2i44Gu5Yid5pyf5YyWXHJcbmZ1bmN0aW9uIGluaXRDb25zb2xlKCkge1xyXG4gIC8vIOODrOODs+ODgOODqeODvOOBruS9nOaIkFxyXG4gIHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoeyBhbnRpYWxpYXM6IGZhbHNlLHNvcnRPYmplY3RzOiB0cnVlIH0pO1xyXG4gIGNhbGNTY3JlZW5TaXplKCk7XHJcbiAgcmVuZGVyZXIuc2V0U2l6ZShDT05TT0xFX1dJRFRILCBDT05TT0xFX0hFSUdIVCk7XHJcbiAgcmVuZGVyZXIuc2V0Q2xlYXJDb2xvcigwLDEpO1xyXG4gIHJlbmRlcmVyLmRvbUVsZW1lbnQuaWQgPSAnY29uc29sZSc7XHJcbiAgcmVuZGVyZXIuZG9tRWxlbWVudC5jbGFzc05hbWUgPSAnY29uc29sZSc7XHJcbiAgcmVuZGVyZXIuZG9tRWxlbWVudC5zdHlsZS56SW5kZXggPSAwO1xyXG5cclxuICBkMy5zZWxlY3QoJyNjb250ZW50Jykubm9kZSgpLmFwcGVuZENoaWxkKHJlbmRlcmVyLmRvbUVsZW1lbnQpO1xyXG5cclxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICBjYWxjU2NyZWVuU2l6ZSgpO1xyXG4gICAgICByZW5kZXJlci5zZXRTaXplKENPTlNPTEVfV0lEVEgsIENPTlNPTEVfSEVJR0hUKTtcclxuICB9KTtcclxuICAvLyBTdGF0cyDjgqrjg5bjgrjjgqfjgq/jg4goRlBT6KGo56S6KeOBruS9nOaIkOihqOekulxyXG4gIHN0YXRzID0gbmV3IFN0YXRzKCk7XHJcbiAgc3RhdHMuZG9tRWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XHJcbiAgc3RhdHMuZG9tRWxlbWVudC5zdHlsZS50b3AgPSAnMHB4JztcclxuICBkMy5zZWxlY3QoJyNjb250ZW50Jykubm9kZSgpLmFwcGVuZENoaWxkKHN0YXRzLmRvbUVsZW1lbnQpO1xyXG4gIHN0YXRzLmRvbUVsZW1lbnQuc3R5bGUubGVmdCA9IHJlbmRlcmVyLmRvbUVsZW1lbnQuc3R5bGUubGVmdDtcclxuXHJcbiAgLy8yROaPj+eUu+OCs+ODs+ODhuOCreOCueODiOOBruihqOekulxyXG5cclxuICAvKiAgICAgIGN0eCA9ICQoJyNpbmZvLWRpc3BsYXknKS5jc3MoJ3otaW5kZXgnLCAyKTtcclxuICAgICAgICBjdHggPSAkKCcjaW5mby1kaXNwbGF5JylbMF0uZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgICAgICBjdHguc2V0VHJhbnNmb3JtKDEsIDAsIDAsIDEsIDAsIDApO1xyXG4gICAgICAgIGN0eC5mb250ID0gXCIxMnB4ICfvvK3vvLMg44K044K344OD44KvJ1wiOyovXHJcblxyXG5cclxuICAvLyDjgrfjg7zjg7Pjga7kvZzmiJBcclxuICBzY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xyXG5cclxuICAvLyDjgqvjg6Hjg6njga7kvZzmiJBcclxuICBjYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoOTAuMCwgc2ZnLlZJUlRVQUxfV0lEVEggLyBzZmcuVklSVFVBTF9IRUlHSFQpO1xyXG4gIGNhbWVyYS5wb3NpdGlvbi56ID0gc2ZnLlZJUlRVQUxfSEVJR0hUIC8gMjtcclxuICBjYW1lcmEubG9va0F0KG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApKTtcclxuXHJcbiAgLy92YXIgY2FtZXJhID0gbmV3IFRIUkVFLkNhbWVyYSgpO1xyXG4gIC8vY2FtZXJhLnBvc2l0aW9uLnogPSAxLjA7XHJcblxyXG4gIC8vIOODqeOCpOODiOOBruS9nOaIkFxyXG4gIC8vdmFyIGxpZ2h0ID0gbmV3IFRIUkVFLkRpcmVjdGlvbmFsTGlnaHQoMHhmZmZmZmYpO1xyXG4gIC8vbGlnaHQucG9zaXRpb24gPSBuZXcgVEhSRUUuVmVjdG9yMygwLjU3NywgMC41NzcsIDAuNTc3KTtcclxuICAvL3NjZW5lLmFkZChsaWdodCk7XHJcblxyXG4gIC8vdmFyIGFtYmllbnQgPSBuZXcgVEhSRUUuQW1iaWVudExpZ2h0KDB4ZmZmZmZmKTtcclxuICAvL3NjZW5lLmFkZChhbWJpZW50KTtcclxuICByZW5kZXJlci5jbGVhcigpO1xyXG59XHJcblxyXG4vLy8g44Ko44Op44O844Gn57WC5LqG44GZ44KL44CCXHJcbmZ1bmN0aW9uIEV4aXRFcnJvcihlKSB7XHJcbiAgLy9jdHguZmlsbFN0eWxlID0gXCJyZWRcIjtcclxuICAvL2N0eC5maWxsUmVjdCgwLCAwLCBDT05TT0xFX1dJRFRILCBDT05TT0xFX0hFSUdIVCk7XHJcbiAgLy9jdHguZmlsbFN0eWxlID0gXCJ3aGl0ZVwiO1xyXG4gIC8vY3R4LmZpbGxUZXh0KFwiRXJyb3IgOiBcIiArIGUsIDAsIDIwKTtcclxuICAvLy8vYWxlcnQoZSk7XHJcbiAgc3RhcnQgPSBmYWxzZTtcclxuICB0aHJvdyBlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBvblZpc2liaWxpdHlDaGFuZ2UoKVxyXG57XHJcbiAgdmFyIGggPSBkb2N1bWVudFtoaWRkZW5dO1xyXG4gIGlzSGlkZGVuID0gaDtcclxuICBpZiAoaCkge1xyXG4gICAgaWYoc2ZnLmdhbWVUaW1lci5zdGF0dXMgPT0gc2ZnLmdhbWVUaW1lci5TVEFSVClcclxuICAgIHtcclxuICAgICAgc2ZnLmdhbWVUaW1lci5wYXVzZSgpO1xyXG4gICAgICBjb25zb2xlLmxvZyhzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lKTtcclxuICAgIH1cclxuICAgIGlmIChzZXF1ZW5jZXIuc3RhdHVzID09IHNlcXVlbmNlci5QTEFZKSB7XHJcbiAgICAgIHNlcXVlbmNlci5wYXVzZSgpO1xyXG4gICAgfVxyXG4gICAgLy9kb2N1bWVudC50aXRsZSA9ICcoUGF1c2UpIEdhbGF4eSBGaWdodCBHYW1lICc7XHJcbiAgfSBlbHNlIHtcclxuICAgIGlmIChzZmcuZ2FtZVRpbWVyLnN0YXR1cyA9PSBzZmcuZ2FtZVRpbWVyLlBBVVNFKSB7XHJcbiAgICAgIHNmZy5nYW1lVGltZXIucmVzdW1lKCk7XHJcbiAgICAgIGNvbnNvbGUubG9nKHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUpO1xyXG4gICAgfVxyXG4gICAgaWYgKHNlcXVlbmNlci5zdGF0dXMgPT0gc2VxdWVuY2VyLlBBVVNFKSB7XHJcbiAgICAgIHNlcXVlbmNlci5yZXN1bWUoKTtcclxuICAgIH1cclxuICAgIC8vZG9jdW1lbnQudGl0bGUgPSAnR2FsYXh5IEZpZ2h0IEdhbWUgJztcclxuICAgIC8vZ2FtZSgpO1xyXG4gIH1cclxufVxyXG4vLy8g54++5Zyo5pmC6ZaT44Gu5Y+W5b6XXHJcbmZ1bmN0aW9uIGdldEN1cnJlbnRUaW1lKCkge1xyXG4gIHJldHVybiBhdWRpb18uYXVkaW9jdHguY3VycmVudFRpbWU7XHJcbn1cclxuXHJcblxyXG4vLy8g44Oh44Kk44OzXHJcbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcblxyXG4gIGF1ZGlvXyA9IG5ldyBhdWRpby5BdWRpbygpO1xyXG5cclxuICBpZiAoIWNoZWNrQnJvd3NlclN1cHBvcnQoJyNjb250ZW50JykpIHtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIHNlcXVlbmNlciA9IG5ldyBhdWRpby5TZXF1ZW5jZXIoYXVkaW9fKTtcclxuICAvL3BpYW5vID0gbmV3IGF1ZGlvLlBpYW5vKGF1ZGlvXyk7XHJcbiAgc291bmRFZmZlY3RzID0gbmV3IGF1ZGlvLlNvdW5kRWZmZWN0cyhzZXF1ZW5jZXIpO1xyXG5cclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKHZpc2liaWxpdHlDaGFuZ2UsIG9uVmlzaWJpbGl0eUNoYW5nZSwgZmFsc2UpO1xyXG4gIHNmZy5nYW1lVGltZXIgPSBuZXcgdXRpbC5HYW1lVGltZXIoZ2V0Q3VycmVudFRpbWUpO1xyXG5cclxuICAvLy8g44Ky44O844Og44Kz44Oz44K944O844Or44Gu5Yid5pyf5YyWXHJcbiAgaW5pdENvbnNvbGUoKTtcclxuICAvLyDjgq3jg7zlhaXlipvlh6bnkIbjga7oqK3lrpogLy9cclxuICAvL2QzLnNlbGVjdCgnYm9keScpLm9uKCdrZXlkb3duJyxmdW5jdGlvbiAoKSB7IHJldHVybiBiYXNpY0lucHV0LmtleWRvd24oZDMuZXZlbnQpOyB9KTtcclxuICAvL2QzLnNlbGVjdCgnYm9keScpLm9uKCdrZXl1cCcsZnVuY3Rpb24gKCkgeyByZXR1cm4gYmFzaWNJbnB1dC5rZXl1cChkMy5ldmVudCk7IH0pO1xyXG5cclxuICAvLy8g44Ky44O844Og5Lit44Gu44OG44Kv44K544OB44Oj44O85a6a576pXHJcbiAgdmFyIHRleHR1cmVzID0ge1xyXG4gICAgZm9udDogJ0ZvbnQucG5nJyxcclxuICAgIGZvbnQxOidGb250Mi5wbmcnLFxyXG4gICAgYXV0aG9yOidhdXRob3IucG5nJyxcclxuICAgIHRpdGxlOiAnVElUTEUucG5nJyxcclxuICAgIG15c2hpcDonbXlzaGlwMi5wbmcnLFxyXG4gICAgZW5lbXk6J2VuZW15LnBuZycsXHJcbiAgICBib21iOidib21iLnBuZydcclxuICB9O1xyXG4gIC8vLyDjg4bjgq/jgrnjg4Hjg6Pjg7zjga7jg63jg7zjg4lcclxuICBcclxuICB2YXIgbG9hZFByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoKTtcclxuICB2YXIgbG9hZGVyID0gbmV3IFRIUkVFLlRleHR1cmVMb2FkZXIoKTtcclxuICBmdW5jdGlvbiBsb2FkVGV4dHVyZShzcmMpXHJcbiAge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLHJlamVjdCk9PntcclxuICAgICAgbG9hZGVyLmxvYWQoc3JjLCh0ZXh0dXJlKT0+e1xyXG4gICAgICAgIHRleHR1cmUubWFnRmlsdGVyID0gVEhSRUUuTmVhcmVzdEZpbHRlcjtcclxuICAgICAgICB0ZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLkxpbmVhck1pcE1hcExpbmVhckZpbHRlcjtcclxuICAgICAgICByZXNvbHZlKHRleHR1cmUpO1xyXG4gICAgICB9LG51bGwsKHhocik9PntyZWplY3QoeGhyKX0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIFxyXG4gIHZhciB0ZXhMZW5ndGggPSBPYmplY3Qua2V5cyh0ZXh0dXJlcykubGVuZ3RoO1xyXG4gIHZhciB0ZXhDb3VudCA9IDA7IFxyXG4gIHByb2dyZXNzID0gbmV3IGdyYXBoaWNzLlByb2dyZXNzKCk7XHJcbiAgcHJvZ3Jlc3MubWVzaC5wb3NpdGlvbi56ID0gMC4wMDE7XHJcbiAgcHJvZ3Jlc3MucmVuZGVyKCdMb2FkaW5nIFJlc291Y2VzIC4uLicsIDApO1xyXG4gIHNjZW5lLmFkZChwcm9ncmVzcy5tZXNoKTtcclxuICBmb3IodmFyIG4gaW4gdGV4dHVyZXMpe1xyXG4gICAgKChuYW1lLHRleFBhdGgpPT57XHJcbiAgICAgIGxvYWRQcm9taXNlID0gbG9hZFByb21pc2VcclxuICAgICAgLnRoZW4oKCk9PntcclxuICAgICAgICByZXR1cm4gbG9hZFRleHR1cmUoJy4vcmVzLycgKyB0ZXhQYXRoKTsgICAgICBcclxuICAgICAgfSlcclxuICAgICAgLnRoZW4oKHRleCk9PntcclxuICAgICAgICB0ZXhDb3VudCsrO1xyXG4gICAgICAgIHByb2dyZXNzLnJlbmRlcignTG9hZGluZyBSZXNvdWNlcyAuLi4nLCAodGV4Q291bnQgLyB0ZXhMZW5ndGggKiAxMDApIHwgMCk7ICAgICAgICBcclxuICAgICAgICBzZmcudGV4dHVyZUZpbGVzW25hbWVdID0gdGV4O1xyXG4gICAgICAgIHJlbmRlcmVyLnJlbmRlcihzY2VuZSwgY2FtZXJhKTtcclxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSkobix0ZXh0dXJlc1tuXSk7XHJcbiAgfVxyXG4gIFxyXG4gIGxvYWRQcm9taXNlLnRoZW4oKCk9PntcclxuICAgIHNjZW5lLnJlbW92ZShwcm9ncmVzcy5tZXNoKTtcclxuICAgIHJlbmRlcmVyLnJlbmRlcihzY2VuZSwgY2FtZXJhKTtcclxuICAgIHRhc2tzLmNsZWFyKCk7XHJcbiAgICB0YXNrcy5wdXNoVGFzayhpbml0KTtcclxuICAgIHRhc2tzLnB1c2hUYXNrKHJlbmRlciwxMDAwMDApO1xyXG4gICAgc3RhcnQgPSB0cnVlO1xyXG4gICAgZ2FtZSgpO1xyXG4gIH0pO1xyXG4gIFxyXG4gIC8vIHZhciB0ZXhMb2FkZXIgPSBmdW5jdGlvbihzcmMpe1xyXG4gIC8vICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUscmVqZWN0KXtcclxuICAvLyAgICAgXHJcbiAgLy8gICB9KTtcclxuICAvLyB9XHJcbiAgLy8gZm9yKHZhciBwIGluIHRleHR1cmVzKXtcclxuICAvLyAgIHZcclxuICAvLyB9XHJcbiAgXHJcbiAgLy8gKGZ1bmN0aW9uICgpIHtcclxuICAvLyAgIHByb2dyZXNzID0gbmV3IGdyYXBoaWNzLlByb2dyZXNzKCk7XHJcbiAgLy8gICBwcm9ncmVzcy5tZXNoLnBvc2l0aW9uLnogPSAwLjAwMTtcclxuICAvLyAgIHByb2dyZXNzLnJlbmRlcignTG9hZGluZyBSZXNvdWNlcyAuLi4nLCAwKTtcclxuICAvLyAgIHNjZW5lLmFkZChwcm9ncmVzcy5tZXNoKTtcclxuICAvLyAgIGZ1bmN0aW9uIGxvYWRSZXNvdWNlcygpIHtcclxuICAvLyAgICAgcmVuZGVyZXIucmVuZGVyKHNjZW5lLCBjYW1lcmEpO1xyXG4gIC8vICAgICBpZiAoc2ZnLnRleHR1cmVGaWxlcy5sb2FkQ29tcGxldGVkQ291bnQgPT0gc2ZnLnRleHR1cmVGaWxlcy50b3RhbFRleHR1cmVDb3VudClcclxuICAvLyAgICAge1xyXG4gIC8vICAgICAgIHNjZW5lLnJlbW92ZShwcm9ncmVzcy5tZXNoKTtcclxuICAvLyAgICAgICAvL3Byb2dyZXNzLnJlbmRlcignTG9hZGluZyBDb21wbGV0ZS4nLCAxMDApO1xyXG4gIC8vICAgICB9IGVsc2Uge1xyXG4gIC8vICAgICAgIHByb2dyZXNzLnJlbmRlcignTG9hZGluZyBSZXNvdWNlcyAuLi4nLCAodGV4dHVyZUZpbGVzLmxvYWRDb21wbGV0ZWRDb3VudCAvIHRleHR1cmVGaWxlcy50b3RhbFRleHR1cmVDb3VudCAqIDEwMCkgfCAwKTtcclxuICAvLyAgICAgICB3aW5kb3cuc2V0VGltZW91dChsb2FkUmVzb3VyY2VzLCAxMDApO1xyXG4gIC8vICAgICB9XHJcbiAgLy8gICB9XHJcbiAgLy8gICBsb2FkUmVzb3VjZXMoKTtcclxuICAvLyB9XHJcbiAgLy8gKSgpO1xyXG5cclxuXHJcbn07XHJcblxyXG4vLy8g44Ky44O844Og44Oh44Kk44OzXHJcbmZ1bmN0aW9uIGdhbWUoKSB7XHJcbiAgLy8g44K/44K544Kv44Gu5ZG844Gz5Ye644GXXHJcbiAgLy8g44Oh44Kk44Oz44Gr5o+P55S7XHJcbiAgaWYgKHN0YXJ0KSB7XHJcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZ2FtZSk7XHJcbiAgfVxyXG5cclxuICAgIGlmICghaXNIaWRkZW4pIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICB0YXNrcy5jaGVja1NvcnQoKTtcclxuICAgICAgICB2YXIgYXJyID0gdGFza3MuZ2V0QXJyYXkoKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMCA7IGkgPCBhcnIubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgIHZhciB0YXNrID0gYXJyW2ldO1xyXG4gICAgICAgICAgaWYgKHRhc2sgIT0gdXRpbC5udWxsVGFzaykge1xyXG4gICAgICAgICAgICB0YXNrLmZ1bmModGFzay5pbmRleCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRhc2tzLmNvbXByZXNzKCk7XHJcbiAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICBFeGl0RXJyb3IoZSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbmZ1bmN0aW9uIHJlbmRlcih0YXNrSW5kZXgpIHtcclxuICAgIHJlbmRlcmVyLnJlbmRlcihzY2VuZSwgY2FtZXJhKTtcclxuICAgIHRleHRQbGFuZS5yZW5kZXIoKTtcclxuICAgIHN0YXRzLnVwZGF0ZSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0KHRhc2tJbmRleCkge1xyXG5cclxuICBzY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xyXG4gIGVuZW15QnVsbGV0cyA9IG5ldyBlbmVtaWVzLkVuZW15QnVsbGV0cyhzY2VuZSxzZSk7XHJcbiAgZW5lbWllc18gPSBuZXcgZW5lbWllcy5FbmVtaWVzKHNjZW5lLHNlLGVuZW15QnVsbGV0cyk7XHJcbiAgc2ZnLmJvbWJzID0gbmV3IGVmZmVjdG9iai5Cb21icyhzY2VuZSxzZSk7XHJcbiAgc2ZnLnN0YWdlID0gbmV3IFN0YWdlKCk7XHJcbiAgc3BhY2VGaWVsZCA9IG51bGw7XHJcblxyXG4gIC8vIOODj+ODs+ODieODq+ODjeODvOODoOOBruWPluW+l1xyXG4gIGhhbmRsZU5hbWUgPSBzdG9yYWdlLmdldEl0ZW0oJ2hhbmRsZU5hbWUnKSA7XHJcblxyXG4gIHRleHRQbGFuZSA9IG5ldyB0ZXh0LlRleHRQbGFuZShzY2VuZSk7XHJcbiAvLyB0ZXh0UGxhbmUucHJpbnQoMCwgMCwgXCJXZWIgQXVkaW8gQVBJIFRlc3RcIiwgbmV3IFRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gLy8g44K544Kz44Ki5oOF5aCxIOmAmuS/oeeUqFxyXG4gIGNvbW1fID0gbmV3IGNvbW0uQ29tbSgpO1xyXG4gIGNvbW1fLnVwZGF0ZUhpZ2hTY29yZXMgPSAoZGF0YSk9PlxyXG4gIHtcclxuICAgIGhpZ2hTY29yZXMgPSBkYXRhO1xyXG4gICAgaGlnaFNjb3JlID0gaGlnaFNjb3Jlc1swXS5zY29yZTtcclxuICB9O1xyXG4gIFxyXG4gIGNvbW1fLnVwZGF0ZUhpZ2hTY29yZSA9IChkYXRhKT0+XHJcbiAge1xyXG4gICAgaWYgKGhpZ2hTY29yZSA8IGRhdGEuc2NvcmUpIHtcclxuICAgICAgaGlnaFNjb3JlID0gZGF0YS5zY29yZTtcclxuICAgICAgcHJpbnRTY29yZSgpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG5cclxuIC8vIHNjZW5lLmFkZCh0ZXh0UGxhbmUubWVzaCk7XHJcblxyXG4gIC8v5L2c6ICF5ZCN44OR44O844OG44Kj44Kv44Or44KS5L2c5oiQXHJcbiAge1xyXG4gICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG5cclxuICAgIHZhciB3ID0gc2ZnLnRleHR1cmVGaWxlcy5hdXRob3IuaW1hZ2Uud2lkdGg7XHJcbiAgICB2YXIgaCA9IHNmZy50ZXh0dXJlRmlsZXMuYXV0aG9yLmltYWdlLmhlaWdodDtcclxuICAgIGNhbnZhcy53aWR0aCA9IHc7XHJcbiAgICBjYW52YXMuaGVpZ2h0ID0gaDtcclxuICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgIGN0eC5kcmF3SW1hZ2Uoc2ZnLnRleHR1cmVGaWxlcy5hdXRob3IuaW1hZ2UsIDAsIDApO1xyXG4gICAgdmFyIGRhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIHcsIGgpO1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkdlb21ldHJ5KCk7XHJcblxyXG4gICAgZ2VvbWV0cnkudmVydF9zdGFydCA9IFtdO1xyXG4gICAgZ2VvbWV0cnkudmVydF9lbmQgPSBbXTtcclxuXHJcbiAgICB7XHJcbiAgICAgIHZhciBpID0gMDtcclxuXHJcbiAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgaDsgKyt5KSB7XHJcbiAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB3OyArK3gpIHtcclxuICAgICAgICAgIHZhciBjb2xvciA9IG5ldyBUSFJFRS5Db2xvcigpO1xyXG5cclxuICAgICAgICAgIHZhciByID0gZGF0YS5kYXRhW2krK107XHJcbiAgICAgICAgICB2YXIgZyA9IGRhdGEuZGF0YVtpKytdO1xyXG4gICAgICAgICAgdmFyIGIgPSBkYXRhLmRhdGFbaSsrXTtcclxuICAgICAgICAgIHZhciBhID0gZGF0YS5kYXRhW2krK107XHJcbiAgICAgICAgICBpZiAoYSAhPSAwKSB7XHJcbiAgICAgICAgICAgIGNvbG9yLnNldFJHQihyIC8gMjU1LjAsIGcgLyAyNTUuMCwgYiAvIDI1NS4wKTtcclxuICAgICAgICAgICAgdmFyIHZlcnQgPSBuZXcgVEhSRUUuVmVjdG9yMygoKHggLSB3IC8gMi4wKSksICgoeSAtIGggLyAyKSkgKiAtMSwgMC4wKTtcclxuICAgICAgICAgICAgdmFyIHZlcnQyID0gbmV3IFRIUkVFLlZlY3RvcjMoMTIwMCAqIE1hdGgucmFuZG9tKCkgLSA2MDAsIDEyMDAgKiBNYXRoLnJhbmRvbSgpIC0gNjAwLCAxMjAwICogTWF0aC5yYW5kb20oKSAtIDYwMCk7XHJcbiAgICAgICAgICAgIGdlb21ldHJ5LnZlcnRfc3RhcnQucHVzaChuZXcgVEhSRUUuVmVjdG9yMyh2ZXJ0Mi54IC0gdmVydC54LCB2ZXJ0Mi55IC0gdmVydC55LCB2ZXJ0Mi56IC0gdmVydC56KSk7XHJcbiAgICAgICAgICAgIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2godmVydDIpO1xyXG4gICAgICAgICAgICBnZW9tZXRyeS52ZXJ0X2VuZC5wdXNoKHZlcnQpO1xyXG4gICAgICAgICAgICBnZW9tZXRyeS5jb2xvcnMucHVzaChjb2xvcik7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8g44Oe44OG44Oq44Ki44Or44KS5L2c5oiQXHJcbiAgICAvL3ZhciB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSgnaW1hZ2VzL3BhcnRpY2xlMS5wbmcnKTtcclxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5Qb2ludHNNYXRlcmlhbCh7XHJcbiAgICAgIHNpemU6IDIwLCBibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZyxcclxuICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsIHZlcnRleENvbG9yczogdHJ1ZSwgZGVwdGhUZXN0OiBmYWxzZS8vLCBtYXA6IHRleHR1cmVcclxuICAgIH0pO1xyXG5cclxuICAgIGF1dGhvciA9IG5ldyBUSFJFRS5Qb2ludHMoZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuLy8gICAgYXV0aG9yLnBvc2l0aW9uLnggYXV0aG9yLnBvc2l0aW9uLnk9ICA9MC4wLCAwLjAsIDAuMCk7XHJcblxyXG4gICAgLy9tZXNoLnNvcnRQYXJ0aWNsZXMgPSBmYWxzZTtcclxuICAgIC8vdmFyIG1lc2gxID0gbmV3IFRIUkVFLlBhcnRpY2xlU3lzdGVtKCk7XHJcbiAgICAvL21lc2guc2NhbGUueCA9IG1lc2guc2NhbGUueSA9IDguMDtcclxuXHJcbiAgICBiYXNpY0lucHV0LmJpbmQoKTtcclxuICAgIHNjZW5lLmFkZChhdXRob3IpO1xyXG4gIH1cclxuXHJcbiAgdGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCBwcmludEF1dGhvcigpKTtcclxufVxyXG5cclxuLy8vIOS9nOiAheihqOekulxyXG5mdW5jdGlvbiBwcmludEF1dGhvcigpIHtcclxuICB2YXIgc3RlcCA9IDA7XHJcbiAgdmFyIGNvdW50ID0gMS4wO1xyXG4gIHZhciB3YWl0ID0gNjA7XHJcbiAgdmFyIHByb2NfY291bnQgPSAwO1xyXG4gIGJhc2ljSW5wdXQua2V5QnVmZmVyLmxlbmd0aCA9IDA7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uICh0YXNrSW5kZXgpIHtcclxuXHJcbiAgICAvLyDkvZXjgYvjgq3jg7zlhaXlipvjgYzjgYLjgaPjgZ/loLTlkIjjga/mrKHjga7jgr/jgrnjgq/jgbhcclxuICAgIGlmIChiYXNpY0lucHV0LmtleUJ1ZmZlci5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGJhc2ljSW5wdXQua2V5QnVmZmVyLmxlbmd0aCA9IDA7XHJcbiAgICAgIHN0ZXAgPSA0O1xyXG4gICAgfVxyXG5cclxuICAgIHN3aXRjaCAoc3RlcCkge1xyXG4gICAgICAvLyDjg5Xjgqfjg7zjg4njg7vjgqTjg7NcclxuICAgICAgY2FzZSAwOlxyXG4gICAgICAgIGlmIChjb3VudCA8PSAwLjAxKSB7XHJcbiAgICAgICAgICBjb3VudCAtPSAwLjAwMDU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGNvdW50IC09IDAuMDAyNTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNvdW50IDwgMC4wKSB7XHJcbiAgICAgICAgICBhdXRob3Iucm90YXRpb24ueCA9IGF1dGhvci5yb3RhdGlvbi55ID0gYXV0aG9yLnJvdGF0aW9uLnogPSAwLjA7XHJcbiAgICAgICAgICB2YXIgZW5kID0gYXV0aG9yLmdlb21ldHJ5LnZlcnRpY2VzLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgICAgICAgIGF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlc1tpXS54ID0gYXV0aG9yLmdlb21ldHJ5LnZlcnRfZW5kW2ldLng7XHJcbiAgICAgICAgICAgIGF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlc1tpXS55ID0gYXV0aG9yLmdlb21ldHJ5LnZlcnRfZW5kW2ldLnk7XHJcbiAgICAgICAgICAgIGF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlc1tpXS56ID0gYXV0aG9yLmdlb21ldHJ5LnZlcnRfZW5kW2ldLno7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBhdXRob3IuZ2VvbWV0cnkudmVydGljZXNOZWVkVXBkYXRlID0gdHJ1ZTtcclxuICAgICAgICAgIHN0ZXArKztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdmFyIGVuZCA9IGF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlcy5sZW5ndGg7XHJcbiAgICAgICAgICB2YXIgdiA9IGF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlcztcclxuICAgICAgICAgIHZhciBkID0gYXV0aG9yLmdlb21ldHJ5LnZlcnRfc3RhcnQ7XHJcbiAgICAgICAgICB2YXIgdjIgPSBhdXRob3IuZ2VvbWV0cnkudmVydF9lbmQ7XHJcbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgICAgICAgIHZbaV0ueCA9IHYyW2ldLnggKyBkW2ldLnggKiBjb3VudDtcclxuICAgICAgICAgICAgdltpXS55ID0gdjJbaV0ueSArIGRbaV0ueSAqIGNvdW50O1xyXG4gICAgICAgICAgICB2W2ldLnogPSB2MltpXS56ICsgZFtpXS56ICogY291bnQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBhdXRob3IuZ2VvbWV0cnkudmVydGljZXNOZWVkVXBkYXRlID0gdHJ1ZTtcclxuICAgICAgICAgIGF1dGhvci5yb3RhdGlvbi54ID0gYXV0aG9yLnJvdGF0aW9uLnkgPSBhdXRob3Iucm90YXRpb24ueiA9IGNvdW50ICogNC4wO1xyXG4gICAgICAgICAgYXV0aG9yLm1hdGVyaWFsLm9wYWNpdHkgPSAxLjA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIC8vIOW+heOBoVxyXG4gICAgICBjYXNlIDE6XHJcbiAgICAgICAgaWYgKGF1dGhvci5tYXRlcmlhbC5zaXplID4gMikge1xyXG4gICAgICAgICAgYXV0aG9yLm1hdGVyaWFsLnNpemUgLT0gMC41O1xyXG4gICAgICAgICAgYXV0aG9yLm1hdGVyaWFsLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCEgLS13YWl0KSBzdGVwKys7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgLy/jg5Xjgqfjg7zjg4njgqLjgqbjg4hcclxuICAgICAgY2FzZSAyOlxyXG4gICAgICAgIGNvdW50ICs9IDAuMDU7XHJcbiAgICAgICAgYXV0aG9yLm1hdGVyaWFsLm9wYWNpdHkgPSAxLjAgLSBjb3VudDtcclxuICAgICAgICBpZiAoY291bnQgPj0gMS4wKSB7XHJcbiAgICAgICAgICBjb3VudCA9IDEuMDtcclxuICAgICAgICAgIHdhaXQgPSA2MDtcclxuICAgICAgICAgIHN0ZXArKztcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgLy8g5bCR44GX5b6F44GhXHJcbiAgICAgIGNhc2UgMzpcclxuICAgICAgICBpZiAoISAtLXdhaXQpIHtcclxuICAgICAgICAgIHdhaXQgPSA2MDtcclxuICAgICAgICAgIHN0ZXArKztcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgLy8g5qyh44Gu44K/44K544Kv44G4XHJcbiAgICAgIGNhc2UgNDpcclxuICAgICAgICB7XHJcbiAgICAgICAgICBzY2VuZS5yZW1vdmUoYXV0aG9yKTtcclxuICAgICAgICAgIC8vc2NlbmUubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgICAgICAgdGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCBpbml0VGl0bGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuXHJcbiAgICAvL3Byb2dyZXNzLnJlbmRlcihcInByb2NjZXNpbmdcIiwgY291bnQgKiAxMDApO1xyXG5cclxuICAgIC8vY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgxMjcsMTI3LDAsMS4wKVwiO1xyXG4gICAgLy9jdHguZmlsbFJlY3QoMCwgMCwgQ09OU09MRV9XSURUSCwgQ09OU09MRV9IRUlHSFQpO1xyXG4gICAgLy92YXIgYmFja3VwID0gY3R4Lmdsb2JhbEFscGhhO1xyXG4gICAgLy9jdHguZ2xvYmFsQWxwaGEgPSBjb3VudDtcclxuICAgIC8vY3R4LmRyYXdJbWFnZShpbWFnZUZpbGVzLmZvbnQuaW1hZ2UsIChDT05TT0xFX1dJRFRIIC0gaW1hZ2VGaWxlcy5mb250LmltYWdlLndpZHRoKSAvIDIsIChDT05TT0xFX0hFSUdIVCAtIGltYWdlRmlsZXMuZm9udC5pbWFnZS5oZWlnaHQpIC8gMik7XHJcbiAgICAvL2N0eC5nbG9iYWxBbHBoYSA9IGJhY2t1cDtcclxuICB9O1xyXG59XHJcblxyXG52YXIgdGl0bGU7Ly8g44K/44Kk44OI44Or44Oh44OD44K344OlXHJcbnZhciBzcGFjZUZpZWxkOy8vIOWuh+WumeepuumWk+ODkeODvOODhuOCo+OCr+ODq1xyXG5cclxuLy8vIOOCv+OCpOODiOODq+eUu+mdouWIneacn+WMliAvLy9cclxuZnVuY3Rpb24gaW5pdFRpdGxlKHRhc2tJbmRleCkge1xyXG4gIGJhc2ljSW5wdXQuY2xlYXIoKTtcclxuXHJcbiAgLy8g44K/44Kk44OI44Or44Oh44OD44K344Ol44Gu5L2c5oiQ44O76KGo56S6IC8vL1xyXG4gIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7IG1hcDogc2ZnLnRleHR1cmVGaWxlcy50aXRsZSB9KTtcclxuICBtYXRlcmlhbC5zaGFkaW5nID0gVEhSRUUuRmxhdFNoYWRpbmc7XHJcbiAgLy9tYXRlcmlhbC5hbnRpYWxpYXMgPSBmYWxzZTtcclxuICBtYXRlcmlhbC50cmFuc3BhcmVudCA9IHRydWU7XHJcbiAgbWF0ZXJpYWwuYWxwaGFUZXN0ID0gMC41O1xyXG4gIG1hdGVyaWFsLmRlcHRoVGVzdCA9IHRydWU7XHJcbiAgdGl0bGUgPSBuZXcgVEhSRUUuTWVzaChcclxuICAgIG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KHNmZy50ZXh0dXJlRmlsZXMudGl0bGUuaW1hZ2Uud2lkdGgsIHNmZy50ZXh0dXJlRmlsZXMudGl0bGUuaW1hZ2UuaGVpZ2h0KSxcclxuICAgIG1hdGVyaWFsXHJcbiAgICApO1xyXG4gIHRpdGxlLnNjYWxlLnggPSB0aXRsZS5zY2FsZS55ID0gMC44O1xyXG4gIHRpdGxlLnBvc2l0aW9uLnkgPSA4MDtcclxuICBzY2VuZS5hZGQodGl0bGUpO1xyXG5cclxuICAvLy8g6IOM5pmv44OR44O844OG44Kj44Kv44Or6KGo56S6XHJcbiAgaWYgKCFzcGFjZUZpZWxkKSB7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTtcclxuXHJcbiAgICBnZW9tZXRyeS5lbmR5ID0gW107XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDI1MDsgKytpKSB7XHJcbiAgICAgIHZhciBjb2xvciA9IG5ldyBUSFJFRS5Db2xvcigpO1xyXG4gICAgICB2YXIgeiA9IC0xMDAwLjAgKiBNYXRoLnJhbmRvbSgpIC0gMTAwLjA7XHJcbiAgICAgIGNvbG9yLnNldEhTTCgwLjA1ICsgTWF0aC5yYW5kb20oKSAqIDAuMDUsIDEuMCwgKC0xMTAwIC0geikgLyAtMTEwMCk7XHJcbiAgICAgIHZhciBlbmR5ID0gc2ZnLlZJUlRVQUxfSEVJR0hUIC8gMiAtIHogKiBzZmcuVklSVFVBTF9IRUlHSFQgLyBzZmcuVklSVFVBTF9XSURUSDtcclxuICAgICAgdmFyIHZlcnQyID0gbmV3IFRIUkVFLlZlY3RvcjMoKHNmZy5WSVJUVUFMX1dJRFRIIC0geiAqIDIpICogTWF0aC5yYW5kb20oKSAtICgoc2ZnLlZJUlRVQUxfV0lEVEggLSB6ICogMikgLyAyKVxyXG4gICAgICAgICwgZW5keSAqIDIgKiBNYXRoLnJhbmRvbSgpIC0gZW5keSwgeik7XHJcbiAgICAgIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2godmVydDIpO1xyXG4gICAgICBnZW9tZXRyeS5lbmR5LnB1c2goZW5keSk7XHJcblxyXG4gICAgICBnZW9tZXRyeS5jb2xvcnMucHVzaChjb2xvcik7XHJcbiAgICB9XHJcblxyXG4gICAgLy8g44Oe44OG44Oq44Ki44Or44KS5L2c5oiQXHJcbiAgICAvL3ZhciB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSgnaW1hZ2VzL3BhcnRpY2xlMS5wbmcnKTtcclxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5QYXJ0aWNsZUJhc2ljTWF0ZXJpYWwoe1xyXG4gICAgICBzaXplOiA0LCBibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZyxcclxuICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsIHZlcnRleENvbG9yczogdHJ1ZSwgZGVwdGhUZXN0OiB0cnVlLy8sIG1hcDogdGV4dHVyZVxyXG4gICAgfSk7XHJcblxyXG4gICAgc3BhY2VGaWVsZCA9IG5ldyBUSFJFRS5Qb2ludHMoZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICAgIHNwYWNlRmllbGQucG9zaXRpb24ueCA9IHNwYWNlRmllbGQucG9zaXRpb24ueSA9IHNwYWNlRmllbGQucG9zaXRpb24ueiA9IDAuMDtcclxuICAgIHNjZW5lLmFkZChzcGFjZUZpZWxkKTtcclxuICAgIHRhc2tzLnB1c2hUYXNrKG1vdmVTcGFjZUZpZWxkKTtcclxuICB9XHJcblxyXG4gICAgLy8vIOODhuOCreOCueODiOihqOekulxyXG4gICAgdGV4dFBsYW5lLnByaW50KDMsIDI1LCBcIlB1c2ggeiBrZXkgdG8gU3RhcnQgR2FtZVwiLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICAgIHNmZy5nYW1lVGltZXIuc3RhcnQoKTtcclxuICAgIHNob3dUaXRsZS5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDEwLyrnp5IqLztcclxuICAgIHRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgc2hvd1RpdGxlKTtcclxufVxyXG5cclxuLy8vIOWuh+WumeepuumWk+OBruihqOekulxyXG5mdW5jdGlvbiBtb3ZlU3BhY2VGaWVsZCh0YXNrSW5kZXgpXHJcbntcclxuICB2YXIgdmVydHMgPSBzcGFjZUZpZWxkLmdlb21ldHJ5LnZlcnRpY2VzO1xyXG4gIHZhciBlbmR5cyA9IHNwYWNlRmllbGQuZ2VvbWV0cnkuZW5keTtcclxuICBmb3IgKHZhciBpID0gMCwgZW5kID0gdmVydHMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgIHZlcnRzW2ldLnkgLT0gNDtcclxuICAgIGlmICh2ZXJ0c1tpXS55IDwgLWVuZHlzW2ldKSB7XHJcbiAgICAgIHZlcnRzW2ldLnkgPSBlbmR5c1tpXTtcclxuICAgIH1cclxuICB9XHJcbiAgc3BhY2VGaWVsZC5nZW9tZXRyeS52ZXJ0aWNlc05lZWRVcGRhdGUgPSB0cnVlO1xyXG59XHJcblxyXG4vLy8g44K/44Kk44OI44Or6KGo56S6XHJcbmZ1bmN0aW9uIHNob3dUaXRsZSh0YXNrSW5kZXgpIHtcclxuICBzZmcuZ2FtZVRpbWVyLnVwZGF0ZSgpO1xyXG5cclxuICBpZiAoYmFzaWNJbnB1dC5rZXlDaGVjay56KSB7XHJcbiAgICBzY2VuZS5yZW1vdmUodGl0bGUpO1xyXG4gICAgdGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCBpbml0SGFuZGxlTmFtZSk7XHJcbiAgfVxyXG4gIGlmIChzaG93VGl0bGUuZW5kVGltZSA8IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUpIHtcclxuICAgIHNjZW5lLnJlbW92ZSh0aXRsZSk7XHJcbiAgICB0YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIGluaXRUb3AxMCk7XHJcbiAgfVxyXG5cclxufVxyXG5cclxudmFyIGVkaXRIYW5kbGVOYW1lID0gbnVsbDtcclxuLy8vIOODj+ODs+ODieODq+ODjeODvOODoOOBruOCqOODs+ODiOODquWJjeWIneacn+WMllxyXG5mdW5jdGlvbiBpbml0SGFuZGxlTmFtZSh0YXNrSW5kZXgpXHJcbntcclxuICBpZiAoZWRpdEhhbmRsZU5hbWUgIT0gbnVsbCkge1xyXG4gICAgdGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LGdhbWVJbml0KTtcclxuICB9IGVsc2Uge1xyXG4gICAgZWRpdEhhbmRsZU5hbWUgPSBoYW5kbGVOYW1lIHx8ICcnO1xyXG4gICAgdGV4dFBsYW5lLmNscygpO1xyXG4gICAgdGV4dFBsYW5lLnByaW50KDQsIDE4LCAnSW5wdXQgeW91ciBoYW5kbGUgbmFtZS4nKTtcclxuICAgIHRleHRQbGFuZS5wcmludCg4LCAxOSwgJyhNYXggOCBDaGFyKScpO1xyXG4gICAgdGV4dFBsYW5lLnByaW50KDEwLCAyMSwgZWRpdEhhbmRsZU5hbWUpO1xyXG4gICAgLy8gICAgdGV4dFBsYW5lLnByaW50KDEwLCAyMSwgaGFuZGxlTmFtZVswXSwgVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgICBiYXNpY0lucHV0LnVuYmluZCgpO1xyXG4gICAgdmFyIGVsbSA9IGQzLnNlbGVjdCgnI2NvbnRlbnQnKS5hcHBlbmQoJ2lucHV0Jyk7XHJcbiAgICBlbG1cclxuICAgICAgLmF0dHIoJ3R5cGUnLCAndGV4dCcpXHJcbiAgICAgIC5hdHRyKCdwYXR0ZXJuJywgJ1thLXpBLVowLTlfXFxAXFwjXFwkXFwtXXswLDh9JylcclxuICAgICAgLmF0dHIoJ21heGxlbmd0aCcsIDgpXHJcbiAgICAgIC5hdHRyKCdpZCcsJ2lucHV0LWFyZWEnKVxyXG4gICAgICAuYXR0cigndmFsdWUnLGVkaXRIYW5kbGVOYW1lKVxyXG4gICAgICAub24oJ2JsdXInLGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgZDMuZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBkMy5ldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcclxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHsgdGhpcy5mb2N1cygpO30sIDEwKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5vbigna2V5dXAnLGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgaWYgKGQzLmV2ZW50LmtleUNvZGUgPT0gMTMpIHtcclxuICAgICAgICAgIGVkaXRIYW5kbGVOYW1lID0gdGhpcy52YWx1ZTtcclxuICAgICAgICAgIHZhciBzID0gdGhpcy5zZWxlY3Rpb25TdGFydDtcclxuICAgICAgICAgIHZhciBlID0gdGhpcy5zZWxlY3Rpb25FbmQ7XHJcbiAgICAgICAgICB0ZXh0UGxhbmUucHJpbnQoMTAsIDIxLCBlZGl0SGFuZGxlTmFtZSk7XHJcbiAgICAgICAgICB0ZXh0UGxhbmUucHJpbnQoMTAgKyBzLCAyMSwgJ18nLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKS5vbigna2V5dXAnLG51bGwpO1xyXG4gICAgICAgICAgYmFzaWNJbnB1dC5iaW5kKCk7XHJcbiAgICAgICAgICB0YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIGdhbWVJbml0KTtcclxuICAgICAgICAgIHN0b3JhZ2Uuc2V0SXRlbSgnaGFuZGxlTmFtZScsIGVkaXRIYW5kbGVOYW1lKTtcclxuICAgICAgICAgIGQzLnNlbGVjdCgnI2lucHV0LWFyZWEnKS5yZW1vdmUoKTtcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWRpdEhhbmRsZU5hbWUgPSB0aGlzLnZhbHVlO1xyXG4gICAgICAgIHZhciBzID0gdGhpcy5zZWxlY3Rpb25TdGFydDtcclxuICAgICAgICB0ZXh0UGxhbmUucHJpbnQoMTAsIDIxLCAnICAgICAgICAgICAnKTtcclxuICAgICAgICB0ZXh0UGxhbmUucHJpbnQoMTAsIDIxLCBlZGl0SGFuZGxlTmFtZSk7XHJcbiAgICAgICAgdGV4dFBsYW5lLnByaW50KDEwICsgcywgMjEsJ18nLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICAgICAgfSlcclxuICAgIC5ub2RlKCkuZm9jdXMoKTtcclxuICAgIHRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgaW5wdXRIYW5kbGVOYW1lKTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDjg4/jg7Pjg4njg6vjg43jg7zjg6Djga7jgqjjg7Pjg4jjg6pcclxuZnVuY3Rpb24gaW5wdXRIYW5kbGVOYW1lKHRhc2tJbmRleClcclxue1xyXG5cclxufVxyXG5cclxuLy8vIOOCueOCs+OCouWKoOeul1xyXG5mdW5jdGlvbiBhZGRTY29yZShzKSB7XHJcbiAgc2NvcmUgKz0gcztcclxuICBpZiAoc2NvcmUgPiBoaWdoU2NvcmUpIHtcclxuICAgIGhpZ2hTY29yZSA9IHNjb3JlO1xyXG4gIH1cclxufVxyXG5cclxuc2ZnLmFkZFNjb3JlID0gYWRkU2NvcmU7XHJcblxyXG4vLy8g44K544Kz44Ki6KGo56S6XHJcbmZ1bmN0aW9uIHByaW50U2NvcmUoKVxyXG57XHJcbiAgdmFyIHMgPSAnMDAwMDAwMDAnICsgc2NvcmUudG9TdHJpbmcoKTtcclxuICBzID0gcy5zdWJzdHIocy5sZW5ndGggLSA4LCA4KTtcclxuXHJcbiAgdGV4dFBsYW5lLnByaW50KDEsIDEsIHMpO1xyXG5cclxuICB2YXIgaCA9ICcwMDAwMDAwMCcgKyBoaWdoU2NvcmUudG9TdHJpbmcoKTtcclxuICBoID0gaC5zdWJzdHIoaC5sZW5ndGggLSA4LCA4KTtcclxuICB0ZXh0UGxhbmUucHJpbnQoMTIsIDEsIGgpO1xyXG5cclxufVxyXG5cclxuZnVuY3Rpb24gc2UoaW5kZXgpe1xyXG4gIHNlcXVlbmNlci5wbGF5VHJhY2tzKHNvdW5kRWZmZWN0cy5zb3VuZEVmZmVjdHNbaW5kZXhdKTtcclxufVxyXG5cclxuLy8vIOODj+OCpOOCueOCs+OCouihqOekulxyXG5cclxuLy8vIOOCsuODvOODoOOBruWIneacn+WMllxyXG5mdW5jdGlvbiBnYW1lSW5pdCh0YXNrSW5kZXgpIHtcclxuXHJcbiAgLy8g44Kq44O844OH44Kj44Kq44Gu6ZaL5aeLXHJcbiAgYXVkaW9fLnN0YXJ0KCk7XHJcbiAgc2VxdWVuY2VyLmxvYWQoYXVkaW8uc2VxRGF0YSk7XHJcbiAgc2VxdWVuY2VyLnN0YXJ0KCk7XHJcbiAgc2ZnLnN0YWdlLnJlc2V0KCk7XHJcbiAgdGV4dFBsYW5lLmNscygpO1xyXG5cclxuICBlbmVtaWVzXy5yZXNldCgpO1xyXG5cclxuICAvLyDoh6rmqZ/jga7liJ3mnJ/ljJZcclxuICBzZmcubXlzaGlwXyA9IG5ldyBteXNoaXAuTXlTaGlwKDAsIC0xMDAsIDAuMSxzY2VuZSxzZSk7XHJcbiAgc2ZnLmdhbWVUaW1lci5zdGFydCgpO1xyXG4gIHNjb3JlID0gMDtcclxuICB0ZXh0UGxhbmUucHJpbnQoMiwgMCwgJ1Njb3JlICAgIEhpZ2ggU2NvcmUnKTtcclxuICB0ZXh0UGxhbmUucHJpbnQoMjAsIDM5LCAnUmVzdDogICAnICsgc2ZnLm15c2hpcF8ucmVzdCk7XHJcbiAgcHJpbnRTY29yZSgpO1xyXG4gIHRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgc3RhZ2VJbml0LypnYW1lQWN0aW9uKi8pO1xyXG59XHJcblxyXG4vLy8g44K544OG44O844K444Gu5Yid5pyf5YyWXHJcbmZ1bmN0aW9uIHN0YWdlSW5pdCh0YXNrSW5kZXgpIHtcclxuICB0ZXh0UGxhbmUucHJpbnQoMCwgMzksICdTdGFnZTonICsgc2ZnLnN0YWdlLm5vKTtcclxuICBzZmcuZ2FtZVRpbWVyLnN0YXJ0KCk7XHJcbiAgZW5lbWllc18ucmVzZXQoKTtcclxuICBlbmVtaWVzXy5zdGFydCgpO1xyXG4gIGVuZW1pZXNfLmNhbGNFbmVtaWVzQ291bnQoc2ZnLnN0YWdlLnByaXZhdGVObyk7XHJcbiAgZW5lbWllc18uaGl0RW5lbWllc0NvdW50ID0gMDtcclxuICB0ZXh0UGxhbmUucHJpbnQoOCwgMTUsICdTdGFnZSAnICsgKHNmZy5zdGFnZS5ubykgKyAnIFN0YXJ0ICEhJywgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgc3RhZ2VTdGFydC5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDI7XHJcbiAgdGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCBzdGFnZVN0YXJ0LypnYW1lQWN0aW9uKi8pO1xyXG59XHJcblxyXG4vLy8g44K544OG44O844K46ZaL5aeLXHJcbmZ1bmN0aW9uIHN0YWdlU3RhcnQodGFza0luZGV4KVxyXG57XHJcbiAgc2ZnLmdhbWVUaW1lci51cGRhdGUoKTtcclxuICBzZmcubXlzaGlwXy5hY3Rpb24oYmFzaWNJbnB1dCk7XHJcbiAgaWYgKHN0YWdlU3RhcnQuZW5kVGltZSA8IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUpIHtcclxuICAgIHRleHRQbGFuZS5wcmludCg4LCAxNSwgJyAgICAgICAgICAgICAgICAgICcsIG5ldyB0ZXh0LlRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gICAgdGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCBnYW1lQWN0aW9uLDUwMDApO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOiHquapn+OBruWLleOBjeOCkuWItuW+oeOBmeOCi1xyXG5mdW5jdGlvbiBnYW1lQWN0aW9uKHRhc2tJbmRleCkge1xyXG4gIHByaW50U2NvcmUoKTtcclxuICBzZmcubXlzaGlwXy5hY3Rpb24oYmFzaWNJbnB1dCk7XHJcbiAgc2ZnLmdhbWVUaW1lci51cGRhdGUoKTtcclxuICAvL2NvbnNvbGUubG9nKHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUpO1xyXG4gIGVuZW1pZXNfLm1vdmUoKTtcclxuXHJcbiAgaWYgKCFwcm9jZXNzQ29sbGlzaW9uKCkpIHtcclxuICAgIGlmIChlbmVtaWVzXy5oaXRFbmVtaWVzQ291bnQgPT0gZW5lbWllc18udG90YWxFbmVtaWVzQ291bnQpIHtcclxuICAgICAgcHJpbnRTY29yZSgpO1xyXG4gICAgICBzZmcuc3RhZ2UuYWR2YW5jZSgpO1xyXG4gICAgICB0YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHN0YWdlSW5pdCk7XHJcbiAgICB9XHJcbiAgfSBlbHNlIHtcclxuICAgIG15U2hpcEJvbWIuZW5kVGltZSA9IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgKyAzO1xyXG4gICAgdGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCBteVNoaXBCb21iKTtcclxuICB9O1xyXG5cclxufVxyXG5cclxuLy8vIOW9k+OBn+OCiuWIpOWumlxyXG5mdW5jdGlvbiBwcm9jZXNzQ29sbGlzaW9uKHRhc2tJbmRleClcclxue1xyXG4gIC8v44CA6Ieq5qmf5by+44Go5pW144Go44Gu44GC44Gf44KK5Yik5a6aXHJcbiAgdmFyIG15QnVsbGV0cyA9IHNmZy5teXNoaXBfLm15QnVsbGV0cztcclxuICBlbnMgPSBlbmVtaWVzXy5lbmVtaWVzO1xyXG4gIGZvciAodmFyIGkgPSAwLCBlbmQgPSBteUJ1bGxldHMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgIHZhciBteWIgPSBteUJ1bGxldHNbaV07XHJcbiAgICBpZiAobXliLmVuYWJsZV8pIHtcclxuICAgICAgdmFyIG15YmNvID0gbXlCdWxsZXRzW2ldLmNvbGxpc2lvbkFyZWE7XHJcbiAgICAgIHZhciBsZWZ0ID0gbXliY28ubGVmdCArIG15Yi54O1xyXG4gICAgICB2YXIgcmlnaHQgPSBteWJjby5yaWdodCArIG15Yi54O1xyXG4gICAgICB2YXIgdG9wID0gbXliY28udG9wICsgbXliLnk7XHJcbiAgICAgIHZhciBib3R0b20gPSBteWJjby5ib3R0b20gLSBteWIuc3BlZWQgKyBteWIueTtcclxuICAgICAgZm9yICh2YXIgaiA9IDAsIGVuZGogPSBlbnMubGVuZ3RoOyBqIDwgZW5kajsgKytqKSB7XHJcbiAgICAgICAgdmFyIGVuID0gZW5zW2pdO1xyXG4gICAgICAgIGlmIChlbi5lbmFibGVfKSB7XHJcbiAgICAgICAgICB2YXIgZW5jbyA9IGVuLmNvbGxpc2lvbkFyZWE7XHJcbiAgICAgICAgICBpZiAodG9wID4gKGVuLnkgKyBlbmNvLmJvdHRvbSkgJiZcclxuICAgICAgICAgICAgICAoZW4ueSArIGVuY28udG9wKSA+IGJvdHRvbSAmJlxyXG4gICAgICAgICAgICBsZWZ0IDwgKGVuLnggKyBlbmNvLnJpZ2h0KSAmJlxyXG4gICAgICAgICAgICAoZW4ueCArIGVuY28ubGVmdCkgPCByaWdodFxyXG4gICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgbXliLmVuYWJsZV8gPSBmYWxzZTtcclxuICAgICAgICAgICAgZW4uaGl0KCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8g5pW144Go6Ieq5qmf44Go44Gu44GC44Gf44KK5Yik5a6aXHJcbiAgaWYoc2ZnLkNIRUNLX0NPTExJU0lPTil7XHJcbiAgICB2YXIgbXljbyA9IHNmZy5teXNoaXBfLmNvbGxpc2lvbkFyZWE7XHJcbiAgICB2YXIgbGVmdCA9IHNmZy5teXNoaXBfLnggKyBteWNvLmxlZnQ7XHJcbiAgICB2YXIgcmlnaHQgPSBteWNvLnJpZ2h0ICsgc2ZnLm15c2hpcF8ueDtcclxuICAgIHZhciB0b3AgPSBteWNvLnRvcCArIHNmZy5teXNoaXBfLnk7XHJcbiAgICB2YXIgYm90dG9tID0gbXljby5ib3R0b20gKyBzZmcubXlzaGlwXy55O1xyXG5cclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSBlbnMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgdmFyIGVuID0gZW5zW2ldO1xyXG4gICAgICBpZiAoZW4uZW5hYmxlXykge1xyXG4gICAgICAgIHZhciBlbmNvID0gZW4uY29sbGlzaW9uQXJlYTtcclxuICAgICAgICBpZiAodG9wID4gKGVuLnkgKyBlbmNvLmJvdHRvbSkgJiZcclxuICAgICAgICAgICAgKGVuLnkgKyBlbmNvLnRvcCkgPiBib3R0b20gJiZcclxuICAgICAgICAgIGxlZnQgPCAoZW4ueCArIGVuY28ucmlnaHQpICYmXHJcbiAgICAgICAgICAoZW4ueCArIGVuY28ubGVmdCkgPCByaWdodFxyXG4gICAgICAgICAgKSB7XHJcbiAgICAgICAgICBlbi5oaXQoKTtcclxuICAgICAgICAgIHNmZy5teXNoaXBfLmhpdCgpO1xyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyDmlbXlvL7jgajoh6rmqZ/jgajjga7jgYLjgZ/jgorliKTlrppcclxuICAgIGVuYnMgPSBlbmVteUJ1bGxldHMuZW5lbXlCdWxsZXRzO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IGVuYnMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgdmFyIGVuID0gZW5ic1tpXTtcclxuICAgICAgaWYgKGVuLmVuYWJsZSkge1xyXG4gICAgICAgIHZhciBlbmNvID0gZW4uY29sbGlzaW9uQXJlYTtcclxuICAgICAgICBpZiAodG9wID4gKGVuLnkgKyBlbmNvLmJvdHRvbSkgJiZcclxuICAgICAgICAgICAgKGVuLnkgKyBlbmNvLnRvcCkgPiBib3R0b20gJiZcclxuICAgICAgICAgIGxlZnQgPCAoZW4ueCArIGVuY28ucmlnaHQpICYmXHJcbiAgICAgICAgICAoZW4ueCArIGVuY28ubGVmdCkgPCByaWdodFxyXG4gICAgICAgICAgKSB7XHJcbiAgICAgICAgICBlbi5oaXQoKTtcclxuICAgICAgICAgIHNmZy5teXNoaXBfLmhpdCgpO1xyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICB9XHJcbiAgcmV0dXJuIGZhbHNlO1xyXG59XHJcblxyXG4vLy8g6Ieq5qmf54iG55m6IFxyXG5mdW5jdGlvbiBteVNoaXBCb21iKHRhc2tJbmRleCkge1xyXG4gIHNmZy5nYW1lVGltZXIudXBkYXRlKCk7XHJcbiAgZW5lbWllc18ubW92ZSgpO1xyXG4gIGlmIChzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lID4gbXlTaGlwQm9tYi5lbmRUaW1lKSB7XHJcbiAgICBzZmcubXlzaGlwXy5yZXN0LS07XHJcbiAgICBpZiAoc2ZnLm15c2hpcF8ucmVzdCA9PSAwKSB7XHJcbiAgICAgIHRleHRQbGFuZS5wcmludCgxMCwgMTgsICdHQU1FIE9WRVInLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICAgICAgcHJpbnRTY29yZSgpO1xyXG4gICAgICB0ZXh0UGxhbmUucHJpbnQoMjAsIDM5LCAnUmVzdDogICAnICsgc2ZnLm15c2hpcF8ucmVzdCk7XHJcbiAgICAgIGNvbW1fLnNvY2tldC5vbignc2VuZFJhbmsnLCBjaGVja1JhbmtJbik7XHJcbiAgICAgIGNvbW1fLnNlbmRTY29yZShuZXcgU2NvcmVFbnRyeShlZGl0SGFuZGxlTmFtZSxzY29yZSkpO1xyXG4gICAgICBnYW1lT3Zlci5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDU7XHJcbiAgICAgIHJhbmsgPSAtMTtcclxuICAgICAgdGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCBnYW1lT3Zlcik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzZmcubXlzaGlwXy5tZXNoLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICB0ZXh0UGxhbmUucHJpbnQoMjAsIDM5LCAnUmVzdDogICAnICsgc2ZnLm15c2hpcF8ucmVzdCk7XHJcbiAgICAgIHRleHRQbGFuZS5wcmludCg4LCAxNSwgJ1N0YWdlICcgKyAoc2ZnLnN0YWdlLm5vKSArICcgU3RhcnQgISEnLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICAgICAgc3RhZ2VTdGFydC5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDI7XHJcbiAgICAgIHRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgc3RhZ2VTdGFydC8qZ2FtZUFjdGlvbiovKTtcclxuICAgIH1cclxuICB9XHJcblxyXG59XHJcblxyXG4vLy8g44Ky44O844Og44Kq44O844OQ44O8XHJcbmZ1bmN0aW9uIGdhbWVPdmVyKHRhc2tJbmRleClcclxue1xyXG4gIHNmZy5nYW1lVGltZXIudXBkYXRlKCk7XHJcbiAgaWYgKGdhbWVPdmVyLmVuZFRpbWUgPCBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lKSB7XHJcbiAgICB0ZXh0UGxhbmUuY2xzKCk7XHJcbiAgICBlbmVtaWVzXy5yZXNldCgpO1xyXG4gICAgZW5lbXlCdWxsZXRzLnJlc2V0KCk7XHJcbiAgICBpZiAocmFuayA+PSAwKSB7XHJcbiAgICAgIHRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgaW5pdFRvcDEwKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgaW5pdFRpdGxlKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8vLyDjg6njg7Pjgq3jg7PjgrDjgZfjgZ/jgYvjganjgYbjgYvjga7jg4Hjgqfjg4Pjgq9cclxuZnVuY3Rpb24gY2hlY2tSYW5rSW4oZGF0YSlcclxue1xyXG4gIHJhbmsgPSBkYXRhLnJhbms7XHJcbn1cclxuXHJcblxyXG4vLy8g44OP44Kk44K544Kz44Ki44Ko44Oz44OI44Oq44Gu6KGo56S6XHJcbmZ1bmN0aW9uIHByaW50VG9wMTAoKVxyXG57XHJcbiAgdmFyIHJhbmtuYW1lID0gWycgMXN0JywgJyAybmQnLCAnIDNyZCcsICcgNHRoJywgJyA1dGgnLCAnIDZ0aCcsICcgN3RoJywgJyA4dGgnLCAnIDl0aCcsICcxMHRoJ107XHJcbiAgdGV4dFBsYW5lLnByaW50KDgsIDQsICdUb3AgMTAgU2NvcmUnKTtcclxuICB2YXIgeSA9IDg7XHJcbiAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IGhpZ2hTY29yZXMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgIHZhciBzY29yZVN0ciA9ICcwMDAwMDAwMCcgKyBoaWdoU2NvcmVzW2ldLnNjb3JlO1xyXG4gICAgc2NvcmVTdHIgPSBzY29yZVN0ci5zdWJzdHIoc2NvcmVTdHIubGVuZ3RoIC0gOCwgOCk7XHJcbiAgICBpZiAocmFuayA9PSBpKSB7XHJcbiAgICAgIHRleHRQbGFuZS5wcmludCgzLCB5LCByYW5rbmFtZVtpXSArICcgJyArIHNjb3JlU3RyICsgJyAnICsgaGlnaFNjb3Jlc1tpXS5uYW1lLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRleHRQbGFuZS5wcmludCgzLCB5LCByYW5rbmFtZVtpXSArICcgJyArIHNjb3JlU3RyICsgJyAnICsgaGlnaFNjb3Jlc1tpXS5uYW1lKTtcclxuICAgIH1cclxuICAgIHkgKz0gMjtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRUb3AxMCh0YXNrSW5kZXgpIHtcclxuICB0ZXh0UGxhbmUuY2xzKCk7XHJcbiAgcHJpbnRUb3AxMCgpO1xyXG4gIHNob3dUb3AxMC5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDU7XHJcbiAgdGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCBzaG93VG9wMTApO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzaG93VG9wMTAodGFza0luZGV4KSB7XHJcbiAgc2ZnLmdhbWVUaW1lci51cGRhdGUoKTtcclxuICBpZiAoc2hvd1RvcDEwLmVuZFRpbWUgPCBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lIHx8IGJhc2ljSW5wdXQua2V5QnVmZmVyLmxlbmd0aCA+IDApIHtcclxuICAgIGJhc2ljSW5wdXQua2V5QnVmZmVyLmxlbmd0aCA9IDA7XHJcbiAgICB0ZXh0UGxhbmUuY2xzKCk7XHJcbiAgICB0YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIGluaXRUaXRsZSk7XHJcbiAgfVxyXG59XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIENvbGxpc2lvbkFyZWEob2Zmc2V0WCwgb2Zmc2V0WSwgd2lkdGgsIGhlaWdodCkge1xyXG4gIHRoaXMub2Zmc2V0WCA9IG9mZnNldFggfHwgMDtcclxuICB0aGlzLm9mZnNldFkgPSBvZmZzZXRZIHx8IDA7XHJcbiAgdGhpcy50b3AgPSAwO1xyXG4gIHRoaXMuYm90dG9tID0gMDtcclxuICB0aGlzLmxlZnQgPSAwO1xyXG4gIHRoaXMucmlnaHQgPSAwO1xyXG4gIHRoaXMud2lkdGggPSB3aWR0aCB8fCAwO1xyXG4gIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0IHx8IDA7XHJcbn1cclxuXHJcbkNvbGxpc2lvbkFyZWEucHJvdG90eXBlID0ge1xyXG4gIHdpZHRoXzogMCxcclxuICBoZWlnaHRfOiAwLFxyXG4gIGdldCB3aWR0aCgpIHsgcmV0dXJuIHdpZHRoXzsgfSxcclxuICBzZXQgd2lkdGgodikge1xyXG4gICAgdGhpcy53aWR0aF8gPSB2O1xyXG4gICAgdGhpcy5sZWZ0ID0gdGhpcy5vZmZzZXRYIC0gdiAvIDI7XHJcbiAgICB0aGlzLnJpZ2h0ID0gdGhpcy5vZmZzZXRYICsgdiAvIDI7XHJcbiAgfSxcclxuICBnZXQgaGVpZ2h0KCkgeyByZXR1cm4gaGVpZ2h0XzsgfSxcclxuICBzZXQgaGVpZ2h0KHYpIHtcclxuICAgIHRoaXMuaGVpZ2h0XyA9IHY7XHJcbiAgICB0aGlzLnRvcCA9IHRoaXMub2Zmc2V0WSArIHYgLyAyO1xyXG4gICAgdGhpcy5ib3R0b20gPSB0aGlzLm9mZnNldFkgLSB2IC8gMjtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBHYW1lT2JqKHgsIHksIHopIHtcclxuICB0aGlzLnhfID0geCB8fCAwO1xyXG4gIHRoaXMueV8gPSB5IHx8IDA7XHJcbiAgdGhpcy56XyA9IHogfHwgMC4wO1xyXG4gIHRoaXMuZW5hYmxlXyA9IGZhbHNlO1xyXG4gIHRoaXMud2lkdGggPSAwO1xyXG4gIHRoaXMuaGVpZ2h0ID0gMDtcclxuICB0aGlzLmNvbGxpc2lvbkFyZWEgPSBuZXcgQ29sbGlzaW9uQXJlYSgpO1xyXG59XHJcblxyXG5HYW1lT2JqLnByb3RvdHlwZSA9IHtcclxuICBnZXQgeCgpIHsgcmV0dXJuIHRoaXMueF87IH0sXHJcbiAgc2V0IHgodikgeyB0aGlzLnhfID0gdjsgfSxcclxuICBnZXQgeSgpIHsgcmV0dXJuIHRoaXMueV87IH0sXHJcbiAgc2V0IHkodikgeyB0aGlzLnlfID0gdjsgfSxcclxuICBnZXQgeigpIHsgcmV0dXJuIHRoaXMuel87IH0sXHJcbiAgc2V0IHoodikgeyB0aGlzLnpfID0gdjsgfVxyXG59XHJcbiIsImV4cG9ydCBjb25zdCBWSVJUVUFMX1dJRFRIID0gMjQwO1xyXG5leHBvcnQgY29uc3QgVklSVFVBTF9IRUlHSFQgPSAzMjA7XHJcblxyXG5leHBvcnQgY29uc3QgVl9SSUdIVCA9IFZJUlRVQUxfV0lEVEggLyAyLjA7XHJcbmV4cG9ydCBjb25zdCBWX1RPUCA9IFZJUlRVQUxfSEVJR0hUIC8gMi4wO1xyXG5leHBvcnQgY29uc3QgVl9MRUZUID0gLTEgKiBWSVJUVUFMX1dJRFRIIC8gMi4wO1xyXG5leHBvcnQgY29uc3QgVl9CT1RUT00gPSAtMSAqIFZJUlRVQUxfSEVJR0hUIC8gMi4wO1xyXG5cclxuZXhwb3J0IGNvbnN0IENIQVJfU0laRSA9IDg7XHJcbmV4cG9ydCBjb25zdCBURVhUX1dJRFRIID0gVklSVFVBTF9XSURUSCAvIENIQVJfU0laRTtcclxuZXhwb3J0IGNvbnN0IFRFWFRfSEVJR0hUID0gVklSVFVBTF9IRUlHSFQgLyBDSEFSX1NJWkU7XHJcbmV4cG9ydCBjb25zdCBQSVhFTF9TSVpFID0gMTtcclxuZXhwb3J0IGNvbnN0IEFDVFVBTF9DSEFSX1NJWkUgPSBDSEFSX1NJWkUgKiBQSVhFTF9TSVpFO1xyXG5leHBvcnQgY29uc3QgU1BSSVRFX1NJWkVfWCA9IDE2LjA7XHJcbmV4cG9ydCBjb25zdCBTUFJJVEVfU0laRV9ZID0gMTYuMDtcclxuZXhwb3J0IGNvbnN0IENIRUNLX0NPTExJU0lPTiA9IHRydWU7XHJcbmV4cG9ydCB2YXIgdGV4dHVyZUZpbGVzID0ge307XHJcbmV4cG9ydCB2YXIgc3RhZ2U7XHJcbmV4cG9ydCB2YXIgdGFza3M7XHJcbmV4cG9ydCB2YXIgZ2FtZVRpbWVyO1xyXG5leHBvcnQgdmFyIGJvbWJzO1xyXG5leHBvcnQgdmFyIGFkZFNjb3JlO1xyXG5leHBvcnQgdmFyIG15c2hpcF87XHJcbmV4cG9ydCBjb25zdCB0ZXh0dXJlUm9vdCA9ICcuL3Jlcy8nO1xyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmltcG9ydCAqIGFzIGcgZnJvbSAnLi9nbG9iYWwnO1xyXG5cclxuLy8vIOODhuOCr+OCueODgeODo+ODvOOBqOOBl+OBpmNhbnZhc+OCkuS9v+OBhuWgtOWQiOOBruODmOODq+ODkeODvFxyXG5leHBvcnQgZnVuY3Rpb24gQ2FudmFzVGV4dHVyZSh3aWR0aCwgaGVpZ2h0KSB7XHJcbiAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICB0aGlzLmNhbnZhcy53aWR0aCA9IHdpZHRoIHx8IGcuVklSVFVBTF9XSURUSDtcclxuICB0aGlzLmNhbnZhcy5oZWlnaHQgPSBoZWlnaHQgfHwgZy5WSVJUVUFMX0hFSUdIVDtcclxuICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgdGhpcy50ZXh0dXJlID0gbmV3IFRIUkVFLlRleHR1cmUodGhpcy5jYW52YXMpO1xyXG4gIHRoaXMudGV4dHVyZS5tYWdGaWx0ZXIgPSBUSFJFRS5OZWFyZXN0RmlsdGVyO1xyXG4gIHRoaXMudGV4dHVyZS5taW5GaWx0ZXIgPSBUSFJFRS5MaW5lYXJNaXBNYXBMaW5lYXJGaWx0ZXI7XHJcbiAgdGhpcy5tYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7IG1hcDogdGhpcy50ZXh0dXJlLCB0cmFuc3BhcmVudDogdHJ1ZSB9KTtcclxuICB0aGlzLmdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkodGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcbiAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2godGhpcy5nZW9tZXRyeSwgdGhpcy5tYXRlcmlhbCk7XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnogPSAwLjAwMTtcclxuICAvLyDjgrnjg6Djg7zjgrjjg7PjgrDjgpLliIfjgotcclxuICB0aGlzLmN0eC5tc0ltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIHRoaXMuY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIC8vdGhpcy5jdHgud2Via2l0SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgdGhpcy5jdHgubW96SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbn1cclxuXHJcbi8vLyDjg5fjg63jgrDjg6zjgrnjg5Djg7zooajnpLrjgq/jg6njgrlcclxuZXhwb3J0IGZ1bmN0aW9uIFByb2dyZXNzKCkge1xyXG4gIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7O1xyXG4gIHZhciB3aWR0aCA9IDE7XHJcbiAgd2hpbGUgKHdpZHRoIDw9IGcuVklSVFVBTF9XSURUSCl7XHJcbiAgICB3aWR0aCAqPSAyO1xyXG4gIH1cclxuICB2YXIgaGVpZ2h0ID0gMTtcclxuICB3aGlsZSAoaGVpZ2h0IDw9IGcuVklSVFVBTF9IRUlHSFQpe1xyXG4gICAgaGVpZ2h0ICo9IDI7XHJcbiAgfVxyXG4gIHRoaXMuY2FudmFzLndpZHRoID0gd2lkdGg7XHJcbiAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG4gIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICB0aGlzLnRleHR1cmUgPSBuZXcgVEhSRUUuVGV4dHVyZSh0aGlzLmNhbnZhcyk7XHJcbiAgdGhpcy50ZXh0dXJlLm1hZ0ZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XHJcbiAgdGhpcy50ZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLkxpbmVhck1pcE1hcExpbmVhckZpbHRlcjtcclxuICAvLyDjgrnjg6Djg7zjgrjjg7PjgrDjgpLliIfjgotcclxuICB0aGlzLmN0eC5tc0ltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIHRoaXMuY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIC8vdGhpcy5jdHgud2Via2l0SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgdGhpcy5jdHgubW96SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcblxyXG4gIHRoaXMubWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBtYXA6IHRoaXMudGV4dHVyZSwgdHJhbnNwYXJlbnQ6IHRydWUgfSk7XHJcbiAgdGhpcy5nZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG4gIHRoaXMubWVzaCA9IG5ldyBUSFJFRS5NZXNoKHRoaXMuZ2VvbWV0cnksIHRoaXMubWF0ZXJpYWwpO1xyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi54ID0gKHdpZHRoIC0gZy5WSVJUVUFMX1dJRFRIKSAvIDI7XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnkgPSAgLSAoaGVpZ2h0IC0gZy5WSVJUVUFMX0hFSUdIVCkgLyAyO1xyXG5cclxuICAvL3RoaXMudGV4dHVyZS5wcmVtdWx0aXBseUFscGhhID0gdHJ1ZTtcclxufVxyXG5cclxuLy8vIOODl+ODreOCsOODrOOCueODkOODvOOCkuihqOekuuOBmeOCi+OAglxyXG5Qcm9ncmVzcy5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gKG1lc3NhZ2UsIHBlcmNlbnQpIHtcclxuICB2YXIgY3R4ID0gdGhpcy5jdHg7XHJcbiAgdmFyIHdpZHRoID0gdGhpcy5jYW52YXMud2lkdGgsIGhlaWdodCA9IHRoaXMuY2FudmFzLmhlaWdodDtcclxuICAvLyAgICAgIGN0eC5maWxsU3R5bGUgPSAncmdiYSgwLDAsMCwwKSc7XHJcbiAgY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuICB2YXIgdGV4dFdpZHRoID0gY3R4Lm1lYXN1cmVUZXh0KG1lc3NhZ2UpLndpZHRoO1xyXG4gIGN0eC5zdHJva2VTdHlsZSA9IGN0eC5maWxsU3R5bGUgPSAncmdiYSgyNTUsMjU1LDI1NSwxLjApJztcclxuXHJcbiAgY3R4LmZpbGxUZXh0KG1lc3NhZ2UsICh3aWR0aCAtIHRleHRXaWR0aCkgLyAyLCAxMDApO1xyXG4gIGN0eC5iZWdpblBhdGgoKTtcclxuICBjdHgucmVjdCgyMCwgNzUsIHdpZHRoIC0gMjAgKiAyLCAxMCk7XHJcbiAgY3R4LnN0cm9rZSgpO1xyXG4gIGN0eC5maWxsUmVjdCgyMCwgNzUsICh3aWR0aCAtIDIwICogMikgKiBwZXJjZW50IC8gMTAwLCAxMCk7XHJcbiAgdGhpcy50ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxufVxyXG5cclxuLy8vIGltZ+OBi+OCieOCuOOCquODoeODiOODquOCkuS9nOaIkOOBmeOCi1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlR2VvbWV0cnlGcm9tSW1hZ2UoaW1hZ2UpIHtcclxuICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgdmFyIHcgPSB0ZXh0dXJlRmlsZXMuYXV0aG9yLnRleHR1cmUuaW1hZ2Uud2lkdGg7XHJcbiAgdmFyIGggPSB0ZXh0dXJlRmlsZXMuYXV0aG9yLnRleHR1cmUuaW1hZ2UuaGVpZ2h0O1xyXG4gIGNhbnZhcy53aWR0aCA9IHc7XHJcbiAgY2FudmFzLmhlaWdodCA9IGg7XHJcbiAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gIGN0eC5kcmF3SW1hZ2UoaW1hZ2UsIDAsIDApO1xyXG4gIHZhciBkYXRhID0gY3R4LmdldEltYWdlRGF0YSgwLCAwLCB3LCBoKTtcclxuICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTtcclxuICB7XHJcbiAgICB2YXIgaSA9IDA7XHJcblxyXG4gICAgZm9yICh2YXIgeSA9IDA7IHkgPCBoOyArK3kpIHtcclxuICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB3OyArK3gpIHtcclxuICAgICAgICB2YXIgY29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoKTtcclxuXHJcbiAgICAgICAgdmFyIHIgPSBkYXRhLmRhdGFbaSsrXTtcclxuICAgICAgICB2YXIgZyA9IGRhdGEuZGF0YVtpKytdO1xyXG4gICAgICAgIHZhciBiID0gZGF0YS5kYXRhW2krK107XHJcbiAgICAgICAgdmFyIGEgPSBkYXRhLmRhdGFbaSsrXTtcclxuICAgICAgICBpZiAoYSAhPSAwKSB7XHJcbiAgICAgICAgICBjb2xvci5zZXRSR0IociAvIDI1NS4wLCBnIC8gMjU1LjAsIGIgLyAyNTUuMCk7XHJcbiAgICAgICAgICB2YXIgdmVydCA9IG5ldyBUSFJFRS5WZWN0b3IzKCgoeCAtIHcgLyAyLjApKSAqIDIuMCwgKCh5IC0gaCAvIDIpKSAqIC0yLjAsIDAuMCk7XHJcbiAgICAgICAgICBnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKHZlcnQpO1xyXG4gICAgICAgICAgZ2VvbWV0cnkuY29sb3JzLnB1c2goY29sb3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNwcml0ZUdlb21ldHJ5KHNpemUpXHJcbntcclxuICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTtcclxuICB2YXIgc2l6ZUhhbGYgPSBzaXplIC8gMjtcclxuICAvLyBnZW9tZXRyeS5cclxuICBnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKG5ldyBUSFJFRS5WZWN0b3IzKC1zaXplSGFsZiwgc2l6ZUhhbGYsIDApKTtcclxuICBnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKG5ldyBUSFJFRS5WZWN0b3IzKHNpemVIYWxmLCBzaXplSGFsZiwgMCkpO1xyXG4gIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2gobmV3IFRIUkVFLlZlY3RvcjMoc2l6ZUhhbGYsIC1zaXplSGFsZiwgMCkpO1xyXG4gIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2gobmV3IFRIUkVFLlZlY3RvcjMoLXNpemVIYWxmLCAtc2l6ZUhhbGYsIDApKTtcclxuICBnZW9tZXRyeS5mYWNlcy5wdXNoKG5ldyBUSFJFRS5GYWNlMygwLCAyLCAxKSk7XHJcbiAgZ2VvbWV0cnkuZmFjZXMucHVzaChuZXcgVEhSRUUuRmFjZTMoMCwgMywgMikpO1xyXG4gIHJldHVybiBnZW9tZXRyeTtcclxufVxyXG5cclxuLy8vIOODhuOCr+OCueODgeODo+ODvOS4iuOBruaMh+WumuOCueODl+ODqeOCpOODiOOBrlVW5bqn5qiZ44KS5rGC44KB44KLXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTcHJpdGVVVihnZW9tZXRyeSwgdGV4dHVyZSwgY2VsbFdpZHRoLCBjZWxsSGVpZ2h0LCBjZWxsTm8pXHJcbntcclxuICB2YXIgd2lkdGggPSB0ZXh0dXJlLmltYWdlLndpZHRoO1xyXG4gIHZhciBoZWlnaHQgPSB0ZXh0dXJlLmltYWdlLmhlaWdodDtcclxuXHJcbiAgdmFyIHVDZWxsQ291bnQgPSAod2lkdGggLyBjZWxsV2lkdGgpIHwgMDtcclxuICB2YXIgdkNlbGxDb3VudCA9IChoZWlnaHQgLyBjZWxsSGVpZ2h0KSB8IDA7XHJcbiAgdmFyIHZQb3MgPSB2Q2VsbENvdW50IC0gKChjZWxsTm8gLyB1Q2VsbENvdW50KSB8IDApO1xyXG4gIHZhciB1UG9zID0gY2VsbE5vICUgdUNlbGxDb3VudDtcclxuICB2YXIgdVVuaXQgPSBjZWxsV2lkdGggLyB3aWR0aDsgXHJcbiAgdmFyIHZVbml0ID0gY2VsbEhlaWdodCAvIGhlaWdodDtcclxuXHJcbiAgZ2VvbWV0cnkuZmFjZVZlcnRleFV2c1swXS5wdXNoKFtcclxuICAgIG5ldyBUSFJFRS5WZWN0b3IyKCh1UG9zKSAqIGNlbGxXaWR0aCAvIHdpZHRoLCAodlBvcykgKiBjZWxsSGVpZ2h0IC8gaGVpZ2h0KSxcclxuICAgIG5ldyBUSFJFRS5WZWN0b3IyKCh1UG9zICsgMSkgKiBjZWxsV2lkdGggLyB3aWR0aCwgKHZQb3MgLSAxKSAqIGNlbGxIZWlnaHQgLyBoZWlnaHQpLFxyXG4gICAgbmV3IFRIUkVFLlZlY3RvcjIoKHVQb3MgKyAxKSAqIGNlbGxXaWR0aCAvIHdpZHRoLCAodlBvcykgKiBjZWxsSGVpZ2h0IC8gaGVpZ2h0KVxyXG4gIF0pO1xyXG4gIGdlb21ldHJ5LmZhY2VWZXJ0ZXhVdnNbMF0ucHVzaChbXHJcbiAgICBuZXcgVEhSRUUuVmVjdG9yMigodVBvcykgKiBjZWxsV2lkdGggLyB3aWR0aCwgKHZQb3MpICogY2VsbEhlaWdodCAvIGhlaWdodCksXHJcbiAgICBuZXcgVEhSRUUuVmVjdG9yMigodVBvcykgKiBjZWxsV2lkdGggLyB3aWR0aCwgKHZQb3MgLSAxKSAqIGNlbGxIZWlnaHQgLyBoZWlnaHQpLFxyXG4gICAgbmV3IFRIUkVFLlZlY3RvcjIoKHVQb3MgKyAxKSAqIGNlbGxXaWR0aCAvIHdpZHRoLCAodlBvcyAtIDEpICogY2VsbEhlaWdodCAvIGhlaWdodClcclxuICBdKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZVNwcml0ZVVWKGdlb21ldHJ5LCB0ZXh0dXJlLCBjZWxsV2lkdGgsIGNlbGxIZWlnaHQsIGNlbGxObylcclxue1xyXG4gIHZhciB3aWR0aCA9IHRleHR1cmUuaW1hZ2Uud2lkdGg7XHJcbiAgdmFyIGhlaWdodCA9IHRleHR1cmUuaW1hZ2UuaGVpZ2h0O1xyXG5cclxuICB2YXIgdUNlbGxDb3VudCA9ICh3aWR0aCAvIGNlbGxXaWR0aCkgfCAwO1xyXG4gIHZhciB2Q2VsbENvdW50ID0gKGhlaWdodCAvIGNlbGxIZWlnaHQpIHwgMDtcclxuICB2YXIgdlBvcyA9IHZDZWxsQ291bnQgLSAoKGNlbGxObyAvIHVDZWxsQ291bnQpIHwgMCk7XHJcbiAgdmFyIHVQb3MgPSBjZWxsTm8gJSB1Q2VsbENvdW50O1xyXG4gIHZhciB1VW5pdCA9IGNlbGxXaWR0aCAvIHdpZHRoO1xyXG4gIHZhciB2VW5pdCA9IGNlbGxIZWlnaHQgLyBoZWlnaHQ7XHJcbiAgdmFyIHV2cyA9IGdlb21ldHJ5LmZhY2VWZXJ0ZXhVdnNbMF1bMF07XHJcblxyXG4gIHV2c1swXS54ID0gKHVQb3MpICogdVVuaXQ7XHJcbiAgdXZzWzBdLnkgPSAodlBvcykgKiB2VW5pdDtcclxuICB1dnNbMV0ueCA9ICh1UG9zICsgMSkgKiB1VW5pdDtcclxuICB1dnNbMV0ueSA9ICh2UG9zIC0gMSkgKiB2VW5pdDtcclxuICB1dnNbMl0ueCA9ICh1UG9zICsgMSkgKiB1VW5pdDtcclxuICB1dnNbMl0ueSA9ICh2UG9zKSAqIHZVbml0O1xyXG5cclxuICB1dnMgPSBnZW9tZXRyeS5mYWNlVmVydGV4VXZzWzBdWzFdO1xyXG5cclxuICB1dnNbMF0ueCA9ICh1UG9zKSAqIHVVbml0O1xyXG4gIHV2c1swXS55ID0gKHZQb3MpICogdlVuaXQ7XHJcbiAgdXZzWzFdLnggPSAodVBvcykgKiB1VW5pdDtcclxuICB1dnNbMV0ueSA9ICh2UG9zIC0gMSkgKiB2VW5pdDtcclxuICB1dnNbMl0ueCA9ICh1UG9zICsgMSkgKiB1VW5pdDtcclxuICB1dnNbMl0ueSA9ICh2UG9zIC0gMSkgKiB2VW5pdDtcclxuXHJcbiBcclxuICBnZW9tZXRyeS51dnNOZWVkVXBkYXRlID0gdHJ1ZTtcclxuXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTcHJpdGVNYXRlcmlhbCh0ZXh0dXJlKVxyXG57XHJcbiAgLy8g44Oh44OD44K344Ol44Gu5L2c5oiQ44O76KGo56S6IC8vL1xyXG4gIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7IG1hcDogdGV4dHVyZSAvKixkZXB0aFRlc3Q6dHJ1ZSovLCB0cmFuc3BhcmVudDogdHJ1ZSB9KTtcclxuICBtYXRlcmlhbC5zaGFkaW5nID0gVEhSRUUuRmxhdFNoYWRpbmc7XHJcbiAgbWF0ZXJpYWwuc2lkZSA9IFRIUkVFLkZyb250U2lkZTtcclxuICBtYXRlcmlhbC5hbHBoYVRlc3QgPSAwLjU7XHJcbiAgbWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4vLyAgbWF0ZXJpYWwuXHJcbiAgcmV0dXJuIG1hdGVyaWFsO1xyXG59XHJcblxyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4vLyDjgq3jg7zlhaXliptcclxuZXhwb3J0IGZ1bmN0aW9uIEJhc2ljSW5wdXQoKSB7XHJcbiAgdGhpcy5rZXlDaGVjayA9IHsgdXA6IGZhbHNlLCBkb3duOiBmYWxzZSwgbGVmdDogZmFsc2UsIHJpZ2h0OiBmYWxzZSwgejogZmFsc2UgLHg6ZmFsc2UgfTtcclxuICB0aGlzLmtleUJ1ZmZlciA9IFtdO1xyXG4gIHRoaXMua2V5dXBfID0gbnVsbDtcclxuICB0aGlzLmtleWRvd25fID0gbnVsbDtcclxufVxyXG5cclxuQmFzaWNJbnB1dC5wcm90b3R5cGUgPSB7XHJcbiAgY2xlYXI6IGZ1bmN0aW9uKClcclxuICB7XHJcbiAgICBmb3IodmFyIGQgaW4gdGhpcy5rZXlDaGVjayl7XHJcbiAgICAgIHRoaXMua2V5Q2hlY2tbZF0gPSBmYWxzZTtcclxuICAgIH1cclxuICAgIHRoaXMua2V5QnVmZmVyLmxlbmd0aCA9IDA7XHJcbiAgfSxcclxuICBrZXlkb3duOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgdmFyIGUgPSBkMy5ldmVudDtcclxuICAgIHZhciBrZXlCdWZmZXIgPSB0aGlzLmtleUJ1ZmZlcjtcclxuICAgIHZhciBrZXlDaGVjayA9IHRoaXMua2V5Q2hlY2s7XHJcbiAgICB2YXIgaGFuZGxlID0gdHJ1ZTtcclxuICAgICBcclxuICAgIGlmIChlLmtleUNvZGUgPT0gMTkyKSB7XHJcbiAgICAgIENIRUNLX0NPTExJU0lPTiA9ICFDSEVDS19DT0xMSVNJT047XHJcbiAgICB9O1xyXG5cclxuICAgIGlmIChrZXlCdWZmZXIubGVuZ3RoID4gMTYpIHtcclxuICAgICAga2V5QnVmZmVyLnNoaWZ0KCk7XHJcbiAgICB9XHJcbiAgICBrZXlCdWZmZXIucHVzaChlLmtleUNvZGUpO1xyXG4gICAgc3dpdGNoIChlLmtleUNvZGUpIHtcclxuICAgICAgY2FzZSA3NDpcclxuICAgICAgY2FzZSAzNzpcclxuICAgICAgY2FzZSAxMDA6XHJcbiAgICAgICAga2V5Q2hlY2subGVmdCA9IHRydWU7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA3MzpcclxuICAgICAgY2FzZSAzODpcclxuICAgICAgY2FzZSAxMDQ6XHJcbiAgICAgICAga2V5Q2hlY2sudXAgPSB0cnVlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgNzY6XHJcbiAgICAgIGNhc2UgMzk6XHJcbiAgICAgIGNhc2UgMTAyOlxyXG4gICAgICAgIGtleUNoZWNrLnJpZ2h0ID0gdHJ1ZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDc1OlxyXG4gICAgICBjYXNlIDQwOlxyXG4gICAgICBjYXNlIDk4OlxyXG4gICAgICAgIGtleUNoZWNrLmRvd24gPSB0cnVlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgOTA6XHJcbiAgICAgICAga2V5Q2hlY2sueiA9IHRydWU7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA4ODpcclxuICAgICAgICBrZXlDaGVjay54ID0gdHJ1ZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgaWYgKGhhbmRsZSkge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIGUucmV0dXJuVmFsdWUgPSBmYWxzZTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAga2V5dXA6IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBlID0gZDMuZXZlbnQ7XHJcbiAgICB2YXIga2V5QnVmZmVyID0gdGhpcy5rZXlCdWZmZXI7XHJcbiAgICB2YXIga2V5Q2hlY2sgPSB0aGlzLmtleUNoZWNrO1xyXG4gICAgdmFyIGhhbmRsZSA9IGZhbHNlO1xyXG4gICAgc3dpdGNoIChlLmtleUNvZGUpIHtcclxuICAgICAgY2FzZSA3NDpcclxuICAgICAgY2FzZSAzNzpcclxuICAgICAgY2FzZSAxMDA6XHJcbiAgICAgICAga2V5Q2hlY2subGVmdCA9IGZhbHNlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgNzM6XHJcbiAgICAgIGNhc2UgMzg6XHJcbiAgICAgIGNhc2UgMTA0OlxyXG4gICAgICAgIGtleUNoZWNrLnVwID0gZmFsc2U7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA3NjpcclxuICAgICAgY2FzZSAzOTpcclxuICAgICAgY2FzZSAxMDI6XHJcbiAgICAgICAga2V5Q2hlY2sucmlnaHQgPSBmYWxzZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDc1OlxyXG4gICAgICBjYXNlIDQwOlxyXG4gICAgICBjYXNlIDk4OlxyXG4gICAgICAgIGtleUNoZWNrLmRvd24gPSBmYWxzZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDkwOlxyXG4gICAgICAgIGtleUNoZWNrLnogPSBmYWxzZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDg4OlxyXG4gICAgICAgIGtleUNoZWNrLnggPSBmYWxzZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgaWYgKGhhbmRsZSkge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIGUucmV0dXJuVmFsdWUgPSBmYWxzZTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgLy/jgqTjg5njg7Pjg4jjgavjg5DjgqTjg7Pjg4njgZnjgotcclxuICBiaW5kOmZ1bmN0aW9uKClcclxuICB7XHJcbiAgICBkMy5zZWxlY3QoJ2JvZHknKS5vbigna2V5ZG93bicsdGhpcy5rZXlkb3duLmJpbmQodGhpcykpO1xyXG4gICAgZDMuc2VsZWN0KCdib2R5Jykub24oJ2tleXVwJyx0aGlzLmtleXVwLmJpbmQodGhpcykpO1xyXG4gIH0sXHJcbiAgLy8g44Ki44Oz44OQ44Kk44Oz44OJ44GZ44KLXHJcbiAgdW5iaW5kOmZ1bmN0aW9uKClcclxuICB7XHJcbiAgICBkMy5zZWxlY3QoJ2JvZHknKS5vbigna2V5ZG93bicsbnVsbCk7XHJcbiAgICBkMy5zZWxlY3QoJ2JvZHknKS5vbigna2V5dXAnLG51bGwpO1xyXG4gIH1cclxufSIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuaW1wb3J0ICogYXMgc2ZnIGZyb20gJy4vZ2xvYmFsJztcclxuaW1wb3J0ICogYXMgZ2FtZW9iaiBmcm9tICcuL2dhbWVvYmonO1xyXG5pbXBvcnQgKiBhcyBncmFwaGljcyBmcm9tICcuL2dyYXBoaWNzJztcclxuXHJcbi8vLyDoh6rmqZ/lvL4gXHJcbmV4cG9ydCBmdW5jdGlvbiBNeUJ1bGxldChzY2VuZSxzZSkge1xyXG4gIGdhbWVvYmouR2FtZU9iai5jYWxsKHRoaXMsIDAsIDAsIDApO1xyXG5cclxuICB0aGlzLmNvbGxpc2lvbkFyZWEud2lkdGggPSA0O1xyXG4gIHRoaXMuY29sbGlzaW9uQXJlYS5oZWlnaHQgPSA2O1xyXG4gIHRoaXMuc3BlZWQgPSA4O1xyXG5cclxuICB0aGlzLnRleHR1cmVXaWR0aCA9IHNmZy50ZXh0dXJlRmlsZXMubXlzaGlwLmltYWdlLndpZHRoO1xyXG4gIHRoaXMudGV4dHVyZUhlaWdodCA9IHNmZy50ZXh0dXJlRmlsZXMubXlzaGlwLmltYWdlLmhlaWdodDtcclxuXHJcbiAgLy8g44Oh44OD44K344Ol44Gu5L2c5oiQ44O76KGo56S6IC8vL1xyXG5cclxuICB2YXIgbWF0ZXJpYWwgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVNYXRlcmlhbChzZmcudGV4dHVyZUZpbGVzLm15c2hpcCk7XHJcbiAgdmFyIGdlb21ldHJ5ID0gZ3JhcGhpY3MuY3JlYXRlU3ByaXRlR2VvbWV0cnkoMTYpO1xyXG4gIGdyYXBoaWNzLmNyZWF0ZVNwcml0ZVVWKGdlb21ldHJ5LCBzZmcudGV4dHVyZUZpbGVzLm15c2hpcCwgMTYsIDE2LCAxKTtcclxuICB0aGlzLm1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG5cclxuICB0aGlzLm1lc2gucG9zaXRpb24ueCA9IHRoaXMueF87XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnkgPSB0aGlzLnlfO1xyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi56ID0gdGhpcy56XztcclxuICB0aGlzLnNlID0gc2U7XHJcbiAgLy9zZSgwKTtcclxuICAvL3NlcXVlbmNlci5wbGF5VHJhY2tzKHNvdW5kRWZmZWN0cy5zb3VuZEVmZmVjdHNbMF0pO1xyXG4gIHNjZW5lLmFkZCh0aGlzLm1lc2gpO1xyXG4gIHRoaXMubWVzaC52aXNpYmxlID0gdGhpcy5lbmFibGVfID0gZmFsc2U7XHJcbiAgLy8gIHNmZy50YXNrcy5wdXNoVGFzayhmdW5jdGlvbiAodGFza0luZGV4KSB7IHNlbGYubW92ZSh0YXNrSW5kZXgpOyB9KTtcclxufVxyXG5cclxudmFyIG15QnVsbGV0cyA9IFtdO1xyXG5cclxuTXlCdWxsZXQucHJvdG90eXBlID0ge1xyXG4gIGdldCB4KCkgeyByZXR1cm4gdGhpcy54XzsgfSxcclxuICBzZXQgeCh2KSB7IHRoaXMueF8gPSB0aGlzLm1lc2gucG9zaXRpb24ueCA9IHY7IH0sXHJcbiAgZ2V0IHkoKSB7IHJldHVybiB0aGlzLnlfOyB9LFxyXG4gIHNldCB5KHYpIHsgdGhpcy55XyA9IHRoaXMubWVzaC5wb3NpdGlvbi55ID0gdjsgfSxcclxuICBnZXQgeigpIHsgcmV0dXJuIHRoaXMuel87IH0sXHJcbiAgc2V0IHoodikgeyB0aGlzLnpfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnogPSB2OyB9LFxyXG4gIG1vdmU6IGZ1bmN0aW9uICh0YXNrSW5kZXgpIHtcclxuICAgIGlmICghdGhpcy5lbmFibGVfKSB7XHJcbiAgICAgIHRoaXMubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgIHNmZy50YXNrcy5yZW1vdmVUYXNrKHRhc2tJbmRleCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnkgKz0gdGhpcy5keTtcclxuICAgIHRoaXMueCArPSB0aGlzLmR4O1xyXG5cclxuICAgIGlmICh0aGlzLnkgPiAoc2ZnLlZfVE9QICsgMTYpIHx8IHRoaXMueSA8IChzZmcuVl9CT1RUT00gLSAxNikgfHwgdGhpcy54ID4gKHNmZy5WX1JJR0hUICsgMTYpIHx8IHRoaXMueCA8IChzZmcuVl9MRUZUIC0gMTYpKSB7XHJcbiAgICAgIHNmZy50YXNrcy5yZW1vdmVUYXNrKHRhc2tJbmRleCk7XHJcbiAgICAgIHRoaXMuZW5hYmxlXyA9IHRoaXMubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICB9O1xyXG4gIH0sXHJcblxyXG4gIHN0YXJ0OiBmdW5jdGlvbiAoeCwgeSwgeiwgYWltUmFkaWFuKSB7XHJcbiAgICBpZiAodGhpcy5lbmFibGVfKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHRoaXMueCA9IHg7XHJcbiAgICB0aGlzLnkgPSB5O1xyXG4gICAgdGhpcy56ID0geiAtIDAuMTtcclxuICAgIHRoaXMuZHggPSBNYXRoLmNvcyhhaW1SYWRpYW4pICogdGhpcy5zcGVlZDtcclxuICAgIHRoaXMuZHkgPSBNYXRoLnNpbihhaW1SYWRpYW4pICogdGhpcy5zcGVlZDtcclxuICAgIHRoaXMuZW5hYmxlXyA9IHRoaXMubWVzaC52aXNpYmxlID0gdHJ1ZTtcclxuICAgIHRoaXMuc2UoMCk7XHJcbiAgICAvL3NlcXVlbmNlci5wbGF5VHJhY2tzKHNvdW5kRWZmZWN0cy5zb3VuZEVmZmVjdHNbMF0pO1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgc2ZnLnRhc2tzLnB1c2hUYXNrKGZ1bmN0aW9uIChpKSB7IHNlbGYubW92ZShpKTsgfSk7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDoh6rmqZ/jgqrjg5bjgrjjgqfjgq/jg4hcclxuZXhwb3J0IGZ1bmN0aW9uIE15U2hpcCh4LCB5LCB6LHNjZW5lLHNlKSB7XHJcbiAgZ2FtZW9iai5HYW1lT2JqLmNhbGwodGhpcywgeCwgeSwgeik7Ly8gZXh0ZW5kXHJcblxyXG4gIHRoaXMuY29sbGlzaW9uQXJlYS53aWR0aCA9IDY7XHJcbiAgdGhpcy5jb2xsaXNpb25BcmVhLmhlaWdodCA9IDg7XHJcbiAgdGhpcy5zZSA9IHNlO1xyXG4gIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuXHJcbiAgdGhpcy50ZXh0dXJlV2lkdGggPSBzZmcudGV4dHVyZUZpbGVzLm15c2hpcC5pbWFnZS53aWR0aDtcclxuICB0aGlzLnRleHR1cmVIZWlnaHQgPSBzZmcudGV4dHVyZUZpbGVzLm15c2hpcC5pbWFnZS5oZWlnaHQ7XHJcblxyXG4gIHRoaXMud2lkdGggPSAxNjtcclxuICB0aGlzLmhlaWdodCA9IDE2O1xyXG5cclxuICAvLyDnp7vli5Xnr4Tlm7LjgpLmsYLjgoHjgotcclxuICB0aGlzLnRvcCA9IChzZmcuVl9UT1AgLSB0aGlzLmhlaWdodCAvIDIpIHwgMDtcclxuICB0aGlzLmJvdHRvbSA9IChzZmcuVl9CT1RUT00gKyB0aGlzLmhlaWdodCAvIDIpIHwgMDtcclxuICB0aGlzLmxlZnQgPSAoc2ZnLlZfTEVGVCArIHRoaXMud2lkdGggLyAyKSB8IDA7XHJcbiAgdGhpcy5yaWdodCA9IChzZmcuVl9SSUdIVCAtIHRoaXMud2lkdGggLyAyKSB8IDA7XHJcblxyXG4gIC8vIOODoeODg+OCt+ODpeOBruS9nOaIkOODu+ihqOekulxyXG4gIC8vIOODnuODhuODquOCouODq+OBruS9nOaIkFxyXG4gIHZhciBtYXRlcmlhbCA9IGdyYXBoaWNzLmNyZWF0ZVNwcml0ZU1hdGVyaWFsKHNmZy50ZXh0dXJlRmlsZXMubXlzaGlwKTtcclxuICAvLyDjgrjjgqrjg6Hjg4jjg6rjga7kvZzmiJBcclxuICB2YXIgZ2VvbWV0cnkgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVHZW9tZXRyeSh0aGlzLndpZHRoKTtcclxuICBncmFwaGljcy5jcmVhdGVTcHJpdGVVVihnZW9tZXRyeSwgc2ZnLnRleHR1cmVGaWxlcy5teXNoaXAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCAwKTtcclxuXHJcbiAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuXHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnggPSB0aGlzLnhfO1xyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi55ID0gdGhpcy55XztcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueiA9IHRoaXMuel87XHJcbiAgdGhpcy5yZXN0ID0gMztcclxuICB0aGlzLm15QnVsbGV0cyA9ICggKCk9PiB7XHJcbiAgICB2YXIgYXJyID0gW107XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDI7ICsraSkge1xyXG4gICAgICBhcnIucHVzaChuZXcgTXlCdWxsZXQodGhpcy5zY2VuZSx0aGlzLnNlKSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXJyO1xyXG4gIH0pKCk7XHJcbiAgc2NlbmUuYWRkKHRoaXMubWVzaCk7XHJcbn1cclxuXHJcblxyXG4vL015U2hpcC5wcm90b3R5cGUgPSBuZXcgR2FtZU9iaigpO1xyXG5cclxuTXlTaGlwLnByb3RvdHlwZSA9IHtcclxuICBnZXQgeCgpIHsgcmV0dXJuIHRoaXMueF87IH0sXHJcbiAgc2V0IHgodikgeyB0aGlzLnhfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnggPSB2OyB9LFxyXG4gIGdldCB5KCkgeyByZXR1cm4gdGhpcy55XzsgfSxcclxuICBzZXQgeSh2KSB7IHRoaXMueV8gPSB0aGlzLm1lc2gucG9zaXRpb24ueSA9IHY7IH0sXHJcbiAgZ2V0IHooKSB7IHJldHVybiB0aGlzLnpfOyB9LFxyXG4gIHNldCB6KHYpIHsgdGhpcy56XyA9IHRoaXMubWVzaC5wb3NpdGlvbi56ID0gdjsgfSxcclxuICBzaG9vdDogZnVuY3Rpb24gKGFpbVJhZGlhbikge1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHRoaXMubXlCdWxsZXRzLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIGlmICh0aGlzLm15QnVsbGV0c1tpXS5zdGFydCh0aGlzLngsIHRoaXMueSAsIHRoaXMueixhaW1SYWRpYW4pKSB7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG4gIGFjdGlvbjogZnVuY3Rpb24gKGJhc2ljSW5wdXQpIHtcclxuICAgIGlmIChiYXNpY0lucHV0LmtleUNoZWNrLmxlZnQpIHtcclxuICAgICAgaWYgKHRoaXMueCA+IHRoaXMubGVmdCkge1xyXG4gICAgICAgIHRoaXMueCAtPSAyO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGJhc2ljSW5wdXQua2V5Q2hlY2sucmlnaHQpIHtcclxuICAgICAgaWYgKHRoaXMueCA8IHRoaXMucmlnaHQpIHtcclxuICAgICAgICB0aGlzLnggKz0gMjtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChiYXNpY0lucHV0LmtleUNoZWNrLnVwKSB7XHJcbiAgICAgIGlmICh0aGlzLnkgPCB0aGlzLnRvcCkge1xyXG4gICAgICAgIHRoaXMueSArPSAyO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGJhc2ljSW5wdXQua2V5Q2hlY2suZG93bikge1xyXG4gICAgICBpZiAodGhpcy55ID4gdGhpcy5ib3R0b20pIHtcclxuICAgICAgICB0aGlzLnkgLT0gMjtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBpZiAoYmFzaWNJbnB1dC5rZXlDaGVjay56KSB7XHJcbiAgICAgIGJhc2ljSW5wdXQua2V5Q2hlY2sueiA9IGZhbHNlO1xyXG4gICAgICB0aGlzLnNob290KDAuNSAqIE1hdGguUEkpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChiYXNpY0lucHV0LmtleUNoZWNrLngpIHtcclxuICAgICAgYmFzaWNJbnB1dC5rZXlDaGVjay54ID0gZmFsc2U7XHJcbiAgICAgIHRoaXMuc2hvb3QoMS41ICogTWF0aC5QSSk7XHJcbiAgICB9XHJcbiAgfSxcclxuICBoaXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICBzZmcuYm9tYnMuc3RhcnQodGhpcy54LCB0aGlzLnksIDAuMik7XHJcbiAgICB0aGlzLnNlKDQpO1xyXG4gIH1cclxuXHJcbn0iLCJcInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0ICogYXMgc2ZnIGZyb20gJy4vZ2xvYmFsJztcclxuLy9pbXBvcnQgKiAgYXMgZ2FtZW9iaiBmcm9tICcuL2dhbWVvYmonO1xyXG4vL2ltcG9ydCAqIGFzIGdyYXBoaWNzIGZyb20gJy4vZ3JhcGhpY3MnO1xyXG5cclxuLy8vIOODhuOCreOCueODiOWxnuaAp1xyXG5leHBvcnQgZnVuY3Rpb24gVGV4dEF0dHJpYnV0ZShibGluaywgZm9udCkge1xyXG4gIGlmIChibGluaykge1xyXG4gICAgdGhpcy5ibGluayA9IGJsaW5rO1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0aGlzLmJsaW5rID0gZmFsc2U7XHJcbiAgfVxyXG4gIGlmIChmb250KSB7XHJcbiAgICB0aGlzLmZvbnQgPSBmb250O1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0aGlzLmZvbnQgPSBzZmcudGV4dHVyZUZpbGVzLmZvbnQ7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g44OG44Kt44K544OI44OX44Os44O844OzXHJcbmV4cG9ydCBmdW5jdGlvbiBUZXh0UGxhbmUoc2NlbmUpIHtcclxuICB0aGlzLnRleHRCdWZmZXIgPSBuZXcgQXJyYXkoc2ZnLlRFWFRfSEVJR0hUKTtcclxuICB0aGlzLmF0dHJCdWZmZXIgPSBuZXcgQXJyYXkoc2ZnLlRFWFRfSEVJR0hUKTtcclxuICB0aGlzLnRleHRCYWNrQnVmZmVyID0gbmV3IEFycmF5KHNmZy5URVhUX0hFSUdIVCk7XHJcbiAgdGhpcy5hdHRyQmFja0J1ZmZlciA9IG5ldyBBcnJheShzZmcuVEVYVF9IRUlHSFQpO1xyXG4gIHZhciBlbmRpID0gdGhpcy50ZXh0QnVmZmVyLmxlbmd0aDtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGVuZGk7ICsraSkge1xyXG4gICAgdGhpcy50ZXh0QnVmZmVyW2ldID0gbmV3IEFycmF5KHNmZy5URVhUX1dJRFRIKTtcclxuICAgIHRoaXMuYXR0ckJ1ZmZlcltpXSA9IG5ldyBBcnJheShzZmcuVEVYVF9XSURUSCk7XHJcbiAgICB0aGlzLnRleHRCYWNrQnVmZmVyW2ldID0gbmV3IEFycmF5KHNmZy5URVhUX1dJRFRIKTtcclxuICAgIHRoaXMuYXR0ckJhY2tCdWZmZXJbaV0gPSBuZXcgQXJyYXkoc2ZnLlRFWFRfV0lEVEgpO1xyXG4gIH1cclxuXHJcblxyXG4gIC8vIOaPj+eUu+eUqOOCreODo+ODs+ODkOOCueOBruOCu+ODg+ODiOOCouODg+ODl1xyXG5cclxuICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gIHZhciB3aWR0aCA9IDE7XHJcbiAgd2hpbGUgKHdpZHRoIDw9IHNmZy5WSVJUVUFMX1dJRFRIKXtcclxuICAgIHdpZHRoICo9IDI7XHJcbiAgfVxyXG4gIHZhciBoZWlnaHQgPSAxO1xyXG4gIHdoaWxlIChoZWlnaHQgPD0gc2ZnLlZJUlRVQUxfSEVJR0hUKXtcclxuICAgIGhlaWdodCAqPSAyO1xyXG4gIH1cclxuICBcclxuICB0aGlzLmNhbnZhcy53aWR0aCA9IHdpZHRoO1xyXG4gIHRoaXMuY2FudmFzLmhlaWdodCA9IGhlaWdodDtcclxuICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgdGhpcy50ZXh0dXJlID0gbmV3IFRIUkVFLlRleHR1cmUodGhpcy5jYW52YXMpO1xyXG4gIHRoaXMudGV4dHVyZS5tYWdGaWx0ZXIgPSBUSFJFRS5OZWFyZXN0RmlsdGVyO1xyXG4gIHRoaXMudGV4dHVyZS5taW5GaWx0ZXIgPSBUSFJFRS5MaW5lYXJNaXBNYXBMaW5lYXJGaWx0ZXI7XHJcbiAgdGhpcy5tYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7IG1hcDogdGhpcy50ZXh0dXJlLGFscGhhVGVzdDowLjUsIHRyYW5zcGFyZW50OiB0cnVlLGRlcHRoVGVzdDp0cnVlLHNoYWRpbmc6VEhSRUUuRmxhdFNoYWRpbmd9KTtcclxuLy8gIHRoaXMuZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeShzZmcuVklSVFVBTF9XSURUSCwgc2ZnLlZJUlRVQUxfSEVJR0hUKTtcclxuICB0aGlzLmdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkod2lkdGgsIGhlaWdodCk7XHJcbiAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2godGhpcy5nZW9tZXRyeSwgdGhpcy5tYXRlcmlhbCk7XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnogPSAwLjQ7XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnggPSAod2lkdGggLSBzZmcuVklSVFVBTF9XSURUSCkgLyAyO1xyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi55ID0gIC0gKGhlaWdodCAtIHNmZy5WSVJUVUFMX0hFSUdIVCkgLyAyO1xyXG4gIHRoaXMuZm9udHMgPSB7IGZvbnQ6IHNmZy50ZXh0dXJlRmlsZXMuZm9udCwgZm9udDE6IHNmZy50ZXh0dXJlRmlsZXMuZm9udDEgfTtcclxuICB0aGlzLmJsaW5rQ291bnQgPSAwO1xyXG4gIHRoaXMuYmxpbmsgPSBmYWxzZTtcclxuXHJcbiAgLy8g44K544Og44O844K444Oz44Kw44KS5YiH44KLXHJcbiAgdGhpcy5jdHgubXNJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICB0aGlzLmN0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICAvL3RoaXMuY3R4LndlYmtpdEltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIHRoaXMuY3R4Lm1vekltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG5cclxuICB0aGlzLmNscygpO1xyXG4gIHNjZW5lLmFkZCh0aGlzLm1lc2gpO1xyXG59XHJcblxyXG5UZXh0UGxhbmUucHJvdG90eXBlID0ge1xyXG4gIGNvbnN0cnVjdG9yOlRleHRQbGFuZSxcclxuICAvLy8g55S76Z2i5raI5Y67XHJcbiAgY2xzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kaSA9IHRoaXMudGV4dEJ1ZmZlci5sZW5ndGg7IGkgPCBlbmRpOyArK2kpIHtcclxuICAgICAgdmFyIGxpbmUgPSB0aGlzLnRleHRCdWZmZXJbaV07XHJcbiAgICAgIHZhciBhdHRyX2xpbmUgPSB0aGlzLmF0dHJCdWZmZXJbaV07XHJcbiAgICAgIHZhciBsaW5lX2JhY2sgPSB0aGlzLnRleHRCYWNrQnVmZmVyW2ldO1xyXG4gICAgICB2YXIgYXR0cl9saW5lX2JhY2sgPSB0aGlzLmF0dHJCYWNrQnVmZmVyW2ldO1xyXG5cclxuICAgICAgZm9yICh2YXIgaiA9IDAsIGVuZGogPSB0aGlzLnRleHRCdWZmZXJbaV0ubGVuZ3RoOyBqIDwgZW5kajsgKytqKSB7XHJcbiAgICAgICAgbGluZVtqXSA9IDB4MjA7XHJcbiAgICAgICAgYXR0cl9saW5lW2pdID0gMHgwMDtcclxuICAgICAgICAvL2xpbmVfYmFja1tqXSA9IDB4MjA7XHJcbiAgICAgICAgLy9hdHRyX2xpbmVfYmFja1tqXSA9IDB4MDA7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCBzZmcuVklSVFVBTF9XSURUSCwgc2ZnLlZJUlRVQUxfSEVJR0hUKTtcclxuICB9LFxyXG5cclxuICAvLy8g5paH5a2X6KGo56S644GZ44KLXHJcbiAgcHJpbnQ6IGZ1bmN0aW9uICh4LCB5LCBzdHIsIGF0dHJpYnV0ZSkge1xyXG4gICAgdmFyIGxpbmUgPSB0aGlzLnRleHRCdWZmZXJbeV07XHJcbiAgICB2YXIgYXR0ciA9IHRoaXMuYXR0ckJ1ZmZlclt5XTtcclxuICAgIGlmICghYXR0cmlidXRlKSB7XHJcbiAgICAgIGF0dHJpYnV0ZSA9IDA7XHJcbiAgICB9XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7ICsraSkge1xyXG4gICAgICB2YXIgYyA9IHN0ci5jaGFyQ29kZUF0KGkpO1xyXG4gICAgICBpZiAoYyA9PSAweGEpIHtcclxuICAgICAgICArK3k7XHJcbiAgICAgICAgaWYgKHkgPj0gdGhpcy50ZXh0QnVmZmVyLmxlbmd0aCkge1xyXG4gICAgICAgICAgLy8g44K544Kv44Ot44O844OrXHJcbiAgICAgICAgICB0aGlzLnRleHRCdWZmZXIgPSB0aGlzLnRleHRCdWZmZXIuc2xpY2UoMSwgdGhpcy50ZXh0QnVmZmVyLmxlbmd0aCAtIDEpO1xyXG4gICAgICAgICAgdGhpcy50ZXh0QnVmZmVyLnB1c2gobmV3IEFycmF5KHNmZy5WSVJUVUFMX1dJRFRIIC8gOCkpO1xyXG4gICAgICAgICAgdGhpcy5hdHRyQnVmZmVyID0gdGhpcy5hdHRyQnVmZmVyLnNsaWNlKDEsIHRoaXMuYXR0ckJ1ZmZlci5sZW5ndGggLSAxKTtcclxuICAgICAgICAgIHRoaXMuYXR0ckJ1ZmZlci5wdXNoKG5ldyBBcnJheShzZmcuVklSVFVBTF9XSURUSCAvIDgpKTtcclxuICAgICAgICAgIC0teTtcclxuICAgICAgICAgIHZhciBlbmRqID0gdGhpcy50ZXh0QnVmZmVyW3ldLmxlbmd0aDtcclxuICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgZW5kajsgKytqKSB7XHJcbiAgICAgICAgICAgIHRoaXMudGV4dEJ1ZmZlclt5XVtqXSA9IDB4MjA7XHJcbiAgICAgICAgICAgIHRoaXMuYXR0ckJ1ZmZlclt5XVtqXSA9IDB4MDA7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxpbmUgPSB0aGlzLnRleHRCdWZmZXJbeV07XHJcbiAgICAgICAgYXR0ciA9IHRoaXMuYXR0ckJ1ZmZlclt5XTtcclxuICAgICAgICB4ID0gMDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBsaW5lW3hdID0gYztcclxuICAgICAgICBhdHRyW3hdID0gYXR0cmlidXRlO1xyXG4gICAgICAgICsreDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgLy8vIOODhuOCreOCueODiOODh+ODvOOCv+OCkuOCguOBqOOBq+ODhuOCr+OCueODgeODo+ODvOOBq+aPj+eUu+OBmeOCi1xyXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGN0eCA9IHRoaXMuY3R4O1xyXG4gICAgdGhpcy5ibGlua0NvdW50ID0gKHRoaXMuYmxpbmtDb3VudCArIDEpICYgMHhmO1xyXG5cclxuICAgIHZhciBkcmF3X2JsaW5rID0gZmFsc2U7XHJcbiAgICBpZiAoIXRoaXMuYmxpbmtDb3VudCkge1xyXG4gICAgICB0aGlzLmJsaW5rID0gIXRoaXMuYmxpbms7XHJcbiAgICAgIGRyYXdfYmxpbmsgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgdmFyIHVwZGF0ZSA9IGZhbHNlO1xyXG4vLyAgICBjdHguY2xlYXJSZWN0KDAsIDAsIENPTlNPTEVfV0lEVEgsIENPTlNPTEVfSEVJR0hUKTtcclxuLy8gICAgY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuXHJcbiAgICBmb3IgKHZhciB5ID0gMCwgZ3kgPSAwOyB5IDwgc2ZnLlRFWFRfSEVJR0hUOyArK3ksIGd5ICs9IHNmZy5BQ1RVQUxfQ0hBUl9TSVpFKSB7XHJcbiAgICAgIHZhciBsaW5lID0gdGhpcy50ZXh0QnVmZmVyW3ldO1xyXG4gICAgICB2YXIgYXR0cl9saW5lID0gdGhpcy5hdHRyQnVmZmVyW3ldO1xyXG4gICAgICB2YXIgbGluZV9iYWNrID0gdGhpcy50ZXh0QmFja0J1ZmZlclt5XTtcclxuICAgICAgdmFyIGF0dHJfbGluZV9iYWNrID0gdGhpcy5hdHRyQmFja0J1ZmZlclt5XTtcclxuICAgICAgZm9yICh2YXIgeCA9IDAsIGd4ID0gMDsgeCA8IHNmZy5URVhUX1dJRFRIOyArK3gsIGd4ICs9IHNmZy5BQ1RVQUxfQ0hBUl9TSVpFKSB7XHJcbiAgICAgICAgdmFyIHByb2Nlc3NfYmxpbmsgPSAoYXR0cl9saW5lW3hdICYmIGF0dHJfbGluZVt4XS5ibGluayk7XHJcbiAgICAgICAgaWYgKGxpbmVbeF0gIT0gbGluZV9iYWNrW3hdIHx8IGF0dHJfbGluZVt4XSAhPSBhdHRyX2xpbmVfYmFja1t4XSB8fCAocHJvY2Vzc19ibGluayAmJiBkcmF3X2JsaW5rKSkge1xyXG4gICAgICAgICAgdXBkYXRlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICBsaW5lX2JhY2tbeF0gPSBsaW5lW3hdO1xyXG4gICAgICAgICAgYXR0cl9saW5lX2JhY2tbeF0gPSBhdHRyX2xpbmVbeF07XHJcbiAgICAgICAgICB2YXIgYyA9IDA7XHJcbiAgICAgICAgICBpZiAoIXByb2Nlc3NfYmxpbmsgfHwgdGhpcy5ibGluaykge1xyXG4gICAgICAgICAgICBjID0gbGluZVt4XSAtIDB4MjA7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB2YXIgeXBvcyA9IChjID4+IDQpIDw8IDM7XHJcbiAgICAgICAgICB2YXIgeHBvcyA9IChjICYgMHhmKSA8PCAzO1xyXG4gICAgICAgICAgY3R4LmNsZWFyUmVjdChneCwgZ3ksIHNmZy5BQ1RVQUxfQ0hBUl9TSVpFLCBzZmcuQUNUVUFMX0NIQVJfU0laRSk7XHJcbiAgICAgICAgICB2YXIgZm9udCA9IGF0dHJfbGluZVt4XSA/IGF0dHJfbGluZVt4XS5mb250IDogc2ZnLnRleHR1cmVGaWxlcy5mb250O1xyXG4gICAgICAgICAgaWYgKGMpIHtcclxuICAgICAgICAgICAgY3R4LmRyYXdJbWFnZShmb250LmltYWdlLCB4cG9zLCB5cG9zLCBzZmcuQ0hBUl9TSVpFLCBzZmcuQ0hBUl9TSVpFLCBneCwgZ3ksIHNmZy5BQ1RVQUxfQ0hBUl9TSVpFLCBzZmcuQUNUVUFMX0NIQVJfU0laRSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLnRleHR1cmUubmVlZHNVcGRhdGUgPSB1cGRhdGU7XHJcbiAgfVxyXG59XHJcbiIsIlxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBUYXNrKGZ1bmMscHJpb3JpdHkpIHtcclxuICB0aGlzLnByaW9yaXR5ID0gcHJpb3JpdHkgfHwgMTAwMDA7XHJcbiAgdGhpcy5mdW5jID0gZnVuYztcclxuICB0aGlzLmluZGV4ID0gMDtcclxufVxyXG5cclxuZXhwb3J0IHZhciBudWxsVGFzayA9IG5ldyBUYXNrKG51bGwpO1xyXG5cclxuLy8vIOOCv+OCueOCr+euoeeQhlxyXG5leHBvcnQgZnVuY3Rpb24gVGFza3MoKSB7XHJcbiAgdGhpcy5hcnJheSA9IG5ldyBBcnJheSgwKTtcclxuICB0aGlzLm5lZWRTb3J0ID0gZmFsc2U7XHJcbiAgdGhpcy5uZWVkQ29tcHJlc3MgPSBmYWxzZTtcclxufVxyXG5cclxuXHJcblRhc2tzLnByb3RvdHlwZSA9IHtcclxuICAvLyBpbmRleOOBruS9jee9ruOBruOCv+OCueOCr+OCkue9ruOBjeaPm+OBiOOCi1xyXG4gIHNldE5leHRUYXNrOiBmdW5jdGlvbiAoaW5kZXgsIGZ1bmMsIHByaW9yaXR5KSB7XHJcbiAgICB2YXIgdCA9IG5ldyBUYXNrKGZ1bmMsIHByaW9yaXR5KTtcclxuICAgIHQuaW5kZXggPSBpbmRleDtcclxuICAgIHRoaXMuYXJyYXlbaW5kZXhdID0gdDtcclxuICAgIHRoaXMubmVlZFNvcnQgPSB0cnVlO1xyXG4gIH0sXHJcblxyXG4gIHB1c2hUYXNrOiBmdW5jdGlvbiAoZnVuYywgcHJpb3JpdHkpIHtcclxuICAgIHZhciB0ID0gbmV3IFRhc2soZnVuYywgcHJpb3JpdHkpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmFycmF5Lmxlbmd0aDsgKytpKSB7XHJcbiAgICAgIGlmICh0aGlzLmFycmF5W2ldID09IG51bGxUYXNrKSB7XHJcbiAgICAgICAgdGhpcy5hcnJheVtpXSA9IHQ7XHJcbiAgICAgICAgdC5pbmRleCA9IGk7XHJcbiAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHQuaW5kZXggPSB0aGlzLmFycmF5Lmxlbmd0aDtcclxuICAgIHRoaXMuYXJyYXlbdGhpcy5hcnJheS5sZW5ndGhdID0gdDtcclxuICAgIHRoaXMubmVlZFNvcnQgPSB0cnVlO1xyXG4gICAgcmV0dXJuIHQ7XHJcbiAgfSxcclxuICAvLyDphY3liJfjgpLlj5blvpfjgZnjgotcclxuICBnZXRBcnJheTogZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuYXJyYXk7XHJcbiAgfSxcclxuICAvLyDjgr/jgrnjgq/jgpLjgq/jg6rjgqLjgZnjgotcclxuICBjbGVhcjogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5hcnJheS5sZW5ndGggPSAwO1xyXG4gIH0sXHJcbiAgLy8g44K944O844OI44GM5b+F6KaB44GL44OB44Kn44OD44Kv44GX44CB44K944O844OI44GZ44KLXHJcbiAgY2hlY2tTb3J0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAodGhpcy5uZWVkU29ydCkge1xyXG4gICAgICB0aGlzLmFycmF5LnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcclxuICAgICAgICBpZihhLnByaW9yaXR5ID4gYi5wcmlvcml0eSkgcmV0dXJuIDE7XHJcbiAgICAgICAgaWYgKGEucHJpb3JpdHkgPCBiLnByaW9yaXR5KSByZXR1cm4gLTE7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgIH0pO1xyXG4gICAgICAvLyDjgqTjg7Pjg4fjg4Pjgq/jgrnjga7mjK/jgornm7TjgZdcclxuICAgICAgZm9yICh2YXIgaSA9IDAsIGUgPSB0aGlzLmFycmF5Lmxlbmd0aDsgaSA8IGU7ICsraSkge1xyXG4gICAgICAgIHRoaXMuYXJyYXlbaV0uaW5kZXggPSBpO1xyXG4gICAgICB9XHJcbiAgICAgdGhpcy5uZWVkU29ydCA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgcmVtb3ZlVGFzazogZnVuY3Rpb24gKGluZGV4KSB7XHJcbiAgICB0aGlzLmFycmF5W2luZGV4XSA9IG51bGxUYXNrO1xyXG4gICAgdGhpcy5uZWVkQ29tcHJlc3MgPSB0cnVlO1xyXG4gIH0sXHJcbiAgY29tcHJlc3M6IGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICghdGhpcy5uZWVkQ29tcHJlc3MpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdmFyIGRlc3QgPSBbXTtcclxuICAgIHZhciBzcmMgPSB0aGlzLmFycmF5O1xyXG4gICAgdmFyIGRlc3RJbmRleCA9IDA7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gc3JjLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIHZhciBzID0gc3JjW2ldO1xyXG4gICAgICBpZiAocyAhPSBudWxsVGFzaykge1xyXG4gICAgICAgIHMuaW5kZXggPSBkZXN0SW5kZXg7XHJcbiAgICAgICAgZGVzdC5wdXNoKHMpO1xyXG4gICAgICAgIGRlc3RJbmRleCsrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLmFycmF5ID0gZGVzdDtcclxuICAgIHRoaXMubmVlZENvbXByZXNzID0gZmFsc2U7XHJcbiAgfVxyXG59O1xyXG5cclxuXHJcbi8vLyDjgrLjg7zjg6DnlKjjgr/jgqTjg57jg7xcclxuZXhwb3J0IGZ1bmN0aW9uIEdhbWVUaW1lcihnZXRDdXJyZW50VGltZSkge1xyXG4gIHRoaXMuZWxhcHNlZFRpbWUgPSAwO1xyXG4gIHRoaXMuY3VycmVudFRpbWUgPSAwO1xyXG4gIHRoaXMucGF1c2VUaW1lID0gMDtcclxuICB0aGlzLnN0YXR1cyA9IHRoaXMuU1RPUDtcclxuICB0aGlzLmdldEN1cnJlbnRUaW1lID0gZ2V0Q3VycmVudFRpbWU7XHJcbn1cclxuXHJcbkdhbWVUaW1lci5wcm90b3R5cGUgPSB7XHJcbiAgc3RhcnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuZWxhcHNlZFRpbWUgPSAwO1xyXG4gICAgdGhpcy5kZWx0YVRpbWUgPSAwO1xyXG4gICAgdGhpcy5jdXJyZW50VGltZSA9IHRoaXMuZ2V0Q3VycmVudFRpbWUoKTtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5TVEFSVDtcclxuICB9LFxyXG4gIHJlc3VtZTogZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIG5vd1RpbWUgPSB0aGlzLmdldEN1cnJlbnRUaW1lKCk7XHJcbiAgICB0aGlzLmN1cnJlbnRUaW1lID0gdGhpcy5jdXJyZW50VGltZSArIG5vd1RpbWUgLSB0aGlzLnBhdXNlVGltZTtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5TVEFSVDtcclxuICB9LFxyXG4gIHBhdXNlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLnBhdXNlVGltZSA9IHRoaXMuZ2V0Q3VycmVudFRpbWUoKTtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5QQVVTRTtcclxuICB9LFxyXG4gIHN0b3A6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5TVE9QO1xyXG4gIH0sXHJcbiAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAodGhpcy5zdGF0dXMgIT0gdGhpcy5TVEFSVCkgcmV0dXJuO1xyXG4gICAgdmFyIG5vd1RpbWUgPSB0aGlzLmdldEN1cnJlbnRUaW1lKCk7XHJcbiAgICB0aGlzLmRlbHRhVGltZSA9IG5vd1RpbWUgLSB0aGlzLmN1cnJlbnRUaW1lO1xyXG4gICAgdGhpcy5lbGFwc2VkVGltZSA9IHRoaXMuZWxhcHNlZFRpbWUgKyB0aGlzLmRlbHRhVGltZTtcclxuICAgIHRoaXMuY3VycmVudFRpbWUgPSBub3dUaW1lO1xyXG4gIH0sXHJcbiAgU1RPUDogMSxcclxuICBTVEFSVDogMixcclxuICBQQVVTRTogM1xyXG59XHJcblxyXG5cclxuIl19
