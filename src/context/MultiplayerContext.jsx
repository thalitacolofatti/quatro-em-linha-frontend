import * as React from 'react';
import { io } from "socket.io-client";

const MultiplayerContext = React.createContext();

export const MultiplayerProvider = ({children}) => {
    const arrayTabuleiro = [
        {
            casas: [0, 0, 0, 0, 0, 0, 0]
        },
        {
            casas: [0, 0, 0, 0, 0, 0, 0]
        },
        {
            casas: [0, 0, 0, 0, 0, 0, 0]
        },
        {
            casas: [0, 0, 0, 0, 0, 0, 0]
        },
        {
            casas: [0, 0, 0, 0, 0, 0, 0]
        },
        {
            casas: [0, 0, 0, 0, 0, 0, 0]
        }
    ];
    
    const posicionaFichaAoFinalDaColuna = (array, indiceColuna) => {
        for (let i = array.length - 1; i >= 0; i--) {
            if (array[i].casas[indiceColuna] === 0) {
                array[i].casas[indiceColuna] = temaState;
                break; // Para o loop assim que encontrar o primeiro zero
            };
        };
    
        return array;
    };
    
    function verificarVitoria(tabuleiro) {
        const linhas = 6;
        const colunas = 7;
    
        // Verificar na horizontal
        for (let linha = 0; linha < linhas; linha++) {
            for (let coluna = 0; coluna < colunas - 3; coluna++) {
                if (tabuleiro[linha].casas[coluna] !== 0 &&
                    tabuleiro[linha].casas[coluna] === tabuleiro[linha].casas[coluna + 1] &&
                    tabuleiro[linha].casas[coluna] === tabuleiro[linha].casas[coluna + 2] &&
                    tabuleiro[linha].casas[coluna] === tabuleiro[linha].casas[coluna + 3]) {
                    return true;
                }
            }
        }
    
        // Verificar na vertical
        for (let linha = 0; linha < linhas - 3; linha++) {
            for (let coluna = 0; coluna < colunas; coluna++) {
                if (tabuleiro[linha].casas[coluna] !== 0 &&
                    tabuleiro[linha].casas[coluna] === tabuleiro[linha + 1].casas[coluna] &&
                    tabuleiro[linha].casas[coluna] === tabuleiro[linha + 2].casas[coluna] &&
                    tabuleiro[linha].casas[coluna] === tabuleiro[linha + 3].casas[coluna]) {
                    return true;
                }
            }
        }
    
        // Verificar nas diagonais (superior esquerda para inferior direita)
        for (let linha = 0; linha < linhas - 3; linha++) {
            for (let coluna = 0; coluna < colunas - 3; coluna++) {
                if (tabuleiro[linha].casas[coluna] !== 0 &&
                    tabuleiro[linha].casas[coluna] === tabuleiro[linha + 1].casas[coluna + 1] &&
                    tabuleiro[linha].casas[coluna] === tabuleiro[linha + 2].casas[coluna + 2] &&
                    tabuleiro[linha].casas[coluna] === tabuleiro[linha + 3].casas[coluna + 3]) {
                    return true;
                }
            }
        }
    
        // Verificar nas diagonais (superior direita para inferior esquerda)
        for (let linha = 0; linha < linhas - 3; linha++) {
            for (let coluna = 3; coluna < colunas; coluna++) {
                if (tabuleiro[linha].casas[coluna] !== 0 &&
                    tabuleiro[linha].casas[coluna] === tabuleiro[linha + 1].casas[coluna - 1] &&
                    tabuleiro[linha].casas[coluna] === tabuleiro[linha + 2].casas[coluna - 2] &&
                    tabuleiro[linha].casas[coluna] === tabuleiro[linha + 3].casas[coluna - 3]) {
                    return true;
                }
            }
        }
    
        // Nenhum alinhamento de 4 peças foi encontrado
        return false;
    };


    
    function verificarEmpate(tabuleiro) {
        const linhas = 6;
        const colunas = 7;
    
        for (let linha = 0; linha < linhas; linha++) {
            for (let coluna = 0; coluna < colunas; coluna++) {
                if (aindaEhPossivelVencer(tabuleiro, linha, coluna)) {
                    return false;
                }
            }
        }
    
        return true;
    };
    
    function aindaEhPossivelVencer(tabuleiro, linha, coluna) {
        const linhas = 6;
        const colunas = 7;
        const posicaoAtual = tabuleiro[linha].casas[coluna];
    
        // Verificar na horizontal
        for (let i = 0; i < 4; i++) {
            if (coluna + i >= colunas || (tabuleiro[linha].casas[coluna + i] !== posicaoAtual && tabuleiro[linha].casas[coluna + i] != 0)) {
                break;
            }
            if (i === 3) {
                return true;
            }
        }
    
        // Verificar na vertical
        for (let i = 0; i < 4; i++) {
            if (linha + i >= linhas || (tabuleiro[linha + i].casas[coluna] !== posicaoAtual && tabuleiro[linha + i].casas[coluna] !== 0)) {
                break;
            }
            if (i === 3) {
                return true;
            }
        }
    
        // Verificar na diagonal (superior esquerda para inferior direita)
        for (let i = 0; i < 4; i++) {
            if (linha + i >= linhas || coluna + i >= colunas || (tabuleiro[linha + i].casas[coluna + i] !== posicaoAtual && tabuleiro[linha + i].casas[coluna + i] != 0)) {
                break;
            }
            if (i === 3) {
                return true;
            }
        }
    
        // Verificar na diagonal (superior direita para inferior esquerda)
        for (let i = 0; i < 4; i++) {
            if (linha + i >= linhas || coluna - i < 0 || (tabuleiro[linha + i].casas[coluna - i] !== posicaoAtual && tabuleiro[linha + i].casas[coluna - i] !== 0)) {
                break;
            }
            if (i === 3) {
                return true;
            }
        }
    
        return false; // Não é possível vencer a partir dessa posição
    };

    const encerrarJogo = () => {
        // comunicar outro jogador
        // parar o jogo
        setMostrarModalState(true);
        setDisabledButton(true)
    };

    // STATES
    const [ gameState, setGameState ] = React.useState(arrayTabuleiro);
    const [ colunaState, setColunaState ] = React.useState(-1);
    const [ temaState, setTemaState ] = React.useState('grey');
    const [ vencedorState, setVencedorState ] = React.useState(false);
    const [ empateState, setEmpateState ] = React.useState(false);
    const [ mostrarModalState, setMostrarModalState ] = React.useState(false);
    const [ mostrarModalTemaState, setMostrarModalTemaState ] = React.useState(false);
    const [disabledButton, setDisabledButton] = React.useState(false);
    const [timer, setTimer] = React.useState(0);
    const [statusJogo, setStatusJogo] = React.useState(null);
    const [socket, setSocket] = React.useState({
        set: false, id: null, 
        msg: null, it: 0,
        
    });

    // SOCKET
    const iniciandoSocket = () => {
        console.log('Tentando conectar com o socket')
        // conectando com o socket
        const newSocket = io({path: '/api/v1/gaming'}, {
            transports: ['websocket'],
            });
        newSocket.on("connect", () => {
            console.log('Socket connected successfully!!!')
        });
        newSocket.on("connect_error", (err) => {
        console.log(`connect_error due to ${err.message}`);
        });
        setSocket((prev) => {return{...prev, set: true, id: newSocket}});
    };


    return <MultiplayerContext.Provider
        value={{
            arrayTabuleiro,
            gameState, setGameState,
            colunaState, setColunaState,
            temaState, setTemaState,
            vencedorState, setVencedorState,
            empateState, setEmpateState,
            mostrarModalState, setMostrarModalState,
            mostrarModalTemaState, setMostrarModalTemaState,
            disabledButton, setDisabledButton,
            socket, setSocket,
            timer, setTimer,
            statusJogo, setStatusJogo,
            aindaEhPossivelVencer,
            verificarEmpate,
            verificarVitoria,
            posicionaFichaAoFinalDaColuna,
            encerrarJogo,
            iniciandoSocket
        }}
    >
        {children}
    </MultiplayerContext.Provider>
};

export default MultiplayerContext;