const { makeStyles } = require("@material-ui/core");

export const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    height: '100%',
    display: 'flex',
  },
  nested: {
    paddingLeft: theme.spacing(4),
    backgroundColor: theme.palette.background.default,
    borderLeft: `solid 5px ${theme.palette.grey['500']}`,
  },
  drawer: {
    width: 240,
    flexShrink: 0,
  },
  logo: {
    padding: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
  },
  drawerPaper: {
    width: 240,
  },
  content: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
}));
