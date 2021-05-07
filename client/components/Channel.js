import React from 'react';
import { useParams } from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Chip from '@material-ui/core/Chip';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import TextField from "@material-ui/core/TextField";

import socket, { useTypingTracker } from '../services/socket';
import API from "../services/API";


const useChannelMessages = channelId => {
  const [messages, setMessages] = React.useState([]);
  const ref = React.useRef([]);

  ref.current = messages;

  const refresh = React.useCallback(() => {
    const newest = ref.current.length ? ref.current[0] : null;
    const params = {};

    if (newest) {
      params.after = newest.createdAt;
    }

    API.get(`/channels/${channelId}/messages`, { params }).then(response => {
      setMessages([...response.data.results, ...ref.current].slice(0, 100));
    });
  }, [channelId]);


  React.useEffect(() => {
    socket.send('SUBSCRIBE', { ids: [channelId] });
    socket.send('SET_ACTIVE_CHANNEL', { id: channelId });

    const listeners = [
      socket.on('MESSAGE', () => refresh()),
    ];

    setMessages([]);
    API.get(`/channels/${channelId}/messages`).then(response => {
      setMessages(response.data.results);
    });

    return () => {
      socket.send('UNSUBSCRIBE', { ids: [channelId] });
      socket.send('REMOVE_ACTIVE_CHANNEL', { id: channelId });

      for (const unsubscribe of listeners) {
        unsubscribe();
      }
    }
  }, [channelId]);

  return [messages, refresh]
};


export default function Channel() {
  const { id } = useParams();
  const [value, setValue] = React.useState('');
  const [channel, setChannel] = React.useState();
  const [typing, sendTyping] = useTypingTracker(id);
  const [messages, refresh] = useChannelMessages(id);

  const onKeyDown = React.useCallback(event => {
    if (event.code === 'Backspace') return;

    if (event.code === 'Enter') {
      return API
        .post(`/channels/${id}/messages`, { content: event.target.value })
        .then(() => {
          setValue('');
          refresh();
        });
    }

    sendTyping();
  }, [id, refresh]);

  const onChange = React.useCallback(event => {
    setValue(event.target.value);
  }, []);

  React.useEffect(() => {
    setValue('');
    API.get(`/channels/${id}`).then(response => {
      setChannel(response.data);
    });
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
        flexGrow: 1,
        overflowY: 'auto',
        paddingBottom: '1rem',
        paddingTop: '1rem',
      }}>
        <Box display="flex" flexDirection="column-reverse">
          {messages.map(message => (
            <Card style={{ marginBottom: '1rem' }}>
              <CardContent>
                <Box display="flex" style={{
                  paddingBottom: '0.5rem',
                  marginBottom: '0.5rem',
                  borderBottom: '1px solid #eee'
                }}>
                  <Box flexGrow={1}>
                    <Typography color="textSecondary">
                      {message.user.firstName} {message.user.lastName}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography color="textSecondary">
                      {new Date(message.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body1" component="p">
                  {message.content}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
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
