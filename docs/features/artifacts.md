# ARTIFACTS <!-- {docsify-ignore} -->

Artifacts are objects that hold information for use wih POLUS. They're abstractions of the objects in use by the services -- like in Cherwell's case, a _ticket_ artifact is what Incidents and HRCase objects are in Cherwell -- but since POLUS is agnostic, artifacts keep those data points from different services together in one place. So if a Cherwell object has a related entity on another service, POLUS and other services can know about it.

There are four artifacts currently through prototyping. 

## Form

Forms are a way for us to get info from users in a repeatable, systemized way. Most tech support requests or administration queries could be handled through forms, so this can be important for creating more automated processes. In POLUS, forms are JSON objects that hold some info about the form (like the catalog classification) and an array of queries. Here's an example:

```json

{
	"name": "BusinessExpense",
	"type": "HRCase",
	"title": "Business Expense Reimbursement",
    "details": "Use this form to schedule a laptop cart reservation. Please answer all questions before clicking submit.",
    "service": "Procurement",
	"category": "Reimbursements",
	"subcategory": "Business Expense Reimbursement",
    "tenant": "ATEC",

	"fields": [
		{
			"name": "Priority",
			"value": "3"
		},
		{
			"name": "CallSource",
			"value": "Portal"
		}
	],

	"queries": [
		{
			"type": "text",
			"text": "Give a short description of your problem:",
			"fieldName": "ShortDescription"
		},
		{
			"type": "textarea",
			"text": "Explain your problem in as much detail as possible.",
			"fieldName": "Description"
      },
      {
			"type": "radio",
			"text": "Are you requesting ATEC building tours?",
			"options": ["Yes", "No"],
			"subqueries": [
				{
					"type": "text",
					"text": "How many guests?"
				}
			]
		}
	]

}
```

Form queries utilize the HTML form `input` types (text, textarea, radio, checkbox, dropdown) and can also have subqueries, for questions that could be toggled on or off due to the users selection.

## Ticket

Tickets are created in Cherwell either by Incident objects (used for mostly IT) and a custom object created by OIT called an HRCase (used for non-IT). This doesn't matter much outside of Cherwell, so a single ticket artifacts covers both scenarios. Data is requested from Cherwell and parsed into this ticket object for use in code; this is the object that's sent back client-side when navigating to a ticket in the browser. Here's what it looks like:

```json
{
    "id": "441640",
    "recId": "945fb9ce327c6e5dc02f61448bbeebcc28dd9ddf81",
    "objId": "6dd53665c0c24cab86870a21cf6434ae",
    "owner": {
        "name": "",
        "email": ""
    },
    "requestor": {
        "name": "Jer'Maine Jones",
        "email": "jermaine.jones@utdallas.edu"
    },
    "classification": {
        "service": "Technical Support",
        "category": "Computer Support",
        "subcategory": "Software Issues"
    },
    "dated": "5/26/2020 2:13 PM",
    "status": "New",
    "description": {
        "text": "What is your name?\r\nJer'Maine\r\nWhat operating system is your device using?\r\nMac\r\nWhere is your device located?\r\nin my office\r\nWhat is the asset tag # of your device? (This information can usually be found on a label on top of the machine.)\r\n250713\r\nPlease explain your software issue in detail.\r\nit broke",
        "html": "<p><b>What is your name?</b><br />Jer'Maine</p><p><b>What operating system is your device using?</b><br />Mac</p><p><b>Where is your device located?</b><br />in my office</p><p><b>What is the asset tag # of your device? (This information can usually be found on a label on top of the machine.)</b><br />250713</p><p><b>Please explain your software issue in detail.</b><br />it broke</p>"
    },
    "priority": "3",
    "team": "ATEC Lab Techs",
    "subject": "Software Issues",
    "tenant": "ATEC"
}
```

*id* - the Cherwell public ID; since Cherwell functions as source-of-truth for ticketing, this functions as the prime ticket ID in POLUS.
*recID* - the Cherwell record ID; this is used in a few ways when making Cherwell API queries, and corresponds to the object the ticket refers to.
*objID* - the Cherwell ID of the object type. If the `recID` corresponds to the _incident object_ in Cherwell, the object ID tells you that it _is_ an incident object and not something else.
*owner* - the owner of the ticket, or the person handling the Cherwell ticket.
*requestor* - the person who made the request.
*classification* - Cherwell tickets can be classified according to a service catalog. 
*tenant* - the Cherwell tenant the ticket belongs to. Tenants exist such that schools at UTD are able to be afforded certain Cherwell features (like a service catalog) in a tenancy structure.
*team* - the Cherwell team the ticket belongs to. Teams exist under tenants, and tickets are owned by both a person and a team.

## Task

Tasks are another Cherwell object. They operate mostly like sub-tickets, and can be assigned to other people, even outside of your assigned team. Tasks can also have dependencies, and tickets can't be closed without tasks also being completed. 

```json
{
    "id": "31708",
    "recId": "946484db58bb976500c5ee49518802244faf3db311",
    "objId": "9355d5ed41e384ff345b014b6cb1c6e748594aea5b",
    "owner": {
        "name": "Jer'Maine Jones",
        "email": "jxj174730@utdallas.edu"
    },
    "creator": {
        "name": "Jer'Maine Jones",
        "email": "jxj174730@utdallas.edu"
    },
    "dated": "8/27/2020 4:00 PM",
    "tenant": "ATEC",
    "team": "ATEC Tech Resources",
    "description": {
        "text": "hello hello",
        "html": null
    },
    "title": "third task",
    "staus": "New"
}
```

*creator* is here instead of a requestor. 

## Dashboard

Agents in Cherwell use dashboards for viewing relevant information, like tickets and tasks that are available as well as other metrics in the form of widgets. For POLUS, they'll work functionally the same. When a user logs in and the dashboard loads, a request is made and POLUS retrieves data from the needed services to build the dashboard object. The schema for a dashboard includes which widgets it should display -- and any options it may need for the API queries -- and the views that are available for that dashboard.

Here's an example of a dashboard schema: 

```js
let name = 'default',
schema = ( options ) => ({
   data: {
   tickets: null,
   tasks: null
   },
   widget: {
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
```

*schema( options )* is a function that's exported, along with the name. When POLUS boots up, it loads the available dashboards by creating a key/value pair with the name and schema. When a request is made, the function is called passing the given options from the request; then, the sub-requests are made to the needed services for the dashboard data. 

```js
let dashboard = model.get( name )( options )

   dashboard.data.tickets = await getTickets( dashboard.widget.tickets )
   dashboard.data.tasks = await getTasks( dashboard.widget.tasks )
   
   return dashboard
```
from the dashboard get endpoint

