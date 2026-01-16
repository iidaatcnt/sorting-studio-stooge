'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  StepBack,
  Github,
  Info,
  Code2,
  Zap,
  Lightbulb,
  Construction,
  Hammer,
  Repeat,
  Target
} from 'lucide-react';

// --- Types ---
type SortState = 'compare' | 'swap' | 'recursive_call' | 'init' | 'complete';

interface SortingStep {
  array: number[];
  indices: [number, number]; // Range i, j
  activeRange?: [number, number];
  type: SortState;
  description: string;
  codeLine?: number;
}

// --- Constants ---
const ARRAY_SIZE = 9; // Small enough to show the many steps
const INITIAL_SPEED = 950; // Stooge is slow, so we need speed

const CODE_PYTHON = [
  "def stooge_sort(arr, i, j):",
  "    if arr[i] > arr[j]:",
  "        arr[i], arr[j] = arr[j], arr[i]",
  "    if j - i + 1 > 2:",
  "        t = (j - i + 1) // 3",
  "        stooge_sort(arr, i, j - t)",
  "        stooge_sort(arr, i + t, j)",
  "        stooge_sort(arr, i, j - t)"
];

// --- Algorithm Logic ---
const generateSteps = (initialArray: number[]): SortingStep[] => {
  const steps: SortingStep[] = [];
  const arr = [...initialArray];

  const sort = (l: number, h: number) => {
    steps.push({
      array: [...arr],
      indices: [l, h],
      activeRange: [l, h],
      type: 'compare',
      description: `インデックス ${l} と ${h} を比較します。`,
      codeLine: 1
    });

    if (arr[l] > arr[h]) {
      [arr[l], arr[h]] = [arr[h], arr[l]];
      steps.push({
        array: [...arr],
        indices: [l, h],
        activeRange: [l, h],
        type: 'swap',
        description: `逆転しているので入れ替えます。`,
        codeLine: 2
      });
    }

    if (h - l + 1 > 2) {
      const t = Math.floor((h - l + 1) / 3);

      steps.push({
        array: [...arr],
        indices: [l, h - t],
        activeRange: [l, h],
        type: 'recursive_call',
        description: `【1/3】前の 2/3 範囲 [${l}, ${h - t}] を再帰的にソートします。`,
        codeLine: 5
      });
      sort(l, h - t);

      steps.push({
        array: [...arr],
        indices: [l + t, h],
        activeRange: [l, h],
        type: 'recursive_call',
        description: `【2/3】ろの 2/3 範囲 [${l + t}, h] を再帰的にソートします。`,
        codeLine: 6
      });
      sort(l + t, h);

      steps.push({
        array: [...arr],
        indices: [l, h - t],
        activeRange: [l, h],
        type: 'recursive_call',
        description: `【3/3】ダメ押しでもう一度、前の 2/3 範囲 [${l}, ${h - t}] をソートします。`,
        codeLine: 7
      });
      sort(l, h - t);
    }
  };

  steps.push({
    array: [...arr],
    indices: [0, arr.length - 1],
    type: 'init',
    description: 'ストゥージソートを開始します。凄まじい回数の再帰を繰り返す、頑固なソートです。',
    codeLine: 0
  });

  sort(0, arr.length - 1);

  steps.push({
    array: [...arr],
    indices: [0, arr.length - 1],
    type: 'complete',
    description: '膨大な再帰の末、すべての要素が完全に整列されました！',
    codeLine: 0
  });

  return steps;
};


// --- Main App ---
export default function StoogeSortStudio() {
  const [array, setArray] = useState<number[]>([]);
  const [steps, setSteps] = useState<SortingStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const reset = useCallback(() => {
    const newArray = Array.from({ length: ARRAY_SIZE }, () => Math.floor(Math.random() * 85) + 10);
    const newSteps = generateSteps(newArray);
    setArray(newArray);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    reset();
  }, [reset]);

  const stepForward = useCallback(() => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1)), [steps.length]);
  const stepBackward = useCallback(() => setCurrentStep(prev => Math.max(prev - 1, 0)), []);

  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      timerRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1001 - speed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, currentStep, steps.length, speed]);

  const step = steps[currentStep] || { array: [], indices: [0, 0], type: 'init', description: '' };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Construction className="text-white w-5 h-5" />
            </div>
            <h1 className="font-black italic tracking-tighter text-xl uppercase tracking-widest text-indigo-600">Stooge_Sort_Studio</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 text-[10px] mono uppercase text-slate-400 font-black tracking-widest">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-indigo-600 animate-pulse' : 'bg-slate-300'}`} />
                {isPlaying ? '再帰中' : '待機中'}
              </div>
              <span className="opacity-20">|</span>
              <span>Step: {currentStep} / {steps.length}</span>
            </div>
            <a href="https://github.com/iidaatcnt/sorting-studio-stooge" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-900 transition-colors">
              <Github size={20} />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Visualization */}
        <div className="lg:col-span-8 flex flex-col gap-8">

          <div className="relative aspect-video lg:aspect-square max-h-[500px] bg-white rounded-[3rem] border border-slate-200 p-16 flex items-end justify-center gap-3 overflow-hidden shadow-xl">
            <div className="absolute top-8 left-12 flex items-center gap-3 mono text-[9px] text-slate-400 uppercase font-black tracking-[0.2em] z-10">
              <Repeat size={14} className="text-indigo-600" />
              ストゥージソート・シミュレーター
            </div>

            <AnimatePresence mode="popLayout" initial={false}>
              {step.array.map((val, idx) => {
                const isInActiveRange = step.activeRange ? (idx >= step.activeRange[0] && idx <= step.activeRange[1]) : false;
                const isComparing = step.indices.includes(idx);

                let colorClass = "bg-slate-50";

                if (isInActiveRange) {
                  colorClass = "bg-slate-100 border-t border-slate-200";
                  if (isComparing) {
                    if (step.type === 'compare') colorClass = "bg-indigo-300 shadow-[0_0_20px_rgba(79,70,229,0.3)] z-10";
                    if (step.type === 'swap') colorClass = "bg-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.5)] z-10";
                  }
                  if (step.type === 'recursive_call' && isComparing) {
                    colorClass = "bg-indigo-500/20 border border-indigo-400/30";
                  }
                }

                if (step.type === 'complete') {
                  colorClass = "bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.3)]";
                }

                return (
                  <motion.div
                    key={`${idx}-${val}`}
                    layout
                    transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                    style={{ height: `${val}%` }}
                    className={`flex-1 min-w-[20px] rounded-t-xl relative ${colorClass} transition-all duration-300`}
                  >
                    <div className={`absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-black ${isComparing ? 'text-indigo-600' : 'text-slate-300'}`}>
                      {val}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Range Indicators */}
            {step.activeRange && (
              <div
                className="absolute bottom-6 h-1 bg-indigo-600/10 rounded-full transition-all duration-500"
                style={{
                  left: `${(step.activeRange[0] / ARRAY_SIZE) * 100}%`,
                  width: `${((step.activeRange[1] - step.activeRange[0] + 1) / ARRAY_SIZE) * 100}%`
                }}
              >
                <div className="absolute inset-x-0 -top-4 flex justify-between px-2 text-[8px] mono text-indigo-400/40 uppercase font-black">
                  <span>L: {step.activeRange[0]}</span>
                  <span>H: {step.activeRange[1]}</span>
                </div>
              </div>
            )}

            <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:40px_40px]" />
          </div>

          <div className="px-10 py-8 bg-white rounded-[2.5rem] border border-slate-200 flex flex-col gap-8 shadow-lg">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="flex items-center gap-2">
                <button onClick={stepBackward} className="p-4 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 transition-colors"><StepBack size={20} /></button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-20 h-20 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center hover:bg-indigo-500 transition-all active:scale-95 shadow-xl shadow-indigo-600/20"
                >
                  {isPlaying ? <Pause fill="currentColor" size={24} /> : <Play fill="currentColor" size={24} className="ml-1" />}
                </button>
                <button onClick={stepForward} className="p-4 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 transition-colors"><StepForward size={20} /></button>
                <button onClick={reset} className="p-4 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 transition-colors ml-4"><RotateCcw size={20} /></button>
              </div>

              <div className="flex-1 w-full text-center md:text-left">
                <div className="flex items-center justify-between mono text-[10px] text-slate-400 uppercase font-black tracking-widest mb-3 font-bold">
                  <span>再生スピード</span>
                  <span className="text-indigo-600 font-bold">{speed}ms</span>
                </div>
                <div className="flex gap-4 items-center">
                  <input type="range" min="100" max="995" value={speed} onChange={(e) => setSpeed(parseInt(e.target.value))} className="flex-1 appearance-none bg-slate-100 h-1.5 rounded-full accent-indigo-600 cursor-pointer" />
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex gap-4">
              <div className="mt-1 p-2 bg-white border border-slate-200 rounded-xl shrink-0 shadow-sm">
                <Hammer size={16} className="text-slate-400" />
              </div>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                {step.description}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Code & Theory */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="p-10 bg-white border border-slate-200 rounded-[3rem] shadow-lg">
            <div className="flex items-center gap-3 mb-8">
              <Lightbulb className="text-amber-500 w-5 h-5" />
              <h2 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">学習ガイド</h2>
            </div>
            <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl mb-8">
              <h3 className="text-indigo-600 font-black mb-3 text-sm">Stooge Sort</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                「最初と最後を比べ、3分の2ずつ3回ソートする」という凄烈なほど手数の多い再帰ソート。
                計算量は驚異の O(N^2.7) であり、クイックソートなどと比べると絶望的に遅いですが、数学的な美しさがあります。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 mono text-[9px] font-black uppercase tracking-tighter">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                <span className="text-slate-400 block mb-1">Complexity</span>
                <span className="text-indigo-600 font-black">O(N^2.71)</span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                <span className="text-slate-400 block mb-1">Efficiency</span>
                <span className="text-rose-500 font-black">Extreme Low</span>
              </div>
            </div>
          </div>

          <div className="p-10 bg-[#0f172a] border border-slate-800 rounded-[3rem] flex-1 flex flex-col min-h-[450px] shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Code2 className="text-slate-400 w-5 h-5" />
                <h2 className="font-black text-[10px] uppercase tracking-widest text-slate-500">Python 実装例</h2>
              </div>
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
            </div>

            <div className="flex-1 bg-black/20 p-8 rounded-3xl mono text-[10px] leading-loose overflow-auto border border-slate-800 scrollbar-hide text-slate-300 font-bold">
              {CODE_PYTHON.map((line, i) => (
                <div
                  key={i}
                  className={`flex gap-6 transition-all duration-300 ${step.codeLine === i ? 'text-indigo-400 bg-indigo-500/10 -mx-8 px-8 border-l-2 border-indigo-400 font-bold' : 'text-slate-800'}`}
                >
                  <span className="text-slate-900 tabular-nums w-4 select-none opacity-50">{i + 1}</span>
                  <pre className="whitespace-pre">{line}</pre>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center opacity-20">
              <span className="text-[8px] mono text-slate-500 uppercase tracking-[0.5em]">recursive_overkill_v1</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-20 border-t border-slate-200 py-16 text-center">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">
          <Construction className="text-slate-200 w-8 h-8 opacity-20" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Fundamental Wisdom for the AI Era // Algorithm Literacy // しろいプログラミング教室</p>
        </div>
      </footer>
    </div>
  );
}
