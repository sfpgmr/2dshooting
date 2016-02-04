"use strict";
import *  as gameobj from './gameobj';
import * as sfg from './global';
import * as graphics from './graphics';

/// 敵弾
export class EnemyBullet extends gameobj.GameObj {
  constructor(scene, se) {
    super(0, 0, 0);
    this.NONE = 0;
    this.MOVE = 1;
    this.BOMB = 2;
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


export class EnemyBullets {
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
}

/// 円運動
class CircleMove {
  constructor(startRad, stopRad, r, speed, left) {
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

  
  *move(self,x,y) {
    // 初期化
    let sx,sy;
    if (self.xrev) {
      sx = x - this.r * Math.cos(this.startRad + Math.PI);
    } else {
      sx = x - this.r * Math.cos(this.startRad);
    }
    sy = y - this.r * Math.sin(this.startRad);

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
}

/// 指定シーケンスに移動する
class Goto {
  constructor(pos) { this.pos = pos; };
  *move(self, x, y) {
    self.index = this.pos - 1;
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
}

/// 敵本体
export class Enemy extends gameobj.GameObj { 
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
      };

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
    if(this.task.index == 0){
      debugger;
    }
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

export class Enemies{
  constructor(scene, se, enemyBullets) {
    this.enemyBullets = enemyBullets;
    this.scene = scene;
    this.nextTime = 0;
    this.currentIndex = 0;
    this.enemies = new Array(0);
    for (var i = 0; i < 64; ++i) {
      this.enemies.push(new Enemy(this, scene, se));
    }
    for (var i = 0; i < 5; ++i) {
      this.groupData[i] = new Array(0);
    }
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
        var enemies = this.enemies;
        for (var i = 0, e = enemies.length; i < e; ++i) {
          var enemy = enemies[i];
          if (!enemy.enable_) {
            enemy.start(data[1], data[2], 0, data[3], data[4], this.movePatterns[Math.abs(data[5])], data[5] < 0, data[6], data[7], data[8] || 0);
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
    new CircleMove(Math.PI, 0, 10, 3, false),
    new CircleMove(0, -0.125 * Math.PI, 200, 3, false),
    new Fire(),
    new CircleMove(-0.125 * Math.PI, -0.25 * Math.PI, 150, 2.5, false),
    new CircleMove(3 * Math.PI / 4, 4 * Math.PI, 40, 2.5, true),
    new Goto(4)
  ],// 1
  [
    new CircleMove(Math.PI, 1.125 * Math.PI, 300, 5, true),
    new CircleMove(1.125 * Math.PI, 1.25 * Math.PI, 200, 5, true),
    new Fire(),
    new CircleMove(Math.PI / 4, -3 * Math.PI, 40, 6, false),
    new GotoHome(),
    new HomeMove(),
    new CircleMove(Math.PI, 0, 10, 3, false),
    new CircleMove(0, -0.125 * Math.PI, 200, 3, false),
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
    new CircleMove(0, Math.PI, 10, 3, true),
    new CircleMove(Math.PI, 1.125 * Math.PI, 200, 3, true),
    new Fire(),
    new CircleMove(1.125 * Math.PI, 1.25 * Math.PI, 150, 2.5, true),
    new CircleMove(0.25 * Math.PI, -3 * Math.PI, 40, 2.5, false),
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
    new CircleMove(0, Math.PI, 10, 3, true),
    new CircleMove(Math.PI, 1.125 * Math.PI, 200, 3, true),
    new Fire(),
    new CircleMove(1.125 * Math.PI, 1.25 * Math.PI, 150, 3, true),
    new CircleMove(0.25 * Math.PI, -3 * Math.PI, 40, 3, false),
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
    new CircleMove(Math.PI, 0, 10, 3, false),
    new CircleMove(0, -0.125 * Math.PI, 200, 3, false),
    new Fire(),
    new CircleMove(-0.125 * Math.PI, -0.25 * Math.PI, 150, 2.5, false),
    new CircleMove(3 * Math.PI / 4, 4 * Math.PI, 40, 2.5, true),
    new Goto(3)
  ],
  [ // 7 ///////////////////
    new CircleMove(0, -0.25 * Math.PI, 176, 4, false),
    new Fire(),
    new CircleMove(0.75 * Math.PI, Math.PI, 112, 4, true),
    new CircleMove(Math.PI, 2.125 * Math.PI, 48, 4, true),
    new CircleMove(1.125 * Math.PI, Math.PI, 48, 4, false),
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
    // interval,start x,start y,home x,home y,move pattern + x反転,clear target,group ID
    [0.8, 56, 176, 75, 40, 7, Zako, true],
    [0.04, 56, 176, 35, 40, 7, Zako, true],
    [0.04, 56, 176, 55, 40, 7, Zako, true],
    [0.04, 56, 176, 15, 40, 7, Zako, true],
    [0.04, 56, 176, 75, -120, 4, Zako, true],

    [0.8, -56, 176, -75, 40, -7, Zako, true],
    [0.04, -56, 176, -35, 40, -7, Zako, true],
    [0.04, -56, 176, -55, 40, -7, Zako, true],
    [0.04, -56, 176, -15, 40, -7, Zako, true],
    [0.04, -56, 176, -75, -120, -4, Zako, true],

    [0.8, 128, -128, 75, 60, 6, Zako, true],
    [0.04, 128, -128, 35, 60, 6, Zako, true],
    [0.04, 128, -128, 55, 60, 6, Zako, true],
    [0.04, 128, -128, 15, 60, 6, Zako, true],
    [0.04, 128, -128, 95, 60, 6, Zako, true],

    [0.8, -128, -128, -75, 60, -6, Zako, true],
    [0.04, -128, -128, -35, 60, -6, Zako, true],
    [0.04, -128, -128, -55, 60, -6, Zako, true],
    [0.04, -128, -128, -15, 60, -6, Zako, true],
    [0.04, -128, -128, -95, 60, -6, Zako, true],

    [0.8, 0, 176, 75, 80, 1, Zako1, true],
    [0.03, 0, 176, 35, 80, 1, Zako1, true],
    [0.03, 0, 176, 55, 80, 1, Zako1, true],
    [0.03, 0, 176, 15, 80, 1, Zako1, true],
    [0.03, 0, 176, 95, 80, 1, Zako1, true],

    [0.8, 0, 176, -75, 80, 3, Zako1, true],
    [0.03, 0, 176, -35, 80, 3, Zako1, true],
    [0.03, 0, 176, -55, 80, 3, Zako1, true],
    [0.03, 0, 176, -15, 80, 3, Zako1, true],
    [0.03, 0, 176, -95, 80, 3, Zako1, true],

    [0.8, 0, 176, 85, 120, 1, MBoss, true, 1],
    [0.03, 0, 176, 95, 100, 1, Zako1, true, 1],
    [0.03, 0, 176, 75, 100, 1, Zako1, true, 1],
    [0.03, 0, 176, 45, 120, 1, MBoss, true, 2],
    [0.03, 0, 176, 55, 100, 1, Zako1, true, 2],
    [0.03, 0, 176, 35, 100, 1, Zako1, true, 2],
    [0.03, 0, 176, 65, 120, 1, MBoss, true],
    [0.03, 0, 176, 15, 100, 1, Zako1, true],
    [0.03, 0, 176, 25, 120, 1, MBoss, true],

    [0.8, 0, 176, -85, 120, 3, MBoss, true, 3],
    [0.03, 0, 176, -95, 100, 3, Zako1, true, 3],
    [0.03, 0, 176, -75, 100, 3, Zako1, true, 3],
    [0.03, 0, 176, -45, 120, 3, MBoss, true, 4],
    [0.03, 0, 176, -55, 100, 3, Zako1, true, 4],
    [0.03, 0, 176, -35, 100, 3, Zako1, true, 4],
    [0.03, 0, 176, -65, 120, 3, MBoss, true],
    [0.03, 0, 176, -15, 100, 3, Zako1, true],
    [0.03, 0, 176, -25, 120, 3, MBoss, true]
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

