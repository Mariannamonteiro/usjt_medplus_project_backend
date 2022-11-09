const express = require('express')
const app = express()
app.use(express.json())

require('dotenv').config()

const {
    USER_DB_USUARIOS,
    HOST_DB_USUARIOS,
    DATABASE_DB_USUARIOS,
    PASSWORD_DB_USUARIOS,
    PORT_DB_USUARIOS} = process.env
    const {
        Client
      } = require('pg')
     
      function obterConexaoDB (){
        return new Client({
          user: USER_DB_USUARIOS,
          host: HOST_DB_USUARIOS,
          database: DATABASE_DB_USUARIOS,
          password: PASSWORD_DB_USUARIOS,
          port: PORT_DB_USUARIOS
        });
      }



const usuarios = []
let idUsuario = 0

//endpoint para cadastrar um novo usuario paciente
//localhost:5000/cadastro/paciente
app.post('/cadastro/paciente',async (req, res) => {

    let db = obterConexaoDB()
    db.connect()
    const { pacientes } = await db.query
    ("SELECT * FROM TB_PACIENTES")
    pacientes.forEach(paciente =>{

        if(paciente.cpf === req.body.cpf){
            return res.send("CPF já cadastrado.")
        }
    })   
   
    
    idUsuario++
    const usuario = req.body
    usuarios.push({
        id: idUsuario,
        nome: usuario.nome,
        cpf: usuario.cpf,
        dataNascimento: usuario.dataNascimento,
        sexo: usuario.sexo,
        celular: usuario.celular,
        email: usuario.email,
        senha: usuario.senha
    })

    console.log(usuarios)
    res.status(201).send(`Paciente ${usuario.nome} criado com sucesso!`)

})

//endpoint para logar um usuario
//localhost:5000/login
app.post('/login', async(req, res) => {

    let db = obterConexaoDB()
    await db.connect()

    const cpfReq = req.body.cpf
    const senhaReq = req.body.senha

    const sqlQuery = "SELECT * FROM tb_pacientes WHERE pac_cpf = $1 AND pac_senha = $2"
    const {rows} = await db.query(sqlQuery, [cpfReq, senhaReq])
    usuario = rows[0]
    if(usuario === undefined){
        res.send("Usuário e/ou senha incorreta.")
    }else{
        if (cpfReq === usuario.pac_cpf && senhaReq === usuario.pac_senha) {
            return res.send("Login efetuado com sucesso!")
        }
    }    
    db.end()  
})

app.listen(5000, () => { console.log("Usuários. Porta 5000") })


