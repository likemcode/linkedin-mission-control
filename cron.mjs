// Cron script — checks every minute for scheduled posts to publish
// Run with: node cron.mjs

const INTERVAL_MS = 60 * 1000; // 1 minute
const API_URL = "http://localhost:3000/api/cron";

async function tick() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    const time = new Date().toLocaleTimeString("fr-FR");
    if (data.published > 0 || data.failed > 0) {
      console.log(`[${time}] ${data.published} publié(s), ${data.failed} échoué(s)`);
    } else {
      console.log(`[${time}] Rien à publier`);
    }
  } catch (err) {
    console.error(`[erreur] ${err.message}`);
  }
}

console.log("Cron démarré — vérification toutes les minutes");
tick();
setInterval(tick, INTERVAL_MS);
