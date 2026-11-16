const ENDERECO_API = ["localhost", "127.0.0.1"].includes(location.hostname)
    ? "http://localhost:5000/api"
    : "/api";

const imagensProdutos = {
    1: "images/2006-11-imgImage3.png",
    2: "images/2006-11-imgImage2.png",
    3: "images/2006-11-imgImageRemovebgPreview1.png",
    4: "images/2006-11-imgImageRemovebgPreview21.png"
};

const imagensCarrinho = {
    1: "images/2007-2-imgImage4.png",
    2: "images/2007-2-imgImage5.png",
    3: "images/2006-11-imgImageRemovebgPreview1.png",
    4: "images/2006-11-imgImageRemovebgPreview21.png"
};

const iconeMais = "images/2007-2-imgCirclePlusSolidFull11.svg";
const iconeLixeira = "images/2007-2-imgTrashCanSolidFull1.svg";

async function requisicaoApi(caminho, opcoes = {}) {
    const resposta = await fetch(ENDERECO_API + caminho, {
        ...opcoes,
        headers: {
            "Content-Type": "application/json",
            ...(opcoes.headers || {})
        }
    });

    const texto = await resposta.text();
    let dados = null;

    try {
        dados = texto ? JSON.parse(texto) : null;
    } catch {
        dados = texto;
    }

    if (!resposta.ok) {
        let mensagem = typeof dados === "string" ? dados : dados?.title || dados?.message;

        if (!mensagem && dados?.errors) {
            mensagem = Object.values(dados.errors).flat().join(" ");
        }

        throw new Error(mensagem || "Não foi possível concluir a solicitação.");
    }

    return dados;
}

function aviso(texto) {
    const elemento = document.getElementById("aviso");
    if (elemento) elemento.textContent = texto;
}

function dinheiro(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function lerUsuario() {
    try {
        return JSON.parse(sessionStorage.getItem("donnuts-usuario")) || null;
    } catch {
        return null;
    }
}

function salvarUsuario(usuario) {
    sessionStorage.setItem("donnuts-usuario", JSON.stringify(usuario));
}

function estaLogado() {
    return Boolean(lerUsuario());
}

function sair() {
    sessionStorage.removeItem("donnuts-usuario");
    location.href = "login.html";
}

function entrar(usuario) {
    salvarUsuario(usuario);

    const voltarAoCarrinho = sessionStorage.getItem("donnuts-voltar-carrinho") === "true";
    sessionStorage.removeItem("donnuts-voltar-carrinho");

    if (usuario.tipoConta === "Entregador") {
        location.href = "entregador.html";
    } else {
        location.href = voltarAoCarrinho ? "carrinho.html" : "cardapio.html";
    }
}

function protegerPagina() {
    const usuario = lerUsuario();
    const paginaCliente = document.getElementById("perfil") || document.getElementById("pedido");
    const paginaEntregador = document.getElementById("painel-entregador");

    if ((paginaCliente || paginaEntregador) && !usuario) {
        location.replace("login.html");
        return false;
    }

    if (paginaEntregador && usuario.tipoConta !== "Entregador") {
        location.replace("cardapio.html");
        return false;
    }

    if (paginaCliente && usuario.tipoConta !== "Cliente") {
        location.replace("entregador.html");
        return false;
    }

    return true;
}

document.querySelectorAll(".menu").forEach(menu => {
    const resumo = menu.querySelector(".botao-menu");
    const painel = menu.querySelector("nav");
    if (!resumo || !painel) return;

    let aberto = !painel.hidden;
    let animacao;

    function alternarMenu(abrir) {
        aberto = abrir;
        const estavaFechado = painel.hidden;
        painel.hidden = false;
        menu.classList.add("aberto");

        const estilo = getComputedStyle(painel);
        const inicio = {
            opacity: estavaFechado ? 0 : estilo.opacity,
            transform: estavaFechado ? "translateY(-8px) scale(0.96)" : estilo.transform
        };

        if (animacao) animacao.cancel();
        painel.inert = !abrir;
        resumo.setAttribute("aria-expanded", String(abrir));
        resumo.title = abrir ? "Fechar menu" : "Abrir menu";

        animacao = painel.animate([
            inicio,
            { opacity: abrir ? 1 : 0, transform: abrir ? "translateY(0) scale(1)" : "translateY(-8px) scale(0.96)" }
        ], {
            duration: matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 250,
            easing: "ease-out",
            fill: "forwards"
        });

        animacao.onfinish = () => {
            painel.hidden = !abrir;
            menu.classList.toggle("aberto", abrir);
            animacao.cancel();
            animacao = null;
        };
    }

    resumo.addEventListener("click", evento => {
        evento.preventDefault();
        alternarMenu(!aberto);
    });

    document.addEventListener("click", evento => {
        if (aberto && !menu.contains(evento.target)) alternarMenu(false);
    });

    menu.addEventListener("keydown", evento => {
        if (evento.key === "Escape") {
            alternarMenu(false);
            resumo.focus();
        }
    });
});

document.querySelectorAll(".conta").forEach(link => {
    const usuario = lerUsuario();

    if (!usuario) {
        link.href = "login.html";
        link.textContent = "Login";
        return;
    }

    if (usuario.tipoConta === "Entregador") {
        link.href = "entregador.html";
        link.textContent = "Pedidos";
    } else {
        link.href = "perfil.html";
        const icone = document.createElement("img");
        icone.src = "images/2007-2-imgUserRegularFull1.svg";
        icone.alt = "Meu perfil";
        link.replaceChildren(icone);
    }
});

const botaoSair = document.getElementById("sair");
if (botaoSair) botaoSair.addEventListener("click", evento => {
    evento.preventDefault();
    sair();
});

const usuarioAtual = lerUsuario();
if (!protegerPagina()) {
    // A navegação já foi redirecionada para a tela compatível com o tipo de conta.
}

function formatarTelefone(valor) {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);
    if (!numeros) return "";
    if (numeros.length <= 2) return "(" + numeros;

    const ddd = numeros.slice(0, 2);
    const numero = numeros.slice(2);
    const corte = numeros.length === 11 ? 5 : 4;

    return "(" + ddd + ") " + numero.slice(0, corte) +
        (numero.length > corte ? "-" + numero.slice(corte) : "");
}

function configurarTelefone(campo) {
    if (!campo) return;

    campo.value = formatarTelefone(campo.value);
    campo.addEventListener("input", () => {
        const posicao = campo.selectionStart;
        const digitosAntes = campo.value.slice(0, posicao).replace(/\D/g, "").length;
        campo.value = formatarTelefone(campo.value);

        let cursor = 0;
        let contagem = 0;

        while (cursor < campo.value.length && contagem < digitosAntes) {
            if (/\d/.test(campo.value[cursor])) contagem++;
            cursor++;
        }

        campo.setSelectionRange(cursor, cursor);
    });
}

function configurarCampoEndereco(tipoConta, formulario) {
    const campo = formulario.querySelector("#campo-endereco");
    const endereco = formulario.elements.endereco;

    if (!campo || !endereco) return;

    const mostrar = tipoConta === "Cliente";
    campo.hidden = !mostrar;
    endereco.required = mostrar;

    if (!mostrar) endereco.value = "";
}

const formularioCadastro = document.getElementById("form-cadastro");
if (formularioCadastro) {
    const tipoConta = formularioCadastro.elements.tipoConta;
    configurarTelefone(formularioCadastro.elements.telefone);
    configurarCampoEndereco(tipoConta.value, formularioCadastro);

    tipoConta.addEventListener("change", () => {
        configurarCampoEndereco(tipoConta.value, formularioCadastro);
    });

    formularioCadastro.addEventListener("submit", async evento => {
        evento.preventDefault();
        if (!formularioCadastro.reportValidity()) return;

        const dados = Object.fromEntries(new FormData(formularioCadastro));
        dados.nome = dados.nome.trim();
        dados.email = dados.email.trim();
        dados.telefone = formatarTelefone(dados.telefone);
        dados.endereco = (dados.endereco || "").trim();

        try {
            const usuario = await requisicaoApi("/usuario", {
                method: "POST",
                body: JSON.stringify(dados)
            });

            entrar(usuario);
        } catch (erro) {
            aviso(erro.message);
        }
    });
}

const formularioLogin = document.getElementById("form-login");
if (formularioLogin) {
    formularioLogin.addEventListener("submit", async evento => {
        evento.preventDefault();
        if (!formularioLogin.reportValidity()) return;

        const dados = Object.fromEntries(new FormData(formularioLogin));
        dados.email = dados.email.trim();

        try {
            const resposta = await requisicaoApi("/usuario/login", {
                method: "POST",
                body: JSON.stringify(dados)
            });

            entrar(resposta.usuario);
        } catch (erro) {
            aviso(erro.message);
        }
    });
}

const formularioPerfil = document.getElementById("form-perfil");
if (formularioPerfil && usuarioAtual) {
    formularioPerfil.elements.nome.value = usuarioAtual.nome || "";
    formularioPerfil.elements.email.value = usuarioAtual.email || "";
    formularioPerfil.elements.telefone.value = usuarioAtual.telefone || "";
    formularioPerfil.elements.endereco.value = usuarioAtual.endereco || "";

    configurarTelefone(formularioPerfil.elements.telefone);
    configurarCampoEndereco(usuarioAtual.tipoConta, formularioPerfil);

    formularioPerfil.addEventListener("submit", async evento => {
        evento.preventDefault();
        if (!formularioPerfil.reportValidity()) return;

        const dados = Object.fromEntries(new FormData(formularioPerfil));
        dados.nome = dados.nome.trim();
        dados.email = dados.email.trim();
        dados.telefone = formatarTelefone(dados.telefone);
        dados.endereco = (dados.endereco || "").trim();

        if (!dados.senha) delete dados.senha;

        try {
            const usuario = await requisicaoApi("/usuario/" + usuarioAtual.id, {
                method: "PUT",
                body: JSON.stringify(dados)
            });

            salvarUsuario(usuario);
            formularioPerfil.elements.senha.value = "";
            aviso("Dados atualizados com sucesso.");
        } catch (erro) {
            aviso(erro.message);
        }
    });
}

let produtosApi = [];

async function carregarProdutos() {
    const secao = document.querySelector(".produtos");
    if (!secao) return;

    try {
        produtosApi = await requisicaoApi("/produto");
        produtosApi = produtosApi.filter(produto => produto.disponivel);

        document.querySelectorAll(".produto").forEach(card => {
            const id = Number(card.dataset.produto);
            const produto = produtosApi.find(item => item.id === id);

            if (!produto) {
                card.hidden = true;
                return;
            }

            card.querySelector("h3").textContent = produto.nome;
            card.querySelector("p").textContent = dinheiro(produto.preco);

            const imagem = card.querySelector(".foto-produto img");
            imagem.src = imagensProdutos[id] || imagem.src;
            imagem.alt = "Donut " + produto.nome;
        });
    } catch (erro) {
        aviso("Não foi possível carregar o cardápio: " + erro.message);
    }
}

const busca = document.getElementById("busca");
if (busca) {
    const campoBusca = document.getElementById("buscar-sabor");
    const resultadoBusca = document.getElementById("resultado-busca");
    const normalizar = texto => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    function filtrarProdutos() {
        const termos = normalizar(campoBusca.value.trim()).split(/\s+/).filter(Boolean);
        let encontrados = 0;

        document.querySelectorAll(".produto").forEach(item => {
            const nome = normalizar(item.querySelector("h3").textContent);
            item.hidden = item.hidden || !termos.every(termo => nome.includes(termo));
            if (!item.hidden) encontrados++;
        });

        resultadoBusca.textContent = termos.length === 0 ? "" :
            encontrados === 0 ? "Nenhum sabor encontrado. Tente outro nome." :
            encontrados + (encontrados === 1 ? " sabor encontrado." : " sabores encontrados.");
    }

    campoBusca.value = new URLSearchParams(location.search).get("q") || "";
    campoBusca.addEventListener("input", filtrarProdutos);
    busca.addEventListener("submit", evento => {
        evento.preventDefault();
        filtrarProdutos();
    });

    carregarProdutos().then(filtrarProdutos);
    if (location.hash === "#busca") campoBusca.focus();
}

async function adicionarAoCarrinho(produtoId) {
    const usuario = lerUsuario();

    if (!usuario || usuario.tipoConta !== "Cliente") {
        sessionStorage.setItem("donnuts-voltar-carrinho", "true");
        location.href = "login.html";
        return;
    }

    try {
        await requisicaoApi("/carrinho/" + usuario.id + "/itens", {
            method: "POST",
            body: JSON.stringify({ produtoId, quantidade: 1 })
        });

        const produto = produtosApi.find(item => item.id === produtoId);
        aviso((produto?.nome || "Produto") + " adicionado ao carrinho.");
    } catch (erro) {
        aviso(erro.message);
    }
}

document.querySelectorAll("[data-adicionar]").forEach(botao => {
    botao.addEventListener("click", () => adicionarAoCarrinho(Number(botao.dataset.adicionar)));
});

async function carregarCarrinho() {
    const lista = document.getElementById("itens-carrinho");
    if (!lista) return;

    const usuario = lerUsuario();
    if (!usuario) {
        location.replace("login.html");
        return;
    }

    try {
        const carrinho = await requisicaoApi("/carrinho/" + usuario.id);
        renderizarCarrinho(carrinho);
    } catch (erro) {
        aviso(erro.message);
    }
}

function renderizarCarrinho(carrinho) {
    const lista = document.getElementById("itens-carrinho");
    if (!lista) return;

    lista.replaceChildren();

    carrinho.itens.forEach(itemCarrinho => {
        const item = document.createElement("article");
        item.className = "item";

        const imagem = document.createElement("img");
        imagem.src = imagensCarrinho[itemCarrinho.produtoId] || imagensProdutos[itemCarrinho.produtoId] || "";
        imagem.alt = "Donut " + itemCarrinho.nome;

        const nome = document.createElement("h3");
        nome.textContent = itemCarrinho.nome;

        const preco = document.createElement("p");
        preco.textContent = dinheiro(itemCarrinho.subtotal);

        const remover = document.createElement("button");
        remover.className = "remover";
        remover.title = "Remover produto";
        const imagemLixeira = document.createElement("img");
        imagemLixeira.src = iconeLixeira;
        imagemLixeira.alt = "Remover";
        remover.append(imagemLixeira);
        remover.addEventListener("click", () => alterarItemCarrinho(itemCarrinho.produtoId, "DELETE"));

        const controles = document.createElement("div");
        controles.className = "controle-quantidade";

        const diminuir = document.createElement("button");
        diminuir.className = "diminuir";
        diminuir.title = "Diminuir quantidade";
        diminuir.textContent = "−";
        diminuir.disabled = itemCarrinho.quantidade <= 1;
        diminuir.addEventListener("click", () => alterarItemCarrinho(
            itemCarrinho.produtoId, "PUT", itemCarrinho.quantidade - 1
        ));

        const quantidade = document.createElement("span");
        quantidade.className = "quantidade";
        quantidade.textContent = itemCarrinho.quantidade;

        const aumentar = document.createElement("button");
        aumentar.className = "aumentar";
        aumentar.title = "Aumentar quantidade";
        const imagemMais = document.createElement("img");
        imagemMais.src = iconeMais;
        imagemMais.alt = "Aumentar";
        aumentar.append(imagemMais);
        aumentar.addEventListener("click", () => alterarItemCarrinho(
            itemCarrinho.produtoId, "PUT", itemCarrinho.quantidade + 1
        ));

        controles.append(diminuir, quantidade, aumentar);
        item.append(imagem, nome, preco, remover, controles);
        lista.append(item);
    });

    if (carrinho.itens.length === 0) {
        lista.textContent = "Seu carrinho está vazio. Escolha um produto no cardápio.";
    }

    document.getElementById("total").textContent = "Valor Total: " + dinheiro(carrinho.total);
    const endereco = document.querySelector(".endereco-pedido");
    if (endereco) endereco.textContent = usuarioAtual?.endereco || lerUsuario()?.endereco || "*Endereço*";

    const pagamento = document.getElementById("pagamento");
    if (pagamento) pagamento.disabled = carrinho.itens.length === 0;
}

async function alterarItemCarrinho(produtoId, metodo, quantidade) {
    const usuario = lerUsuario();
    const caminho = "/carrinho/" + usuario.id + "/itens/" + produtoId;
    const opcoes = { method: metodo };

    if (metodo === "PUT") {
        opcoes.body = JSON.stringify({ quantidade });
    }

    try {
        const carrinho = await requisicaoApi(caminho, opcoes);
        renderizarCarrinho(carrinho);
    } catch (erro) {
        aviso(erro.message);
    }
}

const botaoPagamento = document.getElementById("pagamento");
if (botaoPagamento) {
    botaoPagamento.addEventListener("click", async () => {
        const usuario = lerUsuario();

        if (!usuario) {
            sessionStorage.setItem("donnuts-voltar-carrinho", "true");
            location.href = "login.html";
            return;
        }

        botaoPagamento.disabled = true;

        try {
            const pedido = await requisicaoApi("/pedido/" + usuario.id, { method: "POST" });
            sessionStorage.setItem("donnuts-pedido-atual", JSON.stringify(pedido));
            location.href = "pedido.html";
        } catch (erro) {
            aviso(erro.message);
            botaoPagamento.disabled = false;
        }
    });
}

async function carregarPedido() {
    const resumo = document.getElementById("pedido-itens");
    if (!resumo) return;

    try {
        const pedidoSalvo = JSON.parse(sessionStorage.getItem("donnuts-pedido-atual") || "null");
        if (!pedidoSalvo?.id) {
            resumo.textContent = "Não foi possível localizar o pedido.";
            return;
        }

        const pedido = await requisicaoApi("/pedido/" + pedidoSalvo.id);
        resumo.replaceChildren();

        pedido.itens.forEach(item => {
            const linha = document.createElement("p");
            linha.textContent = item.nomeProduto + " - x" + item.quantidade;
            resumo.append(linha);
        });

        document.getElementById("numero-pedido").textContent = pedido.id;
        document.getElementById("pedido-total").textContent = "Valor Total: " + dinheiro(pedido.total);
        document.getElementById("pedido-endereco").textContent =
            "Entrega: " + (pedido.enderecoEntrega || "Endereço não informado");
    } catch (erro) {
        aviso(erro.message);
    }
}

const statusSeguinte = {
    Recebido: "EmPreparacao",
    EmPreparacao: "SaiuParaEntrega",
    SaiuParaEntrega: "Entregue"
};

const nomeStatus = {
    Recebido: "Recebido",
    EmPreparacao: "Em preparação",
    SaiuParaEntrega: "Saiu para entrega",
    Entregue: "Entregue"
};

async function carregarPedidosEntregador() {
    const lista = document.getElementById("lista-pedidos");
    const usuario = lerUsuario();
    if (!lista || !usuario) return;

    try {
        const pedidos = await requisicaoApi("/pedido/entregador/" + usuario.id);
        lista.replaceChildren();

        if (pedidos.length === 0) {
            lista.textContent = "Ainda não há pedidos.";
            return;
        }

        pedidos.forEach(pedido => {
            const cartao = document.createElement("article");
            cartao.className = "pedido-entregador";

            const titulo = document.createElement("h3");
            titulo.textContent = "Pedido #" + pedido.id;

            const status = document.createElement("p");
            status.className = "status-pedido";
            status.textContent = "Status: " + (nomeStatus[pedido.status] || pedido.status);

            const endereco = document.createElement("p");
            endereco.textContent = "Endereço: " + (pedido.enderecoEntrega || "Não informado");

            const totalPedido = document.createElement("p");
            totalPedido.textContent = "Total: " + dinheiro(pedido.total);

            const itens = document.createElement("ul");
            pedido.itens.forEach(item => {
                const linha = document.createElement("li");
                linha.textContent = item.nomeProduto + " x" + item.quantidade;
                itens.append(linha);
            });

            cartao.append(titulo, status, endereco, totalPedido, itens);

            const proximoStatus = statusSeguinte[pedido.status];
            if (proximoStatus) {
                const botao = document.createElement("button");
                botao.className = "botao";
                botao.type = "button";
                botao.textContent = "Avançar para " + nomeStatus[proximoStatus];
                botao.addEventListener("click", () => atualizarStatusPedido(pedido.id, proximoStatus, botao));
                cartao.append(botao);
            }

            lista.append(cartao);
        });
    } catch (erro) {
        aviso(erro.message);
    }
}

async function atualizarStatusPedido(pedidoId, status, botao) {
    const usuario = lerUsuario();
    botao.disabled = true;

    try {
        await requisicaoApi("/pedido/" + pedidoId + "/status", {
            method: "PUT",
            body: JSON.stringify({
                entregadorId: usuario.id,
                status
            })
        });

        aviso("Status do pedido atualizado.");
        await carregarPedidosEntregador();
    } catch (erro) {
        aviso(erro.message);
        botao.disabled = false;
    }
}

if (document.getElementById("itens-carrinho")) carregarCarrinho();
if (document.getElementById("pedido-itens")) carregarPedido();
if (document.getElementById("lista-pedidos")) carregarPedidosEntregador();
