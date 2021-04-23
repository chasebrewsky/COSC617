import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import DirectChannelList from './components/DirectChannelList';
import { useStyles } from './services/styles';
import ChannelList from './components/ChannelList';
import Channel from './components/Channel';
import DirectChannel from './components/DirectChannel';

export default function App() {
  const classes = useStyles();
  return (
    <Router>
      <div className={classes.root}>
        <CssBaseline />
        <Drawer variant="permanent" anchor="left" className={classes.drawer} classes={{
          paper: classes.drawerPaper,
        }}>
          <Typography variant="h6" className={classes.logo}>SlackLord</Typography>
          <Divider />
          <List component="nav">
            <ChannelList />
            <DirectChannelList />
          </List>
        </Drawer>
        <main className={classes.content}>
          <Switch>
            <Route path="/messages/:id">
              <DirectChannel />
            </Route>
            <Route path="/channels/:id">
              <Channel />
            </Route>
            <Route path="/">

            </Route>
          </Switch>
        </main>
      </div>
    </Router>
  );
}
