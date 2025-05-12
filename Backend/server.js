const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./dbSingleton");
const dataRoutes = require("./routes/dataRoutes");
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/data", dataRoutes);




// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
