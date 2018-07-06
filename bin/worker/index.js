'use strict';

require('babel-polyfill');

var _c0nfig = require('c0nfig');

var _Worker = require('./Worker');

var _Worker2 = _interopRequireDefault(_Worker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

///////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////
var worker = new _Worker2.default(_c0nfig.worker);

///////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////
// async support
process.on('disconnect', function () {
  worker.terminate();
  process.kill();
});

///////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////
process.on('message', function (msg) {

  switch (msg.id) {

    case 'load':
      worker.load(msg.access_token, msg.urn, msg.path);
      break;

    case 'obb':
      worker.getOBB(msg.state, msg.size);
      break;

    default:
      break;
  }
});