
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');


const app = express();
const PORT = process.env.PORT || 3000;

const config = require('./Database/backend');
const db = require('./Database/database');

const secretKey = config.secretKey;

app.use(bodyParser.json());
const AdminRoute = require('./router/Admin')(db, secretKey);
//const MenuRoute = require('./router/Menu')(db, secretKey);
const FDRoute = require('./router/Food')(db, secretKey);
const HDRoute = require('./router/HotDrinks')(db, secretKey);
const CDRoute = require('./router/ColdDrinks')(db, secretKey);
const DSRoute = require('./router/Desserts')(db, secretKey);
//const SubjectRoute = require('./router/subject')(db, secretKey);
// const IndicatorsRoute = require('./router/indicator')(db, secretKey);

app.use("/api",AdminRoute);
//app.use("/api",MenuRoute);
app.use("/api",FDRoute);
app.use("/api",HDRoute);
app.use("/api",CDRoute);
app.use("/api",DSRoute);

//app.use("/api",SubjectRoute);
// app.use("/api",IndicatorsRoute);

app.use(cors());

app.listen(PORT, () => {

    console.log(`Server is running on http://localhost:${PORT}`);
})