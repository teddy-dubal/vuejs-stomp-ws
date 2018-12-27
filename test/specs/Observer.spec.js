// import Vue from 'vue'
// import Emitter from 'src/Emitter'
// import Observer from 'src/Observer'
// import VueSws from 'src/index'

// import { Server, WebSocket } from 'mock-socket'

// describe('Observer.js', () => {
//   // eslint-disable-next-line
//   let observer, mockServer
//   const wsUrl = 'ws://localhost:8080'

//   it('fires onopen event', (done) => {
//     mockServer = new Server(wsUrl)
//     mockServer.on('connection', ws => {
//       ws.send('hi')
//     })
//     Vue.use(VueSws, wsUrl)
//     const vm = new Vue()
//     observer = new Observer(wsUrl)
//     Emitter.addListener('onopen', (data) => {
//       expect(data.type).to.equal('open')
//       mockServer.stop(done)
//     }, vm)
//   })

//   it('fires onopen event skip scheme', (done) => {
//     mockServer = new Server(wsUrl)
//     mockServer.on('connection', ws => {
//       ws.send('hi')
//     })
//     Vue.use(VueSws, '//localhost:8080')
//     const vm = new Vue()
//     observer = new Observer(wsUrl)
//     Emitter.addListener('onopen', (data) => {
//       expect(data.type).to.equal('open')
//       mockServer.stop(done)
//     }, vm)
//   })

//   // TODO: DRY
//   it('passes a json commit to the provided vuex store', (done) => {
//     const expectedMsg = { mutation: 'setName', value: 'steve' }
//     const mockStore = sinon.mock({ commit: () => {} })
//     mockStore.expects('commit').withArgs('SOCKET_ONOPEN')
//     mockStore.expects('commit').withArgs(expectedMsg.mutation)

//     mockServer = new Server(wsUrl)
//     mockServer.on('connection', ws => {
//       ws.send(JSON.stringify(expectedMsg))
//     })

//     Vue.use(VueSws, wsUrl)
//     // eslint-disable-next-line
//     const vm = new Vue()
//     observer = new Observer(wsUrl, {
//       store: mockStore.object,
//       format: 'json',
//       websocket: new WebSocket(wsUrl)
//     })

//     setTimeout(() => {
//       mockStore.verify()
//       mockServer.stop(done)
//     }, 100)
//   })

//   // TODO: DRY
//   it('passes a json action to the provided vuex store', (done) => {
//     const expectedMsg = { action: 'setName', value: 'steve' }
//     const mockStore = sinon.mock({
//       commit: () => {},
//       dispatch: () => {}
//     })
//     mockStore.expects('dispatch').withArgs(expectedMsg.action, expectedMsg)

//     mockServer = new Server(wsUrl)
//     mockServer.on('connection', ws => {
//       ws.send(JSON.stringify(expectedMsg))
//     })

//     Vue.use(VueSws, wsUrl)
//     // eslint-disable-next-line
//     const vm = new Vue()
//     observer = new Observer(wsUrl, {
//       store: mockStore.object,
//       format: 'json',
//       websocket: new WebSocket(wsUrl)
//     })

//     setTimeout(() => {
//       mockStore.verify()
//       mockServer.stop(done)
//     }, 100)
//   })

//   // TODO: DRY
//   it('passes a namespaced json commit to the provided vuex store', (done) => {
//     const expectedMsg = { namespace: 'users', mutation: 'setName', value: 'steve' }
//     const mockStore = sinon.mock({ commit: () => {} })
//     mockStore.expects('commit').withArgs('SOCKET_ONOPEN')
//     mockStore.expects('commit').withArgs(expectedMsg.namespace + '/' + expectedMsg.mutation)

//     mockServer = new Server(wsUrl)
//     mockServer.on('connection', ws => {
//       ws.send(JSON.stringify(expectedMsg))
//     })

//     Vue.use(VueSws, wsUrl)
//     // eslint-disable-next-line
//     const vm = new Vue()
//     observer = new Observer(wsUrl, {
//       store: mockStore.object,
//       format: 'json',
//       websocket: new WebSocket(wsUrl)
//     })

//     setTimeout(() => {
//       mockStore.verify()
//       mockServer.stop(done)
//     }, 100)
//   })

//   // TODO: DRY
//   it('passes a namespaced json action to the provided vuex store', (done) => {
//     const expectedMsg = { namespace: 'users', action: 'setName', value: 'steve' }
//     const mockStore = sinon.mock({
//       commit: () => {},
//       dispatch: () => {}
//     })
//     mockStore.expects('dispatch').withArgs(expectedMsg.namespace + '/' + expectedMsg.action, expectedMsg)

//     mockServer = new Server(wsUrl)
//     mockServer.on('connection', ws => {
//       ws.send(JSON.stringify(expectedMsg))
//     })

//     Vue.use(VueSws, wsUrl)
//     // eslint-disable-next-line
//     const vm = new Vue()
//     observer = new Observer(wsUrl, {
//       store: mockStore.object,
//       format: 'json',
//       websocket: new WebSocket(wsUrl)
//     })

//     setTimeout(() => {
//       mockStore.verify()
//       mockServer.stop(done)
//     }, 100)
//   })

//   // TODO: DRY
//   it('passes a custom commit name to the provided vuex store', (done) => {
//     const expectedMsg = 'hello world'
//     const mutations = {
//       SOCKET_ONOPEN: '✅ Socket connected',
//       SOCKET_ONMESSAGE: 'Websocket message received'
//     }
//     const mockStore = sinon.mock({ commit: () => {} })
//     mockStore.expects('commit').withArgs(mutations.SOCKET_ONOPEN)
//     mockStore.expects('commit').withArgs(mutations.SOCKET_ONMESSAGE)

//     mockServer = new Server(wsUrl)
//     mockServer.on('connection', ws => {
//       ws.send(expectedMsg)
//     })

//     Vue.use(VueSws, wsUrl)
//     // eslint-disable-next-line
//     const vm = new Vue()
//     observer = new Observer(wsUrl, {
//       store: mockStore.object,
//       mutations,
//       websocket: new WebSocket(wsUrl)
//     })

//     setTimeout(() => {
//       mockStore.verify()
//       mockServer.stop(done)
//     }, 100)
//   })

//   describe('reconnection feature', () => {
//     // eslint-disable-next-line
//     let observer, mockServer, vm, mockStore
//     const wsUrl = 'ws://localhost:8080'

//     beforeEach(() => {
//       mockServer = new Server(wsUrl)
//       mockServer.on('connection', ws => ws.send('hi'))
//       Vue.use(VueSws, wsUrl)
//       vm = new Vue()
//       mockStore = sinon.mock({ commit: () => {} })

//       observer = new Observer(wsUrl, {
//         store: mockStore.object,
//         reconnection: true,
//         reconnectionAttempts: 2,
//         WebSocket: new WebSocket(wsUrl)
//       })
//     })

//     it('calls #reconnect() method', (done) => {
//       sinon.spy(observer, 'reconnect')
//       mockServer.close()

//       expect(observer.reconnect).to.called
//       mockServer.stop(done)
//     })

//     it('fires SOCKET_RECONNECT event', (done) => {
//       sinon.spy(observer, 'passToStore')
//       const clock = sinon.useFakeTimers()
//       mockServer.close()
//       clock.tick(1500)

//       expect(observer.passToStore).to.have.been.calledWith('SOCKET_RECONNECT')
//       mockServer.stop(done)
//     })

//     it('fires SOCKET_RECONNECT_ERROR event, after all attemps', (done) => {
//       sinon.spy(observer, 'passToStore')
//       observer.reconnectionCount = 2
//       observer.reconnectionAttempts = 1
//       mockServer.close()

//       expect(observer.passToStore).to.have.been.calledWith('SOCKET_RECONNECT_ERROR')
//       mockServer.stop(done)
//     })
//   })
// })
