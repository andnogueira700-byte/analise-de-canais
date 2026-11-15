---
name: prompts-darkplanner-zeitzeichner
description: Gera o PROMPTS.txt do DarkPlanner (1 linha por bloco do SRT de tempo, [I] imagem e [V] vídeo) para o canal alemão ZEITZEICHNER, no estilo cartoon fixo, com tokens [Nome] de personagens referenciados e metáfora visual por frase. Use quando o usuário enviar um SRT de tempo do DarkPlanner (darkplanner_srtsynctempo.srt) e pedir os prompts de imagem/animação de um vídeo.
---

# Prompts DarkPlanner — ZEITZEICHNER

## Entradas
1. `darkplanner_srtsynctempo.srt` (obrigatório): cada bloco = 1 cena = 1 arquivo gerado.
2. Roteiro do vídeo (opcional): ajuda a entender o contexto.
3. Lista de personagens já cadastrados no DarkPlanner (tokens).

## Regras de ouro
- **TOTAL DE LINHAS = TOTAL DE BLOCOS DO SRT.** Nunca juntar, dividir ou pular blocos. O Sincronizador SRT depende disso.
- Ler o SRT inteiro antes de escrever. Agrupar blocos em *beats* (mesmo lugar e mesma ação) e variar o enquadramento dentro do beat, sem inventar cenário novo a cada bloco.
- **Metáfora visual por frase** (o diferencial do canal): "controlar alguém" vira marionete ou coleira; "governar sem parlamento" vira alavanca vermelha de emergência; "a democracia ficou mais fraca" vira bandeira murcha. Callbacks visuais devem repetir a mesma imagem.
- **Menção não é presença:** o token `[Nome]` só entra se a pessoa aparece no quadro (ou num retrato/estátua que precisa ser ela). Uma vez por linha. O nome **nunca** aparece fora dos colchetes; depois do token, use descritores ("the old man", "the stocky officer", "the emperor").
- Proibido na imagem: texto legível, números, suástica e qualquer símbolo nazista (braçadeiras vermelhas lisas, bandeiras sem símbolo). Datas e números entram na edição.
- Pessoas que aparecem 1 ou 2 vezes não recebem token: descreva-as de forma genérica.

## Processo
1. Contar os blocos do SRT.
2. Escrever `cenas.txt`, uma linha por bloco: `id|Token1, Token2|cena estática em inglês (15–30 palavras)|movimento do vídeo em inglês (3–10 palavras)`.
3. Rodar: `python3 compilar.py <pasta> <srt_tempo>`. O script injeta, verbatim, o lock de referência, o STYLE_DNA e o NEGATIVE_DNA (ver `ESTILO_zeitzeichner_cartoon.md`), calcula a duração de cada bloco e valida a contagem e os nomes fora do token.
4. Entregar `PROMPTS_IMAGEM.txt` e `PROMPTS_VIDEO.txt`. Se surgir personagem novo recorrente, entregar também o prompt da imagem de referência dele, no mesmo estilo.

## Tokens atuais
Hindenburg (velho), Paul (Hindenburg jovem), Ludendorff, Kaiser (Guilherme II), Papen, Oskar, Schleicher, Hitler. Para cada vídeo novo, defina os tokens e acrescente-os à lista `names` do `compilar.py`.
