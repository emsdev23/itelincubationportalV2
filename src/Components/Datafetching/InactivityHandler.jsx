import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export function InactivityHandler({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    let timeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(showSessionExpiredAlert, 300000); // 1 min
    };

    const logoutUser = async () => {
      try {
        const userid = sessionStorage.getItem("userid");
        const token = sessionStorage.getItem("token");

        if (!userid || !token) return; // already logged out

        const response = await fetch(
          "http://121.242.232.212:8086/itelinc/resources/auth/logout",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              userid,
              logoutreason: "Auto logout due to inactivity",
            }),
          }
        );

        const data = await response.json();
        console.log("Logout response:", data);

        // Clear session
        sessionStorage.clear();

        // Redirect to login
        navigate("/", { replace: true });
      } catch (error) {
        console.error("Logout error:", error);
        navigate("/", { replace: true });
      }
    };

    const showSessionExpiredAlert = () => {
      Swal.fire({
        title: "Session Expired",
        text: "You have been logged out due to inactivity.",
        icon: "warning",
        confirmButtonText: "OK",
        allowOutsideClick: false,
      }).then(() => {
        logoutUser();
      });
    };

    // Track user activity
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);

    resetTimer(); // start timer on mount

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, [navigate]);

  return children;
}
