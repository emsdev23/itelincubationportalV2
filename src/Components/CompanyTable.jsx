// CompanyTable.jsx
import React, { useState } from "react";
import styles from "./CompanyTable.module.css";
import { NavLink } from "react-router-dom";

export default function CompanyTable({ companyList = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("all");

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
          <option value="1">Pre-Seed</option>
          <option value="2">Seed</option>
          <option value="3">Early Stage</option>
          <option value="4">Growth Stage</option>
          <option value="5">Expansion Stage</option>
        </select>
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
            {filteredData.map((item) => (
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
                {/* <td className={styles.textRight}>
                  <NavLink
                    to={`/startup/Dashboard/${item.usersrecid}`}
                    state={{ companyData: item }} // Pass company data as state
                  >
                    <button className={styles.buttonSmall}>View</button>
                  </NavLink>
                </td> */}
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
    </div>
  );
}
