import React, { useState, useEffect } from 'react';
import adminService from '../services/api/admin.service';
import Modal from '../components/Modal';
import { Plus, User, Shield, Trash2, Edit2 } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [formErrors, setFormErrors] = useState({});
  const [editingUserId, setEditingUserId] = useState(null);
  const [submittingForm, setSubmittingForm] = useState(false);

  // Delete modal
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch users list
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getUsers();
      setUsers(Array.isArray(res) ? res : res.data || res.users || []);
    } catch (err) {
      setError(err?.message || 'Failed to fetch registered user list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Form handlers
  const handleOpenCreateModal = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'user'
    });
    setFormErrors({});
    setEditingUserId(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (userItem) => {
    setFormData({
      name: userItem.name || '',
      email: userItem.email || '',
      password: '',
      role: userItem.role || 'user'
    });
    setFormErrors({});
    setEditingUserId(userItem._id);
    setIsFormOpen(true);
  };

  const handleFormInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full Name is required.';
    if (!formData.email.trim()) errors.email = 'Email Address is required.';
    if (!editingUserId && !formData.password.trim()) {
      errors.password = 'Password is required when creating accounts.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmittingForm(true);
    try {
      if (editingUserId) {
        const payload = { name: formData.name, email: formData.email, role: formData.role };
        if (formData.password) payload.password = formData.password;
        
        await adminService.updateUser(editingUserId, payload);
      } else {
        await adminService.createUser(formData);
      }
      setIsFormOpen(false);
      fetchUsers();
    } catch (err) {
      alert(err?.message || 'Failed to submit user details.');
    } finally {
      setSubmittingForm(false);
    }
  };

  // Delete handlers
  const handleDeleteTrigger = (id) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await adminService.deleteUser(deleteConfirmId);
      setDeleteConfirmId(null);
      fetchUsers();
    } catch (err) {
      alert(err?.message || 'Failed to delete user.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>User Accounts Manager</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            List, create, update permission roles, and delete platform member accounts.
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleOpenCreateModal}>
          <Plus size={14} />
          <span>Add Account</span>
        </button>
      </div>

      {/* Main Table Content */}
      {loading ? (
        <div style={{ display: 'flex', height: '35vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Retrieving user profiles...</p>
        </div>
      ) : error ? (
        <div className="empty-state" style={{ borderColor: 'var(--danger-light)' }}>
          <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</p>
          <button className="btn btn-secondary btn-sm" style={{ marginTop: '0.75rem' }} onClick={fetchUsers}>Retry</button>
        </div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontSize: '0.85rem' }}>No user accounts found.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Profile Name</th>
                <th>Email Address</th>
                <th>Role Rank</th>
                <th>Registered At</th>
                <th style={{ textAlign: 'right', width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((userItem) => (
                <tr key={userItem._id}>
                  <td style={{ fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>
                        {userItem.name?.substring(0, 2).toUpperCase()}
                      </div>
                      <span>{userItem.name}</span>
                    </div>
                  </td>
                  <td>{userItem.email}</td>
                  <td>
                    <span className={`badge ${userItem.role === 'admin' ? 'badge-danger' : 'badge-info'}`} style={{ fontSize: '0.675rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {userItem.role === 'admin' ? <Shield size={10} /> : <User size={10} />}
                        <span>{userItem.role}</span>
                      </span>
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    {userItem.createdAt ? new Date(userItem.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        style={{ padding: '0.3rem' }} 
                        onClick={() => handleOpenEditModal(userItem)}
                        title="Edit User"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        style={{ padding: '0.3rem', color: 'var(--danger)' }} 
                        onClick={() => handleDeleteTrigger(userItem._id)}
                        title="Delete User"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE & EDIT FORM MODAL */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingUserId ? 'Edit Account Permissions' : 'Register New Platform Member'}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Display Name</label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-input"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={handleFormInputChange}
              required
            />
            {formErrors.name && <div className="form-error">{formErrors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder="name@domain.com"
              value={formData.email}
              onChange={handleFormInputChange}
              required
            />
            {formErrors.email && <div className="form-error">{formErrors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              {editingUserId ? 'New Password (Optional)' : 'Password Credentials'}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder={editingUserId ? 'Leave blank to retain current password' : '••••••••'}
              value={formData.password}
              onChange={handleFormInputChange}
              required={!editingUserId}
            />
            {formErrors.password && <div className="form-error">{formErrors.password}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="role">Platform Rank Role</label>
            <select
              id="role"
              name="role"
              className="form-input"
              value={formData.role}
              onChange={handleFormInputChange}
            >
              <option value="user">Regular Contributor (User)</option>
              <option value="admin">Platform Manager (Admin)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submittingForm}>
              {submittingForm ? 'Saving Account...' : 'Save Member'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Confirm User Deletion"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.875rem' }}>Are you sure you want to permanently delete this user profile? The user will instantly lose authorization access.</p>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDeleteConfirm} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default AdminUsers;
