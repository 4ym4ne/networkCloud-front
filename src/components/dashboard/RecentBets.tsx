import React from "react";

type Bet = {
  id: number;
  user: string;
  market: string;
  stake: string;
  result: "Win" | "Lose" | "Pending";
};

const mockBets: Bet[] = [
  { id: 1, user: "alice", market: "Team A vs Team B", stake: "$25", result: "Win" },
  { id: 2, user: "bob", market: "Over 2.5 Goals", stake: "$10", result: "Lose" },
  { id: 3, user: "carol", market: "Player X to score", stake: "$5", result: "Pending" },
];

export default function RecentBets(): React.JSX.Element {
  return (
    <div>
      <ul className="divide-y">
        {mockBets.map((bet) => (
          <li key={bet.id} className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm font-medium">{bet.user}</div>
              <div className="text-xs text-muted-foreground">{bet.market}</div>
            </div>

            <div className="ml-4 text-right">
              <div className="text-sm">{bet.stake}</div>
              <div
                className={`text-xs mt-1 ${
                  bet.result === "Win" ? "text-green-500" : bet.result === "Lose" ? "text-red-500" : "text-yellow-500"
                }`}
              >
                {bet.result}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
