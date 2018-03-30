#!/usr/bin/env bash

METEOR_PACKAGE_DIRS=./ TEST_WATCH=1 TEST_SERVER=0 meteor test-packages ./ --driver-package meteortesting:mocha --port=5555