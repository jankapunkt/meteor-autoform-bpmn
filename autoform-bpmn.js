import { Template } from 'meteor/templating';
import { Random } from 'meteor/random';
import { ReactiveVar } from 'meteor/reactive-var';
import { $ } from 'meteor/jquery';

import 'diagram-js/assets/diagram-js.css';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';

import './autoform-bpmn.less';
import './autoform-bpmn-main.css';


const BpmnModeler = require('bpmn-js/lib/Modeler');
const propertiesPanelModule = require('bpmn-js-properties-panel');
const propertiesProviderModule = require('bpmn-js-properties-panel/lib/provider/camunda');
const camundaModdleDescriptor = require('camunda-bpmn-moddle/resources/camunda');


// extend autoform with bpmn modeler
AutoForm.addInputType('bpmn', {
  template: 'afBpmn',
  valueOut() {
    return this.val();
  },
  valueIn(initialValue) {
    return initialValue;
  },
});


export const Utils = {

  modeler: null,
  canvas: null,
  container: null,

  createProcess (title) {
    const newProcess =
      `<?xml version="1.0" encoding="UTF-8"?>
        <bpmn2:definitions 
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
          xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" 
          xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
          xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
          xmlns:di="http://www.omg.org/spec/DD/20100524/DI" 
          xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd" 
          id="${Random.id()}"
          targetNamespace="http://bpmn.io/schema/bpmn"> 
          <bpmn2:process id="${title}" isExecutable="true"> 
            <bpmn2:startEvent id="StartEvent_1"/> 
          </bpmn2:process> 
          <bpmndi:BPMNDiagram id="BPMNDiagram_1"> 
            <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="${title}"> 
            <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1"> 
              <dc:Bounds height="36.0" width="36.0" x="412.0" y="240.0"/> 
            </bpmndi:BPMNShape> 
          </bpmndi:BPMNPlane> 
        </bpmndi:BPMNDiagram> 
      </bpmn2:definitions>`;
    return newProcess;
  },

  setEncoded(link, name, data) {
    const encodedData = encodeURIComponent(data);
    if (data) {
      link.prop('disabled', false).attr({
        href: `data:application/bpmn20-xml;charset=UTF-8,${encodedData}`,
        download: name,
      });
    } else {
      link.prop('disabled', true);
    }
  },
  saveDiagram (done) {
    Utils.modeler.saveXML({ format: true }, function (err, xml) {
      done(err, xml);
    });
  },
  saveSVG() {},
};


const onElementClick = function (event) {
  const instance = this; // because we bind instance to this context
  const element = event.element;
  const businessObject = element.businessObject;
  instance.currentTarget.set(businessObject);
};

Template.afBpmn.onCreated(function () {
  const uploadSupported = window.File && window.FileReader && window.FileList && window.Blob;

  const instance = this;
  instance.modelerLoaded = new ReactiveVar(false);
  instance.loadComplete = new ReactiveVar(false);
  instance.saving = new ReactiveVar(false);
  instance.dataModel = new ReactiveVar(this.data.value);
  instance.model = new ReactiveVar(instance.data.value || Utils.createProcess(this.data.title || Random.id()));
  instance.currentTarget = new ReactiveVar(false);

  const { atts } = this.data;

  instance.key = new ReactiveVar(atts['data-schema-key'] || '');
  instance.mapping = new ReactiveVar(atts.mapping);

  instance.serviceProvider = atts.service; // TODO use extension instead of replacing?

  instance.autorun(function () {
    if (instance.modelerLoaded.get()) {
      Utils.modeler.on('element.click', onElementClick.bind(instance));
      Utils.modeler.importXML(instance.model.get(), function (err, res) {
        if (res) {
          Utils.container.removeClass('with-error').addClass('with-diagram');
          instance.loadComplete.set(true);
        }
      });
    }
  });
});

Template.afBpmn.onRendered(function () {
  if (!this._rendered) {
    this._rendered = true;

    Utils.canvas = $('#af-bpmn-canvas');
    Utils.container = $('#af-bpmn-drop-zone');
    const downloadLink = $('#af-bpmn-download-diagram');
    const downloadSvgLink = $('#af-bpmn-download-svg');

    Utils.modeler = new BpmnModeler({
      container: Utils.canvas,
      additionalModules: [
        propertiesPanelModule,
        propertiesProviderModule,
      ],
      propertiesPanel: {
        parent: '#af-bpmn-properties-panel',
      },
      // make camunda prefix known for import, editing and export
      moddleExtensions: {
        camunda: camundaModdleDescriptor,
      },
    });


    const exportArtifacts = _.debounce(function (evt) {

      Utils.saveSVG(function(err, svg) {
        Utils.setEncoded(downloadSvgLink, 'diagram.svg', err ? null : svg);
      });

      Utils.saveDiagram(function (err, xml) {
        Utils.setEncoded(downloadLink, 'diagram.bpmn', err ? null : xml);
      });

      return true;
    }, 500);

    Utils.modeler.on('commandStack.changed', exportArtifacts);

    this.modelerLoaded.set(true);
  }
});

Template.afBpmn.helpers({
  dataSchemaKey() {
    return Template.instance().key.get();
  },
  loadComplete() {
    return Template.instance().loadComplete.get();
  },
  dataModel() {
    const model = Template.instance().dataModel.get();
    if (model !== this.value) {
      Template.instance().dataModel.set(this.value);
      Utils.modeler.importXML(this.value, function (err, res) {
        if (res) {
          Utils.modeler.get('canvas').zoom('fit-viewport');
          Utils.container.removeClass('with-error').addClass('with-diagram');
          this.loadComplete.set(true);
        }
      }.bind(Template.instance()));
    }
    return model;
  },
  saving() {
    return Template.instance().saving.get();
  }
});


Template.afBpmn.events({

  'submit'(event, instance) {
    event.preventDefault();
  },


  'change #af-bpmn-file-upload'(event, templateInstance) {
    const target = $('#af-bpmn-file-upload').get(0);
    const files = target.files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();

      // Closure to capture the file information.
      reader.onloadend = function (result) {
        if (result && result.currentTarget && result.currentTarget.result) {
          Utils.modeler.importXML(result.currentTarget.result, function (err, res) {
            if (err) Utils.modeler.importXML(templateInstance.dataModel.get());
            // else notify
          });
        }
      };

      // Read in the image file as a data URL.
      reader.readAsText(file);
    }
  },

  'click #af-bpmn-save-diagram'(event, templateInstance) {
    event.preventDefault();
    templateInstance.saving.set(true);
    Utils.modeler.saveXML({ format: true }, (err, res) => {
      if (res) {
        $('#af-bpmn-model-input').val(res);
        templateInstance.model.set(res);
        setTimeout(()=>{
          templateInstance.saving.set(false);
        }, 500);
      }
    });
  }
});
