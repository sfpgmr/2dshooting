!function(){
'use strict';
var fs = require('fs');
var gulp = require('gulp');
var logger = require('gulp-logger');
var watch = require('gulp-watch');
var source = require('vinyl-source-stream');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var browserify = require('browserify');
var babelify = require('babelify');
var uglifyify = require('uglifyify');

// JSのビルド
gulp.task('js',function(){
    browserify('./src/js/main.js',{debug:true,extensions: ['.js']})
    .transform(babelify,{"plugins": [
      "transform-es2015-arrow-functions",
      "transform-es2015-block-scoped-functions",
      "transform-es2015-block-scoping",
      "transform-es2015-classes",
      "transform-es2015-computed-properties",
//      "transform-es2015-constants",
      "transform-es2015-destructuring",
      "transform-es2015-for-of",
      "transform-es2015-function-name",
      "transform-es2015-literals",
      "transform-es2015-modules-commonjs",
      "transform-es2015-object-super",
      "transform-es2015-parameters",
      "transform-es2015-shorthand-properties",
      "transform-es2015-spread",
      "transform-es2015-sticky-regex",
      "transform-es2015-template-literals",
      "transform-es2015-typeof-symbol",
      "transform-es2015-unicode-regex"
      ]})
//    .transform({global:true},uglifyify)
    .bundle()
    .on("error", function (err) { console.log("Error : " + err.message); })
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./dist/js'));
    try {
      fs.accessSync('./dist/js/dsp.js');
    } catch (e) {
      if(e.code == 'ENOENT'){
        gulp.src('./src/js/dsp.js').pipe(gulp.dest('./dist/js'));
      }
    }
});

//HTMLのコピー
gulp.task('html',function(){
  gulp.src('./src/html/*.html').pipe(gulp.dest('./dist'));
});

//リソースのコピー
gulp.task('res',function(){
  gulp.src('./src/res/*.*').pipe(gulp.dest('./dist/res'));
});

// devverディレクトリへのコピー
gulp.task('devver',function(){
  var date = new Date();
  var destdir = './devver/' + date.getUTCFullYear() + ('0' + (date.getMonth() + 1)).slice(-2)  + ('0' + date.getDate()).slice(-2);
  
  try {
    fs.mkdir(destdir);
  } catch (e){
    
  }
  
  try {
    fs.mkdir(destdir + '/js');
    fs.mkdir(destdir + '/res');
  } catch (e){
    
  }
  
  gulp.src('./dist/*.html').pipe(gulp.dest(destdir));
  gulp.src('./dist/js/*.js').pipe(gulp.dest(destdir + '/js'));
  gulp.src('./dist/res/*.*').pipe(gulp.dest(destdir + '/res'));
});

// ウォッチ
gulp.task('default',['html','js','res'],function(){
    gulp.watch('./src/js/**/*.js',['js']);
    gulp.watch('./src/html/*.html',['html']); 
    gulp.watch('./src/res/**/*.*',['res']);
});
}();