import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// auth
export const loginAdmin = (user) => api.post("/login", user);
export const logoutAdmin = (user) => api.post("/logout", user);

// users
export const updateUserAdmin = (user) => api.put("/users", user);

// divisions
export const getDivisions = (params) => api.get("/divisions", { params });

// employees
export const getEmployees = (params) => api.get("/employees", { params });
export const createEmployee = (employee) => api.post("/employees", employee);
export const updateEmployee = (id, employee) =>
  api.put(`/employees/${id}`, employee);
export const deleteEmployee = (id) => api.delete(`/employees/${id}`);
