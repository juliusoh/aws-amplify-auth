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
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import validator from 'validator';
import { useNavigate } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import { Alert, CircularProgress } from '@mui/material';
import RequiredParameterException from '../utils/RequiredParameterException';

const theme = createTheme();
interface Fields {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  password2?: string;
  general?: string;
}

export default function SignUp() {
  const navigate = useNavigate();

  const [fields, setFields] = React.useState<Fields>({});
  const [errors, setErrors] = React.useState<Fields>({});
  const [loading, setLoading] = React.useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedFields = { ...fields };
    const field = event.target.name as keyof Fields;
    updatedFields[field] = event.target.value;
    setFields(updatedFields);

    const updatedErrors = { ...errors };
    delete updatedErrors[field];
    setErrors(updatedErrors);
  };

  const handleSubmit = async (event: any) => {
    try {
      event.preventDefault();
      setLoading(true);
      if (!fields.firstName) {
        setLoading(false);
        throw new RequiredParameterException('First Name is required', 'firstName');
      }

      if (!fields.lastName) {
        setLoading(false);
        throw new RequiredParameterException('Last Name is required', 'lastName');
      }

      const validEmail = validator.isEmail(fields.email?.trim() || '');
      if (!validEmail) {
        setLoading(false);
        throw new RequiredParameterException('Email is invalid', 'email');
      }

      if (!fields.email) {
        setLoading(false);
        throw new RequiredParameterException('Email Address is required', 'email');
      }

      if (!fields.password) {
        setLoading(false);
        throw new RequiredParameterException('Password is required', 'password');
      }

      if (!fields.password2) {
        setLoading(false);
        throw new RequiredParameterException('Confirm password is required', 'password2');
      }

      if (fields.password !== fields.password2) {
        setLoading(false);
        throw new RequiredParameterException('Passwords do not match', 'password2');
      }

      const user = await Auth.signUp({
        username: fields.email.toLowerCase().trim(),
        password: fields.password,
        attributes: {
          email: fields.email.toLowerCase().trim(),
          name: fields.firstName + fields.lastName,
        },
      });
      if (user) {
        setLoading(false);
        navigate('/verify');
      }
      console.log(user);
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
            Sign up
          </Typography>

          {errors && errors.general && (
            <Alert sx={{ marginTop: 2 }} severity="error">
              {errors.general}
            </Alert>
          )}
          {loading && <CircularProgress sx={{ textAlign: 'center' }} />}
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoFocus
                  onChange={handleChange}
                  error={Boolean(errors.firstName)}
                  helperText={errors.firstName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  onChange={handleChange}
                  autoComplete="family-name"
                  error={Boolean(errors.lastName)}
                  helperText={errors.lastName}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  error={Boolean(errors.email)}
                  label="Email Address"
                  name="email"
                  type="email"
                  onChange={handleChange}
                  autoComplete="email"
                  helperText={errors.email}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  onChange={handleChange}
                  id="password"
                  autoComplete="new-password"
                  error={Boolean(errors.password)}
                  helperText={
                    errors.password ||
                    'Minimum of 8 characters and 1 number, 1 uppercase, 1 lowercase, 1 special character'
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password2"
                  label="Confirm Password"
                  type="password"
                  id="password2"
                  autoComplete="new-password"
                  onChange={handleChange}
                  error={Boolean(errors.password2)}
                  helperText={errors.password2}
                />
              </Grid>
            </Grid>
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
              Sign Up
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/login" variant="body2">
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
