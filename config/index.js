
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
      tenants: ['ATEC'],
      refresh: 30000, //miliseconds = 5min
      catalog: {
         incident: ( tenant ) => ({
            busObId: "934986ba1e6ea051a9def5461fbe8d4434cd5c3b45", //Subcategory
            fields: [
              "9383926e91c152713807534b1bb2833dea26addd52",
                 "94587716d79a903ab210be471e9716eafd33b585f8" 
            ],
            filters: [
              {
                fieldId: "943af1e9f1743e5417b8d04ab3a4cceb53e2beb299", 
                operator: "eq",
                value: tenant
              }
            ],
            includeSchema: false
         }),
         hrcase: ( tenant ) => ({
            busObId: "941feae60c7618e5ec4d7944488006cecc9f01b40a", //CaseSubcategory
            fields: [
              "941feb0185935188c7d4994fde91d423681aae2502", //Category
                 "941feb0506018ccc201f5c48b6bc431c5f70afa43a", //Case Type
               "941feb07a99610373464554273990bbd18cffb90d6" //Default Team
            ],
            filters: [
              {
                fieldId: "943c7e1b7385124f30216f4d0385b3896435977789", //filter by the Tenant field
                operator: "eq",
                value: tenant
              }
            ],
            includeSchema: false
         })
   
      }
   },

   vue: {
      baseurl_app: 'https://atecsandbox01.utdallas.edu/helpdev',
      baseurl_server: 'https://atecsandbox01.utdallas.edu/helpdev/server'
   },

   github: {
      user: 'utdallas-atec'
   }
}
