import React, { useState, useEffect } from "react";

const DocumentUploadModal = ({
  isModalOpen,
  setIsModalOpen,
  incubateesrecid,
  usersrecid,
  onUploadSuccess,
}) => {
  const [userId, setUserId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedDocInfo, setSelectedDocInfo] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [docInfos, setDocInfos] = useState([]);
  const [loading, setLoading] = useState({
    categories: false,
    subCategories: false,
    docInfos: false,
    uploading: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  // Get file extension function
  const getFileExtension = (filename) => {
    const lastDotIndex = filename.lastIndexOf(".");
    if (lastDotIndex === -1 || lastDotIndex === 0) {
      return ""; // No extension or hidden file without extension
    }
    return filename.substring(lastDotIndex + 1).toLowerCase();
  };

  useEffect(() => {
    const storedUserId = sessionStorage.getItem("userid");
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      setError("User ID not found in session storage");
    }
  }, []);

  useEffect(() => {
    if (!isModalOpen) {
      setSelectedCategory("");
      setSelectedSubCategory("");
      setSelectedDocInfo("");
      setSelectedFile(null);
      setSelectedDate("");
      setError("");
      setSuccess("");
    }
  }, [isModalOpen]);

  console.log(selectedCategory, selectedSubCategory, selectedDocInfo);
  console.log(selectedFile, selectedDate);
  useEffect(() => {
    const fetchCategories = async () => {
      if (!isModalOpen || !userId) return;

      setLoading((prev) => ({ ...prev, categories: true }));
      setError("");
      try {
        const token = sessionStorage.getItem("token");
        const response = await fetch(
          "http://121.242.232.212:8089/itelinc/resources/generic/getdoccat",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ userId: userId }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.statusCode === 200) {
          setCategories(data.data);
        } else {
          setError(
            "Failed to fetch categories: " + (data.message || "Unknown error")
          );
        }
      } catch (err) {
        setError("Error fetching categories: " + err.message);
        console.error("Categories fetch error:", err);
      } finally {
        setLoading((prev) => ({ ...prev, categories: false }));
      }
    };

    if (isModalOpen && userId) {
      fetchCategories();
    }
  }, [isModalOpen, userId]);

  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!selectedCategory || !userId) return;

      setLoading((prev) => ({ ...prev, subCategories: true }));
      setError("");
      setSubCategories([]);
      setSelectedSubCategory("");
      setDocInfos([]);
      setSelectedDocInfo("");

      try {
        const token = sessionStorage.getItem("token");
        const response = await fetch(
          "http://121.242.232.212:8089/itelinc/resources/generic/getdocsubcat",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              userid: userId,
              docid: selectedCategory,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.statusCode === 200) {
          setSubCategories(data.data);
        } else {
          setError(
            "Failed to fetch subcategories: " +
              (data.message || "Unknown error")
          );
        }
      } catch (err) {
        setError("Error fetching subcategories: " + err.message);
        console.error("Subcategories fetch error:", err);
      } finally {
        setLoading((prev) => ({ ...prev, subCategories: false }));
      }
    };

    if (selectedCategory) {
      fetchSubCategories();
    }
  }, [selectedCategory, userId]);

  useEffect(() => {
    const fetchDocInfo = async () => {
      if (!selectedSubCategory || !userId) return;

      setLoading((prev) => ({ ...prev, docInfos: true }));
      setError("");
      setDocInfos([]);
      setSelectedDocInfo("");

      try {
        const token = sessionStorage.getItem("token");
        const response = await fetch(
          "http://121.242.232.212:8089/itelinc/resources/generic/getdocinfo",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              userid: userId,
              doccatid: parseInt(selectedCategory),
              docsubcatid: parseInt(selectedSubCategory),
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.statusCode === 200) {
          setDocInfos(data.data);
        } else {
          setError(
            "Failed to fetch document info: " +
              (data.message || "Unknown error")
          );
        }
      } catch (err) {
        setError("Error fetching document info: " + err.message);
        console.error("Document info fetch error:", err);
      } finally {
        setLoading((prev) => ({ ...prev, docInfos: false }));
      }
    };

    if (selectedSubCategory) {
      fetchDocInfo();
    }
  }, [selectedSubCategory, selectedCategory, userId]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }

      // Optional: Validate file extensions
      const validExtensions = [
        "pdf",
        "png",
        "jpg",
        "jpeg",
        "docx",
        "xls",
        "xlsx",
      ];
      const fileExtension = getFileExtension(file.name);

      if (!validExtensions.includes(fileExtension)) {
        setError(
          `File type not supported. Allowed types: ${validExtensions.join(
            ", "
          )}`
        );
        return;
      }

      setSelectedFile(file);
      setError("");
    }
  };

  // const handleUpload = async () => {
  //   if (
  //     !selectedFile ||
  //     !selectedCategory ||
  //     !selectedSubCategory ||
  //     !selectedDocInfo
  //   ) {
  //     setError("Please fill all fields and select a file");
  //     return;
  //   }

  //   setLoading((prev) => ({ ...prev, uploading: true }));
  //   setError("");
  //   setSuccess("");

  //   try {
  //     const base64 = await convertToBase64(selectedFile);

  //     // Extract file extension
  //     const fileExtension = getFileExtension(selectedFile.name);

  //     const docfordate = selectedDate
  //       ? new Date(selectedDate).toISOString().split("T")[0] + "T00:00:00"
  //       : new Date().toISOString().split("T")[0] + "T00:00:00";

  //     const uploadData = {
  //       filebase64: base64,
  //       userid: usersrecid,
  //       incubaterecid: incubateesrecid,
  //       doccatid: parseInt(selectedCategory),
  //       docsubcatid: parseInt(selectedSubCategory),
  //       docid: parseInt(selectedDocInfo),
  //       docfordate: docfordate,
  //       filetype: fileExtension, // Add the file extension here
  //     };

  //     console.log("Upload data:", uploadData);

  //     const token = sessionStorage.getItem("token");
  //     const response = await fetch(
  //       "http://121.242.232.212:8086/itelinc/resources/generic/adddocument",
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //         body: JSON.stringify(uploadData),
  //       }
  //     );

  //     if (!response.ok) {
  //       const errorMessage =
  //         data?.message || `HTTP error! status: ${response.message}`;

  //       throw new Error(errorMessage);
  //     }

  //     const data = await response.json();
  //     if (data.statusCode === 200) {
  //       setSuccess("Document uploaded successfully!");

  //       // Call the onUploadSuccess callback to refresh the parent component
  //       if (onUploadSuccess) {
  //         await onUploadSuccess();
  //       }

  //       setTimeout(() => {
  //         handleClose();
  //       }, 1500);
  //     } else {
  //       setError("Upload failed: " + (data.message || "Unknown error"));
  //     }
  //   } catch (err) {
  //     setError("Error uploading file: " + (err.message || "Unknown error"));
  //     console.error("Upload error:", err);
  //   } finally {
  //     setLoading((prev) => ({ ...prev, uploading: false }));
  //   }
  // };

  const handleUpload = async () => {
    if (
      !selectedFile ||
      !selectedCategory ||
      !selectedSubCategory ||
      !selectedDocInfo
    ) {
      setError("Please fill all fields and select a file");
      return;
    }

    setLoading((prev) => ({ ...prev, uploading: true }));
    setError("");
    setSuccess("");

    try {
      const base64 = await convertToBase64(selectedFile);

      // Extract file extension
      const fileExtension = getFileExtension(selectedFile.name);

      const docfordate = selectedDate
        ? new Date(selectedDate).toISOString().split("T")[0] + "T00:00:00"
        : new Date().toISOString().split("T")[0] + "T00:00:00";

      const uploadData = {
        filebase64: base64,
        userid: usersrecid,
        incubaterecid: incubateesrecid,
        doccatid: parseInt(selectedCategory),
        docsubcatid: parseInt(selectedSubCategory),
        docid: parseInt(selectedDocInfo),
        docfordate: docfordate,
        filetype: fileExtension, // ✅ added file type
      };

      console.log("Upload data:", uploadData);

      const token = sessionStorage.getItem("token");
      const response = await fetch(
        "http://121.242.232.212:8089/itelinc/resources/generic/adddocument",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(uploadData),
        }
      );

      // Always parse JSON once
      const data = await response.json();

      if (!response.ok) {
        // Use backend's message if available
        const errorMessage =
          data?.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      // ✅ Success flow
      if (data.statusCode === 200) {
        setSuccess(data.message || "Document uploaded successfully!");

        if (onUploadSuccess) {
          await onUploadSuccess();
        }

        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        setError("Upload failed: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      setError("Error uploading file: " + (err.message || "Unknown error"));
      console.error("Upload error:", err);
    } finally {
      setLoading((prev) => ({ ...prev, uploading: false }));
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("dragOver");
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("dragOver");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("dragOver");

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }

      // Validate file extension for drag & drop
      const validExtensions = [
        "pdf",
        "png",
        "jpg",
        "jpeg",
        "docx",
        "xls",
        "xlsx",
      ];
      const fileExtension = getFileExtension(file.name);

      if (!validExtensions.includes(fileExtension)) {
        setError(
          `File type not supported. Allowed types: ${validExtensions.join(
            ", "
          )}`
        );
        return;
      }

      setSelectedFile(file);
      setError("");
    }
  };

  if (!isModalOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Upload Document</h3>
          <button className="close-button" onClick={handleClose}>
            ×
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* Document Category */}
        <div className="form-section">
          <label className="form-label">Select Category</label>
          <select
            className="form-dropdown"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            disabled={loading.categories}
          >
            <option value="">-- Choose Category --</option>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.text}
              </option>
            ))}
          </select>
          {loading.categories && (
            <div className="loading-text">Loading categories...</div>
          )}
        </div>

        {/* Subcategory */}
        {selectedCategory && (
          <div className="form-section">
            <label className="form-label">Select Sub-Category</label>
            <select
              className="form-dropdown"
              value={selectedSubCategory}
              onChange={(e) => setSelectedSubCategory(e.target.value)}
              disabled={loading.subCategories || subCategories.length === 0}
            >
              <option value="">-- Choose Sub-Category --</option>
              {subCategories.map((subCat) => (
                <option key={subCat.value} value={subCat.value}>
                  {subCat.text}
                </option>
              ))}
            </select>
            {loading.subCategories && (
              <div className="loading-text">Loading subcategories...</div>
            )}
          </div>
        )}

        {/* Document Info */}
        {selectedSubCategory && (
          <div className="form-section">
            <label className="form-label">Select Document Type</label>
            <select
              className="form-dropdown"
              value={selectedDocInfo}
              onChange={(e) => setSelectedDocInfo(e.target.value)}
              disabled={loading.docInfos || docInfos.length === 0}
            >
              <option value="">-- Choose Document Type --</option>
              {docInfos.map((docInfo) => (
                <option key={docInfo.value} value={docInfo.value}>
                  {docInfo.text}
                </option>
              ))}
            </select>
            {loading.docInfos && (
              <div className="loading-text">Loading document types...</div>
            )}
            {docInfos.length === 0 && !loading.docInfos && (
              <div className="info-message">
                No document types available for this subcategory
              </div>
            )}
          </div>
        )}

        {/* Date Selector */}
        {selectedDocInfo && (
          <div className="form-section">
            <label className="form-label">Period Of Document</label>
            <input
              type="date"
              className="form-dropdown"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
            />
            {selectedDate && (
              <p className="date-preview">Selected date: {selectedDate}</p>
            )}
          </div>
        )}

        {/* File Upload */}
        {selectedDocInfo && (
          <div className="form-section">
            <label className="form-label">Upload File</label>
            <div
              className="file-drop-area"
              onClick={() => document.getElementById("fileInput").click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="file-selected">
                  <p>Selected file: {selectedFile.name}</p>
                  <p className="file-size">
                    ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB) - Type:{" "}
                    {getFileExtension(selectedFile.name).toUpperCase()}
                  </p>
                </div>
              ) : (
                <div className="file-placeholder">
                  <p>Drag & drop file here or click to select</p>
                  <p className="file-hint">
                    Max file size: 5MB. Supported formats: "pdf", "png", "jpg",
                    "jpeg", "docx", "xls", "xlsx",
                  </p>
                </div>
              )}
              <input
                type="file"
                id="fileInput"
                className="file-input"
                onChange={handleFileSelect}
              />
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="modal-buttons">
          <button
            className="btn-outline"
            onClick={handleClose}
            disabled={loading.uploading}
          >
            Cancel
          </button>
          <button
            className="btn-primary"
            disabled={
              !selectedDocInfo ||
              !selectedFile ||
              loading.uploading ||
              !selectedDate
            }
            onClick={handleUpload}
          >
            {loading.uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 20px;
          box-sizing: border-box;
        }

        .modal-content {
          background: white;
          padding: 24px;
          border-radius: 12px;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eaeaea;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.5rem;
          color: #333;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 1.8rem;
          cursor: pointer;
          color: #999;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-button:hover {
          color: #333;
        }

        .form-section {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          color: #444;
        }

        .form-dropdown {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
          background-color: white;
          transition: border-color 0.2s;
        }

        .form-dropdown:focus {
          outline: none;
          border-color: #4a90e2;
          box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
        }

        .form-dropdown:disabled {
          background-color: #f5f5f5;
          color: #999;
        }

        .date-preview {
          font-size: 0.85rem;
          color: #666;
          margin-top: 5px;
          font-style: italic;
        }

        .file-drop-area {
          border: 2px dashed #ccc;
          border-radius: 8px;
          padding: 25px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
        }

        .file-drop-area:hover,
        .file-drop-area.dragOver {
          border-color: #4a90e2;
          background-color: #f8fbff;
        }

        .file-selected {
          color: #28a745;
        }

        .file-placeholder {
          color: #666;
        }

        .file-size,
        .file-hint {
          font-size: 0.85rem;
          margin-top: 5px;
          color: #888;
        }

        .file-input {
          display: none;
        }

        .modal-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 15px;
          margin-top: 25px;
          padding-top: 15px;
          border-top: 1px solid #eaeaea;
        }

        .btn-primary {
          background-color: #4a90e2;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: background-color 0.2s;
          min-width: 100px;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #3a80d2;
        }

        .btn-primary:disabled {
          background-color: #b3d0f7;
          cursor: not-allowed;
        }

        .btn-outline {
          background-color: transparent;
          color: #666;
          border: 1px solid #ddd;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .btn-outline:hover:not(:disabled) {
          background-color: #f9f9f9;
          border-color: #bbb;
        }

        .btn-outline:disabled {
          color: #ccc;
          cursor: not-allowed;
        }

        .error-message {
          color: #d9534f;
          margin-bottom: 15px;
          padding: 10px;
          background-color: #f8d7da;
          border-radius: 6px;
          border-left: 4px solid #d9534f;
        }

        .success-message {
          color: #28a745;
          margin-bottom: 15px;
          padding: 10px;
          background-color: #d4edda;
          border-radius: 6px;
          border-left: 4px solid #28a745;
        }

        .loading-text {
          color: #666;
          font-size: 0.9rem;
          margin-top: 5px;
        }

        .info-message {
          color: #856404;
          margin-top: 8px;
          padding: 8px;
          background-color: #fff3cd;
          border-radius: 4px;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};

export default DocumentUploadModal;
