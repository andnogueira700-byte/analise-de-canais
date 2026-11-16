# analise-de-canais

Esteira de produção de vídeos para um canal faceless do YouTube Brasil de
**documentários investigativos sobre vazamentos de dados, golpes digitais e
ataques hackers**.

## Como usar

No Claude Code, dentro deste projeto:

```
/novo-video Como 7,6 milhões de CPFs saíram da Caixa
```

O Claude age como **Diretor** e passa o trabalho por 6 agentes:

```
Diretor (briefing)
  → pesquisador (sonnet)
  → roteirista (opus)
  → titulos-descricao (sonnet) + editor (haiku)   ← em paralelo
  → thumbnail (sonnet)
  → analista (sonnet)  ── AJUSTES? volta ao agente certo (máx. 2x)
  → Diretor + você decidem
```

Tudo fica salvo em `videos/NNN-slug/`.

## Estrutura

- `CLAUDE.md` — instruções gerais do projeto
- `canal/CANAL.md` — bíblia do canal (tom, estrutura, títulos, visual, regras jurídicas)
- `canal/REFERENCIAS.md` — concorrentes e vídeos de referência
- `canal/PAUTA.md` — banco de ideias e plano de lançamento
- `.claude/agents/` — os 6 agentes
- `.claude/skills/novo-video/` — a esteira do Diretor
- `videos/` — um diretório por vídeo
