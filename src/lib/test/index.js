let name,
description,
colors = require('../../.helper').colors

/**
 * 
 * 
 * this is just one long nested function for tests
 * 
 * @param {string} msg - the name of the test, to be printed to the console
 * @param {function} cb - the callback function to be ran. 
 * @return {function} it
 *  
 * @example
 *    
 *    test('this is a test')
 *    .it('should do a thing, and return a value')
 *    .expect( actual ).toBe( expected )
 * 
 */ 
const test = ( msg ) => {
   name = msg
   return {

      /** 
       * 
       * it
       * describes what the test does and what to expect
       * 
       * @param {string} msg - the description, to be printed to the console
       * @return {function} expect
       *
       */
      it: ( msg ) => {
         description = msg
         return {

            /**
             *  
             * takes the actual result for the test, passes them to the assertions, then returns the assertions 
             * available to run
             * 
             * @param {string} actual - the actual value for the test
             * @return {object} assertions
             *
             */
            expect: ( actual ) => {
               return assertions(actual)
            }
         }
      }
   }
},
title = ( str ) => {
   str = `\n--->>--->>---\n${str}\n--->>--->>---\n`
   console.log(str)
}

module.exports = { test, title }

function print(expected, actual, result) {
   let details = `   expected: ${expected}; actual: ${actual}\n   result: ${result}\n\n`
   console.log(name)
   console.log(description)
   console.log(details)
}

/**
 * 
 * available assertions for running tests
 * @typedef {{...functions}} assertions
 *  
 */ 
function assertions( actual ) {
   return {
   
      toBe: ( expected ) => {
         const result = expected === actual ? 'PASSED'.green : 'FAILED'.red
         print( expected, actual, result )
      },

      statusToBe: ( name, expected ) => {
         const result = actual[name] == expected ? 'PASSED'.green : 'FAILED'.red
         print( expected, actual, result )
      }
   }

}