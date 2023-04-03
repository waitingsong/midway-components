#!/bin/bash
set -e
pwd

rm -rf "$(npm root -g)/@mwcp/otel"
rm -rf node_modules/@mwcp/otel
npm link ./packages/otel --no-audit

rm -rf "$(npm root -g)/@mwcp/cache"
rm -rf node_modules/@mwcp/cache
npm link ./packages/cache --no-audit

rm -rf "$(npm root -g)/@mwcp/share"
rm -rf node_modules/@mwcp/share
npm link ./packages/share --no-audit

ls -al node_modules/@mwcp


