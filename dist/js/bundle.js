(function () {
'use strict';

class sfg_ {
    constructor() {
        this.game = null;
        this.VIRTUAL_WIDTH = 240;
        this.VIRTUAL_HEIGHT = 320;

        this.V_RIGHT = this.VIRTUAL_WIDTH / 2.0;
        this.V_TOP = this.VIRTUAL_HEIGHT / 2.0;
        this.V_LEFT = -1 * this.VIRTUAL_WIDTH / 2.0;
        this.V_BOTTOM = -1 * this.VIRTUAL_HEIGHT / 2.0;

        this.CHAR_SIZE = 8;
        this.TEXT_WIDTH = this.VIRTUAL_WIDTH / this.CHAR_SIZE;
        this.TEXT_HEIGHT = this.VIRTUAL_HEIGHT / this.CHAR_SIZE;
        this.PIXEL_SIZE = 1;
        this.ACTUAL_CHAR_SIZE = this.CHAR_SIZE * this.PIXEL_SIZE;
        this.SPRITE_SIZE_X = 16.0;
        this.SPRITE_SIZE_Y = 16.0;
        this.CHECK_COLLISION = true;
        this.DEBUG = false;
        this.textureFiles = {};
        this.stage = 0;
        this.tasks = null;
        this.gameTimer = null;
        this.bombs = null;
        this.addScore = null;
        this.myship_ = null;
        this.textureRoot = './res/';
        this.pause = false;
        this.game = null;
    }
}

var sfg = new sfg_();

//
// We store our EE objects in a plain object whose properties are event names.
// If `Object.create(null)` is not supported we prefix the event names with a
// `~` to make sure that the built-in object properties are not overridden or
// used as an attack vector.
// We also assume that `Object.create(null)` is available when the event name
// is an ES6 Symbol.
//
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
function EventEmitter() { /* Nothing to set */ }

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
  var evt = prefix ? prefix + event : event
    , available = this._events && this._events[evt];

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

  var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

  if ('function' === typeof listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
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
  var listener = new EE(fn, context || this)
    , evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;
  else {
    if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [
      this._events[evt], listener
    ];
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
  var listener = new EE(fn, context || this, true)
    , evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;
  else {
    if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [
      this._events[evt], listener
    ];
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

  var listeners = this._events[evt]
    , events = [];

  if (fn) {
    if (listeners.fn) {
      if (
           listeners.fn !== fn
        || (once && !listeners.once)
        || (context && listeners.context !== context)
      ) {
        events.push(listeners);
      }
    } else {
      for (var i = 0, length = listeners.length; i < length; i++) {
        if (
             listeners[i].fn !== fn
          || (once && !listeners[i].once)
          || (context && listeners[i].context !== context)
        ) {
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

  if (event) delete this._events[prefix ? prefix + event : event];
  else this._events = prefix ? {} : Object.create(null);

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

class Task {
  constructor(genInst,priority) {
    this.priority = priority || 10000;
    this.genInst = genInst;
    // 初期化
    this.index = 0;
  }
  
}

var nullTask = new Task((function*(){})());

/// タスク管理
class Tasks extends EventEmitter {
  constructor(){
    super();
    this.array = new Array(0);
    this.needSort = false;
    this.needCompress = false;
    this.enable = true;
    this.stopped = false;
  }
  // indexの位置のタスクを置き換える
  setNextTask(index, genInst, priority) 
  {
    if(index < 0){
      index = -(++index);
    }
    if(this.array[index].priority == 100000){
      debugger;
    }
    var t = new Task(genInst(index), priority);
    t.index = index;
    this.array[index] = t;
    this.needSort = true;
  }

  pushTask(genInst, priority) {
    let t;
    for (var i = 0; i < this.array.length; ++i) {
      if (this.array[i] == nullTask) {
        t = new Task(genInst(i), priority);
        this.array[i] = t;
        t.index = i;
        return t;
      }
    }
    t = new Task(genInst(this.array.length),priority);
    t.index = this.array.length;
    this.array[this.array.length] = t;
    this.needSort = true;
    return t;
  }

  // 配列を取得する
  getArray() {
    return this.array;
  }
  // タスクをクリアする
  clear() {
    this.array.length = 0;
  }
  // ソートが必要かチェックし、ソートする
  checkSort() {
    if (this.needSort) {
      this.array.sort(function (a, b) {
        if(a.priority > b.priority) return 1;
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

  removeTask(index) {
    if(index < 0){
      index = -(++index);
    }
    if(this.array[index].priority == 100000){
      debugger;
    }
    this.array[index] = nullTask;
    this.needCompress = true;
  }
  
  compress() {
    if (!this.needCompress) {
      return;
    }
    var dest = [];
    var src = this.array;
    var destIndex = 0;
    dest = src.filter((v,i)=>{
      let ret = v != nullTask;
      if(ret){
        v.index = destIndex++;
      }
      return ret;
    });
    this.array = dest;
    this.needCompress = false;
  }
  
  process(game)
  {
    if(this.enable){
      requestAnimationFrame(this.process.bind(this,game));
      this.stopped = false;
      if (!sfg.pause) {
        if (!game.isHidden) {
          this.checkSort();
          this.array.forEach( (task,i) =>{
            if (task != nullTask) {
              if(task.index != i ){
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
  
  stopProcess(){
    return new Promise((resolve,reject)=>{
      this.enable = false;
      this.on('stopped',()=>{
        resolve();
      });
    });
  }
}

/// ゲーム用タイマー
class GameTimer {
  constructor(getCurrentTime) {
    this.elapsedTime = 0;
    this.currentTime = 0;
    this.pauseTime = 0;
    this.status = this.STOP;
    this.getCurrentTime = getCurrentTime;
    this.STOP = 1;
    this.START = 2;
    this.PAUSE = 3;

  }
  
  start() {
    this.elapsedTime = 0;
    this.deltaTime = 0;
    this.currentTime = this.getCurrentTime();
    this.status = this.START;
  }

  resume() {
    var nowTime = this.getCurrentTime();
    this.currentTime = this.currentTime + nowTime - this.pauseTime;
    this.status = this.START;
  }

  pause() {
    this.pauseTime = this.getCurrentTime();
    this.status = this.PAUSE;
  }

  stop() {
    this.status = this.STOP;
  }

  update() {
    if (this.status != this.START) return;
    var nowTime = this.getCurrentTime();
    this.deltaTime = nowTime - this.currentTime;
    this.elapsedTime = this.elapsedTime + this.deltaTime;
    this.currentTime = nowTime;
  }
}

//// Web Audio API ラッパークラス ////
var fft = new FFT(4096, 44100);
var BUFFER_SIZE = 1024;
var TIME_BASE = 96;

var noteFreq = [];
for (var i = -81; i < 46; ++i) {
  noteFreq.push(Math.pow(2, i / 12));
}

function decodeStr(bits, wavestr) {
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



/// エンベロープジェネレーター
function EnvelopeGenerator(voice, attack, decay, sustain, release) {
  this.voice = voice;
  //this.keyon = false;
  this.attack = attack || 0.0005;
  this.decay = decay || 0.05;
  this.sustain = sustain || 0.5;
  this.release = release || 0.5;
  this.v = 1.0;

}

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
}

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
};

/**********************************************/
/* シーケンサーコマンド                       */
/**********************************************/

function Note(no, name) {
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
};

var C  = new Note( 0,'C ');
var D  = new Note( 2,'D ');
var E  = new Note( 4,'E ');
var F  = new Note( 5,'F ');
var G  = new Note( 7,'G ');
var A  = new Note( 9,'A ');
var Bb = new Note(10,'Bb');
var B = new Note(11, 'B ');

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
};

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
};

function GT(gate) {
  return new GateTime(gate);
}

function Jump(pos) { this.pos = pos;}
Jump.prototype.process = function (track)
{
  track.seqPos = this.pos;
};

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
};
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
};

function R(len,dot) {
  return new Rest(l(len,dot));
}

function Octave(oct) {
  this.oct = oct;
}
Octave.prototype.process = function(track)
{
  track.back.oct = this.oct;
};

function O(oct) {
  return new Octave(oct);
}

function OctaveUp(v) { this.v = v; }
OctaveUp.prototype.process = function(track) {
  track.back.oct += this.v;
};

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
};

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
};

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
};

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
};

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
};

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
};

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
    var endTime = currentTime + 0.2;

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

};

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
};

var seqData = {
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
};

function SoundEffects(sequencer) {
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

/// テクスチャーとしてcanvasを使う場合のヘルパー


/// プログレスバー表示クラス
function Progress() {
  this.canvas = document.createElement('canvas');
  var width = 1;
  while (width <= sfg.VIRTUAL_WIDTH){
    width *= 2;
  }
  var height = 1;
  while (height <= sfg.VIRTUAL_HEIGHT){
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
  this.mesh.position.x = (width - sfg.VIRTUAL_WIDTH) / 2;
  this.mesh.position.y =  - (height - sfg.VIRTUAL_HEIGHT) / 2;

  //this.texture.premultiplyAlpha = true;
}

/// プログレスバーを表示する。
Progress.prototype.render = function (message, percent) {
  var ctx = this.ctx;
  var width = this.canvas.width, height = this.canvas.height;
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


function createSpriteGeometry(size)
{
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
function createSpriteUV(geometry, texture, cellWidth, cellHeight, cellNo)
{
  var width = texture.image.width;
  var height = texture.image.height;

  var uCellCount = (width / cellWidth) | 0;
  var vCellCount = (height / cellHeight) | 0;
  var vPos = vCellCount - ((cellNo / uCellCount) | 0);
  var uPos = cellNo % uCellCount;
  var uUnit = cellWidth / width; 
  var vUnit = cellHeight / height;

  geometry.faceVertexUvs[0].push([
    new THREE.Vector2((uPos) * cellWidth / width, (vPos) * cellHeight / height),
    new THREE.Vector2((uPos + 1) * cellWidth / width, (vPos - 1) * cellHeight / height),
    new THREE.Vector2((uPos + 1) * cellWidth / width, (vPos) * cellHeight / height)
  ]);
  geometry.faceVertexUvs[0].push([
    new THREE.Vector2((uPos) * cellWidth / width, (vPos) * cellHeight / height),
    new THREE.Vector2((uPos) * cellWidth / width, (vPos - 1) * cellHeight / height),
    new THREE.Vector2((uPos + 1) * cellWidth / width, (vPos - 1) * cellHeight / height)
  ]);
}

function updateSpriteUV(geometry, texture, cellWidth, cellHeight, cellNo)
{
  var width = texture.image.width;
  var height = texture.image.height;

  var uCellCount = (width / cellWidth) | 0;
  var vCellCount = (height / cellHeight) | 0;
  var vPos = vCellCount - ((cellNo / uCellCount) | 0);
  var uPos = cellNo % uCellCount;
  var uUnit = cellWidth / width;
  var vUnit = cellHeight / height;
  var uvs = geometry.faceVertexUvs[0][0];

  uvs[0].x = (uPos) * uUnit;
  uvs[0].y = (vPos) * vUnit;
  uvs[1].x = (uPos + 1) * uUnit;
  uvs[1].y = (vPos - 1) * vUnit;
  uvs[2].x = (uPos + 1) * uUnit;
  uvs[2].y = (vPos) * vUnit;

  uvs = geometry.faceVertexUvs[0][1];

  uvs[0].x = (uPos) * uUnit;
  uvs[0].y = (vPos) * vUnit;
  uvs[1].x = (uPos) * uUnit;
  uvs[1].y = (vPos - 1) * vUnit;
  uvs[2].x = (uPos + 1) * uUnit;
  uvs[2].y = (vPos - 1) * vUnit;

 
  geometry.uvsNeedUpdate = true;

}

function createSpriteMaterial(texture)
{
  // メッシュの作成・表示 ///
  var material = new THREE.MeshBasicMaterial({ map: texture /*,depthTest:true*/, transparent: true });
  material.shading = THREE.FlatShading;
  material.side = THREE.FrontSide;
  material.alphaTest = 0.5;
  material.needsUpdate = true;
//  material.
  return material;
}

// キー入力
class BasicInput{
constructor () {
  this.keyCheck = { up: false, down: false, left: false, right: false, z: false ,x:false};
  this.keyBuffer = [];
  this.keyup_ = null;
  this.keydown_ = null;
  //this.gamepadCheck = { up: false, down: false, left: false, right: false, z: false ,x:false};
  window.addEventListener('gamepadconnected',(e)=>{
    this.gamepad = e.gamepad;
  });
 
  window.addEventListener('gamepaddisconnected',(e)=>{
    delete this.gamepad;
  }); 
 
 if(window.navigator.getGamepads){
   this.gamepad = window.navigator.getGamepads()[0];
 } 
}

  clear()
  {
    for(var d in this.keyCheck){
      this.keyCheck[d] = false;
    }
    this.keyBuffer.length = 0;
  }
  
  keydown(e) {
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
  
  keyup() {
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
  bind()
  {
    d3.select('body').on('keydown.basicInput',this.keydown.bind(this));
    d3.select('body').on('keyup.basicInput',this.keyup.bind(this));
  }
  // アンバインドする
  unbind()
  {
    d3.select('body').on('keydown.basicInput',null);
    d3.select('body').on('keyup.basicInput',null);
  }
  
  get up() {
    return this.keyCheck.up || (this.gamepad && (this.gamepad.buttons[12].pressed || this.gamepad.axes[1] < -0.1));
  }

  get down() {
    return this.keyCheck.down || (this.gamepad && (this.gamepad.buttons[13].pressed || this.gamepad.axes[1] > 0.1));
  }

  get left() {
    return this.keyCheck.left || (this.gamepad && (this.gamepad.buttons[14].pressed || this.gamepad.axes[0] < -0.1));
  }

  get right() {
    return this.keyCheck.right || (this.gamepad && (this.gamepad.buttons[15].pressed || this.gamepad.axes[0] > 0.1));
  }
  
  get z() {
     let ret = this.keyCheck.z 
    || (((!this.zButton || (this.zButton && !this.zButton) ) && this.gamepad && this.gamepad.buttons[0].pressed));
    this.zButton = this.gamepad && this.gamepad.buttons[0].pressed;
    return ret;
  }
  
  get start() {
    let ret = ((!this.startButton_ || (this.startButton_ && !this.startButton_) ) && this.gamepad && this.gamepad.buttons[9].pressed);
    this.startButton_ = this.gamepad && this.gamepad.buttons[9].pressed;
    return ret;
  }
  
  get aButton(){
     let ret = (((!this.aButton_ || (this.aButton_ && !this.aButton_) ) && this.gamepad && this.gamepad.buttons[0].pressed));
    this.aButton_ = this.gamepad && this.gamepad.buttons[0].pressed;
    return ret;
  }
  
  *update(taskIndex)
  {
    while(taskIndex >= 0){
      if(window.navigator.getGamepads){
        this.gamepad = window.navigator.getGamepads()[0];
      } 
      taskIndex = yield;     
    }
  }
}

class Comm {
  constructor(){
    var host = window.location.hostname.match(/www\.sfpgmr\.net/ig)?'www.sfpgmr.net':'localhost';
    this.enable = false;
    try {
      this.socket = io.connect('http://' + host + ':8081/test');
      this.enable = true;
      var self = this;
      this.socket.on('sendHighScores', (data)=>{
        if(this.updateHighScores){
          this.updateHighScores(data);
        }
      });
      this.socket.on('sendHighScore', (data)=>{
        this.updateHighScore(data);
      });

      this.socket.on('sendRank', (data) => {
        this.updateHighScores(data.highScores);
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
  
  sendScore(score)
  {
    if (this.enable) {
      this.socket.emit('sendScore', score);
    }
  }
  
  disconnect()
  {
    if (this.enable) {
      this.enable = false;
      this.socket.disconnect();
    }
  }
}

//import *  as gameobj from './gameobj';
//import * as graphics from './graphics';

/// テキスト属性
class TextAttribute {
  constructor(blink, font) {
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
}

/// テキストプレーン
class TextPlane{ 
  constructor (scene) {
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
  while (width <= sfg.VIRTUAL_WIDTH){
    width *= 2;
  }
  var height = 1;
  while (height <= sfg.VIRTUAL_HEIGHT){
    height *= 2;
  }
  
  this.canvas.width = width;
  this.canvas.height = height;
  this.ctx = this.canvas.getContext('2d');
  this.texture = new THREE.Texture(this.canvas);
  this.texture.magFilter = THREE.NearestFilter;
  this.texture.minFilter = THREE.LinearMipMapLinearFilter;
  this.material = new THREE.MeshBasicMaterial({ map: this.texture,alphaTest:0.5, transparent: true,depthTest:true,shading:THREE.FlatShading});
//  this.geometry = new THREE.PlaneGeometry(sfg.VIRTUAL_WIDTH, sfg.VIRTUAL_HEIGHT);
  this.geometry = new THREE.PlaneGeometry(width, height);
  this.mesh = new THREE.Mesh(this.geometry, this.material);
  this.mesh.position.z = 0.4;
  this.mesh.position.x = (width - sfg.VIRTUAL_WIDTH) / 2;
  this.mesh.position.y =  - (height - sfg.VIRTUAL_HEIGHT) / 2;
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
  cls() {
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
  print(x, y, str, attribute) {
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
  render() {
    var ctx = this.ctx;
    this.blinkCount = (this.blinkCount + 1) & 0xf;

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
        var process_blink = (attr_line[x] && attr_line[x].blink);
        if (line[x] != line_back[x] || attr_line[x] != attr_line_back[x] || (process_blink && draw_blink)) {
          update = true;

          line_back[x] = line[x];
          attr_line_back[x] = attr_line[x];
          var c = 0;
          if (!process_blink || this.blink) {
            c = line[x] - 0x20;
          }
          var ypos = (c >> 4) << 3;
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
}

class CollisionArea {
  constructor(offsetX, offsetY, width, height)
  {
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
  get width() { return this.width_; }
  set width(v) {
    this.width_ = v;
    this.left = this.offsetX - v / 2;
    this.right = this.offsetX + v / 2;
  }
  get height() { return this.height_; }
  set height(v) {
    this.height_ = v;
    this.top = this.offsetY + v / 2;
    this.bottom = this.offsetY - v / 2;
  }
}

class GameObj {
  constructor(x, y, z) {
    this.x_ = x || 0;
    this.y_ = y || 0;
    this.z_ = z || 0.0;
    this.enable_ = false;
    this.width = 0;
    this.height = 0;
    this.collisionArea = new CollisionArea();
  }
  get x() { return this.x_; }
  set x(v) { this.x_ = v; }
  get y() { return this.y_; }
  set y(v) { this.y_ = v; }
  get z() { return this.z_; }
  set z(v) { this.z_ = v; }
}

/// 自機弾 
class MyBullet extends GameObj {
  constructor(scene,se) {
  super(0, 0, 0);

  this.collisionArea.width = 4;
  this.collisionArea.height = 6;
  this.speed = 8;
  this.power = 1;

  this.textureWidth = sfg.textureFiles.myship.image.width;
  this.textureHeight = sfg.textureFiles.myship.image.height;

  // メッシュの作成・表示 ///

  var material = createSpriteMaterial(sfg.textureFiles.myship);
  var geometry = createSpriteGeometry(16);
  createSpriteUV(geometry, sfg.textureFiles.myship, 16, 16, 1);
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

  get x() { return this.x_; }
  set x(v) { this.x_ = this.mesh.position.x = v; }
  get y() { return this.y_; }
  set y(v) { this.y_ = this.mesh.position.y = v; }
  get z() { return this.z_; }
  set z(v) { this.z_ = this.mesh.position.z = v; }
  *move(taskIndex) {
    
    while (taskIndex >= 0 
      && this.enable_
      && this.y <= (sfg.V_TOP + 16) 
      && this.y >= (sfg.V_BOTTOM - 16) 
      && this.x <= (sfg.V_RIGHT + 16) 
      && this.x >= (sfg.V_LEFT - 16))
    {
      
      this.y += this.dy;
      this.x += this.dx;
      
      taskIndex = yield;
    }

    taskIndex = yield;
    sfg.tasks.removeTask(taskIndex);
    this.enable_ = this.mesh.visible = false;
}

  start(x, y, z, aimRadian,power) {
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
}

/// 自機オブジェクト
class MyShip extends GameObj { 
  constructor(x, y, z,scene,se) {
  super(x, y, z);// extend

  this.collisionArea.width = 6;
  this.collisionArea.height = 8;
  this.se = se;
  this.scene = scene;
  this.textureWidth = sfg.textureFiles.myship.image.width;
  this.textureHeight = sfg.textureFiles.myship.image.height;
  this.width = 16;
  this.height = 16;

  // 移動範囲を求める
  this.top = (sfg.V_TOP - this.height / 2) | 0;
  this.bottom = (sfg.V_BOTTOM + this.height / 2) | 0;
  this.left = (sfg.V_LEFT + this.width / 2) | 0;
  this.right = (sfg.V_RIGHT - this.width / 2) | 0;

  // メッシュの作成・表示
  // マテリアルの作成
  var material = createSpriteMaterial(sfg.textureFiles.myship);
  // ジオメトリの作成
  var geometry = createSpriteGeometry(this.width);
  createSpriteUV(geometry, sfg.textureFiles.myship, this.width, this.height, 0);

  this.mesh = new THREE.Mesh(geometry, material);

  this.mesh.position.x = this.x_;
  this.mesh.position.y = this.y_;
  this.mesh.position.z = this.z_;
  this.rest = 3;
  this.myBullets = ( ()=> {
    var arr = [];
    for (var i = 0; i < 2; ++i) {
      arr.push(new MyBullet(this.scene,this.se));
    }
    return arr;
  })();
  scene.add(this.mesh);
  
  this.bulletPower = 1;

}
  get x() { return this.x_; }
  set x(v) { this.x_ = this.mesh.position.x = v; }
  get y() { return this.y_; }
  set y(v) { this.y_ = this.mesh.position.y = v; }
  get z() { return this.z_; }
  set z(v) { this.z_ = this.mesh.position.z = v; }
  
  shoot(aimRadian) {
    for (var i = 0, end = this.myBullets.length; i < end; ++i) {
      if (this.myBullets[i].start(this.x, this.y , this.z,aimRadian,this.bulletPower)) {
        break;
      }
    }
  }
  
  action(basicInput) {
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
  
  hit() {
    this.mesh.visible = false;
    sfg.bombs.start(this.x, this.y, 0.2);
    this.se(4);
  }
  
  reset(){
    this.myBullets.forEach((d)=>{
      if(d.enable_){
        while(!sfg.tasks.array[d.task.index].genInst.next(-(1 + d.task.index)).done);
      }
    });
  }
  
  init(){
      this.x = 0;
      this.y = -100;
      this.z = 0.1;
      this.mesh.visible = true;
  }

}

var myship = Object.freeze({
	MyBullet: MyBullet,
	MyShip: MyShip
});

/// 敵弾
class EnemyBullet extends GameObj {
  constructor(scene, se) {
    super(0, 0, 0);
    this.NONE = 0;
    this.MOVE = 1;
    this.BOMB = 2;
    this.collisionArea.width = 2;
    this.collisionArea.height = 2;
    var tex = sfg.textureFiles.enemy;
    var material = createSpriteMaterial(tex);
    var geometry = createSpriteGeometry(16);
    createSpriteUV(geometry, tex, 16, 16, 0);
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

  get x() { return this.x_; }
  set x(v) { this.x_ = this.mesh.position.x = v; }
  get y() { return this.y_; }
  set y(v) { this.y_ = this.mesh.position.y = v; }
  get z() { return this.z_; }
  set z(v) { this.z_ = this.mesh.position.z = v; }
  get enable() {
    return this.enable_;
  }
  
  set enable(v) {
    this.enable_ = v;
    this.mesh.visible = v;
  }
  
  *move(taskIndex) {
    for(;this.x >= (sfg.V_LEFT - 16) &&
        this.x <= (sfg.V_RIGHT + 16) &&
        this.y >= (sfg.V_BOTTOM - 16) &&
        this.y <= (sfg.V_TOP + 16) && taskIndex >= 0;
        this.x += this.dx,this.y += this.dy)
    {
      taskIndex = yield;
    }
    
    if(taskIndex >= 0){
      taskIndex = yield;
    }
    this.mesh.visible = false;
    this.status = this.NONE;
    this.enable = false;
    sfg.tasks.removeTask(taskIndex);
  }
   
  start(x, y, z) {
    if (this.enable) {
      return false;
    }
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
    this.enable = true;
    if (this.status != this.NONE)
    {
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
 
  hit() {
    this.enable = false;
    sfg.tasks.removeTask(this.task.index);
    this.status = this.NONE;
  }
}


class EnemyBullets {
  constructor(scene, se) {
    this.scene = scene;
    this.enemyBullets = [];
    for (var i = 0; i < 48; ++i) {
      this.enemyBullets.push(new EnemyBullet(this.scene, se));
    }
  }
  start(x, y, z) {
    var ebs = this.enemyBullets;
    for(var i = 0,end = ebs.length;i< end;++i){
      if(!ebs[i].enable){
        ebs[i].start(x, y, z);
        break;
      }
    }
  }
  
  reset()
  {
    this.enemyBullets.forEach((d,i)=>{
      if(d.enable){
        while(!sfg.tasks.array[d.task.index].genInst.next(-(1 + d.task.index)).done);
      }
    });
  }
}

/// 敵キャラの動き ///////////////////////////////
/// 直線運動
class LineMove {
  constructor(rad, speed, step) {
    this.rad = rad;
    this.speed = speed;
    this.step = step;
    this.currentStep = step;
    this.dx = Math.cos(rad) * speed;
    this.dy = Math.sin(rad) * speed;
  }
  
  *move(self,x,y) 
  {
    
    if (self.xrev) {
      self.charRad = Math.PI - (this.rad - Math.PI / 2);
    } else {
      self.charRad = this.rad - Math.PI / 2;
    }
    
    let dy = this.dy;
    let dx = this.dx;
    const step = this.step;
    
    if(self.xrev){
      dx = -dx;      
    }
    let cancel = false;
    for(let i = 0;i < step && !cancel;++i){
      self.x += dx;
      self.y += dy;
      cancel = yield;
    }
  }
  
  clone(){
    return new LineMove(this.rad,this.speed,this.step);
  }
  
  toJSON(){
    return [
      "LineMove",
      this.rad,
      this.speed,
      this.step
    ];
  }
  
  static fromArray(array)
  {
    return new LineMove(array[1],array[2],array[3]);
  }
}

/// 円運動
class CircleMove {
  constructor(startRad, stopRad, r, speed, left) {
    this.startRad = (startRad || 0);
    this.stopRad =  (stopRad || 1.0);
    this.r = r || 100;
    this.speed = speed || 1.0;
    this.left = !left ? false : true;
    this.deltas = [];
    this.startRad_ = this.startRad * Math.PI;
    this.stopRad_ = this.stopRad * Math.PI;
    let rad = this.startRad_;
    let step = (left ? 1 : -1) * this.speed / r;
    let end = false;
    
    while (!end) {
      rad += step;
      if ((left && (rad >= this.stopRad_)) || (!left && rad <= this.stopRad_)) {
        rad = this.stopRad_;
        end = true;
      }
      this.deltas.push({
        x: this.r * Math.cos(rad),
        y: this.r * Math.sin(rad),
        rad: rad
      });
    }
  };

  
  *move(self,x,y) {
    // 初期化
    let sx,sy;
    if (self.xrev) {
      sx = x - this.r * Math.cos(this.startRad_ + Math.PI);
    } else {
      sx = x - this.r * Math.cos(this.startRad_);
    }
    sy = y - this.r * Math.sin(this.startRad_);

    let cancel = false;
    // 移動
    for(let i = 0,e = this.deltas.length;(i < e) && !cancel;++i)
    {
      var delta = this.deltas[i];
      if(self.xrev){
        self.x = sx - delta.x;
      } else {
        self.x = sx + delta.x;
      }

      self.y = sy + delta.y;
      if (self.xrev) {
        self.charRad = (Math.PI - delta.rad) + (this.left ? -1 : 0) * Math.PI;
      } else {
        self.charRad = delta.rad + (this.left ? 0 : -1) * Math.PI;
      }
      self.rad = delta.rad;
      cancel = yield;
    }
  }
  
  toJSON(){
    return [ 'CircleMove',
      this.startRad,
      this.stopRad,
      this.r,
      this.speed,
      this.left
    ];
  }
  
  clone(){
    return new CircleMove(this.startRad,this.stopRad,this.r,this.speed,this.left);
  }
  
  static fromArray(a){
    return new CircleMove(a[1],a[2],a[3],a[4],a[5]);
  }
}

/// ホームポジションに戻る
class GotoHome {

 *move(self, x, y) {
    let rad = Math.atan2(self.homeY - self.y, self.homeX - self.x);
    let speed = 4;

    self.charRad = rad - Math.PI / 2;
    let dx = Math.cos(rad) * speed;
    let dy = Math.sin(rad) * speed;
    self.z = 0.0;
    
    let cancel = false;
    for(;(Math.abs(self.x - self.homeX) >= 2 || Math.abs(self.y - self.homeY) >= 2) && !cancel
      ;self.x += dx,self.y += dy)
    {
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
  
  clone()
  {
    return new GotoHome();
  }
  
  toJSON(){
    return ['GotoHome'];
  }
  
  static fromArray(a)
  {
    return new GotoHome();
  }
}


/// 待機中の敵の動き
class HomeMove{
  constructor(){
    this.CENTER_X = 0;
    this.CENTER_Y = 100;
  }

  *move(self, x, y) {

    let dx = self.homeX - this.CENTER_X;
    let dy = self.homeY - this.CENTER_Y;
    self.z = -0.1;

    while(self.status != self.ATTACK)
    {
      self.x = self.homeX + dx * self.enemies.homeDelta;
      self.y = self.homeY + dy * self.enemies.homeDelta;
      self.mesh.scale.x = self.enemies.homeDelta2;
      yield;
    }

    self.mesh.scale.x = 1.0;
    self.z = 0.0;

  }
  
  clone(){
    return new HomeMove();
  }
  
  toJSON(){
    return ['HomeMove'];
  }
  
  static fromArray(a)
  {
    return new HomeMove();
  }
}

/// 指定シーケンスに移動する
class Goto {
  constructor(pos) { this.pos = pos; };
  *move(self, x, y) {
    self.index = this.pos - 1;
  }
  
  toJSON(){
    return [
      'Goto',
      this.pos
    ];
  }
  
  clone(){
    return new Goto(this.pos);
  }
  
  static fromArray(a){
    return new Goto(a[1]);
  }
}

/// 敵弾発射
class Fire {
  *move(self, x, y) {
    let d = (sfg.stage.no / 20) * ( sfg.stage.difficulty);
    if (d > 1) { d = 1.0;}
    if (Math.random() < d) {
      self.enemies.enemyBullets.start(self.x, self.y);
    }
  }
  
  clone(){
    return new Fire();
  }
  
  toJSON(){
    return ['Fire'];
  }
  
  static fromArray(a)
  {
    return new Fire();
  }
}

/// 敵本体
class Enemy extends GameObj { 
  constructor(enemies,scene,se) {
  super(0, 0, 0);
  this.NONE =  0 ;
  this.START =  1 ;
  this.HOME =  2 ;
  this.ATTACK =  3 ;
  this.BOMB =  4 ;
  this.collisionArea.width = 12;
  this.collisionArea.height = 8;
  var tex = sfg.textureFiles.enemy;
  var material = createSpriteMaterial(tex);
  var geometry = createSpriteGeometry(16);
  createSpriteUV(geometry, tex, 16, 16, 0);
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

  get x() { return this.x_; }
  set x(v) { this.x_ = this.mesh.position.x = v; }
  get y() { return this.y_; }
  set y(v) { this.y_ = this.mesh.position.y = v; }
  get z() { return this.z_; }
  set z(v) { this.z_ = this.mesh.position.z = v; }
  
  ///敵の動き
  *move(taskIndex) {
    taskIndex = yield;
    while (taskIndex >= 0){
      while(!this.mv.next().done && taskIndex >= 0)
      {
        this.mesh.scale.x = this.enemies.homeDelta2;
        this.mesh.rotation.z = this.charRad;
        taskIndex = yield;
      }

      if(taskIndex < 0){
        taskIndex = -(++taskIndex);
        return;
      }

      let end = false;
      while (!end) {
        if (this.index < (this.mvPattern.length - 1)) {
          this.index++;
          this.mv = this.mvPattern[this.index].move(this,this.x,this.y);
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
  start(x, y, z, homeX, homeY, mvPattern, xrev,type, clearTarget,groupID) {
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
    this.mv = mvPattern[0].move(this,x,y);
    //this.mv.start(this, x, y);
    //if (this.status != this.NONE) {
    //  debugger;
    //}
    this.status = this.START;
    this.task = sfg.tasks.pushTask(this.move.bind(this), 10000);
    // if(this.task.index == 0){
    //   debugger;
    // }
    this.mesh.visible = true;
    return true;
  }
  
  hit(mybullet) {
    if (this.hit_ == null) {
      let life = this.life;
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
        if(this.task.index == 0){
          console.log('hit',this.task.index);
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
}

function Zako(self) {
  self.score = 50;
  self.life = 1;
  updateSpriteUV(self.mesh.geometry, sfg.textureFiles.enemy, 16, 16, 7);
}

Zako.toJSON = function ()
{
  return 'Zako';
};

function Zako1(self) {
  self.score = 100;
  self.life = 1;
  updateSpriteUV(self.mesh.geometry, sfg.textureFiles.enemy, 16, 16, 6);
}

Zako1.toJSON = function ()
{
  return 'Zako1';
};

function MBoss(self) {
  self.score = 300;
  self.life = 2;
  self.mesh.blending = THREE.NormalBlending;
  updateSpriteUV(self.mesh.geometry, sfg.textureFiles.enemy, 16, 16, 4);
}

MBoss.toJSON = function ()
{
  return 'MBoss';
};


class Enemies{
  constructor(scene, se, enemyBullets) {
    this.enemyBullets = enemyBullets;
    this.scene = scene;
    this.nextTime = 0;
    this.currentIndex = 0;
    this.enemies = new Array(0);
    this.homeDelta2 = 1.0;
    for (var i = 0; i < 64; ++i) {
      this.enemies.push(new Enemy(this, scene, se));
    }
    for (var i = 0; i < 5; ++i) {
      this.groupData[i] = new Array(0);
    }
  }
  
  startEnemy_(enemy,data)
  {
      enemy.start(data[1], data[2], 0, data[3], data[4], this.movePatterns[Math.abs(data[5])], data[5] < 0, data[6], data[7], data[8] || 0);
  }
  
  startEnemy(data){
    var enemies = this.enemies;
    for (var i = 0, e = enemies.length; i < e; ++i) {
      var enemy = enemies[i];
      if (!enemy.enable_) {
        return this.startEnemy_(enemy,data);
      }
    }    
  }
  
  startEnemyIndexed(data,index){
    let en = this.enemies[index];
    if(en.enable_){
        sfg.tasks.removeTask(en.task.index);
        en.status = en.NONE;
        en.enable_ = false;
        en.mesh.visible = false;
    }
    this.startEnemy_(en,data);
  }

  /// 敵編隊の動きをコントロールする
  move() {
    var currentTime = sfg.gameTimer.elapsedTime;
    var moveSeqs = this.moveSeqs;
    var len = moveSeqs[sfg.stage.privateNo].length;
    // データ配列をもとに敵を生成
    while (this.currentIndex < len) {
      var data = moveSeqs[sfg.stage.privateNo][this.currentIndex];
      var nextTime = this.nextTime != null ? this.nextTime : data[0];
      if (currentTime >= (this.nextTime + data[0])) {
        this.startEnemy(data);
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
      var attackCount = (1 + 0.25 * (sfg.stage.difficulty)) | 0;
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
          var count = 0, endg = group.length;
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

  reset() {
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

  calcEnemiesCount() {
    var seqs = this.moveSeqs[sfg.stage.privateNo];
    this.totalEnemiesCount = 0;
    for (var i = 0, end = seqs.length; i < end; ++i) {
      if (seqs[i][7]) {
        this.totalEnemiesCount++;
      }
    }
  }

  start() {
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
  
  loadPatterns(){
    this.movePatterns = [];
    let this_ = this;    
    return new Promise((resolve,reject)=>{
      d3.json('./res/enemyMovePattern.json',(err,data)=>{
        if(err){
          reject(err);
        }
        data.forEach((comArray,i)=>{
          let com = [];
          this.movePatterns.push(com);
          comArray.forEach((d,i)=>{
            com.push(this.createMovePatternFromArray(d));
          });
        });
        resolve();
      });
    });
  }
  
  createMovePatternFromArray(arr){
    let obj;
    switch(arr[0]){
      case 'LineMove':
        obj = LineMove.fromArray(arr);
        break;
      case 'CircleMove':
        obj =  CircleMove.fromArray(arr);
        break;
      case 'GotoHome':
        obj =   GotoHome.fromArray(arr);
        break;
      case 'HomeMove':
        obj =   HomeMove.fromArray(arr);
        break;
      case 'Goto':
        obj =   Goto.fromArray(arr);
        break;
      case 'Fire':
        obj =   Fire.fromArray(arr);
        break;
    }
    return obj;
//    throw new Error('MovePattern Not Found.');
  }
  
  loadFormations(){
    this.moveSeqs = [];
    return new Promise((resolve,reject)=>{
      d3.json('./res/enemyFormationPattern.json',(err,data)=>{
        if(err) reject(err);
        data.forEach((form,i)=>{
          let stage = [];
          this.moveSeqs.push(stage);
          form.forEach((d,i)=>{
            d[6] = getEnemyFunc(d[6]);
            stage.push(d);
          });          
        });
        resolve();
      });
    });
  }
  
}

var enemyFuncs = new Map([
      ["Zako",Zako],
      ["Zako1",Zako1],
      ["MBoss",MBoss]
    ]);

function getEnemyFunc(funcName)
{
  return enemyFuncs.get(funcName);
}

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

/// 爆発
class Bomb extends GameObj 
{
  constructor(scene,se) {
    super(0,0,0);
    var tex = sfg.textureFiles.bomb;
    var material = createSpriteMaterial(tex);
    material.blending = THREE.AdditiveBlending;
    material.needsUpdate = true;
    var geometry = createSpriteGeometry(16);
    createSpriteUV(geometry, tex, 16, 16, 0);
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.z = 0.1;
    this.index = 0;
    this.mesh.visible = false;
    this.scene = scene;
    this.se = se;
    scene.add(this.mesh);
  }
  get x() { return this.x_; }
  set x(v) { this.x_ = this.mesh.position.x = v; }
  get y() { return this.y_; }
  set y(v) { this.y_ = this.mesh.position.y = v; }
  get z() { return this.z_; }
  set z(v) { this.z_ = this.mesh.position.z = v; }
  
  start(x, y, z, delay) {
    if (this.enable_) {
      return false;
    }
    this.delay = delay | 0;
    this.x = x;
    this.y = y;
    this.z = z | 0.00002;
    this.enable_ = true;
    updateSpriteUV(this.mesh.geometry, sfg.textureFiles.bomb, 16, 16, this.index);
    this.task = sfg.tasks.pushTask(this.move.bind(this));
    this.mesh.material.opacity = 1.0;
    return true;
  }
  
  *move(taskIndex) {
    
    for( let i = 0,e = this.delay;i < e && taskIndex >= 0;++i)
    {
      taskIndex = yield;      
    }
    this.mesh.visible = true;

    for(let i = 0;i < 7 && taskIndex >= 0;++i)
    {
      updateSpriteUV(this.mesh.geometry, sfg.textureFiles.bomb, 16, 16, i);
      taskIndex = yield;
    }
    
    this.enable_ = false;
    this.mesh.visible = false;
    sfg.tasks.removeTask(taskIndex);
  }
}

class Bombs {
  constructor(scene, se) {
    this.bombs = new Array(0);
    for (var i = 0; i < 32; ++i) {
      this.bombs.push(new Bomb(scene, se));
    }
  }
  
  start(x, y, z) {
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

  reset(){
    this.bombs.forEach((d)=>{
      if(d.enable_){
        while(!sfg.tasks.array[d.task.index].genInst.next(-(1+d.task.index)).done);
      }
    });
  }
}

//var STAGE_MAX = 1;
//import * as song from './song';
class ScoreEntry {
  constructor(name, score) {
    this.name = name;
    this.score = score;
  }
}


class Stage extends EventEmitter {
  constructor() {
    super();
    this.MAX = 1;
    this.DIFFICULTY_MAX = 2.0;
    this.no = 1;
    this.privateNo = 0;
    this.difficulty = 1;
  }

  reset() {
    this.no = 1;
    this.privateNo = 0;
    this.difficulty = 1;
  }

  advance() {
    this.no++;
    this.privateNo++;
    this.update();
  }

  jump(stageNo) {
    this.no = stageNo;
    this.privateNo = this.no - 1;
    this.update();
  }

  update() {
    if (this.difficulty < this.DIFFICULTY_MAX) {
      this.difficulty = 1 + 0.05 * (this.no - 1);
    }

    if (this.privateNo >= this.MAX) {
      this.privateNo = 0;
  //    this.no = 1;
    }
    this.emit('update',this);
  }
}

class Game {
  constructor() {
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
    this.basicInput = new BasicInput();
    this.tasks = new Tasks();
    sfg.tasks = this.tasks;
    this.waveGraph = null;
    this.start = false;
    this.baseTime = new Date;
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
    this.title = null;// タイトルメッシュ
    this.spaceField = null;// 宇宙空間パーティクル
    this.editHandleName = null;
    sfg.addScore = this.addScore.bind(this);
    this.checkVisibilityAPI();
    this.audio_ = new Audio();
  }

  exec() {
    
    if (!this.checkBrowserSupport('#content')){
      return;
    }

    this.sequencer = new Sequencer(this.audio_);
    //piano = new audio.Piano(audio_);
    this.soundEffects = new SoundEffects(this.sequencer);

    document.addEventListener(window.visibilityChange, this.onVisibilityChange.bind(this), false);
    sfg.gameTimer = new GameTimer(this.getCurrentTime.bind(this));

    /// ゲームコンソールの初期化
    this.initConsole();
    this.loadResources()
      .then(() => {
        this.scene.remove(this.progress.mesh);
        this.renderer.render(this.scene, this.camera);
        this.tasks.clear();
        this.tasks.pushTask(this.basicInput.update.bind(this.basicInput));
        this.tasks.pushTask(this.init.bind(this));
        this.start = true;
        this.main();
      });
  }

  checkVisibilityAPI() {
    // hidden プロパティおよび可視性の変更イベントの名前を設定
    if (typeof document.hidden !== "undefined") { // Opera 12.10 や Firefox 18 以降でサポート 
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
  
  calcScreenSize() {
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
  initConsole(consoleClass) {
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

    window.addEventListener('resize', () => {
      this.calcScreenSize();
      renderer.setSize(this.CONSOLE_WIDTH, this.CONSOLE_HEIGHT);
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
  ExitError(e) {
    //ctx.fillStyle = "red";
    //ctx.fillRect(0, 0, CONSOLE_WIDTH, CONSOLE_HEIGHT);
    //ctx.fillStyle = "white";
    //ctx.fillText("Error : " + e, 0, 20);
    ////alert(e);
    this.start = false;
    throw e;
  }

  onVisibilityChange() {
    var h = document[this.hidden];
    this.isHidden = h;
    if (h) {
      this.pause();
    } else {
      this.resume();
    }
  }

  pause() {
    if (sfg.gameTimer.status == sfg.gameTimer.START) {
      sfg.gameTimer.pause();
    }
    if (this.sequencer.status == this.sequencer.PLAY) {
      this.sequencer.pause();
    }
    sfg.pause = true;
  }

  resume() {
    if (sfg.gameTimer.status == sfg.gameTimer.PAUSE) {
      sfg.gameTimer.resume();
    }
    if (this.sequencer.status == this.sequencer.PAUSE) {
      this.sequencer.resume();
    }
    sfg.pause = false;
  }

  /// 現在時間の取得
  getCurrentTime() {
    return this.audio_.audioctx.currentTime;
  }

  /// ブラウザの機能チェック
  checkBrowserSupport() {
    var content = '<img class="errorimg" src="http://public.blu.livefilestore.com/y2pbY3aqBz6wz4ah87RXEVk5ClhD2LujC5Ns66HKvR89ajrFdLM0TxFerYYURt83c_bg35HSkqc3E8GxaFD8-X94MLsFV5GU6BYp195IvegevQ/20131001.png?psid=1" width="479" height="640" class="alignnone" />';
    // WebGLのサポートチェック
    if (!Detector.webgl) {
      d3.select('#content').append('div').classed('error', true).html(
        content + '<p class="errortext">ブラウザが<br/>WebGLをサポートしていないため<br/>動作いたしません。</p>');
      return false;
    }

    // Web Audio APIラッパー
    if (!this.audio_.enable) {
      d3.select('#content').append('div').classed('error', true).html(
        content + '<p class="errortext">ブラウザが<br/>Web Audio APIをサポートしていないため<br/>動作いたしません。</p>');
      return false;
    }

    // ブラウザがPage Visibility API をサポートしない場合に警告 
    if (typeof this.hidden === 'undefined') {
      d3.select('#content').append('div').classed('error', true).html(
        content + '<p class="errortext">ブラウザが<br/>Page Visibility APIをサポートしていないため<br/>動作いたしません。</p>');
      return false;
    }

    if (typeof localStorage === 'undefined') {
      d3.select('#content').append('div').classed('error', true).html(
        content + '<p class="errortext">ブラウザが<br/>Web Local Storageをサポートしていないため<br/>動作いたしません。</p>');
      return false;
    } else {
      this.storage = localStorage;
    }
    return true;
  }
 
  /// ゲームメイン
  main() {
    // タスクの呼び出し
    // メインに描画
    if (this.start) {
      this.tasks.process(this);
    }
  }

  loadResources() {
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
      return new Promise((resolve, reject) => {
        loader.load(src, (texture) => {
          texture.magFilter = THREE.NearestFilter;
          texture.minFilter = THREE.LinearMipMapLinearFilter;
          resolve(texture);
        }, null, (xhr) => { reject(xhr); });
      });
    }

    var texLength = Object.keys(textures).length;
    var texCount = 0;
    this.progress = new Progress();
    this.progress.mesh.position.z = 0.001;
    this.progress.render('Loading Resouces ...', 0);
    this.scene.add(this.progress.mesh);
    for (var n in textures) {
      ((name, texPath) => {
        loadPromise = loadPromise
          .then(() => {
            return loadTexture('./res/' + texPath);
          })
          .then((tex) => {
            texCount++;
            this.progress.render('Loading Resouces ...', (texCount / texLength * 100) | 0);
            sfg.textureFiles[name] = tex;
            this.renderer.render(this.scene, this.camera);
            return Promise.resolve();
          });
      })(n, textures[n]);
    }
    return loadPromise;
  }

*render(taskIndex) {
  while(taskIndex >= 0){
    this.renderer.render(this.scene, this.camera);
    this.textPlane.render();
    this.stats && this.stats.update();
    taskIndex = yield;
  }
}

initActors()
{
  let promises = [];
  this.scene = this.scene || new THREE.Scene();
  this.enemyBullets = this.enemyBullets || new EnemyBullets(this.scene, this.se.bind(this));
  this.enemies = this.enemies || new Enemies(this.scene, this.se.bind(this), this.enemyBullets);
  promises.push(this.enemies.loadPatterns());
  promises.push(this.enemies.loadFormations());
  this.bombs = sfg.bombs = this.bombs || new Bombs(this.scene, this.se.bind(this));
  this.myship_ = this.myship_ || new MyShip(0, -100, 0.1, this.scene, this.se.bind(this));
  sfg.myship_ = this.myship_;
  this.myship_.mesh.visible = false;

  this.spaceField = null;
  return Promise.all(promises);
}

initCommAndHighScore()
{
  // ハンドルネームの取得
  this.handleName = this.storage.getItem('handleName');

  this.textPlane = new TextPlane(this.scene);
  // textPlane.print(0, 0, "Web Audio API Test", new TextAttribute(true));
  // スコア情報 通信用
  this.comm_ = new Comm();
  this.comm_.updateHighScores = (data) => {
    this.highScores = data;
    this.highScore = this.highScores[0].score;
  };

  this.comm_.updateHighScore = (data) => {
    if (this.highScore < data.score) {
      this.highScore = data.score;
      this.printScore();
    }
  };
  
}

*init(taskIndex) {
    taskIndex = yield;
    this.initCommAndHighScore();
    this.basicInput.bind();
    this.initActors()
    .then(()=>{
      this.tasks.pushTask(this.render.bind(this), this.RENDERER_PRIORITY);
      this.tasks.setNextTask(taskIndex, this.printAuthor.bind(this));
    });
}

/// 作者表示
*printAuthor(taskIndex) {
  const wait = 60;
  this.basicInput.keyBuffer.length = 0;
  
  let nextTask = ()=>{
    this.scene.remove(this.author);
    //scene.needsUpdate = true;
    this.tasks.setNextTask(taskIndex, this.initTitle.bind(this));
  };
  
  let checkKeyInput = ()=> {
    if (this.basicInput.keyBuffer.length > 0 || this.basicInput.start) {
      this.basicInput.keyBuffer.length = 0;
      nextTask();
      return true;
    }
    return false;
  };  

  // 初期化
  var canvas = document.createElement('canvas');
  var w = sfg$$1.textureFiles.author.image.width;
  var h = sfg$$1.textureFiles.author.image.height;
  canvas.width = w;
  canvas.height = h;
  var ctx = canvas.getContext('2d');
  ctx.drawImage(sfg$$1.textureFiles.author.image, 0, 0);
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
        var sfg$$1 = data.data[i++];
        var b = data.data[i++];
        var a = data.data[i++];
        if (a != 0) {
          color.setRGB(r / 255.0, sfg$$1 / 255.0, b / 255.0);
          var vert = new THREE.Vector3(((x - w / 2.0)), ((y - h / 2)) * -1, 0.0);
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
  var material = new THREE.PointsMaterial({size: 20, blending: THREE.AdditiveBlending,
    transparent: true, vertexColors: true, depthTest: false//, map: texture
  });

  this.author = new THREE.Points(geometry, material);
  //    author.position.x author.position.y=  =0.0, 0.0, 0.0);

  //mesh.sortParticles = false;
  //var mesh1 = new THREE.ParticleSystem();
  //mesh.scale.x = mesh.scale.y = 8.0;

  this.scene.add(this.author);  

 
  // 作者表示ステップ１
  for(let count = 1.0;count > 0;(count <= 0.01)?count -= 0.0005:count -= 0.0025)
  {
    // 何かキー入力があった場合は次のタスクへ
    if(checkKeyInput()){
      return;
    }
    
    let end = this.author.geometry.vertices.length;
    let v = this.author.geometry.vertices;
    let d = this.author.geometry.vert_start;
    let v2 = this.author.geometry.vert_end;
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

  for (let i = 0,e = this.author.geometry.vertices.length; i < e; ++i) {
    this.author.geometry.vertices[i].x = this.author.geometry.vert_end[i].x;
    this.author.geometry.vertices[i].y = this.author.geometry.vert_end[i].y;
    this.author.geometry.vertices[i].z = this.author.geometry.vert_end[i].z;
  }
  this.author.geometry.verticesNeedUpdate = true;

  // 待ち
  for(let i = 0;i < wait;++i){
    // 何かキー入力があった場合は次のタスクへ
    if(checkKeyInput()){
      return;
    }
    if (this.author.material.size > 2) {
      this.author.material.size -= 0.5;
      this.author.material.needsUpdate = true;
    }    
    yield;
  }

  // フェードアウト
  for(let count = 0.0;count <= 1.0;count += 0.05)
  {
    // 何かキー入力があった場合は次のタスクへ
    if(checkKeyInput()){
      return;
    }
    this.author.material.opacity = 1.0 - count;
    this.author.material.needsUpdate = true;
    
    yield;
  }

  this.author.material.opacity = 0.0; 
  this.author.material.needsUpdate = true;

  // 待ち
  for(let i = 0;i < wait;++i){
    // 何かキー入力があった場合は次のタスクへ
    if(checkKeyInput()){
      return;
    }
    yield;
  }
  nextTask();
}

/// タイトル画面初期化 ///
*initTitle(taskIndex) {
  
  taskIndex = yield;
  
  this.basicInput.clear();

  // タイトルメッシュの作成・表示 ///
  var material = new THREE.MeshBasicMaterial({ map: sfg.textureFiles.title });
  material.shading = THREE.FlatShading;
  //material.antialias = false;
  material.transparent = true;
  material.alphaTest = 0.5;
  material.depthTest = true;
  this.title = new THREE.Mesh(
    new THREE.PlaneGeometry(sfg.textureFiles.title.image.width, sfg.textureFiles.title.image.height),
    material
    );
  this.title.scale.x = this.title.scale.y = 0.8;
  this.title.position.y = 80;
  this.scene.add(this.title);
  this.showSpaceField();
  /// テキスト表示
  this.textPlane.print(3, 25, "Push z or START button", new TextAttribute(true));
  sfg.gameTimer.start();
  this.showTitle.endTime = sfg.gameTimer.elapsedTime + 10/*秒*/;
  this.tasks.setNextTask(taskIndex, this.showTitle.bind(this));
  return;
}

/// 背景パーティクル表示
showSpaceField() {
  /// 背景パーティクル表示
  if (!this.spaceField) {
    var geometry = new THREE.Geometry();

    geometry.endy = [];
    for (var i = 0; i < 250; ++i) {
      var color = new THREE.Color();
      var z = -1800.0 * Math.random() - 300.0;
      color.setHSL(0.05 + Math.random() * 0.05, 1.0, (-2100 - z) / -2100);
      var endy = sfg.VIRTUAL_HEIGHT / 2 - z * sfg.VIRTUAL_HEIGHT / sfg.VIRTUAL_WIDTH;
      var vert2 = new THREE.Vector3((sfg.VIRTUAL_WIDTH - z * 2) * Math.random() - ((sfg.VIRTUAL_WIDTH - z * 2) / 2)
        , endy * 2 * Math.random() - endy, z);
      geometry.vertices.push(vert2);
      geometry.endy.push(endy);

      geometry.colors.push(color);
    }

    // マテリアルを作成
    //var texture = THREE.ImageUtils.loadTexture('images/particle1.png');
    var material = new THREE.PointsMaterial({
      size: 4, blending: THREE.AdditiveBlending,
      transparent: true, vertexColors: true, depthTest: true//, map: texture
    });

    this.spaceField = new THREE.Points(geometry, material);
    this.spaceField.position.x = this.spaceField.position.y = this.spaceField.position.z = 0.0;
    this.scene.add(this.spaceField);
    this.tasks.pushTask(this.moveSpaceField.bind(this));
  }
}

/// 宇宙空間の表示
*moveSpaceField(taskIndex) {
  while(true){
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
*showTitle(taskIndex) {
 while(true){
  sfg.gameTimer.update();

  if (this.basicInput.z || this.basicInput.start ) {
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
*initHandleName(taskIndex) {
  let end = false;
  if (this.editHandleName){
    this.tasks.setNextTask(taskIndex, this.gameInit.bind(this));
  } else {
    this.editHandleName = this.handleName || '';
    this.textPlane.cls();
    this.textPlane.print(4, 18, 'Input your handle name.');
    this.textPlane.print(8, 19, '(Max 8 Char)');
    this.textPlane.print(10, 21, this.editHandleName);
    //    textPlane.print(10, 21, handleName[0], TextAttribute(true));
    this.basicInput.unbind();
    var elm = d3.select('#content').append('input');
    let this_ = this;
    elm
      .attr('type', 'text')
      .attr('pattern', '[a-zA-Z0-9_\@\#\$\-]{0,8}')
      .attr('maxlength', 8)
      .attr('id', 'input-area')
      .attr('value', this_.editHandleName)
      .call(function (d) {
        d.node().selectionStart = this_.editHandleName.length;
      })
      .on('blur', function () {
        d3.event.preventDefault();
        d3.event.stopImmediatePropagation();
        //let this_ = this;
        setTimeout( () => { this.focus(); }, 10);
        return false;
      })
      .on('keyup', function() {
        if (d3.event.keyCode == 13) {
          this_.editHandleName = this.value;
          let s = this.selectionStart;
          let e = this.selectionEnd;
          this_.textPlane.print(10, 21, this_.editHandleName);
          this_.textPlane.print(10 + s, 21, '_', new TextAttribute(true));
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
        let s = this.selectionStart;
        this_.textPlane.print(10, 21, '           ');
        this_.textPlane.print(10, 21, this_.editHandleName);
        this_.textPlane.print(10 + s, 21, '_', new TextAttribute(true));
      })
      .call(function(){
        let s = this.node().selectionStart;
        this_.textPlane.print(10, 21, '           ');
        this_.textPlane.print(10, 21, this_.editHandleName);
        this_.textPlane.print(10 + s, 21, '_', new TextAttribute(true));
        this.node().focus();
      });

    while(taskIndex >= 0)
    {
      this.basicInput.clear();
      if(this.basicInput.aButton || this.basicInput.start)
      {
          var inputArea = d3.select('#input-area');
          var inputNode = inputArea.node();
          this.editHandleName = inputNode.value;
          let s = inputNode.selectionStart;
          let e = inputNode.selectionEnd;
          this.textPlane.print(10, 21, this.editHandleName);
          this.textPlane.print(10 + s, 21, '_', new TextAttribute(true));
          inputArea.on('keyup', null);
          this.basicInput.bind();
          // このタスクを終わらせる
          //this.tasks.array[taskIndex].genInst.next(-(taskIndex + 1));
          // 次のタスクを設定する
          this.tasks.setNextTask(taskIndex, this.gameInit.bind(this));
          this.storage.setItem('handleName', this.editHandleName);
          inputArea.remove();
          return;        
      }
      taskIndex = yield;
    }
    taskIndex = -(++taskIndex);
  }
}

/// スコア加算
addScore(s) {
  this.score += s;
  if (this.score > this.highScore) {
    this.highScore = this.score;
  }
}

/// スコア表示
printScore() {
  var s = ('00000000' + this.score.toString()).slice(-8);
  this.textPlane.print(1, 1, s);

  var h = ('00000000' + this.highScore.toString()).slice(-8);
  this.textPlane.print(12, 1, h);

}

/// サウンドエフェクト
se(index) {
  this.sequencer.playTracks(this.soundEffects.soundEffects[index]);
}

/// ゲームの初期化
*gameInit(taskIndex) {

  taskIndex = yield;
  

  // オーディオの開始
  this.audio_.start();
  this.sequencer.load(seqData);
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
  this.tasks.setNextTask(taskIndex, this.stageInit.bind(this)/*gameAction*/);
}

/// ステージの初期化
*stageInit(taskIndex) {
  
  taskIndex = yield;
  
  this.textPlane.print(0, 39, 'Stage:' + sfg.stage.no);
  sfg.gameTimer.start();
  this.enemies.reset();
  this.enemies.start();
  this.enemies.calcEnemiesCount(sfg.stage.privateNo);
  this.enemies.hitEnemiesCount = 0;
  this.textPlane.print(8, 15, 'Stage ' + (sfg.stage.no) + ' Start !!', new TextAttribute(true));
  this.tasks.setNextTask(taskIndex, this.stageStart.bind(this));
}

/// ステージ開始
*stageStart(taskIndex) {
  let endTime = sfg.gameTimer.elapsedTime + 2;
  while(taskIndex >= 0 && endTime >= sfg.gameTimer.elapsedTime){
    sfg.gameTimer.update();
    sfg.myship_.action(this.basicInput);
    taskIndex = yield;    
  }
  this.textPlane.print(8, 15, '                  ', new TextAttribute(true));
  this.tasks.setNextTask(taskIndex, this.gameAction.bind(this), 5000);
}

/// ゲーム中
*gameAction(taskIndex) {
  while (taskIndex >= 0){
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
    }
    taskIndex = yield; 
  }
}

/// 当たり判定
processCollision(taskIndex) {
  //　自機弾と敵とのあたり判定
  let myBullets = sfg.myship_.myBullets;
  this.ens = this.enemies.enemies;
  for (var i = 0, end = myBullets.length; i < end; ++i) {
    let myb = myBullets[i];
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
          if (top > (en.y + enco.bottom) &&
            (en.y + enco.top) > bottom &&
            left < (en.x + enco.right) &&
            (en.x + enco.left) < right
            ) {
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
    let myco = sfg.myship_.collisionArea;
    let left = sfg.myship_.x + myco.left;
    let right = myco.right + sfg.myship_.x;
    let top = myco.top + sfg.myship_.y;
    let bottom = myco.bottom + sfg.myship_.y;

    for (var i = 0, end = this.ens.length; i < end; ++i) {
      let en = this.ens[i];
      if (en.enable_) {
        let enco = en.collisionArea;
        if (top > (en.y + enco.bottom) &&
          (en.y + enco.top) > bottom &&
          left < (en.x + enco.right) &&
          (en.x + enco.left) < right
          ) {
          en.hit(myship);
          sfg.myship_.hit();
          return true;
        }
      }
    }
    // 敵弾と自機とのあたり判定
    this.enbs = this.enemyBullets.enemyBullets;
    for (var i = 0, end = this.enbs.length; i < end; ++i) {
      let en = this.enbs[i];
      if (en.enable) {
        let enco = en.collisionArea;
        if (top > (en.y + enco.bottom) &&
          (en.y + enco.top) > bottom &&
          left < (en.x + enco.right) &&
          (en.x + enco.left) < right
          ) {
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
*myShipBomb(taskIndex) {
  while(sfg.gameTimer.elapsedTime <= this.myShipBomb.endTime && taskIndex >= 0){
    this.enemies.move();
    sfg.gameTimer.update();
    taskIndex = yield;  
  }
  sfg.myship_.rest--;
  if (sfg.myship_.rest == 0) {
    this.textPlane.print(10, 18, 'GAME OVER', new TextAttribute(true));
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
    this.textPlane.print(8, 15, 'Stage ' + (sfg.stage.no) + ' Start !!', new TextAttribute(true));
    this.stageStart.endTime = sfg.gameTimer.elapsedTime + 2;
    this.tasks.setNextTask(taskIndex, this.stageStart.bind(this));
  }
}

/// ゲームオーバー
*gameOver(taskIndex) {
  while(this.gameOver.endTime >= sfg.gameTimer.elapsedTime && taskIndex >= 0)
  {
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
checkRankIn(data) {
  this.rank = data.rank;
}


/// ハイスコアエントリの表示
printTop10() {
  var rankname = [' 1st', ' 2nd', ' 3rd', ' 4th', ' 5th', ' 6th', ' 7th', ' 8th', ' 9th', '10th'];
  this.textPlane.print(8, 4, 'Top 10 Score');
  var y = 8;
  for (var i = 0, end = this.highScores.length; i < end; ++i) {
    var scoreStr = '00000000' + this.highScores[i].score;
    scoreStr = scoreStr.substr(scoreStr.length - 8, 8);
    if (this.rank == i) {
      this.textPlane.print(3, y, rankname[i] + ' ' + scoreStr + ' ' + this.highScores[i].name, new TextAttribute(true));
    } else {
      this.textPlane.print(3, y, rankname[i] + ' ' + scoreStr + ' ' + this.highScores[i].name);
    }
    y += 2;
  }
}


*initTop10(taskIndex) {
  taskIndex = yield;
  this.textPlane.cls();
  this.printTop10();
  this.showTop10.endTime = sfg.gameTimer.elapsedTime + 5;
  this.tasks.setNextTask(taskIndex, this.showTop10.bind(this));
}

*showTop10(taskIndex) {
  while(this.showTop10.endTime >= sfg.gameTimer.elapsedTime && this.basicInput.keyBuffer.length == 0 && taskIndex >= 0)
  {
    sfg.gameTimer.update();
    taskIndex = yield;
  } 
  
  this.basicInput.keyBuffer.length = 0;
  this.textPlane.cls();
  this.tasks.setNextTask(taskIndex, this.initTitle.bind(this));
}
}

//var STAGE_MAX = 1;
// import * as util from './util.js';
// import * as audio from './audio.js';
// //import * as song from './song';
// import * as graphics from './graphics.js';
// import * as io from './io.js';
// import * as comm from './comm.js';
// import * as text from './text.js';
// import * as gameobj from './gameobj.js';
// import * as myship from './myship.js';
// import * as enemies from './enemies.js';
// import * as effectobj from './effectobj.js';
/// メイン
window.onload = function () {

  sfg.game = new Game();
  sfg.game.exec();
};

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi8uLi9zcmMvanMvZ2xvYmFsLmpzIiwiLi4vLi4vc3JjL2pzL2V2ZW50RW1pdHRlcjMuanMiLCIuLi8uLi9zcmMvanMvdXRpbC5qcyIsIi4uLy4uL3NyYy9qcy9hdWRpby5qcyIsIi4uLy4uL3NyYy9qcy9ncmFwaGljcy5qcyIsIi4uLy4uL3NyYy9qcy9pby5qcyIsIi4uLy4uL3NyYy9qcy9jb21tLmpzIiwiLi4vLi4vc3JjL2pzL3RleHQuanMiLCIuLi8uLi9zcmMvanMvZ2FtZW9iai5qcyIsIi4uLy4uL3NyYy9qcy9teXNoaXAuanMiLCIuLi8uLi9zcmMvanMvZW5lbWllcy5qcyIsIi4uLy4uL3NyYy9qcy9lZmZlY3RvYmouanMiLCIuLi8uLi9zcmMvanMvZ2FtZS5qcyIsIi4uLy4uL3NyYy9qcy9tYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNsYXNzIHNmZ18ge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5nYW1lID0gbnVsbDtcclxuICAgICAgICB0aGlzLlZJUlRVQUxfV0lEVEggPSAyNDA7XHJcbiAgICAgICAgdGhpcy5WSVJUVUFMX0hFSUdIVCA9IDMyMDtcclxuXHJcbiAgICAgICAgdGhpcy5WX1JJR0hUID0gdGhpcy5WSVJUVUFMX1dJRFRIIC8gMi4wO1xyXG4gICAgICAgIHRoaXMuVl9UT1AgPSB0aGlzLlZJUlRVQUxfSEVJR0hUIC8gMi4wO1xyXG4gICAgICAgIHRoaXMuVl9MRUZUID0gLTEgKiB0aGlzLlZJUlRVQUxfV0lEVEggLyAyLjA7XHJcbiAgICAgICAgdGhpcy5WX0JPVFRPTSA9IC0xICogdGhpcy5WSVJUVUFMX0hFSUdIVCAvIDIuMDtcclxuXHJcbiAgICAgICAgdGhpcy5DSEFSX1NJWkUgPSA4O1xyXG4gICAgICAgIHRoaXMuVEVYVF9XSURUSCA9IHRoaXMuVklSVFVBTF9XSURUSCAvIHRoaXMuQ0hBUl9TSVpFO1xyXG4gICAgICAgIHRoaXMuVEVYVF9IRUlHSFQgPSB0aGlzLlZJUlRVQUxfSEVJR0hUIC8gdGhpcy5DSEFSX1NJWkU7XHJcbiAgICAgICAgdGhpcy5QSVhFTF9TSVpFID0gMTtcclxuICAgICAgICB0aGlzLkFDVFVBTF9DSEFSX1NJWkUgPSB0aGlzLkNIQVJfU0laRSAqIHRoaXMuUElYRUxfU0laRTtcclxuICAgICAgICB0aGlzLlNQUklURV9TSVpFX1ggPSAxNi4wO1xyXG4gICAgICAgIHRoaXMuU1BSSVRFX1NJWkVfWSA9IDE2LjA7XHJcbiAgICAgICAgdGhpcy5DSEVDS19DT0xMSVNJT04gPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuREVCVUcgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnRleHR1cmVGaWxlcyA9IHt9O1xyXG4gICAgICAgIHRoaXMuc3RhZ2UgPSAwO1xyXG4gICAgICAgIHRoaXMudGFza3MgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuZ2FtZVRpbWVyID0gbnVsbDtcclxuICAgICAgICB0aGlzLmJvbWJzID0gbnVsbDtcclxuICAgICAgICB0aGlzLmFkZFNjb3JlID0gbnVsbDtcclxuICAgICAgICB0aGlzLm15c2hpcF8gPSBudWxsO1xyXG4gICAgICAgIHRoaXMudGV4dHVyZVJvb3QgPSAnLi9yZXMvJztcclxuICAgICAgICB0aGlzLnBhdXNlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5nYW1lID0gbnVsbDtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IHZhciBzZmcgPSBuZXcgc2ZnXygpO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG4vL1xyXG4vLyBXZSBzdG9yZSBvdXIgRUUgb2JqZWN0cyBpbiBhIHBsYWluIG9iamVjdCB3aG9zZSBwcm9wZXJ0aWVzIGFyZSBldmVudCBuYW1lcy5cclxuLy8gSWYgYE9iamVjdC5jcmVhdGUobnVsbClgIGlzIG5vdCBzdXBwb3J0ZWQgd2UgcHJlZml4IHRoZSBldmVudCBuYW1lcyB3aXRoIGFcclxuLy8gYH5gIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSBidWlsdC1pbiBvYmplY3QgcHJvcGVydGllcyBhcmUgbm90IG92ZXJyaWRkZW4gb3JcclxuLy8gdXNlZCBhcyBhbiBhdHRhY2sgdmVjdG9yLlxyXG4vLyBXZSBhbHNvIGFzc3VtZSB0aGF0IGBPYmplY3QuY3JlYXRlKG51bGwpYCBpcyBhdmFpbGFibGUgd2hlbiB0aGUgZXZlbnQgbmFtZVxyXG4vLyBpcyBhbiBFUzYgU3ltYm9sLlxyXG4vL1xyXG52YXIgcHJlZml4ID0gdHlwZW9mIE9iamVjdC5jcmVhdGUgIT09ICdmdW5jdGlvbicgPyAnficgOiBmYWxzZTtcclxuXHJcbi8qKlxyXG4gKiBSZXByZXNlbnRhdGlvbiBvZiBhIHNpbmdsZSBFdmVudEVtaXR0ZXIgZnVuY3Rpb24uXHJcbiAqXHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEV2ZW50IGhhbmRsZXIgdG8gYmUgY2FsbGVkLlxyXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IENvbnRleHQgZm9yIGZ1bmN0aW9uIGV4ZWN1dGlvbi5cclxuICogQHBhcmFtIHtCb29sZWFufSBvbmNlIE9ubHkgZW1pdCBvbmNlXHJcbiAqIEBhcGkgcHJpdmF0ZVxyXG4gKi9cclxuZnVuY3Rpb24gRUUoZm4sIGNvbnRleHQsIG9uY2UpIHtcclxuICB0aGlzLmZuID0gZm47XHJcbiAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcclxuICB0aGlzLm9uY2UgPSBvbmNlIHx8IGZhbHNlO1xyXG59XHJcblxyXG4vKipcclxuICogTWluaW1hbCBFdmVudEVtaXR0ZXIgaW50ZXJmYWNlIHRoYXQgaXMgbW9sZGVkIGFnYWluc3QgdGhlIE5vZGUuanNcclxuICogRXZlbnRFbWl0dGVyIGludGVyZmFjZS5cclxuICpcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7IC8qIE5vdGhpbmcgdG8gc2V0ICovIH1cclxuXHJcbi8qKlxyXG4gKiBIb2xkcyB0aGUgYXNzaWduZWQgRXZlbnRFbWl0dGVycyBieSBuYW1lLlxyXG4gKlxyXG4gKiBAdHlwZSB7T2JqZWN0fVxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xyXG5cclxuLyoqXHJcbiAqIFJldHVybiBhIGxpc3Qgb2YgYXNzaWduZWQgZXZlbnQgbGlzdGVuZXJzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50cyB0aGF0IHNob3VsZCBiZSBsaXN0ZWQuXHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gZXhpc3RzIFdlIG9ubHkgbmVlZCB0byBrbm93IGlmIHRoZXJlIGFyZSBsaXN0ZW5lcnMuXHJcbiAqIEByZXR1cm5zIHtBcnJheXxCb29sZWFufVxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbiBsaXN0ZW5lcnMoZXZlbnQsIGV4aXN0cykge1xyXG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50XHJcbiAgICAsIGF2YWlsYWJsZSA9IHRoaXMuX2V2ZW50cyAmJiB0aGlzLl9ldmVudHNbZXZ0XTtcclxuXHJcbiAgaWYgKGV4aXN0cykgcmV0dXJuICEhYXZhaWxhYmxlO1xyXG4gIGlmICghYXZhaWxhYmxlKSByZXR1cm4gW107XHJcbiAgaWYgKGF2YWlsYWJsZS5mbikgcmV0dXJuIFthdmFpbGFibGUuZm5dO1xyXG5cclxuICBmb3IgKHZhciBpID0gMCwgbCA9IGF2YWlsYWJsZS5sZW5ndGgsIGVlID0gbmV3IEFycmF5KGwpOyBpIDwgbDsgaSsrKSB7XHJcbiAgICBlZVtpXSA9IGF2YWlsYWJsZVtpXS5mbjtcclxuICB9XHJcblxyXG4gIHJldHVybiBlZTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBFbWl0IGFuIGV2ZW50IHRvIGFsbCByZWdpc3RlcmVkIGV2ZW50IGxpc3RlbmVycy5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBuYW1lIG9mIHRoZSBldmVudC5cclxuICogQHJldHVybnMge0Jvb2xlYW59IEluZGljYXRpb24gaWYgd2UndmUgZW1pdHRlZCBhbiBldmVudC5cclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIGVtaXQoZXZlbnQsIGExLCBhMiwgYTMsIGE0LCBhNSkge1xyXG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xyXG5cclxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW2V2dF0pIHJldHVybiBmYWxzZTtcclxuXHJcbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldnRdXHJcbiAgICAsIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGhcclxuICAgICwgYXJnc1xyXG4gICAgLCBpO1xyXG5cclxuICBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGxpc3RlbmVycy5mbikge1xyXG4gICAgaWYgKGxpc3RlbmVycy5vbmNlKSB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcnMuZm4sIHVuZGVmaW5lZCwgdHJ1ZSk7XHJcblxyXG4gICAgc3dpdGNoIChsZW4pIHtcclxuICAgICAgY2FzZSAxOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQpLCB0cnVlO1xyXG4gICAgICBjYXNlIDI6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEpLCB0cnVlO1xyXG4gICAgICBjYXNlIDM6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyKSwgdHJ1ZTtcclxuICAgICAgY2FzZSA0OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMpLCB0cnVlO1xyXG4gICAgICBjYXNlIDU6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMywgYTQpLCB0cnVlO1xyXG4gICAgICBjYXNlIDY6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMywgYTQsIGE1KSwgdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKGkgPSAxLCBhcmdzID0gbmV3IEFycmF5KGxlbiAtMSk7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcclxuICAgIH1cclxuXHJcbiAgICBsaXN0ZW5lcnMuZm4uYXBwbHkobGlzdGVuZXJzLmNvbnRleHQsIGFyZ3MpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICB2YXIgbGVuZ3RoID0gbGlzdGVuZXJzLmxlbmd0aFxyXG4gICAgICAsIGo7XHJcblxyXG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGlmIChsaXN0ZW5lcnNbaV0ub25jZSkgdGhpcy5yZW1vdmVMaXN0ZW5lcihldmVudCwgbGlzdGVuZXJzW2ldLmZuLCB1bmRlZmluZWQsIHRydWUpO1xyXG5cclxuICAgICAgc3dpdGNoIChsZW4pIHtcclxuICAgICAgICBjYXNlIDE6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0KTsgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAyOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgYTEpOyBicmVhaztcclxuICAgICAgICBjYXNlIDM6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhMSwgYTIpOyBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgaWYgKCFhcmdzKSBmb3IgKGogPSAxLCBhcmdzID0gbmV3IEFycmF5KGxlbiAtMSk7IGogPCBsZW47IGorKykge1xyXG4gICAgICAgICAgICBhcmdzW2ogLSAxXSA9IGFyZ3VtZW50c1tqXTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBsaXN0ZW5lcnNbaV0uZm4uYXBwbHkobGlzdGVuZXJzW2ldLmNvbnRleHQsIGFyZ3MpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdHJ1ZTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZWdpc3RlciBhIG5ldyBFdmVudExpc3RlbmVyIGZvciB0aGUgZ2l2ZW4gZXZlbnQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBOYW1lIG9mIHRoZSBldmVudC5cclxuICogQHBhcmFtIHtGdW5jdG9ufSBmbiBDYWxsYmFjayBmdW5jdGlvbi5cclxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBUaGUgY29udGV4dCBvZiB0aGUgZnVuY3Rpb24uXHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gb24oZXZlbnQsIGZuLCBjb250ZXh0KSB7XHJcbiAgdmFyIGxpc3RlbmVyID0gbmV3IEVFKGZuLCBjb250ZXh0IHx8IHRoaXMpXHJcbiAgICAsIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XHJcblxyXG4gIGlmICghdGhpcy5fZXZlbnRzKSB0aGlzLl9ldmVudHMgPSBwcmVmaXggPyB7fSA6IE9iamVjdC5jcmVhdGUobnVsbCk7XHJcbiAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XSkgdGhpcy5fZXZlbnRzW2V2dF0gPSBsaXN0ZW5lcjtcclxuICBlbHNlIHtcclxuICAgIGlmICghdGhpcy5fZXZlbnRzW2V2dF0uZm4pIHRoaXMuX2V2ZW50c1tldnRdLnB1c2gobGlzdGVuZXIpO1xyXG4gICAgZWxzZSB0aGlzLl9ldmVudHNbZXZ0XSA9IFtcclxuICAgICAgdGhpcy5fZXZlbnRzW2V2dF0sIGxpc3RlbmVyXHJcbiAgICBdO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogQWRkIGFuIEV2ZW50TGlzdGVuZXIgdGhhdCdzIG9ubHkgY2FsbGVkIG9uY2UuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBOYW1lIG9mIHRoZSBldmVudC5cclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gQ2FsbGJhY2sgZnVuY3Rpb24uXHJcbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgVGhlIGNvbnRleHQgb2YgdGhlIGZ1bmN0aW9uLlxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24gb25jZShldmVudCwgZm4sIGNvbnRleHQpIHtcclxuICB2YXIgbGlzdGVuZXIgPSBuZXcgRUUoZm4sIGNvbnRleHQgfHwgdGhpcywgdHJ1ZSlcclxuICAgICwgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcclxuXHJcbiAgaWYgKCF0aGlzLl9ldmVudHMpIHRoaXMuX2V2ZW50cyA9IHByZWZpeCA/IHt9IDogT2JqZWN0LmNyZWF0ZShudWxsKTtcclxuICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdKSB0aGlzLl9ldmVudHNbZXZ0XSA9IGxpc3RlbmVyO1xyXG4gIGVsc2Uge1xyXG4gICAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XS5mbikgdGhpcy5fZXZlbnRzW2V2dF0ucHVzaChsaXN0ZW5lcik7XHJcbiAgICBlbHNlIHRoaXMuX2V2ZW50c1tldnRdID0gW1xyXG4gICAgICB0aGlzLl9ldmVudHNbZXZ0XSwgbGlzdGVuZXJcclxuICAgIF07XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZW1vdmUgZXZlbnQgbGlzdGVuZXJzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IHdlIHdhbnQgdG8gcmVtb3ZlLlxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgbGlzdGVuZXIgdGhhdCB3ZSBuZWVkIHRvIGZpbmQuXHJcbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgT25seSByZW1vdmUgbGlzdGVuZXJzIG1hdGNoaW5nIHRoaXMgY29udGV4dC5cclxuICogQHBhcmFtIHtCb29sZWFufSBvbmNlIE9ubHkgcmVtb3ZlIG9uY2UgbGlzdGVuZXJzLlxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuXHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcihldmVudCwgZm4sIGNvbnRleHQsIG9uY2UpIHtcclxuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcclxuXHJcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1tldnRdKSByZXR1cm4gdGhpcztcclxuXHJcbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldnRdXHJcbiAgICAsIGV2ZW50cyA9IFtdO1xyXG5cclxuICBpZiAoZm4pIHtcclxuICAgIGlmIChsaXN0ZW5lcnMuZm4pIHtcclxuICAgICAgaWYgKFxyXG4gICAgICAgICAgIGxpc3RlbmVycy5mbiAhPT0gZm5cclxuICAgICAgICB8fCAob25jZSAmJiAhbGlzdGVuZXJzLm9uY2UpXHJcbiAgICAgICAgfHwgKGNvbnRleHQgJiYgbGlzdGVuZXJzLmNvbnRleHQgIT09IGNvbnRleHQpXHJcbiAgICAgICkge1xyXG4gICAgICAgIGV2ZW50cy5wdXNoKGxpc3RlbmVycyk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBsaXN0ZW5lcnMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICBsaXN0ZW5lcnNbaV0uZm4gIT09IGZuXHJcbiAgICAgICAgICB8fCAob25jZSAmJiAhbGlzdGVuZXJzW2ldLm9uY2UpXHJcbiAgICAgICAgICB8fCAoY29udGV4dCAmJiBsaXN0ZW5lcnNbaV0uY29udGV4dCAhPT0gY29udGV4dClcclxuICAgICAgICApIHtcclxuICAgICAgICAgIGV2ZW50cy5wdXNoKGxpc3RlbmVyc1tpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvL1xyXG4gIC8vIFJlc2V0IHRoZSBhcnJheSwgb3IgcmVtb3ZlIGl0IGNvbXBsZXRlbHkgaWYgd2UgaGF2ZSBubyBtb3JlIGxpc3RlbmVycy5cclxuICAvL1xyXG4gIGlmIChldmVudHMubGVuZ3RoKSB7XHJcbiAgICB0aGlzLl9ldmVudHNbZXZ0XSA9IGV2ZW50cy5sZW5ndGggPT09IDEgPyBldmVudHNbMF0gOiBldmVudHM7XHJcbiAgfSBlbHNlIHtcclxuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbZXZ0XTtcclxuICB9XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlbW92ZSBhbGwgbGlzdGVuZXJzIG9yIG9ubHkgdGhlIGxpc3RlbmVycyBmb3IgdGhlIHNwZWNpZmllZCBldmVudC5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCB3YW50IHRvIHJlbW92ZSBhbGwgbGlzdGVuZXJzIGZvci5cclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24gcmVtb3ZlQWxsTGlzdGVuZXJzKGV2ZW50KSB7XHJcbiAgaWYgKCF0aGlzLl9ldmVudHMpIHJldHVybiB0aGlzO1xyXG5cclxuICBpZiAoZXZlbnQpIGRlbGV0ZSB0aGlzLl9ldmVudHNbcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudF07XHJcbiAgZWxzZSB0aGlzLl9ldmVudHMgPSBwcmVmaXggPyB7fSA6IE9iamVjdC5jcmVhdGUobnVsbCk7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLy9cclxuLy8gQWxpYXMgbWV0aG9kcyBuYW1lcyBiZWNhdXNlIHBlb3BsZSByb2xsIGxpa2UgdGhhdC5cclxuLy9cclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vZmYgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyO1xyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbjtcclxuXHJcbi8vXHJcbi8vIFRoaXMgZnVuY3Rpb24gZG9lc24ndCBhcHBseSBhbnltb3JlLlxyXG4vL1xyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uIHNldE1heExpc3RlbmVycygpIHtcclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8vXHJcbi8vIEV4cG9zZSB0aGUgcHJlZml4LlxyXG4vL1xyXG5FdmVudEVtaXR0ZXIucHJlZml4ZWQgPSBwcmVmaXg7XHJcblxyXG4vL1xyXG4vLyBFeHBvc2UgdGhlIG1vZHVsZS5cclxuLy9cclxuaWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgbW9kdWxlKSB7XHJcbiAgbW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XHJcbn1cclxuXHJcbiIsIlxyXG5cInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0IHtzZmd9IGZyb20gJy4vZ2xvYmFsLmpzJztcclxuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICcuL2V2ZW50RW1pdHRlcjMuanMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFRhc2sge1xyXG4gIGNvbnN0cnVjdG9yKGdlbkluc3QscHJpb3JpdHkpIHtcclxuICAgIHRoaXMucHJpb3JpdHkgPSBwcmlvcml0eSB8fCAxMDAwMDtcclxuICAgIHRoaXMuZ2VuSW5zdCA9IGdlbkluc3Q7XHJcbiAgICAvLyDliJ3mnJ/ljJZcclxuICAgIHRoaXMuaW5kZXggPSAwO1xyXG4gIH1cclxuICBcclxufVxyXG5cclxuZXhwb3J0IHZhciBudWxsVGFzayA9IG5ldyBUYXNrKChmdW5jdGlvbiooKXt9KSgpKTtcclxuXHJcbi8vLyDjgr/jgrnjgq/nrqHnkIZcclxuZXhwb3J0IGNsYXNzIFRhc2tzIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcclxuICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgc3VwZXIoKTtcclxuICAgIHRoaXMuYXJyYXkgPSBuZXcgQXJyYXkoMCk7XHJcbiAgICB0aGlzLm5lZWRTb3J0ID0gZmFsc2U7XHJcbiAgICB0aGlzLm5lZWRDb21wcmVzcyA9IGZhbHNlO1xyXG4gICAgdGhpcy5lbmFibGUgPSB0cnVlO1xyXG4gICAgdGhpcy5zdG9wcGVkID0gZmFsc2U7XHJcbiAgfVxyXG4gIC8vIGluZGV444Gu5L2N572u44Gu44K/44K544Kv44KS572u44GN5o+b44GI44KLXHJcbiAgc2V0TmV4dFRhc2soaW5kZXgsIGdlbkluc3QsIHByaW9yaXR5KSBcclxuICB7XHJcbiAgICBpZihpbmRleCA8IDApe1xyXG4gICAgICBpbmRleCA9IC0oKytpbmRleCk7XHJcbiAgICB9XHJcbiAgICBpZih0aGlzLmFycmF5W2luZGV4XS5wcmlvcml0eSA9PSAxMDAwMDApe1xyXG4gICAgICBkZWJ1Z2dlcjtcclxuICAgIH1cclxuICAgIHZhciB0ID0gbmV3IFRhc2soZ2VuSW5zdChpbmRleCksIHByaW9yaXR5KTtcclxuICAgIHQuaW5kZXggPSBpbmRleDtcclxuICAgIHRoaXMuYXJyYXlbaW5kZXhdID0gdDtcclxuICAgIHRoaXMubmVlZFNvcnQgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgcHVzaFRhc2soZ2VuSW5zdCwgcHJpb3JpdHkpIHtcclxuICAgIGxldCB0O1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmFycmF5Lmxlbmd0aDsgKytpKSB7XHJcbiAgICAgIGlmICh0aGlzLmFycmF5W2ldID09IG51bGxUYXNrKSB7XHJcbiAgICAgICAgdCA9IG5ldyBUYXNrKGdlbkluc3QoaSksIHByaW9yaXR5KTtcclxuICAgICAgICB0aGlzLmFycmF5W2ldID0gdDtcclxuICAgICAgICB0LmluZGV4ID0gaTtcclxuICAgICAgICByZXR1cm4gdDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdCA9IG5ldyBUYXNrKGdlbkluc3QodGhpcy5hcnJheS5sZW5ndGgpLHByaW9yaXR5KTtcclxuICAgIHQuaW5kZXggPSB0aGlzLmFycmF5Lmxlbmd0aDtcclxuICAgIHRoaXMuYXJyYXlbdGhpcy5hcnJheS5sZW5ndGhdID0gdDtcclxuICAgIHRoaXMubmVlZFNvcnQgPSB0cnVlO1xyXG4gICAgcmV0dXJuIHQ7XHJcbiAgfVxyXG5cclxuICAvLyDphY3liJfjgpLlj5blvpfjgZnjgotcclxuICBnZXRBcnJheSgpIHtcclxuICAgIHJldHVybiB0aGlzLmFycmF5O1xyXG4gIH1cclxuICAvLyDjgr/jgrnjgq/jgpLjgq/jg6rjgqLjgZnjgotcclxuICBjbGVhcigpIHtcclxuICAgIHRoaXMuYXJyYXkubGVuZ3RoID0gMDtcclxuICB9XHJcbiAgLy8g44K944O844OI44GM5b+F6KaB44GL44OB44Kn44OD44Kv44GX44CB44K944O844OI44GZ44KLXHJcbiAgY2hlY2tTb3J0KCkge1xyXG4gICAgaWYgKHRoaXMubmVlZFNvcnQpIHtcclxuICAgICAgdGhpcy5hcnJheS5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XHJcbiAgICAgICAgaWYoYS5wcmlvcml0eSA+IGIucHJpb3JpdHkpIHJldHVybiAxO1xyXG4gICAgICAgIGlmIChhLnByaW9yaXR5IDwgYi5wcmlvcml0eSkgcmV0dXJuIC0xO1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgICB9KTtcclxuICAgICAgLy8g44Kk44Oz44OH44OD44Kv44K544Gu5oyv44KK55u044GXXHJcbiAgICAgIGZvciAodmFyIGkgPSAwLCBlID0gdGhpcy5hcnJheS5sZW5ndGg7IGkgPCBlOyArK2kpIHtcclxuICAgICAgICB0aGlzLmFycmF5W2ldLmluZGV4ID0gaTtcclxuICAgICAgfVxyXG4gICAgIHRoaXMubmVlZFNvcnQgPSBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJlbW92ZVRhc2soaW5kZXgpIHtcclxuICAgIGlmKGluZGV4IDwgMCl7XHJcbiAgICAgIGluZGV4ID0gLSgrK2luZGV4KTtcclxuICAgIH1cclxuICAgIGlmKHRoaXMuYXJyYXlbaW5kZXhdLnByaW9yaXR5ID09IDEwMDAwMCl7XHJcbiAgICAgIGRlYnVnZ2VyO1xyXG4gICAgfVxyXG4gICAgdGhpcy5hcnJheVtpbmRleF0gPSBudWxsVGFzaztcclxuICAgIHRoaXMubmVlZENvbXByZXNzID0gdHJ1ZTtcclxuICB9XHJcbiAgXHJcbiAgY29tcHJlc3MoKSB7XHJcbiAgICBpZiAoIXRoaXMubmVlZENvbXByZXNzKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHZhciBkZXN0ID0gW107XHJcbiAgICB2YXIgc3JjID0gdGhpcy5hcnJheTtcclxuICAgIHZhciBkZXN0SW5kZXggPSAwO1xyXG4gICAgZGVzdCA9IHNyYy5maWx0ZXIoKHYsaSk9PntcclxuICAgICAgbGV0IHJldCA9IHYgIT0gbnVsbFRhc2s7XHJcbiAgICAgIGlmKHJldCl7XHJcbiAgICAgICAgdi5pbmRleCA9IGRlc3RJbmRleCsrO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiByZXQ7XHJcbiAgICB9KTtcclxuICAgIHRoaXMuYXJyYXkgPSBkZXN0O1xyXG4gICAgdGhpcy5uZWVkQ29tcHJlc3MgPSBmYWxzZTtcclxuICB9XHJcbiAgXHJcbiAgcHJvY2VzcyhnYW1lKVxyXG4gIHtcclxuICAgIGlmKHRoaXMuZW5hYmxlKXtcclxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMucHJvY2Vzcy5iaW5kKHRoaXMsZ2FtZSkpO1xyXG4gICAgICB0aGlzLnN0b3BwZWQgPSBmYWxzZTtcclxuICAgICAgaWYgKCFzZmcucGF1c2UpIHtcclxuICAgICAgICBpZiAoIWdhbWUuaXNIaWRkZW4pIHtcclxuICAgICAgICAgIHRoaXMuY2hlY2tTb3J0KCk7XHJcbiAgICAgICAgICB0aGlzLmFycmF5LmZvckVhY2goICh0YXNrLGkpID0+e1xyXG4gICAgICAgICAgICBpZiAodGFzayAhPSBudWxsVGFzaykge1xyXG4gICAgICAgICAgICAgIGlmKHRhc2suaW5kZXggIT0gaSApe1xyXG4gICAgICAgICAgICAgICAgZGVidWdnZXI7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIHRhc2suZ2VuSW5zdC5uZXh0KHRhc2suaW5kZXgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHRoaXMuY29tcHJlc3MoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gICAgXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmVtaXQoJ3N0b3BwZWQnKTtcclxuICAgICAgdGhpcy5zdG9wcGVkID0gdHJ1ZTtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgc3RvcFByb2Nlc3MoKXtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSxyZWplY3QpPT57XHJcbiAgICAgIHRoaXMuZW5hYmxlID0gZmFsc2U7XHJcbiAgICAgIHRoaXMub24oJ3N0b3BwZWQnLCgpPT57XHJcbiAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOOCsuODvOODoOeUqOOCv+OCpOODnuODvFxyXG5leHBvcnQgY2xhc3MgR2FtZVRpbWVyIHtcclxuICBjb25zdHJ1Y3RvcihnZXRDdXJyZW50VGltZSkge1xyXG4gICAgdGhpcy5lbGFwc2VkVGltZSA9IDA7XHJcbiAgICB0aGlzLmN1cnJlbnRUaW1lID0gMDtcclxuICAgIHRoaXMucGF1c2VUaW1lID0gMDtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5TVE9QO1xyXG4gICAgdGhpcy5nZXRDdXJyZW50VGltZSA9IGdldEN1cnJlbnRUaW1lO1xyXG4gICAgdGhpcy5TVE9QID0gMTtcclxuICAgIHRoaXMuU1RBUlQgPSAyO1xyXG4gICAgdGhpcy5QQVVTRSA9IDM7XHJcblxyXG4gIH1cclxuICBcclxuICBzdGFydCgpIHtcclxuICAgIHRoaXMuZWxhcHNlZFRpbWUgPSAwO1xyXG4gICAgdGhpcy5kZWx0YVRpbWUgPSAwO1xyXG4gICAgdGhpcy5jdXJyZW50VGltZSA9IHRoaXMuZ2V0Q3VycmVudFRpbWUoKTtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5TVEFSVDtcclxuICB9XHJcblxyXG4gIHJlc3VtZSgpIHtcclxuICAgIHZhciBub3dUaW1lID0gdGhpcy5nZXRDdXJyZW50VGltZSgpO1xyXG4gICAgdGhpcy5jdXJyZW50VGltZSA9IHRoaXMuY3VycmVudFRpbWUgKyBub3dUaW1lIC0gdGhpcy5wYXVzZVRpbWU7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuU1RBUlQ7XHJcbiAgfVxyXG5cclxuICBwYXVzZSgpIHtcclxuICAgIHRoaXMucGF1c2VUaW1lID0gdGhpcy5nZXRDdXJyZW50VGltZSgpO1xyXG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLlBBVVNFO1xyXG4gIH1cclxuXHJcbiAgc3RvcCgpIHtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5TVE9QO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlKCkge1xyXG4gICAgaWYgKHRoaXMuc3RhdHVzICE9IHRoaXMuU1RBUlQpIHJldHVybjtcclxuICAgIHZhciBub3dUaW1lID0gdGhpcy5nZXRDdXJyZW50VGltZSgpO1xyXG4gICAgdGhpcy5kZWx0YVRpbWUgPSBub3dUaW1lIC0gdGhpcy5jdXJyZW50VGltZTtcclxuICAgIHRoaXMuZWxhcHNlZFRpbWUgPSB0aGlzLmVsYXBzZWRUaW1lICsgdGhpcy5kZWx0YVRpbWU7XHJcbiAgICB0aGlzLmN1cnJlbnRUaW1lID0gbm93VGltZTtcclxuICB9XHJcbn1cclxuXHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG4vLy8vIFdlYiBBdWRpbyBBUEkg44Op44OD44OR44O844Kv44Op44K5IC8vLy9cclxudmFyIGZmdCA9IG5ldyBGRlQoNDA5NiwgNDQxMDApO1xyXG52YXIgQlVGRkVSX1NJWkUgPSAxMDI0O1xyXG52YXIgVElNRV9CQVNFID0gOTY7XHJcblxyXG52YXIgbm90ZUZyZXEgPSBbXTtcclxuZm9yICh2YXIgaSA9IC04MTsgaSA8IDQ2OyArK2kpIHtcclxuICBub3RlRnJlcS5wdXNoKE1hdGgucG93KDIsIGkgLyAxMikpO1xyXG59XHJcblxyXG52YXIgU3F1YXJlV2F2ZSA9IHtcclxuICBiaXRzOiA0LFxyXG4gIHdhdmVkYXRhOiBbMHhmLCAweGYsIDB4ZiwgMHhmLCAweGYsIDB4ZiwgMHhmLCAweGYsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdXHJcbn07Ly8gNGJpdCB3YXZlIGZvcm1cclxuXHJcbnZhciBTYXdXYXZlID0ge1xyXG4gIGJpdHM6IDQsXHJcbiAgd2F2ZWRhdGE6IFsweDAsIDB4MSwgMHgyLCAweDMsIDB4NCwgMHg1LCAweDYsIDB4NywgMHg4LCAweDksIDB4YSwgMHhiLCAweGMsIDB4ZCwgMHhlLCAweGZdXHJcbn07Ly8gNGJpdCB3YXZlIGZvcm1cclxuXHJcbnZhciBUcmlXYXZlID0ge1xyXG4gIGJpdHM6IDQsXHJcbiAgd2F2ZWRhdGE6IFsweDAsIDB4MiwgMHg0LCAweDYsIDB4OCwgMHhBLCAweEMsIDB4RSwgMHhGLCAweEUsIDB4QywgMHhBLCAweDgsIDB4NiwgMHg0LCAweDJdXHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZGVjb2RlU3RyKGJpdHMsIHdhdmVzdHIpIHtcclxuICB2YXIgYXJyID0gW107XHJcbiAgdmFyIG4gPSBiaXRzIC8gNCB8IDA7XHJcbiAgdmFyIGMgPSAwO1xyXG4gIHZhciB6ZXJvcG9zID0gMSA8PCAoYml0cyAtIDEpO1xyXG4gIHdoaWxlIChjIDwgd2F2ZXN0ci5sZW5ndGgpIHtcclxuICAgIHZhciBkID0gMDtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgKytpKSB7XHJcbiAgICAgIGV2YWwoXCJkID0gKGQgPDwgNCkgKyAweFwiICsgd2F2ZXN0ci5jaGFyQXQoYysrKSArIFwiO1wiKTtcclxuICAgIH1cclxuICAgIGFyci5wdXNoKChkIC0gemVyb3BvcykgLyB6ZXJvcG9zKTtcclxuICB9XHJcbiAgcmV0dXJuIGFycjtcclxufVxyXG5cclxudmFyIHdhdmVzID0gW1xyXG4gICAgZGVjb2RlU3RyKDQsICdFRUVFRUVFRUVFRUVFRUVFMDAwMDAwMDAwMDAwMDAwMCcpLFxyXG4gICAgZGVjb2RlU3RyKDQsICcwMDExMjIzMzQ0NTU2Njc3ODg5OUFBQkJDQ0RERUVGRicpLFxyXG4gICAgZGVjb2RlU3RyKDQsICcwMjM0NjY0NTlBQThBN0E5Nzc5NjU2NTZBQ0FBQ0RFRicpLFxyXG4gICAgZGVjb2RlU3RyKDQsICdCRENEQ0E5OTlBQ0RDREI5NDIxMjM2Nzc3NjMyMTI0NycpLFxyXG4gICAgZGVjb2RlU3RyKDQsICc3QUNERURDQTc0MjEwMTI0N0JERURCNzMyMDEzN0U3OCcpLFxyXG4gICAgZGVjb2RlU3RyKDQsICdBQ0NBNzc5QkRFREE2NjY3OTk5NDEwMTI2Nzc0MjI0NycpLFxyXG4gICAgZGVjb2RlU3RyKDQsICc3RUM5Q0VBN0NGRDhBQjcyOEQ5NDU3MjAzODUxMzUzMScpLFxyXG4gICAgZGVjb2RlU3RyKDQsICdFRTc3RUU3N0VFNzdFRTc3MDA3NzAwNzcwMDc3MDA3NycpLFxyXG4gICAgZGVjb2RlU3RyKDQsICdFRUVFODg4ODg4ODg4ODg4MDAwMDg4ODg4ODg4ODg4OCcpLy/jg47jgqTjgrrnlKjjga7jg4Djg5/jg7zms6LlvaJcclxuXTtcclxuXHJcbnZhciB3YXZlU2FtcGxlcyA9IFtdO1xyXG5leHBvcnQgZnVuY3Rpb24gV2F2ZVNhbXBsZShhdWRpb2N0eCwgY2gsIHNhbXBsZUxlbmd0aCwgc2FtcGxlUmF0ZSkge1xyXG5cclxuICB0aGlzLnNhbXBsZSA9IGF1ZGlvY3R4LmNyZWF0ZUJ1ZmZlcihjaCwgc2FtcGxlTGVuZ3RoLCBzYW1wbGVSYXRlIHx8IGF1ZGlvY3R4LnNhbXBsZVJhdGUpO1xyXG4gIHRoaXMubG9vcCA9IGZhbHNlO1xyXG4gIHRoaXMuc3RhcnQgPSAwO1xyXG4gIHRoaXMuZW5kID0gKHNhbXBsZUxlbmd0aCAtIDEpIC8gKHNhbXBsZVJhdGUgfHwgYXVkaW9jdHguc2FtcGxlUmF0ZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVXYXZlU2FtcGxlRnJvbVdhdmVzKGF1ZGlvY3R4LCBzYW1wbGVMZW5ndGgpIHtcclxuICBmb3IgKHZhciBpID0gMCwgZW5kID0gd2F2ZXMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgIHZhciBzYW1wbGUgPSBuZXcgV2F2ZVNhbXBsZShhdWRpb2N0eCwgMSwgc2FtcGxlTGVuZ3RoKTtcclxuICAgIHdhdmVTYW1wbGVzLnB1c2goc2FtcGxlKTtcclxuICAgIGlmIChpICE9IDgpIHtcclxuICAgICAgdmFyIHdhdmVkYXRhID0gd2F2ZXNbaV07XHJcbiAgICAgIHZhciBkZWx0YSA9IDQ0MC4wICogd2F2ZWRhdGEubGVuZ3RoIC8gYXVkaW9jdHguc2FtcGxlUmF0ZTtcclxuICAgICAgdmFyIHN0aW1lID0gMDtcclxuICAgICAgdmFyIG91dHB1dCA9IHNhbXBsZS5zYW1wbGUuZ2V0Q2hhbm5lbERhdGEoMCk7XHJcbiAgICAgIHZhciBsZW4gPSB3YXZlZGF0YS5sZW5ndGg7XHJcbiAgICAgIHZhciBpbmRleCA9IDA7XHJcbiAgICAgIHZhciBlbmRzYW1wbGUgPSAwO1xyXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHNhbXBsZUxlbmd0aDsgKytqKSB7XHJcbiAgICAgICAgaW5kZXggPSBzdGltZSB8IDA7XHJcbiAgICAgICAgb3V0cHV0W2pdID0gd2F2ZWRhdGFbaW5kZXhdO1xyXG4gICAgICAgIHN0aW1lICs9IGRlbHRhO1xyXG4gICAgICAgIGlmIChzdGltZSA+PSBsZW4pIHtcclxuICAgICAgICAgIHN0aW1lID0gc3RpbWUgLSBsZW47XHJcbiAgICAgICAgICBlbmRzYW1wbGUgPSBqO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBzYW1wbGUuZW5kID0gZW5kc2FtcGxlIC8gYXVkaW9jdHguc2FtcGxlUmF0ZTtcclxuICAgICAgc2FtcGxlLmxvb3AgPSB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8g44Oc44Kk44K5OOOBr+ODjuOCpOOCuuazouW9ouOBqOOBmeOCi1xyXG4gICAgICB2YXIgb3V0cHV0ID0gc2FtcGxlLnNhbXBsZS5nZXRDaGFubmVsRGF0YSgwKTtcclxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBzYW1wbGVMZW5ndGg7ICsraikge1xyXG4gICAgICAgIG91dHB1dFtqXSA9IE1hdGgucmFuZG9tKCkgKiAyLjAgLSAxLjA7XHJcbiAgICAgIH1cclxuICAgICAgc2FtcGxlLmVuZCA9IHNhbXBsZUxlbmd0aCAvIGF1ZGlvY3R4LnNhbXBsZVJhdGU7XHJcbiAgICAgIHNhbXBsZS5sb29wID0gdHJ1ZTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBXYXZlVGV4dHVyZSh3YXZlKSB7XHJcbiAgdGhpcy53YXZlID0gd2F2ZSB8fCB3YXZlc1swXTtcclxuICB0aGlzLnRleCA9IG5ldyBDYW52YXNUZXh0dXJlKDMyMCwgMTAgKiAxNik7XHJcbiAgdGhpcy5yZW5kZXIoKTtcclxufVxyXG5cclxuV2F2ZVRleHR1cmUucHJvdG90eXBlID0ge1xyXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGN0eCA9IHRoaXMudGV4LmN0eDtcclxuICAgIHZhciB3YXZlID0gdGhpcy53YXZlO1xyXG4gICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjdHguY2FudmFzLndpZHRoLCBjdHguY2FudmFzLmhlaWdodCk7XHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnd2hpdGUnO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzMjA7IGkgKz0gMTApIHtcclxuICAgICAgY3R4Lm1vdmVUbyhpLCAwKTtcclxuICAgICAgY3R4LmxpbmVUbyhpLCAyNTUpO1xyXG4gICAgfVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxNjA7IGkgKz0gMTApIHtcclxuICAgICAgY3R4Lm1vdmVUbygwLCBpKTtcclxuICAgICAgY3R4LmxpbmVUbygzMjAsIGkpO1xyXG4gICAgfVxyXG4gICAgY3R4LmZpbGxTdHlsZSA9ICdyZ2JhKDI1NSwyNTUsMjU1LDAuNyknO1xyXG4gICAgY3R4LnJlY3QoMCwgMCwgY3R4LmNhbnZhcy53aWR0aCwgY3R4LmNhbnZhcy5oZWlnaHQpO1xyXG4gICAgY3R4LnN0cm9rZSgpO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGMgPSAwOyBpIDwgY3R4LmNhbnZhcy53aWR0aDsgaSArPSAxMCwgKytjKSB7XHJcbiAgICAgIGN0eC5maWxsUmVjdChpLCAod2F2ZVtjXSA+IDApID8gODAgLSB3YXZlW2NdICogODAgOiA4MCwgMTAsIE1hdGguYWJzKHdhdmVbY10pICogODApO1xyXG4gICAgfVxyXG4gICAgdGhpcy50ZXgudGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgfVxyXG59O1xyXG5cclxuLy8vIOOCqOODs+ODmeODreODvOODl+OCuOOCp+ODjeODrOODvOOCv+ODvFxyXG5leHBvcnQgZnVuY3Rpb24gRW52ZWxvcGVHZW5lcmF0b3Iodm9pY2UsIGF0dGFjaywgZGVjYXksIHN1c3RhaW4sIHJlbGVhc2UpIHtcclxuICB0aGlzLnZvaWNlID0gdm9pY2U7XHJcbiAgLy90aGlzLmtleW9uID0gZmFsc2U7XHJcbiAgdGhpcy5hdHRhY2sgPSBhdHRhY2sgfHwgMC4wMDA1O1xyXG4gIHRoaXMuZGVjYXkgPSBkZWNheSB8fCAwLjA1O1xyXG4gIHRoaXMuc3VzdGFpbiA9IHN1c3RhaW4gfHwgMC41O1xyXG4gIHRoaXMucmVsZWFzZSA9IHJlbGVhc2UgfHwgMC41O1xyXG4gIHRoaXMudiA9IDEuMDtcclxuXHJcbn07XHJcblxyXG5FbnZlbG9wZUdlbmVyYXRvci5wcm90b3R5cGUgPVxyXG57XHJcbiAga2V5b246IGZ1bmN0aW9uICh0LHZlbCkge1xyXG4gICAgdGhpcy52ID0gdmVsIHx8IDEuMDtcclxuICAgIHZhciB2ID0gdGhpcy52O1xyXG4gICAgdmFyIHQwID0gdCB8fCB0aGlzLnZvaWNlLmF1ZGlvY3R4LmN1cnJlbnRUaW1lO1xyXG4gICAgdmFyIHQxID0gdDAgKyB0aGlzLmF0dGFjayAqIHY7XHJcbiAgICB2YXIgZ2FpbiA9IHRoaXMudm9pY2UuZ2Fpbi5nYWluO1xyXG4gICAgZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXModDApO1xyXG4gICAgZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLCB0MCk7XHJcbiAgICBnYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHYsIHQxKTtcclxuICAgIGdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUodGhpcy5zdXN0YWluICogdiwgdDAgKyB0aGlzLmRlY2F5IC8gdik7XHJcbiAgICAvL2dhaW4uc2V0VGFyZ2V0QXRUaW1lKHRoaXMuc3VzdGFpbiAqIHYsIHQxLCB0MSArIHRoaXMuZGVjYXkgLyB2KTtcclxuICB9LFxyXG4gIGtleW9mZjogZnVuY3Rpb24gKHQpIHtcclxuICAgIHZhciB2b2ljZSA9IHRoaXMudm9pY2U7XHJcbiAgICB2YXIgZ2FpbiA9IHZvaWNlLmdhaW4uZ2FpbjtcclxuICAgIHZhciB0MCA9IHQgfHwgdm9pY2UuYXVkaW9jdHguY3VycmVudFRpbWU7XHJcbiAgICBnYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyh0MCk7XHJcbiAgICAvL2dhaW4uc2V0VmFsdWVBdFRpbWUoMCwgdDAgKyB0aGlzLnJlbGVhc2UgLyB0aGlzLnYpO1xyXG4gICAgLy9nYWluLnNldFRhcmdldEF0VGltZSgwLCB0MCwgdDAgKyB0aGlzLnJlbGVhc2UgLyB0aGlzLnYpO1xyXG4gICAgZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCB0MCArIHRoaXMucmVsZWFzZSAvIHRoaXMudik7XHJcbiAgfVxyXG59O1xyXG5cclxuLy8vIOODnOOCpOOCuVxyXG5leHBvcnQgZnVuY3Rpb24gVm9pY2UoYXVkaW9jdHgpIHtcclxuICB0aGlzLmF1ZGlvY3R4ID0gYXVkaW9jdHg7XHJcbiAgdGhpcy5zYW1wbGUgPSB3YXZlU2FtcGxlc1s2XTtcclxuICB0aGlzLmdhaW4gPSBhdWRpb2N0eC5jcmVhdGVHYWluKCk7XHJcbiAgdGhpcy5nYWluLmdhaW4udmFsdWUgPSAwLjA7XHJcbiAgdGhpcy52b2x1bWUgPSBhdWRpb2N0eC5jcmVhdGVHYWluKCk7XHJcbiAgdGhpcy5lbnZlbG9wZSA9IG5ldyBFbnZlbG9wZUdlbmVyYXRvcih0aGlzKTtcclxuICB0aGlzLmluaXRQcm9jZXNzb3IoKTtcclxuICB0aGlzLmRldHVuZSA9IDEuMDtcclxuICB0aGlzLnZvbHVtZS5nYWluLnZhbHVlID0gMS4wO1xyXG4gIHRoaXMuZ2Fpbi5jb25uZWN0KHRoaXMudm9sdW1lKTtcclxuICB0aGlzLm91dHB1dCA9IHRoaXMudm9sdW1lO1xyXG59O1xyXG5cclxuVm9pY2UucHJvdG90eXBlID0ge1xyXG4gIGluaXRQcm9jZXNzb3I6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMucHJvY2Vzc29yID0gdGhpcy5hdWRpb2N0eC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcclxuICAgIHRoaXMucHJvY2Vzc29yLmJ1ZmZlciA9IHRoaXMuc2FtcGxlLnNhbXBsZTtcclxuICAgIHRoaXMucHJvY2Vzc29yLmxvb3AgPSB0aGlzLnNhbXBsZS5sb29wO1xyXG4gICAgdGhpcy5wcm9jZXNzb3IubG9vcFN0YXJ0ID0gMDtcclxuICAgIHRoaXMucHJvY2Vzc29yLnBsYXliYWNrUmF0ZS52YWx1ZSA9IDEuMDtcclxuICAgIHRoaXMucHJvY2Vzc29yLmxvb3BFbmQgPSB0aGlzLnNhbXBsZS5lbmQ7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5jb25uZWN0KHRoaXMuZ2Fpbik7XHJcbiAgfSxcclxuXHJcbiAgc2V0U2FtcGxlOiBmdW5jdGlvbiAoc2FtcGxlKSB7XHJcbiAgICAgIHRoaXMuZW52ZWxvcGUua2V5b2ZmKDApO1xyXG4gICAgICB0aGlzLnByb2Nlc3Nvci5kaXNjb25uZWN0KHRoaXMuZ2Fpbik7XHJcbiAgICAgIHRoaXMuc2FtcGxlID0gc2FtcGxlO1xyXG4gICAgICB0aGlzLmluaXRQcm9jZXNzb3IoKTtcclxuICAgICAgdGhpcy5wcm9jZXNzb3Iuc3RhcnQoKTtcclxuICB9LFxyXG4gIHN0YXJ0OiBmdW5jdGlvbiAoc3RhcnRUaW1lKSB7XHJcbiAvLyAgIGlmICh0aGlzLnByb2Nlc3Nvci5wbGF5YmFja1N0YXRlID09IDMpIHtcclxuICAgICAgdGhpcy5wcm9jZXNzb3IuZGlzY29ubmVjdCh0aGlzLmdhaW4pO1xyXG4gICAgICB0aGlzLmluaXRQcm9jZXNzb3IoKTtcclxuLy8gICAgfSBlbHNlIHtcclxuLy8gICAgICB0aGlzLmVudmVsb3BlLmtleW9mZigpO1xyXG4vL1xyXG4vLyAgICB9XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5zdGFydChzdGFydFRpbWUpO1xyXG4gIH0sXHJcbiAgc3RvcDogZnVuY3Rpb24gKHRpbWUpIHtcclxuICAgIHRoaXMucHJvY2Vzc29yLnN0b3AodGltZSk7XHJcbiAgICB0aGlzLnJlc2V0KCk7XHJcbiAgfSxcclxuICBrZXlvbjpmdW5jdGlvbih0LG5vdGUsdmVsKVxyXG4gIHtcclxuICAgIHRoaXMucHJvY2Vzc29yLnBsYXliYWNrUmF0ZS5zZXRWYWx1ZUF0VGltZShub3RlRnJlcVtub3RlXSAqIHRoaXMuZGV0dW5lLCB0KTtcclxuICAgIHRoaXMuZW52ZWxvcGUua2V5b24odCx2ZWwpO1xyXG4gIH0sXHJcbiAga2V5b2ZmOmZ1bmN0aW9uKHQpXHJcbiAge1xyXG4gICAgdGhpcy5lbnZlbG9wZS5rZXlvZmYodCk7XHJcbiAgfSxcclxuICByZXNldDpmdW5jdGlvbigpXHJcbiAge1xyXG4gICAgdGhpcy5wcm9jZXNzb3IucGxheWJhY2tSYXRlLmNhbmNlbFNjaGVkdWxlZFZhbHVlcygwKTtcclxuICAgIHRoaXMuZ2Fpbi5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcygwKTtcclxuICAgIHRoaXMuZ2Fpbi5nYWluLnZhbHVlID0gMDtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBBdWRpbygpIHtcclxuICB0aGlzLmVuYWJsZSA9IGZhbHNlO1xyXG4gIHRoaXMuYXVkaW9Db250ZXh0ID0gd2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0IHx8IHdpbmRvdy5tb3pBdWRpb0NvbnRleHQ7XHJcblxyXG4gIGlmICh0aGlzLmF1ZGlvQ29udGV4dCkge1xyXG4gICAgdGhpcy5hdWRpb2N0eCA9IG5ldyB0aGlzLmF1ZGlvQ29udGV4dCgpO1xyXG4gICAgdGhpcy5lbmFibGUgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgdGhpcy52b2ljZXMgPSBbXTtcclxuICBpZiAodGhpcy5lbmFibGUpIHtcclxuICAgIGNyZWF0ZVdhdmVTYW1wbGVGcm9tV2F2ZXModGhpcy5hdWRpb2N0eCwgQlVGRkVSX1NJWkUpO1xyXG4gICAgdGhpcy5maWx0ZXIgPSB0aGlzLmF1ZGlvY3R4LmNyZWF0ZUJpcXVhZEZpbHRlcigpO1xyXG4gICAgdGhpcy5maWx0ZXIudHlwZSA9ICdsb3dwYXNzJztcclxuICAgIHRoaXMuZmlsdGVyLmZyZXF1ZW5jeS52YWx1ZSA9IDIwMDAwO1xyXG4gICAgdGhpcy5maWx0ZXIuUS52YWx1ZSA9IDAuMDAwMTtcclxuICAgIHRoaXMubm9pc2VGaWx0ZXIgPSB0aGlzLmF1ZGlvY3R4LmNyZWF0ZUJpcXVhZEZpbHRlcigpO1xyXG4gICAgdGhpcy5ub2lzZUZpbHRlci50eXBlID0gJ2xvd3Bhc3MnO1xyXG4gICAgdGhpcy5ub2lzZUZpbHRlci5mcmVxdWVuY3kudmFsdWUgPSAxMDAwO1xyXG4gICAgdGhpcy5ub2lzZUZpbHRlci5RLnZhbHVlID0gMS44O1xyXG4gICAgdGhpcy5jb21wID0gdGhpcy5hdWRpb2N0eC5jcmVhdGVEeW5hbWljc0NvbXByZXNzb3IoKTtcclxuICAgIHRoaXMuZmlsdGVyLmNvbm5lY3QodGhpcy5jb21wKTtcclxuICAgIHRoaXMubm9pc2VGaWx0ZXIuY29ubmVjdCh0aGlzLmNvbXApO1xyXG4gICAgdGhpcy5jb21wLmNvbm5lY3QodGhpcy5hdWRpb2N0eC5kZXN0aW5hdGlvbik7XHJcbiAgICBmb3IgKHZhciBpID0gMCxlbmQgPSB0aGlzLlZPSUNFUzsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIHZhciB2ID0gbmV3IFZvaWNlKHRoaXMuYXVkaW9jdHgpO1xyXG4gICAgICB0aGlzLnZvaWNlcy5wdXNoKHYpO1xyXG4gICAgICBpZihpID09ICh0aGlzLlZPSUNFUyAtIDEpKXtcclxuICAgICAgICB2Lm91dHB1dC5jb25uZWN0KHRoaXMubm9pc2VGaWx0ZXIpO1xyXG4gICAgICB9IGVsc2V7XHJcbiAgICAgICAgdi5vdXRwdXQuY29ubmVjdCh0aGlzLmZpbHRlcik7XHJcbiAgICAgIH1cclxuICAgIH1cclxuLy8gIHRoaXMuc3RhcnRlZCA9IGZhbHNlO1xyXG5cclxuICAgIC8vdGhpcy52b2ljZXNbMF0ub3V0cHV0LmNvbm5lY3QoKTtcclxuICB9XHJcblxyXG59XHJcblxyXG5BdWRpby5wcm90b3R5cGUgPSB7XHJcbiAgc3RhcnQ6IGZ1bmN0aW9uICgpXHJcbiAge1xyXG4gIC8vICBpZiAodGhpcy5zdGFydGVkKSByZXR1cm47XHJcblxyXG4gICAgdmFyIHZvaWNlcyA9IHRoaXMudm9pY2VzO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHZvaWNlcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSlcclxuICAgIHtcclxuICAgICAgdm9pY2VzW2ldLnN0YXJ0KDApO1xyXG4gICAgfVxyXG4gICAgLy90aGlzLnN0YXJ0ZWQgPSB0cnVlO1xyXG4gIH0sXHJcbiAgc3RvcDogZnVuY3Rpb24gKClcclxuICB7XHJcbiAgICAvL2lmKHRoaXMuc3RhcnRlZClcclxuICAgIC8ve1xyXG4gICAgICB2YXIgdm9pY2VzID0gdGhpcy52b2ljZXM7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB2b2ljZXMubGVuZ3RoOyBpIDwgZW5kOyArK2kpXHJcbiAgICAgIHtcclxuICAgICAgICB2b2ljZXNbaV0uc3RvcCgwKTtcclxuICAgICAgfVxyXG4gICAgLy8gIHRoaXMuc3RhcnRlZCA9IGZhbHNlO1xyXG4gICAgLy99XHJcbiAgfSxcclxuICBWT0lDRVM6IDEyXHJcbn1cclxuXHJcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4vKiDjgrfjg7zjgrHjg7PjgrXjg7zjgrPjg57jg7Pjg4kgICAgICAgICAgICAgICAgICAgICAgICovXHJcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIE5vdGUobm8sIG5hbWUpIHtcclxuICB0aGlzLm5vID0gbm87XHJcbiAgdGhpcy5uYW1lID0gbmFtZTtcclxufVxyXG5cclxuTm90ZS5wcm90b3R5cGUgPSB7XHJcbiAgcHJvY2VzczogZnVuY3Rpb24odHJhY2spIFxyXG4gIHtcclxuICAgIHZhciBiYWNrID0gdHJhY2suYmFjaztcclxuICAgIHZhciBub3RlID0gdGhpcztcclxuICAgIHZhciBvY3QgPSB0aGlzLm9jdCB8fCBiYWNrLm9jdDtcclxuICAgIHZhciBzdGVwID0gdGhpcy5zdGVwIHx8IGJhY2suc3RlcDtcclxuICAgIHZhciBnYXRlID0gdGhpcy5nYXRlIHx8IGJhY2suZ2F0ZTtcclxuICAgIHZhciB2ZWwgPSB0aGlzLnZlbCB8fCBiYWNrLnZlbDtcclxuICAgIHNldFF1ZXVlKHRyYWNrLCBub3RlLCBvY3Qsc3RlcCwgZ2F0ZSwgdmVsKTtcclxuXHJcbiAgfVxyXG59XHJcblxyXG52YXIgXHJcbiAgQyAgPSBuZXcgTm90ZSggMCwnQyAnKSxcclxuICBEYiA9IG5ldyBOb3RlKCAxLCdEYicpLFxyXG4gIEQgID0gbmV3IE5vdGUoIDIsJ0QgJyksXHJcbiAgRWIgPSBuZXcgTm90ZSggMywnRWInKSxcclxuICBFICA9IG5ldyBOb3RlKCA0LCdFICcpLFxyXG4gIEYgID0gbmV3IE5vdGUoIDUsJ0YgJyksXHJcbiAgR2IgPSBuZXcgTm90ZSggNiwnR2InKSxcclxuICBHICA9IG5ldyBOb3RlKCA3LCdHICcpLFxyXG4gIEFiID0gbmV3IE5vdGUoIDgsJ0FiJyksXHJcbiAgQSAgPSBuZXcgTm90ZSggOSwnQSAnKSxcclxuICBCYiA9IG5ldyBOb3RlKDEwLCdCYicpLFxyXG4gIEIgPSBuZXcgTm90ZSgxMSwgJ0IgJyk7XHJcblxyXG4gLy8gUiA9IG5ldyBSZXN0KCk7XHJcblxyXG5mdW5jdGlvbiBTZXFEYXRhKG5vdGUsIG9jdCwgc3RlcCwgZ2F0ZSwgdmVsKVxyXG57XHJcbiAgdGhpcy5ub3RlID0gbm90ZTtcclxuICB0aGlzLm9jdCA9IG9jdDtcclxuICAvL3RoaXMubm8gPSBub3RlLm5vICsgb2N0ICogMTI7XHJcbiAgdGhpcy5zdGVwID0gc3RlcDtcclxuICB0aGlzLmdhdGUgPSBnYXRlO1xyXG4gIHRoaXMudmVsID0gdmVsO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZXRRdWV1ZSh0cmFjayxub3RlLG9jdCxzdGVwLGdhdGUsdmVsKVxyXG57XHJcbiAgdmFyIG5vID0gbm90ZS5ubyArIG9jdCAqIDEyO1xyXG4gIHZhciBzdGVwX3RpbWUgPSB0cmFjay5wbGF5aW5nVGltZTtcclxuICB2YXIgZ2F0ZV90aW1lID0gKChnYXRlID49IDApID8gZ2F0ZSAqIDYwIDogc3RlcCAqIGdhdGUgKiA2MCAqIC0xLjApIC8gKFRJTUVfQkFTRSAqIHRyYWNrLmxvY2FsVGVtcG8pICsgdHJhY2sucGxheWluZ1RpbWU7XHJcbiAgdmFyIHZvaWNlID0gdHJhY2suYXVkaW8udm9pY2VzW3RyYWNrLmNoYW5uZWxdO1xyXG4gIC8vY29uc29sZS5sb2codHJhY2suc2VxdWVuY2VyLnRlbXBvKTtcclxuICB2b2ljZS5rZXlvbihzdGVwX3RpbWUsIG5vLCB2ZWwpO1xyXG4gIHZvaWNlLmtleW9mZihnYXRlX3RpbWUpO1xyXG4gIHRyYWNrLnBsYXlpbmdUaW1lID0gKHN0ZXAgKiA2MCkgLyAoVElNRV9CQVNFICogdHJhY2subG9jYWxUZW1wbykgKyB0cmFjay5wbGF5aW5nVGltZTtcclxuICB2YXIgYmFjayA9IHRyYWNrLmJhY2s7XHJcbiAgYmFjay5ub3RlID0gbm90ZTtcclxuICBiYWNrLm9jdCA9IG9jdDtcclxuICBiYWNrLnN0ZXAgPSBzdGVwO1xyXG4gIGJhY2suZ2F0ZSA9IGdhdGU7XHJcbiAgYmFjay52ZWwgPSB2ZWw7XHJcbn1cclxuXHJcblNlcURhdGEucHJvdG90eXBlID0ge1xyXG4gIHByb2Nlc3M6IGZ1bmN0aW9uICh0cmFjaykge1xyXG5cclxuICAgIHZhciBiYWNrID0gdHJhY2suYmFjaztcclxuICAgIHZhciBub3RlID0gdGhpcy5ub3RlIHx8IGJhY2subm90ZTtcclxuICAgIHZhciBvY3QgPSB0aGlzLm9jdCB8fCBiYWNrLm9jdDtcclxuICAgIHZhciBzdGVwID0gdGhpcy5zdGVwIHx8IGJhY2suc3RlcDtcclxuICAgIHZhciBnYXRlID0gdGhpcy5nYXRlIHx8IGJhY2suZ2F0ZTtcclxuICAgIHZhciB2ZWwgPSB0aGlzLnZlbCB8fCBiYWNrLnZlbDtcclxuICAgIHNldFF1ZXVlKHRyYWNrLG5vdGUsb2N0LHN0ZXAsZ2F0ZSx2ZWwpO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gUyhub3RlLCBvY3QsIHN0ZXAsIGdhdGUsIHZlbCkge1xyXG4gIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcclxuICBpZiAoUy5sZW5ndGggIT0gYXJncy5sZW5ndGgpXHJcbiAge1xyXG4gICAgaWYodHlwZW9mKGFyZ3NbYXJncy5sZW5ndGggLSAxXSkgPT0gJ29iamVjdCcgJiYgICEoYXJnc1thcmdzLmxlbmd0aCAtIDFdIGluc3RhbmNlb2YgTm90ZSkpXHJcbiAgICB7XHJcbiAgICAgIHZhciBhcmdzMSA9IGFyZ3NbYXJncy5sZW5ndGggLSAxXTtcclxuICAgICAgdmFyIGwgPSBhcmdzLmxlbmd0aCAtIDE7XHJcbiAgICAgIHJldHVybiBuZXcgU2VxRGF0YShcclxuICAgICAgKChsICE9IDApP25vdGU6ZmFsc2UpIHx8IGFyZ3MxLm5vdGUgfHwgYXJnczEubiB8fCBudWxsLFxyXG4gICAgICAoKGwgIT0gMSkgPyBvY3QgOiBmYWxzZSkgfHwgYXJnczEub2N0IHx8IGFyZ3MxLm8gfHwgbnVsbCxcclxuICAgICAgKChsICE9IDIpID8gc3RlcCA6IGZhbHNlKSB8fCBhcmdzMS5zdGVwIHx8IGFyZ3MxLnMgfHwgbnVsbCxcclxuICAgICAgKChsICE9IDMpID8gZ2F0ZSA6IGZhbHNlKSB8fCBhcmdzMS5nYXRlIHx8IGFyZ3MxLmcgfHwgbnVsbCxcclxuICAgICAgKChsICE9IDQpID8gdmVsIDogZmFsc2UpIHx8IGFyZ3MxLnZlbCB8fCBhcmdzMS52IHx8IG51bGxcclxuICAgICAgKTtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIG5ldyBTZXFEYXRhKG5vdGUgfHwgbnVsbCwgb2N0IHx8IG51bGwsIHN0ZXAgfHwgbnVsbCwgZ2F0ZSB8fCBudWxsLCB2ZWwgfHwgbnVsbCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFMxKG5vdGUsIG9jdCwgc3RlcCwgZ2F0ZSwgdmVsKSB7XHJcbiAgcmV0dXJuIFMobm90ZSwgb2N0LCBsKHN0ZXApLCBnYXRlLCB2ZWwpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBTMihub3RlLCBsZW4sIGRvdCAsIG9jdCwgZ2F0ZSwgdmVsKSB7XHJcbiAgcmV0dXJuIFMobm90ZSwgb2N0LCBsKGxlbixkb3QpLCBnYXRlLCB2ZWwpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBTMyhub3RlLCBzdGVwLCBnYXRlLCB2ZWwsIG9jdCkge1xyXG4gIHJldHVybiBTKG5vdGUsIG9jdCwgc3RlcCwgZ2F0ZSwgdmVsKTtcclxufVxyXG5cclxuXHJcbi8vLyDpn7PnrKbjga7plbfjgZXmjIflrppcclxuXHJcbmZ1bmN0aW9uIGwobGVuLGRvdClcclxue1xyXG4gIHZhciBkID0gZmFsc2U7XHJcbiAgaWYgKGRvdCkgZCA9IGRvdDtcclxuICByZXR1cm4gKFRJTUVfQkFTRSAqICg0ICsgKGQ/MjowKSkpIC8gbGVuO1xyXG59XHJcblxyXG5mdW5jdGlvbiBTdGVwKHN0ZXApIHtcclxuICB0aGlzLnN0ZXAgPSBzdGVwO1xyXG59XHJcblxyXG5TdGVwLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKHRyYWNrKVxyXG57XHJcbiAgdHJhY2suYmFjay5zdGVwID0gdGhpcy5zdGVwO1xyXG59XHJcblxyXG5mdW5jdGlvbiBTVChzdGVwKVxyXG57XHJcbiAgcmV0dXJuIG5ldyBTdGVwKHN0ZXApO1xyXG59XHJcblxyXG5mdW5jdGlvbiBMKGxlbiwgZG90KSB7XHJcbiAgcmV0dXJuIG5ldyBTdGVwKGwobGVuLCBkb3QpKTtcclxufVxyXG5cclxuLy8vIOOCsuODvOODiOOCv+OCpOODoOaMh+WumlxyXG5cclxuZnVuY3Rpb24gR2F0ZVRpbWUoZ2F0ZSkge1xyXG4gIHRoaXMuZ2F0ZSA9IGdhdGU7XHJcbn1cclxuXHJcbkdhdGVUaW1lLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKHRyYWNrKSB7XHJcbiAgdHJhY2suYmFjay5nYXRlID0gdGhpcy5nYXRlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBHVChnYXRlKSB7XHJcbiAgcmV0dXJuIG5ldyBHYXRlVGltZShnYXRlKTtcclxufVxyXG5cclxuLy8vIOODmeODreOCt+ODhuOCo+aMh+WumlxyXG5cclxuZnVuY3Rpb24gVmVsb2NpdHkodmVsKSB7XHJcbiAgdGhpcy52ZWwgPSB2ZWw7XHJcbn1cclxuXHJcblZlbG9jaXR5LnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKHRyYWNrKSB7XHJcbiAgdHJhY2suYmFjay52ZWwgPSB0aGlzLnZlbDtcclxufVxyXG5cclxuZnVuY3Rpb24gVih2ZWwpIHtcclxuICByZXR1cm4gbmV3IFZlbG9jaXR5KHZlbCk7XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBKdW1wKHBvcykgeyB0aGlzLnBvcyA9IHBvczt9O1xyXG5KdW1wLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKHRyYWNrKVxyXG57XHJcbiAgdHJhY2suc2VxUG9zID0gdGhpcy5wb3M7XHJcbn1cclxuXHJcbi8vLyDpn7PoibLoqK3lrppcclxuZnVuY3Rpb24gVG9uZShubylcclxue1xyXG4gIHRoaXMubm8gPSBubztcclxuICAvL3RoaXMuc2FtcGxlID0gd2F2ZVNhbXBsZXNbdGhpcy5ub107XHJcbn1cclxuXHJcblRvbmUucHJvdG90eXBlID1cclxue1xyXG4gIHByb2Nlc3M6IGZ1bmN0aW9uICh0cmFjaylcclxuICB7XHJcbiAgICB0cmFjay5hdWRpby52b2ljZXNbdHJhY2suY2hhbm5lbF0uc2V0U2FtcGxlKHdhdmVTYW1wbGVzW3RoaXMubm9dKTtcclxuICB9XHJcbn1cclxuZnVuY3Rpb24gVE9ORShubylcclxue1xyXG4gIHJldHVybiBuZXcgVG9uZShubyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIEpVTVAocG9zKSB7XHJcbiAgcmV0dXJuIG5ldyBKdW1wKHBvcyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFJlc3Qoc3RlcClcclxue1xyXG4gIHRoaXMuc3RlcCA9IHN0ZXA7XHJcbn1cclxuXHJcblJlc3QucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbih0cmFjaylcclxue1xyXG4gIHZhciBzdGVwID0gdGhpcy5zdGVwIHx8IHRyYWNrLmJhY2suc3RlcDtcclxuICB0cmFjay5wbGF5aW5nVGltZSA9IHRyYWNrLnBsYXlpbmdUaW1lICsgKHRoaXMuc3RlcCAqIDYwKSAvIChUSU1FX0JBU0UgKiB0cmFjay5sb2NhbFRlbXBvKTtcclxuICB0cmFjay5iYWNrLnN0ZXAgPSB0aGlzLnN0ZXA7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFIxKHN0ZXApIHtcclxuICByZXR1cm4gbmV3IFJlc3Qoc3RlcCk7XHJcbn1cclxuZnVuY3Rpb24gUihsZW4sZG90KSB7XHJcbiAgcmV0dXJuIG5ldyBSZXN0KGwobGVuLGRvdCkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBPY3RhdmUob2N0KSB7XHJcbiAgdGhpcy5vY3QgPSBvY3Q7XHJcbn1cclxuT2N0YXZlLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24odHJhY2spXHJcbntcclxuICB0cmFjay5iYWNrLm9jdCA9IHRoaXMub2N0O1xyXG59XHJcblxyXG5mdW5jdGlvbiBPKG9jdCkge1xyXG4gIHJldHVybiBuZXcgT2N0YXZlKG9jdCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIE9jdGF2ZVVwKHYpIHsgdGhpcy52ID0gdjsgfTtcclxuT2N0YXZlVXAucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbih0cmFjaykge1xyXG4gIHRyYWNrLmJhY2sub2N0ICs9IHRoaXMudjtcclxufVxyXG5cclxudmFyIE9VID0gbmV3IE9jdGF2ZVVwKDEpO1xyXG52YXIgT0QgPSBuZXcgT2N0YXZlVXAoLTEpO1xyXG5cclxuZnVuY3Rpb24gVGVtcG8odGVtcG8pXHJcbntcclxuICB0aGlzLnRlbXBvID0gdGVtcG87XHJcbn1cclxuXHJcblRlbXBvLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24odHJhY2spXHJcbntcclxuICB0cmFjay5sb2NhbFRlbXBvID0gdGhpcy50ZW1wbztcclxuICAvL3RyYWNrLnNlcXVlbmNlci50ZW1wbyA9IHRoaXMudGVtcG87XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFRFTVBPKHRlbXBvKVxyXG57XHJcbiAgcmV0dXJuIG5ldyBUZW1wbyh0ZW1wbyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIEVudmVsb3BlKGF0dGFjaywgZGVjYXksIHN1c3RhaW4sIHJlbGVhc2UpXHJcbntcclxuICB0aGlzLmF0dGFjayA9IGF0dGFjaztcclxuICB0aGlzLmRlY2F5ID0gZGVjYXk7XHJcbiAgdGhpcy5zdXN0YWluID0gc3VzdGFpbjtcclxuICB0aGlzLnJlbGVhc2UgPSByZWxlYXNlO1xyXG59XHJcblxyXG5FbnZlbG9wZS5wcm90b3R5cGUucHJvY2VzcyA9IGZ1bmN0aW9uKHRyYWNrKVxyXG57XHJcbiAgdmFyIGVudmVsb3BlID0gdHJhY2suYXVkaW8udm9pY2VzW3RyYWNrLmNoYW5uZWxdLmVudmVsb3BlO1xyXG4gIGVudmVsb3BlLmF0dGFjayA9IHRoaXMuYXR0YWNrO1xyXG4gIGVudmVsb3BlLmRlY2F5ID0gdGhpcy5kZWNheTtcclxuICBlbnZlbG9wZS5zdXN0YWluID0gdGhpcy5zdXN0YWluO1xyXG4gIGVudmVsb3BlLnJlbGVhc2UgPSB0aGlzLnJlbGVhc2U7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIEVOVihhdHRhY2ssZGVjYXksc3VzdGFpbiAscmVsZWFzZSlcclxue1xyXG4gIHJldHVybiBuZXcgRW52ZWxvcGUoYXR0YWNrLCBkZWNheSwgc3VzdGFpbiwgcmVsZWFzZSk7XHJcbn1cclxuXHJcbi8vLyDjg4fjg4Hjg6Xjg7zjg7NcclxuZnVuY3Rpb24gRGV0dW5lKGRldHVuZSlcclxue1xyXG4gIHRoaXMuZGV0dW5lID0gZGV0dW5lO1xyXG59XHJcblxyXG5EZXR1bmUucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbih0cmFjaylcclxue1xyXG4gIHZhciB2b2ljZSA9IHRyYWNrLmF1ZGlvLnZvaWNlc1t0cmFjay5jaGFubmVsXTtcclxuICB2b2ljZS5kZXR1bmUgPSB0aGlzLmRldHVuZTtcclxufVxyXG5cclxuZnVuY3Rpb24gREVUVU5FKGRldHVuZSlcclxue1xyXG4gIHJldHVybiBuZXcgRGV0dW5lKGRldHVuZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFZvbHVtZSh2b2x1bWUpXHJcbntcclxuICB0aGlzLnZvbHVtZSA9IHZvbHVtZTtcclxufVxyXG5cclxuVm9sdW1lLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24odHJhY2spXHJcbntcclxuICB0cmFjay5hdWRpby52b2ljZXNbdHJhY2suY2hhbm5lbF0udm9sdW1lLmdhaW4uc2V0VmFsdWVBdFRpbWUodGhpcy52b2x1bWUsIHRyYWNrLnBsYXlpbmdUaW1lKTtcclxufVxyXG5cclxuZnVuY3Rpb24gVk9MVU1FKHZvbHVtZSlcclxue1xyXG4gIHJldHVybiBuZXcgVm9sdW1lKHZvbHVtZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIExvb3BEYXRhKG9iaix2YXJuYW1lLCBjb3VudCxzZXFQb3MpXHJcbntcclxuICB0aGlzLnZhcm5hbWUgPSB2YXJuYW1lO1xyXG4gIHRoaXMuY291bnQgPSBjb3VudDtcclxuICB0aGlzLm9iaiA9IG9iajtcclxuICB0aGlzLnNlcVBvcyA9IHNlcVBvcztcclxufVxyXG5cclxuZnVuY3Rpb24gTG9vcCh2YXJuYW1lLCBjb3VudCkge1xyXG4gIHRoaXMubG9vcERhdGEgPSBuZXcgTG9vcERhdGEodGhpcyx2YXJuYW1lLGNvdW50LDApO1xyXG59XHJcblxyXG5Mb29wLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKHRyYWNrKVxyXG57XHJcbiAgdmFyIHN0YWNrID0gdHJhY2suc3RhY2s7XHJcbiAgaWYgKHN0YWNrLmxlbmd0aCA9PSAwIHx8IHN0YWNrW3N0YWNrLmxlbmd0aCAtIDFdLm9iaiAhPT0gdGhpcylcclxuICB7XHJcbiAgICB2YXIgbGQgPSB0aGlzLmxvb3BEYXRhO1xyXG4gICAgc3RhY2sucHVzaChuZXcgTG9vcERhdGEodGhpcywgbGQudmFybmFtZSwgbGQuY291bnQsIHRyYWNrLnNlcVBvcykpO1xyXG4gIH0gXHJcbn1cclxuXHJcbmZ1bmN0aW9uIExPT1AodmFybmFtZSwgY291bnQpIHtcclxuICByZXR1cm4gbmV3IExvb3AodmFybmFtZSxjb3VudCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIExvb3BFbmQoKVxyXG57XHJcbn1cclxuXHJcbkxvb3BFbmQucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbih0cmFjaylcclxue1xyXG4gIHZhciBsZCA9IHRyYWNrLnN0YWNrW3RyYWNrLnN0YWNrLmxlbmd0aCAtIDFdO1xyXG4gIGxkLmNvdW50LS07XHJcbiAgaWYgKGxkLmNvdW50ID4gMCkge1xyXG4gICAgdHJhY2suc2VxUG9zID0gbGQuc2VxUG9zO1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0cmFjay5zdGFjay5wb3AoKTtcclxuICB9XHJcbn1cclxuXHJcbnZhciBMT09QX0VORCA9IG5ldyBMb29wRW5kKCk7XHJcblxyXG4vLy8g44K344O844Kx44Oz44K144O844OI44Op44OD44KvXHJcbmZ1bmN0aW9uIFRyYWNrKHNlcXVlbmNlcixzZXFkYXRhLGF1ZGlvKVxyXG57XHJcbiAgdGhpcy5uYW1lID0gJyc7XHJcbiAgdGhpcy5lbmQgPSBmYWxzZTtcclxuICB0aGlzLm9uZXNob3QgPSBmYWxzZTtcclxuICB0aGlzLnNlcXVlbmNlciA9IHNlcXVlbmNlcjtcclxuICB0aGlzLnNlcURhdGEgPSBzZXFkYXRhO1xyXG4gIHRoaXMuc2VxUG9zID0gMDtcclxuICB0aGlzLm11dGUgPSBmYWxzZTtcclxuICB0aGlzLnBsYXlpbmdUaW1lID0gLTE7XHJcbiAgdGhpcy5sb2NhbFRlbXBvID0gc2VxdWVuY2VyLnRlbXBvO1xyXG4gIHRoaXMudHJhY2tWb2x1bWUgPSAxLjA7XHJcbiAgdGhpcy50cmFuc3Bvc2UgPSAwO1xyXG4gIHRoaXMuc29sbyA9IGZhbHNlO1xyXG4gIHRoaXMuY2hhbm5lbCA9IC0xO1xyXG4gIHRoaXMudHJhY2sgPSAtMTtcclxuICB0aGlzLmF1ZGlvID0gYXVkaW87XHJcbiAgdGhpcy5iYWNrID0ge1xyXG4gICAgbm90ZTogNzIsXHJcbiAgICBvY3Q6IDUsXHJcbiAgICBzdGVwOiA5NixcclxuICAgIGdhdGU6IDQ4LFxyXG4gICAgdmVsOjEuMFxyXG4gIH1cclxuICB0aGlzLnN0YWNrID0gW107XHJcbn1cclxuXHJcblRyYWNrLnByb3RvdHlwZSA9IHtcclxuICBwcm9jZXNzOiBmdW5jdGlvbiAoY3VycmVudFRpbWUpIHtcclxuXHJcbiAgICBpZiAodGhpcy5lbmQpIHJldHVybjtcclxuICAgIFxyXG4gICAgaWYgKHRoaXMub25lc2hvdCkge1xyXG4gICAgICB0aGlzLnJlc2V0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHNlcVNpemUgPSB0aGlzLnNlcURhdGEubGVuZ3RoO1xyXG4gICAgaWYgKHRoaXMuc2VxUG9zID49IHNlcVNpemUpIHtcclxuICAgICAgaWYodGhpcy5zZXF1ZW5jZXIucmVwZWF0KVxyXG4gICAgICB7XHJcbiAgICAgICAgdGhpcy5zZXFQb3MgPSAwO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZW5kID0gdHJ1ZTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgc2VxID0gdGhpcy5zZXFEYXRhO1xyXG4gICAgdGhpcy5wbGF5aW5nVGltZSA9ICh0aGlzLnBsYXlpbmdUaW1lID4gLTEpID8gdGhpcy5wbGF5aW5nVGltZSA6IGN1cnJlbnRUaW1lO1xyXG4gICAgdmFyIGVuZFRpbWUgPSBjdXJyZW50VGltZSArIDAuMi8qc2VjKi87XHJcblxyXG4gICAgd2hpbGUgKHRoaXMuc2VxUG9zIDwgc2VxU2l6ZSkge1xyXG4gICAgICBpZiAodGhpcy5wbGF5aW5nVGltZSA+PSBlbmRUaW1lICYmICF0aGlzLm9uZXNob3QpIHtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgZCA9IHNlcVt0aGlzLnNlcVBvc107XHJcbiAgICAgICAgZC5wcm9jZXNzKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuc2VxUG9zKys7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG4gIHJlc2V0OmZ1bmN0aW9uKClcclxuICB7XHJcbiAgICB2YXIgY3VyVm9pY2UgPSB0aGlzLmF1ZGlvLnZvaWNlc1t0aGlzLmNoYW5uZWxdO1xyXG4gICAgY3VyVm9pY2UuZ2Fpbi5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcygwKTtcclxuICAgIGN1clZvaWNlLnByb2Nlc3Nvci5wbGF5YmFja1JhdGUuY2FuY2VsU2NoZWR1bGVkVmFsdWVzKDApO1xyXG4gICAgY3VyVm9pY2UuZ2Fpbi5nYWluLnZhbHVlID0gMDtcclxuICAgIHRoaXMucGxheWluZ1RpbWUgPSAtMTtcclxuICAgIHRoaXMuc2VxUG9zID0gMDtcclxuICAgIHRoaXMuZW5kID0gZmFsc2U7XHJcbiAgfVxyXG5cclxufVxyXG5cclxuZnVuY3Rpb24gbG9hZFRyYWNrcyhzZWxmLHRyYWNrcywgdHJhY2tkYXRhKVxyXG57XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0cmFja2RhdGEubGVuZ3RoOyArK2kpIHtcclxuICAgIHZhciB0cmFjayA9IG5ldyBUcmFjayhzZWxmLCB0cmFja2RhdGFbaV0uZGF0YSxzZWxmLmF1ZGlvKTtcclxuICAgIHRyYWNrLmNoYW5uZWwgPSB0cmFja2RhdGFbaV0uY2hhbm5lbDtcclxuICAgIHRyYWNrLm9uZXNob3QgPSAoIXRyYWNrZGF0YVtpXS5vbmVzaG90KT9mYWxzZTp0cnVlO1xyXG4gICAgdHJhY2sudHJhY2sgPSBpO1xyXG4gICAgdHJhY2tzLnB1c2godHJhY2spO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlVHJhY2tzKHRyYWNrZGF0YSlcclxue1xyXG4gIHZhciB0cmFja3MgPSBbXTtcclxuICBsb2FkVHJhY2tzKHRoaXMsdHJhY2tzLCB0cmFja2RhdGEpO1xyXG4gIHJldHVybiB0cmFja3M7XHJcbn1cclxuXHJcbi8vLyDjgrfjg7zjgrHjg7PjgrXjg7zmnKzkvZNcclxuZXhwb3J0IGZ1bmN0aW9uIFNlcXVlbmNlcihhdWRpbykge1xyXG4gIHRoaXMuYXVkaW8gPSBhdWRpbztcclxuICB0aGlzLnRlbXBvID0gMTAwLjA7XHJcbiAgdGhpcy5yZXBlYXQgPSBmYWxzZTtcclxuICB0aGlzLnBsYXkgPSBmYWxzZTtcclxuICB0aGlzLnRyYWNrcyA9IFtdO1xyXG4gIHRoaXMucGF1c2VUaW1lID0gMDtcclxuICB0aGlzLnN0YXR1cyA9IHRoaXMuU1RPUDtcclxufVxyXG5cclxuU2VxdWVuY2VyLnByb3RvdHlwZSA9IHtcclxuICBsb2FkOiBmdW5jdGlvbihkYXRhKVxyXG4gIHtcclxuICAgIGlmKHRoaXMucGxheSkge1xyXG4gICAgICB0aGlzLnN0b3AoKTtcclxuICAgIH1cclxuICAgIHRoaXMudHJhY2tzLmxlbmd0aCA9IDA7XHJcbiAgICBsb2FkVHJhY2tzKHRoaXMsdGhpcy50cmFja3MsIGRhdGEudHJhY2tzLHRoaXMuYXVkaW8pO1xyXG4gIH0sXHJcbiAgc3RhcnQ6ZnVuY3Rpb24oKVxyXG4gIHtcclxuICAgIC8vICAgIHRoaXMuaGFuZGxlID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkgeyBzZWxmLnByb2Nlc3MoKSB9LCA1MCk7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuUExBWTtcclxuICAgIHRoaXMucHJvY2VzcygpO1xyXG4gIH0sXHJcbiAgcHJvY2VzczpmdW5jdGlvbigpXHJcbiAge1xyXG4gICAgaWYgKHRoaXMuc3RhdHVzID09IHRoaXMuUExBWSkge1xyXG4gICAgICB0aGlzLnBsYXlUcmFja3ModGhpcy50cmFja3MpO1xyXG4gICAgICB0aGlzLmhhbmRsZSA9IHdpbmRvdy5zZXRUaW1lb3V0KHRoaXMucHJvY2Vzcy5iaW5kKHRoaXMpLCAxMDApO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgcGxheVRyYWNrczogZnVuY3Rpb24gKHRyYWNrcyl7XHJcbiAgICB2YXIgY3VycmVudFRpbWUgPSB0aGlzLmF1ZGlvLmF1ZGlvY3R4LmN1cnJlbnRUaW1lO1xyXG4gLy8gICBjb25zb2xlLmxvZyh0aGlzLmF1ZGlvLmF1ZGlvY3R4LmN1cnJlbnRUaW1lKTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0cmFja3MubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgdHJhY2tzW2ldLnByb2Nlc3MoY3VycmVudFRpbWUpO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgcGF1c2U6ZnVuY3Rpb24oKVxyXG4gIHtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5QQVVTRTtcclxuICAgIHRoaXMucGF1c2VUaW1lID0gdGhpcy5hdWRpby5hdWRpb2N0eC5jdXJyZW50VGltZTtcclxuICB9LFxyXG4gIHJlc3VtZTpmdW5jdGlvbiAoKVxyXG4gIHtcclxuICAgIGlmICh0aGlzLnN0YXR1cyA9PSB0aGlzLlBBVVNFKSB7XHJcbiAgICAgIHRoaXMuc3RhdHVzID0gdGhpcy5QTEFZO1xyXG4gICAgICB2YXIgdHJhY2tzID0gdGhpcy50cmFja3M7XHJcbiAgICAgIHZhciBhZGp1c3QgPSB0aGlzLmF1ZGlvLmF1ZGlvY3R4LmN1cnJlbnRUaW1lIC0gdGhpcy5wYXVzZVRpbWU7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0cmFja3MubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgICB0cmFja3NbaV0ucGxheWluZ1RpbWUgKz0gYWRqdXN0O1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMucHJvY2VzcygpO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgc3RvcDogZnVuY3Rpb24gKClcclxuICB7XHJcbiAgICBpZiAodGhpcy5zdGF0dXMgIT0gdGhpcy5TVE9QKSB7XHJcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLmhhbmRsZSk7XHJcbiAgICAgIC8vICAgIGNsZWFySW50ZXJ2YWwodGhpcy5oYW5kbGUpO1xyXG4gICAgICB0aGlzLnN0YXR1cyA9IHRoaXMuU1RPUDtcclxuICAgICAgdGhpcy5yZXNldCgpO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgcmVzZXQ6ZnVuY3Rpb24oKVxyXG4gIHtcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0aGlzLnRyYWNrcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSlcclxuICAgIHtcclxuICAgICAgdGhpcy50cmFja3NbaV0ucmVzZXQoKTtcclxuICAgIH1cclxuICB9LFxyXG4gIFNUT1A6IDAgfCAwLFxyXG4gIFBMQVk6IDEgfCAwLFxyXG4gIFBBVVNFOjIgfCAwXHJcbn1cclxuXHJcbi8vLyDnsKHmmJPpjbXnm6Tjga7lrp/oo4VcclxuZnVuY3Rpb24gUGlhbm8oYXVkaW8pIHtcclxuICB0aGlzLmF1ZGlvID0gYXVkaW87XHJcbiAgdGhpcy50YWJsZSA9IFs5MCwgODMsIDg4LCA2OCwgNjcsIDg2LCA3MSwgNjYsIDcyLCA3OCwgNzQsIDc3LCAxODhdO1xyXG4gIHRoaXMua2V5b24gPSBuZXcgQXJyYXkoMTMpO1xyXG59XHJcblxyXG5QaWFuby5wcm90b3R5cGUgPSB7XHJcbiAgb246IGZ1bmN0aW9uIChlKSB7XHJcbiAgICB2YXIgaW5kZXggPSB0aGlzLnRhYmxlLmluZGV4T2YoZS5rZXlDb2RlLCAwKTtcclxuICAgIGlmIChpbmRleCA9PSAtMSkge1xyXG4gICAgICBpZiAoZS5rZXlDb2RlID4gNDggJiYgZS5rZXlDb2RlIDwgNTcpIHtcclxuICAgICAgICB2YXIgdGltYnJlID0gZS5rZXlDb2RlIC0gNDk7XHJcbiAgICAgICAgdGhpcy5hdWRpby52b2ljZXNbN10uc2V0U2FtcGxlKHdhdmVTYW1wbGVzW3RpbWJyZV0pO1xyXG4gICAgICAgIHdhdmVHcmFwaC53YXZlID0gd2F2ZXNbdGltYnJlXTtcclxuICAgICAgICB3YXZlR3JhcGgucmVuZGVyKCk7XHJcbiAgICAgICAgdGV4dFBsYW5lLnByaW50KDUsIDEwLCBcIldhdmUgXCIgKyAodGltYnJlICsgMSkpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy9hdWRpby52b2ljZXNbMF0ucHJvY2Vzc29yLnBsYXliYWNrUmF0ZS52YWx1ZSA9IHNlcXVlbmNlci5ub3RlRnJlcVtdO1xyXG4gICAgICBpZiAoIXRoaXMua2V5b25baW5kZXhdKSB7XHJcbiAgICAgICAgdGhpcy5hdWRpby52b2ljZXNbN10ua2V5b24oMCxpbmRleCArIChlLnNoaWZ0S2V5ID8gODQgOiA3MiksMS4wKTtcclxuICAgICAgICB0aGlzLmtleW9uW2luZGV4XSA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICB9LFxyXG4gIG9mZjogZnVuY3Rpb24gKGUpIHtcclxuICAgIHZhciBpbmRleCA9IHRoaXMudGFibGUuaW5kZXhPZihlLmtleUNvZGUsIDApO1xyXG4gICAgaWYgKGluZGV4ID09IC0xKSB7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKHRoaXMua2V5b25baW5kZXhdKSB7XHJcbiAgICAgICAgYXVkaW8udm9pY2VzWzddLmVudmVsb3BlLmtleW9mZigwKTtcclxuICAgICAgICB0aGlzLmtleW9uW2luZGV4XSA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgc2VxRGF0YSA9IHtcclxuICBuYW1lOiAnVGVzdCcsXHJcbiAgdHJhY2tzOiBbXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6ICdwYXJ0MScsXHJcbiAgICAgIGNoYW5uZWw6IDAsXHJcbiAgICAgIGRhdGE6XHJcbiAgICAgIFtcclxuICAgICAgICBFTlYoMC4wMSwgMC4wMiwgMC41LCAwLjA3KSxcclxuICAgICAgICBURU1QTygxODApLCBUT05FKDApLCBWT0xVTUUoMC41KSwgTCg4KSwgR1QoLTAuNSksTyg0KSxcclxuICAgICAgICBMT09QKCdpJyw0KSxcclxuICAgICAgICBDLCBDLCBDLCBDLCBDLCBDLCBDLCBDLFxyXG4gICAgICAgIExPT1BfRU5ELFxyXG4gICAgICAgIEpVTVAoNSlcclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgbmFtZTogJ3BhcnQyJyxcclxuICAgICAgY2hhbm5lbDogMSxcclxuICAgICAgZGF0YTpcclxuICAgICAgICBbXHJcbiAgICAgICAgRU5WKDAuMDEsIDAuMDUsIDAuNiwgMC4wNyksXHJcbiAgICAgICAgVEVNUE8oMTgwKSxUT05FKDYpLCBWT0xVTUUoMC4yKSwgTCg4KSwgR1QoLTAuOCksXHJcbiAgICAgICAgUigxKSwgUigxKSxcclxuICAgICAgICBPKDYpLEwoMSksIEYsXHJcbiAgICAgICAgRSxcclxuICAgICAgICBPRCwgTCg4LCB0cnVlKSwgQmIsIEcsIEwoNCksIEJiLCBPVSwgTCg0KSwgRiwgTCg4KSwgRCxcclxuICAgICAgICBMKDQsIHRydWUpLCBFLCBMKDIpLCBDLFIoOCksXHJcbiAgICAgICAgSlVNUCg4KVxyXG4gICAgICAgIF1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6ICdwYXJ0MycsXHJcbiAgICAgIGNoYW5uZWw6IDIsXHJcbiAgICAgIGRhdGE6XHJcbiAgICAgICAgW1xyXG4gICAgICAgIEVOVigwLjAxLCAwLjA1LCAwLjYsIDAuMDcpLFxyXG4gICAgICAgIFRFTVBPKDE4MCksVE9ORSg2KSwgVk9MVU1FKDAuMSksIEwoOCksIEdUKC0wLjUpLCBcclxuICAgICAgICBSKDEpLCBSKDEpLFxyXG4gICAgICAgIE8oNiksTCgxKSwgQyxDLFxyXG4gICAgICAgIE9ELCBMKDgsIHRydWUpLCBHLCBELCBMKDQpLCBHLCBPVSwgTCg0KSwgRCwgTCg4KSxPRCwgRyxcclxuICAgICAgICBMKDQsIHRydWUpLCBPVSxDLCBMKDIpLE9ELCBHLCBSKDgpLFxyXG4gICAgICAgIEpVTVAoNylcclxuICAgICAgICBdXHJcbiAgICB9XHJcbiAgXVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gU291bmRFZmZlY3RzKHNlcXVlbmNlcikge1xyXG4gICB0aGlzLnNvdW5kRWZmZWN0cyA9XHJcbiAgICBbXHJcbiAgICAvLyBFZmZlY3QgMCAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgIGNyZWF0ZVRyYWNrcy5jYWxsKHNlcXVlbmNlcixbXHJcbiAgICB7XHJcbiAgICAgIGNoYW5uZWw6IDgsXHJcbiAgICAgIG9uZXNob3Q6dHJ1ZSxcclxuICAgICAgZGF0YTogW1ZPTFVNRSgwLjUpLFxyXG4gICAgICAgIEVOVigwLjAwMDEsIDAuMDEsIDEuMCwgMC4wMDAxKSxHVCgtMC45OTkpLFRPTkUoMCksIFRFTVBPKDIwMCksIE8oOCksU1QoMyksIEMsIEQsIEUsIEYsIEcsIEEsIEIsIE9VLCBDLCBELCBFLCBHLCBBLCBCLEIsQixCXHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGNoYW5uZWw6IDksXHJcbiAgICAgIG9uZXNob3Q6IHRydWUsXHJcbiAgICAgIGRhdGE6IFtWT0xVTUUoMC41KSxcclxuICAgICAgICBFTlYoMC4wMDAxLCAwLjAxLCAxLjAsIDAuMDAwMSksIERFVFVORSgwLjkpLCBHVCgtMC45OTkpLCBUT05FKDApLCBURU1QTygyMDApLCBPKDUpLCBTVCgzKSwgQywgRCwgRSwgRiwgRywgQSwgQiwgT1UsIEMsIEQsIEUsIEcsIEEsIEIsQixCLEJcclxuICAgICAgXVxyXG4gICAgfVxyXG4gICAgXSksXHJcbiAgICAvLyBFZmZlY3QgMSAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICBjcmVhdGVUcmFja3MuY2FsbChzZXF1ZW5jZXIsXHJcbiAgICAgIFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBjaGFubmVsOiAxMCxcclxuICAgICAgICAgIG9uZXNob3Q6IHRydWUsXHJcbiAgICAgICAgICBkYXRhOiBbXHJcbiAgICAgICAgICAgVE9ORSg0KSwgVEVNUE8oMTUwKSwgU1QoNCksIEdUKC0wLjk5OTkpLCBFTlYoMC4wMDAxLCAwLjAwMDEsIDEuMCwgMC4wMDAxKSxcclxuICAgICAgICAgICBPKDYpLCBHLCBBLCBCLCBPKDcpLCBCLCBBLCBHLCBGLCBFLCBELCBDLCBFLCBHLCBBLCBCLCBPRCwgQiwgQSwgRywgRiwgRSwgRCwgQywgT0QsIEIsIEEsIEcsIEYsIEUsIEQsIENcclxuICAgICAgICAgIF1cclxuICAgICAgICB9XHJcbiAgICAgIF0pLFxyXG4gICAgLy8gRWZmZWN0IDIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgY3JlYXRlVHJhY2tzLmNhbGwoc2VxdWVuY2VyLFxyXG4gICAgICBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgY2hhbm5lbDogMTAsXHJcbiAgICAgICAgICBvbmVzaG90OiB0cnVlLFxyXG4gICAgICAgICAgZGF0YTogW1xyXG4gICAgICAgICAgIFRPTkUoMCksIFRFTVBPKDE1MCksIFNUKDIpLCBHVCgtMC45OTk5KSwgRU5WKDAuMDAwMSwgMC4wMDAxLCAxLjAsIDAuMDAwMSksXHJcbiAgICAgICAgICAgTyg4KSwgQyxELEUsRixHLEEsQixPVSxDLEQsRSxGLE9ELEcsT1UsQSxPRCxCLE9VLEEsT0QsRyxPVSxGLE9ELEUsT1UsRVxyXG4gICAgICAgICAgXVxyXG4gICAgICAgIH1cclxuICAgICAgXSksXHJcbiAgICAgIC8vIEVmZmVjdCAzIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgICBjcmVhdGVUcmFja3MuY2FsbChzZXF1ZW5jZXIsXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBjaGFubmVsOiAxMCxcclxuICAgICAgICAgICAgb25lc2hvdDogdHJ1ZSxcclxuICAgICAgICAgICAgZGF0YTogW1xyXG4gICAgICAgICAgICAgVE9ORSg1KSwgVEVNUE8oMTUwKSwgTCg2NCksIEdUKC0wLjk5OTkpLCBFTlYoMC4wMDAxLCAwLjAwMDEsIDEuMCwgMC4wMDAxKSxcclxuICAgICAgICAgICAgIE8oNiksQyxPRCxDLE9VLEMsT0QsQyxPVSxDLE9ELEMsT1UsQyxPRFxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgXSksXHJcbiAgICAgIC8vIEVmZmVjdCA0IC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgICAgY3JlYXRlVHJhY2tzLmNhbGwoc2VxdWVuY2VyLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgY2hhbm5lbDogMTEsXHJcbiAgICAgICAgICAgIG9uZXNob3Q6IHRydWUsXHJcbiAgICAgICAgICAgIGRhdGE6IFtcclxuICAgICAgICAgICAgIFRPTkUoOCksIFZPTFVNRSgyLjApLFRFTVBPKDEyMCksIEwoMiksIEdUKC0wLjk5OTkpLCBFTlYoMC4wMDAxLCAwLjAwMDEsIDEuMCwgMC4yNSksXHJcbiAgICAgICAgICAgICBPKDEpLCBDXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICAgIH1cclxuICAgICAgICBdKVxyXG4gICBdO1xyXG4gfVxyXG5cclxuXHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0IHtzZmd9IGZyb20gJy4vZ2xvYmFsLmpzJztcclxuXHJcbi8vLyDjg4bjgq/jgrnjg4Hjg6Pjg7zjgajjgZfjgaZjYW52YXPjgpLkvb/jgYbloLTlkIjjga7jg5jjg6vjg5Hjg7xcclxuZXhwb3J0IGZ1bmN0aW9uIENhbnZhc1RleHR1cmUod2lkdGgsIGhlaWdodCkge1xyXG4gIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgdGhpcy5jYW52YXMud2lkdGggPSB3aWR0aCB8fCBzZmcuVklSVFVBTF9XSURUSDtcclxuICB0aGlzLmNhbnZhcy5oZWlnaHQgPSBoZWlnaHQgfHwgc2ZnLlZJUlRVQUxfSEVJR0hUO1xyXG4gIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICB0aGlzLnRleHR1cmUgPSBuZXcgVEhSRUUuVGV4dHVyZSh0aGlzLmNhbnZhcyk7XHJcbiAgdGhpcy50ZXh0dXJlLm1hZ0ZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XHJcbiAgdGhpcy50ZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLkxpbmVhck1pcE1hcExpbmVhckZpbHRlcjtcclxuICB0aGlzLm1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgbWFwOiB0aGlzLnRleHR1cmUsIHRyYW5zcGFyZW50OiB0cnVlIH0pO1xyXG4gIHRoaXMuZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSh0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuICB0aGlzLm1lc2ggPSBuZXcgVEhSRUUuTWVzaCh0aGlzLmdlb21ldHJ5LCB0aGlzLm1hdGVyaWFsKTtcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueiA9IDAuMDAxO1xyXG4gIC8vIOOCueODoOODvOOCuOODs+OCsOOCkuWIh+OCi1xyXG4gIHRoaXMuY3R4Lm1zSW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgdGhpcy5jdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgLy90aGlzLmN0eC53ZWJraXRJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICB0aGlzLmN0eC5tb3pJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxufVxyXG5cclxuLy8vIOODl+ODreOCsOODrOOCueODkOODvOihqOekuuOCr+ODqeOCuVxyXG5leHBvcnQgZnVuY3Rpb24gUHJvZ3Jlc3MoKSB7XHJcbiAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTs7XHJcbiAgdmFyIHdpZHRoID0gMTtcclxuICB3aGlsZSAod2lkdGggPD0gc2ZnLlZJUlRVQUxfV0lEVEgpe1xyXG4gICAgd2lkdGggKj0gMjtcclxuICB9XHJcbiAgdmFyIGhlaWdodCA9IDE7XHJcbiAgd2hpbGUgKGhlaWdodCA8PSBzZmcuVklSVFVBTF9IRUlHSFQpe1xyXG4gICAgaGVpZ2h0ICo9IDI7XHJcbiAgfVxyXG4gIHRoaXMuY2FudmFzLndpZHRoID0gd2lkdGg7XHJcbiAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG4gIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICB0aGlzLnRleHR1cmUgPSBuZXcgVEhSRUUuVGV4dHVyZSh0aGlzLmNhbnZhcyk7XHJcbiAgdGhpcy50ZXh0dXJlLm1hZ0ZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XHJcbiAgdGhpcy50ZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLkxpbmVhck1pcE1hcExpbmVhckZpbHRlcjtcclxuICAvLyDjgrnjg6Djg7zjgrjjg7PjgrDjgpLliIfjgotcclxuICB0aGlzLmN0eC5tc0ltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIHRoaXMuY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIC8vdGhpcy5jdHgud2Via2l0SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgdGhpcy5jdHgubW96SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcblxyXG4gIHRoaXMubWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBtYXA6IHRoaXMudGV4dHVyZSwgdHJhbnNwYXJlbnQ6IHRydWUgfSk7XHJcbiAgdGhpcy5nZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG4gIHRoaXMubWVzaCA9IG5ldyBUSFJFRS5NZXNoKHRoaXMuZ2VvbWV0cnksIHRoaXMubWF0ZXJpYWwpO1xyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi54ID0gKHdpZHRoIC0gc2ZnLlZJUlRVQUxfV0lEVEgpIC8gMjtcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueSA9ICAtIChoZWlnaHQgLSBzZmcuVklSVFVBTF9IRUlHSFQpIC8gMjtcclxuXHJcbiAgLy90aGlzLnRleHR1cmUucHJlbXVsdGlwbHlBbHBoYSA9IHRydWU7XHJcbn1cclxuXHJcbi8vLyDjg5fjg63jgrDjg6zjgrnjg5Djg7zjgpLooajnpLrjgZnjgovjgIJcclxuUHJvZ3Jlc3MucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIChtZXNzYWdlLCBwZXJjZW50KSB7XHJcbiAgdmFyIGN0eCA9IHRoaXMuY3R4O1xyXG4gIHZhciB3aWR0aCA9IHRoaXMuY2FudmFzLndpZHRoLCBoZWlnaHQgPSB0aGlzLmNhbnZhcy5oZWlnaHQ7XHJcbiAgLy8gICAgICBjdHguZmlsbFN0eWxlID0gJ3JnYmEoMCwwLDAsMCknO1xyXG4gIGN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcbiAgdmFyIHRleHRXaWR0aCA9IGN0eC5tZWFzdXJlVGV4dChtZXNzYWdlKS53aWR0aDtcclxuICBjdHguc3Ryb2tlU3R5bGUgPSBjdHguZmlsbFN0eWxlID0gJ3JnYmEoMjU1LDI1NSwyNTUsMS4wKSc7XHJcblxyXG4gIGN0eC5maWxsVGV4dChtZXNzYWdlLCAod2lkdGggLSB0ZXh0V2lkdGgpIC8gMiwgMTAwKTtcclxuICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgY3R4LnJlY3QoMjAsIDc1LCB3aWR0aCAtIDIwICogMiwgMTApO1xyXG4gIGN0eC5zdHJva2UoKTtcclxuICBjdHguZmlsbFJlY3QoMjAsIDc1LCAod2lkdGggLSAyMCAqIDIpICogcGVyY2VudCAvIDEwMCwgMTApO1xyXG4gIHRoaXMudGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbn1cclxuXHJcbi8vLyBpbWfjgYvjgonjgrjjgqrjg6Hjg4jjg6rjgpLkvZzmiJDjgZnjgotcclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUdlb21ldHJ5RnJvbUltYWdlKGltYWdlKSB7XHJcbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gIHZhciB3ID0gdGV4dHVyZUZpbGVzLmF1dGhvci50ZXh0dXJlLmltYWdlLndpZHRoO1xyXG4gIHZhciBoID0gdGV4dHVyZUZpbGVzLmF1dGhvci50ZXh0dXJlLmltYWdlLmhlaWdodDtcclxuICBjYW52YXMud2lkdGggPSB3O1xyXG4gIGNhbnZhcy5oZWlnaHQgPSBoO1xyXG4gIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICBjdHguZHJhd0ltYWdlKGltYWdlLCAwLCAwKTtcclxuICB2YXIgZGF0YSA9IGN0eC5nZXRJbWFnZURhdGEoMCwgMCwgdywgaCk7XHJcbiAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkdlb21ldHJ5KCk7XHJcbiAge1xyXG4gICAgdmFyIGkgPSAwO1xyXG5cclxuICAgIGZvciAodmFyIHkgPSAwOyB5IDwgaDsgKyt5KSB7XHJcbiAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgdzsgKyt4KSB7XHJcbiAgICAgICAgdmFyIGNvbG9yID0gbmV3IFRIUkVFLkNvbG9yKCk7XHJcblxyXG4gICAgICAgIHZhciByID0gZGF0YS5kYXRhW2krK107XHJcbiAgICAgICAgdmFyIHNmZyA9IGRhdGEuZGF0YVtpKytdO1xyXG4gICAgICAgIHZhciBiID0gZGF0YS5kYXRhW2krK107XHJcbiAgICAgICAgdmFyIGEgPSBkYXRhLmRhdGFbaSsrXTtcclxuICAgICAgICBpZiAoYSAhPSAwKSB7XHJcbiAgICAgICAgICBjb2xvci5zZXRSR0IociAvIDI1NS4wLCBzZmcgLyAyNTUuMCwgYiAvIDI1NS4wKTtcclxuICAgICAgICAgIHZhciB2ZXJ0ID0gbmV3IFRIUkVFLlZlY3RvcjMoKCh4IC0gdyAvIDIuMCkpICogMi4wLCAoKHkgLSBoIC8gMikpICogLTIuMCwgMC4wKTtcclxuICAgICAgICAgIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2godmVydCk7XHJcbiAgICAgICAgICBnZW9tZXRyeS5jb2xvcnMucHVzaChjb2xvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3ByaXRlR2VvbWV0cnkoc2l6ZSlcclxue1xyXG4gIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5HZW9tZXRyeSgpO1xyXG4gIHZhciBzaXplSGFsZiA9IHNpemUgLyAyO1xyXG4gIC8vIGdlb21ldHJ5LlxyXG4gIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2gobmV3IFRIUkVFLlZlY3RvcjMoLXNpemVIYWxmLCBzaXplSGFsZiwgMCkpO1xyXG4gIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2gobmV3IFRIUkVFLlZlY3RvcjMoc2l6ZUhhbGYsIHNpemVIYWxmLCAwKSk7XHJcbiAgZ2VvbWV0cnkudmVydGljZXMucHVzaChuZXcgVEhSRUUuVmVjdG9yMyhzaXplSGFsZiwgLXNpemVIYWxmLCAwKSk7XHJcbiAgZ2VvbWV0cnkudmVydGljZXMucHVzaChuZXcgVEhSRUUuVmVjdG9yMygtc2l6ZUhhbGYsIC1zaXplSGFsZiwgMCkpO1xyXG4gIGdlb21ldHJ5LmZhY2VzLnB1c2gobmV3IFRIUkVFLkZhY2UzKDAsIDIsIDEpKTtcclxuICBnZW9tZXRyeS5mYWNlcy5wdXNoKG5ldyBUSFJFRS5GYWNlMygwLCAzLCAyKSk7XHJcbiAgcmV0dXJuIGdlb21ldHJ5O1xyXG59XHJcblxyXG4vLy8g44OG44Kv44K544OB44Oj44O85LiK44Gu5oyH5a6a44K544OX44Op44Kk44OI44GuVVbluqfmqJnjgpLmsYLjgoHjgotcclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNwcml0ZVVWKGdlb21ldHJ5LCB0ZXh0dXJlLCBjZWxsV2lkdGgsIGNlbGxIZWlnaHQsIGNlbGxObylcclxue1xyXG4gIHZhciB3aWR0aCA9IHRleHR1cmUuaW1hZ2Uud2lkdGg7XHJcbiAgdmFyIGhlaWdodCA9IHRleHR1cmUuaW1hZ2UuaGVpZ2h0O1xyXG5cclxuICB2YXIgdUNlbGxDb3VudCA9ICh3aWR0aCAvIGNlbGxXaWR0aCkgfCAwO1xyXG4gIHZhciB2Q2VsbENvdW50ID0gKGhlaWdodCAvIGNlbGxIZWlnaHQpIHwgMDtcclxuICB2YXIgdlBvcyA9IHZDZWxsQ291bnQgLSAoKGNlbGxObyAvIHVDZWxsQ291bnQpIHwgMCk7XHJcbiAgdmFyIHVQb3MgPSBjZWxsTm8gJSB1Q2VsbENvdW50O1xyXG4gIHZhciB1VW5pdCA9IGNlbGxXaWR0aCAvIHdpZHRoOyBcclxuICB2YXIgdlVuaXQgPSBjZWxsSGVpZ2h0IC8gaGVpZ2h0O1xyXG5cclxuICBnZW9tZXRyeS5mYWNlVmVydGV4VXZzWzBdLnB1c2goW1xyXG4gICAgbmV3IFRIUkVFLlZlY3RvcjIoKHVQb3MpICogY2VsbFdpZHRoIC8gd2lkdGgsICh2UG9zKSAqIGNlbGxIZWlnaHQgLyBoZWlnaHQpLFxyXG4gICAgbmV3IFRIUkVFLlZlY3RvcjIoKHVQb3MgKyAxKSAqIGNlbGxXaWR0aCAvIHdpZHRoLCAodlBvcyAtIDEpICogY2VsbEhlaWdodCAvIGhlaWdodCksXHJcbiAgICBuZXcgVEhSRUUuVmVjdG9yMigodVBvcyArIDEpICogY2VsbFdpZHRoIC8gd2lkdGgsICh2UG9zKSAqIGNlbGxIZWlnaHQgLyBoZWlnaHQpXHJcbiAgXSk7XHJcbiAgZ2VvbWV0cnkuZmFjZVZlcnRleFV2c1swXS5wdXNoKFtcclxuICAgIG5ldyBUSFJFRS5WZWN0b3IyKCh1UG9zKSAqIGNlbGxXaWR0aCAvIHdpZHRoLCAodlBvcykgKiBjZWxsSGVpZ2h0IC8gaGVpZ2h0KSxcclxuICAgIG5ldyBUSFJFRS5WZWN0b3IyKCh1UG9zKSAqIGNlbGxXaWR0aCAvIHdpZHRoLCAodlBvcyAtIDEpICogY2VsbEhlaWdodCAvIGhlaWdodCksXHJcbiAgICBuZXcgVEhSRUUuVmVjdG9yMigodVBvcyArIDEpICogY2VsbFdpZHRoIC8gd2lkdGgsICh2UG9zIC0gMSkgKiBjZWxsSGVpZ2h0IC8gaGVpZ2h0KVxyXG4gIF0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlU3ByaXRlVVYoZ2VvbWV0cnksIHRleHR1cmUsIGNlbGxXaWR0aCwgY2VsbEhlaWdodCwgY2VsbE5vKVxyXG57XHJcbiAgdmFyIHdpZHRoID0gdGV4dHVyZS5pbWFnZS53aWR0aDtcclxuICB2YXIgaGVpZ2h0ID0gdGV4dHVyZS5pbWFnZS5oZWlnaHQ7XHJcblxyXG4gIHZhciB1Q2VsbENvdW50ID0gKHdpZHRoIC8gY2VsbFdpZHRoKSB8IDA7XHJcbiAgdmFyIHZDZWxsQ291bnQgPSAoaGVpZ2h0IC8gY2VsbEhlaWdodCkgfCAwO1xyXG4gIHZhciB2UG9zID0gdkNlbGxDb3VudCAtICgoY2VsbE5vIC8gdUNlbGxDb3VudCkgfCAwKTtcclxuICB2YXIgdVBvcyA9IGNlbGxObyAlIHVDZWxsQ291bnQ7XHJcbiAgdmFyIHVVbml0ID0gY2VsbFdpZHRoIC8gd2lkdGg7XHJcbiAgdmFyIHZVbml0ID0gY2VsbEhlaWdodCAvIGhlaWdodDtcclxuICB2YXIgdXZzID0gZ2VvbWV0cnkuZmFjZVZlcnRleFV2c1swXVswXTtcclxuXHJcbiAgdXZzWzBdLnggPSAodVBvcykgKiB1VW5pdDtcclxuICB1dnNbMF0ueSA9ICh2UG9zKSAqIHZVbml0O1xyXG4gIHV2c1sxXS54ID0gKHVQb3MgKyAxKSAqIHVVbml0O1xyXG4gIHV2c1sxXS55ID0gKHZQb3MgLSAxKSAqIHZVbml0O1xyXG4gIHV2c1syXS54ID0gKHVQb3MgKyAxKSAqIHVVbml0O1xyXG4gIHV2c1syXS55ID0gKHZQb3MpICogdlVuaXQ7XHJcblxyXG4gIHV2cyA9IGdlb21ldHJ5LmZhY2VWZXJ0ZXhVdnNbMF1bMV07XHJcblxyXG4gIHV2c1swXS54ID0gKHVQb3MpICogdVVuaXQ7XHJcbiAgdXZzWzBdLnkgPSAodlBvcykgKiB2VW5pdDtcclxuICB1dnNbMV0ueCA9ICh1UG9zKSAqIHVVbml0O1xyXG4gIHV2c1sxXS55ID0gKHZQb3MgLSAxKSAqIHZVbml0O1xyXG4gIHV2c1syXS54ID0gKHVQb3MgKyAxKSAqIHVVbml0O1xyXG4gIHV2c1syXS55ID0gKHZQb3MgLSAxKSAqIHZVbml0O1xyXG5cclxuIFxyXG4gIGdlb21ldHJ5LnV2c05lZWRVcGRhdGUgPSB0cnVlO1xyXG5cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNwcml0ZU1hdGVyaWFsKHRleHR1cmUpXHJcbntcclxuICAvLyDjg6Hjg4Pjgrfjg6Xjga7kvZzmiJDjg7vooajnpLogLy8vXHJcbiAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgbWFwOiB0ZXh0dXJlIC8qLGRlcHRoVGVzdDp0cnVlKi8sIHRyYW5zcGFyZW50OiB0cnVlIH0pO1xyXG4gIG1hdGVyaWFsLnNoYWRpbmcgPSBUSFJFRS5GbGF0U2hhZGluZztcclxuICBtYXRlcmlhbC5zaWRlID0gVEhSRUUuRnJvbnRTaWRlO1xyXG4gIG1hdGVyaWFsLmFscGhhVGVzdCA9IDAuNTtcclxuICBtYXRlcmlhbC5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbi8vICBtYXRlcmlhbC5cclxuICByZXR1cm4gbWF0ZXJpYWw7XHJcbn1cclxuXHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0IHtzZmd9IGZyb20gJy4vZ2xvYmFsLmpzJztcclxuXHJcbi8vIOOCreODvOWFpeWKm1xyXG5leHBvcnQgY2xhc3MgQmFzaWNJbnB1dHtcclxuY29uc3RydWN0b3IgKCkge1xyXG4gIHRoaXMua2V5Q2hlY2sgPSB7IHVwOiBmYWxzZSwgZG93bjogZmFsc2UsIGxlZnQ6IGZhbHNlLCByaWdodDogZmFsc2UsIHo6IGZhbHNlICx4OmZhbHNlfTtcclxuICB0aGlzLmtleUJ1ZmZlciA9IFtdO1xyXG4gIHRoaXMua2V5dXBfID0gbnVsbDtcclxuICB0aGlzLmtleWRvd25fID0gbnVsbDtcclxuICAvL3RoaXMuZ2FtZXBhZENoZWNrID0geyB1cDogZmFsc2UsIGRvd246IGZhbHNlLCBsZWZ0OiBmYWxzZSwgcmlnaHQ6IGZhbHNlLCB6OiBmYWxzZSAseDpmYWxzZX07XHJcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2dhbWVwYWRjb25uZWN0ZWQnLChlKT0+e1xyXG4gICAgdGhpcy5nYW1lcGFkID0gZS5nYW1lcGFkO1xyXG4gIH0pO1xyXG4gXHJcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2dhbWVwYWRkaXNjb25uZWN0ZWQnLChlKT0+e1xyXG4gICAgZGVsZXRlIHRoaXMuZ2FtZXBhZDtcclxuICB9KTsgXHJcbiBcclxuIGlmKHdpbmRvdy5uYXZpZ2F0b3IuZ2V0R2FtZXBhZHMpe1xyXG4gICB0aGlzLmdhbWVwYWQgPSB3aW5kb3cubmF2aWdhdG9yLmdldEdhbWVwYWRzKClbMF07XHJcbiB9IFxyXG59XHJcblxyXG4gIGNsZWFyKClcclxuICB7XHJcbiAgICBmb3IodmFyIGQgaW4gdGhpcy5rZXlDaGVjayl7XHJcbiAgICAgIHRoaXMua2V5Q2hlY2tbZF0gPSBmYWxzZTtcclxuICAgIH1cclxuICAgIHRoaXMua2V5QnVmZmVyLmxlbmd0aCA9IDA7XHJcbiAgfVxyXG4gIFxyXG4gIGtleWRvd24oZSkge1xyXG4gICAgdmFyIGUgPSBkMy5ldmVudDtcclxuICAgIHZhciBrZXlCdWZmZXIgPSB0aGlzLmtleUJ1ZmZlcjtcclxuICAgIHZhciBrZXlDaGVjayA9IHRoaXMua2V5Q2hlY2s7XHJcbiAgICB2YXIgaGFuZGxlID0gdHJ1ZTtcclxuICAgICBcclxuICAgIGlmIChrZXlCdWZmZXIubGVuZ3RoID4gMTYpIHtcclxuICAgICAga2V5QnVmZmVyLnNoaWZ0KCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGlmIChlLmtleUNvZGUgPT0gODAgLyogUCAqLykge1xyXG4gICAgICBpZiAoIXNmZy5wYXVzZSkge1xyXG4gICAgICAgIHNmZy5nYW1lLnBhdXNlKCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc2ZnLmdhbWUucmVzdW1lKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgICAgICAgIFxyXG4gICAga2V5QnVmZmVyLnB1c2goZS5rZXlDb2RlKTtcclxuICAgIHN3aXRjaCAoZS5rZXlDb2RlKSB7XHJcbiAgICAgIGNhc2UgNzQ6XHJcbiAgICAgIGNhc2UgMzc6XHJcbiAgICAgIGNhc2UgMTAwOlxyXG4gICAgICAgIGtleUNoZWNrLmxlZnQgPSB0cnVlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgNzM6XHJcbiAgICAgIGNhc2UgMzg6XHJcbiAgICAgIGNhc2UgMTA0OlxyXG4gICAgICAgIGtleUNoZWNrLnVwID0gdHJ1ZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDc2OlxyXG4gICAgICBjYXNlIDM5OlxyXG4gICAgICBjYXNlIDEwMjpcclxuICAgICAgICBrZXlDaGVjay5yaWdodCA9IHRydWU7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA3NTpcclxuICAgICAgY2FzZSA0MDpcclxuICAgICAgY2FzZSA5ODpcclxuICAgICAgICBrZXlDaGVjay5kb3duID0gdHJ1ZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDkwOlxyXG4gICAgICAgIGtleUNoZWNrLnogPSB0cnVlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgODg6XHJcbiAgICAgICAga2V5Q2hlY2sueCA9IHRydWU7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIGlmIChoYW5kbGUpIHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICBlLnJldHVyblZhbHVlID0gZmFsc2U7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAga2V5dXAoKSB7XHJcbiAgICB2YXIgZSA9IGQzLmV2ZW50O1xyXG4gICAgdmFyIGtleUJ1ZmZlciA9IHRoaXMua2V5QnVmZmVyO1xyXG4gICAgdmFyIGtleUNoZWNrID0gdGhpcy5rZXlDaGVjaztcclxuICAgIHZhciBoYW5kbGUgPSBmYWxzZTtcclxuICAgIHN3aXRjaCAoZS5rZXlDb2RlKSB7XHJcbiAgICAgIGNhc2UgNzQ6XHJcbiAgICAgIGNhc2UgMzc6XHJcbiAgICAgIGNhc2UgMTAwOlxyXG4gICAgICAgIGtleUNoZWNrLmxlZnQgPSBmYWxzZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDczOlxyXG4gICAgICBjYXNlIDM4OlxyXG4gICAgICBjYXNlIDEwNDpcclxuICAgICAgICBrZXlDaGVjay51cCA9IGZhbHNlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgNzY6XHJcbiAgICAgIGNhc2UgMzk6XHJcbiAgICAgIGNhc2UgMTAyOlxyXG4gICAgICAgIGtleUNoZWNrLnJpZ2h0ID0gZmFsc2U7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA3NTpcclxuICAgICAgY2FzZSA0MDpcclxuICAgICAgY2FzZSA5ODpcclxuICAgICAgICBrZXlDaGVjay5kb3duID0gZmFsc2U7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA5MDpcclxuICAgICAgICBrZXlDaGVjay56ID0gZmFsc2U7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA4ODpcclxuICAgICAgICBrZXlDaGVjay54ID0gZmFsc2U7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIGlmIChoYW5kbGUpIHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICBlLnJldHVyblZhbHVlID0gZmFsc2U7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcbiAgLy/jgqTjg5njg7Pjg4jjgavjg5DjgqTjg7Pjg4njgZnjgotcclxuICBiaW5kKClcclxuICB7XHJcbiAgICBkMy5zZWxlY3QoJ2JvZHknKS5vbigna2V5ZG93bi5iYXNpY0lucHV0Jyx0aGlzLmtleWRvd24uYmluZCh0aGlzKSk7XHJcbiAgICBkMy5zZWxlY3QoJ2JvZHknKS5vbigna2V5dXAuYmFzaWNJbnB1dCcsdGhpcy5rZXl1cC5iaW5kKHRoaXMpKTtcclxuICB9XHJcbiAgLy8g44Ki44Oz44OQ44Kk44Oz44OJ44GZ44KLXHJcbiAgdW5iaW5kKClcclxuICB7XHJcbiAgICBkMy5zZWxlY3QoJ2JvZHknKS5vbigna2V5ZG93bi5iYXNpY0lucHV0JyxudWxsKTtcclxuICAgIGQzLnNlbGVjdCgnYm9keScpLm9uKCdrZXl1cC5iYXNpY0lucHV0JyxudWxsKTtcclxuICB9XHJcbiAgXHJcbiAgZ2V0IHVwKCkge1xyXG4gICAgcmV0dXJuIHRoaXMua2V5Q2hlY2sudXAgfHwgKHRoaXMuZ2FtZXBhZCAmJiAodGhpcy5nYW1lcGFkLmJ1dHRvbnNbMTJdLnByZXNzZWQgfHwgdGhpcy5nYW1lcGFkLmF4ZXNbMV0gPCAtMC4xKSk7XHJcbiAgfVxyXG5cclxuICBnZXQgZG93bigpIHtcclxuICAgIHJldHVybiB0aGlzLmtleUNoZWNrLmRvd24gfHwgKHRoaXMuZ2FtZXBhZCAmJiAodGhpcy5nYW1lcGFkLmJ1dHRvbnNbMTNdLnByZXNzZWQgfHwgdGhpcy5nYW1lcGFkLmF4ZXNbMV0gPiAwLjEpKTtcclxuICB9XHJcblxyXG4gIGdldCBsZWZ0KCkge1xyXG4gICAgcmV0dXJuIHRoaXMua2V5Q2hlY2subGVmdCB8fCAodGhpcy5nYW1lcGFkICYmICh0aGlzLmdhbWVwYWQuYnV0dG9uc1sxNF0ucHJlc3NlZCB8fCB0aGlzLmdhbWVwYWQuYXhlc1swXSA8IC0wLjEpKTtcclxuICB9XHJcblxyXG4gIGdldCByaWdodCgpIHtcclxuICAgIHJldHVybiB0aGlzLmtleUNoZWNrLnJpZ2h0IHx8ICh0aGlzLmdhbWVwYWQgJiYgKHRoaXMuZ2FtZXBhZC5idXR0b25zWzE1XS5wcmVzc2VkIHx8IHRoaXMuZ2FtZXBhZC5heGVzWzBdID4gMC4xKSk7XHJcbiAgfVxyXG4gIFxyXG4gIGdldCB6KCkge1xyXG4gICAgIGxldCByZXQgPSB0aGlzLmtleUNoZWNrLnogXHJcbiAgICB8fCAoKCghdGhpcy56QnV0dG9uIHx8ICh0aGlzLnpCdXR0b24gJiYgIXRoaXMuekJ1dHRvbikgKSAmJiB0aGlzLmdhbWVwYWQgJiYgdGhpcy5nYW1lcGFkLmJ1dHRvbnNbMF0ucHJlc3NlZCkpIDtcclxuICAgIHRoaXMuekJ1dHRvbiA9IHRoaXMuZ2FtZXBhZCAmJiB0aGlzLmdhbWVwYWQuYnV0dG9uc1swXS5wcmVzc2VkO1xyXG4gICAgcmV0dXJuIHJldDtcclxuICB9XHJcbiAgXHJcbiAgZ2V0IHN0YXJ0KCkge1xyXG4gICAgbGV0IHJldCA9ICgoIXRoaXMuc3RhcnRCdXR0b25fIHx8ICh0aGlzLnN0YXJ0QnV0dG9uXyAmJiAhdGhpcy5zdGFydEJ1dHRvbl8pICkgJiYgdGhpcy5nYW1lcGFkICYmIHRoaXMuZ2FtZXBhZC5idXR0b25zWzldLnByZXNzZWQpIDtcclxuICAgIHRoaXMuc3RhcnRCdXR0b25fID0gdGhpcy5nYW1lcGFkICYmIHRoaXMuZ2FtZXBhZC5idXR0b25zWzldLnByZXNzZWQ7XHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH1cclxuICBcclxuICBnZXQgYUJ1dHRvbigpe1xyXG4gICAgIGxldCByZXQgPSAoKCghdGhpcy5hQnV0dG9uXyB8fCAodGhpcy5hQnV0dG9uXyAmJiAhdGhpcy5hQnV0dG9uXykgKSAmJiB0aGlzLmdhbWVwYWQgJiYgdGhpcy5nYW1lcGFkLmJ1dHRvbnNbMF0ucHJlc3NlZCkpIDtcclxuICAgIHRoaXMuYUJ1dHRvbl8gPSB0aGlzLmdhbWVwYWQgJiYgdGhpcy5nYW1lcGFkLmJ1dHRvbnNbMF0ucHJlc3NlZDtcclxuICAgIHJldHVybiByZXQ7XHJcbiAgfVxyXG4gIFxyXG4gICp1cGRhdGUodGFza0luZGV4KVxyXG4gIHtcclxuICAgIHdoaWxlKHRhc2tJbmRleCA+PSAwKXtcclxuICAgICAgaWYod2luZG93Lm5hdmlnYXRvci5nZXRHYW1lcGFkcyl7XHJcbiAgICAgICAgdGhpcy5nYW1lcGFkID0gd2luZG93Lm5hdmlnYXRvci5nZXRHYW1lcGFkcygpWzBdO1xyXG4gICAgICB9IFxyXG4gICAgICB0YXNrSW5kZXggPSB5aWVsZDsgICAgIFxyXG4gICAgfVxyXG4gIH1cclxufSIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIENvbW0ge1xyXG4gIGNvbnN0cnVjdG9yKCl7XHJcbiAgICB2YXIgaG9zdCA9IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZS5tYXRjaCgvd3d3XFwuc2ZwZ21yXFwubmV0L2lnKT8nd3d3LnNmcGdtci5uZXQnOidsb2NhbGhvc3QnO1xyXG4gICAgdGhpcy5lbmFibGUgPSBmYWxzZTtcclxuICAgIHRyeSB7XHJcbiAgICAgIHRoaXMuc29ja2V0ID0gaW8uY29ubmVjdCgnaHR0cDovLycgKyBob3N0ICsgJzo4MDgxL3Rlc3QnKTtcclxuICAgICAgdGhpcy5lbmFibGUgPSB0cnVlO1xyXG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgIHRoaXMuc29ja2V0Lm9uKCdzZW5kSGlnaFNjb3JlcycsIChkYXRhKT0+e1xyXG4gICAgICAgIGlmKHRoaXMudXBkYXRlSGlnaFNjb3Jlcyl7XHJcbiAgICAgICAgICB0aGlzLnVwZGF0ZUhpZ2hTY29yZXMoZGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgdGhpcy5zb2NrZXQub24oJ3NlbmRIaWdoU2NvcmUnLCAoZGF0YSk9PntcclxuICAgICAgICB0aGlzLnVwZGF0ZUhpZ2hTY29yZShkYXRhKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLnNvY2tldC5vbignc2VuZFJhbmsnLCAoZGF0YSkgPT4ge1xyXG4gICAgICAgIHRoaXMudXBkYXRlSGlnaFNjb3JlcyhkYXRhLmhpZ2hTY29yZXMpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMuc29ja2V0Lm9uKCdlcnJvckNvbm5lY3Rpb25NYXgnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgYWxlcnQoJ+WQjOaZguaOpee2muOBruS4iumZkOOBq+mBlOOBl+OBvuOBl+OBn+OAgicpO1xyXG4gICAgICAgIHNlbGYuZW5hYmxlID0gZmFsc2U7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdGhpcy5zb2NrZXQub24oJ2Rpc2Nvbm5lY3QnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHNlbGYuZW5hYmxlKSB7XHJcbiAgICAgICAgICBzZWxmLmVuYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgYWxlcnQoJ+OCteODvOODkOODvOaOpee2muOBjOWIh+aWreOBleOCjOOBvuOBl+OBn+OAgicpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICBhbGVydCgnU29ja2V0LklP44GM5Yip55So44Gn44GN44Gq44GE44Gf44KB44CB44OP44Kk44K544Kz44Ki5oOF5aCx44GM5Y+W5b6X44Gn44GN44G+44Gb44KT44CCJyArIGUpO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBzZW5kU2NvcmUoc2NvcmUpXHJcbiAge1xyXG4gICAgaWYgKHRoaXMuZW5hYmxlKSB7XHJcbiAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ3NlbmRTY29yZScsIHNjb3JlKTtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgZGlzY29ubmVjdCgpXHJcbiAge1xyXG4gICAgaWYgKHRoaXMuZW5hYmxlKSB7XHJcbiAgICAgIHRoaXMuZW5hYmxlID0gZmFsc2U7XHJcbiAgICAgIHRoaXMuc29ja2V0LmRpc2Nvbm5lY3QoKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmltcG9ydCB7c2ZnfSBmcm9tICcuL2dsb2JhbC5qcyc7XHJcbi8vaW1wb3J0ICogIGFzIGdhbWVvYmogZnJvbSAnLi9nYW1lb2JqJztcclxuLy9pbXBvcnQgKiBhcyBncmFwaGljcyBmcm9tICcuL2dyYXBoaWNzJztcclxuXHJcbi8vLyDjg4bjgq3jgrnjg4jlsZ7mgKdcclxuZXhwb3J0IGNsYXNzIFRleHRBdHRyaWJ1dGUge1xyXG4gIGNvbnN0cnVjdG9yKGJsaW5rLCBmb250KSB7XHJcbiAgICBpZiAoYmxpbmspIHtcclxuICAgICAgdGhpcy5ibGluayA9IGJsaW5rO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5ibGluayA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgaWYgKGZvbnQpIHtcclxuICAgICAgdGhpcy5mb250ID0gZm9udDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuZm9udCA9IHNmZy50ZXh0dXJlRmlsZXMuZm9udDtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8vLyDjg4bjgq3jgrnjg4jjg5fjg6zjg7zjg7NcclxuZXhwb3J0IGNsYXNzIFRleHRQbGFuZXsgXHJcbiAgY29uc3RydWN0b3IgKHNjZW5lKSB7XHJcbiAgdGhpcy50ZXh0QnVmZmVyID0gbmV3IEFycmF5KHNmZy5URVhUX0hFSUdIVCk7XHJcbiAgdGhpcy5hdHRyQnVmZmVyID0gbmV3IEFycmF5KHNmZy5URVhUX0hFSUdIVCk7XHJcbiAgdGhpcy50ZXh0QmFja0J1ZmZlciA9IG5ldyBBcnJheShzZmcuVEVYVF9IRUlHSFQpO1xyXG4gIHRoaXMuYXR0ckJhY2tCdWZmZXIgPSBuZXcgQXJyYXkoc2ZnLlRFWFRfSEVJR0hUKTtcclxuICB2YXIgZW5kaSA9IHRoaXMudGV4dEJ1ZmZlci5sZW5ndGg7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbmRpOyArK2kpIHtcclxuICAgIHRoaXMudGV4dEJ1ZmZlcltpXSA9IG5ldyBBcnJheShzZmcuVEVYVF9XSURUSCk7XHJcbiAgICB0aGlzLmF0dHJCdWZmZXJbaV0gPSBuZXcgQXJyYXkoc2ZnLlRFWFRfV0lEVEgpO1xyXG4gICAgdGhpcy50ZXh0QmFja0J1ZmZlcltpXSA9IG5ldyBBcnJheShzZmcuVEVYVF9XSURUSCk7XHJcbiAgICB0aGlzLmF0dHJCYWNrQnVmZmVyW2ldID0gbmV3IEFycmF5KHNmZy5URVhUX1dJRFRIKTtcclxuICB9XHJcblxyXG5cclxuICAvLyDmj4/nlLvnlKjjgq3jg6Pjg7Pjg5Djgrnjga7jgrvjg4Pjg4jjgqLjg4Pjg5dcclxuXHJcbiAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICB2YXIgd2lkdGggPSAxO1xyXG4gIHdoaWxlICh3aWR0aCA8PSBzZmcuVklSVFVBTF9XSURUSCl7XHJcbiAgICB3aWR0aCAqPSAyO1xyXG4gIH1cclxuICB2YXIgaGVpZ2h0ID0gMTtcclxuICB3aGlsZSAoaGVpZ2h0IDw9IHNmZy5WSVJUVUFMX0hFSUdIVCl7XHJcbiAgICBoZWlnaHQgKj0gMjtcclxuICB9XHJcbiAgXHJcbiAgdGhpcy5jYW52YXMud2lkdGggPSB3aWR0aDtcclxuICB0aGlzLmNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gIHRoaXMudGV4dHVyZSA9IG5ldyBUSFJFRS5UZXh0dXJlKHRoaXMuY2FudmFzKTtcclxuICB0aGlzLnRleHR1cmUubWFnRmlsdGVyID0gVEhSRUUuTmVhcmVzdEZpbHRlcjtcclxuICB0aGlzLnRleHR1cmUubWluRmlsdGVyID0gVEhSRUUuTGluZWFyTWlwTWFwTGluZWFyRmlsdGVyO1xyXG4gIHRoaXMubWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBtYXA6IHRoaXMudGV4dHVyZSxhbHBoYVRlc3Q6MC41LCB0cmFuc3BhcmVudDogdHJ1ZSxkZXB0aFRlc3Q6dHJ1ZSxzaGFkaW5nOlRIUkVFLkZsYXRTaGFkaW5nfSk7XHJcbi8vICB0aGlzLmdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoc2ZnLlZJUlRVQUxfV0lEVEgsIHNmZy5WSVJUVUFMX0hFSUdIVCk7XHJcbiAgdGhpcy5nZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KHdpZHRoLCBoZWlnaHQpO1xyXG4gIHRoaXMubWVzaCA9IG5ldyBUSFJFRS5NZXNoKHRoaXMuZ2VvbWV0cnksIHRoaXMubWF0ZXJpYWwpO1xyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi56ID0gMC40O1xyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi54ID0gKHdpZHRoIC0gc2ZnLlZJUlRVQUxfV0lEVEgpIC8gMjtcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueSA9ICAtIChoZWlnaHQgLSBzZmcuVklSVFVBTF9IRUlHSFQpIC8gMjtcclxuICB0aGlzLmZvbnRzID0geyBmb250OiBzZmcudGV4dHVyZUZpbGVzLmZvbnQsIGZvbnQxOiBzZmcudGV4dHVyZUZpbGVzLmZvbnQxIH07XHJcbiAgdGhpcy5ibGlua0NvdW50ID0gMDtcclxuICB0aGlzLmJsaW5rID0gZmFsc2U7XHJcblxyXG4gIC8vIOOCueODoOODvOOCuOODs+OCsOOCkuWIh+OCi1xyXG4gIHRoaXMuY3R4Lm1zSW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgdGhpcy5jdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgLy90aGlzLmN0eC53ZWJraXRJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICB0aGlzLmN0eC5tb3pJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuXHJcbiAgdGhpcy5jbHMoKTtcclxuICBzY2VuZS5hZGQodGhpcy5tZXNoKTtcclxufVxyXG5cclxuICAvLy8g55S76Z2i5raI5Y67XHJcbiAgY2xzKCkge1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZGkgPSB0aGlzLnRleHRCdWZmZXIubGVuZ3RoOyBpIDwgZW5kaTsgKytpKSB7XHJcbiAgICAgIHZhciBsaW5lID0gdGhpcy50ZXh0QnVmZmVyW2ldO1xyXG4gICAgICB2YXIgYXR0cl9saW5lID0gdGhpcy5hdHRyQnVmZmVyW2ldO1xyXG4gICAgICB2YXIgbGluZV9iYWNrID0gdGhpcy50ZXh0QmFja0J1ZmZlcltpXTtcclxuICAgICAgdmFyIGF0dHJfbGluZV9iYWNrID0gdGhpcy5hdHRyQmFja0J1ZmZlcltpXTtcclxuXHJcbiAgICAgIGZvciAodmFyIGogPSAwLCBlbmRqID0gdGhpcy50ZXh0QnVmZmVyW2ldLmxlbmd0aDsgaiA8IGVuZGo7ICsraikge1xyXG4gICAgICAgIGxpbmVbal0gPSAweDIwO1xyXG4gICAgICAgIGF0dHJfbGluZVtqXSA9IDB4MDA7XHJcbiAgICAgICAgLy9saW5lX2JhY2tbal0gPSAweDIwO1xyXG4gICAgICAgIC8vYXR0cl9saW5lX2JhY2tbal0gPSAweDAwO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgc2ZnLlZJUlRVQUxfV0lEVEgsIHNmZy5WSVJUVUFMX0hFSUdIVCk7XHJcbiAgfVxyXG5cclxuICAvLy8g5paH5a2X6KGo56S644GZ44KLXHJcbiAgcHJpbnQoeCwgeSwgc3RyLCBhdHRyaWJ1dGUpIHtcclxuICAgIHZhciBsaW5lID0gdGhpcy50ZXh0QnVmZmVyW3ldO1xyXG4gICAgdmFyIGF0dHIgPSB0aGlzLmF0dHJCdWZmZXJbeV07XHJcbiAgICBpZiAoIWF0dHJpYnV0ZSkge1xyXG4gICAgICBhdHRyaWJ1dGUgPSAwO1xyXG4gICAgfVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyArK2kpIHtcclxuICAgICAgdmFyIGMgPSBzdHIuY2hhckNvZGVBdChpKTtcclxuICAgICAgaWYgKGMgPT0gMHhhKSB7XHJcbiAgICAgICAgKyt5O1xyXG4gICAgICAgIGlmICh5ID49IHRoaXMudGV4dEJ1ZmZlci5sZW5ndGgpIHtcclxuICAgICAgICAgIC8vIOOCueOCr+ODreODvOODq1xyXG4gICAgICAgICAgdGhpcy50ZXh0QnVmZmVyID0gdGhpcy50ZXh0QnVmZmVyLnNsaWNlKDEsIHRoaXMudGV4dEJ1ZmZlci5sZW5ndGggLSAxKTtcclxuICAgICAgICAgIHRoaXMudGV4dEJ1ZmZlci5wdXNoKG5ldyBBcnJheShzZmcuVklSVFVBTF9XSURUSCAvIDgpKTtcclxuICAgICAgICAgIHRoaXMuYXR0ckJ1ZmZlciA9IHRoaXMuYXR0ckJ1ZmZlci5zbGljZSgxLCB0aGlzLmF0dHJCdWZmZXIubGVuZ3RoIC0gMSk7XHJcbiAgICAgICAgICB0aGlzLmF0dHJCdWZmZXIucHVzaChuZXcgQXJyYXkoc2ZnLlZJUlRVQUxfV0lEVEggLyA4KSk7XHJcbiAgICAgICAgICAtLXk7XHJcbiAgICAgICAgICB2YXIgZW5kaiA9IHRoaXMudGV4dEJ1ZmZlclt5XS5sZW5ndGg7XHJcbiAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGVuZGo7ICsraikge1xyXG4gICAgICAgICAgICB0aGlzLnRleHRCdWZmZXJbeV1bal0gPSAweDIwO1xyXG4gICAgICAgICAgICB0aGlzLmF0dHJCdWZmZXJbeV1bal0gPSAweDAwO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBsaW5lID0gdGhpcy50ZXh0QnVmZmVyW3ldO1xyXG4gICAgICAgIGF0dHIgPSB0aGlzLmF0dHJCdWZmZXJbeV07XHJcbiAgICAgICAgeCA9IDA7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGluZVt4XSA9IGM7XHJcbiAgICAgICAgYXR0clt4XSA9IGF0dHJpYnV0ZTtcclxuICAgICAgICArK3g7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgLy8vIOODhuOCreOCueODiOODh+ODvOOCv+OCkuOCguOBqOOBq+ODhuOCr+OCueODgeODo+ODvOOBq+aPj+eUu+OBmeOCi1xyXG4gIHJlbmRlcigpIHtcclxuICAgIHZhciBjdHggPSB0aGlzLmN0eDtcclxuICAgIHRoaXMuYmxpbmtDb3VudCA9ICh0aGlzLmJsaW5rQ291bnQgKyAxKSAmIDB4ZjtcclxuXHJcbiAgICB2YXIgZHJhd19ibGluayA9IGZhbHNlO1xyXG4gICAgaWYgKCF0aGlzLmJsaW5rQ291bnQpIHtcclxuICAgICAgdGhpcy5ibGluayA9ICF0aGlzLmJsaW5rO1xyXG4gICAgICBkcmF3X2JsaW5rID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIHZhciB1cGRhdGUgPSBmYWxzZTtcclxuLy8gICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBDT05TT0xFX1dJRFRILCBDT05TT0xFX0hFSUdIVCk7XHJcbi8vICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcblxyXG4gICAgZm9yICh2YXIgeSA9IDAsIGd5ID0gMDsgeSA8IHNmZy5URVhUX0hFSUdIVDsgKyt5LCBneSArPSBzZmcuQUNUVUFMX0NIQVJfU0laRSkge1xyXG4gICAgICB2YXIgbGluZSA9IHRoaXMudGV4dEJ1ZmZlclt5XTtcclxuICAgICAgdmFyIGF0dHJfbGluZSA9IHRoaXMuYXR0ckJ1ZmZlclt5XTtcclxuICAgICAgdmFyIGxpbmVfYmFjayA9IHRoaXMudGV4dEJhY2tCdWZmZXJbeV07XHJcbiAgICAgIHZhciBhdHRyX2xpbmVfYmFjayA9IHRoaXMuYXR0ckJhY2tCdWZmZXJbeV07XHJcbiAgICAgIGZvciAodmFyIHggPSAwLCBneCA9IDA7IHggPCBzZmcuVEVYVF9XSURUSDsgKyt4LCBneCArPSBzZmcuQUNUVUFMX0NIQVJfU0laRSkge1xyXG4gICAgICAgIHZhciBwcm9jZXNzX2JsaW5rID0gKGF0dHJfbGluZVt4XSAmJiBhdHRyX2xpbmVbeF0uYmxpbmspO1xyXG4gICAgICAgIGlmIChsaW5lW3hdICE9IGxpbmVfYmFja1t4XSB8fCBhdHRyX2xpbmVbeF0gIT0gYXR0cl9saW5lX2JhY2tbeF0gfHwgKHByb2Nlc3NfYmxpbmsgJiYgZHJhd19ibGluaykpIHtcclxuICAgICAgICAgIHVwZGF0ZSA9IHRydWU7XHJcblxyXG4gICAgICAgICAgbGluZV9iYWNrW3hdID0gbGluZVt4XTtcclxuICAgICAgICAgIGF0dHJfbGluZV9iYWNrW3hdID0gYXR0cl9saW5lW3hdO1xyXG4gICAgICAgICAgdmFyIGMgPSAwO1xyXG4gICAgICAgICAgaWYgKCFwcm9jZXNzX2JsaW5rIHx8IHRoaXMuYmxpbmspIHtcclxuICAgICAgICAgICAgYyA9IGxpbmVbeF0gLSAweDIwO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdmFyIHlwb3MgPSAoYyA+PiA0KSA8PCAzO1xyXG4gICAgICAgICAgdmFyIHhwb3MgPSAoYyAmIDB4ZikgPDwgMztcclxuICAgICAgICAgIGN0eC5jbGVhclJlY3QoZ3gsIGd5LCBzZmcuQUNUVUFMX0NIQVJfU0laRSwgc2ZnLkFDVFVBTF9DSEFSX1NJWkUpO1xyXG4gICAgICAgICAgdmFyIGZvbnQgPSBhdHRyX2xpbmVbeF0gPyBhdHRyX2xpbmVbeF0uZm9udCA6IHNmZy50ZXh0dXJlRmlsZXMuZm9udDtcclxuICAgICAgICAgIGlmIChjKSB7XHJcbiAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoZm9udC5pbWFnZSwgeHBvcywgeXBvcywgc2ZnLkNIQVJfU0laRSwgc2ZnLkNIQVJfU0laRSwgZ3gsIGd5LCBzZmcuQUNUVUFMX0NIQVJfU0laRSwgc2ZnLkFDVFVBTF9DSEFSX1NJWkUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy50ZXh0dXJlLm5lZWRzVXBkYXRlID0gdXBkYXRlO1xyXG4gIH1cclxufVxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBDb2xsaXNpb25BcmVhIHtcclxuICBjb25zdHJ1Y3RvcihvZmZzZXRYLCBvZmZzZXRZLCB3aWR0aCwgaGVpZ2h0KVxyXG4gIHtcclxuICAgIHRoaXMub2Zmc2V0WCA9IG9mZnNldFggfHwgMDtcclxuICAgIHRoaXMub2Zmc2V0WSA9IG9mZnNldFkgfHwgMDtcclxuICAgIHRoaXMudG9wID0gMDtcclxuICAgIHRoaXMuYm90dG9tID0gMDtcclxuICAgIHRoaXMubGVmdCA9IDA7XHJcbiAgICB0aGlzLnJpZ2h0ID0gMDtcclxuICAgIHRoaXMud2lkdGggPSB3aWR0aCB8fCAwO1xyXG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQgfHwgMDtcclxuICAgIHRoaXMud2lkdGhfID0gMDtcclxuICAgIHRoaXMuaGVpZ2h0XyA9IDA7XHJcbiAgfVxyXG4gIGdldCB3aWR0aCgpIHsgcmV0dXJuIHRoaXMud2lkdGhfOyB9XHJcbiAgc2V0IHdpZHRoKHYpIHtcclxuICAgIHRoaXMud2lkdGhfID0gdjtcclxuICAgIHRoaXMubGVmdCA9IHRoaXMub2Zmc2V0WCAtIHYgLyAyO1xyXG4gICAgdGhpcy5yaWdodCA9IHRoaXMub2Zmc2V0WCArIHYgLyAyO1xyXG4gIH1cclxuICBnZXQgaGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5oZWlnaHRfOyB9XHJcbiAgc2V0IGhlaWdodCh2KSB7XHJcbiAgICB0aGlzLmhlaWdodF8gPSB2O1xyXG4gICAgdGhpcy50b3AgPSB0aGlzLm9mZnNldFkgKyB2IC8gMjtcclxuICAgIHRoaXMuYm90dG9tID0gdGhpcy5vZmZzZXRZIC0gdiAvIDI7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgR2FtZU9iaiB7XHJcbiAgY29uc3RydWN0b3IoeCwgeSwgeikge1xyXG4gICAgdGhpcy54XyA9IHggfHwgMDtcclxuICAgIHRoaXMueV8gPSB5IHx8IDA7XHJcbiAgICB0aGlzLnpfID0geiB8fCAwLjA7XHJcbiAgICB0aGlzLmVuYWJsZV8gPSBmYWxzZTtcclxuICAgIHRoaXMud2lkdGggPSAwO1xyXG4gICAgdGhpcy5oZWlnaHQgPSAwO1xyXG4gICAgdGhpcy5jb2xsaXNpb25BcmVhID0gbmV3IENvbGxpc2lvbkFyZWEoKTtcclxuICB9XHJcbiAgZ2V0IHgoKSB7IHJldHVybiB0aGlzLnhfOyB9XHJcbiAgc2V0IHgodikgeyB0aGlzLnhfID0gdjsgfVxyXG4gIGdldCB5KCkgeyByZXR1cm4gdGhpcy55XzsgfVxyXG4gIHNldCB5KHYpIHsgdGhpcy55XyA9IHY7IH1cclxuICBnZXQgeigpIHsgcmV0dXJuIHRoaXMuel87IH1cclxuICBzZXQgeih2KSB7IHRoaXMuel8gPSB2OyB9XHJcbn1cclxuXHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuaW1wb3J0IHtzZmd9IGZyb20gJy4vZ2xvYmFsLmpzJztcclxuaW1wb3J0ICogYXMgZ2FtZW9iaiBmcm9tICcuL2dhbWVvYmouanMnO1xyXG5pbXBvcnQgKiBhcyBncmFwaGljcyBmcm9tICcuL2dyYXBoaWNzLmpzJztcclxuXHJcbnZhciBteUJ1bGxldHMgPSBbXTtcclxuXHJcbi8vLyDoh6rmqZ/lvL4gXHJcbmV4cG9ydCBjbGFzcyBNeUJ1bGxldCBleHRlbmRzIGdhbWVvYmouR2FtZU9iaiB7XHJcbiAgY29uc3RydWN0b3Ioc2NlbmUsc2UpIHtcclxuICBzdXBlcigwLCAwLCAwKTtcclxuXHJcbiAgdGhpcy5jb2xsaXNpb25BcmVhLndpZHRoID0gNDtcclxuICB0aGlzLmNvbGxpc2lvbkFyZWEuaGVpZ2h0ID0gNjtcclxuICB0aGlzLnNwZWVkID0gODtcclxuICB0aGlzLnBvd2VyID0gMTtcclxuXHJcbiAgdGhpcy50ZXh0dXJlV2lkdGggPSBzZmcudGV4dHVyZUZpbGVzLm15c2hpcC5pbWFnZS53aWR0aDtcclxuICB0aGlzLnRleHR1cmVIZWlnaHQgPSBzZmcudGV4dHVyZUZpbGVzLm15c2hpcC5pbWFnZS5oZWlnaHQ7XHJcblxyXG4gIC8vIOODoeODg+OCt+ODpeOBruS9nOaIkOODu+ihqOekuiAvLy9cclxuXHJcbiAgdmFyIG1hdGVyaWFsID0gZ3JhcGhpY3MuY3JlYXRlU3ByaXRlTWF0ZXJpYWwoc2ZnLnRleHR1cmVGaWxlcy5teXNoaXApO1xyXG4gIHZhciBnZW9tZXRyeSA9IGdyYXBoaWNzLmNyZWF0ZVNwcml0ZUdlb21ldHJ5KDE2KTtcclxuICBncmFwaGljcy5jcmVhdGVTcHJpdGVVVihnZW9tZXRyeSwgc2ZnLnRleHR1cmVGaWxlcy5teXNoaXAsIDE2LCAxNiwgMSk7XHJcbiAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuXHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnggPSB0aGlzLnhfO1xyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi55ID0gdGhpcy55XztcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueiA9IHRoaXMuel87XHJcbiAgdGhpcy5zZSA9IHNlO1xyXG4gIC8vc2UoMCk7XHJcbiAgLy9zZXF1ZW5jZXIucGxheVRyYWNrcyhzb3VuZEVmZmVjdHMuc291bmRFZmZlY3RzWzBdKTtcclxuICBzY2VuZS5hZGQodGhpcy5tZXNoKTtcclxuICB0aGlzLm1lc2gudmlzaWJsZSA9IHRoaXMuZW5hYmxlXyA9IGZhbHNlO1xyXG4gIC8vICBzZmcudGFza3MucHVzaFRhc2soZnVuY3Rpb24gKHRhc2tJbmRleCkgeyBzZWxmLm1vdmUodGFza0luZGV4KTsgfSk7XHJcbiB9XHJcblxyXG4gIGdldCB4KCkgeyByZXR1cm4gdGhpcy54XzsgfVxyXG4gIHNldCB4KHYpIHsgdGhpcy54XyA9IHRoaXMubWVzaC5wb3NpdGlvbi54ID0gdjsgfVxyXG4gIGdldCB5KCkgeyByZXR1cm4gdGhpcy55XzsgfVxyXG4gIHNldCB5KHYpIHsgdGhpcy55XyA9IHRoaXMubWVzaC5wb3NpdGlvbi55ID0gdjsgfVxyXG4gIGdldCB6KCkgeyByZXR1cm4gdGhpcy56XzsgfVxyXG4gIHNldCB6KHYpIHsgdGhpcy56XyA9IHRoaXMubWVzaC5wb3NpdGlvbi56ID0gdjsgfVxyXG4gICptb3ZlKHRhc2tJbmRleCkge1xyXG4gICAgXHJcbiAgICB3aGlsZSAodGFza0luZGV4ID49IDAgXHJcbiAgICAgICYmIHRoaXMuZW5hYmxlX1xyXG4gICAgICAmJiB0aGlzLnkgPD0gKHNmZy5WX1RPUCArIDE2KSBcclxuICAgICAgJiYgdGhpcy55ID49IChzZmcuVl9CT1RUT00gLSAxNikgXHJcbiAgICAgICYmIHRoaXMueCA8PSAoc2ZnLlZfUklHSFQgKyAxNikgXHJcbiAgICAgICYmIHRoaXMueCA+PSAoc2ZnLlZfTEVGVCAtIDE2KSlcclxuICAgIHtcclxuICAgICAgXHJcbiAgICAgIHRoaXMueSArPSB0aGlzLmR5O1xyXG4gICAgICB0aGlzLnggKz0gdGhpcy5keDtcclxuICAgICAgXHJcbiAgICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gICAgfVxyXG5cclxuICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gICAgc2ZnLnRhc2tzLnJlbW92ZVRhc2sodGFza0luZGV4KTtcclxuICAgIHRoaXMuZW5hYmxlXyA9IHRoaXMubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcbn1cclxuXHJcbiAgc3RhcnQoeCwgeSwgeiwgYWltUmFkaWFuLHBvd2VyKSB7XHJcbiAgICBpZiAodGhpcy5lbmFibGVfKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHRoaXMueCA9IHg7XHJcbiAgICB0aGlzLnkgPSB5O1xyXG4gICAgdGhpcy56ID0geiAtIDAuMTtcclxuICAgIHRoaXMucG93ZXIgPSBwb3dlciB8IDE7XHJcbiAgICB0aGlzLmR4ID0gTWF0aC5jb3MoYWltUmFkaWFuKSAqIHRoaXMuc3BlZWQ7XHJcbiAgICB0aGlzLmR5ID0gTWF0aC5zaW4oYWltUmFkaWFuKSAqIHRoaXMuc3BlZWQ7XHJcbiAgICB0aGlzLmVuYWJsZV8gPSB0aGlzLm1lc2gudmlzaWJsZSA9IHRydWU7XHJcbiAgICB0aGlzLnNlKDApO1xyXG4gICAgLy9zZXF1ZW5jZXIucGxheVRyYWNrcyhzb3VuZEVmZmVjdHMuc291bmRFZmZlY3RzWzBdKTtcclxuICAgIHRoaXMudGFzayA9IHNmZy50YXNrcy5wdXNoVGFzayh0aGlzLm1vdmUuYmluZCh0aGlzKSk7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDoh6rmqZ/jgqrjg5bjgrjjgqfjgq/jg4hcclxuZXhwb3J0IGNsYXNzIE15U2hpcCBleHRlbmRzIGdhbWVvYmouR2FtZU9iaiB7IFxyXG4gIGNvbnN0cnVjdG9yKHgsIHksIHosc2NlbmUsc2UpIHtcclxuICBzdXBlcih4LCB5LCB6KTsvLyBleHRlbmRcclxuXHJcbiAgdGhpcy5jb2xsaXNpb25BcmVhLndpZHRoID0gNjtcclxuICB0aGlzLmNvbGxpc2lvbkFyZWEuaGVpZ2h0ID0gODtcclxuICB0aGlzLnNlID0gc2U7XHJcbiAgdGhpcy5zY2VuZSA9IHNjZW5lO1xyXG4gIHRoaXMudGV4dHVyZVdpZHRoID0gc2ZnLnRleHR1cmVGaWxlcy5teXNoaXAuaW1hZ2Uud2lkdGg7XHJcbiAgdGhpcy50ZXh0dXJlSGVpZ2h0ID0gc2ZnLnRleHR1cmVGaWxlcy5teXNoaXAuaW1hZ2UuaGVpZ2h0O1xyXG4gIHRoaXMud2lkdGggPSAxNjtcclxuICB0aGlzLmhlaWdodCA9IDE2O1xyXG5cclxuICAvLyDnp7vli5Xnr4Tlm7LjgpLmsYLjgoHjgotcclxuICB0aGlzLnRvcCA9IChzZmcuVl9UT1AgLSB0aGlzLmhlaWdodCAvIDIpIHwgMDtcclxuICB0aGlzLmJvdHRvbSA9IChzZmcuVl9CT1RUT00gKyB0aGlzLmhlaWdodCAvIDIpIHwgMDtcclxuICB0aGlzLmxlZnQgPSAoc2ZnLlZfTEVGVCArIHRoaXMud2lkdGggLyAyKSB8IDA7XHJcbiAgdGhpcy5yaWdodCA9IChzZmcuVl9SSUdIVCAtIHRoaXMud2lkdGggLyAyKSB8IDA7XHJcblxyXG4gIC8vIOODoeODg+OCt+ODpeOBruS9nOaIkOODu+ihqOekulxyXG4gIC8vIOODnuODhuODquOCouODq+OBruS9nOaIkFxyXG4gIHZhciBtYXRlcmlhbCA9IGdyYXBoaWNzLmNyZWF0ZVNwcml0ZU1hdGVyaWFsKHNmZy50ZXh0dXJlRmlsZXMubXlzaGlwKTtcclxuICAvLyDjgrjjgqrjg6Hjg4jjg6rjga7kvZzmiJBcclxuICB2YXIgZ2VvbWV0cnkgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVHZW9tZXRyeSh0aGlzLndpZHRoKTtcclxuICBncmFwaGljcy5jcmVhdGVTcHJpdGVVVihnZW9tZXRyeSwgc2ZnLnRleHR1cmVGaWxlcy5teXNoaXAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCAwKTtcclxuXHJcbiAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuXHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnggPSB0aGlzLnhfO1xyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi55ID0gdGhpcy55XztcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueiA9IHRoaXMuel87XHJcbiAgdGhpcy5yZXN0ID0gMztcclxuICB0aGlzLm15QnVsbGV0cyA9ICggKCk9PiB7XHJcbiAgICB2YXIgYXJyID0gW107XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDI7ICsraSkge1xyXG4gICAgICBhcnIucHVzaChuZXcgTXlCdWxsZXQodGhpcy5zY2VuZSx0aGlzLnNlKSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXJyO1xyXG4gIH0pKCk7XHJcbiAgc2NlbmUuYWRkKHRoaXMubWVzaCk7XHJcbiAgXHJcbiAgdGhpcy5idWxsZXRQb3dlciA9IDE7XHJcblxyXG59XHJcbiAgZ2V0IHgoKSB7IHJldHVybiB0aGlzLnhfOyB9XHJcbiAgc2V0IHgodikgeyB0aGlzLnhfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnggPSB2OyB9XHJcbiAgZ2V0IHkoKSB7IHJldHVybiB0aGlzLnlfOyB9XHJcbiAgc2V0IHkodikgeyB0aGlzLnlfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnkgPSB2OyB9XHJcbiAgZ2V0IHooKSB7IHJldHVybiB0aGlzLnpfOyB9XHJcbiAgc2V0IHoodikgeyB0aGlzLnpfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnogPSB2OyB9XHJcbiAgXHJcbiAgc2hvb3QoYWltUmFkaWFuKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gdGhpcy5teUJ1bGxldHMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgaWYgKHRoaXMubXlCdWxsZXRzW2ldLnN0YXJ0KHRoaXMueCwgdGhpcy55ICwgdGhpcy56LGFpbVJhZGlhbix0aGlzLmJ1bGxldFBvd2VyKSkge1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIGFjdGlvbihiYXNpY0lucHV0KSB7XHJcbiAgICBpZiAoYmFzaWNJbnB1dC5sZWZ0KSB7XHJcbiAgICAgIGlmICh0aGlzLnggPiB0aGlzLmxlZnQpIHtcclxuICAgICAgICB0aGlzLnggLT0gMjtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChiYXNpY0lucHV0LnJpZ2h0KSB7XHJcbiAgICAgIGlmICh0aGlzLnggPCB0aGlzLnJpZ2h0KSB7XHJcbiAgICAgICAgdGhpcy54ICs9IDI7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoYmFzaWNJbnB1dC51cCkge1xyXG4gICAgICBpZiAodGhpcy55IDwgdGhpcy50b3ApIHtcclxuICAgICAgICB0aGlzLnkgKz0gMjtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChiYXNpY0lucHV0LmRvd24pIHtcclxuICAgICAgaWYgKHRoaXMueSA+IHRoaXMuYm90dG9tKSB7XHJcbiAgICAgICAgdGhpcy55IC09IDI7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcblxyXG4gICAgaWYgKGJhc2ljSW5wdXQueikge1xyXG4gICAgICBiYXNpY0lucHV0LmtleUNoZWNrLnogPSBmYWxzZTtcclxuICAgICAgdGhpcy5zaG9vdCgwLjUgKiBNYXRoLlBJKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoYmFzaWNJbnB1dC54KSB7XHJcbiAgICAgIGJhc2ljSW5wdXQua2V5Q2hlY2sueCA9IGZhbHNlO1xyXG4gICAgICB0aGlzLnNob290KDEuNSAqIE1hdGguUEkpO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBoaXQoKSB7XHJcbiAgICB0aGlzLm1lc2gudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgc2ZnLmJvbWJzLnN0YXJ0KHRoaXMueCwgdGhpcy55LCAwLjIpO1xyXG4gICAgdGhpcy5zZSg0KTtcclxuICB9XHJcbiAgXHJcbiAgcmVzZXQoKXtcclxuICAgIHRoaXMubXlCdWxsZXRzLmZvckVhY2goKGQpPT57XHJcbiAgICAgIGlmKGQuZW5hYmxlXyl7XHJcbiAgICAgICAgd2hpbGUoIXNmZy50YXNrcy5hcnJheVtkLnRhc2suaW5kZXhdLmdlbkluc3QubmV4dCgtKDEgKyBkLnRhc2suaW5kZXgpKS5kb25lKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIFxyXG4gIGluaXQoKXtcclxuICAgICAgdGhpcy54ID0gMDtcclxuICAgICAgdGhpcy55ID0gLTEwMDtcclxuICAgICAgdGhpcy56ID0gMC4xO1xyXG4gICAgICB0aGlzLm1lc2gudmlzaWJsZSA9IHRydWU7XHJcbiAgfVxyXG5cclxufSIsIlwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgKiAgYXMgZ2FtZW9iaiBmcm9tICcuL2dhbWVvYmouanMnO1xyXG5pbXBvcnQge3NmZ30gZnJvbSAnLi9nbG9iYWwuanMnO1xyXG5pbXBvcnQgKiBhcyBncmFwaGljcyBmcm9tICcuL2dyYXBoaWNzLmpzJztcclxuXHJcbi8vLyDmlbXlvL5cclxuZXhwb3J0IGNsYXNzIEVuZW15QnVsbGV0IGV4dGVuZHMgZ2FtZW9iai5HYW1lT2JqIHtcclxuICBjb25zdHJ1Y3RvcihzY2VuZSwgc2UpIHtcclxuICAgIHN1cGVyKDAsIDAsIDApO1xyXG4gICAgdGhpcy5OT05FID0gMDtcclxuICAgIHRoaXMuTU9WRSA9IDE7XHJcbiAgICB0aGlzLkJPTUIgPSAyO1xyXG4gICAgdGhpcy5jb2xsaXNpb25BcmVhLndpZHRoID0gMjtcclxuICAgIHRoaXMuY29sbGlzaW9uQXJlYS5oZWlnaHQgPSAyO1xyXG4gICAgdmFyIHRleCA9IHNmZy50ZXh0dXJlRmlsZXMuZW5lbXk7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVNYXRlcmlhbCh0ZXgpO1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gZ3JhcGhpY3MuY3JlYXRlU3ByaXRlR2VvbWV0cnkoMTYpO1xyXG4gICAgZ3JhcGhpY3MuY3JlYXRlU3ByaXRlVVYoZ2VvbWV0cnksIHRleCwgMTYsIDE2LCAwKTtcclxuICAgIHRoaXMubWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgICB0aGlzLnogPSAwLjA7XHJcbiAgICB0aGlzLm12UGF0dGVybiA9IG51bGw7XHJcbiAgICB0aGlzLm12ID0gbnVsbDtcclxuICAgIHRoaXMubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICB0aGlzLnR5cGUgPSBudWxsO1xyXG4gICAgdGhpcy5saWZlID0gMDtcclxuICAgIHRoaXMuZHggPSAwO1xyXG4gICAgdGhpcy5keSA9IDA7XHJcbiAgICB0aGlzLnNwZWVkID0gMi4wO1xyXG4gICAgdGhpcy5lbmFibGUgPSBmYWxzZTtcclxuICAgIHRoaXMuaGl0XyA9IG51bGw7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuTk9ORTtcclxuICAgIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuICAgIHNjZW5lLmFkZCh0aGlzLm1lc2gpO1xyXG4gICAgdGhpcy5zZSA9IHNlO1xyXG4gIH1cclxuXHJcbiAgZ2V0IHgoKSB7IHJldHVybiB0aGlzLnhfOyB9XHJcbiAgc2V0IHgodikgeyB0aGlzLnhfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnggPSB2OyB9XHJcbiAgZ2V0IHkoKSB7IHJldHVybiB0aGlzLnlfOyB9XHJcbiAgc2V0IHkodikgeyB0aGlzLnlfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnkgPSB2OyB9XHJcbiAgZ2V0IHooKSB7IHJldHVybiB0aGlzLnpfOyB9XHJcbiAgc2V0IHoodikgeyB0aGlzLnpfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnogPSB2OyB9XHJcbiAgZ2V0IGVuYWJsZSgpIHtcclxuICAgIHJldHVybiB0aGlzLmVuYWJsZV87XHJcbiAgfVxyXG4gIFxyXG4gIHNldCBlbmFibGUodikge1xyXG4gICAgdGhpcy5lbmFibGVfID0gdjtcclxuICAgIHRoaXMubWVzaC52aXNpYmxlID0gdjtcclxuICB9XHJcbiAgXHJcbiAgKm1vdmUodGFza0luZGV4KSB7XHJcbiAgICBmb3IoO3RoaXMueCA+PSAoc2ZnLlZfTEVGVCAtIDE2KSAmJlxyXG4gICAgICAgIHRoaXMueCA8PSAoc2ZnLlZfUklHSFQgKyAxNikgJiZcclxuICAgICAgICB0aGlzLnkgPj0gKHNmZy5WX0JPVFRPTSAtIDE2KSAmJlxyXG4gICAgICAgIHRoaXMueSA8PSAoc2ZnLlZfVE9QICsgMTYpICYmIHRhc2tJbmRleCA+PSAwO1xyXG4gICAgICAgIHRoaXMueCArPSB0aGlzLmR4LHRoaXMueSArPSB0aGlzLmR5KVxyXG4gICAge1xyXG4gICAgICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgaWYodGFza0luZGV4ID49IDApe1xyXG4gICAgICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICAgIH1cclxuICAgIHRoaXMubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuTk9ORTtcclxuICAgIHRoaXMuZW5hYmxlID0gZmFsc2U7XHJcbiAgICBzZmcudGFza3MucmVtb3ZlVGFzayh0YXNrSW5kZXgpO1xyXG4gIH1cclxuICAgXHJcbiAgc3RhcnQoeCwgeSwgeikge1xyXG4gICAgaWYgKHRoaXMuZW5hYmxlKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHRoaXMueCA9IHggfHwgMDtcclxuICAgIHRoaXMueSA9IHkgfHwgMDtcclxuICAgIHRoaXMueiA9IHogfHwgMDtcclxuICAgIHRoaXMuZW5hYmxlID0gdHJ1ZTtcclxuICAgIGlmICh0aGlzLnN0YXR1cyAhPSB0aGlzLk5PTkUpXHJcbiAgICB7XHJcbiAgICAgIGRlYnVnZ2VyO1xyXG4gICAgfVxyXG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLk1PVkU7XHJcbiAgICB2YXIgYWltUmFkaWFuID0gTWF0aC5hdGFuMihzZmcubXlzaGlwXy55IC0geSwgc2ZnLm15c2hpcF8ueCAtIHgpO1xyXG4gICAgdGhpcy5tZXNoLnJvdGF0aW9uLnogPSBhaW1SYWRpYW47XHJcbiAgICB0aGlzLmR4ID0gTWF0aC5jb3MoYWltUmFkaWFuKSAqICh0aGlzLnNwZWVkICsgc2ZnLnN0YWdlLmRpZmZpY3VsdHkpO1xyXG4gICAgdGhpcy5keSA9IE1hdGguc2luKGFpbVJhZGlhbikgKiAodGhpcy5zcGVlZCArIHNmZy5zdGFnZS5kaWZmaWN1bHR5KTtcclxuLy8gICAgY29uc29sZS5sb2coJ2R4OicgKyB0aGlzLmR4ICsgJyBkeTonICsgdGhpcy5keSk7XHJcblxyXG4gICAgdGhpcy50YXNrID0gc2ZnLnRhc2tzLnB1c2hUYXNrKHRoaXMubW92ZS5iaW5kKHRoaXMpKTtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuIFxyXG4gIGhpdCgpIHtcclxuICAgIHRoaXMuZW5hYmxlID0gZmFsc2U7XHJcbiAgICBzZmcudGFza3MucmVtb3ZlVGFzayh0aGlzLnRhc2suaW5kZXgpO1xyXG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLk5PTkU7XHJcbiAgfVxyXG59XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIEVuZW15QnVsbGV0cyB7XHJcbiAgY29uc3RydWN0b3Ioc2NlbmUsIHNlKSB7XHJcbiAgICB0aGlzLnNjZW5lID0gc2NlbmU7XHJcbiAgICB0aGlzLmVuZW15QnVsbGV0cyA9IFtdO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA0ODsgKytpKSB7XHJcbiAgICAgIHRoaXMuZW5lbXlCdWxsZXRzLnB1c2gobmV3IEVuZW15QnVsbGV0KHRoaXMuc2NlbmUsIHNlKSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHN0YXJ0KHgsIHksIHopIHtcclxuICAgIHZhciBlYnMgPSB0aGlzLmVuZW15QnVsbGV0cztcclxuICAgIGZvcih2YXIgaSA9IDAsZW5kID0gZWJzLmxlbmd0aDtpPCBlbmQ7KytpKXtcclxuICAgICAgaWYoIWVic1tpXS5lbmFibGUpe1xyXG4gICAgICAgIGVic1tpXS5zdGFydCh4LCB5LCB6KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICByZXNldCgpXHJcbiAge1xyXG4gICAgdGhpcy5lbmVteUJ1bGxldHMuZm9yRWFjaCgoZCxpKT0+e1xyXG4gICAgICBpZihkLmVuYWJsZSl7XHJcbiAgICAgICAgd2hpbGUoIXNmZy50YXNrcy5hcnJheVtkLnRhc2suaW5kZXhdLmdlbkluc3QubmV4dCgtKDEgKyBkLnRhc2suaW5kZXgpKS5kb25lKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g5pW144Kt44Oj44Op44Gu5YuV44GNIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuLy8vIOebtOe3mumBi+WLlVxyXG5jbGFzcyBMaW5lTW92ZSB7XHJcbiAgY29uc3RydWN0b3IocmFkLCBzcGVlZCwgc3RlcCkge1xyXG4gICAgdGhpcy5yYWQgPSByYWQ7XHJcbiAgICB0aGlzLnNwZWVkID0gc3BlZWQ7XHJcbiAgICB0aGlzLnN0ZXAgPSBzdGVwO1xyXG4gICAgdGhpcy5jdXJyZW50U3RlcCA9IHN0ZXA7XHJcbiAgICB0aGlzLmR4ID0gTWF0aC5jb3MocmFkKSAqIHNwZWVkO1xyXG4gICAgdGhpcy5keSA9IE1hdGguc2luKHJhZCkgKiBzcGVlZDtcclxuICB9XHJcbiAgXHJcbiAgKm1vdmUoc2VsZix4LHkpIFxyXG4gIHtcclxuICAgIFxyXG4gICAgaWYgKHNlbGYueHJldikge1xyXG4gICAgICBzZWxmLmNoYXJSYWQgPSBNYXRoLlBJIC0gKHRoaXMucmFkIC0gTWF0aC5QSSAvIDIpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2VsZi5jaGFyUmFkID0gdGhpcy5yYWQgLSBNYXRoLlBJIC8gMjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgbGV0IGR5ID0gdGhpcy5keTtcclxuICAgIGxldCBkeCA9IHRoaXMuZHg7XHJcbiAgICBjb25zdCBzdGVwID0gdGhpcy5zdGVwO1xyXG4gICAgXHJcbiAgICBpZihzZWxmLnhyZXYpe1xyXG4gICAgICBkeCA9IC1keDsgICAgICBcclxuICAgIH1cclxuICAgIGxldCBjYW5jZWwgPSBmYWxzZTtcclxuICAgIGZvcihsZXQgaSA9IDA7aSA8IHN0ZXAgJiYgIWNhbmNlbDsrK2kpe1xyXG4gICAgICBzZWxmLnggKz0gZHg7XHJcbiAgICAgIHNlbGYueSArPSBkeTtcclxuICAgICAgY2FuY2VsID0geWllbGQ7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIGNsb25lKCl7XHJcbiAgICByZXR1cm4gbmV3IExpbmVNb3ZlKHRoaXMucmFkLHRoaXMuc3BlZWQsdGhpcy5zdGVwKTtcclxuICB9XHJcbiAgXHJcbiAgdG9KU09OKCl7XHJcbiAgICByZXR1cm4gW1xyXG4gICAgICBcIkxpbmVNb3ZlXCIsXHJcbiAgICAgIHRoaXMucmFkLFxyXG4gICAgICB0aGlzLnNwZWVkLFxyXG4gICAgICB0aGlzLnN0ZXBcclxuICAgIF07XHJcbiAgfVxyXG4gIFxyXG4gIHN0YXRpYyBmcm9tQXJyYXkoYXJyYXkpXHJcbiAge1xyXG4gICAgcmV0dXJuIG5ldyBMaW5lTW92ZShhcnJheVsxXSxhcnJheVsyXSxhcnJheVszXSk7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g5YaG6YGL5YuVXHJcbmNsYXNzIENpcmNsZU1vdmUge1xyXG4gIGNvbnN0cnVjdG9yKHN0YXJ0UmFkLCBzdG9wUmFkLCByLCBzcGVlZCwgbGVmdCkge1xyXG4gICAgdGhpcy5zdGFydFJhZCA9IChzdGFydFJhZCB8fCAwKTtcclxuICAgIHRoaXMuc3RvcFJhZCA9ICAoc3RvcFJhZCB8fCAxLjApO1xyXG4gICAgdGhpcy5yID0gciB8fCAxMDA7XHJcbiAgICB0aGlzLnNwZWVkID0gc3BlZWQgfHwgMS4wO1xyXG4gICAgdGhpcy5sZWZ0ID0gIWxlZnQgPyBmYWxzZSA6IHRydWU7XHJcbiAgICB0aGlzLmRlbHRhcyA9IFtdO1xyXG4gICAgdGhpcy5zdGFydFJhZF8gPSB0aGlzLnN0YXJ0UmFkICogTWF0aC5QSTtcclxuICAgIHRoaXMuc3RvcFJhZF8gPSB0aGlzLnN0b3BSYWQgKiBNYXRoLlBJO1xyXG4gICAgbGV0IHJhZCA9IHRoaXMuc3RhcnRSYWRfO1xyXG4gICAgbGV0IHN0ZXAgPSAobGVmdCA/IDEgOiAtMSkgKiB0aGlzLnNwZWVkIC8gcjtcclxuICAgIGxldCBlbmQgPSBmYWxzZTtcclxuICAgIFxyXG4gICAgd2hpbGUgKCFlbmQpIHtcclxuICAgICAgcmFkICs9IHN0ZXA7XHJcbiAgICAgIGlmICgobGVmdCAmJiAocmFkID49IHRoaXMuc3RvcFJhZF8pKSB8fCAoIWxlZnQgJiYgcmFkIDw9IHRoaXMuc3RvcFJhZF8pKSB7XHJcbiAgICAgICAgcmFkID0gdGhpcy5zdG9wUmFkXztcclxuICAgICAgICBlbmQgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuZGVsdGFzLnB1c2goe1xyXG4gICAgICAgIHg6IHRoaXMuciAqIE1hdGguY29zKHJhZCksXHJcbiAgICAgICAgeTogdGhpcy5yICogTWF0aC5zaW4ocmFkKSxcclxuICAgICAgICByYWQ6IHJhZFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBcclxuICAqbW92ZShzZWxmLHgseSkge1xyXG4gICAgLy8g5Yid5pyf5YyWXHJcbiAgICBsZXQgc3gsc3k7XHJcbiAgICBpZiAoc2VsZi54cmV2KSB7XHJcbiAgICAgIHN4ID0geCAtIHRoaXMuciAqIE1hdGguY29zKHRoaXMuc3RhcnRSYWRfICsgTWF0aC5QSSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzeCA9IHggLSB0aGlzLnIgKiBNYXRoLmNvcyh0aGlzLnN0YXJ0UmFkXyk7XHJcbiAgICB9XHJcbiAgICBzeSA9IHkgLSB0aGlzLnIgKiBNYXRoLnNpbih0aGlzLnN0YXJ0UmFkXyk7XHJcblxyXG4gICAgbGV0IGNhbmNlbCA9IGZhbHNlO1xyXG4gICAgLy8g56e75YuVXHJcbiAgICBmb3IobGV0IGkgPSAwLGUgPSB0aGlzLmRlbHRhcy5sZW5ndGg7KGkgPCBlKSAmJiAhY2FuY2VsOysraSlcclxuICAgIHtcclxuICAgICAgdmFyIGRlbHRhID0gdGhpcy5kZWx0YXNbaV07XHJcbiAgICAgIGlmKHNlbGYueHJldil7XHJcbiAgICAgICAgc2VsZi54ID0gc3ggLSBkZWx0YS54O1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNlbGYueCA9IHN4ICsgZGVsdGEueDtcclxuICAgICAgfVxyXG5cclxuICAgICAgc2VsZi55ID0gc3kgKyBkZWx0YS55O1xyXG4gICAgICBpZiAoc2VsZi54cmV2KSB7XHJcbiAgICAgICAgc2VsZi5jaGFyUmFkID0gKE1hdGguUEkgLSBkZWx0YS5yYWQpICsgKHRoaXMubGVmdCA/IC0xIDogMCkgKiBNYXRoLlBJO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNlbGYuY2hhclJhZCA9IGRlbHRhLnJhZCArICh0aGlzLmxlZnQgPyAwIDogLTEpICogTWF0aC5QSTtcclxuICAgICAgfVxyXG4gICAgICBzZWxmLnJhZCA9IGRlbHRhLnJhZDtcclxuICAgICAgY2FuY2VsID0geWllbGQ7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIHRvSlNPTigpe1xyXG4gICAgcmV0dXJuIFsgJ0NpcmNsZU1vdmUnLFxyXG4gICAgICB0aGlzLnN0YXJ0UmFkLFxyXG4gICAgICB0aGlzLnN0b3BSYWQsXHJcbiAgICAgIHRoaXMucixcclxuICAgICAgdGhpcy5zcGVlZCxcclxuICAgICAgdGhpcy5sZWZ0XHJcbiAgICBdO1xyXG4gIH1cclxuICBcclxuICBjbG9uZSgpe1xyXG4gICAgcmV0dXJuIG5ldyBDaXJjbGVNb3ZlKHRoaXMuc3RhcnRSYWQsdGhpcy5zdG9wUmFkLHRoaXMucix0aGlzLnNwZWVkLHRoaXMubGVmdCk7XHJcbiAgfVxyXG4gIFxyXG4gIHN0YXRpYyBmcm9tQXJyYXkoYSl7XHJcbiAgICByZXR1cm4gbmV3IENpcmNsZU1vdmUoYVsxXSxhWzJdLGFbM10sYVs0XSxhWzVdKTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDjg5vjg7zjg6Djg53jgrjjgrfjg6fjg7PjgavmiLvjgotcclxuY2xhc3MgR290b0hvbWUge1xyXG5cclxuICptb3ZlKHNlbGYsIHgsIHkpIHtcclxuICAgIGxldCByYWQgPSBNYXRoLmF0YW4yKHNlbGYuaG9tZVkgLSBzZWxmLnksIHNlbGYuaG9tZVggLSBzZWxmLngpO1xyXG4gICAgbGV0IHNwZWVkID0gNDtcclxuXHJcbiAgICBzZWxmLmNoYXJSYWQgPSByYWQgLSBNYXRoLlBJIC8gMjtcclxuICAgIGxldCBkeCA9IE1hdGguY29zKHJhZCkgKiBzcGVlZDtcclxuICAgIGxldCBkeSA9IE1hdGguc2luKHJhZCkgKiBzcGVlZDtcclxuICAgIHNlbGYueiA9IDAuMDtcclxuICAgIFxyXG4gICAgbGV0IGNhbmNlbCA9IGZhbHNlO1xyXG4gICAgZm9yKDsoTWF0aC5hYnMoc2VsZi54IC0gc2VsZi5ob21lWCkgPj0gMiB8fCBNYXRoLmFicyhzZWxmLnkgLSBzZWxmLmhvbWVZKSA+PSAyKSAmJiAhY2FuY2VsXHJcbiAgICAgIDtzZWxmLnggKz0gZHgsc2VsZi55ICs9IGR5KVxyXG4gICAge1xyXG4gICAgICBjYW5jZWwgPSB5aWVsZDtcclxuICAgIH1cclxuXHJcbiAgICBzZWxmLmNoYXJSYWQgPSAwO1xyXG4gICAgc2VsZi54ID0gc2VsZi5ob21lWDtcclxuICAgIHNlbGYueSA9IHNlbGYuaG9tZVk7XHJcbiAgICBpZiAoc2VsZi5zdGF0dXMgPT0gc2VsZi5TVEFSVCkge1xyXG4gICAgICB2YXIgZ3JvdXBJRCA9IHNlbGYuZ3JvdXBJRDtcclxuICAgICAgdmFyIGdyb3VwRGF0YSA9IHNlbGYuZW5lbWllcy5ncm91cERhdGE7XHJcbiAgICAgIGdyb3VwRGF0YVtncm91cElEXS5wdXNoKHNlbGYpO1xyXG4gICAgICBzZWxmLmVuZW1pZXMuaG9tZUVuZW1pZXNDb3VudCsrO1xyXG4gICAgfVxyXG4gICAgc2VsZi5zdGF0dXMgPSBzZWxmLkhPTUU7XHJcbiAgfVxyXG4gIFxyXG4gIGNsb25lKClcclxuICB7XHJcbiAgICByZXR1cm4gbmV3IEdvdG9Ib21lKCk7XHJcbiAgfVxyXG4gIFxyXG4gIHRvSlNPTigpe1xyXG4gICAgcmV0dXJuIFsnR290b0hvbWUnXTtcclxuICB9XHJcbiAgXHJcbiAgc3RhdGljIGZyb21BcnJheShhKVxyXG4gIHtcclxuICAgIHJldHVybiBuZXcgR290b0hvbWUoKTtcclxuICB9XHJcbn1cclxuXHJcblxyXG4vLy8g5b6F5qmf5Lit44Gu5pW144Gu5YuV44GNXHJcbmNsYXNzIEhvbWVNb3Zle1xyXG4gIGNvbnN0cnVjdG9yKCl7XHJcbiAgICB0aGlzLkNFTlRFUl9YID0gMDtcclxuICAgIHRoaXMuQ0VOVEVSX1kgPSAxMDA7XHJcbiAgfVxyXG5cclxuICAqbW92ZShzZWxmLCB4LCB5KSB7XHJcblxyXG4gICAgbGV0IGR4ID0gc2VsZi5ob21lWCAtIHRoaXMuQ0VOVEVSX1g7XHJcbiAgICBsZXQgZHkgPSBzZWxmLmhvbWVZIC0gdGhpcy5DRU5URVJfWTtcclxuICAgIHNlbGYueiA9IC0wLjE7XHJcblxyXG4gICAgd2hpbGUoc2VsZi5zdGF0dXMgIT0gc2VsZi5BVFRBQ0spXHJcbiAgICB7XHJcbiAgICAgIHNlbGYueCA9IHNlbGYuaG9tZVggKyBkeCAqIHNlbGYuZW5lbWllcy5ob21lRGVsdGE7XHJcbiAgICAgIHNlbGYueSA9IHNlbGYuaG9tZVkgKyBkeSAqIHNlbGYuZW5lbWllcy5ob21lRGVsdGE7XHJcbiAgICAgIHNlbGYubWVzaC5zY2FsZS54ID0gc2VsZi5lbmVtaWVzLmhvbWVEZWx0YTI7XHJcbiAgICAgIHlpZWxkO1xyXG4gICAgfVxyXG5cclxuICAgIHNlbGYubWVzaC5zY2FsZS54ID0gMS4wO1xyXG4gICAgc2VsZi56ID0gMC4wO1xyXG5cclxuICB9XHJcbiAgXHJcbiAgY2xvbmUoKXtcclxuICAgIHJldHVybiBuZXcgSG9tZU1vdmUoKTtcclxuICB9XHJcbiAgXHJcbiAgdG9KU09OKCl7XHJcbiAgICByZXR1cm4gWydIb21lTW92ZSddO1xyXG4gIH1cclxuICBcclxuICBzdGF0aWMgZnJvbUFycmF5KGEpXHJcbiAge1xyXG4gICAgcmV0dXJuIG5ldyBIb21lTW92ZSgpO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOaMh+WumuOCt+ODvOOCseODs+OCueOBq+enu+WLleOBmeOCi1xyXG5jbGFzcyBHb3RvIHtcclxuICBjb25zdHJ1Y3Rvcihwb3MpIHsgdGhpcy5wb3MgPSBwb3M7IH07XHJcbiAgKm1vdmUoc2VsZiwgeCwgeSkge1xyXG4gICAgc2VsZi5pbmRleCA9IHRoaXMucG9zIC0gMTtcclxuICB9XHJcbiAgXHJcbiAgdG9KU09OKCl7XHJcbiAgICByZXR1cm4gW1xyXG4gICAgICAnR290bycsXHJcbiAgICAgIHRoaXMucG9zXHJcbiAgICBdO1xyXG4gIH1cclxuICBcclxuICBjbG9uZSgpe1xyXG4gICAgcmV0dXJuIG5ldyBHb3RvKHRoaXMucG9zKTtcclxuICB9XHJcbiAgXHJcbiAgc3RhdGljIGZyb21BcnJheShhKXtcclxuICAgIHJldHVybiBuZXcgR290byhhWzFdKTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDmlbXlvL7nmbrlsIRcclxuY2xhc3MgRmlyZSB7XHJcbiAgKm1vdmUoc2VsZiwgeCwgeSkge1xyXG4gICAgbGV0IGQgPSAoc2ZnLnN0YWdlLm5vIC8gMjApICogKCBzZmcuc3RhZ2UuZGlmZmljdWx0eSk7XHJcbiAgICBpZiAoZCA+IDEpIHsgZCA9IDEuMDt9XHJcbiAgICBpZiAoTWF0aC5yYW5kb20oKSA8IGQpIHtcclxuICAgICAgc2VsZi5lbmVtaWVzLmVuZW15QnVsbGV0cy5zdGFydChzZWxmLngsIHNlbGYueSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIGNsb25lKCl7XHJcbiAgICByZXR1cm4gbmV3IEZpcmUoKTtcclxuICB9XHJcbiAgXHJcbiAgdG9KU09OKCl7XHJcbiAgICByZXR1cm4gWydGaXJlJ107XHJcbiAgfVxyXG4gIFxyXG4gIHN0YXRpYyBmcm9tQXJyYXkoYSlcclxuICB7XHJcbiAgICByZXR1cm4gbmV3IEZpcmUoKTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDmlbXmnKzkvZNcclxuZXhwb3J0IGNsYXNzIEVuZW15IGV4dGVuZHMgZ2FtZW9iai5HYW1lT2JqIHsgXHJcbiAgY29uc3RydWN0b3IoZW5lbWllcyxzY2VuZSxzZSkge1xyXG4gIHN1cGVyKDAsIDAsIDApO1xyXG4gIHRoaXMuTk9ORSA9ICAwIDtcclxuICB0aGlzLlNUQVJUID0gIDEgO1xyXG4gIHRoaXMuSE9NRSA9ICAyIDtcclxuICB0aGlzLkFUVEFDSyA9ICAzIDtcclxuICB0aGlzLkJPTUIgPSAgNCA7XHJcbiAgdGhpcy5jb2xsaXNpb25BcmVhLndpZHRoID0gMTI7XHJcbiAgdGhpcy5jb2xsaXNpb25BcmVhLmhlaWdodCA9IDg7XHJcbiAgdmFyIHRleCA9IHNmZy50ZXh0dXJlRmlsZXMuZW5lbXk7XHJcbiAgdmFyIG1hdGVyaWFsID0gZ3JhcGhpY3MuY3JlYXRlU3ByaXRlTWF0ZXJpYWwodGV4KTtcclxuICB2YXIgZ2VvbWV0cnkgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVHZW9tZXRyeSgxNik7XHJcbiAgZ3JhcGhpY3MuY3JlYXRlU3ByaXRlVVYoZ2VvbWV0cnksIHRleCwgMTYsIDE2LCAwKTtcclxuICB0aGlzLm1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gIHRoaXMuZ3JvdXBJRCA9IDA7XHJcbiAgdGhpcy56ID0gMC4wO1xyXG4gIHRoaXMuaW5kZXggPSAwO1xyXG4gIHRoaXMuc2NvcmUgPSAwO1xyXG4gIHRoaXMubXZQYXR0ZXJuID0gbnVsbDtcclxuICB0aGlzLm12ID0gbnVsbDtcclxuICB0aGlzLm1lc2gudmlzaWJsZSA9IGZhbHNlO1xyXG4gIHRoaXMuc3RhdHVzID0gdGhpcy5OT05FO1xyXG4gIHRoaXMudHlwZSA9IG51bGw7XHJcbiAgdGhpcy5saWZlID0gMDtcclxuICB0aGlzLnRhc2sgPSBudWxsO1xyXG4gIHRoaXMuaGl0XyA9IG51bGw7XHJcbiAgdGhpcy5zY2VuZSA9IHNjZW5lO1xyXG4gIHRoaXMuc2NlbmUuYWRkKHRoaXMubWVzaCk7XHJcbiAgdGhpcy5zZSA9IHNlO1xyXG4gIHRoaXMuZW5lbWllcyA9IGVuZW1pZXM7XHJcbn1cclxuXHJcbiAgZ2V0IHgoKSB7IHJldHVybiB0aGlzLnhfOyB9XHJcbiAgc2V0IHgodikgeyB0aGlzLnhfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnggPSB2OyB9XHJcbiAgZ2V0IHkoKSB7IHJldHVybiB0aGlzLnlfOyB9XHJcbiAgc2V0IHkodikgeyB0aGlzLnlfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnkgPSB2OyB9XHJcbiAgZ2V0IHooKSB7IHJldHVybiB0aGlzLnpfOyB9XHJcbiAgc2V0IHoodikgeyB0aGlzLnpfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnogPSB2OyB9XHJcbiAgXHJcbiAgLy8v5pW144Gu5YuV44GNXHJcbiAgKm1vdmUodGFza0luZGV4KSB7XHJcbiAgICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICAgIHdoaWxlICh0YXNrSW5kZXggPj0gMCl7XHJcbiAgICAgIHdoaWxlKCF0aGlzLm12Lm5leHQoKS5kb25lICYmIHRhc2tJbmRleCA+PSAwKVxyXG4gICAgICB7XHJcbiAgICAgICAgdGhpcy5tZXNoLnNjYWxlLnggPSB0aGlzLmVuZW1pZXMuaG9tZURlbHRhMjtcclxuICAgICAgICB0aGlzLm1lc2gucm90YXRpb24ueiA9IHRoaXMuY2hhclJhZDtcclxuICAgICAgICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIGlmKHRhc2tJbmRleCA8IDApe1xyXG4gICAgICAgIHRhc2tJbmRleCA9IC0oKyt0YXNrSW5kZXgpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgbGV0IGVuZCA9IGZhbHNlO1xyXG4gICAgICB3aGlsZSAoIWVuZCkge1xyXG4gICAgICAgIGlmICh0aGlzLmluZGV4IDwgKHRoaXMubXZQYXR0ZXJuLmxlbmd0aCAtIDEpKSB7XHJcbiAgICAgICAgICB0aGlzLmluZGV4Kys7XHJcbiAgICAgICAgICB0aGlzLm12ID0gdGhpcy5tdlBhdHRlcm5bdGhpcy5pbmRleF0ubW92ZSh0aGlzLHRoaXMueCx0aGlzLnkpO1xyXG4gICAgICAgICAgZW5kID0gIXRoaXMubXYubmV4dCgpLmRvbmU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICB0aGlzLm1lc2guc2NhbGUueCA9IHRoaXMuZW5lbWllcy5ob21lRGVsdGEyO1xyXG4gICAgICB0aGlzLm1lc2gucm90YXRpb24ueiA9IHRoaXMuY2hhclJhZDtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgLy8vIOWIneacn+WMllxyXG4gIHN0YXJ0KHgsIHksIHosIGhvbWVYLCBob21lWSwgbXZQYXR0ZXJuLCB4cmV2LHR5cGUsIGNsZWFyVGFyZ2V0LGdyb3VwSUQpIHtcclxuICAgIGlmICh0aGlzLmVuYWJsZV8pIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgdGhpcy50eXBlID0gdHlwZTtcclxuICAgIHR5cGUodGhpcyk7XHJcbiAgICB0aGlzLnggPSB4O1xyXG4gICAgdGhpcy55ID0geTtcclxuICAgIHRoaXMueiA9IHo7XHJcbiAgICB0aGlzLnhyZXYgPSB4cmV2O1xyXG4gICAgdGhpcy5lbmFibGVfID0gdHJ1ZTtcclxuICAgIHRoaXMuaG9tZVggPSBob21lWCB8fCAwO1xyXG4gICAgdGhpcy5ob21lWSA9IGhvbWVZIHx8IDA7XHJcbiAgICB0aGlzLmluZGV4ID0gMDtcclxuICAgIHRoaXMuZ3JvdXBJRCA9IGdyb3VwSUQ7XHJcbiAgICB0aGlzLm12UGF0dGVybiA9IG12UGF0dGVybjtcclxuICAgIHRoaXMuY2xlYXJUYXJnZXQgPSBjbGVhclRhcmdldCB8fCB0cnVlO1xyXG4gICAgdGhpcy5tZXNoLm1hdGVyaWFsLmNvbG9yLnNldEhleCgweEZGRkZGRik7XHJcbiAgICB0aGlzLm12ID0gbXZQYXR0ZXJuWzBdLm1vdmUodGhpcyx4LHkpO1xyXG4gICAgLy90aGlzLm12LnN0YXJ0KHRoaXMsIHgsIHkpO1xyXG4gICAgLy9pZiAodGhpcy5zdGF0dXMgIT0gdGhpcy5OT05FKSB7XHJcbiAgICAvLyAgZGVidWdnZXI7XHJcbiAgICAvL31cclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5TVEFSVDtcclxuICAgIHRoaXMudGFzayA9IHNmZy50YXNrcy5wdXNoVGFzayh0aGlzLm1vdmUuYmluZCh0aGlzKSwgMTAwMDApO1xyXG4gICAgLy8gaWYodGhpcy50YXNrLmluZGV4ID09IDApe1xyXG4gICAgLy8gICBkZWJ1Z2dlcjtcclxuICAgIC8vIH1cclxuICAgIHRoaXMubWVzaC52aXNpYmxlID0gdHJ1ZTtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuICBcclxuICBoaXQobXlidWxsZXQpIHtcclxuICAgIGlmICh0aGlzLmhpdF8gPT0gbnVsbCkge1xyXG4gICAgICBsZXQgbGlmZSA9IHRoaXMubGlmZTtcclxuICAgICAgdGhpcy5saWZlIC09IG15YnVsbGV0LnBvd2VyIHx8IDE7XHJcbiAgICAgIG15YnVsbGV0LnBvd2VyIC09IGxpZmU7IFxyXG4vLyAgICAgIHRoaXMubGlmZS0tO1xyXG4gICAgICBpZiAodGhpcy5saWZlIDw9IDApIHtcclxuICAgICAgICBzZmcuYm9tYnMuc3RhcnQodGhpcy54LCB0aGlzLnkpO1xyXG4gICAgICAgIHRoaXMuc2UoMSk7XHJcbiAgICAgICAgc2ZnLmFkZFNjb3JlKHRoaXMuc2NvcmUpO1xyXG4gICAgICAgIGlmICh0aGlzLmNsZWFyVGFyZ2V0KSB7XHJcbiAgICAgICAgICB0aGlzLmVuZW1pZXMuaGl0RW5lbWllc0NvdW50Kys7XHJcbiAgICAgICAgICBpZiAodGhpcy5zdGF0dXMgPT0gdGhpcy5TVEFSVCkge1xyXG4gICAgICAgICAgICB0aGlzLmVuZW1pZXMuaG9tZUVuZW1pZXNDb3VudCsrO1xyXG4gICAgICAgICAgICB0aGlzLmVuZW1pZXMuZ3JvdXBEYXRhW3RoaXMuZ3JvdXBJRF0ucHVzaCh0aGlzKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHRoaXMuZW5lbWllcy5ncm91cERhdGFbdGhpcy5ncm91cElEXS5nb25lQ291bnQrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodGhpcy50YXNrLmluZGV4ID09IDApe1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ2hpdCcsdGhpcy50YXNrLmluZGV4KTtcclxuICAgICAgICAgIGRlYnVnZ2VyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmVuYWJsZV8gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnN0YXR1cyA9IHRoaXMuTk9ORTtcclxuICAgICAgICBzZmcudGFza3MuYXJyYXlbdGhpcy50YXNrLmluZGV4XS5nZW5JbnN0Lm5leHQoLSh0aGlzLnRhc2suaW5kZXggKyAxKSk7XHJcbiAgICAgICAgc2ZnLnRhc2tzLnJlbW92ZVRhc2sodGhpcy50YXNrLmluZGV4KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnNlKDIpO1xyXG4gICAgICAgIHRoaXMubWVzaC5tYXRlcmlhbC5jb2xvci5zZXRIZXgoMHhGRjgwODApO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmhpdF8obXlidWxsZXQpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIFpha28oc2VsZikge1xyXG4gIHNlbGYuc2NvcmUgPSA1MDtcclxuICBzZWxmLmxpZmUgPSAxO1xyXG4gIGdyYXBoaWNzLnVwZGF0ZVNwcml0ZVVWKHNlbGYubWVzaC5nZW9tZXRyeSwgc2ZnLnRleHR1cmVGaWxlcy5lbmVteSwgMTYsIDE2LCA3KTtcclxufVxyXG5cclxuWmFrby50b0pTT04gPSBmdW5jdGlvbiAoKVxyXG57XHJcbiAgcmV0dXJuICdaYWtvJztcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIFpha28xKHNlbGYpIHtcclxuICBzZWxmLnNjb3JlID0gMTAwO1xyXG4gIHNlbGYubGlmZSA9IDE7XHJcbiAgZ3JhcGhpY3MudXBkYXRlU3ByaXRlVVYoc2VsZi5tZXNoLmdlb21ldHJ5LCBzZmcudGV4dHVyZUZpbGVzLmVuZW15LCAxNiwgMTYsIDYpO1xyXG59XHJcblxyXG5aYWtvMS50b0pTT04gPSBmdW5jdGlvbiAoKVxyXG57XHJcbiAgcmV0dXJuICdaYWtvMSc7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBNQm9zcyhzZWxmKSB7XHJcbiAgc2VsZi5zY29yZSA9IDMwMDtcclxuICBzZWxmLmxpZmUgPSAyO1xyXG4gIHNlbGYubWVzaC5ibGVuZGluZyA9IFRIUkVFLk5vcm1hbEJsZW5kaW5nO1xyXG4gIGdyYXBoaWNzLnVwZGF0ZVNwcml0ZVVWKHNlbGYubWVzaC5nZW9tZXRyeSwgc2ZnLnRleHR1cmVGaWxlcy5lbmVteSwgMTYsIDE2LCA0KTtcclxufVxyXG5cclxuTUJvc3MudG9KU09OID0gZnVuY3Rpb24gKClcclxue1xyXG4gIHJldHVybiAnTUJvc3MnO1xyXG59XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIEVuZW1pZXN7XHJcbiAgY29uc3RydWN0b3Ioc2NlbmUsIHNlLCBlbmVteUJ1bGxldHMpIHtcclxuICAgIHRoaXMuZW5lbXlCdWxsZXRzID0gZW5lbXlCdWxsZXRzO1xyXG4gICAgdGhpcy5zY2VuZSA9IHNjZW5lO1xyXG4gICAgdGhpcy5uZXh0VGltZSA9IDA7XHJcbiAgICB0aGlzLmN1cnJlbnRJbmRleCA9IDA7XHJcbiAgICB0aGlzLmVuZW1pZXMgPSBuZXcgQXJyYXkoMCk7XHJcbiAgICB0aGlzLmhvbWVEZWx0YTIgPSAxLjA7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDY0OyArK2kpIHtcclxuICAgICAgdGhpcy5lbmVtaWVzLnB1c2gobmV3IEVuZW15KHRoaXMsIHNjZW5lLCBzZSkpO1xyXG4gICAgfVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA1OyArK2kpIHtcclxuICAgICAgdGhpcy5ncm91cERhdGFbaV0gPSBuZXcgQXJyYXkoMCk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIHN0YXJ0RW5lbXlfKGVuZW15LGRhdGEpXHJcbiAge1xyXG4gICAgICBlbmVteS5zdGFydChkYXRhWzFdLCBkYXRhWzJdLCAwLCBkYXRhWzNdLCBkYXRhWzRdLCB0aGlzLm1vdmVQYXR0ZXJuc1tNYXRoLmFicyhkYXRhWzVdKV0sIGRhdGFbNV0gPCAwLCBkYXRhWzZdLCBkYXRhWzddLCBkYXRhWzhdIHx8IDApO1xyXG4gIH1cclxuICBcclxuICBzdGFydEVuZW15KGRhdGEpe1xyXG4gICAgdmFyIGVuZW1pZXMgPSB0aGlzLmVuZW1pZXM7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZSA9IGVuZW1pZXMubGVuZ3RoOyBpIDwgZTsgKytpKSB7XHJcbiAgICAgIHZhciBlbmVteSA9IGVuZW1pZXNbaV07XHJcbiAgICAgIGlmICghZW5lbXkuZW5hYmxlXykge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnN0YXJ0RW5lbXlfKGVuZW15LGRhdGEpO1xyXG4gICAgICB9XHJcbiAgICB9ICAgIFxyXG4gIH1cclxuICBcclxuICBzdGFydEVuZW15SW5kZXhlZChkYXRhLGluZGV4KXtcclxuICAgIGxldCBlbiA9IHRoaXMuZW5lbWllc1tpbmRleF07XHJcbiAgICBpZihlbi5lbmFibGVfKXtcclxuICAgICAgICBzZmcudGFza3MucmVtb3ZlVGFzayhlbi50YXNrLmluZGV4KTtcclxuICAgICAgICBlbi5zdGF0dXMgPSBlbi5OT05FO1xyXG4gICAgICAgIGVuLmVuYWJsZV8gPSBmYWxzZTtcclxuICAgICAgICBlbi5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIHRoaXMuc3RhcnRFbmVteV8oZW4sZGF0YSk7XHJcbiAgfVxyXG5cclxuICAvLy8g5pW157eo6ZqK44Gu5YuV44GN44KS44Kz44Oz44OI44Ot44O844Or44GZ44KLXHJcbiAgbW92ZSgpIHtcclxuICAgIHZhciBjdXJyZW50VGltZSA9IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWU7XHJcbiAgICB2YXIgbW92ZVNlcXMgPSB0aGlzLm1vdmVTZXFzO1xyXG4gICAgdmFyIGxlbiA9IG1vdmVTZXFzW3NmZy5zdGFnZS5wcml2YXRlTm9dLmxlbmd0aDtcclxuICAgIC8vIOODh+ODvOOCv+mFjeWIl+OCkuOCguOBqOOBq+aVteOCkueUn+aIkFxyXG4gICAgd2hpbGUgKHRoaXMuY3VycmVudEluZGV4IDwgbGVuKSB7XHJcbiAgICAgIHZhciBkYXRhID0gbW92ZVNlcXNbc2ZnLnN0YWdlLnByaXZhdGVOb11bdGhpcy5jdXJyZW50SW5kZXhdO1xyXG4gICAgICB2YXIgbmV4dFRpbWUgPSB0aGlzLm5leHRUaW1lICE9IG51bGwgPyB0aGlzLm5leHRUaW1lIDogZGF0YVswXTtcclxuICAgICAgaWYgKGN1cnJlbnRUaW1lID49ICh0aGlzLm5leHRUaW1lICsgZGF0YVswXSkpIHtcclxuICAgICAgICB0aGlzLnN0YXJ0RW5lbXkoZGF0YSk7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50SW5kZXgrKztcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50SW5kZXggPCBsZW4pIHtcclxuICAgICAgICAgIHRoaXMubmV4dFRpbWUgPSBjdXJyZW50VGltZSArIG1vdmVTZXFzW3NmZy5zdGFnZS5wcml2YXRlTm9dW3RoaXMuY3VycmVudEluZGV4XVswXTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIOODm+ODvOODoOODneOCuOOCt+ODp+ODs+OBq+aVteOBjOOBmeOBueOBpuaVtOWIl+OBl+OBn+OBi+eiuuiqjeOBmeOCi+OAglxyXG4gICAgaWYgKHRoaXMuaG9tZUVuZW1pZXNDb3VudCA9PSB0aGlzLnRvdGFsRW5lbWllc0NvdW50ICYmIHRoaXMuc3RhdHVzID09IHRoaXMuU1RBUlQpIHtcclxuICAgICAgLy8g5pW05YiX44GX44Gm44GE44Gf44KJ5pW05YiX44Oi44O844OJ44Gr56e76KGM44GZ44KL44CCXHJcbiAgICAgIHRoaXMuc3RhdHVzID0gdGhpcy5IT01FO1xyXG4gICAgICB0aGlzLmVuZFRpbWUgPSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lICsgMC41ICogKDIuMCAtIHNmZy5zdGFnZS5kaWZmaWN1bHR5KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyDjg5vjg7zjg6Djg53jgrjjgrfjg6fjg7PjgafkuIDlrprmmYLplpPlvoXmqZ/jgZnjgotcclxuICAgIGlmICh0aGlzLnN0YXR1cyA9PSB0aGlzLkhPTUUpIHtcclxuICAgICAgaWYgKHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgPiB0aGlzLmVuZFRpbWUpIHtcclxuICAgICAgICB0aGlzLnN0YXR1cyA9IHRoaXMuQVRUQUNLO1xyXG4gICAgICAgIHRoaXMuZW5kVGltZSA9IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgKyAoc2ZnLnN0YWdlLkRJRkZJQ1VMVFlfTUFYIC0gc2ZnLnN0YWdlLmRpZmZpY3VsdHkpICogMztcclxuICAgICAgICB0aGlzLmdyb3VwID0gMDtcclxuICAgICAgICB0aGlzLmNvdW50ID0gMDtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIOaUu+aSg+OBmeOCi1xyXG4gICAgaWYgKHRoaXMuc3RhdHVzID09IHRoaXMuQVRUQUNLICYmIHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgPiB0aGlzLmVuZFRpbWUpIHtcclxuICAgICAgdGhpcy5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIChzZmcuc3RhZ2UuRElGRklDVUxUWV9NQVggLSBzZmcuc3RhZ2UuZGlmZmljdWx0eSkgKiAzO1xyXG4gICAgICB2YXIgZ3JvdXBEYXRhID0gdGhpcy5ncm91cERhdGE7XHJcbiAgICAgIHZhciBhdHRhY2tDb3VudCA9ICgxICsgMC4yNSAqIChzZmcuc3RhZ2UuZGlmZmljdWx0eSkpIHwgMDtcclxuICAgICAgdmFyIGdyb3VwID0gZ3JvdXBEYXRhW3RoaXMuZ3JvdXBdO1xyXG5cclxuICAgICAgaWYgKCFncm91cCB8fCBncm91cC5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSAwO1xyXG4gICAgICAgIHZhciBncm91cCA9IGdyb3VwRGF0YVswXTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGdyb3VwLmxlbmd0aCA+IDAgJiYgZ3JvdXAubGVuZ3RoID4gZ3JvdXAuZ29uZUNvdW50KSB7XHJcbiAgICAgICAgaWYgKCFncm91cC5pbmRleCkge1xyXG4gICAgICAgICAgZ3JvdXAuaW5kZXggPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXMuZ3JvdXApIHtcclxuICAgICAgICAgIHZhciBjb3VudCA9IDAsIGVuZGcgPSBncm91cC5sZW5ndGg7XHJcbiAgICAgICAgICB3aGlsZSAoY291bnQgPCBlbmRnICYmIGF0dGFja0NvdW50ID4gMCkge1xyXG4gICAgICAgICAgICB2YXIgZW4gPSBncm91cFtncm91cC5pbmRleF07XHJcbiAgICAgICAgICAgIGlmIChlbi5lbmFibGVfICYmIGVuLnN0YXR1cyA9PSBlbi5IT01FKSB7XHJcbiAgICAgICAgICAgICAgZW4uc3RhdHVzID0gZW4uQVRUQUNLO1xyXG4gICAgICAgICAgICAgIC0tYXR0YWNrQ291bnQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY291bnQrKztcclxuICAgICAgICAgICAgZ3JvdXAuaW5kZXgrKztcclxuICAgICAgICAgICAgaWYgKGdyb3VwLmluZGV4ID49IGdyb3VwLmxlbmd0aCkgZ3JvdXAuaW5kZXggPSAwO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gZ3JvdXAubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgICAgICAgdmFyIGVuID0gZ3JvdXBbaV07XHJcbiAgICAgICAgICAgIGlmIChlbi5lbmFibGVfICYmIGVuLnN0YXR1cyA9PSBlbi5IT01FKSB7XHJcbiAgICAgICAgICAgICAgZW4uc3RhdHVzID0gZW4uQVRUQUNLO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLmdyb3VwKys7XHJcbiAgICAgIGlmICh0aGlzLmdyb3VwID49IHRoaXMuZ3JvdXBEYXRhLmxlbmd0aCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSAwO1xyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIOODm+ODvOODoOODneOCuOOCt+ODp+ODs+OBp+OBruW+heapn+WLleS9nFxyXG4gICAgdGhpcy5ob21lRGVsdGFDb3VudCArPSAwLjAyNTtcclxuICAgIHRoaXMuaG9tZURlbHRhID0gTWF0aC5zaW4odGhpcy5ob21lRGVsdGFDb3VudCkgKiAwLjA4O1xyXG4gICAgdGhpcy5ob21lRGVsdGEyID0gMS4wICsgTWF0aC5zaW4odGhpcy5ob21lRGVsdGFDb3VudCAqIDgpICogMC4xO1xyXG5cclxuICB9XHJcblxyXG4gIHJlc2V0KCkge1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHRoaXMuZW5lbWllcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgICB2YXIgZW4gPSB0aGlzLmVuZW1pZXNbaV07XHJcbiAgICAgIGlmIChlbi5lbmFibGVfKSB7XHJcbiAgICAgICAgc2ZnLnRhc2tzLnJlbW92ZVRhc2soZW4udGFzay5pbmRleCk7XHJcbiAgICAgICAgZW4uc3RhdHVzID0gZW4uTk9ORTtcclxuICAgICAgICBlbi5lbmFibGVfID0gZmFsc2U7XHJcbiAgICAgICAgZW4ubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNhbGNFbmVtaWVzQ291bnQoKSB7XHJcbiAgICB2YXIgc2VxcyA9IHRoaXMubW92ZVNlcXNbc2ZnLnN0YWdlLnByaXZhdGVOb107XHJcbiAgICB0aGlzLnRvdGFsRW5lbWllc0NvdW50ID0gMDtcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSBzZXFzLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIGlmIChzZXFzW2ldWzddKSB7XHJcbiAgICAgICAgdGhpcy50b3RhbEVuZW1pZXNDb3VudCsrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBzdGFydCgpIHtcclxuICAgIHRoaXMubmV4dFRpbWUgPSAwO1xyXG4gICAgdGhpcy5jdXJyZW50SW5kZXggPSAwO1xyXG4gICAgdGhpcy50b3RhbEVuZW1pZXNDb3VudCA9IDA7XHJcbiAgICB0aGlzLmhpdEVuZW1pZXNDb3VudCA9IDA7XHJcbiAgICB0aGlzLmhvbWVFbmVtaWVzQ291bnQgPSAwO1xyXG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLlNUQVJUO1xyXG4gICAgdmFyIGdyb3VwRGF0YSA9IHRoaXMuZ3JvdXBEYXRhO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IGdyb3VwRGF0YS5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgICBncm91cERhdGFbaV0ubGVuZ3RoID0gMDtcclxuICAgICAgZ3JvdXBEYXRhW2ldLmdvbmVDb3VudCA9IDA7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIGxvYWRQYXR0ZXJucygpe1xyXG4gICAgdGhpcy5tb3ZlUGF0dGVybnMgPSBbXTtcclxuICAgIGxldCB0aGlzXyA9IHRoaXM7ICAgIFxyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLHJlamVjdCk9PntcclxuICAgICAgZDMuanNvbignLi9yZXMvZW5lbXlNb3ZlUGF0dGVybi5qc29uJywoZXJyLGRhdGEpPT57XHJcbiAgICAgICAgaWYoZXJyKXtcclxuICAgICAgICAgIHJlamVjdChlcnIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkYXRhLmZvckVhY2goKGNvbUFycmF5LGkpPT57XHJcbiAgICAgICAgICBsZXQgY29tID0gW107XHJcbiAgICAgICAgICB0aGlzLm1vdmVQYXR0ZXJucy5wdXNoKGNvbSk7XHJcbiAgICAgICAgICBjb21BcnJheS5mb3JFYWNoKChkLGkpPT57XHJcbiAgICAgICAgICAgIGNvbS5wdXNoKHRoaXMuY3JlYXRlTW92ZVBhdHRlcm5Gcm9tQXJyYXkoZCkpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIFxyXG4gIGNyZWF0ZU1vdmVQYXR0ZXJuRnJvbUFycmF5KGFycil7XHJcbiAgICBsZXQgb2JqO1xyXG4gICAgc3dpdGNoKGFyclswXSl7XHJcbiAgICAgIGNhc2UgJ0xpbmVNb3ZlJzpcclxuICAgICAgICBvYmogPSBMaW5lTW92ZS5mcm9tQXJyYXkoYXJyKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnQ2lyY2xlTW92ZSc6XHJcbiAgICAgICAgb2JqID0gIENpcmNsZU1vdmUuZnJvbUFycmF5KGFycik7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ0dvdG9Ib21lJzpcclxuICAgICAgICBvYmogPSAgIEdvdG9Ib21lLmZyb21BcnJheShhcnIpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdIb21lTW92ZSc6XHJcbiAgICAgICAgb2JqID0gICBIb21lTW92ZS5mcm9tQXJyYXkoYXJyKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnR290byc6XHJcbiAgICAgICAgb2JqID0gICBHb3RvLmZyb21BcnJheShhcnIpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdGaXJlJzpcclxuICAgICAgICBvYmogPSAgIEZpcmUuZnJvbUFycmF5KGFycik7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gb2JqO1xyXG4vLyAgICB0aHJvdyBuZXcgRXJyb3IoJ01vdmVQYXR0ZXJuIE5vdCBGb3VuZC4nKTtcclxuICB9XHJcbiAgXHJcbiAgbG9hZEZvcm1hdGlvbnMoKXtcclxuICAgIHRoaXMubW92ZVNlcXMgPSBbXTtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSxyZWplY3QpPT57XHJcbiAgICAgIGQzLmpzb24oJy4vcmVzL2VuZW15Rm9ybWF0aW9uUGF0dGVybi5qc29uJywoZXJyLGRhdGEpPT57XHJcbiAgICAgICAgaWYoZXJyKSByZWplY3QoZXJyKTtcclxuICAgICAgICBkYXRhLmZvckVhY2goKGZvcm0saSk9PntcclxuICAgICAgICAgIGxldCBzdGFnZSA9IFtdO1xyXG4gICAgICAgICAgdGhpcy5tb3ZlU2Vxcy5wdXNoKHN0YWdlKTtcclxuICAgICAgICAgIGZvcm0uZm9yRWFjaCgoZCxpKT0+e1xyXG4gICAgICAgICAgICBkWzZdID0gZ2V0RW5lbXlGdW5jKGRbNl0pO1xyXG4gICAgICAgICAgICBzdGFnZS5wdXNoKGQpO1xyXG4gICAgICAgICAgfSk7ICAgICAgICAgIFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgXHJcbn1cclxuXHJcbnZhciBlbmVteUZ1bmNzID0gbmV3IE1hcChbXHJcbiAgICAgIFtcIlpha29cIixaYWtvXSxcclxuICAgICAgW1wiWmFrbzFcIixaYWtvMV0sXHJcbiAgICAgIFtcIk1Cb3NzXCIsTUJvc3NdXHJcbiAgICBdKTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRFbmVteUZ1bmMoZnVuY05hbWUpXHJcbntcclxuICByZXR1cm4gZW5lbXlGdW5jcy5nZXQoZnVuY05hbWUpO1xyXG59XHJcblxyXG5FbmVtaWVzLnByb3RvdHlwZS50b3RhbEVuZW1pZXNDb3VudCA9IDA7XHJcbkVuZW1pZXMucHJvdG90eXBlLmhpdEVuZW1pZXNDb3VudCA9IDA7XHJcbkVuZW1pZXMucHJvdG90eXBlLmhvbWVFbmVtaWVzQ291bnQgPSAwO1xyXG5FbmVtaWVzLnByb3RvdHlwZS5ob21lRGVsdGEgPSAwO1xyXG5FbmVtaWVzLnByb3RvdHlwZS5ob21lRGVsdGFDb3VudCA9IDA7XHJcbkVuZW1pZXMucHJvdG90eXBlLmhvbWVEZWx0YTIgPSAwO1xyXG5FbmVtaWVzLnByb3RvdHlwZS5ncm91cERhdGEgPSBbXTtcclxuRW5lbWllcy5wcm90b3R5cGUuTk9ORSA9IDAgfCAwO1xyXG5FbmVtaWVzLnByb3RvdHlwZS5TVEFSVCA9IDEgfCAwO1xyXG5FbmVtaWVzLnByb3RvdHlwZS5IT01FID0gMiB8IDA7XHJcbkVuZW1pZXMucHJvdG90eXBlLkFUVEFDSyA9IDMgfCAwO1xyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmltcG9ydCB7c2ZnfSBmcm9tICcuL2dsb2JhbC5qcyc7XHJcbmltcG9ydCAqICBhcyBnYW1lb2JqIGZyb20gJy4vZ2FtZW9iai5qcyc7XHJcbmltcG9ydCAqIGFzIGdyYXBoaWNzIGZyb20gJy4vZ3JhcGhpY3MuanMnO1xyXG5cclxuXHJcbi8vLyDniIbnmbpcclxuZXhwb3J0IGNsYXNzIEJvbWIgZXh0ZW5kcyBnYW1lb2JqLkdhbWVPYmogXHJcbntcclxuICBjb25zdHJ1Y3RvcihzY2VuZSxzZSkge1xyXG4gICAgc3VwZXIoMCwwLDApO1xyXG4gICAgdmFyIHRleCA9IHNmZy50ZXh0dXJlRmlsZXMuYm9tYjtcclxuICAgIHZhciBtYXRlcmlhbCA9IGdyYXBoaWNzLmNyZWF0ZVNwcml0ZU1hdGVyaWFsKHRleCk7XHJcbiAgICBtYXRlcmlhbC5ibGVuZGluZyA9IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmc7XHJcbiAgICBtYXRlcmlhbC5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVHZW9tZXRyeSgxNik7XHJcbiAgICBncmFwaGljcy5jcmVhdGVTcHJpdGVVVihnZW9tZXRyeSwgdGV4LCAxNiwgMTYsIDApO1xyXG4gICAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICAgIHRoaXMubWVzaC5wb3NpdGlvbi56ID0gMC4xO1xyXG4gICAgdGhpcy5pbmRleCA9IDA7XHJcbiAgICB0aGlzLm1lc2gudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgdGhpcy5zY2VuZSA9IHNjZW5lO1xyXG4gICAgdGhpcy5zZSA9IHNlO1xyXG4gICAgc2NlbmUuYWRkKHRoaXMubWVzaCk7XHJcbiAgfVxyXG4gIGdldCB4KCkgeyByZXR1cm4gdGhpcy54XzsgfVxyXG4gIHNldCB4KHYpIHsgdGhpcy54XyA9IHRoaXMubWVzaC5wb3NpdGlvbi54ID0gdjsgfVxyXG4gIGdldCB5KCkgeyByZXR1cm4gdGhpcy55XzsgfVxyXG4gIHNldCB5KHYpIHsgdGhpcy55XyA9IHRoaXMubWVzaC5wb3NpdGlvbi55ID0gdjsgfVxyXG4gIGdldCB6KCkgeyByZXR1cm4gdGhpcy56XzsgfVxyXG4gIHNldCB6KHYpIHsgdGhpcy56XyA9IHRoaXMubWVzaC5wb3NpdGlvbi56ID0gdjsgfVxyXG4gIFxyXG4gIHN0YXJ0KHgsIHksIHosIGRlbGF5KSB7XHJcbiAgICBpZiAodGhpcy5lbmFibGVfKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHRoaXMuZGVsYXkgPSBkZWxheSB8IDA7XHJcbiAgICB0aGlzLnggPSB4O1xyXG4gICAgdGhpcy55ID0geTtcclxuICAgIHRoaXMueiA9IHogfCAwLjAwMDAyO1xyXG4gICAgdGhpcy5lbmFibGVfID0gdHJ1ZTtcclxuICAgIGdyYXBoaWNzLnVwZGF0ZVNwcml0ZVVWKHRoaXMubWVzaC5nZW9tZXRyeSwgc2ZnLnRleHR1cmVGaWxlcy5ib21iLCAxNiwgMTYsIHRoaXMuaW5kZXgpO1xyXG4gICAgdGhpcy50YXNrID0gc2ZnLnRhc2tzLnB1c2hUYXNrKHRoaXMubW92ZS5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMubWVzaC5tYXRlcmlhbC5vcGFjaXR5ID0gMS4wO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG4gIFxyXG4gICptb3ZlKHRhc2tJbmRleCkge1xyXG4gICAgXHJcbiAgICBmb3IoIGxldCBpID0gMCxlID0gdGhpcy5kZWxheTtpIDwgZSAmJiB0YXNrSW5kZXggPj0gMDsrK2kpXHJcbiAgICB7XHJcbiAgICAgIHRhc2tJbmRleCA9IHlpZWxkOyAgICAgIFxyXG4gICAgfVxyXG4gICAgdGhpcy5tZXNoLnZpc2libGUgPSB0cnVlO1xyXG5cclxuICAgIGZvcihsZXQgaSA9IDA7aSA8IDcgJiYgdGFza0luZGV4ID49IDA7KytpKVxyXG4gICAge1xyXG4gICAgICBncmFwaGljcy51cGRhdGVTcHJpdGVVVih0aGlzLm1lc2guZ2VvbWV0cnksIHNmZy50ZXh0dXJlRmlsZXMuYm9tYiwgMTYsIDE2LCBpKTtcclxuICAgICAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHRoaXMuZW5hYmxlXyA9IGZhbHNlO1xyXG4gICAgdGhpcy5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxuICAgIHNmZy50YXNrcy5yZW1vdmVUYXNrKHRhc2tJbmRleCk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQm9tYnMge1xyXG4gIGNvbnN0cnVjdG9yKHNjZW5lLCBzZSkge1xyXG4gICAgdGhpcy5ib21icyA9IG5ldyBBcnJheSgwKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMzI7ICsraSkge1xyXG4gICAgICB0aGlzLmJvbWJzLnB1c2gobmV3IEJvbWIoc2NlbmUsIHNlKSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIHN0YXJ0KHgsIHksIHopIHtcclxuICAgIHZhciBib21zID0gdGhpcy5ib21icztcclxuICAgIHZhciBjb3VudCA9IDM7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gYm9tcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgICBpZiAoIWJvbXNbaV0uZW5hYmxlXykge1xyXG4gICAgICAgIGlmIChjb3VudCA9PSAyKSB7XHJcbiAgICAgICAgICBib21zW2ldLnN0YXJ0KHgsIHksIHosIDApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBib21zW2ldLnN0YXJ0KHggKyAoTWF0aC5yYW5kb20oKSAqIDE2IC0gOCksIHkgKyAoTWF0aC5yYW5kb20oKSAqIDE2IC0gOCksIHosIE1hdGgucmFuZG9tKCkgKiA4KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY291bnQtLTtcclxuICAgICAgICBpZiAoIWNvdW50KSBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmVzZXQoKXtcclxuICAgIHRoaXMuYm9tYnMuZm9yRWFjaCgoZCk9PntcclxuICAgICAgaWYoZC5lbmFibGVfKXtcclxuICAgICAgICB3aGlsZSghc2ZnLnRhc2tzLmFycmF5W2QudGFzay5pbmRleF0uZ2VuSW5zdC5uZXh0KC0oMStkLnRhc2suaW5kZXgpKS5kb25lKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuLy92YXIgU1RBR0VfTUFYID0gMTtcclxuaW1wb3J0IHtzZmd9IGZyb20gJy4vZ2xvYmFsLmpzJztcclxuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwuanMnO1xyXG5pbXBvcnQgKiBhcyBhdWRpbyBmcm9tICcuL2F1ZGlvLmpzJztcclxuLy9pbXBvcnQgKiBhcyBzb25nIGZyb20gJy4vc29uZyc7XHJcbmltcG9ydCAqIGFzIGdyYXBoaWNzIGZyb20gJy4vZ3JhcGhpY3MuanMnO1xyXG5pbXBvcnQgKiBhcyBpbyBmcm9tICcuL2lvLmpzJztcclxuaW1wb3J0ICogYXMgY29tbSBmcm9tICcuL2NvbW0uanMnO1xyXG5pbXBvcnQgKiBhcyB0ZXh0IGZyb20gJy4vdGV4dC5qcyc7XHJcbmltcG9ydCAqIGFzIGdhbWVvYmogZnJvbSAnLi9nYW1lb2JqLmpzJztcclxuaW1wb3J0ICogYXMgbXlzaGlwIGZyb20gJy4vbXlzaGlwLmpzJztcclxuaW1wb3J0ICogYXMgZW5lbWllcyBmcm9tICcuL2VuZW1pZXMuanMnO1xyXG5pbXBvcnQgKiBhcyBlZmZlY3RvYmogZnJvbSAnLi9lZmZlY3RvYmouanMnO1xyXG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJy4vZXZlbnRFbWl0dGVyMy5qcyc7XHJcblxyXG5cclxuY2xhc3MgU2NvcmVFbnRyeSB7XHJcbiAgY29uc3RydWN0b3IobmFtZSwgc2NvcmUpIHtcclxuICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICB0aGlzLnNjb3JlID0gc2NvcmU7XHJcbiAgfVxyXG59XHJcblxyXG5cclxuY2xhc3MgU3RhZ2UgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoKTtcclxuICAgIHRoaXMuTUFYID0gMTtcclxuICAgIHRoaXMuRElGRklDVUxUWV9NQVggPSAyLjA7XHJcbiAgICB0aGlzLm5vID0gMTtcclxuICAgIHRoaXMucHJpdmF0ZU5vID0gMDtcclxuICAgIHRoaXMuZGlmZmljdWx0eSA9IDE7XHJcbiAgfVxyXG5cclxuICByZXNldCgpIHtcclxuICAgIHRoaXMubm8gPSAxO1xyXG4gICAgdGhpcy5wcml2YXRlTm8gPSAwO1xyXG4gICAgdGhpcy5kaWZmaWN1bHR5ID0gMTtcclxuICB9XHJcblxyXG4gIGFkdmFuY2UoKSB7XHJcbiAgICB0aGlzLm5vKys7XHJcbiAgICB0aGlzLnByaXZhdGVObysrO1xyXG4gICAgdGhpcy51cGRhdGUoKTtcclxuICB9XHJcblxyXG4gIGp1bXAoc3RhZ2VObykge1xyXG4gICAgdGhpcy5ubyA9IHN0YWdlTm87XHJcbiAgICB0aGlzLnByaXZhdGVObyA9IHRoaXMubm8gLSAxO1xyXG4gICAgdGhpcy51cGRhdGUoKTtcclxuICB9XHJcblxyXG4gIHVwZGF0ZSgpIHtcclxuICAgIGlmICh0aGlzLmRpZmZpY3VsdHkgPCB0aGlzLkRJRkZJQ1VMVFlfTUFYKSB7XHJcbiAgICAgIHRoaXMuZGlmZmljdWx0eSA9IDEgKyAwLjA1ICogKHRoaXMubm8gLSAxKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5wcml2YXRlTm8gPj0gdGhpcy5NQVgpIHtcclxuICAgICAgdGhpcy5wcml2YXRlTm8gPSAwO1xyXG4gIC8vICAgIHRoaXMubm8gPSAxO1xyXG4gICAgfVxyXG4gICAgdGhpcy5lbWl0KCd1cGRhdGUnLHRoaXMpO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEdhbWUge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgdGhpcy5DT05TT0xFX1dJRFRIID0gMDtcclxuICAgIHRoaXMuQ09OU09MRV9IRUlHSFQgPSAwO1xyXG4gICAgdGhpcy5SRU5ERVJFUl9QUklPUklUWSA9IDEwMDAwMCB8IDA7XHJcbiAgICB0aGlzLnJlbmRlcmVyID0gbnVsbDtcclxuICAgIHRoaXMuc3RhdHMgPSBudWxsO1xyXG4gICAgdGhpcy5zY2VuZSA9IG51bGw7XHJcbiAgICB0aGlzLmNhbWVyYSA9IG51bGw7XHJcbiAgICB0aGlzLmF1dGhvciA9IG51bGw7XHJcbiAgICB0aGlzLnByb2dyZXNzID0gbnVsbDtcclxuICAgIHRoaXMudGV4dFBsYW5lID0gbnVsbDtcclxuICAgIHRoaXMuYmFzaWNJbnB1dCA9IG5ldyBpby5CYXNpY0lucHV0KCk7XHJcbiAgICB0aGlzLnRhc2tzID0gbmV3IHV0aWwuVGFza3MoKTtcclxuICAgIHNmZy50YXNrcyA9IHRoaXMudGFza3M7XHJcbiAgICB0aGlzLndhdmVHcmFwaCA9IG51bGw7XHJcbiAgICB0aGlzLnN0YXJ0ID0gZmFsc2U7XHJcbiAgICB0aGlzLmJhc2VUaW1lID0gbmV3IERhdGU7XHJcbiAgICB0aGlzLmQgPSAtMC4yO1xyXG4gICAgdGhpcy5hdWRpb18gPSBudWxsO1xyXG4gICAgdGhpcy5zZXF1ZW5jZXIgPSBudWxsO1xyXG4gICAgdGhpcy5waWFubyA9IG51bGw7XHJcbiAgICB0aGlzLnNjb3JlID0gMDtcclxuICAgIHRoaXMuaGlnaFNjb3JlID0gMDtcclxuICAgIHRoaXMuaGlnaFNjb3JlcyA9IFtdO1xyXG4gICAgdGhpcy5pc0hpZGRlbiA9IGZhbHNlO1xyXG4gICAgdGhpcy5teXNoaXBfID0gbnVsbDtcclxuICAgIHRoaXMuZW5lbWllcyA9IG51bGw7XHJcbiAgICB0aGlzLmVuZW15QnVsbGV0cyA9IG51bGw7XHJcbiAgICB0aGlzLlBJID0gTWF0aC5QSTtcclxuICAgIHRoaXMuY29tbV8gPSBudWxsO1xyXG4gICAgdGhpcy5oYW5kbGVOYW1lID0gJyc7XHJcbiAgICB0aGlzLnN0b3JhZ2UgPSBudWxsO1xyXG4gICAgdGhpcy5yYW5rID0gLTE7XHJcbiAgICB0aGlzLnNvdW5kRWZmZWN0cyA9IG51bGw7XHJcbiAgICB0aGlzLmVucyA9IG51bGw7XHJcbiAgICB0aGlzLmVuYnMgPSBudWxsO1xyXG4gICAgdGhpcy5zdGFnZSA9IHNmZy5zdGFnZSA9IG5ldyBTdGFnZSgpO1xyXG4gICAgdGhpcy50aXRsZSA9IG51bGw7Ly8g44K/44Kk44OI44Or44Oh44OD44K344OlXHJcbiAgICB0aGlzLnNwYWNlRmllbGQgPSBudWxsOy8vIOWuh+WumeepuumWk+ODkeODvOODhuOCo+OCr+ODq1xyXG4gICAgdGhpcy5lZGl0SGFuZGxlTmFtZSA9IG51bGw7XHJcbiAgICBzZmcuYWRkU2NvcmUgPSB0aGlzLmFkZFNjb3JlLmJpbmQodGhpcyk7XHJcbiAgICB0aGlzLmNoZWNrVmlzaWJpbGl0eUFQSSgpO1xyXG4gICAgdGhpcy5hdWRpb18gPSBuZXcgYXVkaW8uQXVkaW8oKTtcclxuICB9XHJcblxyXG4gIGV4ZWMoKSB7XHJcbiAgICBcclxuICAgIGlmICghdGhpcy5jaGVja0Jyb3dzZXJTdXBwb3J0KCcjY29udGVudCcpKXtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc2VxdWVuY2VyID0gbmV3IGF1ZGlvLlNlcXVlbmNlcih0aGlzLmF1ZGlvXyk7XHJcbiAgICAvL3BpYW5vID0gbmV3IGF1ZGlvLlBpYW5vKGF1ZGlvXyk7XHJcbiAgICB0aGlzLnNvdW5kRWZmZWN0cyA9IG5ldyBhdWRpby5Tb3VuZEVmZmVjdHModGhpcy5zZXF1ZW5jZXIpO1xyXG5cclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIod2luZG93LnZpc2liaWxpdHlDaGFuZ2UsIHRoaXMub25WaXNpYmlsaXR5Q2hhbmdlLmJpbmQodGhpcyksIGZhbHNlKTtcclxuICAgIHNmZy5nYW1lVGltZXIgPSBuZXcgdXRpbC5HYW1lVGltZXIodGhpcy5nZXRDdXJyZW50VGltZS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLy8g44Ky44O844Og44Kz44Oz44K944O844Or44Gu5Yid5pyf5YyWXHJcbiAgICB0aGlzLmluaXRDb25zb2xlKCk7XHJcbiAgICB0aGlzLmxvYWRSZXNvdXJjZXMoKVxyXG4gICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5zY2VuZS5yZW1vdmUodGhpcy5wcm9ncmVzcy5tZXNoKTtcclxuICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLnNjZW5lLCB0aGlzLmNhbWVyYSk7XHJcbiAgICAgICAgdGhpcy50YXNrcy5jbGVhcigpO1xyXG4gICAgICAgIHRoaXMudGFza3MucHVzaFRhc2sodGhpcy5iYXNpY0lucHV0LnVwZGF0ZS5iaW5kKHRoaXMuYmFzaWNJbnB1dCkpO1xyXG4gICAgICAgIHRoaXMudGFza3MucHVzaFRhc2sodGhpcy5pbml0LmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc3RhcnQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMubWFpbigpO1xyXG4gICAgICB9KTtcclxuICB9XHJcblxyXG4gIGNoZWNrVmlzaWJpbGl0eUFQSSgpIHtcclxuICAgIC8vIGhpZGRlbiDjg5fjg63jg5Hjg4bjgqPjgYrjgojjgbPlj6/oppbmgKfjga7lpInmm7TjgqTjg5njg7Pjg4jjga7lkI3liY3jgpLoqK3lrppcclxuICAgIGlmICh0eXBlb2YgZG9jdW1lbnQuaGlkZGVuICE9PSBcInVuZGVmaW5lZFwiKSB7IC8vIE9wZXJhIDEyLjEwIOOChCBGaXJlZm94IDE4IOS7pemZjeOBp+OCteODneODvOODiCBcclxuICAgICAgdGhpcy5oaWRkZW4gPSBcImhpZGRlblwiO1xyXG4gICAgICB3aW5kb3cudmlzaWJpbGl0eUNoYW5nZSA9IFwidmlzaWJpbGl0eWNoYW5nZVwiO1xyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZG9jdW1lbnQubW96SGlkZGVuICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgIHRoaXMuaGlkZGVuID0gXCJtb3pIaWRkZW5cIjtcclxuICAgICAgd2luZG93LnZpc2liaWxpdHlDaGFuZ2UgPSBcIm1venZpc2liaWxpdHljaGFuZ2VcIjtcclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRvY3VtZW50Lm1zSGlkZGVuICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgIHRoaXMuaGlkZGVuID0gXCJtc0hpZGRlblwiO1xyXG4gICAgICB3aW5kb3cudmlzaWJpbGl0eUNoYW5nZSA9IFwibXN2aXNpYmlsaXR5Y2hhbmdlXCI7XHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkb2N1bWVudC53ZWJraXRIaWRkZW4gIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgdGhpcy5oaWRkZW4gPSBcIndlYmtpdEhpZGRlblwiO1xyXG4gICAgICB3aW5kb3cudmlzaWJpbGl0eUNoYW5nZSA9IFwid2Via2l0dmlzaWJpbGl0eWNoYW5nZVwiO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBjYWxjU2NyZWVuU2l6ZSgpIHtcclxuICAgIHZhciB3aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xyXG4gICAgdmFyIGhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcclxuICAgIGlmICh3aWR0aCA+PSBoZWlnaHQpIHtcclxuICAgICAgd2lkdGggPSBoZWlnaHQgKiBzZmcuVklSVFVBTF9XSURUSCAvIHNmZy5WSVJUVUFMX0hFSUdIVDtcclxuICAgICAgd2hpbGUgKHdpZHRoID4gd2luZG93LmlubmVyV2lkdGgpIHtcclxuICAgICAgICAtLWhlaWdodDtcclxuICAgICAgICB3aWR0aCA9IGhlaWdodCAqIHNmZy5WSVJUVUFMX1dJRFRIIC8gc2ZnLlZJUlRVQUxfSEVJR0hUO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBoZWlnaHQgPSB3aWR0aCAqIHNmZy5WSVJUVUFMX0hFSUdIVCAvIHNmZy5WSVJUVUFMX1dJRFRIO1xyXG4gICAgICB3aGlsZSAoaGVpZ2h0ID4gd2luZG93LmlubmVySGVpZ2h0KSB7XHJcbiAgICAgICAgLS13aWR0aDtcclxuICAgICAgICBoZWlnaHQgPSB3aWR0aCAqIHNmZy5WSVJUVUFMX0hFSUdIVCAvIHNmZy5WSVJUVUFMX1dJRFRIO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLkNPTlNPTEVfV0lEVEggPSB3aWR0aDtcclxuICAgIHRoaXMuQ09OU09MRV9IRUlHSFQgPSBoZWlnaHQ7XHJcbiAgfVxyXG4gIFxyXG4gIC8vLyDjgrPjg7Pjgr3jg7zjg6vnlLvpnaLjga7liJ3mnJ/ljJZcclxuICBpbml0Q29uc29sZShjb25zb2xlQ2xhc3MpIHtcclxuICAgIC8vIOODrOODs+ODgOODqeODvOOBruS9nOaIkFxyXG4gICAgdGhpcy5yZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKHsgYW50aWFsaWFzOiBmYWxzZSwgc29ydE9iamVjdHM6IHRydWUgfSk7XHJcbiAgICB2YXIgcmVuZGVyZXIgPSB0aGlzLnJlbmRlcmVyO1xyXG4gICAgdGhpcy5jYWxjU2NyZWVuU2l6ZSgpO1xyXG4gICAgcmVuZGVyZXIuc2V0U2l6ZSh0aGlzLkNPTlNPTEVfV0lEVEgsIHRoaXMuQ09OU09MRV9IRUlHSFQpO1xyXG4gICAgcmVuZGVyZXIuc2V0Q2xlYXJDb2xvcigwLCAxKTtcclxuICAgIHJlbmRlcmVyLmRvbUVsZW1lbnQuaWQgPSAnY29uc29sZSc7XHJcbiAgICByZW5kZXJlci5kb21FbGVtZW50LmNsYXNzTmFtZSA9IGNvbnNvbGVDbGFzcyB8fCAnY29uc29sZSc7XHJcbiAgICByZW5kZXJlci5kb21FbGVtZW50LnN0eWxlLnpJbmRleCA9IDA7XHJcblxyXG5cclxuICAgIGQzLnNlbGVjdCgnI2NvbnRlbnQnKS5ub2RlKCkuYXBwZW5kQ2hpbGQocmVuZGVyZXIuZG9tRWxlbWVudCk7XHJcblxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICgpID0+IHtcclxuICAgICAgdGhpcy5jYWxjU2NyZWVuU2l6ZSgpO1xyXG4gICAgICByZW5kZXJlci5zZXRTaXplKHRoaXMuQ09OU09MRV9XSURUSCwgdGhpcy5DT05TT0xFX0hFSUdIVCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyDjgrfjg7zjg7Pjga7kvZzmiJBcclxuICAgIHRoaXMuc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcclxuXHJcbiAgICAvLyDjgqvjg6Hjg6njga7kvZzmiJBcclxuICAgIHRoaXMuY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDkwLjAsIHNmZy5WSVJUVUFMX1dJRFRIIC8gc2ZnLlZJUlRVQUxfSEVJR0hUKTtcclxuICAgIHRoaXMuY2FtZXJhLnBvc2l0aW9uLnogPSBzZmcuVklSVFVBTF9IRUlHSFQgLyAyO1xyXG4gICAgdGhpcy5jYW1lcmEubG9va0F0KG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApKTtcclxuXHJcbiAgICAvLyDjg6njgqTjg4jjga7kvZzmiJBcclxuICAgIC8vdmFyIGxpZ2h0ID0gbmV3IFRIUkVFLkRpcmVjdGlvbmFsTGlnaHQoMHhmZmZmZmYpO1xyXG4gICAgLy9saWdodC5wb3NpdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKDAuNTc3LCAwLjU3NywgMC41NzcpO1xyXG4gICAgLy9zY2VuZS5hZGQobGlnaHQpO1xyXG5cclxuICAgIC8vdmFyIGFtYmllbnQgPSBuZXcgVEhSRUUuQW1iaWVudExpZ2h0KDB4ZmZmZmZmKTtcclxuICAgIC8vc2NlbmUuYWRkKGFtYmllbnQpO1xyXG4gICAgcmVuZGVyZXIuY2xlYXIoKTtcclxuICB9XHJcblxyXG4gIC8vLyDjgqjjg6njg7zjgafntYLkuobjgZnjgovjgIJcclxuICBFeGl0RXJyb3IoZSkge1xyXG4gICAgLy9jdHguZmlsbFN0eWxlID0gXCJyZWRcIjtcclxuICAgIC8vY3R4LmZpbGxSZWN0KDAsIDAsIENPTlNPTEVfV0lEVEgsIENPTlNPTEVfSEVJR0hUKTtcclxuICAgIC8vY3R4LmZpbGxTdHlsZSA9IFwid2hpdGVcIjtcclxuICAgIC8vY3R4LmZpbGxUZXh0KFwiRXJyb3IgOiBcIiArIGUsIDAsIDIwKTtcclxuICAgIC8vLy9hbGVydChlKTtcclxuICAgIHRoaXMuc3RhcnQgPSBmYWxzZTtcclxuICAgIHRocm93IGU7XHJcbiAgfVxyXG5cclxuICBvblZpc2liaWxpdHlDaGFuZ2UoKSB7XHJcbiAgICB2YXIgaCA9IGRvY3VtZW50W3RoaXMuaGlkZGVuXTtcclxuICAgIHRoaXMuaXNIaWRkZW4gPSBoO1xyXG4gICAgaWYgKGgpIHtcclxuICAgICAgdGhpcy5wYXVzZSgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5yZXN1bWUoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHBhdXNlKCkge1xyXG4gICAgaWYgKHNmZy5nYW1lVGltZXIuc3RhdHVzID09IHNmZy5nYW1lVGltZXIuU1RBUlQpIHtcclxuICAgICAgc2ZnLmdhbWVUaW1lci5wYXVzZSgpO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuc2VxdWVuY2VyLnN0YXR1cyA9PSB0aGlzLnNlcXVlbmNlci5QTEFZKSB7XHJcbiAgICAgIHRoaXMuc2VxdWVuY2VyLnBhdXNlKCk7XHJcbiAgICB9XHJcbiAgICBzZmcucGF1c2UgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgcmVzdW1lKCkge1xyXG4gICAgaWYgKHNmZy5nYW1lVGltZXIuc3RhdHVzID09IHNmZy5nYW1lVGltZXIuUEFVU0UpIHtcclxuICAgICAgc2ZnLmdhbWVUaW1lci5yZXN1bWUoKTtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnNlcXVlbmNlci5zdGF0dXMgPT0gdGhpcy5zZXF1ZW5jZXIuUEFVU0UpIHtcclxuICAgICAgdGhpcy5zZXF1ZW5jZXIucmVzdW1lKCk7XHJcbiAgICB9XHJcbiAgICBzZmcucGF1c2UgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8vLyDnj77lnKjmmYLplpPjga7lj5blvpdcclxuICBnZXRDdXJyZW50VGltZSgpIHtcclxuICAgIHJldHVybiB0aGlzLmF1ZGlvXy5hdWRpb2N0eC5jdXJyZW50VGltZTtcclxuICB9XHJcblxyXG4gIC8vLyDjg5bjg6njgqbjgrbjga7mqZ/og73jg4Hjgqfjg4Pjgq9cclxuICBjaGVja0Jyb3dzZXJTdXBwb3J0KCkge1xyXG4gICAgdmFyIGNvbnRlbnQgPSAnPGltZyBjbGFzcz1cImVycm9yaW1nXCIgc3JjPVwiaHR0cDovL3B1YmxpYy5ibHUubGl2ZWZpbGVzdG9yZS5jb20veTJwYlkzYXFCejZ3ejRhaDg3UlhFVms1Q2xoRDJMdWpDNU5zNjZIS3ZSODlhanJGZExNMFR4RmVyWVlVUnQ4M2NfYmczNUhTa3FjM0U4R3hhRkQ4LVg5NE1Mc0ZWNUdVNkJZcDE5NUl2ZWdldlEvMjAxMzEwMDEucG5nP3BzaWQ9MVwiIHdpZHRoPVwiNDc5XCIgaGVpZ2h0PVwiNjQwXCIgY2xhc3M9XCJhbGlnbm5vbmVcIiAvPic7XHJcbiAgICAvLyBXZWJHTOOBruOCteODneODvOODiOODgeOCp+ODg+OCr1xyXG4gICAgaWYgKCFEZXRlY3Rvci53ZWJnbCkge1xyXG4gICAgICBkMy5zZWxlY3QoJyNjb250ZW50JykuYXBwZW5kKCdkaXYnKS5jbGFzc2VkKCdlcnJvcicsIHRydWUpLmh0bWwoXHJcbiAgICAgICAgY29udGVudCArICc8cCBjbGFzcz1cImVycm9ydGV4dFwiPuODluODqeOCpuOCtuOBjDxici8+V2ViR0zjgpLjgrXjg53jg7zjg4jjgZfjgabjgYTjgarjgYTjgZ/jgoE8YnIvPuWLleS9nOOBhOOBn+OBl+OBvuOBm+OCk+OAgjwvcD4nKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFdlYiBBdWRpbyBBUEnjg6njg4Pjg5Hjg7xcclxuICAgIGlmICghdGhpcy5hdWRpb18uZW5hYmxlKSB7XHJcbiAgICAgIGQzLnNlbGVjdCgnI2NvbnRlbnQnKS5hcHBlbmQoJ2RpdicpLmNsYXNzZWQoJ2Vycm9yJywgdHJ1ZSkuaHRtbChcclxuICAgICAgICBjb250ZW50ICsgJzxwIGNsYXNzPVwiZXJyb3J0ZXh0XCI+44OW44Op44Km44K244GMPGJyLz5XZWIgQXVkaW8gQVBJ44KS44K144Od44O844OI44GX44Gm44GE44Gq44GE44Gf44KBPGJyLz7li5XkvZzjgYTjgZ/jgZfjgb7jgZvjgpPjgII8L3A+Jyk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyDjg5bjg6njgqbjgrbjgYxQYWdlIFZpc2liaWxpdHkgQVBJIOOCkuOCteODneODvOODiOOBl+OBquOBhOWgtOWQiOOBq+itpuWRiiBcclxuICAgIGlmICh0eXBlb2YgdGhpcy5oaWRkZW4gPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIGQzLnNlbGVjdCgnI2NvbnRlbnQnKS5hcHBlbmQoJ2RpdicpLmNsYXNzZWQoJ2Vycm9yJywgdHJ1ZSkuaHRtbChcclxuICAgICAgICBjb250ZW50ICsgJzxwIGNsYXNzPVwiZXJyb3J0ZXh0XCI+44OW44Op44Km44K244GMPGJyLz5QYWdlIFZpc2liaWxpdHkgQVBJ44KS44K144Od44O844OI44GX44Gm44GE44Gq44GE44Gf44KBPGJyLz7li5XkvZzjgYTjgZ/jgZfjgb7jgZvjgpPjgII8L3A+Jyk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodHlwZW9mIGxvY2FsU3RvcmFnZSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgZDMuc2VsZWN0KCcjY29udGVudCcpLmFwcGVuZCgnZGl2JykuY2xhc3NlZCgnZXJyb3InLCB0cnVlKS5odG1sKFxyXG4gICAgICAgIGNvbnRlbnQgKyAnPHAgY2xhc3M9XCJlcnJvcnRleHRcIj7jg5bjg6njgqbjgrbjgYw8YnIvPldlYiBMb2NhbCBTdG9yYWdl44KS44K144Od44O844OI44GX44Gm44GE44Gq44GE44Gf44KBPGJyLz7li5XkvZzjgYTjgZ/jgZfjgb7jgZvjgpPjgII8L3A+Jyk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuc3RvcmFnZSA9IGxvY2FsU3RvcmFnZTtcclxuICAgIH1cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuIFxyXG4gIC8vLyDjgrLjg7zjg6Djg6HjgqTjg7NcclxuICBtYWluKCkge1xyXG4gICAgLy8g44K/44K544Kv44Gu5ZG844Gz5Ye644GXXHJcbiAgICAvLyDjg6HjgqTjg7Pjgavmj4/nlLtcclxuICAgIGlmICh0aGlzLnN0YXJ0KSB7XHJcbiAgICAgIHRoaXMudGFza3MucHJvY2Vzcyh0aGlzKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGxvYWRSZXNvdXJjZXMoKSB7XHJcbiAgICAvLy8g44Ky44O844Og5Lit44Gu44OG44Kv44K544OB44Oj44O85a6a576pXHJcbiAgICB2YXIgdGV4dHVyZXMgPSB7XHJcbiAgICAgIGZvbnQ6ICdGb250LnBuZycsXHJcbiAgICAgIGZvbnQxOiAnRm9udDIucG5nJyxcclxuICAgICAgYXV0aG9yOiAnYXV0aG9yLnBuZycsXHJcbiAgICAgIHRpdGxlOiAnVElUTEUucG5nJyxcclxuICAgICAgbXlzaGlwOiAnbXlzaGlwMi5wbmcnLFxyXG4gICAgICBlbmVteTogJ2VuZW15LnBuZycsXHJcbiAgICAgIGJvbWI6ICdib21iLnBuZydcclxuICAgIH07XHJcbiAgICAvLy8g44OG44Kv44K544OB44Oj44O844Gu44Ot44O844OJXHJcbiAgXHJcbiAgICB2YXIgbG9hZFByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoKTtcclxuICAgIHZhciBsb2FkZXIgPSBuZXcgVEhSRUUuVGV4dHVyZUxvYWRlcigpO1xyXG4gICAgZnVuY3Rpb24gbG9hZFRleHR1cmUoc3JjKSB7XHJcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgbG9hZGVyLmxvYWQoc3JjLCAodGV4dHVyZSkgPT4ge1xyXG4gICAgICAgICAgdGV4dHVyZS5tYWdGaWx0ZXIgPSBUSFJFRS5OZWFyZXN0RmlsdGVyO1xyXG4gICAgICAgICAgdGV4dHVyZS5taW5GaWx0ZXIgPSBUSFJFRS5MaW5lYXJNaXBNYXBMaW5lYXJGaWx0ZXI7XHJcbiAgICAgICAgICByZXNvbHZlKHRleHR1cmUpO1xyXG4gICAgICAgIH0sIG51bGwsICh4aHIpID0+IHsgcmVqZWN0KHhocikgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciB0ZXhMZW5ndGggPSBPYmplY3Qua2V5cyh0ZXh0dXJlcykubGVuZ3RoO1xyXG4gICAgdmFyIHRleENvdW50ID0gMDtcclxuICAgIHRoaXMucHJvZ3Jlc3MgPSBuZXcgZ3JhcGhpY3MuUHJvZ3Jlc3MoKTtcclxuICAgIHRoaXMucHJvZ3Jlc3MubWVzaC5wb3NpdGlvbi56ID0gMC4wMDE7XHJcbiAgICB0aGlzLnByb2dyZXNzLnJlbmRlcignTG9hZGluZyBSZXNvdWNlcyAuLi4nLCAwKTtcclxuICAgIHRoaXMuc2NlbmUuYWRkKHRoaXMucHJvZ3Jlc3MubWVzaCk7XHJcbiAgICBmb3IgKHZhciBuIGluIHRleHR1cmVzKSB7XHJcbiAgICAgICgobmFtZSwgdGV4UGF0aCkgPT4ge1xyXG4gICAgICAgIGxvYWRQcm9taXNlID0gbG9hZFByb21pc2VcclxuICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGxvYWRUZXh0dXJlKCcuL3Jlcy8nICsgdGV4UGF0aCk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLnRoZW4oKHRleCkgPT4ge1xyXG4gICAgICAgICAgICB0ZXhDb3VudCsrO1xyXG4gICAgICAgICAgICB0aGlzLnByb2dyZXNzLnJlbmRlcignTG9hZGluZyBSZXNvdWNlcyAuLi4nLCAodGV4Q291bnQgLyB0ZXhMZW5ndGggKiAxMDApIHwgMCk7XHJcbiAgICAgICAgICAgIHNmZy50ZXh0dXJlRmlsZXNbbmFtZV0gPSB0ZXg7XHJcbiAgICAgICAgICAgIHRoaXMucmVuZGVyZXIucmVuZGVyKHRoaXMuc2NlbmUsIHRoaXMuY2FtZXJhKTtcclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH0pKG4sIHRleHR1cmVzW25dKTtcclxuICAgIH1cclxuICAgIHJldHVybiBsb2FkUHJvbWlzZTtcclxuICB9XHJcblxyXG4qcmVuZGVyKHRhc2tJbmRleCkge1xyXG4gIHdoaWxlKHRhc2tJbmRleCA+PSAwKXtcclxuICAgIHRoaXMucmVuZGVyZXIucmVuZGVyKHRoaXMuc2NlbmUsIHRoaXMuY2FtZXJhKTtcclxuICAgIHRoaXMudGV4dFBsYW5lLnJlbmRlcigpO1xyXG4gICAgdGhpcy5zdGF0cyAmJiB0aGlzLnN0YXRzLnVwZGF0ZSgpO1xyXG4gICAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgfVxyXG59XHJcblxyXG5pbml0QWN0b3JzKClcclxue1xyXG4gIGxldCBwcm9taXNlcyA9IFtdO1xyXG4gIHRoaXMuc2NlbmUgPSB0aGlzLnNjZW5lIHx8IG5ldyBUSFJFRS5TY2VuZSgpO1xyXG4gIHRoaXMuZW5lbXlCdWxsZXRzID0gdGhpcy5lbmVteUJ1bGxldHMgfHwgbmV3IGVuZW1pZXMuRW5lbXlCdWxsZXRzKHRoaXMuc2NlbmUsIHRoaXMuc2UuYmluZCh0aGlzKSk7XHJcbiAgdGhpcy5lbmVtaWVzID0gdGhpcy5lbmVtaWVzIHx8IG5ldyBlbmVtaWVzLkVuZW1pZXModGhpcy5zY2VuZSwgdGhpcy5zZS5iaW5kKHRoaXMpLCB0aGlzLmVuZW15QnVsbGV0cyk7XHJcbiAgcHJvbWlzZXMucHVzaCh0aGlzLmVuZW1pZXMubG9hZFBhdHRlcm5zKCkpO1xyXG4gIHByb21pc2VzLnB1c2godGhpcy5lbmVtaWVzLmxvYWRGb3JtYXRpb25zKCkpO1xyXG4gIHRoaXMuYm9tYnMgPSBzZmcuYm9tYnMgPSB0aGlzLmJvbWJzIHx8IG5ldyBlZmZlY3RvYmouQm9tYnModGhpcy5zY2VuZSwgdGhpcy5zZS5iaW5kKHRoaXMpKTtcclxuICB0aGlzLm15c2hpcF8gPSB0aGlzLm15c2hpcF8gfHwgbmV3IG15c2hpcC5NeVNoaXAoMCwgLTEwMCwgMC4xLCB0aGlzLnNjZW5lLCB0aGlzLnNlLmJpbmQodGhpcykpO1xyXG4gIHNmZy5teXNoaXBfID0gdGhpcy5teXNoaXBfO1xyXG4gIHRoaXMubXlzaGlwXy5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxuXHJcbiAgdGhpcy5zcGFjZUZpZWxkID0gbnVsbDtcclxuICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xyXG59XHJcblxyXG5pbml0Q29tbUFuZEhpZ2hTY29yZSgpXHJcbntcclxuICAvLyDjg4/jg7Pjg4njg6vjg43jg7zjg6Djga7lj5blvpdcclxuICB0aGlzLmhhbmRsZU5hbWUgPSB0aGlzLnN0b3JhZ2UuZ2V0SXRlbSgnaGFuZGxlTmFtZScpO1xyXG5cclxuICB0aGlzLnRleHRQbGFuZSA9IG5ldyB0ZXh0LlRleHRQbGFuZSh0aGlzLnNjZW5lKTtcclxuICAvLyB0ZXh0UGxhbmUucHJpbnQoMCwgMCwgXCJXZWIgQXVkaW8gQVBJIFRlc3RcIiwgbmV3IFRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gIC8vIOOCueOCs+OCouaDheWgsSDpgJrkv6HnlKhcclxuICB0aGlzLmNvbW1fID0gbmV3IGNvbW0uQ29tbSgpO1xyXG4gIHRoaXMuY29tbV8udXBkYXRlSGlnaFNjb3JlcyA9IChkYXRhKSA9PiB7XHJcbiAgICB0aGlzLmhpZ2hTY29yZXMgPSBkYXRhO1xyXG4gICAgdGhpcy5oaWdoU2NvcmUgPSB0aGlzLmhpZ2hTY29yZXNbMF0uc2NvcmU7XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5jb21tXy51cGRhdGVIaWdoU2NvcmUgPSAoZGF0YSkgPT4ge1xyXG4gICAgaWYgKHRoaXMuaGlnaFNjb3JlIDwgZGF0YS5zY29yZSkge1xyXG4gICAgICB0aGlzLmhpZ2hTY29yZSA9IGRhdGEuc2NvcmU7XHJcbiAgICAgIHRoaXMucHJpbnRTY29yZSgpO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgXHJcbn1cclxuXHJcbippbml0KHRhc2tJbmRleCkge1xyXG4gICAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgICB0aGlzLmluaXRDb21tQW5kSGlnaFNjb3JlKCk7XHJcbiAgICB0aGlzLmJhc2ljSW5wdXQuYmluZCgpO1xyXG4gICAgdGhpcy5pbml0QWN0b3JzKClcclxuICAgIC50aGVuKCgpPT57XHJcbiAgICAgIHRoaXMudGFza3MucHVzaFRhc2sodGhpcy5yZW5kZXIuYmluZCh0aGlzKSwgdGhpcy5SRU5ERVJFUl9QUklPUklUWSk7XHJcbiAgICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLnByaW50QXV0aG9yLmJpbmQodGhpcykpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbi8vLyDkvZzogIXooajnpLpcclxuKnByaW50QXV0aG9yKHRhc2tJbmRleCkge1xyXG4gIGNvbnN0IHdhaXQgPSA2MDtcclxuICB0aGlzLmJhc2ljSW5wdXQua2V5QnVmZmVyLmxlbmd0aCA9IDA7XHJcbiAgXHJcbiAgbGV0IG5leHRUYXNrID0gKCk9PntcclxuICAgIHRoaXMuc2NlbmUucmVtb3ZlKHRoaXMuYXV0aG9yKTtcclxuICAgIC8vc2NlbmUubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuaW5pdFRpdGxlLmJpbmQodGhpcykpO1xyXG4gIH1cclxuICBcclxuICBsZXQgY2hlY2tLZXlJbnB1dCA9ICgpPT4ge1xyXG4gICAgaWYgKHRoaXMuYmFzaWNJbnB1dC5rZXlCdWZmZXIubGVuZ3RoID4gMCB8fCB0aGlzLmJhc2ljSW5wdXQuc3RhcnQpIHtcclxuICAgICAgdGhpcy5iYXNpY0lucHV0LmtleUJ1ZmZlci5sZW5ndGggPSAwO1xyXG4gICAgICBuZXh0VGFzaygpO1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9ICBcclxuXHJcbiAgLy8g5Yid5pyf5YyWXHJcbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gIHZhciB3ID0gc2ZnLnRleHR1cmVGaWxlcy5hdXRob3IuaW1hZ2Uud2lkdGg7XHJcbiAgdmFyIGggPSBzZmcudGV4dHVyZUZpbGVzLmF1dGhvci5pbWFnZS5oZWlnaHQ7XHJcbiAgY2FudmFzLndpZHRoID0gdztcclxuICBjYW52YXMuaGVpZ2h0ID0gaDtcclxuICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgY3R4LmRyYXdJbWFnZShzZmcudGV4dHVyZUZpbGVzLmF1dGhvci5pbWFnZSwgMCwgMCk7XHJcbiAgdmFyIGRhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIHcsIGgpO1xyXG4gIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5HZW9tZXRyeSgpO1xyXG5cclxuICBnZW9tZXRyeS52ZXJ0X3N0YXJ0ID0gW107XHJcbiAgZ2VvbWV0cnkudmVydF9lbmQgPSBbXTtcclxuXHJcbiAge1xyXG4gICAgdmFyIGkgPSAwO1xyXG5cclxuICAgIGZvciAodmFyIHkgPSAwOyB5IDwgaDsgKyt5KSB7XHJcbiAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgdzsgKyt4KSB7XHJcbiAgICAgICAgdmFyIGNvbG9yID0gbmV3IFRIUkVFLkNvbG9yKCk7XHJcblxyXG4gICAgICAgIHZhciByID0gZGF0YS5kYXRhW2krK107XHJcbiAgICAgICAgdmFyIHNmZyA9IGRhdGEuZGF0YVtpKytdO1xyXG4gICAgICAgIHZhciBiID0gZGF0YS5kYXRhW2krK107XHJcbiAgICAgICAgdmFyIGEgPSBkYXRhLmRhdGFbaSsrXTtcclxuICAgICAgICBpZiAoYSAhPSAwKSB7XHJcbiAgICAgICAgICBjb2xvci5zZXRSR0IociAvIDI1NS4wLCBzZmcgLyAyNTUuMCwgYiAvIDI1NS4wKTtcclxuICAgICAgICAgIHZhciB2ZXJ0ID0gbmV3IFRIUkVFLlZlY3RvcjMoKCh4IC0gdyAvIDIuMCkpLCAoKHkgLSBoIC8gMikpICogLTEsIDAuMCk7XHJcbiAgICAgICAgICB2YXIgdmVydDIgPSBuZXcgVEhSRUUuVmVjdG9yMygxMjAwICogTWF0aC5yYW5kb20oKSAtIDYwMCwgMTIwMCAqIE1hdGgucmFuZG9tKCkgLSA2MDAsIDEyMDAgKiBNYXRoLnJhbmRvbSgpIC0gNjAwKTtcclxuICAgICAgICAgIGdlb21ldHJ5LnZlcnRfc3RhcnQucHVzaChuZXcgVEhSRUUuVmVjdG9yMyh2ZXJ0Mi54IC0gdmVydC54LCB2ZXJ0Mi55IC0gdmVydC55LCB2ZXJ0Mi56IC0gdmVydC56KSk7XHJcbiAgICAgICAgICBnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKHZlcnQyKTtcclxuICAgICAgICAgIGdlb21ldHJ5LnZlcnRfZW5kLnB1c2godmVydCk7XHJcbiAgICAgICAgICBnZW9tZXRyeS5jb2xvcnMucHVzaChjb2xvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyDjg57jg4bjg6rjgqLjg6vjgpLkvZzmiJBcclxuICAvL3ZhciB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSgnaW1hZ2VzL3BhcnRpY2xlMS5wbmcnKTtcclxuICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuUG9pbnRzTWF0ZXJpYWwoe3NpemU6IDIwLCBibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZyxcclxuICAgIHRyYW5zcGFyZW50OiB0cnVlLCB2ZXJ0ZXhDb2xvcnM6IHRydWUsIGRlcHRoVGVzdDogZmFsc2UvLywgbWFwOiB0ZXh0dXJlXHJcbiAgfSk7XHJcblxyXG4gIHRoaXMuYXV0aG9yID0gbmV3IFRIUkVFLlBvaW50cyhnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gIC8vICAgIGF1dGhvci5wb3NpdGlvbi54IGF1dGhvci5wb3NpdGlvbi55PSAgPTAuMCwgMC4wLCAwLjApO1xyXG5cclxuICAvL21lc2guc29ydFBhcnRpY2xlcyA9IGZhbHNlO1xyXG4gIC8vdmFyIG1lc2gxID0gbmV3IFRIUkVFLlBhcnRpY2xlU3lzdGVtKCk7XHJcbiAgLy9tZXNoLnNjYWxlLnggPSBtZXNoLnNjYWxlLnkgPSA4LjA7XHJcblxyXG4gIHRoaXMuc2NlbmUuYWRkKHRoaXMuYXV0aG9yKTsgIFxyXG5cclxuIFxyXG4gIC8vIOS9nOiAheihqOekuuOCueODhuODg+ODl++8kVxyXG4gIGZvcihsZXQgY291bnQgPSAxLjA7Y291bnQgPiAwOyhjb3VudCA8PSAwLjAxKT9jb3VudCAtPSAwLjAwMDU6Y291bnQgLT0gMC4wMDI1KVxyXG4gIHtcclxuICAgIC8vIOS9leOBi+OCreODvOWFpeWKm+OBjOOBguOBo+OBn+WgtOWQiOOBr+asoeOBruOCv+OCueOCr+OBuFxyXG4gICAgaWYoY2hlY2tLZXlJbnB1dCgpKXtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsZXQgZW5kID0gdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydGljZXMubGVuZ3RoO1xyXG4gICAgbGV0IHYgPSB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlcztcclxuICAgIGxldCBkID0gdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydF9zdGFydDtcclxuICAgIGxldCB2MiA9IHRoaXMuYXV0aG9yLmdlb21ldHJ5LnZlcnRfZW5kO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgICB2W2ldLnggPSB2MltpXS54ICsgZFtpXS54ICogY291bnQ7XHJcbiAgICAgIHZbaV0ueSA9IHYyW2ldLnkgKyBkW2ldLnkgKiBjb3VudDtcclxuICAgICAgdltpXS56ID0gdjJbaV0ueiArIGRbaV0ueiAqIGNvdW50O1xyXG4gICAgfVxyXG4gICAgdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydGljZXNOZWVkVXBkYXRlID0gdHJ1ZTtcclxuICAgIHRoaXMuYXV0aG9yLnJvdGF0aW9uLnggPSB0aGlzLmF1dGhvci5yb3RhdGlvbi55ID0gdGhpcy5hdXRob3Iucm90YXRpb24ueiA9IGNvdW50ICogNC4wO1xyXG4gICAgdGhpcy5hdXRob3IubWF0ZXJpYWwub3BhY2l0eSA9IDEuMDtcclxuICAgIHlpZWxkO1xyXG4gIH1cclxuICB0aGlzLmF1dGhvci5yb3RhdGlvbi54ID0gdGhpcy5hdXRob3Iucm90YXRpb24ueSA9IHRoaXMuYXV0aG9yLnJvdGF0aW9uLnogPSAwLjA7XHJcblxyXG4gIGZvciAobGV0IGkgPSAwLGUgPSB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlcy5sZW5ndGg7IGkgPCBlOyArK2kpIHtcclxuICAgIHRoaXMuYXV0aG9yLmdlb21ldHJ5LnZlcnRpY2VzW2ldLnggPSB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0X2VuZFtpXS54O1xyXG4gICAgdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydGljZXNbaV0ueSA9IHRoaXMuYXV0aG9yLmdlb21ldHJ5LnZlcnRfZW5kW2ldLnk7XHJcbiAgICB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlc1tpXS56ID0gdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydF9lbmRbaV0uejtcclxuICB9XHJcbiAgdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydGljZXNOZWVkVXBkYXRlID0gdHJ1ZTtcclxuXHJcbiAgLy8g5b6F44GhXHJcbiAgZm9yKGxldCBpID0gMDtpIDwgd2FpdDsrK2kpe1xyXG4gICAgLy8g5L2V44GL44Kt44O85YWl5Yqb44GM44GC44Gj44Gf5aC05ZCI44Gv5qyh44Gu44K/44K544Kv44G4XHJcbiAgICBpZihjaGVja0tleUlucHV0KCkpe1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5hdXRob3IubWF0ZXJpYWwuc2l6ZSA+IDIpIHtcclxuICAgICAgdGhpcy5hdXRob3IubWF0ZXJpYWwuc2l6ZSAtPSAwLjU7XHJcbiAgICAgIHRoaXMuYXV0aG9yLm1hdGVyaWFsLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIH0gICAgXHJcbiAgICB5aWVsZDtcclxuICB9XHJcblxyXG4gIC8vIOODleOCp+ODvOODieOCouOCpuODiFxyXG4gIGZvcihsZXQgY291bnQgPSAwLjA7Y291bnQgPD0gMS4wO2NvdW50ICs9IDAuMDUpXHJcbiAge1xyXG4gICAgLy8g5L2V44GL44Kt44O85YWl5Yqb44GM44GC44Gj44Gf5aC05ZCI44Gv5qyh44Gu44K/44K544Kv44G4XHJcbiAgICBpZihjaGVja0tleUlucHV0KCkpe1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB0aGlzLmF1dGhvci5tYXRlcmlhbC5vcGFjaXR5ID0gMS4wIC0gY291bnQ7XHJcbiAgICB0aGlzLmF1dGhvci5tYXRlcmlhbC5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICBcclxuICAgIHlpZWxkO1xyXG4gIH1cclxuXHJcbiAgdGhpcy5hdXRob3IubWF0ZXJpYWwub3BhY2l0eSA9IDAuMDsgXHJcbiAgdGhpcy5hdXRob3IubWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG5cclxuICAvLyDlvoXjgaFcclxuICBmb3IobGV0IGkgPSAwO2kgPCB3YWl0OysraSl7XHJcbiAgICAvLyDkvZXjgYvjgq3jg7zlhaXlipvjgYzjgYLjgaPjgZ/loLTlkIjjga/mrKHjga7jgr/jgrnjgq/jgbhcclxuICAgIGlmKGNoZWNrS2V5SW5wdXQoKSl7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHlpZWxkO1xyXG4gIH1cclxuICBuZXh0VGFzaygpO1xyXG59XHJcblxyXG4vLy8g44K/44Kk44OI44Or55S76Z2i5Yid5pyf5YyWIC8vL1xyXG4qaW5pdFRpdGxlKHRhc2tJbmRleCkge1xyXG4gIFxyXG4gIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gIFxyXG4gIHRoaXMuYmFzaWNJbnB1dC5jbGVhcigpO1xyXG5cclxuICAvLyDjgr/jgqTjg4jjg6vjg6Hjg4Pjgrfjg6Xjga7kvZzmiJDjg7vooajnpLogLy8vXHJcbiAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgbWFwOiBzZmcudGV4dHVyZUZpbGVzLnRpdGxlIH0pO1xyXG4gIG1hdGVyaWFsLnNoYWRpbmcgPSBUSFJFRS5GbGF0U2hhZGluZztcclxuICAvL21hdGVyaWFsLmFudGlhbGlhcyA9IGZhbHNlO1xyXG4gIG1hdGVyaWFsLnRyYW5zcGFyZW50ID0gdHJ1ZTtcclxuICBtYXRlcmlhbC5hbHBoYVRlc3QgPSAwLjU7XHJcbiAgbWF0ZXJpYWwuZGVwdGhUZXN0ID0gdHJ1ZTtcclxuICB0aGlzLnRpdGxlID0gbmV3IFRIUkVFLk1lc2goXHJcbiAgICBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeShzZmcudGV4dHVyZUZpbGVzLnRpdGxlLmltYWdlLndpZHRoLCBzZmcudGV4dHVyZUZpbGVzLnRpdGxlLmltYWdlLmhlaWdodCksXHJcbiAgICBtYXRlcmlhbFxyXG4gICAgKTtcclxuICB0aGlzLnRpdGxlLnNjYWxlLnggPSB0aGlzLnRpdGxlLnNjYWxlLnkgPSAwLjg7XHJcbiAgdGhpcy50aXRsZS5wb3NpdGlvbi55ID0gODA7XHJcbiAgdGhpcy5zY2VuZS5hZGQodGhpcy50aXRsZSk7XHJcbiAgdGhpcy5zaG93U3BhY2VGaWVsZCgpO1xyXG4gIC8vLyDjg4bjgq3jgrnjg4jooajnpLpcclxuICB0aGlzLnRleHRQbGFuZS5wcmludCgzLCAyNSwgXCJQdXNoIHogb3IgU1RBUlQgYnV0dG9uXCIsIG5ldyB0ZXh0LlRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gIHNmZy5nYW1lVGltZXIuc3RhcnQoKTtcclxuICB0aGlzLnNob3dUaXRsZS5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDEwLyrnp5IqLztcclxuICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5zaG93VGl0bGUuYmluZCh0aGlzKSk7XHJcbiAgcmV0dXJuO1xyXG59XHJcblxyXG4vLy8g6IOM5pmv44OR44O844OG44Kj44Kv44Or6KGo56S6XHJcbnNob3dTcGFjZUZpZWxkKCkge1xyXG4gIC8vLyDog4zmma/jg5Hjg7zjg4bjgqPjgq/jg6vooajnpLpcclxuICBpZiAoIXRoaXMuc3BhY2VGaWVsZCkge1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkdlb21ldHJ5KCk7XHJcblxyXG4gICAgZ2VvbWV0cnkuZW5keSA9IFtdO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAyNTA7ICsraSkge1xyXG4gICAgICB2YXIgY29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoKTtcclxuICAgICAgdmFyIHogPSAtMTgwMC4wICogTWF0aC5yYW5kb20oKSAtIDMwMC4wO1xyXG4gICAgICBjb2xvci5zZXRIU0woMC4wNSArIE1hdGgucmFuZG9tKCkgKiAwLjA1LCAxLjAsICgtMjEwMCAtIHopIC8gLTIxMDApO1xyXG4gICAgICB2YXIgZW5keSA9IHNmZy5WSVJUVUFMX0hFSUdIVCAvIDIgLSB6ICogc2ZnLlZJUlRVQUxfSEVJR0hUIC8gc2ZnLlZJUlRVQUxfV0lEVEg7XHJcbiAgICAgIHZhciB2ZXJ0MiA9IG5ldyBUSFJFRS5WZWN0b3IzKChzZmcuVklSVFVBTF9XSURUSCAtIHogKiAyKSAqIE1hdGgucmFuZG9tKCkgLSAoKHNmZy5WSVJUVUFMX1dJRFRIIC0geiAqIDIpIC8gMilcclxuICAgICAgICAsIGVuZHkgKiAyICogTWF0aC5yYW5kb20oKSAtIGVuZHksIHopO1xyXG4gICAgICBnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKHZlcnQyKTtcclxuICAgICAgZ2VvbWV0cnkuZW5keS5wdXNoKGVuZHkpO1xyXG5cclxuICAgICAgZ2VvbWV0cnkuY29sb3JzLnB1c2goY29sb3IpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIOODnuODhuODquOCouODq+OCkuS9nOaIkFxyXG4gICAgLy92YXIgdGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoJ2ltYWdlcy9wYXJ0aWNsZTEucG5nJyk7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuUG9pbnRzTWF0ZXJpYWwoe1xyXG4gICAgICBzaXplOiA0LCBibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZyxcclxuICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsIHZlcnRleENvbG9yczogdHJ1ZSwgZGVwdGhUZXN0OiB0cnVlLy8sIG1hcDogdGV4dHVyZVxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5zcGFjZUZpZWxkID0gbmV3IFRIUkVFLlBvaW50cyhnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gICAgdGhpcy5zcGFjZUZpZWxkLnBvc2l0aW9uLnggPSB0aGlzLnNwYWNlRmllbGQucG9zaXRpb24ueSA9IHRoaXMuc3BhY2VGaWVsZC5wb3NpdGlvbi56ID0gMC4wO1xyXG4gICAgdGhpcy5zY2VuZS5hZGQodGhpcy5zcGFjZUZpZWxkKTtcclxuICAgIHRoaXMudGFza3MucHVzaFRhc2sodGhpcy5tb3ZlU3BhY2VGaWVsZC5iaW5kKHRoaXMpKTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDlroflrpnnqbrplpPjga7ooajnpLpcclxuKm1vdmVTcGFjZUZpZWxkKHRhc2tJbmRleCkge1xyXG4gIHdoaWxlKHRydWUpe1xyXG4gICAgdmFyIHZlcnRzID0gdGhpcy5zcGFjZUZpZWxkLmdlb21ldHJ5LnZlcnRpY2VzO1xyXG4gICAgdmFyIGVuZHlzID0gdGhpcy5zcGFjZUZpZWxkLmdlb21ldHJ5LmVuZHk7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gdmVydHMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgdmVydHNbaV0ueSAtPSA0O1xyXG4gICAgICBpZiAodmVydHNbaV0ueSA8IC1lbmR5c1tpXSkge1xyXG4gICAgICAgIHZlcnRzW2ldLnkgPSBlbmR5c1tpXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5zcGFjZUZpZWxkLmdlb21ldHJ5LnZlcnRpY2VzTmVlZFVwZGF0ZSA9IHRydWU7XHJcbiAgICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDjgr/jgqTjg4jjg6vooajnpLpcclxuKnNob3dUaXRsZSh0YXNrSW5kZXgpIHtcclxuIHdoaWxlKHRydWUpe1xyXG4gIHNmZy5nYW1lVGltZXIudXBkYXRlKCk7XHJcblxyXG4gIGlmICh0aGlzLmJhc2ljSW5wdXQueiB8fCB0aGlzLmJhc2ljSW5wdXQuc3RhcnQgKSB7XHJcbiAgICB0aGlzLnNjZW5lLnJlbW92ZSh0aGlzLnRpdGxlKTtcclxuICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLmluaXRIYW5kbGVOYW1lLmJpbmQodGhpcykpO1xyXG4gIH1cclxuICBpZiAodGhpcy5zaG93VGl0bGUuZW5kVGltZSA8IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUpIHtcclxuICAgIHRoaXMuc2NlbmUucmVtb3ZlKHRoaXMudGl0bGUpO1xyXG4gICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuaW5pdFRvcDEwLmJpbmQodGhpcykpO1xyXG4gIH1cclxuICB5aWVsZDtcclxuIH1cclxufVxyXG5cclxuLy8vIOODj+ODs+ODieODq+ODjeODvOODoOOBruOCqOODs+ODiOODquWJjeWIneacn+WMllxyXG4qaW5pdEhhbmRsZU5hbWUodGFza0luZGV4KSB7XHJcbiAgbGV0IGVuZCA9IGZhbHNlO1xyXG4gIGlmICh0aGlzLmVkaXRIYW5kbGVOYW1lKXtcclxuICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLmdhbWVJbml0LmJpbmQodGhpcykpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0aGlzLmVkaXRIYW5kbGVOYW1lID0gdGhpcy5oYW5kbGVOYW1lIHx8ICcnO1xyXG4gICAgdGhpcy50ZXh0UGxhbmUuY2xzKCk7XHJcbiAgICB0aGlzLnRleHRQbGFuZS5wcmludCg0LCAxOCwgJ0lucHV0IHlvdXIgaGFuZGxlIG5hbWUuJyk7XHJcbiAgICB0aGlzLnRleHRQbGFuZS5wcmludCg4LCAxOSwgJyhNYXggOCBDaGFyKScpO1xyXG4gICAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMTAsIDIxLCB0aGlzLmVkaXRIYW5kbGVOYW1lKTtcclxuICAgIC8vICAgIHRleHRQbGFuZS5wcmludCgxMCwgMjEsIGhhbmRsZU5hbWVbMF0sIFRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gICAgdGhpcy5iYXNpY0lucHV0LnVuYmluZCgpO1xyXG4gICAgdmFyIGVsbSA9IGQzLnNlbGVjdCgnI2NvbnRlbnQnKS5hcHBlbmQoJ2lucHV0Jyk7XHJcbiAgICBsZXQgdGhpc18gPSB0aGlzO1xyXG4gICAgZWxtXHJcbiAgICAgIC5hdHRyKCd0eXBlJywgJ3RleHQnKVxyXG4gICAgICAuYXR0cigncGF0dGVybicsICdbYS16QS1aMC05X1xcQFxcI1xcJFxcLV17MCw4fScpXHJcbiAgICAgIC5hdHRyKCdtYXhsZW5ndGgnLCA4KVxyXG4gICAgICAuYXR0cignaWQnLCAnaW5wdXQtYXJlYScpXHJcbiAgICAgIC5hdHRyKCd2YWx1ZScsIHRoaXNfLmVkaXRIYW5kbGVOYW1lKVxyXG4gICAgICAuY2FsbChmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgIGQubm9kZSgpLnNlbGVjdGlvblN0YXJ0ID0gdGhpc18uZWRpdEhhbmRsZU5hbWUubGVuZ3RoO1xyXG4gICAgICB9KVxyXG4gICAgICAub24oJ2JsdXInLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgZDMuZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBkMy5ldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAvL2xldCB0aGlzXyA9IHRoaXM7XHJcbiAgICAgICAgc2V0VGltZW91dCggKCkgPT4geyB0aGlzLmZvY3VzKCk7IH0sIDEwKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5vbigna2V5dXAnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoZDMuZXZlbnQua2V5Q29kZSA9PSAxMykge1xyXG4gICAgICAgICAgdGhpc18uZWRpdEhhbmRsZU5hbWUgPSB0aGlzLnZhbHVlO1xyXG4gICAgICAgICAgbGV0IHMgPSB0aGlzLnNlbGVjdGlvblN0YXJ0O1xyXG4gICAgICAgICAgbGV0IGUgPSB0aGlzLnNlbGVjdGlvbkVuZDtcclxuICAgICAgICAgIHRoaXNfLnRleHRQbGFuZS5wcmludCgxMCwgMjEsIHRoaXNfLmVkaXRIYW5kbGVOYW1lKTtcclxuICAgICAgICAgIHRoaXNfLnRleHRQbGFuZS5wcmludCgxMCArIHMsIDIxLCAnXycsIG5ldyB0ZXh0LlRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLm9uKCdrZXl1cCcsIG51bGwpO1xyXG4gICAgICAgICAgdGhpc18uYmFzaWNJbnB1dC5iaW5kKCk7XHJcbiAgICAgICAgICAvLyDjgZPjga7jgr/jgrnjgq/jgpLntYLjgo/jgonjgZvjgotcclxuICAgICAgICAgIHRoaXNfLnRhc2tzLmFycmF5W3Rhc2tJbmRleF0uZ2VuSW5zdC5uZXh0KC0odGFza0luZGV4ICsgMSkpO1xyXG4gICAgICAgICAgLy8g5qyh44Gu44K/44K544Kv44KS6Kit5a6a44GZ44KLXHJcbiAgICAgICAgICB0aGlzXy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXNfLmdhbWVJbml0LmJpbmQodGhpc18pKTtcclxuICAgICAgICAgIHRoaXNfLnN0b3JhZ2Uuc2V0SXRlbSgnaGFuZGxlTmFtZScsIHRoaXNfLmVkaXRIYW5kbGVOYW1lKTtcclxuICAgICAgICAgIGQzLnNlbGVjdCgnI2lucHV0LWFyZWEnKS5yZW1vdmUoKTtcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpc18uZWRpdEhhbmRsZU5hbWUgPSB0aGlzLnZhbHVlO1xyXG4gICAgICAgIGxldCBzID0gdGhpcy5zZWxlY3Rpb25TdGFydDtcclxuICAgICAgICB0aGlzXy50ZXh0UGxhbmUucHJpbnQoMTAsIDIxLCAnICAgICAgICAgICAnKTtcclxuICAgICAgICB0aGlzXy50ZXh0UGxhbmUucHJpbnQoMTAsIDIxLCB0aGlzXy5lZGl0SGFuZGxlTmFtZSk7XHJcbiAgICAgICAgdGhpc18udGV4dFBsYW5lLnByaW50KDEwICsgcywgMjEsICdfJywgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5jYWxsKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLm5vZGUoKS5zZWxlY3Rpb25TdGFydDtcclxuICAgICAgICB0aGlzXy50ZXh0UGxhbmUucHJpbnQoMTAsIDIxLCAnICAgICAgICAgICAnKTtcclxuICAgICAgICB0aGlzXy50ZXh0UGxhbmUucHJpbnQoMTAsIDIxLCB0aGlzXy5lZGl0SGFuZGxlTmFtZSk7XHJcbiAgICAgICAgdGhpc18udGV4dFBsYW5lLnByaW50KDEwICsgcywgMjEsICdfJywgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgICAgICAgdGhpcy5ub2RlKCkuZm9jdXMoKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgd2hpbGUodGFza0luZGV4ID49IDApXHJcbiAgICB7XHJcbiAgICAgIHRoaXMuYmFzaWNJbnB1dC5jbGVhcigpO1xyXG4gICAgICBpZih0aGlzLmJhc2ljSW5wdXQuYUJ1dHRvbiB8fCB0aGlzLmJhc2ljSW5wdXQuc3RhcnQpXHJcbiAgICAgIHtcclxuICAgICAgICAgIHZhciBpbnB1dEFyZWEgPSBkMy5zZWxlY3QoJyNpbnB1dC1hcmVhJyk7XHJcbiAgICAgICAgICB2YXIgaW5wdXROb2RlID0gaW5wdXRBcmVhLm5vZGUoKTtcclxuICAgICAgICAgIHRoaXMuZWRpdEhhbmRsZU5hbWUgPSBpbnB1dE5vZGUudmFsdWU7XHJcbiAgICAgICAgICBsZXQgcyA9IGlucHV0Tm9kZS5zZWxlY3Rpb25TdGFydDtcclxuICAgICAgICAgIGxldCBlID0gaW5wdXROb2RlLnNlbGVjdGlvbkVuZDtcclxuICAgICAgICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDEwLCAyMSwgdGhpcy5lZGl0SGFuZGxlTmFtZSk7XHJcbiAgICAgICAgICB0aGlzLnRleHRQbGFuZS5wcmludCgxMCArIHMsIDIxLCAnXycsIG5ldyB0ZXh0LlRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gICAgICAgICAgaW5wdXRBcmVhLm9uKCdrZXl1cCcsIG51bGwpO1xyXG4gICAgICAgICAgdGhpcy5iYXNpY0lucHV0LmJpbmQoKTtcclxuICAgICAgICAgIC8vIOOBk+OBruOCv+OCueOCr+OCkue1guOCj+OCieOBm+OCi1xyXG4gICAgICAgICAgLy90aGlzLnRhc2tzLmFycmF5W3Rhc2tJbmRleF0uZ2VuSW5zdC5uZXh0KC0odGFza0luZGV4ICsgMSkpO1xyXG4gICAgICAgICAgLy8g5qyh44Gu44K/44K544Kv44KS6Kit5a6a44GZ44KLXHJcbiAgICAgICAgICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5nYW1lSW5pdC5iaW5kKHRoaXMpKTtcclxuICAgICAgICAgIHRoaXMuc3RvcmFnZS5zZXRJdGVtKCdoYW5kbGVOYW1lJywgdGhpcy5lZGl0SGFuZGxlTmFtZSk7XHJcbiAgICAgICAgICBpbnB1dEFyZWEucmVtb3ZlKCk7XHJcbiAgICAgICAgICByZXR1cm47ICAgICAgICBcclxuICAgICAgfVxyXG4gICAgICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICAgIH1cclxuICAgIHRhc2tJbmRleCA9IC0oKyt0YXNrSW5kZXgpO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOOCueOCs+OCouWKoOeul1xyXG5hZGRTY29yZShzKSB7XHJcbiAgdGhpcy5zY29yZSArPSBzO1xyXG4gIGlmICh0aGlzLnNjb3JlID4gdGhpcy5oaWdoU2NvcmUpIHtcclxuICAgIHRoaXMuaGlnaFNjb3JlID0gdGhpcy5zY29yZTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDjgrnjgrPjgqLooajnpLpcclxucHJpbnRTY29yZSgpIHtcclxuICB2YXIgcyA9ICgnMDAwMDAwMDAnICsgdGhpcy5zY29yZS50b1N0cmluZygpKS5zbGljZSgtOCk7XHJcbiAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMSwgMSwgcyk7XHJcblxyXG4gIHZhciBoID0gKCcwMDAwMDAwMCcgKyB0aGlzLmhpZ2hTY29yZS50b1N0cmluZygpKS5zbGljZSgtOCk7XHJcbiAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMTIsIDEsIGgpO1xyXG5cclxufVxyXG5cclxuLy8vIOOCteOCpuODs+ODieOCqOODleOCp+OCr+ODiFxyXG5zZShpbmRleCkge1xyXG4gIHRoaXMuc2VxdWVuY2VyLnBsYXlUcmFja3ModGhpcy5zb3VuZEVmZmVjdHMuc291bmRFZmZlY3RzW2luZGV4XSk7XHJcbn1cclxuXHJcbi8vLyDjgrLjg7zjg6Djga7liJ3mnJ/ljJZcclxuKmdhbWVJbml0KHRhc2tJbmRleCkge1xyXG5cclxuICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICBcclxuXHJcbiAgLy8g44Kq44O844OH44Kj44Kq44Gu6ZaL5aeLXHJcbiAgdGhpcy5hdWRpb18uc3RhcnQoKTtcclxuICB0aGlzLnNlcXVlbmNlci5sb2FkKGF1ZGlvLnNlcURhdGEpO1xyXG4gIHRoaXMuc2VxdWVuY2VyLnN0YXJ0KCk7XHJcbiAgc2ZnLnN0YWdlLnJlc2V0KCk7XHJcbiAgdGhpcy50ZXh0UGxhbmUuY2xzKCk7XHJcbiAgdGhpcy5lbmVtaWVzLnJlc2V0KCk7XHJcblxyXG4gIC8vIOiHquapn+OBruWIneacn+WMllxyXG4gIHRoaXMubXlzaGlwXy5pbml0KCk7XHJcbiAgc2ZnLmdhbWVUaW1lci5zdGFydCgpO1xyXG4gIHRoaXMuc2NvcmUgPSAwO1xyXG4gIHRoaXMudGV4dFBsYW5lLnByaW50KDIsIDAsICdTY29yZSAgICBIaWdoIFNjb3JlJyk7XHJcbiAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMjAsIDM5LCAnUmVzdDogICAnICsgc2ZnLm15c2hpcF8ucmVzdCk7XHJcbiAgdGhpcy5wcmludFNjb3JlKCk7XHJcbiAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuc3RhZ2VJbml0LmJpbmQodGhpcykvKmdhbWVBY3Rpb24qLyk7XHJcbn1cclxuXHJcbi8vLyDjgrnjg4bjg7zjgrjjga7liJ3mnJ/ljJZcclxuKnN0YWdlSW5pdCh0YXNrSW5kZXgpIHtcclxuICBcclxuICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICBcclxuICB0aGlzLnRleHRQbGFuZS5wcmludCgwLCAzOSwgJ1N0YWdlOicgKyBzZmcuc3RhZ2Uubm8pO1xyXG4gIHNmZy5nYW1lVGltZXIuc3RhcnQoKTtcclxuICB0aGlzLmVuZW1pZXMucmVzZXQoKTtcclxuICB0aGlzLmVuZW1pZXMuc3RhcnQoKTtcclxuICB0aGlzLmVuZW1pZXMuY2FsY0VuZW1pZXNDb3VudChzZmcuc3RhZ2UucHJpdmF0ZU5vKTtcclxuICB0aGlzLmVuZW1pZXMuaGl0RW5lbWllc0NvdW50ID0gMDtcclxuICB0aGlzLnRleHRQbGFuZS5wcmludCg4LCAxNSwgJ1N0YWdlICcgKyAoc2ZnLnN0YWdlLm5vKSArICcgU3RhcnQgISEnLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5zdGFnZVN0YXJ0LmJpbmQodGhpcykpO1xyXG59XHJcblxyXG4vLy8g44K544OG44O844K46ZaL5aeLXHJcbipzdGFnZVN0YXJ0KHRhc2tJbmRleCkge1xyXG4gIGxldCBlbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDI7XHJcbiAgd2hpbGUodGFza0luZGV4ID49IDAgJiYgZW5kVGltZSA+PSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lKXtcclxuICAgIHNmZy5nYW1lVGltZXIudXBkYXRlKCk7XHJcbiAgICBzZmcubXlzaGlwXy5hY3Rpb24odGhpcy5iYXNpY0lucHV0KTtcclxuICAgIHRhc2tJbmRleCA9IHlpZWxkOyAgICBcclxuICB9XHJcbiAgdGhpcy50ZXh0UGxhbmUucHJpbnQoOCwgMTUsICcgICAgICAgICAgICAgICAgICAnLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5nYW1lQWN0aW9uLmJpbmQodGhpcyksIDUwMDApO1xyXG59XHJcblxyXG4vLy8g44Ky44O844Og5LitXHJcbipnYW1lQWN0aW9uKHRhc2tJbmRleCkge1xyXG4gIHdoaWxlICh0YXNrSW5kZXggPj0gMCl7XHJcbiAgICB0aGlzLnByaW50U2NvcmUoKTtcclxuICAgIHNmZy5teXNoaXBfLmFjdGlvbih0aGlzLmJhc2ljSW5wdXQpO1xyXG4gICAgc2ZnLmdhbWVUaW1lci51cGRhdGUoKTtcclxuICAgIC8vY29uc29sZS5sb2coc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSk7XHJcbiAgICB0aGlzLmVuZW1pZXMubW92ZSgpO1xyXG5cclxuICAgIGlmICghdGhpcy5wcm9jZXNzQ29sbGlzaW9uKCkpIHtcclxuICAgICAgLy8g6Z2i44Kv44Oq44Ki44OB44Kn44OD44KvXHJcbiAgICAgIGlmICh0aGlzLmVuZW1pZXMuaGl0RW5lbWllc0NvdW50ID09IHRoaXMuZW5lbWllcy50b3RhbEVuZW1pZXNDb3VudCkge1xyXG4gICAgICAgIHRoaXMucHJpbnRTY29yZSgpO1xyXG4gICAgICAgIHRoaXMuc3RhZ2UuYWR2YW5jZSgpO1xyXG4gICAgICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLnN0YWdlSW5pdC5iaW5kKHRoaXMpKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMubXlTaGlwQm9tYi5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDM7XHJcbiAgICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLm15U2hpcEJvbWIuYmluZCh0aGlzKSk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH07XHJcbiAgICB0YXNrSW5kZXggPSB5aWVsZDsgXHJcbiAgfVxyXG59XHJcblxyXG4vLy8g5b2T44Gf44KK5Yik5a6aXHJcbnByb2Nlc3NDb2xsaXNpb24odGFza0luZGV4KSB7XHJcbiAgLy/jgIDoh6rmqZ/lvL7jgajmlbXjgajjga7jgYLjgZ/jgorliKTlrppcclxuICBsZXQgbXlCdWxsZXRzID0gc2ZnLm15c2hpcF8ubXlCdWxsZXRzO1xyXG4gIHRoaXMuZW5zID0gdGhpcy5lbmVtaWVzLmVuZW1pZXM7XHJcbiAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IG15QnVsbGV0cy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgbGV0IG15YiA9IG15QnVsbGV0c1tpXTtcclxuICAgIGlmIChteWIuZW5hYmxlXykge1xyXG4gICAgICB2YXIgbXliY28gPSBteUJ1bGxldHNbaV0uY29sbGlzaW9uQXJlYTtcclxuICAgICAgdmFyIGxlZnQgPSBteWJjby5sZWZ0ICsgbXliLng7XHJcbiAgICAgIHZhciByaWdodCA9IG15YmNvLnJpZ2h0ICsgbXliLng7XHJcbiAgICAgIHZhciB0b3AgPSBteWJjby50b3AgKyBteWIueTtcclxuICAgICAgdmFyIGJvdHRvbSA9IG15YmNvLmJvdHRvbSAtIG15Yi5zcGVlZCArIG15Yi55O1xyXG4gICAgICBmb3IgKHZhciBqID0gMCwgZW5kaiA9IHRoaXMuZW5zLmxlbmd0aDsgaiA8IGVuZGo7ICsraikge1xyXG4gICAgICAgIHZhciBlbiA9IHRoaXMuZW5zW2pdO1xyXG4gICAgICAgIGlmIChlbi5lbmFibGVfKSB7XHJcbiAgICAgICAgICB2YXIgZW5jbyA9IGVuLmNvbGxpc2lvbkFyZWE7XHJcbiAgICAgICAgICBpZiAodG9wID4gKGVuLnkgKyBlbmNvLmJvdHRvbSkgJiZcclxuICAgICAgICAgICAgKGVuLnkgKyBlbmNvLnRvcCkgPiBib3R0b20gJiZcclxuICAgICAgICAgICAgbGVmdCA8IChlbi54ICsgZW5jby5yaWdodCkgJiZcclxuICAgICAgICAgICAgKGVuLnggKyBlbmNvLmxlZnQpIDwgcmlnaHRcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIGVuLmhpdChteWIpO1xyXG4gICAgICAgICAgICBpZiAobXliLnBvd2VyIDw9IDApIHtcclxuICAgICAgICAgICAgICBteWIuZW5hYmxlXyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8g5pW144Go6Ieq5qmf44Go44Gu44GC44Gf44KK5Yik5a6aXHJcbiAgaWYgKHNmZy5DSEVDS19DT0xMSVNJT04pIHtcclxuICAgIGxldCBteWNvID0gc2ZnLm15c2hpcF8uY29sbGlzaW9uQXJlYTtcclxuICAgIGxldCBsZWZ0ID0gc2ZnLm15c2hpcF8ueCArIG15Y28ubGVmdDtcclxuICAgIGxldCByaWdodCA9IG15Y28ucmlnaHQgKyBzZmcubXlzaGlwXy54O1xyXG4gICAgbGV0IHRvcCA9IG15Y28udG9wICsgc2ZnLm15c2hpcF8ueTtcclxuICAgIGxldCBib3R0b20gPSBteWNvLmJvdHRvbSArIHNmZy5teXNoaXBfLnk7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHRoaXMuZW5zLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIGxldCBlbiA9IHRoaXMuZW5zW2ldO1xyXG4gICAgICBpZiAoZW4uZW5hYmxlXykge1xyXG4gICAgICAgIGxldCBlbmNvID0gZW4uY29sbGlzaW9uQXJlYTtcclxuICAgICAgICBpZiAodG9wID4gKGVuLnkgKyBlbmNvLmJvdHRvbSkgJiZcclxuICAgICAgICAgIChlbi55ICsgZW5jby50b3ApID4gYm90dG9tICYmXHJcbiAgICAgICAgICBsZWZ0IDwgKGVuLnggKyBlbmNvLnJpZ2h0KSAmJlxyXG4gICAgICAgICAgKGVuLnggKyBlbmNvLmxlZnQpIDwgcmlnaHRcclxuICAgICAgICAgICkge1xyXG4gICAgICAgICAgZW4uaGl0KG15c2hpcCk7XHJcbiAgICAgICAgICBzZmcubXlzaGlwXy5oaXQoKTtcclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8g5pW15by+44Go6Ieq5qmf44Go44Gu44GC44Gf44KK5Yik5a6aXHJcbiAgICB0aGlzLmVuYnMgPSB0aGlzLmVuZW15QnVsbGV0cy5lbmVteUJ1bGxldHM7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gdGhpcy5lbmJzLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIGxldCBlbiA9IHRoaXMuZW5ic1tpXTtcclxuICAgICAgaWYgKGVuLmVuYWJsZSkge1xyXG4gICAgICAgIGxldCBlbmNvID0gZW4uY29sbGlzaW9uQXJlYTtcclxuICAgICAgICBpZiAodG9wID4gKGVuLnkgKyBlbmNvLmJvdHRvbSkgJiZcclxuICAgICAgICAgIChlbi55ICsgZW5jby50b3ApID4gYm90dG9tICYmXHJcbiAgICAgICAgICBsZWZ0IDwgKGVuLnggKyBlbmNvLnJpZ2h0KSAmJlxyXG4gICAgICAgICAgKGVuLnggKyBlbmNvLmxlZnQpIDwgcmlnaHRcclxuICAgICAgICAgICkge1xyXG4gICAgICAgICAgZW4uaGl0KCk7XHJcbiAgICAgICAgICBzZmcubXlzaGlwXy5oaXQoKTtcclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICB9XHJcbiAgcmV0dXJuIGZhbHNlO1xyXG59XHJcblxyXG4vLy8g6Ieq5qmf54iG55m6IFxyXG4qbXlTaGlwQm9tYih0YXNrSW5kZXgpIHtcclxuICB3aGlsZShzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lIDw9IHRoaXMubXlTaGlwQm9tYi5lbmRUaW1lICYmIHRhc2tJbmRleCA+PSAwKXtcclxuICAgIHRoaXMuZW5lbWllcy5tb3ZlKCk7XHJcbiAgICBzZmcuZ2FtZVRpbWVyLnVwZGF0ZSgpO1xyXG4gICAgdGFza0luZGV4ID0geWllbGQ7ICBcclxuICB9XHJcbiAgc2ZnLm15c2hpcF8ucmVzdC0tO1xyXG4gIGlmIChzZmcubXlzaGlwXy5yZXN0ID09IDApIHtcclxuICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDEwLCAxOCwgJ0dBTUUgT1ZFUicsIG5ldyB0ZXh0LlRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gICAgdGhpcy5wcmludFNjb3JlKCk7XHJcbiAgICB0aGlzLnRleHRQbGFuZS5wcmludCgyMCwgMzksICdSZXN0OiAgICcgKyBzZmcubXlzaGlwXy5yZXN0KTtcclxuICAgIHRoaXMuY29tbV8uc29ja2V0Lm9uKCdzZW5kUmFuaycsIHRoaXMuY2hlY2tSYW5rSW4pO1xyXG4gICAgdGhpcy5jb21tXy5zZW5kU2NvcmUobmV3IFNjb3JlRW50cnkodGhpcy5lZGl0SGFuZGxlTmFtZSwgdGhpcy5zY29yZSkpO1xyXG4gICAgdGhpcy5nYW1lT3Zlci5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDU7XHJcbiAgICB0aGlzLnJhbmsgPSAtMTtcclxuICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLmdhbWVPdmVyLmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5zZXF1ZW5jZXIuc3RvcCgpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBzZmcubXlzaGlwXy5tZXNoLnZpc2libGUgPSB0cnVlO1xyXG4gICAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMjAsIDM5LCAnUmVzdDogICAnICsgc2ZnLm15c2hpcF8ucmVzdCk7XHJcbiAgICB0aGlzLnRleHRQbGFuZS5wcmludCg4LCAxNSwgJ1N0YWdlICcgKyAoc2ZnLnN0YWdlLm5vKSArICcgU3RhcnQgISEnLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICAgIHRoaXMuc3RhZ2VTdGFydC5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDI7XHJcbiAgICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5zdGFnZVN0YXJ0LmJpbmQodGhpcykpO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOOCsuODvOODoOOCquODvOODkOODvFxyXG4qZ2FtZU92ZXIodGFza0luZGV4KSB7XHJcbiAgd2hpbGUodGhpcy5nYW1lT3Zlci5lbmRUaW1lID49IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgJiYgdGFza0luZGV4ID49IDApXHJcbiAge1xyXG4gICAgc2ZnLmdhbWVUaW1lci51cGRhdGUoKTtcclxuICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gIH1cclxuICBcclxuXHJcbiAgdGhpcy50ZXh0UGxhbmUuY2xzKCk7XHJcbiAgdGhpcy5lbmVtaWVzLnJlc2V0KCk7XHJcbiAgdGhpcy5lbmVteUJ1bGxldHMucmVzZXQoKTtcclxuICBpZiAodGhpcy5yYW5rID49IDApIHtcclxuICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLmluaXRUb3AxMC5iaW5kKHRoaXMpKTtcclxuICB9IGVsc2Uge1xyXG4gICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuaW5pdFRpdGxlLmJpbmQodGhpcykpO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOODqeODs+OCreODs+OCsOOBl+OBn+OBi+OBqeOBhuOBi+OBruODgeOCp+ODg+OCr1xyXG5jaGVja1JhbmtJbihkYXRhKSB7XHJcbiAgdGhpcy5yYW5rID0gZGF0YS5yYW5rO1xyXG59XHJcblxyXG5cclxuLy8vIOODj+OCpOOCueOCs+OCouOCqOODs+ODiOODquOBruihqOekulxyXG5wcmludFRvcDEwKCkge1xyXG4gIHZhciByYW5rbmFtZSA9IFsnIDFzdCcsICcgMm5kJywgJyAzcmQnLCAnIDR0aCcsICcgNXRoJywgJyA2dGgnLCAnIDd0aCcsICcgOHRoJywgJyA5dGgnLCAnMTB0aCddO1xyXG4gIHRoaXMudGV4dFBsYW5lLnByaW50KDgsIDQsICdUb3AgMTAgU2NvcmUnKTtcclxuICB2YXIgeSA9IDg7XHJcbiAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHRoaXMuaGlnaFNjb3Jlcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgdmFyIHNjb3JlU3RyID0gJzAwMDAwMDAwJyArIHRoaXMuaGlnaFNjb3Jlc1tpXS5zY29yZTtcclxuICAgIHNjb3JlU3RyID0gc2NvcmVTdHIuc3Vic3RyKHNjb3JlU3RyLmxlbmd0aCAtIDgsIDgpO1xyXG4gICAgaWYgKHRoaXMucmFuayA9PSBpKSB7XHJcbiAgICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDMsIHksIHJhbmtuYW1lW2ldICsgJyAnICsgc2NvcmVTdHIgKyAnICcgKyB0aGlzLmhpZ2hTY29yZXNbaV0ubmFtZSwgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnRleHRQbGFuZS5wcmludCgzLCB5LCByYW5rbmFtZVtpXSArICcgJyArIHNjb3JlU3RyICsgJyAnICsgdGhpcy5oaWdoU2NvcmVzW2ldLm5hbWUpO1xyXG4gICAgfVxyXG4gICAgeSArPSAyO1xyXG4gIH1cclxufVxyXG5cclxuXHJcbippbml0VG9wMTAodGFza0luZGV4KSB7XHJcbiAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgdGhpcy50ZXh0UGxhbmUuY2xzKCk7XHJcbiAgdGhpcy5wcmludFRvcDEwKCk7XHJcbiAgdGhpcy5zaG93VG9wMTAuZW5kVGltZSA9IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgKyA1O1xyXG4gIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLnNob3dUb3AxMC5iaW5kKHRoaXMpKTtcclxufVxyXG5cclxuKnNob3dUb3AxMCh0YXNrSW5kZXgpIHtcclxuICB3aGlsZSh0aGlzLnNob3dUb3AxMC5lbmRUaW1lID49IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgJiYgdGhpcy5iYXNpY0lucHV0LmtleUJ1ZmZlci5sZW5ndGggPT0gMCAmJiB0YXNrSW5kZXggPj0gMClcclxuICB7XHJcbiAgICBzZmcuZ2FtZVRpbWVyLnVwZGF0ZSgpO1xyXG4gICAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgfSBcclxuICBcclxuICB0aGlzLmJhc2ljSW5wdXQua2V5QnVmZmVyLmxlbmd0aCA9IDA7XHJcbiAgdGhpcy50ZXh0UGxhbmUuY2xzKCk7XHJcbiAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuaW5pdFRpdGxlLmJpbmQodGhpcykpO1xyXG59XHJcbn1cclxuXHJcblxyXG5cclxuXHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuLy92YXIgU1RBR0VfTUFYID0gMTtcclxuaW1wb3J0IHtzZmd9IGZyb20gJy4vZ2xvYmFsLmpzJzsgXHJcbi8vIGltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsLmpzJztcclxuLy8gaW1wb3J0ICogYXMgYXVkaW8gZnJvbSAnLi9hdWRpby5qcyc7XHJcbi8vIC8vaW1wb3J0ICogYXMgc29uZyBmcm9tICcuL3NvbmcnO1xyXG4vLyBpbXBvcnQgKiBhcyBncmFwaGljcyBmcm9tICcuL2dyYXBoaWNzLmpzJztcclxuLy8gaW1wb3J0ICogYXMgaW8gZnJvbSAnLi9pby5qcyc7XHJcbi8vIGltcG9ydCAqIGFzIGNvbW0gZnJvbSAnLi9jb21tLmpzJztcclxuLy8gaW1wb3J0ICogYXMgdGV4dCBmcm9tICcuL3RleHQuanMnO1xyXG4vLyBpbXBvcnQgKiBhcyBnYW1lb2JqIGZyb20gJy4vZ2FtZW9iai5qcyc7XHJcbi8vIGltcG9ydCAqIGFzIG15c2hpcCBmcm9tICcuL215c2hpcC5qcyc7XHJcbi8vIGltcG9ydCAqIGFzIGVuZW1pZXMgZnJvbSAnLi9lbmVtaWVzLmpzJztcclxuLy8gaW1wb3J0ICogYXMgZWZmZWN0b2JqIGZyb20gJy4vZWZmZWN0b2JqLmpzJztcclxuaW1wb3J0IHsgR2FtZSB9IGZyb20gJy4vZ2FtZS5qcyc7XHJcblxyXG4vLy8g44Oh44Kk44OzXHJcbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcblxyXG4gIHNmZy5nYW1lID0gbmV3IEdhbWUoKTtcclxuICBzZmcuZ2FtZS5leGVjKCk7XHJcbn07XHJcbiJdLCJuYW1lcyI6WyJnYW1lb2JqLkdhbWVPYmoiLCJncmFwaGljcy5jcmVhdGVTcHJpdGVNYXRlcmlhbCIsImdyYXBoaWNzLmNyZWF0ZVNwcml0ZUdlb21ldHJ5IiwiZ3JhcGhpY3MuY3JlYXRlU3ByaXRlVVYiLCJncmFwaGljcy51cGRhdGVTcHJpdGVVViIsImlvLkJhc2ljSW5wdXQiLCJ1dGlsLlRhc2tzIiwiYXVkaW8uQXVkaW8iLCJhdWRpby5TZXF1ZW5jZXIiLCJhdWRpby5Tb3VuZEVmZmVjdHMiLCJ1dGlsLkdhbWVUaW1lciIsImdyYXBoaWNzLlByb2dyZXNzIiwiZW5lbWllcy5FbmVteUJ1bGxldHMiLCJlbmVtaWVzLkVuZW1pZXMiLCJlZmZlY3RvYmouQm9tYnMiLCJteXNoaXAuTXlTaGlwIiwidGV4dC5UZXh0UGxhbmUiLCJjb21tLkNvbW0iLCJzZmciLCJ0ZXh0LlRleHRBdHRyaWJ1dGUiLCJhdWRpby5zZXFEYXRhIl0sIm1hcHBpbmdzIjoiOzs7QUFBQSxNQUFNLElBQUksQ0FBQztJQUNQLFdBQVcsR0FBRztRQUNWLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxhQUFhLEdBQUcsR0FBRyxDQUFDO1FBQ3pCLElBQUksQ0FBQyxjQUFjLEdBQUcsR0FBRyxDQUFDOztRQUUxQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxhQUFhLEdBQUcsR0FBRyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLGNBQWMsR0FBRyxHQUFHLENBQUM7UUFDdkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSxHQUFHLEdBQUcsQ0FBQztRQUM1QyxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxjQUFjLEdBQUcsR0FBRyxDQUFDOztRQUUvQyxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztRQUNuQixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUN0RCxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUN4RCxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztRQUNwQixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ3pELElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO1FBQzFCLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO1FBQzFCLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO1FBQzVCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQ2YsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDbEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7UUFDdEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDbEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFDckIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDcEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxRQUFRLENBQUM7UUFDNUIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7S0FDcEI7Q0FDSjs7QUFFRCxBQUFPLElBQUksR0FBRyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7O0FDL0I1Qjs7Ozs7Ozs7QUFRQSxJQUFJLE1BQU0sR0FBRyxPQUFPLE1BQU0sQ0FBQyxNQUFNLEtBQUssVUFBVSxHQUFHLEdBQUcsR0FBRyxLQUFLLENBQUM7Ozs7Ozs7Ozs7QUFVL0QsU0FBUyxFQUFFLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUU7RUFDN0IsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7RUFDYixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztFQUN2QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxLQUFLLENBQUM7Q0FDM0I7Ozs7Ozs7OztBQVNELEFBQWUsU0FBUyxZQUFZLEdBQUcsd0JBQXdCOzs7Ozs7OztBQVEvRCxZQUFZLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUM7Ozs7Ozs7Ozs7QUFVM0MsWUFBWSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsU0FBUyxTQUFTLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRTtFQUNuRSxJQUFJLEdBQUcsR0FBRyxNQUFNLEdBQUcsTUFBTSxHQUFHLEtBQUssR0FBRyxLQUFLO01BQ3JDLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7O0VBRWxELElBQUksTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQztFQUMvQixJQUFJLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxDQUFDO0VBQzFCLElBQUksU0FBUyxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDOztFQUV4QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxFQUFFLEdBQUcsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtJQUNuRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztHQUN6Qjs7RUFFRCxPQUFPLEVBQUUsQ0FBQztDQUNYLENBQUM7Ozs7Ozs7OztBQVNGLFlBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLFNBQVMsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFO0VBQ3JFLElBQUksR0FBRyxHQUFHLE1BQU0sR0FBRyxNQUFNLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQzs7RUFFMUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLE9BQU8sS0FBSyxDQUFDOztFQUV0RCxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztNQUM3QixHQUFHLEdBQUcsU0FBUyxDQUFDLE1BQU07TUFDdEIsSUFBSTtNQUNKLENBQUMsQ0FBQzs7RUFFTixJQUFJLFVBQVUsS0FBSyxPQUFPLFNBQVMsQ0FBQyxFQUFFLEVBQUU7SUFDdEMsSUFBSSxTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDOztJQUU5RSxRQUFRLEdBQUc7TUFDVCxLQUFLLENBQUMsRUFBRSxPQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUM7TUFDMUQsS0FBSyxDQUFDLEVBQUUsT0FBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztNQUM5RCxLQUFLLENBQUMsRUFBRSxPQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztNQUNsRSxLQUFLLENBQUMsRUFBRSxPQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7TUFDdEUsS0FBSyxDQUFDLEVBQUUsT0FBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztNQUMxRSxLQUFLLENBQUMsRUFBRSxPQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztLQUMvRTs7SUFFRCxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO01BQ2xELElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzVCOztJQUVELFNBQVMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7R0FDN0MsTUFBTTtJQUNMLElBQUksTUFBTSxHQUFHLFNBQVMsQ0FBQyxNQUFNO1FBQ3pCLENBQUMsQ0FBQzs7SUFFTixLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtNQUMzQixJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7O01BRXBGLFFBQVEsR0FBRztRQUNULEtBQUssQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU07UUFDMUQsS0FBSyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU07UUFDOUQsS0FBSyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNO1FBQ2xFO1VBQ0UsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzdELElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1dBQzVCOztVQUVELFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7T0FDckQ7S0FDRjtHQUNGOztFQUVELE9BQU8sSUFBSSxDQUFDO0NBQ2IsQ0FBQzs7Ozs7Ozs7OztBQVVGLFlBQVksQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLFNBQVMsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFO0VBQzFELElBQUksUUFBUSxHQUFHLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxPQUFPLElBQUksSUFBSSxDQUFDO01BQ3RDLEdBQUcsR0FBRyxNQUFNLEdBQUcsTUFBTSxHQUFHLEtBQUssR0FBRyxLQUFLLENBQUM7O0VBRTFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQ3BFLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsUUFBUSxDQUFDO09BQ2hEO0lBQ0gsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxPQUFP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O0VBQzdCLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO0VBQ2IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7Q0FDbEI7O0FBRUQsSUFBSSxDQUFDLFNBQVMsR0FBRztFQUNmLE9BQU8sRUFBRSxTQUFTLEtBQUs7RUFDdkI7SUFDRSxJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO0lBQ3RCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztJQUNoQixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUM7SUFDL0IsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQ2xDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQztJQUNsQyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUM7SUFDL0IsUUFBUSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7O0dBRTVDO0NBQ0YsQ0FBQTs7QUFFRCxJQUNFLENBQUMsSUFBSSxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDO0lBRXRCLENBQUMsSUFBSSxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDO0lBRXRCLENBQUMsSUFBSSxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQ3RCLENBQUMsSUFBSSxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDO0lBRXRCLENBQUMsSUFBSSxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDO0lBRXRCLENBQUMsSUFBSSxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQ3RCLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMs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UUFDdEIsUUFBUTtRQUNSLElBQUksQ0FBQyxDQUFDLENBQUM7T0FDUjtLQUNGO0lBQ0Q7TUFDRSxJQUFJLEVBQUUsT0FBTztNQUNiLE9BQU8sRUFBRSxDQUFDO01BQ1YsSUFBSTtRQUNGO1FBQ0EsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQztRQUMxQixLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQy9DLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1YsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ1osQ0FBQztRQUNELEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNyRCxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0IsSUFBSSxDQUFDLENBQUMsQ0FBQztTQUNOO0tBQ0o7SUFDRDtNQUNFLElBQUksRUFBRSxPQUFPO01BQ2IsT0FBTyxFQUFFLENBQUM7TUFDVixJQUFJO1FBQ0Y7UUFDQSxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDO1FBQzFCLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFD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QyxLQUFLLEdBQUcsU0FBUyxJQUFJLENBQUMsQ0FBQztFQUN6QyxJQUFJLFVBQVUsR0FBRyxDQUFDLE1BQU0sR0FBRyxVQUFVLElBQUksQ0FBQyxDQUFDO0VBQzNDLElBQUksSUFBSSxHQUFHLFVBQVUsSUFBSSxDQUFDLE1BQU0sR0FBRyxVQUFVLElBQUksQ0FBQyxDQUFDLENBQUM7RUFDcEQsSUFBSSxJQUFJLEdBQUcsTUFBTSxHQUFHLFVBQVUsQ0FBQztFQUMvQixJQUFJLEtBQUssR0FBRyxTQUFTLEdBQUcsS0FBSyxDQUFDO0VBQzlCLElBQUksS0FBSyxHQUFHLFVBQVUsR0FBRyxNQUFNLENBQUM7RUFDaEMsSUFBSSxHQUFHLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7RUFFdkMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUM7RUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUM7RUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDO0VBQzlCLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQztFQUM5QixHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUM7RUFDOUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUM7O0VBRTFCLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztFQUVuQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxJ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QUcsQ0FBQyxDQUFDLENBQUM7R0FDaEg7O0VBRUQsSUFBSSxJQUFJLEdBQUc7SUFDVCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxPQUFPLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7R0FDakg7O0VBRUQsSUFBSSxJQUFJLEdBQUc7SUFDVCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxPQUFPLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztHQUNsSDs7RUFFRCxJQUFJLEtBQUssR0FBRztJQUNWLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEtBQUssSUFBSSxDQUFDLE9BQU8sS0FBSyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztHQUNsSDs7RUFFRCxJQUFJLENBQUMsR0FBRztLQUNMLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUNyQixDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sS0FBSyxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUU7SUFDL0csSUFBSSxDQUFDLE9B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QyxDQUFDO0tBQ3RELE1BQU07TUFDTCxFQUFFLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7S0FDNUM7SUFDRCxFQUFFLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7O0lBRTNDLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQzs7SUFFbkIsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7SUFDM0Q7TUFDRSxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO01BQzNCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUNYLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7T0FDdkIsTUFBTTtRQUNMLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7T0FDdkI7O01BRUQsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztNQUN0QixJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7UUFDYixJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQztPQUN2RSxNQUFNO1FBQ0wsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLEdBQUcs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LENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRTtRQUMxQixJQUFJLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQzs7UUFFOUIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZCLElBQUlBLE1BQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDekIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN2QixJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7VUFDVixLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxLQUFLLEVBQUVBLE1BQUcsR0FBRyxLQUFLLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDO1VBQ2hELElBQUksSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1VBQ3ZFLElBQUksS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEdBQUcsRUFBRSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEdBQUcsRUFBRSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1VBQ2xILFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEVB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
