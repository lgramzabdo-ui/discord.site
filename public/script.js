function copyText(id, text) {
  const box = document.getElementById(id);

  navigator.clipboard.writeText(text).then(() => {
    box.classList.add("copied");

    setTimeout(() => {
      box.classList.remove("copied");
    }, 2000);
  });
}

document.getElementById("copyIp").addEventListener("click", () => {
  copyText("copyIp", "mnight.datho.st");
});

document.getElementById("copyPort").addEventListener("click", () => {
  copyText("copyPort", "17442");
});


async function loadDiscordProfile() {
  try {
    const response = await fetch("/api/me");

    if (!response.ok) return;

    const data = await response.json();

    if (!data.loggedIn) return;

    const user = data.user;

    const avatar = document.getElementById("discordAvatar");
    const name = document.getElementById("discordName");

    name.textContent = user.global_name || user.username;

    if (user.avatar) {
      avatar.src =
        `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`;
    }

  } catch (error) {
    console.error("Discord profile error:", error);
  }
}

loadDiscordProfile();

async function loadDiscordStatus() {
  const dot = document.getElementById("statusDot");

  if (!dot) return;

  try {
    const response = await fetch("/api/discord-status");

    if (!response.ok) return;

    const data = await response.json();

    const images = {
      online: "on.png",
      idle: "idle.png",
      dnd: "dnd.png",
      offline: "off.png"
    };

    dot.src = images[data.status] || images.offline;

  } catch (error) {
    console.error("Discord status error:", error);
  }
}

loadDiscordStatus();
setInterval(loadDiscordStatus, 15000);