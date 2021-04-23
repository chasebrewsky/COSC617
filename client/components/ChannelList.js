import { useStyles } from "../services/styles";
import React from "react";
import { Collapse, List, ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import ChatBubble from "@material-ui/icons/ChatBubble";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import { Link, BrowserRouter as Router } from "react-router-dom";

export default function ChannelList() {
  const classes = useStyles();
  const [channels, setChannels] = React.useState([]);
  React.useEffect(() => {
    // Make HTTP call to get messages.
    setChannels([{id: 1, name: 'Video Games'}, {id: 2, name: 'Something'}]);
  }, []);
  const [open, setOpen] = React.useState(false);
  const handleClick = () => setOpen(!open);
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
        </List>
      </Collapse>
    </React.Fragment>
  )
}
