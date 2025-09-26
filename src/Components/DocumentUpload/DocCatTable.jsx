import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "./DocCatTable.css";

export default function DocCatTable() {
  const userId = sessionStorage.getItem("userid");
  const token = sessionStorage.getItem("token");

  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [formData, setFormData] = useState({
    doccatname: "",
    doccatdescription: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Fetch all categories
  const fetchCategories = () => {
    setLoading(true);
    setError(null);

    fetch("http://121.242.232.212:8086/itelinc/getDoccatAll", {
      method: "GET",
      mode: "cors",
    })
      .then((res) => res.json())
      .then((data) => {
        setCats(data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories. Please try again.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditCat(null);
    setFormData({ doccatname: "", doccatdescription: "" });
    setIsModalOpen(true);
    setError(null);
  };

  const openEditModal = (cat) => {
    setEditCat(cat);
    setFormData({
      doccatname: cat.doccatname || "",
      doccatdescription: cat.doccatdescription || "",
    });
    setIsModalOpen(true);
    setError(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Delete with SweetAlert
  const handleDelete = (catId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This category will be deleted permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        const deleteUrl = `http://121.242.232.212:8086/itelinc/deletedoccat?doccatrecid=${catId}&doccatmodifiedby=${userId}`;

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
                "Category deleted successfully!",
                "success"
              );
              fetchCategories();
            } else {
              throw new Error(data.message || "Failed to delete category");
            }
          })
          .catch((err) => {
            console.error("Error deleting category:", err);
            Swal.fire("Error", `Failed to delete: ${err.message}`, "error");
          });
      }
    });
  };

  // ✅ FIXED: Add/Update with proper URL encoding
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validate form data
    if (!formData.doccatname.trim() || !formData.doccatdescription.trim()) {
      setError("Category name and description are required");
      setIsSubmitting(false);
      return;
    }

    // Build URL parameters safely
    const params = new URLSearchParams();

    if (editCat) {
      params.append("doccatrecid", editCat.doccatrecid);
    }
    params.append("doccatname", formData.doccatname.trim());
    params.append("doccatdescription", formData.doccatdescription.trim());

    // ✅ FIX: User ID is REQUIRED for both add and update operations
    if (editCat) {
      params.append("doccatmodifiedby", userId || "1"); // Fallback to "1" if null
    } else {
      params.append("doccatcreatedby", userId || "1");
      params.append("doccatmodifiedby", userId || "1");
    }

    const baseUrl = editCat
      ? "http://121.242.232.212:8086/itelinc/updateDoccat"
      : "http://121.242.232.212:8086/itelinc/addDoccat";

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
          if (
            data.data &&
            typeof data.data === "string" &&
            data.data.includes("Duplicate entry")
          ) {
            setError("Category name already exists");
            Swal.fire("Duplicate", "Category name already exists!", "warning");
          } else {
            setIsModalOpen(false);
            setEditCat(null);
            setFormData({ doccatname: "", doccatdescription: "" });
            fetchCategories();
            Swal.fire(
              "Success",
              data.message || "Category saved successfully!",
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
        console.error("Error saving category:", err);
        setError(`Failed to save: ${err.message}`);
        Swal.fire("Error", `Failed to save category: ${err.message}`, "error");
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="doccat-container">
      <div className="doccat-header">
        <h2 className="doccat-title">📂 Document Categories</h2>
        <button className="btn-add-category" onClick={openAddModal}>
          + Add Category
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <p className="doccat-empty">Loading categories...</p>
      ) : (
        <div className="doccat-table-wrapper">
          <table className="doccat-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Category Name</th>
                <th>Description</th>
                <th>Created By</th>
                <th>Created Time</th>
                <th>Modified By</th>
                <th>Modified Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cats.length > 0 ? (
                cats.map((cat, idx) => (
                  <tr key={cat.doccatrecid || idx}>
                    <td>{idx + 1}</td>
                    <td>{cat.doccatname}</td>
                    <td>{cat.doccatdescription}</td>
                    <td>
                      {isNaN(cat.doccatcreatedby)
                        ? cat.doccatcreatedby
                        : "Admin"}
                    </td>
                    <td>{cat.doccatcreatedtime || ""}</td>
                    <td>
                      {isNaN(cat.doccatmodifiedby)
                        ? cat.doccatmodifiedby
                        : "Admin"}
                    </td>
                    <td>{cat.doccatmodifiedtime || ""}</td>
                    <td>
                      <button
                        className="btn-edit"
                        onClick={() => openEditModal(cat)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(cat.doccatrecid)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="doccat-empty">
                    No categories found
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
              <h3>{editCat ? "Edit Category" : "Add Category"}</h3>
              <button
                className="btn-close"
                onClick={() => setIsModalOpen(false)}
              >
                &times;
              </button>
            </div>
            <form className="doccat-form" onSubmit={handleSubmit}>
              <label>
                Category Name *
                <input
                  type="text"
                  name="doccatname"
                  value={formData.doccatname}
                  onChange={handleChange}
                  required
                  placeholder="Enter category name"
                />
              </label>
              <label>
                Description *
                <textarea
                  name="doccatdescription"
                  value={formData.doccatdescription}
                  onChange={handleChange}
                  required
                  placeholder="Enter category description"
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
                  {isSubmitting ? "Saving..." : editCat ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
