"use strict";

export function Comm() {
  var host = window.location.hostname.match(/localhost/ig)?'localhost':'www.sfpgmr.net';
  this.enable = false;
  try {
    this.socket = io.connect('http://' + host + ':8081/test');
    this.enable = true;
    var self = this;
    this.socket.on('sendHighScores', (data)=>{
      if(this.updateHighScores){
        this.updateHighScores(data);
      }
    });
    this.socket.on('sendHighScore', (data)=>{
      this.updateHighScore(data);
    });

    this.socket.on('sendRank', (data) => {
      this.updateHighScores(data.highScores);
    });

    this.socket.on('errorConnectionMax', function () {
      alert('同時接続の上限に達しました。');
      self.enable = false;
    });

    this.socket.on('disconnect', function () {
      if (self.enable) {
        self.enable = false;
        alert('サーバー接続が切断されました。');
      }
    });

  } catch (e) {
    alert('Socket.IOが利用できないため、ハイスコア情報が取得できません。' + e);
  }
}

Comm.prototype = {
  sendScore:function(score)
  {
    if (this.enable) {
      this.socket.emit('sendScore', score);
    }
  },
  disconnect:function()
  {
    if (this.enable) {
      this.enable = false;
      this.socket.disconnect();
    }
  }
}
