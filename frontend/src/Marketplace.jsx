import React, { useState } from "react";
import "./Marketplace.css";

export default function Marketplace({ onBack }) {
  // form state (Create Listing panel)
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("General");
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState(null);

  // search state (Search panel on the left)
  const [searchText, setSearchText] = useState("");
  const [searchCategory, setSearchCategory] = useState("All");

  // submit for marketplace post
  const handleSubmit = (e) => {
    e.preventDefault();

    const listingData = {
      title,
      price,
      category,
      description,
      photoName: photoFile ? photoFile.name : null,
      createdAt: new Date().toISOString(),
    };

    console.log("New listing:", listingData);
    alert("Listing posted (demo)");

    // clear form
    setTitle("");
    setPrice("");
    setCategory("General");
    setDescription("");
    setPhotoFile(null);
  };

  // submit for search (left panel)
  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Search for:", {
      text: searchText,
      category: searchCategory,
    });
    alert("Search coming soon (demo)");
  };

  return (
    <div className="marketplace-page">
      {/* HEADER / HERO */}
      <header className="marketplace-header">
        <div className="marketplace-header-inner">

          {/* LEFT SIDE: badge + title + blurb */}
          <div className="marketplace-heading-block">
            <div className="marketplace-badge-row">
              <span className="cart-emoji">🛒</span>
              <span className="marketplace-badge">
                KNIGHTHAVEN MARKETPLACE
              </span>
            </div>

            <h1 className="marketplace-title">
              Buy, sell, trade, offer services
            </h1>

            <p className="marketplace-subtitle">
              Student-to-student listings. Local only. Meet in public /
              <br />
              on campus.
            </p>
          </div>

          {/* RIGHT SIDE: Back button */}
          <button
            className="back-btn"
            onClick={() => {
              if (onBack) {
                onBack();
              } else {
                // fallback if parent didn't pass onBack
                window.location.reload();
              }
            }}
          >
            ← Back to Home
          </button>
        </div>
      </header>

      {/* MAIN BODY: 3 COLUMNS */}
      <section className="marketplace-body">
        {/* ========== LEFT COLUMN: SEARCH / FILTER ========== */}
        <aside className="search-card">
          <div className="search-card-header">
            <span className="search-icon">🔍</span>
            <span className="search-heading-label">SEARCH</span>
          </div>

          <h2 className="search-title">Looking for something?</h2>
          <p className="search-desc">
            Search the marketplace by item, service, category, etc.
          </p>

          <form onSubmit={handleSearch} className="search-form">
            {/* Search text */}
            <label className="field-label">
              What do you need?
              <input
                className="input-field"
                type="text"
                placeholder="Ex: calculator, ride, tutoring..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </label>

            {/* Search category */}
            <label className="field-label">
              Category
              <select
                className="input-field"
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
              >
                <option>All</option>
                <option>Textbooks / Study</option>
                <option>Electronics</option>
                <option>Clothing / Dorm</option>
                <option>Services</option>
                <option>Rides / Carpool</option>
              </select>
            </label>

            <button type="submit" className="search-btn">
              Search
            </button>

            <p className="search-hint">
              (Demo only — results feed coming soon)
            </p>
          </form>
        </aside>

        {/* ========== MIDDLE COLUMN: LISTINGS FEED (UNCHANGED) ========== */}
        <main className="listings-feed">
          <h2 className="feed-heading">LISTINGS</h2>

          {/* Listing #1 */}
          <div className="feed-card">
            <div className="feed-card-top">
              <div className="feed-title-row">
                <span className="feed-title">TI-84 Plus Calculator</span>
                <span className="feed-price">$40</span>
              </div>
              <div className="feed-meta">
                <span className="feed-badge">Verified Knight</span>
                <span className="feed-dot">•</span>
                <span className="feed-cat">Electronics</span>
                <span className="feed-dot">•</span>
                <span className="feed-time">2h ago</span>
              </div>
              <div className="feed-desc">
                Works perfectly, lightly used for Calc 1 and Calc 2. Pickup
                near UCF Library.
              </div>
            </div>
          </div>

          {/* Listing #2 */}
          <div className="feed-card">
            <div className="feed-card-top">
              <div className="feed-title-row">
                <span className="feed-title">PC Repair / Custom Builds</span>
                <span className="feed-price">$25/hr</span>
              </div>
              <div className="feed-meta">
                <span className="feed-badge alt">Service</span>
                <span className="feed-dot">•</span>
                <span className="feed-cat">Tech Help</span>
                <span className="feed-dot">•</span>
                <span className="feed-time">Today</span>
              </div>
              <div className="feed-desc">
                I'll diagnose, clean, and upgrade gaming PCs. Meet at Student Union.
              </div>
            </div>
          </div>

          {/* Listing #3 */}
          <div className="feed-card">
            <div className="feed-card-top">
              <div className="feed-title-row">
                <span className="feed-title">
                  Physics I + Chem I Textbooks
                </span>
                <span className="feed-price">$30 bundle</span>
              </div>
              <div className="feed-meta">
                <span className="feed-badge">Verified Knight</span>
                <span className="feed-dot">•</span>
                <span className="feed-cat">Textbooks / Study</span>
                <span className="feed-dot">•</span>
                <span className="feed-time">1d ago</span>
              </div>
              <div className="feed-desc">
                Highlighted but clean. Super helpful for first-year STEM.
                Can meet in Engineering 2 atrium.
              </div>
            </div>
          </div>

          {/* Listing #4 */}
          <div className="feed-card">
            <div className="feed-card-top">
              <div className="feed-title-row">
                <span className="feed-title">Ride to Campus Sat 9am</span>
                <span className="feed-price">Gas split</span>
              </div>
              <div className="feed-meta">
                <span className="feed-badge alt">Ask</span>
                <span className="feed-dot">•</span>
                <span className="feed-cat">Carpool</span>
                <span className="feed-dot">•</span>
                <span className="feed-time">Just now</span>
              </div>
              <div className="feed-desc">
                Need a ride from Avalon Park to main campus before 9am Saturday.
                I'll cover gas.
              </div>
            </div>
          </div>
        </main>

        {/* ========== RIGHT COLUMN: CREATE A LISTING (MOVED HERE) ========== */}
        <form className="listing-card" onSubmit={handleSubmit}>
          <div className="listing-card-header">
            <span className="listing-icon">📢</span>
            <span className="listing-heading-label">
              CREATE A LISTING
            </span>
          </div>

          <h2 className="listing-title">Got something to sell or offer?</h2>
          <p className="listing-desc">
            Fill this out to post it to the marketplace feed.
          </p>

          {/* Title */}
          <label className="field-label">
            Title
            <input
              className="input-field"
              type="text"
              placeholder="Ex: 'TI-84 Calculator' or 'Math Tutoring'"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>

          {/* Price */}
          <label className="field-label">
            Price
            <input
              className="input-field"
              type="text"
              placeholder="Ex: 40, 10/hr, free"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </label>

          {/* Category */}
          <label className="field-label">
            Category
            <select
              className="input-field"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>General</option>
              <option>Textbooks / Study</option>
              <option>Electronics</option>
              <option>Clothing / Dorm</option>
              <option>Services (tutoring, rides, etc.)</option>
            </select>
          </label>

          {/* Photo upload */}
          <label className="field-label">
            Photo (optional)
            <div className="file-row">
              <div className="file-fake-input">
                {photoFile
                  ? photoFile.name
                  : "Upload a photo of your item / service"}
              </div>
              <label className="file-btn">
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setPhotoFile(file || null);
                  }}
                />
                Choose File
              </label>
            </div>
          </label>

          {/* Description */}
          <label className="field-label">
            Description
            <textarea
              className="textarea-field"
              rows={4}
              placeholder="Condition, pickup location, when you're available, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </label>

          {/* Submit */}
          <button type="submit" className="submit-listing-btn">
            Post Listing
          </button>
        </form>
      </section>
    </div>
  );
}
