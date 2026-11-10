import React from 'react';
import { useChallenges } from '../hooks/useChallenges.js';
import { Navbar } from '../components/Navbar.js';
import { Sidebar } from '../components/Sidebar.js';
import { DifficultyPill } from '../components/DifficultyPill.js';
import { SharkOceanSimulation } from '../components/SharkTank/SharkOceanSimulation.js';

export const ChallengePage: React.FC = () => {
  const {
    challenges,
    selectedChallenge,
    sidebarOpen,
    loadChallengeDetail,
    toggleSidebar,
    closeSidebar
  } = useChallenges();

  return (
    <div className="app-wrapper">
      <Navbar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      <div className="zoom-workspace">
        {sidebarOpen && (
          <div className="sidebar-backdrop" onClick={closeSidebar} />
        )}

        <Sidebar
          challenges={challenges}
          selectedChallenge={selectedChallenge}
          sidebarOpen={sidebarOpen}
          onSelectChallenge={loadChallengeDetail}
        />

        <main className="zoom-detail-area">
          {selectedChallenge ? (
            <>
              <div className="detail-top-card">
                <div className="challenge-title-row">
                  <h2>{selectedChallenge.title}</h2>
                  <DifficultyPill difficulty={selectedChallenge.difficulty} />
                  <span
                    className="zoom-pill"
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: '#d1c4e9',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    {selectedChallenge.category}
                  </span>
                </div>
                <p
                  className="challenge-text-desc"
                  style={{ fontSize: '1rem', color: '#f3e8ff', fontWeight: 500 }}
                >
                  {selectedChallenge.description || 'Avalie o comportamento do jogo e identifique problemas.'}
                </p>
              </div>

              <div style={{ flex: 1, padding: '1.25rem', display: 'flex', minHeight: '520px' }}>
                <SharkOceanSimulation />
              </div>
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
};

export default ChallengePage;
