import React, { useState, useEffect } from 'react';
import datasetsService from '../services/api/datasets.service';
import problemsService from '../services/api/problems.service';
import Modal from '../components/Modal';
import { Plus, Search, Edit2, Trash2, Database, Upload, Code, Check } from 'lucide-react';

const Datasets = () => {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');

  // Bulk import modal
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [importStatus, setImportStatus] = useState(null); // null, success, error
  const [importMessage, setImportMessage] = useState('');
  const [importing, setImporting] = useState(false);

  // CRUD states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    source: '',
    topic: '',
    difficulty: 'medium',
    totalProblems: 0,
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [editingDatasetId, setEditingDatasetId] = useState(null);
  const [submittingForm, setSubmittingForm] = useState(false);

  // Delete modal
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch datasets
  const fetchDatasets = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (searchQuery) {
        response = await datasetsService.search(searchQuery);
        setDatasets(Array.isArray(response) ? response : response.data || []);
      } else {
        response = await datasetsService.getAll();
        setDatasets(Array.isArray(response) ? response : response.data || []);
      }
    } catch (err) {
      setError(err?.message || 'Failed to retrieve datasets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDatasets();
  };

  // Bulk Import
  const handleBulkImportSubmit = async (e) => {
    e.preventDefault();
    setImportStatus(null);
    setImportMessage('');
    setImporting(true);

    try {
      // Validate JSON format
      const parsedData = JSON.parse(jsonInput);
      if (!Array.isArray(parsedData)) {
        throw new Error('JSON input must be an array of problem objects.');
      }
      
      const res = await problemsService.importJson(parsedData);
      setImportStatus('success');
      setImportMessage(`Successfully imported ${res.count || res.insertedCount || parsedData.length} challenges!`);
      setJsonInput('');
      fetchDatasets();
      setTimeout(() => {
        setIsImportOpen(false);
        setImportStatus(null);
      }, 2500);
    } catch (err) {
      setImportStatus('error');
      setImportMessage(err?.message || 'Failed to parse or upload JSON. Ensure structure matches problem schema.');
    } finally {
      setImporting(false);
    }
  };

  // CRUD actions
  const handleOpenCreateModal = () => {
    setFormData({
      source: '',
      topic: '',
      difficulty: 'medium',
      totalProblems: 0,
      description: ''
    });
    setFormErrors({});
    setEditingDatasetId(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (dataset) => {
    setFormData({
      source: dataset.source || '',
      topic: dataset.topic || '',
      difficulty: dataset.difficulty || 'medium',
      totalProblems: dataset.totalProblems || 0,
      description: dataset.description || ''
    });
    setFormErrors({});
    setEditingDatasetId(dataset._id);
    setIsFormOpen(true);
  };

  const handleFormInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalProblems' ? parseInt(value, 10) || 0 : value
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.source.trim()) errors.source = 'Dataset Source Tag is required.';
    if (!formData.topic.trim()) errors.topic = 'Topic Category is required.';
    if (!formData.description.trim()) errors.description = 'Description is required.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmittingForm(true);
    try {
      if (editingDatasetId) {
        await datasetsService.update(editingDatasetId, formData);
      } else {
        await datasetsService.create(formData);
      }
      setIsFormOpen(false);
      fetchDatasets();
    } catch (err) {
      alert(err?.message || 'Failed to save dataset metadata.');
    } finally {
      setSubmittingForm(false);
    }
  };

  // Delete actions
  const handleDeleteTrigger = (id) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await datasetsService.delete(deleteConfirmId);
      setDeleteConfirmId(null);
      fetchDatasets();
    } catch (err) {
      alert(err?.message || 'Failed to delete dataset.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* Header with actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Dataset Archives</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            Browse metadata archives and seed database challenges via bulk imports.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setIsImportOpen(true)}>
            <Upload size={14} />
            <span>Import JSON</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleOpenCreateModal}>
            <Plus size={14} />
            <span>New Dataset</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '0.75rem 1rem' }}>
        <form onSubmit={handleSearchSubmit} className="filters-bar" style={{ margin: 0 }}>
          <div className="filter-inputs">
            <div style={{ position: 'relative', minWidth: '220px' }}>
              <Search 
                size={14} 
                style={{ 
                  position: 'absolute', 
                  left: '10px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'var(--text-tertiary)' 
                }} 
              />
              <input
                type="text"
                placeholder="Search datasets..."
                className="form-input"
                style={{ paddingLeft: '2.1rem', height: '34px', fontSize: '0.8rem' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn btn-secondary btn-sm" style={{ height: '34px' }}>Search</button>
            {searchQuery && (
              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                style={{ height: '34px', color: 'var(--danger)' }}
                onClick={() => { setSearchQuery(''); fetchDatasets(); }}
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Main Table Content */}
      {loading ? (
        <div style={{ display: 'flex', height: '35vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Loading datasets...</p>
        </div>
      ) : error ? (
        <div className="empty-state" style={{ borderColor: 'var(--danger-light)' }}>
          <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</p>
          <button className="btn btn-secondary btn-sm" style={{ marginTop: '0.75rem' }} onClick={fetchDatasets}>Retry</button>
        </div>
      ) : datasets.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontSize: '0.85rem' }}>No datasets cataloged. Click "New Dataset" or upload JSON array.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Source Name</th>
                <th>Topic Category</th>
                <th>Difficulty</th>
                <th>Count Problems</th>
                <th>Description</th>
                <th style={{ textAlign: 'right', width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {datasets.map((dataset) => (
                <tr key={dataset._id}>
                  <td style={{ fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Database size={14} style={{ color: 'var(--primary)' }} />
                      <span>{dataset.source}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{dataset.topic}</span>
                  </td>
                  <td>
                    <span className={`badge ${
                      dataset.difficulty === 'easy' 
                        ? 'badge-success' 
                        : dataset.difficulty === 'medium' 
                          ? 'badge-warning' 
                          : 'badge-danger'
                    }`} style={{ fontSize: '0.675rem' }}>
                      {dataset.difficulty}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{dataset.totalProblems || 0}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {dataset.description}
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        style={{ padding: '0.3rem' }} 
                        onClick={() => handleOpenEditModal(dataset)}
                        title="Edit Metadata"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        style={{ padding: '0.3rem', color: 'var(--danger)' }} 
                        onClick={() => handleDeleteTrigger(dataset._id)}
                        title="Delete Dataset"
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

      {/* CREATE & EDIT DATASET MODAL */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingDatasetId ? 'Edit Dataset Archives' : 'Catalog New Dataset'}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="source">Dataset Source Tag</label>
            <input
              id="source"
              name="source"
              type="text"
              className="form-input"
              placeholder="e.g. leetcode-top-100"
              value={formData.source}
              onChange={handleFormInputChange}
            />
            {formErrors.source && <div className="form-error">{formErrors.source}</div>}
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label" htmlFor="topic">Topic Area</label>
              <input
                id="topic"
                name="topic"
                type="text"
                className="form-input"
                placeholder="e.g. Arrays"
                value={formData.topic}
                onChange={handleFormInputChange}
              />
              {formErrors.topic && <div className="form-error">{formErrors.topic}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="difficulty">Difficulty Category</label>
              <select
                id="difficulty"
                name="difficulty"
                className="form-input"
                value={formData.difficulty}
                onChange={handleFormInputChange}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="totalProblems">Total problems count</label>
            <input
              id="totalProblems"
              name="totalProblems"
              type="number"
              className="form-input"
              value={formData.totalProblems}
              onChange={handleFormInputChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">Short description</label>
            <textarea
              id="description"
              name="description"
              rows="3"
              className="form-input"
              placeholder="Brief summary describing the database context..."
              value={formData.description}
              onChange={handleFormInputChange}
            ></textarea>
            {formErrors.description && <div className="form-error">{formErrors.description}</div>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submittingForm}>
              {submittingForm ? 'Saving...' : 'Catalog Dataset'}
            </button>
          </div>
        </form>
      </Modal>

      {/* BULK IMPORT MODAL */}
      <Modal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        title="Bulk Import Challenges JSON"
      >
        <form onSubmit={handleBulkImportSubmit}>
          <div style={{ marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Paste a JSON array containing problem objects. Properties required: <code>instruction</code>, <code>topic</code>, and <code>difficulty</code>.
          </div>

          {importMessage && (
            <div 
              style={{ 
                padding: '0.5rem 0.75rem', 
                backgroundColor: importStatus === 'success' ? 'var(--success-light)' : 'var(--danger-light)', 
                color: importStatus === 'success' ? 'var(--success)' : 'var(--danger)', 
                borderRadius: '4px',
                fontSize: '0.75rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem'
              }}
            >
              {importStatus === 'success' ? <Check size={14} /> : <span style={{ fontWeight: 'bold' }}>!</span>}
              <span>{importMessage}</span>
            </div>
          )}

          <div className="form-group">
            <textarea
              rows="8"
              className="form-input"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.725rem' }}
              placeholder={`[
  {
    "instruction": "Reverse a String",
    "topic": "Strings",
    "difficulty": "easy",
    "output": "reverseString('hello') => 'olleh'",
    "source": "leetcode-top-100"
  }
]`}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              required
            ></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsImportOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={importing || !jsonInput}>
              {importing ? 'Importing...' : 'Upload & Seed'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Confirm Dataset Deletion"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.875rem' }}>Are you sure you want to permanently delete this dataset metadata record? This operation cannot be undone.</p>
          
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

export default Datasets;
