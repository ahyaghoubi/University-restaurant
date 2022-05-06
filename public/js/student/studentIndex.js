'use strict'

const studnentMainContent = document.querySelector('.studnentMainContent')
const activeDaysTitle = document.querySelector('#activeDaysTitle')
let orders = []

const deleteOrder = (date) => {
    activeDaysTitle.textContent = 'ژتون های فعال شما'
    fetch('/api/student/orders', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({date})
    }).then(errorHandler).then((res) => res.json()).then((data) => {
        getOrders()
        renderStudentMessage()
        activeDaysTitle.textContent = 'ژتون های فعال شما (حذف موفق)'
    }).catch((e) => {
        errorMessage(2, activeDaysTitle)
    })
}

const generateOrderDOM = (order) => {
    const oneOrderDiv = document.createElement('div')
    oneOrderDiv.className = 'oneActiveOrder'

    const button = document.createElement('button')
    button.textContent = 'حذف'
    button.addEventListener('click', (e) => {
        deleteOrder(order.date)
    })

    const orderDescription = document.createElement('p')
    orderDescription.textContent = `${order.dow} ${order.day} ${order.month} ${order.year} - غذا: ${order.description}`

    oneOrderDiv.appendChild(button)
    oneOrderDiv.appendChild(orderDescription)

    return oneOrderDiv
}

const renderOrders = () => {
    if(!orders.length) {
        studnentMainContent.textContent = ''
        const emptyOrderMessage = document.createElement('p')
        emptyOrderMessage.textContent = 'ژتون فعالی موجود نیست'

        studnentMainContent.appendChild(emptyOrderMessage)
    } else {
        studnentMainContent.textContent = ''
        orders.forEach((order) => {
            const oneOrderDiv = generateOrderDOM(order)
            studnentMainContent.appendChild(oneOrderDiv)
            studnentMainContent.appendChild(document.createElement('br'))
        })
    }
}

const getOrders = () => {
    errorMessage(1, activeDaysTitle)
    fetch('/api/student/orders', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    }).then(errorHandler).then((res) => res.json()).then((data) => {
        orders = data
        renderOrders()
    }).catch((e) => {
        errorMessage(2, activeDaysTitle)
    })
}

getOrders()