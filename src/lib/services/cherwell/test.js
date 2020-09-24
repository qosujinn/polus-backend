const { test, title } = require('../../test')
let { search } = require('./lib/search'),
object = require('./lib/object')

title('Cherwell module')



test('Object: create an object')
   .it('should return an object')
      .expect( object.create( {
         
      } ) ).statusToBe( 'statusCode', 200 )

// test('Search: test ad-hoc search capability')
//    .it('should return an object')
//       .expect( search() ).statusToBe('object')
