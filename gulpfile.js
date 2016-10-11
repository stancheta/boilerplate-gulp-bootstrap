var gulp = require('gulp');
var config = require('./gulp-config.json');
var browserSync = require('browser-sync').create();
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var csso = require('gulp-csso');
var gutil = require('gulp-util');
var imagemin = require('gulp-imagemin');
var inject = require('gulp-inject');
var newer = require('gulp-newer');
var runSequence = require('run-sequence');
var uglify = require('gulp-uglify');

// options for browserSync
var browserSyncConfig = {
  notify: false,
  server: {
    baseDir: "build"
  }
};

var reload = function() {
  browserSync.reload();
};
// deletes the build folder
gulp.task('clean', function() {
  return gulp.src('build', {read: false})
    .pipe(clean());
});

// moves source html to build folder if it changed
gulp.task('index', function() {
  return gulp.src('src/index.html')
    .pipe(newer('build/index.html'))
    .pipe(gulp.dest('build/'));
});

// injects assets into index.html
gulp.task('inject-assets', function() {
  return gulp.src('build/index.html')
    .pipe(inject(gulp.src(['build/**/vendor.min.js',
      'build/**/vendor.min.css'], {read: false}),
      {relative: true, name: 'vendor'}))
    .pipe(inject(gulp.src(['build/**/main.min.js',
      'build/**/main.min.css'], {read: false}),
      {relative: true, name: 'main'}))
    .pipe(gulp.dest('build/'));
});

// moves favicon.ico into build folder if it changed
gulp.task('favicon', function() {
  return gulp.src('src/favicon.ico')
    .pipe(newer('build/favicon.ico'))
    .pipe(gulp.dest('build/'));
});

// moves and minimizes images into build folder if they have changed
gulp.task('img', function() {
  return gulp.src('src/assets/img/**')
    .pipe(newer('build/assets/img'))
    .pipe(imagemin())
    .pipe(gulp.dest('build/assets/img'));
});

// concatinates and minifies vendor css files and places them in build folder
gulp.task('vendorcss', function() {
  return gulp.src(config.paths.vendorcss)
    .pipe(concat('vendor.min.css'))
    .pipe(csso())
    .pipe(gulp.dest('build/assets/css/'))
    .on('error', gutil.log);
});

// moves vendor fonts into build folder
gulp.task('vendorfont', function() {
  return gulp.src(config.paths.vendorfonts)
    .pipe(newer('build/assets/fonts/*'))
    .pipe(gulp.dest('build/assets/fonts/'));
});

// concatinates minified vendor js files and places them in build folder
gulp.task('vendorjs', function() {
  return gulp.src(config.paths.vendorjs)
    .pipe(concat('vendor.min.js'))
    .pipe(gulp.dest('build/assets/js/'))
    .on('error', gutil.log);
});

// concatinates and minifies source css files and places them in build folder
gulp.task('css', function() {
  return gulp.src('src/assets/css/*')
    .pipe(newer('build/assets/css/*'))
    .pipe(concat('main.min.css'))
    .pipe(csso())
    .pipe(gulp.dest('build/assets/css/'))
    .on('error', gutil.log);
});

gulp.task('font', function() {
  return gulp.src('src/assets/fonts/*')
    .pipe(newer('build/assets/fonts/*'))
    .pipe(gulp.dest('build/assets/fonts/'));
});

// concatinates and minifies source js files and places them in build folder
gulp.task('js', function() {
  return gulp.src('src/assets/js/*')
    .pipe(newer('build/assets/js/*'))
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('build/assets/js/'))
    .on('error', gutil.log);
});
// compile from sass to css
gulp.task('sass', function() {
  return gulp.src('src/assets/sass/*')
      .pipe(sass())
      .pipe(gulp.dest('src/assets/css/'))
      .on('error', sass.logError)
});

gulp.task('html-watch', function() {
  runSequence('index', 'inject-assets', reload);
});
gulp.task('js-watch', function() {
  runSequence('js', 'inject-assets', reload);
});
gulp.task('css-watch', function() {
  runSequence('css', 'inject-assets', reload);
});
gulp.task('img-watch', function() {
  runSequence('img', reload);
});
gulp.task('font-watch', function() {
  runSequence('font', reload);
});
gulp.task('sass-watch', function() {
  runSequence('sass', 'css-watch');
});

// serves build folder
gulp.task('serve', function() {
  // Serve files from the root of this project
  browserSync.init(browserSyncConfig);

  gulp.watch('src/assets/sass/*.sass', ['sass-watch']);
  gulp.watch('src/*.html', ['html-watch']);
  gulp.watch('src/assets/js/*.js', ['js-watch']);
  //gulp.watch('src/assets/css/*.css', ['css-watch']);
  gulp.watch('src/assets/img/*', ['img-watch']);
  gulp.watch('src/assets/font/*', ['font-watch']);
});

gulp.task('vendors', ['vendorjs', 'vendorcss', 'vendorfont']);
gulp.task('build', function() {
  return runSequence('clean',
    ['vendors', 'css', 'js', 'index', 'favicon', 'img', 'font'],
    'inject-assets');
});

gulp.task('default', function() {
  return runSequence('build', 'serve');
});
