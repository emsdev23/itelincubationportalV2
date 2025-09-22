// DocumentTable.jsx
import React, { useState, useContext } from "react";
import styles from "./DocumentTable.module.css";
import { NavLink } from "react-router-dom";
import { DataContext } from "../Components/Datafetching/DataProvider";
import api from "./Datafetching/api";

export default function DocumentTable() {
  const {
    companyDoc,
    loading,
    fromYear,
    toYear,
    setFromYear,
    setToYear,
    userid,
    setCompanyDoc,
  } = useContext(DataContext);

  const [tempFromYear, setTempFromYear] = useState(fromYear);
  const [tempToYear, setTempToYear] = useState(toYear);

  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  if (loading) return <p>Loading documents...</p>;

  // Helper to format dates
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d)) return "-";
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Filtering logic
  const filteredData = (companyDoc || []).filter((item) => {
    const statusNormalized = (item.status || "").toLowerCase();

    const matchesSearch =
      (item.incubateesname || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (item.documentname || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (item.doccatname || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStage =
      stageFilter === "all" ||
      (item.incubateesstagelevel &&
        item.incubateesstagelevel === Number(stageFilter));

    const matchesStatus =
      statusFilter === "all" || statusNormalized === statusFilter;

    return matchesSearch && matchesStage && matchesStatus;
  });

  // Stage name mapping
  const getStageName = (level) => {
    switch (level) {
      case 1:
        return "Pre-Seed";
      case 2:
        return "Seed";
      case 3:
        return "Early Stage";
      case 4:
        return "Growth Stage";
      case 5:
        return "Expansion Stage";
      default:
        return "";
    }
  };

  const fetchDocumentsByYear = async () => {
    try {
      const res = await api.post("/generic/getcollecteddocsdash", {
        userId: "ALL",
        startYear: tempFromYear,
        endYear: tempToYear,
      });
      setCompanyDoc(res.data.data);
      console.log(res.data.data);
    } catch (err) {
      console.error("Error fetching documents by year:", err);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2>Document Submissions</h2>
        <button className={styles.button}>Export</button>
      </div>

      <div className={styles.filters}>
        <input
          type="number"
          value={tempFromYear}
          onChange={(e) => setTempFromYear(e.target.value)}
          placeholder="From Year"
          className={styles.input}
        />
        <input
          type="number"
          value={tempToYear}
          onChange={(e) => setTempToYear(e.target.value)}
          placeholder="To Year"
          className={styles.input}
        />
        <button
          className={styles.button}
          onClick={() => {
            setFromYear(tempFromYear);
            setToYear(tempToYear);
            fetchDocumentsByYear();
          }}
        >
          Apply
        </button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search companies or documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.input}
        />

        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className={styles.select}
        >
          <option value="all">All Stages</option>
          <option value="1">Pre-Seed</option>
          <option value="2">Seed</option>
          <option value="3">Early Stage</option>
          <option value="4">Growth Stage</option>
          <option value="5">Expansion Stage</option>
        </select>

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
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Company</th>
              <th>Document Category</th>
              <th>Document Subcategory</th>
              <th>Document Name</th>
              <th>Stage</th>
              <th>Submission Date</th>
              <th>Due Date</th>
              <th>Status</th>
              <th className={styles.textRight}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, idx) => {
              const statusNormalized = (item.status || "").toLowerCase();

              return (
                <tr
                  key={`${item.incubateesname}-${item.documentname}-${idx}`}
                  className={
                    statusNormalized === "overdue" ? styles.overdueRow : ""
                  }
                >
                  <td>{item.incubateesname}</td>
                  <td>{item.doccatname}</td>
                  <td>{item.docsubcatname}</td>
                  <td>{item.documentname}</td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        styles[item.incubateesstagelevel]
                      }`}
                    >
                      {getStageName(item.incubateesstagelevel)}
                    </span>
                  </td>
                  <td>
                    {item.submission_date
                      ? formatDate(item.submission_date)
                      : "Not submitted"}
                  </td>
                  <td
                    className={
                      statusNormalized === "overdue" ? styles.dueOverdue : ""
                    }
                  >
                    {formatDate(item.due_date)}
                  </td>
                  <td>
                    <span
                      className={`${styles.badge} ${styles[statusNormalized]}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className={styles.textRight}>
                    <NavLink to={`/startup/Dashboard/${item.incubateesname}`}>
                      <button className={styles.buttonSmall}>View</button>
                    </NavLink>
                  </td>
                </tr>
              );
            })}
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
