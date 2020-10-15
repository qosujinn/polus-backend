/**
 * Default dashboard schema
 * @module model/dashboard/default
 */

let name = 'default',

/**
 * @function schema
 * @param {object} options - any necessary options for widget data
 * 
 * @member {object} data
 * holds the data for the dashboard
 *  + @member {array} tickets @memberof data - array of tickets for the ticket widget
 *  + @member {array} tasks @memberof data - array of tasks for the tasks widget
 * 
 */
schema = ( options ) => ({
   data: {
   tickets: null,
   tasks: null
   },
  
   widget: {
      /**
      * Tickets widget
      * @typedef {Object} widget.tickets
      * 
      * @member {object} hrcase @memberof widget.tickets
      * @member filters @memberof hrcase - filters used for the ticket search
      * @member fields @memberof hrcase - fields displayed in the ticket grid. These are the field IDs for the business object in Cherwell.
      * 
      * @member {object} incident @memberof widget.tickets
      * @member filters @memberof incident - filters used for the ticket search
      * @member fields @memberof incident - fields displayed in the ticket grid. These are the field IDs for the business object in Cherwell.
      * 
      */
      tickets: {
         'hrcase': {
            filters: [
               {
                  //tenant field
                  fieldId: "943cbf3ae7ea84af62914743aabf0d3a1117c6f00a",
                  operator: 'eq',
                  value: options.tenant
               }
            ],
            fields: [
               '941efdf3d7d8407ec656394d7ba2db2d84dea6ed60', //Description
               '943cbf3ae7ea84af62914743aabf0d3a1117c6f00a',  //Tenant
               '941ebe38ababc0050cbf8f414686b5a7a90dff809b', //CreatedDateTime
               '941ebe38ab08a70017b4834f4ba5f0758db22ff380', //OwnedByTeam
               '941efdefb79cd4b90b715945db91994adce5c5083a',  //Status
               '941efe148439cbe2eafdcf4453b9d45bc24f05b2fd',  //Short Description
               '941efdf3d7d8407ec656394d7ba2db2d84dea6ed60', //Description
               '941ebe38ab9db10318ae2b40bb90e55ddf26dfd2c3'  //OwnedBy
            ]
         },
         'incident': { 
            filters: [
               {
                  fieldId: "94358c8c0ba5612425b5d747cbb4b1ceef36dc9c1a",
                  operator: 'eq',
                  value: options.tenant
               }
            ],
            fields: [
               '94358c8c0ba5612425b5d747cbb4b1ceef36dc9c1a',   //Tenant
               'c1e86f31eb2c4c5f8e8615a5189e9b19',   //CreatedDateTime
               '941b8c1f4ca06dd1bc207c453da7e7d1b8b66aadc7',  //CustomerEmail
               '9339fc404e8d5299b7a7c64de79ab81a1c1ff4306c',  //OwnedByTeam
               '5eb3234ae1344c64a19819eda437f18d',             //Status
               '93e8ea93ff67fd95118255419690a50ef2d56f910c',   //Short Description
               '252b836fc72c4149915053ca1131d138',   //Description
               '9339fc404e4c93350bf5be446fb13d693b0bb7f219',   //Owned By
               '936d538f1d13d29750fc1348c495e79ff858f2ae6e',   //OwnedByEmail
               '83c36313e97b4e6b9028aff3b401b71c',    //Priority
               '93734aaff77b19d1fcfd1d4b4aba1b0af895f25788',    //Customer Display Name
               '936725cd10c735d1dd8c5b4cd4969cb0bd833655f4',  //Service
               '9e0b434034e94781ab29598150f388aa',  //Category
               '1163fda7e6a44f40bb94d2b47cc58f46'  //Subcategory
            ]
         } 
      },
      /**
       * Tasks widget
       * @typedef {Object} widget.tasks
       * @member filters @memberof widget.tasks - filters used for the task search
       * @member fields @memberof widget.tasks - fields displayed in the task grid. These are the field IDs for the business object in Cherwell.
       * 
       */
      tasks: {
         filters: [
            {
               fieldId: "94539e80a2572b63186aa549f99a326c6a7472fe4d",
               operator: 'eq',
               value: options.tenant
            }
         ],
         fields: [
            '94539e80a2572b63186aa549f99a326c6a7472fe4d',  //Tenant
            '9355d5ef648edf7a8ed5604d56af11170cce5dc25e', //Description
            "9368f0fb7b744108a666984c21afc932562eb7dc16",    //Status
            "93ad98a2d68a61778eda3d4d9cbb30acbfd458aea4",    //Title
            "93cfd5a4e13f7d4a4de1914f638abebee3a982bb50",    //OwnedBy
            '93b3d14c5a6204e3ef30e94d69a4b8a6542c22a5e4',  //OwnedByEmail
            "9355d5ed416a997f977756423e98e4cf2d2c383864",     //CreatedBy
            '93d4fe500febd88b923ddb4c99b8f93557b4ccda47',  //CreatedByEmail
            '9355d5ed416bbc9408615c4145978ff8538a3f6eb4'  //CreatedDateTime

         ]
      }
   },
    /**
    * Views widget
    * @typedef {Object} widget.views
    * @member My Items @memberof widget.views - filters the widgets by current user
    * @member Team Items @memberof widget.views - filters the widgets by current user's team
    * 
    */
   views: {
      'My Items'( value ) {
         let filtered = { tickets, tasks }
         filtered['tickets'] = data['tickets'].filter( ticket => ticket.owner == value )
         filtered['tasks'] = data['tasks'].filter( task => task.owner == value )

         return filtered
      },

      'Team Items'( value ) {
         let filtered = { tickets, tasks }
         filtered['tickets'] = data['tickets'].filter( ticket => ticket.team == value )
         filtered['tasks'] = data['tasks'].filter( task => task.team == value )

         return filtered
      }
   }
})

module.exports = { name, schema }