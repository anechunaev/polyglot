1. В файле /Users/jpig/dev/erudit/src/controller/index.ts на 104 строке нужно вынести список сессий на уровень всего сервера (server/index.ts)
2.  /Users/jpig/dev/erudit/src/controller/index.ts onGameEmit должен будет каким-то образом делать верхнеуровневый emit в конкретную игровую сессию
3. хранить массив игровых сессий внутри объекта игры для того, чтобы игра эмитила gameId и массив сессий. После этого сервер (server/index.ts) сможет сделать session.emit, поскольку после выполнения 1 пункта он будет хранить список сессий и их сокеты
4. 3 todo: (add sessionId to emit) /Users/jpig/dev/erudit/src/engine/game.ts
