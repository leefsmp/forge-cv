import Viewer from 'Viewer'
import './ViewerView.scss'
import React from 'react'

class ViewerView extends React.Component {

   /////////////////////////////////////////////////////////
   //
   //
   /////////////////////////////////////////////////////////
   constructor () {

      super ()
   }

   /////////////////////////////////////////////////////////
   // Initialize viewer environment
   //
   /////////////////////////////////////////////////////////
   initialize (options) {

      return new Promise((resolve, reject) => {

        Autodesk.Viewing.Initializer (options, () => {

          resolve ()

        }, (error) => {

          reject (error)
        })
      })
   }

   /////////////////////////////////////////////////////////
   // Load a document from URN
   //
   /////////////////////////////////////////////////////////
   loadDocument (urn) {

      return new Promise((resolve, reject) => {

        const paramUrn = !urn.startsWith('urn:')
          ? 'urn:' + urn
          : urn

        Autodesk.Viewing.Document.load(paramUrn, (doc) => {

          resolve (doc)

        }, (error) => {

          reject (error)
        })
      })
   }

   /////////////////////////////////////////////////////////
   // Return viewable path: first 3d or 2d item by default
   //
   /////////////////////////////////////////////////////////
   getViewablePath (doc, pathIdx = 0, roles = ['3d', '2d']) {

      const rootItem = doc.getRootItem()

      const roleArray = [...roles]

      let items = []

      roleArray.forEach((role) => {

        items = [ ...items,
          ...Autodesk.Viewing.Document.getSubItemsWithProperties(
            rootItem, { type: 'geometry', role }, true) ]
      })

      if (!items.length || pathIdx > items.length) {

        return null
      }

      return doc.getViewablePath(items[pathIdx])
   }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  createToolbar (viewer) {

    let toolbarContainer = document.createElement('div')

    toolbarContainer.className = 'opencv-toolbar'

    viewer.container.appendChild(toolbarContainer)

    const toolbar = new Autodesk.Viewing.UI.ToolBar (true)

    const ctrlGroup =
      new Autodesk.Viewing.UI.ControlGroup(
        'opencv')

    toolbar.addControl(ctrlGroup)

    toolbarContainer.appendChild(
      toolbar.container)

    return ctrlGroup
  }

   /////////////////////////////////////////////////////////
   // viewer div and component created
   //
   /////////////////////////////////////////////////////////
   async onViewerCreated (viewer) {

      try {

        let { id, extIds, urn, path, pathIdx } =
          this.props.location.query

        // check if env is initialized
        // initializer cannot be invoked more than once

        if (!this.props.appState.viewerEnv) {

          await this.initialize({
            env: 'AutodeskProduction',
            useConsolidation: true
          })

          this.props.setViewerEnv('AutodeskProduction')

          const endpoint = window.location.origin + '/lmv-proxy-2legged'

          if (Autodesk.Viewing.endpoint) {

            Autodesk.Viewing.endpoint.setEndpointAndApi(
              endpoint, 'derivativeV2')

          } else if (Autodesk.Viewing.setApiEndpoint) {

            Autodesk.Viewing.setApiEndpoint(endpoint) 
          }
          
          Autodesk.Viewing.Private.memoryOptimizedSvfLoading = true

          //Autodesk.Viewing.Private.logger.setLevel(0)
        }

        if (id) {

          // load by database id lookup
          // !NOT IMPLEMENTED HERE
          // could be something like:
          // const dbModel = getDBModelBy(id)
          // urn = dbModel.urn

        } else if (urn) {

          const doc = await this.loadDocument (urn)

          path = this.getViewablePath (doc, pathIdx || 0)

        } else if (!path) {

          const error = 'Invalid query parameter: ' +
            'use id OR urn OR path in url'

          throw new Error(error)
        }

        viewer.start()

        if (viewer.setTheme) {

          viewer.setTheme('light-theme')
        }
        
        const ctrlGroup = this.createToolbar (viewer)

        viewer.loadDynamicExtension(
          'Viewing.Extension.OpenCV', {
            path: path.replace('resources/', '../'),
            parentControl: ctrlGroup,
            urn
          })

        viewer.loadModel(path)

      } catch (ex) {

        console.log('Viewer Initialization Error: ')
        console.log(ex)
      }
   }

   /////////////////////////////////////////////////////////
   //
   //
   /////////////////////////////////////////////////////////
   render () {

    
      return (
        <div className="viewer-view">
          <Viewer onViewerCreated={(viewer => {
              this.onViewerCreated(viewer)
            })}
          />
        </div>
      )
   }
}

export default ViewerView


