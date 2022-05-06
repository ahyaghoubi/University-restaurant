'use strict'

// If kitchen has already logged in then will go to kitcehn page
const kitchenToken = localStorage.getItem('kitchenToken')
if (kitchenToken) location.assign('/kitchen')

const errorMessage = (code, messageContainer) => {
    if (code === 1) messageContainer.textContent = messageContainer.textContent.replace(' (عملیات ناموفق لطفا دوباره تلاش کنید)', '')
    if (code === 2) messageContainer.textContent = messageContainer.textContent + ' (عملیات ناموفق لطفا دوباره تلاش کنید)'
}

const errorHandler = (res) => {
    if (res.status === 400) throw new Error('(عملیات ناموفق لطفا دوباره تلاش کنید)')
    else if (res.status === 401 || res.status === 403) {
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

// The title at top of kitchen login form
const kitchenLoginTitle = document.querySelector('#kitchenLoginTitle')

// The kitchen number input
const kitchenUserInput = document.querySelector('#kitchenUser')

// The kitchn password input
const passInput = document.querySelector('#kitchenPass')

// The button for kitchen login form
const kitchenLoginButton = document.querySelector('#kitchenLoginButton')

// Login function
const kitchenLoginFunc = async (username, password) => {
    kitchenLoginTitle.textContent = 'ورود سلف (درحال ورود...)'
    kitchenLoginButton.disabled = true
    fetch('/api/kitchen/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            password
        })
    }).then(errorHandler).then((response) => {
        response.json().then((data) => {
            kitchenLoginTitle.textContent = `ورود سلف (ورود موفق)`
            localStorage.setItem("kitchenToken", data.token)
            location.assign('/kitchen')
            kitchenLoginButton.disabled = false
        })
        
    }).catch(() =>{
        kitchenLoginTitle.textContent = 'ورود سلف (ورود نا موفق لطفا دوباره تلاش کنید.)'
        kitchenLoginButton.disabled = false
    })

}

// kitchen login button event handler
kitchenLoginButton.addEventListener('click', (e) => {
    if (!kitchenUserInput.value || !passInput.value) {
        return kitchenLoginTitle.textContent = 'ورود سلف (* اطلاعات نامعبتر)'
    }
    kitchenLoginFunc(kitchenUserInput.value, passInput.value)
})