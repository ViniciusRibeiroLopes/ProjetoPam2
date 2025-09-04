// index.js
const express = require("express");
const cors = require("cors");
const methodOverride = require("method-override");
const db = require("./conf/autenticacao.js");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Só use method-override se REALMENTE precisar enviar PUT/DELETE via formulário HTML
app.use(methodOverride("X-HTTP-Method"));
app.use(methodOverride("X-HTTP-Method-Override"));
app.use(methodOverride("X-Method-Override"));
app.use(methodOverride("_method"));

// ROTA RAIZ – lista todos
app.get("/", async (req, res, next) => {
  try {
    const results = await db.selectFull();
    res.json(results);
  } catch (err) {
    next(err);
  }
});

// BUSCAR POR ID
app.get("/clientes/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: "ID inválido" });

    const results = await db.selectById(id);
    if (!results || (Array.isArray(results) && results.length === 0)) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }
    res.json(results);
  } catch (err) {
    next(err);
  }
});

// INSERIR
app.post("/clientes", async (req, res, next) => {
  try {
    const { Nome, Idade, UF } = req.body;

    if (!Nome || !Idade || !UF) {
      return res
        .status(400)
        .json({ error: "Nome, Idade e UF são obrigatórios." });
    }
    const idadeNum = Number(Idade);
    if (!Number.isInteger(idadeNum) || idadeNum <= 0) {
      return res
        .status(400)
        .json({ error: "Idade deve ser número inteiro positivo." });
    }

    const inserted = await db.insertCliente(
      String(Nome).trim(),
      idadeNum,
      String(UF).trim().toUpperCase()
    );
    // Ideal: db.insertCliente retorna o registro criado (com id)
    res.status(201).json(inserted);
  } catch (err) {
    next(err);
  }
});

// ATUALIZAR
app.put("/clientes/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: "ID inválido" });

    const { Nome, Idade, UF } = req.body;
    if (!Nome || !Idade || !UF) {
      return res
        .status(400)
        .json({ error: "Nome, Idade e UF são obrigatórios." });
    }
    const idadeNum = Number(Idade);
    if (!Number.isInteger(idadeNum) || idadeNum <= 0) {
      return res
        .status(400)
        .json({ error: "Idade deve ser número inteiro positivo." });
    }

    const updated = await db.updateCliente(
      String(Nome).trim(),
      idadeNum,
      String(UF).trim().toUpperCase(),
      id
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETAR
app.delete("/clientes/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: "ID inválido" });

    const result = await db.deleteById(id);
    res.json({ success: true, result });
  } catch (err) {
    next(err);
  }
});

// 404 para rotas não mapeadas
app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

// Handler global de erros
app.use((err, req, res, next) => {
  console.error("[API ERROR]", err);
  res.status(500).json({ error: "Erro interno do servidor" });
});

app.listen(PORT, () => {
  console.log(`API ouvindo em http://localhost:${PORT}`);
});
