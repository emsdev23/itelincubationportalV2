// utils/auth.js
export const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1])); // decode JWT payload
    const expiry = payload.exp * 1000; // exp is in seconds
    return Date.now() >= expiry;
  } catch (e) {
    return true; // invalid token → treat as expired
  }
};
