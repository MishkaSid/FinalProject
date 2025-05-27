const express = require("express");
const cors = require("cors");
require("dotenv").config();
const dataRoutes = require("./routes/dataRoutes");
const app = express();


app.use(cors());
app.use(express.json());

app.use("/api/generalData", dataRoutes);
app.use("/api/specificData", dataRoutes);
app.use("/api/user", dataRoutes);
app.use("/api/auth/login", require("./routes/auth"));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
