const socket = io()

socket.on('message', (message) => {
    console.log(message)
})


const messageInput = document.querySelector('#message-text')

document.querySelector('#message-form').addEventListener('submit', e => {
    e.preventDefault()
    const message = e.target.elements.message
    socket.emit('sendMessage', message)
    messageInput.textContent = ''
})