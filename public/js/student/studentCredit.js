'use strict'

// Select the input field, raise button, and credit title elements
const input = document.querySelector('.login-input')
const raiseButton = document.querySelector('#raiseButton')
const creditTitle = document.querySelector('#creditTitle')

// Event listener for the raise button click event
raiseButton.addEventListener('click', () => {
    raiseButton.disabled = true // Disable the button to prevent multiple clicks
    creditTitle.textContent = 'خرید اعتبار (در حال انجام ...)' // Update the credit title text

    // Send a POST request to raise the student's credit
    fetch('/api/student/raisecredit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token // Include the authorization token
        },
        body: JSON.stringify({
            amount: Number(input.value) // Convert the input value to a number
        })
    })
    .then(errorHandler) // Handle any errors from the response
    .then((res) => res.json()) // Parse the response as JSON
    .then((data) => {
        creditTitle.textContent = 'خرید اعتبار (اعتبار با موفقیت اضافه شد)' // Update the credit title text on success
        renderStudentMessage() // Render the updated student message
        raiseButton.disabled = false // Re-enable the button
    })
    .catch((e) => {
        creditTitle.textContent = 'خرید اعتبار' // Reset the credit title text on error
        errorMessage(2, creditTitle) // Display an error message
        raiseButton.disabled = false // Re-enable the button
    })
})