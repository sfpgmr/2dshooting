"use strict";
//var STAGE_MAX = 1;
import * as sfg from './global'; 
import * as util from './util';
import * as audio from './audio';
//import * as song from './song';
import * as graphics from './graphics';
import * as io from './io';
import * as comm from './comm';
import * as text from './text';
import * as gameobj from './gameobj';
import * as myship from './myship';
import * as enemies from './enemies';
import * as effectobj from './effectobj';

export function calcScreenSize() {
    CONSOLE_WIDTH = window.innerWidth;
    CONSOLE_HEIGHT = window.innerHeight;
    if (CONSOLE_WIDTH >= CONSOLE_HEIGHT) {
      CONSOLE_WIDTH = CONSOLE_HEIGHT * sfg.VIRTUAL_WIDTH / sfg.VIRTUAL_HEIGHT;
      while(CONSOLE_WIDTH > window.innerWidth){
        --CONSOLE_HEIGHT;
        CONSOLE_WIDTH = CONSOLE_HEIGHT * sfg.VIRTUAL_WIDTH / sfg.VIRTUAL_HEIGHT;
      }
    } else {
      CONSOLE_HEIGHT = CONSOLE_WIDTH * sfg.VIRTUAL_HEIGHT / sfg.VIRTUAL_WIDTH;
      while(CONSOLE_HEIGHT > window.innerHeight){
        --CONSOLE_WIDTH;
        CONSOLE_HEIGHT = CONSOLE_WIDTH * sfg.VIRTUAL_HEIGHT / sfg.VIRTUAL_WIDTH;
      }
    }
    console.log(CONSOLE_WIDTH,CONSOLE_HEIGHT);
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
var baseTime = +new Date;
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

class ScoreEntry{
  constructor(name, score) {
  this.name = name;
  this.score = score;
}
}


class Stage {
  constructor(){
    this.MAX = 1;
    this.DIFFICULTY_MAX = 2.0;
    this.no = 1;
    this.privateNo = 0;
    this.difficulty = 1;
  }
  reset(){
    this.no = 1;
    this.privateNo = 0;
    this.difficulty = 1;
  }
  advance(){
    this.no++;
    this.privateNo++;

    if (this.difficulty < this.DIFFICULTY_MAX) {
      this.difficulty += 0.05;
    }

    if (this.privateNo >= this.MAX) {
      this.privateNo = 0;
    }
  }
}

// hidden プロパティおよび可視性の変更イベントの名前を設定
var hidden, visibilityChange;
if (typeof document.hidden !== "undefined") { // Opera 12.10 や Firefox 18 以降でサポート 
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
    d3.select('#content').append('div').classed('error',true).html(
      content + '<p class="errortext">ブラウザが<br/>WebGLをサポートしていないため<br/>動作いたしません。</p>');
    return false;
  }

  // Web Audio APIラッパー
  if (!audio_.enable) {
    d3.select('#content').append('div').classed('error',true).html(
      content + '<p class="errortext">ブラウザが<br/>Web Audio APIをサポートしていないため<br/>動作いたしません。</p>');
    return false;
  }

  // ブラウザがPage Visibility API をサポートしない場合に警告 
  if (typeof hidden === 'undefined') {
    d3.select('#content').append('div').classed('error',true).html(
      content + '<p class="errortext">ブラウザが<br/>Page Visibility APIをサポートしていないため<br/>動作いたしません。</p>');
    return false;
  }

  if (typeof localStorage === 'undefined') {
    d3.select('#content').append('div').classed('error',true).html(
      content + '<p class="errortext">ブラウザが<br/>Web Local Storageをサポートしていないため<br/>動作いたしません。</p>');
    return false;
  } else {
    storage = localStorage;
  }
  return true;
}

/// コンソール画面の初期化
function initConsole() {
  // レンダラーの作成
  renderer = new THREE.WebGLRenderer({ antialias: false,sortObjects: true });
  calcScreenSize();
  renderer.setSize(CONSOLE_WIDTH, CONSOLE_HEIGHT);
  renderer.setClearColor(0,1);
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

function onVisibilityChange()
{
  var h = document[hidden];
  isHidden = h;
  if (h) {
    if(sfg.gameTimer.status == sfg.gameTimer.START)
    {
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
    font1:'Font2.png',
    author:'author.png',
    title: 'TITLE.png',
    myship:'myship2.png',
    enemy:'enemy.png',
    bomb:'bomb.png'
  };
  /// テクスチャーのロード
  
  var loadPromise = Promise.resolve();
  var loader = new THREE.TextureLoader();
  function loadTexture(src)
  {
    return new Promise((resolve,reject)=>{
      loader.load(src,(texture)=>{
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.LinearMipMapLinearFilter;
        resolve(texture);
      },null,(xhr)=>{reject(xhr)});
    });
  }
  
  var texLength = Object.keys(textures).length;
  var texCount = 0; 
  progress = new graphics.Progress();
  progress.mesh.position.z = 0.001;
  progress.render('Loading Resouces ...', 0);
  scene.add(progress.mesh);
  for(var n in textures){
    ((name,texPath)=>{
      loadPromise = loadPromise
      .then(()=>{
        return loadTexture('./res/' + texPath);      
      })
      .then((tex)=>{
        texCount++;
        progress.render('Loading Resouces ...', (texCount / texLength * 100) | 0);        
        sfg.textureFiles[name] = tex;
        renderer.render(scene, camera);
        return Promise.resolve();
      });
    })(n,textures[n]);
  }
  
  loadPromise.then(()=>{
    scene.remove(progress.mesh);
    renderer.render(scene, camera);
    tasks.clear();
    tasks.pushTask(init);
    tasks.pushTask(render,100000);
    start = true;
    game();
  });
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
        for (var i = 0 ; i < arr.length; ++i) {
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

function render(taskIndex) 
{
  renderer.render(scene, camera);
  textPlane.render();
  stats.update();
}

function init(taskIndex) {

  scene = new THREE.Scene();
  enemyBullets = new enemies.EnemyBullets(scene,se);
  enemies_ = new enemies.Enemies(scene,se,enemyBullets);
  sfg.bombs = new effectobj.Bombs(scene,se);
  sfg.stage = new Stage();
  spaceField = null;

  // ハンドルネームの取得
  handleName = storage.getItem('handleName') ;

  textPlane = new text.TextPlane(scene);
 // textPlane.print(0, 0, "Web Audio API Test", new TextAttribute(true));
 // スコア情報 通信用
  comm_ = new comm.Comm();
  comm_.updateHighScores = (data)=>
  {
    highScores = data;
    highScore = highScores[0].score;
  };
  
  comm_.updateHighScore = (data)=>
  {
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
    var material = new THREE.PointsMaterial({
      size: 20, blending: THREE.AdditiveBlending,
      transparent: true, vertexColors: true, depthTest: false//, map: texture
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

var title;// タイトルメッシュ
var spaceField;// 宇宙空間パーティクル

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
  title = new THREE.Mesh(
    new THREE.PlaneGeometry(sfg.textureFiles.title.image.width, sfg.textureFiles.title.image.height),
    material
    );
  title.scale.x = title.scale.y = 0.8;
  title.position.y = 80;
  scene.add(title);

  /// 背景パーティクル表示
  if (!spaceField) {
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

    spaceField = new THREE.Points(geometry, material);
    spaceField.position.x = spaceField.position.y = spaceField.position.z = 0.0;
    scene.add(spaceField);
    tasks.pushTask(moveSpaceField);
  }

    /// テキスト表示
    textPlane.print(3, 25, "Push z key to Start Game", new text.TextAttribute(true));
    sfg.gameTimer.start();
    showTitle.endTime = sfg.gameTimer.elapsedTime + 10/*秒*/;
    tasks.setNextTask(taskIndex, showTitle);
}

/// 宇宙空間の表示
function moveSpaceField(taskIndex)
{
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
function initHandleName(taskIndex)
{
  if (editHandleName != null) {
    tasks.setNextTask(taskIndex,gameInit);
  } else {
    editHandleName = handleName || '';
    textPlane.cls();
    textPlane.print(4, 18, 'Input your handle name.');
    textPlane.print(8, 19, '(Max 8 Char)');
    textPlane.print(10, 21, editHandleName);
    //    textPlane.print(10, 21, handleName[0], TextAttribute(true));
    basicInput.unbind();
    var elm = d3.select('#content').append('input');
    elm
      .attr('type', 'text')
      .attr('pattern', '[a-zA-Z0-9_\@\#\$\-]{0,8}')
      .attr('maxlength', 8)
      .attr('id','input-area')
      .attr('value',editHandleName)
      .on('blur',function(){
        d3.event.preventDefault();
        d3.event.stopImmediatePropagation();
        setTimeout(function () { this.focus();}, 10);
        return false;
      })
      .on('keyup',function (e) {
        if (d3.event.keyCode == 13) {
          editHandleName = this.value;
          var s = this.selectionStart;
          var e = this.selectionEnd;
          textPlane.print(10, 21, editHandleName);
          textPlane.print(10 + s, 21, '_', new text.TextAttribute(true));
          d3.select(this).on('keyup',null);
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
        textPlane.print(10 + s, 21,'_', new text.TextAttribute(true));
      })
    .node().focus();
    tasks.setNextTask(taskIndex, inputHandleName);
  }
}

/// ハンドルネームのエントリ
function inputHandleName(taskIndex)
{

}

/// スコア加算
function addScore(s) {
  score += s;
  if (score > highScore) {
    highScore = score;
  }
}

sfg.addScore = addScore;

/// スコア表示
function printScore()
{
  var s = '00000000' + score.toString();
  s = s.substr(s.length - 8, 8);

  textPlane.print(1, 1, s);

  var h = '00000000' + highScore.toString();
  h = h.substr(h.length - 8, 8);
  textPlane.print(12, 1, h);

}

function se(index){
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
  sfg.myship_ = new myship.MyShip(0, -100, 0.1,scene,se);
  sfg.gameTimer.start();
  score = 0;
  textPlane.print(2, 0, 'Score    High Score');
  textPlane.print(20, 39, 'Rest:   ' + sfg.myship_.rest);
  printScore();
  tasks.setNextTask(taskIndex, stageInit/*gameAction*/);
}

/// ステージの初期化
function stageInit(taskIndex) {
  textPlane.print(0, 39, 'Stage:' + sfg.stage.no);
  sfg.gameTimer.start();
  enemies_.reset();
  enemies_.start();
  enemies_.calcEnemiesCount(sfg.stage.privateNo);
  enemies_.hitEnemiesCount = 0;
  textPlane.print(8, 15, 'Stage ' + (sfg.stage.no) + ' Start !!', new text.TextAttribute(true));
  stageStart.endTime = sfg.gameTimer.elapsedTime + 2;
  tasks.setNextTask(taskIndex, stageStart/*gameAction*/);
}

/// ステージ開始
function stageStart(taskIndex)
{
  sfg.gameTimer.update();
  sfg.myship_.action(basicInput);
  if (stageStart.endTime < sfg.gameTimer.elapsedTime) {
    textPlane.print(8, 15, '                  ', new text.TextAttribute(true));
    tasks.setNextTask(taskIndex, gameAction,5000);
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
function processCollision(taskIndex)
{
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
          if (top > (en.y + enco.bottom) &&
              (en.y + enco.top) > bottom &&
            left < (en.x + enco.right) &&
            (en.x + enco.left) < right
            ) {
            myb.enable_ = false;
            en.hit();
            break;
          }
        }
      }
    }
  }

  // 敵と自機とのあたり判定
  if(sfg.CHECK_COLLISION){
    var myco = sfg.myship_.collisionArea;
    var left = sfg.myship_.x + myco.left;
    var right = myco.right + sfg.myship_.x;
    var top = myco.top + sfg.myship_.y;
    var bottom = myco.bottom + sfg.myship_.y;

    for (var i = 0, end = ens.length; i < end; ++i) {
      var en = ens[i];
      if (en.enable_) {
        var enco = en.collisionArea;
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
    // 敵弾と自機とのあたり判定
    enbs = enemyBullets.enemyBullets;
    for (var i = 0, end = enbs.length; i < end; ++i) {
      var en = enbs[i];
      if (en.enable) {
        var enco = en.collisionArea;
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
      comm_.sendScore(new ScoreEntry(editHandleName,score));
      gameOver.endTime = sfg.gameTimer.elapsedTime + 5;
      rank = -1;
      tasks.setNextTask(taskIndex, gameOver);
    } else {
      sfg.myship_.mesh.visible = true;
      textPlane.print(20, 39, 'Rest:   ' + sfg.myship_.rest);
      textPlane.print(8, 15, 'Stage ' + (sfg.stage.no) + ' Start !!', new text.TextAttribute(true));
      stageStart.endTime = sfg.gameTimer.elapsedTime + 2;
      tasks.setNextTask(taskIndex, stageStart/*gameAction*/);
    }
  }

}

/// ゲームオーバー
function gameOver(taskIndex)
{
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
function checkRankIn(data)
{
  rank = data.rank;
}


/// ハイスコアエントリの表示
function printTop10()
{
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
