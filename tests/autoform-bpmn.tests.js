import { _ } from 'meteor/underscore';
import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
import { Tracker } from 'meteor/tracker';
import { assert } from 'meteor/practicalmeteor:chai';
import {Random} from 'meteor/random';

import SimpleSchema from 'simpl-schema';
SimpleSchema.extendOptions(['autoform']);

import {BpmnModelerUtils as Utils} from 'meteor/jkuester:autoform-bpmn';
import { pizza } from "./pizza";

// the test helpers, you know them
// from the Meteor testing guide

const withDiv = function withDiv(callback) {
  const el = document.createElement('div');
  document.body.appendChild(el);
  try {
    callback(el);
  } finally {
    document.body.removeChild(el);
  }
};

const withRenderedTemplate = function withRenderedTemplate(template, data, callback) {
  withDiv((el) => {
    const ourTemplate = _.isString(template) ? Template[template] : template;
    Blaze.renderWithData(ourTemplate, data, el);
    Tracker.flush();
    setTimeout(() => {
      callback(el);
    }, 250);
  });
};

const coverageUrlId = 'afBbpmn-coverage-target'; // used as target for new tab

describe('autoform-bpmn', function () {

  beforeEach(function () {
    Template.registerHelper('_', key => key);
  });

  afterEach(function () {
    Template.deregisterHelper('_');
  });


  const getIsRendered = function (template) {
    return function isRendered(name, count) {
      assert.equal(template.find(name).length, count, name);
    };
  };

  const getMultipleIsRendered = function (template) {
    const isRendered = getIsRendered(template);

    return function mutlipleIsRendered(arr, count) {
      arr.forEach(el => {
        isRendered(el, count);
      })
    }

  };

  describe('utils', function () {

    it('createProcess', function () {
      const randomId = Random.id();
      const processXml = Utils.createProcess(randomId);
      assert.isAbove(processXml.indexOf(randomId), -1);
    });

    it ('setEncoded', function () {
      assert.fail();
    });

    it('saveDiagram', function () {
      assert.fail();
    });

    it('saveSVG', function () {
      assert.fail();
    });

    it('onElementClick', function () {
      assert.fail();
    })  ;
  });

  describe('default render', function () {

    const data = {
      atts: {
        'data-schema-key': 'workflowData',

      },
      value: undefined,
    };

    it('renders the hidden inputs', function (done) {
      withRenderedTemplate('afBpmn', data, (el) => {
        const hiddenInput = $($(el).find('#af-bpmn-model-input')[0]);
        assert.equal(hiddenInput.attr('type'), 'hidden');
        assert.equal(hiddenInput.attr('data-schema-key'), data.atts['data-schema-key']);
        done();
      });
    });

    it('renders all containers', function (done) {
      withRenderedTemplate('afBpmn', data, (el) => {
        const template = $(el);
        const rendersAll = getMultipleIsRendered(template);

        const containers = [
          '.bjs-container',
          '.djs-container',
          '.djs-tooltip-container',
          '.djs-overlay-container',
        ];
        rendersAll(containers, 1);

        // svg content
        //isRendered('svg', 1);
        done();
      });
    });

    it('renders all tools', function (done) {
      withRenderedTemplate('afBpmn', data, (el) => {
        const template = $(el);
        const rendersAll = getMultipleIsRendered(template);

        const tools = [
          '.djs-palette',
          '.bpmn-icon-hand-tool',
          '.bpmn-icon-lasso-tool',
          '.bpmn-icon-space-tool',
          '.bpmn-icon-connection-multi',
          '.bpmn-icon-start-event-none',
          '.bpmn-icon-intermediate-event-none',
          '.bpmn-icon-end-event-none',
          '.bpmn-icon-gateway-xor',
          '.bpmn-icon-task',
          '.bpmn-icon-subprocess-expanded',
          '.bpmn-icon-data-object',
          '.bpmn-icon-data-store',
          '.bpmn-icon-participant',
        ];
        rendersAll(tools, 1);

        done();
      });
    });

    it('renders the properties panel and all its children', function (done) {
      withRenderedTemplate('afBpmn', data, (el) => {
        const template = $(el);
        const rendersAll = getMultipleIsRendered(template);


        const properties = [
          '.bpp-properties-panel',
          '.bpp-properties',
          '.bpp-properties-header',
          '.bpp-properties-tab-bar',
          '.bpp-properties-tabs-links',
        ];
        rendersAll(properties, 1);

        done();
      });
    })

    it('renders the camunda moddle related properties as tab sections', function (done) {
      withRenderedTemplate('afBpmn', data, (el) => {
        const template = $(el);
        const rendersAll = getMultipleIsRendered(template);

        const properties = [
          'a[data-tab-target="general"]',
          'a[data-tab-target="variables"]',
          'a[data-tab-target="connector"]',
          'a[data-tab-target="forms"]',
          'a[data-tab-target="listeners"]',
          'a[data-tab-target="input-output"]',
          'a[data-tab-target="field-injections"]',
          'a[data-tab-target="extensionElements"]',
        ];
        rendersAll(properties, 1);

        done();
      });
    });

    it('renders action buttons', function (done) {
      withRenderedTemplate('afBpmn', data, (el) => {
        const template = $(el);
        const rendersAll = getMultipleIsRendered(template);

        const buttons = [
          '#af-bpmn-download-diagram',
          '#af-bpmn-download-svg',
          '#af-bpmn-save-diagram',
        ];
        rendersAll(buttons, 1);

        done();
      });
    })

    it('renders a single process element (startevent) by default', function (done) {
      withRenderedTemplate('afBpmn', data, (el) => {
        const svgRoot = $($(el).find('svg')[0]);
        const rendersAll = getMultipleIsRendered(svgRoot);

        const elements = [
          '.djs-element',
          '.djs-shape',
        ];
        rendersAll(elements, 2);

        const elementAtts = [
          'g[data-element-id="StartEvent_1"]',
          'g[data-element-id="StartEvent_1_label"]',
        ];

        rendersAll(elementAtts, 1);


        done();
      });
    })

  });

  describe('render with existing BPMN model', function () {


    const data = {
      atts: {
        'data-schema-key': 'workflowData',
      },
      value: pizza,
    };

    it('renders an imported process diagram', function (done) {
      withRenderedTemplate('afBpmn', data, (el) => {
        const svgRoot = $($(el).find('svg')[0]);
        const rendersAll = getMultipleIsRendered(svgRoot);
        const isRendered = getIsRendered(svgRoot);

        isRendered('.djs-element', 80);
        isRendered('.djs-shape', 56);

        const elementAtts = [
          'g[data-element-id="_6-650"]',
          'g[data-element-id="_6-446"]',
          'g[data-element-id="_6-450"]',
          'g[data-element-id="_6-652"]',
          'g[data-element-id="_6-674"]',
          'g[data-element-id="_6-695"]',
          'g[data-element-id="_6-463"]',
          'g[data-element-id="_6-514"]',
          'g[data-element-id="_6-565"]',
          'g[data-element-id="_6-616"]',
          'g[data-element-id="_6-630"]',
          'g[data-element-id="_6-632"]',
          'g[data-element-id="_6-634"]',
          'g[data-element-id="_6-636"]',
          'g[data-element-id="_6-691"]',
          'g[data-element-id="_6-693"]',
          'g[data-element-id="_6-746"]',
          'g[data-element-id="_6-748"]',
          'g[data-element-id="_6-61"]',
          'g[data-element-id="_6-74"]',
          'g[data-element-id="_6-127"]',
          'g[data-element-id="_6-180"]',
          'g[data-element-id="_6-202"]',
          'g[data-element-id="_6-219"]',
          'g[data-element-id="_6-236"]',
          'g[data-element-id="_6-304"]',
          'g[data-element-id="_6-355"]',
          'g[data-element-id="_6-406"]',
          'g[data-element-id="_6-125"]',
          'g[data-element-id="_6-178"]',
          'g[data-element-id="_6-420"]',
          'g[data-element-id="_6-422"]',
          'g[data-element-id="_6-424"]',
          'g[data-element-id="_6-426"]',
          'g[data-element-id="_6-428"]',
          'g[data-element-id="_6-430"]',
          'g[data-element-id="_6-434"]',
          'g[data-element-id="_6-436"]',
        ];

        rendersAll(elementAtts, 1);


        done();
      });
    })
  });

  after(function () {
    Meteor.sendCoverage(function (stats, err) {
      console.log(stats, err);
      window.open(Meteor.absoluteUrl()+"/coverage", coverageUrlId)
    });
  });

});