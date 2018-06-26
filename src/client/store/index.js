import {client as config} from 'c0nfig'
import createStore from './createStore'

//Services
import ServiceManager from 'SvcManager'
import StorageSvc from 'StorageSvc'
import NotifySvc from 'NotifySvc'
import DialogSvc from 'DialogSvc'
import SocketSvc from 'SocketSvc'
import OpenCVSvc from 'OpenCVSvc'

// ========================================================
// Services Initialization
// ========================================================

const storageSvc = new StorageSvc({
  storageKey: 'Autodesk.Forge-CV.Storage',
  storageVersion: config.storageVersion
})

const socketSvc = new SocketSvc({
  host: config.host,
  port: config.port
})

const openCVSvc = new OpenCVSvc({
  apiUrl: '/api/opencv'
})

const notifySvc = new NotifySvc()

const dialogSvc = new DialogSvc()

// ========================================================
// Services Registration
// ========================================================
ServiceManager.registerService(storageSvc)
ServiceManager.registerService(socketSvc)
ServiceManager.registerService(dialogSvc)
ServiceManager.registerService(notifySvc)
ServiceManager.registerService(openCVSvc)

// ========================================================
// Store Instantiation
// ========================================================
const initialState = window.___INITIAL_STATE__

const store = createStore(initialState)

export default store
