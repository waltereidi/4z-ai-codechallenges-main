import React, { useState, useEffect } from 'react';
import { Code2, Menu, X, Waves } from 'lucide-react';
import SharkOceanSimulation from './SharkOceanSimulation';
import './App.css';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function App() {
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [code, setCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Buscar lista de desafios
  useEffect(() => {
    fetch(`${API_BASE}/challenges`)
      .then(res => res.json())
      .then(data => {
        setChallenges(data);
        if (data.length > 0) {
          loadChallengeDetail(data[0].id);
        } else {
          setSelectedChallenge(null);
        }
      })
      .catch(err => {
        console.error('Erro ao conectar com API:', err);
      });
  }, []);

  const loadChallengeDetail = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/challenges/${id}`);
      const data = await res.json();
      setSelectedChallenge(data);
      setCode(data.initialCode || '');
      setExecutionResult(null);
      setSidebarOpen(false);
    } catch (err) {
      console.error('Erro ao carregar detalhes:', err);
    }
  };

  const handleRunTests = async () => {
    if (!selectedChallenge) return;
    setIsRunning(true);
    setExecutionResult(null);

    try {
      const res = await fetch(`${API_BASE}/challenges/${selectedChallenge.id}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      setExecutionResult(data);
    } catch (err) {
      setExecutionResult({
        success: false,
        error: `Falha na conexão com o servidor: ${err.message}`
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleResetCode = () => {
    if (selectedChallenge) {
      setCode(selectedChallenge.initialCode || '');
      setExecutionResult(null);
    }
  };

  const getDifficultyPill = (diff) => {
    switch (diff) {
      case 'Fácil':
        return <span className="zoom-pill pill-easy">Fácil</span>;
      case 'Médio':
        return <span className="zoom-pill pill-medium">Médio</span>;
      case 'Difícil':
        return <span className="zoom-pill pill-hard">Difícil</span>;
      default:
        return <span className="zoom-pill">{diff}</span>;
    }
  };

  return (
    <div className="app-wrapper">
      {/* 4zOOm Header */}
      <header className="zoom-navbar">
        <div className="zoom-brand-group">
          <button
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <img src="/logo-4zoom-branco.png" alt="4zOOm Logo" className="zoom-logo-img" />
          <span className="zoom-badge-platform">AI Challenges</span>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="zoom-workspace">
        {/* Backdrop para mobile */}
        {sidebarOpen && (
          <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar com Lista de Desafios */}
        <aside className={`zoom-sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
          <div className="sidebar-header">
            <span className="sidebar-header-title">Desafios ({challenges.length})</span>
            <Waves size={16} color="#b03af0" />
          </div>

          <div className="challenge-list">
            {challenges.length === 0 ? (
              <div style={{ padding: '2rem 1.25rem', textAlign: 'center', color: 'var(--text-subtle)', fontSize: '0.85rem' }}>
                Nenhum desafio cadastrado.
              </div>
            ) : (
              challenges.map(c => (
                <div
                  key={c.id}
                  className={`challenge-item ${selectedChallenge?.id === c.id ? 'active' : ''}`}
                  onClick={() => loadChallengeDetail(c.id)}
                >
                  <div className="challenge-item-title">{c.title}</div>
                  <div className="challenge-item-meta">
                    <span>{c.category}</span>
                    {getDifficultyPill(c.difficulty)}
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Painel do Desafio / Bloco da Direita */}
        <main className="zoom-detail-area">
          {selectedChallenge ? (
            <>
              <div className="detail-top-card">
                <div className="challenge-title-row">
                  <h2>{selectedChallenge.title}</h2>
                  {getDifficultyPill(selectedChallenge.difficulty)}
                  <span
                    className="zoom-pill"
                    style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#d1c4e9', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    {selectedChallenge.category}
                  </span>
                </div>
                <p className="challenge-text-desc" style={{ fontSize: '1rem', color: '#f3e8ff', fontWeight: 500 }}>
                  Avalie o comportamento do jogo e identifique problemas.
                </p>
              </div>

              {/* Bloco da Direita: Oceano e Tubarões */}
              {selectedChallenge.id === 'ocean-sharks-multithread' ? (
                <div style={{ flex: 1, padding: '1.25rem', display: 'flex', minHeight: '520px' }}>
                  <SharkOceanSimulation />
                </div>
              ) : (
                <div className="zoom-split-pane">
                  <div className="editor-box">
                    <div className="pane-bar">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Code2 size={15} color="#fa6400" /> Solução JavaScript
                      </span>
                    </div>
                    <textarea
                      className="code-textarea"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      spellCheck="false"
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Selecione um desafio na lista lateral.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
