const Fields = {
    city: document.getElementById('city'),
    state: document.getElementById('state'),
    death: document.getElementById('death'),
    cases: document.getElementById('cases'),
    suspects: document.getElementById('suspects'),
    refuses: document.getElementById('refuses'),
    datetime: document.getElementById('datetime')
}

const APIs = {
    fetchCOVID19: function (uf) {
        return fetch(`https://covid19-brazil-api.now.sh/api/report/v1/brazil/uf/${uf}`, { "method": "GET" });
    },
    fetchCEP: function (cep) {
        return fetch(`https://viacep.com.br/ws/${cep}/json/`);
    }
}

const SearchService = {
    search: async (cep) => {
        try {
            const viacepPromisse = await APIs.fetchCEP(cep);
            const viacep = await viacepPromisse.json();

            if (viacep.hasOwnProperty('erro')) throw new Error('CEP Inválido');

            const covidInfoPromisse = await APIs.fetchCOVID19(viacep.uf);
            const covidInfo = await covidInfoPromisse.json();

            if (covidInfo.hasOwnProperty('error')) throw new Error('UF Inválido');

            return { cepInfo: viacep, covidInfo: covidInfo }
        } catch (err) {
            console.error(err)
            return { error: true, details: err }
        }
    }
}

const SearchForm = {
    cepField: document.getElementById('cep'),
    cepFind: document.getElementById('cep-find'),
    errorField: document.getElementById('cep-error'),
    setAll: function (text) {
        for (const key in Fields) {
            Fields[key].innerText = text;
        }
    },
    seachCEP: async (text) => {
        SearchForm.setAll('Aguarde...')
        SearchForm.errorField.innerText = ''
        try {
            const result = await SearchService.search(text)
            if (result.hasOwnProperty('error')) throw new Error('CEP ou UF inválido');

            //console.log(result)
            Fields.city.innerText = result.cepInfo.localidade
            Fields.state.innerText = `${result.covidInfo.state} - ${result.covidInfo.uf}`
            Fields.death.innerText = Number(result.covidInfo.deaths).toLocaleString()
            Fields.cases.innerText = Number(result.covidInfo.cases).toLocaleString()
            Fields.suspects.innerText = Number(result.covidInfo.suspects).toLocaleString()
            Fields.refuses.innerText = Number(result.covidInfo.refuses).toLocaleString()
            Fields.datetime.innerText = new Date(Date.parse(result.covidInfo.datetime)).toLocaleDateString()

        }
        catch (err) {
            console.error(err)
            SearchForm.errorField.innerText = 'CEP inválido!'
            SearchForm.setAll('Informação indisponível...')
        }
    },
    cepMask: function (val) {
        return val
            .replace(/\D/g, '')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(\-\d{3})(\d+?$)/, '$1')
    },
    cepValid: function (val) {
        const validacep = /^[0-9]{8}$/;
        return validacep.test(val/*  */)
    },
    onInit: () => {
        cep.addEventListener('input', (event) => {
            event.target.value = SearchForm.cepMask(event.target.value)
        });
        SearchForm.cepFind.addEventListener('submit', function (event) {
            event.preventDefault();
            const cep = SearchForm.cepField.value.replace(/\D/g, '')

            if (SearchForm.cepValid(cep)) {
                SearchForm.seachCEP(cep);
            }
            else {
                SearchForm.setAll('Informação indisponível...')
                SearchForm.errorField.innerText = 'CEP inválido!'
            }
        })
        SearchForm.seachCEP('01153000')
    }
}

SearchForm.onInit();