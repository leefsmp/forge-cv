'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _puppeteer = require('puppeteer');

var _puppeteer2 = _interopRequireDefault(_puppeteer);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _opencv = require('opencv');

var _opencv2 = _interopRequireDefault(_opencv);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/////////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////////
var loadImage = function loadImage(filename) {

  return new Promise(function (resolve, reject) {

    _opencv2.default.readImage(filename, function (err, img) {

      try {

        if (err) {
          return reject(err);
        }

        if (img.height() < 1 || img.width() < 1) {
          return reject('Image has no size');
        }

        resolve(img);
      } catch (ex) {

        return reject(ex);
      }
    });
  });
};

/////////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////////
var _getOBB = function _getOBB(img) {

  var highThresh = 150;
  var iterations = 2;
  var lowThresh = 0;

  img.convertGrayscale();
  img.gaussianBlur([3, 3]);
  img.canny(lowThresh, highThresh);
  img.dilate(iterations);

  var contours = img.findContours();

  var clr = [0, 0, 255];

  var largestAreaIndex = 0;
  var largestArea = 0;

  for (var i = 0; i < contours.size(); ++i) {
    if (contours.area(i) > largestArea) {
      largestArea = contours.area(i);
      largestAreaIndex = i;
    }
  }

  return contours.minAreaRect(largestAreaIndex);
};

/////////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////////
var setState = function setState(page, state) {
  return page.evaluate(function (state) {
    window.setState(state);
  }, state);
};

/////////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////////
var clientToWorld = function clientToWorld(page, _ref) {
  var x = _ref.x,
      y = _ref.y;


  return new Promise(function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(resolve, reject) {
      var onMessage;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              onMessage = function onMessage(msg) {
                page.removeListener('console', onMessage);
                resolve(JSON.parse(msg._text));
              };

              page.on('console', onMessage);

              page.evaluate(function (x, y) {
                console.log(window.clientToWorld(x, y));
              }, x, y);

            case 3:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, undefined);
    }));

    return function (_x, _x2) {
      return _ref2.apply(this, arguments);
    };
  }());
};

/////////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////////
var guid = function guid() {
  var format = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'xxxxxxxxxxxx';


  var d = new Date().getTime();

  var guid = format.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : r & 0x7 | 0x8).toString(16);
  });

  return guid;
};

var Worker = function () {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  function Worker(config) {
    _classCallCheck(this, Worker);

    this.sendMessage = this.sendMessage.bind(this);

    this.pid = process.pid;
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////


  _createClass(Worker, [{
    key: 'sendMessage',
    value: function sendMessage(msg) {

      process.send(msg);
    }

    /////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////

  }, {
    key: 'load',
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(accessToken, urn) {
        var browser, filename, url, page;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return _puppeteer2.default.launch({
                  headless: false,
                  args: ['--hide-scrollbars', '--mute-audio', '--headless']
                });

              case 2:
                browser = _context2.sent;
                _context2.prev = 3;
                filename = _path2.default.resolve(__dirname, '../..', './resources/viewer/viewer.html');
                url = 'file://' + filename + '?accessToken=' + accessToken + '&urn=' + urn;
                _context2.next = 8;
                return browser.newPage();

              case 8:
                page = _context2.sent;
                _context2.next = 11;
                return page.goto(url);

              case 11:
                _context2.next = 13;
                return page.mainFrame().waitForSelector('.geometry-loaded', {
                  timeout: 300000
                });

              case 13:

                this.browser = browser;
                this.page = page;

                this.sendMessage({
                  data: 'loaded',
                  status: 200,
                  id: 'load'
                });

                _context2.next = 22;
                break;

              case 18:
                _context2.prev = 18;
                _context2.t0 = _context2['catch'](3);


                browser.close();

                this.sendMessage({
                  status: 500,
                  id: 'load',
                  data: _context2.t0
                });

              case 22:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this, [[3, 18]]);
      }));

      function load(_x4, _x5) {
        return _ref3.apply(this, arguments);
      }

      return load;
    }()

    /////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////

  }, {
    key: 'getOBB',
    value: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(state, size) {
        var path, clip, img, obb, p1, p2, p3, p4;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.prev = 0;
                _context3.next = 3;
                return setState(this.page, state);

              case 3:
                path = _path2.default.resolve(__dirname, '../..', './TMP/' + guid() + '.jpg');
                clip = {
                  height: size.height,
                  width: size.width,
                  x: 0,
                  y: 0
                };
                _context3.next = 7;
                return this.page.setViewport(size);

              case 7:
                _context3.next = 9;
                return this.page.screenshot({
                  path: path,
                  clip: clip
                });

              case 9:
                _context3.next = 11;
                return loadImage(path);

              case 11:
                img = _context3.sent;
                obb = _getOBB(img);
                _context3.next = 15;
                return clientToWorld(this.page, obb.points[0]);

              case 15:
                p1 = _context3.sent;
                _context3.next = 18;
                return clientToWorld(this.page, obb.points[1]);

              case 18:
                p2 = _context3.sent;
                _context3.next = 21;
                return clientToWorld(this.page, obb.points[2]);

              case 21:
                p3 = _context3.sent;
                _context3.next = 24;
                return clientToWorld(this.page, obb.points[3]);

              case 24:
                p4 = _context3.sent;


                _fs2.default.unlink(path, function (error) {});

                this.sendMessage({
                  data: [p1, p2, p3, p4],
                  status: 200,
                  id: 'obb'
                });

                _context3.next = 33;
                break;

              case 29:
                _context3.prev = 29;
                _context3.t0 = _context3['catch'](0);


                console.log(_context3.t0);
                this.sendMessage({
                  status: 500,
                  id: 'obb',
                  data: _context3.t0
                });

              case 33:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this, [[0, 29]]);
      }));

      function getOBB(_x6, _x7) {
        return _ref4.apply(this, arguments);
      }

      return getOBB;
    }()
  }]);

  return Worker;
}();

exports.default = Worker;