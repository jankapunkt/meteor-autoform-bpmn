#!/usr/bin/env bash

cd tests && mkdir -p packages && ln -s ../../package/ ./packages/autoform-bpmn
meteor npm install