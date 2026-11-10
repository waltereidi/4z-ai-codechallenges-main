import React from 'react';
import { History } from 'lucide-react';
import { EatenLogItem } from '../../types/simulation.js';

interface EatenLogDrawerProps {
  logs: EatenLogItem[];
}

export const EatenLogDrawer: React.FC<EatenLogDrawerProps> = ({ logs }) => {
  if (logs.length === 0) return null;

  return (
    <div className="eaten-log-drawer">
      <div className="eaten-log-title">
        <History size={14} color="#fa6400" />
        <span>peixes_comidos:</span>
      </div>
      <div className="eaten-log-grid">
        {logs.map((log, idx) => (
          <div
            key={log.id || `${log.peixe_id}-${log.hora_comeu}-${idx}`}
            className="eaten-log-pill"
          >
            <span className="log-shark">{log.tubarao_nome}</span>
            <span className="log-time">{new Date(log.hora_comeu).toLocaleTimeString()}</span>
            <span className="log-tam">{log.tamanho_peixe}px</span>
            <span className="log-content">{log.conteudo_peixe}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
