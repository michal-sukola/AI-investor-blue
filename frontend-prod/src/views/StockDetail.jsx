import { useEffect, useState } from "react";
import { getSymbolHistory, getTrades, getSnapshots } from "../api.js";
import { Loading, ErrorState } from "../components/States.jsx";
import { usd, num } from "../components/format.js";
import { StockPriceChart } from "../components/Charts.jsx";

export default function StockDetail({ symbol, onClose, days = 30 }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [series, setSeries] = useState([]);
  const [trades, setTrades] = useState([]);
  const [snapshots, setSnapshots] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const [histRes, tradesRes, snapsRes] = await Promise.all([
          getSymbolHistory(symbol, days),
          getTrades(),
          getSnapshots(60),
        ]);
        if (!mounted) return;
        setSeries(histRes.series.map((d) => ({ date: d.date, close: d.close })));
        setTrades(tradesRes.filter((t) => t.symbol === symbol));
        setSnapshots(snapsRes);
        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        setError(err);
        setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, [symbol, days]);

  if (loading) return <Loading label={`Loading ${symbol} history…`} />;
  if (error) return <ErrorState error={error} />;

  // Build per-day shares held using snapshots (most recent first). We'll map
  // snapshot timestamps to the nearest date in `series` and compute market value.
  const dateToClose = Object.fromEntries(series.map((s) => [s.date, s.close]));
  const rows = snapshots.runs ? [] : []; // default shape when API returns object vs array
  // The GET /snapshots stub returns an array; our call gets that array directly.
  const snapsArray = Array.isArray(snapshots) ? snapshots : (snapshots.runs || snapshots);

  const historyRows = snapsArray
    .map((snap) => {
      const date = snap.timestamp ? snap.timestamp.slice(0, 10) : snap.date;
      const pos = (snap.positions || []).find((p) => p.symbol === symbol);
      const shares = pos ? pos.shares : 0;
      const close = dateToClose[date] ?? null;
      const marketValue = close != null ? close * shares : null;
      return { date, shares, close, marketValue };
    })
    .filter((r) => r.date)
    .slice(0, days);

  return (
    <div className="overlay">
      <div className="panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>{symbol} — Position detail</h2>
          <button onClick={onClose}>Close</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 12 }}>
          <div>
            <StockPriceChart series={series} trades={trades.map((t) => ({ date: t.date, price: t.price, side: t.side }))} />
          </div>
          <div>
            <h3>Shares / Market value by day</h3>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Shares</th>
                  <th>Close</th>
                  <th>Market value</th>
                </tr>
              </thead>
              <tbody>
                {historyRows.map((r) => (
                  <tr key={r.date}>
                    <td>{r.date}</td>
                    <td className="mono">{num(r.shares)}</td>
                    <td className="mono">{r.close != null ? usd(r.close) : "—"}</td>
                    <td className="mono">{r.marketValue != null ? usd(r.marketValue) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h4>Trades</h4>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Side</th>
                  <th>Shares</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t) => (
                  <tr key={`${t.date}-${t.side}-${t.price}`}>
                    <td>{t.date}</td>
                    <td>{t.side}</td>
                    <td className="mono">{num(t.shares)}</td>
                    <td className="mono">{usd(t.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
