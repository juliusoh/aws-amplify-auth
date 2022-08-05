import * as React from 'react';
import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { Auth } from 'aws-amplify';

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const location = useLocation();
  const navigate = useNavigate();
  React.useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then()
      .catch((err) => {
        console.log(err);
        navigate('/login');
      });
  }, [navigate]);
  //   const { route } = useAuthenticator((context) => [context.route]);
  //   console.log(route);
  //   if (route !== 'authenticated') {
  //     return <Navigate to="/login" state={{ from: location }} replace />;
  //   }
  return children;
}
