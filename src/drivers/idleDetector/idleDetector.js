import { deepMerge } from '../../utils'
import { EventEmitter2 } from 'eventemitter2'

export const IdleDetectionDriverDefaultOptions = {
  idleTime: 5 * 60, // 5 minutes
  events: [
    'mousemove',
    'mousedown',
    'keypress',
    'DOMMouseScroll',
    'DOMContentLoaded',
    'mousewheel',
    'touchmove',
    'MSPointerMove',
  ],
  eventEmitter2ExtraOptions: {},
}

export class IdleDetectionDriver {
  constructor (options) {
    this.options = deepMerge(IdleDetectionDriverDefaultOptions, options)
    this.timeout = null
    this.eventEmitter = new EventEmitter2({
      wildcard: true,
      maxListeners: 100,
      ...this.options.eventEmitter2ExtraOptions,
    })
  }

  setIdle () {
    this.timeout = null
    this.eventEmitter.emit('idle')
  }

  //
  // Public functions
  //

  registerEvents () {
    for (let event of this.options.events) {
      window.addEventListener(event, () => { this.resetTimer() }, false)
    }
  }

  resetTimer (emit = true) {
    if (emit) {
      this.eventEmitter.emit('active')
    }
    window.clearTimeout(this.timeout)
    this.timeout = window.setTimeout(this.setIdle.bind(this), this.options.idleTime * 1000)
  }

  onActive (callback) {
    this.eventEmitter.on('active', callback)
  }

  onIdle (callback) {
    this.eventEmitter.on('idle', callback)
  }
}
