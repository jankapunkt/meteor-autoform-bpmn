// the test helpers, you know them
// from the Meteor testing guide
import { Tracker } from "meteor/tracker";
import { Blaze } from "meteor/blaze";

export const withDiv = function withDiv(callback) {
  const el = document.createElement('div');
  document.body.appendChild(el);
  try {
    callback(el);
  } finally {
    document.body.removeChild(el);
  }
};

export const withRenderedTemplate = function withRenderedTemplate(template, data, callback) {
  withDiv((el) => {
    const ourTemplate = _.isString(template) ? Template[template] : template;
    Blaze.renderWithData(ourTemplate, data, el);
    Tracker.flush();
    setTimeout(() => {
      callback(el);
    }, 250);
  });
};

export const getIsRendered = function (template) {
  return function isRendered(name, count) {
    assert.equal(template.find(name).length, count, name);
  };
};

export const getMultipleIsRendered = function (template) {
  const isRendered = getIsRendered(template);

  return function mutlipleIsRendered(arr, count) {
    arr.forEach((el) => {
      isRendered(el, count);
    });
  };
};

export const renderPizza = function(data, done) {
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
}