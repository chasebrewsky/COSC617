import EventEmitter from 'events';

class Socket {
  EVENTS = Object.freeze({
    TYPING: 'TYPING',
  });
  CHANNEL_TYPES = Object.freeze({
    DIRECT: 'DIRECT',
    GROUP: 'GROUP',
  });

  constructor(instance) {
    this._socket = instance;
    this._events = new EventEmitter();
    this._channel = null;
    this._queue = [];
    this._socket.addEventListener('open', () => {
      this._queue.forEach(action => action());
      this._socket.addEventListener('message', event => {
        const { type, payload } = JSON.parse(event.data);
        this._events.emit(type, payload);
      });
    });
  }

  send(event, payload) {
    this._perform(() => this._socket.send(JSON.stringify({ type: event, payload })));
  }

  _perform(action) {
    if (this._socket.readyState === WebSocket.OPEN) return action();
    this._queue.push(action);
  }

  subscribe(type, id) {
    this.unsubscribe();
    this.send('CHANNEL_SUBSCRIBE', { type, id });
    this._channel = { type, id };
    return () => this.unsubscribe();
  }

  unsubscribe() {
    if (!this._channel) return;
    this.send('CHANNEL_UNSUBSCRIBE', this._channel);
    this._channel = null;
  }

  on(event, listener) {
    this._events.on(event, listener);
    return () => this.remove(event, listener);
  }

  remove(event, listener) {
    this._events.removeListener(event, listener);
  }
}

const instance = new Socket(new WebSocket(window.config.websocketURL))

export default instance;
