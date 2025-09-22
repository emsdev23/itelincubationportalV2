import { useNavigate, useParams } from "react-router-dom";
import { useState, useContext } from "react";
import styles from "./LoginForm.module.css";
import logo from "../../assets/ITEL_Logo.png";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import Swal from "sweetalert2";
import api from "../Datafetching/api"; // axios instance
import { DataContext } from "../Datafetching/DataProvider";

const LoginForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setUserid, setroleid } = useContext(DataContext); // ✅ access setUserid
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/login", {
        username: formData.username,
        password: formData.password,
      });

      const result = response.data;
      console.log("Login Response:", result);

      const { token, userid, roleid } = result.data;

      // Save session data
      localStorage.clear();
      sessionStorage.setItem("userid", userid); // no need to stringify
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("roleid", roleid);

      // Update context so dashboard fetches data automatically
      setUserid(userid);
      setroleid(roleid);

      // Redirect based on role
      if (roleid === "1") {
        Swal.fire({
          icon: "success",
          title: "Welcome Incubator!",
          text: "Redirecting...",
          timer: 2000,
          showConfirmButton: false,
        });
        setTimeout(() => navigate("/Incubation/Dashboard"), 1000);
      } else if (roleid === "4") {
        Swal.fire({
          icon: "success",
          title: "Welcome Incubatee!",
          text: "Redirecting...",
          timer: 2000,
          showConfirmButton: false,
        });
        setTimeout(() => navigate(`/startup/Dashboard/${userid}`), 1000);
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Unknown role!",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: "Invalid username or password",
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.logoSection}>
          <div className={styles.logoWrapper}>
            <img src={logo} alt="Logo" className={styles.logo} />
          </div>
          <h1 className={styles.heading}>Welcome Back</h1>
          <p className={styles.subText}>Sign in to your account to continue</p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Sign In</h2>
            <p className={styles.cardDescription}>
              Enter your credentials to access your account
            </p>
          </div>
          <div className={styles.cardContent}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="username" className={styles.label}>
                  Username
                </label>
                <div className={styles.inputWrapper}>
                  <User className={styles.icon} />
                  <input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                    className={styles.input}
                    style={{ textAlign: "center" }}
                    required
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="password" className={styles.label}>
                  Password
                </label>
                <div className={styles.inputWrapper}>
                  <Lock className={styles.icon} />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className={styles.input}
                    style={{ textAlign: "center" }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.eyeButton}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className={styles.submitButton}>
                Sign In
              </button>

              <div className={styles.textCenter}>
                <button type="button" className={styles.link}>
                  Forgot your password?
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className={styles.footer}>
          <p>
            Don&apos;t have an account?{" "}
            <button className={styles.linkBold}>Sign up</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
