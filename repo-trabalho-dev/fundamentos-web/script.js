const formProduto = document.querySelector("#form-produto");
const listaProdutos = document.querySelector("#lista-produtos");
const campoNome = document.querySelector("#nome");
const campoPreco = document.querySelector("#preco");
const campoQuantidade = document.querySelector("#quantidade");
const campoDescricao = document.querySelector("#descricao");
const botaoFormulario = document.querySelector("#botao-formulario");
const botaoCancelarEdicao = document.querySelector("#botao-cancelar-edicao");
const tituloFormulario = document.querySelector("#titulo-formulario");
const contadorProdutos = document.querySelector("#contador-produtos-batata");
const mensagemVazia = document.querySelector("#mensagem-vazia-batata");
const mensagemErro = document.querySelector("#mensagem-erro-batata");
const mensagemSucesso = document.querySelector("#mensagem-sucesso");
const campoBusca = document.querySelector("#busca-produto");
const campoOrdenacao = document.querySelector("#ordenacao-produtos");

const NOME_BANCO = "loja-simples";
const VERSAO_BANCO = 1;
const TABELA_PRODUTOS = "produtos";
const LIMITE_ESTOQUE_BAIXO = 5;

const IMAGENS_PRODUTOS = [
  {
    termos: ["caderno", "agenda"],
    arquivo: "assets/caderno-spider-man.jpg",
    alt: "Caderno escolar",
  },
  {
    termos: ["lapis de cor", "giz de cera", "crayon", "canetinha"],
    arquivo: "assets/produtos/colorir.png",
    alt: "Material para colorir",
  },
  {
    termos: ["lapis", "lapiseira", "grafite"],
    arquivo: "assets/produtos/lapis.png",
    alt: "Lápis escolar",
  },
  {
    termos: [
      "caneta bic vermelha",
      "caneta bic vermelho",
      "caneta vermelha",
      "caneta vermelho",
      "caneta red",
      "esferografica vermelha",
      "esferografica vermelho",
      "bic vermelha",
      "bic vermelho",
      "bic cristal vermelha",
      "bic cristal vermelho",
      "bic cristal red",
    ],
    arquivo: "assets/produtos/caneta-bic-vermelha.jpg",
    alt: "Caneta BIC vermelha",
  },
  {
    termos: [
      "caneta bic preta",
      "caneta bic preto",
      "caneta preta",
      "caneta preto",
      "caneta black",
      "esferografica preta",
      "esferografica preto",
      "bic preta",
      "bic preto",
      "bic cristal preta",
      "bic cristal preto",
      "bic cristal black",
    ],
    arquivo: "assets/produtos/caneta-bic-preta.jpg",
    alt: "Caneta BIC preta",
  },
  {
    termos: [
      "caneta bic azul",
      "caneta azul",
      "bic azul",
      "bic cristal azul",
      "bic cristal",
      "caneta bic",
      "caneta",
      "esferografica",
      "marcador",
      "marca-texto",
      "marca texto",
    ],
    arquivo: "assets/produtos/caneta-bic-azul.jpg",
    alt: "Caneta BIC azul",
  },
  {
    termos: ["cola", "adesivo"],
    arquivo: "assets/produtos/cola.jpg",
    alt: "Cola escolar",
  },
  {
    termos: ["borracha", "corretivo"],
    arquivo: "assets/produtos/borracha.svg",
    alt: "Borracha escolar",
  },
  {
    termos: ["mochila", "bolsa escolar", "lancheira"],
    arquivo: "assets/produtos/mochila.png",
    alt: "Mochila escolar",
  },
  {
    termos: ["estojo"],
    arquivo: "assets/produtos/estojo.jpg",
    alt: "Estojo escolar",
  },
  {
    termos: ["regua", "esquadro", "transferidor", "compasso"],
    arquivo: "assets/produtos/regua.png",
    alt: "Régua escolar",
  },
  {
    termos: ["tesoura"],
    arquivo: "assets/produtos/tesoura.png",
    alt: "Tesoura escolar",
  },
  {
    termos: ["apontador"],
    arquivo: "assets/produtos/apontador.jpg",
    alt: "Apontador de lápis",
  },
  {
    termos: ["papel", "sulfite", "cartolina", "folha", "bloco"],
    arquivo: "assets/produtos/papel.png",
    alt: "Papel escolar",
  },
  {
    termos: ["livro", "apostila", "dicionario"],
    arquivo: "assets/produtos/livros.png",
    alt: "Livros escolares",
  },
  {
    termos: ["tinta", "pincel", "aquarela", "guache", "pintura"],
    arquivo: "assets/produtos/pintura.png",
    alt: "Material de pintura",
  },
  {
    termos: ["calculadora"],
    arquivo: "assets/produtos/calculadora.png",
    alt: "Calculadora escolar",
  },
];

const IMAGEM_PRODUTO_PADRAO = {
  arquivo: "assets/produtos/material-escolar.jpg",
  alt: "Material escolar",
};

let banco;
let produtos = [];
let produtoEditandoId = null;
let temporizadorMensagem;

function normalizarTexto(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function abrirBanco() {
  return new Promise(function (resolve, reject) {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB não é suportado neste navegador."));
      return;
    }

    const requisicao = indexedDB.open(NOME_BANCO, VERSAO_BANCO);

    requisicao.onupgradeneeded = function () {
      const bancoEmCriacao = requisicao.result;

      if (!bancoEmCriacao.objectStoreNames.contains(TABELA_PRODUTOS)) {
        const tabela = bancoEmCriacao.createObjectStore(TABELA_PRODUTOS, {
          keyPath: "id",
          autoIncrement: true,
        });

        tabela.add({ nome: "Caderno", preco: 12.5, quantidade: 30 });
        tabela.add({ nome: "Caneta", preco: 2, quantidade: 100 });
        tabela.add({ nome: "Mochila", preco: 89.9, quantidade: 8 });
        tabela.add({ nome: "Estojo", preco: 15, quantidade: 20 });
      }
    };

    requisicao.onsuccess = function () {
      resolve(requisicao.result);
    };

    requisicao.onerror = function () {
      reject(requisicao.error);
    };

    requisicao.onblocked = function () {
      reject(new Error("Feche outras abas da papelaria e tente novamente."));
    };
  });
}

function executarOperacao(modo, operacao) {
  return new Promise(function (resolve, reject) {
    const transacao = banco.transaction(TABELA_PRODUTOS, modo);
    const tabela = transacao.objectStore(TABELA_PRODUTOS);
    const requisicao = operacao(tabela);
    let resultado;

    requisicao.onsuccess = function () {
      resultado = requisicao.result;
    };

    transacao.oncomplete = function () {
      resolve(resultado);
    };

    transacao.onerror = function () {
      reject(transacao.error || requisicao.error);
    };

    transacao.onabort = function () {
      reject(transacao.error || new Error("Operação cancelada."));
    };
  });
}

function listarProdutos() {
  return executarOperacao("readonly", function (tabela) {
    return tabela.getAll();
  });
}

function adicionarProduto(produto) {
  return executarOperacao("readwrite", function (tabela) {
    return tabela.add(produto);
  });
}

function atualizarProduto(produto) {
  return executarOperacao("readwrite", function (tabela) {
    return tabela.put(produto);
  });
}

function removerProduto(id) {
  return executarOperacao("readwrite", function (tabela) {
    return tabela.delete(id);
  });
}

function formatarPreco(preco) {
  return Number(preco).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function obterImagemProduto(nome) {
  const nomeNormalizado = normalizarTexto(nome);

  return IMAGENS_PRODUTOS.find(function (imagem) {
    return imagem.termos.some(function (termo) {
      return nomeNormalizado.includes(termo);
    });
  }) || IMAGEM_PRODUTO_PADRAO;
}

function mostrarErro(texto) {
  mensagemErro.textContent = texto;
  mensagemSucesso.hidden = true;
}

function mostrarSucesso(texto) {
  clearTimeout(temporizadorMensagem);
  mensagemErro.textContent = "";
  mensagemSucesso.textContent = texto;
  mensagemSucesso.hidden = false;

  temporizadorMensagem = setTimeout(function () {
    mensagemSucesso.hidden = true;
  }, 3500);
}

function limparEdicao() {
  produtoEditandoId = null;
  tituloFormulario.textContent = "Novo produto";
  botaoFormulario.textContent = "Adicionar produto";
  botaoCancelarEdicao.hidden = true;
}

function cancelarEdicao() {
  formProduto.reset();
  mensagemErro.textContent = "";
  limparEdicao();
  campoNome.focus();
}

function obterProdutosVisiveis() {
  const busca = normalizarTexto(campoBusca.value);
  const produtosVisiveis = produtos.filter(function (produto) {
    const descricao = produto.descricao || "";
    return normalizarTexto(`${produto.nome} ${descricao}`).includes(busca);
  });

  return produtosVisiveis.sort(function (produtoA, produtoB) {
    switch (campoOrdenacao.value) {
      case "preco-crescente":
        return produtoA.preco - produtoB.preco;
      case "preco-decrescente":
        return produtoB.preco - produtoA.preco;
      case "quantidade-crescente":
        return produtoA.quantidade - produtoB.quantidade;
      case "quantidade-decrescente":
        return produtoB.quantidade - produtoA.quantidade;
      default:
        return produtoA.nome.localeCompare(produtoB.nome, "pt-BR", {
          sensitivity: "base",
        });
    }
  });
}

function atualizarResumo(totalVisivel) {
  const total = produtos.length;

  if (campoBusca.value.trim()) {
    contadorProdutos.textContent = `Exibindo ${totalVisivel} de ${total} produtos`;
  } else {
    contadorProdutos.textContent =
      total === 1 ? "1 produto cadastrado" : `${total} produtos cadastrados`;
  }

  mensagemVazia.textContent = total === 0
    ? "Nenhum produto cadastrado."
    : "Nenhum produto encontrado para esta pesquisa.";
  mensagemVazia.hidden = totalVisivel !== 0;
}

async function alterarEstoque(produto, diferenca, botao) {
  const novaQuantidade = Math.max(0, produto.quantidade + diferenca);

  if (novaQuantidade === produto.quantidade) return;

  botao.disabled = true;

  try {
    await atualizarProduto({ ...produto, quantidade: novaQuantidade });

    if (produtoEditandoId === produto.id) {
      campoQuantidade.value = novaQuantidade;
    }

    await carregarProdutos();
    mostrarSucesso(
      diferenca > 0
        ? `Entrada de estoque registrada para ${produto.nome}.`
        : `Saída de estoque registrada para ${produto.nome}.`
    );
  } catch (erro) {
    mostrarErro("Não foi possível atualizar o estoque.");
    botao.disabled = false;
    console.error(erro);
  }
}

function criarControleEstoque(produto) {
  const areaEstoque = document.createElement("div");
  areaEstoque.classList.add("controle-estoque");
  areaEstoque.setAttribute("aria-label", `Controle de estoque de ${produto.nome}`);

  const botaoSaida = document.createElement("button");
  botaoSaida.type = "button";
  botaoSaida.classList.add("botao-estoque");
  botaoSaida.textContent = "−";
  botaoSaida.title = "Registrar saída de uma unidade";
  botaoSaida.setAttribute("aria-label", `Retirar uma unidade de ${produto.nome}`);
  botaoSaida.disabled = produto.quantidade === 0;
  botaoSaida.addEventListener("click", function () {
    alterarEstoque(produto, -1, botaoSaida);
  });

  const quantidade = document.createElement("span");
  quantidade.classList.add("quantidade-estoque");
  quantidade.textContent = produto.quantidade;
  quantidade.setAttribute("aria-label", `${produto.quantidade} unidades em estoque`);

  const botaoEntrada = document.createElement("button");
  botaoEntrada.type = "button";
  botaoEntrada.classList.add("botao-estoque");
  botaoEntrada.textContent = "+";
  botaoEntrada.title = "Registrar entrada de uma unidade";
  botaoEntrada.setAttribute("aria-label", `Adicionar uma unidade de ${produto.nome}`);
  botaoEntrada.addEventListener("click", function () {
    alterarEstoque(produto, 1, botaoEntrada);
  });

  areaEstoque.append(botaoSaida, quantidade, botaoEntrada);
  return areaEstoque;
}

function criarItemProduto(produto) {
  const item = document.createElement("li");
  item.classList.add("produto-item");

  if (produto.quantidade <= LIMITE_ESTOQUE_BAIXO) {
    item.classList.add("produto-estoque-baixo");
  }

  const conteudoProduto = document.createElement("div");
  conteudoProduto.classList.add("conteudo-produto");

  const imagemSelecionada = obterImagemProduto(produto.nome);
  const imagemProduto = document.createElement("img");
  imagemProduto.classList.add("imagem-produto");
  imagemProduto.src = imagemSelecionada.arquivo;
  imagemProduto.alt = imagemSelecionada.alt;
  imagemProduto.width = 96;
  imagemProduto.height = 96;
  imagemProduto.loading = "lazy";
  conteudoProduto.appendChild(imagemProduto);

  const detalhesProduto = document.createElement("div");
  detalhesProduto.classList.add("detalhes-produto");

  const nomeProduto = document.createElement("h3");
  nomeProduto.textContent = produto.nome;

  const descricaoProduto = document.createElement("p");
  descricaoProduto.classList.add("descricao-produto");
  descricaoProduto.textContent = produto.descricao || "Sem descrição cadastrada.";

  const precoProduto = document.createElement("p");
  precoProduto.classList.add("preco-produto");
  precoProduto.textContent = formatarPreco(produto.preco);

  const indicadorEstoque = document.createElement("p");
  indicadorEstoque.classList.add("indicador-estoque");

  if (produto.quantidade === 0) {
    indicadorEstoque.classList.add("sem-estoque");
    indicadorEstoque.textContent = "Sem estoque";
  } else if (produto.quantidade <= LIMITE_ESTOQUE_BAIXO) {
    indicadorEstoque.classList.add("estoque-baixo");
    indicadorEstoque.textContent = "Estoque baixo";
  } else {
    indicadorEstoque.textContent = "Em estoque";
  }

  detalhesProduto.append(
    nomeProduto,
    descricaoProduto,
    precoProduto,
    indicadorEstoque
  );
  conteudoProduto.appendChild(detalhesProduto);

  const painelProduto = document.createElement("div");
  painelProduto.classList.add("painel-produto");
  painelProduto.appendChild(criarControleEstoque(produto));

  const acoesProduto = document.createElement("div");
  acoesProduto.classList.add("acoes-produto");

  const botaoEditar = document.createElement("button");
  botaoEditar.type = "button";
  botaoEditar.classList.add("botao-editar");
  botaoEditar.textContent = "Editar";
  botaoEditar.setAttribute("aria-label", `Editar ${produto.nome}`);
  botaoEditar.addEventListener("click", function () {
    campoNome.value = produto.nome;
    campoPreco.value = produto.preco;
    campoQuantidade.value = produto.quantidade;
    campoDescricao.value = produto.descricao || "";
    produtoEditandoId = produto.id;
    tituloFormulario.textContent = `Editando: ${produto.nome}`;
    botaoFormulario.textContent = "Salvar alterações";
    botaoCancelarEdicao.hidden = false;
    mensagemErro.textContent = "";
    formProduto.scrollIntoView({ behavior: "smooth", block: "start" });
    campoNome.focus({ preventScroll: true });
  });

  const botaoRemover = document.createElement("button");
  botaoRemover.type = "button";
  botaoRemover.classList.add("botao-remover");
  botaoRemover.textContent = "Remover";
  botaoRemover.setAttribute("aria-label", `Remover ${produto.nome}`);
  botaoRemover.addEventListener("click", async function () {
    const confirmou = window.confirm(
      `Deseja realmente remover o produto "${produto.nome}"?`
    );

    if (!confirmou) return;

    botaoRemover.disabled = true;

    try {
      await removerProduto(produto.id);

      if (produtoEditandoId === produto.id) {
        cancelarEdicao();
      }

      await carregarProdutos();
      mostrarSucesso("Produto removido.");
    } catch (erro) {
      mostrarErro("Não foi possível remover o produto.");
      botaoRemover.disabled = false;
      console.error(erro);
    }
  });

  acoesProduto.append(botaoEditar, botaoRemover);
  painelProduto.appendChild(acoesProduto);
  item.append(conteudoProduto, painelProduto);
  return item;
}

function renderizarProdutos() {
  const produtosVisiveis = obterProdutosVisiveis();
  const fragmento = document.createDocumentFragment();

  produtosVisiveis.forEach(function (produto) {
    fragmento.appendChild(criarItemProduto(produto));
  });

  listaProdutos.replaceChildren(fragmento);
  atualizarResumo(produtosVisiveis.length);
}

async function carregarProdutos() {
  produtos = await listarProdutos();
  renderizarProdutos();
}

function produtoDuplicado(nome) {
  const nomeNormalizado = normalizarTexto(nome);

  return produtos.some(function (produto) {
    return produto.id !== produtoEditandoId
      && normalizarTexto(produto.nome) === nomeNormalizado;
  });
}

formProduto.addEventListener("submit", async function (evento) {
  evento.preventDefault();

  const nome = campoNome.value.trim().replace(/\s+/g, " ");
  const descricao = campoDescricao.value.trim().replace(/\s+/g, " ");
  const valorPreco = campoPreco.value.trim();
  const valorQuantidade = campoQuantidade.value.trim();

  if (!nome) {
    mostrarErro("Informe um nome válido para o produto.");
    campoNome.focus();
    return;
  }

  if (produtoDuplicado(nome)) {
    mostrarErro("Já existe um produto cadastrado com esse nome.");
    campoNome.focus();
    return;
  }

  if (!/^\d+(\.\d{1,2})?$/.test(valorPreco)) {
    mostrarErro("Informe um preço com no máximo duas casas decimais.");
    campoPreco.focus();
    return;
  }

  if (!/^\d+$/.test(valorQuantidade) || Number(valorQuantidade) <= 0) {
    mostrarErro("A quantidade inicial deve ser um número inteiro maior que zero.");
    campoQuantidade.focus();
    return;
  }

  const estavaEditando = produtoEditandoId !== null;
  const produto = {
    nome,
    descricao,
    preco: Number(valorPreco),
    quantidade: Number(valorQuantidade),
  };

  mensagemErro.textContent = "";
  botaoFormulario.disabled = true;

  try {
    if (estavaEditando) {
      produto.id = produtoEditandoId;
      await atualizarProduto(produto);
    } else {
      await adicionarProduto(produto);
    }

    formProduto.reset();
    limparEdicao();
    await carregarProdutos();
    mostrarSucesso(estavaEditando ? "Alterações salvas." : "Produto cadastrado.");
  } catch (erro) {
    mostrarErro("Não foi possível salvar o produto.");
    console.error(erro);
  } finally {
    botaoFormulario.disabled = false;
  }
});

botaoCancelarEdicao.addEventListener("click", cancelarEdicao);
campoBusca.addEventListener("input", renderizarProdutos);
campoOrdenacao.addEventListener("change", renderizarProdutos);

document.addEventListener("keydown", function (evento) {
  if (evento.key === "Escape" && produtoEditandoId !== null) {
    cancelarEdicao();
  }
});

async function iniciarAplicacao() {
  botaoFormulario.disabled = true;

  try {
    banco = await abrirBanco();
    banco.onversionchange = function () {
      banco.close();
    };
    await carregarProdutos();
    botaoFormulario.disabled = false;
  } catch (erro) {
    mostrarErro("Não foi possível abrir o banco de dados local.");
    contadorProdutos.textContent = "Produtos indisponíveis";
    botaoFormulario.disabled = true;
    console.error(erro);
  }
}

iniciarAplicacao();
