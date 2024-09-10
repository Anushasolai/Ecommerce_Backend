
import express from "express";
import { checkConnection } from "./db";

const app = express();
app.use(express.json());

const PORT = 4000 

app.listen(PORT,()=>{
   console.log(`server is running  ${PORT} port `)
   checkConnection()
})

export default app;