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


export default function Channel() {
  const { id } = useParams();
  const styles = useStyles();
  const [channel, setChannel] = React.useState();
  const [messages, setMessages] = React.useState([]);
  const [typing, sendTyping] = useTypingTracker(id);

  React.useEffect(() => {
    socket.send('SUBSCRIBE', { ids: [id] });
    socket.send('SET_ACTIVE_CHANNEL', { id });
    setChannel({name: `Channel ${id}`});
    setMessages([
      {user: 'Bob', content: 'Whats up bro'},
      {user: 'George', content: 'Not much man'},
    ]);

    return () => {
      socket.send('UNSUBSCRIBE', { ids: [id] });
      socket.send('REMOVE_ACTIVE_CHANNEL', { id });
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
              <Chip size="small" label={user.name} style={{ marginRight: '0.25rem' }} />
            ))}
            {typing.length ? <span>is typing...</span> : null}
          </div>
        </Paper>
      </Container>
    </React.Fragment>
  )
}
