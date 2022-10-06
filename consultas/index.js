const express = require('express')
const app = express()
app.use(express.json())

const consultas = []
let idConsulta= 0

//Endpoint para buscar consulta pelo idConsulta
//localhost:6000/consulta/:idConsulta
app.get('/consulta/:idConsulta', (req, res) => {
    const idConsultaReq = parseInt(req.params.idConsulta)
    consultas.forEach(consulta => {
        if(consulta.idConsulta === idConsultaReq){
            return res.send(consulta)
        }
    })
})

//Endpoint para reagendar dados de uma consulta
//localhost:6000/consulta/reagendamento/:idConsulta
app.put('/consulta/reagendamento/:idConsulta',(req,res)=>{
    const idConsultaReq = parseInt(req.params.idConsulta)
    const consultaAtualizada = req.body;
    consultas.forEach(c => {
        if(c.idConsulta === idConsultaReq){
                c.dataConsulta = consultaAtualizada.dataConsulta,
                c.idEspecialidade = consultaAtualizada.idEspecialidade, 
                c.unidade = consultaAtualizada.unidade
            res.status(201).send(`Consulta reagendada para o dia ${c.dataConsulta} !`)
        }
    })
})

//endpoint para listar todas as consultas
//localhost:6000/consultas
app.get('/consultas', (req, res)=> {
    res.send(consultas);
})

//endpoint para cancelar consulta
//localhost:6000/consultas/cancelar/:idConsulta
app.delete('/consulta/cancelar/:idConsulta', (req, res)=>{
    const idConsultaReq = parseInt(req.params.idConsulta)
    const consultaAtualizada = req.body;
    consultas.forEach(c => {
        if(c.idConsulta === idConsultaReq){
            c.status = consultaAtualizada.status
            res.status(201).send(`Consulta Cancelada`)
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


