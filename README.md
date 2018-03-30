<h1 class='text-align:center'>Autoform BPMN</h1>
<p class='text-align: center'>Bringing the power of the bpmn-js modeler to your autoform</p>
<hr>

### About

This packages wraps the bpmn-js modeler and properties panel into an autoform extension. It is an out-of-the-box extension
that saves the modeled bpmn xml as xml-string in the specified field.

Currently it uses the following versions:

```javascript
"bpmn-js": "0.27.6",
"bpmn-js-properties-panel": "0.22.1",
"camunda-bpmn-moddle": "2.0.0",
"diagram-js": "0.28.2",
```

### Why using fixed Npm dependencies?

Wiring up the modeler, properties-panel with all the relevant `.less` files is a real hassle and not trivial at all.
To comfort you as user this is all now wrapped up and you don't need to install the bpmn-js related packages besides.

<br>
So the decision is usability over configurability. Previous versions of this package used to soft-depend on the npm packages.
However, by integrating the properties panel it has been revealed, that including the styles did not work that well without hacky solutions.

<br>
So my intention is here to provide this package 'as-is' and that you only need to add this to your project as meteor package,
add it as an autoform type to your schema and 'booom' you got the all in one bpmn-js modeler incl. properties panel out of the box.


### Install

In order to install this package, you also need to install some npm packages:

- simpl-schema (WHich you need to use with autoForm anyway)
- bpmn-js (The bpmn-io modeler's core package)
- diagram-js (mainly required to import fonts and styles for the modeler)
- matches-selector (the bpmn modeler throws an error if this is not installed)

Uses Bootstrap 3 classes.

**Procedure:**

```bash
meteor add jkuester:autoform-bpmn
```

**Include in Schema:**


```javascript
import SimpleSchema from 'simpl-schema';
const bpmnSchema = new SimpleSchema({
    workflowData:{
        autoform:{
            afInputField:{
                type:'bpmn',
            }
        }
    }
})
```

