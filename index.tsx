import React, { useState, useEffect } from "react";

type Action = "attack" | "defend" | "special";

interface Fighter {
  name: string;
  hp: number;
  maxHp: number;
  energy: number;
  defending: boolean;
}

export default function RareFriendDuel() {
  const [player, setPlayer] = useState<Fighter>({
    name: "Your Rare Friend",
    hp: 100,
    maxHp: 100,
    energy: 100,
    defending: false,
  });

  const [enemy, setEnemy] = useState<Fighter>({
    name: "AI Rare Friend",
    hp: 100,
    maxHp: 100,
    energy: 100,
    defending: false,
  });

  const [rf, setRf] = useState(100);
  const [boost, setBoost] = useState(0);
  const [turn, setTurn] = useState<"player" | "enemy">("player");
  const [battleOver, setBattleOver] = useState(false);
  const [winner, setWinner] = useState<"player" | "enemy" | null>(null);
  const [log, setLog] = useState<string[]>(["Battle started! Choose your action."]);

  const addLog = (text: string) => {
    setLog((prev) => [...prev.slice(-5), text]);
  };

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  const checkWinner = (pHp: number, eHp: number) => {
    if (eHp <= 0) {
      setBattleOver(true);
      setWinner("player");
      addLog("VICTORY! Your Rare Friend wins!");
      return true;
    }
    if (pHp <= 0) {
      setBattleOver(true);
      setWinner("enemy");
      addLog("DEFEAT! AI wins.");
      return true;
    }
    return false;
  };

  const playerAttack = () => {
    if (battleOver || turn !== "player") return;
    const dmg = random(12, 22) + boost;
    const finalDmg = enemy.defending ? Math.floor(dmg * 0.5) : dmg;
    const newHp = clamp(enemy.hp - finalDmg, 0, 100);
    setEnemy((e) => ({ ...e, hp: newHp, defending: false }));
    setPlayer((p) => ({ ...p, defending: false, energy: clamp(p.energy + 10, 0, 100) }));
    addLog(`You attack for ${finalDmg} damage!`);
    if (checkWinner(player.hp, newHp)) return;
    setTurn("enemy");
    setTimeout(enemyTurn, 700);
  };

  const playerDefend = () => {
    if (battleOver || turn !== "player") return;
    setPlayer((p) => ({ ...p, defending: true, energy: clamp(p.energy + 15, 0, 100) }));
    addLog("You take a defensive stance.");
    setTurn("enemy");
    setTimeout(enemyTurn, 700);
  };

  const playerSpecial = () => {
    if (battleOver || turn !== "player") return;
    if (player.energy < 40) {
      addLog("Not enough energy!");
      return;
    }
    const dmg = random(25, 40) + boost;
    const finalDmg = enemy.defending ? Math.floor(dmg * 0.5) : dmg;
    const newHp = clamp(enemy.hp - finalDmg, 0, 100);
    setEnemy((e) => ({ ...e, hp: newHp, defending: false }));
    setPlayer((p) => ({ ...p, energy: p.energy - 40, defending: false }));
    addLog(`SPECIAL hits for ${finalDmg} damage!`);
    if (checkWinner(player.hp, newHp)) return;
    setTurn("enemy");
    setTimeout(enemyTurn, 700);
  };

  const enemyTurn = () => {
    if (battleOver) return;
    const r = Math.random();
    let action: Action = "attack";
    if (enemy.energy >= 40 && r > 0.6) action = "special";
    else if (r < 0.25) action = "defend";

    if (action === "attack") {
      const dmg = random(12, 22);
      const finalDmg = player.defending ? Math.floor(dmg * 0.5) : dmg;
      const newHp = clamp(player.hp - finalDmg, 0, 100);
      setPlayer((p) => ({ ...p, hp: newHp, defending: false }));
      setEnemy((e) => ({ ...e, energy: clamp(e.energy + 10, 0, 100), defending: false }));
      addLog(`AI attacks for ${finalDmg} damage.`);
      if (checkWinner(newHp, enemy.hp)) return;
    } else if (action === "defend") {
      setEnemy((e) => ({ ...e, defending: true, energy: clamp(e.energy + 15, 0, 100) }));
      addLog("AI is defending.");
    } else {
      const dmg = random(25, 40);
      const finalDmg = player.defending ? Math.floor(dmg * 0.5) : dmg;
      const newHp = clamp(player.hp - finalDmg, 0, 100);
      setPlayer((p) => ({ ...p, hp: newHp, defending: false }));
      setEnemy((e) => ({ ...e, energy: e.energy - 40, defending: false }));
      addLog(`AI SPECIAL for ${finalDmg} damage!`);
      if (checkWinner(newHp, enemy.hp)) return;
    }
    setTurn("player");
  };

  const buyPotion = () => {
    if (rf < 20 || player.hp >= 100) return;
    setRf((r) => r - 20);
    setPlayer((p) => ({ ...p, hp: clamp(p.hp + 25, 0, 100) }));
    addLog("Potion used! +25 HP (-20 RF)");
  };

  const buyBoost = () => {
    if (rf < 30) return;
    setRf((r) => r - 30);
    setBoost((b) => b + 8);
    addLog("Damage Boost activated! (+8 dmg) (-30 RF)");
  };

  const reset = () => {
    setPlayer({ name: "Your Rare Friend", hp: 100, maxHp: 100, energy: 100, defending: false });
    setEnemy({ name: "AI Rare Friend", hp: 100, maxHp: 100, energy: 100, defending: false });
    setBoost(0);
    setBattleOver(false);
    setWinner(null);
    setTurn("player");
    setLog(["New battle started!"]);
  };

  return (
    <div style={{
      width: "100%",
      maxWidth: 960,
      margin: "0 auto",
      background: "#0f0f13",
      color: "#fff",
      fontFamily: "monospace",
      padding: 16,
      minHeight: 640,
      boxSizing: "border-box"
    }}>
      <h2 style={{ textAlign: "center", marginBottom: 8 }}>Rare Friend Duel</h2>
      <p style={{ textAlign: "center", fontSize: 13, opacity: 0.7 }}>
        Simulated RF: {rf} | Boost: +{boost}
      </p>

      {/* Arena */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        margin: "20px 0",
        gap: 12
      }}>
        {/* Player */}
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{
            width: 80, height: 80, margin: "0 auto",
            background: "#222", borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32
          }}>👾</div>
          <div style={{ marginTop: 6, fontSize: 13 }}>{player.name}</div>
          <div style={{
            height: 10, background: "#333", borderRadius: 5, marginTop: 4, overflow: "hidden"
          }}>
            <div style={{
              width: `${player.hp}%`, height: "100%",
              background: player.hp > 30 ? "#4ade80" : "#f87171",
              transition: "width 0.3s"
            }} />
          </div>
          <div style={{ fontSize: 12 }}>HP {player.hp}/100</div>
        </div>

        <div style={{ fontSize: 24 }}>VS</div>

        {/* Enemy */}
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{
            width: 80, height: 80, margin: "0 auto",
            background: "#222", borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32
          }}>🤖</div>
          <div style={{ marginTop: 6, fontSize: 13 }}>{enemy.name}</div>
          <div style={{
            height: 10, background: "#333", borderRadius: 5, marginTop: 4, overflow: "hidden"
          }}>
            <div style={{
              width: `${enemy.hp}%`, height: "100%",
              background: enemy.hp > 30 ? "#4ade80" : "#f87171",
              transition: "width 0.3s"
            }} />
          </div>
          <div style={{ fontSize: 12 }}>HP {enemy.hp}/100</div>
        </div>
      </div>

      {/* Log */}
      <div style={{
        background: "#1a1a22", borderRadius: 8, padding: 10,
        height: 90, overflowY: "auto", fontSize: 13, marginBottom: 16
      }}>
        {log.map((l, i) => <div key={i}>{l}</div>)}
      </div>

      {/* Buttons */}
      {!battleOver ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          <button onClick={playerAttack} disabled={turn !== "player"}
            style={btnStyle}>Attack</button>
          <button onClick={playerDefend} disabled={turn !== "player"}
            style={btnStyle}>Defend</button>
          <button onClick={playerSpecial} disabled={turn !== "player"}
            style={btnStyle}>Special</button>
          <button onClick={buyPotion} style={btnStyle}>Potion (20 RF)</button>
          <button onClick={buyBoost} style={btnStyle}>Boost (30 RF)</button>
        </div>
      ) : (
        <div style={{ textAlign: "center" }}>
          <h3>{winner === "player" ? "You Win!" : "You Lose"}</h3>
          <button onClick={reset} style={{ ...btnStyle, width: "100%" }}>Fight Again</button>
        </div>
      )}

      <p style={{ textAlign: "center", fontSize: 11, opacity: 0.5, marginTop: 16 }}>
        All RF is SIMULATED • Built for Rare Friends Vibeathon
      </p>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "12px 8px",
  background: "#3b82f6",
  color: "white",
  border: "none",
  borderRadius: 8,
  fontWeight: "bold",
  fontSize: 14,
  cursor: "pointer"
};
