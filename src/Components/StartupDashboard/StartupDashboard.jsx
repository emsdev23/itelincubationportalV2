import { useState, useContext, useEffect } from "react";
import styles from "./StartupDashboard.module.css";
import companyLogo from "../../Images/company6.png";
import DocumentUploadModal from "./DocumentUploadModal";
import { useNavigate } from "react-router-dom";
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
  LogOut,
} from "lucide-react";
import ITELLogo from "../../assets/ITEL_Logo.png";

import { DataContext } from "../Datafetching/DataProvider";
import DocumentTable from "../DocumentTable";

const StartupDashboard = () => {
  const {
    roleid,
    listOfIncubatees,
    companyDoc,
    startupcompanyDoc,
    startupdetails,
    refreshCompanyDocuments, // Add this from context if available
  } = useContext(DataContext);

  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchparams, setsearchparams] = useSearchParams();
  const founder = searchparams.get("founder");

  const incubatee = listOfIncubatees?.[0];

  // Company details
  const incubateesname = incubatee?.incubateesname;
  const incubateesdateofincorporation =
    incubatee?.incubateesdateofincorporation;
  const incubateesdateofincubation = incubatee?.incubateesdateofincubation;
  const incubateesfieldofworkname = incubatee?.incubateesfieldofworkname;
  const incubateesstagelevelname = incubatee?.incubateesstagelevelname;
  const incubateesfoundername = incubatee?.incubateesfoundername;
  const incubateesrecid = incubatee?.incubateesrecid;
  const usersrecid = incubatee?.usersrecid;

  // Local state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localCompanyDoc, setLocalCompanyDoc] = useState(companyDoc || []);
  const [refreshKey, setRefreshKey] = useState(0);

  // Update local state when context data changes
  useEffect(() => {
    setLocalCompanyDoc(companyDoc || []);
  }, [companyDoc]);

  const convertData = (dateStr) => {
    const dateObj = new Date(dateStr);
    const formatted = dateObj.toLocaleDateString("en-GB");
    return formatted;
  };

  // Manual refresh function to fetch company documents
  const fetchCompanyDocuments = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const userid = sessionStorage.getItem("userid");

      // Replace with your actual API endpoint for fetching company documents
      const response = await fetch(
        "http://121.242.232.212:8086/itelinc/resources/generic/getcompanydocs", // Update this URL
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userid: userid,
            incubateesrecid: incubateesrecid,
            // Add other required parameters based on your API
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.statusCode === 200) {
        setLocalCompanyDoc(data.data);
      }
    } catch (error) {
      console.error("Error fetching company documents:", error);
    }
  };

  // Handle document upload success
  const handleDocumentUpload = async () => {
    try {
      // Option 1: Use context refresh function if available
      if (refreshCompanyDocuments) {
        await refreshCompanyDocuments();
      } else {
        // Option 2: Manually fetch updated documents
        await fetchCompanyDocuments();
      }
    } catch (error) {
      console.error("Error refreshing documents:", error);
      // Fallback: reload page if API calls fail
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  // Documents state (this seems to be dummy data, using actual data from API)
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

  // Calculate stats based on actual API data (localCompanyDoc)
  const totalDocuments = localCompanyDoc.length || documents.length;
  const submittedDocuments =
    localCompanyDoc.filter((d) => d.status === "Submitted").length ||
    documents.filter((d) => d.status === "approved").length;
  const pendingDocuments =
    localCompanyDoc.filter((d) => d.status === "pending").length ||
    documents.filter((d) => d.status === "pending").length;
  const overdueDocuments =
    localCompanyDoc.filter((d) => d.status === "Overdue").length ||
    documents.filter((d) => d.status === "overdue").length;
  const completionRate = (submittedDocuments / totalDocuments) * 100 || 0;

  const getStatusBadge = (status) => {
    switch (status) {
      case "Submitted":
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
      case "Overdue":
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
      case "Submitted":
        return <CheckCircle className={styles.iconApproved} />;
      case "pending":
        return <Clock className={styles.iconPending} />;
      case "Overdue":
        return <AlertCircle className={styles.iconOverdue} />;
      default:
        return <FileText className={styles.iconDefault} />;
    }
  };

  const handleViewDocument = async (filepath) => {
    try {
      const token = sessionStorage.getItem("token");
      const userid = sessionStorage.getItem("userid");

      const response = await fetch(
        "http://121.242.232.212:8086/itelinc/resources/generic/getfileurl",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userid: userid,
            url: filepath,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.statusCode === 200 && data.data) {
        window.open(data.data, "_blank");
      }
    } catch (error) {
      console.error("Error fetching file:", error);
      alert("Error loading file: " + error.message);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("userid");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("roleid");
    navigate("/", { replace: true });
  };

  return (
    <div>
      {/* Navigation bar */}
      <header className={style.header}>
        <div className={style.container}>
          <div className={style.logoSection}>
            <img src={ITELLogo} className={style.logoIcon} alt="ITEL Logo" />
            <div>
              <h1 className={style.title}>ITEL Incubation Portal</h1>
              <p className={style.subtitle}>Startup Management Dashboard</p>
            </div>
          </div>

          <div className={style.actions}>
            <button className={style.btnPrimary} onClick={handleLogout}>
              <LogOut className={style.icon} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Startup dashboard */}
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.headerCard}>
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
              </div>
              <div>
                <div className={styles.headerBadges}>
                  <div className={styles.headerBadge}>
                    <Users className="h-4 w-4" /> Founded by:{" "}
                    {incubateesfoundername}
                  </div>
                  <div className={styles.headerBadge}>
                    <Calendar className="h-4 w-4" /> Date of Incorporation:
                    {incubateesdateofincorporation &&
                      convertData(incubateesdateofincorporation)}
                  </div>
                  <div className={styles.headerBadge}>
                    <Calendar className="h-4 w-4" /> Date of Incubation:
                    {incubateesdateofincubation &&
                      convertData(incubateesdateofincubation)}
                  </div>
                  <div className={styles.headerBadge}>
                    <TrendingUp className="h-4 w-4" />{" "}
                    {incubateesstagelevelname} Funding
                  </div>
                  <div className={styles.headerBadge}>
                    Field Of Work: {incubateesfieldofworkname}
                  </div>
                </div>
              </div>
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
                data-tooltip="Documents that have been submitted in the portal"
              >
                <CheckCircle className={styles.iconApproved} />
              </div>
            </div>
            <div className={styles.cardContent}>{submittedDocuments}</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Pending</div>
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
            <h2 className="text-xl font-bold mb-2">Document Update Progress</h2>
            {Number(roleid) !== 1 && (
              <button
                className={styles.buttonPrimary}
                onClick={() => setIsModalOpen(true)}
              >
                <Upload className="h-4 w-4 mr-2" /> Add Document
              </button>
            )}
          </div>

          <p className="text-gray-600 mb-2">
            Complete your document updates by submitting all required documents
          </p>

          <br />
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
              <div>{submittedDocuments} Submitted</div>
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
          <table>
            <thead>
              <tr className="bg-gray-200">
                <th>Document Category</th>
                <th>Document SubCategory</th>
                <th>Status</th>
                <th>Upload Date</th>
                <th>Due Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {localCompanyDoc.map((doc, index) => (
                <tr
                  key={`${doc.incubateesname}-${doc.doccatname}-${doc.docsubcatname}-${index}`}
                  className={styles.tableRow}
                >
                  <td className="flex items-center gap-2">
                    {getStatusIcon(doc.status)} {doc.doccatname}
                  </td>
                  <td className="flex items-center gap-2">
                    {doc.docsubcatname}
                  </td>
                  <td>{getStatusBadge(doc.status)}</td>
                  <td>
                    {doc.submission_date ? (
                      new Date(doc.submission_date).toLocaleDateString()
                    ) : (
                      <em>Not uploaded</em>
                    )}
                  </td>
                  <td>
                    {doc.due_date
                      ? new Date(
                          doc.due_date.replace("Z", "")
                        ).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="text-right">
                    {doc.filepath && doc.status === "Submitted" ? (
                      <button
                        className={styles.buttonPrimary}
                        onClick={() => handleViewDocument(doc.filepath)}
                      >
                        View Doc
                      </button>
                    ) : (
                      <button
                        className={styles.buttonPrimary}
                        onClick={() => handleViewDocument(doc.filepath)}
                        disabled={!doc.filepath}
                      >
                        {doc.filepath ? "View Doc" : "No File"}
                      </button>
                    )}
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
            incubateesrecid={incubateesrecid}
            usersrecid={usersrecid}
            onUploadSuccess={handleDocumentUpload}
          />
        )}
      </div>
    </div>
  );
};

export default StartupDashboard;
