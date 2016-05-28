var gulp = require('gulp');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var paths = require('../paths');
var app = require('../../package');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');

gulp.task("js-deploy", function(){
  return gulp.src(paths.javascript)
		.pipe(rename("base.min.js"))
		.pipe(sourcemaps.init())
		.pipe(uglify())
		.pipe(sourcemaps.write("/maps"))
		.pipe(gulp.dest(`${paths.output}/${app.version}/`))
});

gulp.task("js-test", function(){
  return gulp.src([paths.javascript, paths.testJavascript])
    .pipe(concat('bundle.js'))
    .pipe(gulp.dest(paths.tmp));
});