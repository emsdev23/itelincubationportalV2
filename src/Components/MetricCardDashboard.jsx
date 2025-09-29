import React, { useContext } from "react";
import styles from "./MetricCardDashboard.module.css"; // CSS module
import MetricCard from "./MetricCard";
import { DataContext } from "../Components/Datafetching/DataProvider";

import { Building2, Users, TrendingUp } from "lucide-react";

const MetricCardDashboard = ({ stats }) => {
  const { companyDoc } = useContext(DataContext);

  const {
    total_founders = 0,
    total_incubatees = 0,
    total_share = 0,
  } = stats || {};

  if (!stats) return <p>Loading...</p>;

  // ✅ Count overdue documents
  const overdueDocuments =
    companyDoc?.filter((doc) => doc.status === "Overdue").length || 0;

  console.log(total_founders, total_incubatees, overdueDocuments);
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

        <MetricCard
          title="Total Founders"
          value={total_founders}
          subtitle="Registered entrepreneurs"
          icon={<Users size={20} />}
          variant="default"
          trend={{ value: 5, isPositive: true }}
        />

        <MetricCard
          title="Overdue Documents"
          value={overdueDocuments}
          subtitle="Require immediate attention"
          icon={<TrendingUp size={20} />}
          variant="warning"
          trend={{ value: overdueDocuments, isPositive: false }}
        />
      </div>
    </main>
  );
};

export default MetricCardDashboard;
