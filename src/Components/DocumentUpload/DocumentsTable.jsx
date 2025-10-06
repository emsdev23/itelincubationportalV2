import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "./DocCatTable.css";
import { FaTrash,FaEdit } from "react-icons/fa";

export default function DocumentsTable() {
  const userId = sessionStorage.getItem("userid");
  const token = sessionStorage.getItem("token");
  const IP = "http://121.242.232.212:8089/itelinc"

  const [documents, setDocuments] = useState([]);
  const [cats, setCats] = useState([]);
  const [subcats, setSubcats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editDoc, setEditDoc] = useState(null);
  const [formData, setFormData] = useState({
    documentname: "",
    documentdescription: "",
    documentcatrecid: "",
    documentsubcatrecid: "",
    documentperiodicityrecid: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Fetch documents
  const fetchDocuments = () => {
    setLoading(true);
    setError(null);
    fetch(`${IP}/getDocumentsAll`, {
      method: "GET",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        setDocuments(data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching documents:", err);
        setError("Failed to load documents. Please try again.");
        setLoading(false);
      });
  };

  // ✅ Fetch categories independently
  const fetchCategories = () => {
    fetch(`${IP}/itelinc/getDoccatAll`, {
      method: "GET",
      mode: "cors",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Categories data:", data); // Log for debugging
        setCats(data.data || []);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
      });
  };

  // ✅ Fetch subcategories independently
  const fetchSubCategories = () => {
    fetch(`${IP}/itelinc/getDocsubcatAll`, {
      method: "GET",
      mode: "cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Subcategories data:", data); // Log for debugging
        setSubcats(data.data || []);
      })
      .catch((err) => {
        console.error("Error fetching subcategories:", err);
      });
  };

  // ✅ Refresh all data
  const refreshData = () => {
    fetchDocuments();
    fetchCategories();
    fetchSubCategories();
  };

  // ✅ Refresh just dropdown data
  const refreshDropdownData = () => {
    fetchCategories();
    fetchSubCategories();
  };

  useEffect(() => {
    refreshData();
  }, []);

  // ✅ NEW: Add event listener to refresh dropdown data when category/subcategory changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'categoryUpdated' || e.key === 'subcategoryUpdated') {
        refreshDropdownData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const openAddModal = () => {
    setEditDoc(null);
    setFormData({
      documentname: "",
      documentdescription: "",
      documentcatrecid: "",
      documentsubcatrecid: "",
      documentperiodicityrecid: "",
    });
    // ✅ Refresh dropdown data before opening the modal
    refreshDropdownData();
    setIsModalOpen(true);
    setError(null);
  };

  const openEditModal = (doc) => {
    setEditDoc(doc);
    setFormData({
      documentname: doc.documentname || "",
      documentdescription: doc.documentdescription || "",
      documentcatrecid: doc.documentcatrecid || "",
      documentsubcatrecid: doc.documentsubcatrecid || "",
      documentperiodicityrecid: doc.documentperiodicityrecid || "",
    });
    // ✅ Refresh dropdown data before opening the modal
    refreshDropdownData();
    setIsModalOpen(true);
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field changed: ${name} = ${value}`); // Log for debugging
    
    // ✅ Additional debugging for subcategory
    if (name === "documentsubcatrecid") {
      console.log("Subcategory value type:", typeof value);
      console.log("Is subcategory value numeric?", !isNaN(value));
      
      // Find the selected subcategory to verify we're using the ID
      const selectedSubcat = subcats.find(sc => 
        sc.documentsubcatrecid === value || sc.docsubcatname === value
      );
      console.log("Selected subcategory object:", selectedSubcat);
    }
    
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "documentcatrecid") {
      setFormData((prev) => ({ ...prev, documentsubcatrecid: "" }));
    }
  };

  // ✅ Delete with SweetAlert
  const handleDelete = (docId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This document will be deleted permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        const url = `${IP}/deleteDocumentDetails?documentsrecid=${docId}&documentmodifiedby=${
          userId || "32"
        }`;

        fetch(url, {
          method: "POST",
          mode: "cors",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.statusCode === 200) {
              Swal.fire(
                "Deleted!",
                "Document deleted successfully!",
                "success"
              );
              refreshData();
            } else {
              throw new Error(data.message || "Failed to delete document");
            }
          })
          .catch((err) => {
            console.error("Error deleting document:", err);
            Swal.fire("Error", `Failed to delete: ${err.message}`, "error");
          });
      }
    });
  };

  // ✅ Add / Update Document
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validate
    if (
      !formData.documentname.trim() ||
      !formData.documentdescription.trim() ||
      !formData.documentcatrecid ||
      !formData.documentsubcatrecid ||
      !formData.documentperiodicityrecid
    ) {
      setError("All fields are required");
      setIsSubmitting(false);
      return;
    }

    // ✅ Find the selected subcategory to ensure we have the right ID
    let subcatId = formData.documentsubcatrecid;
    
    // If the value is not a number, try to find the subcategory by name
    if (isNaN(formData.documentsubcatrecid)) {
      console.log("Subcategory value is not numeric, trying to find by name");
      const subcatByName = subcats.find(sc => sc.docsubcatname === formData.documentsubcatrecid);
      if (subcatByName) {
        subcatId = subcatByName.documentsubcatrecid;
        console.log("Found subcategory by name, using ID:", subcatId);
      } else {
        console.error("Could not find subcategory by name:", formData.documentsubcatrecid);
        setError("Invalid subcategory selected");
        setIsSubmitting(false);
        return;
      }
    } else {
      console.log("Subcategory value is numeric, using as ID:", subcatId);
    }

    const params = new URLSearchParams();
    if (editDoc) {
      params.append("documentsrecid", editDoc.documentsrecid);
    }
    
    // ✅ Use the verified IDs
    params.append("documentname", formData.documentname.trim());
    params.append("documentdescription", formData.documentdescription.trim());
    params.append("documentcatrecid", formData.documentcatrecid); // This is the ID
    params.append("documentsubcatrecid", subcatId); // Use the verified ID
    params.append("documentperiodicityrecid", formData.documentperiodicityrecid);

    if (editDoc) {
      params.append("documentmodifiedby", userId || "32");
    } else {
      params.append("documentcreatedby", userId || "32");
      params.append("documentmodifiedby", userId || "32");
    }

    const baseUrl = editDoc
      ? `${IP}/updateDocumentDetails`
      : `${IP}/addDocumentDetails`;

    const url = `${baseUrl}?${params.toString()}`;
    
    // ✅ Log the URL for debugging
    console.log("Request URL:", url);
    console.log("Category ID being sent:", formData.documentcatrecid);
    console.log("Subcategory ID being sent:", subcatId);

    fetch(url, {
      method: "POST",
      mode: "cors",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("API Response:", data); // Log the response for debugging
        
        if (data.statusCode === 200) {
          if (
            data.data &&
            typeof data.data === "string" &&
            data.data.includes("Duplicate entry") &&
            data.data.includes("documents.unique_document_active")
          ) {
            setError("Document already exists");
            Swal.fire("Duplicate", "Document already exists!", "warning");
          } else {
            setIsModalOpen(false);
            setEditDoc(null);
            refreshData();
            Swal.fire(
              "Success",
              data.message || "Document saved successfully!",
              "success"
            );
          }
        } else {
          throw new Error(data.message || "Operation failed");
        }
      })
      .catch((err) => {
        console.error("Error saving document:", err);
        setError(`Failed to save: ${err.message}`);
        Swal.fire("Error", `Failed to save: ${err.message}`, "error");
      })
      .finally(() => setIsSubmitting(false));
  };

  // ✅ NEW: Add a function to get filtered subcategories for debugging
  const getFilteredSubcategories = () => {
    const filtered = subcats.filter(
      (sc) => sc.docsubcatscatrecid == formData.documentcatrecid
    );
    console.log("Filtered subcategories:", filtered);
    console.log("Selected category ID:", formData.documentcatrecid);
    return filtered;
  };

  return (
    <div className="doccat-container">
      <div className="doccat-header">
        <h2 className="doccat-title">📄 Documents</h2>
        <button className="btn-add-category" onClick={openAddModal}>
          + Add Document
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <p className="doccat-empty">Loading documents...</p>
      ) : (
        <div className="doccat-table-wrapper">
          <table className="doccat-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Category</th>
                <th>Subcategory</th>
                <th>Name</th>
                <th>Description</th>
                <th>Periodicity</th>
                <th>Created By</th>
                <th>Created Time</th>
                <th>Modified By</th>
                <th>Modified Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.length > 0 ? (
                documents.map((doc, idx) => (
                  <tr key={doc.documentsrecid || idx}>
                    <td>{idx + 1}</td>
                    <td>{doc.doccatname}</td>
                    <td>{doc.docsubcatname}</td>
                    <td>{doc.documentname}</td>
                    <td>{doc.documentdescription}</td>
                    <td>{doc.docperiodicityname}</td>
                    <td>
                      {isNaN(doc.documentcreatedby)
                        ? doc.documentcreatedby
                        : "Admin"}
                    </td>
                    <td>
                      {new Date(doc.documentcreatedtime).toLocaleString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: false
                        }).replace(",", "")}
                    </td>
                    <td>
                      {isNaN(doc.documentmodifiedby)
                        ? doc.documentmodifiedby
                        : "Admin"}
                    </td>
                    <td>
                      {new Date(doc.documentmodifiedtime).toLocaleString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: false
                        }).replace(",", "")}
                    </td>
                    <td>
                      <button
                        className="btn-edit"
                        onClick={() => openEditModal(doc)}>
                        <FaEdit color="white" size={18} />
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(doc.documentsrecid)}>
                        <FaTrash color="white" size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="doccat-empty">
                    No documents found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="doccat-modal-backdrop">
          <div className="doccat-modal-content">
            <div className="doccat-modal-header">
              <h3>{editDoc ? "Edit Document" : "Add Document"}</h3>
              <button
                className="btn-close"
                onClick={() => setIsModalOpen(false)}
              >
                &times;
              </button>
            </div>
            <form className="doccat-form" onSubmit={handleSubmit}>
              <label>
                Category *
                <select
                  name="documentcatrecid"
                  value={formData.documentcatrecid}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  {cats.map((cat) => (
                    <option key={cat.doccatrecid} value={cat.doccatrecid}>
                      {cat.doccatname}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Subcategory *
                <select
                  name="documentsubcatrecid"
                  value={formData.documentsubcatrecid}
                  onChange={handleChange}
                  required
                  disabled={!formData.documentcatrecid}
                >
                  <option value="">Select Subcategory</option>
                  {getFilteredSubcategories().map((sc) => (
                    <option
                      key={sc.docsubcatrecid}
                      value={sc.docsubcatrecid}
                    >
                      {sc.docsubcatname}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Periodicity *
                <select
                  name="documentperiodicityrecid"
                  value={formData.documentperiodicityrecid}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Periodicity</option>
                  <option value="1">One-time</option>
                  <option value="2">Monthly</option>
                  <option value="3">Quarterly</option>
                  <option value="4">Yearly</option>
                </select>
              </label>

              <label>
                Document Name *
                <input
                  type="text"
                  name="documentname"
                  value={formData.documentname}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Description *
                <textarea
                  name="documentdescription"
                  value={formData.documentdescription}
                  onChange={handleChange}
                  required
                  rows="3"
                />
              </label>

              {error && <div className="modal-error-message">{error}</div>}

              <div className="doccat-form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-save"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : editDoc ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}