'use strict'

// Select the main content area for student orders
const studentMainContent = document.querySelector('.studentMainContent')

// Select the title element for active days
const activeDaysTitle = document.querySelector('#activeDaysTitle')

// Initialize an empty array to store orders
let orders = []

// Function to delete an order by date
const deleteOrder = (date) => {
    activeDaysTitle.textContent = 'ژتون های فعال شما'
    fetch('/api/student/orders', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ date })
    }).then(errorHandler).then((res) => res.json()).then((data) => {
        getOrders()
        renderStudentMessage()
        activeDaysTitle.textContent = 'ژتون های فعال شما (حذف موفق)'
    }).catch((e) => {
        errorMessage(2, activeDaysTitle)
    })
}

// Function to generate the DOM structure for a single order
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

// Function to render all orders in the main content area
const renderOrders = () => {
    if (!orders.length) {
        studentMainContent.textContent = ''
        const emptyOrderMessage = document.createElement('p')
        emptyOrderMessage.textContent = 'ژتون فعالی موجود نیست'

        studentMainContent.appendChild(emptyOrderMessage)
    } else {
        studentMainContent.textContent = ''
        orders.forEach((order) => {
            const oneOrderDiv = generateOrderDOM(order)
            studentMainContent.appendChild(oneOrderDiv)
            studentMainContent.appendChild(document.createElement('br'))
        })
    }
}

// Function to fetch orders from the server
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

// Fetch and render orders on page load
getOrders()