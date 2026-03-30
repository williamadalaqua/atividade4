import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';

const app = express();
const host = '0.0.0.0';
const porta = 4090;

var listaProdutos = [];

app.use(cookieParser());

app.use(session({
    secret: 'M1nh4Ch4v3S3cr3t4',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 60000 * 15,
    }
}));

app.use(express.urlencoded({ extended: true }));


app.get("/", estaAutenticado, (requisicao, resposta) => {

    resposta.write(`
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <title>Menu</title>

        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">

        <style>
            body{
                background-image: url("https://images.unsplash.com/photo-1604719312566-8912e9c8a213");
                background-size: cover;
                background-position: center;
                min-height: 100vh;
            }
        </style>
    </head>

    <body>

    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">

            <a class="navbar-brand" href="/">Sistema de Cadastro de Produtos</a>

            <div class="collapse navbar-collapse">
                <ul class="navbar-nav ms-auto">

                    <li class="nav-item">
                        <a class="nav-link" href="/cadastroproduto">Cadastro Produto</a>
                    </li>

                    <li class="nav-item">
                        <a class="nav-link" href="/listaprodutos">Lista Produtos</a>
                    </li>

                    <li class="nav-item">
                        <a class="nav-link text-danger" href="/logout">Logout</a>
                    </li>

                </ul>
            </div>

        </div>
    </nav>

    </body>
    </html>
    `);

    resposta.end();
});


app.get("/login", (requisicao, resposta) => {

    const ultimo = requisicao.cookies?.UltimoAcesso || "Primeiro acesso";

    resposta.write(`
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <title>Login</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>

    <body class="text-center">

    <div class="container w-25 mt-5">

        <h2>Login</h2>

        <form method="POST" action="/login">

            <div class="form-floating mb-3">
                <input type="email" name="email" id="email" class="form-control">
                <label>Email</label>
            </div>

            <div class="form-floating mb-3">
                <input type="password" name="senha" id="senha" class="form-control">
                <label>Senha</label>
            </div>

            <button class="btn btn-primary w-100">Entrar</button>

        </form>

        <p class="mt-3">Último acesso: ${ultimo}</p>

    </div>

    </body>
    </html>
    `);

    resposta.end();
});

app.post("/login", (requisicao, resposta) => {

    const { email, senha } = requisicao.body;

    if (email === "admin@email.com" && senha === "123") {

        requisicao.session.logado = true;
        resposta.cookie("UltimoAcesso", new Date().toLocaleString(), { maxAge: 1000 * 60 * 60 * 24 * 30});
        resposta.redirect("/");
    } else {

        resposta.write(`
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <title>Login</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>

        <body class="text-center">

        <div class="container w-25 mt-5">

            <h2>Login</h2>

            <div class="alert alert-danger">
                Email ou senha inválidos
            </div>

            <form method="POST" action="/login">

                <div class="form-floating mb-3">
                    <input type="email" name="email" class="form-control" value="${email || ''}">
                    <label>Email</label>
                </div>

                <div class="form-floating mb-3">
                    <input type="password" name="senha" class="form-control">
                    <label>Senha</label>
                </div>

                <button class="btn btn-primary w-100">Entrar</button>

            </form>

        </div>

        </body>
        </html>
        `);

        resposta.end();
    }
});


app.get("/cadastroproduto", estaAutenticado, (requisicao, resposta) => {

    resposta.write(`
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <title>Cadastro Produto</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>

    <body>

    <div class="container mt-5">

    <form method="POST" action="/cadastroproduto" class="row g-3 border p-4">

        <legend><h3>Cadastro de Produto</h3></legend>

        <div class="col-md-6">
            <label class="form-label">Código de barras</label>
            <input name="codigo" class="form-control">
        </div>

        <div class="col-md-6">
            <label class="form-label">Descrição</label>
            <input name="descricao" class="form-control">
        </div>

        <div class="col-md-6">
            <label class="form-label">Preço de custo</label>
            <input name="custo" class="form-control">
        </div>

        <div class="col-md-6">
            <label class="form-label">Preço de venda</label>
            <input name="venda" class="form-control">
        </div>

        <div class="col-md-6">
            <label class="form-label">Validade</label>
            <input type="date" name="validade" class="form-control">
        </div>

        <div class="col-md-6">
            <label class="form-label">Estoque</label>
            <input name="estoque" class="form-control">
        </div>

        <div class="col-12">
            <label class="form-label">Fabricante</label>
            <input name="fabricante" class="form-control">
        </div>

        <div class="col-12">
            <button class="btn btn-success">Cadastrar</button>
            <a href="/" class="btn btn-secondary">Voltar</a>
        </div>

    </form>

    </div>

    </body>
    </html>
    `);

    resposta.end();
});


app.post("/cadastroproduto", estaAutenticado, (requisicao, resposta) => {

    const codigo = requisicao.body.codigo;
    const descricao = requisicao.body.descricao;
    const custo = requisicao.body.custo;
    const venda = requisicao.body.venda;
    const validade = requisicao.body.validade;
    const estoque = requisicao.body.estoque;
    const fabricante = requisicao.body.fabricante;

    if (!codigo || !descricao || !custo || !venda || !validade || !estoque || !fabricante) {

        let html = `
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <title>Cadastro Produto</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>

        <body>

        <div class="container mt-5">

        <form method="POST" action="/cadastroproduto" class="row g-3 border p-4">

            <legend><h3>Cadastro de Produto</h3></legend>

            <div class="col-md-6">
                <label class="form-label">Código</label>
                <input name="codigo" class="form-control" value="${codigo || ''}">
                ${!codigo ? '<div class="alert alert-danger mt-2">Preencha o código</div>' : ''}
            </div>

            <div class="col-md-6">
                <label class="form-label">Descrição</label>
                <input name="descricao" class="form-control" value="${descricao || ''}">
                ${!descricao ? '<div class="alert alert-danger mt-2">Preencha a descrição</div>' : ''}
            </div>

            <div class="col-md-6">
                <label class="form-label">Custo</label>
                <input name="custo" class="form-control" value="${custo || ''}">
                ${!custo ? '<div class="alert alert-danger mt-2">Preencha o custo</div>' : ''}
            </div>

            <div class="col-md-6">
                <label class="form-label">Venda</label>
                <input name="venda" class="form-control" value="${venda || ''}">
                ${!venda ? '<div class="alert alert-danger mt-2">Preencha a venda</div>' : ''}
            </div>

            <div class="col-md-6">
                <label class="form-label">Validade</label>
                <input type="date" name="validade" class="form-control" value="${validade || ''}">
                ${!validade ? '<div class="alert alert-danger mt-2">Preencha a validade</div>' : ''}
            </div>

            <div class="col-md-6">
                <label class="form-label">Estoque</label>
                <input name="estoque" class="form-control" value="${estoque || ''}">
                ${!estoque ? '<div class="alert alert-danger mt-2">Preencha o estoque</div>' : ''}
            </div>

            <div class="col-12">
                <label class="form-label">Fabricante</label>
                <input name="fabricante" class="form-control" value="${fabricante || ''}">
                ${!fabricante ? '<div class="alert alert-danger mt-2">Preencha o fabricante</div>' : ''}
            </div>

            <div class="col-12">
                <button class="btn btn-success">Cadastrar</button>
                <a href="/" class="btn btn-secondary">Voltar</a>
            </div>

        </form>

        </div>

        </body>
        </html>
        `;

        resposta.write(html);
        resposta.end();

    } else {

        listaProdutos.push({
            "codigo": codigo,
            "descricao": descricao,
            "custo": custo,
            "venda": venda,
            "validade": validade,
            "estoque": estoque,
            "fabricante":fabricante,
        });

        resposta.redirect("/listaprodutos");
    }
});


app.get("/listaprodutos", estaAutenticado, (requisicao, resposta) => {

    const ultimo = requisicao.cookies?.UltimoAcesso || "Primeiro acesso";

    resposta.write(`
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <title>Lista</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>

    <body>

    <div class="container mt-5">

        <h2>Lista de Produtos</h2>

        <div class="alert alert-info">
            Último acesso: ${ultimo}
        </div>

        <table class="table table-striped">
            <tr>
                <th>ID</th>
                <th>Código</th>
                <th>Descrição</th>
                <th>Custo</th>
                <th>Venda</th>
                <th>Validade</th>
                <th>Estoque</th>
                <th>Fabricante</th>
            </tr>
    `);

    for(let i=0;i<listaProdutos.length;i++){
        let p = listaProdutos[i];

        resposta.write(`
        <tr>
            <td>${i+1}</td>
            <td>${p.codigo}</td>
            <td>${p.descricao}</td>
            <td>${p.custo}</td>
            <td>${p.venda}</td>
            <td>${p.validade}</td>
            <td>${p.estoque}</td>
            <td>${p.fabricante}</td>
        </tr>
        `);
    }

    resposta.write(`
        </table>

        <a href="/cadastroproduto" class="btn btn-primary">Novo Produto</a>
        <a href="/" class="btn btn-secondary">Voltar</a>

    </div>

    </body>
    </html>
    `);

    resposta.end();
});

function estaAutenticado(requisicao, resposta, proximo) {
    if (requisicao.session.logado) {
        proximo();
    } else {
        resposta.redirect("/login");
    }
}

app.get("/logout", (requisicao, resposta) => {
    requisicao.session.destroy();
    resposta.redirect("/login");
});

app.listen(porta, host, () => {
    console.log(`Servidor rodando em http://localhost:${porta}`);
});