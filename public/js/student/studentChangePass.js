'use strict'

// Select the title and input fields for changing password
const changePassTitle = document.querySelector('#changePassTitle')
const currentPass = document.querySelector('#currentPass')
const newPass = document.querySelector('#newPass')
const repeatNewPass = document.querySelector('#repeatNewPass')

// Select the change password button
const changeButton = document.querySelector('#changeButton')

// Event listener for the change password button click event
changeButton.addEventListener('click', (e) => {
    changeButton.disabled = true // Disable the button to prevent multiple clicks
    changePassTitle.textContent = 'تغییر رمز (در حال انجام...)' // Update the title text

    // Send a PATCH request to change the student's password
    fetch('/api/student', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token // Include the authorization token
        },
        body: JSON.stringify({
            currentPass: currentPass.value, // Current password
            newPass: newPass.value, // New password
            repeatNewPass: repeatNewPass.value // Repeat new password
        })
    })
    .then(errorHandler) // Handle any errors from the response
    .then((res) => res.json()) // Parse the response as JSON
    .then((data) => {
        changePassTitle.textContent = 'تغییر رمز (رمز با موفقیت تغییر یافت)' // Update the title text on success
        changeButton.disabled = false // Re-enable the button
    })
    .catch((e) => {
        errorMessage(2, changePassTitle) // Display an error message
        changeButton.disabled = false // Re-enable the button
    })
})