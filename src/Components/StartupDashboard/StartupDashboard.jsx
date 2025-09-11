import { useState } from "react";
import styles from "./StartupDashboard.module.css";
import companyLogo from "../../Images/FarmlandLogo.png";
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
} from "lucide-react";

const StartupDashboard = () => {
  // Documents state
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: "Certificate of Incorporation",
      status: "approved",
      uploadDate: "2024-01-15",
      dueDate: "2024-02-15",
    },
    {
      id: 2,
      name: "Business Plan",
      status: "pending",
      uploadDate: "2024-01-20",
      dueDate: "2024-02-20",
    },
    {
      id: 3,
      name: "Financial Statements",
      status: "overdue",
      uploadDate: null,
      dueDate: "2024-01-30",
    },
    {
      id: 4,
      name: "Tax Registration",
      status: "approved",
      uploadDate: "2024-01-10",
      dueDate: "2024-02-10",
    },
    {
      id: 5,
      name: "Founder Agreements",
      status: "pending",
      uploadDate: "2024-01-25",
      dueDate: "2024-02-25",
    },
  ]);

  // Modal states
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
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerCard}>
        <div className={styles.headerOverlay}></div>
        <div className={styles.headerContent}>
          <div className={styles.headerFlex}>
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
              <h1 className="text-4xl font-bold mb-2">Farmland Industries</h1>
              <div className={styles.headerBadges}>
                <div className={styles.headerBadge}>
                  <Users className="h-4 w-4" /> Founded by Sarah Johnson
                </div>
                <div className={styles.headerBadge}>
                  <Calendar className="h-4 w-4" /> Date of Incorporation:Jan 15,
                  2020
                  <span
                    style={{
                      fontSize: "0.6rem",
                      border: "1px solid #e03131",
                      background: "#e03131",
                      padding: "0.3rem",
                      borderRadius: "1rem",
                      color: "#fff",
                    }}
                  >
                    4yrs - 5months
                  </span>
                </div>
                <div className={styles.headerBadge}>
                  <Calendar className="h-4 w-4" /> Date of Incubation:Jan 15,
                  2022{" "}
                  <span
                    style={{
                      fontSize: "0.6rem",
                      border: "1px solid #e03131",
                      background: "#e03131",
                      padding: "0.3rem",
                      borderRadius: "1rem",
                      color: "#fff",
                    }}
                  >
                    2yrs - 4months
                  </span>
                </div>
                <div className={styles.headerBadge}>
                  <TrendingUp className="h-4 w-4" /> Series A Funding
                </div>
              </div>
            </div>
            <br />
          </div>
        </div>
        <div className="ml-auto">
          <button className={styles.buttonPrimary}>
            <Building className="h-4 w-4 mr-2" /> View Company Profile
          </button>
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
          <button
            className={styles.buttonPrimary}
            onClick={() => setIsModalOpen(true)}
          >
            <Upload className="h-4 w-4 mr-2" /> Add Document
          </button>
        </div>

        <p className="text-gray-600 mb-2">
          Complete your document updatation by submitting all required documents
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
          <div className={`${styles.progressStat} ${styles.progressApproved}`}>
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
              <th>Document Name</th>
              <th>Status</th>
              <th>Upload Date</th>
              <th>Due Date</th>
              <th>Actions</th>
              {/* <th></th> */}
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} className={styles.tableRow}>
                <td className="flex items-center gap-2">
                  {getStatusIcon(doc.status)} {doc.name}
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
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <h3 className="text-lg font-bold mb-4">Upload Document</h3>

            {/* Document Category */}
            <div className={styles.accordionSection}>
              <label className="font-semibold">Select Category</label>
              <select
                className={styles.dropdown}
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSubCategory("");
                }}
              >
                <option value="">-- Choose Category --</option>
                <option value="legal">Legal</option>
                <option value="financial">Financial</option>
                <option value="tax">Tax</option>
              </select>
            </div>

            {/* Subcategory (only visible after category is selected) */}
            {selectedCategory && (
              <div className={styles.accordionSection}>
                <label className="font-semibold">Select Sub-Category</label>
                <select
                  className={styles.dropdown}
                  value={selectedSubCategory}
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                >
                  <option value="">-- Choose Sub-Category --</option>
                  {selectedCategory === "legal" && (
                    <>
                      <option value="incorporation">
                        Incorporation Certificate
                      </option>
                      <option value="contracts">Contracts</option>
                    </>
                  )}
                  {selectedCategory === "financial" && (
                    <>
                      <option value="balanceSheet">Balance Sheet</option>
                      <option value="pnl">Profit & Loss</option>
                    </>
                  )}
                  {selectedCategory === "tax" && (
                    <>
                      <option value="gst">GST Filing</option>
                      <option value="itr">ITR</option>
                    </>
                  )}
                </select>
              </div>
            )}

            {/* File Upload (only visible after subcategory is chosen) */}
            {selectedSubCategory && (
              <div className={styles.accordionSection}>
                <label className="font-semibold">Upload File</label>
                <div
                  className={styles.dragDropArea}
                  onClick={() => document.getElementById("fileInput").click()}
                >
                  <p>Drag & drop file here or click to select</p>
                  <input
                    type="file"
                    id="fileInput"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>
              </div>
            )}

            {/* Buttons */}
            <div
              className="flex justify-end gap-2 mt-2"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "2rem",
                marginTop: "2rem",
              }}
            >
              <button
                className={styles.buttonOutline}
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className={styles.buttonPrimary}
                disabled={!selectedSubCategory || !selectedFile}
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedFile(null);
                  setSelectedCategory("");
                  setSelectedSubCategory("");
                }}
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StartupDashboard;
