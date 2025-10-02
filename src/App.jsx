import { useEffect, useMemo, useRef, useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contractInfo";
import { uploadFileToIPFS } from "./ipfs";

// --- helpers ---------------------------------------------------------------
async function fileToSha256Hex(file) {
  const buf = await file.arrayBuffer();
  const hashBuf = await crypto.subtle.digest("SHA-256", buf);
  return "0x" + [...new Uint8Array(hashBuf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function shorten(addr, size = 6) {
  if (!addr) return "";
  return addr.slice(0, 2 + size) + "…" + addr.slice(-size);
}

function formatTs(ts) {
  const d = new Date(ts);
  return d.toLocaleString();
}

// --- main component --------------------------------------------------------
export default function App() {
  const [account, setAccount] = useState("");      // selected MetaMask account
  const [chainId, setChainId] = useState("");      // network id
  const [status, setStatus] = useState("");
  const [statusKind, setStatusKind] = useState("info"); // info | success | error
  const [myDocs, setMyDocs] = useState([]);
const [loadingDocs, setLoadingDocs] = useState(false);

function ipfsGateway(u) {
  if (!u) return "";
  return u.startsWith("ipfs://") ? `https://ipfs.io/ipfs/${u.slice(7)}` : u;
}

  const [file, setFile] = useState(null);
  const [hash, setHash] = useState("");
  const [uri, setUri] = useState("");
  const [gateway, setGateway] = useState("");
  const [working, setWorking] = useState(false);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("regHistory") || "[]"); } catch { return []; }
  });

  const fileInput = useRef(null);

  // Provider comes from MetaMask
  const provider = useMemo(() => {
    if (!window.ethereum) return null;
    return new ethers.BrowserProvider(window.ethereum);
  }, []);

  // Read-only contract (for verify). For writes we’ll connect a signer.
  const contract = useMemo(() => {
    if (!provider) return null;
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  }, [provider]);

  // --- Ethereum wiring (no auto-pick of accounts) ---
  useEffect(() => {
    if (!window.ethereum) return;

    // only read chain id on load
    window.ethereum.request({ method: "eth_chainId" }).then(setChainId);

    const handleAccountsChanged = (accs) => {
      setAccount(accs?.[0] || "");
      loadMyDocs();
    };
    const handleChainChanged = (hexId) => {
      setChainId(hexId);
      // full reload so ethers/MetaMask point to correct net
      window.location.reload();
    };

    window.ethereum.on?.("accountsChanged", handleAccountsChanged);
    window.ethereum.on?.("chainChanged", handleChainChanged);
    return () => {
      window.ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener?.("chainChanged", handleChainChanged);
    };
  }, []);

  const correctNetwork = chainId === "0xaa36a7"; // Sepolia 11155111

  // --- UI helpers ---
  function toast(msg, kind = "info") {
    setStatus(msg);
    setStatusKind(kind);
    if (msg) {
      clearTimeout(toast._t);
      toast._t = setTimeout(() => setStatus(""), 4000);
    }
  }

  // --- Connect / Disconnect ---
  async function connectWallet() {
    try {
      if (!window.ethereum) return toast("Please install MetaMask", "error");
      // This opens the MetaMask account picker. Tick ONLY the account you want.
      const accs = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accs?.[0] || "");
      const id = await window.ethereum.request({ method: "eth_chainId" });
      setChainId(id);
      toast("Wallet connected", "success");
      await loadMyDocs();
    } catch (e) {
      toast(e?.message || "Wallet connection failed", "error");
    }
  }

  function disconnectWallet() {
    setAccount("");
    toast("Disconnected. If it reconnects automatically, clear it in MetaMask > Connected sites.", "info");
  }

  // --- File selection / hashing ---
  async function onSelectFile(f) {
    setFile(f);
    setHash("");
    setUri("");
    setGateway("");
    if (!f) return;
    toast("Computing SHA-256…", "info");
    const h = await fileToSha256Hex(f);
    setHash(h);
    toast("Hash ready", "success");
  }

  async function onDrop(e) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) onSelectFile(f);
  }

  // --- Actions ---
  async function registerNow() {
    if (!provider || !account) return toast("Connect wallet first", "error");
    if (!correctNetwork) return toast("Switch MetaMask to Sepolia (chainId 11155111)", "error");
    if (!hash) return toast("Choose a file first", "error");
    if (!uri) return toast("Upload to IPFS first", "error");
    try {
      setWorking(true);
      // Let ethers use the currently active MetaMask account
      const signer = await provider.getSigner(); // no param = active account
      const c = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      toast("Sending transaction…", "info");
      const tx = await c.register(hash, uri);
      await tx.wait();

      toast("Registered ✅", "success");
      await loadMyDocs();
      const entry = { hash, when: Date.now(), txHash: tx.hash, owner: account, uri };
      const next = [entry, ...history].slice(0, 50);
      setHistory(next);
      localStorage.setItem("regHistory", JSON.stringify(next));
    } catch (e) {
      const msg = e?.reason || e?.shortMessage || e?.message || "Failed";
      toast(msg, "error");
    } finally {
      setWorking(false);
    }
  }

  async function verifyNow() {
    if (!contract) return toast("Connect wallet first", "error");
    if (!hash) return toast("Choose a file first", "error");
    try {
      setWorking(true);
      const ok = await contract.isRegistered(hash);
      toast(ok ? "This file WAS registered ✅" : "Not found ❌", ok ? "success" : "error");
    } catch (e) {
      toast(e?.message || "Verification failed", "error");
    } finally {
      setWorking(false);
    }
  }
  
  async function loadMyDocs() {
  try {
    if (!contract || !account) { setMyDocs([]); return; }
    setLoadingDocs(true);
    const hashes = await contract.getUserDocs(account);
    const rows = await Promise.all(
      hashes.map(async (h) => {
        const [uri, exists] = await contract.docs(h);
        return { hash: h, uri, exists, gateway: ipfsGateway(uri) };
      })
    );
    setMyDocs(rows);
  } catch (e) {
    toast(e?.message || "Failed to load on-chain documents", "error");
  } finally {
    setLoadingDocs(false);
  }
}


  function copyHash() {
    if (!hash) return;
    navigator.clipboard.writeText(hash);
    toast("Hash copied", "success");
  }

  function clearHistory() {
    localStorage.removeItem("regHistory");
    setHistory([]);
  }

  // --- UI ---
  return (
    <div>
      <style>{`
        :root{
          --bg:#0b0f1a; --panel:#11182a; --panel-2:#0f1525; --text:#eef2ff; --muted:#96a0b8; --brand:#7c3aed; --ok:#10b981; --bad:#ef4444; --warn:#f59e0b;
          --ring:rgba(124,58,237,0.4);
        }
        *{box-sizing:border-box}
        body{background:var(--bg); color:var(--text); font-family: ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;}
        .wrap{max-width:1080px; margin:32px auto; padding:0 20px}
        .card{background: linear-gradient(180deg, var(--panel), var(--panel-2)); border:1px solid rgba(255,255,255,0.06); box-shadow: 0 10px 30px rgba(0,0,0,0.35); border-radius:20px;}
        .row{display:grid; grid-template-columns: 1.2fr 1fr; gap:20px}
        @media (max-width: 900px){ .row{grid-template-columns:1fr;}}
        header{display:flex; align-items:center; justify-content:space-between; margin-bottom:18px}
        .title{font-size:28px; font-weight:800; letter-spacing:0.2px}
        .sub{color:var(--muted); font-size:14px}
        .badge{padding:6px 10px; border-radius:999px; font-size:12px; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.03)}
        .btn{appearance:none; border:none; border-radius:12px; padding:12px 16px; font-weight:700; cursor:pointer; transition:transform .02s ease; color:white;}
        .btn:active{transform:translateY(1px)}
        .btn.brand{background: linear-gradient(90deg, var(--brand), #5b21b6)}
        .btn.ghost{background:transparent; border:1px solid rgba(255,255,255,0.12)}
        .grid{display:grid; gap:16px}
        .uibox{padding:22px}
        .drop{border:2px dashed rgba(255,255,255,0.12); border-radius:16px; padding:26px; text-align:center; color:var(--muted)}
        .drop:hover{border-color: var(--brand)}
        .drop input{display:none}
        .hashRow{display:flex; gap:10px; align-items:center; word-break:break-all}
        .k{color:var(--muted); font-size:13px}
        .v{font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;}
        .actions{display:flex; gap:12px; flex-wrap:wrap}
        .status{margin-top:12px; padding:12px 14px; border-radius:12px; font-weight:600}
        .status.info{background:rgba(124,58,237,0.1); border:1px solid var(--ring)}
        .status.success{background:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.35)}
        .status.error{background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.35)}
        table{width:100%; border-collapse:collapse;}
        th,td{padding:12px 10px; text-align:left; border-bottom:1px solid rgba(255,255,255,0.06)}
        th{color:var(--muted); font-weight:700; font-size:12px; letter-spacing:0.08em; text-transform:uppercase}
        .pill{display:inline-block; padding:6px 10px; border-radius:999px; background:rgba(255,255,255,0.06); font-size:12px}
        .hint{color:var(--muted); font-size:13px}
        .warn{color:var(--warn)}
      `}</style>

      <div className="wrap">
        <header>
          <div>
            <div className="title">Blockchain Document Verifier</div>
            <div className="sub">Hash-only proof of existence • Sepolia Testnet</div>
          </div>

          <div style={{display:"flex", gap:10, alignItems:"center"}}>
            {account ? (
              <>
                <span className="badge">
                  {shorten(account)} {correctNetwork ? "• Sepolia" : <span className="warn">• wrong net</span>}
                </span>
                <button className="btn ghost" onClick={disconnectWallet}>Logout</button>
              </>
            ) : (
              <button className="btn brand" onClick={connectWallet}>Connect Wallet</button>
            )}
          </div>
        </header>

        {!correctNetwork && account && (
          <<div className="status error">Please switch MetaMask to <b>Sepolia (chainId 11155111)</b>.</div>
        )}

        <div className="row">
          {/* Left: upload + actions */}
          <section className="card uibox grid">
            <div className="drop"
                 onDragOver={(e)=>e.preventDefault()}
                 onDrop={onDrop}
                 onClick={() => fileInput.current?.click()}>
              <strong>Drag & drop</strong> a file here, or <u>click to choose</u>.
              <div className="hint" style={{marginTop:8}}>
                We compute the SHA-256 fingerprint <em>in your browser</em> (nothing is uploaded).
              </div>
              <input ref={fileInput} type="file" onChange={(e)=>onSelectFile(e.target.files?.[0])} />
            </div>

            <div className="grid" style={{gap:10}}>
              <div className="k">Selected file</div>
              <div className="v">{file ? file.name : "(none)"}</div>
            </div>

            <div className="grid" style={{gap:10}}>
              <div className="k">SHA-256 hash</div>
              <div className="hashRow">
                <div className="v" style={{flex:1}}>{hash || "(choose a file)"}</div>
                <button className="btn ghost" onClick={copyHash} disabled={!hash}>Copy</button>
              </div>
            </div>

            <div className="actions">
              <button className="btn brand" onClick={registerNow} disabled={!account || !hash || !uri || !correctNetwork || working}>
                {working ? "Working…" : "Register (hash + URI)"}
              </button>
              <button className="btn ghost" onClick={verifyNow} disabled={!hash || working}>Verify</button>
            </div>

            {status && <div className={`status ${statusKind}`}>{status}</div>}

            <div className="actions">
              <button className="btn ghost" disabled={!file || working} onClick={async () => {
                try {
                  setWorking(true);
                  toast("Uploading to IPFS…", "info");
                  const { uri, gateway } = await uploadFileToIPFS(file);
                  setUri(uri);
                  setGateway(gateway);
                  toast("Uploaded to IPFS ✅", "success");
                } catch (e) {
                  toast(e.message || "IPFS upload failed", "error");
                } finally {
                  setWorking(false);
                }
              }}>
                Upload to IPFS
              </button>
            </div>

            {uri && (
              <div className="grid" style={{gap:10}}>
                <div className="k">File URI</div>
                <div className="v">
                  {uri} {gateway ? (<a href={gateway} target="_blank" rel="noreferrer" style={{marginLeft:10}}>Open</a>) : null}
                </div>
              </div>
            )}
          </section>

          {/* Right: details + history */}
          <aside className="card uibox grid" style={{gap:16}}>
           <div>
             <div className="k">Contract</div>
               <div className="v">
                <a
                  href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noreferrer"
                >
                 {CONTRACT_ADDRESS}
                </a>
              </div>
            </div>

            <div>
              <div className="k">Network</div>
              <div className="v">{correctNetwork ? "Sepolia" : "Not Sepolia"}</div>
            </div>
            <div>
              <div className="k">Connected To (current)</div>
              <div className="v">{account || "(not connected)"}</div>
            </div>

            <div style={{marginTop:8, display:"flex", alignItems:"center", justifyContent:"space-between"}}>
  <div className="k">My Documents (on-chain)</div>
  <button className="btn ghost" onClick={loadMyDocs} disabled={loadingDocs || !account}>
    {loadingDocs ? "Loading…" : "Refresh"}
  </button>
</div>

<div className="card" style={{padding:0, background:"transparent"}}>
  <table>
    <thead>
      <tr>
        <th>Hash (short)</th>
        <th>URI</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      {(!myDocs || myDocs.length === 0) && (
        <tr>
          <td colSpan="3" className="hint" style={{padding:20}}>
            {account ? "(No on-chain docs yet)" : "(Connect wallet to load)"}
          </td>
        </tr>
      )}
      {myDocs.map((d, i) => (
        <tr key={i}>
          <td><span className="pill">{shorten(d.hash, 8)}</span></td>
          <td className="v">
            {d.uri ? (
              d.gateway ? <a href={d.gateway} target="_blank" rel="noreferrer">{d.uri}</a> : d.uri
            ) : "-"}
          </td>
          <td>{d.exists ? "✅" : "❌"}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>