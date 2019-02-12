# wormwiring - Applications

All applications should be kept in the apps/ directory. Every application should be placed in its own directory. 
An app may point to other apps but should not depend on code from any other apps. Apps should adhere to the following template:

```
template/
├── config.json
├── css
│   └── appSpecific.css
├── include
│   ├── build_app.js
│   └── importerapp.js
├── index.html
└── ww -> ../../ww/

```

Consult the template application files to see how applications can be built. 

### config.json
All parameters including help files, database pointers and any other links should be specified in the config.json file. 
No parameters should be hard coded into the html/javascript files.

### ww
For convienience, we suggest creating a symbolic link to the ww/ directory. 

### build_apps.js 
Builds the application page on window loading.

### importerapp.js
Sets up the application by building the top bar and left side menu. All main application features should be put into this file. 
