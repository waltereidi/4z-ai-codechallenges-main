import React from 'react';
import OceanCanvas from './components/OceanCanvas';

// Substituído conforme Sprint 2: Removida a simulação de 3 tubarões concorrentes
// em favor do controle tático do Tubarão Alfa Predador contra Presas e Inimigos do Mar.
export default function SharkOceanSimulation(props) {
  return <OceanCanvas {...props} />;
}
