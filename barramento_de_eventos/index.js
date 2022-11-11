const express = require('express');
//para enviar eventos para os demais microsserviços
const axios = require('axios');
const app= express();
app.use(express.json());

const eventos = []

const funcoes = {
    BuscarUsuario: async ({dadosUsuario})  => {
        console.log("Buscando usuario...")
        cpfUser = dadosUsuario.cpf
        console.log(cpfUser)
        const {resultado} = await axios.get("http://localhost:5000/buscar/usuario",{
            dados: cpfUser        
        })   
        return resultado
    }, 
    
    CriarNovoUsuario: async ({dadosUsuario}) => {
        console.log("Criando novo usuario...")
        novoUsuario = dadosUsuario
        console.log(novoUsuario)
        await axios.post("http://localhost:5000/cadastro/paciente",{
            dados: novoUsuario,
            barramento: true
        });

    },

     ConsultaAgendada: (consulta) =>{
        const evento = consulta;
        eventos.push(evento)
        console.log(evento)
        console.log("Consulta agendada...")
        //envia o evento para o microsserviço de envio de email
        axios.post('http://localhost:3000/envio-de-email', evento)
        .catch((err) => {
            console.log("Microsserviço de envio de email fora do ar.")
        });
        res.status(200).send({msg: 'ok'});
    
        }
}


app.post('/eventos', async (req, res) =>{
    try{
       const resultado =  funcoes[req.body.tipo](req.body.dados);
       res.send(resultado)
    }catch(ex){
        res.status(500).send({erro: "Deu erro"})
    }
    
})








app.listen(7000, () => {
    console.log('Barramento de eventos. Porta 7000');
})
