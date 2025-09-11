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

const fundingData = [
  { stage: "Pre-Series", companies: 18, totalFunding: 2.5, avgFunding: 0.17 },
  { stage: "Series A", companies: 9, totalFunding: 12.0, avgFunding: 1.5 },
  { stage: "Series B", companies: 7, totalFunding: 25.0, avgFunding: 5.0 },
];

const FundingStageChart = () => {
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
              <div className={styles.statSub}>₹{stage.totalFunding}M Total</div>
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
                formatter={(value, name) => [
                  name === "companies" ? `${value} companies` : `$${value}M`,
                  name === "companies" ? "Companies" : "Avg Funding",
                ]}
              />
              <Bar
                dataKey="companies"
                fill="#3b82f6" /* blue-500 */
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default FundingStageChart;
