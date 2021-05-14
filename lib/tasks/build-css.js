'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');

sass.compiler = require('node-sass');

var cssimport = require('gulp-cssimport');
var extReplace = require('gulp-ext-replace');
var plumber = require('gulp-plumber');
var chokidar = require('chokidar');

var config = require('./includes/config.js');
var utils = require('./includes/utilities.js');
var messages = require('./includes/messages.js');

/**
 * Concatenate css via gulp-cssimport and copys to the `/dist` folder
 *
 * @param {Array} files
 * @returns {Stream}
 * @private
 */
function processCss() {
  messages.logProcessFiles('build:css');

  return gulp.src(config.roots.css).pipe(plumber(utils.errorHandler)).pipe(cssimport()).pipe(extReplace('.css.liquid', '.css')).pipe(gulp.dest(config.dist.assets));
}

/**
 * Process SCSS
 *
 * @param {Array} files
 * @returns {Stream}
 * @private
 */
function processScss() {
  messages.logProcessFiles('build:scss');

  return gulp.src(config.roots.scss).pipe(plumber(utils.errorHandler)).pipe(sass().on('error', sass.logError)).pipe(gulp.dest(config.dist.assets));
}

/**
 * Concatenate css via gulp-cssimport
 *
 * @function build:css
 * @memberof slate-cli.tasks.build
 * @static
 */
gulp.task('build:css', function () {
  return processCss();
});

/**
 * Process SCSS
 *
 * @function build:scss
 * @memberof slate-cli.tasks.build
 * @static
 */
gulp.task('build:scss', function () {
  return processScss();
});

/**
 * Watches css in the `/src` directory
 *
 * @function watch:css
 * @memberof slate-cli.tasks.watch
 * @static
 */
gulp.task('watch:css', function () {
  chokidar.watch(config.src.css, { ignoreInitial: true }).on('all', function (event, path) {
    messages.logFileEvent(event, path);
    processCss();
  });
});

/**
 * Watches SCSS in the `/src` directory
 *
 * @function watch:scss
 * @memberof slate-cli.tasks.watch
 * @static
 */
gulp.task('watch:scss', function () {
  chokidar.watch(config.src.scss, { ignoreInitial: true }).on('all', function (event, path) {
    messages.logFileEvent(event, path);
    processScss();
  });
});