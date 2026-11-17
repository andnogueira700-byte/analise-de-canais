#!/usr/bin/env python3
"""Gera a narração no ElevenLabs em partes (intro + blocos), com a mesma voz e
configuração do Laudo 001, e guarda o tempo de cada palavra (sem gastar transcrição).

Uso:
  python3 -I ferramentas/narrar.py partes  <roteiro-corrido.txt> <02-roteiro.md> <pasta>   # só divide e mostra
  python3 -I ferramentas/narrar.py gerar   <pasta> <n1,n2,...>                               # gera as partes pedidas

A chave da API é colocada pelo proxy (segredo do ambiente); nunca fica no código.
"""
import base64, json, os, re, sys, urllib.request

VOZ = "33u9luNTTs0hqbDEpCsN"   # And Nogueira (voz clonada do dono)
MODELO = "eleven_v4"          # o mesmo do Laudo 001
AJUSTES = {"stability": 0.5, "similarity_boost": 0.75, "style": 0.0, "use_speaker_boost": True, "speed": 1.0}


def dividir(corrido, roteiro, pasta):
    texto = open(corrido).read().strip()
    paras = [p.strip() for p in texto.split("\n\n") if p.strip()]
    rot = open(roteiro).read()
    inicios = []
    for m in re.finditer(r"^## \[BLOCO (\d)[^\n]*\n(.*?)(?=^## |\Z)", rot, re.S | re.M):
        primeira = next(l.strip() for l in m.group(2).split("\n")
                        if l.strip() and not l.strip().startswith(("#", ">", "|", "[", "<!--", "---", "*", "-")))
        inicios.append(primeira[:60])
    partes, atual = [], []
    for p in paras:
        if any(p.startswith(i) for i in inicios) and atual:
            partes.append("\n\n".join(atual)); atual = []
        atual.append(p)
    partes.append("\n\n".join(atual))
    os.makedirs(pasta, exist_ok=True)
    for i, t in enumerate(partes):
        open(os.path.join(pasta, f"parte{i}.txt"), "w").write(t)
        print(f"parte{i}: {len(t)} caracteres | começa: {t[:50]!r}")
    print("total:", sum(len(t) for t in partes), "caracteres em", len(partes), "partes")


def gerar(pasta, quais):
    estado_p = os.path.join(pasta, "estado.json")
    estado = json.load(open(estado_p)) if os.path.exists(estado_p) else {}
    for n in quais:
        if str(n) in estado:
            print(f"parte{n} já gerada, pulando (não gasta crédito)"); continue
        texto = open(os.path.join(pasta, f"parte{n}.txt")).read()
        corpo = {"text": texto, "model_id": MODELO, "voice_settings": AJUSTES}
        anteriores = [estado[str(k)]["request_id"] for k in sorted(map(int, estado)) if k < n][-3:]
        if anteriores:
            corpo["previous_request_ids"] = anteriores
        req = urllib.request.Request(
            f"https://api.elevenlabs.io/v1/text-to-speech/{VOZ}/with-timestamps?output_format=mp3_44100_128",
            data=json.dumps(corpo).encode(), method="POST",
            headers={"Content-Type": "application/json", "xi-api-key": "dummy"})
        try:
            r = urllib.request.urlopen(req, timeout=600)
        except urllib.error.HTTPError as e:
            print(f"parte{n}: ERRO {e.code}: {e.read()[:400]!r}"); return
        rid = r.headers.get("request-id") or r.headers.get("x-request-id") or ""
        d = json.loads(r.read())
        mp3 = os.path.join(pasta, f"parte{n}.mp3")
        open(mp3, "wb").write(base64.b64decode(d["audio_base64"]))
        al = d.get("normalized_alignment") or d.get("alignment") or {}
        json.dump(al, open(os.path.join(pasta, f"parte{n}-alinhamento.json"), "w"))
        fim = al.get("character_end_times_seconds", [0])[-1] if al else 0
        estado[str(n)] = {"request_id": rid, "caracteres": len(texto), "duracao_fala": fim}
        json.dump(estado, open(estado_p, "w"), indent=1)
        print(f"parte{n}: ok | {len(texto)} caracteres | fala até {fim:.1f}s | {len(texto) / max(fim, 1):.1f} car/s | request {rid[:8]}")


if __name__ == "__main__":
    if sys.argv[1] == "partes":
        dividir(*sys.argv[2:5])
    else:
        gerar(sys.argv[2], [int(x) for x in sys.argv[3].split(",")])
