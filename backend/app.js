const express = require('express')
const port = process.env.PORT||3000;
const app = express()
app.use(express.json());

const apiRoutes = require('./routes/api')
 app.get("/", (req,res,next)=>{
    res.send("api working")
 })
app.use('/api', apiRoutes)

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
