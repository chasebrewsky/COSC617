const { makeStyles } = require("@material-ui/core");

export const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
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
  },
  drawerPaper: {
    width: 240,
  },
  content: {
    flexGrow: 1,
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  message: {
    padding: '1rem',
    marginTop: '1rem',
  }
}));
