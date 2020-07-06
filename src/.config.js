module.exports = {
   env: require('./.env'),

   shibboleth: {
      url: 'https://atecsandbox01.utdallas.edu/shibb'
   },

   cherwell: {
      baseurl: 'http://atec250713.campus.ad.utdallas.edu',
      user: 'ATECPortalAPI',
      password: '!AT3C4Ev3R!',
      client_id: 'd5ea9a84-91d0-4092-bbe6-3df973afc526',
      tenant: 'ATEC'
   },

   vue: {
      baseurl_app: 'https://atecsandbox01.utdallas.edu/helpdev',
      baseurl_server: 'https://atecsandbox01.utdallas.edu/helpdev/server'
   },

   github: {
      user: 'utdallas-atec'
   }
}