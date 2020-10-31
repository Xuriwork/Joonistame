import { Notyf } from 'notyf';

const notyf = new Notyf({
	position: {
		x: 'right',
		y: 'top',
    },
	dismissible: true,
});

export const notyfError = (message) => notyf.error({ message, duration: 2000 });
export const notyfSuccess = (message) => notyf.success({ message, duration: 2000 });