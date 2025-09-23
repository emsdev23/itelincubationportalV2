// DocumentTable.jsx
import React, { useState, useContext, useEffect } from "react";
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
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Loading state for year filter
  const [yearLoading, setYearLoading] = useState(false);

  // Reset to first page when filters change - MOVED BEFORE EARLY RETURN
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, stageFilter, statusFilter, itemsPerPage]);

  // Early return AFTER all hooks are defined
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

  // Fixed fetchDocumentsByYear function with proper error handling
  const fetchDocumentsByYear = async () => {
    setYearLoading(true);
    try {
      const response = await api.post("/generic/getcollecteddocsdash", {
        userId: Number(roleid) === 1 ? "ALL" : userid,
        startYear: tempFromYear,
        endYear: tempToYear,
      });

      console.log("Full response:", response);

      // Handle different response structures
      let responseData;
      if (response.data && Array.isArray(response.data)) {
        // Direct array in data
        responseData = response.data;
      } else if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        // Nested data structure
        responseData = response.data.data;
      } else if (
        response.data &&
        response.data.result &&
        Array.isArray(response.data.result)
      ) {
        // Alternative structure
        responseData = response.data.result;
      } else {
        // Fallback
        console.warn("Unexpected response structure:", response);
        responseData = [];
      }

      setCompanyDoc(responseData);
      setCurrentPage(1); // Reset to first page when year changes
      setFromYear(tempFromYear);
      setToYear(tempToYear);

      console.log("Processed data:", responseData);
    } catch (err) {
      console.error("Error fetching documents by year:", err);

      // More detailed error logging
      if (err.response) {
        console.error("Error response:", err.response);
        console.error("Error status:", err.response.status);
        console.error("Error data:", err.response.data);
      }

      // Set empty array on error to prevent crashes
      setCompanyDoc([]);

      // You might want to show a user-friendly error message here
      alert(
        `Error fetching documents: ${err.message || "Unknown error occurred"}`
      );
    } finally {
      setYearLoading(false);
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
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
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
          onClick={fetchDocumentsByYear}
          disabled={yearLoading}
        >
          {yearLoading ? "Loading..." : "Apply"}
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

      {/* Results info */}
      {filteredData.length > 0 && (
        <div className={styles.resultsInfo}>
          Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of{" "}
          {totalItems} entries
        </div>
      )}

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Company</th>
              <th>Document Category</th>
              <th>Document Subcategory</th>
              <th>Document Name</th>
              {Number(roleid) === 1 ? <th>Stage</th> : null}
              <th>Submission Date</th>
              <th>Due Date</th>
              <th>Status</th>
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
                  ) : null}
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
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredData.length === 0 && !yearLoading && (
          <div className={styles.noData}>
            No documents found matching your criteria.
          </div>
        )}

        {yearLoading && (
          <div className={styles.noData}>Loading documents...</div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
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
            <React.Fragment key={index}>
              {page === "..." ? (
                <span className={styles.ellipsis}>...</span>
              ) : (
                <button
                  onClick={() => goToPage(page)}
                  className={`${styles.pageButton} ${
                    page === currentPage ? styles.active : ""
                  }`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
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
      )}
    </div>
  );
}
