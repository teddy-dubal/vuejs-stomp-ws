import Observer from './Observer'
import Emitter from './Emitter'

const VueSWS = {}
VueSWS.install = function (Vue, connection, opts = {}) {
  if (!connection) { throw new Error('[vuejs-stomp-ws] cannot locate connection') }

  let observer = null

  opts.$setInstance = (wsInstance) => {
    Vue.prototype.$swSocket = wsInstance
  }

  if (opts.connectManually) {
    Vue.prototype.$connect = (connectionUrl = connection, connectionOpts = opts) => {
      observer = new Observer(connectionUrl, connectionOpts)
      Vue.prototype.$swSocket = observer.WebSocket
    }

    Vue.prototype.$disconnect = () => {
      if (observer && observer.reconnection) { observer.reconnection = false }
      if (Vue.prototype.$swSocket) {
        Vue.prototype.$swSocket.close()
        delete Vue.prototype.$swSocket
      }
    }
  } else {
    observer = new Observer(connection, opts)
    Vue.prototype.$swSocket = observer.WebSocket
  }
  const hasProxy = typeof Proxy !== 'undefined' && typeof Proxy === 'function' && /native code/.test(Proxy.toString())

  Vue.mixin({
    created () {
      const vm = this
      const sockets = this.$options['sockets']
      if (hasProxy) {
        this.$options.sockets = new Proxy({}, {
          set (target, key, value) {
            Emitter.addListener(key, value, vm)
            target[key] = value
            return true
          },
          deleteProperty (target, key) {
            Emitter.removeListener(key, vm.$options.sockets[key], vm)
            delete target.key
            return true
          }
        })
        if (sockets) {
          Object.keys(sockets).forEach((key) => {
            this.$options.sockets[key] = sockets[key]
          })
        }
      } else {
        Object.seal(this.$options.sockets)
        // if !hasProxy need addListener
        if (sockets) {
          Object.keys(sockets).forEach(key => {
            Emitter.addListener(key, sockets[key], vm)
          })
        }
      }
    },
    beforeDestroy () {
      if (hasProxy) {
        const sockets = this.$options['sockets']

        if (sockets) {
          Object.keys(sockets).forEach((key) => {
            delete this.$options.sockets[key]
          })
        }
      }
    }
  })
}

// Auto-install
let GlobalVue = null
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue
}
if (GlobalVue) {
  GlobalVue.use(VueSWS)
}

export default VueSWS
