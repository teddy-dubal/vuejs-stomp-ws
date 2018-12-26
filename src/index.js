import 'stompjs'
const VueSWS = {}
VueSWS.install = function (Vue, options) {
  // // 1. ajouter une méthode globale ou une propriété
  const user = function () {
    return Vue.ls.get('user')
  }
  Vue.user = user
  Vue.prototype.$user = user

  // // 2. ajouter une ressource globale
  // Vue.directive('my-directive', {
  //   bind (el, binding, vnode, oldVnode) {
  //     // de la logique de code...
  //   }
  //   ...
  // })

  // // 3. injecter des options de composant
  Vue.mixin({
    beforeCreate: function () {}
  })

  // // 4. ajouter une méthode d'instance
  // Vue.prototype.$mymethode = function(link, options) {
  //   // de la logique de code...
  // };
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
