import { useState } from "react";

export default function Login({ onLogin }) {
  const [status, setStatus] = useState("");

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        setStatus("Please install MetaMask first");
        return;
      }
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length > 0) {
        onLogin(accounts[0]);
      } else {
        setStatus("No accounts found");
      }
    } catch (err) {
      setStatus("Connection failed: " + (err.message || err));
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Blockchain Document Verifier</h1>
      <p style={styles.subtitle}>Login with MetaMask to continue</p>

      <button style={styles.button} onClick={connectWallet}>
        Connect MetaMask
      </button>

      {status && <p style={styles.error}>{status}</p>}
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#0b0f1a",
    color: "white",
  },
  title: { fontSize: "28px", marginBottom: "10px" },
  subtitle: { fontSize: "16px", marginBottom: "20px", color: "#aaa" },
  button: {
    background: "linear-gradient(90deg, #7c3aed, #5b21b6)",
    border: "none",
    borderRadius: "12px",
    padding: "14px 22px",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "16px",
  },
  error: { marginTop: "15px", color: "red" },
};
