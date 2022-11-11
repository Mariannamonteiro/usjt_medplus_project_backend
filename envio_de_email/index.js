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

    console.log(req.body.consulta)
    const consulta = req.body.consulta


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

    if(consulta.usuarioLogado === false){
        console.log("ENTROU NAO ESTA LOGADO")
        transporter.sendMail({
            from: `USJT MEDPLUS <${EMAIL_USER}>`,
            to: consulta.email,
            subject: "MEDPLUS - Consulta Agendada",
            html: `Olá ${consulta.nome}, <br> sua consulta foi marcada com sucesso na MEDPLUS, confira: <br>
            Dia: ${consulta.dataConsulta} <br>
            Unidade: ${consulta.idUnidade}  <br>
            <br>
            Para efetivar se cadastro na MEDPLUS, atualize a senha padrão que criamos nesse link:<a href="https://www.google.com/">Redefina sua senha MEDPLUS</a>.
            <br>
            Lembramos que, para consultas em nossas unidades, a apresentação do documento de identificação e da carteirinha do convênio*, são indispensáveis. Bem como o uso de máscara, em função da pandemia da COVID-19
            `
        }).then(message =>{
            console.log(message)
            res.send()
        }).catch(err =>{
            console.log(err)
        })       

    }else{
        console.log("ENTROU ESTA LOGADO")


        transporter.sendMail({
            from: `USJT MEDPLUS <${EMAIL_USER}>`,
            to: consulta.email,
            subject: "MEDPLUS - Consulta Agendada",
            html: `Olá ${consulta.nome}, <br> sua consulta foi marcada com sucesso na MEDPLUS, confira: <br>
            Dia: ${consulta.dataConsulta} <br>
            Unidade: ${consulta.idUnidade}  <br>
            Lembramos que, para consultas em nossas unidades, a apresentação do documento de identificação e da carteirinha do convênio*, são indispensáveis. Bem como o uso de máscara, em função da pandemia da COVID-19
            `
        }).then(message =>{
            console.log(message)
            res.send()
        }).catch(err =>{
            console.log(err)
        })

    }
    

    
    

})



app.listen(3000, () => {
    console.log('Envio de Email. Porta 3000');
})