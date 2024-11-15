'use strict'

// Retrieve the kitchen token from local storage
const kitchenToken = localStorage.getItem('kitchenToken')
// If no kitchen token is found, redirect to the kitchen login page
if (!kitchenToken) location.assign('/kitchen/login')

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

// Select the kitchen logout button
const kitchenLogout = document.querySelector('#kitchenLogout')
// Event listener for the kitchen logout button click event
kitchenLogout.addEventListener('click', (e) => {
    // Send a POST request to logout the kitchen
    fetch('/api/kitchen/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + kitchenToken
        }
    }).then(errorHandler).then(() => {
        // Remove the kitchen token and redirect to the home page
        localStorage.removeItem('kitchenToken')
        location.assign('/')
    }).catch((e) => {
        // Handle any errors (optional: you can add error handling here)
    })
})

// Select the input field for student number, check button, student orders container, and days title
const studentNumberToCheck = document.querySelector('#studentNumberToCheck')
const checkButton = document.querySelector('#checkButton')
const studentOrdersContainer = document.querySelector('.studentOrdersContainer')
const DaysTitle = document.querySelector('#DaysTitle')

// Initialize objects to store student information and orders
let student = {}
let studentOrders = []

// Function to render student information and orders
const renderEverything = () => {
    studentOrdersContainer.textContent = ''
    const studentMessage = document.createElement('h4')
    studentMessage.textContent = `نام و نام خانوادگی: ${student.firstName} ${student.lastName} | شماره دانشجویی: ${student.studentNumber}`
    studentOrdersContainer.appendChild(studentMessage)
    studentOrders.forEach((order) => {
        const orderMessage = document.createElement('p')
        orderMessage.textContent = `${order.dow} ${order.day} ${order.month} ${order.year} - غذا: ${order.description}`
        studentOrdersContainer.appendChild(orderMessage)
    })
}

// Event listener for the check button click event
checkButton.addEventListener('click', (e) => {
    errorMessage(1, DaysTitle)
    if (studentNumberToCheck.value) {
        checkButton.disabled = true // Disable the button to prevent multiple clicks
        // Send a POST request to get student orders
        fetch('/api/kitchen/studentorders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + kitchenToken
            },
            body: JSON.stringify({ studentNumber: studentNumberToCheck.value })
        }).then(errorHandler).then((res) => res.json()).then((data) => {
            // Store student information and orders
            student = data.student
            studentOrders = data.studentOrders
            renderEverything() // Render the student information and orders
            checkButton.disabled = false // Re-enable the button
        }).catch((e) =>{
            checkButton.disabled = false // Re-enable the button on error
            errorMessage(2, DaysTitle) // Display an error message
        })
    }
})