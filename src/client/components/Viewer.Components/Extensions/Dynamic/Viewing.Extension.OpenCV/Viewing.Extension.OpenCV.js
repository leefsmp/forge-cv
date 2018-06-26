import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
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

    this.openCVSvc = ServiceManager.getService('OpenCVSvc')

    this.socketSvc = ServiceManager.getService('SocketSvc')

    this.notifySvc = ServiceManager.getService('NotifySvc') 
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  load () {

    const notification = this.notifySvc.add({
      title: 'Initializing OpenCV',
      message: 'Please wait ...',
      dismissible: false,
      status: 'loading',
      id: 'opencv-init',
      dismissAfter: 0,
      position: 'tl'
    })

    this.notifySvc.update(notification)

    this.socketSvc.getSocketId().then (async(socketId) => {

      const res = await this.openCVSvc.load({
        urn: this.options.urn,
        socketId
      })

      this.OBBCommand = new OBBCommand (this.viewer, {
        parentControl: this.options.parentControl,
        openCVSvc: this.openCVSvc,
        socketId
      })

      notification.title = 'OpenCV initialized !'
      notification.dismissAfter = 2000
      notification.status = 'success'
      notification.message = ''

      this.notifySvc.update(notification)
    })
    
    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onModelRootLoaded () {

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

