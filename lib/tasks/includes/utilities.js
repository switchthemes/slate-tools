'use strict';

var gutil = require('gulp-util');
var fs = require('fs');
var _ = require('lodash');
var Promise = require('bluebird');

/**
 * Utility and reusable functions used by our Gulp Tasks
 *
 * @summary a set of utility functions used within the gulp tasks of slate-cli
 * @namespace slate-cli.utilities
 * @memberof slate-cli
 */
var utilities = {

  /**
   * Generic error handler for streams called in `watch` tasks (used by gulp-plumber)
   *
   * @memberof slate-cli.utilities
   * @param {Error} err
   */
  errorHandler: function errorHandler(err) {
    // eslint-disable-line babel/object-shorthand
    gutil.log(gutil.colors.red(err));
    this.emit('end');
  },

  /**
   * Executes an array of promises in series
   *
   * @param promiseArrayFactory {Function} - an array of promise factories
   * @returns {Promise} - promise.all() style array of results from each promise
   */
  promiseSeries: function promiseSeries(promiseArrayFactory) {
    var results = [];

    return Promise.each(promiseArrayFactory, function (factory) {
      var result = factory();
      results.push(result);
      return result;
    }).thenReturn(results).all();
  },

  /**
   * Checks whether the path is a directory
   *
   * @param path {String} - a string representing the path to a file
   * @returns {boolean}
   */
  isDirectory: function isDirectory(path) {
    try {
      // eslint-disable-next-line no-sync
      return fs.statSync(path).isDirectory();
    } catch (error) {
      return false;
    }
  },

  /**
   * Function passed to cheerio.run - adds aria tags & other accessibility
   * based information to each svg element's markup...
   *
   * @memberof slate-cli.utilities
   * @param {Function} $ - jQuery reference
   * @param {fs} file - reference to current icon file?
   */
  processSvg: function processSvg($, file) {
    var $svg = $('svg'); // eslint-disable-line no-var
    var $newSvg = $('<svg aria-hidden="true" focusable="false" role="presentation" class="icon" />'); // eslint-disable-line no-var
    var fileName = file.relative.replace('.svg', ''); // eslint-disable-line no-var
    var viewBoxAttr = $svg.attr('viewbox'); // eslint-disable-line no-var

    // Add necessary attributes
    if (viewBoxAttr) {
      var width = parseInt(viewBoxAttr.split(' ')[2], 10); // eslint-disable-line no-var
      var height = parseInt(viewBoxAttr.split(' ')[3], 10); // eslint-disable-line no-var
      var widthToHeightRatio = width / height; // eslint-disable-line no-var
      if (widthToHeightRatio >= 1.5) {
        $newSvg.addClass('icon--wide');
      }
      $newSvg.attr('viewBox', viewBoxAttr);
    }

    // Add required classes to full color icons
    if (file.relative.indexOf('-full-color') >= 0) {
      $newSvg.addClass('icon--full-color');
    }

    $newSvg.addClass(fileName).append($svg.contents());

    $newSvg.append($svg.contents());
    $svg.after($newSvg);
    $svg.remove();
  },

  /**
   * Factory for creating an event cache - used with a short debounce to batch any
   * file changes that occur in rapid succession during Watch tasks.
   *
   * @memberof slate-cli.utilities
   * @param {Object} options
   * @returns {eventCache} see type definition for more robust documentation
   */
  createEventCache: function createEventCache(options) {
    _.defaults(options = options || {}, { // eslint-disable-line no-param-reassign
      changeEvents: ['add', 'change'],
      unlinkEvents: ['unlink']
    });

    /**
     * A cache object used for caching `[chokidar]{@link https://github.com/paulmillr/chokidar}`
     * events - used with a short `debounce` to batch any file changes that occur in rapid
     * succession during Watch tasks.
     *
     * @typedef {Object} eventCache
     * @prop {Array} change - an array for caching `add` and `change` events
     * @prop {Array} unlink - an array for caching `unlink` events
     * @prop {Function} addEvent - a function to push events to the appropriate `cache` array
     */
    return {
      change: [],
      unlink: [],

      /**
       * Pushes events to upload & remove caches for later batch deployment
       *
       * @function addEvent
       * @memberof eventCache
       * @param {String} event - chokidar event type - only cares about `(add|change|unlink)`
       * @param {String} path - relative path to file passed via event
       */
      addEvent: function addEvent(event, path) {
        var _this = this;

        // eslint-disable-line babel/object-shorthand
        _.each(options.changeEvents, function (eventType) {
          if (event === eventType) {
            _this.change.push(path);
          }
        });

        _.each(options.unlinkEvents, function (eventType) {
          if (event === eventType) {
            _this.unlink.push(path);
          }
        });
      }
    };
  },

  /**
   * Debounced (320ms) delegator function passing an {@link eventCache} object
   * through to a pair of custom functions for processing batch add/change or unlink events.
   * Clears the appropriate cache array after a change/delete function has been
   * called.
   *
   * Example:
   * ```javascript
   *   // TODO:
   * ```
   *
   * @memberof slate-cli.utilities
   * @method
   * @param {eventCache} cache - a specific cache object for tracking file events
   * @param {Function} changeFn - a custom function to process the set of files that have changed
   * @param {Function} delFn - a custom function to remove the set of files that have changed from the `dist` directory
   */
  processCache: _.debounce(function (cache, changeFn, delFn) {
    if (cache.change.length) {
      changeFn(cache.change);
      cache.change = [];
    }

    if (cache.unlink.length) {
      delFn(cache.unlink);
      cache.unlink = [];
    }
  }, 320)
};

module.exports = utilities;