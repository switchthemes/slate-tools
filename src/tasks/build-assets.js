const gulp = require('gulp');
const plumber = require('gulp-plumber');
const chokidar = require('chokidar');
const vinylPaths = require('vinyl-paths');
const del = require('del');
const size = require('gulp-size');
const replace = require('gulp-replace');
const fs = require('fs');

const config = require('./includes/config.js');
const utils = require('./includes/utilities.js');
const messages = require('./includes/messages.js');

const assetsPaths = [
  config.src.assets,
  config.src.templates,
  config.src.sections,
  config.src.snippets,
  config.src.locales,
  config.src.config,
  config.src.layout,
  config.src.content,
  config.src.pages,
  config.src.frame,
];

/**
 * Inlines files inside the `/src/inline` directory
 *
 * @param {String} file
 * @returns {Stream}
 * @private
 */

function inlineSnippets(fileName) {
  try {
    const data = fs.readFileSync(`./src/inline/${fileName}.liquid`);
    return data;
  } catch (err) {
    if (err.code === 'ENOENT') {
      return `Inline snippet '${fileName}' not found.`;
    } else {
      throw err;
    }
  }
}

/**
 * Copies assets to the `/dist` directory
 *
 * @param {Array} files
 * @returns {Stream}
 * @private
 */
function processAssets(files) {
  messages.logProcessFiles('build:assets');
  return gulp.src(files, {base: config.src.root})
    .pipe(replace(/\{%-?\n? +inline '([a-z0-9-]+)'(.|\n)+?(?=-?%\})-?%\}/g, (match, p1) => {
      return inlineSnippets(p1);
    }))
    .pipe(plumber(utils.errorHandler))
    .pipe(size({
      showFiles: true,
      pretty: true,
    }))
    .pipe(gulp.dest(config.dist.root));
}

/**
 * Deletes specified files
 *
 * @param {Array} files
 * @returns {Stream}
 * @private
 */
function removeAssets(files) {
  messages.logProcessFiles('remove:assets');

  const mapFiles = files.map((file) => {
    const distFile = file.replace(config.src.root, config.dist.root);
    return distFile;
  });

  return gulp.src(mapFiles)
    .pipe(plumber(utils.errorHandler))
    .pipe(vinylPaths(del))
    .pipe(size({
      showFiles: true,
      pretty: true,
    }));
}

/**
 * Copies assets to the `/dist` directory
 *
 * @function build:assets
 * @memberof slate-cli.tasks.build
 * @static
 */
gulp.task('build:assets', () => {
  return processAssets(assetsPaths);
});

/**
 * Watches assets in the `/src` directory
 *
 * @function watch:assets
 * @memberof slate-cli.tasks.watch
 * @static
 */
gulp.task('watch:assets', () => {
  const eventCache = utils.createEventCache();

  chokidar.watch(assetsPaths, {ignoreInitial: true})
    .on('all', (event, path) => {
      messages.logFileEvent(event, path);
      eventCache.addEvent(event, path);
      utils.processCache(eventCache, processAssets, removeAssets);
    });
});
