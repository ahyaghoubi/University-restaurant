'use strict'

const availableDaysContainer = document.querySelector('.availableDaysContainer')
const totalPriceMessage = document.querySelector('#totalPrice')
const payButton = document.querySelector('#pay')
const payWithCreditButton = document.querySelector('#payWithCredit')
const dayToBuyTitle = document.querySelector('#dayToBuyTitle')
let orders = []
let days = []
let cart = []
let total = 0

const generateTotalPriceMessage = () => {
    total = 0
    cart.forEach((item) => {
        total += item.price
    })
    totalPriceMessage.textContent = `جمع مبلغ: ${total} تومان`
}

const generateAvailableDayDOM = (day) => {
    const AvailableDay = document.createElement('div')
    AvailableDay.className = 'AvailableDay'

    const lable = document.createElement('label')
    lable.className = 'checkboxLable'
    const checkbox = document.createElement('input')
    checkbox.setAttribute('type', 'checkbox')

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
    lable.appendChild(checkbox)
    lable.appendChild(dayDes)

    return lable
}

const filterDaysFunc = (rawDays) => {
    let filteredDays = rawDays
    orders.forEach((order) => {
        const index = rawDays.findIndex((day) => day.date === order.date)
        filteredDays.splice(index, 1)
    })
    return filteredDays
}

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

getAvailableDays()

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