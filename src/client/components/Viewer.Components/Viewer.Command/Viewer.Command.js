import CommandTool from './Viewer.Command.Tool'
import EventsEmitter from 'EventsEmitter'

export default class ViewerCommand extends EventsEmitter {

  constructor (viewer, options = {}) {

    super ()

    this.commandTool = new CommandTool(viewer, options)

    this.commandId = options.commandId

    this.options = options

    this.viewer = viewer
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  activate () {

    if (!this.commandTool.active) {

      this.commandTool.activate()

      this.commandTool.on('activate', (tool) => {

        this.emit('command.activate', this)
      })

      this.commandTool.on('deactivate', (tool) => {

        this.emit('command.deactivate', this)
      })
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  deactivate () {

    if (this.commandTool.active) {

      this.commandTool.deactivate()

      this.commandTool.off()
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  createButton(id, className, tooltip, handler) {

    var button = new Autodesk.Viewing.UI.Button(id)

    button.icon.style.fontSize = '24px'

    button.icon.className = className

    button.setToolTip(tooltip)

    button.onClick = handler

    return button
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  createButtonControl (options) {

    const control = this.createButton(
      options.id,
      options.icon,
      options.caption,
      options.handler)

    var parentControl = options.parentControl

    if (!parentControl) {

      const viewerToolbar = this.viewer.getToolbar(true)

      parentControl = new Autodesk.Viewing.UI.ControlGroup(
        options.id)

      viewerToolbar.addControl(parentControl)
    }

    parentControl.addControl(control)

    return control
  }
}
