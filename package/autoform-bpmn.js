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
          $('#af-bpmn-model-input').val(instance.model.get());
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


    Utils.modeler.on('commandStack.changed', _.debounce(function (/* evt */) {

      Utils.saveSVG(function (err, svg) {
        Utils.setEncoded(downloadSvgLink, 'diagram.svg', err ? null : svg);
      });

      Utils.saveDiagram(function (err, xml) {
        $('#af-bpmn-model-input').val(xml);
        Utils.setEncoded(downloadLink, 'diagram.bpmn', err ? null : xml);
      });

      return true;
    }, 500));
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

        const  importXml = result && result.currentTarget && result.currentTarget.result;
        if (importXml) {
          Utils.modeler.importXML(importXml, function (err, res) {
            if (err) Utils.modeler.importXML(templateInstance.model.get());
            if (res) $('#af-bpmn-model-input').val(importXml);
          });
        }
      };

      // Read in the image file as a data URL.
      reader.readAsText(file);
    }
  },
});
