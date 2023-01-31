const gulp       = require('gulp');
const uglify     = require('gulp-uglify');
const rename     = require('gulp-rename');
const del        = require('del');
const sourcemaps = require('gulp-sourcemaps');

const browserify = require('browserify');
const vinylSource = require('vinyl-source-stream');
const vinylBuffer = require('vinyl-buffer');

gulp.task('del', function(next){
    del.sync(['dist']);
    next()
});

gulp.task('build', function(){
    return browserify(['src/index.js'],{})
        .transform("babelify", {presets: ["@babel/preset-env"]})
        .bundle()
        .pipe(vinylSource('jquery.control.js'))
        .pipe(vinylBuffer())
        .pipe(gulp.dest('dist'))
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(rename({extname:'.min.js'}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist'))
});

gulp.task('watcher', function(){
    gulp.watch(['src/**/*.js'],gulp.series(['build','examples','views']));
});

gulp.task('default',gulp.series(['del','build']));