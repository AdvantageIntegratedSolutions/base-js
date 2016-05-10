var gulp = require('gulp');
var paths = require('../paths');
var app = require('../../package');
var s3 = require('gulp-s3-upload')({});

function logMessage(fileName, update){
	console.log("================================================");
	console.log(`Version ${app.version} of BaseJS has been ${update ? "updated" : "deployed"}.`);
	console.log(`URL: https://s3.amazonaws.com/${paths.s3}/${app.version}/${fileName}`);
	console.log("================================================");
};

gulp.task("s3-upload", ["js-deploy"], function() {
  gulp.src(`${paths.output}/${app.version}/**`)
  	.pipe(s3({ 
  		Bucket: `${paths.s3}/${app.version}`, 
  		ACL: 'public-read',
			onChange: function(fileName){ 
				if(fileName=="base.min.js"){ 
					logMessage(fileName, true);
				} 
			},
  		onNew: function(fileName){
  			if(fileName=="base.min.js"){ 
  				logMessage(fileName, false);
  			} 
  		}},
  		{ maxRetries: 5 }));
});