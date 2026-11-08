#!/bin/bash
# uso: sheet.sh saida.jpg arquivos...
out=$1; shift
montage "$@" -tile 3x -geometry 640x360+4+4 -background '#222' $out
