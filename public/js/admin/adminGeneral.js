'use strict'

// Retrieve the admin token from local storage
const adminToken = localStorage.getItem('adminToken')

// Redirect to login page if admin token is not found
if (!adminToken) location.assign('/admin/login')

// Select the logout button element
const logoutButton = document.querySelector('#logoutButton')

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

// Event listener for the logout button click event
logoutButton.addEventListener('click', () => {
    // Send a POST request to log out the admin
    fetch('/api/admin/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + adminToken
        }
    }).then(errorHandler).then(() => {
        // Remove admin token and redirect to the home page on successful logout
        localStorage.removeItem('adminToken')
        location.assign('/')
    }).catch((e) => {
        // Remove admin token and redirect to the home page on error
        localStorage.removeItem('adminToken')
        location.assign('/')
        console.log(e)
    })
})