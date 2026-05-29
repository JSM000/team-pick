'use client';

import { useState } from 'react';

// ── 색깔 팔레트 ────────────────────────────────────────────────
const COLOR_OPTIONS = [
  { name: '빨강', bg: '#ef4444', text: '#ffffff' },
  { name: '파랑', bg: '#2563eb', text: '#ffffff' },
  { name: '초록', bg: '#16a34a', text: '#ffffff' },
  { name: '노랑', bg: '#eab308', text: '#1a1a1a' },
  { name: '보라', bg: '#9333ea', text: '#ffffff' },
  { name: '주황', bg: '#ea580c', text: '#ffffff' },
  { name: '분홍', bg: '#db2777', text: '#ffffff' },
  { name: '하늘', bg: '#0284c7', text: '#ffffff' },
] as const;

const DEFAULT_COLORS = COLOR_OPTIONS.map((c) => c.bg);

// ── 유틸 ──────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildAssignments(total: number, teamCount: number): number[] {
  const base = Math.floor(total / teamCount);
  const extra = total % teamCount;
  const arr: number[] = [];
  for (let t = 0; t < teamCount; t++) {
    const count = t < extra ? base + 1 : base;
    for (let i = 0; i < count; i++) arr.push(t);
  }
  return shuffle(arr);
}

function getTextColor(bg: string): string {
  return COLOR_OPTIONS.find((c) => c.bg === bg)?.text ?? '#ffffff';
}

function getColorName(bg: string): string {
  return COLOR_OPTIONS.find((c) => c.bg === bg)?.name ?? '';
}

// ── 타입 ──────────────────────────────────────────────────────
type Phase = 'setup' | 'waiting' | 'reveal' | 'done';

// ── 메인 ──────────────────────────────────────────────────────
export default function Home() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [totalStudents, setTotalStudents] = useState(30);
  const [teamCount, setTeamCount] = useState(2);
  const [teamColors, setTeamColors] = useState<string[]>(['#ef4444', '#2563eb']);
  const [assignments, setAssignments] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // ── 설정 액션 ────────────────────────────────────────────────
  const changeTeamCount = (delta: number) => {
    const next = Math.max(2, Math.min(6, teamCount + delta));
    setTeamCount(next);
    setTeamColors((prev) => {
      if (next > prev.length) {
        return [...prev, ...DEFAULT_COLORS.slice(prev.length, next)];
      }
      return prev.slice(0, next);
    });
  };

  const setTeamColor = (teamIndex: number, color: string) => {
    setTeamColors((prev) => {
      const next = [...prev];
      next[teamIndex] = color;
      return next;
    });
  };

  const handleStart = () => {
    if (totalStudents < teamCount) return;
    const a = buildAssignments(totalStudents, teamCount);
    setAssignments(a);
    setCurrentIndex(0);
    setPhase('waiting');
  };

  // ── 플레이 액션 ──────────────────────────────────────────────
  const handleTouch = (e: React.PointerEvent) => {
    e.preventDefault();
    if (phase === 'waiting') {
      setPhase('reveal');
    } else if (phase === 'reveal') {
      const next = currentIndex + 1;
      if (next >= totalStudents) {
        setPhase('done');
      } else {
        setCurrentIndex(next);
        setPhase('waiting');
      }
    }
  };

  const handleReset = () => {
    setPhase('setup');
    setCurrentIndex(0);
    setAssignments([]);
  };

  // ── 완료 요약 ────────────────────────────────────────────────
  const teamCounts = Array(teamCount).fill(0) as number[];
  assignments.forEach((t) => teamCounts[t]++);

  // ── 화면 렌더 ────────────────────────────────────────────────

  // 설정 화면
  if (phase === 'setup') {
    const valid = totalStudents >= teamCount;
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
        <div className="flex-1 overflow-y-auto px-5 py-8 max-w-md mx-auto w-full">
          {/* 헤더 */}
          <div className="flex items-center gap-3 mb-10">
            <span className="text-3xl">⚽</span>
            <h1 className="text-2xl font-bold">팀 나누기</h1>
          </div>

          {/* 전체 학생 수 */}
          <div className="mb-8">
            <p className="text-sm text-zinc-400 mb-3">전체 학생 수</p>
            <div className="flex items-center gap-5">
              <button
                onClick={() => setTotalStudents((v) => Math.max(2, v - 1))}
                className="w-14 h-14 rounded-full bg-zinc-800 text-2xl font-bold active:bg-zinc-700"
              >
                −
              </button>
              <span className="text-5xl font-bold w-24 text-center tabular-nums">
                {totalStudents}
              </span>
              <button
                onClick={() => setTotalStudents((v) => Math.min(99, v + 1))}
                className="w-14 h-14 rounded-full bg-zinc-800 text-2xl font-bold active:bg-zinc-700"
              >
                +
              </button>
              <span className="text-zinc-400 text-lg">명</span>
            </div>
          </div>

          {/* 팀 수 */}
          <div className="mb-8">
            <p className="text-sm text-zinc-400 mb-3">팀 수</p>
            <div className="flex items-center gap-5">
              <button
                onClick={() => changeTeamCount(-1)}
                disabled={teamCount <= 2}
                className="w-14 h-14 rounded-full bg-zinc-800 text-2xl font-bold active:bg-zinc-700 disabled:opacity-30"
              >
                −
              </button>
              <span className="text-5xl font-bold w-24 text-center tabular-nums">
                {teamCount}
              </span>
              <button
                onClick={() => changeTeamCount(1)}
                disabled={teamCount >= 6}
                className="w-14 h-14 rounded-full bg-zinc-800 text-2xl font-bold active:bg-zinc-700 disabled:opacity-30"
              >
                +
              </button>
              <span className="text-zinc-400 text-lg">팀</span>
            </div>
            {!valid && (
              <p className="mt-2 text-sm text-red-400">
                학생 수가 팀 수보다 많아야 합니다
              </p>
            )}
          </div>

          {/* 팀별 색깔 */}
          <div className="mb-10">
            <p className="text-sm text-zinc-400 mb-3">팀별 색깔</p>
            <div className="space-y-3">
              {Array.from({ length: teamCount }, (_, i) => (
                <div key={i} className="bg-zinc-900 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-7 h-7 rounded-full ring-2 ring-white/20"
                      style={{ backgroundColor: teamColors[i] }}
                    />
                    <span className="font-semibold text-base">
                      {i + 1}팀
                      <span className="ml-2 text-sm font-normal text-zinc-400">
                        ({getColorName(teamColors[i])})
                      </span>
                    </span>
                  </div>
                  <div className="flex gap-2.5 flex-wrap">
                    {COLOR_OPTIONS.map((opt) => (
                      <button
                        key={opt.bg}
                        onClick={() => setTeamColor(i, opt.bg)}
                        title={opt.name}
                        className="w-9 h-9 rounded-full transition-transform active:scale-90"
                        style={{
                          backgroundColor: opt.bg,
                          outline:
                            teamColors[i] === opt.bg
                              ? '3px solid white'
                              : '3px solid transparent',
                          outlineOffset: '2px',
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 시작 버튼 */}
          <button
            onClick={handleStart}
            disabled={!valid}
            className="w-full py-5 rounded-2xl bg-primary text-white text-xl font-bold active:bg-primary-600 disabled:opacity-40 transition-colors"
          >
            시작하기
          </button>
        </div>
      </div>
    );
  }

  // 대기 화면 (터치하세요)
  if (phase === 'waiting') {
    const remaining = totalStudents - currentIndex;
    return (
      <div
        className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center cursor-pointer select-none"
        style={{ touchAction: 'none' }}
        onPointerDown={handleTouch}
      >
        <p className="text-[96px] font-extrabold text-white leading-none mb-6 select-none">
          터치
        </p>
        <p className="text-3xl text-zinc-400 font-medium select-none">
          {remaining}명 남음
        </p>

        {/* 팀 색깔 미리보기 도트 */}
        <div className="flex gap-3 mt-12">
          {teamColors.map((color, i) => (
            <div
              key={i}
              className="w-5 h-5 rounded-full"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        <p className="absolute bottom-8 text-zinc-700 text-sm select-none">
          {currentIndex + 1} / {totalStudents}
        </p>
      </div>
    );
  }

  // 공개 화면 (팀 색깔 전체 표시)
  if (phase === 'reveal') {
    const teamIndex = assignments[currentIndex];
    const bg = teamColors[teamIndex];
    const textColor = getTextColor(bg);
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center cursor-pointer select-none"
        style={{ backgroundColor: bg, touchAction: 'none' }}
        onPointerDown={handleTouch}
      >
        <p
          className="text-[120px] font-extrabold leading-none mb-4 select-none"
          style={{ color: textColor }}
        >
          {teamIndex + 1}팀
        </p>
        <p
          className="text-2xl font-medium select-none"
          style={{ color: textColor, opacity: 0.6 }}
        >
          터치하면 계속
        </p>
        <p
          className="absolute bottom-8 text-sm select-none"
          style={{ color: textColor, opacity: 0.4 }}
        >
          {currentIndex + 1} / {totalStudents}
        </p>
      </div>
    );
  }

  // 완료 화면
  return (
    <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center px-6">
      <p className="text-6xl mb-5">🎉</p>
      <p className="text-3xl font-bold text-white mb-2">팀 배정 완료!</p>
      <p className="text-zinc-400 mb-10 text-center">
        총 {totalStudents}명 배정이 완료되었습니다
      </p>

      {/* 팀별 인원 요약 */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {Array.from({ length: teamCount }, (_, i) => (
          <div
            key={i}
            className="rounded-2xl px-5 py-3 text-center min-w-[80px]"
            style={{ backgroundColor: teamColors[i] }}
          >
            <p
              className="text-2xl font-bold"
              style={{ color: getTextColor(teamColors[i]) }}
            >
              {i + 1}팀
            </p>
            <p
              className="text-sm font-medium"
              style={{ color: getTextColor(teamColors[i]), opacity: 0.8 }}
            >
              {teamCounts[i]}명
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={handleReset}
        className="px-10 py-4 rounded-2xl bg-primary text-white text-lg font-bold active:bg-primary-600"
      >
        처음으로 돌아가기
      </button>
    </div>
  );
}
