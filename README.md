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

## Deploy Automatizado (CI/CD) & Produção HTTPS

O projeto possui esteira de integração e entrega contínua via **GitHub Actions** (`.github/workflows/deploy.yml`):

1. **Pipeline de Deploy:** A cada `git push` na branch `main`, o runner valida a compilação da imagem Docker e realiza o deploy via SSH no servidor de produção.
2. **Nginx Reverse Proxy & HTTPS:** Em produção, o Nginx publica a aplicação na porta **443 (HTTPS)** redirecionando internamente para `127.0.0.1:5173`, com redirecionamento automático de HTTP (porta 80) para HTTPS (301).
3. **Secrets Necessários no GitHub:**
   - `SSH_HOST`: IP ou hostname do servidor.
   - `SSH_PORT`: Porta SSH (padrão `22`).
   - `SSH_USER`: Usuário de deploy (`deploy`).
   - `SSH_PRIVATE_KEY`: Chave privada Ed25519 dedicada ao GitHub Actions.
   - `SSH_KNOWN_HOSTS`: Chave pública do host (`ssh-keyscan`).
   - `DEPLOY_PATH`: Diretório da aplicação no servidor (`/opt/sharktank`).
   - `APP_HEALTHCHECK_URL`: URL pública para validação pós-deploy (`https://seu-dominio/`).
