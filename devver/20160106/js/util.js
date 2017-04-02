
function Task(func,priority) {
  this.priority = priority || 10000;
  this.func = func;
  this.index = 0;
}

var nullTask = new Task(null);

/// タスク管理
function Tasks() {
  this.array = new Array(0);
  this.needSort = false;
  this.needCompress = false;
  return this;
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
        if(a.priority > b.priority) return 1;
        if (a.priority < b.priority) return -1;
        return 0;
      });
      // インデックスの振り直し
      for (var i = 0, e = this.array.length; i < e; ++i) {
        this.array[i].index = i;
      }
      needSort = false;
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
function GameTimer() {
  this.elapsedTime = 0;
  this.currentTime = 0;
  this.pauseTime = 0;
  this.status = this.STOP;
}

GameTimer.prototype = {
  start: function () {
    this.elapsedTime = 0;
    this.deltaTime = 0;
    this.currentTime = getCurrentTime();
    this.status = this.START;
  },
  resume: function () {
    var nowTime = getCurrentTime();
    this.currentTime = this.currentTime + nowTime - this.pauseTime;
    this.status = this.START;
  },
  pause: function () {
    this.pauseTime = getCurrentTime();
    this.status = this.PAUSE;
  },
  stop: function () {
    this.status = this.STOP;
  },
  update: function () {
    if (this.status != this.START) return;
    var nowTime = getCurrentTime();
    this.deltaTime = nowTime - this.currentTime;
    this.elapsedTime = this.elapsedTime + this.deltaTime;
    this.currentTime = nowTime;
  },
  STOP: 1,
  START: 2,
  PAUSE: 3
}


