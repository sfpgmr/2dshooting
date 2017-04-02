
"use strict";
import {sfg} from './global.js';
import EventEmitter from './eventEmitter3.js';

export class Task {
  constructor(genInst,priority) {
    this.priority = priority || 10000;
    this.genInst = genInst;
    // 初期化
    this.index = 0;
  }
  
}

export var nullTask = new Task((function*(){})());

/// タスク管理
export class Tasks extends EventEmitter {
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
export class GameTimer {
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

