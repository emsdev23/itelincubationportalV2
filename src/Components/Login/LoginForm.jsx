import { useNavigate } from "react-router-dom";
import { useState } from "react";
import styles from "./LoginForm.module.css";
import logo from "../../assets/ITEL_Logo.png";
import { Eye, EyeOff, Lock, User, UserCheck } from "lucide-react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";

const LoginForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login attempt:", formData);

    // 👉 Add your login validation here
    if (formData.username && formData.password) {
      if (formData.username === "1234") {
        Swal.fire({
          icon: "success",
          title: "Welcome Admin!",
          text: "Redirecting to Incubation Dashboard...",
          timer: 2000,
          showConfirmButton: false,
        });
        setTimeout(() => navigate("/Incubation/Dashboard"), 1000);
      } else if (formData.username === "5678") {
        Swal.fire({
          icon: "success",
          title: "Welcome Startup!",
          text: "Redirecting to Startup Dashboard...",
          timer: 2000,
          showConfirmButton: false,
        });
        setTimeout(() => navigate(`/startup/Dashboard/${id}`), 1000);
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Invalid credentials!",
        });
      }
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Invalid credentials!",
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Logo Section */}
        <div className={styles.logoSection}>
          <div className={styles.logoWrapper}>
            <img src={logo} alt="Logo" className={styles.logo} />
          </div>
          <h1 className={styles.heading}>Welcome Back</h1>
          <p className={styles.subText}>Sign in to your account to continue</p>
        </div>

        {/* Login Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Sign In</h2>
            <p className={styles.cardDescription}>
              Enter your credentials to access your account
            </p>
          </div>
          <div className={styles.cardContent}>
            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Username Field */}
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
                    // required
                  />
                </div>
              </div>

              {/* Password Field */}
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
                    // required
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

              {/* Role Selector */}
              {/* <div className={styles.field}>
                <label htmlFor="role" className={styles.label}>
                  Role
                </label>
                <div className={styles.inputWrapper}>
                  <UserCheck className={styles.icon} />
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => handleInputChange("role", e.target.value)}
                    className={styles.select}
                  >
                    <option value="" disabled>
                      Select your role
                    </option>
                    <option value="admin">Administrator</option>
                    <option value="manager">Manager</option>
                    <option value="employee">Employee</option>
                    <option value="guest">Guest</option>
                  </select>
                </div>
              </div> */}

              {/* Login Button */}
              <button type="submit" className={styles.submitButton}>
                Sign In
              </button>

              {/* Forgot Password Link */}
              <div className={styles.textCenter}>
                <button type="button" className={styles.link}>
                  Forgot your password?
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
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
