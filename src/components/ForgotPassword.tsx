import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Auth } from 'aws-amplify';
import { useNavigate } from 'react-router-dom';
import { Alert } from '@mui/material';
import RequiredParameterException from '../utils/RequiredParameterException';

const theme = createTheme();

enum Display {
  RESET,
  CONFIRM,
}

interface Fields {
  email?: string;
  password?: string;
  code?: string;
  general?: string;
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [currentFlow, setCurrentFlow] = React.useState(Display.RESET);
  const [fields, setFields] = React.useState<Fields>({});
  const [errors, setErrors] = React.useState<Fields>({});

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault();
      if (!fields.email) {
        throw new RequiredParameterException('Email Address is required', 'email');
      }
      const user = await Auth.forgotPassword(fields.email.toLowerCase());

      console.log(user);
      if (user) {
        setCurrentFlow(Display.CONFIRM);
      }
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
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedFields = { ...fields };
    const field = event.target.name as keyof Fields;
    updatedFields[field] = event.target.value;
    setFields(updatedFields);

    const updatedErrors = { ...errors };
    delete updatedErrors[field];
    setErrors(updatedErrors);
  };

  const handleConfirm = async (event: React.FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault();
      if (!fields.email) {
        throw new RequiredParameterException('Email Address is required', 'email');
      }
      if (!fields.password) {
        throw new RequiredParameterException('Password is required', 'password');
      }
      if (!fields.code) {
        throw new RequiredParameterException('Code is required', 'code');
      }
      console.log(fields.email);
      const user = await Auth.forgotPasswordSubmit(
        fields.email.toString(),
        fields.code,
        fields.password,
      );
      if (user) {
        navigate('/');
      }
      console.log(user);
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
  };

  //     Auth.currentAuthenticatedUser({
  //     bypassCache: true,
  // })
  //   .then((data) => {
  //     let user = { username: data.email };
  //     console.log(user);
  //   })
  //   .catch((err) => console.log(err));

  return currentFlow === Display.RESET ? (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
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
            Reset your password
          </Typography>

          {errors && errors.general && (
            <Alert sx={{ marginTop: 2 }} severity="error">
              {errors.general}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              onChange={handleChange}
              fullWidth
              id="email"
              label="Enter your username"
              name="email"
              autoComplete="email"
              autoFocus
              error={Boolean(errors.email)}
              helperText={errors.email}
            />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
              Send Code
            </Button>

            <Link href="/login" variant="body2">
              Back to Sign in
            </Link>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  ) : (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Alert sx={{ marginTop: 2 }} severity="info">
          An email has been sent to you with a code to reset your password.
        </Alert>
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
            Enter your verification code
          </Typography>

          {errors && errors.general && (
            <Alert sx={{ marginTop: 2 }} severity="error">
              {errors.general}
            </Alert>
          )}

          <Box component="form" onSubmit={handleConfirm} noValidate sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Enter your username"
              name="email"
              autoComplete="email"
              autoFocus
              onChange={handleChange}
              error={Boolean(errors.email)}
              helperText={errors.email}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Enter your new password"
              type="password"
              id="password"
              autoComplete="current-password"
              onChange={handleChange}
              error={Boolean(errors.password)}
              helperText={errors.password}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="code"
              label="Enter your verification code"
              name="code"
              autoComplete="code"
              autoFocus
              onChange={handleChange}
              error={Boolean(errors.general)}
              helperText={errors.general}
            />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
              Confirm
            </Button>

            <Link href="/login" variant="body2">
              Back to Sign in
            </Link>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
