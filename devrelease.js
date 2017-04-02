"use strict";
let fs = require('fs');
var dest = './devver/' + process.argv[2];

try {
  fs.mkdirSync(dest);
  fs.mkdirSync(dest + '/res');
  fs.mkdirSync(dest + '/js');
} catch (e) {
  
}

// index.htmlのコピー
var chain = new Promise((resolve,reject)=>{
  fs.createReadStream('./index.html').pipe(fs.createWriteStream(dest + '/index.html')).on("close",resolve);
});

// リソースのコピー
fs.readdirSync('./res').forEach((f)=>{
  if(fs.statSync('./res/' + f).isFile()){
    chain = chain.then(copy.bind(null,'./res/' + f,dest + '/res/' + f));
  }
});

fs.readdirSync('./js').forEach((f)=>{
  if(fs.statSync('./js/' + f).isFile()){
    chain = chain.then(copy.bind(null,'./js/' + f,dest + '/js/' + f));
  }
});

function copy(src, dest) {
  return new Promise((resolve,reject)=>{
    var r = fs.createReadStream(src)
            .on("error",(err)=>{reject(err);}),
        w = fs.createWriteStream(dest)
            .on("error",(err)=>{reject(err);})
            .on("close",()=>{resolve();});
    r.pipe(w);
  });

}