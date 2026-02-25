require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

require("./database");

const authRoutes = require("./routes/auth");
const projetosRoutes = require("./routes/projetos");
const tasksRoutes = require("./routes/tasks");

app.use("/api/auth", authRoutes);
app.use("/api/projetos", projetosRoutes);
app.use("/api/tasks", tasksRoutes);

app.get("/", (req, res) => {
  res.json({ mensagem: "API funcionando!" });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
