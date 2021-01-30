const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

const hbs = require('hbs')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const publicDirectoryPath = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')

app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

app.use(express.static(publicDirectoryPath))

app.get('', (req, res) => {
    res.render('index')
})

io.on('connection', (socket) => {
    socket.emit('message', 'Welcome!')
    socket.broadcast.emit('message', 'A new user has joined!')

    socket.on('sendMessage', (message, ack) => {
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return ack('Message is profane!')
        }
        io.emit('message', message)
        ack()
    })

    socket.on('disconnect', () => {
        io.emit('message', 'A user has left!')
    })

    socket.on('sendLocation', (latitude, longitude, ack) => {
        io.emit('message', `https://google.com/maps?q=${latitude},${longitude}`)
        ack()
    })
})

module.exports = server