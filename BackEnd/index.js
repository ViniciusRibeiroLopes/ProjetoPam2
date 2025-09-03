const db = require("./conf/autenticacao.js");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const methodOverride = require("method-override");
const app = express();
const port = 3000;

// Middleware para permitir métodos HTTP extras
app.use(methodOverride("X-HTTP-Method"));
app.use(methodOverride("X-HTTP-Method-Override"));
app.use(methodOverride("X-Method-Override"));
app.use(methodOverride("_method"));

// Configuração CORS correta
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// ROTEAMENTO RAIZ - Listar todos os clientes
app.get("/", async (req, res) => {
  try {
    const results = await db.selectFull();
    console.log("Clientes listados:", results);
    res.json(results);
  } catch (error) {
    console.error("Erro ao listar clientes:", error);
    res.status(500).json({ error: "Erro ao listar clientes" });
  }
});

// Alias para /clientes
app.get("/clientes", async (req, res) => {
  try {
    const results = await db.selectFull();
    console.log("Clientes listados:", results);
    res.json(results);
  } catch (error) {
    console.error("Erro ao listar clientes:", error);
    res.status(500).json({ error: "Erro ao listar clientes" });
  }
});

// ROTEAMENTO PARA BUSCAR PELO ID
app.get("/clientes/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const results = await db.selectById(id);

    if (results.length === 0) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    console.log("Cliente encontrado:", results);
    res.json(results[0]);
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    res.status(500).json({ error: "Erro ao buscar cliente" });
  }
});

// ROTEAMENTO PARA INSERIR
app.post("/clientes", async (req, res) => {
  try {
    const { nome, Nome, idade, Idade, uf, UF } = req.body;

    // Aceita ambos os formatos (minúsculo e maiúsculo)
    const nomeCliente = nome || Nome;
    const idadeCliente = idade || Idade;
    const ufCliente = uf || UF;

    if (!nomeCliente || !idadeCliente || !ufCliente) {
      return res
        .status(400)
        .json({ error: "Todos os campos são obrigatórios" });
    }

    const results = await db.insertCliente(
      nomeCliente,
      idadeCliente,
      ufCliente
    );
    console.log("Cliente inserido:", results);
    res.status(201).json({
      message: "Cliente criado com sucesso",
      id: results.insertId,
    });
  } catch (error) {
    console.error("Erro ao inserir cliente:", error);
    res.status(500).json({ error: "Erro ao inserir cliente" });
  }
});

// ROTEAMENTO PARA ATUALIZAR - CORRIGIDO
app.put("/clientes/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { nome, Nome, idade, Idade, uf, UF } = req.body;

    // Aceita ambos os formatos (minúsculo e maiúsculo)
    const nomeCliente = nome || Nome;
    const idadeCliente = idade || Idade;
    const ufCliente = uf || UF;

    if (!nomeCliente || !idadeCliente || !ufCliente) {
      return res
        .status(400)
        .json({ error: "Todos os campos são obrigatórios" });
    }

    // CORREÇÃO: Ordem correta dos parâmetros
    const results = await db.updateCliente(
      nomeCliente,
      idadeCliente,
      ufCliente,
      id
    );

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    console.log("Cliente atualizado:", results);
    res.json({ message: "Cliente atualizado com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    res.status(500).json({ error: "Erro ao atualizar cliente" });
  }
});

// ROTEAMENTO PARA DELETAR - CORRIGIDO
app.delete("/clientes/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // CORREÇÃO: Usar deleteById em vez de deleteCliente
    const results = await db.deleteById(id);

    if (!results) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    console.log("Cliente deletado com ID:", id);
    res.json({ message: "Cliente deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar cliente:", error);
    res.status(500).json({ error: "Erro ao deletar cliente" });
  }
});

// Rota de health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Servidor rodando" });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  console.log(`Teste a API em http://localhost:${port}/health`);
});
