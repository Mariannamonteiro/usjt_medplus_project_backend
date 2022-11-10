const express = require('express')
const app = express()
const cors = require('cors')
app.use(cors())
app.use(express.json())
const axios = require('axios');
require('dotenv').config()

const {
    USER_DB_CONSULTA,
    HOST_DB_CONSULTA,
    DATABASE_DB_CONSULTA,
    PASSWORD_DB_CONSULTA,
    PORT_DB_CONSULTA} = process.env
    const {
        Client
      } = require('pg')
     
      function obterConexaoDB (){
        return new Client({
          user: USER_DB_CONSULTA,
          host: HOST_DB_CONSULTA,
          database: DATABASE_DB_CONSULTA,
          password: PASSWORD_DB_CONSULTA,
          port: PORT_DB_CONSULTA
        });
      }


//Endpoint para buscar consulta pelo idConsulta
//localhost:6000/consulta/:idConsulta
app.get('/consulta/:idConsulta', async (req, res) => {

    let db = obterConexaoDB()
    await db.connect()

    const idConsultaReq = parseInt(req.params.idConsulta)
    const sqlQuery = "SELECT * FROM tb_consultas where cons_id = $1"
    const {rows} = await db.query(sqlQuery, [idConsultaReq])
    db.end()
    if( rows.length === 0 ){
        res.send( 'Consulta não encontrada.')
    }else{
        res.send(rows[0]);
    }  
})


//Endpoint para reagendar dados de uma consulta
//localhost:6000/consulta/reagendamento/:idConsulta
app.put('/consulta/reagendamento/:idConsulta', async(req,res)=>{

    let db = obterConexaoDB()
    await db.connect()
    const idConsultaReq = parseInt(req.params.idConsulta)
    const consultaAtualizada = req.body;

    const sqlQuery = "UPDATE tb_consultas SET cons_dthr = $1, CONS_IDUNIDADE = $2 where cons_id = $3"
    await db.query(sqlQuery, [consultaAtualizada.dataConsulta, consultaAtualizada.idUnidade, idConsultaReq])
    db.end()     
    res.send()  

})

//endpoint para listar todas as consultas
//localhost:6000/consultas
app.get('/consultas', async (req, res)=> {
    let db = obterConexaoDB()
    db.connect()
    const { rows } = await db.query
    ("SELECT * FROM tb_consultas")
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
    //abrir conexao com o banco 
    let db = obterConexaoDB()
    await db.connect()
    const consulta = req.body
    const sqlQuery = "INSERT INTO TB_CONSULTAS (CONS_IDESPECIALIDADE, CONS_IDUNIDADE, CONS_IDPACIENTE, CONS_DTHR) VALUES ($1,$2,$3,$4)"
    db.query(sqlQuery, [consulta.idEspecialidade, consulta.idUnidade,consulta.idPaciente, consulta.dataConsulta])

    await db.end()   
    await axios.post("http://localhost:7000/eventos", {
    tipo: "ConsultaAgendada",
    dados: {
        consulta
    }
  });

    res.status(201).send(`Consulta para o dia ${consulta.dataConsulta} agendada com sucesso!`)

})



app.listen(6000, () => { console.log("Consultas. Porta 6000") })


