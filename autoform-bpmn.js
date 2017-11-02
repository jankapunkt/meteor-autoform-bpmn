import {Template} from 'meteor/templating';
import {Random} from 'meteor/random';
import {ReactiveVar} from 'meteor/reactive-var';
import {$} from 'meteor/jquery';
import { checkNpmVersions } from 'meteor/tmeasday:check-npm-versions';

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
    template:"afBpmn",
    valueOut(){
        return this.val();
    },
    valueIn(initialValue){
        return initialValue;
    }
});

const BPMN = {
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
Template.afBpmn.onCreated(function () {


    const instance = this;
    instance.loaded = new ReactiveVar(false);
    instance.dataModel = new ReactiveVar(this.data.value);
    instance.model = new ReactiveVar(instance.data.value || BPMN.createProcess(this.data.title || Random.id()));
    instance.key = new ReactiveVar(this.data.atts['data-schema-key'] || "");

    instance.autorun(function () {

        if (instance.loaded.get()) {



            BPMN.modeler.importXML(instance.model.get(), function (err, res) {
                if (res) {
                    BPMN.container.removeClass("with-error").addClass('with-diagram');
                }
            });
        }

    });
});

Template.afBpmn.onRendered(function () {
    if (!this._rendered) {
        this._rendered = true;

        BPMN.canvas = $('#af-bpmn-canvas');
        BPMN.container = $('#af-bpmn-drop-zone');

        //console.log(BPMN.canvas);

        BPMN.modeler = new BpmnModeler({
            container: BPMN.canvas
        });
        const eventBus = BPMN.modeler.get("eventBus");
        eventBus.on('element.mousedown', function () {
            BPMN.modeler.saveXML({format: true}, function (err, res) {
                if (res) {
                    console.log("save")
                    $('#af-bpmn-model-input').val(res);
                    instance.model.set(res);
                }
            });
        });

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
            console.log("this.value changed")
            Template.instance().dataModel.set(this.value);
            BPMN.modeler.importXML(this.value, function (err, res) {
                console.log(err, res);
                if (res) {
                    BPMN.container.removeClass("with-error").addClass('with-diagram');
                }
            });

        }
        return model;
    }
});