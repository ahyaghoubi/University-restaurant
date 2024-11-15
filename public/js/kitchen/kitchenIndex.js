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

// Select the main content container and active days title
const kitchenMainContent = document.querySelector('.kitchenMainContent')
const activeDaysTitle = document.querySelector('#activeDaysTitle')

// Initialize an array to store days
let days = []

// Function to render days
const renderDays = () => {
    if (!days.length) {
        // Clear the main content and display a message if no days are available
        kitchenMainContent.textContent = ''
        const emptyDayMessage = document.createElement('p')
        emptyDayMessage.textContent = 'روز فعالی موجود نیست'
        kitchenMainContent.appendChild(emptyDayMessage)
    } else {
        // Clear the main content and display each day's information
        kitchenMainContent.textContent = ''
        days.forEach((day) => {
            const dayDescription = document.createElement('p')
            dayDescription.textContent = `${day.dow} ${day.day} ${day.month} ${day.year} - غذا: ${day.description} - تعداد سفارشات: ${day.numOfOrder} - ظرفیت: ${day.capacity} نفر`
            kitchenMainContent.appendChild(dayDescription)
        })
    }
}

// Function to fetch days from the server
const getDays = () => {
    fetch('/api/kitchen/day', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + kitchenToken
        }
    }).then(errorHandler).then((res) => res.json()).then((data) => {
        // Store the fetched days and render them
        days = data.listOfDays
        renderDays()
    }).catch((e) => {
        // Handle any errors (optional: you can add error handling here)
    })
}

// Fetch days on page load
getDays()