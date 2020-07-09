/**
 * UTIL
 * this is the util object! 
 * you can add bit-sized little things for developer use,
 * things that may make your life a little easier when working with 
 * a large codebase
 *
 * to add a new utility:
 *    - give it a name
 *    - give it a script (name.js)
 *    - add it to the object, like so:
 * 
      /**
      *  tree
      *    i needed a way to make a tree for service catalogs
      *    so i made this
      *    _key points_
      *       $do tree.create(root_value) to get new tree
      *       $do give it null or nothing, the value is just 'root'
      */    
/** 
 * 
 * and that's it!
 * 
*/ 


module.exports = {
    /**
    *  tree
    *    i needed a way to make a tree for service catalogs
    *    so i made this
    *    _key points_
    *       $do tree_name = tree.create(root_value) to get new tree
    *          $- give it null or nothing, the value is just 'root'
    *       $do tree_name.addNode([array]) to create a node
    *          $- n number of levels, starting from topmost node
    *          $- if a node doesn't exist, it'll be created
    */
   tree: require('./tree.js')
}