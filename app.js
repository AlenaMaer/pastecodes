const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(express.static('public'))

// app.use(express.json()) // for json
app.use(express.urlencoded({ extended: true })) // for form data

const url = 'https://tranquil-island-92529.herokuapp.com/pastes';

async function getPastes() {
    let list = await fetch(url, { mode: 'no-cors' })
        .then(res => {
            return res.json();
        })
    return list.pastes;
    console.log(list.pastes);
}


app.get('/', async (req, res) => {
    let allData = await getPastes();
    let data = allData.slice(allData.length - 5);
    res.render('home', { data });
})

app.post('/', async function (req, res) {
    let data = { name: req.body.userName, body: req.body.userText };
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const json = await response.json();
        let newPaste = json.new_paste;
        console.log('Успех:', JSON.stringify(json));
        res.redirect(`/pastes/${newPaste.id}`)
    } catch (error) {
        res.render(`error`);
    }
});

app.get('/pastes/', async (req, res) => {
    let data = await getPastes();
    res.render('showAll', { data });
})

app.post('/pastes', async function (req, res) {
    let searchName = req.body.searchName;
    // console.log(searchName);
    let searchData = await getPastes();
    let data = searchData.filter(elem => elem.name == searchName)
    // console.log(data);
    res.render('showAll', { data });
})

app.get('/pastes/:id', async (req, res) => {
    let data = await getPastes();
    let shownPaste = data.find(data => data.id == req.params.id);
    res.render('showOne', { shownPaste });
})

app.all('*', (req, res, next) => {
    next(new ExpressError("Page Not Found", 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})