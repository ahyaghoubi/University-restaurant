'use strict'

// If admin has already logged in then will go to kitcehn page
const adminToken = localStorage.getItem('adminToken')
if (adminToken) location.assign('/admin')

// The title at top of admin login form
const adminLoginTitle = document.querySelector('#adminLoginTitle')

// The admin number input
const adminUserInput = document.querySelector('#adminUser')

// The kitchn password input
const passInput = document.querySelector('#adminPass')

// The button for admin login form
const adminLoginButton = document.querySelector('#adminLoginButton')

// Error Handler
const errorHandler = (res) => {
    if (res.status === 200) return res
    else throw new Error()
}

// Login function
const adminLoginFunc = async (username, password) => {
    adminLoginTitle.textContent = 'ورود  (درحال ورود...)'
    adminLoginButton.disabled = true
    fetch('/api/admin/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            password
        })
    }).then(errorHandler).then((res) => res.json()).then((data) => {
        adminLoginTitle.textContent = `ورود  (ورود موفق)`
        localStorage.setItem("adminToken", data.token)
        location.assign('/admin')
    }).catch((e) =>{
        adminLoginTitle.textContent = 'ورود  (ورود نا موفق لطفا دوباره تلاش کنید.)'
        adminLoginButton.disabled = false
    })

}

// admin login button event handler
adminLoginButton.addEventListener('click', (e) => {
    if (!adminUserInput.value || !passInput.value) {
        return adminLoginTitle.textContent = 'ورود  (* اطلاعات نامعبتر)'
    }
    adminLoginFunc(adminUserInput.value, passInput.value)
})