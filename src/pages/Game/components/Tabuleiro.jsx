import { Button, Card, Container, Grid, Input } from "@mui/material";
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import { useContext, useEffect, useState } from "react";
/** Socket */
import { io } from "socket.io-client";

import { ModalResultado } from "./ModalResultado";
import MultiplayerContext from "../../../context/MultiplayerContext";

export default function Tabuleiro(  ) {
    const {
        // arrayTabuleiro,
        gameState, setGameState,
        colunaState, setColunaState,
        temaState, setTemaState,
        vencedorState, setVencedorState,
        empateState, setEmpateState,
        mostrarModalState, setMostrarModalState,
        disabledButton, setDisabledButton,
        socket, setSocket,
        // aindaEhPossivelVencer,
        verificarEmpate,
        verificarVitoria,
        posicionaFichaAoFinalDaColuna,
        encerrarJogo,
    } = useContext(MultiplayerContext)

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

    const [myTurn, setTurn] = useState(true);

    useEffect(() => {
        if (socket.set)
        {
            console.log(socket.id)
            socket.id.on("msg", (arg) => {
                console.log('socket message:', arg); // world
                setSocket((prev) => {return {...prev, msg: arg.tema}})
                if (arg.tabuleiro !== gameState)
                setTurn(true)
                setGameState(arg.tabuleiro);
            });
        }
    }, [socket.set])

    // Roda quando o evento do botão é gerado
    useEffect(() => {
        // Chama função para alocar ficha ao final da coluna selecionada
        let novoArray = posicionaFichaAoFinalDaColuna(gameState, colunaState);
        setTemaState(myChosenTheme);
        setTurn(false);
        // Chama função que envia jogada para o outro jogador
        if (socket.set) conversaComSocket();

        setColunaState(-1);
        setGameState(novoArray);

        // Roda lógica para saber se o jogador ganhou
        setVencedorState(verificarVitoria(gameState));

        // Roda lógica para saber o jogo empatou (terminou sem vitória)
        setEmpateState(verificarEmpate(gameState));
        //console.log("emapte " + empateState);

    }, [colunaState]);

    // Roda quando um vencedor é determinado
    useEffect(() => {
        if (vencedorState) {
            console.log("VITÓRIA");
            encerrarJogo();
        };
    }, [vencedorState]);

    // Roda quando um empate é determinado
    useEffect(() => {
        if (empateState)   
        {
            console.log("EMPATE!");
            encerrarJogo();
        };
    }, [empateState]);

    const conversaComSocket = () => {
        setSocket((prev) => {return {...prev, it: (socket.it + 1)}});
        const multiplayerState = {
            tabuleiro: gameState,
            tema: myChosenTheme,
        };
        socket.id.emit("msg", multiplayerState);
    };

    const [myChosenTheme, setChosenTheme] = useState("");

    const handleInput = (e) => {
        e.preventDefault();
        console.log(e.target.value)
        setChosenTheme(e.target.value);
        setTemaState(e.target.value);
    }

    return (
        <Container sx={{mx: 'auto'}}>  
            {/* Linha de botões */}
            <Grid container spacing={2} sx={{my: 1, ml: 5}}>
                <Grid container >
                    <Button onClick={() => iniciandoSocket()} >Cria Socket</Button>
                    <Button onClick={() => conversaComSocket()} >Teste Socket</Button>
                    <Input
                        onChange={handleInput}
                        // onBlur={() => console.log('Criar função que valida..')}
                        id="input-email" 
                        aria-describedby="input-your-name" 
                    />
                    <p>{socket.msg}</p>
                </Grid>
                
                {gameState[0].casas.map((botao, i) => {
                    return (
                        <Grid key={`JogarTabuleiroArrayBotao-${i}`} xs={1} sx={{my: 1, ml: 2.2}}>
                            <Button 
                                disabled={
                                    disabledButton ? 
                                        disabledButton : 
                                        myTurn || socket.msg === null ? 
                                            false : 
                                            true
                                } 
                                onClick={() => {setColunaState(i)}}
                                sx={{
                                    mr: 5, borderRadius: '40px',
                                    '&:hover': {
                                        backgroundColor: 'none',
                                        opacity: '80%',
                                    }
                                }}>
                                <KeyboardDoubleArrowDownIcon sx={disabledButton ?
                                    {
                                        fontSize: "40px",
                                        color: 'font.main',
                                        '&:hover': {
                                            color: 'primary.main'
                                        }
                                    }
                                    : 
                                    {
                                        fontSize: "40px",
                                        color: '#5C92FF',
                                        '&:hover': {
                                            color: 'primary.main'
                                        }
                                    }
                                }/>
                            </Button>
                        </Grid>
                    )
                })}
            </Grid>

            {/* Tabuleiro */}
            <Card sx={{
                height: '605px', m: 2, 
                backgroundColor: 'background.card',
                borderRadius: 5,
                p: 2,
                minWidth: '530px'
            }}>
                {gameState.map((item, i) => {
                return (
                    // LINHA DO TABULEIRO
                    <Grid key={`JogarTabuleiroArrayItem-${i}`} container spacing={2} sx={{my: 1, mx: 'auto'}}>
                        {item.casas.map((casa, j) => {
                        return (
                            <Grid key={`JogarTabuleiroArrayItem-${i}-Casa-${j}`} xs={1} sx={{my: 2, ml: 3}}>
                                {/* CASA DO TABULEIRO */}
                                <Container
                                    sx={{
                                        background: casa === 0 ? casaBackgroundVazia : casa,
                                        boxShadow: '0px 4px 4px 0px #00000040',
                                        '&:hover': {
                                          backgroundColor: 'primary.main',
                                          opacity: [0.9, 0.8, 0.7],
                                        },
                                        height: '55px',
                                        width: '55px',
                                        borderRadius: '55px'
                                      }}
                                >
                                    {''}
                                </Container>
                            </Grid>
                        )
                        })}
                    </Grid>
                )
            })}
            </Card>

            <ModalResultado mostrar={mostrarModalState} setMostrar={setMostrarModalState} isVencedor={vencedorState} isEmpate={empateState} />  
        </Container>
    );
};

const casaBackgroundVazia = 'radial-gradient(50% 50% at 50% 50%, rgba(39, 39, 39, 0) 0%, rgba(29, 28, 28, 0.72) 100%)';