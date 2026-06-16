import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // You can toggle 'role' between 'trainer' and 'member' right here to test both states instantly!
  const [user, setUser] = useState({
    username: 'rohan_trainer', 
    role: 'trainer', // Change this string to 'member' later to test the member dashboard view
    token: 'mock-jwt-token'
  });

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
