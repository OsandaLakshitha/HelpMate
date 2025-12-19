// Fake AuthContext.jsx to bypass authentication during development

import { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // 1. ALWAYS start with a fake user (Bypasses login screen)
  const [user, setUser] = useState({
    id: 999,
    name: "Developer",
    email: "dev@local",
    role: "admin" // Gives you access to everything
  });

  // 2. Loading is always false (No waiting for backend)
  const loading = false;

  // 3. Fake Login function (does nothing but success)
  const login = async () => {
    console.log("Mock login success");
    return { success: true };
  };

  // 4. Fake Logout
  const logout = () => {
    console.log("Mock logout - reloading page");
    window.location.reload();
  };

  // 5. Fake Register
  const register = async () => {
    return { success: true };
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    isAuthenticated: true, // Always true
    isAdmin: true          // Always true
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;





// ------------------


// Real AuthContext.jsx for production use (Uncomment when backend is ready)

// import { createContext, useState, useContext, useEffect } from 'react';
// import api from '../config/api'; 

// const AuthContext = createContext(null);

// 1. Export Hook (Named Export)
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// 2. Export Provider (Named Export)
// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [token, setToken] = useState(localStorage.getItem('token'));

//   useEffect(() => {
//     if (token) {
//       fetchUser();
//     } else {
//       setLoading(false);
//     }
//   }, [token]);

//   const fetchUser = async () => {
//     try {
      // --- REAL BACKEND CALL (Uncomment when Backend Auth is ready) ---
      // const response = await api.get('/users/me');
      // setUser(response.data);

      // --- TEMPORARY DEV FIX ---
      // Since the backend '/users/me' doesn't exist yet, we simulate a success
      // so you can access the protected Dashboard and test your CRUD.
      // console.log("Development Mode: Mocking User Fetch");
      // setUser({ 
      //   id: 1, 
      //   email: "dev@helpmate.com", 
      //   name: "Developer", 
      //   role: "admin" 
      // });

    // } catch (error) {
    //   console.error('Fetch user error:', error);
      // Only logout if it's a real auth error (401), not a connection error
  //     if (error.response && error.response.status === 401) {
  //       logout();
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const login = async (email, password) => {
  //   try {
      // FastAPI OAuth2 expects FormData, not JSON
      // const formData = new FormData();
      // formData.append("username", email); // Note: FastAPI expects 'username' field
      // formData.append("password", password);

      // Post to standard FastAPI token endpoint
      // const response = await api.post('/auth/token', formData);
      
      // FastAPI returns: { access_token: "...", token_type: "bearer" }
      // const accessToken = response.data.access_token;

      // localStorage.setItem('token', accessToken);
      // setToken(accessToken);
      
      // After token is set, fetch user details
  //     await fetchUser();
      
  //     return { success: true };
  //   } catch (error) {
  //     console.error('Login error:', error);
  //     const message = error.response?.data?.detail || 'Network error. Please try again.';
  //     return { success: false, message };
  //   }
  // };

  // const register = async (userData) => {
  //   try {
  //     const response = await api.post('/auth/register', userData);
      
      // Assuming register logs you in automatically, or returns a token
  //     if (response.data.access_token) {
  //       localStorage.setItem('token', response.data.access_token);
  //       setToken(response.data.access_token);
  //       await fetchUser();
  //     }
      
  //     return { success: true };
  //   } catch (error) {
  //     console.error('Register error:', error);
  //     const message = error.response?.data?.detail || 'Registration failed.';
  //     return { success: false, message };
  //   }
  // };

  // const logout = () => {
  //   localStorage.removeItem('token');
  //   setToken(null);
  //   setUser(null);
  // };

  // const updateUser = (updatedUser) => {
  //   setUser(updatedUser);
  // };

  // const value = {
  //   user,
  //   loading,
  //   token,
  //   login,
  //   register,
  //   logout,
  //   updateUser,
  //   isAuthenticated: !!user,
  //   isAdmin: user?.role === 'admin',
  // };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// 3. Default Export (Helps with HMR)
// export default AuthProvider;