import React, { useState, useEffect, useMemo } from "react";
import { FaTrash, FaEdit, FaUsers, FaTimes, FaPlus, FaSpinner } from "react-icons/fa";
import Swal from "sweetalert2";
import "./UserAssociationTable.css";

export default function UserAssociationTable() {
  const userId = sessionStorage.getItem("userid");
  const token = sessionStorage.getItem("token");
  const IP = "http://121.242.232.212:8089";
  const LOCAL_IP = "http://localhost:8086"; // Added for local development
  
  const [associations, setAssociations] = useState([]);
  const [incubatees, setIncubatees] = useState([]);
  const [users, setUsers] = useState([]); // For user selection
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [selectedIncubatees, setSelectedIncubatees] = useState([]);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [showNewAssociationModal, setShowNewAssociationModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedIncubateesForNew, setSelectedIncubateesForNew] = useState([]);
  const [deletingId, setDeletingId] = useState(null); // Track which association is being deleted
  const [isDeleting, setIsDeleting] = useState(false); // Track if delete operation is in progress

  // Fetch user associations
  const fetchAssociations = () => {
    setLoading(true);
    setError(null);
    
    fetch(`${IP}/itelinc/resources/generic/getuserasslist`, {
      method: "POST",
      mode: "cors",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId || null
      })
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.statusCode === 200) {
          setAssociations(data.data || []);
        } else {
          throw new Error(data.message || "Failed to fetch user associations");
        }
      })
      .catch((err) => {
        console.error("Error fetching user associations:", err);
        setError("Failed to load user associations. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  // Fetch incubatees list
  const fetchIncubatees = () => {
    fetch(`${IP}/itelinc/resources/generic/getinclist`, {
      method: "POST",
      mode: "cors",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId || null
      })
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.statusCode === 200) {
          setIncubatees(data.data || []);
        } else {
          throw new Error(data.message || "Failed to fetch incubatees");
        }
      })
      .catch((err) => {
        console.error("Error fetching incubatees:", err);
        Swal.fire("❌ Error", "Failed to load incubatees", "error");
      });
  };

  // Fetch unassociated users list for new association
  const fetchUsers = () => {
    fetch(`${LOCAL_IP}/itelinc/getUserUnassociated`, {
      method: "POST",
      mode: "cors",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId || 32
      })
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.statusCode === 200) {
          setUsers(data.data || []);
        } else {
          throw new Error(data.message || "Failed to fetch users");
        }
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        Swal.fire("❌ Error", "Failed to load users", "error");
        // Fallback to empty array if fetch fails
        setUsers([]);
      });
  };

  useEffect(() => {
    fetchAssociations();
    fetchIncubatees();
    fetchUsers(); // Fetch users on component mount
  }, []);

  // Normalize the associations data to handle both associated and unassociated users
  const normalizedData = useMemo(() => {
    const userMap = {};
    
    associations.forEach(item => {
      // Check if this is an associated user (has usrincassnrecid)
      if (item.usrincassnrecid) {
        const userId = item.usrincassnusersrecid;
        if (!userMap[userId]) {
          userMap[userId] = {
            usersrecid: userId,
            usersname: item.usersname,
            userscreatedby: item.userscreatedby, // Add this field
            associations: []
          };
        }
        userMap[userId].associations.push({
          usrincassnrecid: item.usrincassnrecid,
          incubateesname: item.incubateesname,
          usrincassncreatedtime: item.usrincassncreatedtime,
          usrincassncreatedbyname: item.usrincassncreatedby,
          usrincassnmodifiedtime: item.usrincassnmodifiedtime,
          usrincassnincubateesrecid: item.usrincassnincubateesrecid
        });
      } 
      // This is an unassociated user (only has usersrecid and usersname)
      else {
        const userId = item.usersrecid;
        if (!userMap[userId]) {
          userMap[userId] = {
            usersrecid: userId,
            usersname: item.usersname,
            userscreatedby: item.userscreatedby || "N/A", // Add this field with fallback
            associations: []
          };
        }
      }
    });
    
    return Object.values(userMap);
  }, [associations]);

  // Start editing a user's incubatees
  const startEditing = (user) => {
    setEditingUserId(user.usersrecid);
    
    // Get currently selected incubatees for this user
    const userIncubatees = user.associations.map(assoc => assoc.usrincassnincubateesrecid);
    setSelectedIncubatees(userIncubatees);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingUserId(null);
    setSelectedIncubatees([]);
  };

  // Cancel new association
  const cancelNewAssociation = () => {
    setShowNewAssociationModal(false);
    setSelectedUser("");
    setSelectedIncubateesForNew([]);
  };

  // Handle checkbox change for edit modal
  const handleCheckboxChange = (incubateeId) => {
    setSelectedIncubatees(prev => {
      if (prev.includes(incubateeId)) {
        return prev.filter(id => id !== incubateeId);
      } else {
        return [...prev, incubateeId];
      }
    });
  };

  // Handle checkbox change for new association modal
  const handleNewCheckboxChange = (incubateeId) => {
    setSelectedIncubateesForNew(prev => {
      if (prev.includes(incubateeId)) {
        return prev.filter(id => id !== incubateeId);
      } else {
        return [...prev, incubateeId];
      }
    });
  };

  // Handle user selection for new association
  const handleUserChange = (e) => {
    setSelectedUser(e.target.value);
  };

  // Update user associations using the same API as create
  const updateAssociations = () => {
    if (!editingUserId) return;
    
    setUpdateLoading(true);
    
    // Get current associations for this user
    const currentUserAssociations = associations.filter(
      assoc => assoc.usrincassnusersrecid === editingUserId
    );
    
    // Get current incubatee IDs for this user
    const currentIncubateeIds = currentUserAssociations.map(
      assoc => assoc.usrincassnincubateesrecid
    );
    
    // Determine which incubatees to add and which to remove
    const toAdd = selectedIncubatees.filter(id => !currentIncubateeIds.includes(id));
    const toRemove = currentUserAssociations.filter(
      assoc => !selectedIncubatees.includes(assoc.usrincassnincubateesrecid)
    );
    
    // Create promises for adding new associations
    const addPromises = toAdd.map(incubateeId => {
      const url = `${IP}/itelinc/addUserIncubationAssociation?usrincassnusersrecid=${editingUserId}&usrincassnincubateesrecid=${incubateeId}&usrincassncreatedby=${userId || "1"}&usrincassnmodifiedby=${userId || "1"}&usrincassnadminstate=1`;
      
      return fetch(url, {
        method: "POST",
        mode: "cors",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (data.statusCode !== 200) {
          throw new Error(data.message || "Failed to add association");
        }
        return { success: true, incubateeId, action: "add" };
      })
      .catch(error => {
        return { success: false, incubateeId, action: "add", error: error.message };
      });
    });
    
    // Create promises for removing associations
    const removePromises = toRemove.map(association => {
      const url = `${IP}/itelinc/deleteUserIncubationAssociation?usrincassnmodifiedby=${userId || "1"}&usrincassnrecid=${association.usrincassnrecid}`;
      
      return fetch(url, {
        method: "POST",
        mode: "cors",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({})
      })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (data.statusCode !== 200) {
          throw new Error(data.message || "Failed to remove association");
        }
        return { success: true, associationId: association.usrincassnrecid, action: "remove" };
      })
      .catch(error => {
        return { success: false, associationId: association.usrincassnrecid, action: "remove", error: error.message };
      });
    });
    
    // Combine all promises
    const allPromises = [...addPromises, ...removePromises];
    
    // Wait for all promises to complete
    Promise.all(allPromises).then(results => {
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      
      if (failed.length === 0) {
        Swal.fire("✅ Success", "User associations updated successfully!", "success");
        fetchAssociations();
        cancelEditing();
      } else if (successful.length > 0) {
        const errorMessages = failed.map(f => {
          if (f.action === "add") {
            return `Failed to add incubatee ${f.incubateeId}: ${f.error}`;
          } else {
            return `Failed to remove association ${f.associationId}: ${f.error}`;
          }
        }).join('<br>');
        
        Swal.fire({
          title: "⚠️ Partial Success",
          html: `${successful.length} operations succeeded, but ${failed.length} failed.<br><br>${errorMessages}`,
          icon: "warning"
        });
        fetchAssociations();
        cancelEditing();
      } else {
        const errorMessages = failed.map(f => {
          if (f.action === "add") {
            return `Failed to add incubatee ${f.incubateeId}: ${f.error}`;
          } else {
            return `Failed to remove association ${f.associationId}: ${f.error}`;
          }
        }).join('<br>');
        
        Swal.fire({
          title: "❌ Error",
          html: `All operations failed.<br><br>${errorMessages}`,
          icon: "error"
        });
      }
    })
    .catch(err => {
      console.error("Error updating user associations:", err);
      Swal.fire("❌ Error", "Failed to update user associations", "error");
    })
    .finally(() => {
      setUpdateLoading(false);
    });
  };

  // Create new user association
  const createNewAssociation = () => {
    if (!selectedUser || selectedIncubateesForNew.length === 0) {
      Swal.fire("❌ Error", "Please select a user and at least one incubatee", "error");
      return;
    }
    
    setUpdateLoading(true);
    
    // Create an array of promises for each incubatee
    const promises = selectedIncubateesForNew.map(incubateeId => {
      const url = `${IP}/itelinc/addUserIncubationAssociation?usrincassnusersrecid=${selectedUser}&usrincassnincubateesrecid=${incubateeId}&usrincassncreatedby=${userId || "1"}&usrincassnmodifiedby=${userId || "1"}&usrincassnadminstate=1`;
      
      return fetch(url, {
        method: "POST",
        mode: "cors",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (data.statusCode !== 200) {
          throw new Error(data.message || "Failed to create association");
        }
        return { success: true, incubateeId };
      })
      .catch(error => {
        return { success: false, incubateeId, error: error.message };
      });
    });

    // Wait for all promises to complete
    Promise.all(promises).then(results => {
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      if (failed.length === 0) {
        Swal.fire("✅ Success", "All user associations created successfully!", "success");
        fetchAssociations();
        cancelNewAssociation();
      } else if (successful.length > 0) {
        const errorMessages = failed.map(f => `Incubatee ${f.incubateeId}: ${f.error}`).join('<br>');
        Swal.fire({
          title: "⚠️ Partial Success",
          html: `${successful.length} associations created successfully, but ${failed.length} failed.<br><br>${errorMessages}`,
          icon: "warning"
        });
        fetchAssociations();
        cancelNewAssociation();
      } else {
        const errorMessages = failed.map(f => `Incubatee ${f.incubateeId}: ${f.error}`).join('<br>');
        Swal.fire({
          title: "❌ Error",
          html: `Failed to create any user associations.<br><br>${errorMessages}`,
          icon: "error"
        });
      }
    })
    .catch(err => {
      console.error("Error creating user associations:", err);
      Swal.fire("❌ Error", "Failed to create user associations", "error");
    })
    .finally(() => {
      setUpdateLoading(false);
    });
  };

  // Delete association
  const handleDelete = (associationId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This association will be deleted permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      showLoaderOnConfirm: true,
      preConfirm: () => {
        setIsDeleting(true);
        const url = `${IP}/itelinc/deleteUserIncubationAssociation?usrincassnmodifiedby=${userId || "1"}&usrincassnrecid=${associationId}`;
        
        return fetch(url, {
          method: "POST",
          mode: "cors",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}) // Empty body as required parameters are in URL
        })
          .then((res) => {
            if (!res.ok) {
              throw new Error(`HTTP error! Status: ${res.status}`);
            }
            return res.json();
          })
          .then((data) => {
            if (data.statusCode === 200) {
              return data;
            } else {
              throw new Error(data.message || "Failed to delete association");
            }
          })
          .catch((error) => {
            Swal.showValidationMessage(`Request failed: ${error.message}`);
          })
          .finally(() => {
            setIsDeleting(false);
          });
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("Deleted!", "Association deleted successfully!", "success");
        fetchAssociations();
      }
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="user-association-container">
      <div className="user-association-header">
        <h1 className="user-association-title"><FaUsers style={{ marginRight: "8px" }} />Operator–Incubatee Associations list</h1>
        <button 
          className="btn-new-association"
          onClick={() => setShowNewAssociationModal(true)}
        >
          <FaPlus size={14} /> Associate New Operator
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <p className="user-association-empty">Loading user associations...</p>
      ) : (
        <div className="user-association-table-wrapper">
          {normalizedData.map((user) => (
            <div key={user.usersrecid} className="user-association-group">
              <div className="user-association-group-header">
                <div className="user-info">
                  <h3 className="user-association-group-title">
                    {user.usersname}
                  </h3>
                  <span className="user-association-createdby">
                    Created by: {user.userscreatedby}
                  </span>
                </div>
                <button
                  className="btn-edit"
                  onClick={() => startEditing(user)}
                >
                  <FaEdit size={18} />
                </button>
              </div>
              
              {/* Scrollable container for incubatees */}
              <div className="user-association-scrollable-container">
                {user.associations.length > 0 ? (
                  user.associations.map((association) => (
                    <div key={association.usrincassnrecid} className="user-association-item">
                      <div className="user-association-details">
                        <div className="user-association-main">
                          <span className="user-association-incubatee">
                            {association.incubateesname}
                          </span>
                          <span className="user-association-dates">
                            Created: {formatDate(association.usrincassncreatedtime)}
                          </span>
                          <span className="user-association-createdby">
                            Associated by: {association.usrincassncreatedbyname || "N/A"}
                          </span>
                        </div>
                      </div>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(association.usrincassnrecid)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <FaSpinner className="spinner" size={16} />
                        ) : (
                          <FaTrash size={16} />
                        )}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="user-association-empty">
                    No incubatees associated
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {normalizedData.length === 0 && (
            <div className="user-association-empty">
              No users found
            </div>
          )}
        </div>
      )}
      
      {/* Edit Modal */}
      {editingUserId && (
        <div className="user-association-modal-backdrop">
          <div className="user-association-modal-content">
            <div className="user-association-modal-header">
              <h3>Edit User Associations</h3>
              <button className="btn-close" onClick={cancelEditing}>
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className="user-association-modal-body">
              <h4>Select Incubatees:</h4>
              <div className="incubatees-checklist">
                {incubatees.map(incubatee => (
                  <div key={incubatee.incubateesrecid} className="incubatee-checkbox-item">
                    <input
                      type="checkbox"
                      id={`incubatee-${incubatee.incubateesrecid}`}
                      checked={selectedIncubatees.includes(incubatee.incubateesrecid)}
                      onChange={() => handleCheckboxChange(incubatee.incubateesrecid)}
                      disabled={updateLoading}
                    />
                    <label htmlFor={`incubatee-${incubatee.incubateesrecid}`}>
                      {incubatee.incubateesname}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="user-association-modal-footer">
              <button className="btn-cancel" onClick={cancelEditing} disabled={updateLoading}>
                Cancel
              </button>
              <button 
                className="btn-save" 
                onClick={updateAssociations}
                disabled={updateLoading}
              >
                {updateLoading ? (
                  <>
                    <FaSpinner className="spinner" size={14} /> Updating...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
            
            {/* Loading overlay for edit modal */}
            {updateLoading && (
              <div className="modal-loading-overlay">
                <div className="modal-loading-spinner">
                  <FaSpinner className="spinner" size={24} />
                  <p>Updating associations...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* New Association Modal */}
      {showNewAssociationModal && (
        <div className="user-association-modal-backdrop">
          <div className="user-association-modal-content">
            <div className="user-association-modal-header">
              <h3>Associate New Operator</h3>
              <button className="btn-close" onClick={cancelNewAssociation}>
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className="user-association-modal-body">
              <div className="form-group">
                <label htmlFor="user-select">Select User:</label>
                <select 
                  id="user-select" 
                  className="user-select"
                  value={selectedUser}
                  onChange={handleUserChange}
                  disabled={updateLoading}
                >
                  <option value="">-- Select User --</option>
                  {users.map(user => (
                    <option key={user.usersrecid} value={user.usersrecid}>
                      {user.usersname}
                    </option>
                  ))}
                </select>
              </div>
              
              <h4>Select Incubatees:</h4>
              <div className="incubatees-checklist">
                {incubatees.map(incubatee => (
                  <div key={incubatee.incubateesrecid} className="incubatee-checkbox-item">
                    <input
                      type="checkbox"
                      id={`new-incubatee-${incubatee.incubateesrecid}`}
                      checked={selectedIncubateesForNew.includes(incubatee.incubateesrecid)}
                      onChange={() => handleNewCheckboxChange(incubatee.incubateesrecid)}
                      disabled={updateLoading}
                    />
                    <label htmlFor={`new-incubatee-${incubatee.incubateesrecid}`}>
                      {incubatee.incubateesname}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="user-association-modal-footer">
              <button className="btn-cancel" onClick={cancelNewAssociation} disabled={updateLoading}>
                Cancel
              </button>
              <button 
                className="btn-save" 
                onClick={createNewAssociation}
                disabled={updateLoading}
              >
                {updateLoading ? (
                  <>
                    <FaSpinner className="spinner" size={14} /> Creating...
                  </>
                ) : (
                  "Create Association"
                )}
              </button>
            </div>
            
            {/* Loading overlay for new association modal */}
            {updateLoading && (
              <div className="modal-loading-overlay">
                <div className="modal-loading-spinner">
                  <FaSpinner className="spinner" size={24} />
                  <p>Creating associations...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}