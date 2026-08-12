import { createContext, useContext, useMemo, useState, useEffect } from "react";

const AuthContext = createContext(null);


export function AuthProvider({ children }) {


  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });



  const [loading, setLoading] = useState(false);



  const login = ({ user, token }) => {

    setUser(user);
    setToken(token);

    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );

    localStorage.setItem(
      "token",
      token
    );
  };



  const logout = () => {

    setUser(null);
    setToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("token");

  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  // Validate token on startup — if token is invalid/expired, clear auth state
  useEffect(() => {
    const validateToken = async () => {
      if (!token) return;

      try {
        const res = await fetch('/api/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) {
          // token invalid or expired
          logout();
        } else {
          const data = await res.json();
          // ensure local user matches server
          if (data?.user) {
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
          }
        }
      } catch (err) {
        logout();
      }
    };

    validateToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const value = useMemo(()=>({

    user,
    token,
    loading,

    isAuthenticated: Boolean(token && user),

    login,
    logout,
    updateUser

  }),[user,token,loading]);



  return (

    <AuthContext.Provider value={value}>

      {children}

    </AuthContext.Provider>

  );

}



export function useAuth(){

 const context = useContext(AuthContext);


 if(!context){

  throw new Error(
    "useAuth must be used inside AuthProvider"
  );

 }


 return context;

}