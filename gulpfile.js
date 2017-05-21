var gulp = require('gulp');
var typescript = require('gulp-tsc');
var ava = require('gulp-ava');
var del = require('del');
var dest_test = "build/output_test";
var fs = require('fs');
var lec = require('gulp-line-ending-corrector');
var run = require('gulp-run');

gulp.task('preparePublish', ['crlf'], function(){
  
});

// gulp.task('version', function(){
//   return run('npm version patch').exec();
// });

gulp.task('crlf', function(){
  return gulp.src(['build/output/ks.js'])
    .pipe(lec({verbose:true, eolc: 'LF'}))
});

gulp.task('test',["compile:tests"], function() {
    return gulp.src(dest_test + '/tests/runTests/*.js')
    .pipe(ava({verbose: true}));
});

gulp.task('compile:tests',["clean:test"], function(){
    var tsconfig = JSON.parse(fs.readFileSync('tests/tsconfig.json', 'utf8'));

    tsconfig.compilerOptions.outDir = dest_test;

    return gulp.src(['tests/**/*.ts'])
        .pipe(typescript(tsconfig.compilerOptions))
        .pipe(gulp.dest(dest_test));
});


gulp.task('clean:test', function () {
  return del([
    dest_test + '/**/*'
  ]);
});