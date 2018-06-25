
import ServiceManager from '../services/SvcManager'
import compression from 'compression'
import express from 'express'
import path from 'path'

module.exports = function() {

  const uploadSvc = ServiceManager.getService('UploadSvc')

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  const router = express.Router()

  const shouldCompress = (req, res) => {
    return true
  }

  router.use(compression({
    filter: shouldCompress
  }))

  /////////////////////////////////////////////////////////
  // 
  //
  /////////////////////////////////////////////////////////
  router.post('/load', async (req, res) => {

    try {

      const viewerSvc = ServiceManager.getService('ViewerSvc')

      const forgeSvc = ServiceManager.getService('ForgeSvc')

      const token = await forgeSvc.get2LeggedToken()

      const {urn, socketId} = req.body

      await viewerSvc.load(socketId, 
        token.access_token, 
        urn)

      res.json('loaded')

    } catch (ex) {

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////
  // 
  //
  /////////////////////////////////////////////////////////
  router.post('/obb/:socketId', async (req, res) => {

    try {

      const viewerSvc = ServiceManager.getService('ViewerSvc')

      const forgeSvc = ServiceManager.getService('ForgeSvc')

      const token = await forgeSvc.get2LeggedToken()

      const {state, size} = req.body

      const obb = await viewerSvc.getOBB(
        req.params.socketId, {
          state, 
          size
        })
      
      res.json(obb)

    } catch (ex) {

      console.log(ex)
      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  return router
}


