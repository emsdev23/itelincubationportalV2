import React, { useState, useEffect } from "react";

export default function DocCatModal({ isOpen, onClose, onSave, editData }) {
  const [formData, setFormData] = useState({
    doccatname: "",
    doccatdescription: "",
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        doccatname: editData.doccatname,
        doccatdescription: editData.doccatdescription,
      });
    }
  }, [editData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      doccatrecid: editData?.doccatrecid,    // include ID for updates
      doccatmodifiedby: "system",            // required by backend
    });
  };

  if (!isOpen) return null;

  return (
    <div className="doccat-modal-backdrop">
      <div className="doccat-modal-content">
        <div className="doccat-modal-header">
          <h3>{editData ? "Edit Category" : "Add Category"}</h3>
          <button className="btn-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <form className="doccat-form" onSubmit={handleSubmit}>
          <label>
            Category Name
            <input
              type="text"
              name="doccatname"
              value={formData.doccatname}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Description
            <textarea
              name="doccatdescription"
              value={formData.doccatdescription}
              onChange={handleChange}
              required
            />
          </label>
          <div className="doccat-form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save">
              {editData ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
