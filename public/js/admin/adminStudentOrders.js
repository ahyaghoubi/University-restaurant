'use strict'

// Select the title, input field, and button for checking student orders
const checkStudentTilte = document.querySelector('#checkStudentTilte')
const studentNumberToCheck = document.querySelector('#studentNumberToCheck')
const checkButton = document.querySelector('#checkButton')
const studentOrdersContainer = document.querySelector('.studentOrdersContainer')

// Initialize objects to store student information and orders
let student = {}
let studentOrders = []

// Function to handle error messages
const errorMessage = (code, messageContainer) => {
    if (code === 1) {
        // Remove error message if present
        messageContainer.textContent = messageContainer.textContent.replace(' (عملیات ناموفق لطفا دوباره تلاش کنید)', '')
    }
    if (code === 2) {
        // Append error message
        messageContainer.textContent = messageContainer.textContent + ' (عملیات ناموفق لطفا دوباره تلاش کنید)'
    }
}

// Error handler function to handle different response statuses
const errorHandler = (res) => {
    if (res.status === 400) throw new Error('عملیات ناموفق لطفا دوباره تلاش کنید')
    else if (res.status === 401 || res.status === 403) {
        // Remove tokens and redirect to the home page on unauthorized access
        localStorage.removeItem('token')
        localStorage.removeItem('adminToken')
        localStorage.removeItem('kitchenToken')
        location.assign('/')
        throw new Error('دسترسی نامعتبر')
    }
    else if (res.status === 404) throw new Error('پیدا نشد')
    else if (res.status === 500) throw new Error('مشکلی بوجود آمد لطفا بعدا تلاش کنید')
    else if (!res.ok) throw new Error(res.statusText)
    else return res
}

// Function to fetch student orders from the server
const getOrders = (SN) => {
    errorMessage(1, checkStudentTilte)
    checkButton.disabled = true // Disable the button to prevent multiple clicks
    fetch('/api/admin/studentorders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + adminToken
        },
        body: JSON.stringify({ studentNumber: SN })
    }).then(errorHandler).then((res) => res.json()).then((data) => {
        // Store student information and orders
        student = data.student
        studentOrders = data.studentOrders
        renderEverything() // Render the student information and orders
        checkButton.disabled = false // Re-enable the button
    }).catch((e) =>{
        errorMessage(2, checkStudentTilte) // Display an error message
        checkButton.disabled = false // Re-enable the button on error
    })
}

// Function to delete a student order
const deleteOrder = (date) => {
    errorMessage(1, checkStudentTilte)
    fetch('/api/admin/studentorders', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + adminToken
        },
        body: JSON.stringify({ student, date })
    }).then(errorHandler).then((res) => res.json()).then((data) => {
        getOrders(student.studentNumber) // Refresh the orders after deletion
        checkStudentTilte.textContent = 'پیگیری ژتون های دانشجو (حذف موفق)'
    }).catch((e) => {
        errorMessage(2, checkStudentTilte) // Display an error message
    })
}

// Function to render student information and orders
const renderEverything = () => {
    studentOrdersContainer.textContent = ''
    const studentMessage = document.createElement('h4')
    studentMessage.textContent = `نام و نام خانوادگی: ${student.firstName} ${student.lastName} | شماره دانشجویی: ${student.studentNumber}`
    studentOrdersContainer.appendChild(studentMessage)
    studentOrders.forEach((order) => {
        const orderDiv = document.createElement('div')
        const button = document.createElement('button')
        button.textContent = 'حذف'
        button.addEventListener('click', (e) => {
            deleteOrder(order.date)
        })

        const orderMessage = document.createElement('p')
        orderMessage.textContent = `${order.dow} ${order.day} ${order.month} ${order.year} - غذا: ${order.description}`

        orderDiv.appendChild(button)
        orderDiv.appendChild(orderMessage)
        studentOrdersContainer.appendChild(orderDiv)
    })
}

// Event listener for the check button click event
checkButton.addEventListener('click', (e) => {
    errorMessage(1, checkStudentTilte)
    if (studentNumberToCheck.value) {
        getOrders(studentNumberToCheck.value)
    }
})