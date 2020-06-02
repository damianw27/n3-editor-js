config = {
	// hostname: '127.0.0.1',
	hostname: 'ppr.cs.dal.ca',
	port: 3002,

	eyePath: "/opt/eye/bin/eye.sh",
	cwmPath: "/home/woensel/cwm-1.2.1/swap/cwm.py"
}


var express = require('express')
var bodyParser = require('body-parser')
var cors = require('cors')

var tmp = require('./lib/tmp.js')
var eye = require('./lib/eye.js')
var cwm = require('./lib/cwm.js')

var app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/serve-reason/editor', express.static('editor'));

app.get('/serve-reason', (request, response) => {
	console.log('GET /')

	var html = 
	`<html>
		<body>
			<h1>Welcome to Serve-Reason!</h1>
			<h3>Serving reason since 1st June 2020</h3>
		</body>
	</html>`

	response.writeHead(200, {'Content-Type': 'text/html'})
	response.end(html)
})

app.post('/serve-reason', (request, response) => {
	console.log("POST /")	

	var data = request.body
	console.log("data:", data)

	tmp.save(data.formula, (file) => {
		function end(ret) {
			tmp.del(file)
			response.send(ret)
		}
		
		switch (data.system) {
			case "eye":
				eye.exec(file, end)
			break
			
			case "cwm":
				cwm.exec(file, end)
			break
			
			default:
				end({ error: `unknown system: "${data.system}"` })
			break
		}
	})
})

app.listen(config.port)
console.log(`Listening at http://${config.hostname}:${config.port}`)
