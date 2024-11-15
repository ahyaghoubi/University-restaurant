'use strict'

// Select the title element for changing password
const changePassTitle = document.querySelector('#changePassTitle')

// Select the input elements for current password, new password, and repeat new password
const currentPass = document.querySelector('#currentPass')
const newPass = document.querySelector('#newPass')
const repeatNewPass = document.querySelector('#repeatNewPass')

// Select the button element for changing password
const changeButton = document.querySelector('#changeButton')

// Event listener for the change password button click event
changeButton.addEventListener('click', (e) => {
    // Disable the button to prevent multiple submissions
    changeButton.disabled = true
    // Update the title to indicate the process is ongoing
    changePassTitle.textContent = 'تغییر رمز (در حال انجام...)'
    fetch('/api/admin', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + adminToken
        },
        body: JSON.stringify({
            currentPass: currentPass.value,
            newPass: newPass.value,
            repeatNewPass: repeatNewPass.value
        })
    }).then(errorHandler).then((res) => res.json()).then((data) => {
        // Update the title to indicate the password change was successful
        changePassTitle.textContent = 'تغییر رمز (رمز با موفقیت تغییر یافت)'
        // Re-enable the button
        changeButton.disabled = false
    }).catch((e) => {
        // Re-enable the button in case of an error
        changeButton.disabled = false
        // Display an error message
        errorMessage(2, changePassTitle)
    })
})