import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import React from 'react';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import { useStyles } from './services/styles';
import ChannelList from './components/ChannelList';
import Channel from './components/Channel';
import ChannelCreate from './components/ChannelCreate';

const theme = createMuiTheme({
  overrides: {
    MuiCssBaseline: {
      '@global': {
        html: { height: '100%', padding: 0 },
        body: { height: '100%' },
        '#root': { height: '100%' },
      },
    },
  },
});

export default function App() {
  const classes = useStyles();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className={classes.root}>
          <Drawer variant="permanent" anchor="left" className={classes.drawer} classes={{
            paper: classes.drawerPaper,
          }}>
            <Typography variant="h6" className={classes.logo}>
              <img src="/static/images/logo.jpg" style={{
                maxWidth: '4rem',
                marginTop: '-1rem',
                marginLeft: '-1rem',
                marginBottom: '-1rem',
                marginRight: '0.5rem',
              }} />
              <span>SlackLord</span>
            </Typography>
            <Divider />
            <List component="nav">
              <ChannelList />
            </List>
          </Drawer>
          <main className={classes.content}>
            <Switch>
              <Route path="/channels/create">
                <ChannelCreate />
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
    </ThemeProvider>
  );
}
