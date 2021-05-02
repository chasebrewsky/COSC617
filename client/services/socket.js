import EventEmitter from 'events';
import React from "react";
import throttle from "lodash/throttle";

export const EVENTS = Object.freeze({
  TYPING: 'TYPING',
  MESSAGE: 'MESSAGE',
});

export const CHANNEL_TYPES = Object.freeze({
  DIRECT: 'DIRECT',
  GROUP: 'GROUP',
});

class Socket {
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

const socket = new Socket(new WebSocket(window.config.websocketURL));

export default socket;

export function useTypingTracker(channelId, { delay = 2000, difference = 500 } = {}) {
  const [current, setCurrent] = React.useState({});
  const ref = React.useRef({});

  ref.current = current;

  const addUser = React.useCallback(user => {
    const { id } = user;

    const cleanup = () => {
      if (!(id in ref.current)) return;

      const { [id]: _, ...updated } = ref.current;
      setCurrent(updated);
    };

    if (!(id in ref.current)) {
      return setCurrent({
        ...ref.current,
        [id]: { user, timeout: setTimeout(cleanup, delay) }
      });
    }

    clearTimeout(ref.current[id].timeout);
    ref.current[id].timeout = setTimeout(cleanup, delay);
  }, []);

  const sendTyping = React.useCallback(throttle(() => {
    socket.send(EVENTS.TYPING);
  }, delay - difference), []);

  const [users, setUsers] = React.useState([]);

  React.useEffect(() => {
    const entries = [];
    for (const { user } of Object.values(current)) {
      entries.push(user);
    }
    setUsers(entries);
  }, [current]);

  // Subscribe to the given channel and listen to the typing events.
  React.useEffect(() => {
    const unsubscribe = socket.on(EVENTS.TYPING, ({ user }) => addUser(user));
    setUsers([]);

    // Cleanup all the subscriptions when changing channels.
    return () => unsubscribe();
  }, [channelId]);

  return [users, sendTyping];
}
