<h1 align="center">Autoform BPMN Extension</h1>
<p align="center">Bringing the power of the bpmn-js modeler to your AutoForm</p>
<hr>

<p align="center">
    <a href="https://travis-ci.org/jankapunkt/meteor-autoform-bpmn" alt="Build Status">
        <img src="https://travis-ci.org/jankapunkt/meteor-autoform-bpmn.svg?branch=master" />
    </a>
    <a href="http://www.repostatus.org/#active" alt="Project Status: Active – The project has reached a stable, usable state and is being actively developed.">
        <img src="http://www.repostatus.org/badges/latest/active.svg" />
    </a>
    <a href='https://gitlicense.com/license/jankapunkt/meteor-autoform-bpmn'>
        <img src='https://gitlicense.com/badge/jankapunkt/meteor-autoform-bpmn'/>
    </a>
</p>

### About

This packages wraps the [bpmn-js](https://github.com/bpmn-io/bpmn-js) modeler and [bpmn-jsproperties-panel](https://github.com/bpmn-io/bpmn-js-properties-panel) into an "out-of-the-box extension" for [aldeed:autoform](https://github.com/aldeed/meteor-autoform).
"Out-of-the-box extension" means, that it saves the modeled bpmn xml as xml-string into the specified field without any initial configuration required.
The modeler allows you to set the camunda moddle options, so that your autoform lets you create camunda compatible bpmn process definitions.

### Changelog

**0.1.5**

- use NavigatedViewer instead of Modeler when form is disabled
- use blobs for downloading exported diagram
- trigger diagram export not on commandstack.changed but on button click

**0.1.4** 

- removed save button and update data model on commandstack.changed event
- added file import
- added svg export
- extracted utils and added tests
- added install.sh script

**0.1.3**

- moved button bar out of canvas
- added code coverage to tests


### Demo

There is a minimal [DEMO project](https://github.com/jankapunkt/meteor-autoform-bpmn-example) that shows this extension in use. You can clone it and just run it as a Meteor app.

### Requirements

This package requires Meteor 1.6 or higher and is currently built against with AutoForm 6.2.0

### Install

Note: Before you install you should read one the [AutoForm installation guide](https://github.com/aldeed/meteor-autoform#installation).

As this packages comes with fixed dependencies (very important for a stable release) you just need to add it as a meteor package:

```bash
meteor add jkuester:autoform-bpmn
```

Define a field as `autoform` type `in Schema.


```javascript
import SimpleSchema from 'simpl-schema';

const bpmnSchema = new SimpleSchema({
    data: {
        autoform: {
            type:'bpmn',
        }
    }
})
```

That's it. When you load your form you should be able to start modeling immediately.

### Updating the model

Currently your model is updated on click of event of the save button. So keep in mind when modeling to click save from time to time.
**Clicking the modeler's save button will only update the bpmn xml value to the field and not trigger any AutoForm submit!**

In the future there will be an autosave on `commandStack.change` which is basically any registered change.


### Dependencies

Currently it uses the following versions:

```javascript
'bpmn-js':                  '0.27.6',
'bpmn-js-properties-panel': '0.22.1',
'camunda-bpmn-moddle':      '2.0.0',
'diagram-js':               '0.28.2',
```

### Why using fixed Npm dependencies?

Wiring up the modeler, properties-panel with all the relevant `.less` files is a real hassle and not trivial at all.
To comfort you as user this is all now wrapped up and you don't need to install the bpmn-js related packages besides.

<br>
So the decision is usability over configurability. Previous versions of this package used to soft-depend on the npm packages.
However, by integrating the properties panel it has been revealed, that including the styles did not work that well without hacky solutions.

### License

MIT License