import { Mongo } from 'meteor/mongo'

export const BpmnDefinitions = new Mongo.Collection('bpmnDefinitions')

BpmnDefinitions.allow({
  insert () {
    return true
  },
  update () {
    return true
  },
  remove () {
    return true
  }
})
