//var sourcemaps = require('gulp-sourcemaps');
//var transpile  = require('gulp-es6-module-transpiler');
var ts = require('gulp-typescript');
var webpack = require('gulp-webpack');
var gutil = require('gulp-util');
var browserify = require('browserify');
const PolymerProject = require('polymer-build').PolymerProject;

var merge = require('gulp-merge');

var gulp  = require('gulp'),
    gutil = require('gulp-util');

// create a default task and just log a message
gulp.task('default', ['build'], function() {
  return gutil.log('Gulp is running!')
});
gulp.task('build', function() {
  let tsSrc = gulp.src('./src/ww-app/view.ts');

const project = new PolymerProject({
  entrypoint: 'index.html',
  shell: 'src/my-app.html',
  fragments: [
    'src/my-view1.html',
    'src/my-view2.html',
    'src/my-view3.html'
  ]
});
//var tsProject = ts.createProject({
//    declaration: true
//});
// var res= tsSrc.pipe(tsProject());

//  jsSrc = merge(jsSrc, res.js);

     let jsThing = tsSrc
       .pipe(webpack(require('./webpack.config.js')));
 })
