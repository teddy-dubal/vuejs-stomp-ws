import Vue from 'vue'
import VueSws from 'src/index'

// import { Server } from 'mock-socket'
import Server from '../helpers/server-mock'

describe('index.js', () => {
  let mockServer

  it('can be bound to the onopen event', (done) => {
    mockServer = new Server('ws://localhost:8080')
    Vue.use(VueSws, 'ws://localhost:8080')
    // const vm = new Vue()
    mockServer.stop(done)
    // console.info(vm.$swSocket)
    // vm.$options.sockets.onopen = (data) => {
    //   expect(data.type).to.equal('open')
    //   mockServer.stop(done)
    // }
  })
})
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// import { Stomp } from '../../lib/stomp.js';
// import { StompServerMock } from './server.mock.js';

// Stomp.WebSocketClass = StompServerMock;

// describe("Stomp", function() {
//   it("lets you connect to a server with a websocket and get a callback", function() {
//     const ws = new StompServerMock("ws://mocked/stomp/server");
//     const client = Stomp.over(ws);
//     let connected = false;
//     client.connect("guest", "guest", () => connected = true);
//     waitsFor(() => connected);
//     return runs(() => expect(client.connected).toBe(true));
//   });
  
//   it("lets you connect to a server and get a callback", function() {
//     const client = Stomp.client("ws://mocked/stomp/server");
//     let connected = false;
//     client.connect("guest", "guest", () => connected = true);
//     waitsFor(() => connected);
//     return runs(() => expect(client.connected).toBe(true));
//   });
  
//   it("lets you subscribe to a destination", function() {
//     const client = Stomp.client("ws://mocked/stomp/server");
//     let subscription = null;
//     client.connect("guest", "guest", () => subscription = client.subscribe("/queue/test"));
//     waitsFor(() => subscription);
//     return runs(() => expect(Object.keys(client.ws.subscriptions)).toContain(subscription.id));
//   });
  
//   it("lets you publish a message to a destination", function() {
//     const client = Stomp.client("ws://mocked/stomp/server");
//     let message = null;
//     client.connect("guest", "guest", function() {
//       message = "Hello world!";
//       return client.send("/queue/test", {}, message);
//     });
//     waitsFor(() => message);
//     return runs(() => expect(client.ws.messages.pop().toString()).toContain(message));
//   });

  
//   it("lets you unsubscribe from a destination", function() {
//     const client = Stomp.client("ws://mocked/stomp/server");
//     let unsubscribed = false;
//     let subscription = null;
//     client.connect("guest", "guest", function() {
//       subscription = client.subscribe("/queue/test");
//       subscription.unsubscribe();
//       return unsubscribed = true;
//     });
//     waitsFor(() => unsubscribed);
//     return runs(() => expect(Object.keys(client.ws.subscriptions)).not.toContain(subscription.id));
//   });
    
//   it("lets you receive messages only while subscribed", function() {
//     const client = Stomp.client("ws://mocked/stomp/server");
//     let subscription = null;
//     const messages = [];
//     client.connect("guest", "guest", () =>
//       subscription = client.subscribe("/queue/test", msg => messages.push(msg))
//     );
//     waitsFor(() => subscription);
//     return runs(function() {
//       client.ws.test_send(subscription.id, Math.random());
//       client.ws.test_send(subscription.id, Math.random());
//       expect(messages.length).toEqual(2);
//       subscription.unsubscribe();
//       try {
//         client.ws.test_send(id, Math.random()); 
//       } catch (err) {
//         null;
//       }
//       return expect(messages.length).toEqual(2);
//     });
//   });
  
//   it("lets you send messages in a transaction", function() {
//     const client = Stomp.client("ws://mocked/stomp/server");
//     let connected = false;
//     client.connect("guest", "guest", () => connected = true);
//     waitsFor(() => connected);
//     return runs(function() {
//       const txid = "123";
//       client.begin(txid);
//       client.send("/queue/test", {transaction: txid}, "messages 1");
//       client.send("/queue/test", {transaction: txid}, "messages 2");
//       expect(client.ws.messages.length).toEqual(0);
//       client.send("/queue/test", {transaction: txid}, "messages 3");
//       client.commit(txid);
//       return expect(client.ws.messages.length).toEqual(3);
//     });
//   });
  
//   return it("lets you abort a transaction", function() {
//     const client = Stomp.client("ws://mocked/stomp/server");
//     let connected = false;
//     client.connect("guest", "guest", () => connected = true);
//     waitsFor(() => connected);
//     return runs(function() {
//       const txid = "123";
//       client.begin(txid);
//       client.send("/queue/test", {transaction: txid}, "messages 1");
//       client.send("/queue/test", {transaction: txid}, "messages 2");
//       expect(client.ws.messages.length).toEqual(0);
//       client.send("/queue/test", {transaction: txid}, "messages 3");
//       client.abort(txid);
//       return expect(client.ws.messages.length).toEqual(0);
//     });
//   });
// });