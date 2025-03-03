#!/bin/sh
node src/workers/promptWorker.js &
node src/workers/templateWorker.js &
wait