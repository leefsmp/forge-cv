'use strict';

require('babel-polyfill');

var _Worker = require('./Worker');

var _Worker2 = _interopRequireDefault(_Worker);

var _c0nfig = require('c0nfig');

var _c0nfig2 = _interopRequireDefault(_c0nfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

///////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////
process.on('disconnect', function () {

  process.kill();
});

///////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////
// async support
var worker = new _Worker2.default(_c0nfig2.default);

process.on('message', function (msg) {

  switch (msg.id) {

    case 'load':
      worker.load(msg.access_token, msg.urn);
      break;

    case 'obb':
      worker.getOBB(msg.state, msg.size);
      break;

    default:
      break;
  }
});