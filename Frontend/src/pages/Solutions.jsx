import React, { useState, useEffect } from 'react';
import solutionsService from '../services/api/solutions.service';
import topicsService from '../services/api/topics.service';
import Modal from '../components/Modal';
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Code,
  FileCode,
  Layers,
  Sparkles
} from 'lucide-react';

const Solutions = () => {
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  const [topicsList, setTopicsList] = useState([]);

  // Detail modal
  const [detailSolution, setDetailSolution] = useState(null);

  // Form modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    instruction: '',
    topic: '',
    difficulty: 'medium',
    output: '',
    dataset_source: 'leetcode-top-100',
    problem_number: '',
    url: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [editingSolutionId, setEditingSolutionId] = useState(null);
  const [submittingForm, setSubmittingForm] = useState(false);

  // Delete modal
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch topics list
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await topicsService.getAll();
        setTopicsList(Array.isArray(res) ? res : res.data || []);
      } catch (err) {
        console.warn('Failed to load filter topics', err);
      }
    };
    fetchTopics();
  }, []);

  // Fetch solutions list
  const fetchSolutions = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      const params = {};
      if (filterDifficulty) params.difficulty = filterDifficulty;
      if (filterTopic) params.topic = filterTopic;

      if (searchQuery) {
        response = await solutionsService.search(searchQuery);
        setSolutions(Array.isArray(response) ? response : response.data || []);
      } else {
        response = await solutionsService.getAll(params);
        setSolutions(Array.isArray(response) ? response : response.data || []);
      }
    } catch (err) {
      setError(err?.message || 'Failed to retrieve verified solutions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolutions();
  }, [filterDifficulty, filterTopic]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSolutions();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterDifficulty('');
    setFilterTopic('');
    fetchSolutions();
  };

  // Form actions
  const handleOpenCreateModal = () => {
    setFormData({
      instruction: '',
      topic: '',
      difficulty: 'medium',
      output: '',
      dataset_source: 'leetcode-top-100',
      problem_number: '',
      url: ''
    });
    setFormErrors({});
    setEditingSolutionId(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (sol) => {
    setFormData({
      instruction: sol.instruction || '',
      topic: sol.topic || '',
      difficulty: sol.difficulty || 'medium',
      output: sol.output || sol.code || '',
      dataset_source: sol.dataset_source || '',
      problem_number: sol.problem_number || '',
      url: sol.url || ''
    });
    setFormErrors({});
    setEditingSolutionId(sol._id);
    setIsFormOpen(true);
  };

  const handleFormInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'problem_number' ? (value ? parseInt(value, 10) : '') : value
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.instruction.trim()) errors.instruction = 'Explanation/Description is required.';
    if (!formData.topic.trim()) errors.topic = 'Topic Category is required.';
    if (!formData.output.trim()) errors.output = 'Solution Code / Output is required.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmittingForm(true);
    try {
      if (editingSolutionId) {
        await solutionsService.update(editingSolutionId, formData);
      } else {
        await solutionsService.create(formData);
      }
      setIsFormOpen(false);
      fetchSolutions();
    } catch (err) {
      alert(err?.message || 'Failed to submit solution data.');
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
      await solutionsService.delete(deleteConfirmId);
      setDeleteConfirmId(null);
      fetchSolutions();
    } catch (err) {
      alert(err?.message || 'Failed to delete solution.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Solutions Directory</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            Browse and update code snippets, algorithms, and logic scripts.
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleOpenCreateModal}>
          <Plus size={14} />
          <span>New Solution</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '0.75rem 1rem' }}>
        <form onSubmit={handleSearchSubmit} className="filters-bar" style={{ margin: 0 }}>
          <div className="filter-inputs">
            {/* Search Input */}
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
                placeholder="Search solutions..."
                className="form-input"
                style={{ paddingLeft: '2.1rem', height: '34px', fontSize: '0.8rem' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Difficulty select */}
            <select
              className="form-input"
              style={{ width: '120px', height: '34px', fontSize: '0.8rem' }}
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
            >
              <option value="">Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="advanced">Hard</option>
            </select>

            {/* Topic select */}
            <select
              className="form-input"
              style={{ width: '150px', height: '34px', fontSize: '0.8rem' }}
              value={filterTopic}
              onChange={(e) => setFilterTopic(e.target.value)}
            >
              <option value="">Topic</option>
              {topicsList.map(topic => (
                <option key={topic._id || topic.name} value={topic.name}>{topic.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn btn-secondary btn-sm" style={{ height: '34px' }}>
              Search
            </button>
            {(searchQuery || filterDifficulty || filterTopic) && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ height: '34px', color: 'var(--danger)' }}
                onClick={clearFilters}
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
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Loading solutions...</p>
        </div>
      ) : error ? (
        <div className="empty-state" style={{ borderColor: 'var(--danger-light)' }}>
          <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</p>
          <button className="btn btn-secondary btn-sm" style={{ marginTop: '0.75rem' }} onClick={fetchSolutions}>Retry</button>
        </div>
      ) : solutions.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontSize: '0.85rem' }}>No verified solutions found. Try creating a new solution.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>No.</th>
                <th>Explanation / Title</th>
                <th style={{ width: '150px' }}>Topic</th>
                <th style={{ width: '100px' }}>Difficulty</th>
                <th style={{ width: '100px' }}>Views</th>
                <th style={{ textAlign: 'right', width: '140px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {solutions.map((sol) => (
                <tr key={sol._id}>
                  <td style={{ fontWeight: 600 }}>{sol.problem_number || 'N/A'}</td>
                  <td style={{ maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                    {sol.instruction}
                  </td>
                  <td>
                    <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{sol.topic}</span>
                  </td>
                  <td>
                    <span className={`badge ${
                      sol.difficulty === 'easy' || sol.difficulty === 'beginner'
                        ? 'badge-success'
                        : sol.difficulty === 'medium' || sol.difficulty === 'intermediate'
                          ? 'badge-warning'
                          : 'badge-danger'
                    }`} style={{ fontSize: '0.675rem' }}>
                      {sol.difficulty || 'medium'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{sol.views || 0}</td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.375rem' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.3rem' }}
                        onClick={() => setDetailSolution(sol)}
                        title="View Code"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.3rem' }}
                        onClick={() => handleOpenEditModal(sol)}
                        title="Edit"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.3rem', color: 'var(--danger)' }}
                        onClick={() => handleDeleteTrigger(sol._id)}
                        title="Delete"
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

      {/* VIEW SOLUTION DETAIL MODAL */}
      <Modal
        isOpen={!!detailSolution}
        onClose={() => setDetailSolution(null)}
        title={detailSolution?.problem_number ? `Solution #${detailSolution.problem_number}` : 'Solution Details'}
      >
        {detailSolution && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <span className="form-label" style={{ fontSize: '0.75rem' }}>Explanation / Context</span>
              <p style={{ fontWeight: 500, whiteSpace: 'pre-wrap', fontSize: '0.875rem', lineHeight: 1.5 }}>
                {detailSolution.instruction}
              </p>
            </div>

            <div className="grid-cols-2">
              <div>
                <span className="form-label" style={{ fontSize: '0.75rem' }}>Topic</span>
                <span className="badge badge-info">{detailSolution.topic}</span>
              </div>
              <div>
                <span className="form-label" style={{ fontSize: '0.75rem' }}>Difficulty Tag</span>
                <span className={`badge ${
                  detailSolution.difficulty === 'easy' || detailSolution.difficulty === 'beginner'
                    ? 'badge-success'
                    : detailSolution.difficulty === 'medium' || detailSolution.difficulty === 'intermediate'
                      ? 'badge-warning'
                      : 'badge-danger'
                }`}>
                  {detailSolution.difficulty}
                </span>
              </div>
            </div>

            <div>
              <span className="form-label" style={{ fontSize: '0.75rem' }}>Solution Code</span>
              <pre className="code-block" style={{ fontSize: '0.75rem', maxHeight: '250px' }}>
                <code>{detailSolution.output || detailSolution.code || '// No output code provided'}</code>
              </pre>
            </div>
          </div>
        )}
      </Modal>

      {/* CREATE & EDIT FORM MODAL */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingSolutionId ? 'Edit Solution Code' : 'Add Verified Solution'}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="instruction">Solution Explanation / Context</label>
            <textarea
              id="instruction"
              name="instruction"
              rows="3"
              className="form-input"
              placeholder="Explain the logic and time complexity..."
              value={formData.instruction}
              onChange={handleFormInputChange}
            ></textarea>
            {formErrors.instruction && <div className="form-error">{formErrors.instruction}</div>}
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label" htmlFor="topic">Topic Category</label>
              <input
                id="topic"
                name="topic"
                type="text"
                className="form-input"
                placeholder="e.g. Dynamic Programming"
                value={formData.topic}
                onChange={handleFormInputChange}
              />
              {formErrors.topic && <div className="form-error">{formErrors.topic}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="difficulty">Difficulty Level</label>
              <select
                id="difficulty"
                name="difficulty"
                className="form-input"
                value={formData.difficulty}
                onChange={handleFormInputChange}
              >
                <option value="easy">Easy / Beginner</option>
                <option value="medium">Medium / Intermediate</option>
                <option value="advanced">Hard / Advanced</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="output">Solution Code Snippet</label>
            <textarea
              id="output"
              name="output"
              rows="5"
              className="form-input"
              style={{ fontFamily: 'var(--font-mono)' }}
              placeholder="e.g. function solve() { return true; }"
              value={formData.output}
              onChange={handleFormInputChange}
            ></textarea>
            {formErrors.output && <div className="form-error">{formErrors.output}</div>}
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label" htmlFor="problem_number">Problem Linkage ID</label>
              <input
                id="problem_number"
                name="problem_number"
                type="number"
                className="form-input"
                placeholder="Problem ID Number"
                value={formData.problem_number}
                onChange={handleFormInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="dataset_source">Dataset Source</label>
              <input
                id="dataset_source"
                name="dataset_source"
                type="text"
                className="form-input"
                value={formData.dataset_source}
                onChange={handleFormInputChange}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submittingForm}>
              {submittingForm ? 'Saving...' : 'Save Solution'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Confirm Solution Deletion"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.875rem' }}>Are you sure you want to permanently delete this solution record? This operation cannot be undone.</p>

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

export default Solutions;
