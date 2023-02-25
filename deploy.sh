#!/usr/bin/bash

ESC=$( printf "\033")
NC="$ESC[0m"
white="$ESC[1;37m"
red="$ESC[0;31m"
green="$ESC[0;32m"
blue="$ESC[1;34m"

getEnv(){
	VAR=$(grep -w $1 .env | xargs)
	IFS="=" read -ra VAR <<< "$VAR"
	echo ${VAR[1]}
}

printColored(){
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
		cd "$project/dist"

		domainPrefix=$([ "$target" == "dev" ] && echo "dev." || echo "")
		publicDirectory="/home/$SERVER_USER/domains/$domainPrefix$project.humbak.eu/public_html"

			ssh "$SSH_USER@$SERVER_IP" -o PubkeyAuthentication=no -p $SSH_PORT -tt << ENDSSH
source "/home/$SERVER_USER/nodevenv/domains/$domainPrefix$project.humbak.eu/public_html/18/bin/activate"
cd $publicDirectory
screen -S "${domainPrefix}${project}" -X quit
exit
ENDSSH
			sftp "$SSH_USER@$SERVER_IP" -o PubkeyAuthentication=no -P $SSH_PORT << ENDFTP
cd $publicDirectory
put index.js index.js
put package.json package.json
quit
ENDFTP
			ssh "$SSH_USER@$SERVER_IP" -o PubkeyAuthentication=no -p $SSH_PORT -tt << ENDSSH
source "/home/$SERVER_USER/nodevenv/domains/$domainPrefix$project.humbak.eu/public_html/18/bin/activate"
cd $publicDirectory
screen -S "${domainPrefix}${project}" -L -dm node index.js
exit
ENDSSH
	)
}

if [ ! -f ./.env ]; then
	printColored $red ".env not found"
	exit
fi

# TODO: flag for installing dependencies

printf "\n$green?$white choose project$NC"

projectOptions=("api" "admin" "webpage")

selectOption "${projectOptions[@]}"
projectChoice=$?
project=${projectOptions[$projectChoice]}

if [ $projectChoice -ne 0 ]; then
	printColored $red "not supported yet"
	exit
fi

# TODO: menu with dev/prod target
target="dev"

printf "$green?$white choose action$NC"

actionOptions=("build" "deploy" "build and deploy")

selectOption "${actionOptions[@]}"
actionChoice=$?
action=${actionOptions[$actionChoice]}

SERVER_IP=$(getEnv SERVER_IP)
SERVER_USER=$(getEnv SERVER_USER)
SSH_PORT=$(getEnv SSH_PORT)
SSH_USER=$(getEnv SSH_USER)
SSH_PASSWORD=$(getEnv SSH_PASSWORD)

if [ $actionChoice -eq 0 ]; then
	printf "building "
	printColored $white $project
	buildProject
elif [ $actionChoice -eq 1 ]; then
	printf "deploying "
	printColored $white $project
	deployProject
else
	printf "building and deploying "
	printColored $white $project
	buildProject
	deployProject
fi
