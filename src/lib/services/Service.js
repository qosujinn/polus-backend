class Service {
   name
   #controllers = {
      get: {},
      post: {},
      put: {},
      delete: {}
   }

   init() {
      return this
   }

   getHandles() {
      return this.#handles
   }
}