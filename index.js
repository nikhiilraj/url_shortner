const express = require("express");
const path = require("path");
const staticRoute = require("./routes/staticRouter");
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
app.use(express.urlencoded({extended: false}));

app.set('view engine', 'ejs');
app.set('views',path.resolve('./views'));

app.use("/",staticRoute);

// app.get('/test', async (req,res)=>{
//     const allUrls = await URL.find({});
//     return res.render("home", {
//         urls: allUrls,
//     });
// });

app.use("/url", urlRoute);

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