const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());
const axios = require('axios');
require('dotenv').config();

const { USER_DB_CONSULTA, HOST_DB_CONSULTA, DATABASE_DB_CONSULTA, PASSWORD_DB_CONSULTA, PORT_DB_CONSULTA } = process.env;
const { Client } = require('pg');

function obterConexaoDB() {
  return new Client({
    user: USER_DB_CONSULTA,
    host: HOST_DB_CONSULTA,
    database: DATABASE_DB_CONSULTA,
    password: PASSWORD_DB_CONSULTA,
    port: PORT_DB_CONSULTA,
  });
}

//Endpoint para buscar consulta pelo idConsulta
//localhost:8080/consulta/:idConsulta
app.get('/consulta/:idConsulta', async (req, res) => {
  let db = obterConexaoDB();
  await db.connect();

  const idConsultaReq = parseInt(req.params.idConsulta);
  const sqlQuery = 'SELECT cons_id,cons_idespecialidade,cons_idunidade,cons_idpaciente,cons_dthr,esp_id,esp_especialidade,und_id,und_endereco,und_unidade FROM tb_consultas INNER JOIN tb_especialidades ON cons_idespecialidade = esp_id INNER JOIN tb_unidades ON cons_idunidade = und_id WHERE cons_id = $1';
  const { rows } = await db.query(sqlQuery, [idConsultaReq]);
  db.end();
  if (rows.length === 0) {
    res.send('Consulta não encontrada.');
  } else {
    res.send(rows[0]);
  }
});

//Endpoint para reagendar dados de uma consulta
//localhost:8080/consulta/reagendamento/:idConsulta
app.put('/consulta/reagendamento/:idConsulta', async (req, res) => {
  let db = obterConexaoDB();
  await db.connect();
  const idConsultaReq = parseInt(req.params.idConsulta);
  const consultaAtualizada = req.body;

  console.log(req.body)

  const sqlQuery = 'UPDATE tb_consultas SET cons_dthr = $1, CONS_IDUNIDADE = $2 where cons_id = $3';
  await db.query(sqlQuery, [consultaAtualizada.dataConsulta, consultaAtualizada.idUnidade, idConsultaReq]);
  db.end();
  res.send();
});

//endpoint para listar todas as consultas
//localhost:8080/consultas
app.get('/consultas', async (req, res) => {
  let db = obterConexaoDB();
  db.connect();
  const { rows } = await db.query('SELECT * FROM tb_consultas');
  await db.end();
  res.json(rows);
});

//endpoint para listar todas as consultas de um usuario
//localhost:8080/consultas/usuario
app.post('/consultas/usuario', async (req, res) => {
  
  //conecta com o banco
  let db = obterConexaoDB();
  db.connect();

  const idReq= req.body.id;

  const sqlQuery = 'SELECT cons_id,cons_idespecialidade,cons_idunidade,cons_idpaciente,cons_dthr,esp_id,esp_especialidade,und_id,und_endereco,und_unidade FROM tb_consultas INNER JOIN tb_especialidades ON cons_idespecialidade = esp_id INNER JOIN tb_unidades ON cons_idunidade = und_id WHERE cons_idpaciente = $1';
  const { rows } = await db.query(sqlQuery, [idReq]);
  await db.end();
  res.json(rows);
});

//endpoint para cancelar consulta
//localhost:8080/consultas/cancelar/:idConsulta
app.delete('/consulta/cancelar/:idConsulta', async (req, res) => {
  //conecta com o banco
  let db = obterConexaoDB();
  db.connect();

  //inicializando variavel que recebe o id
  const idConsultaReq = parseInt(req.params.idConsulta);

  //query do banco
  const sqlQuery = 'DELETE FROM tb_consultas where cons_id = $1';
  
  //Envia query para o banco e aguarda conclusão
  await db.query(sqlQuery, [idConsultaReq]);
  await db.end();
});

//endpoint para marcar uma nova consulta
//localhost:8080/consulta/agendar
app.post('/consulta/agendar', async (req, res) => {
  let db = obterConexaoDB();
  await db.connect();
  const consulta = req.body;

  if (consulta.usuarioLogado === true) {
    const sqlQueryInsert = 'INSERT INTO TB_CONSULTAS (CONS_IDESPECIALIDADE, CONS_IDUNIDADE, CONS_IDPACIENTE, CONS_DTHR) VALUES ($1,$2,$3,$4)';
    await db.query(sqlQueryInsert, [consulta.idEspecialidade, consulta.idUnidade, consulta.idPaciente, consulta.dataConsulta]);

    const sqlQueryBuscaUnidade = 'SELECT * FROM tb_unidades WHERE und_id = $1'
    const {rows} = await db.query(sqlQueryBuscaUnidade, [consulta.idUnidade])
    consulta.nomeUnidade = rows[0]['und_unidade']
    await db.end();
    await axios.post('http://localhost:7000/eventos', {
      tipo: 'ConsultaAgendadaEnvioEmail',
      dados: {
        consulta,
      }
    }).catch((err) => {
        console.log("Deu erro envio Email 1")
    });
    res.status(201).send(`Consulta para o dia ${consulta.dataConsulta} agendada com sucesso!`);
  } else {
    //usuario não está logado
    let dadosUsuario = req.body;
    //buscar pessoa na base de usuarios(verificar se existe)
    const usuario = await axios.post('http://localhost:7000/eventos', {
      tipo: 'BuscarUsuario',
      dados: {
        dadosUsuario,
      },
    }).catch((err) => {
        console.log("Deu erro Buscar Usuario")
    });
    if (!usuario.data.usuario) {
      console.log('Não achou usuario');
      //criar novo id para usuario com senha padrao e inseri-lo
      dadosUsuario.senha = '123456';
      const novoUsuario  = await axios.post('http://localhost:7000/eventos', {
          tipo: 'CriarNovoUsuario',
          dados: {
            dadosUsuario,
          },
        }).catch((err) => {
            console.log("Deu erro Criar Novo Usuario")
        });
      console.log('NOVO USER');
      console.log(novoUsuario);      
      const sqlQueryInsert = 'INSERT INTO TB_CONSULTAS (CONS_IDESPECIALIDADE, CONS_IDUNIDADE, CONS_IDPACIENTE, CONS_DTHR) VALUES ($1,$2,$3,$4)';
      await db.query(sqlQueryInsert, [consulta.idEspecialidade, consulta.idUnidade, novoUsuario.data.novoUsuario.pac_id, consulta.dataConsulta]);
      const sqlQueryBuscaUnidade = 'SELECT * FROM tb_unidades WHERE und_id = $1'
      const {rows} = await db.query(sqlQueryBuscaUnidade, [consulta.idUnidade])
      consulta.nomeUnidade = rows[0]['und_unidade']

      await db.end();
      await axios.post('http://localhost:7000/eventos', {
        tipo: 'ConsultaAgendadaEnvioEmail',
        dados: {
          consulta,
        }
      }).catch((err) => {
        console.log("Deu erro envio Email 2")
    });
      res.send("Consulta Agendada com sucesso")
    } else {
        console.log("Usuario já cadastrado")
        const sqlQueryInsert = 'INSERT INTO TB_CONSULTAS (CONS_IDESPECIALIDADE, CONS_IDUNIDADE, CONS_IDPACIENTE, CONS_DTHR) VALUES ($1,$2,$3,$4)';
      await db.query(sqlQueryInsert, [consulta.idEspecialidade, consulta.idUnidade, usuario.data.usuario.pac_id, consulta.dataConsulta])
     
      await axios.post('http://localhost:7000/eventos', {
        tipo: 'ConsultaAgendadaEnvioEmail',
        dados: {
          consulta,
        }
      }).catch((err) => {
        console.log("Deu erro envio Email3")
    });
      await db.end();
      res.send("Consulta Agendada com sucesso")

    }
  }
});

app.listen(8080, () => {
  console.log('Consultas. Porta 8080');
});
