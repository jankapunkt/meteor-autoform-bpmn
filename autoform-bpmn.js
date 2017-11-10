import {Template} from 'meteor/templating';
import {Random} from 'meteor/random';
import {ReactiveVar} from 'meteor/reactive-var';
import {$} from 'meteor/jquery';
import {checkNpmVersions} from 'meteor/tmeasday:check-npm-versions';

//checkNpmVersions({ 'simpl-schema': '0.x.x' }, 'jkuester:autoform-bpmn');
//checkNpmVersions({ 'bpmn-js': '0.x.x' }, 'jkuester:autoform-bpmn');
//checkNpmVersions({ 'diagram-js': '0.x.x' }, 'jkuester:autoform-bpmn');
//checkNpmVersions({ 'matches-selector': '1.x.x' }, 'jkuester:autoform-bpmn');

import BpmnModeler from 'bpmn-js/lib/Modeler';
import 'diagram-js/assets/diagram-js.css';
import 'bpmn-js/assets/bpmn-font/css/bpmn-embedded.css';
//import './bpmn.css';
//import './bpmn.html'


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

const onElementClick = function (event) {
    const instance = this; //because we bind instance to this context
    const element = event.element;
    const businessObject = element.businessObject;
    instance.currentTarget.set(businessObject);
};

Template.afBpmn.onCreated(function () {


    const instance = this;
    instance.loaded = new ReactiveVar(false);
    instance.dataModel = new ReactiveVar(this.data.value);
    instance.model = new ReactiveVar(instance.data.value || BpmnUtils.createProcess(this.data.title || Random.id()));
    instance.key = new ReactiveVar(this.data.atts['data-schema-key'] || "");
    instance.saveButton = new ReactiveVar(this.data.atts.saveButton);
    instance.mapping = new ReactiveVar(this.data.atts.mapping);
    instance.importButton = new ReactiveVar(this.data.atts.importButton);
    instance.exportButton = new ReactiveVar(this.data.atts.exportButton);
    instance.currentTarget = new ReactiveVar(false);

    instance.autorun(function () {


        if (instance.loaded.get()) {

            BpmnUtils.modeler.on('element.click', onElementClick.bind(instance));

            BpmnUtils.modeler.importXML(instance.model.get(), function (err, res) {
                if (res) {
                    BpmnUtils.container.removeClass("with-error").addClass('with-diagram');
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
                BpmnUtils.modeler.saveXML({format: true}, function (err, res) {
                    if (res) {
                        console.log("save", res)
                        $('#af-bpmn-model-input').val(res);
                        instance.model.set(res);
                    }
                });
            });
        }

        this.loaded.set(true);
    }
});

Template.afBpmn.helpers({
    dataSchemaKey() {
        return Template.instance().key.get();
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
                }
            });

        }
        return model;
    },

    saveButton() {
        return Template.instance().saveButton.get();
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
    sequenceFlowDecisionOption(){
        const currentTarget = Template.instance().currentTarget.get()
        console.log("sequenceFlowDecisionOption: ", currentTarget);
        return currentTarget && currentTarget.conditionExpression
            ? currentTarget.conditionExpression.body
            : "";
    },
    followsExclusiveGateway(){
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

        BpmnUtils.modeler.saveXML({format: true}, function (err, res) {
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
            body: "<![CDATA["+ expression + "]]>",
            language:"javascript",
        });
        modeling.updateProperties(element, {
            conditionExpression: newCondition
        });
        console.log(currentTarget);
    }
})