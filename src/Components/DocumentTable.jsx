import React, { useState } from "react";
import styles from "./DocumentTable.module.css";
import { Link, NavLink } from "react-router-dom";

const mockData = [
  {
    id: "1",
    companyName: "MedTech Solutions",
    documentType: "Business Plan",
    submissionDate: "2024-01-15",
    dueDate: "2024-01-20",
    status: "submitted",
    founder: "Dr. Sarah Johnson",
    stage: "seed-a",
  },
  {
    id: "2",
    companyName: "EmbeddedAI",
    documentType: "Financial Report Q4",
    submissionDate: "-",
    dueDate: "2024-01-18",
    status: "overdue",
    founder: "Alex Chen",
    stage: "pre-seed",
  },
  {
    id: "3",
    companyName: "ResearchBot",
    documentType: "Compliance Certificate",
    submissionDate: "-",
    dueDate: "2024-01-25",
    status: "pending",
    founder: "Prof. Maria Garcia",
    stage: "seed-b",
  },
  {
    id: "4",
    companyName: "FinFlow",
    documentType: "IP Documentation",
    submissionDate: "2024-01-10",
    dueDate: "2024-01-15",
    status: "approved",
    founder: "James Wilson",
    stage: "seed-a",
  },
  {
    id: "5",
    companyName: "EduInnovate",
    documentType: "Legal Compliance",
    submissionDate: "-",
    dueDate: "2024-01-22",
    status: "pending",
    founder: "Lisa Zhang",
    stage: "pre-seed",
  },
];

export default function DocumentTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");

  const filteredData = mockData.filter((item) => {
    const matchesSearch =
      item.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.founder.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.documentType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    const matchesStage = stageFilter === "all" || item.stage === stageFilter;

    return matchesSearch && matchesStatus && matchesStage;
  });

  const isOverdue = (dueDate, status) => {
    if (status === "submitted" || status === "approved") return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2>Document Submissions</h2>
        <button className={styles.button}>Export</button>
      </div>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search companies, founders, or documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.input}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={styles.select}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="submitted">Submitted</option>
          <option value="overdue">Overdue</option>
          <option value="approved">Approved</option>
        </select>

        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className={styles.select}
        >
          <option value="all">All Stages</option>
          <option value="pre-seed">Pre-Seed</option>
          <option value="seed-a">Seed A</option>
          <option value="seed-b">Seed B</option>
        </select>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Company</th>
              <th>Document Type</th>
              <th>Founder</th>
              <th>Stage</th>
              <th>Submission Date</th>
              <th>Due Date</th>
              <th>Status</th>
              <th className={styles.textRight}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr
                key={item.id}
                className={
                  isOverdue(item.dueDate, item.status) ? styles.overdueRow : ""
                }
              >
                <td>{item.companyName}</td>
                <td>{item.documentType}</td>
                <td>{item.founder}</td>
                <td>
                  <span className={`${styles.badge} ${styles[item.stage]}`}>
                    {item.stage.toUpperCase()}
                  </span>
                </td>
                <td>
                  {item.submissionDate === "-"
                    ? "Not submitted"
                    : new Date(item.submissionDate).toLocaleDateString()}
                </td>
                <td
                  className={
                    isOverdue(item.dueDate, item.status)
                      ? styles.dueOverdue
                      : ""
                  }
                >
                  {new Date(item.dueDate).toLocaleDateString()}
                </td>
                <td>
                  <span className={`${styles.badge} ${styles[item.status]}`}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </td>
                <td className={styles.textRight}>
                  <NavLink to="./startup/Dashboard">
                    {/* NavLink */}
                    <button className={styles.buttonSmall}>View</button>
                  </NavLink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredData.length === 0 && (
          <div className={styles.noData}>
            No documents found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
