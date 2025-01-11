import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomAlert from "../components/custom-alert";
import { loginAdmin } from "../api/api";

export default function Login() {
  const [isVisiblePassword, setIsVisiblePassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");

  const closeAlert = () => {
    setAlertMessage("");
    setAlertType("");
  };

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      setAlertMessage("Email and password is required");
      setAlertType("error");
      return;
    }

    try {
      const response = await loginAdmin({
        username: formData.username,
        password: formData.password,
      });

      console.log(response);
      const token = response.data.data.token;
      localStorage.setItem("token", token);
      localStorage.setItem("adminName", response.data.data.admin.name);
    } catch (error) {
      console.error(error);
      setAlertMessage("Error logging in");
      setAlertType("error");
      return;
    } finally {
      navigate("/");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, []);

  return (
    <div className="h-screen bg-[var(--maroon)] flex items-center justify-center px-4">
      {alertMessage && (
        <CustomAlert
          message={alertMessage}
          type={alertType}
          onClose={closeAlert}
        />
      )}
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg">
        <h1 className="text-3xl font-bold text-center text-black mb-4">
          Login
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block mb-2 text-black">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="w-full px-4 py-2 border rounded-md"
              onChange={handleChange}
              value={formData.username}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block mb-2 text-black">
              Password
            </label>
            <input
              type={isVisiblePassword ? "text" : "password"}
              id="password"
              name="password"
              className="w-full px-4 py-2 border rounded-md"
              onChange={handleChange}
              value={formData.password}
              required
            />
          </div>
          <div className=" mb-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="show-password-checkbox"
              onChange={() => setIsVisiblePassword((prev) => !prev)}
            />
            <label
              htmlFor="show-password-checkbox"
              className="cursor-pointer text-black text-sm"
            >
              Tampilkan password
            </label>
          </div>
          <button
            type="submit"
            className="bg-[var(--maroon)] hover:bg-rose-900 text-white px-4 py-2 mt-2 rounded-md w-full"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
