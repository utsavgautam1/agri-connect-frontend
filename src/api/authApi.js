const BASE_URL = 'https://agri-connect-flask.onrender.com'; 
const HEADERS = {
  'Content-Type': 'application/json',
};

export const loginApi = async ({ email, password }) => {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Login failed');
    return { user: data.user, token: data.token };
  } catch (error) {
    throw new Error(error.message || 'Login failed');
  }
};

export const registerApi = async ({ fullName, email, phone, farmLocation, password }) => {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({
        full_name: fullName,      
        email,
        phone,
        location: farmLocation,   
        password,
      }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Registration failed');
    return { user: data.user, token: data.token };
  } catch (error) {
    throw new Error(error.message || 'Registration failed');
  }
};

export const logoutApi = async () => {
  // No server-side session to invalidate (token is stateless)
  return true;
};