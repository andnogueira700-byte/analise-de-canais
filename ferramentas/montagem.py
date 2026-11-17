#!/usr/bin/env python3
"""Montagem final: intro + blocos, com o "respiro" entre blocos (ESTILO-EDICAO 3.11) e cartão final.

Uso: python3 -I ferramentas/montagem.py config-montagem.json

config: {
  "partes": [{"arquivo": "intro.mp4", "corte_fim": 91.88}, {"arquivo": "bloco1.mp4", "cartao_antes": null}, ...
             {"arquivo": "bloco2.mp4", "cartao_antes": "ARQUIVO 02 — A investigação"}],
  "musica_respiro": "intro-tensao.mp3", "digitacao": "digitacao.mp3",
  "cartao_final": "HACKOPSIA / LAUDO Nº 001 — ENCERRADO / ...", "dur_final": 12,
  "look": "...", "pasta_temp": "...", "saida": "final.mp4"
}
"""
import json, os, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from render_storyboard import vinheta, W, H, FPS  # mesmo visual da vinheta da intro

DUR_RESPIRO = 3.0   # tela escura com o cartão (2 a 4 s pelo manual)
FADE_OUT = 0.8      # imagem escurece no fim do bloco
FADE_IN = 0.6       # imagem clareia junto com a primeira frase do bloco seguinte


def sh(cmd):
    subprocess.run(cmd, check=True)


def duracao(arq):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                          "-of", "csv=p=0", arq]).decode().strip())


def cartao(texto, dur, saida, cfg, ini_musica, vol_musica):
    """Cartão digitado no escuro, com a música de suspense subindo e o som de digitação."""
    tmp_v = saida + ".video.mp4"
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                          "-r", str(FPS), "-i", "-", "-vf", cfg["look"], "-c:v", "libx264", "-crf", "18",
                          "-preset", "medium", "-pix_fmt", "yuv420p", tmp_v], stdin=subprocess.PIPE)
    n = int(dur * FPS)
    for q in range(n):
        k = q / max(1, n - 1)
        p.stdin.write(vinheta(texto, min(1.0, k * 1.25), dur).tobytes())
    p.stdin.close(); p.wait()
    digita = min(dur, dur / 1.25 / 1.6 + 0.2)  # tempo em que as letras estão aparecendo
    filtro = (f"[1:a]atrim={ini_musica}:{ini_musica + dur},asetpts=PTS-STARTPTS,volume={vol_musica}dB,"
              f"afade=t=in:d=0.6,afade=t=out:st={dur - 0.9}:d=0.9[m];"
              f"[2:a]atrim=0:{digita},asetpts=PTS-STARTPTS,volume=-6dB,afade=t=out:st={max(0, digita - 0.2)}:d=0.2[t];"
              f"[m][t]amix=inputs=2:normalize=0,aformat=sample_rates=48000:channel_layouts=stereo[a]")
    sh(["ffmpeg", "-v", "error", "-y", "-i", tmp_v, "-i", cfg["musica_respiro"], "-stream_loop", "-1",
        "-i", cfg["digitacao"], "-filter_complex", filtro, "-map", "0:v", "-map", "[a]", "-c:v", "copy",
        "-c:a", "aac", "-b:a", "192k", "-t", str(dur), saida])
    os.remove(tmp_v)


def parte(arq, saida, corte_fim=None, fade_in=True, fade_out=True):
    d = corte_fim or duracao(arq)
    vf, af = [], []
    if fade_in:
        vf.append(f"fade=t=in:d={FADE_IN}"); af.append("afade=t=in:d=0.25")
    if fade_out:
        vf.append(f"fade=t=out:st={d - FADE_OUT}:d={FADE_OUT}"); af.append(f"afade=t=out:st={d - FADE_OUT}:d={FADE_OUT}")
    cmd = ["ffmpeg", "-v", "error", "-y", "-i", arq, "-t", str(d)]
    if vf:
        cmd += ["-vf", ",".join(vf)]
    cmd += ["-af", ",".join(af + ["aformat=sample_rates=48000:channel_layouts=stereo"]),
            "-r", str(FPS), "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "192k", saida]
    sh(cmd)


def montar(cfg):
    tmp = cfg["pasta_temp"]; os.makedirs(tmp, exist_ok=True)
    pecas = []
    ini_m = 0.0
    for i, pt in enumerate(cfg["partes"]):
        if pt.get("cartao_antes"):
            c = os.path.join(tmp, f"cartao_{i:02d}.mp4")
            print("cartão:", pt["cartao_antes"], flush=True)
            cartao(pt["cartao_antes"], DUR_RESPIRO, c, cfg, ini_m, cfg.get("vol_respiro", -9))
            ini_m += DUR_RESPIRO + 7  # cada respiro usa um trecho diferente da música
            pecas.append(c)
        s = os.path.join(tmp, f"parte_{i:02d}.mp4")
        print("parte:", os.path.basename(pt["arquivo"]), flush=True)
        ultimo = i == len(cfg["partes"]) - 1
        parte(pt["arquivo"], s, pt.get("corte_fim"), fade_in=i > 0, fade_out=True)
        pecas.append(s)
        if ultimo and cfg.get("cartao_final"):
            c = os.path.join(tmp, "cartao_final.mp4")
            print("cartão final", flush=True)
            cartao(cfg["cartao_final"], cfg.get("dur_final", 12), c, cfg, ini_m, cfg.get("vol_respiro", -9))
            pecas.append(c)
    lista = os.path.join(tmp, "lista.txt")
    open(lista, "w").write("".join(f"file '{p}'\n" for p in pecas))
    sh(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lista, "-c", "copy",
        "-movflags", "+faststart", cfg["saida"]])
    print("pronto:", cfg["saida"], round(duracao(cfg["saida"]), 1), "s", flush=True)


if __name__ == "__main__":
    montar(json.load(open(sys.argv[1])))
