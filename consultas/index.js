const express = require('express')
const app = express()
app.use(express.json())

const consultas = []
let idConsulta= 0

//buscar consulta pelo idConsulta
app.get('/consulta/:idConsulta', (req, res) => {
    const idConsultaReq = parseInt(req.params.idConsulta)
    consultas.forEach(consulta => {
        console.log(consulta)
        if(consulta.idConsulta === idConsultaReq){
            return res.send(consulta)
        }
    })
})

//endpoint para marcar uma nova consulta 
//localhost:6000/consulta/agendar
app.post('/consulta/agendar', (req, res) => {
    idConsulta++
    const consulta = req.body
    consultas.push({
        idConsulta: idConsulta,
        nome: consulta.nome,
        cpf: consulta.cpf,
        email: consulta.email,
        dataConsulta: consulta.dataConsulta,       
        idEspecialidade: consulta.idEspecialidade, 
        unidade: consulta.unidade

    })

    res.status(201).send(`Consulta para o dia ${consulta.dataConsulta} agendada com sucesso!`)

})


app.listen(6000, () => { console.log("Consultas. Porta 6000") })


