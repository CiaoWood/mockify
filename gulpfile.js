var gulp = require('gulp'),
    less = require('gulp-less'),
    concat = require('gulp-concat'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    watch = require('gulp-watch'),
    minifyCss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    concat =  require('gulp-concat'),
    shell  = require('gulp-shell'),
    livereload = require('gulp-livereload');

// config to hold the path files
var paths = {
  server: [
    'controllers/**/*.js', 'models/**/*.js', 'routes/**/*.js',
    'app.js', 'config.js'
  ],
  client: ['./public/js/**/*.js', '!./public/js/**/*.min.js']
};

// Made the tasks simpler and modular
// so that every task handles a particular build/dev process
// If there is any improvement that you think can help make these tasks simpler
// open an issue at https://github/com/ngenerio/generator-express-simple
// It can be made simpler

// Lint the javascript server files
gulp.task('lintserver', function () {
  gulp
    .src(paths.server)
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'));
});

// Lint the javascript client files
gulp.task('lintclient', function () {
  gulp
    .src(paths.client)
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'));
});

// Uglify the client/frontend javascript files
gulp.task('uglify', function () {
  gulp
    .src(paths.client)
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./public/js'));
});

// Concat the built javascript files from the uglify task with the vendor/lib
// javascript files into one file
// Let's save the users some bandwith
gulp.task('concatJs', function () {
  gulp
    .src([
      './public/vendor/jquery/dist/jquery.min.js',
      './public/vendor/bootstrap/dist/js/bootstrap.min.js',
      './public/js/main.min.js'
    ])
    .pipe(concat('app.min.js'))
    .pipe(gulp.dest('./public/js'));
});

gulp.task('buildCss', function () {
  gulp
    .src('./public/less/**/*.less')
    .pipe(less())
    .pipe(minifyCss())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./public/css'));
});

// Watch the various files and runs their respective tasks
gulp.task('watch', function () {
  gulp.watch(paths.server, ['lintserver']);
  gulp.watch(paths.client, ['lintclient']);
  gulp.watch(paths.client, ['buildJs']);
  gulp.watch('./public/less/**/*.less', ['buildCss']);
  gulp
    .src([
      './views/**/*.html',
      './public/css/**/*.min.css',
      './public/js/**/*.min.js'
    ])
    .pipe(watch())
    .pipe(livereload());
});

gulp.task('_serve', shell.task([
  'nodemon -L --watch . --debug app.js'
]));

gulp.task('lint', ['lintserver', 'lintclient']);
gulp.task('buildJs', ['concatJs', 'uglify']);
gulp.task('default', ['lint', 'buildCss', 'buildJs', 'watch']);
gulp.task('serve', ['_serve']);
