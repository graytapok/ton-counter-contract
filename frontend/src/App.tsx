import { TonConnectButton } from "@tonconnect/ui-react";
import { useMainContract } from "./hooks/useMainContract";
import { useTonConnect } from "./hooks/useTonConnect";

function App() {
  const { connected } = useTonConnect();
  const {
    contract_address,
    counter_value,
    recent_sender,
    owner_address,
    contract_balance,
    sendIcrement,
  } = useMainContract();
  return (
    <div>
      <div style={{ marginLeft: "500px" }}>
        <TonConnectButton />
      </div>
      {connected && <a onClick={sendIcrement}>Increment</a>}
      <div>
        <div className="Card">
          <b>Our contract Address</b>
          <div className="Hint">{contract_address?.toString()}</div>
          <b>Our contract Balance</b>
          <div className="Hint">{contract_balance}</div>
        </div>

        <div className="Card">
          <b>Counter Value</b>
          <div>{counter_value ?? "Loading..."}</div>
        </div>

        <div className="Card">
          <b>Recent Sender Address</b>
          <div>{recent_sender?.toString() ?? "Loading..."}</div>
        </div>

        <div className="Card">
          <b>Owner Address</b>
          <div>{owner_address?.toString() ?? "Loading..."}</div>
        </div>
      </div>
    </div>
  );
}

export default App;
