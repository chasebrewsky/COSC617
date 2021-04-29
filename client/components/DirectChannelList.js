import { Collapse, List, ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import DraftsIcon from '@material-ui/icons/Drafts';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import React from "react";
import { useStyles } from "../services/styles";
import { Link } from "react-router-dom";

export default function DirectChannelList() {
  const classes = useStyles();
  const [channels, setChannels] = React.useState([]);
  React.useEffect(() => {
    // Make HTTP call to get messages.
    setChannels([{id: 1, user: 'George'}, {id: 2, user: 'Bob'}]);
  }, []);
  const [open, setOpen] = React.useState(false);
  const handleClick = () => setOpen(!open);
  return (
    <React.Fragment>
      <ListItem button onClick={handleClick}>
        <ListItemIcon>
          <DraftsIcon />
        </ListItemIcon>
        <ListItemText primary="Messages" />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {channels.map(channel => (
            <ListItem
              button
              component={Link}
              key={channel.id}
              to={`/messages/${channel.id}`}
              className={classes.nested}>
              <ListItemText primary={channel.user} />
            </ListItem>
          ))}
        </List>
      </Collapse>
    </React.Fragment>
  )
}
