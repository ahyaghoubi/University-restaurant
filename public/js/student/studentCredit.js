const input = document.querySelector('.login-input')
const raiseButton = document.querySelector('#raiseButton')
const creditTitle = document.querySelector('#creditTitle')

raiseButton.addEventListener('click', () => {
    raiseButton.disabled = true
    creditTitle.textContent = 'خرید اعتبار (در حال انجام ...)'
    fetch('/api/student/raisecredit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
            amount: Number(input.value)
        })
    }).then(errorHandler).then((res) => res.json()).then((data) => {
        creditTitle.textContent = 'خرید اعتبار (اعتبار با موفقیت اضافه شد)'
        renderStudentMessage()
        raiseButton.disabled = false
    }).catch((e) => {
        creditTitle.textContent = 'خرید اعتبار'
        errorMessage(2, creditTitle)
        raiseButton.disabled = false
    })
})