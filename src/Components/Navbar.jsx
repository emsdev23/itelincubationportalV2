import React from "react";
import styles from "./Navbar.module.css";
import { Building2, Search, Bell, Settings, Plus } from "lucide-react";
import MetricCardDashboard from "./MetricCardDashboard";
import CompanyFieldChart from "./CompanyFieldChart";
import FundingStageChart from "./FundingStageChart";
import DocumentTable from "./DocumentTable";

const Navbar = () => {
  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.container}>
          {/* Left - Logo + Title */}
          <div className={styles.logoSection}>
            <Building2 className={styles.logoIcon} />
            <div>
              <h1 className={styles.title}>Incubation Portal</h1>
              <p className={styles.subtitle}>Startup Management Dashboard</p>
            </div>
          </div>

          {/* Right - Actions */}
          <div className={styles.actions}>
            <button className={`${styles.btn} ${styles.btnOutline}`}>
              <Search className={styles.icon} />
              Search
            </button>
            <button className={`${styles.btn} ${styles.btnOutline}`}>
              <Bell className={styles.icon} />
            </button>
            <button className={`${styles.btn} ${styles.btnOutline}`}>
              <Settings className={styles.icon} />
            </button>
            <button className={styles.btnPrimary}>
              <Plus className={styles.icon} />
              Add Startup
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Key Metrics */}
        <MetricCardDashboard />

        {/* Charts Section */}
        <div className={styles.charts}>
          <CompanyFieldChart />
          <FundingStageChart />
        </div>

        {/* Document Tracking */}
        <DocumentTable />
      </main>
    </div>
  );
};

export default Navbar;
