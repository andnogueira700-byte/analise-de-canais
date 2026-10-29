UA='MapaRaizResearch/0.1 (https://github.com/andnogueira700-byte/analise-de-canais; video research)'
fetch(){ # name filename(underscored) md5path
  for i in 1 2 3 4 5 6; do
    for u in "https://upload.wikimedia.org/wikipedia/commons/thumb/$3/$2/960px-$2" "https://upload.wikimedia.org/wikipedia/commons/$3/$2"; do
      c=$(curl -s -o "$1_orig" -w '%{http_code}' -m 60 -A "$UA" "$u"); echo "$1 $c $u"
      if [ "$c" = 200 ] && file "$1_orig" | grep -qi image; then ffmpeg -v error -y -i "$1_orig" -vf scale=600:-2 -q:v 3 "$1.jpg"; rm -f "$1_orig"; return; fi
      sleep 20
    done
    sleep $((30*i))
  done
}
md(){ python3 -c "import hashlib,sys;h=hashlib.md5(sys.argv[1].encode()).hexdigest();print(h[0]+'/'+h[:2])" "$1"; }
for pair in "vargas|Getulio_Vargas_(1930)_(cropped).jpg" "pedro1|Portrait_of_D._Pedro_I_(1826)_-_Google_Art_Project.jpg" "leopoldina|Imperatriz_D._Leopoldina_por_Luís_Schlappriz_(cropped).jpg"; do
  n=${pair%%|*}; f=${pair#*|}; enc=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))" "$f")
  fetch "$n" "$enc" "$(md "$f")"; sleep 20
done
ls -la
