import React, { useState } from "react";
import styles from "./Navbar.module.css";
import { Plus, X } from "lucide-react";
import ITELLogo from "../assets/ITEL_Logo.png";
import MetricCardDashboard from "./MetricCardDashboard";
import CompanyFieldChart from "./CompanyFieldChart";
import FundingStageChart from "./FundingStageChart";
import DocumentTable from "./DocumentTable";

const Navbar = () => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("New Startup:", formData);
    // TODO: send data to backend
    setIsModalOpen(false);
    setFormData({ name: "", founder: "", incorporationDate: "", website: "" });
  };

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
            <button
              className={styles.btnPrimary}
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className={styles.icon} />
              Add Startup
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <MetricCardDashboard />
        <div className={styles.charts}>
          <CompanyFieldChart />
          <FundingStageChart />
        </div>
        <DocumentTable />
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Add New Company</h2>
              <button
                className={styles.closeButton}
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
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
                companyaddress
                <input
                  type="text"
                  name="founder"
                  value={formData.founder}
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

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.btnOutline}
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
