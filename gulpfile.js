var gulp = require('gulp');
var typescript = require('gulp-tsc');
var ava = require('gulp-ava');
var del = require('del');
var dest_test = "build/output_test";
var fs = require('fs');

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