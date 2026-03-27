import React from "react";
import "./styles.css";

const countries = [
  {
    id: "immoweb",
    country: "Belgium",
    flag: "\u{1F1E7}\u{1F1EA}",
    site: "Immoweb",
    mapUrl:
      "https://www.immoweb.be/en/map/house/for-sale?countries=BE&page=1&orderBy=relevance",
  },
  {
    id: "funda",
    country: "Netherlands",
    flag: "\u{1F1F3}\u{1F1F1}",
    site: "Funda",
    mapUrl:
      "https://www.funda.nl/en/zoeken/kaart/koop?selected_area=[%22nl%22]&zoom=8&centerLat=52.1176&centerLng=5.3773",
  },
  {
    id: "rightmove",
    country: "United Kingdom",
    flag: "\u{1F1EC}\u{1F1E7}",
    site: "Rightmove",
    mapUrl: "https://www.rightmove.co.uk/property-for-sale/map.html",
  },
];

export default function PopupApp() {
  const handleCountryClick = (country: (typeof countries)[0]) => {
    chrome.storage.local.set(
      { soldActive: true, selectedCountry: country.id },
      () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            chrome.tabs.update(tabs[0].id, { url: country.mapUrl });
          }
          window.close();
        });
      },
    );
  };

  return (
    <div className="popup">
      <div className="popup-header">
        <div className="popup-logo">{"\u{1F3E0}"}</div>
        <h1 className="popup-title">SOLD!</h1>
        <p className="popup-subtitle">Can you guess the price?</p>
      </div>

      <p className="popup-instruction">Pick a country to start</p>

      <div className="popup-countries">
        {countries.map((c) => (
          <button
            key={c.id}
            className="country-card"
            onClick={() => handleCountryClick(c)}
          >
            <span className="country-flag">{c.flag}</span>
            <div className="country-info">
              <span className="country-name">{c.country}</span>
              <span className="country-site">{c.site}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
