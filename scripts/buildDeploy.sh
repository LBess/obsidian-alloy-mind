bash scripts/build.sh

if [[ -z "${OBSIDIAN}" ]]; then
    read -p "Enter vault path: " obsidian
    export OBSIDIAN=$obsidian
else
    echo "Current vault path: ${OBSIDIAN}"
    read -p "Would you like to use the current vault ${OBSIDIAN} (Y/N):" use_current_vault

    if [[ "${use_current_vault}" == [Nn] ]]; then
        read -p "Enter vault path: " obsidian
        export OBSIDIAN=$obsidian
    fi
fi

vault_plugin_path="${OBSIDIAN}/.obsidian/plugins/obsidian-alloy-mind/"

if [ ! -d "${vault_plugin_path}" ]; then
    mkdir ${vault_plugin_path}
fi

cp main.js ${vault_plugin_path}
cp manifest.json ${vault_plugin_path}

echo "Deployed to ${vault_plugin_path}"
