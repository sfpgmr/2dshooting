"use strict";
import *  as gameobj from './gameobj';
import * as sfg from './global';
import * as graphics from './graphics';

/// 敵弾
export function EnemyBullet(scene,se)
{
  gameobj.GameObj.call(this, 0, 0, 0);
  this.collisionArea.width = 2;
  this.collisionArea.height = 2;
  var tex = sfg.textureFiles.enemy;
  var material = graphics.createSpriteMaterial(tex);
  var geometry = graphics.createSpriteGeometry(16);
  graphics.createSpriteUV(geometry, tex, 16, 16, 0);
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

EnemyBullet.prototype = {
  get x() { return this.x_; },
  set x(v) { this.x_ = this.mesh.position.x = v; },
  get y() { return this.y_; },
  set y(v) { this.y_ = this.mesh.position.y = v; },
  get z() { return this.z_; },
  set z(v) { this.z_ = this.mesh.position.z = v; },
  get enable() {
    return this.enable_;
  },
  set enable(v) {
    this.enable_ = v;
    this.mesh.visible = v;
  },
  move: function (taskIndex) {
    if (this.status == this.NONE)
    {
      debugger;
    }

    this.x = this.x + this.dx;
    this.y = this.y + this.dy;

    if(this.x < (sfg.V_LEFT - 16) ||
       this.x > (sfg.V_RIGHT + 16) ||
       this.y < (sfg.V_BOTTOM - 16) ||
       this.y > (sfg.V_TOP + 16)) {
       this.mesh.visible = false;
       this.status = this.NONE;
       this.enable = false;
       sfg.tasks.removeTask(taskIndex);
    }
   },
  start: function (x, y, z) {
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

    var enb = this;
    this.task = sfg.tasks.pushTask(enb.move.bind(enb));
    return true;
  },
  hit: function () {
    this.enable = false;
    sfg.tasks.removeTask(this.task.index);
    this.status = this.NONE;
  },
  NONE: 0,
  MOVE: 1,
  BOMB: 2
}

export function EnemyBullets(scene,se)
{
  this.scene = scene;
  this.enemyBullets = [];
  for (var i = 0; i < 48; ++i) {
    this.enemyBullets.push(new EnemyBullet(this.scene,se));
  }
}

EnemyBullets.prototype = {
  start: function (x, y, z) {
    var ebs = this.enemyBullets;
    for(var i = 0,end = ebs.length;i< end;++i){
      if(!ebs[i].enable){
        ebs[i].start(x, y, z);
        break;
      }
    }
  },
  reset: function()
  {
    var ebs = this.enemyBullets;
    for (var i = 0, end = ebs.length; i < end; ++i) {
      if (ebs[i].enable) {
        ebs[i].enable = false;
        ebs[i].status = ebs[i].NONE;
        sfg.tasks.removeTask(ebs[i].task.index);
      }
    }
  }
}

/// 敵キャラの動き ///////////////////////////////
/// 直線運動
function LineMove(rad, speed, step)
{
  this.rad = rad;
  this.speed = speed;
  this.step = step;
  this.currentStep = step;
  this.dx = Math.cos(rad) * speed;
  this.dy = Math.sin(rad) * speed;
}

LineMove.prototype = {
  start: function (self, x, y) {
    self.moveEnd = false;
    self.step = this.step;
    if (self.xrev) {
      self.charRad = PI - (this.rad - PI / 2);
    } else {
      self.charRad = this.rad - PI / 2;
    }
  },
  move: function (self) {
    if (self.moveEnd) {
      return;
    }
    if (self.xrev) {
      self.x -= this.dx;
    } else {
      self.x += this.dx;
    }
    self.y += this.dy;
    self.step--;
    if (!self.step) {
      self.moveEnd = true;
    }

  }
}

/// 円運動
function CircleMove(startRad, stopRad, r, speed, left) {
  this.startRad = startRad || 0;
  this.stopRad = stopRad || 0;
  this.r = r || 0;
  this.speed = speed || 0;
  this.left = !left ? false : true;
  this.deltas = [];
  var rad = this.startRad;
  var step = (left ? 1 : -1) * speed / r;
  var end = false;
  while (!end) {
    rad += step;
    if ((left && (rad >= this.stopRad)) || (!left && rad <= this.stopRad)) {
      rad = this.stopRad;
      end = true;
    }
    this.deltas.push({
      x: this.r * Math.cos(rad),
      y: this.r * Math.sin(rad),
      rad: rad
    });
  }
};

CircleMove.prototype = {
  start: function (self, x, y) {
    self.moveEnd = false;
    self.step = 0;
    if (self.xrev) {
      self.sx = x - this.r * Math.cos(this.startRad + Math.PI);
    } else {
      self.sx = x - this.r * Math.cos(this.startRad);
    }
    self.sy = y - this.r * Math.sin(this.startRad);
    self.z = 0.0;
    return true;
  },
  move: function (self) {
    if (self.moveEnd) {
      return;
    }
    var delta = this.deltas[self.step];

    self.x = self.sx + (self.xrev?delta.x * -1:delta.x);
    self.y = self.sy + delta.y;
    if (self.xrev) {
      self.charRad = (Math.PI - delta.rad) + (this.left ? -1 : 0) * Math.PI;
    } else {
      self.charRad = delta.rad + (this.left ? 0 : -1) * Math.PI;
    }
    self.rad = delta.rad;
    self.step++;
    if (self.step >= this.deltas.length) {
      self.step--;
      self.moveEnd = true;
    }
  }
};

/// ホームポジションに戻る
export function GotoHome() {

}

GotoHome.prototype = {
  start: function (self, x, y) {
    var rad = Math.atan2(self.homeY - self.y, self.homeX - self.x);
    self.charRad = rad - Math.PI / 2;
    self.rad = rad;
    self.speed = 4;
    self.dx = Math.cos(self.rad) * self.speed;
    self.dy = Math.sin(self.rad) * self.speed;
    self.moveEnd = false;
    self.z = 0.0;
    return true;
  },
  move: function (self) {
    if (self.moveEnd) { return; }
    if (Math.abs(self.x - self.homeX) < 2 && Math.abs(self.y - self.homeY) < 2) {
      self.charRad = 0;
      self.rad = Math.PI;
      self.x = self.homeX;
      self.y = self.homeY;
      self.moveEnd = true;
      if (self.status == self.START) {
        var groupID = self.groupID;
        var groupData = self.enemies.groupData;
        groupData[groupID].push(self);
        self.enemies.homeEnemiesCount++;
      }
      self.status = self.HOME;
      return;
    }
    self.x += self.dx;
    self.y += self.dy;
  }
}

///
export function HomeMove(){};
HomeMove.prototype = 
{
  CENTER_X:0,
  CENTER_Y:100,
  start: function (self, x, y) {
    self.dx = self.homeX - this.CENTER_X;
    self.dy = self.homeY - this.CENTER_Y;
    self.moveEnd = false;
    self.z = -0.1;
    return true;
  },
  move: function (self) {
    if (self.moveEnd) { return; }
    if (self.status == self.ATTACK) {
      self.moveEnd = true;
      self.mesh.scale.x = 1.0;
      self.z = 0.0;
      return;
    }
    self.x =  self.homeX + self.dx * self.enemies.homeDelta;
    self.y = self.homeY + self.dy * self.enemies.homeDelta;
    self.mesh.scale.x = self.enemies.homeDelta2;
  }
}

/// 指定シーケンスに移動する
export function Goto(pos) { this.pos = pos; };
Goto.prototype =
{
  start: function (self, x, y) {
    self.index = this.pos - 1;
    return false;
  },
  move: function (self) {
  }
}

/// 敵弾発射
export function Fire() {
}

Fire.prototype = {
  start: function (self, x, y) {
    let d = (sfg.stage.no / 20) * ( sfg.stage.difficulty);
    if (d > 1) { d = 1.0;}
    if (Math.random() < d) {
      self.enemies.enemyBullets.start(self.x, self.y);
      self.moveEnd = true;
    }
    return false;
  },
  move: function (self) {
    if (self.moveEnd) { return; }
  }
}

/// 敵本体
export function Enemy(enemies,scene,se) {
  gameobj.GameObj.call(this, 0, 0, 0);
  this.collisionArea.width = 12;
  this.collisionArea.height = 8;
  var tex = sfg.textureFiles.enemy;
  var material = graphics.createSpriteMaterial(tex);
  var geometry = graphics.createSpriteGeometry(16);
  graphics.createSpriteUV(geometry, tex, 16, 16, 0);
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

Enemy.prototype = {
  get x() { return this.x_; },
  set x(v) { this.x_ = this.mesh.position.x = v; },
  get y() { return this.y_; },
  set y(v) { this.y_ = this.mesh.position.y = v; },
  get z() { return this.z_; },
  set z(v) { this.z_ = this.mesh.position.z = v; },
  ///敵の動き
  move: function (taskIndex) {
    if (this.status == this.NONE)
    {
      debugger;
    }
    var end = false;
    while (!end) {
      if (this.moveEnd && this.index < (this.mvPattern.length - 1)) {
        this.index++;
        this.mv = this.mvPattern[this.index];
        end = this.mv.start(this, this.x, this.y);
      } else {
        break;
      }
    }
    this.mv.move(this);
    this.mesh.scale.x = this.enemies.homeDelta2;
    this.mesh.rotation.z = this.charRad;
  },
  /// 初期化
  start: function (x, y, z, homeX, homeY, mvPattern, xrev,type, clearTarget,groupID) {
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
    this.mv = mvPattern[0];
    this.mv.start(this, x, y);
    //if (this.status != this.NONE) {
    //  debugger;
    //}
    this.status = this.START;
    var self = this;
    this.task = sfg.tasks.pushTask(function (i) { self.move(i); }, 10000);
    this.mesh.visible = true;
    return true;
  },
  hit: function () {
    if (this.hit_ == null) {
      this.life--;
      if (this.life == 0) {
//        this.enable_ = false;
        sfg.bombs.start(this.x, this.y);
        this.se(1);
//        sequencer.playTracks(soundEffects.soundEffects[1]);
        sfg.addScore(this.score);
        if (this.clearTarget) {
          this.enemies.hitEnemiesCount++;
          if (this.status == this.START) {
            this.enemies.homeEnemiesCount++;
            this.enemies.groupData[this.groupID].push(this);
          }
          this.enemies.groupData[this.groupID].goneCount++;
        }
        this.mesh.visible = false;
        this.enable_ = false;
        this.status = this.NONE;
        sfg.tasks.removeTask(this.task.index);
      } else {
        this.se(2);
//        sequencer.playTracks(soundEffects.soundEffects[2]);
        this.mesh.material.color.setHex(0xFF8080);
        //        this.mesh.material.needsUpdate = true;
      }
    } else {
      this.hit_();
    }
  },
  NONE: 0 | 0,
  START: 1 | 0,
  HOME: 2 | 0,
  ATTACK: 3 | 0,
  BOMB: 4 | 0
}

function Zako(self) {
  self.score = 50;
  self.life = 1;
  graphics.updateSpriteUV(self.mesh.geometry, sfg.textureFiles.enemy, 16, 16, 7);
}

function Zako1(self) {
  self.score = 100;
  self.life = 1;
  graphics.updateSpriteUV(self.mesh.geometry, sfg.textureFiles.enemy, 16, 16, 6);
}

function MBoss(self) {
  self.score = 300;
  self.life = 2;
  self.mesh.blending = THREE.NormalBlending;
  graphics.updateSpriteUV(self.mesh.geometry, sfg.textureFiles.enemy, 16, 16, 4);
}

export function Enemies(scene,se,enemyBullets) {
  this.enemyBullets = enemyBullets;
  this.scene = scene;
  this.nextTime = 0;
  this.currentIndex = 0;
  this.enemies = new Array(0);
  for (var i = 0; i < 64; ++i) {
    this.enemies.push(new Enemy(this,scene,se));
  }
  for(var i = 0;i < 5;++i){
    this.groupData[i] = new Array(0);
  }
};

/// 敵編隊の動きをコントロールする
Enemies.prototype.move = function () {
  var currentTime = sfg.gameTimer.elapsedTime;
  var moveSeqs = this.moveSeqs;
  var len = moveSeqs[sfg.stage.privateNo].length;
  // データ配列をもとに敵を生成
  while (this.currentIndex < len) {
    var data = moveSeqs[sfg.stage.privateNo][this.currentIndex];
    var nextTime = this.nextTime != null ? this.nextTime : data[0];
    if (currentTime >= (this.nextTime + data[0])) {
      var enemies = this.enemies;
      for (var i = 0, e = enemies.length; i < e; ++i) {
        var enemy = enemies[i];
        if (!enemy.enable_) {
          enemy.start(data[1], data[2], 0, data[3], data[4], this.movePatterns[Math.abs(data[5])],data[5] < 0, data[6], data[7],data[8] || 0);
          break;
        }
      }
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
    this.endTime = sfg.gameTimer.elapsedTime + 1.0 * (2.0 - sfg.stage.difficulty);
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

Enemies.prototype.reset = function () {
  for (var i = 0, end = this.enemies.length; i < end; ++i) {
    var en = this.enemies[i];
    if (en.enable_)
    {
      sfg.tasks.removeTask(en.task.index);
      en.status = en.NONE;
      en.enable_ = false;
      en.mesh.visible = false;
    }
  }
}

Enemies.prototype.calcEnemiesCount = function () {
  var seqs = this.moveSeqs[sfg.stage.privateNo];
  this.totalEnemiesCount = 0;
  for (var i = 0, end = seqs.length; i < end; ++i) {
    if (seqs[i][7]) {
      this.totalEnemiesCount++;
    }
  }
}

Enemies.prototype.start = function () {
  this.nextTime = 0;
  this.currentIndex = 0;
  this.totalEnemiesCount = 0;
  this.hitEnemiesCount = 0;
  this.homeEnemiesCount = 0;
  this.status = this.START;
  var groupData = this.groupData;
  for (var i = 0, end = groupData.length; i < end ; ++i) {
    groupData[i].length = 0;
    groupData[i].goneCount = 0;
  }
}

Enemies.prototype.movePatterns = [
  // 0
  [
    new CircleMove(Math.PI, 1.125 * Math.PI, 300, 3, true),
    new CircleMove(1.125 * Math.PI, 1.25 * Math.PI, 200, 3, true),
    new Fire(),
    new CircleMove(Math.PI / 4, -3 * Math.PI, 40, 5, false),
    new GotoHome(),
    new HomeMove(),
    new CircleMove(Math.PI,0,10,3,false),
    new CircleMove(0,-0.125 * Math.PI,200,3,false),
    new Fire(),
    new CircleMove(-0.125 * Math.PI, -0.25 * Math.PI, 150, 2.5, false),
    new CircleMove(3 * Math.PI / 4,4 * Math.PI,40,2.5,true),
    new Goto(4)
],// 1
  [
    new CircleMove(Math.PI, 1.125 * Math.PI, 300, 5, true),
    new CircleMove(1.125 * Math.PI, 1.25 * Math.PI, 200, 5, true),
    new Fire(),
    new CircleMove(Math.PI / 4, -3 * Math.PI, 40, 6, false),
    new GotoHome(),
    new HomeMove(),
    new CircleMove(Math.PI,0,10,3,false),
    new CircleMove(0,-0.125 * Math.PI,200,3,false),
    new Fire(),
    new CircleMove(-0.125 * Math.PI, -0.25 * Math.PI, 250, 3, false),
    new CircleMove(3 * Math.PI / 4, 4 * Math.PI, 40, 3, true),
    new Goto(4)
  ],// 2
  [
    new CircleMove(0, -0.125 * Math.PI, 300, 3, false),
    new CircleMove(-0.125 * Math.PI, -0.25 * Math.PI, 200, 3, false),
    new Fire(),
    new CircleMove(3 * Math.PI / 4, (2 + 0.25) * Math.PI, 40, 5, true),
    new GotoHome(),
    new HomeMove(),
    new CircleMove(0,Math.PI,10,3,true),
    new CircleMove( Math.PI, 1.125 * Math.PI, 200, 3, true),
    new Fire(),
    new CircleMove(1.125 * Math.PI, 1.25 * Math.PI, 150, 2.5, true),
    new CircleMove(0.25 * Math.PI,-3 * Math.PI,40,2.5,false),
    new Goto(4)
  ],// 3
  [
    new CircleMove(0, -0.125 * Math.PI, 300, 5, false),
    new CircleMove(-0.125 * Math.PI, -0.25 * Math.PI, 200, 5, false),
    new Fire(),
    new CircleMove(3 * Math.PI / 4, (4 + 0.25) * Math.PI, 40, 6, true),
    new Fire(),
    new GotoHome(),
    new HomeMove(),
    new CircleMove(0,Math.PI,10,3,true),
    new CircleMove( Math.PI, 1.125 * Math.PI, 200, 3, true),
    new Fire(),
    new CircleMove(1.125 * Math.PI, 1.25 * Math.PI, 150, 3, true),
    new CircleMove(0.25 * Math.PI,-3 * Math.PI,40,3,false),
    new Goto(4)
  ],
  [ // 4
    new CircleMove(0, -0.25 * Math.PI, 176, 4, false),
    new CircleMove(0.75 * Math.PI, Math.PI, 112, 4, true),
    new CircleMove(Math.PI, 3.125 * Math.PI, 64, 4, true),
    new GotoHome(),
    new HomeMove(),
    new CircleMove(0, 0.125 * Math.PI, 250, 3, true),
    new CircleMove(0.125 * Math.PI, Math.PI, 80, 3, true),
    new Fire(),
    new CircleMove(Math.PI, 1.75 * Math.PI, 50, 3, true),
    new CircleMove(0.75 * Math.PI, 0.5 * Math.PI, 100, 3, false),
    new CircleMove(0.5 * Math.PI, -2 * Math.PI, 20, 3, false),
    new Goto(3)
  ],
  [// 5
    new CircleMove(0, -0.125 * Math.PI, 300, 3, false),
    new CircleMove(-0.125 * Math.PI, -0.25 * Math.PI, 200, 3, false),
    new CircleMove(3 * Math.PI / 4, (3) * Math.PI, 40, 5, true),
    new GotoHome(),
    new HomeMove(),
    new CircleMove(Math.PI, 0.875 * Math.PI, 250, 3, false),
    new CircleMove(0.875 * Math.PI, 0, 80, 3, false),
    new Fire(),
    new CircleMove(0, -0.75 * Math.PI, 50, 3, false),
    new CircleMove(0.25 * Math.PI, 0.5 * Math.PI, 100, 3, true),
    new CircleMove(0.5 * Math.PI, 3 * Math.PI, 20, 3, true),
    new Goto(3)
  ],
  [ // 6 ///////////////////////
    new CircleMove(1.5 * Math.PI, Math.PI, 96, 4, false),
    new CircleMove(0, 2 * Math.PI, 48, 4, true),
    new CircleMove(Math.PI, 0.75 * Math.PI, 32, 4, false),
    new GotoHome(),
    new HomeMove(),
    new CircleMove(Math.PI,0,10,3,false),
    new CircleMove(0,-0.125 * Math.PI,200,3,false),
    new Fire(),
    new CircleMove(-0.125 * Math.PI, -0.25 * Math.PI, 150, 2.5, false),
    new CircleMove(3 * Math.PI / 4,4 * Math.PI,40,2.5,true),
    new Goto(3)
  ],
  [ // 7 ///////////////////
    new CircleMove(0, -0.25 * Math.PI, 176, 4, false),
    new Fire(),
    new CircleMove(0.75 * Math.PI, Math.PI, 112, 4, true),
    new CircleMove(Math.PI, 2.125 * Math.PI, 48, 4, true),
    new CircleMove(1.125 * Math.PI,  Math.PI, 48, 4, false),
    new GotoHome(),
    new HomeMove(),
    new CircleMove(Math.PI, 0, 10, 3, false),
    new Fire(),
    new CircleMove(0, -0.125 * Math.PI, 200, 3, false),
    new CircleMove(-0.125 * Math.PI, -0.25 * Math.PI, 150, 2.5, false),
    new CircleMove(3 * Math.PI / 4, 4 * Math.PI, 40, 2.5, true),
    new Goto(5)
  ]
]
;
Enemies.prototype.moveSeqs = [
  [
    // *** STAGE 1 *** //
    [0.8, 56, 176, 75, 40, 7, Zako, true],
    [0.08, 56, 176, 35, 40, 7, Zako, true],
    [0.08, 56, 176, 55, 40, 7, Zako, true],
    [0.08, 56, 176, 15, 40, 7, Zako, true],
    [0.08, 56, 176, 75, -120, 4, Zako, true],

    [0.8, -56, 176, -75, 40, -7, Zako, true],
    [0.08, -56, 176, -35, 40, -7, Zako, true],
    [0.08, -56, 176, -55, 40, -7, Zako, true],
    [0.08, -56, 176, -15, 40, -7, Zako, true],
    [0.08, -56, 176, -75, -120, -4, Zako, true],

    [0.8, 128, -128, 75, 60, 6, Zako, true],
    [0.08, 128, -128, 35, 60, 6, Zako, true],
    [0.08, 128, -128, 55, 60, 6, Zako, true],
    [0.08, 128, -128, 15, 60, 6, Zako, true],
    [0.08, 128, -128, 95, 60, 6, Zako, true],

    [0.8, -128, -128, -75, 60, -6, Zako, true],
    [0.08, -128, -128, -35, 60, -6, Zako, true],
    [0.08, -128, -128, -55, 60, -6, Zako, true],
    [0.08, -128, -128, -15, 60, -6, Zako, true],
    [0.08, -128, -128, -95, 60, -6, Zako, true],

    [0.7, 0, 176, 75, 80, 1, Zako1, true],
    [0.05, 0, 176, 35, 80, 1, Zako1, true],
    [0.05, 0, 176, 55, 80, 1, Zako1, true],
    [0.05, 0, 176, 15, 80, 1, Zako1, true],
    [0.05, 0, 176, 95, 80, 1, Zako1, true],

    [0.7, 0, 176, -75, 80, 3, Zako1, true],
    [0.05, 0, 176, -35, 80, 3, Zako1, true],
    [0.05, 0, 176, -55, 80, 3, Zako1, true],
    [0.05, 0, 176, -15, 80, 3, Zako1, true],
    [0.05, 0, 176, -95, 80, 3, Zako1, true],

    [0.7, 0, 176, 85, 120, 1, MBoss, true,1],
    [0.05, 0, 176, 95, 100, 1, Zako1, true,1],
    [0.05, 0, 176, 75, 100, 1, Zako1, true,1],
    [0.05, 0, 176, 45, 120, 1, MBoss, true,2],
    [0.05, 0, 176, 55, 100, 1, Zako1, true,2],
    [0.05, 0, 176, 35, 100, 1, Zako1, true,2],
    [0.05, 0, 176, 65, 120, 1, MBoss, true],
    [0.05, 0, 176, 15, 100, 1, Zako1, true],
    [0.05, 0, 176, 25, 120, 1, MBoss, true],

    [0.8, 0, 176, -85, 120, 3, MBoss, true,3],
    [0.05, 0, 176, -95, 100, 3, Zako1, true,3],
    [0.05, 0, 176, -75, 100, 3, Zako1, true,3],
    [0.05, 0, 176, -45, 120, 3, MBoss, true,4],
    [0.05, 0, 176, -55, 100, 3, Zako1, true,4],
    [0.05, 0, 176, -35, 100, 3, Zako1, true,4],
    [0.05, 0, 176, -65, 120, 3, MBoss, true],
    [0.05, 0, 176, -15, 100, 3, Zako1, true],
    [0.05, 0, 176, -25, 120, 3, MBoss, true]
  ]
];

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

