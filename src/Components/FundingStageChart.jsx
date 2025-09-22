import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import styles from "./FundingStageChart.module.css";

const FundingStageChart = ({ byStage }) => {
  if (!byStage || byStage.length === 0) return <p>No data available</p>;

  // transform API response to chart-friendly format
  const fundingData = byStage.map((item) => ({
    stage: item.startupstagesname,
    companies: item.incubatees_count,
  }));

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Companies by Stage</h3>
      </div>

      <div className={styles.content}>
        <div className={styles.statsGrid}>
          {fundingData.map((stage) => (
            <div key={stage.stage} className={styles.statItem}>
              <div className={styles.statValue}>{stage.companies}</div>
              <div className={styles.statLabel}>{stage.stage}</div>
            </div>
          ))}
        </div>

        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fundingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="stage" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value, name) => [`${value} companies`, "Companies"]}
              />
              <Bar dataKey="companies" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default FundingStageChart;
