'use strict'

// If student has already logged in then will go to student page
const token = localStorage.getItem('token')
if (token) location.assign('/student')

// Header links Selectors
const homeLink = document.querySelector('#homeLink')
const loginLink = document.querySelector('#loginLink')
const helpLink = document.querySelector('#helpLink')
const MC = document.querySelector('#MC')

// Login div Element
const loginFormDiv = document.createElement('div')
loginFormDiv.className = 'login-form'

// The title at top of student login form
const studentLoginTitle = document.createElement('h3')

// The student number input
const userInput = document.createElement('input')
userInput.className = 'login-input'
userInput.setAttribute('id', 'studentNumber')
userInput.setAttribute('placeHolder', 'شماره دانشجویی')
userInput.setAttribute('required', '')
userInput.setAttribute('autofocus', '')
userInput.setAttribute('autocomplete', 'off')
userInput.setAttribute('type', 'text')

// The student password input
const passInput = document.createElement('input')
passInput.className = 'login-input'
passInput.setAttribute('id', 'studentpass')
passInput.setAttribute('placeHolder', 'رمز')
passInput.setAttribute('type', 'password')
passInput.setAttribute('required', '')

// The button for student login form
const studentLoginButton = document.createElement('button')
studentLoginButton.textContent = 'ورود'

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

// Login function
const studentLoginFunc = async (studentNumber, password) => {
    studentLoginTitle.textContent = 'ورود دانشجو (درحال ورود...)'
    studentLoginButton.disabled = true
    fetch('/api/student/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            studentNumber,
            password
        })
    }).then(errorHandler).then((response) => {
        response.json().then((data) => {
            studentLoginTitle.textContent = `ورود دانشجو (${data.firstName} ${data.lastName} خوش آمدید)`
            localStorage.setItem("token", data.token)
            location.assign('/student')            
            studentLoginButton.disabled = false
        })   
    }).catch((e) =>{
        studentLoginTitle.textContent = 'ورود دانشجو (ورود نا موفق لطفا دوباره تلاش کنید.)'
        studentLoginButton.disabled = false
    })
}

// Student login button event handler
studentLoginButton.addEventListener('click', (e) => {
    if (!userInput.value || !passInput.value) {
        return studentLoginTitle.textContent = 'ورود دانشجو (* اطلاعات نامعبتر)'
    }
    studentLoginFunc(userInput.value, passInput.value)
})

// Home page
homeLink.addEventListener('click', (e) => {
    studentLoginButton.disabled = false
    MC.textContent = ''
    const alerts = [
        'در صورت هر گونه مشکل از طریق صفحه پشتیبانی با ما در ارتباط باشید.',
        'برای حذف ژتون باید از 48 ساعت قبل اقدام کنید.',
        'مبلغ ژتون حذف شده به اعتبار شما اضافه خواهد شد.'
    ]
    const h3 = document.createElement('h3')
    h3.textContent = 'اعلان ها:'
    MC.appendChild(h3)
    alerts.forEach((alert, index) => {
        const p = document.createElement('p')
        p.textContent = `${index + 1}. ${alert}`
        MC.appendChild(p)
    })
})

// Student Login Page
loginLink.addEventListener('click', (e) => {
    studentLoginButton.disabled = false
    MC.textContent = ''
    studentLoginTitle.textContent = ''
    studentLoginTitle.textContent = 'ورود دانشجو'
    MC.appendChild(studentLoginTitle)

    MC.appendChild(userInput)
    MC.appendChild(passInput)
    MC.appendChild(document.createElement('br'))

    MC.appendChild(studentLoginButton)
})

// Help page
helpLink.addEventListener('click', (e) => {
    studentLoginButton.disabled = false
    MC.textContent = ''
    const helps = [
        'تماس با شماره: 09027079997',
        'پشتیبانی واتس اپ'
    ]

    const h3 = document.createElement('h3')
    h3.textContent = 'راه های ارتباطی:'
    MC.appendChild(h3)
    helps.forEach((help, index) => {
        const p = document.createElement('p')
        p.textContent = `${index + 1}. ${help}`
        MC.appendChild(p)
    })
})