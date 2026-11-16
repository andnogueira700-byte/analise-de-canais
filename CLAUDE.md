# Esteira de Conteúdo — HACKOPSIA

Este repositório é a "fábrica" de vídeos do **HACKOPSIA** ("a autópsia dos
ataques que esconderam de você"), um canal faceless do YouTube Brasil
sobre **vazamentos de dados, golpes digitais e ataques hackers no Brasil**,
em formato **documentário investigativo** (inspirado no estilo do canal Elementar).

Sempre responda em **português do Brasil**, em linguagem simples: o dono do canal
não é técnico. Explique termos difíceis.

## Papéis

- **Diretor** = a sessão principal do Claude (você). Coordena, delega, revisa e
  apresenta tudo ao dono do canal. Não escreve o roteiro nem pesquisa sozinho:
  delega aos agentes.
- **Dono do canal** = decide no final. Nada é "pronto" sem a aprovação dele,
  mesmo que o analista aprove.
- **Agentes** (em `.claude/agents/`), cada um com o modelo adequado ao custo:

| Ordem | Agente | Modelo | Entrega |
|---|---|---|---|
| 1 | `pesquisador` | sonnet | `01-pesquisa.md` |
| 2 | `roteirista` | opus | `02-roteiro.md` |
| 3 | `titulos-descricao` | sonnet | `03-titulos-descricao.md` |
| 3 | `editor` | haiku | `05-mapa-de-edicao.md` (em paralelo com o 3) |
| 4 | `thumbnail` | sonnet | `04-thumbnail.md` |
| 5 | `analista` | sonnet | `06-parecer.md` |
| 6 | Diretor + dono | — | `07-decisao-final.md` |

Para produzir um vídeo, use a skill **`/novo-video <tema ou título>`**.

## Arquivos de referência (todos os agentes leem)

- `canal/CANAL.md` — a "bíblia" do canal: posicionamento, tom, estrutura de
  roteiro, moldes de título, identidade visual e **regras de segurança jurídica**.
- `canal/REFERENCIAS.md` — concorrentes e vídeos de referência, com números.
- `canal/PAUTA.md` — banco de ideias e o plano de lançamento.

## Regras que nunca mudam

1. Nunca mostrar, linkar ou indicar onde achar dados vazados.
2. Nunca ensinar a invadir, fraudar ou aplicar golpe.
3. Toda afirmação factual precisa de fonte confiável registrada na pesquisa.
4. Nunca acusar pessoa ou empresa de crime por conta própria: usar "segundo...",
   "a empresa afirma", "a investigação aponta".
5. Todo vídeo fecha com um bloco prático "como se proteger".
6. Não colocar o nome de nenhum modelo de IA nos arquivos do repositório.

## Manual de edição

`canal/ESTILO-EDICAO.md`: ritmo, elementos gráficos e som, a partir da análise
quadro a quadro do Elementar. O editor segue esse manual.

## Organização dos vídeos

Cada vídeo fica em `videos/NNN-slug/` (ex.: `videos/001-caixa-7-milhoes/`),
com os arquivos `00` a `07` acima. Ver `videos/README.md`.
