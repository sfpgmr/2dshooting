(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Controller = function () {
  function Controller(devtool) {
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
  }

  _createClass(Controller, [{
    key: 'active',
    value: function active() {}
  }, {
    key: 'hide',
    value: function hide() {}
  }]);

  return Controller;
}();

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

},{"../../js/audio":7,"../../js/comm":8,"../../js/effectobj":9,"../../js/enemies":10,"../../js/game":12,"../../js/gameobj":13,"../../js/global":14,"../../js/graphics":15,"../../js/io":16,"../../js/myship":17,"../../js/text":18,"../../js/util":19,"./devtool":3}],3:[function(require,module,exports){
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

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

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
      this.initCommAndHighScore();
      this.initActors();
      //fs.writeFileSync('enemyFormationPattern.json',JSON.stringify(this.enemies.moveSeqs,null,''),'utf8');
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
            d.inst.active();
          } else {
            if (d3.select(this).classed('active')) {
              d3.select(this).classed('active', false);
              d3.select(d.id).style('display', 'none');
              d.inst.hide();
            }
          }
        });
      }).each(function (d, i) {
        d.inst = new d.editor(this_);
        if (!i) {
          d3.select(this).classed('active', true);
          d3.select(d.id).style('display', 'block');
          d.inst.active();
        }
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

},{"../../js/audio":7,"../../js/global":14,"./controller":1,"./enemyEditor":4,"fs":undefined}],4:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FormationEditor = undefined;

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

var _enemies = require('../../js/enemies');

var Enemies = _interopRequireWildcard(_enemies);

var _undo = require('./undo');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var InputCommand = function () {
  function InputCommand(id, name, desc) {
    _classCallCheck(this, InputCommand);

    this.id = id;
    this.name = name;
    this.desc = desc;
  }

  _createClass(InputCommand, [{
    key: 'toJSON',
    value: function toJSON() {
      return this.name;
    }
  }]);

  return InputCommand;
}();

;

var InputCommands = {
  enter: new InputCommand(1, 'enter', '挿入'),
  esc: new InputCommand(2, 'esc', 'キャンセル'),
  right: new InputCommand(3, 'right', 'カーソル移動（右）'),
  left: new InputCommand(4, 'left', 'カーソル移動（左）'),
  up: new InputCommand(5, 'up', 'カーソル移動（上）'),
  down: new InputCommand(6, 'down', 'カーソル移動（下）'),
  undo: new InputCommand(8, 'undo', 'アンドゥ'),
  redo: new InputCommand(9, 'redo', 'リドゥ'),
  pageUp: new InputCommand(10, 'pageUp', 'ページアップ'),
  pageDown: new InputCommand(11, 'pageDown', 'ページダウン'),
  home: new InputCommand(12, 'home', '先頭行に移動'),
  end: new InputCommand(13, 'end', '終端行に移動'),
  scrollUp: new InputCommand(16, 'scrollUp', '高速スクロールアップ'),
  scrollDown: new InputCommand(17, 'scrollDown', '高速スクロールダウン'),
  delete: new InputCommand(18, 'delete', '行削除'),
  linePaste: new InputCommand(19, 'linePaste', '行ペースト'),
  measureBefore: new InputCommand(20, 'measureBefore', '小節単位の上移動'),
  measureNext: new InputCommand(21, 'measureNext', '小節単位の下移動'),
  select: new InputCommand(22, 'select', '選択の開始・終了'),
  cutEvent: new InputCommand(23, 'cutEvent', 'イベントカット'),
  copyEvent: new InputCommand(24, 'copyEvent', 'イベントコピー'),
  pasteEvent: new InputCommand(25, 'pasteEvent', 'イベントペースト')
};

//
var keyBinds = {
  13: [{
    keyCode: 13,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommands.enter
  }],
  27: [{
    keyCode: 27,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommands.esc
  }],
  32: [{
    keyCode: 32,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommands.right
  }],
  39: [{
    keyCode: 39,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommands.right
  }],
  37: [{
    keyCode: 37,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommands.left
  }],
  38: [{
    keyCode: 38,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommands.up
  }],
  40: [{
    keyCode: 40,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommands.down
  }],
  106: [{
    keyCode: 106,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommands.insertMeasure
  }],
  90: [{
    keyCode: 90,
    ctrlKey: true,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommands.undo
  }],
  33: [{
    keyCode: 33,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommands.pageUp
  }, {
    keyCode: 33,
    ctrlKey: false,
    shiftKey: true,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommands.scrollUp
  }, {
    keyCode: 33,
    ctrlKey: false,
    shiftKey: false,
    altKey: true,
    metaKey: false,
    inputCommand: InputCommands.measureBefore
  }],
  // 82: [{
  //   keyCode: 82,
  //   ctrlKey: true,
  //   shiftKey: false,
  //   altKey: false,
  //   metaKey: false,
  //   inputCommand: InputCommands.pageUp
  // }],
  34: [{ // Page Down
    keyCode: 34,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommands.pageDown
  }, {
    keyCode: 34,
    ctrlKey: false,
    shiftKey: true,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommands.scrollDown
  }],
  36: [{
    keyCode: 36,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommands.home
  }],
  35: [{
    keyCode: 35,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommands.end
  }],
  89: [{
    keyCode: 89,
    ctrlKey: true,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommands.delete
  }],
  76: [{
    keyCode: 76,
    ctrlKey: true,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommands.linePaste
  }],
  117: [// F6
  {
    keyCode: 117,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommands.select
  }],
  118: [// F7
  {
    keyCode: 118,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommands.cutEvent
  }],
  119: [// F8
  {
    keyCode: 119,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommands.copyEvent
  }],
  120: [// F9
  {
    keyCode: 120,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommands.pasteEvent
  }]
};

var FormationEditor = exports.FormationEditor = function FormationEditor(enemyEditor, formationNo) {
  _classCallCheck(this, FormationEditor);

  var this_ = this;
  this.undoManager = new _undo.UndoManager();
  this.enemyEditor = enemyEditor;
  this.lineBuffer = null;
  var debugUi = enemyEditor.devTool.debugUi;
  var editor = enemyEditor.ui.append('div').classed('formation-editor', true);
  var eventEdit = editor.append('table').attr('tabindex', 0);
  var headrow = eventEdit.append('thead').append('tr');
  headrow.append('th').text('step');
  headrow.append('th').text('SX');
  headrow.append('th').text('SY');
  headrow.append('th').text('HX');
  headrow.append('th').text('HY');
  headrow.append('th').text('PT');
  headrow.append('th').text('KIND');
  headrow.append('th').text('REV');
  headrow.append('th').text('GRP');

  var eventBody = eventEdit.append('tbody').attr('id', 'events');
  eventBody.datum(enemyEditor.devTool.game.enemies.moveSeqs[formationNo]);
  this.editor = doEditor(eventBody, this_);
  this.editor.next();

  // キー入力ハンドラ
  eventEdit.on('keydown', function (d) {
    var e = d3.event;
    //    console.log(e.keyCode);
    var key = keyBinds[e.keyCode];
    var ret = {};
    if (key) {
      key.some(function (d) {
        if (d.ctrlKey == e.ctrlKey && d.shiftKey == e.shiftKey && d.altKey == e.altKey && d.metaKey == e.metaKey) {
          ret = this_.editor.next(d);
          return true;
        }
      });
      if (ret.value) {
        d3.event.preventDefault();
        d3.event.cancelBubble = true;
        return false;
      }
    }
  });
};

// エディタ本体

function* doEditor(eventEdit, formEditor) {
  var _editFuncs;

  var keycode = 0; // 入力されたキーコードを保持する変数
  var events = eventEdit.datum(); // 現在編集中のトラック
  var editView = d3.select('#events'); //編集画面のセレクション
  var rowIndex = 0; // 編集画面の現在行
  var currentEventIndex = 0; // イベント配列の編集開始行
  var cellIndex = 0; // 列インデックス
  var cancelEvent = false; // イベントをキャンセルするかどうか
  var NUM_ROW = 10; // １画面の行数
  var selectStartIndex = null;
  var selectEndIndex = null;
  var needDraw = false;
  var g = formEditor.enemyEditor.devTool.game;

  //if(!g.tasks.enable){
  //  g.tasks.enable = true;
  g.tasks.clear();
  g.tasks.pushTask(g.render.bind(g), g.RENDERER_PRIORITY);
  //    g.showSpaceField();
  g.enemies.reset();
  //// }

  //g.tasks.process(g);

  function setInput() {
    var this_ = this;
    this.attr('contentEditable', 'true');
    this.on('focus', function () {
      //   console.log(this.parentNode.rowIndex - 1);
      rowIndex = this.parentNode.rowIndex - 1;
      cellIndex = this.cellIndex;
      //g.enemies.reset();
      var index = parseInt(this_.attr('data-row-index'));
      formEditor.enemyEditor.devTool.game.enemies.startEnemyIndexed(events[index], index);
    });
  }

  function setBlur() {
    var this_ = this;
    this.on('blur', function (d, i) {
      var data = events[parseInt(this_.attr('data-row-index'))];
      if (i != 6) {
        var v = parseFloat(this.innerText);
        if (!isNaN(v)) {
          data[i] = v;
        }
      } else {
        data[i] = Enemies.getEnemyFunc(this.innerText);
      }
    });
  }

  // 既存イベントの表示
  function drawEvent() {
    var sti = null,
        sei = null;
    if (selectStartIndex != null && selectEndIndex != null) {
      if (currentEventIndex <= selectStartIndex) {
        sti = selectStartIndex - currentEventIndex;
        if (currentEventIndex + NUM_ROW >= selectEndIndex) {
          sei = selectEndIndex - currentEventIndex;
        } else {
          sei = NUM_ROW - 1;
        }
      } else {
        sti = 0;
        if (currentEventIndex + NUM_ROW >= selectEndIndex) {
          sei = selectEndIndex - currentEventIndex;
        } else {
          sei = NUM_ROW - 1;
        }
      }
    }
    var evflagment = events.slice(currentEventIndex, currentEventIndex + NUM_ROW);
    editView.selectAll('tr').remove();
    var select = editView.selectAll('tr').data(evflagment);
    var enter = select.enter();
    var rows = enter.append('tr').attr('data-index', function (d, i) {
      return i;
    });
    if (sti != null && sei != null) {
      rows.each(function (d, i) {
        if (i >= sti && i <= sei) {
          d3.select(this).classed('selected', true);
        }
      });
    }

    rows.each(function (d, i) {
      var row = d3.select(this);

      row.selectAll('td').data(d).enter().append('td').call(setInput).call(setBlur).attr('data-row-index', i + currentEventIndex).text(function (d) {
        if (typeof d === 'function') {
          return ('' + d).replace(/^\s*function\s*([^\(]*)[\S\s]+$/im, '$1');
        }
        return d;
      });

      // d.forEach((d,i)=>{
      //   row.append('td').text(d)
      //   .call(setInput)
      //   .call(setBlur(i));
      // });
    });

    if (rowIndex > evflagment.length - 1) {
      rowIndex = evflagment.length - 1;
    }
  }

  // イベントのフォーカス
  function focusEvent() {
    if (!editView.node().rows[rowIndex].cells[cellIndex]) {
      debugger;
    }
    editView.node().rows[rowIndex].cells[cellIndex].focus();
  }

  // イベントの挿入
  function insertEvent(rowIndex) {
    formEditor.undoManager.exec({
      exec: function exec() {
        this.row = editView.node().rows[rowIndex];
        this.cellIndex = cellIndex;
        this.rowIndex = rowIndex;
        this.currentEvetIndex = currentEventIndex;
        this.exec_();
      },
      exec_: function exec_() {
        var row = d3.select(editView.node().insertRow(this.rowIndex));
        var cols = row.selectAll('td').data([0, 0, 0, 0, 0, 0, Enemies.Zako, true, 0]);

        cellIndex = 0;
        cols.enter().append('td').call(setInput).call(setBlur).attr('data-row-index', this.rowIndex + this.currentEventIndex).text(function (d) {
          if (typeof d === 'function') {
            return ('' + d).replace(/^\s*function\s*([^\(]*)[\S\s]+$/im, '$1');
          }
        });

        row.node().cells[this.cellIndex].focus();
        row.attr('data-new', true);
      },
      redo: function redo() {
        this.exec_();
      },
      undo: function undo() {
        editView.node().deleteRow(this.rowIndex);
        this.row.cells[this.cellIndex].focus();
      }
    });
  }

  // 新規入力行の確定
  function endNewInput() {
    var down = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

    d3.select(editView.node().rows[rowIndex]).attr('data-new', null);
    // 現在の編集行
    //let curRow = editView.node().rows[rowIndex].cells;
    var ev = d3.select(editView.node().rows[rowIndex]).selectAll('td').data();
    formEditor.undoManager.exec({
      exec: function exec() {
        this.startIndex = rowIndex + currentEventIndex;
        this.ev = ev;
        this.count = ev.length;
        this.enter();
      },
      enter: function enter() {
        events.splice(this.startIndex, 0, this.ev);
      },
      redo: function redo() {
        this.enter();
      },
      undo: function undo() {
        events.splice(this.startIndex, this.count);
      }
    });

    if (down) {
      if (rowIndex == NUM_ROW - 1) {
        ++currentEventIndex;
      } else {
        ++rowIndex;
      }
    }
    // 挿入後、再描画
    needDraw = true;
  }

  function addRow(delta) {
    rowIndex += delta;
    var rowLength = editView.node().rows.length;
    if (rowIndex >= rowLength) {
      var d = rowIndex - rowLength + 1;
      rowIndex = rowLength - 1;
      if (currentEventIndex + NUM_ROW - 1 < events.length - 1) {
        currentEventIndex += d;
        if (currentEventIndex + NUM_ROW - 1 > events.length - 1) {
          currentEventIndex = events.length - NUM_ROW + 1;
        }
      }
      needDraw = true;
    }
    if (rowIndex < 0) {
      var d = rowIndex;
      rowIndex = 0;
      if (currentEventIndex != 0) {
        currentEventIndex += d;
        if (currentEventIndex < 0) {
          currentEventIndex = 0;
        }
        needDraw = true;
      }
    }
    focusEvent();
  }

  // エンター
  function doEnter() {
    //console.log('CR/LF');
    // 現在の行が新規か編集中か
    var flag = d3.select(editView.node().rows[rowIndex]).attr('data-new');
    if (flag) {
      endNewInput();
    } else {
      //新規編集中の行でなければ、新規入力用行を挿入
      insertEvent(rowIndex);
    }
    cancelEvent = true;
  }

  // 右移動
  function doRight() {
    cellIndex++;
    var curRow = editView.node().rows;
    if (cellIndex > curRow[rowIndex].cells.length - 1) {
      cellIndex = 0;
      if (rowIndex < curRow.length - 1) {
        if (d3.select(curRow[rowIndex]).attr('data-new')) {
          endNewInput();
          return;
        } else {
          addRow(1);
          return;
        }
      }
    }
    focusEvent();
    cancelEvent = true;
  }

  // 左カーソル
  function doLeft() {
    var curRow = editView.node().rows;
    --cellIndex;
    if (cellIndex < 0) {
      if (rowIndex != 0) {
        if (d3.select(curRow[rowIndex]).attr('data-new')) {
          endNewInput(false);
          return;
        }
        cellIndex = editView.node().rows[rowIndex].cells.length - 1;
        addRow(-1);
        return;
      } else {
        cellIndex = 0;
      }
    }
    focusEvent();
    cancelEvent = true;
  }

  // 上移動
  function doUp() {
    var curRow = editView.node().rows;
    if (d3.select(curRow[rowIndex]).attr('data-new')) {
      endNewInput(false);
    } else {
      addRow(-1);
    }
    cancelEvent = true;
  }

  function doDown() {
    var curRow = editView.node().rows;
    if (d3.select(curRow[rowIndex]).attr('data-new')) {
      endNewInput(false);
    }
    addRow(1);
    cancelEvent = true;
  }

  function doPageDown() {
    if (currentEventIndex < events.length - 1) {
      currentEventIndex += NUM_ROW;
      if (currentEventIndex > events.length - 1) {
        currentEventIndex -= NUM_ROW;
      } else {
        needDraw = true;
      }
      focusEvent();
    }
    cancelEvent = true;
  }

  function doPageUp() {
    if (currentEventIndex > 0) {
      currentEventIndex -= NUM_ROW;
      if (currentEventIndex < 0) {
        currentEventIndex = 0;
      }
      needDraw = true;
    }
    cancelEvent = true;
  }

  function doScrollUp() {
    if (currentEventIndex > 0) {
      --currentEventIndex;
      needDraw = true;
    }
    cancelEvent = true;
  }

  function doScrollDown() {
    if (currentEventIndex + NUM_ROW <= events.length - 1) {
      ++currentEventIndex;
      needDraw = true;
    }
    cancelEvent = true;
  }

  function doHome() {
    if (currentEventIndex > 0) {
      rowIndex = 0;
      currentEventIndex = 0;
      needDraw = true;
    }
    cancelEvent = true;
  }

  function doEnd() {
    if (currentEventIndex != events.length - 1) {
      rowIndex = 0;
      currentEventIndex = events.length - 1;
      needDraw = true;
    }
    cancelEvent = true;
  }

  function doDelete() {
    if (rowIndex + currentEventIndex == events.length - 1) {
      cancelEvent = true;
      return;
    }
    formEditor.undoManager.exec({
      exec: function exec() {
        this.rowIndex = rowIndex;
        this.currentEventIndex = currentEventIndex;
        this.event = events[this.rowIndex];
        this.rowData = events[this.currentEventIndex + this.rowIndex];
        editView.node().deleteRow(this.rowIndex);
        this.lineBuffer = formEditor.lineBuffer;
        formEditor.lineBuffer = [this.event];
        events.splice(this.currentEventIndex + this.rowIndex, 1);
        needDraw = true;
      },
      redo: function redo() {
        editView.node().deleteRow(this.rowIndex);
        events.splice(this.currentEventIndex + this.rowIndex, 1);
        needDraw = true;
      },
      undo: function undo() {
        formEditor.lineBuffer = this.lineBuffer;
        events.splice(this.currentEventIndex + this.rowIndex, 0, this.event);
        needDraw = true;
      }
    });
    cancelEvent = true;
  }

  function doLinePaste() {
    pasteEvent();
  }

  function doRedo() {
    formEditor.undoManager.redo();
    cancelEvent = true;
  }

  function doUndo() {
    formEditor.undoManager.undo();
    cancelEvent = true;
  }
  // cutEventの編集から
  // イベントのカット
  function cutEvent() {
    formEditor.undoManager.exec({
      exec: function exec() {
        this.selectStartIndex = selectStartIndex;
        this.selectEndIndex = selectEndIndex;
        this.cut();
      },
      cut: function cut() {
        this.lineBuffer = formEditor.lineBuffer;
        formEditor.lineBuffer = formEditor.lineBuffer.splice(this.selectStartIndex, this.selectEndIndex + 1 - this.selectStartIndex);
        rowIndex = this.selectStartIndex - currentEventIndex;
        needDraw = true;
      },
      redo: function redo() {
        this.cut();
      },
      undo: function undo() {
        events.splice(this.selectStartIndex, 0, formEditor.lineBuffer);
        formEditor.lineBuffer = this.lineBuffer;
        needDraw = true;
      }
    });
    cancelEvent = true;
  }

  // イベントのコピー
  function copyEvent() {
    formEditor.undoManager.exec({
      exec: function exec() {
        this.selectStartIndex = selectStartIndex;
        this.selectEndIndex = selectEndIndex;
        this.copy();
      },
      copy: function copy() {
        this.lineBuffer = formEditor.lineBuffer;
        formEditor.lineBuffer = [];
        for (var i = this.selectStartIndex, e = this.selectEndIndex + 1; i < e; ++i) {
          formEditor.lineBuffer.push(events[i].concat());
        }
        needDraw = true;
      },
      redo: function redo() {
        this.copy();
      },
      undo: function undo() {
        formEditor.lineBuffer = this.lineBuffer;
        needDraw = true;
      }
    });
    cancelEvent = true;
  }

  // イベントのペースト
  function pasteEvent() {
    if (formEditor.lineBuffer) {
      formEditor.undoManager.exec({
        exec: function exec() {
          this.startIndex = rowIndex + currentEventIndex;
          this.count = formEditor.lineBuffer.length;
          this.paste();
        },
        paste: function paste() {
          for (var i = this.count - 1, e = 0; i >= e; --i) {
            events.splice(this.startIndex, 0, formEditor.lineBuffer[i].concat());
          }
        },
        redo: function redo() {
          this.paste();
        },
        undo: function undo() {
          events.splice(this.startIndex, this.count);
        }
      });
      needDraw = true;
    }
    cancelEvent = true;
  }

  function* doSelect() {
    var input = undefined;
    var indexBackup = rowIndex + currentEventIndex;
    selectStartIndex = rowIndex + currentEventIndex;
    selectEndIndex = selectStartIndex;
    cancelEvent = true;
    drawEvent();
    focusEvent();
    var exitLoop = false;
    while (!exitLoop) {
      input = yield cancelEvent;

      switch (input.inputCommand.id) {
        case InputCommands.select.id:
          exitLoop = true;
          break;
        case InputCommands.cutEvent.id:
          cutEvent();
          exitLoop = true;
          break;
        case InputCommands.copyEvent.id:
          copyEvent();
          exitLoop = true;
          break;
        default:
          var fn = editFuncs[input.inputCommand.id];
          if (fn) {
            fn(input);
          } else {
            cancelEvent = false;
          }
          // 選択範囲の計算
          if (indexBackup != rowIndex + currentEventIndex) {
            var delta = rowIndex + currentEventIndex - indexBackup;
            var indexNext = rowIndex + currentEventIndex;
            if (delta < 0) {
              if (selectStartIndex > indexNext) {
                selectStartIndex = indexNext;
              } else {
                selectEndIndex = indexNext;
              }
            } else {
              if (selectEndIndex < indexNext) {
                selectEndIndex = indexNext;
              } else {
                selectStartIndex = indexNext;
              }
            }
            indexBackup = rowIndex + currentEventIndex;
            needDraw = true;
            cancelEvent = true;
          }
          break;
      }
      if (needDraw) {
        drawEvent();
        focusEvent();
        needDraw = false;
      }
    }

    // 後始末
    selectStartIndex = null;
    selectEndIndex = null;
    cancelEvent = true;
    drawEvent();
    focusEvent();
    needDraw = false;
  }

  var editFuncs = (_editFuncs = {}, _defineProperty(_editFuncs, InputCommands.enter.id, doEnter), _defineProperty(_editFuncs, InputCommands.right.id, doRight), _defineProperty(_editFuncs, InputCommands.left.id, doLeft), _defineProperty(_editFuncs, InputCommands.up.id, doUp), _defineProperty(_editFuncs, InputCommands.down.id, doDown), _defineProperty(_editFuncs, InputCommands.pageDown.id, doPageDown), _defineProperty(_editFuncs, InputCommands.pageUp.id, doPageUp), _defineProperty(_editFuncs, InputCommands.scrollUp.id, doScrollUp), _defineProperty(_editFuncs, InputCommands.scrollDown.id, doScrollDown), _defineProperty(_editFuncs, InputCommands.home.id, doHome), _defineProperty(_editFuncs, InputCommands.end.id, doEnd), _defineProperty(_editFuncs, InputCommands.delete.id, doDelete), _defineProperty(_editFuncs, InputCommands.linePaste.id, doLinePaste), _defineProperty(_editFuncs, InputCommands.redo.id, doRedo), _defineProperty(_editFuncs, InputCommands.undo.id, doUndo), _defineProperty(_editFuncs, InputCommands.pasteEvent.id, pasteEvent), _editFuncs);

  drawEvent();
  while (true) {
    //    console.log('new line', rowIndex, events.length);
    if (events.length == 0 || rowIndex > events.length - 1) {}
    keyloop: while (true) {
      var input = yield cancelEvent;
      if (input.inputCommand.id === InputCommands.select.id) {
        yield* doSelect();
      } else {
        var fn = editFuncs[input.inputCommand.id];
        if (fn) {
          fn(input);
          if (needDraw) {
            drawEvent();
            focusEvent();
            needDraw = false;
          }
        } else {
          cancelEvent = false;
          //         console.log('default');
        }
      }
    }
  }
}

var EnemyEditor = function () {
  function EnemyEditor(devTool) {
    _classCallCheck(this, EnemyEditor);

    this.devTool = devTool;
    // 敵
    var g = devTool.game;
  }

  _createClass(EnemyEditor, [{
    key: 'active',
    value: function active() {
      if (!this.initialized) {
        this.init();
      }
    }
  }, {
    key: 'init',
    value: function init() {
      var _this = this;

      var this_ = this;
      var g = this.devTool.game;

      var p = Promise.resolve();

      if (!g.enemies) {
        p = g.initActors();
      }

      p.then(function () {
        var ui = _this.ui = _this.devTool.debugUi.append('div').attr('id', 'enemy').classed('controller', true).style('display', 'active');

        _this.formNo = 0;

        var controllerData = [
        //　ゲームプレイ
        {
          name: 'play',
          func: function func() {}
        }];

        var buttons = ui.selectAll('button').data(controllerData).enter().append('button');
        buttons.attr('class', function (d) {
          return d.name;
        });

        buttons.on('click', function (d) {
          d.func.apply(d3.select(this));
        });

        ui.append('span').text('ステージ').style({ 'width': '100px', 'display': 'inline-block', 'text-align': 'center' });

        var stage = ui.append('input').attr({ 'type': 'text', 'value': g.stage.no }).style({ 'width': '40px', 'text-align': 'right' });
        g.stage.on('update', function (d) {
          stage.node().value = d.no;
        });

        stage.on('change', function () {
          var v = parseInt(this.value);
          v = isNaN(v) ? 0 : v;
          if (g.stage.no != v) {
            g.stage.jump(v);
          }
        });

        // 編隊マップエディタ

        //       let formhead = ui.append('div');
        //       formhead.append('span').text('編隊No');
        //
        //       formhead.append('input')
        //       .attr({'type':'text','value':this.formNo})
        //       .style({'width':'40px','text-align':'right'})
        //       .on('change',function(){
        //         let v =  parseInt(this.value);
        //         this_.formNo = isNaN(v)?0:v;
        //       });
        //      
        //       ui.append('textarea').classed('formdata',true).attr('rows',10)
        //       .node().value = JSON.stringify(g.enemies.moveSeqs[this.formNo]);

        this_.formationEditor = new FormationEditor(this_, this_.formNo);

        _this.initialized = true;
      });
    }
  }, {
    key: 'hide',
    value: function hide() {}
  }]);

  return EnemyEditor;
}();

exports.default = EnemyEditor;

},{"../../js/enemies":10,"./undo":5,"fs":undefined}],5:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UndoManager = undefined;

var _EventEmitter2 = require('../../js/EventEmitter3');

var _EventEmitter3 = _interopRequireDefault(_EventEmitter2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var UndoManager = exports.UndoManager = function (_EventEmitter) {
  _inherits(UndoManager, _EventEmitter);

  function UndoManager() {
    _classCallCheck(this, UndoManager);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(UndoManager).call(this));

    _this.buffer = [];
    _this.index = -1;
    return _this;
  }

  _createClass(UndoManager, [{
    key: 'clear',
    value: function clear() {
      this.buffer.length = 0;
      this.index = -1;
      this.emit('cleared');
    }
  }, {
    key: 'exec',
    value: function exec(command) {
      command.exec();
      if (this.index + 1 < this.buffer.length) {
        this.buffer.length = this.index + 1;
      }
      this.buffer.push(command);
      ++this.index;
      this.emit('executed');
    }
  }, {
    key: 'redo',
    value: function redo() {
      if (this.index + 1 < this.buffer.length) {
        ++this.index;
        var command = this.buffer[this.index];
        command.redo();
        this.emit('redid');
        if (this.index + 1 == this.buffer.length) {
          this.emit('redoEmpty');
        }
      }
    }
  }, {
    key: 'undo',
    value: function undo() {
      if (this.buffer.length > 0 && this.index >= 0) {
        var command = this.buffer[this.index];
        command.undo();
        --this.index;
        this.emit('undid');
        if (this.index < 0) {
          this.index = -1;
          this.emit('undoEmpty');
        }
      }
    }
  }]);

  return UndoManager;
}(_EventEmitter3.default);

var undoManager = new UndoManager();
exports.default = undoManager;

},{"../../js/EventEmitter3":6}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

},{"./gameobj":13,"./global":14,"./graphics":15}],10:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Enemies = exports.Enemy = exports.EnemyBullets = exports.EnemyBullet = undefined;
exports.Zako = Zako;
exports.Zako1 = Zako1;
exports.MBoss = MBoss;
exports.getEnemyFunc = getEnemyFunc;

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
      // if(this.task.index == 0){
      //   debugger;
      // }
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
    this.homeDelta2 = 1.0;
    for (var i = 0; i < 64; ++i) {
      this.enemies.push(new Enemy(this, scene, se));
    }
    for (var i = 0; i < 5; ++i) {
      this.groupData[i] = new Array(0);
    }
  }

  _createClass(Enemies, [{
    key: 'startEnemy_',
    value: function startEnemy_(enemy, data) {
      enemy.start(data[1], data[2], 0, data[3], data[4], this.movePatterns[Math.abs(data[5])], data[5] < 0, data[6], data[7], data[8] || 0);
    }
  }, {
    key: 'startEnemy',
    value: function startEnemy(data) {
      var enemies = this.enemies;
      for (var i = 0, e = enemies.length; i < e; ++i) {
        var enemy = enemies[i];
        if (!enemy.enable_) {
          return this.startEnemy_(enemy, data);
        }
      }
    }
  }, {
    key: 'startEnemyIndexed',
    value: function startEnemyIndexed(data, index) {
      var en = this.enemies[index];
      if (en.enable_) {
        sfg.tasks.removeTask(en.task.index);
        en.status = en.NONE;
        en.enable_ = false;
        en.mesh.visible = false;
      }
      this.startEnemy_(en, data);
    }

    /// 敵編隊の動きをコントロールする

  }, {
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
      return new Promise(function (resolve, reject) {
        d3.json('./res/enemyFormationPattern.json', function (err, data) {
          if (err) reject(err);
          data.forEach(function (form, i) {
            var stage = [];
            _this4.moveSeqs.push(stage);
            form.forEach(function (d, i) {
              d[6] = getEnemyFunc(d[6]);
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

var enemyFuncs = new Map([["Zako", Zako], ["Zako1", Zako1], ["MBoss", MBoss]]);

function getEnemyFunc(funcName) {
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

},{"./gameobj":13,"./global":14,"./graphics":15}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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

},{"./audio":7,"./comm":8,"./effectobj":9,"./enemies":10,"./eventEmitter3":11,"./gameobj":13,"./global":14,"./graphics":15,"./io":16,"./myship":17,"./text":18,"./util":19}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
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

},{"./global":14}],16:[function(require,module,exports){
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

},{"./global":14}],17:[function(require,module,exports){
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

},{"./gameobj":13,"./global":14,"./graphics":15}],18:[function(require,module,exports){
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

},{"./global":14}],19:[function(require,module,exports){

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

},{"./eventEmitter3":11,"./global":14}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGFwcFxcanNcXGNvbnRyb2xsZXIuanMiLCJzcmNcXGFwcFxcanNcXGRldk1haW4uanMiLCJzcmNcXGFwcFxcanNcXGRldnRvb2wuanMiLCJzcmNcXGFwcFxcanNcXGVuZW15RWRpdG9yLmpzIiwic3JjXFxhcHBcXGpzXFx1bmRvLmpzIiwic3JjXFxqc1xcRXZlbnRFbWl0dGVyMy5qcyIsInNyY1xcanNcXGF1ZGlvLmpzIiwic3JjXFxqc1xcY29tbS5qcyIsInNyY1xcanNcXGVmZmVjdG9iai5qcyIsInNyY1xcanNcXGVuZW1pZXMuanMiLCJzcmNcXGpzXFxldmVudEVtaXR0ZXIzLmpzIiwic3JjXFxqc1xcZ2FtZS5qcyIsInNyY1xcanNcXGdhbWVvYmouanMiLCJzcmNcXGpzXFxnbG9iYWwuanMiLCJzcmNcXGpzXFxncmFwaGljcy5qcyIsInNyY1xcanNcXGlvLmpzIiwic3JjXFxqc1xcbXlzaGlwLmpzIiwic3JjXFxqc1xcdGV4dC5qcyIsInNyY1xcanNcXHV0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxZQUFZLENBQUM7Ozs7Ozs7Ozs7SUFFUSxVQUFVO0FBQzdCLFdBRG1CLFVBQVUsQ0FDakIsT0FBTyxFQUNuQjswQkFGbUIsVUFBVTs7QUFHM0IsUUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7QUFDdkIsUUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztBQUNyQixRQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTzs7QUFBQyxBQUU5QixRQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7O0FBRWxDLFFBQUksY0FBYyxHQUNsQjs7QUFFRTtBQUNFLFVBQUksRUFBQyxNQUFNO0FBQ1gsVUFBSSxrQkFBRTtBQUNKLFlBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMs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QU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsS0FBSztBQUNiLFdBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVksRUFBRSxhQUFhLENBQUMsS0FBSztHQUNsQyxDQUFDO0FBQ0YsSUFBRSxFQUFFLENBQUM7QUFDSCxXQUFPLEVBQUUsRUFBRTtBQUNYLFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsS0FBSztBQUNiLFdBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVksRUFBRSxhQUFhLENBQUMsR0FBRztHQUNoQyxDQUFDO0FBQ0YsSUFBRSxFQUFFLENBQUM7QUFDSCxXQUFPLEVBQUUsRUFBRTtBQUNYLFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsS0FBSztBQUNiLFdBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVksRUFBRSxhQUFhLENBQUMsS0FBSztHQUNsQyxDQUFDO0FBQ0YsSUFBRSxFQUFFLENBQUM7QUFDSCxXQUFPLEVBQUUsRUFBRTtBQUNYLFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsS0FBSztBQUNiLFdBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVksRUFBRSxhQUFhLENBQUMsS0FBSztHQUNsQyxDQUFDO0FBQ0YsSUFBRSxFQUFFLENBQUM7QUFDSCxXQUFPLEVBQUUsRUFBRTtBQUNYLFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsS0FBSztBQUNiLFdBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVksRUFBRSxhQUFhLENBQUMsSUFBSTtHQUNqQyxDQUFDO0FBQ0YsSUFBRSxFQUFFLENBQUM7QUFDSCxXQUFPLEVBQUUsRUFBRTtBQUNYLFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsS0FBSztBQUNiLFdBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVksRUFBRSxh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VyxHQUFHLFVBN09kLFdBQVcsRUE2T29CLENBQUM7QUFDckMsTUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7QUFDL0IsTUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7QUFDdkIsTUFBSSxPQUFPLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7QUFDMUMsTUFBSSxNQUFNLEdBQUcsV0FBVyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzVFLE1BQUksU0FBUyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsQ0FBQztBQUMxRCxNQUFJLE9BQU8sR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNyRCxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNsQyxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNsQyxTQUFP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QUFFOUUsWUFBUSxHQUFHO0FBQ1QsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsQUFDMUQsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEFBQzlELFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsQUFDbEUsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsQUFDdEUsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEFBQzFFLFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsS0FDL0U7O0FBRUQsU0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLEdBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNsRCxVQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUM1Qjs7QUFFRCxhQUFTLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0dBQzdDLE1BQU07QUFDTCxRQUFJLE1BQU0sR0FBRyxTQUFTLENBQUMsTUFBTTtRQUN6QixDQUFDLENBQUM7O0FBRU4sU0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDM0IsVUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUVwRixjQUFRLEdBQUc7QUFDVCxhQUFLLENBQUM7QUFBRSxtQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEFBQUMsTUFBTTtBQUFBLEFBQzFELGFBQUssQ0FBQztBQUFFLG1CQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEFBQUMsTUFBTTtBQUFBLEFBQzlELGFBQUssQ0FBQztBQUFFLG1CQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxBQUFDLE1BQU07QUFBQSxBQUNsRTtBQUNFLGNBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLEdBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdB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O0FBRUQsSUFBSSxDQUFDLFNBQVMsR0FBRztBQUNmLFNBQU8sRUFBRSxpQkFBUyxLQUFLLEVBQ3ZCO0FBQ0UsUUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztBQUN0QixRQUFJLElBQUksR0FBRyxJQUFJLENBQUM7QUFDaEIsUUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDO0FBQy9CLFFBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQztBQUNsQyxRQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDbEMsUUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDO0FBQy9CLFlBQVEsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0dBRTVDO0NBQ0YsQ0FBQTs7QUFFRCxJQUNFLENBQUMsR0FBSSxJQUFJLElBQUksQ0FBRSxDQUFDLEVBQUMsSUFBSSxDQUFDO0lBQ3RCLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBRSxDQUFDLEVBQUMsSUFBSSxDQUFDO0lBQ3RCLENBQUMsR0FBSSxJQUFJLElBQUksQ0FBRSxDQUFDLEVBQUMsSUFBSSxDQUFDO0lBQ3RCLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBRSxDQUFDLEVBQUMsSUFBSSxDQUFDO0lBQ3RCLENBQUMsR0FBSSxJQUFJLElBQUksQ0FBRSxDQUFDLEVBQUMsSUFBSSxDQUFDO0lBQ3RCLENBQUMsR0FBSSxJQUFJLElBQUksQ0FBRSxDQUFDLEVBQUMsSUFBSSxDQUFDO0lBQ3RCLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBRSxDQUFDLEVBQUMsSUFBSSxDQUFDO0lBQ3RCLENBQUMsR0FBSSxJQUFJLElBQUksQ0FBRSxDQUFDLEVBQUMsSUFBSSxDQUFDO0lBQ3RCLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBRSxDQUFDLEVBQUMsSUFBSSxDQUFDO0lBQ3RCLENBQUMsR0FBSSxJQUFJLElBQUksQ0FBRSxDQUFDLEVBQUMsSUFBSSxDQUFDO0lBQ3RCLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBQyxFQUFFLEVBQUMsSUFBSSxDQUFDO0lBQ3RCLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDOzs7O0FBQUMsQUFJekIsU0FBUyxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFDM0M7QUFDRSxNQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUNqQixNQUFJLENBQUMsR0FBRyxHQUFHLEdBQUc7O0FBQUMsQUFFZixNQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUNqQixNQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUNqQixNQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztDQUNoQjs7QUFFRCxTQUFTLFFBQVEsQ0FBQyxLQUFLLEVBQUMsSUFBSSxFQUFDLEdBQUcsRUFBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLEdBQUcsRUFDOUM7QUFDRSxNQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUM7QUFDNUIsTUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQztBQUNsQyxNQUFJLFNBQVMsR0FBRyxDQUFDLEFBQUMsSUFBSSxJQUFJLENBQUMsR0FBSSxJQUFJLEdBQUcsRUFBRSxHQUFHLElBQUksR0FBRyxJQUFJLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFBLElBQUssU0FBUyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUEsQUFBQyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7QUFDekgsTUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQzs7QUFBQyxBQUU5QyxPQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDaEMsT0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUN4QixPQUFLLENBQUMsV0FBVyxHQUFHLEFBQUMsSUFBSSxHQUFHLEVBQUUsSUFBSyxTQUFTLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQSxBQUFDLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQztBQUNyRixNQUFJLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO0FBQ3RCLE1BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLE1BQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQ2YsTUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDakIsTUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDakIsTUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7Q0FDaEI7O0FBRUQsT0FBTyxDQUFDLFNBQVMsR0FBRztBQUNsQixTQUFPLEVBQUUsaUJBQVUsS0FBSyxFQUFFOztBQUV4QixRQUFJLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO0FBQ3RCLFFBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQztBQUNsQyxRQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUM7QUFDL0IsUUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQ2xDLFFBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQztBQUNsQyxRQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUM7QUFDL0IsWUFBUSxDQUFDLEtBQUssRUFBQyxJQUFJLEVBQUMsR0FBRyxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsR0FBRyxDQUFDLENBQUM7R0FDeEM7Q0FDRixDQUFBOztBQUVELFNBQVMsQ0FBQyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUU7QUFDckMsTUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2pELE1BQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxFQUMzQjtBQUNFLFFBQUcsUUFBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBSyxRQUFRLElBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsWUFBWSxJQUFJLENBQUEsQUFBQyxFQUN6RjtBQUNFLFVBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2xDLFVBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ3hCLGFBQU8sSUFBSSxPQUFPLENBQ2xCLENBQUMsQUFBQyxDQUFDLElBQUksQ0FBQyxHQUFFLElBQUksR0FBQyxLQUFLLENBQUEsSUFBSyxLQUFLLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxDQUFDLElBQUksSUFBSSxFQUN0RCxDQUFDLEFBQUMsQ0FBQyxJQUFJLENBQUMsR0FBSSxHQUFHLEdBQUcsS0FBSyxDQUFBLElBQUssS0FBSyxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsQ0FBQyxJQUFJLElBQUksRUFDeEQsQ0FBQyxBQUFDLENBQUMsSUFBSSxDQUFDLEdBQUksSUFBSSxHQUFHLEtBQUssQ0FBQSxJQUFLLEtBQUssQ0FBQyxJQUFJLElBQUksS0FBSyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQzFELENBQUMsQUFBQyxDQUFDLElBQUksQ0FBQyxHQUFJLElBQUksR0FBRyxLQUFLLENBQUEsSUFBSyxLQUFLLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxDQUFDLElBQUksSUFBSSxFQUMxRCxDQUFDLEFBQUMsQ0FBQyxJQUFJLENBQUMsR0FBSSxHQUFHLEdBQUcsS0FBSyxDQUFBLElBQUssS0FBSyxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FDdkQsQ0FBQztLQUNIO0dBQ0Y7QUFDRCxTQUFPLElBQUksT0FBTyxDQUFDLElBQUksSUFBSSxJQUFJLEVBQUUsR0FBRyxJQUFJLElBQUksRUFBRSxJQUFJLElBQUksSUFBSSxFQUFFLElBQUksSUFBSSxJQUFJLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDO0NBQ3hGOztBQUVELFNBQVMsRUFBRSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUU7QUFDdEMsU0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0NBQ3pDOztBQUVELFNBQVMsRUFBRSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFHLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFO0FBQzNDLFNBQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7Q0FDNUM7O0FBRUQsU0FBUyxFQUFFLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRTtBQUN0QyxTQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7Q0FDdEM7Ozs7QUFBQSxBQUtELFNBQVMsQ0FBQyxDQUFDLEdBQUcsRUFBQyxHQUFHLEVBQ2xCO0FBQ0UsTUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDO0FBQ2QsTUFBSSxHQUFH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SSxDQUFDLENBQUM7O0FBRTlFLFlBQVEsR0FBRztBQUNULFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEFBQzFELFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxBQUM5RCxXQUFLLENBQUM7QUFBRSxlQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEFBQ2xFLFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEFBQ3RFLFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxBQUMxRSxXQUFLLENBQUM7QUFBRSxlQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEtBQy9FOztBQUVELFNBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsR0FBRyxHQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDbEQsVUFBSSxDQUFDLENBQUMsR0FB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LENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDN0MsVUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDbEcsVUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUN0RyxjQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztBQUMzQyxjQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQztBQUM3QyxVQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQzNGLFVBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDL0YsU0FBRyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBQzNCLFVBQUksQ0FBQyxP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QUssQ0FBQyxNQUFNLENBQUM7O0FBRWxDLE1BQUksVUFBVSxHQUFHLEFBQUMsS0FBSyxHQUFHLFNBQVMsR0FBSSxDQUFDLENBQUM7QUFDekMsTUFBSSxVQUFVLEdBQUcsQUFBQyxNQUFNLEdBQUcsVUFBVSxHQUFJLENBQUMsQ0FBQztBQUMzQyxNQUFJLElBQUksR0FBRyxVQUFVLElBQUksQUFBQyxNQUFNLEdBQUcsVUFBVSxHQUFJLENBQUMsQ0FBQSxBQUFDLENBQUM7QUFDcEQsTUFBSSxJQUFJLEdBQUcsTUFBTSxHQUFHLFVBQVUsQ0FBQztBQUMvQixNQUFJLEtBQUssR0FBRyxTQUFTLEdBQUcsS0FBSyxDQUFDO0FBQzlCLE1BQUksS0FBSyxHQUFHLFVBQVUsR0FBRyxNQUFNLENBQUM7QUFDaEMsTUFBSSxHQUFHLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFdkMsS0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxBQUFDLElBQUksR0FBSSxLQUFLLENBQUM7QUFDMUIsS0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxBQUFDLElBQUksR0FBSSxLQUFLLENBQUM7QUFDMUIsS0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUEsR0FBSSxLQUFLLENBQUM7QUFDOUIsS0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUEsR0FBSSxLQUFLLENBQUM7QUFDOUIsS0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUEsR0FBSSxLQUFLLENBQUM7QUFDOUIsS0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxBQUFDLElBQUksR0FBSSxLQUFLLENBQUM7O0FBRTFCLEtBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMs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b3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29udHJvbGxlciB7XHJcbiAgY29uc3RydWN0b3IoZGV2dG9vbClcclxuICB7XHJcbiAgICB0aGlzLmRldnRvb2wgPSBkZXZ0b29sO1xyXG4gICAgbGV0IGcgPSBkZXZ0b29sLmdhbWU7XHJcbiAgICBsZXQgZGVidWdVaSA9IGRldnRvb2wuZGVidWdVaTtcclxuICAgIC8vIOWItuW+oeeUu+mdoiBcclxuICAgIGxldCB0b2dnbGUgPSBkZXZ0b29sLnRvZ2dsZUdhbWUoKTtcclxuICAgIFxyXG4gICAgbGV0IGNvbnRyb2xsZXJEYXRhID0gXHJcbiAgICBbXHJcbiAgICAgIC8v44CA44Ky44O844Og44OX44Os44KkXHJcbiAgICAgIHtcclxuICAgICAgICBuYW1lOidwbGF5JyxcclxuICAgICAgICBmdW5jKCl7XHJcbiAgICAgICAgICB0aGlzLmF0dHIoJ2NsYXNzJyx0b2dnbGUubmV4dChmYWxzZSkudmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgXTtcclxuICAgIFxyXG4gICAgbGV0IGNvbnRyb2xsZXIgPSBkZWJ1Z1VpLmFwcGVuZCgnZGl2JykuYXR0cignaWQnLCdjb250cm9sJykuY2xhc3NlZCgnY29udHJvbGxlcicsdHJ1ZSk7XHJcbiAgICBsZXQgYnV0dG9ucyA9IGNvbnRyb2xsZXIuc2VsZWN0QWxsKCdidXR0b24nKS5kYXRhKGNvbnRyb2xsZXJEYXRhKVxyXG4gICAgLmVudGVyKCkuYXBwZW5kKCdidXR0b24nKTtcclxuICAgIGJ1dHRvbnMuYXR0cignY2xhc3MnLGQ9PmQubmFtZSk7XHJcbiAgICBcclxuICAgIGJ1dHRvbnMub24oJ2NsaWNrJyxmdW5jdGlvbihkKXtcclxuICAgICAgZC5mdW5jLmFwcGx5KGQzLnNlbGVjdCh0aGlzKSk7XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgY29udHJvbGxlci5hcHBlbmQoJ3NwYW4nKS50ZXh0KCfjgrnjg4bjg7zjgrgnKS5zdHlsZSh7J3dpZHRoJzonMTAwcHgnLCdkaXNwbGF5JzonaW5saW5lLWJsb2NrJywndGV4dC1hbGlnbic6J2NlbnRlcid9KTtcclxuICAgIFxyXG4gICAgdmFyIHN0YWdlID0gY29udHJvbGxlclxyXG4gICAgLmFwcGVuZCgnaW5wdXQnKVxyXG4gICAgLmF0dHIoeyd0eXBlJzondGV4dCcsJ3ZhbHVlJzpnLnN0YWdlLm5vfSlcclxuICAgIC5zdHlsZSh7J3dpZHRoJzonNDBweCcsJ3RleHQtYWxpZ24nOidyaWdodCd9KTtcclxuICAgIGcuc3RhZ2Uub24oJ3VwZGF0ZScsKGQpPT57XHJcbiAgICAgIHN0YWdlLm5vZGUoKS52YWx1ZSA9IGQubm87XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgc3RhZ2Uub24oJ2NoYW5nZScsZnVuY3Rpb24oKXtcclxuICAgICAgbGV0IHYgPSAgcGFyc2VJbnQodGhpcy52YWx1ZSk7XHJcbiAgICAgIGlmKGcuc3RhZ2Uubm8gIT0gdil7XHJcbiAgICAgICAgZy5zdGFnZS5qdW1wKHYpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgXHJcbiAgfVxyXG4gIFxyXG4gIGFjdGl2ZSgpe1xyXG4gICAgXHJcbiAgfVxyXG4gIFxyXG4gIGhpZGUoKXtcclxuICAgIFxyXG4gIH1cclxufVxyXG4iLCIgXCJ1c2Ugc3RyaWN0XCI7XHJcbi8vdmFyIFNUQUdFX01BWCA9IDE7XHJcbmltcG9ydCAqIGFzIHNmZyBmcm9tICcuLi8uLi9qcy9nbG9iYWwnOyBcclxuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuLi8uLi9qcy91dGlsJztcclxuaW1wb3J0ICogYXMgYXVkaW8gZnJvbSAnLi4vLi4vanMvYXVkaW8nO1xyXG4vL2ltcG9ydCAqIGFzIHNvbmcgZnJvbSAnLi9zb25nJztcclxuaW1wb3J0ICogYXMgZ3JhcGhpY3MgZnJvbSAnLi4vLi4vanMvZ3JhcGhpY3MnO1xyXG5pbXBvcnQgKiBhcyBpbyBmcm9tICcuLi8uLi9qcy9pbyc7XHJcbmltcG9ydCAqIGFzIGNvbW0gZnJvbSAnLi4vLi4vanMvY29tbSc7XHJcbmltcG9ydCAqIGFzIHRleHQgZnJvbSAnLi4vLi4vanMvdGV4dCc7XHJcbmltcG9ydCAqIGFzIGdhbWVvYmogZnJvbSAnLi4vLi4vanMvZ2FtZW9iaic7XHJcbmltcG9ydCAqIGFzIG15c2hpcCBmcm9tICcuLi8uLi9qcy9teXNoaXAnO1xyXG5pbXBvcnQgKiBhcyBlbmVtaWVzIGZyb20gJy4uLy4uL2pzL2VuZW1pZXMnO1xyXG5pbXBvcnQgKiBhcyBlZmZlY3RvYmogZnJvbSAnLi4vLi4vanMvZWZmZWN0b2JqJztcclxuaW1wb3J0IHsgRGV2VG9vbCB9IGZyb20gJy4vZGV2dG9vbCc7XHJcbmltcG9ydCB7IEdhbWUgfSBmcm9tICcuLi8uLi9qcy9nYW1lJztcclxuXHJcbi8vLyDjg6HjgqTjg7Ncclxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuICBzZmcuZ2FtZSA9IG5ldyBHYW1lKCk7XHJcbiAgc2ZnLmRldlRvb2wgPSBuZXcgRGV2VG9vbChzZmcuZ2FtZSk7ICBcclxuICBzZmcuZ2FtZS5leGVjKCk7XHJcbn07XHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0ICogYXMgc2ZnIGZyb20gJy4uLy4uL2pzL2dsb2JhbCc7XHJcbmltcG9ydCAqIGFzIGF1ZGlvIGZyb20gJy4uLy4uL2pzL2F1ZGlvJztcclxuaW1wb3J0IENvbnRyb2xsZXIgZnJvbSAnLi9jb250cm9sbGVyJztcclxuaW1wb3J0IEVuZW15RWRpdG9yIGZyb20gJy4vZW5lbXlFZGl0b3InO1xyXG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIERldlRvb2wge1xyXG4gIGNvbnN0cnVjdG9yKGdhbWUpIHtcclxuICAgIHRoaXMuZ2FtZSA9IGdhbWU7XHJcbi8vICAgIHRoaXMuc3RhdHVzID0gRGV2VG9vbC5TVEFUVVMuU1RPUDtcclxuICAgIHRoaXMua2V5ZG93biA9IHRoaXMua2V5ZG93bl8oKTtcclxuICAgIHRoaXMua2V5ZG93bi5uZXh0KCk7XHJcbiAgICBkMy5zZWxlY3QoJ2JvZHknKS5vbigna2V5ZG93bi5EZXZUb29sJywgKCkgPT4ge1xyXG4gICAgICB2YXIgZSA9IGQzLmV2ZW50O1xyXG4gICAgICBpZih0aGlzLmtleWRvd24ubmV4dChlKS52YWx1ZSl7XHJcbiAgICAgICAgZDMuZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBkMy5ldmVudC5jYW5jZWxCdWJibGUgPSB0cnVlO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfTtcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICB2YXIgdGhpc18gPSB0aGlzO1xyXG4gICAgdmFyIGluaXRDb25zb2xlID0gZ2FtZS5pbml0Q29uc29sZTtcclxuICAgIGdhbWUuaW5pdENvbnNvbGUgPSAoZnVuY3Rpb24oKVxyXG4gICAge1xyXG4gICAgICBpbml0Q29uc29sZS5hcHBseShnYW1lLFsnY29uc29sZS1kZWJ1ZyddKTtcclxuICAgICAgdGhpc18uaW5pdENvbnNvbGUoKTtcclxuICAgICAgZDMuc2VsZWN0KCcjY29uc29sZScpLmF0dHIoJ3RhYkluZGV4JywxKTtcclxuICAgIH0pLmJpbmQoZ2FtZSk7XHJcbiAgICBcclxuICAgIGdhbWUuYmFzaWNJbnB1dC5iaW5kID0gZnVuY3Rpb24oKXtcclxuICAgICAgZDMuc2VsZWN0KCcjY29uc29sZScpLm9uKCdrZXlkb3duLmJhc2ljSW5wdXQnLGdhbWUuYmFzaWNJbnB1dC5rZXlkb3duLmJpbmQoZ2FtZS5iYXNpY0lucHV0KSk7XHJcbiAgICAgIGQzLnNlbGVjdCgnI2NvbnNvbGUnKS5vbigna2V5dXAuYmFzaWNJbnB1dCcsZ2FtZS5iYXNpY0lucHV0LmtleXVwLmJpbmQoZ2FtZS5iYXNpY0lucHV0KSk7XHJcbiAgICB9O1xyXG4gICAgXHJcbiAgICBnYW1lLmJhc2ljSW5wdXQudW5iaW5kID0gZnVuY3Rpb24oKXtcclxuICAgICAgZDMuc2VsZWN0KCcjY29uc29sZScpLm9uKCdrZXlkb3duLmJhc2ljSW5wdXQnLG51bGwpO1xyXG4gICAgICBkMy5zZWxlY3QoJyNjb25zb2xlJykub24oJ2tleXVwLmJhc2ljSW5wdXQnLG51bGwpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBnYW1lLmdhbWVJbml0ID0gZnVuY3Rpb24qICh0YXNrSW5kZXgpIHtcclxuICAgICAgdGFza0luZGV4ID0geWllbGQ7XHJcblxyXG4gICAgICAvLyDjgqrjg7zjg4fjgqPjgqrjga7plovlp4tcclxuICAgICAgdGhpcy5hdWRpb18uc3RhcnQoKTtcclxuICAgICAgdGhpcy5zZXF1ZW5jZXIubG9hZChhdWRpby5zZXFEYXRhKTtcclxuICAgICAgdGhpcy5zZXF1ZW5jZXIuc3RhcnQoKTtcclxuICAgICAgLy9zZmcuc3RhZ2UucmVzZXQoKTtcclxuICAgICAgdGhpcy50ZXh0UGxhbmUuY2xzKCk7XHJcbiAgICAgIHRoaXMuZW5lbWllcy5yZXNldCgpO1xyXG5cclxuICAgICAgLy8g6Ieq5qmf44Gu5Yid5pyf5YyWXHJcbiAgICAgIHRoaXMubXlzaGlwXy5pbml0KCk7XHJcbiAgICAgIHNmZy5nYW1lVGltZXIuc3RhcnQoKTtcclxuICAgICAgdGhpcy5zY29yZSA9IDA7XHJcbiAgICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDIsIDAsICdTY29yZSAgICBIaWdoIFNjb3JlJyk7XHJcbiAgICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDIwLCAzOSwgJ1Jlc3Q6ICAgJyArIHNmZy5teXNoaXBfLnJlc3QpO1xyXG4gICAgICB0aGlzLnByaW50U2NvcmUoKTtcclxuICAgICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuc3RhZ2VJbml0LmJpbmQodGhpcykvKmdhbWVBY3Rpb24qLyk7XHJcbiAgIFxyXG4gICAgfTtcclxuICAgIFxyXG4gICAgZ2FtZS5pbml0ID0gKGZ1bmN0aW9uKih0YXNrSW5kZXgpe1xyXG4gICAgICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICAgICAgdGhpcy5pbml0Q29tbUFuZEhpZ2hTY29yZSgpO1xyXG4gICAgICB0aGlzLmluaXRBY3RvcnMoKTtcclxuICAgICAgLy9mcy53cml0ZUZpbGVTeW5jKCdlbmVteUZvcm1hdGlvblBhdHRlcm4uanNvbicsSlNPTi5zdHJpbmdpZnkodGhpcy5lbmVtaWVzLm1vdmVTZXFzLG51bGwsJycpLCd1dGY4Jyk7XHJcbiAgICB9KS5iaW5kKGdhbWUpOyAgICAgIFxyXG5cclxuXHJcbiAgfVxyXG5cclxuICAqa2V5ZG93bl8oKSB7XHJcbiAgICB2YXIgZSA9IHlpZWxkO1xyXG4gICAgd2hpbGUgKHRydWUpIHtcclxuICAgICAgdmFyIHByb2Nlc3MgPSBmYWxzZTtcclxuICAgICAgaWYgKGUua2V5Q29kZSA9PSAxOTIpIHsgLy8gQCBLZXlcclxuICAgICAgICBzZmcuQ0hFQ0tfQ09MTElTSU9OID0gIXNmZy5DSEVDS19DT0xMSVNJT047XHJcbiAgICAgICAgcHJvY2VzcyA9IHRydWU7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAvLyBpZiAoZS5rZXlDb2RlID09IDgwIC8qIFAgKi8pIHtcclxuICAgICAgLy8gICBpZiAoIXNmZy5wYXVzZSkge1xyXG4gICAgICAvLyAgICAgdGhpcy5nYW1lLnBhdXNlKCk7XHJcbiAgICAgIC8vICAgfSBlbHNlIHtcclxuICAgICAgLy8gICAgIHRoaXMuZ2FtZS5yZXN1bWUoKTtcclxuICAgICAgLy8gICB9XHJcbiAgICAgIC8vICAgcHJvY2VzcyA9IHRydWU7XHJcbiAgICAgIC8vIH1cclxuXHJcbiAgICAgIGlmIChlLmtleUNvZGUgPT0gODggLyogWCAqLyAmJiBzZmcuREVCVUcpIHtcclxuICAgICAgICBpZiAoIXNmZy5wYXVzZSkge1xyXG4gICAgICAgICAgdGhpcy5nYW1lLnBhdXNlKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuZ2FtZS5yZXN1bWUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHJvY2VzcyA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgZSA9IHlpZWxkIHByb2Nlc3M7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBcclxuICBpbml0Q29uc29sZSgpe1xyXG4gICAgLy8gU3RhdHMg44Kq44OW44K444Kn44Kv44OIKEZQU+ihqOekuinjga7kvZzmiJDooajnpLpcclxuICAgIGxldCBnID0gdGhpcy5nYW1lO1xyXG4gICAgbGV0IHRoaXNfID0gdGhpcztcclxuICAgIGcuc3RhdHMgPSBuZXcgU3RhdHMoKTtcclxuICAgIGcuc3RhdHMuZG9tRWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XHJcbiAgICBnLnN0YXRzLmRvbUVsZW1lbnQuc3R5bGUudG9wID0gJzBweCc7XHJcbiAgICBnLnN0YXRzLmRvbUVsZW1lbnQuc3R5bGUubGVmdCA9ICcwcHgnO1xyXG4gICAgZy5zdGF0cy5kb21FbGVtZW50LnN0eWxlLmxlZnQgPSBwYXJzZUZsb2F0KGcucmVuZGVyZXIuZG9tRWxlbWVudC5zdHlsZS5sZWZ0KSAtIHBhcnNlRmxvYXQoZy5zdGF0cy5kb21FbGVtZW50LnN0eWxlLndpZHRoKSArICdweCc7XHJcblxyXG4gICAgbGV0IGRlYnVnVWkgPSB0aGlzLmRlYnVnVWkgPSBkMy5zZWxlY3QoJyNjb250ZW50JylcclxuICAgIC5hcHBlbmQoJ2RpdicpLmF0dHIoJ2NsYXNzJywnZGV2dG9vbCcpXHJcbiAgICAuc3R5bGUoJ2hlaWdodCcsZy5DT05TT0xFX0hFSUdIVCArICdweCcpO1xyXG4gICAgZGVidWdVaS5ub2RlKCkuYXBwZW5kQ2hpbGQoZy5zdGF0cy5kb21FbGVtZW50KTtcclxuICAgIFxyXG4gICAgLy8g44K/44OW6Kit5a6aXHJcbiAgICBsZXQgbWVudSA9IGRlYnVnVWkuYXBwZW5kKCd1bCcpLmNsYXNzZWQoJ21lbnUnLHRydWUpO1xyXG4gICAgbWVudS5zZWxlY3RBbGwoJ2xpJykuZGF0YShcclxuICAgICAgW3tuYW1lOifliLblvqEnLGlkOicjY29udHJvbCcsZWRpdG9yOkNvbnRyb2xsZXJ9LHtuYW1lOifmlbUnLGlkOicjZW5lbXknLGVkaXRvcjpFbmVteUVkaXRvcn0vKix7bmFtZTon6Z+z5rqQJyxpZDonI2F1ZGlvJ30se25hbWU6J+eUu+WDjycsaWQ6JyNncmFwaGljcyd9Ki9dXHJcbiAgICApXHJcbiAgICAuZW50ZXIoKS5hcHBlbmQoJ2xpJylcclxuICAgIC50ZXh0KChkKT0+ZC5uYW1lKVxyXG4gICAgLm9uKCdjbGljaycsZnVuY3Rpb24oZCxpKXtcclxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICBtZW51LnNlbGVjdEFsbCgnbGknKS5lYWNoKGZ1bmN0aW9uKGQsaWR4KXtcclxuICAgICAgICAgaWYoc2VsZiA9PSB0aGlzKXtcclxuICAgICAgICAgICBkMy5zZWxlY3QodGhpcykuY2xhc3NlZCgnYWN0aXZlJyx0cnVlKTtcclxuICAgICAgICAgICBkMy5zZWxlY3QoZC5pZCkuc3R5bGUoJ2Rpc3BsYXknLCdibG9jaycpO1xyXG4gICAgICAgICAgIGQuaW5zdC5hY3RpdmUoKTtcclxuICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICBpZihkMy5zZWxlY3QodGhpcykuY2xhc3NlZCgnYWN0aXZlJykpe1xyXG4gICAgICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKS5jbGFzc2VkKCdhY3RpdmUnLGZhbHNlKTtcclxuICAgICAgICAgICAgICBkMy5zZWxlY3QoZC5pZCkuc3R5bGUoJ2Rpc3BsYXknLCdub25lJyk7XHJcbiAgICAgICAgICAgICAgZC5pbnN0LmhpZGUoKTtcclxuICAgICAgICAgICB9XHJcbiAgICAgICAgIH0gICAgICAgXHJcbiAgICAgIH0pO1xyXG4gICAgfSkuZWFjaChmdW5jdGlvbihkLGkpe1xyXG4gICAgICBkLmluc3QgPSBuZXcgZC5lZGl0b3IodGhpc18pO1xyXG4gICAgICBpZighaSl7XHJcbiAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmNsYXNzZWQoJ2FjdGl2ZScsdHJ1ZSk7XHJcbiAgICAgICAgZDMuc2VsZWN0KGQuaWQpLnN0eWxlKCdkaXNwbGF5JywnYmxvY2snKTtcclxuICAgICAgICBkLmluc3QuYWN0aXZlKCk7XHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgICA7XHJcbiAgICBcclxuXHJcbiAgfVxyXG4gIFxyXG4gIFxyXG4gICp0b2dnbGVHYW1lKCkge1xyXG4gICAgLy8g6ZaL5aeL5Yem55CGXHJcbiAgICBsZXQgY2FuY2VsID0gZmFsc2U7XHJcbiAgICB3aGlsZSAoIWNhbmNlbCkge1xyXG4gICAgICBsZXQgZyA9IHRoaXMuZ2FtZTtcclxuICAgICAgZy50YXNrcy5wdXNoVGFzayhnLmJhc2ljSW5wdXQudXBkYXRlLmJpbmQoZy5iYXNpY0lucHV0KSk7XHJcbiAgICAgIGcuYmFzaWNJbnB1dC5iaW5kKCk7XHJcbiAgICAgIGcudGFza3MucHVzaFRhc2soZy5yZW5kZXIuYmluZChnKSwgZy5SRU5ERVJFUl9QUklPUklUWSk7XHJcbiAgICAgIGcudGFza3MucHVzaFRhc2soZy5nYW1lSW5pdC5iaW5kKGcpKTtcclxuXHJcbiAgICAgIGlmIChnLnNwYWNlRmllbGQpIHtcclxuICAgICAgICBnLnRhc2tzLnB1c2hUYXNrKGcubW92ZVNwYWNlRmllbGQuYmluZChnKSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZy5zaG93U3BhY2VGaWVsZCgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIWcudGFza3MuZW5hYmxlKSB7XHJcbiAgICAgICAgZy50YXNrcy5lbmFibGUgPSB0cnVlO1xyXG4gICAgICAgIGcubWFpbigpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjYW5jZWwgPSB5aWVsZCAnc3RvcCc7XHJcbiAgICAgIGlmIChjYW5jZWwpIGJyZWFrO1xyXG4gICAgICBcclxuICAgICAgLy8g5YGc5q2i5Yem55CGXHJcbiAgICBcclxuICAgICAgLy8g55S76Z2i5raI5Y67XHJcbiAgICAgIGlmIChnLnRhc2tzLmVuYWJsZSl7XHJcbiAgICAgICAgZy50YXNrcy5zdG9wUHJvY2VzcygpXHJcbiAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgIGcuZW5lbWllcy5yZXNldCgpO1xyXG4gICAgICAgICAgICBnLmVuZW15QnVsbGV0cy5yZXNldCgpO1xyXG4gICAgICAgICAgICBnLmJvbWJzLnJlc2V0KCk7XHJcbiAgICAgICAgICAgIGcubXlzaGlwXy5yZXNldCgpO1xyXG4gICAgICAgICAgICBnLnRhc2tzLmNsZWFyKCk7XHJcbiAgICAgICAgICAgIGcudGV4dFBsYW5lLmNscygpO1xyXG4gICAgICAgICAgICBnLnJlbmRlcmVyLmNsZWFyKCk7XHJcbiAgICAgICAgICAgIGcuc2VxdWVuY2VyLnN0b3AoKTtcclxuICAgICAgICAgICAgZy5iYXNpY0lucHV0LnVuYmluZCgpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgICAgY2FuY2VsID0geWllbGQgJ3BsYXknO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcclxuaW1wb3J0ICogYXMgRW5lbWllcyBmcm9tICcuLi8uLi9qcy9lbmVtaWVzJztcclxuaW1wb3J0IHsgVW5kb01hbmFnZXIgfSBmcm9tICcuL3VuZG8nOyBcclxuXHJcbmNsYXNzIElucHV0Q29tbWFuZHtcclxuICBjb25zdHJ1Y3RvcihpZCxuYW1lLGRlc2MpXHJcbiAge1xyXG4gICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgIHRoaXMuZGVzYyA9IGRlc2M7XHJcbiAgfVxyXG4gIHRvSlNPTigpe1xyXG4gICAgcmV0dXJuIHRoaXMubmFtZTtcclxuICB9XHJcbn07XHJcblxyXG5jb25zdCBJbnB1dENvbW1hbmRzID1cclxue1xyXG4gIGVudGVyOiBuZXcgSW5wdXRDb21tYW5kKDEsJ2VudGVyJywn5oy/5YWlJyksXHJcbiAgZXNjOiBuZXcgSW5wdXRDb21tYW5kKDIsJ2VzYycsJ+OCreODo+ODs+OCu+ODqycpLFxyXG4gIHJpZ2h0OiBuZXcgSW5wdXRDb21tYW5kKDMsJ3JpZ2h0Jywn44Kr44O844K944Or56e75YuV77yI5Y+z77yJJyksXHJcbiAgbGVmdDogbmV3IElucHV0Q29tbWFuZCg0LCdsZWZ0Jywn44Kr44O844K944Or56e75YuV77yI5bem77yJJyksXHJcbiAgdXA6IG5ldyBJbnB1dENvbW1hbmQoNSwndXAnLCfjgqvjg7zjgr3jg6vnp7vli5XvvIjkuIrvvIknKSxcclxuICBkb3duOiBuZXcgSW5wdXRDb21tYW5kKDYsJ2Rvd24nLCfjgqvjg7zjgr3jg6vnp7vli5XvvIjkuIvvvIknKSxcclxuICB1bmRvOiBuZXcgSW5wdXRDb21tYW5kKDgsJ3VuZG8nLCfjgqLjg7Pjg4njgqUnKSxcclxuICByZWRvOiBuZXcgSW5wdXRDb21tYW5kKDksJ3JlZG8nLCfjg6rjg4njgqUnKSxcclxuICBwYWdlVXA6IG5ldyBJbnB1dENvbW1hbmQoMTAsJ3BhZ2VVcCcsJ+ODmuODvOOCuOOCouODg+ODlycpLFxyXG4gIHBhZ2VEb3duOiBuZXcgSW5wdXRDb21tYW5kKDExLCdwYWdlRG93bicsJ+ODmuODvOOCuOODgOOCpuODsycpLFxyXG4gIGhvbWU6IG5ldyBJbnB1dENvbW1hbmQoMTIsJ2hvbWUnLCflhYjpoK3ooYzjgavnp7vli5UnKSxcclxuICBlbmQ6IG5ldyBJbnB1dENvbW1hbmQoMTMsJ2VuZCcsJ+e1guerr+ihjOOBq+enu+WLlScpLFxyXG4gIHNjcm9sbFVwOiBuZXcgSW5wdXRDb21tYW5kKDE2LCdzY3JvbGxVcCcsJ+mrmOmAn+OCueOCr+ODreODvOODq+OCouODg+ODlycpLFxyXG4gIHNjcm9sbERvd246IG5ldyBJbnB1dENvbW1hbmQoMTcsJ3Njcm9sbERvd24nLCfpq5jpgJ/jgrnjgq/jg63jg7zjg6vjg4Djgqbjg7MnKSxcclxuICBkZWxldGU6IG5ldyBJbnB1dENvbW1hbmQoMTgsJ2RlbGV0ZScsJ+ihjOWJiumZpCcpLFxyXG4gIGxpbmVQYXN0ZTogbmV3IElucHV0Q29tbWFuZCgxOSwnbGluZVBhc3RlJywn6KGM44Oa44O844K544OIJyksXHJcbiAgbWVhc3VyZUJlZm9yZTogbmV3IElucHV0Q29tbWFuZCgyMCwnbWVhc3VyZUJlZm9yZScsJ+Wwj+evgOWNmOS9jeOBruS4iuenu+WLlScpLFxyXG4gIG1lYXN1cmVOZXh0OiBuZXcgSW5wdXRDb21tYW5kKDIxLCdtZWFzdXJlTmV4dCcsJ+Wwj+evgOWNmOS9jeOBruS4i+enu+WLlScpLFxyXG4gIHNlbGVjdDpuZXcgSW5wdXRDb21tYW5kKDIyLCdzZWxlY3QnLCfpgbjmip7jga7plovlp4vjg7vntYLkuoYnKSxcclxuICBjdXRFdmVudDpuZXcgSW5wdXRDb21tYW5kKDIzLCdjdXRFdmVudCcsJ+OCpOODmeODs+ODiOOCq+ODg+ODiCcpLFxyXG4gIGNvcHlFdmVudDpuZXcgSW5wdXRDb21tYW5kKDI0LCdjb3B5RXZlbnQnLCfjgqTjg5njg7Pjg4jjgrPjg5Tjg7wnKSxcclxuICBwYXN0ZUV2ZW50Om5ldyBJbnB1dENvbW1hbmQoMjUsJ3Bhc3RlRXZlbnQnLCfjgqTjg5njg7Pjg4jjg5rjg7zjgrnjg4gnKVxyXG59O1xyXG5cclxuLy9cclxuY29uc3Qga2V5QmluZHMgPVxyXG4gIHtcclxuICAgIDEzOiBbe1xyXG4gICAgICBrZXlDb2RlOiAxMyxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kcy5lbnRlclxyXG4gICAgfV0sXHJcbiAgICAyNzogW3tcclxuICAgICAga2V5Q29kZTogMjcsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZHMuZXNjXHJcbiAgICB9XSxcclxuICAgIDMyOiBbe1xyXG4gICAgICBrZXlDb2RlOiAzMixcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kcy5yaWdodFxyXG4gICAgfV0sXHJcbiAgICAzOTogW3tcclxuICAgICAga2V5Q29kZTogMzksXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZHMucmlnaHRcclxuICAgIH1dLFxyXG4gICAgMzc6IFt7XHJcbiAgICAgIGtleUNvZGU6IDM3LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLmxlZnRcclxuICAgIH1dLFxyXG4gICAgMzg6IFt7XHJcbiAgICAgIGtleUNvZGU6IDM4LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLnVwXHJcbiAgICB9XSxcclxuICAgIDQwOiBbe1xyXG4gICAgICBrZXlDb2RlOiA0MCxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kcy5kb3duXHJcbiAgICB9XSxcclxuICAgIDEwNjogW3tcclxuICAgICAga2V5Q29kZTogMTA2LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLmluc2VydE1lYXN1cmVcclxuICAgIH1dLFxyXG4gICAgOTA6IFt7XHJcbiAgICAgIGtleUNvZGU6IDkwLFxyXG4gICAgICBjdHJsS2V5OiB0cnVlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZHMudW5kb1xyXG4gICAgfV0sXHJcbiAgICAzMzogW3tcclxuICAgICAga2V5Q29kZTogMzMsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZHMucGFnZVVwXHJcbiAgICAgIH0se1xyXG4gICAgICAgIGtleUNvZGU6IDMzLFxyXG4gICAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICAgIHNoaWZ0S2V5OiB0cnVlLFxyXG4gICAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLnNjcm9sbFVwXHJcbiAgICAgIH0se1xyXG4gICAgICBrZXlDb2RlOiAzMyxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiB0cnVlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLm1lYXN1cmVCZWZvcmVcclxuICAgICAgfSAgICAgIF0sXHJcbiAgICAvLyA4MjogW3tcclxuICAgIC8vICAga2V5Q29kZTogODIsXHJcbiAgICAvLyAgIGN0cmxLZXk6IHRydWUsXHJcbiAgICAvLyAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgIC8vICAgYWx0S2V5OiBmYWxzZSxcclxuICAgIC8vICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAvLyAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kcy5wYWdlVXBcclxuICAgIC8vIH1dLFxyXG4gICAgMzQ6IFt7IC8vIFBhZ2UgRG93biBcclxuICAgICAga2V5Q29kZTogMzQsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZHMucGFnZURvd25cclxuICAgIH0sIHtcclxuICAgICAgICBrZXlDb2RlOiAzNCxcclxuICAgICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgICBzaGlmdEtleTogdHJ1ZSxcclxuICAgICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kcy5zY3JvbGxEb3duXHJcbiAgICAgIH1dLFxyXG4gICAgMzY6IFt7XHJcbiAgICAgIGtleUNvZGU6IDM2LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLmhvbWVcclxuICAgIH1dLFxyXG4gICAgMzU6IFt7XHJcbiAgICAgIGtleUNvZGU6IDM1LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLmVuZFxyXG4gICAgfV0sXHJcbiAgICA4OTogW3tcclxuICAgICAga2V5Q29kZTogODksXHJcbiAgICAgIGN0cmxLZXk6IHRydWUsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kcy5kZWxldGVcclxuICAgIH1dLFxyXG4gICAgNzY6IFt7XHJcbiAgICAgIGtleUNvZGU6IDc2LFxyXG4gICAgICBjdHJsS2V5OiB0cnVlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZHMubGluZVBhc3RlXHJcbiAgICB9XSxcclxuICAgIDExNzpbLy8gRjZcclxuICAgICAge1xyXG4gICAgICBrZXlDb2RlOiAxMTcsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZHMuc2VsZWN0XHJcbiAgICAgIH1cclxuICAgIF0sXHJcbiAgICAxMTg6Wy8vIEY3XHJcbiAgICAgIHtcclxuICAgICAga2V5Q29kZTogMTE4LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLmN1dEV2ZW50XHJcbiAgICAgIH1cclxuICAgIF0sXHJcbiAgICAxMTk6Wy8vIEY4XHJcbiAgICAgIHtcclxuICAgICAga2V5Q29kZTogMTE5LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLmNvcHlFdmVudFxyXG4gICAgICB9XHJcbiAgICBdLFxyXG4gICAgMTIwOlsvLyBGOVxyXG4gICAgICB7XHJcbiAgICAgIGtleUNvZGU6IDEyMCxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kcy5wYXN0ZUV2ZW50XHJcbiAgICAgIH1cclxuICAgIF1cclxuICB9O1xyXG5cclxuZXhwb3J0IGNsYXNzIEZvcm1hdGlvbkVkaXRvciB7XHJcbiAgY29uc3RydWN0b3IoZW5lbXlFZGl0b3IsZm9ybWF0aW9uTm8pIHtcclxuICAgIGxldCB0aGlzXyA9IHRoaXM7XHJcbiAgICB0aGlzLnVuZG9NYW5hZ2VyID0gbmV3IFVuZG9NYW5hZ2VyKCk7XHJcbiAgICB0aGlzLmVuZW15RWRpdG9yID0gZW5lbXlFZGl0b3I7XHJcbiAgICB0aGlzLmxpbmVCdWZmZXIgPSBudWxsO1xyXG4gICAgbGV0IGRlYnVnVWkgPSBlbmVteUVkaXRvci5kZXZUb29sLmRlYnVnVWk7XHJcbiAgICB2YXIgZWRpdG9yID0gZW5lbXlFZGl0b3IudWkuYXBwZW5kKCdkaXYnKS5jbGFzc2VkKCdmb3JtYXRpb24tZWRpdG9yJywgdHJ1ZSk7XHJcbiAgICBsZXQgZXZlbnRFZGl0ID0gZWRpdG9yLmFwcGVuZCgndGFibGUnKS5hdHRyKCd0YWJpbmRleCcsMCk7XHJcbiAgICBsZXQgaGVhZHJvdyA9IGV2ZW50RWRpdC5hcHBlbmQoJ3RoZWFkJykuYXBwZW5kKCd0cicpO1xyXG4gICAgaGVhZHJvdy5hcHBlbmQoJ3RoJykudGV4dCgnc3RlcCcpO1xyXG4gICAgaGVhZHJvdy5hcHBlbmQoJ3RoJykudGV4dCgnU1gnKTtcclxuICAgIGhlYWRyb3cuYXBwZW5kKCd0aCcpLnRleHQoJ1NZJyk7XHJcbiAgICBoZWFkcm93LmFwcGVuZCgndGgnKS50ZXh0KCdIWCcpO1xyXG4gICAgaGVhZHJvdy5hcHBlbmQoJ3RoJykudGV4dCgnSFknKTtcclxuICAgIGhlYWRyb3cuYXBwZW5kKCd0aCcpLnRleHQoJ1BUJyk7XHJcbiAgICBoZWFkcm93LmFwcGVuZCgndGgnKS50ZXh0KCdLSU5EJyk7XHJcbiAgICBoZWFkcm93LmFwcGVuZCgndGgnKS50ZXh0KCdSRVYnKTtcclxuICAgIGhlYWRyb3cuYXBwZW5kKCd0aCcpLnRleHQoJ0dSUCcpO1xyXG4gICAgXHJcbiAgICBsZXQgZXZlbnRCb2R5ID0gZXZlbnRFZGl0LmFwcGVuZCgndGJvZHknKS5hdHRyKCdpZCcsICdldmVudHMnKTtcclxuICAgIGV2ZW50Qm9keS5kYXR1bShlbmVteUVkaXRvci5kZXZUb29sLmdhbWUuZW5lbWllcy5tb3ZlU2Vxc1tmb3JtYXRpb25Ob10pO1xyXG4gICAgdGhpcy5lZGl0b3IgPSBkb0VkaXRvcihldmVudEJvZHksdGhpc18pO1xyXG4gICAgdGhpcy5lZGl0b3IubmV4dCgpO1xyXG5cclxuICAgIC8vIOOCreODvOWFpeWKm+ODj+ODs+ODieODqVxyXG4gICAgZXZlbnRFZGl0Lm9uKCdrZXlkb3duJywgZnVuY3Rpb24gKGQpIHtcclxuICAgICAgbGV0IGUgPSBkMy5ldmVudDtcclxuICAvLyAgICBjb25zb2xlLmxvZyhlLmtleUNvZGUpO1xyXG4gICAgICBsZXQga2V5ID0ga2V5QmluZHNbZS5rZXlDb2RlXTtcclxuICAgICAgbGV0IHJldCA9IHt9O1xyXG4gICAgICBpZiAoa2V5KSB7XHJcbiAgICAgICAga2V5LnNvbWUoKGQpID0+IHtcclxuICAgICAgICAgIGlmIChkLmN0cmxLZXkgPT0gZS5jdHJsS2V5XHJcbiAgICAgICAgICAgICYmIGQuc2hpZnRLZXkgPT0gZS5zaGlmdEtleVxyXG4gICAgICAgICAgICAmJiBkLmFsdEtleSA9PSBlLmFsdEtleVxyXG4gICAgICAgICAgICAmJiBkLm1ldGFLZXkgPT0gZS5tZXRhS2V5XHJcbiAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICByZXQgPSB0aGlzXy5lZGl0b3IubmV4dChkKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKHJldC52YWx1ZSkge1xyXG4gICAgICAgICAgZDMuZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgIGQzLmV2ZW50LmNhbmNlbEJ1YmJsZSA9IHRydWU7XHJcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbi8vIOOCqOODh+OCo+OCv+acrOS9k1xyXG5mdW5jdGlvbiogZG9FZGl0b3IoZXZlbnRFZGl0LCBmb3JtRWRpdG9yKSB7XHJcbiAgbGV0IGtleWNvZGUgPSAwOy8vIOWFpeWKm+OBleOCjOOBn+OCreODvOOCs+ODvOODieOCkuS/neaMgeOBmeOCi+WkieaVsFxyXG4gIGxldCBldmVudHMgPSBldmVudEVkaXQuZGF0dW0oKTsvLyDnj77lnKjnt6jpm4bkuK3jga7jg4jjg6njg4Pjgq9cclxuICBsZXQgZWRpdFZpZXcgPSBkMy5zZWxlY3QoJyNldmVudHMnKTsvL+e3qOmbhueUu+mdouOBruOCu+ODrOOCr+OCt+ODp+ODs1xyXG4gIGxldCByb3dJbmRleCA9IDA7Ly8g57eo6ZuG55S76Z2i44Gu54++5Zyo6KGMXHJcbiAgbGV0IGN1cnJlbnRFdmVudEluZGV4ID0gMDsvLyDjgqTjg5njg7Pjg4jphY3liJfjga7nt6jpm4bplovlp4vooYxcclxuICBsZXQgY2VsbEluZGV4ID0gMDsvLyDliJfjgqTjg7Pjg4fjg4Pjgq/jgrlcclxuICBsZXQgY2FuY2VsRXZlbnQgPSBmYWxzZTsvLyDjgqTjg5njg7Pjg4jjgpLjgq3jg6Pjg7Pjgrvjg6vjgZnjgovjgYvjganjgYbjgYtcclxuICBjb25zdCBOVU1fUk9XID0gMTA7Ly8g77yR55S76Z2i44Gu6KGM5pWwXHJcbiAgbGV0IHNlbGVjdFN0YXJ0SW5kZXggPSBudWxsO1xyXG4gIGxldCBzZWxlY3RFbmRJbmRleCA9IG51bGw7XHJcbiAgbGV0IG5lZWREcmF3ID0gZmFsc2U7XHJcbiAgbGV0IGcgPSBmb3JtRWRpdG9yLmVuZW15RWRpdG9yLmRldlRvb2wuZ2FtZTtcclxuICBcclxuICAvL2lmKCFnLnRhc2tzLmVuYWJsZSl7XHJcbiAgLy8gIGcudGFza3MuZW5hYmxlID0gdHJ1ZTtcclxuICAgIGcudGFza3MuY2xlYXIoKTtcclxuICAgIGcudGFza3MucHVzaFRhc2soZy5yZW5kZXIuYmluZChnKSwgZy5SRU5ERVJFUl9QUklPUklUWSk7XHJcbi8vICAgIGcuc2hvd1NwYWNlRmllbGQoKTtcclxuICAgIGcuZW5lbWllcy5yZXNldCgpO1xyXG4gLy8vLyB9XHJcblxyXG4gIC8vZy50YXNrcy5wcm9jZXNzKGcpO1xyXG4gIFxyXG4gIGZ1bmN0aW9uIHNldElucHV0KCkge1xyXG4gICAgbGV0IHRoaXNfID0gdGhpcztcclxuICAgIHRoaXMuYXR0cignY29udGVudEVkaXRhYmxlJywgJ3RydWUnKTtcclxuICAgIHRoaXMub24oJ2ZvY3VzJywgZnVuY3Rpb24gKCkge1xyXG4gICAvLyAgIGNvbnNvbGUubG9nKHRoaXMucGFyZW50Tm9kZS5yb3dJbmRleCAtIDEpO1xyXG4gICAgICByb3dJbmRleCA9IHRoaXMucGFyZW50Tm9kZS5yb3dJbmRleCAtIDE7XHJcbiAgICAgIGNlbGxJbmRleCA9IHRoaXMuY2VsbEluZGV4O1xyXG4gICAgICAvL2cuZW5lbWllcy5yZXNldCgpO1xyXG4gICAgICBsZXQgaW5kZXggPSBwYXJzZUludCh0aGlzXy5hdHRyKCdkYXRhLXJvdy1pbmRleCcpKTtcclxuICAgICAgZm9ybUVkaXRvci5lbmVteUVkaXRvci5kZXZUb29sLmdhbWUuZW5lbWllcy5zdGFydEVuZW15SW5kZXhlZChldmVudHNbaW5kZXhdLGluZGV4KTtcclxuICAgIH0pO1xyXG4gIH1cclxuICBcclxuICBmdW5jdGlvbiBzZXRCbHVyKCl7XHJcbiAgICBsZXQgdGhpc18gPSB0aGlzOyBcclxuICAgICB0aGlzLm9uKCdibHVyJyxmdW5jdGlvbihkLGkpXHJcbiAgICAgIHtcclxuICAgICAgICBsZXQgZGF0YSA9IGV2ZW50c1twYXJzZUludCh0aGlzXy5hdHRyKCdkYXRhLXJvdy1pbmRleCcpKV07XHJcbiAgICAgICAgaWYoaSAhPSA2KXtcclxuICAgICAgICAgIGxldCB2ID0gcGFyc2VGbG9hdCh0aGlzLmlubmVyVGV4dCk7XHJcbiAgICAgICAgICBpZighaXNOYU4odikpe1xyXG4gICAgICAgICAgICBkYXRhW2ldID0gdjtcclxuICAgICAgICAgIH0gXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGRhdGFbaV0gPSBFbmVtaWVzLmdldEVuZW15RnVuYyh0aGlzLmlubmVyVGV4dCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICB9XHJcbiAgXHJcbiAgXHJcbiAgLy8g5pei5a2Y44Kk44OZ44Oz44OI44Gu6KGo56S6XHJcbiAgZnVuY3Rpb24gZHJhd0V2ZW50KCkgXHJcbiAge1xyXG4gICAgbGV0IHN0aSA9IG51bGwsc2VpID0gbnVsbDtcclxuICAgIGlmKHNlbGVjdFN0YXJ0SW5kZXggIT0gbnVsbCAmJiBzZWxlY3RFbmRJbmRleCAhPSBudWxsKXtcclxuICAgICAgICBpZihjdXJyZW50RXZlbnRJbmRleCA8PSBzZWxlY3RTdGFydEluZGV4KXtcclxuICAgICAgICAgIHN0aSA9IHNlbGVjdFN0YXJ0SW5kZXggLSBjdXJyZW50RXZlbnRJbmRleDtcclxuICAgICAgICAgIGlmKChjdXJyZW50RXZlbnRJbmRleCArIE5VTV9ST1cpID49IHNlbGVjdEVuZEluZGV4KVxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBzZWkgPSBzZWxlY3RFbmRJbmRleCAtIGN1cnJlbnRFdmVudEluZGV4OyBcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNlaSA9IE5VTV9ST1cgLSAxO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHN0aSA9IDA7XHJcbiAgICAgICAgICBpZigoY3VycmVudEV2ZW50SW5kZXggKyBOVU1fUk9XKSA+PSBzZWxlY3RFbmRJbmRleClcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc2VpID0gc2VsZWN0RW5kSW5kZXggLSBjdXJyZW50RXZlbnRJbmRleDtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNlaSA9IE5VTV9ST1cgLSAxOyAgICAgICAgICBcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBsZXQgZXZmbGFnbWVudCA9IGV2ZW50cy5zbGljZShjdXJyZW50RXZlbnRJbmRleCwgY3VycmVudEV2ZW50SW5kZXggKyBOVU1fUk9XKTtcclxuICAgIGVkaXRWaWV3LnNlbGVjdEFsbCgndHInKS5yZW1vdmUoKTtcclxuICAgIGxldCBzZWxlY3QgPSBlZGl0Vmlldy5zZWxlY3RBbGwoJ3RyJykuZGF0YShldmZsYWdtZW50KTtcclxuICAgIGxldCBlbnRlciA9IHNlbGVjdC5lbnRlcigpO1xyXG4gICAgbGV0IHJvd3MgPSBlbnRlci5hcHBlbmQoJ3RyJykuYXR0cignZGF0YS1pbmRleCcsIChkLCBpKSA9PiBpKTtcclxuICAgIGlmKHN0aSAhPSBudWxsICYmIHNlaSAhPSBudWxsKXtcclxuICAgICAgcm93cy5lYWNoKGZ1bmN0aW9uKGQsaSl7XHJcbiAgICAgICAgaWYoaSA+PSBzdGkgJiYgaSA8PSBzZWkpe1xyXG4gICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmNsYXNzZWQoJ3NlbGVjdGVkJyx0cnVlKTsgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG4gICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICByb3dzLmVhY2goZnVuY3Rpb24gKGQsIGkpIHtcclxuICAgICAgbGV0IHJvdyA9IGQzLnNlbGVjdCh0aGlzKTtcclxuIFxyXG4gICAgICAgcm93LnNlbGVjdEFsbCgndGQnKVxyXG4gICAgICAuZGF0YShkKVxyXG4gICAgICAuZW50ZXIoKVxyXG4gICAgICAuYXBwZW5kKCd0ZCcpXHJcbiAgICAgIC5jYWxsKHNldElucHV0KVxyXG4gICAgICAuY2FsbChzZXRCbHVyKVxyXG4gICAgICAuYXR0cignZGF0YS1yb3ctaW5kZXgnLGkgKyBjdXJyZW50RXZlbnRJbmRleCkgICAgICBcclxuICAgICAgLnRleHQoKGQpPT57XHJcbiAgICAgICAgaWYodHlwZW9mKGQpID09PSAnZnVuY3Rpb24nICl7XHJcbiAgICAgICAgICByZXR1cm4gKCcnK2QpLnJlcGxhY2UoL15cXHMqZnVuY3Rpb25cXHMqKFteXFwoXSopW1xcU1xcc10rJC9pbSwgJyQxJyk7XHJcbiAgICAgICAgfSBcclxuICAgICAgICByZXR1cm4gZDtcclxuICAgICAgfSk7XHJcbiAgICAgIFxyXG4gICAgICAvLyBkLmZvckVhY2goKGQsaSk9PntcclxuICAgICAgLy8gICByb3cuYXBwZW5kKCd0ZCcpLnRleHQoZClcclxuICAgICAgLy8gICAuY2FsbChzZXRJbnB1dClcclxuICAgICAgLy8gICAuY2FsbChzZXRCbHVyKGkpKTtcclxuICAgICAgLy8gfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAocm93SW5kZXggPiAoZXZmbGFnbWVudC5sZW5ndGggLSAxKSkge1xyXG4gICAgICByb3dJbmRleCA9IGV2ZmxhZ21lbnQubGVuZ3RoIC0gMTtcclxuICAgIH1cclxuXHJcbiAgfVxyXG5cdFxyXG4gIC8vIOOCpOODmeODs+ODiOOBruODleOCqeODvOOCq+OCuVxyXG4gIGZ1bmN0aW9uIGZvY3VzRXZlbnQoKSB7XHJcbiAgICBpZighZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdLmNlbGxzW2NlbGxJbmRleF0pe1xyXG4gICAgICBkZWJ1Z2dlcjtcclxuICAgIH1cclxuICAgIGVkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XS5jZWxsc1tjZWxsSW5kZXhdLmZvY3VzKCk7XHJcbiAgfVxyXG5cdFxyXG4gIC8vIOOCpOODmeODs+ODiOOBruaMv+WFpVxyXG4gIGZ1bmN0aW9uIGluc2VydEV2ZW50KHJvd0luZGV4KSB7XHJcbiAgICBmb3JtRWRpdG9yLnVuZG9NYW5hZ2VyLmV4ZWMoe1xyXG4gICAgICBleGVjKCkge1xyXG4gICAgICAgIHRoaXMucm93ID0gZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdO1xyXG4gICAgICAgIHRoaXMuY2VsbEluZGV4ID0gY2VsbEluZGV4O1xyXG4gICAgICAgIHRoaXMucm93SW5kZXggPSByb3dJbmRleDtcclxuICAgICAgICB0aGlzLmN1cnJlbnRFdmV0SW5kZXggPSBjdXJyZW50RXZlbnRJbmRleDtcclxuICAgICAgICB0aGlzLmV4ZWNfKCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIGV4ZWNfKCkge1xyXG4gICAgICAgIHZhciByb3cgPSBkMy5zZWxlY3QoZWRpdFZpZXcubm9kZSgpLmluc2VydFJvdyh0aGlzLnJvd0luZGV4KSk7XHJcbiAgICAgICAgdmFyIGNvbHMgPSAgcm93LnNlbGVjdEFsbCgndGQnKS5kYXRhKFswLDAsMCwwLDAsMCxFbmVtaWVzLlpha28sdHJ1ZSwwXSk7XHJcblxyXG4gICAgICAgIGNlbGxJbmRleCA9IDA7XHJcbiAgICAgICAgY29scy5lbnRlcigpLmFwcGVuZCgndGQnKVxyXG4gICAgICAgIC5jYWxsKHNldElucHV0KVxyXG4gICAgICAgIC5jYWxsKHNldEJsdXIpXHJcbiAgICAgICAgLmF0dHIoJ2RhdGEtcm93LWluZGV4Jyx0aGlzLnJvd0luZGV4ICsgdGhpcy5jdXJyZW50RXZlbnRJbmRleClcclxuICAgICAgICAudGV4dCgoZCk9PntcclxuICAgICAgICAgIGlmKHR5cGVvZihkKSA9PT0gJ2Z1bmN0aW9uJyApe1xyXG4gICAgICAgICAgICByZXR1cm4gKCcnK2QpLnJlcGxhY2UoL15cXHMqZnVuY3Rpb25cXHMqKFteXFwoXSopW1xcU1xcc10rJC9pbSwgJyQxJyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICByb3cubm9kZSgpLmNlbGxzW3RoaXMuY2VsbEluZGV4XS5mb2N1cygpO1xyXG4gICAgICAgIHJvdy5hdHRyKCdkYXRhLW5ldycsIHRydWUpO1xyXG4gICAgICB9LFxyXG4gICAgICByZWRvKCkge1xyXG4gICAgICAgIHRoaXMuZXhlY18oKTtcclxuICAgICAgfSxcclxuICAgICAgdW5kbygpIHtcclxuICAgICAgICBlZGl0Vmlldy5ub2RlKCkuZGVsZXRlUm93KHRoaXMucm93SW5kZXgpO1xyXG4gICAgICAgIHRoaXMucm93LmNlbGxzW3RoaXMuY2VsbEluZGV4XS5mb2N1cygpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcbiAgXHJcbiAgLy8g5paw6KaP5YWl5Yqb6KGM44Gu56K65a6aXHJcbiAgZnVuY3Rpb24gZW5kTmV3SW5wdXQoZG93biA9IHRydWUpIHtcclxuICAgIGQzLnNlbGVjdChlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF0pLmF0dHIoJ2RhdGEtbmV3JywgbnVsbCk7XHJcbiAgICAvLyDnj77lnKjjga7nt6jpm4booYxcclxuICAgIC8vbGV0IGN1clJvdyA9IGVkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XS5jZWxscztcclxuICAgIGxldCBldiA9IGQzLnNlbGVjdChlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF0pLnNlbGVjdEFsbCgndGQnKS5kYXRhKCk7XHJcbiAgICBmb3JtRWRpdG9yLnVuZG9NYW5hZ2VyLmV4ZWMoe1xyXG4gICAgICBleGVjKCl7XHJcbiAgICAgICAgdGhpcy5zdGFydEluZGV4ID0gcm93SW5kZXggKyBjdXJyZW50RXZlbnRJbmRleDtcclxuICAgICAgICB0aGlzLmV2ID0gZXY7XHJcbiAgICAgICAgdGhpcy5jb3VudCA9IGV2Lmxlbmd0aDtcclxuICAgICAgICB0aGlzLmVudGVyKCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIGVudGVyKCl7XHJcbiAgICAgICAgZXZlbnRzLnNwbGljZSh0aGlzLnN0YXJ0SW5kZXgsMCx0aGlzLmV2KTtcclxuICAgICAgfSxcclxuICAgICAgcmVkbygpe1xyXG4gICAgICAgIHRoaXMuZW50ZXIoKTtcclxuICAgICAgfSxcclxuICAgICAgdW5kbygpe1xyXG4gICAgICAgIGV2ZW50cy5zcGxpY2UodGhpcy5zdGFydEluZGV4LHRoaXMuY291bnQpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgaWYgKGRvd24pIHtcclxuICAgICAgaWYgKHJvd0luZGV4ID09IChOVU1fUk9XIC0gMSkpIHtcclxuICAgICAgICArK2N1cnJlbnRFdmVudEluZGV4O1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgICsrcm93SW5kZXg7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIOaMv+WFpeW+jOOAgeWGjeaPj+eUu1xyXG4gICAgbmVlZERyYXcgPSB0cnVlO1xyXG4gIH1cclxuICBcclxuICBmdW5jdGlvbiBhZGRSb3coZGVsdGEpXHJcbiAge1xyXG4gICAgcm93SW5kZXggKz0gZGVsdGE7XHJcbiAgICBsZXQgcm93TGVuZ3RoID0gZWRpdFZpZXcubm9kZSgpLnJvd3MubGVuZ3RoO1xyXG4gICAgaWYocm93SW5kZXggPj0gcm93TGVuZ3RoKXtcclxuICAgICAgbGV0IGQgPSByb3dJbmRleCAtIHJvd0xlbmd0aCArIDE7XHJcbiAgICAgIHJvd0luZGV4ID0gcm93TGVuZ3RoIC0gMTtcclxuICAgICAgaWYoKGN1cnJlbnRFdmVudEluZGV4ICsgTlVNX1JPVyAtMSkgPCAoZXZlbnRzLmxlbmd0aCAtIDEpKXtcclxuICAgICAgICBjdXJyZW50RXZlbnRJbmRleCArPSBkO1xyXG4gICAgICAgIGlmKChjdXJyZW50RXZlbnRJbmRleCArIE5VTV9ST1cgLTEpID4gKGV2ZW50cy5sZW5ndGggLSAxKSl7XHJcbiAgICAgICAgICBjdXJyZW50RXZlbnRJbmRleCA9IChldmVudHMubGVuZ3RoIC0gTlVNX1JPVyArIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBuZWVkRHJhdyA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBpZihyb3dJbmRleCA8IDApe1xyXG4gICAgICBsZXQgZCA9IHJvd0luZGV4O1xyXG4gICAgICByb3dJbmRleCA9IDA7XHJcbiAgICAgIGlmKGN1cnJlbnRFdmVudEluZGV4ICE9IDApe1xyXG4gICAgICAgIGN1cnJlbnRFdmVudEluZGV4ICs9IGQ7XHJcbiAgICAgICAgaWYoY3VycmVudEV2ZW50SW5kZXggPCAwKXtcclxuICAgICAgICAgIGN1cnJlbnRFdmVudEluZGV4ID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgbmVlZERyYXcgPSB0cnVlO1xyXG4gICAgICB9IFxyXG4gICAgfVxyXG4gICAgZm9jdXNFdmVudCgpO1xyXG4gIH1cclxuICBcclxuICAvLyDjgqjjg7Pjgr/jg7xcclxuICBmdW5jdGlvbiBkb0VudGVyKCl7XHJcbiAgICAvL2NvbnNvbGUubG9nKCdDUi9MRicpO1xyXG4gICAgLy8g54++5Zyo44Gu6KGM44GM5paw6KaP44GL57eo6ZuG5Lit44GLXHJcbiAgICBsZXQgZmxhZyA9IGQzLnNlbGVjdChlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF0pLmF0dHIoJ2RhdGEtbmV3Jyk7XHJcbiAgICBpZiAoZmxhZykge1xyXG4gICAgICBlbmROZXdJbnB1dCgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy/mlrDopo/nt6jpm4bkuK3jga7ooYzjgafjgarjgZHjgozjgbDjgIHmlrDopo/lhaXlipvnlKjooYzjgpLmjL/lhaVcclxuICAgICAgaW5zZXJ0RXZlbnQocm93SW5kZXgpO1xyXG4gICAgfVxyXG4gICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gIH1cclxuICBcclxuICAvLyDlj7Pnp7vli5VcclxuICBmdW5jdGlvbiBkb1JpZ2h0KCl7XHJcbiAgICBjZWxsSW5kZXgrKztcclxuICAgIGxldCBjdXJSb3cgPSBlZGl0Vmlldy5ub2RlKCkucm93cztcclxuICAgIGlmIChjZWxsSW5kZXggPiAoY3VyUm93W3Jvd0luZGV4XS5jZWxscy5sZW5ndGggLSAxKSkge1xyXG4gICAgICBjZWxsSW5kZXggPSAwO1xyXG4gICAgICBpZiAocm93SW5kZXggPCAoY3VyUm93Lmxlbmd0aCAtIDEpKSB7XHJcbiAgICAgICAgaWYgKGQzLnNlbGVjdChjdXJSb3dbcm93SW5kZXhdKS5hdHRyKCdkYXRhLW5ldycpKSB7XHJcbiAgICAgICAgICBlbmROZXdJbnB1dCgpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBhZGRSb3coMSk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgfVxyXG5cclxuICAvLyDlt6bjgqvjg7zjgr3jg6sgXHJcbiAgZnVuY3Rpb24gZG9MZWZ0KCkge1xyXG4gICAgbGV0IGN1clJvdyA9IGVkaXRWaWV3Lm5vZGUoKS5yb3dzO1xyXG4gICAgLS1jZWxsSW5kZXg7XHJcbiAgICBpZiAoY2VsbEluZGV4IDwgMCkge1xyXG4gICAgICBpZiAocm93SW5kZXggIT0gMCkge1xyXG4gICAgICAgIGlmIChkMy5zZWxlY3QoY3VyUm93W3Jvd0luZGV4XSkuYXR0cignZGF0YS1uZXcnKSkge1xyXG4gICAgICAgICAgZW5kTmV3SW5wdXQoZmFsc2UpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjZWxsSW5kZXggPSBlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF0uY2VsbHMubGVuZ3RoIC0gMTtcclxuICAgICAgICBhZGRSb3coLTEpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjZWxsSW5kZXggPSAwO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgfVxyXG4gIFxyXG4gIC8vIOS4iuenu+WLlVxyXG4gIGZ1bmN0aW9uIGRvVXAoKSB7XHJcbiAgICBsZXQgY3VyUm93ID0gZWRpdFZpZXcubm9kZSgpLnJvd3M7XHJcbiAgICBpZiAoZDMuc2VsZWN0KGN1clJvd1tyb3dJbmRleF0pLmF0dHIoJ2RhdGEtbmV3JykpIHtcclxuICAgICAgZW5kTmV3SW5wdXQoZmFsc2UpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgYWRkUm93KC0xKTtcclxuICAgIH1cclxuICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGRvRG93bigpIHtcclxuICAgIGxldCBjdXJSb3cgPSBlZGl0Vmlldy5ub2RlKCkucm93cztcclxuICAgIGlmIChkMy5zZWxlY3QoY3VyUm93W3Jvd0luZGV4XSkuYXR0cignZGF0YS1uZXcnKSkge1xyXG4gICAgICBlbmROZXdJbnB1dChmYWxzZSk7XHJcbiAgICB9XHJcbiAgICBhZGRSb3coMSk7XHJcbiAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgfVxyXG4gIFxyXG4gIGZ1bmN0aW9uIGRvUGFnZURvd24oKSB7XHJcbiAgICBpZiAoY3VycmVudEV2ZW50SW5kZXggPCAoZXZlbnRzLmxlbmd0aCAtIDEpKSB7XHJcbiAgICAgIGN1cnJlbnRFdmVudEluZGV4ICs9IE5VTV9ST1c7XHJcbiAgICAgIGlmIChjdXJyZW50RXZlbnRJbmRleCA+IChldmVudHMubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgICBjdXJyZW50RXZlbnRJbmRleCAtPSBOVU1fUk9XO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIG5lZWREcmF3ID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICB9XHJcbiAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgfVxyXG4gIFxyXG4gIGZ1bmN0aW9uIGRvUGFnZVVwKCl7XHJcbiAgICBpZiAoY3VycmVudEV2ZW50SW5kZXggPiAwKSB7XHJcbiAgICAgIGN1cnJlbnRFdmVudEluZGV4IC09IE5VTV9ST1c7XHJcbiAgICAgIGlmIChjdXJyZW50RXZlbnRJbmRleCA8IDApIHtcclxuICAgICAgICBjdXJyZW50RXZlbnRJbmRleCA9IDA7XHJcbiAgICAgIH1cclxuICAgICAgbmVlZERyYXcgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZG9TY3JvbGxVcCgpXHJcbiAge1xyXG4gICAgaWYgKGN1cnJlbnRFdmVudEluZGV4ID4gMCkge1xyXG4gICAgICAtLWN1cnJlbnRFdmVudEluZGV4O1xyXG4gICAgICBuZWVkRHJhdyA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBkb1Njcm9sbERvd24oKVxyXG4gIHtcclxuICAgIGlmICgoY3VycmVudEV2ZW50SW5kZXggKyBOVU1fUk9XKSA8PSAoZXZlbnRzLmxlbmd0aCAtIDEpKSB7XHJcbiAgICAgICsrY3VycmVudEV2ZW50SW5kZXg7XHJcbiAgICAgIG5lZWREcmF3ID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGRvSG9tZSgpe1xyXG4gICAgaWYgKGN1cnJlbnRFdmVudEluZGV4ID4gMCkge1xyXG4gICAgICByb3dJbmRleCA9IDA7XHJcbiAgICAgIGN1cnJlbnRFdmVudEluZGV4ID0gMDtcclxuICAgICAgbmVlZERyYXcgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gIH1cclxuICBcclxuICBmdW5jdGlvbiBkb0VuZCgpe1xyXG4gICAgaWYgKGN1cnJlbnRFdmVudEluZGV4ICE9IChldmVudHMubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgcm93SW5kZXggPSAwO1xyXG4gICAgICBjdXJyZW50RXZlbnRJbmRleCA9IGV2ZW50cy5sZW5ndGggLSAxO1xyXG4gICAgICBuZWVkRHJhdyA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBkb0RlbGV0ZSgpIHtcclxuICAgIGlmICgocm93SW5kZXggKyBjdXJyZW50RXZlbnRJbmRleCkgPT0gKGV2ZW50cy5sZW5ndGggLSAxKSkge1xyXG4gICAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGZvcm1FZGl0b3IudW5kb01hbmFnZXIuZXhlYyhcclxuICAgICAge1xyXG4gICAgICAgIGV4ZWMoKSB7XHJcbiAgICAgICAgICB0aGlzLnJvd0luZGV4ID0gcm93SW5kZXg7XHJcbiAgICAgICAgICB0aGlzLmN1cnJlbnRFdmVudEluZGV4ID0gY3VycmVudEV2ZW50SW5kZXg7XHJcbiAgICAgICAgICB0aGlzLmV2ZW50ID0gZXZlbnRzW3RoaXMucm93SW5kZXhdO1xyXG4gICAgICAgICAgdGhpcy5yb3dEYXRhID0gZXZlbnRzW3RoaXMuY3VycmVudEV2ZW50SW5kZXggKyB0aGlzLnJvd0luZGV4XTtcclxuICAgICAgICAgIGVkaXRWaWV3Lm5vZGUoKS5kZWxldGVSb3codGhpcy5yb3dJbmRleCk7XHJcbiAgICAgICAgICB0aGlzLmxpbmVCdWZmZXIgPSBmb3JtRWRpdG9yLmxpbmVCdWZmZXI7XHJcbiAgICAgICAgICBmb3JtRWRpdG9yLmxpbmVCdWZmZXIgPSBbdGhpcy5ldmVudF07XHJcbiAgICAgICAgICBldmVudHMuc3BsaWNlKHRoaXMuY3VycmVudEV2ZW50SW5kZXggKyB0aGlzLnJvd0luZGV4LDEpO1xyXG4gICAgICAgICAgbmVlZERyYXcgPSB0cnVlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVkbygpIHtcclxuICAgICAgICAgIGVkaXRWaWV3Lm5vZGUoKS5kZWxldGVSb3codGhpcy5yb3dJbmRleCk7XHJcbiAgICAgICAgICBldmVudHMuc3BsaWNlKHRoaXMuY3VycmVudEV2ZW50SW5kZXggKyB0aGlzLnJvd0luZGV4LDEpO1xyXG4gICAgICAgICAgbmVlZERyYXcgPSB0cnVlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdW5kbygpIHtcclxuICAgICAgICAgIGZvcm1FZGl0b3IubGluZUJ1ZmZlciA9IHRoaXMubGluZUJ1ZmZlcjtcclxuICAgICAgICAgIGV2ZW50cy5zcGxpY2UodGhpcy5jdXJyZW50RXZlbnRJbmRleCArIHRoaXMucm93SW5kZXgsMCx0aGlzLmV2ZW50KTtcclxuICAgICAgICAgIG5lZWREcmF3ID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgfVxyXG4gIFxyXG4gIGZ1bmN0aW9uIGRvTGluZVBhc3RlKClcclxuICB7XHJcbiAgICBwYXN0ZUV2ZW50KCk7XHJcbiAgfVxyXG4gIFxyXG4gIGZ1bmN0aW9uIGRvUmVkbygpe1xyXG4gICAgZm9ybUVkaXRvci51bmRvTWFuYWdlci5yZWRvKCk7XHJcbiAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBkb1VuZG8oKXtcclxuICAgIGZvcm1FZGl0b3IudW5kb01hbmFnZXIudW5kbygpO1xyXG4gICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gIH1cclxuICAvLyBjdXRFdmVudOOBrue3qOmbhuOBi+OCiVxyXG4gIC8vIOOCpOODmeODs+ODiOOBruOCq+ODg+ODiFxyXG4gIGZ1bmN0aW9uIGN1dEV2ZW50KClcclxuICB7XHJcbiAgICBmb3JtRWRpdG9yLnVuZG9NYW5hZ2VyLmV4ZWMoXHJcbiAgICB7XHJcbiAgICAgIGV4ZWMoKXtcclxuICAgICAgICB0aGlzLnNlbGVjdFN0YXJ0SW5kZXggPSBzZWxlY3RTdGFydEluZGV4O1xyXG4gICAgICAgIHRoaXMuc2VsZWN0RW5kSW5kZXggPSBzZWxlY3RFbmRJbmRleDtcclxuICAgICAgICB0aGlzLmN1dCgpO1xyXG4gICAgICB9LFxyXG4gICAgICBjdXQoKXtcclxuICAgICAgICB0aGlzLmxpbmVCdWZmZXIgPSBmb3JtRWRpdG9yLmxpbmVCdWZmZXI7XHJcbiAgICAgICAgZm9ybUVkaXRvci5saW5lQnVmZmVyID0gXHJcbiAgICAgICAgZm9ybUVkaXRvci5saW5lQnVmZmVyLnNwbGljZSh0aGlzLnNlbGVjdFN0YXJ0SW5kZXgsIHRoaXMuc2VsZWN0RW5kSW5kZXggKyAxIC0gdGhpcy5zZWxlY3RTdGFydEluZGV4ICk7XHJcbiAgICAgICAgcm93SW5kZXggPSB0aGlzLnNlbGVjdFN0YXJ0SW5kZXggLSBjdXJyZW50RXZlbnRJbmRleDtcclxuICAgICAgICBuZWVkRHJhdyA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICAgIHJlZG8oKVxyXG4gICAgICB7XHJcbiAgICAgICAgdGhpcy5jdXQoKTsgICAgICAgIFxyXG4gICAgICB9LFxyXG4gICAgICB1bmRvKCl7XHJcbiAgICAgICBldmVudHMuc3BsaWNlKHRoaXMuc2VsZWN0U3RhcnRJbmRleCwwLGZvcm1FZGl0b3IubGluZUJ1ZmZlcik7XHJcbiAgICAgICBmb3JtRWRpdG9yLmxpbmVCdWZmZXIgPSB0aGlzLmxpbmVCdWZmZXI7XHJcbiAgICAgICBuZWVkRHJhdyA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gIH0gXHJcbiAgXHJcbiAgLy8g44Kk44OZ44Oz44OI44Gu44Kz44OU44O8XHJcbiAgZnVuY3Rpb24gY29weUV2ZW50KClcclxuICB7XHJcbiAgICBmb3JtRWRpdG9yLnVuZG9NYW5hZ2VyLmV4ZWMoXHJcbiAgICB7XHJcbiAgICAgIGV4ZWMoKXtcclxuICAgICAgICB0aGlzLnNlbGVjdFN0YXJ0SW5kZXggPSBzZWxlY3RTdGFydEluZGV4O1xyXG4gICAgICAgIHRoaXMuc2VsZWN0RW5kSW5kZXggPSBzZWxlY3RFbmRJbmRleDtcclxuICAgICAgICB0aGlzLmNvcHkoKTtcclxuICAgICAgfSxcclxuICAgICAgY29weSgpe1xyXG4gICAgICAgIHRoaXMubGluZUJ1ZmZlciA9IGZvcm1FZGl0b3IubGluZUJ1ZmZlcjtcclxuICAgICAgICBmb3JtRWRpdG9yLmxpbmVCdWZmZXIgPSBbXTtcclxuICAgICAgICBmb3IobGV0IGkgPSB0aGlzLnNlbGVjdFN0YXJ0SW5kZXgsZSA9IHRoaXMuc2VsZWN0RW5kSW5kZXggKyAxO2k8IGU7KytpKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGZvcm1FZGl0b3IubGluZUJ1ZmZlci5wdXNoKGV2ZW50c1tpXS5jb25jYXQoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG5lZWREcmF3ID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgICAgcmVkbygpXHJcbiAgICAgIHtcclxuICAgICAgICB0aGlzLmNvcHkoKTsgICAgICAgIFxyXG4gICAgICB9LFxyXG4gICAgICB1bmRvKCl7XHJcbiAgICAgICBmb3JtRWRpdG9yLmxpbmVCdWZmZXIgPSB0aGlzLmxpbmVCdWZmZXI7XHJcbiAgICAgICBuZWVkRHJhdyA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gIH1cclxuICBcclxuICAvLyDjgqTjg5njg7Pjg4jjga7jg5rjg7zjgrnjg4hcclxuICBmdW5jdGlvbiBwYXN0ZUV2ZW50KCl7XHJcbiAgICBpZihmb3JtRWRpdG9yLmxpbmVCdWZmZXIpe1xyXG4gICAgZm9ybUVkaXRvci51bmRvTWFuYWdlci5leGVjKFxyXG4gICAge1xyXG4gICAgICBleGVjKCl7XHJcbiAgICAgICAgdGhpcy5zdGFydEluZGV4ID0gcm93SW5kZXggKyBjdXJyZW50RXZlbnRJbmRleDtcclxuICAgICAgICB0aGlzLmNvdW50ID0gZm9ybUVkaXRvci5saW5lQnVmZmVyLmxlbmd0aDtcclxuICAgICAgICB0aGlzLnBhc3RlKCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHBhc3RlKCl7XHJcbiAgICAgICAgZm9yKGxldCBpID0gdGhpcy5jb3VudCAtIDEsZSA9IDA7aSA+PSBlOy0taSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICBldmVudHMuc3BsaWNlKHRoaXMuc3RhcnRJbmRleCwwLGZvcm1FZGl0b3IubGluZUJ1ZmZlcltpXS5jb25jYXQoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICByZWRvKCl7XHJcbiAgICAgICAgdGhpcy5wYXN0ZSgpO1xyXG4gICAgICB9LFxyXG4gICAgICB1bmRvKCl7XHJcbiAgICAgICAgZXZlbnRzLnNwbGljZSh0aGlzLnN0YXJ0SW5kZXgsdGhpcy5jb3VudCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgbmVlZERyYXcgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gIH1cclxuICBcclxuICBmdW5jdGlvbiAqZG9TZWxlY3QoKVxyXG4gIHtcclxuICAgIGxldCBpbnB1dDtcclxuICAgIGxldCBpbmRleEJhY2t1cCA9IHJvd0luZGV4ICsgY3VycmVudEV2ZW50SW5kZXg7XHJcbiAgICBzZWxlY3RTdGFydEluZGV4ID0gcm93SW5kZXggKyBjdXJyZW50RXZlbnRJbmRleDtcclxuICAgIHNlbGVjdEVuZEluZGV4ID0gc2VsZWN0U3RhcnRJbmRleDtcclxuICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICAgIGRyYXdFdmVudCgpO1xyXG4gICAgZm9jdXNFdmVudCgpO1xyXG4gICAgbGV0IGV4aXRMb29wID0gZmFsc2U7XHJcbiAgICB3aGlsZSghZXhpdExvb3ApXHJcbiAgICB7XHJcbiAgICAgIGlucHV0ID0geWllbGQgY2FuY2VsRXZlbnQ7XHJcbiAgICAgIFxyXG4gICAgICBzd2l0Y2goaW5wdXQuaW5wdXRDb21tYW5kLmlkKXtcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZHMuc2VsZWN0LmlkOlxyXG4gICAgICAgICAgZXhpdExvb3AgPSB0cnVlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBJbnB1dENvbW1hbmRzLmN1dEV2ZW50LmlkOlxyXG4gICAgICAgICAgY3V0RXZlbnQoKTtcclxuICAgICAgICAgIGV4aXRMb29wID0gdHJ1ZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kcy5jb3B5RXZlbnQuaWQ6XHJcbiAgICAgICAgICBjb3B5RXZlbnQoKTtcclxuICAgICAgICAgIGV4aXRMb29wID0gdHJ1ZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICBsZXQgZm4gPSBlZGl0RnVuY3NbaW5wdXQuaW5wdXRDb21tYW5kLmlkXTtcclxuICAgICAgICAgIGlmKGZuKXtcclxuICAgICAgICAgICAgZm4oaW5wdXQpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBjYW5jZWxFdmVudCA9IGZhbHNlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLy8g6YG45oqe56+E5Zuy44Gu6KiI566XXHJcbiAgICAgICAgICBpZihpbmRleEJhY2t1cCAhPSAocm93SW5kZXggKyBjdXJyZW50RXZlbnRJbmRleCkpXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCBkZWx0YSA9IHJvd0luZGV4ICsgY3VycmVudEV2ZW50SW5kZXggLSBpbmRleEJhY2t1cDtcclxuICAgICAgICAgICAgbGV0IGluZGV4TmV4dCA9IHJvd0luZGV4ICsgY3VycmVudEV2ZW50SW5kZXg7ICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmKGRlbHRhIDwgMCl7XHJcbiAgICAgICAgICAgICAgaWYoc2VsZWN0U3RhcnRJbmRleCA+IGluZGV4TmV4dCl7XHJcbiAgICAgICAgICAgICAgICBzZWxlY3RTdGFydEluZGV4ID0gaW5kZXhOZXh0O1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZWxlY3RFbmRJbmRleCA9IGluZGV4TmV4dDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgaWYoc2VsZWN0RW5kSW5kZXggPCBpbmRleE5leHQpe1xyXG4gICAgICAgICAgICAgICAgc2VsZWN0RW5kSW5kZXggPSBpbmRleE5leHQ7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGVjdFN0YXJ0SW5kZXggPSBpbmRleE5leHQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGluZGV4QmFja3VwID0gcm93SW5kZXggKyBjdXJyZW50RXZlbnRJbmRleDtcclxuICAgICAgICAgICAgbmVlZERyYXcgPSB0cnVlO1xyXG4gICAgICAgICAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICAgICAgICB9ICAgICAgICBcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBpZihuZWVkRHJhdyl7XHJcbiAgICAgICAgZHJhd0V2ZW50KCk7XHJcbiAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgIG5lZWREcmF3ID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyDlvozlp4vmnKtcclxuICAgIHNlbGVjdFN0YXJ0SW5kZXggPSBudWxsO1xyXG4gICAgc2VsZWN0RW5kSW5kZXggPSBudWxsO1xyXG4gICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gICAgZHJhd0V2ZW50KCk7XHJcbiAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICBuZWVkRHJhdyA9IGZhbHNlO1xyXG4gIH1cclxuICBcclxuICB2YXIgZWRpdEZ1bmNzID0ge1xyXG4gICAgW0lucHV0Q29tbWFuZHMuZW50ZXIuaWRdOmRvRW50ZXIsXHJcbiAgICBbSW5wdXRDb21tYW5kcy5yaWdodC5pZF06ZG9SaWdodCxcclxuICAgIFtJbnB1dENvbW1hbmRzLmxlZnQuaWRdOmRvTGVmdCxcclxuICAgIFtJbnB1dENvbW1hbmRzLnVwLmlkXTpkb1VwLFxyXG4gICAgW0lucHV0Q29tbWFuZHMuZG93bi5pZF06ZG9Eb3duLFxyXG4gICAgW0lucHV0Q29tbWFuZHMucGFnZURvd24uaWRdOmRvUGFnZURvd24sXHJcbiAgICBbSW5wdXRDb21tYW5kcy5wYWdlVXAuaWRdOmRvUGFnZVVwLFxyXG4gICAgW0lucHV0Q29tbWFuZHMuc2Nyb2xsVXAuaWRdOmRvU2Nyb2xsVXAsXHJcbiAgICBbSW5wdXRDb21tYW5kcy5zY3JvbGxEb3duLmlkXTpkb1Njcm9sbERvd24sXHJcbiAgICBbSW5wdXRDb21tYW5kcy5ob21lLmlkXTpkb0hvbWUsXHJcbiAgICBbSW5wdXRDb21tYW5kcy5lbmQuaWRdOmRvRW5kLFxyXG4gICAgW0lucHV0Q29tbWFuZHMuZGVsZXRlLmlkXTpkb0RlbGV0ZSxcclxuICAgIFtJbnB1dENvbW1hbmRzLmxpbmVQYXN0ZS5pZF06ZG9MaW5lUGFzdGUsXHJcbiAgICBbSW5wdXRDb21tYW5kcy5yZWRvLmlkXTpkb1JlZG8sXHJcbiAgICBbSW5wdXRDb21tYW5kcy51bmRvLmlkXTpkb1VuZG8sXHJcbiAgICBbSW5wdXRDb21tYW5kcy5wYXN0ZUV2ZW50LmlkXTpwYXN0ZUV2ZW50XHJcbiAgfTtcclxuICBcclxuICBkcmF3RXZlbnQoKTtcclxuICB3aGlsZSAodHJ1ZSkge1xyXG4vLyAgICBjb25zb2xlLmxvZygnbmV3IGxpbmUnLCByb3dJbmRleCwgZXZlbnRzLmxlbmd0aCk7XHJcbiAgICBpZiAoZXZlbnRzLmxlbmd0aCA9PSAwIHx8IHJvd0luZGV4ID4gKGV2ZW50cy5sZW5ndGggLSAxKSkge1xyXG4gICAgfVxyXG4gICAga2V5bG9vcDpcclxuICAgIHdoaWxlICh0cnVlKSB7XHJcbiAgICAgIGxldCBpbnB1dCA9IHlpZWxkIGNhbmNlbEV2ZW50O1xyXG4gICAgICBpZihpbnB1dC5pbnB1dENvbW1hbmQuaWQgPT09IElucHV0Q29tbWFuZHMuc2VsZWN0LmlkKVxyXG4gICAgICB7XHJcbiAgICAgICAgeWllbGQqIGRvU2VsZWN0KCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGV0IGZuID0gZWRpdEZ1bmNzW2lucHV0LmlucHV0Q29tbWFuZC5pZF07XHJcbiAgICAgICAgaWYgKGZuKSB7XHJcbiAgICAgICAgICBmbihpbnB1dCk7XHJcbiAgICAgICAgICBpZiAobmVlZERyYXcpIHtcclxuICAgICAgICAgICAgZHJhd0V2ZW50KCk7XHJcbiAgICAgICAgICAgIGZvY3VzRXZlbnQoKTtcclxuICAgICAgICAgICAgbmVlZERyYXcgPSBmYWxzZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgY2FuY2VsRXZlbnQgPSBmYWxzZTtcclxuIC8vICAgICAgICAgY29uc29sZS5sb2coJ2RlZmF1bHQnKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVuZW15RWRpdG9yIHtcclxuICBjb25zdHJ1Y3RvcihkZXZUb29sKVxyXG4gIHtcclxuICAgIHRoaXMuZGV2VG9vbCA9IGRldlRvb2w7XHJcbiAgICAvLyDmlbVcclxuICAgIGxldCBnID0gZGV2VG9vbC5nYW1lO1xyXG4gIH1cclxuICBcclxuICBhY3RpdmUoKXtcclxuICAgIGlmKCF0aGlzLmluaXRpYWxpemVkKXtcclxuICAgICAgdGhpcy5pbml0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIGluaXQoKXtcclxuICAgIGxldCB0aGlzXyA9IHRoaXM7XHJcbiAgICBsZXQgZyA9IHRoaXMuZGV2VG9vbC5nYW1lO1xyXG5cclxuICAgIGxldCBwID0gUHJvbWlzZS5yZXNvbHZlKCk7XHJcblxyXG4gICAgaWYoIWcuZW5lbWllcylcclxuICAgIHtcclxuICAgICAgcCA9IGcuaW5pdEFjdG9ycygpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwLnRoZW4oKCk9PntcclxuICAgICAgbGV0IHVpID0gdGhpcy51aSA9IHRoaXMuZGV2VG9vbC5kZWJ1Z1VpLmFwcGVuZCgnZGl2JylcclxuICAgICAgLmF0dHIoJ2lkJywnZW5lbXknKVxyXG4gICAgICAuY2xhc3NlZCgnY29udHJvbGxlcicsdHJ1ZSlcclxuICAgICAgLnN0eWxlKCdkaXNwbGF5JywnYWN0aXZlJyk7XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLmZvcm1ObyA9IDA7XHJcblxyXG4gICAgICBsZXQgY29udHJvbGxlckRhdGEgPSBcclxuICAgICAgW1xyXG4gICAgICAgIC8v44CA44Ky44O844Og44OX44Os44KkXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgbmFtZToncGxheScsXHJcbiAgICAgICAgICBmdW5jKCl7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICBdO1xyXG4gICAgICBcclxuICAgICAgbGV0IGJ1dHRvbnMgPSB1aS5zZWxlY3RBbGwoJ2J1dHRvbicpLmRhdGEoY29udHJvbGxlckRhdGEpXHJcbiAgICAgIC5lbnRlcigpLmFwcGVuZCgnYnV0dG9uJyk7XHJcbiAgICAgIGJ1dHRvbnMuYXR0cignY2xhc3MnLGQ9PmQubmFtZSk7XHJcbiAgICAgIFxyXG4gICAgICBidXR0b25zLm9uKCdjbGljaycsZnVuY3Rpb24oZCl7XHJcbiAgICAgICAgZC5mdW5jLmFwcGx5KGQzLnNlbGVjdCh0aGlzKSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdWkuYXBwZW5kKCdzcGFuJykudGV4dCgn44K544OG44O844K4Jykuc3R5bGUoeyd3aWR0aCc6JzEwMHB4JywnZGlzcGxheSc6J2lubGluZS1ibG9jaycsJ3RleHQtYWxpZ24nOidjZW50ZXInfSk7XHJcbiAgXHJcbiAgICAgIHZhciBzdGFnZSA9IHVpXHJcbiAgICAgIC5hcHBlbmQoJ2lucHV0JylcclxuICAgICAgLmF0dHIoeyd0eXBlJzondGV4dCcsJ3ZhbHVlJzpnLnN0YWdlLm5vfSlcclxuICAgICAgLnN0eWxlKHsnd2lkdGgnOic0MHB4JywndGV4dC1hbGlnbic6J3JpZ2h0J30pO1xyXG4gICAgICBnLnN0YWdlLm9uKCd1cGRhdGUnLChkKT0+e1xyXG4gICAgICAgIHN0YWdlLm5vZGUoKS52YWx1ZSA9IGQubm87XHJcbiAgICAgIH0pO1xyXG4gICAgICBcclxuICAgICAgc3RhZ2Uub24oJ2NoYW5nZScsZnVuY3Rpb24oKXtcclxuICAgICAgICBsZXQgdiA9ICBwYXJzZUludCh0aGlzLnZhbHVlKTtcclxuICAgICAgICB2ID0gaXNOYU4odik/MDp2O1xyXG4gICAgICAgIGlmKGcuc3RhZ2Uubm8gIT0gdil7XHJcbiAgICAgICAgICBnLnN0YWdlLmp1bXAodik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgXHJcbiAgICAgIC8vIOe3qOmaiuODnuODg+ODl+OCqOODh+OCo+OCv1xyXG4gICAgICBcclxuLy8gICAgICAgbGV0IGZvcm1oZWFkID0gdWkuYXBwZW5kKCdkaXYnKTtcclxuLy8gICAgICAgZm9ybWhlYWQuYXBwZW5kKCdzcGFuJykudGV4dCgn57eo6ZqKTm8nKTtcclxuLy8gXHJcbi8vICAgICAgIGZvcm1oZWFkLmFwcGVuZCgnaW5wdXQnKVxyXG4vLyAgICAgICAuYXR0cih7J3R5cGUnOid0ZXh0JywndmFsdWUnOnRoaXMuZm9ybU5vfSlcclxuLy8gICAgICAgLnN0eWxlKHsnd2lkdGgnOic0MHB4JywndGV4dC1hbGlnbic6J3JpZ2h0J30pXHJcbi8vICAgICAgIC5vbignY2hhbmdlJyxmdW5jdGlvbigpe1xyXG4vLyAgICAgICAgIGxldCB2ID0gIHBhcnNlSW50KHRoaXMudmFsdWUpO1xyXG4vLyAgICAgICAgIHRoaXNfLmZvcm1ObyA9IGlzTmFOKHYpPzA6djtcclxuLy8gICAgICAgfSk7XHJcbi8vICAgICAgIFxyXG4vLyAgICAgICB1aS5hcHBlbmQoJ3RleHRhcmVhJykuY2xhc3NlZCgnZm9ybWRhdGEnLHRydWUpLmF0dHIoJ3Jvd3MnLDEwKVxyXG4vLyAgICAgICAubm9kZSgpLnZhbHVlID0gSlNPTi5zdHJpbmdpZnkoZy5lbmVtaWVzLm1vdmVTZXFzW3RoaXMuZm9ybU5vXSk7XHJcbiAgICAgIFxyXG4gICAgICB0aGlzXy5mb3JtYXRpb25FZGl0b3IgPSBuZXcgRm9ybWF0aW9uRWRpdG9yKHRoaXNfLHRoaXNfLmZvcm1Obyk7XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTsgICAgICAgIFxyXG4gICAgfSk7XHJcblxyXG4gICAgXHJcbiAgICBcclxuXHJcbiAgfVxyXG4gIFxyXG4gIGhpZGUoKXtcclxuICAgIFxyXG4gIH1cclxufSIsIid1c2Ugc3RyaWN0JztcclxuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICcuLi8uLi9qcy9FdmVudEVtaXR0ZXIzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBVbmRvTWFuYWdlciBleHRlbmRzIEV2ZW50RW1pdHRlciB7XHJcblx0Y29uc3RydWN0b3IoKXtcclxuXHRcdHN1cGVyKCk7XHJcblx0XHR0aGlzLmJ1ZmZlciA9IFtdO1xyXG5cdFx0dGhpcy5pbmRleCA9IC0xO1xyXG5cdH1cclxuXHRcclxuXHRjbGVhcigpe1xyXG4gICAgdGhpcy5idWZmZXIubGVuZ3RoID0gMDtcclxuICAgIHRoaXMuaW5kZXggPSAtMTtcclxuICAgIHRoaXMuZW1pdCgnY2xlYXJlZCcpO1xyXG5cdH1cclxuXHRcclxuXHRleGVjKGNvbW1hbmQpe1xyXG4gICAgY29tbWFuZC5leGVjKCk7XHJcbiAgICBpZiAoKHRoaXMuaW5kZXggKyAxKSA8IHRoaXMuYnVmZmVyLmxlbmd0aClcclxuICAgIHtcclxuICAgICAgdGhpcy5idWZmZXIubGVuZ3RoID0gdGhpcy5pbmRleCArIDE7XHJcbiAgICB9XHJcbiAgICB0aGlzLmJ1ZmZlci5wdXNoKGNvbW1hbmQpO1xyXG4gICAgKyt0aGlzLmluZGV4O1xyXG4gICAgdGhpcy5lbWl0KCdleGVjdXRlZCcpO1xyXG5cdH1cclxuXHRcclxuXHRyZWRvKCl7XHJcbiAgICBpZiAoKHRoaXMuaW5kZXggKyAxKSA8ICh0aGlzLmJ1ZmZlci5sZW5ndGgpKVxyXG4gICAge1xyXG4gICAgICArK3RoaXMuaW5kZXg7XHJcbiAgICAgIHZhciBjb21tYW5kID0gdGhpcy5idWZmZXJbdGhpcy5pbmRleF07XHJcbiAgICAgIGNvbW1hbmQucmVkbygpO1xyXG4gICAgICB0aGlzLmVtaXQoJ3JlZGlkJyk7XHJcbiAgICAgIGlmICgodGhpcy5pbmRleCAgKyAxKSA9PSB0aGlzLmJ1ZmZlci5sZW5ndGgpXHJcbiAgICAgIHtcclxuICAgICAgICB0aGlzLmVtaXQoJ3JlZG9FbXB0eScpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblx0fVxyXG4gIHVuZG8oKVxyXG4gIHtcclxuICAgIGlmICh0aGlzLmJ1ZmZlci5sZW5ndGggPiAwICYmIHRoaXMuaW5kZXggPj0gMClcclxuICAgIHtcclxuICAgICAgdmFyIGNvbW1hbmQgPSB0aGlzLmJ1ZmZlclt0aGlzLmluZGV4XTtcclxuICAgICAgY29tbWFuZC51bmRvKCk7XHJcbiAgICAgIC0tdGhpcy5pbmRleDtcclxuICAgICAgdGhpcy5lbWl0KCd1bmRpZCcpO1xyXG4gICAgICBpZiAodGhpcy5pbmRleCA8IDApXHJcbiAgICAgIHtcclxuICAgICAgICB0aGlzLmluZGV4ID0gLTE7XHJcbiAgICAgICAgdGhpcy5lbWl0KCd1bmRvRW1wdHknKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHRcclxufVxyXG5cclxudmFyIHVuZG9NYW5hZ2VyID0gbmV3IFVuZG9NYW5hZ2VyKCk7XHJcbmV4cG9ydCBkZWZhdWx0IHVuZG9NYW5hZ2VyOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbi8vXHJcbi8vIFdlIHN0b3JlIG91ciBFRSBvYmplY3RzIGluIGEgcGxhaW4gb2JqZWN0IHdob3NlIHByb3BlcnRpZXMgYXJlIGV2ZW50IG5hbWVzLlxyXG4vLyBJZiBgT2JqZWN0LmNyZWF0ZShudWxsKWAgaXMgbm90IHN1cHBvcnRlZCB3ZSBwcmVmaXggdGhlIGV2ZW50IG5hbWVzIHdpdGggYVxyXG4vLyBgfmAgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIGJ1aWx0LWluIG9iamVjdCBwcm9wZXJ0aWVzIGFyZSBub3Qgb3ZlcnJpZGRlbiBvclxyXG4vLyB1c2VkIGFzIGFuIGF0dGFjayB2ZWN0b3IuXHJcbi8vIFdlIGFsc28gYXNzdW1lIHRoYXQgYE9iamVjdC5jcmVhdGUobnVsbClgIGlzIGF2YWlsYWJsZSB3aGVuIHRoZSBldmVudCBuYW1lXHJcbi8vIGlzIGFuIEVTNiBTeW1ib2wuXHJcbi8vXHJcbnZhciBwcmVmaXggPSB0eXBlb2YgT2JqZWN0LmNyZWF0ZSAhPT0gJ2Z1bmN0aW9uJyA/ICd+JyA6IGZhbHNlO1xyXG5cclxuLyoqXHJcbiAqIFJlcHJlc2VudGF0aW9uIG9mIGEgc2luZ2xlIEV2ZW50RW1pdHRlciBmdW5jdGlvbi5cclxuICpcclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gRXZlbnQgaGFuZGxlciB0byBiZSBjYWxsZWQuXHJcbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgQ29udGV4dCBmb3IgZnVuY3Rpb24gZXhlY3V0aW9uLlxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG9uY2UgT25seSBlbWl0IG9uY2VcclxuICogQGFwaSBwcml2YXRlXHJcbiAqL1xyXG5mdW5jdGlvbiBFRShmbiwgY29udGV4dCwgb25jZSkge1xyXG4gIHRoaXMuZm4gPSBmbjtcclxuICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xyXG4gIHRoaXMub25jZSA9IG9uY2UgfHwgZmFsc2U7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBNaW5pbWFsIEV2ZW50RW1pdHRlciBpbnRlcmZhY2UgdGhhdCBpcyBtb2xkZWQgYWdhaW5zdCB0aGUgTm9kZS5qc1xyXG4gKiBFdmVudEVtaXR0ZXIgaW50ZXJmYWNlLlxyXG4gKlxyXG4gKiBAY29uc3RydWN0b3JcclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHsgLyogTm90aGluZyB0byBzZXQgKi8gfVxyXG5cclxuLyoqXHJcbiAqIEhvbGRzIHRoZSBhc3NpZ25lZCBFdmVudEVtaXR0ZXJzIGJ5IG5hbWUuXHJcbiAqXHJcbiAqIEB0eXBlIHtPYmplY3R9XHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XHJcblxyXG4vKipcclxuICogUmV0dXJuIGEgbGlzdCBvZiBhc3NpZ25lZCBldmVudCBsaXN0ZW5lcnMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnRzIHRoYXQgc2hvdWxkIGJlIGxpc3RlZC5cclxuICogQHBhcmFtIHtCb29sZWFufSBleGlzdHMgV2Ugb25seSBuZWVkIHRvIGtub3cgaWYgdGhlcmUgYXJlIGxpc3RlbmVycy5cclxuICogQHJldHVybnMge0FycmF5fEJvb2xlYW59XHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uIGxpc3RlbmVycyhldmVudCwgZXhpc3RzKSB7XHJcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnRcclxuICAgICwgYXZhaWxhYmxlID0gdGhpcy5fZXZlbnRzICYmIHRoaXMuX2V2ZW50c1tldnRdO1xyXG5cclxuICBpZiAoZXhpc3RzKSByZXR1cm4gISFhdmFpbGFibGU7XHJcbiAgaWYgKCFhdmFpbGFibGUpIHJldHVybiBbXTtcclxuICBpZiAoYXZhaWxhYmxlLmZuKSByZXR1cm4gW2F2YWlsYWJsZS5mbl07XHJcblxyXG4gIGZvciAodmFyIGkgPSAwLCBsID0gYXZhaWxhYmxlLmxlbmd0aCwgZWUgPSBuZXcgQXJyYXkobCk7IGkgPCBsOyBpKyspIHtcclxuICAgIGVlW2ldID0gYXZhaWxhYmxlW2ldLmZuO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGVlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEVtaXQgYW4gZXZlbnQgdG8gYWxsIHJlZ2lzdGVyZWQgZXZlbnQgbGlzdGVuZXJzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIG5hbWUgb2YgdGhlIGV2ZW50LlxyXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gSW5kaWNhdGlvbiBpZiB3ZSd2ZSBlbWl0dGVkIGFuIGV2ZW50LlxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gZW1pdChldmVudCwgYTEsIGEyLCBhMywgYTQsIGE1KSB7XHJcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XHJcblxyXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbZXZ0XSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW2V2dF1cclxuICAgICwgbGVuID0gYXJndW1lbnRzLmxlbmd0aFxyXG4gICAgLCBhcmdzXHJcbiAgICAsIGk7XHJcblxyXG4gIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgbGlzdGVuZXJzLmZuKSB7XHJcbiAgICBpZiAobGlzdGVuZXJzLm9uY2UpIHRoaXMucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVycy5mbiwgdW5kZWZpbmVkLCB0cnVlKTtcclxuXHJcbiAgICBzd2l0Y2ggKGxlbikge1xyXG4gICAgICBjYXNlIDE6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCksIHRydWU7XHJcbiAgICAgIGNhc2UgMjogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSksIHRydWU7XHJcbiAgICAgIGNhc2UgMzogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIpLCB0cnVlO1xyXG4gICAgICBjYXNlIDQ6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMyksIHRydWU7XHJcbiAgICAgIGNhc2UgNTogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzLCBhNCksIHRydWU7XHJcbiAgICAgIGNhc2UgNjogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzLCBhNCwgYTUpLCB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGZvciAoaSA9IDEsIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0xKTsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xyXG4gICAgfVxyXG5cclxuICAgIGxpc3RlbmVycy5mbi5hcHBseShsaXN0ZW5lcnMuY29udGV4dCwgYXJncyk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHZhciBsZW5ndGggPSBsaXN0ZW5lcnMubGVuZ3RoXHJcbiAgICAgICwgajtcclxuXHJcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgaWYgKGxpc3RlbmVyc1tpXS5vbmNlKSB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcnNbaV0uZm4sIHVuZGVmaW5lZCwgdHJ1ZSk7XHJcblxyXG4gICAgICBzd2l0Y2ggKGxlbikge1xyXG4gICAgICAgIGNhc2UgMTogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQpOyBicmVhaztcclxuICAgICAgICBjYXNlIDI6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhMSk7IGJyZWFrO1xyXG4gICAgICAgIGNhc2UgMzogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGExLCBhMik7IGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICBpZiAoIWFyZ3MpIGZvciAoaiA9IDEsIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0xKTsgaiA8IGxlbjsgaisrKSB7XHJcbiAgICAgICAgICAgIGFyZ3NbaiAtIDFdID0gYXJndW1lbnRzW2pdO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGxpc3RlbmVyc1tpXS5mbi5hcHBseShsaXN0ZW5lcnNbaV0uY29udGV4dCwgYXJncyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlZ2lzdGVyIGEgbmV3IEV2ZW50TGlzdGVuZXIgZm9yIHRoZSBnaXZlbiBldmVudC5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IE5hbWUgb2YgdGhlIGV2ZW50LlxyXG4gKiBAcGFyYW0ge0Z1bmN0b259IGZuIENhbGxiYWNrIGZ1bmN0aW9uLlxyXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IFRoZSBjb250ZXh0IG9mIHRoZSBmdW5jdGlvbi5cclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBmdW5jdGlvbiBvbihldmVudCwgZm4sIGNvbnRleHQpIHtcclxuICB2YXIgbGlzdGVuZXIgPSBuZXcgRUUoZm4sIGNvbnRleHQgfHwgdGhpcylcclxuICAgICwgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcclxuXHJcbiAgaWYgKCF0aGlzLl9ldmVudHMpIHRoaXMuX2V2ZW50cyA9IHByZWZpeCA/IHt9IDogT2JqZWN0LmNyZWF0ZShudWxsKTtcclxuICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdKSB0aGlzLl9ldmVudHNbZXZ0XSA9IGxpc3RlbmVyO1xyXG4gIGVsc2Uge1xyXG4gICAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XS5mbikgdGhpcy5fZXZlbnRzW2V2dF0ucHVzaChsaXN0ZW5lcik7XHJcbiAgICBlbHNlIHRoaXMuX2V2ZW50c1tldnRdID0gW1xyXG4gICAgICB0aGlzLl9ldmVudHNbZXZ0XSwgbGlzdGVuZXJcclxuICAgIF07XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBBZGQgYW4gRXZlbnRMaXN0ZW5lciB0aGF0J3Mgb25seSBjYWxsZWQgb25jZS5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IE5hbWUgb2YgdGhlIGV2ZW50LlxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBDYWxsYmFjayBmdW5jdGlvbi5cclxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBUaGUgY29udGV4dCBvZiB0aGUgZnVuY3Rpb24uXHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbiBvbmNlKGV2ZW50LCBmbiwgY29udGV4dCkge1xyXG4gIHZhciBsaXN0ZW5lciA9IG5ldyBFRShmbiwgY29udGV4dCB8fCB0aGlzLCB0cnVlKVxyXG4gICAgLCBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xyXG5cclxuICBpZiAoIXRoaXMuX2V2ZW50cykgdGhpcy5fZXZlbnRzID0gcHJlZml4ID8ge30gOiBPYmplY3QuY3JlYXRlKG51bGwpO1xyXG4gIGlmICghdGhpcy5fZXZlbnRzW2V2dF0pIHRoaXMuX2V2ZW50c1tldnRdID0gbGlzdGVuZXI7XHJcbiAgZWxzZSB7XHJcbiAgICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdLmZuKSB0aGlzLl9ldmVudHNbZXZ0XS5wdXNoKGxpc3RlbmVyKTtcclxuICAgIGVsc2UgdGhpcy5fZXZlbnRzW2V2dF0gPSBbXHJcbiAgICAgIHRoaXMuX2V2ZW50c1tldnRdLCBsaXN0ZW5lclxyXG4gICAgXTtcclxuICB9XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlbW92ZSBldmVudCBsaXN0ZW5lcnMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgd2Ugd2FudCB0byByZW1vdmUuXHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBsaXN0ZW5lciB0aGF0IHdlIG5lZWQgdG8gZmluZC5cclxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBPbmx5IHJlbW92ZSBsaXN0ZW5lcnMgbWF0Y2hpbmcgdGhpcyBjb250ZXh0LlxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG9uY2UgT25seSByZW1vdmUgb25jZSBsaXN0ZW5lcnMuXHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5cclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKGV2ZW50LCBmbiwgY29udGV4dCwgb25jZSkge1xyXG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xyXG5cclxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW2V2dF0pIHJldHVybiB0aGlzO1xyXG5cclxuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW2V2dF1cclxuICAgICwgZXZlbnRzID0gW107XHJcblxyXG4gIGlmIChmbikge1xyXG4gICAgaWYgKGxpc3RlbmVycy5mbikge1xyXG4gICAgICBpZiAoXHJcbiAgICAgICAgICAgbGlzdGVuZXJzLmZuICE9PSBmblxyXG4gICAgICAgIHx8IChvbmNlICYmICFsaXN0ZW5lcnMub25jZSlcclxuICAgICAgICB8fCAoY29udGV4dCAmJiBsaXN0ZW5lcnMuY29udGV4dCAhPT0gY29udGV4dClcclxuICAgICAgKSB7XHJcbiAgICAgICAgZXZlbnRzLnB1c2gobGlzdGVuZXJzKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGxpc3RlbmVycy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGlmIChcclxuICAgICAgICAgICAgIGxpc3RlbmVyc1tpXS5mbiAhPT0gZm5cclxuICAgICAgICAgIHx8IChvbmNlICYmICFsaXN0ZW5lcnNbaV0ub25jZSlcclxuICAgICAgICAgIHx8IChjb250ZXh0ICYmIGxpc3RlbmVyc1tpXS5jb250ZXh0ICE9PSBjb250ZXh0KVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgZXZlbnRzLnB1c2gobGlzdGVuZXJzW2ldKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vXHJcbiAgLy8gUmVzZXQgdGhlIGFycmF5LCBvciByZW1vdmUgaXQgY29tcGxldGVseSBpZiB3ZSBoYXZlIG5vIG1vcmUgbGlzdGVuZXJzLlxyXG4gIC8vXHJcbiAgaWYgKGV2ZW50cy5sZW5ndGgpIHtcclxuICAgIHRoaXMuX2V2ZW50c1tldnRdID0gZXZlbnRzLmxlbmd0aCA9PT0gMSA/IGV2ZW50c1swXSA6IGV2ZW50cztcclxuICB9IGVsc2Uge1xyXG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1tldnRdO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogUmVtb3ZlIGFsbCBsaXN0ZW5lcnMgb3Igb25seSB0aGUgbGlzdGVuZXJzIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50LlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IHdhbnQgdG8gcmVtb3ZlIGFsbCBsaXN0ZW5lcnMgZm9yLlxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbiByZW1vdmVBbGxMaXN0ZW5lcnMoZXZlbnQpIHtcclxuICBpZiAoIXRoaXMuX2V2ZW50cykgcmV0dXJuIHRoaXM7XHJcblxyXG4gIGlmIChldmVudCkgZGVsZXRlIHRoaXMuX2V2ZW50c1twcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50XTtcclxuICBlbHNlIHRoaXMuX2V2ZW50cyA9IHByZWZpeCA/IHt9IDogT2JqZWN0LmNyZWF0ZShudWxsKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vL1xyXG4vLyBBbGlhcyBtZXRob2RzIG5hbWVzIGJlY2F1c2UgcGVvcGxlIHJvbGwgbGlrZSB0aGF0LlxyXG4vL1xyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9mZiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXI7XHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uO1xyXG5cclxuLy9cclxuLy8gVGhpcyBmdW5jdGlvbiBkb2Vzbid0IGFwcGx5IGFueW1vcmUuXHJcbi8vXHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24gc2V0TWF4TGlzdGVuZXJzKCkge1xyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLy9cclxuLy8gRXhwb3NlIHRoZSBwcmVmaXguXHJcbi8vXHJcbkV2ZW50RW1pdHRlci5wcmVmaXhlZCA9IHByZWZpeDtcclxuXHJcbi8vXHJcbi8vIEV4cG9zZSB0aGUgbW9kdWxlLlxyXG4vL1xyXG5pZiAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiBtb2R1bGUpIHtcclxuICBtb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcclxufVxyXG5cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cImdyYXBoaWNzLmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cImlvLmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInNvbmcuanNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwidGV4dC5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJ1dGlsLmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cImRzcC5qc1wiIC8+XHJcblwidXNlIHN0cmljdFwiO1xyXG4vLy8vIFdlYiBBdWRpbyBBUEkg44Op44OD44OR44O844Kv44Op44K5IC8vLy9cclxudmFyIGZmdCA9IG5ldyBGRlQoNDA5NiwgNDQxMDApO1xyXG52YXIgQlVGRkVSX1NJWkUgPSAxMDI0O1xyXG52YXIgVElNRV9CQVNFID0gOTY7XHJcblxyXG52YXIgbm90ZUZyZXEgPSBbXTtcclxuZm9yICh2YXIgaSA9IC04MTsgaSA8IDQ2OyArK2kpIHtcclxuICBub3RlRnJlcS5wdXNoKE1hdGgucG93KDIsIGkgLyAxMikpO1xyXG59XHJcblxyXG52YXIgU3F1YXJlV2F2ZSA9IHtcclxuICBiaXRzOiA0LFxyXG4gIHdhdmVkYXRhOiBbMHhmLCAweGYsIDB4ZiwgMHhmLCAweGYsIDB4ZiwgMHhmLCAweGYsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdXHJcbn07Ly8gNGJpdCB3YXZlIGZvcm1cclxuXHJcbnZhciBTYXdXYXZlID0ge1xyXG4gIGJpdHM6IDQsXHJcbiAgd2F2ZWRhdGE6IFsweDAsIDB4MSwgMHgyLCAweDMsIDB4NCwgMHg1LCAweDYsIDB4NywgMHg4LCAweDksIDB4YSwgMHhiLCAweGMsIDB4ZCwgMHhlLCAweGZdXHJcbn07Ly8gNGJpdCB3YXZlIGZvcm1cclxuXHJcbnZhciBUcmlXYXZlID0ge1xyXG4gIGJpdHM6IDQsXHJcbiAgd2F2ZWRhdGE6IFsweDAsIDB4MiwgMHg0LCAweDYsIDB4OCwgMHhBLCAweEMsIDB4RSwgMHhGLCAweEUsIDB4QywgMHhBLCAweDgsIDB4NiwgMHg0LCAweDJdXHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZGVjb2RlU3RyKGJpdHMsIHdhdmVzdHIpIHtcclxuICB2YXIgYXJyID0gW107XHJcbiAgdmFyIG4gPSBiaXRzIC8gNCB8IDA7XHJcbiAgdmFyIGMgPSAwO1xyXG4gIHZhciB6ZXJvcG9zID0gMSA8PCAoYml0cyAtIDEpO1xyXG4gIHdoaWxlIChjIDwgd2F2ZXN0ci5sZW5ndGgpIHtcclxuICAgIHZhciBkID0gMDtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgKytpKSB7XHJcbiAgICAgIGV2YWwoXCJkID0gKGQgPDwgNCkgKyAweFwiICsgd2F2ZXN0ci5jaGFyQXQoYysrKSArIFwiO1wiKTtcclxuICAgIH1cclxuICAgIGFyci5wdXNoKChkIC0gemVyb3BvcykgLyB6ZXJvcG9zKTtcclxuICB9XHJcbiAgcmV0dXJuIGFycjtcclxufVxyXG5cclxudmFyIHdhdmVzID0gW1xyXG4gICAgZGVjb2RlU3RyKDQsICdFRUVFRUVFRUVFRUVFRUVFMDAwMDAwMDAwMDAwMDAwMCcpLFxyXG4gICAgZGVjb2RlU3RyKDQsICcwMDExMjIzMzQ0NTU2Njc3ODg5OUFBQkJDQ0RERUVGRicpLFxyXG4gICAgZGVjb2RlU3RyKDQsICcwMjM0NjY0NTlBQThBN0E5Nzc5NjU2NTZBQ0FBQ0RFRicpLFxyXG4gICAgZGVjb2RlU3RyKDQsICdCRENEQ0E5OTlBQ0RDREI5NDIxMjM2Nzc3NjMyMTI0NycpLFxyXG4gICAgZGVjb2RlU3RyKDQsICc3QUNERURDQTc0MjEwMTI0N0JERURCNzMyMDEzN0U3OCcpLFxyXG4gICAgZGVjb2RlU3RyKDQsICdBQ0NBNzc5QkRFREE2NjY3OTk5NDEwMTI2Nzc0MjI0NycpLFxyXG4gICAgZGVjb2RlU3RyKDQsICc3RUM5Q0VBN0NGRDhBQjcyOEQ5NDU3MjAzODUxMzUzMScpLFxyXG4gICAgZGVjb2RlU3RyKDQsICdFRTc3RUU3N0VFNzdFRTc3MDA3NzAwNzcwMDc3MDA3NycpLFxyXG4gICAgZGVjb2RlU3RyKDQsICdFRUVFODg4ODg4ODg4ODg4MDAwMDg4ODg4ODg4ODg4OCcpLy/jg47jgqTjgrrnlKjjga7jg4Djg5/jg7zms6LlvaJcclxuXTtcclxuXHJcbnZhciB3YXZlU2FtcGxlcyA9IFtdO1xyXG5leHBvcnQgZnVuY3Rpb24gV2F2ZVNhbXBsZShhdWRpb2N0eCwgY2gsIHNhbXBsZUxlbmd0aCwgc2FtcGxlUmF0ZSkge1xyXG5cclxuICB0aGlzLnNhbXBsZSA9IGF1ZGlvY3R4LmNyZWF0ZUJ1ZmZlcihjaCwgc2FtcGxlTGVuZ3RoLCBzYW1wbGVSYXRlIHx8IGF1ZGlvY3R4LnNhbXBsZVJhdGUpO1xyXG4gIHRoaXMubG9vcCA9IGZhbHNlO1xyXG4gIHRoaXMuc3RhcnQgPSAwO1xyXG4gIHRoaXMuZW5kID0gKHNhbXBsZUxlbmd0aCAtIDEpIC8gKHNhbXBsZVJhdGUgfHwgYXVkaW9jdHguc2FtcGxlUmF0ZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVXYXZlU2FtcGxlRnJvbVdhdmVzKGF1ZGlvY3R4LCBzYW1wbGVMZW5ndGgpIHtcclxuICBmb3IgKHZhciBpID0gMCwgZW5kID0gd2F2ZXMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgIHZhciBzYW1wbGUgPSBuZXcgV2F2ZVNhbXBsZShhdWRpb2N0eCwgMSwgc2FtcGxlTGVuZ3RoKTtcclxuICAgIHdhdmVTYW1wbGVzLnB1c2goc2FtcGxlKTtcclxuICAgIGlmIChpICE9IDgpIHtcclxuICAgICAgdmFyIHdhdmVkYXRhID0gd2F2ZXNbaV07XHJcbiAgICAgIHZhciBkZWx0YSA9IDQ0MC4wICogd2F2ZWRhdGEubGVuZ3RoIC8gYXVkaW9jdHguc2FtcGxlUmF0ZTtcclxuICAgICAgdmFyIHN0aW1lID0gMDtcclxuICAgICAgdmFyIG91dHB1dCA9IHNhbXBsZS5zYW1wbGUuZ2V0Q2hhbm5lbERhdGEoMCk7XHJcbiAgICAgIHZhciBsZW4gPSB3YXZlZGF0YS5sZW5ndGg7XHJcbiAgICAgIHZhciBpbmRleCA9IDA7XHJcbiAgICAgIHZhciBlbmRzYW1wbGUgPSAwO1xyXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHNhbXBsZUxlbmd0aDsgKytqKSB7XHJcbiAgICAgICAgaW5kZXggPSBzdGltZSB8IDA7XHJcbiAgICAgICAgb3V0cHV0W2pdID0gd2F2ZWRhdGFbaW5kZXhdO1xyXG4gICAgICAgIHN0aW1lICs9IGRlbHRhO1xyXG4gICAgICAgIGlmIChzdGltZSA+PSBsZW4pIHtcclxuICAgICAgICAgIHN0aW1lID0gc3RpbWUgLSBsZW47XHJcbiAgICAgICAgICBlbmRzYW1wbGUgPSBqO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBzYW1wbGUuZW5kID0gZW5kc2FtcGxlIC8gYXVkaW9jdHguc2FtcGxlUmF0ZTtcclxuICAgICAgc2FtcGxlLmxvb3AgPSB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8g44Oc44Kk44K5OOOBr+ODjuOCpOOCuuazouW9ouOBqOOBmeOCi1xyXG4gICAgICB2YXIgb3V0cHV0ID0gc2FtcGxlLnNhbXBsZS5nZXRDaGFubmVsRGF0YSgwKTtcclxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBzYW1wbGVMZW5ndGg7ICsraikge1xyXG4gICAgICAgIG91dHB1dFtqXSA9IE1hdGgucmFuZG9tKCkgKiAyLjAgLSAxLjA7XHJcbiAgICAgIH1cclxuICAgICAgc2FtcGxlLmVuZCA9IHNhbXBsZUxlbmd0aCAvIGF1ZGlvY3R4LnNhbXBsZVJhdGU7XHJcbiAgICAgIHNhbXBsZS5sb29wID0gdHJ1ZTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBXYXZlVGV4dHVyZSh3YXZlKSB7XHJcbiAgdGhpcy53YXZlID0gd2F2ZSB8fCB3YXZlc1swXTtcclxuICB0aGlzLnRleCA9IG5ldyBDYW52YXNUZXh0dXJlKDMyMCwgMTAgKiAxNik7XHJcbiAgdGhpcy5yZW5kZXIoKTtcclxufVxyXG5cclxuV2F2ZVRleHR1cmUucHJvdG90eXBlID0ge1xyXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGN0eCA9IHRoaXMudGV4LmN0eDtcclxuICAgIHZhciB3YXZlID0gdGhpcy53YXZlO1xyXG4gICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjdHguY2FudmFzLndpZHRoLCBjdHguY2FudmFzLmhlaWdodCk7XHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnd2hpdGUnO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzMjA7IGkgKz0gMTApIHtcclxuICAgICAgY3R4Lm1vdmVUbyhpLCAwKTtcclxuICAgICAgY3R4LmxpbmVUbyhpLCAyNTUpO1xyXG4gICAgfVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxNjA7IGkgKz0gMTApIHtcclxuICAgICAgY3R4Lm1vdmVUbygwLCBpKTtcclxuICAgICAgY3R4LmxpbmVUbygzMjAsIGkpO1xyXG4gICAgfVxyXG4gICAgY3R4LmZpbGxTdHlsZSA9ICdyZ2JhKDI1NSwyNTUsMjU1LDAuNyknO1xyXG4gICAgY3R4LnJlY3QoMCwgMCwgY3R4LmNhbnZhcy53aWR0aCwgY3R4LmNhbnZhcy5oZWlnaHQpO1xyXG4gICAgY3R4LnN0cm9rZSgpO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGMgPSAwOyBpIDwgY3R4LmNhbnZhcy53aWR0aDsgaSArPSAxMCwgKytjKSB7XHJcbiAgICAgIGN0eC5maWxsUmVjdChpLCAod2F2ZVtjXSA+IDApID8gODAgLSB3YXZlW2NdICogODAgOiA4MCwgMTAsIE1hdGguYWJzKHdhdmVbY10pICogODApO1xyXG4gICAgfVxyXG4gICAgdGhpcy50ZXgudGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgfVxyXG59O1xyXG5cclxuLy8vIOOCqOODs+ODmeODreODvOODl+OCuOOCp+ODjeODrOODvOOCv+ODvFxyXG5leHBvcnQgZnVuY3Rpb24gRW52ZWxvcGVHZW5lcmF0b3Iodm9pY2UsIGF0dGFjaywgZGVjYXksIHN1c3RhaW4sIHJlbGVhc2UpIHtcclxuICB0aGlzLnZvaWNlID0gdm9pY2U7XHJcbiAgLy90aGlzLmtleW9uID0gZmFsc2U7XHJcbiAgdGhpcy5hdHRhY2sgPSBhdHRhY2sgfHwgMC4wMDA1O1xyXG4gIHRoaXMuZGVjYXkgPSBkZWNheSB8fCAwLjA1O1xyXG4gIHRoaXMuc3VzdGFpbiA9IHN1c3RhaW4gfHwgMC41O1xyXG4gIHRoaXMucmVsZWFzZSA9IHJlbGVhc2UgfHwgMC41O1xyXG4gIHRoaXMudiA9IDEuMDtcclxuXHJcbn07XHJcblxyXG5FbnZlbG9wZUdlbmVyYXRvci5wcm90b3R5cGUgPVxyXG57XHJcbiAga2V5b246IGZ1bmN0aW9uICh0LHZlbCkge1xyXG4gICAgdGhpcy52ID0gdmVsIHx8IDEuMDtcclxuICAgIHZhciB2ID0gdGhpcy52O1xyXG4gICAgdmFyIHQwID0gdCB8fCB0aGlzLnZvaWNlLmF1ZGlvY3R4LmN1cnJlbnRUaW1lO1xyXG4gICAgdmFyIHQxID0gdDAgKyB0aGlzLmF0dGFjayAqIHY7XHJcbiAgICB2YXIgZ2FpbiA9IHRoaXMudm9pY2UuZ2Fpbi5nYWluO1xyXG4gICAgZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXModDApO1xyXG4gICAgZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLCB0MCk7XHJcbiAgICBnYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHYsIHQxKTtcclxuICAgIGdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUodGhpcy5zdXN0YWluICogdiwgdDAgKyB0aGlzLmRlY2F5IC8gdik7XHJcbiAgICAvL2dhaW4uc2V0VGFyZ2V0QXRUaW1lKHRoaXMuc3VzdGFpbiAqIHYsIHQxLCB0MSArIHRoaXMuZGVjYXkgLyB2KTtcclxuICB9LFxyXG4gIGtleW9mZjogZnVuY3Rpb24gKHQpIHtcclxuICAgIHZhciB2b2ljZSA9IHRoaXMudm9pY2U7XHJcbiAgICB2YXIgZ2FpbiA9IHZvaWNlLmdhaW4uZ2FpbjtcclxuICAgIHZhciB0MCA9IHQgfHwgdm9pY2UuYXVkaW9jdHguY3VycmVudFRpbWU7XHJcbiAgICBnYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyh0MCk7XHJcbiAgICAvL2dhaW4uc2V0VmFsdWVBdFRpbWUoMCwgdDAgKyB0aGlzLnJlbGVhc2UgLyB0aGlzLnYpO1xyXG4gICAgLy9nYWluLnNldFRhcmdldEF0VGltZSgwLCB0MCwgdDAgKyB0aGlzLnJlbGVhc2UgLyB0aGlzLnYpO1xyXG4gICAgZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCB0MCArIHRoaXMucmVsZWFzZSAvIHRoaXMudik7XHJcbiAgfVxyXG59O1xyXG5cclxuLy8vIOODnOOCpOOCuVxyXG5leHBvcnQgZnVuY3Rpb24gVm9pY2UoYXVkaW9jdHgpIHtcclxuICB0aGlzLmF1ZGlvY3R4ID0gYXVkaW9jdHg7XHJcbiAgdGhpcy5zYW1wbGUgPSB3YXZlU2FtcGxlc1s2XTtcclxuICB0aGlzLmdhaW4gPSBhdWRpb2N0eC5jcmVhdGVHYWluKCk7XHJcbiAgdGhpcy5nYWluLmdhaW4udmFsdWUgPSAwLjA7XHJcbiAgdGhpcy52b2x1bWUgPSBhdWRpb2N0eC5jcmVhdGVHYWluKCk7XHJcbiAgdGhpcy5lbnZlbG9wZSA9IG5ldyBFbnZlbG9wZUdlbmVyYXRvcih0aGlzKTtcclxuICB0aGlzLmluaXRQcm9jZXNzb3IoKTtcclxuICB0aGlzLmRldHVuZSA9IDEuMDtcclxuICB0aGlzLnZvbHVtZS5nYWluLnZhbHVlID0gMS4wO1xyXG4gIHRoaXMuZ2Fpbi5jb25uZWN0KHRoaXMudm9sdW1lKTtcclxuICB0aGlzLm91dHB1dCA9IHRoaXMudm9sdW1lO1xyXG59O1xyXG5cclxuVm9pY2UucHJvdG90eXBlID0ge1xyXG4gIGluaXRQcm9jZXNzb3I6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMucHJvY2Vzc29yID0gdGhpcy5hdWRpb2N0eC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcclxuICAgIHRoaXMucHJvY2Vzc29yLmJ1ZmZlciA9IHRoaXMuc2FtcGxlLnNhbXBsZTtcclxuICAgIHRoaXMucHJvY2Vzc29yLmxvb3AgPSB0aGlzLnNhbXBsZS5sb29wO1xyXG4gICAgdGhpcy5wcm9jZXNzb3IubG9vcFN0YXJ0ID0gMDtcclxuICAgIHRoaXMucHJvY2Vzc29yLnBsYXliYWNrUmF0ZS52YWx1ZSA9IDEuMDtcclxuICAgIHRoaXMucHJvY2Vzc29yLmxvb3BFbmQgPSB0aGlzLnNhbXBsZS5lbmQ7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5jb25uZWN0KHRoaXMuZ2Fpbik7XHJcbiAgfSxcclxuXHJcbiAgc2V0U2FtcGxlOiBmdW5jdGlvbiAoc2FtcGxlKSB7XHJcbiAgICAgIHRoaXMuZW52ZWxvcGUua2V5b2ZmKDApO1xyXG4gICAgICB0aGlzLnByb2Nlc3Nvci5kaXNjb25uZWN0KHRoaXMuZ2Fpbik7XHJcbiAgICAgIHRoaXMuc2FtcGxlID0gc2FtcGxlO1xyXG4gICAgICB0aGlzLmluaXRQcm9jZXNzb3IoKTtcclxuICAgICAgdGhpcy5wcm9jZXNzb3Iuc3RhcnQoKTtcclxuICB9LFxyXG4gIHN0YXJ0OiBmdW5jdGlvbiAoc3RhcnRUaW1lKSB7XHJcbiAvLyAgIGlmICh0aGlzLnByb2Nlc3Nvci5wbGF5YmFja1N0YXRlID09IDMpIHtcclxuICAgICAgdGhpcy5wcm9jZXNzb3IuZGlzY29ubmVjdCh0aGlzLmdhaW4pO1xyXG4gICAgICB0aGlzLmluaXRQcm9jZXNzb3IoKTtcclxuLy8gICAgfSBlbHNlIHtcclxuLy8gICAgICB0aGlzLmVudmVsb3BlLmtleW9mZigpO1xyXG4vL1xyXG4vLyAgICB9XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5zdGFydChzdGFydFRpbWUpO1xyXG4gIH0sXHJcbiAgc3RvcDogZnVuY3Rpb24gKHRpbWUpIHtcclxuICAgIHRoaXMucHJvY2Vzc29yLnN0b3AodGltZSk7XHJcbiAgICB0aGlzLnJlc2V0KCk7XHJcbiAgfSxcclxuICBrZXlvbjpmdW5jdGlvbih0LG5vdGUsdmVsKVxyXG4gIHtcclxuICAgIHRoaXMucHJvY2Vzc29yLnBsYXliYWNrUmF0ZS5zZXRWYWx1ZUF0VGltZShub3RlRnJlcVtub3RlXSAqIHRoaXMuZGV0dW5lLCB0KTtcclxuICAgIHRoaXMuZW52ZWxvcGUua2V5b24odCx2ZWwpO1xyXG4gIH0sXHJcbiAga2V5b2ZmOmZ1bmN0aW9uKHQpXHJcbiAge1xyXG4gICAgdGhpcy5lbnZlbG9wZS5rZXlvZmYodCk7XHJcbiAgfSxcclxuICByZXNldDpmdW5jdGlvbigpXHJcbiAge1xyXG4gICAgdGhpcy5wcm9jZXNzb3IucGxheWJhY2tSYXRlLmNhbmNlbFNjaGVkdWxlZFZhbHVlcygwKTtcclxuICAgIHRoaXMuZ2Fpbi5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcygwKTtcclxuICAgIHRoaXMuZ2Fpbi5nYWluLnZhbHVlID0gMDtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBBdWRpbygpIHtcclxuICB0aGlzLmVuYWJsZSA9IGZhbHNlO1xyXG4gIHRoaXMuYXVkaW9Db250ZXh0ID0gd2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0IHx8IHdpbmRvdy5tb3pBdWRpb0NvbnRleHQ7XHJcblxyXG4gIGlmICh0aGlzLmF1ZGlvQ29udGV4dCkge1xyXG4gICAgdGhpcy5hdWRpb2N0eCA9IG5ldyB0aGlzLmF1ZGlvQ29udGV4dCgpO1xyXG4gICAgdGhpcy5lbmFibGUgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgdGhpcy52b2ljZXMgPSBbXTtcclxuICBpZiAodGhpcy5lbmFibGUpIHtcclxuICAgIGNyZWF0ZVdhdmVTYW1wbGVGcm9tV2F2ZXModGhpcy5hdWRpb2N0eCwgQlVGRkVSX1NJWkUpO1xyXG4gICAgdGhpcy5maWx0ZXIgPSB0aGlzLmF1ZGlvY3R4LmNyZWF0ZUJpcXVhZEZpbHRlcigpO1xyXG4gICAgdGhpcy5maWx0ZXIudHlwZSA9ICdsb3dwYXNzJztcclxuICAgIHRoaXMuZmlsdGVyLmZyZXF1ZW5jeS52YWx1ZSA9IDIwMDAwO1xyXG4gICAgdGhpcy5maWx0ZXIuUS52YWx1ZSA9IDAuMDAwMTtcclxuICAgIHRoaXMubm9pc2VGaWx0ZXIgPSB0aGlzLmF1ZGlvY3R4LmNyZWF0ZUJpcXVhZEZpbHRlcigpO1xyXG4gICAgdGhpcy5ub2lzZUZpbHRlci50eXBlID0gJ2xvd3Bhc3MnO1xyXG4gICAgdGhpcy5ub2lzZUZpbHRlci5mcmVxdWVuY3kudmFsdWUgPSAxMDAwO1xyXG4gICAgdGhpcy5ub2lzZUZpbHRlci5RLnZhbHVlID0gMS44O1xyXG4gICAgdGhpcy5jb21wID0gdGhpcy5hdWRpb2N0eC5jcmVhdGVEeW5hbWljc0NvbXByZXNzb3IoKTtcclxuICAgIHRoaXMuZmlsdGVyLmNvbm5lY3QodGhpcy5jb21wKTtcclxuICAgIHRoaXMubm9pc2VGaWx0ZXIuY29ubmVjdCh0aGlzLmNvbXApO1xyXG4gICAgdGhpcy5jb21wLmNvbm5lY3QodGhpcy5hdWRpb2N0eC5kZXN0aW5hdGlvbik7XHJcbiAgICBmb3IgKHZhciBpID0gMCxlbmQgPSB0aGlzLlZPSUNFUzsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIHZhciB2ID0gbmV3IFZvaWNlKHRoaXMuYXVkaW9jdHgpO1xyXG4gICAgICB0aGlzLnZvaWNlcy5wdXNoKHYpO1xyXG4gICAgICBpZihpID09ICh0aGlzLlZPSUNFUyAtIDEpKXtcclxuICAgICAgICB2Lm91dHB1dC5jb25uZWN0KHRoaXMubm9pc2VGaWx0ZXIpO1xyXG4gICAgICB9IGVsc2V7XHJcbiAgICAgICAgdi5vdXRwdXQuY29ubmVjdCh0aGlzLmZpbHRlcik7XHJcbiAgICAgIH1cclxuICAgIH1cclxuLy8gIHRoaXMuc3RhcnRlZCA9IGZhbHNlO1xyXG5cclxuICAgIC8vdGhpcy52b2ljZXNbMF0ub3V0cHV0LmNvbm5lY3QoKTtcclxuICB9XHJcblxyXG59XHJcblxyXG5BdWRpby5wcm90b3R5cGUgPSB7XHJcbiAgc3RhcnQ6IGZ1bmN0aW9uICgpXHJcbiAge1xyXG4gIC8vICBpZiAodGhpcy5zdGFydGVkKSByZXR1cm47XHJcblxyXG4gICAgdmFyIHZvaWNlcyA9IHRoaXMudm9pY2VzO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHZvaWNlcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSlcclxuICAgIHtcclxuICAgICAgdm9pY2VzW2ldLnN0YXJ0KDApO1xyXG4gICAgfVxyXG4gICAgLy90aGlzLnN0YXJ0ZWQgPSB0cnVlO1xyXG4gIH0sXHJcbiAgc3RvcDogZnVuY3Rpb24gKClcclxuICB7XHJcbiAgICAvL2lmKHRoaXMuc3RhcnRlZClcclxuICAgIC8ve1xyXG4gICAgICB2YXIgdm9pY2VzID0gdGhpcy52b2ljZXM7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB2b2ljZXMubGVuZ3RoOyBpIDwgZW5kOyArK2kpXHJcbiAgICAgIHtcclxuICAgICAgICB2b2ljZXNbaV0uc3RvcCgwKTtcclxuICAgICAgfVxyXG4gICAgLy8gIHRoaXMuc3RhcnRlZCA9IGZhbHNlO1xyXG4gICAgLy99XHJcbiAgfSxcclxuICBWT0lDRVM6IDEyXHJcbn1cclxuXHJcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4vKiDjgrfjg7zjgrHjg7PjgrXjg7zjgrPjg57jg7Pjg4kgICAgICAgICAgICAgICAgICAgICAgICovXHJcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIE5vdGUobm8sIG5hbWUpIHtcclxuICB0aGlzLm5vID0gbm87XHJcbiAgdGhpcy5uYW1lID0gbmFtZTtcclxufVxyXG5cclxuTm90ZS5wcm90b3R5cGUgPSB7XHJcbiAgcHJvY2VzczogZnVuY3Rpb24odHJhY2spIFxyXG4gIHtcclxuICAgIHZhciBiYWNrID0gdHJhY2suYmFjaztcclxuICAgIHZhciBub3RlID0gdGhpcztcclxuICAgIHZhciBvY3QgPSB0aGlzLm9jdCB8fCBiYWNrLm9jdDtcclxuICAgIHZhciBzdGVwID0gdGhpcy5zdGVwIHx8IGJhY2suc3RlcDtcclxuICAgIHZhciBnYXRlID0gdGhpcy5nYXRlIHx8IGJhY2suZ2F0ZTtcclxuICAgIHZhciB2ZWwgPSB0aGlzLnZlbCB8fCBiYWNrLnZlbDtcclxuICAgIHNldFF1ZXVlKHRyYWNrLCBub3RlLCBvY3Qsc3RlcCwgZ2F0ZSwgdmVsKTtcclxuXHJcbiAgfVxyXG59XHJcblxyXG52YXIgXHJcbiAgQyAgPSBuZXcgTm90ZSggMCwnQyAnKSxcclxuICBEYiA9IG5ldyBOb3RlKCAxLCdEYicpLFxyXG4gIEQgID0gbmV3IE5vdGUoIDIsJ0QgJyksXHJcbiAgRWIgPSBuZXcgTm90ZSggMywnRWInKSxcclxuICBFICA9IG5ldyBOb3RlKCA0LCdFICcpLFxyXG4gIEYgID0gbmV3IE5vdGUoIDUsJ0YgJyksXHJcbiAgR2IgPSBuZXcgTm90ZSggNiwnR2InKSxcclxuICBHICA9IG5ldyBOb3RlKCA3LCdHICcpLFxyXG4gIEFiID0gbmV3IE5vdGUoIDgsJ0FiJyksXHJcbiAgQSAgPSBuZXcgTm90ZSggOSwnQSAnKSxcclxuICBCYiA9IG5ldyBOb3RlKDEwLCdCYicpLFxyXG4gIEIgPSBuZXcgTm90ZSgxMSwgJ0IgJyk7XHJcblxyXG4gLy8gUiA9IG5ldyBSZXN0KCk7XHJcblxyXG5mdW5jdGlvbiBTZXFEYXRhKG5vdGUsIG9jdCwgc3RlcCwgZ2F0ZSwgdmVsKVxyXG57XHJcbiAgdGhpcy5ub3RlID0gbm90ZTtcclxuICB0aGlzLm9jdCA9IG9jdDtcclxuICAvL3RoaXMubm8gPSBub3RlLm5vICsgb2N0ICogMTI7XHJcbiAgdGhpcy5zdGVwID0gc3RlcDtcclxuICB0aGlzLmdhdGUgPSBnYXRlO1xyXG4gIHRoaXMudmVsID0gdmVsO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZXRRdWV1ZSh0cmFjayxub3RlLG9jdCxzdGVwLGdhdGUsdmVsKVxyXG57XHJcbiAgdmFyIG5vID0gbm90ZS5ubyArIG9jdCAqIDEyO1xyXG4gIHZhciBzdGVwX3RpbWUgPSB0cmFjay5wbGF5aW5nVGltZTtcclxuICB2YXIgZ2F0ZV90aW1lID0gKChnYXRlID49IDApID8gZ2F0ZSAqIDYwIDogc3RlcCAqIGdhdGUgKiA2MCAqIC0xLjApIC8gKFRJTUVfQkFTRSAqIHRyYWNrLmxvY2FsVGVtcG8pICsgdHJhY2sucGxheWluZ1RpbWU7XHJcbiAgdmFyIHZvaWNlID0gdHJhY2suYXVkaW8udm9pY2VzW3RyYWNrLmNoYW5uZWxdO1xyXG4gIC8vY29uc29sZS5sb2codHJhY2suc2VxdWVuY2VyLnRlbXBvKTtcclxuICB2b2ljZS5rZXlvbihzdGVwX3RpbWUsIG5vLCB2ZWwpO1xyXG4gIHZvaWNlLmtleW9mZihnYXRlX3RpbWUpO1xyXG4gIHRyYWNrLnBsYXlpbmdUaW1lID0gKHN0ZXAgKiA2MCkgLyAoVElNRV9CQVNFICogdHJhY2subG9jYWxUZW1wbykgKyB0cmFjay5wbGF5aW5nVGltZTtcclxuICB2YXIgYmFjayA9IHRyYWNrLmJhY2s7XHJcbiAgYmFjay5ub3RlID0gbm90ZTtcclxuICBiYWNrLm9jdCA9IG9jdDtcclxuICBiYWNrLnN0ZXAgPSBzdGVwO1xyXG4gIGJhY2suZ2F0ZSA9IGdhdGU7XHJcbiAgYmFjay52ZWwgPSB2ZWw7XHJcbn1cclxuXHJcblNlcURhdGEucHJvdG90eXBlID0ge1xyXG4gIHByb2Nlc3M6IGZ1bmN0aW9uICh0cmFjaykge1xyXG5cclxuICAgIHZhciBiYWNrID0gdHJhY2suYmFjaztcclxuICAgIHZhciBub3RlID0gdGhpcy5ub3RlIHx8IGJhY2subm90ZTtcclxuICAgIHZhciBvY3QgPSB0aGlzLm9jdCB8fCBiYWNrLm9jdDtcclxuICAgIHZhciBzdGVwID0gdGhpcy5zdGVwIHx8IGJhY2suc3RlcDtcclxuICAgIHZhciBnYXRlID0gdGhpcy5nYXRlIHx8IGJhY2suZ2F0ZTtcclxuICAgIHZhciB2ZWwgPSB0aGlzLnZlbCB8fCBiYWNrLnZlbDtcclxuICAgIHNldFF1ZXVlKHRyYWNrLG5vdGUsb2N0LHN0ZXAsZ2F0ZSx2ZWwpO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gUyhub3RlLCBvY3QsIHN0ZXAsIGdhdGUsIHZlbCkge1xyXG4gIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcclxuICBpZiAoUy5sZW5ndGggIT0gYXJncy5sZW5ndGgpXHJcbiAge1xyXG4gICAgaWYodHlwZW9mKGFyZ3NbYXJncy5sZW5ndGggLSAxXSkgPT0gJ29iamVjdCcgJiYgICEoYXJnc1thcmdzLmxlbmd0aCAtIDFdIGluc3RhbmNlb2YgTm90ZSkpXHJcbiAgICB7XHJcbiAgICAgIHZhciBhcmdzMSA9IGFyZ3NbYXJncy5sZW5ndGggLSAxXTtcclxuICAgICAgdmFyIGwgPSBhcmdzLmxlbmd0aCAtIDE7XHJcbiAgICAgIHJldHVybiBuZXcgU2VxRGF0YShcclxuICAgICAgKChsICE9IDApP25vdGU6ZmFsc2UpIHx8IGFyZ3MxLm5vdGUgfHwgYXJnczEubiB8fCBudWxsLFxyXG4gICAgICAoKGwgIT0gMSkgPyBvY3QgOiBmYWxzZSkgfHwgYXJnczEub2N0IHx8IGFyZ3MxLm8gfHwgbnVsbCxcclxuICAgICAgKChsICE9IDIpID8gc3RlcCA6IGZhbHNlKSB8fCBhcmdzMS5zdGVwIHx8IGFyZ3MxLnMgfHwgbnVsbCxcclxuICAgICAgKChsICE9IDMpID8gZ2F0ZSA6IGZhbHNlKSB8fCBhcmdzMS5nYXRlIHx8IGFyZ3MxLmcgfHwgbnVsbCxcclxuICAgICAgKChsICE9IDQpID8gdmVsIDogZmFsc2UpIHx8IGFyZ3MxLnZlbCB8fCBhcmdzMS52IHx8IG51bGxcclxuICAgICAgKTtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIG5ldyBTZXFEYXRhKG5vdGUgfHwgbnVsbCwgb2N0IHx8IG51bGwsIHN0ZXAgfHwgbnVsbCwgZ2F0ZSB8fCBudWxsLCB2ZWwgfHwgbnVsbCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFMxKG5vdGUsIG9jdCwgc3RlcCwgZ2F0ZSwgdmVsKSB7XHJcbiAgcmV0dXJuIFMobm90ZSwgb2N0LCBsKHN0ZXApLCBnYXRlLCB2ZWwpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBTMihub3RlLCBsZW4sIGRvdCAsIG9jdCwgZ2F0ZSwgdmVsKSB7XHJcbiAgcmV0dXJuIFMobm90ZSwgb2N0LCBsKGxlbixkb3QpLCBnYXRlLCB2ZWwpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBTMyhub3RlLCBzdGVwLCBnYXRlLCB2ZWwsIG9jdCkge1xyXG4gIHJldHVybiBTKG5vdGUsIG9jdCwgc3RlcCwgZ2F0ZSwgdmVsKTtcclxufVxyXG5cclxuXHJcbi8vLyDpn7PnrKbjga7plbfjgZXmjIflrppcclxuXHJcbmZ1bmN0aW9uIGwobGVuLGRvdClcclxue1xyXG4gIHZhciBkID0gZmFsc2U7XHJcbiAgaWYgKGRvdCkgZCA9IGRvdDtcclxuICByZXR1cm4gKFRJTUVfQkFTRSAqICg0ICsgKGQ/MjowKSkpIC8gbGVuO1xyXG59XHJcblxyXG5mdW5jdGlvbiBTdGVwKHN0ZXApIHtcclxuICB0aGlzLnN0ZXAgPSBzdGVwO1xyXG59XHJcblxyXG5TdGVwLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKHRyYWNrKVxyXG57XHJcbiAgdHJhY2suYmFjay5zdGVwID0gdGhpcy5zdGVwO1xyXG59XHJcblxyXG5mdW5jdGlvbiBTVChzdGVwKVxyXG57XHJcbiAgcmV0dXJuIG5ldyBTdGVwKHN0ZXApO1xyXG59XHJcblxyXG5mdW5jdGlvbiBMKGxlbiwgZG90KSB7XHJcbiAgcmV0dXJuIG5ldyBTdGVwKGwobGVuLCBkb3QpKTtcclxufVxyXG5cclxuLy8vIOOCsuODvOODiOOCv+OCpOODoOaMh+WumlxyXG5cclxuZnVuY3Rpb24gR2F0ZVRpbWUoZ2F0ZSkge1xyXG4gIHRoaXMuZ2F0ZSA9IGdhdGU7XHJcbn1cclxuXHJcbkdhdGVUaW1lLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKHRyYWNrKSB7XHJcbiAgdHJhY2suYmFjay5nYXRlID0gdGhpcy5nYXRlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBHVChnYXRlKSB7XHJcbiAgcmV0dXJuIG5ldyBHYXRlVGltZShnYXRlKTtcclxufVxyXG5cclxuLy8vIOODmeODreOCt+ODhuOCo+aMh+WumlxyXG5cclxuZnVuY3Rpb24gVmVsb2NpdHkodmVsKSB7XHJcbiAgdGhpcy52ZWwgPSB2ZWw7XHJcbn1cclxuXHJcblZlbG9jaXR5LnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKHRyYWNrKSB7XHJcbiAgdHJhY2suYmFjay52ZWwgPSB0aGlzLnZlbDtcclxufVxyXG5cclxuZnVuY3Rpb24gVih2ZWwpIHtcclxuICByZXR1cm4gbmV3IFZlbG9jaXR5KHZlbCk7XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBKdW1wKHBvcykgeyB0aGlzLnBvcyA9IHBvczt9O1xyXG5KdW1wLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKHRyYWNrKVxyXG57XHJcbiAgdHJhY2suc2VxUG9zID0gdGhpcy5wb3M7XHJcbn1cclxuXHJcbi8vLyDpn7PoibLoqK3lrppcclxuZnVuY3Rpb24gVG9uZShubylcclxue1xyXG4gIHRoaXMubm8gPSBubztcclxuICAvL3RoaXMuc2FtcGxlID0gd2F2ZVNhbXBsZXNbdGhpcy5ub107XHJcbn1cclxuXHJcblRvbmUucHJvdG90eXBlID1cclxue1xyXG4gIHByb2Nlc3M6IGZ1bmN0aW9uICh0cmFjaylcclxuICB7XHJcbiAgICB0cmFjay5hdWRpby52b2ljZXNbdHJhY2suY2hhbm5lbF0uc2V0U2FtcGxlKHdhdmVTYW1wbGVzW3RoaXMubm9dKTtcclxuICB9XHJcbn1cclxuZnVuY3Rpb24gVE9ORShubylcclxue1xyXG4gIHJldHVybiBuZXcgVG9uZShubyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIEpVTVAocG9zKSB7XHJcbiAgcmV0dXJuIG5ldyBKdW1wKHBvcyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFJlc3Qoc3RlcClcclxue1xyXG4gIHRoaXMuc3RlcCA9IHN0ZXA7XHJcbn1cclxuXHJcblJlc3QucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbih0cmFjaylcclxue1xyXG4gIHZhciBzdGVwID0gdGhpcy5zdGVwIHx8IHRyYWNrLmJhY2suc3RlcDtcclxuICB0cmFjay5wbGF5aW5nVGltZSA9IHRyYWNrLnBsYXlpbmdUaW1lICsgKHRoaXMuc3RlcCAqIDYwKSAvIChUSU1FX0JBU0UgKiB0cmFjay5sb2NhbFRlbXBvKTtcclxuICB0cmFjay5iYWNrLnN0ZXAgPSB0aGlzLnN0ZXA7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFIxKHN0ZXApIHtcclxuICByZXR1cm4gbmV3IFJlc3Qoc3RlcCk7XHJcbn1cclxuZnVuY3Rpb24gUihsZW4sZG90KSB7XHJcbiAgcmV0dXJuIG5ldyBSZXN0KGwobGVuLGRvdCkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBPY3RhdmUob2N0KSB7XHJcbiAgdGhpcy5vY3QgPSBvY3Q7XHJcbn1cclxuT2N0YXZlLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24odHJhY2spXHJcbntcclxuICB0cmFjay5iYWNrLm9jdCA9IHRoaXMub2N0O1xyXG59XHJcblxyXG5mdW5jdGlvbiBPKG9jdCkge1xyXG4gIHJldHVybiBuZXcgT2N0YXZlKG9jdCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIE9jdGF2ZVVwKHYpIHsgdGhpcy52ID0gdjsgfTtcclxuT2N0YXZlVXAucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbih0cmFjaykge1xyXG4gIHRyYWNrLmJhY2sub2N0ICs9IHRoaXMudjtcclxufVxyXG5cclxudmFyIE9VID0gbmV3IE9jdGF2ZVVwKDEpO1xyXG52YXIgT0QgPSBuZXcgT2N0YXZlVXAoLTEpO1xyXG5cclxuZnVuY3Rpb24gVGVtcG8odGVtcG8pXHJcbntcclxuICB0aGlzLnRlbXBvID0gdGVtcG87XHJcbn1cclxuXHJcblRlbXBvLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24odHJhY2spXHJcbntcclxuICB0cmFjay5sb2NhbFRlbXBvID0gdGhpcy50ZW1wbztcclxuICAvL3RyYWNrLnNlcXVlbmNlci50ZW1wbyA9IHRoaXMudGVtcG87XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFRFTVBPKHRlbXBvKVxyXG57XHJcbiAgcmV0dXJuIG5ldyBUZW1wbyh0ZW1wbyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIEVudmVsb3BlKGF0dGFjaywgZGVjYXksIHN1c3RhaW4sIHJlbGVhc2UpXHJcbntcclxuICB0aGlzLmF0dGFjayA9IGF0dGFjaztcclxuICB0aGlzLmRlY2F5ID0gZGVjYXk7XHJcbiAgdGhpcy5zdXN0YWluID0gc3VzdGFpbjtcclxuICB0aGlzLnJlbGVhc2UgPSByZWxlYXNlO1xyXG59XHJcblxyXG5FbnZlbG9wZS5wcm90b3R5cGUucHJvY2VzcyA9IGZ1bmN0aW9uKHRyYWNrKVxyXG57XHJcbiAgdmFyIGVudmVsb3BlID0gdHJhY2suYXVkaW8udm9pY2VzW3RyYWNrLmNoYW5uZWxdLmVudmVsb3BlO1xyXG4gIGVudmVsb3BlLmF0dGFjayA9IHRoaXMuYXR0YWNrO1xyXG4gIGVudmVsb3BlLmRlY2F5ID0gdGhpcy5kZWNheTtcclxuICBlbnZlbG9wZS5zdXN0YWluID0gdGhpcy5zdXN0YWluO1xyXG4gIGVudmVsb3BlLnJlbGVhc2UgPSB0aGlzLnJlbGVhc2U7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIEVOVihhdHRhY2ssZGVjYXksc3VzdGFpbiAscmVsZWFzZSlcclxue1xyXG4gIHJldHVybiBuZXcgRW52ZWxvcGUoYXR0YWNrLCBkZWNheSwgc3VzdGFpbiwgcmVsZWFzZSk7XHJcbn1cclxuXHJcbi8vLyDjg4fjg4Hjg6Xjg7zjg7NcclxuZnVuY3Rpb24gRGV0dW5lKGRldHVuZSlcclxue1xyXG4gIHRoaXMuZGV0dW5lID0gZGV0dW5lO1xyXG59XHJcblxyXG5EZXR1bmUucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbih0cmFjaylcclxue1xyXG4gIHZhciB2b2ljZSA9IHRyYWNrLmF1ZGlvLnZvaWNlc1t0cmFjay5jaGFubmVsXTtcclxuICB2b2ljZS5kZXR1bmUgPSB0aGlzLmRldHVuZTtcclxufVxyXG5cclxuZnVuY3Rpb24gREVUVU5FKGRldHVuZSlcclxue1xyXG4gIHJldHVybiBuZXcgRGV0dW5lKGRldHVuZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFZvbHVtZSh2b2x1bWUpXHJcbntcclxuICB0aGlzLnZvbHVtZSA9IHZvbHVtZTtcclxufVxyXG5cclxuVm9sdW1lLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24odHJhY2spXHJcbntcclxuICB0cmFjay5hdWRpby52b2ljZXNbdHJhY2suY2hhbm5lbF0udm9sdW1lLmdhaW4uc2V0VmFsdWVBdFRpbWUodGhpcy52b2x1bWUsIHRyYWNrLnBsYXlpbmdUaW1lKTtcclxufVxyXG5cclxuZnVuY3Rpb24gVk9MVU1FKHZvbHVtZSlcclxue1xyXG4gIHJldHVybiBuZXcgVm9sdW1lKHZvbHVtZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIExvb3BEYXRhKG9iaix2YXJuYW1lLCBjb3VudCxzZXFQb3MpXHJcbntcclxuICB0aGlzLnZhcm5hbWUgPSB2YXJuYW1lO1xyXG4gIHRoaXMuY291bnQgPSBjb3VudDtcclxuICB0aGlzLm9iaiA9IG9iajtcclxuICB0aGlzLnNlcVBvcyA9IHNlcVBvcztcclxufVxyXG5cclxuZnVuY3Rpb24gTG9vcCh2YXJuYW1lLCBjb3VudCkge1xyXG4gIHRoaXMubG9vcERhdGEgPSBuZXcgTG9vcERhdGEodGhpcyx2YXJuYW1lLGNvdW50LDApO1xyXG59XHJcblxyXG5Mb29wLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKHRyYWNrKVxyXG57XHJcbiAgdmFyIHN0YWNrID0gdHJhY2suc3RhY2s7XHJcbiAgaWYgKHN0YWNrLmxlbmd0aCA9PSAwIHx8IHN0YWNrW3N0YWNrLmxlbmd0aCAtIDFdLm9iaiAhPT0gdGhpcylcclxuICB7XHJcbiAgICB2YXIgbGQgPSB0aGlzLmxvb3BEYXRhO1xyXG4gICAgc3RhY2sucHVzaChuZXcgTG9vcERhdGEodGhpcywgbGQudmFybmFtZSwgbGQuY291bnQsIHRyYWNrLnNlcVBvcykpO1xyXG4gIH0gXHJcbn1cclxuXHJcbmZ1bmN0aW9uIExPT1AodmFybmFtZSwgY291bnQpIHtcclxuICByZXR1cm4gbmV3IExvb3AodmFybmFtZSxjb3VudCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIExvb3BFbmQoKVxyXG57XHJcbn1cclxuXHJcbkxvb3BFbmQucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbih0cmFjaylcclxue1xyXG4gIHZhciBsZCA9IHRyYWNrLnN0YWNrW3RyYWNrLnN0YWNrLmxlbmd0aCAtIDFdO1xyXG4gIGxkLmNvdW50LS07XHJcbiAgaWYgKGxkLmNvdW50ID4gMCkge1xyXG4gICAgdHJhY2suc2VxUG9zID0gbGQuc2VxUG9zO1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0cmFjay5zdGFjay5wb3AoKTtcclxuICB9XHJcbn1cclxuXHJcbnZhciBMT09QX0VORCA9IG5ldyBMb29wRW5kKCk7XHJcblxyXG4vLy8g44K344O844Kx44Oz44K144O844OI44Op44OD44KvXHJcbmZ1bmN0aW9uIFRyYWNrKHNlcXVlbmNlcixzZXFkYXRhLGF1ZGlvKVxyXG57XHJcbiAgdGhpcy5uYW1lID0gJyc7XHJcbiAgdGhpcy5lbmQgPSBmYWxzZTtcclxuICB0aGlzLm9uZXNob3QgPSBmYWxzZTtcclxuICB0aGlzLnNlcXVlbmNlciA9IHNlcXVlbmNlcjtcclxuICB0aGlzLnNlcURhdGEgPSBzZXFkYXRhO1xyXG4gIHRoaXMuc2VxUG9zID0gMDtcclxuICB0aGlzLm11dGUgPSBmYWxzZTtcclxuICB0aGlzLnBsYXlpbmdUaW1lID0gLTE7XHJcbiAgdGhpcy5sb2NhbFRlbXBvID0gc2VxdWVuY2VyLnRlbXBvO1xyXG4gIHRoaXMudHJhY2tWb2x1bWUgPSAxLjA7XHJcbiAgdGhpcy50cmFuc3Bvc2UgPSAwO1xyXG4gIHRoaXMuc29sbyA9IGZhbHNlO1xyXG4gIHRoaXMuY2hhbm5lbCA9IC0xO1xyXG4gIHRoaXMudHJhY2sgPSAtMTtcclxuICB0aGlzLmF1ZGlvID0gYXVkaW87XHJcbiAgdGhpcy5iYWNrID0ge1xyXG4gICAgbm90ZTogNzIsXHJcbiAgICBvY3Q6IDUsXHJcbiAgICBzdGVwOiA5NixcclxuICAgIGdhdGU6IDQ4LFxyXG4gICAgdmVsOjEuMFxyXG4gIH1cclxuICB0aGlzLnN0YWNrID0gW107XHJcbn1cclxuXHJcblRyYWNrLnByb3RvdHlwZSA9IHtcclxuICBwcm9jZXNzOiBmdW5jdGlvbiAoY3VycmVudFRpbWUpIHtcclxuXHJcbiAgICBpZiAodGhpcy5lbmQpIHJldHVybjtcclxuICAgIFxyXG4gICAgaWYgKHRoaXMub25lc2hvdCkge1xyXG4gICAgICB0aGlzLnJlc2V0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHNlcVNpemUgPSB0aGlzLnNlcURhdGEubGVuZ3RoO1xyXG4gICAgaWYgKHRoaXMuc2VxUG9zID49IHNlcVNpemUpIHtcclxuICAgICAgaWYodGhpcy5zZXF1ZW5jZXIucmVwZWF0KVxyXG4gICAgICB7XHJcbiAgICAgICAgdGhpcy5zZXFQb3MgPSAwO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZW5kID0gdHJ1ZTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgc2VxID0gdGhpcy5zZXFEYXRhO1xyXG4gICAgdGhpcy5wbGF5aW5nVGltZSA9ICh0aGlzLnBsYXlpbmdUaW1lID4gLTEpID8gdGhpcy5wbGF5aW5nVGltZSA6IGN1cnJlbnRUaW1lO1xyXG4gICAgdmFyIGVuZFRpbWUgPSBjdXJyZW50VGltZSArIDAuMi8qc2VjKi87XHJcblxyXG4gICAgd2hpbGUgKHRoaXMuc2VxUG9zIDwgc2VxU2l6ZSkge1xyXG4gICAgICBpZiAodGhpcy5wbGF5aW5nVGltZSA+PSBlbmRUaW1lICYmICF0aGlzLm9uZXNob3QpIHtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgZCA9IHNlcVt0aGlzLnNlcVBvc107XHJcbiAgICAgICAgZC5wcm9jZXNzKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuc2VxUG9zKys7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG4gIHJlc2V0OmZ1bmN0aW9uKClcclxuICB7XHJcbiAgICB2YXIgY3VyVm9pY2UgPSB0aGlzLmF1ZGlvLnZvaWNlc1t0aGlzLmNoYW5uZWxdO1xyXG4gICAgY3VyVm9pY2UuZ2Fpbi5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcygwKTtcclxuICAgIGN1clZvaWNlLnByb2Nlc3Nvci5wbGF5YmFja1JhdGUuY2FuY2VsU2NoZWR1bGVkVmFsdWVzKDApO1xyXG4gICAgY3VyVm9pY2UuZ2Fpbi5nYWluLnZhbHVlID0gMDtcclxuICAgIHRoaXMucGxheWluZ1RpbWUgPSAtMTtcclxuICAgIHRoaXMuc2VxUG9zID0gMDtcclxuICAgIHRoaXMuZW5kID0gZmFsc2U7XHJcbiAgfVxyXG5cclxufVxyXG5cclxuZnVuY3Rpb24gbG9hZFRyYWNrcyhzZWxmLHRyYWNrcywgdHJhY2tkYXRhKVxyXG57XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0cmFja2RhdGEubGVuZ3RoOyArK2kpIHtcclxuICAgIHZhciB0cmFjayA9IG5ldyBUcmFjayhzZWxmLCB0cmFja2RhdGFbaV0uZGF0YSxzZWxmLmF1ZGlvKTtcclxuICAgIHRyYWNrLmNoYW5uZWwgPSB0cmFja2RhdGFbaV0uY2hhbm5lbDtcclxuICAgIHRyYWNrLm9uZXNob3QgPSAoIXRyYWNrZGF0YVtpXS5vbmVzaG90KT9mYWxzZTp0cnVlO1xyXG4gICAgdHJhY2sudHJhY2sgPSBpO1xyXG4gICAgdHJhY2tzLnB1c2godHJhY2spO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlVHJhY2tzKHRyYWNrZGF0YSlcclxue1xyXG4gIHZhciB0cmFja3MgPSBbXTtcclxuICBsb2FkVHJhY2tzKHRoaXMsdHJhY2tzLCB0cmFja2RhdGEpO1xyXG4gIHJldHVybiB0cmFja3M7XHJcbn1cclxuXHJcbi8vLyDjgrfjg7zjgrHjg7PjgrXjg7zmnKzkvZNcclxuZXhwb3J0IGZ1bmN0aW9uIFNlcXVlbmNlcihhdWRpbykge1xyXG4gIHRoaXMuYXVkaW8gPSBhdWRpbztcclxuICB0aGlzLnRlbXBvID0gMTAwLjA7XHJcbiAgdGhpcy5yZXBlYXQgPSBmYWxzZTtcclxuICB0aGlzLnBsYXkgPSBmYWxzZTtcclxuICB0aGlzLnRyYWNrcyA9IFtdO1xyXG4gIHRoaXMucGF1c2VUaW1lID0gMDtcclxuICB0aGlzLnN0YXR1cyA9IHRoaXMuU1RPUDtcclxufVxyXG5cclxuU2VxdWVuY2VyLnByb3RvdHlwZSA9IHtcclxuICBsb2FkOiBmdW5jdGlvbihkYXRhKVxyXG4gIHtcclxuICAgIGlmKHRoaXMucGxheSkge1xyXG4gICAgICB0aGlzLnN0b3AoKTtcclxuICAgIH1cclxuICAgIHRoaXMudHJhY2tzLmxlbmd0aCA9IDA7XHJcbiAgICBsb2FkVHJhY2tzKHRoaXMsdGhpcy50cmFja3MsIGRhdGEudHJhY2tzLHRoaXMuYXVkaW8pO1xyXG4gIH0sXHJcbiAgc3RhcnQ6ZnVuY3Rpb24oKVxyXG4gIHtcclxuICAgIC8vICAgIHRoaXMuaGFuZGxlID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkgeyBzZWxmLnByb2Nlc3MoKSB9LCA1MCk7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuUExBWTtcclxuICAgIHRoaXMucHJvY2VzcygpO1xyXG4gIH0sXHJcbiAgcHJvY2VzczpmdW5jdGlvbigpXHJcbiAge1xyXG4gICAgaWYgKHRoaXMuc3RhdHVzID09IHRoaXMuUExBWSkge1xyXG4gICAgICB0aGlzLnBsYXlUcmFja3ModGhpcy50cmFja3MpO1xyXG4gICAgICB0aGlzLmhhbmRsZSA9IHdpbmRvdy5zZXRUaW1lb3V0KHRoaXMucHJvY2Vzcy5iaW5kKHRoaXMpLCAxMDApO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgcGxheVRyYWNrczogZnVuY3Rpb24gKHRyYWNrcyl7XHJcbiAgICB2YXIgY3VycmVudFRpbWUgPSB0aGlzLmF1ZGlvLmF1ZGlvY3R4LmN1cnJlbnRUaW1lO1xyXG4gLy8gICBjb25zb2xlLmxvZyh0aGlzLmF1ZGlvLmF1ZGlvY3R4LmN1cnJlbnRUaW1lKTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0cmFja3MubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgdHJhY2tzW2ldLnByb2Nlc3MoY3VycmVudFRpbWUpO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgcGF1c2U6ZnVuY3Rpb24oKVxyXG4gIHtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5QQVVTRTtcclxuICAgIHRoaXMucGF1c2VUaW1lID0gdGhpcy5hdWRpby5hdWRpb2N0eC5jdXJyZW50VGltZTtcclxuICB9LFxyXG4gIHJlc3VtZTpmdW5jdGlvbiAoKVxyXG4gIHtcclxuICAgIGlmICh0aGlzLnN0YXR1cyA9PSB0aGlzLlBBVVNFKSB7XHJcbiAgICAgIHRoaXMuc3RhdHVzID0gdGhpcy5QTEFZO1xyXG4gICAgICB2YXIgdHJhY2tzID0gdGhpcy50cmFja3M7XHJcbiAgICAgIHZhciBhZGp1c3QgPSB0aGlzLmF1ZGlvLmF1ZGlvY3R4LmN1cnJlbnRUaW1lIC0gdGhpcy5wYXVzZVRpbWU7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0cmFja3MubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgICB0cmFja3NbaV0ucGxheWluZ1RpbWUgKz0gYWRqdXN0O1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMucHJvY2VzcygpO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgc3RvcDogZnVuY3Rpb24gKClcclxuICB7XHJcbiAgICBpZiAodGhpcy5zdGF0dXMgIT0gdGhpcy5TVE9QKSB7XHJcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLmhhbmRsZSk7XHJcbiAgICAgIC8vICAgIGNsZWFySW50ZXJ2YWwodGhpcy5oYW5kbGUpO1xyXG4gICAgICB0aGlzLnN0YXR1cyA9IHRoaXMuU1RPUDtcclxuICAgICAgdGhpcy5yZXNldCgpO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgcmVzZXQ6ZnVuY3Rpb24oKVxyXG4gIHtcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0aGlzLnRyYWNrcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSlcclxuICAgIHtcclxuICAgICAgdGhpcy50cmFja3NbaV0ucmVzZXQoKTtcclxuICAgIH1cclxuICB9LFxyXG4gIFNUT1A6IDAgfCAwLFxyXG4gIFBMQVk6IDEgfCAwLFxyXG4gIFBBVVNFOjIgfCAwXHJcbn1cclxuXHJcbi8vLyDnsKHmmJPpjbXnm6Tjga7lrp/oo4VcclxuZnVuY3Rpb24gUGlhbm8oYXVkaW8pIHtcclxuICB0aGlzLmF1ZGlvID0gYXVkaW87XHJcbiAgdGhpcy50YWJsZSA9IFs5MCwgODMsIDg4LCA2OCwgNjcsIDg2LCA3MSwgNjYsIDcyLCA3OCwgNzQsIDc3LCAxODhdO1xyXG4gIHRoaXMua2V5b24gPSBuZXcgQXJyYXkoMTMpO1xyXG59XHJcblxyXG5QaWFuby5wcm90b3R5cGUgPSB7XHJcbiAgb246IGZ1bmN0aW9uIChlKSB7XHJcbiAgICB2YXIgaW5kZXggPSB0aGlzLnRhYmxlLmluZGV4T2YoZS5rZXlDb2RlLCAwKTtcclxuICAgIGlmIChpbmRleCA9PSAtMSkge1xyXG4gICAgICBpZiAoZS5rZXlDb2RlID4gNDggJiYgZS5rZXlDb2RlIDwgNTcpIHtcclxuICAgICAgICB2YXIgdGltYnJlID0gZS5rZXlDb2RlIC0gNDk7XHJcbiAgICAgICAgdGhpcy5hdWRpby52b2ljZXNbN10uc2V0U2FtcGxlKHdhdmVTYW1wbGVzW3RpbWJyZV0pO1xyXG4gICAgICAgIHdhdmVHcmFwaC53YXZlID0gd2F2ZXNbdGltYnJlXTtcclxuICAgICAgICB3YXZlR3JhcGgucmVuZGVyKCk7XHJcbiAgICAgICAgdGV4dFBsYW5lLnByaW50KDUsIDEwLCBcIldhdmUgXCIgKyAodGltYnJlICsgMSkpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy9hdWRpby52b2ljZXNbMF0ucHJvY2Vzc29yLnBsYXliYWNrUmF0ZS52YWx1ZSA9IHNlcXVlbmNlci5ub3RlRnJlcVtdO1xyXG4gICAgICBpZiAoIXRoaXMua2V5b25baW5kZXhdKSB7XHJcbiAgICAgICAgdGhpcy5hdWRpby52b2ljZXNbN10ua2V5b24oMCxpbmRleCArIChlLnNoaWZ0S2V5ID8gODQgOiA3MiksMS4wKTtcclxuICAgICAgICB0aGlzLmtleW9uW2luZGV4XSA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICB9LFxyXG4gIG9mZjogZnVuY3Rpb24gKGUpIHtcclxuICAgIHZhciBpbmRleCA9IHRoaXMudGFibGUuaW5kZXhPZihlLmtleUNvZGUsIDApO1xyXG4gICAgaWYgKGluZGV4ID09IC0xKSB7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKHRoaXMua2V5b25baW5kZXhdKSB7XHJcbiAgICAgICAgYXVkaW8udm9pY2VzWzddLmVudmVsb3BlLmtleW9mZigwKTtcclxuICAgICAgICB0aGlzLmtleW9uW2luZGV4XSA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgc2VxRGF0YSA9IHtcclxuICBuYW1lOiAnVGVzdCcsXHJcbiAgdHJhY2tzOiBbXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6ICdwYXJ0MScsXHJcbiAgICAgIGNoYW5uZWw6IDAsXHJcbiAgICAgIGRhdGE6XHJcbiAgICAgIFtcclxuICAgICAgICBFTlYoMC4wMSwgMC4wMiwgMC41LCAwLjA3KSxcclxuICAgICAgICBURU1QTygxODApLCBUT05FKDApLCBWT0xVTUUoMC41KSwgTCg4KSwgR1QoLTAuNSksTyg0KSxcclxuICAgICAgICBMT09QKCdpJyw0KSxcclxuICAgICAgICBDLCBDLCBDLCBDLCBDLCBDLCBDLCBDLFxyXG4gICAgICAgIExPT1BfRU5ELFxyXG4gICAgICAgIEpVTVAoNSlcclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgbmFtZTogJ3BhcnQyJyxcclxuICAgICAgY2hhbm5lbDogMSxcclxuICAgICAgZGF0YTpcclxuICAgICAgICBbXHJcbiAgICAgICAgRU5WKDAuMDEsIDAuMDUsIDAuNiwgMC4wNyksXHJcbiAgICAgICAgVEVNUE8oMTgwKSxUT05FKDYpLCBWT0xVTUUoMC4yKSwgTCg4KSwgR1QoLTAuOCksXHJcbiAgICAgICAgUigxKSwgUigxKSxcclxuICAgICAgICBPKDYpLEwoMSksIEYsXHJcbiAgICAgICAgRSxcclxuICAgICAgICBPRCwgTCg4LCB0cnVlKSwgQmIsIEcsIEwoNCksIEJiLCBPVSwgTCg0KSwgRiwgTCg4KSwgRCxcclxuICAgICAgICBMKDQsIHRydWUpLCBFLCBMKDIpLCBDLFIoOCksXHJcbiAgICAgICAgSlVNUCg4KVxyXG4gICAgICAgIF1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6ICdwYXJ0MycsXHJcbiAgICAgIGNoYW5uZWw6IDIsXHJcbiAgICAgIGRhdGE6XHJcbiAgICAgICAgW1xyXG4gICAgICAgIEVOVigwLjAxLCAwLjA1LCAwLjYsIDAuMDcpLFxyXG4gICAgICAgIFRFTVBPKDE4MCksVE9ORSg2KSwgVk9MVU1FKDAuMSksIEwoOCksIEdUKC0wLjUpLCBcclxuICAgICAgICBSKDEpLCBSKDEpLFxyXG4gICAgICAgIE8oNiksTCgxKSwgQyxDLFxyXG4gICAgICAgIE9ELCBMKDgsIHRydWUpLCBHLCBELCBMKDQpLCBHLCBPVSwgTCg0KSwgRCwgTCg4KSxPRCwgRyxcclxuICAgICAgICBMKDQsIHRydWUpLCBPVSxDLCBMKDIpLE9ELCBHLCBSKDgpLFxyXG4gICAgICAgIEpVTVAoNylcclxuICAgICAgICBdXHJcbiAgICB9XHJcbiAgXVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gU291bmRFZmZlY3RzKHNlcXVlbmNlcikge1xyXG4gICB0aGlzLnNvdW5kRWZmZWN0cyA9XHJcbiAgICBbXHJcbiAgICAvLyBFZmZlY3QgMCAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgIGNyZWF0ZVRyYWNrcy5jYWxsKHNlcXVlbmNlcixbXHJcbiAgICB7XHJcbiAgICAgIGNoYW5uZWw6IDgsXHJcbiAgICAgIG9uZXNob3Q6dHJ1ZSxcclxuICAgICAgZGF0YTogW1ZPTFVNRSgwLjUpLFxyXG4gICAgICAgIEVOVigwLjAwMDEsIDAuMDEsIDEuMCwgMC4wMDAxKSxHVCgtMC45OTkpLFRPTkUoMCksIFRFTVBPKDIwMCksIE8oOCksU1QoMyksIEMsIEQsIEUsIEYsIEcsIEEsIEIsIE9VLCBDLCBELCBFLCBHLCBBLCBCLEIsQixCXHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGNoYW5uZWw6IDksXHJcbiAgICAgIG9uZXNob3Q6IHRydWUsXHJcbiAgICAgIGRhdGE6IFtWT0xVTUUoMC41KSxcclxuICAgICAgICBFTlYoMC4wMDAxLCAwLjAxLCAxLjAsIDAuMDAwMSksIERFVFVORSgwLjkpLCBHVCgtMC45OTkpLCBUT05FKDApLCBURU1QTygyMDApLCBPKDUpLCBTVCgzKSwgQywgRCwgRSwgRiwgRywgQSwgQiwgT1UsIEMsIEQsIEUsIEcsIEEsIEIsQixCLEJcclxuICAgICAgXVxyXG4gICAgfVxyXG4gICAgXSksXHJcbiAgICAvLyBFZmZlY3QgMSAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICBjcmVhdGVUcmFja3MuY2FsbChzZXF1ZW5jZXIsXHJcbiAgICAgIFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBjaGFubmVsOiAxMCxcclxuICAgICAgICAgIG9uZXNob3Q6IHRydWUsXHJcbiAgICAgICAgICBkYXRhOiBbXHJcbiAgICAgICAgICAgVE9ORSg0KSwgVEVNUE8oMTUwKSwgU1QoNCksIEdUKC0wLjk5OTkpLCBFTlYoMC4wMDAxLCAwLjAwMDEsIDEuMCwgMC4wMDAxKSxcclxuICAgICAgICAgICBPKDYpLCBHLCBBLCBCLCBPKDcpLCBCLCBBLCBHLCBGLCBFLCBELCBDLCBFLCBHLCBBLCBCLCBPRCwgQiwgQSwgRywgRiwgRSwgRCwgQywgT0QsIEIsIEEsIEcsIEYsIEUsIEQsIENcclxuICAgICAgICAgIF1cclxuICAgICAgICB9XHJcbiAgICAgIF0pLFxyXG4gICAgLy8gRWZmZWN0IDIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgY3JlYXRlVHJhY2tzLmNhbGwoc2VxdWVuY2VyLFxyXG4gICAgICBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgY2hhbm5lbDogMTAsXHJcbiAgICAgICAgICBvbmVzaG90OiB0cnVlLFxyXG4gICAgICAgICAgZGF0YTogW1xyXG4gICAgICAgICAgIFRPTkUoMCksIFRFTVBPKDE1MCksIFNUKDIpLCBHVCgtMC45OTk5KSwgRU5WKDAuMDAwMSwgMC4wMDAxLCAxLjAsIDAuMDAwMSksXHJcbiAgICAgICAgICAgTyg4KSwgQyxELEUsRixHLEEsQixPVSxDLEQsRSxGLE9ELEcsT1UsQSxPRCxCLE9VLEEsT0QsRyxPVSxGLE9ELEUsT1UsRVxyXG4gICAgICAgICAgXVxyXG4gICAgICAgIH1cclxuICAgICAgXSksXHJcbiAgICAgIC8vIEVmZmVjdCAzIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgICBjcmVhdGVUcmFja3MuY2FsbChzZXF1ZW5jZXIsXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBjaGFubmVsOiAxMCxcclxuICAgICAgICAgICAgb25lc2hvdDogdHJ1ZSxcclxuICAgICAgICAgICAgZGF0YTogW1xyXG4gICAgICAgICAgICAgVE9ORSg1KSwgVEVNUE8oMTUwKSwgTCg2NCksIEdUKC0wLjk5OTkpLCBFTlYoMC4wMDAxLCAwLjAwMDEsIDEuMCwgMC4wMDAxKSxcclxuICAgICAgICAgICAgIE8oNiksQyxPRCxDLE9VLEMsT0QsQyxPVSxDLE9ELEMsT1UsQyxPRFxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgXSksXHJcbiAgICAgIC8vIEVmZmVjdCA0IC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgICAgY3JlYXRlVHJhY2tzLmNhbGwoc2VxdWVuY2VyLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgY2hhbm5lbDogMTEsXHJcbiAgICAgICAgICAgIG9uZXNob3Q6IHRydWUsXHJcbiAgICAgICAgICAgIGRhdGE6IFtcclxuICAgICAgICAgICAgIFRPTkUoOCksIFZPTFVNRSgyLjApLFRFTVBPKDEyMCksIEwoMiksIEdUKC0wLjk5OTkpLCBFTlYoMC4wMDAxLCAwLjAwMDEsIDEuMCwgMC4yNSksXHJcbiAgICAgICAgICAgICBPKDEpLCBDXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICAgIH1cclxuICAgICAgICBdKVxyXG4gICBdO1xyXG4gfVxyXG5cclxuXHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBDb21tIHtcclxuICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgdmFyIGhvc3QgPSB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUubWF0Y2goL3d3d1xcLnNmcGdtclxcLm5ldC9pZyk/J3d3dy5zZnBnbXIubmV0JzonbG9jYWxob3N0JztcclxuICAgIHRoaXMuZW5hYmxlID0gZmFsc2U7XHJcbiAgICB0cnkge1xyXG4gICAgICB0aGlzLnNvY2tldCA9IGlvLmNvbm5lY3QoJ2h0dHA6Ly8nICsgaG9zdCArICc6ODA4MS90ZXN0Jyk7XHJcbiAgICAgIHRoaXMuZW5hYmxlID0gdHJ1ZTtcclxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICB0aGlzLnNvY2tldC5vbignc2VuZEhpZ2hTY29yZXMnLCAoZGF0YSk9PntcclxuICAgICAgICBpZih0aGlzLnVwZGF0ZUhpZ2hTY29yZXMpe1xyXG4gICAgICAgICAgdGhpcy51cGRhdGVIaWdoU2NvcmVzKGRhdGEpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIHRoaXMuc29ja2V0Lm9uKCdzZW5kSGlnaFNjb3JlJywgKGRhdGEpPT57XHJcbiAgICAgICAgdGhpcy51cGRhdGVIaWdoU2NvcmUoZGF0YSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdGhpcy5zb2NrZXQub24oJ3NlbmRSYW5rJywgKGRhdGEpID0+IHtcclxuICAgICAgICB0aGlzLnVwZGF0ZUhpZ2hTY29yZXMoZGF0YS5oaWdoU2NvcmVzKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLnNvY2tldC5vbignZXJyb3JDb25uZWN0aW9uTWF4JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGFsZXJ0KCflkIzmmYLmjqXntprjga7kuIrpmZDjgavpgZTjgZfjgb7jgZfjgZ/jgIInKTtcclxuICAgICAgICBzZWxmLmVuYWJsZSA9IGZhbHNlO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMuc29ja2V0Lm9uKCdkaXNjb25uZWN0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmIChzZWxmLmVuYWJsZSkge1xyXG4gICAgICAgICAgc2VsZi5lbmFibGUgPSBmYWxzZTtcclxuICAgICAgICAgIGFsZXJ0KCfjgrXjg7zjg5Djg7zmjqXntprjgYzliIfmlq3jgZXjgozjgb7jgZfjgZ/jgIInKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgYWxlcnQoJ1NvY2tldC5JT+OBjOWIqeeUqOOBp+OBjeOBquOBhOOBn+OCgeOAgeODj+OCpOOCueOCs+OCouaDheWgseOBjOWPluW+l+OBp+OBjeOBvuOBm+OCk+OAgicgKyBlKTtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgc2VuZFNjb3JlKHNjb3JlKVxyXG4gIHtcclxuICAgIGlmICh0aGlzLmVuYWJsZSkge1xyXG4gICAgICB0aGlzLnNvY2tldC5lbWl0KCdzZW5kU2NvcmUnLCBzY29yZSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIGRpc2Nvbm5lY3QoKVxyXG4gIHtcclxuICAgIGlmICh0aGlzLmVuYWJsZSkge1xyXG4gICAgICB0aGlzLmVuYWJsZSA9IGZhbHNlO1xyXG4gICAgICB0aGlzLnNvY2tldC5kaXNjb25uZWN0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgKiBhcyBzZmcgZnJvbSAnLi9nbG9iYWwnO1xyXG5pbXBvcnQgKiAgYXMgZ2FtZW9iaiBmcm9tICcuL2dhbWVvYmonO1xyXG5pbXBvcnQgKiBhcyBncmFwaGljcyBmcm9tICcuL2dyYXBoaWNzJztcclxuXHJcblxyXG4vLy8g54iG55m6XHJcbmV4cG9ydCBjbGFzcyBCb21iIGV4dGVuZHMgZ2FtZW9iai5HYW1lT2JqIFxyXG57XHJcbiAgY29uc3RydWN0b3Ioc2NlbmUsc2UpIHtcclxuICAgIHN1cGVyKDAsMCwwKTtcclxuICAgIHZhciB0ZXggPSBzZmcudGV4dHVyZUZpbGVzLmJvbWI7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVNYXRlcmlhbCh0ZXgpO1xyXG4gICAgbWF0ZXJpYWwuYmxlbmRpbmcgPSBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nO1xyXG4gICAgbWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gZ3JhcGhpY3MuY3JlYXRlU3ByaXRlR2VvbWV0cnkoMTYpO1xyXG4gICAgZ3JhcGhpY3MuY3JlYXRlU3ByaXRlVVYoZ2VvbWV0cnksIHRleCwgMTYsIDE2LCAwKTtcclxuICAgIHRoaXMubWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgICB0aGlzLm1lc2gucG9zaXRpb24ueiA9IDAuMTtcclxuICAgIHRoaXMuaW5kZXggPSAwO1xyXG4gICAgdGhpcy5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxuICAgIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuICAgIHRoaXMuc2UgPSBzZTtcclxuICAgIHNjZW5lLmFkZCh0aGlzLm1lc2gpO1xyXG4gIH1cclxuICBnZXQgeCgpIHsgcmV0dXJuIHRoaXMueF87IH1cclxuICBzZXQgeCh2KSB7IHRoaXMueF8gPSB0aGlzLm1lc2gucG9zaXRpb24ueCA9IHY7IH1cclxuICBnZXQgeSgpIHsgcmV0dXJuIHRoaXMueV87IH1cclxuICBzZXQgeSh2KSB7IHRoaXMueV8gPSB0aGlzLm1lc2gucG9zaXRpb24ueSA9IHY7IH1cclxuICBnZXQgeigpIHsgcmV0dXJuIHRoaXMuel87IH1cclxuICBzZXQgeih2KSB7IHRoaXMuel8gPSB0aGlzLm1lc2gucG9zaXRpb24ueiA9IHY7IH1cclxuICBcclxuICBzdGFydCh4LCB5LCB6LCBkZWxheSkge1xyXG4gICAgaWYgKHRoaXMuZW5hYmxlXykge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB0aGlzLmRlbGF5ID0gZGVsYXkgfCAwO1xyXG4gICAgdGhpcy54ID0geDtcclxuICAgIHRoaXMueSA9IHk7XHJcbiAgICB0aGlzLnogPSB6IHwgMC4wMDAwMjtcclxuICAgIHRoaXMuZW5hYmxlXyA9IHRydWU7XHJcbiAgICBncmFwaGljcy51cGRhdGVTcHJpdGVVVih0aGlzLm1lc2guZ2VvbWV0cnksIHNmZy50ZXh0dXJlRmlsZXMuYm9tYiwgMTYsIDE2LCB0aGlzLmluZGV4KTtcclxuICAgIHRoaXMudGFzayA9IHNmZy50YXNrcy5wdXNoVGFzayh0aGlzLm1vdmUuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLm1lc2gubWF0ZXJpYWwub3BhY2l0eSA9IDEuMDtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuICBcclxuICAqbW92ZSh0YXNrSW5kZXgpIHtcclxuICAgIFxyXG4gICAgZm9yKCBsZXQgaSA9IDAsZSA9IHRoaXMuZGVsYXk7aSA8IGUgJiYgdGFza0luZGV4ID49IDA7KytpKVxyXG4gICAge1xyXG4gICAgICB0YXNrSW5kZXggPSB5aWVsZDsgICAgICBcclxuICAgIH1cclxuICAgIHRoaXMubWVzaC52aXNpYmxlID0gdHJ1ZTtcclxuXHJcbiAgICBmb3IobGV0IGkgPSAwO2kgPCA3ICYmIHRhc2tJbmRleCA+PSAwOysraSlcclxuICAgIHtcclxuICAgICAgZ3JhcGhpY3MudXBkYXRlU3ByaXRlVVYodGhpcy5tZXNoLmdlb21ldHJ5LCBzZmcudGV4dHVyZUZpbGVzLmJvbWIsIDE2LCAxNiwgaSk7XHJcbiAgICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICB0aGlzLmVuYWJsZV8gPSBmYWxzZTtcclxuICAgIHRoaXMubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICBzZmcudGFza3MucmVtb3ZlVGFzayh0YXNrSW5kZXgpO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEJvbWJzIHtcclxuICBjb25zdHJ1Y3RvcihzY2VuZSwgc2UpIHtcclxuICAgIHRoaXMuYm9tYnMgPSBuZXcgQXJyYXkoMCk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDMyOyArK2kpIHtcclxuICAgICAgdGhpcy5ib21icy5wdXNoKG5ldyBCb21iKHNjZW5lLCBzZSkpO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBzdGFydCh4LCB5LCB6KSB7XHJcbiAgICB2YXIgYm9tcyA9IHRoaXMuYm9tYnM7XHJcbiAgICB2YXIgY291bnQgPSAzO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IGJvbXMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgaWYgKCFib21zW2ldLmVuYWJsZV8pIHtcclxuICAgICAgICBpZiAoY291bnQgPT0gMikge1xyXG4gICAgICAgICAgYm9tc1tpXS5zdGFydCh4LCB5LCB6LCAwKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgYm9tc1tpXS5zdGFydCh4ICsgKE1hdGgucmFuZG9tKCkgKiAxNiAtIDgpLCB5ICsgKE1hdGgucmFuZG9tKCkgKiAxNiAtIDgpLCB6LCBNYXRoLnJhbmRvbSgpICogOCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvdW50LS07XHJcbiAgICAgICAgaWYgKCFjb3VudCkgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJlc2V0KCl7XHJcbiAgICB0aGlzLmJvbWJzLmZvckVhY2goKGQpPT57XHJcbiAgICAgIGlmKGQuZW5hYmxlXyl7XHJcbiAgICAgICAgd2hpbGUoIXNmZy50YXNrcy5hcnJheVtkLnRhc2suaW5kZXhdLmdlbkluc3QubmV4dCgtKDErZC50YXNrLmluZGV4KSkuZG9uZSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmltcG9ydCAqICBhcyBnYW1lb2JqIGZyb20gJy4vZ2FtZW9iaic7XHJcbmltcG9ydCAqIGFzIHNmZyBmcm9tICcuL2dsb2JhbCc7XHJcbmltcG9ydCAqIGFzIGdyYXBoaWNzIGZyb20gJy4vZ3JhcGhpY3MnO1xyXG5cclxuLy8vIOaVteW8vlxyXG5leHBvcnQgY2xhc3MgRW5lbXlCdWxsZXQgZXh0ZW5kcyBnYW1lb2JqLkdhbWVPYmoge1xyXG4gIGNvbnN0cnVjdG9yKHNjZW5lLCBzZSkge1xyXG4gICAgc3VwZXIoMCwgMCwgMCk7XHJcbiAgICB0aGlzLk5PTkUgPSAwO1xyXG4gICAgdGhpcy5NT1ZFID0gMTtcclxuICAgIHRoaXMuQk9NQiA9IDI7XHJcbiAgICB0aGlzLmNvbGxpc2lvbkFyZWEud2lkdGggPSAyO1xyXG4gICAgdGhpcy5jb2xsaXNpb25BcmVhLmhlaWdodCA9IDI7XHJcbiAgICB2YXIgdGV4ID0gc2ZnLnRleHR1cmVGaWxlcy5lbmVteTtcclxuICAgIHZhciBtYXRlcmlhbCA9IGdyYXBoaWNzLmNyZWF0ZVNwcml0ZU1hdGVyaWFsKHRleCk7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVHZW9tZXRyeSgxNik7XHJcbiAgICBncmFwaGljcy5jcmVhdGVTcHJpdGVVVihnZW9tZXRyeSwgdGV4LCAxNiwgMTYsIDApO1xyXG4gICAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICAgIHRoaXMueiA9IDAuMDtcclxuICAgIHRoaXMubXZQYXR0ZXJuID0gbnVsbDtcclxuICAgIHRoaXMubXYgPSBudWxsO1xyXG4gICAgdGhpcy5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxuICAgIHRoaXMudHlwZSA9IG51bGw7XHJcbiAgICB0aGlzLmxpZmUgPSAwO1xyXG4gICAgdGhpcy5keCA9IDA7XHJcbiAgICB0aGlzLmR5ID0gMDtcclxuICAgIHRoaXMuc3BlZWQgPSAyLjA7XHJcbiAgICB0aGlzLmVuYWJsZSA9IGZhbHNlO1xyXG4gICAgdGhpcy5oaXRfID0gbnVsbDtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5OT05FO1xyXG4gICAgdGhpcy5zY2VuZSA9IHNjZW5lO1xyXG4gICAgc2NlbmUuYWRkKHRoaXMubWVzaCk7XHJcbiAgICB0aGlzLnNlID0gc2U7XHJcbiAgfVxyXG5cclxuICBnZXQgeCgpIHsgcmV0dXJuIHRoaXMueF87IH1cclxuICBzZXQgeCh2KSB7IHRoaXMueF8gPSB0aGlzLm1lc2gucG9zaXRpb24ueCA9IHY7IH1cclxuICBnZXQgeSgpIHsgcmV0dXJuIHRoaXMueV87IH1cclxuICBzZXQgeSh2KSB7IHRoaXMueV8gPSB0aGlzLm1lc2gucG9zaXRpb24ueSA9IHY7IH1cclxuICBnZXQgeigpIHsgcmV0dXJuIHRoaXMuel87IH1cclxuICBzZXQgeih2KSB7IHRoaXMuel8gPSB0aGlzLm1lc2gucG9zaXRpb24ueiA9IHY7IH1cclxuICBnZXQgZW5hYmxlKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZW5hYmxlXztcclxuICB9XHJcbiAgXHJcbiAgc2V0IGVuYWJsZSh2KSB7XHJcbiAgICB0aGlzLmVuYWJsZV8gPSB2O1xyXG4gICAgdGhpcy5tZXNoLnZpc2libGUgPSB2O1xyXG4gIH1cclxuICBcclxuICAqbW92ZSh0YXNrSW5kZXgpIHtcclxuICAgIGZvcig7dGhpcy54ID49IChzZmcuVl9MRUZUIC0gMTYpICYmXHJcbiAgICAgICAgdGhpcy54IDw9IChzZmcuVl9SSUdIVCArIDE2KSAmJlxyXG4gICAgICAgIHRoaXMueSA+PSAoc2ZnLlZfQk9UVE9NIC0gMTYpICYmXHJcbiAgICAgICAgdGhpcy55IDw9IChzZmcuVl9UT1AgKyAxNikgJiYgdGFza0luZGV4ID49IDA7XHJcbiAgICAgICAgdGhpcy54ICs9IHRoaXMuZHgsdGhpcy55ICs9IHRoaXMuZHkpXHJcbiAgICB7XHJcbiAgICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpZih0YXNrSW5kZXggPj0gMCl7XHJcbiAgICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gICAgfVxyXG4gICAgdGhpcy5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5OT05FO1xyXG4gICAgdGhpcy5lbmFibGUgPSBmYWxzZTtcclxuICAgIHNmZy50YXNrcy5yZW1vdmVUYXNrKHRhc2tJbmRleCk7XHJcbiAgfVxyXG4gICBcclxuICBzdGFydCh4LCB5LCB6KSB7XHJcbiAgICBpZiAodGhpcy5lbmFibGUpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgdGhpcy54ID0geCB8fCAwO1xyXG4gICAgdGhpcy55ID0geSB8fCAwO1xyXG4gICAgdGhpcy56ID0geiB8fCAwO1xyXG4gICAgdGhpcy5lbmFibGUgPSB0cnVlO1xyXG4gICAgaWYgKHRoaXMuc3RhdHVzICE9IHRoaXMuTk9ORSlcclxuICAgIHtcclxuICAgICAgZGVidWdnZXI7XHJcbiAgICB9XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuTU9WRTtcclxuICAgIHZhciBhaW1SYWRpYW4gPSBNYXRoLmF0YW4yKHNmZy5teXNoaXBfLnkgLSB5LCBzZmcubXlzaGlwXy54IC0geCk7XHJcbiAgICB0aGlzLm1lc2gucm90YXRpb24ueiA9IGFpbVJhZGlhbjtcclxuICAgIHRoaXMuZHggPSBNYXRoLmNvcyhhaW1SYWRpYW4pICogKHRoaXMuc3BlZWQgKyBzZmcuc3RhZ2UuZGlmZmljdWx0eSk7XHJcbiAgICB0aGlzLmR5ID0gTWF0aC5zaW4oYWltUmFkaWFuKSAqICh0aGlzLnNwZWVkICsgc2ZnLnN0YWdlLmRpZmZpY3VsdHkpO1xyXG4vLyAgICBjb25zb2xlLmxvZygnZHg6JyArIHRoaXMuZHggKyAnIGR5OicgKyB0aGlzLmR5KTtcclxuXHJcbiAgICB0aGlzLnRhc2sgPSBzZmcudGFza3MucHVzaFRhc2sodGhpcy5tb3ZlLmJpbmQodGhpcykpO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG4gXHJcbiAgaGl0KCkge1xyXG4gICAgdGhpcy5lbmFibGUgPSBmYWxzZTtcclxuICAgIHNmZy50YXNrcy5yZW1vdmVUYXNrKHRoaXMudGFzay5pbmRleCk7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuTk9ORTtcclxuICB9XHJcbn1cclxuXHJcblxyXG5leHBvcnQgY2xhc3MgRW5lbXlCdWxsZXRzIHtcclxuICBjb25zdHJ1Y3RvcihzY2VuZSwgc2UpIHtcclxuICAgIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuICAgIHRoaXMuZW5lbXlCdWxsZXRzID0gW107XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDQ4OyArK2kpIHtcclxuICAgICAgdGhpcy5lbmVteUJ1bGxldHMucHVzaChuZXcgRW5lbXlCdWxsZXQodGhpcy5zY2VuZSwgc2UpKTtcclxuICAgIH1cclxuICB9XHJcbiAgc3RhcnQoeCwgeSwgeikge1xyXG4gICAgdmFyIGVicyA9IHRoaXMuZW5lbXlCdWxsZXRzO1xyXG4gICAgZm9yKHZhciBpID0gMCxlbmQgPSBlYnMubGVuZ3RoO2k8IGVuZDsrK2kpe1xyXG4gICAgICBpZighZWJzW2ldLmVuYWJsZSl7XHJcbiAgICAgICAgZWJzW2ldLnN0YXJ0KHgsIHksIHopO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIHJlc2V0KClcclxuICB7XHJcbiAgICB0aGlzLmVuZW15QnVsbGV0cy5mb3JFYWNoKChkLGkpPT57XHJcbiAgICAgIGlmKGQuZW5hYmxlKXtcclxuICAgICAgICB3aGlsZSghc2ZnLnRhc2tzLmFycmF5W2QudGFzay5pbmRleF0uZ2VuSW5zdC5uZXh0KC0oMSArIGQudGFzay5pbmRleCkpLmRvbmUpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDmlbXjgq3jg6Pjg6njga7li5XjgY0gLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4vLy8g55u057ea6YGL5YuVXHJcbmNsYXNzIExpbmVNb3ZlIHtcclxuICBjb25zdHJ1Y3RvcihyYWQsIHNwZWVkLCBzdGVwKSB7XHJcbiAgICB0aGlzLnJhZCA9IHJhZDtcclxuICAgIHRoaXMuc3BlZWQgPSBzcGVlZDtcclxuICAgIHRoaXMuc3RlcCA9IHN0ZXA7XHJcbiAgICB0aGlzLmN1cnJlbnRTdGVwID0gc3RlcDtcclxuICAgIHRoaXMuZHggPSBNYXRoLmNvcyhyYWQpICogc3BlZWQ7XHJcbiAgICB0aGlzLmR5ID0gTWF0aC5zaW4ocmFkKSAqIHNwZWVkO1xyXG4gIH1cclxuICBcclxuICAqbW92ZShzZWxmLHgseSkgXHJcbiAge1xyXG4gICAgXHJcbiAgICBpZiAoc2VsZi54cmV2KSB7XHJcbiAgICAgIHNlbGYuY2hhclJhZCA9IE1hdGguUEkgLSAodGhpcy5yYWQgLSBNYXRoLlBJIC8gMik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzZWxmLmNoYXJSYWQgPSB0aGlzLnJhZCAtIE1hdGguUEkgLyAyO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsZXQgZHkgPSB0aGlzLmR5O1xyXG4gICAgbGV0IGR4ID0gdGhpcy5keDtcclxuICAgIGNvbnN0IHN0ZXAgPSB0aGlzLnN0ZXA7XHJcbiAgICBcclxuICAgIGlmKHNlbGYueHJldil7XHJcbiAgICAgIGR4ID0gLWR4OyAgICAgIFxyXG4gICAgfVxyXG4gICAgbGV0IGNhbmNlbCA9IGZhbHNlO1xyXG4gICAgZm9yKGxldCBpID0gMDtpIDwgc3RlcCAmJiAhY2FuY2VsOysraSl7XHJcbiAgICAgIHNlbGYueCArPSBkeDtcclxuICAgICAgc2VsZi55ICs9IGR5O1xyXG4gICAgICBjYW5jZWwgPSB5aWVsZDtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgdG9KU09OKCl7XHJcbiAgICByZXR1cm4gW1xyXG4gICAgICBcIkxpbmVNb3ZlXCIsXHJcbiAgICAgIHRoaXMucmFkLFxyXG4gICAgICB0aGlzLnNwZWVkLFxyXG4gICAgICB0aGlzLnN0ZXBcclxuICAgIF07XHJcbiAgfVxyXG4gIFxyXG4gIHN0YXRpYyBmcm9tQXJyYXkoYXJyYXkpXHJcbiAge1xyXG4gICAgcmV0dXJuIG5ldyBMaW5lTW92ZShhcnJheVsxXSxhcnJheVsyXSxhcnJheVszXSk7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g5YaG6YGL5YuVXHJcbmNsYXNzIENpcmNsZU1vdmUge1xyXG4gIGNvbnN0cnVjdG9yKHN0YXJ0UmFkLCBzdG9wUmFkLCByLCBzcGVlZCwgbGVmdCkge1xyXG4gICAgdGhpcy5zdGFydFJhZCA9IChzdGFydFJhZCB8fCAwKTtcclxuICAgIHRoaXMuc3RvcFJhZCA9ICAoc3RvcFJhZCB8fCAwKTtcclxuICAgIHRoaXMuciA9IHIgfHwgMDtcclxuICAgIHRoaXMuc3BlZWQgPSBzcGVlZCB8fCAwO1xyXG4gICAgdGhpcy5sZWZ0ID0gIWxlZnQgPyBmYWxzZSA6IHRydWU7XHJcbiAgICB0aGlzLmRlbHRhcyA9IFtdO1xyXG4gICAgdGhpcy5zdGFydFJhZF8gPSB0aGlzLnN0YXJ0UmFkICogTWF0aC5QSTtcclxuICAgIHRoaXMuc3RvcFJhZF8gPSB0aGlzLnN0b3BSYWQgKiBNYXRoLlBJO1xyXG4gICAgdmFyIHJhZCA9IHRoaXMuc3RhcnRSYWRfO1xyXG4gICAgdmFyIHN0ZXAgPSAobGVmdCA/IDEgOiAtMSkgKiBzcGVlZCAvIHI7XHJcbiAgICB2YXIgZW5kID0gZmFsc2U7XHJcbiAgICBcclxuICAgIHdoaWxlICghZW5kKSB7XHJcbiAgICAgIHJhZCArPSBzdGVwO1xyXG4gICAgICBpZiAoKGxlZnQgJiYgKHJhZCA+PSB0aGlzLnN0b3BSYWRfKSkgfHwgKCFsZWZ0ICYmIHJhZCA8PSB0aGlzLnN0b3BSYWRfKSkge1xyXG4gICAgICAgIHJhZCA9IHRoaXMuc3RvcFJhZF87XHJcbiAgICAgICAgZW5kID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmRlbHRhcy5wdXNoKHtcclxuICAgICAgICB4OiB0aGlzLnIgKiBNYXRoLmNvcyhyYWQpLFxyXG4gICAgICAgIHk6IHRoaXMuciAqIE1hdGguc2luKHJhZCksXHJcbiAgICAgICAgcmFkOiByYWRcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgXHJcbiAgKm1vdmUoc2VsZix4LHkpIHtcclxuICAgIC8vIOWIneacn+WMllxyXG4gICAgbGV0IHN4LHN5O1xyXG4gICAgaWYgKHNlbGYueHJldikge1xyXG4gICAgICBzeCA9IHggLSB0aGlzLnIgKiBNYXRoLmNvcyh0aGlzLnN0YXJ0UmFkXyArIE1hdGguUEkpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc3ggPSB4IC0gdGhpcy5yICogTWF0aC5jb3ModGhpcy5zdGFydFJhZF8pO1xyXG4gICAgfVxyXG4gICAgc3kgPSB5IC0gdGhpcy5yICogTWF0aC5zaW4odGhpcy5zdGFydFJhZF8pO1xyXG5cclxuICAgIGxldCBjYW5jZWwgPSBmYWxzZTtcclxuICAgIC8vIOenu+WLlVxyXG4gICAgZm9yKGxldCBpID0gMCxlID0gdGhpcy5kZWx0YXMubGVuZ3RoOyhpIDwgZSkgJiYgIWNhbmNlbDsrK2kpXHJcbiAgICB7XHJcbiAgICAgIHZhciBkZWx0YSA9IHRoaXMuZGVsdGFzW2ldO1xyXG4gICAgICBpZihzZWxmLnhyZXYpe1xyXG4gICAgICAgIHNlbGYueCA9IHN4IC0gZGVsdGEueDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzZWxmLnggPSBzeCArIGRlbHRhLng7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNlbGYueSA9IHN5ICsgZGVsdGEueTtcclxuICAgICAgaWYgKHNlbGYueHJldikge1xyXG4gICAgICAgIHNlbGYuY2hhclJhZCA9IChNYXRoLlBJIC0gZGVsdGEucmFkKSArICh0aGlzLmxlZnQgPyAtMSA6IDApICogTWF0aC5QSTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzZWxmLmNoYXJSYWQgPSBkZWx0YS5yYWQgKyAodGhpcy5sZWZ0ID8gMCA6IC0xKSAqIE1hdGguUEk7XHJcbiAgICAgIH1cclxuICAgICAgc2VsZi5yYWQgPSBkZWx0YS5yYWQ7XHJcbiAgICAgIGNhbmNlbCA9IHlpZWxkO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICB0b0pTT04oKXtcclxuICAgIHJldHVybiBbICdDaXJjbGVNb3ZlJyxcclxuICAgICAgdGhpcy5zdGFydFJhZCxcclxuICAgICAgdGhpcy5zdG9wUmFkLFxyXG4gICAgICB0aGlzLnIsXHJcbiAgICAgIHRoaXMuc3BlZWQsXHJcbiAgICAgIHRoaXMubGVmdFxyXG4gICAgXTtcclxuICB9XHJcbiAgXHJcbiAgc3RhdGljIGZyb21BcnJheShhKXtcclxuICAgIHJldHVybiBuZXcgQ2lyY2xlTW92ZShhWzFdLGFbMl0sYVszXSxhWzRdLGFbNV0pO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOODm+ODvOODoOODneOCuOOCt+ODp+ODs+OBq+aIu+OCi1xyXG5jbGFzcyBHb3RvSG9tZSB7XHJcblxyXG4gKm1vdmUoc2VsZiwgeCwgeSkge1xyXG4gICAgbGV0IHJhZCA9IE1hdGguYXRhbjIoc2VsZi5ob21lWSAtIHNlbGYueSwgc2VsZi5ob21lWCAtIHNlbGYueCk7XHJcbiAgICBsZXQgc3BlZWQgPSA0O1xyXG5cclxuICAgIHNlbGYuY2hhclJhZCA9IHJhZCAtIE1hdGguUEkgLyAyO1xyXG4gICAgbGV0IGR4ID0gTWF0aC5jb3MocmFkKSAqIHNwZWVkO1xyXG4gICAgbGV0IGR5ID0gTWF0aC5zaW4ocmFkKSAqIHNwZWVkO1xyXG4gICAgc2VsZi56ID0gMC4wO1xyXG4gICAgXHJcbiAgICBsZXQgY2FuY2VsID0gZmFsc2U7XHJcbiAgICBmb3IoOyhNYXRoLmFicyhzZWxmLnggLSBzZWxmLmhvbWVYKSA+PSAyIHx8IE1hdGguYWJzKHNlbGYueSAtIHNlbGYuaG9tZVkpID49IDIpICYmICFjYW5jZWxcclxuICAgICAgO3NlbGYueCArPSBkeCxzZWxmLnkgKz0gZHkpXHJcbiAgICB7XHJcbiAgICAgIGNhbmNlbCA9IHlpZWxkO1xyXG4gICAgfVxyXG5cclxuICAgIHNlbGYuY2hhclJhZCA9IDA7XHJcbiAgICBzZWxmLnggPSBzZWxmLmhvbWVYO1xyXG4gICAgc2VsZi55ID0gc2VsZi5ob21lWTtcclxuICAgIGlmIChzZWxmLnN0YXR1cyA9PSBzZWxmLlNUQVJUKSB7XHJcbiAgICAgIHZhciBncm91cElEID0gc2VsZi5ncm91cElEO1xyXG4gICAgICB2YXIgZ3JvdXBEYXRhID0gc2VsZi5lbmVtaWVzLmdyb3VwRGF0YTtcclxuICAgICAgZ3JvdXBEYXRhW2dyb3VwSURdLnB1c2goc2VsZik7XHJcbiAgICAgIHNlbGYuZW5lbWllcy5ob21lRW5lbWllc0NvdW50Kys7XHJcbiAgICB9XHJcbiAgICBzZWxmLnN0YXR1cyA9IHNlbGYuSE9NRTtcclxuICB9XHJcbiAgXHJcbiAgdG9KU09OKCl7XHJcbiAgICByZXR1cm4gWydHb3RvSG9tZSddO1xyXG4gIH1cclxuICBcclxuICBzdGF0aWMgZnJvbUFycmF5KGEpXHJcbiAge1xyXG4gICAgcmV0dXJuIG5ldyBHb3RvSG9tZSgpO1xyXG4gIH1cclxufVxyXG5cclxuXHJcbi8vLyDlvoXmqZ/kuK3jga7mlbXjga7li5XjgY1cclxuY2xhc3MgSG9tZU1vdmV7XHJcbiAgY29uc3RydWN0b3IoKXtcclxuICAgIHRoaXMuQ0VOVEVSX1ggPSAwO1xyXG4gICAgdGhpcy5DRU5URVJfWSA9IDEwMDtcclxuICB9XHJcblxyXG4gICptb3ZlKHNlbGYsIHgsIHkpIHtcclxuXHJcbiAgICBsZXQgZHggPSBzZWxmLmhvbWVYIC0gdGhpcy5DRU5URVJfWDtcclxuICAgIGxldCBkeSA9IHNlbGYuaG9tZVkgLSB0aGlzLkNFTlRFUl9ZO1xyXG4gICAgc2VsZi56ID0gLTAuMTtcclxuXHJcbiAgICB3aGlsZShzZWxmLnN0YXR1cyAhPSBzZWxmLkFUVEFDSylcclxuICAgIHtcclxuICAgICAgc2VsZi54ID0gc2VsZi5ob21lWCArIGR4ICogc2VsZi5lbmVtaWVzLmhvbWVEZWx0YTtcclxuICAgICAgc2VsZi55ID0gc2VsZi5ob21lWSArIGR5ICogc2VsZi5lbmVtaWVzLmhvbWVEZWx0YTtcclxuICAgICAgc2VsZi5tZXNoLnNjYWxlLnggPSBzZWxmLmVuZW1pZXMuaG9tZURlbHRhMjtcclxuICAgICAgeWllbGQ7XHJcbiAgICB9XHJcblxyXG4gICAgc2VsZi5tZXNoLnNjYWxlLnggPSAxLjA7XHJcbiAgICBzZWxmLnogPSAwLjA7XHJcblxyXG4gIH1cclxuICBcclxuICB0b0pTT04oKXtcclxuICAgIHJldHVybiBbJ0hvbWVNb3ZlJ107XHJcbiAgfVxyXG4gIFxyXG4gIHN0YXRpYyBmcm9tQXJyYXkoYSlcclxuICB7XHJcbiAgICByZXR1cm4gbmV3IEhvbWVNb3ZlKCk7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g5oyH5a6a44K344O844Kx44Oz44K544Gr56e75YuV44GZ44KLXHJcbmNsYXNzIEdvdG8ge1xyXG4gIGNvbnN0cnVjdG9yKHBvcykgeyB0aGlzLnBvcyA9IHBvczsgfTtcclxuICAqbW92ZShzZWxmLCB4LCB5KSB7XHJcbiAgICBzZWxmLmluZGV4ID0gdGhpcy5wb3MgLSAxO1xyXG4gIH1cclxuICBcclxuICB0b0pTT04oKXtcclxuICAgIHJldHVybiBbXHJcbiAgICAgICdHb3RvJyxcclxuICAgICAgdGhpcy5wb3NcclxuICAgIF07XHJcbiAgfVxyXG4gIFxyXG4gIHN0YXRpYyBmcm9tQXJyYXkoYSl7XHJcbiAgICByZXR1cm4gbmV3IEdvdG8oYVsxXSk7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g5pW15by+55m65bCEXHJcbmNsYXNzIEZpcmUge1xyXG4gICptb3ZlKHNlbGYsIHgsIHkpIHtcclxuICAgIGxldCBkID0gKHNmZy5zdGFnZS5ubyAvIDIwKSAqICggc2ZnLnN0YWdlLmRpZmZpY3VsdHkpO1xyXG4gICAgaWYgKGQgPiAxKSB7IGQgPSAxLjA7fVxyXG4gICAgaWYgKE1hdGgucmFuZG9tKCkgPCBkKSB7XHJcbiAgICAgIHNlbGYuZW5lbWllcy5lbmVteUJ1bGxldHMuc3RhcnQoc2VsZi54LCBzZWxmLnkpO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICB0b0pTT04oKXtcclxuICAgIHJldHVybiBbJ0ZpcmUnXTtcclxuICB9XHJcbiAgXHJcbiAgc3RhdGljIGZyb21BcnJheShhKVxyXG4gIHtcclxuICAgIHJldHVybiBuZXcgRmlyZSgpO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOaVteacrOS9k1xyXG5leHBvcnQgY2xhc3MgRW5lbXkgZXh0ZW5kcyBnYW1lb2JqLkdhbWVPYmogeyBcclxuICBjb25zdHJ1Y3RvcihlbmVtaWVzLHNjZW5lLHNlKSB7XHJcbiAgc3VwZXIoMCwgMCwgMCk7XHJcbiAgdGhpcy5OT05FID0gIDAgO1xyXG4gIHRoaXMuU1RBUlQgPSAgMSA7XHJcbiAgdGhpcy5IT01FID0gIDIgO1xyXG4gIHRoaXMuQVRUQUNLID0gIDMgO1xyXG4gIHRoaXMuQk9NQiA9ICA0IDtcclxuICB0aGlzLmNvbGxpc2lvbkFyZWEud2lkdGggPSAxMjtcclxuICB0aGlzLmNvbGxpc2lvbkFyZWEuaGVpZ2h0ID0gODtcclxuICB2YXIgdGV4ID0gc2ZnLnRleHR1cmVGaWxlcy5lbmVteTtcclxuICB2YXIgbWF0ZXJpYWwgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVNYXRlcmlhbCh0ZXgpO1xyXG4gIHZhciBnZW9tZXRyeSA9IGdyYXBoaWNzLmNyZWF0ZVNwcml0ZUdlb21ldHJ5KDE2KTtcclxuICBncmFwaGljcy5jcmVhdGVTcHJpdGVVVihnZW9tZXRyeSwgdGV4LCAxNiwgMTYsIDApO1xyXG4gIHRoaXMubWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgdGhpcy5ncm91cElEID0gMDtcclxuICB0aGlzLnogPSAwLjA7XHJcbiAgdGhpcy5pbmRleCA9IDA7XHJcbiAgdGhpcy5zY29yZSA9IDA7XHJcbiAgdGhpcy5tdlBhdHRlcm4gPSBudWxsO1xyXG4gIHRoaXMubXYgPSBudWxsO1xyXG4gIHRoaXMubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcbiAgdGhpcy5zdGF0dXMgPSB0aGlzLk5PTkU7XHJcbiAgdGhpcy50eXBlID0gbnVsbDtcclxuICB0aGlzLmxpZmUgPSAwO1xyXG4gIHRoaXMudGFzayA9IG51bGw7XHJcbiAgdGhpcy5oaXRfID0gbnVsbDtcclxuICB0aGlzLnNjZW5lID0gc2NlbmU7XHJcbiAgdGhpcy5zY2VuZS5hZGQodGhpcy5tZXNoKTtcclxuICB0aGlzLnNlID0gc2U7XHJcbiAgdGhpcy5lbmVtaWVzID0gZW5lbWllcztcclxufVxyXG5cclxuICBnZXQgeCgpIHsgcmV0dXJuIHRoaXMueF87IH1cclxuICBzZXQgeCh2KSB7IHRoaXMueF8gPSB0aGlzLm1lc2gucG9zaXRpb24ueCA9IHY7IH1cclxuICBnZXQgeSgpIHsgcmV0dXJuIHRoaXMueV87IH1cclxuICBzZXQgeSh2KSB7IHRoaXMueV8gPSB0aGlzLm1lc2gucG9zaXRpb24ueSA9IHY7IH1cclxuICBnZXQgeigpIHsgcmV0dXJuIHRoaXMuel87IH1cclxuICBzZXQgeih2KSB7IHRoaXMuel8gPSB0aGlzLm1lc2gucG9zaXRpb24ueiA9IHY7IH1cclxuICBcclxuICAvLy/mlbXjga7li5XjgY1cclxuICAqbW92ZSh0YXNrSW5kZXgpIHtcclxuICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gICAgd2hpbGUgKHRhc2tJbmRleCA+PSAwKXtcclxuICAgICAgd2hpbGUoIXRoaXMubXYubmV4dCgpLmRvbmUgJiYgdGFza0luZGV4ID49IDApXHJcbiAgICAgIHtcclxuICAgICAgICB0aGlzLm1lc2guc2NhbGUueCA9IHRoaXMuZW5lbWllcy5ob21lRGVsdGEyO1xyXG4gICAgICAgIHRoaXMubWVzaC5yb3RhdGlvbi56ID0gdGhpcy5jaGFyUmFkO1xyXG4gICAgICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgaWYodGFza0luZGV4IDwgMCl7XHJcbiAgICAgICAgdGFza0luZGV4ID0gLSgrK3Rhc2tJbmRleCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBsZXQgZW5kID0gZmFsc2U7XHJcbiAgICAgIHdoaWxlICghZW5kKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaW5kZXggPCAodGhpcy5tdlBhdHRlcm4ubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgICAgIHRoaXMuaW5kZXgrKztcclxuICAgICAgICAgIHRoaXMubXYgPSB0aGlzLm12UGF0dGVyblt0aGlzLmluZGV4XS5tb3ZlKHRoaXMsdGhpcy54LHRoaXMueSk7XHJcbiAgICAgICAgICBlbmQgPSAhdGhpcy5tdi5uZXh0KCkuZG9uZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHRoaXMubWVzaC5zY2FsZS54ID0gdGhpcy5lbmVtaWVzLmhvbWVEZWx0YTI7XHJcbiAgICAgIHRoaXMubWVzaC5yb3RhdGlvbi56ID0gdGhpcy5jaGFyUmFkO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICAvLy8g5Yid5pyf5YyWXHJcbiAgc3RhcnQoeCwgeSwgeiwgaG9tZVgsIGhvbWVZLCBtdlBhdHRlcm4sIHhyZXYsdHlwZSwgY2xlYXJUYXJnZXQsZ3JvdXBJRCkge1xyXG4gICAgaWYgKHRoaXMuZW5hYmxlXykge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xyXG4gICAgdHlwZSh0aGlzKTtcclxuICAgIHRoaXMueCA9IHg7XHJcbiAgICB0aGlzLnkgPSB5O1xyXG4gICAgdGhpcy56ID0gejtcclxuICAgIHRoaXMueHJldiA9IHhyZXY7XHJcbiAgICB0aGlzLmVuYWJsZV8gPSB0cnVlO1xyXG4gICAgdGhpcy5ob21lWCA9IGhvbWVYIHx8IDA7XHJcbiAgICB0aGlzLmhvbWVZID0gaG9tZVkgfHwgMDtcclxuICAgIHRoaXMuaW5kZXggPSAwO1xyXG4gICAgdGhpcy5ncm91cElEID0gZ3JvdXBJRDtcclxuICAgIHRoaXMubXZQYXR0ZXJuID0gbXZQYXR0ZXJuO1xyXG4gICAgdGhpcy5jbGVhclRhcmdldCA9IGNsZWFyVGFyZ2V0IHx8IHRydWU7XHJcbiAgICB0aGlzLm1lc2gubWF0ZXJpYWwuY29sb3Iuc2V0SGV4KDB4RkZGRkZGKTtcclxuICAgIHRoaXMubXYgPSBtdlBhdHRlcm5bMF0ubW92ZSh0aGlzLHgseSk7XHJcbiAgICAvL3RoaXMubXYuc3RhcnQodGhpcywgeCwgeSk7XHJcbiAgICAvL2lmICh0aGlzLnN0YXR1cyAhPSB0aGlzLk5PTkUpIHtcclxuICAgIC8vICBkZWJ1Z2dlcjtcclxuICAgIC8vfVxyXG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLlNUQVJUO1xyXG4gICAgdGhpcy50YXNrID0gc2ZnLnRhc2tzLnB1c2hUYXNrKHRoaXMubW92ZS5iaW5kKHRoaXMpLCAxMDAwMCk7XHJcbiAgICAvLyBpZih0aGlzLnRhc2suaW5kZXggPT0gMCl7XHJcbiAgICAvLyAgIGRlYnVnZ2VyO1xyXG4gICAgLy8gfVxyXG4gICAgdGhpcy5tZXNoLnZpc2libGUgPSB0cnVlO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG4gIFxyXG4gIGhpdChteWJ1bGxldCkge1xyXG4gICAgaWYgKHRoaXMuaGl0XyA9PSBudWxsKSB7XHJcbiAgICAgIGxldCBsaWZlID0gdGhpcy5saWZlO1xyXG4gICAgICB0aGlzLmxpZmUgLT0gbXlidWxsZXQucG93ZXIgfHwgMTtcclxuICAgICAgbXlidWxsZXQucG93ZXIgLT0gbGlmZTsgXHJcbi8vICAgICAgdGhpcy5saWZlLS07XHJcbiAgICAgIGlmICh0aGlzLmxpZmUgPD0gMCkge1xyXG4gICAgICAgIHNmZy5ib21icy5zdGFydCh0aGlzLngsIHRoaXMueSk7XHJcbiAgICAgICAgdGhpcy5zZSgxKTtcclxuICAgICAgICBzZmcuYWRkU2NvcmUodGhpcy5zY29yZSk7XHJcbiAgICAgICAgaWYgKHRoaXMuY2xlYXJUYXJnZXQpIHtcclxuICAgICAgICAgIHRoaXMuZW5lbWllcy5oaXRFbmVtaWVzQ291bnQrKztcclxuICAgICAgICAgIGlmICh0aGlzLnN0YXR1cyA9PSB0aGlzLlNUQVJUKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZW5lbWllcy5ob21lRW5lbWllc0NvdW50Kys7XHJcbiAgICAgICAgICAgIHRoaXMuZW5lbWllcy5ncm91cERhdGFbdGhpcy5ncm91cElEXS5wdXNoKHRoaXMpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5lbmVtaWVzLmdyb3VwRGF0YVt0aGlzLmdyb3VwSURdLmdvbmVDb3VudCsrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0aGlzLnRhc2suaW5kZXggPT0gMCl7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnaGl0Jyx0aGlzLnRhc2suaW5kZXgpO1xyXG4gICAgICAgICAgZGVidWdnZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLm1lc2gudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuZW5hYmxlXyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuc3RhdHVzID0gdGhpcy5OT05FO1xyXG4gICAgICAgIHNmZy50YXNrcy5hcnJheVt0aGlzLnRhc2suaW5kZXhdLmdlbkluc3QubmV4dCgtKHRoaXMudGFzay5pbmRleCArIDEpKTtcclxuICAgICAgICBzZmcudGFza3MucmVtb3ZlVGFzayh0aGlzLnRhc2suaW5kZXgpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuc2UoMik7XHJcbiAgICAgICAgdGhpcy5tZXNoLm1hdGVyaWFsLmNvbG9yLnNldEhleCgweEZGODA4MCk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuaGl0XyhteWJ1bGxldCk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gWmFrbyhzZWxmKSB7XHJcbiAgc2VsZi5zY29yZSA9IDUwO1xyXG4gIHNlbGYubGlmZSA9IDE7XHJcbiAgZ3JhcGhpY3MudXBkYXRlU3ByaXRlVVYoc2VsZi5tZXNoLmdlb21ldHJ5LCBzZmcudGV4dHVyZUZpbGVzLmVuZW15LCAxNiwgMTYsIDcpO1xyXG59XHJcblxyXG5aYWtvLnRvSlNPTiA9IGZ1bmN0aW9uICgpXHJcbntcclxuICByZXR1cm4gJ1pha28nO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gWmFrbzEoc2VsZikge1xyXG4gIHNlbGYuc2NvcmUgPSAxMDA7XHJcbiAgc2VsZi5saWZlID0gMTtcclxuICBncmFwaGljcy51cGRhdGVTcHJpdGVVVihzZWxmLm1lc2guZ2VvbWV0cnksIHNmZy50ZXh0dXJlRmlsZXMuZW5lbXksIDE2LCAxNiwgNik7XHJcbn1cclxuXHJcblpha28xLnRvSlNPTiA9IGZ1bmN0aW9uICgpXHJcbntcclxuICByZXR1cm4gJ1pha28xJztcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIE1Cb3NzKHNlbGYpIHtcclxuICBzZWxmLnNjb3JlID0gMzAwO1xyXG4gIHNlbGYubGlmZSA9IDI7XHJcbiAgc2VsZi5tZXNoLmJsZW5kaW5nID0gVEhSRUUuTm9ybWFsQmxlbmRpbmc7XHJcbiAgZ3JhcGhpY3MudXBkYXRlU3ByaXRlVVYoc2VsZi5tZXNoLmdlb21ldHJ5LCBzZmcudGV4dHVyZUZpbGVzLmVuZW15LCAxNiwgMTYsIDQpO1xyXG59XHJcblxyXG5NQm9zcy50b0pTT04gPSBmdW5jdGlvbiAoKVxyXG57XHJcbiAgcmV0dXJuICdNQm9zcyc7XHJcbn1cclxuXHJcblxyXG5leHBvcnQgY2xhc3MgRW5lbWllc3tcclxuICBjb25zdHJ1Y3RvcihzY2VuZSwgc2UsIGVuZW15QnVsbGV0cykge1xyXG4gICAgdGhpcy5lbmVteUJ1bGxldHMgPSBlbmVteUJ1bGxldHM7XHJcbiAgICB0aGlzLnNjZW5lID0gc2NlbmU7XHJcbiAgICB0aGlzLm5leHRUaW1lID0gMDtcclxuICAgIHRoaXMuY3VycmVudEluZGV4ID0gMDtcclxuICAgIHRoaXMuZW5lbWllcyA9IG5ldyBBcnJheSgwKTtcclxuICAgIHRoaXMuaG9tZURlbHRhMiA9IDEuMDtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNjQ7ICsraSkge1xyXG4gICAgICB0aGlzLmVuZW1pZXMucHVzaChuZXcgRW5lbXkodGhpcywgc2NlbmUsIHNlKSk7XHJcbiAgICB9XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDU7ICsraSkge1xyXG4gICAgICB0aGlzLmdyb3VwRGF0YVtpXSA9IG5ldyBBcnJheSgwKTtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgc3RhcnRFbmVteV8oZW5lbXksZGF0YSlcclxuICB7XHJcbiAgICAgIGVuZW15LnN0YXJ0KGRhdGFbMV0sIGRhdGFbMl0sIDAsIGRhdGFbM10sIGRhdGFbNF0sIHRoaXMubW92ZVBhdHRlcm5zW01hdGguYWJzKGRhdGFbNV0pXSwgZGF0YVs1XSA8IDAsIGRhdGFbNl0sIGRhdGFbN10sIGRhdGFbOF0gfHwgMCk7XHJcbiAgfVxyXG4gIFxyXG4gIHN0YXJ0RW5lbXkoZGF0YSl7XHJcbiAgICB2YXIgZW5lbWllcyA9IHRoaXMuZW5lbWllcztcclxuICAgIGZvciAodmFyIGkgPSAwLCBlID0gZW5lbWllcy5sZW5ndGg7IGkgPCBlOyArK2kpIHtcclxuICAgICAgdmFyIGVuZW15ID0gZW5lbWllc1tpXTtcclxuICAgICAgaWYgKCFlbmVteS5lbmFibGVfKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnRFbmVteV8oZW5lbXksZGF0YSk7XHJcbiAgICAgIH1cclxuICAgIH0gICAgXHJcbiAgfVxyXG4gIFxyXG4gIHN0YXJ0RW5lbXlJbmRleGVkKGRhdGEsaW5kZXgpe1xyXG4gICAgbGV0IGVuID0gdGhpcy5lbmVtaWVzW2luZGV4XTtcclxuICAgIGlmKGVuLmVuYWJsZV8pe1xyXG4gICAgICAgIHNmZy50YXNrcy5yZW1vdmVUYXNrKGVuLnRhc2suaW5kZXgpO1xyXG4gICAgICAgIGVuLnN0YXR1cyA9IGVuLk5PTkU7XHJcbiAgICAgICAgZW4uZW5hYmxlXyA9IGZhbHNlO1xyXG4gICAgICAgIGVuLm1lc2gudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgdGhpcy5zdGFydEVuZW15XyhlbixkYXRhKTtcclxuICB9XHJcblxyXG4gIC8vLyDmlbXnt6jpmorjga7li5XjgY3jgpLjgrPjg7Pjg4jjg63jg7zjg6vjgZnjgotcclxuICBtb3ZlKCkge1xyXG4gICAgdmFyIGN1cnJlbnRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZTtcclxuICAgIHZhciBtb3ZlU2VxcyA9IHRoaXMubW92ZVNlcXM7XHJcbiAgICB2YXIgbGVuID0gbW92ZVNlcXNbc2ZnLnN0YWdlLnByaXZhdGVOb10ubGVuZ3RoO1xyXG4gICAgLy8g44OH44O844K/6YWN5YiX44KS44KC44Go44Gr5pW144KS55Sf5oiQXHJcbiAgICB3aGlsZSAodGhpcy5jdXJyZW50SW5kZXggPCBsZW4pIHtcclxuICAgICAgdmFyIGRhdGEgPSBtb3ZlU2Vxc1tzZmcuc3RhZ2UucHJpdmF0ZU5vXVt0aGlzLmN1cnJlbnRJbmRleF07XHJcbiAgICAgIHZhciBuZXh0VGltZSA9IHRoaXMubmV4dFRpbWUgIT0gbnVsbCA/IHRoaXMubmV4dFRpbWUgOiBkYXRhWzBdO1xyXG4gICAgICBpZiAoY3VycmVudFRpbWUgPj0gKHRoaXMubmV4dFRpbWUgKyBkYXRhWzBdKSkge1xyXG4gICAgICAgIHRoaXMuc3RhcnRFbmVteShkYXRhKTtcclxuICAgICAgICB0aGlzLmN1cnJlbnRJbmRleCsrO1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRJbmRleCA8IGxlbikge1xyXG4gICAgICAgICAgdGhpcy5uZXh0VGltZSA9IGN1cnJlbnRUaW1lICsgbW92ZVNlcXNbc2ZnLnN0YWdlLnByaXZhdGVOb11bdGhpcy5jdXJyZW50SW5kZXhdWzBdO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8g44Ob44O844Og44Od44K444K344On44Oz44Gr5pW144GM44GZ44G544Gm5pW05YiX44GX44Gf44GL56K66KqN44GZ44KL44CCXHJcbiAgICBpZiAodGhpcy5ob21lRW5lbWllc0NvdW50ID09IHRoaXMudG90YWxFbmVtaWVzQ291bnQgJiYgdGhpcy5zdGF0dXMgPT0gdGhpcy5TVEFSVCkge1xyXG4gICAgICAvLyDmlbTliJfjgZfjgabjgYTjgZ/jgonmlbTliJfjg6Ljg7zjg4njgavnp7vooYzjgZnjgovjgIJcclxuICAgICAgdGhpcy5zdGF0dXMgPSB0aGlzLkhPTUU7XHJcbiAgICAgIHRoaXMuZW5kVGltZSA9IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgKyAwLjUgKiAoMi4wIC0gc2ZnLnN0YWdlLmRpZmZpY3VsdHkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIOODm+ODvOODoOODneOCuOOCt+ODp+ODs+OBp+S4gOWumuaZgumWk+W+heapn+OBmeOCi1xyXG4gICAgaWYgKHRoaXMuc3RhdHVzID09IHRoaXMuSE9NRSkge1xyXG4gICAgICBpZiAoc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSA+IHRoaXMuZW5kVGltZSkge1xyXG4gICAgICAgIHRoaXMuc3RhdHVzID0gdGhpcy5BVFRBQ0s7XHJcbiAgICAgICAgdGhpcy5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIChzZmcuc3RhZ2UuRElGRklDVUxUWV9NQVggLSBzZmcuc3RhZ2UuZGlmZmljdWx0eSkgKiAzO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSAwO1xyXG4gICAgICAgIHRoaXMuY291bnQgPSAwO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8g5pS75pKD44GZ44KLXHJcbiAgICBpZiAodGhpcy5zdGF0dXMgPT0gdGhpcy5BVFRBQ0sgJiYgc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSA+IHRoaXMuZW5kVGltZSkge1xyXG4gICAgICB0aGlzLmVuZFRpbWUgPSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lICsgKHNmZy5zdGFnZS5ESUZGSUNVTFRZX01BWCAtIHNmZy5zdGFnZS5kaWZmaWN1bHR5KSAqIDM7XHJcbiAgICAgIHZhciBncm91cERhdGEgPSB0aGlzLmdyb3VwRGF0YTtcclxuICAgICAgdmFyIGF0dGFja0NvdW50ID0gKDEgKyAwLjI1ICogKHNmZy5zdGFnZS5kaWZmaWN1bHR5KSkgfCAwO1xyXG4gICAgICB2YXIgZ3JvdXAgPSBncm91cERhdGFbdGhpcy5ncm91cF07XHJcblxyXG4gICAgICBpZiAoIWdyb3VwIHx8IGdyb3VwLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IDA7XHJcbiAgICAgICAgdmFyIGdyb3VwID0gZ3JvdXBEYXRhWzBdO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoZ3JvdXAubGVuZ3RoID4gMCAmJiBncm91cC5sZW5ndGggPiBncm91cC5nb25lQ291bnQpIHtcclxuICAgICAgICBpZiAoIWdyb3VwLmluZGV4KSB7XHJcbiAgICAgICAgICBncm91cC5pbmRleCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdGhpcy5ncm91cCkge1xyXG4gICAgICAgICAgdmFyIGNvdW50ID0gMCwgZW5kZyA9IGdyb3VwLmxlbmd0aDtcclxuICAgICAgICAgIHdoaWxlIChjb3VudCA8IGVuZGcgJiYgYXR0YWNrQ291bnQgPiAwKSB7XHJcbiAgICAgICAgICAgIHZhciBlbiA9IGdyb3VwW2dyb3VwLmluZGV4XTtcclxuICAgICAgICAgICAgaWYgKGVuLmVuYWJsZV8gJiYgZW4uc3RhdHVzID09IGVuLkhPTUUpIHtcclxuICAgICAgICAgICAgICBlbi5zdGF0dXMgPSBlbi5BVFRBQ0s7XHJcbiAgICAgICAgICAgICAgLS1hdHRhY2tDb3VudDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb3VudCsrO1xyXG4gICAgICAgICAgICBncm91cC5pbmRleCsrO1xyXG4gICAgICAgICAgICBpZiAoZ3JvdXAuaW5kZXggPj0gZ3JvdXAubGVuZ3RoKSBncm91cC5pbmRleCA9IDA7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSBncm91cC5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgICAgICAgICB2YXIgZW4gPSBncm91cFtpXTtcclxuICAgICAgICAgICAgaWYgKGVuLmVuYWJsZV8gJiYgZW4uc3RhdHVzID09IGVuLkhPTUUpIHtcclxuICAgICAgICAgICAgICBlbi5zdGF0dXMgPSBlbi5BVFRBQ0s7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuZ3JvdXArKztcclxuICAgICAgaWYgKHRoaXMuZ3JvdXAgPj0gdGhpcy5ncm91cERhdGEubGVuZ3RoKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IDA7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8g44Ob44O844Og44Od44K444K344On44Oz44Gn44Gu5b6F5qmf5YuV5L2cXHJcbiAgICB0aGlzLmhvbWVEZWx0YUNvdW50ICs9IDAuMDI1O1xyXG4gICAgdGhpcy5ob21lRGVsdGEgPSBNYXRoLnNpbih0aGlzLmhvbWVEZWx0YUNvdW50KSAqIDAuMDg7XHJcbiAgICB0aGlzLmhvbWVEZWx0YTIgPSAxLjAgKyBNYXRoLnNpbih0aGlzLmhvbWVEZWx0YUNvdW50ICogOCkgKiAwLjE7XHJcblxyXG4gIH1cclxuXHJcbiAgcmVzZXQoKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gdGhpcy5lbmVtaWVzLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIHZhciBlbiA9IHRoaXMuZW5lbWllc1tpXTtcclxuICAgICAgaWYgKGVuLmVuYWJsZV8pIHtcclxuICAgICAgICBzZmcudGFza3MucmVtb3ZlVGFzayhlbi50YXNrLmluZGV4KTtcclxuICAgICAgICBlbi5zdGF0dXMgPSBlbi5OT05FO1xyXG4gICAgICAgIGVuLmVuYWJsZV8gPSBmYWxzZTtcclxuICAgICAgICBlbi5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY2FsY0VuZW1pZXNDb3VudCgpIHtcclxuICAgIHZhciBzZXFzID0gdGhpcy5tb3ZlU2Vxc1tzZmcuc3RhZ2UucHJpdmF0ZU5vXTtcclxuICAgIHRoaXMudG90YWxFbmVtaWVzQ291bnQgPSAwO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHNlcXMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgaWYgKHNlcXNbaV1bN10pIHtcclxuICAgICAgICB0aGlzLnRvdGFsRW5lbWllc0NvdW50Kys7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHN0YXJ0KCkge1xyXG4gICAgdGhpcy5uZXh0VGltZSA9IDA7XHJcbiAgICB0aGlzLmN1cnJlbnRJbmRleCA9IDA7XHJcbiAgICB0aGlzLnRvdGFsRW5lbWllc0NvdW50ID0gMDtcclxuICAgIHRoaXMuaGl0RW5lbWllc0NvdW50ID0gMDtcclxuICAgIHRoaXMuaG9tZUVuZW1pZXNDb3VudCA9IDA7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuU1RBUlQ7XHJcbiAgICB2YXIgZ3JvdXBEYXRhID0gdGhpcy5ncm91cERhdGE7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gZ3JvdXBEYXRhLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIGdyb3VwRGF0YVtpXS5sZW5ndGggPSAwO1xyXG4gICAgICBncm91cERhdGFbaV0uZ29uZUNvdW50ID0gMDtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgbG9hZFBhdHRlcm5zKCl7XHJcbiAgICB0aGlzLm1vdmVQYXR0ZXJucyA9IFtdO1xyXG4gICAgbGV0IHRoaXNfID0gdGhpczsgICAgXHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUscmVqZWN0KT0+e1xyXG4gICAgICBkMy5qc29uKCcuL3Jlcy9lbmVteU1vdmVQYXR0ZXJuLmpzb24nLChlcnIsZGF0YSk9PntcclxuICAgICAgICBpZihlcnIpe1xyXG4gICAgICAgICAgcmVqZWN0KGVycik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRhdGEuZm9yRWFjaCgoY29tQXJyYXksaSk9PntcclxuICAgICAgICAgIGxldCBjb20gPSBbXTtcclxuICAgICAgICAgIHRoaXMubW92ZVBhdHRlcm5zLnB1c2goY29tKTtcclxuICAgICAgICAgIGNvbUFycmF5LmZvckVhY2goKGQsaSk9PntcclxuICAgICAgICAgICAgc3dpdGNoKGRbMF0pe1xyXG4gICAgICAgICAgICAgIGNhc2UgJ0xpbmVNb3ZlJzpcclxuICAgICAgICAgICAgICAgIGNvbS5wdXNoKExpbmVNb3ZlLmZyb21BcnJheShkKSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICBjYXNlICdDaXJjbGVNb3ZlJzpcclxuICAgICAgICAgICAgICAgIGNvbS5wdXNoKENpcmNsZU1vdmUuZnJvbUFycmF5KGQpKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgIGNhc2UgJ0dvdG9Ib21lJzpcclxuICAgICAgICAgICAgICAgIGNvbS5wdXNoKEdvdG9Ib21lLmZyb21BcnJheShkKSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICBjYXNlICdIb21lTW92ZSc6XHJcbiAgICAgICAgICAgICAgICBjb20ucHVzaChIb21lTW92ZS5mcm9tQXJyYXkoZCkpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgY2FzZSAnR290byc6XHJcbiAgICAgICAgICAgICAgICBjb20ucHVzaChHb3RvLmZyb21BcnJheShkKSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICBjYXNlICdGaXJlJzpcclxuICAgICAgICAgICAgICAgIGNvbS5wdXNoKEZpcmUuZnJvbUFycmF5KGQpKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgXHJcbiAgbG9hZEZvcm1hdGlvbnMoKXtcclxuICAgIHRoaXMubW92ZVNlcXMgPSBbXTtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSxyZWplY3QpPT57XHJcbiAgICAgIGQzLmpzb24oJy4vcmVzL2VuZW15Rm9ybWF0aW9uUGF0dGVybi5qc29uJywoZXJyLGRhdGEpPT57XHJcbiAgICAgICAgaWYoZXJyKSByZWplY3QoZXJyKTtcclxuICAgICAgICBkYXRhLmZvckVhY2goKGZvcm0saSk9PntcclxuICAgICAgICAgIGxldCBzdGFnZSA9IFtdO1xyXG4gICAgICAgICAgdGhpcy5tb3ZlU2Vxcy5wdXNoKHN0YWdlKTtcclxuICAgICAgICAgIGZvcm0uZm9yRWFjaCgoZCxpKT0+e1xyXG4gICAgICAgICAgICBkWzZdID0gZ2V0RW5lbXlGdW5jKGRbNl0pO1xyXG4gICAgICAgICAgICBzdGFnZS5wdXNoKGQpO1xyXG4gICAgICAgICAgfSk7ICAgICAgICAgIFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgXHJcbn1cclxuXHJcbnZhciBlbmVteUZ1bmNzID0gbmV3IE1hcChbXHJcbiAgICAgIFtcIlpha29cIixaYWtvXSxcclxuICAgICAgW1wiWmFrbzFcIixaYWtvMV0sXHJcbiAgICAgIFtcIk1Cb3NzXCIsTUJvc3NdXHJcbiAgICBdKTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRFbmVteUZ1bmMoZnVuY05hbWUpXHJcbntcclxuICByZXR1cm4gZW5lbXlGdW5jcy5nZXQoZnVuY05hbWUpO1xyXG59XHJcblxyXG5FbmVtaWVzLnByb3RvdHlwZS50b3RhbEVuZW1pZXNDb3VudCA9IDA7XHJcbkVuZW1pZXMucHJvdG90eXBlLmhpdEVuZW1pZXNDb3VudCA9IDA7XHJcbkVuZW1pZXMucHJvdG90eXBlLmhvbWVFbmVtaWVzQ291bnQgPSAwO1xyXG5FbmVtaWVzLnByb3RvdHlwZS5ob21lRGVsdGEgPSAwO1xyXG5FbmVtaWVzLnByb3RvdHlwZS5ob21lRGVsdGFDb3VudCA9IDA7XHJcbkVuZW1pZXMucHJvdG90eXBlLmhvbWVEZWx0YTIgPSAwO1xyXG5FbmVtaWVzLnByb3RvdHlwZS5ncm91cERhdGEgPSBbXTtcclxuRW5lbWllcy5wcm90b3R5cGUuTk9ORSA9IDAgfCAwO1xyXG5FbmVtaWVzLnByb3RvdHlwZS5TVEFSVCA9IDEgfCAwO1xyXG5FbmVtaWVzLnByb3RvdHlwZS5IT01FID0gMiB8IDA7XHJcbkVuZW1pZXMucHJvdG90eXBlLkFUVEFDSyA9IDMgfCAwO1xyXG5cclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuLy9cclxuLy8gV2Ugc3RvcmUgb3VyIEVFIG9iamVjdHMgaW4gYSBwbGFpbiBvYmplY3Qgd2hvc2UgcHJvcGVydGllcyBhcmUgZXZlbnQgbmFtZXMuXHJcbi8vIElmIGBPYmplY3QuY3JlYXRlKG51bGwpYCBpcyBub3Qgc3VwcG9ydGVkIHdlIHByZWZpeCB0aGUgZXZlbnQgbmFtZXMgd2l0aCBhXHJcbi8vIGB+YCB0byBtYWtlIHN1cmUgdGhhdCB0aGUgYnVpbHQtaW4gb2JqZWN0IHByb3BlcnRpZXMgYXJlIG5vdCBvdmVycmlkZGVuIG9yXHJcbi8vIHVzZWQgYXMgYW4gYXR0YWNrIHZlY3Rvci5cclxuLy8gV2UgYWxzbyBhc3N1bWUgdGhhdCBgT2JqZWN0LmNyZWF0ZShudWxsKWAgaXMgYXZhaWxhYmxlIHdoZW4gdGhlIGV2ZW50IG5hbWVcclxuLy8gaXMgYW4gRVM2IFN5bWJvbC5cclxuLy9cclxudmFyIHByZWZpeCA9IHR5cGVvZiBPYmplY3QuY3JlYXRlICE9PSAnZnVuY3Rpb24nID8gJ34nIDogZmFsc2U7XHJcblxyXG4vKipcclxuICogUmVwcmVzZW50YXRpb24gb2YgYSBzaW5nbGUgRXZlbnRFbWl0dGVyIGZ1bmN0aW9uLlxyXG4gKlxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBFdmVudCBoYW5kbGVyIHRvIGJlIGNhbGxlZC5cclxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBDb250ZXh0IGZvciBmdW5jdGlvbiBleGVjdXRpb24uXHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb25jZSBPbmx5IGVtaXQgb25jZVxyXG4gKiBAYXBpIHByaXZhdGVcclxuICovXHJcbmZ1bmN0aW9uIEVFKGZuLCBjb250ZXh0LCBvbmNlKSB7XHJcbiAgdGhpcy5mbiA9IGZuO1xyXG4gIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XHJcbiAgdGhpcy5vbmNlID0gb25jZSB8fCBmYWxzZTtcclxufVxyXG5cclxuLyoqXHJcbiAqIE1pbmltYWwgRXZlbnRFbWl0dGVyIGludGVyZmFjZSB0aGF0IGlzIG1vbGRlZCBhZ2FpbnN0IHRoZSBOb2RlLmpzXHJcbiAqIEV2ZW50RW1pdHRlciBpbnRlcmZhY2UuXHJcbiAqXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkgeyAvKiBOb3RoaW5nIHRvIHNldCAqLyB9XHJcblxyXG4vKipcclxuICogSG9sZHMgdGhlIGFzc2lnbmVkIEV2ZW50RW1pdHRlcnMgYnkgbmFtZS5cclxuICpcclxuICogQHR5cGUge09iamVjdH1cclxuICogQHByaXZhdGVcclxuICovXHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcclxuXHJcbi8qKlxyXG4gKiBSZXR1cm4gYSBsaXN0IG9mIGFzc2lnbmVkIGV2ZW50IGxpc3RlbmVycy5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudHMgdGhhdCBzaG91bGQgYmUgbGlzdGVkLlxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGV4aXN0cyBXZSBvbmx5IG5lZWQgdG8ga25vdyBpZiB0aGVyZSBhcmUgbGlzdGVuZXJzLlxyXG4gKiBAcmV0dXJucyB7QXJyYXl8Qm9vbGVhbn1cclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24gbGlzdGVuZXJzKGV2ZW50LCBleGlzdHMpIHtcclxuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudFxyXG4gICAgLCBhdmFpbGFibGUgPSB0aGlzLl9ldmVudHMgJiYgdGhpcy5fZXZlbnRzW2V2dF07XHJcblxyXG4gIGlmIChleGlzdHMpIHJldHVybiAhIWF2YWlsYWJsZTtcclxuICBpZiAoIWF2YWlsYWJsZSkgcmV0dXJuIFtdO1xyXG4gIGlmIChhdmFpbGFibGUuZm4pIHJldHVybiBbYXZhaWxhYmxlLmZuXTtcclxuXHJcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBhdmFpbGFibGUubGVuZ3RoLCBlZSA9IG5ldyBBcnJheShsKTsgaSA8IGw7IGkrKykge1xyXG4gICAgZWVbaV0gPSBhdmFpbGFibGVbaV0uZm47XHJcbiAgfVxyXG5cclxuICByZXR1cm4gZWU7XHJcbn07XHJcblxyXG4vKipcclxuICogRW1pdCBhbiBldmVudCB0byBhbGwgcmVnaXN0ZXJlZCBldmVudCBsaXN0ZW5lcnMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgbmFtZSBvZiB0aGUgZXZlbnQuXHJcbiAqIEByZXR1cm5zIHtCb29sZWFufSBJbmRpY2F0aW9uIGlmIHdlJ3ZlIGVtaXR0ZWQgYW4gZXZlbnQuXHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiBlbWl0KGV2ZW50LCBhMSwgYTIsIGEzLCBhNCwgYTUpIHtcclxuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcclxuXHJcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1tldnRdKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbZXZ0XVxyXG4gICAgLCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoXHJcbiAgICAsIGFyZ3NcclxuICAgICwgaTtcclxuXHJcbiAgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiBsaXN0ZW5lcnMuZm4pIHtcclxuICAgIGlmIChsaXN0ZW5lcnMub25jZSkgdGhpcy5yZW1vdmVMaXN0ZW5lcihldmVudCwgbGlzdGVuZXJzLmZuLCB1bmRlZmluZWQsIHRydWUpO1xyXG5cclxuICAgIHN3aXRjaCAobGVuKSB7XHJcbiAgICAgIGNhc2UgMTogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0KSwgdHJ1ZTtcclxuICAgICAgY2FzZSAyOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExKSwgdHJ1ZTtcclxuICAgICAgY2FzZSAzOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiksIHRydWU7XHJcbiAgICAgIGNhc2UgNDogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzKSwgdHJ1ZTtcclxuICAgICAgY2FzZSA1OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMsIGE0KSwgdHJ1ZTtcclxuICAgICAgY2FzZSA2OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMsIGE0LCBhNSksIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgZm9yIChpID0gMSwgYXJncyA9IG5ldyBBcnJheShsZW4gLTEpOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XHJcbiAgICB9XHJcblxyXG4gICAgbGlzdGVuZXJzLmZuLmFwcGx5KGxpc3RlbmVycy5jb250ZXh0LCBhcmdzKTtcclxuICB9IGVsc2Uge1xyXG4gICAgdmFyIGxlbmd0aCA9IGxpc3RlbmVycy5sZW5ndGhcclxuICAgICAgLCBqO1xyXG5cclxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICBpZiAobGlzdGVuZXJzW2ldLm9uY2UpIHRoaXMucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyc1tpXS5mbiwgdW5kZWZpbmVkLCB0cnVlKTtcclxuXHJcbiAgICAgIHN3aXRjaCAobGVuKSB7XHJcbiAgICAgICAgY2FzZSAxOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCk7IGJyZWFrO1xyXG4gICAgICAgIGNhc2UgMjogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGExKTsgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAzOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgYTEsIGEyKTsgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgIGlmICghYXJncykgZm9yIChqID0gMSwgYXJncyA9IG5ldyBBcnJheShsZW4gLTEpOyBqIDwgbGVuOyBqKyspIHtcclxuICAgICAgICAgICAgYXJnc1tqIC0gMV0gPSBhcmd1bWVudHNbal07XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgbGlzdGVuZXJzW2ldLmZuLmFwcGx5KGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhcmdzKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRydWU7XHJcbn07XHJcblxyXG4vKipcclxuICogUmVnaXN0ZXIgYSBuZXcgRXZlbnRMaXN0ZW5lciBmb3IgdGhlIGdpdmVuIGV2ZW50LlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgTmFtZSBvZiB0aGUgZXZlbnQuXHJcbiAqIEBwYXJhbSB7RnVuY3Rvbn0gZm4gQ2FsbGJhY2sgZnVuY3Rpb24uXHJcbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgVGhlIGNvbnRleHQgb2YgdGhlIGZ1bmN0aW9uLlxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIG9uKGV2ZW50LCBmbiwgY29udGV4dCkge1xyXG4gIHZhciBsaXN0ZW5lciA9IG5ldyBFRShmbiwgY29udGV4dCB8fCB0aGlzKVxyXG4gICAgLCBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xyXG5cclxuICBpZiAoIXRoaXMuX2V2ZW50cykgdGhpcy5fZXZlbnRzID0gcHJlZml4ID8ge30gOiBPYmplY3QuY3JlYXRlKG51bGwpO1xyXG4gIGlmICghdGhpcy5fZXZlbnRzW2V2dF0pIHRoaXMuX2V2ZW50c1tldnRdID0gbGlzdGVuZXI7XHJcbiAgZWxzZSB7XHJcbiAgICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdLmZuKSB0aGlzLl9ldmVudHNbZXZ0XS5wdXNoKGxpc3RlbmVyKTtcclxuICAgIGVsc2UgdGhpcy5fZXZlbnRzW2V2dF0gPSBbXHJcbiAgICAgIHRoaXMuX2V2ZW50c1tldnRdLCBsaXN0ZW5lclxyXG4gICAgXTtcclxuICB9XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEFkZCBhbiBFdmVudExpc3RlbmVyIHRoYXQncyBvbmx5IGNhbGxlZCBvbmNlLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgTmFtZSBvZiB0aGUgZXZlbnQuXHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIENhbGxiYWNrIGZ1bmN0aW9uLlxyXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IFRoZSBjb250ZXh0IG9mIHRoZSBmdW5jdGlvbi5cclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uIG9uY2UoZXZlbnQsIGZuLCBjb250ZXh0KSB7XHJcbiAgdmFyIGxpc3RlbmVyID0gbmV3IEVFKGZuLCBjb250ZXh0IHx8IHRoaXMsIHRydWUpXHJcbiAgICAsIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XHJcblxyXG4gIGlmICghdGhpcy5fZXZlbnRzKSB0aGlzLl9ldmVudHMgPSBwcmVmaXggPyB7fSA6IE9iamVjdC5jcmVhdGUobnVsbCk7XHJcbiAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XSkgdGhpcy5fZXZlbnRzW2V2dF0gPSBsaXN0ZW5lcjtcclxuICBlbHNlIHtcclxuICAgIGlmICghdGhpcy5fZXZlbnRzW2V2dF0uZm4pIHRoaXMuX2V2ZW50c1tldnRdLnB1c2gobGlzdGVuZXIpO1xyXG4gICAgZWxzZSB0aGlzLl9ldmVudHNbZXZ0XSA9IFtcclxuICAgICAgdGhpcy5fZXZlbnRzW2V2dF0sIGxpc3RlbmVyXHJcbiAgICBdO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogUmVtb3ZlIGV2ZW50IGxpc3RlbmVycy5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCB3ZSB3YW50IHRvIHJlbW92ZS5cclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGxpc3RlbmVyIHRoYXQgd2UgbmVlZCB0byBmaW5kLlxyXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IE9ubHkgcmVtb3ZlIGxpc3RlbmVycyBtYXRjaGluZyB0aGlzIGNvbnRleHQuXHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb25jZSBPbmx5IHJlbW92ZSBvbmNlIGxpc3RlbmVycy5cclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcblxyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGZuLCBjb250ZXh0LCBvbmNlKSB7XHJcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XHJcblxyXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbZXZ0XSkgcmV0dXJuIHRoaXM7XHJcblxyXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbZXZ0XVxyXG4gICAgLCBldmVudHMgPSBbXTtcclxuXHJcbiAgaWYgKGZuKSB7XHJcbiAgICBpZiAobGlzdGVuZXJzLmZuKSB7XHJcbiAgICAgIGlmIChcclxuICAgICAgICAgICBsaXN0ZW5lcnMuZm4gIT09IGZuXHJcbiAgICAgICAgfHwgKG9uY2UgJiYgIWxpc3RlbmVycy5vbmNlKVxyXG4gICAgICAgIHx8IChjb250ZXh0ICYmIGxpc3RlbmVycy5jb250ZXh0ICE9PSBjb250ZXh0KVxyXG4gICAgICApIHtcclxuICAgICAgICBldmVudHMucHVzaChsaXN0ZW5lcnMpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gbGlzdGVuZXJzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAgbGlzdGVuZXJzW2ldLmZuICE9PSBmblxyXG4gICAgICAgICAgfHwgKG9uY2UgJiYgIWxpc3RlbmVyc1tpXS5vbmNlKVxyXG4gICAgICAgICAgfHwgKGNvbnRleHQgJiYgbGlzdGVuZXJzW2ldLmNvbnRleHQgIT09IGNvbnRleHQpXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICBldmVudHMucHVzaChsaXN0ZW5lcnNbaV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy9cclxuICAvLyBSZXNldCB0aGUgYXJyYXksIG9yIHJlbW92ZSBpdCBjb21wbGV0ZWx5IGlmIHdlIGhhdmUgbm8gbW9yZSBsaXN0ZW5lcnMuXHJcbiAgLy9cclxuICBpZiAoZXZlbnRzLmxlbmd0aCkge1xyXG4gICAgdGhpcy5fZXZlbnRzW2V2dF0gPSBldmVudHMubGVuZ3RoID09PSAxID8gZXZlbnRzWzBdIDogZXZlbnRzO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW2V2dF07XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZW1vdmUgYWxsIGxpc3RlbmVycyBvciBvbmx5IHRoZSBsaXN0ZW5lcnMgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgd2FudCB0byByZW1vdmUgYWxsIGxpc3RlbmVycyBmb3IuXHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uIHJlbW92ZUFsbExpc3RlbmVycyhldmVudCkge1xyXG4gIGlmICghdGhpcy5fZXZlbnRzKSByZXR1cm4gdGhpcztcclxuXHJcbiAgaWYgKGV2ZW50KSBkZWxldGUgdGhpcy5fZXZlbnRzW3ByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnRdO1xyXG4gIGVsc2UgdGhpcy5fZXZlbnRzID0gcHJlZml4ID8ge30gOiBPYmplY3QuY3JlYXRlKG51bGwpO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8vXHJcbi8vIEFsaWFzIG1ldGhvZHMgbmFtZXMgYmVjYXVzZSBwZW9wbGUgcm9sbCBsaWtlIHRoYXQuXHJcbi8vXHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub2ZmID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lcjtcclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUub247XHJcblxyXG4vL1xyXG4vLyBUaGlzIGZ1bmN0aW9uIGRvZXNuJ3QgYXBwbHkgYW55bW9yZS5cclxuLy9cclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbiBzZXRNYXhMaXN0ZW5lcnMoKSB7XHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vL1xyXG4vLyBFeHBvc2UgdGhlIHByZWZpeC5cclxuLy9cclxuRXZlbnRFbWl0dGVyLnByZWZpeGVkID0gcHJlZml4O1xyXG5cclxuLy9cclxuLy8gRXhwb3NlIHRoZSBtb2R1bGUuXHJcbi8vXHJcbmlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mIG1vZHVsZSkge1xyXG4gIG1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xyXG59XHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuLy92YXIgU1RBR0VfTUFYID0gMTtcclxuaW1wb3J0ICogYXMgc2ZnIGZyb20gJy4vZ2xvYmFsJztcclxuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwnO1xyXG5pbXBvcnQgKiBhcyBhdWRpbyBmcm9tICcuL2F1ZGlvJztcclxuLy9pbXBvcnQgKiBhcyBzb25nIGZyb20gJy4vc29uZyc7XHJcbmltcG9ydCAqIGFzIGdyYXBoaWNzIGZyb20gJy4vZ3JhcGhpY3MnO1xyXG5pbXBvcnQgKiBhcyBpbyBmcm9tICcuL2lvJztcclxuaW1wb3J0ICogYXMgY29tbSBmcm9tICcuL2NvbW0nO1xyXG5pbXBvcnQgKiBhcyB0ZXh0IGZyb20gJy4vdGV4dCc7XHJcbmltcG9ydCAqIGFzIGdhbWVvYmogZnJvbSAnLi9nYW1lb2JqJztcclxuaW1wb3J0ICogYXMgbXlzaGlwIGZyb20gJy4vbXlzaGlwJztcclxuaW1wb3J0ICogYXMgZW5lbWllcyBmcm9tICcuL2VuZW1pZXMnO1xyXG5pbXBvcnQgKiBhcyBlZmZlY3RvYmogZnJvbSAnLi9lZmZlY3RvYmonO1xyXG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJy4vZXZlbnRFbWl0dGVyMyc7XHJcblxyXG5cclxuY2xhc3MgU2NvcmVFbnRyeSB7XHJcbiAgY29uc3RydWN0b3IobmFtZSwgc2NvcmUpIHtcclxuICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICB0aGlzLnNjb3JlID0gc2NvcmU7XHJcbiAgfVxyXG59XHJcblxyXG5cclxuY2xhc3MgU3RhZ2UgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoKTtcclxuICAgIHRoaXMuTUFYID0gMTtcclxuICAgIHRoaXMuRElGRklDVUxUWV9NQVggPSAyLjA7XHJcbiAgICB0aGlzLm5vID0gMTtcclxuICAgIHRoaXMucHJpdmF0ZU5vID0gMDtcclxuICAgIHRoaXMuZGlmZmljdWx0eSA9IDE7XHJcbiAgfVxyXG5cclxuICByZXNldCgpIHtcclxuICAgIHRoaXMubm8gPSAxO1xyXG4gICAgdGhpcy5wcml2YXRlTm8gPSAwO1xyXG4gICAgdGhpcy5kaWZmaWN1bHR5ID0gMTtcclxuICB9XHJcblxyXG4gIGFkdmFuY2UoKSB7XHJcbiAgICB0aGlzLm5vKys7XHJcbiAgICB0aGlzLnByaXZhdGVObysrO1xyXG4gICAgdGhpcy51cGRhdGUoKTtcclxuICB9XHJcblxyXG4gIGp1bXAoc3RhZ2VObykge1xyXG4gICAgdGhpcy5ubyA9IHN0YWdlTm87XHJcbiAgICB0aGlzLnByaXZhdGVObyA9IHRoaXMubm8gLSAxO1xyXG4gICAgdGhpcy51cGRhdGUoKTtcclxuICB9XHJcblxyXG4gIHVwZGF0ZSgpIHtcclxuICAgIGlmICh0aGlzLmRpZmZpY3VsdHkgPCB0aGlzLkRJRkZJQ1VMVFlfTUFYKSB7XHJcbiAgICAgIHRoaXMuZGlmZmljdWx0eSA9IDEgKyAwLjA1ICogKHRoaXMubm8gLSAxKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5wcml2YXRlTm8gPj0gdGhpcy5NQVgpIHtcclxuICAgICAgdGhpcy5wcml2YXRlTm8gPSAwO1xyXG4gIC8vICAgIHRoaXMubm8gPSAxO1xyXG4gICAgfVxyXG4gICAgdGhpcy5lbWl0KCd1cGRhdGUnLHRoaXMpO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEdhbWUge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgdGhpcy5DT05TT0xFX1dJRFRIID0gMDtcclxuICAgIHRoaXMuQ09OU09MRV9IRUlHSFQgPSAwO1xyXG4gICAgdGhpcy5SRU5ERVJFUl9QUklPUklUWSA9IDEwMDAwMCB8IDA7XHJcbiAgICB0aGlzLnJlbmRlcmVyID0gbnVsbDtcclxuICAgIHRoaXMuc3RhdHMgPSBudWxsO1xyXG4gICAgdGhpcy5zY2VuZSA9IG51bGw7XHJcbiAgICB0aGlzLmNhbWVyYSA9IG51bGw7XHJcbiAgICB0aGlzLmF1dGhvciA9IG51bGw7XHJcbiAgICB0aGlzLnByb2dyZXNzID0gbnVsbDtcclxuICAgIHRoaXMudGV4dFBsYW5lID0gbnVsbDtcclxuICAgIHRoaXMuYmFzaWNJbnB1dCA9IG5ldyBpby5CYXNpY0lucHV0KCk7XHJcbiAgICB0aGlzLnRhc2tzID0gbmV3IHV0aWwuVGFza3MoKTtcclxuICAgIHNmZy50YXNrcyA9IHRoaXMudGFza3M7XHJcbiAgICB0aGlzLndhdmVHcmFwaCA9IG51bGw7XHJcbiAgICB0aGlzLnN0YXJ0ID0gZmFsc2U7XHJcbiAgICB0aGlzLmJhc2VUaW1lID0gbmV3IERhdGU7XHJcbiAgICB0aGlzLmQgPSAtMC4yO1xyXG4gICAgdGhpcy5hdWRpb18gPSBudWxsO1xyXG4gICAgdGhpcy5zZXF1ZW5jZXIgPSBudWxsO1xyXG4gICAgdGhpcy5waWFubyA9IG51bGw7XHJcbiAgICB0aGlzLnNjb3JlID0gMDtcclxuICAgIHRoaXMuaGlnaFNjb3JlID0gMDtcclxuICAgIHRoaXMuaGlnaFNjb3JlcyA9IFtdO1xyXG4gICAgdGhpcy5pc0hpZGRlbiA9IGZhbHNlO1xyXG4gICAgdGhpcy5teXNoaXBfID0gbnVsbDtcclxuICAgIHRoaXMuZW5lbWllcyA9IG51bGw7XHJcbiAgICB0aGlzLmVuZW15QnVsbGV0cyA9IG51bGw7XHJcbiAgICB0aGlzLlBJID0gTWF0aC5QSTtcclxuICAgIHRoaXMuY29tbV8gPSBudWxsO1xyXG4gICAgdGhpcy5oYW5kbGVOYW1lID0gJyc7XHJcbiAgICB0aGlzLnN0b3JhZ2UgPSBudWxsO1xyXG4gICAgdGhpcy5yYW5rID0gLTE7XHJcbiAgICB0aGlzLnNvdW5kRWZmZWN0cyA9IG51bGw7XHJcbiAgICB0aGlzLmVucyA9IG51bGw7XHJcbiAgICB0aGlzLmVuYnMgPSBudWxsO1xyXG4gICAgdGhpcy5zdGFnZSA9IHNmZy5zdGFnZSA9IG5ldyBTdGFnZSgpO1xyXG4gICAgdGhpcy50aXRsZSA9IG51bGw7Ly8g44K/44Kk44OI44Or44Oh44OD44K344OlXHJcbiAgICB0aGlzLnNwYWNlRmllbGQgPSBudWxsOy8vIOWuh+WumeepuumWk+ODkeODvOODhuOCo+OCr+ODq1xyXG4gICAgdGhpcy5lZGl0SGFuZGxlTmFtZSA9IG51bGw7XHJcbiAgICBzZmcuYWRkU2NvcmUgPSB0aGlzLmFkZFNjb3JlLmJpbmQodGhpcyk7XHJcbiAgICB0aGlzLmNoZWNrVmlzaWJpbGl0eUFQSSgpO1xyXG4gICAgdGhpcy5hdWRpb18gPSBuZXcgYXVkaW8uQXVkaW8oKTtcclxuICB9XHJcblxyXG4gIGV4ZWMoKSB7XHJcbiAgICBcclxuICAgIGlmICghdGhpcy5jaGVja0Jyb3dzZXJTdXBwb3J0KCcjY29udGVudCcpKXtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc2VxdWVuY2VyID0gbmV3IGF1ZGlvLlNlcXVlbmNlcih0aGlzLmF1ZGlvXyk7XHJcbiAgICAvL3BpYW5vID0gbmV3IGF1ZGlvLlBpYW5vKGF1ZGlvXyk7XHJcbiAgICB0aGlzLnNvdW5kRWZmZWN0cyA9IG5ldyBhdWRpby5Tb3VuZEVmZmVjdHModGhpcy5zZXF1ZW5jZXIpO1xyXG5cclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIod2luZG93LnZpc2liaWxpdHlDaGFuZ2UsIHRoaXMub25WaXNpYmlsaXR5Q2hhbmdlLmJpbmQodGhpcyksIGZhbHNlKTtcclxuICAgIHNmZy5nYW1lVGltZXIgPSBuZXcgdXRpbC5HYW1lVGltZXIodGhpcy5nZXRDdXJyZW50VGltZS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLy8g44Ky44O844Og44Kz44Oz44K944O844Or44Gu5Yid5pyf5YyWXHJcbiAgICB0aGlzLmluaXRDb25zb2xlKCk7XHJcbiAgICB0aGlzLmxvYWRSZXNvdXJjZXMoKVxyXG4gICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5zY2VuZS5yZW1vdmUodGhpcy5wcm9ncmVzcy5tZXNoKTtcclxuICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLnNjZW5lLCB0aGlzLmNhbWVyYSk7XHJcbiAgICAgICAgdGhpcy50YXNrcy5jbGVhcigpO1xyXG4gICAgICAgIHRoaXMudGFza3MucHVzaFRhc2sodGhpcy5iYXNpY0lucHV0LnVwZGF0ZS5iaW5kKHRoaXMuYmFzaWNJbnB1dCkpO1xyXG4gICAgICAgIHRoaXMudGFza3MucHVzaFRhc2sodGhpcy5pbml0LmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc3RhcnQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMubWFpbigpO1xyXG4gICAgICB9KTtcclxuICB9XHJcblxyXG4gIGNoZWNrVmlzaWJpbGl0eUFQSSgpIHtcclxuICAgIC8vIGhpZGRlbiDjg5fjg63jg5Hjg4bjgqPjgYrjgojjgbPlj6/oppbmgKfjga7lpInmm7TjgqTjg5njg7Pjg4jjga7lkI3liY3jgpLoqK3lrppcclxuICAgIGlmICh0eXBlb2YgZG9jdW1lbnQuaGlkZGVuICE9PSBcInVuZGVmaW5lZFwiKSB7IC8vIE9wZXJhIDEyLjEwIOOChCBGaXJlZm94IDE4IOS7pemZjeOBp+OCteODneODvOODiCBcclxuICAgICAgdGhpcy5oaWRkZW4gPSBcImhpZGRlblwiO1xyXG4gICAgICB3aW5kb3cudmlzaWJpbGl0eUNoYW5nZSA9IFwidmlzaWJpbGl0eWNoYW5nZVwiO1xyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZG9jdW1lbnQubW96SGlkZGVuICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgIHRoaXMuaGlkZGVuID0gXCJtb3pIaWRkZW5cIjtcclxuICAgICAgd2luZG93LnZpc2liaWxpdHlDaGFuZ2UgPSBcIm1venZpc2liaWxpdHljaGFuZ2VcIjtcclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRvY3VtZW50Lm1zSGlkZGVuICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgIHRoaXMuaGlkZGVuID0gXCJtc0hpZGRlblwiO1xyXG4gICAgICB3aW5kb3cudmlzaWJpbGl0eUNoYW5nZSA9IFwibXN2aXNpYmlsaXR5Y2hhbmdlXCI7XHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkb2N1bWVudC53ZWJraXRIaWRkZW4gIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgdGhpcy5oaWRkZW4gPSBcIndlYmtpdEhpZGRlblwiO1xyXG4gICAgICB3aW5kb3cudmlzaWJpbGl0eUNoYW5nZSA9IFwid2Via2l0dmlzaWJpbGl0eWNoYW5nZVwiO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBjYWxjU2NyZWVuU2l6ZSgpIHtcclxuICAgIHZhciB3aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xyXG4gICAgdmFyIGhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcclxuICAgIGlmICh3aWR0aCA+PSBoZWlnaHQpIHtcclxuICAgICAgd2lkdGggPSBoZWlnaHQgKiBzZmcuVklSVFVBTF9XSURUSCAvIHNmZy5WSVJUVUFMX0hFSUdIVDtcclxuICAgICAgd2hpbGUgKHdpZHRoID4gd2luZG93LmlubmVyV2lkdGgpIHtcclxuICAgICAgICAtLWhlaWdodDtcclxuICAgICAgICB3aWR0aCA9IGhlaWdodCAqIHNmZy5WSVJUVUFMX1dJRFRIIC8gc2ZnLlZJUlRVQUxfSEVJR0hUO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBoZWlnaHQgPSB3aWR0aCAqIHNmZy5WSVJUVUFMX0hFSUdIVCAvIHNmZy5WSVJUVUFMX1dJRFRIO1xyXG4gICAgICB3aGlsZSAoaGVpZ2h0ID4gd2luZG93LmlubmVySGVpZ2h0KSB7XHJcbiAgICAgICAgLS13aWR0aDtcclxuICAgICAgICBoZWlnaHQgPSB3aWR0aCAqIHNmZy5WSVJUVUFMX0hFSUdIVCAvIHNmZy5WSVJUVUFMX1dJRFRIO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLkNPTlNPTEVfV0lEVEggPSB3aWR0aDtcclxuICAgIHRoaXMuQ09OU09MRV9IRUlHSFQgPSBoZWlnaHQ7XHJcbiAgfVxyXG4gIFxyXG4gIC8vLyDjgrPjg7Pjgr3jg7zjg6vnlLvpnaLjga7liJ3mnJ/ljJZcclxuICBpbml0Q29uc29sZShjb25zb2xlQ2xhc3MpIHtcclxuICAgIC8vIOODrOODs+ODgOODqeODvOOBruS9nOaIkFxyXG4gICAgdGhpcy5yZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKHsgYW50aWFsaWFzOiBmYWxzZSwgc29ydE9iamVjdHM6IHRydWUgfSk7XHJcbiAgICB2YXIgcmVuZGVyZXIgPSB0aGlzLnJlbmRlcmVyO1xyXG4gICAgdGhpcy5jYWxjU2NyZWVuU2l6ZSgpO1xyXG4gICAgcmVuZGVyZXIuc2V0U2l6ZSh0aGlzLkNPTlNPTEVfV0lEVEgsIHRoaXMuQ09OU09MRV9IRUlHSFQpO1xyXG4gICAgcmVuZGVyZXIuc2V0Q2xlYXJDb2xvcigwLCAxKTtcclxuICAgIHJlbmRlcmVyLmRvbUVsZW1lbnQuaWQgPSAnY29uc29sZSc7XHJcbiAgICByZW5kZXJlci5kb21FbGVtZW50LmNsYXNzTmFtZSA9IGNvbnNvbGVDbGFzcyB8fCAnY29uc29sZSc7XHJcbiAgICByZW5kZXJlci5kb21FbGVtZW50LnN0eWxlLnpJbmRleCA9IDA7XHJcblxyXG5cclxuICAgIGQzLnNlbGVjdCgnI2NvbnRlbnQnKS5ub2RlKCkuYXBwZW5kQ2hpbGQocmVuZGVyZXIuZG9tRWxlbWVudCk7XHJcblxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICgpID0+IHtcclxuICAgICAgdGhpcy5jYWxjU2NyZWVuU2l6ZSgpO1xyXG4gICAgICByZW5kZXJlci5zZXRTaXplKHRoaXMuQ09OU09MRV9XSURUSCwgdGhpcy5DT05TT0xFX0hFSUdIVCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyDjgrfjg7zjg7Pjga7kvZzmiJBcclxuICAgIHRoaXMuc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcclxuXHJcbiAgICAvLyDjgqvjg6Hjg6njga7kvZzmiJBcclxuICAgIHRoaXMuY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDkwLjAsIHNmZy5WSVJUVUFMX1dJRFRIIC8gc2ZnLlZJUlRVQUxfSEVJR0hUKTtcclxuICAgIHRoaXMuY2FtZXJhLnBvc2l0aW9uLnogPSBzZmcuVklSVFVBTF9IRUlHSFQgLyAyO1xyXG4gICAgdGhpcy5jYW1lcmEubG9va0F0KG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApKTtcclxuXHJcbiAgICAvLyDjg6njgqTjg4jjga7kvZzmiJBcclxuICAgIC8vdmFyIGxpZ2h0ID0gbmV3IFRIUkVFLkRpcmVjdGlvbmFsTGlnaHQoMHhmZmZmZmYpO1xyXG4gICAgLy9saWdodC5wb3NpdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKDAuNTc3LCAwLjU3NywgMC41NzcpO1xyXG4gICAgLy9zY2VuZS5hZGQobGlnaHQpO1xyXG5cclxuICAgIC8vdmFyIGFtYmllbnQgPSBuZXcgVEhSRUUuQW1iaWVudExpZ2h0KDB4ZmZmZmZmKTtcclxuICAgIC8vc2NlbmUuYWRkKGFtYmllbnQpO1xyXG4gICAgcmVuZGVyZXIuY2xlYXIoKTtcclxuICB9XHJcblxyXG4gIC8vLyDjgqjjg6njg7zjgafntYLkuobjgZnjgovjgIJcclxuICBFeGl0RXJyb3IoZSkge1xyXG4gICAgLy9jdHguZmlsbFN0eWxlID0gXCJyZWRcIjtcclxuICAgIC8vY3R4LmZpbGxSZWN0KDAsIDAsIENPTlNPTEVfV0lEVEgsIENPTlNPTEVfSEVJR0hUKTtcclxuICAgIC8vY3R4LmZpbGxTdHlsZSA9IFwid2hpdGVcIjtcclxuICAgIC8vY3R4LmZpbGxUZXh0KFwiRXJyb3IgOiBcIiArIGUsIDAsIDIwKTtcclxuICAgIC8vLy9hbGVydChlKTtcclxuICAgIHRoaXMuc3RhcnQgPSBmYWxzZTtcclxuICAgIHRocm93IGU7XHJcbiAgfVxyXG5cclxuICBvblZpc2liaWxpdHlDaGFuZ2UoKSB7XHJcbiAgICB2YXIgaCA9IGRvY3VtZW50W3RoaXMuaGlkZGVuXTtcclxuICAgIHRoaXMuaXNIaWRkZW4gPSBoO1xyXG4gICAgaWYgKGgpIHtcclxuICAgICAgdGhpcy5wYXVzZSgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5yZXN1bWUoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHBhdXNlKCkge1xyXG4gICAgaWYgKHNmZy5nYW1lVGltZXIuc3RhdHVzID09IHNmZy5nYW1lVGltZXIuU1RBUlQpIHtcclxuICAgICAgc2ZnLmdhbWVUaW1lci5wYXVzZSgpO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuc2VxdWVuY2VyLnN0YXR1cyA9PSB0aGlzLnNlcXVlbmNlci5QTEFZKSB7XHJcbiAgICAgIHRoaXMuc2VxdWVuY2VyLnBhdXNlKCk7XHJcbiAgICB9XHJcbiAgICBzZmcucGF1c2UgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgcmVzdW1lKCkge1xyXG4gICAgaWYgKHNmZy5nYW1lVGltZXIuc3RhdHVzID09IHNmZy5nYW1lVGltZXIuUEFVU0UpIHtcclxuICAgICAgc2ZnLmdhbWVUaW1lci5yZXN1bWUoKTtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnNlcXVlbmNlci5zdGF0dXMgPT0gdGhpcy5zZXF1ZW5jZXIuUEFVU0UpIHtcclxuICAgICAgdGhpcy5zZXF1ZW5jZXIucmVzdW1lKCk7XHJcbiAgICB9XHJcbiAgICBzZmcucGF1c2UgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8vLyDnj77lnKjmmYLplpPjga7lj5blvpdcclxuICBnZXRDdXJyZW50VGltZSgpIHtcclxuICAgIHJldHVybiB0aGlzLmF1ZGlvXy5hdWRpb2N0eC5jdXJyZW50VGltZTtcclxuICB9XHJcblxyXG4gIC8vLyDjg5bjg6njgqbjgrbjga7mqZ/og73jg4Hjgqfjg4Pjgq9cclxuICBjaGVja0Jyb3dzZXJTdXBwb3J0KCkge1xyXG4gICAgdmFyIGNvbnRlbnQgPSAnPGltZyBjbGFzcz1cImVycm9yaW1nXCIgc3JjPVwiaHR0cDovL3B1YmxpYy5ibHUubGl2ZWZpbGVzdG9yZS5jb20veTJwYlkzYXFCejZ3ejRhaDg3UlhFVms1Q2xoRDJMdWpDNU5zNjZIS3ZSODlhanJGZExNMFR4RmVyWVlVUnQ4M2NfYmczNUhTa3FjM0U4R3hhRkQ4LVg5NE1Mc0ZWNUdVNkJZcDE5NUl2ZWdldlEvMjAxMzEwMDEucG5nP3BzaWQ9MVwiIHdpZHRoPVwiNDc5XCIgaGVpZ2h0PVwiNjQwXCIgY2xhc3M9XCJhbGlnbm5vbmVcIiAvPic7XHJcbiAgICAvLyBXZWJHTOOBruOCteODneODvOODiOODgeOCp+ODg+OCr1xyXG4gICAgaWYgKCFEZXRlY3Rvci53ZWJnbCkge1xyXG4gICAgICBkMy5zZWxlY3QoJyNjb250ZW50JykuYXBwZW5kKCdkaXYnKS5jbGFzc2VkKCdlcnJvcicsIHRydWUpLmh0bWwoXHJcbiAgICAgICAgY29udGVudCArICc8cCBjbGFzcz1cImVycm9ydGV4dFwiPuODluODqeOCpuOCtuOBjDxici8+V2ViR0zjgpLjgrXjg53jg7zjg4jjgZfjgabjgYTjgarjgYTjgZ/jgoE8YnIvPuWLleS9nOOBhOOBn+OBl+OBvuOBm+OCk+OAgjwvcD4nKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFdlYiBBdWRpbyBBUEnjg6njg4Pjg5Hjg7xcclxuICAgIGlmICghdGhpcy5hdWRpb18uZW5hYmxlKSB7XHJcbiAgICAgIGQzLnNlbGVjdCgnI2NvbnRlbnQnKS5hcHBlbmQoJ2RpdicpLmNsYXNzZWQoJ2Vycm9yJywgdHJ1ZSkuaHRtbChcclxuICAgICAgICBjb250ZW50ICsgJzxwIGNsYXNzPVwiZXJyb3J0ZXh0XCI+44OW44Op44Km44K244GMPGJyLz5XZWIgQXVkaW8gQVBJ44KS44K144Od44O844OI44GX44Gm44GE44Gq44GE44Gf44KBPGJyLz7li5XkvZzjgYTjgZ/jgZfjgb7jgZvjgpPjgII8L3A+Jyk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyDjg5bjg6njgqbjgrbjgYxQYWdlIFZpc2liaWxpdHkgQVBJIOOCkuOCteODneODvOODiOOBl+OBquOBhOWgtOWQiOOBq+itpuWRiiBcclxuICAgIGlmICh0eXBlb2YgdGhpcy5oaWRkZW4gPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIGQzLnNlbGVjdCgnI2NvbnRlbnQnKS5hcHBlbmQoJ2RpdicpLmNsYXNzZWQoJ2Vycm9yJywgdHJ1ZSkuaHRtbChcclxuICAgICAgICBjb250ZW50ICsgJzxwIGNsYXNzPVwiZXJyb3J0ZXh0XCI+44OW44Op44Km44K244GMPGJyLz5QYWdlIFZpc2liaWxpdHkgQVBJ44KS44K144Od44O844OI44GX44Gm44GE44Gq44GE44Gf44KBPGJyLz7li5XkvZzjgYTjgZ/jgZfjgb7jgZvjgpPjgII8L3A+Jyk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodHlwZW9mIGxvY2FsU3RvcmFnZSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgZDMuc2VsZWN0KCcjY29udGVudCcpLmFwcGVuZCgnZGl2JykuY2xhc3NlZCgnZXJyb3InLCB0cnVlKS5odG1sKFxyXG4gICAgICAgIGNvbnRlbnQgKyAnPHAgY2xhc3M9XCJlcnJvcnRleHRcIj7jg5bjg6njgqbjgrbjgYw8YnIvPldlYiBMb2NhbCBTdG9yYWdl44KS44K144Od44O844OI44GX44Gm44GE44Gq44GE44Gf44KBPGJyLz7li5XkvZzjgYTjgZ/jgZfjgb7jgZvjgpPjgII8L3A+Jyk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuc3RvcmFnZSA9IGxvY2FsU3RvcmFnZTtcclxuICAgIH1cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuIFxyXG4gIC8vLyDjgrLjg7zjg6Djg6HjgqTjg7NcclxuICBtYWluKCkge1xyXG4gICAgLy8g44K/44K544Kv44Gu5ZG844Gz5Ye644GXXHJcbiAgICAvLyDjg6HjgqTjg7Pjgavmj4/nlLtcclxuICAgIGlmICh0aGlzLnN0YXJ0KSB7XHJcbiAgICAgIHRoaXMudGFza3MucHJvY2Vzcyh0aGlzKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGxvYWRSZXNvdXJjZXMoKSB7XHJcbiAgICAvLy8g44Ky44O844Og5Lit44Gu44OG44Kv44K544OB44Oj44O85a6a576pXHJcbiAgICB2YXIgdGV4dHVyZXMgPSB7XHJcbiAgICAgIGZvbnQ6ICdGb250LnBuZycsXHJcbiAgICAgIGZvbnQxOiAnRm9udDIucG5nJyxcclxuICAgICAgYXV0aG9yOiAnYXV0aG9yLnBuZycsXHJcbiAgICAgIHRpdGxlOiAnVElUTEUucG5nJyxcclxuICAgICAgbXlzaGlwOiAnbXlzaGlwMi5wbmcnLFxyXG4gICAgICBlbmVteTogJ2VuZW15LnBuZycsXHJcbiAgICAgIGJvbWI6ICdib21iLnBuZydcclxuICAgIH07XHJcbiAgICAvLy8g44OG44Kv44K544OB44Oj44O844Gu44Ot44O844OJXHJcbiAgXHJcbiAgICB2YXIgbG9hZFByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoKTtcclxuICAgIHZhciBsb2FkZXIgPSBuZXcgVEhSRUUuVGV4dHVyZUxvYWRlcigpO1xyXG4gICAgZnVuY3Rpb24gbG9hZFRleHR1cmUoc3JjKSB7XHJcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgbG9hZGVyLmxvYWQoc3JjLCAodGV4dHVyZSkgPT4ge1xyXG4gICAgICAgICAgdGV4dHVyZS5tYWdGaWx0ZXIgPSBUSFJFRS5OZWFyZXN0RmlsdGVyO1xyXG4gICAgICAgICAgdGV4dHVyZS5taW5GaWx0ZXIgPSBUSFJFRS5MaW5lYXJNaXBNYXBMaW5lYXJGaWx0ZXI7XHJcbiAgICAgICAgICByZXNvbHZlKHRleHR1cmUpO1xyXG4gICAgICAgIH0sIG51bGwsICh4aHIpID0+IHsgcmVqZWN0KHhocikgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciB0ZXhMZW5ndGggPSBPYmplY3Qua2V5cyh0ZXh0dXJlcykubGVuZ3RoO1xyXG4gICAgdmFyIHRleENvdW50ID0gMDtcclxuICAgIHRoaXMucHJvZ3Jlc3MgPSBuZXcgZ3JhcGhpY3MuUHJvZ3Jlc3MoKTtcclxuICAgIHRoaXMucHJvZ3Jlc3MubWVzaC5wb3NpdGlvbi56ID0gMC4wMDE7XHJcbiAgICB0aGlzLnByb2dyZXNzLnJlbmRlcignTG9hZGluZyBSZXNvdWNlcyAuLi4nLCAwKTtcclxuICAgIHRoaXMuc2NlbmUuYWRkKHRoaXMucHJvZ3Jlc3MubWVzaCk7XHJcbiAgICBmb3IgKHZhciBuIGluIHRleHR1cmVzKSB7XHJcbiAgICAgICgobmFtZSwgdGV4UGF0aCkgPT4ge1xyXG4gICAgICAgIGxvYWRQcm9taXNlID0gbG9hZFByb21pc2VcclxuICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGxvYWRUZXh0dXJlKCcuL3Jlcy8nICsgdGV4UGF0aCk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLnRoZW4oKHRleCkgPT4ge1xyXG4gICAgICAgICAgICB0ZXhDb3VudCsrO1xyXG4gICAgICAgICAgICB0aGlzLnByb2dyZXNzLnJlbmRlcignTG9hZGluZyBSZXNvdWNlcyAuLi4nLCAodGV4Q291bnQgLyB0ZXhMZW5ndGggKiAxMDApIHwgMCk7XHJcbiAgICAgICAgICAgIHNmZy50ZXh0dXJlRmlsZXNbbmFtZV0gPSB0ZXg7XHJcbiAgICAgICAgICAgIHRoaXMucmVuZGVyZXIucmVuZGVyKHRoaXMuc2NlbmUsIHRoaXMuY2FtZXJhKTtcclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH0pKG4sIHRleHR1cmVzW25dKTtcclxuICAgIH1cclxuICAgIHJldHVybiBsb2FkUHJvbWlzZTtcclxuICB9XHJcblxyXG4qcmVuZGVyKHRhc2tJbmRleCkge1xyXG4gIHdoaWxlKHRhc2tJbmRleCA+PSAwKXtcclxuICAgIHRoaXMucmVuZGVyZXIucmVuZGVyKHRoaXMuc2NlbmUsIHRoaXMuY2FtZXJhKTtcclxuICAgIHRoaXMudGV4dFBsYW5lLnJlbmRlcigpO1xyXG4gICAgdGhpcy5zdGF0cyAmJiB0aGlzLnN0YXRzLnVwZGF0ZSgpO1xyXG4gICAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgfVxyXG59XHJcblxyXG5pbml0QWN0b3JzKClcclxue1xyXG4gIGxldCBwcm9taXNlcyA9IFtdO1xyXG4gIHRoaXMuc2NlbmUgPSB0aGlzLnNjZW5lIHx8IG5ldyBUSFJFRS5TY2VuZSgpO1xyXG4gIHRoaXMuZW5lbXlCdWxsZXRzID0gdGhpcy5lbmVteUJ1bGxldHMgfHwgbmV3IGVuZW1pZXMuRW5lbXlCdWxsZXRzKHRoaXMuc2NlbmUsIHRoaXMuc2UuYmluZCh0aGlzKSk7XHJcbiAgdGhpcy5lbmVtaWVzID0gdGhpcy5lbmVtaWVzIHx8IG5ldyBlbmVtaWVzLkVuZW1pZXModGhpcy5zY2VuZSwgdGhpcy5zZS5iaW5kKHRoaXMpLCB0aGlzLmVuZW15QnVsbGV0cyk7XHJcbiAgcHJvbWlzZXMucHVzaCh0aGlzLmVuZW1pZXMubG9hZFBhdHRlcm5zKCkpO1xyXG4gIHByb21pc2VzLnB1c2godGhpcy5lbmVtaWVzLmxvYWRGb3JtYXRpb25zKCkpO1xyXG4gIHRoaXMuYm9tYnMgPSBzZmcuYm9tYnMgPSB0aGlzLmJvbWJzIHx8IG5ldyBlZmZlY3RvYmouQm9tYnModGhpcy5zY2VuZSwgdGhpcy5zZS5iaW5kKHRoaXMpKTtcclxuICB0aGlzLm15c2hpcF8gPSB0aGlzLm15c2hpcF8gfHwgbmV3IG15c2hpcC5NeVNoaXAoMCwgLTEwMCwgMC4xLCB0aGlzLnNjZW5lLCB0aGlzLnNlLmJpbmQodGhpcykpO1xyXG4gIHNmZy5teXNoaXBfID0gdGhpcy5teXNoaXBfO1xyXG4gIHRoaXMubXlzaGlwXy5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxuXHJcbiAgdGhpcy5zcGFjZUZpZWxkID0gbnVsbDtcclxuICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xyXG59XHJcblxyXG5pbml0Q29tbUFuZEhpZ2hTY29yZSgpXHJcbntcclxuICAvLyDjg4/jg7Pjg4njg6vjg43jg7zjg6Djga7lj5blvpdcclxuICB0aGlzLmhhbmRsZU5hbWUgPSB0aGlzLnN0b3JhZ2UuZ2V0SXRlbSgnaGFuZGxlTmFtZScpO1xyXG5cclxuICB0aGlzLnRleHRQbGFuZSA9IG5ldyB0ZXh0LlRleHRQbGFuZSh0aGlzLnNjZW5lKTtcclxuICAvLyB0ZXh0UGxhbmUucHJpbnQoMCwgMCwgXCJXZWIgQXVkaW8gQVBJIFRlc3RcIiwgbmV3IFRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gIC8vIOOCueOCs+OCouaDheWgsSDpgJrkv6HnlKhcclxuICB0aGlzLmNvbW1fID0gbmV3IGNvbW0uQ29tbSgpO1xyXG4gIHRoaXMuY29tbV8udXBkYXRlSGlnaFNjb3JlcyA9IChkYXRhKSA9PiB7XHJcbiAgICB0aGlzLmhpZ2hTY29yZXMgPSBkYXRhO1xyXG4gICAgdGhpcy5oaWdoU2NvcmUgPSB0aGlzLmhpZ2hTY29yZXNbMF0uc2NvcmU7XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5jb21tXy51cGRhdGVIaWdoU2NvcmUgPSAoZGF0YSkgPT4ge1xyXG4gICAgaWYgKHRoaXMuaGlnaFNjb3JlIDwgZGF0YS5zY29yZSkge1xyXG4gICAgICB0aGlzLmhpZ2hTY29yZSA9IGRhdGEuc2NvcmU7XHJcbiAgICAgIHRoaXMucHJpbnRTY29yZSgpO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgXHJcbn1cclxuXHJcbippbml0KHRhc2tJbmRleCkge1xyXG4gICAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgICB0aGlzLmluaXRDb21tQW5kSGlnaFNjb3JlKCk7XHJcbiAgICB0aGlzLmJhc2ljSW5wdXQuYmluZCgpO1xyXG4gICAgdGhpcy5pbml0QWN0b3JzKClcclxuICAgIC50aGVuKCgpPT57XHJcbiAgICAgIHRoaXMudGFza3MucHVzaFRhc2sodGhpcy5yZW5kZXIuYmluZCh0aGlzKSwgdGhpcy5SRU5ERVJFUl9QUklPUklUWSk7XHJcbiAgICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLnByaW50QXV0aG9yLmJpbmQodGhpcykpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbi8vLyDkvZzogIXooajnpLpcclxuKnByaW50QXV0aG9yKHRhc2tJbmRleCkge1xyXG4gIGNvbnN0IHdhaXQgPSA2MDtcclxuICB0aGlzLmJhc2ljSW5wdXQua2V5QnVmZmVyLmxlbmd0aCA9IDA7XHJcbiAgXHJcbiAgbGV0IG5leHRUYXNrID0gKCk9PntcclxuICAgIHRoaXMuc2NlbmUucmVtb3ZlKHRoaXMuYXV0aG9yKTtcclxuICAgIC8vc2NlbmUubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuaW5pdFRpdGxlLmJpbmQodGhpcykpO1xyXG4gIH1cclxuICBcclxuICBsZXQgY2hlY2tLZXlJbnB1dCA9ICgpPT4ge1xyXG4gICAgaWYgKHRoaXMuYmFzaWNJbnB1dC5rZXlCdWZmZXIubGVuZ3RoID4gMCB8fCB0aGlzLmJhc2ljSW5wdXQuc3RhcnQpIHtcclxuICAgICAgdGhpcy5iYXNpY0lucHV0LmtleUJ1ZmZlci5sZW5ndGggPSAwO1xyXG4gICAgICBuZXh0VGFzaygpO1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9ICBcclxuXHJcbiAgLy8g5Yid5pyf5YyWXHJcbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gIHZhciB3ID0gc2ZnLnRleHR1cmVGaWxlcy5hdXRob3IuaW1hZ2Uud2lkdGg7XHJcbiAgdmFyIGggPSBzZmcudGV4dHVyZUZpbGVzLmF1dGhvci5pbWFnZS5oZWlnaHQ7XHJcbiAgY2FudmFzLndpZHRoID0gdztcclxuICBjYW52YXMuaGVpZ2h0ID0gaDtcclxuICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgY3R4LmRyYXdJbWFnZShzZmcudGV4dHVyZUZpbGVzLmF1dGhvci5pbWFnZSwgMCwgMCk7XHJcbiAgdmFyIGRhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIHcsIGgpO1xyXG4gIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5HZW9tZXRyeSgpO1xyXG5cclxuICBnZW9tZXRyeS52ZXJ0X3N0YXJ0ID0gW107XHJcbiAgZ2VvbWV0cnkudmVydF9lbmQgPSBbXTtcclxuXHJcbiAge1xyXG4gICAgdmFyIGkgPSAwO1xyXG5cclxuICAgIGZvciAodmFyIHkgPSAwOyB5IDwgaDsgKyt5KSB7XHJcbiAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgdzsgKyt4KSB7XHJcbiAgICAgICAgdmFyIGNvbG9yID0gbmV3IFRIUkVFLkNvbG9yKCk7XHJcblxyXG4gICAgICAgIHZhciByID0gZGF0YS5kYXRhW2krK107XHJcbiAgICAgICAgdmFyIGcgPSBkYXRhLmRhdGFbaSsrXTtcclxuICAgICAgICB2YXIgYiA9IGRhdGEuZGF0YVtpKytdO1xyXG4gICAgICAgIHZhciBhID0gZGF0YS5kYXRhW2krK107XHJcbiAgICAgICAgaWYgKGEgIT0gMCkge1xyXG4gICAgICAgICAgY29sb3Iuc2V0UkdCKHIgLyAyNTUuMCwgZyAvIDI1NS4wLCBiIC8gMjU1LjApO1xyXG4gICAgICAgICAgdmFyIHZlcnQgPSBuZXcgVEhSRUUuVmVjdG9yMygoKHggLSB3IC8gMi4wKSksICgoeSAtIGggLyAyKSkgKiAtMSwgMC4wKTtcclxuICAgICAgICAgIHZhciB2ZXJ0MiA9IG5ldyBUSFJFRS5WZWN0b3IzKDEyMDAgKiBNYXRoLnJhbmRvbSgpIC0gNjAwLCAxMjAwICogTWF0aC5yYW5kb20oKSAtIDYwMCwgMTIwMCAqIE1hdGgucmFuZG9tKCkgLSA2MDApO1xyXG4gICAgICAgICAgZ2VvbWV0cnkudmVydF9zdGFydC5wdXNoKG5ldyBUSFJFRS5WZWN0b3IzKHZlcnQyLnggLSB2ZXJ0LngsIHZlcnQyLnkgLSB2ZXJ0LnksIHZlcnQyLnogLSB2ZXJ0LnopKTtcclxuICAgICAgICAgIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2godmVydDIpO1xyXG4gICAgICAgICAgZ2VvbWV0cnkudmVydF9lbmQucHVzaCh2ZXJ0KTtcclxuICAgICAgICAgIGdlb21ldHJ5LmNvbG9ycy5wdXNoKGNvbG9yKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIOODnuODhuODquOCouODq+OCkuS9nOaIkFxyXG4gIC8vdmFyIHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKCdpbWFnZXMvcGFydGljbGUxLnBuZycpO1xyXG4gIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5Qb2ludHNNYXRlcmlhbCh7c2l6ZTogMjAsIGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLFxyXG4gICAgdHJhbnNwYXJlbnQ6IHRydWUsIHZlcnRleENvbG9yczogdHJ1ZSwgZGVwdGhUZXN0OiBmYWxzZS8vLCBtYXA6IHRleHR1cmVcclxuICB9KTtcclxuXHJcbiAgdGhpcy5hdXRob3IgPSBuZXcgVEhSRUUuUG9pbnRzKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgLy8gICAgYXV0aG9yLnBvc2l0aW9uLnggYXV0aG9yLnBvc2l0aW9uLnk9ICA9MC4wLCAwLjAsIDAuMCk7XHJcblxyXG4gIC8vbWVzaC5zb3J0UGFydGljbGVzID0gZmFsc2U7XHJcbiAgLy92YXIgbWVzaDEgPSBuZXcgVEhSRUUuUGFydGljbGVTeXN0ZW0oKTtcclxuICAvL21lc2guc2NhbGUueCA9IG1lc2guc2NhbGUueSA9IDguMDtcclxuXHJcbiAgdGhpcy5zY2VuZS5hZGQodGhpcy5hdXRob3IpOyAgXHJcblxyXG4gXHJcbiAgLy8g5L2c6ICF6KGo56S644K544OG44OD44OX77yRXHJcbiAgZm9yKGxldCBjb3VudCA9IDEuMDtjb3VudCA+IDA7KGNvdW50IDw9IDAuMDEpP2NvdW50IC09IDAuMDAwNTpjb3VudCAtPSAwLjAwMjUpXHJcbiAge1xyXG4gICAgLy8g5L2V44GL44Kt44O85YWl5Yqb44GM44GC44Gj44Gf5aC05ZCI44Gv5qyh44Gu44K/44K544Kv44G4XHJcbiAgICBpZihjaGVja0tleUlucHV0KCkpe1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxldCBlbmQgPSB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlcy5sZW5ndGg7XHJcbiAgICBsZXQgdiA9IHRoaXMuYXV0aG9yLmdlb21ldHJ5LnZlcnRpY2VzO1xyXG4gICAgbGV0IGQgPSB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0X3N0YXJ0O1xyXG4gICAgbGV0IHYyID0gdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydF9lbmQ7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIHZbaV0ueCA9IHYyW2ldLnggKyBkW2ldLnggKiBjb3VudDtcclxuICAgICAgdltpXS55ID0gdjJbaV0ueSArIGRbaV0ueSAqIGNvdW50O1xyXG4gICAgICB2W2ldLnogPSB2MltpXS56ICsgZFtpXS56ICogY291bnQ7XHJcbiAgICB9XHJcbiAgICB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlc05lZWRVcGRhdGUgPSB0cnVlO1xyXG4gICAgdGhpcy5hdXRob3Iucm90YXRpb24ueCA9IHRoaXMuYXV0aG9yLnJvdGF0aW9uLnkgPSB0aGlzLmF1dGhvci5yb3RhdGlvbi56ID0gY291bnQgKiA0LjA7XHJcbiAgICB0aGlzLmF1dGhvci5tYXRlcmlhbC5vcGFjaXR5ID0gMS4wO1xyXG4gICAgeWllbGQ7XHJcbiAgfVxyXG4gIHRoaXMuYXV0aG9yLnJvdGF0aW9uLnggPSB0aGlzLmF1dGhvci5yb3RhdGlvbi55ID0gdGhpcy5hdXRob3Iucm90YXRpb24ueiA9IDAuMDtcclxuXHJcbiAgZm9yIChsZXQgaSA9IDAsZSA9IHRoaXMuYXV0aG9yLmdlb21ldHJ5LnZlcnRpY2VzLmxlbmd0aDsgaSA8IGU7ICsraSkge1xyXG4gICAgdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydGljZXNbaV0ueCA9IHRoaXMuYXV0aG9yLmdlb21ldHJ5LnZlcnRfZW5kW2ldLng7XHJcbiAgICB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlc1tpXS55ID0gdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydF9lbmRbaV0ueTtcclxuICAgIHRoaXMuYXV0aG9yLmdlb21ldHJ5LnZlcnRpY2VzW2ldLnogPSB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0X2VuZFtpXS56O1xyXG4gIH1cclxuICB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlc05lZWRVcGRhdGUgPSB0cnVlO1xyXG5cclxuICAvLyDlvoXjgaFcclxuICBmb3IobGV0IGkgPSAwO2kgPCB3YWl0OysraSl7XHJcbiAgICAvLyDkvZXjgYvjgq3jg7zlhaXlipvjgYzjgYLjgaPjgZ/loLTlkIjjga/mrKHjga7jgr/jgrnjgq/jgbhcclxuICAgIGlmKGNoZWNrS2V5SW5wdXQoKSl7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLmF1dGhvci5tYXRlcmlhbC5zaXplID4gMikge1xyXG4gICAgICB0aGlzLmF1dGhvci5tYXRlcmlhbC5zaXplIC09IDAuNTtcclxuICAgICAgdGhpcy5hdXRob3IubWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgfSAgICBcclxuICAgIHlpZWxkO1xyXG4gIH1cclxuXHJcbiAgLy8g44OV44Kn44O844OJ44Ki44Km44OIXHJcbiAgZm9yKGxldCBjb3VudCA9IDAuMDtjb3VudCA8PSAxLjA7Y291bnQgKz0gMC4wNSlcclxuICB7XHJcbiAgICAvLyDkvZXjgYvjgq3jg7zlhaXlipvjgYzjgYLjgaPjgZ/loLTlkIjjga/mrKHjga7jgr/jgrnjgq/jgbhcclxuICAgIGlmKGNoZWNrS2V5SW5wdXQoKSl7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHRoaXMuYXV0aG9yLm1hdGVyaWFsLm9wYWNpdHkgPSAxLjAgLSBjb3VudDtcclxuICAgIHRoaXMuYXV0aG9yLm1hdGVyaWFsLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIFxyXG4gICAgeWllbGQ7XHJcbiAgfVxyXG5cclxuICB0aGlzLmF1dGhvci5tYXRlcmlhbC5vcGFjaXR5ID0gMC4wOyBcclxuICB0aGlzLmF1dGhvci5tYXRlcmlhbC5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcblxyXG4gIC8vIOW+heOBoVxyXG4gIGZvcihsZXQgaSA9IDA7aSA8IHdhaXQ7KytpKXtcclxuICAgIC8vIOS9leOBi+OCreODvOWFpeWKm+OBjOOBguOBo+OBn+WgtOWQiOOBr+asoeOBruOCv+OCueOCr+OBuFxyXG4gICAgaWYoY2hlY2tLZXlJbnB1dCgpKXtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgeWllbGQ7XHJcbiAgfVxyXG4gIG5leHRUYXNrKCk7XHJcbn1cclxuXHJcbi8vLyDjgr/jgqTjg4jjg6vnlLvpnaLliJ3mnJ/ljJYgLy8vXHJcbippbml0VGl0bGUodGFza0luZGV4KSB7XHJcbiAgXHJcbiAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgXHJcbiAgdGhpcy5iYXNpY0lucHV0LmNsZWFyKCk7XHJcblxyXG4gIC8vIOOCv+OCpOODiOODq+ODoeODg+OCt+ODpeOBruS9nOaIkOODu+ihqOekuiAvLy9cclxuICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBtYXA6IHNmZy50ZXh0dXJlRmlsZXMudGl0bGUgfSk7XHJcbiAgbWF0ZXJpYWwuc2hhZGluZyA9IFRIUkVFLkZsYXRTaGFkaW5nO1xyXG4gIC8vbWF0ZXJpYWwuYW50aWFsaWFzID0gZmFsc2U7XHJcbiAgbWF0ZXJpYWwudHJhbnNwYXJlbnQgPSB0cnVlO1xyXG4gIG1hdGVyaWFsLmFscGhhVGVzdCA9IDAuNTtcclxuICBtYXRlcmlhbC5kZXB0aFRlc3QgPSB0cnVlO1xyXG4gIHRoaXMudGl0bGUgPSBuZXcgVEhSRUUuTWVzaChcclxuICAgIG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KHNmZy50ZXh0dXJlRmlsZXMudGl0bGUuaW1hZ2Uud2lkdGgsIHNmZy50ZXh0dXJlRmlsZXMudGl0bGUuaW1hZ2UuaGVpZ2h0KSxcclxuICAgIG1hdGVyaWFsXHJcbiAgICApO1xyXG4gIHRoaXMudGl0bGUuc2NhbGUueCA9IHRoaXMudGl0bGUuc2NhbGUueSA9IDAuODtcclxuICB0aGlzLnRpdGxlLnBvc2l0aW9uLnkgPSA4MDtcclxuICB0aGlzLnNjZW5lLmFkZCh0aGlzLnRpdGxlKTtcclxuICB0aGlzLnNob3dTcGFjZUZpZWxkKCk7XHJcbiAgLy8vIOODhuOCreOCueODiOihqOekulxyXG4gIHRoaXMudGV4dFBsYW5lLnByaW50KDMsIDI1LCBcIlB1c2ggeiBvciBTVEFSVCBidXR0b25cIiwgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgc2ZnLmdhbWVUaW1lci5zdGFydCgpO1xyXG4gIHRoaXMuc2hvd1RpdGxlLmVuZFRpbWUgPSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lICsgMTAvKuenkiovO1xyXG4gIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLnNob3dUaXRsZS5iaW5kKHRoaXMpKTtcclxuICByZXR1cm47XHJcbn1cclxuXHJcbi8vLyDog4zmma/jg5Hjg7zjg4bjgqPjgq/jg6vooajnpLpcclxuc2hvd1NwYWNlRmllbGQoKSB7XHJcbiAgLy8vIOiDjOaZr+ODkeODvOODhuOCo+OCr+ODq+ihqOekulxyXG4gIGlmICghdGhpcy5zcGFjZUZpZWxkKSB7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTtcclxuXHJcbiAgICBnZW9tZXRyeS5lbmR5ID0gW107XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDI1MDsgKytpKSB7XHJcbiAgICAgIHZhciBjb2xvciA9IG5ldyBUSFJFRS5Db2xvcigpO1xyXG4gICAgICB2YXIgeiA9IC0xODAwLjAgKiBNYXRoLnJhbmRvbSgpIC0gMzAwLjA7XHJcbiAgICAgIGNvbG9yLnNldEhTTCgwLjA1ICsgTWF0aC5yYW5kb20oKSAqIDAuMDUsIDEuMCwgKC0yMTAwIC0geikgLyAtMjEwMCk7XHJcbiAgICAgIHZhciBlbmR5ID0gc2ZnLlZJUlRVQUxfSEVJR0hUIC8gMiAtIHogKiBzZmcuVklSVFVBTF9IRUlHSFQgLyBzZmcuVklSVFVBTF9XSURUSDtcclxuICAgICAgdmFyIHZlcnQyID0gbmV3IFRIUkVFLlZlY3RvcjMoKHNmZy5WSVJUVUFMX1dJRFRIIC0geiAqIDIpICogTWF0aC5yYW5kb20oKSAtICgoc2ZnLlZJUlRVQUxfV0lEVEggLSB6ICogMikgLyAyKVxyXG4gICAgICAgICwgZW5keSAqIDIgKiBNYXRoLnJhbmRvbSgpIC0gZW5keSwgeik7XHJcbiAgICAgIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2godmVydDIpO1xyXG4gICAgICBnZW9tZXRyeS5lbmR5LnB1c2goZW5keSk7XHJcblxyXG4gICAgICBnZW9tZXRyeS5jb2xvcnMucHVzaChjb2xvcik7XHJcbiAgICB9XHJcblxyXG4gICAgLy8g44Oe44OG44Oq44Ki44Or44KS5L2c5oiQXHJcbiAgICAvL3ZhciB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSgnaW1hZ2VzL3BhcnRpY2xlMS5wbmcnKTtcclxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5Qb2ludHNNYXRlcmlhbCh7XHJcbiAgICAgIHNpemU6IDQsIGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLFxyXG4gICAgICB0cmFuc3BhcmVudDogdHJ1ZSwgdmVydGV4Q29sb3JzOiB0cnVlLCBkZXB0aFRlc3Q6IHRydWUvLywgbWFwOiB0ZXh0dXJlXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLnNwYWNlRmllbGQgPSBuZXcgVEhSRUUuUG9pbnRzKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgICB0aGlzLnNwYWNlRmllbGQucG9zaXRpb24ueCA9IHRoaXMuc3BhY2VGaWVsZC5wb3NpdGlvbi55ID0gdGhpcy5zcGFjZUZpZWxkLnBvc2l0aW9uLnogPSAwLjA7XHJcbiAgICB0aGlzLnNjZW5lLmFkZCh0aGlzLnNwYWNlRmllbGQpO1xyXG4gICAgdGhpcy50YXNrcy5wdXNoVGFzayh0aGlzLm1vdmVTcGFjZUZpZWxkLmJpbmQodGhpcykpO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOWuh+WumeepuumWk+OBruihqOekulxyXG4qbW92ZVNwYWNlRmllbGQodGFza0luZGV4KSB7XHJcbiAgd2hpbGUodHJ1ZSl7XHJcbiAgICB2YXIgdmVydHMgPSB0aGlzLnNwYWNlRmllbGQuZ2VvbWV0cnkudmVydGljZXM7XHJcbiAgICB2YXIgZW5keXMgPSB0aGlzLnNwYWNlRmllbGQuZ2VvbWV0cnkuZW5keTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB2ZXJ0cy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgICB2ZXJ0c1tpXS55IC09IDQ7XHJcbiAgICAgIGlmICh2ZXJ0c1tpXS55IDwgLWVuZHlzW2ldKSB7XHJcbiAgICAgICAgdmVydHNbaV0ueSA9IGVuZHlzW2ldO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLnNwYWNlRmllbGQuZ2VvbWV0cnkudmVydGljZXNOZWVkVXBkYXRlID0gdHJ1ZTtcclxuICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOOCv+OCpOODiOODq+ihqOekulxyXG4qc2hvd1RpdGxlKHRhc2tJbmRleCkge1xyXG4gd2hpbGUodHJ1ZSl7XHJcbiAgc2ZnLmdhbWVUaW1lci51cGRhdGUoKTtcclxuXHJcbiAgaWYgKHRoaXMuYmFzaWNJbnB1dC56IHx8IHRoaXMuYmFzaWNJbnB1dC5zdGFydCApIHtcclxuICAgIHRoaXMuc2NlbmUucmVtb3ZlKHRoaXMudGl0bGUpO1xyXG4gICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuaW5pdEhhbmRsZU5hbWUuYmluZCh0aGlzKSk7XHJcbiAgfVxyXG4gIGlmICh0aGlzLnNob3dUaXRsZS5lbmRUaW1lIDwgc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSkge1xyXG4gICAgdGhpcy5zY2VuZS5yZW1vdmUodGhpcy50aXRsZSk7XHJcbiAgICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5pbml0VG9wMTAuYmluZCh0aGlzKSk7XHJcbiAgfVxyXG4gIHlpZWxkO1xyXG4gfVxyXG59XHJcblxyXG4vLy8g44OP44Oz44OJ44Or44ON44O844Og44Gu44Ko44Oz44OI44Oq5YmN5Yid5pyf5YyWXHJcbippbml0SGFuZGxlTmFtZSh0YXNrSW5kZXgpIHtcclxuICBsZXQgZW5kID0gZmFsc2U7XHJcbiAgaWYgKHRoaXMuZWRpdEhhbmRsZU5hbWUpe1xyXG4gICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuZ2FtZUluaXQuYmluZCh0aGlzKSk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHRoaXMuZWRpdEhhbmRsZU5hbWUgPSB0aGlzLmhhbmRsZU5hbWUgfHwgJyc7XHJcbiAgICB0aGlzLnRleHRQbGFuZS5jbHMoKTtcclxuICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDQsIDE4LCAnSW5wdXQgeW91ciBoYW5kbGUgbmFtZS4nKTtcclxuICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDgsIDE5LCAnKE1heCA4IENoYXIpJyk7XHJcbiAgICB0aGlzLnRleHRQbGFuZS5wcmludCgxMCwgMjEsIHRoaXMuZWRpdEhhbmRsZU5hbWUpO1xyXG4gICAgLy8gICAgdGV4dFBsYW5lLnByaW50KDEwLCAyMSwgaGFuZGxlTmFtZVswXSwgVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgICB0aGlzLmJhc2ljSW5wdXQudW5iaW5kKCk7XHJcbiAgICB2YXIgZWxtID0gZDMuc2VsZWN0KCcjY29udGVudCcpLmFwcGVuZCgnaW5wdXQnKTtcclxuICAgIGxldCB0aGlzXyA9IHRoaXM7XHJcbiAgICBlbG1cclxuICAgICAgLmF0dHIoJ3R5cGUnLCAndGV4dCcpXHJcbiAgICAgIC5hdHRyKCdwYXR0ZXJuJywgJ1thLXpBLVowLTlfXFxAXFwjXFwkXFwtXXswLDh9JylcclxuICAgICAgLmF0dHIoJ21heGxlbmd0aCcsIDgpXHJcbiAgICAgIC5hdHRyKCdpZCcsICdpbnB1dC1hcmVhJylcclxuICAgICAgLmF0dHIoJ3ZhbHVlJywgdGhpc18uZWRpdEhhbmRsZU5hbWUpXHJcbiAgICAgIC5jYWxsKGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgZC5ub2RlKCkuc2VsZWN0aW9uU3RhcnQgPSB0aGlzXy5lZGl0SGFuZGxlTmFtZS5sZW5ndGg7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5vbignYmx1cicsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBkMy5ldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIGQzLmV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIC8vbGV0IHRoaXNfID0gdGhpcztcclxuICAgICAgICBzZXRUaW1lb3V0KCAoKSA9PiB7IHRoaXMuZm9jdXMoKTsgfSwgMTApO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfSlcclxuICAgICAgLm9uKCdrZXl1cCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChkMy5ldmVudC5rZXlDb2RlID09IDEzKSB7XHJcbiAgICAgICAgICB0aGlzXy5lZGl0SGFuZGxlTmFtZSA9IHRoaXMudmFsdWU7XHJcbiAgICAgICAgICBsZXQgcyA9IHRoaXMuc2VsZWN0aW9uU3RhcnQ7XHJcbiAgICAgICAgICBsZXQgZSA9IHRoaXMuc2VsZWN0aW9uRW5kO1xyXG4gICAgICAgICAgdGhpc18udGV4dFBsYW5lLnByaW50KDEwLCAyMSwgdGhpc18uZWRpdEhhbmRsZU5hbWUpO1xyXG4gICAgICAgICAgdGhpc18udGV4dFBsYW5lLnByaW50KDEwICsgcywgMjEsICdfJywgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgICAgICAgICBkMy5zZWxlY3QodGhpcykub24oJ2tleXVwJywgbnVsbCk7XHJcbiAgICAgICAgICB0aGlzXy5iYXNpY0lucHV0LmJpbmQoKTtcclxuICAgICAgICAgIC8vIOOBk+OBruOCv+OCueOCr+OCkue1guOCj+OCieOBm+OCi1xyXG4gICAgICAgICAgdGhpc18udGFza3MuYXJyYXlbdGFza0luZGV4XS5nZW5JbnN0Lm5leHQoLSh0YXNrSW5kZXggKyAxKSk7XHJcbiAgICAgICAgICAvLyDmrKHjga7jgr/jgrnjgq/jgpLoqK3lrprjgZnjgotcclxuICAgICAgICAgIHRoaXNfLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpc18uZ2FtZUluaXQuYmluZCh0aGlzXykpO1xyXG4gICAgICAgICAgdGhpc18uc3RvcmFnZS5zZXRJdGVtKCdoYW5kbGVOYW1lJywgdGhpc18uZWRpdEhhbmRsZU5hbWUpO1xyXG4gICAgICAgICAgZDMuc2VsZWN0KCcjaW5wdXQtYXJlYScpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzXy5lZGl0SGFuZGxlTmFtZSA9IHRoaXMudmFsdWU7XHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnNlbGVjdGlvblN0YXJ0O1xyXG4gICAgICAgIHRoaXNfLnRleHRQbGFuZS5wcmludCgxMCwgMjEsICcgICAgICAgICAgICcpO1xyXG4gICAgICAgIHRoaXNfLnRleHRQbGFuZS5wcmludCgxMCwgMjEsIHRoaXNfLmVkaXRIYW5kbGVOYW1lKTtcclxuICAgICAgICB0aGlzXy50ZXh0UGxhbmUucHJpbnQoMTAgKyBzLCAyMSwgJ18nLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICAgICAgfSlcclxuICAgICAgLmNhbGwoZnVuY3Rpb24oKXtcclxuICAgICAgICBsZXQgcyA9IHRoaXMubm9kZSgpLnNlbGVjdGlvblN0YXJ0O1xyXG4gICAgICAgIHRoaXNfLnRleHRQbGFuZS5wcmludCgxMCwgMjEsICcgICAgICAgICAgICcpO1xyXG4gICAgICAgIHRoaXNfLnRleHRQbGFuZS5wcmludCgxMCwgMjEsIHRoaXNfLmVkaXRIYW5kbGVOYW1lKTtcclxuICAgICAgICB0aGlzXy50ZXh0UGxhbmUucHJpbnQoMTAgKyBzLCAyMSwgJ18nLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICAgICAgICB0aGlzLm5vZGUoKS5mb2N1cygpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICB3aGlsZSh0YXNrSW5kZXggPj0gMClcclxuICAgIHtcclxuICAgICAgdGhpcy5iYXNpY0lucHV0LmNsZWFyKCk7XHJcbiAgICAgIGlmKHRoaXMuYmFzaWNJbnB1dC5hQnV0dG9uIHx8IHRoaXMuYmFzaWNJbnB1dC5zdGFydClcclxuICAgICAge1xyXG4gICAgICAgICAgdmFyIGlucHV0QXJlYSA9IGQzLnNlbGVjdCgnI2lucHV0LWFyZWEnKTtcclxuICAgICAgICAgIHZhciBpbnB1dE5vZGUgPSBpbnB1dEFyZWEubm9kZSgpO1xyXG4gICAgICAgICAgdGhpcy5lZGl0SGFuZGxlTmFtZSA9IGlucHV0Tm9kZS52YWx1ZTtcclxuICAgICAgICAgIGxldCBzID0gaW5wdXROb2RlLnNlbGVjdGlvblN0YXJ0O1xyXG4gICAgICAgICAgbGV0IGUgPSBpbnB1dE5vZGUuc2VsZWN0aW9uRW5kO1xyXG4gICAgICAgICAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMTAsIDIxLCB0aGlzLmVkaXRIYW5kbGVOYW1lKTtcclxuICAgICAgICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDEwICsgcywgMjEsICdfJywgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgICAgICAgICBpbnB1dEFyZWEub24oJ2tleXVwJywgbnVsbCk7XHJcbiAgICAgICAgICB0aGlzLmJhc2ljSW5wdXQuYmluZCgpO1xyXG4gICAgICAgICAgLy8g44GT44Gu44K/44K544Kv44KS57WC44KP44KJ44Gb44KLXHJcbiAgICAgICAgICAvL3RoaXMudGFza3MuYXJyYXlbdGFza0luZGV4XS5nZW5JbnN0Lm5leHQoLSh0YXNrSW5kZXggKyAxKSk7XHJcbiAgICAgICAgICAvLyDmrKHjga7jgr/jgrnjgq/jgpLoqK3lrprjgZnjgotcclxuICAgICAgICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLmdhbWVJbml0LmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgdGhpcy5zdG9yYWdlLnNldEl0ZW0oJ2hhbmRsZU5hbWUnLCB0aGlzLmVkaXRIYW5kbGVOYW1lKTtcclxuICAgICAgICAgIGlucHV0QXJlYS5yZW1vdmUoKTtcclxuICAgICAgICAgIHJldHVybjsgICAgICAgIFxyXG4gICAgICB9XHJcbiAgICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gICAgfVxyXG4gICAgdGFza0luZGV4ID0gLSgrK3Rhc2tJbmRleCk7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g44K544Kz44Ki5Yqg566XXHJcbmFkZFNjb3JlKHMpIHtcclxuICB0aGlzLnNjb3JlICs9IHM7XHJcbiAgaWYgKHRoaXMuc2NvcmUgPiB0aGlzLmhpZ2hTY29yZSkge1xyXG4gICAgdGhpcy5oaWdoU2NvcmUgPSB0aGlzLnNjb3JlO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOOCueOCs+OCouihqOekulxyXG5wcmludFNjb3JlKCkge1xyXG4gIHZhciBzID0gKCcwMDAwMDAwMCcgKyB0aGlzLnNjb3JlLnRvU3RyaW5nKCkpLnNsaWNlKC04KTtcclxuICB0aGlzLnRleHRQbGFuZS5wcmludCgxLCAxLCBzKTtcclxuXHJcbiAgdmFyIGggPSAoJzAwMDAwMDAwJyArIHRoaXMuaGlnaFNjb3JlLnRvU3RyaW5nKCkpLnNsaWNlKC04KTtcclxuICB0aGlzLnRleHRQbGFuZS5wcmludCgxMiwgMSwgaCk7XHJcblxyXG59XHJcblxyXG4vLy8g44K144Km44Oz44OJ44Ko44OV44Kn44Kv44OIXHJcbnNlKGluZGV4KSB7XHJcbiAgdGhpcy5zZXF1ZW5jZXIucGxheVRyYWNrcyh0aGlzLnNvdW5kRWZmZWN0cy5zb3VuZEVmZmVjdHNbaW5kZXhdKTtcclxufVxyXG5cclxuLy8vIOOCsuODvOODoOOBruWIneacn+WMllxyXG4qZ2FtZUluaXQodGFza0luZGV4KSB7XHJcblxyXG4gIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gIFxyXG5cclxuICAvLyDjgqrjg7zjg4fjgqPjgqrjga7plovlp4tcclxuICB0aGlzLmF1ZGlvXy5zdGFydCgpO1xyXG4gIHRoaXMuc2VxdWVuY2VyLmxvYWQoYXVkaW8uc2VxRGF0YSk7XHJcbiAgdGhpcy5zZXF1ZW5jZXIuc3RhcnQoKTtcclxuICBzZmcuc3RhZ2UucmVzZXQoKTtcclxuICB0aGlzLnRleHRQbGFuZS5jbHMoKTtcclxuICB0aGlzLmVuZW1pZXMucmVzZXQoKTtcclxuXHJcbiAgLy8g6Ieq5qmf44Gu5Yid5pyf5YyWXHJcbiAgdGhpcy5teXNoaXBfLmluaXQoKTtcclxuICBzZmcuZ2FtZVRpbWVyLnN0YXJ0KCk7XHJcbiAgdGhpcy5zY29yZSA9IDA7XHJcbiAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMiwgMCwgJ1Njb3JlICAgIEhpZ2ggU2NvcmUnKTtcclxuICB0aGlzLnRleHRQbGFuZS5wcmludCgyMCwgMzksICdSZXN0OiAgICcgKyBzZmcubXlzaGlwXy5yZXN0KTtcclxuICB0aGlzLnByaW50U2NvcmUoKTtcclxuICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5zdGFnZUluaXQuYmluZCh0aGlzKS8qZ2FtZUFjdGlvbiovKTtcclxufVxyXG5cclxuLy8vIOOCueODhuODvOOCuOOBruWIneacn+WMllxyXG4qc3RhZ2VJbml0KHRhc2tJbmRleCkge1xyXG4gIFxyXG4gIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gIFxyXG4gIHRoaXMudGV4dFBsYW5lLnByaW50KDAsIDM5LCAnU3RhZ2U6JyArIHNmZy5zdGFnZS5ubyk7XHJcbiAgc2ZnLmdhbWVUaW1lci5zdGFydCgpO1xyXG4gIHRoaXMuZW5lbWllcy5yZXNldCgpO1xyXG4gIHRoaXMuZW5lbWllcy5zdGFydCgpO1xyXG4gIHRoaXMuZW5lbWllcy5jYWxjRW5lbWllc0NvdW50KHNmZy5zdGFnZS5wcml2YXRlTm8pO1xyXG4gIHRoaXMuZW5lbWllcy5oaXRFbmVtaWVzQ291bnQgPSAwO1xyXG4gIHRoaXMudGV4dFBsYW5lLnByaW50KDgsIDE1LCAnU3RhZ2UgJyArIChzZmcuc3RhZ2Uubm8pICsgJyBTdGFydCAhIScsIG5ldyB0ZXh0LlRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLnN0YWdlU3RhcnQuYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcbi8vLyDjgrnjg4bjg7zjgrjplovlp4tcclxuKnN0YWdlU3RhcnQodGFza0luZGV4KSB7XHJcbiAgbGV0IGVuZFRpbWUgPSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lICsgMjtcclxuICB3aGlsZSh0YXNrSW5kZXggPj0gMCAmJiBlbmRUaW1lID49IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUpe1xyXG4gICAgc2ZnLmdhbWVUaW1lci51cGRhdGUoKTtcclxuICAgIHNmZy5teXNoaXBfLmFjdGlvbih0aGlzLmJhc2ljSW5wdXQpO1xyXG4gICAgdGFza0luZGV4ID0geWllbGQ7ICAgIFxyXG4gIH1cclxuICB0aGlzLnRleHRQbGFuZS5wcmludCg4LCAxNSwgJyAgICAgICAgICAgICAgICAgICcsIG5ldyB0ZXh0LlRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLmdhbWVBY3Rpb24uYmluZCh0aGlzKSwgNTAwMCk7XHJcbn1cclxuXHJcbi8vLyDjgrLjg7zjg6DkuK1cclxuKmdhbWVBY3Rpb24odGFza0luZGV4KSB7XHJcbiAgd2hpbGUgKHRhc2tJbmRleCA+PSAwKXtcclxuICAgIHRoaXMucHJpbnRTY29yZSgpO1xyXG4gICAgc2ZnLm15c2hpcF8uYWN0aW9uKHRoaXMuYmFzaWNJbnB1dCk7XHJcbiAgICBzZmcuZ2FtZVRpbWVyLnVwZGF0ZSgpO1xyXG4gICAgLy9jb25zb2xlLmxvZyhzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lKTtcclxuICAgIHRoaXMuZW5lbWllcy5tb3ZlKCk7XHJcblxyXG4gICAgaWYgKCF0aGlzLnByb2Nlc3NDb2xsaXNpb24oKSkge1xyXG4gICAgICAvLyDpnaLjgq/jg6rjgqLjg4Hjgqfjg4Pjgq9cclxuICAgICAgaWYgKHRoaXMuZW5lbWllcy5oaXRFbmVtaWVzQ291bnQgPT0gdGhpcy5lbmVtaWVzLnRvdGFsRW5lbWllc0NvdW50KSB7XHJcbiAgICAgICAgdGhpcy5wcmludFNjb3JlKCk7XHJcbiAgICAgICAgdGhpcy5zdGFnZS5hZHZhbmNlKCk7XHJcbiAgICAgICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuc3RhZ2VJbml0LmJpbmQodGhpcykpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5teVNoaXBCb21iLmVuZFRpbWUgPSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lICsgMztcclxuICAgICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMubXlTaGlwQm9tYi5iaW5kKHRoaXMpKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfTtcclxuICAgIHRhc2tJbmRleCA9IHlpZWxkOyBcclxuICB9XHJcbn1cclxuXHJcbi8vLyDlvZPjgZ/jgorliKTlrppcclxucHJvY2Vzc0NvbGxpc2lvbih0YXNrSW5kZXgpIHtcclxuICAvL+OAgOiHquapn+W8vuOBqOaVteOBqOOBruOBguOBn+OCiuWIpOWumlxyXG4gIGxldCBteUJ1bGxldHMgPSBzZmcubXlzaGlwXy5teUJ1bGxldHM7XHJcbiAgdGhpcy5lbnMgPSB0aGlzLmVuZW1pZXMuZW5lbWllcztcclxuICBmb3IgKHZhciBpID0gMCwgZW5kID0gbXlCdWxsZXRzLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICBsZXQgbXliID0gbXlCdWxsZXRzW2ldO1xyXG4gICAgaWYgKG15Yi5lbmFibGVfKSB7XHJcbiAgICAgIHZhciBteWJjbyA9IG15QnVsbGV0c1tpXS5jb2xsaXNpb25BcmVhO1xyXG4gICAgICB2YXIgbGVmdCA9IG15YmNvLmxlZnQgKyBteWIueDtcclxuICAgICAgdmFyIHJpZ2h0ID0gbXliY28ucmlnaHQgKyBteWIueDtcclxuICAgICAgdmFyIHRvcCA9IG15YmNvLnRvcCArIG15Yi55O1xyXG4gICAgICB2YXIgYm90dG9tID0gbXliY28uYm90dG9tIC0gbXliLnNwZWVkICsgbXliLnk7XHJcbiAgICAgIGZvciAodmFyIGogPSAwLCBlbmRqID0gdGhpcy5lbnMubGVuZ3RoOyBqIDwgZW5kajsgKytqKSB7XHJcbiAgICAgICAgdmFyIGVuID0gdGhpcy5lbnNbal07XHJcbiAgICAgICAgaWYgKGVuLmVuYWJsZV8pIHtcclxuICAgICAgICAgIHZhciBlbmNvID0gZW4uY29sbGlzaW9uQXJlYTtcclxuICAgICAgICAgIGlmICh0b3AgPiAoZW4ueSArIGVuY28uYm90dG9tKSAmJlxyXG4gICAgICAgICAgICAoZW4ueSArIGVuY28udG9wKSA+IGJvdHRvbSAmJlxyXG4gICAgICAgICAgICBsZWZ0IDwgKGVuLnggKyBlbmNvLnJpZ2h0KSAmJlxyXG4gICAgICAgICAgICAoZW4ueCArIGVuY28ubGVmdCkgPCByaWdodFxyXG4gICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgZW4uaGl0KG15Yik7XHJcbiAgICAgICAgICAgIGlmIChteWIucG93ZXIgPD0gMCkge1xyXG4gICAgICAgICAgICAgIG15Yi5lbmFibGVfID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyDmlbXjgajoh6rmqZ/jgajjga7jgYLjgZ/jgorliKTlrppcclxuICBpZiAoc2ZnLkNIRUNLX0NPTExJU0lPTikge1xyXG4gICAgbGV0IG15Y28gPSBzZmcubXlzaGlwXy5jb2xsaXNpb25BcmVhO1xyXG4gICAgbGV0IGxlZnQgPSBzZmcubXlzaGlwXy54ICsgbXljby5sZWZ0O1xyXG4gICAgbGV0IHJpZ2h0ID0gbXljby5yaWdodCArIHNmZy5teXNoaXBfLng7XHJcbiAgICBsZXQgdG9wID0gbXljby50b3AgKyBzZmcubXlzaGlwXy55O1xyXG4gICAgbGV0IGJvdHRvbSA9IG15Y28uYm90dG9tICsgc2ZnLm15c2hpcF8ueTtcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gdGhpcy5lbnMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgbGV0IGVuID0gdGhpcy5lbnNbaV07XHJcbiAgICAgIGlmIChlbi5lbmFibGVfKSB7XHJcbiAgICAgICAgbGV0IGVuY28gPSBlbi5jb2xsaXNpb25BcmVhO1xyXG4gICAgICAgIGlmICh0b3AgPiAoZW4ueSArIGVuY28uYm90dG9tKSAmJlxyXG4gICAgICAgICAgKGVuLnkgKyBlbmNvLnRvcCkgPiBib3R0b20gJiZcclxuICAgICAgICAgIGxlZnQgPCAoZW4ueCArIGVuY28ucmlnaHQpICYmXHJcbiAgICAgICAgICAoZW4ueCArIGVuY28ubGVmdCkgPCByaWdodFxyXG4gICAgICAgICAgKSB7XHJcbiAgICAgICAgICBlbi5oaXQobXlzaGlwKTtcclxuICAgICAgICAgIHNmZy5teXNoaXBfLmhpdCgpO1xyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyDmlbXlvL7jgajoh6rmqZ/jgajjga7jgYLjgZ/jgorliKTlrppcclxuICAgIHRoaXMuZW5icyA9IHRoaXMuZW5lbXlCdWxsZXRzLmVuZW15QnVsbGV0cztcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0aGlzLmVuYnMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgbGV0IGVuID0gdGhpcy5lbmJzW2ldO1xyXG4gICAgICBpZiAoZW4uZW5hYmxlKSB7XHJcbiAgICAgICAgbGV0IGVuY28gPSBlbi5jb2xsaXNpb25BcmVhO1xyXG4gICAgICAgIGlmICh0b3AgPiAoZW4ueSArIGVuY28uYm90dG9tKSAmJlxyXG4gICAgICAgICAgKGVuLnkgKyBlbmNvLnRvcCkgPiBib3R0b20gJiZcclxuICAgICAgICAgIGxlZnQgPCAoZW4ueCArIGVuY28ucmlnaHQpICYmXHJcbiAgICAgICAgICAoZW4ueCArIGVuY28ubGVmdCkgPCByaWdodFxyXG4gICAgICAgICAgKSB7XHJcbiAgICAgICAgICBlbi5oaXQoKTtcclxuICAgICAgICAgIHNmZy5teXNoaXBfLmhpdCgpO1xyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gIH1cclxuICByZXR1cm4gZmFsc2U7XHJcbn1cclxuXHJcbi8vLyDoh6rmqZ/niIbnmbogXHJcbipteVNoaXBCb21iKHRhc2tJbmRleCkge1xyXG4gIHdoaWxlKHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgPD0gdGhpcy5teVNoaXBCb21iLmVuZFRpbWUgJiYgdGFza0luZGV4ID49IDApe1xyXG4gICAgdGhpcy5lbmVtaWVzLm1vdmUoKTtcclxuICAgIHNmZy5nYW1lVGltZXIudXBkYXRlKCk7XHJcbiAgICB0YXNrSW5kZXggPSB5aWVsZDsgIFxyXG4gIH1cclxuICBzZmcubXlzaGlwXy5yZXN0LS07XHJcbiAgaWYgKHNmZy5teXNoaXBfLnJlc3QgPT0gMCkge1xyXG4gICAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMTAsIDE4LCAnR0FNRSBPVkVSJywgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgICB0aGlzLnByaW50U2NvcmUoKTtcclxuICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDIwLCAzOSwgJ1Jlc3Q6ICAgJyArIHNmZy5teXNoaXBfLnJlc3QpO1xyXG4gICAgdGhpcy5jb21tXy5zb2NrZXQub24oJ3NlbmRSYW5rJywgdGhpcy5jaGVja1JhbmtJbik7XHJcbiAgICB0aGlzLmNvbW1fLnNlbmRTY29yZShuZXcgU2NvcmVFbnRyeSh0aGlzLmVkaXRIYW5kbGVOYW1lLCB0aGlzLnNjb3JlKSk7XHJcbiAgICB0aGlzLmdhbWVPdmVyLmVuZFRpbWUgPSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lICsgNTtcclxuICAgIHRoaXMucmFuayA9IC0xO1xyXG4gICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuZ2FtZU92ZXIuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLnNlcXVlbmNlci5zdG9wKCk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHNmZy5teXNoaXBfLm1lc2gudmlzaWJsZSA9IHRydWU7XHJcbiAgICB0aGlzLnRleHRQbGFuZS5wcmludCgyMCwgMzksICdSZXN0OiAgICcgKyBzZmcubXlzaGlwXy5yZXN0KTtcclxuICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDgsIDE1LCAnU3RhZ2UgJyArIChzZmcuc3RhZ2Uubm8pICsgJyBTdGFydCAhIScsIG5ldyB0ZXh0LlRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gICAgdGhpcy5zdGFnZVN0YXJ0LmVuZFRpbWUgPSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lICsgMjtcclxuICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLnN0YWdlU3RhcnQuYmluZCh0aGlzKSk7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g44Ky44O844Og44Kq44O844OQ44O8XHJcbipnYW1lT3Zlcih0YXNrSW5kZXgpIHtcclxuICB3aGlsZSh0aGlzLmdhbWVPdmVyLmVuZFRpbWUgPj0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSAmJiB0YXNrSW5kZXggPj0gMClcclxuICB7XHJcbiAgICBzZmcuZ2FtZVRpbWVyLnVwZGF0ZSgpO1xyXG4gICAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgfVxyXG4gIFxyXG5cclxuICB0aGlzLnRleHRQbGFuZS5jbHMoKTtcclxuICB0aGlzLmVuZW1pZXMucmVzZXQoKTtcclxuICB0aGlzLmVuZW15QnVsbGV0cy5yZXNldCgpO1xyXG4gIGlmICh0aGlzLnJhbmsgPj0gMCkge1xyXG4gICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuaW5pdFRvcDEwLmJpbmQodGhpcykpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5pbml0VGl0bGUuYmluZCh0aGlzKSk7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g44Op44Oz44Kt44Oz44Kw44GX44Gf44GL44Gp44GG44GL44Gu44OB44Kn44OD44KvXHJcbmNoZWNrUmFua0luKGRhdGEpIHtcclxuICB0aGlzLnJhbmsgPSBkYXRhLnJhbms7XHJcbn1cclxuXHJcblxyXG4vLy8g44OP44Kk44K544Kz44Ki44Ko44Oz44OI44Oq44Gu6KGo56S6XHJcbnByaW50VG9wMTAoKSB7XHJcbiAgdmFyIHJhbmtuYW1lID0gWycgMXN0JywgJyAybmQnLCAnIDNyZCcsICcgNHRoJywgJyA1dGgnLCAnIDZ0aCcsICcgN3RoJywgJyA4dGgnLCAnIDl0aCcsICcxMHRoJ107XHJcbiAgdGhpcy50ZXh0UGxhbmUucHJpbnQoOCwgNCwgJ1RvcCAxMCBTY29yZScpO1xyXG4gIHZhciB5ID0gODtcclxuICBmb3IgKHZhciBpID0gMCwgZW5kID0gdGhpcy5oaWdoU2NvcmVzLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICB2YXIgc2NvcmVTdHIgPSAnMDAwMDAwMDAnICsgdGhpcy5oaWdoU2NvcmVzW2ldLnNjb3JlO1xyXG4gICAgc2NvcmVTdHIgPSBzY29yZVN0ci5zdWJzdHIoc2NvcmVTdHIubGVuZ3RoIC0gOCwgOCk7XHJcbiAgICBpZiAodGhpcy5yYW5rID09IGkpIHtcclxuICAgICAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMywgeSwgcmFua25hbWVbaV0gKyAnICcgKyBzY29yZVN0ciArICcgJyArIHRoaXMuaGlnaFNjb3Jlc1tpXS5uYW1lLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDMsIHksIHJhbmtuYW1lW2ldICsgJyAnICsgc2NvcmVTdHIgKyAnICcgKyB0aGlzLmhpZ2hTY29yZXNbaV0ubmFtZSk7XHJcbiAgICB9XHJcbiAgICB5ICs9IDI7XHJcbiAgfVxyXG59XHJcblxyXG5cclxuKmluaXRUb3AxMCh0YXNrSW5kZXgpIHtcclxuICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICB0aGlzLnRleHRQbGFuZS5jbHMoKTtcclxuICB0aGlzLnByaW50VG9wMTAoKTtcclxuICB0aGlzLnNob3dUb3AxMC5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDU7XHJcbiAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuc2hvd1RvcDEwLmJpbmQodGhpcykpO1xyXG59XHJcblxyXG4qc2hvd1RvcDEwKHRhc2tJbmRleCkge1xyXG4gIHdoaWxlKHRoaXMuc2hvd1RvcDEwLmVuZFRpbWUgPj0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSAmJiB0aGlzLmJhc2ljSW5wdXQua2V5QnVmZmVyLmxlbmd0aCA9PSAwICYmIHRhc2tJbmRleCA+PSAwKVxyXG4gIHtcclxuICAgIHNmZy5nYW1lVGltZXIudXBkYXRlKCk7XHJcbiAgICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICB9IFxyXG4gIFxyXG4gIHRoaXMuYmFzaWNJbnB1dC5rZXlCdWZmZXIubGVuZ3RoID0gMDtcclxuICB0aGlzLnRleHRQbGFuZS5jbHMoKTtcclxuICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5pbml0VGl0bGUuYmluZCh0aGlzKSk7XHJcbn1cclxufVxyXG5cclxuXHJcblxyXG5cclxuXHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIENvbGxpc2lvbkFyZWEge1xyXG4gIGNvbnN0cnVjdG9yKG9mZnNldFgsIG9mZnNldFksIHdpZHRoLCBoZWlnaHQpXHJcbiAge1xyXG4gICAgdGhpcy5vZmZzZXRYID0gb2Zmc2V0WCB8fCAwO1xyXG4gICAgdGhpcy5vZmZzZXRZID0gb2Zmc2V0WSB8fCAwO1xyXG4gICAgdGhpcy50b3AgPSAwO1xyXG4gICAgdGhpcy5ib3R0b20gPSAwO1xyXG4gICAgdGhpcy5sZWZ0ID0gMDtcclxuICAgIHRoaXMucmlnaHQgPSAwO1xyXG4gICAgdGhpcy53aWR0aCA9IHdpZHRoIHx8IDA7XHJcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodCB8fCAwO1xyXG4gICAgdGhpcy53aWR0aF8gPSAwO1xyXG4gICAgdGhpcy5oZWlnaHRfID0gMDtcclxuICB9XHJcbiAgZ2V0IHdpZHRoKCkgeyByZXR1cm4gdGhpcy53aWR0aF87IH1cclxuICBzZXQgd2lkdGgodikge1xyXG4gICAgdGhpcy53aWR0aF8gPSB2O1xyXG4gICAgdGhpcy5sZWZ0ID0gdGhpcy5vZmZzZXRYIC0gdiAvIDI7XHJcbiAgICB0aGlzLnJpZ2h0ID0gdGhpcy5vZmZzZXRYICsgdiAvIDI7XHJcbiAgfVxyXG4gIGdldCBoZWlnaHQoKSB7IHJldHVybiB0aGlzLmhlaWdodF87IH1cclxuICBzZXQgaGVpZ2h0KHYpIHtcclxuICAgIHRoaXMuaGVpZ2h0XyA9IHY7XHJcbiAgICB0aGlzLnRvcCA9IHRoaXMub2Zmc2V0WSArIHYgLyAyO1xyXG4gICAgdGhpcy5ib3R0b20gPSB0aGlzLm9mZnNldFkgLSB2IC8gMjtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBHYW1lT2JqIHtcclxuICBjb25zdHJ1Y3Rvcih4LCB5LCB6KSB7XHJcbiAgICB0aGlzLnhfID0geCB8fCAwO1xyXG4gICAgdGhpcy55XyA9IHkgfHwgMDtcclxuICAgIHRoaXMuel8gPSB6IHx8IDAuMDtcclxuICAgIHRoaXMuZW5hYmxlXyA9IGZhbHNlO1xyXG4gICAgdGhpcy53aWR0aCA9IDA7XHJcbiAgICB0aGlzLmhlaWdodCA9IDA7XHJcbiAgICB0aGlzLmNvbGxpc2lvbkFyZWEgPSBuZXcgQ29sbGlzaW9uQXJlYSgpO1xyXG4gIH1cclxuICBnZXQgeCgpIHsgcmV0dXJuIHRoaXMueF87IH1cclxuICBzZXQgeCh2KSB7IHRoaXMueF8gPSB2OyB9XHJcbiAgZ2V0IHkoKSB7IHJldHVybiB0aGlzLnlfOyB9XHJcbiAgc2V0IHkodikgeyB0aGlzLnlfID0gdjsgfVxyXG4gIGdldCB6KCkgeyByZXR1cm4gdGhpcy56XzsgfVxyXG4gIHNldCB6KHYpIHsgdGhpcy56XyA9IHY7IH1cclxufVxyXG5cclxuIiwiZXhwb3J0IGNvbnN0IFZJUlRVQUxfV0lEVEggPSAyNDA7XHJcbmV4cG9ydCBjb25zdCBWSVJUVUFMX0hFSUdIVCA9IDMyMDtcclxuXHJcbmV4cG9ydCBjb25zdCBWX1JJR0hUID0gVklSVFVBTF9XSURUSCAvIDIuMDtcclxuZXhwb3J0IGNvbnN0IFZfVE9QID0gVklSVFVBTF9IRUlHSFQgLyAyLjA7XHJcbmV4cG9ydCBjb25zdCBWX0xFRlQgPSAtMSAqIFZJUlRVQUxfV0lEVEggLyAyLjA7XHJcbmV4cG9ydCBjb25zdCBWX0JPVFRPTSA9IC0xICogVklSVFVBTF9IRUlHSFQgLyAyLjA7XHJcblxyXG5leHBvcnQgY29uc3QgQ0hBUl9TSVpFID0gODtcclxuZXhwb3J0IGNvbnN0IFRFWFRfV0lEVEggPSBWSVJUVUFMX1dJRFRIIC8gQ0hBUl9TSVpFO1xyXG5leHBvcnQgY29uc3QgVEVYVF9IRUlHSFQgPSBWSVJUVUFMX0hFSUdIVCAvIENIQVJfU0laRTtcclxuZXhwb3J0IGNvbnN0IFBJWEVMX1NJWkUgPSAxO1xyXG5leHBvcnQgY29uc3QgQUNUVUFMX0NIQVJfU0laRSA9IENIQVJfU0laRSAqIFBJWEVMX1NJWkU7XHJcbmV4cG9ydCBjb25zdCBTUFJJVEVfU0laRV9YID0gMTYuMDtcclxuZXhwb3J0IGNvbnN0IFNQUklURV9TSVpFX1kgPSAxNi4wO1xyXG5leHBvcnQgdmFyIENIRUNLX0NPTExJU0lPTiA9IHRydWU7XHJcbmV4cG9ydCB2YXIgREVCVUcgPSBmYWxzZTtcclxuZXhwb3J0IHZhciB0ZXh0dXJlRmlsZXMgPSB7fTtcclxuZXhwb3J0IHZhciBzdGFnZTtcclxuZXhwb3J0IHZhciB0YXNrcztcclxuZXhwb3J0IHZhciBnYW1lVGltZXI7XHJcbmV4cG9ydCB2YXIgYm9tYnM7XHJcbmV4cG9ydCB2YXIgYWRkU2NvcmU7XHJcbmV4cG9ydCB2YXIgbXlzaGlwXztcclxuZXhwb3J0IGNvbnN0IHRleHR1cmVSb290ID0gJy4vcmVzLyc7XHJcbmV4cG9ydCB2YXIgcGF1c2UgPSBmYWxzZTtcclxuZXhwb3J0IHZhciBnYW1lO1xyXG5cclxuXHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgKiBhcyBnIGZyb20gJy4vZ2xvYmFsJztcclxuXHJcbi8vLyDjg4bjgq/jgrnjg4Hjg6Pjg7zjgajjgZfjgaZjYW52YXPjgpLkvb/jgYbloLTlkIjjga7jg5jjg6vjg5Hjg7xcclxuZXhwb3J0IGZ1bmN0aW9uIENhbnZhc1RleHR1cmUod2lkdGgsIGhlaWdodCkge1xyXG4gIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgdGhpcy5jYW52YXMud2lkdGggPSB3aWR0aCB8fCBnLlZJUlRVQUxfV0lEVEg7XHJcbiAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gaGVpZ2h0IHx8IGcuVklSVFVBTF9IRUlHSFQ7XHJcbiAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gIHRoaXMudGV4dHVyZSA9IG5ldyBUSFJFRS5UZXh0dXJlKHRoaXMuY2FudmFzKTtcclxuICB0aGlzLnRleHR1cmUubWFnRmlsdGVyID0gVEhSRUUuTmVhcmVzdEZpbHRlcjtcclxuICB0aGlzLnRleHR1cmUubWluRmlsdGVyID0gVEhSRUUuTGluZWFyTWlwTWFwTGluZWFyRmlsdGVyO1xyXG4gIHRoaXMubWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBtYXA6IHRoaXMudGV4dHVyZSwgdHJhbnNwYXJlbnQ6IHRydWUgfSk7XHJcbiAgdGhpcy5nZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG4gIHRoaXMubWVzaCA9IG5ldyBUSFJFRS5NZXNoKHRoaXMuZ2VvbWV0cnksIHRoaXMubWF0ZXJpYWwpO1xyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi56ID0gMC4wMDE7XHJcbiAgLy8g44K544Og44O844K444Oz44Kw44KS5YiH44KLXHJcbiAgdGhpcy5jdHgubXNJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICB0aGlzLmN0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICAvL3RoaXMuY3R4LndlYmtpdEltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIHRoaXMuY3R4Lm1vekltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG59XHJcblxyXG4vLy8g44OX44Ot44Kw44Os44K544OQ44O86KGo56S644Kv44Op44K5XHJcbmV4cG9ydCBmdW5jdGlvbiBQcm9ncmVzcygpIHtcclxuICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpOztcclxuICB2YXIgd2lkdGggPSAxO1xyXG4gIHdoaWxlICh3aWR0aCA8PSBnLlZJUlRVQUxfV0lEVEgpe1xyXG4gICAgd2lkdGggKj0gMjtcclxuICB9XHJcbiAgdmFyIGhlaWdodCA9IDE7XHJcbiAgd2hpbGUgKGhlaWdodCA8PSBnLlZJUlRVQUxfSEVJR0hUKXtcclxuICAgIGhlaWdodCAqPSAyO1xyXG4gIH1cclxuICB0aGlzLmNhbnZhcy53aWR0aCA9IHdpZHRoO1xyXG4gIHRoaXMuY2FudmFzLmhlaWdodCA9IGhlaWdodDtcclxuICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgdGhpcy50ZXh0dXJlID0gbmV3IFRIUkVFLlRleHR1cmUodGhpcy5jYW52YXMpO1xyXG4gIHRoaXMudGV4dHVyZS5tYWdGaWx0ZXIgPSBUSFJFRS5OZWFyZXN0RmlsdGVyO1xyXG4gIHRoaXMudGV4dHVyZS5taW5GaWx0ZXIgPSBUSFJFRS5MaW5lYXJNaXBNYXBMaW5lYXJGaWx0ZXI7XHJcbiAgLy8g44K544Og44O844K444Oz44Kw44KS5YiH44KLXHJcbiAgdGhpcy5jdHgubXNJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICB0aGlzLmN0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICAvL3RoaXMuY3R4LndlYmtpdEltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIHRoaXMuY3R4Lm1vekltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG5cclxuICB0aGlzLm1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgbWFwOiB0aGlzLnRleHR1cmUsIHRyYW5zcGFyZW50OiB0cnVlIH0pO1xyXG4gIHRoaXMuZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSh0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuICB0aGlzLm1lc2ggPSBuZXcgVEhSRUUuTWVzaCh0aGlzLmdlb21ldHJ5LCB0aGlzLm1hdGVyaWFsKTtcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueCA9ICh3aWR0aCAtIGcuVklSVFVBTF9XSURUSCkgLyAyO1xyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi55ID0gIC0gKGhlaWdodCAtIGcuVklSVFVBTF9IRUlHSFQpIC8gMjtcclxuXHJcbiAgLy90aGlzLnRleHR1cmUucHJlbXVsdGlwbHlBbHBoYSA9IHRydWU7XHJcbn1cclxuXHJcbi8vLyDjg5fjg63jgrDjg6zjgrnjg5Djg7zjgpLooajnpLrjgZnjgovjgIJcclxuUHJvZ3Jlc3MucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIChtZXNzYWdlLCBwZXJjZW50KSB7XHJcbiAgdmFyIGN0eCA9IHRoaXMuY3R4O1xyXG4gIHZhciB3aWR0aCA9IHRoaXMuY2FudmFzLndpZHRoLCBoZWlnaHQgPSB0aGlzLmNhbnZhcy5oZWlnaHQ7XHJcbiAgLy8gICAgICBjdHguZmlsbFN0eWxlID0gJ3JnYmEoMCwwLDAsMCknO1xyXG4gIGN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcbiAgdmFyIHRleHRXaWR0aCA9IGN0eC5tZWFzdXJlVGV4dChtZXNzYWdlKS53aWR0aDtcclxuICBjdHguc3Ryb2tlU3R5bGUgPSBjdHguZmlsbFN0eWxlID0gJ3JnYmEoMjU1LDI1NSwyNTUsMS4wKSc7XHJcblxyXG4gIGN0eC5maWxsVGV4dChtZXNzYWdlLCAod2lkdGggLSB0ZXh0V2lkdGgpIC8gMiwgMTAwKTtcclxuICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgY3R4LnJlY3QoMjAsIDc1LCB3aWR0aCAtIDIwICogMiwgMTApO1xyXG4gIGN0eC5zdHJva2UoKTtcclxuICBjdHguZmlsbFJlY3QoMjAsIDc1LCAod2lkdGggLSAyMCAqIDIpICogcGVyY2VudCAvIDEwMCwgMTApO1xyXG4gIHRoaXMudGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbn1cclxuXHJcbi8vLyBpbWfjgYvjgonjgrjjgqrjg6Hjg4jjg6rjgpLkvZzmiJDjgZnjgotcclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUdlb21ldHJ5RnJvbUltYWdlKGltYWdlKSB7XHJcbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gIHZhciB3ID0gdGV4dHVyZUZpbGVzLmF1dGhvci50ZXh0dXJlLmltYWdlLndpZHRoO1xyXG4gIHZhciBoID0gdGV4dHVyZUZpbGVzLmF1dGhvci50ZXh0dXJlLmltYWdlLmhlaWdodDtcclxuICBjYW52YXMud2lkdGggPSB3O1xyXG4gIGNhbnZhcy5oZWlnaHQgPSBoO1xyXG4gIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICBjdHguZHJhd0ltYWdlKGltYWdlLCAwLCAwKTtcclxuICB2YXIgZGF0YSA9IGN0eC5nZXRJbWFnZURhdGEoMCwgMCwgdywgaCk7XHJcbiAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkdlb21ldHJ5KCk7XHJcbiAge1xyXG4gICAgdmFyIGkgPSAwO1xyXG5cclxuICAgIGZvciAodmFyIHkgPSAwOyB5IDwgaDsgKyt5KSB7XHJcbiAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgdzsgKyt4KSB7XHJcbiAgICAgICAgdmFyIGNvbG9yID0gbmV3IFRIUkVFLkNvbG9yKCk7XHJcblxyXG4gICAgICAgIHZhciByID0gZGF0YS5kYXRhW2krK107XHJcbiAgICAgICAgdmFyIGcgPSBkYXRhLmRhdGFbaSsrXTtcclxuICAgICAgICB2YXIgYiA9IGRhdGEuZGF0YVtpKytdO1xyXG4gICAgICAgIHZhciBhID0gZGF0YS5kYXRhW2krK107XHJcbiAgICAgICAgaWYgKGEgIT0gMCkge1xyXG4gICAgICAgICAgY29sb3Iuc2V0UkdCKHIgLyAyNTUuMCwgZyAvIDI1NS4wLCBiIC8gMjU1LjApO1xyXG4gICAgICAgICAgdmFyIHZlcnQgPSBuZXcgVEhSRUUuVmVjdG9yMygoKHggLSB3IC8gMi4wKSkgKiAyLjAsICgoeSAtIGggLyAyKSkgKiAtMi4wLCAwLjApO1xyXG4gICAgICAgICAgZ2VvbWV0cnkudmVydGljZXMucHVzaCh2ZXJ0KTtcclxuICAgICAgICAgIGdlb21ldHJ5LmNvbG9ycy5wdXNoKGNvbG9yKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTcHJpdGVHZW9tZXRyeShzaXplKVxyXG57XHJcbiAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkdlb21ldHJ5KCk7XHJcbiAgdmFyIHNpemVIYWxmID0gc2l6ZSAvIDI7XHJcbiAgLy8gZ2VvbWV0cnkuXHJcbiAgZ2VvbWV0cnkudmVydGljZXMucHVzaChuZXcgVEhSRUUuVmVjdG9yMygtc2l6ZUhhbGYsIHNpemVIYWxmLCAwKSk7XHJcbiAgZ2VvbWV0cnkudmVydGljZXMucHVzaChuZXcgVEhSRUUuVmVjdG9yMyhzaXplSGFsZiwgc2l6ZUhhbGYsIDApKTtcclxuICBnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKG5ldyBUSFJFRS5WZWN0b3IzKHNpemVIYWxmLCAtc2l6ZUhhbGYsIDApKTtcclxuICBnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKG5ldyBUSFJFRS5WZWN0b3IzKC1zaXplSGFsZiwgLXNpemVIYWxmLCAwKSk7XHJcbiAgZ2VvbWV0cnkuZmFjZXMucHVzaChuZXcgVEhSRUUuRmFjZTMoMCwgMiwgMSkpO1xyXG4gIGdlb21ldHJ5LmZhY2VzLnB1c2gobmV3IFRIUkVFLkZhY2UzKDAsIDMsIDIpKTtcclxuICByZXR1cm4gZ2VvbWV0cnk7XHJcbn1cclxuXHJcbi8vLyDjg4bjgq/jgrnjg4Hjg6Pjg7zkuIrjga7mjIflrprjgrnjg5fjg6njgqTjg4jjga5VVuW6p+aomeOCkuaxguOCgeOCi1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3ByaXRlVVYoZ2VvbWV0cnksIHRleHR1cmUsIGNlbGxXaWR0aCwgY2VsbEhlaWdodCwgY2VsbE5vKVxyXG57XHJcbiAgdmFyIHdpZHRoID0gdGV4dHVyZS5pbWFnZS53aWR0aDtcclxuICB2YXIgaGVpZ2h0ID0gdGV4dHVyZS5pbWFnZS5oZWlnaHQ7XHJcblxyXG4gIHZhciB1Q2VsbENvdW50ID0gKHdpZHRoIC8gY2VsbFdpZHRoKSB8IDA7XHJcbiAgdmFyIHZDZWxsQ291bnQgPSAoaGVpZ2h0IC8gY2VsbEhlaWdodCkgfCAwO1xyXG4gIHZhciB2UG9zID0gdkNlbGxDb3VudCAtICgoY2VsbE5vIC8gdUNlbGxDb3VudCkgfCAwKTtcclxuICB2YXIgdVBvcyA9IGNlbGxObyAlIHVDZWxsQ291bnQ7XHJcbiAgdmFyIHVVbml0ID0gY2VsbFdpZHRoIC8gd2lkdGg7IFxyXG4gIHZhciB2VW5pdCA9IGNlbGxIZWlnaHQgLyBoZWlnaHQ7XHJcblxyXG4gIGdlb21ldHJ5LmZhY2VWZXJ0ZXhVdnNbMF0ucHVzaChbXHJcbiAgICBuZXcgVEhSRUUuVmVjdG9yMigodVBvcykgKiBjZWxsV2lkdGggLyB3aWR0aCwgKHZQb3MpICogY2VsbEhlaWdodCAvIGhlaWdodCksXHJcbiAgICBuZXcgVEhSRUUuVmVjdG9yMigodVBvcyArIDEpICogY2VsbFdpZHRoIC8gd2lkdGgsICh2UG9zIC0gMSkgKiBjZWxsSGVpZ2h0IC8gaGVpZ2h0KSxcclxuICAgIG5ldyBUSFJFRS5WZWN0b3IyKCh1UG9zICsgMSkgKiBjZWxsV2lkdGggLyB3aWR0aCwgKHZQb3MpICogY2VsbEhlaWdodCAvIGhlaWdodClcclxuICBdKTtcclxuICBnZW9tZXRyeS5mYWNlVmVydGV4VXZzWzBdLnB1c2goW1xyXG4gICAgbmV3IFRIUkVFLlZlY3RvcjIoKHVQb3MpICogY2VsbFdpZHRoIC8gd2lkdGgsICh2UG9zKSAqIGNlbGxIZWlnaHQgLyBoZWlnaHQpLFxyXG4gICAgbmV3IFRIUkVFLlZlY3RvcjIoKHVQb3MpICogY2VsbFdpZHRoIC8gd2lkdGgsICh2UG9zIC0gMSkgKiBjZWxsSGVpZ2h0IC8gaGVpZ2h0KSxcclxuICAgIG5ldyBUSFJFRS5WZWN0b3IyKCh1UG9zICsgMSkgKiBjZWxsV2lkdGggLyB3aWR0aCwgKHZQb3MgLSAxKSAqIGNlbGxIZWlnaHQgLyBoZWlnaHQpXHJcbiAgXSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVTcHJpdGVVVihnZW9tZXRyeSwgdGV4dHVyZSwgY2VsbFdpZHRoLCBjZWxsSGVpZ2h0LCBjZWxsTm8pXHJcbntcclxuICB2YXIgd2lkdGggPSB0ZXh0dXJlLmltYWdlLndpZHRoO1xyXG4gIHZhciBoZWlnaHQgPSB0ZXh0dXJlLmltYWdlLmhlaWdodDtcclxuXHJcbiAgdmFyIHVDZWxsQ291bnQgPSAod2lkdGggLyBjZWxsV2lkdGgpIHwgMDtcclxuICB2YXIgdkNlbGxDb3VudCA9IChoZWlnaHQgLyBjZWxsSGVpZ2h0KSB8IDA7XHJcbiAgdmFyIHZQb3MgPSB2Q2VsbENvdW50IC0gKChjZWxsTm8gLyB1Q2VsbENvdW50KSB8IDApO1xyXG4gIHZhciB1UG9zID0gY2VsbE5vICUgdUNlbGxDb3VudDtcclxuICB2YXIgdVVuaXQgPSBjZWxsV2lkdGggLyB3aWR0aDtcclxuICB2YXIgdlVuaXQgPSBjZWxsSGVpZ2h0IC8gaGVpZ2h0O1xyXG4gIHZhciB1dnMgPSBnZW9tZXRyeS5mYWNlVmVydGV4VXZzWzBdWzBdO1xyXG5cclxuICB1dnNbMF0ueCA9ICh1UG9zKSAqIHVVbml0O1xyXG4gIHV2c1swXS55ID0gKHZQb3MpICogdlVuaXQ7XHJcbiAgdXZzWzFdLnggPSAodVBvcyArIDEpICogdVVuaXQ7XHJcbiAgdXZzWzFdLnkgPSAodlBvcyAtIDEpICogdlVuaXQ7XHJcbiAgdXZzWzJdLnggPSAodVBvcyArIDEpICogdVVuaXQ7XHJcbiAgdXZzWzJdLnkgPSAodlBvcykgKiB2VW5pdDtcclxuXHJcbiAgdXZzID0gZ2VvbWV0cnkuZmFjZVZlcnRleFV2c1swXVsxXTtcclxuXHJcbiAgdXZzWzBdLnggPSAodVBvcykgKiB1VW5pdDtcclxuICB1dnNbMF0ueSA9ICh2UG9zKSAqIHZVbml0O1xyXG4gIHV2c1sxXS54ID0gKHVQb3MpICogdVVuaXQ7XHJcbiAgdXZzWzFdLnkgPSAodlBvcyAtIDEpICogdlVuaXQ7XHJcbiAgdXZzWzJdLnggPSAodVBvcyArIDEpICogdVVuaXQ7XHJcbiAgdXZzWzJdLnkgPSAodlBvcyAtIDEpICogdlVuaXQ7XHJcblxyXG4gXHJcbiAgZ2VvbWV0cnkudXZzTmVlZFVwZGF0ZSA9IHRydWU7XHJcblxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3ByaXRlTWF0ZXJpYWwodGV4dHVyZSlcclxue1xyXG4gIC8vIOODoeODg+OCt+ODpeOBruS9nOaIkOODu+ihqOekuiAvLy9cclxuICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBtYXA6IHRleHR1cmUgLyosZGVwdGhUZXN0OnRydWUqLywgdHJhbnNwYXJlbnQ6IHRydWUgfSk7XHJcbiAgbWF0ZXJpYWwuc2hhZGluZyA9IFRIUkVFLkZsYXRTaGFkaW5nO1xyXG4gIG1hdGVyaWFsLnNpZGUgPSBUSFJFRS5Gcm9udFNpZGU7XHJcbiAgbWF0ZXJpYWwuYWxwaGFUZXN0ID0gMC41O1xyXG4gIG1hdGVyaWFsLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuLy8gIG1hdGVyaWFsLlxyXG4gIHJldHVybiBtYXRlcmlhbDtcclxufVxyXG5cclxuXHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgKiBhcyBzZmcgZnJvbSAnLi9nbG9iYWwnOyBcclxuXHJcbi8vIOOCreODvOWFpeWKm1xyXG5leHBvcnQgY2xhc3MgQmFzaWNJbnB1dHtcclxuY29uc3RydWN0b3IgKCkge1xyXG4gIHRoaXMua2V5Q2hlY2sgPSB7IHVwOiBmYWxzZSwgZG93bjogZmFsc2UsIGxlZnQ6IGZhbHNlLCByaWdodDogZmFsc2UsIHo6IGZhbHNlICx4OmZhbHNlfTtcclxuICB0aGlzLmtleUJ1ZmZlciA9IFtdO1xyXG4gIHRoaXMua2V5dXBfID0gbnVsbDtcclxuICB0aGlzLmtleWRvd25fID0gbnVsbDtcclxuICAvL3RoaXMuZ2FtZXBhZENoZWNrID0geyB1cDogZmFsc2UsIGRvd246IGZhbHNlLCBsZWZ0OiBmYWxzZSwgcmlnaHQ6IGZhbHNlLCB6OiBmYWxzZSAseDpmYWxzZX07XHJcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2dhbWVwYWRjb25uZWN0ZWQnLChlKT0+e1xyXG4gICAgdGhpcy5nYW1lcGFkID0gZS5nYW1lcGFkO1xyXG4gIH0pO1xyXG4gXHJcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2dhbWVwYWRkaXNjb25uZWN0ZWQnLChlKT0+e1xyXG4gICAgZGVsZXRlIHRoaXMuZ2FtZXBhZDtcclxuICB9KTsgXHJcbiBcclxuIGlmKHdpbmRvdy5uYXZpZ2F0b3IuZ2V0R2FtZXBhZHMpe1xyXG4gICB0aGlzLmdhbWVwYWQgPSB3aW5kb3cubmF2aWdhdG9yLmdldEdhbWVwYWRzKClbMF07XHJcbiB9IFxyXG59XHJcblxyXG4gIGNsZWFyKClcclxuICB7XHJcbiAgICBmb3IodmFyIGQgaW4gdGhpcy5rZXlDaGVjayl7XHJcbiAgICAgIHRoaXMua2V5Q2hlY2tbZF0gPSBmYWxzZTtcclxuICAgIH1cclxuICAgIHRoaXMua2V5QnVmZmVyLmxlbmd0aCA9IDA7XHJcbiAgfVxyXG4gIFxyXG4gIGtleWRvd24oZSkge1xyXG4gICAgdmFyIGUgPSBkMy5ldmVudDtcclxuICAgIHZhciBrZXlCdWZmZXIgPSB0aGlzLmtleUJ1ZmZlcjtcclxuICAgIHZhciBrZXlDaGVjayA9IHRoaXMua2V5Q2hlY2s7XHJcbiAgICB2YXIgaGFuZGxlID0gdHJ1ZTtcclxuICAgICBcclxuICAgIGlmIChrZXlCdWZmZXIubGVuZ3RoID4gMTYpIHtcclxuICAgICAga2V5QnVmZmVyLnNoaWZ0KCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGlmIChlLmtleUNvZGUgPT0gODAgLyogUCAqLykge1xyXG4gICAgICBpZiAoIXNmZy5wYXVzZSkge1xyXG4gICAgICAgIHNmZy5nYW1lLnBhdXNlKCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc2ZnLmdhbWUucmVzdW1lKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgICAgICAgIFxyXG4gICAga2V5QnVmZmVyLnB1c2goZS5rZXlDb2RlKTtcclxuICAgIHN3aXRjaCAoZS5rZXlDb2RlKSB7XHJcbiAgICAgIGNhc2UgNzQ6XHJcbiAgICAgIGNhc2UgMzc6XHJcbiAgICAgIGNhc2UgMTAwOlxyXG4gICAgICAgIGtleUNoZWNrLmxlZnQgPSB0cnVlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgNzM6XHJcbiAgICAgIGNhc2UgMzg6XHJcbiAgICAgIGNhc2UgMTA0OlxyXG4gICAgICAgIGtleUNoZWNrLnVwID0gdHJ1ZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDc2OlxyXG4gICAgICBjYXNlIDM5OlxyXG4gICAgICBjYXNlIDEwMjpcclxuICAgICAgICBrZXlDaGVjay5yaWdodCA9IHRydWU7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA3NTpcclxuICAgICAgY2FzZSA0MDpcclxuICAgICAgY2FzZSA5ODpcclxuICAgICAgICBrZXlDaGVjay5kb3duID0gdHJ1ZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDkwOlxyXG4gICAgICAgIGtleUNoZWNrLnogPSB0cnVlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgODg6XHJcbiAgICAgICAga2V5Q2hlY2sueCA9IHRydWU7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIGlmIChoYW5kbGUpIHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICBlLnJldHVyblZhbHVlID0gZmFsc2U7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAga2V5dXAoKSB7XHJcbiAgICB2YXIgZSA9IGQzLmV2ZW50O1xyXG4gICAgdmFyIGtleUJ1ZmZlciA9IHRoaXMua2V5QnVmZmVyO1xyXG4gICAgdmFyIGtleUNoZWNrID0gdGhpcy5rZXlDaGVjaztcclxuICAgIHZhciBoYW5kbGUgPSBmYWxzZTtcclxuICAgIHN3aXRjaCAoZS5rZXlDb2RlKSB7XHJcbiAgICAgIGNhc2UgNzQ6XHJcbiAgICAgIGNhc2UgMzc6XHJcbiAgICAgIGNhc2UgMTAwOlxyXG4gICAgICAgIGtleUNoZWNrLmxlZnQgPSBmYWxzZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDczOlxyXG4gICAgICBjYXNlIDM4OlxyXG4gICAgICBjYXNlIDEwNDpcclxuICAgICAgICBrZXlDaGVjay51cCA9IGZhbHNlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgNzY6XHJcbiAgICAgIGNhc2UgMzk6XHJcbiAgICAgIGNhc2UgMTAyOlxyXG4gICAgICAgIGtleUNoZWNrLnJpZ2h0ID0gZmFsc2U7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA3NTpcclxuICAgICAgY2FzZSA0MDpcclxuICAgICAgY2FzZSA5ODpcclxuICAgICAgICBrZXlDaGVjay5kb3duID0gZmFsc2U7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA5MDpcclxuICAgICAgICBrZXlDaGVjay56ID0gZmFsc2U7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA4ODpcclxuICAgICAgICBrZXlDaGVjay54ID0gZmFsc2U7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIGlmIChoYW5kbGUpIHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICBlLnJldHVyblZhbHVlID0gZmFsc2U7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcbiAgLy/jgqTjg5njg7Pjg4jjgavjg5DjgqTjg7Pjg4njgZnjgotcclxuICBiaW5kKClcclxuICB7XHJcbiAgICBkMy5zZWxlY3QoJ2JvZHknKS5vbigna2V5ZG93bi5iYXNpY0lucHV0Jyx0aGlzLmtleWRvd24uYmluZCh0aGlzKSk7XHJcbiAgICBkMy5zZWxlY3QoJ2JvZHknKS5vbigna2V5dXAuYmFzaWNJbnB1dCcsdGhpcy5rZXl1cC5iaW5kKHRoaXMpKTtcclxuICB9XHJcbiAgLy8g44Ki44Oz44OQ44Kk44Oz44OJ44GZ44KLXHJcbiAgdW5iaW5kKClcclxuICB7XHJcbiAgICBkMy5zZWxlY3QoJ2JvZHknKS5vbigna2V5ZG93bi5iYXNpY0lucHV0JyxudWxsKTtcclxuICAgIGQzLnNlbGVjdCgnYm9keScpLm9uKCdrZXl1cC5iYXNpY0lucHV0JyxudWxsKTtcclxuICB9XHJcbiAgXHJcbiAgZ2V0IHVwKCkge1xyXG4gICAgcmV0dXJuIHRoaXMua2V5Q2hlY2sudXAgfHwgKHRoaXMuZ2FtZXBhZCAmJiAodGhpcy5nYW1lcGFkLmJ1dHRvbnNbMTJdLnByZXNzZWQgfHwgdGhpcy5nYW1lcGFkLmF4ZXNbMV0gPCAtMC4xKSk7XHJcbiAgfVxyXG5cclxuICBnZXQgZG93bigpIHtcclxuICAgIHJldHVybiB0aGlzLmtleUNoZWNrLmRvd24gfHwgKHRoaXMuZ2FtZXBhZCAmJiAodGhpcy5nYW1lcGFkLmJ1dHRvbnNbMTNdLnByZXNzZWQgfHwgdGhpcy5nYW1lcGFkLmF4ZXNbMV0gPiAwLjEpKTtcclxuICB9XHJcblxyXG4gIGdldCBsZWZ0KCkge1xyXG4gICAgcmV0dXJuIHRoaXMua2V5Q2hlY2subGVmdCB8fCAodGhpcy5nYW1lcGFkICYmICh0aGlzLmdhbWVwYWQuYnV0dG9uc1sxNF0ucHJlc3NlZCB8fCB0aGlzLmdhbWVwYWQuYXhlc1swXSA8IC0wLjEpKTtcclxuICB9XHJcblxyXG4gIGdldCByaWdodCgpIHtcclxuICAgIHJldHVybiB0aGlzLmtleUNoZWNrLnJpZ2h0IHx8ICh0aGlzLmdhbWVwYWQgJiYgKHRoaXMuZ2FtZXBhZC5idXR0b25zWzE1XS5wcmVzc2VkIHx8IHRoaXMuZ2FtZXBhZC5heGVzWzBdID4gMC4xKSk7XHJcbiAgfVxyXG4gIFxyXG4gIGdldCB6KCkge1xyXG4gICAgIGxldCByZXQgPSB0aGlzLmtleUNoZWNrLnogXHJcbiAgICB8fCAoKCghdGhpcy56QnV0dG9uIHx8ICh0aGlzLnpCdXR0b24gJiYgIXRoaXMuekJ1dHRvbikgKSAmJiB0aGlzLmdhbWVwYWQgJiYgdGhpcy5nYW1lcGFkLmJ1dHRvbnNbMF0ucHJlc3NlZCkpIDtcclxuICAgIHRoaXMuekJ1dHRvbiA9IHRoaXMuZ2FtZXBhZCAmJiB0aGlzLmdhbWVwYWQuYnV0dG9uc1swXS5wcmVzc2VkO1xyXG4gICAgcmV0dXJuIHJldDtcclxuICB9XHJcbiAgXHJcbiAgZ2V0IHN0YXJ0KCkge1xyXG4gICAgbGV0IHJldCA9ICgoIXRoaXMuc3RhcnRCdXR0b25fIHx8ICh0aGlzLnN0YXJ0QnV0dG9uXyAmJiAhdGhpcy5zdGFydEJ1dHRvbl8pICkgJiYgdGhpcy5nYW1lcGFkICYmIHRoaXMuZ2FtZXBhZC5idXR0b25zWzldLnByZXNzZWQpIDtcclxuICAgIHRoaXMuc3RhcnRCdXR0b25fID0gdGhpcy5nYW1lcGFkICYmIHRoaXMuZ2FtZXBhZC5idXR0b25zWzldLnByZXNzZWQ7XHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH1cclxuICBcclxuICBnZXQgYUJ1dHRvbigpe1xyXG4gICAgIGxldCByZXQgPSAoKCghdGhpcy5hQnV0dG9uXyB8fCAodGhpcy5hQnV0dG9uXyAmJiAhdGhpcy5hQnV0dG9uXykgKSAmJiB0aGlzLmdhbWVwYWQgJiYgdGhpcy5nYW1lcGFkLmJ1dHRvbnNbMF0ucHJlc3NlZCkpIDtcclxuICAgIHRoaXMuYUJ1dHRvbl8gPSB0aGlzLmdhbWVwYWQgJiYgdGhpcy5nYW1lcGFkLmJ1dHRvbnNbMF0ucHJlc3NlZDtcclxuICAgIHJldHVybiByZXQ7XHJcbiAgfVxyXG4gIFxyXG4gICp1cGRhdGUodGFza0luZGV4KVxyXG4gIHtcclxuICAgIHdoaWxlKHRhc2tJbmRleCA+PSAwKXtcclxuICAgICAgaWYod2luZG93Lm5hdmlnYXRvci5nZXRHYW1lcGFkcyl7XHJcbiAgICAgICAgdGhpcy5nYW1lcGFkID0gd2luZG93Lm5hdmlnYXRvci5nZXRHYW1lcGFkcygpWzBdO1xyXG4gICAgICB9IFxyXG4gICAgICB0YXNrSW5kZXggPSB5aWVsZDsgICAgIFxyXG4gICAgfVxyXG4gIH1cclxufSIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuaW1wb3J0ICogYXMgc2ZnIGZyb20gJy4vZ2xvYmFsJztcclxuaW1wb3J0ICogYXMgZ2FtZW9iaiBmcm9tICcuL2dhbWVvYmonO1xyXG5pbXBvcnQgKiBhcyBncmFwaGljcyBmcm9tICcuL2dyYXBoaWNzJztcclxuXHJcbnZhciBteUJ1bGxldHMgPSBbXTtcclxuXHJcbi8vLyDoh6rmqZ/lvL4gXHJcbmV4cG9ydCBjbGFzcyBNeUJ1bGxldCBleHRlbmRzIGdhbWVvYmouR2FtZU9iaiB7XHJcbiAgY29uc3RydWN0b3Ioc2NlbmUsc2UpIHtcclxuICBzdXBlcigwLCAwLCAwKTtcclxuXHJcbiAgdGhpcy5jb2xsaXNpb25BcmVhLndpZHRoID0gNDtcclxuICB0aGlzLmNvbGxpc2lvbkFyZWEuaGVpZ2h0ID0gNjtcclxuICB0aGlzLnNwZWVkID0gODtcclxuICB0aGlzLnBvd2VyID0gMTtcclxuXHJcbiAgdGhpcy50ZXh0dXJlV2lkdGggPSBzZmcudGV4dHVyZUZpbGVzLm15c2hpcC5pbWFnZS53aWR0aDtcclxuICB0aGlzLnRleHR1cmVIZWlnaHQgPSBzZmcudGV4dHVyZUZpbGVzLm15c2hpcC5pbWFnZS5oZWlnaHQ7XHJcblxyXG4gIC8vIOODoeODg+OCt+ODpeOBruS9nOaIkOODu+ihqOekuiAvLy9cclxuXHJcbiAgdmFyIG1hdGVyaWFsID0gZ3JhcGhpY3MuY3JlYXRlU3ByaXRlTWF0ZXJpYWwoc2ZnLnRleHR1cmVGaWxlcy5teXNoaXApO1xyXG4gIHZhciBnZW9tZXRyeSA9IGdyYXBoaWNzLmNyZWF0ZVNwcml0ZUdlb21ldHJ5KDE2KTtcclxuICBncmFwaGljcy5jcmVhdGVTcHJpdGVVVihnZW9tZXRyeSwgc2ZnLnRleHR1cmVGaWxlcy5teXNoaXAsIDE2LCAxNiwgMSk7XHJcbiAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuXHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnggPSB0aGlzLnhfO1xyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi55ID0gdGhpcy55XztcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueiA9IHRoaXMuel87XHJcbiAgdGhpcy5zZSA9IHNlO1xyXG4gIC8vc2UoMCk7XHJcbiAgLy9zZXF1ZW5jZXIucGxheVRyYWNrcyhzb3VuZEVmZmVjdHMuc291bmRFZmZlY3RzWzBdKTtcclxuICBzY2VuZS5hZGQodGhpcy5tZXNoKTtcclxuICB0aGlzLm1lc2gudmlzaWJsZSA9IHRoaXMuZW5hYmxlXyA9IGZhbHNlO1xyXG4gIC8vICBzZmcudGFza3MucHVzaFRhc2soZnVuY3Rpb24gKHRhc2tJbmRleCkgeyBzZWxmLm1vdmUodGFza0luZGV4KTsgfSk7XHJcbiB9XHJcblxyXG4gIGdldCB4KCkgeyByZXR1cm4gdGhpcy54XzsgfVxyXG4gIHNldCB4KHYpIHsgdGhpcy54XyA9IHRoaXMubWVzaC5wb3NpdGlvbi54ID0gdjsgfVxyXG4gIGdldCB5KCkgeyByZXR1cm4gdGhpcy55XzsgfVxyXG4gIHNldCB5KHYpIHsgdGhpcy55XyA9IHRoaXMubWVzaC5wb3NpdGlvbi55ID0gdjsgfVxyXG4gIGdldCB6KCkgeyByZXR1cm4gdGhpcy56XzsgfVxyXG4gIHNldCB6KHYpIHsgdGhpcy56XyA9IHRoaXMubWVzaC5wb3NpdGlvbi56ID0gdjsgfVxyXG4gICptb3ZlKHRhc2tJbmRleCkge1xyXG4gICAgXHJcbiAgICB3aGlsZSAodGFza0luZGV4ID49IDAgXHJcbiAgICAgICYmIHRoaXMuZW5hYmxlX1xyXG4gICAgICAmJiB0aGlzLnkgPD0gKHNmZy5WX1RPUCArIDE2KSBcclxuICAgICAgJiYgdGhpcy55ID49IChzZmcuVl9CT1RUT00gLSAxNikgXHJcbiAgICAgICYmIHRoaXMueCA8PSAoc2ZnLlZfUklHSFQgKyAxNikgXHJcbiAgICAgICYmIHRoaXMueCA+PSAoc2ZnLlZfTEVGVCAtIDE2KSlcclxuICAgIHtcclxuICAgICAgXHJcbiAgICAgIHRoaXMueSArPSB0aGlzLmR5O1xyXG4gICAgICB0aGlzLnggKz0gdGhpcy5keDtcclxuICAgICAgXHJcbiAgICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gICAgfVxyXG5cclxuICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gICAgc2ZnLnRhc2tzLnJlbW92ZVRhc2sodGFza0luZGV4KTtcclxuICAgIHRoaXMuZW5hYmxlXyA9IHRoaXMubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcbn1cclxuXHJcbiAgc3RhcnQoeCwgeSwgeiwgYWltUmFkaWFuLHBvd2VyKSB7XHJcbiAgICBpZiAodGhpcy5lbmFibGVfKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHRoaXMueCA9IHg7XHJcbiAgICB0aGlzLnkgPSB5O1xyXG4gICAgdGhpcy56ID0geiAtIDAuMTtcclxuICAgIHRoaXMucG93ZXIgPSBwb3dlciB8IDE7XHJcbiAgICB0aGlzLmR4ID0gTWF0aC5jb3MoYWltUmFkaWFuKSAqIHRoaXMuc3BlZWQ7XHJcbiAgICB0aGlzLmR5ID0gTWF0aC5zaW4oYWltUmFkaWFuKSAqIHRoaXMuc3BlZWQ7XHJcbiAgICB0aGlzLmVuYWJsZV8gPSB0aGlzLm1lc2gudmlzaWJsZSA9IHRydWU7XHJcbiAgICB0aGlzLnNlKDApO1xyXG4gICAgLy9zZXF1ZW5jZXIucGxheVRyYWNrcyhzb3VuZEVmZmVjdHMuc291bmRFZmZlY3RzWzBdKTtcclxuICAgIHRoaXMudGFzayA9IHNmZy50YXNrcy5wdXNoVGFzayh0aGlzLm1vdmUuYmluZCh0aGlzKSk7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDoh6rmqZ/jgqrjg5bjgrjjgqfjgq/jg4hcclxuZXhwb3J0IGNsYXNzIE15U2hpcCBleHRlbmRzIGdhbWVvYmouR2FtZU9iaiB7IFxyXG4gIGNvbnN0cnVjdG9yKHgsIHksIHosc2NlbmUsc2UpIHtcclxuICBzdXBlcih4LCB5LCB6KTsvLyBleHRlbmRcclxuXHJcbiAgdGhpcy5jb2xsaXNpb25BcmVhLndpZHRoID0gNjtcclxuICB0aGlzLmNvbGxpc2lvbkFyZWEuaGVpZ2h0ID0gODtcclxuICB0aGlzLnNlID0gc2U7XHJcbiAgdGhpcy5zY2VuZSA9IHNjZW5lO1xyXG4gIHRoaXMudGV4dHVyZVdpZHRoID0gc2ZnLnRleHR1cmVGaWxlcy5teXNoaXAuaW1hZ2Uud2lkdGg7XHJcbiAgdGhpcy50ZXh0dXJlSGVpZ2h0ID0gc2ZnLnRleHR1cmVGaWxlcy5teXNoaXAuaW1hZ2UuaGVpZ2h0O1xyXG4gIHRoaXMud2lkdGggPSAxNjtcclxuICB0aGlzLmhlaWdodCA9IDE2O1xyXG5cclxuICAvLyDnp7vli5Xnr4Tlm7LjgpLmsYLjgoHjgotcclxuICB0aGlzLnRvcCA9IChzZmcuVl9UT1AgLSB0aGlzLmhlaWdodCAvIDIpIHwgMDtcclxuICB0aGlzLmJvdHRvbSA9IChzZmcuVl9CT1RUT00gKyB0aGlzLmhlaWdodCAvIDIpIHwgMDtcclxuICB0aGlzLmxlZnQgPSAoc2ZnLlZfTEVGVCArIHRoaXMud2lkdGggLyAyKSB8IDA7XHJcbiAgdGhpcy5yaWdodCA9IChzZmcuVl9SSUdIVCAtIHRoaXMud2lkdGggLyAyKSB8IDA7XHJcblxyXG4gIC8vIOODoeODg+OCt+ODpeOBruS9nOaIkOODu+ihqOekulxyXG4gIC8vIOODnuODhuODquOCouODq+OBruS9nOaIkFxyXG4gIHZhciBtYXRlcmlhbCA9IGdyYXBoaWNzLmNyZWF0ZVNwcml0ZU1hdGVyaWFsKHNmZy50ZXh0dXJlRmlsZXMubXlzaGlwKTtcclxuICAvLyDjgrjjgqrjg6Hjg4jjg6rjga7kvZzmiJBcclxuICB2YXIgZ2VvbWV0cnkgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVHZW9tZXRyeSh0aGlzLndpZHRoKTtcclxuICBncmFwaGljcy5jcmVhdGVTcHJpdGVVVihnZW9tZXRyeSwgc2ZnLnRleHR1cmVGaWxlcy5teXNoaXAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCAwKTtcclxuXHJcbiAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuXHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnggPSB0aGlzLnhfO1xyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi55ID0gdGhpcy55XztcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueiA9IHRoaXMuel87XHJcbiAgdGhpcy5yZXN0ID0gMztcclxuICB0aGlzLm15QnVsbGV0cyA9ICggKCk9PiB7XHJcbiAgICB2YXIgYXJyID0gW107XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDI7ICsraSkge1xyXG4gICAgICBhcnIucHVzaChuZXcgTXlCdWxsZXQodGhpcy5zY2VuZSx0aGlzLnNlKSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXJyO1xyXG4gIH0pKCk7XHJcbiAgc2NlbmUuYWRkKHRoaXMubWVzaCk7XHJcbiAgXHJcbiAgdGhpcy5idWxsZXRQb3dlciA9IDE7XHJcblxyXG59XHJcbiAgZ2V0IHgoKSB7IHJldHVybiB0aGlzLnhfOyB9XHJcbiAgc2V0IHgodikgeyB0aGlzLnhfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnggPSB2OyB9XHJcbiAgZ2V0IHkoKSB7IHJldHVybiB0aGlzLnlfOyB9XHJcbiAgc2V0IHkodikgeyB0aGlzLnlfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnkgPSB2OyB9XHJcbiAgZ2V0IHooKSB7IHJldHVybiB0aGlzLnpfOyB9XHJcbiAgc2V0IHoodikgeyB0aGlzLnpfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnogPSB2OyB9XHJcbiAgXHJcbiAgc2hvb3QoYWltUmFkaWFuKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gdGhpcy5teUJ1bGxldHMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgaWYgKHRoaXMubXlCdWxsZXRzW2ldLnN0YXJ0KHRoaXMueCwgdGhpcy55ICwgdGhpcy56LGFpbVJhZGlhbix0aGlzLmJ1bGxldFBvd2VyKSkge1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIGFjdGlvbihiYXNpY0lucHV0KSB7XHJcbiAgICBpZiAoYmFzaWNJbnB1dC5sZWZ0KSB7XHJcbiAgICAgIGlmICh0aGlzLnggPiB0aGlzLmxlZnQpIHtcclxuICAgICAgICB0aGlzLnggLT0gMjtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChiYXNpY0lucHV0LnJpZ2h0KSB7XHJcbiAgICAgIGlmICh0aGlzLnggPCB0aGlzLnJpZ2h0KSB7XHJcbiAgICAgICAgdGhpcy54ICs9IDI7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoYmFzaWNJbnB1dC51cCkge1xyXG4gICAgICBpZiAodGhpcy55IDwgdGhpcy50b3ApIHtcclxuICAgICAgICB0aGlzLnkgKz0gMjtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChiYXNpY0lucHV0LmRvd24pIHtcclxuICAgICAgaWYgKHRoaXMueSA+IHRoaXMuYm90dG9tKSB7XHJcbiAgICAgICAgdGhpcy55IC09IDI7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcblxyXG4gICAgaWYgKGJhc2ljSW5wdXQueikge1xyXG4gICAgICBiYXNpY0lucHV0LmtleUNoZWNrLnogPSBmYWxzZTtcclxuICAgICAgdGhpcy5zaG9vdCgwLjUgKiBNYXRoLlBJKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoYmFzaWNJbnB1dC54KSB7XHJcbiAgICAgIGJhc2ljSW5wdXQua2V5Q2hlY2sueCA9IGZhbHNlO1xyXG4gICAgICB0aGlzLnNob290KDEuNSAqIE1hdGguUEkpO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBoaXQoKSB7XHJcbiAgICB0aGlzLm1lc2gudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgc2ZnLmJvbWJzLnN0YXJ0KHRoaXMueCwgdGhpcy55LCAwLjIpO1xyXG4gICAgdGhpcy5zZSg0KTtcclxuICB9XHJcbiAgXHJcbiAgcmVzZXQoKXtcclxuICAgIHRoaXMubXlCdWxsZXRzLmZvckVhY2goKGQpPT57XHJcbiAgICAgIGlmKGQuZW5hYmxlXyl7XHJcbiAgICAgICAgd2hpbGUoIXNmZy50YXNrcy5hcnJheVtkLnRhc2suaW5kZXhdLmdlbkluc3QubmV4dCgtKDEgKyBkLnRhc2suaW5kZXgpKS5kb25lKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIFxyXG4gIGluaXQoKXtcclxuICAgICAgdGhpcy54ID0gMDtcclxuICAgICAgdGhpcy55ID0gLTEwMDtcclxuICAgICAgdGhpcy56ID0gMC4xO1xyXG4gICAgICB0aGlzLm1lc2gudmlzaWJsZSA9IHRydWU7XHJcbiAgfVxyXG5cclxufSIsIlwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgKiBhcyBzZmcgZnJvbSAnLi9nbG9iYWwnO1xyXG4vL2ltcG9ydCAqICBhcyBnYW1lb2JqIGZyb20gJy4vZ2FtZW9iaic7XHJcbi8vaW1wb3J0ICogYXMgZ3JhcGhpY3MgZnJvbSAnLi9ncmFwaGljcyc7XHJcblxyXG4vLy8g44OG44Kt44K544OI5bGe5oCnXHJcbmV4cG9ydCBjbGFzcyBUZXh0QXR0cmlidXRlIHtcclxuICBjb25zdHJ1Y3RvcihibGluaywgZm9udCkge1xyXG4gICAgaWYgKGJsaW5rKSB7XHJcbiAgICAgIHRoaXMuYmxpbmsgPSBibGluaztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuYmxpbmsgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIGlmIChmb250KSB7XHJcbiAgICAgIHRoaXMuZm9udCA9IGZvbnQ7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmZvbnQgPSBzZmcudGV4dHVyZUZpbGVzLmZvbnQ7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g44OG44Kt44K544OI44OX44Os44O844OzXHJcbmV4cG9ydCBjbGFzcyBUZXh0UGxhbmV7IFxyXG4gIGNvbnN0cnVjdG9yIChzY2VuZSkge1xyXG4gIHRoaXMudGV4dEJ1ZmZlciA9IG5ldyBBcnJheShzZmcuVEVYVF9IRUlHSFQpO1xyXG4gIHRoaXMuYXR0ckJ1ZmZlciA9IG5ldyBBcnJheShzZmcuVEVYVF9IRUlHSFQpO1xyXG4gIHRoaXMudGV4dEJhY2tCdWZmZXIgPSBuZXcgQXJyYXkoc2ZnLlRFWFRfSEVJR0hUKTtcclxuICB0aGlzLmF0dHJCYWNrQnVmZmVyID0gbmV3IEFycmF5KHNmZy5URVhUX0hFSUdIVCk7XHJcbiAgdmFyIGVuZGkgPSB0aGlzLnRleHRCdWZmZXIubGVuZ3RoO1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZW5kaTsgKytpKSB7XHJcbiAgICB0aGlzLnRleHRCdWZmZXJbaV0gPSBuZXcgQXJyYXkoc2ZnLlRFWFRfV0lEVEgpO1xyXG4gICAgdGhpcy5hdHRyQnVmZmVyW2ldID0gbmV3IEFycmF5KHNmZy5URVhUX1dJRFRIKTtcclxuICAgIHRoaXMudGV4dEJhY2tCdWZmZXJbaV0gPSBuZXcgQXJyYXkoc2ZnLlRFWFRfV0lEVEgpO1xyXG4gICAgdGhpcy5hdHRyQmFja0J1ZmZlcltpXSA9IG5ldyBBcnJheShzZmcuVEVYVF9XSURUSCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLy8g5o+P55S755So44Kt44Oj44Oz44OQ44K544Gu44K744OD44OI44Ki44OD44OXXHJcblxyXG4gIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgdmFyIHdpZHRoID0gMTtcclxuICB3aGlsZSAod2lkdGggPD0gc2ZnLlZJUlRVQUxfV0lEVEgpe1xyXG4gICAgd2lkdGggKj0gMjtcclxuICB9XHJcbiAgdmFyIGhlaWdodCA9IDE7XHJcbiAgd2hpbGUgKGhlaWdodCA8PSBzZmcuVklSVFVBTF9IRUlHSFQpe1xyXG4gICAgaGVpZ2h0ICo9IDI7XHJcbiAgfVxyXG4gIFxyXG4gIHRoaXMuY2FudmFzLndpZHRoID0gd2lkdGg7XHJcbiAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG4gIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICB0aGlzLnRleHR1cmUgPSBuZXcgVEhSRUUuVGV4dHVyZSh0aGlzLmNhbnZhcyk7XHJcbiAgdGhpcy50ZXh0dXJlLm1hZ0ZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XHJcbiAgdGhpcy50ZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLkxpbmVhck1pcE1hcExpbmVhckZpbHRlcjtcclxuICB0aGlzLm1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgbWFwOiB0aGlzLnRleHR1cmUsYWxwaGFUZXN0OjAuNSwgdHJhbnNwYXJlbnQ6IHRydWUsZGVwdGhUZXN0OnRydWUsc2hhZGluZzpUSFJFRS5GbGF0U2hhZGluZ30pO1xyXG4vLyAgdGhpcy5nZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KHNmZy5WSVJUVUFMX1dJRFRILCBzZmcuVklSVFVBTF9IRUlHSFQpO1xyXG4gIHRoaXMuZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSh3aWR0aCwgaGVpZ2h0KTtcclxuICB0aGlzLm1lc2ggPSBuZXcgVEhSRUUuTWVzaCh0aGlzLmdlb21ldHJ5LCB0aGlzLm1hdGVyaWFsKTtcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueiA9IDAuNDtcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueCA9ICh3aWR0aCAtIHNmZy5WSVJUVUFMX1dJRFRIKSAvIDI7XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnkgPSAgLSAoaGVpZ2h0IC0gc2ZnLlZJUlRVQUxfSEVJR0hUKSAvIDI7XHJcbiAgdGhpcy5mb250cyA9IHsgZm9udDogc2ZnLnRleHR1cmVGaWxlcy5mb250LCBmb250MTogc2ZnLnRleHR1cmVGaWxlcy5mb250MSB9O1xyXG4gIHRoaXMuYmxpbmtDb3VudCA9IDA7XHJcbiAgdGhpcy5ibGluayA9IGZhbHNlO1xyXG5cclxuICAvLyDjgrnjg6Djg7zjgrjjg7PjgrDjgpLliIfjgotcclxuICB0aGlzLmN0eC5tc0ltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIHRoaXMuY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIC8vdGhpcy5jdHgud2Via2l0SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgdGhpcy5jdHgubW96SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcblxyXG4gIHRoaXMuY2xzKCk7XHJcbiAgc2NlbmUuYWRkKHRoaXMubWVzaCk7XHJcbn1cclxuXHJcbiAgLy8vIOeUu+mdoua2iOWOu1xyXG4gIGNscygpIHtcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmRpID0gdGhpcy50ZXh0QnVmZmVyLmxlbmd0aDsgaSA8IGVuZGk7ICsraSkge1xyXG4gICAgICB2YXIgbGluZSA9IHRoaXMudGV4dEJ1ZmZlcltpXTtcclxuICAgICAgdmFyIGF0dHJfbGluZSA9IHRoaXMuYXR0ckJ1ZmZlcltpXTtcclxuICAgICAgdmFyIGxpbmVfYmFjayA9IHRoaXMudGV4dEJhY2tCdWZmZXJbaV07XHJcbiAgICAgIHZhciBhdHRyX2xpbmVfYmFjayA9IHRoaXMuYXR0ckJhY2tCdWZmZXJbaV07XHJcblxyXG4gICAgICBmb3IgKHZhciBqID0gMCwgZW5kaiA9IHRoaXMudGV4dEJ1ZmZlcltpXS5sZW5ndGg7IGogPCBlbmRqOyArK2opIHtcclxuICAgICAgICBsaW5lW2pdID0gMHgyMDtcclxuICAgICAgICBhdHRyX2xpbmVbal0gPSAweDAwO1xyXG4gICAgICAgIC8vbGluZV9iYWNrW2pdID0gMHgyMDtcclxuICAgICAgICAvL2F0dHJfbGluZV9iYWNrW2pdID0gMHgwMDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHNmZy5WSVJUVUFMX1dJRFRILCBzZmcuVklSVFVBTF9IRUlHSFQpO1xyXG4gIH1cclxuXHJcbiAgLy8vIOaWh+Wtl+ihqOekuuOBmeOCi1xyXG4gIHByaW50KHgsIHksIHN0ciwgYXR0cmlidXRlKSB7XHJcbiAgICB2YXIgbGluZSA9IHRoaXMudGV4dEJ1ZmZlclt5XTtcclxuICAgIHZhciBhdHRyID0gdGhpcy5hdHRyQnVmZmVyW3ldO1xyXG4gICAgaWYgKCFhdHRyaWJ1dGUpIHtcclxuICAgICAgYXR0cmlidXRlID0gMDtcclxuICAgIH1cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgIHZhciBjID0gc3RyLmNoYXJDb2RlQXQoaSk7XHJcbiAgICAgIGlmIChjID09IDB4YSkge1xyXG4gICAgICAgICsreTtcclxuICAgICAgICBpZiAoeSA+PSB0aGlzLnRleHRCdWZmZXIubGVuZ3RoKSB7XHJcbiAgICAgICAgICAvLyDjgrnjgq/jg63jg7zjg6tcclxuICAgICAgICAgIHRoaXMudGV4dEJ1ZmZlciA9IHRoaXMudGV4dEJ1ZmZlci5zbGljZSgxLCB0aGlzLnRleHRCdWZmZXIubGVuZ3RoIC0gMSk7XHJcbiAgICAgICAgICB0aGlzLnRleHRCdWZmZXIucHVzaChuZXcgQXJyYXkoc2ZnLlZJUlRVQUxfV0lEVEggLyA4KSk7XHJcbiAgICAgICAgICB0aGlzLmF0dHJCdWZmZXIgPSB0aGlzLmF0dHJCdWZmZXIuc2xpY2UoMSwgdGhpcy5hdHRyQnVmZmVyLmxlbmd0aCAtIDEpO1xyXG4gICAgICAgICAgdGhpcy5hdHRyQnVmZmVyLnB1c2gobmV3IEFycmF5KHNmZy5WSVJUVUFMX1dJRFRIIC8gOCkpO1xyXG4gICAgICAgICAgLS15O1xyXG4gICAgICAgICAgdmFyIGVuZGogPSB0aGlzLnRleHRCdWZmZXJbeV0ubGVuZ3RoO1xyXG4gICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBlbmRqOyArK2opIHtcclxuICAgICAgICAgICAgdGhpcy50ZXh0QnVmZmVyW3ldW2pdID0gMHgyMDtcclxuICAgICAgICAgICAgdGhpcy5hdHRyQnVmZmVyW3ldW2pdID0gMHgwMDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgbGluZSA9IHRoaXMudGV4dEJ1ZmZlclt5XTtcclxuICAgICAgICBhdHRyID0gdGhpcy5hdHRyQnVmZmVyW3ldO1xyXG4gICAgICAgIHggPSAwO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxpbmVbeF0gPSBjO1xyXG4gICAgICAgIGF0dHJbeF0gPSBhdHRyaWJ1dGU7XHJcbiAgICAgICAgKyt4O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIC8vLyDjg4bjgq3jgrnjg4jjg4fjg7zjgr/jgpLjgoLjgajjgavjg4bjgq/jgrnjg4Hjg6Pjg7zjgavmj4/nlLvjgZnjgotcclxuICByZW5kZXIoKSB7XHJcbiAgICB2YXIgY3R4ID0gdGhpcy5jdHg7XHJcbiAgICB0aGlzLmJsaW5rQ291bnQgPSAodGhpcy5ibGlua0NvdW50ICsgMSkgJiAweGY7XHJcblxyXG4gICAgdmFyIGRyYXdfYmxpbmsgPSBmYWxzZTtcclxuICAgIGlmICghdGhpcy5ibGlua0NvdW50KSB7XHJcbiAgICAgIHRoaXMuYmxpbmsgPSAhdGhpcy5ibGluaztcclxuICAgICAgZHJhd19ibGluayA9IHRydWU7XHJcbiAgICB9XHJcbiAgICB2YXIgdXBkYXRlID0gZmFsc2U7XHJcbi8vICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgQ09OU09MRV9XSURUSCwgQ09OU09MRV9IRUlHSFQpO1xyXG4vLyAgICBjdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG5cclxuICAgIGZvciAodmFyIHkgPSAwLCBneSA9IDA7IHkgPCBzZmcuVEVYVF9IRUlHSFQ7ICsreSwgZ3kgKz0gc2ZnLkFDVFVBTF9DSEFSX1NJWkUpIHtcclxuICAgICAgdmFyIGxpbmUgPSB0aGlzLnRleHRCdWZmZXJbeV07XHJcbiAgICAgIHZhciBhdHRyX2xpbmUgPSB0aGlzLmF0dHJCdWZmZXJbeV07XHJcbiAgICAgIHZhciBsaW5lX2JhY2sgPSB0aGlzLnRleHRCYWNrQnVmZmVyW3ldO1xyXG4gICAgICB2YXIgYXR0cl9saW5lX2JhY2sgPSB0aGlzLmF0dHJCYWNrQnVmZmVyW3ldO1xyXG4gICAgICBmb3IgKHZhciB4ID0gMCwgZ3ggPSAwOyB4IDwgc2ZnLlRFWFRfV0lEVEg7ICsreCwgZ3ggKz0gc2ZnLkFDVFVBTF9DSEFSX1NJWkUpIHtcclxuICAgICAgICB2YXIgcHJvY2Vzc19ibGluayA9IChhdHRyX2xpbmVbeF0gJiYgYXR0cl9saW5lW3hdLmJsaW5rKTtcclxuICAgICAgICBpZiAobGluZVt4XSAhPSBsaW5lX2JhY2tbeF0gfHwgYXR0cl9saW5lW3hdICE9IGF0dHJfbGluZV9iYWNrW3hdIHx8IChwcm9jZXNzX2JsaW5rICYmIGRyYXdfYmxpbmspKSB7XHJcbiAgICAgICAgICB1cGRhdGUgPSB0cnVlO1xyXG5cclxuICAgICAgICAgIGxpbmVfYmFja1t4XSA9IGxpbmVbeF07XHJcbiAgICAgICAgICBhdHRyX2xpbmVfYmFja1t4XSA9IGF0dHJfbGluZVt4XTtcclxuICAgICAgICAgIHZhciBjID0gMDtcclxuICAgICAgICAgIGlmICghcHJvY2Vzc19ibGluayB8fCB0aGlzLmJsaW5rKSB7XHJcbiAgICAgICAgICAgIGMgPSBsaW5lW3hdIC0gMHgyMDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHZhciB5cG9zID0gKGMgPj4gNCkgPDwgMztcclxuICAgICAgICAgIHZhciB4cG9zID0gKGMgJiAweGYpIDw8IDM7XHJcbiAgICAgICAgICBjdHguY2xlYXJSZWN0KGd4LCBneSwgc2ZnLkFDVFVBTF9DSEFSX1NJWkUsIHNmZy5BQ1RVQUxfQ0hBUl9TSVpFKTtcclxuICAgICAgICAgIHZhciBmb250ID0gYXR0cl9saW5lW3hdID8gYXR0cl9saW5lW3hdLmZvbnQgOiBzZmcudGV4dHVyZUZpbGVzLmZvbnQ7XHJcbiAgICAgICAgICBpZiAoYykge1xyXG4gICAgICAgICAgICBjdHguZHJhd0ltYWdlKGZvbnQuaW1hZ2UsIHhwb3MsIHlwb3MsIHNmZy5DSEFSX1NJWkUsIHNmZy5DSEFSX1NJWkUsIGd4LCBneSwgc2ZnLkFDVFVBTF9DSEFSX1NJWkUsIHNmZy5BQ1RVQUxfQ0hBUl9TSVpFKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMudGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHVwZGF0ZTtcclxuICB9XHJcbn1cclxuIiwiXHJcblwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgKiBhcyBzZmcgZnJvbSAnLi9nbG9iYWwnO1xyXG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJy4vZXZlbnRFbWl0dGVyMyc7XHJcblxyXG5leHBvcnQgY2xhc3MgVGFzayB7XHJcbiAgY29uc3RydWN0b3IoZ2VuSW5zdCxwcmlvcml0eSkge1xyXG4gICAgdGhpcy5wcmlvcml0eSA9IHByaW9yaXR5IHx8IDEwMDAwO1xyXG4gICAgdGhpcy5nZW5JbnN0ID0gZ2VuSW5zdDtcclxuICAgIC8vIOWIneacn+WMllxyXG4gICAgdGhpcy5pbmRleCA9IDA7XHJcbiAgfVxyXG4gIFxyXG59XHJcblxyXG5leHBvcnQgdmFyIG51bGxUYXNrID0gbmV3IFRhc2soKGZ1bmN0aW9uKigpe30pKCkpO1xyXG5cclxuLy8vIOOCv+OCueOCr+euoeeQhlxyXG5leHBvcnQgY2xhc3MgVGFza3MgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xyXG4gIGNvbnN0cnVjdG9yKCl7XHJcbiAgICBzdXBlcigpO1xyXG4gICAgdGhpcy5hcnJheSA9IG5ldyBBcnJheSgwKTtcclxuICAgIHRoaXMubmVlZFNvcnQgPSBmYWxzZTtcclxuICAgIHRoaXMubmVlZENvbXByZXNzID0gZmFsc2U7XHJcbiAgICB0aGlzLmVuYWJsZSA9IHRydWU7XHJcbiAgICB0aGlzLnN0b3BwZWQgPSBmYWxzZTtcclxuICB9XHJcbiAgLy8gaW5kZXjjga7kvY3nva7jga7jgr/jgrnjgq/jgpLnva7jgY3mj5vjgYjjgotcclxuICBzZXROZXh0VGFzayhpbmRleCwgZ2VuSW5zdCwgcHJpb3JpdHkpIFxyXG4gIHtcclxuICAgIGlmKGluZGV4IDwgMCl7XHJcbiAgICAgIGluZGV4ID0gLSgrK2luZGV4KTtcclxuICAgIH1cclxuICAgIGlmKHRoaXMuYXJyYXlbaW5kZXhdLnByaW9yaXR5ID09IDEwMDAwMCl7XHJcbiAgICAgIGRlYnVnZ2VyO1xyXG4gICAgfVxyXG4gICAgdmFyIHQgPSBuZXcgVGFzayhnZW5JbnN0KGluZGV4KSwgcHJpb3JpdHkpO1xyXG4gICAgdC5pbmRleCA9IGluZGV4O1xyXG4gICAgdGhpcy5hcnJheVtpbmRleF0gPSB0O1xyXG4gICAgdGhpcy5uZWVkU29ydCA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBwdXNoVGFzayhnZW5JbnN0LCBwcmlvcml0eSkge1xyXG4gICAgbGV0IHQ7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYXJyYXkubGVuZ3RoOyArK2kpIHtcclxuICAgICAgaWYgKHRoaXMuYXJyYXlbaV0gPT0gbnVsbFRhc2spIHtcclxuICAgICAgICB0ID0gbmV3IFRhc2soZ2VuSW5zdChpKSwgcHJpb3JpdHkpO1xyXG4gICAgICAgIHRoaXMuYXJyYXlbaV0gPSB0O1xyXG4gICAgICAgIHQuaW5kZXggPSBpO1xyXG4gICAgICAgIHJldHVybiB0O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0ID0gbmV3IFRhc2soZ2VuSW5zdCh0aGlzLmFycmF5Lmxlbmd0aCkscHJpb3JpdHkpO1xyXG4gICAgdC5pbmRleCA9IHRoaXMuYXJyYXkubGVuZ3RoO1xyXG4gICAgdGhpcy5hcnJheVt0aGlzLmFycmF5Lmxlbmd0aF0gPSB0O1xyXG4gICAgdGhpcy5uZWVkU29ydCA9IHRydWU7XHJcbiAgICByZXR1cm4gdDtcclxuICB9XHJcblxyXG4gIC8vIOmFjeWIl+OCkuWPluW+l+OBmeOCi1xyXG4gIGdldEFycmF5KCkge1xyXG4gICAgcmV0dXJuIHRoaXMuYXJyYXk7XHJcbiAgfVxyXG4gIC8vIOOCv+OCueOCr+OCkuOCr+ODquOCouOBmeOCi1xyXG4gIGNsZWFyKCkge1xyXG4gICAgdGhpcy5hcnJheS5sZW5ndGggPSAwO1xyXG4gIH1cclxuICAvLyDjgr3jg7zjg4jjgYzlv4XopoHjgYvjg4Hjgqfjg4Pjgq/jgZfjgIHjgr3jg7zjg4jjgZnjgotcclxuICBjaGVja1NvcnQoKSB7XHJcbiAgICBpZiAodGhpcy5uZWVkU29ydCkge1xyXG4gICAgICB0aGlzLmFycmF5LnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcclxuICAgICAgICBpZihhLnByaW9yaXR5ID4gYi5wcmlvcml0eSkgcmV0dXJuIDE7XHJcbiAgICAgICAgaWYgKGEucHJpb3JpdHkgPCBiLnByaW9yaXR5KSByZXR1cm4gLTE7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgIH0pO1xyXG4gICAgICAvLyDjgqTjg7Pjg4fjg4Pjgq/jgrnjga7mjK/jgornm7TjgZdcclxuICAgICAgZm9yICh2YXIgaSA9IDAsIGUgPSB0aGlzLmFycmF5Lmxlbmd0aDsgaSA8IGU7ICsraSkge1xyXG4gICAgICAgIHRoaXMuYXJyYXlbaV0uaW5kZXggPSBpO1xyXG4gICAgICB9XHJcbiAgICAgdGhpcy5uZWVkU29ydCA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmVtb3ZlVGFzayhpbmRleCkge1xyXG4gICAgaWYoaW5kZXggPCAwKXtcclxuICAgICAgaW5kZXggPSAtKCsraW5kZXgpO1xyXG4gICAgfVxyXG4gICAgaWYodGhpcy5hcnJheVtpbmRleF0ucHJpb3JpdHkgPT0gMTAwMDAwKXtcclxuICAgICAgZGVidWdnZXI7XHJcbiAgICB9XHJcbiAgICB0aGlzLmFycmF5W2luZGV4XSA9IG51bGxUYXNrO1xyXG4gICAgdGhpcy5uZWVkQ29tcHJlc3MgPSB0cnVlO1xyXG4gIH1cclxuICBcclxuICBjb21wcmVzcygpIHtcclxuICAgIGlmICghdGhpcy5uZWVkQ29tcHJlc3MpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdmFyIGRlc3QgPSBbXTtcclxuICAgIHZhciBzcmMgPSB0aGlzLmFycmF5O1xyXG4gICAgdmFyIGRlc3RJbmRleCA9IDA7XHJcbiAgICBkZXN0ID0gc3JjLmZpbHRlcigodixpKT0+e1xyXG4gICAgICBsZXQgcmV0ID0gdiAhPSBudWxsVGFzaztcclxuICAgICAgaWYocmV0KXtcclxuICAgICAgICB2LmluZGV4ID0gZGVzdEluZGV4Kys7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHJldDtcclxuICAgIH0pO1xyXG4gICAgdGhpcy5hcnJheSA9IGRlc3Q7XHJcbiAgICB0aGlzLm5lZWRDb21wcmVzcyA9IGZhbHNlO1xyXG4gIH1cclxuICBcclxuICBwcm9jZXNzKGdhbWUpXHJcbiAge1xyXG4gICAgaWYodGhpcy5lbmFibGUpe1xyXG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5wcm9jZXNzLmJpbmQodGhpcyxnYW1lKSk7XHJcbiAgICAgIHRoaXMuc3RvcHBlZCA9IGZhbHNlO1xyXG4gICAgICBpZiAoIXNmZy5wYXVzZSkge1xyXG4gICAgICAgIGlmICghZ2FtZS5pc0hpZGRlbikge1xyXG4gICAgICAgICAgdGhpcy5jaGVja1NvcnQoKTtcclxuICAgICAgICAgIHRoaXMuYXJyYXkuZm9yRWFjaCggKHRhc2ssaSkgPT57XHJcbiAgICAgICAgICAgIGlmICh0YXNrICE9IG51bGxUYXNrKSB7XHJcbiAgICAgICAgICAgICAgaWYodGFzay5pbmRleCAhPSBpICl7XHJcbiAgICAgICAgICAgICAgICBkZWJ1Z2dlcjtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgdGFzay5nZW5JbnN0Lm5leHQodGFzay5pbmRleCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgdGhpcy5jb21wcmVzcygpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSAgICBcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuZW1pdCgnc3RvcHBlZCcpO1xyXG4gICAgICB0aGlzLnN0b3BwZWQgPSB0cnVlO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBzdG9wUHJvY2Vzcygpe1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLHJlamVjdCk9PntcclxuICAgICAgdGhpcy5lbmFibGUgPSBmYWxzZTtcclxuICAgICAgdGhpcy5vbignc3RvcHBlZCcsKCk9PntcclxuICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g44Ky44O844Og55So44K/44Kk44Oe44O8XHJcbmV4cG9ydCBjbGFzcyBHYW1lVGltZXIge1xyXG4gIGNvbnN0cnVjdG9yKGdldEN1cnJlbnRUaW1lKSB7XHJcbiAgICB0aGlzLmVsYXBzZWRUaW1lID0gMDtcclxuICAgIHRoaXMuY3VycmVudFRpbWUgPSAwO1xyXG4gICAgdGhpcy5wYXVzZVRpbWUgPSAwO1xyXG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLlNUT1A7XHJcbiAgICB0aGlzLmdldEN1cnJlbnRUaW1lID0gZ2V0Q3VycmVudFRpbWU7XHJcbiAgICB0aGlzLlNUT1AgPSAxO1xyXG4gICAgdGhpcy5TVEFSVCA9IDI7XHJcbiAgICB0aGlzLlBBVVNFID0gMztcclxuXHJcbiAgfVxyXG4gIFxyXG4gIHN0YXJ0KCkge1xyXG4gICAgdGhpcy5lbGFwc2VkVGltZSA9IDA7XHJcbiAgICB0aGlzLmRlbHRhVGltZSA9IDA7XHJcbiAgICB0aGlzLmN1cnJlbnRUaW1lID0gdGhpcy5nZXRDdXJyZW50VGltZSgpO1xyXG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLlNUQVJUO1xyXG4gIH1cclxuXHJcbiAgcmVzdW1lKCkge1xyXG4gICAgdmFyIG5vd1RpbWUgPSB0aGlzLmdldEN1cnJlbnRUaW1lKCk7XHJcbiAgICB0aGlzLmN1cnJlbnRUaW1lID0gdGhpcy5jdXJyZW50VGltZSArIG5vd1RpbWUgLSB0aGlzLnBhdXNlVGltZTtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5TVEFSVDtcclxuICB9XHJcblxyXG4gIHBhdXNlKCkge1xyXG4gICAgdGhpcy5wYXVzZVRpbWUgPSB0aGlzLmdldEN1cnJlbnRUaW1lKCk7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuUEFVU0U7XHJcbiAgfVxyXG5cclxuICBzdG9wKCkge1xyXG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLlNUT1A7XHJcbiAgfVxyXG5cclxuICB1cGRhdGUoKSB7XHJcbiAgICBpZiAodGhpcy5zdGF0dXMgIT0gdGhpcy5TVEFSVCkgcmV0dXJuO1xyXG4gICAgdmFyIG5vd1RpbWUgPSB0aGlzLmdldEN1cnJlbnRUaW1lKCk7XHJcbiAgICB0aGlzLmRlbHRhVGltZSA9IG5vd1RpbWUgLSB0aGlzLmN1cnJlbnRUaW1lO1xyXG4gICAgdGhpcy5lbGFwc2VkVGltZSA9IHRoaXMuZWxhcHNlZFRpbWUgKyB0aGlzLmRlbHRhVGltZTtcclxuICAgIHRoaXMuY3VycmVudFRpbWUgPSBub3dUaW1lO1xyXG4gIH1cclxufVxyXG5cclxuIl19
