const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    socket.emit('message', generateMessage('Welcome!'))
    socket.broadcast.emit('message', generateMessage('A new user has joined!'))

    socket.on('sendMessage', (message, ack) => {
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return ack('Message is profane!')
        }
        io.emit('message', generateMessage(message))
        ack()
    })

    socket.on('disconnect', () => {
        io.emit('message', generateMessage('A user has left!'))
    })

    socket.on('sendLocation', (latitude, longitude, ack) => {
        io.emit('locationMessage', generateLocationMessage(latitude, longitude))
        ack()
    })
})

module.exports = server