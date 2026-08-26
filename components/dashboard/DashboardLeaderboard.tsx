"use client";

import { Trophy } from "lucide-react";

export type LeaderboardEntry = {
  id: string;
  name: string;
  score: number;
  completedTasks: number;
  totalTasks: number;
  completionPercentage: number;
  isCurrentUser?: boolean;
};

interface DashboardLeaderboardProps {
  entries: LeaderboardEntry[];
}

export function DashboardLeaderboard({
  entries,
}: DashboardLeaderboardProps) {
  return (
    <section className="rounded-2xl border border-white/[0.07] bg-[#15181d]">
      {/* Header */}

      <div className="border-b border-white/[0.07] px-4 py-4 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06]">
            <Trophy className="h-4 w-4 text-white/70" />
          </div>

          <div>
            <h2 className="text-sm font-semibold">
              Weekly Leaderboard
            </h2>

            <p className="mt-0.5 text-xs text-white/35">
              This week's performance
            </p>
          </div>
        </div>
      </div>

      {/* Rankings */}

      <div className="divide-y divide-white/[0.05]">
        {entries.map((entry, index) => {
          const rank = index + 1;

          return (
            <div
              key={entry.id}
              className={`flex items-center gap-3 px-4 py-3 sm:px-5 ${
                entry.isCurrentUser
                  ? "bg-white/[0.025]"
                  : ""
              }`}
            >
              {/* Rank */}

              <div className="w-6 shrink-0 text-center text-xs font-medium text-white/30">
                {rank}
              </div>

              {/* Student */}

              <div className="min-w-0 flex-1">
                <div
                  className={`truncate text-sm font-medium ${
                    entry.isCurrentUser
                      ? "text-white"
                      : "text-white/65"
                  }`}
                >
                  {entry.name}

                  {entry.isCurrentUser && (
                    <span className="ml-2 text-[10px] font-medium uppercase tracking-wider text-white/30">
                      You
                    </span>
                  )}
                </div>

                <div className="mt-0.5 text-[10px] text-white/25">
                  {entry.completedTasks} /{" "}
                  {entry.totalTasks} tasks
                </div>
              </div>

              {/* Score */}

              <div className="shrink-0 text-right">
                <div className="text-sm font-semibold text-white/75">
                  {entry.score}
                </div>

                <div className="text-[10px] text-white/25">
                  {entry.completionPercentage}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}