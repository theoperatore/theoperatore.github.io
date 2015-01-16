(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var v2 = require('pocket-physics/v2');

module.exports = function(pkt) {

  pkt.cmpType("ctx", function(cmp, opts) {

    cmp.cvs = document.querySelector(opts.cvs || "#canvas");
    cmp.cvs.height = document.body.clientHeight;
    cmp.cvs.width = document.body.clientWidth;
    cmp.height = cmp.cvs.height;
    cmp.width = cmp.cvs.width;
    cmp.ctx = cmp.cvs.getContext('2d');
    cmp.center = v2(cmp.cvs.width / 2, cmp.cvs.height / 2);

  })

  pkt.cmpType("keyboard-input", function(cmp, opts) {
    cmp.pressed = {};
    document.addEventListener("keydown", function(ev) {
      cmp.pressed[ev.keyCode] = true;
    }, false);

    document.addEventListener("keyup", function(ev) {
      cmp.pressed[ev.keyCode] = false;
    }, false);

  })

  pkt.cmpType("block", function(cmp, opts) {

    cmp.radius = opts.radius || 5;

  })

  pkt.cmpType("position", function(cmp, opts) {

    cmp.cpos = opts.cpos || v2();
    cmp.ppos = opts.ppos || v2();
    cmp.acel = opts.acel || v2();
    cmp.mass = opts.mass || 2;
    cmp.face = opts.face || "right";

  })

  pkt.cmpType("drag", function(cmp, opts) {

    cmp.damper = opts || 1;

  })

  pkt.cmpType("spring", function(cmp, opts) {

    cmp.stiffness = opts.stiffness || 0.93;
    cmp.damper = opts.damper || 0.93;
    cmp.target = opts.target || { ppos : v2(), cpos : v2(), acel : v2(), mass : 2 };

  })

  pkt.cmpType("constraint", function(cmp, opts) {

    cmp.target = opts.target || { ppos : v2(), cpos : v2(), acel : v2(), mass : 2 };
    cmp.goal = opts.goal || 0.1;

  })

  pkt.cmpType("interpolate", function(cmp, opts) {

    cmp.target = opts.target || { ppos : v2(), cpos : v2(), acel : v2(), mass : 2 };
    cmp.step = opts.step || (1/16);
    cmp.type = opts.type || "linear";

  })

  pkt.cmpType("shake", function(cmp, opts) {

    cmp.strength = opts.strength || 1;
    cmp.damper = opts.damper || 0.1;

  })

  pkt.cmpType("camera", function(cmp, opts) {

    cmp.width = opts.width || 800;
    cmp.height = opts.height || 600;
    cmp.maxWidth = opts.maxWidth || opts.width || 800;
    cmp.maxHeight = opts.maxHeight || opts.height || 600;
    cmp.bound = (opts.bound === undefined) ? true : opts.bound;
    cmp.cullDist = opts.cullDist || 100;

  })
  
}
},{"pocket-physics/v2":16}],2:[function(require,module,exports){
var v2 = require('pocket-physics/v2');

module.exports = function(pkt) {

  pkt.cmpType("shield", function(cmp, opts) {
    cmp.active  = opts.active || false;
    cmp.projectile = opts.projectile || false;
    cmp.face = opts.face || "right";
    cmp.height = opts.height || 20;
    cmp.width = opts.width || 2;
  })
  pkt.cmpType("arrow", function(cmp, opts) {})
  pkt.cmpType("magnet", function(cmp, opts) {})
  pkt.cmpType("hook", function(cmp, opts) {})
  pkt.cmpType("flame", function(cmp, opts) {})


}
},{"pocket-physics/v2":16}],3:[function(require,module,exports){
var Pocket = require('pocket-ces');
var pkt = new Pocket();
var Alea = require('./libs/random');
var rand = Alea(0.5, 0.53);

// components
require('./components/base')(pkt);
require('./components/weapons')(pkt);

// keys
require('./keys/init')(pkt, rand);

// systems
pkt.sysFromObj(require('./systems/input-accel'));
pkt.sysFromObj(require('./systems/input-use'));
pkt.sysFromObj(require('./systems/collision-player-entity'));

// camera systems
pkt.sysFromObj(require('./systems/update-shake'));
pkt.sysFromObj(require('./systems/update-camera'));
pkt.sysFromObj(require('./systems/update-interpolate'));
pkt.sysFromObj(require('./systems/update-camera-constraints'));

// other systems
pkt.sysFromObj(require('./systems/update-constraints'));
pkt.sysFromObj(require('./systems/update-verlet'));

// rendering systems
pkt.sysFromObj(require('./systems/render-clear'));
pkt.sysFromObj(require('./systems/render-player'));
pkt.sysFromObj(require('./systems/render-shield'));
pkt.sysFromObj(require('./systems/render-entities'));

// handling the loop stuff
var anim;
function engage() {
  anim = requestAnimationFrame(engage);
  pkt.tick(1);
};
window.addEventListener('keydown', function(ev) {
  if (ev.keyCode === 27) {
    cancelAnimationFrame(anim);
  } 
}, false);
anim = requestAnimationFrame(engage);

},{"./components/base":1,"./components/weapons":2,"./keys/init":4,"./libs/random":5,"./systems/collision-player-entity":17,"./systems/input-accel":18,"./systems/input-use":19,"./systems/render-clear":20,"./systems/render-entities":21,"./systems/render-player":22,"./systems/render-shield":23,"./systems/update-camera":25,"./systems/update-camera-constraints":24,"./systems/update-constraints":26,"./systems/update-interpolate":27,"./systems/update-shake":28,"./systems/update-verlet":29,"pocket-ces":6}],4:[function(require,module,exports){
var v2 = require('pocket-physics/v2');

module.exports = function(pkt, rand) {

  pkt.key({ 'ctx' : null });
  pkt.key({ 'keyboard-input' : null });
  pkt.key({
    "player-controlled" : null,
    "position" : { cpos : v2(100, 100), ppos : v2(100, 100), mass : 1 },
    "drag" : 0.93
  });

  // camera
  pkt.key({
    "camera" : {
      width : document.body.clientWidth,
      height : document.body.clientHeight,
      maxWidth : 16 * document.body.clientWidth,
      maxHeight : 16 * document.body.clientHeight,
      //maxWidth : 16 * 1440,
      //maxHeight : 16 * 900,
      cullDist : 300,
      bound : true
    },
    "position" : { mass : (3/2) } ,
    "shake" : {
      strength : 1,
      duration : 10
    },

    // 0.3 best for decelerate, 0.8 for cosine, 0.83 for accelerate, 0.84 for smooth
    "drag" : 0.3, 

    // (1 / 16) best, 0.1 for accelerate
    "interpolate" : {
      step : (1 / 8), 
      type : "linear"
    }
  });

  // add simulate block field
  for (var i = 0; i < 1000; i++) {

    var randx = 16 * rand() * document.body.clientWidth;
    var randy = 16 * rand() * document.body.clientHeight;
    var randr = 1 + rand() * 300;

    pkt.key({

      "position" : { cpos : v2(randx, randy), ppos : v2(randx, randy) },
      "block" : { radius : randr }

    })

  }
  
}

  
},{"pocket-physics/v2":16}],5:[function(require,module,exports){
/**
 * Taken from https://github.com/blixt/js-procedural/blob/master/lib/random.js
 * 
 * Creates a pseudo-random value generator. Takes three floating point numbers
 * in the range [0, 1) for seeding the generator.
 *
 * This is an adapted version of Johannes Baagøe's Alea algorithm.
 * https://github.com/nquinlan/better-random-numbers-for-javascript-mirror
 */
function alea(s0, s1) {
  var c = 1;

  var f = function () {
    var t = 2091639 * s0 + c * 2.3283064365386963e-10;
    s0 = s1;
    return s1 = t - (c = t | 0);
  };

  return f;
}

module.exports = alea;
},{}],6:[function(require,module,exports){
module.exports = require('./lib/pocket');
},{"./lib/pocket":7}],7:[function(require,module,exports){
var System = require('./system');

function Pocket() {
  this.componentTypes = {};

  this.systems = [];
  this.components = {};
  this.keys = {};
  this.labels = {};

  this.idCounter = 0;

  this.keysToDestroy = {};

  this.indexedData = this.indexedData.bind(this);
}

Pocket.prototype.nextId = function() {
  return ++this.idCounter;
}

Pocket.prototype.tick = function(dt) {

  // Actually destroy queued keys, to avoid undefined components
  // during the tick in which they are destroyed.
  var self = this;
  Object.keys(this.keysToDestroy).forEach(function(id) {
    self.immediatelyDestroyKey(id);
    delete self.keysToDestroy[id];
  })

  this.dt = dt;

  for (var i = 0; i < this.systems.length; i++) {

    var system = this.systems[i];

    // datas contain all keys that have any of the names, not
    // an intersection.
    var datas = system.requiredComponents.map(this.indexedData)

    // keys is an intersection.
    var keys = this.keysMatching.apply(this, system.requiredComponents);

    // No data matches this system's requirements.
    if (!keys.length && system.requiredComponents.length > 0) continue;

    // Prepare to be used as arguments.
    datas.unshift(keys);
    datas.unshift(this);
    system.action.apply(system, datas);
  }
}

Pocket.prototype.system = function(name, requirements, fn) {
  return this.systems.push(new System(name, requirements, fn));
}

// Allow a system to operate on each individual key instead of the
// collection of keys to save on boilerplate.

Pocket.prototype.systemForEach = function(name, requirements, fn) {
  var action = fn;
  fn = function(pkt, keys) {
    for (var i = 0, args = []; i < arguments.length; i++) args[i] = arguments[i];
    var components = args.slice(0);
    var key;

    for(var i = 0; i < keys.length; i++) {
      key = keys[i];
      args[1] = key;

      for (var j = 2; j < components.length; j++) {
        args[j] = components[j][key];
      }

      action.apply(this, args);
    }
  }

  return this.systems.push(new System(name, requirements, fn));
}

Pocket.prototype.systemFromObject = Pocket.prototype.sysFromObj = function(obj) {
  if (obj.actionEach) return this.systemForEach(obj.name, obj.reqs, obj.actionEach);
  return this.system(obj.name, obj.reqs, obj.action);
}

Pocket.prototype.cmpType =
Pocket.prototype.componentType = function(name, initializer) {
  this.componentTypes[name] = typeof initializer == 'object'
    ? initializer
    : {
      init: initializer,
      dalloc: function() {},
      malloc: function() { return {} }
    };
}

Pocket.prototype.key = function(componentsValues) {

  // if id is passed in and exists, warn and create a new id.
  // if id is passed in and does not exist, use it.

  var id = componentsValues.id
    ? componentsValues.id
    : this.nextId();

  if (componentsValues.id && this.keys[componentsValues.id]) {
    console.warn('discarding component id ' + componentsValues.id);
    id = this.nextId();
  }

  this.keys[id] = id;

  Object.keys(componentsValues).forEach(function(cmpName) {
    this.addComponentTokey(id, cmpName, componentsValues[cmpName]);
  }, this)

  return id;
}

Pocket.prototype.destroyKey = function(id) {
  this.keysToDestroy[id] = true;
}

Pocket.prototype.immediatelyDestroyKey = function(id) {
  var self = this;
  var found = this.keys[id];

  if (!found) {
    throw new Error('key with id ' + id + ' already destroyed');
  }

  delete this.keys[id];

  Object.keys(this.components).forEach(function(name) {
    delete self.components[name][id];
  })
}

Pocket.prototype.addComponentTokey = function(id, componentName, opt_props) {
  var key = this.keys[id];
  if (!key) {
    throw new Error('Could not find key with id "' + id + '"');
  }

  // this.components['verlet-position'][id] = { cpos: ..., ppos: ..., ... }

  var others = this.components[componentName]
    || (this.components[componentName] = {});

  var cmp = others[id];

  if (!cmp) {
    cmp = others[id] = {};

    var componentDef = this.componentTypes[componentName];

    if (componentDef) {
      componentDef.init(cmp, opt_props || {})
    } else if (!this.labels[componentName]) {
      this.labels[componentName] = true;
      console.log('Found no component initializer for '
        + '"' + componentName + '"'
        + ', assuming it is a label.');
    }
  }
}

Pocket.prototype.indexedData = function(name) {
  return this.components[name] || {};
}

Pocket.prototype.firstData = function(name) {
  var data = this.components[name] || {};
  return data[Object.keys(data)[0]];
}

Pocket.prototype.dataFor = function(id, name) {
  return this.components[name][id];
}

Pocket.prototype.firstkey = function(name1, name2, nameN) {
  for (var i = 0, args = []; i < arguments.length; i++) args[i] = arguments[i];
  var keys = this.keysMatching.apply(this, args);
  return keys[0];
}

Pocket.prototype.keysMatching = function(name0, nameN) {

  var matching = [];

  var table0 = this.components[name0];
  if (!table0) return matching;

  var ids = Object.keys(table0);
  for (var i = 0; i < ids.length; i++) {
    var id = ids[i];
    var found = true;
    for (var j = 1; j < arguments.length; j++) {
      var name = arguments[j];
      var tableN = this.components[name];
      if (!tableN || !tableN[id]) {
        found = false;
        break;
      }
    }
    if (found) {
      matching.push(this.keys[id]);
    }
  }

  return matching;
}

module.exports = Pocket;

},{"./system":8}],8:[function(require,module,exports){
function System(name, requiredComponents, action) {
  this.name = name;
  this.action = action;
  this.requiredComponents = requiredComponents;
}

module.exports = System;
},{}],9:[function(require,module,exports){
var v2 = require('./v2');

module.exports = function(cmp, dt) {
  // apply acceleration to current position, convert dt to seconds
  cmp.cpos.x += cmp.acel.x * dt * dt * 0.001;
  cmp.cpos.y += cmp.acel.y * dt * dt * 0.001;

  // reset acceleration
  v2.set(cmp.acel, 0, 0);
}
},{"./v2":16}],10:[function(require,module,exports){
var v2 = require('./v2');
var debug = require('debug')('pocket-physics:distanceconstraint');

module.exports = function solve(p1, p2, goal) {
  var imass1 = 1/(p1.mass || 1);
  var imass2 = 1/(p2.mass || 1);
  var imass = imass1 + imass2

  // Current relative vector
  var delta = v2.sub(v2(), p2.cpos, p1.cpos);
  var deltaMag = v2.magnitude(delta);

  debug('goal', goal)
  debug('delta', delta)

  // Difference between current distance and goal distance
  var diff = (deltaMag - goal) / deltaMag;

  debug('delta mag', v2.magnitude(delta))
  debug('diff', diff)

  // approximate mass
  v2.scale(delta, delta, diff / imass);

  debug('delta diff/imass', delta)

  var p1correction = v2.scale(v2(), delta, imass1);
  var p2correction = v2.scale(v2(), delta, imass2);

  debug('p1correction', p1correction)
  debug('p2correction', p2correction)

  if (p1.mass) v2.add(p1.cpos, p1.cpos, p1correction);
  if (p2.mass) v2.sub(p2.cpos, p2.cpos, p2correction);
}


},{"./v2":16,"debug":13}],11:[function(require,module,exports){

module.exports = function(p1, drag) {
  var x = (p1.ppos.x - p1.cpos.x) * drag;
  var y = (p1.ppos.y - p1.cpos.y) * drag;
  p1.ppos.x = p1.cpos.x + x;
  p1.ppos.y = p1.cpos.y + y;
}
},{}],12:[function(require,module,exports){
var v2 = require('./v2');

module.exports = function(cmp) {
  var x = cmp.cpos.x*2 - cmp.ppos.x
    , y = cmp.cpos.y*2 - cmp.ppos.y;

  v2.set(cmp.ppos, cmp.cpos.x, cmp.cpos.y);
  v2.set(cmp.cpos, x, y);
}
},{"./v2":16}],13:[function(require,module,exports){

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;

/**
 * Use chrome.storage.local if we are in an app
 */

var storage;

if (typeof chrome !== 'undefined' && typeof chrome.storage !== 'undefined')
  storage = chrome.storage.local;
else
  storage = window.localStorage;

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // is webkit? http://stackoverflow.com/a/16459606/376773
  return ('WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  return JSON.stringify(v);
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return args;

  var c = 'color: ' + this.color;
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      storage.removeItem('debug');
    } else {
      storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = storage.debug;
  } catch(e) {}
  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

},{"./debug":14}],14:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = Array.prototype.slice.call(arguments);

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    if ('function' === typeof exports.formatArgs) {
      args = exports.formatArgs.apply(self, args);
    }
    var logFn = enabled.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":15}],15:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options){
  options = options || {};
  if ('string' == typeof val) return parse(val);
  return options.long
    ? long(val)
    : short(val);
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  var match = /^((?:\d+)?\.?\d+) *(ms|seconds?|s|minutes?|m|hours?|h|days?|d|years?|y)?$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 's':
      return n * s;
    case 'ms':
      return n;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function short(ms) {
  if (ms >= d) return Math.round(ms / d) + 'd';
  if (ms >= h) return Math.round(ms / h) + 'h';
  if (ms >= m) return Math.round(ms / m) + 'm';
  if (ms >= s) return Math.round(ms / s) + 's';
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function long(ms) {
  return plural(ms, d, 'day')
    || plural(ms, h, 'hour')
    || plural(ms, m, 'minute')
    || plural(ms, s, 'second')
    || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) return;
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],16:[function(require,module,exports){
function v2(x, y) {
  return { x: x || 0, y: y || 0 }
}

v2.copy = function(out, a) {
  out.x = a.x;
  out.y = a.y;
  return out;
}

v2.set = function(out, x, y) {
  out.x = x;
  out.y = y;
  return out;
}

v2.add = function(out, a, b) {
  out.x = a.x + b.x;
  out.y = a.y + b.y;
  return out;
}

v2.sub = function(out, a, b) {
  out.x = a.x - b.x;
  out.y = a.y - b.y;
  return out;
}

v2.scale = function(out, a, factor) {
  out.x = a.x * factor;
  out.y = a.y * factor;
  return out;
}

v2.distance = function(v1, v2) {
  var x = v1.x - v2.x;
  var y = v1.y - v2.y;
  return Math.sqrt(x*x + y*y);
}

v2.magnitude = function(v1) {
  var x = v1.x;
  var y = v1.y;
  return Math.sqrt(x*x + y*y);
}

v2.normalize = function(out, a) {
  var x = a.x;
  var y = a.y;
  var len = x*x + y*y;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
    out.x = a.x * len;
    out.y = a.y * len;
  }
  return out;
}

module.exports = v2;
},{}],17:[function(require,module,exports){
var v2 = require('pocket-physics/v2');
var dist;
var diff = v2();

exports.name = "collision-player-entity";
exports.reqs = ["position", "block"];
exports.actionEach = function(pkt, key, pos, block) {

  var playerKey = pkt.firstkey("player-controlled");
  var playerPos = pkt.dataFor(playerKey, "position");
  var cameraKey = pkt.firstkey("camera");
  var cameraShake = pkt.dataFor(cameraKey, "shake");

  // distance between both 
  dist = v2.distance(playerPos.cpos, pos.cpos);

  if (dist <= (block.radius + 10)) {

    cameraShake.strength = 90
    cameraShake.damper = 5;
    //cameraShake.strength = block.radius;
    //cameraShake.damper = block.radius / 25;

    // make them split into smaller things!
    if (block.radius >= 20) {
      for (var i = 0; i < 4; i++) {

        var accelx = -40 + Math.random() * 80;
        var accely = -40 + Math.random() * 80;

        pkt.key({
          "position" : { 
            cpos : v2(pos.cpos.x, pos.cpos.y),
            ppos : v2(pos.ppos.x, pos.ppos.y),
            acel : v2(accelx, accely) 
          },
          "block" : { radius : block.radius / 2 },
          "drag" : 0.99
        });
      }
    }
      

    pkt.destroyKey(key);
  }

}
},{"pocket-physics/v2":16}],18:[function(require,module,exports){
exports.name = "input-accel";
exports.reqs = ["position", "player-controlled"];
exports.actionEach = function (pkt, keys, pos) {

  var input = pkt.firstData("keyboard-input");

  // up - w
  if (input.pressed[87]) {
    pos.acel.y = -6;
    pos.face = "up";
  }

  // down - s
  else if (input.pressed[83]) {
    pos.acel.y = 6;
    pos.face = "down";
  }

  // left - a
  if (input.pressed[65]) {
    pos.acel.x = -6;
    pos.face = "left";
  }

  // right - d
  else if (input.pressed[68]) { 
    pos.acel.x = 6;
    pos.face = "right";
  }

}
},{}],19:[function(require,module,exports){
var v2 = require('pocket-physics/v2');

exports.name = "input-use";
exports.reqs = ["position", "player-controlled"];
exports.actionEach = function (pkt, keys, pos) {

  var input = pkt.firstData("keyboard-input");
  var camKey = pkt.keysMatching("camera");
  var cameraShake = pkt.dataFor(camKey, "shake");


  if (input.pressed[32]) {

    // simulate camera shake
    //cameraShake.isShaking = true;
    //cameraShake.strength = 100;
    //cameraShake.damper = 1;

  }

  /*
  // refactor to put into shield update system
  var shieldKeys = pkt.keysMatching("shield", "position");
  var input = pkt.firstData("keyboard-input");  

  // use - space bar
  if (input.pressed[32]) {

    var newCPos = v2();
    var newPPos = v2();
    var newAcel = v2();
    var face;

    v2.copy(newCPos, pos.cpos);
    v2.copy(newPPos, pos.cpos);

    if (pos.face === "left") {
      newCPos.x -= 10;
      newPPos.x -= 10;
      newAcel.x = pos.acel.x;
      face = "left";
    }
    else if (pos.face === "right") {
      newCPos.x += 20;
      newPPos.x += 20;
      newAcel.x = pos.acel.x;
      face = "right";
    }
    else if (pos.face === "up") {
      newCPos.y -= 10;
      newPPos.y -= 10;
      newAcel.y = pos.acel.y;
      face = "up";
    }

    // make left handed!
    else if (pos.face === "down") {
      newCPos.y += 20;
      newPPos.y += 20;
      newCPos.x -= 10;
      newPPos.x -= 10;
      newAcel.y = pos.acel.y;
      face = "down";
    }

    if (shieldKeys.length === 0) {
      pkt.key({
        "shield" : {
          active : true,
          projectile : false,
          face : face,
          height : 20,
          width: 2
        },
        "position" : {
          cpos : newCPos,
          ppos : newPPos,
          acel : newAcel
        },
        "drag" : 0.93
      })
    }
    else {
      var shieldPos = pkt.dataFor(shieldKeys[0], "position");
      var shieldSh  = pkt.dataFor(shieldKeys[0], "shield");

      shieldPos.cpos = newCPos;
      shieldPos.ppos = newPPos;
      shieldPos.acel = newAcel;
      shieldSh.face = face;
    }

  } 
  else {
    if (shieldKeys.length !== 0) {
      pkt.destroyKey(shieldKeys[0]);  
    }
    

  } 

  */

}
},{"pocket-physics/v2":16}],20:[function(require,module,exports){
exports.name = "render-clear";
exports.reqs = ["ctx"];
exports.actionEach = function(pkt, keys, world) {

  world.ctx.clearRect(0, 0, world.cvs.width, world.cvs.height);
  world.ctx.beginPath();
  world.ctx.fillStyle="black";
  world.ctx.fillRect(0,0, world.cvs.width, world.cvs.height);

}
},{}],21:[function(require,module,exports){
var v2 = require('pocket-physics/v2');
var diff = v2();

exports.name = "render-entities";
exports.reqs = ["position", "block"];
exports.actionEach = function(pkt, keys, pos, block) {

  var cvs = pkt.firstData("ctx");
  var cameraKey = pkt.firstkey("camera");
  var cameraPos = pkt.dataFor(cameraKey, "position");
  var camera = pkt.dataFor(cameraKey, "camera");

  v2.sub(diff, pos.cpos, cameraPos.cpos);

  // only draw if this is in view of the camera
  if ((diff.x <= (camera.width + camera.cullDist) && diff.x >= (0 - camera.cullDist)) && (diff.y <= (camera.height + camera.cullDist) && diff.y >= (0  - camera.cullDist))) {

    cvs.ctx.beginPath();
    cvs.ctx.fillStyle = "yellow";
    cvs.ctx.arc(diff.x, diff.y, block.radius, 0, 2*Math.PI, false);
    cvs.ctx.fill();

  }

}
},{"pocket-physics/v2":16}],22:[function(require,module,exports){
var v2 = require('pocket-physics/v2');
var diff = v2();

exports.name = "render-player";
exports.reqs = ["position", "player-controlled"];
exports.actionEach = function(pkt, keys, pos, inv) {

  var cvs = pkt.firstData('ctx');
  var cameraKey = pkt.firstkey('camera');
  var camera = pkt.dataFor(cameraKey, "position");

  v2.sub(diff, pos.cpos, camera.cpos);

  // draw relative to camera
  cvs.ctx.beginPath();
  cvs.ctx.fillStyle = "white";
  cvs.ctx.fillRect(diff.x, diff.y, 10, 10);

}
},{"pocket-physics/v2":16}],23:[function(require,module,exports){
var v2 = require('pocket-physics/v2');
var diff = v2();

exports.name = "render-shield";
exports.reqs = ["shield", "position"];
exports.actionEach = function (pkt, keys, shield, pos) {

  var render = pkt.firstData("ctx");
  var cameraKey = pkt.firstkey('camera');
  var camera = pkt.dataFor(cameraKey, "position");

  v2.sub(diff, pos.cpos, camera.cpos);

  if (shield.active) {
    if (shield.face === "up" || shield.face === "down") {
      render.ctx.beginPath();
      render.ctx.fillRect(diff.x, diff.y, shield.height, shield.width);
    }
    else {
      render.ctx.beginPath();
      render.ctx.fillRect(diff.x, diff.y, shield.width, shield.height);  
    }
    
  }

}
},{"pocket-physics/v2":16}],24:[function(require,module,exports){
exports.name = "update-camera-constraints";
exports.reqs = ["camera", "position" , "shake"];
exports.actionEach = function(pkt, keys, camera, pos, shake) {

  // use max bounds only if specified
  if (camera.bound) {

    // flush camera -- x bounds
    pos.cpos.x = Math.min(pos.cpos.x, camera.maxWidth - camera.width);
    pos.cpos.x = Math.max(pos.cpos.x, 0);

    // flush camera -- y bounds
    pos.cpos.y = Math.min(pos.cpos.y, camera.maxHeight - camera.height);
    pos.cpos.y = Math.max(pos.cpos.y, 0);
  }

}
},{}],25:[function(require,module,exports){
var v2 = require('pocket-physics/v2');

exports.name = "update-camera";
exports.reqs = ["camera", "position", "interpolate", "shake"];
exports.actionEach = function(pkt, keys, camera, pos, interpolate, shake) {

  var playerKey = pkt.firstkey("player-controlled");
  var playerPos = pkt.dataFor(playerKey, "position");

  v2.set(interpolate.target.cpos, pos.cpos.x, pos.cpos.y);

  // moving to the right
  if (playerPos.cpos.x - playerPos.ppos.x >= 0) {
    v2.set(interpolate.target.cpos, playerPos.cpos.x - (camera.width / 3), interpolate.target.cpos.y);
  }

  // moving to the left
  else if (playerPos.cpos.x - playerPos.ppos.x < 0) {
    v2.set(interpolate.target.cpos, playerPos.cpos.x - (2 * (camera.width / 3)), interpolate.target.cpos.y);
  }

  // moving down
  if (playerPos.cpos.y - playerPos.ppos.y >= 0) {
    v2.set(interpolate.target.cpos, interpolate.target.cpos.x, playerPos.cpos.y - (camera.height / 2));
  }

  // moving up
  else if (playerPos.cpos.y - playerPos.ppos.y < 0) {
    v2.set(interpolate.target.cpos, interpolate.target.cpos.x, playerPos.cpos.y - (camera.height / 2));
  }

}
},{"pocket-physics/v2":16}],26:[function(require,module,exports){
var distance2d = require('pocket-physics/distanceconstraint2d');

exports.name = "update-constraints";
exports.reqs = ["constraint", "position"];
exports.actionEach = function(pkt, keys, constraint, pos) {

  distance2d(pos, constraint.target, constraint.goal);

}
},{"pocket-physics/distanceconstraint2d":10}],27:[function(require,module,exports){
var v2 = require('pocket-physics/v2');

exports.name = "update-interpolate";
exports.reqs = ["position", "interpolate"];
exports.actionEach = function(pkt, keys, pos, interpolate) {

  if (interpolate.type === "linear") {
    pos.acel.x += interpolate.step * (interpolate.target.cpos.x - pos.cpos.x);
    pos.acel.y += interpolate.step * (interpolate.target.cpos.y - pos.cpos.y);  
  }

  else if (interpolate.type === "smooth") {
    pos.acel.x += (interpolate.target.cpos.x - pos.cpos.x) * (Math.pow(interpolate.step, 2) * (3 - (2 * interpolate.step)));
    pos.acel.y += (interpolate.target.cpos.y - pos.cpos.y) * (Math.pow(interpolate.step, 2) * (3 - (2 * interpolate.step)));
  }

  else if (interpolate.type === "cosine") {
    pos.acel.x += (interpolate.target.cpos.x - pos.cpos.x) * (-Math.cos(Math.PI * interpolate.step) / 2 + 0.5);
    pos.acel.y += (interpolate.target.cpos.y - pos.cpos.y) * (-Math.cos(Math.PI * interpolate.step) / 2 + 0.5);
  }
  
  else if (interpolate.type === "accelerate") {
    pos.acel.x += (interpolate.target.cpos.x - pos.cpos.x) * Math.pow(interpolate.step, 2);
    pos.acel.y += (interpolate.target.cpos.y - pos.cpos.y) * Math.pow(interpolate.step, 2);
  }

  else if (interpolate.type === "decelerate") {
    pos.acel.x += (interpolate.target.cpos.x - pos.cpos.x) * (1 - Math.pow((1 - interpolate.step), 2));
    pos.acel.y += (interpolate.target.cpos.y - pos.cpos.y) * (1 - Math.pow((1 - interpolate.step), 2));
  }
    
}
},{"pocket-physics/v2":16}],28:[function(require,module,exports){
var randx;
var randy;

exports.name = "update-shake";
exports.reqs = ["position", "shake"];
exports.actionEach = function(pkt, keys, pos, shake) {

  // check if we are allowed to shake
  if (shake.strength > 0) {

    randx =  Math.random() * 2 * shake.strength - shake.strength;
    randy =  Math.random() * 2 * shake.strength - shake.strength;

    pos.acel.x += randx;
    pos.acel.y += randy;

    // either subtract, or multiply
    shake.strength -= shake.damper;

  }

}
},{}],29:[function(require,module,exports){
var accelerate2d = require('pocket-physics/accelerate2d');
var inertia2d = require('pocket-physics/inertia2d');
var drag2d = require('pocket-physics/drag2d');

exports.name = "update-verlet";
exports.reqs = ['position', 'drag'];
exports.actionEach = function(pkt, keys, pos, drag) {

  drag2d(pos, drag.damper);
  accelerate2d(pos, 16);
  inertia2d(pos);

}
},{"pocket-physics/accelerate2d":9,"pocket-physics/drag2d":11,"pocket-physics/inertia2d":12}]},{},[3]);
