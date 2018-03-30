import { _ } from 'meteor/underscore';
import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
import { Tracker } from 'meteor/tracker';
import { assert, chai } from 'meteor/practicalmeteor:chai';

//import 'meteor/jkuester:autoform-bpmn';

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
    callback(el);
  });
};

describe('autoform-bpmn', function () {

  beforeEach(function () {
    Template.registerHelper('_', key => key);
  });

  afterEach(function () {
    Template.deregisterHelper('_');
  });


  it('renders correctly with simple data', function () {

    const data = {
      atts: {
        ['data-schema-key']: 'workflowData',
      },
      value: undefined
    };

    withRenderedTemplate('afBpmn', data, el => {
      const template = $(el);
      chai.assert.equal(template.find('djs-container').length, 1);
    });
  });
});
