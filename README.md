

### Install

In order to install this package, you also need to install some npm packages:

- simpl-schema (WHich you need to use with autoForm anyway)
- bpmn-js (The bpmn-io modeler's core package)
- diagram-js (mainly required to import fonts and styles for the modeler)
- matches-selector (the bpmn modeler throws an error if this is not installed)
- font-awesome (optional)

Uses Bootstrap 3 (until 4 is a stable release) classes.

**Install:**

```bash
meteor add jkuester:autoform-bpmn
meteor npm install --save simpl-schema bpmn-js diagram-js matches-selector font-awesome
```

**Include in Schema:**


```javascript
import SimpleSchema from 'simpl-schema';
const bpmnSchema = new SimpleSchema({
    workflowData:{
        autoform:{
            afInputField:{
                type:'bpmn',
                saveButton:true, // omit to enable autosave
            }
        }
    }
})
```

