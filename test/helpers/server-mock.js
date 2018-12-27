import { Server } from 'mock-socket'
// import Stomp from 'stompjs'

class StompServerMock extends Server {
  constructor (...args) {
    // {
    //   // Hack: trick Babel/TypeScript into allowing this before super.
    //   // if (false) { super() }
    //   const thisFn = (() => { return this }).toString()
    //   const thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*/)[1]
    //   eval(`${thisName} = this`)
    // }
    super(args)
    // this.handle_send = this.handle_send.bind(this)
    // this.handle_close = this.handle_close.bind(this)
    // this.handle_open = this.handle_open.bind(this)
  }

  // handle_send(msg) {
  //   return this.stomp_dispatch(Stomp.Frame.unmarshall(msg).frames[0])
  // }
  // handle_close() {
  //   return this._shutdown()
  // }
  // handle_open() {
  //   this.stomp_init()
  //   return this._accept()
  // }
  // // Stomp server implementation
  // stomp_init() {
  //   this.transactions = {}
  //   this.subscriptions = {}
  //   return this.messages = []
  // }
  // stomp_send(command, headers, body=null) {
  //   return this._respond(Stomp.Frame.marshall(command, headers, body))
  // }
  // stomp_send_receipt(frame) {
  //   if (frame.headers.message != null) {
  //     return this.stomp_send('ERROR', {'receipt-id': frame.headers['receipt-id'], 'message': frame.headers.message})
  //   } else {
  //     return this.stomp_send('RECEIPT', {'receipt-id': frame.headers['receipt-id']})
  //   }
  // }
  // stomp_send_message(destination, subscription, message_id, body) {
  //   return this.stomp_send('MESSAGE', {
  //     'destination': destination, 
  //     'message-id': message_id,
  //     'subscription': subscription}, body)
  // }
  // stomp_dispatch(frame) {
  //   const handler = `stomp_handle_${frame.command.toLowerCase()}`
  //   if (this[handler] != null) {
  //     this[handler](frame)
  //     if (frame.receipt) {
  //       return this.stomp_send_receipt(frame)
  //     }
  //   } else {
  //     console.log(`StompServerMock: Unknown command: ${frame.command}`)
  //   }
  // }
  // stomp_handle_connect(frame) {
  //   this.session_id = Math.random()
  //   return this.stomp_send('CONNECTED', {'session': this.session_id})
  // }
  // stomp_handle_begin(frame) {
  //   return this.transactions[frame.headers.transaction] = []
  // }
  // stomp_handle_commit(frame) {
  //   const transaction = this.transactions[frame.headers.transaction]
  //   for (frame of transaction) {
  //     this.messages.push(frame.body)
  //   }
  //    delete this.transactions[frame.headers.transaction]
  // }
  // stomp_handle_abort(frame) {
  //   return delete this.transactions[frame.headers.transaction]
  // }
  // stomp_handle_send(frame) {
  //   if (frame.headers.transaction) {
  //     return this.transactions[frame.headers.transaction].push(frame)
  //   } else {
  //     return this.messages.push(frame)
  //   }
  // }
  // stomp_handle_subscribe(frame) {
  //   const subId = frame.headers.id || Math.random()
  //   const cb = (id, body) => this.stomp_send_message(frame.headers.destination, subId, id, body)
  //   this.subscriptions[subId] = [frame.headers.destination, cb]
  // }

  // stomp_handle_unsubscribe(frame) {
  //   const needle = frame.headers.id
  //   if (Object.keys(this.subscriptions).includes(needle)) {
  //     return delete this.subscriptions[needle]
  //   } else {
  //     frame.headers.message = 'Subscription does not exist'
  //   }
  // }
  // stomp_handle_disconnect(frame) {
  //   return this._shutdown()
  // }
  // // Test helpers
  // test_send(subId, message) {
  //   const msgid = `msg-${Math.random()}`
  //   return this.subscriptions[subId][1](msgid, message)
  // }
}

export default StompServerMock
