/// <reference path="../../../scripts/dsp.js" />
/// <reference path="../../../scripts/three/three.js" />
/// <reference path="graphics.js" />
/// <reference path="io.js" />
/// <reference path="song.js" />
/// <reference path="audio.js" />
/// <reference path="text.js" />
/// <reference path="util.js" />
/// <reference path="gameobj.js" />
/// <reference path="enemies.js" />
/// <reference path="effectobj.js" />
/// <reference path="myship.js" />
/// <reference path="game.js" />

/// 自機弾 
function MyBullet() {
  GameObj.call(this, 0, 0, 0);

  this.collisionArea.width = 4;
  this.collisionArea.height = 6;
  this.speed = 8;

  this.textureWidth = textureFiles.myship.texture.image.width;
  this.textureHeight = textureFiles.myship.texture.image.height;

  // メッシュの作成・表示 ///

  var material = createSpriteMaterial(textureFiles.myship.texture);
  var geometry = createSpriteGeometry(16);
  createSpriteUV(geometry, textureFiles.myship.texture, 16, 16, 1);
  this.mesh = new THREE.Mesh(geometry, material);

  this.mesh.position.x = this.x_;
  this.mesh.position.y = this.y_;
  this.mesh.position.z = this.z_;

  sequencer.playTracks(soundEffects.soundEffects[0]);
  scene.add(this.mesh);
  this.mesh.visible = this.enable_ = false;
  var self = this;
  //  tasks.pushTask(function (taskIndex) { self.move(taskIndex); });
}

var myBullets = [];

MyBullet.prototype = {
  get x() { return this.x_; },
  set x(v) { this.x_ = this.mesh.position.x = v; },
  get y() { return this.y_; },
  set y(v) { this.y_ = this.mesh.position.y = v; },
  get z() { return this.z_; },
  set z(v) { this.z_ = this.mesh.position.z = v; },
  move: function (taskIndex) {
    if (!this.enable_) {
      this.mesh.visible = false;
      tasks.removeTask(taskIndex);
      return;
    }

    this.y += this.dy;
    this.x += this.dx;

    if (this.y > (V_TOP + 16) || this.y < (V_BOTTOM - 16) || this.x > (V_RIGHT + 16) || this.x < (V_LEFT - 16)) {
      tasks.removeTask(taskIndex);
      this.enable_ = this.mesh.visible = false;
    };
  },

  start: function (x, y, z, aimRadian) {
    if (this.enable_) {
      return false;
    }
    this.x = x;
    this.y = y;
    this.z = z - 0.1;
    this.dx = Math.cos(aimRadian) * this.speed;
    this.dy = Math.sin(aimRadian) * this.speed;
    this.enable_ = this.mesh.visible = true;
    sequencer.playTracks(soundEffects.soundEffects[0]);
    var self = this;
    tasks.pushTask(function (i) { self.move(i); });
    return true;
  }
}

/// 自機オブジェクト
function MyShip(x, y, z) {
  GameObj.call(this, x, y, z);// extend

  this.collisionArea.width = 6;
  this.collisionArea.height = 8;

  this.textureWidth = textureFiles.myship.texture.image.width;
  this.textureHeight = textureFiles.myship.texture.image.height;

  this.width = 16;
  this.height = 16;

  // 移動範囲を求める
  this.top = (V_TOP - this.height / 2) | 0;
  this.bottom = (V_BOTTOM + this.height / 2) | 0;
  this.left = (V_LEFT + this.width / 2) | 0;
  this.right = (V_RIGHT - this.width / 2) | 0;

  // メッシュの作成・表示
  // マテリアルの作成
  var material = createSpriteMaterial(textureFiles.myship.texture);
  // ジオメトリの作成
  var geometry = createSpriteGeometry(this.width);
  createSpriteUV(geometry, textureFiles.myship.texture, this.width, this.height, 0);

  this.mesh = new THREE.Mesh(geometry, material);

  this.mesh.position.x = this.x_;
  this.mesh.position.y = this.y_;
  this.mesh.position.z = this.z_;
  this.rest = 3;
  this.myBullets = (function () {
    var arr = [];
    for (var i = 0; i < 2; ++i) {
      arr.push(new MyBullet());
    }
    return arr;
  })();
  scene.add(this.mesh);
}


//MyShip.prototype = new GameObj();

MyShip.prototype = {
  get x() { return this.x_; },
  set x(v) { this.x_ = this.mesh.position.x = v; },
  get y() { return this.y_; },
  set y(v) { this.y_ = this.mesh.position.y = v; },
  get z() { return this.z_; },
  set z(v) { this.z_ = this.mesh.position.z = v; },
  shoot: function (aimRadian) {
    for (var i = 0, end = this.myBullets.length; i < end; ++i) {
      if (this.myBullets[i].start(this.x, this.y , this.z,aimRadian)) {
        break;
      }
    }
  },
  action: function () {
    if (basicInput.keyCheck.left) {
      if (this.x > this.left) {
        this.x -= 2;
      }
    }

    if (basicInput.keyCheck.right) {
      if (this.x < this.right) {
        this.x += 2;
      }
    }

    if (basicInput.keyCheck.up) {
      if (this.y < this.top) {
        this.y += 2;
      }
    }

    if (basicInput.keyCheck.down) {
      if (this.y > this.bottom) {
        this.y -= 2;
      }
    }


    if (basicInput.keyCheck.z) {
      basicInput.keyCheck.z = false;
      myShip.shoot(0.5 * Math.PI);
    }

    if (basicInput.keyCheck.x) {
      basicInput.keyCheck.x = false;
      myShip.shoot(1.5 * Math.PI);
    }
  },
  hit: function () {
    this.mesh.visible = false;
    bombs.start(myShip.x, myShip.y, 0.2);
    sequencer.playTracks(soundEffects.soundEffects[4]);
  }

}