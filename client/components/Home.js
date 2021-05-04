import * as React from 'react';
import { Container, Divider, Drawer, List, ListItem, ListItemText, Typography } from '@material-ui/core';

export default function Home() {
  const [messages, setMessages] = React.useState([]);
  React.useEffect(() => {
    // Make HTTP call to get messages.
    setMessages([{user: 'George'}, {user: 'Bob'}]);
  }, []);
  return (
      <Drawer variant="permanent" anchor="left">
        <Typography variant="h6">Direct Messages</Typography>
        <Divider />
        <List>
          {messages.map(message => (
            <ListItem>
              <ListItemText>{message.user}</ListItemText>
            </ListItem>
          ))}
        </List>
      </Drawer>
  );
}
