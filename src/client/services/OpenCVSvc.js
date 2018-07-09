
import ClientAPI from 'ClientAPI'
import BaseSvc from './BaseSvc'

export default class OpenCVSvc extends BaseSvc {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (opts) {

    super (opts)

    this.api = new ClientAPI(this._config.apiUrl)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  name() {

    return 'OpenCVSvc'
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  load ({path, socketId, urn}) {

    const url = '/worker/load'

    return this.api.ajax({
      url: url,
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        socketId,
        path,
        urn
      })
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getOBB (socketId, params) {

    const url = `/worker/obb/${socketId}`

    return this.api.ajax({
      url: url,
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(params)
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  detectObjects (socketId, params) {

    const url = `/worker/detect/${socketId}`

    return this.api.ajax({
      url: url,
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(params)
    })
  }
}
