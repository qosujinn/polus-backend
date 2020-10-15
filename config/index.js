
module.exports = {
   env: require('./.env'),

   shibb: {
      url: 'https://atecsandbox01.utdallas.edu/polus/s/shibboleth',
      callback: 'https://atecsandbox01.utdallas.edu/polus/s/shibboleth/callback',
      entry: 'https://idptest.utdallas.edu',
      cert_sp: './config/.security/shibb/cert_sp.pem',
      key_sp: './config/.security/shibb/key_sp.pem',
      cert_idp: './config/.security/shibb/cert_idp.pem'
   },

   cherwell: {
      baseurl: 'http://atec250713.campus.ad.utdallas.edu/CherwellAPI',
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
