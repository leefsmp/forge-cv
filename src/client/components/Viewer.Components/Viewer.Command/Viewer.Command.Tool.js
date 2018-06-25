import EventsEmitter from 'EventsEmitter'

export default class CommandTool extends EventsEmitter {

  constructor (viewer, options = {}) {

    super ()

    this.toolName = options.commandId

    viewer.toolController.registerTool(this)

    this.options = options

    this.viewer = viewer
  }

  /////////////////////////////////////////////////////////////////
  // Tool names
  //
  /////////////////////////////////////////////////////////////////
  getNames () {

    return [this.toolName]
  }

  /////////////////////////////////////////////////////////////////
  // Tool name
  //
  /////////////////////////////////////////////////////////////////
  getName () {

    return this.toolName
  }

  /////////////////////////////////////////////////////////////////
  // Activate Tool
  //
  /////////////////////////////////////////////////////////////////
  activate () {

    if (!this.active) {

      this.active = true

      this.viewer.toolController.activateTool(this.toolName)

      this.emit('activate', this)
    }
  }

  /////////////////////////////////////////////////////////////////
  // Deactivate tool
  //
  /////////////////////////////////////////////////////////////////
  deactivate () {

    if (this.active) {

      this.active = false

      this.viewer.toolController.deactivateTool(this.toolName)

      this.emit('deactivate', this)
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  handleSingleClick (event, button) {

    return this.emit('singleclick', event, button)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  handleMouseMove (event) {

    return this.emit('mousemove', event)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  handleKeyDown (event, keyCode) {

    return this.emit('keydown', event, keyCode)
  }
}
