import { exit } from 'node:process';
import { confirm } from '@clack/prompts';
import { env } from '~/env';

export async function promptProdContinue() {
	let shouldContinue = true;

	if (env.NODE_ENV === 'production') {
		shouldContinue = await confirm({ message: 'Are you sure?', initialValue: false }) as boolean;
	}

	if (!shouldContinue) {
		exit(0);
	}
}
