# Shark Tank: Abyssal Exile

*Híbrido de Incremental Simulation (Cookie Clicker) com ARPG Profundo (Path of Exile)*

## Visão Geral
- **Layout Tripartido (42% | 20% | 38%):** Oceano ao vivo em Canvas 2D na esquerda, telemetria em tempo real no centro e painel lateral permanente com 3 abas na direita (`🌳 Passivas`, `⚡ Skills`, `🗺️ Dificuldade`).
- **Árvore de Passivas (Regra da Proporção 1:10):** Grafo conectado com **300 variações de nós** (210 Menores, 72 Notáveis e 18 Keystones) dividido em 4 quadrantes de 75 nós, com teto estrito de **Nível 30 (máximo de 30 pontos = 10% da árvore)**.
- **Sistema Limitante de 2 Habilidades Habilitadas:** Escolha 2 habilidades do catálogo (`Bote Voraz`, `Vórtice de Cauda`, `Salva de Dentículos`, `Frenesi do Megalodonte`, `Propulsão Evasiva`), com custos de Fôlego e Cargas de Frenesi, e máquina de estados de obediência estrita ao clique (`PATRULHA_AUTOMATICA` vs `COMANDO_MANUAL`).
- **Map Device Exponencial & Ciclo de Derrota:** Tiers 1 a 16, crafting de afixos, teto de 34 entidades simultâneas e pausa total na morte com relatório analítico de óbito.

## Execução com Docker (Porta 5173)

```bash
docker compose up -d --build
```
- Aplicação unificada (Frontend React + API + SQLite WAL): `http://localhost:5173`

## Execução Local (Desenvolvimento)

```bash
npm run install:all
npm run dev
```
- Frontend (Vite): `http://localhost:5173` (com proxy `/api` para `http://localhost:5000`)
- Backend (Express + SQLite WAL): `http://localhost:5000`
