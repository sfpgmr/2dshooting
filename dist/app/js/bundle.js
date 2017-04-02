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
    formEditor.enemyEditor.movSeqEditor.patternNo = events[rowIndex + currentEventIndex][5];
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
          needDraw = true;
        },
        redo: function redo() {
          this.paste();
        },
        undo: function undo() {
          events.splice(this.startIndex, this.count);
          needDraw = true;
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
          formEditor.lineBuffer.push(events[i].clone());
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
            events.splice(this.startIndex, 0, formEditor.lineBuffer[i].clone());
          }
        },
        redo: function redo() {
          this.paste();
        },
        undo: function undo() {
          events.splice(this.startIndex, this.count);
          needDraw = true;
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
    key: 'clone',
    value: function clone() {
      return new LineMove(this.rad, this.speed, this.step);
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
  }, {
    key: 'clone',
    value: function clone() {
      return new CircleMove(this.startRad, this.stopRad, this.r, this.speed, this.left);
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
    key: 'clone',
    value: function clone() {
      return new GotoHome();
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
    key: 'clone',
    value: function clone() {
      return new HomeMove();
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
  }, {
    key: 'clone',
    value: function clone() {
      return new Goto(this.pos);
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
    key: 'clone',
    value: function clone() {
      return new Fire();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGFwcFxcanNcXGNvbnRyb2xsZXIuanMiLCJzcmNcXGFwcFxcanNcXGRldk1haW4uanMiLCJzcmNcXGFwcFxcanNcXGRldnRvb2wuanMiLCJzcmNcXGFwcFxcanNcXGVuZW15RWRpdG9yLmpzIiwic3JjXFxhcHBcXGpzXFxlbmVteUZvcm1hdGlvbkVkaXRvci5qcyIsInNyY1xcYXBwXFxqc1xcZW5lbXlNb3ZTZXFFZGl0b3IuanMiLCJzcmNcXGFwcFxcanNcXHVuZG8uanMiLCJzcmNcXGpzXFxFdmVudEVtaXR0ZXIzLmpzIiwic3JjXFxqc1xcYXVkaW8uanMiLCJzcmNcXGpzXFxjb21tLmpzIiwic3JjXFxqc1xcZWZmZWN0b2JqLmpzIiwic3JjXFxqc1xcZW5lbWllcy5qcyIsInNyY1xcanNcXGV2ZW50RW1pdHRlcjMuanMiLCJzcmNcXGpzXFxnYW1lLmpzIiwic3JjXFxqc1xcZ2FtZW9iai5qcyIsInNyY1xcanNcXGdsb2JhbC5qcyIsInNyY1xcanNcXGdyYXBoaWNzLmpzIiwic3JjXFxqc1xcaW8uanMiLCJzcmNcXGpzXFxteXNoaXAuanMiLCJzcmNcXGpzXFx0ZXh0LmpzIiwic3JjXFxqc1xcdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLFlBQVksQ0FBQzs7Ozs7Ozs7OztJQUVRLFVBQVU7QUFDN0IsV0FEbUIsVUFBVSxDQUNqQixPQUFPLEVBQ25COzBCQUZtQixVQUFVOztBQUczQixRQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUN2QixRQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO0FBQ3JCLFFBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPOztBQUFDLEFBRTlCLFFBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQzs7QUFFbEMsUUFBSSxjQUFjLEdBQ2xCOztBQUVFO0FBQ0UsVUFBSSxFQUFD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Q0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLElBQUksQ0FBQztBQUN2QyxLQUFHLEVBQUUsSUFBSSxZQUFZLENBQUMsQ0FBQyxFQUFDLEtBQUssRUFBQyxPQUFPLENBQUM7QUFDdEMsT0FBSyxFQUFFLElBQUksWUFBWSxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsV0FBVyxDQUFDO0FBQzlDLE1BQUksRUFBRSxJQUFJLFlBQVksQ0FBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLFdBQVcsQ0FBQztBQUM1QyxJQUFFLEVBQUUsSUFBSSxZQUFZLENBQUMsQ0FBQyxFQUFDLElBQUksRUFBQyxXQUFXLENBQUM7QUFDeEMsTUFBSSxFQUFFLElBQUksWUFBWSxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsV0FBVyxDQUFDO0FBQzVDLE1BQUksRUFBRSxJQUFJLFlBQVksQ0FBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLE1BQU0sQ0FBQztBQUN2QyxNQUFJLEVBQUUsSUFBSSxZQUFZLENBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxLQUFLLENBQUM7QUFDdEMsUUFBTSxFQUFFLElBQUksWUFBWSxDQUFDLEVBQUUsRUFBQyxRQUFRLEVBQUMsUUFBUSxDQUFDO0FBQzlDLFVBQVEsRUFBRSxJQUFJLFlBQVksQ0FBQyxFQUFFLEVBQUMsVUFBVSxFQUFDLFFBQVEsQ0FBQztBQUNsRCxNQUFJLEVBQUUsSUFBSSxZQUFZLENBQUMsRUFBRSxFQUFDLE1BQU0sRUFBQyxRQUFRLENBQUM7QUFDMUMsS0FBRyxFQUFFLElBQUksWUFBWSxDQUFDLEVBQUUsRUFBQyxLQUFLLEVBQUMsUUFBUSxDQUFDO0FBQ3hDLFVBQVEsRUFBRSxJQUFJLFlBQVksQ0FBQyxFQUFFLEVBQUMsVUFBVSxFQUFDLFlBQVksQ0FBQztBQUN0RCxZQUFVLEVBQUUsSUFBSSxZQUFZLENBQUMsRUFBRSxFQUFDLFlBQVksRUFBQyxZQUFZLENBQUM7QUFDMUQsUUFBTSxFQUFFLElBQUksWUFBWSxDQUFDLEVBQUUsRUFBQyxRQUFRLEVBQUMsS0FBSyxDQUFDO0FBQzNDLFdBQVMs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Q0FBQztBQUNGLElBQUUsRUFBRSxDQUFDO0FBQ0gsV0FBTyxFQUFFLEVBQUU7QUFDWCxXQUFPLEVBQUUsS0FBSztBQUNkLFlBQVEsRUFBRSxLQUFLO0FBQ2YsVUFBTSxFQUFFLEtBQUs7QUFDYixXQUFPLEVBQUUsS0FBSztBQUNkLGdCQUFZLEVBQUUsYUFBYSxDQUFDLEdBQUc7R0FDaEMsQ0FBQztBQUNGLElBQUUsRUFBRSxDQUFDO0FBQ0gsV0FBTyxFQUFFLEVBQUU7QUFDWCxXQUFPLEVBQUUsSUFBSTtBQUNiLFlBQVEsRUFBRSxLQUFLO0FBQ2YsVUFBTSxFQUFFLEtBQUs7QUFDYixXQUFPLEVBQUUsS0FBSztBQUNkLGdCQUFZLEVBQUUsYUFBYSxDQUFDLE1BQU07R0FDbkMsQ0FBQztBQUNGLElBQUUsRUFBRSxDQUFDO0FBQ0gsV0FBTyxFQUFFLEVBQUU7QUFDWCxXQUFPLEVBQUUsSUFBSTtBQUNiLFlBQVEsRUFBRSxLQUFLO0FBQ2YsVUFBTSxFQUFFLEtBQUs7QUFDYixXQUFPLEVBQUUsS0FBSztBQUNkLGdCQUFZLEVBQUUsYUFBYSxDQUFDLFNBQVM7R0FDdEMsQ0FBQztBQUNGLEtBQUcsRUFBQztBQUNGO0FBQ0EsV0FBTyxFQUFFLEdBQUc7QUFDWixXQUFPLEVBQUUsS0FBSztBQUNkLFlBQVEsRUFBRSxLQUFLO0FBQ2YsVUFBTSxFQUFFLEtBQUs7QUFDYixXQUFPLEVBQUUsS0FBSztBQUNkLGdCQUFZLEVBQUUsYUFBYSxDQUFDLE1BQU07R0FDakMsQ0FDRjtBQUNELEtBQUcsRUFBQztBQUNGO0FBQ0EsV0FBTyxFQUFFLEdBQUc7QUFDWixXQUFPLEVBQUUsS0FBSztBQUNkLFlBQVEsRUFBRSxLQUFLO0FBQ2YsVUFBTSxFQUFFLEtBQUs7QUFDYixXQUFPLEVBQUUsS0FBSztBQUNkLGdCQUFZLEVBQUUsYUFBYSxDQUFDLFFBQVE7R0FDbkMsQ0FDRjtBQUNELEtBQUcsRUFBQztBQUNGO0FBQ0EsV0FBTyxFQUFFLEdBQUc7QUFDWixXQUFPLEVBQUUsS0FBSztBQUNkLFlBQVEsRUFBRSxLQUFLO0FBQ2Ys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QUFLO0FBQ2QsZ0JBQVksRUFBRSxhQUFhLENBQUMsS0FBSztHQUNsQyxDQUFDO0FBQ0YsSUFBRSxFQUFFLENBQUM7QUFDSCxXQUFPLEVBQUUsRUFBRTtBQUNYLFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsS0FBSztBQUNiLFdBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVksRUFBRSxhQUFhLENBQUMsR0FBRztHQUNoQyxDQUFDO0FBQ0YsSUFBRSxFQUFFLENBQUM7QUFDSCxXQUFPLEVBQUUsRUFBRTtBQUNYLFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsS0FBSztBQUNiLFdBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVksRUFBRSxhQUFhLENBQUMsS0FBSztHQUNsQyxDQUFDO0FBQ0YsSUFBRSxFQUFFLENBQUM7QUFDSCxXQUFPLEVBQUUsRUFBRTtBQUNYLFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsS0FBSztBQUNiLFdBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVksRUFBRSxhQUFhLENBQUMsS0FBSztHQUNsQyxDQUFDO0FBQ0YsSUFBRSxFQUFFLENBQUM7QUFDSCxXQUFPLEVBQUUsRUFBRTtBQUNYLFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsS0FBSztBQUNiLFdBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVksRUFBRSxhQUFhLENBQUMsSUFBSTtHQUNqQyxDQUFDO0FBQ0YsSUFBRSxFQUFFLENBQUM7QUFDSCxXQUFPLEVBQUUsRUFBRTtBQUNYLFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsS0FBSztBQUNiLFdBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVksRUFBRSxhQUFhLENBQUMsRUFBRTtHQUMvQixDQUFDO0FBQ0YsSUFBRSxFQUFFLENBQUM7QUFDSCxXQUFPLEVBQUUsRUFBRTtBQUNY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QUFDLElBQUksRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFFOUUsWUFBUSxHQUFHO0FBQ1QsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsQUFDMUQsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEFBQzlELFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsQUFDbEUsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsQUFDdEUsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEFBQzFFLFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsS0FDL0U7O0FBRUQsU0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLEdBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNsRCxVQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUM1Qjs7QUFFRCxhQUFTLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0dBQzdDLE1BQU07QUFDTCxRQUFJLE1BQU0sR0FBRyxTQUFTLENBQUMsTUFBTTtRQUN6QixDQUFDLENBQUM7O0FBRU4sU0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDM0IsVUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUVwRixjQUFRLEdBQUc7QUFDVCxhQUFLLENBQUM7QUFBRSxtQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEFBQUMsTUFBTTtBQUFBLEFBQzFELGFBQUssQ0FBQztBQUFFLG1CQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEFBQUMsTUFBTTtBQUFBLEFBQzlELGFBQUssQ0FBQztBQUFFLG1CQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxBQUFDLE1BQU07QUFBQSxBQUNsRTtBQUNFLGNBQUksQ0FBQyxJQUFJLEVB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RSxDQUFDLEVBQUMsSUFBSSxDQUFDO0lBQ3RCLENBQUMsR0FBSSxJQUFJLElBQUksQ0FBRSxDQUFDLEVBQUMsSUFBSSxDQUFDO0lBQ3RCLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBRSxDQUFDLEVBQUMsSUFBSSxDQUFDO0lBQ3RCLENBQUMsR0FBSSxJQUFJLElBQUksQ0FBRSxDQUFDLEVBQUMsSUFBSSxDQUFDO0lBQ3RCLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBQyxFQUFFLEVBQUMsSUFBSSxDQUFDO0lBQ3RCLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDOzs7O0FBQUMsQUFJekIsU0FBUyxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFDM0M7QUFDRSxNQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUNqQixNQUFJLENBQUMsR0FBRyxHQUFHLEdBQUc7O0FBQUMsQUFFZixNQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUNqQixNQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUNqQixNQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztDQUNoQjs7QUFFRCxTQUFTLFFBQVEsQ0FBQyxLQUFLLEVBQUMsSUFBSSxFQUFDLEdBQUcsRUFBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLEdBQUcsRUFDOUM7QUFDRSxNQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUM7QUFDNUIsTUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQztBQUNsQyxNQUFJLFNBQVMsR0FBRyxDQUFDLEFBQUMsSUFBSSxJQUFJLENBQUMsR0FBSSxJQUFJLEdBQUcsRUFBRSxHQUFHLElBQUksR0FBRyxJQUFJLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFBLElBQUssU0FBUyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUEsQUFBQyxHQUFHLEtBQUssQ0FBQyxXQUFX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QUFDLENBQUMsSUFBSSxJQUFJLEVBQzFELENBQUMsQUFBQyxDQUFDLElBQUksQ0FBQyxHQUFJLElBQUksR0FBRyxLQUFLLENBQUEsSUFBSyxLQUFLLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxDQUFDLElBQUksSUFBSSxFQUMxRCxDQUFDLEFBQUMsQ0FBQyxJQUFJLENBQUMsR0FBSSxHQUFHLEdBQUcsS0FBSyxDQUFBLElBQUssS0FBSyxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FDdkQsQ0FBQztLQUNIO0dBQ0Y7QUFDRCxTQUFPLElBQUksT0FBTyxDQUFDLElBQUksSUFBSSxJQUFJLEVBQUUsR0FBRyxJQUFJLElBQUksRUFBRSxJQUFJLElBQUksSUFBSSxFQUFFLElBQUksSUFBSSxJQUFJLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDO0NBQ3hGOztBQUVELFNBQVMsRUFBRSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUU7QUFDdEMsU0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0NBQ3pDOztBQUVELFNBQVMsRUFBRSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFHLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFO0FBQzNDLFNBQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7Q0FDNUM7O0FBRUQsU0FBUyxFQUFFLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRTtBQUN0QyxTQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7Q0FDdEM7Ozs7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QUMsRUFBRSxJQUFJLENBQUM7QUFBQSxBQUNsRSxXQUFLLENBQUM7QUFBRSxlQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxBQUN0RSxXQUFLLENBQUM7QUFBRSxlQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsQUFDMUUsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxLQUMvRTs7QUFFRCxTQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsR0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ2xELFVBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzVCOztBQUVELGFBQVMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7R0FDN0MsTUFBTTtBQUNMLFFBQUksTUFBTSxHQUFHLFNBQVMsQ0FBQyxNQUFNO1FBQ3pCLENBQUMsQ0FBQzs7QUFFTixTQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUMzQixVQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUs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Q0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDdEcsY0FBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7QUFDM0MsY0FBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7QUFDN0MsVUFBSSxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUMzRixVQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQy9GLFNBQUcsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztBQUMzQixVQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDOztBQUVsQyxVQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztBQUN2QixhQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDOUI7OzsyQ0FHRDs7OztBQUVFLFVBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7O0FBRXJELFVBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7OztBQUFDLEFBR2hELFVBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxJQUFJ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TSxDQUFDO0FBQ2hDLE1BQUksR0FBRyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRXZDLEtBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQUFBQyxJQUFJLEdBQUksS0FBSyxDQUFDO0FBQzFCLEtBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQUFBQyxJQUFJLEdBQUksS0FBSyxDQUFDO0FBQzFCLEtBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFBLEdBQUksS0FBSyxDQUFDO0FBQzlCLEtBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFBLEdBQUksS0FBSyxDQUFDO0FBQzlCLEtBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFBLEdBQUksS0FBSyxDQUFDO0FBQzlCLEtBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQUFBQyxJQUFJLEdBQUksS0FBSyxDQUFDOztBQUUxQixLQUFHLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFbkMsS0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxBQUFDLElBQUksR0FBSSxLQUFLLENBQUM7QUFDMUIsS0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxBQUFDLElBQUksR0FBSSxLQUFLLENBQUM7QUFDMUIsS0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxBQUFDLElBQUksR0FBSSxLQUFLLENBQUM7QUFDMUIsS0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUEsR0FBSSxLQUFLLENBQUM7QUFDOUIsS0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENB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QUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztBQUMvRCxVQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7S0FDMUI7Ozs0QkFFTztBQUNOLFVBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQ3ZDLFVBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztLQUMxQjs7OzJCQUVNO0FBQ0wsVUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0tBQ3pCOzs7NkJBRVE7QUFDUCxVQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRSxPQUFPO0FBQ3RDLFVBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUNwQyxVQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO0FBQzVDLFVBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO0FBQ3JELFVBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDO0tBQzVCOzs7U0F6Q1UsU0FBUyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbnRyb2xsZXIge1xyXG4gIGNvbnN0cnVjdG9yKGRldnRvb2wpXHJcbiAge1xyXG4gICAgdGhpcy5kZXZ0b29sID0gZGV2dG9vbDtcclxuICAgIGxldCBnID0gZGV2dG9vbC5nYW1lO1xyXG4gICAgbGV0IGRlYnVnVWkgPSBkZXZ0b29sLmRlYnVnVWk7XHJcbiAgICAvLyDliLblvqHnlLvpnaIgXHJcbiAgICBsZXQgdG9nZ2xlID0gZGV2dG9vbC50b2dnbGVHYW1lKCk7XHJcbiAgICBcclxuICAgIGxldCBjb250cm9sbGVyRGF0YSA9IFxyXG4gICAgW1xyXG4gICAgICAvL+OAgOOCsuODvOODoOODl+ODrOOCpFxyXG4gICAgICB7XHJcbiAgICAgICAgbmFtZToncGxheScsXHJcbiAgICAgICAgZnVuYygpe1xyXG4gICAgICAgICAgdGhpcy5hdHRyKCdjbGFzcycsdG9nZ2xlLm5leHQoZmFsc2UpLnZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIF07XHJcbiAgICBcclxuICAgIGxldCBjb250cm9sbGVyID0gZGVidWdVaS5hcHBlbmQoJ2RpdicpLmF0dHIoJ2lkJywnY29udHJvbCcpLmNsYXNzZWQoJ2NvbnRyb2xsZXInLHRydWUpO1xyXG4gICAgbGV0IGJ1dHRvbnMgPSBjb250cm9sbGVyLnNlbGVjdEFsbCgnYnV0dG9uJykuZGF0YShjb250cm9sbGVyRGF0YSlcclxuICAgIC5lbnRlcigpLmFwcGVuZCgnYnV0dG9uJyk7XHJcbiAgICBidXR0b25zLmF0dHIoJ2NsYXNzJyxkPT5kLm5hbWUpO1xyXG4gICAgXHJcbiAgICBidXR0b25zLm9uKCdjbGljaycsZnVuY3Rpb24oZCl7XHJcbiAgICAgIGQuZnVuYy5hcHBseShkMy5zZWxlY3QodGhpcykpO1xyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIGNvbnRyb2xsZXIuYXBwZW5kKCdzcGFuJykudGV4dCgn44K544OG44O844K4Jykuc3R5bGUoeyd3aWR0aCc6JzEwMHB4JywnZGlzcGxheSc6J2lubGluZS1ibG9jaycsJ3RleHQtYWxpZ24nOidjZW50ZXInfSk7XHJcbiAgICBcclxuICAgIHZhciBzdGFnZSA9IGNvbnRyb2xsZXJcclxuICAgIC5hcHBlbmQoJ2lucHV0JylcclxuICAgIC5hdHRyKHsndHlwZSc6J3RleHQnLCd2YWx1ZSc6Zy5zdGFnZS5ub30pXHJcbiAgICAuc3R5bGUoeyd3aWR0aCc6JzQwcHgnLCd0ZXh0LWFsaWduJzoncmlnaHQnfSk7XHJcbiAgICBnLnN0YWdlLm9uKCd1cGRhdGUnLChkKT0+e1xyXG4gICAgICBzdGFnZS5ub2RlKCkudmFsdWUgPSBkLm5vO1xyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIHN0YWdlLm9uKCdjaGFuZ2UnLGZ1bmN0aW9uKCl7XHJcbiAgICAgIGxldCB2ID0gIHBhcnNlSW50KHRoaXMudmFsdWUpO1xyXG4gICAgICBpZihnLnN0YWdlLm5vICE9IHYpe1xyXG4gICAgICAgIGcuc3RhZ2UuanVtcCh2KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIFxyXG4gIH1cclxuICBcclxuICBhY3RpdmUoKXtcclxuICAgIFxyXG4gIH1cclxuICBcclxuICBoaWRlKCl7XHJcbiAgICBcclxuICB9XHJcbn1cclxuIiwiIFwidXNlIHN0cmljdFwiO1xyXG4vL3ZhciBTVEFHRV9NQVggPSAxO1xyXG5pbXBvcnQgKiBhcyBzZmcgZnJvbSAnLi4vLi4vanMvZ2xvYmFsJzsgXHJcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi4vLi4vanMvdXRpbCc7XHJcbmltcG9ydCAqIGFzIGF1ZGlvIGZyb20gJy4uLy4uL2pzL2F1ZGlvJztcclxuLy9pbXBvcnQgKiBhcyBzb25nIGZyb20gJy4vc29uZyc7XHJcbmltcG9ydCAqIGFzIGdyYXBoaWNzIGZyb20gJy4uLy4uL2pzL2dyYXBoaWNzJztcclxuaW1wb3J0ICogYXMgaW8gZnJvbSAnLi4vLi4vanMvaW8nO1xyXG5pbXBvcnQgKiBhcyBjb21tIGZyb20gJy4uLy4uL2pzL2NvbW0nO1xyXG5pbXBvcnQgKiBhcyB0ZXh0IGZyb20gJy4uLy4uL2pzL3RleHQnO1xyXG5pbXBvcnQgKiBhcyBnYW1lb2JqIGZyb20gJy4uLy4uL2pzL2dhbWVvYmonO1xyXG5pbXBvcnQgKiBhcyBteXNoaXAgZnJvbSAnLi4vLi4vanMvbXlzaGlwJztcclxuaW1wb3J0ICogYXMgZW5lbWllcyBmcm9tICcuLi8uLi9qcy9lbmVtaWVzJztcclxuaW1wb3J0ICogYXMgZWZmZWN0b2JqIGZyb20gJy4uLy4uL2pzL2VmZmVjdG9iaic7XHJcbmltcG9ydCB7IERldlRvb2wgfSBmcm9tICcuL2RldnRvb2wnO1xyXG5pbXBvcnQgeyBHYW1lIH0gZnJvbSAnLi4vLi4vanMvZ2FtZSc7XHJcblxyXG4vLy8g44Oh44Kk44OzXHJcbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgc2ZnLmdhbWUgPSBuZXcgR2FtZSgpO1xyXG4gIHNmZy5kZXZUb29sID0gbmV3IERldlRvb2woc2ZnLmdhbWUpOyAgXHJcbiAgc2ZnLmdhbWUuZXhlYygpO1xyXG59O1xyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmltcG9ydCAqIGFzIHNmZyBmcm9tICcuLi8uLi9qcy9nbG9iYWwnO1xyXG5pbXBvcnQgKiBhcyBhdWRpbyBmcm9tICcuLi8uLi9qcy9hdWRpbyc7XHJcbmltcG9ydCBDb250cm9sbGVyIGZyb20gJy4vY29udHJvbGxlcic7XHJcbmltcG9ydCBFbmVteUVkaXRvciBmcm9tICcuL2VuZW15RWRpdG9yJztcclxuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBEZXZUb29sIHtcclxuICBjb25zdHJ1Y3RvcihnYW1lKSB7XHJcbiAgICB0aGlzLmdhbWUgPSBnYW1lO1xyXG4vLyAgICB0aGlzLnN0YXR1cyA9IERldlRvb2wuU1RBVFVTLlNUT1A7XHJcbiAgICB0aGlzLmtleWRvd24gPSB0aGlzLmtleWRvd25fKCk7XHJcbiAgICB0aGlzLmtleWRvd24ubmV4dCgpO1xyXG4gICAgZDMuc2VsZWN0KCdib2R5Jykub24oJ2tleWRvd24uRGV2VG9vbCcsICgpID0+IHtcclxuICAgICAgdmFyIGUgPSBkMy5ldmVudDtcclxuICAgICAgaWYodGhpcy5rZXlkb3duLm5leHQoZSkudmFsdWUpe1xyXG4gICAgICAgIGQzLmV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgZDMuZXZlbnQuY2FuY2VsQnViYmxlID0gdHJ1ZTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH07XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgdmFyIHRoaXNfID0gdGhpcztcclxuICAgIHZhciBpbml0Q29uc29sZSA9IGdhbWUuaW5pdENvbnNvbGU7XHJcbiAgICBnYW1lLmluaXRDb25zb2xlID0gKGZ1bmN0aW9uKClcclxuICAgIHtcclxuICAgICAgaW5pdENvbnNvbGUuYXBwbHkoZ2FtZSxbJ2NvbnNvbGUtZGVidWcnXSk7XHJcbiAgICAgIHRoaXNfLmluaXRDb25zb2xlKCk7XHJcbiAgICAgIGQzLnNlbGVjdCgnI2NvbnNvbGUnKS5hdHRyKCd0YWJJbmRleCcsMSk7XHJcbiAgICB9KS5iaW5kKGdhbWUpO1xyXG4gICAgXHJcbiAgICBnYW1lLmJhc2ljSW5wdXQuYmluZCA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgIGQzLnNlbGVjdCgnI2NvbnNvbGUnKS5vbigna2V5ZG93bi5iYXNpY0lucHV0JyxnYW1lLmJhc2ljSW5wdXQua2V5ZG93bi5iaW5kKGdhbWUuYmFzaWNJbnB1dCkpO1xyXG4gICAgICBkMy5zZWxlY3QoJyNjb25zb2xlJykub24oJ2tleXVwLmJhc2ljSW5wdXQnLGdhbWUuYmFzaWNJbnB1dC5rZXl1cC5iaW5kKGdhbWUuYmFzaWNJbnB1dCkpO1xyXG4gICAgfTtcclxuICAgIFxyXG4gICAgZ2FtZS5iYXNpY0lucHV0LnVuYmluZCA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgIGQzLnNlbGVjdCgnI2NvbnNvbGUnKS5vbigna2V5ZG93bi5iYXNpY0lucHV0JyxudWxsKTtcclxuICAgICAgZDMuc2VsZWN0KCcjY29uc29sZScpLm9uKCdrZXl1cC5iYXNpY0lucHV0JyxudWxsKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZ2FtZS5nYW1lSW5pdCA9IGZ1bmN0aW9uKiAodGFza0luZGV4KSB7XHJcbiAgICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG5cclxuICAgICAgLy8g44Kq44O844OH44Kj44Kq44Gu6ZaL5aeLXHJcbiAgICAgIHRoaXMuYXVkaW9fLnN0YXJ0KCk7XHJcbiAgICAgIHRoaXMuc2VxdWVuY2VyLmxvYWQoYXVkaW8uc2VxRGF0YSk7XHJcbiAgICAgIHRoaXMuc2VxdWVuY2VyLnN0YXJ0KCk7XHJcbiAgICAgIC8vc2ZnLnN0YWdlLnJlc2V0KCk7XHJcbiAgICAgIHRoaXMudGV4dFBsYW5lLmNscygpO1xyXG4gICAgICB0aGlzLmVuZW1pZXMucmVzZXQoKTtcclxuXHJcbiAgICAgIC8vIOiHquapn+OBruWIneacn+WMllxyXG4gICAgICB0aGlzLm15c2hpcF8uaW5pdCgpO1xyXG4gICAgICBzZmcuZ2FtZVRpbWVyLnN0YXJ0KCk7XHJcbiAgICAgIHRoaXMuc2NvcmUgPSAwO1xyXG4gICAgICB0aGlzLnRleHRQbGFuZS5wcmludCgyLCAwLCAnU2NvcmUgICAgSGlnaCBTY29yZScpO1xyXG4gICAgICB0aGlzLnRleHRQbGFuZS5wcmludCgyMCwgMzksICdSZXN0OiAgICcgKyBzZmcubXlzaGlwXy5yZXN0KTtcclxuICAgICAgdGhpcy5wcmludFNjb3JlKCk7XHJcbiAgICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLnN0YWdlSW5pdC5iaW5kKHRoaXMpLypnYW1lQWN0aW9uKi8pO1xyXG4gICBcclxuICAgIH07XHJcbiAgICBcclxuICAgIGdhbWUuaW5pdCA9IChmdW5jdGlvbioodGFza0luZGV4KXtcclxuICAgICAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgICAgIHRoaXMuaW5pdENvbW1BbmRIaWdoU2NvcmUoKTtcclxuICAgICAgdGhpcy5pbml0QWN0b3JzKCk7XHJcbiAgICAgIC8vZnMud3JpdGVGaWxlU3luYygnZW5lbXlGb3JtYXRpb25QYXR0ZXJuLmpzb24nLEpTT04uc3RyaW5naWZ5KHRoaXMuZW5lbWllcy5tb3ZlU2VxcyxudWxsLCcnKSwndXRmOCcpO1xyXG4gICAgfSkuYmluZChnYW1lKTsgICAgICBcclxuXHJcblxyXG4gIH1cclxuXHJcbiAgKmtleWRvd25fKCkge1xyXG4gICAgdmFyIGUgPSB5aWVsZDtcclxuICAgIHdoaWxlICh0cnVlKSB7XHJcbiAgICAgIHZhciBwcm9jZXNzID0gZmFsc2U7XHJcbiAgICAgIGlmIChlLmtleUNvZGUgPT0gMTkyKSB7IC8vIEAgS2V5XHJcbiAgICAgICAgc2ZnLkNIRUNLX0NPTExJU0lPTiA9ICFzZmcuQ0hFQ0tfQ09MTElTSU9OO1xyXG4gICAgICAgIHByb2Nlc3MgPSB0cnVlO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgLy8gaWYgKGUua2V5Q29kZSA9PSA4MCAvKiBQICovKSB7XHJcbiAgICAgIC8vICAgaWYgKCFzZmcucGF1c2UpIHtcclxuICAgICAgLy8gICAgIHRoaXMuZ2FtZS5wYXVzZSgpO1xyXG4gICAgICAvLyAgIH0gZWxzZSB7XHJcbiAgICAgIC8vICAgICB0aGlzLmdhbWUucmVzdW1lKCk7XHJcbiAgICAgIC8vICAgfVxyXG4gICAgICAvLyAgIHByb2Nlc3MgPSB0cnVlO1xyXG4gICAgICAvLyB9XHJcblxyXG4gICAgICBpZiAoZS5rZXlDb2RlID09IDg4IC8qIFggKi8gJiYgc2ZnLkRFQlVHKSB7XHJcbiAgICAgICAgaWYgKCFzZmcucGF1c2UpIHtcclxuICAgICAgICAgIHRoaXMuZ2FtZS5wYXVzZSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmdhbWUucmVzdW1lKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByb2Nlc3MgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGUgPSB5aWVsZCBwcm9jZXNzO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gXHJcbiAgaW5pdENvbnNvbGUoKXtcclxuICAgIC8vIFN0YXRzIOOCquODluOCuOOCp+OCr+ODiChGUFPooajnpLop44Gu5L2c5oiQ6KGo56S6XHJcbiAgICBsZXQgZyA9IHRoaXMuZ2FtZTtcclxuICAgIGxldCB0aGlzXyA9IHRoaXM7XHJcbiAgICBnLnN0YXRzID0gbmV3IFN0YXRzKCk7XHJcbiAgICBnLnN0YXRzLmRvbUVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xyXG4gICAgZy5zdGF0cy5kb21FbGVtZW50LnN0eWxlLnRvcCA9ICcwcHgnO1xyXG4gICAgZy5zdGF0cy5kb21FbGVtZW50LnN0eWxlLmxlZnQgPSAnMHB4JztcclxuICAgIGcuc3RhdHMuZG9tRWxlbWVudC5zdHlsZS5sZWZ0ID0gcGFyc2VGbG9hdChnLnJlbmRlcmVyLmRvbUVsZW1lbnQuc3R5bGUubGVmdCkgLSBwYXJzZUZsb2F0KGcuc3RhdHMuZG9tRWxlbWVudC5zdHlsZS53aWR0aCkgKyAncHgnO1xyXG5cclxuICAgIGxldCBkZWJ1Z1VpID0gdGhpcy5kZWJ1Z1VpID0gZDMuc2VsZWN0KCcjY29udGVudCcpXHJcbiAgICAuYXBwZW5kKCdkaXYnKS5hdHRyKCdjbGFzcycsJ2RldnRvb2wnKVxyXG4gICAgLnN0eWxlKCdoZWlnaHQnLGcuQ09OU09MRV9IRUlHSFQgKyAncHgnKTtcclxuICAgIGRlYnVnVWkubm9kZSgpLmFwcGVuZENoaWxkKGcuc3RhdHMuZG9tRWxlbWVudCk7XHJcbiAgICBcclxuICAgIC8vIOOCv+ODluioreWumlxyXG4gICAgbGV0IG1lbnUgPSBkZWJ1Z1VpLmFwcGVuZCgndWwnKS5jbGFzc2VkKCdtZW51Jyx0cnVlKTtcclxuICAgIG1lbnUuc2VsZWN0QWxsKCdsaScpLmRhdGEoXHJcbiAgICAgIFt7bmFtZTon5Yi25b6hJyxpZDonI2NvbnRyb2wnLGVkaXRvcjpDb250cm9sbGVyfSx7bmFtZTon5pW1JyxpZDonI2VuZW15JyxlZGl0b3I6RW5lbXlFZGl0b3J9Lyose25hbWU6J+mfs+a6kCcsaWQ6JyNhdWRpbyd9LHtuYW1lOifnlLvlg48nLGlkOicjZ3JhcGhpY3MnfSovXVxyXG4gICAgKVxyXG4gICAgLmVudGVyKCkuYXBwZW5kKCdsaScpXHJcbiAgICAudGV4dCgoZCk9PmQubmFtZSlcclxuICAgIC5vbignY2xpY2snLGZ1bmN0aW9uKGQsaSl7XHJcbiAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgbWVudS5zZWxlY3RBbGwoJ2xpJykuZWFjaChmdW5jdGlvbihkLGlkeCl7XHJcbiAgICAgICAgIGlmKHNlbGYgPT0gdGhpcyl7XHJcbiAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmNsYXNzZWQoJ2FjdGl2ZScsdHJ1ZSk7XHJcbiAgICAgICAgICAgZDMuc2VsZWN0KGQuaWQpLnN0eWxlKCdkaXNwbGF5JywnYmxvY2snKTtcclxuICAgICAgICAgICBkLmluc3QuYWN0aXZlKCk7XHJcbiAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgaWYoZDMuc2VsZWN0KHRoaXMpLmNsYXNzZWQoJ2FjdGl2ZScpKXtcclxuICAgICAgICAgICAgICBkMy5zZWxlY3QodGhpcykuY2xhc3NlZCgnYWN0aXZlJyxmYWxzZSk7XHJcbiAgICAgICAgICAgICAgZDMuc2VsZWN0KGQuaWQpLnN0eWxlKCdkaXNwbGF5Jywnbm9uZScpO1xyXG4gICAgICAgICAgICAgIGQuaW5zdC5oaWRlKCk7XHJcbiAgICAgICAgICAgfVxyXG4gICAgICAgICB9ICAgICAgIFxyXG4gICAgICB9KTtcclxuICAgIH0pLmVhY2goZnVuY3Rpb24oZCxpKXtcclxuICAgICAgZC5pbnN0ID0gbmV3IGQuZWRpdG9yKHRoaXNfKTtcclxuICAgICAgaWYoIWkpe1xyXG4gICAgICAgIGQzLnNlbGVjdCh0aGlzKS5jbGFzc2VkKCdhY3RpdmUnLHRydWUpO1xyXG4gICAgICAgIGQzLnNlbGVjdChkLmlkKS5zdHlsZSgnZGlzcGxheScsJ2Jsb2NrJyk7XHJcbiAgICAgICAgZC5pbnN0LmFjdGl2ZSgpO1xyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gICAgO1xyXG4gICAgXHJcblxyXG4gIH1cclxuICBcclxuICBcclxuICAqdG9nZ2xlR2FtZSgpIHtcclxuICAgIC8vIOmWi+Wni+WHpueQhlxyXG4gICAgbGV0IGNhbmNlbCA9IGZhbHNlO1xyXG4gICAgd2hpbGUgKCFjYW5jZWwpIHtcclxuICAgICAgbGV0IGcgPSB0aGlzLmdhbWU7XHJcbiAgICAgIGcudGFza3MucHVzaFRhc2soZy5iYXNpY0lucHV0LnVwZGF0ZS5iaW5kKGcuYmFzaWNJbnB1dCkpO1xyXG4gICAgICBnLmJhc2ljSW5wdXQuYmluZCgpO1xyXG4gICAgICBnLnRhc2tzLnB1c2hUYXNrKGcucmVuZGVyLmJpbmQoZyksIGcuUkVOREVSRVJfUFJJT1JJVFkpO1xyXG4gICAgICBnLnRhc2tzLnB1c2hUYXNrKGcuZ2FtZUluaXQuYmluZChnKSk7XHJcblxyXG4gICAgICBpZiAoZy5zcGFjZUZpZWxkKSB7XHJcbiAgICAgICAgZy50YXNrcy5wdXNoVGFzayhnLm1vdmVTcGFjZUZpZWxkLmJpbmQoZykpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGcuc2hvd1NwYWNlRmllbGQoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFnLnRhc2tzLmVuYWJsZSkge1xyXG4gICAgICAgIGcudGFza3MuZW5hYmxlID0gdHJ1ZTtcclxuICAgICAgICBnLm1haW4oKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY2FuY2VsID0geWllbGQgJ3N0b3AnO1xyXG4gICAgICBpZiAoY2FuY2VsKSBicmVhaztcclxuICAgICAgXHJcbiAgICAgIC8vIOWBnOatouWHpueQhlxyXG4gICAgXHJcbiAgICAgIC8vIOeUu+mdoua2iOWOu1xyXG4gICAgICBpZiAoZy50YXNrcy5lbmFibGUpe1xyXG4gICAgICAgIGcudGFza3Muc3RvcFByb2Nlc3MoKVxyXG4gICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICBnLmVuZW1pZXMucmVzZXQoKTtcclxuICAgICAgICAgICAgZy5lbmVteUJ1bGxldHMucmVzZXQoKTtcclxuICAgICAgICAgICAgZy5ib21icy5yZXNldCgpO1xyXG4gICAgICAgICAgICBnLm15c2hpcF8ucmVzZXQoKTtcclxuICAgICAgICAgICAgZy50YXNrcy5jbGVhcigpO1xyXG4gICAgICAgICAgICBnLnRleHRQbGFuZS5jbHMoKTtcclxuICAgICAgICAgICAgZy5yZW5kZXJlci5jbGVhcigpO1xyXG4gICAgICAgICAgICBnLnNlcXVlbmNlci5zdG9wKCk7XHJcbiAgICAgICAgICAgIGcuYmFzaWNJbnB1dC51bmJpbmQoKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICAgIGNhbmNlbCA9IHlpZWxkICdwbGF5JztcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XHJcbmltcG9ydCAqIGFzIEVuZW1pZXMgZnJvbSAnLi4vLi4vanMvZW5lbWllcyc7XHJcbmltcG9ydCB7IFVuZG9NYW5hZ2VyIH0gZnJvbSAnLi91bmRvJzsgXHJcbmltcG9ydCB7IEVuZW15Rm9ybWF0aW9uRWRpdG9yIH0gZnJvbSAnLi9lbmVteUZvcm1hdGlvbkVkaXRvcic7XHJcbmltcG9ydCB7IEVuZW15TW92U2VxRWRpdG9yIH0gZnJvbSAnLi9lbmVteU1vdlNlcUVkaXRvcic7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFbmVteUVkaXRvciB7XHJcbiAgY29uc3RydWN0b3IoZGV2VG9vbClcclxuICB7XHJcbiAgICB0aGlzLmRldlRvb2wgPSBkZXZUb29sO1xyXG4gICAgLy8g5pW1XHJcbiAgICBsZXQgZyA9IGRldlRvb2wuZ2FtZTtcclxuICB9XHJcbiAgXHJcbiAgYWN0aXZlKCl7XHJcbiAgICBpZighdGhpcy5pbml0aWFsaXplZCl7XHJcbiAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBpbml0KCl7XHJcbiAgICBsZXQgdGhpc18gPSB0aGlzO1xyXG4gICAgbGV0IGcgPSB0aGlzLmRldlRvb2wuZ2FtZTtcclxuXHJcbiAgICBsZXQgcCA9IFByb21pc2UucmVzb2x2ZSgpO1xyXG5cclxuICAgIGlmKCFnLmVuZW1pZXMpXHJcbiAgICB7XHJcbiAgICAgIHAgPSBnLmluaXRBY3RvcnMoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcC50aGVuKCgpPT57XHJcbiAgICAgIGxldCB1aSA9IHRoaXMudWkgPSB0aGlzLmRldlRvb2wuZGVidWdVaS5hcHBlbmQoJ2RpdicpXHJcbiAgICAgIC5hdHRyKCdpZCcsJ2VuZW15JylcclxuICAgICAgLmNsYXNzZWQoJ2NvbnRyb2xsZXInLHRydWUpXHJcbiAgICAgIC5zdHlsZSgnZGlzcGxheScsJ2FjdGl2ZScpO1xyXG4gICAgICBcclxuICAgICAgdGhpcy5mb3JtTm8gPSAwO1xyXG5cclxuICAgICAgbGV0IGNvbnRyb2xsZXJEYXRhID0gXHJcbiAgICAgIFtcclxuICAgICAgICAvL+OAgOOCsuODvOODoOODl+ODrOOCpFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIG5hbWU6J3BsYXknLFxyXG4gICAgICAgICAgZnVuYygpe1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgXTtcclxuICAgICAgXHJcbiAgICAgIGxldCBidXR0b25zID0gdWkuc2VsZWN0QWxsKCdidXR0b24nKS5kYXRhKGNvbnRyb2xsZXJEYXRhKVxyXG4gICAgICAuZW50ZXIoKS5hcHBlbmQoJ2J1dHRvbicpO1xyXG4gICAgICBidXR0b25zLmF0dHIoJ2NsYXNzJyxkPT5kLm5hbWUpO1xyXG4gICAgICBcclxuICAgICAgYnV0dG9ucy5vbignY2xpY2snLGZ1bmN0aW9uKGQpe1xyXG4gICAgICAgIGQuZnVuYy5hcHBseShkMy5zZWxlY3QodGhpcykpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHVpLmFwcGVuZCgnc3BhbicpLnRleHQoJ+OCueODhuODvOOCuCcpLnN0eWxlKHsnd2lkdGgnOicxMDBweCcsJ2Rpc3BsYXknOidpbmxpbmUtYmxvY2snLCd0ZXh0LWFsaWduJzonY2VudGVyJ30pO1xyXG4gIFxyXG4gICAgICB2YXIgc3RhZ2UgPSB1aVxyXG4gICAgICAuYXBwZW5kKCdpbnB1dCcpXHJcbiAgICAgIC5hdHRyKHsndHlwZSc6J3RleHQnLCd2YWx1ZSc6Zy5zdGFnZS5ub30pXHJcbiAgICAgIC5zdHlsZSh7J3dpZHRoJzonNDBweCcsJ3RleHQtYWxpZ24nOidyaWdodCd9KTtcclxuICAgICAgZy5zdGFnZS5vbigndXBkYXRlJywoZCk9PntcclxuICAgICAgICBzdGFnZS5ub2RlKCkudmFsdWUgPSBkLm5vO1xyXG4gICAgICB9KTtcclxuICAgICAgXHJcbiAgICAgIHN0YWdlLm9uKCdjaGFuZ2UnLGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgbGV0IHYgPSAgcGFyc2VJbnQodGhpcy52YWx1ZSk7XHJcbiAgICAgICAgdiA9IGlzTmFOKHYpPzA6djtcclxuICAgICAgICBpZihnLnN0YWdlLm5vICE9IHYpe1xyXG4gICAgICAgICAgZy5zdGFnZS5qdW1wKHYpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIFxyXG4gICAgICAvLyDnt6jpmorjg57jg4Pjg5fjgqjjg4fjgqPjgr9cclxuICAgICAgXHJcbi8vICAgICAgIGxldCBmb3JtaGVhZCA9IHVpLmFwcGVuZCgnZGl2Jyk7XHJcbi8vICAgICAgIGZvcm1oZWFkLmFwcGVuZCgnc3BhbicpLnRleHQoJ+e3qOmaik5vJyk7XHJcbi8vIFxyXG4vLyAgICAgICBmb3JtaGVhZC5hcHBlbmQoJ2lucHV0JylcclxuLy8gICAgICAgLmF0dHIoeyd0eXBlJzondGV4dCcsJ3ZhbHVlJzp0aGlzLmZvcm1Ob30pXHJcbi8vICAgICAgIC5zdHlsZSh7J3dpZHRoJzonNDBweCcsJ3RleHQtYWxpZ24nOidyaWdodCd9KVxyXG4vLyAgICAgICAub24oJ2NoYW5nZScsZnVuY3Rpb24oKXtcclxuLy8gICAgICAgICBsZXQgdiA9ICBwYXJzZUludCh0aGlzLnZhbHVlKTtcclxuLy8gICAgICAgICB0aGlzXy5mb3JtTm8gPSBpc05hTih2KT8wOnY7XHJcbi8vICAgICAgIH0pO1xyXG4vLyAgICAgICBcclxuLy8gICAgICAgdWkuYXBwZW5kKCd0ZXh0YXJlYScpLmNsYXNzZWQoJ2Zvcm1kYXRhJyx0cnVlKS5hdHRyKCdyb3dzJywxMClcclxuLy8gICAgICAgLm5vZGUoKS52YWx1ZSA9IEpTT04uc3RyaW5naWZ5KGcuZW5lbWllcy5tb3ZlU2Vxc1t0aGlzLmZvcm1Ob10pO1xyXG4gICAgICBcclxuICAgICAgdGhpcy5mb3JtYXRpb25FZGl0b3IgPSBuZXcgRW5lbXlGb3JtYXRpb25FZGl0b3IodGhpc18sdGhpc18uZm9ybU5vKTtcclxuICAgICAgdGhpcy5tb3ZTZXFFZGl0b3IgPSBuZXcgRW5lbXlNb3ZTZXFFZGl0b3IodGhpcywwKTtcclxuICAgICAgXHJcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlOyAgICAgICAgXHJcbiAgICB9KTtcclxuXHJcbiAgICBcclxuICAgIFxyXG5cclxuICB9XHJcbiAgXHJcbiAgaGlkZSgpe1xyXG4gICAgXHJcbiAgfVxyXG59IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmltcG9ydCAqIGFzIEVuZW1pZXMgZnJvbSAnLi4vLi4vanMvZW5lbWllcyc7XHJcbmltcG9ydCB7IFVuZG9NYW5hZ2VyIH0gZnJvbSAnLi91bmRvJzsgXHJcblxyXG5jbGFzcyBJbnB1dENvbW1hbmR7XHJcbiAgY29uc3RydWN0b3IoaWQsbmFtZSxkZXNjKVxyXG4gIHtcclxuICAgIHRoaXMuaWQgPSBpZDtcclxuICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICB0aGlzLmRlc2MgPSBkZXNjO1xyXG4gIH1cclxuICB0b0pTT04oKXtcclxuICAgIHJldHVybiB0aGlzLm5hbWU7XHJcbiAgfVxyXG59O1xyXG5cclxuY29uc3QgSW5wdXRDb21tYW5kcyA9XHJcbntcclxuICBlbnRlcjogbmV3IElucHV0Q29tbWFuZCgxLCdlbnRlcicsJ+aMv+WFpScpLFxyXG4gIGVzYzogbmV3IElucHV0Q29tbWFuZCgyLCdlc2MnLCfjgq3jg6Pjg7Pjgrvjg6snKSxcclxuICByaWdodDogbmV3IElucHV0Q29tbWFuZCgzLCdyaWdodCcsJ+OCq+ODvOOCveODq+enu+WLle+8iOWPs++8iScpLFxyXG4gIGxlZnQ6IG5ldyBJbnB1dENvbW1hbmQoNCwnbGVmdCcsJ+OCq+ODvOOCveODq+enu+WLle+8iOW3pu+8iScpLFxyXG4gIHVwOiBuZXcgSW5wdXRDb21tYW5kKDUsJ3VwJywn44Kr44O844K944Or56e75YuV77yI5LiK77yJJyksXHJcbiAgZG93bjogbmV3IElucHV0Q29tbWFuZCg2LCdkb3duJywn44Kr44O844K944Or56e75YuV77yI5LiL77yJJyksXHJcbiAgdW5kbzogbmV3IElucHV0Q29tbWFuZCg4LCd1bmRvJywn44Ki44Oz44OJ44KlJyksXHJcbiAgcmVkbzogbmV3IElucHV0Q29tbWFuZCg5LCdyZWRvJywn44Oq44OJ44KlJyksXHJcbiAgcGFnZVVwOiBuZXcgSW5wdXRDb21tYW5kKDEwLCdwYWdlVXAnLCfjg5rjg7zjgrjjgqLjg4Pjg5cnKSxcclxuICBwYWdlRG93bjogbmV3IElucHV0Q29tbWFuZCgxMSwncGFnZURvd24nLCfjg5rjg7zjgrjjg4Djgqbjg7MnKSxcclxuICBob21lOiBuZXcgSW5wdXRDb21tYW5kKDEyLCdob21lJywn5YWI6aCt6KGM44Gr56e75YuVJyksXHJcbiAgZW5kOiBuZXcgSW5wdXRDb21tYW5kKDEzLCdlbmQnLCfntYLnq6/ooYzjgavnp7vli5UnKSxcclxuICBzY3JvbGxVcDogbmV3IElucHV0Q29tbWFuZCgxNiwnc2Nyb2xsVXAnLCfpq5jpgJ/jgrnjgq/jg63jg7zjg6vjgqLjg4Pjg5cnKSxcclxuICBzY3JvbGxEb3duOiBuZXcgSW5wdXRDb21tYW5kKDE3LCdzY3JvbGxEb3duJywn6auY6YCf44K544Kv44Ot44O844Or44OA44Km44OzJyksXHJcbiAgZGVsZXRlOiBuZXcgSW5wdXRDb21tYW5kKDE4LCdkZWxldGUnLCfooYzliYrpmaQnKSxcclxuICBsaW5lUGFzdGU6IG5ldyBJbnB1dENvbW1hbmQoMTksJ2xpbmVQYXN0ZScsJ+ihjOODmuODvOOCueODiCcpLFxyXG4gIHNlbGVjdDpuZXcgSW5wdXRDb21tYW5kKDIyLCdzZWxlY3QnLCfpgbjmip7jga7plovlp4vjg7vntYLkuoYnKSxcclxuICBjdXRFdmVudDpuZXcgSW5wdXRDb21tYW5kKDIzLCdjdXRFdmVudCcsJ+OCpOODmeODs+ODiOOCq+ODg+ODiCcpLFxyXG4gIGNvcHlFdmVudDpuZXcgSW5wdXRDb21tYW5kKDI0LCdjb3B5RXZlbnQnLCfjgqTjg5njg7Pjg4jjgrPjg5Tjg7wnKSxcclxuICBwYXN0ZUV2ZW50Om5ldyBJbnB1dENvbW1hbmQoMjUsJ3Bhc3RlRXZlbnQnLCfjgqTjg5njg7Pjg4jjg5rjg7zjgrnjg4gnKVxyXG59O1xyXG5cclxuLy9cclxuY29uc3Qga2V5QmluZHMgPVxyXG4gIHtcclxuICAgIDEzOiBbe1xyXG4gICAgICBrZXlDb2RlOiAxMyxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kcy5lbnRlclxyXG4gICAgfV0sXHJcbiAgICAyNzogW3tcclxuICAgICAga2V5Q29kZTogMjcsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZHMuZXNjXHJcbiAgICB9XSxcclxuICAgIDMyOiBbe1xyXG4gICAgICBrZXlDb2RlOiAzMixcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kcy5yaWdodFxyXG4gICAgfV0sXHJcbiAgICAzOTogW3tcclxuICAgICAga2V5Q29kZTogMzksXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZHMucmlnaHRcclxuICAgIH1dLFxyXG4gICAgMzc6IFt7XHJcbiAgICAgIGtleUNvZGU6IDM3LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLmxlZnRcclxuICAgIH1dLFxyXG4gICAgMzg6IFt7XHJcbiAgICAgIGtleUNvZGU6IDM4LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLnVwXHJcbiAgICB9XSxcclxuICAgIDQwOiBbe1xyXG4gICAgICBrZXlDb2RlOiA0MCxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kcy5kb3duXHJcbiAgICB9XSxcclxuICAgIDEwNjogW3tcclxuICAgICAga2V5Q29kZTogMTA2LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLmluc2VydE1lYXN1cmVcclxuICAgIH1dLFxyXG4gICAgOTA6IFt7XHJcbiAgICAgIGtleUNvZGU6IDkwLFxyXG4gICAgICBjdHJsS2V5OiB0cnVlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZHMudW5kb1xyXG4gICAgfV0sXHJcbiAgICAzMzogW3tcclxuICAgICAga2V5Q29kZTogMzMsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZHMucGFnZVVwXHJcbiAgICAgIH0se1xyXG4gICAgICAgIGtleUNvZGU6IDMzLFxyXG4gICAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICAgIHNoaWZ0S2V5OiB0cnVlLFxyXG4gICAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLnNjcm9sbFVwXHJcbiAgICAgIH0se1xyXG4gICAgICBrZXlDb2RlOiAzMyxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiB0cnVlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLm1lYXN1cmVCZWZvcmVcclxuICAgICAgfSAgICAgIF0sXHJcbiAgICAvLyA4MjogW3tcclxuICAgIC8vICAga2V5Q29kZTogODIsXHJcbiAgICAvLyAgIGN0cmxLZXk6IHRydWUsXHJcbiAgICAvLyAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgIC8vICAgYWx0S2V5OiBmYWxzZSxcclxuICAgIC8vICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAvLyAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kcy5wYWdlVXBcclxuICAgIC8vIH1dLFxyXG4gICAgMzQ6IFt7IC8vIFBhZ2UgRG93biBcclxuICAgICAga2V5Q29kZTogMzQsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZHMucGFnZURvd25cclxuICAgIH0sIHtcclxuICAgICAgICBrZXlDb2RlOiAzNCxcclxuICAgICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgICBzaGlmdEtleTogdHJ1ZSxcclxuICAgICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kcy5zY3JvbGxEb3duXHJcbiAgICAgIH1dLFxyXG4gICAgMzY6IFt7XHJcbiAgICAgIGtleUNvZGU6IDM2LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLmhvbWVcclxuICAgIH1dLFxyXG4gICAgMzU6IFt7XHJcbiAgICAgIGtleUNvZGU6IDM1LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLmVuZFxyXG4gICAgfV0sXHJcbiAgICA4OTogW3tcclxuICAgICAga2V5Q29kZTogODksXHJcbiAgICAgIGN0cmxLZXk6IHRydWUsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kcy5kZWxldGVcclxuICAgIH1dLFxyXG4gICAgNzY6IFt7XHJcbiAgICAgIGtleUNvZGU6IDc2LFxyXG4gICAgICBjdHJsS2V5OiB0cnVlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZHMubGluZVBhc3RlXHJcbiAgICB9XSxcclxuICAgIDExNzpbLy8gRjZcclxuICAgICAge1xyXG4gICAgICBrZXlDb2RlOiAxMTcsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZHMuc2VsZWN0XHJcbiAgICAgIH1cclxuICAgIF0sXHJcbiAgICAxMTg6Wy8vIEY3XHJcbiAgICAgIHtcclxuICAgICAga2V5Q29kZTogMTE4LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLmN1dEV2ZW50XHJcbiAgICAgIH1cclxuICAgIF0sXHJcbiAgICAxMTk6Wy8vIEY4XHJcbiAgICAgIHtcclxuICAgICAga2V5Q29kZTogMTE5LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLmNvcHlFdmVudFxyXG4gICAgICB9XHJcbiAgICBdLFxyXG4gICAgMTIwOlsvLyBGOVxyXG4gICAgICB7XHJcbiAgICAgIGtleUNvZGU6IDEyMCxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kcy5wYXN0ZUV2ZW50XHJcbiAgICAgIH1cclxuICAgIF1cclxuICB9O1xyXG5cclxuZXhwb3J0IGNsYXNzIEVuZW15Rm9ybWF0aW9uRWRpdG9yIHtcclxuICBjb25zdHJ1Y3RvcihlbmVteUVkaXRvcixmb3JtYXRpb25Obykge1xyXG4gICAgbGV0IHRoaXNfID0gdGhpcztcclxuICAgIHRoaXMudW5kb01hbmFnZXIgPSBuZXcgVW5kb01hbmFnZXIoKTtcclxuICAgIHRoaXMuZW5lbXlFZGl0b3IgPSBlbmVteUVkaXRvcjtcclxuICAgIHRoaXMubGluZUJ1ZmZlciA9IG51bGw7XHJcbiAgICBsZXQgZGVidWdVaSA9IGVuZW15RWRpdG9yLmRldlRvb2wuZGVidWdVaTtcclxuICAgIHZhciBlZGl0b3IgPSBlbmVteUVkaXRvci51aS5hcHBlbmQoJ2RpdicpLmNsYXNzZWQoJ2Zvcm1hdGlvbi1lZGl0b3InLCB0cnVlKTtcclxuICAgIGxldCBldmVudEVkaXQgPSBlZGl0b3IuYXBwZW5kKCd0YWJsZScpLmF0dHIoJ3RhYmluZGV4JywwKTtcclxuICAgIGxldCBoZWFkcm93ID0gZXZlbnRFZGl0LmFwcGVuZCgndGhlYWQnKS5hcHBlbmQoJ3RyJyk7XHJcbiAgICBoZWFkcm93LmFwcGVuZCgndGgnKS50ZXh0KCdzdGVwJyk7XHJcbiAgICBoZWFkcm93LmFwcGVuZCgndGgnKS50ZXh0KCdTWCcpO1xyXG4gICAgaGVhZHJvdy5hcHBlbmQoJ3RoJykudGV4dCgnU1knKTtcclxuICAgIGhlYWRyb3cuYXBwZW5kKCd0aCcpLnRleHQoJ0hYJyk7XHJcbiAgICBoZWFkcm93LmFwcGVuZCgndGgnKS50ZXh0KCdIWScpO1xyXG4gICAgaGVhZHJvdy5hcHBlbmQoJ3RoJykudGV4dCgnUFQnKTtcclxuICAgIGhlYWRyb3cuYXBwZW5kKCd0aCcpLnRleHQoJ0tJTkQnKTtcclxuICAgIGhlYWRyb3cuYXBwZW5kKCd0aCcpLnRleHQoJ1JFVicpO1xyXG4gICAgaGVhZHJvdy5hcHBlbmQoJ3RoJykudGV4dCgnR1JQJyk7XHJcbiAgICBcclxuICAgIGxldCBldmVudEJvZHkgPSBldmVudEVkaXQuYXBwZW5kKCd0Ym9keScpLmF0dHIoJ2lkJywgJ2V2ZW50cycpO1xyXG4gICAgZXZlbnRCb2R5LmRhdHVtKGVuZW15RWRpdG9yLmRldlRvb2wuZ2FtZS5lbmVtaWVzLm1vdmVTZXFzW2Zvcm1hdGlvbk5vXSk7XHJcbiAgICB0aGlzLmVkaXRvciA9IGRvRWRpdG9yKGV2ZW50Qm9keSx0aGlzXyk7XHJcbiAgICB0aGlzLmVkaXRvci5uZXh0KCk7XHJcblxyXG4gICAgLy8g44Kt44O85YWl5Yqb44OP44Oz44OJ44OpXHJcbiAgICBldmVudEVkaXQub24oJ2tleWRvd24nLCBmdW5jdGlvbiAoZCkge1xyXG4gICAgICBsZXQgZSA9IGQzLmV2ZW50O1xyXG4gIC8vICAgIGNvbnNvbGUubG9nKGUua2V5Q29kZSk7XHJcbiAgICAgIGxldCBrZXkgPSBrZXlCaW5kc1tlLmtleUNvZGVdO1xyXG4gICAgICBsZXQgcmV0ID0ge307XHJcbiAgICAgIGlmIChrZXkpIHtcclxuICAgICAgICBrZXkuc29tZSgoZCkgPT4ge1xyXG4gICAgICAgICAgaWYgKGQuY3RybEtleSA9PSBlLmN0cmxLZXlcclxuICAgICAgICAgICAgJiYgZC5zaGlmdEtleSA9PSBlLnNoaWZ0S2V5XHJcbiAgICAgICAgICAgICYmIGQuYWx0S2V5ID09IGUuYWx0S2V5XHJcbiAgICAgICAgICAgICYmIGQubWV0YUtleSA9PSBlLm1ldGFLZXlcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldCA9IHRoaXNfLmVkaXRvci5uZXh0KGQpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAocmV0LnZhbHVlKSB7XHJcbiAgICAgICAgICBkMy5ldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgZDMuZXZlbnQuY2FuY2VsQnViYmxlID0gdHJ1ZTtcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuLy8g44Ko44OH44Kj44K/5pys5L2TXHJcbmZ1bmN0aW9uKiBkb0VkaXRvcihldmVudEVkaXQsIGZvcm1FZGl0b3IpIHtcclxuICBsZXQga2V5Y29kZSA9IDA7Ly8g5YWl5Yqb44GV44KM44Gf44Kt44O844Kz44O844OJ44KS5L+d5oyB44GZ44KL5aSJ5pWwXHJcbiAgbGV0IGV2ZW50cyA9IGV2ZW50RWRpdC5kYXR1bSgpOy8vIOePvuWcqOe3qOmbhuS4reOBruODiOODqeODg+OCr1xyXG4gIGxldCBlZGl0VmlldyA9IGQzLnNlbGVjdCgnI2V2ZW50cycpOy8v57eo6ZuG55S76Z2i44Gu44K744Os44Kv44K344On44OzXHJcbiAgbGV0IHJvd0luZGV4ID0gMDsvLyDnt6jpm4bnlLvpnaLjga7nj77lnKjooYxcclxuICBsZXQgY3VycmVudEV2ZW50SW5kZXggPSAwOy8vIOOCpOODmeODs+ODiOmFjeWIl+OBrue3qOmbhumWi+Wni+ihjFxyXG4gIGxldCBjZWxsSW5kZXggPSAwOy8vIOWIl+OCpOODs+ODh+ODg+OCr+OCuVxyXG4gIGxldCBjYW5jZWxFdmVudCA9IGZhbHNlOy8vIOOCpOODmeODs+ODiOOCkuOCreODo+ODs+OCu+ODq+OBmeOCi+OBi+OBqeOBhuOBi1xyXG4gIGNvbnN0IE5VTV9ST1cgPSAxMDsvLyDvvJHnlLvpnaLjga7ooYzmlbBcclxuICBsZXQgc2VsZWN0U3RhcnRJbmRleCA9IG51bGw7XHJcbiAgbGV0IHNlbGVjdEVuZEluZGV4ID0gbnVsbDtcclxuICBsZXQgbmVlZERyYXcgPSBmYWxzZTtcclxuICBsZXQgZyA9IGZvcm1FZGl0b3IuZW5lbXlFZGl0b3IuZGV2VG9vbC5nYW1lO1xyXG4gIFxyXG4gIC8vaWYoIWcudGFza3MuZW5hYmxlKXtcclxuICAvLyAgZy50YXNrcy5lbmFibGUgPSB0cnVlO1xyXG4gICAgZy50YXNrcy5jbGVhcigpO1xyXG4gICAgZy50YXNrcy5wdXNoVGFzayhnLnJlbmRlci5iaW5kKGcpLCBnLlJFTkRFUkVSX1BSSU9SSVRZKTtcclxuLy8gICAgZy5zaG93U3BhY2VGaWVsZCgpO1xyXG4gICAgZy5lbmVtaWVzLnJlc2V0KCk7XHJcbiAvLy8vIH1cclxuXHJcbiAgLy9nLnRhc2tzLnByb2Nlc3MoZyk7XHJcbiAgXHJcbiAgZnVuY3Rpb24gc2V0SW5wdXQoKSB7XHJcbiAgICBsZXQgdGhpc18gPSB0aGlzO1xyXG4gICAgdGhpcy5hdHRyKCdjb250ZW50RWRpdGFibGUnLCAndHJ1ZScpO1xyXG4gICAgdGhpcy5vbignZm9jdXMnLCBmdW5jdGlvbiAoKSB7XHJcbiAgIC8vICAgY29uc29sZS5sb2codGhpcy5wYXJlbnROb2RlLnJvd0luZGV4IC0gMSk7XHJcbiAgICAgIHJvd0luZGV4ID0gdGhpcy5wYXJlbnROb2RlLnJvd0luZGV4IC0gMTtcclxuICAgICAgY2VsbEluZGV4ID0gdGhpcy5jZWxsSW5kZXg7XHJcbiAgICAgIC8vZy5lbmVtaWVzLnJlc2V0KCk7XHJcbiAgICAgIGxldCBpbmRleCA9IHBhcnNlSW50KHRoaXNfLmF0dHIoJ2RhdGEtcm93LWluZGV4JykpO1xyXG4gICAgICBmb3JtRWRpdG9yLmVuZW15RWRpdG9yLmRldlRvb2wuZ2FtZS5lbmVtaWVzLnN0YXJ0RW5lbXlJbmRleGVkKGV2ZW50c1tpbmRleF0saW5kZXgpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIFxyXG4gIGZ1bmN0aW9uIHNldEJsdXIoKXtcclxuICAgIGxldCB0aGlzXyA9IHRoaXM7IFxyXG4gICAgIHRoaXMub24oJ2JsdXInLGZ1bmN0aW9uKGQsaSlcclxuICAgICAge2lmKG5lZWREcmF3KSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgbGV0IGRhdGEgPSBldmVudHNbcGFyc2VJbnQodGhpc18uYXR0cignZGF0YS1yb3ctaW5kZXgnKSldO1xyXG4gICAgICAgIGlmKGkgIT0gNil7XHJcbiAgICAgICAgICBsZXQgdiA9IHBhcnNlRmxvYXQodGhpcy5pbm5lclRleHQpO1xyXG4gICAgICAgICAgaWYoIWlzTmFOKHYpKXtcclxuICAgICAgICAgICAgZGF0YVtpXSA9IHY7XHJcbiAgICAgICAgICB9IFxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBkYXRhW2ldID0gRW5lbWllcy5nZXRFbmVteUZ1bmModGhpcy5pbm5lclRleHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgfVxyXG4gIFxyXG4gIFxyXG4gIC8vIOaXouWtmOOCpOODmeODs+ODiOOBruihqOekulxyXG4gIGZ1bmN0aW9uIGRyYXdFdmVudCgpIFxyXG4gIHtcclxuICAgIGxldCBzdGkgPSBudWxsLHNlaSA9IG51bGw7XHJcbiAgICBpZihzZWxlY3RTdGFydEluZGV4ICE9IG51bGwgJiYgc2VsZWN0RW5kSW5kZXggIT0gbnVsbCl7XHJcbiAgICAgICAgaWYoY3VycmVudEV2ZW50SW5kZXggPD0gc2VsZWN0U3RhcnRJbmRleCl7XHJcbiAgICAgICAgICBzdGkgPSBzZWxlY3RTdGFydEluZGV4IC0gY3VycmVudEV2ZW50SW5kZXg7XHJcbiAgICAgICAgICBpZigoY3VycmVudEV2ZW50SW5kZXggKyBOVU1fUk9XKSA+PSBzZWxlY3RFbmRJbmRleClcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc2VpID0gc2VsZWN0RW5kSW5kZXggLSBjdXJyZW50RXZlbnRJbmRleDsgXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzZWkgPSBOVU1fUk9XIC0gMTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICBzdGkgPSAwO1xyXG4gICAgICAgICAgaWYoKGN1cnJlbnRFdmVudEluZGV4ICsgTlVNX1JPVykgPj0gc2VsZWN0RW5kSW5kZXgpXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNlaSA9IHNlbGVjdEVuZEluZGV4IC0gY3VycmVudEV2ZW50SW5kZXg7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzZWkgPSBOVU1fUk9XIC0gMTsgICAgICAgICAgXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgbGV0IGV2ZmxhZ21lbnQgPSBldmVudHMuc2xpY2UoY3VycmVudEV2ZW50SW5kZXgsIGN1cnJlbnRFdmVudEluZGV4ICsgTlVNX1JPVyk7XHJcbiAgICBlZGl0Vmlldy5zZWxlY3RBbGwoJ3RyJykucmVtb3ZlKCk7XHJcbiAgICBsZXQgc2VsZWN0ID0gZWRpdFZpZXcuc2VsZWN0QWxsKCd0cicpLmRhdGEoZXZmbGFnbWVudCk7XHJcbiAgICBsZXQgZW50ZXIgPSBzZWxlY3QuZW50ZXIoKTtcclxuICAgIGxldCByb3dzID0gZW50ZXIuYXBwZW5kKCd0cicpLmF0dHIoJ2RhdGEtaW5kZXgnLCAoZCwgaSkgPT4gaSk7XHJcbiAgICBpZihzdGkgIT0gbnVsbCAmJiBzZWkgIT0gbnVsbCl7XHJcbiAgICAgIHJvd3MuZWFjaChmdW5jdGlvbihkLGkpe1xyXG4gICAgICAgIGlmKGkgPj0gc3RpICYmIGkgPD0gc2VpKXtcclxuICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKS5jbGFzc2VkKCdzZWxlY3RlZCcsdHJ1ZSk7ICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcm93cy5lYWNoKGZ1bmN0aW9uIChkLCBpKSB7XHJcbiAgICAgIGxldCByb3cgPSBkMy5zZWxlY3QodGhpcyk7XHJcbiBcclxuICAgICAgIHJvdy5zZWxlY3RBbGwoJ3RkJylcclxuICAgICAgLmRhdGEoZClcclxuICAgICAgLmVudGVyKClcclxuICAgICAgLmFwcGVuZCgndGQnKVxyXG4gICAgICAuY2FsbChzZXRJbnB1dClcclxuICAgICAgLmNhbGwoc2V0Qmx1cilcclxuICAgICAgLmF0dHIoJ2RhdGEtcm93LWluZGV4JyxpICsgY3VycmVudEV2ZW50SW5kZXgpICAgICAgXHJcbiAgICAgIC50ZXh0KChkKT0+e1xyXG4gICAgICAgIGlmKHR5cGVvZihkKSA9PT0gJ2Z1bmN0aW9uJyApe1xyXG4gICAgICAgICAgcmV0dXJuICgnJytkKS5yZXBsYWNlKC9eXFxzKmZ1bmN0aW9uXFxzKihbXlxcKF0qKVtcXFNcXHNdKyQvaW0sICckMScpO1xyXG4gICAgICAgIH0gXHJcbiAgICAgICAgcmV0dXJuIGQ7XHJcbiAgICAgIH0pO1xyXG4gICAgICBcclxuICAgICAgLy8gZC5mb3JFYWNoKChkLGkpPT57XHJcbiAgICAgIC8vICAgcm93LmFwcGVuZCgndGQnKS50ZXh0KGQpXHJcbiAgICAgIC8vICAgLmNhbGwoc2V0SW5wdXQpXHJcbiAgICAgIC8vICAgLmNhbGwoc2V0Qmx1cihpKSk7XHJcbiAgICAgIC8vIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKHJvd0luZGV4ID4gKGV2ZmxhZ21lbnQubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgcm93SW5kZXggPSBldmZsYWdtZW50Lmxlbmd0aCAtIDE7XHJcbiAgICB9XHJcblxyXG4gIH1cclxuXHRcclxuICAvLyDjgqTjg5njg7Pjg4jjga7jg5Xjgqnjg7zjgqvjgrlcclxuICBmdW5jdGlvbiBmb2N1c0V2ZW50KCkge1xyXG4gICAgaWYoIWVkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XS5jZWxsc1tjZWxsSW5kZXhdKXtcclxuICAgICAgZGVidWdnZXI7XHJcbiAgICB9XHJcbiAgICBlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF0uY2VsbHNbY2VsbEluZGV4XS5mb2N1cygpO1xyXG4gIH1cclxuXHRcclxuICAvLyDjgqTjg5njg7Pjg4jjga7mjL/lhaVcclxuICBmdW5jdGlvbiBpbnNlcnRFdmVudChyb3dJbmRleCkge1xyXG4gICAgZm9ybUVkaXRvci51bmRvTWFuYWdlci5leGVjKHtcclxuICAgICAgZXhlYygpIHtcclxuICAgICAgICB0aGlzLnJvdyA9IGVkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XTtcclxuICAgICAgICB0aGlzLmNlbGxJbmRleCA9IGNlbGxJbmRleDtcclxuICAgICAgICB0aGlzLnJvd0luZGV4ID0gcm93SW5kZXg7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50RXZldEluZGV4ID0gY3VycmVudEV2ZW50SW5kZXg7XHJcbiAgICAgICAgdGhpcy5leGVjXygpO1xyXG4gICAgICB9LFxyXG4gICAgICBleGVjXygpIHtcclxuICAgICAgICB2YXIgcm93ID0gZDMuc2VsZWN0KGVkaXRWaWV3Lm5vZGUoKS5pbnNlcnRSb3codGhpcy5yb3dJbmRleCkpO1xyXG4gICAgICAgIHZhciBjb2xzID0gIHJvdy5zZWxlY3RBbGwoJ3RkJykuZGF0YShbMCwwLDAsMCwwLDAsRW5lbWllcy5aYWtvLHRydWUsMF0pO1xyXG5cclxuICAgICAgICBjZWxsSW5kZXggPSAwO1xyXG4gICAgICAgIGNvbHMuZW50ZXIoKS5hcHBlbmQoJ3RkJylcclxuICAgICAgICAuY2FsbChzZXRJbnB1dClcclxuICAgICAgICAuY2FsbChzZXRCbHVyKVxyXG4gICAgICAgIC5hdHRyKCdkYXRhLXJvdy1pbmRleCcsdGhpcy5yb3dJbmRleCArIHRoaXMuY3VycmVudEV2ZW50SW5kZXgpXHJcbiAgICAgICAgLnRleHQoKGQpPT57XHJcbiAgICAgICAgICBpZih0eXBlb2YoZCkgPT09ICdmdW5jdGlvbicgKXtcclxuICAgICAgICAgICAgcmV0dXJuICgnJytkKS5yZXBsYWNlKC9eXFxzKmZ1bmN0aW9uXFxzKihbXlxcKF0qKVtcXFNcXHNdKyQvaW0sICckMScpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcm93Lm5vZGUoKS5jZWxsc1t0aGlzLmNlbGxJbmRleF0uZm9jdXMoKTtcclxuICAgICAgICByb3cuYXR0cignZGF0YS1uZXcnLCB0cnVlKTtcclxuICAgICAgfSxcclxuICAgICAgcmVkbygpIHtcclxuICAgICAgICB0aGlzLmV4ZWNfKCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHVuZG8oKSB7XHJcbiAgICAgICAgZWRpdFZpZXcubm9kZSgpLmRlbGV0ZVJvdyh0aGlzLnJvd0luZGV4KTtcclxuICAgICAgICB0aGlzLnJvdy5jZWxsc1t0aGlzLmNlbGxJbmRleF0uZm9jdXMoKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIFxyXG4gIC8vIOaWsOimj+WFpeWKm+ihjOOBrueiuuWumlxyXG4gIGZ1bmN0aW9uIGVuZE5ld0lucHV0KGRvd24gPSB0cnVlKSB7XHJcbiAgICBkMy5zZWxlY3QoZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdKS5hdHRyKCdkYXRhLW5ldycsIG51bGwpO1xyXG4gICAgLy8g54++5Zyo44Gu57eo6ZuG6KGMXHJcbiAgICAvL2xldCBjdXJSb3cgPSBlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF0uY2VsbHM7XHJcbiAgICBsZXQgZXYgPSBkMy5zZWxlY3QoZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdKS5zZWxlY3RBbGwoJ3RkJykuZGF0YSgpO1xyXG4gICAgZm9ybUVkaXRvci51bmRvTWFuYWdlci5leGVjKHtcclxuICAgICAgZXhlYygpe1xyXG4gICAgICAgIHRoaXMuc3RhcnRJbmRleCA9IHJvd0luZGV4ICsgY3VycmVudEV2ZW50SW5kZXg7XHJcbiAgICAgICAgdGhpcy5ldiA9IGV2O1xyXG4gICAgICAgIHRoaXMuY291bnQgPSBldi5sZW5ndGg7XHJcbiAgICAgICAgdGhpcy5lbnRlcigpO1xyXG4gICAgICB9LFxyXG4gICAgICBlbnRlcigpe1xyXG4gICAgICAgIGV2ZW50cy5zcGxpY2UodGhpcy5zdGFydEluZGV4LDAsdGhpcy5ldik7XHJcbiAgICAgIH0sXHJcbiAgICAgIHJlZG8oKXtcclxuICAgICAgICB0aGlzLmVudGVyKCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHVuZG8oKXtcclxuICAgICAgICBldmVudHMuc3BsaWNlKHRoaXMuc3RhcnRJbmRleCx0aGlzLmNvdW50KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIGlmIChkb3duKSB7XHJcbiAgICAgIGlmIChyb3dJbmRleCA9PSAoTlVNX1JPVyAtIDEpKSB7XHJcbiAgICAgICAgKytjdXJyZW50RXZlbnRJbmRleDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICArK3Jvd0luZGV4O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyDmjL/lhaXlvozjgIHlho3mj4/nlLtcclxuICAgIG5lZWREcmF3ID0gdHJ1ZTtcclxuICB9XHJcbiAgXHJcbiAgZnVuY3Rpb24gYWRkUm93KGRlbHRhKVxyXG4gIHtcclxuICAgIHJvd0luZGV4ICs9IGRlbHRhO1xyXG4gICAgbGV0IHJvd0xlbmd0aCA9IGVkaXRWaWV3Lm5vZGUoKS5yb3dzLmxlbmd0aDtcclxuICAgIGlmKHJvd0luZGV4ID49IHJvd0xlbmd0aCl7XHJcbiAgICAgIGxldCBkID0gcm93SW5kZXggLSByb3dMZW5ndGggKyAxO1xyXG4gICAgICByb3dJbmRleCA9IHJvd0xlbmd0aCAtIDE7XHJcbiAgICAgIGlmKChjdXJyZW50RXZlbnRJbmRleCArIE5VTV9ST1cgLTEpIDwgKGV2ZW50cy5sZW5ndGggLSAxKSl7XHJcbiAgICAgICAgY3VycmVudEV2ZW50SW5kZXggKz0gZDtcclxuICAgICAgICBpZigoY3VycmVudEV2ZW50SW5kZXggKyBOVU1fUk9XIC0xKSA+IChldmVudHMubGVuZ3RoIC0gMSkpe1xyXG4gICAgICAgICAgY3VycmVudEV2ZW50SW5kZXggPSAoZXZlbnRzLmxlbmd0aCAtIE5VTV9ST1cgKyAxKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgbmVlZERyYXcgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgaWYocm93SW5kZXggPCAwKXtcclxuICAgICAgbGV0IGQgPSByb3dJbmRleDtcclxuICAgICAgcm93SW5kZXggPSAwO1xyXG4gICAgICBpZihjdXJyZW50RXZlbnRJbmRleCAhPSAwKXtcclxuICAgICAgICBjdXJyZW50RXZlbnRJbmRleCArPSBkO1xyXG4gICAgICAgIGlmKGN1cnJlbnRFdmVudEluZGV4IDwgMCl7XHJcbiAgICAgICAgICBjdXJyZW50RXZlbnRJbmRleCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG5lZWREcmF3ID0gdHJ1ZTtcclxuICAgICAgfSBcclxuICAgIH1cclxuICAgIGZvcm1FZGl0b3IuZW5lbXlFZGl0b3IubW92U2VxRWRpdG9yLnBhdHRlcm5ObyA9IGV2ZW50c1tyb3dJbmRleCArIGN1cnJlbnRFdmVudEluZGV4XVs1XTtcclxuICAgIGZvY3VzRXZlbnQoKTtcclxuICB9XHJcbiAgXHJcbiAgLy8g44Ko44Oz44K/44O8XHJcbiAgZnVuY3Rpb24gZG9FbnRlcigpe1xyXG4gICAgLy9jb25zb2xlLmxvZygnQ1IvTEYnKTtcclxuICAgIC8vIOePvuWcqOOBruihjOOBjOaWsOimj+OBi+e3qOmbhuS4reOBi1xyXG4gICAgbGV0IGZsYWcgPSBkMy5zZWxlY3QoZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdKS5hdHRyKCdkYXRhLW5ldycpO1xyXG4gICAgaWYgKGZsYWcpIHtcclxuICAgICAgZW5kTmV3SW5wdXQoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8v5paw6KaP57eo6ZuG5Lit44Gu6KGM44Gn44Gq44GR44KM44Gw44CB5paw6KaP5YWl5Yqb55So6KGM44KS5oy/5YWlXHJcbiAgICAgIGluc2VydEV2ZW50KHJvd0luZGV4KTtcclxuICAgIH1cclxuICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICB9XHJcbiAgXHJcbiAgLy8g5Y+z56e75YuVXHJcbiAgZnVuY3Rpb24gZG9SaWdodCgpe1xyXG4gICAgY2VsbEluZGV4Kys7XHJcbiAgICBsZXQgY3VyUm93ID0gZWRpdFZpZXcubm9kZSgpLnJvd3M7XHJcbiAgICBpZiAoY2VsbEluZGV4ID4gKGN1clJvd1tyb3dJbmRleF0uY2VsbHMubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgY2VsbEluZGV4ID0gMDtcclxuICAgICAgaWYgKHJvd0luZGV4IDwgKGN1clJvdy5sZW5ndGggLSAxKSkge1xyXG4gICAgICAgIGlmIChkMy5zZWxlY3QoY3VyUm93W3Jvd0luZGV4XSkuYXR0cignZGF0YS1uZXcnKSkge1xyXG4gICAgICAgICAgZW5kTmV3SW5wdXQoKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgYWRkUm93KDEpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZm9jdXNFdmVudCgpO1xyXG4gICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgLy8g5bem44Kr44O844K944OrIFxyXG4gIGZ1bmN0aW9uIGRvTGVmdCgpIHtcclxuICAgIGxldCBjdXJSb3cgPSBlZGl0Vmlldy5ub2RlKCkucm93cztcclxuICAgIC0tY2VsbEluZGV4O1xyXG4gICAgaWYgKGNlbGxJbmRleCA8IDApIHtcclxuICAgICAgaWYgKHJvd0luZGV4ICE9IDApIHtcclxuICAgICAgICBpZiAoZDMuc2VsZWN0KGN1clJvd1tyb3dJbmRleF0pLmF0dHIoJ2RhdGEtbmV3JykpIHtcclxuICAgICAgICAgIGVuZE5ld0lucHV0KGZhbHNlKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2VsbEluZGV4ID0gZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdLmNlbGxzLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgYWRkUm93KC0xKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY2VsbEluZGV4ID0gMDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZm9jdXNFdmVudCgpO1xyXG4gICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gIH1cclxuICBcclxuICAvLyDkuIrnp7vli5VcclxuICBmdW5jdGlvbiBkb1VwKCkge1xyXG4gICAgbGV0IGN1clJvdyA9IGVkaXRWaWV3Lm5vZGUoKS5yb3dzO1xyXG4gICAgaWYgKGQzLnNlbGVjdChjdXJSb3dbcm93SW5kZXhdKS5hdHRyKCdkYXRhLW5ldycpKSB7XHJcbiAgICAgIGVuZE5ld0lucHV0KGZhbHNlKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGFkZFJvdygtMSk7XHJcbiAgICB9XHJcbiAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBkb0Rvd24oKSB7XHJcbiAgICBsZXQgY3VyUm93ID0gZWRpdFZpZXcubm9kZSgpLnJvd3M7XHJcbiAgICBpZiAoZDMuc2VsZWN0KGN1clJvd1tyb3dJbmRleF0pLmF0dHIoJ2RhdGEtbmV3JykpIHtcclxuICAgICAgZW5kTmV3SW5wdXQoZmFsc2UpO1xyXG4gICAgfVxyXG4gICAgYWRkUm93KDEpO1xyXG4gICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gIH1cclxuICBcclxuICBmdW5jdGlvbiBkb1BhZ2VEb3duKCkge1xyXG4gICAgaWYgKGN1cnJlbnRFdmVudEluZGV4IDwgKGV2ZW50cy5sZW5ndGggLSAxKSkge1xyXG4gICAgICBjdXJyZW50RXZlbnRJbmRleCArPSBOVU1fUk9XO1xyXG4gICAgICBpZiAoY3VycmVudEV2ZW50SW5kZXggPiAoZXZlbnRzLmxlbmd0aCAtIDEpKSB7XHJcbiAgICAgICAgY3VycmVudEV2ZW50SW5kZXggLT0gTlVNX1JPVztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBuZWVkRHJhdyA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgfVxyXG4gICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gIH1cclxuICBcclxuICBmdW5jdGlvbiBkb1BhZ2VVcCgpe1xyXG4gICAgaWYgKGN1cnJlbnRFdmVudEluZGV4ID4gMCkge1xyXG4gICAgICBjdXJyZW50RXZlbnRJbmRleCAtPSBOVU1fUk9XO1xyXG4gICAgICBpZiAoY3VycmVudEV2ZW50SW5kZXggPCAwKSB7XHJcbiAgICAgICAgY3VycmVudEV2ZW50SW5kZXggPSAwO1xyXG4gICAgICB9XHJcbiAgICAgIG5lZWREcmF3ID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGRvU2Nyb2xsVXAoKVxyXG4gIHtcclxuICAgIGlmIChjdXJyZW50RXZlbnRJbmRleCA+IDApIHtcclxuICAgICAgLS1jdXJyZW50RXZlbnRJbmRleDtcclxuICAgICAgbmVlZERyYXcgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZG9TY3JvbGxEb3duKClcclxuICB7XHJcbiAgICBpZiAoKGN1cnJlbnRFdmVudEluZGV4ICsgTlVNX1JPVykgPD0gKGV2ZW50cy5sZW5ndGggLSAxKSkge1xyXG4gICAgICArK2N1cnJlbnRFdmVudEluZGV4O1xyXG4gICAgICBuZWVkRHJhdyA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBkb0hvbWUoKXtcclxuICAgIGlmIChjdXJyZW50RXZlbnRJbmRleCA+IDApIHtcclxuICAgICAgcm93SW5kZXggPSAwO1xyXG4gICAgICBjdXJyZW50RXZlbnRJbmRleCA9IDA7XHJcbiAgICAgIG5lZWREcmF3ID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICB9XHJcbiAgXHJcbiAgZnVuY3Rpb24gZG9FbmQoKXtcclxuICAgIGlmIChjdXJyZW50RXZlbnRJbmRleCAhPSAoZXZlbnRzLmxlbmd0aCAtIDEpKSB7XHJcbiAgICAgIHJvd0luZGV4ID0gMDtcclxuICAgICAgY3VycmVudEV2ZW50SW5kZXggPSBldmVudHMubGVuZ3RoIC0gMTtcclxuICAgICAgbmVlZERyYXcgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZG9EZWxldGUoKSB7XHJcbiAgICBpZiAoKHJvd0luZGV4ICsgY3VycmVudEV2ZW50SW5kZXgpID09IChldmVudHMubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBmb3JtRWRpdG9yLnVuZG9NYW5hZ2VyLmV4ZWMoXHJcbiAgICAgIHtcclxuICAgICAgICBleGVjKCkge1xyXG4gICAgICAgICAgdGhpcy5yb3dJbmRleCA9IHJvd0luZGV4O1xyXG4gICAgICAgICAgdGhpcy5jdXJyZW50RXZlbnRJbmRleCA9IGN1cnJlbnRFdmVudEluZGV4O1xyXG4gICAgICAgICAgdGhpcy5ldmVudCA9IGV2ZW50c1t0aGlzLnJvd0luZGV4XTtcclxuICAgICAgICAgIHRoaXMucm93RGF0YSA9IGV2ZW50c1t0aGlzLmN1cnJlbnRFdmVudEluZGV4ICsgdGhpcy5yb3dJbmRleF07XHJcbiAgICAgICAgICBlZGl0Vmlldy5ub2RlKCkuZGVsZXRlUm93KHRoaXMucm93SW5kZXgpO1xyXG4gICAgICAgICAgdGhpcy5saW5lQnVmZmVyID0gZm9ybUVkaXRvci5saW5lQnVmZmVyO1xyXG4gICAgICAgICAgZm9ybUVkaXRvci5saW5lQnVmZmVyID0gW3RoaXMuZXZlbnRdO1xyXG4gICAgICAgICAgZXZlbnRzLnNwbGljZSh0aGlzLmN1cnJlbnRFdmVudEluZGV4ICsgdGhpcy5yb3dJbmRleCwxKTtcclxuICAgICAgICAgIG5lZWREcmF3ID0gdHJ1ZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlZG8oKSB7XHJcbiAgICAgICAgICBlZGl0Vmlldy5ub2RlKCkuZGVsZXRlUm93KHRoaXMucm93SW5kZXgpO1xyXG4gICAgICAgICAgZXZlbnRzLnNwbGljZSh0aGlzLmN1cnJlbnRFdmVudEluZGV4ICsgdGhpcy5yb3dJbmRleCwxKTtcclxuICAgICAgICAgIG5lZWREcmF3ID0gdHJ1ZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHVuZG8oKSB7XHJcbiAgICAgICAgICBmb3JtRWRpdG9yLmxpbmVCdWZmZXIgPSB0aGlzLmxpbmVCdWZmZXI7XHJcbiAgICAgICAgICBldmVudHMuc3BsaWNlKHRoaXMuY3VycmVudEV2ZW50SW5kZXggKyB0aGlzLnJvd0luZGV4LDAsdGhpcy5ldmVudCk7XHJcbiAgICAgICAgICBuZWVkRHJhdyA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICApO1xyXG4gICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gIH1cclxuICBcclxuICBmdW5jdGlvbiBkb0xpbmVQYXN0ZSgpXHJcbiAge1xyXG4gICAgcGFzdGVFdmVudCgpO1xyXG4gIH1cclxuICBcclxuICBmdW5jdGlvbiBkb1JlZG8oKXtcclxuICAgIGZvcm1FZGl0b3IudW5kb01hbmFnZXIucmVkbygpO1xyXG4gICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZG9VbmRvKCl7XHJcbiAgICBmb3JtRWRpdG9yLnVuZG9NYW5hZ2VyLnVuZG8oKTtcclxuICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICB9XHJcbiAgLy8gY3V0RXZlbnTjga7nt6jpm4bjgYvjgolcclxuICAvLyDjgqTjg5njg7Pjg4jjga7jgqvjg4Pjg4hcclxuICBmdW5jdGlvbiBjdXRFdmVudCgpXHJcbiAge1xyXG4gICAgZm9ybUVkaXRvci51bmRvTWFuYWdlci5leGVjKFxyXG4gICAge1xyXG4gICAgICBleGVjKCl7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RTdGFydEluZGV4ID0gc2VsZWN0U3RhcnRJbmRleDtcclxuICAgICAgICB0aGlzLnNlbGVjdEVuZEluZGV4ID0gc2VsZWN0RW5kSW5kZXg7XHJcbiAgICAgICAgdGhpcy5jdXQoKTtcclxuICAgICAgfSxcclxuICAgICAgY3V0KCl7XHJcbiAgICAgICAgdGhpcy5saW5lQnVmZmVyID0gZm9ybUVkaXRvci5saW5lQnVmZmVyO1xyXG4gICAgICAgIGZvcm1FZGl0b3IubGluZUJ1ZmZlciA9IFxyXG4gICAgICAgIGV2ZW50cy5zcGxpY2UodGhpcy5zZWxlY3RTdGFydEluZGV4LCB0aGlzLnNlbGVjdEVuZEluZGV4ICsgMSAtIHRoaXMuc2VsZWN0U3RhcnRJbmRleCApO1xyXG4gICAgICAgIHJvd0luZGV4ID0gdGhpcy5zZWxlY3RTdGFydEluZGV4IC0gY3VycmVudEV2ZW50SW5kZXg7XHJcbiAgICAgICAgbmVlZERyYXcgPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgICByZWRvKClcclxuICAgICAge1xyXG4gICAgICAgIHRoaXMuY3V0KCk7ICAgICAgICBcclxuICAgICAgfSxcclxuICAgICAgdW5kbygpe1xyXG4gICAgICAgZm9ybUVkaXRvci5saW5lQnVmZmVyLmZvckVhY2goKGQsaSk9PntcclxuICAgICAgICAgZXZlbnRzLnNwbGljZSh0aGlzLnNlbGVjdFN0YXJ0SW5kZXggKyBpLDAsZCk7XHJcbiAgICAgICB9KTtcclxuICAgICAgIGZvcm1FZGl0b3IubGluZUJ1ZmZlciA9IHRoaXMubGluZUJ1ZmZlcjtcclxuICAgICAgIG5lZWREcmF3ID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgfSBcclxuICBcclxuICAvLyDjgqTjg5njg7Pjg4jjga7jgrPjg5Tjg7xcclxuICBmdW5jdGlvbiBjb3B5RXZlbnQoKVxyXG4gIHtcclxuICAgIGZvcm1FZGl0b3IudW5kb01hbmFnZXIuZXhlYyhcclxuICAgIHtcclxuICAgICAgZXhlYygpe1xyXG4gICAgICAgIHRoaXMuc2VsZWN0U3RhcnRJbmRleCA9IHNlbGVjdFN0YXJ0SW5kZXg7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RFbmRJbmRleCA9IHNlbGVjdEVuZEluZGV4O1xyXG4gICAgICAgIHRoaXMuY29weSgpO1xyXG4gICAgICB9LFxyXG4gICAgICBjb3B5KCl7XHJcbiAgICAgICAgdGhpcy5saW5lQnVmZmVyID0gZm9ybUVkaXRvci5saW5lQnVmZmVyO1xyXG4gICAgICAgIGZvcm1FZGl0b3IubGluZUJ1ZmZlciA9IFtdO1xyXG4gICAgICAgIGZvcihsZXQgaSA9IHRoaXMuc2VsZWN0U3RhcnRJbmRleCxlID0gdGhpcy5zZWxlY3RFbmRJbmRleCArIDE7aTwgZTsrK2kpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZm9ybUVkaXRvci5saW5lQnVmZmVyLnB1c2goZXZlbnRzW2ldLmNvbmNhdCgpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbmVlZERyYXcgPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgICByZWRvKClcclxuICAgICAge1xyXG4gICAgICAgIHRoaXMuY29weSgpOyAgICAgICAgXHJcbiAgICAgIH0sXHJcbiAgICAgIHVuZG8oKXtcclxuICAgICAgIGZvcm1FZGl0b3IubGluZUJ1ZmZlciA9IHRoaXMubGluZUJ1ZmZlcjtcclxuICAgICAgIG5lZWREcmF3ID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgfVxyXG4gIFxyXG4gIC8vIOOCpOODmeODs+ODiOOBruODmuODvOOCueODiFxyXG4gIGZ1bmN0aW9uIHBhc3RlRXZlbnQoKXtcclxuICAgIGlmKGZvcm1FZGl0b3IubGluZUJ1ZmZlcil7XHJcbiAgICBmb3JtRWRpdG9yLnVuZG9NYW5hZ2VyLmV4ZWMoXHJcbiAgICB7XHJcbiAgICAgIGV4ZWMoKXtcclxuICAgICAgICB0aGlzLnN0YXJ0SW5kZXggPSByb3dJbmRleCArIGN1cnJlbnRFdmVudEluZGV4O1xyXG4gICAgICAgIHRoaXMuY291bnQgPSBmb3JtRWRpdG9yLmxpbmVCdWZmZXIubGVuZ3RoO1xyXG4gICAgICAgIHRoaXMucGFzdGUoKTtcclxuICAgICAgfSxcclxuICAgICAgcGFzdGUoKXtcclxuICAgICAgICBmb3IobGV0IGkgPSB0aGlzLmNvdW50IC0gMSxlID0gMDtpID49IGU7LS1pKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGV2ZW50cy5zcGxpY2UodGhpcy5zdGFydEluZGV4LDAsZm9ybUVkaXRvci5saW5lQnVmZmVyW2ldLmNvbmNhdCgpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbmVlZERyYXcgPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgICByZWRvKCl7XHJcbiAgICAgICAgdGhpcy5wYXN0ZSgpO1xyXG4gICAgICB9LFxyXG4gICAgICB1bmRvKCl7XHJcbiAgICAgICAgZXZlbnRzLnNwbGljZSh0aGlzLnN0YXJ0SW5kZXgsdGhpcy5jb3VudCk7XHJcbiAgICAgICAgbmVlZERyYXcgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIG5lZWREcmF3ID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICB9XHJcbiAgXHJcbiAgZnVuY3Rpb24gKmRvU2VsZWN0KClcclxuICB7XHJcbiAgICBsZXQgaW5wdXQ7XHJcbiAgICBsZXQgaW5kZXhCYWNrdXAgPSByb3dJbmRleCArIGN1cnJlbnRFdmVudEluZGV4O1xyXG4gICAgc2VsZWN0U3RhcnRJbmRleCA9IHJvd0luZGV4ICsgY3VycmVudEV2ZW50SW5kZXg7XHJcbiAgICBzZWxlY3RFbmRJbmRleCA9IHNlbGVjdFN0YXJ0SW5kZXg7XHJcbiAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICBkcmF3RXZlbnQoKTtcclxuICAgIGZvY3VzRXZlbnQoKTtcclxuICAgIGxldCBleGl0TG9vcCA9IGZhbHNlO1xyXG4gICAgd2hpbGUoIWV4aXRMb29wKVxyXG4gICAge1xyXG4gICAgICBpbnB1dCA9IHlpZWxkIGNhbmNlbEV2ZW50O1xyXG4gICAgICBcclxuICAgICAgc3dpdGNoKGlucHV0LmlucHV0Q29tbWFuZC5pZCl7XHJcbiAgICAgICAgY2FzZSBJbnB1dENvbW1hbmRzLnNlbGVjdC5pZDpcclxuICAgICAgICAgIGV4aXRMb29wID0gdHJ1ZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kcy5jdXRFdmVudC5pZDpcclxuICAgICAgICAgIGN1dEV2ZW50KCk7XHJcbiAgICAgICAgICBleGl0TG9vcCA9IHRydWU7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZHMuY29weUV2ZW50LmlkOlxyXG4gICAgICAgICAgY29weUV2ZW50KCk7XHJcbiAgICAgICAgICBleGl0TG9vcCA9IHRydWU7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgbGV0IGZuID0gZWRpdEZ1bmNzW2lucHV0LmlucHV0Q29tbWFuZC5pZF07XHJcbiAgICAgICAgICBpZihmbil7XHJcbiAgICAgICAgICAgIGZuKGlucHV0KTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgY2FuY2VsRXZlbnQgPSBmYWxzZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIC8vIOmBuOaKnuevhOWbsuOBruioiOeul1xyXG4gICAgICAgICAgaWYoaW5kZXhCYWNrdXAgIT0gKHJvd0luZGV4ICsgY3VycmVudEV2ZW50SW5kZXgpKVxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBsZXQgZGVsdGEgPSByb3dJbmRleCArIGN1cnJlbnRFdmVudEluZGV4IC0gaW5kZXhCYWNrdXA7XHJcbiAgICAgICAgICAgIGxldCBpbmRleE5leHQgPSByb3dJbmRleCArIGN1cnJlbnRFdmVudEluZGV4OyAgICAgICAgIFxyXG4gICAgICAgICAgICBpZihkZWx0YSA8IDApe1xyXG4gICAgICAgICAgICAgIGlmKHNlbGVjdFN0YXJ0SW5kZXggPiBpbmRleE5leHQpe1xyXG4gICAgICAgICAgICAgICAgc2VsZWN0U3RhcnRJbmRleCA9IGluZGV4TmV4dDtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2VsZWN0RW5kSW5kZXggPSBpbmRleE5leHQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGlmKHNlbGVjdEVuZEluZGV4IDwgaW5kZXhOZXh0KXtcclxuICAgICAgICAgICAgICAgIHNlbGVjdEVuZEluZGV4ID0gaW5kZXhOZXh0O1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZWxlY3RTdGFydEluZGV4ID0gaW5kZXhOZXh0O1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpbmRleEJhY2t1cCA9IHJvd0luZGV4ICsgY3VycmVudEV2ZW50SW5kZXg7XHJcbiAgICAgICAgICAgIG5lZWREcmF3ID0gdHJ1ZTtcclxuICAgICAgICAgICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgfSAgICAgICAgXHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgaWYobmVlZERyYXcpe1xyXG4gICAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgICAgIGZvY3VzRXZlbnQoKTtcclxuICAgICAgICBuZWVkRHJhdyA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8g5b6M5aeL5pyrXHJcbiAgICBzZWxlY3RTdGFydEluZGV4ID0gbnVsbDtcclxuICAgIHNlbGVjdEVuZEluZGV4ID0gbnVsbDtcclxuICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICAgIGRyYXdFdmVudCgpO1xyXG4gICAgZm9jdXNFdmVudCgpO1xyXG4gICAgbmVlZERyYXcgPSBmYWxzZTtcclxuICB9XHJcbiAgXHJcbiAgdmFyIGVkaXRGdW5jcyA9IHtcclxuICAgIFtJbnB1dENvbW1hbmRzLmVudGVyLmlkXTpkb0VudGVyLFxyXG4gICAgW0lucHV0Q29tbWFuZHMucmlnaHQuaWRdOmRvUmlnaHQsXHJcbiAgICBbSW5wdXRDb21tYW5kcy5sZWZ0LmlkXTpkb0xlZnQsXHJcbiAgICBbSW5wdXRDb21tYW5kcy51cC5pZF06ZG9VcCxcclxuICAgIFtJbnB1dENvbW1hbmRzLmRvd24uaWRdOmRvRG93bixcclxuICAgIFtJbnB1dENvbW1hbmRzLnBhZ2VEb3duLmlkXTpkb1BhZ2VEb3duLFxyXG4gICAgW0lucHV0Q29tbWFuZHMucGFnZVVwLmlkXTpkb1BhZ2VVcCxcclxuICAgIFtJbnB1dENvbW1hbmRzLnNjcm9sbFVwLmlkXTpkb1Njcm9sbFVwLFxyXG4gICAgW0lucHV0Q29tbWFuZHMuc2Nyb2xsRG93bi5pZF06ZG9TY3JvbGxEb3duLFxyXG4gICAgW0lucHV0Q29tbWFuZHMuaG9tZS5pZF06ZG9Ib21lLFxyXG4gICAgW0lucHV0Q29tbWFuZHMuZW5kLmlkXTpkb0VuZCxcclxuICAgIFtJbnB1dENvbW1hbmRzLmRlbGV0ZS5pZF06ZG9EZWxldGUsXHJcbiAgICBbSW5wdXRDb21tYW5kcy5saW5lUGFzdGUuaWRdOmRvTGluZVBhc3RlLFxyXG4gICAgW0lucHV0Q29tbWFuZHMucmVkby5pZF06ZG9SZWRvLFxyXG4gICAgW0lucHV0Q29tbWFuZHMudW5kby5pZF06ZG9VbmRvLFxyXG4gICAgW0lucHV0Q29tbWFuZHMucGFzdGVFdmVudC5pZF06cGFzdGVFdmVudFxyXG4gIH07XHJcbiAgXHJcbiAgZHJhd0V2ZW50KCk7XHJcbiAgd2hpbGUgKHRydWUpIHtcclxuLy8gICAgY29uc29sZS5sb2coJ25ldyBsaW5lJywgcm93SW5kZXgsIGV2ZW50cy5sZW5ndGgpO1xyXG4gICAgaWYgKGV2ZW50cy5sZW5ndGggPT0gMCB8fCByb3dJbmRleCA+IChldmVudHMubGVuZ3RoIC0gMSkpIHtcclxuICAgIH1cclxuICAgIGtleWxvb3A6XHJcbiAgICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgICBsZXQgaW5wdXQgPSB5aWVsZCBjYW5jZWxFdmVudDtcclxuICAgICAgaWYoaW5wdXQuaW5wdXRDb21tYW5kLmlkID09PSBJbnB1dENvbW1hbmRzLnNlbGVjdC5pZClcclxuICAgICAge1xyXG4gICAgICAgIHlpZWxkKiBkb1NlbGVjdCgpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxldCBmbiA9IGVkaXRGdW5jc1tpbnB1dC5pbnB1dENvbW1hbmQuaWRdO1xyXG4gICAgICAgIGlmIChmbikge1xyXG4gICAgICAgICAgZm4oaW5wdXQpO1xyXG4gICAgICAgICAgaWYgKG5lZWREcmF3KSB7XHJcbiAgICAgICAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgICAgICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICAgICAgICAgIG5lZWREcmF3ID0gZmFsc2U7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGNhbmNlbEV2ZW50ID0gZmFsc2U7XHJcbiAvLyAgICAgICAgIGNvbnNvbGUubG9nKCdkZWZhdWx0Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgKiBhcyBFbmVtaWVzIGZyb20gJy4uLy4uL2pzL2VuZW1pZXMnO1xyXG5pbXBvcnQgeyBVbmRvTWFuYWdlciB9IGZyb20gJy4vdW5kbyc7IFxyXG5cclxuY2xhc3MgSW5wdXRDb21tYW5ke1xyXG4gIGNvbnN0cnVjdG9yKGlkLG5hbWUsZGVzYylcclxuICB7XHJcbiAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgdGhpcy5kZXNjID0gZGVzYztcclxuICB9XHJcbiAgdG9KU09OKCl7XHJcbiAgICByZXR1cm4gdGhpcy5uYW1lO1xyXG4gIH1cclxufTtcclxuXHJcbmNvbnN0IElucHV0Q29tbWFuZHMgPVxyXG57XHJcbiAgZW50ZXI6IG5ldyBJbnB1dENvbW1hbmQoMSwnZW50ZXInLCfmjL/lhaUnKSxcclxuICBlc2M6IG5ldyBJbnB1dENvbW1hbmQoMiwnZXNjJywn44Kt44Oj44Oz44K744OrJyksXHJcbiAgcmlnaHQ6IG5ldyBJbnB1dENvbW1hbmQoMywncmlnaHQnLCfjgqvjg7zjgr3jg6vnp7vli5XvvIjlj7PvvIknKSxcclxuICBsZWZ0OiBuZXcgSW5wdXRDb21tYW5kKDQsJ2xlZnQnLCfjgqvjg7zjgr3jg6vnp7vli5XvvIjlt6bvvIknKSxcclxuICB1cDogbmV3IElucHV0Q29tbWFuZCg1LCd1cCcsJ+OCq+ODvOOCveODq+enu+WLle+8iOS4iu+8iScpLFxyXG4gIGRvd246IG5ldyBJbnB1dENvbW1hbmQoNiwnZG93bicsJ+OCq+ODvOOCveODq+enu+WLle+8iOS4i++8iScpLFxyXG4gIHVuZG86IG5ldyBJbnB1dENvbW1hbmQoOCwndW5kbycsJ+OCouODs+ODieOCpScpLFxyXG4gIHJlZG86IG5ldyBJbnB1dENvbW1hbmQoOSwncmVkbycsJ+ODquODieOCpScpLFxyXG4gIHBhZ2VVcDogbmV3IElucHV0Q29tbWFuZCgxMCwncGFnZVVwJywn44Oa44O844K444Ki44OD44OXJyksXHJcbiAgcGFnZURvd246IG5ldyBJbnB1dENvbW1hbmQoMTEsJ3BhZ2VEb3duJywn44Oa44O844K444OA44Km44OzJyksXHJcbiAgaG9tZTogbmV3IElucHV0Q29tbWFuZCgxMiwnaG9tZScsJ+WFiOmgreihjOOBq+enu+WLlScpLFxyXG4gIGVuZDogbmV3IElucHV0Q29tbWFuZCgxMywnZW5kJywn57WC56uv6KGM44Gr56e75YuVJyksXHJcbiAgc2Nyb2xsVXA6IG5ldyBJbnB1dENvbW1hbmQoMTYsJ3Njcm9sbFVwJywn6auY6YCf44K544Kv44Ot44O844Or44Ki44OD44OXJyksXHJcbiAgc2Nyb2xsRG93bjogbmV3IElucHV0Q29tbWFuZCgxNywnc2Nyb2xsRG93bicsJ+mrmOmAn+OCueOCr+ODreODvOODq+ODgOOCpuODsycpLFxyXG4gIGRlbGV0ZTogbmV3IElucHV0Q29tbWFuZCgxOCwnZGVsZXRlJywn6KGM5YmK6ZmkJyksXHJcbiAgbGluZVBhc3RlOiBuZXcgSW5wdXRDb21tYW5kKDE5LCdsaW5lUGFzdGUnLCfooYzjg5rjg7zjgrnjg4gnKSxcclxuICBtZWFzdXJlQmVmb3JlOiBuZXcgSW5wdXRDb21tYW5kKDIwLCdtZWFzdXJlQmVmb3JlJywn5bCP56+A5Y2Y5L2N44Gu5LiK56e75YuVJyksXHJcbiAgbWVhc3VyZU5leHQ6IG5ldyBJbnB1dENvbW1hbmQoMjEsJ21lYXN1cmVOZXh0Jywn5bCP56+A5Y2Y5L2N44Gu5LiL56e75YuVJyksXHJcbiAgc2VsZWN0Om5ldyBJbnB1dENvbW1hbmQoMjIsJ3NlbGVjdCcsJ+mBuOaKnuOBrumWi+Wni+ODu+e1guS6hicpLFxyXG4gIGN1dEV2ZW50Om5ldyBJbnB1dENvbW1hbmQoMjMsJ2N1dEV2ZW50Jywn44Kk44OZ44Oz44OI44Kr44OD44OIJyksXHJcbiAgY29weUV2ZW50Om5ldyBJbnB1dENvbW1hbmQoMjQsJ2NvcHlFdmVudCcsJ+OCpOODmeODs+ODiOOCs+ODlOODvCcpLFxyXG4gIHBhc3RlRXZlbnQ6bmV3IElucHV0Q29tbWFuZCgyNSwncGFzdGVFdmVudCcsJ+OCpOODmeODs+ODiOODmuODvOOCueODiCcpXHJcbn07XHJcblxyXG4vL1xyXG5jb25zdCBrZXlCaW5kcyA9XHJcbiAge1xyXG4gICAgMTM6IFt7XHJcbiAgICAgIGtleUNvZGU6IDEzLFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLmVudGVyXHJcbiAgICB9XSxcclxuICAgIDI3OiBbe1xyXG4gICAgICBrZXlDb2RlOiAyNyxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kcy5lc2NcclxuICAgIH1dLFxyXG4gICAgMzI6IFt7XHJcbiAgICAgIGtleUNvZGU6IDMyLFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLnJpZ2h0XHJcbiAgICB9XSxcclxuICAgIDM5OiBbe1xyXG4gICAgICBrZXlDb2RlOiAzOSxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kcy5yaWdodFxyXG4gICAgfV0sXHJcbiAgICAzNzogW3tcclxuICAgICAga2V5Q29kZTogMzcsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZHMubGVmdFxyXG4gICAgfV0sXHJcbiAgICAzODogW3tcclxuICAgICAga2V5Q29kZTogMzgsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZHMudXBcclxuICAgIH1dLFxyXG4gICAgNDA6IFt7XHJcbiAgICAgIGtleUNvZGU6IDQwLFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLmRvd25cclxuICAgIH1dLFxyXG4gICAgMTA2OiBbe1xyXG4gICAgICBrZXlDb2RlOiAxMDYsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZHMuaW5zZXJ0TWVhc3VyZVxyXG4gICAgfV0sXHJcbiAgICA5MDogW3tcclxuICAgICAga2V5Q29kZTogOTAsXHJcbiAgICAgIGN0cmxLZXk6IHRydWUsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kcy51bmRvXHJcbiAgICB9XSxcclxuICAgIDMzOiBbe1xyXG4gICAgICBrZXlDb2RlOiAzMyxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kcy5wYWdlVXBcclxuICAgICAgfSx7XHJcbiAgICAgICAga2V5Q29kZTogMzMsXHJcbiAgICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgICAgc2hpZnRLZXk6IHRydWUsXHJcbiAgICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZHMuc2Nyb2xsVXBcclxuICAgICAgfSx7XHJcbiAgICAgIGtleUNvZGU6IDMzLFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IHRydWUsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZHMubWVhc3VyZUJlZm9yZVxyXG4gICAgICB9ICAgICAgXSxcclxuICAgIC8vIDgyOiBbe1xyXG4gICAgLy8gICBrZXlDb2RlOiA4MixcclxuICAgIC8vICAgY3RybEtleTogdHJ1ZSxcclxuICAgIC8vICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgLy8gICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgLy8gICBtZXRhS2V5OiBmYWxzZSxcclxuICAgIC8vICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLnBhZ2VVcFxyXG4gICAgLy8gfV0sXHJcbiAgICAzNDogW3sgLy8gUGFnZSBEb3duIFxyXG4gICAgICBrZXlDb2RlOiAzNCxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kcy5wYWdlRG93blxyXG4gICAgfSwge1xyXG4gICAgICAgIGtleUNvZGU6IDM0LFxyXG4gICAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICAgIHNoaWZ0S2V5OiB0cnVlLFxyXG4gICAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLnNjcm9sbERvd25cclxuICAgICAgfV0sXHJcbiAgICAzNjogW3tcclxuICAgICAga2V5Q29kZTogMzYsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZHMuaG9tZVxyXG4gICAgfV0sXHJcbiAgICAzNTogW3tcclxuICAgICAga2V5Q29kZTogMzUsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZHMuZW5kXHJcbiAgICB9XSxcclxuICAgIDg5OiBbe1xyXG4gICAgICBrZXlDb2RlOiA4OSxcclxuICAgICAgY3RybEtleTogdHJ1ZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLmRlbGV0ZVxyXG4gICAgfV0sXHJcbiAgICA3NjogW3tcclxuICAgICAga2V5Q29kZTogNzYsXHJcbiAgICAgIGN0cmxLZXk6IHRydWUsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kcy5saW5lUGFzdGVcclxuICAgIH1dLFxyXG4gICAgMTE3OlsvLyBGNlxyXG4gICAgICB7XHJcbiAgICAgIGtleUNvZGU6IDExNyxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kcy5zZWxlY3RcclxuICAgICAgfVxyXG4gICAgXSxcclxuICAgIDExODpbLy8gRjdcclxuICAgICAge1xyXG4gICAgICBrZXlDb2RlOiAxMTgsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZHMuY3V0RXZlbnRcclxuICAgICAgfVxyXG4gICAgXSxcclxuICAgIDExOTpbLy8gRjhcclxuICAgICAge1xyXG4gICAgICBrZXlDb2RlOiAxMTksXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZHMuY29weUV2ZW50XHJcbiAgICAgIH1cclxuICAgIF0sXHJcbiAgICAxMjA6Wy8vIEY5XHJcbiAgICAgIHtcclxuICAgICAga2V5Q29kZTogMTIwLFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmRzLnBhc3RlRXZlbnRcclxuICAgICAgfVxyXG4gICAgXVxyXG4gIH07XHJcblxyXG5leHBvcnQgY2xhc3MgRW5lbXlNb3ZTZXFFZGl0b3Ige1xyXG4gIGNvbnN0cnVjdG9yKGVuZW15RWRpdG9yLHBhdHRlcm5Obykge1xyXG4gICAgdGhpcy51bmRvTWFuYWdlciA9IG5ldyBVbmRvTWFuYWdlcigpO1xyXG4gICAgdGhpcy5lbmVteUVkaXRvciA9IGVuZW15RWRpdG9yO1xyXG4gICAgdGhpcy5saW5lQnVmZmVyID0gbnVsbDtcclxuICAgIHRoaXMuZGVidWdVaSA9IGVuZW15RWRpdG9yLmRldlRvb2wuZGVidWdVaTtcclxuICAgIHRoaXMuZWRpdG9yVWkgPSBlbmVteUVkaXRvci51aS5hcHBlbmQoJ2RpdicpLmNsYXNzZWQoJ21vdnNlcS1lZGl0b3InLCB0cnVlKTtcclxuICAgIHRoaXMuZXZlbnRFZGl0ID0gdGhpcy5lZGl0b3JVaS5hcHBlbmQoJ3RhYmxlJykuYXR0cigndGFiaW5kZXgnLDApO1xyXG4gICAgdGhpcy5oZWFkcm93ID0gdGhpcy5ldmVudEVkaXQuYXBwZW5kKCd0aGVhZCcpLmFwcGVuZCgndHInKTtcclxuICAgIHRoaXMuaGVhZHJvdy5hcHBlbmQoJ3RoJykudGV4dCgnTm8nKTtcclxuICAgIHRoaXMuaGVhZHJvdy5hcHBlbmQoJ3RoJykudGV4dCgnQ29tbWFuZCcpO1xyXG4gICAgdGhpcy5oZWFkcm93LmFwcGVuZCgndGgnKS50ZXh0KCdwYXJhbScpO1xyXG4gICAgXHJcbiAgICB0aGlzLmV2ZW50Qm9keSA9IHRoaXMuZXZlbnRFZGl0LmFwcGVuZCgndGJvZHknKS5hdHRyKCdpZCcsICdzZXFldmVudHMnKTtcclxuICAgIHRoaXMucGF0dGVybk5vID0gcGF0dGVybk5vO1xyXG4gIH1cclxuXHJcbiAgc2V0IHBhdHRlcm5Obyh2KSBcclxuICB7XHJcbiAgICBpZih2ID09IHRoaXMucGF0dGVybk5vXykgcmV0dXJuO1xyXG4gICAgbGV0IHRoaXNfID0gdGhpcztcclxuICAgIHRoaXMucGF0dGVybk5vXyA9IHY7XHJcbiAgICB0aGlzLmVkaXRvciAmJiB0aGlzLmVkaXRvci5yZXR1cm4oMCk7XHJcbiAgICB0aGlzLmV2ZW50Qm9keS5kYXR1bSh0aGlzLmVuZW15RWRpdG9yLmRldlRvb2wuZ2FtZS5lbmVtaWVzLm1vdmVQYXR0ZXJuc1t2XSk7XHJcbiAgICB0aGlzLmVkaXRvciA9IGRvRWRpdG9yKHRoaXMuZXZlbnRCb2R5LHRoaXMpO1xyXG4gICAgdGhpcy5lZGl0b3IubmV4dCgpO1xyXG5cclxuICAgIC8vIOOCreODvOWFpeWKm+ODj+ODs+ODieODqVxyXG4gICAgdGhpcy5ldmVudEVkaXQub24oJ2tleWRvd24nLCBmdW5jdGlvbiAoZCkge1xyXG4gICAgICBsZXQgZSA9IGQzLmV2ZW50O1xyXG4gIC8vICAgIGNvbnNvbGUubG9nKGUua2V5Q29kZSk7XHJcbiAgICAgIGxldCBrZXkgPSBrZXlCaW5kc1tlLmtleUNvZGVdO1xyXG4gICAgICBsZXQgcmV0ID0ge307XHJcbiAgICAgIGlmIChrZXkpIHtcclxuICAgICAgICBrZXkuc29tZSgoZCkgPT4ge1xyXG4gICAgICAgICAgaWYgKGQuY3RybEtleSA9PSBlLmN0cmxLZXlcclxuICAgICAgICAgICAgJiYgZC5zaGlmdEtleSA9PSBlLnNoaWZ0S2V5XHJcbiAgICAgICAgICAgICYmIGQuYWx0S2V5ID09IGUuYWx0S2V5XHJcbiAgICAgICAgICAgICYmIGQubWV0YUtleSA9PSBlLm1ldGFLZXlcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldCA9IHRoaXNfLmVkaXRvci5uZXh0KGQpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAocmV0LnZhbHVlKSB7XHJcbiAgICAgICAgICBkMy5ldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgZDMuZXZlbnQuY2FuY2VsQnViYmxlID0gdHJ1ZTtcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuLy8g44Ko44OH44Kj44K/5pys5L2TXHJcbmZ1bmN0aW9uKiBkb0VkaXRvcihldmVudEVkaXQsIGZvcm1FZGl0b3IpIHtcclxuICBsZXQga2V5Y29kZSA9IDA7Ly8g5YWl5Yqb44GV44KM44Gf44Kt44O844Kz44O844OJ44KS5L+d5oyB44GZ44KL5aSJ5pWwXHJcbiAgbGV0IGV2ZW50cyA9IGV2ZW50RWRpdC5kYXR1bSgpOy8vIOePvuWcqOe3qOmbhuS4reOBruODiOODqeODg+OCr1xyXG4gIGxldCBlZGl0VmlldyA9IGQzLnNlbGVjdCgnI3NlcWV2ZW50cycpOy8v57eo6ZuG55S76Z2i44Gu44K744Os44Kv44K344On44OzXHJcbiAgbGV0IHJvd0luZGV4ID0gMDsvLyDnt6jpm4bnlLvpnaLjga7nj77lnKjooYxcclxuICBsZXQgY3VycmVudEV2ZW50SW5kZXggPSAwOy8vIOOCpOODmeODs+ODiOmFjeWIl+OBrue3qOmbhumWi+Wni+ihjFxyXG4gIGxldCBjZWxsSW5kZXggPSAwOy8vIOWIl+OCpOODs+ODh+ODg+OCr+OCuVxyXG4gIGxldCBjYW5jZWxFdmVudCA9IGZhbHNlOy8vIOOCpOODmeODs+ODiOOCkuOCreODo+ODs+OCu+ODq+OBmeOCi+OBi+OBqeOBhuOBi1xyXG4gIGNvbnN0IE5VTV9ST1cgPSAxMDsvLyDvvJHnlLvpnaLjga7ooYzmlbBcclxuICBsZXQgc2VsZWN0U3RhcnRJbmRleCA9IG51bGw7XHJcbiAgbGV0IHNlbGVjdEVuZEluZGV4ID0gbnVsbDtcclxuICBsZXQgbmVlZERyYXcgPSBmYWxzZTtcclxuICBsZXQgZyA9IGZvcm1FZGl0b3IuZW5lbXlFZGl0b3IuZGV2VG9vbC5nYW1lO1xyXG4gIFxyXG4gIC8vaWYoIWcudGFza3MuZW5hYmxlKXtcclxuICAvLyAgZy50YXNrcy5lbmFibGUgPSB0cnVlO1xyXG4vLyAgICBnLnRhc2tzLmNsZWFyKCk7XHJcbi8vICAgIGcudGFza3MucHVzaFRhc2soZy5yZW5kZXIuYmluZChnKSwgZy5SRU5ERVJFUl9QUklPUklUWSk7XHJcbi8vICAgIGcuc2hvd1NwYWNlRmllbGQoKTtcclxuIC8vICAgZy5lbmVtaWVzLnJlc2V0KCk7XHJcbiAvLy8vIH1cclxuXHJcbiAgLy9nLnRhc2tzLnByb2Nlc3MoZyk7XHJcbiAgXHJcbiAgZnVuY3Rpb24gc2V0SW5wdXQoKSB7XHJcbiAgICBsZXQgdGhpc18gPSB0aGlzO1xyXG4gICAgdGhpcy5hdHRyKCdjb250ZW50RWRpdGFibGUnLGZ1bmN0aW9uKGQsaSl7XHJcbi8vICAgICAgaWYoaSAhPSAwKXtcclxuICAgICAgICByZXR1cm4gJ3RydWUnICAgICAgICBcclxuLy8gICAgICB9IGVsc2Uge1xyXG4vLyAgICAgICAgcmV0dXJuICdmYWxzZSc7XHJcbi8vICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5vbignZm9jdXMnLCBmdW5jdGlvbiAoKSB7XHJcbiAgIC8vICAgY29uc29sZS5sb2codGhpcy5wYXJlbnROb2RlLnJvd0luZGV4IC0gMSk7XHJcbiAgICAgIHJvd0luZGV4ID0gdGhpcy5wYXJlbnROb2RlLnJvd0luZGV4IC0gMTtcclxuICAgICAgY2VsbEluZGV4ID0gdGhpcy5jZWxsSW5kZXg7XHJcbiAgICAgIC8vZy5lbmVtaWVzLnJlc2V0KCk7XHJcbiAgICAgIGxldCBpbmRleCA9IHBhcnNlSW50KHRoaXNfLmF0dHIoJ2RhdGEtcm93LWluZGV4JykpO1xyXG4gICAgICAvL2Zvcm1FZGl0b3IuZW5lbXlFZGl0b3IuZGV2VG9vbC5nYW1lLmVuZW1pZXMuc3RhcnRFbmVteUluZGV4ZWQoZXZlbnRzW2luZGV4XSxpbmRleCk7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgXHJcbiAgZnVuY3Rpb24gc2V0Qmx1cigpe1xyXG4gICAgbGV0IHRoaXNfID0gdGhpczsgXHJcbiAgICBsZXQgZGF0YSA9IHRoaXMuZGF0YSgpO1xyXG4gICAgIHRoaXMub24oJ2JsdXInLGZ1bmN0aW9uKGQsaSl7XHJcbiAgICAgICBpZihuZWVkRHJhdykgcmV0dXJuO1xyXG4gICAgICAgIC8vZXZlbnRzW3BhcnNlSW50KHRoaXNfLmF0dHIoJ2RhdGEtcm93LWluZGV4JykpXTtcclxuICAgICAgICAvL2lmKHRoaXNfLmF0dHIoJ2RhdGEtcm93LWluZGV4Jykpe1xyXG4gICAgICAgICAgbGV0IGFycmF5O1xyXG4vLyAgICAgICAgICBsZXQgZGF0YSA9IHRoaXNfLmRhdGEoKTtcclxuICAgICAgICAgIGlmKGkgPT0gMil7XHJcbiAgICAgICAgICAgIGRhdGFbMl0gPSB0aGlzLmlubmVyVGV4dDtcclxuICAgICAgICAgICAgYXJyYXkgPSBbZGF0YVsxXV0uY29uY2F0KEpTT04ucGFyc2UoYFske3RoaXMuaW5uZXJUZXh0fV1gKSk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBkYXRhWzFdID0gdGhpcy5pbm5lclRleHQ7XHJcbiAgICAgICAgICAgIGFycmF5ID0gW3RoaXMuaW5uZXJUZXh0XS5jb25jYXQoSlNPTi5wYXJzZShgWyR7ZGF0YVsyXX1dYCkpOyAgICAgICAgICAgICAgICBcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGV2ZW50c1twYXJzZUludCh0aGlzXy5hdHRyKCdkYXRhLXJvdy1pbmRleCcpKV0gPSBmb3JtRWRpdG9yLmVuZW15RWRpdG9yLmRldlRvb2wuZ2FtZS5lbmVtaWVzLmNyZWF0ZU1vdmVQYXR0ZXJuRnJvbUFycmF5KGFycmF5KTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXNfLGQsaSxkYXRhLGV2ZW50cyk7XHJcbiAgICAgICAgICAvL25lZWREcmF3ID0gdHJ1ZTtcclxuICAgICAgIC8vIH1cclxuICAgICAgfSk7XHJcbiAgfVxyXG4gIFxyXG4gIFxyXG4gIC8vIOaXouWtmOOCpOODmeODs+ODiOOBruihqOekulxyXG4gIGZ1bmN0aW9uIGRyYXdFdmVudCgpIFxyXG4gIHtcclxuICAgIGxldCBzdGkgPSBudWxsLHNlaSA9IG51bGw7XHJcbiAgICBpZihzZWxlY3RTdGFydEluZGV4ICE9IG51bGwgJiYgc2VsZWN0RW5kSW5kZXggIT0gbnVsbCl7XHJcbiAgICAgICAgaWYoY3VycmVudEV2ZW50SW5kZXggPD0gc2VsZWN0U3RhcnRJbmRleCl7XHJcbiAgICAgICAgICBzdGkgPSBzZWxlY3RTdGFydEluZGV4IC0gY3VycmVudEV2ZW50SW5kZXg7XHJcbiAgICAgICAgICBpZigoY3VycmVudEV2ZW50SW5kZXggKyBOVU1fUk9XKSA+PSBzZWxlY3RFbmRJbmRleClcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc2VpID0gc2VsZWN0RW5kSW5kZXggLSBjdXJyZW50RXZlbnRJbmRleDsgXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzZWkgPSBOVU1fUk9XIC0gMTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICBzdGkgPSAwO1xyXG4gICAgICAgICAgaWYoKGN1cnJlbnRFdmVudEluZGV4ICsgTlVNX1JPVykgPj0gc2VsZWN0RW5kSW5kZXgpXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNlaSA9IHNlbGVjdEVuZEluZGV4IC0gY3VycmVudEV2ZW50SW5kZXg7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzZWkgPSBOVU1fUk9XIC0gMTsgICAgICAgICAgXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBldmZsYWdtZW50ID0gXHJcbiAgICAgIGV2ZW50cy5zbGljZShjdXJyZW50RXZlbnRJbmRleCwgTWF0aC5taW4oY3VycmVudEV2ZW50SW5kZXggKyBOVU1fUk9XLGV2ZW50cy5sZW5ndGgpKS5tYXAoKGQsaSk9PntcclxuICAgICAgICBsZXQgYXJyYXkgPSAgZC50b0pTT04oKTtcclxuICAgICAgICBpZihhcnJheS5sZW5ndGggPT0gMSl7XHJcbiAgICAgICAgICByZXR1cm4gW2kgKyBjdXJyZW50RXZlbnRJbmRleCxhcnJheVswXSwnJ107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBbaSArIGN1cnJlbnRFdmVudEluZGV4LGFycmF5WzBdLGFycmF5LnNsaWNlKDEpLmpvaW4oJywnKV07XHJcbiAgICAgIH0pO1xyXG4gICAgXHJcbiAgICBlZGl0Vmlldy5zZWxlY3RBbGwoJ3RyJykucmVtb3ZlKCk7XHJcbiAgICBsZXQgc2VsZWN0ID0gZWRpdFZpZXcuc2VsZWN0QWxsKCd0cicpLmRhdGEoZXZmbGFnbWVudCk7XHJcbiAgICBsZXQgZW50ZXIgPSBzZWxlY3QuZW50ZXIoKTtcclxuICAgIGxldCByb3dzID0gZW50ZXIuYXBwZW5kKCd0cicpLmF0dHIoJ2RhdGEtaW5kZXgnLCAoZCwgaSkgPT4gaSk7XHJcbiAgICBpZihzdGkgIT0gbnVsbCAmJiBzZWkgIT0gbnVsbCl7XHJcbiAgICAgIHJvd3MuZWFjaChmdW5jdGlvbihkLGkpe1xyXG4gICAgICAgIGlmKGkgPj0gc3RpICYmIGkgPD0gc2VpKXtcclxuICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKS5jbGFzc2VkKCdzZWxlY3RlZCcsdHJ1ZSk7ICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcm93cy5lYWNoKGZ1bmN0aW9uIChkLCBpKSB7XHJcbiAgICAgIGxldCByb3cgPSBkMy5zZWxlY3QodGhpcyk7XHJcbiBcclxuICAgICAgIHJvdy5zZWxlY3RBbGwoJ3RkJylcclxuICAgICAgLmRhdGEoZClcclxuICAgICAgLmVudGVyKClcclxuICAgICAgLmFwcGVuZCgndGQnKVxyXG4gICAgICAuYXR0cignZGF0YS1yb3ctaW5kZXgnLGkgKyBjdXJyZW50RXZlbnRJbmRleCkgICAgICBcclxuICAgICAgLnRleHQoKGQpPT5kKVxyXG4gICAgICAuY2FsbChzZXRJbnB1dClcclxuICAgICAgLmNhbGwoc2V0Qmx1cik7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAocm93SW5kZXggPiAoZXZmbGFnbWVudC5sZW5ndGggLSAxKSkge1xyXG4gICAgICByb3dJbmRleCA9IGV2ZmxhZ21lbnQubGVuZ3RoIC0gMTtcclxuICAgIH1cclxuXHJcbiAgfVxyXG5cdFxyXG4gIC8vIOOCpOODmeODs+ODiOOBruODleOCqeODvOOCq+OCuVxyXG4gIGZ1bmN0aW9uIGZvY3VzRXZlbnQoKSB7XHJcbiAgICBpZighZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdLmNlbGxzW2NlbGxJbmRleF0pe1xyXG4gICAgICBkZWJ1Z2dlcjtcclxuICAgIH1cclxuICAgIGVkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XS5jZWxsc1tjZWxsSW5kZXhdLmZvY3VzKCk7XHJcbiAgfVxyXG5cdFxyXG4gIC8vIOOCpOODmeODs+ODiOOBruaMv+WFpVxyXG4gIGZ1bmN0aW9uIGluc2VydEV2ZW50KHJvd0luZGV4KSB7XHJcbiAgICBmb3JtRWRpdG9yLnVuZG9NYW5hZ2VyLmV4ZWMoe1xyXG4gICAgICBleGVjKCkge1xyXG4gICAgICAgIHRoaXMucm93ID0gZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdO1xyXG4gICAgICAgIHRoaXMuY2VsbEluZGV4ID0gY2VsbEluZGV4O1xyXG4gICAgICAgIHRoaXMucm93SW5kZXggPSByb3dJbmRleDtcclxuICAgICAgICB0aGlzLmN1cnJlbnRFdmV0SW5kZXggPSBjdXJyZW50RXZlbnRJbmRleDtcclxuICAgICAgICB0aGlzLmV4ZWNfKCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIGV4ZWNfKCkge1xyXG4gICAgICAgIHZhciByb3cgPSBkMy5zZWxlY3QoZWRpdFZpZXcubm9kZSgpLmluc2VydFJvdyh0aGlzLnJvd0luZGV4KSk7XHJcbiAgICAgICAgdmFyIGNvbHMgPSAgcm93LnNlbGVjdEFsbCgndGQnKS5kYXRhKFt0aGlzLnJvd0luZGV4ICsgY3VycmVudEV2ZW50SW5kZXgsJ0xpbmVNb3ZlJywnMCwwLDAnXSk7XHJcblxyXG4gICAgICAgIGNlbGxJbmRleCA9IDA7XHJcbiAgICAgICAgY29scy5lbnRlcigpLmFwcGVuZCgndGQnKVxyXG4gICAgICAgIC5jYWxsKHNldElucHV0KVxyXG4gICAgICAgIC5jYWxsKHNldEJsdXIpXHJcbiAgICAgICAgLmF0dHIoJ2RhdGEtcm93LWluZGV4Jyx0aGlzLnJvd0luZGV4ICsgY3VycmVudEV2ZW50SW5kZXgpXHJcbiAgICAgICAgLnRleHQoZD0+ZCk7XHJcblxyXG4gICAgICAgIHJvdy5ub2RlKCkuY2VsbHNbdGhpcy5jZWxsSW5kZXhdLmZvY3VzKCk7XHJcbiAgICAgICAgcm93LmF0dHIoJ2RhdGEtbmV3JywgdHJ1ZSk7XHJcbiAgICAgICAgLy9uZWVkRHJhdyA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICAgIHJlZG8oKSB7XHJcbiAgICAgICAgdGhpcy5leGVjXygpO1xyXG4gICAgICB9LFxyXG4gICAgICB1bmRvKCkge1xyXG4gICAgICAgIGVkaXRWaWV3Lm5vZGUoKS5kZWxldGVSb3codGhpcy5yb3dJbmRleCk7XHJcbiAgICAgICAgdGhpcy5yb3cuY2VsbHNbdGhpcy5jZWxsSW5kZXhdLmZvY3VzKCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuICBcclxuICAvLyDmlrDopo/lhaXlipvooYzjga7norrlrppcclxuICBmdW5jdGlvbiBlbmROZXdJbnB1dChkb3duID0gdHJ1ZSkge1xyXG4gICAgZDMuc2VsZWN0KGVkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XSkuYXR0cignZGF0YS1uZXcnLCBudWxsKTtcclxuICAgIC8vIOePvuWcqOOBrue3qOmbhuihjFxyXG4gICAgLy9sZXQgY3VyUm93ID0gZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdLmNlbGxzO1xyXG4gICAgLy9sZXQgZXYgPSBkMy5zZWxlY3QoZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdKS5zZWxlY3RBbGwoJ3RkJykuZGF0YSgpO1xyXG4gICAgbGV0IGV2ID0gW2VkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XS5jZWxsc1sxXS5pbm5lclRleHRdXHJcbiAgICAgIC5jb25jYXQoSlNPTi5wYXJzZShgWyR7ZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdLmNlbGxzWzJdLmlubmVyVGV4dH1dYCkpO1xyXG4vLyAgICBldiA9IFtldlsxXV0uY29uY2F0KEpTT04ucGFyc2UoYFske2V2WzJdfV1gKSk7IFxyXG4gICAgZXYgPSBmb3JtRWRpdG9yLmVuZW15RWRpdG9yLmRldlRvb2wuZ2FtZS5lbmVtaWVzLmNyZWF0ZU1vdmVQYXR0ZXJuRnJvbUFycmF5KGV2KTtcclxuICAgIGZvcm1FZGl0b3IudW5kb01hbmFnZXIuZXhlYyh7XHJcbiAgICAgIGV4ZWMoKXtcclxuICAgICAgICB0aGlzLnN0YXJ0SW5kZXggPSByb3dJbmRleCArIGN1cnJlbnRFdmVudEluZGV4O1xyXG4gICAgICAgIHRoaXMuZXYgPSBldjtcclxuICAgICAgICB0aGlzLmNvdW50ID0gZXYubGVuZ3RoO1xyXG4gICAgICAgIHRoaXMuZW50ZXIoKTtcclxuICAgICAgfSxcclxuICAgICAgZW50ZXIoKXtcclxuICAgICAgICBldmVudHMuc3BsaWNlKHRoaXMuc3RhcnRJbmRleCwwLHRoaXMuZXYpO1xyXG4gICAgICB9LFxyXG4gICAgICByZWRvKCl7XHJcbiAgICAgICAgdGhpcy5lbnRlcigpO1xyXG4gICAgICB9LFxyXG4gICAgICB1bmRvKCl7XHJcbiAgICAgICAgZXZlbnRzLnNwbGljZSh0aGlzLnN0YXJ0SW5kZXgsdGhpcy5jb3VudCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICBpZiAoZG93bikge1xyXG4gICAgICBpZiAocm93SW5kZXggPT0gKE5VTV9ST1cgLSAxKSkge1xyXG4gICAgICAgICsrY3VycmVudEV2ZW50SW5kZXg7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgKytyb3dJbmRleDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8g5oy/5YWl5b6M44CB5YaN5o+P55S7XHJcbiAgICBuZWVkRHJhdyA9IHRydWU7XHJcbiAgfVxyXG4gIFxyXG4gIGZ1bmN0aW9uIGFkZFJvdyhkZWx0YSlcclxuICB7XHJcbiAgICByb3dJbmRleCArPSBkZWx0YTtcclxuICAgIGxldCByb3dMZW5ndGggPSBlZGl0Vmlldy5ub2RlKCkucm93cy5sZW5ndGg7XHJcbiAgICBpZihyb3dJbmRleCA+PSByb3dMZW5ndGgpe1xyXG4gICAgICBsZXQgZCA9IHJvd0luZGV4IC0gcm93TGVuZ3RoICsgMTtcclxuICAgICAgcm93SW5kZXggPSByb3dMZW5ndGggLSAxO1xyXG4gICAgICBpZigoY3VycmVudEV2ZW50SW5kZXggKyBOVU1fUk9XIC0xKSA8IChldmVudHMubGVuZ3RoIC0gMSkpe1xyXG4gICAgICAgIGN1cnJlbnRFdmVudEluZGV4ICs9IGQ7XHJcbiAgICAgICAgaWYoKGN1cnJlbnRFdmVudEluZGV4ICsgTlVNX1JPVyAtMSkgPiAoZXZlbnRzLmxlbmd0aCAtIDEpKXtcclxuICAgICAgICAgIGN1cnJlbnRFdmVudEluZGV4ID0gKGV2ZW50cy5sZW5ndGggLSBOVU1fUk9XICsgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIG5lZWREcmF3ID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIGlmKHJvd0luZGV4IDwgMCl7XHJcbiAgICAgIGxldCBkID0gcm93SW5kZXg7XHJcbiAgICAgIHJvd0luZGV4ID0gMDtcclxuICAgICAgaWYoY3VycmVudEV2ZW50SW5kZXggIT0gMCl7XHJcbiAgICAgICAgY3VycmVudEV2ZW50SW5kZXggKz0gZDtcclxuICAgICAgICBpZihjdXJyZW50RXZlbnRJbmRleCA8IDApe1xyXG4gICAgICAgICAgY3VycmVudEV2ZW50SW5kZXggPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBuZWVkRHJhdyA9IHRydWU7XHJcbiAgICAgIH0gXHJcbiAgICB9XHJcbiAgICBmb2N1c0V2ZW50KCk7XHJcbiAgfVxyXG4gIFxyXG4gIC8vIOOCqOODs+OCv+ODvFxyXG4gIGZ1bmN0aW9uIGRvRW50ZXIoKXtcclxuICAgIC8vY29uc29sZS5sb2coJ0NSL0xGJyk7XHJcbiAgICAvLyDnj77lnKjjga7ooYzjgYzmlrDopo/jgYvnt6jpm4bkuK3jgYtcclxuICAgIGxldCBmbGFnID0gZDMuc2VsZWN0KGVkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XSkuYXR0cignZGF0YS1uZXcnKTtcclxuICAgIGlmIChmbGFnKSB7XHJcbiAgICAgIGVuZE5ld0lucHV0KCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvL+aWsOimj+e3qOmbhuS4reOBruihjOOBp+OBquOBkeOCjOOBsOOAgeaWsOimj+WFpeWKm+eUqOihjOOCkuaMv+WFpVxyXG4gICAgICBpbnNlcnRFdmVudChyb3dJbmRleCk7XHJcbiAgICB9XHJcbiAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgfVxyXG4gIFxyXG4gIC8vIOWPs+enu+WLlVxyXG4gIGZ1bmN0aW9uIGRvUmlnaHQoKXtcclxuICAgIGNlbGxJbmRleCsrO1xyXG4gICAgbGV0IGN1clJvdyA9IGVkaXRWaWV3Lm5vZGUoKS5yb3dzO1xyXG4gICAgaWYgKGNlbGxJbmRleCA+IChjdXJSb3dbcm93SW5kZXhdLmNlbGxzLmxlbmd0aCAtIDEpKSB7XHJcbiAgICAgIGNlbGxJbmRleCA9IDE7XHJcbiAgICAgIGlmIChyb3dJbmRleCA8IChjdXJSb3cubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgICBpZiAoZDMuc2VsZWN0KGN1clJvd1tyb3dJbmRleF0pLmF0dHIoJ2RhdGEtbmV3JykpIHtcclxuICAgICAgICAgIGVuZE5ld0lucHV0KCk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGFkZFJvdygxKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGZvY3VzRXZlbnQoKTtcclxuICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8vIOW3puOCq+ODvOOCveODqyBcclxuICBmdW5jdGlvbiBkb0xlZnQoKSB7XHJcbiAgICBsZXQgY3VyUm93ID0gZWRpdFZpZXcubm9kZSgpLnJvd3M7XHJcbiAgICAtLWNlbGxJbmRleDtcclxuICAgIGlmIChjZWxsSW5kZXggPCAxKSB7XHJcbiAgICAgIGlmIChyb3dJbmRleCAhPSAwKSB7XHJcbiAgICAgICAgaWYgKGQzLnNlbGVjdChjdXJSb3dbcm93SW5kZXhdKS5hdHRyKCdkYXRhLW5ldycpKSB7XHJcbiAgICAgICAgICBlbmROZXdJbnB1dChmYWxzZSk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNlbGxJbmRleCA9IGVkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XS5jZWxscy5sZW5ndGggLSAxO1xyXG4gICAgICAgIGFkZFJvdygtMSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNlbGxJbmRleCA9IDE7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGZvY3VzRXZlbnQoKTtcclxuICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICB9XHJcbiAgXHJcbiAgLy8g5LiK56e75YuVXHJcbiAgZnVuY3Rpb24gZG9VcCgpIHtcclxuICAgIGxldCBjdXJSb3cgPSBlZGl0Vmlldy5ub2RlKCkucm93cztcclxuICAgIGlmIChkMy5zZWxlY3QoY3VyUm93W3Jvd0luZGV4XSkuYXR0cignZGF0YS1uZXcnKSkge1xyXG4gICAgICBlbmROZXdJbnB1dChmYWxzZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBhZGRSb3coLTEpO1xyXG4gICAgfVxyXG4gICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZG9Eb3duKCkge1xyXG4gICAgbGV0IGN1clJvdyA9IGVkaXRWaWV3Lm5vZGUoKS5yb3dzO1xyXG4gICAgaWYgKGQzLnNlbGVjdChjdXJSb3dbcm93SW5kZXhdKS5hdHRyKCdkYXRhLW5ldycpKSB7XHJcbiAgICAgIGVuZE5ld0lucHV0KGZhbHNlKTtcclxuICAgIH1cclxuICAgIGFkZFJvdygxKTtcclxuICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICB9XHJcbiAgXHJcbiAgZnVuY3Rpb24gZG9QYWdlRG93bigpIHtcclxuICAgIGlmIChjdXJyZW50RXZlbnRJbmRleCA8IChldmVudHMubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgY3VycmVudEV2ZW50SW5kZXggKz0gTlVNX1JPVztcclxuICAgICAgaWYgKGN1cnJlbnRFdmVudEluZGV4ID4gKGV2ZW50cy5sZW5ndGggLSAxKSkge1xyXG4gICAgICAgIGN1cnJlbnRFdmVudEluZGV4IC09IE5VTV9ST1c7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbmVlZERyYXcgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGZvY3VzRXZlbnQoKTtcclxuICAgIH1cclxuICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICB9XHJcbiAgXHJcbiAgZnVuY3Rpb24gZG9QYWdlVXAoKXtcclxuICAgIGlmIChjdXJyZW50RXZlbnRJbmRleCA+IDApIHtcclxuICAgICAgY3VycmVudEV2ZW50SW5kZXggLT0gTlVNX1JPVztcclxuICAgICAgaWYgKGN1cnJlbnRFdmVudEluZGV4IDwgMCkge1xyXG4gICAgICAgIGN1cnJlbnRFdmVudEluZGV4ID0gMDtcclxuICAgICAgfVxyXG4gICAgICBuZWVkRHJhdyA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBkb1Njcm9sbFVwKClcclxuICB7XHJcbiAgICBpZiAoY3VycmVudEV2ZW50SW5kZXggPiAwKSB7XHJcbiAgICAgIC0tY3VycmVudEV2ZW50SW5kZXg7XHJcbiAgICAgIG5lZWREcmF3ID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGRvU2Nyb2xsRG93bigpXHJcbiAge1xyXG4gICAgaWYgKChjdXJyZW50RXZlbnRJbmRleCArIE5VTV9ST1cpIDw9IChldmVudHMubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgKytjdXJyZW50RXZlbnRJbmRleDtcclxuICAgICAgbmVlZERyYXcgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZG9Ib21lKCl7XHJcbiAgICBpZiAoY3VycmVudEV2ZW50SW5kZXggPiAwKSB7XHJcbiAgICAgIHJvd0luZGV4ID0gMDtcclxuICAgICAgY3VycmVudEV2ZW50SW5kZXggPSAwO1xyXG4gICAgICBuZWVkRHJhdyA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgfVxyXG4gIFxyXG4gIGZ1bmN0aW9uIGRvRW5kKCl7XHJcbiAgICBpZiAoY3VycmVudEV2ZW50SW5kZXggIT0gKGV2ZW50cy5sZW5ndGggLSAxKSkge1xyXG4gICAgICByb3dJbmRleCA9IDA7XHJcbiAgICAgIGN1cnJlbnRFdmVudEluZGV4ID0gZXZlbnRzLmxlbmd0aCAtIDE7XHJcbiAgICAgIG5lZWREcmF3ID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGRvRGVsZXRlKCkge1xyXG4gICAgaWYgKChyb3dJbmRleCArIGN1cnJlbnRFdmVudEluZGV4KSA9PSAoZXZlbnRzLmxlbmd0aCAtIDEpKSB7XHJcbiAgICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgZm9ybUVkaXRvci51bmRvTWFuYWdlci5leGVjKFxyXG4gICAgICB7XHJcbiAgICAgICAgZXhlYygpIHtcclxuICAgICAgICAgIHRoaXMucm93SW5kZXggPSByb3dJbmRleDtcclxuICAgICAgICAgIHRoaXMuY3VycmVudEV2ZW50SW5kZXggPSBjdXJyZW50RXZlbnRJbmRleDtcclxuICAgICAgICAgIHRoaXMuZXZlbnQgPSBldmVudHNbdGhpcy5yb3dJbmRleF07XHJcbiAgICAgICAgICB0aGlzLnJvd0RhdGEgPSBldmVudHNbdGhpcy5jdXJyZW50RXZlbnRJbmRleCArIHRoaXMucm93SW5kZXhdO1xyXG4gICAgICAgICAgZWRpdFZpZXcubm9kZSgpLmRlbGV0ZVJvdyh0aGlzLnJvd0luZGV4KTtcclxuICAgICAgICAgIHRoaXMubGluZUJ1ZmZlciA9IGZvcm1FZGl0b3IubGluZUJ1ZmZlcjtcclxuICAgICAgICAgIGZvcm1FZGl0b3IubGluZUJ1ZmZlciA9IFt0aGlzLmV2ZW50XTtcclxuICAgICAgICAgIGV2ZW50cy5zcGxpY2UodGhpcy5jdXJyZW50RXZlbnRJbmRleCArIHRoaXMucm93SW5kZXgsMSk7XHJcbiAgICAgICAgICBuZWVkRHJhdyA9IHRydWU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZWRvKCkge1xyXG4gICAgICAgICAgZWRpdFZpZXcubm9kZSgpLmRlbGV0ZVJvdyh0aGlzLnJvd0luZGV4KTtcclxuICAgICAgICAgIGV2ZW50cy5zcGxpY2UodGhpcy5jdXJyZW50RXZlbnRJbmRleCArIHRoaXMucm93SW5kZXgsMSk7XHJcbiAgICAgICAgICBuZWVkRHJhdyA9IHRydWU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB1bmRvKCkge1xyXG4gICAgICAgICAgZm9ybUVkaXRvci5saW5lQnVmZmVyID0gdGhpcy5saW5lQnVmZmVyO1xyXG4gICAgICAgICAgZXZlbnRzLnNwbGljZSh0aGlzLmN1cnJlbnRFdmVudEluZGV4ICsgdGhpcy5yb3dJbmRleCwwLHRoaXMuZXZlbnQpO1xyXG4gICAgICAgICAgbmVlZERyYXcgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgKTtcclxuICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICB9XHJcbiAgXHJcbiAgZnVuY3Rpb24gZG9MaW5lUGFzdGUoKVxyXG4gIHtcclxuICAgIHBhc3RlRXZlbnQoKTtcclxuICB9XHJcbiAgXHJcbiAgZnVuY3Rpb24gZG9SZWRvKCl7XHJcbiAgICBmb3JtRWRpdG9yLnVuZG9NYW5hZ2VyLnJlZG8oKTtcclxuICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGRvVW5kbygpe1xyXG4gICAgZm9ybUVkaXRvci51bmRvTWFuYWdlci51bmRvKCk7XHJcbiAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgfVxyXG4gIC8vIGN1dEV2ZW5044Gu57eo6ZuG44GL44KJXHJcbiAgLy8g44Kk44OZ44Oz44OI44Gu44Kr44OD44OIXHJcbiAgZnVuY3Rpb24gY3V0RXZlbnQoKVxyXG4gIHtcclxuICAgIGZvcm1FZGl0b3IudW5kb01hbmFnZXIuZXhlYyhcclxuICAgIHtcclxuICAgICAgZXhlYygpe1xyXG4gICAgICAgIHRoaXMuc2VsZWN0U3RhcnRJbmRleCA9IHNlbGVjdFN0YXJ0SW5kZXg7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RFbmRJbmRleCA9IHNlbGVjdEVuZEluZGV4O1xyXG4gICAgICAgIHRoaXMuY3V0KCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIGN1dCgpe1xyXG4gICAgICAgIHRoaXMubGluZUJ1ZmZlciA9IGZvcm1FZGl0b3IubGluZUJ1ZmZlcjtcclxuICAgICAgICBmb3JtRWRpdG9yLmxpbmVCdWZmZXIgPSBcclxuICAgICAgICBmb3JtRWRpdG9yLmxpbmVCdWZmZXIuc3BsaWNlKHRoaXMuc2VsZWN0U3RhcnRJbmRleCwgdGhpcy5zZWxlY3RFbmRJbmRleCArIDEgLSB0aGlzLnNlbGVjdFN0YXJ0SW5kZXggKTtcclxuICAgICAgICByb3dJbmRleCA9IHRoaXMuc2VsZWN0U3RhcnRJbmRleCAtIGN1cnJlbnRFdmVudEluZGV4O1xyXG4gICAgICAgIG5lZWREcmF3ID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgICAgcmVkbygpXHJcbiAgICAgIHtcclxuICAgICAgICB0aGlzLmN1dCgpOyAgICAgICAgXHJcbiAgICAgIH0sXHJcbiAgICAgIHVuZG8oKXtcclxuICAgICAgIGZvcm1FZGl0b3IubGluZUJ1ZmZlci5mb3JFYWNoKChkLGkpPT57XHJcbiAgICAgICAgIGV2ZW50cy5zcGxpY2UodGhpcy5zZWxlY3RTdGFydEluZGV4ICsgaSwwLGQpO1xyXG4gICAgICAgfSk7XHJcbiAgICAgICBmb3JtRWRpdG9yLmxpbmVCdWZmZXIgPSB0aGlzLmxpbmVCdWZmZXI7XHJcbiAgICAgICBuZWVkRHJhdyA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gIH0gXHJcbiAgXHJcbiAgLy8g44Kk44OZ44Oz44OI44Gu44Kz44OU44O8XHJcbiAgZnVuY3Rpb24gY29weUV2ZW50KClcclxuICB7XHJcbiAgICBmb3JtRWRpdG9yLnVuZG9NYW5hZ2VyLmV4ZWMoXHJcbiAgICB7XHJcbiAgICAgIGV4ZWMoKXtcclxuICAgICAgICB0aGlzLnNlbGVjdFN0YXJ0SW5kZXggPSBzZWxlY3RTdGFydEluZGV4O1xyXG4gICAgICAgIHRoaXMuc2VsZWN0RW5kSW5kZXggPSBzZWxlY3RFbmRJbmRleDtcclxuICAgICAgICB0aGlzLmNvcHkoKTtcclxuICAgICAgfSxcclxuICAgICAgY29weSgpe1xyXG4gICAgICAgIHRoaXMubGluZUJ1ZmZlciA9IGZvcm1FZGl0b3IubGluZUJ1ZmZlcjtcclxuICAgICAgICBmb3JtRWRpdG9yLmxpbmVCdWZmZXIgPSBbXTtcclxuICAgICAgICBmb3IobGV0IGkgPSB0aGlzLnNlbGVjdFN0YXJ0SW5kZXgsZSA9IHRoaXMuc2VsZWN0RW5kSW5kZXggKyAxO2k8IGU7KytpKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGZvcm1FZGl0b3IubGluZUJ1ZmZlci5wdXNoKGV2ZW50c1tpXS5jbG9uZSgpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbmVlZERyYXcgPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgICByZWRvKClcclxuICAgICAge1xyXG4gICAgICAgIHRoaXMuY29weSgpOyAgICAgICAgXHJcbiAgICAgIH0sXHJcbiAgICAgIHVuZG8oKXtcclxuICAgICAgIGZvcm1FZGl0b3IubGluZUJ1ZmZlciA9IHRoaXMubGluZUJ1ZmZlcjtcclxuICAgICAgIG5lZWREcmF3ID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgfVxyXG4gIFxyXG4gIC8vIOOCpOODmeODs+ODiOOBruODmuODvOOCueODiFxyXG4gIGZ1bmN0aW9uIHBhc3RlRXZlbnQoKXtcclxuICAgIGlmKGZvcm1FZGl0b3IubGluZUJ1ZmZlcil7XHJcbiAgICBmb3JtRWRpdG9yLnVuZG9NYW5hZ2VyLmV4ZWMoXHJcbiAgICB7XHJcbiAgICAgIGV4ZWMoKXtcclxuICAgICAgICB0aGlzLnN0YXJ0SW5kZXggPSByb3dJbmRleCArIGN1cnJlbnRFdmVudEluZGV4O1xyXG4gICAgICAgIHRoaXMuY291bnQgPSBmb3JtRWRpdG9yLmxpbmVCdWZmZXIubGVuZ3RoO1xyXG4gICAgICAgIHRoaXMucGFzdGUoKTtcclxuICAgICAgfSxcclxuICAgICAgcGFzdGUoKXtcclxuICAgICAgICBmb3IobGV0IGkgPSB0aGlzLmNvdW50IC0gMSxlID0gMDtpID49IGU7LS1pKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGV2ZW50cy5zcGxpY2UodGhpcy5zdGFydEluZGV4LDAsZm9ybUVkaXRvci5saW5lQnVmZmVyW2ldLmNsb25lKCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgcmVkbygpe1xyXG4gICAgICAgIHRoaXMucGFzdGUoKTtcclxuICAgICAgfSxcclxuICAgICAgdW5kbygpe1xyXG4gICAgICAgIGV2ZW50cy5zcGxpY2UodGhpcy5zdGFydEluZGV4LHRoaXMuY291bnQpO1xyXG4gICAgICAgIG5lZWREcmF3ID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBuZWVkRHJhdyA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgfVxyXG4gIFxyXG4gIGZ1bmN0aW9uICpkb1NlbGVjdCgpXHJcbiAge1xyXG4gICAgbGV0IGlucHV0O1xyXG4gICAgbGV0IGluZGV4QmFja3VwID0gcm93SW5kZXggKyBjdXJyZW50RXZlbnRJbmRleDtcclxuICAgIHNlbGVjdFN0YXJ0SW5kZXggPSByb3dJbmRleCArIGN1cnJlbnRFdmVudEluZGV4O1xyXG4gICAgc2VsZWN0RW5kSW5kZXggPSBzZWxlY3RTdGFydEluZGV4O1xyXG4gICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gICAgZHJhd0V2ZW50KCk7XHJcbiAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICBsZXQgZXhpdExvb3AgPSBmYWxzZTtcclxuICAgIHdoaWxlKCFleGl0TG9vcClcclxuICAgIHtcclxuICAgICAgaW5wdXQgPSB5aWVsZCBjYW5jZWxFdmVudDtcclxuICAgICAgXHJcbiAgICAgIHN3aXRjaChpbnB1dC5pbnB1dENvbW1hbmQuaWQpe1xyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kcy5zZWxlY3QuaWQ6XHJcbiAgICAgICAgICBleGl0TG9vcCA9IHRydWU7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZHMuY3V0RXZlbnQuaWQ6XHJcbiAgICAgICAgICBjdXRFdmVudCgpO1xyXG4gICAgICAgICAgZXhpdExvb3AgPSB0cnVlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBJbnB1dENvbW1hbmRzLmNvcHlFdmVudC5pZDpcclxuICAgICAgICAgIGNvcHlFdmVudCgpO1xyXG4gICAgICAgICAgZXhpdExvb3AgPSB0cnVlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgIGxldCBmbiA9IGVkaXRGdW5jc1tpbnB1dC5pbnB1dENvbW1hbmQuaWRdO1xyXG4gICAgICAgICAgaWYoZm4pe1xyXG4gICAgICAgICAgICBmbihpbnB1dCk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGNhbmNlbEV2ZW50ID0gZmFsc2U7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAvLyDpgbjmip7nr4Tlm7Ljga7oqIjnrpdcclxuICAgICAgICAgIGlmKGluZGV4QmFja3VwICE9IChyb3dJbmRleCArIGN1cnJlbnRFdmVudEluZGV4KSlcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IGRlbHRhID0gcm93SW5kZXggKyBjdXJyZW50RXZlbnRJbmRleCAtIGluZGV4QmFja3VwO1xyXG4gICAgICAgICAgICBsZXQgaW5kZXhOZXh0ID0gcm93SW5kZXggKyBjdXJyZW50RXZlbnRJbmRleDsgICAgICAgICBcclxuICAgICAgICAgICAgaWYoZGVsdGEgPCAwKXtcclxuICAgICAgICAgICAgICBpZihzZWxlY3RTdGFydEluZGV4ID4gaW5kZXhOZXh0KXtcclxuICAgICAgICAgICAgICAgIHNlbGVjdFN0YXJ0SW5kZXggPSBpbmRleE5leHQ7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGVjdEVuZEluZGV4ID0gaW5kZXhOZXh0O1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBpZihzZWxlY3RFbmRJbmRleCA8IGluZGV4TmV4dCl7XHJcbiAgICAgICAgICAgICAgICBzZWxlY3RFbmRJbmRleCA9IGluZGV4TmV4dDtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2VsZWN0U3RhcnRJbmRleCA9IGluZGV4TmV4dDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaW5kZXhCYWNrdXAgPSByb3dJbmRleCArIGN1cnJlbnRFdmVudEluZGV4O1xyXG4gICAgICAgICAgICBuZWVkRHJhdyA9IHRydWU7XHJcbiAgICAgICAgICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgIH0gICAgICAgIFxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGlmKG5lZWREcmF3KXtcclxuICAgICAgICBkcmF3RXZlbnQoKTtcclxuICAgICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICAgICAgbmVlZERyYXcgPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIOW+jOWni+acq1xyXG4gICAgc2VsZWN0U3RhcnRJbmRleCA9IG51bGw7XHJcbiAgICBzZWxlY3RFbmRJbmRleCA9IG51bGw7XHJcbiAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICBkcmF3RXZlbnQoKTtcclxuICAgIGZvY3VzRXZlbnQoKTtcclxuICAgIG5lZWREcmF3ID0gZmFsc2U7XHJcbiAgfVxyXG4gIFxyXG4gIHZhciBlZGl0RnVuY3MgPSB7XHJcbiAgICBbSW5wdXRDb21tYW5kcy5lbnRlci5pZF06ZG9FbnRlcixcclxuICAgIFtJbnB1dENvbW1hbmRzLnJpZ2h0LmlkXTpkb1JpZ2h0LFxyXG4gICAgW0lucHV0Q29tbWFuZHMubGVmdC5pZF06ZG9MZWZ0LFxyXG4gICAgW0lucHV0Q29tbWFuZHMudXAuaWRdOmRvVXAsXHJcbiAgICBbSW5wdXRDb21tYW5kcy5kb3duLmlkXTpkb0Rvd24sXHJcbiAgICBbSW5wdXRDb21tYW5kcy5wYWdlRG93bi5pZF06ZG9QYWdlRG93bixcclxuICAgIFtJbnB1dENvbW1hbmRzLnBhZ2VVcC5pZF06ZG9QYWdlVXAsXHJcbiAgICBbSW5wdXRDb21tYW5kcy5zY3JvbGxVcC5pZF06ZG9TY3JvbGxVcCxcclxuICAgIFtJbnB1dENvbW1hbmRzLnNjcm9sbERvd24uaWRdOmRvU2Nyb2xsRG93bixcclxuICAgIFtJbnB1dENvbW1hbmRzLmhvbWUuaWRdOmRvSG9tZSxcclxuICAgIFtJbnB1dENvbW1hbmRzLmVuZC5pZF06ZG9FbmQsXHJcbiAgICBbSW5wdXRDb21tYW5kcy5kZWxldGUuaWRdOmRvRGVsZXRlLFxyXG4gICAgW0lucHV0Q29tbWFuZHMubGluZVBhc3RlLmlkXTpkb0xpbmVQYXN0ZSxcclxuICAgIFtJbnB1dENvbW1hbmRzLnJlZG8uaWRdOmRvUmVkbyxcclxuICAgIFtJbnB1dENvbW1hbmRzLnVuZG8uaWRdOmRvVW5kbyxcclxuICAgIFtJbnB1dENvbW1hbmRzLnBhc3RlRXZlbnQuaWRdOnBhc3RlRXZlbnRcclxuICB9O1xyXG4gIFxyXG4gIGRyYXdFdmVudCgpO1xyXG4gIHdoaWxlICh0cnVlKSB7XHJcbi8vICAgIGNvbnNvbGUubG9nKCduZXcgbGluZScsIHJvd0luZGV4LCBldmVudHMubGVuZ3RoKTtcclxuICAgIGlmIChldmVudHMubGVuZ3RoID09IDAgfHwgcm93SW5kZXggPiAoZXZlbnRzLmxlbmd0aCAtIDEpKSB7XHJcbiAgICB9XHJcbiAgICBrZXlsb29wOlxyXG4gICAgd2hpbGUgKHRydWUpIHtcclxuICAgICAgbGV0IGlucHV0ID0geWllbGQgY2FuY2VsRXZlbnQ7XHJcbiAgICAgIGlmKGlucHV0LmlucHV0Q29tbWFuZC5pZCA9PT0gSW5wdXRDb21tYW5kcy5zZWxlY3QuaWQpXHJcbiAgICAgIHtcclxuICAgICAgICB5aWVsZCogZG9TZWxlY3QoKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBsZXQgZm4gPSBlZGl0RnVuY3NbaW5wdXQuaW5wdXRDb21tYW5kLmlkXTtcclxuICAgICAgICBpZiAoZm4pIHtcclxuICAgICAgICAgIGZuKGlucHV0KTtcclxuICAgICAgICAgIGlmIChuZWVkRHJhdykge1xyXG4gICAgICAgICAgICBkcmF3RXZlbnQoKTtcclxuICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgICBuZWVkRHJhdyA9IGZhbHNlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBjYW5jZWxFdmVudCA9IGZhbHNlO1xyXG4gLy8gICAgICAgICBjb25zb2xlLmxvZygnZGVmYXVsdCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iLCIndXNlIHN0cmljdCc7XHJcbmltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSAnLi4vLi4vanMvRXZlbnRFbWl0dGVyMyc7XHJcblxyXG5leHBvcnQgY2xhc3MgVW5kb01hbmFnZXIgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xyXG5cdGNvbnN0cnVjdG9yKCl7XHJcblx0XHRzdXBlcigpO1xyXG5cdFx0dGhpcy5idWZmZXIgPSBbXTtcclxuXHRcdHRoaXMuaW5kZXggPSAtMTtcclxuXHR9XHJcblx0XHJcblx0Y2xlYXIoKXtcclxuICAgIHRoaXMuYnVmZmVyLmxlbmd0aCA9IDA7XHJcbiAgICB0aGlzLmluZGV4ID0gLTE7XHJcbiAgICB0aGlzLmVtaXQoJ2NsZWFyZWQnKTtcclxuXHR9XHJcblx0XHJcblx0ZXhlYyhjb21tYW5kKXtcclxuICAgIGNvbW1hbmQuZXhlYygpO1xyXG4gICAgaWYgKCh0aGlzLmluZGV4ICsgMSkgPCB0aGlzLmJ1ZmZlci5sZW5ndGgpXHJcbiAgICB7XHJcbiAgICAgIHRoaXMuYnVmZmVyLmxlbmd0aCA9IHRoaXMuaW5kZXggKyAxO1xyXG4gICAgfVxyXG4gICAgdGhpcy5idWZmZXIucHVzaChjb21tYW5kKTtcclxuICAgICsrdGhpcy5pbmRleDtcclxuICAgIHRoaXMuZW1pdCgnZXhlY3V0ZWQnKTtcclxuXHR9XHJcblx0XHJcblx0cmVkbygpe1xyXG4gICAgaWYgKCh0aGlzLmluZGV4ICsgMSkgPCAodGhpcy5idWZmZXIubGVuZ3RoKSlcclxuICAgIHtcclxuICAgICAgKyt0aGlzLmluZGV4O1xyXG4gICAgICB2YXIgY29tbWFuZCA9IHRoaXMuYnVmZmVyW3RoaXMuaW5kZXhdO1xyXG4gICAgICBjb21tYW5kLnJlZG8oKTtcclxuICAgICAgdGhpcy5lbWl0KCdyZWRpZCcpO1xyXG4gICAgICBpZiAoKHRoaXMuaW5kZXggICsgMSkgPT0gdGhpcy5idWZmZXIubGVuZ3RoKVxyXG4gICAgICB7XHJcbiAgICAgICAgdGhpcy5lbWl0KCdyZWRvRW1wdHknKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cdH1cclxuICB1bmRvKClcclxuICB7XHJcbiAgICBpZiAodGhpcy5idWZmZXIubGVuZ3RoID4gMCAmJiB0aGlzLmluZGV4ID49IDApXHJcbiAgICB7XHJcbiAgICAgIHZhciBjb21tYW5kID0gdGhpcy5idWZmZXJbdGhpcy5pbmRleF07XHJcbiAgICAgIGNvbW1hbmQudW5kbygpO1xyXG4gICAgICAtLXRoaXMuaW5kZXg7XHJcbiAgICAgIHRoaXMuZW1pdCgndW5kaWQnKTtcclxuICAgICAgaWYgKHRoaXMuaW5kZXggPCAwKVxyXG4gICAgICB7XHJcbiAgICAgICAgdGhpcy5pbmRleCA9IC0xO1xyXG4gICAgICAgIHRoaXMuZW1pdCgndW5kb0VtcHR5Jyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblx0XHJcbn1cclxuXHJcbnZhciB1bmRvTWFuYWdlciA9IG5ldyBVbmRvTWFuYWdlcigpO1xyXG5leHBvcnQgZGVmYXVsdCB1bmRvTWFuYWdlcjsiLCIndXNlIHN0cmljdCc7XHJcblxyXG4vL1xyXG4vLyBXZSBzdG9yZSBvdXIgRUUgb2JqZWN0cyBpbiBhIHBsYWluIG9iamVjdCB3aG9zZSBwcm9wZXJ0aWVzIGFyZSBldmVudCBuYW1lcy5cclxuLy8gSWYgYE9iamVjdC5jcmVhdGUobnVsbClgIGlzIG5vdCBzdXBwb3J0ZWQgd2UgcHJlZml4IHRoZSBldmVudCBuYW1lcyB3aXRoIGFcclxuLy8gYH5gIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSBidWlsdC1pbiBvYmplY3QgcHJvcGVydGllcyBhcmUgbm90IG92ZXJyaWRkZW4gb3JcclxuLy8gdXNlZCBhcyBhbiBhdHRhY2sgdmVjdG9yLlxyXG4vLyBXZSBhbHNvIGFzc3VtZSB0aGF0IGBPYmplY3QuY3JlYXRlKG51bGwpYCBpcyBhdmFpbGFibGUgd2hlbiB0aGUgZXZlbnQgbmFtZVxyXG4vLyBpcyBhbiBFUzYgU3ltYm9sLlxyXG4vL1xyXG52YXIgcHJlZml4ID0gdHlwZW9mIE9iamVjdC5jcmVhdGUgIT09ICdmdW5jdGlvbicgPyAnficgOiBmYWxzZTtcclxuXHJcbi8qKlxyXG4gKiBSZXByZXNlbnRhdGlvbiBvZiBhIHNpbmdsZSBFdmVudEVtaXR0ZXIgZnVuY3Rpb24uXHJcbiAqXHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEV2ZW50IGhhbmRsZXIgdG8gYmUgY2FsbGVkLlxyXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IENvbnRleHQgZm9yIGZ1bmN0aW9uIGV4ZWN1dGlvbi5cclxuICogQHBhcmFtIHtCb29sZWFufSBvbmNlIE9ubHkgZW1pdCBvbmNlXHJcbiAqIEBhcGkgcHJpdmF0ZVxyXG4gKi9cclxuZnVuY3Rpb24gRUUoZm4sIGNvbnRleHQsIG9uY2UpIHtcclxuICB0aGlzLmZuID0gZm47XHJcbiAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcclxuICB0aGlzLm9uY2UgPSBvbmNlIHx8IGZhbHNlO1xyXG59XHJcblxyXG4vKipcclxuICogTWluaW1hbCBFdmVudEVtaXR0ZXIgaW50ZXJmYWNlIHRoYXQgaXMgbW9sZGVkIGFnYWluc3QgdGhlIE5vZGUuanNcclxuICogRXZlbnRFbWl0dGVyIGludGVyZmFjZS5cclxuICpcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7IC8qIE5vdGhpbmcgdG8gc2V0ICovIH1cclxuXHJcbi8qKlxyXG4gKiBIb2xkcyB0aGUgYXNzaWduZWQgRXZlbnRFbWl0dGVycyBieSBuYW1lLlxyXG4gKlxyXG4gKiBAdHlwZSB7T2JqZWN0fVxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xyXG5cclxuLyoqXHJcbiAqIFJldHVybiBhIGxpc3Qgb2YgYXNzaWduZWQgZXZlbnQgbGlzdGVuZXJzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50cyB0aGF0IHNob3VsZCBiZSBsaXN0ZWQuXHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gZXhpc3RzIFdlIG9ubHkgbmVlZCB0byBrbm93IGlmIHRoZXJlIGFyZSBsaXN0ZW5lcnMuXHJcbiAqIEByZXR1cm5zIHtBcnJheXxCb29sZWFufVxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbiBsaXN0ZW5lcnMoZXZlbnQsIGV4aXN0cykge1xyXG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50XHJcbiAgICAsIGF2YWlsYWJsZSA9IHRoaXMuX2V2ZW50cyAmJiB0aGlzLl9ldmVudHNbZXZ0XTtcclxuXHJcbiAgaWYgKGV4aXN0cykgcmV0dXJuICEhYXZhaWxhYmxlO1xyXG4gIGlmICghYXZhaWxhYmxlKSByZXR1cm4gW107XHJcbiAgaWYgKGF2YWlsYWJsZS5mbikgcmV0dXJuIFthdmFpbGFibGUuZm5dO1xyXG5cclxuICBmb3IgKHZhciBpID0gMCwgbCA9IGF2YWlsYWJsZS5sZW5ndGgsIGVlID0gbmV3IEFycmF5KGwpOyBpIDwgbDsgaSsrKSB7XHJcbiAgICBlZVtpXSA9IGF2YWlsYWJsZVtpXS5mbjtcclxuICB9XHJcblxyXG4gIHJldHVybiBlZTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBFbWl0IGFuIGV2ZW50IHRvIGFsbCByZWdpc3RlcmVkIGV2ZW50IGxpc3RlbmVycy5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBuYW1lIG9mIHRoZSBldmVudC5cclxuICogQHJldHVybnMge0Jvb2xlYW59IEluZGljYXRpb24gaWYgd2UndmUgZW1pdHRlZCBhbiBldmVudC5cclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIGVtaXQoZXZlbnQsIGExLCBhMiwgYTMsIGE0LCBhNSkge1xyXG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xyXG5cclxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW2V2dF0pIHJldHVybiBmYWxzZTtcclxuXHJcbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldnRdXHJcbiAgICAsIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGhcclxuICAgICwgYXJnc1xyXG4gICAgLCBpO1xyXG5cclxuICBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGxpc3RlbmVycy5mbikge1xyXG4gICAgaWYgKGxpc3RlbmVycy5vbmNlKSB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcnMuZm4sIHVuZGVmaW5lZCwgdHJ1ZSk7XHJcblxyXG4gICAgc3dpdGNoIChsZW4pIHtcclxuICAgICAgY2FzZSAxOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQpLCB0cnVlO1xyXG4gICAgICBjYXNlIDI6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEpLCB0cnVlO1xyXG4gICAgICBjYXNlIDM6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyKSwgdHJ1ZTtcclxuICAgICAgY2FzZSA0OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMpLCB0cnVlO1xyXG4gICAgICBjYXNlIDU6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMywgYTQpLCB0cnVlO1xyXG4gICAgICBjYXNlIDY6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMywgYTQsIGE1KSwgdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKGkgPSAxLCBhcmdzID0gbmV3IEFycmF5KGxlbiAtMSk7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcclxuICAgIH1cclxuXHJcbiAgICBsaXN0ZW5lcnMuZm4uYXBwbHkobGlzdGVuZXJzLmNvbnRleHQsIGFyZ3MpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICB2YXIgbGVuZ3RoID0gbGlzdGVuZXJzLmxlbmd0aFxyXG4gICAgICAsIGo7XHJcblxyXG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGlmIChsaXN0ZW5lcnNbaV0ub25jZSkgdGhpcy5yZW1vdmVMaXN0ZW5lcihldmVudCwgbGlzdGVuZXJzW2ldLmZuLCB1bmRlZmluZWQsIHRydWUpO1xyXG5cclxuICAgICAgc3dpdGNoIChsZW4pIHtcclxuICAgICAgICBjYXNlIDE6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0KTsgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAyOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgYTEpOyBicmVhaztcclxuICAgICAgICBjYXNlIDM6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhMSwgYTIpOyBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgaWYgKCFhcmdzKSBmb3IgKGogPSAxLCBhcmdzID0gbmV3IEFycmF5KGxlbiAtMSk7IGogPCBsZW47IGorKykge1xyXG4gICAgICAgICAgICBhcmdzW2ogLSAxXSA9IGFyZ3VtZW50c1tqXTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBsaXN0ZW5lcnNbaV0uZm4uYXBwbHkobGlzdGVuZXJzW2ldLmNvbnRleHQsIGFyZ3MpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdHJ1ZTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZWdpc3RlciBhIG5ldyBFdmVudExpc3RlbmVyIGZvciB0aGUgZ2l2ZW4gZXZlbnQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBOYW1lIG9mIHRoZSBldmVudC5cclxuICogQHBhcmFtIHtGdW5jdG9ufSBmbiBDYWxsYmFjayBmdW5jdGlvbi5cclxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBUaGUgY29udGV4dCBvZiB0aGUgZnVuY3Rpb24uXHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gb24oZXZlbnQsIGZuLCBjb250ZXh0KSB7XHJcbiAgdmFyIGxpc3RlbmVyID0gbmV3IEVFKGZuLCBjb250ZXh0IHx8IHRoaXMpXHJcbiAgICAsIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XHJcblxyXG4gIGlmICghdGhpcy5fZXZlbnRzKSB0aGlzLl9ldmVudHMgPSBwcmVmaXggPyB7fSA6IE9iamVjdC5jcmVhdGUobnVsbCk7XHJcbiAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XSkgdGhpcy5fZXZlbnRzW2V2dF0gPSBsaXN0ZW5lcjtcclxuICBlbHNlIHtcclxuICAgIGlmICghdGhpcy5fZXZlbnRzW2V2dF0uZm4pIHRoaXMuX2V2ZW50c1tldnRdLnB1c2gobGlzdGVuZXIpO1xyXG4gICAgZWxzZSB0aGlzLl9ldmVudHNbZXZ0XSA9IFtcclxuICAgICAgdGhpcy5fZXZlbnRzW2V2dF0sIGxpc3RlbmVyXHJcbiAgICBdO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogQWRkIGFuIEV2ZW50TGlzdGVuZXIgdGhhdCdzIG9ubHkgY2FsbGVkIG9uY2UuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBOYW1lIG9mIHRoZSBldmVudC5cclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gQ2FsbGJhY2sgZnVuY3Rpb24uXHJcbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgVGhlIGNvbnRleHQgb2YgdGhlIGZ1bmN0aW9uLlxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24gb25jZShldmVudCwgZm4sIGNvbnRleHQpIHtcclxuICB2YXIgbGlzdGVuZXIgPSBuZXcgRUUoZm4sIGNvbnRleHQgfHwgdGhpcywgdHJ1ZSlcclxuICAgICwgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcclxuXHJcbiAgaWYgKCF0aGlzLl9ldmVudHMpIHRoaXMuX2V2ZW50cyA9IHByZWZpeCA/IHt9IDogT2JqZWN0LmNyZWF0ZShudWxsKTtcclxuICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdKSB0aGlzLl9ldmVudHNbZXZ0XSA9IGxpc3RlbmVyO1xyXG4gIGVsc2Uge1xyXG4gICAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XS5mbikgdGhpcy5fZXZlbnRzW2V2dF0ucHVzaChsaXN0ZW5lcik7XHJcbiAgICBlbHNlIHRoaXMuX2V2ZW50c1tldnRdID0gW1xyXG4gICAgICB0aGlzLl9ldmVudHNbZXZ0XSwgbGlzdGVuZXJcclxuICAgIF07XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZW1vdmUgZXZlbnQgbGlzdGVuZXJzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IHdlIHdhbnQgdG8gcmVtb3ZlLlxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgbGlzdGVuZXIgdGhhdCB3ZSBuZWVkIHRvIGZpbmQuXHJcbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgT25seSByZW1vdmUgbGlzdGVuZXJzIG1hdGNoaW5nIHRoaXMgY29udGV4dC5cclxuICogQHBhcmFtIHtCb29sZWFufSBvbmNlIE9ubHkgcmVtb3ZlIG9uY2UgbGlzdGVuZXJzLlxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuXHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcihldmVudCwgZm4sIGNvbnRleHQsIG9uY2UpIHtcclxuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcclxuXHJcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1tldnRdKSByZXR1cm4gdGhpcztcclxuXHJcbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldnRdXHJcbiAgICAsIGV2ZW50cyA9IFtdO1xyXG5cclxuICBpZiAoZm4pIHtcclxuICAgIGlmIChsaXN0ZW5lcnMuZm4pIHtcclxuICAgICAgaWYgKFxyXG4gICAgICAgICAgIGxpc3RlbmVycy5mbiAhPT0gZm5cclxuICAgICAgICB8fCAob25jZSAmJiAhbGlzdGVuZXJzLm9uY2UpXHJcbiAgICAgICAgfHwgKGNvbnRleHQgJiYgbGlzdGVuZXJzLmNvbnRleHQgIT09IGNvbnRleHQpXHJcbiAgICAgICkge1xyXG4gICAgICAgIGV2ZW50cy5wdXNoKGxpc3RlbmVycyk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBsaXN0ZW5lcnMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICBsaXN0ZW5lcnNbaV0uZm4gIT09IGZuXHJcbiAgICAgICAgICB8fCAob25jZSAmJiAhbGlzdGVuZXJzW2ldLm9uY2UpXHJcbiAgICAgICAgICB8fCAoY29udGV4dCAmJiBsaXN0ZW5lcnNbaV0uY29udGV4dCAhPT0gY29udGV4dClcclxuICAgICAgICApIHtcclxuICAgICAgICAgIGV2ZW50cy5wdXNoKGxpc3RlbmVyc1tpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvL1xyXG4gIC8vIFJlc2V0IHRoZSBhcnJheSwgb3IgcmVtb3ZlIGl0IGNvbXBsZXRlbHkgaWYgd2UgaGF2ZSBubyBtb3JlIGxpc3RlbmVycy5cclxuICAvL1xyXG4gIGlmIChldmVudHMubGVuZ3RoKSB7XHJcbiAgICB0aGlzLl9ldmVudHNbZXZ0XSA9IGV2ZW50cy5sZW5ndGggPT09IDEgPyBldmVudHNbMF0gOiBldmVudHM7XHJcbiAgfSBlbHNlIHtcclxuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbZXZ0XTtcclxuICB9XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlbW92ZSBhbGwgbGlzdGVuZXJzIG9yIG9ubHkgdGhlIGxpc3RlbmVycyBmb3IgdGhlIHNwZWNpZmllZCBldmVudC5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCB3YW50IHRvIHJlbW92ZSBhbGwgbGlzdGVuZXJzIGZvci5cclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24gcmVtb3ZlQWxsTGlzdGVuZXJzKGV2ZW50KSB7XHJcbiAgaWYgKCF0aGlzLl9ldmVudHMpIHJldHVybiB0aGlzO1xyXG5cclxuICBpZiAoZXZlbnQpIGRlbGV0ZSB0aGlzLl9ldmVudHNbcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudF07XHJcbiAgZWxzZSB0aGlzLl9ldmVudHMgPSBwcmVmaXggPyB7fSA6IE9iamVjdC5jcmVhdGUobnVsbCk7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLy9cclxuLy8gQWxpYXMgbWV0aG9kcyBuYW1lcyBiZWNhdXNlIHBlb3BsZSByb2xsIGxpa2UgdGhhdC5cclxuLy9cclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vZmYgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyO1xyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbjtcclxuXHJcbi8vXHJcbi8vIFRoaXMgZnVuY3Rpb24gZG9lc24ndCBhcHBseSBhbnltb3JlLlxyXG4vL1xyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uIHNldE1heExpc3RlbmVycygpIHtcclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8vXHJcbi8vIEV4cG9zZSB0aGUgcHJlZml4LlxyXG4vL1xyXG5FdmVudEVtaXR0ZXIucHJlZml4ZWQgPSBwcmVmaXg7XHJcblxyXG4vL1xyXG4vLyBFeHBvc2UgdGhlIG1vZHVsZS5cclxuLy9cclxuaWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgbW9kdWxlKSB7XHJcbiAgbW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XHJcbn1cclxuXHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJncmFwaGljcy5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJpby5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJzb25nLmpzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInRleHQuanNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwidXRpbC5qc1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJkc3AuanNcIiAvPlxyXG5cInVzZSBzdHJpY3RcIjtcclxuLy8vLyBXZWIgQXVkaW8gQVBJIOODqeODg+ODkeODvOOCr+ODqeOCuSAvLy8vXHJcbnZhciBmZnQgPSBuZXcgRkZUKDQwOTYsIDQ0MTAwKTtcclxudmFyIEJVRkZFUl9TSVpFID0gMTAyNDtcclxudmFyIFRJTUVfQkFTRSA9IDk2O1xyXG5cclxudmFyIG5vdGVGcmVxID0gW107XHJcbmZvciAodmFyIGkgPSAtODE7IGkgPCA0NjsgKytpKSB7XHJcbiAgbm90ZUZyZXEucHVzaChNYXRoLnBvdygyLCBpIC8gMTIpKTtcclxufVxyXG5cclxudmFyIFNxdWFyZVdhdmUgPSB7XHJcbiAgYml0czogNCxcclxuICB3YXZlZGF0YTogWzB4ZiwgMHhmLCAweGYsIDB4ZiwgMHhmLCAweGYsIDB4ZiwgMHhmLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXVxyXG59Oy8vIDRiaXQgd2F2ZSBmb3JtXHJcblxyXG52YXIgU2F3V2F2ZSA9IHtcclxuICBiaXRzOiA0LFxyXG4gIHdhdmVkYXRhOiBbMHgwLCAweDEsIDB4MiwgMHgzLCAweDQsIDB4NSwgMHg2LCAweDcsIDB4OCwgMHg5LCAweGEsIDB4YiwgMHhjLCAweGQsIDB4ZSwgMHhmXVxyXG59Oy8vIDRiaXQgd2F2ZSBmb3JtXHJcblxyXG52YXIgVHJpV2F2ZSA9IHtcclxuICBiaXRzOiA0LFxyXG4gIHdhdmVkYXRhOiBbMHgwLCAweDIsIDB4NCwgMHg2LCAweDgsIDB4QSwgMHhDLCAweEUsIDB4RiwgMHhFLCAweEMsIDB4QSwgMHg4LCAweDYsIDB4NCwgMHgyXVxyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGRlY29kZVN0cihiaXRzLCB3YXZlc3RyKSB7XHJcbiAgdmFyIGFyciA9IFtdO1xyXG4gIHZhciBuID0gYml0cyAvIDQgfCAwO1xyXG4gIHZhciBjID0gMDtcclxuICB2YXIgemVyb3BvcyA9IDEgPDwgKGJpdHMgLSAxKTtcclxuICB3aGlsZSAoYyA8IHdhdmVzdHIubGVuZ3RoKSB7XHJcbiAgICB2YXIgZCA9IDA7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG47ICsraSkge1xyXG4gICAgICBldmFsKFwiZCA9IChkIDw8IDQpICsgMHhcIiArIHdhdmVzdHIuY2hhckF0KGMrKykgKyBcIjtcIik7XHJcbiAgICB9XHJcbiAgICBhcnIucHVzaCgoZCAtIHplcm9wb3MpIC8gemVyb3Bvcyk7XHJcbiAgfVxyXG4gIHJldHVybiBhcnI7XHJcbn1cclxuXHJcbnZhciB3YXZlcyA9IFtcclxuICAgIGRlY29kZVN0cig0LCAnRUVFRUVFRUVFRUVFRUVFRTAwMDAwMDAwMDAwMDAwMDAnKSxcclxuICAgIGRlY29kZVN0cig0LCAnMDAxMTIyMzM0NDU1NjY3Nzg4OTlBQUJCQ0NEREVFRkYnKSxcclxuICAgIGRlY29kZVN0cig0LCAnMDIzNDY2NDU5QUE4QTdBOTc3OTY1NjU2QUNBQUNERUYnKSxcclxuICAgIGRlY29kZVN0cig0LCAnQkRDRENBOTk5QUNEQ0RCOTQyMTIzNjc3NzYzMjEyNDcnKSxcclxuICAgIGRlY29kZVN0cig0LCAnN0FDREVEQ0E3NDIxMDEyNDdCREVEQjczMjAxMzdFNzgnKSxcclxuICAgIGRlY29kZVN0cig0LCAnQUNDQTc3OUJERURBNjY2Nzk5OTQxMDEyNjc3NDIyNDcnKSxcclxuICAgIGRlY29kZVN0cig0LCAnN0VDOUNFQTdDRkQ4QUI3MjhEOTQ1NzIwMzg1MTM1MzEnKSxcclxuICAgIGRlY29kZVN0cig0LCAnRUU3N0VFNzdFRTc3RUU3NzAwNzcwMDc3MDA3NzAwNzcnKSxcclxuICAgIGRlY29kZVN0cig0LCAnRUVFRTg4ODg4ODg4ODg4ODAwMDA4ODg4ODg4ODg4ODgnKS8v44OO44Kk44K655So44Gu44OA44Of44O85rOi5b2iXHJcbl07XHJcblxyXG52YXIgd2F2ZVNhbXBsZXMgPSBbXTtcclxuZXhwb3J0IGZ1bmN0aW9uIFdhdmVTYW1wbGUoYXVkaW9jdHgsIGNoLCBzYW1wbGVMZW5ndGgsIHNhbXBsZVJhdGUpIHtcclxuXHJcbiAgdGhpcy5zYW1wbGUgPSBhdWRpb2N0eC5jcmVhdGVCdWZmZXIoY2gsIHNhbXBsZUxlbmd0aCwgc2FtcGxlUmF0ZSB8fCBhdWRpb2N0eC5zYW1wbGVSYXRlKTtcclxuICB0aGlzLmxvb3AgPSBmYWxzZTtcclxuICB0aGlzLnN0YXJ0ID0gMDtcclxuICB0aGlzLmVuZCA9IChzYW1wbGVMZW5ndGggLSAxKSAvIChzYW1wbGVSYXRlIHx8IGF1ZGlvY3R4LnNhbXBsZVJhdGUpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlV2F2ZVNhbXBsZUZyb21XYXZlcyhhdWRpb2N0eCwgc2FtcGxlTGVuZ3RoKSB7XHJcbiAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHdhdmVzLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICB2YXIgc2FtcGxlID0gbmV3IFdhdmVTYW1wbGUoYXVkaW9jdHgsIDEsIHNhbXBsZUxlbmd0aCk7XHJcbiAgICB3YXZlU2FtcGxlcy5wdXNoKHNhbXBsZSk7XHJcbiAgICBpZiAoaSAhPSA4KSB7XHJcbiAgICAgIHZhciB3YXZlZGF0YSA9IHdhdmVzW2ldO1xyXG4gICAgICB2YXIgZGVsdGEgPSA0NDAuMCAqIHdhdmVkYXRhLmxlbmd0aCAvIGF1ZGlvY3R4LnNhbXBsZVJhdGU7XHJcbiAgICAgIHZhciBzdGltZSA9IDA7XHJcbiAgICAgIHZhciBvdXRwdXQgPSBzYW1wbGUuc2FtcGxlLmdldENoYW5uZWxEYXRhKDApO1xyXG4gICAgICB2YXIgbGVuID0gd2F2ZWRhdGEubGVuZ3RoO1xyXG4gICAgICB2YXIgaW5kZXggPSAwO1xyXG4gICAgICB2YXIgZW5kc2FtcGxlID0gMDtcclxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBzYW1wbGVMZW5ndGg7ICsraikge1xyXG4gICAgICAgIGluZGV4ID0gc3RpbWUgfCAwO1xyXG4gICAgICAgIG91dHB1dFtqXSA9IHdhdmVkYXRhW2luZGV4XTtcclxuICAgICAgICBzdGltZSArPSBkZWx0YTtcclxuICAgICAgICBpZiAoc3RpbWUgPj0gbGVuKSB7XHJcbiAgICAgICAgICBzdGltZSA9IHN0aW1lIC0gbGVuO1xyXG4gICAgICAgICAgZW5kc2FtcGxlID0gajtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgc2FtcGxlLmVuZCA9IGVuZHNhbXBsZSAvIGF1ZGlvY3R4LnNhbXBsZVJhdGU7XHJcbiAgICAgIHNhbXBsZS5sb29wID0gdHJ1ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIOODnOOCpOOCuTjjga/jg47jgqTjgrrms6LlvaLjgajjgZnjgotcclxuICAgICAgdmFyIG91dHB1dCA9IHNhbXBsZS5zYW1wbGUuZ2V0Q2hhbm5lbERhdGEoMCk7XHJcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgc2FtcGxlTGVuZ3RoOyArK2opIHtcclxuICAgICAgICBvdXRwdXRbal0gPSBNYXRoLnJhbmRvbSgpICogMi4wIC0gMS4wO1xyXG4gICAgICB9XHJcbiAgICAgIHNhbXBsZS5lbmQgPSBzYW1wbGVMZW5ndGggLyBhdWRpb2N0eC5zYW1wbGVSYXRlO1xyXG4gICAgICBzYW1wbGUubG9vcCA9IHRydWU7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gV2F2ZVRleHR1cmUod2F2ZSkge1xyXG4gIHRoaXMud2F2ZSA9IHdhdmUgfHwgd2F2ZXNbMF07XHJcbiAgdGhpcy50ZXggPSBuZXcgQ2FudmFzVGV4dHVyZSgzMjAsIDEwICogMTYpO1xyXG4gIHRoaXMucmVuZGVyKCk7XHJcbn1cclxuXHJcbldhdmVUZXh0dXJlLnByb3RvdHlwZSA9IHtcclxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBjdHggPSB0aGlzLnRleC5jdHg7XHJcbiAgICB2YXIgd2F2ZSA9IHRoaXMud2F2ZTtcclxuICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgY3R4LmNhbnZhcy53aWR0aCwgY3R4LmNhbnZhcy5oZWlnaHQpO1xyXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gJ3doaXRlJztcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMzIwOyBpICs9IDEwKSB7XHJcbiAgICAgIGN0eC5tb3ZlVG8oaSwgMCk7XHJcbiAgICAgIGN0eC5saW5lVG8oaSwgMjU1KTtcclxuICAgIH1cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTYwOyBpICs9IDEwKSB7XHJcbiAgICAgIGN0eC5tb3ZlVG8oMCwgaSk7XHJcbiAgICAgIGN0eC5saW5lVG8oMzIwLCBpKTtcclxuICAgIH1cclxuICAgIGN0eC5maWxsU3R5bGUgPSAncmdiYSgyNTUsMjU1LDI1NSwwLjcpJztcclxuICAgIGN0eC5yZWN0KDAsIDAsIGN0eC5jYW52YXMud2lkdGgsIGN0eC5jYW52YXMuaGVpZ2h0KTtcclxuICAgIGN0eC5zdHJva2UoKTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBjID0gMDsgaSA8IGN0eC5jYW52YXMud2lkdGg7IGkgKz0gMTAsICsrYykge1xyXG4gICAgICBjdHguZmlsbFJlY3QoaSwgKHdhdmVbY10gPiAwKSA/IDgwIC0gd2F2ZVtjXSAqIDgwIDogODAsIDEwLCBNYXRoLmFicyh3YXZlW2NdKSAqIDgwKTtcclxuICAgIH1cclxuICAgIHRoaXMudGV4LnRleHR1cmUubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gIH1cclxufTtcclxuXHJcbi8vLyDjgqjjg7Pjg5njg63jg7zjg5fjgrjjgqfjg43jg6zjg7zjgr/jg7xcclxuZXhwb3J0IGZ1bmN0aW9uIEVudmVsb3BlR2VuZXJhdG9yKHZvaWNlLCBhdHRhY2ssIGRlY2F5LCBzdXN0YWluLCByZWxlYXNlKSB7XHJcbiAgdGhpcy52b2ljZSA9IHZvaWNlO1xyXG4gIC8vdGhpcy5rZXlvbiA9IGZhbHNlO1xyXG4gIHRoaXMuYXR0YWNrID0gYXR0YWNrIHx8IDAuMDAwNTtcclxuICB0aGlzLmRlY2F5ID0gZGVjYXkgfHwgMC4wNTtcclxuICB0aGlzLnN1c3RhaW4gPSBzdXN0YWluIHx8IDAuNTtcclxuICB0aGlzLnJlbGVhc2UgPSByZWxlYXNlIHx8IDAuNTtcclxuICB0aGlzLnYgPSAxLjA7XHJcblxyXG59O1xyXG5cclxuRW52ZWxvcGVHZW5lcmF0b3IucHJvdG90eXBlID1cclxue1xyXG4gIGtleW9uOiBmdW5jdGlvbiAodCx2ZWwpIHtcclxuICAgIHRoaXMudiA9IHZlbCB8fCAxLjA7XHJcbiAgICB2YXIgdiA9IHRoaXMudjtcclxuICAgIHZhciB0MCA9IHQgfHwgdGhpcy52b2ljZS5hdWRpb2N0eC5jdXJyZW50VGltZTtcclxuICAgIHZhciB0MSA9IHQwICsgdGhpcy5hdHRhY2sgKiB2O1xyXG4gICAgdmFyIGdhaW4gPSB0aGlzLnZvaWNlLmdhaW4uZ2FpbjtcclxuICAgIGdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKHQwKTtcclxuICAgIGdhaW4uc2V0VmFsdWVBdFRpbWUoMCwgdDApO1xyXG4gICAgZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSh2LCB0MSk7XHJcbiAgICBnYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHRoaXMuc3VzdGFpbiAqIHYsIHQwICsgdGhpcy5kZWNheSAvIHYpO1xyXG4gICAgLy9nYWluLnNldFRhcmdldEF0VGltZSh0aGlzLnN1c3RhaW4gKiB2LCB0MSwgdDEgKyB0aGlzLmRlY2F5IC8gdik7XHJcbiAgfSxcclxuICBrZXlvZmY6IGZ1bmN0aW9uICh0KSB7XHJcbiAgICB2YXIgdm9pY2UgPSB0aGlzLnZvaWNlO1xyXG4gICAgdmFyIGdhaW4gPSB2b2ljZS5nYWluLmdhaW47XHJcbiAgICB2YXIgdDAgPSB0IHx8IHZvaWNlLmF1ZGlvY3R4LmN1cnJlbnRUaW1lO1xyXG4gICAgZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXModDApO1xyXG4gICAgLy9nYWluLnNldFZhbHVlQXRUaW1lKDAsIHQwICsgdGhpcy5yZWxlYXNlIC8gdGhpcy52KTtcclxuICAgIC8vZ2Fpbi5zZXRUYXJnZXRBdFRpbWUoMCwgdDAsIHQwICsgdGhpcy5yZWxlYXNlIC8gdGhpcy52KTtcclxuICAgIGdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCwgdDAgKyB0aGlzLnJlbGVhc2UgLyB0aGlzLnYpO1xyXG4gIH1cclxufTtcclxuXHJcbi8vLyDjg5zjgqTjgrlcclxuZXhwb3J0IGZ1bmN0aW9uIFZvaWNlKGF1ZGlvY3R4KSB7XHJcbiAgdGhpcy5hdWRpb2N0eCA9IGF1ZGlvY3R4O1xyXG4gIHRoaXMuc2FtcGxlID0gd2F2ZVNhbXBsZXNbNl07XHJcbiAgdGhpcy5nYWluID0gYXVkaW9jdHguY3JlYXRlR2FpbigpO1xyXG4gIHRoaXMuZ2Fpbi5nYWluLnZhbHVlID0gMC4wO1xyXG4gIHRoaXMudm9sdW1lID0gYXVkaW9jdHguY3JlYXRlR2FpbigpO1xyXG4gIHRoaXMuZW52ZWxvcGUgPSBuZXcgRW52ZWxvcGVHZW5lcmF0b3IodGhpcyk7XHJcbiAgdGhpcy5pbml0UHJvY2Vzc29yKCk7XHJcbiAgdGhpcy5kZXR1bmUgPSAxLjA7XHJcbiAgdGhpcy52b2x1bWUuZ2Fpbi52YWx1ZSA9IDEuMDtcclxuICB0aGlzLmdhaW4uY29ubmVjdCh0aGlzLnZvbHVtZSk7XHJcbiAgdGhpcy5vdXRwdXQgPSB0aGlzLnZvbHVtZTtcclxufTtcclxuXHJcblZvaWNlLnByb3RvdHlwZSA9IHtcclxuICBpbml0UHJvY2Vzc29yOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLnByb2Nlc3NvciA9IHRoaXMuYXVkaW9jdHguY3JlYXRlQnVmZmVyU291cmNlKCk7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5idWZmZXIgPSB0aGlzLnNhbXBsZS5zYW1wbGU7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5sb29wID0gdGhpcy5zYW1wbGUubG9vcDtcclxuICAgIHRoaXMucHJvY2Vzc29yLmxvb3BTdGFydCA9IDA7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5wbGF5YmFja1JhdGUudmFsdWUgPSAxLjA7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5sb29wRW5kID0gdGhpcy5zYW1wbGUuZW5kO1xyXG4gICAgdGhpcy5wcm9jZXNzb3IuY29ubmVjdCh0aGlzLmdhaW4pO1xyXG4gIH0sXHJcblxyXG4gIHNldFNhbXBsZTogZnVuY3Rpb24gKHNhbXBsZSkge1xyXG4gICAgICB0aGlzLmVudmVsb3BlLmtleW9mZigwKTtcclxuICAgICAgdGhpcy5wcm9jZXNzb3IuZGlzY29ubmVjdCh0aGlzLmdhaW4pO1xyXG4gICAgICB0aGlzLnNhbXBsZSA9IHNhbXBsZTtcclxuICAgICAgdGhpcy5pbml0UHJvY2Vzc29yKCk7XHJcbiAgICAgIHRoaXMucHJvY2Vzc29yLnN0YXJ0KCk7XHJcbiAgfSxcclxuICBzdGFydDogZnVuY3Rpb24gKHN0YXJ0VGltZSkge1xyXG4gLy8gICBpZiAodGhpcy5wcm9jZXNzb3IucGxheWJhY2tTdGF0ZSA9PSAzKSB7XHJcbiAgICAgIHRoaXMucHJvY2Vzc29yLmRpc2Nvbm5lY3QodGhpcy5nYWluKTtcclxuICAgICAgdGhpcy5pbml0UHJvY2Vzc29yKCk7XHJcbi8vICAgIH0gZWxzZSB7XHJcbi8vICAgICAgdGhpcy5lbnZlbG9wZS5rZXlvZmYoKTtcclxuLy9cclxuLy8gICAgfVxyXG4gICAgdGhpcy5wcm9jZXNzb3Iuc3RhcnQoc3RhcnRUaW1lKTtcclxuICB9LFxyXG4gIHN0b3A6IGZ1bmN0aW9uICh0aW1lKSB7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5zdG9wKHRpbWUpO1xyXG4gICAgdGhpcy5yZXNldCgpO1xyXG4gIH0sXHJcbiAga2V5b246ZnVuY3Rpb24odCxub3RlLHZlbClcclxuICB7XHJcbiAgICB0aGlzLnByb2Nlc3Nvci5wbGF5YmFja1JhdGUuc2V0VmFsdWVBdFRpbWUobm90ZUZyZXFbbm90ZV0gKiB0aGlzLmRldHVuZSwgdCk7XHJcbiAgICB0aGlzLmVudmVsb3BlLmtleW9uKHQsdmVsKTtcclxuICB9LFxyXG4gIGtleW9mZjpmdW5jdGlvbih0KVxyXG4gIHtcclxuICAgIHRoaXMuZW52ZWxvcGUua2V5b2ZmKHQpO1xyXG4gIH0sXHJcbiAgcmVzZXQ6ZnVuY3Rpb24oKVxyXG4gIHtcclxuICAgIHRoaXMucHJvY2Vzc29yLnBsYXliYWNrUmF0ZS5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoMCk7XHJcbiAgICB0aGlzLmdhaW4uZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoMCk7XHJcbiAgICB0aGlzLmdhaW4uZ2Fpbi52YWx1ZSA9IDA7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gQXVkaW8oKSB7XHJcbiAgdGhpcy5lbmFibGUgPSBmYWxzZTtcclxuICB0aGlzLmF1ZGlvQ29udGV4dCA9IHdpbmRvdy5BdWRpb0NvbnRleHQgfHwgd2luZG93LndlYmtpdEF1ZGlvQ29udGV4dCB8fCB3aW5kb3cubW96QXVkaW9Db250ZXh0O1xyXG5cclxuICBpZiAodGhpcy5hdWRpb0NvbnRleHQpIHtcclxuICAgIHRoaXMuYXVkaW9jdHggPSBuZXcgdGhpcy5hdWRpb0NvbnRleHQoKTtcclxuICAgIHRoaXMuZW5hYmxlID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIHRoaXMudm9pY2VzID0gW107XHJcbiAgaWYgKHRoaXMuZW5hYmxlKSB7XHJcbiAgICBjcmVhdGVXYXZlU2FtcGxlRnJvbVdhdmVzKHRoaXMuYXVkaW9jdHgsIEJVRkZFUl9TSVpFKTtcclxuICAgIHRoaXMuZmlsdGVyID0gdGhpcy5hdWRpb2N0eC5jcmVhdGVCaXF1YWRGaWx0ZXIoKTtcclxuICAgIHRoaXMuZmlsdGVyLnR5cGUgPSAnbG93cGFzcyc7XHJcbiAgICB0aGlzLmZpbHRlci5mcmVxdWVuY3kudmFsdWUgPSAyMDAwMDtcclxuICAgIHRoaXMuZmlsdGVyLlEudmFsdWUgPSAwLjAwMDE7XHJcbiAgICB0aGlzLm5vaXNlRmlsdGVyID0gdGhpcy5hdWRpb2N0eC5jcmVhdGVCaXF1YWRGaWx0ZXIoKTtcclxuICAgIHRoaXMubm9pc2VGaWx0ZXIudHlwZSA9ICdsb3dwYXNzJztcclxuICAgIHRoaXMubm9pc2VGaWx0ZXIuZnJlcXVlbmN5LnZhbHVlID0gMTAwMDtcclxuICAgIHRoaXMubm9pc2VGaWx0ZXIuUS52YWx1ZSA9IDEuODtcclxuICAgIHRoaXMuY29tcCA9IHRoaXMuYXVkaW9jdHguY3JlYXRlRHluYW1pY3NDb21wcmVzc29yKCk7XHJcbiAgICB0aGlzLmZpbHRlci5jb25uZWN0KHRoaXMuY29tcCk7XHJcbiAgICB0aGlzLm5vaXNlRmlsdGVyLmNvbm5lY3QodGhpcy5jb21wKTtcclxuICAgIHRoaXMuY29tcC5jb25uZWN0KHRoaXMuYXVkaW9jdHguZGVzdGluYXRpb24pO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsZW5kID0gdGhpcy5WT0lDRVM7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgICB2YXIgdiA9IG5ldyBWb2ljZSh0aGlzLmF1ZGlvY3R4KTtcclxuICAgICAgdGhpcy52b2ljZXMucHVzaCh2KTtcclxuICAgICAgaWYoaSA9PSAodGhpcy5WT0lDRVMgLSAxKSl7XHJcbiAgICAgICAgdi5vdXRwdXQuY29ubmVjdCh0aGlzLm5vaXNlRmlsdGVyKTtcclxuICAgICAgfSBlbHNle1xyXG4gICAgICAgIHYub3V0cHV0LmNvbm5lY3QodGhpcy5maWx0ZXIpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbi8vICB0aGlzLnN0YXJ0ZWQgPSBmYWxzZTtcclxuXHJcbiAgICAvL3RoaXMudm9pY2VzWzBdLm91dHB1dC5jb25uZWN0KCk7XHJcbiAgfVxyXG5cclxufVxyXG5cclxuQXVkaW8ucHJvdG90eXBlID0ge1xyXG4gIHN0YXJ0OiBmdW5jdGlvbiAoKVxyXG4gIHtcclxuICAvLyAgaWYgKHRoaXMuc3RhcnRlZCkgcmV0dXJuO1xyXG5cclxuICAgIHZhciB2b2ljZXMgPSB0aGlzLnZvaWNlcztcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB2b2ljZXMubGVuZ3RoOyBpIDwgZW5kOyArK2kpXHJcbiAgICB7XHJcbiAgICAgIHZvaWNlc1tpXS5zdGFydCgwKTtcclxuICAgIH1cclxuICAgIC8vdGhpcy5zdGFydGVkID0gdHJ1ZTtcclxuICB9LFxyXG4gIHN0b3A6IGZ1bmN0aW9uICgpXHJcbiAge1xyXG4gICAgLy9pZih0aGlzLnN0YXJ0ZWQpXHJcbiAgICAvL3tcclxuICAgICAgdmFyIHZvaWNlcyA9IHRoaXMudm9pY2VzO1xyXG4gICAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gdm9pY2VzLmxlbmd0aDsgaSA8IGVuZDsgKytpKVxyXG4gICAgICB7XHJcbiAgICAgICAgdm9pY2VzW2ldLnN0b3AoMCk7XHJcbiAgICAgIH1cclxuICAgIC8vICB0aGlzLnN0YXJ0ZWQgPSBmYWxzZTtcclxuICAgIC8vfVxyXG4gIH0sXHJcbiAgVk9JQ0VTOiAxMlxyXG59XHJcblxyXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuLyog44K344O844Kx44Oz44K144O844Kz44Oe44Oz44OJICAgICAgICAgICAgICAgICAgICAgICAqL1xyXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBOb3RlKG5vLCBuYW1lKSB7XHJcbiAgdGhpcy5ubyA9IG5vO1xyXG4gIHRoaXMubmFtZSA9IG5hbWU7XHJcbn1cclxuXHJcbk5vdGUucHJvdG90eXBlID0ge1xyXG4gIHByb2Nlc3M6IGZ1bmN0aW9uKHRyYWNrKSBcclxuICB7XHJcbiAgICB2YXIgYmFjayA9IHRyYWNrLmJhY2s7XHJcbiAgICB2YXIgbm90ZSA9IHRoaXM7XHJcbiAgICB2YXIgb2N0ID0gdGhpcy5vY3QgfHwgYmFjay5vY3Q7XHJcbiAgICB2YXIgc3RlcCA9IHRoaXMuc3RlcCB8fCBiYWNrLnN0ZXA7XHJcbiAgICB2YXIgZ2F0ZSA9IHRoaXMuZ2F0ZSB8fCBiYWNrLmdhdGU7XHJcbiAgICB2YXIgdmVsID0gdGhpcy52ZWwgfHwgYmFjay52ZWw7XHJcbiAgICBzZXRRdWV1ZSh0cmFjaywgbm90ZSwgb2N0LHN0ZXAsIGdhdGUsIHZlbCk7XHJcblxyXG4gIH1cclxufVxyXG5cclxudmFyIFxyXG4gIEMgID0gbmV3IE5vdGUoIDAsJ0MgJyksXHJcbiAgRGIgPSBuZXcgTm90ZSggMSwnRGInKSxcclxuICBEICA9IG5ldyBOb3RlKCAyLCdEICcpLFxyXG4gIEViID0gbmV3IE5vdGUoIDMsJ0ViJyksXHJcbiAgRSAgPSBuZXcgTm90ZSggNCwnRSAnKSxcclxuICBGICA9IG5ldyBOb3RlKCA1LCdGICcpLFxyXG4gIEdiID0gbmV3IE5vdGUoIDYsJ0diJyksXHJcbiAgRyAgPSBuZXcgTm90ZSggNywnRyAnKSxcclxuICBBYiA9IG5ldyBOb3RlKCA4LCdBYicpLFxyXG4gIEEgID0gbmV3IE5vdGUoIDksJ0EgJyksXHJcbiAgQmIgPSBuZXcgTm90ZSgxMCwnQmInKSxcclxuICBCID0gbmV3IE5vdGUoMTEsICdCICcpO1xyXG5cclxuIC8vIFIgPSBuZXcgUmVzdCgpO1xyXG5cclxuZnVuY3Rpb24gU2VxRGF0YShub3RlLCBvY3QsIHN0ZXAsIGdhdGUsIHZlbClcclxue1xyXG4gIHRoaXMubm90ZSA9IG5vdGU7XHJcbiAgdGhpcy5vY3QgPSBvY3Q7XHJcbiAgLy90aGlzLm5vID0gbm90ZS5ubyArIG9jdCAqIDEyO1xyXG4gIHRoaXMuc3RlcCA9IHN0ZXA7XHJcbiAgdGhpcy5nYXRlID0gZ2F0ZTtcclxuICB0aGlzLnZlbCA9IHZlbDtcclxufVxyXG5cclxuZnVuY3Rpb24gc2V0UXVldWUodHJhY2ssbm90ZSxvY3Qsc3RlcCxnYXRlLHZlbClcclxue1xyXG4gIHZhciBubyA9IG5vdGUubm8gKyBvY3QgKiAxMjtcclxuICB2YXIgc3RlcF90aW1lID0gdHJhY2sucGxheWluZ1RpbWU7XHJcbiAgdmFyIGdhdGVfdGltZSA9ICgoZ2F0ZSA+PSAwKSA/IGdhdGUgKiA2MCA6IHN0ZXAgKiBnYXRlICogNjAgKiAtMS4wKSAvIChUSU1FX0JBU0UgKiB0cmFjay5sb2NhbFRlbXBvKSArIHRyYWNrLnBsYXlpbmdUaW1lO1xyXG4gIHZhciB2b2ljZSA9IHRyYWNrLmF1ZGlvLnZvaWNlc1t0cmFjay5jaGFubmVsXTtcclxuICAvL2NvbnNvbGUubG9nKHRyYWNrLnNlcXVlbmNlci50ZW1wbyk7XHJcbiAgdm9pY2Uua2V5b24oc3RlcF90aW1lLCBubywgdmVsKTtcclxuICB2b2ljZS5rZXlvZmYoZ2F0ZV90aW1lKTtcclxuICB0cmFjay5wbGF5aW5nVGltZSA9IChzdGVwICogNjApIC8gKFRJTUVfQkFTRSAqIHRyYWNrLmxvY2FsVGVtcG8pICsgdHJhY2sucGxheWluZ1RpbWU7XHJcbiAgdmFyIGJhY2sgPSB0cmFjay5iYWNrO1xyXG4gIGJhY2subm90ZSA9IG5vdGU7XHJcbiAgYmFjay5vY3QgPSBvY3Q7XHJcbiAgYmFjay5zdGVwID0gc3RlcDtcclxuICBiYWNrLmdhdGUgPSBnYXRlO1xyXG4gIGJhY2sudmVsID0gdmVsO1xyXG59XHJcblxyXG5TZXFEYXRhLnByb3RvdHlwZSA9IHtcclxuICBwcm9jZXNzOiBmdW5jdGlvbiAodHJhY2spIHtcclxuXHJcbiAgICB2YXIgYmFjayA9IHRyYWNrLmJhY2s7XHJcbiAgICB2YXIgbm90ZSA9IHRoaXMubm90ZSB8fCBiYWNrLm5vdGU7XHJcbiAgICB2YXIgb2N0ID0gdGhpcy5vY3QgfHwgYmFjay5vY3Q7XHJcbiAgICB2YXIgc3RlcCA9IHRoaXMuc3RlcCB8fCBiYWNrLnN0ZXA7XHJcbiAgICB2YXIgZ2F0ZSA9IHRoaXMuZ2F0ZSB8fCBiYWNrLmdhdGU7XHJcbiAgICB2YXIgdmVsID0gdGhpcy52ZWwgfHwgYmFjay52ZWw7XHJcbiAgICBzZXRRdWV1ZSh0cmFjayxub3RlLG9jdCxzdGVwLGdhdGUsdmVsKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFMobm90ZSwgb2N0LCBzdGVwLCBnYXRlLCB2ZWwpIHtcclxuICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XHJcbiAgaWYgKFMubGVuZ3RoICE9IGFyZ3MubGVuZ3RoKVxyXG4gIHtcclxuICAgIGlmKHR5cGVvZihhcmdzW2FyZ3MubGVuZ3RoIC0gMV0pID09ICdvYmplY3QnICYmICAhKGFyZ3NbYXJncy5sZW5ndGggLSAxXSBpbnN0YW5jZW9mIE5vdGUpKVxyXG4gICAge1xyXG4gICAgICB2YXIgYXJnczEgPSBhcmdzW2FyZ3MubGVuZ3RoIC0gMV07XHJcbiAgICAgIHZhciBsID0gYXJncy5sZW5ndGggLSAxO1xyXG4gICAgICByZXR1cm4gbmV3IFNlcURhdGEoXHJcbiAgICAgICgobCAhPSAwKT9ub3RlOmZhbHNlKSB8fCBhcmdzMS5ub3RlIHx8IGFyZ3MxLm4gfHwgbnVsbCxcclxuICAgICAgKChsICE9IDEpID8gb2N0IDogZmFsc2UpIHx8IGFyZ3MxLm9jdCB8fCBhcmdzMS5vIHx8IG51bGwsXHJcbiAgICAgICgobCAhPSAyKSA/IHN0ZXAgOiBmYWxzZSkgfHwgYXJnczEuc3RlcCB8fCBhcmdzMS5zIHx8IG51bGwsXHJcbiAgICAgICgobCAhPSAzKSA/IGdhdGUgOiBmYWxzZSkgfHwgYXJnczEuZ2F0ZSB8fCBhcmdzMS5nIHx8IG51bGwsXHJcbiAgICAgICgobCAhPSA0KSA/IHZlbCA6IGZhbHNlKSB8fCBhcmdzMS52ZWwgfHwgYXJnczEudiB8fCBudWxsXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBuZXcgU2VxRGF0YShub3RlIHx8IG51bGwsIG9jdCB8fCBudWxsLCBzdGVwIHx8IG51bGwsIGdhdGUgfHwgbnVsbCwgdmVsIHx8IG51bGwpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBTMShub3RlLCBvY3QsIHN0ZXAsIGdhdGUsIHZlbCkge1xyXG4gIHJldHVybiBTKG5vdGUsIG9jdCwgbChzdGVwKSwgZ2F0ZSwgdmVsKTtcclxufVxyXG5cclxuZnVuY3Rpb24gUzIobm90ZSwgbGVuLCBkb3QgLCBvY3QsIGdhdGUsIHZlbCkge1xyXG4gIHJldHVybiBTKG5vdGUsIG9jdCwgbChsZW4sZG90KSwgZ2F0ZSwgdmVsKTtcclxufVxyXG5cclxuZnVuY3Rpb24gUzMobm90ZSwgc3RlcCwgZ2F0ZSwgdmVsLCBvY3QpIHtcclxuICByZXR1cm4gUyhub3RlLCBvY3QsIHN0ZXAsIGdhdGUsIHZlbCk7XHJcbn1cclxuXHJcblxyXG4vLy8g6Z+z56ym44Gu6ZW344GV5oyH5a6aXHJcblxyXG5mdW5jdGlvbiBsKGxlbixkb3QpXHJcbntcclxuICB2YXIgZCA9IGZhbHNlO1xyXG4gIGlmIChkb3QpIGQgPSBkb3Q7XHJcbiAgcmV0dXJuIChUSU1FX0JBU0UgKiAoNCArIChkPzI6MCkpKSAvIGxlbjtcclxufVxyXG5cclxuZnVuY3Rpb24gU3RlcChzdGVwKSB7XHJcbiAgdGhpcy5zdGVwID0gc3RlcDtcclxufVxyXG5cclxuU3RlcC5wcm90b3R5cGUucHJvY2VzcyA9IGZ1bmN0aW9uICh0cmFjaylcclxue1xyXG4gIHRyYWNrLmJhY2suc3RlcCA9IHRoaXMuc3RlcDtcclxufVxyXG5cclxuZnVuY3Rpb24gU1Qoc3RlcClcclxue1xyXG4gIHJldHVybiBuZXcgU3RlcChzdGVwKTtcclxufVxyXG5cclxuZnVuY3Rpb24gTChsZW4sIGRvdCkge1xyXG4gIHJldHVybiBuZXcgU3RlcChsKGxlbiwgZG90KSk7XHJcbn1cclxuXHJcbi8vLyDjgrLjg7zjg4jjgr/jgqTjg6DmjIflrppcclxuXHJcbmZ1bmN0aW9uIEdhdGVUaW1lKGdhdGUpIHtcclxuICB0aGlzLmdhdGUgPSBnYXRlO1xyXG59XHJcblxyXG5HYXRlVGltZS5wcm90b3R5cGUucHJvY2VzcyA9IGZ1bmN0aW9uICh0cmFjaykge1xyXG4gIHRyYWNrLmJhY2suZ2F0ZSA9IHRoaXMuZ2F0ZTtcclxufVxyXG5cclxuZnVuY3Rpb24gR1QoZ2F0ZSkge1xyXG4gIHJldHVybiBuZXcgR2F0ZVRpbWUoZ2F0ZSk7XHJcbn1cclxuXHJcbi8vLyDjg5njg63jgrfjg4bjgqPmjIflrppcclxuXHJcbmZ1bmN0aW9uIFZlbG9jaXR5KHZlbCkge1xyXG4gIHRoaXMudmVsID0gdmVsO1xyXG59XHJcblxyXG5WZWxvY2l0eS5wcm90b3R5cGUucHJvY2VzcyA9IGZ1bmN0aW9uICh0cmFjaykge1xyXG4gIHRyYWNrLmJhY2sudmVsID0gdGhpcy52ZWw7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFYodmVsKSB7XHJcbiAgcmV0dXJuIG5ldyBWZWxvY2l0eSh2ZWwpO1xyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gSnVtcChwb3MpIHsgdGhpcy5wb3MgPSBwb3M7fTtcclxuSnVtcC5wcm90b3R5cGUucHJvY2VzcyA9IGZ1bmN0aW9uICh0cmFjaylcclxue1xyXG4gIHRyYWNrLnNlcVBvcyA9IHRoaXMucG9zO1xyXG59XHJcblxyXG4vLy8g6Z+z6Imy6Kit5a6aXHJcbmZ1bmN0aW9uIFRvbmUobm8pXHJcbntcclxuICB0aGlzLm5vID0gbm87XHJcbiAgLy90aGlzLnNhbXBsZSA9IHdhdmVTYW1wbGVzW3RoaXMubm9dO1xyXG59XHJcblxyXG5Ub25lLnByb3RvdHlwZSA9XHJcbntcclxuICBwcm9jZXNzOiBmdW5jdGlvbiAodHJhY2spXHJcbiAge1xyXG4gICAgdHJhY2suYXVkaW8udm9pY2VzW3RyYWNrLmNoYW5uZWxdLnNldFNhbXBsZSh3YXZlU2FtcGxlc1t0aGlzLm5vXSk7XHJcbiAgfVxyXG59XHJcbmZ1bmN0aW9uIFRPTkUobm8pXHJcbntcclxuICByZXR1cm4gbmV3IFRvbmUobm8pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBKVU1QKHBvcykge1xyXG4gIHJldHVybiBuZXcgSnVtcChwb3MpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBSZXN0KHN0ZXApXHJcbntcclxuICB0aGlzLnN0ZXAgPSBzdGVwO1xyXG59XHJcblxyXG5SZXN0LnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24odHJhY2spXHJcbntcclxuICB2YXIgc3RlcCA9IHRoaXMuc3RlcCB8fCB0cmFjay5iYWNrLnN0ZXA7XHJcbiAgdHJhY2sucGxheWluZ1RpbWUgPSB0cmFjay5wbGF5aW5nVGltZSArICh0aGlzLnN0ZXAgKiA2MCkgLyAoVElNRV9CQVNFICogdHJhY2subG9jYWxUZW1wbyk7XHJcbiAgdHJhY2suYmFjay5zdGVwID0gdGhpcy5zdGVwO1xyXG59XHJcblxyXG5mdW5jdGlvbiBSMShzdGVwKSB7XHJcbiAgcmV0dXJuIG5ldyBSZXN0KHN0ZXApO1xyXG59XHJcbmZ1bmN0aW9uIFIobGVuLGRvdCkge1xyXG4gIHJldHVybiBuZXcgUmVzdChsKGxlbixkb3QpKTtcclxufVxyXG5cclxuZnVuY3Rpb24gT2N0YXZlKG9jdCkge1xyXG4gIHRoaXMub2N0ID0gb2N0O1xyXG59XHJcbk9jdGF2ZS5wcm90b3R5cGUucHJvY2VzcyA9IGZ1bmN0aW9uKHRyYWNrKVxyXG57XHJcbiAgdHJhY2suYmFjay5vY3QgPSB0aGlzLm9jdDtcclxufVxyXG5cclxuZnVuY3Rpb24gTyhvY3QpIHtcclxuICByZXR1cm4gbmV3IE9jdGF2ZShvY3QpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBPY3RhdmVVcCh2KSB7IHRoaXMudiA9IHY7IH07XHJcbk9jdGF2ZVVwLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24odHJhY2spIHtcclxuICB0cmFjay5iYWNrLm9jdCArPSB0aGlzLnY7XHJcbn1cclxuXHJcbnZhciBPVSA9IG5ldyBPY3RhdmVVcCgxKTtcclxudmFyIE9EID0gbmV3IE9jdGF2ZVVwKC0xKTtcclxuXHJcbmZ1bmN0aW9uIFRlbXBvKHRlbXBvKVxyXG57XHJcbiAgdGhpcy50ZW1wbyA9IHRlbXBvO1xyXG59XHJcblxyXG5UZW1wby5wcm90b3R5cGUucHJvY2VzcyA9IGZ1bmN0aW9uKHRyYWNrKVxyXG57XHJcbiAgdHJhY2subG9jYWxUZW1wbyA9IHRoaXMudGVtcG87XHJcbiAgLy90cmFjay5zZXF1ZW5jZXIudGVtcG8gPSB0aGlzLnRlbXBvO1xyXG59XHJcblxyXG5mdW5jdGlvbiBURU1QTyh0ZW1wbylcclxue1xyXG4gIHJldHVybiBuZXcgVGVtcG8odGVtcG8pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBFbnZlbG9wZShhdHRhY2ssIGRlY2F5LCBzdXN0YWluLCByZWxlYXNlKVxyXG57XHJcbiAgdGhpcy5hdHRhY2sgPSBhdHRhY2s7XHJcbiAgdGhpcy5kZWNheSA9IGRlY2F5O1xyXG4gIHRoaXMuc3VzdGFpbiA9IHN1c3RhaW47XHJcbiAgdGhpcy5yZWxlYXNlID0gcmVsZWFzZTtcclxufVxyXG5cclxuRW52ZWxvcGUucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbih0cmFjaylcclxue1xyXG4gIHZhciBlbnZlbG9wZSA9IHRyYWNrLmF1ZGlvLnZvaWNlc1t0cmFjay5jaGFubmVsXS5lbnZlbG9wZTtcclxuICBlbnZlbG9wZS5hdHRhY2sgPSB0aGlzLmF0dGFjaztcclxuICBlbnZlbG9wZS5kZWNheSA9IHRoaXMuZGVjYXk7XHJcbiAgZW52ZWxvcGUuc3VzdGFpbiA9IHRoaXMuc3VzdGFpbjtcclxuICBlbnZlbG9wZS5yZWxlYXNlID0gdGhpcy5yZWxlYXNlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBFTlYoYXR0YWNrLGRlY2F5LHN1c3RhaW4gLHJlbGVhc2UpXHJcbntcclxuICByZXR1cm4gbmV3IEVudmVsb3BlKGF0dGFjaywgZGVjYXksIHN1c3RhaW4sIHJlbGVhc2UpO1xyXG59XHJcblxyXG4vLy8g44OH44OB44Ol44O844OzXHJcbmZ1bmN0aW9uIERldHVuZShkZXR1bmUpXHJcbntcclxuICB0aGlzLmRldHVuZSA9IGRldHVuZTtcclxufVxyXG5cclxuRGV0dW5lLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24odHJhY2spXHJcbntcclxuICB2YXIgdm9pY2UgPSB0cmFjay5hdWRpby52b2ljZXNbdHJhY2suY2hhbm5lbF07XHJcbiAgdm9pY2UuZGV0dW5lID0gdGhpcy5kZXR1bmU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIERFVFVORShkZXR1bmUpXHJcbntcclxuICByZXR1cm4gbmV3IERldHVuZShkZXR1bmUpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBWb2x1bWUodm9sdW1lKVxyXG57XHJcbiAgdGhpcy52b2x1bWUgPSB2b2x1bWU7XHJcbn1cclxuXHJcblZvbHVtZS5wcm90b3R5cGUucHJvY2VzcyA9IGZ1bmN0aW9uKHRyYWNrKVxyXG57XHJcbiAgdHJhY2suYXVkaW8udm9pY2VzW3RyYWNrLmNoYW5uZWxdLnZvbHVtZS5nYWluLnNldFZhbHVlQXRUaW1lKHRoaXMudm9sdW1lLCB0cmFjay5wbGF5aW5nVGltZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFZPTFVNRSh2b2x1bWUpXHJcbntcclxuICByZXR1cm4gbmV3IFZvbHVtZSh2b2x1bWUpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBMb29wRGF0YShvYmosdmFybmFtZSwgY291bnQsc2VxUG9zKVxyXG57XHJcbiAgdGhpcy52YXJuYW1lID0gdmFybmFtZTtcclxuICB0aGlzLmNvdW50ID0gY291bnQ7XHJcbiAgdGhpcy5vYmogPSBvYmo7XHJcbiAgdGhpcy5zZXFQb3MgPSBzZXFQb3M7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIExvb3AodmFybmFtZSwgY291bnQpIHtcclxuICB0aGlzLmxvb3BEYXRhID0gbmV3IExvb3BEYXRhKHRoaXMsdmFybmFtZSxjb3VudCwwKTtcclxufVxyXG5cclxuTG9vcC5wcm90b3R5cGUucHJvY2VzcyA9IGZ1bmN0aW9uICh0cmFjaylcclxue1xyXG4gIHZhciBzdGFjayA9IHRyYWNrLnN0YWNrO1xyXG4gIGlmIChzdGFjay5sZW5ndGggPT0gMCB8fCBzdGFja1tzdGFjay5sZW5ndGggLSAxXS5vYmogIT09IHRoaXMpXHJcbiAge1xyXG4gICAgdmFyIGxkID0gdGhpcy5sb29wRGF0YTtcclxuICAgIHN0YWNrLnB1c2gobmV3IExvb3BEYXRhKHRoaXMsIGxkLnZhcm5hbWUsIGxkLmNvdW50LCB0cmFjay5zZXFQb3MpKTtcclxuICB9IFxyXG59XHJcblxyXG5mdW5jdGlvbiBMT09QKHZhcm5hbWUsIGNvdW50KSB7XHJcbiAgcmV0dXJuIG5ldyBMb29wKHZhcm5hbWUsY291bnQpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBMb29wRW5kKClcclxue1xyXG59XHJcblxyXG5Mb29wRW5kLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24odHJhY2spXHJcbntcclxuICB2YXIgbGQgPSB0cmFjay5zdGFja1t0cmFjay5zdGFjay5sZW5ndGggLSAxXTtcclxuICBsZC5jb3VudC0tO1xyXG4gIGlmIChsZC5jb3VudCA+IDApIHtcclxuICAgIHRyYWNrLnNlcVBvcyA9IGxkLnNlcVBvcztcclxuICB9IGVsc2Uge1xyXG4gICAgdHJhY2suc3RhY2sucG9wKCk7XHJcbiAgfVxyXG59XHJcblxyXG52YXIgTE9PUF9FTkQgPSBuZXcgTG9vcEVuZCgpO1xyXG5cclxuLy8vIOOCt+ODvOOCseODs+OCteODvOODiOODqeODg+OCr1xyXG5mdW5jdGlvbiBUcmFjayhzZXF1ZW5jZXIsc2VxZGF0YSxhdWRpbylcclxue1xyXG4gIHRoaXMubmFtZSA9ICcnO1xyXG4gIHRoaXMuZW5kID0gZmFsc2U7XHJcbiAgdGhpcy5vbmVzaG90ID0gZmFsc2U7XHJcbiAgdGhpcy5zZXF1ZW5jZXIgPSBzZXF1ZW5jZXI7XHJcbiAgdGhpcy5zZXFEYXRhID0gc2VxZGF0YTtcclxuICB0aGlzLnNlcVBvcyA9IDA7XHJcbiAgdGhpcy5tdXRlID0gZmFsc2U7XHJcbiAgdGhpcy5wbGF5aW5nVGltZSA9IC0xO1xyXG4gIHRoaXMubG9jYWxUZW1wbyA9IHNlcXVlbmNlci50ZW1wbztcclxuICB0aGlzLnRyYWNrVm9sdW1lID0gMS4wO1xyXG4gIHRoaXMudHJhbnNwb3NlID0gMDtcclxuICB0aGlzLnNvbG8gPSBmYWxzZTtcclxuICB0aGlzLmNoYW5uZWwgPSAtMTtcclxuICB0aGlzLnRyYWNrID0gLTE7XHJcbiAgdGhpcy5hdWRpbyA9IGF1ZGlvO1xyXG4gIHRoaXMuYmFjayA9IHtcclxuICAgIG5vdGU6IDcyLFxyXG4gICAgb2N0OiA1LFxyXG4gICAgc3RlcDogOTYsXHJcbiAgICBnYXRlOiA0OCxcclxuICAgIHZlbDoxLjBcclxuICB9XHJcbiAgdGhpcy5zdGFjayA9IFtdO1xyXG59XHJcblxyXG5UcmFjay5wcm90b3R5cGUgPSB7XHJcbiAgcHJvY2VzczogZnVuY3Rpb24gKGN1cnJlbnRUaW1lKSB7XHJcblxyXG4gICAgaWYgKHRoaXMuZW5kKSByZXR1cm47XHJcbiAgICBcclxuICAgIGlmICh0aGlzLm9uZXNob3QpIHtcclxuICAgICAgdGhpcy5yZXNldCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBzZXFTaXplID0gdGhpcy5zZXFEYXRhLmxlbmd0aDtcclxuICAgIGlmICh0aGlzLnNlcVBvcyA+PSBzZXFTaXplKSB7XHJcbiAgICAgIGlmKHRoaXMuc2VxdWVuY2VyLnJlcGVhdClcclxuICAgICAge1xyXG4gICAgICAgIHRoaXMuc2VxUG9zID0gMDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmVuZCA9IHRydWU7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHNlcSA9IHRoaXMuc2VxRGF0YTtcclxuICAgIHRoaXMucGxheWluZ1RpbWUgPSAodGhpcy5wbGF5aW5nVGltZSA+IC0xKSA/IHRoaXMucGxheWluZ1RpbWUgOiBjdXJyZW50VGltZTtcclxuICAgIHZhciBlbmRUaW1lID0gY3VycmVudFRpbWUgKyAwLjIvKnNlYyovO1xyXG5cclxuICAgIHdoaWxlICh0aGlzLnNlcVBvcyA8IHNlcVNpemUpIHtcclxuICAgICAgaWYgKHRoaXMucGxheWluZ1RpbWUgPj0gZW5kVGltZSAmJiAhdGhpcy5vbmVzaG90KSB7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIGQgPSBzZXFbdGhpcy5zZXFQb3NdO1xyXG4gICAgICAgIGQucHJvY2Vzcyh0aGlzKTtcclxuICAgICAgICB0aGlzLnNlcVBvcysrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuICByZXNldDpmdW5jdGlvbigpXHJcbiAge1xyXG4gICAgdmFyIGN1clZvaWNlID0gdGhpcy5hdWRpby52b2ljZXNbdGhpcy5jaGFubmVsXTtcclxuICAgIGN1clZvaWNlLmdhaW4uZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoMCk7XHJcbiAgICBjdXJWb2ljZS5wcm9jZXNzb3IucGxheWJhY2tSYXRlLmNhbmNlbFNjaGVkdWxlZFZhbHVlcygwKTtcclxuICAgIGN1clZvaWNlLmdhaW4uZ2Fpbi52YWx1ZSA9IDA7XHJcbiAgICB0aGlzLnBsYXlpbmdUaW1lID0gLTE7XHJcbiAgICB0aGlzLnNlcVBvcyA9IDA7XHJcbiAgICB0aGlzLmVuZCA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGxvYWRUcmFja3Moc2VsZix0cmFja3MsIHRyYWNrZGF0YSlcclxue1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdHJhY2tkYXRhLmxlbmd0aDsgKytpKSB7XHJcbiAgICB2YXIgdHJhY2sgPSBuZXcgVHJhY2soc2VsZiwgdHJhY2tkYXRhW2ldLmRhdGEsc2VsZi5hdWRpbyk7XHJcbiAgICB0cmFjay5jaGFubmVsID0gdHJhY2tkYXRhW2ldLmNoYW5uZWw7XHJcbiAgICB0cmFjay5vbmVzaG90ID0gKCF0cmFja2RhdGFbaV0ub25lc2hvdCk/ZmFsc2U6dHJ1ZTtcclxuICAgIHRyYWNrLnRyYWNrID0gaTtcclxuICAgIHRyYWNrcy5wdXNoKHRyYWNrKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVRyYWNrcyh0cmFja2RhdGEpXHJcbntcclxuICB2YXIgdHJhY2tzID0gW107XHJcbiAgbG9hZFRyYWNrcyh0aGlzLHRyYWNrcywgdHJhY2tkYXRhKTtcclxuICByZXR1cm4gdHJhY2tzO1xyXG59XHJcblxyXG4vLy8g44K344O844Kx44Oz44K144O85pys5L2TXHJcbmV4cG9ydCBmdW5jdGlvbiBTZXF1ZW5jZXIoYXVkaW8pIHtcclxuICB0aGlzLmF1ZGlvID0gYXVkaW87XHJcbiAgdGhpcy50ZW1wbyA9IDEwMC4wO1xyXG4gIHRoaXMucmVwZWF0ID0gZmFsc2U7XHJcbiAgdGhpcy5wbGF5ID0gZmFsc2U7XHJcbiAgdGhpcy50cmFja3MgPSBbXTtcclxuICB0aGlzLnBhdXNlVGltZSA9IDA7XHJcbiAgdGhpcy5zdGF0dXMgPSB0aGlzLlNUT1A7XHJcbn1cclxuXHJcblNlcXVlbmNlci5wcm90b3R5cGUgPSB7XHJcbiAgbG9hZDogZnVuY3Rpb24oZGF0YSlcclxuICB7XHJcbiAgICBpZih0aGlzLnBsYXkpIHtcclxuICAgICAgdGhpcy5zdG9wKCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnRyYWNrcy5sZW5ndGggPSAwO1xyXG4gICAgbG9hZFRyYWNrcyh0aGlzLHRoaXMudHJhY2tzLCBkYXRhLnRyYWNrcyx0aGlzLmF1ZGlvKTtcclxuICB9LFxyXG4gIHN0YXJ0OmZ1bmN0aW9uKClcclxuICB7XHJcbiAgICAvLyAgICB0aGlzLmhhbmRsZSA9IHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHsgc2VsZi5wcm9jZXNzKCkgfSwgNTApO1xyXG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLlBMQVk7XHJcbiAgICB0aGlzLnByb2Nlc3MoKTtcclxuICB9LFxyXG4gIHByb2Nlc3M6ZnVuY3Rpb24oKVxyXG4gIHtcclxuICAgIGlmICh0aGlzLnN0YXR1cyA9PSB0aGlzLlBMQVkpIHtcclxuICAgICAgdGhpcy5wbGF5VHJhY2tzKHRoaXMudHJhY2tzKTtcclxuICAgICAgdGhpcy5oYW5kbGUgPSB3aW5kb3cuc2V0VGltZW91dCh0aGlzLnByb2Nlc3MuYmluZCh0aGlzKSwgMTAwKTtcclxuICAgIH1cclxuICB9LFxyXG4gIHBsYXlUcmFja3M6IGZ1bmN0aW9uICh0cmFja3Mpe1xyXG4gICAgdmFyIGN1cnJlbnRUaW1lID0gdGhpcy5hdWRpby5hdWRpb2N0eC5jdXJyZW50VGltZTtcclxuIC8vICAgY29uc29sZS5sb2codGhpcy5hdWRpby5hdWRpb2N0eC5jdXJyZW50VGltZSk7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gdHJhY2tzLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIHRyYWNrc1tpXS5wcm9jZXNzKGN1cnJlbnRUaW1lKTtcclxuICAgIH1cclxuICB9LFxyXG4gIHBhdXNlOmZ1bmN0aW9uKClcclxuICB7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuUEFVU0U7XHJcbiAgICB0aGlzLnBhdXNlVGltZSA9IHRoaXMuYXVkaW8uYXVkaW9jdHguY3VycmVudFRpbWU7XHJcbiAgfSxcclxuICByZXN1bWU6ZnVuY3Rpb24gKClcclxuICB7XHJcbiAgICBpZiAodGhpcy5zdGF0dXMgPT0gdGhpcy5QQVVTRSkge1xyXG4gICAgICB0aGlzLnN0YXR1cyA9IHRoaXMuUExBWTtcclxuICAgICAgdmFyIHRyYWNrcyA9IHRoaXMudHJhY2tzO1xyXG4gICAgICB2YXIgYWRqdXN0ID0gdGhpcy5hdWRpby5hdWRpb2N0eC5jdXJyZW50VGltZSAtIHRoaXMucGF1c2VUaW1lO1xyXG4gICAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gdHJhY2tzLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgICAgdHJhY2tzW2ldLnBsYXlpbmdUaW1lICs9IGFkanVzdDtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLnByb2Nlc3MoKTtcclxuICAgIH1cclxuICB9LFxyXG4gIHN0b3A6IGZ1bmN0aW9uICgpXHJcbiAge1xyXG4gICAgaWYgKHRoaXMuc3RhdHVzICE9IHRoaXMuU1RPUCkge1xyXG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5oYW5kbGUpO1xyXG4gICAgICAvLyAgICBjbGVhckludGVydmFsKHRoaXMuaGFuZGxlKTtcclxuICAgICAgdGhpcy5zdGF0dXMgPSB0aGlzLlNUT1A7XHJcbiAgICAgIHRoaXMucmVzZXQoKTtcclxuICAgIH1cclxuICB9LFxyXG4gIHJlc2V0OmZ1bmN0aW9uKClcclxuICB7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gdGhpcy50cmFja3MubGVuZ3RoOyBpIDwgZW5kOyArK2kpXHJcbiAgICB7XHJcbiAgICAgIHRoaXMudHJhY2tzW2ldLnJlc2V0KCk7XHJcbiAgICB9XHJcbiAgfSxcclxuICBTVE9QOiAwIHwgMCxcclxuICBQTEFZOiAxIHwgMCxcclxuICBQQVVTRToyIHwgMFxyXG59XHJcblxyXG4vLy8g57Ch5piT6Y2155uk44Gu5a6f6KOFXHJcbmZ1bmN0aW9uIFBpYW5vKGF1ZGlvKSB7XHJcbiAgdGhpcy5hdWRpbyA9IGF1ZGlvO1xyXG4gIHRoaXMudGFibGUgPSBbOTAsIDgzLCA4OCwgNjgsIDY3LCA4NiwgNzEsIDY2LCA3MiwgNzgsIDc0LCA3NywgMTg4XTtcclxuICB0aGlzLmtleW9uID0gbmV3IEFycmF5KDEzKTtcclxufVxyXG5cclxuUGlhbm8ucHJvdG90eXBlID0ge1xyXG4gIG9uOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgdmFyIGluZGV4ID0gdGhpcy50YWJsZS5pbmRleE9mKGUua2V5Q29kZSwgMCk7XHJcbiAgICBpZiAoaW5kZXggPT0gLTEpIHtcclxuICAgICAgaWYgKGUua2V5Q29kZSA+IDQ4ICYmIGUua2V5Q29kZSA8IDU3KSB7XHJcbiAgICAgICAgdmFyIHRpbWJyZSA9IGUua2V5Q29kZSAtIDQ5O1xyXG4gICAgICAgIHRoaXMuYXVkaW8udm9pY2VzWzddLnNldFNhbXBsZSh3YXZlU2FtcGxlc1t0aW1icmVdKTtcclxuICAgICAgICB3YXZlR3JhcGgud2F2ZSA9IHdhdmVzW3RpbWJyZV07XHJcbiAgICAgICAgd2F2ZUdyYXBoLnJlbmRlcigpO1xyXG4gICAgICAgIHRleHRQbGFuZS5wcmludCg1LCAxMCwgXCJXYXZlIFwiICsgKHRpbWJyZSArIDEpKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vYXVkaW8udm9pY2VzWzBdLnByb2Nlc3Nvci5wbGF5YmFja1JhdGUudmFsdWUgPSBzZXF1ZW5jZXIubm90ZUZyZXFbXTtcclxuICAgICAgaWYgKCF0aGlzLmtleW9uW2luZGV4XSkge1xyXG4gICAgICAgIHRoaXMuYXVkaW8udm9pY2VzWzddLmtleW9uKDAsaW5kZXggKyAoZS5zaGlmdEtleSA/IDg0IDogNzIpLDEuMCk7XHJcbiAgICAgICAgdGhpcy5rZXlvbltpbmRleF0gPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgfSxcclxuICBvZmY6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICB2YXIgaW5kZXggPSB0aGlzLnRhYmxlLmluZGV4T2YoZS5rZXlDb2RlLCAwKTtcclxuICAgIGlmIChpbmRleCA9PSAtMSkge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmICh0aGlzLmtleW9uW2luZGV4XSkge1xyXG4gICAgICAgIGF1ZGlvLnZvaWNlc1s3XS5lbnZlbG9wZS5rZXlvZmYoMCk7XHJcbiAgICAgICAgdGhpcy5rZXlvbltpbmRleF0gPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgdmFyIHNlcURhdGEgPSB7XHJcbiAgbmFtZTogJ1Rlc3QnLFxyXG4gIHRyYWNrczogW1xyXG4gICAge1xyXG4gICAgICBuYW1lOiAncGFydDEnLFxyXG4gICAgICBjaGFubmVsOiAwLFxyXG4gICAgICBkYXRhOlxyXG4gICAgICBbXHJcbiAgICAgICAgRU5WKDAuMDEsIDAuMDIsIDAuNSwgMC4wNyksXHJcbiAgICAgICAgVEVNUE8oMTgwKSwgVE9ORSgwKSwgVk9MVU1FKDAuNSksIEwoOCksIEdUKC0wLjUpLE8oNCksXHJcbiAgICAgICAgTE9PUCgnaScsNCksXHJcbiAgICAgICAgQywgQywgQywgQywgQywgQywgQywgQyxcclxuICAgICAgICBMT09QX0VORCxcclxuICAgICAgICBKVU1QKDUpXHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6ICdwYXJ0MicsXHJcbiAgICAgIGNoYW5uZWw6IDEsXHJcbiAgICAgIGRhdGE6XHJcbiAgICAgICAgW1xyXG4gICAgICAgIEVOVigwLjAxLCAwLjA1LCAwLjYsIDAuMDcpLFxyXG4gICAgICAgIFRFTVBPKDE4MCksVE9ORSg2KSwgVk9MVU1FKDAuMiksIEwoOCksIEdUKC0wLjgpLFxyXG4gICAgICAgIFIoMSksIFIoMSksXHJcbiAgICAgICAgTyg2KSxMKDEpLCBGLFxyXG4gICAgICAgIEUsXHJcbiAgICAgICAgT0QsIEwoOCwgdHJ1ZSksIEJiLCBHLCBMKDQpLCBCYiwgT1UsIEwoNCksIEYsIEwoOCksIEQsXHJcbiAgICAgICAgTCg0LCB0cnVlKSwgRSwgTCgyKSwgQyxSKDgpLFxyXG4gICAgICAgIEpVTVAoOClcclxuICAgICAgICBdXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBuYW1lOiAncGFydDMnLFxyXG4gICAgICBjaGFubmVsOiAyLFxyXG4gICAgICBkYXRhOlxyXG4gICAgICAgIFtcclxuICAgICAgICBFTlYoMC4wMSwgMC4wNSwgMC42LCAwLjA3KSxcclxuICAgICAgICBURU1QTygxODApLFRPTkUoNiksIFZPTFVNRSgwLjEpLCBMKDgpLCBHVCgtMC41KSwgXHJcbiAgICAgICAgUigxKSwgUigxKSxcclxuICAgICAgICBPKDYpLEwoMSksIEMsQyxcclxuICAgICAgICBPRCwgTCg4LCB0cnVlKSwgRywgRCwgTCg0KSwgRywgT1UsIEwoNCksIEQsIEwoOCksT0QsIEcsXHJcbiAgICAgICAgTCg0LCB0cnVlKSwgT1UsQywgTCgyKSxPRCwgRywgUig4KSxcclxuICAgICAgICBKVU1QKDcpXHJcbiAgICAgICAgXVxyXG4gICAgfVxyXG4gIF1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIFNvdW5kRWZmZWN0cyhzZXF1ZW5jZXIpIHtcclxuICAgdGhpcy5zb3VuZEVmZmVjdHMgPVxyXG4gICAgW1xyXG4gICAgLy8gRWZmZWN0IDAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICBjcmVhdGVUcmFja3MuY2FsbChzZXF1ZW5jZXIsW1xyXG4gICAge1xyXG4gICAgICBjaGFubmVsOiA4LFxyXG4gICAgICBvbmVzaG90OnRydWUsXHJcbiAgICAgIGRhdGE6IFtWT0xVTUUoMC41KSxcclxuICAgICAgICBFTlYoMC4wMDAxLCAwLjAxLCAxLjAsIDAuMDAwMSksR1QoLTAuOTk5KSxUT05FKDApLCBURU1QTygyMDApLCBPKDgpLFNUKDMpLCBDLCBELCBFLCBGLCBHLCBBLCBCLCBPVSwgQywgRCwgRSwgRywgQSwgQixCLEIsQlxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBjaGFubmVsOiA5LFxyXG4gICAgICBvbmVzaG90OiB0cnVlLFxyXG4gICAgICBkYXRhOiBbVk9MVU1FKDAuNSksXHJcbiAgICAgICAgRU5WKDAuMDAwMSwgMC4wMSwgMS4wLCAwLjAwMDEpLCBERVRVTkUoMC45KSwgR1QoLTAuOTk5KSwgVE9ORSgwKSwgVEVNUE8oMjAwKSwgTyg1KSwgU1QoMyksIEMsIEQsIEUsIEYsIEcsIEEsIEIsIE9VLCBDLCBELCBFLCBHLCBBLCBCLEIsQixCXHJcbiAgICAgIF1cclxuICAgIH1cclxuICAgIF0pLFxyXG4gICAgLy8gRWZmZWN0IDEgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgY3JlYXRlVHJhY2tzLmNhbGwoc2VxdWVuY2VyLFxyXG4gICAgICBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgY2hhbm5lbDogMTAsXHJcbiAgICAgICAgICBvbmVzaG90OiB0cnVlLFxyXG4gICAgICAgICAgZGF0YTogW1xyXG4gICAgICAgICAgIFRPTkUoNCksIFRFTVBPKDE1MCksIFNUKDQpLCBHVCgtMC45OTk5KSwgRU5WKDAuMDAwMSwgMC4wMDAxLCAxLjAsIDAuMDAwMSksXHJcbiAgICAgICAgICAgTyg2KSwgRywgQSwgQiwgTyg3KSwgQiwgQSwgRywgRiwgRSwgRCwgQywgRSwgRywgQSwgQiwgT0QsIEIsIEEsIEcsIEYsIEUsIEQsIEMsIE9ELCBCLCBBLCBHLCBGLCBFLCBELCBDXHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgICBdKSxcclxuICAgIC8vIEVmZmVjdCAyLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgIGNyZWF0ZVRyYWNrcy5jYWxsKHNlcXVlbmNlcixcclxuICAgICAgW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIGNoYW5uZWw6IDEwLFxyXG4gICAgICAgICAgb25lc2hvdDogdHJ1ZSxcclxuICAgICAgICAgIGRhdGE6IFtcclxuICAgICAgICAgICBUT05FKDApLCBURU1QTygxNTApLCBTVCgyKSwgR1QoLTAuOTk5OSksIEVOVigwLjAwMDEsIDAuMDAwMSwgMS4wLCAwLjAwMDEpLFxyXG4gICAgICAgICAgIE8oOCksIEMsRCxFLEYsRyxBLEIsT1UsQyxELEUsRixPRCxHLE9VLEEsT0QsQixPVSxBLE9ELEcsT1UsRixPRCxFLE9VLEVcclxuICAgICAgICAgIF1cclxuICAgICAgICB9XHJcbiAgICAgIF0pLFxyXG4gICAgICAvLyBFZmZlY3QgMyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgICAgY3JlYXRlVHJhY2tzLmNhbGwoc2VxdWVuY2VyLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgY2hhbm5lbDogMTAsXHJcbiAgICAgICAgICAgIG9uZXNob3Q6IHRydWUsXHJcbiAgICAgICAgICAgIGRhdGE6IFtcclxuICAgICAgICAgICAgIFRPTkUoNSksIFRFTVBPKDE1MCksIEwoNjQpLCBHVCgtMC45OTk5KSwgRU5WKDAuMDAwMSwgMC4wMDAxLCAxLjAsIDAuMDAwMSksXHJcbiAgICAgICAgICAgICBPKDYpLEMsT0QsQyxPVSxDLE9ELEMsT1UsQyxPRCxDLE9VLEMsT0RcclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIF0pLFxyXG4gICAgICAvLyBFZmZlY3QgNCAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICAgIGNyZWF0ZVRyYWNrcy5jYWxsKHNlcXVlbmNlcixcclxuICAgICAgICBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGNoYW5uZWw6IDExLFxyXG4gICAgICAgICAgICBvbmVzaG90OiB0cnVlLFxyXG4gICAgICAgICAgICBkYXRhOiBbXHJcbiAgICAgICAgICAgICBUT05FKDgpLCBWT0xVTUUoMi4wKSxURU1QTygxMjApLCBMKDIpLCBHVCgtMC45OTk5KSwgRU5WKDAuMDAwMSwgMC4wMDAxLCAxLjAsIDAuMjUpLFxyXG4gICAgICAgICAgICAgTygxKSwgQ1xyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgXSlcclxuICAgXTtcclxuIH1cclxuXHJcblxyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5leHBvcnQgY2xhc3MgQ29tbSB7XHJcbiAgY29uc3RydWN0b3IoKXtcclxuICAgIHZhciBob3N0ID0gd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLm1hdGNoKC93d3dcXC5zZnBnbXJcXC5uZXQvaWcpPyd3d3cuc2ZwZ21yLm5ldCc6J2xvY2FsaG9zdCc7XHJcbiAgICB0aGlzLmVuYWJsZSA9IGZhbHNlO1xyXG4gICAgdHJ5IHtcclxuICAgICAgdGhpcy5zb2NrZXQgPSBpby5jb25uZWN0KCdodHRwOi8vJyArIGhvc3QgKyAnOjgwODEvdGVzdCcpO1xyXG4gICAgICB0aGlzLmVuYWJsZSA9IHRydWU7XHJcbiAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgdGhpcy5zb2NrZXQub24oJ3NlbmRIaWdoU2NvcmVzJywgKGRhdGEpPT57XHJcbiAgICAgICAgaWYodGhpcy51cGRhdGVIaWdoU2NvcmVzKXtcclxuICAgICAgICAgIHRoaXMudXBkYXRlSGlnaFNjb3JlcyhkYXRhKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICB0aGlzLnNvY2tldC5vbignc2VuZEhpZ2hTY29yZScsIChkYXRhKT0+e1xyXG4gICAgICAgIHRoaXMudXBkYXRlSGlnaFNjb3JlKGRhdGEpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMuc29ja2V0Lm9uKCdzZW5kUmFuaycsIChkYXRhKSA9PiB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVIaWdoU2NvcmVzKGRhdGEuaGlnaFNjb3Jlcyk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdGhpcy5zb2NrZXQub24oJ2Vycm9yQ29ubmVjdGlvbk1heCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBhbGVydCgn5ZCM5pmC5o6l57aa44Gu5LiK6ZmQ44Gr6YGU44GX44G+44GX44Gf44CCJyk7XHJcbiAgICAgICAgc2VsZi5lbmFibGUgPSBmYWxzZTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLnNvY2tldC5vbignZGlzY29ubmVjdCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAoc2VsZi5lbmFibGUpIHtcclxuICAgICAgICAgIHNlbGYuZW5hYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICBhbGVydCgn44K144O844OQ44O85o6l57aa44GM5YiH5pat44GV44KM44G+44GX44Gf44CCJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIGFsZXJ0KCdTb2NrZXQuSU/jgYzliKnnlKjjgafjgY3jgarjgYTjgZ/jgoHjgIHjg4/jgqTjgrnjgrPjgqLmg4XloLHjgYzlj5blvpfjgafjgY3jgb7jgZvjgpPjgIInICsgZSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIHNlbmRTY29yZShzY29yZSlcclxuICB7XHJcbiAgICBpZiAodGhpcy5lbmFibGUpIHtcclxuICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnc2VuZFNjb3JlJywgc2NvcmUpO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBkaXNjb25uZWN0KClcclxuICB7XHJcbiAgICBpZiAodGhpcy5lbmFibGUpIHtcclxuICAgICAgdGhpcy5lbmFibGUgPSBmYWxzZTtcclxuICAgICAgdGhpcy5zb2NrZXQuZGlzY29ubmVjdCgpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0ICogYXMgc2ZnIGZyb20gJy4vZ2xvYmFsJztcclxuaW1wb3J0ICogIGFzIGdhbWVvYmogZnJvbSAnLi9nYW1lb2JqJztcclxuaW1wb3J0ICogYXMgZ3JhcGhpY3MgZnJvbSAnLi9ncmFwaGljcyc7XHJcblxyXG5cclxuLy8vIOeIhueZulxyXG5leHBvcnQgY2xhc3MgQm9tYiBleHRlbmRzIGdhbWVvYmouR2FtZU9iaiBcclxue1xyXG4gIGNvbnN0cnVjdG9yKHNjZW5lLHNlKSB7XHJcbiAgICBzdXBlcigwLDAsMCk7XHJcbiAgICB2YXIgdGV4ID0gc2ZnLnRleHR1cmVGaWxlcy5ib21iO1xyXG4gICAgdmFyIG1hdGVyaWFsID0gZ3JhcGhpY3MuY3JlYXRlU3ByaXRlTWF0ZXJpYWwodGV4KTtcclxuICAgIG1hdGVyaWFsLmJsZW5kaW5nID0gVEhSRUUuQWRkaXRpdmVCbGVuZGluZztcclxuICAgIG1hdGVyaWFsLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIHZhciBnZW9tZXRyeSA9IGdyYXBoaWNzLmNyZWF0ZVNwcml0ZUdlb21ldHJ5KDE2KTtcclxuICAgIGdyYXBoaWNzLmNyZWF0ZVNwcml0ZVVWKGdlb21ldHJ5LCB0ZXgsIDE2LCAxNiwgMCk7XHJcbiAgICB0aGlzLm1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gICAgdGhpcy5tZXNoLnBvc2l0aW9uLnogPSAwLjE7XHJcbiAgICB0aGlzLmluZGV4ID0gMDtcclxuICAgIHRoaXMubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICB0aGlzLnNjZW5lID0gc2NlbmU7XHJcbiAgICB0aGlzLnNlID0gc2U7XHJcbiAgICBzY2VuZS5hZGQodGhpcy5tZXNoKTtcclxuICB9XHJcbiAgZ2V0IHgoKSB7IHJldHVybiB0aGlzLnhfOyB9XHJcbiAgc2V0IHgodikgeyB0aGlzLnhfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnggPSB2OyB9XHJcbiAgZ2V0IHkoKSB7IHJldHVybiB0aGlzLnlfOyB9XHJcbiAgc2V0IHkodikgeyB0aGlzLnlfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnkgPSB2OyB9XHJcbiAgZ2V0IHooKSB7IHJldHVybiB0aGlzLnpfOyB9XHJcbiAgc2V0IHoodikgeyB0aGlzLnpfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnogPSB2OyB9XHJcbiAgXHJcbiAgc3RhcnQoeCwgeSwgeiwgZGVsYXkpIHtcclxuICAgIGlmICh0aGlzLmVuYWJsZV8pIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgdGhpcy5kZWxheSA9IGRlbGF5IHwgMDtcclxuICAgIHRoaXMueCA9IHg7XHJcbiAgICB0aGlzLnkgPSB5O1xyXG4gICAgdGhpcy56ID0geiB8IDAuMDAwMDI7XHJcbiAgICB0aGlzLmVuYWJsZV8gPSB0cnVlO1xyXG4gICAgZ3JhcGhpY3MudXBkYXRlU3ByaXRlVVYodGhpcy5tZXNoLmdlb21ldHJ5LCBzZmcudGV4dHVyZUZpbGVzLmJvbWIsIDE2LCAxNiwgdGhpcy5pbmRleCk7XHJcbiAgICB0aGlzLnRhc2sgPSBzZmcudGFza3MucHVzaFRhc2sodGhpcy5tb3ZlLmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5tZXNoLm1hdGVyaWFsLm9wYWNpdHkgPSAxLjA7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbiAgXHJcbiAgKm1vdmUodGFza0luZGV4KSB7XHJcbiAgICBcclxuICAgIGZvciggbGV0IGkgPSAwLGUgPSB0aGlzLmRlbGF5O2kgPCBlICYmIHRhc2tJbmRleCA+PSAwOysraSlcclxuICAgIHtcclxuICAgICAgdGFza0luZGV4ID0geWllbGQ7ICAgICAgXHJcbiAgICB9XHJcbiAgICB0aGlzLm1lc2gudmlzaWJsZSA9IHRydWU7XHJcblxyXG4gICAgZm9yKGxldCBpID0gMDtpIDwgNyAmJiB0YXNrSW5kZXggPj0gMDsrK2kpXHJcbiAgICB7XHJcbiAgICAgIGdyYXBoaWNzLnVwZGF0ZVNwcml0ZVVWKHRoaXMubWVzaC5nZW9tZXRyeSwgc2ZnLnRleHR1cmVGaWxlcy5ib21iLCAxNiwgMTYsIGkpO1xyXG4gICAgICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgdGhpcy5lbmFibGVfID0gZmFsc2U7XHJcbiAgICB0aGlzLm1lc2gudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgc2ZnLnRhc2tzLnJlbW92ZVRhc2sodGFza0luZGV4KTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBCb21icyB7XHJcbiAgY29uc3RydWN0b3Ioc2NlbmUsIHNlKSB7XHJcbiAgICB0aGlzLmJvbWJzID0gbmV3IEFycmF5KDApO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzMjsgKytpKSB7XHJcbiAgICAgIHRoaXMuYm9tYnMucHVzaChuZXcgQm9tYihzY2VuZSwgc2UpKTtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgc3RhcnQoeCwgeSwgeikge1xyXG4gICAgdmFyIGJvbXMgPSB0aGlzLmJvbWJzO1xyXG4gICAgdmFyIGNvdW50ID0gMztcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSBib21zLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIGlmICghYm9tc1tpXS5lbmFibGVfKSB7XHJcbiAgICAgICAgaWYgKGNvdW50ID09IDIpIHtcclxuICAgICAgICAgIGJvbXNbaV0uc3RhcnQoeCwgeSwgeiwgMCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGJvbXNbaV0uc3RhcnQoeCArIChNYXRoLnJhbmRvbSgpICogMTYgLSA4KSwgeSArIChNYXRoLnJhbmRvbSgpICogMTYgLSA4KSwgeiwgTWF0aC5yYW5kb20oKSAqIDgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb3VudC0tO1xyXG4gICAgICAgIGlmICghY291bnQpIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXNldCgpe1xyXG4gICAgdGhpcy5ib21icy5mb3JFYWNoKChkKT0+e1xyXG4gICAgICBpZihkLmVuYWJsZV8pe1xyXG4gICAgICAgIHdoaWxlKCFzZmcudGFza3MuYXJyYXlbZC50YXNrLmluZGV4XS5nZW5JbnN0Lm5leHQoLSgxK2QudGFzay5pbmRleCkpLmRvbmUpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgKiAgYXMgZ2FtZW9iaiBmcm9tICcuL2dhbWVvYmonO1xyXG5pbXBvcnQgKiBhcyBzZmcgZnJvbSAnLi9nbG9iYWwnO1xyXG5pbXBvcnQgKiBhcyBncmFwaGljcyBmcm9tICcuL2dyYXBoaWNzJztcclxuXHJcbi8vLyDmlbXlvL5cclxuZXhwb3J0IGNsYXNzIEVuZW15QnVsbGV0IGV4dGVuZHMgZ2FtZW9iai5HYW1lT2JqIHtcclxuICBjb25zdHJ1Y3RvcihzY2VuZSwgc2UpIHtcclxuICAgIHN1cGVyKDAsIDAsIDApO1xyXG4gICAgdGhpcy5OT05FID0gMDtcclxuICAgIHRoaXMuTU9WRSA9IDE7XHJcbiAgICB0aGlzLkJPTUIgPSAyO1xyXG4gICAgdGhpcy5jb2xsaXNpb25BcmVhLndpZHRoID0gMjtcclxuICAgIHRoaXMuY29sbGlzaW9uQXJlYS5oZWlnaHQgPSAyO1xyXG4gICAgdmFyIHRleCA9IHNmZy50ZXh0dXJlRmlsZXMuZW5lbXk7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVNYXRlcmlhbCh0ZXgpO1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gZ3JhcGhpY3MuY3JlYXRlU3ByaXRlR2VvbWV0cnkoMTYpO1xyXG4gICAgZ3JhcGhpY3MuY3JlYXRlU3ByaXRlVVYoZ2VvbWV0cnksIHRleCwgMTYsIDE2LCAwKTtcclxuICAgIHRoaXMubWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgICB0aGlzLnogPSAwLjA7XHJcbiAgICB0aGlzLm12UGF0dGVybiA9IG51bGw7XHJcbiAgICB0aGlzLm12ID0gbnVsbDtcclxuICAgIHRoaXMubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICB0aGlzLnR5cGUgPSBudWxsO1xyXG4gICAgdGhpcy5saWZlID0gMDtcclxuICAgIHRoaXMuZHggPSAwO1xyXG4gICAgdGhpcy5keSA9IDA7XHJcbiAgICB0aGlzLnNwZWVkID0gMi4wO1xyXG4gICAgdGhpcy5lbmFibGUgPSBmYWxzZTtcclxuICAgIHRoaXMuaGl0XyA9IG51bGw7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuTk9ORTtcclxuICAgIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuICAgIHNjZW5lLmFkZCh0aGlzLm1lc2gpO1xyXG4gICAgdGhpcy5zZSA9IHNlO1xyXG4gIH1cclxuXHJcbiAgZ2V0IHgoKSB7IHJldHVybiB0aGlzLnhfOyB9XHJcbiAgc2V0IHgodikgeyB0aGlzLnhfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnggPSB2OyB9XHJcbiAgZ2V0IHkoKSB7IHJldHVybiB0aGlzLnlfOyB9XHJcbiAgc2V0IHkodikgeyB0aGlzLnlfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnkgPSB2OyB9XHJcbiAgZ2V0IHooKSB7IHJldHVybiB0aGlzLnpfOyB9XHJcbiAgc2V0IHoodikgeyB0aGlzLnpfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnogPSB2OyB9XHJcbiAgZ2V0IGVuYWJsZSgpIHtcclxuICAgIHJldHVybiB0aGlzLmVuYWJsZV87XHJcbiAgfVxyXG4gIFxyXG4gIHNldCBlbmFibGUodikge1xyXG4gICAgdGhpcy5lbmFibGVfID0gdjtcclxuICAgIHRoaXMubWVzaC52aXNpYmxlID0gdjtcclxuICB9XHJcbiAgXHJcbiAgKm1vdmUodGFza0luZGV4KSB7XHJcbiAgICBmb3IoO3RoaXMueCA+PSAoc2ZnLlZfTEVGVCAtIDE2KSAmJlxyXG4gICAgICAgIHRoaXMueCA8PSAoc2ZnLlZfUklHSFQgKyAxNikgJiZcclxuICAgICAgICB0aGlzLnkgPj0gKHNmZy5WX0JPVFRPTSAtIDE2KSAmJlxyXG4gICAgICAgIHRoaXMueSA8PSAoc2ZnLlZfVE9QICsgMTYpICYmIHRhc2tJbmRleCA+PSAwO1xyXG4gICAgICAgIHRoaXMueCArPSB0aGlzLmR4LHRoaXMueSArPSB0aGlzLmR5KVxyXG4gICAge1xyXG4gICAgICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgaWYodGFza0luZGV4ID49IDApe1xyXG4gICAgICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICAgIH1cclxuICAgIHRoaXMubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuTk9ORTtcclxuICAgIHRoaXMuZW5hYmxlID0gZmFsc2U7XHJcbiAgICBzZmcudGFza3MucmVtb3ZlVGFzayh0YXNrSW5kZXgpO1xyXG4gIH1cclxuICAgXHJcbiAgc3RhcnQoeCwgeSwgeikge1xyXG4gICAgaWYgKHRoaXMuZW5hYmxlKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHRoaXMueCA9IHggfHwgMDtcclxuICAgIHRoaXMueSA9IHkgfHwgMDtcclxuICAgIHRoaXMueiA9IHogfHwgMDtcclxuICAgIHRoaXMuZW5hYmxlID0gdHJ1ZTtcclxuICAgIGlmICh0aGlzLnN0YXR1cyAhPSB0aGlzLk5PTkUpXHJcbiAgICB7XHJcbiAgICAgIGRlYnVnZ2VyO1xyXG4gICAgfVxyXG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLk1PVkU7XHJcbiAgICB2YXIgYWltUmFkaWFuID0gTWF0aC5hdGFuMihzZmcubXlzaGlwXy55IC0geSwgc2ZnLm15c2hpcF8ueCAtIHgpO1xyXG4gICAgdGhpcy5tZXNoLnJvdGF0aW9uLnogPSBhaW1SYWRpYW47XHJcbiAgICB0aGlzLmR4ID0gTWF0aC5jb3MoYWltUmFkaWFuKSAqICh0aGlzLnNwZWVkICsgc2ZnLnN0YWdlLmRpZmZpY3VsdHkpO1xyXG4gICAgdGhpcy5keSA9IE1hdGguc2luKGFpbVJhZGlhbikgKiAodGhpcy5zcGVlZCArIHNmZy5zdGFnZS5kaWZmaWN1bHR5KTtcclxuLy8gICAgY29uc29sZS5sb2coJ2R4OicgKyB0aGlzLmR4ICsgJyBkeTonICsgdGhpcy5keSk7XHJcblxyXG4gICAgdGhpcy50YXNrID0gc2ZnLnRhc2tzLnB1c2hUYXNrKHRoaXMubW92ZS5iaW5kKHRoaXMpKTtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuIFxyXG4gIGhpdCgpIHtcclxuICAgIHRoaXMuZW5hYmxlID0gZmFsc2U7XHJcbiAgICBzZmcudGFza3MucmVtb3ZlVGFzayh0aGlzLnRhc2suaW5kZXgpO1xyXG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLk5PTkU7XHJcbiAgfVxyXG59XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIEVuZW15QnVsbGV0cyB7XHJcbiAgY29uc3RydWN0b3Ioc2NlbmUsIHNlKSB7XHJcbiAgICB0aGlzLnNjZW5lID0gc2NlbmU7XHJcbiAgICB0aGlzLmVuZW15QnVsbGV0cyA9IFtdO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA0ODsgKytpKSB7XHJcbiAgICAgIHRoaXMuZW5lbXlCdWxsZXRzLnB1c2gobmV3IEVuZW15QnVsbGV0KHRoaXMuc2NlbmUsIHNlKSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHN0YXJ0KHgsIHksIHopIHtcclxuICAgIHZhciBlYnMgPSB0aGlzLmVuZW15QnVsbGV0cztcclxuICAgIGZvcih2YXIgaSA9IDAsZW5kID0gZWJzLmxlbmd0aDtpPCBlbmQ7KytpKXtcclxuICAgICAgaWYoIWVic1tpXS5lbmFibGUpe1xyXG4gICAgICAgIGVic1tpXS5zdGFydCh4LCB5LCB6KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICByZXNldCgpXHJcbiAge1xyXG4gICAgdGhpcy5lbmVteUJ1bGxldHMuZm9yRWFjaCgoZCxpKT0+e1xyXG4gICAgICBpZihkLmVuYWJsZSl7XHJcbiAgICAgICAgd2hpbGUoIXNmZy50YXNrcy5hcnJheVtkLnRhc2suaW5kZXhdLmdlbkluc3QubmV4dCgtKDEgKyBkLnRhc2suaW5kZXgpKS5kb25lKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g5pW144Kt44Oj44Op44Gu5YuV44GNIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuLy8vIOebtOe3mumBi+WLlVxyXG5jbGFzcyBMaW5lTW92ZSB7XHJcbiAgY29uc3RydWN0b3IocmFkLCBzcGVlZCwgc3RlcCkge1xyXG4gICAgdGhpcy5yYWQgPSByYWQ7XHJcbiAgICB0aGlzLnNwZWVkID0gc3BlZWQ7XHJcbiAgICB0aGlzLnN0ZXAgPSBzdGVwO1xyXG4gICAgdGhpcy5jdXJyZW50U3RlcCA9IHN0ZXA7XHJcbiAgICB0aGlzLmR4ID0gTWF0aC5jb3MocmFkKSAqIHNwZWVkO1xyXG4gICAgdGhpcy5keSA9IE1hdGguc2luKHJhZCkgKiBzcGVlZDtcclxuICB9XHJcbiAgXHJcbiAgKm1vdmUoc2VsZix4LHkpIFxyXG4gIHtcclxuICAgIFxyXG4gICAgaWYgKHNlbGYueHJldikge1xyXG4gICAgICBzZWxmLmNoYXJSYWQgPSBNYXRoLlBJIC0gKHRoaXMucmFkIC0gTWF0aC5QSSAvIDIpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2VsZi5jaGFyUmFkID0gdGhpcy5yYWQgLSBNYXRoLlBJIC8gMjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgbGV0IGR5ID0gdGhpcy5keTtcclxuICAgIGxldCBkeCA9IHRoaXMuZHg7XHJcbiAgICBjb25zdCBzdGVwID0gdGhpcy5zdGVwO1xyXG4gICAgXHJcbiAgICBpZihzZWxmLnhyZXYpe1xyXG4gICAgICBkeCA9IC1keDsgICAgICBcclxuICAgIH1cclxuICAgIGxldCBjYW5jZWwgPSBmYWxzZTtcclxuICAgIGZvcihsZXQgaSA9IDA7aSA8IHN0ZXAgJiYgIWNhbmNlbDsrK2kpe1xyXG4gICAgICBzZWxmLnggKz0gZHg7XHJcbiAgICAgIHNlbGYueSArPSBkeTtcclxuICAgICAgY2FuY2VsID0geWllbGQ7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIGNsb25lKCl7XHJcbiAgICByZXR1cm4gbmV3IExpbmVNb3ZlKHRoaXMucmFkLHRoaXMuc3BlZWQsdGhpcy5zdGVwKTtcclxuICB9XHJcbiAgXHJcbiAgdG9KU09OKCl7XHJcbiAgICByZXR1cm4gW1xyXG4gICAgICBcIkxpbmVNb3ZlXCIsXHJcbiAgICAgIHRoaXMucmFkLFxyXG4gICAgICB0aGlzLnNwZWVkLFxyXG4gICAgICB0aGlzLnN0ZXBcclxuICAgIF07XHJcbiAgfVxyXG4gIFxyXG4gIHN0YXRpYyBmcm9tQXJyYXkoYXJyYXkpXHJcbiAge1xyXG4gICAgcmV0dXJuIG5ldyBMaW5lTW92ZShhcnJheVsxXSxhcnJheVsyXSxhcnJheVszXSk7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g5YaG6YGL5YuVXHJcbmNsYXNzIENpcmNsZU1vdmUge1xyXG4gIGNvbnN0cnVjdG9yKHN0YXJ0UmFkLCBzdG9wUmFkLCByLCBzcGVlZCwgbGVmdCkge1xyXG4gICAgdGhpcy5zdGFydFJhZCA9IChzdGFydFJhZCB8fCAwKTtcclxuICAgIHRoaXMuc3RvcFJhZCA9ICAoc3RvcFJhZCB8fCAxLjApO1xyXG4gICAgdGhpcy5yID0gciB8fCAxMDA7XHJcbiAgICB0aGlzLnNwZWVkID0gc3BlZWQgfHwgMS4wO1xyXG4gICAgdGhpcy5sZWZ0ID0gIWxlZnQgPyBmYWxzZSA6IHRydWU7XHJcbiAgICB0aGlzLmRlbHRhcyA9IFtdO1xyXG4gICAgdGhpcy5zdGFydFJhZF8gPSB0aGlzLnN0YXJ0UmFkICogTWF0aC5QSTtcclxuICAgIHRoaXMuc3RvcFJhZF8gPSB0aGlzLnN0b3BSYWQgKiBNYXRoLlBJO1xyXG4gICAgbGV0IHJhZCA9IHRoaXMuc3RhcnRSYWRfO1xyXG4gICAgbGV0IHN0ZXAgPSAobGVmdCA/IDEgOiAtMSkgKiB0aGlzLnNwZWVkIC8gcjtcclxuICAgIGxldCBlbmQgPSBmYWxzZTtcclxuICAgIFxyXG4gICAgd2hpbGUgKCFlbmQpIHtcclxuICAgICAgcmFkICs9IHN0ZXA7XHJcbiAgICAgIGlmICgobGVmdCAmJiAocmFkID49IHRoaXMuc3RvcFJhZF8pKSB8fCAoIWxlZnQgJiYgcmFkIDw9IHRoaXMuc3RvcFJhZF8pKSB7XHJcbiAgICAgICAgcmFkID0gdGhpcy5zdG9wUmFkXztcclxuICAgICAgICBlbmQgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuZGVsdGFzLnB1c2goe1xyXG4gICAgICAgIHg6IHRoaXMuciAqIE1hdGguY29zKHJhZCksXHJcbiAgICAgICAgeTogdGhpcy5yICogTWF0aC5zaW4ocmFkKSxcclxuICAgICAgICByYWQ6IHJhZFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBcclxuICAqbW92ZShzZWxmLHgseSkge1xyXG4gICAgLy8g5Yid5pyf5YyWXHJcbiAgICBsZXQgc3gsc3k7XHJcbiAgICBpZiAoc2VsZi54cmV2KSB7XHJcbiAgICAgIHN4ID0geCAtIHRoaXMuciAqIE1hdGguY29zKHRoaXMuc3RhcnRSYWRfICsgTWF0aC5QSSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzeCA9IHggLSB0aGlzLnIgKiBNYXRoLmNvcyh0aGlzLnN0YXJ0UmFkXyk7XHJcbiAgICB9XHJcbiAgICBzeSA9IHkgLSB0aGlzLnIgKiBNYXRoLnNpbih0aGlzLnN0YXJ0UmFkXyk7XHJcblxyXG4gICAgbGV0IGNhbmNlbCA9IGZhbHNlO1xyXG4gICAgLy8g56e75YuVXHJcbiAgICBmb3IobGV0IGkgPSAwLGUgPSB0aGlzLmRlbHRhcy5sZW5ndGg7KGkgPCBlKSAmJiAhY2FuY2VsOysraSlcclxuICAgIHtcclxuICAgICAgdmFyIGRlbHRhID0gdGhpcy5kZWx0YXNbaV07XHJcbiAgICAgIGlmKHNlbGYueHJldil7XHJcbiAgICAgICAgc2VsZi54ID0gc3ggLSBkZWx0YS54O1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNlbGYueCA9IHN4ICsgZGVsdGEueDtcclxuICAgICAgfVxyXG5cclxuICAgICAgc2VsZi55ID0gc3kgKyBkZWx0YS55O1xyXG4gICAgICBpZiAoc2VsZi54cmV2KSB7XHJcbiAgICAgICAgc2VsZi5jaGFyUmFkID0gKE1hdGguUEkgLSBkZWx0YS5yYWQpICsgKHRoaXMubGVmdCA/IC0xIDogMCkgKiBNYXRoLlBJO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNlbGYuY2hhclJhZCA9IGRlbHRhLnJhZCArICh0aGlzLmxlZnQgPyAwIDogLTEpICogTWF0aC5QSTtcclxuICAgICAgfVxyXG4gICAgICBzZWxmLnJhZCA9IGRlbHRhLnJhZDtcclxuICAgICAgY2FuY2VsID0geWllbGQ7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIHRvSlNPTigpe1xyXG4gICAgcmV0dXJuIFsgJ0NpcmNsZU1vdmUnLFxyXG4gICAgICB0aGlzLnN0YXJ0UmFkLFxyXG4gICAgICB0aGlzLnN0b3BSYWQsXHJcbiAgICAgIHRoaXMucixcclxuICAgICAgdGhpcy5zcGVlZCxcclxuICAgICAgdGhpcy5sZWZ0XHJcbiAgICBdO1xyXG4gIH1cclxuICBcclxuICBjbG9uZSgpe1xyXG4gICAgcmV0dXJuIG5ldyBDaXJjbGVNb3ZlKHRoaXMuc3RhcnRSYWQsdGhpcy5zdG9wUmFkLHRoaXMucix0aGlzLnNwZWVkLHRoaXMubGVmdCk7XHJcbiAgfVxyXG4gIFxyXG4gIHN0YXRpYyBmcm9tQXJyYXkoYSl7XHJcbiAgICByZXR1cm4gbmV3IENpcmNsZU1vdmUoYVsxXSxhWzJdLGFbM10sYVs0XSxhWzVdKTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDjg5vjg7zjg6Djg53jgrjjgrfjg6fjg7PjgavmiLvjgotcclxuY2xhc3MgR290b0hvbWUge1xyXG5cclxuICptb3ZlKHNlbGYsIHgsIHkpIHtcclxuICAgIGxldCByYWQgPSBNYXRoLmF0YW4yKHNlbGYuaG9tZVkgLSBzZWxmLnksIHNlbGYuaG9tZVggLSBzZWxmLngpO1xyXG4gICAgbGV0IHNwZWVkID0gNDtcclxuXHJcbiAgICBzZWxmLmNoYXJSYWQgPSByYWQgLSBNYXRoLlBJIC8gMjtcclxuICAgIGxldCBkeCA9IE1hdGguY29zKHJhZCkgKiBzcGVlZDtcclxuICAgIGxldCBkeSA9IE1hdGguc2luKHJhZCkgKiBzcGVlZDtcclxuICAgIHNlbGYueiA9IDAuMDtcclxuICAgIFxyXG4gICAgbGV0IGNhbmNlbCA9IGZhbHNlO1xyXG4gICAgZm9yKDsoTWF0aC5hYnMoc2VsZi54IC0gc2VsZi5ob21lWCkgPj0gMiB8fCBNYXRoLmFicyhzZWxmLnkgLSBzZWxmLmhvbWVZKSA+PSAyKSAmJiAhY2FuY2VsXHJcbiAgICAgIDtzZWxmLnggKz0gZHgsc2VsZi55ICs9IGR5KVxyXG4gICAge1xyXG4gICAgICBjYW5jZWwgPSB5aWVsZDtcclxuICAgIH1cclxuXHJcbiAgICBzZWxmLmNoYXJSYWQgPSAwO1xyXG4gICAgc2VsZi54ID0gc2VsZi5ob21lWDtcclxuICAgIHNlbGYueSA9IHNlbGYuaG9tZVk7XHJcbiAgICBpZiAoc2VsZi5zdGF0dXMgPT0gc2VsZi5TVEFSVCkge1xyXG4gICAgICB2YXIgZ3JvdXBJRCA9IHNlbGYuZ3JvdXBJRDtcclxuICAgICAgdmFyIGdyb3VwRGF0YSA9IHNlbGYuZW5lbWllcy5ncm91cERhdGE7XHJcbiAgICAgIGdyb3VwRGF0YVtncm91cElEXS5wdXNoKHNlbGYpO1xyXG4gICAgICBzZWxmLmVuZW1pZXMuaG9tZUVuZW1pZXNDb3VudCsrO1xyXG4gICAgfVxyXG4gICAgc2VsZi5zdGF0dXMgPSBzZWxmLkhPTUU7XHJcbiAgfVxyXG4gIFxyXG4gIGNsb25lKClcclxuICB7XHJcbiAgICByZXR1cm4gbmV3IEdvdG9Ib21lKCk7XHJcbiAgfVxyXG4gIFxyXG4gIHRvSlNPTigpe1xyXG4gICAgcmV0dXJuIFsnR290b0hvbWUnXTtcclxuICB9XHJcbiAgXHJcbiAgc3RhdGljIGZyb21BcnJheShhKVxyXG4gIHtcclxuICAgIHJldHVybiBuZXcgR290b0hvbWUoKTtcclxuICB9XHJcbn1cclxuXHJcblxyXG4vLy8g5b6F5qmf5Lit44Gu5pW144Gu5YuV44GNXHJcbmNsYXNzIEhvbWVNb3Zle1xyXG4gIGNvbnN0cnVjdG9yKCl7XHJcbiAgICB0aGlzLkNFTlRFUl9YID0gMDtcclxuICAgIHRoaXMuQ0VOVEVSX1kgPSAxMDA7XHJcbiAgfVxyXG5cclxuICAqbW92ZShzZWxmLCB4LCB5KSB7XHJcblxyXG4gICAgbGV0IGR4ID0gc2VsZi5ob21lWCAtIHRoaXMuQ0VOVEVSX1g7XHJcbiAgICBsZXQgZHkgPSBzZWxmLmhvbWVZIC0gdGhpcy5DRU5URVJfWTtcclxuICAgIHNlbGYueiA9IC0wLjE7XHJcblxyXG4gICAgd2hpbGUoc2VsZi5zdGF0dXMgIT0gc2VsZi5BVFRBQ0spXHJcbiAgICB7XHJcbiAgICAgIHNlbGYueCA9IHNlbGYuaG9tZVggKyBkeCAqIHNlbGYuZW5lbWllcy5ob21lRGVsdGE7XHJcbiAgICAgIHNlbGYueSA9IHNlbGYuaG9tZVkgKyBkeSAqIHNlbGYuZW5lbWllcy5ob21lRGVsdGE7XHJcbiAgICAgIHNlbGYubWVzaC5zY2FsZS54ID0gc2VsZi5lbmVtaWVzLmhvbWVEZWx0YTI7XHJcbiAgICAgIHlpZWxkO1xyXG4gICAgfVxyXG5cclxuICAgIHNlbGYubWVzaC5zY2FsZS54ID0gMS4wO1xyXG4gICAgc2VsZi56ID0gMC4wO1xyXG5cclxuICB9XHJcbiAgXHJcbiAgY2xvbmUoKXtcclxuICAgIHJldHVybiBuZXcgSG9tZU1vdmUoKTtcclxuICB9XHJcbiAgXHJcbiAgdG9KU09OKCl7XHJcbiAgICByZXR1cm4gWydIb21lTW92ZSddO1xyXG4gIH1cclxuICBcclxuICBzdGF0aWMgZnJvbUFycmF5KGEpXHJcbiAge1xyXG4gICAgcmV0dXJuIG5ldyBIb21lTW92ZSgpO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOaMh+WumuOCt+ODvOOCseODs+OCueOBq+enu+WLleOBmeOCi1xyXG5jbGFzcyBHb3RvIHtcclxuICBjb25zdHJ1Y3Rvcihwb3MpIHsgdGhpcy5wb3MgPSBwb3M7IH07XHJcbiAgKm1vdmUoc2VsZiwgeCwgeSkge1xyXG4gICAgc2VsZi5pbmRleCA9IHRoaXMucG9zIC0gMTtcclxuICB9XHJcbiAgXHJcbiAgdG9KU09OKCl7XHJcbiAgICByZXR1cm4gW1xyXG4gICAgICAnR290bycsXHJcbiAgICAgIHRoaXMucG9zXHJcbiAgICBdO1xyXG4gIH1cclxuICBcclxuICBjbG9uZSgpe1xyXG4gICAgcmV0dXJuIG5ldyBHb3RvKHRoaXMucG9zKTtcclxuICB9XHJcbiAgXHJcbiAgc3RhdGljIGZyb21BcnJheShhKXtcclxuICAgIHJldHVybiBuZXcgR290byhhWzFdKTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDmlbXlvL7nmbrlsIRcclxuY2xhc3MgRmlyZSB7XHJcbiAgKm1vdmUoc2VsZiwgeCwgeSkge1xyXG4gICAgbGV0IGQgPSAoc2ZnLnN0YWdlLm5vIC8gMjApICogKCBzZmcuc3RhZ2UuZGlmZmljdWx0eSk7XHJcbiAgICBpZiAoZCA+IDEpIHsgZCA9IDEuMDt9XHJcbiAgICBpZiAoTWF0aC5yYW5kb20oKSA8IGQpIHtcclxuICAgICAgc2VsZi5lbmVtaWVzLmVuZW15QnVsbGV0cy5zdGFydChzZWxmLngsIHNlbGYueSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIGNsb25lKCl7XHJcbiAgICByZXR1cm4gbmV3IEZpcmUoKTtcclxuICB9XHJcbiAgXHJcbiAgdG9KU09OKCl7XHJcbiAgICByZXR1cm4gWydGaXJlJ107XHJcbiAgfVxyXG4gIFxyXG4gIHN0YXRpYyBmcm9tQXJyYXkoYSlcclxuICB7XHJcbiAgICByZXR1cm4gbmV3IEZpcmUoKTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDmlbXmnKzkvZNcclxuZXhwb3J0IGNsYXNzIEVuZW15IGV4dGVuZHMgZ2FtZW9iai5HYW1lT2JqIHsgXHJcbiAgY29uc3RydWN0b3IoZW5lbWllcyxzY2VuZSxzZSkge1xyXG4gIHN1cGVyKDAsIDAsIDApO1xyXG4gIHRoaXMuTk9ORSA9ICAwIDtcclxuICB0aGlzLlNUQVJUID0gIDEgO1xyXG4gIHRoaXMuSE9NRSA9ICAyIDtcclxuICB0aGlzLkFUVEFDSyA9ICAzIDtcclxuICB0aGlzLkJPTUIgPSAgNCA7XHJcbiAgdGhpcy5jb2xsaXNpb25BcmVhLndpZHRoID0gMTI7XHJcbiAgdGhpcy5jb2xsaXNpb25BcmVhLmhlaWdodCA9IDg7XHJcbiAgdmFyIHRleCA9IHNmZy50ZXh0dXJlRmlsZXMuZW5lbXk7XHJcbiAgdmFyIG1hdGVyaWFsID0gZ3JhcGhpY3MuY3JlYXRlU3ByaXRlTWF0ZXJpYWwodGV4KTtcclxuICB2YXIgZ2VvbWV0cnkgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVHZW9tZXRyeSgxNik7XHJcbiAgZ3JhcGhpY3MuY3JlYXRlU3ByaXRlVVYoZ2VvbWV0cnksIHRleCwgMTYsIDE2LCAwKTtcclxuICB0aGlzLm1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gIHRoaXMuZ3JvdXBJRCA9IDA7XHJcbiAgdGhpcy56ID0gMC4wO1xyXG4gIHRoaXMuaW5kZXggPSAwO1xyXG4gIHRoaXMuc2NvcmUgPSAwO1xyXG4gIHRoaXMubXZQYXR0ZXJuID0gbnVsbDtcclxuICB0aGlzLm12ID0gbnVsbDtcclxuICB0aGlzLm1lc2gudmlzaWJsZSA9IGZhbHNlO1xyXG4gIHRoaXMuc3RhdHVzID0gdGhpcy5OT05FO1xyXG4gIHRoaXMudHlwZSA9IG51bGw7XHJcbiAgdGhpcy5saWZlID0gMDtcclxuICB0aGlzLnRhc2sgPSBudWxsO1xyXG4gIHRoaXMuaGl0XyA9IG51bGw7XHJcbiAgdGhpcy5zY2VuZSA9IHNjZW5lO1xyXG4gIHRoaXMuc2NlbmUuYWRkKHRoaXMubWVzaCk7XHJcbiAgdGhpcy5zZSA9IHNlO1xyXG4gIHRoaXMuZW5lbWllcyA9IGVuZW1pZXM7XHJcbn1cclxuXHJcbiAgZ2V0IHgoKSB7IHJldHVybiB0aGlzLnhfOyB9XHJcbiAgc2V0IHgodikgeyB0aGlzLnhfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnggPSB2OyB9XHJcbiAgZ2V0IHkoKSB7IHJldHVybiB0aGlzLnlfOyB9XHJcbiAgc2V0IHkodikgeyB0aGlzLnlfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnkgPSB2OyB9XHJcbiAgZ2V0IHooKSB7IHJldHVybiB0aGlzLnpfOyB9XHJcbiAgc2V0IHoodikgeyB0aGlzLnpfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnogPSB2OyB9XHJcbiAgXHJcbiAgLy8v5pW144Gu5YuV44GNXHJcbiAgKm1vdmUodGFza0luZGV4KSB7XHJcbiAgICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICAgIHdoaWxlICh0YXNrSW5kZXggPj0gMCl7XHJcbiAgICAgIHdoaWxlKCF0aGlzLm12Lm5leHQoKS5kb25lICYmIHRhc2tJbmRleCA+PSAwKVxyXG4gICAgICB7XHJcbiAgICAgICAgdGhpcy5tZXNoLnNjYWxlLnggPSB0aGlzLmVuZW1pZXMuaG9tZURlbHRhMjtcclxuICAgICAgICB0aGlzLm1lc2gucm90YXRpb24ueiA9IHRoaXMuY2hhclJhZDtcclxuICAgICAgICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIGlmKHRhc2tJbmRleCA8IDApe1xyXG4gICAgICAgIHRhc2tJbmRleCA9IC0oKyt0YXNrSW5kZXgpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgbGV0IGVuZCA9IGZhbHNlO1xyXG4gICAgICB3aGlsZSAoIWVuZCkge1xyXG4gICAgICAgIGlmICh0aGlzLmluZGV4IDwgKHRoaXMubXZQYXR0ZXJuLmxlbmd0aCAtIDEpKSB7XHJcbiAgICAgICAgICB0aGlzLmluZGV4Kys7XHJcbiAgICAgICAgICB0aGlzLm12ID0gdGhpcy5tdlBhdHRlcm5bdGhpcy5pbmRleF0ubW92ZSh0aGlzLHRoaXMueCx0aGlzLnkpO1xyXG4gICAgICAgICAgZW5kID0gIXRoaXMubXYubmV4dCgpLmRvbmU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICB0aGlzLm1lc2guc2NhbGUueCA9IHRoaXMuZW5lbWllcy5ob21lRGVsdGEyO1xyXG4gICAgICB0aGlzLm1lc2gucm90YXRpb24ueiA9IHRoaXMuY2hhclJhZDtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgLy8vIOWIneacn+WMllxyXG4gIHN0YXJ0KHgsIHksIHosIGhvbWVYLCBob21lWSwgbXZQYXR0ZXJuLCB4cmV2LHR5cGUsIGNsZWFyVGFyZ2V0LGdyb3VwSUQpIHtcclxuICAgIGlmICh0aGlzLmVuYWJsZV8pIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgdGhpcy50eXBlID0gdHlwZTtcclxuICAgIHR5cGUodGhpcyk7XHJcbiAgICB0aGlzLnggPSB4O1xyXG4gICAgdGhpcy55ID0geTtcclxuICAgIHRoaXMueiA9IHo7XHJcbiAgICB0aGlzLnhyZXYgPSB4cmV2O1xyXG4gICAgdGhpcy5lbmFibGVfID0gdHJ1ZTtcclxuICAgIHRoaXMuaG9tZVggPSBob21lWCB8fCAwO1xyXG4gICAgdGhpcy5ob21lWSA9IGhvbWVZIHx8IDA7XHJcbiAgICB0aGlzLmluZGV4ID0gMDtcclxuICAgIHRoaXMuZ3JvdXBJRCA9IGdyb3VwSUQ7XHJcbiAgICB0aGlzLm12UGF0dGVybiA9IG12UGF0dGVybjtcclxuICAgIHRoaXMuY2xlYXJUYXJnZXQgPSBjbGVhclRhcmdldCB8fCB0cnVlO1xyXG4gICAgdGhpcy5tZXNoLm1hdGVyaWFsLmNvbG9yLnNldEhleCgweEZGRkZGRik7XHJcbiAgICB0aGlzLm12ID0gbXZQYXR0ZXJuWzBdLm1vdmUodGhpcyx4LHkpO1xyXG4gICAgLy90aGlzLm12LnN0YXJ0KHRoaXMsIHgsIHkpO1xyXG4gICAgLy9pZiAodGhpcy5zdGF0dXMgIT0gdGhpcy5OT05FKSB7XHJcbiAgICAvLyAgZGVidWdnZXI7XHJcbiAgICAvL31cclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5TVEFSVDtcclxuICAgIHRoaXMudGFzayA9IHNmZy50YXNrcy5wdXNoVGFzayh0aGlzLm1vdmUuYmluZCh0aGlzKSwgMTAwMDApO1xyXG4gICAgLy8gaWYodGhpcy50YXNrLmluZGV4ID09IDApe1xyXG4gICAgLy8gICBkZWJ1Z2dlcjtcclxuICAgIC8vIH1cclxuICAgIHRoaXMubWVzaC52aXNpYmxlID0gdHJ1ZTtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuICBcclxuICBoaXQobXlidWxsZXQpIHtcclxuICAgIGlmICh0aGlzLmhpdF8gPT0gbnVsbCkge1xyXG4gICAgICBsZXQgbGlmZSA9IHRoaXMubGlmZTtcclxuICAgICAgdGhpcy5saWZlIC09IG15YnVsbGV0LnBvd2VyIHx8IDE7XHJcbiAgICAgIG15YnVsbGV0LnBvd2VyIC09IGxpZmU7IFxyXG4vLyAgICAgIHRoaXMubGlmZS0tO1xyXG4gICAgICBpZiAodGhpcy5saWZlIDw9IDApIHtcclxuICAgICAgICBzZmcuYm9tYnMuc3RhcnQodGhpcy54LCB0aGlzLnkpO1xyXG4gICAgICAgIHRoaXMuc2UoMSk7XHJcbiAgICAgICAgc2ZnLmFkZFNjb3JlKHRoaXMuc2NvcmUpO1xyXG4gICAgICAgIGlmICh0aGlzLmNsZWFyVGFyZ2V0KSB7XHJcbiAgICAgICAgICB0aGlzLmVuZW1pZXMuaGl0RW5lbWllc0NvdW50Kys7XHJcbiAgICAgICAgICBpZiAodGhpcy5zdGF0dXMgPT0gdGhpcy5TVEFSVCkge1xyXG4gICAgICAgICAgICB0aGlzLmVuZW1pZXMuaG9tZUVuZW1pZXNDb3VudCsrO1xyXG4gICAgICAgICAgICB0aGlzLmVuZW1pZXMuZ3JvdXBEYXRhW3RoaXMuZ3JvdXBJRF0ucHVzaCh0aGlzKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHRoaXMuZW5lbWllcy5ncm91cERhdGFbdGhpcy5ncm91cElEXS5nb25lQ291bnQrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodGhpcy50YXNrLmluZGV4ID09IDApe1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ2hpdCcsdGhpcy50YXNrLmluZGV4KTtcclxuICAgICAgICAgIGRlYnVnZ2VyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmVuYWJsZV8gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnN0YXR1cyA9IHRoaXMuTk9ORTtcclxuICAgICAgICBzZmcudGFza3MuYXJyYXlbdGhpcy50YXNrLmluZGV4XS5nZW5JbnN0Lm5leHQoLSh0aGlzLnRhc2suaW5kZXggKyAxKSk7XHJcbiAgICAgICAgc2ZnLnRhc2tzLnJlbW92ZVRhc2sodGhpcy50YXNrLmluZGV4KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnNlKDIpO1xyXG4gICAgICAgIHRoaXMubWVzaC5tYXRlcmlhbC5jb2xvci5zZXRIZXgoMHhGRjgwODApO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmhpdF8obXlidWxsZXQpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIFpha28oc2VsZikge1xyXG4gIHNlbGYuc2NvcmUgPSA1MDtcclxuICBzZWxmLmxpZmUgPSAxO1xyXG4gIGdyYXBoaWNzLnVwZGF0ZVNwcml0ZVVWKHNlbGYubWVzaC5nZW9tZXRyeSwgc2ZnLnRleHR1cmVGaWxlcy5lbmVteSwgMTYsIDE2LCA3KTtcclxufVxyXG5cclxuWmFrby50b0pTT04gPSBmdW5jdGlvbiAoKVxyXG57XHJcbiAgcmV0dXJuICdaYWtvJztcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIFpha28xKHNlbGYpIHtcclxuICBzZWxmLnNjb3JlID0gMTAwO1xyXG4gIHNlbGYubGlmZSA9IDE7XHJcbiAgZ3JhcGhpY3MudXBkYXRlU3ByaXRlVVYoc2VsZi5tZXNoLmdlb21ldHJ5LCBzZmcudGV4dHVyZUZpbGVzLmVuZW15LCAxNiwgMTYsIDYpO1xyXG59XHJcblxyXG5aYWtvMS50b0pTT04gPSBmdW5jdGlvbiAoKVxyXG57XHJcbiAgcmV0dXJuICdaYWtvMSc7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBNQm9zcyhzZWxmKSB7XHJcbiAgc2VsZi5zY29yZSA9IDMwMDtcclxuICBzZWxmLmxpZmUgPSAyO1xyXG4gIHNlbGYubWVzaC5ibGVuZGluZyA9IFRIUkVFLk5vcm1hbEJsZW5kaW5nO1xyXG4gIGdyYXBoaWNzLnVwZGF0ZVNwcml0ZVVWKHNlbGYubWVzaC5nZW9tZXRyeSwgc2ZnLnRleHR1cmVGaWxlcy5lbmVteSwgMTYsIDE2LCA0KTtcclxufVxyXG5cclxuTUJvc3MudG9KU09OID0gZnVuY3Rpb24gKClcclxue1xyXG4gIHJldHVybiAnTUJvc3MnO1xyXG59XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIEVuZW1pZXN7XHJcbiAgY29uc3RydWN0b3Ioc2NlbmUsIHNlLCBlbmVteUJ1bGxldHMpIHtcclxuICAgIHRoaXMuZW5lbXlCdWxsZXRzID0gZW5lbXlCdWxsZXRzO1xyXG4gICAgdGhpcy5zY2VuZSA9IHNjZW5lO1xyXG4gICAgdGhpcy5uZXh0VGltZSA9IDA7XHJcbiAgICB0aGlzLmN1cnJlbnRJbmRleCA9IDA7XHJcbiAgICB0aGlzLmVuZW1pZXMgPSBuZXcgQXJyYXkoMCk7XHJcbiAgICB0aGlzLmhvbWVEZWx0YTIgPSAxLjA7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDY0OyArK2kpIHtcclxuICAgICAgdGhpcy5lbmVtaWVzLnB1c2gobmV3IEVuZW15KHRoaXMsIHNjZW5lLCBzZSkpO1xyXG4gICAgfVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA1OyArK2kpIHtcclxuICAgICAgdGhpcy5ncm91cERhdGFbaV0gPSBuZXcgQXJyYXkoMCk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIHN0YXJ0RW5lbXlfKGVuZW15LGRhdGEpXHJcbiAge1xyXG4gICAgICBlbmVteS5zdGFydChkYXRhWzFdLCBkYXRhWzJdLCAwLCBkYXRhWzNdLCBkYXRhWzRdLCB0aGlzLm1vdmVQYXR0ZXJuc1tNYXRoLmFicyhkYXRhWzVdKV0sIGRhdGFbNV0gPCAwLCBkYXRhWzZdLCBkYXRhWzddLCBkYXRhWzhdIHx8IDApO1xyXG4gIH1cclxuICBcclxuICBzdGFydEVuZW15KGRhdGEpe1xyXG4gICAgdmFyIGVuZW1pZXMgPSB0aGlzLmVuZW1pZXM7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZSA9IGVuZW1pZXMubGVuZ3RoOyBpIDwgZTsgKytpKSB7XHJcbiAgICAgIHZhciBlbmVteSA9IGVuZW1pZXNbaV07XHJcbiAgICAgIGlmICghZW5lbXkuZW5hYmxlXykge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnN0YXJ0RW5lbXlfKGVuZW15LGRhdGEpO1xyXG4gICAgICB9XHJcbiAgICB9ICAgIFxyXG4gIH1cclxuICBcclxuICBzdGFydEVuZW15SW5kZXhlZChkYXRhLGluZGV4KXtcclxuICAgIGxldCBlbiA9IHRoaXMuZW5lbWllc1tpbmRleF07XHJcbiAgICBpZihlbi5lbmFibGVfKXtcclxuICAgICAgICBzZmcudGFza3MucmVtb3ZlVGFzayhlbi50YXNrLmluZGV4KTtcclxuICAgICAgICBlbi5zdGF0dXMgPSBlbi5OT05FO1xyXG4gICAgICAgIGVuLmVuYWJsZV8gPSBmYWxzZTtcclxuICAgICAgICBlbi5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIHRoaXMuc3RhcnRFbmVteV8oZW4sZGF0YSk7XHJcbiAgfVxyXG5cclxuICAvLy8g5pW157eo6ZqK44Gu5YuV44GN44KS44Kz44Oz44OI44Ot44O844Or44GZ44KLXHJcbiAgbW92ZSgpIHtcclxuICAgIHZhciBjdXJyZW50VGltZSA9IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWU7XHJcbiAgICB2YXIgbW92ZVNlcXMgPSB0aGlzLm1vdmVTZXFzO1xyXG4gICAgdmFyIGxlbiA9IG1vdmVTZXFzW3NmZy5zdGFnZS5wcml2YXRlTm9dLmxlbmd0aDtcclxuICAgIC8vIOODh+ODvOOCv+mFjeWIl+OCkuOCguOBqOOBq+aVteOCkueUn+aIkFxyXG4gICAgd2hpbGUgKHRoaXMuY3VycmVudEluZGV4IDwgbGVuKSB7XHJcbiAgICAgIHZhciBkYXRhID0gbW92ZVNlcXNbc2ZnLnN0YWdlLnByaXZhdGVOb11bdGhpcy5jdXJyZW50SW5kZXhdO1xyXG4gICAgICB2YXIgbmV4dFRpbWUgPSB0aGlzLm5leHRUaW1lICE9IG51bGwgPyB0aGlzLm5leHRUaW1lIDogZGF0YVswXTtcclxuICAgICAgaWYgKGN1cnJlbnRUaW1lID49ICh0aGlzLm5leHRUaW1lICsgZGF0YVswXSkpIHtcclxuICAgICAgICB0aGlzLnN0YXJ0RW5lbXkoZGF0YSk7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50SW5kZXgrKztcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50SW5kZXggPCBsZW4pIHtcclxuICAgICAgICAgIHRoaXMubmV4dFRpbWUgPSBjdXJyZW50VGltZSArIG1vdmVTZXFzW3NmZy5zdGFnZS5wcml2YXRlTm9dW3RoaXMuY3VycmVudEluZGV4XVswXTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIOODm+ODvOODoOODneOCuOOCt+ODp+ODs+OBq+aVteOBjOOBmeOBueOBpuaVtOWIl+OBl+OBn+OBi+eiuuiqjeOBmeOCi+OAglxyXG4gICAgaWYgKHRoaXMuaG9tZUVuZW1pZXNDb3VudCA9PSB0aGlzLnRvdGFsRW5lbWllc0NvdW50ICYmIHRoaXMuc3RhdHVzID09IHRoaXMuU1RBUlQpIHtcclxuICAgICAgLy8g5pW05YiX44GX44Gm44GE44Gf44KJ5pW05YiX44Oi44O844OJ44Gr56e76KGM44GZ44KL44CCXHJcbiAgICAgIHRoaXMuc3RhdHVzID0gdGhpcy5IT01FO1xyXG4gICAgICB0aGlzLmVuZFRpbWUgPSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lICsgMC41ICogKDIuMCAtIHNmZy5zdGFnZS5kaWZmaWN1bHR5KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyDjg5vjg7zjg6Djg53jgrjjgrfjg6fjg7PjgafkuIDlrprmmYLplpPlvoXmqZ/jgZnjgotcclxuICAgIGlmICh0aGlzLnN0YXR1cyA9PSB0aGlzLkhPTUUpIHtcclxuICAgICAgaWYgKHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgPiB0aGlzLmVuZFRpbWUpIHtcclxuICAgICAgICB0aGlzLnN0YXR1cyA9IHRoaXMuQVRUQUNLO1xyXG4gICAgICAgIHRoaXMuZW5kVGltZSA9IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgKyAoc2ZnLnN0YWdlLkRJRkZJQ1VMVFlfTUFYIC0gc2ZnLnN0YWdlLmRpZmZpY3VsdHkpICogMztcclxuICAgICAgICB0aGlzLmdyb3VwID0gMDtcclxuICAgICAgICB0aGlzLmNvdW50ID0gMDtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIOaUu+aSg+OBmeOCi1xyXG4gICAgaWYgKHRoaXMuc3RhdHVzID09IHRoaXMuQVRUQUNLICYmIHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgPiB0aGlzLmVuZFRpbWUpIHtcclxuICAgICAgdGhpcy5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIChzZmcuc3RhZ2UuRElGRklDVUxUWV9NQVggLSBzZmcuc3RhZ2UuZGlmZmljdWx0eSkgKiAzO1xyXG4gICAgICB2YXIgZ3JvdXBEYXRhID0gdGhpcy5ncm91cERhdGE7XHJcbiAgICAgIHZhciBhdHRhY2tDb3VudCA9ICgxICsgMC4yNSAqIChzZmcuc3RhZ2UuZGlmZmljdWx0eSkpIHwgMDtcclxuICAgICAgdmFyIGdyb3VwID0gZ3JvdXBEYXRhW3RoaXMuZ3JvdXBdO1xyXG5cclxuICAgICAgaWYgKCFncm91cCB8fCBncm91cC5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSAwO1xyXG4gICAgICAgIHZhciBncm91cCA9IGdyb3VwRGF0YVswXTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGdyb3VwLmxlbmd0aCA+IDAgJiYgZ3JvdXAubGVuZ3RoID4gZ3JvdXAuZ29uZUNvdW50KSB7XHJcbiAgICAgICAgaWYgKCFncm91cC5pbmRleCkge1xyXG4gICAgICAgICAgZ3JvdXAuaW5kZXggPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXMuZ3JvdXApIHtcclxuICAgICAgICAgIHZhciBjb3VudCA9IDAsIGVuZGcgPSBncm91cC5sZW5ndGg7XHJcbiAgICAgICAgICB3aGlsZSAoY291bnQgPCBlbmRnICYmIGF0dGFja0NvdW50ID4gMCkge1xyXG4gICAgICAgICAgICB2YXIgZW4gPSBncm91cFtncm91cC5pbmRleF07XHJcbiAgICAgICAgICAgIGlmIChlbi5lbmFibGVfICYmIGVuLnN0YXR1cyA9PSBlbi5IT01FKSB7XHJcbiAgICAgICAgICAgICAgZW4uc3RhdHVzID0gZW4uQVRUQUNLO1xyXG4gICAgICAgICAgICAgIC0tYXR0YWNrQ291bnQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY291bnQrKztcclxuICAgICAgICAgICAgZ3JvdXAuaW5kZXgrKztcclxuICAgICAgICAgICAgaWYgKGdyb3VwLmluZGV4ID49IGdyb3VwLmxlbmd0aCkgZ3JvdXAuaW5kZXggPSAwO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gZ3JvdXAubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgICAgICAgdmFyIGVuID0gZ3JvdXBbaV07XHJcbiAgICAgICAgICAgIGlmIChlbi5lbmFibGVfICYmIGVuLnN0YXR1cyA9PSBlbi5IT01FKSB7XHJcbiAgICAgICAgICAgICAgZW4uc3RhdHVzID0gZW4uQVRUQUNLO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLmdyb3VwKys7XHJcbiAgICAgIGlmICh0aGlzLmdyb3VwID49IHRoaXMuZ3JvdXBEYXRhLmxlbmd0aCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSAwO1xyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIOODm+ODvOODoOODneOCuOOCt+ODp+ODs+OBp+OBruW+heapn+WLleS9nFxyXG4gICAgdGhpcy5ob21lRGVsdGFDb3VudCArPSAwLjAyNTtcclxuICAgIHRoaXMuaG9tZURlbHRhID0gTWF0aC5zaW4odGhpcy5ob21lRGVsdGFDb3VudCkgKiAwLjA4O1xyXG4gICAgdGhpcy5ob21lRGVsdGEyID0gMS4wICsgTWF0aC5zaW4odGhpcy5ob21lRGVsdGFDb3VudCAqIDgpICogMC4xO1xyXG5cclxuICB9XHJcblxyXG4gIHJlc2V0KCkge1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHRoaXMuZW5lbWllcy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgICB2YXIgZW4gPSB0aGlzLmVuZW1pZXNbaV07XHJcbiAgICAgIGlmIChlbi5lbmFibGVfKSB7XHJcbiAgICAgICAgc2ZnLnRhc2tzLnJlbW92ZVRhc2soZW4udGFzay5pbmRleCk7XHJcbiAgICAgICAgZW4uc3RhdHVzID0gZW4uTk9ORTtcclxuICAgICAgICBlbi5lbmFibGVfID0gZmFsc2U7XHJcbiAgICAgICAgZW4ubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNhbGNFbmVtaWVzQ291bnQoKSB7XHJcbiAgICB2YXIgc2VxcyA9IHRoaXMubW92ZVNlcXNbc2ZnLnN0YWdlLnByaXZhdGVOb107XHJcbiAgICB0aGlzLnRvdGFsRW5lbWllc0NvdW50ID0gMDtcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSBzZXFzLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIGlmIChzZXFzW2ldWzddKSB7XHJcbiAgICAgICAgdGhpcy50b3RhbEVuZW1pZXNDb3VudCsrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBzdGFydCgpIHtcclxuICAgIHRoaXMubmV4dFRpbWUgPSAwO1xyXG4gICAgdGhpcy5jdXJyZW50SW5kZXggPSAwO1xyXG4gICAgdGhpcy50b3RhbEVuZW1pZXNDb3VudCA9IDA7XHJcbiAgICB0aGlzLmhpdEVuZW1pZXNDb3VudCA9IDA7XHJcbiAgICB0aGlzLmhvbWVFbmVtaWVzQ291bnQgPSAwO1xyXG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLlNUQVJUO1xyXG4gICAgdmFyIGdyb3VwRGF0YSA9IHRoaXMuZ3JvdXBEYXRhO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IGdyb3VwRGF0YS5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgICBncm91cERhdGFbaV0ubGVuZ3RoID0gMDtcclxuICAgICAgZ3JvdXBEYXRhW2ldLmdvbmVDb3VudCA9IDA7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIGxvYWRQYXR0ZXJucygpe1xyXG4gICAgdGhpcy5tb3ZlUGF0dGVybnMgPSBbXTtcclxuICAgIGxldCB0aGlzXyA9IHRoaXM7ICAgIFxyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLHJlamVjdCk9PntcclxuICAgICAgZDMuanNvbignLi9yZXMvZW5lbXlNb3ZlUGF0dGVybi5qc29uJywoZXJyLGRhdGEpPT57XHJcbiAgICAgICAgaWYoZXJyKXtcclxuICAgICAgICAgIHJlamVjdChlcnIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkYXRhLmZvckVhY2goKGNvbUFycmF5LGkpPT57XHJcbiAgICAgICAgICBsZXQgY29tID0gW107XHJcbiAgICAgICAgICB0aGlzLm1vdmVQYXR0ZXJucy5wdXNoKGNvbSk7XHJcbiAgICAgICAgICBjb21BcnJheS5mb3JFYWNoKChkLGkpPT57XHJcbiAgICAgICAgICAgIGNvbS5wdXNoKHRoaXMuY3JlYXRlTW92ZVBhdHRlcm5Gcm9tQXJyYXkoZCkpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIFxyXG4gIGNyZWF0ZU1vdmVQYXR0ZXJuRnJvbUFycmF5KGFycil7XHJcbiAgICBsZXQgb2JqO1xyXG4gICAgc3dpdGNoKGFyclswXSl7XHJcbiAgICAgIGNhc2UgJ0xpbmVNb3ZlJzpcclxuICAgICAgICBvYmogPSBMaW5lTW92ZS5mcm9tQXJyYXkoYXJyKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnQ2lyY2xlTW92ZSc6XHJcbiAgICAgICAgb2JqID0gIENpcmNsZU1vdmUuZnJvbUFycmF5KGFycik7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ0dvdG9Ib21lJzpcclxuICAgICAgICBvYmogPSAgIEdvdG9Ib21lLmZyb21BcnJheShhcnIpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdIb21lTW92ZSc6XHJcbiAgICAgICAgb2JqID0gICBIb21lTW92ZS5mcm9tQXJyYXkoYXJyKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnR290byc6XHJcbiAgICAgICAgb2JqID0gICBHb3RvLmZyb21BcnJheShhcnIpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdGaXJlJzpcclxuICAgICAgICBvYmogPSAgIEZpcmUuZnJvbUFycmF5KGFycik7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gb2JqO1xyXG4vLyAgICB0aHJvdyBuZXcgRXJyb3IoJ01vdmVQYXR0ZXJuIE5vdCBGb3VuZC4nKTtcclxuICB9XHJcbiAgXHJcbiAgbG9hZEZvcm1hdGlvbnMoKXtcclxuICAgIHRoaXMubW92ZVNlcXMgPSBbXTtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSxyZWplY3QpPT57XHJcbiAgICAgIGQzLmpzb24oJy4vcmVzL2VuZW15Rm9ybWF0aW9uUGF0dGVybi5qc29uJywoZXJyLGRhdGEpPT57XHJcbiAgICAgICAgaWYoZXJyKSByZWplY3QoZXJyKTtcclxuICAgICAgICBkYXRhLmZvckVhY2goKGZvcm0saSk9PntcclxuICAgICAgICAgIGxldCBzdGFnZSA9IFtdO1xyXG4gICAgICAgICAgdGhpcy5tb3ZlU2Vxcy5wdXNoKHN0YWdlKTtcclxuICAgICAgICAgIGZvcm0uZm9yRWFjaCgoZCxpKT0+e1xyXG4gICAgICAgICAgICBkWzZdID0gZ2V0RW5lbXlGdW5jKGRbNl0pO1xyXG4gICAgICAgICAgICBzdGFnZS5wdXNoKGQpO1xyXG4gICAgICAgICAgfSk7ICAgICAgICAgIFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgXHJcbn1cclxuXHJcbnZhciBlbmVteUZ1bmNzID0gbmV3IE1hcChbXHJcbiAgICAgIFtcIlpha29cIixaYWtvXSxcclxuICAgICAgW1wiWmFrbzFcIixaYWtvMV0sXHJcbiAgICAgIFtcIk1Cb3NzXCIsTUJvc3NdXHJcbiAgICBdKTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRFbmVteUZ1bmMoZnVuY05hbWUpXHJcbntcclxuICByZXR1cm4gZW5lbXlGdW5jcy5nZXQoZnVuY05hbWUpO1xyXG59XHJcblxyXG5FbmVtaWVzLnByb3RvdHlwZS50b3RhbEVuZW1pZXNDb3VudCA9IDA7XHJcbkVuZW1pZXMucHJvdG90eXBlLmhpdEVuZW1pZXNDb3VudCA9IDA7XHJcbkVuZW1pZXMucHJvdG90eXBlLmhvbWVFbmVtaWVzQ291bnQgPSAwO1xyXG5FbmVtaWVzLnByb3RvdHlwZS5ob21lRGVsdGEgPSAwO1xyXG5FbmVtaWVzLnByb3RvdHlwZS5ob21lRGVsdGFDb3VudCA9IDA7XHJcbkVuZW1pZXMucHJvdG90eXBlLmhvbWVEZWx0YTIgPSAwO1xyXG5FbmVtaWVzLnByb3RvdHlwZS5ncm91cERhdGEgPSBbXTtcclxuRW5lbWllcy5wcm90b3R5cGUuTk9ORSA9IDAgfCAwO1xyXG5FbmVtaWVzLnByb3RvdHlwZS5TVEFSVCA9IDEgfCAwO1xyXG5FbmVtaWVzLnByb3RvdHlwZS5IT01FID0gMiB8IDA7XHJcbkVuZW1pZXMucHJvdG90eXBlLkFUVEFDSyA9IDMgfCAwO1xyXG5cclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuLy9cclxuLy8gV2Ugc3RvcmUgb3VyIEVFIG9iamVjdHMgaW4gYSBwbGFpbiBvYmplY3Qgd2hvc2UgcHJvcGVydGllcyBhcmUgZXZlbnQgbmFtZXMuXHJcbi8vIElmIGBPYmplY3QuY3JlYXRlKG51bGwpYCBpcyBub3Qgc3VwcG9ydGVkIHdlIHByZWZpeCB0aGUgZXZlbnQgbmFtZXMgd2l0aCBhXHJcbi8vIGB+YCB0byBtYWtlIHN1cmUgdGhhdCB0aGUgYnVpbHQtaW4gb2JqZWN0IHByb3BlcnRpZXMgYXJlIG5vdCBvdmVycmlkZGVuIG9yXHJcbi8vIHVzZWQgYXMgYW4gYXR0YWNrIHZlY3Rvci5cclxuLy8gV2UgYWxzbyBhc3N1bWUgdGhhdCBgT2JqZWN0LmNyZWF0ZShudWxsKWAgaXMgYXZhaWxhYmxlIHdoZW4gdGhlIGV2ZW50IG5hbWVcclxuLy8gaXMgYW4gRVM2IFN5bWJvbC5cclxuLy9cclxudmFyIHByZWZpeCA9IHR5cGVvZiBPYmplY3QuY3JlYXRlICE9PSAnZnVuY3Rpb24nID8gJ34nIDogZmFsc2U7XHJcblxyXG4vKipcclxuICogUmVwcmVzZW50YXRpb24gb2YgYSBzaW5nbGUgRXZlbnRFbWl0dGVyIGZ1bmN0aW9uLlxyXG4gKlxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBFdmVudCBoYW5kbGVyIHRvIGJlIGNhbGxlZC5cclxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBDb250ZXh0IGZvciBmdW5jdGlvbiBleGVjdXRpb24uXHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb25jZSBPbmx5IGVtaXQgb25jZVxyXG4gKiBAYXBpIHByaXZhdGVcclxuICovXHJcbmZ1bmN0aW9uIEVFKGZuLCBjb250ZXh0LCBvbmNlKSB7XHJcbiAgdGhpcy5mbiA9IGZuO1xyXG4gIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XHJcbiAgdGhpcy5vbmNlID0gb25jZSB8fCBmYWxzZTtcclxufVxyXG5cclxuLyoqXHJcbiAqIE1pbmltYWwgRXZlbnRFbWl0dGVyIGludGVyZmFjZSB0aGF0IGlzIG1vbGRlZCBhZ2FpbnN0IHRoZSBOb2RlLmpzXHJcbiAqIEV2ZW50RW1pdHRlciBpbnRlcmZhY2UuXHJcbiAqXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkgeyAvKiBOb3RoaW5nIHRvIHNldCAqLyB9XHJcblxyXG4vKipcclxuICogSG9sZHMgdGhlIGFzc2lnbmVkIEV2ZW50RW1pdHRlcnMgYnkgbmFtZS5cclxuICpcclxuICogQHR5cGUge09iamVjdH1cclxuICogQHByaXZhdGVcclxuICovXHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcclxuXHJcbi8qKlxyXG4gKiBSZXR1cm4gYSBsaXN0IG9mIGFzc2lnbmVkIGV2ZW50IGxpc3RlbmVycy5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudHMgdGhhdCBzaG91bGQgYmUgbGlzdGVkLlxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGV4aXN0cyBXZSBvbmx5IG5lZWQgdG8ga25vdyBpZiB0aGVyZSBhcmUgbGlzdGVuZXJzLlxyXG4gKiBAcmV0dXJucyB7QXJyYXl8Qm9vbGVhbn1cclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24gbGlzdGVuZXJzKGV2ZW50LCBleGlzdHMpIHtcclxuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudFxyXG4gICAgLCBhdmFpbGFibGUgPSB0aGlzLl9ldmVudHMgJiYgdGhpcy5fZXZlbnRzW2V2dF07XHJcblxyXG4gIGlmIChleGlzdHMpIHJldHVybiAhIWF2YWlsYWJsZTtcclxuICBpZiAoIWF2YWlsYWJsZSkgcmV0dXJuIFtdO1xyXG4gIGlmIChhdmFpbGFibGUuZm4pIHJldHVybiBbYXZhaWxhYmxlLmZuXTtcclxuXHJcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBhdmFpbGFibGUubGVuZ3RoLCBlZSA9IG5ldyBBcnJheShsKTsgaSA8IGw7IGkrKykge1xyXG4gICAgZWVbaV0gPSBhdmFpbGFibGVbaV0uZm47XHJcbiAgfVxyXG5cclxuICByZXR1cm4gZWU7XHJcbn07XHJcblxyXG4vKipcclxuICogRW1pdCBhbiBldmVudCB0byBhbGwgcmVnaXN0ZXJlZCBldmVudCBsaXN0ZW5lcnMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgbmFtZSBvZiB0aGUgZXZlbnQuXHJcbiAqIEByZXR1cm5zIHtCb29sZWFufSBJbmRpY2F0aW9uIGlmIHdlJ3ZlIGVtaXR0ZWQgYW4gZXZlbnQuXHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiBlbWl0KGV2ZW50LCBhMSwgYTIsIGEzLCBhNCwgYTUpIHtcclxuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcclxuXHJcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1tldnRdKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbZXZ0XVxyXG4gICAgLCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoXHJcbiAgICAsIGFyZ3NcclxuICAgICwgaTtcclxuXHJcbiAgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiBsaXN0ZW5lcnMuZm4pIHtcclxuICAgIGlmIChsaXN0ZW5lcnMub25jZSkgdGhpcy5yZW1vdmVMaXN0ZW5lcihldmVudCwgbGlzdGVuZXJzLmZuLCB1bmRlZmluZWQsIHRydWUpO1xyXG5cclxuICAgIHN3aXRjaCAobGVuKSB7XHJcbiAgICAgIGNhc2UgMTogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0KSwgdHJ1ZTtcclxuICAgICAgY2FzZSAyOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExKSwgdHJ1ZTtcclxuICAgICAgY2FzZSAzOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiksIHRydWU7XHJcbiAgICAgIGNhc2UgNDogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzKSwgdHJ1ZTtcclxuICAgICAgY2FzZSA1OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMsIGE0KSwgdHJ1ZTtcclxuICAgICAgY2FzZSA2OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMsIGE0LCBhNSksIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgZm9yIChpID0gMSwgYXJncyA9IG5ldyBBcnJheShsZW4gLTEpOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XHJcbiAgICB9XHJcblxyXG4gICAgbGlzdGVuZXJzLmZuLmFwcGx5KGxpc3RlbmVycy5jb250ZXh0LCBhcmdzKTtcclxuICB9IGVsc2Uge1xyXG4gICAgdmFyIGxlbmd0aCA9IGxpc3RlbmVycy5sZW5ndGhcclxuICAgICAgLCBqO1xyXG5cclxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICBpZiAobGlzdGVuZXJzW2ldLm9uY2UpIHRoaXMucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyc1tpXS5mbiwgdW5kZWZpbmVkLCB0cnVlKTtcclxuXHJcbiAgICAgIHN3aXRjaCAobGVuKSB7XHJcbiAgICAgICAgY2FzZSAxOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCk7IGJyZWFrO1xyXG4gICAgICAgIGNhc2UgMjogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGExKTsgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAzOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgYTEsIGEyKTsgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgIGlmICghYXJncykgZm9yIChqID0gMSwgYXJncyA9IG5ldyBBcnJheShsZW4gLTEpOyBqIDwgbGVuOyBqKyspIHtcclxuICAgICAgICAgICAgYXJnc1tqIC0gMV0gPSBhcmd1bWVudHNbal07XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgbGlzdGVuZXJzW2ldLmZuLmFwcGx5KGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhcmdzKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRydWU7XHJcbn07XHJcblxyXG4vKipcclxuICogUmVnaXN0ZXIgYSBuZXcgRXZlbnRMaXN0ZW5lciBmb3IgdGhlIGdpdmVuIGV2ZW50LlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgTmFtZSBvZiB0aGUgZXZlbnQuXHJcbiAqIEBwYXJhbSB7RnVuY3Rvbn0gZm4gQ2FsbGJhY2sgZnVuY3Rpb24uXHJcbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgVGhlIGNvbnRleHQgb2YgdGhlIGZ1bmN0aW9uLlxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIG9uKGV2ZW50LCBmbiwgY29udGV4dCkge1xyXG4gIHZhciBsaXN0ZW5lciA9IG5ldyBFRShmbiwgY29udGV4dCB8fCB0aGlzKVxyXG4gICAgLCBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xyXG5cclxuICBpZiAoIXRoaXMuX2V2ZW50cykgdGhpcy5fZXZlbnRzID0gcHJlZml4ID8ge30gOiBPYmplY3QuY3JlYXRlKG51bGwpO1xyXG4gIGlmICghdGhpcy5fZXZlbnRzW2V2dF0pIHRoaXMuX2V2ZW50c1tldnRdID0gbGlzdGVuZXI7XHJcbiAgZWxzZSB7XHJcbiAgICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdLmZuKSB0aGlzLl9ldmVudHNbZXZ0XS5wdXNoKGxpc3RlbmVyKTtcclxuICAgIGVsc2UgdGhpcy5fZXZlbnRzW2V2dF0gPSBbXHJcbiAgICAgIHRoaXMuX2V2ZW50c1tldnRdLCBsaXN0ZW5lclxyXG4gICAgXTtcclxuICB9XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEFkZCBhbiBFdmVudExpc3RlbmVyIHRoYXQncyBvbmx5IGNhbGxlZCBvbmNlLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgTmFtZSBvZiB0aGUgZXZlbnQuXHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIENhbGxiYWNrIGZ1bmN0aW9uLlxyXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IFRoZSBjb250ZXh0IG9mIHRoZSBmdW5jdGlvbi5cclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uIG9uY2UoZXZlbnQsIGZuLCBjb250ZXh0KSB7XHJcbiAgdmFyIGxpc3RlbmVyID0gbmV3IEVFKGZuLCBjb250ZXh0IHx8IHRoaXMsIHRydWUpXHJcbiAgICAsIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XHJcblxyXG4gIGlmICghdGhpcy5fZXZlbnRzKSB0aGlzLl9ldmVudHMgPSBwcmVmaXggPyB7fSA6IE9iamVjdC5jcmVhdGUobnVsbCk7XHJcbiAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XSkgdGhpcy5fZXZlbnRzW2V2dF0gPSBsaXN0ZW5lcjtcclxuICBlbHNlIHtcclxuICAgIGlmICghdGhpcy5fZXZlbnRzW2V2dF0uZm4pIHRoaXMuX2V2ZW50c1tldnRdLnB1c2gobGlzdGVuZXIpO1xyXG4gICAgZWxzZSB0aGlzLl9ldmVudHNbZXZ0XSA9IFtcclxuICAgICAgdGhpcy5fZXZlbnRzW2V2dF0sIGxpc3RlbmVyXHJcbiAgICBdO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogUmVtb3ZlIGV2ZW50IGxpc3RlbmVycy5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCB3ZSB3YW50IHRvIHJlbW92ZS5cclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGxpc3RlbmVyIHRoYXQgd2UgbmVlZCB0byBmaW5kLlxyXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IE9ubHkgcmVtb3ZlIGxpc3RlbmVycyBtYXRjaGluZyB0aGlzIGNvbnRleHQuXHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb25jZSBPbmx5IHJlbW92ZSBvbmNlIGxpc3RlbmVycy5cclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcblxyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGZuLCBjb250ZXh0LCBvbmNlKSB7XHJcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XHJcblxyXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbZXZ0XSkgcmV0dXJuIHRoaXM7XHJcblxyXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbZXZ0XVxyXG4gICAgLCBldmVudHMgPSBbXTtcclxuXHJcbiAgaWYgKGZuKSB7XHJcbiAgICBpZiAobGlzdGVuZXJzLmZuKSB7XHJcbiAgICAgIGlmIChcclxuICAgICAgICAgICBsaXN0ZW5lcnMuZm4gIT09IGZuXHJcbiAgICAgICAgfHwgKG9uY2UgJiYgIWxpc3RlbmVycy5vbmNlKVxyXG4gICAgICAgIHx8IChjb250ZXh0ICYmIGxpc3RlbmVycy5jb250ZXh0ICE9PSBjb250ZXh0KVxyXG4gICAgICApIHtcclxuICAgICAgICBldmVudHMucHVzaChsaXN0ZW5lcnMpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gbGlzdGVuZXJzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAgbGlzdGVuZXJzW2ldLmZuICE9PSBmblxyXG4gICAgICAgICAgfHwgKG9uY2UgJiYgIWxpc3RlbmVyc1tpXS5vbmNlKVxyXG4gICAgICAgICAgfHwgKGNvbnRleHQgJiYgbGlzdGVuZXJzW2ldLmNvbnRleHQgIT09IGNvbnRleHQpXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICBldmVudHMucHVzaChsaXN0ZW5lcnNbaV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy9cclxuICAvLyBSZXNldCB0aGUgYXJyYXksIG9yIHJlbW92ZSBpdCBjb21wbGV0ZWx5IGlmIHdlIGhhdmUgbm8gbW9yZSBsaXN0ZW5lcnMuXHJcbiAgLy9cclxuICBpZiAoZXZlbnRzLmxlbmd0aCkge1xyXG4gICAgdGhpcy5fZXZlbnRzW2V2dF0gPSBldmVudHMubGVuZ3RoID09PSAxID8gZXZlbnRzWzBdIDogZXZlbnRzO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW2V2dF07XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZW1vdmUgYWxsIGxpc3RlbmVycyBvciBvbmx5IHRoZSBsaXN0ZW5lcnMgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgd2FudCB0byByZW1vdmUgYWxsIGxpc3RlbmVycyBmb3IuXHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uIHJlbW92ZUFsbExpc3RlbmVycyhldmVudCkge1xyXG4gIGlmICghdGhpcy5fZXZlbnRzKSByZXR1cm4gdGhpcztcclxuXHJcbiAgaWYgKGV2ZW50KSBkZWxldGUgdGhpcy5fZXZlbnRzW3ByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnRdO1xyXG4gIGVsc2UgdGhpcy5fZXZlbnRzID0gcHJlZml4ID8ge30gOiBPYmplY3QuY3JlYXRlKG51bGwpO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8vXHJcbi8vIEFsaWFzIG1ldGhvZHMgbmFtZXMgYmVjYXVzZSBwZW9wbGUgcm9sbCBsaWtlIHRoYXQuXHJcbi8vXHJcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub2ZmID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lcjtcclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUub247XHJcblxyXG4vL1xyXG4vLyBUaGlzIGZ1bmN0aW9uIGRvZXNuJ3QgYXBwbHkgYW55bW9yZS5cclxuLy9cclxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbiBzZXRNYXhMaXN0ZW5lcnMoKSB7XHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vL1xyXG4vLyBFeHBvc2UgdGhlIHByZWZpeC5cclxuLy9cclxuRXZlbnRFbWl0dGVyLnByZWZpeGVkID0gcHJlZml4O1xyXG5cclxuLy9cclxuLy8gRXhwb3NlIHRoZSBtb2R1bGUuXHJcbi8vXHJcbmlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mIG1vZHVsZSkge1xyXG4gIG1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xyXG59XHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuLy92YXIgU1RBR0VfTUFYID0gMTtcclxuaW1wb3J0ICogYXMgc2ZnIGZyb20gJy4vZ2xvYmFsJztcclxuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwnO1xyXG5pbXBvcnQgKiBhcyBhdWRpbyBmcm9tICcuL2F1ZGlvJztcclxuLy9pbXBvcnQgKiBhcyBzb25nIGZyb20gJy4vc29uZyc7XHJcbmltcG9ydCAqIGFzIGdyYXBoaWNzIGZyb20gJy4vZ3JhcGhpY3MnO1xyXG5pbXBvcnQgKiBhcyBpbyBmcm9tICcuL2lvJztcclxuaW1wb3J0ICogYXMgY29tbSBmcm9tICcuL2NvbW0nO1xyXG5pbXBvcnQgKiBhcyB0ZXh0IGZyb20gJy4vdGV4dCc7XHJcbmltcG9ydCAqIGFzIGdhbWVvYmogZnJvbSAnLi9nYW1lb2JqJztcclxuaW1wb3J0ICogYXMgbXlzaGlwIGZyb20gJy4vbXlzaGlwJztcclxuaW1wb3J0ICogYXMgZW5lbWllcyBmcm9tICcuL2VuZW1pZXMnO1xyXG5pbXBvcnQgKiBhcyBlZmZlY3RvYmogZnJvbSAnLi9lZmZlY3RvYmonO1xyXG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJy4vZXZlbnRFbWl0dGVyMyc7XHJcblxyXG5cclxuY2xhc3MgU2NvcmVFbnRyeSB7XHJcbiAgY29uc3RydWN0b3IobmFtZSwgc2NvcmUpIHtcclxuICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICB0aGlzLnNjb3JlID0gc2NvcmU7XHJcbiAgfVxyXG59XHJcblxyXG5cclxuY2xhc3MgU3RhZ2UgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoKTtcclxuICAgIHRoaXMuTUFYID0gMTtcclxuICAgIHRoaXMuRElGRklDVUxUWV9NQVggPSAyLjA7XHJcbiAgICB0aGlzLm5vID0gMTtcclxuICAgIHRoaXMucHJpdmF0ZU5vID0gMDtcclxuICAgIHRoaXMuZGlmZmljdWx0eSA9IDE7XHJcbiAgfVxyXG5cclxuICByZXNldCgpIHtcclxuICAgIHRoaXMubm8gPSAxO1xyXG4gICAgdGhpcy5wcml2YXRlTm8gPSAwO1xyXG4gICAgdGhpcy5kaWZmaWN1bHR5ID0gMTtcclxuICB9XHJcblxyXG4gIGFkdmFuY2UoKSB7XHJcbiAgICB0aGlzLm5vKys7XHJcbiAgICB0aGlzLnByaXZhdGVObysrO1xyXG4gICAgdGhpcy51cGRhdGUoKTtcclxuICB9XHJcblxyXG4gIGp1bXAoc3RhZ2VObykge1xyXG4gICAgdGhpcy5ubyA9IHN0YWdlTm87XHJcbiAgICB0aGlzLnByaXZhdGVObyA9IHRoaXMubm8gLSAxO1xyXG4gICAgdGhpcy51cGRhdGUoKTtcclxuICB9XHJcblxyXG4gIHVwZGF0ZSgpIHtcclxuICAgIGlmICh0aGlzLmRpZmZpY3VsdHkgPCB0aGlzLkRJRkZJQ1VMVFlfTUFYKSB7XHJcbiAgICAgIHRoaXMuZGlmZmljdWx0eSA9IDEgKyAwLjA1ICogKHRoaXMubm8gLSAxKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5wcml2YXRlTm8gPj0gdGhpcy5NQVgpIHtcclxuICAgICAgdGhpcy5wcml2YXRlTm8gPSAwO1xyXG4gIC8vICAgIHRoaXMubm8gPSAxO1xyXG4gICAgfVxyXG4gICAgdGhpcy5lbWl0KCd1cGRhdGUnLHRoaXMpO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEdhbWUge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgdGhpcy5DT05TT0xFX1dJRFRIID0gMDtcclxuICAgIHRoaXMuQ09OU09MRV9IRUlHSFQgPSAwO1xyXG4gICAgdGhpcy5SRU5ERVJFUl9QUklPUklUWSA9IDEwMDAwMCB8IDA7XHJcbiAgICB0aGlzLnJlbmRlcmVyID0gbnVsbDtcclxuICAgIHRoaXMuc3RhdHMgPSBudWxsO1xyXG4gICAgdGhpcy5zY2VuZSA9IG51bGw7XHJcbiAgICB0aGlzLmNhbWVyYSA9IG51bGw7XHJcbiAgICB0aGlzLmF1dGhvciA9IG51bGw7XHJcbiAgICB0aGlzLnByb2dyZXNzID0gbnVsbDtcclxuICAgIHRoaXMudGV4dFBsYW5lID0gbnVsbDtcclxuICAgIHRoaXMuYmFzaWNJbnB1dCA9IG5ldyBpby5CYXNpY0lucHV0KCk7XHJcbiAgICB0aGlzLnRhc2tzID0gbmV3IHV0aWwuVGFza3MoKTtcclxuICAgIHNmZy50YXNrcyA9IHRoaXMudGFza3M7XHJcbiAgICB0aGlzLndhdmVHcmFwaCA9IG51bGw7XHJcbiAgICB0aGlzLnN0YXJ0ID0gZmFsc2U7XHJcbiAgICB0aGlzLmJhc2VUaW1lID0gbmV3IERhdGU7XHJcbiAgICB0aGlzLmQgPSAtMC4yO1xyXG4gICAgdGhpcy5hdWRpb18gPSBudWxsO1xyXG4gICAgdGhpcy5zZXF1ZW5jZXIgPSBudWxsO1xyXG4gICAgdGhpcy5waWFubyA9IG51bGw7XHJcbiAgICB0aGlzLnNjb3JlID0gMDtcclxuICAgIHRoaXMuaGlnaFNjb3JlID0gMDtcclxuICAgIHRoaXMuaGlnaFNjb3JlcyA9IFtdO1xyXG4gICAgdGhpcy5pc0hpZGRlbiA9IGZhbHNlO1xyXG4gICAgdGhpcy5teXNoaXBfID0gbnVsbDtcclxuICAgIHRoaXMuZW5lbWllcyA9IG51bGw7XHJcbiAgICB0aGlzLmVuZW15QnVsbGV0cyA9IG51bGw7XHJcbiAgICB0aGlzLlBJID0gTWF0aC5QSTtcclxuICAgIHRoaXMuY29tbV8gPSBudWxsO1xyXG4gICAgdGhpcy5oYW5kbGVOYW1lID0gJyc7XHJcbiAgICB0aGlzLnN0b3JhZ2UgPSBudWxsO1xyXG4gICAgdGhpcy5yYW5rID0gLTE7XHJcbiAgICB0aGlzLnNvdW5kRWZmZWN0cyA9IG51bGw7XHJcbiAgICB0aGlzLmVucyA9IG51bGw7XHJcbiAgICB0aGlzLmVuYnMgPSBudWxsO1xyXG4gICAgdGhpcy5zdGFnZSA9IHNmZy5zdGFnZSA9IG5ldyBTdGFnZSgpO1xyXG4gICAgdGhpcy50aXRsZSA9IG51bGw7Ly8g44K/44Kk44OI44Or44Oh44OD44K344OlXHJcbiAgICB0aGlzLnNwYWNlRmllbGQgPSBudWxsOy8vIOWuh+WumeepuumWk+ODkeODvOODhuOCo+OCr+ODq1xyXG4gICAgdGhpcy5lZGl0SGFuZGxlTmFtZSA9IG51bGw7XHJcbiAgICBzZmcuYWRkU2NvcmUgPSB0aGlzLmFkZFNjb3JlLmJpbmQodGhpcyk7XHJcbiAgICB0aGlzLmNoZWNrVmlzaWJpbGl0eUFQSSgpO1xyXG4gICAgdGhpcy5hdWRpb18gPSBuZXcgYXVkaW8uQXVkaW8oKTtcclxuICB9XHJcblxyXG4gIGV4ZWMoKSB7XHJcbiAgICBcclxuICAgIGlmICghdGhpcy5jaGVja0Jyb3dzZXJTdXBwb3J0KCcjY29udGVudCcpKXtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc2VxdWVuY2VyID0gbmV3IGF1ZGlvLlNlcXVlbmNlcih0aGlzLmF1ZGlvXyk7XHJcbiAgICAvL3BpYW5vID0gbmV3IGF1ZGlvLlBpYW5vKGF1ZGlvXyk7XHJcbiAgICB0aGlzLnNvdW5kRWZmZWN0cyA9IG5ldyBhdWRpby5Tb3VuZEVmZmVjdHModGhpcy5zZXF1ZW5jZXIpO1xyXG5cclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIod2luZG93LnZpc2liaWxpdHlDaGFuZ2UsIHRoaXMub25WaXNpYmlsaXR5Q2hhbmdlLmJpbmQodGhpcyksIGZhbHNlKTtcclxuICAgIHNmZy5nYW1lVGltZXIgPSBuZXcgdXRpbC5HYW1lVGltZXIodGhpcy5nZXRDdXJyZW50VGltZS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLy8g44Ky44O844Og44Kz44Oz44K944O844Or44Gu5Yid5pyf5YyWXHJcbiAgICB0aGlzLmluaXRDb25zb2xlKCk7XHJcbiAgICB0aGlzLmxvYWRSZXNvdXJjZXMoKVxyXG4gICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5zY2VuZS5yZW1vdmUodGhpcy5wcm9ncmVzcy5tZXNoKTtcclxuICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLnNjZW5lLCB0aGlzLmNhbWVyYSk7XHJcbiAgICAgICAgdGhpcy50YXNrcy5jbGVhcigpO1xyXG4gICAgICAgIHRoaXMudGFza3MucHVzaFRhc2sodGhpcy5iYXNpY0lucHV0LnVwZGF0ZS5iaW5kKHRoaXMuYmFzaWNJbnB1dCkpO1xyXG4gICAgICAgIHRoaXMudGFza3MucHVzaFRhc2sodGhpcy5pbml0LmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc3RhcnQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMubWFpbigpO1xyXG4gICAgICB9KTtcclxuICB9XHJcblxyXG4gIGNoZWNrVmlzaWJpbGl0eUFQSSgpIHtcclxuICAgIC8vIGhpZGRlbiDjg5fjg63jg5Hjg4bjgqPjgYrjgojjgbPlj6/oppbmgKfjga7lpInmm7TjgqTjg5njg7Pjg4jjga7lkI3liY3jgpLoqK3lrppcclxuICAgIGlmICh0eXBlb2YgZG9jdW1lbnQuaGlkZGVuICE9PSBcInVuZGVmaW5lZFwiKSB7IC8vIE9wZXJhIDEyLjEwIOOChCBGaXJlZm94IDE4IOS7pemZjeOBp+OCteODneODvOODiCBcclxuICAgICAgdGhpcy5oaWRkZW4gPSBcImhpZGRlblwiO1xyXG4gICAgICB3aW5kb3cudmlzaWJpbGl0eUNoYW5nZSA9IFwidmlzaWJpbGl0eWNoYW5nZVwiO1xyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZG9jdW1lbnQubW96SGlkZGVuICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgIHRoaXMuaGlkZGVuID0gXCJtb3pIaWRkZW5cIjtcclxuICAgICAgd2luZG93LnZpc2liaWxpdHlDaGFuZ2UgPSBcIm1venZpc2liaWxpdHljaGFuZ2VcIjtcclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRvY3VtZW50Lm1zSGlkZGVuICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgIHRoaXMuaGlkZGVuID0gXCJtc0hpZGRlblwiO1xyXG4gICAgICB3aW5kb3cudmlzaWJpbGl0eUNoYW5nZSA9IFwibXN2aXNpYmlsaXR5Y2hhbmdlXCI7XHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkb2N1bWVudC53ZWJraXRIaWRkZW4gIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgdGhpcy5oaWRkZW4gPSBcIndlYmtpdEhpZGRlblwiO1xyXG4gICAgICB3aW5kb3cudmlzaWJpbGl0eUNoYW5nZSA9IFwid2Via2l0dmlzaWJpbGl0eWNoYW5nZVwiO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBjYWxjU2NyZWVuU2l6ZSgpIHtcclxuICAgIHZhciB3aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xyXG4gICAgdmFyIGhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcclxuICAgIGlmICh3aWR0aCA+PSBoZWlnaHQpIHtcclxuICAgICAgd2lkdGggPSBoZWlnaHQgKiBzZmcuVklSVFVBTF9XSURUSCAvIHNmZy5WSVJUVUFMX0hFSUdIVDtcclxuICAgICAgd2hpbGUgKHdpZHRoID4gd2luZG93LmlubmVyV2lkdGgpIHtcclxuICAgICAgICAtLWhlaWdodDtcclxuICAgICAgICB3aWR0aCA9IGhlaWdodCAqIHNmZy5WSVJUVUFMX1dJRFRIIC8gc2ZnLlZJUlRVQUxfSEVJR0hUO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBoZWlnaHQgPSB3aWR0aCAqIHNmZy5WSVJUVUFMX0hFSUdIVCAvIHNmZy5WSVJUVUFMX1dJRFRIO1xyXG4gICAgICB3aGlsZSAoaGVpZ2h0ID4gd2luZG93LmlubmVySGVpZ2h0KSB7XHJcbiAgICAgICAgLS13aWR0aDtcclxuICAgICAgICBoZWlnaHQgPSB3aWR0aCAqIHNmZy5WSVJUVUFMX0hFSUdIVCAvIHNmZy5WSVJUVUFMX1dJRFRIO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLkNPTlNPTEVfV0lEVEggPSB3aWR0aDtcclxuICAgIHRoaXMuQ09OU09MRV9IRUlHSFQgPSBoZWlnaHQ7XHJcbiAgfVxyXG4gIFxyXG4gIC8vLyDjgrPjg7Pjgr3jg7zjg6vnlLvpnaLjga7liJ3mnJ/ljJZcclxuICBpbml0Q29uc29sZShjb25zb2xlQ2xhc3MpIHtcclxuICAgIC8vIOODrOODs+ODgOODqeODvOOBruS9nOaIkFxyXG4gICAgdGhpcy5yZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKHsgYW50aWFsaWFzOiBmYWxzZSwgc29ydE9iamVjdHM6IHRydWUgfSk7XHJcbiAgICB2YXIgcmVuZGVyZXIgPSB0aGlzLnJlbmRlcmVyO1xyXG4gICAgdGhpcy5jYWxjU2NyZWVuU2l6ZSgpO1xyXG4gICAgcmVuZGVyZXIuc2V0U2l6ZSh0aGlzLkNPTlNPTEVfV0lEVEgsIHRoaXMuQ09OU09MRV9IRUlHSFQpO1xyXG4gICAgcmVuZGVyZXIuc2V0Q2xlYXJDb2xvcigwLCAxKTtcclxuICAgIHJlbmRlcmVyLmRvbUVsZW1lbnQuaWQgPSAnY29uc29sZSc7XHJcbiAgICByZW5kZXJlci5kb21FbGVtZW50LmNsYXNzTmFtZSA9IGNvbnNvbGVDbGFzcyB8fCAnY29uc29sZSc7XHJcbiAgICByZW5kZXJlci5kb21FbGVtZW50LnN0eWxlLnpJbmRleCA9IDA7XHJcblxyXG5cclxuICAgIGQzLnNlbGVjdCgnI2NvbnRlbnQnKS5ub2RlKCkuYXBwZW5kQ2hpbGQocmVuZGVyZXIuZG9tRWxlbWVudCk7XHJcblxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICgpID0+IHtcclxuICAgICAgdGhpcy5jYWxjU2NyZWVuU2l6ZSgpO1xyXG4gICAgICByZW5kZXJlci5zZXRTaXplKHRoaXMuQ09OU09MRV9XSURUSCwgdGhpcy5DT05TT0xFX0hFSUdIVCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyDjgrfjg7zjg7Pjga7kvZzmiJBcclxuICAgIHRoaXMuc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcclxuXHJcbiAgICAvLyDjgqvjg6Hjg6njga7kvZzmiJBcclxuICAgIHRoaXMuY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDkwLjAsIHNmZy5WSVJUVUFMX1dJRFRIIC8gc2ZnLlZJUlRVQUxfSEVJR0hUKTtcclxuICAgIHRoaXMuY2FtZXJhLnBvc2l0aW9uLnogPSBzZmcuVklSVFVBTF9IRUlHSFQgLyAyO1xyXG4gICAgdGhpcy5jYW1lcmEubG9va0F0KG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApKTtcclxuXHJcbiAgICAvLyDjg6njgqTjg4jjga7kvZzmiJBcclxuICAgIC8vdmFyIGxpZ2h0ID0gbmV3IFRIUkVFLkRpcmVjdGlvbmFsTGlnaHQoMHhmZmZmZmYpO1xyXG4gICAgLy9saWdodC5wb3NpdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKDAuNTc3LCAwLjU3NywgMC41NzcpO1xyXG4gICAgLy9zY2VuZS5hZGQobGlnaHQpO1xyXG5cclxuICAgIC8vdmFyIGFtYmllbnQgPSBuZXcgVEhSRUUuQW1iaWVudExpZ2h0KDB4ZmZmZmZmKTtcclxuICAgIC8vc2NlbmUuYWRkKGFtYmllbnQpO1xyXG4gICAgcmVuZGVyZXIuY2xlYXIoKTtcclxuICB9XHJcblxyXG4gIC8vLyDjgqjjg6njg7zjgafntYLkuobjgZnjgovjgIJcclxuICBFeGl0RXJyb3IoZSkge1xyXG4gICAgLy9jdHguZmlsbFN0eWxlID0gXCJyZWRcIjtcclxuICAgIC8vY3R4LmZpbGxSZWN0KDAsIDAsIENPTlNPTEVfV0lEVEgsIENPTlNPTEVfSEVJR0hUKTtcclxuICAgIC8vY3R4LmZpbGxTdHlsZSA9IFwid2hpdGVcIjtcclxuICAgIC8vY3R4LmZpbGxUZXh0KFwiRXJyb3IgOiBcIiArIGUsIDAsIDIwKTtcclxuICAgIC8vLy9hbGVydChlKTtcclxuICAgIHRoaXMuc3RhcnQgPSBmYWxzZTtcclxuICAgIHRocm93IGU7XHJcbiAgfVxyXG5cclxuICBvblZpc2liaWxpdHlDaGFuZ2UoKSB7XHJcbiAgICB2YXIgaCA9IGRvY3VtZW50W3RoaXMuaGlkZGVuXTtcclxuICAgIHRoaXMuaXNIaWRkZW4gPSBoO1xyXG4gICAgaWYgKGgpIHtcclxuICAgICAgdGhpcy5wYXVzZSgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5yZXN1bWUoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHBhdXNlKCkge1xyXG4gICAgaWYgKHNmZy5nYW1lVGltZXIuc3RhdHVzID09IHNmZy5nYW1lVGltZXIuU1RBUlQpIHtcclxuICAgICAgc2ZnLmdhbWVUaW1lci5wYXVzZSgpO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuc2VxdWVuY2VyLnN0YXR1cyA9PSB0aGlzLnNlcXVlbmNlci5QTEFZKSB7XHJcbiAgICAgIHRoaXMuc2VxdWVuY2VyLnBhdXNlKCk7XHJcbiAgICB9XHJcbiAgICBzZmcucGF1c2UgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgcmVzdW1lKCkge1xyXG4gICAgaWYgKHNmZy5nYW1lVGltZXIuc3RhdHVzID09IHNmZy5nYW1lVGltZXIuUEFVU0UpIHtcclxuICAgICAgc2ZnLmdhbWVUaW1lci5yZXN1bWUoKTtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnNlcXVlbmNlci5zdGF0dXMgPT0gdGhpcy5zZXF1ZW5jZXIuUEFVU0UpIHtcclxuICAgICAgdGhpcy5zZXF1ZW5jZXIucmVzdW1lKCk7XHJcbiAgICB9XHJcbiAgICBzZmcucGF1c2UgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8vLyDnj77lnKjmmYLplpPjga7lj5blvpdcclxuICBnZXRDdXJyZW50VGltZSgpIHtcclxuICAgIHJldHVybiB0aGlzLmF1ZGlvXy5hdWRpb2N0eC5jdXJyZW50VGltZTtcclxuICB9XHJcblxyXG4gIC8vLyDjg5bjg6njgqbjgrbjga7mqZ/og73jg4Hjgqfjg4Pjgq9cclxuICBjaGVja0Jyb3dzZXJTdXBwb3J0KCkge1xyXG4gICAgdmFyIGNvbnRlbnQgPSAnPGltZyBjbGFzcz1cImVycm9yaW1nXCIgc3JjPVwiaHR0cDovL3B1YmxpYy5ibHUubGl2ZWZpbGVzdG9yZS5jb20veTJwYlkzYXFCejZ3ejRhaDg3UlhFVms1Q2xoRDJMdWpDNU5zNjZIS3ZSODlhanJGZExNMFR4RmVyWVlVUnQ4M2NfYmczNUhTa3FjM0U4R3hhRkQ4LVg5NE1Mc0ZWNUdVNkJZcDE5NUl2ZWdldlEvMjAxMzEwMDEucG5nP3BzaWQ9MVwiIHdpZHRoPVwiNDc5XCIgaGVpZ2h0PVwiNjQwXCIgY2xhc3M9XCJhbGlnbm5vbmVcIiAvPic7XHJcbiAgICAvLyBXZWJHTOOBruOCteODneODvOODiOODgeOCp+ODg+OCr1xyXG4gICAgaWYgKCFEZXRlY3Rvci53ZWJnbCkge1xyXG4gICAgICBkMy5zZWxlY3QoJyNjb250ZW50JykuYXBwZW5kKCdkaXYnKS5jbGFzc2VkKCdlcnJvcicsIHRydWUpLmh0bWwoXHJcbiAgICAgICAgY29udGVudCArICc8cCBjbGFzcz1cImVycm9ydGV4dFwiPuODluODqeOCpuOCtuOBjDxici8+V2ViR0zjgpLjgrXjg53jg7zjg4jjgZfjgabjgYTjgarjgYTjgZ/jgoE8YnIvPuWLleS9nOOBhOOBn+OBl+OBvuOBm+OCk+OAgjwvcD4nKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFdlYiBBdWRpbyBBUEnjg6njg4Pjg5Hjg7xcclxuICAgIGlmICghdGhpcy5hdWRpb18uZW5hYmxlKSB7XHJcbiAgICAgIGQzLnNlbGVjdCgnI2NvbnRlbnQnKS5hcHBlbmQoJ2RpdicpLmNsYXNzZWQoJ2Vycm9yJywgdHJ1ZSkuaHRtbChcclxuICAgICAgICBjb250ZW50ICsgJzxwIGNsYXNzPVwiZXJyb3J0ZXh0XCI+44OW44Op44Km44K244GMPGJyLz5XZWIgQXVkaW8gQVBJ44KS44K144Od44O844OI44GX44Gm44GE44Gq44GE44Gf44KBPGJyLz7li5XkvZzjgYTjgZ/jgZfjgb7jgZvjgpPjgII8L3A+Jyk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyDjg5bjg6njgqbjgrbjgYxQYWdlIFZpc2liaWxpdHkgQVBJIOOCkuOCteODneODvOODiOOBl+OBquOBhOWgtOWQiOOBq+itpuWRiiBcclxuICAgIGlmICh0eXBlb2YgdGhpcy5oaWRkZW4gPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIGQzLnNlbGVjdCgnI2NvbnRlbnQnKS5hcHBlbmQoJ2RpdicpLmNsYXNzZWQoJ2Vycm9yJywgdHJ1ZSkuaHRtbChcclxuICAgICAgICBjb250ZW50ICsgJzxwIGNsYXNzPVwiZXJyb3J0ZXh0XCI+44OW44Op44Km44K244GMPGJyLz5QYWdlIFZpc2liaWxpdHkgQVBJ44KS44K144Od44O844OI44GX44Gm44GE44Gq44GE44Gf44KBPGJyLz7li5XkvZzjgYTjgZ/jgZfjgb7jgZvjgpPjgII8L3A+Jyk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodHlwZW9mIGxvY2FsU3RvcmFnZSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgZDMuc2VsZWN0KCcjY29udGVudCcpLmFwcGVuZCgnZGl2JykuY2xhc3NlZCgnZXJyb3InLCB0cnVlKS5odG1sKFxyXG4gICAgICAgIGNvbnRlbnQgKyAnPHAgY2xhc3M9XCJlcnJvcnRleHRcIj7jg5bjg6njgqbjgrbjgYw8YnIvPldlYiBMb2NhbCBTdG9yYWdl44KS44K144Od44O844OI44GX44Gm44GE44Gq44GE44Gf44KBPGJyLz7li5XkvZzjgYTjgZ/jgZfjgb7jgZvjgpPjgII8L3A+Jyk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuc3RvcmFnZSA9IGxvY2FsU3RvcmFnZTtcclxuICAgIH1cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuIFxyXG4gIC8vLyDjgrLjg7zjg6Djg6HjgqTjg7NcclxuICBtYWluKCkge1xyXG4gICAgLy8g44K/44K544Kv44Gu5ZG844Gz5Ye644GXXHJcbiAgICAvLyDjg6HjgqTjg7Pjgavmj4/nlLtcclxuICAgIGlmICh0aGlzLnN0YXJ0KSB7XHJcbiAgICAgIHRoaXMudGFza3MucHJvY2Vzcyh0aGlzKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGxvYWRSZXNvdXJjZXMoKSB7XHJcbiAgICAvLy8g44Ky44O844Og5Lit44Gu44OG44Kv44K544OB44Oj44O85a6a576pXHJcbiAgICB2YXIgdGV4dHVyZXMgPSB7XHJcbiAgICAgIGZvbnQ6ICdGb250LnBuZycsXHJcbiAgICAgIGZvbnQxOiAnRm9udDIucG5nJyxcclxuICAgICAgYXV0aG9yOiAnYXV0aG9yLnBuZycsXHJcbiAgICAgIHRpdGxlOiAnVElUTEUucG5nJyxcclxuICAgICAgbXlzaGlwOiAnbXlzaGlwMi5wbmcnLFxyXG4gICAgICBlbmVteTogJ2VuZW15LnBuZycsXHJcbiAgICAgIGJvbWI6ICdib21iLnBuZydcclxuICAgIH07XHJcbiAgICAvLy8g44OG44Kv44K544OB44Oj44O844Gu44Ot44O844OJXHJcbiAgXHJcbiAgICB2YXIgbG9hZFByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoKTtcclxuICAgIHZhciBsb2FkZXIgPSBuZXcgVEhSRUUuVGV4dHVyZUxvYWRlcigpO1xyXG4gICAgZnVuY3Rpb24gbG9hZFRleHR1cmUoc3JjKSB7XHJcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgbG9hZGVyLmxvYWQoc3JjLCAodGV4dHVyZSkgPT4ge1xyXG4gICAgICAgICAgdGV4dHVyZS5tYWdGaWx0ZXIgPSBUSFJFRS5OZWFyZXN0RmlsdGVyO1xyXG4gICAgICAgICAgdGV4dHVyZS5taW5GaWx0ZXIgPSBUSFJFRS5MaW5lYXJNaXBNYXBMaW5lYXJGaWx0ZXI7XHJcbiAgICAgICAgICByZXNvbHZlKHRleHR1cmUpO1xyXG4gICAgICAgIH0sIG51bGwsICh4aHIpID0+IHsgcmVqZWN0KHhocikgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciB0ZXhMZW5ndGggPSBPYmplY3Qua2V5cyh0ZXh0dXJlcykubGVuZ3RoO1xyXG4gICAgdmFyIHRleENvdW50ID0gMDtcclxuICAgIHRoaXMucHJvZ3Jlc3MgPSBuZXcgZ3JhcGhpY3MuUHJvZ3Jlc3MoKTtcclxuICAgIHRoaXMucHJvZ3Jlc3MubWVzaC5wb3NpdGlvbi56ID0gMC4wMDE7XHJcbiAgICB0aGlzLnByb2dyZXNzLnJlbmRlcignTG9hZGluZyBSZXNvdWNlcyAuLi4nLCAwKTtcclxuICAgIHRoaXMuc2NlbmUuYWRkKHRoaXMucHJvZ3Jlc3MubWVzaCk7XHJcbiAgICBmb3IgKHZhciBuIGluIHRleHR1cmVzKSB7XHJcbiAgICAgICgobmFtZSwgdGV4UGF0aCkgPT4ge1xyXG4gICAgICAgIGxvYWRQcm9taXNlID0gbG9hZFByb21pc2VcclxuICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGxvYWRUZXh0dXJlKCcuL3Jlcy8nICsgdGV4UGF0aCk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLnRoZW4oKHRleCkgPT4ge1xyXG4gICAgICAgICAgICB0ZXhDb3VudCsrO1xyXG4gICAgICAgICAgICB0aGlzLnByb2dyZXNzLnJlbmRlcignTG9hZGluZyBSZXNvdWNlcyAuLi4nLCAodGV4Q291bnQgLyB0ZXhMZW5ndGggKiAxMDApIHwgMCk7XHJcbiAgICAgICAgICAgIHNmZy50ZXh0dXJlRmlsZXNbbmFtZV0gPSB0ZXg7XHJcbiAgICAgICAgICAgIHRoaXMucmVuZGVyZXIucmVuZGVyKHRoaXMuc2NlbmUsIHRoaXMuY2FtZXJhKTtcclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH0pKG4sIHRleHR1cmVzW25dKTtcclxuICAgIH1cclxuICAgIHJldHVybiBsb2FkUHJvbWlzZTtcclxuICB9XHJcblxyXG4qcmVuZGVyKHRhc2tJbmRleCkge1xyXG4gIHdoaWxlKHRhc2tJbmRleCA+PSAwKXtcclxuICAgIHRoaXMucmVuZGVyZXIucmVuZGVyKHRoaXMuc2NlbmUsIHRoaXMuY2FtZXJhKTtcclxuICAgIHRoaXMudGV4dFBsYW5lLnJlbmRlcigpO1xyXG4gICAgdGhpcy5zdGF0cyAmJiB0aGlzLnN0YXRzLnVwZGF0ZSgpO1xyXG4gICAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgfVxyXG59XHJcblxyXG5pbml0QWN0b3JzKClcclxue1xyXG4gIGxldCBwcm9taXNlcyA9IFtdO1xyXG4gIHRoaXMuc2NlbmUgPSB0aGlzLnNjZW5lIHx8IG5ldyBUSFJFRS5TY2VuZSgpO1xyXG4gIHRoaXMuZW5lbXlCdWxsZXRzID0gdGhpcy5lbmVteUJ1bGxldHMgfHwgbmV3IGVuZW1pZXMuRW5lbXlCdWxsZXRzKHRoaXMuc2NlbmUsIHRoaXMuc2UuYmluZCh0aGlzKSk7XHJcbiAgdGhpcy5lbmVtaWVzID0gdGhpcy5lbmVtaWVzIHx8IG5ldyBlbmVtaWVzLkVuZW1pZXModGhpcy5zY2VuZSwgdGhpcy5zZS5iaW5kKHRoaXMpLCB0aGlzLmVuZW15QnVsbGV0cyk7XHJcbiAgcHJvbWlzZXMucHVzaCh0aGlzLmVuZW1pZXMubG9hZFBhdHRlcm5zKCkpO1xyXG4gIHByb21pc2VzLnB1c2godGhpcy5lbmVtaWVzLmxvYWRGb3JtYXRpb25zKCkpO1xyXG4gIHRoaXMuYm9tYnMgPSBzZmcuYm9tYnMgPSB0aGlzLmJvbWJzIHx8IG5ldyBlZmZlY3RvYmouQm9tYnModGhpcy5zY2VuZSwgdGhpcy5zZS5iaW5kKHRoaXMpKTtcclxuICB0aGlzLm15c2hpcF8gPSB0aGlzLm15c2hpcF8gfHwgbmV3IG15c2hpcC5NeVNoaXAoMCwgLTEwMCwgMC4xLCB0aGlzLnNjZW5lLCB0aGlzLnNlLmJpbmQodGhpcykpO1xyXG4gIHNmZy5teXNoaXBfID0gdGhpcy5teXNoaXBfO1xyXG4gIHRoaXMubXlzaGlwXy5tZXNoLnZpc2libGUgPSBmYWxzZTtcclxuXHJcbiAgdGhpcy5zcGFjZUZpZWxkID0gbnVsbDtcclxuICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xyXG59XHJcblxyXG5pbml0Q29tbUFuZEhpZ2hTY29yZSgpXHJcbntcclxuICAvLyDjg4/jg7Pjg4njg6vjg43jg7zjg6Djga7lj5blvpdcclxuICB0aGlzLmhhbmRsZU5hbWUgPSB0aGlzLnN0b3JhZ2UuZ2V0SXRlbSgnaGFuZGxlTmFtZScpO1xyXG5cclxuICB0aGlzLnRleHRQbGFuZSA9IG5ldyB0ZXh0LlRleHRQbGFuZSh0aGlzLnNjZW5lKTtcclxuICAvLyB0ZXh0UGxhbmUucHJpbnQoMCwgMCwgXCJXZWIgQXVkaW8gQVBJIFRlc3RcIiwgbmV3IFRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gIC8vIOOCueOCs+OCouaDheWgsSDpgJrkv6HnlKhcclxuICB0aGlzLmNvbW1fID0gbmV3IGNvbW0uQ29tbSgpO1xyXG4gIHRoaXMuY29tbV8udXBkYXRlSGlnaFNjb3JlcyA9IChkYXRhKSA9PiB7XHJcbiAgICB0aGlzLmhpZ2hTY29yZXMgPSBkYXRhO1xyXG4gICAgdGhpcy5oaWdoU2NvcmUgPSB0aGlzLmhpZ2hTY29yZXNbMF0uc2NvcmU7XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5jb21tXy51cGRhdGVIaWdoU2NvcmUgPSAoZGF0YSkgPT4ge1xyXG4gICAgaWYgKHRoaXMuaGlnaFNjb3JlIDwgZGF0YS5zY29yZSkge1xyXG4gICAgICB0aGlzLmhpZ2hTY29yZSA9IGRhdGEuc2NvcmU7XHJcbiAgICAgIHRoaXMucHJpbnRTY29yZSgpO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgXHJcbn1cclxuXHJcbippbml0KHRhc2tJbmRleCkge1xyXG4gICAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgICB0aGlzLmluaXRDb21tQW5kSGlnaFNjb3JlKCk7XHJcbiAgICB0aGlzLmJhc2ljSW5wdXQuYmluZCgpO1xyXG4gICAgdGhpcy5pbml0QWN0b3JzKClcclxuICAgIC50aGVuKCgpPT57XHJcbiAgICAgIHRoaXMudGFza3MucHVzaFRhc2sodGhpcy5yZW5kZXIuYmluZCh0aGlzKSwgdGhpcy5SRU5ERVJFUl9QUklPUklUWSk7XHJcbiAgICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLnByaW50QXV0aG9yLmJpbmQodGhpcykpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbi8vLyDkvZzogIXooajnpLpcclxuKnByaW50QXV0aG9yKHRhc2tJbmRleCkge1xyXG4gIGNvbnN0IHdhaXQgPSA2MDtcclxuICB0aGlzLmJhc2ljSW5wdXQua2V5QnVmZmVyLmxlbmd0aCA9IDA7XHJcbiAgXHJcbiAgbGV0IG5leHRUYXNrID0gKCk9PntcclxuICAgIHRoaXMuc2NlbmUucmVtb3ZlKHRoaXMuYXV0aG9yKTtcclxuICAgIC8vc2NlbmUubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuaW5pdFRpdGxlLmJpbmQodGhpcykpO1xyXG4gIH1cclxuICBcclxuICBsZXQgY2hlY2tLZXlJbnB1dCA9ICgpPT4ge1xyXG4gICAgaWYgKHRoaXMuYmFzaWNJbnB1dC5rZXlCdWZmZXIubGVuZ3RoID4gMCB8fCB0aGlzLmJhc2ljSW5wdXQuc3RhcnQpIHtcclxuICAgICAgdGhpcy5iYXNpY0lucHV0LmtleUJ1ZmZlci5sZW5ndGggPSAwO1xyXG4gICAgICBuZXh0VGFzaygpO1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9ICBcclxuXHJcbiAgLy8g5Yid5pyf5YyWXHJcbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gIHZhciB3ID0gc2ZnLnRleHR1cmVGaWxlcy5hdXRob3IuaW1hZ2Uud2lkdGg7XHJcbiAgdmFyIGggPSBzZmcudGV4dHVyZUZpbGVzLmF1dGhvci5pbWFnZS5oZWlnaHQ7XHJcbiAgY2FudmFzLndpZHRoID0gdztcclxuICBjYW52YXMuaGVpZ2h0ID0gaDtcclxuICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgY3R4LmRyYXdJbWFnZShzZmcudGV4dHVyZUZpbGVzLmF1dGhvci5pbWFnZSwgMCwgMCk7XHJcbiAgdmFyIGRhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIHcsIGgpO1xyXG4gIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5HZW9tZXRyeSgpO1xyXG5cclxuICBnZW9tZXRyeS52ZXJ0X3N0YXJ0ID0gW107XHJcbiAgZ2VvbWV0cnkudmVydF9lbmQgPSBbXTtcclxuXHJcbiAge1xyXG4gICAgdmFyIGkgPSAwO1xyXG5cclxuICAgIGZvciAodmFyIHkgPSAwOyB5IDwgaDsgKyt5KSB7XHJcbiAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgdzsgKyt4KSB7XHJcbiAgICAgICAgdmFyIGNvbG9yID0gbmV3IFRIUkVFLkNvbG9yKCk7XHJcblxyXG4gICAgICAgIHZhciByID0gZGF0YS5kYXRhW2krK107XHJcbiAgICAgICAgdmFyIGcgPSBkYXRhLmRhdGFbaSsrXTtcclxuICAgICAgICB2YXIgYiA9IGRhdGEuZGF0YVtpKytdO1xyXG4gICAgICAgIHZhciBhID0gZGF0YS5kYXRhW2krK107XHJcbiAgICAgICAgaWYgKGEgIT0gMCkge1xyXG4gICAgICAgICAgY29sb3Iuc2V0UkdCKHIgLyAyNTUuMCwgZyAvIDI1NS4wLCBiIC8gMjU1LjApO1xyXG4gICAgICAgICAgdmFyIHZlcnQgPSBuZXcgVEhSRUUuVmVjdG9yMygoKHggLSB3IC8gMi4wKSksICgoeSAtIGggLyAyKSkgKiAtMSwgMC4wKTtcclxuICAgICAgICAgIHZhciB2ZXJ0MiA9IG5ldyBUSFJFRS5WZWN0b3IzKDEyMDAgKiBNYXRoLnJhbmRvbSgpIC0gNjAwLCAxMjAwICogTWF0aC5yYW5kb20oKSAtIDYwMCwgMTIwMCAqIE1hdGgucmFuZG9tKCkgLSA2MDApO1xyXG4gICAgICAgICAgZ2VvbWV0cnkudmVydF9zdGFydC5wdXNoKG5ldyBUSFJFRS5WZWN0b3IzKHZlcnQyLnggLSB2ZXJ0LngsIHZlcnQyLnkgLSB2ZXJ0LnksIHZlcnQyLnogLSB2ZXJ0LnopKTtcclxuICAgICAgICAgIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2godmVydDIpO1xyXG4gICAgICAgICAgZ2VvbWV0cnkudmVydF9lbmQucHVzaCh2ZXJ0KTtcclxuICAgICAgICAgIGdlb21ldHJ5LmNvbG9ycy5wdXNoKGNvbG9yKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIOODnuODhuODquOCouODq+OCkuS9nOaIkFxyXG4gIC8vdmFyIHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKCdpbWFnZXMvcGFydGljbGUxLnBuZycpO1xyXG4gIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5Qb2ludHNNYXRlcmlhbCh7c2l6ZTogMjAsIGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLFxyXG4gICAgdHJhbnNwYXJlbnQ6IHRydWUsIHZlcnRleENvbG9yczogdHJ1ZSwgZGVwdGhUZXN0OiBmYWxzZS8vLCBtYXA6IHRleHR1cmVcclxuICB9KTtcclxuXHJcbiAgdGhpcy5hdXRob3IgPSBuZXcgVEhSRUUuUG9pbnRzKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgLy8gICAgYXV0aG9yLnBvc2l0aW9uLnggYXV0aG9yLnBvc2l0aW9uLnk9ICA9MC4wLCAwLjAsIDAuMCk7XHJcblxyXG4gIC8vbWVzaC5zb3J0UGFydGljbGVzID0gZmFsc2U7XHJcbiAgLy92YXIgbWVzaDEgPSBuZXcgVEhSRUUuUGFydGljbGVTeXN0ZW0oKTtcclxuICAvL21lc2guc2NhbGUueCA9IG1lc2guc2NhbGUueSA9IDguMDtcclxuXHJcbiAgdGhpcy5zY2VuZS5hZGQodGhpcy5hdXRob3IpOyAgXHJcblxyXG4gXHJcbiAgLy8g5L2c6ICF6KGo56S644K544OG44OD44OX77yRXHJcbiAgZm9yKGxldCBjb3VudCA9IDEuMDtjb3VudCA+IDA7KGNvdW50IDw9IDAuMDEpP2NvdW50IC09IDAuMDAwNTpjb3VudCAtPSAwLjAwMjUpXHJcbiAge1xyXG4gICAgLy8g5L2V44GL44Kt44O85YWl5Yqb44GM44GC44Gj44Gf5aC05ZCI44Gv5qyh44Gu44K/44K544Kv44G4XHJcbiAgICBpZihjaGVja0tleUlucHV0KCkpe1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxldCBlbmQgPSB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlcy5sZW5ndGg7XHJcbiAgICBsZXQgdiA9IHRoaXMuYXV0aG9yLmdlb21ldHJ5LnZlcnRpY2VzO1xyXG4gICAgbGV0IGQgPSB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0X3N0YXJ0O1xyXG4gICAgbGV0IHYyID0gdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydF9lbmQ7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICAgIHZbaV0ueCA9IHYyW2ldLnggKyBkW2ldLnggKiBjb3VudDtcclxuICAgICAgdltpXS55ID0gdjJbaV0ueSArIGRbaV0ueSAqIGNvdW50O1xyXG4gICAgICB2W2ldLnogPSB2MltpXS56ICsgZFtpXS56ICogY291bnQ7XHJcbiAgICB9XHJcbiAgICB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlc05lZWRVcGRhdGUgPSB0cnVlO1xyXG4gICAgdGhpcy5hdXRob3Iucm90YXRpb24ueCA9IHRoaXMuYXV0aG9yLnJvdGF0aW9uLnkgPSB0aGlzLmF1dGhvci5yb3RhdGlvbi56ID0gY291bnQgKiA0LjA7XHJcbiAgICB0aGlzLmF1dGhvci5tYXRlcmlhbC5vcGFjaXR5ID0gMS4wO1xyXG4gICAgeWllbGQ7XHJcbiAgfVxyXG4gIHRoaXMuYXV0aG9yLnJvdGF0aW9uLnggPSB0aGlzLmF1dGhvci5yb3RhdGlvbi55ID0gdGhpcy5hdXRob3Iucm90YXRpb24ueiA9IDAuMDtcclxuXHJcbiAgZm9yIChsZXQgaSA9IDAsZSA9IHRoaXMuYXV0aG9yLmdlb21ldHJ5LnZlcnRpY2VzLmxlbmd0aDsgaSA8IGU7ICsraSkge1xyXG4gICAgdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydGljZXNbaV0ueCA9IHRoaXMuYXV0aG9yLmdlb21ldHJ5LnZlcnRfZW5kW2ldLng7XHJcbiAgICB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlc1tpXS55ID0gdGhpcy5hdXRob3IuZ2VvbWV0cnkudmVydF9lbmRbaV0ueTtcclxuICAgIHRoaXMuYXV0aG9yLmdlb21ldHJ5LnZlcnRpY2VzW2ldLnogPSB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0X2VuZFtpXS56O1xyXG4gIH1cclxuICB0aGlzLmF1dGhvci5nZW9tZXRyeS52ZXJ0aWNlc05lZWRVcGRhdGUgPSB0cnVlO1xyXG5cclxuICAvLyDlvoXjgaFcclxuICBmb3IobGV0IGkgPSAwO2kgPCB3YWl0OysraSl7XHJcbiAgICAvLyDkvZXjgYvjgq3jg7zlhaXlipvjgYzjgYLjgaPjgZ/loLTlkIjjga/mrKHjga7jgr/jgrnjgq/jgbhcclxuICAgIGlmKGNoZWNrS2V5SW5wdXQoKSl7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLmF1dGhvci5tYXRlcmlhbC5zaXplID4gMikge1xyXG4gICAgICB0aGlzLmF1dGhvci5tYXRlcmlhbC5zaXplIC09IDAuNTtcclxuICAgICAgdGhpcy5hdXRob3IubWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgfSAgICBcclxuICAgIHlpZWxkO1xyXG4gIH1cclxuXHJcbiAgLy8g44OV44Kn44O844OJ44Ki44Km44OIXHJcbiAgZm9yKGxldCBjb3VudCA9IDAuMDtjb3VudCA8PSAxLjA7Y291bnQgKz0gMC4wNSlcclxuICB7XHJcbiAgICAvLyDkvZXjgYvjgq3jg7zlhaXlipvjgYzjgYLjgaPjgZ/loLTlkIjjga/mrKHjga7jgr/jgrnjgq/jgbhcclxuICAgIGlmKGNoZWNrS2V5SW5wdXQoKSl7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHRoaXMuYXV0aG9yLm1hdGVyaWFsLm9wYWNpdHkgPSAxLjAgLSBjb3VudDtcclxuICAgIHRoaXMuYXV0aG9yLm1hdGVyaWFsLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIFxyXG4gICAgeWllbGQ7XHJcbiAgfVxyXG5cclxuICB0aGlzLmF1dGhvci5tYXRlcmlhbC5vcGFjaXR5ID0gMC4wOyBcclxuICB0aGlzLmF1dGhvci5tYXRlcmlhbC5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcblxyXG4gIC8vIOW+heOBoVxyXG4gIGZvcihsZXQgaSA9IDA7aSA8IHdhaXQ7KytpKXtcclxuICAgIC8vIOS9leOBi+OCreODvOWFpeWKm+OBjOOBguOBo+OBn+WgtOWQiOOBr+asoeOBruOCv+OCueOCr+OBuFxyXG4gICAgaWYoY2hlY2tLZXlJbnB1dCgpKXtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgeWllbGQ7XHJcbiAgfVxyXG4gIG5leHRUYXNrKCk7XHJcbn1cclxuXHJcbi8vLyDjgr/jgqTjg4jjg6vnlLvpnaLliJ3mnJ/ljJYgLy8vXHJcbippbml0VGl0bGUodGFza0luZGV4KSB7XHJcbiAgXHJcbiAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgXHJcbiAgdGhpcy5iYXNpY0lucHV0LmNsZWFyKCk7XHJcblxyXG4gIC8vIOOCv+OCpOODiOODq+ODoeODg+OCt+ODpeOBruS9nOaIkOODu+ihqOekuiAvLy9cclxuICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBtYXA6IHNmZy50ZXh0dXJlRmlsZXMudGl0bGUgfSk7XHJcbiAgbWF0ZXJpYWwuc2hhZGluZyA9IFRIUkVFLkZsYXRTaGFkaW5nO1xyXG4gIC8vbWF0ZXJpYWwuYW50aWFsaWFzID0gZmFsc2U7XHJcbiAgbWF0ZXJpYWwudHJhbnNwYXJlbnQgPSB0cnVlO1xyXG4gIG1hdGVyaWFsLmFscGhhVGVzdCA9IDAuNTtcclxuICBtYXRlcmlhbC5kZXB0aFRlc3QgPSB0cnVlO1xyXG4gIHRoaXMudGl0bGUgPSBuZXcgVEhSRUUuTWVzaChcclxuICAgIG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KHNmZy50ZXh0dXJlRmlsZXMudGl0bGUuaW1hZ2Uud2lkdGgsIHNmZy50ZXh0dXJlRmlsZXMudGl0bGUuaW1hZ2UuaGVpZ2h0KSxcclxuICAgIG1hdGVyaWFsXHJcbiAgICApO1xyXG4gIHRoaXMudGl0bGUuc2NhbGUueCA9IHRoaXMudGl0bGUuc2NhbGUueSA9IDAuODtcclxuICB0aGlzLnRpdGxlLnBvc2l0aW9uLnkgPSA4MDtcclxuICB0aGlzLnNjZW5lLmFkZCh0aGlzLnRpdGxlKTtcclxuICB0aGlzLnNob3dTcGFjZUZpZWxkKCk7XHJcbiAgLy8vIOODhuOCreOCueODiOihqOekulxyXG4gIHRoaXMudGV4dFBsYW5lLnByaW50KDMsIDI1LCBcIlB1c2ggeiBvciBTVEFSVCBidXR0b25cIiwgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgc2ZnLmdhbWVUaW1lci5zdGFydCgpO1xyXG4gIHRoaXMuc2hvd1RpdGxlLmVuZFRpbWUgPSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lICsgMTAvKuenkiovO1xyXG4gIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLnNob3dUaXRsZS5iaW5kKHRoaXMpKTtcclxuICByZXR1cm47XHJcbn1cclxuXHJcbi8vLyDog4zmma/jg5Hjg7zjg4bjgqPjgq/jg6vooajnpLpcclxuc2hvd1NwYWNlRmllbGQoKSB7XHJcbiAgLy8vIOiDjOaZr+ODkeODvOODhuOCo+OCr+ODq+ihqOekulxyXG4gIGlmICghdGhpcy5zcGFjZUZpZWxkKSB7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTtcclxuXHJcbiAgICBnZW9tZXRyeS5lbmR5ID0gW107XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDI1MDsgKytpKSB7XHJcbiAgICAgIHZhciBjb2xvciA9IG5ldyBUSFJFRS5Db2xvcigpO1xyXG4gICAgICB2YXIgeiA9IC0xODAwLjAgKiBNYXRoLnJhbmRvbSgpIC0gMzAwLjA7XHJcbiAgICAgIGNvbG9yLnNldEhTTCgwLjA1ICsgTWF0aC5yYW5kb20oKSAqIDAuMDUsIDEuMCwgKC0yMTAwIC0geikgLyAtMjEwMCk7XHJcbiAgICAgIHZhciBlbmR5ID0gc2ZnLlZJUlRVQUxfSEVJR0hUIC8gMiAtIHogKiBzZmcuVklSVFVBTF9IRUlHSFQgLyBzZmcuVklSVFVBTF9XSURUSDtcclxuICAgICAgdmFyIHZlcnQyID0gbmV3IFRIUkVFLlZlY3RvcjMoKHNmZy5WSVJUVUFMX1dJRFRIIC0geiAqIDIpICogTWF0aC5yYW5kb20oKSAtICgoc2ZnLlZJUlRVQUxfV0lEVEggLSB6ICogMikgLyAyKVxyXG4gICAgICAgICwgZW5keSAqIDIgKiBNYXRoLnJhbmRvbSgpIC0gZW5keSwgeik7XHJcbiAgICAgIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2godmVydDIpO1xyXG4gICAgICBnZW9tZXRyeS5lbmR5LnB1c2goZW5keSk7XHJcblxyXG4gICAgICBnZW9tZXRyeS5jb2xvcnMucHVzaChjb2xvcik7XHJcbiAgICB9XHJcblxyXG4gICAgLy8g44Oe44OG44Oq44Ki44Or44KS5L2c5oiQXHJcbiAgICAvL3ZhciB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSgnaW1hZ2VzL3BhcnRpY2xlMS5wbmcnKTtcclxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5Qb2ludHNNYXRlcmlhbCh7XHJcbiAgICAgIHNpemU6IDQsIGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLFxyXG4gICAgICB0cmFuc3BhcmVudDogdHJ1ZSwgdmVydGV4Q29sb3JzOiB0cnVlLCBkZXB0aFRlc3Q6IHRydWUvLywgbWFwOiB0ZXh0dXJlXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLnNwYWNlRmllbGQgPSBuZXcgVEhSRUUuUG9pbnRzKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgICB0aGlzLnNwYWNlRmllbGQucG9zaXRpb24ueCA9IHRoaXMuc3BhY2VGaWVsZC5wb3NpdGlvbi55ID0gdGhpcy5zcGFjZUZpZWxkLnBvc2l0aW9uLnogPSAwLjA7XHJcbiAgICB0aGlzLnNjZW5lLmFkZCh0aGlzLnNwYWNlRmllbGQpO1xyXG4gICAgdGhpcy50YXNrcy5wdXNoVGFzayh0aGlzLm1vdmVTcGFjZUZpZWxkLmJpbmQodGhpcykpO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOWuh+WumeepuumWk+OBruihqOekulxyXG4qbW92ZVNwYWNlRmllbGQodGFza0luZGV4KSB7XHJcbiAgd2hpbGUodHJ1ZSl7XHJcbiAgICB2YXIgdmVydHMgPSB0aGlzLnNwYWNlRmllbGQuZ2VvbWV0cnkudmVydGljZXM7XHJcbiAgICB2YXIgZW5keXMgPSB0aGlzLnNwYWNlRmllbGQuZ2VvbWV0cnkuZW5keTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB2ZXJ0cy5sZW5ndGg7IGkgPCBlbmQ7ICsraSkge1xyXG4gICAgICB2ZXJ0c1tpXS55IC09IDQ7XHJcbiAgICAgIGlmICh2ZXJ0c1tpXS55IDwgLWVuZHlzW2ldKSB7XHJcbiAgICAgICAgdmVydHNbaV0ueSA9IGVuZHlzW2ldO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLnNwYWNlRmllbGQuZ2VvbWV0cnkudmVydGljZXNOZWVkVXBkYXRlID0gdHJ1ZTtcclxuICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOOCv+OCpOODiOODq+ihqOekulxyXG4qc2hvd1RpdGxlKHRhc2tJbmRleCkge1xyXG4gd2hpbGUodHJ1ZSl7XHJcbiAgc2ZnLmdhbWVUaW1lci51cGRhdGUoKTtcclxuXHJcbiAgaWYgKHRoaXMuYmFzaWNJbnB1dC56IHx8IHRoaXMuYmFzaWNJbnB1dC5zdGFydCApIHtcclxuICAgIHRoaXMuc2NlbmUucmVtb3ZlKHRoaXMudGl0bGUpO1xyXG4gICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuaW5pdEhhbmRsZU5hbWUuYmluZCh0aGlzKSk7XHJcbiAgfVxyXG4gIGlmICh0aGlzLnNob3dUaXRsZS5lbmRUaW1lIDwgc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSkge1xyXG4gICAgdGhpcy5zY2VuZS5yZW1vdmUodGhpcy50aXRsZSk7XHJcbiAgICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5pbml0VG9wMTAuYmluZCh0aGlzKSk7XHJcbiAgfVxyXG4gIHlpZWxkO1xyXG4gfVxyXG59XHJcblxyXG4vLy8g44OP44Oz44OJ44Or44ON44O844Og44Gu44Ko44Oz44OI44Oq5YmN5Yid5pyf5YyWXHJcbippbml0SGFuZGxlTmFtZSh0YXNrSW5kZXgpIHtcclxuICBsZXQgZW5kID0gZmFsc2U7XHJcbiAgaWYgKHRoaXMuZWRpdEhhbmRsZU5hbWUpe1xyXG4gICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuZ2FtZUluaXQuYmluZCh0aGlzKSk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHRoaXMuZWRpdEhhbmRsZU5hbWUgPSB0aGlzLmhhbmRsZU5hbWUgfHwgJyc7XHJcbiAgICB0aGlzLnRleHRQbGFuZS5jbHMoKTtcclxuICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDQsIDE4LCAnSW5wdXQgeW91ciBoYW5kbGUgbmFtZS4nKTtcclxuICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDgsIDE5LCAnKE1heCA4IENoYXIpJyk7XHJcbiAgICB0aGlzLnRleHRQbGFuZS5wcmludCgxMCwgMjEsIHRoaXMuZWRpdEhhbmRsZU5hbWUpO1xyXG4gICAgLy8gICAgdGV4dFBsYW5lLnByaW50KDEwLCAyMSwgaGFuZGxlTmFtZVswXSwgVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgICB0aGlzLmJhc2ljSW5wdXQudW5iaW5kKCk7XHJcbiAgICB2YXIgZWxtID0gZDMuc2VsZWN0KCcjY29udGVudCcpLmFwcGVuZCgnaW5wdXQnKTtcclxuICAgIGxldCB0aGlzXyA9IHRoaXM7XHJcbiAgICBlbG1cclxuICAgICAgLmF0dHIoJ3R5cGUnLCAndGV4dCcpXHJcbiAgICAgIC5hdHRyKCdwYXR0ZXJuJywgJ1thLXpBLVowLTlfXFxAXFwjXFwkXFwtXXswLDh9JylcclxuICAgICAgLmF0dHIoJ21heGxlbmd0aCcsIDgpXHJcbiAgICAgIC5hdHRyKCdpZCcsICdpbnB1dC1hcmVhJylcclxuICAgICAgLmF0dHIoJ3ZhbHVlJywgdGhpc18uZWRpdEhhbmRsZU5hbWUpXHJcbiAgICAgIC5jYWxsKGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgZC5ub2RlKCkuc2VsZWN0aW9uU3RhcnQgPSB0aGlzXy5lZGl0SGFuZGxlTmFtZS5sZW5ndGg7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5vbignYmx1cicsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBkMy5ldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIGQzLmV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIC8vbGV0IHRoaXNfID0gdGhpcztcclxuICAgICAgICBzZXRUaW1lb3V0KCAoKSA9PiB7IHRoaXMuZm9jdXMoKTsgfSwgMTApO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfSlcclxuICAgICAgLm9uKCdrZXl1cCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChkMy5ldmVudC5rZXlDb2RlID09IDEzKSB7XHJcbiAgICAgICAgICB0aGlzXy5lZGl0SGFuZGxlTmFtZSA9IHRoaXMudmFsdWU7XHJcbiAgICAgICAgICBsZXQgcyA9IHRoaXMuc2VsZWN0aW9uU3RhcnQ7XHJcbiAgICAgICAgICBsZXQgZSA9IHRoaXMuc2VsZWN0aW9uRW5kO1xyXG4gICAgICAgICAgdGhpc18udGV4dFBsYW5lLnByaW50KDEwLCAyMSwgdGhpc18uZWRpdEhhbmRsZU5hbWUpO1xyXG4gICAgICAgICAgdGhpc18udGV4dFBsYW5lLnByaW50KDEwICsgcywgMjEsICdfJywgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgICAgICAgICBkMy5zZWxlY3QodGhpcykub24oJ2tleXVwJywgbnVsbCk7XHJcbiAgICAgICAgICB0aGlzXy5iYXNpY0lucHV0LmJpbmQoKTtcclxuICAgICAgICAgIC8vIOOBk+OBruOCv+OCueOCr+OCkue1guOCj+OCieOBm+OCi1xyXG4gICAgICAgICAgdGhpc18udGFza3MuYXJyYXlbdGFza0luZGV4XS5nZW5JbnN0Lm5leHQoLSh0YXNrSW5kZXggKyAxKSk7XHJcbiAgICAgICAgICAvLyDmrKHjga7jgr/jgrnjgq/jgpLoqK3lrprjgZnjgotcclxuICAgICAgICAgIHRoaXNfLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpc18uZ2FtZUluaXQuYmluZCh0aGlzXykpO1xyXG4gICAgICAgICAgdGhpc18uc3RvcmFnZS5zZXRJdGVtKCdoYW5kbGVOYW1lJywgdGhpc18uZWRpdEhhbmRsZU5hbWUpO1xyXG4gICAgICAgICAgZDMuc2VsZWN0KCcjaW5wdXQtYXJlYScpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzXy5lZGl0SGFuZGxlTmFtZSA9IHRoaXMudmFsdWU7XHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnNlbGVjdGlvblN0YXJ0O1xyXG4gICAgICAgIHRoaXNfLnRleHRQbGFuZS5wcmludCgxMCwgMjEsICcgICAgICAgICAgICcpO1xyXG4gICAgICAgIHRoaXNfLnRleHRQbGFuZS5wcmludCgxMCwgMjEsIHRoaXNfLmVkaXRIYW5kbGVOYW1lKTtcclxuICAgICAgICB0aGlzXy50ZXh0UGxhbmUucHJpbnQoMTAgKyBzLCAyMSwgJ18nLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICAgICAgfSlcclxuICAgICAgLmNhbGwoZnVuY3Rpb24oKXtcclxuICAgICAgICBsZXQgcyA9IHRoaXMubm9kZSgpLnNlbGVjdGlvblN0YXJ0O1xyXG4gICAgICAgIHRoaXNfLnRleHRQbGFuZS5wcmludCgxMCwgMjEsICcgICAgICAgICAgICcpO1xyXG4gICAgICAgIHRoaXNfLnRleHRQbGFuZS5wcmludCgxMCwgMjEsIHRoaXNfLmVkaXRIYW5kbGVOYW1lKTtcclxuICAgICAgICB0aGlzXy50ZXh0UGxhbmUucHJpbnQoMTAgKyBzLCAyMSwgJ18nLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICAgICAgICB0aGlzLm5vZGUoKS5mb2N1cygpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICB3aGlsZSh0YXNrSW5kZXggPj0gMClcclxuICAgIHtcclxuICAgICAgdGhpcy5iYXNpY0lucHV0LmNsZWFyKCk7XHJcbiAgICAgIGlmKHRoaXMuYmFzaWNJbnB1dC5hQnV0dG9uIHx8IHRoaXMuYmFzaWNJbnB1dC5zdGFydClcclxuICAgICAge1xyXG4gICAgICAgICAgdmFyIGlucHV0QXJlYSA9IGQzLnNlbGVjdCgnI2lucHV0LWFyZWEnKTtcclxuICAgICAgICAgIHZhciBpbnB1dE5vZGUgPSBpbnB1dEFyZWEubm9kZSgpO1xyXG4gICAgICAgICAgdGhpcy5lZGl0SGFuZGxlTmFtZSA9IGlucHV0Tm9kZS52YWx1ZTtcclxuICAgICAgICAgIGxldCBzID0gaW5wdXROb2RlLnNlbGVjdGlvblN0YXJ0O1xyXG4gICAgICAgICAgbGV0IGUgPSBpbnB1dE5vZGUuc2VsZWN0aW9uRW5kO1xyXG4gICAgICAgICAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMTAsIDIxLCB0aGlzLmVkaXRIYW5kbGVOYW1lKTtcclxuICAgICAgICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDEwICsgcywgMjEsICdfJywgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgICAgICAgICBpbnB1dEFyZWEub24oJ2tleXVwJywgbnVsbCk7XHJcbiAgICAgICAgICB0aGlzLmJhc2ljSW5wdXQuYmluZCgpO1xyXG4gICAgICAgICAgLy8g44GT44Gu44K/44K544Kv44KS57WC44KP44KJ44Gb44KLXHJcbiAgICAgICAgICAvL3RoaXMudGFza3MuYXJyYXlbdGFza0luZGV4XS5nZW5JbnN0Lm5leHQoLSh0YXNrSW5kZXggKyAxKSk7XHJcbiAgICAgICAgICAvLyDmrKHjga7jgr/jgrnjgq/jgpLoqK3lrprjgZnjgotcclxuICAgICAgICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLmdhbWVJbml0LmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgdGhpcy5zdG9yYWdlLnNldEl0ZW0oJ2hhbmRsZU5hbWUnLCB0aGlzLmVkaXRIYW5kbGVOYW1lKTtcclxuICAgICAgICAgIGlucHV0QXJlYS5yZW1vdmUoKTtcclxuICAgICAgICAgIHJldHVybjsgICAgICAgIFxyXG4gICAgICB9XHJcbiAgICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gICAgfVxyXG4gICAgdGFza0luZGV4ID0gLSgrK3Rhc2tJbmRleCk7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g44K544Kz44Ki5Yqg566XXHJcbmFkZFNjb3JlKHMpIHtcclxuICB0aGlzLnNjb3JlICs9IHM7XHJcbiAgaWYgKHRoaXMuc2NvcmUgPiB0aGlzLmhpZ2hTY29yZSkge1xyXG4gICAgdGhpcy5oaWdoU2NvcmUgPSB0aGlzLnNjb3JlO1xyXG4gIH1cclxufVxyXG5cclxuLy8vIOOCueOCs+OCouihqOekulxyXG5wcmludFNjb3JlKCkge1xyXG4gIHZhciBzID0gKCcwMDAwMDAwMCcgKyB0aGlzLnNjb3JlLnRvU3RyaW5nKCkpLnNsaWNlKC04KTtcclxuICB0aGlzLnRleHRQbGFuZS5wcmludCgxLCAxLCBzKTtcclxuXHJcbiAgdmFyIGggPSAoJzAwMDAwMDAwJyArIHRoaXMuaGlnaFNjb3JlLnRvU3RyaW5nKCkpLnNsaWNlKC04KTtcclxuICB0aGlzLnRleHRQbGFuZS5wcmludCgxMiwgMSwgaCk7XHJcblxyXG59XHJcblxyXG4vLy8g44K144Km44Oz44OJ44Ko44OV44Kn44Kv44OIXHJcbnNlKGluZGV4KSB7XHJcbiAgdGhpcy5zZXF1ZW5jZXIucGxheVRyYWNrcyh0aGlzLnNvdW5kRWZmZWN0cy5zb3VuZEVmZmVjdHNbaW5kZXhdKTtcclxufVxyXG5cclxuLy8vIOOCsuODvOODoOOBruWIneacn+WMllxyXG4qZ2FtZUluaXQodGFza0luZGV4KSB7XHJcblxyXG4gIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gIFxyXG5cclxuICAvLyDjgqrjg7zjg4fjgqPjgqrjga7plovlp4tcclxuICB0aGlzLmF1ZGlvXy5zdGFydCgpO1xyXG4gIHRoaXMuc2VxdWVuY2VyLmxvYWQoYXVkaW8uc2VxRGF0YSk7XHJcbiAgdGhpcy5zZXF1ZW5jZXIuc3RhcnQoKTtcclxuICBzZmcuc3RhZ2UucmVzZXQoKTtcclxuICB0aGlzLnRleHRQbGFuZS5jbHMoKTtcclxuICB0aGlzLmVuZW1pZXMucmVzZXQoKTtcclxuXHJcbiAgLy8g6Ieq5qmf44Gu5Yid5pyf5YyWXHJcbiAgdGhpcy5teXNoaXBfLmluaXQoKTtcclxuICBzZmcuZ2FtZVRpbWVyLnN0YXJ0KCk7XHJcbiAgdGhpcy5zY29yZSA9IDA7XHJcbiAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMiwgMCwgJ1Njb3JlICAgIEhpZ2ggU2NvcmUnKTtcclxuICB0aGlzLnRleHRQbGFuZS5wcmludCgyMCwgMzksICdSZXN0OiAgICcgKyBzZmcubXlzaGlwXy5yZXN0KTtcclxuICB0aGlzLnByaW50U2NvcmUoKTtcclxuICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5zdGFnZUluaXQuYmluZCh0aGlzKS8qZ2FtZUFjdGlvbiovKTtcclxufVxyXG5cclxuLy8vIOOCueODhuODvOOCuOOBruWIneacn+WMllxyXG4qc3RhZ2VJbml0KHRhc2tJbmRleCkge1xyXG4gIFxyXG4gIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gIFxyXG4gIHRoaXMudGV4dFBsYW5lLnByaW50KDAsIDM5LCAnU3RhZ2U6JyArIHNmZy5zdGFnZS5ubyk7XHJcbiAgc2ZnLmdhbWVUaW1lci5zdGFydCgpO1xyXG4gIHRoaXMuZW5lbWllcy5yZXNldCgpO1xyXG4gIHRoaXMuZW5lbWllcy5zdGFydCgpO1xyXG4gIHRoaXMuZW5lbWllcy5jYWxjRW5lbWllc0NvdW50KHNmZy5zdGFnZS5wcml2YXRlTm8pO1xyXG4gIHRoaXMuZW5lbWllcy5oaXRFbmVtaWVzQ291bnQgPSAwO1xyXG4gIHRoaXMudGV4dFBsYW5lLnByaW50KDgsIDE1LCAnU3RhZ2UgJyArIChzZmcuc3RhZ2Uubm8pICsgJyBTdGFydCAhIScsIG5ldyB0ZXh0LlRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLnN0YWdlU3RhcnQuYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcbi8vLyDjgrnjg4bjg7zjgrjplovlp4tcclxuKnN0YWdlU3RhcnQodGFza0luZGV4KSB7XHJcbiAgbGV0IGVuZFRpbWUgPSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lICsgMjtcclxuICB3aGlsZSh0YXNrSW5kZXggPj0gMCAmJiBlbmRUaW1lID49IHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUpe1xyXG4gICAgc2ZnLmdhbWVUaW1lci51cGRhdGUoKTtcclxuICAgIHNmZy5teXNoaXBfLmFjdGlvbih0aGlzLmJhc2ljSW5wdXQpO1xyXG4gICAgdGFza0luZGV4ID0geWllbGQ7ICAgIFxyXG4gIH1cclxuICB0aGlzLnRleHRQbGFuZS5wcmludCg4LCAxNSwgJyAgICAgICAgICAgICAgICAgICcsIG5ldyB0ZXh0LlRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLmdhbWVBY3Rpb24uYmluZCh0aGlzKSwgNTAwMCk7XHJcbn1cclxuXHJcbi8vLyDjgrLjg7zjg6DkuK1cclxuKmdhbWVBY3Rpb24odGFza0luZGV4KSB7XHJcbiAgd2hpbGUgKHRhc2tJbmRleCA+PSAwKXtcclxuICAgIHRoaXMucHJpbnRTY29yZSgpO1xyXG4gICAgc2ZnLm15c2hpcF8uYWN0aW9uKHRoaXMuYmFzaWNJbnB1dCk7XHJcbiAgICBzZmcuZ2FtZVRpbWVyLnVwZGF0ZSgpO1xyXG4gICAgLy9jb25zb2xlLmxvZyhzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lKTtcclxuICAgIHRoaXMuZW5lbWllcy5tb3ZlKCk7XHJcblxyXG4gICAgaWYgKCF0aGlzLnByb2Nlc3NDb2xsaXNpb24oKSkge1xyXG4gICAgICAvLyDpnaLjgq/jg6rjgqLjg4Hjgqfjg4Pjgq9cclxuICAgICAgaWYgKHRoaXMuZW5lbWllcy5oaXRFbmVtaWVzQ291bnQgPT0gdGhpcy5lbmVtaWVzLnRvdGFsRW5lbWllc0NvdW50KSB7XHJcbiAgICAgICAgdGhpcy5wcmludFNjb3JlKCk7XHJcbiAgICAgICAgdGhpcy5zdGFnZS5hZHZhbmNlKCk7XHJcbiAgICAgICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuc3RhZ2VJbml0LmJpbmQodGhpcykpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5teVNoaXBCb21iLmVuZFRpbWUgPSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lICsgMztcclxuICAgICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMubXlTaGlwQm9tYi5iaW5kKHRoaXMpKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfTtcclxuICAgIHRhc2tJbmRleCA9IHlpZWxkOyBcclxuICB9XHJcbn1cclxuXHJcbi8vLyDlvZPjgZ/jgorliKTlrppcclxucHJvY2Vzc0NvbGxpc2lvbih0YXNrSW5kZXgpIHtcclxuICAvL+OAgOiHquapn+W8vuOBqOaVteOBqOOBruOBguOBn+OCiuWIpOWumlxyXG4gIGxldCBteUJ1bGxldHMgPSBzZmcubXlzaGlwXy5teUJ1bGxldHM7XHJcbiAgdGhpcy5lbnMgPSB0aGlzLmVuZW1pZXMuZW5lbWllcztcclxuICBmb3IgKHZhciBpID0gMCwgZW5kID0gbXlCdWxsZXRzLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICBsZXQgbXliID0gbXlCdWxsZXRzW2ldO1xyXG4gICAgaWYgKG15Yi5lbmFibGVfKSB7XHJcbiAgICAgIHZhciBteWJjbyA9IG15QnVsbGV0c1tpXS5jb2xsaXNpb25BcmVhO1xyXG4gICAgICB2YXIgbGVmdCA9IG15YmNvLmxlZnQgKyBteWIueDtcclxuICAgICAgdmFyIHJpZ2h0ID0gbXliY28ucmlnaHQgKyBteWIueDtcclxuICAgICAgdmFyIHRvcCA9IG15YmNvLnRvcCArIG15Yi55O1xyXG4gICAgICB2YXIgYm90dG9tID0gbXliY28uYm90dG9tIC0gbXliLnNwZWVkICsgbXliLnk7XHJcbiAgICAgIGZvciAodmFyIGogPSAwLCBlbmRqID0gdGhpcy5lbnMubGVuZ3RoOyBqIDwgZW5kajsgKytqKSB7XHJcbiAgICAgICAgdmFyIGVuID0gdGhpcy5lbnNbal07XHJcbiAgICAgICAgaWYgKGVuLmVuYWJsZV8pIHtcclxuICAgICAgICAgIHZhciBlbmNvID0gZW4uY29sbGlzaW9uQXJlYTtcclxuICAgICAgICAgIGlmICh0b3AgPiAoZW4ueSArIGVuY28uYm90dG9tKSAmJlxyXG4gICAgICAgICAgICAoZW4ueSArIGVuY28udG9wKSA+IGJvdHRvbSAmJlxyXG4gICAgICAgICAgICBsZWZ0IDwgKGVuLnggKyBlbmNvLnJpZ2h0KSAmJlxyXG4gICAgICAgICAgICAoZW4ueCArIGVuY28ubGVmdCkgPCByaWdodFxyXG4gICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgZW4uaGl0KG15Yik7XHJcbiAgICAgICAgICAgIGlmIChteWIucG93ZXIgPD0gMCkge1xyXG4gICAgICAgICAgICAgIG15Yi5lbmFibGVfID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyDmlbXjgajoh6rmqZ/jgajjga7jgYLjgZ/jgorliKTlrppcclxuICBpZiAoc2ZnLkNIRUNLX0NPTExJU0lPTikge1xyXG4gICAgbGV0IG15Y28gPSBzZmcubXlzaGlwXy5jb2xsaXNpb25BcmVhO1xyXG4gICAgbGV0IGxlZnQgPSBzZmcubXlzaGlwXy54ICsgbXljby5sZWZ0O1xyXG4gICAgbGV0IHJpZ2h0ID0gbXljby5yaWdodCArIHNmZy5teXNoaXBfLng7XHJcbiAgICBsZXQgdG9wID0gbXljby50b3AgKyBzZmcubXlzaGlwXy55O1xyXG4gICAgbGV0IGJvdHRvbSA9IG15Y28uYm90dG9tICsgc2ZnLm15c2hpcF8ueTtcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gdGhpcy5lbnMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgbGV0IGVuID0gdGhpcy5lbnNbaV07XHJcbiAgICAgIGlmIChlbi5lbmFibGVfKSB7XHJcbiAgICAgICAgbGV0IGVuY28gPSBlbi5jb2xsaXNpb25BcmVhO1xyXG4gICAgICAgIGlmICh0b3AgPiAoZW4ueSArIGVuY28uYm90dG9tKSAmJlxyXG4gICAgICAgICAgKGVuLnkgKyBlbmNvLnRvcCkgPiBib3R0b20gJiZcclxuICAgICAgICAgIGxlZnQgPCAoZW4ueCArIGVuY28ucmlnaHQpICYmXHJcbiAgICAgICAgICAoZW4ueCArIGVuY28ubGVmdCkgPCByaWdodFxyXG4gICAgICAgICAgKSB7XHJcbiAgICAgICAgICBlbi5oaXQobXlzaGlwKTtcclxuICAgICAgICAgIHNmZy5teXNoaXBfLmhpdCgpO1xyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyDmlbXlvL7jgajoh6rmqZ/jgajjga7jgYLjgZ/jgorliKTlrppcclxuICAgIHRoaXMuZW5icyA9IHRoaXMuZW5lbXlCdWxsZXRzLmVuZW15QnVsbGV0cztcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB0aGlzLmVuYnMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgbGV0IGVuID0gdGhpcy5lbmJzW2ldO1xyXG4gICAgICBpZiAoZW4uZW5hYmxlKSB7XHJcbiAgICAgICAgbGV0IGVuY28gPSBlbi5jb2xsaXNpb25BcmVhO1xyXG4gICAgICAgIGlmICh0b3AgPiAoZW4ueSArIGVuY28uYm90dG9tKSAmJlxyXG4gICAgICAgICAgKGVuLnkgKyBlbmNvLnRvcCkgPiBib3R0b20gJiZcclxuICAgICAgICAgIGxlZnQgPCAoZW4ueCArIGVuY28ucmlnaHQpICYmXHJcbiAgICAgICAgICAoZW4ueCArIGVuY28ubGVmdCkgPCByaWdodFxyXG4gICAgICAgICAgKSB7XHJcbiAgICAgICAgICBlbi5oaXQoKTtcclxuICAgICAgICAgIHNmZy5teXNoaXBfLmhpdCgpO1xyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gIH1cclxuICByZXR1cm4gZmFsc2U7XHJcbn1cclxuXHJcbi8vLyDoh6rmqZ/niIbnmbogXHJcbipteVNoaXBCb21iKHRhc2tJbmRleCkge1xyXG4gIHdoaWxlKHNmZy5nYW1lVGltZXIuZWxhcHNlZFRpbWUgPD0gdGhpcy5teVNoaXBCb21iLmVuZFRpbWUgJiYgdGFza0luZGV4ID49IDApe1xyXG4gICAgdGhpcy5lbmVtaWVzLm1vdmUoKTtcclxuICAgIHNmZy5nYW1lVGltZXIudXBkYXRlKCk7XHJcbiAgICB0YXNrSW5kZXggPSB5aWVsZDsgIFxyXG4gIH1cclxuICBzZmcubXlzaGlwXy5yZXN0LS07XHJcbiAgaWYgKHNmZy5teXNoaXBfLnJlc3QgPT0gMCkge1xyXG4gICAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMTAsIDE4LCAnR0FNRSBPVkVSJywgbmV3IHRleHQuVGV4dEF0dHJpYnV0ZSh0cnVlKSk7XHJcbiAgICB0aGlzLnByaW50U2NvcmUoKTtcclxuICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDIwLCAzOSwgJ1Jlc3Q6ICAgJyArIHNmZy5teXNoaXBfLnJlc3QpO1xyXG4gICAgdGhpcy5jb21tXy5zb2NrZXQub24oJ3NlbmRSYW5rJywgdGhpcy5jaGVja1JhbmtJbik7XHJcbiAgICB0aGlzLmNvbW1fLnNlbmRTY29yZShuZXcgU2NvcmVFbnRyeSh0aGlzLmVkaXRIYW5kbGVOYW1lLCB0aGlzLnNjb3JlKSk7XHJcbiAgICB0aGlzLmdhbWVPdmVyLmVuZFRpbWUgPSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lICsgNTtcclxuICAgIHRoaXMucmFuayA9IC0xO1xyXG4gICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuZ2FtZU92ZXIuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLnNlcXVlbmNlci5zdG9wKCk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHNmZy5teXNoaXBfLm1lc2gudmlzaWJsZSA9IHRydWU7XHJcbiAgICB0aGlzLnRleHRQbGFuZS5wcmludCgyMCwgMzksICdSZXN0OiAgICcgKyBzZmcubXlzaGlwXy5yZXN0KTtcclxuICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDgsIDE1LCAnU3RhZ2UgJyArIChzZmcuc3RhZ2Uubm8pICsgJyBTdGFydCAhIScsIG5ldyB0ZXh0LlRleHRBdHRyaWJ1dGUodHJ1ZSkpO1xyXG4gICAgdGhpcy5zdGFnZVN0YXJ0LmVuZFRpbWUgPSBzZmcuZ2FtZVRpbWVyLmVsYXBzZWRUaW1lICsgMjtcclxuICAgIHRoaXMudGFza3Muc2V0TmV4dFRhc2sodGFza0luZGV4LCB0aGlzLnN0YWdlU3RhcnQuYmluZCh0aGlzKSk7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g44Ky44O844Og44Kq44O844OQ44O8XHJcbipnYW1lT3Zlcih0YXNrSW5kZXgpIHtcclxuICB3aGlsZSh0aGlzLmdhbWVPdmVyLmVuZFRpbWUgPj0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSAmJiB0YXNrSW5kZXggPj0gMClcclxuICB7XHJcbiAgICBzZmcuZ2FtZVRpbWVyLnVwZGF0ZSgpO1xyXG4gICAgdGFza0luZGV4ID0geWllbGQ7XHJcbiAgfVxyXG4gIFxyXG5cclxuICB0aGlzLnRleHRQbGFuZS5jbHMoKTtcclxuICB0aGlzLmVuZW1pZXMucmVzZXQoKTtcclxuICB0aGlzLmVuZW15QnVsbGV0cy5yZXNldCgpO1xyXG4gIGlmICh0aGlzLnJhbmsgPj0gMCkge1xyXG4gICAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuaW5pdFRvcDEwLmJpbmQodGhpcykpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5pbml0VGl0bGUuYmluZCh0aGlzKSk7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g44Op44Oz44Kt44Oz44Kw44GX44Gf44GL44Gp44GG44GL44Gu44OB44Kn44OD44KvXHJcbmNoZWNrUmFua0luKGRhdGEpIHtcclxuICB0aGlzLnJhbmsgPSBkYXRhLnJhbms7XHJcbn1cclxuXHJcblxyXG4vLy8g44OP44Kk44K544Kz44Ki44Ko44Oz44OI44Oq44Gu6KGo56S6XHJcbnByaW50VG9wMTAoKSB7XHJcbiAgdmFyIHJhbmtuYW1lID0gWycgMXN0JywgJyAybmQnLCAnIDNyZCcsICcgNHRoJywgJyA1dGgnLCAnIDZ0aCcsICcgN3RoJywgJyA4dGgnLCAnIDl0aCcsICcxMHRoJ107XHJcbiAgdGhpcy50ZXh0UGxhbmUucHJpbnQoOCwgNCwgJ1RvcCAxMCBTY29yZScpO1xyXG4gIHZhciB5ID0gODtcclxuICBmb3IgKHZhciBpID0gMCwgZW5kID0gdGhpcy5oaWdoU2NvcmVzLmxlbmd0aDsgaSA8IGVuZDsgKytpKSB7XHJcbiAgICB2YXIgc2NvcmVTdHIgPSAnMDAwMDAwMDAnICsgdGhpcy5oaWdoU2NvcmVzW2ldLnNjb3JlO1xyXG4gICAgc2NvcmVTdHIgPSBzY29yZVN0ci5zdWJzdHIoc2NvcmVTdHIubGVuZ3RoIC0gOCwgOCk7XHJcbiAgICBpZiAodGhpcy5yYW5rID09IGkpIHtcclxuICAgICAgdGhpcy50ZXh0UGxhbmUucHJpbnQoMywgeSwgcmFua25hbWVbaV0gKyAnICcgKyBzY29yZVN0ciArICcgJyArIHRoaXMuaGlnaFNjb3Jlc1tpXS5uYW1lLCBuZXcgdGV4dC5UZXh0QXR0cmlidXRlKHRydWUpKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMudGV4dFBsYW5lLnByaW50KDMsIHksIHJhbmtuYW1lW2ldICsgJyAnICsgc2NvcmVTdHIgKyAnICcgKyB0aGlzLmhpZ2hTY29yZXNbaV0ubmFtZSk7XHJcbiAgICB9XHJcbiAgICB5ICs9IDI7XHJcbiAgfVxyXG59XHJcblxyXG5cclxuKmluaXRUb3AxMCh0YXNrSW5kZXgpIHtcclxuICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICB0aGlzLnRleHRQbGFuZS5jbHMoKTtcclxuICB0aGlzLnByaW50VG9wMTAoKTtcclxuICB0aGlzLnNob3dUb3AxMC5lbmRUaW1lID0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSArIDU7XHJcbiAgdGhpcy50YXNrcy5zZXROZXh0VGFzayh0YXNrSW5kZXgsIHRoaXMuc2hvd1RvcDEwLmJpbmQodGhpcykpO1xyXG59XHJcblxyXG4qc2hvd1RvcDEwKHRhc2tJbmRleCkge1xyXG4gIHdoaWxlKHRoaXMuc2hvd1RvcDEwLmVuZFRpbWUgPj0gc2ZnLmdhbWVUaW1lci5lbGFwc2VkVGltZSAmJiB0aGlzLmJhc2ljSW5wdXQua2V5QnVmZmVyLmxlbmd0aCA9PSAwICYmIHRhc2tJbmRleCA+PSAwKVxyXG4gIHtcclxuICAgIHNmZy5nYW1lVGltZXIudXBkYXRlKCk7XHJcbiAgICB0YXNrSW5kZXggPSB5aWVsZDtcclxuICB9IFxyXG4gIFxyXG4gIHRoaXMuYmFzaWNJbnB1dC5rZXlCdWZmZXIubGVuZ3RoID0gMDtcclxuICB0aGlzLnRleHRQbGFuZS5jbHMoKTtcclxuICB0aGlzLnRhc2tzLnNldE5leHRUYXNrKHRhc2tJbmRleCwgdGhpcy5pbml0VGl0bGUuYmluZCh0aGlzKSk7XHJcbn1cclxufVxyXG5cclxuXHJcblxyXG5cclxuXHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIENvbGxpc2lvbkFyZWEge1xyXG4gIGNvbnN0cnVjdG9yKG9mZnNldFgsIG9mZnNldFksIHdpZHRoLCBoZWlnaHQpXHJcbiAge1xyXG4gICAgdGhpcy5vZmZzZXRYID0gb2Zmc2V0WCB8fCAwO1xyXG4gICAgdGhpcy5vZmZzZXRZID0gb2Zmc2V0WSB8fCAwO1xyXG4gICAgdGhpcy50b3AgPSAwO1xyXG4gICAgdGhpcy5ib3R0b20gPSAwO1xyXG4gICAgdGhpcy5sZWZ0ID0gMDtcclxuICAgIHRoaXMucmlnaHQgPSAwO1xyXG4gICAgdGhpcy53aWR0aCA9IHdpZHRoIHx8IDA7XHJcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodCB8fCAwO1xyXG4gICAgdGhpcy53aWR0aF8gPSAwO1xyXG4gICAgdGhpcy5oZWlnaHRfID0gMDtcclxuICB9XHJcbiAgZ2V0IHdpZHRoKCkgeyByZXR1cm4gdGhpcy53aWR0aF87IH1cclxuICBzZXQgd2lkdGgodikge1xyXG4gICAgdGhpcy53aWR0aF8gPSB2O1xyXG4gICAgdGhpcy5sZWZ0ID0gdGhpcy5vZmZzZXRYIC0gdiAvIDI7XHJcbiAgICB0aGlzLnJpZ2h0ID0gdGhpcy5vZmZzZXRYICsgdiAvIDI7XHJcbiAgfVxyXG4gIGdldCBoZWlnaHQoKSB7IHJldHVybiB0aGlzLmhlaWdodF87IH1cclxuICBzZXQgaGVpZ2h0KHYpIHtcclxuICAgIHRoaXMuaGVpZ2h0XyA9IHY7XHJcbiAgICB0aGlzLnRvcCA9IHRoaXMub2Zmc2V0WSArIHYgLyAyO1xyXG4gICAgdGhpcy5ib3R0b20gPSB0aGlzLm9mZnNldFkgLSB2IC8gMjtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBHYW1lT2JqIHtcclxuICBjb25zdHJ1Y3Rvcih4LCB5LCB6KSB7XHJcbiAgICB0aGlzLnhfID0geCB8fCAwO1xyXG4gICAgdGhpcy55XyA9IHkgfHwgMDtcclxuICAgIHRoaXMuel8gPSB6IHx8IDAuMDtcclxuICAgIHRoaXMuZW5hYmxlXyA9IGZhbHNlO1xyXG4gICAgdGhpcy53aWR0aCA9IDA7XHJcbiAgICB0aGlzLmhlaWdodCA9IDA7XHJcbiAgICB0aGlzLmNvbGxpc2lvbkFyZWEgPSBuZXcgQ29sbGlzaW9uQXJlYSgpO1xyXG4gIH1cclxuICBnZXQgeCgpIHsgcmV0dXJuIHRoaXMueF87IH1cclxuICBzZXQgeCh2KSB7IHRoaXMueF8gPSB2OyB9XHJcbiAgZ2V0IHkoKSB7IHJldHVybiB0aGlzLnlfOyB9XHJcbiAgc2V0IHkodikgeyB0aGlzLnlfID0gdjsgfVxyXG4gIGdldCB6KCkgeyByZXR1cm4gdGhpcy56XzsgfVxyXG4gIHNldCB6KHYpIHsgdGhpcy56XyA9IHY7IH1cclxufVxyXG5cclxuIiwiZXhwb3J0IGNvbnN0IFZJUlRVQUxfV0lEVEggPSAyNDA7XHJcbmV4cG9ydCBjb25zdCBWSVJUVUFMX0hFSUdIVCA9IDMyMDtcclxuXHJcbmV4cG9ydCBjb25zdCBWX1JJR0hUID0gVklSVFVBTF9XSURUSCAvIDIuMDtcclxuZXhwb3J0IGNvbnN0IFZfVE9QID0gVklSVFVBTF9IRUlHSFQgLyAyLjA7XHJcbmV4cG9ydCBjb25zdCBWX0xFRlQgPSAtMSAqIFZJUlRVQUxfV0lEVEggLyAyLjA7XHJcbmV4cG9ydCBjb25zdCBWX0JPVFRPTSA9IC0xICogVklSVFVBTF9IRUlHSFQgLyAyLjA7XHJcblxyXG5leHBvcnQgY29uc3QgQ0hBUl9TSVpFID0gODtcclxuZXhwb3J0IGNvbnN0IFRFWFRfV0lEVEggPSBWSVJUVUFMX1dJRFRIIC8gQ0hBUl9TSVpFO1xyXG5leHBvcnQgY29uc3QgVEVYVF9IRUlHSFQgPSBWSVJUVUFMX0hFSUdIVCAvIENIQVJfU0laRTtcclxuZXhwb3J0IGNvbnN0IFBJWEVMX1NJWkUgPSAxO1xyXG5leHBvcnQgY29uc3QgQUNUVUFMX0NIQVJfU0laRSA9IENIQVJfU0laRSAqIFBJWEVMX1NJWkU7XHJcbmV4cG9ydCBjb25zdCBTUFJJVEVfU0laRV9YID0gMTYuMDtcclxuZXhwb3J0IGNvbnN0IFNQUklURV9TSVpFX1kgPSAxNi4wO1xyXG5leHBvcnQgdmFyIENIRUNLX0NPTExJU0lPTiA9IHRydWU7XHJcbmV4cG9ydCB2YXIgREVCVUcgPSBmYWxzZTtcclxuZXhwb3J0IHZhciB0ZXh0dXJlRmlsZXMgPSB7fTtcclxuZXhwb3J0IHZhciBzdGFnZTtcclxuZXhwb3J0IHZhciB0YXNrcztcclxuZXhwb3J0IHZhciBnYW1lVGltZXI7XHJcbmV4cG9ydCB2YXIgYm9tYnM7XHJcbmV4cG9ydCB2YXIgYWRkU2NvcmU7XHJcbmV4cG9ydCB2YXIgbXlzaGlwXztcclxuZXhwb3J0IGNvbnN0IHRleHR1cmVSb290ID0gJy4vcmVzLyc7XHJcbmV4cG9ydCB2YXIgcGF1c2UgPSBmYWxzZTtcclxuZXhwb3J0IHZhciBnYW1lO1xyXG5cclxuXHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgKiBhcyBnIGZyb20gJy4vZ2xvYmFsJztcclxuXHJcbi8vLyDjg4bjgq/jgrnjg4Hjg6Pjg7zjgajjgZfjgaZjYW52YXPjgpLkvb/jgYbloLTlkIjjga7jg5jjg6vjg5Hjg7xcclxuZXhwb3J0IGZ1bmN0aW9uIENhbnZhc1RleHR1cmUod2lkdGgsIGhlaWdodCkge1xyXG4gIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgdGhpcy5jYW52YXMud2lkdGggPSB3aWR0aCB8fCBnLlZJUlRVQUxfV0lEVEg7XHJcbiAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gaGVpZ2h0IHx8IGcuVklSVFVBTF9IRUlHSFQ7XHJcbiAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gIHRoaXMudGV4dHVyZSA9IG5ldyBUSFJFRS5UZXh0dXJlKHRoaXMuY2FudmFzKTtcclxuICB0aGlzLnRleHR1cmUubWFnRmlsdGVyID0gVEhSRUUuTmVhcmVzdEZpbHRlcjtcclxuICB0aGlzLnRleHR1cmUubWluRmlsdGVyID0gVEhSRUUuTGluZWFyTWlwTWFwTGluZWFyRmlsdGVyO1xyXG4gIHRoaXMubWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBtYXA6IHRoaXMudGV4dHVyZSwgdHJhbnNwYXJlbnQ6IHRydWUgfSk7XHJcbiAgdGhpcy5nZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG4gIHRoaXMubWVzaCA9IG5ldyBUSFJFRS5NZXNoKHRoaXMuZ2VvbWV0cnksIHRoaXMubWF0ZXJpYWwpO1xyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi56ID0gMC4wMDE7XHJcbiAgLy8g44K544Og44O844K444Oz44Kw44KS5YiH44KLXHJcbiAgdGhpcy5jdHgubXNJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICB0aGlzLmN0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICAvL3RoaXMuY3R4LndlYmtpdEltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIHRoaXMuY3R4Lm1vekltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG59XHJcblxyXG4vLy8g44OX44Ot44Kw44Os44K544OQ44O86KGo56S644Kv44Op44K5XHJcbmV4cG9ydCBmdW5jdGlvbiBQcm9ncmVzcygpIHtcclxuICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpOztcclxuICB2YXIgd2lkdGggPSAxO1xyXG4gIHdoaWxlICh3aWR0aCA8PSBnLlZJUlRVQUxfV0lEVEgpe1xyXG4gICAgd2lkdGggKj0gMjtcclxuICB9XHJcbiAgdmFyIGhlaWdodCA9IDE7XHJcbiAgd2hpbGUgKGhlaWdodCA8PSBnLlZJUlRVQUxfSEVJR0hUKXtcclxuICAgIGhlaWdodCAqPSAyO1xyXG4gIH1cclxuICB0aGlzLmNhbnZhcy53aWR0aCA9IHdpZHRoO1xyXG4gIHRoaXMuY2FudmFzLmhlaWdodCA9IGhlaWdodDtcclxuICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgdGhpcy50ZXh0dXJlID0gbmV3IFRIUkVFLlRleHR1cmUodGhpcy5jYW52YXMpO1xyXG4gIHRoaXMudGV4dHVyZS5tYWdGaWx0ZXIgPSBUSFJFRS5OZWFyZXN0RmlsdGVyO1xyXG4gIHRoaXMudGV4dHVyZS5taW5GaWx0ZXIgPSBUSFJFRS5MaW5lYXJNaXBNYXBMaW5lYXJGaWx0ZXI7XHJcbiAgLy8g44K544Og44O844K444Oz44Kw44KS5YiH44KLXHJcbiAgdGhpcy5jdHgubXNJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICB0aGlzLmN0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICAvL3RoaXMuY3R4LndlYmtpdEltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIHRoaXMuY3R4Lm1vekltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG5cclxuICB0aGlzLm1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgbWFwOiB0aGlzLnRleHR1cmUsIHRyYW5zcGFyZW50OiB0cnVlIH0pO1xyXG4gIHRoaXMuZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSh0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuICB0aGlzLm1lc2ggPSBuZXcgVEhSRUUuTWVzaCh0aGlzLmdlb21ldHJ5LCB0aGlzLm1hdGVyaWFsKTtcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueCA9ICh3aWR0aCAtIGcuVklSVFVBTF9XSURUSCkgLyAyO1xyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi55ID0gIC0gKGhlaWdodCAtIGcuVklSVFVBTF9IRUlHSFQpIC8gMjtcclxuXHJcbiAgLy90aGlzLnRleHR1cmUucHJlbXVsdGlwbHlBbHBoYSA9IHRydWU7XHJcbn1cclxuXHJcbi8vLyDjg5fjg63jgrDjg6zjgrnjg5Djg7zjgpLooajnpLrjgZnjgovjgIJcclxuUHJvZ3Jlc3MucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIChtZXNzYWdlLCBwZXJjZW50KSB7XHJcbiAgdmFyIGN0eCA9IHRoaXMuY3R4O1xyXG4gIHZhciB3aWR0aCA9IHRoaXMuY2FudmFzLndpZHRoLCBoZWlnaHQgPSB0aGlzLmNhbnZhcy5oZWlnaHQ7XHJcbiAgLy8gICAgICBjdHguZmlsbFN0eWxlID0gJ3JnYmEoMCwwLDAsMCknO1xyXG4gIGN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcbiAgdmFyIHRleHRXaWR0aCA9IGN0eC5tZWFzdXJlVGV4dChtZXNzYWdlKS53aWR0aDtcclxuICBjdHguc3Ryb2tlU3R5bGUgPSBjdHguZmlsbFN0eWxlID0gJ3JnYmEoMjU1LDI1NSwyNTUsMS4wKSc7XHJcblxyXG4gIGN0eC5maWxsVGV4dChtZXNzYWdlLCAod2lkdGggLSB0ZXh0V2lkdGgpIC8gMiwgMTAwKTtcclxuICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgY3R4LnJlY3QoMjAsIDc1LCB3aWR0aCAtIDIwICogMiwgMTApO1xyXG4gIGN0eC5zdHJva2UoKTtcclxuICBjdHguZmlsbFJlY3QoMjAsIDc1LCAod2lkdGggLSAyMCAqIDIpICogcGVyY2VudCAvIDEwMCwgMTApO1xyXG4gIHRoaXMudGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbn1cclxuXHJcbi8vLyBpbWfjgYvjgonjgrjjgqrjg6Hjg4jjg6rjgpLkvZzmiJDjgZnjgotcclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUdlb21ldHJ5RnJvbUltYWdlKGltYWdlKSB7XHJcbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gIHZhciB3ID0gdGV4dHVyZUZpbGVzLmF1dGhvci50ZXh0dXJlLmltYWdlLndpZHRoO1xyXG4gIHZhciBoID0gdGV4dHVyZUZpbGVzLmF1dGhvci50ZXh0dXJlLmltYWdlLmhlaWdodDtcclxuICBjYW52YXMud2lkdGggPSB3O1xyXG4gIGNhbnZhcy5oZWlnaHQgPSBoO1xyXG4gIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICBjdHguZHJhd0ltYWdlKGltYWdlLCAwLCAwKTtcclxuICB2YXIgZGF0YSA9IGN0eC5nZXRJbWFnZURhdGEoMCwgMCwgdywgaCk7XHJcbiAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkdlb21ldHJ5KCk7XHJcbiAge1xyXG4gICAgdmFyIGkgPSAwO1xyXG5cclxuICAgIGZvciAodmFyIHkgPSAwOyB5IDwgaDsgKyt5KSB7XHJcbiAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgdzsgKyt4KSB7XHJcbiAgICAgICAgdmFyIGNvbG9yID0gbmV3IFRIUkVFLkNvbG9yKCk7XHJcblxyXG4gICAgICAgIHZhciByID0gZGF0YS5kYXRhW2krK107XHJcbiAgICAgICAgdmFyIGcgPSBkYXRhLmRhdGFbaSsrXTtcclxuICAgICAgICB2YXIgYiA9IGRhdGEuZGF0YVtpKytdO1xyXG4gICAgICAgIHZhciBhID0gZGF0YS5kYXRhW2krK107XHJcbiAgICAgICAgaWYgKGEgIT0gMCkge1xyXG4gICAgICAgICAgY29sb3Iuc2V0UkdCKHIgLyAyNTUuMCwgZyAvIDI1NS4wLCBiIC8gMjU1LjApO1xyXG4gICAgICAgICAgdmFyIHZlcnQgPSBuZXcgVEhSRUUuVmVjdG9yMygoKHggLSB3IC8gMi4wKSkgKiAyLjAsICgoeSAtIGggLyAyKSkgKiAtMi4wLCAwLjApO1xyXG4gICAgICAgICAgZ2VvbWV0cnkudmVydGljZXMucHVzaCh2ZXJ0KTtcclxuICAgICAgICAgIGdlb21ldHJ5LmNvbG9ycy5wdXNoKGNvbG9yKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTcHJpdGVHZW9tZXRyeShzaXplKVxyXG57XHJcbiAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkdlb21ldHJ5KCk7XHJcbiAgdmFyIHNpemVIYWxmID0gc2l6ZSAvIDI7XHJcbiAgLy8gZ2VvbWV0cnkuXHJcbiAgZ2VvbWV0cnkudmVydGljZXMucHVzaChuZXcgVEhSRUUuVmVjdG9yMygtc2l6ZUhhbGYsIHNpemVIYWxmLCAwKSk7XHJcbiAgZ2VvbWV0cnkudmVydGljZXMucHVzaChuZXcgVEhSRUUuVmVjdG9yMyhzaXplSGFsZiwgc2l6ZUhhbGYsIDApKTtcclxuICBnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKG5ldyBUSFJFRS5WZWN0b3IzKHNpemVIYWxmLCAtc2l6ZUhhbGYsIDApKTtcclxuICBnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKG5ldyBUSFJFRS5WZWN0b3IzKC1zaXplSGFsZiwgLXNpemVIYWxmLCAwKSk7XHJcbiAgZ2VvbWV0cnkuZmFjZXMucHVzaChuZXcgVEhSRUUuRmFjZTMoMCwgMiwgMSkpO1xyXG4gIGdlb21ldHJ5LmZhY2VzLnB1c2gobmV3IFRIUkVFLkZhY2UzKDAsIDMsIDIpKTtcclxuICByZXR1cm4gZ2VvbWV0cnk7XHJcbn1cclxuXHJcbi8vLyDjg4bjgq/jgrnjg4Hjg6Pjg7zkuIrjga7mjIflrprjgrnjg5fjg6njgqTjg4jjga5VVuW6p+aomeOCkuaxguOCgeOCi1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3ByaXRlVVYoZ2VvbWV0cnksIHRleHR1cmUsIGNlbGxXaWR0aCwgY2VsbEhlaWdodCwgY2VsbE5vKVxyXG57XHJcbiAgdmFyIHdpZHRoID0gdGV4dHVyZS5pbWFnZS53aWR0aDtcclxuICB2YXIgaGVpZ2h0ID0gdGV4dHVyZS5pbWFnZS5oZWlnaHQ7XHJcblxyXG4gIHZhciB1Q2VsbENvdW50ID0gKHdpZHRoIC8gY2VsbFdpZHRoKSB8IDA7XHJcbiAgdmFyIHZDZWxsQ291bnQgPSAoaGVpZ2h0IC8gY2VsbEhlaWdodCkgfCAwO1xyXG4gIHZhciB2UG9zID0gdkNlbGxDb3VudCAtICgoY2VsbE5vIC8gdUNlbGxDb3VudCkgfCAwKTtcclxuICB2YXIgdVBvcyA9IGNlbGxObyAlIHVDZWxsQ291bnQ7XHJcbiAgdmFyIHVVbml0ID0gY2VsbFdpZHRoIC8gd2lkdGg7IFxyXG4gIHZhciB2VW5pdCA9IGNlbGxIZWlnaHQgLyBoZWlnaHQ7XHJcblxyXG4gIGdlb21ldHJ5LmZhY2VWZXJ0ZXhVdnNbMF0ucHVzaChbXHJcbiAgICBuZXcgVEhSRUUuVmVjdG9yMigodVBvcykgKiBjZWxsV2lkdGggLyB3aWR0aCwgKHZQb3MpICogY2VsbEhlaWdodCAvIGhlaWdodCksXHJcbiAgICBuZXcgVEhSRUUuVmVjdG9yMigodVBvcyArIDEpICogY2VsbFdpZHRoIC8gd2lkdGgsICh2UG9zIC0gMSkgKiBjZWxsSGVpZ2h0IC8gaGVpZ2h0KSxcclxuICAgIG5ldyBUSFJFRS5WZWN0b3IyKCh1UG9zICsgMSkgKiBjZWxsV2lkdGggLyB3aWR0aCwgKHZQb3MpICogY2VsbEhlaWdodCAvIGhlaWdodClcclxuICBdKTtcclxuICBnZW9tZXRyeS5mYWNlVmVydGV4VXZzWzBdLnB1c2goW1xyXG4gICAgbmV3IFRIUkVFLlZlY3RvcjIoKHVQb3MpICogY2VsbFdpZHRoIC8gd2lkdGgsICh2UG9zKSAqIGNlbGxIZWlnaHQgLyBoZWlnaHQpLFxyXG4gICAgbmV3IFRIUkVFLlZlY3RvcjIoKHVQb3MpICogY2VsbFdpZHRoIC8gd2lkdGgsICh2UG9zIC0gMSkgKiBjZWxsSGVpZ2h0IC8gaGVpZ2h0KSxcclxuICAgIG5ldyBUSFJFRS5WZWN0b3IyKCh1UG9zICsgMSkgKiBjZWxsV2lkdGggLyB3aWR0aCwgKHZQb3MgLSAxKSAqIGNlbGxIZWlnaHQgLyBoZWlnaHQpXHJcbiAgXSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVTcHJpdGVVVihnZW9tZXRyeSwgdGV4dHVyZSwgY2VsbFdpZHRoLCBjZWxsSGVpZ2h0LCBjZWxsTm8pXHJcbntcclxuICB2YXIgd2lkdGggPSB0ZXh0dXJlLmltYWdlLndpZHRoO1xyXG4gIHZhciBoZWlnaHQgPSB0ZXh0dXJlLmltYWdlLmhlaWdodDtcclxuXHJcbiAgdmFyIHVDZWxsQ291bnQgPSAod2lkdGggLyBjZWxsV2lkdGgpIHwgMDtcclxuICB2YXIgdkNlbGxDb3VudCA9IChoZWlnaHQgLyBjZWxsSGVpZ2h0KSB8IDA7XHJcbiAgdmFyIHZQb3MgPSB2Q2VsbENvdW50IC0gKChjZWxsTm8gLyB1Q2VsbENvdW50KSB8IDApO1xyXG4gIHZhciB1UG9zID0gY2VsbE5vICUgdUNlbGxDb3VudDtcclxuICB2YXIgdVVuaXQgPSBjZWxsV2lkdGggLyB3aWR0aDtcclxuICB2YXIgdlVuaXQgPSBjZWxsSGVpZ2h0IC8gaGVpZ2h0O1xyXG4gIHZhciB1dnMgPSBnZW9tZXRyeS5mYWNlVmVydGV4VXZzWzBdWzBdO1xyXG5cclxuICB1dnNbMF0ueCA9ICh1UG9zKSAqIHVVbml0O1xyXG4gIHV2c1swXS55ID0gKHZQb3MpICogdlVuaXQ7XHJcbiAgdXZzWzFdLnggPSAodVBvcyArIDEpICogdVVuaXQ7XHJcbiAgdXZzWzFdLnkgPSAodlBvcyAtIDEpICogdlVuaXQ7XHJcbiAgdXZzWzJdLnggPSAodVBvcyArIDEpICogdVVuaXQ7XHJcbiAgdXZzWzJdLnkgPSAodlBvcykgKiB2VW5pdDtcclxuXHJcbiAgdXZzID0gZ2VvbWV0cnkuZmFjZVZlcnRleFV2c1swXVsxXTtcclxuXHJcbiAgdXZzWzBdLnggPSAodVBvcykgKiB1VW5pdDtcclxuICB1dnNbMF0ueSA9ICh2UG9zKSAqIHZVbml0O1xyXG4gIHV2c1sxXS54ID0gKHVQb3MpICogdVVuaXQ7XHJcbiAgdXZzWzFdLnkgPSAodlBvcyAtIDEpICogdlVuaXQ7XHJcbiAgdXZzWzJdLnggPSAodVBvcyArIDEpICogdVVuaXQ7XHJcbiAgdXZzWzJdLnkgPSAodlBvcyAtIDEpICogdlVuaXQ7XHJcblxyXG4gXHJcbiAgZ2VvbWV0cnkudXZzTmVlZFVwZGF0ZSA9IHRydWU7XHJcblxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3ByaXRlTWF0ZXJpYWwodGV4dHVyZSlcclxue1xyXG4gIC8vIOODoeODg+OCt+ODpeOBruS9nOaIkOODu+ihqOekuiAvLy9cclxuICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBtYXA6IHRleHR1cmUgLyosZGVwdGhUZXN0OnRydWUqLywgdHJhbnNwYXJlbnQ6IHRydWUgfSk7XHJcbiAgbWF0ZXJpYWwuc2hhZGluZyA9IFRIUkVFLkZsYXRTaGFkaW5nO1xyXG4gIG1hdGVyaWFsLnNpZGUgPSBUSFJFRS5Gcm9udFNpZGU7XHJcbiAgbWF0ZXJpYWwuYWxwaGFUZXN0ID0gMC41O1xyXG4gIG1hdGVyaWFsLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuLy8gIG1hdGVyaWFsLlxyXG4gIHJldHVybiBtYXRlcmlhbDtcclxufVxyXG5cclxuXHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgKiBhcyBzZmcgZnJvbSAnLi9nbG9iYWwnOyBcclxuXHJcbi8vIOOCreODvOWFpeWKm1xyXG5leHBvcnQgY2xhc3MgQmFzaWNJbnB1dHtcclxuY29uc3RydWN0b3IgKCkge1xyXG4gIHRoaXMua2V5Q2hlY2sgPSB7IHVwOiBmYWxzZSwgZG93bjogZmFsc2UsIGxlZnQ6IGZhbHNlLCByaWdodDogZmFsc2UsIHo6IGZhbHNlICx4OmZhbHNlfTtcclxuICB0aGlzLmtleUJ1ZmZlciA9IFtdO1xyXG4gIHRoaXMua2V5dXBfID0gbnVsbDtcclxuICB0aGlzLmtleWRvd25fID0gbnVsbDtcclxuICAvL3RoaXMuZ2FtZXBhZENoZWNrID0geyB1cDogZmFsc2UsIGRvd246IGZhbHNlLCBsZWZ0OiBmYWxzZSwgcmlnaHQ6IGZhbHNlLCB6OiBmYWxzZSAseDpmYWxzZX07XHJcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2dhbWVwYWRjb25uZWN0ZWQnLChlKT0+e1xyXG4gICAgdGhpcy5nYW1lcGFkID0gZS5nYW1lcGFkO1xyXG4gIH0pO1xyXG4gXHJcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2dhbWVwYWRkaXNjb25uZWN0ZWQnLChlKT0+e1xyXG4gICAgZGVsZXRlIHRoaXMuZ2FtZXBhZDtcclxuICB9KTsgXHJcbiBcclxuIGlmKHdpbmRvdy5uYXZpZ2F0b3IuZ2V0R2FtZXBhZHMpe1xyXG4gICB0aGlzLmdhbWVwYWQgPSB3aW5kb3cubmF2aWdhdG9yLmdldEdhbWVwYWRzKClbMF07XHJcbiB9IFxyXG59XHJcblxyXG4gIGNsZWFyKClcclxuICB7XHJcbiAgICBmb3IodmFyIGQgaW4gdGhpcy5rZXlDaGVjayl7XHJcbiAgICAgIHRoaXMua2V5Q2hlY2tbZF0gPSBmYWxzZTtcclxuICAgIH1cclxuICAgIHRoaXMua2V5QnVmZmVyLmxlbmd0aCA9IDA7XHJcbiAgfVxyXG4gIFxyXG4gIGtleWRvd24oZSkge1xyXG4gICAgdmFyIGUgPSBkMy5ldmVudDtcclxuICAgIHZhciBrZXlCdWZmZXIgPSB0aGlzLmtleUJ1ZmZlcjtcclxuICAgIHZhciBrZXlDaGVjayA9IHRoaXMua2V5Q2hlY2s7XHJcbiAgICB2YXIgaGFuZGxlID0gdHJ1ZTtcclxuICAgICBcclxuICAgIGlmIChrZXlCdWZmZXIubGVuZ3RoID4gMTYpIHtcclxuICAgICAga2V5QnVmZmVyLnNoaWZ0KCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGlmIChlLmtleUNvZGUgPT0gODAgLyogUCAqLykge1xyXG4gICAgICBpZiAoIXNmZy5wYXVzZSkge1xyXG4gICAgICAgIHNmZy5nYW1lLnBhdXNlKCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc2ZnLmdhbWUucmVzdW1lKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgICAgICAgIFxyXG4gICAga2V5QnVmZmVyLnB1c2goZS5rZXlDb2RlKTtcclxuICAgIHN3aXRjaCAoZS5rZXlDb2RlKSB7XHJcbiAgICAgIGNhc2UgNzQ6XHJcbiAgICAgIGNhc2UgMzc6XHJcbiAgICAgIGNhc2UgMTAwOlxyXG4gICAgICAgIGtleUNoZWNrLmxlZnQgPSB0cnVlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgNzM6XHJcbiAgICAgIGNhc2UgMzg6XHJcbiAgICAgIGNhc2UgMTA0OlxyXG4gICAgICAgIGtleUNoZWNrLnVwID0gdHJ1ZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDc2OlxyXG4gICAgICBjYXNlIDM5OlxyXG4gICAgICBjYXNlIDEwMjpcclxuICAgICAgICBrZXlDaGVjay5yaWdodCA9IHRydWU7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA3NTpcclxuICAgICAgY2FzZSA0MDpcclxuICAgICAgY2FzZSA5ODpcclxuICAgICAgICBrZXlDaGVjay5kb3duID0gdHJ1ZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDkwOlxyXG4gICAgICAgIGtleUNoZWNrLnogPSB0cnVlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgODg6XHJcbiAgICAgICAga2V5Q2hlY2sueCA9IHRydWU7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIGlmIChoYW5kbGUpIHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICBlLnJldHVyblZhbHVlID0gZmFsc2U7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAga2V5dXAoKSB7XHJcbiAgICB2YXIgZSA9IGQzLmV2ZW50O1xyXG4gICAgdmFyIGtleUJ1ZmZlciA9IHRoaXMua2V5QnVmZmVyO1xyXG4gICAgdmFyIGtleUNoZWNrID0gdGhpcy5rZXlDaGVjaztcclxuICAgIHZhciBoYW5kbGUgPSBmYWxzZTtcclxuICAgIHN3aXRjaCAoZS5rZXlDb2RlKSB7XHJcbiAgICAgIGNhc2UgNzQ6XHJcbiAgICAgIGNhc2UgMzc6XHJcbiAgICAgIGNhc2UgMTAwOlxyXG4gICAgICAgIGtleUNoZWNrLmxlZnQgPSBmYWxzZTtcclxuICAgICAgICBoYW5kbGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDczOlxyXG4gICAgICBjYXNlIDM4OlxyXG4gICAgICBjYXNlIDEwNDpcclxuICAgICAgICBrZXlDaGVjay51cCA9IGZhbHNlO1xyXG4gICAgICAgIGhhbmRsZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgNzY6XHJcbiAgICAgIGNhc2UgMzk6XHJcbiAgICAgIGNhc2UgMTAyOlxyXG4gICAgICAgIGtleUNoZWNrLnJpZ2h0ID0gZmFsc2U7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA3NTpcclxuICAgICAgY2FzZSA0MDpcclxuICAgICAgY2FzZSA5ODpcclxuICAgICAgICBrZXlDaGVjay5kb3duID0gZmFsc2U7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA5MDpcclxuICAgICAgICBrZXlDaGVjay56ID0gZmFsc2U7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSA4ODpcclxuICAgICAgICBrZXlDaGVjay54ID0gZmFsc2U7XHJcbiAgICAgICAgaGFuZGxlID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIGlmIChoYW5kbGUpIHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICBlLnJldHVyblZhbHVlID0gZmFsc2U7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcbiAgLy/jgqTjg5njg7Pjg4jjgavjg5DjgqTjg7Pjg4njgZnjgotcclxuICBiaW5kKClcclxuICB7XHJcbiAgICBkMy5zZWxlY3QoJ2JvZHknKS5vbigna2V5ZG93bi5iYXNpY0lucHV0Jyx0aGlzLmtleWRvd24uYmluZCh0aGlzKSk7XHJcbiAgICBkMy5zZWxlY3QoJ2JvZHknKS5vbigna2V5dXAuYmFzaWNJbnB1dCcsdGhpcy5rZXl1cC5iaW5kKHRoaXMpKTtcclxuICB9XHJcbiAgLy8g44Ki44Oz44OQ44Kk44Oz44OJ44GZ44KLXHJcbiAgdW5iaW5kKClcclxuICB7XHJcbiAgICBkMy5zZWxlY3QoJ2JvZHknKS5vbigna2V5ZG93bi5iYXNpY0lucHV0JyxudWxsKTtcclxuICAgIGQzLnNlbGVjdCgnYm9keScpLm9uKCdrZXl1cC5iYXNpY0lucHV0JyxudWxsKTtcclxuICB9XHJcbiAgXHJcbiAgZ2V0IHVwKCkge1xyXG4gICAgcmV0dXJuIHRoaXMua2V5Q2hlY2sudXAgfHwgKHRoaXMuZ2FtZXBhZCAmJiAodGhpcy5nYW1lcGFkLmJ1dHRvbnNbMTJdLnByZXNzZWQgfHwgdGhpcy5nYW1lcGFkLmF4ZXNbMV0gPCAtMC4xKSk7XHJcbiAgfVxyXG5cclxuICBnZXQgZG93bigpIHtcclxuICAgIHJldHVybiB0aGlzLmtleUNoZWNrLmRvd24gfHwgKHRoaXMuZ2FtZXBhZCAmJiAodGhpcy5nYW1lcGFkLmJ1dHRvbnNbMTNdLnByZXNzZWQgfHwgdGhpcy5nYW1lcGFkLmF4ZXNbMV0gPiAwLjEpKTtcclxuICB9XHJcblxyXG4gIGdldCBsZWZ0KCkge1xyXG4gICAgcmV0dXJuIHRoaXMua2V5Q2hlY2subGVmdCB8fCAodGhpcy5nYW1lcGFkICYmICh0aGlzLmdhbWVwYWQuYnV0dG9uc1sxNF0ucHJlc3NlZCB8fCB0aGlzLmdhbWVwYWQuYXhlc1swXSA8IC0wLjEpKTtcclxuICB9XHJcblxyXG4gIGdldCByaWdodCgpIHtcclxuICAgIHJldHVybiB0aGlzLmtleUNoZWNrLnJpZ2h0IHx8ICh0aGlzLmdhbWVwYWQgJiYgKHRoaXMuZ2FtZXBhZC5idXR0b25zWzE1XS5wcmVzc2VkIHx8IHRoaXMuZ2FtZXBhZC5heGVzWzBdID4gMC4xKSk7XHJcbiAgfVxyXG4gIFxyXG4gIGdldCB6KCkge1xyXG4gICAgIGxldCByZXQgPSB0aGlzLmtleUNoZWNrLnogXHJcbiAgICB8fCAoKCghdGhpcy56QnV0dG9uIHx8ICh0aGlzLnpCdXR0b24gJiYgIXRoaXMuekJ1dHRvbikgKSAmJiB0aGlzLmdhbWVwYWQgJiYgdGhpcy5nYW1lcGFkLmJ1dHRvbnNbMF0ucHJlc3NlZCkpIDtcclxuICAgIHRoaXMuekJ1dHRvbiA9IHRoaXMuZ2FtZXBhZCAmJiB0aGlzLmdhbWVwYWQuYnV0dG9uc1swXS5wcmVzc2VkO1xyXG4gICAgcmV0dXJuIHJldDtcclxuICB9XHJcbiAgXHJcbiAgZ2V0IHN0YXJ0KCkge1xyXG4gICAgbGV0IHJldCA9ICgoIXRoaXMuc3RhcnRCdXR0b25fIHx8ICh0aGlzLnN0YXJ0QnV0dG9uXyAmJiAhdGhpcy5zdGFydEJ1dHRvbl8pICkgJiYgdGhpcy5nYW1lcGFkICYmIHRoaXMuZ2FtZXBhZC5idXR0b25zWzldLnByZXNzZWQpIDtcclxuICAgIHRoaXMuc3RhcnRCdXR0b25fID0gdGhpcy5nYW1lcGFkICYmIHRoaXMuZ2FtZXBhZC5idXR0b25zWzldLnByZXNzZWQ7XHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH1cclxuICBcclxuICBnZXQgYUJ1dHRvbigpe1xyXG4gICAgIGxldCByZXQgPSAoKCghdGhpcy5hQnV0dG9uXyB8fCAodGhpcy5hQnV0dG9uXyAmJiAhdGhpcy5hQnV0dG9uXykgKSAmJiB0aGlzLmdhbWVwYWQgJiYgdGhpcy5nYW1lcGFkLmJ1dHRvbnNbMF0ucHJlc3NlZCkpIDtcclxuICAgIHRoaXMuYUJ1dHRvbl8gPSB0aGlzLmdhbWVwYWQgJiYgdGhpcy5nYW1lcGFkLmJ1dHRvbnNbMF0ucHJlc3NlZDtcclxuICAgIHJldHVybiByZXQ7XHJcbiAgfVxyXG4gIFxyXG4gICp1cGRhdGUodGFza0luZGV4KVxyXG4gIHtcclxuICAgIHdoaWxlKHRhc2tJbmRleCA+PSAwKXtcclxuICAgICAgaWYod2luZG93Lm5hdmlnYXRvci5nZXRHYW1lcGFkcyl7XHJcbiAgICAgICAgdGhpcy5nYW1lcGFkID0gd2luZG93Lm5hdmlnYXRvci5nZXRHYW1lcGFkcygpWzBdO1xyXG4gICAgICB9IFxyXG4gICAgICB0YXNrSW5kZXggPSB5aWVsZDsgICAgIFxyXG4gICAgfVxyXG4gIH1cclxufSIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuaW1wb3J0ICogYXMgc2ZnIGZyb20gJy4vZ2xvYmFsJztcclxuaW1wb3J0ICogYXMgZ2FtZW9iaiBmcm9tICcuL2dhbWVvYmonO1xyXG5pbXBvcnQgKiBhcyBncmFwaGljcyBmcm9tICcuL2dyYXBoaWNzJztcclxuXHJcbnZhciBteUJ1bGxldHMgPSBbXTtcclxuXHJcbi8vLyDoh6rmqZ/lvL4gXHJcbmV4cG9ydCBjbGFzcyBNeUJ1bGxldCBleHRlbmRzIGdhbWVvYmouR2FtZU9iaiB7XHJcbiAgY29uc3RydWN0b3Ioc2NlbmUsc2UpIHtcclxuICBzdXBlcigwLCAwLCAwKTtcclxuXHJcbiAgdGhpcy5jb2xsaXNpb25BcmVhLndpZHRoID0gNDtcclxuICB0aGlzLmNvbGxpc2lvbkFyZWEuaGVpZ2h0ID0gNjtcclxuICB0aGlzLnNwZWVkID0gODtcclxuICB0aGlzLnBvd2VyID0gMTtcclxuXHJcbiAgdGhpcy50ZXh0dXJlV2lkdGggPSBzZmcudGV4dHVyZUZpbGVzLm15c2hpcC5pbWFnZS53aWR0aDtcclxuICB0aGlzLnRleHR1cmVIZWlnaHQgPSBzZmcudGV4dHVyZUZpbGVzLm15c2hpcC5pbWFnZS5oZWlnaHQ7XHJcblxyXG4gIC8vIOODoeODg+OCt+ODpeOBruS9nOaIkOODu+ihqOekuiAvLy9cclxuXHJcbiAgdmFyIG1hdGVyaWFsID0gZ3JhcGhpY3MuY3JlYXRlU3ByaXRlTWF0ZXJpYWwoc2ZnLnRleHR1cmVGaWxlcy5teXNoaXApO1xyXG4gIHZhciBnZW9tZXRyeSA9IGdyYXBoaWNzLmNyZWF0ZVNwcml0ZUdlb21ldHJ5KDE2KTtcclxuICBncmFwaGljcy5jcmVhdGVTcHJpdGVVVihnZW9tZXRyeSwgc2ZnLnRleHR1cmVGaWxlcy5teXNoaXAsIDE2LCAxNiwgMSk7XHJcbiAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuXHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnggPSB0aGlzLnhfO1xyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi55ID0gdGhpcy55XztcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueiA9IHRoaXMuel87XHJcbiAgdGhpcy5zZSA9IHNlO1xyXG4gIC8vc2UoMCk7XHJcbiAgLy9zZXF1ZW5jZXIucGxheVRyYWNrcyhzb3VuZEVmZmVjdHMuc291bmRFZmZlY3RzWzBdKTtcclxuICBzY2VuZS5hZGQodGhpcy5tZXNoKTtcclxuICB0aGlzLm1lc2gudmlzaWJsZSA9IHRoaXMuZW5hYmxlXyA9IGZhbHNlO1xyXG4gIC8vICBzZmcudGFza3MucHVzaFRhc2soZnVuY3Rpb24gKHRhc2tJbmRleCkgeyBzZWxmLm1vdmUodGFza0luZGV4KTsgfSk7XHJcbiB9XHJcblxyXG4gIGdldCB4KCkgeyByZXR1cm4gdGhpcy54XzsgfVxyXG4gIHNldCB4KHYpIHsgdGhpcy54XyA9IHRoaXMubWVzaC5wb3NpdGlvbi54ID0gdjsgfVxyXG4gIGdldCB5KCkgeyByZXR1cm4gdGhpcy55XzsgfVxyXG4gIHNldCB5KHYpIHsgdGhpcy55XyA9IHRoaXMubWVzaC5wb3NpdGlvbi55ID0gdjsgfVxyXG4gIGdldCB6KCkgeyByZXR1cm4gdGhpcy56XzsgfVxyXG4gIHNldCB6KHYpIHsgdGhpcy56XyA9IHRoaXMubWVzaC5wb3NpdGlvbi56ID0gdjsgfVxyXG4gICptb3ZlKHRhc2tJbmRleCkge1xyXG4gICAgXHJcbiAgICB3aGlsZSAodGFza0luZGV4ID49IDAgXHJcbiAgICAgICYmIHRoaXMuZW5hYmxlX1xyXG4gICAgICAmJiB0aGlzLnkgPD0gKHNmZy5WX1RPUCArIDE2KSBcclxuICAgICAgJiYgdGhpcy55ID49IChzZmcuVl9CT1RUT00gLSAxNikgXHJcbiAgICAgICYmIHRoaXMueCA8PSAoc2ZnLlZfUklHSFQgKyAxNikgXHJcbiAgICAgICYmIHRoaXMueCA+PSAoc2ZnLlZfTEVGVCAtIDE2KSlcclxuICAgIHtcclxuICAgICAgXHJcbiAgICAgIHRoaXMueSArPSB0aGlzLmR5O1xyXG4gICAgICB0aGlzLnggKz0gdGhpcy5keDtcclxuICAgICAgXHJcbiAgICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gICAgfVxyXG5cclxuICAgIHRhc2tJbmRleCA9IHlpZWxkO1xyXG4gICAgc2ZnLnRhc2tzLnJlbW92ZVRhc2sodGFza0luZGV4KTtcclxuICAgIHRoaXMuZW5hYmxlXyA9IHRoaXMubWVzaC52aXNpYmxlID0gZmFsc2U7XHJcbn1cclxuXHJcbiAgc3RhcnQoeCwgeSwgeiwgYWltUmFkaWFuLHBvd2VyKSB7XHJcbiAgICBpZiAodGhpcy5lbmFibGVfKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHRoaXMueCA9IHg7XHJcbiAgICB0aGlzLnkgPSB5O1xyXG4gICAgdGhpcy56ID0geiAtIDAuMTtcclxuICAgIHRoaXMucG93ZXIgPSBwb3dlciB8IDE7XHJcbiAgICB0aGlzLmR4ID0gTWF0aC5jb3MoYWltUmFkaWFuKSAqIHRoaXMuc3BlZWQ7XHJcbiAgICB0aGlzLmR5ID0gTWF0aC5zaW4oYWltUmFkaWFuKSAqIHRoaXMuc3BlZWQ7XHJcbiAgICB0aGlzLmVuYWJsZV8gPSB0aGlzLm1lc2gudmlzaWJsZSA9IHRydWU7XHJcbiAgICB0aGlzLnNlKDApO1xyXG4gICAgLy9zZXF1ZW5jZXIucGxheVRyYWNrcyhzb3VuZEVmZmVjdHMuc291bmRFZmZlY3RzWzBdKTtcclxuICAgIHRoaXMudGFzayA9IHNmZy50YXNrcy5wdXNoVGFzayh0aGlzLm1vdmUuYmluZCh0aGlzKSk7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbn1cclxuXHJcbi8vLyDoh6rmqZ/jgqrjg5bjgrjjgqfjgq/jg4hcclxuZXhwb3J0IGNsYXNzIE15U2hpcCBleHRlbmRzIGdhbWVvYmouR2FtZU9iaiB7IFxyXG4gIGNvbnN0cnVjdG9yKHgsIHksIHosc2NlbmUsc2UpIHtcclxuICBzdXBlcih4LCB5LCB6KTsvLyBleHRlbmRcclxuXHJcbiAgdGhpcy5jb2xsaXNpb25BcmVhLndpZHRoID0gNjtcclxuICB0aGlzLmNvbGxpc2lvbkFyZWEuaGVpZ2h0ID0gODtcclxuICB0aGlzLnNlID0gc2U7XHJcbiAgdGhpcy5zY2VuZSA9IHNjZW5lO1xyXG4gIHRoaXMudGV4dHVyZVdpZHRoID0gc2ZnLnRleHR1cmVGaWxlcy5teXNoaXAuaW1hZ2Uud2lkdGg7XHJcbiAgdGhpcy50ZXh0dXJlSGVpZ2h0ID0gc2ZnLnRleHR1cmVGaWxlcy5teXNoaXAuaW1hZ2UuaGVpZ2h0O1xyXG4gIHRoaXMud2lkdGggPSAxNjtcclxuICB0aGlzLmhlaWdodCA9IDE2O1xyXG5cclxuICAvLyDnp7vli5Xnr4Tlm7LjgpLmsYLjgoHjgotcclxuICB0aGlzLnRvcCA9IChzZmcuVl9UT1AgLSB0aGlzLmhlaWdodCAvIDIpIHwgMDtcclxuICB0aGlzLmJvdHRvbSA9IChzZmcuVl9CT1RUT00gKyB0aGlzLmhlaWdodCAvIDIpIHwgMDtcclxuICB0aGlzLmxlZnQgPSAoc2ZnLlZfTEVGVCArIHRoaXMud2lkdGggLyAyKSB8IDA7XHJcbiAgdGhpcy5yaWdodCA9IChzZmcuVl9SSUdIVCAtIHRoaXMud2lkdGggLyAyKSB8IDA7XHJcblxyXG4gIC8vIOODoeODg+OCt+ODpeOBruS9nOaIkOODu+ihqOekulxyXG4gIC8vIOODnuODhuODquOCouODq+OBruS9nOaIkFxyXG4gIHZhciBtYXRlcmlhbCA9IGdyYXBoaWNzLmNyZWF0ZVNwcml0ZU1hdGVyaWFsKHNmZy50ZXh0dXJlRmlsZXMubXlzaGlwKTtcclxuICAvLyDjgrjjgqrjg6Hjg4jjg6rjga7kvZzmiJBcclxuICB2YXIgZ2VvbWV0cnkgPSBncmFwaGljcy5jcmVhdGVTcHJpdGVHZW9tZXRyeSh0aGlzLndpZHRoKTtcclxuICBncmFwaGljcy5jcmVhdGVTcHJpdGVVVihnZW9tZXRyeSwgc2ZnLnRleHR1cmVGaWxlcy5teXNoaXAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCAwKTtcclxuXHJcbiAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuXHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnggPSB0aGlzLnhfO1xyXG4gIHRoaXMubWVzaC5wb3NpdGlvbi55ID0gdGhpcy55XztcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueiA9IHRoaXMuel87XHJcbiAgdGhpcy5yZXN0ID0gMztcclxuICB0aGlzLm15QnVsbGV0cyA9ICggKCk9PiB7XHJcbiAgICB2YXIgYXJyID0gW107XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDI7ICsraSkge1xyXG4gICAgICBhcnIucHVzaChuZXcgTXlCdWxsZXQodGhpcy5zY2VuZSx0aGlzLnNlKSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXJyO1xyXG4gIH0pKCk7XHJcbiAgc2NlbmUuYWRkKHRoaXMubWVzaCk7XHJcbiAgXHJcbiAgdGhpcy5idWxsZXRQb3dlciA9IDE7XHJcblxyXG59XHJcbiAgZ2V0IHgoKSB7IHJldHVybiB0aGlzLnhfOyB9XHJcbiAgc2V0IHgodikgeyB0aGlzLnhfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnggPSB2OyB9XHJcbiAgZ2V0IHkoKSB7IHJldHVybiB0aGlzLnlfOyB9XHJcbiAgc2V0IHkodikgeyB0aGlzLnlfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnkgPSB2OyB9XHJcbiAgZ2V0IHooKSB7IHJldHVybiB0aGlzLnpfOyB9XHJcbiAgc2V0IHoodikgeyB0aGlzLnpfID0gdGhpcy5tZXNoLnBvc2l0aW9uLnogPSB2OyB9XHJcbiAgXHJcbiAgc2hvb3QoYWltUmFkaWFuKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gdGhpcy5teUJ1bGxldHMubGVuZ3RoOyBpIDwgZW5kOyArK2kpIHtcclxuICAgICAgaWYgKHRoaXMubXlCdWxsZXRzW2ldLnN0YXJ0KHRoaXMueCwgdGhpcy55ICwgdGhpcy56LGFpbVJhZGlhbix0aGlzLmJ1bGxldFBvd2VyKSkge1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIGFjdGlvbihiYXNpY0lucHV0KSB7XHJcbiAgICBpZiAoYmFzaWNJbnB1dC5sZWZ0KSB7XHJcbiAgICAgIGlmICh0aGlzLnggPiB0aGlzLmxlZnQpIHtcclxuICAgICAgICB0aGlzLnggLT0gMjtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChiYXNpY0lucHV0LnJpZ2h0KSB7XHJcbiAgICAgIGlmICh0aGlzLnggPCB0aGlzLnJpZ2h0KSB7XHJcbiAgICAgICAgdGhpcy54ICs9IDI7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoYmFzaWNJbnB1dC51cCkge1xyXG4gICAgICBpZiAodGhpcy55IDwgdGhpcy50b3ApIHtcclxuICAgICAgICB0aGlzLnkgKz0gMjtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChiYXNpY0lucHV0LmRvd24pIHtcclxuICAgICAgaWYgKHRoaXMueSA+IHRoaXMuYm90dG9tKSB7XHJcbiAgICAgICAgdGhpcy55IC09IDI7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcblxyXG4gICAgaWYgKGJhc2ljSW5wdXQueikge1xyXG4gICAgICBiYXNpY0lucHV0LmtleUNoZWNrLnogPSBmYWxzZTtcclxuICAgICAgdGhpcy5zaG9vdCgwLjUgKiBNYXRoLlBJKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoYmFzaWNJbnB1dC54KSB7XHJcbiAgICAgIGJhc2ljSW5wdXQua2V5Q2hlY2sueCA9IGZhbHNlO1xyXG4gICAgICB0aGlzLnNob290KDEuNSAqIE1hdGguUEkpO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBoaXQoKSB7XHJcbiAgICB0aGlzLm1lc2gudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgc2ZnLmJvbWJzLnN0YXJ0KHRoaXMueCwgdGhpcy55LCAwLjIpO1xyXG4gICAgdGhpcy5zZSg0KTtcclxuICB9XHJcbiAgXHJcbiAgcmVzZXQoKXtcclxuICAgIHRoaXMubXlCdWxsZXRzLmZvckVhY2goKGQpPT57XHJcbiAgICAgIGlmKGQuZW5hYmxlXyl7XHJcbiAgICAgICAgd2hpbGUoIXNmZy50YXNrcy5hcnJheVtkLnRhc2suaW5kZXhdLmdlbkluc3QubmV4dCgtKDEgKyBkLnRhc2suaW5kZXgpKS5kb25lKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIFxyXG4gIGluaXQoKXtcclxuICAgICAgdGhpcy54ID0gMDtcclxuICAgICAgdGhpcy55ID0gLTEwMDtcclxuICAgICAgdGhpcy56ID0gMC4xO1xyXG4gICAgICB0aGlzLm1lc2gudmlzaWJsZSA9IHRydWU7XHJcbiAgfVxyXG5cclxufSIsIlwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgKiBhcyBzZmcgZnJvbSAnLi9nbG9iYWwnO1xyXG4vL2ltcG9ydCAqICBhcyBnYW1lb2JqIGZyb20gJy4vZ2FtZW9iaic7XHJcbi8vaW1wb3J0ICogYXMgZ3JhcGhpY3MgZnJvbSAnLi9ncmFwaGljcyc7XHJcblxyXG4vLy8g44OG44Kt44K544OI5bGe5oCnXHJcbmV4cG9ydCBjbGFzcyBUZXh0QXR0cmlidXRlIHtcclxuICBjb25zdHJ1Y3RvcihibGluaywgZm9udCkge1xyXG4gICAgaWYgKGJsaW5rKSB7XHJcbiAgICAgIHRoaXMuYmxpbmsgPSBibGluaztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuYmxpbmsgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIGlmIChmb250KSB7XHJcbiAgICAgIHRoaXMuZm9udCA9IGZvbnQ7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmZvbnQgPSBzZmcudGV4dHVyZUZpbGVzLmZvbnQ7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g44OG44Kt44K544OI44OX44Os44O844OzXHJcbmV4cG9ydCBjbGFzcyBUZXh0UGxhbmV7IFxyXG4gIGNvbnN0cnVjdG9yIChzY2VuZSkge1xyXG4gIHRoaXMudGV4dEJ1ZmZlciA9IG5ldyBBcnJheShzZmcuVEVYVF9IRUlHSFQpO1xyXG4gIHRoaXMuYXR0ckJ1ZmZlciA9IG5ldyBBcnJheShzZmcuVEVYVF9IRUlHSFQpO1xyXG4gIHRoaXMudGV4dEJhY2tCdWZmZXIgPSBuZXcgQXJyYXkoc2ZnLlRFWFRfSEVJR0hUKTtcclxuICB0aGlzLmF0dHJCYWNrQnVmZmVyID0gbmV3IEFycmF5KHNmZy5URVhUX0hFSUdIVCk7XHJcbiAgdmFyIGVuZGkgPSB0aGlzLnRleHRCdWZmZXIubGVuZ3RoO1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZW5kaTsgKytpKSB7XHJcbiAgICB0aGlzLnRleHRCdWZmZXJbaV0gPSBuZXcgQXJyYXkoc2ZnLlRFWFRfV0lEVEgpO1xyXG4gICAgdGhpcy5hdHRyQnVmZmVyW2ldID0gbmV3IEFycmF5KHNmZy5URVhUX1dJRFRIKTtcclxuICAgIHRoaXMudGV4dEJhY2tCdWZmZXJbaV0gPSBuZXcgQXJyYXkoc2ZnLlRFWFRfV0lEVEgpO1xyXG4gICAgdGhpcy5hdHRyQmFja0J1ZmZlcltpXSA9IG5ldyBBcnJheShzZmcuVEVYVF9XSURUSCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLy8g5o+P55S755So44Kt44Oj44Oz44OQ44K544Gu44K744OD44OI44Ki44OD44OXXHJcblxyXG4gIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgdmFyIHdpZHRoID0gMTtcclxuICB3aGlsZSAod2lkdGggPD0gc2ZnLlZJUlRVQUxfV0lEVEgpe1xyXG4gICAgd2lkdGggKj0gMjtcclxuICB9XHJcbiAgdmFyIGhlaWdodCA9IDE7XHJcbiAgd2hpbGUgKGhlaWdodCA8PSBzZmcuVklSVFVBTF9IRUlHSFQpe1xyXG4gICAgaGVpZ2h0ICo9IDI7XHJcbiAgfVxyXG4gIFxyXG4gIHRoaXMuY2FudmFzLndpZHRoID0gd2lkdGg7XHJcbiAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG4gIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICB0aGlzLnRleHR1cmUgPSBuZXcgVEhSRUUuVGV4dHVyZSh0aGlzLmNhbnZhcyk7XHJcbiAgdGhpcy50ZXh0dXJlLm1hZ0ZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XHJcbiAgdGhpcy50ZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLkxpbmVhck1pcE1hcExpbmVhckZpbHRlcjtcclxuICB0aGlzLm1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgbWFwOiB0aGlzLnRleHR1cmUsYWxwaGFUZXN0OjAuNSwgdHJhbnNwYXJlbnQ6IHRydWUsZGVwdGhUZXN0OnRydWUsc2hhZGluZzpUSFJFRS5GbGF0U2hhZGluZ30pO1xyXG4vLyAgdGhpcy5nZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KHNmZy5WSVJUVUFMX1dJRFRILCBzZmcuVklSVFVBTF9IRUlHSFQpO1xyXG4gIHRoaXMuZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSh3aWR0aCwgaGVpZ2h0KTtcclxuICB0aGlzLm1lc2ggPSBuZXcgVEhSRUUuTWVzaCh0aGlzLmdlb21ldHJ5LCB0aGlzLm1hdGVyaWFsKTtcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueiA9IDAuNDtcclxuICB0aGlzLm1lc2gucG9zaXRpb24ueCA9ICh3aWR0aCAtIHNmZy5WSVJUVUFMX1dJRFRIKSAvIDI7XHJcbiAgdGhpcy5tZXNoLnBvc2l0aW9uLnkgPSAgLSAoaGVpZ2h0IC0gc2ZnLlZJUlRVQUxfSEVJR0hUKSAvIDI7XHJcbiAgdGhpcy5mb250cyA9IHsgZm9udDogc2ZnLnRleHR1cmVGaWxlcy5mb250LCBmb250MTogc2ZnLnRleHR1cmVGaWxlcy5mb250MSB9O1xyXG4gIHRoaXMuYmxpbmtDb3VudCA9IDA7XHJcbiAgdGhpcy5ibGluayA9IGZhbHNlO1xyXG5cclxuICAvLyDjgrnjg6Djg7zjgrjjg7PjgrDjgpLliIfjgotcclxuICB0aGlzLmN0eC5tc0ltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIHRoaXMuY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gIC8vdGhpcy5jdHgud2Via2l0SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgdGhpcy5jdHgubW96SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcblxyXG4gIHRoaXMuY2xzKCk7XHJcbiAgc2NlbmUuYWRkKHRoaXMubWVzaCk7XHJcbn1cclxuXHJcbiAgLy8vIOeUu+mdoua2iOWOu1xyXG4gIGNscygpIHtcclxuICAgIGZvciAodmFyIGkgPSAwLCBlbmRpID0gdGhpcy50ZXh0QnVmZmVyLmxlbmd0aDsgaSA8IGVuZGk7ICsraSkge1xyXG4gICAgICB2YXIgbGluZSA9IHRoaXMudGV4dEJ1ZmZlcltpXTtcclxuICAgICAgdmFyIGF0dHJfbGluZSA9IHRoaXMuYXR0ckJ1ZmZlcltpXTtcclxuICAgICAgdmFyIGxpbmVfYmFjayA9IHRoaXMudGV4dEJhY2tCdWZmZXJbaV07XHJcbiAgICAgIHZhciBhdHRyX2xpbmVfYmFjayA9IHRoaXMuYXR0ckJhY2tCdWZmZXJbaV07XHJcblxyXG4gICAgICBmb3IgKHZhciBqID0gMCwgZW5kaiA9IHRoaXMudGV4dEJ1ZmZlcltpXS5sZW5ndGg7IGogPCBlbmRqOyArK2opIHtcclxuICAgICAgICBsaW5lW2pdID0gMHgyMDtcclxuICAgICAgICBhdHRyX2xpbmVbal0gPSAweDAwO1xyXG4gICAgICAgIC8vbGluZV9iYWNrW2pdID0gMHgyMDtcclxuICAgICAgICAvL2F0dHJfbGluZV9iYWNrW2pdID0gMHgwMDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHNmZy5WSVJUVUFMX1dJRFRILCBzZmcuVklSVFVBTF9IRUlHSFQpO1xyXG4gIH1cclxuXHJcbiAgLy8vIOaWh+Wtl+ihqOekuuOBmeOCi1xyXG4gIHByaW50KHgsIHksIHN0ciwgYXR0cmlidXRlKSB7XHJcbiAgICB2YXIgbGluZSA9IHRoaXMudGV4dEJ1ZmZlclt5XTtcclxuICAgIHZhciBhdHRyID0gdGhpcy5hdHRyQnVmZmVyW3ldO1xyXG4gICAgaWYgKCFhdHRyaWJ1dGUpIHtcclxuICAgICAgYXR0cmlidXRlID0gMDtcclxuICAgIH1cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgIHZhciBjID0gc3RyLmNoYXJDb2RlQXQoaSk7XHJcbiAgICAgIGlmIChjID09IDB4YSkge1xyXG4gICAgICAgICsreTtcclxuICAgICAgICBpZiAoeSA+PSB0aGlzLnRleHRCdWZmZXIubGVuZ3RoKSB7XHJcbiAgICAgICAgICAvLyDjgrnjgq/jg63jg7zjg6tcclxuICAgICAgICAgIHRoaXMudGV4dEJ1ZmZlciA9IHRoaXMudGV4dEJ1ZmZlci5zbGljZSgxLCB0aGlzLnRleHRCdWZmZXIubGVuZ3RoIC0gMSk7XHJcbiAgICAgICAgICB0aGlzLnRleHRCdWZmZXIucHVzaChuZXcgQXJyYXkoc2ZnLlZJUlRVQUxfV0lEVEggLyA4KSk7XHJcbiAgICAgICAgICB0aGlzLmF0dHJCdWZmZXIgPSB0aGlzLmF0dHJCdWZmZXIuc2xpY2UoMSwgdGhpcy5hdHRyQnVmZmVyLmxlbmd0aCAtIDEpO1xyXG4gICAgICAgICAgdGhpcy5hdHRyQnVmZmVyLnB1c2gobmV3IEFycmF5KHNmZy5WSVJUVUFMX1dJRFRIIC8gOCkpO1xyXG4gICAgICAgICAgLS15O1xyXG4gICAgICAgICAgdmFyIGVuZGogPSB0aGlzLnRleHRCdWZmZXJbeV0ubGVuZ3RoO1xyXG4gICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBlbmRqOyArK2opIHtcclxuICAgICAgICAgICAgdGhpcy50ZXh0QnVmZmVyW3ldW2pdID0gMHgyMDtcclxuICAgICAgICAgICAgdGhpcy5hdHRyQnVmZmVyW3ldW2pdID0gMHgwMDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgbGluZSA9IHRoaXMudGV4dEJ1ZmZlclt5XTtcclxuICAgICAgICBhdHRyID0gdGhpcy5hdHRyQnVmZmVyW3ldO1xyXG4gICAgICAgIHggPSAwO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxpbmVbeF0gPSBjO1xyXG4gICAgICAgIGF0dHJbeF0gPSBhdHRyaWJ1dGU7XHJcbiAgICAgICAgKyt4O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIC8vLyDjg4bjgq3jgrnjg4jjg4fjg7zjgr/jgpLjgoLjgajjgavjg4bjgq/jgrnjg4Hjg6Pjg7zjgavmj4/nlLvjgZnjgotcclxuICByZW5kZXIoKSB7XHJcbiAgICB2YXIgY3R4ID0gdGhpcy5jdHg7XHJcbiAgICB0aGlzLmJsaW5rQ291bnQgPSAodGhpcy5ibGlua0NvdW50ICsgMSkgJiAweGY7XHJcblxyXG4gICAgdmFyIGRyYXdfYmxpbmsgPSBmYWxzZTtcclxuICAgIGlmICghdGhpcy5ibGlua0NvdW50KSB7XHJcbiAgICAgIHRoaXMuYmxpbmsgPSAhdGhpcy5ibGluaztcclxuICAgICAgZHJhd19ibGluayA9IHRydWU7XHJcbiAgICB9XHJcbiAgICB2YXIgdXBkYXRlID0gZmFsc2U7XHJcbi8vICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgQ09OU09MRV9XSURUSCwgQ09OU09MRV9IRUlHSFQpO1xyXG4vLyAgICBjdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG5cclxuICAgIGZvciAodmFyIHkgPSAwLCBneSA9IDA7IHkgPCBzZmcuVEVYVF9IRUlHSFQ7ICsreSwgZ3kgKz0gc2ZnLkFDVFVBTF9DSEFSX1NJWkUpIHtcclxuICAgICAgdmFyIGxpbmUgPSB0aGlzLnRleHRCdWZmZXJbeV07XHJcbiAgICAgIHZhciBhdHRyX2xpbmUgPSB0aGlzLmF0dHJCdWZmZXJbeV07XHJcbiAgICAgIHZhciBsaW5lX2JhY2sgPSB0aGlzLnRleHRCYWNrQnVmZmVyW3ldO1xyXG4gICAgICB2YXIgYXR0cl9saW5lX2JhY2sgPSB0aGlzLmF0dHJCYWNrQnVmZmVyW3ldO1xyXG4gICAgICBmb3IgKHZhciB4ID0gMCwgZ3ggPSAwOyB4IDwgc2ZnLlRFWFRfV0lEVEg7ICsreCwgZ3ggKz0gc2ZnLkFDVFVBTF9DSEFSX1NJWkUpIHtcclxuICAgICAgICB2YXIgcHJvY2Vzc19ibGluayA9IChhdHRyX2xpbmVbeF0gJiYgYXR0cl9saW5lW3hdLmJsaW5rKTtcclxuICAgICAgICBpZiAobGluZVt4XSAhPSBsaW5lX2JhY2tbeF0gfHwgYXR0cl9saW5lW3hdICE9IGF0dHJfbGluZV9iYWNrW3hdIHx8IChwcm9jZXNzX2JsaW5rICYmIGRyYXdfYmxpbmspKSB7XHJcbiAgICAgICAgICB1cGRhdGUgPSB0cnVlO1xyXG5cclxuICAgICAgICAgIGxpbmVfYmFja1t4XSA9IGxpbmVbeF07XHJcbiAgICAgICAgICBhdHRyX2xpbmVfYmFja1t4XSA9IGF0dHJfbGluZVt4XTtcclxuICAgICAgICAgIHZhciBjID0gMDtcclxuICAgICAgICAgIGlmICghcHJvY2Vzc19ibGluayB8fCB0aGlzLmJsaW5rKSB7XHJcbiAgICAgICAgICAgIGMgPSBsaW5lW3hdIC0gMHgyMDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHZhciB5cG9zID0gKGMgPj4gNCkgPDwgMztcclxuICAgICAgICAgIHZhciB4cG9zID0gKGMgJiAweGYpIDw8IDM7XHJcbiAgICAgICAgICBjdHguY2xlYXJSZWN0KGd4LCBneSwgc2ZnLkFDVFVBTF9DSEFSX1NJWkUsIHNmZy5BQ1RVQUxfQ0hBUl9TSVpFKTtcclxuICAgICAgICAgIHZhciBmb250ID0gYXR0cl9saW5lW3hdID8gYXR0cl9saW5lW3hdLmZvbnQgOiBzZmcudGV4dHVyZUZpbGVzLmZvbnQ7XHJcbiAgICAgICAgICBpZiAoYykge1xyXG4gICAgICAgICAgICBjdHguZHJhd0ltYWdlKGZvbnQuaW1hZ2UsIHhwb3MsIHlwb3MsIHNmZy5DSEFSX1NJWkUsIHNmZy5DSEFSX1NJWkUsIGd4LCBneSwgc2ZnLkFDVFVBTF9DSEFSX1NJWkUsIHNmZy5BQ1RVQUxfQ0hBUl9TSVpFKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMudGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHVwZGF0ZTtcclxuICB9XHJcbn1cclxuIiwiXHJcblwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgKiBhcyBzZmcgZnJvbSAnLi9nbG9iYWwnO1xyXG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJy4vZXZlbnRFbWl0dGVyMyc7XHJcblxyXG5leHBvcnQgY2xhc3MgVGFzayB7XHJcbiAgY29uc3RydWN0b3IoZ2VuSW5zdCxwcmlvcml0eSkge1xyXG4gICAgdGhpcy5wcmlvcml0eSA9IHByaW9yaXR5IHx8IDEwMDAwO1xyXG4gICAgdGhpcy5nZW5JbnN0ID0gZ2VuSW5zdDtcclxuICAgIC8vIOWIneacn+WMllxyXG4gICAgdGhpcy5pbmRleCA9IDA7XHJcbiAgfVxyXG4gIFxyXG59XHJcblxyXG5leHBvcnQgdmFyIG51bGxUYXNrID0gbmV3IFRhc2soKGZ1bmN0aW9uKigpe30pKCkpO1xyXG5cclxuLy8vIOOCv+OCueOCr+euoeeQhlxyXG5leHBvcnQgY2xhc3MgVGFza3MgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xyXG4gIGNvbnN0cnVjdG9yKCl7XHJcbiAgICBzdXBlcigpO1xyXG4gICAgdGhpcy5hcnJheSA9IG5ldyBBcnJheSgwKTtcclxuICAgIHRoaXMubmVlZFNvcnQgPSBmYWxzZTtcclxuICAgIHRoaXMubmVlZENvbXByZXNzID0gZmFsc2U7XHJcbiAgICB0aGlzLmVuYWJsZSA9IHRydWU7XHJcbiAgICB0aGlzLnN0b3BwZWQgPSBmYWxzZTtcclxuICB9XHJcbiAgLy8gaW5kZXjjga7kvY3nva7jga7jgr/jgrnjgq/jgpLnva7jgY3mj5vjgYjjgotcclxuICBzZXROZXh0VGFzayhpbmRleCwgZ2VuSW5zdCwgcHJpb3JpdHkpIFxyXG4gIHtcclxuICAgIGlmKGluZGV4IDwgMCl7XHJcbiAgICAgIGluZGV4ID0gLSgrK2luZGV4KTtcclxuICAgIH1cclxuICAgIGlmKHRoaXMuYXJyYXlbaW5kZXhdLnByaW9yaXR5ID09IDEwMDAwMCl7XHJcbiAgICAgIGRlYnVnZ2VyO1xyXG4gICAgfVxyXG4gICAgdmFyIHQgPSBuZXcgVGFzayhnZW5JbnN0KGluZGV4KSwgcHJpb3JpdHkpO1xyXG4gICAgdC5pbmRleCA9IGluZGV4O1xyXG4gICAgdGhpcy5hcnJheVtpbmRleF0gPSB0O1xyXG4gICAgdGhpcy5uZWVkU29ydCA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBwdXNoVGFzayhnZW5JbnN0LCBwcmlvcml0eSkge1xyXG4gICAgbGV0IHQ7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYXJyYXkubGVuZ3RoOyArK2kpIHtcclxuICAgICAgaWYgKHRoaXMuYXJyYXlbaV0gPT0gbnVsbFRhc2spIHtcclxuICAgICAgICB0ID0gbmV3IFRhc2soZ2VuSW5zdChpKSwgcHJpb3JpdHkpO1xyXG4gICAgICAgIHRoaXMuYXJyYXlbaV0gPSB0O1xyXG4gICAgICAgIHQuaW5kZXggPSBpO1xyXG4gICAgICAgIHJldHVybiB0O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0ID0gbmV3IFRhc2soZ2VuSW5zdCh0aGlzLmFycmF5Lmxlbmd0aCkscHJpb3JpdHkpO1xyXG4gICAgdC5pbmRleCA9IHRoaXMuYXJyYXkubGVuZ3RoO1xyXG4gICAgdGhpcy5hcnJheVt0aGlzLmFycmF5Lmxlbmd0aF0gPSB0O1xyXG4gICAgdGhpcy5uZWVkU29ydCA9IHRydWU7XHJcbiAgICByZXR1cm4gdDtcclxuICB9XHJcblxyXG4gIC8vIOmFjeWIl+OCkuWPluW+l+OBmeOCi1xyXG4gIGdldEFycmF5KCkge1xyXG4gICAgcmV0dXJuIHRoaXMuYXJyYXk7XHJcbiAgfVxyXG4gIC8vIOOCv+OCueOCr+OCkuOCr+ODquOCouOBmeOCi1xyXG4gIGNsZWFyKCkge1xyXG4gICAgdGhpcy5hcnJheS5sZW5ndGggPSAwO1xyXG4gIH1cclxuICAvLyDjgr3jg7zjg4jjgYzlv4XopoHjgYvjg4Hjgqfjg4Pjgq/jgZfjgIHjgr3jg7zjg4jjgZnjgotcclxuICBjaGVja1NvcnQoKSB7XHJcbiAgICBpZiAodGhpcy5uZWVkU29ydCkge1xyXG4gICAgICB0aGlzLmFycmF5LnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcclxuICAgICAgICBpZihhLnByaW9yaXR5ID4gYi5wcmlvcml0eSkgcmV0dXJuIDE7XHJcbiAgICAgICAgaWYgKGEucHJpb3JpdHkgPCBiLnByaW9yaXR5KSByZXR1cm4gLTE7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgIH0pO1xyXG4gICAgICAvLyDjgqTjg7Pjg4fjg4Pjgq/jgrnjga7mjK/jgornm7TjgZdcclxuICAgICAgZm9yICh2YXIgaSA9IDAsIGUgPSB0aGlzLmFycmF5Lmxlbmd0aDsgaSA8IGU7ICsraSkge1xyXG4gICAgICAgIHRoaXMuYXJyYXlbaV0uaW5kZXggPSBpO1xyXG4gICAgICB9XHJcbiAgICAgdGhpcy5uZWVkU29ydCA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmVtb3ZlVGFzayhpbmRleCkge1xyXG4gICAgaWYoaW5kZXggPCAwKXtcclxuICAgICAgaW5kZXggPSAtKCsraW5kZXgpO1xyXG4gICAgfVxyXG4gICAgaWYodGhpcy5hcnJheVtpbmRleF0ucHJpb3JpdHkgPT0gMTAwMDAwKXtcclxuICAgICAgZGVidWdnZXI7XHJcbiAgICB9XHJcbiAgICB0aGlzLmFycmF5W2luZGV4XSA9IG51bGxUYXNrO1xyXG4gICAgdGhpcy5uZWVkQ29tcHJlc3MgPSB0cnVlO1xyXG4gIH1cclxuICBcclxuICBjb21wcmVzcygpIHtcclxuICAgIGlmICghdGhpcy5uZWVkQ29tcHJlc3MpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdmFyIGRlc3QgPSBbXTtcclxuICAgIHZhciBzcmMgPSB0aGlzLmFycmF5O1xyXG4gICAgdmFyIGRlc3RJbmRleCA9IDA7XHJcbiAgICBkZXN0ID0gc3JjLmZpbHRlcigodixpKT0+e1xyXG4gICAgICBsZXQgcmV0ID0gdiAhPSBudWxsVGFzaztcclxuICAgICAgaWYocmV0KXtcclxuICAgICAgICB2LmluZGV4ID0gZGVzdEluZGV4Kys7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHJldDtcclxuICAgIH0pO1xyXG4gICAgdGhpcy5hcnJheSA9IGRlc3Q7XHJcbiAgICB0aGlzLm5lZWRDb21wcmVzcyA9IGZhbHNlO1xyXG4gIH1cclxuICBcclxuICBwcm9jZXNzKGdhbWUpXHJcbiAge1xyXG4gICAgaWYodGhpcy5lbmFibGUpe1xyXG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5wcm9jZXNzLmJpbmQodGhpcyxnYW1lKSk7XHJcbiAgICAgIHRoaXMuc3RvcHBlZCA9IGZhbHNlO1xyXG4gICAgICBpZiAoIXNmZy5wYXVzZSkge1xyXG4gICAgICAgIGlmICghZ2FtZS5pc0hpZGRlbikge1xyXG4gICAgICAgICAgdGhpcy5jaGVja1NvcnQoKTtcclxuICAgICAgICAgIHRoaXMuYXJyYXkuZm9yRWFjaCggKHRhc2ssaSkgPT57XHJcbiAgICAgICAgICAgIGlmICh0YXNrICE9IG51bGxUYXNrKSB7XHJcbiAgICAgICAgICAgICAgaWYodGFzay5pbmRleCAhPSBpICl7XHJcbiAgICAgICAgICAgICAgICBkZWJ1Z2dlcjtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgdGFzay5nZW5JbnN0Lm5leHQodGFzay5pbmRleCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgdGhpcy5jb21wcmVzcygpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSAgICBcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuZW1pdCgnc3RvcHBlZCcpO1xyXG4gICAgICB0aGlzLnN0b3BwZWQgPSB0cnVlO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBzdG9wUHJvY2Vzcygpe1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLHJlamVjdCk9PntcclxuICAgICAgdGhpcy5lbmFibGUgPSBmYWxzZTtcclxuICAgICAgdGhpcy5vbignc3RvcHBlZCcsKCk9PntcclxuICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG4vLy8g44Ky44O844Og55So44K/44Kk44Oe44O8XHJcbmV4cG9ydCBjbGFzcyBHYW1lVGltZXIge1xyXG4gIGNvbnN0cnVjdG9yKGdldEN1cnJlbnRUaW1lKSB7XHJcbiAgICB0aGlzLmVsYXBzZWRUaW1lID0gMDtcclxuICAgIHRoaXMuY3VycmVudFRpbWUgPSAwO1xyXG4gICAgdGhpcy5wYXVzZVRpbWUgPSAwO1xyXG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLlNUT1A7XHJcbiAgICB0aGlzLmdldEN1cnJlbnRUaW1lID0gZ2V0Q3VycmVudFRpbWU7XHJcbiAgICB0aGlzLlNUT1AgPSAxO1xyXG4gICAgdGhpcy5TVEFSVCA9IDI7XHJcbiAgICB0aGlzLlBBVVNFID0gMztcclxuXHJcbiAgfVxyXG4gIFxyXG4gIHN0YXJ0KCkge1xyXG4gICAgdGhpcy5lbGFwc2VkVGltZSA9IDA7XHJcbiAgICB0aGlzLmRlbHRhVGltZSA9IDA7XHJcbiAgICB0aGlzLmN1cnJlbnRUaW1lID0gdGhpcy5nZXRDdXJyZW50VGltZSgpO1xyXG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLlNUQVJUO1xyXG4gIH1cclxuXHJcbiAgcmVzdW1lKCkge1xyXG4gICAgdmFyIG5vd1RpbWUgPSB0aGlzLmdldEN1cnJlbnRUaW1lKCk7XHJcbiAgICB0aGlzLmN1cnJlbnRUaW1lID0gdGhpcy5jdXJyZW50VGltZSArIG5vd1RpbWUgLSB0aGlzLnBhdXNlVGltZTtcclxuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5TVEFSVDtcclxuICB9XHJcblxyXG4gIHBhdXNlKCkge1xyXG4gICAgdGhpcy5wYXVzZVRpbWUgPSB0aGlzLmdldEN1cnJlbnRUaW1lKCk7XHJcbiAgICB0aGlzLnN0YXR1cyA9IHRoaXMuUEFVU0U7XHJcbiAgfVxyXG5cclxuICBzdG9wKCkge1xyXG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLlNUT1A7XHJcbiAgfVxyXG5cclxuICB1cGRhdGUoKSB7XHJcbiAgICBpZiAodGhpcy5zdGF0dXMgIT0gdGhpcy5TVEFSVCkgcmV0dXJuO1xyXG4gICAgdmFyIG5vd1RpbWUgPSB0aGlzLmdldEN1cnJlbnRUaW1lKCk7XHJcbiAgICB0aGlzLmRlbHRhVGltZSA9IG5vd1RpbWUgLSB0aGlzLmN1cnJlbnRUaW1lO1xyXG4gICAgdGhpcy5lbGFwc2VkVGltZSA9IHRoaXMuZWxhcHNlZFRpbWUgKyB0aGlzLmRlbHRhVGltZTtcclxuICAgIHRoaXMuY3VycmVudFRpbWUgPSBub3dUaW1lO1xyXG4gIH1cclxufVxyXG5cclxuIl19
