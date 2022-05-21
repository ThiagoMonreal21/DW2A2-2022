const Modal = {
    Open(){
        document.querySelector('.modal-overlay')
        .classList.add('active')
    },
    Close(){
        document.querySelector('.modal-overlay')
        .classList.remove('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem('transactions')) || []
    },
    set(transactions) {
        localStorage.setItem('transactions', JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)
        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)
        App.reload()
    },

    totals() {
        var sum = { income: 0, expense: 0, total: 0 }

        Transaction.all.forEach(transaction => {
            if (transaction.amount < 0)
                sum.expense += transaction.amount
            else
                sum.income += transaction.amount
        })
        sum.total = sum.income + sum.expense
        return sum
    }
}

const htmlDocument = {
    tableObject: document.querySelector('#data-table tbody'),

    totalCard: document.getElementById('total-card'),

    expenseCard: document.getElementById('expense-card'),

    incomeCard: document.getElementById('income-card'),

    addTableRow(transaction, index) {
        const tr = document.createElement('tr')

        tr.innerHTML = htmlDocument.addTableRowData(transaction, index)
        tr.dataset.index = index

        htmlDocument.tableObject.appendChild(tr)
    },

    addTableRowData(transaction, index) {
        const cssClass = transaction.amount < 0 ? 'expense' : 'income'
        const amount = Utils.formatCurrencyBy100(transaction.amount)
        const rowData = `
        <td class="description">${transaction.description}</td>
        <td class="${cssClass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td><img onclick="Transaction.remove(${index});" src="./assets/minus.svg" alt="Remover transação"></td>
        `
        return rowData
    },

    clearTable() {
        this.tableObject.innerHTML = ''
    },

    updateBalance() {
        const sum = Transaction.totals();

        htmlDocument.incomeCard.innerText = Utils.formatCurrencyBy100(sum.income)
        htmlDocument.expenseCard.innerText = Utils.formatCurrencyBy100(sum.expense)
        htmlDocument.totalCard.innerText = Utils.formatCurrencyBy100(sum.total)
    }
}

const Utils = {
    formatAmount(value) {
        let sign = 1

        if (value.match(/\-/g)) {
            sign = -1
        }

        value = value.replaceAll(/\D+/g, '')


        return Number(value) * sign
    },
    formatDate(value) {
        var splited = value.split('-')
        return `${splited[2]}/${splited[1]}/${splited[0]}`
    },
    formatCurrencyBy100(value) {
        const sign = Number(value) < 0 ? '-' : '';

        value = Math.abs(Number(value)) / 100

        return sign + value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        })
    },
    formatCurrency(value) {
        const sign = Number(value) < 0 ? '-' : '';

        value = Math.abs(Number(value))

        return sign + value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        })
    }
}

const Form = {
    description: document.querySelector('input#description'),

    amount: document.querySelector('input#amount'),

    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    format() {
        let { description, amount, date } = this.getValues()
        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return { description, amount, date }
    },

    save(transaction) {
        Transaction.add(transaction)
    },

    clear() {
        Form.description.value = ''
        Form.amount.value = ''
        Form.date.value = ''
    },

    validate() {
        const { description, amount, date } = this.getValues()

        if (description.trim() === '' || amount.trim() === '' || date.trim() === '') {
            throw new Error('Preencha todos os campos!')
        }
        return true
    },

    close() {
        Form.clear()
        Modal.Close()
    },

    submit(event) {
        event.preventDefault()

        try {
            Form.validate()
            const transaction = Form.format()
            Form.save(transaction)
            Form.clear()
            Modal.Close()
        } catch (error) {
            alert(error.message)
        }
    },

    amountKeyUp(e) {
        let num = Number(this.amount.value.replaceAll(/\D+/g, '')) * 0.01

        if (this.amount.value.match(/\-/g)?.length == 1) {
            num *= -1
        }

        if (num < 0) {
            this.amount.style.color = getComputedStyle(document.documentElement)
                .getPropertyValue('--cancel-color')
        }
        else {
            this.amount.style.color = getComputedStyle(document.documentElement)
                .getPropertyValue('--income-color')

        }
        this.amount.value = Utils.formatCurrency(num)
    }
}

const App = {
    init() {
        Transaction.all.forEach(htmlDocument.addTableRow)
        htmlDocument.updateBalance()
        Storage.set(Transaction.all)
    },
    reload() {
        htmlDocument.clearTable()
        App.init()
    }
}

App.init()