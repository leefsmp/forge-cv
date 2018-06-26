// async support
import 'babel-polyfill'

import Worker from './Worker'
import config from 'c0nfig'

///////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////
const worker = new Worker(config)

///////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////
process.on('disconnect', () => {
  worker.terminate()
  process.kill()
})

///////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////
process.on('message', (msg) => {

  switch (msg.id) {

    case 'load':
      worker.load(msg.access_token, msg.urn)
      break

    case 'obb':
      worker.getOBB(msg.state, msg.size)
      break

    default:
      break
  }
})