const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { challenges } = require('./challengesData');
const { db } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: '4z AI Code Challenges API' });
});

app.get('/api/challenges', (req, res) => {
  res.json(challenges);
});

app.get('/api/challenges/:id', (req, res) => {
  const challenge = challenges.find(c => c.id === req.params.id);
  res.json(challenge);
});

app.post('/api/shark-tank/fish', (req, res) => {
  const { id, conteudo, tamanho, x, y, cor, criado_em } = req.body;
  const stmt = db.prepare(`
    INSERT INTO peixes (id, conteudo, tamanho, x, y, cor, criado_em, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'ativo')
  `);
  stmt.run(id, conteudo, tamanho, x, y, cor || '#38bdf8', criado_em || new Date().toISOString());
  res.json({ success: true });
});

app.post('/api/shark-tank/eat', (req, res) => {
  const { peixe_id, tubarao_id, tubarao_nome, x_captura, y_captura } = req.body;
  const peixe = db.prepare('SELECT * FROM peixes WHERE id = ?').get(peixe_id);
  if (!peixe) {
    return res.json({ success: false });
  }

  const hora_comeu = new Date().toISOString();

  const insertStmt = db.prepare(`
    INSERT INTO peixes_comidos (
      peixe_id, conteudo_peixe, tamanho_peixe, tubarao_id, tubarao_nome,
      hora_comeu, peixe_criado_em, x_captura, y_captura
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertStmt.run(
    peixe.id,
    peixe.conteudo,
    peixe.tamanho,
    tubarao_id,
    tubarao_nome,
    hora_comeu,
    peixe.criado_em,
    x_captura,
    y_captura
  );

  db.prepare("UPDATE peixes SET status = 'comido' WHERE id = ?").run(peixe_id);
  const count = db.prepare('SELECT COUNT(*) as total FROM peixes_comidos WHERE tubarao_id = ?').get(tubarao_id);

  res.json({
    success: true,
    tubarao_id,
    peixes_comidos_total: count.total,
    hora_comeu
  });
});

app.get('/api/shark-tank/stats', (req, res) => {
  const totalPeixesCriados = db.prepare('SELECT COUNT(*) as total FROM peixes').get();
  const totalPeixesComidos = db.prepare('SELECT COUNT(*) as total FROM peixes_comidos').get();
  const sharksCounts = db.prepare(`
    SELECT tubarao_id, tubarao_nome, COUNT(*) as count 
    FROM peixes_comidos 
    GROUP BY tubarao_id
  `).all();
  const historicoRecente = db.prepare(`
    SELECT * FROM peixes_comidos ORDER BY id DESC LIMIT 10
  `).all();

  res.json({
    totalPeixesCriados: totalPeixesCriados.total,
    totalPeixesComidos: totalPeixesComidos.total,
    sharksCounts,
    historicoRecente
  });
});

app.post('/api/shark-tank/reset', (req, res) => {
  db.prepare('DELETE FROM peixes').run();
  db.prepare('DELETE FROM peixes_comidos').run();
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
