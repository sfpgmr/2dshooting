
"use strict";

export class Task {
  constructor(func,priority) {
    this.priority = priority || 10000;
    this.func = func;
    this.index = 0;
  }
  
}

export var nullTask = new Task(null);

/// タスク管理
export class Tasks {
  constructor(){
    this.array = new Array(0);
    this.needSort = false;
    this.needCompress = false;
  }
  // indexの位置のタスクを置き換える
  setNextTask(index, func, priority) {
    var t = new Task(func, priority);
    t.index = index;
    this.array[index] = t;
    this.needSort = true;
  }

  pushTask(func, priority) {
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

