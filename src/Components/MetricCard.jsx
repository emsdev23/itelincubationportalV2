import React from "react";
import styles from "./MetricCard.module.css";

const MetricCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = "default",
}) => {
  return (
    <div className={`${styles.card} ${styles[variant]}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {icon && <div className={styles.icon}>{icon}</div>}
      </div>

      <div className={styles.value}>{value}</div>

      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}

      {/* {trend && (
        <div
          className={`${styles.trend} ${
            trend.isPositive ? styles.trendPositive : styles.trendNegative
          }`}
        >
          <span>{trend.isPositive ? "▲" : "▼"}</span>
          <span className={styles.trendText}>
            {Math.abs(trend.value)}% from last month
          </span>
        </div>
      )} */}
    </div>
  );
};

export default MetricCard;
