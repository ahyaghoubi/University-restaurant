'use strict'

const adminContent = document.querySelector('.adminContent')
const activeDaysTitle = document.querySelector('#activeDaysTitle')

let days = []

const deleteDay = (date) => {
    fetch('/api/admin/day', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + adminToken
        },
        body: JSON.stringify({date})
    }).then(errorHandler).then((res) => res.json()).then((data) => {
        getDays()
    }).catch((e) => {
        
    })
}

const renderDays = () => {
    adminContent.textContent = ''
    days.listOfDays.forEach((day) => {
        const button = document.createElement('button')
        button.textContent = 'حذف'
        button.addEventListener('click', (e) => {
            deleteDay(day.date)
            getDays()
        })

        const dayLink = document.createElement('a')
        dayLink.setAttribute('href', `/admin/day#${day.date}`)
        dayLink.textContent = `${day.dow} ${day.day} ${day.month} ${day.year} - غذا: ${day.description} - تعداد سفارشات = ${day.numOfOrder}`

        const dayDiv = document.createElement('div')
        dayDiv.appendChild(dayLink)
        dayDiv.appendChild(button)

        adminContent.appendChild(dayDiv)
        adminContent.appendChild(document.createElement('br'))
    })
}

const getDays = () => {
    fetch('/api/admin/day', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + adminToken
        }
    }).then(errorHandler).then((res) => res.json()).then((data) => {
        days = data
        renderDays()
    })
}

getDays()