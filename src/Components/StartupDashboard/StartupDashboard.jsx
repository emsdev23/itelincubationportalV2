import { useState, useContext, useEffect } from "react";
import styles from "./StartupDashboard.module.css";
import companyLogo from "../../Images/company6.png";
import DocumentUploadModal from "./DocumentUploadModal";
import { useNavigate } from "react-router-dom";
// import ChangePasswordModal from "./ChangePasswordModal";

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
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowLeft,
  CircleUserRound,
} from "lucide-react";
import ITELLogo from "../../assets/ITEL_Logo.png";

import { DataContext } from "../Datafetching/DataProvider";
import DocumentTable from "../DocumentTable";
import ChangePasswordModal from "./ChangePasswordModal";

const StartupDashboard = () => {
  const {
    roleid,
    listOfIncubatees,
    companyDoc,
    startupcompanyDoc,
    startupdetails,
    setadminviewData,
    refreshCompanyDocuments,
    adminStartupLoading,
    adminviewData,
    clearAllData,
  } = useContext(DataContext);

  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  // Set the adminviewData when component mounts or id changes
  useEffect(() => {
    if (id) {
      setadminviewData(id);
    }
  }, [id, setadminviewData]);

  const [searchparams, setsearchparams] = useSearchParams();
  const founder = searchparams.get("founder");

  // Determine which data to use based on role and admin viewing state
  const getIncubateeData = () => {
    if (Number(roleid) === 1 && adminviewData) {
      // Admin viewing specific startup - use startupdetails
      return startupdetails?.[0];
    } else if (Number(roleid) === 4) {
      // Regular user - use listOfIncubatees
      return listOfIncubatees?.[0];
    }
    return null;
  };

  const getCompanyDocuments = () => {
    if (Number(roleid) === 1 && adminviewData) {
      // Admin viewing specific startup - use startupcompanyDoc
      return startupcompanyDoc || [];
    } else if (Number(roleid) === 4) {
      // Regular user - use companyDoc
      return companyDoc || [];
    }
    return [];
  };

  const incubatee = getIncubateeData();
  const documentsData = getCompanyDocuments();

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
  const founderName = incubatee?.incubateesfoundername;

  // Local state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localCompanyDoc, setLocalCompanyDoc] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Filter and pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Update local state when context data changes
  useEffect(() => {
    setLocalCompanyDoc(documentsData);
  }, [documentsData]);

  // Show loading state when admin is fetching startup data
  if (
    adminStartupLoading ||
    (Number(roleid) === 1 && adminviewData && !incubatee)
  ) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg">Loading startup data...</div>
      </div>
    );
  }

  // Show message if no data is available
  if (!incubatee) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg text-gray-600">
          {Number(roleid) === 1
            ? "Please select a startup to view from the admin panel."
            : "No startup data found."}
        </div>
      </div>
    );
  }

  const convertData = (dateStr) => {
    const dateObj = new Date(dateStr);
    const formatted = dateObj.toLocaleDateString("en-GB");
    return formatted;
  };

  // Get unique categories and statuses for filters
  const uniqueCategories = [
    ...new Set(localCompanyDoc.map((doc) => doc.doccatname)),
  ];
  const uniqueStatuses = [...new Set(localCompanyDoc.map((doc) => doc.status))];

  // Filter documents based on search term and filters
  const filteredDocuments = localCompanyDoc.filter((doc) => {
    const matchesSearch =
      doc.doccatname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.docsubcatname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.status?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || doc.doccatname === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDocuments = filteredDocuments.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Manual refresh function to fetch company documents
  const fetchCompanyDocuments = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const userid = sessionStorage.getItem("userid");

      const response = await fetch(
        "http://121.242.232.212:8086/itelinc/resources/generic/getcompanydocs",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userid: userid,
            incubateesrecid: incubateesrecid,
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
      if (refreshCompanyDocuments) {
        await refreshCompanyDocuments();
      } else {
        await fetchCompanyDocuments();
      }
      // Reset filters and pagination after upload
      setSearchTerm("");
      setStatusFilter("all");
      setCategoryFilter("all");
      setCurrentPage(1);
    } catch (error) {
      console.error("Error refreshing documents:", error);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  // Calculate stats based on actual API data (localCompanyDoc)
  const totalDocuments = localCompanyDoc.length;
  const submittedDocuments = localCompanyDoc.filter(
    (d) => d.status === "Submitted"
  ).length;
  const pendingDocuments = localCompanyDoc.filter(
    (d) => d.status === "Pending"
  ).length;
  const overdueDocuments = localCompanyDoc.filter(
    (d) => d.status === "Overdue"
  ).length;
  const completionRate =
    totalDocuments > 0 ? (submittedDocuments / totalDocuments) * 100 : 0;

  const getStatusBadge = (status) => {
    switch (status) {
      case "Submitted":
        return (
          <span className={`${styles.badge} ${styles.badgeApproved}`}>
            Submitted
          </span>
        );
      case "Pending":
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
      case "Pending":
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
    // Clear all context data first
    clearAllData();

    // Clear session storage
    sessionStorage.removeItem("userid");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("roleid");

    // Navigate to login
    navigate("/", { replace: true });
  };

  const handleBackToAdmin = () => {
    // clearAllData();

    navigate("/Incubation/Dashboard");
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setCurrentPage(1);
  };

  const handleAbolishDocument = async (filepath) => {
    try {
      // Show confirmation dialog
      const confirmed = window.confirm(
        "Are you sure you want to mark this document as Obselete? This action cannot be undone."
      );

      if (!confirmed) return;

      // Get the user ID and token from sessionStorage (same as other functions)
      const userId = sessionStorage.getItem("userid");
      const token = sessionStorage.getItem("token");

      if (!userId || !token) {
        alert("User authentication not found. Please login again.");
        return;
      }

      const response = await fetch(
        `http://121.242.232.212:8086/itelinc/resources/generic/markobsolete?modifiedBy=${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            url: filepath,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("Document marked as obsolete:", result);

        // Show success message
        alert("Document has been successfully marked as obsolete.");

        // Refresh the documents list
        if (refreshCompanyDocuments) {
          await refreshCompanyDocuments();
        } else {
          await fetchCompanyDocuments();
        }
      } else {
        console.error(
          "Failed to mark document as obsolete:",
          response.statusText
        );
        alert("Failed to mark document as obsolete. Please try again.");
      }
    } catch (error) {
      console.error("Error marking document as obsolete:", error);
      alert("An error occurred while marking the document as obsolete.");
    }
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
              <p className={style.subtitle}>
                {Number(roleid) === 1
                  ? "Admin Dashboard"
                  : "Startup Management Dashboard"}
              </p>
            </div>
          </div>

          <div className={style.actions}>
            {/* Show back button for admin */}
            {Number(roleid) === 1 && adminviewData && (
              <button
                className={style.btnPrimary}
                onClick={handleBackToAdmin}
                style={{
                  background: "#63e6be",
                  display: "flex",
                  fontWeight: "bold",
                  color: "#0b7285",
                }}
              >
                <ArrowLeft className={style.icon} />
                Back to Portal
              </button>
            )}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                // gap: "0.5rem",
                fontSize: "0.8rem",
                color: "gray",
                cursor: "pointer",
              }}
              onClick={() => setIsChangePasswordOpen(true)}
            >
              <CircleUserRound />
              <div>{founderName}</div>
            </div>

            {isChangePasswordOpen && Number(roleid) === 4 && (
              <ChangePasswordModal
                isOpen={isChangePasswordOpen}
                onClose={() => setIsChangePasswordOpen(false)}
              />
            )}

            {Number(roleid) === 4 && (
              <button
                className={style.btnPrimary}
                onClick={handleLogout}
                style={{ background: "#0ca678", fontWeight: "bold" }}
              >
                <LogOut className={style.icon} />
                Logout
              </button>
            )}
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
            {/* Only show Add Document button for users (roleid=4), not for admins (roleid=1) */}
            {Number(roleid) === 4 && (
              <button
                className={styles.buttonPrimary}
                onClick={() => setIsModalOpen(true)}
              >
                <Upload className="h-4 w-4 mr-2" /> Add Document
              </button>
            )}
          </div>

          <p className="text-gray-600 mb-2">
            {Number(roleid) === 1
              ? "Viewing document update progress for this startup"
              : "Complete your document updates by submitting all required documents"}
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

        {/* Filter Section */}
        <div className={styles.filterSection}>
          <div className={styles.filterGroup}>
            <div className={styles.searchBox}>
              <Search className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className={styles.searchInput}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={styles.filterSelect}
            >
              <option value="all">All Statuses</option>
              {uniqueStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={styles.filterSelect}
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.resultsInfo}>
            Showing {paginatedDocuments.length} of {filteredDocuments.length}{" "}
            documents (filtered from {localCompanyDoc.length} total)
          </div>
        </div>

        {/* Documents Table */}
        <div className={styles.documentsTableFull}>
          <table>
            <thead>
              <tr className="bg-gray-200">
                <th>Document Category</th>
                <th>Document SubCategory</th>
                <th>Document Name</th>
                <th>Status</th>
                <th>Periodicity</th>
                <th>Upload Date</th>
                <th>Due Date</th>
                <th>{}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDocuments.length > 0 ? (
                paginatedDocuments.map((doc, index) => (
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
                    <td className="flex items-center gap-2">
                      {doc.documentname}
                    </td>
                    <td>{getStatusBadge(doc.status)}</td>
                    <td>{doc.periodicity}</td>
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
                      <div className="flex gap-2 justify-end">
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

                        {/* Abolish Button - Only show if document has filepath */}
                        {doc.filepath && (
                          <button
                            style={{
                              background: "#ff8787",
                              padding: "0.2rem",
                              border: "1px solid #ff8787",
                              borderRadius: "0.3rem",
                              color: "#c92a2a",
                              fontSize: "0.7rem",
                              cursor: "pointer",
                              // width: "2rem",
                            }}
                            onClick={() => handleAbolishDocument(doc.filepath)}
                            title="Mark document as obsolete"
                          >
                            Obselete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className={styles.noData}>
                    No documents found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {filteredDocuments.length > 0 && (
            <div className={styles.pagination}>
              <div className={styles.paginationInfo}>
                Page {currentPage} of {totalPages}
              </div>

              <div className={styles.paginationControls}>
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={styles.paginationButton}
                >
                  <ChevronLeft className={styles.paginationIcon} />
                  Previous
                </button>

                <div className={styles.pageNumbers}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => handlePageClick(page)}
                        className={`${styles.pageButton} ${
                          currentPage === page ? styles.pageButtonActive : ""
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={styles.paginationButton}
                >
                  Next
                  <ChevronRight className={styles.paginationIcon} />
                </button>
              </div>

              <div className={styles.itemsPerPage}>
                <label>Items per page: </label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className={styles.pageSizeSelect}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Add Document Modal - Only for users */}
        {isModalOpen && Number(roleid) === 4 && (
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
