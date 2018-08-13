import { Meteor } from 'meteor/meteor'

import {BpmnDefinitions} from '../imports/BpmnDefinitions'

Meteor.publish(null, () => {
  return BpmnDefinitions.find()
})

Meteor.startup(() => {
  // code to run on server at startup
  BpmnDefinitions.remove({})
})
