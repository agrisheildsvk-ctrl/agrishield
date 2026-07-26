import React from 'react';
import Login from './Login';

const Register = () => {
  // In the passwordless farmer authentication flow, Login and Register are unified
  // where new users enter their minimal details after OTP / Google verification.
  return <Login />;
};

export default Register;
