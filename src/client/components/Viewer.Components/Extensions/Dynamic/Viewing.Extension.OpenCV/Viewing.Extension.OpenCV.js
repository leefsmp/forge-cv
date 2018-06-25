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
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  load () {

    this.socketSvc.getSocketId().then (async(socketId) => {

      await this.openCVSvc.load({
        urn: this.options.urn,
        socketId
      })

      this.OBBCommand = new OBBCommand (this.viewer, {
        parentControl: this.options.parentControl,
        openCVSvc: this.openCVSvc,
        socketId
      })
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

