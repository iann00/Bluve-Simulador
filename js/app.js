(function () {
  'use strict';

  firebase.initializeApp(config);
  var database = firebase.database();
  var torneira = database.ref().child('torneira/s4JoDSWqBuX6cQLR');

  var isFuncAbrirChamada = false;
  var aberta = false;
  var consumo = 0;

  function switch() {
    if (aberta) {
      fechar();
    }
    else {
      abrir(1);
    }
  }

  function fechar() {
    torneira.set({ aberta: false }, function (erro) {
      if (erro) {
        $('#monitor').text('Status: [erro] não foi possível fechar a torneira');
      }
    });
  }

  function abrir(quantidadeLitros) {
    window.setInterval(function () {
      torneira.set({
          aberta : true,
          consumo: quantidadeLitros
        }, function (erro) {
            $('#monitor').text('Status: [erro] não foi possível abrir a torneira');
        })
    }, 5000);
  }

  function monitora() {
    torneira.on('value', function (snapshot) {
      if (snapshot.exists()) {
        aberta = snapshot.aberta;
        if (aberta) {
            $('#botao').attr('value', 'Fechar');
            /*
             Como a torneira tá aberta, lógicamente, deduzimos que quem
             abriu foi o usuário por meio do app, então aqui precisamos
             chamar a função abrir() simulando o comando do Arduíno.

             Por padrão, a valor será 1 litro/segundo, mas vamos atualizar
             o app para receber número de ponto flutuante para que seja
             possível setarmos valores como 0.5L e etc..

             Precisamos também verificar se a função já não foi chamada,
             pois ela tem um timer, então chamá-la mais de um vez fará
             com que haja múltiplas chamadas ao Database, causando problemas.
            */
            if (!funAbrirChamada) {
              funAbrirChamada = true; // A função foi chamada pela primeira vez
              abrir(1);
            }

            // Vamos incrementando o consumo e mostrando na tela
            consumo = consumo + snapshot.consumo;
            $('#consumo').text(consumo + 'L/s');
            $('#monitor').text('Status: torneira aberta...');
        }
        else {
          $('#aberta').attr('value', 'Abrir');
          $('#consumo').text((consumo = 0) + 'L/s');
          $('#monitor').text('Status: torneira fechada...');
        }

      }
    });
  }

  $('#botao').click(function () {
     switch();
  });
  // Inicia o monitoramento no Database
  monitor();
})();
