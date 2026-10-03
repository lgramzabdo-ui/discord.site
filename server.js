const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const session = require("express-session");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const discordClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences
  ]
});

const GUILD_ID = "1537106497400610837";
const USER_ID = "1532201308109668425";

app.use(session({
  secret: "abdo-discord-session",
  resave: false,
  saveUninitialized: false
}));

app.use(express.static("public"));

app.get("/login", (req, res) => {
  const discordUrl =
    "https://discord.com/oauth2/authorize" +
    "?client_id=" + process.env.CLIENT_ID +
    "&response_type=code" +
    "&redirect_uri=" + encodeURIComponent("http://localhost:3000/auth/discord/callback") +
    "&scope=identify";

  res.redirect(discordUrl);
});

app.get("/auth/discord/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.send("No code received.");
  }

  const response = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: "authorization_code",
      code: code,
      redirect_uri: "http://localhost:3000/auth/discord/callback"
    })
  });

  const tokenData = await response.json();

  if (!response.ok) {
    console.log(tokenData);
    return res.send("Discord OAuth error.");
  }

  const userResponse = await fetch(
    "https://discord.com/api/users/@me",
    {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    }
  );

  const user = await userResponse.json();

  req.session.discordUser = user;

  res.redirect("/");
});

app.get("/api/me", (req, res) => {
  if (!req.session.discordUser) {
    return res.status(401).json({
      loggedIn: false
    });
  }

  res.json({
    loggedIn: true,
    user: req.session.discordUser
  });
});

app.get("/api/discord-status", (req, res) => {
  const guild = discordClient.guilds.cache.get(GUILD_ID);

  if (!guild) {
    return res.status(404).json({
      status: "offline",
      error: "Guild not found"
    });
  }

  const member = guild.members.cache.get(USER_ID);

  if (!member) {
    return res.status(404).json({
      status: "offline",
      error: "User not found"
    });
  }

  res.json({
    status: member.presence?.status || "offline"
  });
});

discordClient.once("ready", () => {
  console.log(`Discord bot logged in as ${discordClient.user.tag}`);
});

discordClient.login(process.env.BOT_TOKEN);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
