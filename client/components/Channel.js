import React from 'react';
import { useParams } from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper';
import TextField from "@material-ui/core/TextField";
import throttle from 'lodash/throttle';

import socket from '../services/socket';
import { useStyles } from '../services/styles';


function useTypingTracker(channel, self, { delay = 2000, difference = 500 } = {}) {
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
    socket.send(socket.EVENTS.TYPING, self);
  }, delay - difference), [self]);

  const [users, setUsers] = React.useState([]);

  React.useEffect(() => {
    const entries = [];
    for (const [id, { user }] of Object.entries(current)) {
      if (id !== self.id) entries.push(user);
    }
    setUsers(entries);
  }, [current]);

  // Subscribe to the given channel and listen to the typing events.
  React.useEffect(() => {
    setUsers([]);
    const subscriptions = [
      socket.subscribe(channel.type, channel.id),
      socket.on(socket.EVENTS.TYPING, payload => {
        addUser(payload);
      }),
    ];
    // Cleanup all the subscriptions when changing channels.
    return () => subscriptions.forEach(unsubscribe => unsubscribe());
  }, [channel.id]);

  return [users, sendTyping];
}

export default function Channel() {
  const { id } = useParams();
  const styles = useStyles();
  const [channel, setChannel] = React.useState();
  const [messages, setMessages] = React.useState([]);
  const [typing, sendTyping] = useTypingTracker(
    { type: socket.CHANNEL_TYPES.GROUP, id: id },
    { id: 1, name: 'George Costanza' },
  );

  React.useEffect(() => {
    setChannel({name: `Channel ${id}`});
    setMessages([
      {user: 'Bob', content: 'Whats up bro'},
      {user: 'George', content: 'Not much man'},
    ]);
  }, [id]);

  return (
    <React.Fragment>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">
            {channel ? channel.name : ''}
          </Typography>
        </Toolbar>
      </AppBar>
      <Container>
        <div className={styles.content}>
          {messages.map(message => (
            <Paper className={styles.message}>{message.user}: {message.content}</Paper>
          ))}
        </div>
        <Paper style={{ padding: '1rem', marginTop: '1rem' }}>
          <TextField
            fullWidth
            placeholder="Message channel"
            onKeyPress={sendTyping}
            inputProps={{ 'aria-label': 'description' }}
          />
          <div style={{
            minHeight: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            marginTop: '0.5rem' }}>
            {typing.map(user => (
              <Chip size="small" label={user.name} />
            ))}
            {typing.length ? <span style={{ marginLeft: '0.5rem' }}>is typing...</span> : null}
          </div>
        </Paper>
      </Container>
    </React.Fragment>
  )
}
