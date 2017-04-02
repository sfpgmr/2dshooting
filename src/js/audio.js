"use strict";
//// Web Audio API ラッパークラス ////
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
};// 4bit wave form

var SawWave = {
  bits: 4,
  wavedata: [0x0, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa, 0xb, 0xc, 0xd, 0xe, 0xf]
};// 4bit wave form

var TriWave = {
  bits: 4,
  wavedata: [0x0, 0x2, 0x4, 0x6, 0x8, 0xA, 0xC, 0xE, 0xF, 0xE, 0xC, 0xA, 0x8, 0x6, 0x4, 0x2]
};

export function decodeStr(bits, wavestr) {
  var arr = [];
  var n = bits / 4 | 0;
  var c = 0;
  var zeropos = 1 << (bits - 1);
  while (c < wavestr.length) {
    var d = 0;
    for (var i = 0; i < n; ++i) {
      eval("d = (d << 4) + 0x" + wavestr.charAt(c++) + ";");
    }
    arr.push((d - zeropos) / zeropos);
  }
  return arr;
}

var waves = [
    decodeStr(4, 'EEEEEEEEEEEEEEEE0000000000000000'),
    decodeStr(4, '00112233445566778899AABBCCDDEEFF'),
    decodeStr(4, '023466459AA8A7A977965656ACAACDEF'),
    decodeStr(4, 'BDCDCA999ACDCDB94212367776321247'),
    decodeStr(4, '7ACDEDCA742101247BDEDB7320137E78'),
    decodeStr(4, 'ACCA779BDEDA66679994101267742247'),
    decodeStr(4, '7EC9CEA7CFD8AB728D94572038513531'),
    decodeStr(4, 'EE77EE77EE77EE770077007700770077'),
    decodeStr(4, 'EEEE8888888888880000888888888888')//ノイズ用のダミー波形
];

var waveSamples = [];
export function WaveSample(audioctx, ch, sampleLength, sampleRate) {

  this.sample = audioctx.createBuffer(ch, sampleLength, sampleRate || audioctx.sampleRate);
  this.loop = false;
  this.start = 0;
  this.end = (sampleLength - 1) / (sampleRate || audioctx.sampleRate);
}

export function createWaveSampleFromWaves(audioctx, sampleLength) {
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

export function WaveTexture(wave) {
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
      ctx.fillRect(i, (wave[c] > 0) ? 80 - wave[c] * 80 : 80, 10, Math.abs(wave[c]) * 80);
    }
    this.tex.texture.needsUpdate = true;
  }
};

/// エンベロープジェネレーター
export function EnvelopeGenerator(voice, attack, decay, sustain, release) {
  this.voice = voice;
  //this.keyon = false;
  this.attack = attack || 0.0005;
  this.decay = decay || 0.05;
  this.sustain = sustain || 0.5;
  this.release = release || 0.5;
  this.v = 1.0;

};

EnvelopeGenerator.prototype =
{
  keyon: function (t,vel) {
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
export function Voice(audioctx) {
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
  keyon:function(t,note,vel)
  {
    this.processor.playbackRate.setValueAtTime(noteFreq[note] * this.detune, t);
    this.envelope.keyon(t,vel);
  },
  keyoff:function(t)
  {
    this.envelope.keyoff(t);
  },
  reset:function()
  {
    this.processor.playbackRate.cancelScheduledValues(0);
    this.gain.gain.cancelScheduledValues(0);
    this.gain.gain.value = 0;
  }
}

export function Audio() {
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
    for (var i = 0,end = this.VOICES; i < end; ++i) {
      var v = new Voice(this.audioctx);
      this.voices.push(v);
      if(i == (this.VOICES - 1)){
        v.output.connect(this.noiseFilter);
      } else{
        v.output.connect(this.filter);
      }
    }
//  this.started = false;

    //this.voices[0].output.connect();
  }

}

Audio.prototype = {
  start: function ()
  {
  //  if (this.started) return;

    var voices = this.voices;
    for (var i = 0, end = voices.length; i < end; ++i)
    {
      voices[i].start(0);
    }
    //this.started = true;
  },
  stop: function ()
  {
    //if(this.started)
    //{
      var voices = this.voices;
      for (var i = 0, end = voices.length; i < end; ++i)
      {
        voices[i].stop(0);
      }
    //  this.started = false;
    //}
  },
  VOICES: 12
}

/**********************************************/
/* シーケンサーコマンド                       */
/**********************************************/

export function Note(no, name) {
  this.no = no;
  this.name = name;
}

Note.prototype = {
  process: function(track) 
  {
    var back = track.back;
    var note = this;
    var oct = this.oct || back.oct;
    var step = this.step || back.step;
    var gate = this.gate || back.gate;
    var vel = this.vel || back.vel;
    setQueue(track, note, oct,step, gate, vel);

  }
}

var 
  C  = new Note( 0,'C '),
  Db = new Note( 1,'Db'),
  D  = new Note( 2,'D '),
  Eb = new Note( 3,'Eb'),
  E  = new Note( 4,'E '),
  F  = new Note( 5,'F '),
  Gb = new Note( 6,'Gb'),
  G  = new Note( 7,'G '),
  Ab = new Note( 8,'Ab'),
  A  = new Note( 9,'A '),
  Bb = new Note(10,'Bb'),
  B = new Note(11, 'B ');

 // R = new Rest();

function SeqData(note, oct, step, gate, vel)
{
  this.note = note;
  this.oct = oct;
  //this.no = note.no + oct * 12;
  this.step = step;
  this.gate = gate;
  this.vel = vel;
}

function setQueue(track,note,oct,step,gate,vel)
{
  var no = note.no + oct * 12;
  var step_time = track.playingTime;
  var gate_time = ((gate >= 0) ? gate * 60 : step * gate * 60 * -1.0) / (TIME_BASE * track.localTempo) + track.playingTime;
  var voice = track.audio.voices[track.channel];
  //console.log(track.sequencer.tempo);
  voice.keyon(step_time, no, vel);
  voice.keyoff(gate_time);
  track.playingTime = (step * 60) / (TIME_BASE * track.localTempo) + track.playingTime;
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
    setQueue(track,note,oct,step,gate,vel);
  }
}

function S(note, oct, step, gate, vel) {
  var args = Array.prototype.slice.call(arguments);
  if (S.length != args.length)
  {
    if(typeof(args[args.length - 1]) == 'object' &&  !(args[args.length - 1] instanceof Note))
    {
      var args1 = args[args.length - 1];
      var l = args.length - 1;
      return new SeqData(
      ((l != 0)?note:false) || args1.note || args1.n || null,
      ((l != 1) ? oct : false) || args1.oct || args1.o || null,
      ((l != 2) ? step : false) || args1.step || args1.s || null,
      ((l != 3) ? gate : false) || args1.gate || args1.g || null,
      ((l != 4) ? vel : false) || args1.vel || args1.v || null
      );
    }
  }
  return new SeqData(note || null, oct || null, step || null, gate || null, vel || null);
}

function S1(note, oct, step, gate, vel) {
  return S(note, oct, l(step), gate, vel);
}

function S2(note, len, dot , oct, gate, vel) {
  return S(note, oct, l(len,dot), gate, vel);
}

function S3(note, step, gate, vel, oct) {
  return S(note, oct, step, gate, vel);
}


/// 音符の長さ指定

function l(len,dot)
{
  var d = false;
  if (dot) d = dot;
  return (TIME_BASE * (4 + (d?2:0))) / len;
}

function Step(step) {
  this.step = step;
}

Step.prototype.process = function (track)
{
  track.back.step = this.step;
}

function ST(step)
{
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
}

function GT(gate) {
  return new GateTime(gate);
}

/// ベロシティ指定

function Velocity(vel) {
  this.vel = vel;
}

Velocity.prototype.process = function (track) {
  track.back.vel = this.vel;
}

function V(vel) {
  return new Velocity(vel);
}


function Jump(pos) { this.pos = pos;};
Jump.prototype.process = function (track)
{
  track.seqPos = this.pos;
}

/// 音色設定
function Tone(no)
{
  this.no = no;
  //this.sample = waveSamples[this.no];
}

Tone.prototype =
{
  process: function (track)
  {
    track.audio.voices[track.channel].setSample(waveSamples[this.no]);
  }
}
function TONE(no)
{
  return new Tone(no);
}

function JUMP(pos) {
  return new Jump(pos);
}

function Rest(step)
{
  this.step = step;
}

Rest.prototype.process = function(track)
{
  var step = this.step || track.back.step;
  track.playingTime = track.playingTime + (this.step * 60) / (TIME_BASE * track.localTempo);
  track.back.step = this.step;
}

function R1(step) {
  return new Rest(step);
}
function R(len,dot) {
  return new Rest(l(len,dot));
}

function Octave(oct) {
  this.oct = oct;
}
Octave.prototype.process = function(track)
{
  track.back.oct = this.oct;
}

function O(oct) {
  return new Octave(oct);
}

function OctaveUp(v) { this.v = v; };
OctaveUp.prototype.process = function(track) {
  track.back.oct += this.v;
}

var OU = new OctaveUp(1);
var OD = new OctaveUp(-1);

function Tempo(tempo)
{
  this.tempo = tempo;
}

Tempo.prototype.process = function(track)
{
  track.localTempo = this.tempo;
  //track.sequencer.tempo = this.tempo;
}

function TEMPO(tempo)
{
  return new Tempo(tempo);
}

function Envelope(attack, decay, sustain, release)
{
  this.attack = attack;
  this.decay = decay;
  this.sustain = sustain;
  this.release = release;
}

Envelope.prototype.process = function(track)
{
  var envelope = track.audio.voices[track.channel].envelope;
  envelope.attack = this.attack;
  envelope.decay = this.decay;
  envelope.sustain = this.sustain;
  envelope.release = this.release;
}

function ENV(attack,decay,sustain ,release)
{
  return new Envelope(attack, decay, sustain, release);
}

/// デチューン
function Detune(detune)
{
  this.detune = detune;
}

Detune.prototype.process = function(track)
{
  var voice = track.audio.voices[track.channel];
  voice.detune = this.detune;
}

function DETUNE(detune)
{
  return new Detune(detune);
}

function Volume(volume)
{
  this.volume = volume;
}

Volume.prototype.process = function(track)
{
  track.audio.voices[track.channel].volume.gain.setValueAtTime(this.volume, track.playingTime);
}

function VOLUME(volume)
{
  return new Volume(volume);
}

function LoopData(obj,varname, count,seqPos)
{
  this.varname = varname;
  this.count = count;
  this.obj = obj;
  this.seqPos = seqPos;
}

function Loop(varname, count) {
  this.loopData = new LoopData(this,varname,count,0);
}

Loop.prototype.process = function (track)
{
  var stack = track.stack;
  if (stack.length == 0 || stack[stack.length - 1].obj !== this)
  {
    var ld = this.loopData;
    stack.push(new LoopData(this, ld.varname, ld.count, track.seqPos));
  } 
}

function LOOP(varname, count) {
  return new Loop(varname,count);
}

function LoopEnd()
{
}

LoopEnd.prototype.process = function(track)
{
  var ld = track.stack[track.stack.length - 1];
  ld.count--;
  if (ld.count > 0) {
    track.seqPos = ld.seqPos;
  } else {
    track.stack.pop();
  }
}

var LOOP_END = new LoopEnd();

/// シーケンサートラック
function Track(sequencer,seqdata,audio)
{
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
    vel:1.0
  }
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
      if(this.sequencer.repeat)
      {
        this.seqPos = 0;
      } else {
        this.end = true;
        return;
      }
    }

    var seq = this.seqData;
    this.playingTime = (this.playingTime > -1) ? this.playingTime : currentTime;
    var endTime = currentTime + 0.2/*sec*/;

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
  reset:function()
  {
    var curVoice = this.audio.voices[this.channel];
    curVoice.gain.gain.cancelScheduledValues(0);
    curVoice.processor.playbackRate.cancelScheduledValues(0);
    curVoice.gain.gain.value = 0;
    this.playingTime = -1;
    this.seqPos = 0;
    this.end = false;
  }

}

function loadTracks(self,tracks, trackdata)
{
  for (var i = 0; i < trackdata.length; ++i) {
    var track = new Track(self, trackdata[i].data,self.audio);
    track.channel = trackdata[i].channel;
    track.oneshot = (!trackdata[i].oneshot)?false:true;
    track.track = i;
    tracks.push(track);
  }
}

function createTracks(trackdata)
{
  var tracks = [];
  loadTracks(this,tracks, trackdata);
  return tracks;
}

/// シーケンサー本体
export function Sequencer(audio) {
  this.audio = audio;
  this.tempo = 100.0;
  this.repeat = false;
  this.play = false;
  this.tracks = [];
  this.pauseTime = 0;
  this.status = this.STOP;
}

Sequencer.prototype = {
  load: function(data)
  {
    if(this.play) {
      this.stop();
    }
    this.tracks.length = 0;
    loadTracks(this,this.tracks, data.tracks,this.audio);
  },
  start:function()
  {
    //    this.handle = window.setTimeout(function () { self.process() }, 50);
    this.status = this.PLAY;
    this.process();
  },
  process:function()
  {
    if (this.status == this.PLAY) {
      this.playTracks(this.tracks);
      this.handle = window.setTimeout(this.process.bind(this), 100);
    }
  },
  playTracks: function (tracks){
    var currentTime = this.audio.audioctx.currentTime;
 //   console.log(this.audio.audioctx.currentTime);
    for (var i = 0, end = tracks.length; i < end; ++i) {
      tracks[i].process(currentTime);
    }
  },
  pause:function()
  {
    this.status = this.PAUSE;
    this.pauseTime = this.audio.audioctx.currentTime;
  },
  resume:function ()
  {
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
  stop: function ()
  {
    if (this.status != this.STOP) {
      clearTimeout(this.handle);
      //    clearInterval(this.handle);
      this.status = this.STOP;
      this.reset();
    }
  },
  reset:function()
  {
    for (var i = 0, end = this.tracks.length; i < end; ++i)
    {
      this.tracks[i].reset();
    }
  },
  STOP: 0 | 0,
  PLAY: 1 | 0,
  PAUSE:2 | 0
}

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
        this.audio.voices[7].keyon(0,index + (e.shiftKey ? 84 : 72),1.0);
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
}

export var seqData = {
  name: 'Test',
  tracks: [
    {
      name: 'part1',
      channel: 0,
      data:
      [
        ENV(0.01, 0.02, 0.5, 0.07),
        TEMPO(180), TONE(0), VOLUME(0.5), L(8), GT(-0.5),O(4),
        LOOP('i',4),
        C, C, C, C, C, C, C, C,
        LOOP_END,
        JUMP(5)
      ]
    },
    {
      name: 'part2',
      channel: 1,
      data:
        [
        ENV(0.01, 0.05, 0.6, 0.07),
        TEMPO(180),TONE(6), VOLUME(0.2), L(8), GT(-0.8),
        R(1), R(1),
        O(6),L(1), F,
        E,
        OD, L(8, true), Bb, G, L(4), Bb, OU, L(4), F, L(8), D,
        L(4, true), E, L(2), C,R(8),
        JUMP(8)
        ]
    },
    {
      name: 'part3',
      channel: 2,
      data:
        [
        ENV(0.01, 0.05, 0.6, 0.07),
        TEMPO(180),TONE(6), VOLUME(0.1), L(8), GT(-0.5), 
        R(1), R(1),
        O(6),L(1), C,C,
        OD, L(8, true), G, D, L(4), G, OU, L(4), D, L(8),OD, G,
        L(4, true), OU,C, L(2),OD, G, R(8),
        JUMP(7)
        ]
    }
  ]
}

export function SoundEffects(sequencer) {
   this.soundEffects =
    [
    // Effect 0 ////////////////////////////////////
    createTracks.call(sequencer,[
    {
      channel: 8,
      oneshot:true,
      data: [VOLUME(0.5),
        ENV(0.0001, 0.01, 1.0, 0.0001),GT(-0.999),TONE(0), TEMPO(200), O(8),ST(3), C, D, E, F, G, A, B, OU, C, D, E, G, A, B,B,B,B
      ]
    },
    {
      channel: 9,
      oneshot: true,
      data: [VOLUME(0.5),
        ENV(0.0001, 0.01, 1.0, 0.0001), DETUNE(0.9), GT(-0.999), TONE(0), TEMPO(200), O(5), ST(3), C, D, E, F, G, A, B, OU, C, D, E, G, A, B,B,B,B
      ]
    }
    ]),
    // Effect 1 /////////////////////////////////////
    createTracks.call(sequencer,
      [
        {
          channel: 10,
          oneshot: true,
          data: [
           TONE(4), TEMPO(150), ST(4), GT(-0.9999), ENV(0.0001, 0.0001, 1.0, 0.0001),
           O(6), G, A, B, O(7), B, A, G, F, E, D, C, E, G, A, B, OD, B, A, G, F, E, D, C, OD, B, A, G, F, E, D, C
          ]
        }
      ]),
    // Effect 2//////////////////////////////////////
    createTracks.call(sequencer,
      [
        {
          channel: 10,
          oneshot: true,
          data: [
           TONE(0), TEMPO(150), ST(2), GT(-0.9999), ENV(0.0001, 0.0001, 1.0, 0.0001),
           O(8), C,D,E,F,G,A,B,OU,C,D,E,F,OD,G,OU,A,OD,B,OU,A,OD,G,OU,F,OD,E,OU,E
          ]
        }
      ]),
      // Effect 3 ////////////////////////////////////
      createTracks.call(sequencer,
        [
          {
            channel: 10,
            oneshot: true,
            data: [
             TONE(5), TEMPO(150), L(64), GT(-0.9999), ENV(0.0001, 0.0001, 1.0, 0.0001),
             O(6),C,OD,C,OU,C,OD,C,OU,C,OD,C,OU,C,OD
            ]
          }
        ]),
      // Effect 4 ////////////////////////////////////////
      createTracks.call(sequencer,
        [
          {
            channel: 11,
            oneshot: true,
            data: [
             TONE(8), VOLUME(2.0),TEMPO(120), L(2), GT(-0.9999), ENV(0.0001, 0.0001, 1.0, 0.25),
             O(1), C
            ]
          }
        ])
   ];
 }



