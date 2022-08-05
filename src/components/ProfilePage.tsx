import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import validator from 'validator';
import Amplify, { Auth, Hub } from 'aws-amplify';
import { Alert, Card, CardContent, CardHeader, CardMedia } from '@mui/material';
import * as React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Route, Routes, useNavigate, Link } from 'react-router-dom';
import Navbar from './Navbar';
import RequiredParameterException from '../utils/RequiredParameterException';

const theme = createTheme();

enum Display {
  CHANGE_PASSWORD,
  MFA,
}

interface Fields {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  password2?: string;
  general?: string;
  auth?: string;
  oldPassword?: string;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [currentFlow, setCurrentFlow] = React.useState(Display.CHANGE_PASSWORD);
  const [fields, setFields] = React.useState<Fields>({});
  const [errors, setErrors] = React.useState<Fields>({});
  const [success, setSuccess] = React.useState(false);
  const [checked, setChecked] = React.useState(false);
  const [anthony, setAnthony] = React.useState<any>(null);
  const [qrCode, setQRCode] = React.useState<any>(null);
  const [verifySucess, setVerifySuccess] = React.useState(false);

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
      setSuccess(false);
      if (!fields.oldPassword) {
        throw new RequiredParameterException('Old Password is required', 'oldPassword');
      }

      if (!fields.password) {
        throw new RequiredParameterException('Password is required', 'password');
      }

      if (!fields.password2) {
        throw new RequiredParameterException('Confirm password is required', 'password2');
      }

      if (fields.password !== fields.password2) {
        throw new RequiredParameterException('Passwords do not match', 'password2');
      }

      const user = await Auth.currentAuthenticatedUser()
        .then((updatedUser) => {
          console.log(updatedUser);
          return Auth.changePassword(updatedUser, fields.oldPassword || '', fields.password || '');
        })
        .then((data) => {
          setSuccess(true);
          setFields({});
          setErrors({});
          console.log(data);
        });

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

  async function awsShit() {
    const user = await Auth.currentAuthenticatedUser();
    setAnthony(user);
    // const authman = await Auth.setPreferredMFA(user, 'TOTP');
    // console.log(authman);

    const totp = await Auth.setupTOTP(user);
    const str = `otpauth://totp/AWSCognito:${user.username}?secret=${totp}&issuer=${process.env.REACT_APP_COGNITO_USER_POOL_ID}`;

    setQRCode(str);
  }

  const handleAuth = async (event: any) => {
    try {
      setVerifySuccess(false);
      event.preventDefault();
      if (!fields.auth) {
        throw new RequiredParameterException('Authentication code is required', 'auth');
      }
      const user = await Auth.currentAuthenticatedUser();
      Auth.verifyTotpToken(user, fields.auth).then((result) => {
        console.log(result);
        Auth.setPreferredMFA(user, 'TOTP');
        setVerifySuccess(true);
      });
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

  React.useEffect(() => {
    awsShit();
  }, []);
  console.log(anthony);
  return (
    <>
      <Navbar anthony={anthony} />
      <Container>
        <Typography variant="h3" sx={{ marginTop: '30px', marginBottom: '30px' }}>
          Account Settings
        </Typography>
        <div className="w-[100%]" style={{ width: '100%' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Button variant="text" sx={{ margin: 1, textDecoration: 'none', outline: 0 }}>
              User Profile Data
            </Button>
          </Link>
          <Link to="/change-password" style={{ textDecoration: 'none' }}>
            <Button variant="text" sx={{ margin: 1, textDecoration: 'none', outline: 0 }}>
              Change Password
            </Button>
          </Link>
          <Link to="/security" style={{ textDecoration: 'none' }}>
            <Button variant="text" sx={{ margin: 1, textDecoration: 'none', outline: 0 }}>
              Account Security
            </Button>
          </Link>
        </div>
        <div className="flex border-t-[1px] h-[80vh]">
          {/* Change Password */}
          <Routes>
            <Route
              path="/"
              element={
                <Card variant="outlined" style={{ display: 'inline-block', width: '450px' }}>
                  <CardMedia sx={{ padding: 2 }}>
                    <Avatar alt="Remy Sharp" />
                  </CardMedia>
                  <CardHeader title={anthony && anthony?.attributes.name} />
                  <CardContent>
                    <Typography color="primary" variant="h6">
                      User Details
                    </Typography>
                    <Typography color="textSecondary" variant="subtitle1">
                      {anthony && anthony.username}
                    </Typography>{' '}
                    <Typography color="textSecondary" variant="subtitle1">
                      Test Card
                    </Typography>{' '}
                  </CardContent>
                </Card>
              }
            />
            <Route
              path="/change-password"
              element={
                <div className="px-5 w-[80%]">
                  <div
                    className="flex items-center justify-between w-[100%] mt-5"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      marginTop: 5,
                    }}
                  >
                    <Typography variant="h6">Change Password</Typography>
                  </div>
                  {errors && errors.general && (
                    <Alert sx={{ marginTop: 2 }} severity="error">
                      {errors.general}
                    </Alert>
                  )}
                  {success && (
                    <Alert sx={{ marginTop: 2 }} severity="success">
                      Password changed successfully
                    </Alert>
                  )}
                  <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1">Email / Username</Typography>
                        <TextField
                          variant="outlined"
                          size="small"
                          disabled
                          fullWidth
                          label={(anthony && anthony?.username) || ''}
                          sx={{
                            marginTop: '0.5rem',
                            borderColor: '#ccc',
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1">Old Password</Typography>
                        <TextField
                          required
                          fullWidth
                          id="oldPassword"
                          label="Old Password"
                          name="oldPassword"
                          onChange={handleChange}
                          variant="outlined"
                          size="small"
                          type="password"
                          error={Boolean(errors.oldPassword)}
                          helperText={errors.oldPassword}
                          sx={{
                            marginTop: '0.5rem',
                            borderColor: '#ccc',
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1">New Password</Typography>
                        <TextField
                          required
                          variant="outlined"
                          fullWidth
                          id="password"
                          label="New Password"
                          name="password"
                          onChange={handleChange}
                          size="small"
                          type="password"
                          error={Boolean(errors.password)}
                          helperText={errors.password}
                          sx={{
                            marginTop: '0.5rem',
                            borderColor: '#ccc',
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1">Confirm New Password</Typography>
                        <TextField
                          fullWidth
                          required
                          variant="outlined"
                          size="small"
                          id="password2"
                          label="Confirm New Password"
                          name="password2"
                          type="password"
                          onChange={handleChange}
                          error={Boolean(errors.password2)}
                          helperText={errors.password2}
                          sx={{
                            marginTop: '0.5rem',
                            borderColor: '#ccc',
                          }}
                        />
                      </Grid>
                    </Grid>
                    <Button
                      type="submit"
                      variant="contained"
                      color="success"
                      style={{ marginTop: 10 }}
                    >
                      Save Changes
                    </Button>
                  </Box>
                </div>
              }
            />
            <Route
              path="security"
              element={
                <div className="px-5 w-[80%]">
                  <div className="flex items-center justify-between w-[100%] mt-5">
                    <Typography variant="h6">Account Security</Typography>
                  </div>
                  <Typography variant="subtitle1" color="secondary">
                    {anthony && anthony.preferredMFA === 'NOMFA'
                      ? 'MFA is not enabled for this account'
                      : 'MFA is enabled for this account'}
                  </Typography>
                  {verifySucess && (
                    <Alert sx={{ marginTop: 2 }} severity="success">
                      MFA Enabled Successfully !
                    </Alert>
                  )}
                  {errors && errors.general && (
                    <Alert sx={{ marginTop: 2 }} severity="error">
                      {errors.general}
                    </Alert>
                  )}
                  <Box component="form" noValidate onSubmit={handleAuth} sx={{ mt: 3 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="h6">Setup MultiFactor Authentication</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <QRCodeSVG value={qrCode} />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          id="auth"
                          name="auth"
                          autoFocus
                          required
                          fullWidth
                          label="Enter Authentication Code"
                          onChange={handleChange}
                          error={Boolean(errors.auth)}
                          helperText={errors.auth}
                        />
                      </Grid>
                    </Grid>
                    <Button
                      variant="contained"
                      type="submit"
                      color="success"
                      style={{ marginTop: 10 }}
                    >
                      {' '}
                      Save Changes{' '}
                    </Button>
                  </Box>
                </div>
              }
            />
          </Routes>
        </div>
      </Container>
    </>
  );
}
