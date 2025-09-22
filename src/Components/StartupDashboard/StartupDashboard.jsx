import { useState, useContext } from "react";
import styles from "./StartupDashboard.module.css";
import companyLogo from "../../Images/company6.png";
import DocumentUploadModal from "./DocumentUploadModal";
import {
  Link,
  NavLink,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import style from "../Navbar.module.css";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Upload,
  Calendar,
  Users,
  Building,
  TrendingUp,
  Plus,
} from "lucide-react";
import ITELLogo from "../../assets/ITEL_Logo.png";

import { DataContext } from "../Datafetching/DataProvider";
// import api from "./Datafetching/api";

const StartupDashboard = () => {
  const { roleid, listOfIncubatees, companyDoc } = useContext(DataContext);
  console.log(roleid);
  console.log(listOfIncubatees);
  console.log(companyDoc);
  const location = useLocation();

  const incubatee = listOfIncubatees?.[0]; // take first incubatee safely

  // Now use optional chaining
  const incubateesname = incubatee?.incubateesname;
  const incubateesdateofincorporation =
    incubatee?.incubateesdateofincorporation;
  const incubateesdateofincubation = incubatee?.incubateesdateofincubation;
  const incubateesfieldofworkname = incubatee?.incubateesfieldofworkname;
  const incubateesstagelevelname = incubatee?.incubateesstagelevelname;
  const { id } = useParams(); // 👈 gets the company ID from URL
  const [searchparams, setsearchparams] = useSearchParams();
  console.log(searchparams);
  const founder = searchparams.get("founder");
  // const lng = searchparams.get("lng");
  console.log(id);
  console.log(founder);
  console.log("Current path:", location.pathname);

  // Documents state
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: "Certificate of Incorporation",
      documentSubCategory: "ROC Filing",
      status: "approved",
      uploadDate: "2024-01-15",
      dueDate: "2024-02-15",
    },
    {
      id: 2,
      name: "Business Plan",
      documentSubCategory: "Financial Projections",
      status: "pending",
      uploadDate: "2024-01-20",
      dueDate: "2024-02-20",
    },
    {
      id: 3,
      name: "Financial Statements",
      documentSubCategory: "Balance Sheet",
      status: "overdue",
      uploadDate: null,
      dueDate: "2024-01-30",
    },
    {
      id: 4,
      name: "Tax Registration",
      documentSubCategory: "GST Registration",
      status: "approved",
      uploadDate: "2024-01-10",
      dueDate: "2024-02-10",
    },
    {
      id: 5,
      name: "Founder Agreements",
      documentSubCategory: "Shareholder Agreement",
      status: "pending",
      uploadDate: "2024-01-25",
      dueDate: "2024-02-25",
    },
  ]);

  // Modal state - use only one state for the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const totalDocuments = documents.length;
  const approvedDocuments = documents.filter(
    (d) => d.status === "approved"
  ).length;
  const pendingDocuments = documents.filter(
    (d) => d.status === "pending"
  ).length;
  const overdueDocuments = documents.filter(
    (d) => d.status === "overdue"
  ).length;
  const completionRate = (approvedDocuments / totalDocuments) * 100;

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <span className={`${styles.badge} ${styles.badgeApproved}`}>
            Submitted
          </span>
        );
      case "pending":
        return (
          <span className={`${styles.badge} ${styles.badgePending}`}>
            Pending
          </span>
        );
      case "overdue":
        return (
          <span className={`${styles.badge} ${styles.badgeOverdue}`}>
            Overdue
          </span>
        );
      default:
        return <span className={styles.badge}>Unknown</span>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className={styles.iconApproved} />;
      case "pending":
        return <Clock className={styles.iconPending} />;
      case "overdue":
        return <AlertCircle className={styles.iconOverdue} />;
      default:
        return <FileText className={styles.iconDefault} />;
    }
  };

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  return (
    <div>
      {/* nav bar */}
      <header className={style.header}>
        <div className={style.container}>
          {/* Left - Logo + Title */}
          <div className={style.logoSection}>
            <img src={ITELLogo} className={style.logoIcon} />
            {/* <Building2 className={styles.logoIcon} /> */}
            <div>
              <h1 className={style.title}>ITEL Incubation Portal</h1>
              <p className={style.subtitle}>Startup Management Dashboard</p>
            </div>
          </div>

          {location.pathname === "/startup/Dashboard" && <p></p>}

          {/* Right - Actions */}
          <div className={style.actions}>
            {/* <button className={`${styles.btn} ${styles.btnOutline}`}>
              <Search className={styles.icon} />
              Search
            </button>
            <button className={`${styles.btn} ${styles.btnOutline}`}>
              <Bell className={styles.icon} />
            </button>
            <button className={`${styles.btn} ${styles.btnOutline}`}>
              <Settings className={styles.icon} />
            </button> */}

            {/* <button className={style.btnPrimary}>
              <Plus className={style.icon} />
              Add Startup
            </button> */}
          </div>
        </div>
      </header>

      {/* startup dashboard */}
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.headerCard}>
          {/* <div className={styles.headerOverlay}></div> */}

          <div className={styles.headerContent}>
            <div className={styles.headerFlex}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "2rem" }}
              >
                <div className={styles.avatarWrapper}>
                  <img
                    src={companyLogo}
                    alt="Company Logo"
                    className={styles.avatarImage}
                  />
                  <div className={styles.avatarStatus}>
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">{incubateesname}</h1>
                </div>
                <div>
                  <a
                    href="https://itelfoundation.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.buttonPrimary}
                    style={{
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    <Building className="h-4 w-4 mr-2" /> View Website
                  </a>
                </div>
              </div>
              <div>
                <div className={styles.headerBadges}>
                  <div className={styles.headerBadge}>
                    <Users className="h-4 w-4" /> Founded by Sarah Johnson
                  </div>
                  <div className={styles.headerBadge}>
                    <Calendar className="h-4 w-4" /> Date of Incorporation:
                    {incubateesdateofincorporation}
                    <span
                      style={{
                        fontSize: "0.6rem",
                        border: "1px solid #74c0fc",
                        background: "#74c0fc",
                        padding: "0.3rem",
                        borderRadius: "1rem",
                        color: "#343a40",
                        fontWeight: "bold",
                      }}
                    >
                      4yrs - 5months
                    </span>
                  </div>
                  <div className={styles.headerBadge}>
                    <Calendar className="h-4 w-4" /> Date of Incubation:
                    {incubateesdateofincubation}
                    <span
                      style={{
                        fontSize: "0.6rem",
                        border: "1px solid #74c0fc",
                        background: "#74c0fc",
                        padding: "0.3rem",
                        borderRadius: "1rem",
                        color: "#343a40",
                        fontWeight: "bold",
                      }}
                    >
                      2yrs - 4months
                    </span>
                  </div>
                  <div className={styles.headerBadge}>
                    <TrendingUp className="h-4 w-4" />{" "}
                    {incubateesstagelevelname} Funding
                  </div>
                  <div className={styles.headerBadge}>
                    {/* <TrendingUp className="h-4 w-4" />  */}
                    Feild Of Work : {incubateesfieldofworkname}
                  </div>
                </div>
              </div>
              <br />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Total Documents</div>
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className={styles.cardContent}>{totalDocuments}</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Submitted</div>
              <div
                className={styles.tooltip}
                data-tooltip="Documents that have been  submitted in the portal"
              >
                <CheckCircle className={styles.iconApproved} />
              </div>
            </div>
            <div className={styles.cardContent}>{approvedDocuments}</div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Pending </div>
              <div
                className={styles.tooltip}
                data-tooltip="Monthly due Documents"
              >
                <Clock className={styles.iconPending} />
              </div>
            </div>
            <div className={styles.cardContent}>{pendingDocuments}</div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Overdue</div>

              {/* <div
              className={styles.tooltip}
              data-tooltip="Documents has  not been updated  for months"
            >
              
            </div> */}
              <AlertCircle className={styles.iconOverdue} />
            </div>
            <div className={styles.cardContent}>{overdueDocuments}</div>
          </div>
        </div>

        {/* Progress */}
        <div className={styles.card}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h2 className="text-xl font-bold mb-2">
              Document Updatation Progress
            </h2>
            {Number(roleid) !== 1 ? (
              <button
                className={styles.buttonPrimary}
                onClick={() => setIsModalOpen(true)}
              >
                <Upload className="h-4 w-4 mr-2" /> Add Document
              </button>
            ) : (
              ""
            )}
          </div>

          <p className="text-gray-600 mb-2">
            Complete your document updatation by submitting all required
            documents
          </p>
          <br />
          {/* <div className="flex justify-between mb-1">
          <span>Overall Completion</span>
          <span>{Math.round(completionRate)}%</span>
        </div> */}
          <div className={styles.progressBarContainer}>
            <div
              className={styles.progressBar}
              style={{
                width: `${completionRate}%`,
                textAlign: "center",
                color: "#fff",
                fontWeight: "bold",
              }}
            >
              {Math.round(completionRate)}%
            </div>
          </div>
          <div className={styles.progressStats}>
            <div
              className={`${styles.progressStat} ${styles.progressApproved}`}
            >
              <div className={styles.progressDot}></div>
              <div>{approvedDocuments} Submitted</div>
            </div>
            <div className={`${styles.progressStat} ${styles.progressPending}`}>
              <div className={styles.progressDot}></div>
              <div>{pendingDocuments} Pending</div>
            </div>
            <div className={`${styles.progressStat} ${styles.progressOverdue}`}>
              <div className={styles.progressDot}></div>
              <div>{overdueDocuments} Overdue</div>
            </div>
          </div>
        </div>

        {/* Documents Table */}
        <div className={styles.documentsTableFull}>
          <div className="flex justify-between mb-4">
            {/* <h2 className="text-xl font-bold">Document Management</h2> */}
            {/* <button
            className={styles.buttonPrimary}
            onClick={() => setIsModalOpen(true)}
          >
            <Upload className="h-4 w-4 mr-2" /> Add Document
          </button> */}
          </div>
          <table>
            <thead>
              <tr className="bg-gray-200">
                <th>Document Category</th>
                <th>Document SubCategory</th>
                <th>Status</th>
                <th>Upload Date</th>
                <th>Due Date</th>
                {/* <th>Actions</th> */}
                <th> </th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className={styles.tableRow}>
                  <td className="flex items-center gap-2">
                    {getStatusIcon(doc.status)} {doc.name}
                  </td>
                  <td className="flex items-center gap-2">
                    {doc.documentSubCategory}
                  </td>
                  <td>{getStatusBadge(doc.status)}</td>
                  <td>{doc.uploadDate || <em>Not uploaded</em>}</td>
                  <td>{doc.dueDate}</td>
                  <td className="text-right">
                    <button className={styles.buttonPrimary}>View Doc</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Document Modal */}
        {isModalOpen && (
          <DocumentUploadModal
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
          />
        )}
      </div>
    </div>
  );
};

export default StartupDashboard;
