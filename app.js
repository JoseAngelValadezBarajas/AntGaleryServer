const express = require('express');
const app = express();
const routes = require('./routes');
const cors = require('cors');

app.use(express.json());

app.use(cors({
  origin: '*',
  methods: 'GET,PUT,POST,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true,
}));

app.use('/', routes);

app.use('/uploads', express.static('uploads'));

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Servidor en funcionamiento en el puerto ${port}`);
});


