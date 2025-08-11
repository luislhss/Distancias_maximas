// Variáveis globais
let dadosAtuais = null;

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    inicializarEventos();
});

function inicializarEventos() {
    // Eventos para os campos de entrada
    document.getElementById('grupo').addEventListener('change', atualizarResultado);
    document.getElementById('andar').addEventListener('change', atualizarResultado);
    
    // Eventos para os radio buttons
    const radioButtons = document.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', atualizarResultado);
    });
    
    // Eventos para as guias
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (!this.disabled) {
                trocarGuia(this.dataset.tab);
            }
        });
    });
    
    // Eventos para os botões de ação
    document.getElementById('btn-limpar').addEventListener('click', limparFormulario);
    document.getElementById('btn-salvar-imagem').addEventListener('click', salvarComoImagem);
    document.getElementById('btn-gerar-excel').addEventListener('click', gerarPlanilhaExcel);
}

function trocarGuia(tabId) {
    // Remove a classe active de todos os botões e painéis
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
    
    // Adiciona a classe active ao botão e painel selecionados
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

function atualizarResultado() {
    const grupo = document.getElementById('grupo').value;
    const andar = document.getElementById('andar').value;
    const chuveiro = document.querySelector('input[name="chuveiro"]:checked')?.value;
    const deteccao = document.querySelector('input[name="deteccao"]:checked')?.value;
    const saidas = document.querySelector('input[name="saidas"]:checked')?.value;
    
    // Verifica se todos os campos obrigatórios estão preenchidos
    if (!grupo || !andar || !chuveiro || !deteccao || !saidas) {
        mostrarMensagemSemDados();
        return;
    }
    
    // Busca os dados correspondentes na tabela
    const dadosEncontrados = tabelaAnexoB.find(item => 
        item.grupo === grupo && item.andar === andar
    );
    
    if (!dadosEncontrados) {
        mostrarMensagemSemDados();
        return;
    }
    
    // Armazena os dados atuais para uso nas funções de exportação
    dadosAtuais = {
        grupo,
        andar,
        chuveiro,
        deteccao,
        saidas,
        dados: dadosEncontrados
    };
    
    // Gera a tabela com os resultados
    gerarTabelaResultado(dadosEncontrados, chuveiro, deteccao, saidas);
}

function mostrarMensagemSemDados() {
    const tbody = document.getElementById('tabela-corpo');
    tbody.innerHTML = '<tr><td colspan="10" class="no-data">Selecione as opções acima para ver os resultados</td></tr>';
    dadosAtuais = null;
}

function gerarTabelaResultado(dados, chuveiro, deteccao, saidas) {
    const tbody = document.getElementById('tabela-corpo');
    
    // Determina qual valor destacar baseado nas seleções
    const tipoChuveiro = chuveiro === 'sim' ? 'comChuveiro' : 'semChuveiro';
    const tipoSaida = saidas === 'unica' ? 'saidaUnica' : 'maisDeUmaSaida';
    const tipoDeteccao = deteccao === 'sim' ? 'comDeteccao' : 'semDeteccao';
    
    // Gera a linha da tabela
    const linha = `
        <tr>
            <td>${dados.grupo}</td>
            <td>${dados.andar}</td>
            <td class="${tipoChuveiro === 'semChuveiro' && tipoSaida === 'saidaUnica' && tipoDeteccao === 'semDeteccao' ? 'resultado-destaque' : ''}">${dados.semChuveiro.saidaUnica.semDeteccao}</td>
            <td class="${tipoChuveiro === 'semChuveiro' && tipoSaida === 'saidaUnica' && tipoDeteccao === 'comDeteccao' ? 'resultado-destaque' : ''}">${dados.semChuveiro.saidaUnica.comDeteccao}</td>
            <td class="${tipoChuveiro === 'semChuveiro' && tipoSaida === 'maisDeUmaSaida' && tipoDeteccao === 'semDeteccao' ? 'resultado-destaque' : ''}">${dados.semChuveiro.maisDeUmaSaida.semDeteccao}</td>
            <td class="${tipoChuveiro === 'semChuveiro' && tipoSaida === 'maisDeUmaSaida' && tipoDeteccao === 'comDeteccao' ? 'resultado-destaque' : ''}">${dados.semChuveiro.maisDeUmaSaida.comDeteccao}</td>
            <td class="${tipoChuveiro === 'comChuveiro' && tipoSaida === 'saidaUnica' && tipoDeteccao === 'semDeteccao' ? 'resultado-destaque' : ''}">${dados.comChuveiro.saidaUnica.semDeteccao}</td>
            <td class="${tipoChuveiro === 'comChuveiro' && tipoSaida === 'saidaUnica' && tipoDeteccao === 'comDeteccao' ? 'resultado-destaque' : ''}">${dados.comChuveiro.saidaUnica.comDeteccao}</td>
            <td class="${tipoChuveiro === 'comChuveiro' && tipoSaida === 'maisDeUmaSaida' && tipoDeteccao === 'semDeteccao' ? 'resultado-destaque' : ''}">${dados.comChuveiro.maisDeUmaSaida.semDeteccao}</td>
            <td class="${tipoChuveiro === 'comChuveiro' && tipoSaida === 'maisDeUmaSaida' && tipoDeteccao === 'comDeteccao' ? 'resultado-destaque' : ''}">${dados.comChuveiro.maisDeUmaSaida.comDeteccao}</td>
        </tr>
    `;
    
    tbody.innerHTML = linha;
}

function limparFormulario() {
    // Limpa todos os campos
    document.getElementById('grupo').value = '';
    document.getElementById('andar').value = '';
    
    // Limpa todos os radio buttons
    const radioButtons = document.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(radio => {
        radio.checked = false;
    });
    
    // Limpa a tabela de resultados
    mostrarMensagemSemDados();
}

function salvarComoImagem() {
    if (!dadosAtuais) {
        alert('Por favor, preencha todos os campos antes de salvar a imagem.');
        return;
    }
    
    // Usa html2canvas para capturar a tabela como imagem
    const elemento = document.getElementById('resultado-tabela');
    
    // Verifica se a biblioteca html2canvas está disponível
    if (typeof html2canvas === 'undefined') {
        // Carrega a biblioteca dinamicamente
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.onload = function() {
            capturarImagem(elemento);
        };
        document.head.appendChild(script);
    } else {
        capturarImagem(elemento);
    }
}

function capturarImagem(elemento) {
    html2canvas(elemento, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true
    }).then(canvas => {
        // Cria um link para download
        const link = document.createElement('a');
        link.download = `distancias_maximas_${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL();
        link.click();
    }).catch(error => {
        console.error('Erro ao gerar imagem:', error);
        alert('Erro ao gerar a imagem. Tente novamente.');
    });
}

function gerarPlanilhaExcel() {
    if (!dadosAtuais) {
        alert('Por favor, preencha todos os campos antes de gerar a planilha.');
        return;
    }
    
    // Verifica se a biblioteca SheetJS está disponível
    if (typeof XLSX === 'undefined') {
        // Carrega a biblioteca dinamicamente
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
        script.onload = function() {
            criarPlanilhaExcel();
        };
        document.head.appendChild(script);
    } else {
        criarPlanilhaExcel();
    }
}

function criarPlanilhaExcel() {
    const dados = dadosAtuais.dados;
    
    // Cria os dados para a planilha
    const dadosPlanilha = [
        ['Sistema IT 11 - Corpo de Bombeiros da Bahia'],
        ['Anexo B - Tabela 2 - Distâncias máximas a serem percorridas'],
        [''],
        ['Configuração Selecionada:'],
        ['Grupo e divisão de ocupação:', dadosAtuais.grupo],
        ['Andar:', dadosAtuais.andar],
        ['Possui chuveiro automático:', dadosAtuais.chuveiro === 'sim' ? 'Sim' : 'Não'],
        ['Possui detecção e alarme:', dadosAtuais.deteccao === 'sim' ? 'Sim' : 'Não'],
        ['Quantidade de saídas:', dadosAtuais.saidas === 'unica' ? 'Uma saída' : 'Mais de uma saída'],
        [''],
        ['Tabela Completa:'],
        ['Grupo e divisão de ocupação', 'Andar', 'Sem chuveiros - Saída única - Sem detecção', 'Sem chuveiros - Saída única - Com detecção', 'Sem chuveiros - Mais saídas - Sem detecção', 'Sem chuveiros - Mais saídas - Com detecção', 'Com chuveiros - Saída única - Sem detecção', 'Com chuveiros - Saída única - Com detecção', 'Com chuveiros - Mais saídas - Sem detecção', 'Com chuveiros - Mais saídas - Com detecção'],
        [dados.grupo, dados.andar, dados.semChuveiro.saidaUnica.semDeteccao, dados.semChuveiro.saidaUnica.comDeteccao, dados.semChuveiro.maisDeUmaSaida.semDeteccao, dados.semChuveiro.maisDeUmaSaida.comDeteccao, dados.comChuveiro.saidaUnica.semDeteccao, dados.comChuveiro.saidaUnica.comDeteccao, dados.comChuveiro.maisDeUmaSaida.semDeteccao, dados.comChuveiro.maisDeUmaSaida.comDeteccao]
    ];
    
    // Cria a planilha
    const ws = XLSX.utils.aoa_to_sheet(dadosPlanilha);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Distâncias Máximas');
    
    // Salva o arquivo
    const nomeArquivo = `distancias_maximas_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, nomeArquivo);
}

