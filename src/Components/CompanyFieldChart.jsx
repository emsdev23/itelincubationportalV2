import React, { useContext } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import styles from "./CompanyFieldChart.module.css";
import { DataContext } from "../Components/Datafetching/DataProvider";

const COLORS = [
  "#3b82f6",
  "#0ea5e9",
  "#8b5cf6",
  "#22c55e",
  "#f97316",
  "#ef4444",
  "#14b8a6",
  "#a855f7",
  "#facc15",
  "#84cc16",
  "#f87171",
  "#10b981",
  "#6366f1", // extra colors for 13 items
];

const CompanyFieldChart = ({ byField }) => {
  if (!byField || byField.length === 0) return <p>No data available</p>;

  // transform API response into recharts format
  const total = byField.reduce((sum, item) => sum + item.incubatees_count, 0);

  const data = byField.map((item) => ({
    name: item.fieldofworkname,
    value: parseFloat(((item.incubatees_count / total) * 100).toFixed(1)),
    count: item.incubatees_count,
  }));

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Companies by Field</h3>
      </div>
      <div className={styles.content}>
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ value }) => `${value}%`}
                outerRadius={80}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, props) => [
                  `${props.payload.count} companies (${value}%)`,
                  name,
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CompanyFieldChart;
