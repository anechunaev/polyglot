window.addEventListener("DOMContentLoaded", () => {
	const p = document.createElement('p');
	p.textContent = "Client-side code loaded";
	document.body.appendChild(p);

	console.log('Client-side code loaded');
});
