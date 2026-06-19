import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import statsService from '../services/api/stats.service';
import problemsService from '../services/api/problems.service';
import solutionsService from '../services/api/solutions.service';
import {
  Code2,
  CheckSquare,
  BookOpen,
  Database,
  TrendingUp,
  Clock,
  Plus,
  ArrowRight,
  Sparkles,
  Award,
  ChevronRight,
  Flame
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    problems: 0,
    solutions: 0,
    topics: 0,
    datasets: 0,
    difficultyBreakdown: { easy: 0, medium: 0, advanced: 0 },
  });
  const [solutionsList, setSolutionsList] = useState([]);
  const [recentProblems, setRecentProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTooltip, setActiveTooltip] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [
          probStats,
          topicStats,
          datasetStats,
          solStats,
          diffStats,
          recProbs,
          allSols
        ] = await Promise.allSettled([
          statsService.getProblemsStats(),
          statsService.getTopicsStats(),
          statsService.getDatasetsStats(),
          statsService.getTotalSolutions(),
          statsService.getDifficultiesStats(),
          problemsService.getRecent(),
          solutionsService.getAll()
        ]);

        const totalProblems = probStats.status === 'fulfilled' ? (probStats.value.count || probStats.value.totalProblems || 0) : 0;
        const totalTopics = topicStats.status === 'fulfilled' ? (topicStats.value.count || topicStats.value.totalTopics || 0) : 0;
        const totalDatasets = datasetStats.status === 'fulfilled' ? (datasetStats.value.count || datasetStats.value.totalDatasets || 0) : 0;
        const totalSolutions = solStats.status === 'fulfilled' ? (solStats.value.count || solStats.value.totalSolutions || 0) : 0;

        let diffs = { easy: 0, medium: 0, advanced: 0 };
        if (diffStats.status === 'fulfilled' && diffStats.value.breakdown) {
          diffs = diffStats.value.breakdown;
        } else if (diffStats.status === 'fulfilled' && diffStats.value) {
          diffs = {
            easy: diffStats.value.easy || 0,
            medium: diffStats.value.medium || 0,
            advanced: diffStats.value.advanced || diffStats.value.hard || 0
          };
        }

        let solsArr = [];
        if (allSols.status === 'fulfilled') {
          solsArr = Array.isArray(allSols.value) ? allSols.value : allSols.value.data || [];
        }

        setStats({
          problems: totalProblems,
          solutions: totalSolutions,
          topics: totalTopics,
          datasets: totalDatasets,
          difficultyBreakdown: diffs
        });

        setSolutionsList(solsArr);

        if (recProbs.status === 'fulfilled') {
          setRecentProblems(Array.isArray(recProbs.value) ? recProbs.value.slice(0, 5) : (recProbs.value.data || []).slice(0, 5));
        }

      } catch (err) {
        setError('Failed to fetch dashboard statistics.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Compute stats of unique solved problems
  const solvedProblemsSet = new Set();
  const solvedEasySet = new Set();
  const solvedMediumSet = new Set();
  const solvedHardSet = new Set();

  solutionsList.forEach(sol => {
    const key = sol.problem_number 
      ? `num-${sol.problem_number}` 
      : (sol.instruction ? `inst-${sol.instruction.substring(0, 80)}` : `id-${sol._id}`);
    
    solvedProblemsSet.add(key);

    const d = (sol.difficulty || '').toLowerCase();
    if (d === 'easy' || d === 'beginner') {
      solvedEasySet.add(key);
    } else if (d === 'medium' || d === 'intermediate') {
      solvedMediumSet.add(key);
    } else if (d === 'advanced' || d === 'hard' || d === 'difficult') {
      solvedHardSet.add(key);
    } else {
      solvedMediumSet.add(key);
    }
  });

  const solvedCount = solvedProblemsSet.size;
  const solvedEasy = solvedEasySet.size;
  const solvedMedium = solvedMediumSet.size;
  const solvedHard = solvedHardSet.size;

  // Active Streak Day calculation
  const getActiveStreak = () => {
    const dateMap = {};
    solutionsList.forEach(sol => {
      if (sol.createdAt) {
        const date = new Date(sol.createdAt);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        dateMap[dateStr] = (dateMap[dateStr] || 0) + 1;
      }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const getFormattedDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const todayStr = getFormattedDate(today);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = getFormattedDate(yesterday);
    
    if (!dateMap[todayStr] && !dateMap[yesterdayStr]) {
      return 0;
    }
    
    let streak = 0;
    let checkDate = dateMap[todayStr] ? today : yesterday;
    
    while (true) {
      const checkStr = getFormattedDate(checkDate);
      if (dateMap[checkStr] && dateMap[checkStr] > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  // Generate contribution graph blocks based on actual submission dates
  const generateContributionDays = () => {
    const cells = [];
    const dateMap = {};
    
    solutionsList.forEach(sol => {
      if (sol.createdAt) {
        const date = new Date(sol.createdAt);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        dateMap[dateStr] = (dateMap[dateStr] || 0) + 1;
      }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 53 weeks * 7 days = 371 cells
    for (let i = 0; i < 371; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - (370 - i));
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const count = dateMap[dateStr] || 0;
      
      let level = "";
      if (count >= 4) level = "level-4";
      else if (count === 3) level = "level-3";
      else if (count === 2) level = "level-2";
      else if (count === 1) level = "level-1";
      
      const dateLabel = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      cells.push(
        <div 
          key={i} 
          className={`contrib-day ${level}`} 
          title={`${count} submissions on ${dateLabel}`} 
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const container = e.currentTarget.closest('.contrib-calendar-container');
            const containerRect = container.getBoundingClientRect();
            const left = rect.left - containerRect.left + (rect.width / 2);
            const top = rect.top - containerRect.top - 8;
            setActiveTooltip({
              count,
              dateLabel,
              left,
              top
            });
          }}
          onMouseLeave={() => setActiveTooltip(null)}
          style={{ cursor: 'pointer' }}
        />
      );
    }
    return cells;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flex: 1, height: '60vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Loading application stats...</p>
      </div>
    );
  }

  // Circle stroke offset calculation
  const strokeDasharray = 2 * Math.PI * 40; // radius = 40
  const solveRatio = stats.problems > 0 ? (solvedCount / stats.problems) : 0;
  const strokeDashoffset = strokeDasharray * (1 - Math.min(solveRatio, 1));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Welcome & Quick stats banner */}
      <div 
        className="card" 
        style={{ 
          background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
          padding: '1.5rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderLeft: '4px solid var(--primary)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Sparkles size={14} />
            <span>Developer Space Dashboard</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', margin: '0.25rem 0 0.5rem', fontWeight: 700 }}>Go-Epic Problem Solving Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '650px' }}>
             Practice algorithm building blocks, configure topic categories, and import custom JSON challenge datasets.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.875rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <Flame size={18} style={{ color: 'var(--primary)', fill: 'var(--primary)' }} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', lineHeight: 1.2 }}>{getActiveStreak()} Days</div>
            <span style={{ fontSize: '0.675rem', color: 'var(--text-tertiary)' }}>Current Streak</span>
          </div>
        </div>
      </div>

      {/* LeetCode Main Profile Panels (2 columns: stats overview & secondary panels) */}
      <div className="grid-cols-3" style={{ gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
        
        {/* Left Side: Stats Breakdown & Contribution Heatmap */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Circular Progression Panel & Bars (replica of LeetCode progression circle) */}
          <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', padding: '1.5rem' }}>
            
            {/* Circle column */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div className="stats-circle-container">
                <svg className="stats-circle-svg" viewBox="0 0 100 100">
                  <circle className="stats-circle-bg" cx="50" cy="50" r="40" />
                  <circle 
                    className="stats-circle-fill" 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    style={{ stroke: 'var(--accent-green)' }}
                  />
                </svg>
                <div className="stats-circle-text">
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                    {solvedCount}
                  </span>
                  <span style={{ fontSize: '0.675rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Solved
                  </span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Problems</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.problems}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Award size={10} />
                  <span>Completion: {stats.problems > 0 ? Math.round((solvedCount / stats.problems) * 100) : 0}%</span>
                </div>
              </div>
            </div>

            {/* Vertical Divider on desktops */}
            <div style={{ alignSelf: 'stretch', width: '1px', backgroundColor: 'var(--border-color)', margin: '0 0.5rem' }} id="stats-divider" />

            {/* Sub-bars column (Easy, Medium, Hard progress) */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '200px' }}>
              
              {/* Easy Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>Easy</span>
                  <span style={{ fontWeight: 500 }}>
                    {solvedEasy} <span style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>/ {stats.difficultyBreakdown.easy}</span>
                  </span>
                </div>
                <div style={{ height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      width: `${stats.difficultyBreakdown.easy > 0 ? Math.min((solvedEasy / stats.difficultyBreakdown.easy) * 100, 100) : 0}%`, 
                      backgroundColor: 'var(--accent-green)',
                      borderRadius: '999px'
                    }} 
                  />
                </div>
              </div>

              {/* Medium Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Medium</span>
                  <span style={{ fontWeight: 500 }}>
                    {solvedMedium} <span style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>/ {stats.difficultyBreakdown.medium}</span>
                  </span>
                </div>
                <div style={{ height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      width: `${stats.difficultyBreakdown.medium > 0 ? Math.min((solvedMedium / stats.difficultyBreakdown.medium) * 100, 100) : 0}%`, 
                      backgroundColor: 'var(--primary)',
                      borderRadius: '999px'
                    }} 
                  />
                </div>
              </div>

              {/* Hard Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--danger)', fontWeight: 600 }}>Hard</span>
                  <span style={{ fontWeight: 500 }}>
                    {solvedHard} <span style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>/ {stats.difficultyBreakdown.advanced}</span>
                  </span>
                </div>
                <div style={{ height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      width: `${stats.difficultyBreakdown.advanced > 0 ? Math.min((solvedHard / stats.difficultyBreakdown.advanced) * 100, 100) : 0}%`, 
                      backgroundColor: 'var(--danger)',
                      borderRadius: '999px'
                    }} 
                  />
                </div>
              </div>

            </div>

          </div>

          {/* Activity Heatmap Grid Panel */}
          <div className="contrib-calendar-container" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {solutionsList.length} Contributions in the last year
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                Active streak: {getActiveStreak()} days
              </span>
            </div>
            
            {/* The shaded grid */}
            <div className="contrib-grid">
              {generateContributionDays()}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.675rem', color: 'var(--text-tertiary)' }}>
              <span>Learn more about activity badges</span>
              <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                <span>Less</span>
                <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '1px' }} />
                <div style={{ width: '8px', height: '8px', backgroundColor: '#c6e48b', borderRadius: '1px' }} />
                <div style={{ width: '8px', height: '8px', backgroundColor: '#7bc96f', borderRadius: '1px' }} />
                <div style={{ width: '8px', height: '8px', backgroundColor: '#239a3b', borderRadius: '1px' }} />
                <div style={{ width: '8px', height: '8px', backgroundColor: '#196127', borderRadius: '1px' }} />
                <span>More</span>
              </div>
            </div>

            {/* Interactive custom popup tooltip */}
            {activeTooltip && (
              <div
                style={{
                  position: 'absolute',
                  left: `${activeTooltip.left}px`,
                  top: `${activeTooltip.top}px`,
                  transform: 'translate(-50%, -100%)',
                  backgroundColor: '#1c1c1e',
                  color: '#ffffff',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                  border: '1px solid #3a3a3c',
                  zIndex: 100,
                  pointerEvents: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  fontWeight: 500,
                  transition: 'opacity 0.1s ease'
                }}
              >
                <span>
                  {activeTooltip.count === 0 
                    ? `No submissions on ${activeTooltip.dateLabel}` 
                    : `${activeTooltip.count} submission${activeTooltip.count > 1 ? 's' : ''} on ${activeTooltip.dateLabel}`}
                </span>
                <div
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: '5px solid transparent',
                    borderRight: '5px solid transparent',
                    borderTop: '5px solid #1c1c1e',
                    position: 'absolute',
                    bottom: '-5px',
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}
                />
              </div>
            )}
          </div>

          {/* Recently Added Problems List */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={16} style={{ color: 'var(--accent-blue)' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>Recently Added Problems</span>
              </div>
              <button 
                onClick={() => navigate('/problems')}
                className="btn btn-secondary btn-sm"
                style={{ border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: '0.125rem' }}
              >
                <span>All Problems</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {recentProblems.length === 0 ? (
              <div className="empty-state" style={{ padding: '1.5rem 1rem' }}>
                <p style={{ fontSize: '0.8rem' }}>No recent problems. Go to Problems page to seed the catalog.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {recentProblems.map((prob) => (
                  <div
                    key={prob._id}
                    onClick={() => navigate(`/problems`)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.625rem 0.875rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      backgroundColor: 'var(--bg-secondary)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--text-tertiary)';
                      e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', width: '70%' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.825rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {prob.instruction || `Problem #${prob.problem_number}`}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                        <span>#{prob.problem_number}</span>
                        <span>•</span>
                        <span>{prob.topic}</span>
                        <span>•</span>
                        <span>Source: {prob.dataset_source || 'custom'}</span>
                      </div>
                    </div>

                    <span className={`badge ${
                      prob.difficulty === 'easy' || prob.difficulty === 'beginner'
                        ? 'badge-success'
                        : prob.difficulty === 'medium' || prob.difficulty === 'intermediate'
                          ? 'badge-warning'
                          : 'badge-danger'
                    }`} style={{ fontSize: '0.675rem' }}>
                      {prob.difficulty}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: KPI metrics, categories, quick actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Quick stats mini cards */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Platform Overview
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div 
                onClick={() => navigate('/topics')}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', borderRadius: '4px', cursor: 'pointer' }}
                className="btn-secondary"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BookOpen size={14} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Topics Covered</span>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{stats.topics}</span>
              </div>

              <div 
                onClick={() => navigate('/datasets')}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', borderRadius: '4px', cursor: 'pointer' }}
                className="btn-secondary"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Database size={14} style={{ color: 'var(--accent-blue)' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Active Datasets</span>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{stats.datasets}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Quick Links
            </span>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.8rem' }}
                onClick={() => navigate('/problems?action=new')}
              >
                <Plus size={14} />
                <span>Create New Problem</span>
              </button>
              
              <button
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.8rem' }}
                onClick={() => navigate('/datasets')}
              >
                <Database size={14} />
                <span>Import Dataset JSON</span>
              </button>
            </div>
          </div>

          {/* Helpful Tips Card */}
          <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)' }}>
            <h4 style={{ fontSize: '0.8rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span>💡 Developer Tip</span>
            </h4>
            <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Click on any problem in the catalog to open the split code view! Write your solution right inside the mock IDE editor pane and submit it.
            </p>
          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          #stats-divider {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
