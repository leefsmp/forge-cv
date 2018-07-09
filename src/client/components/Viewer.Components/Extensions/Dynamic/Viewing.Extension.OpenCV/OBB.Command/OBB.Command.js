import ViewerCommand from 'Viewer.Command'
import ViewerTooltip from 'Viewer.Tooltip'

export default class OBBCommand extends ViewerCommand {

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  constructor (viewer, options = {}) {

    super (viewer, {
      ...options,
      commandId: 'OBB'
    })

    this.defaultCursor = this.viewer.impl.canvas.style.cursor

    this.onCameraChange = this.onCameraChange.bind(this)
    this.onResize = this.onResize.bind(this)
    this.onClick = this.onClick.bind(this)

    this.openCVSvc = options.openCVSvc

    this.control = this.createButtonControl({
      parentControl: options.parentControl,
      caption: 'OBB',
      icon: 'toolbar-obb fa fa-object-group',
      id: 'toolbar-obb',
      handler: () => {
        this.commandTool.active
          ? this.commandTool.deactivate()
          : this.commandTool.activate()
      }
    })

    this.commandTool.on('activate', () => {

      this.control.container.classList.add('active')

      viewer.impl.api.addEventListener(
        Autodesk.Viewing.VIEWER_RESIZE_EVENT,
        this.onResize)

      viewer.addEventListener(
        Autodesk.Viewing.CAMERA_CHANGE_EVENT,
        this.onCameraChange)  

      this.tooltip.activate()

      this.emit('activate')
    })

    this.commandTool.on('deactivate', () => {

      this.control.container.classList.remove('active')

      viewer.impl.api.removeEventListener(
        Autodesk.Viewing.VIEWER_RESIZE_EVENT,
        this.onResize)

      viewer.removeEventListener(
        Autodesk.Viewing.CAMERA_CHANGE_EVENT,
        this.onCameraChange)  
        
      if (this.lines) {

        this.viewer.impl.removeOverlay(
          'obb-overlay',
          this.lines)
        
          this.lines = null
      }    

      this.tooltip.deactivate()
    })

    this.commandTool.on('keydown', (event, keyCode) => {

      if (keyCode === 27) {

        this.commandTool.deactivate()
      }
    })

    this.commandTool.on('singleclick', this.onClick)

    this.materialLine = new THREE.LineBasicMaterial({
      color: new THREE.Color(0x0000FF),
      linewidth: 0.5,
      opacity: .6
    })

    const camera = new THREE.OrthographicCamera(
      0, viewer.canvas.clientWidth,
      0, viewer.canvas.clientHeight,
      1, 1000)

    viewer.impl.createOverlayScene(
      'obb-overlay',
      this.materialLine,
      this.materialLine,
      camera)

    this.tooltip = new ViewerTooltip(viewer, {
      stroke: 'blue',
      fill: 'blue'
    })

    this.tooltip.setContent(`
      <div id="obb-tooltipId" class="obb-tooltip">
        <b>Select model ...</b>
      </div>`, '#obb-tooltipId')
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onResize () {

    const overlay =
      this.viewer.impl.overlayScenes['obb-overlay']

    if (overlay) {

      const canvas = this.viewer.canvas

      const camera = new THREE.OrthographicCamera(
        0, canvas.clientWidth,
        0, canvas.clientHeight,
        1, 1000)

      overlay.camera = camera
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onCameraChange () {

    this.cameraChanged = true

    if (this.lines) {
    
      this.viewer.impl.removeOverlay(
        'obb-overlay',
        this.lines)
    
        this.lines = null
    }  
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onClick (event) {

    try {

      this.cameraChanged = false

      if (this.lines) {

        this.viewer.impl.removeOverlay(
          'obb-overlay',
          this.lines)
        
        this.lines = null
      }  
  
      const hitTest = this.viewer.clientToWorld(
        event.canvasX, event.canvasY, true)
  
      if (hitTest) {
        
        const rect = this.viewer.impl.canvas.getBoundingClientRect()
  
        const state = this.viewer.getState({
          viewport: true
        })
  
        const size = {
          height: rect.height,
          width: rect.width
        }
  
        this.viewer.impl.canvas.style.cursor = 'wait'
  
        const points3d = await this.openCVSvc.getOBB(
          this.options.socketId, {
            state, size
          })

        if (this.cameraChanged) {
          this.viewer.impl.canvas.style.cursor = this.defaultCursor
          return
        }  
  
        const points2d = points3d.map((point3d) => {
          return this.viewer.worldToClient(point3d)
        })
  
        const lineGeometry = new THREE.Geometry()
  
        lineGeometry.vertices.push(
          new THREE.Vector3(points2d[0].x, points2d[0].y, -10))
        lineGeometry.vertices.push(
          new THREE.Vector3(points2d[1].x, points2d[1].y, -10))
        lineGeometry.vertices.push(
          new THREE.Vector3(points2d[2].x, points2d[2].y, -10))    
        lineGeometry.vertices.push(
          new THREE.Vector3(points2d[3].x, points2d[3].y, -10))    
        lineGeometry.vertices.push(
          new THREE.Vector3(points2d[0].x, points2d[0].y, -10))
  
        this.lines = new THREE.Line(
          lineGeometry,
          this.materialLine,
          THREE.LineStrip)
  
        this.viewer.impl.addOverlay(
          'obb-overlay',
          this.lines)
    
        this.viewer.impl.invalidate(false, false, true)
      }

    } finally {

      this.viewer.impl.canvas.style.cursor = this.defaultCursor
    }
  }
}


