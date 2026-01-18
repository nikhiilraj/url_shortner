const express = require("express");
const {connectMongoDb} = require("./connect")
const urlRoute = require("./routes/url");
const {URL} = require("./models/url");

const app = express();
const PORT = 3001;

//connection
connectMongoDb("mongodb://127.0.0.1:27017/url-shortner")
.then(()=> {console.log("Mongodb Connected")})
.catch((err) => console.log("Error", err));

app.use(express.json());

app.use("/url", urlRoute);

app.get('/:shortId', async (req,res) => {
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate({
        shortId
    }, { $push: {
        visitHistory: {
           timestamp : Date.now(),
        },
    },
    }
);
res.redirect(entry.redirectUrl);
});

app.listen(PORT, ()=> console.log(`Server is running on ${PORT}`));