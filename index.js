const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const {restrictToLoggedinUserOnly,checkAuth} = require("./middleware/auth");
const {connectMongoDb} = require("./connect");

const {URL} = require("./models/url");

const staticRoute = require("./routes/staticRouter");
const userRoute = require("./routes/user");
const urlRoute = require("./routes/url");


const app = express();
const PORT = 3001;


//connection
connectMongoDb("mongodb://127.0.0.1:27017/url-shortner")
.then(()=> {console.log("Mongodb Connected")})
.catch((err) => console.log("Error", err));

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser()); 

app.set('view engine', 'ejs');
app.set('views',path.resolve('./views'));



app.use("/url",restrictToLoggedinUserOnly , urlRoute);
app.use("/user", userRoute);
app.use("/",checkAuth,staticRoute);

app.get('/:shortId', async (req, res) => {
  const { shortId } = req.params;

  const entry = await URL.findOneAndUpdate(
    { shortId },
    {
      $push: {
        visitHistory: { timestamp: Date.now() },
      },
    },
    { new: true }
  );

  if (!entry) {
    return res.status(404).send("Short URL not found");
  }

  res.redirect(entry.redirectUrl);
});


app.listen(PORT, ()=> console.log(`Server is running on ${PORT}`));