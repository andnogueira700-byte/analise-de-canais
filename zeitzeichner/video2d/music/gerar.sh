gen(){ [ -s "$1.mp3" ] && return; code=$(curl -s -o "$1.mp3" -w "%{http_code}" -X POST "https://api.elevenlabs.io/v1/music" -H "Content-Type: application/json" -d "{\"prompt\":\"$2\",\"music_length_ms\":120000}"); echo "$1 $code"; }
gen kaiserreich "instrumental documentary underscore, late 19th century Prussian Empire, noble and restrained, soft strings, light snare, warm brass pads, steady medium tempo, no vocals, loopable"
gen weltkrieg "instrumental documentary underscore, World War One tension, low strings ostinato, distant timpani, dark and driving, not too loud, no vocals, loopable"
gen weimar "instrumental documentary underscore, 1920s Berlin, melancholic solo piano with soft muted trumpet and brushed drums, uneasy, no vocals, loopable"
gen untergang "instrumental documentary underscore, ominous and dark, slow cello drones, low piano notes, rising tension, suspense, no vocals, loopable"
gen epilog "instrumental documentary underscore, reflective and hopeful, gentle piano and strings, slow, no vocals, loopable"
