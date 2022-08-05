import React from 'react';
import './App.css';
import { withAuthenticator } from '@aws-amplify/ui-react';
import { Auth } from 'aws-amplify';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import Verify from './components/Verify';
import config from './components/AwsConfig';
import ProfilePage from './components/ProfilePage';
import ForgotPassword from './components/ForgotPassword';
import RequireAuth from './components/RequireAuth';

Auth.configure(config);

function App() {
  return (
    <Routes>
      <Route path="/register" element={<SignUp />} />
      <Route path="/login" element={<SignIn />} />
      <Route path="/verify" element={<Verify />} />
      <Route path="/reset" element={<ForgotPassword />} />
      <Route
        path="*"
        element={
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        }
      >
        <Route
          path="/*"
          element={
            <RequireAuth>
              <Navigate to="./security" />
            </RequireAuth>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
