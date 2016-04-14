var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var paths = require('../paths');

var htmlTasks = [ 'html-test', browserSync.reload ];
var jsTasks = [ 'js-test', browserSync.reload ];

gulp.task('watch', ['local']);

gulp.task('local', function() {
  gulp.start(['html-test', 'js-test']);

  browserSync.init({
    open: false,
    server: {
      baseDir: paths.tmp
    }
  });

  gulp.watch(paths.html, htmlTasks);
  gulp.watch([paths.javascript, paths.testJavascript], jsTasks);
});