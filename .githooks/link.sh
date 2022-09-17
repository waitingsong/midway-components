#!/bin/bash
#
# 初始化 git 仓库
#
# Author: waiting
# Date: 2019.01.21
#
set -e
pwd

rm -rf "$(npm root -g)/@mwcp/share"
npm link ./packages/share --no-audit
