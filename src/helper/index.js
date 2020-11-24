module.exports = {
   /**
    *  app, service and environment configurations
    * this is where you'd find any configurations you may need
    * if you need to add an configurations, check the ../config directory
    */
   CONF: require('../../config'),

   logger: require('./logger'),

   /**
    * small scripts that can make your dev life easier :)
    * get creative, and add one to ./util directory
    */
   scripts: require('./scripts'),
   
   /**
    * native modules
    * any native node modules are added here
    */
   fs: require('fs'),
   crypto: require('crypto'),
   path: require('path'),
   zlib: require('zlib'),
   util: require('util'),

   /** 
    * app modules
    * these are modules that can be used by the services that are built
    * some may be custom modules, or npm modules
   */

   /*
   request
   request uses bent, an http client, for making requests
   https://github.com/mikeal/bent
   */
   request: require('./request'),
   _request: require('request'),
   

   /*
   urlencode
   form-urlencoded is used to take an object and make it
   www-form-urlencoded data
   https://github.com/iambumblehead/form-urlencoded
   */
   urlencode: require('form-urlencoded').default,

   /*
   glob is used to match files with shell syntax. we use it for
   reading in files from local storage
   https://github.com/mikeal/bent
   */
   glob: require('glob'),

   /**
    * colors lets you add color to console printouts
    */
   colors: require('colors')
   
}