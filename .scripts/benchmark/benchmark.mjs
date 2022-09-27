#!/usr/bin/env zx
import assert from 'node:assert'
import { spawn } from 'node:child_process'
import autocannon from 'autocannon'


const api = argv.api ?? ''
const reqestAvg = argv.qps ?? 2800

const format = function (bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB'
};

const url = `http://127.0.0.1:7001/${api}`

const cannon = () => {
  return new Promise((resolve, reject) => {
    autocannon(
      {
        url,
        connections: 100,
        pipelining: 2,
        duration: 30,
      },
      (err, results) => {
        if (err) {
          return reject(err)
        }
        return resolve(results)
      }
    )
  })
}

const child = spawn('node', ['--expose-gc', 'start.js'], {
  cwd: __dirname,
  stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
  env: {
    ...process.env,
   NODE_ENV: 'unittest',
   MIDWAY_SERVER_ENV: 'unittest',
    FORCE_COLOR: 3,
  }
})

let callback = () => { }
child.on('message', data => {
  if (data.action === 'collect_mem_result') {
    return callback(data.data)
  }
})

async function collectMem() {
  return new Promise((resolve, reject) => {
    callback = resolve
    child.send({ action: 'collect_mem' })
  })
}



echo` \n`
await $`autocannon -c 100 -p 2 -d 60 http://127.0.0.1:7001/${api}`
echo` \n`


child.kill()
process.exit(0)


/* ---- END ---- */

function exitWithError() {
  child.kill()
  process.exit(1)
}

