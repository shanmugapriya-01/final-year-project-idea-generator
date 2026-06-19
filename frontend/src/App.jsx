import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import html2pdf from 'html2pdf.js';
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from "docx";
import { saveAs } from "file-saver";
import {
  Lightbulb, Zap, Rocket, Shield,
  Brain, Code, CheckCircle, ArrowRight,
  Sparkles, Database, Layers, Globe, Send, User, Bot, AlertCircle, Copy, Download,
  Clock, Users, Map, MonitorPlay, FolderTree, Star, Trash2, MessageSquare, History, FileText,
  HelpCircle, Cpu, Share2, BarChart, X, Loader2, ChevronDown, ChevronUp,
  BookOpen, Target, Award, TrendingUp, Presentation, GitBranch
} from 'lucide-react';
import './index.css';

// ─── AI Typing Indicator ─────────────────────────────────────────────────────
const AITypingIndicator = () => (
  <div className="typing-indicator" style={{ marginLeft: '8px' }}>
    <div className="typing-dot"></div>
    <div className="typing-dot"></div>
    <div className="typing-dot"></div>
  </div>
);

// ─── Navbar ───────────────────────────────────────────────────────────────────
const Navbar = () => (
  <nav className="glass-nav" style={{ position: 'fixed', top: 0, width: '100%', zIndex: 50 }}>
    <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Sparkles className="gradient-text" style={{ width: '28px', height: '28px' }} />
        <span style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.5px' }} className="gradient-text">IdeaGen AI</span>
      </div>
      <div className="nav-links" style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
        <a href="#home" className="nav-link">Home</a>
        <a href="#features" className="nav-link">Features</a>
        <a href="#how-it-works" className="nav-link">How It Works</a>
        <a href="#benefits" className="nav-link">Benefits</a>
      </div>
      <div>
        <a href="#generator" className="btn-primary" style={{ fontSize: '0.9rem', textDecoration: 'none' }}>
          <Brain size={18} /> FYP Generator AI
        </a>
      </div>
    </div>
  </nav>
);

// ─── Hero ─────────────────────────────────────────────────────────────────────
const Hero = () => (
  <section id="home" className="section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: '120px' }}>
    <div className="container text-center">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
        <motion.div
          initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.5, type: 'spring' }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', background: 'rgba(0, 229, 255, 0.1)', borderRadius: '99px', marginBottom: '2.5rem', border: '1px solid rgba(0, 229, 255, 0.3)', boxShadow: '0 0 20px rgba(0, 229, 255, 0.2)' }}
        >
          <Zap size={16} color="var(--primary)" />
          <span style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.5px' }}>Powered by Groq AI <AITypingIndicator /></span>
        </motion.div>
        <h1 className="hero-title" style={{ fontSize: '5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '2rem', letterSpacing: '-2px' }}>
          Final Year Project <br />
          <span className="gradient-text">Idea Generator</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto 3.5rem auto', lineHeight: 1.7 }}>
          Generate innovative, industry-ready, and highly practical final year project ideas instantly using the power of bleeding-edge AI models.
        </p>
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#generator" className="btn-primary" style={{ padding: '1.2rem 2.5rem', fontSize: '1.125rem', textDecoration: 'none' }}>
            Start Generating <ArrowRight size={20} />
          </a>
          <a href="#how-it-works" className="btn-glass" style={{ padding: '1.2rem 2.5rem', fontSize: '1.125rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            How it works
          </a>
        </div>
      </motion.div>
    </div>
  </section>
);

// ─── Difficulty Badge Helper ──────────────────────────────────────────────────
const getDifficultyClass = (difficulty = '') => {
  const d = difficulty.toLowerCase();
  if (d.includes('beginner')) return 'difficulty-beginner';
  if (d.includes('intermediate')) return 'difficulty-intermediate';
  if (d.includes('advanced')) return 'difficulty-advanced';
  return '';
};

// ─── Project Card ─────────────────────────────────────────────────────────────
const ProjectCard = ({ project, cardId, index, favorites, toggleFavorite, featureState, handleFeatureRequest, closeFeatureViewer }) => {
  const [expanded, setExpanded] = useState(false);
  const exportRef = useRef(null);
  const isFavorite = favorites.some(p => p.title === project.title);

  const premiumFeatures = [
    { id: 'generate_viva', icon: <HelpCircle size={15} />, label: 'Viva Qs', color: '#a855f7' },
    { id: 'generate_ppt', icon: <MonitorPlay size={15} />, label: 'PPT Content', color: '#3b82f6' },
    { id: 'generate_dataset', icon: <Database size={15} />, label: 'Find Dataset', color: '#0ea5e9' },
    { id: 'generate_architecture', icon: <Share2 size={15} />, label: 'Architecture', color: '#10b981' },
    { id: 'generate_folder_structure', icon: <FolderTree size={15} />, label: 'Folder Tree', color: '#f97316' },
    { id: 'generate_report', icon: <FileText size={15} />, label: 'Full Report', color: '#ec4899' },
  ];

  const handleDownloadPDF = async () => {
    if (!exportRef.current) return;
    const opt = {
      margin: 0.5,
      filename: `${project.title?.replace(/[^a-z0-9]/gi, '_') || 'Project'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#0f172a' },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(exportRef.current).save();
  };

  const handleDownloadDOCX = async () => {
    const toParas = (items) => (Array.isArray(items) ? items : [items || '']).map(t =>
      new Paragraph({ children: [new TextRun({ text: `• ${t}`, size: 24 })], spacing: { before: 80 } })
    );

    const children = [
      new Paragraph({ text: project.title || '', heading: HeadingLevel.HEADING_1 }),
      new Paragraph({ children: [new TextRun({ text: `Difficulty: ${project.difficulty || ''}  |  Time: ${project.estimated_time || ''}  |  Team: ${project.team_size || ''}`, bold: true, size: 24 })], spacing: { after: 200 } }),
      new Paragraph({ text: 'Problem Statement', heading: HeadingLevel.HEADING_2 }),
      new Paragraph({ children: [new TextRun({ text: project.problem_statement || '', size: 24 })], spacing: { after: 160 } }),
      new Paragraph({ text: 'Description', heading: HeadingLevel.HEADING_2 }),
      new Paragraph({ children: [new TextRun({ text: project.description || '', size: 24 })], spacing: { after: 160 } }),
      new Paragraph({ text: 'Key Features', heading: HeadingLevel.HEADING_2 }),
      ...toParas(project.features),
      new Paragraph({ text: 'Technologies', heading: HeadingLevel.HEADING_2 }),
      ...toParas(project.technologies),
      new Paragraph({ text: 'Advantages', heading: HeadingLevel.HEADING_2 }),
      ...toParas(project.advantages),
      new Paragraph({ text: 'Future Scope', heading: HeadingLevel.HEADING_2 }),
      new Paragraph({ children: [new TextRun({ text: project.future_scope || '', size: 24 })], spacing: { after: 160 } }),
      new Paragraph({ text: 'Technology Roadmap', heading: HeadingLevel.HEADING_2 }),
      ...toParas(project.roadmap),
      new Paragraph({ text: 'Presentation Tips', heading: HeadingLevel.HEADING_2 }),
      ...toParas(project.presentation_tips),
      new Paragraph({ text: 'Project Structure', heading: HeadingLevel.HEADING_2 }),
      new Paragraph({ children: [new TextRun({ text: project.project_structure || '', size: 22, font: 'Courier New' })], spacing: { after: 160 } }),
    ];

    const doc = new Document({ sections: [{ properties: {}, children }] });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${project.title?.replace(/[^a-z0-9]/gi, '_') || 'Project'}.docx`);
  };

  const fs = featureState[cardId];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--glass-border)',
        borderRadius: '16px',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden',
        width: '100%'
      }}
    >
      {/* Number Badge */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
        color: '#fff', fontWeight: 'bold', padding: '0.4rem 1.2rem',
        borderBottomLeftRadius: '12px', fontSize: '0.9rem',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
      }}>
        #{index + 1}
      </div>

      {/* Project Title */}
      <h3 className="gradient-text" style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1rem', paddingRight: '3rem', lineHeight: 1.3 }}>
        {project.title}
      </h3>

      {/* Metrics Row */}
      <div className="project-metrics-row">
        <span className={`metric-badge ${getDifficultyClass(project.difficulty)}`}>
          <Layers size={14} /> {project.difficulty || 'N/A'}
        </span>
        <span className="metric-badge">
          <Clock size={14} /> {project.estimated_time || 'N/A'}
        </span>
        <span className="metric-badge">
          <Users size={14} /> {project.team_size || 'N/A'}
        </span>
      </div>

      {/* Short Description */}
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
        {project.description}
      </p>

      {/* Top Actions: Favorite + Expand */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={() => toggleFavorite(project)}
          className="btn-glass"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.5rem 1rem', fontSize: '0.875rem', color: isFavorite ? '#eab308' : 'var(--text-secondary)', borderColor: isFavorite ? 'rgba(234,179,8,0.3)' : 'var(--glass-border)' }}
        >
          <Star size={15} fill={isFavorite ? '#eab308' : 'none'} /> {isFavorite ? 'Saved' : 'Save'}
        </button>
        <button
          onClick={() => setExpanded(v => !v)}
          className="expand-btn"
          style={{ flex: 1, minWidth: '180px' }}
        >
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          {expanded ? 'Hide Details' : 'View Full Details'}
        </button>
      </div>

      {/* ── Expanded Section ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35 }}
            style={{ overflow: 'hidden' }}
          >
            {/* Hidden export target */}
            <div ref={exportRef} style={{ background: '#0f172a', padding: '1rem' }}>
              <h2 style={{ color: '#00e5ff', fontSize: '1.5rem', fontWeight: 800 }}>{project.title}</h2>
              <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
                Difficulty: {project.difficulty} | Time: {project.estimated_time} | Team: {project.team_size}
              </p>

              <div className="expanded-details">
                {/* Problem Statement */}
                <div className="detail-section">
                  <h4><AlertCircle size={18} style={{ color: '#ef4444' }} /> Problem Statement</h4>
                  <p style={{ color: 'var(--text-primary)', lineHeight: 1.7 }}>{project.problem_statement}</p>
                </div>

                {/* Description */}
                <div className="detail-section">
                  <h4><BookOpen size={18} style={{ color: '#3b82f6' }} /> Project Description</h4>
                  <p style={{ color: 'var(--text-primary)', lineHeight: 1.7 }}>{project.description}</p>
                </div>

                {/* Features */}
                {project.features?.length > 0 && (
                  <div className="detail-section">
                    <h4><Zap size={18} style={{ color: '#eab308' }} /> Key Features</h4>
                    <ul className="detail-list">
                      {project.features.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                  </div>
                )}

                {/* Technologies */}
                {project.technologies?.length > 0 && (
                  <div className="detail-section">
                    <h4><Code size={18} style={{ color: '#3b82f6' }} /> Technologies Required</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {project.technologies.map((t, i) => (
                        <span key={i} style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', padding: '0.3rem 0.8rem', borderRadius: '99px', fontSize: '0.85rem', color: '#93c5fd' }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Advantages */}
                {project.advantages?.length > 0 && (
                  <div className="detail-section">
                    <h4><CheckCircle size={18} style={{ color: '#22c55e' }} /> Advantages</h4>
                    <ul className="detail-list">
                      {project.advantages.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </div>
                )}

                {/* Future Scope */}
                {project.future_scope && (
                  <div className="detail-section">
                    <h4><Globe size={18} style={{ color: '#a855f7' }} /> Future Scope</h4>
                    <p style={{ color: 'var(--text-primary)', lineHeight: 1.7 }}>{project.future_scope}</p>
                  </div>
                )}

                {/* Roadmap */}
                {project.roadmap?.length > 0 && (
                  <div className="detail-section">
                    <h4><Map size={18} style={{ color: '#8b5cf6' }} /> Technology Roadmap</h4>
                    <ul className="detail-list">
                      {project.roadmap.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                )}

                {/* Presentation Tips */}
                {project.presentation_tips?.length > 0 && (
                  <div className="detail-section">
                    <h4><MonitorPlay size={18} style={{ color: '#10b981' }} /> Presentation Tips</h4>
                    <ul className="detail-list">
                      {project.presentation_tips.map((t, i) => <li key={i}>{t}</li>)}
                    </ul>
                  </div>
                )}

                {/* Project Structure */}
                {project.project_structure && (
                  <div className="detail-section">
                    <h4><FolderTree size={18} style={{ color: '#f8fafc' }} /> Project Structure</h4>
                    <pre style={{ background: 'rgba(0,0,0,0.4)', padding: '1.5rem', borderRadius: '8px', color: '#e2e8f0', fontSize: '0.875rem', overflowX: 'auto', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <code>{project.project_structure}</code>
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Export Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <button onClick={() => navigator.clipboard.writeText(`${project.title}\n\n${project.description}`)} className="btn-glass" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                <Copy size={15} /> Copy
              </button>
              <button onClick={handleDownloadPDF} className="btn-glass" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.5rem 1rem', fontSize: '0.875rem', color: 'var(--primary)', borderColor: 'rgba(0,229,255,0.3)' }}>
                <Download size={15} /> PDF
              </button>
              <button onClick={handleDownloadDOCX} className="btn-glass" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.5rem 1rem', fontSize: '0.875rem', color: '#3b82f6', borderColor: 'rgba(59,130,246,0.3)' }}>
                <FileText size={15} /> DOCX
              </button>
            </div>

            {/* Premium Feature Buttons */}
            <div style={{ marginTop: '1rem' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>AI-Powered Tools</p>
              <div className="premium-actions-grid">
                {premiumFeatures.map(feat => (
                  <button
                    key={feat.id}
                    onClick={() => handleFeatureRequest(project, cardId, feat.id)}
                    className="btn-glass"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                      padding: '0.75rem', fontSize: '0.83rem',
                      color: fs?.active === feat.id ? feat.color : 'var(--text-secondary)',
                      borderColor: fs?.active === feat.id ? feat.color + '66' : 'var(--glass-border)',
                      background: fs?.active === feat.id ? feat.color + '15' : '',
                    }}
                    disabled={fs?.loading}
                  >
                    {fs?.loading && fs?.active === feat.id ? <Loader2 size={14} className="animate-spin" /> : feat.icon}
                    {feat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Feature Viewer */}
            <AnimatePresence>
              {fs && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="premium-feature-viewer"
                  style={{ marginTop: '1rem' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontSize: '1rem' }}>
                      <Sparkles size={16} />
                      {premiumFeatures.find(f => f.id === fs.active)?.label}
                    </h4>
                    <button onClick={() => closeFeatureViewer(cardId)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      <X size={18} />
                    </button>
                  </div>

                  {fs.loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', padding: '2rem', justifyContent: 'center' }}>
                      <Loader2 size={22} className="animate-spin" color="var(--secondary)" /> Generating...
                    </div>
                  ) : fs.error ? (
                    <div style={{ color: '#ef4444', padding: '1rem', background: 'rgba(239,68,68,0.08)', borderRadius: '8px' }}>{fs.error}</div>
                  ) : fs.data ? (
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', maxHeight: '400px', overflowY: 'auto' }}>
                      {fs.active === 'generate_folder_structure' || fs.active === 'generate_architecture' ? (
                        <pre style={{ background: 'transparent', padding: 0, margin: 0, color: '#e2e8f0', fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}><code>{fs.data}</code></pre>
                      ) : fs.active === 'generate_tech_stack' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                          {fs.data.split('\n').filter(l => l.includes(':')).map((line, i) => {
                            const [title, ...rest] = line.split(':');
                            return (
                              <div key={i} className="tech-stack-card">
                                <span className="tech-stack-title">{title.replace(/[*#]/g, '').trim()}</span>
                                <span className="tech-stack-value">{rest.join(':').replace(/[*#]/g, '').trim()}</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="markdown-body" style={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)', lineHeight: 1.7 }}>{fs.data}</div>
                      )}
                    </div>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Generator Section ────────────────────────────────────────────────────────
const GeneratorSection = () => {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [featureState, setFeatureState] = useState({});

  const [searchHistory, setSearchHistory] = useState(() => {
    try { const s = localStorage.getItem('ideagen_history'); const p = s ? JSON.parse(s) : []; return Array.isArray(p) ? p : []; } catch { return []; }
  });
  const [favorites, setFavorites] = useState(() => {
    try { const s = localStorage.getItem('ideagen_favorites'); const p = s ? JSON.parse(s) : []; return Array.isArray(p) ? p : []; } catch { return []; }
  });

  const chatEndRef = useRef(null);

  useEffect(() => { localStorage.setItem('ideagen_history', JSON.stringify(searchHistory)); }, [searchHistory]);
  useEffect(() => { localStorage.setItem('ideagen_favorites', JSON.stringify(favorites)); }, [favorites]);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const toggleFavorite = (project) => {
    setFavorites(prev => {
      const exists = prev.some(p => p.title === project.title);
      return exists ? prev.filter(p => p.title !== project.title) : [...prev, project];
    });
  };

  const handleFeatureRequest = async (project, cardId, featureEndpoint) => {
    setFeatureState(prev => ({ ...prev, [cardId]: { loading: true, active: featureEndpoint, data: null, error: null } }));
    try {
      const res = await fetch(`https://final-year-project-idea-generator.onrender.com/${featureEndpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: project.title, description: project.description })
      });
      const data = await res.json();
      if (data.success) {
        setFeatureState(prev => ({ ...prev, [cardId]: { loading: false, active: featureEndpoint, data: data.content, error: null } }));
      } else {
        setFeatureState(prev => ({ ...prev, [cardId]: { loading: false, active: featureEndpoint, data: null, error: data.error || 'Failed.' } }));
      }
    } catch {
      setFeatureState(prev => ({ ...prev, [cardId]: { loading: false, active: featureEndpoint, data: null, error: 'Network error.' } }));
    }
  };

  const closeFeatureViewer = (cardId) => {
    setFeatureState(prev => { const n = { ...prev }; delete n[cardId]; return n; });
  };

  const suggestions = ['Machine Learning', 'Deep Learning', 'Cyber Security', 'IoT', 'Blockchain', 'Agriculture', 'Web Development', 'Cloud Computing'];

  const generateIdeas = async (domain) => {
    if (!domain.trim()) return;
    const newHistory = [...chatHistory, { role: 'user', content: domain }];
    setChatHistory(newHistory);
    setUserInput('');
    setIsLoading(true);
    setSearchHistory(prev => [domain, ...prev.filter(h => h !== domain)].slice(0, 10));
    setTimeout(scrollToBottom, 100);

    try {
      const res = await fetch('https://final-year-project-idea-generator.onrender.com/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.projects) && data.projects.length > 0) {
        setChatHistory([...newHistory, { role: 'ai', projects: data.projects }]);
      } else {
        setChatHistory([...newHistory, { role: 'error', content: data.error || 'No projects returned.' }]);
      }
    } catch {
      setChatHistory([...newHistory, { role: 'error', content: "Failed to connect to the backend server. Please try again later." }]);
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  return (
    <section id="generator" className="section container generator-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%' }}>
          <div className="sidebar-section">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
              <History size={16} /> Recent Searches
            </h4>
            {searchHistory.length === 0 ? (
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>No history yet.</p>
            ) : searchHistory.map((term, i) => (
              <div key={i} className="sidebar-item" onClick={() => generateIdeas(term)}>
                <span>{term}</span>
                <MessageSquare size={14} style={{ opacity: 0.5 }} />
              </div>
            ))}
          </div>

          <div className="sidebar-section">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
              <Star size={16} /> Favorites
            </h4>
            {favorites.length === 0 ? (
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>No favorites yet.</p>
            ) : favorites.map((fav, i) => (
              <div key={i} className="sidebar-item">
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{fav.title}</span>
                <Star size={14} color="#eab308" fill="#eab308" />
              </div>
            ))}
          </div>

          <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
            <button onClick={() => setChatHistory([])} className="btn-glass" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}>
              <Trash2 size={16} /> Clear Chat
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="text-center mb-12">
          <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-1px' }}>AI Project <span className="gradient-text">Assistant</span></h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem' }}>Enter a domain to receive 5 structured, professional project proposals.</p>
        </div>

        <div className="glass" style={{ width: '100%', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', minHeight: '600px' }}>
          {/* Chat History */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingRight: '0.5rem' }}>
            {chatHistory.length === 0 && (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', flexDirection: 'column', gap: '1rem' }}>
                <Brain size={48} style={{ opacity: 0.5, color: 'var(--primary)' }} />
                <p>Waiting for your input...</p>
              </div>
            )}

            <AnimatePresence>
              {chatHistory.map((msg, idx) => {
                if (msg.role === 'user') {
                  return (
                    <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass card"
                      style={{ padding: '1.5rem', alignSelf: 'flex-end', maxWidth: '70%', background: 'rgba(124,58,237,0.1)', borderColor: 'rgba(124,58,237,0.3)' }}
                    >
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                          <User size={20} color="var(--secondary)" />
                        </div>
                        <p style={{ color: 'var(--text-primary)' }}>{msg.content}</p>
                      </div>
                    </motion.div>
                  );
                }

                if (msg.role === 'error') {
                  return (
                    <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass card"
                      style={{ padding: '1.5rem', alignSelf: 'flex-start', background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)' }}
                    >
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <AlertCircle size={20} color="#ef4444" />
                        <p style={{ color: '#ef4444' }}>{msg.content}</p>
                      </div>
                    </motion.div>
                  );
                }

                if (msg.role === 'ai' && msg.projects) {
                  return (
                    <motion.div key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: 'rgba(0,229,255,0.05)', borderRadius: '10px', border: '1px solid rgba(0,229,255,0.1)' }}>
                        <Bot size={20} color="var(--primary)" />
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                          Generated <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{msg.projects.length} project ideas</span> — click any card to explore
                        </span>
                      </div>

                      {msg.projects.map((project, bIdx) => {
                        const cardId = `${idx}-${bIdx}`;
                        return (
                          <ProjectCard
                            key={cardId}
                            project={project}
                            cardId={cardId}
                            index={bIdx}
                            favorites={favorites}
                            toggleFavorite={toggleFavorite}
                            featureState={featureState}
                            handleFeatureRequest={handleFeatureRequest}
                            closeFeatureViewer={closeFeatureViewer}
                          />
                        );
                      })}
                    </motion.div>
                  );
                }

                return null;
              })}
            </AnimatePresence>

            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass card"
                style={{ padding: '1.5rem', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '1rem' }}
              >
                <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                  <Bot size={20} color="var(--primary)" />
                </div>
                <span className="gradient-text" style={{ fontWeight: 600 }}>Generating project ideas...</span>
                <AITypingIndicator />
              </motion.div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {suggestions.map((chip, i) => (
                <button key={i} onClick={() => generateIdeas(chip)} className="btn-glass"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', borderRadius: '99px' }} disabled={isLoading}>
                  {chip}
                </button>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); generateIdeas(userInput); }} style={{ display: 'flex', gap: '1rem' }}>
              <input
                type="text" value={userInput} onChange={e => setUserInput(e.target.value)}
                placeholder="E.g., Artificial Intelligence in Healthcare..."
                disabled={isLoading} className="glass"
                style={{ flex: 1, padding: '1rem 1.5rem', fontSize: '1rem', color: 'white', outline: 'none', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)' }}
              />
              <button type="submit" disabled={isLoading || !userInput.trim()} className="btn-primary" style={{ padding: '0 1.5rem' }}>
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── Static Sections ──────────────────────────────────────────────────────────
const HowItWorks = () => {
  const steps = [
    { icon: <Database size={28} />, title: '1. Input Domain', desc: 'Enter your preferred field like Machine Learning, IoT, or Web Dev.' },
    { icon: <Brain size={28} />, title: '2. AI Analysis', desc: 'Our AI analyzes current industry trends and academic gaps in real-time.' },
    { icon: <Lightbulb size={28} />, title: '3. Get Ideas', desc: 'Receive 5 fully structured project proposals with all details.' }
  ];
  return (
    <section id="how-it-works" className="section container">
      <div className="text-center mb-12">
        <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-1px' }}>How It <span className="gradient-text">Works</span></h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem' }}>Three simple steps to your perfect project idea.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {steps.map((step, i) => (
          <motion.div key={i} className="glass card text-center" style={{ padding: '3rem 2rem' }}
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2, duration: 0.6 }} viewport={{ once: true }}>
            <div className="icon-wrapper" style={{ margin: '0 auto 1.5rem auto' }}>{step.icon}</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 700 }}>{step.title}</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const Features = () => {
  const features = [
    { icon: <Rocket size={24} />, title: 'Instant Generation', desc: 'Get 5 structured project ideas in seconds powered by advanced inference.' },
    { icon: <Code size={24} />, title: 'Tech Stack Included', desc: 'Know exactly what technologies to use to build it.' },
    { icon: <Shield size={24} />, title: 'Industry Relevant', desc: 'Ideas perfectly aligned with current market demands.' },
    { icon: <Layers size={24} />, title: 'Exportable Reports', desc: 'Download per-project PDF and DOCX documents instantly.' }
  ];
  return (
    <section id="features" className="section container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '4rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 450px' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-1px' }}>Powerful <br /><span className="gradient-text">Features</span></h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', marginBottom: '2.5rem', lineHeight: 1.7 }}>
            Our assistant doesn't just give you a title. It provides a comprehensive blueprint — from tech stack to viva questions — designed to impress your professors.
          </p>
        </div>
        <div style={{ flex: '1 1 450px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {features.map((f, i) => (
            <motion.div key={i} className="glass card" style={{ padding: '2rem' }}
              initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1, duration: 0.5 }} viewport={{ once: true }}>
              <div className="icon-wrapper" style={{ width: '48px', height: '48px' }}>{f.icon}</div>
              <h4 style={{ fontSize: '1.125rem', marginBottom: '0.75rem', fontWeight: 700 }}>{f.title}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Benefits = () => {
  const benefits = [
    "Saves weeks of brainstorming time",
    "Ensures project uniqueness and viability",
    "Aligns with modern tech stacks (React, Flask, AI)",
    "Provides clear problem statements for documentation",
    "Highlights future scope for scalable architecture"
  ];
  return (
    <section id="benefits" className="section container">
      <motion.div className="glass card" style={{ padding: '5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}
        initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
        <div style={{ position: 'absolute', top: '-50%', left: '-20%', width: '300px', height: '300px', background: 'var(--secondary)', filter: 'blur(100px)', opacity: 0.3, zIndex: 0 }}></div>
        <div style={{ position: 'absolute', bottom: '-50%', right: '-20%', width: '300px', height: '300px', background: 'var(--primary)', filter: 'blur(100px)', opacity: 0.3, zIndex: 0 }}></div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '2.5rem', letterSpacing: '-1px' }}>Why Use Our <span className="gradient-text">Generator?</span></h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'flex-start', textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
            {benefits.map((b, i) => (
              <motion.div key={i}
                style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.03)', padding: '1rem 1.5rem', borderRadius: '12px', width: '100%', border: '1px solid rgba(255,255,255,0.05)' }}
                whileHover={{ x: 10, background: 'rgba(0,229,255,0.05)', borderColor: 'rgba(0,229,255,0.2)' }}>
                <CheckCircle size={24} color="var(--primary)" style={{ filter: 'drop-shadow(0 0 8px rgba(0,229,255,0.5))' }} />
                <span style={{ fontSize: '1.125rem', color: 'var(--text-primary)', fontWeight: 500 }}>{b}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

const Footer = () => (
  <footer style={{ borderTop: '1px solid var(--glass-border)', padding: '4rem 0', marginTop: '5rem', background: 'rgba(2,6,23,0.8)', backdropFilter: 'blur(10px)' }}>
    <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Sparkles className="gradient-text" style={{ width: '28px', height: '28px' }} />
        <span style={{ fontWeight: 800, fontSize: '1.5rem' }} className="gradient-text">IdeaGen AI</span>
      </div>
      <p style={{ color: 'var(--text-secondary)' }}>© 2026 IdeaGen AI SaaS. All rights reserved.</p>
    </div>
  </footer>
);

// ─── App Root ─────────────────────────────────────────────────────────────────
function App() {
  return (
    <>
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      <div className="blob blob-3"></div>
      <Navbar />
      <Hero />
      <GeneratorSection />
      <HowItWorks />
      <Features />
      <Benefits />
      <Footer />
    </>
  );
}

export default App;
