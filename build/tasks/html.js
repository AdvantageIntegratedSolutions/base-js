var gulp = require('gulp');
var paths = require('../paths');

gulp.task('html-test', function() {
  return gulp.src(paths.html)
    .pipe(gulp.dest(paths.tmp));
});