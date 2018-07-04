
/////////////////////////////////////////////////////////////////////
// DEVELOPMENT configuration
//
/////////////////////////////////////////////////////////////////////
const HOST_URL = process.env.HOST_URL ||  'http://localhost'
const PORT = process.env.PORT || 3000

const config = {

  env: 'development',

  client: {
    models:[
      {
        urn: 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2UtcmNkYi1nYWxsZXJ5LWRldi8wNDg4LTMxMWEtMzAzMS5ydnQ',
        thumbnail: '/resources/img/Office.png',
        name: 'Office'
      },
      {
        urn: 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2UtcmNkYi1nYWxsZXJ5LWRldi9iNzk3LWUwMDItNDRiOC5kd2Y',
        thumbnail: '/resources/img/Seat.png',
        name: 'Seat'
      }
    ],
    host: `${HOST_URL}`,
    env: 'development',
    port: PORT
  },

  forge: {

    oauth: {

      redirectUri: `${HOST_URL}:${PORT}/api/forge/callback/oauth`,
      authenticationUri: '/authentication/v1/authenticate',
      refreshTokenUri: '/authentication/v1/refreshtoken',
      authorizationUri: '/authentication/v1/authorize',
      accessTokenUri: '/authentication/v1/gettoken',

      baseUri: 'https://developer.api.autodesk.com',
      clientSecret: process.env.FORGE_DEV_CLIENT_SECRET,
      clientId: process.env.FORGE_DEV_CLIENT_ID,

      scope: [
        'data:read',
        'data:write',
        'data:create',
        'bucket:read',
        'bucket:create'
      ]
    },

    viewer: {
      viewer3D: 'https://developer.api.autodesk.com/derivativeservice/v2/viewers/viewer3D.js?v=5.0',
      style:    'https://developer.api.autodesk.com/derivativeservice/v2/viewers/style.css?v=5.0'
    }
  }
}

module.exports = config


