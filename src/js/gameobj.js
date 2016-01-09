"use strict";

export function CollisionArea(offsetX, offsetY, width, height) {
  this.offsetX = offsetX || 0;
  this.offsetY = offsetY || 0;
  this.top = 0;
  this.bottom = 0;
  this.left = 0;
  this.right = 0;
  this.width = width || 0;
  this.height = height || 0;
}

CollisionArea.prototype = {
  width_: 0,
  height_: 0,
  get width() { return width_; },
  set width(v) {
    this.width_ = v;
    this.left = this.offsetX - v / 2;
    this.right = this.offsetX + v / 2;
  },
  get height() { return height_; },
  set height(v) {
    this.height_ = v;
    this.top = this.offsetY + v / 2;
    this.bottom = this.offsetY - v / 2;
  }
}

export function GameObj(x, y, z) {
  this.x_ = x || 0;
  this.y_ = y || 0;
  this.z_ = z || 0.0;
  this.enable_ = false;
  this.width = 0;
  this.height = 0;
  this.collisionArea = new CollisionArea();
}

GameObj.prototype = {
  get x() { return this.x_; },
  set x(v) { this.x_ = v; },
  get y() { return this.y_; },
  set y(v) { this.y_ = v; },
  get z() { return this.z_; },
  set z(v) { this.z_ = v; }
}
