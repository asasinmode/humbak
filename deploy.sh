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

deployProject(){
	printf "\n"
	(
		cd ".output"

		local publicDirectory="/home/${SERVER_USER}/domains/${SERVER_PAGE_DOMAIN}/public_html"
		local sourceNode="/home/${SERVER_USER}/nodevenv/domains/${SERVER_PAGE_DOMAIN}/public_html/20/bin/activate"
		local installCommand=$([ "$installDependencies" = true ] && echo "pnpm i" || echo "")

		ssh "$SSH_USER@$SERVER_IP" -o PubkeyAuthentication=no -p $SSH_PORT -tt << ENDSSH
screen -S "page" -X quit
exit
ENDSSH

		# sendPage "${publicDirectory}"

		ssh "$SSH_USER@$SERVER_IP" -o PubkeyAuthentication=no -p $SSH_PORT -tt << ENDSSH
source "$sourceNode"
cd $publicDirectory
ls
$installCommand
screen -S "page" -dm node index.mjs
exit
ENDSSH
	)
}

# sendPage() {
# 	local publicDirectory="${1}"
# 			ssh "${SSH_USER}@${SERVER_IP}" -o PubkeyAuthentication=no -p $SSH_PORT -tt << ENDSSH
# cd ${publicDirectory}
# rm -rf _fonts _nuxt admin chunks
# exit
# ENDSSH
# 	sftp -o PubkeyAuthentication=no -P $SSH_PORT "${SSH_USER}@${SERVER_IP}" << ENDFTP
# cd ${publicDirectory}
# put server/index.mjs
# put server/index.mjs.map
# put server/package.json
# put robots.txt
# put -r public/_fonts
# put -r public/_nuxt
# put -r public/admin
# put -r server/chunks
# quit
# ENDFTP
# }

if [ ! -f ./.env ]; then
	printColored $red ".env not found"
	exit
fi

for arg; do
	if [[ $arg == "-i" ]]; then
		installDependencies=true
	fi
done

if [ "$installDependencies" = true ]; then
	printf "! ${yellow}installing dependencies${NC} !\n"
fi

SERVER_IP=$(getEnv DEPLOY_SERVER_IP)
SERVER_USER=$(getEnv DEPLOY_SERVER_USER)
SERVER_PAGE_DOMAIN=$(getEnv DEPLOY_SERVER_PAGE_DOMAIN)
SSH_PORT=$(getEnv DEPLOY_SSH_PORT)
SSH_USER=$(getEnv DEPLOY_SSH_USER)
SSH_PASSWORD=$(getEnv DEPLOY_SSH_PASSWORD)

printf "$green?$white choose action$NC\n"

select opt in "deploy" "build and deploy"; do
	case $opt in
		"deploy")
			printf "deploying "
			deployProject
			exit;
			;;
		"build and deploy")
			printf "building and deploying "
			pnpm run build
			deployProject
			exit;
			;;
		*)
			printColored $red "invalid option"
			exit 0
			;;
	esac
done
