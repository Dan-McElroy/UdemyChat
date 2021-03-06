const socket = io()

const $locationButton = document.querySelector('#send-location')
const $messageForm = document.querySelector('#message-form')
const $messageInput = document.querySelector('#message-form > input')
const $messageButton = document.querySelector('#message-form > button')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild

    const { marginBottom: marginBottomPx } = getComputedStyle($newMessage)
    const newMessageHeight = $newMessage.offsetHeight + parseInt(marginBottomPx)

    const visibleHeight = $messages.offsetHeight
    const contentHeight = $messages.scrollHeight
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (contentHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', ({ username, text, createdAt }) => {
    const html = Mustache.render(messageTemplate, {
        username,
        message: text,
        createdAt: formatTime(createdAt)
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', ({ username, url, createdAt }) => {
    const html = Mustache.render(locationMessageTemplate, {
        url,
        username,
        createdAt: formatTime(createdAt)
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    $sidebar.innerHTML = Mustache.render(sidebarTemplate, { room, users })
})

$messageForm.addEventListener('submit', e => {
    e.preventDefault()

    disableElement($messageButton)

    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, (error) => {
        enableElement($messageButton)

        $messageInput.value = ''
        $messageInput.focus()
        if (error) {
            return console.log(error)
        }
        console.log(`Message delivered`)
    })
})

$locationButton.addEventListener('click', () => {
    disableElement($locationButton)

    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }
    navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords
        socket.emit('sendLocation', latitude, longitude, (error) => {
            enableElement($locationButton)
            if (error) {
                return console.log(error)
            }
            console.log('Location shared!')
        })

    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})