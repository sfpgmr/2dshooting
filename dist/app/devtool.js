"use strict";
import * as sfg from './global';
import * as audio from './audio';


export class DevTool {
  constructor(game) {
    this.game = game;
//    this.status = DevTool.STATUS.STOP;
    this.keydown = this.keydown_();
    this.keydown.next();
    d3.select('body').on('keydown.DevTool', () => {
      var e = d3.event;
      if(this.keydown.next(e).value){
        d3.event.preventDefault();
        d3.event.cancelBubble = true;
        return false;
      };
    });
    
    var this_ = this;
    var initConsole = game.initConsole;
    game.initConsole = (function()
    {
      initConsole.apply(game,['console-debug']);
      this_.initConsole();
      d3.select('#console').attr('tabIndex',1);
    }).bind(game);
    
    game.basicInput.bind = function(){
      d3.select('#console').on('keydown.basicInput',game.basicInput.keydown.bind(game.basicInput));
      d3.select('#console').on('keyup.basicInput',game.basicInput.keyup.bind(game.basicInput));
    };
    
    game.basicInput.unbind = function(){
      d3.select('#console').on('keydown.basicInput',null);
      d3.select('#console').on('keyup.basicInput',null);
    }
    
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
      this.tasks.setNextTask(taskIndex, this.stageInit.bind(this)/*gameAction*/);
   
    };
  }

  *keydown_() {
    var e = yield;
    while (true) {
      var process = false;
      if (e.keyCode == 192) { // @ Key
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
  initConsole(){
    // Stats オブジェクト(FPS表示)の作成表示
    let g = this.game;
    let this_ = this;
    g.stats = new Stats();
    g.stats.domElement.style.position = 'absolute';
    g.stats.domElement.style.top = '0px';
    g.stats.domElement.style.left = '0px';
    g.stats.domElement.style.left = parseFloat(g.renderer.domElement.style.left) - parseFloat(g.stats.domElement.style.width) + 'px';

    let debugUi = d3.select('#content')
    .append('div').attr('class','devtool')
    .style('height',g.CONSOLE_HEIGHT + 'px');
    debugUi.node().appendChild(g.stats.domElement);
    
    let menu = debugUi.append('ul').classed('menu',true);
    menu.selectAll('li').data(['制御','敵','音源','画像'])
    .enter().append('li')
    .text((d)=>d)
    .on('click',function(d,i){
      var self = this;
      menu.selectAll('li').each(function(d,idx){
         if(self == this){
           d3.select(this).classed('active',true);
         } else {
           d3.select(this).classed('active',false);
         }       
      });
    });
    
    let toggle = this.toggleGame();
    
    let controllerData = 
    [
      //　ゲームプレイ
      {
        name:'play',
        func(){
          this.attr('class',toggle.next(false).value);
        }
      }
    ];
    
    let controller = debugUi.append('div').classed('controller',true);
    let buttons = controller.selectAll('button').data(controllerData)
    .enter().append('button');
    buttons.attr('class',d=>d.name);
    
    buttons.on('click',function(d){
      d.func.apply(d3.select(this));
    });
    
    controller.append('span').text('ステージ').style({'width':'100px','display':'inline-block','text-align':'center'});
    
    var stage = controller
    .append('input')
    .attr({'type':'text','value':g.stage.no})
    .style({'width':'40px','text-align':'right'});
    g.stage.on('update',(d)=>{
      stage.node().value = d.no;
    });
    
    stage.on('change',function(){
      let v =  parseInt(this.value);
      if(g.stage.no != v){
        g.stage.jump(v);
      }
    });
    // menu.append('li').text('制御').classed('active',true);
    // menu.append('li').text('敵');
    // menu.append('li').text('音源');
    // menu.append('li').text('画像');
    
    //debugUi.append('div').text('')
    
    // 

  }
  
  
  *toggleGame() {
    // 開始処理
    let cancel = false;
    while (!cancel) {
      let g = this.game;
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
      if (cancel) break;
      
      // 停止処理
    
      // 画面消去
      if (g.tasks.enable){
        g.tasks.stopProcess()
          .then(() => {
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
    }
  }
}

