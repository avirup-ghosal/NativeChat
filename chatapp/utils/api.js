import axios from "axios";

const API = axios.create({
  baseURL: "http://192.168.0.101:5000", 
  headers: { "Content-Type": "application/json" }
});

// Register user
export const registerUser = (data) => API.post("/auth/register", data);

// Login user
export const loginUser = (data) => API.post("/auth/login", data);

// Get users
export const getUsers = () => API.get("/users");

export default API;
