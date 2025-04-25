const express = require('express');
const app = express();
const morgan = require('morgan');

//configuraciones
app.set('port', 3000);
app.set('json spaces', 2);

//middlewares 
app.use(morgan('dev'));
app.use(express.json());

//rutas
app.use('/api/LigaDeLaJusticia', require('./rutas'));     //se importo desde nuestro archivo rutas.js

//empezando mi servidor
app.listen(app.get('port'));