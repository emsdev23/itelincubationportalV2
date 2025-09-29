import React from "react";
import styles from "./MetricCardDashboard.module.css"; // ⬅️ import the CSS module
import MetricCard from "./MetricCard";
import {
  Building2,
  DollarSign,
  Users,
  TrendingUp,
  IndianRupee,
} from "lucide-react";

const MetricCardDashboard = ({ stats }) => {
  const {
    total_founders = 0,
    total_incubatees = 0,
    total_share = 0,
  } = stats || {};

  if (!stats) return <p>Loading...</p>;
  return (
    <main className={styles.dashboardMain}>
      {/* Key Metrics */}
      <div className={styles.metricsGrid}>
        <MetricCard
          title="Total Incubatees"
          value={total_incubatees}
          subtitle="Active startups in portfolio"
          icon={<Building2 size={20} />}
          variant="primary"
          trend={{ value: 12, isPositive: true }}
        />

        {/* <MetricCard
          title="Total Networth"
          value={`₹${total_share} CR`}
          subtitle="Combined valuation"
          icon={<IndianRupee size={20} />}
          variant="success"
          trend={{ value: 8.5, isPositive: true }}
        /> */}

        <MetricCard
          title="Total Founders"
          value={total_incubatees}
          subtitle="Registered entrepreneurs"
          icon={<Users size={20} />}
          variant="default"
          trend={{ value: 5, isPositive: true }}
        />

        <MetricCard
          title="Overdue Documents"
          value="0"
          subtitle="Require immediate attention"
          icon={<TrendingUp size={20} />}
          variant="warning"
          trend={{ value: 2, isPositive: false }}
        />
      </div>
    </main>
  );
};

export default MetricCardDashboard;
