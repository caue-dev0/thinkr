const express = require("express");
const db = require("../database");
const autenticar = require("../middleware/autenticar");

const router = express.Router();

// Listar tasks de um projeto
router.get("/projeto/:projetoId", autenticar, (req, res) => {
  const tasks = db
    .prepare(
      `
        SELECT t.*, u.nome as responsavel_nome
        FROM tasks t
        LEFT JOIN usuarios u ON t.responsavel_id = u.id
        WHERE t.projeto_id = ?
        ORDER BY t.criado_em DESC
    `,
    )
    .all(req.params.projetoId);

  res.json(tasks);
});

// Criar task
router.post("/", autenticar, (req, res) => {
  const { titulo, descricao, responsavel_id, projeto_id } = req.body;

  if (!titulo || !projeto_id) {
    return res.status(400).json({ erro: "Título e projeto são obrigatórios" });
  }

  const result = db
    .prepare(
      "INSERT INTO tasks (titulo, descricao, responsavel_id, projeto_id) VALUES (?, ?, ?, ?)",
    )
    .run(titulo, descricao || "", responsavel_id || null, projeto_id);

  res.json({ id: result.lastInsertRowid, mensagem: "Task criada!" });
});

// Atualizar status
router.patch("/:id/status", autenticar, (req, res) => {
  const { status } = req.body;
  const validos = ["a_fazer", "em_progresso", "feito"];

  if (!validos.includes(status)) {
    return res.status(400).json({ erro: "Status inválido" });
  }

  db.prepare("UPDATE tasks SET status = ? WHERE id = ?").run(
    status,
    req.params.id,
  );
  res.json({ mensagem: "Status atualizado" });
});

// Deletar task
router.delete("/:id", autenticar, (req, res) => {
  db.prepare("DELETE FROM tasks WHERE id = ?").run(req.params.id);
  res.json({ mensagem: "Task removida" });
});

module.exports = router;
