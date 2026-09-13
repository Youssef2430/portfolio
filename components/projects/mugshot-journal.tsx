"use client";

import { useRef, useState, type RefObject } from "react";
import Image from "next/image";
import { motion, useMotionValue, useReducedMotion } from "framer-motion";
import { RotateCcw, Plus } from "lucide-react";

const DRINKS = [
  { name: "Latte", image: "dalgona", caffeine: 120 },
  { name: "Matcha", image: "matcha", caffeine: 70 },
  { name: "Cold brew", image: "coldbrew", caffeine: 200 },
];
const POSITIONS = [[14, 12, -12], [53, 9, 10], [34, 35, -6], [66, 39, 14], [8, 45, -14]];
type Cup = { id: number; drink: number };
function CupSticker({ cup, index, bounds }: { cup: Cup; index: number; bounds: RefObject<HTMLDivElement | null> }) {
  const x = useMotionValue(0), y = useMotionValue(0);
  const reduce = useReducedMotion();
  const drink = DRINKS[cup.drink];
  const [left, top, rotate] = POSITIONS[index];
  return <motion.button type="button" className="journal-sticker" drag dragConstraints={bounds} dragElastic={0} dragMomentum={false}
    initial={reduce || cup.id < 2 ? false : { scale: .35, rotate: rotate - 25, opacity: 0 }} animate={{ scale: 1, rotate, opacity: 1 }}
    transition={{ type: "spring", stiffness: 260, damping: 22 }} whileDrag={{ scale: 1.08, zIndex: 10 }}
    style={{ left: `${left}%`, top: `${top}%`, x, y, touchAction: "none" }}
    aria-label={`${drink.name} sticker ${index + 1}. Drag or use arrow keys to arrange.`}
    onKeyDown={event => {
      const delta = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] }[event.key];
      if (!delta || !bounds.current) return;
      event.preventDefault();
      const outer = bounds.current.getBoundingClientRect(), inner = event.currentTarget.getBoundingClientRect();
      x.set(x.get() + Math.max(outer.left - inner.left, Math.min(delta[0], outer.right - inner.right)));
      y.set(y.get() + Math.max(outer.top - inner.top, Math.min(delta[1], outer.bottom - inner.bottom)));
    }}>
    <Image src={`/mugshot/stickers/${drink.image}.png`} alt="" width={130} height={180} draggable={false} />
  </motion.button>;
}
export function MugshotJournal() {
  const [cups, setCups] = useState<Cup[]>([{ id: 0, drink: 0 }, { id: 1, drink: 1 }]);
  const nextId = useRef(2);
  const bounds = useRef<HTMLDivElement>(null);
  const total = cups.reduce((sum, cup) => sum + DRINKS[cup.drink].caffeine, 0);
  return <div className="journal-demo">
    <div className="journal-controls">
      <span className="study-eyebrow">01 / A little hands-on</span>
      <h2 className="mug-display">Make yourself<br />a <em>memory.</em></h2>
      <p>Pick a drink. Drop it in your journal. Move it somewhere that feels just right.</p>
      <div className="journal-drinks">{DRINKS.map((drink, i) => <button type="button" key={drink.name} disabled={cups.length >= 5} onClick={() => { const cup = { id: nextId.current++, drink: i }; setCups(current => current.length < 5 ? [...current, cup] : current); }} aria-label={`Add ${drink.name}`}>
        <Image src={`/mugshot/stickers/${drink.image}.png`} width={70} height={90} alt="" /><span>{drink.name}<Plus size={12} /></span>
      </button>)}</div>
      <div className="journal-hint"><span>{cups.length >= 5 ? "A full little collection. Start a fresh page?" : "A playful preview. Your real journal stays on your phone."}</span><button type="button" onClick={() => setCups([])} aria-label="Reset sample journal"><RotateCcw size={15} />Reset</button></div>
    </div>
    <div className="journal-paper">
      <div className="journal-paper-heading"><span>THE LITTLE THINGS</span><span>Sample journal / 001</span></div>
      <div ref={bounds} className="journal-board">
        <p className="journal-board-note" aria-hidden="true">Good coffee.<br /><em>Better memories.</em></p>
        {cups.map((cup, i) => <CupSticker key={cup.id} cup={cup} index={i} bounds={bounds} />)}
        {cups.length === 0 && <p className="journal-empty">A fresh page.<br />Add your first cup ←</p>}
      </div>
      <div className="journal-receipt" role="status"><span>{String(cups.length).padStart(2, "0")} little moments collected</span><strong>{total}<small> mg estimated</small></strong></div>
      <p className="journal-footnote">Illustrative drink estimates, just like the editable entries in the app.</p>
    </div>
  </div>;
}
