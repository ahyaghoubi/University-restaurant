'use strict'

// Select the container for available days, total price message, pay button, pay with credit button, and title for days to buy
const availableDaysContainer = document.querySelector('.availableDaysContainer')
const totalPriceMessage = document.querySelector('#totalPrice')
const payButton = document.querySelector('#pay')
const payWithCreditButton = document.querySelector('#payWithCredit')
const dayToBuyTitle = document.querySelector('#dayToBuyTitle')

// Initialize arrays to store orders, days, and cart items, and a variable for total price
let orders = []
let days = []
let cart = []
let total = 0

// Function to generate the total price message
const generateTotalPriceMessage = () => {
    total = 0
    cart.forEach((item) => {
        total += item.price
    })
    totalPriceMessage.textContent = `جمع مبلغ: ${total} تومان`
}

// Function to generate the DOM structure for an available day
const generateAvailableDayDOM = (day) => {
    const AvailableDay = document.createElement('div')
    AvailableDay.className = 'AvailableDay'

    const label = document.createElement('label')
    label.className = 'checkboxLabel'
    const checkbox = document.createElement('input')
    checkbox.setAttribute('type', 'checkbox')

    // Event listener for checkbox change event
    checkbox.addEventListener('change', (e) => {
        if(e.target.checked) {
            cart.push(day)
            generateTotalPriceMessage()
        } else {
            const index = cart.findIndex((item) => item.date === day.date)
            cart.splice(index, 1)
            generateTotalPriceMessage()
        }
    })

    const dayDes = document.createElement('p')
    dayDes.textContent = `${day.dow} ${day.day} ${day.month} ${day.year} - غذا: ${day.description} - مبلغ ${day.price}`
    label.appendChild(checkbox)
    label.appendChild(dayDes)

    AvailableDay.appendChild(label)
    return AvailableDay
}

// Function to filter out days that have already been ordered
const filterDaysFunc = (rawDays) => {
    let filteredDays = rawDays
    orders.forEach((order) => {
        const index = rawDays.findIndex((day) => day.date === order.date)
        filteredDays.splice(index, 1)
    })
    return filteredDays
}

// Function to render available days
const renderDays = (rawDays) => {
    const filteredDays = filterDaysFunc(rawDays)
    availableDaysContainer.textContent = ''
    if (filteredDays.length === 0) {
        const emptyMessage = document.createElement('p')
        emptyMessage.textContent = 'ژتون فعالی برای خرید وجود ندارد'
        availableDaysContainer.appendChild(emptyMessage)
    } else {
        filteredDays.forEach((day) => {
            const dayDOM = generateAvailableDayDOM(day)
            availableDaysContainer.appendChild(dayDOM)
        })
    }
}

// Function to fetch available days and orders from the server
const getAvailableDays = () => {
    errorMessage(1, dayToBuyTitle)
    fetch('/api/student/getdays', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    }).then(errorHandler).then((res) => res.json()).then((data) => {
        days = data
        errorMessage(1, dayToBuyTitle)
        fetch('/api/student/orders', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }).then(errorHandler).then((res) => res.json()).then((data) => {
            orders = data
            renderDays(days)
        }).catch((e) => {
            errorMessage(2, dayToBuyTitle)
        })
    }).catch((e) => {
        errorMessage(2, dayToBuyTitle)
    })
}

// Fetch available days on page load
getAvailableDays()

// Event listener for pay button click event
payButton.addEventListener('click', async (e) => {
    if (total > 0) {
        errorMessage(1, dayToBuyTitle)
        payButton.disabled = true
        fetch('/api/student/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ listoforders: cart })
        }).then(errorHandler).then((res) => res.json()).then((data) => {
            if(data.error) {
                localStorage.removeItem('token')
                location.assign('/')
            }
            getAvailableDays()
            cart = []
            generateTotalPriceMessage()
            payButton.disabled = false
            dayToBuyTitle.textContent = 'ژتون های فعال برای خرید (خرید موفق)'
        }).catch((e) => {
            payButton.disabled = false
            errorMessage(2, dayToBuyTitle)
        })
    }
})

// Event listener for pay with credit button click event
payWithCreditButton.addEventListener('click', (e) => {
    if (total > 0) {
        errorMessage(1, dayToBuyTitle)
        payWithCreditButton.disabled = true
        fetch('/api/student', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }).then(errorHandler).then((res) => res.json()).then((data) => {
            cart.forEach((item) => {
                item.paidwithcredit = true
            })
            if (data.error === 'Please authenticate.') {
                localStorage.removeItem('token')
                location.assign('/')
            } else if (total <= data.credit) {
                fetch('/api/student/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({ listoforders: cart })
                }).then(errorHandler).then((res) => res.json()).then((data) => {
                    if(data.error) {
                        localStorage.removeItem('token')
                        location.assign('/')
                    }
                    getAvailableDays()
                    cart = []
                    renderStudentMessage()
                    generateTotalPriceMessage()

                    dayToBuyTitle.textContent = 'ژتون های فعال برای خرید (خرید موفق)'
                }).catch((e) => {
                    errorMessage(2, dayToBuyTitle)
                })
            }
        }).catch((e) => {
            errorMessage(2, dayToBuyTitle)
        }).then(() => payWithCreditButton.disabled = false)
    }
})