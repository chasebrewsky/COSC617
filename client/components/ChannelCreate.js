import React from 'react';
import Paper from '@material-ui/core/Paper';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from "@material-ui/core/Typography";
import { useHistory } from 'react-router-dom';
import API from "../services/API";


export default function ChannelCreate() {
  const history = useHistory();
  const [errors, setErrors] = React.useState([]);
  const [value, setValue] = React.useState('');

  const onSubmit = React.useCallback(event => {
    event.preventDefault();

    API.post('/channels', { name: value })
      .then(response => {
        history.push(`/channels/${response.data.id}`);
      })
      .catch(error => {
        setErrors(error.response.data.fields.name);
      })
  }, [value])

  const onChange = React.useCallback(event => {
    setValue(event.target.value);
  }, [])

  return (
    <Container>
      <Paper style={{ padding: '1rem', marginTop: '2rem' }}>
        <Typography variant="h6">Create Channel</Typography>
        <form noValidate onSubmit={onSubmit}>
          <TextField
            fullWidth
            value={value}
            onChange={onChange}
            error={!!errors.length}
            label="Name"
            style={{ marginBottom: '1rem', marginTop: '1rem' }}
            helperText={errors.length ? errors[0] : null}
          />
          <Button variant="contained" color="primary" type="submit">Create</Button>
        </form>
      </Paper>
    </Container>
  );
}
