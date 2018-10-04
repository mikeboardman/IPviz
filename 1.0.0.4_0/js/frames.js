var buffers = [];

self.addEventListener('message', function(e) {
	// console.log('start: ', buffers);
	var frames = e.data;
	buffers.push(frames);
	// console.log('end: ', buffers);

	postMessage(buffers);
}, false);