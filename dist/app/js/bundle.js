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

},{"../../js/audio":9,"../../js/comm":10,"../../js/effectobj":11,"../../js/enemies":12,"../../js/game":14,"../../js/gameobj":15,"../../js/global":16,"../../js/graphics":17,"../../js/io":18,"../../js/myship":19,"../../js/text":20,"../../js/util":21,"./devtool":3}],3:[function(require,module,exports){
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

},{"../../js/audio":9,"../../js/global":16,"./controller":1,"./enemyEditor":4,"fs":undefined}],4:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

var _enemies = require('../../js/enemies');

var Enemies = _interopRequireWildcard(_enemies);

var _undo = require('./undo');

var _enemyFormationEditor = require('./enemyFormationEditor');

var _enemyMovSeqEditor = require('./enemyMovSeqEditor');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

        _this.formationEditor = new _enemyFormationEditor.EnemyFormationEditor(this_, this_.formNo);
        _this.movSeqEditor = new _enemyMovSeqEditor.EnemyMovSeqEditor(_this, 0);

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

},{"../../js/enemies":12,"./enemyFormationEditor":5,"./enemyMovSeqEditor":6,"./undo":7,"fs":undefined}],5:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EnemyFormationEditor = undefined;

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

var EnemyFormationEditor = exports.EnemyFormationEditor = function EnemyFormationEditor(enemyEditor, formationNo) {
  _classCallCheck(this, EnemyFormationEditor);

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
      if (needDraw) return false;
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
        formEditor.lineBuffer = events.splice(this.selectStartIndex, this.selectEndIndex + 1 - this.selectStartIndex);
        rowIndex = this.selectStartIndex - currentEventIndex;
        needDraw = true;
      },
      redo: function redo() {
        this.cut();
      },
      undo: function undo() {
        var _this = this;

        formEditor.lineBuffer.forEach(function (d, i) {
          events.splice(_this.selectStartIndex + i, 0, d);
        });
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

},{"../../js/enemies":12,"./undo":7}],6:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EnemyMovSeqEditor = undefined;

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

var EnemyMovSeqEditor = exports.EnemyMovSeqEditor = function () {
  function EnemyMovSeqEditor(enemyEditor, patternNo) {
    _classCallCheck(this, EnemyMovSeqEditor);

    this.undoManager = new _undo.UndoManager();
    this.enemyEditor = enemyEditor;
    this.lineBuffer = null;
    this.debugUi = enemyEditor.devTool.debugUi;
    this.editorUi = enemyEditor.ui.append('div').classed('movseq-editor', true);
    this.eventEdit = this.editorUi.append('table').attr('tabindex', 0);
    this.headrow = this.eventEdit.append('thead').append('tr');
    this.headrow.append('th').text('No');
    this.headrow.append('th').text('Command');
    this.headrow.append('th').text('param');

    this.eventBody = this.eventEdit.append('tbody').attr('id', 'seqevents');
    this.patternNo = patternNo;
  }

  _createClass(EnemyMovSeqEditor, [{
    key: 'patternNo',
    set: function set(v) {
      if (v == this.patternNo_) return;
      var this_ = this;
      this.patternNo_ = v;
      this.editor && this.editor.return(0);
      this.eventBody.datum(this.enemyEditor.devTool.game.enemies.movePatterns[v]);
      this.editor = doEditor(this.eventBody, this);
      this.editor.next();

      // キー入力ハンドラ
      this.eventEdit.on('keydown', function (d) {
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
    }
  }]);

  return EnemyMovSeqEditor;
}();

// エディタ本体

function* doEditor(eventEdit, formEditor) {
  var _editFuncs;

  var keycode = 0; // 入力されたキーコードを保持する変数
  var events = eventEdit.datum(); // 現在編集中のトラック
  var editView = d3.select('#seqevents'); //編集画面のセレクション
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
  //    g.tasks.clear();
  //    g.tasks.pushTask(g.render.bind(g), g.RENDERER_PRIORITY);
  //    g.showSpaceField();
  //   g.enemies.reset();
  //// }

  //g.tasks.process(g);

  function setInput() {
    var this_ = this;
    this.attr('contentEditable', function (d, i) {
      //      if(i != 0){
      return 'true';
      //      } else {
      //        return 'false';
      //      }
    });

    this.on('focus', function () {
      //   console.log(this.parentNode.rowIndex - 1);
      rowIndex = this.parentNode.rowIndex - 1;
      cellIndex = this.cellIndex;
      //g.enemies.reset();
      var index = parseInt(this_.attr('data-row-index'));
      //formEditor.enemyEditor.devTool.game.enemies.startEnemyIndexed(events[index],index);
    });
  }

  function setBlur() {
    var this_ = this;
    var data = this.data();
    this.on('blur', function (d, i) {
      if (needDraw) return;
      //events[parseInt(this_.attr('data-row-index'))];
      //if(this_.attr('data-row-index')){
      var array = undefined;
      //          let data = this_.data();
      if (i == 2) {
        data[2] = this.innerText;
        array = [data[1]].concat(JSON.parse('[' + this.innerText + ']'));
      } else {
        data[1] = this.innerText;
        array = [this.innerText].concat(JSON.parse('[' + data[2] + ']'));
      }
      events[parseInt(this_.attr('data-row-index'))] = formEditor.enemyEditor.devTool.game.enemies.createMovePatternFromArray(array);
      console.log(this_, d, i, data, events);
      //needDraw = true;
      // }
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

    var evflagment = events.slice(currentEventIndex, Math.min(currentEventIndex + NUM_ROW, events.length)).map(function (d, i) {
      var array = d.toJSON();
      if (array.length == 1) {
        return [i + currentEventIndex, array[0], ''];
      }
      return [i + currentEventIndex, array[0], array.slice(1).join(',')];
    });

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

      row.selectAll('td').data(d).enter().append('td').attr('data-row-index', i + currentEventIndex).text(function (d) {
        return d;
      }).call(setInput).call(setBlur);
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
        var cols = row.selectAll('td').data([this.rowIndex + currentEventIndex, 'LineMove', '0,0,0']);

        cellIndex = 0;
        cols.enter().append('td').call(setInput).call(setBlur).attr('data-row-index', this.rowIndex + currentEventIndex).text(function (d) {
          return d;
        });

        row.node().cells[this.cellIndex].focus();
        row.attr('data-new', true);
        //needDraw = true;
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
    //let ev = d3.select(editView.node().rows[rowIndex]).selectAll('td').data();
    var ev = [editView.node().rows[rowIndex].cells[1].innerText].concat(JSON.parse('[' + editView.node().rows[rowIndex].cells[2].innerText + ']'));
    //    ev = [ev[1]].concat(JSON.parse(`[${ev[2]}]`));
    ev = formEditor.enemyEditor.devTool.game.enemies.createMovePatternFromArray(ev);
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
      cellIndex = 1;
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
    if (cellIndex < 1) {
      if (rowIndex != 0) {
        if (d3.select(curRow[rowIndex]).attr('data-new')) {
          endNewInput(false);
          return;
        }
        cellIndex = editView.node().rows[rowIndex].cells.length - 1;
        addRow(-1);
        return;
      } else {
        cellIndex = 1;
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
        var _this = this;

        formEditor.lineBuffer.forEach(function (d, i) {
          events.splice(_this.selectStartIndex + i, 0, d);
        });
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

},{"../../js/enemies":12,"./undo":7}],7:[function(require,module,exports){
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

},{"../../js/EventEmitter3":8}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{"./gameobj":15,"./global":16,"./graphics":17}],12:[function(require,module,exports){
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
    this.stopRad = stopRad || 1.0;
    this.r = r || 100;
    this.speed = speed || 1.0;
    this.left = !left ? false : true;
    this.deltas = [];
    this.startRad_ = this.startRad * Math.PI;
    this.stopRad_ = this.stopRad * Math.PI;
    var rad = this.startRad_;
    var step = (left ? 1 : -1) * this.speed / r;
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
              com.push(_this3.createMovePatternFromArray(d));
            });
          });
          resolve();
        });
      });
    }
  }, {
    key: 'createMovePatternFromArray',
    value: function createMovePatternFromArray(arr) {
      var obj = undefined;
      switch (arr[0]) {
        case 'LineMove':
          obj = LineMove.fromArray(arr);
          break;
        case 'CircleMove':
          obj = CircleMove.fromArray(arr);
          break;
        case 'GotoHome':
          obj = GotoHome.fromArray(arr);
          break;
        case 'HomeMove':
          obj = HomeMove.fromArray(arr);
          break;
        case 'Goto':
          obj = Goto.fromArray(arr);
          break;
        case 'Fire':
          obj = Fire.fromArray(arr);
          break;
      }
      return obj;
      //    throw new Error('MovePattern Not Found.');
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

},{"./gameobj":15,"./global":16,"./graphics":17}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

},{"./audio":9,"./comm":10,"./effectobj":11,"./enemies":12,"./eventEmitter3":13,"./gameobj":15,"./global":16,"./graphics":17,"./io":18,"./myship":19,"./text":20,"./util":21}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
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

},{"./global":16}],18:[function(require,module,exports){
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

},{"./global":16}],19:[function(require,module,exports){
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

},{"./gameobj":15,"./global":16,"./graphics":17}],20:[function(require,module,exports){
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

},{"./global":16}],21:[function(require,module,exports){

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

},{"./eventEmitter3":13,"./global":16}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGFwcFxcanNcXGNvbnRyb2xsZXIuanMiLCJzcmNcXGFwcFxcanNcXGRldk1haW4uanMiLCJzcmNcXGFwcFxcanNcXGRldnRvb2wuanMiLCJzcmNcXGFwcFxcanNcXGVuZW15RWRpdG9yLmpzIiwic3JjXFxhcHBcXGpzXFxlbmVteUZvcm1hdGlvbkVkaXRvci5qcyIsInNyY1xcYXBwXFxqc1xcZW5lbXlNb3ZTZXFFZGl0b3IuanMiLCJzcmNcXGFwcFxcanNcXHVuZG8uanMiLCJzcmNcXGpzXFxFdmVudEVtaXR0ZXIzLmpzIiwic3JjXFxqc1xcYXVkaW8uanMiLCJzcmNcXGpzXFxjb21tLmpzIiwic3JjXFxqc1xcZWZmZWN0b2JqLmpzIiwic3JjXFxqc1xcZW5lbWllcy5qcyIsInNyY1xcanNcXGV2ZW50RW1pdHRlcjMuanMiLCJzcmNcXGpzXFxnYW1lLmpzIiwic3JjXFxqc1xcZ2FtZW9iai5qcyIsInNyY1xcanNcXGdsb2JhbC5qcyIsInNyY1xcanNcXGdyYXBoaWNzLmpzIiwic3JjXFxqc1xcaW8uanMiLCJzcmNcXGpzXFxteXNoaXAuanMiLCJzcmNcXGpzXFx0ZXh0LmpzIiwic3JjXFxqc1xcdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLFlBQVksQ0FBQzs7Ozs7Ozs7OztJQUVRLFVBQVU7QUFDN0IsV0FEbUIsVUFBVSxDQUNqQixPQUFPLEVBQ25COzBCQUZtQixVQUFVOztBQUczQixRQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUN2QixRQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO0FBQ3JCLFFBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPOztBQUFDLEFBRTlCLFFBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQzs7QUFFbEMsUUFBSSxjQUFjLEdBQ2xCOztBQUVFO0FBQ0UsVUFBSSxFQUFD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Q0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLElBQUksQ0FBQztBQUN2QyxLQUFHLEVBQUUsSUFBSSxZQUFZLENBQUMsQ0FBQyxFQUFDLEtBQUssRUFBQyxPQUFPLENBQUM7QUFDdEMsT0FBSyxFQUFFLElBQUksWUFBWSxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsV0FBVyxDQUFDO0FBQzlDLE1BQUksRUFBRSxJQUFJLFlBQVksQ0FBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLFdBQVcsQ0FBQztBQUM1QyxJQUFFLEVBQUUsSUFBSSxZQUFZLENBQUMsQ0FBQyxFQUFDLElBQUksRUFBQyxXQUFXLENBQUM7QUFDeEMsTUFBSSxFQUFFLElBQUksWUFBWSxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsV0FBVyxDQUFDO0FBQzVDLE1BQUksRUFBRSxJQUFJLFlBQVksQ0FBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLE1BQU0sQ0FBQztBQUN2QyxNQUFJLEVBQUUsSUFBSSxZQUFZLENBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxLQUFLLENBQUM7QUFDdEMsUUFBTSxFQUFFLElBQUksWUFBWSxDQUFDLEVBQUUsRUFBQyxRQUFRLEVBQUMsUUFBUSxDQUFDO0FBQzlDLFVBQVEsRUFBRSxJQUFJLFlBQVksQ0FBQyxFQUFFLEVBQUMsVUFBVSxFQUFDLFFBQVEsQ0FBQztBQUNsRCxNQUFJLEVBQUUsSUFBSSxZQUFZLENBQUMsRUFBRSxFQUFDLE1BQU0sRUFBQyxRQUFRLENBQUM7QUFDMUMsS0FBRyxFQUFFLElBQUksWUFBWSxDQUFDLEVBQUUsRUFBQyxLQUFLLEVBQUMsUUFBUSxDQUFDO0FBQ3hDLFVBQVEsRUFBRSxJQUFJLFlBQVksQ0FBQyxFQUFFLEVBQUMsVUFBVSxFQUFDLFlBQVksQ0FBQztBQUN0RCxZQUFVLEVBQUUsSUFBSSxZQUFZLENBQUMsRUFBRSxFQUFDLFlBQVksRUFBQyxZQUFZLENBQUM7QUFDMUQsUUFBTSxFQUFFLElBQUksWUFBWSxDQUFDLEVBQUUsRUFBQyxRQUFRLEVBQUMsS0FBSyxDQUFDO0FBQzNDLFdBQVMs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Q0FBQztBQUNGLElBQUUsRUFBRSxDQUFDO0FBQ0gsV0FBTyxFQUFFLEVBQUU7QUFDWCxXQUFPLEVBQUUsS0FBSztBQUNkLFlBQVEsRUFBRSxLQUFLO0FBQ2YsVUFBTSxFQUFFLEtBQUs7QUFDYixXQUFPLEVBQUUsS0FBSztBQUNkLGdCQUFZLEVBQUUsYUFBYSxDQUFDLEdBQUc7R0FDaEMsQ0FBQztBQUNGLElBQUUsRUFBRSxDQUFDO0FBQ0gsV0FBTyxFQUFFLEVBQUU7QUFDWCxXQUFPLEVBQUUsSUFBSTtBQUNiLFlBQVEsRUFBRSxLQUFLO0FBQ2YsVUFBTSxFQUFFLEtBQUs7QUFDYixXQUFPLEVBQUUsS0FBSztBQUNkLGdCQUFZLEVBQUUsYUFBYSxDQUFDLE1BQU07R0FDbkMsQ0FBQztBQUNGLElBQUUsRUFBRSxDQUFDO0FBQ0gsV0FBTyxFQUFFLEVBQUU7QUFDWCxXQUFPLEVBQUUsSUFBSTtBQUNiLFlBQVEsRUFBRSxLQUFLO0FBQ2YsVUFBTSxFQUFFLEtBQUs7QUFDYixXQUFPLEVBQUUsS0FBSztBQUNkLGdCQUFZLEVBQUUsYUFBYSxDQUFDLFNBQVM7R0FDdEMsQ0FBQztBQUNGLEtBQUcsRUFBQztBQUNGO0FBQ0EsV0FBTyxFQUFFLEdBQUc7QUFDWixXQUFPLEVBQUUsS0FBSztBQUNkLFlBQVEsRUFBRSxLQUFLO0FBQ2YsVUFBTSxFQUFFLEtBQUs7QUFDYixXQUFPLEVBQUUsS0FBSztBQUNkLGdCQUFZLEVBQUUsYUFBYSxDQUFDLE1BQU07R0FDakMsQ0FDRjtBQUNELEtBQUcsRUFBQztBQUNGO0FBQ0EsV0FBTyxFQUFFLEdBQUc7QUFDWixXQUFPLEVBQUUsS0FBSztBQUNkLFlBQVEsRUFBRSxLQUFLO0FBQ2YsVUFBTSxFQUFFLEtBQUs7QUFDYixXQUFPLEVBQUUsS0FBSztBQUNkLGdCQUFZLEVBQUUsYUFBYSxDQUFDLFFBQVE7R0FDbkMsQ0FDRjtBQUNELEtBQUcsRUFBQztBQUNGO0FBQ0EsV0FBTyxFQUFFLEdBQUc7QUFDWixXQUFPLEVBQUUsS0FBSztBQUNkLFlBQVEsRUFBRSxLQUFLO0FBQ2YsVUFBTSxFQUFFLEtBQUs7QUFDYixXQUFPLEVBQUUsS0FBSztBQUNkLGdCQUFZLEVBQUUsYUFBYSxDQUFDLFNBQVM7R0FDcEMsQ0FDRjtBQUNELEtBQUcsRUFBQztBQUNGO0FBQ0EsV0FBTyxFQUFFLEdBQUc7QUFDWixXQUFPLEVBQUUsS0FBSztBQUNkLFlBQVEsRUFBRSxLQUFLO0FBQ2YsVUFBTSxFQUFFLEtBQUs7QUFDYixXQUFPLEVBQUUsS0FBSztBQUNkLGdCQUFZLEVBQUUsYUFBYSxDQUFDLFVBQVU7R0FDckMsQ0FDRjtDQUNGLENBQUM7O0lBRVMsb0JBQW9CLFdBQXBCLG9CQUFvQixHQUMvQixTQURXLG9CQUFvQixDQUNuQixXQUFXLEVBQUMsV0FBVyxFQUFFO3dCQUQxQixvQkFBb0I7O0FBRTdCLE1BQUksS0FBSyxHQUFHLElBQUksQ0FBQztBQUNqQixNQUFJLENBQUMsV0FBVyxHQUFHLFVBM09kLFdBQVcsRUEyT29CLENBQUM7QUFDckMsTUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7QUFDL0IsTUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7QUFDdkIsTUFBSSxPQUFPLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7QUFDMUMsTUFBSSxNQUFNLEdBQUcsV0FBVyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzVFLE1BQUksU0FBUyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsQ0FBQztBQUMxRCxNQUFJLE9BQU8sR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNyRCxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNsQyxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNsQyxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNqQyxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFakMsTUFBSSxTQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQy9ELFdBQVMsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO0FBQ3hFLE1BQUksQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLFNBQVMsRUFBQyxLQUFLLENBQUMsQ0FBQztBQUN4QyxNQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRTs7O0FBQUMsQUFHbkIsV0FBUyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLEVBQUU7QUFDbkMsUUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUs7O0FBQUMsQUFFakIsUUFBSSxHQUFHLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM5QixRQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7QUFDYixRQUFJLEdBQUcsRUFBRTtBQUNQLFNBQUcsQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUs7QUFDZCxZQUFJLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLE9BQU8sSUFDckIsQ0FBQyxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUMsUUFBUSxJQUN4QixDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxNQUFNLElBQ3BCLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLE9BQU8sRUFDdkI7QUFDRixhQUFHLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0IsaUJBQU8sSUFBSSxDQUFDO1NBQ2I7T0FDRixDQUFDLENBQUM7QUFDSCxVQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUU7QUFDYixVQUFFLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQzFCLFVBQUUsQ0FBQyxLQUFLLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztBQUM3QixlQUFPLEtBQUssQ0FBQztPQUNkO0tBQ0Y7R0FDRixDQUFDLENBQUM7Q0FDSjs7OztBQUlILFVBQVUsUUFBUSxDQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUU7OztBQUN4QyxNQUFJLE9BQU8sR0FBRyxDQUFDO0FBQUMsQUFDaEIsTUFBSSxNQUFNLEdBQUcsU0FBUyxDQUFDLEtBQUssRUFBRTtBQUFDLEFBQy9CLE1BQUksUUFBUSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO0FBQUMsQUFDcEMsTUFBSSxRQUFRLEdBQUcsQ0FBQztBQUFDLEFBQ2pCLE1BQUksaUJBQWlCLEdBQUcsQ0FBQztBQUFDLEFBQzFCLE1BQUksU0FBUyxHQUFHLENBQUM7QUFBQyxBQUNsQixNQUFJLFdBQVcsR0FBRyxLQUFLO0FBQUMsQUFDeEIsTUFBTSxPQUFPLEdBQUcsRUFBRTtBQUFDLEFBQ25CLE1BQUksZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO0FBQzVCLE1BQUksY0FBYyxHQUFHLElBQUksQ0FBQztBQUMxQixNQUFJLFFBQVEsR0FBRyxLQUFLLENBQUM7QUFDckIsTUFBSSxDQUFDLEdBQUcsVUFBVSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSTs7OztBQUFDLEFBSTFDLEdBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDaEIsR0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLGlCQUFpQixDQUFDOztBQUFDLEFBRXhELEdBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFOzs7OztBQUFDLEFBS3BCLFdBQVMsUUFBUSxHQUFHO0FBQ2xCLFFBQUksS0FBSyxHQUFHLElBQUksQ0FBQztBQUNqQixRQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3JDLFFBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLFlBQVk7O0FBRTNCLGNBQVEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7QUFDeEMsZUFBUyxHQUFHLElBQUksQ0FBQyxTQUFTOztBQUFDLEFBRTNCLFVBQUksS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztBQUNuRCxnQkFBVSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUMsS0FBSyxDQUFDLENBQUM7S0FDcEYsQ0FBQyxDQUFDO0dBQ0o7O0FBRUQsV0FBUyxPQUFPLEdBQUU7QUFDaEIsUUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ2hCLFFBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFDLFVBQVMsQ0FBQyxFQUFDLENBQUMsRUFDMUI7QUFBQyxVQUFHLFFBQVEsRUFBRSxPQUFPLEtBQUssQ0FBQztBQUN6QixVQUFJLElBQUksR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUQsVUFBRyxDQUFDLElBQUksQ0FBQyxFQUFDO0FBQ1IsWUFBSSxDQUFDLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNuQyxZQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFDO0FBQ1gsY0FBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNiO09BQ0YsTUFBTTtBQUNMLFlBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztPQUNoRDtLQUNGLENBQUMsQ0FBQztHQUNOOzs7QUFBQSxBQUlELFdBQVMsU0FBUyxHQUNsQjtBQUNFLFFBQUksR0FBRyxHQUFHLElBQUk7UUFBQyxHQUFHLEdBQUcsSUFBSSxDQUFDO0FBQzFCLFFBQUcsZ0JBQWdCLElBQUksSUFBSSxJQUFJLGNBQWMsSUFBSSxJQUFJLEVBQUM7QUFDbEQsVUFBRyxpQkFBaUIsSUFBSSxnQkFBZ0IsRUFBQztBQUN2QyxXQUFHLEdBQUcsZ0JBQWdCLEdBQUcsaUJBQWlCLENBQUM7QUFDM0MsWUFBRyxBQUFDLGlCQUFpQixHQUFHLE9BQU8sSUFBSyxjQUFjLEVBQ2xEO0FBQ0UsYUFBRyxHQUFHLGNBQWMsR0FBRyxpQkFBaUIsQ0FBQztTQUMxQyxNQUFNO0FBQ0wsYUFBRyxHQUFHLE9BQU8sR0FBRyxDQUFDLENBQUM7U0FDbkI7T0FDRixNQUNEO0FBQ0UsV0FBRyxHQUFHLENBQUMsQ0FBQztBQUNSLFlBQUcsQUFBQyxpQkFBaUIsR0FBRyxPQUFPLElBQUssY0FBYyxFQUNsRDtBQUNFLGFBQUcsR0FBRyxjQUFjLEdBQUcsaUJBQWlCLENBQUM7U0FDMUMsTUFBTTtBQUNMLGFBQUcsR0FBRyxPQUFPLEdBQUcsQ0FBQyxDQUFDO1NBQ25CO09BQ0Y7S0FDSjtBQUNELFFBQUksVUFBVSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEVBQUUsaUJBQWlCLEdBQUcsT0FBTyxDQUFDLENBQUM7QUFDOUUsWUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNsQyxRQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUN2RCxRQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDM0IsUUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLFVBQUMsQ0FBQyxFQUFFLENBQUM7YUFBSyxDQUFDO0tBQUEsQ0FBQyxDQUFDO0FBQzlELFFBQUcsR0FBRyxJQUFJLElBQUksSUFBSSxHQUFHLElBQUksSUFBSSxFQUFDO0FBQzVCLFVBQUksQ0FBQyxJQUFJLENBQUMsVUFBUyxDQUFDLEVBQUMsQ0FBQyxFQUFDO0FBQ3JCLFlBQUcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFDO0FBQ3RCLFlBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBQyxJQUFJLENBQUMsQ0FBQztTQUMxQztPQUNILENBQUMsQ0FBQztLQUNIOztBQUVELFFBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ3hCLFVBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRXpCLFNBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQ25CLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FDUCxLQUFLLEVBQUUsQ0FDUCxNQUFNLENBQUMsSUFBSSxDQUFDLENBQ1osSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUNkLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FDYixJQUFJLENBQUMsZ0JBQWdCLEVBQUMsQ0FBQyxHQUFHLGlCQUFpQixDQUFDLENBQzVDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRztBQUNULFlBQUcsT0FBTyxDQUFDLEFBQUMsS0FBSyxVQUFVLEVBQUU7QUFDM0IsaUJBQU8sQ0FBQyxFQUFFLEdBQUMsQ0FBQyxDQUFBLENBQUUsT0FBTyxDQUFDLG1DQUFtQyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ2xFO0FBQ0QsZUFBTyxDQUFDLENBQUM7T0FDVixDQUFDOzs7Ozs7O0FBQUMsS0FPSixDQUFDLENBQUM7O0FBRUgsUUFBSSxRQUFRLEdBQUksVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEFBQUMsRUFBRTtBQUN0QyxjQUFRLEdBQUcsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7S0FDbEM7R0FFRjs7O0FBQUEsQUFHRCxXQUFTLFVBQVUsR0FBRztBQUNwQixRQUFHLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEVBQUM7QUFDbEQsZUFBUztLQUNWO0FBQ0QsWUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7R0FDekQ7OztBQUFBLEFBR0QsV0FBUyxXQUFXLENBQUMsUUFBUSxFQUFFO0FBQzdCLGNBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO0FBQzFCLFVBQUksa0JBQUc7QUFDTCxZQUFJLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDMUMsWUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7QUFDM0IsWUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7QUFDekIsWUFBSSxDQUFDLGdCQUFnQixHQUFHLGlCQUFpQixDQUFDO0FBQzFDLFlBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztPQUNkO0FBQ0QsV0FBSyxtQkFBRztBQUNOLFlBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztBQUM5RCxZQUFJLElBQUksR0FBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRXhFLGlCQUFTLEdBQUcsQ0FBQyxDQUFDO0FBQ2QsWUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FDeEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUNkLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FDYixJQUFJLENBQUMsZ0JBQWdCLEVBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FDN0QsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFHO0FBQ1QsY0FBRyxPQUFPLENBQUMsQUFBQyxLQUFLLFVBQVUsRUFBRTtBQUMzQixtQkFBTyxDQUFDLEVBQUUsR0FBQyxDQUFDLENBQUEsQ0FBRSxPQUFPLENBQUMsbUNBQW1DLEVBQUUsSUFBSSxDQUFDLENBQUM7V0FDbEU7U0FDRCxDQUFDLENBQUM7O0FBRUosV0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDekMsV0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7T0FDNUI7QUFDRCxVQUFJLGtCQUFHO0FBQ0wsWUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO09BQ2Q7QUFDRCxVQUFJLGtCQUFHO0FBQ0wsZ0JBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3pDLFlBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztPQUN4QztLQUNGLENBQUMsQ0FBQztHQUNKOzs7QUFBQSxBQUdELFdBQVMsV0FBVyxHQUFjO1FBQWIsSUFBSSx5REFBRyxJQUFJOztBQUM5QixNQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQzs7O0FBQUMsQUFHakUsUUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQzFFLGNBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO0FBQzFCLFVBQUksa0JBQUU7QUFDSixZQUFJLENBQUMsVUFBVSxHQUFHLFFBQVEsR0FBRyxpQkFBaUIsQ0FBQztBQUMvQyxZQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUNiLFlBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQztBQUN2QixZQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7T0FDZDtBQUNELFdBQUssbUJBQUU7QUFDTCxjQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztPQUMxQztBQUNELFVBQUksa0JBQUU7QUFDSixZQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7T0FDZDtBQUNELFVBQUksa0JBQUU7QUFDSixjQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO09BQzNDO0tBQ0YsQ0FBQyxDQUFDOztBQUVILFFBQUksSUFBSSxFQUFFO0FBQ1IsVUFBSSxRQUFRLElBQUssT0FBTyxHQUFHLENBQUMsQUFBQyxFQUFFO0FBQzdCLFVBQUUsaUJBQWlCLENBQUM7T0FDckIsTUFBTTtBQUNMLFVBQUUsUUFBUSxDQUFDO09BQ1o7S0FDRjs7QUFBQSxBQUVELFlBQVEsR0FBRyxJQUFJLENBQUM7R0FDakI7O0FBRUQsV0FBUyxNQUFNLENBQUMsS0FBSyxFQUNyQjtBQUNFLFlBQVEsSUFBSSxLQUFLLENBQUM7QUFDbEIsUUFBSSxTQUFTLEdBQUcsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDNUMsUUFBRyxRQUFRLElBQUksU0FBUyxFQUFDO0FBQ3ZCLFVBQUksQ0FBQyxHQUFHLFFBQVEsR0FBRyxTQUFTLEdBQUcsQ0FBQyxDQUFDO0FBQ2pDLGNBQVEsR0FBRyxTQUFTLEdBQUcsQ0FBQyxDQUFDO0FBQ3pCLFVBQUcsQUFBQyxpQkFBaUIsR0FBRyxPQUFPLEdBQUUsQ0FBQyxHQUFLLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxBQUFDLEVBQUM7QUFDeEQseUJBQWlCLElBQUksQ0FBQyxDQUFDO0FBQ3ZCLFlBQUcsQUFBQyxpQkFBaUIsR0FBRyxPQUFPLEdBQUUsQ0FBQyxHQUFLLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxBQUFDLEVBQUM7QUFDeEQsMkJBQWlCLEdBQUksTUFBTSxDQUFDLE1BQU0sR0FBRyxPQUFPLEdBQUcsQ0FBQyxBQUFDLENBQUM7U0FDbkQ7T0FDRjtBQUNELGNBQVEsR0FBRyxJQUFJLENBQUM7S0FDakI7QUFDRCxRQUFHLFFBQVEsR0FBRyxDQUFDLEVBQUM7QUFDZCxVQUFJLENBQUMsR0FBRyxRQUFRLENBQUM7QUFDakIsY0FBUSxHQUFHLENBQUMsQ0FBQztBQUNiLFVBQUcsaUJBQWlCLElBQUksQ0FBQyxFQUFDO0FBQ3hCLHlCQUFpQixJQUFJLENBQUMsQ0FBQztBQUN2QixZQUFHLGlCQUFpQixHQUFHLENBQUMsRUFBQztBQUN2QiwyQkFBaUIsR0FBRyxDQUFDLENBQUM7U0FDdkI7QUFDRCxnQkFBUSxHQUFHLElBQUksQ0FBQztPQUNqQjtLQUNGO0FBQ0QsY0FBVSxFQUFFLENBQUM7R0FDZDs7O0FBQUEsQUFHRCxXQUFTLE9BQU8sR0FBRTs7O0FBR2hCLFFBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUN0RSxRQUFJLElBQUksRUFBRTtBQUNSLGlCQUFXLEVBQUUsQ0FBQztLQUNmLE1BQU07O0FBRUwsaUJBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUN2QjtBQUNELGVBQVcsR0FBRyxJQUFJLENBQUM7R0FDcEI7OztBQUFBLEFBR0QsV0FBUyxPQUFPLEdBQUU7QUFDaEIsYUFBUyxFQUFFLENBQUM7QUFDWixRQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDO0FBQ2xDLFFBQUksU0FBUyxHQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQUFBQyxFQUFFO0FBQ25ELGVBQVMsR0FBRyxDQUFDLENBQUM7QUFDZCxVQUFJLFFBQVEsR0FBSSxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQUFBQyxFQUFFO0FBQ2xDLFlBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUU7QUFDaEQscUJBQVcsRUFBRSxDQUFDO0FBQ2QsaUJBQU87U0FDUixNQUFNO0FBQ0wsZ0JBQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNWLGlCQUFPO1NBQ1I7T0FDRjtLQUNGO0FBQ0QsY0FBVSxFQUFFLENBQUM7QUFDYixlQUFXLEdBQUcsSUFBSSxDQUFDO0dBQ3BCOzs7QUFBQSxBQUdELFdBQVMsTUFBTSxHQUFHO0FBQ2hCLFFBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUM7QUFDbEMsTUFBRSxTQUFTLENBQUM7QUFDWixRQUFJLFNBQVMsR0FBRyxDQUFDLEVBQUU7QUFDakIsVUFBSSxRQUFRLElBQUksQ0FBQyxFQUFFO0FBQ2pCLFlBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUU7QUFDaEQscUJBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNuQixpQkFBTztTQUNSO0FBQ0QsaUJBQVMsR0FBRyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQzVELGNBQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ1gsZUFBTztPQUNSLE1BQU07QUFDTCxpQkFBUyxHQUFHLENBQUMsQ0FBQztPQUNmO0tBQ0Y7QUFDRCxjQUFVLEVBQUUsQ0FBQztBQUNiLGVBQVcsR0FBRyxJQUFJLENBQUM7R0FDcEI7OztBQUFBLEFBR0QsV0FBUyxJQUFJLEdBQUc7QUFDZCxRQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDO0FBQ2xDLFFBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUU7QUFDaEQsaUJBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUNwQixNQUFNO0FBQ0wsWUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDWjtBQUNELGVBQVcsR0FBRyxJQUFJLENBQUM7R0FDcEI7O0FBRUQsV0FBUyxNQUFNLEdBQUc7QUFDaEIsUUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQztBQUNsQyxRQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFO0FBQ2hELGlCQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDcEI7QUFDRCxVQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDVixlQUFXLEdBQUcsSUFBSSxDQUFDO0dBQ3BCOztBQUVELFdBQVMsVUFBVSxHQUFHO0FBQ3BCLFFBQUksaUJBQWlCLEdBQUksTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEFBQUMsRUFBRTtBQUMzQyx1QkFBaUIsSUFBSSxPQUFPLENBQUM7QUFDN0IsVUFBSSxpQkFBaUIsR0FBSSxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQUFBQyxFQUFFO0FBQzNDLHlCQUFpQixJQUFJLE9BQU8sQ0FBQztPQUM5QixNQUFNO0FBQ0wsZ0JBQVEsR0FBRyxJQUFJLENBQUM7T0FDakI7QUFDRCxnQkFBVSxFQUFFLENBQUM7S0FDZDtBQUNELGVBQVcsR0FBRyxJQUFJLENBQUM7R0FDcEI7O0FBRUQsV0FBUyxRQUFRLEdBQUU7QUFDakIsUUFBSSxpQkFBaUIsR0FBRyxDQUFDLEVBQUU7QUFDekIsdUJBQWlCLElBQUksT0FBTyxDQUFDO0FBQzdCLFVBQUksaUJBQWlCLEdBQUcsQ0FBQyxFQUFFO0FBQ3pCLHlCQUFpQixHQUFHLENBQUMsQ0FBQztPQUN2QjtBQUNELGNBQVEsR0FBRyxJQUFJLENBQUM7S0FDakI7QUFDRCxlQUFXLEdBQUcsSUFBSSxDQUFDO0dBQ3BCOztBQUVELFdBQVMsVUFBVSxHQUNuQjtBQUNFLFFBQUksaUJBQWlCLEdBQUcsQ0FBQyxFQUFFO0FBQ3pCLFFBQUUsaUJBQWlCLENBQUM7QUFDcEIsY0FBUSxHQUFHLElBQUksQ0FBQztLQUNqQjtBQUNELGVBQVcsR0FBRyxJQUFJLENBQUM7R0FDcEI7O0FBRUQsV0FBUyxZQUFZLEdBQ3JCO0FBQ0UsUUFBSSxBQUFDLGlCQUFpQixHQUFHLE9BQU8sSUFBTSxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQUFBQyxFQUFFO0FBQ3hELFFBQUUsaUJBQWlCLENBQUM7QUFDcEIsY0FBUSxHQUFHLElBQUksQ0FBQztLQUNqQjtBQUNELGVBQVcsR0FBRyxJQUFJLENBQUM7R0FDcEI7O0FBRUQsV0FBUyxNQUFNLEdBQUU7QUFDZixRQUFJLGlCQUFpQixHQUFHLENBQUMsRUFBRTtBQUN6QixjQUFRLEdBQUcsQ0FBQyxDQUFDO0FBQ2IsdUJBQWlCLEdBQUcsQ0FBQyxDQUFDO0FBQ3RCLGNBQVEsR0FBRyxJQUFJLENBQUM7S0FDakI7QUFDRCxlQUFXLEdBQUcsSUFBSSxDQUFDO0dBQ3BCOztBQUVELFdBQVMsS0FBSyxHQUFFO0FBQ2QsUUFBSSxpQkFBaUIsSUFBSyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQUFBQyxFQUFFO0FBQzVDLGNBQVEsR0FBRyxDQUFDLENBQUM7QUFDYix1QkFBaUIsR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUN0QyxjQUFRLEdBQUcsSUFBSSxDQUFDO0tBQ2pCO0FBQ0QsZUFBVyxHQUFHLElBQUksQ0FBQztHQUNwQjs7QUFFRCxXQUFTLFFBQVEsR0FBRztBQUNsQixRQUFJLEFBQUMsUUFBUSxHQUFHLGlCQUFpQixJQUFNLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxBQUFDLEVBQUU7QUFDekQsaUJBQVcsR0FBRyxJQUFJLENBQUM7QUFDbkIsYUFBTztLQUNSO0FBQ0QsY0FBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQ3pCO0FBQ0UsVUFBSSxrQkFBRztBQUNMLFlBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0FBQ3pCLFlBQUksQ0FBQyxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQztBQUMzQyxZQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDbkMsWUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM5RCxnQkFBUSxDQUFDLElBQUksRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDekMsWUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDO0FBQ3hDLGtCQUFVLENBQUMsVUFBVSxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3JDLGNBQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLENBQUM7QUFDeEQsZ0JBQVEsR0FBRyxJQUFJLENBQUM7T0FDakI7QUFDRCxVQUFJLGtCQUFHO0FBQ0wsZ0JBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3pDLGNBQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLENBQUM7QUFDeEQsZ0JBQVEsR0FBRyxJQUFJLENBQUM7T0FDakI7QUFDRCxVQUFJLGtCQUFHO0FBQ0wsa0JBQVUsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztBQUN4QyxjQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDbkUsZ0JBQVEsR0FBRyxJQUFJLENBQUM7T0FDakI7S0FDRixDQUNGLENBQUM7QUFDRixlQUFXLEdBQUcsSUFBSSxDQUFDO0dBQ3BCOztBQUVELFdBQVMsV0FBVyxHQUNwQjtBQUNFLGNBQVUsRUFBRSxDQUFDO0dBQ2Q7O0FBRUQsV0FBUyxNQUFNLEdBQUU7QUFDZixjQUFVLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQzlCLGVBQVcsR0FBRyxJQUFJLENBQUM7R0FDcEI7O0FBRUQsV0FBUyxNQUFNLEdBQUU7QUFDZixjQUFVLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQzlCLGVBQVcsR0FBRyxJQUFJLENBQUM7R0FDcEI7OztBQUFBLEFBR0QsV0FBUyxRQUFRLEdBQ2pCO0FBQ0UsY0FBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQzNCO0FBQ0UsVUFBSSxrQkFBRTtBQUNKLFlBQUksQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQztBQUN6QyxZQUFJLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztBQUNyQyxZQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7T0FDWjtBQUNELFNBQUcsaUJBQUU7QUFDSCxZQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUM7QUFDeEMsa0JBQVUsQ0FBQyxVQUFVLEdBQ3JCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBRSxDQUFDO0FBQ3ZGLGdCQUFRLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGlCQUFpQixDQUFDO0FBQ3JELGdCQUFRLEdBQUcsSUFBSSxDQUFDO09BQ2pCO0FBQ0QsVUFBSSxrQkFDSjtBQUNFLFlBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztPQUNaO0FBQ0QsVUFBSSxrQkFBRTs7O0FBQ0wsa0JBQVUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBRztBQUNuQyxnQkFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFLLGdCQUFnQixHQUFHLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUM7U0FDOUMsQ0FBQyxDQUFDO0FBQ0gsa0JBQVUsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztBQUN4QyxnQkFBUSxHQUFHLElBQUksQ0FBQztPQUNoQjtLQUNGLENBQUMsQ0FBQztBQUNILGVBQVcsR0FBRyxJQUFJLENBQUM7R0FDcEI7OztBQUFBLEFBR0QsV0FBUyxTQUFTLEdBQ2xCO0FBQ0UsY0FBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQzNCO0FBQ0UsVUFBSSxrQkFBRTtBQUNKLFlBQUksQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQztBQUN6QyxZQUFJLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztBQUNyQyxZQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7T0FDYjtBQUNELFVBQUksa0JBQUU7QUFDSixZQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUM7QUFDeEMsa0JBQVUsQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO0FBQzNCLGFBQUksSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsY0FBYyxHQUFHLENBQUMsRUFBQyxDQUFDLEdBQUUsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxFQUN0RTtBQUNFLG9CQUFVLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztTQUNoRDtBQUNELGdCQUFRLEdBQUcsSUFBSSxDQUFDO09BQ2pCO0FBQ0QsVUFBSSxrQkFDSjtBQUNFLFlBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztPQUNiO0FBQ0QsVUFBSSxrQkFBRTtBQUNMLGtCQUFVLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7QUFDeEMsZ0JBQVEsR0FBRyxJQUFJLENBQUM7T0FDaEI7S0FDRixDQUFDLENBQUM7QUFDSCxlQUFXLEdBQUcsSUFBSSxDQUFDO0dBQ3BCOzs7QUFBQSxBQUdELFdBQVMsVUFBVSxHQUFFO0FBQ25CLFFBQUcsVUFBVSxDQUFDLFVBQVUsRUFBQztBQUN6QixnQkFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQzNCO0FBQ0UsWUFBSSxrQkFBRTtBQUNKLGNBQUksQ0FBQyxVQUFVLEdBQUcsUUFBUSxHQUFHLGlCQUFpQixDQUFDO0FBQy9DLGNBQUksQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUM7QUFDMUMsY0FBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1NBQ2Q7QUFDRCxhQUFLLG1CQUFFO0FBQ0wsZUFBSSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBQyxDQUFDLEdBQUcsQ0FBQyxFQUFDLENBQUMsSUFBSSxDQUFDLEVBQUMsRUFBRSxDQUFDLEVBQzNDO0FBQ0Usa0JBQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1dBQ3BFO1NBQ0Y7QUFDRCxZQUFJLGtCQUFFO0FBQ0osY0FBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1NBQ2Q7QUFDRCxZQUFJLGtCQUFFO0FBQ0osZ0JBQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDM0M7T0FDRixDQUFDLENBQUM7QUFDSCxjQUFRLEdBQUcsSUFBSSxDQUFDO0tBQ2Y7QUFDRCxlQUFXLEdBQUcsSUFBSSxDQUFDO0dBQ3BCOztBQUVELFlBQVUsUUFBUSxHQUNsQjtBQUNFLFFBQUksS0FBSyxZQUFBLENBQUM7QUFDVixRQUFJLFdBQVcsR0FBRyxRQUFRLEdBQUcsaUJBQWlCLENBQUM7QUFDL0Msb0JBQWdCLEdBQUcsUUFBUSxHQUFHLGlCQUFpQixDQUFDO0FBQ2hELGtCQUFjLEdBQUcsZ0JBQWdCLENBQUM7QUFDbEMsZUFBVyxHQUFHLElBQUksQ0FBQztBQUNuQixhQUFTLEVBQUUsQ0FBQztBQUNaLGNBQVUsRUFBRSxDQUFDO0FBQ2IsUUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDO0FBQ3JCLFdBQU0sQ0FBQyxRQUFRLEVBQ2Y7QUFDRSxXQUFLLEdBQUcsTUFBTSxXQUFXLENBQUM7O0FBRTFCLGNBQU8sS0FBSyxDQUFDLFlBQVksQ0FBQyxFQUFFO0FBQzFCLGFBQUssYUFBYSxDQUFDLE1BQU0sQ0FBQyxFQUFFO0FBQzFCLGtCQUFRLEdBQUcsSUFBSSxDQUFDO0FBQ2hCLGdCQUFNO0FBQUEsQUFDUixhQUFLLGFBQWEsQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUM1QixrQkFBUSxFQUFFLENBQUM7QUFDWCxrQkFBUSxHQUFHLElBQUksQ0FBQztBQUNoQixnQkFBTTtBQUFBLEFBQ1IsYUFBSyxhQUFhLENBQUMsU0FBUyxDQUFDLEVBQUU7QUFDN0IsbUJBQVMsRUFBRSxDQUFDO0FBQ1osa0JBQVEsR0FBRyxJQUFJLENBQUM7QUFDaEIsZ0JBQU07QUFBQSxBQUNSO0FBQ0UsY0FBSSxFQUFFLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDMUMsY0FBRyxFQUFFLEVBQUM7QUFDSixjQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7V0FDWCxNQUFNO0FBQ0gsdUJBQVcsR0FBRyxLQUFLLENBQUM7V0FDdkI7O0FBQUEsQUFFRCxjQUFHLFdBQVcsSUFBSyxRQUFRLEdBQUcsaUJBQWlCLEFBQUMsRUFDaEQ7QUFDRSxnQkFBSSxLQUFLLEdBQUcsUUFBUSxHQUFHLGlCQUFpQixHQUFHLFdBQVcsQ0FBQztBQUN2RCxnQkFBSSxTQUFTLEdBQUcsUUFBUSxHQUFHLGlCQUFpQixDQUFDO0FBQzdDLGdCQUFHLEtBQUssR0FBRyxDQUFDLEVBQUM7QUFDWCxrQkFBRyxnQkFBZ0IsR0FBRyxTQUFTLEVBQUM7QUFDOUIsZ0NBQWdCLEdBQUcsU0FBUyxDQUFDO2VBQzlCLE1BQU07QUFDTCw4QkFBYyxHQUFHLFNBQVMsQ0FBQztlQUM1QjthQUNGLE1BQU07QUFDTCxrQkFBRyxjQUFjLEdBQUcsU0FBUyxFQUFDO0FBQzVCLDhCQUFjLEdBQUcsU0FBUyxDQUFDO2VBQzVCLE1BQU07QUFDTCxnQ0FBZ0IsR0FBRyxTQUFTLENBQUM7ZUFDOUI7YUFDRjtBQUNELHVCQUFXLEdBQUcsUUFBUSxHQUFHLGlCQUFpQixDQUFDO0FBQzNDLG9CQUFRLEdBQUcsSUFBSSxDQUFDO0FBQ2hCLHVCQUFXLEdBQUcsSUFBSSxDQUFDO1dBQ3BCO0FBQ0gsZ0JBQU07QUFBQSxPQUNQO0FBQ0QsVUFBRyxRQUFRLEVBQUM7QUFDVixpQkFBUyxFQUFFLENBQUM7QUFDWixrQkFBVSxFQUFFLENBQUM7QUFDYixnQkFBUSxHQUFHLEtBQUssQ0FBQztPQUNsQjtLQUNGOzs7QUFBQSxBQUdELG9CQUFnQixHQUFHLElBQUksQ0FBQztBQUN4QixrQkFBYyxHQUFHLElBQUksQ0FBQztBQUN0QixlQUFXLEdBQUcsSUFBSSxDQUFDO0FBQ25CLGFBQVMsRUFBRSxDQUFDO0FBQ1osY0FBVSxFQUFFLENBQUM7QUFDYixZQUFRLEdBQUcsS0FBSyxDQUFDO0dBQ2xCOztBQUVELE1BQUksU0FBUyxpREFDVixhQUFhLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxPQUFPLCtCQUMvQixhQUFhLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxPQUFPLCtCQUMvQixhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxNQUFNLCtCQUM3QixhQUFhLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxJQUFJLCtCQUN6QixhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxNQUFNLCtCQUM3QixhQUFhLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxVQUFVLCtCQUNyQyxhQUFhLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxRQUFRLCtCQUNqQyxhQUFhLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxVQUFVLCtCQUNyQyxhQUFhLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxZQUFZLCtCQUN6QyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxNQUFNLCtCQUM3QixhQUFhLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxLQUFLLCtCQUMzQixhQUFhLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxRQUFRLCtCQUNqQyxhQUFhLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxXQUFXLCtCQUN2QyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxNQUFNLCtCQUM3QixhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxNQUFNLCtCQUM3QixhQUFhLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxVQUFVLGNBQ3pDLENBQUM7O0FBRUYsV0FBUyxFQUFFLENBQUM7QUFDWixTQUFPLElBQUksRUFBRTs7QUFFWCxRQUFJLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLFFBQVEsR0FBSSxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQUFBQyxFQUFFLEVBQ3pEO0FBQ0QsV0FBTyxFQUNQLE9BQU8sSUFBSSxFQUFFO0FBQ1gsVUFBSSxLQUFLLEdBQUcsTUFBTSxXQUFXLENBQUM7QUFDOUIsVUFBRyxLQUFLLENBQUMsWUFBWSxDQUFDLEVBQUUsS0FBSyxhQUFhLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFDcEQ7QUFDRSxlQUFPLFFBQVEsRUFBRSxDQUFDO09BQ25CLE1BQU07QUFDTCxZQUFJLEVBQUUsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUMxQyxZQUFJLEVBQUUsRUFBRTtBQUNOLFlBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNWLGNBQUksUUFBUSxFQUFFO0FBQ1oscUJBQVMsRUFBRSxDQUFDO0FBQ1osc0JBQVUsRUFBRSxDQUFDO0FBQ2Isb0JBQVEsR0FBRyxLQUFLLENBQUM7V0FDbEI7U0FDRixNQUFNO0FBQ0wscUJBQVcsR0FBRyxLQUFLOztBQUFDLFNBRXJCO09BQ0Y7S0FDRjtHQUNGO0NBQ0Y7OztBQy80QkQsWUFBWSxDQUFDOzs7Ozs7Ozs7OztJQUNELE9BQU87Ozs7Ozs7Ozs7SUFHYixZQUFZO0FBQ2hCLFdBREksWUFBWSxDQUNKLEVBQUUsRUFBQyxJQUFJLEVBQUMsSUFBSSxFQUN4QjswQkFGSSxZQUFZOztBQUdkLFFBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQ2IsUUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDakIsUUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7R0FDbEI7O2VBTkcsWUFBWTs7NkJBT1I7QUFDTixhQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7S0FDbEI7OztTQVRHLFlBQVk7OztBQVVqQixDQUFDOztBQUVGLElBQU0sYUFBYSxHQUNuQjtBQUNFLE9BQUssRUFBRSxJQUFJLFlBQVksQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLElBQUksQ0FBQztBQUN2QyxLQUFHLEVBQUUsSUFBSSxZQUFZLENBQUMsQ0FBQyxFQUFDLEtBQUssRUFBQyxPQUFPLENBQUM7QUFDdEMsT0FBSyxFQUFFLElBQUksWUFBWSxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsV0FBVyxDQUFDO0FBQzlDLE1BQUksRUFBRSxJQUFJLFlBQVksQ0FBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLFdBQVcsQ0FBQztBQUM1QyxJQUFFLEVBQUUsSUFBSSxZQUFZLENBQUMsQ0FBQyxFQUFDLElBQUksRUFBQyxXQUFXLENBQUM7QUFDeEMsTUFBSSxFQUFFLElBQUksWUFBWSxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsV0FBVyxDQUFDO0FBQzVDLE1BQUksRUFBRSxJQUFJLFlBQVksQ0FBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLE1BQU0sQ0FBQztBQUN2QyxNQUFJLEVBQUUsSUFBSSxZQUFZLENBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxLQUFLLENBQUM7QUFDdEMsUUFBTSxFQUFFLElBQUksWUFBWSxDQUFDLEVBQUUsRUFBQyxRQUFRLEVBQUMsUUFBUSxDQUFDO0FBQzlDLFVBQVEsRUFBRSxJQUFJLFlBQVksQ0FBQyxFQUFFLEVBQUMsVUFBVSxFQUFDLFFBQVEsQ0FBQztBQUNsRCxNQUFJLEVBQUUsSUFBSSxZQUFZLENBQUMsRUFBRSxFQUFDLE1BQU0sRUFBQyxRQUFRLENBQUM7QUFDMUMsS0FBRyxFQUFFLElBQUksWUFBWSxDQUFDLEVBQUUsRUFBQyxLQUFLLEVBQUMsUUFBUSxDQUFDO0FBQ3hDLFVBQVEsRUFBRSxJQUFJLFlBQVksQ0FBQyxFQUFFLEVBQUMsVUFBVSxFQUFDLFlBQVksQ0FBQztBQUN0RCxZQUFVLEVBQUUsSUFBSSxZQUFZLENBQUMsRUFBRSxFQUFDLFlBQVksRUFBQyxZQUFZLENBQUM7QUFDMUQsUUFBTSxFQUFFLElBQUksWUFBWSxDQUFDLEVBQUUsRUFBQyxRQUFRLEVBQUMsS0FBSyxDQUFDO0FBQzNDLFdBQVMsRUFBRSxJQUFJLFlBQVksQ0FBQyxFQUFFLEVBQUMsV0FBVyxFQUFDLE9BQU8sQ0FBQztBQUNuRCxlQUFhLEVBQUUsSUFBSSxZQUFZLENBQUMsRUFBRSxFQUFDLGVBQWUsRUFBQyxVQUFVLENBQUM7QUFDOUQsYUFBVyxFQUFFLElBQUksWUFBWSxDQUFDLEVBQUUsRUFBQyxhQUFhLEVBQUMsVUFBVSxDQUFDO0FBQzFELFFBQU0sRUFBQyxJQUFJLFlBQVksQ0FBQyxFQUFFLEVBQUMsUUFBUSxFQUFDLFVBQVUsQ0FBQztBQUMvQyxVQUFRLEVBQUMsSUFBSSxZQUFZLENBQUMsRUFBRSxFQUFDLFVBQVUsRUFBQyxTQUFTLENBQUM7QUFDbEQsV0FBUyxFQUFDLElBQUksWUFBWSxDQUFDLEVBQUUsRUFBQyxXQUFXLEVBQUMsU0FBUyxDQUFDO0FBQ3BELFlBQVUsRUFBQyxJQUFJLFlBQVksQ0FBQyxFQUFFLEVBQUMsWUFBWSxFQUFDLFVBQVUsQ0FBQztDQUN4RDs7O0FBQUMsQUFHRixJQUFNLFFBQVEsR0FDWjtBQUNFLElBQUUsRUFBRSxDQUFDO0FBQ0gsV0FBTyxFQUFFLEVBQUU7QUFDWCxXQUFPLEVBQUUsS0FBSztBQUNkLFlBQVEsRUFBRSxLQUFLO0FBQ2YsVUFBTSxFQUFFLEtBQUs7QUFDYixXQUFPLEVBQUUsS0FBSztBQUNkLGdCQUFZLEVBQUUsYUFBYSxDQUFDLEtBQUs7R0FDbEMsQ0FBQztBQUNGLElBQUUsRUFBRSxDQUFDO0FBQ0gsV0FBTyxFQUFFLEVBQUU7QUFDWCxXQUFPLEVBQUUsS0FBSztBQUNkLFlBQVEsRUFBRSxLQUFLO0FBQ2YsVUFBTSxFQUFFLEtBQUs7QUFDYixXQUFPLEVBQUUsS0FBSztBQUNkLGdCQUFZLEVBQUUsYUFBYSxDQUFDLEdBQUc7R0FDaEMsQ0FBQztBQUNGLElBQUUsRUFBRSxDQUFDO0FBQ0gsV0FBTyxFQUFFLEVBQUU7QUFDWCxXQUFPLEVBQUUsS0FBSztBQUNkLFlBQVEsRUFBRSxLQUFLO0FBQ2YsVUFBTSxFQUFFLEtBQUs7QUFDYixXQUFPLEVBQUUsS0FBSztBQUNkLGdCQUFZLEVBQUUsYUFBYSxDQUFDLEtBQUs7R0FDbEMsQ0FBQztBQUNGLElBQUUsRUFBRSxDQUFDO0FBQ0gsV0FBTyxFQUFFLEVBQUU7QUFDWCxXQUFPLEVBQUUsS0FBSztBQUNkLFlBQVEsRUFBRSxLQUFLO0FBQ2YsVUFBTSxFQUFFLEtBQUs7QUFDYixXQUFPLEVBQUUsS0FBSztBQUNkLGdCQUFZLEVBQUUsYUFBYSxDQUFDLEtBQUs7R0FDbEMsQ0FBQztBQUNGLElBQUUsRUFBRSxDQUFDO0FBQ0gsV0FBTyxFQUFFLEVBQUU7QUFDWCxXQUFPLEVBQUUsS0FBSztBQUNkLFlBQVEsRUFBRSxLQUFLO0FBQ2YsVUFBTSxFQUFFLEtBQUs7QUFDYixXQUFPLEVBQUUsS0FBSztBQUNkLGdCQUFZLEVBQUUsYUFBYSxDQUFDLElBQUk7R0FDakMsQ0FBQztBQUNGLElBQUUsRUFBRSxDQUFDO0FBQ0gsV0FBTyxFQUFFLEVBQUU7QUFDWCxXQUFPLEVBQUUsS0FBSztBQUNkLFlBQVEsRUFBRSxLQUFLO0FBQ2YsVUFBTSxFQUFFLEtBQUs7QUFDYixXQUFPLEVBQUUsS0FBSztBQUNkLGdCQUFZLEVBQUUsYUFBYSxDQUFDLEVBQUU7R0FDL0IsQ0FBQztBQUNGLElBQUUsRUFBRSxDQUFDO0FBQ0gsV0FBTyxFQUFFLEVBQUU7QUFDWCxXQUFPLEVBQUUsS0FBSztBQUNkLFlBQVEsRUFBRSxLQUFLO0FBQ2YsVUFBTSxFQUFFLEtBQUs7QUFDYixXQUFPLEVBQUUsS0FBSztBQUNkLGdCQUFZLEVBQUUsYUFBYSxDQUFDLElBQUk7R0FDakMsQ0FBQztBQUNGLEtBQUcsRUFBRSxDQUFDO0FBQ0osV0FBTyxFQUFF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QyxFQUFFLElBQUksQ0FBQztBQUFBLEFBQzFELFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxBQUM5RCxXQUFLLENBQUM7QUFBRSxlQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEFBQ2xFLFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEFBQ3RFLFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxBQUMxRSxXQUFLLENBQUM7QUFBRSxlQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEtBQy9FOztBQUVELFNBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsR0FBRyxHQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDbEQsVUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDNUI7O0FBRUQsYUFBUyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFB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QUFJLENBQUM7QUFDdEIsUUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2hCLFFBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQztBQUMvQixRQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDbEMsUUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQ2xDLFFBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQztBQUMvQixZQUFRLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztHQUU1QztDQUNGLENBQUE7O0FBRUQsSUFDRSxDQUFDLEdBQUksSUFBSSxJQUFJLENBQUUsQ0FBQyxFQUFDLElBQUksQ0FBQztJQUN0QixFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUUsQ0FBQyxFQUFDLElBQUksQ0FBQztJQUN0QixDQUFDLEdBQUksSUFBSSxJQUFJLENBQUUsQ0FBQyxFQUFDLElBQUksQ0FBQztJQUN0QixFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUUsQ0FBQyxFQUFDLElBQUksQ0FBQztJQUN0QixDQUFDLEdBQUksSUFBSSxJQUFJLENBQUUsQ0FBQyxFQUFDLElBQUksQ0FBQztJQUN0QixDQUFDLEdBQUksSUFBSSxJQUFJLENBQUUsQ0FBQyxFQUFDLElBQUksQ0FBQztJQUN0QixFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUUsQ0FBQyxFQUFDLElBQUksQ0FBQztJQUN0QixDQUFDLEdBQUksSUFBSSxJQUFJLENBQUUsQ0FBQyxFQUFDLElBQUksQ0FBQztJQUN0QixFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUUsQ0FBQyxFQUFDLElBQUksQ0FBQztJQUN0QixDQUFDLEdBQUksSUFBSSxJQUFJLENBQUUsQ0FBQyxFQUFDLElBQUksQ0FBQztJQUN0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LEVBQUUsR0FBRyxFQUFFO0FBQ3JDLE1BQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNqRCxNQUFJLENBQUMsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sRUFDM0I7QUFDRSxRQUFHLFFBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEtBQUssUUFBUSxJQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLFlBQVksSUFBSSxDQUFBLEFBQUMsRUFDekY7QUFDRSxVQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNsQyxVQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUN4QixhQUFPLElBQUksT0FBTyxDQUNsQixDQUFDLEFBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRSxJQUFJLEdBQUMsS0FBSyxDQUFBLElBQUssS0FBSyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsQ0FBQyxJQUFJLElBQUksRUFDdEQsQ0FBQyxBQUFDLENBQUMsSUFBSSxDQUFDLEdBQUksR0FBRyxHQUFHLEtBQUssQ0FBQSxJQUFLLEtBQUssQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQ3hELENBQUMsQUFBQyxDQUFDLElBQUksQ0FBQyxHQUFJLElBQUksR0FBRyxLQUFLLENBQUEsSUFBSyxLQUFLLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxDQUFDLElBQUksSUFBSSxFQUMxRCxDQUFDLEFBQUMsQ0FBQyxJQUFJLENBQUMsR0FBSSxJQUFJLEdBQUcsS0FBSyxDQUFBLElBQUssS0FBSyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsQ0FBQyxJQUFJLElBQUksRUFDMUQsQ0FBQyxBQUFDLENBQUMsSUFBSSxDQUFDLEdBQUksR0FBRyxHQUFHLEtBQUssQ0FBQSxJQUFLLEtBQUssQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQ3ZELENBQUM7S0FDSDtHQUNGO0FBQ0QsU0FBTyxJQUFJLE9BQU8sQ0FBQyxJQUFJLElBQUksSUFBSSxFQUFFLEdBQUcsSUFBSSxJQUFJLEVBQUUsSUFBSSxJQUFJLElBQUksRUFBRSxJQUFJLElBQUksSUFBSSxFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQztDQUN4Rjs7QUFFRCxTQUFTLEVBQUUsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFO0FBQ3RDLFNBQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztDQUN6Qzs7QUFFRCxTQUFTLEVBQUUsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRyxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRTtBQUMzQyxTQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0NBQzVDOztBQUVELFNBQVMsRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUU7QUFDdEMsU0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0NBQ3RDOzs7O0FBQUEsQUFLRCxTQUFTLENBQUMsQ0FBQyxHQUFHLEVBQUMsR0FBRyxFQUNsQjtBQUNFLE1BQUksQ0FBQyxHQUFHLEtBQUssQ0FBQztBQUNkLE1BQUksR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDakIsU0FBTyxBQUFDLFNBQVMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUEsQ0FBQyxBQUFDLEdBQUksR0FBRyxDQUFDO0NBQzFDOztBQUVELFNBQVMsSUFBSSxDQUFDLElBQUksRUFBRTtBQUNsQixNQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztDQUNsQjs7QUFFRCxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxVQUFVLEtBQUssRUFDeEM7QUFDRSxPQUFLLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0NBQzdCLENBQUE7O0FBRUQsU0FBUyxFQUFFLENBQUMsSUFBSSxFQUNoQjtBQUNFLFNBQU8sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDdkI7O0FBRUQsU0FBUyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRTtBQUNuQixTQUFPLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztDQUM5Qjs7OztBQUFBLEFBSUQsU0FBUyxRQUFRLENBQUMsSUFBSSxFQUFFO0FBQ3RCLE1BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0NBQ2xCOztBQUVELFFBQVEsQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFVBQVUsS0FBSyxFQUFFO0FBQzVDLE9BQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7Q0FDN0IsQ0FBQTs7QUFFRCxTQUFTLEVBQUUsQ0FBQyxJQUFJLEVBQUU7QUFDaEIsU0FBTyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUMzQjs7OztBQUFBLEFBSUQsU0FBUyxRQUFRLENBQUMsR0FBRyxFQUFFO0FBQ3JCLE1BQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0NBQ2hCOztBQUVELFFBQVEsQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFVBQVUsS0FBSyxFQUFFO0FBQzVDLE9BQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7Q0FDM0IsQ0FBQTs7QUFFRCxTQUFTLENBQUMsQ0FBQyxHQUFHLEVBQUU7QUFDZCxTQUFPLElBQUksUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQzFCOztBQUdELFNBQVMsSUFBSSxDQUFDLEdBQUcsRUFBRTtBQUFFLE1BQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0NBQUMsQ0FBQztBQUN0QyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxVQUFVLEtBQUssRUFDeEM7QUFDRSxPQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7Q0FDekI7OztBQUFBLEFBR0QsU0FBUyxJQUFJLENBQUMsRUFBRSxFQUNoQjtBQUNFLE1BQUksQ0FBQyxFQUFFLEdBQUcsRUFBRTs7QUFBQyxDQUVkOztBQUVELElBQUksQ0FBQyxTQUFTLEdBQ2Q7QUFDRSxTQUFPLEVBQUUsaUJBQVUsS0FBSyxFQUN4QjtBQUNFLFNBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0dBQ25FO0NBQ0YsQ0FBQTtBQUNELFNBQVMsSUFBSSxDQUFDLEVBQUUsRUFDaEI7QUFDRSxTQUFPLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0NBQ3JCOztBQUVELFNBQVMsSUFBSSxDQUFDLEdBQUcsRUFBRTtBQUNqQixTQUFPLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ3RCOztBQUVELFNBQVMsSUFBSSxDQUFDLElBQUksRUFDbEI7QUFDRSxNQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztDQUNsQjs7QUFFRCxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxVQUFTLEtBQUssRUFDdkM7QUFDRSxNQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQ3hDLE9BQUssQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDLFdBQVcsR0FBRyxBQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxJQUFLLFNBQVMsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFBLEFBQUMsQ0FBQztBQUMxRixPQUFLLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0NBQzdCLENBQUE7O0FBRUQsU0FBUyxFQUFFLENBQUMsSUFBSSxFQUFFO0FBQ2hCLFNBQU8sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDdkI7QUFDRCxTQUFTLENBQUMsQ0FBQyxHQUFHLEVBQUMsR0FBRyxFQUFFO0FBQ2xCLFNBQU8sSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0NBQzdCOztBQUVELFNBQVMsTUFBTSxDQUFDLEdBQUcsRUFBRTtBQUNuQixNQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztDQUNoQjtBQUNELE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFVBQVMsS0FBSyxFQUN6QztBQUNFLE9BQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7Q0FDM0IsQ0FBQTs7QUFFRCxTQUFTLENBQUMsQ0FBQyxHQUFHLEVBQUU7QUFDZCxTQUFPLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ3hCOztBQUVELFNBQVMsUUFBUSxDQUFDLENBQUMsRUFBRTtBQUFFLE1BQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQUUsQ0FBQztBQUNyQyxRQUFRLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxVQUFTLEtBQUssRUFBRTtBQUMzQyxPQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO0NBQzFCLENBQUE7O0FBRUQsSUFBSSxFQUFFLEdBQUcsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDekIsSUFBSSxFQUFFLEdBQUcsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFMUIsU0FBUyxLQUFLLENBQUMsS0FBSyxFQUNwQjtBQUNFLE1BQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0NBQ3BCOztBQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFVBQVMsS0FBSyxFQUN4QztBQUNFLE9BQUssQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUs7O0FBQUMsQ0FFL0IsQ0FBQTs7QUFFRCxTQUFTLEtBQUssQ0FBQyxLQUFLLEVBQ3BCO0FBQ0UsU0FBTyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztDQUN6Qjs7QUFFRCxTQUFTLFFBQVEsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQ2pEO0FBQ0UsTUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7QUFDckIsTUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDbkIsTUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7QUFDdkIsTUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7Q0FDeEI7O0FBRUQsUUFBUSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsVUFBUyxLQUFLLEVBQzNDO0FBQ0UsTUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQztBQUMxRCxVQUFRLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDOUIsVUFBUSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQzVCLFVBQVEsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztBQUNoQyxVQUFRLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7Q0FDakMsQ0FBQTs7QUFFRCxTQUFTLEdBQUcsQ0FBQyxNQUFNLEVBQUMsS0FBSyxFQUFDLE9BQU8sRUFBRSxPQUFPLEVBQzFDO0FBQ0UsU0FBTyxJQUFJLFFBQVEsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztDQUN0RDs7O0FBQUEsQUFHRCxTQUFTLE1BQU0sQ0FBQyxNQUFNLEVBQ3RCO0FBQ0UsTUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7Q0FDdEI7O0FBRUQsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsVUFBUyxLQUFLLEVBQ3pDO0FBQ0UsTUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzlDLE9BQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztDQUM1QixDQUFBOztBQUVELFNBQVMsTUFBTSxDQUFDLE1BQU0sRUFDdEI7QUFDRSxTQUFPLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0NBQzNCOztBQUVELFNBQVMsTUFBTSxDQUFDLE1BQU0sRUFDdEI7QUFDRSxNQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztDQUN0Qjs7QUFFRCxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxVQUFTLEtBQUssRUFDekM7QUFDRSxPQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7Q0FDOUYsQ0FBQTs7QUFFRCxTQUFTLE1BQU0sQ0FBQyxNQUFNLEVBQ3RCO0FBQ0UsU0FBTyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztDQUMzQjs7QUFFRCxTQUFTLFFBQVEsQ0FBQyxHQUFHLEVBQUMsT0FBTyxFQUFFLEtBQUssRUFBQyxNQUFNLEVBQzNDO0FBQ0UsTUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7QUFDdkIsTUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDbkIsTUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFDZixNQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztDQUN0Qjs7QUFFRCxTQUFTLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFO0FBQzVCLE1BQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxRQUFRLENBQUMsSUFBSSxFQUFDLE9BQU8sRUFBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDcEQ7O0FBRUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsVUFBVSxLQUFLLEVBQ3hDO0FBQ0UsTUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztBQUN4QixNQUFJLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxJQUFJLEVBQzdEO0FBQ0UsUUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUN2QixTQUFLLENBQUMsSUFBSSxDQUFDLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7R0FDcEU7Q0FDRixDQUFBOztBQUVELFNBQVMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUU7QUFDNUIsU0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUMsS0FBSyxDQUFDLENBQUM7Q0FDaEM7O0FBRUQsU0FBUyxPQUFPLEdBQ2hCLEVBQ0M7O0FBRUQsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsVUFBUyxLQUFLLEVBQzFDO0FBQ0UsTUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM3QyxJQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDWCxNQUFJLEVBQUUsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUFFO0FBQ2hCLFNBQUssQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQztHQUMxQixNQUFNO0FBQ0wsU0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztHQUNuQjtDQUNGLENBQUE7O0FBRUQsSUFBSSxRQUFRLEdBQUcsSUFBSSxPQUFPLEVBQUU7OztBQUFDLEFBRzdCLFNBQVMsS0FBSyxDQUFDLFNBQVMsRUFBQyxPQUFPLEVBQUMsS0FBSyxFQUN0QztBQUNFLE1BQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ2YsTUFBSSxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUM7QUFDakIsTUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFDckIsTUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7QUFDM0IsTUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7QUFDdkIsTUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDaEIsTUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7QUFDbEIsTUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN0QixNQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUM7QUFDbEMsTUFBSSxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUM7QUFDdkIsTUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7QUFDbkIsTUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7QUFDbEIsTUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNsQixNQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2hCLE1BQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQ25CLE1BQUksQ0FBQyxJQUFJLEdBQUc7QUFDVixRQUFJLEVBQUUsRUFBRTtBQUNSLE9BQUcsRUFBRSxDQUFDO0FBQ04sUUFBSSxFQUFFLEVBQUU7QUFDUixRQUFJLEVBQUUsRUFBRTtBQUNSLE9BQUcsRUFBQyxHQUFHO0dBQ1IsQ0FBQTtBQUNELE1BQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO0NBQ2pCOztBQUVELEtBQUssQ0FBQyxTQUFTLEdBQUc7QUFDaEIsU0FBTyxFQUFFLGlCQUFVLFdBQVcsRUFBRTs7QUFFOUIsUUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLE9BQU87O0FBRXJCLFFBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNoQixVQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDZDs7QUFFRCxRQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztBQUNsQyxRQUFJLElBQUksQ0FBQyxNQUFNLElBQUksT0FBTyxFQUFFO0FBQzFCLFVBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQ3hCO0FBQ0UsWUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7T0FDakIsTUFBTTtBQUNMLFlBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDO0FBQ2hCLGVBQU87T0FDUjtLQUNGOztBQUVELFFBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7QUFDdkIsUUFBSSxDQUFDLFdBQVcsR0FBRyxBQUFDLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLEdBQUksSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7QUFDNUUsUUFBSSxPQUFPLEdBQUcsV0FBVyxHQUFHLEdBQUcsUUFBQSxDQUFROztBQUV2QyxXQUFPLElBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxFQUFFO0FBQzVCLFVBQUksSUFBSSxDQUFDLFdBQVcsSUFBSSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ2hELGNBQU07T0FDUCxNQUFNO0FBQ0wsWUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN6QixTQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2hCLFlBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztPQUNmO0tBQ0Y7R0FDRjtBQUNELE9BQUssRUFBQyxpQkFDTjtBQUNFLFFBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMvQyxZQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1QyxZQUFRLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN6RCxZQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQzdCLFFBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdEIsUUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDaEIsUUFBSSxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUM7R0FDbEI7O0NBRUYsQ0FBQTs7QUFFRCxTQUFTLFVBQVUsQ0FBQyxJQUFJLEVBQUMsTUFBTSxFQUFFLFNBQVMsRUFDMUM7QUFDRSxPQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRTtBQUN6QyxRQUFJLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDMUQsU0FBSyxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO0FBQ3JDLFNBQUssQ0FBQyxPQUFPLEdBQUcsQUFBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUUsS0FBSyxHQUFDLElBQUksQ0FBQztBQUNuRCxTQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUNoQixVQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0dBQ3BCO0NBQ0Y7O0FBRUQsU0FBUyxZQUFZLENBQUMsU0FBUyxFQUMvQjtBQUNFLE1BQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUNoQixZQUFVLENBQUMsSUFBSSxFQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztBQUNuQyxTQUFPLE1BQU0sQ0FBQztDQUNmOzs7QUFBQSxBQUdNLFNBQVMsU0FBUyxDQUFDLEtBQUssRUFBRTtBQUMvQixNQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztBQUNuQixNQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztBQUNuQixNQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUNwQixNQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQztBQUNsQixNQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUNqQixNQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztBQUNuQixNQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7Q0FDekI7O0FBRUQsU0FBUyxDQUFDLFNBQVMsR0FBRztBQUNwQixNQUFJLEVBQUUsY0FBUyxJQUFJLEVBQ25CO0FBQ0UsUUFBRyxJQUFJLENBQUMsSUFBSSxFQUFFO0FBQ1osVUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0tBQ2I7QUFDRCxRQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDdkIsY0FBVSxDQUFDLElBQUksRUFBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0dBQ3REO0FBQ0QsT0FBSyxFQUFDLGlCQUNOOztBQUVFLFFBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztBQUN4QixRQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7R0FDaEI7QUFDRCxTQUFPLEVBQUMsbUJBQ1I7QUFDRSxRQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtBQUM1QixVQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM3QixVQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7S0FDL0Q7R0FDRjtBQUNELFlBQVUsRUFBRSxvQkFBVSxNQUFNLEVBQUM7QUFDM0IsUUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsV0FBVzs7QUFBQyxBQUVsRCxTQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFO0FBQ2pELFlBQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDaEM7R0FDRjtBQUNELE9BQUssRUFBQyxpQkFDTjtBQUNFLFFBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUN6QixRQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQztHQUNsRDtBQUNELFFBQU0sRUFBQyxrQkFDUDtBQUNFLFFBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO0FBQzdCLFVBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztBQUN4QixVQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBQ3pCLFVBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO0FBQzlELFdBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUU7QUFDakQsY0FBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsSUFBSSxNQUFNLENBQUM7T0FDakM7QUFDRCxVQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDaEI7R0FDRjtBQUNELE1BQUksRUFBRSxnQkFDTjtBQUNFLFFBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO0FBQzVCLGtCQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQzs7QUFBQyxBQUUxQixVQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDeEIsVUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ2Q7R0FDRjtBQUNELE9BQUssRUFBQyxpQkFDTjtBQUNFLFNBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUN0RDtBQUNFLFVBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDeEI7R0FDRjtBQUNELE1BQUksRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUNYLE1BQUksRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUNYLE9BQUssRUFBQyxDQUFDLEdBQUcsQ0FBQztDQUNaOzs7QUFBQSxBQUdELFNBQVMsS0FBSyxDQUFDLEtBQUssRUFBRTtBQUNwQixNQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztBQUNuQixNQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDbkUsTUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztDQUM1Qjs7QUFFRCxLQUFLLENBQUMsU0FBUyxHQUFHO0FBQ2hCLElBQUUsRUFBRSxZQUFVLENBQUMsRUFBRTtBQUNmLFFBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDN0MsUUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDLEVBQUU7QUFDZixVQUFJLENBQUMsQ0FBQyxPQUFPLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxPQUFPLEdBQUcsRUFBRSxFQUFFO0FBQ3BDLFlBQUksTUFBTSxHQUFHLENBQUMsQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0FBQzVCLFlBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUNwRCxpQkFBUyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDL0IsaUJBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNuQixpQkFBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLE9BQU8sSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFBLEFBQUMsQ0FBQyxDQUFDO09BQ2hEO0FBQ0QsYUFBTyxJQUFJLENBQUM7S0FDYixNQUFNOztBQUVMLFVBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQ3RCLFlBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxRQUFRLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQSxBQUFDLEVBQUMsR0FBRyxDQUFDLENBQUM7QUFDakUsWUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUM7T0FDMUI7QUFDRCxhQUFPLEtBQUssQ0FBQztLQUNkO0dBRUY7QUFDRCxLQUFHLEVBQUUsYUFBVSxDQUFDLEVBQUU7QUFDaEIsUUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztBQUM3QyxRQUFJLEtBQUssSUFBSSxDQUFDLENBQUMsRUFBRTtBQUNmLGFBQU8sSUFBSSxDQUFDO0tBQ2IsTUFBTTtBQUNMLFVBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUNyQixhQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkMsWUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUM7T0FDM0I7QUFDRCxhQUFPLEtBQUssQ0FBQztLQUNkO0dBQ0Y7Q0FDRixDQUFBOztBQUVNLElBQUksT0FBTyxXQUFQLE9BQU8sR0FBRztBQUNuQixNQUFJLEVBQUUsTUFBTTtBQUNaLFFBQU0sRUFBRSxDQUNOO0FBQ0UsUUFBSSxFQUFFLE9BQU87QUFDYixXQUFPLEVBQUUsQ0FBQztBQUNWLFFBQUksRUFDSixDQUNFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsRUFDMUIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDckQsSUFBSSxDQUFDLEdBQUcsRUFBQyxDQUFDLENBQUMsRUFDWCxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUN0QixRQUFRLEVBQ1IsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUNSO0dBQ0YsRUFDRDtBQUNFLFFBQUksRUFBRSxPQUFPO0FBQ2IsV0FBTyxFQUFFLENBQUM7QUFDVixRQUFJLEVBQ0YsQ0FDQSxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEVBQzFCLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFDL0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFDWixDQUFDLEVBQ0QsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ3JELENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUMzQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQ047R0FDSixFQUNEO0FBQ0UsUUFBSSxFQUFFLE9BQU87QUFDYixXQUFPLEVBQUUsQ0FBQztBQUNWLFFBQUksRUFDRixDQUNBLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsRUFDMUIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUMvQyxDQUFDLENBQUMsQ0FB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RSxlQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxBQUMxRCxXQUFLLENBQUM7QUFBRSxlQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsQUFDOUQsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxBQUNsRSxXQUFLLENBQUM7QUFBRSxlQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxBQUN0RSxXQUFLLENBQUM7QUFBRSxlQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsQUFDMUUsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxLQUMvRTs7QUFFRCxTQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsR0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ2xELFVBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzVCOztBQUVELGFBQVMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7R0FDN0MsTUFBTTtBQUNMLFFBQUksTUFBTSxHQUFHLFNBQVMsQ0FBQyxNQUFNO1FBQ3pCLENBQUMsQ0FBQzs7QUFFTixTQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUMzQixVQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRXBGLGNBQVEsR0FBRztBQUNULGFBQUssQ0FBQztBQUFFLG1CQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQUFBQyxNQUFNO0FBQUEsQUFDMUQsYUFBSyxDQUFDO0FBQUUsbUJBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsQUFBQyxNQUFNO0FBQUEsQUFDOUQsYUFBSyxDQUFDO0FBQUUsbUJBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEFBQUMsTUFBTTtBQUFBLEFBQ2xFO0FBQ0UsY0FBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsR0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzdELGdCQUFJ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QUFDLEtBQUssRUFBRSxDQUFDO0FBQzdDLFVBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksSUFBSSxJQUFJLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ2xHLFVBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDdEcsY0FBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7QUFDM0MsY0FBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7QUFDN0MsVUFBSSxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUMzRixVQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQy9GLFNBQUcsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztBQUMzQixVQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDOztBQUVsQyxV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LE1BQUksS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSztNQUFFLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU07O0FBQUMsQUFFM0QsS0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDM0QsTUFBSSxTQUFTLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDL0MsS0FBRyxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUMsU0FBUyxHQUFHLHVCQUF1QixDQUFDOztBQUUxRCxLQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUEsR0FBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDcEQsS0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ2hCLEtBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxLQUFLLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUNyQyxLQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDYixLQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxLQUFLLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQSxHQUFJLE9BQU8sR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDM0QsTUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO0NBQ2pDOzs7QUFBQSxBQUdNLFNBQVMsdUJBQXVCLENBQUMsS0FBSyxFQUFFO0FBQzdDLE1BQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDOUMsTUFBSSxDQUFDLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUss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WjtBQUNOLFVBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO0FBQ3JCLFVBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO0FBQ25CLFVBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQ3pDLFVBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztLQUMxQjs7OzZCQUVRO0FBQ1AsVUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQ3BDLFVBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsR0FBRyxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztBQUMvRCxVQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7S0FDMUI7Ozs0QkFFTztBQUNOLFVBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQ3ZDLFVBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztLQUMxQjs7OzJCQUVNO0FBQ0wsVUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0tBQ3pCOzs7NkJBRVE7QUFDUCxVQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRSxPQUFPO0FBQ3RDLFVBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUNwQyxVQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO0FBQzVDLFVBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO0FBQ3JELFVBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDO0tBQzVCOzs7U0F6Q1UsU0FBUyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbnRyb2xsZXIge1xyXG4gIGNvbnN0cnVjdG9yKGRldnRvb2wpXHJcbiAge1xyXG4gICAgdGhpcy5kZXZ0b29sID0gZGV2dG9vbDtcclxuICAgIGxldCBnID0gZGV2dG9vbC5nYW1lO1xyXG4gICAgbGV0IGRlYnVnVWkgPSBkZXZ0b29sLmRlYnVnVWk7XHJcbiAgICAvLyDliLblvqHnlLvpnaIgXHJcbiAgICBsZXQgdG9nZ2xlID0gZGV2dG9vbC50b2dnbGVHYW1lKCk7XHJcbiAgICBcclxuICAgIGxldCBjb250cm9sbGVyRGF0YSA9IFxyXG4gICAgW1xyXG4gICAgICAvL+OAgOOCsuODvOODoOODl+ODrOOCpFxyXG4gICAgICB7XHJcbiAgICAgICAgbmFtZToncGxheScsXHJcbiAgICAgICAgZnVuYygpe1xyXG4gICAgICAgICAgdGhpcy5hdHRyKCdjbGFzcycsdG9nZ2xlLm5leHQoZmFsc2UpLnZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIF07XHJcbiAgICBcclxuICAgIGxldCBjb250cm9sbGVyID0gZGVidWdVaS5hcHBlbmQoJ2RpdicpLmF0dHIoJ2lkJywnY29udHJvbCcpLmNsYXNzZWQoJ2NvbnRyb2xsZXInLHRydWUpO1xyXG4gICAgbGV0IGJ1dHRvbnMgPSBjb250cm9sbGVyLnNlbGVjdEFsbCgnYnV0dG9uJykuZGF0YShjb250cm9sbGVyRGF0YSlcclxuICAgIC5lbnRlcigpLmFwcGVuZCgnYnV0dG9uJyk7XHJcbiAgICBidXR0b25zLmF0dHIoJ2NsYXNzJyxkPT5kLm5hbWUpO1xyXG4gICAgXHJcbiAgICBidXR0b25zLm9uKCdjbGljaycsZnVuY3Rpb24oZCl7XHJcbiAgICAgIGQuZnVuYy5hcHBseShkMy5zZWxlY3QodGhpcykpO1xyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIGNvbnRyb2xsZXIuYXBwZW5kKCdzcGFuJykudGV4dCgn44K544OG44O844K4Jykuc3R5bGUoeyd3aWR0aCc6JzEwMHB4JywnZGlzcGxheSc6J2lubGluZS1ibG9jaycsJ3RleHQtYWxpZ24nOidjZW50ZXInfSk7XHJcbiAgICBcclxuICAgIHZhciBzdGFnZSA9IGNvbnRyb2xsZXJcclxuICAgIC5hcHBlbmQoJ2lucHV0JylcclxuICAgIC5hdHRyKHsndHlwZSc6J3RleHQnLCd2YWx1ZSc6Zy5zdGFnZS5ub30pXHJcbiAgICAuc3R5bGUoeyd3aWR0aCc6JzQwcHgnLCd0ZXh0LWFsaWduJzoncmlnaHQnfSk7XHJcbiAgICBnLnN0YWdlLm9uKCd1cGRhdGUnLChkKT0+e1xyXG4gICAgICBzdGFnZS5ub2RlKCkudmFsdWUgPSBkLm5vO1xyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIHN0YWdlLm9uKCdjaGFuZ2UnLGZ1bmN0aW9uKCl7XHJcbiAgICAgIGxldCB2ID0gIHBhcnNlSW50KHRoaXMudmFsdWUpO1xyXG4gICAgICBpZihnLnN0YWdlLm5vICE9IHYpe1xyXG4gICAgICAgIGcuc3RhZ2UuanVtcCh2KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIFxyXG4gIH1cclxuICBcclxuICBhY3RpdmUoKXtcclxuICAgIFxyXG4gIH1cclxuICBcclxuICBoaWRlKCl7XHJcbiAgICBcclxuICB9XHJcbn1cclxuIiwiIFwidXNlIHN0cmljdFwiO1xyXG4vL3ZhciBTVEFHRV9NQVggPSAxO1xyXG5pbXBvcnQgKiBhcyBzZmcgZnJvbSAnLi4vLi4vanMvZ2xvYmFsJzsgXHJcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi4vLi4vanMvdXRpbCc7XHJcbmltcG9ydCAqIGFzIGF1ZGlvIGZyb20gJy4uLy4uL2pzL2F1ZGlvJztcclxuLy9pbXBvcnQgKiBhcyBzb25nIGZyb20gJy4vc29uZyc7XHJcbmltcG9ydCAqIGFzIGdyYXBoaWNzIGZyb20gJy4uLy4uL2pzL2dyYXBoaWNzJztcclxuaW1wb3J0ICogYXMgaW8gZnJvbSAnLi4vLi4vanMvaW8nO1xyXG5pbXBvcnQgKiBhcyBjb21tIGZyb20gJy4uLy4uL2pzL2NvbW0nO1xyXG5pbXBvcnQgKiBhcyB0ZXh0IGZyb20gJy4uLy4uL2pzL3RleHQnO1xyXG5pbXBvcnQgKiBhcyBnYW1lb2JqIGZyb20gJy4uLy4uL2pzL2dhbWVvYmonO1xyXG5pbXBvcnQgKiBhcyBteXNoaXAgZnJvbSAnLi4vLi4vanMvbXlzaGlwJztcclxuaW1wb3J0ICogYXMgZW5lbWllcyBmcm9tICcuLi8uLi9qcy9lbmVtaWVzJztcclxuaW1wb3J0ICogYXMgZWZmZWN0b2JqIGZyb20gJy4uLy4uL2pzL2VmZmVjdG9iaic7XHJcbmltcG9ydCB7IERldlRvb2wgfSBmcm9tICcuL2RldnRvb2wnO1xyXG5pbXBvcnQgeyBHYW1lIH0gZnJvbSAnLi4vLi4vanMvZ2FtZSc7XHJcblxyXG4vLy8g44Oh44Kk44OzXHJcbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgc2ZnLmdhbWUgPSBuZXcgR2FtZSgpO1xyXG4gIHNmZy5kZXZUb29sID0gbmV3IERldlRvb2woc2ZnLmdhbWUpOyAgXHJcbiAgc2ZnLmdhbWUuZXhlYygpO1xyXG59O1xyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmltcG9ydCAqIGFzIHNmZyBmcm9tICcuLi8uLi9qcy9nbG9iYWwnO1xyXG5pbXBvcnQgKiBhcyBhdWRpbyBmcm9tICcuLi8uLi9qcy9hdWRpbyc7XHJcbmltcG9ydCBDb250cm9sbGVyIGZyb20gJy4vY29udHJvbGxlcic7XHJcbmltcG9ydCBFbmVteUVkaXRvciBmcm9tICcuL2VuZW15RWRpdG9yJztcclxuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBEZXZUb29sIHtcclxuICBjb25zdHJ1Y3RvcihnYW1lKSB7XHJcbiAgICB0aGlzLmdhbWUgPSBnYW1lO1xyXG4vLyAgICB0aGlzLnN0YXR1cyA9IERldlRvb2wuU1RBVFVTLlNUT1A7XHJcbiAgICB0aGlzLmtleWRvd24gPSB0aGlzLmtleWRvd25fKCk7XHJcbiAgICB0aGlzLmtleWRvd24ubmV4dCgpO1xyXG4gICAgZDMuc2VsZWN0KCdib2R5Jykub24oJ2tleWRvd24uRGV2VG9vbCcsICgpID0+IHtcclxuICAgICAgdmFyIGUgPSBkMy5ldmVudDtcclxuICAgICAgaWYodGhpcy5rZXlkb3duLm5leHQoZSkudmFsdWUpe1xyXG4gICAgICAgIGQzLmV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgZDMuZXZlbnQuY2FuY2VsQnViYmxlID0gdHJ1ZTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH07XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgdmFyIHRoaXNfID0gdGhpcztcclxuICAgIHZhciBpbml0Q29uc29sZSA9IGdhbWUuaW5pdENvbnNvbGU7XHJcbiAgICBnYW1lLmluaXRDb25zb2xlID0gKGZ1bmN0aW9uKClcclxuICAgIHtcclxuICAgICAgaW5pdENvbnNvbGUuYXBwbHkoZ2FtZSxbJ2NvbnNvbGUtZGVidWcnXSk7XHJcbiAgICAgIHRoaXNfLmluaXRDb25zb2xlKCk7XHJcbiAgICAgIGQzLnNlbGVjdCgnI2NvbnNvbGUnKS5hdHRyKCd0YWJJbmRleCcsMSk7XHJcbiAgICB9KS5iaW5kKGdhbWUpO1xyXG4gICAgXHJcbiAgICBnYW1lLmJhc2ljSW5wdXQuYmluZCA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgIGQzLnNlbGVjdCgnI2NvbnNvbGUnKS5vbigna2V5ZG93bi5iYXNpY0lucHV0JyxnYW1lLmJhc2ljSW5wdXQua2V5ZG93bi5iaW5kKGdhbWUuYmFzaWNJbnB1dCkpO1xyXG4gICAgICBkMy5zZWxlY3QoJyNjb25zb2xlJykub24oJ2tleXVwLmJhc2ljSW5wdXQnLGdhbWUuYmFzaWNJbnB1dC5rZXl1cC5iaW5kKGdhbWUuYmFzaWNJbnB1dCkpO1xyXG4gICAgfTtcclxuICAgIFxyXG4gICAgZ2FtZS5iYXNpY0lucHV0LnVuYmluZCA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgIGQzLnNlbGVjdCgnI2NvbnNvbGUnKS5vbigna2V5ZG93bi5iYXNpY0lucHV0JyxudWxsKTtcclxuICAgICAgZDMuc2VsZWN0KCcjY29uc29sZScpLm9uKCdrZXl1cC5iYXNpY0lucHV0JyxudWxsKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZ2FtZS5nYW1lSW5pdCA9IGZ1bmN0aW9uKiAodGFza0luZGV4KSB7XHJcbiAgICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG5cclxuICAgICAgLy8g44Kq44O844OH44Kj44Kq44Gu6ZaL5aeLXHJcbiAgICAgIHRoaXMuYXVkaW9fLnN0YXJ0KCk7XHJcbiAgICAgIHRoaXMuc2VxdWVuY2VyLmxvYWQoYXVkaW8uc2VxRGF0YSk7XHJcbiAgICAgIHRoaXMuc2VxdWVuY2VyLnN0YXJ0KCk7XHJcbiAgICAgIC8vc2ZnLnN0YWdlLnJlc2V0KCk7XHJcbiAgICAgIHRoaXMudGV4dFBsYW5lLmNscygpO1xyXG4gICAgICB0aGlzLmVuZW1pZXMucmVzZXQoKTtcclxuXHJcbiAgICAgIC8vIOiHquapn+OBruWIneacn+WMllxyXG4gICAgICB0aGlzLm15c2hpcF8uaW5pdCgpO1xyXG4gICAgICBzZmcuZ2FtZVRpbWVyLnN0YXJ0KCk7XHJcbiAgICAgIHRoaXMuc2NvcmUgPSAwO1xyXG4gICAgICB0aGlzLnRleHRQbGFuZS5wcmludCgyLCAwLCAnU2NvcmUgICAgSGlnaCBTY29yZScpO1xyXG4gICAgICB0aGlzLnRleHRQbGFuZS5wcmludCgyMCwgMzksICdSZXN0OiAgICcgKyBzZmcubXlzaGlwXy5yZXN0KTtcclxuICAgICAgdGhpcy5wcmludFNjb3JlKCk7XHJcbiAgICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLnN0YWdlSW5pdC5iaW5kKHRoaXMpLypnYW1lQWN0aW9uKi8pO1xyXG4gICBcclxuICAgIH07XHJcbiAgICBcclxuICAgIGdhbWUuaW5pdCA9IChmdW5jdGlvbioodGFza0luZGV4KXtcclxuICAgICAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgICAgIHRoaXMuaW5pdENvbW1BbmRIaWdoU2NvcmUoKTtcclxuICAgICAgdGhpcy5pbml0QWN0b3JzKCk7XHJcbiAgICAgIC8vZnMud3JpdGVGaWxlU3luYygnZW5lbXlGb3JtYXRpb25QYXR0ZXJuLmpzb24nLEpTT04uc3RyaW5naWZ5KHRoaXMuZW5lbWllcy5tb3ZlU2VxcyxudWxsLCcnKSwndXRmOCcpO1xyXG4gICAgfSkuYmluZChnYW1lKTsgICAgICBcclxuXHJcblxyXG4gIH1cclxuXHJcbiAgKmtleWRvd25fKCkge1xyXG4gICAgdmFyIGUgPSB5aWVsZDtcclxuICAgIHdoaWxlICh0cnVlKSB7XHJcbiAgICAgIHZhciBwcm9jZXNzID0gZmFsc2U7XHJcbiAgICAgIGlmIChlLmtleUNvZGUgPT0gMTkyKSB7IC8vIEAgS2V5XHJcbiAgICAgICAgc2ZnLkNIRUNLX0NPTExJU0lPTiA9ICFzZmcuQ0hFQ0tfQ09MTElTSU9OO1xyXG4gICAgICAgIHByb2Nlc3MgPSB0cnVlO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgLy8gaWYgKGUua2V5Q29kZSA9PSA4MCAvKiBQICovKSB7XHJcbiAgICAgIC8vICAgaWYgKCFzZmcucGF1c2UpIHtcclxuICAgICAgLy8gICAgIHRoaXMuZ2FtZS5wYXVzZSgpO1xyXG4gICAgICAvLyAgIH0gZWxzZSB7XHJcbiAgICAgIC8vICAgICB0aGlzLmdhbWUucmVzdW1lKCk7XHJcbiAgICAgIC8vICAgfVxyXG4gICAgICAvLyAgIHByb2Nlc3MgPSB0cnVlO1xyXG4gICAgICAvLyB9XHJcblxyXG4gICAgICBpZiAoZS5rZXlDb2RlID09IDg4IC8qIFggKi8gJiYgc2ZnLkRFQlVHKSB7XHJcbiAgICAgICAgaWYgKCFzZmcucGF1c2UpIHtcclxuICAgICAgICAgIHRoaXMuZ2FtZS5wYXVzZSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmdhbWUucmVzdW1lKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByb2Nlc3MgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGUgPSB5aWVsZCBwcm9jZXNzO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gXHJcbiAgaW5pdENvbnNvbGUoKXtcclxuICAgIC8vIFN0YXRzIOOCquODluOCuOOCp+OCr+ODiChGUFPooajnpLop44Gu5L2c5oiQ6KGo56S6XHJcbiAgICBsZXQgZyA9IHRoaXMuZ2FtZTtcclxuICAgIGxldCB0aGlzXyA9IHRoaXM7XHJcbiAgICBnLnN0YXRzID0gbmV3IFN0YXRzKCk7XHJcbiAgICBnLnN0YXRzLmRvbUVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xyXG4gICAgZy5zdGF0cy5kb21FbGVtZW50LnN0eWxlLnRvcCA9ICcwcHgnO1xyXG4gICAgZy5zdGF0cy5kb21FbGVtZW50LnN0eWxlLmxlZnQgPSAnMHB4JztcclxuICAgIGcuc3RhdHMuZG9tRWxlbWVudC5zdHlsZS5sZWZ0ID0gcGFyc2VGbG9hdChnLnJlbmRlcmVyLmRvbUVsZW1lbnQuc3R5bGUubGVmdCkgLSBwYXJzZUZsb2F0KGcuc3RhdHMuZG9tRWxlbWVudC5zdHlsZS53aWR0aCkgKyAncHgnO1xyXG5cclxuICAgIGxldCBkZWJ1Z1VpID0gdGhpcy5kZWJ1Z1VpID0gZDMuc2VsZWN0KCcjY29udGVudCcpXHJcbiAgICAuYXBwZW5kKCdkaXYnKS5hdHRyKCdjbGFzcycsJ2RldnRvb2wnKVxyXG4gICAgLnN0eWxlKCdoZWlnaHQnLGcuQ09OU09MRV9IRUlHSFQgKyAncHgnKTtcclxuICAgIGRlYnVnVWkubm9kZSgpLmFwcGVuZENoaWxkKGcuc3RhdHMuZG9tRWxlbWVudCk7XHJcbiAgICBcclxuICAgIC8vIOOCv+ODluioreWumlxyXG4gICAgbGV0IG1lbnUgPSBkZWJ1Z1VpLmFwcGVuZCgndWwnKS5jbGFzc2VkKCdtZW51Jyx0cnVlKTtcclxuICAgIG1lbnUuc2VsZWN0QWxsKCdsaScpLmRhdGEoXHJcbiAgICAgIFt7bmFtZTon5Yi25b6hJyxpZDonI2NvbnRyb2wnLGVkaXRvcjpDb250cm9sbGVyfSx7bmFtZTon5pW1JyxpZDonI2VuZW15JyxlZGl0b3I6RW5lbXlFZGl0b3J9Lyose25hbWU6J+mfs+a6kCcsaWQ6JyNhdWRpbyd9LHtuYW1lOifnlLvlg48nLGlkOicjZ3JhcGhpY3MnfSovXVxyXG4gICAgKVxyXG4gICAgLmVudGVyKCkuYXBwZW5kKCdsaScpXHJcbiAgICAudGV4dCgoZCk9PmQubmFtZSlcclxuICAgIC5vbignY2xpY2snLGZ1bmN0aW9uKGQsaSl7XHJcbiAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgbWVudS5zZWxlY3RBbGwoJ2xpJykuZWFjaChmdW5jdGlvbihkLGlkeCl7XHJcbiAgICAgICAgIGlmKHNlbGYgPT0gdGhpcyl7XHJcbiAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmNsYXNzZWQoJ2FjdGl2ZScsdHJ1ZSk7XHJcbiAgICAgICAgICAgZDMuc2VsZWN0KGQuaWQpLnN0eWxlKCdkaXNwbGF5JywnYmxvY2snKTtcclxuICAgICAgICAgICBkLmluc3QuYWN0aXZlKCk7XHJcbiAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgaWYoZDMuc2VsZWN0KHRoaXMpLmNsYXNzZWQoJ2FjdGl2ZScpKXtcclxuICAgICAgICAgICAgICBkMy5zZWxlY3QodGhpcykuY2xhc3NlZCgnYWN0aXZlJyxmYWxzZSk7XHJcbiAgICAgICAgICAgICAgZDMuc2VsZWN0KGQuaWQpLnN0eWxlKCdkaXNwbGF5Jywnbm9uZScpO1xyXG4gICAgICAgICAgICAgIGQuaW5zdC5oaWRlKCk7XHJcbiAgICAgICAgICAgfVxyXG4gICAgICAgICB9ICAgICAgIFxyXG4gICAgICB9KTtcclxuICAgIH0pLmVhY2goZnVuY3Rpb24oZCxpKXtcclxuICAgICAgZC5pbnN0ID0gbmV3IGQuZWRpdG9yKHRoaXNfKTtcclxuICAgICAgaWYoIWkpe1xyXG4gICAgICAgIGQzLnNlbGVjdCh0aGlzKS5jbGFzc2VkKCdhY3RpdmUnLHRydWUpO1xyXG4gICAgICAgIGQzLnNlbGVjdChkLmlkKS5zdHlsZSgnZGlzcGxheScsJ2Jsb2NrJyk7XHJcbiAgICAgICAgZC5pbnN0LmFjdGl2ZSgpO1xyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gICAgO1xyXG4gICAgXHJcblxyXG4gIH1cclxuICBcclxuICBcclxuICAqdG9nZ2xlR2FtZSgpIHtcclxuICAgIC8vIOmWi+Wni+WHpueQhlxyXG4gICAgbGV0IGNhbmNlbCA9IGZhbHNlO1xyXG4gICAgd2hpbGUgKCFjYW5jZWwpIHtcclxuICAgICAgbGV0IGcgPSB0aGlzLmdhbWU7XHJcbiAgICAgIGcudGFza3MucHVzaFRhc2soZy5iYXNpY0lucHV0LnVwZGF0ZS5iaW5kKGcuYmFzaWNJbnB1dCkpO1xyXG4gICAgICBnLmJhc2ljSW5wdXQuYmluZCgpO1xyXG4gICAgICBnLnRhc2tzLnB1c2hUYXNrKGcucmVuZGVyLmJpbmQoZyksIGcuUkVOREVSRVJfUFJJT1JJVFkpO1xyXG4gICAgICBnLnRhc2tzLnB1c2hUYXNrKGcuZ2FtZUluaXQuYmluZChnKSk7XHJcblxyXG4gICAgICBpZiAoZy5zcGFjZUZpZWxkKSB7XHJcbiAgICAgICAgZy50YXNrcy5wdXNoVGFzayhnLm1vdmVTcGFjZUZpZWxkLmJpbmQoZykpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGcuc2hvd1NwYWNlRmllbGQoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFnLnRhc2tzLmVuYWJsZSkge1xyXG4gICAgICAgIGcudGFza3MuZW5hYmxlID0gdHJ1ZTtcclxuICAgICAgICBnLm1haW4oKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY2FuY2VsID0geWllbGQgJ3N0b3AnO1xyXG4gICAgICBpZiAoY2FuY2VsKSBicmVhaztcclxuICAgICAgXHJcbiAgICAgIC8vIOWBnOatouWHpueQhlxyXG4gICAgXHJcbiAgICAgIC8vIOeUu+mdoua2iOWOu1xyXG4gICAgICBpZiAoZy50YXNrcy5lbmFibGUpe1xyXG4gICAgICAgIGcudGFza3Muc3RvcFByb2Nlc3MoKVxyXG4gICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICBnLmVuZW1pZXMucmVzZXQoKTtcclxuICAgICAgICAgICAgZy5lbmVteUJ1bGxldHMucmVzZXQoKTtcclxuICAgICAgICAgICAgZy5ib21icy5yZXNldCgpO1xyXG4gICAgICAgICAgICBnLm15c2hpcF8ucmVzZXQoKTtcclxuICAgICAgICAgICAgZy50YXNrcy5jbGVhcigpO1xyXG4gICAgICAgICAgICBnLnRleHRQbGFuZS5jbHMoKTtcclxuICAgICAgICAgICAgZy5yZW5kZXJlci5jbGVhcigpO1xyXG4gICAgICAgICAgICBnLnNlcXVlbmNlci5zdG9wKCk7XHJcbiAgICAgICAgICAgIGcuYmFzaWNJbnB1dC51bmJpbmQoKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICAgIGNhbmNlbCA9IHlpZWxkICdwbGF5JztcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XHJcbmltcG9ydCAqIGFzIEVuZW1pZXMgZnJvbSAnLi4vLi4vanMvZW5lbWllcyc7XHJcbmltcG9ydCB7IFVuZG9NYW5hZ2VyIH0gZnJvbSAnLi91bmRvJzsgXHJcbmltcG9ydCB7IEVuZW15Rm9ybWF0aW9uRWRpdG9yIH0gZnJvbSAnLi9lbmVteUZvcm1hdGlvbkVkaXRvcic7XHJcbmltcG9ydCB7IEVuZW15TW92U2VxRWRpdG9yIH0gZnJvbSAnLi9lbmVteU1vdlNlcUVkaXRvcic7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFbmVteUVkaXRvciB7XHJcbiAgY29uc3RydWN0b3IoZGV2VG9vbClcclxuICB7XHJcbiAgICB0aGlzLmRldlRvb2wgPSBkZXZUb29sO1xyXG4gICAgLy8g5pW1XHJcbiAgICBsZXQgZyA9IGRldlRvb2wuZ2FtZTtcclxuICB9XHJcbiAgXHJcbiAgYWN0aXZlKCl7XHJcbiAgICBpZighdGhpcy5pbml0aWFsaXplZCl7XHJcbiAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBpbml0KCl7XHJcbiAgICBsZXQgdGhpc18gPSB0aGlzO1xyXG4gICAgbGV0IGcgPSB0aGlzLmRldlRvb2wuZ2FtZTtcclxuXHJcbiAgICBsZXQgcCA9IFByb21pc2UucmVzb2x2ZSgpO1xyXG5cclxuICAgIGlmKCFnLmVuZW1pZXMpXHJcbiAgICB7XHJcbiAgICAgIHAgPSBnLmluaXRBY3RvcnMoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcC50aGVuKCgpPT57XHJcbiAgICAgIGxldCB1aSA9IHRoaXMudWkgPSB0aGlzLmRldlRvb2wuZGVidWdVaS5hcHBlbmQoJ2RpdicpXHJcbiAgICAgIC5hdHRyKCdpZCcsJ2VuZW15JylcclxuICAgICAgLmNsYXNzZWQoJ2NvbnRyb2xsZXInLHRydWUpXHJcbiAgICAgIC5zdHlsZSgnZGlzcGxheScsJ2FjdGl2ZScpO1xyXG4gICAgICBcclxuICAgICAgdGhpcy5mb3JtTm8gPSAwO1xyXG5cclxuICAgICAgbGV0IGNvbnRyb2xsZXJEYXRhID0gXHJcbiAgICAgIFtcclxuICAgICAgICAvL+OAgOOCsuODvOODoOODl+ODrOOCpFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIG5hbWU6J3BsYXknLFxyXG4gICAgICAgICAgZnVuYygpe1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgXTtcclxuICAgICAgXHJcbiAgICAgIGxldCBidXR0b25zID0gdWkuc2VsZWN0QWxsKCdidXR0b24nKS5kYXRhKGNvbnRyb2xsZXJEYXRhKVxyXG4gICAgICAuZW50ZXIoKS5hcHBlbmQoJ2J1dHRvbicpO1xyXG4gICAgICBidXR0b25zLmF0dHIoJ2NsYXNzJyxkPT5kLm5hbWUpO1xyXG4gICAgICBcclxuICAgICAgYnV0dG9ucy5vbignY2xpY2snLGZ1bmN0aW9uKGQpe1xyXG4gICAgICAgIGQuZnVuYy5hcHBseShkMy5zZWxlY3QodGhpcykpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHVpLmFwcGVuZCgnc3BhbicpLnRleHQoJ+OCueODhuODvOOCuCcpLnN0eWxlKHsnd2lkdGgnOicxMDBweCcsJ2Rpc3BsYXknOidpbmxpbmUtYmxvY2snLCd0ZXh0LWFsaWduJzonY2VudGVyJ30pO1xyXG4gIFxyXG4gICAgICB2YXIgc3RhZ2UgPSB1aVxyXG4gICAgICAuYXBwZW5kKCdpbnB1dCcpXHJcbiAgICAgIC5hdHRyKHsndHlwZSc6J3RleHQnLCd2YWx1ZSc6Zy5zdGFnZS5ub30pXHJcbiAgICAgIC5zdHlsZSh7J3dpZHRoJzonNDBweCcsJ3RleHQtYWxpZ24nOidyaWdodCd9KTtcclxuICAgICAgZy5zdGFnZS5vbigndXBkYXRlJywoZCk9PntcclxuICAgICAgICBzdGFnZS5ub2RlKCkudmFsdWUgPSBkLm5vO1xyXG4gICAgICB9KTtcclxuICAgICAgXHJcbiAgICAgIHN0YWdlLm9uKCdjaGFuZ2UnLGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgbGV0IHYgPSAgcGFyc2VJbnQodGhpcy52YWx1ZSk7XHJcbiAgICAgICAgdiA9IGlzTmFOKHYpPzA6djtcclxuICAgICAgICBpZihnLnN0YWdlLm5vICE9IHYpe1xyXG4gICAgICAgICAgZy5zdGFnZS5qdW1wKHYpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIFxyXG4gICAgICAvLyDnt6jpmorjg57jg4Pjg5fjgqjjg4fjgqPjgr9cclxuICAgICAgXHJcbi8vICAgICAgIGxldCBmb3JtaGVhZCA9IHVpLmFwcGVuZCgnZGl2Jyk7XHJcbi8vICAgICAgIGZvcm1oZWFkLmFwcGVuZCgnc3BhbicpLnRleHQoJ+e3qOmaik5vJyk7XHJcbi8vIFxyXG4vLyAgICAgICBmb3JtaGVhZC5hcHBlbmQoJ2lucHV0JylcclxuLy8gICAgICAgLmF0dHIoeyd0eXBlJzondGV4dCcsJ3ZhbHVlJzp0aGlzLmZvcm1Ob30pXHJcbi8vICAgICAgIC5zdHlsZSh7J3dpZHRoJzonNDBweCcsJ3RleHQtYWxpZ24nOidyaWdodCd9KVxyXG4vLyAgICAgICAub24oJ2NoYW5nZScsZnVuY3Rpb24oKXtcclxuLy8gICAgICAgICBsZXQgdiA9ICBwYXJzZUludCh0aGlzLnZhbHVlKTtcclxuLy8gICAgICAgICB0aGlzXy5mb3JtTm8gPSBpc05hTih2KT8wOnY7XHJcbi8vICAgICAgIH0pO1xyXG4vLyAgICAgICBcclxuLy8gICAgICAgdWkuYXBwZW5kKCd0ZXh0YXJlYScpLmNsYXNzZWQoJ2Zvcm1kYXRhJyx0cnVlKS5hdHRyKCdyb3dzJywxMClcclxuLy8gICAgICAgLm5vZGUoKS52YWx1ZSA9IEpTT04uc3RyaW5naWZ5KGcuZW5lbWllcy5tb3ZlU2Vxc1t0aGlzLmZvcm1Ob10pO1xyXG4gICAgICBcclxuICAgICAgdGhpcy5mb3JtYXRpb25FZGl0b3IgPSBuZXcgRW5lbXlGb3JtYXRpb25FZGl0b3IodGhpc18sdGhpc18uZm9ybU5vKTtcclxuICAgICAgdGhpcy5tb3ZTZXFFZGl0b3IgPSBuZXcgRW5lbXlNb3ZTZXFFZGl0b3IodGhpcywwKTtcclxuICAgICAgXHJcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlOyAgICAgICAgXHJcbiAgICB9KTtcclxuXHJcbiAgICBcclxuICAgIFxyXG5cclxuICB9XHJcbiAgXHJcbiAgaGlkZSgpe1xyXG4gICAgXHJcbiAgfVxyXG59IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmltcG9ydCAqIGFzIEVuZW1pZXMgZnJvbSAnLi4vLi4vanMvZW5lbWllcyc7XHJcbmltcG9ydCB7IFVuZG9NYW5hZ2VyIH0gZnJvbSAnLi91bmRvJzsgXHJcblxyXG5jbGFzcyBJbnB1dENvbW1hbmR7XHJcbiAgY29uc3RydWN0b3IoaWQsbmFtZSxkZXNjKVxyXG4gIHtcclxuICAgIHRoaXMuaWQgPSBpZDtcclxuICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICB0aGlzLmRlc2MgPSBkZXNjO1xyXG4gIH1cclxuICB0b0pTT04oKXtcclxuICAgIHJldHVybiB0aGlzLm5hbWU7XHJcbiAgfVxyXG59O1xyXG5cclxuY29uc3QgSW5wdXRDb21tYW5kcyA9XHJcbntcclxuICBlbnRlcjogbmV3IElucHV0Q29tbWFuZCgxLCdlbnRlcicsJ+aMv+WFpScpLFxyXG4gIGVzYzogbmV3IElucHV0Q29tbWFuZCgyLCdlc2MnLCfjgq3jg6Pjg7Pjgrvjg6snKSxcclxuICByaWdodDogbmV3IElucHV0Q29tbWFuZCgzLCdyaWdodCcsJ+OCq+ODvOOCveODq+enu+WLle+8iOWPs++8iScpLFxyXG4gIGxlZnQ6IG5ldyBJbnB1dENvbW1hbmQoNCwnbGVmdCcsJ+OCq+ODvOOCveODq+enu+WLle+8iOW3pu+8iScpLFxyXG4gIHVwOiBuZXcgSW5wdXRDb21tYW5kKDUsJ3VwJywn44Kr44O844K944Or56e75YuV77yI5LiK77yJJyksXHJcbiAgZG93bjogbmV3IElucHV0Q29tbWFuZCg2LCdkb3duJywn44Kr44O844K944Or56e75YuV77yI5LiL77yJJyksXHJcbiAgdW5kbzogbmV3IElucHV0Q29tbWFuZCg4LCd1bmRvJywn44Ki44Oz44OJ44KlJyksXHJcbiAgcmVkbzogbmV3IElucHV0Q29tbWFuZCg5LCdyZWRvJywn44Oq44OJ44KlJyksXHJcbiAgcGFnZVVwOiBuZXcgSW5wdXRDb21tYW5kKDEwLCdwYWdlVXAnLCfjg5rjg7zjgrjjgqLjg4Pjg5cnKSxcclxuICBwYWdlRG93bjogbmV3IElucHV0Q29tbWFuZCgxMSwncGFnZURvd24nLCfjg5rjg7zjgrjjg4Djgqbjg7MnKSxcclxuICBob21lOiBuZXcgSW5wdXRDb21tYW5kKDEyLCdob21lJywn5YWI6aCt6KGM44Gr56e75YuVJyksXHJcbiAgZW5kOiBuZXcgSW5wdXRDb21tYW5kKDEzLCdlbmQnLCfntYLnq6/ooYzjgavnp7vli5UnKSxcclxuICBzY3JvbGxVcDogbmV3IElucHV0Q29tbWFuZCgxNiwnc2Nyb2xsVXAnLCfpq5jpgJ/jgrnjgq/jg63jg7zjg6vjgqLjg4Pjg5cnKSxcclxuICBzY3JvbGxEb3duOiBuZXcgSW5wdXRDb21tYW5kKDE3LCdzY3JvbGxEb3duJywn6auY6YCf44K544Kv44Ot44O844Or44OA44Km44OzJyksXHJcbiAgZGVsZXRlOiBuZXcgSW5wdXRDb21tYW5kKDE4LCdkZWxldGUnLCfooYzliYrpmaQnKSxcclxuICBsaW5lUGFzdGU6IG5ldyBJbnB1dENvbW1hbmQoMTksJ2xpbmVQYXN0ZScsJ+ihjOODmuODvOOCueODiCcpLFxyXG4gIHNlbGVjdDpuZXcgSW5wdXRDb21tYW5kKDIyLCdzZWxlY3QnLCfpgbjmip7jga7plovlp4vjg7vntYLkuoYnKSxcclxuICBjdXRFdmVudDpuZXcgSW5wdXRDb21tYW5kKDIzLCdjdXRFdmVudCcsJ+OCpOODmeODs+ODiOOCq+ODg+ODiCcpLFxyXG4gIGNvcHlFdmVudDpuZXcgSW5wdXRDb21tYW5kKDI0LCdjb3B5RXZlbnQnLCfjgqTjg5njg7Pjg4jjgrPjg5Tjg7wnKSxcclxuICBwYXN0ZUV2ZW50Om5ldyBJbnB1dENvbW1hbmQoMjUsJ3Bhc3RlRXZlbnQnLCfjgqTjg5njg7Pjg4jjg5rjg7zjgrnjg4gnKVxyXG59O1xyXG5cclxuLy9cclxuY29uc3Qga2V5QmluZHMgPVxyXG4gIHtcclxuICAgIDEzOiBbe1xyXG4gICAgICBrZXlDb2RlOiAxMyxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kcy5lbnRlclxyXG4gICAgfV0sXHJcbiAgICAyNzogW3tcclxuICAgICAga2V5Q29kZTogMjcsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZHMuZXNjXHJcbiAgICB9XSxcclxuICAgIDMyOiBbe1xyXG4gICAgICBrZXlDb2RlOiAzMixcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kcy5yaWdodFxyXG4gICAgfV0sXHJcbiAgICAzOTogW3tcclxuICAgICAga2V5Q29kZTogMzksXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZHMucmlnaHRcclxuICAgIH1dLFxyXG4gICAgMzc6IFt7XHJcbiAgICAgIGtleUNvZGU6IDM3LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLmxlZnRcclxuICAgIH1dLFxyXG4gICAgMzg6IFt7XHJcbiAgICAgIGtleUNvZGU6IDM4LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLnVwXHJcbiAgICB9XSxcclxuICAgIDQwOiBbe1xyXG4gICAgICBrZXlDb2RlOiA0MCxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kcy5kb3duXHJcbiAgICB9XSxcclxuICAgIDEwNjogW3tcclxuICAgICAga2V5Q29kZTogMTA2LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLmluc2VydE1lYXN1cmVcclxuICAgIH1dLFxyXG4gICAgOTA6IFt7XHJcbiAgICAgIGtleUNvZGU6IDkwLFxyXG4gICAgICBjdHJsS2V5OiB0cnVlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZHMudW5kb1xyXG4gICAgfV0sXHJcbiAgICAzMzogW3tcclxuICAgICAga2V5Q29kZTogMzMsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZHMucGFnZVVwXHJcbiAgICAgIH0se1xyXG4gICAgICAgIGtleUNvZGU6IDMzLFxyXG4gICAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICAgIHNoaWZ0S2V5OiB0cnVlLFxyXG4gICAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLnNjcm9sbFVwXHJcbiAgICAgIH0se1xyXG4gICAgICBrZXlDb2RlOiAzMyxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiB0cnVlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLm1lYXN1cmVCZWZvcmVcclxuICAgICAgfSAgICAgIF0sXHJcbiAgICAvLyA4MjogW3tcclxuICAgIC8vICAga2V5Q29kZTogODIsXHJcbiAgICAvLyAgIGN0cmxLZXk6IHRydWUsXHJcbiAgICAvLyAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgIC8vICAgYWx0S2V5OiBmYWxzZSxcclxuICAgIC8vICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAvLyAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kcy5wYWdlVXBcclxuICAgIC8vIH1dLFxyXG4gICAgMzQ6IFt7IC8vIFBhZ2UgRG93biBcclxuICAgICAga2V5Q29kZTogMzQsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZHMucGFnZURvd25cclxuICAgIH0sIHtcclxuICAgICAgICBrZXlDb2RlOiAzNCxcclxuICAgICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgICBzaGlmdEtleTogdHJ1ZSxcclxuICAgICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kcy5zY3JvbGxEb3duXHJcbiAgICAgIH1dLFxyXG4gICAgMzY6IFt7XHJcbiAgICAgIGtleUNvZGU6IDM2LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLmhvbWVcclxuICAgIH1dLFxyXG4gICAgMzU6IFt7XHJcbiAgICAgIGtleUNvZGU6IDM1LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLmVuZFxyXG4gICAgfV0sXHJcbiAgICA4OTogW3tcclxuICAgICAga2V5Q29kZTogODksXHJcbiAgICAgIGN0cmxLZXk6IHRydWUsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kcy5kZWxldGVcclxuICAgIH1dLFxyXG4gICAgNzY6IFt7XHJcbiAgICAgIGtleUNvZGU6IDc2LFxyXG4gICAgICBjdHJsS2V5OiB0cnVlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZHMubGluZVBhc3RlXHJcbiAgICB9XSxcclxuICAgIDExNzpbLy8gRjZcclxuICAgICAge1xyXG4gICAgICBrZXlDb2RlOiAxMTcsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZHMuc2VsZWN0XHJcbiAgICAgIH1cclxuICAgIF0sXHJcbiAgICAxMTg6Wy8vIEY3XHJcbiAgICAgIHtcclxuICAgICAga2V5Q29kZTogMTE4LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLmN1dEV2ZW50XHJcbiAgICAgIH1cclxuICAgIF0sXHJcbiAgICAxMTk6Wy8vIEY4XHJcbiAgICAgIHtcclxuICAgICAga2V5Q29kZTogMTE5LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLmNvcHlFdmVudFxyXG4gICAgICB9XHJcbiAgICBdLFxyXG4gICAgMTIwOlsvLyBGOVxyXG4gICAgICB7XHJcbiAgICAgIGtleUNvZGU6IDEyMCxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kcy5wYXN0ZUV2ZW50XHJcbiAgICAgIH1cclxuICAgIF1cclxuICB9O1xyXG5cclxuZXhwb3J0IGNsYXNzIEVuZW15Rm9ybWF0aW9uRWRpdG9yIHtcclxuICBjb25zdHJ1Y3RvcihlbmVteUVkaXRvcixmb3JtYXRpb25Obykge1xyXG4gICAgbGV0IHRoaXNfID0gdGhpcztcclxuICAgIHRoaXMudW5kb01hbmFnZXIgPSBuZXcgVW5kb01hbmFnZXIoKTtcclxuICAgIHRoaXMuZW5lbXlFZGl0b3IgPSBlbmVteUVkaXRvcjtcclxuICAgIHRoaXMubGluZUJ1ZmZlciA9IG51bGw7XHJcbiAgICBsZXQgZGVidWdVaSA9IGVuZW15RWRpdG9yLmRldlRvb2wuZGVidWdVaTtcclxuICAgIHZhciBlZGl0b3IgPSBlbmVteUVkaXRvci51aS5hcHBlbmQoJ2RpdicpLmNsYXNzZWQoJ2Zvcm1hdGlvbi1lZGl0b3InLCB0cnVlKTtcclxuICAgIGxldCBldmVudEVkaXQgPSBlZGl0b3IuYXBwZW5kKCd0YWJsZScpLmF0dHIoJ3RhYmluZGV4JywwKTtcclxuICAgIGxldCBoZWFkcm93ID0gZXZlbnRFZGl0LmFwcGVuZCgndGhlYWQnKS5hcHBlbmQoJ3RyJyk7XHJcbiAgICBoZWFkcm93LmFwcGVuZCgndGgnKS50ZXh0KCdzdGVwJyk7XHJcbiAgICBoZWFkcm93LmFwcGVuZCgndGgnKS50ZXh0KCdTWCcpO1xyXG4gICAgaGVhZHJvdy5hcHBlbmQoJ3RoJykudGV4dCgnU1knKTtcclxuICAgIGhlYWRyb3cuYXBwZW5kKCd0aCcpLnRleHQoJ0hYJyk7XHJcbiAgICBoZWFkcm93LmFwcGVuZCgndGgnKS50ZXh0KCdIWScpO1xyXG4gICAgaGVhZHJvdy5hcHBlbmQoJ3RoJykudGV4dCgnUFQnKTtcclxuICAgIGhlYWRyb3cuYXBwZW5kKCd0aCcpLnRleHQoJ0tJTkQnKTtcclxuICAgIGhlYWRyb3cuYXBwZW5kKCd0aCcpLnRleHQoJ1JFVicpO1xyXG4gICAgaGVhZHJvdy5hcHBlbmQoJ3RoJykudGV4dCgnR1JQJyk7XHJcbiAgICBcclxuICAgIGxldCBldmVudEJvZHkgPSBldmVudEVkaXQuYXBwZW5kKCd0Ym9keScpLmF0dHIoJ2lkJywgJ2V2ZW50cycpO1xyXG4gICAgZXZlbnRCb2R5LmRhdHVtKGVuZW15RWRpdG9yLmRldlRvb2wuZ2FtZS5lbmVtaWVzLm1vdmVTZXFzW2Zvcm1hdGlvbk5vXSk7XHJcbiAgICB0aGlzLmVkaXRvciA9IGRvRWRpdG9yKGV2ZW50Qm9keSx0aGlzXyk7XHJcbiAgICB0aGlzLmVkaXRvci5uZXh0KCk7XHJcblxyXG4gICAgLy8g44Kt44O85YWl5Yqb44OP44Oz44OJ44OpXHJcbiAgICBldmVudEVkaXQub24oJ2tleWRvd24nLCBmdW5jdGlvbiAoZCkge1xyXG4gICAgICBsZXQgZSA9IGQzLmV2ZW50O1xyXG4gIC8vICAgIGNvbnNvbGUubG9nKGUua2V5Q29kZSk7XHJcbiAgICAgIGxldCBrZXkgPSBrZXlCaW5kc1tlLmtleUNvZGVdO1xyXG4gICAgICBsZXQgcmV0ID0ge307XHJcbiAgICAgIGlmIChrZXkpIHtcclxuICAgICAgICBrZXkuc29tZSgoZCkgPT4ge1xyXG4gICAgICAgICAgaWYgKGQuY3RybEtleSA9PSBlLmN0cmxLZXlcclxuICAgICAgICAgICAgJiYgZC5zaGlmdEtleSA9PSBlLnNoaWZ0S2V5XHJcbiAgICAgICAgICAgICYmIGQuYWx0S2V5ID09IGUuYWx0S2V5XHJcbiAgICAgICAgICAgICYmIGQubWV0YUtleSA9PSBlLm1ldGFLZXlcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldCA9IHRoaXNfLmVkaXRvci5uZXh0KGQpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAocmV0LnZhbHVlKSB7XHJcbiAgICAgICAgICBkMy5ldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgZDMuZXZlbnQuY2FuY2VsQnViYmxlID0gdHJ1ZTtcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuLy8g44Ko44OH44Kj44K/5pys5L2TXHJcbmZ1bmN0aW9uKiBkb0VkaXRvcihldmVudEVkaXQsIGZvcm1FZGl0b3IpIHtcclxuICBsZXQga2V5Y29kZSA9IDA7Ly8g5YWl5Yqb44GV44KM44Gf44Kt44O844Kz44O844OJ44KS5L+d5oyB44GZ44KL5aSJ5pWwXHJcbiAgbGV0IGV2ZW50cyA9IGV2ZW50RWRpdC5kYXR1bSgpOy8vIOePvuWcqOe3qOmbhuS4reOBruODiOODqeODg+OCr1xyXG4gIGxldCBlZGl0VmlldyA9IGQzLnNlbGVjdCgnI2V2ZW50cycpOy8v57eo6ZuG55S76Z2i44Gu44K744Os44Kv44K344On44OzXHJcbiAgbGV0IHJvd0luZGV4ID0gMDsvLyDnt6jpm4bnlLvpnaLjga7nj77lnKjooYxcclxuICBsZXQgY3VycmVudEV2ZW50SW5kZXggPSAwOy8vIOOCpOODmeODs+ODiOmFjeWIl+OBrue3qOmbhumWi+Wni+ihjFxyXG4gIGxldCBjZWxsSW5kZXggPSAwOy8vIOWIl+OCpOODs+ODh+ODg+OCr+OCuVxyXG4gIGxldCBjYW5jZWxFdmVudCA9IGZhbHNlOy8vIOOCpOODmeODs+ODiOOCkuOCreODo+ODs+OCu+ODq+OBmeOCi+OBi+OBqeOBhuOBi1xyXG4gIGNvbnN0IE5VTV9ST1cgPSAxMDsvLyDvvJHnlLvpnaLjga7ooYzmlbBcclxuICBsZXQgc2VsZWN0U3RhcnRJbmRleCA9IG51bGw7XHJcbiAgbGV0IHNlbGVjdEVuZEluZGV4ID0gbnVsbDtcclxuICBsZXQgbmVlZERyYXcgPSBmYWxzZTtcclxuICBsZXQgZyA9IGZvcm1FZGl0b3IuZW5lbXlFZGl0b3IuZGV2VG9vbC5nYW1lO1xyXG4gIFxyXG4gIC8vaWYoIWcudGFza3MuZW5hYmxlKXtcclxuICAvLyAgZy50YXNrcy5lbmFibGUgPSB0cnVlO1xyXG4gICAgZy50YXNrcy5jbGVhcigpO1xyXG4gICAgZy50YXNrcy5wdXNoVGFzayhnLnJlbmRlci5iaW5kKGcpLCBnLlJFTkRFUkVSX1BSSU9SSVRZKTtcclxuLy8gICAgZy5zaG93U3BhY2VGaWVsZCgpO1xyXG4gICAgZy5lbmVtaWVzLnJlc2V0KCk7XHJcbiAvLy8vIH1cclxuXHJcbiAgLy9nLnRhc2tzLnByb2Nlc3MoZyk7XHJcbiAgXHJcbiAgZnVuY3Rpb24gc2V0SW5wdXQoKSB7XHJcbiAgICBsZXQgdGhpc18gPSB0aGlzO1xyXG4gICAgdGhpcy5hdHRyKCdjb250ZW50RWRpdGFibGUnLCAndHJ1ZScpO1xyXG4gICAgdGhpcy5vbignZm9jdXMnLCBmdW5jdGlvbiAoKSB7XHJcbiAgIC8vICAgY29uc29sZS5sb2codGhpcy5wYXJlbnROb2RlLnJvd0luZGV4IC0gMSk7XHJcbiAgICAgIHJvd0luZGV4ID0gdGhpcy5wYXJlbnROb2RlLnJvd0luZGV4IC0gMTtcclxuICAgICAgY2VsbEluZGV4ID0gdGhpcy5jZWxsSW5kZXg7XHJcbiAgICAgIC8vZy5lbmVtaWVzLnJlc2V0KCk7XHJcbiAgICAgIGxldCBpbmRleCA9IHBhcnNlSW50KHRoaXNfLmF0dHIoJ2RhdGEtcm93LWluZGV4JykpO1xyXG4gICAgICBmb3JtRWRpdG9yLmVuZW15RWRpdG9yLmRldlRvb2wuZ2FtZS5lbmVtaWVzLnN0YXJ0RW5lbXlJbmRleGVkKGV2ZW50c1tpbmRleF0saW5kZXgpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIFxyXG4gIGZ1bmN0aW9uIHNldEJsdXIoKXtcclxuICAgIGxldCB0aGlzXyA9IHRoaXM7IFxyXG4gICAgIHRoaXMub24oJ2JsdXInLGZ1bmN0aW9uKGQsaSlcclxuICAgICAge2lmKG5lZWREcmF3KSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgbGV0IGRhdGEgPSBldmVudHNbcGFyc2VJbnQodGhpc18uYXR0cignZGF0YS1yb3ctaW5kZXgnKSldO1xyXG4gICAgICAgIGlmKGkgIT0gNil7XHJcbiAgICAgICAgICBsZXQgdiA9IHBhcnNlRmxvYXQodGhpcy5pbm5lclRleHQpO1xyXG4gICAgICAgICAgaWYoIWlzTmFOKHYpKXtcclxuICAgICAgICAgICAgZGF0YVtpXSA9IHY7XHJcbiAgICAgICAgICB9IFxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBkYXRhW2ldID0gRW5lbWllcy5nZXRFbmVteUZ1bmModGhpcy5pbm5lclRleHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgfVxyXG4gIFxyXG4gIFxyXG4gIC8vIOaXouWtmOOCpOODmeODs+ODiOOBruihqOekulxyXG4gIGZ1bmN0aW9uIGRyYXdFdmVudCgpIFxyXG4gIHtcclxuICAgIGxldCBzdGkgPSBudWxsLHNlaSA9IG51bGw7XHJcbiAgICBpZihzZWxlY3RTdGFydEluZGV4ICE9IG51bGwgJiYgc2VsZWN0RW5kSW5kZXggIT0gbnVsbCl7XHJcbiAgICAgICAgaWYoY3VycmVudEV2ZW50SW5kZXggPD0gc2VsZWN0U3RhcnRJbmRleCl7XHJcbiAgICAgICAgICBzdGkgPSBzZWxlY3RTdGFydEluZGV4IC0gY3VycmVudEV2ZW50SW5kZXg7XHJcbiAgICAgICAgICBpZigoY3VycmVudEV2ZW50SW5kZXggKyBOVU1fUk9XKSA+PSBzZWxlY3RFbmRJbmRleClcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc2VpID0gc2VsZWN0RW5kSW5kZXggLSBjdXJyZW50RXZlbnRJbmRleDsgXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzZWkgPSBOVU1fUk9XIC0gMTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICBzdGkgPSAwO1xyXG4gICAgICAgICAgaWYoKGN1cnJlbnRFdmVudEluZGV4ICsgTlVNX1JPVykgPj0gc2VsZWN0RW5kSW5kZXgpXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNlaSA9IHNlbGVjdEVuZEluZGV4IC0gY3VycmVudEV2ZW50SW5kZXg7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzZWkgPSBOVU1fUk9XIC0gMTsgICAgICAgICAgXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgbGV0IGV2ZmxhZ21lbnQgPSBldmVudHMuc2xpY2UoY3VycmVudEV2ZW50SW5kZXgsIGN1cnJlbnRFdmVudEluZGV4ICsgTlVNX1JPVyk7XHJcbiAgICBlZGl0Vmlldy5zZWxlY3RBbGwoJ3RyJykucmVtb3ZlKCk7XHJcbiAgICBsZXQgc2VsZWN0ID0gZWRpdFZpZXcuc2VsZWN0QWxsKCd0cicpLmRhdGEoZXZmbGFnbWVudCk7XHJcbiAgICBsZXQgZW50ZXIgPSBzZWxlY3QuZW50ZXIoKTtcclxuICAgIGxldCByb3dzID0gZW50ZXIuYXBwZW5kKCd0cicpLmF0dHIoJ2RhdGEtaW5kZXgnLCAoZCwgaSkgPT4gaSk7XHJcbiAgICBpZihzdGkgIT0gbnVsbCAmJiBzZWkgIT0gbnVsbCl7XHJcbiAgICAgIHJvd3MuZWFjaChmdW5jdGlvbihkLGkpe1xyXG4gICAgICAgIGlmKGkgPj0gc3RpICYmIGkgPD0gc2VpKXtcclxuICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKS5jbGFzc2VkKCdzZWxlY3RlZCcsdHJ1ZSk7ICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcm93cy5lYWNoKGZ1bmN0aW9uIChkLCBpKSB7XHJcbiAgICAgIGxldCByb3cgPSBkMy5zZWxlY3QodGhpcyk7XHJcbiBcclxuICAgICAgIHJvdy5zZWxlY3RBbGwoJ3RkJylcclxuICAgICAgLmRhdGEoZClcclxuICAgICAgLmVudGVyKClcclxuICAgICAgLmFwcGVuZCgndGQnKVxyXG4gICAgICAuY2FsbChzZXRJbnB1dClcclxuICAgICAgLmNhbGwoc2V0Qmx1cilcclxuICAgICAgLmF0dHIoJ2RhdGEtcm93LWluZGV4JyxpICsgY3VycmVudEV2ZW50SW5kZXgpICAgICAgXHJcbiAgICAgIC50ZXh0KChkKT0+e1xyXG4gICAgICAgIGlmKHR5cGVvZihkKSA9PT0gJ2Z1bmN0aW9uJyApe1xyXG4gICAgICAgICAgcmV0dXJuICgnJytkKS5yZXBsYWNlKC9eXFxzKmZ1bmN0aW9uXFxzKihbXlxcKF0qKVtcXFNcXHNdKyQvaW0sICckMScpO1xyXG4gICAgICAgIH0gXHJcbiAgICAgICAgcmV0dXJuIGQ7XHJcbiAgICAgIH0pO1xyXG4gICAgICBcclxuICAgICAgLy8gZC5mb3JFYWNoKChkLGkpPT57XHJcbiAgICAgIC8vICAgcm93LmFwcGVuZCgndGQnKS50ZXh0KGQpXHJcbiAgICAgIC8vICAgLmNhbGwoc2V0SW5wdXQpXHJcbiAgICAgIC8vICAgLmNhbGwoc2V0Qmx1cihpKSk7XHJcbiAgICAgIC8vIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKHJvd0luZGV4ID4gKGV2ZmxhZ21lbnQubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgcm93SW5kZXggPSBldmZsYWdtZW50Lmxlbmd0aCAtIDE7XHJcbiAgICB9XHJcblxyXG4gIH1cclxuXHRcclxuICAvLyDjgqTjg5njg7Pjg4jjga7jg5Xjgqnjg7zjgqvjgrlcclxuICBmdW5jdGlvbiBmb2N1c0V2ZW50KCkge1xyXG4gICAgaWYoIWVkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XS5jZWxsc1tjZWxsSW5kZXhdKXtcclxuICAgICAgZGVidWdnZXI7XHJcbiAgICB9XHJcbiAgICBlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF0uY2VsbHNbY2VsbEluZGV4XS5mb2N1cygpO1xyXG4gIH1cclxuXHRcclxuICAvLyDjgqTjg5njg7Pjg4jjga7mjL/lhaVcclxuICBmdW5jdGlvbiBpbnNlcnRFdmVudChyb3dJbmRleCkge1xyXG4gICAgZm9ybUVkaXRvci51bmRvTWFuYWdlci5leGVjKHtcclxuICAgICAgZXhlYygpIHtcclxuICAgICAgICB0aGlzLnJvdyA9IGVkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XTtcclxuICAgICAgICB0aGlzLmNlbGxJbmRleCA9IGNlbGxJbmRleDtcclxuICAgICAgICB0aGlzLnJvd0luZGV4ID0gcm93SW5kZXg7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50RXZldEluZGV4ID0gY3VycmVudEV2ZW50SW5kZXg7XHJcbiAgICAgICAgdGhpcy5leGVjXygpO1xyXG4gICAgICB9LFxyXG4gICAgICBleGVjXygpIHtcclxuICAgICAgICB2YXIgcm93ID0gZDMuc2VsZWN0KGVkaXRWaWV3Lm5vZGUoKS5pbnNlcnRSb3codGhpcy5yb3dJbmRleCkpO1xyXG4gICAgICAgIHZhciBjb2xzID0gIHJvdy5zZWxlY3RBbGwoJ3RkJykuZGF0YShbMCwwLDAsMCwwLDAsRW5lbWllcy5aYWtvLHRydWUsMF0pO1xyXG5cclxuICAgICAgICBjZWxsSW5kZXggPSAwO1xyXG4gICAgICAgIGNvbHMuZW50ZXIoKS5hcHBlbmQoJ3RkJylcclxuICAgICAgICAuY2FsbChzZXRJbnB1dClcclxuICAgICAgICAuY2FsbChzZXRCbHVyKVxyXG4gICAgICAgIC5hdHRyKCdkYXRhLXJvdy1pbmRleCcsdGhpcy5yb3dJbmRleCArIHRoaXMuY3VycmVudEV2ZW50SW5kZXgpXHJcbiAgICAgICAgLnRleHQoKGQpPT57XHJcbiAgICAgICAgICBpZih0eXBlb2YoZCkgPT09ICdmdW5jdGlvbicgKXtcclxuICAgICAgICAgICAgcmV0dXJuICgnJytkKS5yZXBsYWNlKC9eXFxzKmZ1bmN0aW9uXFxzKihbXlxcKF0qKVtcXFNcXHNdKyQvaW0sICckMScpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcm93Lm5vZGUoKS5jZWxsc1t0aGlzLmNlbGxJbmRleF0uZm9jdXMoKTtcclxuICAgICAgICByb3cuYXR0cignZGF0YS1uZXcnLCB0cnVlKTtcclxuICAgICAgfSxcclxuICAgICAgcmVkbygpIHtcclxuICAgICAgICB0aGlzLmV4ZWNfKCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHVuZG8oKSB7XHJcbiAgICAgICAgZWRpdFZpZXcubm9kZSgpLmRlbGV0ZVJvdyh0aGlzLnJvd0luZGV4KTtcclxuICAgICAgICB0aGlzLnJvdy5jZWxsc1t0aGlzLmNlbGxJbmRleF0uZm9jdXMoKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIFxyXG4gIC8vIOaWsOimj+WFpeWKm+ihjOOBrueiuuWumlxyXG4gIGZ1bmN0aW9uIGVuZE5ld0lucHV0KGRvd24gPSB0cnVlKSB7XHJcbiAgICBkMy5zZWxlY3QoZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdKS5hdHRyKCdkYXRhLW5ldycsIG51bGwpO1xyXG4gICAgLy8g54++5Zyo44Gu57eo6ZuG6KGMXHJcbiAgICAvL2xldCBjdXJSb3cgPSBlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF0uY2VsbHM7XHJcbiAgICBsZXQgZXYgPSBkMy5zZWxlY3QoZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdKS5zZWxlY3RBbGwoJ3RkJykuZGF0YSgpO1xyXG4gICAgZm9ybUVkaXRvci51bmRvTWFuYWdlci5leGVjKHtcclxuICAgICAgZXhlYygpe1xyXG4gICAgICAgIHRoaXMuc3RhcnRJbmRleCA9IHJvd0luZGV4ICsgY3VycmVudEV2ZW50SW5kZXg7XHJcbiAgICAgICAgdGhpcy5ldiA9IGV2O1xyXG4gICAgICAgIHRoaXMuY291bnQgPSBldi5sZW5ndGg7XHJcbiAgICAgICAgdGhpcy5lbnRlcigpO1xyXG4gICAgICB9LFxyXG4gICAgICBlbnRlcigpe1xyXG4gICAgICAgIGV2ZW50cy5zcGxpY2UodGhpcy5zdGFydEluZGV4LDAsdGhpcy5ldik7XHJcbiAgICAgIH0sXHJcbiAgICAgIHJlZG8oKXtcclxuICAgICAgICB0aGlzLmVudGVyKCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHVuZG8oKXtcclxuICAgICAgICBldmVudHMuc3BsaWNlKHRoaXMuc3RhcnRJbmRleCx0aGlzLmNvdW50KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIGlmIChkb3duKSB7XHJcbiAgICAgIGlmIChyb3dJbmRleCA9PSAoTlVNX1JPVyAtIDEpKSB7XHJcbiAgICAgICAgKytjdXJyZW50RXZlbnRJbmRleDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICArK3Jvd0luZGV4O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyDmjL/lhaXlvozjgIHlho3mj4/nlLtcclxuICAgIG5lZWREcmF3ID0gdHJ1ZTtcclxuICB9XHJcbiAgXHJcbiAgZnVuY3Rpb24gYWRkUm93KGRlbHRhKVxyXG4gIHtcclxuICAgIHJvd0luZGV4ICs9IGRlbHRhO1xyXG4gICAgbGV0IHJvd0xlbmd0aCA9IGVkaXRWaWV3Lm5vZGUoKS5yb3dzLmxlbmd0aDtcclxuICAgIGlmKHJvd0luZGV4ID49IHJvd0xlbmd0aCl7XHJcbiAgICAgIGxldCBkID0gcm93SW5kZXggLSByb3dMZW5ndGggKyAxO1xyXG4gICAgICByb3dJbmRleCA9IHJvd0xlbmd0aCAtIDE7XHJcbiAgICAgIGlmKChjdXJyZW50RXZlbnRJbmRleCArIE5VTV9ST1cgLTEpIDwgKGV2ZW50cy5sZW5ndGggLSAxKSl7XHJcbiAgICAgICAgY3VycmVudEV2ZW50SW5kZXggKz0gZDtcclxuICAgICAgICBpZigoY3VycmVudEV2ZW50SW5kZXggKyBOVU1fUk9XIC0xKSA+IChldmVudHMubGVuZ3RoIC0gMSkpe1xyXG4gICAgICAgICAgY3VycmVudEV2ZW50SW5kZXggPSAoZXZlbnRzLmxlbmd0aCAtIE5VTV9ST1cgKyAxKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgbmVlZERyYXcgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgaWYocm93SW5kZXggPCAwKXtcclxuICAgICAgbGV0IGQgPSByb3dJbmRleDtcclxuICAgICAgcm93SW5kZXggPSAwO1xyXG4gICAgICBpZihjdXJyZW50RXZlbnRJbmRleCAhPSAwKXtcclxuICAgICAgICBjdXJyZW50RXZlbnRJbmRleCArPSBkO1xyXG4gICAgICAgIGlmKGN1cnJlbnRFdmVudEluZGV4IDwgMCl7XHJcbiAgICAgICAgICBjdXJyZW50RXZlbnRJbmRleCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG5lZWREcmF3ID0gdHJ1ZTtcclxuICAgICAgfSBcclxuICAgIH1cclxuICAgIGZvY3VzRXZlbnQoKTtcclxuICB9XHJcbiAgXHJcbiAgLy8g44Ko44Oz44K/44O8XHJcbiAgZnVuY3Rpb24gZG9FbnRlcigpe1xyXG4gICAgLy9jb25zb2xlLmxvZygnQ1IvTEYnKTtcclxuICAgIC8vIOePvuWcqOOBruihjOOBjOaWsOimj+OBi+e3qOmbhuS4reOBi1xyXG4gICAgbGV0IGZsYWcgPSBkMy5zZWxlY3QoZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdKS5hdHRyKCdkYXRhLW5ldycpO1xyXG4gICAgaWYgKGZsYWcpIHtcclxuICAgICAgZW5kTmV3SW5wdXQoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8v5paw6KaP57eo6ZuG5Lit44Gu6KGM44Gn44Gq44GR44KM44Gw44CB5paw6KaP5YWl5Yqb55So6KGM44KS5oy/5YWlXHJcbiAgICAgIGluc2VydEV2ZW50KHJvd0luZGV4KTtcclxuICAgIH1cclxuICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICB9XHJcbiAgXHJcbiAgLy8g5Y+z56e75YuVXHJcbiAgZnVuY3Rpb24gZG9SaWdodCgpe1xyXG4gICAgY2VsbEluZGV4Kys7XHJcbiAgICBsZXQgY3VyUm93ID0gZWRpdFZpZXcubm9kZSgpLnJvd3M7XHJcbiAgICBpZiAoY2VsbEluZGV4ID4gKGN1clJvd1tyb3dJbmRleF0uY2VsbHMubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgY2VsbEluZGV4ID0gMDtcclxuICAgICAgaWYgKHJvd0luZGV4IDwgKGN1clJvdy5sZW5ndGggLSAxKSkge1xyXG4gICAgICAgIGlmIChkMy5zZWxlY3QoY3VyUm93W3Jvd0luZGV4XSkuYXR0cignZGF0YS1uZXcnKSkge1xyXG4gICAgICAgICAgZW5kTmV3SW5wdXQoKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgYWRkUm93KDEpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZm9jdXNFdmVudCgpO1xyXG4gICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgLy8g5bem44Kr44O844K944OrIFxyXG4gIGZ1bmN0aW9uIGRvTGVmdCgpIHtcclxuICAgIGxldCBjdXJSb3cgPSBlZGl0Vmlldy5ub2RlKCkucm93cztcclxuICAgIC0tY2VsbEluZGV4O1xyXG4gICAgaWYgKGNlbGxJbmRleCA8IDApIHtcclxuICAgICAgaWYgKHJvd0luZGV4ICE9IDApIHtcclxuICAgICAgICBpZiAoZDMuc2VsZWN0KGN1clJvd1tyb3dJbmRleF0pLmF0dHIoJ2RhdGEtbmV3JykpIHtcclxuICAgICAgICAgIGVuZE5ld0lucHV0KGZhbHNlKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2VsbEluZGV4ID0gZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdLmNlbGxzLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgYWRkUm93KC0xKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY2VsbEluZGV4ID0gMDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZm9jdXNFdmVudCgpO1xyXG4gICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gIH1cclxuICBcclxuICAvLyDkuIrnp7vli5VcclxuICBmdW5jdGlvbiBkb1VwKCkge1xyXG4gICAgbGV0IGN1clJvdyA9IGVkaXRWaWV3Lm5vZGUoKS5yb3dzO1xyXG4gICAgaWYgKGQzLnNlbGVjdChjdXJSb3dbcm93SW5kZXhdKS5hdHRyKCdkYXRhLW5ldycpKSB7XHJcbiAgICAgIGVuZE5ld0lucHV0KGZhbHNlKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGFkZFJvdygtMSk7XHJcbiAgICB9XHJcbiAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBkb0Rvd24oKSB7XHJcbiAgICBsZXQgY3VyUm93ID0gZWRpdFZpZXcubm9kZSgpLnJvd3M7XHJcbiAgICBpZiAoZDMuc2VsZWN0KGN1clJvd1tyb3dJbmRleF0pLmF0dHIoJ2RhdGEtbmV3JykpIHtcclxuICAgICAgZW5kTmV3SW5wdXQoZmFsc2UpO1xyXG4gICAgfVxyXG4gICAgYWRkUm93KDEpO1xyXG4gICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gIH1cclxuICBcclxuICBmdW5jdGlvbiBkb1BhZ2VEb3duKCkge1xyXG4gICAgaWYgKGN1cnJlbnRFdmVudEluZGV4IDwgKGV2ZW50cy5sZW5ndGggLSAxKSkge1xyXG4gICAgICBjdXJyZW50RXZlbnRJbmRleCArPSBOVU1fUk9XO1xyXG4gICAgICBpZiAoY3VycmVudEV2ZW50SW5kZXggPiAoZXZlbnRzLmxlbmd0aCAtIDEpKSB7XHJcbiAgICAgICAgY3VycmVudEV2ZW50SW5kZXggLT0gTlVNX1JPVztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBuZWVkRHJhdyA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgfVxyXG4gICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gIH1cclxuICBcclxuICBmdW5jdGlvbiBkb1BhZ2VVcCgpe1xyXG4gICAgaWYgKGN1cnJlbnRFdmVudEluZGV4ID4gMCkge1xyXG4gICAgICBjdXJyZW50RXZlbnRJbmRleCAtPSBOVU1fUk9XO1xyXG4gICAgICBpZiAoY3VycmVudEV2ZW50SW5kZXggPCAwKSB7XHJcbiAgICAgICAgY3VycmVudEV2ZW50SW5kZXggPSAwO1xyXG4gICAgICB9XHJcbiAgICAgIG5lZWREcmF3ID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGRvU2Nyb2xsVXAoKVxyXG4gIHtcclxuICAgIGlmIChjdXJyZW50RXZlbnRJbmRleCA+IDApIHtcclxuICAgICAgLS1jdXJyZW50RXZlbnRJbmRleDtcclxuICAgICAgbmVlZERyYXcgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZG9TY3JvbGxEb3duKClcclxuICB7XHJcbiAgICBpZiAoKGN1cnJlbnRFdmVudEluZGV4ICsgTlVNX1JPVykgPD0gKGV2ZW50cy5sZW5ndGggLSAxKSkge1xyXG4gICAgICArK2N1cnJlbnRFdmVudEluZGV4O1xyXG4gICAgICBuZWVkRHJhdyA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBkb0hvbWUoKXtcclxuICAgIGlmIChjdXJyZW50RXZlbnRJbmRleCA+IDApIHtcclxuICAgICAgcm93SW5kZXggPSAwO1xyXG4gICAgICBjdXJyZW50RXZlbnRJbmRleCA9IDA7XHJcbiAgICAgIG5lZWREcmF3ID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICB9XHJcbiAgXHJcbiAgZnVuY3Rpb24gZG9FbmQoKXtcclxuICAgIGlmIChjdXJyZW50RXZlbnRJbmRleCAhPSAoZXZlbnRzLmxlbmd0aCAtIDEpKSB7XHJcbiAgICAgIHJvd0luZGV4ID0gMDtcclxuICAgICAgY3VycmVudEV2ZW50SW5kZXggPSBldmVudHMubGVuZ3RoIC0gMTtcclxuICAgICAgbmVlZERyYXcgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZG9EZWxldGUoKSB7XHJcbiAgICBpZiAoKHJvd0luZGV4ICsgY3VycmVudEV2ZW50SW5kZXgpID09IChldmVudHMubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBmb3JtRWRpdG9yLnVuZG9NYW5hZ2VyLmV4ZWMoXHJcbiAgICAgIHtcclxuICAgICAgICBleGVjKCkge1xyXG4gICAgICAgICAgdGhpcy5yb3dJbmRleCA9IHJvd0luZGV4O1xyXG4gICAgICAgICAgdGhpcy5jdXJyZW50RXZlbnRJbmRleCA9IGN1cnJlbnRFdmVudEluZGV4O1xyXG4gICAgICAgICAgdGhpcy5ldmVudCA9IGV2ZW50c1t0aGlzLnJvd0luZGV4XTtcclxuICAgICAgICAgIHRoaXMucm93RGF0YSA9IGV2ZW50c1t0aGlzLmN1cnJlbnRFdmVudEluZGV4ICsgdGhpcy5yb3dJbmRleF07XHJcbiAgICAgICAgICBlZGl0Vmlldy5ub2RlKCkuZGVsZXRlUm93KHRoaXMucm93SW5kZXgpO1xyXG4gICAgICAgICAgdGhpcy5saW5lQnVmZmVyID0gZm9ybUVkaXRvci5saW5lQnVmZmVyO1xyXG4gICAgICAgICAgZm9ybUVkaXRvci5saW5lQnVmZmVyID0gW3RoaXMuZXZlbnRdO1xyXG4gICAgICAgICAgZXZlbnRzLnNwbGljZSh0aGlzLmN1cnJlbnRFdmVudEluZGV4ICsgdGhpcy5yb3dJbmRleCwxKTtcclxuICAgICAgICAgIG5lZWREcmF3ID0gdHJ1ZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlZG8oKSB7XHJcbiAgICAgICAgICBlZGl0Vmlldy5ub2RlKCkuZGVsZXRlUm93KHRoaXMucm93SW5kZXgpO1xyXG4gICAgICAgICAgZXZlbnRzLnNwbGljZSh0aGlzLmN1cnJlbnRFdmVudEluZGV4ICsgdGhpcy5yb3dJbmRleCwxKTtcclxuICAgICAgICAgIG5lZWREcmF3ID0gdHJ1ZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHVuZG8oKSB7XHJcbiAgICAgICAgICBmb3JtRWRpdG9yLmxpbmVCdWZmZXIgPSB0aGlzLmxpbmVCdWZmZXI7XHJcbiAgICAgICAgICBldmVudHMuc3BsaWNlKHRoaXMuY3VycmVudEV2ZW50SW5kZXggKyB0aGlzLnJvd0luZGV4LDAsdGhpcy5ldmVudCk7XHJcbiAgICAgICAgICBuZWVkRHJhdyA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICApO1xyXG4gICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gIH1cclxuICBcclxuICBmdW5jdGlvbiBkb0xpbmVQYXN0ZSgpXHJcbiAge1xyXG4gICAgcGFzdGVFdmVudCgpO1xyXG4gIH1cclxuICBcclxuICBmdW5jdGlvbiBkb1JlZG8oKXtcclxuICAgIGZvcm1FZGl0b3IudW5kb01hbmFnZXIucmVkbygpO1xyXG4gICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZG9VbmRvKCl7XHJcbiAgICBmb3JtRWRpdG9yLnVuZG9NYW5hZ2VyLnVuZG8oKTtcclxuICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICB9XHJcbiAgLy8gY3V0RXZlbnTjga7nt6jpm4bjgYvjgolcclxuICAvLyDjgqTjg5njg7Pjg4jjga7jgqvjg4Pjg4hcclxuICBmdW5jdGlvbiBjdXRFdmVudCgpXHJcbiAge1xyXG4gICAgZm9ybUVkaXRvci51bmRvTWFuYWdlci5leGVjKFxyXG4gICAge1xyXG4gICAgICBleGVjKCl7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RTdGFydEluZGV4ID0gc2VsZWN0U3RhcnRJbmRleDtcclxuICAgICAgICB0aGlzLnNlbGVjdEVuZEluZGV4ID0gc2VsZWN0RW5kSW5kZXg7XHJcbiAgICAgICAgdGhpcy5jdXQoKTtcclxuICAgICAgfSxcclxuICAgICAgY3V0KCl7XHJcbiAgICAgICAgdGhpcy5saW5lQnVmZmVyID0gZm9ybUVkaXRvci5saW5lQnVmZmVyO1xyXG4gICAgICAgIGZvcm1FZGl0b3IubGluZUJ1ZmZlciA9IFxyXG4gICAgICAgIGV2ZW50cy5zcGxpY2UodGhpcy5zZWxlY3RTdGFydEluZGV4LCB0aGlzLnNlbGVjdEVuZEluZGV4ICsgMSAtIHRoaXMuc2VsZWN0U3RhcnRJbmRleCApO1xyXG4gICAgICAgIHJvd0luZGV4ID0gdGhpcy5zZWxlY3RTdGFydEluZGV4IC0gY3VycmVudEV2ZW50SW5kZXg7XHJcbiAgICAgICAgbmVlZERyYXcgPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgICByZWRvKClcclxuICAgICAge1xyXG4gICAgICAgIHRoaXMuY3V0KCk7ICAgICAgICBcclxuICAgICAgfSxcclxuICAgICAgdW5kbygpe1xyXG4gICAgICAgZm9ybUVkaXRvci5saW5lQnVmZmVyLmZvckVhY2goKGQsaSk9PntcclxuICAgICAgICAgZXZlbnRzLnNwbGljZSh0aGlzLnNlbGVjdFN0YXJ0SW5kZXggKyBpLDAsZCk7XHJcbiAgICAgICB9KTtcclxuICAgICAgIGZvcm1FZGl0b3IubGluZUJ1ZmZlciA9IHRoaXMubGluZUJ1ZmZlcjtcclxuICAgICAgIG5lZWREcmF3ID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgfSBcclxuICBcclxuICAvLyDjgqTjg5njg7Pjg4jjga7jgrPjg5Tjg7xcclxuICBmdW5jdGlvbiBjb3B5RXZlbnQoKVxyXG4gIHtcclxuICAgIGZvcm1FZGl0b3IudW5kb01hbmFnZXIuZXhlYyhcclxuICAgIHtcclxuICAgICAgZXhlYygpe1xyXG4gICAgICAgIHRoaXMuc2VsZWN0U3RhcnRJbmRleCA9IHNlbGVjdFN0YXJ0SW5kZXg7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RFbmRJbmRleCA9IHNlbGVjdEVuZEluZGV4O1xyXG4gICAgICAgIHRoaXMuY29weSgpO1xyXG4gICAgICB9LFxyXG4gICAgICBjb3B5KCl7XHJcbiAgICAgICAgdGhpcy5saW5lQnVmZmVyID0gZm9ybUVkaXRvci5saW5lQnVmZmVyO1xyXG4gICAgICAgIGZvcm1FZGl0b3IubGluZUJ1ZmZlciA9IFtdO1xyXG4gICAgICAgIGZvcihsZXQgaSA9IHRoaXMuc2VsZWN0U3RhcnRJbmRleCxlID0gdGhpcy5zZWxlY3RFbmRJbmRleCArIDE7aTwgZTsrK2kpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZm9ybUVkaXRvci5saW5lQnVmZmVyLnB1c2goZXZlbnRzW2ldLmNvbmNhdCgpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbmVlZERyYXcgPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgICByZWRvKClcclxuICAgICAge1xyXG4gICAgICAgIHRoaXMuY29weSgpOyAgICAgICAgXHJcbiAgICAgIH0sXHJcbiAgICAgIHVuZG8oKXtcclxuICAgICAgIGZvcm1FZGl0b3IubGluZUJ1ZmZlciA9IHRoaXMubGluZUJ1ZmZlcjtcclxuICAgICAgIG5lZWREcmF3ID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgfVxyXG4gIFxyXG4gIC8vIOOCpOODmeODs+ODiOOBruODmuODvOOCueODiFxyXG4gIGZ1bmN0aW9uIHBhc3RlRXZlbnQoKXtcclxuICAgIGlmKGZvcm1FZGl0b3IubGluZUJ1ZmZlcil7XHJcbiAgICBmb3JtRWRpdG9yLnVuZG9NYW5hZ2VyLmV4ZWMoXHJcbiAgICB7XHJcbiAgICAgIGV4ZWMoKXtcclxuICAgICAgICB0aGlzLnN0YXJ0SW5kZXggPSByb3dJbmRleCArIGN1cnJlbnRFdmVudEluZGV4O1xyXG4gICAgICAgIHRoaXMuY291bnQgPSBmb3JtRWRpdG9yLmxpbmVCdWZmZXIubGVuZ3RoO1xyXG4gICAgICAgIHRoaXMucGFzdGUoKTtcclxuICAgICAgfSxcclxuICAgICAgcGFzdGUoKXtcclxuICAgICAgICBmb3IobGV0IGkgPSB0aGlzLmNvdW50IC0gMSxlID0gMDtpID49IGU7LS1pKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGV2ZW50cy5zcGxpY2UodGhpcy5zdGFydEluZGV4LDAsZm9ybUVkaXRvci5saW5lQnVmZmVyW2ldLmNvbmNhdCgpKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHJlZG8oKXtcclxuICAgICAgICB0aGlzLnBhc3RlKCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHVuZG8oKXtcclxuICAgICAgICBldmVudHMuc3BsaWNlKHRoaXMuc3RhcnRJbmRleCx0aGlzLmNvdW50KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBuZWVkRHJhdyA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgfVxyXG4gIFxyXG4gIGZ1bmN0aW9uICpkb1NlbGVjdCgpXHJcbiAge1xyXG4gICAgbGV0IGlucHV0O1xyXG4gICAgbGV0IGluZGV4QmFja3VwID0gcm93SW5kZXggKyBjdXJyZW50RXZlbnRJbmRleDtcclxuICAgIHNlbGVjdFN0YXJ0SW5kZXggPSByb3dJbmRleCArIGN1cnJlbnRFdmVudEluZGV4O1xyXG4gICAgc2VsZWN0RW5kSW5kZXggPSBzZWxlY3RTdGFydEluZGV4O1xyXG4gICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gICAgZHJhd0V2ZW50KCk7XHJcbiAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICBsZXQgZXhpdExvb3AgPSBmYWxzZTtcclxuICAgIHdoaWxlKCFleGl0TG9vcClcclxuICAgIHtcclxuICAgICAgaW5wdXQgPSB5aWVsZCBjYW5jZWxFdmVudDtcclxuICAgICAgXHJcbiAgICAgIHN3aXRjaChpbnB1dC5pbnB1dENvbW1hbmQuaWQpe1xyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kcy5zZWxlY3QuaWQ6XHJcbiAgICAgICAgICBleGl0TG9vcCA9IHRydWU7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZHMuY3V0RXZlbnQuaWQ6XHJcbiAgICAgICAgICBjdXRFdmVudCgpO1xyXG4gICAgICAgICAgZXhpdExvb3AgPSB0cnVlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBJbnB1dENvbW1hbmRzLmNvcHlFdmVudC5pZDpcclxuICAgICAgICAgIGNvcHlFdmVudCgpO1xyXG4gICAgICAgICAgZXhpdExvb3AgPSB0cnVlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgIGxldCBmbiA9IGVkaXRGdW5jc1tpbnB1dC5pbnB1dENvbW1hbmQuaWRdO1xyXG4gICAgICAgICAgaWYoZm4pe1xyXG4gICAgICAgICAgICBmbihpbnB1dCk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGNhbmNlbEV2ZW50ID0gZmFsc2U7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAvLyDpgbjmip7nr4Tlm7Ljga7oqIjnrpdcclxuICAgICAgICAgIGlmKGluZGV4QmFja3VwICE9IChyb3dJbmRleCArIGN1cnJlbnRFdmVudEluZGV4KSlcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IGRlbHRhID0gcm93SW5kZXggKyBjdXJyZW50RXZlbnRJbmRleCAtIGluZGV4QmFja3VwO1xyXG4gICAgICAgICAgICBsZXQgaW5kZXhOZXh0ID0gcm93SW5kZXggKyBjdXJyZW50RXZlbnRJbmRleDsgICAgICAgICBcclxuICAgICAgICAgICAgaWYoZGVsdGEgPCAwKXtcclxuICAgICAgICAgICAgICBpZihzZWxlY3RTdGFydEluZGV4ID4gaW5kZXhOZXh0KXtcclxuICAgICAgICAgICAgICAgIHNlbGVjdFN0YXJ0SW5kZXggPSBpbmRleE5leHQ7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGVjdEVuZEluZGV4ID0gaW5kZXhOZXh0O1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBpZihzZWxlY3RFbmRJbmRleCA8IGluZGV4TmV4dCl7XHJcbiAgICAgICAgICAgICAgICBzZWxlY3RFbmRJbmRleCA9IGluZGV4TmV4dDtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2VsZWN0U3RhcnRJbmRleCA9IGluZGV4TmV4dDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaW5kZXhCYWNrdXAgPSByb3dJbmRleCArIGN1cnJlbnRFdmVudEluZGV4O1xyXG4gICAgICAgICAgICBuZWVkRHJhdyA9IHRydWU7XHJcbiAgICAgICAgICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgIH0gICAgICAgIFxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGlmKG5lZWREcmF3KXtcclxuICAgICAgICBkcmF3RXZlbnQoKTtcclxuICAgICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICAgICAgbmVlZERyYXcgPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIOW+jOWni+acq1xyXG4gICAgc2VsZWN0U3RhcnRJbmRleCA9IG51bGw7XHJcbiAgICBzZWxlY3RFbmRJbmRleCA9IG51bGw7XHJcbiAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICBkcmF3RXZlbnQoKTtcclxuICAgIGZvY3VzRXZlbnQoKTtcclxuICAgIG5lZWREcmF3ID0gZmFsc2U7XHJcbiAgfVxyXG4gIFxyXG4gIHZhciBlZGl0RnVuY3MgPSB7XHJcbiAgICBbSW5wdXRDb21tYW5kcy5lbnRlci5pZF06ZG9FbnRlcixcclxuICAgIFtJbnB1dENvbW1hbmRzLnJpZ2h0LmlkXTpkb1JpZ2h0LFxyXG4gICAgW0lucHV0Q29tbWFuZHMubGVmdC5pZF06ZG9MZWZ0LFxyXG4gICAgW0lucHV0Q29tbWFuZHMudXAuaWRdOmRvVXAsXHJcbiAgICBbSW5wdXRDb21tYW5kcy5kb3duLmlkXTpkb0Rvd24sXHJcbiAgICBbSW5wdXRDb21tYW5kcy5wYWdlRG93bi5pZF06ZG9QYWdlRG93bixcclxuICAgIFtJbnB1dENvbW1hbmRzLnBhZ2VVcC5pZF06ZG9QYWdlVXAsXHJcbiAgICBbSW5wdXRDb21tYW5kcy5zY3JvbGxVcC5pZF06ZG9TY3JvbGxVcCxcclxuICAgIFtJbnB1dENvbW1hbmRzLnNjcm9sbERvd24uaWRdOmRvU2Nyb2xsRG93bixcclxuICAgIFtJbnB1dENvbW1hbmRzLmhvbWUuaWRdOmRvSG9tZSxcclxuICAgIFtJbnB1dENvbW1hbmRzLmVuZC5pZF06ZG9FbmQsXHJcbiAgICBbSW5wdXRDb21tYW5kcy5kZWxldGUuaWRdOmRvRGVsZXRlLFxyXG4gICAgW0lucHV0Q29tbWFuZHMubGluZVBhc3RlLmlkXTpkb0xpbmVQYXN0ZSxcclxuICAgIFtJbnB1dENvbW1hbmRzLnJlZG8uaWRdOmRvUmVkbyxcclxuICAgIFtJbnB1dENvbW1hbmRzLnVuZG8uaWRdOmRvVW5kbyxcclxuICAgIFtJbnB1dENvbW1hbmRzLnBhc3RlRXZlbnQuaWRdOnBhc3RlRXZlbnRcclxuICB9O1xyXG4gIFxyXG4gIGRyYXdFdmVudCgpO1xyXG4gIHdoaWxlICh0cnVlKSB7XHJcbi8vICAgIGNvbnNvbGUubG9nKCduZXcgbGluZScsIHJvd0luZGV4LCBldmVudHMubGVuZ3RoKTtcclxuICAgIGlmIChldmVudHMubGVuZ3RoID09IDAgfHwgcm93SW5kZXggPiAoZXZlbnRzLmxlbmd0aCAtIDEpKSB7XHJcbiAgICB9XHJcbiAgICBrZXlsb29wOlxyXG4gICAgd2hpbGUgKHRydWUpIHtcclxuICAgICAgbGV0IGlucHV0ID0geWllbGQgY2FuY2VsRXZlbnQ7XHJcbiAgICAgIGlmKGlucHV0LmlucHV0Q29tbWFuZC5pZCA9PT0gSW5wdXRDb21tYW5kcy5zZWxlY3QuaWQpXHJcbiAgICAgIHtcclxuICAgICAgICB5aWVsZCogZG9TZWxlY3QoKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBsZXQgZm4gPSBlZGl0RnVuY3NbaW5wdXQuaW5wdXRDb21tYW5kLmlkXTtcclxuICAgICAgICBpZiAoZm4pIHtcclxuICAgICAgICAgIGZuKGlucHV0KTtcclxuICAgICAgICAgIGlmIChuZWVkRHJhdykge1xyXG4gICAgICAgICAgICBkcmF3RXZlbnQoKTtcclxuICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgICBuZWVkRHJhdyA9IGZhbHNlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBjYW5jZWxFdmVudCA9IGZhbHNlO1xyXG4gLy8gICAgICAgICBjb25zb2xlLmxvZygnZGVmYXVsdCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0ICogYXMgRW5lbWllcyBmcm9tICcuLi8uLi9qcy9lbmVtaWVzJztcclxuaW1wb3J0IHsgVW5kb01hbmFnZXIgfSBmcm9tICcuL3VuZG8nOyBcclxuXHJcbmNsYXNzIElucHV0Q29tbWFuZHtcclxuICBjb25zdHJ1Y3RvcihpZCxuYW1lLGRlc2MpXHJcbiAge1xyXG4gICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgIHRoaXMuZGVzYyA9IGRlc2M7XHJcbiAgfVxyXG4gIHRvSlNPTigpe1xyXG4gICAgcmV0dXJuIHRoaXMubmFtZTtcclxuICB9XHJcbn07XHJcblxyXG5jb25zdCBJbnB1dENvbW1hbmRzID1cclxue1xyXG4gIGVudGVyOiBuZXcgSW5wdXRDb21tYW5kKDEsJ2VudGVyJywn5oy/5YWlJyksXHJcbiAgZXNjOiBuZXcgSW5wdXRDb21tYW5kKDIsJ2VzYycsJ+OCreODo+ODs+OCu+ODqycpLFxyXG4gIHJpZ2h0OiBuZXcgSW5wdXRDb21tYW5kKDMsJ3JpZ2h0Jywn44Kr44O844K944Or56e75YuV77yI5Y+z77yJJyksXHJcbiAgbGVmdDogbmV3IElucHV0Q29tbWFuZCg0LCdsZWZ0Jywn44Kr44O844K944Or56e75YuV77yI5bem77yJJyksXHJcbiAgdXA6IG5ldyBJbnB1dENvbW1hbmQoNSwndXAnLCfjgqvjg7zjgr3jg6vnp7vli5XvvIjkuIrvvIknKSxcclxuICBkb3duOiBuZXcgSW5wdXRDb21tYW5kKDYsJ2Rvd24nLCfjgqvjg7zjgr3jg6vnp7vli5XvvIjkuIvvvIknKSxcclxuICB1bmRvOiBuZXcgSW5wdXRDb21tYW5kKDgsJ3VuZG8nLCfjgqLjg7Pjg4njgqUnKSxcclxuICByZWRvOiBuZXcgSW5wdXRDb21tYW5kKDksJ3JlZG8nLCfjg6rjg4njgqUnKSxcclxuICBwYWdlVXA6IG5ldyBJbnB1dENvbW1hbmQoMTAsJ3BhZ2VVcCcsJ+ODmuODvOOCuOOCouODg+ODlycpLFxyXG4gIHBhZ2VEb3duOiBuZXcgSW5wdXRDb21tYW5kKDExLCdwYWdlRG93bicsJ+ODmuODvOOCuOODgOOCpuODsycpLFxyXG4gIGhvbWU6IG5ldyBJbnB1dENvbW1hbmQoMTIsJ2hvbWUnLCflhYjpoK3ooYzjgavnp7vli5UnKSxcclxuICBlbmQ6IG5ldyBJbnB1dENvbW1hbmQoMTMsJ2VuZCcsJ+e1guerr+ihjOOBq+enu+WLlScpLFxyXG4gIHNjcm9sbFVwOiBuZXcgSW5wdXRDb21tYW5kKDE2LCdzY3JvbGxVcCcsJ+mrmOmAn+OCueOCr+ODreODvOODq+OCouODg+ODlycpLFxyXG4gIHNjcm9sbERvd246IG5ldyBJbnB1dENvbW1hbmQoMTcsJ3Njcm9sbERvd24nLCfpq5jpgJ/jgrnjgq/jg63jg7zjg6vjg4Djgqbjg7MnKSxcclxuICBkZWxldGU6IG5ldyBJbnB1dENvbW1hbmQoMTgsJ2RlbGV0ZScsJ+ihjOWJiumZpCcpLFxyXG4gIGxpbmVQYXN0ZTogbmV3IElucHV0Q29tbWFuZCgxOSwnbGluZVBhc3RlJywn6KGM44Oa44O844K544OIJyksXHJcbiAgbWVhc3VyZUJlZm9yZTogbmV3IElucHV0Q29tbWFuZCgyMCwnbWVhc3VyZUJlZm9yZScsJ+Wwj+evgOWNmOS9jeOBruS4iuenu+WLlScpLFxyXG4gIG1lYXN1cmVOZXh0OiBuZXcgSW5wdXRDb21tYW5kKDIxLCdtZWFzdXJlTmV4dCcsJ+Wwj+evgOWNmOS9jeOBruS4i+enu+WLlScpLFxyXG4gIHNlbGVjdDpuZXcgSW5wdXRDb21tYW5kKDIyLCdzZWxlY3QnLCfpgbjmip7jga7plovlp4vjg7vntYLkuoYnKSxcclxuICBjdXRFdmVudDpuZXcgSW5wdXRDb21tYW5kKDIzLCdjdXRFdmVudCcsJ+OCpOODmeODs+ODiOOCq+ODg+ODiCcpLFxyXG4gIGNvcHlFdmVudDpuZXcgSW5wdXRDb21tYW5kKDI0LCdjb3B5RXZlbnQnLCfjgqTjg5njg7Pjg4jjgrPjg5Tjg7wnKSxcclxuICBwYXN0ZUV2ZW50Om5ldyBJbnB1dENvbW1hbmQoMjUsJ3Bhc3RlRXZlbnQnLCfjgqTjg5njg7Pjg4jjg5rjg7zjgrnjg4gnKVxyXG59O1xyXG5cclxuLy9cclxuY29uc3Qga2V5QmluZHMgPVxyXG4gIHtcclxuICAgIDEzOiBbe1xyXG4gICAgICBrZXlDb2RlOiAxMyxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kcy5lbnRlclxyXG4gICAgfV0sXHJcbiAgICAyNzogW3tcclxuICAgICAga2V5Q29kZTogMjcsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZHMuZXNjXHJcbiAgICB9XSxcclxuICAgIDMyOiBbe1xyXG4gICAgICBrZXlDb2RlOiAzMixcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kcy5yaWdodFxyXG4gICAgfV0sXHJcbiAgICAzOTogW3tcclxuICAgICAga2V5Q29kZTogMzksXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZHMucmlnaHRcclxuICAgIH1dLFxyXG4gICAgMzc6IFt7XHJcbiAgICAgIGtleUNvZGU6IDM3LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLmxlZnRcclxuICAgIH1dLFxyXG4gICAgMzg6IFt7XHJcbiAgICAgIGtleUNvZGU6IDM4LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLnVwXHJcbiAgICB9XSxcclxuICAgIDQwOiBbe1xyXG4gICAgICBrZXlDb2RlOiA0MCxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kcy5kb3duXHJcbiAgICB9XSxcclxuICAgIDEwNjogW3tcclxuICAgICAga2V5Q29kZTogMTA2LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLmluc2VydE1lYXN1cmVcclxuICAgIH1dLFxyXG4gICAgOTA6IFt7XHJcbiAgICAgIGtleUNvZGU6IDkwLFxyXG4gICAgICBjdHJsS2V5OiB0cnVlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZHMudW5kb1xyXG4gICAgfV0sXHJcbiAgICAzMzogW3tcclxuICAgICAga2V5Q29kZTogMzMsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZHMucGFnZVVwXHJcbiAgICAgIH0se1xyXG4gICAgICAgIGtleUNvZGU6IDMzLFxyXG4gICAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICAgIHNoaWZ0S2V5OiB0cnVlLFxyXG4gICAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLnNjcm9sbFVwXHJcbiAgICAgIH0se1xyXG4gICAgICBrZXlDb2RlOiAzMyxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiB0cnVlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLm1lYXN1cmVCZWZvcmVcclxuICAgICAgfSAgICAgIF0sXHJcbiAgICAvLyA4MjogW3tcclxuICAgIC8vICAga2V5Q29kZTogODIsXHJcbiAgICAvLyAgIGN0cmxLZXk6IHRydWUsXHJcbiAgICAvLyAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgIC8vICAgYWx0S2V5OiBmYWxzZSxcclxuICAgIC8vICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAvLyAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kcy5wYWdlVXBcclxuICAgIC8vIH1dLFxyXG4gICAgMzQ6IFt7IC8vIFBhZ2UgRG93biBcclxuICAgICAga2V5Q29kZTogMzQsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZHMucGFnZURvd25cclxuICAgIH0sIHtcclxuICAgICAgICBrZXlDb2RlOiAzNCxcclxuICAgICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgICBzaGlmdEtleTogdHJ1ZSxcclxuICAgICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kcy5zY3JvbGxEb3duXHJcbiAgICAgIH1dLFxyXG4gICAgMzY6IFt7XHJcbiAgICAgIGtleUNvZGU6IDM2LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLmhvbWVcclxuICAgIH1dLFxyXG4gICAgMzU6IFt7XHJcbiAgICAgIGtleUNvZGU6IDM1LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLmVuZFxyXG4gICAgfV0sXHJcbiAgICA4OTogW3tcclxuICAgICAga2V5Q29kZTogODksXHJcbiAgICAgIGN0cmxLZXk6IHRydWUsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kcy5kZWxldGVcclxuICAgIH1dLFxyXG4gICAgNzY6IFt7XHJcbiAgICAgIGtleUNvZGU6IDc2LFxyXG4gICAgICBjdHJsS2V5OiB0cnVlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZHMubGluZVBhc3RlXHJcbiAgICB9XSxcclxuICAgIDExNzpbLy8gRjZcclxuICAgICAge1xyXG4gICAgICBrZXlDb2RlOiAxMTcsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZHMuc2VsZWN0XHJcbiAgICAgIH1cclxuICAgIF0sXHJcbiAgICAxMTg6Wy8vIEY3XHJcbiAgICAgIHtcclxuICAgICAga2V5Q29kZTogMTE4LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLmN1dEV2ZW50XHJcbiAgICAgIH1cclxuICAgIF0sXHJcbiAgICAxMTk6Wy8vIEY4XHJcbiAgICAgIHtcclxuICAgICAga2V5Q29kZTogMTE5LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLmNvcHlFdmVudFxyXG4gICAgICB9XHJcbiAgICBdLFxyXG4gICAgMTIwOlsvLyBGOVxyXG4gICAgICB7XHJcbiAgICAgIGtleUNvZGU6IDEyMCxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kcy5wYXN0ZUV2ZW50XHJcbiAgICAgIH1cclxuICAgIF1cclxuICB9O1xyXG5cclxuZXhwb3J0IGNsYXNzIEVuZW15TW92U2VxRWRpdG9yIHtcclxuICBjb25zdHJ1Y3RvcihlbmVteUVkaXRvcixwYXR0ZXJuTm8pIHtcclxuICAgIHRoaXMudW5kb01hbmFnZXIgPSBuZXcgVW5kb01hbmFnZXIoKTtcclxuICAgIHRoaXMuZW5lbXlFZGl0b3IgPSBlbmVteUVkaXRvcjtcclxuICAgIHRoaXMubGluZUJ1ZmZlciA9IG51bGw7XHJcbiAgICB0aGlzLmRlYnVnVWkgPSBlbmVteUVkaXRvci5kZXZUb29sLmRlYnVnVWk7XHJcbiAgICB0aGlzLmVkaXRvclVpID0gZW5lbXlFZGl0b3IudWkuYXBwZW5kKCdkaXYnKS5jbGFzc2VkKCdtb3ZzZXEtZWRpdG9yJywgdHJ1ZSk7XHJcbiAgICB0aGlzLmV2ZW50RWRpdCA9IHRoaXMuZWRpdG9yVWkuYXBwZW5kKCd0YWJsZScpLmF0dHIoJ3RhYmluZGV4JywwKTtcclxuICAgIHRoaXMuaGVhZHJvdyA9IHRoaXMuZXZlbnRFZGl0LmFwcGVuZCgndGhlYWQnKS5hcHBlbmQoJ3RyJyk7XHJcbiAgICB0aGlzLmhlYWRyb3cuYXBwZW5kKCd0aCcpLnRleHQoJ05vJyk7XHJcbiAgICB0aGlzLmhlYWRyb3cuYXBwZW5kKCd0aCcpLnRleHQoJ0NvbW1hbmQnKTtcclxuICAgIHRoaXMuaGVhZHJvdy5hcHBlbmQoJ3RoJykudGV4dCgncGFyYW0nKTtcclxuICAgIFxyXG4gICAgdGhpcy5ldmVudEJvZHkgPSB0aGlzLmV2ZW50RWRpdC5hcHBlbmQoJ3Rib2R5JykuYXR0cignaWQnLCAnc2VxZXZlbnRzJyk7XHJcbiAgICB0aGlzLnBhdHRlcm5ObyA9IHBhdHRlcm5ObztcclxuICB9XHJcblxyXG4gIHNldCBwYXR0ZXJuTm8odikgXHJcbiAge1xyXG4gICAgaWYodiA9PSB0aGlzLnBhdHRlcm5Ob18pIHJldHVybjtcclxuICAgIGxldCB0aGlzXyA9IHRoaXM7XHJcbiAgICB0aGlzLnBhdHRlcm5Ob18gPSB2O1xyXG4gICAgdGhpcy5lZGl0b3IgJiYgdGhpcy5lZGl0b3IucmV0dXJuKDApO1xyXG4gICAgdGhpcy5ldmVudEJvZHkuZGF0dW0odGhpcy5lbmVteUVkaXRvci5kZXZUb29sLmdhbWUuZW5lbWllcy5tb3ZlUGF0dGVybnNbdl0pO1xyXG4gICAgdGhpcy5lZGl0b3IgPSBkb0VkaXRvcih0aGlzLmV2ZW50Qm9keSx0aGlzKTtcclxuICAgIHRoaXMuZWRpdG9yLm5leHQoKTtcclxuXHJcbiAgICAvLyDjgq3jg7zlhaXlipvjg4/jg7Pjg4njg6lcclxuICAgIHRoaXMuZXZlbnRFZGl0Lm9uKCdrZXlkb3duJywgZnVuY3Rpb24gKGQpIHtcclxuICAgICAgbGV0IGUgPSBkMy5ldmVudDtcclxuICAvLyAgICBjb25zb2xlLmxvZyhlLmtleUNvZGUpO1xyXG4gICAgICBsZXQga2V5ID0ga2V5QmluZHNbZS5rZXlDb2RlXTtcclxuICAgICAgbGV0IHJldCA9IHt9O1xyXG4gICAgICBpZiAoa2V5KSB7XHJcbiAgICAgICAga2V5LnNvbWUoKGQpID0+IHtcclxuICAgICAgICAgIGlmIChkLmN0cmxLZXkgPT0gZS5jdHJsS2V5XHJcbiAgICAgICAgICAgICYmIGQuc2hpZnRLZXkgPT0gZS5zaGlmdEtleVxyXG4gICAgICAgICAgICAmJiBkLmFsdEtleSA9PSBlLmFsdEtleVxyXG4gICAgICAgICAgICAmJiBkLm1ldGFLZXkgPT0gZS5tZXRhS2V5XHJcbiAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICByZXQgPSB0aGlzXy5lZGl0b3IubmV4dChkKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKHJldC52YWx1ZSkge1xyXG4gICAgICAgICAgZDMuZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgIGQzLmV2ZW50LmNhbmNlbEJ1YmJsZSA9IHRydWU7XHJcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbi8vIOOCqOODh+OCo+OCv+acrOS9k1xyXG5mdW5jdGlvbiogZG9FZGl0b3IoZXZlbnRFZGl0LCBmb3JtRWRpdG9yKSB7XHJcbiAgbGV0IGtleWNvZGUgPSAwOy8vIOWFpeWKm+OBleOCjOOBn+OCreODvOOCs+ODvOODieOCkuS/neaMgeOBmeOCi+WkieaVsFxyXG4gIGxldCBldmVudHMgPSBldmVudEVkaXQuZGF0dW0oKTsvLyDnj77lnKjnt6jpm4bkuK3jga7jg4jjg6njg4Pjgq9cclxuICBsZXQgZWRpdFZpZXcgPSBkMy5zZWxlY3QoJyNzZXFldmVudHMnKTsvL+e3qOmbhueUu+mdouOBruOCu+ODrOOCr+OCt+ODp+ODs1xyXG4gIGxldCByb3dJbmRleCA9IDA7Ly8g57eo6ZuG55S76Z2i44Gu54++5Zyo6KGMXHJcbiAgbGV0IGN1cnJlbnRFdmVudEluZGV4ID0gMDsvLyDjgqTjg5njg7Pjg4jphY3liJfjga7nt6jpm4bplovlp4vooYxcclxuICBsZXQgY2VsbEluZGV4ID0gMDsvLyDliJfjgqTjg7Pjg4fjg4Pjgq/jgrlcclxuICBsZXQgY2FuY2VsRXZlbnQgPSBmYWxzZTsvLyDjgqTjg5njg7Pjg4jjgpLjgq3jg6Pjg7Pjgrvjg6vjgZnjgovjgYvjganjgYbjgYtcclxuICBjb25zdCBOVU1fUk9XID0gMTA7Ly8g77yR55S76Z2i44Gu6KGM5pWwXHJcbiAgbGV0IHNlbGVjdFN0YXJ0SW5kZXggPSBudWxsO1xyXG4gIGxldCBzZWxlY3RFbmRJbmRleCA9IG51bGw7XHJcbiAgbGV0IG5lZWREcmF3ID0gZmFsc2U7XHJcbiAgbGV0IGcgPSBmb3JtRWRpdG9yLmVuZW15RWRpdG9yLmRldlRvb2wuZ2FtZTtcclxuICBcclxuICAvL2lmKCFnLnRhc2tzLmVuYWJsZSl7XHJcbiAgLy8gIGcudGFza3MuZW5hYmxlID0gdHJ1ZTtcclxuLy8gICAgZy50YXNrcy5jbGVhcigpO1xyXG4vLyAgICBnLnRhc2tzLnB1c2hUYXNrKGcucmVuZGVyLmJpbmQoZyksIGcuUkVOREVSRVJfUFJJT1JJVFkpO1xyXG4vLyAgICBnLnNob3dTcGFjZUZpZWxkKCk7XHJcbiAvLyAgIGcuZW5lbWllcy5yZXNldCgpO1xyXG4gLy8vLyB9XHJcblxyXG4gIC8vZy50YXNrcy5wcm9jZXNzKGcpO1xyXG4gIFxyXG4gIGZ1bmN0aW9uIHNldElucHV0KCkge1xyXG4gICAgbGV0IHRoaXNfID0gdGhpcztcclxuICAgIHRoaXMuYXR0cignY29udGVudEVkaXRhYmxlJyxmdW5jdGlvbihkLGkpe1xyXG4vLyAgICAgIGlmKGkgIT0gMCl7XHJcbiAgICAgICAgcmV0dXJuICd0cnVlJyAgICAgICAgXHJcbi8vICAgICAgfSBlbHNlIHtcclxuLy8gICAgICAgIHJldHVybiAnZmFsc2UnO1xyXG4vLyAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMub24oJ2ZvY3VzJywgZnVuY3Rpb24gKCkge1xyXG4gICAvLyAgIGNvbnNvbGUubG9nKHRoaXMucGFyZW50Tm9kZS5yb3dJbmRleCAtIDEpO1xyXG4gICAgICByb3dJbmRleCA9IHRoaXMucGFyZW50Tm9kZS5yb3dJbmRleCAtIDE7XHJcbiAgICAgIGNlbGxJbmRleCA9IHRoaXMuY2VsbEluZGV4O1xyXG4gICAgICAvL2cuZW5lbWllcy5yZXNldCgpO1xyXG4gICAgICBsZXQgaW5kZXggPSBwYXJzZUludCh0aGlzXy5hdHRyKCdkYXRhLXJvdy1pbmRleCcpKTtcclxuICAgICAgLy9mb3JtRWRpdG9yLmVuZW15RWRpdG9yLmRldlRvb2wuZ2FtZS5lbmVtaWVzLnN0YXJ0RW5lbXlJbmRleGVkKGV2ZW50c1tpbmRleF0saW5kZXgpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIFxyXG4gIGZ1bmN0aW9uIHNldEJsdXIoKXtcclxuICAgIGxldCB0aGlzXyA9IHRoaXM7IFxyXG4gICAgbGV0IGRhdGEgPSB0aGlzLmRhdGEoKTtcclxuICAgICB0aGlzLm9uKCdibHVyJyxmdW5jdGlvbihkLGkpe1xyXG4gICAgICAgaWYobmVlZERyYXcpIHJldHVybjtcclxuICAgICAgICAvL2V2ZW50c1twYXJzZUludCh0aGlzXy5hdHRyKCdkYXRhLXJvdy1pbmRleCcpKV07XHJcbiAgICAgICAgLy9pZih0aGlzXy5hdHRyKCdkYXRhLXJvdy1pbmRleCcpKXtcclxuICAgICAgICAgIGxldCBhcnJheTtcclxuLy8gICAgICAgICAgbGV0IGRhdGEgPSB0aGlzXy5kYXRhKCk7XHJcbiAgICAgICAgICBpZihpID09IDIpe1xyXG4gICAgICAgICAgICBkYXRhWzJdID0gdGhpcy5pbm5lclRleHQ7XHJcbiAgICAgICAgICAgIGFycmF5ID0gW2RhdGFbMV1dLmNvbmNhdChKU09OLnBhcnNlKGBbJHt0aGlzLmlubmVyVGV4dH1dYCkpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZGF0YVsxXSA9IHRoaXMuaW5uZXJUZXh0O1xyXG4gICAgICAgICAgICBhcnJheSA9IFt0aGlzLmlubmVyVGV4dF0uY29uY2F0KEpTT04ucGFyc2UoYFske2RhdGFbMl19XWApKTsgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBldmVudHNbcGFyc2VJbnQodGhpc18uYXR0cignZGF0YS1yb3ctaW5kZXgnKSldID0gZm9ybUVkaXRvci5lbmVteUVkaXRvci5kZXZUb29sLmdhbWUuZW5lbWllcy5jcmVhdGVNb3ZlUGF0dGVybkZyb21BcnJheShhcnJheSk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzXyxkLGksZGF0YSxldmVudHMpO1xyXG4gICAgICAgICAgLy9uZWVkRHJhdyA9IHRydWU7XHJcbiAgICAgICAvLyB9XHJcbiAgICAgIH0pO1xyXG4gIH1cclxuICBcclxuICBcclxuICAvLyDml6LlrZjjgqTjg5njg7Pjg4jjga7ooajnpLpcclxuICBmdW5jdGlvbiBkcmF3RXZlbnQoKSBcclxuICB7XHJcbiAgICBsZXQgc3RpID0gbnVsbCxzZWkgPSBudWxsO1xyXG4gICAgaWYoc2VsZWN0U3RhcnRJbmRleCAhPSBudWxsICYmIHNlbGVjdEVuZEluZGV4ICE9IG51bGwpe1xyXG4gICAgICAgIGlmKGN1cnJlbnRFdmVudEluZGV4IDw9IHNlbGVjdFN0YXJ0SW5kZXgpe1xyXG4gICAgICAgICAgc3RpID0gc2VsZWN0U3RhcnRJbmRleCAtIGN1cnJlbnRFdmVudEluZGV4O1xyXG4gICAgICAgICAgaWYoKGN1cnJlbnRFdmVudEluZGV4ICsgTlVNX1JPVykgPj0gc2VsZWN0RW5kSW5kZXgpXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNlaSA9IHNlbGVjdEVuZEluZGV4IC0gY3VycmVudEV2ZW50SW5kZXg7IFxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc2VpID0gTlVNX1JPVyAtIDE7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgc3RpID0gMDtcclxuICAgICAgICAgIGlmKChjdXJyZW50RXZlbnRJbmRleCArIE5VTV9ST1cpID49IHNlbGVjdEVuZEluZGV4KVxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBzZWkgPSBzZWxlY3RFbmRJbmRleCAtIGN1cnJlbnRFdmVudEluZGV4O1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc2VpID0gTlVNX1JPVyAtIDE7ICAgICAgICAgIFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBsZXQgZXZmbGFnbWVudCA9IFxyXG4gICAgICBldmVudHMuc2xpY2UoY3VycmVudEV2ZW50SW5kZXgsIE1hdGgubWluKGN1cnJlbnRFdmVudEluZGV4ICsgTlVNX1JPVyxldmVudHMubGVuZ3RoKSkubWFwKChkLGkpPT57XHJcbiAgICAgICAgbGV0IGFycmF5ID0gIGQudG9KU09OKCk7XHJcbiAgICAgICAgaWYoYXJyYXkubGVuZ3RoID09IDEpe1xyXG4gICAgICAgICAgcmV0dXJuIFtpICsgY3VycmVudEV2ZW50SW5kZXgsYXJyYXlbMF0sJyddO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gW2kgKyBjdXJyZW50RXZlbnRJbmRleCxhcnJheVswXSxhcnJheS5zbGljZSgxKS5qb2luKCcsJyldO1xyXG4gICAgICB9KTtcclxuICAgIFxyXG4gICAgZWRpdFZpZXcuc2VsZWN0QWxsKCd0cicpLnJlbW92ZSgpO1xyXG4gICAgbGV0IHNlbGVjdCA9IGVkaXRWaWV3LnNlbGVjdEFsbCgndHInKS5kYXRhKGV2ZmxhZ21lbnQpO1xyXG4gICAgbGV0IGVudGVyID0gc2VsZWN0LmVudGVyKCk7XHJcbiAgICBsZXQgcm93cyA9IGVudGVyLmFwcGVuZCgndHInKS5hdHRyKCdkYXRhLWluZGV4JywgKGQsIGkpID0+IGkpO1xyXG4gICAgaWYoc3RpICE9IG51bGwgJiYgc2VpICE9IG51bGwpe1xyXG4gICAgICByb3dzLmVhY2goZnVuY3Rpb24oZCxpKXtcclxuICAgICAgICBpZihpID49IHN0aSAmJiBpIDw9IHNlaSl7XHJcbiAgICAgICAgICBkMy5zZWxlY3QodGhpcykuY2xhc3NlZCgnc2VsZWN0ZWQnLHRydWUpOyAgICAgICAgICBcclxuICAgICAgICB9XHJcbiAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJvd3MuZWFjaChmdW5jdGlvbiAoZCwgaSkge1xyXG4gICAgICBsZXQgcm93ID0gZDMuc2VsZWN0KHRoaXMpO1xyXG4gXHJcbiAgICAgICByb3cuc2VsZWN0QWxsKCd0ZCcpXHJcbiAgICAgIC5kYXRhKGQpXHJcbiAgICAgIC5lbnRlcigpXHJcbiAgICAgIC5hcHBlbmQoJ3RkJylcclxuICAgICAgLmF0dHIoJ2RhdGEtcm93LWluZGV4JyxpICsgY3VycmVudEV2ZW50SW5kZXgpICAgICAgXHJcbiAgICAgIC50ZXh0KChkKT0+ZClcclxuICAgICAgLmNhbGwoc2V0SW5wdXQpXHJcbiAgICAgIC5jYWxsKHNldEJsdXIpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKHJvd0luZGV4ID4gKGV2ZmxhZ21lbnQubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgcm93SW5kZXggPSBldmZsYWdtZW50Lmxlbmd0aCAtIDE7XHJcbiAgICB9XHJcblxyXG4gIH1cclxuXHRcclxuICAvLyDjgqTjg5njg7Pjg4jjga7jg5Xjgqnjg7zjgqvjgrlcclxuICBmdW5jdGlvbiBmb2N1c0V2ZW50KCkge1xyXG4gICAgaWYoIWVkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XS5jZWxsc1tjZWxsSW5kZXhdKXtcclxuICAgICAgZGVidWdnZXI7XHJcbiAgICB9XHJcbiAgICBlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF0uY2VsbHNbY2VsbEluZGV4XS5mb2N1cygpO1xyXG4gIH1cclxuXHRcclxuICAvLyDjgqTjg5njg7Pjg4jjga7mjL/lhaVcclxuICBmdW5jdGlvbiBpbnNlcnRFdmVudChyb3dJbmRleCkge1xyXG4gICAgZm9ybUVkaXRvci51bmRvTWFuYWdlci5leGVjKHtcclxuICAgICAgZXhlYygpIHtcclxuICAgICAgICB0aGlzLnJvdyA9IGVkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XTtcclxuICAgICAgICB0aGlzLmNlbGxJbmRleCA9IGNlbGxJbmRleDtcclxuICAgICAgICB0aGlzLnJvd0luZGV4ID0gcm93SW5kZXg7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50RXZldEluZGV4ID0gY3VycmVudEV2ZW50SW5kZXg7XHJcbiAgICAgICAgdGhpcy5leGVjXygpO1xyXG4gICAgICB9LFxyXG4gICAgICBleGVjXygpIHtcclxuICAgICAgICB2YXIgcm93ID0gZDMuc2VsZWN0KGVkaXRWaWV3Lm5vZGUoKS5pbnNlcnRSb3codGhpcy5yb3dJbmRleCkpO1xyXG4gICAgICAgIHZhciBjb2xzID0gIHJvdy5zZWxlY3RBbGwoJ3RkJykuZGF0YShbdGhpcy5yb3dJbmRleCArIGN1cnJlbnRFdmVudEluZGV4LCdMaW5lTW92ZScsJzAsMCwwJ10pO1xyXG5cclxuICAgICAgICBjZWxsSW5kZXggPSAwO1xyXG4gICAgICAgIGNvbHMuZW50ZXIoKS5hcHBlbmQoJ3RkJylcclxuICAgICAgICAuY2FsbChzZXRJbnB1dClcclxuICAgICAgICAuY2FsbChzZXRCbHVyKVxyXG4gICAgICAgIC5hdHRyKCdkYXRhLXJvdy1pbmRleCcsdGhpcy5yb3dJbmRleCArIGN1cnJlbnRFdmVudEluZGV4KVxyXG4gICAgICAgIC50ZXh0KGQ9PmQpO1xyXG5cclxuICAgICAgICByb3cubm9kZSgpLmNlbGxzW3RoaXMuY2VsbEluZGV4XS5mb2N1cygpO1xyXG4gICAgICAgIHJvdy5hdHRyKCdkYXRhLW5ldycsIHRydWUpO1xyXG4gICAgICAgIC8vbmVlZERyYXcgPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgICByZWRvKCkge1xyXG4gICAgICAgIHRoaXMuZXhlY18oKTtcclxuICAgICAgfSxcclxuICAgICAgdW5kbygpIHtcclxuICAgICAgICBlZGl0Vmlldy5ub2RlKCkuZGVsZXRlUm93KHRoaXMucm93SW5kZXgpO1xyXG4gICAgICAgIHRoaXMucm93LmNlbGxzW3RoaXMuY2VsbEluZGV4XS5mb2N1cygpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcbiAgXHJcbiAgLy8g5paw6KaP5YWl5Yqb6KGM44Gu56K65a6aXHJcbiAgZnVuY3Rpb24gZW5kTmV3SW5wdXQoZG93biA9IHRydWUpIHtcclxuICAgIGQzLnNlbGVjdChlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF0pLmF0dHIoJ2RhdGEtbmV3JywgbnVsbCk7XHJcbiAgICAvLyDnj77lnKjjga7nt6jpm4booYxcclxuICAgIC8vbGV0IGN1clJvdyA9IGVkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XS5jZWxscztcclxuICAgIC8vbGV0IGV2ID0gZDMuc2VsZWN0KGVkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XSkuc2VsZWN0QWxsKCd0ZCcpLmRhdGEoKTtcclxuICAgIGxldCBldiA9IFtlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF0uY2VsbHNbMV0uaW5uZXJUZXh0XVxyXG4gICAgICAuY29uY2F0KEpTT04ucGFyc2UoYFske2VkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XS5jZWxsc1syXS5pbm5lclRleHR9XWApKTtcclxuLy8gICAgZXYgPSBbZXZbMV1dLmNvbmNhdChKU09OLnBhcnNlKGBbJHtldlsyXX1dYCkpOyBcclxuICAgIGV2ID0gZm9ybUVkaXRvci5lbmVteUVkaXRvci5kZXZUb29sLmdhbWUuZW5lbWllcy5jcmVhdGVNb3ZlUGF0dGVybkZyb21BcnJheShldik7XHJcbiAgICBmb3JtRWRpdG9yLnVuZG9NYW5hZ2VyLmV4ZWMoe1xyXG4gICAgICBleGVjKCl7XHJcbiAgICAgICAgdGhpcy5zdGFydEluZGV4ID0gcm93SW5kZXggKyBjdXJyZW50RXZlbnRJbmRleDtcclxuICAgICAgICB0aGlzLmV2ID0gZXY7XHJcbiAgICAgICAgdGhpcy5jb3VudCA9IGV2Lmxlbmd0aDtcclxuICAgICAgICB0aGlzLmVudGVyKCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIGVudGVyKCl7XHJcbiAgICAgICAgZXZlbnRzLnNwbGljZSh0aGlzLnN0YXJ0SW5kZXgsMCx0aGlzLmV2KTtcclxuICAgICAgfSxcclxuICAgICAgcmVkbygpe1xyXG4gICAgICAgIHRoaXMuZW50ZXIoKTtcclxuICAgICAgfSxcclxuICAgICAgdW5kbygpe1xyXG4gICAgICAgIGV2ZW50cy5zcGxpY2UodGhpcy5zdGFydEluZGV4LHRoaXMuY291bnQpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgaWYgKGRvd24pIHtcclxuICAgICAgaWYgKHJvd0luZGV4ID09IChOVU1fUk9XIC0gMSkpIHtcclxuICAgICAgICArK2N1cnJlbnRFdmVudEluZGV4O1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgICsrcm93SW5kZXg7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIOaMv+WFpeW+jOOAgeWGjeaPj+eUu1xyXG4gICAgbmVlZERyYXcgPSB0cnVlO1xyXG4gIH1cclxuICBcclxuICBmdW5jdGlvbiBhZGRSb3coZGVsdGEpXHJcbiAge1xyXG4gICAgcm93SW5kZXggKz0gZGVsdGE7XHJcbiAgICBsZXQgcm93TGVuZ3RoID0gZWRpdFZpZXcubm9kZSgpLnJvd3MubGVuZ3RoO1xyXG4gICAgaWYocm93SW5kZXggPj0gcm93TGVuZ3RoKXtcclxuICAgICAgbGV0IGQgPSByb3dJbmRleCAtIHJvd0xlbmd0aCArIDE7XHJcbiAgICAgIHJvd0luZGV4ID0gcm93TGVuZ3RoIC0gMTtcclxuICAgICAgaWYoKGN1cnJlbnRFdmVudEluZGV4ICsgTlVNX1JPVyAtMSkgPCAoZXZlbnRzLmxlbmd0aCAtIDEpKXtcclxuICAgICAgICBjdXJyZW50RXZlbnRJbmRleCArPSBkO1xyXG4gICAgICAgIGlmKChjdXJyZW50RXZlbnRJbmRleCArIE5VTV9ST1cgLTEpID4gKGV2ZW50cy5sZW5ndGggLSAxKSl7XHJcbiAgICAgICAgICBjdXJyZW50RXZlbnRJbmRleCA9IChldmVudHMubGVuZ3RoIC0gTlVNX1JPVyArIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBuZWVkRHJhdyA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBpZihyb3dJbmRleCA8IDApe1xyXG4gICAgICBsZXQgZCA9IHJvd0luZGV4O1xyXG4gICAgICByb3dJbmRleCA9IDA7XHJcbiAgICAgIGlmKGN1cnJlbnRFdmVudEluZGV4ICE9IDApe1xyXG4gICAgICAgIGN1cnJlbnRFdmVudEluZGV4ICs9IGQ7XHJcbiAgICAgICAgaWYoY3VycmVudEV2ZW50SW5kZXggPCAwKXtcclxuICAgICAgICAgIGN1cnJlbnRFdmVudEluZGV4ID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgbmVlZERyYXcgPSB0cnVlO1xyXG4gICAgICB9IFxyXG4gICAgfVxyXG4gICAgZm9jdXNFdmVudCgpO1xyXG4gIH1cclxuICBcclxuICAvLyDjgqjjg7Pjgr/jg7xcclxuICBmdW5jdGlvbiBkb0VudGVyKCl7XHJcbiAgICAvL2NvbnNvbGUubG9nKCdDUi9MRicpO1xyXG4gICAgLy8g54++5Zyo44Gu6KGM44GM5paw6KaP44GL57eo6ZuG5Lit44GLXHJcbiAgICBsZXQgZmxhZyA9IGQzLnNlbGVjdChlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF0pLmF0dHIoJ2RhdGEtbmV3Jyk7XHJcbiAgICBpZiAoZmxhZykge1xyXG4gICAgICBlbmROZXdJbnB1dCgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy/mlrDopo/nt6jpm4bkuK3jga7ooYzjgafjgarjgZHjgozjgbDjgIHmlrDopo/lhaXlipvnlKjooYzjgpLmjL/lhaVcclxuICAgICAgaW5zZXJ0RXZlbnQocm93SW5kZXgpO1xyXG4gICAgfVxyXG4gICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gIH1cclxuICBcclxuICAvLyDlj7Pnp7vli5VcclxuICBmdW5jdGlvbiBkb1JpZ2h0KCl7XHJcbiAgICBjZWxsSW5kZXgrKztcclxuICAgIGxldCBjdXJSb3cgPSBlZGl0Vmlldy5ub2RlKCkucm93cztcclxuICAgIGlmIChjZWxsSW5kZXggPiAoY3VyUm93W3Jvd0luZGV4XS5jZWxscy5sZW5ndGggLSAxKSkge1xyXG4gICAgICBjZWxsSW5kZXggPSAxO1xyXG4gICAgICBpZiAocm93SW5kZXggPCAoY3VyUm93Lmxlbmd0aCAtIDEpKSB7XHJcbiAgICAgICAgaWYgKGQzLnNlbGVjdChjdXJSb3dbcm93SW5kZXhdKS5hdHRyKCdkYXRhLW5ldycpKSB7XHJcbiAgICAgICAgICBlbmROZXdJbnB1dCgpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBhZGRSb3coMSk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgfVxyXG5cclxuICAvLyDlt6bjgqvjg7zjgr3jg6sgXHJcbiAgZnVuY3Rpb24gZG9MZWZ0KCkge1xyXG4gICAgbGV0IGN1clJvdyA9IGVkaXRWaWV3Lm5vZGUoKS5yb3dzO1xyXG4gICAgLS1jZWxsSW5kZXg7XHJcbiAgICBpZiAoY2VsbEluZGV4IDwgMSkge1xyXG4gICAgICBpZiAocm93SW5kZXggIT0gMCkge1xyXG4gICAgICAgIGlmIChkMy5zZWxlY3QoY3VyUm93W3Jvd0luZGV4XSkuYXR0cignZGF0YS1uZXcnKSkge1xyXG4gICAgICAgICAgZW5kTmV3SW5wdXQoZmFsc2UpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjZWxsSW5kZXggPSBlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF0uY2VsbHMubGVuZ3RoIC0gMTtcclxuICAgICAgICBhZGRSb3coLTEpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjZWxsSW5kZXggPSAxO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgfVxyXG4gIFxyXG4gIC8vIOS4iuenu+WLlVxyXG4gIGZ1bmN0aW9uIGRvVXAoKSB7XHJcbiAgICBsZXQgY3VyUm93ID0gZWRpdFZpZXcubm9kZSgpLnJvd3M7XHJcbiAgICBpZiAoZDMuc2VsZWN0KGN1clJvd1tyb3dJbmRleF0pLmF0dHIoJ2RhdGEtbmV3JykpIHtcclxuICAgICAgZW5kTmV3SW5wdXQoZmFsc2UpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgYWRkUm93KC0xKTtcclxuICAgIH1cclxuICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGRvRG93bigpIHtcclxuICAgIGxldCBjdXJSb3cgPSBlZGl0Vmlldy5ub2RlKCkucm93cztcclxuICAgIGlmIChkMy5zZWxlY3QoY3VyUm93W3Jvd0luZGV4XSkuYXR0cignZGF0YS1uZXcnKSkge1xyXG4gICAgICBlbmROZXdJbnB1dChmYWxzZSk7XHJcbiAgICB9XHJcbiAgICBhZGRSb3coMSk7XHJcbiAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgfVxyXG4gIFxyXG4gIGZ1bmN0aW9uIGRvUGFnZURvd24oKSB7XHJcbiAgICBpZiAoY3VycmVudEV2ZW50SW5kZXggPCAoZXZlbnRzLmxlbmd0aCAtIDEpKSB7XHJcbiAgICAgIGN1cnJlbnRFdmVudEluZGV4ICs9IE5VTV9ST1c7XHJcbiAgICAgIGlmIChjdXJyZW50RXZlbnRJbmRleCA+IChldmVudHMubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgICBjdXJyZW50RXZlbnRJbmRleCAtPSBOVU1fUk9XO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIG5lZWREcmF3ID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICB9XHJcbiAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgfVxyXG4gIFxyXG4gIGZ1bmN0aW9uIGRvUGFnZVVwKCl7XHJcbiAgICBpZiAoY3VycmVudEV2ZW50SW5kZXggPiAwKSB7XHJcbiAgICAgIGN1cnJlbnRFdmVudEluZGV4IC09IE5VTV9ST1c7XHJcbiAgICAgIGlmIChjdXJyZW50RXZlbnRJbmRleCA8IDApIHtcclxuICAgICAgICBjdXJyZW50RXZlbnRJbmRleCA9IDA7XHJcbiAgICAgIH1cclxuICAgICAgbmVlZERyYXcgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZG9TY3JvbGxVcCgpXHJcbiAge1xyXG4gICAgaWYgKGN1cnJlbnRFdmVudEluZGV4ID4gMCkge1xyXG4gICAgICAtLWN1cnJlbnRFdmVudEluZGV4O1xyXG4gICAgICBuZWVkRHJhdyA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBkb1Njcm9sbERvd24oKVxyXG4gIHtcclxuICAgIGlmICgoY3VycmVudEV2ZW50SW5kZXggKyBOVU1fUk9XKSA8PSAoZXZlbnRzLmxlbmd0aCAtIDEpKSB7XHJcbiAgICAgICsrY3VycmVudEV2ZW50SW5kZXg7XHJcbiAgICAgIG5lZWREcmF3ID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGRvSG9tZSgpe1xyXG4gICAgaWYgKGN1cnJlbnRFdmVudEluZGV4ID4gMCkge1xyXG4gICAgICByb3dJbmRleCA9IDA7XHJcbiAgICAgIGN1cnJlbnRFdmVudEluZGV4ID0gMDtcclxuICAgICAgbmVlZERyYXcgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gIH1cclxuICBcclxuICBmdW5jdGlvbiBkb0VuZCgpe1xyXG4gICAgaWYgKGN1cnJlbnRFdmVudEluZGV4ICE9IChldmVudHMubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgcm93SW5kZXggPSAwO1xyXG4gICAgICBjdXJyZW50RXZlbnRJbmRleCA9IGV2ZW50cy5sZW5ndGggLSAxO1xyXG4gICAgICBuZWVkRHJhdyA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBkb0RlbGV0ZSgpIHtcclxuICAgIGlmICgocm93SW5kZXggKyBjdXJyZW50RXZlbnRJbmRleCkgPT0gKGV2ZW50cy5sZW5ndGggLSAxKSkge1xyXG4gICAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGZvcm1FZGl0b3IudW5kb01hbmFnZXIuZXhlYyhcclxuICAgICAge1xyXG4gICAgICAgIGV4ZWMoKSB7XHJcbiAgICAgICAgICB0aGlzLnJvd0luZGV4ID0gcm93SW5kZXg7XHJcbiAgICAgICAgICB0aGlzLmN1cnJlbnRFdmVudEluZGV4ID0gY3VycmVudEV2ZW50SW5kZXg7XHJcbiAgICAgICAgICB0aGlzLmV2ZW50ID0gZXZlbnRzW3RoaXMucm93SW5kZXhdO1xyXG4gICAgICAgICAgdGhpcy5yb3dEYXRhID0gZXZlbnRzW3RoaXMuY3VycmVudEV2ZW50SW5kZXggKyB0aGlzLnJvd0luZGV4XTtcclxuICAgICAgICAgIGVkaXRWaWV3Lm5vZGUoKS5kZWxldGVSb3codGhpcy5yb3dJbmRleCk7XHJcbiAgICAgICAgICB0aGlzLmxpbmVCdWZmZXIgPSBmb3JtRWRpdG9yLmxpbmVCdWZmZXI7XHJcbiAgICAgICAgICBmb3JtRWRpdG9yLmxpbmVCdWZmZXIgPSBbdGhpcy5ldmVudF07XHJcbiAgICAgICAgICBldmVudHMuc3BsaWNlKHRoaXMuY3VycmVudEV2ZW50SW5kZXggKyB0aGlzLnJvd0luZGV4LDEpO1xyXG4gICAgICAgICAgbmVlZERyYXcgPSB0cnVlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVkbygpIHtcclxuICAgICAgICAgIGVkaXRWaWV3Lm5vZGUoKS5kZWxldGVSb3codGhpcy5yb3dJbmRleCk7XHJcbiAgICAgICAgICBldmVudHMuc3BsaWNlKHRoaXMuY3VycmVudEV2ZW50SW5kZXggKyB0aGlzLnJvd0luZGV4LDEpO1xyXG4gICAgICAgICAgbmVlZERyYXcgPSB0cnVlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdW5kbygpIHtcclxuICAgICAgICAgIGZvcm1FZGl0b3IubGluZUJ1ZmZlciA9IHRoaXMubGluZUJ1ZmZlcjtcclxuICAgICAgICAgIGV2ZW50cy5zcGxpY2UodGhpcy5jdXJyZW50RXZlbnRJbmRleCArIHRoaXMucm93SW5kZXgsMCx0aGlzLmV2ZW50KTtcclxuICAgICAgICAgIG5lZWREcmF3ID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgfVxyXG4gIFxyXG4gIGZ1bmN0aW9uIGRvTGluZVBhc3RlKClcclxuICB7XHJcbiAgICBwYXN0ZUV2ZW50KCk7XHJcbiAgfVxyXG4gIFxyXG4gIGZ1bmN0aW9uIGRvUmVkbygpe1xyXG4gICAgZm9ybUVkaXRvci51bmRvTWFuYWdlci5yZWRvKCk7XHJcbiAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBkb1VuZG8oKXtcclxuICAgIGZvcm1FZGl0b3IudW5kb01hbmFnZXIudW5kbygpO1xyXG4gICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gIH1cclxuICAvLyBjdXRFdmVudOOBrue3qOmbhuOBi+OCiVxyXG4gIC8vIOOCpOODmeODs+ODiOOBruOCq+ODg+ODiFxyXG4gIGZ1bmN0aW9uIGN1dEV2ZW50KClcclxuICB7XHJcbiAgICBmb3JtRWRpdG9yLnVuZG9NYW5hZ2VyLmV4ZWMoXHJcbiAgICB7XHJcbiAgICAgIGV4ZWMoKXtcclxuICAgICAgICB0aGlzLnNlbGVjdFN0YXJ0SW5kZXggPSBzZWxlY3RTdGFydEluZGV4O1xyXG4gICAgICAgIHRoaXMuc2VsZWN0RW5kSW5kZXggPSBzZWxlY3RFbmRJbmRleDtcclxuICAgICAgICB0aGlzLmN1dCgpO1xyXG4gICAgICB9LFxyXG4gICAgICBjdXQoKXtcclxuICAgICAgICB0aGlzLmxpbmVCdWZmZXIgPSBmb3JtRWRpdG9yLmxpbmVCdWZmZXI7XHJcbiAgICAgICAgZm9ybUVkaXRvci5saW5lQnVmZmVyID0gXHJcbiAgICAgICAgZm9ybUVkaXRvci5saW5lQnVmZmVyLnNwbGljZSh0aGlzLnNlbGVjdFN0YXJ0SW5kZXgsIHRoaXMuc2VsZWN0RW5kSW5kZXggKyAxIC0gdGhpcy5zZWxlY3RTdGFydEluZGV4ICk7XHJcbiAgICAgICAgcm93SW5kZXggPSB0aGlzLnNlbGVjdFN0YXJ0SW5kZXggLSBjdXJyZW50RXZlbnRJbmRleDtcclxuICAgICAgICBuZWVkRHJhdyA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICAgIHJlZG8oKVxyXG4gICAgICB7XHJcbiAgICAgICAgdGhpcy5jdXQoKTsgICAgICAgIFxyXG4gICAgICB9LFxyXG4gICAgICB1bmRvKCl7XHJcbiAgICAgICBmb3JtRWRpdG9yLmxpbmVCdWZmZXIuZm9yRWFjaCgoZCxpKT0+e1xyXG4gICAgICAgICBldmVudHMuc3BsaWNlKHRoaXMuc2VsZWN0U3RhcnRJbmRleCArIGksMCxkKTtcclxuICAgICAgIH0pO1xyXG4gICAgICAgZm9ybUVkaXRvci5saW5lQnVmZmVyID0gdGhpcy5saW5lQnVmZmVyO1xyXG4gICAgICAgbmVlZERyYXcgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICB9IFxyXG4gIFxyXG4gIC8vIOOCpOODmeODs+ODiOOBruOCs+ODlOODvFxyXG4gIGZ1bmN0aW9uIGNvcHlFdmVudCgpXHJcbiAge1xyXG4gICAgZm9ybUVkaXRvci51bmRvTWFuYWdlci5leGVjKFxyXG4gICAge1xyXG4gICAgICBleGVjKCl7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RTdGFydEluZGV4ID0gc2VsZWN0U3RhcnRJbmRleDtcclxuICAgICAgICB0aGlzLnNlbGVjdEVuZEluZGV4ID0gc2VsZWN0RW5kSW5kZXg7XHJcbiAgICAgICAgdGhpcy5jb3B5KCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIGNvcHkoKXtcclxuICAgICAgICB0aGlzLmxpbmVCdWZmZXIgPSBmb3JtRWRpdG9yLmxpbmVCdWZmZXI7XHJcbiAgICAgICAgZm9ybUVkaXRvci5saW5lQnVmZmVyID0gW107XHJcbiAgICAgICAgZm9yKGxldCBpID0gdGhpcy5zZWxlY3RTdGFydEluZGV4LGUgPSB0aGlzLnNlbGVjdEVuZEluZGV4ICsgMTtpPCBlOysraSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICBmb3JtRWRpdG9yLmxpbmVCdWZmZXIucHVzaChldmVudHNbaV0uY29uY2F0KCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBuZWVkRHJhdyA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICAgIHJlZG8oKVxyXG4gICAgICB7XHJcbiAgICAgICAgdGhpcy5jb3B5KCk7ICAgICAgICBcclxuICAgICAgfSxcclxuICAgICAgdW5kbygpe1xyXG4gICAgICAgZm9ybUVkaXRvci5saW5lQnVmZmVyID0gdGhpcy5saW5lQnVmZmVyO1xyXG4gICAgICAgbmVlZERyYXcgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICB9XHJcbiAgXHJcbiAgLy8g44Kk44OZ44Oz44OI44Gu44Oa44O844K544OIXHJcbiAgZnVuY3Rpb24gcGFzdGVFdmVudCgpe1xyXG4gICAgaWYoZm9ybUVkaXRvci5saW5lQnVmZmVyKXtcclxuICAgIGZvcm1FZGl0b3IudW5kb01hbmFnZXIuZXhlYyhcclxuICAgIHtcclxuICAgICAgZXhlYygpe1xyXG4gICAgICAgIHRoaXMuc3RhcnRJbmRleCA9IHJvd0luZGV4ICsgY3VycmVudEV2ZW50SW5kZXg7XHJcbiAgICAgICAgdGhpcy5jb3VudCA9IGZvcm1FZGl0b3IubGluZUJ1ZmZlci5sZW5ndGg7XHJcbiAgICAgICAgdGhpcy5wYXN0ZSgpO1xyXG4gICAgICB9LFxyXG4gICAgICBwYXN0ZSgpe1xyXG4gICAgICAgIGZvcihsZXQgaSA9IHRoaXMuY291bnQgLSAxLGUgPSAwO2kgPj0gZTstLWkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZXZlbnRzLnNwbGljZSh0aGlzLnN0YXJ0SW5kZXgsMCxmb3JtRWRpdG9yLmxpbmVCdWZmZXJbaV0uY29uY2F0KCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgcmVkbygpe1xyXG4gICAgICAgIHRoaXMucGFzdGUoKTtcclxuICAgICAgfSxcclxuICAgICAgdW5kbygpe1xyXG4gICAgICAgIGV2ZW50cy5zcGxpY2UodGhpcy5zdGFydEluZGV4LHRoaXMuY291bnQpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIG5lZWREcmF3ID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICB9XHJcbiAgXHJcbiAgZnVuY3Rpb24gKmRvU2VsZWN0KClcclxuICB7XHJcbiAgICBsZXQgaW5wdXQ7XHJcbiAgICBsZXQgaW5kZXhCYWNrdXAgPSByb3dJbmRleCArIGN1cnJlbnRFdmVudEluZGV4O1xyXG4gICAgc2VsZWN0U3RhcnRJbmRleCA9IHJvd0luZGV4ICsgY3VycmVudEV2ZW50SW5kZXg7XHJcbiAgICBzZWxlY3RFbmRJbmRleCA9IHNlbGVjdFN0YXJ0SW5kZXg7XHJcbiAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICBkcmF3RXZlbnQoKTtcclxuICAgIGZvY3VzRXZlbnQoKTtcclxuICAgIGxldCBleGl0TG9vcCA9IGZhbHNlO1xyXG4gICAgd2hpbGUoIWV4aXRMb29wKVxyXG4gICAge1xyXG4gICAgICBpbnB1dCA9IHlpZWxkIGNhbmNlbEV2ZW50O1xyXG4gICAgICBcclxuICAgICAgc3dpdGNoKGlucHV0LmlucHV0Q29tbWFuZC5pZCl7XHJcbiAgICAgICAgY2FzZSBJbnB1dENvbW1hbmRzLnNlbGVjdC5pZDpcclxuICAgICAgICAgIGV4aXRMb29wID0gdHJ1ZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kcy5jdXRFdmVudC5pZDpcclxuICAgICAgICAgIGN1dEV2ZW50KCk7XHJcbiAgICAgICAgICBleGl0TG9vcCA9IHRydWU7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZHMuY29weUV2ZW50LmlkOlxyXG4gICAgICAgICAgY29weUV2ZW50KCk7XHJcbiAgICAgICAgICBleGl0TG9vcCA9IHRydWU7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgbGV0IGZuID0gZWRpdEZ1bmNzW2lucHV0LmlucHV0Q29tbWFuZC5pZF07XHJcbiAgICAgICAgICBpZihmbil7XHJcbiAgICAgICAgICAgIGZuKGlucHV0KTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgY2FuY2VsRXZlbnQgPSBmYWxzZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIC8vIOmBuOaKnuevhOWbsuOBruioiOeul1xyXG4gICAgICAgICAgaWYoaW5kZXhCYWNrdXAgIT0gKHJvd0luZGV4ICsgY3VycmVudEV2ZW50SW5kZXgpKVxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBsZXQgZGVsdGEgPSByb3dJbmRleCArIGN1cnJlbnRFdmVudEluZGV4IC0gaW5kZXhCYWNrdXA7XHJcbiAgICAgICAgICAgIGxldCBpbmRleE5leHQgPSByb3dJbmRleCArIGN1cnJlbnRFdmVudEluZGV4OyAgICAgICAgIFxyXG4gICAgICAgICAgICBpZihkZWx0YSA8IDApe1xyXG4gICAgICAgICAgICAgIGlmKHNlbGVjdFN0YXJ0SW5kZXggPiBpbmRleE5leHQpe1xyXG4gICAgICAgICAgICAgICAgc2VsZWN0U3RhcnRJbmRleCA9IGluZGV4TmV4dDtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2VsZWN0RW5kSW5kZXggPSBpbmRleE5leHQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGlmKHNlbGVjdEVuZEluZGV4IDwgaW5kZXhOZXh0KXtcclxuICAgICAgICAgICAgICAgIHNlbGVjdEVuZEluZGV4ID0gaW5kZXhOZXh0O1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZWxlY3RTdGFydEluZGV4ID0gaW5kZXhOZXh0O1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpbmRleEJhY2t1cCA9IHJvd0luZGV4ICsgY3VycmVudEV2ZW50SW5kZXg7XHJcbiAgICAgICAgICAgIG5lZWREcmF3ID0gdHJ1ZTtcclxuICAgICAgICAgICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgfSAgICAgICAgXHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgaWYobmVlZERyYXcpe1xyXG4gICAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgICAgIGZvY3VzRXZlbnQoKTtcclxuICAgICAgICBuZWVkRHJhdyA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8g5b6M5aeL5pyrXHJcbiAgICBzZWxlY3RTdGFydEluZGV4ID0gbnVsbDtcclxuICAgIHNlbGVjdEVuZEluZGV4ID0gbnVsbDtcclxuICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICAgIGRyYXdFdmVudCgpO1xyXG4gICAgZm9jdXNFdmVudCgpO1xyXG4gICAgbmVlZERyYXcgPSBmYWxzZTtcclxuICB9XHJcbiAgXHJcbiAgdmFyIGVkaXRGdW5jcyA9IHtcclxuICAgIFtJbnB1dENvbW1hbmRzLmVudGVyLmlkXTpkb0VudGVyLFxyXG4gICAgW0lucHV0Q29tbWFuZHMucmlnaHQuaWRdOmRvUmlnaHQsXHJcbiAgICBbSW5wdXRDb21tYW5kcy5sZWZ0LmlkXTpkb0xlZnQsXHJcbiAgICBbSW5wdXRDb21tYW5kcy51cC5pZF06ZG9VcCxcclxuICAgIFtJbnB1dENvbW1hbmRzLmRvd24uaWRdOmRvRG93bixcclxuICAgIFtJbnB1dENvbW1hbmRzLnBhZ2VEb3duLmlkXTpkb1BhZ2VEb3duLFxyXG4gICAgW0lucHV0Q29tbWFuZHMucGFnZVVwLmlkXTpkb1BhZ2VVcCxcclxuICAgIFtJbnB1dENvbW1hbmRzLnNjcm9sbFVwLmlkXTpkb1Njcm9sbFVwLFxyXG4gICAgW0lucHV0Q29tbWFuZHMuc2Nyb2xsRG93bi5pZF06ZG9TY3JvbGxEb3duLFxyXG4gICAgW0lucHV0Q29tbWFuZHMuaG9tZS5pZF06ZG9Ib21lLFxyXG4gICAgW0lucHV0Q29tbWFuZHMuZW5kLmlkXTpkb0VuZCxcclxuICAgIFtJbnB1dENvbW1hbmRzLmRlbGV0ZS5pZF06ZG9EZWxldGUsXHJcbiAgICBbSW5wdXRDb21tYW5kcy5saW5lUGFzdGUuaWRdOmRvTGluZVBhc3RlLFxyXG4gICAgW0lucHV0Q29tbWFuZHMucmVkby5pZF06ZG9SZWRvLFxyXG4gICAgW0lucHV0Q29tbWFuZHMudW5kby5pZF06ZG9VbmRvLFxyXG4gICAgW0lucHV0Q29tbWFuZHMucGFzdGVFdmVudC5pZF06cGFzdGVFdmVudFxyXG4gIH07XHJcbiAgXHJcbiAgZHJhd0V2ZW50KCk7XHJcbiAgd2hpbGUgKHRydWUpIHtcclxuLy8gICAgY29uc29sZS5sb2coJ25ldyBsaW5lJywgcm93SW5kZXgsIGV2ZW50cy5sZW5ndGgpO1xyXG4gICAgaWYgKGV2ZW50cy5sZW5ndGggPT0gMCB8fCByb3dJbmRleCA+IChldmVudHMubGVuZ3RoIC0gMSkpIHtcclxuICAgIH1cclxuICAgIGtleWxvb3A6XHJcbiAgICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgICBsZXQgaW5wdXQgPSB5aWVsZCBjYW5jZWxFdmVudDtcclxuICAgICAgaWYoaW5wdXQuaW5wdXRDb21tYW5kLmlkID09PSBJbnB1dENvbW1hbmRzLnNlbGVjdC5pZClcclxuICAgICAge1xyXG4gICAgICAgIHlpZWxkKiBkb1NlbGVjdCgpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxldCBmbiA9IGVkaXRGdW5jc1tpbnB1dC5pbnB1dENvbW1hbmQuaWRdO1xyXG4gICAgICAgIGlmIChmbikge1xyXG4gICAgICAgICAgZm4oaW5wdXQpO1xyXG4gICAgICAgICAgaWYgKG5lZWREcmF3KSB7XHJcbiAgICAgICAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgICAgICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICAgICAgICAgIG5lZWREcmF3ID0gZmFsc2U7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGNhbmNlbEV2ZW50ID0gZmFsc2U7XHJcbiAvLyAgICAgICAgIGNvbnNvbGUubG9nKCdkZWZhdWx0Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICcuLi8uLi9qcy9FdmVudEVtaXR0ZXIzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBVbmRvTWFuYWdlciBleHRlbmRzIEV2ZW50RW1pdHRlciB7XHJcblx0Y29uc3RydWN0b3IoKXtcclxuXHRcdHN1cGVyKCk7XHJcblx0XHR0aGlzLmJ1ZmZlciA9IFtdO1xyXG5cdFx0dGhpcy5pbmRleCA9IC0xO1xyXG5cdH1cclxuXHRcclxuXHRjbGVhcigpe1xyXG4gICAgdGhpcy5idWZmZXIubGVuZ3RoID0gMDtcclxuICAgIHRoaXMuaW5kZXggPSAtMTtcclxuICAgIHRoaXMuZW1pdCgnY2xlYXJlZCcpO1xyXG5cdH1cclxuXHRcclxuXHRleGVjKGNvbW1hbmQpe1xyXG4gICAgY29tbWFuZC5leGVjKCk7XHJcbiAgICBpZiAoKHRoaXMuaW5kZXggKyAxKSA8IHRoaXMuYnVmZmVyLmxlbmd0aClcclxuICAgIHtcclxuICAgICAgdGhpcy5idWZmZXIubGVuZ3RoID0gdGhpcy5pbmRleCArIDE7XHJcbiAgICB9XHJcbiAgICB0aGlzLmJ1ZmZlci5wdXNoKGNvbW1hbmQpO1xyXG4gICAgKyt0aGlzLmluZGV4O1xyXG4gICAgdGhpcy5lbWl0KCdleGVjdXRlZCcpO1xyXG5cdH1cclxuXHRcclxuXHRyZWRvKCl7XHJcbiAgICBpZiAoKHRoaXMuaW5kZXggKyAxKSA8ICh0aGlzLmJ1ZmZlci5sZW5ndGgpKVxyXG4gICAge1xyXG4gICAgICArK3RoaXMuaW5kZXg7XHJcbiAgICAgIHZhciBjb21tYW5kID0gdGhpcy5idWZmZXJbdGhpcy5pbmRleF07XHJcbiAgICAgIGNvbW1hbmQucmVkbygpO1xyXG4gICAgICB0aGlzLmVtaXQoJ3JlZGlkJyk7XHJcbiAgICAgIGlmICgodGhpcy5pbmRleCAgKyAxKSA9PSB0aGlzLmJ1ZmZlci5sZW5ndGgpXHJcbiAgICAgIHtcclxuICAgICAgICB0aGlzLmVtaXQoJ3JlZG9FbXB0eScpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblx0fVxyXG4gIHVuZG8oKVxyXG4gIHtcclxuICAgIGlmICh0aGlzLmJ1ZmZlci5sZW5ndGggPiAwICYmIHRoaXMuaW5kZXggPj0gMClcclxuICAgIHtcclxuICAgICAgdmFyIGNvbW1hbmQgPSB0aGlzLmJ1ZmZlclt0aGlzLmluZGV4XTtcclxuICAgICAgY29tbWFuZC51bmRvKCk7XHJcbiAgICAgIC0tdGhpcy5pbmRleDtcclxuICAgICAgdGhpcy5lbWl0KCd1bmRpZCcpO1xyXG4gICAgICBpZiAodGhpcy5pbmRleCA8IDApXHJcbiAgICAgIHtcclxuICAgICAgICB0aGlzLmluZGV4ID0gLTE7XHJcbiAgICAgICAgdGhpcy5lbWl0KCd1bmRvRW1wdHknKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHRcclxufVxyXG5cclxudmFyIHVuZG9NYW5hZ2VyID0gbmV3IFVuZG9NYW5hZ2VyKCk7XHJcbmV4cG9ydCBkZWZhdWx0IHVuZG9NYW5hZ2VyOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbi8vXHJcbi8vIFdlIHN0b3JlIG91ciBFRSBvYmplY3RzIGluIGEgcGxhaW4gb2JqZWN0IHdob3NlIHByb3BlcnRpZXMgYXJlIGV2ZW50IG5hbWVzLlxyXG4vLyBJZiBgT2JqZWN0LmNyZWF0ZShudWxsKWAgaXMgbm90IHN1cHBvcnRlZCB3ZSBwcmVmaXggdGhlIGV2ZW50IG5hbWVzIHdpdGggYVxyXG4vLyBgfmAgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIGJ1aWx0LWluIG9iamVjdCBwcm9wZXJ0aWVzIGFyZSBub3Qgb3ZlcnJpZGRlbiBvclxyXG4vLyB1c2VkIGFzIGFuIGF0dGFjayB2ZWN0b3IuXHJcbi8vIFdlIGFsc28gYXNzdW1lIHRoYXQgYE9iamVjdC5jcmVhdGUobnVsbClgIGlzIGF2YWlsYWJsZSB3aGVuIHRoZSBldmVudCBuYW1lXHJcbi8vIGlzIGFuIEVTNiBTeW1ib2wuXHJcbi8vXHJcbnZhciBwcmVmaXggPSB0eXBlb2YgT2JqZWN0LmNyZWF0ZSAhPT0gJ2Z1bmN0aW9uJyA/ICd+JyA6IGZhbHNlO1xyXG5cclxuLyoqXHJcbiAqIFJlcHJlc2VudGF0aW9uIG9mIGEgc2luZ2xlIEV2ZW50RW1pdHRlciBmdW5jdGlvbi5cclxuICpcclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gRXZlbnQgaGFuZGxlciB0byBiZSBjYWxsZWQuXHJcbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgQ29udGV4dCBmb3IgZnVuY3Rpb24gZXhlY3V0aW9uLlxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG9uY2UgT25seSBlbWl0IG9uY2VcclxuICogQGFwaSBwcml2YXRlXHJcbiAqL1xyXG5mdW5jdGlvbiBFRShmbiwgY29udGV4dCwgb25jZSkge1xyXG4gIHRoaXMuZm4gPSBmbjtcclxuICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xyXG4gIHRoaXMub25jZSA9IG9uY2UgfHwgZmFsc2U7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBNaW5pbWFsIEV2ZW50RW1pdHRlciBpbnRlcmZhY2UgdGhhdCBpcyBtb2xkZWQgYWdhaW5zdCB0aGUgTm9kZS5qc1xyXG4gKiBFdmVudEVtaXR0ZXIgaW50ZXJmYWNlLlxyXG4gKlxyXG4gKiBAY29uc3RydWN0b3JcclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHsgLyogTm90aGluZyB0byBzZXQgKi8gfVxyXG5cclxuLyoqXHJcbiAqIEhvbGRzIHRoZSBhc3NpZ25lZCBFdmVudEVtaXR0ZXJzIGJ5IG5hbWUuXHJcbiAqXHJcbiAqIEB0eXBlIHtPYmplY3R9XHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XHJcblxyXG4vKipcclxuICogUmV0dXJuIGEgbGlzdCBvZiBhc3NpZ25lZCBldmVudCBsaXN0ZW5lcnMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnRzIHRoYXQgc2hvdWxkIGJlIGxpc3RlZC5cclxuICogQHBhcmFtIHtCb29sZWFufSBleGlzdHMgV2Ugb25seSBuZWVkIHRvIGtub3cgaWYgdGhlcmUgYXJlIGxpc3RlbmVycy5cclxuICogQHJldHVybnMge0FycmF5fEJvb2xlYW59XHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uIGxpc3RlbmVycyhldmVudCwgZXhpc3RzKSB7XHJcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnRcclxuICAgICwgYXZhaWxhYmxlID0gdGhpcy5fZXZlbnRzICYmIHRoaXMuX2V2ZW50c1tldnRdO1xyXG5cclxuICBpZiAoZXhpc3RzKSByZXR1cm4gISFhdmFpbGFibGU7XHJcbiAgaWYgKCFhdmFpbGFibGUpIHJldHVybiBbXTtcclxuICBpZiAoYXZhaWxhYmxlLmZuKSByZXR1cm4gW2F2YWlsYWJsZS5mbl07XHJcblxyXG4gIGZvciAodmFyIGkgPSAwLCBsID0gYXZhaWxhYmxlLmxlbmd0aCwgZWUgPSBuZXcgQXJyYXkobCk7IGkgPCBsOyBpKyspIHtcclxuICAgIGVlW2ldID0gYXZhaWxhYmxlW2ldLmZuO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGVlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEVtaXQgYW4gZXZlbnQgdG8gYWxsIHJlZ2lzdGVyZWQgZXZlbnQgbGlzdGVuZXJzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIG5hbWUgb2YgdGhlIGV2ZW50LlxyXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gSW5kaWNhdGlvbiBpZiB3ZSd2ZSBlbWl0dGVkIGFuIGV2ZW50LlxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gZW1pdChldmVudCwgYTEsIGEyLCBhMywgYTQsIGE1KSB7XHJcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XHJcblxyXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbZXZ0XSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW2V2dF1cclxuICAgICwgbGVuID0gYXJndW1lbnRzLmxlbmd0aFxyXG4gICAgLCBhcmdzXHJcbiAgICAsIGk7XHJcblxyXG4gIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgbGlzdGVuZXJzLmZuKSB7XHJcbiAgICBpZiAobGlzdGVuZXJzLm9uY2UpIHRoaXMucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVycy5mbiwgdW5kZWZpbmVkLCB0cnVlKTtcclxuXHJcbiAgICBzd2l0Y2ggKGxlbikge1xyXG4gICAgICBjYXNlIDE6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCksIHRydWU7XHJcbiAgICAgIGNhc2UgMjogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSksIHRydWU7XHJcbiAgICAgIGNhc2UgMzogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIpLCB0cnVlO1xyXG4gICAgICBjYXNlIDQ6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMyksIHRydWU7XHJcbiAgICAgIGNhc2UgNTogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzLCBhNCksIHRydWU7XHJcbiAgICAgIGNhc2UgNjogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzLCBhNCwgYTUpLCB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGZvciAoaSA9IDEsIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0xKTsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xyXG4gICAgfVxyXG5cclxuICAgIGxpc3RlbmVycy5mbi5hcHBseShsaXN0ZW5lcnMuY29udGV4dCwgYXJncyk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHZhciBsZW5ndGggPSBsaXN0ZW5lcnMubGVuZ3RoXHJcbiAgICAgICwgajtcclxuXHJcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgaWYgKGxpc3RlbmVyc1tpXS5vbmNlKSB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcnNbaV0uZm4sIHVuZGVmaW5lZCwgdHJ1ZSk7XHJcblxyXG4gICAgICBzd2l0Y2ggKGxlbikge1xyXG4gICAgICAgIGNhc2UgMTogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQpOyBicmVhaztcclxuICAgICAgICBjYXNlIDI6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhMSk7IGJyZWFrO1xyXG4gICAgICAgIGNhc2UgMzogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGExLCBhMik7IGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICBpZiAoIWFyZ3MpIGZvciAoaiA9IDEsIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0xKTsgaiA8IGxlbjsgaisrKSB7XHJcbiAgICAgICAgICAgIGFyZ3NbaiAtIDFdID0gYXJndW1lbnRzW2pdO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGxpc3RlbmVyc1tpXS5mbi5hcHBseShsaXN0ZW5lcnNbaV0uY29udGV4dCwgYXJncyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlZ2lzdGVyIGEgbmV3IEV2ZW50TGlzdGVuZXIgZm9yIHRoZSBnaXZlbiBldmVudC5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IE5hbWUgb2YgdGhlIGV2ZW50LlxyXG4gKiBAcGFyYW0ge0Z1bmN0b259IGZuIENhbGxiYWNrIGZ1bmN0aW9uLlxyXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IFRoZSBjb250ZXh0IG9mIHRoZSBmdW5jdGlvbi5cclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBmdW5jdGlvbiBvbihldmVudCwgZm4sIGNvbnRleHQpIHtcclxuICB2YXIgbGlzdGVuZXIgPSBuZXcgRUUoZm4sIGNvbnRleHQgfHwgdGhpcylcclxuICAgICwgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcclxuXHJcbiAgaWYgKCF0aGlzLl9ldmVudHMpIHRoaXMuX2V2ZW50cyA9IHByZWZpeCA/IHt9IDogT2JqZWN0LmNyZWF0ZShudWxsKTtcclxuICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdKSB0aGlzLl9ldmVudHNbZXZ0XSA9IGxpc3RlbmVyO1xyXG4gIGVsc2Uge1xyXG4gICAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XS5mbikgdGhpcy5fZXZlbnRzW2V2dF0ucHVzaChsaXN0ZW5lcik7XHJcbiAgICBlbHNlIHRoaXMuX2V2ZW50c1tldnRdID0gW1xyXG4gICAgICB0aGlzLl9ldmVudHNbZXZ0XSwgbGlzdGVuZXJcclxuICAgIF07XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBBZGQgYW4gRXZlbnRMaXN0ZW5lciB0aGF0J3Mgb25seSBjYWxsZWQgb25jZS5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IE5hbWUgb2YgdGhlIGV2ZW50LlxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBDYWxsYmFjayBmdW5jdGlvbi5cclxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBUaGUgY29udGV4dCBvZiB0aGUgZnVuY3Rpb24uXHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbiBvbmNlKGV2ZW50LCBmbiwgY29udGV4dCkge1xyXG4gIHZhciBsaXN0ZW5lciA9IG5ldyBFRShmbiwgY29udGV4dCB8fCB0aGlzLCB0cnVlKVxyXG4gICAgLCBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xyXG5cclxuICBpZiAoIXRoaXMuX2V2ZW50cykgdGhpcy5fZXZlbnRzID0gcHJlZml4ID8ge30gOiBPYmplY3QuY3JlYXRlKG51bGwpO1xyXG4gIGlmICghdGhpcy5fZXZlbnRzW2V2dF0pIHRoaXMuX2V2ZW50c1tldnRdID0gbGlzdGVuZXI7XHJcbiAgZWxzZSB7XHJcbiAgICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdLmZuKSB0aGlzLl9ldmVudHNbZXZ0XS5wdXNoKGxpc3RlbmVyKTtcclxuICAgIGVsc2UgdGhpcy5fZXZlbnRzW2V2dF0gPSBbXHJcbiAgICAgIHRoaXMuX2V2ZW50c1tldnRdLCBsaXN0ZW5lclxyXG4gICAgXTtcclxuICB9XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlbW92ZSBldmVudCBsaXN0ZW5lcnMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgd2Ugd2FudCB0byByZW1vdmUuXHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBsaXN0ZW5lciB0aGF0IHdlIG5lZWQgdG8gZmluZC5cclxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBPbmx5IHJlbW92ZSBsaXN0ZW5lcnMgbWF0Y2hpbmcgdGhpcyBjb250ZXh0LlxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG9uY2UgT25seSByZW1vdmUgb25jZSBsaXN0ZW5lcnMuXHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5cclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKGV2ZW50LCBmbiwgY29udGV4dCwgb25jZSkge1xyXG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xyXG5cclxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW2V2dF0pIHJldHVybiB0aGlzO1xyXG5cclxuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW2V2dF1cclxuICAgICwgZXZlbnRzID0gW107XHJcblxyXG4gIGlmIChmbikge1xyXG4gICAgaWYgKGxpc3RlbmVycy5mbikge1xyXG4gICAgICBpZiAoXHJcbiAgICAgICAgICAgbGlzdGVuZXJzLmZuICE9PSBmblxyXG4gICAgICAgIHx8IChvbmNlICYmICFsaXN0ZW5lcnMub25jZSlcclxuICAgICAgICB8fCAoY29udGV4dCAmJiBsaXN0ZW5lcnMuY29udGV4dCAhPT0gY29udGV4dClcclxuICAgICAgKSB7XHJcbiAgICAgICAgZXZlbnRzLnB1c2gobGlzdGVuZXJzKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGxpc3RlbmVycy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGlmIChcclxuICAgICAgICAgICAgIGxpc3RlbmVyc1tpXS5mbiAhPT0gZm5cclxuICAgICAgICAgIHx8IChvbmNlICYmICFsaXN0ZW5lcnNbaV0ub25jZSlcclxuICAgICAgICAgIHx8IChjb250ZXh0ICYmIGxpc3RlbmVyc1tpXS5jb250ZXh0ICE9PSBjb250ZXh0KVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgZXZlbnRzLnB1c2gobGlzdGVuZXJzW2ldKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vXHJcbiAgLy8gUmVzZXQgdGhlIGFycmF5LCBvciByZW1vdmUgaXQgY29tcGxldGVseSBpZiB3ZSBoYXZlIG5vIG1vcmUgbGlzdGVuZXJzLlxyXG4gIC8vXHJcbiAgaWYgKGV2ZW50cy5sZW5ndGgpIHtcclxuICAgIHRoaXMuX2V2ZW50c1tldnRdID0gZXZlbnRzLmxlbmd0aCA9PT0gMSA/IGV2ZW50c1swXSA6IGV2ZW50cztcclxuICB9IGVsc2Uge1xyXG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1tldnRdO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogUmVtb3ZlIGFsbCBsaXN0ZW5lcnMgb3Igb25seSB0aGUgbGlzdGVuZXJzIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50LlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IHdhbnQgdG8gcmVtb3ZlIGFsbCBsaXN0ZW5lcnMgZm9yLlxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbiByZW1vdmVBbGxMaXN0ZW5lcnMoZXZlbnQpIHtcclxuICBpZiAoIXRoaXMuX2V2ZW50cykgcmV0dXJuIHRoaXM7XHJcblxyXG4gIGlmIChldmVudCkgZGVsZXRlIHRoaXMuX2V2ZW50c1twcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50XTtcclxuICBlbHNlIHRoaXMuX2V2ZW50cyA9IHByZWZpeCA/IHt9IDogT2JqZWN0LmNyZWF0ZShudWxsKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vL1xyXG4vLyBBbGlhcyBtZXRob2RzIG5hbWVzIGJlY2F1c2UgcGVvcGxlIHJvbGwgbGlrZSB0aGF0LlxyXG4vL1xyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9mZiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXI7XHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uO1xyXG5cclxuLy9cclxuLy8gVGhpcyBmdW5jdGlvbiBkb2Vzbid0IGFwcGx5IGFueW1vcmUuXHJcbi8vXHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24gc2V0TWF4TGlzdGVuZXJzKCkge1xyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLy9cclxuLy8gRXhwb3NlIHRoZSBwcmVmaXguXHJcbi8vXHJcbkV2ZW50RW1pdHRlci5wcmVmaXhlZCA9IHByZWZpeDtcclxuXHJcbi8vXHJcbi8vIEV4cG9zZSB0aGUgbW9kdWxlLlxyXG4vL1xyXG5pZiAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiBtb2R1bGUpIHtcclxuICBtb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcclxufVxyXG5cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cImdyYXBoaWNzLmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cImlvLmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInNvbmcuanNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwidGV4dC5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJ1dGlsLmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cImRzcC5qc1wiIC8+XHJcblwidXNlIHN0cmljdFwiO1xyXG4vLy8vIFdlYiBBdWRpbyBBUEkg44Op44OD44OR44O844Kv44Op44K5IC8vLy9cclxudmFyIGZmdCA9IG5ldyBGRlQoNDA5NiwgNDQxMDApO1xyXG52YXIgQlVGRkVSX1NJWkUgPSAxMDI0O1xyXG52YXIgVElNRV9CQVNFID0gOTY7XHJcblxyXG52YXIgbm90ZUZyZXEgPSBbXTtcclxuZm9yICh2YXIgaSA9IC04MTsgaSA8IDQ2OyArK2kpIHtcclxuICBub3RlRnJlcS5wdXNoKE1hdGgucG93KDIsIGkgLyAxMikpO1xyXG59XHJcblxyXG52YXIgU3F1YXJlV2F2ZSA9IHtcclxuICBiaXRzOiA0LFxyXG4gIHdhdmVkYXRhOiBbMHhmLCAweGYsIDB4ZiwgMHhmLCAweGYsIDB4ZiwgMHhmLCAweGYsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdXHJcbn07Ly8gNGJpdCB3YXZlIGZvcm1cclxuXHJcbnZhciBTYXdXYXZlID0ge1xyXG4gIGJpdHM6IDQsXHJcbiAgd2F2ZWRhdGE6IFsweDAsIDB4MSwgMHgyLCAweDMsIDB4NCwgMHg1LCAweDYsIDB4NywgMHg4LCAweDksIDB4YSwgMHhiLCAweGMsIDB4ZCwgMHhlLCAweGZdXHJcbn07Ly8gNGJpdCB3YXZlIGZvcm1cclxuXHJcbnZhciBUcmlXYXZlID0ge1xyXG4gIGJpdHM6IDQsXHJcbiAgd2F2ZWRhdGE6IFsweDAsIDB4MiwgMHg0LCAweDYsIDB4OCwgMHhBLCAweEMsIDB4RSwgMHhGLCAweEUsIDB4QywgMHhBLCAweDgsIDB4NiwgMHg0LCAweDJdXHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZGVjb2RlU3RyKGJpdHMsIHdhdmVzdHIpIHtcclxuICB2YXIgYXJyID0gW107XHJcbiAgdmFyIG4gPSBiaXRzIC8gNCB8IDA7XHJcbiAgdmFyIGMgPSAwO1xyXG4gIHZhciB6ZXJvcG9zID0gMSA8PCAoYml0cyAtIDEpO1xyXG4gIHdoaWxlIChjIDwgd2F2ZXN0ci5sZW5ndGgpIHtcclxuICAgIHZhciBkID0gMDtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgKytpKSB7XHJcbiAgICAgIGV2YWwoXCJkID0gKGQgPDwgNCkgKyAweFwiICsgd2F2ZXN0ci5jaGFyQXQoYysrKSArIFwiO1wiKTtcclxuICAgIH1cclxuICAgIGFyci5wdXNoKChkIC0gemVyb3BvcykgLyB6ZXJvcG9zKTtcclxuICB9XHJcbiAgcmV0dXJuIGFycjtcclxufVxyXG5cclxudmFyIHdhdmVzID0gW1xyXG4gICAgZGVjb2RlU3RyKDQsICdFRUVFRUVFRUVFRUVFRUVFMDAwMDAwMDAwMDAwMDAwMCcpLFxyXG4gICAgZGVjb2RlU3RyKDQsICcwMDExMjIzMzQ0NTU2Njc3ODg5OUFBQkJDQ0RERUVGRicpLFxyXG4gICAgZGVjb2RlU3RyKDQsICcwMjM0NjY0NTlBQThBN0E5Nzc5NjU2NTZBQ0FBQ0RFRicpLFxyXG4gICAgZGVjb2RlU3RyKDQsICdCRENEQ0E5OTlBQ0RDREI5NDIxMjM2Nzc3NjMyMTI0NycpLFxyXG4gICAgZGVjb2RlU3RyKDQsICc3QUNERURDQTc0MjEwMTI0N0JERURCNzMyMDEzN0U3OCcpLFxyXG4gICAgZGVjb2RlU3RyKDQsICdBQ0NBNzc5QkRFREE2NjY3OTk5NDEwMTI2Nzc0MjI0NycpLFxyXG4gICAgZGVjb2RlU3RyKDQsICc3RUM5Q0VBN0NGRDhBQjcyOEQ5NDU3MjAzODUxMzUzMScpLFxyXG4gICAgZGVjb2RlU3RyKDQsICdFRTc3RUU3N0VFNzdFRTc3MDA3NzAwNzcwMDc3MDA3NycpLFxyXG4gICAgZGVjb2RlU3RyKDQsICdFRUVFODg4ODg4ODg4ODg4MDAwMDg4ODg4ODg4ODg4OCcpLy/jg47jgqTjgrrnlKjjga7jg4Djg5/jg7zms6LlvaJcclxuXTtcclxuXHJcbnZhciB3YXZlU2FtcGxlcyA9IFtdO1xyXG5leHBvcnQgZnVuY3Rpb24gV2F2ZVNhbXBsZShhdWRpb2N0eCwgY2gsIHNhbXBsZUxlbmd0aCwgc2FtcGxlUmF0ZSkge1xyXG5cclxuICB0aGlzLnNhbXBsZSA9IGF1ZGlvY3R4LmNyZWF0ZUJ1ZmZlcihjaCwgc2FtcGxlTGVuZ3RoLCBzYW1wbGVSYXRlIHx8IGF1ZGlvY3R4LnNhbXBsZVJhdGUpO1xyXG4gIHRoaXMubG9vcCA9IGZhbHNlO1xyXG4gIHRoaXMuc3RhcnQgPSAwO1xyXG4gIHRoaXMuZW5kID0gKHNhbXBsZUxlbmd0aCAtIDEpIC8gKHNhbXBsZVJhdGUgfHwgYXVkaW9jdHguc2FtcGxlUmF0ZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVXYXZlU2FtcGxlRnJvbVdhdmVzKGF1ZGlvY3R4LCBzYW1wbGVMZW5ndGgpIHtcclxuICBmb3IgKHZhciBpID0gMCwgZW5kID0gd2F2ZXMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgIHZhciBzYW1wbGUgPSBuZXcgV2F2ZVNhbXBsZShhdWRpb2N0eCwgMSwgc2FtcGxlTGVuZ3RoKTtcclxuICAgIHdhdmVTYW1wbGVzLnB1c2goc2FtcGxlKTtcclxuICAgIGlmIChpICE9IDgpIHtcclxuICAgICAgdmFyIHdhdmVkYXRhID0gd2F2ZXNbaV07XHJcbiAgICAgIHZhciBkZWx0YSA9IDQ0MC4wICogd2F2ZWRhdGEubGVuZ3RoIC8gYXVkaW9jdHguc2FtcGxlUmF0ZTtcclxuICAgICAgdmFyIHN0aW1lID0gMDtcclxuICAgICAgdmFyIG91dHB1dCA9IHNhbXBsZS5zYW1wbGUuZ2V0Q2hhbm5lbERhdGEoMCk7XHJcbiAgICAgIHZhciBsZW4gPSB3YXZlZGF0YS5sZW5ndGg7XHJcbiAgICAgIHZhciBpbmRleCA9IDA7XHJcbiAgICAgIHZhciBlbmRzYW1wbGUgPSAwO1xyXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHNhbXBsZUxlbmd0aDsgKytqKSB7XHJcbiAgICAgICAgaW5kZXggPSBzdGltZSB8IDA7XHJcbiAgICAgICAgb3V0cHV0W2pdID0gd2F2ZWRhdGFbaW5kZXhdO1xyXG4gICAgICAgIHN0aW1lICs9IGRlbHRhO1xyXG4gICAgICAgIGlmIChzdGltZSA+PSBsZW4pIHtcclxuICAgICAgICAgIHN0aW1lID0gc3RpbWUgLSBsZW47XHJcbiAgICAgICAgICBlbmRzYW1wbGUgPSBqO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBzYW1wbGUuZW5kID0gZW5kc2FtcGxlIC8gYXVkaW9jdHguc2FtcGxlUmF0ZTtcclxuICAgICAgc2FtcGxlLmxvb3AgPSB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8g44Oc44Kk44K5OOOBr+ODjuOCpOOCuuazouW9ouOBqOOBmeOCi1xyXG4gICAgICB2YXIgb3V0cHV0ID0gc2FtcGxlLnNhbXBsZS5nZXRDaGFubmVsRGF0YSgwKTtcclxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBzYW1wbGVMZW5ndGg7ICsraikge1xyXG4gICAgICAgIG91dHB1dFtqXSA9IE1hdGgucmFuZG9tKCkgKiAyLjAgLSAxLjA7XHJcbiAgICAgIH1cclxuICAgICAgc2FtcGxlLmVuZCA9IHNhbXBsZUxlbmd0aCAvIGF1ZGlvY3R4LnNhbXBsZVJhdGU7XHJcbiAgICAgIHNhbXBsZS5sb29wID0gdHJ1ZTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBXYXZlVGV4dHVyZSh3YXZlKSB7XHJcbiAgdGhpcy53YXZlID0gd2F2ZSB8fCB3YXZlc1swXTtcclxuICB0aGlzLnRleCA9IG5ldyBDYW52YXNUZXh0dXJlKDMyMCwgMTAgKiAxNik7XHJcbiAgdGhpcy5yZW5kZXIoKTtcclxufVxyXG5cclxuV2F2ZVRleHR1cmUucHJvdG90eXBlID0ge1xyXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGN0eCA9IHRoaXMudGV4LmN0eDtcclxuICAgIHZhciB3YXZlID0gdGhpcy53YXZlO1xyXG4gICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjdHguY2FudmFzLndpZHRoLCBjdHguY2FudmFzLmhlaWdodCk7XHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnd2hpdGUnO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzMjA7IGkgKz0gMTApIHtcclxuICAgICAgY3R4Lm1vdmVUbyhpLCAwKTtcclxuICAgICAgY3R4LmxpbmVUbyhpLCAyNTUpO1xyXG4gICAgfVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxNjA7IGkgKz0gMTApIHtcclxuICAgICAgY3R4Lm1vdmVUbygwLCBpKTtcclxuICAgICAgY3R4LmxpbmVUbygzMjAsIGkpO1xyXG4gICAgfVxyXG4gICAgY3R4LmZpbGxTdHlsZSA9ICdyZ2JhKDI1NSwyNTUsMjU1LDAuNyknO1xyXG4gICAgY3R4LnJlY3QoMCwgMCwgY3R4LmNhbnZhcy53aWR0aCwgY3R4LmNhbnZhcy5oZWlnaHQpO1xyXG4gICAgY3R4LnN0cm9rZSgpO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGMgPSAwOyBpIDwgY3R4LmNhbnZhcy53aWR0aDsgaSArPSAxMCwgKytjKSB7XHJcbiAgICAgIGN0eC5maWxsUmVjdChpLCAod2F2ZVtjXSA+IDApID8gODAgLSB3YXZlW2NdICogODAgOiA4MCwgMTAsIE1hdGguYWJzKHdhdmVbY10pICogODApO1xyXG4gICAgfVxyXG4gICAgdGhpcy50ZXgudGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgfVxyXG59O1xyXG5cclxuLy8vIOOCqOODs+ODmeODreODvOODl+OCuOOCp+ODjeODrOODvOOCv+ODvFxyXG5leHBvcnQgZnVuY3Rpb24gRW52ZWxvcGVHZW5lcmF0b3Iodm9pY2UsIGF0dGFjaywgZGVjYXksIHN1c3RhaW4sIHJlbGVhc2UpIHtcclxuICB0aGlzLnZvaWNlID0gdm9pY2U7XHJcbiAgLy90aGlzLmtleW9uID0gZmFsc2U7XHJcbiAgdGhpcy5hdHRhY2sgPSBhdHRhY2sgfHwgMC4wMDA1O1xyXG4gIHRoaXMuZGVjYXkgPSBkZWNheSB8fCAwLjA1O1xyXG4gIHRoaXMuc3VzdGFpbiA9IHN1c3RhaW4gfHwgMC41O1xyXG4gIHRoaXMucmVsZWFzZSA9IHJlbGVhc2UgfHwgMC41O1xyXG4gIHRoaXMudiA9IDEuMDtcclxuXHJcbn07XHJcblxyXG5FbnZlbG9wZUdlbmVyYXRvci5wcm90b3R5cGUgPVxyXG57XHJcbiAga2V5b246IGZ1bmN0aW9uICh0LHZlbCkge1xyXG4gICAgdGhpcy52ID0gdmVsIHx8IDEuMDtcclxuICAgIHZhciB2ID0gdGhpcy52O1xyXG4gICAgdmFyIHQwID0gdCB8fCB0aGlzLnZvaWNlLmF1ZGlvY3R4LmN1cnJlbnRUaW1lO1xyXG4gICAgdmFyIHQxID0gdDAgKyB0aGlzLmF0dGFjayAqIHY7XHJcbiAgICB2YXIgZ2FpbiA9IHRoaXMudm9pY2UuZ2Fpbi5nYWluO1xyXG4gICAgZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXModDApO1xyXG4gICAgZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLCB0MCk7XHJcbiAgICBnYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHYsIHQxKTtcclxuICAgIGdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUodGhpcy5zdXN0YWluICogdiwgdDAgKyB0aGlzLmRlY2F5IC8gdik7XHJcbiAgICAvL2dhaW4uc2V0VGFyZ2V0QXRUaW1lKHRoaXMuc3VzdGFpbiAqIHYsIHQxLCB0MSArIHRoaXMuZGVjYXkgLyB2KTtcclxuICB9LFxyXG4gIGtleW9mZjogZnVuY3Rpb24gKHQpIHtcclxuICAgIHZhciB2b2ljZSA9IHRoaXMudm9pY2U7XHJcbiAgICB2YXIgZ2FpbiA9IHZvaWNlLmdhaW4uZ2FpbjtcclxuICAgIHZhciB0MCA9IHQgfHwgdm9pY2UuYXVkaW9jdHguY3VycmVudFRpbWU7XHJcbiAgICBnYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyh0MCk7XHJcbiAgICAvL2dhaW4uc2V0VmFsdWVBdFRpbWUoMCwgdDAgKyB0aGlzLnJlbGVhc2UgLyB0aGlzLnYpO1xyXG4gICAgLy9nYWluLnNldFRhcmdldEF0VGltZSgwLCB0MCwgdDAgKyB0aGlzLnJlbGVhc2UgLyB0aGlzLnYpO1xyXG4gICAgZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCB0MCArIHRoaXMucmVsZWFzZSAvIHRoaXMudik7XHJcbiAgfVxyXG59O1xyXG5cclxuLy8vIOODnOOCpOOCuVxyXG5leHBvcnQgZnVuY3Rpb24gVm9pY2UoYXVkaW9jdHgpIHtcclxuICB0aGlzLmF1ZGlvY3R4ID0gYXVkaW9jdHg7XHJcbiAgdGhpcy5zYW1wbGUgPSB3YXZlU2FtcGxlc1s2XTtcclxuICB0aGlzLmdhaW4gPSBhdWRpb2N0eC5jcmVhdGVHYWluKCk7XHJcbiAgdGhpcy5nYWluLmdhaW4udmFsdWUgPSAwLjA7XHJcbiAgdGhpcy52b2x1bWUgPSBhdWRpb2N0eC5jcmVhdGVHYWluKCk7XHJcbiAgdGhpcy5lbnZlbG9wZSA9IG5ldyBFbnZlbG9wZUdlbmVyYXRvcih0aGlzKTtcclxuICB0aGlzLmluaXRQcm9jZXNzb3IoKTtcclxuICB0aGlzLmRldHVuZSA9IDEuMDtcclxuICB0aGlzLnZvbHVtZS5nYWluLnZhbHVlID0gMS4wO1xyXG4gIHRoaXMuZ2Fpbi5jb25uZWN0KHRoaXMudm9sdW1lKTtcclxuICB0aGlzLm91dHB1dCA9IHRoaXMudm9sdW1lO1xyXG59O1xyXG5cclxuVm9pY2UucHJvdG90eXBlID0ge1xyXG4gIGluaXRQcm9jZXNzb3I6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMucHJvY2Vzc29yID0gdGhpcy5hdWRpb2N0eC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcclxuICAgIHRoaXMucHJvY2Vzc29yLmJ1ZmZlciA9IHRoaXMuc2FtcGxlLnNhbXBsZTtcclxuICAgIHRoaXMucHJvY2Vzc29yLmxvb3AgPSB0aGlzLnNhbXBsZS5sb29wO1xyXG4gICAgdGhpcy5wcm9jZXNzb3IubG9vcFN0YXJ0ID0gMDtcclxuICAgIHRoaXMucHJvY2Vzc29yLnBsYXliYWNrUmF0ZS52YWx1ZSA9IDEuMDtcclxuICAgIHRoaXMucHJvY2Vzc29yLmxvb3BFbmQgPSB0aGlzLnNhbXBsZS5lbmQ7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5jb25uZWN0KHRoaXMuZ2Fpbik7XHJcbiAgfSxcclxuXHJcbiAgc2V0U2FtcGxlOiBmdW5jdGlvbiAoc2FtcGxlKSB7XHJcbiAgICAgIHRoaXMuZW52ZWxvcGUua2V5b2ZmKDApO1xyXG4gICAgICB0aGlzLnByb2Nlc3Nvci5kaXNjb25uZWN0KHRoaXMuZ2Fpbik7XHJcbiAgICAgIHRoaXMuc2FtcGxlID0gc2FtcGxlO1xyXG4gICAgICB0aGlzLmluaXRQcm9jZXNzb3IoKTtcclxuICAgICAgdGhpcy5wcm9jZXNzb3Iuc3RhcnQoKTtcclxuICB9LFxyXG4gIHN0YXJ0OiBmdW5jdGlvbiAoc3RhcnRUaW1lKSB7XHJcbiAvLyAgIGlmICh0aGlzLnByb2Nlc3Nvci5wbGF5YmFja1N0YXRlID09IDMpIHtcclxuICAgICAgdGhpcy5wcm9jZXNzb3IuZGlzY29ubmVjdCh0aGlzLmdhaW4pO1xyXG4gICAgICB0aGlzLmluaXRQcm9jZXNzb3IoKTtcclxuLy8gICAgfSBlbHNlIHtcclxuLy8gICAgICB0aGlzLmVudmVsb3BlLmtleW9mZigpO1xyXG4vL1xyXG4vLyAgICB9XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5zdGFydChzdGFydFRpbWUpO1xyXG4gIH0sXHJcbiAgc3RvcDogZnVuY3Rpb24gKHRpbWUpIHtcclxuICAgIHRoaXMucHJvY2Vzc29yLnN0b3AodGltZSk7XHJcbiAgICB0aGlzLnJlc2V0KCk7XHJcbiAgfSxcclxuICBrZXlvbjpmdW5jdGlvbih0LG5vdGUsdmVsKVxyXG4gIHtcclxuICAgIHRoaXMucHJvY2Vzc29yLnBsYXliYWNrUmF0ZS5zZXRWYWx1ZUF0VGltZShub3RlRnJlcVtub3RlXSAqIHRoaXMuZGV0dW5lLCB0KTtcclxuICAgIHRoaXMuZW52ZWxvcGUua2V5b24odCx2ZWwpO1xyXG4gIH0sXHJcbiAga2V5b2ZmOmZ1bmN0aW9uKHQpXHJcbiAge1xyXG4gICAgdGhpcy5lbnZlbG9wZS5rZXlvZmYodCk7XHJcbiAgfSxcclxuICByZXNldDpmdW5jdGlvbigpXHJcbiAge1xyXG4gICAgdGhpcy5wcm9jZXNzb3IucGxheWJhY2tSYXRlLmNhbmNlbFNjaGVkdWxlZFZhbHVlcygwKTtcclxuICAgIHRoaXMuZ2Fpbi5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcygwKTtcclxuICAgIHRoaXMuZ2Fpbi5nYWluLnZhbHVlID0gMDtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBBdWRpbygpIHtcclxuICB0aGlzLmVuYWJsZSA9IGZhbHNlO1xyXG4gIHRoaXMuYXVkaW9Db250ZXh0ID0gd2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0IHx8IHdpbmRvdy5tb3pBdWRpb0NvbnRleHQ7XHJcblxyXG4gIGlmICh0aGlzLmF1ZGlvQ29udGV4dCkge1xyXG4gICAgdGhpcy5hdWRpb2N0eCA9IG5ldyB0aGlzLmF1ZGlvQ29udGV4dCgpO1xyXG4gICAgdGhpcy5lbmFibGUgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgdGhpcy52b2ljZXMgPSBbXTtcclxuICBpZiAodGhpcy5lbmFibGUpIHtcclxuICAgIGNyZWF0ZVdhdmVTYW1wbGVGcm9tV2F2ZXModGhpcy5hdWRpb2N0eCwgQlVGRkVSX1NJWkUpO1xyXG4gICAgdGhpcy5maWx0ZXIgPSB0aGlzLmF1ZGlvY3R4LmNyZWF0ZUJpcXVhZEZpbHRlcigpO1xyXG4gICAgdGhpcy5maWx0ZXIudHlwZSA9ICdsb3dwYXNzJztcclxuICAgIHRoaXMuZmlsdGVyLmZyZXF1ZW5jeS52YWx1ZSA9IDIwMDAwO1xyXG4gICAgdGhpcy5maWx0ZXIuUS52YWx1ZSA9IDAuMDAwMTtcclxuICAgIHRoaXMubm9pc2VGaWx0ZXIgPSB0aGlzLmF1ZGlvY3R4LmNyZWF0ZUJpcXVhZEZpbHRlcigpO1xyXG4gICAgdGhpcy5ub2lzZUZpbHRlci50eXBlID0gJ2xvd3Bhc3MnO1xyXG4gICAgdGhpcy5ub2lzZUZpbHRlci5mcmVxdWVuY3kudmFsdWUgPSAxMDAwO1xyXG4gICAgdGhpcy5ub2lzZUZpbHRlci5RLnZhbHVlID0gMS44O1xyXG4gICAgdGhpcy5jb21wID0gdGhpcy5hdWRpb2N0eC5jcmVhdGVEeW5hbWljc0NvbXByZXNzb3IoKTtcclxuICAgIHRoaXMuZmlsdGVyLmNvbm5lY3QodGhpcy5jb21wKTtcclxuICAgIHRoaXMubm9pc2VGaWx0ZXIuY29ubmVjdCh0aGlzLmNvbXApO1xyXG4gICAgdGhpcy5jb21wLmNvbm5lY3QodGhpcy5hdWRpb2N0eC5kZXN0aW5hdGlvbik7XHJcbiAgICBmb3IgKHZhciBpID0gMCxlbmQgPSB0aGlzLlZPSUNFUzsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIHZhciB2ID0gbmV3IFZvaWNlKHRoaXMuYXVkaW9jdHgpO1xyXG4gICAgICB0aGlzLnZvaWNlcy5wdXNoKHYpO1xyXG4gICAgICBpZihpID09ICh0aGlzLlZPSUNFUyAtIDEpKXtcclxuICAgICAgICB2Lm91dHB1dC5jb25uZWN0KHRoaXMubm9pc2VGaWx0ZXIpO1xyXG4gICAgICB9IGVsc2V7XHJcbiAgICAgICAgdi5vdXRwdXQuY29ubmVjdCh0aGlzLmZpbHRlcik7XHJcbiAgICAgIH1cclxuICAgIH1cclxuLy8gIHRoaXMuc3RhcnRlZCA9IGZhbHNlO1xyXG5cclxuICAgIC8vdGhpcy52b2ljZXNbMF0ub3V0cHV0LmNvbm5lY3QoKTtcclxuICB9XHJcblxyXG59XHJcblxyXG5BdWRpby5wcm90b3R5cGUgPSB7XHJcbiAgc3RhcnQ6IGZ1bmN0aW9uICgpXHJcbiAge1xyXG4gIC8vICBpZiAodGhpcy5zdGFydGVkKSByZXR1cm47XHJcblxyXG4gICAgdmFyIHZvaWNlcyA9IHRoaXMudm9pY2VzO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHZvaWNlcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSlcclxuICAgIHtcclxuICAgICAgdm9pY2VzW2ldLnN0YXJ0KDApO1xyXG4gICAgfVxyXG4gICAgLy90aGlzLnN0YXJ0ZWQgPSB0cnVlO1xyXG4gIH0sXHJcbiAgc3RvcDogZnVuY3Rpb24gKClcclxuICB7XHJcbiAgICAvL2lmKHRoaXMuc3RhcnRlZClcclxuICAgIC8ve1xyXG4gICAgICB2YXIgdm9pY2VzID0gdGhpcy52b2ljZXM7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB2b2ljZXMubGVuZ3RoOyBpIDwgZW5kOyArK2kpXHJcbiAgICAgIHtcclxuICAgICAgICB2b2ljZXNbaV0uc3RvcCgwKTtcclxuICAgICAgfVxyXG4gICAgLy8gIHRoaXMuc3RhcnRlZCA9IGZhbHNlO1xyXG4gICAgLy99XHJcbiAgfSxcclxuICBWT0lDRVM6IDEyXHJcbn1cclxuXHJcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4vKiDjgrfjg7zjgrHjg7PjgrXjg7zjgrPjg57jg7Pjg4kgICAgICAgICAgICAgICAgICAgICAgICovXHJcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIE5vdGUobm8sIG5hbWUpIHtcclxuICB0aGlzLm5vID0gbm87XHJcbiAgdGhpcy5uYW1lID0gbmFtZTtcclxufVxyXG5cclxuTm90ZS5wcm90b3R5cGUgPSB7XHJcbiAgcHJvY2VzczogZnVuY3Rpb24odHJhY2spIFxyXG4gIHtcclxuICAgIHZhciBiYWNrID0gdHJhY2suYmFjaztcclxuICAgIHZhciBub3RlID0gdGhpcztcclxuICAgIHZhciBvY3QgPSB0aGlzLm9jdCB8fCBiYWNrLm9jdDtcclxuICAgIHZhciBzdGVwID0gdGhpcy5zdGVwIHx8IGJhY2suc3RlcDtcclxuICAgIHZhciBnYXRlID0gdGhpcy5nYXRlIHx8IGJhY2suZ2F0ZTtcclxuICAgIHZhciB2ZWwgPSB0aGlzLnZlbCB8fCBiYWNrLnZlbDtcclxuICAgIHNldFF1ZXVlKHRyYWNrLCBub3RlLCBvY3Qsc3RlcCwgZ2F0ZSwgdmVsKTtcclxuXHJcbiAgfVxyXG59XHJcblxyXG52YXIgXHJcbiAgQyAgPSBuZXcgTm90ZSggMCwnQyAnKSxcclxuICBEYiA9IG5ldyBOb3RlKCAxLCdEYicpLFxyXG4gIEQgID0gbmV3IE5vdGUoIDIsJ0QgJyksXHJcbiAgRWIgPSBuZXcgTm90ZSggMywnRWInKSxcclxuICBFICA9IG5ldyBOb3RlKCA0LCdFICcpLFxyXG4gIEYgID0gbmV3IE5vdGUoIDUsJ0YgJyksXHJcbiAgR2IgPSBuZXcgTm90ZSggNiwnR2InKSxcclxuICBHICA9IG5ldyBOb3RlKCA3LCdHICcpLFxyXG4gIEFiID0gbmV3IE5vdGUoIDgsJ0FiJyksXHJcbiAgQSAgPSBuZXcgTm90ZSggOSwnQSAnKSxcclxuICBCYiA9IG5ldyBOb3RlKDEwLCdCYicpLFxyXG4gIEIgPSBuZXcgTm90ZSgxMSwgJ0IgJyk7XHJcblxyXG4gLy8gUiA9IG5ldyBSZXN0KCk7XHJcblxyXG5mdW5jdGlvbiBTZXFEYXRhKG5vdGUsIG9jdCwgc3RlcCwgZ2F0ZSwgdmVsKVxyXG57XHJcbiAgdGhpcy5ub3RlID0gbm90ZTtcclxuICB0aGlzLm9jdCA9IG9jdDtcclxuICAvL3RoaXMubm8gPSBub3RlLm5vICsgb2N0ICogMTI7XHJcbiAgdGhpcy5zdGVwID0gc3RlcDtcclxuICB0aGlzLmdhdGUgPSBnYXRlO1xyXG4gIHRoaXMudmVsID0gdmVsO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZXRRdWV1ZSh0cmFjayxub3RlLG9jdCxzdGVwLGdhdGUsdmVsKVxyXG57XHJcbiAgdmFyIG5vID0gbm90ZS5ubyArIG9jdCAqIDEyO1xyXG4gIHZhciBzdGVwX3RpbWUgPSB0cmFjay5wbGF5aW5nVGltZTtcclxuICB2YXIgZ2F0ZV90aW1lID0gKChnYXRlID49IDApID8gZ2F0ZSAqIDYwIDogc3RlcCAqIGdhdGUgKiA2MCAqIC0xLjApIC8gKFRJTUVfQkFTRSAqIHRyYWNrLmxvY2FsVGVtcG8pICsgdHJhY2sucGxheWluZ1RpbWU7XHJcbiAgdmFyIHZvaWNlID0gdHJhY2suYXVkaW8udm9pY2VzW3RyYWNrLmNoYW5uZWxdO1xyXG4gIC8vY29uc29sZS5sb2codHJhY2suc2VxdWVuY2VyLnRlbXBvKTtcclxuICB2b2ljZS5rZXlvbihzdGVwX3RpbWUsIG5vLCB2ZWwpO1xyXG4gIHZvaWNlLmtleW9mZihnYXRlX3RpbWUpO1xyXG4gIHRyYWNrLnBsYXlpbmdUaW1lID0gKHN0ZXAgKiA2MCkgLyAoVElNRV9CQVNFICogdHJhY2subG9jYWxUZW1wbykgKyB0cmFjay5wbGF5aW5nVGltZTtcclxuICB2YXIgYmFjayA9IHRyYWNrLmJhY2s7XHJcbiAgYmFjay5ub3RlID0gbm90ZTtcclxuICBiYWNrLm9jdCA9IG9jdDtcclxuICBiYWNrLnN0ZXAgPSBzdGVwO1xyXG4gIGJhY2suZ2F0ZSA9IGdhdGU7XHJcbiAgYmFjay52ZWwgPSB2ZWw7XHJcbn1cclxuXHJcblNlcURhdGEucHJvdG90eXBlID0ge1xyXG4gIHByb2Nlc3M6IGZ1bmN0aW9uICh0cmFjaykge1xyXG5cclxuICAgIHZhciBiYWNrID0gdHJhY2suYmFjaztcclxuICAgIHZhciBub3RlID0gdGhpcy5ub3RlIHx8IGJhY2subm90ZTtcclxuICAgIHZhciBvY3QgPSB0aGlzLm9jdCB8fCBiYWNrLm9jdDtcclxuICAgIHZhciBzdGVwID0gdGhpcy5zdGVwIHx8IGJhY2suc3RlcDtcclxuICAgIHZhciBnYXRlID0gdGhpcy5nYXRlIHx8IGJhY2suZ2F0ZTtcclxuICAgIHZhciB2ZWwgPSB0aGlzLnZlbCB8fCBiYWNrLnZlbDtcclxuICAgIHNldFF1ZXVlKHRyYWNrLG5vdGUsb2N0LHN0ZXAsZ2F0ZSx2ZWwpO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gUyhub3RlLCBvY3QsIHN0ZXAsIGdhdGUsIHZlbCkge1xyXG4gIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcclxuICBpZiAoUy5sZW5ndGggIT0gYXJncy5sZW5ndGgpXHJcbiAge1xyXG4gICAgaWYodHlwZW9mKGFyZ3NbYXJncy5sZW5ndGggLSAxXSkgPT0gJ29iamVjdCcgJiYgICEoYXJnc1thcmdzLmxlbmd0aCAtIDFdIGluc3RhbmNlb2YgTm90ZSkpXHJcbiAgICB7XHJcbiAgICAgIHZhciBhcmdzMSA9IGFyZ3NbYXJncy5sZW5ndGggLSAxXTtcclxuICAgICAgdmFyIGwgPSBhcmdzLmxlbmd0aCAtIDE7XHJcbiAgICAgIHJldHVybiBuZXcgU2VxRGF0YShcclxuICAgICAgKChsICE9IDApP25vdGU6ZmFsc2UpIHx8IGFyZ3MxLm5vdGUgfHwgYXJnczEubiB8fCBudWxsLFxyXG4gICAgICAoKGwgIT0gMSkgPyBvY3QgOiBmYWxzZSkgfHwgYXJnczEub2N0IHx8IGFyZ3MxLm8gfHwgbnVsbCxcclxuICAgICAgKChsICE9IDIpID8gc3RlcCA6IGZhbHNlKSB8fCBhcmdzMS5zdGVwIHx8IGFyZ3MxLnMgfHwgbnVsbCxcclxuICAgICAgKChsICE9IDMpID8gZ2F0ZSA6IGZhbHNlKSB8fCBhcmdzMS5nYXRlIHx8IGFyZ3MxLmcgfHwgbnVsbCxcclxuICAgICAgKChsICE9IDQpID8gdmVsIDogZmFsc2UpIHx8IGFyZ3MxLnZlbCB8fCBhcmdzMS52IHx8IG51bGxcclxuICAgICAgKTtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIG5ldyBTZXFEYXRhKG5vdGUgfHwgbnVsbCwgb2N0IHx8IG51bGwsIHN0ZXAgfHwgbnVsbCwgZ2F0ZSB8fCBudWxsLCB2ZWwgfHwgbnVsbCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFMxKG5vdGUsIG9jdCwgc3RlcCwgZ2F0ZSwgdmVsKSB7XHJcbiAgcmV0dXJuIFMobm90ZSwgb2N0LCBsKHN0ZXApLCBnYXRlLCB2ZWwpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBTMihub3RlLCBsZW4sIGRvdCAsIG9jdCwgZ2F0ZSwgdmVsKSB7XHJcbiAgcmV0dXJuIFMobm90ZSwgb2N0LCBsKGxlbixkb3QpLCBnYXRlLCB2ZWwpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBTMyhub3RlLCBzdGVwLCBnYXRlLCB2ZWwsIG9jdCkge1xyXG4gIHJldHVybiBTKG5vdGUsIG9jdCwgc3RlcCwgZ2F0ZSwgdmVsKTtcclxufVxyXG5cclxuXHJcbi8vLyDpn7PnrKbjga7plbfjgZXmjIflrppcclxuXHJcbmZ1bmN0aW9uIGwobGVuLGRvdClcclxue1xyXG4gIHZhciBkID0gZmFsc2U7XHJcbiAgaWYgKGRvdCkgZCA9IGRvdDtcclxuICByZXR1cm4gKFRJTUVfQkFTRSAqICg0ICsgKGQ/MjowKSkpIC8gbGVuO1xyXG59XHJcblxyXG5mdW5jdGlvbiBTdGVwKHN0ZXApIHtcclxuICB0aGlzLnN0ZXAgPSBzdGVwO1xyXG59XHJcblxyXG5TdGVwLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKHRyYWNrKVxyXG57XHJcbiAgdHJhY2suYmFjay5zdGVwID0gdGhpcy5zdGVwO1xyXG59XHJcblxyXG5mdW5jdGlvbiBTVChzdGVwKVxyXG57XHJcbiAgcmV0dXJuIG5ldyBTdGVwKHN0ZXApO1xyXG59XHJcblxyXG5mdW5jdGlvbiBMKGxlbiwgZG90KSB7XHJcbiAgcmV0dXJuIG5ldyBTdGVwKGwobGVuLCBkb3QpKTtcclxufVxyXG5cclxuLy8vIOOCsuODvOODiOOCv+OCpOODoOaMh+WumlxyXG5cclxuZnVuY3Rpb24gR2F0ZVRpbWUoZ2F0ZSkge1xyXG4gIHRoaXMuZ2F0ZSA9IGdhdGU7XHJcbn1cclxuXHJcbkdhdGVUaW1lLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKHRyYWNrKSB7XHJcbiAgdHJhY2suYmFjay5nYXRlID0gdGhpcy5nYXRlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBHVChnYXRlKSB7XHJcbiAgcmV0dXJuIG5ldyBHYXRlVGltZShnYXRlKTtcclxufVxyXG5cclxuLy8vIOODmeODreOCt+ODhuOCo+aMh+WumlxyXG5cclxuZnVuY3Rpb24gVmVsb2NpdHkodmVsKSB7XHJcbiAgdGhpcy52ZWwgPSB2ZWw7XHJcbn1cclxuXHJcblZlbG9jaXR5LnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKHRyYWNrKSB7XHJcbiAgdHJhY2suYmFjay52ZWwgPSB0aGlzLnZlbDtcclxufVxyXG5cclxuZnVuY3Rpb24gVih2ZWwpIHtcclxuICByZXR1cm4gbmV3IFZlbG9jaXR5KHZlbCk7XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBKdW1wKHBvcykgeyB0aGlzLnBvcyA9IHBvczt9O1xyXG5KdW1wLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKHRyYWNrKVxyXG57XHJcbiAgdHJhY2suc2VxUG9zID0gdGhpcy5wb3M7XHJcbn1cclxuXHJcbi8vLyDpn7PoibLoqK3lrppcclxuZnVuY3Rpb24gVG9uZShubylcclxue1xyXG4gIHRoaXMubm8gPSBubztcclxuICAvL3RoaXMuc2FtcGxlID0gd2F2ZVNhbXBsZXNbdGhpcy5ub107XHJcbn1cclxuXHJcblRvbmUucHJvdG90eXBlID1cclxue1xyXG4gIHByb2Nlc3M6IGZ1bmN0aW9uICh0cmFjaylcclxuICB7XHJcbiAgICB0cmFjay5hdWRpby52b2ljZXNbdHJhY2suY2hhbm5lbF0uc2V0U2FtcGxlKHdhdmVTYW1wbGVzW3RoaXMubm9dKTtcclxuICB9XHJcbn1cclxuZnVuY3Rpb24gVE9ORShubylcclxue1xyXG4gIHJldHVybiBuZXcgVG9uZShubyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIEpVTVAocG9zKSB7XHJcbiAgcmV0dXJuIG5ldyBKdW1wKHBvcyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFJlc3Qoc3RlcClcclxue1xyXG4gIHRoaXMuc3RlcCA9IHN0ZXA7XHJcbn1cclxuXHJcblJlc3QucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbih0cmFjaylcclxue1xyXG4gIHZhciBzdGVwID0gdGhpcy5zdGVwIHx8IHRyYWNrLmJhY2suc3RlcDtcclxuICB0cmFjay5wbGF5aW5nVGltZSA9IHRyYWNrLnBsYXlpbmdUaW1lICsgKHRoaXMuc3RlcCAqIDYwKSAvIChUSU1FX0JBU0UgKiB0cmFjay5sb2NhbFRlbXBvKTtcclxuICB0cmFjay5iYWNrLnN0ZXAgPSB0aGlzLnN0ZXA7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFIxKHN0ZXApIHtcclxuICByZXR1cm4gbmV3IFJlc3Qoc3RlcCk7XHJcbn1cclxuZnVuY3Rpb24gUihsZW4sZG90KSB7XHJcbiAgcmV0dXJuIG5ldyBSZXN0KGwobGVuLGRvdCkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBPY3RhdmUob2N0KSB7XHJcbiAgdGhpcy5vY3QgPSBvY3Q7XHJcbn1cclxuT2N0YXZlLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24odHJhY2spXHJcbntcclxuICB0cmFjay5iYWNrLm9jdCA9IHRoaXMub2N0O1xyXG59XHJcblxyXG5mdW5jdGlvbiBPKG9jdCkge1xyXG4gIHJldHVybiBuZXcgT2N0YXZlKG9jdCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIE9jdGF2ZVVwKHYpIHsgdGhpcy52ID0gdjsgfTtcclxuT2N0YXZlVXAucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbih0cmFjaykge1xyXG4gIHRyYWNrLmJhY2sub2N0ICs9IHRoaXMudjtcclxufVxyXG5cclxudmFyIE9VID0gbmV3IE9jdGF2ZVVwKDEpO1xyXG52YXIgT0QgPSBuZXcgT2N0YXZlVXAoLTEpO1xyXG5cclxuZnVuY3Rpb24gVGVtcG8odGVtcG8pXHJcbntcclxuICB0aGlzLnRlbXBvID0gdGVtcG87XHJcbn1cclxuXHJcblRlbXBvLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24odHJhY2spXHJcbntcclxuICB0cmFjay5sb2NhbFRlbXBvID0gdGhpcy50ZW1wbztcclxuICAvL3RyYWNrLnNlcXVlbmNlci50ZW1wbyA9IHRoaXMudGVtcG87XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFRFTVBPKHRlbXBvKVxyXG57XHJcbiAgcmV0dXJuIG5ldyBUZW1wbyh0ZW1wbyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIEVudmVsb3BlKGF0dGFjaywgZGVjYXksIHN1c3RhaW4sIHJlbGVhc2UpXHJcbntcclxuICB0aGlzLmF0dGFjayA9IGF0dGFjaztcclxuICB0aGlzLmRlY2F5ID0gZGVjYXk7XHJcbiAgdGhpcy5zdXN0YWluID0gc3VzdGFpbjtcclxuICB0aGlzLnJlbGVhc2UgPSByZWxlYXNlO1xyXG59XHJcblxyXG5FbnZlbG9wZS5wcm90b3R5cGUucHJvY2VzcyA9IGZ1bmN0aW9uKHRyYWNrKVxyXG57XHJcbiAgdmFyIGVudmVsb3BlID0gdHJhY2suYXVkaW8udm9pY2VzW3RyYWNrLmNoYW5uZWxdLmVudmVsb3BlO1xyXG4gIGVudmVsb3BlLmF0dGFjayA9IHRoaXMuYXR0YWNrO1xyXG4gIGVudmVsb3BlLmRlY2F5ID0gdGhpcy5kZWNheTtcclxuICBlbnZlbG9wZS5zdXN0YWluID0gdGhpcy5zdXN0YWluO1xyXG4gIGVudmVsb3BlLnJlbGVhc2UgPSB0aGlzLnJlbGVhc2U7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIEVOVihhdHRhY2ssZGVjYXksc3VzdGFpbiAscmVsZWFzZSlcclxue1xyXG4gIHJldHVybiBuZXcgRW52ZWxvcGUoYXR0YWNrLCBkZWNheSwgc3VzdGFpbiwgcmVsZWFzZSk7XHJcbn1cclxuXHJcbi8vLyDjg4fjg4Hjg6Xjg7zjg7NcclxuZnVuY3Rpb24gRGV0dW5lKGRldHVuZSlcclxue1xyXG4gIHRoaXMuZGV0dW5lID0gZGV0dW5lO1xyXG59XHJcblxyXG5EZXR1bmUucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbih0cmFjaylcclxue1xyXG4gIHZhciB2b2ljZSA9IHRyYWNrLmF1ZGlvLnZvaWNlc1t0cmFjay5jaGFubmVsXTtcclxuICB2b2ljZS5kZXR1bmUgPSB0aGlzLmRldHVuZTtcclxufVxyXG5cclxuZnVuY3Rpb24gREVUVU5FKGRldHVuZSlcclxue1xyXG4gIHJldHVybiBuZXcgRGV0dW5lKGRldHVuZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFZvbHVtZSh2b2x1bWUpXHJcbntcclxuICB0aGlzLnZvbHVtZSA9IHZvbHVtZTtcclxufVxyXG5cclxuVm9sdW1lLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24odHJhY2spXHJcbntcclxuICB0cmFjay5hdWRpby52b2ljZXNbdHJhY2suY2hhbm5lbF0udm9sdW1lLmdhaW4uc2V0VmFsdWVBdFRpbWUodGhpcy52b2x1bWUsIHRyYWNrLnBsYXlpbmdUaW1lKTtcclxufVxyXG5cclxuZnVuY3Rpb24gVk9MVU1FKHZvbHVtZSlcclxue1xyXG4gIHJldHVybiBuZXcgVm9sdW1lKHZvbHVtZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIExvb3BEYXRhKG9iaix2YXJuYW1lLCBjb3VudCxzZXFQb3MpXHJcbntcclxuICB0aGlzLnZhcm5hbWUgPSB2YXJuYW1lO1xyXG4gIHRoaXMuY291bnQgPSBjb3VudDtcclxuICB0aGlzLm9iaiA9IG9iajtcclxuICB0aGlzLnNlcVBvcyA9IHNlcVBvcztcclxufVxyXG5cclxuZnVuY3Rpb24gTG9vcCh2YXJuYW1lLCBjb3VudCkge1xyXG4gIHRoaXMubG9vcERhdGEgPSBuZXcgTG9vcERhdGEodGhpcyx2YXJuYW1lLGNvdW50LDApO1xyXG59XHJcblxyXG5Mb29wLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKHRyYWNrKVxyXG57XHJcbiAgdmFyIHN0YWNrID0gdHJhY2suc3RhY2s7XHJcbiAgaWYgKHN0YWNrLmxlbmd0aCA9PSAwIHx8IHN0YWNrW3N0YWNrLmxlbmd0aCAtIDFdLm9iaiAhPT0gdGhpcylcclxuICB7XHJcbiAgICB2YXIgbGQgPSB0aGlzLmxvb3BEYXRhO1xyXG4gICAgc3RhY2sucHVzaChuZXcgTG9vcERhdGEodGhpcywgbGQudmFybmFtZSwgbGQuY291bnQsIHRyYWNrLnNlcVBvcykpO1xyXG4gIH0gXHJcbn1cclxuXHJcbmZ1bmN0aW9uIExPT1AodmFybmFtZSwgY291bnQpIHtcclxuICByZXR1cm4gbmV3IExvb3AodmFybmFtZSxjb3VudCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIExvb3BFbmQoKVxyXG57XHJcbn1cclxuXHJcbkxvb3BFbmQucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbih0cmFjaylcclxue1xyXG4gIHZhciBsZCA9IHRyYWNrLnN0YWNrW3RyYWNrLnN0YWNrLmxlbmd0aCAtIDFdO1xyXG4gIGxkLmNvdW50LS07XHJcbiAgaWYgKGxkLmNvdW50ID4gMCkge1xyXG4gICAgdHJhY2suc2VxUG9zID0gbGQuc2VxUG9zO1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0cmFjay5zdGFjay5wb3AoKTtcclxuICB9XHJcbn1cclxuXHJcbnZhciBMT09QX0VORCA9IG5ldyBMb29wRW5kKCk7XHJcblxyXG4vLy8g44K344O844Kx44Oz44K144O844OI44Op44OD44KvXHJcbmZ1bmN0aW9uIFRyYWNrKHNlcXVlbmNlcixzZXFkYXRhLGF1ZGlvKVxyXG57XHJcbiAgdGhpcy5uYW1lID0gJyc7XHJcbiAgdGhpcy5lbmQgPSBmYWxzZTtcclxuICB0aGlzLm9uZXNob3QgPSBmYWxzZTtcclxuICB0aGlzLnNlcXVlbmNlciA9IHNlcXVlbmNlcjtcclxuICB0aGlzLnNlcURhdGEgPSBzZXFkYXRhO1xyXG4gIHRoaXMuc2VxUG9zID0gMDtcclxuICB0aGlzLm11dGUgPSBmYWxzZTtcclxuICB0aGlzLnBsYXlpbmdUaW1lID0gLTE7XHJcbiAgdGhpcy5sb2NhbFRlbXBvID0gc2VxdWVuY2VyLnRlbXBvO1xyXG4gIHRoaXMudHJhY2tWb2x1bWUgPSAxLjA7XHJcbiAgdGhpcy50cmFuc3Bvc2UgPSAwO1xyXG4gIHRoaXMuc29sbyA9IGZhbHNlO1xyXG4gIHRoaXMuY2hhbm5lbCA9IC0xO1xyXG4gIHRoaXMudHJhY2sgPSAtMTtcclxuICB0aGlzLmF1ZGlvID0gYXVkaW87XHJcbiAgdGhpcy5iYWNrID0ge1xyXG4gICAgbm90ZTogNzIsXHJcbiAgICBvY3Q6IDUsXHJcbiAgICBzdGVwOiA5NixcclxuICAgIGdhdGU6IDQ4LFxyXG4gICAgdmVsOjEuMFxyXG4gIH1cclxuICB0aGlzLnN0YWNrID0gW107XHJcbn1cclxuXHJcblRyYWNrLnByb3RvdHlwZSA9IHtcclxuICBwcm9jZXNzOiBmdW5jdGlvbiAoY3VycmVudFRpbWUpIHtcclxuXHJcbiAgICBpZiAodGhpcy5lbmQpIHJldHVybjtcclxuICAgIFxyXG4gICAgaWYgKHRoaXMub25lc2hvdCkge1xyXG4gICAgICB0aGlzLnJlc2V0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHNlcVNpemUgPSB0aGlzLnNlcURhdGEubGVuZ3RoO1xyXG4gICAgaWYgKHRoaXMuc2VxUG9zID49IHNlcVNpemUpIHtcclxuICAgICAgaWYodGhpcy5zZXF1ZW5jZXIucmVwZWF0KVxyXG4gICAgICB7XHJcbiAgICAgICAgdGhpcy5zZXFQb3MgPSAwO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZW5kID0gdHJ1ZTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgc2VxID0gdGhpcy5zZXFEYXRhO1xyXG4gICAgdGhpcy5wbGF5aW5nVGltZSA9ICh0aGlzLnBsYXlpbmdUaW1lID4gLTEpID8gdGhpcy5wbGF5aW5nVGltZSA6IGN1cnJlbnRUaW1lO1xyXG4gICAgdmFyIGVuZFRpbWUgPSBjdXJyZW50VGltZSArIDAuMi8qc2VjKi87XHJcblxyXG4gICAgd2hpbGUgKHRoaXMuc2VxUG9zIDwgc2VxU2l6ZSkge1xyXG4gICAgICBpZiAodGhpcy5wbGF5aW5nVGltZSA+PSBlbmRUaW1lICYmICF0aGlzLm9uZXNob3QpIHtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgZCA9IHNlcVt0aGlzLnNlcVBvc107XHJcbiAgICAgICAgZC5wcm9jZXNzKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuc2VxUG9zKys7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG4gIHJlc2V0OmZ1bmN0aW9uKClcclxuICB7XHJcbiAgICB2YXIgY3VyVm9pY2UgPSB0aGlzLmF1ZGlvLnZvaWNlc1t0aGlzLmNoYW5uZWxdO1xyXG4gICAgY3VyVm9pY2UuZ2Fpbi5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcygwKTtcclxuICAgIGN1clZvaWNlLnByb2Nlc3Nvci5wbGF5YmFja1JhdGUuY2FuY2VsU2NoZWR1bGVkVmFsdWVzKDApO1xyXG4gICAgY3VyVm9pY2UuZ2Fpbi5nYWluLnZhbHVlID0gMDtcclxuICAgIHRoaXMucGxheWluZ1RpbWUgPSAtMTtcclxuICAgIHRoaXMuc2VxUG9zID0gMDtcclxuICAgIHRoaXMuZW5kID0gZmFsc2U7XHJcbiAgfVxyXG5cclxufVxyXG5cclxuZnVuY3Rpb24gbG9hZFRyYWNrcyhzZWxmLHRyYWNrcywgdHJhY2tkYXRhKVxyXG57XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0cmFja2RhdGEubGVuZ3RoOyArK2kpIHtcclxuICAgIHZhciB0cmFjayA9IG5ldyBUcmFjayhzZWxmLCB0cmFja2RhdGFbaV0uZGF0YSxzZWxmLmF1ZGlvKTtcclxuICAgIHRyYWNrLmNoYW5uZWwgPSB0cmFja2RhdGFbaV0uY2hhbm5lbDtcclxuICAgIHRyYWNrLm9uZXNob3QgPSAoIXRyYWNrZGF0YVtpXS5vbmVzaG90KT9mYWxzZTp0cnVlO1xyXG4gICAgdHJhY2sudHJhY2sgPSBpO1xyXG4gICAgdHJhY2tzLnB1c2godHJhY2spO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlVHJhY2tzKHRyYWNrZGF0YSlcclxue1xyXG4gIHZhciB0cmFja3MgPSBbXTtcclxuICBsb2FkVHJhY2tzKHRoaXMsdHJhY2tzLCB0cmFja2RhdGEpO1xyXG4gIHJldHVybiB0cmFja3M7XHJcbn1cclxuXHJcbi8vLyDjgrfjg7zjgrHjg7PjgrXjg7zmnKzkvZNcclxuZXhwb3J0IGZ1bmN0aW9uIFNlcXVlbmNlcihhdWRpbykge1xyXG4gIHRoaXMuYXVkaW8gPSBhdWRpbztcclxuICB0aGlzLnRlbXBvID0gMTAwLjA7XHJcbiAgdGhpcy5yZXBlYXQgPSBmYWxzZTtcclxuICB0aGlzLnBsYXkgPSBmYWxzZTtcclxuICB0aGlzLnRyYWNrcyA9IFtdO1xyXG4gIHRoaXMucGF1c2VUaW1lID0gMDtcclxuICB0aGlzLnN0YXR1cyA9IHRoaXMuU1RPUDtcclxufVxyXG5cclxuU2VxdWVuY2VyLnByb3RvdHlwZSA9IHtcclxuICBsb2FkOiBmdW5jdGlvbihkYXRhKVxyXG4gIHtcclxuICAgIGlmKHRoaXMucGxheSkge1xyXG4gICAgICB0aGlzLnN0b3AoKTtcclxuICAgIH1cclxuICAgIHRoaXMudHJhY2tzLmxlbmd0aCA9IDA7XHJcbiAgICBsb2FkVHJhY2tzKHRoaXMsdGhpcy50cmFja3MsIGRhdGEudHJhY2tzLHRoaXMuYXVkaW8pO1xyXG4gIH0sXHJcbiAgc3RhcnQ6ZnVuY3Rpb24oKVxyXG4gIHtcclxuICAgIC8vICAgIHRoaXMuaGFuZGxlID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkgeyBzZWxmLnByb2Nlc3MoKSB9LCA1MCk7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuUExBWTtcclxuICAgIHRoaXMucHJvY2VzcygpO1xyXG4gIH0sXHJcbiAgcHJvY2VzczpmdW5jdGlvbigpXHJcbiAge1xyXG4gICAgaWYgKHRoaXMuc3RhdHVzID09IHRoaXMuUExBWSkge1xyXG4gICAgICB0aGlzLnBsYXlUcmFja3ModGhpcy50cmFja3MpO1xyXG4gICAgICB0aGlzLmhhbmRsZSA9IHdpbmRvdy5zZXRUaW1lb3V0KHRoaXMucHJvY2Vzcy5iaW5kKHRoaXMpLCAxMDApO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgcGxheVRyYWNrczogZnVuY3Rpb24gKHRyYWNrcyl7XHJcbiAgICB2YXIgY3VycmVudFRpbWUgPSB0aGlzLmF1ZGlvLmF1ZGlvY3R4LmN1cnJlbnRUaW1lO1xyXG4gLy8gICBjb25zb2xlLmxvZyh0aGlzLmF1ZGlvLmF1ZGlvY3R4LmN1cnJlbnRUaW1lKTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0cmFja3MubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgdHJhY2tzW2ldLnByb2Nlc3MoY3VycmVudFRpbWUpO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgcGF1c2U6ZnVuY3Rpb24oKVxyXG4gIHtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5QQVVTRTtcclxuICAgIHRoaXMucGF1c2VUaW1lID0gdGhpcy5hdWRpby5hdWRpb2N0eC5jdXJyZW50VGltZTtcclxuICB9LFxyXG4gIHJlc3VtZTpmdW5jdGlvbiAoKVxyXG4gIHtcclxuICAgIGlmICh0aGlzLnN0YXR1cyA9PSB0aGlzLlBBVVNFKSB7XHJcbiAgICAgIHRoaXMuc3RhdHVzID0gdGhpcy5QTEFZO1xyXG4gICAgICB2YXIgdHJhY2tzID0gdGhpcy50cmFja3M7XHJcbiAgICAgIHZhciBhZGp1c3QgPSB0aGlzLmF1ZGlvLmF1ZGlvY3R4LmN1cnJlbnRUaW1lIC0gdGhpcy5wYXVzZVRpbWU7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0cmFja3MubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgICB0cmFja3NbaV0ucGxheWluZ1RpbWUgKz0gYWRqdXN0O1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMucHJvY2VzcygpO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgc3RvcDogZnVuY3Rpb24gKClcclxuICB7XHJcbiAgICBpZiAodGhpcy5zdGF0dXMgIT0gdGhpcy5TVE9QKSB7XHJcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLmhhbmRsZSk7XHJcbiAgICAgIC8vICAgIGNsZWFySW50ZXJ2YWwodGhpcy5oYW5kbGUpO1xyXG4gICAgICB0aGlzLnN0YXR1cyA9IHRoaXMuU1RPUDtcclxuICAgICAgdGhpcy5yZXNldCgpO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgcmVzZXQ6ZnVuY3Rpb24oKVxyXG4gIHtcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0aGlzLnRyYWNrcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSlcclxuICAgIHtcclxuICAgICAgdGhpcy50cmFja3NbaV0ucmVzZXQoKTtcclxuICAgIH1cclxuICB9LFxyXG4gIFNUT1A6IDAgfCAwLFxyXG4gIFBMQVk6IDEgfCAwLFxyXG4gIFBBVVNFOjIgfCAwXHJcbn1cclxuXHJcbi8vLyDnsKHmmJPpjbXnm6Tjga7lrp/oo4VcclxuZnVuY3Rpb24gUGlhbm8oYXVkaW8pIHtcclxuICB0aGlzLmF1ZGlvID0gYXVkaW87XHJcbiAgdGhpcy50YWJsZSA9IFs5MCwgODMsIDg4LCA2OCwgNjcsIDg2LCA3MSwgNjYsIDcyLCA3OCwgNzQsIDc3LCAxODhdO1xyXG4gIHRoaXMua2V5b24gPSBuZXcgQXJyYXkoMTMpO1xyXG59XHJcblxyXG5QaWFuby5wcm90b3R5cGUgPSB7XHJcbiAgb246IGZ1bmN0aW9uIChlKSB7XHJcbiAgICB2YXIgaW5kZXggPSB0aGlzLnRhYmxlLmluZGV4T2YoZS5rZXlDb2RlLCAwKTtcclxuICAgIGlmIChpbmRleCA9PSAtMSkge1xyXG4gICAgICBpZiAoZS5rZXlDb2RlID4gNDggJiYgZS5rZXlDb2RlIDwgNTcpIHtcclxuICAgICAgICB2YXIgdGltYnJlID0gZS5rZXlDb2RlIC0gNDk7XHJcbiAgICAgICAgdGhpcy5hdWRpby52b2ljZXNbN10uc2V0U2FtcGxlKHdhdmVTYW1wbGVzW3RpbWJyZV0pO1xyXG4gICAgICAgIHdhdmVHcmFwaC53YXZlID0gd2F2ZXNbdGltYnJlXTtcclxuICAgICAgICB3YXZlR3JhcGgucmVuZGVyKCk7XHJcbiAgICAgICAgdGV4dFBsYW5lLnByaW50KDUsIDEwLCBcIldhdmUgXCIgKyAodGltYnJlICsgMSkpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy9hdWRpby52b2ljZXNbMF0ucHJvY2Vzc29yLnBsYXliYWNrUmF0ZS52YWx1ZSA9IHNlcXVlbmNlci5ub3RlRnJlcVtdO1xyXG4gICAgICBpZiAoIXRoaXMua2V5b25baW5kZXhdKSB7XHJcbiAgICAgICAgdGhpcy5hdWRpby52b2ljZXNbN10ua2V5b24oMCxpbmRleCArIChlLnNoaWZ0S2V5ID8gODQgOiA3MiksMS4wKTtcclxuICAgICAgICB0aGlzLmtleW9uW2luZGV4XSA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICB9LFxyXG4gIG9mZjogZnVuY3Rpb24gKGUpIHtcclxuICAgIHZhciBpbmRleCA9IHRoaXMudGFibGUuaW5kZXhPZihlLmtleUNvZGUsIDApO1xyXG4gICAgaWYgKGluZGV4ID09IC0xKSB7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKHRoaXMua2V5b25baW5kZXhdKSB7XHJcbiAgICAgICAgYXVkaW8udm9pY2VzWzddLmVudmVsb3BlLmtleW9mZigwKTtcclxuICAgICAgICB0aGlzLmtleW9uW2luZGV4XSA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgc2VxRGF0YSA9IHtcclxuICBuYW1lOiAnVGVzdCcsXHJcbiAgdHJhY2tzOiBbXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6ICdwYXJ0MScsXHJcbiAgICAgIGNoYW5uZWw6IDAsXHJcbiAgICAgIGRhdGE6XHJcbiAgICAgIFtcclxuICAgICAgICBFTlYoMC4wMSwgMC4wMiwgMC41LCAwLjA3KSxcclxuICAgICAgICBURU1QTygxODApLCBUT05FKDApLCBWT0xVTUUoMC41KSwgTCg4KSwgR1QoLTAuNSksTyg0KSxcclxuICAgICAgICBMT09QKCdpJyw0KSxcclxuICAgICAgICBDLCBDLCBDLCBDLCBDLCBDLCBDLCBDLFxyXG4gICAgICAgIExPT1BfRU5ELFxyXG4gICAgICAgIEpVTVAoNSlcclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgbmFtZTogJ3BhcnQyJyxcclxuICAgICAgY2hhbm5lbDogMSxcclxuICAgICAgZGF0YTpcclxuICAgICAgICBbXHJcbiAgICAgICAgRU5WKDAuMDEsIDAuMDUsIDAuNiwgMC4wNyksXHJcbiAgICAgICAgVEVNUE8oMTgwKSxUT05FKDYpLCBWT0xVTUUoMC4yKSwgTCg4KSwgR1QoLTAuOCksXHJcbiAgICAgICAgUigxKSwgUigxKSxcclxuICAgICAgICBPKDYpLEwoMSksIEYsXHJcbiAgICAgICAgRSxcclxuICAgICAgICBPRCwgTCg4LCB0cnVlKSwgQmIsIEcsIEwoNCksIEJiLCBPVSwgTCg0KSwgRiwgTCg4KSwgRCxcclxuICAgICAgICBMKDQsIHRydWUpLCBFLCBMKDIpLCBDLFIoOCksXHJcbiAgICAgICAgSlVNUCg4KVxyXG4gICAgICAgIF1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6ICdwYXJ0MycsXHJcbiAgICAgIGNoYW5uZWw6IDIsXHJcbiAgICAgIGRhdGE6XHJcbiAgICAgICAgW1xyXG4gICAgICAgIEVOVigwLjAxLCAwLjA1LCAwLjYsIDAuMDcpLFxyXG4gICAgICAgIFRFTVBPKDE4MCksVE9ORSg2KSwgVk9MVU1FKDAuMSksIEwoOCksIEdUKC0wLjUpLCBcclxuICAgICAgICBSKDEpLCBSKDEpLFxyXG4gICAgICAgIE8oNiksTCgxKSwgQyxDLFxyXG4gICAgICAgIE9ELCBMKDgsIHRydWUpLCBHLCBELCBMKDQpLCBHLCBPVSwgTCg0KSwgRCwgTCg4KSxPRCwgRyxcclxuICAgICAgICBMKDQsIHRydWUpLCBPVSxDLCBMKDIpLE9ELCBHLCBSKDgpLFxyXG4gICAgICAgIEpVTVAoNylcclxuICAgICAgICBdXHJcbiAgICB9XHJcbiAgXVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gU291bmRFZmZlY3RzKHNlcXVlbmNlcikge1xyXG4gICB0aGlzLnNvdW5kRWZmZWN0cyA9XHJcbiAgICBbXHJcbiAgICAvLyBFZmZlY3QgMCAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgIGNyZWF0ZVRyYWNrcy5jYWxsKHNlcXVlbmNlcixbXHJcbiAgICB7XHJcbiAgICAgIGNoYW5uZWw6IDgsXHJcbiAgICAgIG9uZXNob3Q6dHJ1ZSxcclxuICAgICAgZGF0YTogW1ZPTFVNRSgwLjUpLFxyXG4gICAgICAgIEVOVigwLjAwMDEsIDAuMDEsIDEuMCwgMC4wMDAxKSxHVCgtMC45OTkpLFRPTkUoMCksIFRFTVBPKDIwMCksIE8oOCksU1QoMyksIEMsIEQsIEUsIEYsIEcsIEEsIEIsIE9VLCBDLCBELCBFLCBHLCBBLCBCLEIsQixCXHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGNoYW5uZWw6IDksXHJcbiAgICAgIG9uZXNob3Q6IHRydWUsXHJcbiAgICAgIGRhdGE6IFtWT0xVTUUoMC41KSxcclxuICAgICAgICBFTlYoMC4wMDAxLCAwLjAxLCAxLjAsIDAuMDAwMSksIERFVFVORSgwLjkpLCBHVCgtMC45OTkpLCBUT05FKDApLCBURU1QTygyMDApLCBPKDUpLCBTVCgzKSwgQywgRCwgRSwgRiwgRywgQSwgQiwgT1UsIEMsIEQsIEUsIEcsIEEsIEIsQixCLEJcclxuICAgICAgXVxyXG4gICAgfVxyXG4gICAgXSksXHJcbiAgICAvLyBFZmZlY3QgMSAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICBjcmVhdGVUcmFja3MuY2FsbChzZXF1ZW5jZXIsXHJcbiAgICAgIFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBjaGFubmVsOiAxMCxcclxuICAgICAgICAgIG9uZXNob3Q6IHRydWUsXHJcbiAgICAgICAgICBkYXRhOiBbXHJcbiAgICAgICAgICAgVE9ORSg0KSwgVEVNUE8oMTUwKSwgU1QoNCksIEdUKC0wLjk5OTkpLCBFTlYoMC4wMDAxLCAwLjAwMDEsIDEuMCwgMC4wMDAxKSxcclxuICAgICAgICAgICBPKDYpLCBHLCBBLCBCLCBPKDcpLCBCLCBBLCBHLCBGLCBFLCBELCBDLCBFLCBHLCBBLCBCLCBPRCwgQiwgQSwgRywgRiwgRSwgRCwgQywgT0QsIEIsIEEsIEcsIEYsIEUsIEQsIENcclxuICAgICAgICAgIF1cclxuICAgICAgICB9XHJcbiAgICAgIF0pLFxyXG4gICAgLy8gRWZmZWN0IDIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgY3JlYXRlVHJhY2tzLmNhbGwoc2VxdWVuY2VyLFxyXG4gICAgICBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgY2hhbm5lbDogMTAsXHJcbiAgICAgICAgICBvbmVzaG90OiB0cnVlLFxyXG4gICAgICAgICAgZGF0YTogW1xyXG4gICAgICAgICAgIFRPTkUoMCksIFRFTVBPKDE1MCksIFNUKDIpLCBHVCgtMC45OTk5KSwgRU5WKDAuMDAwMSwgMC4wMDAxLCAxLjAsIDAuMDAwMSksXHJcbiAgICAgICAgICAgTyg4KSwgQyxELEUsRixHLEEsQixPVSxDLEQsRSxGLE9ELEcsT1UsQSxPRCxCLE9VLEEsT0QsRyxPVSxGLE9ELEUsT1UsRVxyXG4gICAgICAgICAgXVxyXG4gICAgICAgIH1cclxuICAgICAgXSksXHJcbiAgICAgIC8vIEVmZmVjdCAzIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgICBjcmVhdGVUcmFja3MuY2FsbChzZXF1ZW5jZXIsXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBjaGFubmVsOiAxMCxcclxuICAgICAgICAgICAgb25lc2hvdDogdHJ1ZSxcclxuICAgICAgICAgICAgZGF0YTogW1xyXG4gICAgICAgICAgICAgVE9ORSg1KSwgVEVNUE8oMTUwKSwgTCg2NCksIEdUKC0wLjk5OTkpLCBFTlYoMC4wMDAxLCAwLjAwMDEsIDEuMCwgMC4wMDAxKSxcclxuICAgICAgICAgICAgIE8oNiksQyxPRCxDLE9VLEMsT0QsQyxPVSxDLE9ELEMsT1UsQyxPRFxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgXSksXHJcbiAgICAgIC8vIEVmZmVjdCA0IC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgICAgY3JlYXRlVHJhY2tzLmNhbGwoc2VxdWVuY2VyLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgY2hhbm5lbDogMTEsXHJcbiAgICAgICAgICAgIG9uZXNob3Q6IHRydWUsXHJcbiAgICAgICAgICAgIGRhdGE6IFtcclxuICAgICAgICAgICAgIFRPTkUoOCksIFZPTFVNRSgyLjApLFRFTVBPKDEyMCksIEwoMiksIEdUKC0wLjk5OTkpLCBFTlYoMC4wMDAxLCAwLjAwMDEsIDEuMCwgMC4yNSksXHJcbiAgICAgICAgICAgICBPKDEpLCBDXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICAgIH1cclxuICAgICAgICBdKVxyXG4gICBdO1xyXG4gfVxyXG5cclxuXHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBDb21tIHtcclxuICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgdmFyIGhvc3QgPSB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUubWF0Y2goL3d3d1xcLnNmcGdtclxcLm5ldC9pZyk/J3d3dy5zZnBnbXIubmV0JzonbG9jYWxob3N0JztcclxuICAgIHRoaXMuZW5hYmxlID0gZmFsc2U7XHJcbiAgICB0cnkge1xyXG4gICAgICB0aGlzLnNvY2tldCA9IGlvLmNvbm5lY3QoJ2h0dHA6Ly8nICsgaG9zdCArICc6ODA4MS90ZXN0Jyk7XHJcbiAgICAgIHRoaXMuZW5hYmxlID0gdHJ1ZTtcclxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICB0aGlzLnNvY2tldC5vbignc2VuZEhpZ2hTY29yZXMnLCAoZGF0YSk9PntcclxuICAgICAgICBpZih0aGlzLnVwZGF0ZUhpZ2hTY29yZXMpe1xyXG4gICAgICAgICAgdGhpcy51cGRhdGVIaWdoU2NvcmVzKGRhdGEpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIHRoaXMuc29ja2V0Lm9uKCdzZW5kSGlnaFNjb3JlJywgKGRhdGEpPT57XHJcbiAgICAgICAgdGhpcy51cGRhdGVIaWdoU2NvcmUoZGF0YSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdGhpcy5zb2NrZXQub24oJ3NlbmRSYW5rJywgKGRhdGEpID0+IHtcclxuICAgICAgICB0aGlzLnVwZGF0ZUhpZ2hTY29yZXMoZGF0YS5oaWdoU2NvcmVzKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLnNvY2tldC5vbignZXJyb3JDb25uZWN0aW9uTWF4JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGFsZXJ0KCflkIzmmYLmjqXntprjga7kuIrpmZDjgavpgZTjgZfjgb7jgZfjgZ/jgIInKTtcclxuICAgICAgICBzZWxmLmVuYWJsZSA9IGZhbHNlO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMuc29ja2V0Lm9uKCdkaXNjb25uZWN0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmIChzZWxmLmVuYWJsZSkge1xyXG4gICAgICAgICAgc2VsZi5lbmFibGUgPSBmYWxzZTtcclxuICAgICAgICAgIGFsZXJ0KCfjgrXjg7zjg5Djg7zmjqXntprjgYzliIfmlq3jgZXjgozjgb7jgZfjgZ/jgIInKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgYWxlcnQoJ1NvY2tldC5JT+OBjOWIqeeUqOOBp+OBjeOBquOBhOOBn+OCgeOAgeODj+OCpOOCueOCs+OCouaDheWgseOBjOWPluW+l+OBp+OBjeOBvuOBm+OCk+OAgicgKyBlKTtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgc2VuZFNjb3JlKHNjb3JlKVxyXG4gIHtcclxuICAgIGlmICh0aGlzLmVuYWJsZSkge1xyXG4gICAgICB0aGlzLnNvY2tldC5lbWl0KCdzZW5kU2NvcmUnLCBzY29yZSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIGRpc2Nvbm5lY3QoKVxyXG4gIHtcclxuICAgIGlmICh0aGlzLmVuYWJsZSkge1xyXG4gICAgICB0aGlzLmVuYWJsZSA9IGZhbHNlO1xyXG4gICAgICB0aGlzLnNvY2tldC5kaXNjb25uZWN0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgKiBhcyBzZmcgZnJvbSAnLi9nbG9iYWwnO1xyXG5pbXBvcnQgKiAgYXMgZ2FtZW9iaiBmcm9tICcuL2dhbWVvYmonO1xyXG5pbXBvcnQgKiBhcyBncmFwaGljcyBmcm9tICcuL2dyYXBoaWNzJztcclxuXHJcblxyXG4vLy8g54iG55m6XHJcbmV4cG9ydCBjbGFzcyBCb21iIGV4dGVuZHMgZ2FtZW9iai5HYW1lT2JqIFxyXG57XHJcbiAgY29uc3RydWN0b3Ioc2NlbmUsc2UpIHtcclxuICAgIHN1cGVyKDAsMCwwKTtcclxuICAgIHZhciB0ZXggPSBzZmcudGV4dHVyZUZpbGVzLmJvbWI7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVNYXRlcmlhbCh0ZXgpO1xyXG4gICAgbWF0ZXJpYWwuYmxlbmRpbmcgPSBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nO1xyXG4gICAgbWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gZ3JhcGhpY3MuY3JlYXRlU3ByaXRlR2VvbWV0cnkoMTYpO1xyXG4gICAgZ3JhcGhpY3MuY3JlYXRlU3ByaXRlVVYoZ2VvbWV0cnksIHRleCwgMTYsIDE2LCAwKTtcclxuICAgIHRoaXMubWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgICB0aGlzLm1lc2gucG9zaXRpb24ueiA9IDAuMTtcclxuICAgIHRoaXMuaW5kZXggPSAwO1xyXG4gICAgdGhpcy5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxuICAgIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuICAgIHRoaXMuc2UgPSBzZTtcclxuICAgIHNjZW5lLmFkZCh0aGlzLm1lc2gpO1xyXG4gIH1cclxuICBnZXQgeCgpIHsgcmV0dXJuIHRoaXMueF87IH1cclxuICBzZXQgeCh2KSB7IHRoaXMueF8gPSB0aGlzLm1lc2gucG9zaXRpb24ueCA9IHY7IH1cclxuICBnZXQgeSgpIHsgcmV0dXJuIHRoaXMueV87IH1cclxuICBzZXQgeSh2KSB7IHRoaXMueV8gPSB0aGlzLm1lc2gucG9zaXRpb24ueSA9IHY7IH1cclxuICBnZXQgeigpIHsgcmV0dXJuIHRoaXMuel87IH1cclxuICBzZXQgeih2KSB7IHRoaXMuel8gPSB0aGlzLm1lc2gucG9zaXRpb24ueiA9IHY7IH1cclxuICBcclxuICBzdGFydCh4LCB5LCB6LCBkZWxheSkge1xyXG4gICAgaWYgKHRoaXMuZW5hYmxlXykge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB0aGlzLmRlbGF5ID0gZGVsYXkgfCAwO1xyXG4gICAgdGhpcy54ID0geDtcclxuICAgIHRoaXMueSA9IHk7XHJcbiAgICB0aGlzLnogPSB6IHwgMC4wMDAwMjtcclxuICAgIHRoaXMuZW5hYmxlXyA9IHRydWU7XHJcbiAgICBncmFwaGljcy51cGRhdGVTcHJpdGVVVih0aGlzLm1lc2guZ2VvbWV0cnksIHNmZy50ZXh0dXJlRmlsZXMuYm9tYiwgMTYsIDE2LCB0aGlzLmluZGV4KTtcclxuICAgIHRoaXMudGFzayA9IHNmZy50YXNrcy5wdXNoVGFzayh0aGlzLm1vdmUuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLm1lc2gubWF0ZXJpYWwub3BhY2l0eSA9IDEuMDtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuICBcclxuICAqbW92ZSh0YXNrSW5kZXgpIHtcclxuICAgIFxyXG4gICAgZm9yKCBsZXQgaSA9IDAsZSA9IHRoaXMuZGVsYXk7aSA8IGUgJiYgdGFza0luZGV4ID49IDA7KytpKVxyXG4gICAge1xyXG4gICAgICB0YXNrSW5kZXggPSB5aWVsZDsgICAgICBcclxuICAgIH1cclxuICAgIHRoaXMubWVzaC52aXNpYmxlID0gdHJ1ZTtcclxuXHJcbiAgICBmb3IobGV0IGkgPSAwO2kgPCA3ICYmIHRhc2tJbmRleCA+PSAwOysraSlcclxuICAgIHtcclxuICAgICAgZ3JhcGhpY3MudXBkYXRlU3ByaXRlVVYodGhpcy5tZXNoLmdlb21ldHJ5LCBzZmcudGV4dHVyZUZpbGVzLmJvbWIsIDE2LCAxNiwgaSk7XHJcbiAgICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICB0aGlzLmVuYWJsZV8gPSBmYWxzZTtcclxuICAgIHRoaXMubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICBzZmcudGFza3MucmVtb3ZlVGFzayh0YXNrSW5kZXgpO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEJvbWJzIHtcclxuICBjb25zdHJ1Y3RvcihzY2VuZSwgc2UpIHtcclxuICAgIHRoaXMuYm9tYnMgPSBuZXcgQXJyYXkoMCk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDMyOyArK2kpIHtcclxuICAgICAgdGhpcy5ib21icy5wdXNoKG5ldyBCb21iKHNjZW5lLCBzZSkpO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBzdGFydCh4LCB5LCB6KSB7XHJcbiAgICB2YXIgYm9tcyA9IHRoaXMuYm9tYnM7XHJcbiAgICB2YXIgY291bnQgPSAzO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IGJvbXMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgaWYgKCFib21zW2ldLmVuYWJsZV8pIHtcclxuICAgICAgICBpZiAoY291bnQgPT0gMikge1xyXG4gICAgICAgICAgYm9tc1tpXS5zdGFydCh4LCB5LCB6LCAwKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgYm9tc1tpXS5zdGFydCh4ICsgKE1hdGgucmFuZG9tKCkgKiAxNiAtIDgpLCB5ICsgKE1hdGgucmFuZG9tKCkgKiAxNiAtIDgpLCB6LCBNYXRoLnJhbmRvbSgpICogOCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvdW50LS07XHJcbiAgICAgICAgaWYgKCFjb3VudCkgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJlc2V0KCl7XHJcbiAgICB0aGlzLmJvbWJzLmZvckVhY2goKGQpPT57XHJcbiAgICAgIGlmKGQuZW5hYmxlXyl7XHJcbiAgICAgICAgd2hpbGUoIXNmZy50YXNrcy5hcnJheVtkLnRhc2suaW5kZXhdLmdlbkluc3QubmV4dCgtKDErZC50YXNrLmluZGV4KSkuZG9uZSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmltcG9ydCAqICBhcyBnYW1lb2JqIGZyb20gJy4vZ2FtZW9iaic7XHJcbmltcG9ydCAqIGFzIHNmZyBmcm9tICcuL2dsb2JhbCc7XHJcbmltcG9ydCAqIGFzIGdyYXBoaWNzIGZyb20gJy4vZ3JhcGhpY3MnO1xyXG5cclxuLy8vIOaVteW8vlxyXG5leHBvcnQgY2xhc3MgRW5lbXlCdWxsZXQgZXh0ZW5kcyBnYW1lb2JqLkdhbWVPYmoge1xyXG4gIGNvbnN0cnVjdG9yKHNjZW5lLCBzZSkge1xyXG4gICAgc3VwZXIoMCwgMCwgMCk7XHJcbiAgICB0aGlzLk5PTkUgPSAwO1xyXG4gICAgdGhpcy5NT1ZFID0gMTtcclxuICAgIHRoaXMuQk9NQiA9IDI7XHJcbiAgICB0aGlzLmNvbGxpc2lvbkFyZWEud2lkdGggPSAyO1xyXG4gICAgdGhpcy5jb2xsaXNpb25BcmVhLmhlaWdodCA9IDI7XHJcbiAgICB2YXIgdGV4ID0gc2ZnLnRleHR1cmVGaWxlcy5lbmVteTtcclxuICAgIHZhciBtYXRlcmlhbCA9IGdyYXBoaWNzLmNyZWF0ZVNwcml0ZU1hdGVyaWFsKHRleCk7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVHZW9tZXRyeSgxNik7XHJcbiAgICBncmFwaGljcy5jcmVhdGVTcHJpdGVVVihnZW9tZXRyeSwgdGV4LCAxNiwgMTYsIDApO1xyXG4gICAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICAgIHRoaXMueiA9IDAuMDtcclxuICAgIHRoaXMubXZQYXR0ZXJuID0gbnVsbDtcclxuICAgIHRoaXMubXYgPSBudWxsO1xyXG4gICAgdGhpcy5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxuICAgIHRoaXMudHlwZSA9IG51bGw7XHJcbiAgICB0aGlzLmxpZmUgPSAwO1xyXG4gICAgdGhpcy5keCA9IDA7XHJcbiAgICB0aGlzLmR5ID0gMDtcclxuICAgIHRoaXMuc3BlZWQgPSAyLjA7XHJcbiAgICB0aGlzLmVuYWJsZSA9IGZhbHNlO1xyXG4gICAgdGhpcy5oaXRfID0gbnVsbDtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5OT05FO1xyXG4gICAgdGhpcy5zY2VuZSA9IHNjZW5lO1xyXG4gICAgc2NlbmUuYWRkKHRoaXMubWVzaCk7XHJcbiAgICB0aGlzLnNlID0gc2U7XHJcbiAgfVxyXG5cclxuICBnZXQgeCgpIHsgcmV0dXJuIHRoaXMueF87IH1cclxuICBzZXQgeCh2KSB7IHRoaXMueF8gPSB0aGlzLm1lc2gucG9zaXRpb24ueCA9IHY7IH1cclxuICBnZXQgeSgpIHsgcmV0dXJuIHRoaXMueV87IH1cclxuICBzZXQgeSh2KSB7IHRoaXMueV8gPSB0aGlzLm1lc2gucG9zaXRpb24ueSA9IHY7IH1cclxuICBnZXQgeigpIHsgcmV0dXJuIHRoaXMuel87IH1cclxuICBzZXQgeih2KSB7IHRoaXMuel8gPSB0aGlzLm1lc2gucG9zaXRpb24ueiA9IHY7IH1cclxuICBnZXQgZW5hYmxlKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZW5hYmxlXztcclxuICB9XHJcbiAgXHJcbiAgc2V0IGVuYWJsZSh2KSB7XHJcbiAgICB0aGlzLmVuYWJsZV8gPSB2O1xyXG4gICAgdGhpcy5tZXNoLnZpc2libGUgPSB2O1xyXG4gIH1cclxuICBcclxuICAqbW92ZSh0YXNrSW5kZXgpIHtcclxuICAgIGZvcig7dGhpcy54ID49IChzZmcuVl9MRUZUIC0gMTYpICYmXHJcbiAgICAgICAgdGhpcy54IDw9IChzZmcuVl9SSUdIVCArIDE2KSAmJlxyXG4gICAgICAgIHRoaXMueSA+PSAoc2ZnLlZfQk9UVE9NIC0gMTYpICYmXHJcbiAgICAgICAgdGhpcy55IDw9IChzZmcuVl9UT1AgKyAxNikgJiYgdGFza0luZGV4ID49IDA7XHJcbiAgICAgICAgdGhpcy54ICs9IHRoaXMuZHgsdGhpcy55ICs9IHRoaXMuZHkpXHJcbiAgICB7XHJcbiAgICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpZih0YXNrSW5kZXggPj0gMCl7XHJcbiAgICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gICAgfVxyXG4gICAgdGhpcy5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5OT05FO1xyXG4gICAgdGhpcy5lbmFibGUgPSBmYWxzZTtcclxuICAgIHNmZy50YXNrcy5yZW1vdmVUYXNrKHRhc2tJbmRleCk7XHJcbiAgfVxyXG4gICBcclxuICBzdGFydCh4LCB5LCB6KSB7XHJcbiAgICBpZiAodGhpcy5lbmFibGUpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgdGhpcy54ID0geCB8fCAwO1xyXG4gICAgdGhpcy55ID0geSB8fCAwO1xyXG4gICAgdGhpcy56ID0geiB8fCAwO1xyXG4gICAgdGhpcy5lbmFibGUgPSB0cnVlO1xyXG4gICAgaWYgKHRoaXMuc3RhdHVzICE9IHRoaXMuTk9ORSlcclxuICAgIHtcclxuICAgICAgZGVidWdnZXI7XHJcbiAgICB9XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuTU9WRTtcclxuICAgIHZhciBhaW1SYWRpYW4gPSBNYXRoLmF0YW4yKHNmZy5teXNoaXBfLnkgLSB5LCBzZmcubXlzaGlwXy54IC0geCk7XHJcbiAgICB0aGlzLm1lc2gucm90YXRpb24ueiA9IGFpbVJhZGlhbjtcclxuICAgIHRoaXMuZHggPSBNYXRoLmNvcyhhaW1SYWRpYW4pICogKHRoaXMuc3BlZWQgKyBzZmcuc3RhZ2UuZGlmZmljdWx0eSk7XHJcbiAgICB0aGlzLmR5ID0gTWF0aC5zaW4oYWltUmFkaWFuKSAqICh0aGlzLnNwZWVkICsgc2ZnLnN0YWdlLmRpZmZpY3VsdHkpO1xyXG4vLyAgICBjb25zb2xlLmxvZygnZHg6JyArIHRoaXMuZHggKyAnIGR5OicgKyB0aGlzLmR5KTtcclxuXHJcbiAgICB0aGlzLnRhc2sgPSBzZmcudGFza3MucHVzaFRhc2sodGhpcy5tb3ZlLmJpbmQodGhpcykpO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG4gXHJcbiAgaGl0KCkge1xyXG4gICAgdGhpcy5lbmFibGUgPSBmYWxzZTtcclxuICAgIHNmZy50YXNrcy5yZW1vdmVUYXNrKHRoaXMudGFzay5pbmRleCk7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuTk9ORTtcclxuICB9XHJcbn1cclxuXHJcblxyXG5leHBvcnQgY2xhc3MgRW5lbXlCdWxsZXRzIHtcclxuICBjb25zdHJ1Y3RvcihzY2VuZSwgc2UpIHtcclxuICAgIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuICAgIHRoaXMuZW5lbXlCdWxsZXRzID0gW107XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDQ4OyArK2kpIHtcclxuICAgICAgdGhpcy5lbmVteUJ1bGxldHMucHVzaChuZXcgRW5lbXlCdWxsZXQodGhpcy5zY2VuZSwgc2UpKTtcclxuICAgIH1cclxuICB9XHJcbiAgc3RhcnQoeCwgeSwgeikge1xyXG4gICAgdmFyIGVicyA9IHRoaXMuZW5lbXlCdWxsZXRzO1xyXG4gICAgZm9yKHZhciBpID0gMCxlbmQgPSBlYnMubGVuZ3RoO2k8IGVuZDsrK2kpe1xyXG4gICAgICBpZighZWJzW2ldLmVuYWJsZSl7XHJcbiAgICAgICAgZWJzW2ldLnN0YXJ0KHgsIHksIHopO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIHJlc2V0KClcclxuICB7XHJcbiAgICB0aGlzLmVuZW15QnVsbGV0cy5mb3JFYWNoKChkLGkpPT57XHJcbiAgICAgIGlmKGQuZW5hYmxlKXtcclxuICAgICAgICB3aGlsZSghc2ZnLnRhc2tzLmFycmF5W2QudGFzay5pbmRleF0uZ2VuSW5zdC5uZXh0KC0oMSArIGQudGFzay5pbmRleCkpLmRvbmUpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDmlbXjgq3jg6Pjg6njga7li5XjgY0gLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4vLy8g55u057ea6YGL5YuVXHJcbmNsYXNzIExpbmVNb3ZlIHtcclxuICBjb25zdHJ1Y3RvcihyYWQsIHNwZWVkLCBzdGVwKSB7XHJcbiAgICB0aGlzLnJhZCA9IHJhZDtcclxuICAgIHRoaXMuc3BlZWQgPSBzcGVlZDtcclxuICAgIHRoaXMuc3RlcCA9IHN0ZXA7XHJcbiAgICB0aGlzLmN1cnJlbnRTdGVwID0gc3RlcDtcclxuICAgIHRoaXMuZHggPSBNYXRoLmNvcyhyYWQpICogc3BlZWQ7XHJcbiAgICB0aGlzLmR5ID0gTWF0aC5zaW4ocmFkKSAqIHNwZWVkO1xyXG4gIH1cclxuICBcclxuICAqbW92ZShzZWxmLHgseSkgXHJcbiAge1xyXG4gICAgXHJcbiAgICBpZiAoc2VsZi54cmV2KSB7XHJcbiAgICAgIHNlbGYuY2hhclJhZCA9IE1hdGguUEkgLSAodGhpcy5yYWQgLSBNYXRoLlBJIC8gMik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzZWxmLmNoYXJSYWQgPSB0aGlzLnJhZCAtIE1hdGguUEkgLyAyO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsZXQgZHkgPSB0aGlzLmR5O1xyXG4gICAgbGV0IGR4ID0gdGhpcy5keDtcclxuICAgIGNvbnN0IHN0ZXAgPSB0aGlzLnN0ZXA7XHJcbiAgICBcclxuICAgIGlmKHNlbGYueHJldil7XHJcbiAgICAgIGR4ID0gLWR4OyAgICAgIFxyXG4gICAgfVxyXG4gICAgbGV0IGNhbmNlbCA9IGZhbHNlO1xyXG4gICAgZm9yKGxldCBpID0gMDtpIDwgc3RlcCAmJiAhY2FuY2VsOysraSl7XHJcbiAgICAgIHNlbGYueCArPSBkeDtcclxuICAgICAgc2VsZi55ICs9IGR5O1xyXG4gICAgICBjYW5jZWwgPSB5aWVsZDtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgdG9KU09OKCl7XHJcbiAgICByZXR1cm4gW1xyXG4gICAgICBcIkxpbmVNb3ZlXCIsXHJcbiAgICAgIHRoaXMucmFkLFxyXG4gICAgICB0aGlzLnNwZWVkLFxyXG4gICAgICB0aGlzLnN0ZXBcclxuICAgIF07XHJcbiAgfVxyXG4gIFxyXG4gIHN0YXRpYyBmcm9tQXJyYXkoYXJyYXkpXHJcbiAge1xyXG4gICAgcmV0dXJuIG5ldyBMaW5lTW92ZShhcnJheVsxXSxhcnJheVsyXSxhcnJheVszXSk7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g5YaG6YGL5YuVXHJcbmNsYXNzIENpcmNsZU1vdmUge1xyXG4gIGNvbnN0cnVjdG9yKHN0YXJ0UmFkLCBzdG9wUmFkLCByLCBzcGVlZCwgbGVmdCkge1xyXG4gICAgdGhpcy5zdGFydFJhZCA9IChzdGFydFJhZCB8fCAwKTtcclxuICAgIHRoaXMuc3RvcFJhZCA9ICAoc3RvcFJhZCB8fCAxLjApO1xyXG4gICAgdGhpcy5yID0gciB8fCAxMDA7XHJcbiAgICB0aGlzLnNwZWVkID0gc3BlZWQgfHwgMS4wO1xyXG4gICAgdGhpcy5sZWZ0ID0gIWxlZnQgPyBmYWxzZSA6IHRydWU7XHJcbiAgICB0aGlzLmRlbHRhcyA9IFtdO1xyXG4gICAgdGhpcy5zdGFydFJhZF8gPSB0aGlzLnN0YXJ0UmFkICogTWF0aC5QSTtcclxuICAgIHRoaXMuc3RvcFJhZF8gPSB0aGlzLnN0b3BSYWQgKiBNYXRoLlBJO1xyXG4gICAgbGV0IHJhZCA9IHRoaXMuc3RhcnRSYWRfO1xyXG4gICAgbGV0IHN0ZXAgPSAobGVmdCA/IDEgOiAtMSkgKiB0aGlzLnNwZWVkIC8gcjtcclxuICAgIGxldCBlbmQgPSBmYWxzZTtcclxuICAgIFxyXG4gICAgd2hpbGUgKCFlbmQpIHtcclxuICAgICAgcmFkICs9IHN0ZXA7XHJcbiAgICAgIGlmICgobGVmdCAmJiAocmFkID49IHRoaXMuc3RvcFJhZF8pKSB8fCAoIWxlZnQgJiYgcmFkIDw9IHRoaXMuc3RvcFJhZF8pKSB7XHJcbiAgICAgICAgcmFkID0gdGhpcy5zdG9wUmFkXztcclxuICAgICAgICBlbmQgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuZGVsdGFzLnB1c2goe1xyXG4gICAgICAgIHg6IHRoaXMuciAqIE1hdGguY29zKHJhZCksXHJcbiAgICAgICAgeTogdGhpcy5yICogTWF0aC5zaW4ocmFkKSxcclxuICAgICAgICByYWQ6IHJhZFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBcclxuICAqbW92ZShzZWxmLHgseSkge1xyXG4gICAgLy8g5Yid5pyf5YyWXHJcbiAgICBsZXQgc3gsc3k7XHJcbiAgICBpZiAoc2VsZi54cmV2KSB7XHJcbiAgICAgIHN4ID0geCAtIHRoaXMuciAqIE1hdGguY29zKHRoaXMuc3RhcnRSYWRfICsgTWF0aC5QSSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzeCA9IHggLSB0aGlzLnIgKiBNYXRoLmNvcyh0aGlzLnN0YXJ0UmFkXyk7XHJcbiAgICB9XHJcbiAgICBzeSA9IHkgLSB0aGlzLnIgKiBNYXRoLnNpbih0aGlzLnN0YXJ0UmFkXyk7XHJcblxyXG4gICAgbGV0IGNhbmNlbCA9IGZhbHNlO1xyXG4gICAgLy8g56e75YuVXHJcbiAgICBmb3IobGV0IGkgPSAwLGUgPSB0aGlzLmRlbHRhcy5sZW5ndGg7KGkgPCBlKSAmJiAhY2FuY2VsOysraSlcclxuICAgIHtcclxuICAgICAgdmFyIGRlbHRhID0gdGhpcy5kZWx0YXNbaV07XHJcbiAgICAgIGlmKHNlbGYueHJldil7XHJcbiAgICAgICAgc2VsZi54ID0gc3ggLSBkZWx0YS54O1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNlbGYueCA9IHN4ICsgZGVsdGEueDtcclxuICAgICAgfVxyXG5cclxuICAgICAgc2VsZi55ID0gc3kgKyBkZWx0YS55O1xyXG4gICAgICBpZiAoc2VsZi54cmV2KSB7XHJcbiAgICAgICAgc2VsZi5jaGFyUmFkID0gKE1hdGguUEkgLSBkZWx0YS5yYWQpICsgKHRoaXMubGVmdCA/IC0xIDogMCkgKiBNYXRoLlBJO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNlbGYuY2hhclJhZCA9IGRlbHRhLnJhZCArICh0aGlzLmxlZnQgPyAwIDogLTEpICogTWF0aC5QSTtcclxuICAgICAgfVxyXG4gICAgICBzZWxmLnJhZCA9IGRlbHRhLnJhZDtcclxuICAgICAgY2FuY2VsID0geWllbGQ7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIHRvSlNPTigpe1xyXG4gICAgcmV0dXJuIFsgJ0NpcmNsZU1vdmUnLFxyXG4gICAgICB0aGlzLnN0YXJ0UmFkLFxyXG4gICAgICB0aGlzLnN0b3BSYWQsXHJcbiAgICAgIHRoaXMucixcclxuICAgICAgdGhpcy5zcGVlZCxcclxuICAgICAgdGhpcy5sZWZ0XHJcbiAgICBdO1xyXG4gIH1cclxuICBcclxuICBzdGF0aWMgZnJvbUFycmF5KGEpe1xyXG4gICAgcmV0dXJuIG5ldyBDaXJjbGVNb3ZlKGFbMV0sYVsyXSxhWzNdLGFbNF0sYVs1XSk7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g44Ob44O844Og44Od44K444K344On44Oz44Gr5oi744KLXHJcbmNsYXNzIEdvdG9Ib21lIHtcclxuXHJcbiAqbW92ZShzZWxmLCB4LCB5KSB7XHJcbiAgICBsZXQgcmFkID0gTWF0aC5hdGFuMihzZWxmLmhvbWVZIC0gc2VsZi55LCBzZWxmLmhvbWVYIC0gc2VsZi54KTtcclxuICAgIGxldCBzcGVlZCA9IDQ7XHJcblxyXG4gICAgc2VsZi5jaGFyUmFkID0gcmFkIC0gTWF0aC5QSSAvIDI7XHJcbiAgICBsZXQgZHggPSBNYXRoLmNvcyhyYWQpICogc3BlZWQ7XHJcbiAgICBsZXQgZHkgPSBNYXRoLnNpbihyYWQpICogc3BlZWQ7XHJcbiAgICBzZWxmLnogPSAwLjA7XHJcbiAgICBcclxuICAgIGxldCBjYW5jZWwgPSBmYWxzZTtcclxuICAgIGZvcig7KE1hdGguYWJzKHNlbGYueCAtIHNlbGYuaG9tZVgpID49IDIgfHwgTWF0aC5hYnMoc2VsZi55IC0gc2VsZi5ob21lWSkgPj0gMikgJiYgIWNhbmNlbFxyXG4gICAgICA7c2VsZi54ICs9IGR4LHNlbGYueSArPSBkeSlcclxuICAgIHtcclxuICAgICAgY2FuY2VsID0geWllbGQ7XHJcbiAgICB9XHJcblxyXG4gICAgc2VsZi5jaGFyUmFkID0gMDtcclxuICAgIHNlbGYueCA9IHNlbGYuaG9tZVg7XHJcbiAgICBzZWxmLnkgPSBzZWxmLmhvbWVZO1xyXG4gICAgaWYgKHNlbGYuc3RhdHVzID09IHNlbGYuU1RBUlQpIHtcclxuICAgICAgdmFyIGdyb3VwSUQgPSBzZWxmLmdyb3VwSUQ7XHJcbiAgICAgIHZhciBncm91cERhdGEgPSBzZWxmLmVuZW1pZXMuZ3JvdXBEYXRhO1xyXG4gICAgICBncm91cERhdGFbZ3JvdXBJRF0ucHVzaChzZWxmKTtcclxuICAgICAgc2VsZi5lbmVtaWVzLmhvbWVFbmVtaWVzQ291bnQrKztcclxuICAgIH1cclxuICAgIHNlbGYuc3RhdHVzID0gc2VsZi5IT01FO1xyXG4gIH1cclxuICBcclxuICB0b0pTT04oKXtcclxuICAgIHJldHVybiBbJ0dvdG9Ib21lJ107XHJcbiAgfVxyXG4gIFxyXG4gIHN0YXRpYyBmcm9tQXJyYXkoYSlcclxuICB7XHJcbiAgICByZXR1cm4gbmV3IEdvdG9Ib21lKCk7XHJcbiAgfVxyXG59XHJcblxyXG5cclxuLy8vIOW+heapn+S4reOBruaVteOBruWLleOBjVxyXG5jbGFzcyBIb21lTW92ZXtcclxuICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgdGhpcy5DRU5URVJfWCA9IDA7XHJcbiAgICB0aGlzLkNFTlRFUl9ZID0gMTAwO1xyXG4gIH1cclxuXHJcbiAgKm1vdmUoc2VsZiwgeCwgeSkge1xyXG5cclxuICAgIGxldCBkeCA9IHNlbGYuaG9tZVggLSB0aGlzLkNFTlRFUl9YO1xyXG4gICAgbGV0IGR5ID0gc2VsZi5ob21lWSAtIHRoaXMuQ0VOVEVSX1k7XHJcbiAgICBzZWxmLnogPSAtMC4xO1xyXG5cclxuICAgIHdoaWxlKHNlbGYuc3RhdHVzICE9IHNlbGYuQVRUQUNLKVxyXG4gICAge1xyXG4gICAgICBzZWxmLnggPSBzZWxmLmhvbWVYICsgZHggKiBzZWxmLmVuZW1pZXMuaG9tZURlbHRhO1xyXG4gICAgICBzZWxmLnkgPSBzZWxmLmhvbWVZICsgZHkgKiBzZWxmLmVuZW1pZXMuaG9tZURlbHRhO1xyXG4gICAgICBzZWxmLm1lc2guc2NhbGUueCA9IHNlbGYuZW5lbWllcy5ob21lRGVsdGEyO1xyXG4gICAgICB5aWVsZDtcclxuICAgIH1cclxuXHJcbiAgICBzZWxmLm1lc2guc2NhbGUueCA9IDEuMDtcclxuICAgIHNlbGYueiA9IDAuMDtcclxuXHJcbiAgfVxyXG4gIFxyXG4gIHRvSlNPTigpe1xyXG4gICAgcmV0dXJuIFsnSG9tZU1vdmUnXTtcclxuICB9XHJcbiAgXHJcbiAgc3RhdGljIGZyb21BcnJheShhKVxyXG4gIHtcclxuICAgIHJldHVybiBuZXcgSG9tZU1vdmUoKTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDmjIflrprjgrfjg7zjgrHjg7Pjgrnjgavnp7vli5XjgZnjgotcclxuY2xhc3MgR290byB7XHJcbiAgY29uc3RydWN0b3IocG9zKSB7IHRoaXMucG9zID0gcG9zOyB9O1xyXG4gICptb3ZlKHNlbGYsIHgsIHkpIHtcclxuICAgIHNlbGYuaW5kZXggPSB0aGlzLnBvcyAtIDE7XHJcbiAgfVxyXG4gIFxyXG4gIHRvSlNPTigpe1xyXG4gICAgcmV0dXJuIFtcclxuICAgICAgJ0dvdG8nLFxyXG4gICAgICB0aGlzLnBvc1xyXG4gICAgXTtcclxuICB9XHJcbiAgXHJcbiAgc3RhdGljIGZyb21BcnJheShhKXtcclxuICAgIHJldHVybiBuZXcgR290byhhWzFdKTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDmlbXlvL7nmbrlsIRcclxuY2xhc3MgRmlyZSB7XHJcbiAgKm1vdmUoc2VsZiwgeCwgeSkge1xyXG4gICAgbGV0IGQgPSAoc2ZnLnN0YWdlLm5vIC8gMjApICogKCBzZmcuc3RhZ2UuZGlmZmljdWx0eSk7XHJcbiAgICBpZiAoZCA+IDEpIHsgZCA9IDEuMDt9XHJcbiAgICBpZiAoTWF0aC5yYW5kb20oKSA8IGQpIHtcclxuICAgICAgc2VsZi5lbmVtaWVzLmVuZW15QnVsbGV0cy5zdGFydChzZWxmLngsIHNlbGYueSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIHRvSlNPTigpe1xyXG4gICAgcmV0dXJuIFsnRmlyZSddO1xyXG4gIH1cclxuICBcclxuICBzdGF0aWMgZnJvbUFycmF5KGEpXHJcbiAge1xyXG4gICAgcmV0dXJuIG5ldyBGaXJlKCk7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g5pW15pys5L2TXHJcbmV4cG9ydCBjbGFzcyBFbmVteSBleHRlbmRzIGdhbWVvYmouR2FtZU9iaiB7IFxyXG4gIGNvbnN0cnVjdG9yKGVuZW1pZXMsc2NlbmUsc2UpIHtcclxuICBzdXBlcigwLCAwLCAwKTtcclxuICB0aGlzLk5PTkUgPSAgMCA7XHJcbiAgdGhpcy5TVEFSVCA9ICAxIDtcclxuICB0aGlzLkhPTUUgPSAgMiA7XHJcbiAgdGhpcy5BVFRBQ0sgPSAgMyA7XHJcbiAgdGhpcy5CT01CID0gIDQgO1xyXG4gIHRoaXMuY29sbGlzaW9uQXJlYS53aWR0aCA9IDEyO1xyXG4gIHRoaXMuY29sbGlzaW9uQXJlYS5oZWlnaHQgPSA4O1xyXG4gIHZhciB0ZXggPSBzZmcudGV4dHVyZUZpbGVzLmVuZW15O1xyXG4gIHZhciBtYXRlcmlhbCA9IGdyYXBoaWNzLmNyZWF0ZVNwcml0ZU1hdGVyaWFsKHRleCk7XHJcbiAgdmFyIGdlb21ldHJ5ID0gZ3JhcGhpY3MuY3JlYXRlU3ByaXRlR2VvbWV0cnkoMTYpO1xyXG4gIGdyYXBoaWNzLmNyZWF0ZVNwcml0ZVVWKGdlb21ldHJ5LCB0ZXgsIDE2LCAxNiwgMCk7XHJcbiAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICB0aGlzLmdyb3VwSUQgPSAwO1xyXG4gIHRoaXMueiA9IDAuMDtcclxuICB0aGlzLmluZGV4ID0gMDtcclxuICB0aGlzLnNjb3JlID0gMDtcclxuICB0aGlzLm12UGF0dGVybiA9IG51bGw7XHJcbiAgdGhpcy5tdiA9IG51bGw7XHJcbiAgdGhpcy5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxuICB0aGlzLnN0YXR1cyA9IHRoaXMuTk9ORTtcclxuICB0aGlzLnR5cGUgPSBudWxsO1xyXG4gIHRoaXMubGlmZSA9IDA7XHJcbiAgdGhpcy50YXNrID0gbnVsbDtcclxuICB0aGlzLmhpdF8gPSBudWxsO1xyXG4gIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuICB0aGlzLnNjZW5lLmFkZCh0aGlzLm1lc2gpO1xyXG4gIHRoaXMuc2UgPSBzZTtcclxuICB0aGlzLmVuZW1pZXMgPSBlbmVtaWVzO1xyXG59XHJcblxyXG4gIGdldCB4KCkgeyByZXR1cm4gdGhpcy54XzsgfVxyXG4gIHNldCB4KHYpIHsgdGhpcy54XyA9IHRoaXMubWVzaC5wb3NpdGlvbi54ID0gdjsgfVxyXG4gIGdldCB5KCkgeyByZXR1cm4gdGhpcy55XzsgfVxyXG4gIHNldCB5KHYpIHsgdGhpcy55XyA9IHRoaXMubWVzaC5wb3NpdGlvbi55ID0gdjsgfVxyXG4gIGdldCB6KCkgeyByZXR1cm4gdGhpcy56XzsgfVxyXG4gIHNldCB6KHYpIHsgdGhpcy56XyA9IHRoaXMubWVzaC5wb3NpdGlvbi56ID0gdjsgfVxyXG4gIFxyXG4gIC8vL+aVteOBruWLleOBjVxyXG4gICptb3ZlKHRhc2tJbmRleCkge1xyXG4gICAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgICB3aGlsZSAodGFza0luZGV4ID49IDApe1xyXG4gICAgICB3aGlsZSghdGhpcy5tdi5uZXh0KCkuZG9uZSAmJiB0YXNrSW5kZXggPj0gMClcclxuICAgICAge1xyXG4gICAgICAgIHRoaXMubWVzaC5zY2FsZS54ID0gdGhpcy5lbmVtaWVzLmhvbWVEZWx0YTI7XHJcbiAgICAgICAgdGhpcy5tZXNoLnJvdGF0aW9uLnogPSB0aGlzLmNoYXJSYWQ7XHJcbiAgICAgICAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICBpZih0YXNrSW5kZXggPCAwKXtcclxuICAgICAgICB0YXNrSW5kZXggPSAtKCsrdGFza0luZGV4KTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGxldCBlbmQgPSBmYWxzZTtcclxuICAgICAgd2hpbGUgKCFlbmQpIHtcclxuICAgICAgICBpZiAodGhpcy5pbmRleCA8ICh0aGlzLm12UGF0dGVybi5sZW5ndGggLSAxKSkge1xyXG4gICAgICAgICAgdGhpcy5pbmRleCsrO1xyXG4gICAgICAgICAgdGhpcy5tdiA9IHRoaXMubXZQYXR0ZXJuW3RoaXMuaW5kZXhdLm1vdmUodGhpcyx0aGlzLngsdGhpcy55KTtcclxuICAgICAgICAgIGVuZCA9ICF0aGlzLm12Lm5leHQoKS5kb25lO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5tZXNoLnNjYWxlLnggPSB0aGlzLmVuZW1pZXMuaG9tZURlbHRhMjtcclxuICAgICAgdGhpcy5tZXNoLnJvdGF0aW9uLnogPSB0aGlzLmNoYXJSYWQ7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIC8vLyDliJ3mnJ/ljJZcclxuICBzdGFydCh4LCB5LCB6LCBob21lWCwgaG9tZVksIG12UGF0dGVybiwgeHJldix0eXBlLCBjbGVhclRhcmdldCxncm91cElEKSB7XHJcbiAgICBpZiAodGhpcy5lbmFibGVfKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHRoaXMudHlwZSA9IHR5cGU7XHJcbiAgICB0eXBlKHRoaXMpO1xyXG4gICAgdGhpcy54ID0geDtcclxuICAgIHRoaXMueSA9IHk7XHJcbiAgICB0aGlzLnogPSB6O1xyXG4gICAgdGhpcy54cmV2ID0geHJldjtcclxuICAgIHRoaXMuZW5hYmxlXyA9IHRydWU7XHJcbiAgICB0aGlzLmhvbWVYID0gaG9tZVggfHwgMDtcclxuICAgIHRoaXMuaG9tZVkgPSBob21lWSB8fCAwO1xyXG4gICAgdGhpcy5pbmRleCA9IDA7XHJcbiAgICB0aGlzLmdyb3VwSUQgPSBncm91cElEO1xyXG4gICAgdGhpcy5tdlBhdHRlcm4gPSBtdlBhdHRlcm47XHJcbiAgICB0aGlzLmNsZWFyVGFyZ2V0ID0gY2xlYXJUYXJnZXQgfHwgdHJ1ZTtcclxuICAgIHRoaXMubWVzaC5tYXRlcmlhbC5jb2xvci5zZXRIZXgoMHhGRkZGRkYpO1xyXG4gICAgdGhpcy5tdiA9IG12UGF0dGVyblswXS5tb3ZlKHRoaXMseCx5KTtcclxuICAgIC8vdGhpcy5tdi5zdGFydCh0aGlzLCB4LCB5KTtcclxuICAgIC8vaWYgKHRoaXMuc3RhdHVzICE9IHRoaXMuTk9ORSkge1xyXG4gICAgLy8gIGRlYnVnZ2VyO1xyXG4gICAgLy99XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuU1RBUlQ7XHJcbiAgICB0aGlzLnRhc2sgPSBzZmcudGFza3MucHVzaFRhc2sodGhpcy5tb3ZlLmJpbmQodGhpcyksIDEwMDAwKTtcclxuICAgIC8vIGlmKHRoaXMudGFzay5pbmRleCA9PSAwKXtcclxuICAgIC8vICAgZGVidWdnZXI7XHJcbiAgICAvLyB9XHJcbiAgICB0aGlzLm1lc2gudmlzaWJsZSA9IHRydWU7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbiAgXHJcbiAgaGl0KG15YnVsbGV0KSB7XHJcbiAgICBpZiAodGhpcy5oaXRfID09IG51bGwpIHtcclxuICAgICAgbGV0IGxpZmUgPSB0aGlzLmxpZmU7XHJcbiAgICAgIHRoaXMubGlmZSAtPSBteWJ1bGxldC5wb3dlciB8fCAxO1xyXG4gICAgICBteWJ1bGxldC5wb3dlciAtPSBsaWZlOyBcclxuLy8gICAgICB0aGlzLmxpZmUtLTtcclxuICAgICAgaWYgKHRoaXMubGlmZSA8PSAwKSB7XHJcbiAgICAgICAgc2ZnLmJvbWJzLnN0YXJ0KHRoaXMueCwgdGhpcy55KTtcclxuICAgICAgICB0aGlzLnNlKDEpO1xyXG4gICAgICAgIHNmZy5hZGRTY29yZSh0aGlzLnNjb3JlKTtcclxuICAgICAgICBpZiAodGhpcy5jbGVhclRhcmdldCkge1xyXG4gICAgICAgICAgdGhpcy5lbmVtaWVzLmhpdEVuZW1pZXNDb3VudCsrO1xyXG4gICAgICAgICAgaWYgKHRoaXMuc3RhdHVzID09IHRoaXMuU1RBUlQpIHtcclxuICAgICAgICAgICAgdGhpcy5lbmVtaWVzLmhvbWVFbmVtaWVzQ291bnQrKztcclxuICAgICAgICAgICAgdGhpcy5lbmVtaWVzLmdyb3VwRGF0YVt0aGlzLmdyb3VwSURdLnB1c2godGhpcyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0aGlzLmVuZW1pZXMuZ3JvdXBEYXRhW3RoaXMuZ3JvdXBJRF0uZ29uZUNvdW50Kys7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHRoaXMudGFzay5pbmRleCA9PSAwKXtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdoaXQnLHRoaXMudGFzay5pbmRleCk7XHJcbiAgICAgICAgICBkZWJ1Z2dlcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5lbmFibGVfID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5zdGF0dXMgPSB0aGlzLk5PTkU7XHJcbiAgICAgICAgc2ZnLnRhc2tzLmFycmF5W3RoaXMudGFzay5pbmRleF0uZ2VuSW5zdC5uZXh0KC0odGhpcy50YXNrLmluZGV4ICsgMSkpO1xyXG4gICAgICAgIHNmZy50YXNrcy5yZW1vdmVUYXNrKHRoaXMudGFzay5pbmRleCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5zZSgyKTtcclxuICAgICAgICB0aGlzLm1lc2gubWF0ZXJpYWwuY29sb3Iuc2V0SGV4KDB4RkY4MDgwKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5oaXRfKG15YnVsbGV0KTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBaYWtvKHNlbGYpIHtcclxuICBzZWxmLnNjb3JlID0gNTA7XHJcbiAgc2VsZi5saWZlID0gMTtcclxuICBncmFwaGljcy51cGRhdGVTcHJpdGVVVihzZWxmLm1lc2guZ2VvbWV0cnksIHNmZy50ZXh0dXJlRmlsZXMuZW5lbXksIDE2LCAxNiwgNyk7XHJcbn1cclxuXHJcblpha28udG9KU09OID0gZnVuY3Rpb24gKClcclxue1xyXG4gIHJldHVybiAnWmFrbyc7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBaYWtvMShzZWxmKSB7XHJcbiAgc2VsZi5zY29yZSA9IDEwMDtcclxuICBzZWxmLmxpZmUgPSAxO1xyXG4gIGdyYXBoaWNzLnVwZGF0ZVNwcml0ZVVWKHNlbGYubWVzaC5nZW9tZXRyeSwgc2ZnLnRleHR1cmVGaWxlcy5lbmVteSwgMTYsIDE2LCA2KTtcclxufVxyXG5cclxuWmFrbzEudG9KU09OID0gZnVuY3Rpb24gKClcclxue1xyXG4gIHJldHVybiAnWmFrbzEnO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gTUJvc3Moc2VsZikge1xyXG4gIHNlbGYuc2NvcmUgPSAzMDA7XHJcbiAgc2VsZi5saWZlID0gMjtcclxuICBzZWxmLm1lc2guYmxlbmRpbmcgPSBUSFJFRS5Ob3JtYWxCbGVuZGluZztcclxuICBncmFwaGljcy51cGRhdGVTcHJpdGVVVihzZWxmLm1lc2guZ2VvbWV0cnksIHNmZy50ZXh0dXJlRmlsZXMuZW5lbXksIDE2LCAxNiwgNCk7XHJcbn1cclxuXHJcbk1Cb3NzLnRvSlNPTiA9IGZ1bmN0aW9uICgpXHJcbntcclxuICByZXR1cm4gJ01Cb3NzJztcclxufVxyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBFbmVtaWVze1xyXG4gIGNvbnN0cnVjdG9yKHNjZW5lLCBzZSwgZW5lbXlCdWxsZXRzKSB7XHJcbiAgICB0aGlzLmVuZW15QnVsbGV0cyA9IGVuZW15QnVsbGV0cztcclxuICAgIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuICAgIHRoaXMubmV4dFRpbWUgPSAwO1xyXG4gICAgdGhpcy5jdXJyZW50SW5kZXggPSAwO1xyXG4gICAgdGhpcy5lbmVtaWVzID0gbmV3IEFycmF5KDApO1xyXG4gICAgdGhpcy5ob21lRGVsdGEyID0gMS4wO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA2NDsgKytpKSB7XHJcbiAgICAgIHRoaXMuZW5lbWllcy5wdXNoKG5ldyBFbmVteSh0aGlzLCBzY2VuZSwgc2UpKTtcclxuICAgIH1cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNTsgKytpKSB7XHJcbiAgICAgIHRoaXMuZ3JvdXBEYXRhW2ldID0gbmV3IEFycmF5KDApO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBzdGFydEVuZW15XyhlbmVteSxkYXRhKVxyXG4gIHtcclxuICAgICAgZW5lbXkuc3RhcnQoZGF0YVsxXSwgZGF0YVsyXSwgMCwgZGF0YVszXSwgZGF0YVs0XSwgdGhpcy5tb3ZlUGF0dGVybnNbTWF0aC5hYnMoZGF0YVs1XSldLCBkYXRhWzVdIDwgMCwgZGF0YVs2XSwgZGF0YVs3XSwgZGF0YVs4XSB8fCAwKTtcclxuICB9XHJcbiAgXHJcbiAgc3RhcnRFbmVteShkYXRhKXtcclxuICAgIHZhciBlbmVtaWVzID0gdGhpcy5lbmVtaWVzO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGUgPSBlbmVtaWVzLmxlbmd0aDsgaSA8IGU7ICsraSkge1xyXG4gICAgICB2YXIgZW5lbXkgPSBlbmVtaWVzW2ldO1xyXG4gICAgICBpZiAoIWVuZW15LmVuYWJsZV8pIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zdGFydEVuZW15XyhlbmVteSxkYXRhKTtcclxuICAgICAgfVxyXG4gICAgfSAgICBcclxuICB9XHJcbiAgXHJcbiAgc3RhcnRFbmVteUluZGV4ZWQoZGF0YSxpbmRleCl7XHJcbiAgICBsZXQgZW4gPSB0aGlzLmVuZW1pZXNbaW5kZXhdO1xyXG4gICAgaWYoZW4uZW5hYmxlXyl7XHJcbiAgICAgICAgc2ZnLnRhc2tzLnJlbW92ZVRhc2soZW4udGFzay5pbmRleCk7XHJcbiAgICAgICAgZW4uc3RhdHVzID0gZW4uTk9ORTtcclxuICAgICAgICBlbi5lbmFibGVfID0gZmFsc2U7XHJcbiAgICAgICAgZW4ubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB0aGlzLnN0YXJ0RW5lbXlfKGVuLGRhdGEpO1xyXG4gIH1cclxuXHJcbiAgLy8vIOaVtee3qOmaiuOBruWLleOBjeOCkuOCs+ODs+ODiOODreODvOODq+OBmeOCi1xyXG4gIG1vdmUoKSB7XHJcbiAgICB2YXIgY3VycmVudFRpbWUgPSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lO1xyXG4gICAgdmFyIG1vdmVTZXFzID0gdGhpcy5tb3ZlU2VxcztcclxuICAgIHZhciBsZW4gPSBtb3ZlU2Vxc1tzZmcuc3RhZ2UucHJpdmF0ZU5vXS5sZW5ndGg7XHJcbiAgICAvLyDjg4fjg7zjgr/phY3liJfjgpLjgoLjgajjgavmlbXjgpLnlJ/miJBcclxuICAgIHdoaWxlICh0aGlzLmN1cnJlbnRJbmRleCA8IGxlbikge1xyXG4gICAgICB2YXIgZGF0YSA9IG1vdmVTZXFzW3NmZy5zdGFnZS5wcml2YXRlTm9dW3RoaXMuY3VycmVudEluZGV4XTtcclxuICAgICAgdmFyIG5leHRUaW1lID0gdGhpcy5uZXh0VGltZSAhPSBudWxsID8gdGhpcy5uZXh0VGltZSA6IGRhdGFbMF07XHJcbiAgICAgIGlmIChjdXJyZW50VGltZSA+PSAodGhpcy5uZXh0VGltZSArIGRhdGFbMF0pKSB7XHJcbiAgICAgICAgdGhpcy5zdGFydEVuZW15KGRhdGEpO1xyXG4gICAgICAgIHRoaXMuY3VycmVudEluZGV4Kys7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudEluZGV4IDwgbGVuKSB7XHJcbiAgICAgICAgICB0aGlzLm5leHRUaW1lID0gY3VycmVudFRpbWUgKyBtb3ZlU2Vxc1tzZmcuc3RhZ2UucHJpdmF0ZU5vXVt0aGlzLmN1cnJlbnRJbmRleF1bMF07XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyDjg5vjg7zjg6Djg53jgrjjgrfjg6fjg7PjgavmlbXjgYzjgZnjgbnjgabmlbTliJfjgZfjgZ/jgYvnorroqo3jgZnjgovjgIJcclxuICAgIGlmICh0aGlzLmhvbWVFbmVtaWVzQ291bnQgPT0gdGhpcy50b3RhbEVuZW1pZXNDb3VudCAmJiB0aGlzLnN0YXR1cyA9PSB0aGlzLlNUQVJUKSB7XHJcbiAgICAgIC8vIOaVtOWIl+OBl+OBpuOBhOOBn+OCieaVtOWIl+ODouODvOODieOBq+enu+ihjOOBmeOCi+OAglxyXG4gICAgICB0aGlzLnN0YXR1cyA9IHRoaXMuSE9NRTtcclxuICAgICAgdGhpcy5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDAuNSAqICgyLjAgLSBzZmcuc3RhZ2UuZGlmZmljdWx0eSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8g44Ob44O844Og44Od44K444K344On44Oz44Gn5LiA5a6a5pmC6ZaT5b6F5qmf44GZ44KLXHJcbiAgICBpZiAodGhpcy5zdGF0dXMgPT0gdGhpcy5IT01FKSB7XHJcbiAgICAgIGlmIChzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lID4gdGhpcy5lbmRUaW1lKSB7XHJcbiAgICAgICAgdGhpcy5zdGF0dXMgPSB0aGlzLkFUVEFDSztcclxuICAgICAgICB0aGlzLmVuZFRpbWUgPSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lICsgKHNmZy5zdGFnZS5ESUZGSUNVTFRZX01BWCAtIHNmZy5zdGFnZS5kaWZmaWN1bHR5KSAqIDM7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IDA7XHJcbiAgICAgICAgdGhpcy5jb3VudCA9IDA7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyDmlLvmkoPjgZnjgotcclxuICAgIGlmICh0aGlzLnN0YXR1cyA9PSB0aGlzLkFUVEFDSyAmJiBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lID4gdGhpcy5lbmRUaW1lKSB7XHJcbiAgICAgIHRoaXMuZW5kVGltZSA9IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgKyAoc2ZnLnN0YWdlLkRJRkZJQ1VMVFlfTUFYIC0gc2ZnLnN0YWdlLmRpZmZpY3VsdHkpICogMztcclxuICAgICAgdmFyIGdyb3VwRGF0YSA9IHRoaXMuZ3JvdXBEYXRhO1xyXG4gICAgICB2YXIgYXR0YWNrQ291bnQgPSAoMSArIDAuMjUgKiAoc2ZnLnN0YWdlLmRpZmZpY3VsdHkpKSB8IDA7XHJcbiAgICAgIHZhciBncm91cCA9IGdyb3VwRGF0YVt0aGlzLmdyb3VwXTtcclxuXHJcbiAgICAgIGlmICghZ3JvdXAgfHwgZ3JvdXAubGVuZ3RoID09IDApIHtcclxuICAgICAgICB0aGlzLmdyb3VwID0gMDtcclxuICAgICAgICB2YXIgZ3JvdXAgPSBncm91cERhdGFbMF07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChncm91cC5sZW5ndGggPiAwICYmIGdyb3VwLmxlbmd0aCA+IGdyb3VwLmdvbmVDb3VudCkge1xyXG4gICAgICAgIGlmICghZ3JvdXAuaW5kZXgpIHtcclxuICAgICAgICAgIGdyb3VwLmluZGV4ID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF0aGlzLmdyb3VwKSB7XHJcbiAgICAgICAgICB2YXIgY291bnQgPSAwLCBlbmRnID0gZ3JvdXAubGVuZ3RoO1xyXG4gICAgICAgICAgd2hpbGUgKGNvdW50IDwgZW5kZyAmJiBhdHRhY2tDb3VudCA+IDApIHtcclxuICAgICAgICAgICAgdmFyIGVuID0gZ3JvdXBbZ3JvdXAuaW5kZXhdO1xyXG4gICAgICAgICAgICBpZiAoZW4uZW5hYmxlXyAmJiBlbi5zdGF0dXMgPT0gZW4uSE9NRSkge1xyXG4gICAgICAgICAgICAgIGVuLnN0YXR1cyA9IGVuLkFUVEFDSztcclxuICAgICAgICAgICAgICAtLWF0dGFja0NvdW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvdW50Kys7XHJcbiAgICAgICAgICAgIGdyb3VwLmluZGV4Kys7XHJcbiAgICAgICAgICAgIGlmIChncm91cC5pbmRleCA+PSBncm91cC5sZW5ndGgpIGdyb3VwLmluZGV4ID0gMDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IGdyb3VwLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgICAgICAgIHZhciBlbiA9IGdyb3VwW2ldO1xyXG4gICAgICAgICAgICBpZiAoZW4uZW5hYmxlXyAmJiBlbi5zdGF0dXMgPT0gZW4uSE9NRSkge1xyXG4gICAgICAgICAgICAgIGVuLnN0YXR1cyA9IGVuLkFUVEFDSztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5ncm91cCsrO1xyXG4gICAgICBpZiAodGhpcy5ncm91cCA+PSB0aGlzLmdyb3VwRGF0YS5sZW5ndGgpIHtcclxuICAgICAgICB0aGlzLmdyb3VwID0gMDtcclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyDjg5vjg7zjg6Djg53jgrjjgrfjg6fjg7Pjgafjga7lvoXmqZ/li5XkvZxcclxuICAgIHRoaXMuaG9tZURlbHRhQ291bnQgKz0gMC4wMjU7XHJcbiAgICB0aGlzLmhvbWVEZWx0YSA9IE1hdGguc2luKHRoaXMuaG9tZURlbHRhQ291bnQpICogMC4wODtcclxuICAgIHRoaXMuaG9tZURlbHRhMiA9IDEuMCArIE1hdGguc2luKHRoaXMuaG9tZURlbHRhQ291bnQgKiA4KSAqIDAuMTtcclxuXHJcbiAgfVxyXG5cclxuICByZXNldCgpIHtcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0aGlzLmVuZW1pZXMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgdmFyIGVuID0gdGhpcy5lbmVtaWVzW2ldO1xyXG4gICAgICBpZiAoZW4uZW5hYmxlXykge1xyXG4gICAgICAgIHNmZy50YXNrcy5yZW1vdmVUYXNrKGVuLnRhc2suaW5kZXgpO1xyXG4gICAgICAgIGVuLnN0YXR1cyA9IGVuLk5PTkU7XHJcbiAgICAgICAgZW4uZW5hYmxlXyA9IGZhbHNlO1xyXG4gICAgICAgIGVuLm1lc2gudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjYWxjRW5lbWllc0NvdW50KCkge1xyXG4gICAgdmFyIHNlcXMgPSB0aGlzLm1vdmVTZXFzW3NmZy5zdGFnZS5wcml2YXRlTm9dO1xyXG4gICAgdGhpcy50b3RhbEVuZW1pZXNDb3VudCA9IDA7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gc2Vxcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgICBpZiAoc2Vxc1tpXVs3XSkge1xyXG4gICAgICAgIHRoaXMudG90YWxFbmVtaWVzQ291bnQrKztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc3RhcnQoKSB7XHJcbiAgICB0aGlzLm5leHRUaW1lID0gMDtcclxuICAgIHRoaXMuY3VycmVudEluZGV4ID0gMDtcclxuICAgIHRoaXMudG90YWxFbmVtaWVzQ291bnQgPSAwO1xyXG4gICAgdGhpcy5oaXRFbmVtaWVzQ291bnQgPSAwO1xyXG4gICAgdGhpcy5ob21lRW5lbWllc0NvdW50ID0gMDtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5TVEFSVDtcclxuICAgIHZhciBncm91cERhdGEgPSB0aGlzLmdyb3VwRGF0YTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSBncm91cERhdGEubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgZ3JvdXBEYXRhW2ldLmxlbmd0aCA9IDA7XHJcbiAgICAgIGdyb3VwRGF0YVtpXS5nb25lQ291bnQgPSAwO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBsb2FkUGF0dGVybnMoKXtcclxuICAgIHRoaXMubW92ZVBhdHRlcm5zID0gW107XHJcbiAgICBsZXQgdGhpc18gPSB0aGlzOyAgICBcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSxyZWplY3QpPT57XHJcbiAgICAgIGQzLmpzb24oJy4vcmVzL2VuZW15TW92ZVBhdHRlcm4uanNvbicsKGVycixkYXRhKT0+e1xyXG4gICAgICAgIGlmKGVycil7XHJcbiAgICAgICAgICByZWplY3QoZXJyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZGF0YS5mb3JFYWNoKChjb21BcnJheSxpKT0+e1xyXG4gICAgICAgICAgbGV0IGNvbSA9IFtdO1xyXG4gICAgICAgICAgdGhpcy5tb3ZlUGF0dGVybnMucHVzaChjb20pO1xyXG4gICAgICAgICAgY29tQXJyYXkuZm9yRWFjaCgoZCxpKT0+e1xyXG4gICAgICAgICAgICBjb20ucHVzaCh0aGlzLmNyZWF0ZU1vdmVQYXR0ZXJuRnJvbUFycmF5KGQpKTtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuICBcclxuICBjcmVhdGVNb3ZlUGF0dGVybkZyb21BcnJheShhcnIpe1xyXG4gICAgbGV0IG9iajtcclxuICAgIHN3aXRjaChhcnJbMF0pe1xyXG4gICAgICBjYXNlICdMaW5lTW92ZSc6XHJcbiAgICAgICAgb2JqID0gTGluZU1vdmUuZnJvbUFycmF5KGFycik7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ0NpcmNsZU1vdmUnOlxyXG4gICAgICAgIG9iaiA9ICBDaXJjbGVNb3ZlLmZyb21BcnJheShhcnIpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdHb3RvSG9tZSc6XHJcbiAgICAgICAgb2JqID0gICBHb3RvSG9tZS5mcm9tQXJyYXkoYXJyKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnSG9tZU1vdmUnOlxyXG4gICAgICAgIG9iaiA9ICAgSG9tZU1vdmUuZnJvbUFycmF5KGFycik7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ0dvdG8nOlxyXG4gICAgICAgIG9iaiA9ICAgR290by5mcm9tQXJyYXkoYXJyKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnRmlyZSc6XHJcbiAgICAgICAgb2JqID0gICBGaXJlLmZyb21BcnJheShhcnIpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG9iajtcclxuLy8gICAgdGhyb3cgbmV3IEVycm9yKCdNb3ZlUGF0dGVybiBOb3QgRm91bmQuJyk7XHJcbiAgfVxyXG4gIFxyXG4gIGxvYWRGb3JtYXRpb25zKCl7XHJcbiAgICB0aGlzLm1vdmVTZXFzID0gW107XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUscmVqZWN0KT0+e1xyXG4gICAgICBkMy5qc29uKCcuL3Jlcy9lbmVteUZvcm1hdGlvblBhdHRlcm4uanNvbicsKGVycixkYXRhKT0+e1xyXG4gICAgICAgIGlmKGVycikgcmVqZWN0KGVycik7XHJcbiAgICAgICAgZGF0YS5mb3JFYWNoKChmb3JtLGkpPT57XHJcbiAgICAgICAgICBsZXQgc3RhZ2UgPSBbXTtcclxuICAgICAgICAgIHRoaXMubW92ZVNlcXMucHVzaChzdGFnZSk7XHJcbiAgICAgICAgICBmb3JtLmZvckVhY2goKGQsaSk9PntcclxuICAgICAgICAgICAgZFs2XSA9IGdldEVuZW15RnVuYyhkWzZdKTtcclxuICAgICAgICAgICAgc3RhZ2UucHVzaChkKTtcclxuICAgICAgICAgIH0pOyAgICAgICAgICBcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIFxyXG59XHJcblxyXG52YXIgZW5lbXlGdW5jcyA9IG5ldyBNYXAoW1xyXG4gICAgICBbXCJaYWtvXCIsWmFrb10sXHJcbiAgICAgIFtcIlpha28xXCIsWmFrbzFdLFxyXG4gICAgICBbXCJNQm9zc1wiLE1Cb3NzXVxyXG4gICAgXSk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0RW5lbXlGdW5jKGZ1bmNOYW1lKVxyXG57XHJcbiAgcmV0dXJuIGVuZW15RnVuY3MuZ2V0KGZ1bmNOYW1lKTtcclxufVxyXG5cclxuRW5lbWllcy5wcm90b3R5cGUudG90YWxFbmVtaWVzQ291bnQgPSAwO1xyXG5FbmVtaWVzLnByb3RvdHlwZS5oaXRFbmVtaWVzQ291bnQgPSAwO1xyXG5FbmVtaWVzLnByb3RvdHlwZS5ob21lRW5lbWllc0NvdW50ID0gMDtcclxuRW5lbWllcy5wcm90b3R5cGUuaG9tZURlbHRhID0gMDtcclxuRW5lbWllcy5wcm90b3R5cGUuaG9tZURlbHRhQ291bnQgPSAwO1xyXG5FbmVtaWVzLnByb3RvdHlwZS5ob21lRGVsdGEyID0gMDtcclxuRW5lbWllcy5wcm90b3R5cGUuZ3JvdXBEYXRhID0gW107XHJcbkVuZW1pZXMucHJvdG90eXBlLk5PTkUgPSAwIHwgMDtcclxuRW5lbWllcy5wcm90b3R5cGUuU1RBUlQgPSAxIHwgMDtcclxuRW5lbWllcy5wcm90b3R5cGUuSE9NRSA9IDIgfCAwO1xyXG5FbmVtaWVzLnByb3RvdHlwZS5BVFRBQ0sgPSAzIHwgMDtcclxuXHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbi8vXHJcbi8vIFdlIHN0b3JlIG91ciBFRSBvYmplY3RzIGluIGEgcGxhaW4gb2JqZWN0IHdob3NlIHByb3BlcnRpZXMgYXJlIGV2ZW50IG5hbWVzLlxyXG4vLyBJZiBgT2JqZWN0LmNyZWF0ZShudWxsKWAgaXMgbm90IHN1cHBvcnRlZCB3ZSBwcmVmaXggdGhlIGV2ZW50IG5hbWVzIHdpdGggYVxyXG4vLyBgfmAgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIGJ1aWx0LWluIG9iamVjdCBwcm9wZXJ0aWVzIGFyZSBub3Qgb3ZlcnJpZGRlbiBvclxyXG4vLyB1c2VkIGFzIGFuIGF0dGFjayB2ZWN0b3IuXHJcbi8vIFdlIGFsc28gYXNzdW1lIHRoYXQgYE9iamVjdC5jcmVhdGUobnVsbClgIGlzIGF2YWlsYWJsZSB3aGVuIHRoZSBldmVudCBuYW1lXHJcbi8vIGlzIGFuIEVTNiBTeW1ib2wuXHJcbi8vXHJcbnZhciBwcmVmaXggPSB0eXBlb2YgT2JqZWN0LmNyZWF0ZSAhPT0gJ2Z1bmN0aW9uJyA/ICd+JyA6IGZhbHNlO1xyXG5cclxuLyoqXHJcbiAqIFJlcHJlc2VudGF0aW9uIG9mIGEgc2luZ2xlIEV2ZW50RW1pdHRlciBmdW5jdGlvbi5cclxuICpcclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gRXZlbnQgaGFuZGxlciB0byBiZSBjYWxsZWQuXHJcbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgQ29udGV4dCBmb3IgZnVuY3Rpb24gZXhlY3V0aW9uLlxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG9uY2UgT25seSBlbWl0IG9uY2VcclxuICogQGFwaSBwcml2YXRlXHJcbiAqL1xyXG5mdW5jdGlvbiBFRShmbiwgY29udGV4dCwgb25jZSkge1xyXG4gIHRoaXMuZm4gPSBmbjtcclxuICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xyXG4gIHRoaXMub25jZSA9IG9uY2UgfHwgZmFsc2U7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBNaW5pbWFsIEV2ZW50RW1pdHRlciBpbnRlcmZhY2UgdGhhdCBpcyBtb2xkZWQgYWdhaW5zdCB0aGUgTm9kZS5qc1xyXG4gKiBFdmVudEVtaXR0ZXIgaW50ZXJmYWNlLlxyXG4gKlxyXG4gKiBAY29uc3RydWN0b3JcclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHsgLyogTm90aGluZyB0byBzZXQgKi8gfVxyXG5cclxuLyoqXHJcbiAqIEhvbGRzIHRoZSBhc3NpZ25lZCBFdmVudEVtaXR0ZXJzIGJ5IG5hbWUuXHJcbiAqXHJcbiAqIEB0eXBlIHtPYmplY3R9XHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XHJcblxyXG4vKipcclxuICogUmV0dXJuIGEgbGlzdCBvZiBhc3NpZ25lZCBldmVudCBsaXN0ZW5lcnMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnRzIHRoYXQgc2hvdWxkIGJlIGxpc3RlZC5cclxuICogQHBhcmFtIHtCb29sZWFufSBleGlzdHMgV2Ugb25seSBuZWVkIHRvIGtub3cgaWYgdGhlcmUgYXJlIGxpc3RlbmVycy5cclxuICogQHJldHVybnMge0FycmF5fEJvb2xlYW59XHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uIGxpc3RlbmVycyhldmVudCwgZXhpc3RzKSB7XHJcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnRcclxuICAgICwgYXZhaWxhYmxlID0gdGhpcy5fZXZlbnRzICYmIHRoaXMuX2V2ZW50c1tldnRdO1xyXG5cclxuICBpZiAoZXhpc3RzKSByZXR1cm4gISFhdmFpbGFibGU7XHJcbiAgaWYgKCFhdmFpbGFibGUpIHJldHVybiBbXTtcclxuICBpZiAoYXZhaWxhYmxlLmZuKSByZXR1cm4gW2F2YWlsYWJsZS5mbl07XHJcblxyXG4gIGZvciAodmFyIGkgPSAwLCBsID0gYXZhaWxhYmxlLmxlbmd0aCwgZWUgPSBuZXcgQXJyYXkobCk7IGkgPCBsOyBpKyspIHtcclxuICAgIGVlW2ldID0gYXZhaWxhYmxlW2ldLmZuO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGVlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEVtaXQgYW4gZXZlbnQgdG8gYWxsIHJlZ2lzdGVyZWQgZXZlbnQgbGlzdGVuZXJzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIG5hbWUgb2YgdGhlIGV2ZW50LlxyXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gSW5kaWNhdGlvbiBpZiB3ZSd2ZSBlbWl0dGVkIGFuIGV2ZW50LlxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gZW1pdChldmVudCwgYTEsIGEyLCBhMywgYTQsIGE1KSB7XHJcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XHJcblxyXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbZXZ0XSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW2V2dF1cclxuICAgICwgbGVuID0gYXJndW1lbnRzLmxlbmd0aFxyXG4gICAgLCBhcmdzXHJcbiAgICAsIGk7XHJcblxyXG4gIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgbGlzdGVuZXJzLmZuKSB7XHJcbiAgICBpZiAobGlzdGVuZXJzLm9uY2UpIHRoaXMucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVycy5mbiwgdW5kZWZpbmVkLCB0cnVlKTtcclxuXHJcbiAgICBzd2l0Y2ggKGxlbikge1xyXG4gICAgICBjYXNlIDE6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCksIHRydWU7XHJcbiAgICAgIGNhc2UgMjogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSksIHRydWU7XHJcbiAgICAgIGNhc2UgMzogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIpLCB0cnVlO1xyXG4gICAgICBjYXNlIDQ6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMyksIHRydWU7XHJcbiAgICAgIGNhc2UgNTogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzLCBhNCksIHRydWU7XHJcbiAgICAgIGNhc2UgNjogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzLCBhNCwgYTUpLCB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGZvciAoaSA9IDEsIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0xKTsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xyXG4gICAgfVxyXG5cclxuICAgIGxpc3RlbmVycy5mbi5hcHBseShsaXN0ZW5lcnMuY29udGV4dCwgYXJncyk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHZhciBsZW5ndGggPSBsaXN0ZW5lcnMubGVuZ3RoXHJcbiAgICAgICwgajtcclxuXHJcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgaWYgKGxpc3RlbmVyc1tpXS5vbmNlKSB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcnNbaV0uZm4sIHVuZGVmaW5lZCwgdHJ1ZSk7XHJcblxyXG4gICAgICBzd2l0Y2ggKGxlbikge1xyXG4gICAgICAgIGNhc2UgMTogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQpOyBicmVhaztcclxuICAgICAgICBjYXNlIDI6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhMSk7IGJyZWFrO1xyXG4gICAgICAgIGNhc2UgMzogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGExLCBhMik7IGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICBpZiAoIWFyZ3MpIGZvciAoaiA9IDEsIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0xKTsgaiA8IGxlbjsgaisrKSB7XHJcbiAgICAgICAgICAgIGFyZ3NbaiAtIDFdID0gYXJndW1lbnRzW2pdO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGxpc3RlbmVyc1tpXS5mbi5hcHBseShsaXN0ZW5lcnNbaV0uY29udGV4dCwgYXJncyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlZ2lzdGVyIGEgbmV3IEV2ZW50TGlzdGVuZXIgZm9yIHRoZSBnaXZlbiBldmVudC5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IE5hbWUgb2YgdGhlIGV2ZW50LlxyXG4gKiBAcGFyYW0ge0Z1bmN0b259IGZuIENhbGxiYWNrIGZ1bmN0aW9uLlxyXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IFRoZSBjb250ZXh0IG9mIHRoZSBmdW5jdGlvbi5cclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBmdW5jdGlvbiBvbihldmVudCwgZm4sIGNvbnRleHQpIHtcclxuICB2YXIgbGlzdGVuZXIgPSBuZXcgRUUoZm4sIGNvbnRleHQgfHwgdGhpcylcclxuICAgICwgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcclxuXHJcbiAgaWYgKCF0aGlzLl9ldmVudHMpIHRoaXMuX2V2ZW50cyA9IHByZWZpeCA/IHt9IDogT2JqZWN0LmNyZWF0ZShudWxsKTtcclxuICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdKSB0aGlzLl9ldmVudHNbZXZ0XSA9IGxpc3RlbmVyO1xyXG4gIGVsc2Uge1xyXG4gICAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XS5mbikgdGhpcy5fZXZlbnRzW2V2dF0ucHVzaChsaXN0ZW5lcik7XHJcbiAgICBlbHNlIHRoaXMuX2V2ZW50c1tldnRdID0gW1xyXG4gICAgICB0aGlzLl9ldmVudHNbZXZ0XSwgbGlzdGVuZXJcclxuICAgIF07XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBBZGQgYW4gRXZlbnRMaXN0ZW5lciB0aGF0J3Mgb25seSBjYWxsZWQgb25jZS5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IE5hbWUgb2YgdGhlIGV2ZW50LlxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBDYWxsYmFjayBmdW5jdGlvbi5cclxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBUaGUgY29udGV4dCBvZiB0aGUgZnVuY3Rpb24uXHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbiBvbmNlKGV2ZW50LCBmbiwgY29udGV4dCkge1xyXG4gIHZhciBsaXN0ZW5lciA9IG5ldyBFRShmbiwgY29udGV4dCB8fCB0aGlzLCB0cnVlKVxyXG4gICAgLCBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xyXG5cclxuICBpZiAoIXRoaXMuX2V2ZW50cykgdGhpcy5fZXZlbnRzID0gcHJlZml4ID8ge30gOiBPYmplY3QuY3JlYXRlKG51bGwpO1xyXG4gIGlmICghdGhpcy5fZXZlbnRzW2V2dF0pIHRoaXMuX2V2ZW50c1tldnRdID0gbGlzdGVuZXI7XHJcbiAgZWxzZSB7XHJcbiAgICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdLmZuKSB0aGlzLl9ldmVudHNbZXZ0XS5wdXNoKGxpc3RlbmVyKTtcclxuICAgIGVsc2UgdGhpcy5fZXZlbnRzW2V2dF0gPSBbXHJcbiAgICAgIHRoaXMuX2V2ZW50c1tldnRdLCBsaXN0ZW5lclxyXG4gICAgXTtcclxuICB9XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlbW92ZSBldmVudCBsaXN0ZW5lcnMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgd2Ugd2FudCB0byByZW1vdmUuXHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBsaXN0ZW5lciB0aGF0IHdlIG5lZWQgdG8gZmluZC5cclxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBPbmx5IHJlbW92ZSBsaXN0ZW5lcnMgbWF0Y2hpbmcgdGhpcyBjb250ZXh0LlxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG9uY2UgT25seSByZW1vdmUgb25jZSBsaXN0ZW5lcnMuXHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5cclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKGV2ZW50LCBmbiwgY29udGV4dCwgb25jZSkge1xyXG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xyXG5cclxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW2V2dF0pIHJldHVybiB0aGlzO1xyXG5cclxuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW2V2dF1cclxuICAgICwgZXZlbnRzID0gW107XHJcblxyXG4gIGlmIChmbikge1xyXG4gICAgaWYgKGxpc3RlbmVycy5mbikge1xyXG4gICAgICBpZiAoXHJcbiAgICAgICAgICAgbGlzdGVuZXJzLmZuICE9PSBmblxyXG4gICAgICAgIHx8IChvbmNlICYmICFsaXN0ZW5lcnMub25jZSlcclxuICAgICAgICB8fCAoY29udGV4dCAmJiBsaXN0ZW5lcnMuY29udGV4dCAhPT0gY29udGV4dClcclxuICAgICAgKSB7XHJcbiAgICAgICAgZXZlbnRzLnB1c2gobGlzdGVuZXJzKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGxpc3RlbmVycy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGlmIChcclxuICAgICAgICAgICAgIGxpc3RlbmVyc1tpXS5mbiAhPT0gZm5cclxuICAgICAgICAgIHx8IChvbmNlICYmICFsaXN0ZW5lcnNbaV0ub25jZSlcclxuICAgICAgICAgIHx8IChjb250ZXh0ICYmIGxpc3RlbmVyc1tpXS5jb250ZXh0ICE9PSBjb250ZXh0KVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgZXZlbnRzLnB1c2gobGlzdGVuZXJzW2ldKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vXHJcbiAgLy8gUmVzZXQgdGhlIGFycmF5LCBvciByZW1vdmUgaXQgY29tcGxldGVseSBpZiB3ZSBoYXZlIG5vIG1vcmUgbGlzdGVuZXJzLlxyXG4gIC8vXHJcbiAgaWYgKGV2ZW50cy5sZW5ndGgpIHtcclxuICAgIHRoaXMuX2V2ZW50c1tldnRdID0gZXZlbnRzLmxlbmd0aCA9PT0gMSA/IGV2ZW50c1swXSA6IGV2ZW50cztcclxuICB9IGVsc2Uge1xyXG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1tldnRdO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogUmVtb3ZlIGFsbCBsaXN0ZW5lcnMgb3Igb25seSB0aGUgbGlzdGVuZXJzIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50LlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IHdhbnQgdG8gcmVtb3ZlIGFsbCBsaXN0ZW5lcnMgZm9yLlxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbiByZW1vdmVBbGxMaXN0ZW5lcnMoZXZlbnQpIHtcclxuICBpZiAoIXRoaXMuX2V2ZW50cykgcmV0dXJuIHRoaXM7XHJcblxyXG4gIGlmIChldmVudCkgZGVsZXRlIHRoaXMuX2V2ZW50c1twcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50XTtcclxuICBlbHNlIHRoaXMuX2V2ZW50cyA9IHByZWZpeCA/IHt9IDogT2JqZWN0LmNyZWF0ZShudWxsKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vL1xyXG4vLyBBbGlhcyBtZXRob2RzIG5hbWVzIGJlY2F1c2UgcGVvcGxlIHJvbGwgbGlrZSB0aGF0LlxyXG4vL1xyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9mZiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXI7XHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uO1xyXG5cclxuLy9cclxuLy8gVGhpcyBmdW5jdGlvbiBkb2Vzbid0IGFwcGx5IGFueW1vcmUuXHJcbi8vXHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24gc2V0TWF4TGlzdGVuZXJzKCkge1xyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLy9cclxuLy8gRXhwb3NlIHRoZSBwcmVmaXguXHJcbi8vXHJcbkV2ZW50RW1pdHRlci5wcmVmaXhlZCA9IHByZWZpeDtcclxuXHJcbi8vXHJcbi8vIEV4cG9zZSB0aGUgbW9kdWxlLlxyXG4vL1xyXG5pZiAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiBtb2R1bGUpIHtcclxuICBtb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcclxufVxyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8vdmFyIFNUQUdFX01BWCA9IDE7XHJcbmltcG9ydCAqIGFzIHNmZyBmcm9tICcuL2dsb2JhbCc7XHJcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsJztcclxuaW1wb3J0ICogYXMgYXVkaW8gZnJvbSAnLi9hdWRpbyc7XHJcbi8vaW1wb3J0ICogYXMgc29uZyBmcm9tICcuL3NvbmcnO1xyXG5pbXBvcnQgKiBhcyBncmFwaGljcyBmcm9tICcuL2dyYXBoaWNzJztcclxuaW1wb3J0ICogYXMgaW8gZnJvbSAnLi9pbyc7XHJcbmltcG9ydCAqIGFzIGNvbW0gZnJvbSAnLi9jb21tJztcclxuaW1wb3J0ICogYXMgdGV4dCBmcm9tICcuL3RleHQnO1xyXG5pbXBvcnQgKiBhcyBnYW1lb2JqIGZyb20gJy4vZ2FtZW9iaic7XHJcbmltcG9ydCAqIGFzIG15c2hpcCBmcm9tICcuL215c2hpcCc7XHJcbmltcG9ydCAqIGFzIGVuZW1pZXMgZnJvbSAnLi9lbmVtaWVzJztcclxuaW1wb3J0ICogYXMgZWZmZWN0b2JqIGZyb20gJy4vZWZmZWN0b2JqJztcclxuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICcuL2V2ZW50RW1pdHRlcjMnO1xyXG5cclxuXHJcbmNsYXNzIFNjb3JlRW50cnkge1xyXG4gIGNvbnN0cnVjdG9yKG5hbWUsIHNjb3JlKSB7XHJcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgdGhpcy5zY29yZSA9IHNjb3JlO1xyXG4gIH1cclxufVxyXG5cclxuXHJcbmNsYXNzIFN0YWdlIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKCk7XHJcbiAgICB0aGlzLk1BWCA9IDE7XHJcbiAgICB0aGlzLkRJRkZJQ1VMVFlfTUFYID0gMi4wO1xyXG4gICAgdGhpcy5ubyA9IDE7XHJcbiAgICB0aGlzLnByaXZhdGVObyA9IDA7XHJcbiAgICB0aGlzLmRpZmZpY3VsdHkgPSAxO1xyXG4gIH1cclxuXHJcbiAgcmVzZXQoKSB7XHJcbiAgICB0aGlzLm5vID0gMTtcclxuICAgIHRoaXMucHJpdmF0ZU5vID0gMDtcclxuICAgIHRoaXMuZGlmZmljdWx0eSA9IDE7XHJcbiAgfVxyXG5cclxuICBhZHZhbmNlKCkge1xyXG4gICAgdGhpcy5ubysrO1xyXG4gICAgdGhpcy5wcml2YXRlTm8rKztcclxuICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgfVxyXG5cclxuICBqdW1wKHN0YWdlTm8pIHtcclxuICAgIHRoaXMubm8gPSBzdGFnZU5vO1xyXG4gICAgdGhpcy5wcml2YXRlTm8gPSB0aGlzLm5vIC0gMTtcclxuICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgfVxyXG5cclxuICB1cGRhdGUoKSB7XHJcbiAgICBpZiAodGhpcy5kaWZmaWN1bHR5IDwgdGhpcy5ESUZGSUNVTFRZX01BWCkge1xyXG4gICAgICB0aGlzLmRpZmZpY3VsdHkgPSAxICsgMC4wNSAqICh0aGlzLm5vIC0gMSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMucHJpdmF0ZU5vID49IHRoaXMuTUFYKSB7XHJcbiAgICAgIHRoaXMucHJpdmF0ZU5vID0gMDtcclxuICAvLyAgICB0aGlzLm5vID0gMTtcclxuICAgIH1cclxuICAgIHRoaXMuZW1pdCgndXBkYXRlJyx0aGlzKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBHYW1lIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMuQ09OU09MRV9XSURUSCA9IDA7XHJcbiAgICB0aGlzLkNPTlNPTEVfSEVJR0hUID0gMDtcclxuICAgIHRoaXMuUkVOREVSRVJfUFJJT1JJVFkgPSAxMDAwMDAgfCAwO1xyXG4gICAgdGhpcy5yZW5kZXJlciA9IG51bGw7XHJcbiAgICB0aGlzLnN0YXRzID0gbnVsbDtcclxuICAgIHRoaXMuc2NlbmUgPSBudWxsO1xyXG4gICAgdGhpcy5jYW1lcmEgPSBudWxsO1xyXG4gICAgdGhpcy5hdXRob3IgPSBudWxsO1xyXG4gICAgdGhpcy5wcm9ncmVzcyA9IG51bGw7XHJcbiAgICB0aGlzLnRleHRQbGFuZSA9IG51bGw7XHJcbiAgICB0aGlzLmJhc2ljSW5wdXQgPSBuZXcgaW8uQmFzaWNJbnB1dCgpO1xyXG4gICAgdGhpcy50YXNrcyA9IG5ldyB1dGlsLlRhc2tzKCk7XHJcbiAgICBzZmcudGFza3MgPSB0aGlzLnRhc2tzO1xyXG4gICAgdGhpcy53YXZlR3JhcGggPSBudWxsO1xyXG4gICAgdGhpcy5zdGFydCA9IGZhbHNlO1xyXG4gICAgdGhpcy5iYXNlVGltZSA9IG5ldyBEYXRlO1xyXG4gICAgdGhpcy5kID0gLTAuMjtcclxuICAgIHRoaXMuYXVkaW9fID0gbnVsbDtcclxuICAgIHRoaXMuc2VxdWVuY2VyID0gbnVsbDtcclxuICAgIHRoaXMucGlhbm8gPSBudWxsO1xyXG4gICAgdGhpcy5zY29yZSA9IDA7XHJcbiAgICB0aGlzLmhpZ2hTY29yZSA9IDA7XHJcbiAgICB0aGlzLmhpZ2hTY29yZXMgPSBbXTtcclxuICAgIHRoaXMuaXNIaWRkZW4gPSBmYWxzZTtcclxuICAgIHRoaXMubXlzaGlwXyA9IG51bGw7XHJcbiAgICB0aGlzLmVuZW1pZXMgPSBudWxsO1xyXG4gICAgdGhpcy5lbmVteUJ1bGxldHMgPSBudWxsO1xyXG4gICAgdGhpcy5QSSA9IE1hdGguUEk7XHJcbiAgICB0aGlzLmNvbW1fID0gbnVsbDtcclxuICAgIHRoaXMuaGFuZGxlTmFtZSA9ICcnO1xyXG4gICAgdGhpcy5zdG9yYWdlID0gbnVsbDtcclxuICAgIHRoaXMucmFuayA9IC0xO1xyXG4gICAgdGhpcy5zb3VuZEVmZmVjdHMgPSBudWxsO1xyXG4gICAgdGhpcy5lbnMgPSBudWxsO1xyXG4gICAgdGhpcy5lbmJzID0gbnVsbDtcclxuICAgIHRoaXMuc3RhZ2UgPSBzZmcuc3RhZ2UgPSBuZXcgU3RhZ2UoKTtcclxuICAgIHRoaXMudGl0bGUgPSBudWxsOy8vIOOCv+OCpOODiOODq+ODoeODg+OCt+ODpVxyXG4gICAgdGhpcy5zcGFjZUZpZWxkID0gbnVsbDsvLyDlroflrpnnqbrplpPjg5Hjg7zjg4bjgqPjgq/jg6tcclxuICAgIHRoaXMuZWRpdEhhbmRsZU5hbWUgPSBudWxsO1xyXG4gICAgc2ZnLmFkZFNjb3JlID0gdGhpcy5hZGRTY29yZS5iaW5kKHRoaXMpO1xyXG4gICAgdGhpcy5jaGVja1Zpc2liaWxpdHlBUEkoKTtcclxuICAgIHRoaXMuYXVkaW9fID0gbmV3IGF1ZGlvLkF1ZGlvKCk7XHJcbiAgfVxyXG5cclxuICBleGVjKCkge1xyXG4gICAgXHJcbiAgICBpZiAoIXRoaXMuY2hlY2tCcm93c2VyU3VwcG9ydCgnI2NvbnRlbnQnKSl7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnNlcXVlbmNlciA9IG5ldyBhdWRpby5TZXF1ZW5jZXIodGhpcy5hdWRpb18pO1xyXG4gICAgLy9waWFubyA9IG5ldyBhdWRpby5QaWFubyhhdWRpb18pO1xyXG4gICAgdGhpcy5zb3VuZEVmZmVjdHMgPSBuZXcgYXVkaW8uU291bmRFZmZlY3RzKHRoaXMuc2VxdWVuY2VyKTtcclxuXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKHdpbmRvdy52aXNpYmlsaXR5Q2hhbmdlLCB0aGlzLm9uVmlzaWJpbGl0eUNoYW5nZS5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcbiAgICBzZmcuZ2FtZVRpbWVyID0gbmV3IHV0aWwuR2FtZVRpbWVyKHRoaXMuZ2V0Q3VycmVudFRpbWUuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgLy8vIOOCsuODvOODoOOCs+ODs+OCveODvOODq+OBruWIneacn+WMllxyXG4gICAgdGhpcy5pbml0Q29uc29sZSgpO1xyXG4gICAgdGhpcy5sb2FkUmVzb3VyY2VzKClcclxuICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuc2NlbmUucmVtb3ZlKHRoaXMucHJvZ3Jlc3MubWVzaCk7XHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5zY2VuZSwgdGhpcy5jYW1lcmEpO1xyXG4gICAgICAgIHRoaXMudGFza3MuY2xlYXIoKTtcclxuICAgICAgICB0aGlzLnRhc2tzLnB1c2hUYXNrKHRoaXMuYmFzaWNJbnB1dC51cGRhdGUuYmluZCh0aGlzLmJhc2ljSW5wdXQpKTtcclxuICAgICAgICB0aGlzLnRhc2tzLnB1c2hUYXNrKHRoaXMuaW5pdC5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnN0YXJ0ID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLm1haW4oKTtcclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICBjaGVja1Zpc2liaWxpdHlBUEkoKSB7XHJcbiAgICAvLyBoaWRkZW4g44OX44Ot44OR44OG44Kj44GK44KI44Gz5Y+v6KaW5oCn44Gu5aSJ5pu044Kk44OZ44Oz44OI44Gu5ZCN5YmN44KS6Kit5a6aXHJcbiAgICBpZiAodHlwZW9mIGRvY3VtZW50LmhpZGRlbiAhPT0gXCJ1bmRlZmluZWRcIikgeyAvLyBPcGVyYSAxMi4xMCDjgoQgRmlyZWZveCAxOCDku6XpmY3jgafjgrXjg53jg7zjg4ggXHJcbiAgICAgIHRoaXMuaGlkZGVuID0gXCJoaWRkZW5cIjtcclxuICAgICAgd2luZG93LnZpc2liaWxpdHlDaGFuZ2UgPSBcInZpc2liaWxpdHljaGFuZ2VcIjtcclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRvY3VtZW50Lm1vekhpZGRlbiAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICB0aGlzLmhpZGRlbiA9IFwibW96SGlkZGVuXCI7XHJcbiAgICAgIHdpbmRvdy52aXNpYmlsaXR5Q2hhbmdlID0gXCJtb3p2aXNpYmlsaXR5Y2hhbmdlXCI7XHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkb2N1bWVudC5tc0hpZGRlbiAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICB0aGlzLmhpZGRlbiA9IFwibXNIaWRkZW5cIjtcclxuICAgICAgd2luZG93LnZpc2liaWxpdHlDaGFuZ2UgPSBcIm1zdmlzaWJpbGl0eWNoYW5nZVwiO1xyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZG9jdW1lbnQud2Via2l0SGlkZGVuICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgIHRoaXMuaGlkZGVuID0gXCJ3ZWJraXRIaWRkZW5cIjtcclxuICAgICAgd2luZG93LnZpc2liaWxpdHlDaGFuZ2UgPSBcIndlYmtpdHZpc2liaWxpdHljaGFuZ2VcIjtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgY2FsY1NjcmVlblNpemUoKSB7XHJcbiAgICB2YXIgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcclxuICAgIHZhciBoZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcbiAgICBpZiAod2lkdGggPj0gaGVpZ2h0KSB7XHJcbiAgICAgIHdpZHRoID0gaGVpZ2h0ICogc2ZnLlZJUlRVQUxfV0lEVEggLyBzZmcuVklSVFVBTF9IRUlHSFQ7XHJcbiAgICAgIHdoaWxlICh3aWR0aCA+IHdpbmRvdy5pbm5lcldpZHRoKSB7XHJcbiAgICAgICAgLS1oZWlnaHQ7XHJcbiAgICAgICAgd2lkdGggPSBoZWlnaHQgKiBzZmcuVklSVFVBTF9XSURUSCAvIHNmZy5WSVJUVUFMX0hFSUdIVDtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaGVpZ2h0ID0gd2lkdGggKiBzZmcuVklSVFVBTF9IRUlHSFQgLyBzZmcuVklSVFVBTF9XSURUSDtcclxuICAgICAgd2hpbGUgKGhlaWdodCA+IHdpbmRvdy5pbm5lckhlaWdodCkge1xyXG4gICAgICAgIC0td2lkdGg7XHJcbiAgICAgICAgaGVpZ2h0ID0gd2lkdGggKiBzZmcuVklSVFVBTF9IRUlHSFQgLyBzZmcuVklSVFVBTF9XSURUSDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5DT05TT0xFX1dJRFRIID0gd2lkdGg7XHJcbiAgICB0aGlzLkNPTlNPTEVfSEVJR0hUID0gaGVpZ2h0O1xyXG4gIH1cclxuICBcclxuICAvLy8g44Kz44Oz44K944O844Or55S76Z2i44Gu5Yid5pyf5YyWXHJcbiAgaW5pdENvbnNvbGUoY29uc29sZUNsYXNzKSB7XHJcbiAgICAvLyDjg6zjg7Pjg4Djg6njg7zjga7kvZzmiJBcclxuICAgIHRoaXMucmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcih7IGFudGlhbGlhczogZmFsc2UsIHNvcnRPYmplY3RzOiB0cnVlIH0pO1xyXG4gICAgdmFyIHJlbmRlcmVyID0gdGhpcy5yZW5kZXJlcjtcclxuICAgIHRoaXMuY2FsY1NjcmVlblNpemUoKTtcclxuICAgIHJlbmRlcmVyLnNldFNpemUodGhpcy5DT05TT0xFX1dJRFRILCB0aGlzLkNPTlNPTEVfSEVJR0hUKTtcclxuICAgIHJlbmRlcmVyLnNldENsZWFyQ29sb3IoMCwgMSk7XHJcbiAgICByZW5kZXJlci5kb21FbGVtZW50LmlkID0gJ2NvbnNvbGUnO1xyXG4gICAgcmVuZGVyZXIuZG9tRWxlbWVudC5jbGFzc05hbWUgPSBjb25zb2xlQ2xhc3MgfHwgJ2NvbnNvbGUnO1xyXG4gICAgcmVuZGVyZXIuZG9tRWxlbWVudC5zdHlsZS56SW5kZXggPSAwO1xyXG5cclxuXHJcbiAgICBkMy5zZWxlY3QoJyNjb250ZW50Jykubm9kZSgpLmFwcGVuZENoaWxkKHJlbmRlcmVyLmRvbUVsZW1lbnQpO1xyXG5cclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuY2FsY1NjcmVlblNpemUoKTtcclxuICAgICAgcmVuZGVyZXIuc2V0U2l6ZSh0aGlzLkNPTlNPTEVfV0lEVEgsIHRoaXMuQ09OU09MRV9IRUlHSFQpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8g44K344O844Oz44Gu5L2c5oiQXHJcbiAgICB0aGlzLnNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XHJcblxyXG4gICAgLy8g44Kr44Oh44Op44Gu5L2c5oiQXHJcbiAgICB0aGlzLmNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSg5MC4wLCBzZmcuVklSVFVBTF9XSURUSCAvIHNmZy5WSVJUVUFMX0hFSUdIVCk7XHJcbiAgICB0aGlzLmNhbWVyYS5wb3NpdGlvbi56ID0gc2ZnLlZJUlRVQUxfSEVJR0hUIC8gMjtcclxuICAgIHRoaXMuY2FtZXJhLmxvb2tBdChuZXcgVEhSRUUuVmVjdG9yMygwLCAwLCAwKSk7XHJcblxyXG4gICAgLy8g44Op44Kk44OI44Gu5L2c5oiQXHJcbiAgICAvL3ZhciBsaWdodCA9IG5ldyBUSFJFRS5EaXJlY3Rpb25hbExpZ2h0KDB4ZmZmZmZmKTtcclxuICAgIC8vbGlnaHQucG9zaXRpb24gPSBuZXcgVEhSRUUuVmVjdG9yMygwLjU3NywgMC41NzcsIDAuNTc3KTtcclxuICAgIC8vc2NlbmUuYWRkKGxpZ2h0KTtcclxuXHJcbiAgICAvL3ZhciBhbWJpZW50ID0gbmV3IFRIUkVFLkFtYmllbnRMaWdodCgweGZmZmZmZik7XHJcbiAgICAvL3NjZW5lLmFkZChhbWJpZW50KTtcclxuICAgIHJlbmRlcmVyLmNsZWFyKCk7XHJcbiAgfVxyXG5cclxuICAvLy8g44Ko44Op44O844Gn57WC5LqG44GZ44KL44CCXHJcbiAgRXhpdEVycm9yKGUpIHtcclxuICAgIC8vY3R4LmZpbGxTdHlsZSA9IFwicmVkXCI7XHJcbiAgICAvL2N0eC5maWxsUmVjdCgwLCAwLCBDT05TT0xFX1dJRFRILCBDT05TT0xFX0hFSUdIVCk7XHJcbiAgICAvL2N0eC5maWxsU3R5bGUgPSBcIndoaXRlXCI7XHJcbiAgICAvL2N0eC5maWxsVGV4dChcIkVycm9yIDogXCIgKyBlLCAwLCAyMCk7XHJcbiAgICAvLy8vYWxlcnQoZSk7XHJcbiAgICB0aGlzLnN0YXJ0ID0gZmFsc2U7XHJcbiAgICB0aHJvdyBlO1xyXG4gIH1cclxuXHJcbiAgb25WaXNpYmlsaXR5Q2hhbmdlKCkge1xyXG4gICAgdmFyIGggPSBkb2N1bWVudFt0aGlzLmhpZGRlbl07XHJcbiAgICB0aGlzLmlzSGlkZGVuID0gaDtcclxuICAgIGlmIChoKSB7XHJcbiAgICAgIHRoaXMucGF1c2UoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMucmVzdW1lKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwYXVzZSgpIHtcclxuICAgIGlmIChzZmcuZ2FtZVRpbWVyLnN0YXR1cyA9PSBzZmcuZ2FtZVRpbWVyLlNUQVJUKSB7XHJcbiAgICAgIHNmZy5nYW1lVGltZXIucGF1c2UoKTtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnNlcXVlbmNlci5zdGF0dXMgPT0gdGhpcy5zZXF1ZW5jZXIuUExBWSkge1xyXG4gICAgICB0aGlzLnNlcXVlbmNlci5wYXVzZSgpO1xyXG4gICAgfVxyXG4gICAgc2ZnLnBhdXNlID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIHJlc3VtZSgpIHtcclxuICAgIGlmIChzZmcuZ2FtZVRpbWVyLnN0YXR1cyA9PSBzZmcuZ2FtZVRpbWVyLlBBVVNFKSB7XHJcbiAgICAgIHNmZy5nYW1lVGltZXIucmVzdW1lKCk7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5zZXF1ZW5jZXIuc3RhdHVzID09IHRoaXMuc2VxdWVuY2VyLlBBVVNFKSB7XHJcbiAgICAgIHRoaXMuc2VxdWVuY2VyLnJlc3VtZSgpO1xyXG4gICAgfVxyXG4gICAgc2ZnLnBhdXNlID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvLy8g54++5Zyo5pmC6ZaT44Gu5Y+W5b6XXHJcbiAgZ2V0Q3VycmVudFRpbWUoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5hdWRpb18uYXVkaW9jdHguY3VycmVudFRpbWU7XHJcbiAgfVxyXG5cclxuICAvLy8g44OW44Op44Km44K244Gu5qmf6IO944OB44Kn44OD44KvXHJcbiAgY2hlY2tCcm93c2VyU3VwcG9ydCgpIHtcclxuICAgIHZhciBjb250ZW50ID0gJzxpbWcgY2xhc3M9XCJlcnJvcmltZ1wiIHNyYz1cImh0dHA6Ly9wdWJsaWMuYmx1LmxpdmVmaWxlc3RvcmUuY29tL3kycGJZM2FxQno2d3o0YWg4N1JYRVZrNUNsaEQyTHVqQzVOczY2SEt2Ujg5YWpyRmRMTTBUeEZlcllZVVJ0ODNjX2JnMzVIU2txYzNFOEd4YUZEOC1YOTRNTHNGVjVHVTZCWXAxOTVJdmVnZXZRLzIwMTMxMDAxLnBuZz9wc2lkPTFcIiB3aWR0aD1cIjQ3OVwiIGhlaWdodD1cIjY0MFwiIGNsYXNzPVwiYWxpZ25ub25lXCIgLz4nO1xyXG4gICAgLy8gV2ViR0zjga7jgrXjg53jg7zjg4jjg4Hjgqfjg4Pjgq9cclxuICAgIGlmICghRGV0ZWN0b3Iud2ViZ2wpIHtcclxuICAgICAgZDMuc2VsZWN0KCcjY29udGVudCcpLmFwcGVuZCgnZGl2JykuY2xhc3NlZCgnZXJyb3InLCB0cnVlKS5odG1sKFxyXG4gICAgICAgIGNvbnRlbnQgKyAnPHAgY2xhc3M9XCJlcnJvcnRleHRcIj7jg5bjg6njgqbjgrbjgYw8YnIvPldlYkdM44KS44K144Od44O844OI44GX44Gm44GE44Gq44GE44Gf44KBPGJyLz7li5XkvZzjgYTjgZ/jgZfjgb7jgZvjgpPjgII8L3A+Jyk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBXZWIgQXVkaW8gQVBJ44Op44OD44OR44O8XHJcbiAgICBpZiAoIXRoaXMuYXVkaW9fLmVuYWJsZSkge1xyXG4gICAgICBkMy5zZWxlY3QoJyNjb250ZW50JykuYXBwZW5kKCdkaXYnKS5jbGFzc2VkKCdlcnJvcicsIHRydWUpLmh0bWwoXHJcbiAgICAgICAgY29udGVudCArICc8cCBjbGFzcz1cImVycm9ydGV4dFwiPuODluODqeOCpuOCtuOBjDxici8+V2ViIEF1ZGlvIEFQSeOCkuOCteODneODvOODiOOBl+OBpuOBhOOBquOBhOOBn+OCgTxici8+5YuV5L2c44GE44Gf44GX44G+44Gb44KT44CCPC9wPicpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8g44OW44Op44Km44K244GMUGFnZSBWaXNpYmlsaXR5IEFQSSDjgpLjgrXjg53jg7zjg4jjgZfjgarjgYTloLTlkIjjgavorablkYogXHJcbiAgICBpZiAodHlwZW9mIHRoaXMuaGlkZGVuID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICBkMy5zZWxlY3QoJyNjb250ZW50JykuYXBwZW5kKCdkaXYnKS5jbGFzc2VkKCdlcnJvcicsIHRydWUpLmh0bWwoXHJcbiAgICAgICAgY29udGVudCArICc8cCBjbGFzcz1cImVycm9ydGV4dFwiPuODluODqeOCpuOCtuOBjDxici8+UGFnZSBWaXNpYmlsaXR5IEFQSeOCkuOCteODneODvOODiOOBl+OBpuOBhOOBquOBhOOBn+OCgTxici8+5YuV5L2c44GE44Gf44GX44G+44Gb44KT44CCPC9wPicpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHR5cGVvZiBsb2NhbFN0b3JhZ2UgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIGQzLnNlbGVjdCgnI2NvbnRlbnQnKS5hcHBlbmQoJ2RpdicpLmNsYXNzZWQoJ2Vycm9yJywgdHJ1ZSkuaHRtbChcclxuICAgICAgICBjb250ZW50ICsgJzxwIGNsYXNzPVwiZXJyb3J0ZXh0XCI+44OW44Op44Km44K244GMPGJyLz5XZWIgTG9jYWwgU3RvcmFnZeOCkuOCteODneODvOODiOOBl+OBpuOBhOOBquOBhOOBn+OCgTxici8+5YuV5L2c44GE44Gf44GX44G+44Gb44KT44CCPC9wPicpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnN0b3JhZ2UgPSBsb2NhbFN0b3JhZ2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbiBcclxuICAvLy8g44Ky44O844Og44Oh44Kk44OzXHJcbiAgbWFpbigpIHtcclxuICAgIC8vIOOCv+OCueOCr+OBruWRvOOBs+WHuuOBl1xyXG4gICAgLy8g44Oh44Kk44Oz44Gr5o+P55S7XHJcbiAgICBpZiAodGhpcy5zdGFydCkge1xyXG4gICAgICB0aGlzLnRhc2tzLnByb2Nlc3ModGhpcyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBsb2FkUmVzb3VyY2VzKCkge1xyXG4gICAgLy8vIOOCsuODvOODoOS4reOBruODhuOCr+OCueODgeODo+ODvOWumue+qVxyXG4gICAgdmFyIHRleHR1cmVzID0ge1xyXG4gICAgICBmb250OiAnRm9udC5wbmcnLFxyXG4gICAgICBmb250MTogJ0ZvbnQyLnBuZycsXHJcbiAgICAgIGF1dGhvcjogJ2F1dGhvci5wbmcnLFxyXG4gICAgICB0aXRsZTogJ1RJVExFLnBuZycsXHJcbiAgICAgIG15c2hpcDogJ215c2hpcDIucG5nJyxcclxuICAgICAgZW5lbXk6ICdlbmVteS5wbmcnLFxyXG4gICAgICBib21iOiAnYm9tYi5wbmcnXHJcbiAgICB9O1xyXG4gICAgLy8vIOODhuOCr+OCueODgeODo+ODvOOBruODreODvOODiVxyXG4gIFxyXG4gICAgdmFyIGxvYWRQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKCk7XHJcbiAgICB2YXIgbG9hZGVyID0gbmV3IFRIUkVFLlRleHR1cmVMb2FkZXIoKTtcclxuICAgIGZ1bmN0aW9uIGxvYWRUZXh0dXJlKHNyYykge1xyXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgIGxvYWRlci5sb2FkKHNyYywgKHRleHR1cmUpID0+IHtcclxuICAgICAgICAgIHRleHR1cmUubWFnRmlsdGVyID0gVEhSRUUuTmVhcmVzdEZpbHRlcjtcclxuICAgICAgICAgIHRleHR1cmUubWluRmlsdGVyID0gVEhSRUUuTGluZWFyTWlwTWFwTGluZWFyRmlsdGVyO1xyXG4gICAgICAgICAgcmVzb2x2ZSh0ZXh0dXJlKTtcclxuICAgICAgICB9LCBudWxsLCAoeGhyKSA9PiB7IHJlamVjdCh4aHIpIH0pO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgdGV4TGVuZ3RoID0gT2JqZWN0LmtleXModGV4dHVyZXMpLmxlbmd0aDtcclxuICAgIHZhciB0ZXhDb3VudCA9IDA7XHJcbiAgICB0aGlzLnByb2dyZXNzID0gbmV3IGdyYXBoaWNzLlByb2dyZXNzKCk7XHJcbiAgICB0aGlzLnByb2dyZXNzLm1lc2gucG9zaXRpb24ueiA9IDAuMDAxO1xyXG4gICAgdGhpcy5wcm9ncmVzcy5yZW5kZXIoJ0xvYWRpbmcgUmVzb3VjZXMgLi4uJywgMCk7XHJcbiAgICB0aGlzLnNjZW5lLmFkZCh0aGlzLnByb2dyZXNzLm1lc2gpO1xyXG4gICAgZm9yICh2YXIgbiBpbiB0ZXh0dXJlcykge1xyXG4gICAgICAoKG5hbWUsIHRleFBhdGgpID0+IHtcclxuICAgICAgICBsb2FkUHJvbWlzZSA9IGxvYWRQcm9taXNlXHJcbiAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBsb2FkVGV4dHVyZSgnLi9yZXMvJyArIHRleFBhdGgpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC50aGVuKCh0ZXgpID0+IHtcclxuICAgICAgICAgICAgdGV4Q291bnQrKztcclxuICAgICAgICAgICAgdGhpcy5wcm9ncmVzcy5yZW5kZXIoJ0xvYWRpbmcgUmVzb3VjZXMgLi4uJywgKHRleENvdW50IC8gdGV4TGVuZ3RoICogMTAwKSB8IDApO1xyXG4gICAgICAgICAgICBzZmcudGV4dHVyZUZpbGVzW25hbWVdID0gdGV4O1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLnNjZW5lLCB0aGlzLmNhbWVyYSk7XHJcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9KShuLCB0ZXh0dXJlc1tuXSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbG9hZFByb21pc2U7XHJcbiAgfVxyXG5cclxuKnJlbmRlcih0YXNrSW5kZXgpIHtcclxuICB3aGlsZSh0YXNrSW5kZXggPj0gMCl7XHJcbiAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLnNjZW5lLCB0aGlzLmNhbWVyYSk7XHJcbiAgICB0aGlzLnRleHRQbGFuZS5yZW5kZXIoKTtcclxuICAgIHRoaXMuc3RhdHMgJiYgdGhpcy5zdGF0cy51cGRhdGUoKTtcclxuICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gIH1cclxufVxyXG5cclxuaW5pdEFjdG9ycygpXHJcbntcclxuICBsZXQgcHJvbWlzZXMgPSBbXTtcclxuICB0aGlzLnNjZW5lID0gdGhpcy5zY2VuZSB8fCBuZXcgVEhSRUUuU2NlbmUoKTtcclxuICB0aGlzLmVuZW15QnVsbGV0cyA9IHRoaXMuZW5lbXlCdWxsZXRzIHx8IG5ldyBlbmVtaWVzLkVuZW15QnVsbGV0cyh0aGlzLnNjZW5lLCB0aGlzLnNlLmJpbmQodGhpcykpO1xyXG4gIHRoaXMuZW5lbWllcyA9IHRoaXMuZW5lbWllcyB8fCBuZXcgZW5lbWllcy5FbmVtaWVzKHRoaXMuc2NlbmUsIHRoaXMuc2UuYmluZCh0aGlzKSwgdGhpcy5lbmVteUJ1bGxldHMpO1xyXG4gIHByb21pc2VzLnB1c2godGhpcy5lbmVtaWVzLmxvYWRQYXR0ZXJucygpKTtcclxuICBwcm9taXNlcy5wdXNoKHRoaXMuZW5lbWllcy5sb2FkRm9ybWF0aW9ucygpKTtcclxuICB0aGlzLmJvbWJzID0gc2ZnLmJvbWJzID0gdGhpcy5ib21icyB8fCBuZXcgZWZmZWN0b2JqLkJvbWJzKHRoaXMuc2NlbmUsIHRoaXMuc2UuYmluZCh0aGlzKSk7XHJcbiAgdGhpcy5teXNoaXBfID0gdGhpcy5teXNoaXBfIHx8IG5ldyBteXNoaXAuTXlTaGlwKDAsIC0xMDAsIDAuMSwgdGhpcy5zY2VuZSwgdGhpcy5zZS5iaW5kKHRoaXMpKTtcclxuICBzZmcubXlzaGlwXyA9IHRoaXMubXlzaGlwXztcclxuICB0aGlzLm15c2hpcF8ubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcblxyXG4gIHRoaXMuc3BhY2VGaWVsZCA9IG51bGw7XHJcbiAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcclxufVxyXG5cclxuaW5pdENvbW1BbmRIaWdoU2NvcmUoKVxyXG57XHJcbiAgLy8g44OP44Oz44OJ44Or44ON44O844Og44Gu5Y+W5b6XXHJcbiAgdGhpcy5oYW5kbGVOYW1lID0gdGhpcy5zdG9yYWdlLmdldEl0ZW0oJ2hhbmRsZU5hbWUnKTtcclxuXHJcbiAgdGhpcy50ZXh0UGxhbmUgPSBuZXcgdGV4dC5UZXh0UGxhbmUodGhpcy5zY2VuZSk7XHJcbiAgLy8gdGV4dFBsYW5lLnByaW50KDAsIDAsIFwiV2ViIEF1ZGlvIEFQSSBUZXN0XCIsIG5ldyBUZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICAvLyDjgrnjgrPjgqLmg4XloLEg6YCa5L+h55SoXHJcbiAgdGhpcy5jb21tXyA9IG5ldyBjb21tLkNvbW0oKTtcclxuICB0aGlzLmNvbW1fLnVwZGF0ZUhpZ2hTY29yZXMgPSAoZGF0YSkgPT4ge1xyXG4gICAgdGhpcy5oaWdoU2NvcmVzID0gZGF0YTtcclxuICAgIHRoaXMuaGlnaFNjb3JlID0gdGhpcy5oaWdoU2NvcmVzWzBdLnNjb3JlO1xyXG4gIH07XHJcblxyXG4gIHRoaXMuY29tbV8udXBkYXRlSGlnaFNjb3JlID0gKGRhdGEpID0+IHtcclxuICAgIGlmICh0aGlzLmhpZ2hTY29yZSA8IGRhdGEuc2NvcmUpIHtcclxuICAgICAgdGhpcy5oaWdoU2NvcmUgPSBkYXRhLnNjb3JlO1xyXG4gICAgICB0aGlzLnByaW50U2NvcmUoKTtcclxuICAgIH1cclxuICB9O1xyXG4gIFxyXG59XHJcblxyXG4qaW5pdCh0YXNrSW5kZXgpIHtcclxuICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gICAgdGhpcy5pbml0Q29tbUFuZEhpZ2hTY29yZSgpO1xyXG4gICAgdGhpcy5iYXNpY0lucHV0LmJpbmQoKTtcclxuICAgIHRoaXMuaW5pdEFjdG9ycygpXHJcbiAgICAudGhlbigoKT0+e1xyXG4gICAgICB0aGlzLnRhc2tzLnB1c2hUYXNrKHRoaXMucmVuZGVyLmJpbmQodGhpcyksIHRoaXMuUkVOREVSRVJfUFJJT1JJVFkpO1xyXG4gICAgICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5wcmludEF1dGhvci5iaW5kKHRoaXMpKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG4vLy8g5L2c6ICF6KGo56S6XHJcbipwcmludEF1dGhvcih0YXNrSW5kZXgpIHtcclxuICBjb25zdCB3YWl0ID0gNjA7XHJcbiAgdGhpcy5iYXNpY0lucHV0LmtleUJ1ZmZlci5sZW5ndGggPSAwO1xyXG4gIFxyXG4gIGxldCBuZXh0VGFzayA9ICgpPT57XHJcbiAgICB0aGlzLnNjZW5lLnJlbW92ZSh0aGlzLmF1dGhvcik7XHJcbiAgICAvL3NjZW5lLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLmluaXRUaXRsZS5iaW5kKHRoaXMpKTtcclxuICB9XHJcbiAgXHJcbiAgbGV0IGNoZWNrS2V5SW5wdXQgPSAoKT0+IHtcclxuICAgIGlmICh0aGlzLmJhc2ljSW5wdXQua2V5QnVmZmVyLmxlbmd0aCA+IDAgfHwgdGhpcy5iYXNpY0lucHV0LnN0YXJ0KSB7XHJcbiAgICAgIHRoaXMuYmFzaWNJbnB1dC5rZXlCdWZmZXIubGVuZ3RoID0gMDtcclxuICAgICAgbmV4dFRhc2soKTtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfSAgXHJcblxyXG4gIC8vIOWIneacn+WMllxyXG4gIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICB2YXIgdyA9IHNmZy50ZXh0dXJlRmlsZXMuYXV0aG9yLmltYWdlLndpZHRoO1xyXG4gIHZhciBoID0gc2ZnLnRleHR1cmVGaWxlcy5hdXRob3IuaW1hZ2UuaGVpZ2h0O1xyXG4gIGNhbnZhcy53aWR0aCA9IHc7XHJcbiAgY2FudmFzLmhlaWdodCA9IGg7XHJcbiAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gIGN0eC5kcmF3SW1hZ2Uoc2ZnLnRleHR1cmVGaWxlcy5hdXRob3IuaW1hZ2UsIDAsIDApO1xyXG4gIHZhciBkYXRhID0gY3R4LmdldEltYWdlRGF0YSgwLCAwLCB3LCBoKTtcclxuICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTtcclxuXHJcbiAgZ2VvbWV0cnkudmVydF9zdGFydCA9IFtdO1xyXG4gIGdlb21ldHJ5LnZlcnRfZW5kID0gW107XHJcblxyXG4gIHtcclxuICAgIHZhciBpID0gMDtcclxuXHJcbiAgICBmb3IgKHZhciB5ID0gMDsgeSA8IGg7ICsreSkge1xyXG4gICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHc7ICsreCkge1xyXG4gICAgICAgIHZhciBjb2xvciA9IG5ldyBUSFJFRS5Db2xvcigpO1xyXG5cclxuICAgICAgICB2YXIgciA9IGRhdGEuZGF0YVtpKytdO1xyXG4gICAgICAgIHZhciBnID0gZGF0YS5kYXRhW2krK107XHJcbiAgICAgICAgdmFyIGIgPSBkYXRhLmRhdGFbaSsrXTtcclxuICAgICAgICB2YXIgYSA9IGRhdGEuZGF0YVtpKytdO1xyXG4gICAgICAgIGlmIChhICE9IDApIHtcclxuICAgICAgICAgIGNvbG9yLnNldFJHQihyIC8gMjU1LjAsIGcgLyAyNTUuMCwgYiAvIDI1NS4wKTtcclxuICAgICAgICAgIHZhciB2ZXJ0ID0gbmV3IFRIUkVFLlZlY3RvcjMoKCh4IC0gdyAvIDIuMCkpLCAoKHkgLSBoIC8gMikpICogLTEsIDAuMCk7XHJcbiAgICAgICAgICB2YXIgdmVydDIgPSBuZXcgVEhSRUUuVmVjdG9yMygxMjAwICogTWF0aC5yYW5kb20oKSAtIDYwMCwgMTIwMCAqIE1hdGgucmFuZG9tKCkgLSA2MDAsIDEyMDAgKiBNYXRoLnJhbmRvbSgpIC0gNjAwKTtcclxuICAgICAgICAgIGdlb21ldHJ5LnZlcnRfc3RhcnQucHVzaChuZXcgVEhSRUUuVmVjdG9yMyh2ZXJ0Mi54IC0gdmVydC54LCB2ZXJ0Mi55IC0gdmVydC55LCB2ZXJ0Mi56IC0gdmVydC56KSk7XHJcbiAgICAgICAgICBnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKHZlcnQyKTtcclxuICAgICAgICAgIGdlb21ldHJ5LnZlcnRfZW5kLnB1c2godmVydCk7XHJcbiAgICAgICAgICBnZW9tZXRyeS5jb2xvcnMucHVzaChjb2xvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyDjg57jg4bjg6rjgqLjg6vjgpLkvZzmiJBcclxuICAvL3ZhciB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSgnaW1hZ2VzL3BhcnRpY2xlMS5wbmcnKTtcclxuICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuUG9pbnRzTWF0ZXJpYWwoe3NpemU6IDIwLCBibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZyxcclxuICAgIHRyYW5zcGFyZW50OiB0cnVlLCB2ZXJ0ZXhDb2xvcnM6IHRydWUsIGRlcHRoVGVzdDogZmFsc2UvLywgbWFwOiB0ZXh0dXJlXHJcbiAgfSk7XHJcblxyXG4gIHRoaXMuYXV0aG9yID0gbmV3IFRIUkVFLlBvaW50cyhnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gIC8vICAgIGF1dGhvci5wb3NpdGlvbi54IGF1dGhvci5wb3NpdGlvbi55PSAgPTAuMCwgMC4wLCAwLjApO1xyXG5cclxuICAvL21lc2guc29ydFBhcnRpY2xlcyA9IGZhbHNlO1xyXG4gIC8vdmFyIG1lc2gxID0gbmV3IFRIUkVFLlBhcnRpY2xlU3lzdGVtKCk7XHJcbiAgLy9tZXNoLnNjYWxlLnggPSBtZXNoLnNjYWxlLnkgPSA4LjA7XHJcblxyXG4gIHRoaXMuc2NlbmUuYWRkKHRoaXMuYXV0aG9yKTsgIFxyXG5cclxuIFxyXG4gIC8vIOS9nOiAheihqOekuuOCueODhuODg+ODl++8kVxyXG4gIGZvcihsZXQgY291bnQgPSAxLjA7Y291bnQgPiAwOyhjb3VudCA8PSAwLjAxKT9jb3VudCAtPSAwLjAwMDU6Y291bnQgLT0gMC4wMDI1KVxyXG4gIHtcclxuICAgIC8vIOS9leOBi+OCreODvOWFpeWKm+OBjOOBguOBo+OBn+WgtOWQiOOBr+asoeOBruOCv+OCueOCr+OBuFxyXG4gICAgaWYoY2hlY2tLZXlJbnB1dCgpKXtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsZXQgZW5kID0gdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydGljZXMubGVuZ3RoO1xyXG4gICAgbGV0IHYgPSB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlcztcclxuICAgIGxldCBkID0gdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydF9zdGFydDtcclxuICAgIGxldCB2MiA9IHRoaXMuYXV0aG9yLmdlb21ldHJ5LnZlcnRfZW5kO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgICB2W2ldLnggPSB2MltpXS54ICsgZFtpXS54ICogY291bnQ7XHJcbiAgICAgIHZbaV0ueSA9IHYyW2ldLnkgKyBkW2ldLnkgKiBjb3VudDtcclxuICAgICAgdltpXS56ID0gdjJbaV0ueiArIGRbaV0ueiAqIGNvdW50O1xyXG4gICAgfVxyXG4gICAgdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydGljZXNOZWVkVXBkYXRlID0gdHJ1ZTtcclxuICAgIHRoaXMuYXV0aG9yLnJvdGF0aW9uLnggPSB0aGlzLmF1dGhvci5yb3RhdGlvbi55ID0gdGhpcy5hdXRob3Iucm90YXRpb24ueiA9IGNvdW50ICogNC4wO1xyXG4gICAgdGhpcy5hdXRob3IubWF0ZXJpYWwub3BhY2l0eSA9IDEuMDtcclxuICAgIHlpZWxkO1xyXG4gIH1cclxuICB0aGlzLmF1dGhvci5yb3RhdGlvbi54ID0gdGhpcy5hdXRob3Iucm90YXRpb24ueSA9IHRoaXMuYXV0aG9yLnJvdGF0aW9uLnogPSAwLjA7XHJcblxyXG4gIGZvciAobGV0IGkgPSAwLGUgPSB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlcy5sZW5ndGg7IGkgPCBlOyArK2kpIHtcclxuICAgIHRoaXMuYXV0aG9yLmdlb21ldHJ5LnZlcnRpY2VzW2ldLnggPSB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0X2VuZFtpXS54O1xyXG4gICAgdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydGljZXNbaV0ueSA9IHRoaXMuYXV0aG9yLmdlb21ldHJ5LnZlcnRfZW5kW2ldLnk7XHJcbiAgICB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlc1tpXS56ID0gdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydF9lbmRbaV0uejtcclxuICB9XHJcbiAgdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydGljZXNOZWVkVXBkYXRlID0gdHJ1ZTtcclxuXHJcbiAgLy8g5b6F44GhXHJcbiAgZm9yKGxldCBpID0gMDtpIDwgd2FpdDsrK2kpe1xyXG4gICAgLy8g5L2V44GL44Kt44O85YWl5Yqb44GM44GC44Gj44Gf5aC05ZCI44Gv5qyh44Gu44K/44K544Kv44G4XHJcbiAgICBpZihjaGVja0tleUlucHV0KCkpe1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5hdXRob3IubWF0ZXJpYWwuc2l6ZSA+IDIpIHtcclxuICAgICAgdGhpcy5hdXRob3IubWF0ZXJpYWwuc2l6ZSAtPSAwLjU7XHJcbiAgICAgIHRoaXMuYXV0aG9yLm1hdGVyaWFsLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIH0gICAgXHJcbiAgICB5aWVsZDtcclxuICB9XHJcblxyXG4gIC8vIOODleOCp+ODvOODieOCouOCpuODiFxyXG4gIGZvcihsZXQgY291bnQgPSAwLjA7Y291bnQgPD0gMS4wO2NvdW50ICs9IDAuMDUpXHJcbiAge1xyXG4gICAgLy8g5L2V44GL44Kt44O85YWl5Yqb44GM44GC44Gj44Gf5aC05ZCI44Gv5qyh44Gu44K/44K544Kv44G4XHJcbiAgICBpZihjaGVja0tleUlucHV0KCkpe1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB0aGlzLmF1dGhvci5tYXRlcmlhbC5vcGFjaXR5ID0gMS4wIC0gY291bnQ7XHJcbiAgICB0aGlzLmF1dGhvci5tYXRlcmlhbC5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICBcclxuICAgIHlpZWxkO1xyXG4gIH1cclxuXHJcbiAgdGhpcy5hdXRob3IubWF0ZXJpYWwub3BhY2l0eSA9IDAuMDsgXHJcbiAgdGhpcy5hdXRob3IubWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG5cclxuICAvLyDlvoXjgaFcclxuICBmb3IobGV0IGkgPSAwO2kgPCB3YWl0OysraSl7XHJcbiAgICAvLyDkvZXjgYvjgq3jg7zlhaXlipvjgYzjgYLjgaPjgZ/loLTlkIjjga/mrKHjga7jgr/jgrnjgq/jgbhcclxuICAgIGlmKGNoZWNrS2V5SW5wdXQoKSl7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHlpZWxkO1xyXG4gIH1cclxuICBuZXh0VGFzaygpO1xyXG59XHJcblxyXG4vLy8g44K/44Kk44OI44Or55S76Z2i5Yid5pyf5YyWIC8vL1xyXG4qaW5pdFRpdGxlKHRhc2tJbmRleCkge1xyXG4gIFxyXG4gIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gIFxyXG4gIHRoaXMuYmFzaWNJbnB1dC5jbGVhcigpO1xyXG5cclxuICAvLyDjgr/jgqTjg4jjg6vjg6Hjg4Pjgrfjg6Xjga7kvZzmiJDjg7vooajnpLogLy8vXHJcbiAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgbWFwOiBzZmcudGV4dHVyZUZpbGVzLnRpdGxlIH0pO1xyXG4gIG1hdGVyaWFsLnNoYWRpbmcgPSBUSFJFRS5GbGF0U2hhZGluZztcclxuICAvL21hdGVyaWFsLmFudGlhbGlhcyA9IGZhbHNlO1xyXG4gIG1hdGVyaWFsLnRyYW5zcGFyZW50ID0gdHJ1ZTtcclxuICBtYXRlcmlhbC5hbHBoYVRlc3QgPSAwLjU7XHJcbiAgbWF0ZXJpYWwuZGVwdGhUZXN0ID0gdHJ1ZTtcclxuICB0aGlzLnRpdGxlID0gbmV3IFRIUkVFLk1lc2goXHJcbiAgICBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeShzZmcudGV4dHVyZUZpbGVzLnRpdGxlLmltYWdlLndpZHRoLCBzZmcudGV4dHVyZUZpbGVzLnRpdGxlLmltYWdlLmhlaWdodCksXHJcbiAgICBtYXRlcmlhbFxyXG4gICAgKTtcclxuICB0aGlzLnRpdGxlLnNjYWxlLnggPSB0aGlzLnRpdGxlLnNjYWxlLnkgPSAwLjg7XHJcbiAgdGhpcy50aXRsZS5wb3NpdGlvbi55ID0gODA7XHJcbiAgdGhpcy5zY2VuZS5hZGQodGhpcy50aXRsZSk7XHJcbiAgdGhpcy5zaG93U3BhY2VGaWVsZCgpO1xyXG4gIC8vLyDjg4bjgq3jgrnjg4jooajnpLpcclxuICB0aGlzLnRleHRQbGFuZS5wcmludCgzLCAyNSwgXCJQdXNoIHogb3IgU1RBUlQgYnV0dG9uXCIsIG5ldyB0ZXh0LlRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gIHNmZy5nYW1lVGltZXIuc3RhcnQoKTtcclxuICB0aGlzLnNob3dUaXRsZS5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDEwLyrnp5IqLztcclxuICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5zaG93VGl0bGUuYmluZCh0aGlzKSk7XHJcbiAgcmV0dXJuO1xyXG59XHJcblxyXG4vLy8g6IOM5pmv44OR44O844OG44Kj44Kv44Or6KGo56S6XHJcbnNob3dTcGFjZUZpZWxkKCkge1xyXG4gIC8vLyDog4zmma/jg5Hjg7zjg4bjgqPjgq/jg6vooajnpLpcclxuICBpZiAoIXRoaXMuc3BhY2VGaWVsZCkge1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkdlb21ldHJ5KCk7XHJcblxyXG4gICAgZ2VvbWV0cnkuZW5keSA9IFtdO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAyNTA7ICsraSkge1xyXG4gICAgICB2YXIgY29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoKTtcclxuICAgICAgdmFyIHogPSAtMTgwMC4wICogTWF0aC5yYW5kb20oKSAtIDMwMC4wO1xyXG4gICAgICBjb2xvci5zZXRIU0woMC4wNSArIE1hdGgucmFuZG9tKCkgKiAwLjA1LCAxLjAsICgtMjEwMCAtIHopIC8gLTIxMDApO1xyXG4gICAgICB2YXIgZW5keSA9IHNmZy5WSVJUVUFMX0hFSUdIVCAvIDIgLSB6ICogc2ZnLlZJUlRVQUxfSEVJR0hUIC8gc2ZnLlZJUlRVQUxfV0lEVEg7XHJcbiAgICAgIHZhciB2ZXJ0MiA9IG5ldyBUSFJFRS5WZWN0b3IzKChzZmcuVklSVFVBTF9XSURUSCAtIHogKiAyKSAqIE1hdGgucmFuZG9tKCkgLSAoKHNmZy5WSVJUVUFMX1dJRFRIIC0geiAqIDIpIC8gMilcclxuICAgICAgICAsIGVuZHkgKiAyICogTWF0aC5yYW5kb20oKSAtIGVuZHksIHopO1xyXG4gICAgICBnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKHZlcnQyKTtcclxuICAgICAgZ2VvbWV0cnkuZW5keS5wdXNoKGVuZHkpO1xyXG5cclxuICAgICAgZ2VvbWV0cnkuY29sb3JzLnB1c2goY29sb3IpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIOODnuODhuODquOCouODq+OCkuS9nOaIkFxyXG4gICAgLy92YXIgdGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoJ2ltYWdlcy9wYXJ0aWNsZTEucG5nJyk7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuUG9pbnRzTWF0ZXJpYWwoe1xyXG4gICAgICBzaXplOiA0LCBibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZyxcclxuICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsIHZlcnRleENvbG9yczogdHJ1ZSwgZGVwdGhUZXN0OiB0cnVlLy8sIG1hcDogdGV4dHVyZVxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5zcGFjZUZpZWxkID0gbmV3IFRIUkVFLlBvaW50cyhnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gICAgdGhpcy5zcGFjZUZpZWxkLnBvc2l0aW9uLnggPSB0aGlzLnNwYWNlRmllbGQucG9zaXRpb24ueSA9IHRoaXMuc3BhY2VGaWVsZC5wb3NpdGlvbi56ID0gMC4wO1xyXG4gICAgdGhpcy5zY2VuZS5hZGQodGhpcy5zcGFjZUZpZWxkKTtcclxuICAgIHRoaXMudGFza3MucHVzaFRhc2sodGhpcy5tb3ZlU3BhY2VGaWVsZC5iaW5kKHRoaXMpKTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDlroflrpnnqbrplpPjga7ooajnpLpcclxuKm1vdmVTcGFjZUZpZWxkKHRhc2tJbmRleCkge1xyXG4gIHdoaWxlKHRydWUpe1xyXG4gICAgdmFyIHZlcnRzID0gdGhpcy5zcGFjZUZpZWxkLmdlb21ldHJ5LnZlcnRpY2VzO1xyXG4gICAgdmFyIGVuZHlzID0gdGhpcy5zcGFjZUZpZWxkLmdlb21ldHJ5LmVuZHk7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gdmVydHMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgdmVydHNbaV0ueSAtPSA0O1xyXG4gICAgICBpZiAodmVydHNbaV0ueSA8IC1lbmR5c1tpXSkge1xyXG4gICAgICAgIHZlcnRzW2ldLnkgPSBlbmR5c1tpXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5zcGFjZUZpZWxkLmdlb21ldHJ5LnZlcnRpY2VzTmVlZFVwZGF0ZSA9IHRydWU7XHJcbiAgICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDjgr/jgqTjg4jjg6vooajnpLpcclxuKnNob3dUaXRsZSh0YXNrSW5kZXgpIHtcclxuIHdoaWxlKHRydWUpe1xyXG4gIHNmZy5nYW1lVGltZXIudXBkYXRlKCk7XHJcblxyXG4gIGlmICh0aGlzLmJhc2ljSW5wdXQueiB8fCB0aGlzLmJhc2ljSW5wdXQuc3RhcnQgKSB7XHJcbiAgICB0aGlzLnNjZW5lLnJlbW92ZSh0aGlzLnRpdGxlKTtcclxuICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLmluaXRIYW5kbGVOYW1lLmJpbmQodGhpcykpO1xyXG4gIH1cclxuICBpZiAodGhpcy5zaG93VGl0bGUuZW5kVGltZSA8IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUpIHtcclxuICAgIHRoaXMuc2NlbmUucmVtb3ZlKHRoaXMudGl0bGUpO1xyXG4gICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuaW5pdFRvcDEwLmJpbmQodGhpcykpO1xyXG4gIH1cclxuICB5aWVsZDtcclxuIH1cclxufVxyXG5cclxuLy8vIOODj+ODs+ODieODq+ODjeODvOODoOOBruOCqOODs+ODiOODquWJjeWIneacn+WMllxyXG4qaW5pdEhhbmRsZU5hbWUodGFza0luZGV4KSB7XHJcbiAgbGV0IGVuZCA9IGZhbHNlO1xyXG4gIGlmICh0aGlzLmVkaXRIYW5kbGVOYW1lKXtcclxuICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLmdhbWVJbml0LmJpbmQodGhpcykpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0aGlzLmVkaXRIYW5kbGVOYW1lID0gdGhpcy5oYW5kbGVOYW1lIHx8ICcnO1xyXG4gICAgdGhpcy50ZXh0UGxhbmUuY2xzKCk7XHJcbiAgICB0aGlzLnRleHRQbGFuZS5wcmludCg0LCAxOCwgJ0lucHV0IHlvdXIgaGFuZGxlIG5hbWUuJyk7XHJcbiAgICB0aGlzLnRleHRQbGFuZS5wcmludCg4LCAxOSwgJyhNYXggOCBDaGFyKScpO1xyXG4gICAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMTAsIDIxLCB0aGlzLmVkaXRIYW5kbGVOYW1lKTtcclxuICAgIC8vICAgIHRleHRQbGFuZS5wcmludCgxMCwgMjEsIGhhbmRsZU5hbWVbMF0sIFRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gICAgdGhpcy5iYXNpY0lucHV0LnVuYmluZCgpO1xyXG4gICAgdmFyIGVsbSA9IGQzLnNlbGVjdCgnI2NvbnRlbnQnKS5hcHBlbmQoJ2lucHV0Jyk7XHJcbiAgICBsZXQgdGhpc18gPSB0aGlzO1xyXG4gICAgZWxtXHJcbiAgICAgIC5hdHRyKCd0eXBlJywgJ3RleHQnKVxyXG4gICAgICAuYXR0cigncGF0dGVybicsICdbYS16QS1aMC05X1xcQFxcI1xcJFxcLV17MCw4fScpXHJcbiAgICAgIC5hdHRyKCdtYXhsZW5ndGgnLCA4KVxyXG4gICAgICAuYXR0cignaWQnLCAnaW5wdXQtYXJlYScpXHJcbiAgICAgIC5hdHRyKCd2YWx1ZScsIHRoaXNfLmVkaXRIYW5kbGVOYW1lKVxyXG4gICAgICAuY2FsbChmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgIGQubm9kZSgpLnNlbGVjdGlvblN0YXJ0ID0gdGhpc18uZWRpdEhhbmRsZU5hbWUubGVuZ3RoO1xyXG4gICAgICB9KVxyXG4gICAgICAub24oJ2JsdXInLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgZDMuZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBkMy5ldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAvL2xldCB0aGlzXyA9IHRoaXM7XHJcbiAgICAgICAgc2V0VGltZW91dCggKCkgPT4geyB0aGlzLmZvY3VzKCk7IH0sIDEwKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5vbigna2V5dXAnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoZDMuZXZlbnQua2V5Q29kZSA9PSAxMykge1xyXG4gICAgICAgICAgdGhpc18uZWRpdEhhbmRsZU5hbWUgPSB0aGlzLnZhbHVlO1xyXG4gICAgICAgICAgbGV0IHMgPSB0aGlzLnNlbGVjdGlvblN0YXJ0O1xyXG4gICAgICAgICAgbGV0IGUgPSB0aGlzLnNlbGVjdGlvbkVuZDtcclxuICAgICAgICAgIHRoaXNfLnRleHRQbGFuZS5wcmludCgxMCwgMjEsIHRoaXNfLmVkaXRIYW5kbGVOYW1lKTtcclxuICAgICAgICAgIHRoaXNfLnRleHRQbGFuZS5wcmludCgxMCArIHMsIDIxLCAnXycsIG5ldyB0ZXh0LlRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLm9uKCdrZXl1cCcsIG51bGwpO1xyXG4gICAgICAgICAgdGhpc18uYmFzaWNJbnB1dC5iaW5kKCk7XHJcbiAgICAgICAgICAvLyDjgZPjga7jgr/jgrnjgq/jgpLntYLjgo/jgonjgZvjgotcclxuICAgICAgICAgIHRoaXNfLnRhc2tzLmFycmF5W3Rhc2tJbmRleF0uZ2VuSW5zdC5uZXh0KC0odGFza0luZGV4ICsgMSkpO1xyXG4gICAgICAgICAgLy8g5qyh44Gu44K/44K544Kv44KS6Kit5a6a44GZ44KLXHJcbiAgICAgICAgICB0aGlzXy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXNfLmdhbWVJbml0LmJpbmQodGhpc18pKTtcclxuICAgICAgICAgIHRoaXNfLnN0b3JhZ2Uuc2V0SXRlbSgnaGFuZGxlTmFtZScsIHRoaXNfLmVkaXRIYW5kbGVOYW1lKTtcclxuICAgICAgICAgIGQzLnNlbGVjdCgnI2lucHV0LWFyZWEnKS5yZW1vdmUoKTtcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpc18uZWRpdEhhbmRsZU5hbWUgPSB0aGlzLnZhbHVlO1xyXG4gICAgICAgIGxldCBzID0gdGhpcy5zZWxlY3Rpb25TdGFydDtcclxuICAgICAgICB0aGlzXy50ZXh0UGxhbmUucHJpbnQoMTAsIDIxLCAnICAgICAgICAgICAnKTtcclxuICAgICAgICB0aGlzXy50ZXh0UGxhbmUucHJpbnQoMTAsIDIxLCB0aGlzXy5lZGl0SGFuZGxlTmFtZSk7XHJcbiAgICAgICAgdGhpc18udGV4dFBsYW5lLnByaW50KDEwICsgcywgMjEsICdfJywgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5jYWxsKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLm5vZGUoKS5zZWxlY3Rpb25TdGFydDtcclxuICAgICAgICB0aGlzXy50ZXh0UGxhbmUucHJpbnQoMTAsIDIxLCAnICAgICAgICAgICAnKTtcclxuICAgICAgICB0aGlzXy50ZXh0UGxhbmUucHJpbnQoMTAsIDIxLCB0aGlzXy5lZGl0SGFuZGxlTmFtZSk7XHJcbiAgICAgICAgdGhpc18udGV4dFBsYW5lLnByaW50KDEwICsgcywgMjEsICdfJywgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgICAgICAgdGhpcy5ub2RlKCkuZm9jdXMoKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgd2hpbGUodGFza0luZGV4ID49IDApXHJcbiAgICB7XHJcbiAgICAgIHRoaXMuYmFzaWNJbnB1dC5jbGVhcigpO1xyXG4gICAgICBpZih0aGlzLmJhc2ljSW5wdXQuYUJ1dHRvbiB8fCB0aGlzLmJhc2ljSW5wdXQuc3RhcnQpXHJcbiAgICAgIHtcclxuICAgICAgICAgIHZhciBpbnB1dEFyZWEgPSBkMy5zZWxlY3QoJyNpbnB1dC1hcmVhJyk7XHJcbiAgICAgICAgICB2YXIgaW5wdXROb2RlID0gaW5wdXRBcmVhLm5vZGUoKTtcclxuICAgICAgICAgIHRoaXMuZWRpdEhhbmRsZU5hbWUgPSBpbnB1dE5vZGUudmFsdWU7XHJcbiAgICAgICAgICBsZXQgcyA9IGlucHV0Tm9kZS5zZWxlY3Rpb25TdGFydDtcclxuICAgICAgICAgIGxldCBlID0gaW5wdXROb2RlLnNlbGVjdGlvbkVuZDtcclxuICAgICAgICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDEwLCAyMSwgdGhpcy5lZGl0SGFuZGxlTmFtZSk7XHJcbiAgICAgICAgICB0aGlzLnRleHRQbGFuZS5wcmludCgxMCArIHMsIDIxLCAnXycsIG5ldyB0ZXh0LlRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gICAgICAgICAgaW5wdXRBcmVhLm9uKCdrZXl1cCcsIG51bGwpO1xyXG4gICAgICAgICAgdGhpcy5iYXNpY0lucHV0LmJpbmQoKTtcclxuICAgICAgICAgIC8vIOOBk+OBruOCv+OCueOCr+OCkue1guOCj+OCieOBm+OCi1xyXG4gICAgICAgICAgLy90aGlzLnRhc2tzLmFycmF5W3Rhc2tJbmRleF0uZ2VuSW5zdC5uZXh0KC0odGFza0luZGV4ICsgMSkpO1xyXG4gICAgICAgICAgLy8g5qyh44Gu44K/44K544Kv44KS6Kit5a6a44GZ44KLXHJcbiAgICAgICAgICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5nYW1lSW5pdC5iaW5kKHRoaXMpKTtcclxuICAgICAgICAgIHRoaXMuc3RvcmFnZS5zZXRJdGVtKCdoYW5kbGVOYW1lJywgdGhpcy5lZGl0SGFuZGxlTmFtZSk7XHJcbiAgICAgICAgICBpbnB1dEFyZWEucmVtb3ZlKCk7XHJcbiAgICAgICAgICByZXR1cm47ICAgICAgICBcclxuICAgICAgfVxyXG4gICAgICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICAgIH1cclxuICAgIHRhc2tJbmRleCA9IC0oKyt0YXNrSW5kZXgpO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOOCueOCs+OCouWKoOeul1xyXG5hZGRTY29yZShzKSB7XHJcbiAgdGhpcy5zY29yZSArPSBzO1xyXG4gIGlmICh0aGlzLnNjb3JlID4gdGhpcy5oaWdoU2NvcmUpIHtcclxuICAgIHRoaXMuaGlnaFNjb3JlID0gdGhpcy5zY29yZTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDjgrnjgrPjgqLooajnpLpcclxucHJpbnRTY29yZSgpIHtcclxuICB2YXIgcyA9ICgnMDAwMDAwMDAnICsgdGhpcy5zY29yZS50b1N0cmluZygpKS5zbGljZSgtOCk7XHJcbiAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMSwgMSwgcyk7XHJcblxyXG4gIHZhciBoID0gKCcwMDAwMDAwMCcgKyB0aGlzLmhpZ2hTY29yZS50b1N0cmluZygpKS5zbGljZSgtOCk7XHJcbiAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMTIsIDEsIGgpO1xyXG5cclxufVxyXG5cclxuLy8vIOOCteOCpuODs+ODieOCqOODleOCp+OCr+ODiFxyXG5zZShpbmRleCkge1xyXG4gIHRoaXMuc2VxdWVuY2VyLnBsYXlUcmFja3ModGhpcy5zb3VuZEVmZmVjdHMuc291bmRFZmZlY3RzW2luZGV4XSk7XHJcbn1cclxuXHJcbi8vLyDjgrLjg7zjg6Djga7liJ3mnJ/ljJZcclxuKmdhbWVJbml0KHRhc2tJbmRleCkge1xyXG5cclxuICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICBcclxuXHJcbiAgLy8g44Kq44O844OH44Kj44Kq44Gu6ZaL5aeLXHJcbiAgdGhpcy5hdWRpb18uc3RhcnQoKTtcclxuICB0aGlzLnNlcXVlbmNlci5sb2FkKGF1ZGlvLnNlcURhdGEpO1xyXG4gIHRoaXMuc2VxdWVuY2VyLnN0YXJ0KCk7XHJcbiAgc2ZnLnN0YWdlLnJlc2V0KCk7XHJcbiAgdGhpcy50ZXh0UGxhbmUuY2xzKCk7XHJcbiAgdGhpcy5lbmVtaWVzLnJlc2V0KCk7XHJcblxyXG4gIC8vIOiHquapn+OBruWIneacn+WMllxyXG4gIHRoaXMubXlzaGlwXy5pbml0KCk7XHJcbiAgc2ZnLmdhbWVUaW1lci5zdGFydCgpO1xyXG4gIHRoaXMuc2NvcmUgPSAwO1xyXG4gIHRoaXMudGV4dFBsYW5lLnByaW50KDIsIDAsICdTY29yZSAgICBIaWdoIFNjb3JlJyk7XHJcbiAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMjAsIDM5LCAnUmVzdDogICAnICsgc2ZnLm15c2hpcF8ucmVzdCk7XHJcbiAgdGhpcy5wcmludFNjb3JlKCk7XHJcbiAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuc3RhZ2VJbml0LmJpbmQodGhpcykvKmdhbWVBY3Rpb24qLyk7XHJcbn1cclxuXHJcbi8vLyDjgrnjg4bjg7zjgrjjga7liJ3mnJ/ljJZcclxuKnN0YWdlSW5pdCh0YXNrSW5kZXgpIHtcclxuICBcclxuICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICBcclxuICB0aGlzLnRleHRQbGFuZS5wcmludCgwLCAzOSwgJ1N0YWdlOicgKyBzZmcuc3RhZ2Uubm8pO1xyXG4gIHNmZy5nYW1lVGltZXIuc3RhcnQoKTtcclxuICB0aGlzLmVuZW1pZXMucmVzZXQoKTtcclxuICB0aGlzLmVuZW1pZXMuc3RhcnQoKTtcclxuICB0aGlzLmVuZW1pZXMuY2FsY0VuZW1pZXNDb3VudChzZmcuc3RhZ2UucHJpdmF0ZU5vKTtcclxuICB0aGlzLmVuZW1pZXMuaGl0RW5lbWllc0NvdW50ID0gMDtcclxuICB0aGlzLnRleHRQbGFuZS5wcmludCg4LCAxNSwgJ1N0YWdlICcgKyAoc2ZnLnN0YWdlLm5vKSArICcgU3RhcnQgISEnLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5zdGFnZVN0YXJ0LmJpbmQodGhpcykpO1xyXG59XHJcblxyXG4vLy8g44K544OG44O844K46ZaL5aeLXHJcbipzdGFnZVN0YXJ0KHRhc2tJbmRleCkge1xyXG4gIGxldCBlbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDI7XHJcbiAgd2hpbGUodGFza0luZGV4ID49IDAgJiYgZW5kVGltZSA+PSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lKXtcclxuICAgIHNmZy5nYW1lVGltZXIudXBkYXRlKCk7XHJcbiAgICBzZmcubXlzaGlwXy5hY3Rpb24odGhpcy5iYXNpY0lucHV0KTtcclxuICAgIHRhc2tJbmRleCA9IHlpZWxkOyAgICBcclxuICB9XHJcbiAgdGhpcy50ZXh0UGxhbmUucHJpbnQoOCwgMTUsICcgICAgICAgICAgICAgICAgICAnLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5nYW1lQWN0aW9uLmJpbmQodGhpcyksIDUwMDApO1xyXG59XHJcblxyXG4vLy8g44Ky44O844Og5LitXHJcbipnYW1lQWN0aW9uKHRhc2tJbmRleCkge1xyXG4gIHdoaWxlICh0YXNrSW5kZXggPj0gMCl7XHJcbiAgICB0aGlzLnByaW50U2NvcmUoKTtcclxuICAgIHNmZy5teXNoaXBfLmFjdGlvbih0aGlzLmJhc2ljSW5wdXQpO1xyXG4gICAgc2ZnLmdhbWVUaW1lci51cGRhdGUoKTtcclxuICAgIC8vY29uc29sZS5sb2coc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSk7XHJcbiAgICB0aGlzLmVuZW1pZXMubW92ZSgpO1xyXG5cclxuICAgIGlmICghdGhpcy5wcm9jZXNzQ29sbGlzaW9uKCkpIHtcclxuICAgICAgLy8g6Z2i44Kv44Oq44Ki44OB44Kn44OD44KvXHJcbiAgICAgIGlmICh0aGlzLmVuZW1pZXMuaGl0RW5lbWllc0NvdW50ID09IHRoaXMuZW5lbWllcy50b3RhbEVuZW1pZXNDb3VudCkge1xyXG4gICAgICAgIHRoaXMucHJpbnRTY29yZSgpO1xyXG4gICAgICAgIHRoaXMuc3RhZ2UuYWR2YW5jZSgpO1xyXG4gICAgICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLnN0YWdlSW5pdC5iaW5kKHRoaXMpKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMubXlTaGlwQm9tYi5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDM7XHJcbiAgICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLm15U2hpcEJvbWIuYmluZCh0aGlzKSk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH07XHJcbiAgICB0YXNrSW5kZXggPSB5aWVsZDsgXHJcbiAgfVxyXG59XHJcblxyXG4vLy8g5b2T44Gf44KK5Yik5a6aXHJcbnByb2Nlc3NDb2xsaXNpb24odGFza0luZGV4KSB7XHJcbiAgLy/jgIDoh6rmqZ/lvL7jgajmlbXjgajjga7jgYLjgZ/jgorliKTlrppcclxuICBsZXQgbXlCdWxsZXRzID0gc2ZnLm15c2hpcF8ubXlCdWxsZXRzO1xyXG4gIHRoaXMuZW5zID0gdGhpcy5lbmVtaWVzLmVuZW1pZXM7XHJcbiAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IG15QnVsbGV0cy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgbGV0IG15YiA9IG15QnVsbGV0c1tpXTtcclxuICAgIGlmIChteWIuZW5hYmxlXykge1xyXG4gICAgICB2YXIgbXliY28gPSBteUJ1bGxldHNbaV0uY29sbGlzaW9uQXJlYTtcclxuICAgICAgdmFyIGxlZnQgPSBteWJjby5sZWZ0ICsgbXliLng7XHJcbiAgICAgIHZhciByaWdodCA9IG15YmNvLnJpZ2h0ICsgbXliLng7XHJcbiAgICAgIHZhciB0b3AgPSBteWJjby50b3AgKyBteWIueTtcclxuICAgICAgdmFyIGJvdHRvbSA9IG15YmNvLmJvdHRvbSAtIG15Yi5zcGVlZCArIG15Yi55O1xyXG4gICAgICBmb3IgKHZhciBqID0gMCwgZW5kaiA9IHRoaXMuZW5zLmxlbmd0aDsgaiA8IGVuZGo7ICsraikge1xyXG4gICAgICAgIHZhciBlbiA9IHRoaXMuZW5zW2pdO1xyXG4gICAgICAgIGlmIChlbi5lbmFibGVfKSB7XHJcbiAgICAgICAgICB2YXIgZW5jbyA9IGVuLmNvbGxpc2lvbkFyZWE7XHJcbiAgICAgICAgICBpZiAodG9wID4gKGVuLnkgKyBlbmNvLmJvdHRvbSkgJiZcclxuICAgICAgICAgICAgKGVuLnkgKyBlbmNvLnRvcCkgPiBib3R0b20gJiZcclxuICAgICAgICAgICAgbGVmdCA8IChlbi54ICsgZW5jby5yaWdodCkgJiZcclxuICAgICAgICAgICAgKGVuLnggKyBlbmNvLmxlZnQpIDwgcmlnaHRcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIGVuLmhpdChteWIpO1xyXG4gICAgICAgICAgICBpZiAobXliLnBvd2VyIDw9IDApIHtcclxuICAgICAgICAgICAgICBteWIuZW5hYmxlXyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8g5pW144Go6Ieq5qmf44Go44Gu44GC44Gf44KK5Yik5a6aXHJcbiAgaWYgKHNmZy5DSEVDS19DT0xMSVNJT04pIHtcclxuICAgIGxldCBteWNvID0gc2ZnLm15c2hpcF8uY29sbGlzaW9uQXJlYTtcclxuICAgIGxldCBsZWZ0ID0gc2ZnLm15c2hpcF8ueCArIG15Y28ubGVmdDtcclxuICAgIGxldCByaWdodCA9IG15Y28ucmlnaHQgKyBzZmcubXlzaGlwXy54O1xyXG4gICAgbGV0IHRvcCA9IG15Y28udG9wICsgc2ZnLm15c2hpcF8ueTtcclxuICAgIGxldCBib3R0b20gPSBteWNvLmJvdHRvbSArIHNmZy5teXNoaXBfLnk7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHRoaXMuZW5zLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIGxldCBlbiA9IHRoaXMuZW5zW2ldO1xyXG4gICAgICBpZiAoZW4uZW5hYmxlXykge1xyXG4gICAgICAgIGxldCBlbmNvID0gZW4uY29sbGlzaW9uQXJlYTtcclxuICAgICAgICBpZiAodG9wID4gKGVuLnkgKyBlbmNvLmJvdHRvbSkgJiZcclxuICAgICAgICAgIChlbi55ICsgZW5jby50b3ApID4gYm90dG9tICYmXHJcbiAgICAgICAgICBsZWZ0IDwgKGVuLnggKyBlbmNvLnJpZ2h0KSAmJlxyXG4gICAgICAgICAgKGVuLnggKyBlbmNvLmxlZnQpIDwgcmlnaHRcclxuICAgICAgICAgICkge1xyXG4gICAgICAgICAgZW4uaGl0KG15c2hpcCk7XHJcbiAgICAgICAgICBzZmcubXlzaGlwXy5oaXQoKTtcclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8g5pW15by+44Go6Ieq5qmf44Go44Gu44GC44Gf44KK5Yik5a6aXHJcbiAgICB0aGlzLmVuYnMgPSB0aGlzLmVuZW15QnVsbGV0cy5lbmVteUJ1bGxldHM7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gdGhpcy5lbmJzLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIGxldCBlbiA9IHRoaXMuZW5ic1tpXTtcclxuICAgICAgaWYgKGVuLmVuYWJsZSkge1xyXG4gICAgICAgIGxldCBlbmNvID0gZW4uY29sbGlzaW9uQXJlYTtcclxuICAgICAgICBpZiAodG9wID4gKGVuLnkgKyBlbmNvLmJvdHRvbSkgJiZcclxuICAgICAgICAgIChlbi55ICsgZW5jby50b3ApID4gYm90dG9tICYmXHJcbiAgICAgICAgICBsZWZ0IDwgKGVuLnggKyBlbmNvLnJpZ2h0KSAmJlxyXG4gICAgICAgICAgKGVuLnggKyBlbmNvLmxlZnQpIDwgcmlnaHRcclxuICAgICAgICAgICkge1xyXG4gICAgICAgICAgZW4uaGl0KCk7XHJcbiAgICAgICAgICBzZmcubXlzaGlwXy5oaXQoKTtcclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICB9XHJcbiAgcmV0dXJuIGZhbHNlO1xyXG59XHJcblxyXG4vLy8g6Ieq5qmf54iG55m6IFxyXG4qbXlTaGlwQm9tYih0YXNrSW5kZXgpIHtcclxuICB3aGlsZShzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lIDw9IHRoaXMubXlTaGlwQm9tYi5lbmRUaW1lICYmIHRhc2tJbmRleCA+PSAwKXtcclxuICAgIHRoaXMuZW5lbWllcy5tb3ZlKCk7XHJcbiAgICBzZmcuZ2FtZVRpbWVyLnVwZGF0ZSgpO1xyXG4gICAgdGFza0luZGV4ID0geWllbGQ7ICBcclxuICB9XHJcbiAgc2ZnLm15c2hpcF8ucmVzdC0tO1xyXG4gIGlmIChzZmcubXlzaGlwXy5yZXN0ID09IDApIHtcclxuICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDEwLCAxOCwgJ0dBTUUgT1ZFUicsIG5ldyB0ZXh0LlRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gICAgdGhpcy5wcmludFNjb3JlKCk7XHJcbiAgICB0aGlzLnRleHRQbGFuZS5wcmludCgyMCwgMzksICdSZXN0OiAgICcgKyBzZmcubXlzaGlwXy5yZXN0KTtcclxuICAgIHRoaXMuY29tbV8uc29ja2V0Lm9uKCdzZW5kUmFuaycsIHRoaXMuY2hlY2tSYW5rSW4pO1xyXG4gICAgdGhpcy5jb21tXy5zZW5kU2NvcmUobmV3IFNjb3JlRW50cnkodGhpcy5lZGl0SGFuZGxlTmFtZSwgdGhpcy5zY29yZSkpO1xyXG4gICAgdGhpcy5nYW1lT3Zlci5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDU7XHJcbiAgICB0aGlzLnJhbmsgPSAtMTtcclxuICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLmdhbWVPdmVyLmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5zZXF1ZW5jZXIuc3RvcCgpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBzZmcubXlzaGlwXy5tZXNoLnZpc2libGUgPSB0cnVlO1xyXG4gICAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMjAsIDM5LCAnUmVzdDogICAnICsgc2ZnLm15c2hpcF8ucmVzdCk7XHJcbiAgICB0aGlzLnRleHRQbGFuZS5wcmludCg4LCAxNSwgJ1N0YWdlICcgKyAoc2ZnLnN0YWdlLm5vKSArICcgU3RhcnQgISEnLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICAgIHRoaXMuc3RhZ2VTdGFydC5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDI7XHJcbiAgICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5zdGFnZVN0YXJ0LmJpbmQodGhpcykpO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOOCsuODvOODoOOCquODvOODkOODvFxyXG4qZ2FtZU92ZXIodGFza0luZGV4KSB7XHJcbiAgd2hpbGUodGhpcy5nYW1lT3Zlci5lbmRUaW1lID49IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgJiYgdGFza0luZGV4ID49IDApXHJcbiAge1xyXG4gICAgc2ZnLmdhbWVUaW1lci51cGRhdGUoKTtcclxuICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gIH1cclxuICBcclxuXHJcbiAgdGhpcy50ZXh0UGxhbmUuY2xzKCk7XHJcbiAgdGhpcy5lbmVtaWVzLnJlc2V0KCk7XHJcbiAgdGhpcy5lbmVteUJ1bGxldHMucmVzZXQoKTtcclxuICBpZiAodGhpcy5yYW5rID49IDApIHtcclxuICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLmluaXRUb3AxMC5iaW5kKHRoaXMpKTtcclxuICB9IGVsc2Uge1xyXG4gICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuaW5pdFRpdGxlLmJpbmQodGhpcykpO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOODqeODs+OCreODs+OCsOOBl+OBn+OBi+OBqeOBhuOBi+OBruODgeOCp+ODg+OCr1xyXG5jaGVja1JhbmtJbihkYXRhKSB7XHJcbiAgdGhpcy5yYW5rID0gZGF0YS5yYW5rO1xyXG59XHJcblxyXG5cclxuLy8vIOODj+OCpOOCueOCs+OCouOCqOODs+ODiOODquOBruihqOekulxyXG5wcmludFRvcDEwKCkge1xyXG4gIHZhciByYW5rbmFtZSA9IFsnIDFzdCcsICcgMm5kJywgJyAzcmQnLCAnIDR0aCcsICcgNXRoJywgJyA2dGgnLCAnIDd0aCcsICcgOHRoJywgJyA5dGgnLCAnMTB0aCddO1xyXG4gIHRoaXMudGV4dFBsYW5lLnByaW50KDgsIDQsICdUb3AgMTAgU2NvcmUnKTtcclxuICB2YXIgeSA9IDg7XHJcbiAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHRoaXMuaGlnaFNjb3Jlcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgdmFyIHNjb3JlU3RyID0gJzAwMDAwMDAwJyArIHRoaXMuaGlnaFNjb3Jlc1tpXS5zY29yZTtcclxuICAgIHNjb3JlU3RyID0gc2NvcmVTdHIuc3Vic3RyKHNjb3JlU3RyLmxlbmd0aCAtIDgsIDgpO1xyXG4gICAgaWYgKHRoaXMucmFuayA9PSBpKSB7XHJcbiAgICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDMsIHksIHJhbmtuYW1lW2ldICsgJyAnICsgc2NvcmVTdHIgKyAnICcgKyB0aGlzLmhpZ2hTY29yZXNbaV0ubmFtZSwgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnRleHRQbGFuZS5wcmludCgzLCB5LCByYW5rbmFtZVtpXSArICcgJyArIHNjb3JlU3RyICsgJyAnICsgdGhpcy5oaWdoU2NvcmVzW2ldLm5hbWUpO1xyXG4gICAgfVxyXG4gICAgeSArPSAyO1xyXG4gIH1cclxufVxyXG5cclxuXHJcbippbml0VG9wMTAodGFza0luZGV4KSB7XHJcbiAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgdGhpcy50ZXh0UGxhbmUuY2xzKCk7XHJcbiAgdGhpcy5wcmludFRvcDEwKCk7XHJcbiAgdGhpcy5zaG93VG9wMTAuZW5kVGltZSA9IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgKyA1O1xyXG4gIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLnNob3dUb3AxMC5iaW5kKHRoaXMpKTtcclxufVxyXG5cclxuKnNob3dUb3AxMCh0YXNrSW5kZXgpIHtcclxuICB3aGlsZSh0aGlzLnNob3dUb3AxMC5lbmRUaW1lID49IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgJiYgdGhpcy5iYXNpY0lucHV0LmtleUJ1ZmZlci5sZW5ndGggPT0gMCAmJiB0YXNrSW5kZXggPj0gMClcclxuICB7XHJcbiAgICBzZmcuZ2FtZVRpbWVyLnVwZGF0ZSgpO1xyXG4gICAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgfSBcclxuICBcclxuICB0aGlzLmJhc2ljSW5wdXQua2V5QnVmZmVyLmxlbmd0aCA9IDA7XHJcbiAgdGhpcy50ZXh0UGxhbmUuY2xzKCk7XHJcbiAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuaW5pdFRpdGxlLmJpbmQodGhpcykpO1xyXG59XHJcbn1cclxuXHJcblxyXG5cclxuXHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBDb2xsaXNpb25BcmVhIHtcclxuICBjb25zdHJ1Y3RvcihvZmZzZXRYLCBvZmZzZXRZLCB3aWR0aCwgaGVpZ2h0KVxyXG4gIHtcclxuICAgIHRoaXMub2Zmc2V0WCA9IG9mZnNldFggfHwgMDtcclxuICAgIHRoaXMub2Zmc2V0WSA9IG9mZnNldFkgfHwgMDtcclxuICAgIHRoaXMudG9wID0gMDtcclxuICAgIHRoaXMuYm90dG9tID0gMDtcclxuICAgIHRoaXMubGVmdCA9IDA7XHJcbiAgICB0aGlzLnJpZ2h0ID0gMDtcclxuICAgIHRoaXMud2lkdGggPSB3aWR0aCB8fCAwO1xyXG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQgfHwgMDtcclxuICAgIHRoaXMud2lkdGhfID0gMDtcclxuICAgIHRoaXMuaGVpZ2h0XyA9IDA7XHJcbiAgfVxyXG4gIGdldCB3aWR0aCgpIHsgcmV0dXJuIHRoaXMud2lkdGhfOyB9XHJcbiAgc2V0IHdpZHRoKHYpIHtcclxuICAgIHRoaXMud2lkdGhfID0gdjtcclxuICAgIHRoaXMubGVmdCA9IHRoaXMub2Zmc2V0WCAtIHYgLyAyO1xyXG4gICAgdGhpcy5yaWdodCA9IHRoaXMub2Zmc2V0WCArIHYgLyAyO1xyXG4gIH1cclxuICBnZXQgaGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5oZWlnaHRfOyB9XHJcbiAgc2V0IGhlaWdodCh2KSB7XHJcbiAgICB0aGlzLmhlaWdodF8gPSB2O1xyXG4gICAgdGhpcy50b3AgPSB0aGlzLm9mZnNldFkgKyB2IC8gMjtcclxuICAgIHRoaXMuYm90dG9tID0gdGhpcy5vZmZzZXRZIC0gdiAvIDI7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgR2FtZU9iaiB7XHJcbiAgY29uc3RydWN0b3IoeCwgeSwgeikge1xyXG4gICAgdGhpcy54XyA9IHggfHwgMDtcclxuICAgIHRoaXMueV8gPSB5IHx8IDA7XHJcbiAgICB0aGlzLnpfID0geiB8fCAwLjA7XHJcbiAgICB0aGlzLmVuYWJsZV8gPSBmYWxzZTtcclxuICAgIHRoaXMud2lkdGggPSAwO1xyXG4gICAgdGhpcy5oZWlnaHQgPSAwO1xyXG4gICAgdGhpcy5jb2xsaXNpb25BcmVhID0gbmV3IENvbGxpc2lvbkFyZWEoKTtcclxuICB9XHJcbiAgZ2V0IHgoKSB7IHJldHVybiB0aGlzLnhfOyB9XHJcbiAgc2V0IHgodikgeyB0aGlzLnhfID0gdjsgfVxyXG4gIGdldCB5KCkgeyByZXR1cm4gdGhpcy55XzsgfVxyXG4gIHNldCB5KHYpIHsgdGhpcy55XyA9IHY7IH1cclxuICBnZXQgeigpIHsgcmV0dXJuIHRoaXMuel87IH1cclxuICBzZXQgeih2KSB7IHRoaXMuel8gPSB2OyB9XHJcbn1cclxuXHJcbiIsImV4cG9ydCBjb25zdCBWSVJUVUFMX1dJRFRIID0gMjQwO1xyXG5leHBvcnQgY29uc3QgVklSVFVBTF9IRUlHSFQgPSAzMjA7XHJcblxyXG5leHBvcnQgY29uc3QgVl9SSUdIVCA9IFZJUlRVQUxfV0lEVEggLyAyLjA7XHJcbmV4cG9ydCBjb25zdCBWX1RPUCA9IFZJUlRVQUxfSEVJR0hUIC8gMi4wO1xyXG5leHBvcnQgY29uc3QgVl9MRUZUID0gLTEgKiBWSVJUVUFMX1dJRFRIIC8gMi4wO1xyXG5leHBvcnQgY29uc3QgVl9CT1RUT00gPSAtMSAqIFZJUlRVQUxfSEVJR0hUIC8gMi4wO1xyXG5cclxuZXhwb3J0IGNvbnN0IENIQVJfU0laRSA9IDg7XHJcbmV4cG9ydCBjb25zdCBURVhUX1dJRFRIID0gVklSVFVBTF9XSURUSCAvIENIQVJfU0laRTtcclxuZXhwb3J0IGNvbnN0IFRFWFRfSEVJR0hUID0gVklSVFVBTF9IRUlHSFQgLyBDSEFSX1NJWkU7XHJcbmV4cG9ydCBjb25zdCBQSVhFTF9TSVpFID0gMTtcclxuZXhwb3J0IGNvbnN0IEFDVFVBTF9DSEFSX1NJWkUgPSBDSEFSX1NJWkUgKiBQSVhFTF9TSVpFO1xyXG5leHBvcnQgY29uc3QgU1BSSVRFX1NJWkVfWCA9IDE2LjA7XHJcbmV4cG9ydCBjb25zdCBTUFJJVEVfU0laRV9ZID0gMTYuMDtcclxuZXhwb3J0IHZhciBDSEVDS19DT0xMSVNJT04gPSB0cnVlO1xyXG5leHBvcnQgdmFyIERFQlVHID0gZmFsc2U7XHJcbmV4cG9ydCB2YXIgdGV4dHVyZUZpbGVzID0ge307XHJcbmV4cG9ydCB2YXIgc3RhZ2U7XHJcbmV4cG9ydCB2YXIgdGFza3M7XHJcbmV4cG9ydCB2YXIgZ2FtZVRpbWVyO1xyXG5leHBvcnQgdmFyIGJvbWJzO1xyXG5leHBvcnQgdmFyIGFkZFNjb3JlO1xyXG5leHBvcnQgdmFyIG15c2hpcF87XHJcbmV4cG9ydCBjb25zdCB0ZXh0dXJlUm9vdCA9ICcuL3Jlcy8nO1xyXG5leHBvcnQgdmFyIHBhdXNlID0gZmFsc2U7XHJcbmV4cG9ydCB2YXIgZ2FtZTtcclxuXHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0ICogYXMgZyBmcm9tICcuL2dsb2JhbCc7XHJcblxyXG4vLy8g44OG44Kv44K544OB44Oj44O844Go44GX44GmY2FudmFz44KS5L2/44GG5aC05ZCI44Gu44OY44Or44OR44O8XHJcbmV4cG9ydCBmdW5jdGlvbiBDYW52YXNUZXh0dXJlKHdpZHRoLCBoZWlnaHQpIHtcclxuICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gIHRoaXMuY2FudmFzLndpZHRoID0gd2lkdGggfHwgZy5WSVJUVUFMX1dJRFRIO1xyXG4gIHRoaXMuY2FudmFzLmhlaWdodCA9IGhlaWdodCB8fCBnLlZJUlRVQUxfSEVJR0hUO1xyXG4gIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICB0aGlzLnRleHR1cmUgPSBuZXcgVEhSRUUuVGV4dHVyZSh0aGlzLmNhbnZhcyk7XHJcbiAgdGhpcy50ZXh0dXJlLm1hZ0ZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XHJcbiAgdGhpcy50ZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLkxpbmVhck1pcE1hcExpbmVhckZpbHRlcjtcclxuICB0aGlzLm1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgbWFwOiB0aGlzLnRleHR1cmUsIHRyYW5zcGFyZW50OiB0cnVlIH0pO1xyXG4gIHRoaXMuZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSh0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuICB0aGlzLm1lc2ggPSBuZXcgVEhSRUUuTWVzaCh0aGlzLmdlb21ldHJ5LCB0aGlzLm1hdGVyaWFsKTtcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueiA9IDAuMDAxO1xyXG4gIC8vIOOCueODoOODvOOCuOODs+OCsOOCkuWIh+OCi1xyXG4gIHRoaXMuY3R4Lm1zSW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgdGhpcy5jdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgLy90aGlzLmN0eC53ZWJraXRJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICB0aGlzLmN0eC5tb3pJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxufVxyXG5cclxuLy8vIOODl+ODreOCsOODrOOCueODkOODvOihqOekuuOCr+ODqeOCuVxyXG5leHBvcnQgZnVuY3Rpb24gUHJvZ3Jlc3MoKSB7XHJcbiAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTs7XHJcbiAgdmFyIHdpZHRoID0gMTtcclxuICB3aGlsZSAod2lkdGggPD0gZy5WSVJUVUFMX1dJRFRIKXtcclxuICAgIHdpZHRoICo9IDI7XHJcbiAgfVxyXG4gIHZhciBoZWlnaHQgPSAxO1xyXG4gIHdoaWxlIChoZWlnaHQgPD0gZy5WSVJUVUFMX0hFSUdIVCl7XHJcbiAgICBoZWlnaHQgKj0gMjtcclxuICB9XHJcbiAgdGhpcy5jYW52YXMud2lkdGggPSB3aWR0aDtcclxuICB0aGlzLmNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gIHRoaXMudGV4dHVyZSA9IG5ldyBUSFJFRS5UZXh0dXJlKHRoaXMuY2FudmFzKTtcclxuICB0aGlzLnRleHR1cmUubWFnRmlsdGVyID0gVEhSRUUuTmVhcmVzdEZpbHRlcjtcclxuICB0aGlzLnRleHR1cmUubWluRmlsdGVyID0gVEhSRUUuTGluZWFyTWlwTWFwTGluZWFyRmlsdGVyO1xyXG4gIC8vIOOCueODoOODvOOCuOODs+OCsOOCkuWIh+OCi1xyXG4gIHRoaXMuY3R4Lm1zSW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgdGhpcy5jdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgLy90aGlzLmN0eC53ZWJraXRJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICB0aGlzLmN0eC5tb3pJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuXHJcbiAgdGhpcy5tYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7IG1hcDogdGhpcy50ZXh0dXJlLCB0cmFuc3BhcmVudDogdHJ1ZSB9KTtcclxuICB0aGlzLmdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkodGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcbiAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2godGhpcy5nZW9tZXRyeSwgdGhpcy5tYXRlcmlhbCk7XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnggPSAod2lkdGggLSBnLlZJUlRVQUxfV0lEVEgpIC8gMjtcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueSA9ICAtIChoZWlnaHQgLSBnLlZJUlRVQUxfSEVJR0hUKSAvIDI7XHJcblxyXG4gIC8vdGhpcy50ZXh0dXJlLnByZW11bHRpcGx5QWxwaGEgPSB0cnVlO1xyXG59XHJcblxyXG4vLy8g44OX44Ot44Kw44Os44K544OQ44O844KS6KGo56S644GZ44KL44CCXHJcblByb2dyZXNzLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiAobWVzc2FnZSwgcGVyY2VudCkge1xyXG4gIHZhciBjdHggPSB0aGlzLmN0eDtcclxuICB2YXIgd2lkdGggPSB0aGlzLmNhbnZhcy53aWR0aCwgaGVpZ2h0ID0gdGhpcy5jYW52YXMuaGVpZ2h0O1xyXG4gIC8vICAgICAgY3R4LmZpbGxTdHlsZSA9ICdyZ2JhKDAsMCwwLDApJztcclxuICBjdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG4gIHZhciB0ZXh0V2lkdGggPSBjdHgubWVhc3VyZVRleHQobWVzc2FnZSkud2lkdGg7XHJcbiAgY3R4LnN0cm9rZVN0eWxlID0gY3R4LmZpbGxTdHlsZSA9ICdyZ2JhKDI1NSwyNTUsMjU1LDEuMCknO1xyXG5cclxuICBjdHguZmlsbFRleHQobWVzc2FnZSwgKHdpZHRoIC0gdGV4dFdpZHRoKSAvIDIsIDEwMCk7XHJcbiAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gIGN0eC5yZWN0KDIwLCA3NSwgd2lkdGggLSAyMCAqIDIsIDEwKTtcclxuICBjdHguc3Ryb2tlKCk7XHJcbiAgY3R4LmZpbGxSZWN0KDIwLCA3NSwgKHdpZHRoIC0gMjAgKiAyKSAqIHBlcmNlbnQgLyAxMDAsIDEwKTtcclxuICB0aGlzLnRleHR1cmUubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG59XHJcblxyXG4vLy8gaW1n44GL44KJ44K444Kq44Oh44OI44Oq44KS5L2c5oiQ44GZ44KLXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVHZW9tZXRyeUZyb21JbWFnZShpbWFnZSkge1xyXG4gIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICB2YXIgdyA9IHRleHR1cmVGaWxlcy5hdXRob3IudGV4dHVyZS5pbWFnZS53aWR0aDtcclxuICB2YXIgaCA9IHRleHR1cmVGaWxlcy5hdXRob3IudGV4dHVyZS5pbWFnZS5oZWlnaHQ7XHJcbiAgY2FudmFzLndpZHRoID0gdztcclxuICBjYW52YXMuaGVpZ2h0ID0gaDtcclxuICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgY3R4LmRyYXdJbWFnZShpbWFnZSwgMCwgMCk7XHJcbiAgdmFyIGRhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIHcsIGgpO1xyXG4gIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5HZW9tZXRyeSgpO1xyXG4gIHtcclxuICAgIHZhciBpID0gMDtcclxuXHJcbiAgICBmb3IgKHZhciB5ID0gMDsgeSA8IGg7ICsreSkge1xyXG4gICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHc7ICsreCkge1xyXG4gICAgICAgIHZhciBjb2xvciA9IG5ldyBUSFJFRS5Db2xvcigpO1xyXG5cclxuICAgICAgICB2YXIgciA9IGRhdGEuZGF0YVtpKytdO1xyXG4gICAgICAgIHZhciBnID0gZGF0YS5kYXRhW2krK107XHJcbiAgICAgICAgdmFyIGIgPSBkYXRhLmRhdGFbaSsrXTtcclxuICAgICAgICB2YXIgYSA9IGRhdGEuZGF0YVtpKytdO1xyXG4gICAgICAgIGlmIChhICE9IDApIHtcclxuICAgICAgICAgIGNvbG9yLnNldFJHQihyIC8gMjU1LjAsIGcgLyAyNTUuMCwgYiAvIDI1NS4wKTtcclxuICAgICAgICAgIHZhciB2ZXJ0ID0gbmV3IFRIUkVFLlZlY3RvcjMoKCh4IC0gdyAvIDIuMCkpICogMi4wLCAoKHkgLSBoIC8gMikpICogLTIuMCwgMC4wKTtcclxuICAgICAgICAgIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2godmVydCk7XHJcbiAgICAgICAgICBnZW9tZXRyeS5jb2xvcnMucHVzaChjb2xvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3ByaXRlR2VvbWV0cnkoc2l6ZSlcclxue1xyXG4gIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5HZW9tZXRyeSgpO1xyXG4gIHZhciBzaXplSGFsZiA9IHNpemUgLyAyO1xyXG4gIC8vIGdlb21ldHJ5LlxyXG4gIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2gobmV3IFRIUkVFLlZlY3RvcjMoLXNpemVIYWxmLCBzaXplSGFsZiwgMCkpO1xyXG4gIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2gobmV3IFRIUkVFLlZlY3RvcjMoc2l6ZUhhbGYsIHNpemVIYWxmLCAwKSk7XHJcbiAgZ2VvbWV0cnkudmVydGljZXMucHVzaChuZXcgVEhSRUUuVmVjdG9yMyhzaXplSGFsZiwgLXNpemVIYWxmLCAwKSk7XHJcbiAgZ2VvbWV0cnkudmVydGljZXMucHVzaChuZXcgVEhSRUUuVmVjdG9yMygtc2l6ZUhhbGYsIC1zaXplSGFsZiwgMCkpO1xyXG4gIGdlb21ldHJ5LmZhY2VzLnB1c2gobmV3IFRIUkVFLkZhY2UzKDAsIDIsIDEpKTtcclxuICBnZW9tZXRyeS5mYWNlcy5wdXNoKG5ldyBUSFJFRS5GYWNlMygwLCAzLCAyKSk7XHJcbiAgcmV0dXJuIGdlb21ldHJ5O1xyXG59XHJcblxyXG4vLy8g44OG44Kv44K544OB44Oj44O85LiK44Gu5oyH5a6a44K544OX44Op44Kk44OI44GuVVbluqfmqJnjgpLmsYLjgoHjgotcclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNwcml0ZVVWKGdlb21ldHJ5LCB0ZXh0dXJlLCBjZWxsV2lkdGgsIGNlbGxIZWlnaHQsIGNlbGxObylcclxue1xyXG4gIHZhciB3aWR0aCA9IHRleHR1cmUuaW1hZ2Uud2lkdGg7XHJcbiAgdmFyIGhlaWdodCA9IHRleHR1cmUuaW1hZ2UuaGVpZ2h0O1xyXG5cclxuICB2YXIgdUNlbGxDb3VudCA9ICh3aWR0aCAvIGNlbGxXaWR0aCkgfCAwO1xyXG4gIHZhciB2Q2VsbENvdW50ID0gKGhlaWdodCAvIGNlbGxIZWlnaHQpIHwgMDtcclxuICB2YXIgdlBvcyA9IHZDZWxsQ291bnQgLSAoKGNlbGxObyAvIHVDZWxsQ291bnQpIHwgMCk7XHJcbiAgdmFyIHVQb3MgPSBjZWxsTm8gJSB1Q2VsbENvdW50O1xyXG4gIHZhciB1VW5pdCA9IGNlbGxXaWR0aCAvIHdpZHRoOyBcclxuICB2YXIgdlVuaXQgPSBjZWxsSGVpZ2h0IC8gaGVpZ2h0O1xyXG5cclxuICBnZW9tZXRyeS5mYWNlVmVydGV4VXZzWzBdLnB1c2goW1xyXG4gICAgbmV3IFRIUkVFLlZlY3RvcjIoKHVQb3MpICogY2VsbFdpZHRoIC8gd2lkdGgsICh2UG9zKSAqIGNlbGxIZWlnaHQgLyBoZWlnaHQpLFxyXG4gICAgbmV3IFRIUkVFLlZlY3RvcjIoKHVQb3MgKyAxKSAqIGNlbGxXaWR0aCAvIHdpZHRoLCAodlBvcyAtIDEpICogY2VsbEhlaWdodCAvIGhlaWdodCksXHJcbiAgICBuZXcgVEhSRUUuVmVjdG9yMigodVBvcyArIDEpICogY2VsbFdpZHRoIC8gd2lkdGgsICh2UG9zKSAqIGNlbGxIZWlnaHQgLyBoZWlnaHQpXHJcbiAgXSk7XHJcbiAgZ2VvbWV0cnkuZmFjZVZlcnRleFV2c1swXS5wdXNoKFtcclxuICAgIG5ldyBUSFJFRS5WZWN0b3IyKCh1UG9zKSAqIGNlbGxXaWR0aCAvIHdpZHRoLCAodlBvcykgKiBjZWxsSGVpZ2h0IC8gaGVpZ2h0KSxcclxuICAgIG5ldyBUSFJFRS5WZWN0b3IyKCh1UG9zKSAqIGNlbGxXaWR0aCAvIHdpZHRoLCAodlBvcyAtIDEpICogY2VsbEhlaWdodCAvIGhlaWdodCksXHJcbiAgICBuZXcgVEhSRUUuVmVjdG9yMigodVBvcyArIDEpICogY2VsbFdpZHRoIC8gd2lkdGgsICh2UG9zIC0gMSkgKiBjZWxsSGVpZ2h0IC8gaGVpZ2h0KVxyXG4gIF0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlU3ByaXRlVVYoZ2VvbWV0cnksIHRleHR1cmUsIGNlbGxXaWR0aCwgY2VsbEhlaWdodCwgY2VsbE5vKVxyXG57XHJcbiAgdmFyIHdpZHRoID0gdGV4dHVyZS5pbWFnZS53aWR0aDtcclxuICB2YXIgaGVpZ2h0ID0gdGV4dHVyZS5pbWFnZS5oZWlnaHQ7XHJcblxyXG4gIHZhciB1Q2VsbENvdW50ID0gKHdpZHRoIC8gY2VsbFdpZHRoKSB8IDA7XHJcbiAgdmFyIHZDZWxsQ291bnQgPSAoaGVpZ2h0IC8gY2VsbEhlaWdodCkgfCAwO1xyXG4gIHZhciB2UG9zID0gdkNlbGxDb3VudCAtICgoY2VsbE5vIC8gdUNlbGxDb3VudCkgfCAwKTtcclxuICB2YXIgdVBvcyA9IGNlbGxObyAlIHVDZWxsQ291bnQ7XHJcbiAgdmFyIHVVbml0ID0gY2VsbFdpZHRoIC8gd2lkdGg7XHJcbiAgdmFyIHZVbml0ID0gY2VsbEhlaWdodCAvIGhlaWdodDtcclxuICB2YXIgdXZzID0gZ2VvbWV0cnkuZmFjZVZlcnRleFV2c1swXVswXTtcclxuXHJcbiAgdXZzWzBdLnggPSAodVBvcykgKiB1VW5pdDtcclxuICB1dnNbMF0ueSA9ICh2UG9zKSAqIHZVbml0O1xyXG4gIHV2c1sxXS54ID0gKHVQb3MgKyAxKSAqIHVVbml0O1xyXG4gIHV2c1sxXS55ID0gKHZQb3MgLSAxKSAqIHZVbml0O1xyXG4gIHV2c1syXS54ID0gKHVQb3MgKyAxKSAqIHVVbml0O1xyXG4gIHV2c1syXS55ID0gKHZQb3MpICogdlVuaXQ7XHJcblxyXG4gIHV2cyA9IGdlb21ldHJ5LmZhY2VWZXJ0ZXhVdnNbMF1bMV07XHJcblxyXG4gIHV2c1swXS54ID0gKHVQb3MpICogdVVuaXQ7XHJcbiAgdXZzWzBdLnkgPSAodlBvcykgKiB2VW5pdDtcclxuICB1dnNbMV0ueCA9ICh1UG9zKSAqIHVVbml0O1xyXG4gIHV2c1sxXS55ID0gKHZQb3MgLSAxKSAqIHZVbml0O1xyXG4gIHV2c1syXS54ID0gKHVQb3MgKyAxKSAqIHVVbml0O1xyXG4gIHV2c1syXS55ID0gKHZQb3MgLSAxKSAqIHZVbml0O1xyXG5cclxuIFxyXG4gIGdlb21ldHJ5LnV2c05lZWRVcGRhdGUgPSB0cnVlO1xyXG5cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNwcml0ZU1hdGVyaWFsKHRleHR1cmUpXHJcbntcclxuICAvLyDjg6Hjg4Pjgrfjg6Xjga7kvZzmiJDjg7vooajnpLogLy8vXHJcbiAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgbWFwOiB0ZXh0dXJlIC8qLGRlcHRoVGVzdDp0cnVlKi8sIHRyYW5zcGFyZW50OiB0cnVlIH0pO1xyXG4gIG1hdGVyaWFsLnNoYWRpbmcgPSBUSFJFRS5GbGF0U2hhZGluZztcclxuICBtYXRlcmlhbC5zaWRlID0gVEhSRUUuRnJvbnRTaWRlO1xyXG4gIG1hdGVyaWFsLmFscGhhVGVzdCA9IDAuNTtcclxuICBtYXRlcmlhbC5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbi8vICBtYXRlcmlhbC5cclxuICByZXR1cm4gbWF0ZXJpYWw7XHJcbn1cclxuXHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0ICogYXMgc2ZnIGZyb20gJy4vZ2xvYmFsJzsgXHJcblxyXG4vLyDjgq3jg7zlhaXliptcclxuZXhwb3J0IGNsYXNzIEJhc2ljSW5wdXR7XHJcbmNvbnN0cnVjdG9yICgpIHtcclxuICB0aGlzLmtleUNoZWNrID0geyB1cDogZmFsc2UsIGRvd246IGZhbHNlLCBsZWZ0OiBmYWxzZSwgcmlnaHQ6IGZhbHNlLCB6OiBmYWxzZSAseDpmYWxzZX07XHJcbiAgdGhpcy5rZXlCdWZmZXIgPSBbXTtcclxuICB0aGlzLmtleXVwXyA9IG51bGw7XHJcbiAgdGhpcy5rZXlkb3duXyA9IG51bGw7XHJcbiAgLy90aGlzLmdhbWVwYWRDaGVjayA9IHsgdXA6IGZhbHNlLCBkb3duOiBmYWxzZSwgbGVmdDogZmFsc2UsIHJpZ2h0OiBmYWxzZSwgejogZmFsc2UgLHg6ZmFsc2V9O1xyXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdnYW1lcGFkY29ubmVjdGVkJywoZSk9PntcclxuICAgIHRoaXMuZ2FtZXBhZCA9IGUuZ2FtZXBhZDtcclxuICB9KTtcclxuIFxyXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdnYW1lcGFkZGlzY29ubmVjdGVkJywoZSk9PntcclxuICAgIGRlbGV0ZSB0aGlzLmdhbWVwYWQ7XHJcbiAgfSk7IFxyXG4gXHJcbiBpZih3aW5kb3cubmF2aWdhdG9yLmdldEdhbWVwYWRzKXtcclxuICAgdGhpcy5nYW1lcGFkID0gd2luZG93Lm5hdmlnYXRvci5nZXRHYW1lcGFkcygpWzBdO1xyXG4gfSBcclxufVxyXG5cclxuICBjbGVhcigpXHJcbiAge1xyXG4gICAgZm9yKHZhciBkIGluIHRoaXMua2V5Q2hlY2spe1xyXG4gICAgICB0aGlzLmtleUNoZWNrW2RdID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB0aGlzLmtleUJ1ZmZlci5sZW5ndGggPSAwO1xyXG4gIH1cclxuICBcclxuICBrZXlkb3duKGUpIHtcclxuICAgIHZhciBlID0gZDMuZXZlbnQ7XHJcbiAgICB2YXIga2V5QnVmZmVyID0gdGhpcy5rZXlCdWZmZXI7XHJcbiAgICB2YXIga2V5Q2hlY2sgPSB0aGlzLmtleUNoZWNrO1xyXG4gICAgdmFyIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgXHJcbiAgICBpZiAoa2V5QnVmZmVyLmxlbmd0aCA+IDE2KSB7XHJcbiAgICAgIGtleUJ1ZmZlci5zaGlmdCgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpZiAoZS5rZXlDb2RlID09IDgwIC8qIFAgKi8pIHtcclxuICAgICAgaWYgKCFzZmcucGF1c2UpIHtcclxuICAgICAgICBzZmcuZ2FtZS5wYXVzZSgpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNmZy5nYW1lLnJlc3VtZSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAgICAgICBcclxuICAgIGtleUJ1ZmZlci5wdXNoKGUua2V5Q29kZSk7XHJcbiAgICBzd2l0Y2ggKGUua2V5Q29kZSkge1xyXG4gICAgICBjYXNlIDc0OlxyXG4gICAgICBjYXNlIDM3OlxyXG4gICAgICBjYXNlIDEwMDpcclxuICAgICAgICBrZXlDaGVjay5sZWZ0ID0gdHJ1ZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDczOlxyXG4gICAgICBjYXNlIDM4OlxyXG4gICAgICBjYXNlIDEwNDpcclxuICAgICAgICBrZXlDaGVjay51cCA9IHRydWU7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA3NjpcclxuICAgICAgY2FzZSAzOTpcclxuICAgICAgY2FzZSAxMDI6XHJcbiAgICAgICAga2V5Q2hlY2sucmlnaHQgPSB0cnVlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgNzU6XHJcbiAgICAgIGNhc2UgNDA6XHJcbiAgICAgIGNhc2UgOTg6XHJcbiAgICAgICAga2V5Q2hlY2suZG93biA9IHRydWU7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA5MDpcclxuICAgICAgICBrZXlDaGVjay56ID0gdHJ1ZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDg4OlxyXG4gICAgICAgIGtleUNoZWNrLnggPSB0cnVlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICBpZiAoaGFuZGxlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIGtleXVwKCkge1xyXG4gICAgdmFyIGUgPSBkMy5ldmVudDtcclxuICAgIHZhciBrZXlCdWZmZXIgPSB0aGlzLmtleUJ1ZmZlcjtcclxuICAgIHZhciBrZXlDaGVjayA9IHRoaXMua2V5Q2hlY2s7XHJcbiAgICB2YXIgaGFuZGxlID0gZmFsc2U7XHJcbiAgICBzd2l0Y2ggKGUua2V5Q29kZSkge1xyXG4gICAgICBjYXNlIDc0OlxyXG4gICAgICBjYXNlIDM3OlxyXG4gICAgICBjYXNlIDEwMDpcclxuICAgICAgICBrZXlDaGVjay5sZWZ0ID0gZmFsc2U7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA3MzpcclxuICAgICAgY2FzZSAzODpcclxuICAgICAgY2FzZSAxMDQ6XHJcbiAgICAgICAga2V5Q2hlY2sudXAgPSBmYWxzZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDc2OlxyXG4gICAgICBjYXNlIDM5OlxyXG4gICAgICBjYXNlIDEwMjpcclxuICAgICAgICBrZXlDaGVjay5yaWdodCA9IGZhbHNlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgNzU6XHJcbiAgICAgIGNhc2UgNDA6XHJcbiAgICAgIGNhc2UgOTg6XHJcbiAgICAgICAga2V5Q2hlY2suZG93biA9IGZhbHNlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgOTA6XHJcbiAgICAgICAga2V5Q2hlY2sueiA9IGZhbHNlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgODg6XHJcbiAgICAgICAga2V5Q2hlY2sueCA9IGZhbHNlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICBpZiAoaGFuZGxlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG4gIC8v44Kk44OZ44Oz44OI44Gr44OQ44Kk44Oz44OJ44GZ44KLXHJcbiAgYmluZCgpXHJcbiAge1xyXG4gICAgZDMuc2VsZWN0KCdib2R5Jykub24oJ2tleWRvd24uYmFzaWNJbnB1dCcsdGhpcy5rZXlkb3duLmJpbmQodGhpcykpO1xyXG4gICAgZDMuc2VsZWN0KCdib2R5Jykub24oJ2tleXVwLmJhc2ljSW5wdXQnLHRoaXMua2V5dXAuYmluZCh0aGlzKSk7XHJcbiAgfVxyXG4gIC8vIOOCouODs+ODkOOCpOODs+ODieOBmeOCi1xyXG4gIHVuYmluZCgpXHJcbiAge1xyXG4gICAgZDMuc2VsZWN0KCdib2R5Jykub24oJ2tleWRvd24uYmFzaWNJbnB1dCcsbnVsbCk7XHJcbiAgICBkMy5zZWxlY3QoJ2JvZHknKS5vbigna2V5dXAuYmFzaWNJbnB1dCcsbnVsbCk7XHJcbiAgfVxyXG4gIFxyXG4gIGdldCB1cCgpIHtcclxuICAgIHJldHVybiB0aGlzLmtleUNoZWNrLnVwIHx8ICh0aGlzLmdhbWVwYWQgJiYgKHRoaXMuZ2FtZXBhZC5idXR0b25zWzEyXS5wcmVzc2VkIHx8IHRoaXMuZ2FtZXBhZC5heGVzWzFdIDwgLTAuMSkpO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGRvd24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5rZXlDaGVjay5kb3duIHx8ICh0aGlzLmdhbWVwYWQgJiYgKHRoaXMuZ2FtZXBhZC5idXR0b25zWzEzXS5wcmVzc2VkIHx8IHRoaXMuZ2FtZXBhZC5heGVzWzFdID4gMC4xKSk7XHJcbiAgfVxyXG5cclxuICBnZXQgbGVmdCgpIHtcclxuICAgIHJldHVybiB0aGlzLmtleUNoZWNrLmxlZnQgfHwgKHRoaXMuZ2FtZXBhZCAmJiAodGhpcy5nYW1lcGFkLmJ1dHRvbnNbMTRdLnByZXNzZWQgfHwgdGhpcy5nYW1lcGFkLmF4ZXNbMF0gPCAtMC4xKSk7XHJcbiAgfVxyXG5cclxuICBnZXQgcmlnaHQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5rZXlDaGVjay5yaWdodCB8fCAodGhpcy5nYW1lcGFkICYmICh0aGlzLmdhbWVwYWQuYnV0dG9uc1sxNV0ucHJlc3NlZCB8fCB0aGlzLmdhbWVwYWQuYXhlc1swXSA+IDAuMSkpO1xyXG4gIH1cclxuICBcclxuICBnZXQgeigpIHtcclxuICAgICBsZXQgcmV0ID0gdGhpcy5rZXlDaGVjay56IFxyXG4gICAgfHwgKCgoIXRoaXMuekJ1dHRvbiB8fCAodGhpcy56QnV0dG9uICYmICF0aGlzLnpCdXR0b24pICkgJiYgdGhpcy5nYW1lcGFkICYmIHRoaXMuZ2FtZXBhZC5idXR0b25zWzBdLnByZXNzZWQpKSA7XHJcbiAgICB0aGlzLnpCdXR0b24gPSB0aGlzLmdhbWVwYWQgJiYgdGhpcy5nYW1lcGFkLmJ1dHRvbnNbMF0ucHJlc3NlZDtcclxuICAgIHJldHVybiByZXQ7XHJcbiAgfVxyXG4gIFxyXG4gIGdldCBzdGFydCgpIHtcclxuICAgIGxldCByZXQgPSAoKCF0aGlzLnN0YXJ0QnV0dG9uXyB8fCAodGhpcy5zdGFydEJ1dHRvbl8gJiYgIXRoaXMuc3RhcnRCdXR0b25fKSApICYmIHRoaXMuZ2FtZXBhZCAmJiB0aGlzLmdhbWVwYWQuYnV0dG9uc1s5XS5wcmVzc2VkKSA7XHJcbiAgICB0aGlzLnN0YXJ0QnV0dG9uXyA9IHRoaXMuZ2FtZXBhZCAmJiB0aGlzLmdhbWVwYWQuYnV0dG9uc1s5XS5wcmVzc2VkO1xyXG4gICAgcmV0dXJuIHJldDtcclxuICB9XHJcbiAgXHJcbiAgZ2V0IGFCdXR0b24oKXtcclxuICAgICBsZXQgcmV0ID0gKCgoIXRoaXMuYUJ1dHRvbl8gfHwgKHRoaXMuYUJ1dHRvbl8gJiYgIXRoaXMuYUJ1dHRvbl8pICkgJiYgdGhpcy5nYW1lcGFkICYmIHRoaXMuZ2FtZXBhZC5idXR0b25zWzBdLnByZXNzZWQpKSA7XHJcbiAgICB0aGlzLmFCdXR0b25fID0gdGhpcy5nYW1lcGFkICYmIHRoaXMuZ2FtZXBhZC5idXR0b25zWzBdLnByZXNzZWQ7XHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH1cclxuICBcclxuICAqdXBkYXRlKHRhc2tJbmRleClcclxuICB7XHJcbiAgICB3aGlsZSh0YXNrSW5kZXggPj0gMCl7XHJcbiAgICAgIGlmKHdpbmRvdy5uYXZpZ2F0b3IuZ2V0R2FtZXBhZHMpe1xyXG4gICAgICAgIHRoaXMuZ2FtZXBhZCA9IHdpbmRvdy5uYXZpZ2F0b3IuZ2V0R2FtZXBhZHMoKVswXTtcclxuICAgICAgfSBcclxuICAgICAgdGFza0luZGV4ID0geWllbGQ7ICAgICBcclxuICAgIH1cclxuICB9XHJcbn0iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCAqIGFzIHNmZyBmcm9tICcuL2dsb2JhbCc7XHJcbmltcG9ydCAqIGFzIGdhbWVvYmogZnJvbSAnLi9nYW1lb2JqJztcclxuaW1wb3J0ICogYXMgZ3JhcGhpY3MgZnJvbSAnLi9ncmFwaGljcyc7XHJcblxyXG52YXIgbXlCdWxsZXRzID0gW107XHJcblxyXG4vLy8g6Ieq5qmf5by+IFxyXG5leHBvcnQgY2xhc3MgTXlCdWxsZXQgZXh0ZW5kcyBnYW1lb2JqLkdhbWVPYmoge1xyXG4gIGNvbnN0cnVjdG9yKHNjZW5lLHNlKSB7XHJcbiAgc3VwZXIoMCwgMCwgMCk7XHJcblxyXG4gIHRoaXMuY29sbGlzaW9uQXJlYS53aWR0aCA9IDQ7XHJcbiAgdGhpcy5jb2xsaXNpb25BcmVhLmhlaWdodCA9IDY7XHJcbiAgdGhpcy5zcGVlZCA9IDg7XHJcbiAgdGhpcy5wb3dlciA9IDE7XHJcblxyXG4gIHRoaXMudGV4dHVyZVdpZHRoID0gc2ZnLnRleHR1cmVGaWxlcy5teXNoaXAuaW1hZ2Uud2lkdGg7XHJcbiAgdGhpcy50ZXh0dXJlSGVpZ2h0ID0gc2ZnLnRleHR1cmVGaWxlcy5teXNoaXAuaW1hZ2UuaGVpZ2h0O1xyXG5cclxuICAvLyDjg6Hjg4Pjgrfjg6Xjga7kvZzmiJDjg7vooajnpLogLy8vXHJcblxyXG4gIHZhciBtYXRlcmlhbCA9IGdyYXBoaWNzLmNyZWF0ZVNwcml0ZU1hdGVyaWFsKHNmZy50ZXh0dXJlRmlsZXMubXlzaGlwKTtcclxuICB2YXIgZ2VvbWV0cnkgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVHZW9tZXRyeSgxNik7XHJcbiAgZ3JhcGhpY3MuY3JlYXRlU3ByaXRlVVYoZ2VvbWV0cnksIHNmZy50ZXh0dXJlRmlsZXMubXlzaGlwLCAxNiwgMTYsIDEpO1xyXG4gIHRoaXMubWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcblxyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi54ID0gdGhpcy54XztcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueSA9IHRoaXMueV87XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnogPSB0aGlzLnpfO1xyXG4gIHRoaXMuc2UgPSBzZTtcclxuICAvL3NlKDApO1xyXG4gIC8vc2VxdWVuY2VyLnBsYXlUcmFja3Moc291bmRFZmZlY3RzLnNvdW5kRWZmZWN0c1swXSk7XHJcbiAgc2NlbmUuYWRkKHRoaXMubWVzaCk7XHJcbiAgdGhpcy5tZXNoLnZpc2libGUgPSB0aGlzLmVuYWJsZV8gPSBmYWxzZTtcclxuICAvLyAgc2ZnLnRhc2tzLnB1c2hUYXNrKGZ1bmN0aW9uICh0YXNrSW5kZXgpIHsgc2VsZi5tb3ZlKHRhc2tJbmRleCk7IH0pO1xyXG4gfVxyXG5cclxuICBnZXQgeCgpIHsgcmV0dXJuIHRoaXMueF87IH1cclxuICBzZXQgeCh2KSB7IHRoaXMueF8gPSB0aGlzLm1lc2gucG9zaXRpb24ueCA9IHY7IH1cclxuICBnZXQgeSgpIHsgcmV0dXJuIHRoaXMueV87IH1cclxuICBzZXQgeSh2KSB7IHRoaXMueV8gPSB0aGlzLm1lc2gucG9zaXRpb24ueSA9IHY7IH1cclxuICBnZXQgeigpIHsgcmV0dXJuIHRoaXMuel87IH1cclxuICBzZXQgeih2KSB7IHRoaXMuel8gPSB0aGlzLm1lc2gucG9zaXRpb24ueiA9IHY7IH1cclxuICAqbW92ZSh0YXNrSW5kZXgpIHtcclxuICAgIFxyXG4gICAgd2hpbGUgKHRhc2tJbmRleCA+PSAwIFxyXG4gICAgICAmJiB0aGlzLmVuYWJsZV9cclxuICAgICAgJiYgdGhpcy55IDw9IChzZmcuVl9UT1AgKyAxNikgXHJcbiAgICAgICYmIHRoaXMueSA+PSAoc2ZnLlZfQk9UVE9NIC0gMTYpIFxyXG4gICAgICAmJiB0aGlzLnggPD0gKHNmZy5WX1JJR0hUICsgMTYpIFxyXG4gICAgICAmJiB0aGlzLnggPj0gKHNmZy5WX0xFRlQgLSAxNikpXHJcbiAgICB7XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLnkgKz0gdGhpcy5keTtcclxuICAgICAgdGhpcy54ICs9IHRoaXMuZHg7XHJcbiAgICAgIFxyXG4gICAgICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICAgIH1cclxuXHJcbiAgICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICAgIHNmZy50YXNrcy5yZW1vdmVUYXNrKHRhc2tJbmRleCk7XHJcbiAgICB0aGlzLmVuYWJsZV8gPSB0aGlzLm1lc2gudmlzaWJsZSA9IGZhbHNlO1xyXG59XHJcblxyXG4gIHN0YXJ0KHgsIHksIHosIGFpbVJhZGlhbixwb3dlcikge1xyXG4gICAgaWYgKHRoaXMuZW5hYmxlXykge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB0aGlzLnggPSB4O1xyXG4gICAgdGhpcy55ID0geTtcclxuICAgIHRoaXMueiA9IHogLSAwLjE7XHJcbiAgICB0aGlzLnBvd2VyID0gcG93ZXIgfCAxO1xyXG4gICAgdGhpcy5keCA9IE1hdGguY29zKGFpbVJhZGlhbikgKiB0aGlzLnNwZWVkO1xyXG4gICAgdGhpcy5keSA9IE1hdGguc2luKGFpbVJhZGlhbikgKiB0aGlzLnNwZWVkO1xyXG4gICAgdGhpcy5lbmFibGVfID0gdGhpcy5tZXNoLnZpc2libGUgPSB0cnVlO1xyXG4gICAgdGhpcy5zZSgwKTtcclxuICAgIC8vc2VxdWVuY2VyLnBsYXlUcmFja3Moc291bmRFZmZlY3RzLnNvdW5kRWZmZWN0c1swXSk7XHJcbiAgICB0aGlzLnRhc2sgPSBzZmcudGFza3MucHVzaFRhc2sodGhpcy5tb3ZlLmJpbmQodGhpcykpO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g6Ieq5qmf44Kq44OW44K444Kn44Kv44OIXHJcbmV4cG9ydCBjbGFzcyBNeVNoaXAgZXh0ZW5kcyBnYW1lb2JqLkdhbWVPYmogeyBcclxuICBjb25zdHJ1Y3Rvcih4LCB5LCB6LHNjZW5lLHNlKSB7XHJcbiAgc3VwZXIoeCwgeSwgeik7Ly8gZXh0ZW5kXHJcblxyXG4gIHRoaXMuY29sbGlzaW9uQXJlYS53aWR0aCA9IDY7XHJcbiAgdGhpcy5jb2xsaXNpb25BcmVhLmhlaWdodCA9IDg7XHJcbiAgdGhpcy5zZSA9IHNlO1xyXG4gIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuICB0aGlzLnRleHR1cmVXaWR0aCA9IHNmZy50ZXh0dXJlRmlsZXMubXlzaGlwLmltYWdlLndpZHRoO1xyXG4gIHRoaXMudGV4dHVyZUhlaWdodCA9IHNmZy50ZXh0dXJlRmlsZXMubXlzaGlwLmltYWdlLmhlaWdodDtcclxuICB0aGlzLndpZHRoID0gMTY7XHJcbiAgdGhpcy5oZWlnaHQgPSAxNjtcclxuXHJcbiAgLy8g56e75YuV56+E5Zuy44KS5rGC44KB44KLXHJcbiAgdGhpcy50b3AgPSAoc2ZnLlZfVE9QIC0gdGhpcy5oZWlnaHQgLyAyKSB8IDA7XHJcbiAgdGhpcy5ib3R0b20gPSAoc2ZnLlZfQk9UVE9NICsgdGhpcy5oZWlnaHQgLyAyKSB8IDA7XHJcbiAgdGhpcy5sZWZ0ID0gKHNmZy5WX0xFRlQgKyB0aGlzLndpZHRoIC8gMikgfCAwO1xyXG4gIHRoaXMucmlnaHQgPSAoc2ZnLlZfUklHSFQgLSB0aGlzLndpZHRoIC8gMikgfCAwO1xyXG5cclxuICAvLyDjg6Hjg4Pjgrfjg6Xjga7kvZzmiJDjg7vooajnpLpcclxuICAvLyDjg57jg4bjg6rjgqLjg6vjga7kvZzmiJBcclxuICB2YXIgbWF0ZXJpYWwgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVNYXRlcmlhbChzZmcudGV4dHVyZUZpbGVzLm15c2hpcCk7XHJcbiAgLy8g44K444Kq44Oh44OI44Oq44Gu5L2c5oiQXHJcbiAgdmFyIGdlb21ldHJ5ID0gZ3JhcGhpY3MuY3JlYXRlU3ByaXRlR2VvbWV0cnkodGhpcy53aWR0aCk7XHJcbiAgZ3JhcGhpY3MuY3JlYXRlU3ByaXRlVVYoZ2VvbWV0cnksIHNmZy50ZXh0dXJlRmlsZXMubXlzaGlwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgMCk7XHJcblxyXG4gIHRoaXMubWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcblxyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi54ID0gdGhpcy54XztcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueSA9IHRoaXMueV87XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnogPSB0aGlzLnpfO1xyXG4gIHRoaXMucmVzdCA9IDM7XHJcbiAgdGhpcy5teUJ1bGxldHMgPSAoICgpPT4ge1xyXG4gICAgdmFyIGFyciA9IFtdO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAyOyArK2kpIHtcclxuICAgICAgYXJyLnB1c2gobmV3IE15QnVsbGV0KHRoaXMuc2NlbmUsdGhpcy5zZSkpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFycjtcclxuICB9KSgpO1xyXG4gIHNjZW5lLmFkZCh0aGlzLm1lc2gpO1xyXG4gIFxyXG4gIHRoaXMuYnVsbGV0UG93ZXIgPSAxO1xyXG5cclxufVxyXG4gIGdldCB4KCkgeyByZXR1cm4gdGhpcy54XzsgfVxyXG4gIHNldCB4KHYpIHsgdGhpcy54XyA9IHRoaXMubWVzaC5wb3NpdGlvbi54ID0gdjsgfVxyXG4gIGdldCB5KCkgeyByZXR1cm4gdGhpcy55XzsgfVxyXG4gIHNldCB5KHYpIHsgdGhpcy55XyA9IHRoaXMubWVzaC5wb3NpdGlvbi55ID0gdjsgfVxyXG4gIGdldCB6KCkgeyByZXR1cm4gdGhpcy56XzsgfVxyXG4gIHNldCB6KHYpIHsgdGhpcy56XyA9IHRoaXMubWVzaC5wb3NpdGlvbi56ID0gdjsgfVxyXG4gIFxyXG4gIHNob290KGFpbVJhZGlhbikge1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHRoaXMubXlCdWxsZXRzLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIGlmICh0aGlzLm15QnVsbGV0c1tpXS5zdGFydCh0aGlzLngsIHRoaXMueSAsIHRoaXMueixhaW1SYWRpYW4sdGhpcy5idWxsZXRQb3dlcikpIHtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBhY3Rpb24oYmFzaWNJbnB1dCkge1xyXG4gICAgaWYgKGJhc2ljSW5wdXQubGVmdCkge1xyXG4gICAgICBpZiAodGhpcy54ID4gdGhpcy5sZWZ0KSB7XHJcbiAgICAgICAgdGhpcy54IC09IDI7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoYmFzaWNJbnB1dC5yaWdodCkge1xyXG4gICAgICBpZiAodGhpcy54IDwgdGhpcy5yaWdodCkge1xyXG4gICAgICAgIHRoaXMueCArPSAyO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGJhc2ljSW5wdXQudXApIHtcclxuICAgICAgaWYgKHRoaXMueSA8IHRoaXMudG9wKSB7XHJcbiAgICAgICAgdGhpcy55ICs9IDI7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoYmFzaWNJbnB1dC5kb3duKSB7XHJcbiAgICAgIGlmICh0aGlzLnkgPiB0aGlzLmJvdHRvbSkge1xyXG4gICAgICAgIHRoaXMueSAtPSAyO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGlmIChiYXNpY0lucHV0LnopIHtcclxuICAgICAgYmFzaWNJbnB1dC5rZXlDaGVjay56ID0gZmFsc2U7XHJcbiAgICAgIHRoaXMuc2hvb3QoMC41ICogTWF0aC5QSSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGJhc2ljSW5wdXQueCkge1xyXG4gICAgICBiYXNpY0lucHV0LmtleUNoZWNrLnggPSBmYWxzZTtcclxuICAgICAgdGhpcy5zaG9vdCgxLjUgKiBNYXRoLlBJKTtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgaGl0KCkge1xyXG4gICAgdGhpcy5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxuICAgIHNmZy5ib21icy5zdGFydCh0aGlzLngsIHRoaXMueSwgMC4yKTtcclxuICAgIHRoaXMuc2UoNCk7XHJcbiAgfVxyXG4gIFxyXG4gIHJlc2V0KCl7XHJcbiAgICB0aGlzLm15QnVsbGV0cy5mb3JFYWNoKChkKT0+e1xyXG4gICAgICBpZihkLmVuYWJsZV8pe1xyXG4gICAgICAgIHdoaWxlKCFzZmcudGFza3MuYXJyYXlbZC50YXNrLmluZGV4XS5nZW5JbnN0Lm5leHQoLSgxICsgZC50YXNrLmluZGV4KSkuZG9uZSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuICBcclxuICBpbml0KCl7XHJcbiAgICAgIHRoaXMueCA9IDA7XHJcbiAgICAgIHRoaXMueSA9IC0xMDA7XHJcbiAgICAgIHRoaXMueiA9IDAuMTtcclxuICAgICAgdGhpcy5tZXNoLnZpc2libGUgPSB0cnVlO1xyXG4gIH1cclxuXHJcbn0iLCJcInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0ICogYXMgc2ZnIGZyb20gJy4vZ2xvYmFsJztcclxuLy9pbXBvcnQgKiAgYXMgZ2FtZW9iaiBmcm9tICcuL2dhbWVvYmonO1xyXG4vL2ltcG9ydCAqIGFzIGdyYXBoaWNzIGZyb20gJy4vZ3JhcGhpY3MnO1xyXG5cclxuLy8vIOODhuOCreOCueODiOWxnuaAp1xyXG5leHBvcnQgY2xhc3MgVGV4dEF0dHJpYnV0ZSB7XHJcbiAgY29uc3RydWN0b3IoYmxpbmssIGZvbnQpIHtcclxuICAgIGlmIChibGluaykge1xyXG4gICAgICB0aGlzLmJsaW5rID0gYmxpbms7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmJsaW5rID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBpZiAoZm9udCkge1xyXG4gICAgICB0aGlzLmZvbnQgPSBmb250O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5mb250ID0gc2ZnLnRleHR1cmVGaWxlcy5mb250O1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLy8vIOODhuOCreOCueODiOODl+ODrOODvOODs1xyXG5leHBvcnQgY2xhc3MgVGV4dFBsYW5leyBcclxuICBjb25zdHJ1Y3RvciAoc2NlbmUpIHtcclxuICB0aGlzLnRleHRCdWZmZXIgPSBuZXcgQXJyYXkoc2ZnLlRFWFRfSEVJR0hUKTtcclxuICB0aGlzLmF0dHJCdWZmZXIgPSBuZXcgQXJyYXkoc2ZnLlRFWFRfSEVJR0hUKTtcclxuICB0aGlzLnRleHRCYWNrQnVmZmVyID0gbmV3IEFycmF5KHNmZy5URVhUX0hFSUdIVCk7XHJcbiAgdGhpcy5hdHRyQmFja0J1ZmZlciA9IG5ldyBBcnJheShzZmcuVEVYVF9IRUlHSFQpO1xyXG4gIHZhciBlbmRpID0gdGhpcy50ZXh0QnVmZmVyLmxlbmd0aDtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGVuZGk7ICsraSkge1xyXG4gICAgdGhpcy50ZXh0QnVmZmVyW2ldID0gbmV3IEFycmF5KHNmZy5URVhUX1dJRFRIKTtcclxuICAgIHRoaXMuYXR0ckJ1ZmZlcltpXSA9IG5ldyBBcnJheShzZmcuVEVYVF9XSURUSCk7XHJcbiAgICB0aGlzLnRleHRCYWNrQnVmZmVyW2ldID0gbmV3IEFycmF5KHNmZy5URVhUX1dJRFRIKTtcclxuICAgIHRoaXMuYXR0ckJhY2tCdWZmZXJbaV0gPSBuZXcgQXJyYXkoc2ZnLlRFWFRfV0lEVEgpO1xyXG4gIH1cclxuXHJcblxyXG4gIC8vIOaPj+eUu+eUqOOCreODo+ODs+ODkOOCueOBruOCu+ODg+ODiOOCouODg+ODl1xyXG5cclxuICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gIHZhciB3aWR0aCA9IDE7XHJcbiAgd2hpbGUgKHdpZHRoIDw9IHNmZy5WSVJUVUFMX1dJRFRIKXtcclxuICAgIHdpZHRoICo9IDI7XHJcbiAgfVxyXG4gIHZhciBoZWlnaHQgPSAxO1xyXG4gIHdoaWxlIChoZWlnaHQgPD0gc2ZnLlZJUlRVQUxfSEVJR0hUKXtcclxuICAgIGhlaWdodCAqPSAyO1xyXG4gIH1cclxuICBcclxuICB0aGlzLmNhbnZhcy53aWR0aCA9IHdpZHRoO1xyXG4gIHRoaXMuY2FudmFzLmhlaWdodCA9IGhlaWdodDtcclxuICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgdGhpcy50ZXh0dXJlID0gbmV3IFRIUkVFLlRleHR1cmUodGhpcy5jYW52YXMpO1xyXG4gIHRoaXMudGV4dHVyZS5tYWdGaWx0ZXIgPSBUSFJFRS5OZWFyZXN0RmlsdGVyO1xyXG4gIHRoaXMudGV4dHVyZS5taW5GaWx0ZXIgPSBUSFJFRS5MaW5lYXJNaXBNYXBMaW5lYXJGaWx0ZXI7XHJcbiAgdGhpcy5tYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7IG1hcDogdGhpcy50ZXh0dXJlLGFscGhhVGVzdDowLjUsIHRyYW5zcGFyZW50OiB0cnVlLGRlcHRoVGVzdDp0cnVlLHNoYWRpbmc6VEhSRUUuRmxhdFNoYWRpbmd9KTtcclxuLy8gIHRoaXMuZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeShzZmcuVklSVFVBTF9XSURUSCwgc2ZnLlZJUlRVQUxfSEVJR0hUKTtcclxuICB0aGlzLmdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkod2lkdGgsIGhlaWdodCk7XHJcbiAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2godGhpcy5nZW9tZXRyeSwgdGhpcy5tYXRlcmlhbCk7XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnogPSAwLjQ7XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnggPSAod2lkdGggLSBzZmcuVklSVFVBTF9XSURUSCkgLyAyO1xyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi55ID0gIC0gKGhlaWdodCAtIHNmZy5WSVJUVUFMX0hFSUdIVCkgLyAyO1xyXG4gIHRoaXMuZm9udHMgPSB7IGZvbnQ6IHNmZy50ZXh0dXJlRmlsZXMuZm9udCwgZm9udDE6IHNmZy50ZXh0dXJlRmlsZXMuZm9udDEgfTtcclxuICB0aGlzLmJsaW5rQ291bnQgPSAwO1xyXG4gIHRoaXMuYmxpbmsgPSBmYWxzZTtcclxuXHJcbiAgLy8g44K544Og44O844K444Oz44Kw44KS5YiH44KLXHJcbiAgdGhpcy5jdHgubXNJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICB0aGlzLmN0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICAvL3RoaXMuY3R4LndlYmtpdEltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIHRoaXMuY3R4Lm1vekltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG5cclxuICB0aGlzLmNscygpO1xyXG4gIHNjZW5lLmFkZCh0aGlzLm1lc2gpO1xyXG59XHJcblxyXG4gIC8vLyDnlLvpnaLmtojljrtcclxuICBjbHMoKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kaSA9IHRoaXMudGV4dEJ1ZmZlci5sZW5ndGg7IGkgPCBlbmRpOyArK2kpIHtcclxuICAgICAgdmFyIGxpbmUgPSB0aGlzLnRleHRCdWZmZXJbaV07XHJcbiAgICAgIHZhciBhdHRyX2xpbmUgPSB0aGlzLmF0dHJCdWZmZXJbaV07XHJcbiAgICAgIHZhciBsaW5lX2JhY2sgPSB0aGlzLnRleHRCYWNrQnVmZmVyW2ldO1xyXG4gICAgICB2YXIgYXR0cl9saW5lX2JhY2sgPSB0aGlzLmF0dHJCYWNrQnVmZmVyW2ldO1xyXG5cclxuICAgICAgZm9yICh2YXIgaiA9IDAsIGVuZGogPSB0aGlzLnRleHRCdWZmZXJbaV0ubGVuZ3RoOyBqIDwgZW5kajsgKytqKSB7XHJcbiAgICAgICAgbGluZVtqXSA9IDB4MjA7XHJcbiAgICAgICAgYXR0cl9saW5lW2pdID0gMHgwMDtcclxuICAgICAgICAvL2xpbmVfYmFja1tqXSA9IDB4MjA7XHJcbiAgICAgICAgLy9hdHRyX2xpbmVfYmFja1tqXSA9IDB4MDA7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCBzZmcuVklSVFVBTF9XSURUSCwgc2ZnLlZJUlRVQUxfSEVJR0hUKTtcclxuICB9XHJcblxyXG4gIC8vLyDmloflrZfooajnpLrjgZnjgotcclxuICBwcmludCh4LCB5LCBzdHIsIGF0dHJpYnV0ZSkge1xyXG4gICAgdmFyIGxpbmUgPSB0aGlzLnRleHRCdWZmZXJbeV07XHJcbiAgICB2YXIgYXR0ciA9IHRoaXMuYXR0ckJ1ZmZlclt5XTtcclxuICAgIGlmICghYXR0cmlidXRlKSB7XHJcbiAgICAgIGF0dHJpYnV0ZSA9IDA7XHJcbiAgICB9XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7ICsraSkge1xyXG4gICAgICB2YXIgYyA9IHN0ci5jaGFyQ29kZUF0KGkpO1xyXG4gICAgICBpZiAoYyA9PSAweGEpIHtcclxuICAgICAgICArK3k7XHJcbiAgICAgICAgaWYgKHkgPj0gdGhpcy50ZXh0QnVmZmVyLmxlbmd0aCkge1xyXG4gICAgICAgICAgLy8g44K544Kv44Ot44O844OrXHJcbiAgICAgICAgICB0aGlzLnRleHRCdWZmZXIgPSB0aGlzLnRleHRCdWZmZXIuc2xpY2UoMSwgdGhpcy50ZXh0QnVmZmVyLmxlbmd0aCAtIDEpO1xyXG4gICAgICAgICAgdGhpcy50ZXh0QnVmZmVyLnB1c2gobmV3IEFycmF5KHNmZy5WSVJUVUFMX1dJRFRIIC8gOCkpO1xyXG4gICAgICAgICAgdGhpcy5hdHRyQnVmZmVyID0gdGhpcy5hdHRyQnVmZmVyLnNsaWNlKDEsIHRoaXMuYXR0ckJ1ZmZlci5sZW5ndGggLSAxKTtcclxuICAgICAgICAgIHRoaXMuYXR0ckJ1ZmZlci5wdXNoKG5ldyBBcnJheShzZmcuVklSVFVBTF9XSURUSCAvIDgpKTtcclxuICAgICAgICAgIC0teTtcclxuICAgICAgICAgIHZhciBlbmRqID0gdGhpcy50ZXh0QnVmZmVyW3ldLmxlbmd0aDtcclxuICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgZW5kajsgKytqKSB7XHJcbiAgICAgICAgICAgIHRoaXMudGV4dEJ1ZmZlclt5XVtqXSA9IDB4MjA7XHJcbiAgICAgICAgICAgIHRoaXMuYXR0ckJ1ZmZlclt5XVtqXSA9IDB4MDA7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxpbmUgPSB0aGlzLnRleHRCdWZmZXJbeV07XHJcbiAgICAgICAgYXR0ciA9IHRoaXMuYXR0ckJ1ZmZlclt5XTtcclxuICAgICAgICB4ID0gMDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBsaW5lW3hdID0gYztcclxuICAgICAgICBhdHRyW3hdID0gYXR0cmlidXRlO1xyXG4gICAgICAgICsreDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICAvLy8g44OG44Kt44K544OI44OH44O844K/44KS44KC44Go44Gr44OG44Kv44K544OB44Oj44O844Gr5o+P55S744GZ44KLXHJcbiAgcmVuZGVyKCkge1xyXG4gICAgdmFyIGN0eCA9IHRoaXMuY3R4O1xyXG4gICAgdGhpcy5ibGlua0NvdW50ID0gKHRoaXMuYmxpbmtDb3VudCArIDEpICYgMHhmO1xyXG5cclxuICAgIHZhciBkcmF3X2JsaW5rID0gZmFsc2U7XHJcbiAgICBpZiAoIXRoaXMuYmxpbmtDb3VudCkge1xyXG4gICAgICB0aGlzLmJsaW5rID0gIXRoaXMuYmxpbms7XHJcbiAgICAgIGRyYXdfYmxpbmsgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgdmFyIHVwZGF0ZSA9IGZhbHNlO1xyXG4vLyAgICBjdHguY2xlYXJSZWN0KDAsIDAsIENPTlNPTEVfV0lEVEgsIENPTlNPTEVfSEVJR0hUKTtcclxuLy8gICAgY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuXHJcbiAgICBmb3IgKHZhciB5ID0gMCwgZ3kgPSAwOyB5IDwgc2ZnLlRFWFRfSEVJR0hUOyArK3ksIGd5ICs9IHNmZy5BQ1RVQUxfQ0hBUl9TSVpFKSB7XHJcbiAgICAgIHZhciBsaW5lID0gdGhpcy50ZXh0QnVmZmVyW3ldO1xyXG4gICAgICB2YXIgYXR0cl9saW5lID0gdGhpcy5hdHRyQnVmZmVyW3ldO1xyXG4gICAgICB2YXIgbGluZV9iYWNrID0gdGhpcy50ZXh0QmFja0J1ZmZlclt5XTtcclxuICAgICAgdmFyIGF0dHJfbGluZV9iYWNrID0gdGhpcy5hdHRyQmFja0J1ZmZlclt5XTtcclxuICAgICAgZm9yICh2YXIgeCA9IDAsIGd4ID0gMDsgeCA8IHNmZy5URVhUX1dJRFRIOyArK3gsIGd4ICs9IHNmZy5BQ1RVQUxfQ0hBUl9TSVpFKSB7XHJcbiAgICAgICAgdmFyIHByb2Nlc3NfYmxpbmsgPSAoYXR0cl9saW5lW3hdICYmIGF0dHJfbGluZVt4XS5ibGluayk7XHJcbiAgICAgICAgaWYgKGxpbmVbeF0gIT0gbGluZV9iYWNrW3hdIHx8IGF0dHJfbGluZVt4XSAhPSBhdHRyX2xpbmVfYmFja1t4XSB8fCAocHJvY2Vzc19ibGluayAmJiBkcmF3X2JsaW5rKSkge1xyXG4gICAgICAgICAgdXBkYXRlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICBsaW5lX2JhY2tbeF0gPSBsaW5lW3hdO1xyXG4gICAgICAgICAgYXR0cl9saW5lX2JhY2tbeF0gPSBhdHRyX2xpbmVbeF07XHJcbiAgICAgICAgICB2YXIgYyA9IDA7XHJcbiAgICAgICAgICBpZiAoIXByb2Nlc3NfYmxpbmsgfHwgdGhpcy5ibGluaykge1xyXG4gICAgICAgICAgICBjID0gbGluZVt4XSAtIDB4MjA7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB2YXIgeXBvcyA9IChjID4+IDQpIDw8IDM7XHJcbiAgICAgICAgICB2YXIgeHBvcyA9IChjICYgMHhmKSA8PCAzO1xyXG4gICAgICAgICAgY3R4LmNsZWFyUmVjdChneCwgZ3ksIHNmZy5BQ1RVQUxfQ0hBUl9TSVpFLCBzZmcuQUNUVUFMX0NIQVJfU0laRSk7XHJcbiAgICAgICAgICB2YXIgZm9udCA9IGF0dHJfbGluZVt4XSA/IGF0dHJfbGluZVt4XS5mb250IDogc2ZnLnRleHR1cmVGaWxlcy5mb250O1xyXG4gICAgICAgICAgaWYgKGMpIHtcclxuICAgICAgICAgICAgY3R4LmRyYXdJbWFnZShmb250LmltYWdlLCB4cG9zLCB5cG9zLCBzZmcuQ0hBUl9TSVpFLCBzZmcuQ0hBUl9TSVpFLCBneCwgZ3ksIHNmZy5BQ1RVQUxfQ0hBUl9TSVpFLCBzZmcuQUNUVUFMX0NIQVJfU0laRSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLnRleHR1cmUubmVlZHNVcGRhdGUgPSB1cGRhdGU7XHJcbiAgfVxyXG59XHJcbiIsIlxyXG5cInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0ICogYXMgc2ZnIGZyb20gJy4vZ2xvYmFsJztcclxuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICcuL2V2ZW50RW1pdHRlcjMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFRhc2sge1xyXG4gIGNvbnN0cnVjdG9yKGdlbkluc3QscHJpb3JpdHkpIHtcclxuICAgIHRoaXMucHJpb3JpdHkgPSBwcmlvcml0eSB8fCAxMDAwMDtcclxuICAgIHRoaXMuZ2VuSW5zdCA9IGdlbkluc3Q7XHJcbiAgICAvLyDliJ3mnJ/ljJZcclxuICAgIHRoaXMuaW5kZXggPSAwO1xyXG4gIH1cclxuICBcclxufVxyXG5cclxuZXhwb3J0IHZhciBudWxsVGFzayA9IG5ldyBUYXNrKChmdW5jdGlvbiooKXt9KSgpKTtcclxuXHJcbi8vLyDjgr/jgrnjgq/nrqHnkIZcclxuZXhwb3J0IGNsYXNzIFRhc2tzIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcclxuICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgc3VwZXIoKTtcclxuICAgIHRoaXMuYXJyYXkgPSBuZXcgQXJyYXkoMCk7XHJcbiAgICB0aGlzLm5lZWRTb3J0ID0gZmFsc2U7XHJcbiAgICB0aGlzLm5lZWRDb21wcmVzcyA9IGZhbHNlO1xyXG4gICAgdGhpcy5lbmFibGUgPSB0cnVlO1xyXG4gICAgdGhpcy5zdG9wcGVkID0gZmFsc2U7XHJcbiAgfVxyXG4gIC8vIGluZGV444Gu5L2N572u44Gu44K/44K544Kv44KS572u44GN5o+b44GI44KLXHJcbiAgc2V0TmV4dFRhc2soaW5kZXgsIGdlbkluc3QsIHByaW9yaXR5KSBcclxuICB7XHJcbiAgICBpZihpbmRleCA8IDApe1xyXG4gICAgICBpbmRleCA9IC0oKytpbmRleCk7XHJcbiAgICB9XHJcbiAgICBpZih0aGlzLmFycmF5W2luZGV4XS5wcmlvcml0eSA9PSAxMDAwMDApe1xyXG4gICAgICBkZWJ1Z2dlcjtcclxuICAgIH1cclxuICAgIHZhciB0ID0gbmV3IFRhc2soZ2VuSW5zdChpbmRleCksIHByaW9yaXR5KTtcclxuICAgIHQuaW5kZXggPSBpbmRleDtcclxuICAgIHRoaXMuYXJyYXlbaW5kZXhdID0gdDtcclxuICAgIHRoaXMubmVlZFNvcnQgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgcHVzaFRhc2soZ2VuSW5zdCwgcHJpb3JpdHkpIHtcclxuICAgIGxldCB0O1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmFycmF5Lmxlbmd0aDsgKytpKSB7XHJcbiAgICAgIGlmICh0aGlzLmFycmF5W2ldID09IG51bGxUYXNrKSB7XHJcbiAgICAgICAgdCA9IG5ldyBUYXNrKGdlbkluc3QoaSksIHByaW9yaXR5KTtcclxuICAgICAgICB0aGlzLmFycmF5W2ldID0gdDtcclxuICAgICAgICB0LmluZGV4ID0gaTtcclxuICAgICAgICByZXR1cm4gdDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdCA9IG5ldyBUYXNrKGdlbkluc3QodGhpcy5hcnJheS5sZW5ndGgpLHByaW9yaXR5KTtcclxuICAgIHQuaW5kZXggPSB0aGlzLmFycmF5Lmxlbmd0aDtcclxuICAgIHRoaXMuYXJyYXlbdGhpcy5hcnJheS5sZW5ndGhdID0gdDtcclxuICAgIHRoaXMubmVlZFNvcnQgPSB0cnVlO1xyXG4gICAgcmV0dXJuIHQ7XHJcbiAgfVxyXG5cclxuICAvLyDphY3liJfjgpLlj5blvpfjgZnjgotcclxuICBnZXRBcnJheSgpIHtcclxuICAgIHJldHVybiB0aGlzLmFycmF5O1xyXG4gIH1cclxuICAvLyDjgr/jgrnjgq/jgpLjgq/jg6rjgqLjgZnjgotcclxuICBjbGVhcigpIHtcclxuICAgIHRoaXMuYXJyYXkubGVuZ3RoID0gMDtcclxuICB9XHJcbiAgLy8g44K944O844OI44GM5b+F6KaB44GL44OB44Kn44OD44Kv44GX44CB44K944O844OI44GZ44KLXHJcbiAgY2hlY2tTb3J0KCkge1xyXG4gICAgaWYgKHRoaXMubmVlZFNvcnQpIHtcclxuICAgICAgdGhpcy5hcnJheS5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XHJcbiAgICAgICAgaWYoYS5wcmlvcml0eSA+IGIucHJpb3JpdHkpIHJldHVybiAxO1xyXG4gICAgICAgIGlmIChhLnByaW9yaXR5IDwgYi5wcmlvcml0eSkgcmV0dXJuIC0xO1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgICB9KTtcclxuICAgICAgLy8g44Kk44Oz44OH44OD44Kv44K544Gu5oyv44KK55u044GXXHJcbiAgICAgIGZvciAodmFyIGkgPSAwLCBlID0gdGhpcy5hcnJheS5sZW5ndGg7IGkgPCBlOyArK2kpIHtcclxuICAgICAgICB0aGlzLmFycmF5W2ldLmluZGV4ID0gaTtcclxuICAgICAgfVxyXG4gICAgIHRoaXMubmVlZFNvcnQgPSBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJlbW92ZVRhc2soaW5kZXgpIHtcclxuICAgIGlmKGluZGV4IDwgMCl7XHJcbiAgICAgIGluZGV4ID0gLSgrK2luZGV4KTtcclxuICAgIH1cclxuICAgIGlmKHRoaXMuYXJyYXlbaW5kZXhdLnByaW9yaXR5ID09IDEwMDAwMCl7XHJcbiAgICAgIGRlYnVnZ2VyO1xyXG4gICAgfVxyXG4gICAgdGhpcy5hcnJheVtpbmRleF0gPSBudWxsVGFzaztcclxuICAgIHRoaXMubmVlZENvbXByZXNzID0gdHJ1ZTtcclxuICB9XHJcbiAgXHJcbiAgY29tcHJlc3MoKSB7XHJcbiAgICBpZiAoIXRoaXMubmVlZENvbXByZXNzKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHZhciBkZXN0ID0gW107XHJcbiAgICB2YXIgc3JjID0gdGhpcy5hcnJheTtcclxuICAgIHZhciBkZXN0SW5kZXggPSAwO1xyXG4gICAgZGVzdCA9IHNyYy5maWx0ZXIoKHYsaSk9PntcclxuICAgICAgbGV0IHJldCA9IHYgIT0gbnVsbFRhc2s7XHJcbiAgICAgIGlmKHJldCl7XHJcbiAgICAgICAgdi5pbmRleCA9IGRlc3RJbmRleCsrO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiByZXQ7XHJcbiAgICB9KTtcclxuICAgIHRoaXMuYXJyYXkgPSBkZXN0O1xyXG4gICAgdGhpcy5uZWVkQ29tcHJlc3MgPSBmYWxzZTtcclxuICB9XHJcbiAgXHJcbiAgcHJvY2VzcyhnYW1lKVxyXG4gIHtcclxuICAgIGlmKHRoaXMuZW5hYmxlKXtcclxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMucHJvY2Vzcy5iaW5kKHRoaXMsZ2FtZSkpO1xyXG4gICAgICB0aGlzLnN0b3BwZWQgPSBmYWxzZTtcclxuICAgICAgaWYgKCFzZmcucGF1c2UpIHtcclxuICAgICAgICBpZiAoIWdhbWUuaXNIaWRkZW4pIHtcclxuICAgICAgICAgIHRoaXMuY2hlY2tTb3J0KCk7XHJcbiAgICAgICAgICB0aGlzLmFycmF5LmZvckVhY2goICh0YXNrLGkpID0+e1xyXG4gICAgICAgICAgICBpZiAodGFzayAhPSBudWxsVGFzaykge1xyXG4gICAgICAgICAgICAgIGlmKHRhc2suaW5kZXggIT0gaSApe1xyXG4gICAgICAgICAgICAgICAgZGVidWdnZXI7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIHRhc2suZ2VuSW5zdC5uZXh0KHRhc2suaW5kZXgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHRoaXMuY29tcHJlc3MoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gICAgXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmVtaXQoJ3N0b3BwZWQnKTtcclxuICAgICAgdGhpcy5zdG9wcGVkID0gdHJ1ZTtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgc3RvcFByb2Nlc3MoKXtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSxyZWplY3QpPT57XHJcbiAgICAgIHRoaXMuZW5hYmxlID0gZmFsc2U7XHJcbiAgICAgIHRoaXMub24oJ3N0b3BwZWQnLCgpPT57XHJcbiAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOOCsuODvOODoOeUqOOCv+OCpOODnuODvFxyXG5leHBvcnQgY2xhc3MgR2FtZVRpbWVyIHtcclxuICBjb25zdHJ1Y3RvcihnZXRDdXJyZW50VGltZSkge1xyXG4gICAgdGhpcy5lbGFwc2VkVGltZSA9IDA7XHJcbiAgICB0aGlzLmN1cnJlbnRUaW1lID0gMDtcclxuICAgIHRoaXMucGF1c2VUaW1lID0gMDtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5TVE9QO1xyXG4gICAgdGhpcy5nZXRDdXJyZW50VGltZSA9IGdldEN1cnJlbnRUaW1lO1xyXG4gICAgdGhpcy5TVE9QID0gMTtcclxuICAgIHRoaXMuU1RBUlQgPSAyO1xyXG4gICAgdGhpcy5QQVVTRSA9IDM7XHJcblxyXG4gIH1cclxuICBcclxuICBzdGFydCgpIHtcclxuICAgIHRoaXMuZWxhcHNlZFRpbWUgPSAwO1xyXG4gICAgdGhpcy5kZWx0YVRpbWUgPSAwO1xyXG4gICAgdGhpcy5jdXJyZW50VGltZSA9IHRoaXMuZ2V0Q3VycmVudFRpbWUoKTtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5TVEFSVDtcclxuICB9XHJcblxyXG4gIHJlc3VtZSgpIHtcclxuICAgIHZhciBub3dUaW1lID0gdGhpcy5nZXRDdXJyZW50VGltZSgpO1xyXG4gICAgdGhpcy5jdXJyZW50VGltZSA9IHRoaXMuY3VycmVudFRpbWUgKyBub3dUaW1lIC0gdGhpcy5wYXVzZVRpbWU7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuU1RBUlQ7XHJcbiAgfVxyXG5cclxuICBwYXVzZSgpIHtcclxuICAgIHRoaXMucGF1c2VUaW1lID0gdGhpcy5nZXRDdXJyZW50VGltZSgpO1xyXG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLlBBVVNFO1xyXG4gIH1cclxuXHJcbiAgc3RvcCgpIHtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5TVE9QO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlKCkge1xyXG4gICAgaWYgKHRoaXMuc3RhdHVzICE9IHRoaXMuU1RBUlQpIHJldHVybjtcclxuICAgIHZhciBub3dUaW1lID0gdGhpcy5nZXRDdXJyZW50VGltZSgpO1xyXG4gICAgdGhpcy5kZWx0YVRpbWUgPSBub3dUaW1lIC0gdGhpcy5jdXJyZW50VGltZTtcclxuICAgIHRoaXMuZWxhcHNlZFRpbWUgPSB0aGlzLmVsYXBzZWRUaW1lICsgdGhpcy5kZWx0YVRpbWU7XHJcbiAgICB0aGlzLmN1cnJlbnRUaW1lID0gbm93VGltZTtcclxuICB9XHJcbn1cclxuXHJcbiJdfQ==
