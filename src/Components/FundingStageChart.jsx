import React from "react";
import ReactApexChart from "react-apexcharts";
import styles from "./FundingStageChart.module.css";

const FundingStageChart = ({ byStage }) => {
  if (!byStage || byStage.length === 0) return <p>No data available</p>;

  // ✅ prepare data
  const categories = byStage.map((item) => item.startupstagesname);
  const data = byStage.map((item) => item.incubatees_count);

  const options = {
    chart: {
      type: "bar",
      toolbar: { show: true }, // ✅ CSV/PNG/SVG export
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "50%",
      },
    },
    colors: ["#3b82f6"],
    dataLabels: { enabled: false },
    xaxis: {
      categories,
      labels: { style: { fontSize: "12px", colors: "#6b7280" } },
    },
    yaxis: {
      labels: { style: { fontSize: "12px", colors: "#6b7280" } },
    },
    tooltip: {
      y: { formatter: (val) => `${val} companies` },
    },
    grid: {
      borderColor: "#e5e7eb",
      strokeDashArray: 3,
    },
    legend: { show: false },
  };

  const series = [{ name: "Companies", data }];

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Companies by Stage</h3>
      </div>
      <div className={styles.content}>
        <div className={styles.statsGrid}>
          {byStage.map((stage) => (
            <div key={stage.startupstagesname} className={styles.statItem}>
              <div className={styles.statValue}>{stage.incubatees_count}</div>
              <div className={styles.statLabel}>{stage.startupstagesname}</div>
            </div>
          ))}
        </div>
        <div className={styles.chartWrapper}>
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height="100%" // ✅ respects .chartWrapper { height:200px }
            width="100%"
          />
        </div>
      </div>
    </div>
  );
};

export default FundingStageChart;
