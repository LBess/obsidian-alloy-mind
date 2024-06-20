bash scripts/build.sh

echo "Current vault path: ${OBSIDIAN}"
read -p "New vault path: " obsidian
export OBSIDIAN=$obsidian

cp main.js ${OBSIDIAN}/.obsidian/plugins/obsidian-time-entry-turner/
cp manifest.json ${OBSIDIAN}/.obsidian/plugins/obsidian-time-entry-turner/
