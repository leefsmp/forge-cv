import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import DetectCommand from './Detect.Command'
import ServiceManager from 'SvcManager'
import OBBCommand from './OBB.Command'

export default class OpenCVExtension
  extends MultiModelExtensionBase {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super(viewer, options)

    this.onOpenCVLoaded = this.onOpenCVLoaded.bind(this)
    this.onOpenCVError = this.onOpenCVError.bind(this)
    
    this.openCVSvc = ServiceManager.getService('OpenCVSvc')

    this.socketSvc = ServiceManager.getService('SocketSvc')

    this.notifySvc = ServiceManager.getService('NotifySvc') 
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  load () {

    this.socketSvc.on (
      'opencv.loaded',
      this.onOpenCVLoaded)

    this.socketSvc.on (
      'opencv.error',
      this.onOpenCVError)

    this.notification = this.notifySvc.add({
      title: 'Initializing OpenCV',
      message: 'Please wait ...',
      dismissible: false,
      status: 'loading',
      id: 'opencv-init',
      dismissAfter: 0,
      position: 'tl'
    })

    this.notifySvc.update(this.notification)

    this.socketSvc.getSocketId().then (async(socketId) => {

      this.openCVSvc.load({
        path: this.options.path,
        urn: this.options.urn,
        socketId
      })
    })
    
    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onOpenCVLoaded () {

    const socketId = await this.socketSvc.getSocketId()

    this.DetectCommand = new DetectCommand (this.viewer, {
      parentControl: this.options.parentControl,
      openCVSvc: this.openCVSvc,
      socketId
    })

    this.OBBCommand = new OBBCommand (this.viewer, {
      parentControl: this.options.parentControl,
      openCVSvc: this.openCVSvc,
      socketId
    })

    this.notification.title = 'OpenCV initialized :)'
    this.notification.dismissAfter = 2000
    this.notification.status = 'success'
    this.notification.message = ''

    this.notifySvc.update(this.notification)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onOpenCVError (error) {

    const socketId = await this.socketSvc.getSocketId()

    this.notification.title = 'OpenCV error :('
    this.notification.dismissAfter = 2000
    this.notification.status = 'error'
    this.notification.message = ''

    this.notifySvc.update(this.notification)

    console.log(error)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onObjectTreeCreated () {

    const nav = this.viewer.navigation
    
    nav.toPerspective()

    setTimeout(() => {
      this.viewer.autocam.setHomeViewFrom(nav.getCamera())
    }, 2000)
  }
  
  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  unload () {

    return true
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  'Viewing.Extension.OpenCV', OpenCVExtension)

