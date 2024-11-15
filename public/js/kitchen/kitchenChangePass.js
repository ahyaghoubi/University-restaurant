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
    if (res.status === 400) throw new Error('(عملیات ناموفق لطفا دوباره تلاش کنید)')
    else if (res.status === 401 || res.status === 403) {
        // Remove tokens and redirect to the home page on unauthorized access
        localStorage.removeItem('token')
        localStorage.removeItem('adminToken')
        localStorage.removeItem('kitchenToken')
        location.assign('/')
        throw new Error('دسترسی نامعتبر')
    }
    else if (res.status === 404) throw new Error('پیدا نشد')
    else if (res.status === 500) throw new Error('(مشکلی بوجود آمد لطفا بعدا تلاش کنید)')
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

// Select the title and input fields for changing the password
const changePassTitle = document.querySelector('#changePassTitle')
const currentPass = document.querySelector('#currentPass')
const newPass = document.querySelector('#newPass')
const repeatNewPass = document.querySelector('#repeatNewPass')

// Select the change password button
const changeButton = document.querySelector('#changeButton')

// Event listener for the change password button click event
changeButton.addEventListener('click', (e) => {
    // Disable the button to prevent multiple clicks
    changeButton.disabled = true
    changePassTitle.textContent = 'تغییر رمز (در حال انجام...)'
    // Send a PATCH request to change the password
    fetch('/api/kitchen', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + kitchenToken
        },
        body: JSON.stringify({
            currentPass: currentPass.value,
            newPass: newPass.value,
            repeatNewPass: repeatNewPass.value
        })
    }).then(errorHandler).then((res) => res.json()).then((data) => {
        // Update the title and re-enable the button on success
        changePassTitle.textContent = 'تغییر رمز (رمز با موفقیت تغییر یافت)'
        changeButton.disabled = false
    }).catch((e) => {
        // Update the title and re-enable the button on error
        changePassTitle.textContent = 'تغییر رمز'
        errorMessage(2, changePassTitle)
        changeButton.disabled = false
    })
})