const Database = require("better-sqlite3");
const db = new Database("database.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS projetos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descricao TEXT,
    criador_id INTEGER,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (criador_id) REFERENCES usuarios(id)
  );

  CREATE TABLE IF NOT EXISTS membros_projeto (
    projeto_id INTEGER,
    usuario_id INTEGER,
    PRIMARY KEY (projeto_id, usuario_id),
    FOREIGN KEY (projeto_id) REFERENCES projetos(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    descricao TEXT,
    status TEXT DEFAULT 'a_fazer',
    responsavel_id INTEGER,
    projeto_id INTEGER NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (responsavel_id) REFERENCES usuarios(id),
    FOREIGN KEY (projeto_id) REFERENCES projetos(id)
  );
`);

module.exports = db;
