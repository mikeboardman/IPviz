chrome.app.runtime.onLaunched.addListener(function() {
	chrome.app.window.create("main.html", {
		frame: "none",
		id: "mainwin",
		outerBounds: {
			width: 1280,
			height: 720,
			minWidth: 856,
			minHeight: 642
		}
	});
});