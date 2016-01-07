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

/// 爆発

function Bomb() {
  GameObj.call(this, 0, 0, 0);
  var tex = textureFiles.bomb.texture;
  var material = createSpriteMaterial(tex);
  material.blending = THREE.AdditiveBlending;
  material.needsUpdate = true;
  var geometry = createSpriteGeometry(16);
  createSpriteUV(geometry, tex, 16, 16, 0);
  this.mesh = new THREE.Mesh(geometry, material);
  this.mesh.position.z = 0.1;
  this.index = 0;
  this.mesh.visible = false;
  scene.add(this.mesh);
}

Bomb.prototype = {
  get x() { return this.x_; },
  set x(v) { this.x_ = this.mesh.position.x = v; },
  get y() { return this.y_; },
  set y(v) { this.y_ = this.mesh.position.y = v; },
  get z() { return this.z_; },
  set z(v) { this.z_ = this.mesh.position.z = v; },
  start: function (x, y, z, delay) {
    if (this.enable_) {
      return false;
    }
    this.delay = delay | 0;
    this.x = x;
    this.y = y;
    this.z = z | 0.00002;
    this.enable_ = true;
    this.index = 0;
    updateSpriteUV(this.mesh.geometry, textureFiles.bomb.texture, 16, 16, this.index);
    var self = this;
    tasks.pushTask(function (i) { self.move(i); });
    this.mesh.material.opacity = 1.0;
    return true;
  },
  move: function (taskIndex) {
    if (!this.delay) {
      this.mesh.visible = true;
    } else {
      this.delay--;
      return;
    }
    this.index++;
    if (this.index < 7) {
      updateSpriteUV(this.mesh.geometry, textureFiles.bomb.texture, 16, 16, this.index);
    } else {
      this.enable_ = false;
      this.mesh.visible = false;
      tasks.removeTask(taskIndex);
    }

  }
}

function Bombs() {
  this.bombs = new Array(0);
  for (var i = 0; i < 32; ++i) {
    this.bombs.push(new Bomb());
  }
}

Bombs.prototype = {
  start: function (x, y, z) {
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
}
