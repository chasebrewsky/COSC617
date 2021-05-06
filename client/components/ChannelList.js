import { useStyles } from '../services/styles';
import React from 'react';
import { Collapse, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import ChatBubble from '@material-ui/icons/ChatBubble';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import AddCircle from '@material-ui/icons/AddCircle';
import { Link } from 'react-router-dom';

import API from '../services/API';
import socket from '../services/socket';

export default function ChannelList() {
  const classes = useStyles();
  const [channels, setChannels] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const handleClick = () => setOpen(!open);

  React.useEffect(() => {
    const listener = socket.on('CHANNEL_CREATED', () => {
      API.get('/channels').then(response => {
        setChannels(response.data.results);
      });
    });

    API.get('/channels').then(response => {
      setChannels(response.data.results);
    });

    return () => listener();
  }, []);

  return (
    <React.Fragment>
      <ListItem button onClick={handleClick}>
        <ListItemIcon>
          <ChatBubble />
        </ListItemIcon>
        <ListItemText primary="Channels" />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {channels.map(channel => (
            <ListItem
              button
              component={Link}
              key={channel.id}
              to={`/channels/${channel.id}`}
              className={classes.nested}>
              <ListItemText primary={channel.name} />
            </ListItem>
          ))}
          <ListItem
            button
            component={Link}
            to={`/channels/create`}
            className={classes.nested}>
            <ListItemIcon>
              <AddCircle />
            </ListItemIcon>
            <ListItemText primary="Create" />
          </ListItem>
        </List>
      </Collapse>
    </React.Fragment>
  )
}
