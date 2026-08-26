"use client";

import { ChevronLeft, ChevronRight, LogOut, UserRound, Users, X } from "lucide-react";

type MentorProfile = { display_name: string | null; username: string | null };
type Student = { id: string; display_name: string | null; username: string | null; weeklyTasks: number; completedTasks: number };

interface MentorSidebarProps {
  mentorProfile: MentorProfile | null;
  students: Student[];
  selectedStudentId: string | null;
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  onToggleCollapsed: () => void;
  onMobileSidebarOpenChange: (open: boolean) => void;
  onSelectStudent: (id: string) => void;
  onLogout: () => void;
}

export function MentorSidebar({
  mentorProfile, students, selectedStudentId, sidebarCollapsed,
  mobileSidebarOpen, onToggleCollapsed, onMobileSidebarOpenChange,
  onSelectStudent, onLogout,
}: MentorSidebarProps) {
  return (
    <aside className={`absolute inset-y-0 left-0 z-40 flex w-[280px] shrink-0 flex-col border-r border-white/[0.07] bg-[#0d0f12] shadow-2xl transition-all duration-300 ease-in-out lg:relative lg:z-auto lg:shadow-none lg:translate-x-0 ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} ${sidebarCollapsed ? "lg:w-[76px]" : "lg:w-[280px]"}`}>
      <div className={`flex h-20 shrink-0 items-center border-b border-white/[0.07] ${sidebarCollapsed ? "lg:justify-center lg:px-3" : "justify-between px-6"}`}>
        <div className={`flex items-center gap-3 ${sidebarCollapsed ? "lg:justify-center" : ""}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center"><img src="/mediq.svg" alt="MediQ" className="h-9 w-9 object-contain" /></div>
          <div className={`min-w-0 transition-all duration-200 ${sidebarCollapsed ? "lg:hidden" : ""}`}><div className="text-sm font-semibold tracking-tight">MediQ</div><div className="text-[11px] text-white/40">Mentorship</div></div>
        </div>
        <button type="button" onClick={onToggleCollapsed} className={`hidden h-8 w-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/[0.06] hover:text-white lg:flex ${sidebarCollapsed ? "lg:hidden" : ""}`} title="Collapse sidebar"><ChevronLeft className="h-4 w-4" /></button>
        <button type="button" onClick={() => onMobileSidebarOpenChange(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/[0.06] hover:text-white lg:hidden" title="Close sidebar"><X className="h-4 w-4" /></button>
      </div>
      <div className="border-t border-white/[0.07] p-3"><button type="button" onClick={onLogout} className={`group flex w-full items-center rounded-xl text-white/40 transition-all duration-200 hover:bg-rose-500/[0.06] hover:text-rose-300 ${sidebarCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"}`} aria-label="Log Out" title={sidebarCollapsed ? "Log Out" : undefined}><LogOut className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5" />{!sidebarCollapsed && <span className="text-sm">Log Out</span>}</button></div>
      {sidebarCollapsed && <div className="hidden border-b border-white/[0.07] p-3 lg:block"><button type="button" onClick={onToggleCollapsed} className="flex h-9 w-full items-center justify-center rounded-lg text-white/35 transition hover:bg-white/[0.06] hover:text-white" title="Expand sidebar"><ChevronRight className="h-4 w-4" /></button></div>}
      <div className={`border-b border-white/[0.07] px-5 py-5 ${sidebarCollapsed ? "lg:hidden" : ""}`}><div className="mb-2 flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-white/30"><UserRound className="h-3.5 w-3.5" />Mentor</div><div className="truncate text-lg font-semibold tracking-tight">{mentorProfile?.display_name || mentorProfile?.username || "Mentor"}</div><div className="mt-1 text-xs text-white/35">Academic Mentor</div></div>
      <div className="min-h-0 flex-1 overflow-y-auto"><div className={`flex items-center justify-between px-5 pb-3 pt-5 ${sidebarCollapsed ? "lg:justify-center lg:px-3" : ""}`}><div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-white/30"><Users className="h-3.5 w-3.5 shrink-0" /><span className={sidebarCollapsed ? "lg:hidden" : ""}>My Students</span></div><span className={`text-[10px] text-white/25 ${sidebarCollapsed ? "lg:hidden" : ""}`}>{students.length}</span></div>{students.length === 0 ? <div className={`px-5 py-8 text-center ${sidebarCollapsed ? "lg:hidden" : ""}`}><Users className="mx-auto h-5 w-5 text-white/15" /><div className="mt-3 text-xs text-white/30">No students assigned yet.</div></div> : <div className={`space-y-1 pb-4 ${sidebarCollapsed ? "px-2" : "px-2.5"}`}>{students.map((student) => <StudentButton key={student.id} student={student} selected={student.id === selectedStudentId} collapsed={sidebarCollapsed} onSelect={() => { onSelectStudent(student.id); onMobileSidebarOpenChange(false); }} />)}</div>}</div>
      <div className={`shrink-0 border-t border-white/[0.07] p-5 ${sidebarCollapsed ? "lg:hidden" : ""}`}><div className="text-[10px] font-medium uppercase tracking-wider text-white/25">Students</div><div className="mt-1 text-2xl font-semibold tracking-tight">{students.length}</div><div className="mt-1 text-xs text-white/30">assigned to you</div></div>
    </aside>
  );
}

function StudentButton({ student, selected, collapsed, onSelect }: { student: Student; selected: boolean; collapsed: boolean; onSelect: () => void }) {
  const progress = student.weeklyTasks > 0 ? (student.completedTasks / student.weeklyTasks) * 100 : 0;
  const dot = progress === 100 && student.weeklyTasks > 0 ? "bg-emerald-400" : selected ? "bg-white/70" : "bg-white/20";
  return <button type="button" onClick={onSelect} className={`w-full rounded-xl text-left transition ${collapsed ? "lg:px-0 lg:py-3" : "px-3.5 py-3"} ${selected ? "bg-white/[0.07]" : "hover:bg-white/[0.035]"}`}><div className={`hidden ${collapsed ? "lg:flex" : ""} items-center justify-center`}><div className={`h-2.5 w-2.5 rounded-full ${dot}`} /></div><div className={collapsed ? "lg:hidden" : ""}><div className="flex items-start gap-3"><div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot}`} /><div className="min-w-0 flex-1"><div className={`truncate text-sm font-medium ${selected ? "text-white" : "text-white/65"}`}>{student.display_name || student.username || "Unnamed Student"}</div><div className="mt-1 flex items-center justify-between gap-2"><span className="text-[10px] text-white/30">{student.completedTasks} / {student.weeklyTasks} tasks</span><span className="text-[10px] text-white/25">{Math.round(progress)}%</span></div><div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.07]"><div className="h-full rounded-full bg-white/60 transition-all" style={{ width: `${progress}%` }} /></div></div></div></div></button>;
}

export type { MentorProfile, Student };
