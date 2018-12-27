// import Vue from 'vue'

// // bring in the Emitter class, not the singleton
// const EmitterClass = require('exports-loader?Emitter!src/Emitter')

// describe('Emitter.js', () => {
//   const vm = new Vue()
//   let Emitter

//   beforeEach(() => {
//     Emitter = new EmitterClass()
//   })

//   it('registers an handler', () => {
//     expect(Emitter.listeners.size).to.equal(0)
//     Emitter.addListener('[event_type]', (value) => {}, vm)
//     expect(Emitter.listeners.size).to.equal(1)
//   })

//   it('unregisters a registered handler', () => {
//     const eventType = 'atype'
//     const cb = (value) => {}
//     // should.not.exist(Emitter.listeners.get(eventType))
//     Emitter.addListener(eventType, cb, vm)
//     expect(Emitter.listeners.get(eventType).length).to.equal(1)
//     Emitter.removeListener(eventType, cb, vm)
//     expect(Emitter.listeners.get(eventType).length).to.equal(0)
//   })

//   it('fires an events', (done) => {
//     const eventType = 'syn'
//     const expectedResponse = 'ack'
//     expect(Emitter.listeners.size).to.equal(0)
//     Emitter.addListener(eventType, (value) => {
//       expect(value).to.equal(expectedResponse)
//       done()
//     }, vm)
//     expect(Emitter.listeners.size).to.equal(1)
//     Emitter.emit(eventType, expectedResponse)
//   })
// })
