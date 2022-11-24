import mongoose from "mongoose";

import app from "./app.js";
import connectToDB from "./configs/db.js";

const PORT = process.env.PORT || 3001;

connectToDB();

app.listen(PORT, () => {
  console.log(`App is running at http://localhost:${PORT}`);
});
