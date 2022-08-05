import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { Alert, CircularProgress } from '@mui/material';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';
import validator from 'validator';
import { ToastContainer, toast } from 'react-toastify';
import { Auth } from 'aws-amplify';
import config from './AwsConfig';
import RequiredParameterException from '../utils/RequiredParameterException';

Auth.configure(config);

const theme = createTheme();
interface Fields {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  password2?: string;
  general?: string;
  code?: string;
}

export default function Verify() {
  const navigate = useNavigate();
  const [fields, setFields] = React.useState<Fields>({});
  const [errors, setErrors] = React.useState<Fields>({});
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedFields = { ...fields };
    console.log(event.target.name);
    const field = event.target.name as keyof Fields;
    updatedFields[field] = event.target.value;
    setFields(updatedFields);

    const updatedErrors = { ...errors };
    delete updatedErrors[field];
    setErrors(updatedErrors);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    try {
      setLoading(true);
      event.preventDefault();
      if (!fields.email) {
        setLoading(false);
        throw new RequiredParameterException('Email is required', 'email');
      }
      const validEmail = validator.isEmail(fields.email || '');
      if (!validEmail) {
        setLoading(false);
        throw new RequiredParameterException('Email is invalid', 'email');
      }

      if (!fields.code) {
        setLoading(false);
        throw new RequiredParameterException('Code is required', 'code');
      }

      if (!fields.password) {
        setLoading(false);
        throw new RequiredParameterException('Password is required', 'password');
      }
      console.log(fields.code);
      const signUp = await Auth.confirmSignUp(fields.email.toLowerCase().trim(), fields.code, {
        // Optional. Force user confirmation irrespective of existing alias. By default set to True.
        forceAliasCreation: true,
      });
      console.log(signUp);
      if (signUp) {
        setLoading(false);
        await Auth.signIn(fields.email.toLowerCase().trim(), fields.password);
        navigate('/');
      }
    } catch (error) {
      setLoading(false);
      const err = error as RequiredParameterException;
      switch (err.code) {
        case 'RequiredParameterException':
          setErrors({ [err.parameterName]: err.message });
          break;
        default:
          setErrors({ general: err.message });
      }
      console.log(err);
    }
  };

  //     Auth.currentAuthenticatedUser({
  //     bypassCache: true,
  // })
  //   .then((data) => {
  //     let user = { username: data.email };
  //     console.log(user);
  //   })
  //   .catch((err) => console.log(err));

  async function resendConfirmationCode() {
    try {
      if (!fields.email) {
        throw new RequiredParameterException('Email is required', 'email');
      }
      await Auth.resendSignUp(fields.email?.toLowerCase().trim() || '');
      setSuccess(true);
    } catch (error) {
      const err = error as RequiredParameterException;
      switch (err.code) {
        case 'RequiredParameterException':
          setErrors({ [err.parameterName]: err.message });
          break;
        default:
          setErrors({ general: err.message });
      }
      console.log(err);
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Enter your Verfication Code
          </Typography>
          <Alert sx={{ marginTop: 2 }} severity="info">
            Check your email for the verification code!
          </Alert>
          {errors && errors.general && (
            <Alert sx={{ marginTop: 2 }} severity="error">
              {errors.general}
            </Alert>
          )}
          {success && (
            <Alert sx={{ marginTop: 2 }} severity="info">
              Verification code sent!
            </Alert>
          )}
          {loading && <CircularProgress />}
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              onChange={handleChange}
              label="Email Address"
              name="email"
              autoFocus
              error={Boolean(errors.email)}
              helperText={errors.email}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              onChange={handleChange}
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              error={Boolean(errors.password)}
              helperText={errors.password}
            />
            <TextField
              onChange={handleChange}
              margin="normal"
              required
              fullWidth
              id="code"
              label="Verification Code"
              name="code"
              autoFocus
              error={Boolean(errors.code)}
              helperText={errors.code}
            />
            <Button type="submit" fullWidth variant="contained">
              Verify Code
            </Button>
          </Box>
          <Button
            fullWidth
            sx={{ marginTop: 2 }}
            variant="outlined"
            onClick={() => {
              resendConfirmationCode();
            }}
          >
            Resend Code
          </Button>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
