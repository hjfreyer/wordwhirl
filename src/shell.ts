
import '../assets/style.scss';

export interface LibraryLoaded {
	kind: "lib"
	value: any
}

interface ButtonPressed {
	kind: "button"
}

const libLoaded : Promise<LibraryLoaded> = import(/* webpackChunkName: "app" */ './index').then(l=> ({
	kind: "lib",
	value: l,
} as LibraryLoaded));

const button = document.getElementById('new-game')!;

const buttonPromise : Promise<any> = (()=> {
	// @ts-ignore
	return window['buttonPromise'];
})();


const buttonPressed : Promise<ButtonPressed> = 
	buttonPromise.then(() => ({kind: "button"} as ButtonPressed));
	
function callMain(lib: any) {
	const root = document.getElementById('root')!;
	while (root.hasChildNodes()) {
	    root.removeChild(root.lastChild!);
	}
	lib.main();
}
	
Promise.race([buttonPressed, libLoaded]).then(value => {
	switch (value.kind) {
		case "button":
			button.innerHTML = 'Loading...';
			libLoaded.then(l => callMain(l.value));
			break;
		case "lib":
			buttonPressed.then(() => callMain(value.value));
	}
});
