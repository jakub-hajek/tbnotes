#tbnotes - js excersise
-----------------------

##Prerequisites:
* a) for build and run application it is required to have node.js installed with Bower and Gulp
     `npm install -g bower` `npm install -g gulp` 
* b) for end2end protractor tests chrome is required (tested on windows only)

#installation and running:
a) `npm install` (installs all required npm and bower modules)
b) `gulp` (builds app and starts server listening on http://localhost:9000)


#development and debugging:
a) `gulp start-dev` (same as default, but JSs and styles are not minified/concatenated)

#Tests:
a) `gulp start-e2e-tests`  (starts server & webdrvier and runs tests)



