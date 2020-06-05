/**
 * server configs
 */

require('dotenv').config();
const express = require('express');
let app = express();

const cors = require('cors');
app.use(cors());

const helmet = require('helmet');
app.use(helmet());

app.disable('x-powered-by');

// require all routes
app = require('./app')(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`server running on PORT: ${PORT}`));
