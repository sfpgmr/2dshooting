"use strict";
import {sfg} from './global.js';

// キー入力
export class BasicInput{
constructor () {
  this.keyCheck = { up: false, down: false, left: false, right: false, z: false ,x:false};
  this.keyBuffer = [];
  this.keyup_ = null;
  this.keydown_ = null;
  //this.gamepadCheck = { up: false, down: false, left: false, right: false, z: false ,x:false};
  window.addEventListener('gamepadconnected',(e)=>{
    this.gamepad = e.gamepad;
  });
 
  window.addEventListener('gamepaddisconnected',(e)=>{
    delete this.gamepad;
  }); 
 
 if(window.navigator.getGamepads){
   this.gamepad = window.navigator.getGamepads()[0];
 } 
}

  clear()
  {
    for(var d in this.keyCheck){
      this.keyCheck[d] = false;
    }
    this.keyBuffer.length = 0;
  }
  
  keydown(e) {
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
  
  keyup() {
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
  bind()
  {
    d3.select('body').on('keydown.basicInput',this.keydown.bind(this));
    d3.select('body').on('keyup.basicInput',this.keyup.bind(this));
  }
  // アンバインドする
  unbind()
  {
    d3.select('body').on('keydown.basicInput',null);
    d3.select('body').on('keyup.basicInput',null);
  }
  
  get up() {
    return this.keyCheck.up || (this.gamepad && (this.gamepad.buttons[12].pressed || this.gamepad.axes[1] < -0.1));
  }

  get down() {
    return this.keyCheck.down || (this.gamepad && (this.gamepad.buttons[13].pressed || this.gamepad.axes[1] > 0.1));
  }

  get left() {
    return this.keyCheck.left || (this.gamepad && (this.gamepad.buttons[14].pressed || this.gamepad.axes[0] < -0.1));
  }

  get right() {
    return this.keyCheck.right || (this.gamepad && (this.gamepad.buttons[15].pressed || this.gamepad.axes[0] > 0.1));
  }
  
  get z() {
     let ret = this.keyCheck.z 
    || (((!this.zButton || (this.zButton && !this.zButton) ) && this.gamepad && this.gamepad.buttons[0].pressed)) ;
    this.zButton = this.gamepad && this.gamepad.buttons[0].pressed;
    return ret;
  }
  
  get start() {
    let ret = ((!this.startButton_ || (this.startButton_ && !this.startButton_) ) && this.gamepad && this.gamepad.buttons[9].pressed) ;
    this.startButton_ = this.gamepad && this.gamepad.buttons[9].pressed;
    return ret;
  }
  
  get aButton(){
     let ret = (((!this.aButton_ || (this.aButton_ && !this.aButton_) ) && this.gamepad && this.gamepad.buttons[0].pressed)) ;
    this.aButton_ = this.gamepad && this.gamepad.buttons[0].pressed;
    return ret;
  }
  
  *update(taskIndex)
  {
    while(taskIndex >= 0){
      if(window.navigator.getGamepads){
        this.gamepad = window.navigator.getGamepads()[0];
      } 
      taskIndex = yield;     
    }
  }
}