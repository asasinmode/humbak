#!/usr/bin/bash

ESC=$( printf "\033")
NC="$ESC[0m"
white="$ESC[1;37m"
red="$ESC[0;31m"
green="$ESC[0;32m"
yellow="$ESC[0;33m"
blue="$ESC[1;34m"

getEnv() {
	VAR=$(grep -w $1 .env | xargs)
	IFS="=" read -ra VAR <<< "$VAR"
	echo ${VAR[1]}
}

printColored() {
	printf "$1$2${NC}" 
}

selectOption() {
	cursor_blink_on()  { printf "$ESC[?25h"; }
	cursor_blink_off() { printf "$ESC[?25l"; }
	cursor_to()        { printf "$ESC[$1;${2:-1}H"; }
	print_option()     { printf "  $1"; }
	print_selected()   { printf "$blue❯ $1$NC"; }
	get_cursor_row()   { IFS=';' read -sdR -p $'\E[6n' ROW COL; echo ${ROW#*[}; }
	key_input()        { read -s -n3 key 2>/dev/null >&2
											if [[ $key = $ESC[A ]]; then echo up;    fi
											if [[ $key = $ESC[B ]]; then echo down;  fi
											if [[ $key = ""     ]]; then echo enter; fi; }

	printf "\n"
	for opt; do printf "\n"; done

	local lastrow=`get_cursor_row`
	local startrow=$(($lastrow - $#))

	trap "cursor_blink_on; stty echo; printf '\n'; exit" 2
	cursor_blink_off

	local selected=0
	while true; do
		local idx=0
		for opt; do
			cursor_to $(($startrow + $idx))
			if [ $idx -eq $selected ]; then
				print_selected "$opt"
			else
				print_option "$opt"
			fi
			((idx++))
		done

		case `key_input` in
			enter) 			break;;
			up)  				((selected--));
				if [ $selected -lt 0 ]; then selected=$(($# - 1)); fi;;
			down)  			((selected++));
				if [ $selected -ge $# ]; then selected=0; fi;;
		esac
	done

	cursor_to $lastrow
	printf "\n"
	cursor_blink_on

	return $selected
}

buildProject(){
	printf "\n"
	(
		cd $project
		npm run build
	)
}

deployProject(){
	printf "\n"
	(
		cd "${project}/dist"

		local domainPrefix=$([ "$target" == "dev" ] && echo "dev-" || echo "")

		if [ "$project" == 'page' ] && [ "$target" == 'dev' ]; then
			local projectDir="dev.${SERVER_PAGE_DOMAIN}"
		elif [ "$project" == 'page' ]; then
			local projectDir="${SERVER_PAGE_DOMAIN}"
		else
			local projectDir="${domainPrefix}${project}.${SERVER_PAGE_DOMAIN}"
		fi

		local publicDirectory="/home/${SERVER_USER}/domains/${projectDir}/public_html"
		local sourceNode="/home/${SERVER_USER}/nodevenv/domains/${projectDir}/public_html/20/bin/activate"
		local installCommand=$([ "$installDependencies" = true ] && echo "pnpm i" || echo "")
		local screenName="${domainPrefix}${project}"

		if [ "${project}" == 'page' ]; then
			local targetFile="index.mjs"
		else
			local targetFile="index.js"
		fi

		if [ "${project}" != 'admin' ]; then
			ssh "$SSH_USER@$SERVER_IP" -o PubkeyAuthentication=no -p $SSH_PORT -tt << ENDSSH
source "${sourceNode}"
cd ${publicDirectory}
screen -S "${screenName}" -X quit
exit
ENDSSH
		fi

		if [ "${project}" == 'api' ]; then
				sendApi "$publicDirectory"
		elif [ "${project}" == 'admin' ]; then
				sendAdmin "${publicDirectory}"
		else
				sendPage "${publicDirectory}"
		fi

		if [ "${project}" != 'admin' ]; then
			ssh "$SSH_USER@$SERVER_IP" -o PubkeyAuthentication=no -p $SSH_PORT -tt << ENDSSH
source "$sourceNode"
cd $publicDirectory
$installCommand
screen -S "${screenName}" -dm node $targetFile
exit
ENDSSH
		fi
	)
}

sendApi() {
	local publicDirectory="${1}"
	sftp -o PubkeyAuthentication=no -P $SSH_PORT "${SSH_USER}@${SERVER_IP}" << ENDFTP
cd ${publicDirectory}
put index.js
put package.json
quit
ENDFTP
}

sendAdmin() {
	local publicDirectory="${1}"
	sftp -o PubkeyAuthentication=no -P $SSH_PORT "${SSH_USER}@${SERVER_IP}" << ENDFTP
cd ${publicDirectory}
rm assets/*
put index.html
mkdir assets
put -r assets
quit
ENDFTP
}

sendPage() {
	local publicDirectory="${1}"
			ssh "${SSH_USER}@${SERVER_IP}" -o PubkeyAuthentication=no -p $SSH_PORT -tt << ENDSSH
cd ${publicDirectory}
rm -rf _nuxt
rm -rf chunks
exit
ENDSSH
	sftp -o PubkeyAuthentication=no -P $SSH_PORT "${SSH_USER}@${SERVER_IP}" << ENDFTP
cd ${publicDirectory}
put server/index.mjs
put server/index.mjs.map
put server/package.json
mkdir _nuxt
put -r public/_nuxt
mkdir chunks
put -r server/chunks
quit
ENDFTP
}

if [ ! -f ./.env ]; then
	printColored $red ".env not found"
	exit
fi

target="dev"

for arg; do
	if [[ $arg == "-i" ]]; then
		installDependencies=true
	elif [[ $arg == "-prod" ]]; then
		target="prod"
	fi
done

if [ "$installDependencies" = true ]; then
	printf "! ${yellow}installing dependencies$NC !\n"
fi

if [ "$target" = "prod" ]; then
	printf "! ${red}version is prod$NC !\n"
fi

printf "\n$green?$white choose project$NC"

projectOptions=("api" "admin" "page")

selectOption "${projectOptions[@]}"
projectChoice=$?
project=${projectOptions[$projectChoice]}

printf "$green?$white choose action$NC"

actionOptions=("deploy" "build and deploy")

selectOption "${actionOptions[@]}"
actionChoice=$?
action=${actionOptions[$actionChoice]}

SERVER_IP=$(getEnv SERVER_IP)
SERVER_USER=$(getEnv SERVER_USER)
SERVER_PAGE_DOMAIN=$(getEnv SERVER_PAGE_DOMAIN)
SSH_PORT=$(getEnv SSH_PORT)
SSH_USER=$(getEnv SSH_USER)
SSH_PASSWORD=$(getEnv SSH_PASSWORD)

if [ $actionChoice -eq 0 ]; then
	printf "deploying "
	printColored $white $project
	deployProject
else
	printf "building and deploying "
	printColored $white $project
	buildProject
	deployProject
fi
