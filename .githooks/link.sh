#!/bin/bash
set -e
pwd

rm -rf "$(npm root -g)/@mwcp/share"
npm link ./packages/share --no-audit

rm -rf "$(npm root -g)/@mwcp/otel"
npm link ./packages/otel --no-audit

