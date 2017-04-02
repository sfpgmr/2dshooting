// キー入力
function BasicInput() {
  this.keyCheck = { up: false, down: false, left: false, right: false, z: false ,x:false };
  this.keyBuffer = [];
  this.keyup_ = null;
  this.keydown_ = null;
}

BasicInput.prototype = {
  clear: function()
  {
    var self = this;
    $.each(this.keyCheck, function (index, value) {
      self.keyCheck[index] = false;
    });
    this.keyBuffer.length = 0;
  },
  keydown: function (e) {

    var keyBuffer = this.keyBuffer;
    var keyCheck = this.keyCheck;
    var handle = true;
     
    if (e.keyCode == 192) {
      CHECK_COLLISION = !CHECK_COLLISION;
    };

    if (keyBuffer.length > 16) {
      keyBuffer.shift();
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
  },
  keyup: function (e) {
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
  },
  //イベントにバインドする
  bind:function()
  {
    var self = this;
    this.keydown_ = function (e) { return self.keydown(e); };
    this.keyup_ = function (e) { return self.keyup(e); };
    $(document).keydown(this.keydown_);
    $(document).keyup(this.keyup_);
  },
  // アンバインドする
  unbind:function()
  {
    $(document).unbind('keydown');
    $(document).unbind('keyup');

    //if (this.keydown_ != null) { $(document).unbind('keydown', this.keydown_); }
    //if (this.keyup_ != null) { $(document).unbind('keyup', this.keyup_); }
  }
}