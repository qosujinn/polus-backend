/**
 * catalog artifact
 */
let { scripts } = require('../../.helper')
let { Tree, TreeNode } = scripts.tree

module.exports = ( root ) => ({
   tree: new Tree( new TreeNode( root ) ),

   add( value, parent ) {
      this.tree.add( value, parent )
      return this
   },

   remove( value ) {
      this.tree.removeNode( value )
      return this
   },

   get( value ) {
      return this.tree.get( value )
      
   },

   displayChildren( parent ) {
      return this.tree.displayLeafs( parent )
   }
   
})
