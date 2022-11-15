const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());

require('dotenv').config();

const { USER_DB_USUARIOS, HOST_DB_USUARIOS, DATABASE_DB_USUARIOS, PASSWORD_DB_USUARIOS, PORT_DB_USUARIOS } = process.env;
const { Client } = require('pg');

function obterConexaoDB() {
  return new Client({
    user: USER_DB_USUARIOS,
    host: HOST_DB_USUARIOS,
    database: DATABASE_DB_USUARIOS,
    password: PASSWORD_DB_USUARIOS,
    port: PORT_DB_USUARIOS,
  });
}

//endpoint para cadastrar um novo usuario paciente
//localhost:5000/cadastro/paciente
app.post('/cadastro/paciente', async (req, res) => {
  if (req.body.barramento === true) {
    req.body = req.body.dados;
  }
  let db = obterConexaoDB();
  db.connect();

  sqlQuerySelect = 'SELECT * FROM tb_pacientes WHERE pac_cpf = $1';
  const { rows } = await db.query(sqlQuerySelect, [req.body.cpf]);

  if (rows.length > 0) {
    if (rows[0].cpf === req.body.cpf) {
      db.end();
      return res.send('CPF já cadastrado.');
    }
  } else {
    paciente = req.body;
    sqlQueryInsert =
      'INSERT INTO TB_PACIENTES (PAC_CPF,PAC_NOME,PAC_DTNASCIMENTO,PAC_SEXO,PAC_TELEFONE,PAC_EMAIL,PAC_SENHA)' + 'VALUES($1, $2, $3, $4, $5, $6, $7)';

    await db.query(sqlQueryInsert, [
      paciente.cpf,
      paciente.nome,
      paciente.dataNascimento,
      paciente.sexo,
      paciente.celular,
      paciente.email,
      paciente.senha,
    ]);

    const { rows } = await db.query(sqlQuerySelect, [req.body.cpf]);

    db.end();
    console.log({ usuario: rows[0] })
    res.json({ usuario: rows[0] }).send()
    res.status(201).json();
  }
});

//endpoint para logar um usuario
//localhost:5000/login
app.post('/login', async (req, res) => {
  let db = obterConexaoDB();
  await db.connect();

  const cpfReq = req.body.cpf;
  const senhaReq = req.body.senha;

  const sqlQuery = 'SELECT * FROM tb_pacientes WHERE pac_cpf = $1 AND pac_senha = $2';
  const { rows } = await db.query(sqlQuery, [cpfReq, senhaReq]);
  usuario = rows[0];
  if (usuario === undefined) {
    db.end();
    res.send('Usuário e/ou senha incorreta.');
  } else {
    if (cpfReq === usuario.pac_cpf && senhaReq === usuario.pac_senha) {
      sqlQuerySelect = 'SELECT * FROM tb_pacientes WHERE pac_cpf = $1';
      const { rows } = await db.query(sqlQuerySelect, [cpfReq]);
      usuarioLogado = rows[0];
      db.end();
      return res.send(usuarioLogado);
    }
  }
  db.end();
});

//Buscar se user existe
//localhost:5000/buscar/usuario
app.get('/buscar/usuario/:cpf', async (req, res) => {
  let db = obterConexaoDB();
  db.connect();
  console.log('BODY ORIGINAL');
  console.log(req.params.cpf);

  sqlQuerySelect = 'SELECT * FROM tb_pacientes WHERE pac_cpf = $1';
  const { rows } = await db.query(sqlQuerySelect, [req.params.cpf]);
  await db.end();

  console.log(rows[0]);
  if(rows.length > 0){
    console.log("ENCONTROU USER")
    res.json({usuario: rows[0]}).send();
  }else{
    console.log("NÃO ENCONTROU USER")
    res.json({usuario: null}).send();
  }
});



//atualizar senha do usuario
//localhost:5000/redefinir/senha/usuario
app.put('/redefinir/senha/usuario/:cpfUser', async (req, res) => {
    let db = obterConexaoDB();
    await db.connect();
    const cpfUser = parseInt(req.params.cpfUser);
    const senhaAtualizada = req.body.senha;
    sqlQuerySelect = 'SELECT * FROM tb_pacientes WHERE pac_cpf = $1';
    const { rows } = await db.query(sqlQuerySelect, [cpfUser]);
    if(rows.length > 0){
    const sqlQueryUpdate = 'UPDATE tb_pacientes SET pac_senha = $1 where pac_cpf= $2';
     await db.query(sqlQueryUpdate, [senhaAtualizada, cpfUser]);
    db.end();
    res.status(201).send()
    }else{
    res.status(404).send()
    }
    
});


app.listen(5000, () => {
  console.log('Usuários. Porta 5000');
});
