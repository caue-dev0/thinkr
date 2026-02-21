require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rota de teste — confirma que o servidor está vivo
app.get("/", (req, res) => {
  res.json({ mensagem: "Servidor funcionando!" });
});

require("./database");
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
