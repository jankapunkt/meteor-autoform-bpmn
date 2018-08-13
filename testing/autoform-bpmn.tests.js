import { Template } from 'meteor/templating'
import { assert } from 'meteor/practicalmeteor:chai'
import { Random } from 'meteor/random'
import SimpleSchema from 'simpl-schema'
import { BpmnModelerUtils as Utils } from 'meteor/jkuester:autoform-bpmn'

import { renderPizza, getIsRendered, getMultipleIsRendered, withRenderedTemplate } from './testutils.tests'
import { pizza } from './pizza'

SimpleSchema.extendOptions(['autoform'])

const coverageUrlId = 'afBbpmn-coverage-target' // used as target for new tab

describe('autoform-bpmn', function () {
  beforeEach(function () {
    Template.registerHelper('_', key => key)
  })

  afterEach(function () {
    Template.deregisterHelper('_')
  })

  describe('utils', function () {
    it('createProcess', function () {
      const randomId = Random.id()
      const processXml = Utils.createProcess(randomId)
      assert.isAbove(processXml.indexOf(randomId), -1)
    })

    it('setEncoded (with data)', function () {
      const randomId = Random.id()
      const processXml = Utils.createProcess(randomId)
      const encodedData = encodeURIComponent(processXml)
      const enabledLink = $('<a>')
      const enabledName = 'enabled_link'
      Utils.setEncoded(enabledLink, enabledName, processXml)
      assert.equal(enabledLink.prop('disabled'), false)
      assert.equal(enabledLink.attr('download'), enabledName)
      const href = enabledLink.attr('href')
      assert.isAbove(href.indexOf(encodedData), -1)
    })

    it('setEncoded (no data)', function () {
      const disabledLink = $('<a></a>')
      Utils.setEncoded(disabledLink, '', null)
      assert.equal(disabledLink.prop('disabled'), true)
      assert.isUndefined(disabledLink.attr('download'))
      assert.isUndefined(disabledLink.attr('href'))
    })

    it('saveDiagram', function (done) {
      Utils.modeler = {
        saveXML (obj, cb) {
          assert.isTrue(obj.format)
          cb()
        }
      }
      Utils.saveDiagram(() => {
        done()
      })
    })

    it('saveSVG', function (done) {
      Utils.modeler = {
        saveSVG (cb) {
          cb()
        }
      }
      Utils.saveSVG(() => {
        done()
      })
    })

    it('onElementClick', function () {
      const instance = {
        currentTarget: {
          value: null,
          set (value) {
            this.value = value
          }
        }
      }
      const id = Random.id()
      const bound = Utils.onElementClick.bind(instance)
      bound({
        element: {
          businessObject: id
        }
      })

      assert.equal(instance.currentTarget.value, id)
    })
  })

  describe('default render', function () {
    const data = {
      atts: {
        'data-schema-key': 'workflowData'

      },
      value: undefined
    }

    it('renders the hidden inputs', function (done) {
      withRenderedTemplate('afBpmn', data, (el) => {
        const hiddenInput = $($(el).find('#af-bpmn-model-input')[0])
        assert.equal(hiddenInput.attr('type'), 'hidden')
        assert.equal(hiddenInput.attr('data-schema-key'), data.atts['data-schema-key'])
        done()
      })
    })

    it('renders all containers', function (done) {
      withRenderedTemplate('afBpmn', data, (el) => {
        const template = $(el)
        const rendersAll = getMultipleIsRendered(template)

        const containers = [
          '.bjs-container',
          '.djs-container',
          '.djs-tooltip-container',
          '.djs-overlay-container'
        ]
        rendersAll(containers, 1)

        // svg content
        // isRendered('svg', 1);
        done()
      })
    })

    it('renders all tools', function (done) {
      withRenderedTemplate('afBpmn', data, (el) => {
        const template = $(el)
        const rendersAll = getMultipleIsRendered(template)

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
          '.bpmn-icon-participant'
        ]
        rendersAll(tools, 1)

        done()
      })
    })

    it('renders the properties panel and all its children', function (done) {
      withRenderedTemplate('afBpmn', data, (el) => {
        const template = $(el)
        const rendersAll = getMultipleIsRendered(template)

        const properties = [
          '.bpp-properties-panel',
          '.bpp-properties',
          '.bpp-properties-header',
          '.bpp-properties-tab-bar',
          '.bpp-properties-tabs-links'
        ]
        rendersAll(properties, 1)

        done()
      })
    })

    it('renders the camunda moddle related properties as tab sections', function (done) {
      withRenderedTemplate('afBpmn', data, (el) => {
        const template = $(el)
        const rendersAll = getMultipleIsRendered(template)

        const properties = [
          'a[data-tab-target="general"]',
          'a[data-tab-target="variables"]',
          'a[data-tab-target="connector"]',
          'a[data-tab-target="forms"]',
          'a[data-tab-target="listeners"]',
          'a[data-tab-target="input-output"]',
          'a[data-tab-target="field-injections"]',
          'a[data-tab-target="extensionElements"]'
        ]
        rendersAll(properties, 1)

        done()
      })
    })

    it('renders action buttons', function (done) {
      withRenderedTemplate('afBpmn', data, (el) => {
        const template = $(el)
        const rendersAll = getMultipleIsRendered(template)

        const buttons = [
          '#af-bpmn-download-diagram',
          '#af-bpmn-download-svg',
          '#af-bpmn-file-upload'
        ]
        rendersAll(buttons, 1)

        done()
      })
    })

    it('renders a single process element (startevent) by default', function (done) {
      withRenderedTemplate('afBpmn', data, (el) => {
        const svgRoot = $($(el).find('svg')[0])
        const rendersAll = getMultipleIsRendered(svgRoot)

        const elements = [
          '.djs-element',
          '.djs-shape'
        ]
        rendersAll(elements, 2)

        const elementAtts = [
          'g[data-element-id="StartEvent_1"]',
          'g[data-element-id="StartEvent_1_label"]'
        ]

        rendersAll(elementAtts, 1)

        done()
      })
    })
  })

  describe('render with existing BPMN model', function () {
    const data = {
      atts: {
        'data-schema-key': 'workflowData'
      },
      value: pizza
    }

    it('renders an imported process diagram', function (done) {
      renderPizza(data, done)
    })
  })

  describe('render view-mode on disabled form', function () {
    const data = {
      atts: {
        'data-schema-key': 'workflowData',
        disabled: ''
      },
      value: pizza
    }

    it('renders action buttons but not import', function (done) {
      withRenderedTemplate('afBpmn', data, (el) => {
        const template = $(el)
        const isRendered = getIsRendered(template)
        isRendered('#af-bpmn-download-diagram', 1)
        isRendered('#af-bpmn-download-svg', 1)
        isRendered('#af-bpmn-file-upload', 0)
        done()
      })
    })

    it('does not render the properties panel', function (done) {
      withRenderedTemplate('afBpmn', data, (el) => {
        const template = $(el)
        const rendersAll = getMultipleIsRendered(template)

        const properties = [
          'a[data-tab-target="general"]',
          'a[data-tab-target="variables"]',
          'a[data-tab-target="connector"]',
          'a[data-tab-target="forms"]',
          'a[data-tab-target="listeners"]',
          'a[data-tab-target="input-output"]',
          'a[data-tab-target="field-injections"]',
          'a[data-tab-target="extensionElements"]'
        ]
        rendersAll(properties, 0)

        done()
      })
    })

    it('renders all elments of an imported process diagram', function (done) {
      renderPizza(data, done)
    })
  })

  after(function () {
    Meteor.sendCoverage(function (/* stats, err */) {
      window.open(`${Meteor.absoluteUrl()}/coverage`, coverageUrlId)
    })
  })
})
