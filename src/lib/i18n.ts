import type { Language } from '../types/show';

export interface Translations {
  common: {
    pts: string;
    points: string;
    score: string;
    teamScore: string;
    globalScore: string;
    save: string;
    cancel: string;
    edit: string;
    confirm: string;
    reset: string;
    add: string;
    pause: string;
    start: string;
    undo: string;
    ready: string;
    running: string;
    timesUp: string;
    timeBang: string;
    buzzer: string;
    active: string;
    onStage: string;
    loadLive: string;
    pushToDisplay: string;
    sec: string;
    noTeamsYet: string;
    noTeamsRegistered: string;
  };
  landing: {
    badge: string;
    descriptionPrefix: string;
    descriptionMiddle: string;
    descriptionSuffix: string;
    launchDualBtn: string;
    hostCardTitle: string;
    hostCardDesc: string;
    hostCardCta: string;
    displayCardTitle: string;
    displayCardDesc: string;
    displayCardCta: string;
  };
  sidebar: {
    hostConsole: string;
    audienceScreen: string;
    liveCount: (n: number) => string;
    notOpen: string;
    openAnotherDisplay: string;
    launchDisplay: string;
    broadcastApi: string;
    storageSync: string;
    hostPreviewOn: string;
    hostPreviewOff: string;
    hostPreviewTooltip: string;
    nav: {
      control: { label: string; subtitle: string };
      teams: { label: string; subtitle: string };
      game: { label: string; subtitle: string };
      data: { label: string; subtitle: string };
    };
  };
  switcher: {
    onAir: string;
    displayScreen: string;
    lobby: string;
    leaderboard: string;
    activeGame: string;
  };
  soundboard: {
    muted: string;
    sfxLive: string;
    globalMuteTooltip: string;
    displayAudioReady: string;
    enableAudioOnDisplay: string;
    displayAudioReadyTip: string;
    enableAudioOnDisplayTip: string;
    pads: {
      tick: string;
      timeUp: string;
      swoosh: string;
      ding: string;
      miss: string;
      fanfare: string;
    };
    shortcuts: {
      timer: string;
      reset: string;
      fmReveal: string;
    };
  };
  shortcuts: {
    fmPaused: string;
    fmStarted: string;
    auctionPaused: string;
    auctionStarted: string;
    syncPaused: string;
    syncStarted: string;
    polyPaused: string;
    polyStarted: string;
    fmReset: string;
    auctionReset: string;
    syncReset: string;
    polyReset: string;
    rowGuessRevealed: (row: number) => string;
    rowActualRevealed: (row: number) => string;
    rowAlreadyRevealed: (row: number) => string;
    switchedLobby: string;
    switchedLeaderboard: string;
    switchedGame: string;
  };
  backdrop: {
    enableAudioFullscreen: string;
    enableAudioSub: string;
    hostLive: string;
    standby: string;
    hostMuted: string;
    exitFullscreen: string;
    fullscreen: string;
  };
  lobby: {
    competingPairs: (count: number) => string;
    teamsLoading: string;
    defaultSubtitle: string;
    defaultMessage: string;
  };
  leaderboard: {
    title: string;
    pairsCompeting: (count: number) => string;
    noTeamsTitle: string;
    noTeamsSubtitle: string;
    leader: string;
  };
  showControl: {
    currentLeader: string;
    addTeamsToTrack: string;
    activeGameModule: string;
    openModuleControls: (name: string) => string;
    broadcastSfx: string;
    broadcastSfxDesc: string;
    winnerFanfare: string;
    revealSting: string;
    pointsDing: string;
    wrongBuzzer: string;
    liveScoringDeck: string;
    liveScoringDesc: string;
    showLeaderboardNow: string;
    managePairs: string;
    addFirstPair: string;
    onStageBadge: string;
    spotlight: string;
    customPlaceholder: string;
  };
  teams: {
    addTitle: string;
    addDesc: string;
    teamName: string;
    teamNamePlaceholder: string;
    playerA: string;
    playerAPlaceholder: string;
    playerB: string;
    playerBPlaceholder: string;
    startScore: string;
    totalScore: string;
    stageColor: string;
    addBtn: string;
    registeredTitle: (count: number) => string;
    resetAllScores: string;
    zeroAllConfirm: string;
    confirmReset: string;
    emptyState: string;
    saveChanges: string;
  };
  modules: {
    heading: (count: number) => string;
    subheading: string;
    switchDisplayTo: (name: string) => string;
    list: {
      'friend-fast-money': { name: string; shortName: string; subtitle: string; description: string };
      'confidence-auction': { name: string; shortName: string; subtitle: string; description: string };
      'mental-sync': { name: string; shortName: string; subtitle: string; description: string };
      'the-polygraph': { name: string; shortName: string; subtitle: string; description: string };
      'rapid-stage': { name: string; shortName: string; subtitle: string; description: string };
    };
  };
  fastMoney: {
    title: string;
    subtitle: string;
    liveModeBadge: string;
    revealModeBadge: string;
    playingTeam: string;
    needTeamTitle: string;
    needTeamDesc: string;
    tabs: {
      setup: string;
      live: (count: number) => string;
      reveal: (pts: number) => string;
    };
    setup: {
      heading: (teamName: string) => string;
      desc: string;
      showSecrets: string;
      hideSecrets: string;
      loadSamples: string;
      shortQuestion: string;
      playerASecret: (name: string) => string;
      playerBSecret: (name: string) => string;
      readyGoLive: string;
    };
    live: {
      selectRound: string;
      round: (n: number) => string;
      roundOfTwo: (n: number) => string;
      guessesTitle: (name: string) => string;
      guessingPartner: (partner: string) => string;
      clockLabel: string;
      start30s: string;
      liveAnswersTitle: (guesser: string, owner: string) => string;
      liveAnswersDesc: string;
      lockedBadge: (n: number) => string;
      passedBadge: (n: number) => string;
      secretRef: (name: string) => string;
      answered: string;
      passed: string;
      typeGuessPlaceholder: (name: string) => string;
      passBtn: string;
      resetRoundConfirm: (n: number) => string;
      yesReset: string;
      resetRoundBtn: (n: number) => string;
      goToRevealBtn: string;
    };
    reveal: {
      heading: (n: number) => string;
      desc: string;
      r1r2Total: string;
      unscored: string;
      exactBadge: string;
      closeBadge: string;
      missBadge: string;
      playerGuessLabel: (name: string) => string;
      actualAnswerLabel: (name: string) => string;
      noAnswer: string;
      notPrefilled: string;
      revealGuessBtn: string;
      hideGuessBtn: string;
      revealActualBtn: string;
      hideActualBtn: string;
      awardRowScore: string;
      exactLabel: string;
      closeLabel: string;
      missLabel: string;
      backToLive: string;
      startRound2: (name: string) => string;
    };
    display: {
      selectPair: string;
      onTheClock: string;
      upToPlay: string;
      guessingAnswers: (partner: string) => string;
      slotsHeading: string;
      passedComeBack: string;
      lockedIn: string;
      passedPill: string;
      guessCol: (name: string) => string;
      actualCol: (name: string) => string;
      secretAnswer: string;
      realAnswer: (name: string) => string;
      noGuess: string;
      exactMatchStamp: string;
      closeMatchStamp: string;
      missStamp: string;
      roundPoints: (n: number) => string;
      playerRun: (name: string) => string;
      roundTotal: (n: number) => string;
      combinedTotal: string;
    };
  };
  auction: {
    title: string;
    subtitle: string;
    desc: string;
    tabs: {
      live: string;
      setup: (count: number) => string;
    };
    activeCategory: string;
    nextCategory: string;
    noCategoriesOption: string;
    hostHint: string;
    assignWinningTeam: string;
    winPoints: string;
    highestBidTarget: string;
    answersUnit: string;
    clockTitle: string;
    start30s: string;
    validAnswersTitle: string;
    validAnswersDesc: string;
    hitButton: string;
    undoHit: string;
    roundVerdict: string;
    verdictWon: (pts: number, team: string) => string;
    verdictFailed: string;
    verdictReached: string;
    verdictPending: string;
    awardedBtn: (pts: number) => string;
    bidClearedBtn: (pts: number) => string;
    bidFailedBtn: string;
    undoVerdict: string;
    setupTitle: string;
    setupDesc: string;
    resetSamples: string;
    categoryTitleLabel: string;
    categoryPlaceholder: string;
    optionalHintLabel: string;
    optionalHintPlaceholder: string;
    display: {
      winningBidder: string;
      categoryOnBlock: string;
      selectCategory: string;
      currentBidTarget: string;
      validHitsSub: string;
      clockRunning: string;
      clock30s: string;
      progressMeter: string;
      bidClearedBanner: (pts: number) => string;
      bustBanner: string;
      targetReachedBanner: string;
      moreToWin: (n: number) => string;
    };
  };
  mentalSync: {
    title: string;
    subtitle: string;
    desc: (pts: number) => string;
    tabs: {
      live: string;
      setup: (count: number) => string;
    };
    activePair: string;
    activePrompt: (idx: number, total: number) => string;
    whoTag: string;
    fillTag: string;
    optionalTimer: string;
    showOnDisplay: string;
    start15s: string;
    whiteboardsTitle: string;
    whiteboardsDesc: string;
    showWhiteboards: string;
    whiteboardsVisible: string;
    playerWhiteboard: (name: string) => string;
    typeAnswerPlaceholder: (name: string) => string;
    triggerHeading: string;
    clearOverlay: string;
    matchBtn: (pts: number) => string;
    mismatchBtn: string;
    setupTitle: string;
    setupDesc: string;
    resetSamples: string;
    promptType: string;
    promptText: string;
    promptPlaceholder: string;
    display: {
      readyPrompt: string;
      wroteLabel: (name: string) => string;
      footerCue: string;
      syncedHeadline: string;
      noMatchHeadline: string;
      pointsAwarded: (pts: number) => string;
      telepathyConfirmed: (team: string) => string;
      signalLost: string;
    };
  };
  polygraph: {
    title: string;
    subtitle: string;
    desc: string;
    showVerdicts: string;
    hideVerdicts: string;
    tabs: {
      live: string;
      setup: (count: number) => string;
    };
    pushStatementLabel: string;
    correctGuessPts: string;
    nextStatement: string;
    noStatementsOption: string;
    hotSeat: string;
    interrogator: string;
    secretLabel: string;
    emptyLive: string;
    clockTitle: string;
    interrogating: string;
    start60s: string;
    lockGuessTitle: (name: string) => string;
    clearGuess: string;
    truth: string;
    lie: string;
    stampHeading: string;
    correctCallToast: (pts: number, team: string) => string;
    wrongGuessToast: string;
    revealedToast: string;
    verdictPrefix: string;
    undoStamp: string;
    revealVerdictBtn: string;
    setupTitle: string;
    setupDesc: string;
    resetSamples: string;
    teamPair: string;
    assignedSpeaker: string;
    secretTag: string;
    statementPlaceholder: string;
    addStatementBtn: string;
    onScreen: string;
    pushToScreen: string;
    display: {
      swornStatement: string;
      selectStatement: string;
      calledIt: (name: string, pts: number) => string;
      fooledBy: (name: string) => string;
      interrogationClock: string;
      lockedGuessHeader: (name: string) => string;
      calledTruth: string;
      calledLie: string;
      awaitingVerdict: string;
    };
  };
  rapidStage: {
    controllerTitle: string;
    controllerDesc: string;
    promptVisible: string;
    promptHidden: string;
    revealAnswer: string;
    hideAnswer: string;
    roundBannerLabel: string;
    spotlightTeam: string;
    noneAllPairs: string;
    bottomScoreStrip: string;
    loadedOnStage: string;
    answerVisible: string;
    answerHidden: string;
    privateHostNote: string;
    quickAward: (pts: number) => string;
    selectOrAddPrompt: string;
    bankTitle: (count: number) => string;
    bankDesc: string;
    addQuestion: string;
    closeForm: string;
    category: string;
    pointValue: string;
    questionPrompt: string;
    answerRevealText: string;
    privateNoteInput: string;
    saveAndLoad: string;
    emptyBank: string;
    loadOnStage: string;
    display: {
      onStageNow: string;
      answerReveal: string;
      hostCall: string;
      activeGameStage: string;
      getReadyTitle: string;
      getReadySub: string;
    };
  };
  eventData: {
    backupTitle: string;
    backupDesc: string;
    autoSaved: (version: number) => string;
    teamsStat: string;
    questionsStat: string;
    totalPointsStat: string;
    lastUpdatedStat: string;
    exportBtn: string;
    importBtn: string;
    dropJson: string;
    exportedMsg: (teams: number, questions: number) => string;
    importedMsg: (fileName: string) => string;
    readError: string;
    brandingTitle: string;
    brandingDesc: string;
    showTitleLabel: string;
    topBadgeLabel: string;
    taglineLabel: string;
    lobbyStatusLabel: string;
    sessionTitle: string;
    sessionDesc: string;
    loadDemoBtn: string;
    loadedDemoMsg: string;
    clearAllBtn: string;
    clearConfirmText: string;
    yesClearAll: string;
    clearedMsg: string;
  };
}

export const TRANSLATIONS: Record<Language, Translations> = {
  es: {
    common: {
      pts: 'PTS',
      points: 'PUNTOS',
      score: 'PUNTOS',
      teamScore: 'PUNTOS DEL EQUIPO',
      globalScore: 'Puntaje Global',
      save: 'Guardar',
      cancel: 'Cancelar',
      edit: 'Editar',
      confirm: 'Confirmar',
      reset: 'Reiniciar',
      add: 'Agregar',
      pause: 'Pausar',
      start: 'Iniciar',
      undo: 'Deshacer',
      ready: 'LISTO',
      running: 'EN MARCHA',
      timesUp: '¡SE ACABÓ EL TIEMPO!',
      timeBang: '¡TIEMPO!',
      buzzer: '¡CHICHARRA!',
      active: 'ACTIVO',
      onStage: 'En Escena',
      loadLive: 'Cargar en Vivo',
      pushToDisplay: 'Enviar a Pantalla',
      sec: 'seg',
      noTeamsYet: 'Aún no hay parejas agregadas.',
      noTeamsRegistered: 'Sin equipos registrados',
    },
    landing: {
      badge: 'MOTOR DE SHOW EN VIVO A DOBLE PANTALLA',
      descriptionPrefix: 'Dirige tu show de amistad en vivo como un estudio de TV. Controla equipos, puntos y rondas en privado desde ',
      descriptionMiddle: ' mientras proyectas una pantalla limpia para el público en ',
      descriptionSuffix: '.',
      launchDualBtn: 'Iniciar Show Doble Pantalla (Host + Público)',
      hostCardTitle: 'Panel de Control (Host)',
      hostCardDesc: 'Administra parejas, ajusta puntajes en vivo, cambia vistas del proyector, prepara preguntas y exporta/importa tus datos en JSON.',
      hostCardCta: 'Abrir Panel del Host',
      displayCardTitle: 'Pantalla del Público',
      displayCardDesc: 'Vista de transmisión a pantalla completa y sin distracciones para arrastrar al proyector o segundo monitor. Sincronizada al instante.',
      displayCardCta: 'Abrir en Nueva Ventana',
    },
    sidebar: {
      hostConsole: 'CONSOLA HOST',
      audienceScreen: 'Pantalla Público',
      liveCount: (n) => `${n} EN VIVO`,
      notOpen: 'CERRADA',
      openAnotherDisplay: 'Abrir Otra Pantalla',
      launchDisplay: 'Abrir Pantalla Público',
      broadcastApi: 'BroadcastChannel API',
      storageSync: 'Sincronía LocalStorage',
      hostPreviewOn: 'Preview Host: SÍ',
      hostPreviewOff: 'Preview Host: NO',
      hostPreviewTooltip: 'Escuchar efectos también en la laptop del Host (la Pantalla del Público suena aparte salvo Silencio Global)',
      nav: {
        control: { label: 'Control en Vivo', subtitle: 'Puntajes y alertas' },
        teams: { label: 'Equipos y Parejas', subtitle: 'Administrar duplas' },
        game: { label: 'Juego Activo', subtitle: 'Módulos y rondas' },
        data: { label: 'Datos del Evento', subtitle: 'Exportar JSON y marca' },
      },
    },
    switcher: {
      onAir: 'AL AIRE',
      displayScreen: 'Pantalla:',
      lobby: 'Lobby / Portada',
      leaderboard: 'Tabla de Posiciones',
      activeGame: 'Juego Activo',
    },
    soundboard: {
      muted: 'SILENCIO',
      sfxLive: 'AUDIO VIVO',
      globalMuteTooltip: 'Silencio Global — silencia efectos tanto en /display como en /host',
      displayAudioReady: 'Audio Pantalla Listo',
      enableAudioOnDisplay: 'Activar Audio en /display',
      displayAudioReadyTip: 'El audio de la Pantalla del Público está desbloqueado y listo',
      enableAudioOnDisplayTip: 'Haz clic en "Activar Audio y Pantalla Completa" en /display para activar altavoces',
      pads: {
        tick: 'Tic-Tac',
        timeUp: 'Tiempo',
        swoosh: 'Volteo',
        ding: 'Acierto',
        miss: 'Error',
        fanfare: 'Fanfarria',
      },
      shortcuts: {
        timer: 'Reloj',
        reset: 'Reiniciar',
        fmReveal: 'Revelar DR',
      },
    },
    shortcuts: {
      fmPaused: 'Reloj Dinero Rápido en pausa (Espacio)',
      fmStarted: 'Reloj Dinero Rápido 30s iniciado (Espacio)',
      auctionPaused: 'Reloj Subasta en pausa (Espacio)',
      auctionStarted: 'Reloj Subasta 30s iniciado (Espacio)',
      syncPaused: 'Reloj Sincronía en pausa (Espacio)',
      syncStarted: 'Reloj Sincronía 15s iniciado (Espacio)',
      polyPaused: 'Reloj Polígrafo en pausa (Espacio)',
      polyStarted: 'Reloj Polígrafo 60s iniciado (Espacio)',
      fmReset: 'Reloj Dinero Rápido reiniciado a 30s (R)',
      auctionReset: 'Reloj Subasta reiniciado a 30s (R)',
      syncReset: 'Reloj Sincronía reiniciado a 15s (R)',
      polyReset: 'Reloj Polígrafo reiniciado a 60s (R)',
      rowGuessRevealed: (row) => `Fila #${row}: Respuesta revelada (${row})`,
      rowActualRevealed: (row) => `Fila #${row}: Respuesta real revelada (${row})`,
      rowAlreadyRevealed: (row) => `Fila #${row}: Ya revelada`,
      switchedLobby: 'Pantalla: Lobby / Portada (⇧1)',
      switchedLeaderboard: 'Pantalla: Tabla de Posiciones (⇧2)',
      switchedGame: 'Pantalla: Juego Activo (⇧3)',
    },
    backdrop: {
      enableAudioFullscreen: 'Activar Audio y Pantalla Completa',
      enableAudioSub: 'UN CLIC PARA DESBLOQUEAR EFECTOS DEL SHOW',
      hostLive: 'HOST EN VIVO',
      standby: 'EN ESPERA',
      hostMuted: 'SILENCIADO',
      exitFullscreen: 'Salir',
      fullscreen: 'Pantalla Completa',
    },
    lobby: {
      competingPairs: (count) => `PAREJAS PARTICIPANTES DE HOY (${count})`,
      teamsLoading: 'CARGANDO EQUIPOS EN ESCENA...',
      defaultSubtitle: 'SHOW DE AMISTAD EN VIVO',
      defaultMessage: 'EL SHOW COMIENZA PRONTO',
    },
    leaderboard: {
      title: 'TABLA DE POSICIONES',
      pairsCompeting: (count) => `${count} ${count === 1 ? 'PAREJA' : 'PAREJAS'} COMPITIENDO`,
      noTeamsTitle: 'AÚN NO HAY EQUIPOS',
      noTeamsSubtitle: 'Agrega parejas desde el Panel del Host para empezar.',
      leader: 'LÍDER',
    },
    showControl: {
      currentLeader: 'Líder Actual',
      addTeamsToTrack: 'Agrega equipos para llevar el marcador.',
      activeGameModule: 'Módulo de Juego Activo',
      openModuleControls: (name) => `Abrir controles de ${name}`,
      broadcastSfx: 'Efectos en Vivo',
      broadcastSfxDesc: 'Dispara efectos de estudio directo a los altavoces de la pantalla del público.',
      winnerFanfare: 'Fanfarria',
      revealSting: 'Revelación',
      pointsDing: 'Puntos +',
      wrongBuzzer: 'Chicharra',
      liveScoringDeck: 'Marcador Rápido en Vivo',
      liveScoringDesc: 'Cada cambio se sincroniza al instante en la Pantalla del Público con animaciones.',
      showLeaderboardNow: 'Mostrar Tabla Ahora',
      managePairs: 'Gestionar Parejas',
      addFirstPair: 'Agregar Primera Pareja',
      onStageBadge: 'EN ESCENA',
      spotlight: 'Destacar',
      customPlaceholder: 'Otro',
    },
    teams: {
      addTitle: 'Agregar Pareja de Amigos',
      addDesc: 'Registra una dupla participante con nombre de equipo, integrantes y color de estudio.',
      teamName: 'Nombre del Equipo',
      teamNamePlaceholder: 'ej. TEORÍA DEL CAOS',
      playerA: 'Jugador A',
      playerAPlaceholder: 'ej. Maya',
      playerB: 'Jugador B',
      playerBPlaceholder: 'ej. Lucas',
      startScore: 'Puntos Iniciales',
      totalScore: 'Puntaje Total',
      stageColor: 'Color en Escena:',
      addBtn: 'Agregar Pareja',
      registeredTitle: (count) => `Parejas Registradas (${count})`,
      resetAllScores: 'Poner Puntajes en 0',
      zeroAllConfirm: '¿Reiniciar todos los puntajes a 0?',
      confirmReset: 'Sí, Reiniciar',
      emptyState: 'Aún no hay equipos — ¡agrega tu primera pareja arriba!',
      saveChanges: 'Guardar Cambios',
    },
    modules: {
      heading: (count) => `Módulos de Juego (${count})`,
      subheading: 'Cambia al instante entre rondas del show — tanto /host como /display se actualizan al momento.',
      switchDisplayTo: (name) => `Mostrar ${name} en Pantalla`,
      list: {
        'friend-fast-money': {
          name: 'Dinero Rápido',
          shortName: 'Dinero Rápido',
          subtitle: '30s • 5 Preguntas',
          description: 'Ronda relámpago de 30s con respuestas ocultas, botón PASO y tablero de revelación (+20 / +10 / 0).',
        },
        'confidence-auction': {
          name: 'Subasta de Confianza',
          shortName: 'Subasta de Confianza',
          subtitle: 'Apuesta y 30s',
          description: 'Las parejas subastan cuántas respuestas lograrán en 30s mientras la barra de meta se llena con cada acierto.',
        },
        'mental-sync': {
          name: 'Sincronía Mental',
          shortName: 'Sincronía Mental',
          subtitle: 'Telepatía en Vivo',
          description: 'Frases impactantes en pantalla, reloj opcional de 15s, pizarras y explosivos avisos de ¡SINCRONIZADOS! (+15).',
        },
        'the-polygraph': {
          name: 'El Polígrafo',
          shortName: 'El Polígrafo',
          subtitle: 'Verdad o Mentira',
          description: 'Interrogatorio de 60 segundos, apuesta cerrada y sello gigante animado de VERDAD o MENTIRA.',
        },
        'rapid-stage': {
          name: 'Escenario Rápido',
          shortName: 'Escenario Rápido',
          subtitle: 'Preguntas Libres',
          description: 'Tablero flexible de preguntas y revelaciones para calentamientos, desempates o retos extra.',
        },
      },
    },
    fastMoney: {
      title: 'Dinero Rápido',
      subtitle: '5 preguntas relámpago • 30 segundos en el reloj • Exacta (+20) / Casi igual (+10) / Falló (0)',
      liveModeBadge: 'RONDA 30S EN VIVO',
      revealModeBadge: 'TABLERO REVELACIÓN',
      playingTeam: 'Pareja en Turno',
      needTeamTitle: 'Agrega una Pareja Primero',
      needTeamDesc: 'Dinero Rápido necesita al menos una pareja registrada en Equipos y Parejas.',
      tabs: {
        setup: '1. Preparación (5 Preguntas)',
        live: (count) => `2. Ronda 30s (${count}/5)`,
        reveal: (pts) => `3. Revelar y Puntuar (${pts} pts)`,
      },
      setup: {
        heading: (teamName) => `Respuestas Secretas — ${teamName}`,
        desc: 'Prepara las 5 preguntas cortas y las respuestas secretas de ambos jugadores. Permanecen ocultas en /display hasta revelarlas.',
        showSecrets: 'Mostrar Secretos',
        hideSecrets: 'Ocultar Secretos',
        loadSamples: 'Cargar 5 de Ejemplo',
        shortQuestion: 'Pregunta Corta',
        playerASecret: (name) => `Respuesta Secreta de ${name} (Ronda 2)`,
        playerBSecret: (name) => `Respuesta Secreta de ${name} (Ronda 1)`,
        readyGoLive: 'Listo — Ir a Ronda de 30s',
      },
      live: {
        selectRound: 'Seleccionar Ronda Activa',
        round: (n) => `RONDA ${n}`,
        roundOfTwo: (n) => `RONDA ${n} DE 2`,
        guessesTitle: (name) => `Adivina ${name}`,
        guessingPartner: (partner) => `Adivinando respuestas de ${partner}`,
        clockLabel: 'Cuenta Regresiva',
        start30s: 'Iniciar 30s',
        liveAnswersTitle: (guesser, owner) => `Respuestas en Vivo — ${guesser} adivina a ${owner}`,
        liveAnswersDesc: 'Escribe rápido y presiona Enter para fijar y saltar al siguiente espacio, o usa PASO. En /display siguen ocultas.',
        lockedBadge: (n) => `${n}/5 LISTAS`,
        passedBadge: (n) => `${n} PASO`,
        secretRef: (name) => `Secreto (${name}):`,
        answered: 'Respondida',
        passed: 'Pasó',
        typeGuessPlaceholder: (name) => `Escribe lo que grita ${name}...`,
        passBtn: 'PASO',
        resetRoundConfirm: (n) => `¿Borrar respuestas de Ronda ${n} y revertir sus puntos?`,
        yesReset: 'Sí, Reiniciar',
        resetRoundBtn: (n) => `Reiniciar Ronda ${n}`,
        goToRevealBtn: 'Pasar Público a Tablero de Revelación',
      },
      reveal: {
        heading: (n) => `Revelación y Puntaje — Ronda ${n}`,
        desc: 'Revela paso a paso en /display (o pulsa teclas 1–5 dos veces por fila) y puntúa para actualizar el marcador global.',
        r1r2Total: 'Total R1+R2',
        unscored: 'SIN PUNTUAR',
        exactBadge: '+20 PTS (EXACTA)',
        closeBadge: '+10 PTS (CASI IGUAL)',
        missBadge: '0 PTS (FALLÓ)',
        playerGuessLabel: (name) => `Respuesta de ${name}`,
        actualAnswerLabel: (name) => `Respuesta Real de ${name}`,
        noAnswer: '(Sin respuesta)',
        notPrefilled: '(No prellenada)',
        revealGuessBtn: '1. Revelar Respuesta',
        hideGuessBtn: 'Revelada (Ocultar)',
        revealActualBtn: '2. Revelar Respuesta Real',
        hideActualBtn: 'Real Revelada (Ocultar)',
        awardRowScore: '3. Puntuar Fila',
        exactLabel: 'Exacta',
        closeLabel: 'Casi igual',
        missLabel: 'Falló',
        backToLive: '← Volver a Ronda 30s',
        startRound2: (name) => `Iniciar Ronda 2 (Adivina ${name})`,
      },
      display: {
        selectPair: 'SELECCIONA UNA PAREJA PARA COMENZAR',
        onTheClock: '¡CORRE EL TIEMPO!',
        upToPlay: 'EN EL ESCENARIO',
        guessingAnswers: (partner) => `ADIVINANDO LAS RESPUESTAS DE ${partner}`,
        slotsHeading: '5 ESPACIOS DE DINERO RÁPIDO',
        passedComeBack: 'PASO — ¡VOLVEREMOS!',
        lockedIn: 'LISTO',
        passedPill: 'PASO',
        guessCol: (name) => `RESPUESTA DE ${name}`,
        actualCol: (name) => `REAL DE ${name}`,
        secretAnswer: 'RESPUESTA SECRETA',
        realAnswer: (name) => `RESPUESTA REAL DE ${name}`,
        noGuess: '— SIN RESPUESTA —',
        exactMatchStamp: '¡EXACTA!',
        closeMatchStamp: 'CASI IGUAL',
        missStamp: 'FALLÓ',
        roundPoints: (n) => `PUNTOS RONDA ${n}`,
        playerRun: (name) => `TURNO DE ${name}`,
        roundTotal: (n) => `TOTAL RONDA ${n}`,
        combinedTotal: 'TOTAL COMBINADO',
      },
    },
    auction: {
      title: 'Subasta de Confianza',
      subtitle: 'CONFIDENCE AUCTION',
      desc: 'Las parejas subastan cuántas respuestas válidas pueden decir en 30 segundos — ¡y luego lo demuestran!',
      tabs: {
        live: 'Controles de Subasta',
        setup: (count) => `Categorías (${count})`,
      },
      activeCategory: 'Categoría Activa',
      nextCategory: 'Siguiente Categoría',
      noCategoriesOption: 'Sin categorías — agrega en Preparación',
      hostHint: 'Pista del Host:',
      assignWinningTeam: 'Asignar Equipo Ganador de la Subasta',
      winPoints: 'Puntos por Ganar',
      highestBidTarget: 'Meta de la Subasta',
      answersUnit: 'RESPUESTAS',
      clockTitle: 'Reloj de 30 Segundos',
      start30s: 'Iniciar 30s',
      validAnswersTitle: 'Contador de Aciertos Válidos',
      validAnswersDesc: 'Toca en cada respuesta válida — llena la barra en vivo en /display.',
      hitButton: '+1 ACIERTO',
      undoHit: '-1 Quitar',
      roundVerdict: 'Resultado de la Ronda:',
      verdictWon: (pts, team) => `¡Se sumaron +${pts} pts a ${team}!`,
      verdictFailed: 'Marcada como Apuesta Fallida (0 pts).',
      verdictReached: '¡Meta alcanzada! Haz clic en Meta Superada para acreditar los puntos.',
      verdictPending: 'Otorga los puntos al superar la meta o marca Falló si se acaba el tiempo.',
      awardedBtn: (pts) => `Acreditados +${pts} pts`,
      bidClearedBtn: (pts) => `¡Meta Superada! (+${pts} pts)`,
      bidFailedBtn: 'No la Logró (0 pts)',
      undoVerdict: 'Deshacer',
      setupTitle: 'Banco de Categorías',
      setupDesc: 'Prepara categorías divertidas antes del evento — se guardan automáticamente y van en el JSON.',
      resetSamples: 'Cargar Ejemplos',
      categoryTitleLabel: 'Título de la Categoría',
      categoryPlaceholder: 'ej. "Cosas en el refrigerador de tu amigo"',
      optionalHintLabel: 'Pista Opcional del Host',
      optionalHintPlaceholder: 'Reglas rápidas o ejemplos...',
      display: {
        winningBidder: 'GANADOR DE LA SUBASTA',
        categoryOnBlock: 'CATEGORÍA EN JUEGO',
        selectCategory: 'SELECCIONA UNA CATEGORÍA',
        currentBidTarget: 'META DE SUBASTA',
        validHitsSub: 'ACIERTOS / META',
        clockRunning: 'RELOJ CORRIENDO',
        clock30s: 'RELOJ DE 30 SEGUNDOS',
        progressMeter: 'BARRA DE PROGRESO',
        bidClearedBanner: (pts) => `¡META SUPERADA! +${pts} PTS`,
        bustBanner: '¡SE QUEDARON CORTOS!',
        targetReachedBanner: '¡META ALCANZADA!',
        moreToWin: (n) => `FALTAN ${n} PARA GANAR`,
      },
    },
    mentalSync: {
      title: 'Sincronía Mental',
      subtitle: 'MENTAL SYNC',
      desc: (pts) => `Ambos amigos muestran su pizarra al mismo tiempo — ¡si coinciden ganan +${pts} pts!`,
      tabs: {
        live: 'Control en Vivo',
        setup: (count) => `Frases (${count})`,
      },
      activePair: 'Pareja Activa',
      activePrompt: (idx, total) => `Frase Activa (${idx}/${total})`,
      whoTag: '¿QUIÉN ES MÁS PROBABLE...?',
      fillTag: 'COMPLETA LA FRASE',
      optionalTimer: 'Reloj Opcional 15s',
      showOnDisplay: 'Mostrar en Pantalla',
      start15s: 'Iniciar 15s',
      whiteboardsTitle: 'Respuestas de Pizarra (Opcional)',
      whiteboardsDesc: 'Escribe lo que anotó cada uno para mostrarlo en /display, o dispara directamente el resultado.',
      showWhiteboards: 'Mostrar Pizarras en Pantalla',
      whiteboardsVisible: 'Pizarras Visibles en Pantalla',
      playerWhiteboard: (name) => `Pizarra de ${name}`,
      typeAnswerPlaceholder: (name) => `Respuesta de ${name}...`,
      triggerHeading: 'Disparar Resultado y Puntaje en Pantalla',
      clearOverlay: 'Quitar Aviso',
      matchBtn: (pts) => `COINCIDEN (+${pts} PTS)`,
      mismatchBtn: 'NO COINCIDEN (0 PTS)',
      setupTitle: 'Banco de Frases',
      setupDesc: 'Prepara preguntas de "¿Quién es más probable..." o "Completa la frase" antes del show.',
      resetSamples: 'Cargar Ejemplos',
      promptType: 'Tipo de Frase',
      promptText: 'Texto de la Frase',
      promptPlaceholder: 'Escribe la frase para la pantalla grande...',
      display: {
        readyPrompt: 'LISTOS PARA LA SIGUIENTE FRASE',
        wroteLabel: (name) => `${name} ESCRIBIÓ`,
        footerCue: '¡PIZARRAS ARRIBA A LA DE TRES • UNO • DOS • TRES!',
        syncedHeadline: '¡SINCRONIZADOS!',
        noMatchHeadline: 'NO COINCIDEN',
        pointsAwarded: (pts) => `+${pts} PUNTOS`,
        telepathyConfirmed: (team) => `${team} • ¡TELEPATÍA CONFIRMADA!`,
        signalLost: '0 PUNTOS • SIN CONEXIÓN',
      },
    },
    polygraph: {
      title: 'El Polígrafo',
      subtitle: 'VERDAD O MENTIRA',
      desc: 'Sienta a un amigo en la silla caliente durante 60 segundos de interrogatorio — ¡y sella el veredicto!',
      showVerdicts: 'Mostrar Secretos',
      hideVerdicts: 'Ocultar Secretos',
      tabs: {
        live: 'Mesa de Interrogatorio',
        setup: (count) => `Afirmaciones (${count})`,
      },
      pushStatementLabel: 'Enviar Afirmación a Pantalla',
      correctGuessPts: 'Pts si Acierta:',
      nextStatement: 'Siguiente Afirmación',
      noStatementsOption: 'Sin afirmaciones — agrega en Preparación',
      hotSeat: 'SILLA CALIENTE',
      interrogator: 'INTERROGADOR',
      secretLabel: 'SECRETO',
      emptyLive: 'Agrega una afirmación en Preparación para iniciar el interrogatorio.',
      clockTitle: 'Reloj de Interrogatorio 60s',
      interrogating: 'INTERROGANDO',
      start60s: 'Iniciar 60s',
      lockGuessTitle: (name) => `1. Fijar Apuesta de ${name}`,
      clearGuess: 'Limpiar',
      truth: 'VERDAD',
      lie: 'MENTIRA',
      stampHeading: '2. Sellar Veredicto Oficial en Pantalla',
      correctCallToast: (pts, team) => `¡ACERTÓ! +${pts} PTS PARA ${team}`,
      wrongGuessToast: '¡FALLÓ EL INTERROGATORIO! (0 PTS)',
      revealedToast: 'VEREDICTO REVELADO',
      verdictPrefix: 'VEREDICTO:',
      undoStamp: 'Quitar Sello',
      revealVerdictBtn: 'REVELAR VEREDICTO',
      setupTitle: 'Banco de Afirmaciones del Polígrafo',
      setupDesc: 'Asigna cada afirmación a un jugador y márcala en secreto como VERDAD o MENTIRA.',
      resetSamples: 'Cargar Ejemplos',
      teamPair: 'Pareja / Equipo',
      assignedSpeaker: 'Jugador en Silla Caliente',
      secretTag: 'Etiqueta Secreta',
      statementPlaceholder: 'Escribe una afirmación jugosa (verdad o mentira)...',
      addStatementBtn: 'Agregar Afirmación',
      onScreen: 'En Pantalla',
      pushToScreen: 'Enviar a Pantalla',
      display: {
        swornStatement: 'DECLARACIÓN BAJO POLÍGRAFO',
        selectStatement: 'SELECCIONA UNA AFIRMACIÓN EN LA CONSOLA DEL HOST',
        calledIt: (name, pts) => `¡${name} LA DESCUBRIÓ! +${pts} PTS`,
        fooledBy: (name) => `¡${name} LO ENGAÑÓ! 0 PTS`,
        interrogationClock: 'RELOJ DE INTERROGATORIO',
        lockedGuessHeader: (name) => `APUESTA DE ${name}`,
        calledTruth: 'DIJO: VERDAD',
        calledLie: 'DIJO: MENTIRA',
        awaitingVerdict: 'ESPERANDO DECISIÓN...',
      },
    },
    rapidStage: {
      controllerTitle: 'Control de Escenario Rápido',
      controllerDesc: 'Controla qué pregunta y respuesta aparecen en la pantalla del Escenario Rápido.',
      promptVisible: 'Pregunta Visible',
      promptHidden: 'Oculta (Espera)',
      revealAnswer: 'Revelar Respuesta',
      hideAnswer: 'Ocultar Respuesta',
      roundBannerLabel: 'Etiqueta de Ronda',
      spotlightTeam: 'Equipo Destacado (En Escena)',
      noneAllPairs: 'Ninguno (Todas las parejas)',
      bottomScoreStrip: 'Barra Inferior de Puntajes',
      loadedOnStage: 'Cargada en Escena',
      answerVisible: 'VISIBLE AL PÚBLICO',
      answerHidden: 'OCULTA AL PÚBLICO',
      privateHostNote: 'Nota Privada del Host:',
      quickAward: (pts) => `Sumar rápido +${pts} pts a:`,
      selectOrAddPrompt: 'Selecciona o agrega una pregunta abajo para proyectarla.',
      bankTitle: (count) => `Banco de Preguntas (${count})`,
      bankDesc: 'Prepara preguntas, respuestas y notas privadas — se exportan en el archivo JSON del evento.',
      addQuestion: 'Agregar Pregunta',
      closeForm: 'Cerrar',
      category: 'Categoría',
      pointValue: 'Puntos',
      questionPrompt: 'Pregunta / Consigna',
      answerRevealText: 'Texto de Respuesta',
      privateNoteInput: 'Nota Privada del Host',
      saveAndLoad: 'Guardar y Cargar',
      emptyBank: 'Aún no hay preguntas. Haz clic en "Agregar Pregunta" o importa un JSON.',
      loadOnStage: 'Cargar en Escena',
      display: {
        onStageNow: 'EN ESCENA AHORA',
        answerReveal: 'RESPUESTA',
        hostCall: '¡DECISIÓN DEL HOST!',
        activeGameStage: 'ESCENARIO EN VIVO',
        getReadyTitle: 'PREPÁRENSE PARA LA SIGUIENTE PREGUNTA',
        getReadySub: '¡Ojos al conductor — hay grandes puntos en juego!',
      },
    },
    eventData: {
      backupTitle: 'Respaldo y Preparación del Evento (.json)',
      backupDesc: 'Todo se guarda continuamente en localStorage. Exporta un archivo JSON para preparar el show antes o llevarlo a otra laptop.',
      autoSaved: (version) => `Esquema v${version} • Autoguardado`,
      teamsStat: 'Equipos / Parejas',
      questionsStat: 'Preguntas Libres',
      totalPointsStat: 'Puntos Totales',
      lastUpdatedStat: 'Último Guardado',
      exportBtn: 'Exportar Datos del Evento (.json)',
      importBtn: 'Importar Datos del Evento (.json)',
      dropJson: 'Suelta el archivo JSON para importar',
      exportedMsg: (teams, questions) => `Se exportaron ${teams} parejas, ${questions} preguntas y todos los módulos a JSON.`,
      importedMsg: (fileName) => `¡"${fileName}" importado con éxito! Sincronizado al instante con la Pantalla del Público.`,
      readError: 'No se pudo leer el archivo seleccionado.',
      brandingTitle: 'Marca del Show y Pantalla de Lobby',
      brandingDesc: 'Personaliza los títulos y mensajes de espera — se actualizan en vivo en /display.',
      showTitleLabel: 'Título del Show (Principal)',
      topBadgeLabel: 'Insignia Superior',
      taglineLabel: 'Frase / Subtítulo',
      lobbyStatusLabel: 'Mensaje Inferior del Lobby',
      sessionTitle: 'Reiniciar Sesión y Datos de Demostración',
      sessionDesc: 'Carga datos de prueba para practicar o limpia todo para preparar tu evento real desde cero.',
      loadDemoBtn: 'Cargar Datos de Demostración',
      loadedDemoMsg: 'Se cargaron los equipos y rondas de demostración.',
      clearAllBtn: 'Borrar Todos los Datos',
      clearConfirmText: '¿Eliminar todos los equipos y rondas?',
      yesClearAll: 'Sí, Borrar Todo',
      clearedMsg: 'Se borraron todos los datos. ¡Listo para un evento nuevo!',
    },
  },

  en: {
    common: {
      pts: 'PTS',
      points: 'POINTS',
      score: 'SCORE',
      teamScore: 'TEAM SCORE',
      globalScore: 'Global Score',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      confirm: 'Confirm',
      reset: 'Reset',
      add: 'Add',
      pause: 'Pause',
      start: 'Start',
      undo: 'Undo',
      ready: 'READY',
      running: 'RUNNING',
      timesUp: "TIME'S UP!",
      timeBang: 'TIME!',
      buzzer: 'BUZZER!',
      active: 'ACTIVE',
      onStage: 'On Stage',
      loadLive: 'Load Live',
      pushToDisplay: 'Push to Display',
      sec: 'sec',
      noTeamsYet: 'No friend pairs added yet.',
      noTeamsRegistered: 'No teams registered',
    },
    landing: {
      badge: 'DUAL-SCREEN LIVE GAME SHOW ENGINE',
      descriptionPrefix: 'Run your live friendship game show like a TV studio. Control teams, scores, and rounds privately from ',
      descriptionMiddle: ' while projecting a clutter-free broadcast display on ',
      descriptionSuffix: '.',
      launchDualBtn: 'Launch Dual-Window Show (Host + Display)',
      hostCardTitle: 'Host Control Panel',
      hostCardDesc: 'Manage competing friend pairs, adjust scores in real time, switch projector screens, prep questions, and export/import JSON event data.',
      hostCardCta: 'Open Control Panel',
      displayCardTitle: 'Audience Display Screen',
      displayCardDesc: 'Full-screen, clutter-free TV broadcast view designed to drag onto a projector or second monitor. Synchronizes live via BroadcastChannel.',
      displayCardCta: 'Open in New Window',
    },
    sidebar: {
      hostConsole: 'HOST CONSOLE',
      audienceScreen: 'Audience Screen',
      liveCount: (n) => `${n} LIVE`,
      notOpen: 'NOT OPEN',
      openAnotherDisplay: 'Open Another Display',
      launchDisplay: 'Launch Audience Display',
      broadcastApi: 'BroadcastChannel API',
      storageSync: 'LocalStorage Sync',
      hostPreviewOn: 'Host Preview: ON',
      hostPreviewOff: 'Host Preview: OFF',
      hostPreviewTooltip: 'Toggle local sound preview on Host laptop (Audience Display plays audio independently unless Global Mute is ON)',
      nav: {
        control: { label: 'Show Control', subtitle: 'Live scores & stage cues' },
        teams: { label: 'Teams & Pairs', subtitle: 'Manage competing duos' },
        game: { label: 'Active Game', subtitle: 'Modules & rounds' },
        data: { label: 'Event Data', subtitle: 'JSON export & branding' },
      },
    },
    switcher: {
      onAir: 'ON AIR',
      displayScreen: 'Display Screen:',
      lobby: 'Lobby / Title Screen',
      leaderboard: 'Live Leaderboard',
      activeGame: 'Active Game Module',
    },
    soundboard: {
      muted: 'MUTED',
      sfxLive: 'SFX LIVE',
      globalMuteTooltip: 'Global Mute — silences SFX on both /display and /host',
      displayAudioReady: 'Display Audio Ready',
      enableAudioOnDisplay: 'Enable Audio on /display',
      displayAudioReadyTip: 'Audience Display audio is unlocked and ready',
      enableAudioOnDisplayTip: 'Click "Enable Audio & Fullscreen" on the /display tab to unlock venue speakers',
      pads: {
        tick: 'Tick',
        timeUp: "Time's Up",
        swoosh: 'Swoosh',
        ding: 'Ding',
        miss: 'Miss Buzz',
        fanfare: 'Fanfare',
      },
      shortcuts: {
        timer: 'Timer',
        reset: 'Reset',
        fmReveal: 'FM Reveal',
      },
    },
    shortcuts: {
      fmPaused: 'Fast Money Timer Paused (Space)',
      fmStarted: 'Fast Money 30s Started (Space)',
      auctionPaused: 'Auction Timer Paused (Space)',
      auctionStarted: 'Auction 30s Started (Space)',
      syncPaused: 'Mental Sync Timer Paused (Space)',
      syncStarted: 'Mental Sync 15s Started (Space)',
      polyPaused: 'Polygraph Timer Paused (Space)',
      polyStarted: 'Polygraph 60s Started (Space)',
      fmReset: 'Fast Money Timer Reset to 30s (R)',
      auctionReset: 'Auction Timer Reset to 30s (R)',
      syncReset: 'Mental Sync Timer Reset to 15s (R)',
      polyReset: 'Polygraph Timer Reset to 60s (R)',
      rowGuessRevealed: (row) => `Row #${row}: Guess Revealed (${row})`,
      rowActualRevealed: (row) => `Row #${row}: Friend's Answer Revealed (${row})`,
      rowAlreadyRevealed: (row) => `Row #${row}: Already Revealed`,
      switchedLobby: 'Switched Display: Lobby (⇧1)',
      switchedLeaderboard: 'Switched Display: Leaderboard (⇧2)',
      switchedGame: 'Switched Display: Active Game (⇧3)',
    },
    backdrop: {
      enableAudioFullscreen: 'Enable Audio & Fullscreen',
      enableAudioSub: 'CLICK ONCE TO UNLOCK SHOW SFX',
      hostLive: 'HOST LIVE',
      standby: 'STANDBY',
      hostMuted: 'HOST MUTED',
      exitFullscreen: 'Exit',
      fullscreen: 'Fullscreen',
    },
    lobby: {
      competingPairs: (count) => `TONIGHT'S COMPETING PAIRS (${count})`,
      teamsLoading: 'TEAMS LOADING ON STAGE...',
      defaultSubtitle: 'LIVE FRIENDSHIP GAME SHOW',
      defaultMessage: 'SHOW STARTING SOON',
    },
    leaderboard: {
      title: 'LIVE LEADERBOARD',
      pairsCompeting: (count) => `${count} ${count === 1 ? 'PAIR' : 'PAIRS'} COMPETING`,
      noTeamsTitle: 'NO TEAMS REGISTERED YET',
      noTeamsSubtitle: 'Add friend pairs from the Host Control Panel to go live.',
      leader: 'LEADER',
    },
    showControl: {
      currentLeader: 'Current Leader',
      addTeamsToTrack: 'Add teams to start tracking scores.',
      activeGameModule: 'Active Game Module',
      openModuleControls: (name) => `Open ${name} Controls`,
      broadcastSfx: 'Broadcast SFX Cues',
      broadcastSfxDesc: 'Trigger live studio stings on the audience display audio output.',
      winnerFanfare: 'Winner Fanfare',
      revealSting: 'Reveal Sting',
      pointsDing: 'Points Ding',
      wrongBuzzer: 'Wrong Buzzer',
      liveScoringDeck: 'Live Scoring Deck',
      liveScoringDesc: 'Changes sync instantaneously to the Audience Screen with live animations.',
      showLeaderboardNow: 'Show Leaderboard Now',
      managePairs: 'Manage Pairs',
      addFirstPair: 'Add First Team Pair',
      onStageBadge: 'ON STAGE',
      spotlight: 'Spotlight',
      customPlaceholder: 'Custom',
    },
    teams: {
      addTitle: 'Add Friend Pair',
      addDesc: 'Register a competing duo with their team name, player names, and studio accent color.',
      teamName: 'Team Name',
      teamNamePlaceholder: 'e.g. CHAOS THEORY',
      playerA: 'Player A Name',
      playerAPlaceholder: 'e.g. Maya',
      playerB: 'Player B Name',
      playerBPlaceholder: 'e.g. Lucas',
      startScore: 'Start Score',
      totalScore: 'Total Score',
      stageColor: 'Stage Color:',
      addBtn: 'Add Friend Pair',
      registeredTitle: (count) => `Registered Pairs (${count})`,
      resetAllScores: 'Reset All Scores',
      zeroAllConfirm: 'Zero all scores?',
      confirmReset: 'Confirm Reset',
      emptyState: 'No teams yet — add your first friend pair above!',
      saveChanges: 'Save Changes',
    },
    modules: {
      heading: (count) => `Game Modules (${count})`,
      subheading: 'Switch instantaneously between live game show rounds — both /host and /display update in real time.',
      switchDisplayTo: (name) => `Switch Display to ${name}`,
      list: {
        'friend-fast-money': {
          name: 'Friend Fast Money',
          shortName: 'Friend Fast Money',
          subtitle: '30s • 5 Questions',
          description: 'Family Feud / Mogul Money speed round: 30s timer, masked live slots, PASS skips, and 2-column flip reveals (+20/+10/0).',
        },
        'confidence-auction': {
          name: 'Confidence Auction',
          shortName: 'Confidence Auction',
          subtitle: 'Subasta de Confianza',
          description: 'Outbid rival pairs on a category, then race a 30-second clock while a live progress bar fills with every +1 Hit.',
        },
        'mental-sync': {
          name: 'Mental Sync',
          shortName: 'Mental Sync',
          subtitle: 'Sincronía Mental',
          description: 'Bold centered prompts, optional 15s clock & whiteboard reveals, plus dramatic SYNCED! (+15) / NO MATCH overlays.',
        },
        'the-polygraph': {
          name: 'The Polygraph',
          shortName: 'The Polygraph',
          subtitle: 'Truth or Lie',
          description: '60-second interrogation timer, secret Truth/Lie dossier, friend guess lock-in, and high-impact animated stamp reveal.',
        },
        'rapid-stage': {
          name: 'Rapid Stage',
          shortName: 'Rapid Stage',
          subtitle: 'Bonus Q&A Board',
          description: 'General-purpose Q&A stage board for warm-ups, tiebreakers, and custom bonus questions.',
        },
      },
    },
    fastMoney: {
      title: 'Friend Fast Money',
      subtitle: '5 rapid-fire questions • 30 seconds on the clock • Exact (+20) / Close (+10) / Miss (0)',
      liveModeBadge: 'LIVE 30S MODE',
      revealModeBadge: 'REVEAL BOARD',
      playingTeam: 'Playing Team Pair',
      needTeamTitle: 'Add a Team Pair First',
      needTeamDesc: 'Friend Fast Money needs at least one registered friend pair in the Teams & Pairs tab.',
      tabs: {
        setup: '1. Pre-Game Setup (5 Q&As)',
        live: (count) => `2. Live 30s Round (${count}/5)`,
        reveal: (pts) => `3. Reveal & Scoring (${pts} pts)`,
      },
      setup: {
        heading: (teamName) => `Secret Answers Setup — ${teamName}`,
        desc: "Pre-fill 5 short questions and each player's secret answers. These remain strictly hidden from /display until you reveal them.",
        showSecrets: 'Show Secrets',
        hideSecrets: 'Hide Secrets',
        loadSamples: 'Load Sample 5 Q&As',
        shortQuestion: 'Short Question',
        playerASecret: (name) => `${name}'s Secret Answer (Used in R2)`,
        playerBSecret: (name) => `${name}'s Secret Answer (Used in R1)`,
        readyGoLive: 'Ready — Go to Live 30s Round',
      },
      live: {
        selectRound: 'Select Active Round',
        round: (n) => `ROUND ${n}`,
        roundOfTwo: (n) => `ROUND ${n} OF 2`,
        guessesTitle: (name) => `${name} Guesses`,
        guessingPartner: (partner) => `Guessing ${partner}'s answers`,
        clockLabel: 'Countdown Clock',
        start30s: 'Start 30s',
        liveAnswersTitle: (guesser, owner) => `Live Answers — ${guesser} Guessing ${owner}`,
        liveAnswersDesc: 'Type shouted answers rapidly and press Enter to lock & jump to the next open slot, or hit PASS. Answers remain masked on /display.',
        lockedBadge: (n) => `${n}/5 LOCKED`,
        passedBadge: (n) => `${n} PASSED`,
        secretRef: (name) => `Secret (${name}):`,
        answered: 'Answered',
        passed: 'Passed',
        typeGuessPlaceholder: (name) => `Type ${name}'s shouted guess...`,
        passBtn: 'PASS',
        resetRoundConfirm: (n) => `Clear Round ${n} answers & revert its points?`,
        yesReset: 'Yes, Reset',
        resetRoundBtn: (n) => `Reset Round ${n}`,
        goToRevealBtn: 'Switch Audience to Reveal & Scoring Board',
      },
      reveal: {
        heading: (n) => `Reveal & Scoring Board — Round ${n}`,
        desc: 'Reveal step-by-step on /display (or press keys 1–5 twice per row), then score to auto-update Round & Global Score.',
        r1r2Total: 'R1+R2 Total',
        unscored: 'UNSCORED',
        exactBadge: '+20 PTS (EXACT)',
        closeBadge: '+10 PTS (CLOSE)',
        missBadge: '0 PTS (MISS)',
        playerGuessLabel: (name) => `${name}'s Guess`,
        actualAnswerLabel: (name) => `${name}'s Actual Answer`,
        noAnswer: '(No answer)',
        notPrefilled: '(Not pre-filled)',
        revealGuessBtn: '1. Reveal Guess',
        hideGuessBtn: 'Guess Revealed (Hide)',
        revealActualBtn: "2. Reveal Friend's Answer",
        hideActualBtn: 'Actual Revealed (Hide)',
        awardRowScore: '3. Award Row Score',
        exactLabel: 'Exact',
        closeLabel: 'Close',
        missLabel: 'Miss',
        backToLive: '← Back to Live 30s Round',
        startRound2: (name) => `Start Round 2 (${name} Guesses)`,
      },
      display: {
        selectPair: 'SELECT A COMPETING PAIR TO BEGIN',
        onTheClock: 'ON THE CLOCK',
        upToPlay: 'UP TO PLAY',
        guessingAnswers: (partner) => `GUESSING ${partner}'S ANSWERS`,
        slotsHeading: '5 FAST MONEY SLOTS',
        passedComeBack: 'PASSED — COME BACK!',
        lockedIn: 'LOCKED IN',
        passedPill: 'PASSED',
        guessCol: (name) => `${name}'S GUESS`,
        actualCol: (name) => `${name}'S ACTUAL ANSWER`,
        secretAnswer: 'SECRET ANSWER',
        realAnswer: (name) => `${name}'S REAL ANSWER`,
        noGuess: '— NO GUESS —',
        exactMatchStamp: 'EXACT MATCH!',
        closeMatchStamp: 'CLOSE MATCH',
        missStamp: 'MISS',
        roundPoints: (n) => `ROUND ${n} POINTS`,
        playerRun: (name) => `${name}'S RUN`,
        roundTotal: (n) => `ROUND ${n} TOTAL`,
        combinedTotal: 'FAST MONEY COMBINED',
      },
    },
    auction: {
      title: 'Confidence Auction',
      subtitle: 'SUBASTA DE CONFIANZA',
      desc: 'Pairs outbid each other on how many answers they can name in 30 seconds — then prove it live!',
      tabs: {
        live: 'Live Auction Controls',
        setup: (count) => `Categories Setup (${count})`,
      },
      activeCategory: 'Active Category',
      nextCategory: 'Next Category',
      noCategoriesOption: 'No categories — add some in Setup',
      hostHint: 'Host hint:',
      assignWinningTeam: 'Assign Winning Bid Team',
      winPoints: 'Win Points',
      highestBidTarget: 'Highest Bid Target',
      answersUnit: 'ANSWERS',
      clockTitle: '30-Second Countdown',
      start30s: 'Start 30s',
      validAnswersTitle: 'Valid Answers Counter',
      validAnswersDesc: 'Tap for every valid answer shouted — fills the live progress bar on /display.',
      hitButton: '+1 HIT',
      undoHit: '-1 Undo',
      roundVerdict: 'Round Verdict:',
      verdictWon: (pts, team) => `Awarded +${pts} pts to ${team}!`,
      verdictFailed: 'Marked as Bid Failed (0 pts).',
      verdictReached: 'Target reached! Click Bid Cleared to lock into the scoreboard.',
      verdictPending: 'Award points once the team clears their bid, or mark Failed if time runs out.',
      awardedBtn: (pts) => `Awarded +${pts} pts`,
      bidClearedBtn: (pts) => `Bid Cleared (+${pts} pts)`,
      bidFailedBtn: 'Bid Failed (0 pts)',
      undoVerdict: 'Undo Verdict',
      setupTitle: 'Auction Categories Bank',
      setupDesc: 'Prepare fun categories ahead of time — auto-saved to localStorage and included in JSON exports.',
      resetSamples: 'Reset Sample Categories',
      categoryTitleLabel: 'Category Title',
      categoryPlaceholder: 'e.g. "Things in your friend\'s fridge"',
      optionalHintLabel: 'Optional Host Hint',
      optionalHintPlaceholder: 'Quick rules or examples...',
      display: {
        winningBidder: 'WINNING BIDDER',
        categoryOnBlock: 'CATEGORY ON THE BLOCK',
        selectCategory: 'SELECT A CATEGORY',
        currentBidTarget: 'CURRENT BID TARGET',
        validHitsSub: 'VALID HITS / BID TARGET',
        clockRunning: 'CLOCK RUNNING',
        clock30s: '30-SECOND CLOCK',
        progressMeter: 'TARGET PROGRESS METER',
        bidClearedBanner: (pts) => `BID CLEARED! +${pts} PTS`,
        bustBanner: 'BUST — BID FAILED!',
        targetReachedBanner: 'TARGET REACHED!',
        moreToWin: (n) => `${n} MORE TO WIN`,
      },
    },
    mentalSync: {
      title: 'Mental Sync',
      subtitle: 'SINCRONÍA MENTAL',
      desc: (pts) => `Both teammates reveal their whiteboard answers simultaneously — matching answers score +${pts} pts!`,
      tabs: {
        live: 'Live Sync Controls',
        setup: (count) => `Prompts Setup (${count})`,
      },
      activePair: 'Active Friend Pair',
      activePrompt: (idx, total) => `Active Prompt (${idx}/${total})`,
      whoTag: 'WHO IS MORE LIKELY...',
      fillTag: 'FILL IN THE BLANK',
      optionalTimer: 'Optional 15s Timer',
      showOnDisplay: 'Show on Display',
      start15s: 'Start 15s',
      whiteboardsTitle: 'Revealed Whiteboard Answers (Optional)',
      whiteboardsDesc: 'Type what each teammate wrote on their whiteboard to flash them side-by-side on /display, or jump straight to Match / Mismatch.',
      showWhiteboards: 'Show Whiteboards on Display',
      whiteboardsVisible: 'Whiteboards Visible on Display',
      playerWhiteboard: (name) => `${name}'s Whiteboard Answer`,
      typeAnswerPlaceholder: (name) => `Type ${name}'s answer...`,
      triggerHeading: 'Trigger Display Overlay & Score',
      clearOverlay: 'Clear Overlay',
      matchBtn: (pts) => `MATCH (+${pts} PTS)`,
      mismatchBtn: 'MISMATCH (0 PTS)',
      setupTitle: 'Mental Sync Prompts Bank',
      setupDesc: 'Add "Who is more likely to..." or "Fill in the blank" prompts ahead of your event.',
      resetSamples: 'Reset Sample Prompts',
      promptType: 'Prompt Type',
      promptText: 'Prompt Text',
      promptPlaceholder: 'Type prompt for the audience display...',
      display: {
        readyPrompt: 'READY FOR THE NEXT PROMPT',
        wroteLabel: (name) => `${name} WROTE`,
        footerCue: 'BOARDS UP ON THREE • ONE • TWO • THREE!',
        syncedHeadline: 'SYNCED!',
        noMatchHeadline: 'NO MATCH',
        pointsAwarded: (pts) => `+${pts} POINTS`,
        telepathyConfirmed: (team) => `${team} • TELEPATHY CONFIRMED!`,
        signalLost: '0 POINTS • SIGNAL LOST',
      },
    },
    polygraph: {
      title: 'The Polygraph',
      subtitle: 'TRUTH OR LIE',
      desc: 'Put one friend in the hot seat for a 60-second interrogation — then stamp the dramatic TRUTH or LIE verdict!',
      showVerdicts: 'Show Verdicts',
      hideVerdicts: 'Hide Secret Verdicts',
      tabs: {
        live: 'Live Interrogation Desk',
        setup: (count) => `Statements Setup (${count})`,
      },
      pushStatementLabel: 'Push Statement to Screen',
      correctGuessPts: 'Correct Guess Pts:',
      nextStatement: 'Next Statement',
      noStatementsOption: 'No statements — add some in Setup',
      hotSeat: 'HOT SEAT',
      interrogator: 'INTERROGATOR',
      secretLabel: 'SECRET',
      emptyLive: 'Add a statement in Statements Setup to begin interrogation.',
      clockTitle: '60s Interrogation Clock',
      interrogating: 'INTERROGATING',
      start60s: 'Start 60s',
      lockGuessTitle: (name) => `1. Lock In ${name}'s Guess`,
      clearGuess: 'Clear Guess',
      truth: 'TRUTH',
      lie: 'LIE',
      stampHeading: '2. Stamp Official Verdict on Display',
      correctCallToast: (pts, team) => `CORRECT! +${pts} PTS TO ${team}`,
      wrongGuessToast: 'WRONG GUESS (0 PTS)',
      revealedToast: 'REVEALED',
      verdictPrefix: 'VERDICT:',
      undoStamp: 'Undo Stamp',
      revealVerdictBtn: 'REVEAL VERDICT',
      setupTitle: 'Polygraph Statements Bank',
      setupDesc: 'Assign each statement to a player and secretly tag it TRUTH or LIE (hidden from /display until stamped).',
      resetSamples: 'Reset Sample Statements',
      teamPair: 'Team Pair',
      assignedSpeaker: 'Assigned Speaker (Hot Seat)',
      secretTag: 'Secret Tag',
      statementPlaceholder: "Type the player's juicy Truth or Lie statement...",
      addStatementBtn: 'Add Statement',
      onScreen: 'On Screen',
      pushToScreen: 'Push to Screen',
      display: {
        swornStatement: 'SWORN STATEMENT ON RECORD',
        selectStatement: 'SELECT A STATEMENT FROM THE HOST DESK',
        calledIt: (name, pts) => `${name} CALLED IT! +${pts} PTS`,
        fooledBy: (name) => `FOOLED BY ${name}! 0 PTS`,
        interrogationClock: 'INTERROGATION CLOCK',
        lockedGuessHeader: (name) => `${name}'S LOCKED GUESS`,
        calledTruth: 'CALLED: TRUTH',
        calledLie: 'CALLED: LIE',
        awaitingVerdict: 'AWAITING VERDICT...',
      },
    },
    rapidStage: {
      controllerTitle: 'Rapid Stage Controller',
      controllerDesc: 'Control what appears on the Rapid Stage prompt screen in real time.',
      promptVisible: 'Prompt Visible',
      promptHidden: 'Prompt Hidden (Standby)',
      revealAnswer: 'Reveal Answer on Screen',
      hideAnswer: 'Hide Answer',
      roundBannerLabel: 'Round Banner Label',
      spotlightTeam: 'Spotlight Team (On Stage)',
      noneAllPairs: 'None (All Pairs)',
      bottomScoreStrip: 'Bottom Score Strip',
      loadedOnStage: 'Currently Loaded on Stage',
      answerVisible: 'VISIBLE TO AUDIENCE',
      answerHidden: 'HIDDEN FROM AUDIENCE',
      privateHostNote: 'Private Host Note:',
      quickAward: (pts) => `Quick Award +${pts} pts to Pair:`,
      selectOrAddPrompt: 'Select or add a question below to display it on the Rapid Stage.',
      bankTitle: (count) => `Prepared Question Bank (${count})`,
      bankDesc: 'Prepare prompts, answers, and private host notes ahead of time — exported automatically in your Event JSON.',
      addQuestion: 'Add Question',
      closeForm: 'Close Form',
      category: 'Category',
      pointValue: 'Point Value',
      questionPrompt: 'Question / Stage Prompt',
      answerRevealText: 'Answer Reveal Text',
      privateNoteInput: 'Private Host Note',
      saveAndLoad: 'Save & Load Question',
      emptyBank: 'No prepared questions yet. Click "Add Question" above or import an Event JSON file.',
      loadOnStage: 'Load on Stage',
      display: {
        onStageNow: 'ON STAGE NOW',
        answerReveal: 'ANSWER REVEAL',
        hostCall: 'HOST CALL!',
        activeGameStage: 'ACTIVE GAME STAGE',
        getReadyTitle: 'GET READY FOR THE NEXT QUESTION',
        getReadySub: 'Eyes on the host — big points on the line!',
      },
    },
    eventData: {
      backupTitle: 'Event Data Backup & Prep (.json)',
      backupDesc: 'Everything auto-saves continuously to localStorage. Export a JSON file to prep ahead of time or move your show to another laptop.',
      autoSaved: (version) => `Schema v${version} • Auto-Saved`,
      teamsStat: 'Teams / Pairs',
      questionsStat: 'Prepared Q&As',
      totalPointsStat: 'Total Points',
      lastUpdatedStat: 'Last Updated',
      exportBtn: 'Export Event Data (.json)',
      importBtn: 'Import Event Data (.json)',
      dropJson: 'Drop JSON File to Import',
      exportedMsg: (teams, questions) => `Exported ${teams} team pairs, ${questions} prompts, and all game modules to JSON.`,
      importedMsg: (fileName) => `Successfully imported "${fileName}"! Synced immediately to localStorage and live Audience Displays.`,
      readError: 'Could not read the selected file.',
      brandingTitle: 'Show Branding & Lobby Screen',
      brandingDesc: 'Customize titles and lobby ticker messages — updates appear live on /display.',
      showTitleLabel: 'Show Title (Hero Headline)',
      topBadgeLabel: 'Top Broadcast Badge',
      taglineLabel: 'Show Tagline',
      lobbyStatusLabel: 'Lobby Bottom Status Pill',
      sessionTitle: 'Session Reset & Sample Data',
      sessionDesc: 'Load sample friendship teams and warm-up prompts for testing, or clear everything to build your live event from scratch.',
      loadDemoBtn: 'Load Demo Show Data',
      loadedDemoMsg: 'Loaded sample teams and warm-up questions.',
      clearAllBtn: 'Clear All Event Data',
      clearConfirmText: 'Delete all teams & questions?',
      yesClearAll: 'Yes, Clear All',
      clearedMsg: 'Cleared all event data. Ready for a fresh show!',
    },
  },
};

export function getDisplayWindowUrl(): string {
  return `${window.location.origin}${window.location.pathname}#/display`;
}
