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
    roleid,
    setCompanyDoc,
  } = useContext(DataContext);

  const [tempFromYear, setTempFromYear] = useState(fromYear);
  const [tempToYear, setTempToYear] = useState(toYear);

  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // You can make this configurable

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

  // Pagination calculations
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredData.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, stageFilter, statusFilter, itemsPerPage]);

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
        userId: Number(roleid) === 1 ? "ALL" : userid,
        startYear: tempFromYear,
        endYear: tempToYear,
      });
      setCompanyDoc(res.data.data);
      setCurrentPage(1); // Reset to first page when year changes
      console.log(res.data.data);
    } catch (err) {
      console.error("Error fetching documents by year:", err);
    }
  };

  // Page navigation functions
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first pages, current page, and last pages
      if (currentPage <= 3) {
        // Near the beginning
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2>Document Submissions</h2>
        {/* <button className={styles.button}>Export</button> */}
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

        {/* Items per page selector */}
        <select
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
          className={styles.select}
        >
          <option value="5">5 per page</option>
          <option value="10">10 per page</option>
          <option value="20">20 per page</option>
          <option value="50">50 per page</option>
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
              {Number(roleid) === 1 ? <th>Stage</th> : ""}

              <th>Submission Date</th>
              <th>Due Date</th>
              <th>Status</th>
              {/* <th className={styles.textRight}>Actions</th> */}
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, idx) => {
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
                  {Number(roleid) === 1 ? (
                    <td>
                      <span
                        className={`${styles.badge} ${
                          styles[item.incubateesstagelevel]
                        }`}
                      >
                        {getStageName(item.incubateesstagelevel)}
                      </span>
                    </td>
                  ) : (
                    ""
                  )}
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
                  {/* <td className={styles.textRight}>
                    <NavLink to={`/startup/Dashboard/${item.incubateesname}`}>
                      <button className={styles.buttonSmall}>View</button>
                    </NavLink>
                  </td> */}
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

      {/* Pagination Controls */}
      {filteredData.length > 0 && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of{" "}
            {totalItems} entries
          </div>

          <div className={styles.paginationControls}>
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className={`${styles.pageButton} ${
                currentPage === 1 ? styles.disabled : ""
              }`}
            >
              Previous
            </button>

            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() =>
                  typeof page === "number" ? goToPage(page) : null
                }
                className={`${styles.pageButton} ${
                  page === currentPage ? styles.active : ""
                } ${typeof page !== "number" ? styles.ellipsis : ""}`}
                disabled={typeof page !== "number"}
              >
                {page}
              </button>
            ))}

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`${styles.pageButton} ${
                currentPage === totalPages ? styles.disabled : ""
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
