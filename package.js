Package.describe({
    name: 'jkuester:autoform-bpmn',
    version: '0.0.3',
    // Brief, one-line summary of the package.
    summary: 'Integrate the bpmn-js (bpmn.io) modeler into autoform.',
    // URL to the Git repository containing the source code for this package.
    git: 'https://github.com/jankapunkt/meteor-autoform-bpmn.git',
    // By default, Meteor will default to using README.md for documentation.
    // To avoid submitting documentation, set this field to null.
    documentation: 'README.md'
});

Package.onUse(function (api) {
    api.versionsFrom('1.6');
    api.use('ecmascript');
    api.use('templating@1.3.2');
    //api.use('blaze@2.0.0');
    api.use('underscore');
    api.use('random');
    api.use('jquery');
    api.use('reactive-var');
    api.use('aldeed:autoform@6.2.0');
    api.use('aldeed:template-extension@4.0.0');
    api.use('tmeasday:check-npm-versions@0.3.1')
    api.addFiles([
        'autoform-bpmn.css',
        'autoform-bpmn.html',
        'autoform-bpmn.js'
    ], 'client');
});

Package.onTest(function (api) {
    api.use('ecmascript');
    api.use('practicalmeteor:mocha');
    api.use('practicalmeteor:chai');
    api.use('jkuester:autoform-bpmn');
    api.mainModule('autoform-bpmn-tests.js');
});
