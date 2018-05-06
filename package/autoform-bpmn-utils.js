import { Random } from 'meteor/random';

export const Utils = {

  modeler: null,
  canvas: null,
  propertiesParent: null,
  container: null,

  createProcess(title) {
    return `<?xml version="1.0" encoding="UTF-8"?>
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
  },

  setEncoded(link, name, data) {
    if (data) {
      const encodedData = encodeURIComponent(data);
      link.prop('disabled', false).attr({
        href: `data:application/bpmn20-xml;charset=UTF-8,${encodedData}`,
        download: name,
      });
    } else {
      link.prop('disabled', true);
    }
  },
  saveDiagram(done) {
    Utils.modeler.saveXML({ format: true }, function (err, xml) {
      done(err, xml);
    });
  },
  saveSVG(done) {
    Utils.modeler.saveSVG(done);
  },

  onElementClick(event) {
    const instance = this; // because we bind instance to this context
    const { element } = event;
    const { businessObject } = element;
    instance.currentTarget.set(businessObject);
  },
};
