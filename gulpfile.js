var gulp       = require('gulp');
var uglify     = require('gulp-uglify');
var rename     = require('gulp-rename');
var del        = require('del');
var sourcemaps = require('gulp-sourcemaps');
var browserify = require('gulp-browserify');
var view = require('./view');

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
    return gulp.src(['src/build.js'])
        .pipe(browserify())
        .pipe(rename('jquery.control.js'))
        .pipe(gulp.dest('dist'))
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(rename({extname:'.min.js'}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist'));
});

gulp.task('watcher', function(){
    gulp.watch(['src/**/*.js'],gulp.series(['build','examples','views']));
    gulp.watch(['examples/templates/**/*.*'],gulp.series(['views']));
});

gulp.task('default',gulp.series(['del','build']));