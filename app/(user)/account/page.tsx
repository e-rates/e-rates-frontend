import React from 'react';
import Login from '../components/Account/Login';

const page = () => {
  return (
    <div
      className="flex min-h-screen w-full items-center justify-center"
      style={{ background: '#f0f0f0' }}
    >
      <div className="w-full max-w-md px-4 pt-8">
        <Login />
      </div>
    </div>
  );
};

export default page;
