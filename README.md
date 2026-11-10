# 4z AI Code Challenges

Plataforma interativa fullstack para visualização e execução de desafios de código e algoritmos inteligentes. A aplicação inclui a simulação interativa multithread em tempo real do ecossistema **Shark Tank**, na qual tubarões autônomos operam em Web Workers concorrentes, capturando peixes gerados dinamicamente no aquário e persistindo métricas e eventos em banco de dados SQLite via API REST.

---

## Sumário

1. [Descrição da Aplicação](#descrição-da-aplicação)
2. [Como Instalar e Executar](#como-instalar-e-executar)
3. [Configuração das Variáveis de Ambiente](#configuração-das-variáveis-de-ambiente)
4. [Scripts Disponíveis](#scripts-disponíveis)
5. [Estrutura Principal do Projeto](#estrutura-principal-do-projeto)
6. [Tecnologias Utilizadas](#tecnologias-utilizadas)
7. [Bibliotecas Principais](#bibliotecas-principais)
8. [Conceitos e Padrões Utilizados](#conceitos-e-padrões-utilizados)
9. [Arquitetura do Frontend](#arquitetura-do-frontend)
10. [Arquitetura do Backend](#arquitetura-do-backend)
11. [Estratégia de Testes](#estratégia-de-testes)
12. [Como Executar os Testes](#como-executar-os-testes)

---

## Descrição da Aplicação

O **4z AI Code Challenges** é um ambiente para desafios práticos de engenharia de software e inteligência artificial. O desafio em destaque é o **Shark Tank Multithread**:

- **Multithreading no Browser:** Cada tubarão possui uma thread dedicada via Web Worker (Blob URL), calculando suas coordenadas de navegação em tempo real sem bloquear a thread principal da interface.
- **Detecção de Colisão Contínua:** Hook de colisão calcula a proximidade euclidiana entre a boca do tubarão e peixes que nadam no aquário.
- **Persistência e Telemetria:** Cada peixe criado e cada evento de captura é sincronizado com o backend via HTTP, mantendo histórico de capturas, contadores individuais por tubarão e métricas em SQLite.
- **Design System Temático:** Interface responsiva construída com componentização modular e estilização com **styled-components**.

---

## Como Instalar e Executar

### Pré-requisitos
- **Node.js** (versão 20.x ou superior, recomendada 22.x)
- **npm** (versão 10.x ou superior)
- *(Opcional)* **Docker** e **Docker Compose**

### Instalação das Dependências

Instale as dependências da raiz, backend e frontend executando:

```bash
npm run install:all
```

### Execução em Modo de Desenvolvimento

Para iniciar o backend e o frontend simultaneamente:

```bash
npm run dev
```

Acesse no navegador:
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000/api](http://localhost:5000/api)

### Execução Individual dos Projetos

- **Apenas Backend:**
  ```bash
  npm --prefix server run dev
  ```
- **Apenas Frontend:**
  ```bash
  npm --prefix client run dev
  ```

### Execução via Docker Compose

```bash
docker compose up --build
```

---

## Configuração das Variáveis de Ambiente

O projeto utiliza variáveis de ambiente para eliminar credenciais, portas e configurações sensíveis hardcoded no código.

### Passo a Passo

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Ajuste as variáveis conforme o ambiente desejado.

### Variáveis Disponíveis

| Variável | Escopo | Descrição | Exemplo Padrão |
| :--- | :--- | :--- | :--- |
| `PORT` | Backend | Porta HTTP principal do servidor Express | `5000` |
| `ALT_PORT` | Backend | Porta secundária/alternativa para espelhamento | `5173` |
| `NODE_ENV` | Backend | Ambiente de execução (`development`, `production`, `test`) | `development` |
| `DB_PATH` | Backend | Caminho do arquivo de banco de dados SQLite | `./shark_tank.db` |
| `CORS_ORIGIN` | Backend | Origem permitida para requisições CORS | `http://localhost:5173` |
| `VITE_API_URL` | Frontend | URL base dos endpoints da API consumida pelo cliente | `/api` |
| `VITE_PORT` | Frontend | Porta do servidor de desenvolvimento Vite | `5173` |

> **Segurança:** Arquivos `.env` e variações `.env.*` estão devidamente configurados no `.gitignore` em todos os níveis do projeto. Apenas o arquivo `.env.example` (contendo exclusivamente os nomes das chaves, sem dados sensíveis) é mantido sob controle de versão.

---

## Scripts Disponíveis

### Na Raiz do Repositório

- `npm run install:all`: Executa `npm install` no backend e no frontend.
- `npm run dev`: Executa simultaneamente backend e frontend com suporte a hot-reload via `concurrently`.
- `npm run build`: Compila o TypeScript do backend (`tsc`) e o bundle estático do frontend (`vite build`).
- `npm test`: Executa todas as suítes de testes unitários do backend e frontend com Vitest.
- `npm run server`: Inicia o backend a partir do diretório compilado `dist/server.js`.
- `npm run client`: Inicia o servidor de desenvolvimento do Vite.

### No Backend (`server/`)

- `npm run dev`: Inicia o servidor com monitoramento de arquivos via `tsx watch`.
- `npm run build`: Compila o código TypeScript para JavaScript em `dist/`.
- `npm start`: Inicia o servidor Node.js com base nos arquivos gerados em `dist/`.
- `npm test`: Executa a suíte de testes com Vitest.

### No Frontend (`client/`)

- `npm run dev`: Inicia o servidor de desenvolvimento Vite com HMR (Hot Module Replacement).
- `npm run build`: Realiza checagem estrita de tipos com `tsc -b` e compila os assets em `dist/`.
- `npm run preview`: Inicia servidor local para inspecionar os arquivos estáticos de produção.
- `npm run test`: Executa os testes unitários do cliente com Vitest e React Testing Library.

---

## Estrutura Principal do Projeto

```
4z-ai-codechallenges/
├── .env.example                    # Template de variáveis de ambiente sem valores sensíveis
├── .gitignore                      # Regras de exclusão do Git (ignora .env, dist, *.db)
├── docker-compose.yml              # Orquestração do container de produção
├── Dockerfile                      # Build multi-stage para frontend e backend
├── package.json                    # Scripts principais e orquestrador raiz
├── README.md                       # Documentação completa do projeto
│
├── client/                         # Aplicação Frontend (React + Vite + TypeScript)
│   ├── .env.example                # Template de variáveis de ambiente do cliente
│   ├── index.html                  # Ponto de entrada HTML com tipografia
│   ├── vite.config.js              # Configuração do Vite com carregamento de .env
│   ├── tsconfig.json               # Configurações do compilador TypeScript
│   └── src/
│       ├── components/             # Componentes React com styled-components
│       │   ├── DifficultyPill.tsx
│       │   ├── DifficultyPill.styles.ts
│       │   ├── Navbar.tsx
│       │   ├── Navbar.styles.ts
│       │   ├── Sidebar.tsx
│       │   ├── Sidebar.styles.ts
│       │   └── SharkTank/          # Módulos da simulação do aquário
│       │       ├── OceanAquarium.tsx
│       │       ├── OceanAquarium.styles.ts
│       │       ├── OceanTopBar.tsx
│       │       ├── OceanTopBar.styles.ts
│       │       ├── SharkEntity.tsx
│       │       ├── SharkEntity.styles.ts
│       │       ├── FishEntity.tsx
│       │       ├── FishEntity.styles.ts
│       │       ├── EatenLogDrawer.tsx
│       │       └── EatenLogDrawer.styles.ts
│       ├── hooks/                  # Custom Hooks com regras de negócio e concorrência
│       │   ├── useChallenges.ts
│       │   ├── useSharkOceanSimulation.ts
│       │   ├── useSharkWorkers.ts
│       │   ├── useFishSpawner.ts
│       │   └── useCollisionDetection.ts
│       ├── pages/                  # Páginas principais da interface
│       │   ├── ChallengePage.tsx
│       │   └── ChallengePage.styles.ts
│       ├── services/               # Camada de comunicação com a API REST
│       │   ├── api.ts
│       │   └── api.test.ts
│       ├── types/                  # Definições de interfaces TypeScript do frontend
│       └── utils/                  # Constantes e funções utilitárias
│
└── server/                         # Aplicação Backend (Node.js + Express + TypeScript)
    ├── .env.example                # Template de variáveis de ambiente do servidor
    ├── tsconfig.json               # Configuração do TypeScript no Node.js
    ├── src/
    │   ├── server.ts               # Ponto de inicialização e injeção de dependências
    │   ├── domain/                 # Entidades de domínio e regras de negócio puras
    │   │   ├── fish.ts
    │   │   ├── eatenFish.ts
    │   │   ├── challenge.ts
    │   │   └── tankStats.ts
    │   ├── usecase/                # Casos de uso da aplicação (Clean Architecture)
    │   │   ├── createFishUseCase.ts
    │   │   ├── eatFishUseCase.ts
    │   │   ├── getChallengeByIdUseCase.ts
    │   │   ├── getChallengesUseCase.ts
    │   │   ├── getTankStatsUseCase.ts
    │   │   └── resetTankUseCase.ts
    │   ├── repository/             # Interfaces de repositório e implementações
    │   │   ├── fishRepository.interface.ts
    │   │   ├── eatenFishRepository.interface.ts
    │   │   ├── challengeRepository.interface.ts
    │   │   ├── sqliteFishRepository.ts
    │   │   ├── sqliteEatenFishRepository.ts
    │   │   └── inMemoryChallengeRepository.ts
    │   ├── controller/             # Controladores HTTP REST
    │   │   ├── challengeController.ts
    │   │   ├── sharkTankController.ts
    │   │   └── healthController.ts
    │   ├── router/                 # Definição e agrupamento de rotas Express
    │   │   ├── index.ts
    │   │   ├── challengeRouter.ts
    │   │   ├── sharkTankRouter.ts
    │   │   └── healthRouter.ts
    │   └── infrastructure/         # Configurações de banco, env e app Express
    │       ├── app.ts
    │       ├── config.ts
    │       └── database.ts
    └── test/                       # Testes unitários com Vitest
        ├── domain/
        │   └── fish.test.ts
        └── usecase/
            ├── createFishUseCase.test.ts
            ├── eatFishUseCase.test.ts
            ├── getChallengeByIdUseCase.test.ts
            ├── getChallengesUseCase.test.ts
            ├── getTankStatsUseCase.test.ts
            ├── resetTankUseCase.test.ts
            └── sharkTankUseCases.test.ts
```

---

## Tecnologias Utilizadas

- **React** (v19)
- **TypeScript** (v7)
- **Node.js** (v22)
- **Vitest** (v5)
- **styled-components** (v6)
- **Express** (v4)
- **SQLite** (armazenamento persistente relacional)
- **Vite** (v8)

---

## Bibliotecas Principais

### Frontend
- `styled-components`: Estilização baseada em componentes, garantindo isolamento de escopo, eliminação de estilos inline e reaproveitamento visual.
- `lucide-react`: Biblioteca de ícones vetoriais leves.
- `@testing-library/react` & `jsdom`: Utilitários para renderização e testes unitários de componentes React no ambiente Vitest.

### Backend
- `better-sqlite3`: Driver síncrono nativo de alta performance para SQLite.
- `cors`: Middleware para configuração flexível e segura de Cross-Origin Resource Sharing.
- `dotenv`: Gerenciamento e injeção de variáveis de ambiente a partir de arquivos `.env`.
- `tsx`: Execução TypeScript nativa em tempo de desenvolvimento.

### Raiz e Ferramentas
- `concurrently`: Orquestrador de processos concorrentes para desenvolvimento local.

---

## Conceitos e Padrões Utilizados

- **Clean Architecture & Arquitetura em Camadas:**
  - Separação clara entre camada de **Domínio** (regras e validações puras), **Casos de Uso** (orquestração de regras de negócio), **Repositórios** (abstração de acesso a dados), **Controladores** (comunicação HTTP) e **Infraestrutura** (banco de dados e frameworks).
- **Repository Pattern:**
  - Desacoplamento entre lógica de aplicação e armazenamento físico através de interfaces (`IFishRepository`, `IEatenFishRepository`, `IChallengeRepository`), permitindo troca transparente entre SQLite e mocks/fakes em memória nos testes.
- **Use Cases (Single Responsibility Principle):**
  - Cada operação possui uma classe de caso de uso com um único método `execute`, encapsulando estritamente a intenção do sistema (ex.: `CreateFishUseCase`, `EatFishUseCase`, `GetTankStatsUseCase`).
- **Dependency Injection (Injeção de Dependência):**
  - Dependências (repositórios e use cases) são fornecidas através dos construtores, facilitando a testabilidade, modularidade e inversão de controle.
- **Componentização e Hooks:**
  - Componentes React funcionais e isolados, com responsabilidades segregadas. Lógica física, controle de Web Workers e chamadas de API estão encapsulados em Custom Hooks especializados (`useSharkWorkers`, `useCollisionDetection`, `useFishSpawner`, `useSharkOceanSimulation`).
- **Eliminação de Estilos Inline via styled-components:**
  - Todos os estilos e layouts foram mapeados em arquivos `*.styles.ts` próximos aos respectivos componentes, eliminando propriedades inline e mantendo compatibilidade visual idêntica.
- **Concorrência com Web Workers:**
  - Processamento paralelo no navegador via Workers independentes para cada tubarão, mantendo a taxa de atualização da interface fluida.

---

## Arquitetura do Frontend

O frontend adota arquitetura baseada em componentes desacoplados e fluxo unidirecional de dados:

1. **Pages (`pages/`):**
   - Agrupam os blocos estruturais da visualização e consomem hooks de gerenciamento.
2. **Components (`components/`):**
   - Divididos por domínio e responsabilidade. Cada componente possui seu respectivo arquivo `*.styles.ts` criado com `styled-components`, garantindo tipagem de propriedades visuais e manutenibilidade.
3. **Custom Hooks (`hooks/`):**
   - `useChallenges`: Carregamento e seleção dos desafios disponíveis.
   - `useSharkWorkers`: Inicialização e ciclo de vida dos Web Workers em background.
   - `useFishSpawner`: Geração periódica controlada de peixes no aquário.
   - `useCollisionDetection`: Detecção euclidiana de colisão entre coordenadas de tubarões e peixes.
   - `useSharkOceanSimulation`: Composição dos hooks anteriores para controle de início, pausa e reset.
4. **Services (`services/`):**
   - Camada centralizadora de chamadas HTTP (`fetch`), mapeando URLs a partir de `VITE_API_URL`.

---

## Arquitetura do Backend

O backend segue a arquitetura em camadas orientada a casos de uso:

```
[HTTP Request] 
      │
      ▼
[Express Router] (router/)
      │
      ▼
[Controller] (controller/)
      │
      ▼
[Use Case] (usecase/) ───► [Domain Entity & Validation] (domain/)
      │
      ▼
[Repository Interface] (repository/)
      │
      ▼
[Sqlite / InMemory Implementation] (repository/ & infrastructure/)
      │
      ▼
[Database / Storage] (SQLite)
```

- **Domain:** Não possui dependência externa. Define estruturas e validações de regras de negócio essenciais (ex.: `FishDomain.validate`).
- **Use Cases:** Implementam fluxos de negócio concretos, delegando a persistência para contratos de repositório.
- **Controllers:** Tratam requisições e respostas HTTP, serializando erros e status codes apropriados.
- **Infrastructure:** Centraliza banco SQLite (`initDatabase`), leitura de configurações de ambiente (`loadConfig`) e CORS.

---

## Estratégia de Testes

Os testes unitários foram estruturados utilizando **Vitest**, com foco primário na validação do **comportamento** dos casos de uso e na integridade das regras de negócio:

- **Validação de Comportamento:** Os testes avaliam as saídas e efeitos colaterais esperados a partir de entradas específicas, sem se prender a detalhes internos de implementação.
- **Cobertura por Use Case:**
  - **Cenário de sucesso:** Execução regular com dados válidos, validando retorno e persistência esperada.
  - **Validações e regras de negócio:** Casos de dados inválidos (ex.: IDs vazios, tamanhos não positivos, ausência de peixes).
  - **Cenários de erro:** Comportamento resiliente frente a falhas simuladas de persistência ou leitura no banco.
  - **Interações com Repositories via Mocks e Fakes:** Uso de `vi.fn()` e implementações de repositórios em memória para validar chamadas e isolar o banco de dados.
- **Testes de Integração e Domínio:** Testes complementares validam restrições do `FishDomain` e a integração com o SQLite em memória (`better-sqlite3`).
- **Testes de Frontend:** Verificação de renderização condicional de componentes estilizados e serviços de API com mocks de `fetch`.

---

## Como Executar os Testes

Para executar toda a suíte de testes (backend e frontend):

```bash
npm test
```

Para executar os testes apenas no **backend**:

```bash
npm --prefix server run test
```

Para executar os testes apenas no **frontend**:

```bash
npm --prefix client run test
```
