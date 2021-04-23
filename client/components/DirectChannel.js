import React from 'react';
import { useParams } from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';

export default function DirectChannel() {
  const { id } = useParams();
  const [channel, setChannel] = React.useState();
  const [messages, setMessages] = React.useState([]);
  React.useEffect(() => {
    setChannel({name: `Messages ${id}`});
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
        {messages.map(message => (
          <Paper>{message.user}: {message.content}</Paper>
        ))}
      </Container>
    </React.Fragment>
  )
}
