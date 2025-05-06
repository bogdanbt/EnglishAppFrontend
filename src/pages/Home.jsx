import React from "react";

const Home = () => {
  return (
    <div style={{ background: "#FFE4EC",}}>
   
    <div
      style={{
        minHeight: "100vh",
        
        background: "#FFE4EC",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          padding: "3rem",
          maxWidth: "800px",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "2.8rem", color: "#FF6D7A", fontWeight: 700 }}>
          Welcome to Vocally!
        </h1>
        <p style={{ fontSize: "1.2rem", color: "#444", marginTop: "1.5rem" }}>
          <strong>Vocally</strong> helps you learn English vocabulary through two powerful modes:
        </p>
        <p style={{ fontSize: "1.1rem", marginTop: "1rem", color: "#5a5a5a" }}>
          🌱 <strong>Collect Mode:</strong> Build your personal word collection. Each word you save includes its meaning, usage examples, and a translation.
        </p>
        <p style={{ fontSize: "1.1rem", marginTop: "1rem", color: "#5a5a5a" }}>
          🎮 <strong>Game Mode:</strong> Practice words in context through smart games. Complete sentences by choosing the correct word, fill in missing words, and master grammar with fun and interaction.
        </p>
        <p style={{ marginTop: "1.5rem", fontSize: "1rem", color: "#666" }}>
          Designed for smart, contextual learning — so you remember not just words, but how to use them.
        </p>
      </div>
    </div>
    </div>
  );
};

export default Home;
