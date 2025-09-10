import React from "react";
import styles from "./StartupDashboard.module.css";

export default function StartupDashboard({ company }) {
  // Example company data (replace with props / API data)
  const companyData = {
    logo: "/logos/fintechx.png",
    name: "FinTechX",
    founder: "John Doe",
    registeredDate: "2024-02-15",
    fundingStage: "Seed A",
    documents: [
      {
        id: 1,
        name: "Incorporation Certificate",
        status: "Uploaded",
        uploadedDate: "2024-03-01",
      },
      { id: 2, name: "Tax Compliance", status: "Pending", uploadedDate: null },
      {
        id: 3,
        name: "Financial Report Q1",
        status: "Uploaded",
        uploadedDate: "2024-04-10",
      },
      { id: 4, name: "IP Agreement", status: "Overdue", uploadedDate: null },
    ],
  };

  const totalDocs = companyData.documents.length;
  const pendingDocs = companyData.documents.filter(
    (d) => d.status === "Pending"
  ).length;
  const overdueDocs = companyData.documents.filter(
    (d) => d.status === "Overdue"
  ).length;

  return (
    <div className={styles.container}>
      {/* Company Info Card */}
      <div className={styles.profileCard}>
        <img src={companyData.logo} alt="logo" className={styles.logo} />
        <div>
          <h2 className={styles.companyName}>{companyData.name}</h2>
          <p>
            Founder: <span>{companyData.founder}</span>
          </p>
          <p>
            Registered: <span>{companyData.registeredDate}</span>
          </p>
          <p>
            Funding Stage: <span>{companyData.fundingStage}</span>
          </p>
        </div>
      </div>

      {/* Document Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>{totalDocs}</h3>
          <p>Total Documents</p>
        </div>
        <div className={styles.statCard}>
          <h3>{pendingDocs}</h3>
          <p>Pending</p>
        </div>
        <div className={styles.statCard}>
          <h3>{overdueDocs}</h3>
          <p>Overdue</p>
        </div>
      </div>

      {/* Documents Table */}
      <div className={styles.tableCard}>
        <h3 className={styles.sectionTitle}>Company Documents</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Status</th>
              <th>Upload Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {companyData.documents.map((doc) => (
              <tr key={doc.id}>
                <td>{doc.name}</td>
                <td
                  className={
                    doc.status === "Uploaded"
                      ? styles.statusUploaded
                      : doc.status === "Pending"
                      ? styles.statusPending
                      : styles.statusOverdue
                  }
                >
                  {doc.status}
                </td>
                <td>{doc.uploadedDate || "-"}</td>
                <td>
                  {doc.status === "Pending" ? (
                    <button className={styles.uploadBtn}>Upload</button>
                  ) : (
                    <button className={styles.viewBtn}>View</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
