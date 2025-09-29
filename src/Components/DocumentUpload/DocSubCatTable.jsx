import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "./DocCatTable.css";

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

  // Fetch all subcategories
  const fetchSubCategories = () => {
    setLoading(true);
    setError(null);
    fetch("http://121.242.232.212:8086/itelinc/getDocsubcatAll", {
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
    fetch("http://121.242.232.212:8086/itelinc/getDoccatAll", {
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

  // ✅ Improved Delete with SweetAlert
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
        const deleteUrl = `http://121.242.232.212:8086/itelinc/deleteDocsubcat?docsubcatrecid=${subcatId}&docsubcatmodifiedby=${
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
          });
      }
    });
  };

  // ✅ FIXED: Add/Update with proper URL parameters
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
      ? "http://121.242.232.212:8086/itelinc/updateDocsubcat"
      : "http://121.242.232.212:8086/itelinc/addDocsubcat";

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
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="doccat-container">
      <div className="doccat-header">
        <h2 className="doccat-title">📂 Document Subcategories</h2>
        <button className="btn-add-category" onClick={openAddModal}>
          + Add Subcategory
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
                    <td>{subcat.docsubcatcreatedtime || ""}</td>
                    <td>
                      {isNaN(subcat.docsubcatmodifiedby)
                        ? subcat.docsubcatmodifiedby
                        : "Admin"}
                    </td>
                    <td>{subcat.docsubcatmodifiedtime || ""}</td>
                    <td>
                      <button
                        className="btn-edit"
                        onClick={() => openEditModal(subcat)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(subcat.docsubcatrecid)}
                      >
                        Delete
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
                onClick={() => setIsModalOpen(false)}
              >
                &times;
              </button>
            </div>
            <form className="doccat-form" onSubmit={handleSubmit}>
              <label>
                Category *
                <select
                  name="docsubcatscatrecid"
                  value={formData.docsubcatscatrecid}
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
                Subcategory Name *
                <input
                  type="text"
                  name="docsubcatname"
                  value={formData.docsubcatname}
                  onChange={handleChange}
                  required
                  placeholder="Enter subcategory name"
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
                  {isSubmitting ? "Saving..." : editSubCat ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}