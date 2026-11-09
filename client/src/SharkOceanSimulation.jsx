import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Waves, Database, History } from 'lucide-react';
import './SharkOceanSimulation.css';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function generateRandomContent() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+áéíóú';
  const length = Math.floor(Math.random() * 45) + 5;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const SHARK_WORKER_CODE = `
  let isRunning = false;
  let x = Math.random() * 50 + 10;
  let y = 30;
  let baseY = 30;
  let speed = 1.6 + Math.random() * 2.2;
  let direction = Math.random() > 0.5 ? 1 : -1;
  let verticalSpeed = 0.3;
  let timer = null;

  self.onmessage = function(e) {
    const { action } = e.data;
    if (action === 'START') {
      if (!isRunning) {
        isRunning = true;
        loop();
      }
    } else if (action === 'INIT') {
      baseY = e.data.initialY || 30;
      y = baseY;
      x = e.data.initialX || 10;
    } else if (action === 'PAUSE') {
      isRunning = false;
      if (timer) clearTimeout(timer);
    } else if (action === 'RESET') {
      isRunning = false;
      if (timer) clearTimeout(timer);
      x = e.data.initialX || 10;
      y = baseY;
      speed = 1.6 + Math.random() * 2;
      direction = 1;
      self.postMessage({ x, y, speed, direction: 'right' });
    }
  };

  function loop() {
    if (!isRunning) return;

    const delta = (Math.random() - 0.5) * 0.4;
    speed = Math.max(0.8, Math.min(6.2, speed + delta));
    x += speed * direction * 0.35;

    y += verticalSpeed;
    if (y > baseY + 12 || y < baseY - 12 || y > 82 || y < 14) {
      verticalSpeed *= -1;
    }

    if (x >= 88) {
      x = 88;
      direction = -1;
    } else if (x <= 2) {
      x = 2;
      direction = 1;
    }

    self.postMessage({
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
      speed: Number(speed.toFixed(2)),
      direction: direction === 1 ? 'right' : 'left'
    });

    timer = setTimeout(loop, 20);
  }
`;

export default function SharkOceanSimulation() {
  const [isRunning, setIsRunning] = useState(false);
  const [sharks, setSharks] = useState([
    { id: 1, name: 'Tubarão Branco', x: 8, y: 22, speed: 2.1, direction: 'right', color: '#60a5fa', eatenCount: 0 },
    { id: 2, name: 'Tubarão Martelo', x: 45, y: 50, speed: 3.2, direction: 'left', color: '#fa6400', eatenCount: 0 },
    { id: 3, name: 'Tubarão Tigre', x: 75, y: 76, speed: 1.9, direction: 'right', color: '#c084fc', eatenCount: 0 }
  ]);

  const [fishes, setFishes] = useState([]);
  const [eatenLog, setEatenLog] = useState([]);
  const workersRef = useRef([]);
  const sharksRef = useRef(sharks);
  const fishesRef = useRef(fishes);

  useEffect(() => {
    sharksRef.current = sharks;
  }, [sharks]);

  useEffect(() => {
    fishesRef.current = fishes;
  }, [fishes]);

  useEffect(() => {
    fetch(`${API_BASE}/shark-tank/stats`)
      .then(res => res.json())
      .then(stats => {
        if (stats.sharksCounts) {
          setSharks(prev =>
            prev.map(s => {
              const found = stats.sharksCounts.find(item => item.tubarao_id === s.id);
              return { ...s, eatenCount: found ? found.count : 0 };
            })
          );
        }
        if (stats.historicoRecente) {
          setEatenLog(stats.historicoRecente);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const blob = new Blob([SHARK_WORKER_CODE], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);

    workersRef.current = sharks.map((shark, index) => {
      const worker = new Worker(workerUrl);

      worker.postMessage({
        action: 'INIT',
        initialX: shark.x,
        initialY: shark.y
      });

      worker.onmessage = (e) => {
        const { x, y, speed, direction } = e.data;
        setSharks((prev) => {
          const next = [...prev];
          next[index] = {
            ...next[index],
            x,
            y,
            speed,
            direction
          };
          return next;
        });
      };

      return worker;
    });

    return () => {
      workersRef.current.forEach((w) => w.terminate());
      URL.revokeObjectURL(workerUrl);
    };
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const fishSpawner = setInterval(() => {
      if (fishesRef.current.length >= 18) return;

      const randomTamanho = Math.floor(Math.random() * 26) + 14;
      const rawContent = generateRandomContent();
      const randomContent = rawContent.normalize('NFD');
      const fishColors = ['#f43f5e', '#ec4899', '#8b5cf6', '#14b8a6', '#06b6d4', '#eab308', '#10b981', '#f97316'];
      const randomColor = fishColors[Math.floor(Math.random() * fishColors.length)];

      const tiers = [
        Math.random() * 20 + 15,
        Math.random() * 25 + 40,
        Math.random() * 20 + 65
      ];
      const targetY = tiers[Math.floor(Math.random() * tiers.length)];

      const newFish = {
        id: 'fish_' + Math.random().toString(36).substring(2, 9),
        conteudo: randomContent,
        tamanho: randomTamanho,
        x: Math.random() * 84 + 6,
        y: targetY,
        cor: randomColor,
        criado_em: new Date().toISOString()
      };

      fetch(`${API_BASE}/shark-tank/fish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFish)
      }).catch(() => {});

      setFishes(prev => [...prev, newFish]);
    }, 1800);

    return () => clearInterval(fishSpawner);
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) return;

    const collisionDetector = setInterval(() => {
      const currentSharks = sharksRef.current;
      const currentFishes = fishesRef.current;
      if (currentFishes.length === 0) return;

      const remainingFishes = [];
      const consumedMap = {};

      currentFishes.forEach((fish) => {
        let eatenBy = null;

        for (const shark of currentSharks) {
          const dx = Math.abs(shark.x - fish.x);
          const dy = Math.abs(shark.y - fish.y);

          if (dx < 7.5 && dy < 12.0) {
            eatenBy = shark;
            break;
          }
        }

        if (eatenBy) {
          consumedMap[eatenBy.id] = (consumedMap[eatenBy.id] || 0) + 1;

          fetch(`${API_BASE}/shark-tank/eat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              peixe_id: fish.id,
              tubarao_id: eatenBy.id,
              tubarao_nome: eatenBy.name,
              x_captura: fish.x,
              y_captura: fish.y
            })
          })
            .then(res => res.json())
            .then(data => {
              if (data && data.success) {
                setEatenLog(prev => [
                  {
                    id: Date.now(),
                    peixe_id: fish.id,
                    tubarao_nome: eatenBy.name,
                    tamanho_peixe: fish.tamanho,
                    conteudo_peixe: fish.conteudo,
                    hora_comeu: data.hora_comeu
                  },
                  ...prev.slice(0, 9)
                ]);
              }
            })
            .catch(() => {});
        } else {
          remainingFishes.push(fish);
        }
      });

      if (remainingFishes.length !== currentFishes.length) {
        setFishes(remainingFishes);
      }

      if (Object.keys(consumedMap).length > 0) {
        setSharks(prev =>
          prev.map(s => {
            const added = consumedMap[s.id] || 0;
            return added > 0 ? { ...s, eatenCount: s.eatenCount + added } : s;
          })
        );
      }
    }, 80);

    return () => clearInterval(collisionDetector);
  }, [isRunning]);

  const handleStart = () => {
    setIsRunning(true);
    workersRef.current.forEach((worker) => {
      worker.postMessage({ action: 'START' });
    });
  };

  const handlePause = () => {
    setIsRunning(false);
    workersRef.current.forEach((worker) => {
      worker.postMessage({ action: 'PAUSE' });
    });
  };

  const handleReset = () => {
    setIsRunning(false);
    const starts = [8, 45, 75];
    workersRef.current.forEach((worker, idx) => {
      worker.postMessage({ action: 'RESET', initialX: starts[idx] });
    });
    setFishes([]);
    fetch(`${API_BASE}/shark-tank/reset`, { method: 'POST' })
      .then(() => {
        setSharks(prev => prev.map(s => ({ ...s, eatenCount: 0 })));
        setEatenLog([]);
      })
      .catch(() => {});
  };

  return (
    <div className="ocean-container">
      <div className="ocean-top-bar">
        <div className="ocean-title-group">
          <Waves size={20} color="#00e5ff" />
          <span>Shark Tank</span>
        </div>
        <div className="ocean-thread-pills">
          <div className="thread-telemetry-badge" style={{ borderColor: '#38bdf8' }}>
            <Database size={12} color="#38bdf8" />
            <span>Peixes no Tanque: <strong>{fishes.length}</strong></span>
          </div>
          {sharks.map((s) => (
            <div key={s.id} className="thread-telemetry-badge" style={{ borderColor: s.color }}>
              <span className="dot" style={{ backgroundColor: isRunning ? '#10b981' : '#f59e0b' }} />
              <strong>{s.name}:</strong> Comeu {s.eatenCount} 🐟
            </div>
          ))}
        </div>
      </div>

      <div className="ocean-aquarium">
        <div className="ocean-water-layer" />
        <div className="ocean-bubbles">
          <span className="bubble b1" />
          <span className="bubble b2" />
          <span className="bubble b3" />
          <span className="bubble b4" />
          <span className="bubble b5" />
        </div>

        {!isRunning && (
          <div className="start-overlay">
            <button className="btn-ocean-start" onClick={handleStart}>
              <Play size={28} fill="#ffffff" />
              <span>INICIAR</span>
            </button>
          </div>
        )}

        {fishes.map((fish) => (
          <div
            key={fish.id}
            className="fish-entity"
            style={{
              left: `${fish.x}%`,
              top: `${fish.y}%`,
              width: `${fish.tamanho}px`,
              height: `${Math.round(fish.tamanho * 0.65)}px`
            }}
          >
            <svg viewBox="0 0 40 25" width="100%" height="100%" fill="none">
              <path
                d="M5 12 C12 4, 28 4, 38 12 C28 20, 12 20, 5 12 Z"
                fill={fish.cor}
                opacity="0.9"
              />
              <path d="M5 12 L0 5 L0 19 Z" fill={fish.cor} />
              <circle cx="32" cy="11" r="1.8" fill="#ffffff" />
              <circle cx="32.5" cy="11" r="0.9" fill="#000000" />
            </svg>
          </div>
        ))}

        {sharks.map((shark) => (
          <div
            key={shark.id}
            className="shark-entity"
            style={{
              left: `${shark.x}%`,
              top: `${shark.y}%`,
              transform: `translate(-50%, -50%) scaleX(${shark.direction === 'left' ? -1 : 1})`,
              transition: 'left 0.05s linear, top 0.05s linear'
            }}
          >
            <div
              className="shark-thread-tag"
              style={{
                transform: `scaleX(${shark.direction === 'left' ? -1 : 1})`,
                borderColor: shark.color
              }}
            >
              <span>{shark.name}</span>
              <span className="speed-label">{shark.speed.toFixed(1)} nós</span>
            </div>

            <div style={{ position: 'relative', width: '150px', height: '70px' }}>
              <svg
                className="shark-svg"
                viewBox="0 0 160 70"
                width="150"
                height="70"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 35 C35 15, 80 10, 140 32 C125 45, 80 55, 30 48 C20 48, 15 42, 15 35 Z"
                  fill={shark.color}
                  opacity="0.9"
                />
                <path d="M65 20 L80 0 L90 22 Z" fill={shark.color} />
                <path d="M75 42 L88 62 L100 44 Z" fill={shark.color} opacity="0.95" />
                <path d="M18 35 L0 12 L10 35 L0 58 Z" fill={shark.color} />
                <circle cx="125" cy="30" r="3" fill="#ffffff" />
                <circle cx="126" cy="30" r="1.5" fill="#000000" />
                <line x1="105" y1="28" x2="103" y2="38" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="110" y1="28" x2="108" y2="38" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="115" y1="28" x2="113" y2="38" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>

              <div
                className="shark-stomach-badge"
                style={{
                  transform: `translate(-50%, -50%) scaleX(${shark.direction === 'left' ? -1 : 1})`
                }}
              >
                <span className="stomach-count">{shark.eatenCount}</span>
                <span className="stomach-icon">🐟</span>
              </div>
            </div>
          </div>
        ))}

        <div className="ocean-floor">
          <div className="seabed-hill h1" />
          <div className="seabed-hill h2" />
        </div>

        <div className="ocean-bottom-right-controls">
          <button
            className="btn-ocean-pause"
            onClick={isRunning ? handlePause : handleStart}
          >
            {isRunning ? (
              <>
                <Pause size={18} fill="#ffffff" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play size={18} fill="#ffffff" />
                <span>Retomar</span>
              </>
            )}
          </button>
          <button className="btn-ocean-reset" onClick={handleReset}>
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {eatenLog.length > 0 && (
        <div className="eaten-log-drawer">
          <div className="eaten-log-title">
            <History size={14} color="#fa6400" />
            <span>peixes_comidos:</span>
          </div>
          <div className="eaten-log-grid">
            {eatenLog.map((log, idx) => (
              <div key={log.id || `${log.peixe_id}-${log.hora_comeu}-${idx}`} className="eaten-log-pill">
                <span className="log-shark">{log.tubarao_nome}</span>
                <span className="log-time">{new Date(log.hora_comeu).toLocaleTimeString()}</span>
                <span className="log-tam">{log.tamanho_peixe}px</span>
                <span className="log-content">
                  {log.conteudo_peixe}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
