const nodemailer = require('nodemailer')
const express = require('express')
const app = express()
app.use(express.json())
require('dotenv').config()

const {
    EMAIL_HOST,
    EMAIL_SERVICE,
    EMAIL_PORT,
    EMAIL_USER,
    EMAIL_PASS} = process.env


app.post('/envio-de-email', (req, res) => {

    const consulta = req.body.dados.consulta

    let transporter = nodemailer.createTransport({
        host: EMAIL_HOST,
        service: EMAIL_SERVICE,
        port: EMAIL_PORT,
        secure:true,
        auth:{
            user: EMAIL_USER,
            pass: EMAIL_PASS
        }
    });

    transporter.sendMail({
        from: `USJT MEDPLUS <${EMAIL_USER}>`,
        to: consulta.email,
        subject: "MEDPLUS - Consulta Agendada",
        text:`Olá ${consulta.nome}, sua consulta f`,
        html: `Olá ${consulta.nome}, <br> sua consulta foi marcada com sucesso na MEDPLUS, confira: <br>
        Dia: ${consulta.dataConsulta} <br>
        Unidade: ${consulta.unidade}  <br>
        Lembramos que, para consultas em nossas unidades, a apresentação do documento de identificação e da carteirinha do convênio*, são indispensáveis. Bem como o uso de máscara, em função da pandemia da COVID-19
        `
    }).then(message =>{
        console.log(message)
    }).catch(err =>{
        console.log(err)
    })
    

})



app.listen(3000, () => {
    console.log('Envio de Email. Porta 3000');
})