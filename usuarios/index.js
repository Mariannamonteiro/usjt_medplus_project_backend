const express = require('express')
const app = express()
app.use(express.json())

const usuarios = []
let idUsuario = 0

//endpoint para cadastrar um novo usuario paciente
//localhost:5000/cadastro/paciente
app.post('/cadastro/paciente', (req, res) => {
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
app.post('/login', (req, res) => {

    const cpf = req.body.cpf
    const senha = req.body.senha
    usuarios.forEach(usuario => {
        console.log(usuario)
        if (cpf === usuario.cpf && senha === usuario.senha) {
            return res.send("Login efetuado com sucesso!")
        }
    })
    res.send("Usuário e/ou senha incorreta.")

})

app.listen(5000, () => { console.log("Usuários. Porta 5000") })


