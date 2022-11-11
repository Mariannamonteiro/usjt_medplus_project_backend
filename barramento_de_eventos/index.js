const express = require('express');
//para enviar eventos para os demais microsserviços
const axios = require('axios');
const app = express();
app.use(express.json());

const eventos = [];
const funcoes = {
  BuscarUsuario: async ({ dadosUsuario }) => {
    console.log('Buscando usuario...');
    cpfUser = dadosUsuario.cpf;
    const usuario = await axios.get(`http://localhost:5000/buscar/usuario/${cpfUser}`);
   // console.log("DEPOIS DAQUI!!!!")
    if(usuario.data.usuario === null){
        console.log("USER NULO")
        return ({usuario: false})
    }else{
        return ({usuario: usuario.data.usuario})
    }
  },
  CriarNovoUsuario: async({ dadosUsuario }) => {
    console.log('Criando novo usuario...');
    novoUsuario = dadosUsuario;
    const usuario = await axios.post('http://localhost:5000/cadastro/paciente',{
          dados: novoUsuario,
          barramento: true,
        });
        return ({novoUsuario: usuario.data.usuario})
    
  },
  ConsultaAgendadaEnvioEmail: async(consulta) => {
    console.log("ENVIO DE EMAIL")
    console.log(consulta);
    console.log('Consulta agendada...');
    //envia o evento para o microsserviço de envio de email
    await axios.post('http://localhost:3000/envio-de-email', consulta).catch((err) => {
      console.log('Microsserviço de envio de email fora do ar.');
    });
    res.status(200).send({ msg: 'ok' });
  }
};

app.post('/eventos', async (req, res) => {
  try {
    res.send(await funcoes[req.body.tipo](req.body.dados));
  } catch (ex) {
    res.status(500).send({ erro: 'Deu erro' });
  }
});

app.listen(7000, () => {
  console.log('Barramento de eventos. Porta 7000');
});
