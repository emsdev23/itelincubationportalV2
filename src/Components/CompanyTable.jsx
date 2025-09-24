// CompanyTable.jsx
import React, { useState, useContext, useEffect } from "react";
import styles from "./CompanyTable.module.css";
import { NavLink, useNavigate } from "react-router-dom";
import { DataContext } from "../Components/Datafetching/DataProvider";

export default function CompanyTable({ companyList = [] }) {
  const navigate = useNavigate();

  const { roleid } = useContext(DataContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // ✅ Deduplicate list by recid
  const uniqueCompanies = Array.from(
    new Map(
      (companyList || []).map((item) => [item.incubateesrecid, item])
    ).values()
  );

  // ✅ Filtered data safely
  const filteredData = uniqueCompanies.filter((item) => {
    const matchesSearch =
      (item.incubateesname || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (item.incubateesfieldofworkname || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStage =
      stageFilter === "all" ||
      (item.incubateesstagelevel &&
        item.incubateesstagelevel === Number(stageFilter));

    return matchesSearch && matchesStage;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, stageFilter]);

  // Generate page numbers for pagination
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
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2>Incubatees</h2>
      </div>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search companies or fields..."
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
          <option value="1">Pre Seed</option>
          <option value="2">Seed Stage</option>
          <option value="3">Early Stage</option>
          <option value="4">Growth Stage</option>
          <option value="5">Expansion Stage</option>
        </select>

        <select
          value={itemsPerPage}
          onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
          className={styles.select}
        >
          <option value="5">5 per page</option>
          <option value="10">10 per page</option>
          <option value="25">25 per page</option>
          <option value="50">50 per page</option>
        </select>
      </div>

      {/* Results info */}
      <div className={styles.resultsInfo}>
        Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of{" "}
        {filteredData.length} entries
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Company</th>
              <th>Field of Work</th>
              <th>Stage</th>
              <th>Date of Incorporation</th>
              <th>Date of Incubation</th>
              {/* <th className={styles.textRight}>Actions</th> */}
            </tr>
          </thead>
          <tbody>
            {currentData.map((item) => (
              <tr key={item.incubateesrecid}>
                <td>{item.incubateesname}</td>
                <td>{item.incubateesfieldofworkname}</td>
                <td>
                  <span
                    className={`${styles.badge} ${
                      styles[item.incubateesstagelevel]
                    }`}
                  >
                    {item.incubateesstagelevelname || "—"}
                  </span>
                </td>
                <td>
                  {item.incubateesdateofincorporation
                    ? new Date(
                        item.incubateesdateofincorporation
                      ).toLocaleDateString()
                    : "-"}
                </td>
                <td>
                  {item.incubateesdateofincubation
                    ? new Date(
                        item.incubateesdateofincubation
                      ).toLocaleDateString()
                    : "-"}
                </td>
                {Number(roleid) === 1 && (
                  <td>
                    <button
                      className={styles.buttonPrimary}
                      onClick={() =>
                        navigate(
                          `/startup/Dashboard/${
                            item.usersrecid
                          }?founder=${encodeURIComponent(item.incubateesname)}`
                        )
                      }
                    >
                      View Startup Dashboard
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {filteredData.length === 0 && (
          <div className={styles.noData}>
            No companies found matching your criteria.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={`${styles.paginationBtn} ${
              currentPage === 1 ? styles.disabled : ""
            }`}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === "..." ? (
                <span className={styles.ellipsis}>...</span>
              ) : (
                <button
                  className={`${styles.paginationBtn} ${styles.pageNumber} ${
                    currentPage === page ? styles.active : ""
                  }`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}

          <button
            className={`${styles.paginationBtn} ${
              currentPage === totalPages ? styles.disabled : ""
            }`}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
