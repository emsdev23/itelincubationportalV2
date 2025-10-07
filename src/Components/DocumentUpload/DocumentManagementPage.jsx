import React from "react";
import DocCatTable from "./DocCatTable"; // Document Categories table
import DocSubCatTable from "./DocSubCatTable"; // Document Subcategories table
import DocumentsTable from "./DocumentsTable"; // Documents table
import "./DocumentManagementPage.css"; // page-specific CSS
import styles from "../Navbar.module.css"; // CSS module for scoped styles
import ITELLogo from "../../assets/ITEL_Logo.png"; // Logo image
import { NavLink } from "react-router-dom";
import { FolderDown, MoveLeft } from "lucide-react"; // Icon for the button

export default function DocumentManagementPage() {
  return (
    <div className="doc-management-page">
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
              to="/Incubation/Dashboard/"
              style={{ textDecoration: "none" }}
            >
              <button className={styles.btnPrimary}>
                <MoveLeft className={styles.icon} />
                Back To Portal
              </button>
            </NavLink>
          </div>
        </div>
      </header>
      <main className="doc-management-main">
        <h1>Document Management</h1>

        {/* Document Categories Table */}
        <section className="doccat-section">
          <DocCatTable />
        </section>

        {/* Document Subcategories Table */}
        <section className="docsubcat-section" style={{ marginTop: "40px" }}>
          <DocSubCatTable />
        </section>

        {/* Documents Table */}
        <section className="documents-section" style={{ marginTop: "40px" }}>
          <DocumentsTable />
        </section>
      </main>
    </div>
  );
}