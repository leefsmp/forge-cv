// async support
import 'babel-polyfill'
import {worker as config} from 'c0nfig'
import Worker from './Worker'

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
      worker.load(msg.access_token, msg.urn, msg.path)
      break

    case 'detect':
      worker.detectObjects(msg.state, msg.size, msg.guid)
      break

    case 'obb':
      worker.getOBB(msg.state, msg.size)
      break

    default:
      break
  }
})