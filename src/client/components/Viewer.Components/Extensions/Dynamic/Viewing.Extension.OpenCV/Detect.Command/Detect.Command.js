import ViewerCommand from 'Viewer.Command'
import ViewerTooltip from 'Viewer.Tooltip'

export default class DetectCommand extends ViewerCommand {

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  constructor (viewer, options = {}) {

    super (viewer, {
      ...options,
      commandId: 'Detect'
    })

    this.defaultCursor = this.viewer.impl.canvas.style.cursor

    this.onCameraChange = this.onCameraChange.bind(this)
    this.onResize = this.onResize.bind(this)
    this.detect = this.detect.bind(this)
    
    this.openCVSvc = options.openCVSvc

    this.control = this.createButtonControl({
      parentControl: options.parentControl,
      caption: 'Object Detection',
      icon: 'toolbar-detect fa fa-crosshairs',
      id: 'toolbar-detect',
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

      this.timerId = 0

      this.detect()
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
          'detect-overlay',
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
      'detect-overlay',
      this.materialLine,
      this.materialLine,
      camera)

    this.tooltip = new ViewerTooltip(viewer, {
      stroke: 'blue',
      fill: 'blue'
    })

    this.tooltip.setContent(`
      <div id="detect-tooltipId" class="detect-tooltip">
        <b>Object detection active ...</b>
      </div>`, '#detect-tooltipId')
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onResize () {

    const overlay =
      this.viewer.impl.overlayScenes['detect-overlay']

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

    this.stateGuid = this.guid()

    if (this.lines) {
    
      this.viewer.impl.removeOverlay(
        'detect-overlay',
        this.lines)
    
        this.lines = null
    }  

    clearTimeout(this.timerId)

    this.timerId = setTimeout(
      this.detect, 800)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async detect () {

    try {

      this.viewer.impl.canvas.style.cursor = 'wait'

      if (this.lines) {

        this.viewer.impl.removeOverlay(
          'detect-overlay',
          this.lines)
        
        this.lines = null
      }  

      this.timerId = 0

      const rect = this.viewer.impl.canvas.getBoundingClientRect()

      const state = this.viewer.getState({
        viewport: true
      })

      const size = {
        height: rect.height,
        width: rect.width
      }

      const points3d = await this.openCVSvc.getOBB(
        this.options.socketId, {
          guid: this.stateGuid,
          state, 
          size
        })

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
        'detect-overlay',
        this.lines)
  
      this.viewer.impl.invalidate(false, false, true)

    } finally {

      this.viewer.impl.canvas.style.cursor = this.defaultCursor
    }
  }
}


