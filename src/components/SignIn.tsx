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
import { QRCodeSVG } from 'qrcode.react';
import { PhoneAndroid } from '@mui/icons-material';
import { Alert, CircularProgress, Modal, Paper } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { Auth } from 'aws-amplify';
import config from './AwsConfig';
import RequiredParameterException from '../utils/RequiredParameterException';

const theme = createTheme();
interface Fields {
  email?: string;
  password?: string;
  general?: string;
  auth?: string;
}

export default function SignIn() {
  const navigate = useNavigate();
  const [fields, setFields] = React.useState<Fields>({});
  const [errors, setErrors] = React.useState<Fields>({});
  const [modalOpen, setModalOpen] = React.useState(false);
  const [qrCode, setQRCode] = React.useState<any>(null);
  const [awsUser, setAwsUser] = React.useState<any>(null);
  const [challenge, setChallenge] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [isChecked, setIsChecked] = React.useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedFields = { ...fields };
    const field = event.target.name as keyof Fields;
    updatedFields[field] = event.target.value;
    setFields(updatedFields);

    const updatedErrors = { ...errors };
    delete updatedErrors[field];
    setErrors(updatedErrors);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    try {
      setErrors({});
      event.preventDefault();
      setLoading(true);
      if (!fields.email) {
        setLoading(false);
        throw new RequiredParameterException('Email Address is required', 'email');
      }

      if (!fields.password) {
        setLoading(false);
        throw new RequiredParameterException('Password is required', 'password');
      }

      const user = await Auth.signIn(fields.email.toLowerCase().trim(), fields.password);
      //   const totp = await Auth.setupTOTP(user);
      //   console.log(totp);
      //   const str = `otpauth://totp/AWSCognito:${user.username}?secret=${totp}&issuer=${process.env.REACT_APP_COGNITO_USER_POOL_ID}`;
      //   setQRCode(str);
      setAwsUser(user);
      if (!user.challengeName && user) {
        setLoading(false);
        navigate('/');
      }
      switch (user.challengeName) {
        case 'SMS_MFA':
        case 'SOFTWARE_TOKEN_MFA':
          setLoading(false);
          setModalOpen(true);
          setErrors({});
          setChallenge('SOFTWARE_TOKEN_MFA');
          break;
        case 'NEW_PASSWORD_REQUIRED':
          // Redirect user to new password form
          break;
        case 'MFA_SETUP':
          break;
        case 'CUSTOM_CHALLENGE':
          if (user.challengeParam && user.challengeParam.trigger === 'true') {
            // Redeirect user to auth challenge form
          }
          break;
        default:
          break;
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

  const handleAuth = async (event: any) => {
    try {
      setErrors({});
      setLoading(true);
      event.preventDefault();
      if (!fields.auth) {
        throw new RequiredParameterException('Authentication code is required', 'auth');
      }
      const userCode = fields.auth;
      console.log(awsUser, userCode, challenge);
      const confirm = await Auth.confirmSignIn(awsUser, userCode, challenge);
      console.log(confirm);
      if (confirm) {
        setLoading(false);
        navigate('/');
      }
      //   Auth.verifyTotpToken(awsUser, fields.auth).then((result) => {
      //     console.log(result);
      //     navigate('/');
      //   });
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
  const handleClose = () => {
    setModalOpen(false);
  };

  const toggleCheck = () => {
    setIsChecked(!isChecked);
  };
  return (
    <ThemeProvider theme={theme}>
      <Modal
        open={modalOpen}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          component="form"
          noValidate
          onSubmit={handleAuth}
          sx={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Paper elevation={3}>
            <Typography
              id="modal-modal-title"
              variant="h6"
              component="h2"
              sx={{
                backgroundColor: 'RGB(104, 123, 140)',
                padding: '1rem',
                color: '#fff',
                fontWeight: 'bold',
              }}
            >
              Two-factor Authentication
            </Typography>
            {errors && errors.general && (
              <Alert sx={{ marginTop: 2 }} severity="error">
                {errors.general}
              </Alert>
            )}
            <Grid container spacing={2} sx={{ padding: '1rem' }}>
              <Grid item xs={12}>
                <Typography
                  id="modal-modal-description"
                  variant="subtitle1"
                  sx={{ fontWeight: 'bold' }}
                >
                  Authentication Code
                </Typography>
                <TextField
                  id="auth"
                  name="auth"
                  variant="outlined"
                  autoFocus
                  required
                  fullWidth
                  label="Enter Authentication Code"
                  onChange={handleChange}
                  error={Boolean(errors.auth)}
                  helperText={errors.auth}
                />
              </Grid>
              <Grid item xs={12} sx={{ textAlign: 'center' }}>
                {loading && <CircularProgress />}
                <Button
                  variant="contained"
                  type="submit"
                  color="success"
                  style={{ marginTop: 10, width: '100%' }}
                >
                  {' '}
                  Verify Code{' '}
                </Button>
              </Grid>
            </Grid>
          </Paper>
          <Paper sx={{ backgroundColor: '#fff', padding: '1rem', marginTop: '2rem' }} elevation={3}>
            <Typography variant="subtitle1" component="h2">
              <PhoneAndroid />
              Open the two-factor authentication app on your device to view your authentication code
              and verify your identity
            </Typography>
          </Paper>
        </Box>
      </Modal>
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
            Sign in
          </Typography>

          {errors && errors.general && (
            <Alert sx={{ marginTop: 2 }} severity="error">
              {errors.general}
            </Alert>
          )}
          {loading && <CircularProgress sx={{ textAlign: 'center' }} />}
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              error={Boolean(errors.email)}
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              onChange={handleChange}
              helperText={errors.email}
            />
            <TextField
              margin="normal"
              error={Boolean(errors.password)}
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              onChange={handleChange}
              helperText={errors.password}
            />
            {/* <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
              onChange={toggleCheck}
              checked={isChecked}
            /> */}
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
              Sign In
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href="/reset" variant="body2">
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link href="/register" variant="body2">
                  Dont have an account? Sign Up
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
