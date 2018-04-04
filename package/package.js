Package.describe({
  name: 'jkuester:autoform-bpmn',
  version: '0.1.2',
  // Brief, one-line summary of the package.
  summary: 'Integrate the bpmn-js (bpmn.io) modeler into autoform.',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/jankapunkt/meteor-autoform-bpmn.git',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md',
});


Npm.depends({
  'bpmn-js': '0.27.6',
  'bpmn-js-properties-panel': '0.22.1',
  'camunda-bpmn-moddle': '2.0.0',
  'diagram-js': '0.28.2',
});

Package.onUse(function (api) {
  api.versionsFrom('1.6');
  api.use('ecmascript');
  api.use('templating@1.3.2');
  api.use('underscore');
  api.use('random');
  api.use('jquery');
  api.use('less');
  api.use('reactive-var');
  api.use('aldeed:autoform@6.2.0');
  api.use('aldeed:template-extension@4.0.0');

  api.addAssets([
    '.npm/package/node_modules/bpmn-js-properties-panel/styles/config.json',
    '.npm/package/node_modules/camunda-bpmn-moddle/resources/camunda.json',
    // lOCAL
    'autoform-bpmn.less',
  ], 'client');

  api.addFiles([
    // diagram-js
    // '.npm/package/node_modules/diagram-js/assets/diagram-js.css',
    '.npm/package/node_modules/bpmn-js/dist/assets/diagram-js.css',
    '.npm/package/node_modules/bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css',

    // bpmn-js
    '.npm/package/node_modules/bpmn-js/lib/Modeler.js',

    // PROPERTIES PANEL
    '.npm/package/node_modules/bpmn-js-properties-panel/lib/provider/camunda/index.js',
    '.npm/package/node_modules/bpmn-js-properties-panel/styles/_mixins.less',
    '.npm/package/node_modules/bpmn-js-properties-panel/styles/_variables.less',
    '.npm/package/node_modules/bpmn-js-properties-panel/styles/groups.less',
    '.npm/package/node_modules/bpmn-js-properties-panel/styles/header.less',
    '.npm/package/node_modules/bpmn-js-properties-panel/styles/listeners.less',
    '.npm/package/node_modules/bpmn-js-properties-panel/styles/tabs.less',
    '.npm/package/node_modules/bpmn-js-properties-panel/styles/properties.less',

  ], 'client', { isImport: true });

  api.addFiles([
    //'autoform-bpmn-main.css',
    'autoform-bpmn.html',
    'autoform-bpmn.js',
  ], 'client');
});

/*
Package.onTest(function (api) {
  api.use('ecmascript');
  api.use('underscore');
  api.use('tracker');
  api.use('templating@1.3.2');
  api.use('blaze@2.0.0');
  api.use('meteortesting:mocha');
  api.use('practicalmeteor:chai');
  api.use('jkuester:autoform-testhelper');
  api.use('jkuester:autoform-bpmn');
  api.mainModule('autoform-bpmn-tests.js', 'client');
});
*/