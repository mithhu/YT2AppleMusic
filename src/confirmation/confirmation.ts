// Parse URL parameters
const urlParams = new URLSearchParams(window.location.search);
const youtubeId = urlParams.get("youtubeId");
const youtubeTitle = urlParams.get("youtubeTitle");
const artist = urlParams.get("artist");
const song = urlParams.get("song");

// Update UI with the information
document.addEventListener("DOMContentLoaded", () => {
  const youtubeTitleEl = document.getElementById("youtube-title");
  const appleMusicMatchEl = document.getElementById("apple-music-match");

  if (youtubeTitleEl && youtubeTitle) {
    youtubeTitleEl.textContent = decodeURIComponent(youtubeTitle);
  }

  if (appleMusicMatchEl && artist && song) {
    appleMusicMatchEl.textContent = `${decodeURIComponent(
      artist,
    )} - ${decodeURIComponent(song)}`;
  }

  // Set up button handlers
  const confirmBtn = document.getElementById("confirm-btn");
  const rejectBtn = document.getElementById("reject-btn");
  const skipBtn = document.getElementById("skip-btn");

  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      if (youtubeId) {
        chrome.runtime
          .sendMessage({
            type: "CONFIRM_CACHE_ENTRY",
            data: { youtubeId: decodeURIComponent(youtubeId) },
          })
          .then(() => {
            showSuccess("✅ Match confirmed and saved!");
            setTimeout(() => window.close(), 1500);
          })
          .catch(console.error);
      }
    });
  }

  if (rejectBtn) {
    rejectBtn.addEventListener("click", () => {
      if (youtubeId) {
        chrome.runtime
          .sendMessage({
            type: "REJECT_CACHE_ENTRY",
            data: { youtubeId: decodeURIComponent(youtubeId) },
          })
          .then(() => {
            showSuccess("❌ Match rejected and removed!");
            setTimeout(() => window.close(), 1500);
          })
          .catch(console.error);
      }
    });
  }

  if (skipBtn) {
    skipBtn.addEventListener("click", () => {
      showSuccess("⏭️ Skipped - no action taken");
      setTimeout(() => window.close(), 1000);
    });
  }
});

function showSuccess(message: string) {
  const container = document.querySelector(".confirmation-container");
  if (container) {
    container.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <div style="font-size: 24px; margin-bottom: 10px;">${message}</div>
        <div style="color: #6b7280; font-size: 14px;">This window will close automatically...</div>
      </div>
    `;
  }
}
