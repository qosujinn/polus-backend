class Service {
   route
   #handles = {
      get: {},
      post: {},
      put: {},
      delete: {}
   }

   constructor(params) {
      return this
   }

   getHandles() {
      return this.#handles
   }
}