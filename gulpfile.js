const gulp       = require('gulp');
const uglify     = require('gulp-uglify');
const rename     = require('gulp-rename');
const del        = require('del');
const sourcemaps = require('gulp-sourcemaps');
const view = require('./view');

const browserify = require('browserify');
const vinylSource = require('vinyl-source-stream');
const vinylBuffer = require('vinyl-buffer');

gulp.task('del', function(next){
    del.sync(['dist']);
    next()
});


gulp.task('examples', function(){
    return gulp.src([
        './node_modules/jquery/dist/jquery.js',
        './node_modules/jquery/dist/jquery.min.js',
        './dist/jquery.control.js',
        './dist/jquery.control.min.js',
        './dist/jquery.control.min.js.map'
    ]).pipe(gulp.dest('examples/dist'));
});

gulp.task('views', function(done){
    view('examples/templates','examples/dist/templates.json',done);
});

gulp.task('build', function(){
    return browserify(['src/build.js'],{})
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
    gulp.watch(['examples/templates/**/*.*'],gulp.series(['views']));
});

gulp.task('default',gulp.series(['del','build']));