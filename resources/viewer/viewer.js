/////////////////////////////////////////////////////////
// Initialize viewer environment
//
/////////////////////////////////////////////////////////
function initialize (options) {

  return new Promise(function(resolve, reject) {

    Autodesk.Viewing.Initializer (options,
      function () {

        resolve ()

      }, function(error){

        reject (error)
      })
  })
}

/////////////////////////////////////////////////////////
// load document from URN
//
/////////////////////////////////////////////////////////
function loadDocument (urn) {

  return new Promise(function(resolve, reject) {

    var paramUrn = !urn.startsWith("urn:")
      ? "urn:" + urn
      : urn

    Autodesk.Viewing.Document.load(paramUrn,
      function(doc) {

        resolve (doc)

      }, function (error) {

        reject (error)
      })
  })
}

/////////////////////////////////////////////////////////
// Get viewable items from document
//
/////////////////////////////////////////////////////////
function getViewableItems (doc, roles) {

  var rootItem = doc.getRootItem()

  var items = []

  var roleArray = roles
    ? (Array.isArray(roles) ? roles : [roles])
    : []

  roleArray.forEach(function(role) {

    var subItems =
      Autodesk.Viewing.Document.getSubItemsWithProperties(
        rootItem, { type: "geometry", role: role }, true)

    items = items.concat(subItems)
  })

  return items
}

/////////////////////////////////////////////////////////
// get query parameter
//
/////////////////////////////////////////////////////////
function getQueryParam (name, url) {

  if (!url) url = window.location.href
  name = name.replace(/[\[\]]/g, "\\$&")

  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url)

  if (!results) return null
  if (!results[2]) return null
  return decodeURIComponent(results[2].replace(/\+/g, " "))
}

/////////////////////////////////////////////////////////
// 
//
/////////////////////////////////////////////////////////
function __clientToWorld (viewer, point) {

  var pointerVector = new THREE.Vector3()
  var domElement = viewer.impl.canvas
  var camera = viewer.impl.camera
  var ray = new THREE.Raycaster()

  var rect = domElement.getBoundingClientRect()

  var x =  ((point.x - rect.left) / rect.width)  * 2 - 1
  var y = -((point.y - rect.top)  / rect.height) * 2 + 1

  pointerVector.set(x, y, 0.5)

  pointerVector.unproject(camera)

  var dir = pointerVector.sub(camera.position).normalize()

  return {
    x: camera.position.x + dir.x * 100.0,
    y: camera.position.y + dir.y * 100.0,
    z: camera.position.z + dir.z * 100.0
  }
}

/////////////////////////////////////////////////////////
// Initialize Environment
//
/////////////////////////////////////////////////////////
initialize({

  acccessToken: getQueryParam("acccessToken"),
  env: "AutodeskProduction"

}).then(function() {

  var viewerDiv = document.getElementById("viewer")
  
  var viewer = getQueryParam("showToolbar") 
    ? new Autodesk.Viewing.Private.GuiViewer3D(viewerDiv)
    : new Autodesk.Viewing.Viewer3D(viewerDiv)

  viewer.addEventListener(
    Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
    function () {

      viewer.navigation.toPerspective()

      window.setState = function(state) {

        viewer.restoreState(state, 
          {viewport: true}, 
          true)
      }

      window.clientToWorld = function(x, y) {

        var res = __clientToWorld(viewer, {x, y})
        return JSON.stringify(res)
      }

      viewerDiv.classList.add("geometry-loaded")
    })

  var path = getQueryParam("path")

  if (path) {

    viewer.start(path)

  } else {

    loadDocument ("urn:" + getQueryParam("urn")).then(function(doc) {

      var items = getViewableItems (doc, ["3d", "2d"])
  
      viewer.start(doc.getViewablePath(items[0]))
    })
  }
})