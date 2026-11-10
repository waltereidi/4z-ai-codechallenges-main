import React from 'react';
import { History } from 'lucide-react';
import { EatenLogItem } from '../../types/simulation.js';
import {
  DrawerContainer,
  DrawerTitle,
  DrawerGrid,
  LogPill,
  LogShark,
  LogTime,
  LogTam,
  LogContent
} from './EatenLogDrawer.styles.js';

interface EatenLogDrawerProps {
  logs: EatenLogItem[];
}

export const EatenLogDrawer: React.FC<EatenLogDrawerProps> = ({ logs }) => {
  if (logs.length === 0) return null;

  return (
    <DrawerContainer>
      <DrawerTitle>
        <History size={14} color="#fa6400" />
        <span>peixes_comidos:</span>
      </DrawerTitle>
      <DrawerGrid>
        {logs.map((log, idx) => (
          <LogPill
            key={log.id || `${log.peixe_id}-${log.hora_comeu}-${idx}`}
          >
            <LogShark>{log.tubarao_nome}</LogShark>
            <LogTime>{new Date(log.hora_comeu).toLocaleTimeString()}</LogTime>
            <LogTam>{log.tamanho_peixe}px</LogTam>
            <LogContent>{log.conteudo_peixe}</LogContent>
          </LogPill>
        ))}
      </DrawerGrid>
    </DrawerContainer>
  );
};
