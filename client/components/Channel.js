import React from 'react';
import { useParams } from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper';
import TextField from "@material-ui/core/TextField";

import socket, { useTypingTracker } from '../services/socket';
import { useStyles } from '../services/styles';
import API from "../services/API";


export default function Channel() {
  const { id } = useParams();
  const styles = useStyles();
  const [value, setValue] = React.useState('');
  const [channel, setChannel] = React.useState();
  const [messages, setMessages] = React.useState([]);
  const [typing, sendTyping] = useTypingTracker(id);

  const fetchNewMessages = React.useCallback(() => {
    const newest = messages.length ? messages[0] : null;
    setValue('');

    if (!newest) return;

    const params = { after: newest.createdAt };

    API.get(`/channels/${id}/messages`, { params }).then(response => {
      setMessages([...response.data.results, ...messages].slice(0, 100));
    });
  }, [id, messages])

  const onKeyDown = React.useCallback(event => {
    if (event.code === 'Backspace') return;

    if (event.code === 'Enter') {
      return API
        .post(`/channels/${id}/messages`, { content: event.target.value })
        .then(() => fetchNewMessages());
    }

    sendTyping();
  }, [id, fetchNewMessages]);

  const onChange = React.useCallback(event => {
    setValue(event.target.value);
  }, []);

  React.useEffect(() => {
    socket.send('SUBSCRIBE', { ids: [id] });
    socket.send('SET_ACTIVE_CHANNEL', { id });

    const listeners = [
      socket.on('MESSAGE', () => fetchNewMessages()),
    ];

    API.get(`/channels/${id}`).then(response => {
      setChannel(response.data);
    });

    API.get(`/channels/${id}/messages`).then(response => {
      setMessages(response.data.results);
    });

    setValue('');

    return () => {
      socket.send('UNSUBSCRIBE', { ids: [id] });
      socket.send('REMOVE_ACTIVE_CHANNEL', { id });

      for (const unsubscribe of listeners) {
        unsubscribe();
      }
    }
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
      <Container style={{
        display: 'flex',
        flexDirection: 'column-reverse',
        flexGrow: 1,
        overflowY: 'auto',
        paddingBottom: '1rem',
        paddingTop: '1rem',
      }}>
        {messages.map(message => (
          <Paper className={styles.message}>
            {message.user.firstName} {message.user.lastName}: {message.content}
          </Paper>
        ))}
      </Container>
      <Container>
        <Paper style={{ padding: '1rem', marginBottom: '1rem' }}>
          <TextField
            fullWidth
            placeholder="Message channel"
            value={value}
            onKeyPress={onKeyDown}
            onChange={onChange}
            inputProps={{ 'aria-label': 'description' }}
          />
          <div style={{
            minHeight: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            marginTop: '0.5rem' }}>
            {typing.map(user => (
              <Chip size="small" label={user.name} style={{ marginRight: '0.25rem' }} />
            ))}
            {typing.length ? <span>is typing...</span> : null}
          </div>
        </Paper>
      </Container>
    </React.Fragment>
  )
}
