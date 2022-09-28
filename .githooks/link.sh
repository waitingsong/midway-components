#!/bin/bash
set -e
pwd

rm -rf "$(npm root -g)/@mwcp/share"
npm link ./packages/share --no-audit
