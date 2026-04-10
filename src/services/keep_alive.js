const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('¡El bot de chismes está vivito y coleando!'));

function keepAlive() {
    app.listen(port, () => console.log(`🌐 Servidor fantasma activo en el puerto ${port}`));
}

module.exports = keepAlive;