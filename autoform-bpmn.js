import { Template } from 'meteor/templating';
import { Random } from 'meteor/random';
import { ReactiveVar } from 'meteor/reactive-var';
import { $ } from 'meteor/jquery';
import { checkNpmVersions } from 'meteor/tmeasday:check-npm-versions';

checkNpmVersions({ 'simpl-schema': '0.x.x' }, 'jkuester:autoform-bpmn');
checkNpmVersions({ 'bpmn-js': '0.x.x' }, 'jkuester:autoform-bpmn');
checkNpmVersions({ 'diagram-js': '1.x.x' }, 'jkuester:autoform-bpmn');

import BpmnModeler from 'bpmn-js/lib/Modeler';
import 'diagram-js/assets/diagram-js.css';
import 'bpmn-js/assets/bpmn-font/css/bpmn-embedded.css';

// extend autoform with bpmn modeler
AutoForm.addInputType("bpmn", {
    template: "afBpmn",
    valueOut() {
        return this.val();
    },
    valueIn(initialValue) {
        return initialValue;
    }
});

window.BpmnUtils = {
    modeler: null,
    canvas: null,
    container: null,
    createProcess: function (title) {
        const newProcess =
            '<?xml version="1.0" encoding="UTF-8"?>' +
            '<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
            'xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
            'xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" ' +
            'xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" ' +
            'xmlns:di="http://www.omg.org/spec/DD/20100524/DI" ' +
            'xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd" ' +
            'id="' + Random.id() + '" ' +
            'targetNamespace="http://bpmn.io/schema/bpmn">' +
            '<bpmn2:process id="' + title + '" isExecutable="true">' +
            '<bpmn2:startEvent id="StartEvent_1"/> ' +
            '</bpmn2:process> ' +
            '<bpmndi:BPMNDiagram id="BPMNDiagram_1"> ' +
            '<bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="' + title + '"> ' +
            '<bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1"> ' +
            '<dc:Bounds height="36.0" width="36.0" x="412.0" y="240.0"/> ' +
            '</bpmndi:BPMNShape> ' +
            '</bpmndi:BPMNPlane> ' +
            '</bpmndi:BPMNDiagram> ' +
            '</bpmn2:definitions>';
        return newProcess;
    }
};

const setEncoded = function (link, name, data) {
    const encodedData = encodeURIComponent(data);
    if (data) {
        link.prop('disabled', false).attr({
            'href': 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData,
            'download': name,
        });
    } else {
        link.prop('disabled', true)
    }
};

const saveDiagram = function (done) {
    BpmnUtils.modeler.saveXML({ format: true }, function (err, xml) {
        done(err, xml);
    });
};


const onElementClick = function (event) {
    const instance = this; //because we bind instance to this context
    const element = event.element;
    const businessObject = element.businessObject;
    instance.currentTarget.set(businessObject);
};

const ViewModes = {
    source: "source",
    modeler: "modeler",
};

Template.afBpmn.onCreated(function () {


    const uploadSupported = window.File && window.FileReader && window.FileList && window.Blob;

    const instance = this;
    instance.loaded = new ReactiveVar(false);
    instance.loadComplete = new ReactiveVar(false);
    instance.dataModel = new ReactiveVar(this.data.value);
    instance.model = new ReactiveVar(instance.data.value || BpmnUtils.createProcess(this.data.title || Random.id()));
    instance.key = new ReactiveVar(this.data.atts['data-schema-key'] || "");
    instance.mapping = new ReactiveVar(this.data.atts.mapping);
    instance.viewMode = new ReactiveVar("");
    instance.viewMode.set(ViewModes.modeler);
    instance.currentTarget = new ReactiveVar(false);

    // BUTTON BAR
    instance.saveButton = new ReactiveVar(this.data.atts.saveButton || this.data.atts.buttons);
    instance.importButton = new ReactiveVar(this.data.atts.importButton || this.data.atts.buttons);
    instance.exportButton = new ReactiveVar(this.data.atts.exportButton || this.data.atts.buttons);
    instance.switchButton = new ReactiveVar(this.data.atts.switchButton || this.data.atts.buttons);

    instance.autorun(function () {


        if (instance.loaded.get()) {


            BpmnUtils.modeler.on('element.click', onElementClick.bind(instance));
            BpmnUtils.modeler.importXML(instance.model.get(), function (err, res) {
                if (res) {
                    BpmnUtils.container.removeClass("with-error").addClass('with-diagram');
                    instance.loadComplete.set(true);
                }
            });
        }

    });
});

Template.afBpmn.onRendered(function () {
    if (!this._rendered) {
        this._rendered = true;

        BpmnUtils.canvas = $('#af-bpmn-canvas');
        BpmnUtils.container = $('#af-bpmn-drop-zone');
        const downloadLink = $('#af-bpmn-exportButton');

        //console.log(BPMN.canvas);

        BpmnUtils.modeler = new BpmnModeler({
            container: BpmnUtils.canvas
        });

        if (!this.data.atts.saveButton) {
            const eventBus = BpmnUtils.modeler.get("eventBus");

            //use these events
            //commandStack.changed
            //elements.changed

            eventBus.on('element.mousedown', function () {
                BpmnUtils.modeler.saveXML({ format: true }, function (err, res) {
                    if (res) {
                        console.log("save", res)
                        $('#af-bpmn-model-input').val(res);
                        instance.model.set(res);
                    }
                });
            });
        }

        const exportArtifacts = _.debounce(function () {

            //saveSVG(function(err, svg) {
            //    setEncoded(downloadSvgLink, 'diagram.svg', err ? null : svg);
            //});

            saveDiagram(function (err, xml) {
                setEncoded(downloadLink, 'diagram.bpmn', err ? null : xml);
            });
        }, 500);

        BpmnUtils.modeler.on('commandStack.changed', exportArtifacts);
        this.loaded.set(true);
    }
});

Template.afBpmn.helpers({
    dataSchemaKey() {
        return Template.instance().key.get();
    },

    uploadSupprted() {
        return window.File && window.FileReader && window.FileList && window.Blob;
    },

    loadComplete() {
        return Template.instance().loadComplete.get();
    },
    dataModel() {
        const model = Template.instance().dataModel.get();
        if (model != this.value) {
            //console.log("this.value changed")
            Template.instance().dataModel.set(this.value);
            BpmnUtils.modeler.importXML(this.value, function (err, res) {
                //console.log(err, res);
                if (res) {
                    BpmnUtils.modeler.get("canvas").zoom('fit-viewport');
                    BpmnUtils.container.removeClass("with-error").addClass('with-diagram');
                    this.loadComplete.set(true);
                }
            }.bind(Template.instance()));

        }
        return model;
    },

    sourceView() {
        return Template.instance().viewMode.get() === ViewModes.source;
    },
    source() {
        return Template.instance().dataModel.get();
    },

    saveButton() {
        return Template.instance().saveButton.get();
    },
    exportButton() {
        return Template.instance().exportButton.get();
    },
    importButton() {
        return Template.instance().exportButton.get();
    },
    switchButton() {
        return Template.instance().exportButton.get();
    },


    currentTarget() {
        return Template.instance().currentTarget.get();
    },
    isTask() {
        const target = Template.instance().currentTarget.get();
        return target && target.$type.toLowerCase().indexOf("task") > -1;
    },
    isEvent() {
        const target = Template.instance().currentTarget.get();
        return target && target.$type.toLowerCase().indexOf("event") > -1;
    },
    isGateway() {
        const target = Template.instance().currentTarget.get();
        return target && target.$type.toLowerCase().indexOf("gateway") > -1;
    },
    isSequenceFlow() {
        const target = Template.instance().currentTarget.get();
        return target && target.$type.toLowerCase().indexOf("sequence") > -1;
    },
    sequenceFlowDecisionOption() {
        const currentTarget = Template.instance().currentTarget.get()
        console.log("sequenceFlowDecisionOption: ", currentTarget);
        return currentTarget && currentTarget.conditionExpression
            ? currentTarget.conditionExpression.body
            : "";
    },
    followsExclusiveGateway() {
        const target = Template.instance().currentTarget.get();
        return target && target.sourceRef.$type.toLowerCase().indexOf("exclusivegateway") > -1;
    },
    taskMapping() {
        const mapping = Template.instance().mapping.get();
        if (!mapping || !mapping.task) return null;
        return mapping.task;
    },
    mappingSelected(value) {
        const target = Template.instance().currentTarget.get();
        console.log(target.documentation[0].text, value, target.documentation[0].text === value);
        return !!(target && target.documentation &&
            target.documentation.length > 0 &&
            target.documentation[0] &&
            target.documentation[0].text === value);
    },
});


Template.afBpmn.events({

    'click #af-bpmn-saveButton'(event, instance) {
        event.preventDefault();

        BpmnUtils.modeler.saveXML({ format: true }, function (err, res) {
            if (res) {
                console.log("save", res)
                $('#af-bpmn-model-input').val(res);
                instance.model.set(res);
            }
        });
    },

    'change #af-bpmn-task-mappingselect'(event, instance) {
        const currentTarget = instance.currentTarget.get();
        const mapping = instance.mapping.get();
        const moddle = BpmnUtils.modeler.get('moddle');
        const elementRegistry = BpmnUtils.modeler.get('elementRegistry');
        const modeling = BpmnUtils.modeler.get('modeling');

        const selectedValue = $('#af-bpmn-task-mappingselect').val();
        let name;
        for (let entry of mapping.task) {
            if (entry.value == selectedValue) {
                name = entry.label;
                break;
            }
        }
        if (!name) name = "Unnamed Task";
        currentTarget.name = name;
        const element = elementRegistry.get(currentTarget.id);
        const documentation = moddle.create('bpmn:Documentation', {
            text: selectedValue,
        });

        modeling.updateProperties(element, {
            documentation: [documentation],
        });
    },

    'click .af-bpmn-nameinput'(event, instance) {
        event.preventDefault();
        const ref = $(event.currentTarget).attr("data-ref");

        const gatewayName = $('#' + ref).val();
        const target = instance.currentTarget.get();
        target.name = gatewayName;
        console.log(gatewayName, target);
    },

    'click #af-bpmn-save-sequenceflow'(event, instance) {
        event.preventDefault();
        const ref = $(event.currentTarget).attr("data-ref");
        const expression = $('#' + ref).val();
        const currentTarget = instance.currentTarget.get();
        const moddle = BpmnUtils.modeler.get('moddle');
        const elementRegistry = BpmnUtils.modeler.get('elementRegistry');
        const modeling = BpmnUtils.modeler.get('modeling');

        const element = elementRegistry.get(currentTarget.id);
        const newCondition = moddle.create('bpmn:FormalExpression', {
            body: "<![CDATA[" + expression + "]]>",
            language: "javascript",
        });
        modeling.updateProperties(element, {
            conditionExpression: newCondition
        });
        console.log(currentTarget);
    },

    'click #af-bpmn-switchButton'(event, instance) {
        event.preventDefault();
        instance.currentTarget.set(null);

        const currentView = instance.viewMode.get();
        if (currentView === ViewModes.source) {
            instance.viewMode.set(ViewModes.modeler);
        }
        if (currentView === ViewModes.modeler) {
            instance.viewMode.set(ViewModes.source)
        }
    },

    'change #af-bpmn-file-upload'(event, instance) {
        const target = $('#af-bpmn-file-upload').get(0);
        const files = target.files;
        if (files && files[0]) {
            const file = files[0];
            const reader = new FileReader();

            // Closure to capture the file information.
            reader.onloadend = function (result) {
                console.log(result);
                if (result && result.currentTarget && result.currentTarget.result) {
                    BpmnUtils.modeler.importXML(result.currentTarget.result, function (err, res) {
                        if (err) BpmnUtils.modeler.importXML(instance.dataModel.get());
                        //else notify
                    });
                }
            };

            // Read in the image file as a data URL.
            reader.readAsText(file);
        }
    },
})