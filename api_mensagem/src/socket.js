// src/socket.js
"use strict"

let ioInstance = null

function setIO(io) {
  ioInstance = io
}

function emit(event, payload) {
  if (!ioInstance) return
  ioInstance.emit(event, payload)
}

module.exports = { setIO, emit }