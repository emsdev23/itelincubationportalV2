import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "./DocCatTable.css";

export default function DocumentsTable() {
  const userId = sessionStorage.getItem("userid");
  const token = sessionStorage.getItem("token");

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
    fetch("http://121.242.232.212:8086/itelinc/getDocumentsAll", {
      method: "GET",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        setDocuments(data.data || []);
        // Extract unique categories
        setCats([
          ...new Map(
            (data.data || []).map((d) => [
              d.documentcatrecid,
              { doccatrecid: d.documentcatrecid, doccatname: d.doccatname },
            ])
          ).values(),
        ]);
        // Extract unique subcategories
        setSubcats([
          ...new Map(
            (data.data || []).map((d) => [
              d.documentsubcatrecid,
              {
                documentsubcatrecid: d.documentsubcatrecid,
                docsubcatname: d.docsubcatname,
                docsubcatscatrecid: d.documentcatrecid,
              },
            ])
          ).values(),
        ]);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching documents:", err);
        setError("Failed to load documents. Please try again.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDocuments();
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
    setIsModalOpen(true);
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
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
        const url = `http://121.242.232.212:8086/itelinc/deleteDocumentDetails?documentsrecid=${docId}&documentmodifiedby=${
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
              fetchDocuments();
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

    const params = new URLSearchParams();
    if (editDoc) {
      params.append("documentsrecid", editDoc.documentsrecid);
    }
    params.append("documentname", formData.documentname.trim());
    params.append("documentdescription", formData.documentdescription.trim());
    params.append("documentcatrecid", formData.documentcatrecid);
    params.append("documentsubcatrecid", formData.documentsubcatrecid);
    params.append(
      "documentperiodicityrecid",
      formData.documentperiodicityrecid
    );

    if (editDoc) {
      params.append("documentmodifiedby", userId || "32");
    } else {
      params.append("documentcreatedby", userId || "32");
      params.append("documentmodifiedby", userId || "32");
    }

    const baseUrl = editDoc
      ? "http://121.242.232.212:8086/itelinc/updateDocumentDetails"
      : "http://121.242.232.212:8086/itelinc/addDocumentDetails";

    const url = `${baseUrl}?${params.toString()}`;

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
            fetchDocuments();
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
                      {doc.documentcreatedtime
                        ? new Date(doc.documentcreatedtime).toLocaleString()
                        : ""}
                    </td>
                    <td>
                      {isNaN(doc.documentmodifiedby)
                        ? doc.documentmodifiedby
                        : "Admin"}
                    </td>
                    <td>
                      {doc.documentmodifiedtime
                        ? new Date(doc.documentmodifiedtime).toLocaleString()
                        : ""}
                    </td>
                    <td>
                      <button
                        className="btn-edit"
                        onClick={() => openEditModal(doc)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(doc.documentsrecid)}
                      >
                        Delete
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
                  {subcats
                    .filter(
                      (sc) => sc.docsubcatscatrecid == formData.documentcatrecid
                    )
                    .map((sc) => (
                      <option
                        key={sc.documentsubcatrecid}
                        value={sc.documentsubcatrecid}
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
