
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
  load ({urn, socketId}) {

    const url = '/load'

    return this.api.ajax({
      url: url,
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        socketId,
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
}
