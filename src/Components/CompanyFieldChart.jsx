import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import styles from "./CompanyFieldChart.module.css";

const data = [
  { name: "Medical", value: 35, count: 12 },
  { name: "Embedded", value: 25, count: 8 },
  { name: "Research", value: 20, count: 7 },
  { name: "FinTech", value: 15, count: 5 },
  { name: "EdTech", value: 5, count: 2 },
];

const COLORS = ["#3b82f6", "#0ea5e9", "#8b5cf6", "#22c55e", "#f97316"];

const CompanyFieldChart = () => {
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
                label={({ name, value }) => `${name}: ${value}%`}
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
