import React, { useState, useEffect } from 'react';
import topicsService from '../services/api/topics.service';
import Modal from '../components/Modal';
import { Plus, Search, Edit2, Trash2, BookOpen, Tag, Info } from 'lucide-react';

const Topics = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'programming',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [editingTopicName, setEditingTopicName] = useState(null);
  const [submittingForm, setSubmittingForm] = useState(false);

  // Delete modal
  const [deleteConfirmName, setDeleteConfirmName] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch topics
  const fetchTopics = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (searchQuery) {
        response = await topicsService.search(searchQuery);
        setTopics(Array.isArray(response) ? response : response.data || []);
      } else {
        response = await topicsService.getAll();
        setTopics(Array.isArray(response) ? response : response.data || []);
      }
    } catch (err) {
      setError(err?.message || 'Failed to fetch topics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTopics();
  };

  // Form actions
  const handleOpenCreateModal = () => {
    setFormData({
      name: '',
      category: 'programming',
      description: ''
    });
    setFormErrors({});
    setEditingTopicName(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (topic) => {
    setFormData({
      name: topic.name || '',
      category: topic.category || 'programming',
      description: topic.description || ''
    });
    setFormErrors({});
    setEditingTopicName(topic.name);
    setIsFormOpen(true);
  };

  const handleFormInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Topic Name is required.';
    if (!formData.category.trim()) errors.category = 'Category is required.';
    if (!formData.description.trim()) errors.description = 'Description is required.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmittingForm(true);
    try {
      if (editingTopicName) {
        await topicsService.update(editingTopicName, formData);
      } else {
        await topicsService.create(formData);
      }
      setIsFormOpen(false);
      fetchTopics();
    } catch (err) {
      alert(err?.message || 'Failed to save topic.');
    } finally {
      setSubmittingForm(false);
    }
  };

  // Delete actions
  const handleDeleteTrigger = (name) => {
    setDeleteConfirmName(name);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await topicsService.delete(deleteConfirmName);
      setDeleteConfirmName(null);
      fetchTopics();
    } catch (err) {
      alert(err?.message || 'Failed to delete topic.');
    } finally {
      setDeleting(false);
    }
  };

  // Filtered display based on category select
  const filteredTopics = topics.filter(topic => {
    if (filterCategory && topic.category !== filterCategory) return false;
    return true;
  });

  const uniqueCategories = [...new Set(topics.map(t => t.category))];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Topics Classification</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            Organize coding problems by structures, algorithms, and libraries.
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleOpenCreateModal}>
          <Plus size={14} />
          <span>New Topic</span>
        </button>
      </div>

      {/* Filters Bar */}
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
                placeholder="Search topics..."
                className="form-input"
                style={{ paddingLeft: '2.1rem', height: '34px', fontSize: '0.8rem' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="form-input"
              style={{ width: '150px', height: '34px', fontSize: '0.8rem' }}
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn btn-secondary btn-sm" style={{ height: '34px' }}>
              Search
            </button>
            {(searchQuery || filterCategory) && (
              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                style={{ height: '34px', color: 'var(--danger)' }}
                onClick={() => { setSearchQuery(''); setFilterCategory(''); }}
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Main Grid Content */}
      {loading ? (
        <div style={{ display: 'flex', height: '35vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Loading topics...</p>
        </div>
      ) : error ? (
        <div className="empty-state" style={{ borderColor: 'var(--danger-light)' }}>
          <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</p>
          <button className="btn btn-secondary btn-sm" style={{ marginTop: '0.75rem' }} onClick={fetchTopics}>Retry</button>
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontSize: '0.85rem' }}>No topics discovered. Click "New Topic" to add catalog keys.</p>
        </div>
      ) : (
        <div className="grid-cols-3">
          {filteredTopics.map((topic) => (
            <div key={topic._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: '160px', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <div style={{ padding: '0.3rem', borderRadius: '4px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex' }}>
                    <BookOpen size={14} />
                  </div>
                  <h3 style={{ fontSize: '0.9rem', margin: 0, fontWeight: 700 }}>{topic.name}</h3>
                </div>
                <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{topic.category}</span>
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', flex: 1, lineHeight: 1.4 }}>
                {topic.description}
              </p>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Views: {topic.views || 0}</span>
                
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button 
                    className="btn btn-secondary btn-sm" 
                    style={{ padding: '0.25rem' }}
                    onClick={() => handleOpenEditModal(topic)}
                    title="Edit Topic"
                  >
                    <Edit2 size={11} />
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm" 
                    style={{ padding: '0.25rem', color: 'var(--danger)' }}
                    onClick={() => handleDeleteTrigger(topic.name)}
                    title="Delete Topic"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE & EDIT FORM MODAL */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingTopicName ? 'Edit Topic Settings' : 'Add New Topic Category'}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Topic Name</label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-input"
              placeholder="e.g. Dynamic Programming"
              value={formData.name}
              onChange={handleFormInputChange}
              disabled={!!editingTopicName}
            />
            {formErrors.name && <div className="form-error">{formErrors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="category">Category Classification</label>
            <input
              id="category"
              name="category"
              type="text"
              className="form-input"
              placeholder="e.g. Algorithms"
              value={formData.category}
              onChange={handleFormInputChange}
            />
            {formErrors.category && <div className="form-error">{formErrors.category}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">Short description</label>
            <textarea
              id="description"
              name="description"
              rows="3"
              className="form-input"
              placeholder="Describe what programming techniques fall under this topic..."
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
              {submittingForm ? 'Saving...' : 'Save Topic'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={!!deleteConfirmName}
        onClose={() => setDeleteConfirmName(null)}
        title="Confirm Topic Deletion"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.875rem' }}>Are you sure you want to permanently delete topic <strong>{deleteConfirmName}</strong>? This operation cannot be undone.</p>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={() => setDeleteConfirmName(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDeleteConfirm} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default Topics;
