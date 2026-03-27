import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { getCurrentSite, formatPrice, type SiteConfig } from "../sites";

type GameState = "guessing" | "result";

function SoldOverlay({ site }: { site: SiteConfig }) {
  const [isOpen, setIsOpen] = useState(true);
  const [gameState, setGameState] = useState<GameState>("guessing");
  const [guess, setGuess] = useState("");
  const [actualPrice, setActualPrice] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);

  const isListing = site.isListingPage(window.location.href);

  useEffect(() => {
    if (!isListing) return;

    const style = document.createElement("style");
    style.id = "sold-price-hider";
    style.textContent = site.priceSelectors
      .map(
        (s) =>
          `${s} { visibility: hidden !important; position: relative !important; }`,
      )
      .join("\n");
    document.head.appendChild(style);

    const price = site.getPrice(document);
    setActualPrice(price);

    return () => {
      const el = document.getElementById("sold-price-hider");
      if (el) el.remove();
    };
  }, [site, isListing]);

  const handleGuess = () => {
    if (!guess || actualPrice === null) return;

    const guessNum = parseInt(guess.replace(/[^\d]/g, ""), 10);
    if (isNaN(guessNum)) return;

    const diff = Math.abs(guessNum - actualPrice);
    const pct = Math.round((diff / actualPrice) * 100);
    setAccuracy(pct);

    const hider = document.getElementById("sold-price-hider");
    if (hider) hider.remove();

    setGameState("result");
  };

  const handleFindNext = () => {
    window.location.href = site.mapUrl;
  };

  const getAccuracyColor = (pct: number) => {
    if (pct <= 5) return "#58cc02";
    if (pct <= 15) return "#FFD93D";
    if (pct <= 30) return "#FF8C42";
    return "#FF6B6B";
  };

  const getAccuracyEmoji = (pct: number) => {
    if (pct === 0) return "\u{1F3C6}";
    if (pct <= 5) return "\u{1F929}";
    if (pct <= 10) return "\u{1F525}";
    if (pct <= 15) return "\u{1F44F}";
    if (pct <= 30) return "\u{1F914}";
    return "\u{1F605}";
  };

  const getAccuracyLabel = (pct: number) => {
    if (pct === 0) return "PERFECT!";
    if (pct <= 5) return "Incredible!";
    if (pct <= 10) return "So close!";
    if (pct <= 15) return "Not bad!";
    if (pct <= 30) return "Nice try!";
    return "Way off!";
  };

  if (!isOpen) {
    return (
      <button className="sold-fab" onClick={() => setIsOpen(true)}>
        <span className="sold-fab-icon">{"\u{1F3E0}"}</span>
        <span className="sold-fab-label">SOLD!</span>
      </button>
    );
  }

  return (
    <div className="sold-overlay-backdrop">
      <div className="sold-card">
        <button className="sold-close" onClick={() => setIsOpen(false)}>
          {"\u2715"}
        </button>

        <div className="sold-card-header">
          <div className="sold-logo">{"\u{1F3E0}"}</div>
          <h2 className="sold-card-title">SOLD!</h2>
        </div>

        <div className="sold-card-body">
          {!isListing ? (
            <div className="sold-browse-msg">
              <div className="sold-emoji-big">{"\u{1F5FA}\u{FE0F}"}</div>
              <p className="sold-prompt">Browse around and pick a house!</p>
              <p className="sold-text-muted">
                Click on a listing to start guessing
              </p>
            </div>
          ) : gameState === "guessing" ? (
            <div className="sold-guess-section">
              {actualPrice === null ? (
                <div className="sold-no-price">
                  <div className="sold-emoji-big">{"\u{1F50D}"}</div>
                  <p className="sold-text-muted">
                    Couldn't find the price on this page
                  </p>
                  <button
                    className="sold-btn sold-btn--secondary"
                    onClick={handleFindNext}
                  >
                    Try another house
                  </button>
                </div>
              ) : (
                <>
                  <div className="sold-emoji-big">{"\u{1F4B0}"}</div>
                  <p className="sold-prompt">
                    How much does this house cost?
                  </p>
                  <div className="sold-input-group">
                    <span className="sold-currency">{site.currency}</span>
                    <input
                      type="text"
                      className="sold-input"
                      placeholder="250,000"
                      value={guess}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^\d]/g, "");
                        if (raw) {
                          setGuess(parseInt(raw, 10).toLocaleString());
                        } else {
                          setGuess("");
                        }
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleGuess()}
                      autoFocus
                    />
                  </div>
                  <button
                    className="sold-btn sold-btn--primary"
                    onClick={handleGuess}
                    disabled={!guess}
                  >
                    Lock it in!
                  </button>
                </>
              )}
            </div>
          ) : (
            actualPrice !== null &&
            accuracy !== null && (
              <div className="sold-result-section">
                <div className="sold-result-emoji">
                  {getAccuracyEmoji(accuracy)}
                </div>
                <div className="sold-result-label">
                  {getAccuracyLabel(accuracy)}
                </div>
                <div
                  className="sold-result-pct"
                  style={{ color: getAccuracyColor(accuracy) }}
                >
                  {accuracy === 0 ? "0%" : `${accuracy}%`}
                  <span className="sold-result-pct-label">off</span>
                </div>

                <div className="sold-result-prices">
                  <div className="sold-result-row">
                    <span className="sold-result-row-label">Your guess</span>
                    <span className="sold-result-row-value">
                      {site.currency}
                      {guess}
                    </span>
                  </div>
                  <div className="sold-result-divider"></div>
                  <div className="sold-result-row">
                    <span className="sold-result-row-label">Actual price</span>
                    <span className="sold-result-row-value sold-result-row-value--actual">
                      {formatPrice(actualPrice, site.currency)}
                    </span>
                  </div>
                </div>

                <button
                  className="sold-btn sold-btn--primary"
                  onClick={handleFindNext}
                >
                  Next house {"\u2192"}
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default function SoldContent() {
  const site = getCurrentSite();
  if (!site) return null;
  return <SoldOverlay site={site} />;
}

function injectStyles() {
  const style = document.createElement("style");
  style.id = "sold-overlay-styles";
  style.textContent = `
    /* Floating action button (closed state) */
    .sold-fab {
      all: initial !important;
      position: fixed !important;
      bottom: 24px !important;
      right: 24px !important;
      z-index: 2147483647 !important;
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      padding: 12px 20px !important;
      background: #fff !important;
      border: 2px solid #e8e8e8 !important;
      border-radius: 50px !important;
      cursor: pointer !important;
      font-family: 'Nunito', sans-serif !important;
      box-shadow: 0 4px 0 #e8e8e8, 0 4px 20px rgba(0,0,0,0.08) !important;
      transition: transform 0.15s ease, box-shadow 0.15s ease !important;
    }

    .sold-fab:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 6px 0 #e8e8e8, 0 6px 24px rgba(0,0,0,0.1) !important;
    }

    .sold-fab:active {
      transform: translateY(1px) !important;
      box-shadow: 0 2px 0 #e8e8e8 !important;
    }

    .sold-fab-icon {
      font-size: 24px !important;
      line-height: 1 !important;
    }

    .sold-fab-label {
      font-size: 16px !important;
      font-weight: 900 !important;
      color: #ff6b6b !important;
      letter-spacing: 2px !important;
      font-family: 'Nunito', sans-serif !important;
    }

    /* Backdrop */
    .sold-overlay-backdrop {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      z-index: 2147483646 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: flex-end !important;
      padding: 24px !important;
      pointer-events: none !important;
    }

    /* Card */
    .sold-card {
      all: initial !important;
      position: relative !important;
      width: 380px !important;
      max-height: calc(100vh - 48px) !important;
      background: #f8f8f8 !important;
      border-radius: 24px !important;
      border: 2px solid #eee !important;
      box-shadow: 0 8px 0 #e0e0e0, 0 20px 60px rgba(0,0,0,0.12) !important;
      display: flex !important;
      flex-direction: column !important;
      overflow: hidden !important;
      font-family: 'Nunito', -apple-system, BlinkMacSystemFont, sans-serif !important;
      color: #2d2d2d !important;
      font-size: 14px !important;
      line-height: 1.4 !important;
      pointer-events: auto !important;
      animation: sold-slideIn 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }

    @keyframes sold-slideIn {
      from { opacity: 0; transform: translateX(40px) scale(0.95); }
      to { opacity: 1; transform: translateX(0) scale(1); }
    }

    .sold-close {
      all: initial !important;
      position: absolute !important;
      top: 16px !important;
      right: 16px !important;
      width: 32px !important;
      height: 32px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      background: #f0f0f0 !important;
      border: none !important;
      border-radius: 50% !important;
      cursor: pointer !important;
      font-size: 14px !important;
      color: #999 !important;
      font-family: 'Nunito', sans-serif !important;
      transition: background 0.15s ease !important;
      z-index: 1 !important;
    }

    .sold-close:hover {
      background: #e8e8e8 !important;
      color: #666 !important;
    }

    .sold-card-header {
      padding: 28px 24px 16px !important;
      text-align: center !important;
      background: #fff !important;
      border-bottom: 2px solid #f0f0f0 !important;
    }

    .sold-logo {
      font-size: 40px !important;
      margin-bottom: 4px !important;
      line-height: 1 !important;
    }

    .sold-card-title {
      all: initial !important;
      display: block !important;
      font-size: 26px !important;
      font-weight: 900 !important;
      color: #ff6b6b !important;
      letter-spacing: 3px !important;
      font-family: 'Nunito', sans-serif !important;
      line-height: 1.2 !important;
      text-align: center !important;
    }

    .sold-card-body {
      padding: 24px !important;
    }

    .sold-emoji-big {
      font-size: 48px !important;
      text-align: center !important;
      margin-bottom: 8px !important;
      line-height: 1 !important;
    }

    .sold-prompt {
      all: initial !important;
      display: block !important;
      font-size: 18px !important;
      font-weight: 800 !important;
      text-align: center !important;
      margin-bottom: 20px !important;
      color: #2d2d2d !important;
      line-height: 1.3 !important;
      font-family: 'Nunito', sans-serif !important;
    }

    .sold-text-muted {
      all: initial !important;
      display: block !important;
      color: #aaa !important;
      text-align: center !important;
      margin-bottom: 16px !important;
      font-weight: 700 !important;
      font-size: 14px !important;
      font-family: 'Nunito', sans-serif !important;
    }

    .sold-input-group {
      display: flex !important;
      align-items: center !important;
      background: #fff !important;
      border: 2px solid #e8e8e8 !important;
      border-radius: 16px !important;
      padding: 4px !important;
      margin-bottom: 16px !important;
      transition: border-color 0.2s ease, box-shadow 0.2s ease !important;
      box-shadow: 0 3px 0 #e8e8e8 !important;
    }

    .sold-input-group:focus-within {
      border-color: #58cc02 !important;
      box-shadow: 0 3px 0 #58cc02 !important;
    }

    .sold-currency {
      all: initial !important;
      padding: 0 4px 0 16px !important;
      font-size: 24px !important;
      font-weight: 900 !important;
      color: #58cc02 !important;
      font-family: 'Nunito', sans-serif !important;
      line-height: 1 !important;
    }

    .sold-input {
      all: initial !important;
      flex: 1 !important;
      background: none !important;
      border: none !important;
      outline: none !important;
      color: #2d2d2d !important;
      font-size: 22px !important;
      font-weight: 800 !important;
      font-family: 'Nunito', sans-serif !important;
      padding: 14px 8px !important;
      width: 100% !important;
      min-width: 0 !important;
    }

    .sold-input::placeholder {
      color: #ddd !important;
    }

    .sold-btn {
      all: initial !important;
      display: block !important;
      width: 100% !important;
      padding: 16px !important;
      border: none !important;
      border-radius: 16px !important;
      font-family: 'Nunito', sans-serif !important;
      font-size: 16px !important;
      font-weight: 800 !important;
      cursor: pointer !important;
      transition: transform 0.1s ease, box-shadow 0.1s ease !important;
      text-transform: uppercase !important;
      letter-spacing: 1px !important;
      text-align: center !important;
      box-sizing: border-box !important;
    }

    .sold-btn:disabled {
      opacity: 0.4 !important;
      cursor: not-allowed !important;
    }

    .sold-btn--primary {
      background: #58cc02 !important;
      color: #fff !important;
      box-shadow: 0 4px 0 #46a302 !important;
    }

    .sold-btn--primary:hover:not(:disabled) {
      transform: translateY(-1px) !important;
      box-shadow: 0 5px 0 #46a302 !important;
    }

    .sold-btn--primary:active:not(:disabled) {
      transform: translateY(2px) !important;
      box-shadow: 0 2px 0 #46a302 !important;
    }

    .sold-btn--secondary {
      background: #fff !important;
      color: #999 !important;
      border: 2px solid #e8e8e8 !important;
      box-shadow: 0 3px 0 #e8e8e8 !important;
    }

    .sold-btn--secondary:hover {
      color: #2d2d2d !important;
    }

    .sold-no-price,
    .sold-browse-msg {
      text-align: center !important;
    }

    .sold-result-section {
      text-align: center !important;
      animation: sold-fadeIn 0.4s ease !important;
    }

    .sold-result-emoji {
      font-size: 56px !important;
      margin-bottom: 8px !important;
      line-height: 1 !important;
      animation: sold-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
    }

    @keyframes sold-pop {
      0% { transform: scale(0); }
      100% { transform: scale(1); }
    }

    .sold-result-label {
      all: initial !important;
      display: block !important;
      font-size: 22px !important;
      font-weight: 900 !important;
      margin-bottom: 4px !important;
      color: #2d2d2d !important;
      font-family: 'Nunito', sans-serif !important;
      text-align: center !important;
    }

    .sold-result-pct {
      all: initial !important;
      display: block !important;
      font-size: 52px !important;
      font-weight: 900 !important;
      margin-bottom: 24px !important;
      line-height: 1 !important;
      font-family: 'Nunito', sans-serif !important;
      text-align: center !important;
    }

    .sold-result-pct-label {
      font-size: 18px !important;
      opacity: 0.5 !important;
      margin-left: 4px !important;
    }

    .sold-result-prices {
      background: #fff !important;
      border-radius: 16px !important;
      padding: 16px 20px !important;
      margin-bottom: 24px !important;
      border: 2px solid #f0f0f0 !important;
      box-shadow: 0 3px 0 #f0f0f0 !important;
      text-align: left !important;
    }

    .sold-result-row {
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      padding: 10px 0 !important;
    }

    .sold-result-divider {
      height: 2px !important;
      background: #f5f5f5 !important;
      border-radius: 1px !important;
    }

    .sold-result-row-label {
      all: initial !important;
      font-size: 13px !important;
      color: #aaa !important;
      font-weight: 700 !important;
      text-transform: uppercase !important;
      letter-spacing: 0.5px !important;
      font-family: 'Nunito', sans-serif !important;
    }

    .sold-result-row-value {
      all: initial !important;
      font-size: 17px !important;
      font-weight: 800 !important;
      color: #2d2d2d !important;
      font-family: 'Nunito', sans-serif !important;
    }

    .sold-result-row-value--actual {
      color: #58cc02 !important;
    }

    .sold-guess-section {
      animation: sold-fadeIn 0.3s ease !important;
    }

    @keyframes sold-fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

function init() {
  const site = getCurrentSite();
  if (!site) return;

  chrome.storage.local.get(["soldActive"], (result) => {
    if (!result.soldActive) return;

    // Load Nunito font
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap";
    document.head.appendChild(link);

    injectStyles();

    const mountPoint = document.createElement("div");
    mountPoint.id = "sold-extension-root";
    document.body.appendChild(mountPoint);

    const root = ReactDOM.createRoot(mountPoint);
    root.render(
      <React.StrictMode>
        <SoldOverlay site={site} />
      </React.StrictMode>,
    );
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
