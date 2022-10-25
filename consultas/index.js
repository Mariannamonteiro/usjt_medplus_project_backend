const express = require('express')
const app = express()
app.use(express.json())
const axios = require('axios');
require('dotenv').config()

const {
    USER_DB,
    HOST_DB,
    DATABASE_DB,
    PASSWORD_DB,
    PORT_DB} = process.env
    const {
        Client
      } = require('pg')
     
      function obterConexaoDB (){
        return new Client({
          user: USER_DB,
          host: HOST_DB,
          database: DATABASE_DB,
          password: PASSWORD_DB,
          port: PORT_DB
        });
      }


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
app.get('/consultas', async (req, res)=> {
    let db = obterConexaoDB()
    db.connect()
    const { rows } = await db.query
    ("SELECT * FROM tb_consultas")
    console.log(rows)
    await db.end()
    res.json(rows);
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
app.post('/consulta/agendar', async (req, res) => {
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
    });
    await axios.post("http://localhost:7000/eventos", {
    tipo: "ConsultaAgendada",
    dados: {
        consulta
    }
  });

    res.status(201).send(`Consulta para o dia ${consulta.dataConsulta} agendada com sucesso!`)

})


app.listen(6000, () => { console.log("Consultas. Porta 6000") })


