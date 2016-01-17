"use strict";
import * as sfg from './global';

export class DevTool
{
  constructor(global)
  {
    this.global = global;
  }
  
  keydown(e)
  {
    var process = false;
    if (e.keyCode == 192) { // @ Key
      sfg.CHECK_COLLISION = !sfg.CHECK_COLLISION;
      process = true;
    };
    
    if(e.keyCode == 80 /* P */)
    {
      if(!sfg.pause){
        this.global.pause();
      } else {
        this.global.resume();
      }
      process = true;
    }
    
    if(e.keyCode == 88 /* X */ && sfg.DEBUG)
    {
      if(!sfg.pause){
        this.global.pause();
      } else {
        this.global.resume();
      }
      process = true;
    }
    
    return process;
  }
}
