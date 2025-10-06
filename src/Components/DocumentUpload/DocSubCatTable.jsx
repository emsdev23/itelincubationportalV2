import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "./DocCatTable.css";
import { FaTrash, FaEdit, FaPlus, FaSpinner } from "react-icons/fa";

export default function DocSubCatTable() {
  const userId = sessionStorage.getItem("userid");
  const token = sessionStorage.getItem("token");

  const [subcats, setSubcats] = useState([]);
  const [cats, setCats] = useState([]); // categories for dropdown
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editSubCat, setEditSubCat] = useState(null);
  const [formData, setFormData] = useState({
    docsubcatname: "",
    docsubcatdescription: "",
    docsubcatscatrecid: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const IP = "http://121.242.232.212:8089/itelinc";
  
  // Loading states for operations
  const [isDeleting, setIsDeleting] = useState(null); // Store subcategory ID being deleted
  const [isEditing, setIsEditing] = useState(null); // Store subcategory ID being edited

  // Fetch all subcategories
  const fetchSubCategories = () => {
    setLoading(true);
    setError(null);
    fetch(`${IP}/getDocsubcatAll`, {
      method: "GET",
      mode: "cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
      .then((res) => res.json())
      .then((data) => {
        setSubcats(data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching subcategories:", err);
        setError("Failed to load subcategories. Please try again.");
        setLoading(false);
      });
  };

  // Fetch categories for dropdown
  const fetchCategories = () => {
    fetch(`${IP}/getDoccatAll`, {
      method: "GET",
      mode: "cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
      .then((res) => res.json())
      .then((data) => setCats(data.data || []))
      .catch((err) => console.error("Error fetching categories:", err));
  };

  // Refresh both subcategories and categories
  const refreshData = () => {
    fetchSubCategories();
    fetchCategories();
  };

  useEffect(() => {
    refreshData(); // Use refreshData instead of separate calls
  }, []);

  const openAddModal = () => {
    setEditSubCat(null);
    setFormData({
      docsubcatname: "",
      docsubcatdescription: "",
      docsubcatscatrecid: "",
    });
    // Refresh categories before opening the modal to get the latest list
    fetchCategories();
    setIsModalOpen(true);
    setError(null);
  };

  const openEditModal = (subcat) => {
    setIsEditing(subcat.docsubcatrecid);
    setEditSubCat(subcat);
    setFormData({
      docsubcatname: subcat.docsubcatname || "",
      docsubcatdescription: subcat.docsubcatdescription || "",
      docsubcatscatrecid: subcat.docsubcatscatrecid || "",
    });
    // Refresh categories before opening the modal to get the latest list
    fetchCategories();
    setIsModalOpen(true);
    setError(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Improved Delete with SweetAlert and loading state
  const handleDelete = (subcatId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This subcategory will be deleted permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setIsDeleting(subcatId);
        const deleteUrl = `${IP}/deleteDocsubcat?docsubcatrecid=${subcatId}&docsubcatmodifiedby=${
          userId || "32"
        }`;

        fetch(deleteUrl, {
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
                "Subcategory deleted successfully!",
                "success"
              );
              refreshData(); // Use refreshData instead of just fetchSubCategories
            } else {
              throw new Error(data.message || "Failed to delete subcategory");
            }
          })
          .catch((err) => {
            console.error("Error deleting subcategory:", err);
            Swal.fire("Error", `Failed to delete: ${err.message}`, "error");
          })
          .finally(() => {
            setIsDeleting(null);
          });
      }
    });
  };

  // ✅ FIXED: Add/Update with proper URL parameters and loading state
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validate form data
    if (
      !formData.docsubcatname.trim() ||
      !formData.docsubcatdescription.trim() ||
      !formData.docsubcatscatrecid
    ) {
      setError("All fields are required");
      setIsSubmitting(false);
      return;
    }

    // Build URL parameters safely
    const params = new URLSearchParams();

    if (editSubCat) {
      params.append("docsubcatrecid", editSubCat.docsubcatrecid);
    }
    params.append("docsubcatname", formData.docsubcatname.trim());
    params.append("docsubcatdescription", formData.docsubcatdescription.trim());
    params.append("docsubcatscatrecid", formData.docsubcatscatrecid);

    // ✅ User ID is REQUIRED for both add and update operations
    if (editSubCat) {
      params.append("docsubcatmodifiedby", userId || "32");
    } else {
      params.append("docsubcatcreatedby", userId || "32");
      params.append("docsubcatmodifiedby", userId || "32");
      params.append("userid", userId || "32");
    }

    const baseUrl = editSubCat
      ? `${IP}/updateDocsubcat`
      : `${IP}/addDocsubcat`;

    const url = `${baseUrl}?${params.toString()}`;

    console.log("API URL:", url); // Debug URL

    fetch(url, {
      method: "POST",
      mode: "cors",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("API Response:", data);

        if (data.statusCode === 200) {
          // Handle duplicate subcategory error
          if (
            data.data &&
            typeof data.data === "string" &&
            data.data.includes("Duplicate entry") &&
            data.data.includes("docsubcat.unique_docsubcat_active")
          ) {
            setError("Subcategory name already exists for this category");
            Swal.fire(
              "Duplicate",
              "Subcategory name already exists for this category!",
              "warning"
            );
          } else {
            setIsModalOpen(false);
            setEditSubCat(null);
            setIsEditing(null);
            setFormData({
              docsubcatname: "",
              docsubcatdescription: "",
              docsubcatscatrecid: "",
            });
            refreshData(); // Use refreshData instead of just fetchSubCategories
            Swal.fire(
              "Success",
              data.message || "Subcategory saved successfully!",
              "success"
            );
          }
        } else {
          throw new Error(
            data.message || `Operation failed with status: ${data.statusCode}`
          );
        }
      })
      .catch((err) => {
        console.error("Error saving subcategory:", err);
        setError(`Failed to save: ${err.message}`);
        Swal.fire(
          "Error",
          `Failed to save subcategory: ${err.message}`,
          "error"
        );
      })
      .finally(() => {
        setIsSubmitting(false);
        setIsEditing(null);
      });
  };

  return (
    <div className="doccat-container">
      <div className="doccat-header">
        <h2 className="doccat-title">📂 Document Subcategories</h2>
        <button className="btn-add-category" onClick={openAddModal} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <FaSpinner className="spinner" size={16} /> Adding...
            </>
          ) : (
            <>
              <FaPlus size={16} /> Add Subcategory
            </>
          )}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <p className="doccat-empty">Loading subcategories...</p>
      ) : (
        <div className="doccat-table-wrapper">
          <table className="doccat-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Category</th>
                <th>Subcategory Name</th>
                <th>Description</th>
                <th>Created By</th>
                <th>Created Time</th>
                <th>Modified By</th>
                <th>Modified Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subcats.length > 0 ? (
                subcats.map((subcat, idx) => (
                  <tr key={subcat.docsubcatrecid || idx}>
                    <td>{idx + 1}</td>
                    <td>{subcat.doccatname || "N/A"}</td>
                    <td>{subcat.docsubcatname}</td>
                    <td>{subcat.docsubcatdescription}</td>
                    <td>
                      {isNaN(subcat.docsubcatcreatedby)
                        ? subcat.docsubcatcreatedby
                        : "Admin"}
                    </td>
                    <td>
                      {new Date(subcat.docsubcatcreatedtime).toLocaleString("en-US", {
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
                      {isNaN(subcat.docsubcatmodifiedby)
                        ? subcat.docsubcatmodifiedby
                        : "Admin"}
                    </td>
                    <td>{new Date(subcat.docsubcatmodifiedtime).toLocaleString("en-US", {
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
                        onClick={() => openEditModal(subcat)}
                        disabled={isDeleting === subcat.docsubcatrecid || isSubmitting}
                      >
                        {isEditing === subcat.docsubcatrecid ? (
                          <FaSpinner className="spinner" size={18} />
                        ) : (
                          <FaEdit size={18} />
                        )}
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(subcat.docsubcatrecid)}
                        disabled={isDeleting === subcat.docsubcatrecid || isEditing === subcat.docsubcatrecid}
                      >
                        {isDeleting === subcat.docsubcatrecid ? (
                          <FaSpinner className="spinner" size={18} />
                        ) : (
                          <FaTrash size={18} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="doccat-empty">
                    No subcategories found
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
              <h3>{editSubCat ? "Edit Subcategory" : "Add Subcategory"}</h3>
              <button
                className="btn-close"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditSubCat(null);
                  setIsEditing(null);
                }}
                disabled={isSubmitting}
              >
                &times;
              </button>
            </div>
            
            {/* Loading overlay for modal */}
            {isSubmitting && (
              <div className="modal-loading-overlay">
                <div className="modal-loading-spinner">
                  <FaSpinner className="spinner" size={24} />
                  <p>{editSubCat ? "Updating subcategory..." : "Saving subcategory..."}</p>
                </div>
              </div>
            )}
            
            <form className="doccat-form" onSubmit={handleSubmit}>
              <label>
                Category *
                <select
                  name="docsubcatscatrecid"
                  value={formData.docsubcatscatrecid}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
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
                Subcategory Name *
                <input
                  type="text"
                  name="docsubcatname"
                  value={formData.docsubcatname}
                  onChange={handleChange}
                  required
                  placeholder="Enter subcategory name"
                  disabled={isSubmitting}
                />
              </label>
              <label>
                Description *
                <textarea
                  name="docsubcatdescription"
                  value={formData.docsubcatdescription}
                  onChange={handleChange}
                  required
                  placeholder="Enter subcategory description"
                  rows="3"
                  disabled={isSubmitting}
                />
              </label>
              {error && <div className="modal-error-message">{error}</div>}
              <div className="doccat-form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditSubCat(null);
                    setIsEditing(null);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-save"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="spinner" size={14} /> 
                      {editSubCat ? "Updating..." : "Saving..."}
                    </>
                  ) : (
                    editSubCat ? "Update" : "Save"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Loading overlay for operations */}
      {(isSubmitting || isDeleting !== null) && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <FaSpinner className="spinner" size={40} />
            <p>
              {isSubmitting 
                ? (editSubCat ? "Updating subcategory..." : "Saving subcategory...")
                : "Deleting subcategory..."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}