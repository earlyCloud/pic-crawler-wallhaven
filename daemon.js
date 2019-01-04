const { spawn } = require('child_process')
function daemon(mainModule){
	let crawler = spawn('node', mainModule)
	crawler.on('exit', code => {
		if(code !== 0){
			daemon(mainModule)
		}else{
			console.log('a graceful exit')
		}
	})
	crawler.stdout.on('data', data => {
		console.log(data.toString())
	})
}
daemon(['crawler.js'].concat(process.argv.slice(2)))