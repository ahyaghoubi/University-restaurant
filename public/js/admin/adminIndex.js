'use strict'

// Select the container for admin content and the title for active days
const adminContent = document.querySelector('.adminContent')
const activeDaysTitle = document.querySelector('#activeDaysTitle')

// Initialize an array to store the list of days
let days = []

// Function to delete a day by date
const deleteDay = (date) => {
    fetch('/api/admin/day', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + adminToken
        },
        body: JSON.stringify({ date })
    }).then(errorHandler).then((res) => res.json()).then((data) => {
        getDays() // Refresh the list of days after deletion
    }).catch((e) => {
        console.error(e) // Log any errors to the console
    })
}

// Function to render the list of days
const renderDays = () => {
    adminContent.textContent = '' // Clear the admin content container
    days.listOfDays.forEach((day) => {
        // Create a button to delete the day
        const button = document.createElement('button')
        button.textContent = 'حذف'
        button.addEventListener('click', (e) => {
            deleteDay(day.date) // Delete the day on button click
        })

        // Create a link to view the day's details
        const dayLink = document.createElement('a')
        dayLink.setAttribute('href', `/admin/day#${day.date}`)
        dayLink.textContent = `${day.dow} ${day.day} ${day.month} ${day.year} - غذا: ${day.description} - تعداد سفارشات = ${day.numOfOrder}`

        // Create a div to hold the day link and delete button
        const dayDiv = document.createElement('div')
        dayDiv.appendChild(dayLink)
        dayDiv.appendChild(button)

        // Append the day div to the admin content container
        adminContent.appendChild(dayDiv)
        adminContent.appendChild(document.createElement('br'))
    })
}

// Function to fetch the list of days from the server
const getDays = () => {
    fetch('/api/admin/day', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + adminToken
        }
    }).then(errorHandler).then((res) => res.json()).then((data) => {
        days = data // Store the fetched days
        renderDays() // Render the list of days
    }).catch((e) => {
        console.error(e) // Log any errors to the console
    })
}

// Fetch and render the list of days on page load
getDays()