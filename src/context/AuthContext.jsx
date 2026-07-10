// This context manages login state (who's logged in - admin or student) across the app.
// Remember Me works for both Admin and Student now (rememberToken saved in localStorage).

import { createContext, useContext, useState, useEffect } from 'react';
import apiRequest from '../api/apiHelper';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { role: 'admin'|'student', token, ...details }
  const [loading, setLoading] = useState(true);

  // On app load, check if someone is already logged in (via session storage or a remember token)
  useEffect(() => {
    async function tryAutoLogin() {
      // Current tab session first (works for both roles)
      const adminSession = sessionStorage.getItem('adminSession');
      if (adminSession) {
        setUser(JSON.parse(adminSession));
        setLoading(false);
        return;
      }

      const studentSession = sessionStorage.getItem('studentSession');
      if (studentSession) {
        setUser(JSON.parse(studentSession));
        setLoading(false);
        return;
      }

      // Admin's remember token (long-term, in localStorage)
      const adminRememberToken = localStorage.getItem('adminRememberToken');
      if (adminRememberToken) {
        try {
          const data = await apiRequest('/auth/admin/auto-login', {
            method: 'POST',
            body: { rememberToken: adminRememberToken }
          });
          const sessionData = { role: 'admin', token: data.token, ...data.admin };
          sessionStorage.setItem('adminSession', JSON.stringify(sessionData));
          setUser(sessionData);
          setLoading(false);
          return;
        } catch (err) {
          localStorage.removeItem('adminRememberToken');
        }
      }

      // Student's remember token (long-term, in localStorage)
      const studentRememberToken = localStorage.getItem('studentRememberToken');
      if (studentRememberToken) {
        try {
          const data = await apiRequest('/auth/student/auto-login', {
            method: 'POST',
            body: { rememberToken: studentRememberToken }
          });
          const sessionData = { role: 'student', token: data.token, ...data.student };
          sessionStorage.setItem('studentSession', JSON.stringify(sessionData));
          setUser(sessionData);
        } catch (err) {
          localStorage.removeItem('studentRememberToken');
        }
      }

      setLoading(false);
    }

    tryAutoLogin();
  }, []);

  // Called after a successful admin login
  function loginAsAdmin(data, rememberMe) {
    const sessionData = { role: 'admin', token: data.token, ...data.admin };
    sessionStorage.setItem('adminSession', JSON.stringify(sessionData));
    setUser(sessionData);

    if (rememberMe && data.rememberToken) {
      localStorage.setItem('adminRememberToken', data.rememberToken);
    }
  }

  // Called after a successful student login
  function loginAsStudent(data, rememberMe) {
    const sessionData = { role: 'student', token: data.token, ...data.student };
    sessionStorage.setItem('studentSession', JSON.stringify(sessionData));
    setUser(sessionData);

    if (rememberMe && data.rememberToken) {
      localStorage.setItem('studentRememberToken', data.rememberToken);
    }
  }

  function logout() {
    sessionStorage.removeItem('adminSession');
    sessionStorage.removeItem('studentSession');
    localStorage.removeItem('adminRememberToken');
    localStorage.removeItem('studentRememberToken');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginAsAdmin, loginAsStudent, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
