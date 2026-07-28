//src/routes/index.js
const { Router } = require('express')
const funilRoutes = require('./funil.routes')
const instanceRoutes = require('./instance.routes')
const contactRoutes = require('./contact.routes')
const chatRoutes = require("./chat.routes")
const dashboardRoutes = require("./dashboard.routes")
const funilia = require("./funilIa.routes")
const funilIAModelo = require("./funilIaModelo.routes")
const setorRoutes = require("./setor.routes")
const diaSemana = require("./diaSemana.routes")
const usuarioRoutes = require("./usuario.routes")
const atendenteRoutes = require("./atendente.routes")
const painelIa = require("./painelIA.routes")

const router = Router()

router.use('/funis', funilRoutes)
router.use('/instancias', instanceRoutes)
router.use('/contacts', contactRoutes)
router.use("/chats", chatRoutes)
router.use("/dashboard", dashboardRoutes)
router.use("/funil-ia", funilia)
router.use("/funil-ia-modelo", funilIAModelo)
router.use("/setores", setorRoutes);
router.use("/dias-semana", diaSemana);
router.use("/usuarios", usuarioRoutes);
router.use("/atendentes", atendenteRoutes);
router.use("/painelia", painelIa)
module.exports = router