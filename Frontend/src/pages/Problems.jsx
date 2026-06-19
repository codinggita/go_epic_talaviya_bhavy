import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import problemsService from '../services/api/problems.service';
import solutionsService from '../services/api/solutions.service';
import topicsService from '../services/api/topics.service';
import { useAuth } from '../hooks/useAuth';
import Modal from '../components/Modal';
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  X,
  ArrowLeft,
  ArrowRight,
  Code,
  ExternalLink,
  BookOpen,
  ArrowLeftRight,
  Play,
  CheckCircle,
  FileText,
  RotateCcw,
  Sparkles
} from 'lucide-react';

const Problems = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Core data states
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtering & Pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [topicsList, setTopicsList] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Split Workspace & Coding states
  const [detailProblem, setDetailProblem] = useState(null);
  const [activeTab, setActiveTab] = useState('description'); // description, solutions
  const [relatedSolutions, setRelatedSolutions] = useState([]);
  const [loadingSolutions, setLoadingSolutions] = useState(false);
  const [editorCode, setEditorCode] = useState('');
  const [editorLanguage, setEditorLanguage] = useState('javascript');
  const [runLogs, setRunLogs] = useState('');
  const [showLogs, setShowLogs] = useState(false);

  // Submit Solution Modal state (from Editor Workspace)
  const [isSubmitSolOpen, setIsSubmitSolOpen] = useState(false);
  const [solInstruction, setSolInstruction] = useState('');
  const [submittingSol, setSubmittingSol] = useState(false);

  // Admin Modals & Action states
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
  const [editingProblemId, setEditingProblemId] = useState(null);
  const [submittingForm, setSubmittingForm] = useState(false);

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch initial helper states
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

  // Fetch problems list
  const fetchProblems = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      const params = {
        page: currentPage,
        limit: limit
      };

      if (filterDifficulty) params.difficulty = filterDifficulty;
      if (filterTopic) params.topic = filterTopic;
      if (filterSource) params.source = filterSource;

      if (searchQuery) {
        response = await problemsService.search(searchQuery);
        const results = Array.isArray(response) ? response : response.data || [];
        setProblems(results);
        setTotalPages(1);
      } else {
        response = await problemsService.getAll(params);
        if (response.data && Array.isArray(response.data)) {
          setProblems(response.data);
          setTotalPages(response.totalPages || Math.ceil((response.total || 0) / limit) || 1);
        } else if (Array.isArray(response)) {
          setProblems(response);
          setTotalPages(1);
        } else {
          setProblems([]);
        }
      }
    } catch (err) {
      setError(err?.message || 'Failed to retrieve problems.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [currentPage, filterDifficulty, filterTopic, filterSource]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'new') {
      handleOpenCreateModal();
    }
  }, [location]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProblems();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterDifficulty('');
    setFilterTopic('');
    setFilterSource('');
    setCurrentPage(1);
  };

  // Form utilities
  const handleOpenCreateModal = () => {
    setFormData({
      instruction: '',
      topic: '',
      difficulty: 'medium',
      output: '',
      dataset_source: 'leetcode-top-100',
      problem_number: problems.length > 0 ? Math.max(...problems.map(p => p.problem_number || 0)) + 1 : 1,
      url: ''
    });
    setFormErrors({});
    setEditingProblemId(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (e, prob) => {
    e.stopPropagation(); // Avoid triggering problem detail row click
    setFormData({
      instruction: prob.instruction || '',
      topic: prob.topic || '',
      difficulty: prob.difficulty || 'medium',
      output: prob.output || '',
      dataset_source: prob.dataset_source || '',
      problem_number: prob.problem_number || '',
      url: prob.url || ''
    });
    setFormErrors({});
    setEditingProblemId(prob._id);
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
    if (!formData.instruction.trim()) errors.instruction = 'Instruction description is required.';
    if (!formData.topic.trim()) errors.topic = 'Topic Category is required.';
    if (!formData.output.trim()) errors.output = 'Target Output / Code snippet is required.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmittingForm(true);
    try {
      if (editingProblemId) {
        await problemsService.update(editingProblemId, formData);
      } else {
        await problemsService.create(formData);
      }
      setIsFormOpen(false);
      fetchProblems();
    } catch (err) {
      alert(err?.message || 'Failed to submit problem details.');
    } finally {
      setSubmittingForm(false);
    }
  };

  // Delete utilities
  const handleDeleteTrigger = (e, id) => {
    e.stopPropagation(); // Avoid triggering row click detail
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await problemsService.delete(deleteConfirmId);
      setDeleteConfirmId(null);
      fetchProblems();
    } catch (err) {
      alert(err?.message || 'Failed to delete problem.');
    } finally {
      setDeleting(false);
    }
  };

  // View detail / Split Workspace workspace loaders
  const handleViewDetails = async (prob) => {
    setDetailProblem(prob);
    setActiveTab('description');
    setRunLogs('');
    setShowLogs(false);
    
    // Set default editor code boilerplate
    const titleClean = prob.instruction.substring(0, 40).replace(/[^a-zA-Z0-9]/g, ' ');
    const boilerplate = `/**
 * Problem #${prob.problem_number} : ${prob.instruction.substring(0, 100)}${prob.instruction.length > 100 ? '...' : ''}
 * Topic: ${prob.topic}
 * Difficulty: ${prob.difficulty}
 */

function solveChallenge() {
    // Write your code logic here
    console.log("Running challenge...");
    
    return true;
}

// Invoke the entrypoint
solveChallenge();`;
    setEditorCode(boilerplate);
    
    setRelatedSolutions([]);
    setLoadingSolutions(true);
    try {
      const res = await solutionsService.getAll();
      const allSols = Array.isArray(res) ? res : res.data || [];
      const matching = allSols.filter(
        sol => sol.problem_number === prob.problem_number || sol.topic === prob.topic
      );
      setRelatedSolutions(matching);
    } catch (err) {
      console.warn('Could not load related solutions', err);
    } finally {
      setLoadingSolutions(false);
    }
  };

  // Simulation handlers (Run Code)
  const handleRunCode = () => {
    setRunLogs('Running testcases...\n\n');
    setShowLogs(true);
    setTimeout(() => {
      setRunLogs(prev => prev + `[INFO] Parsing compiler tree...\n[SUCCESS] Code compiled successfully.\n\nOutput:\n------------------\nRunning challenge...\n\nResult: PASS\nTest cases: 3/3 succeeded.`);
    }, 1200);
  };

  // Reset editor template
  const handleResetCode = () => {
    if (window.confirm("Are you sure you want to reset the editor code? Your changes will be discarded.")) {
      const boilerplate = `/**
 * Problem #${detailProblem?.problem_number} : ${detailProblem?.instruction.substring(0, 60)}
 */

function solveChallenge() {
    // Write your code logic here
    console.log("Running challenge...");
    
    return true;
}

solveChallenge();`;
      setEditorCode(boilerplate);
      setRunLogs('');
      setShowLogs(false);
    }
  };

  // Submit Solution Workspace wrapper
  const handleOpenSubmitSol = () => {
    setSolInstruction(`Solution code written directly from mock workspace editor.`);
    setIsSubmitSolOpen(true);
  };

  const handleSubmitSolution = async (e) => {
    e.preventDefault();
    if (!editorCode.trim()) {
      alert("Please write some code in the editor first!");
      return;
    }

    setSubmittingSol(true);
    try {
      const payload = {
        instruction: solInstruction,
        topic: detailProblem.topic,
        difficulty: detailProblem.difficulty,
        output: editorCode,
        problem_number: detailProblem.problem_number,
        dataset_source: detailProblem.dataset_source || 'custom'
      };

      await solutionsService.create(payload);
      alert("Congratulations! Solution submitted successfully.");
      setIsSubmitSolOpen(false);

      // Refresh solutions list under description workspace
      setLoadingSolutions(true);
      const res = await solutionsService.getAll();
      const allSols = Array.isArray(res) ? res : res.data || [];
      const matching = allSols.filter(
        sol => sol.problem_number === detailProblem.problem_number || sol.topic === detailProblem.topic
      );
      setRelatedSolutions(matching);
      setActiveTab('solutions'); // jump to solutions tab
    } catch (err) {
      alert(err?.message || 'Failed to submit solution.');
    } finally {
      setSubmittingSol(false);
      setLoadingSolutions(false);
    }
  };

  // -------------------------------------------------------------
  // RENDERING SPLIT WORKSPACE
  // -------------------------------------------------------------
  if (detailProblem) {
    return (
      <div className="workspace-container">
        
        {/* Left Pane - Problem Details / Solutions tab */}
        <div className="workspace-pane" style={{ flex: 1.1 }}>
          <div className="workspace-pane-header">
            <div className="tab-group">
              <button 
                onClick={() => setActiveTab('description')}
                className={`tab-item ${activeTab === 'description' ? 'active' : ''}`}
              >
                <FileText size={13} style={{ marginRight: '0.25rem' }} />
                <span>Description</span>
              </button>
              <button 
                onClick={() => setActiveTab('solutions')}
                className={`tab-item ${activeTab === 'solutions' ? 'active' : ''}`}
              >
                <Code size={13} style={{ marginRight: '0.25rem' }} />
                <span>Solutions ({relatedSolutions.length})</span>
              </button>
            </div>
            
            <button 
              className="btn btn-secondary btn-sm"
              style={{ border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', padding: '0.25rem' }}
              onClick={() => setDetailProblem(null)}
              title="Return to catalog"
            >
              <ArrowLeft size={14} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, marginLeft: '0.25rem' }}>Back</span>
            </button>
          </div>

          <div className="workspace-pane-body">
            {activeTab === 'description' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>#{detailProblem.problem_number || '-'}</span>
                    <span>{detailProblem.instruction.split('\n')[0].substring(0, 50)}</span>
                  </h2>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem', alignItems: 'center' }}>
                    <span className={`badge ${
                      detailProblem.difficulty === 'easy' || detailProblem.difficulty === 'beginner'
                        ? 'badge-success'
                        : detailProblem.difficulty === 'medium' || detailProblem.difficulty === 'intermediate'
                          ? 'badge-warning'
                          : 'badge-danger'
                    }`}>
                      {detailProblem.difficulty}
                    </span>
                    <span className="badge badge-info">{detailProblem.topic}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      Views: {detailProblem.views || 0}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      Source: {detailProblem.dataset_source || 'custom'}
                    </span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <p style={{ fontSize: '0.875rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
                    {detailProblem.instruction}
                  </p>
                </div>

                {detailProblem.url && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>External Reference Link:</span>
                    <a
                      href={detailProblem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--accent-blue)', display: 'inline-flex', alignItems: 'center', gap: '0.125rem', textDecoration: 'none', fontWeight: 500 }}
                    >
                      <span>Open Link</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                )}

                {detailProblem.output && (
                  <div>
                    <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      Target Output / Expected Snippet
                    </h4>
                    <pre className="code-block" style={{ fontSize: '0.75rem' }}>{detailProblem.output}</pre>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Verified Solutions ({relatedSolutions.length})</h3>
                </div>

                {loadingSolutions ? (
                  <div style={{ display: 'flex', padding: '2rem', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="spinner" style={{ width: '1.5rem', height: '1.5rem' }}></div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Fetching solution list...</p>
                  </div>
                ) : relatedSolutions.length === 0 ? (
                  <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                    <p style={{ fontSize: '0.8rem' }}>No verified solutions added for this challenge yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {relatedSolutions.map((sol, index) => (
                      <div key={sol._id} style={{ border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-tertiary)', padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Solution #{index + 1}</span>
                          <span style={{ color: 'var(--text-tertiary)' }}>Views: {sol.views || 0}</span>
                        </div>
                        <div style={{ padding: '0.75rem' }}>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', whiteSpace: 'pre-wrap' }}>
                            {sol.instruction}
                          </p>
                          <pre className="code-block" style={{ fontSize: '0.75rem', margin: 0 }}>
                            <code>{sol.output || sol.code || 'No code provided.'}</code>
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Pane - The Code Editor Mockup */}
        <div className="workspace-pane" style={{ flex: 1 }}>
          <div className="editor-container">
            
            {/* Editor Top Bar */}
            <div className="editor-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <select 
                  value={editorLanguage}
                  onChange={(e) => setEditorLanguage(e.target.value)}
                  style={{
                    backgroundColor: '#1b1b1b',
                    color: '#eff2f6',
                    border: '1px solid #444',
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.75rem',
                    borderRadius: '3px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="golang">Go (Golang)</option>
                  <option value="cpp">C++</option>
                </select>

                <button
                  onClick={handleResetCode}
                  className="btn btn-secondary btn-sm"
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#abb2bf',
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Reset Boilerplate"
                >
                  <RotateCcw size={12} />
                </button>
              </div>

              <span style={{ fontSize: '0.7rem', color: '#5c6370', fontWeight: 600, textTransform: 'uppercase' }}>
                Workspace IDE Mode
              </span>
            </div>

            {/* Editor input area */}
            <div className="editor-content-wrapper">
              <div className="editor-line-numbers">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <textarea
                className="editor-textarea"
                value={editorCode}
                onChange={(e) => setEditorCode(e.target.value)}
                spellCheck="false"
              />
            </div>

            {/* Console logs pane (shows if run logs are available) */}
            {showLogs && (
              <div style={{ height: '140px', borderTop: '1px solid #1e1e1e', backgroundColor: '#151515', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '28px', backgroundColor: '#202020', display: 'flex', alignItems: 'center', padding: '0 0.75rem', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.7rem', color: '#abb2bf', fontWeight: 600 }}>Console logs</span>
                  <button 
                    onClick={() => setShowLogs(false)} 
                    style={{ background: 'none', border: 'none', color: '#5c6370', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <X size={12} />
                  </button>
                </div>
                <pre style={{ flex: 1, padding: '0.5rem 0.75rem', overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.725rem', color: '#00e676', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
                  {runLogs || 'Running compiler tests...'}
                </pre>
              </div>
            )}

            {/* Editor Footer Actions */}
            <div className="editor-footer">
              <button 
                className="btn btn-secondary btn-sm"
                style={{ backgroundColor: '#3e3e3e', border: 'none', color: '#eff2f6' }}
                onClick={() => setShowLogs(!showLogs)}
              >
                Console
              </button>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn btn-secondary btn-sm" 
                  style={{ backgroundColor: '#3e3e3e', border: 'none', color: '#eff2f6', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  onClick={handleRunCode}
                >
                  <Play size={10} style={{ fill: 'currentColor' }} />
                  <span>Run</span>
                </button>
                <button 
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  onClick={handleOpenSubmitSol}
                >
                  <CheckCircle size={10} />
                  <span>Submit</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* SUBMIT SOLUTION MODAL */}
        <Modal
          isOpen={isSubmitSolOpen}
          onClose={() => setIsSubmitSolOpen(false)}
          title="Submit Solution to Database"
        >
          <form onSubmit={handleSubmitSolution}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              You are submitting the code snippet in the workspace as a verified solution for problem <strong>#{detailProblem.problem_number}</strong>.
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="solInstruction">Explanation / Context Description</label>
              <textarea
                id="solInstruction"
                rows="3"
                className="form-input"
                placeholder="Explain the logic, time and space complexity details..."
                value={solInstruction}
                onChange={(e) => setSolInstruction(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Solution Code Snippet (Pre-filled from Editor)</label>
              <pre className="code-block" style={{ fontSize: '0.725rem', maxHeight: '150px' }}>{editorCode}</pre>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsSubmitSolOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submittingSol}>
                {submittingSol ? 'Saving Solution...' : 'Confirm Submission'}
              </button>
            </div>
          </form>
        </Modal>

      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDERING MAIN PROBLEMS LIST CATALOG
  // -------------------------------------------------------------
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Coding Problems Catalog</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            Browse coding challenges. Click on any row to open the editor workspace.
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleOpenCreateModal}>
          <Plus size={14} />
          <span>New Problem</span>
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
                placeholder="Search by keywords..."
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
            {(searchQuery || filterDifficulty || filterTopic || filterSource) && (
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

      {/* Catalog Table Content */}
      {loading ? (
        <div style={{ display: 'flex', height: '35vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Loading problems...</p>
        </div>
      ) : error ? (
        <div className="empty-state" style={{ borderColor: 'var(--danger-light)' }}>
          <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</p>
          <button className="btn btn-secondary btn-sm" style={{ marginTop: '0.75rem' }} onClick={fetchProblems}>Retry</button>
        </div>
      ) : problems.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontSize: '0.85rem' }}>No problems found. Adjust filters or create a new problem.</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>No.</th>
                  <th>Description / Instruction</th>
                  <th style={{ width: '130px' }}>Topic</th>
                  <th style={{ width: '100px' }}>Difficulty</th>
                  <th style={{ width: '130px' }}>Source</th>
                  <th style={{ width: '80px' }}>Views</th>
                  <th style={{ textAlign: 'right', width: '140px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((prob) => (
                  <tr 
                    key={prob._id} 
                    onClick={() => handleViewDetails(prob)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ fontWeight: 600 }}>{prob.problem_number || '-'}</td>
                    <td style={{ maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                      {prob.instruction}
                    </td>
                    <td>
                      <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{prob.topic}</span>
                    </td>
                    <td>
                      <span className={`badge ${
                        prob.difficulty === 'easy' || prob.difficulty === 'beginner'
                          ? 'badge-success'
                          : prob.difficulty === 'medium' || prob.difficulty === 'intermediate'
                            ? 'badge-warning'
                            : 'badge-danger'
                      }`} style={{ fontSize: '0.675rem' }}>
                        {prob.difficulty || 'medium'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                      {prob.dataset_source || 'custom'}
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{prob.views || 0}</td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.375rem' }} onClick={e => e.stopPropagation()}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.3rem' }}
                          onClick={() => handleViewDetails(prob)}
                          title="Open IDE Workspace"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.3rem' }}
                          onClick={(e) => handleOpenEditModal(e, prob)}
                          title="Edit Problem"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.3rem', color: 'var(--danger)' }}
                          onClick={(e) => handleDeleteTrigger(e, prob._id)}
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

          {/* Pagination */}
          {!searchQuery && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                >
                  <ArrowLeft size={12} />
                  <span>Previous</span>
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                >
                  <span>Next</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* CREATE & EDIT PROBLEM FORM MODAL */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingProblemId ? 'Edit Challenge Details' : 'Add New Coding Challenge'}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="instruction">Challenge Instruction / Description</label>
            <textarea
              id="instruction"
              name="instruction"
              rows="3"
              className="form-input"
              placeholder="e.g. Write a function that returns the reverse of a string."
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
                placeholder="e.g. Strings"
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
            <label className="form-label" htmlFor="output">Target Output / Expected Code Snippet</label>
            <textarea
              id="output"
              name="output"
              rows="3"
              className="form-input"
              style={{ fontFamily: 'var(--font-mono)' }}
              placeholder="Write the expected output code snippet..."
              value={formData.output}
              onChange={handleFormInputChange}
            ></textarea>
            {formErrors.output && <div className="form-error">{formErrors.output}</div>}
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label" htmlFor="problem_number">Problem Number</label>
              <input
                id="problem_number"
                name="problem_number"
                type="number"
                className="form-input"
                placeholder="101"
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
                placeholder="leetcode-top-100"
                value={formData.dataset_source}
                onChange={handleFormInputChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="url">External reference URL</label>
            <input
              id="url"
              name="url"
              type="url"
              className="form-input"
              placeholder="https://leetcode.com/problems/..."
              value={formData.url}
              onChange={handleFormInputChange}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submittingForm}>
              {submittingForm ? 'Saving...' : 'Save Problem'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Confirm Problem Deletion"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.875rem' }}>Are you sure you want to permanently delete this challenge from the catalog? This operation cannot be undone.</p>

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

export default Problems;
