import React, { useEffect, useState } from "react";
import styles from "./Navbar.module.css";
import { Plus, X, LogOut, CircleUserRound, FolderDown } from "lucide-react";
import ITELLogo from "../assets/ITEL_Logo.png";
import MetricCardDashboard from "./MetricCardDashboard";
import CompanyFieldChart from "./CompanyFieldChart";
import FundingStageChart from "./FundingStageChart";
import DocumentTable from "./DocumentTable";
import { NavLink, useNavigate } from "react-router-dom";
import CompanyTable from "./CompanyTable";

import { useContext } from "react";
import { DataContext } from "../Components/Datafetching/DataProvider";

const Navbar = () => {
  const {
    stats,
    byField,
    byStage,
    loading,
    companyDoc,
    listOfIncubatees,
    clearAllData,
  } = useContext(DataContext);
  const navigate = useNavigate();

  console.log(stats);
  console.log(byField);
  console.log(byStage);
  console.log(loading);
  console.log(companyDoc);
  console.log(listOfIncubatees);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    founder: "",
    incorporationDate: "",
    website: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  //form for add startUP
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("New Startup:", formData);
    // TODO: send data to backend
    setIsModalOpen(false);
    setFormData({ name: "", founder: "", incorporationDate: "", website: "" });
  };

  const handleLogout = async () => {
    try {
      const userid = JSON.parse(sessionStorage.getItem("userid"));
      const token = sessionStorage.getItem("token");

      if (!userid || !token) {
        console.warn("User not logged in or token missing");
        return;
      }

      // Call logout API
      const response = await fetch(
        "http://121.242.232.212:8086/itelinc/resources/auth/logout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // if API requires Bearer token
          },
          body: JSON.stringify({
            userid,
            logoutreason: "From Postman",
          }),
        }
      );

      const data = await response.json();
      console.log("Logout response:", data);

      if (response.ok) {
        // Clear all context and session storage
        clearAllData();
        sessionStorage.removeItem("userid");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("roleid");

        // Navigate to login
        navigate("/", { replace: true });
      } else {
        alert(`Logout failed: ${data.message || response.status}`);
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("Something went wrong while logging out");
    }
  };

  //get data form session storage
  const userid = JSON.parse(sessionStorage.getItem("userid"));
  const roleid = sessionStorage.getItem("roleid");
  const token = sessionStorage.getItem("token");
  console.log(userid, roleid, token);

  useEffect(() => {});
  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.container}>
          {/* Left - Logo + Title */}
          <div className={styles.logoSection}>
            <img src={ITELLogo} className={styles.logoIcon} alt="ITEL Logo" />
            <div>
              <h1 className={styles.title}>ITEL Incubation Portal</h1>
              <p className={styles.subtitle}>Startup Management Dashboard</p>
            </div>
          </div>

          {/* Right - Actions */}
          <div className={styles.actions}>
            <NavLink
              to="/Incubation/Dashboard/AddDocuments"
              style={{ textDecoration: "none" }}
            >
              <button className={styles.btnPrimary}>
                <FolderDown className={styles.icon} />
                Document Management
              </button>
            </NavLink>

            {/* <button
              className={styles.btnPrimary}
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className={styles.icon} />
              Add Incubatee
            </button> */}

            <button
              className={styles.btnPrimary}
              onClick={handleLogout}
              style={{ color: "#fff", background: "#0ca678" }}
            >
              <LogOut className={styles.icon} />
              Logout
            </button>

            <div>
              <button
                className={styles.btnPrimary}
                // onClick={() => setIsModalOpen(true)}
              >
                <CircleUserRound className={styles.icon} />
                Incubator
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <MetricCardDashboard stats={stats} />
        <div className={styles.charts}>
          <CompanyFieldChart byField={byField} />
          <FundingStageChart byStage={byStage} />
        </div>
        <CompanyTable companyList={listOfIncubatees} />
        <br />
        <DocumentTable />
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <h2>Add New Company</h2>
              <button
                className={styles.closeButton}
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form */}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                <label>
                  Company Name
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Founder
                  <input
                    type="text"
                    name="founder"
                    value={formData.founder}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Date of Incorporation
                  <input
                    type="date"
                    name="incorporationDate"
                    value={formData.incorporationDate}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Mobile
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Email
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Website
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    required
                  />
                </label>

                {/* Address Fields */}
                <label>
                  Address Line 1
                  <input
                    type="text"
                    name="address1"
                    value={formData.address1}
                    onChange={handleChange}
                    placeholder="House no., Street, etc."
                  />
                </label>

                <label>
                  Address Line 2
                  <input
                    type="text"
                    name="address2"
                    value={formData.address2}
                    onChange={handleChange}
                    placeholder="Apartment, landmark (optional)"
                  />
                </label>

                <label>
                  City
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  State / Province
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  Country
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                  >
                    <option value="">Select your country</option>
                    <option value="india">India</option>
                    <option value="usa">United States</option>
                    <option value="uk">United Kingdom</option>
                    <option value="australia">Australia</option>
                  </select>
                </label>

                <label>
                  Pincode / Zip Code
                  <input
                    type="text"
                    name="zipcode"
                    value={formData.zipcode}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  Phone Number
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </label>

                {/* Example extra fields */}
                <label>
                  Industry
                  <input
                    type="text"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  Number of Employees
                  <input
                    type="number"
                    name="employees"
                    value={formData.employees}
                    onChange={handleChange}
                  />
                </label>
              </div>

              {/* Footer buttons */}
              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
