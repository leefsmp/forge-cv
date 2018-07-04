
import ServiceManager from '../services/SvcManager'
import compression from 'compression'
import cp	from 'child_process'
import express from 'express'
import path from 'path'

/////////////////////////////////////////////////////////
// Tiny util class to manage workers
//
/////////////////////////////////////////////////////////
class WorkersMap {

  constructor () {

    this._workersMap = {}
  }

  addWorker (id, worker) {

    if (this._workersMap[id]) {
      this._workersMap[id].kill()
      delete this._workersMap[id]
      this._workersMap[id] = null
    }

    this._workersMap[id] = worker
  }

  removeWorker (id) {

    if (this._workersMap[id]) {
      this._workersMap.kill()
      delete this._workersMap[id]
      this._workersMap[id] = null
    }
  }

  getWorker(id) {

    return this._workersMap[id]
  }
}

/////////////////////////////////////////////////////////
// API routes
//
/////////////////////////////////////////////////////////
module.exports = () => {

  const socketSvc = ServiceManager.getService('SocketSvc')

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  const workersMap = new WorkersMap()

  const router = express.Router()

  const shouldCompress = (req, res) => {
    return true
  }

  router.use(compression({
    filter: shouldCompress
  }))

  socketSvc.on('disconnect', (id) => {

    workersMap.removeWorker(id)
  })

  /////////////////////////////////////////////////////////
  // 
  //
  /////////////////////////////////////////////////////////
  // router.post('/load', async (req, res) => {

  //   try {

  //     const viewerSvc = ServiceManager.getService('ViewerSvc')

  //     const forgeSvc = ServiceManager.getService('ForgeSvc')

  //     const token = await forgeSvc.get2LeggedToken()

  //     const {urn, socketId} = req.body

  //     await viewerSvc.load(socketId, 
  //       token.access_token, 
  //       urn)

  //     res.json('loaded')

  //   } catch (ex) {

  //     res.status(ex.status || 500)
  //     res.json(ex)
  //   }
  // })

  /////////////////////////////////////////////////////////
  // 
  //
  /////////////////////////////////////////////////////////
  // router.post('/obb/:socketId', async (req, res) => {

  //   try {

  //     const viewerSvc = ServiceManager.getService('ViewerSvc')

  //     const {state, size} = req.body

  //     const obb = await viewerSvc.getOBB(
  //       req.params.socketId, {
  //         state, 
  //         size
  //       })
      
  //     res.json(obb)

  //   } catch (ex) {

  //     res.status(ex.status || 500)
  //     res.json(ex)
  //   }
  // })

  /////////////////////////////////////////////////////////
  // Instanciate worker and loads Forge model
  //
  /////////////////////////////////////////////////////////
  router.post('/worker/load', async (req, res) => {
  
    try {

      const socketSvc = ServiceManager.getService('SocketSvc')

      res.json('loading')

      const {urn, socketId} = req.body

      const workerPath = path.resolve(
        __dirname, '../../../../bin/worker')

      const worker = cp.fork(workerPath, {
        execArgv: [
          '--max-old-space-size=4096',
          '--gc_interval=100'
        ]
      })

      const handler = (msg) => {
        switch (msg.id) {
            case 'load':
              
            worker.removeListener('message', handler)
              
              if (msg.status === 200) {

                workersMap.addWorker(
                  socketId, worker)

                socketSvc.broadcast (
                  'opencv.loaded', 
                  msg.data, 
                  socketId)

              } else {

                worker.kill()
                
                socketSvc.broadcast (
                  'opencv.error', 
                  msg.data, 
                  socketId)
              }
        }
      }

      worker.on('message', handler)

      worker.on('error', (err) => {
        console.log(err)
        workersMap.removeWorker(socketId)
      })

      const forgeSvc = ServiceManager.getService('ForgeSvc')

      const {access_token} = await forgeSvc.get2LeggedToken()

      worker.send({
        access_token,
        id: 'load',
        urn
      })

    } catch (ex) {

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////
  // Request OBB from worker
  //
  /////////////////////////////////////////////////////////
  router.post('/worker/obb/:socketId', async (req, res) => {

    try {

      const worker = workersMap.getWorker(
        req.params.socketId)
      
      if (!worker) {
        res.status(404)
        return res.json('Invalid socketId')
      }
      
      const {state, size} = req.body

      const handler = (msg) => {
        switch (msg.id) {
            case 'obb':
              worker.removeListener('message', handler)
              res.status(msg.status || 500)
              return res.json(msg.data)
        }
      }

      worker.on('message', handler)

      worker.send({
        id: 'obb',
        state, 
        size
      })

    } catch (ex) {

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  return router
}


