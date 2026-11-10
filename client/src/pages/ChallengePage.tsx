import React from 'react';
import { useChallenges } from '../hooks/useChallenges.js';
import { Navbar } from '../components/Navbar.js';
import { Sidebar } from '../components/Sidebar.js';
import { DifficultyPill } from '../components/DifficultyPill.js';
import { SharkOceanSimulation } from '../components/SharkTank/SharkOceanSimulation.js';
import {
  AppWrapper,
  WorkspaceLayout,
  SidebarBackdrop,
  DetailArea,
  DetailTopCard,
  ChallengeTitleRow,
  CategoryPill,
  ChallengeDescription,
  SimulationContainer,
  EmptySelectionMessage
} from './ChallengePage.styles.js';

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
    <AppWrapper>
      <Navbar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      <WorkspaceLayout>
        {sidebarOpen && (
          <SidebarBackdrop onClick={closeSidebar} />
        )}

        <Sidebar
          challenges={challenges}
          selectedChallenge={selectedChallenge}
          sidebarOpen={sidebarOpen}
          onSelectChallenge={loadChallengeDetail}
        />

        <DetailArea>
          {selectedChallenge ? (
            <>
              <DetailTopCard>
                <ChallengeTitleRow>
                  <h2>{selectedChallenge.title}</h2>
                  <DifficultyPill difficulty={selectedChallenge.difficulty} />
                  <CategoryPill>{selectedChallenge.category}</CategoryPill>
                </ChallengeTitleRow>
                <ChallengeDescription>
                  {selectedChallenge.description || 'Avalie o comportamento do jogo e identifique problemas.'}
                </ChallengeDescription>
              </DetailTopCard>

              <SimulationContainer>
                <SharkOceanSimulation />
              </SimulationContainer>
            </>
          ) : (
            <EmptySelectionMessage>
              Selecione um desafio na lista lateral.
            </EmptySelectionMessage>
          )}
        </DetailArea>
      </WorkspaceLayout>
    </AppWrapper>
  );
};

export default ChallengePage;
