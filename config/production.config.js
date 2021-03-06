
/////////////////////////////////////////////////////////////////////
// DEVELOPMENT configuration
//
/////////////////////////////////////////////////////////////////////
const HOST_URL = process.env.HOST_URL || 'https://forge-cv.autodesk.io'
const PORT = process.env.PORT || 443

const config = {

  env: 'production',

  client: {
    models:[
      {
        urn: 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2UtcmNkYi1nYWxsZXJ5LXRtcC1wcm9kLzFmNjAtNjhhMS00OTFlLnJ2dA',
        thumbnail: '/resources/img/Office.png',
        name: 'Office'
      },
      {
        urn: 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2UtcmNkYi1nYWxsZXJ5LXRtcC1wcm9kLzg3ZDctMTQ5Zi01MWVjLmR3Zg',
        thumbnail: '/resources/img/Seat.png',
        name: 'Seat'
      }
    ],
    // this the public host name of your server for the
    // client socket to connect.
    // eg. https://myforgeapp.mydomain.com
    host: `${HOST_URL}`,
    env: 'production',
    port: PORT
  },

  forge: {

    oauth: {

      redirectUri: `${HOST_URL}/api/forge/callback/oauth`,
      authenticationUri: '/authentication/v1/authenticate',
      refreshTokenUri: '/authentication/v1/refreshtoken',
      authorizationUri: '/authentication/v1/authorize',
      accessTokenUri: '/authentication/v1/gettoken',
      baseUri: 'https://developer.api.autodesk.com',

      clientSecret: process.env.FORGE_CLIENT_SECRET,
      clientId: process.env.FORGE_CLIENT_ID,

      scope: [
        'data:read',
        'data:write',
        'data:create',
        'bucket:read',
        'bucket:create'
      ]
    },

    viewer: {
      viewer3D: 'https://developer.api.autodesk.com/derivativeservice/v2/viewers/viewer3D.min.js?v=5.0',
      style:    'https://developer.api.autodesk.com/derivativeservice/v2/viewers/style.min.css?v=5.0'
    }
  },

  worker: {
    viewerUrl: null
  }
}

module.exports = config




