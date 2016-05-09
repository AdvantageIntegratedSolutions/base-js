var gulp = require('gulp');

gulp.task('deploy', function() {
	gulp.start(['js-deploy', 's3-upload']);
});