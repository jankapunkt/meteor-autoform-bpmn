import { Template } from 'meteor/templating';
import { Random } from 'meteor/random';
import { ReactiveVar } from 'meteor/reactive-var';
import { $ } from 'meteor/jquery';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import propertiesPanelModule from 'bpmn-js-properties-panel';
import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda';
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda';


import {Utils} from "./autoform-bpmn-utils";

BpmnModelerUtils = Utils; // expose it to make it testable

//import 'diagram-js/assets/diagram-js.css';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import './autoform-bpmn.less';


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

Template.afBpmn.onCreated(function () {
  // TODO add upload button and use this flag to indicate upload capabilities
  // const uploadSupported = window.File && window.FileReader && window.FileList && window.Blob;

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
      Utils.modeler.on('element.click', Utils.onElementClick.bind(instance));
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
  const instance = this;

  if (!instance._rendered) {
    instance._rendered = true;

    Utils.canvas = $('#af-bpmn-canvas');
    Utils.container = $('#af-bpmn-drop-zone');
    Utils.propertiesParent = $('#af-bpmn-properties-panel');
    const downloadLink = $('#af-bpmn-download-diagram');
    const downloadSvgLink = $('#af-bpmn-download-svg');

    Utils.modeler = new BpmnModeler({
      container: Utils.canvas,
      additionalModules: [
        propertiesPanelModule,
        propertiesProviderModule,
      ],
      propertiesPanel: {
        parent: Utils.propertiesParent,
      },
      // make camunda prefix known for import, editing and export
      moddleExtensions: {
        camunda: camundaModdleDescriptor,
      },
    });


    Utils.modeler.on('commandStack.changed', Utils.exportArtifacts({downloadSvgLink, downloadLink}));
  }

  if (Utils.canvas && Utils.container && Utils.propertiesParent && !!$('.bpp-properties-panel')[0]) {
    this.modelerLoaded.set(true);
  }
});

Template.afBpmn.helpers({
  dataSchemaKey() {
    return Template.instance().key.get();
  },
  loadComplete() {
    return Template.instance().loadComplete.get() &&
      Template.instance().loadComplete.get();
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
  },
});


Template.afBpmn.events({

  'submit'(event) {
    event.preventDefault();
  },


  'change #af-bpmn-file-upload'(event, templateInstance) {
    const target = $('#af-bpmn-file-upload').get(0);
    const { files } = target;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();

      // Closure to capture the file information.
      reader.onloadend = function (result) {
        if (result && result.currentTarget && result.currentTarget.result) {
          Utils.modeler.importXML(result.currentTarget.result, function (err) {
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
        setTimeout(() => {
          templateInstance.saving.set(false);
        }, 500);
      }
    });
  },
});
