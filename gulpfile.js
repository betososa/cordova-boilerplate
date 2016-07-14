"use strict";

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const browserify = require('browserify');
const watchify = require('watchify');
const hbsfy = require('hbsfy').configure({
  compiler: 'Handlebars'
});
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const del = require('del');
const sass = require('gulp-sass');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const htmlMin = require('gulp-html-minifier');

gulp.task('images', () => {
  return gulp.src('src/images/*')
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    }))
    .pipe(gulp.dest('build/www/img'));
});

// Bundle files with browserify
gulp.task('browserify', () => {
  let bundler = browserify({
    entries: ['src/scripts/index.js'],
    debug: true,
    transform: [hbsfy],
    extensions: ['hbs', 'js'],
  });

  bundler = watchify(bundler);

  const rebundle = () => {
    return bundler.bundle()
      .pipe(source('index.js'))
      .pipe(buffer())
      .pipe(gulp.dest('build/www/js'));
  };

  bundler.on('update', rebundle);
  rebundle();
});

// Compile sass into css
gulp.task('sass', () => {
  gulp.src('src/styles/*.scss')
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('build/www/css'));
});

// html
gulp.task('htmlmin', () => {
  gulp.src('src/index.html')
    .pipe(htmlMin({
      collapseWhitespace: true,
      removeComments: true,
    }))
    .pipe(gulp.dest('build/www'));
})

// Clean output directory and cache
gulp.task('clean', (cb) => {
  del(['build/www']).then(() => {
    $.cache.clearAll(cb);
  });
});


gulp.watch(['src/index.html'], ['htmlmin']);
gulp.watch(['src/scripts/**/*.js'], ['browserify']);
gulp.watch(['src/styles/**/*.scss'], ['sass']);


// Start developing the module
gulp.task('default', ['images', 'htmlmin', 'sass', 'browserify']);
