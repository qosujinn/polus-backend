# SERVICES <!-- {docsify-ignore} -->

A service is the software piece of POLUS, and how integrations are developed. The first service for POLUS was Cherwell.

Services are designed in a 'microservice' way, meaning that each service has its own API endpoints that POLUS uses to communicate between them. This way, a service can work independently of another, and POLUS will still run if a service is offline or something in the code breaks. It also means services can be developed independently.
 
