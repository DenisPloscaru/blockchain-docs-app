export default function Help() {
  return (
    <div className="wrap">
      <div className="card" style={{padding:22}}>
        <h1 style={{marginTop:0}}>How to Use</h1>
        <ol>
          <li>Connect MetaMask (Sepolia).</li>
          <li>Select a file — SHA-256 is computed locally.</li>
          <li>Upload to IPFS.</li>
          <li>Click <b>Register</b> to anchor hash + URI on-chain.</li>
          <li>Later, select the same file and press <b>Verify</b>.</li>
        </ol>
        <h2>When it helps</h2>
        <ul>
          <li>Proof-of-existence for contracts, invoices, designs, photos.</li>
          <li>Timestamping drafts or IP before publication.</li>
          <li>Sharing files with verifiable authenticity.</li>
        </ul>
        <p className="hint">Only the hash + URI are on-chain; the file itself is on IPFS.</p>
      </div>
    </div>
  );
}