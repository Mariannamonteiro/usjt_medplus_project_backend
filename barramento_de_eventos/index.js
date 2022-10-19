const express = require('express');
//para enviar eventos para os demais microsserviços
const axios = require('axios');
const app= express();
app.use(express.json());

const eventos = []

app.post('/eventos', (req, res) => {
    const evento = req.body;
    eventos.push(evento)
    console.log(evento)
    //envia o evento para o microsserviço de envio de email
    axios.post('http://localhost:3000/envio-de-email', evento)
    .catch((err) => {
        console.log("Microsserviço de envio de email fora do ar.")
    });
    res.status(200).send({msg: 'ok'});
});

app.listen(7000, () => {
    console.log('Barramento de eventos. Porta 7000');
})
