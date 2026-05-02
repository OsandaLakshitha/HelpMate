/**
 * ProjectStats.jsx
 *
 * Props
 *   projectId  — MongoDB _id string of the selected project
 *
 * API endpoints (all from your existing backend):
 *   GET /api/projects/:id            → { project, members }
 *   GET /api/tasks?projectId=:id     → { tasks }
 *   GET /api/predictions/:id         → { prediction }
 *   GET /api/predictions/:id/logs    → { logs }
 *
 * Zero hardcoded data. Every value comes from the server.
 * Any field that doesn't exist yet gracefully hides itself.
 */

import { useState, useEffect, useCallback } from "react";
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine,
  ResponsiveContainer,
} from "recharts";

/* ── Google Fonts ──────────────────────────────────────────────────────────── */
const FONTS = "https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=Outfit:wght@400;500;600;700;800&display=swap";

/* ── RAP status → colour (matches your BPrediction enum exactly) ─────────── */
const RAP_MAP = {
  "on-track":            { ink: "#166534", fill: "#f0fdf4", rim: "#bbf7d0", tag: "On Track"              },
  "on-track-fragile":    { ink: "#854d0e", fill: "#fefce8", rim: "#fde68a", tag: "On Track — Fragile"    },
  "at-risk-recoverable": { ink: "#9a3412", fill: "#fff7ed", rim: "#fed7aa", tag: "At Risk — Recoverable" },
  "at-risk":             { ink: "#991b1b", fill: "#fef2f2", rim: "#fecaca", tag: "At Risk"               },
  "danger-recoverable":  { ink: "#581c87", fill: "#faf5ff", rim: "#e9d5ff", tag: "Danger — Recoverable"  },
  "in-danger":           { ink: "#7f1d1d", fill: "#fff1f2", rim: "#fecdd3", tag: "In Danger"             },
  "complete":            { ink: "#1e3a8a", fill: "#eff6ff", rim: "#bfdbfe", tag: "Complete"              },
  "not-started":         { ink: "#374151", fill: "#f9fafb", rim: "#e5e7eb", tag: "Not Started"           },
};
const getRap  = (s) => RAP_MAP[s] || RAP_MAP["not-started"];
const clamp   = (v, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, v ?? 0));
const r2      = (v) => Math.round((v ?? 0) * 100) / 100;
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" }) : "—";
const fmtShort = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day:"numeric", month:"short" }) : "—";
const dLeft    = (d) => d ? Math.round((new Date(d) - Date.now()) / 86_400_000) : null;
const tok      = ()  => localStorage.getItem("token") || "";

const callApi = async (path) => {
  const res = await fetch(`/api${path}`, { headers: { Authorization: `Bearer ${tok()}` } });
  if (!res.ok) throw new Error(`${path} → HTTP ${res.status}`);
  return res.json();
};

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:"10px 14px", fontSize:12, boxShadow:"0 4px 16px rgba(0,0,0,.08)" }}>
      <p style={{ margin:"0 0 6px", color:"#6b7280", fontWeight:600 }}>{label}</p>
      {payload.map((p,i) => <p key={i} style={{ margin:"2px 0", color:p.color }}>{p.name}: <b>{p.value}</b></p>)}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   ProjectStats — main component
═══════════════════════════════════════════════════════════════════════════ */
export default function ProjectStats({ projectId }) {
  const [project,    setProject]    = useState(null);
  const [members,    setMembers]    = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [logs,       setLogs]       = useState([]);
  const [tasks,      setTasks]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [tab,        setTab]        = useState("overview");
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!projectId) return;
    setLoading(true); setError(null);
    try {
      const [projR, predR, logsR, taskR] = await Promise.allSettled([
        callApi(`/projects/${projectId}`),
        callApi(`/predictions/${projectId}`),
        callApi(`/predictions/${projectId}/logs`),
        callApi(`/tasks?projectId=${projectId}`),
      ]);
      if (projR.status === "fulfilled") {
        setProject(projR.value.project ?? null);
        setMembers(projR.value.members  ?? []);
      } else throw new Error(projR.reason?.message || "Failed to load project");

      if (predR.status === "fulfilled") setPrediction(predR.value.prediction ?? null);
      if (logsR.status === "fulfilled") setLogs((logsR.value.logs ?? []).sort((a,b)=>(a.date??"").localeCompare(b.date??"")));
      if (taskR.status === "fulfilled") setTasks(taskR.value.tasks ?? []);
    } catch(e) { setError(e.message); }
    finally    { setLoading(false); }
  }, [projectId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetch(`/api/predictions/${projectId}/refresh`, { method:"POST", headers:{Authorization:`Bearer ${tok()}`} }).catch(()=>{});
      const res = await callApi(`/predictions/${projectId}`);
      setPrediction(res.prediction ?? null);
    } catch { /**/ }
    setRefreshing(false);
  };

  /* ── Guard renders ───────────────────────────────────────────────────── */
  if (!projectId)   return <Shell><EmptyState icon="📂" text="Select a project to view its statistics." /></Shell>;
  if (loading)      return <Shell><Spinner /></Shell>;
  if (error)        return <Shell><ErrState msg={error} onRetry={fetchAll} /></Shell>;
  if (!project)     return <Shell><EmptyState icon="🔍" text="Project not found." /></Shell>;

  /* ── Derived — ALL from real model data ─────────────────────────────── */
  const p         = prediction ?? {};
  const st        = getRap(p.rapStatus ?? p.status);
  const dl        = dLeft(project.dueDate);
  const overdue   = dl !== null && dl < 0;
  const done      = tasks.filter(t => t.status === "Completed");
  const pending   = tasks.filter(t => t.status !== "Completed").sort((a,b)=>(a.order??999)-(b.order??999));
  const next      = pending[0] ?? null;
  const total     = p.totalTaskCount ?? tasks.length;
  const workPct   = p.workCompletionPct ?? (total > 0 ? Math.round((done.length/total)*100) : 0);

  const trend = logs.map(l => ({
    date:      (l.date??"").slice(5),
    completed: l.completedTaskCount ?? 0,
    target:    l.targetTaskCount    ?? 0,
    score:     l.trajectoryScore    ?? 0,
  }));
  const last7 = trend.slice(-7);

  const pieData = [
    { name:"Completed", value:done.length,                        fill:"#2563eb" },
    { name:"Pending",   value:p.pendingTaskCount??pending.length, fill:"#e5e7eb" },
  ];
  const pressData = (p.deadlinePressure!=null && p.complexityCapacity!=null) ? [
    { name:"Required",     value:r2(p.deadlinePressure),   fill:"#f97316" },
    { name:"Max Capacity", value:r2(p.complexityCapacity), fill:"#22c55e" },
  ] : [];

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <>
      <link rel="stylesheet" href={FONTS} />
      <style>{`
        @keyframes spin    { to { transform:rotate(360deg) } }
        @keyframes fadeUp  { from { opacity:0;transform:translateY(12px) } to { opacity:1;transform:none } }
        .ps-fade { animation:fadeUp .35s ease both }
        .ps-tr:hover { background:#f9fafb!important }
        .ps-tab:hover { background:#f3f4f6!important }
        .ps-rbtn:hover { background:#f3f4f6!important }
      `}</style>

      <div style={{ minHeight:"100vh", background:"#f8f9fb", fontFamily:"'Outfit',sans-serif", color:"#111827" }}>

        {/* ── STICKY HEADER ─────────────────────────────────────────── */}
        <header style={{ background:"#fff", borderBottom:"1px solid #e5e7eb", position:"sticky", top:0, zIndex:20, padding:"0 40px" }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:20, padding:"22px 0 16px", flexWrap:"wrap" }}>

            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ margin:"0 0 4px", fontSize:11, fontWeight:600, letterSpacing:".12em", color:"#9ca3af", textTransform:"uppercase" }}>
                {project.projectType ?? "Project"}
              </p>
              <h1 style={{ margin:"0 0 10px", fontFamily:"'Lora',serif", fontSize:"clamp(18px,2.5vw,26px)", fontWeight:700, color:"#0f172a", lineHeight:1.25, letterSpacing:"-.01em" }}>
                {project.title}
              </h1>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {project.complexity  && <Chip>{project.complexity} Complexity</Chip>}
                {project.dueDate     && <Chip>Due {fmtDate(project.dueDate)}</Chip>}
                {project.projectType && <Chip>{project.projectType}</Chip>}
                {project.status      && <Chip>{project.status}</Chip>}
                {(p.rapStatus||p.status) && (
                  <Chip bg={st.fill} color={st.ink} border={`1px solid ${st.rim}`}>{st.tag}</Chip>
                )}
              </div>
            </div>

            <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8 }}>
              <div style={{ background:overdue?"#fff1f2":"#eff6ff", border:`1px solid ${overdue?"#fecdd3":"#bfdbfe"}`, borderRadius:12, padding:"10px 18px", textAlign:"center", minWidth:80 }}>
                <div style={{ fontSize:34, fontWeight:800, lineHeight:1, color:overdue?"#b91c1c":"#1d4ed8" }}>{dl!==null?Math.abs(dl):"—"}</div>
                <div style={{ fontSize:9, letterSpacing:".12em", color:"#9ca3af", marginTop:3, textTransform:"uppercase" }}>{overdue?"days overdue":"days left"}</div>
              </div>
              <button className="ps-rbtn" onClick={handleRefresh} disabled={refreshing}
                style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:"5px 12px", fontSize:12, color:"#6b7280", cursor:"pointer", fontFamily:"inherit", transition:"background .15s" }}>
                {refreshing?"Refreshing…":"↻ Refresh"}
              </button>
            </div>
          </div>

          <nav style={{ display:"flex", gap:2 }}>
            {["overview","tasks","history"].map(t => (
              <button key={t} className="ps-tab" onClick={()=>setTab(t)} style={{
                background: tab===t?"#eff6ff":"transparent",
                border:"none", borderBottom:`2px solid ${tab===t?"#2563eb":"transparent"}`,
                color:tab===t?"#1d4ed8":"#9ca3af", padding:"10px 18px",
                cursor:"pointer", fontSize:12, fontWeight:600, letterSpacing:".04em",
                fontFamily:"inherit", textTransform:"uppercase",
                borderRadius:"6px 6px 0 0", transition:"all .15s",
              }}>{t}</button>
            ))}
          </nav>
        </header>

        {/* ── BODY ─────────────────────────────────────────────────── */}
        <main style={{ maxWidth:1380, margin:"0 auto", padding:"28px 40px 60px" }}>

          {/* ════════════════════════ OVERVIEW */}
          {tab==="overview" && (
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

              {/* RAP message (from BPrediction.rapMessage) */}
              {p.rapMessage && (
                <div className="ps-fade" style={{ background:st.fill, border:`1px solid ${st.rim}`, borderLeft:`4px solid ${st.ink}`, borderRadius:10, padding:"13px 18px", fontSize:13, color:"#1f2937", lineHeight:1.65 }}>
                  {p.rapMessage}
                </div>
              )}

              {/* Cold-start notice */}
              {p.coldStart===true && (
                <div className="ps-fade" style={{ background:"#fefce8", border:"1px solid #fde68a", borderRadius:10, padding:"11px 18px", fontSize:13, color:"#78350f" }}>
                  🔓 Complete {p.completionsNeeded??4} more task(s) to unlock personalised AI predictions.
                </div>
              )}

              {/* 4 KPI cards */}
              <div className="ps-fade" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))", gap:16 }}>
                <Kpi label="Work Complete"
                  value={`${workPct}%`}
                  sub={`${done.length} of ${total} tasks done`}
                  accent="#2563eb" pct={workPct} />
                <Kpi label="Today's Target"
                  value={p.dailyTarget!=null?`${p.todayCompletedCount??0} / ${p.dailyTarget}`:"—"}
                  sub={p.dailyTarget==null?"Calculating…":(p.todayCompletedCount??0)>=p.dailyTarget?"✓ Target met today!":`${p.dailyTarget-(p.todayCompletedCount??0)} more task(s) needed`}
                  accent={(p.todayCompletedCount??0)>=(p.dailyTarget??1)?"#16a34a":"#ea580c"}
                  pct={p.dailyTarget>0?clamp(((p.todayCompletedCount??0)/p.dailyTarget)*100):0} />
                <Kpi label="Trajectory Score"
                  value={p.trajectoryScore??"—"}
                  sub={p.trajectoryScore==null?"Need more completions":p.trajectoryScore>=80?"Excellent pace":p.trajectoryScore>=60?"Acceptable — keep going":"Falling behind"}
                  accent={p.trajectoryScore==null?"#9ca3af":p.trajectoryScore>=80?"#16a34a":p.trajectoryScore>=60?"#d97706":"#dc2626"}
                  pct={clamp(p.trajectoryScore)} />
                <Kpi label="Resilience Score"
                  value={p.resilienceScore??"—"}
                  sub={p.resilienceScore==null?"Calculating…":p.resilienceScore>=60?"Good buffer":"Low buffer — stay consistent"}
                  accent={p.resilienceScore==null?"#9ca3af":p.resilienceScore>=60?"#16a34a":"#ea580c"}
                  pct={clamp(p.resilienceScore)} />
              </div>

              {/* Row 2: donut + pressure + pace */}
              <div className="ps-fade" style={{ display:"grid", gridTemplateColumns:"1fr 1.3fr 1.3fr", gap:20 }}>

                {/* Completion donut */}
                <Card label="Completion">
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                    <div style={{ position:"relative", width:160, height:160 }}>
                      <PieChart width={160} height={160}>
                        <Pie data={pieData} cx={75} cy={75} innerRadius={48} outerRadius={72} startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
                          {pieData.map((e,i)=><Cell key={i} fill={e.fill}/>)}
                        </Pie>
                      </PieChart>
                      <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center" }}>
                        <div style={{ fontSize:24, fontWeight:800, color:"#1d4ed8", lineHeight:1 }}>{workPct}%</div>
                        <div style={{ fontSize:9, color:"#9ca3af", letterSpacing:".1em", marginTop:3 }}>DONE</div>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:14, marginTop:8 }}>
                      <Dot color="#2563eb" label={`${done.length} done`}/>
                      <Dot color="#e5e7eb" label={`${p.pendingTaskCount??pending.length} pending`} border/>
                    </div>
                  </div>
                </Card>

                {/* Pressure vs Capacity */}
                <Card label="Pressure vs Capacity">
                  <p style={{ margin:"0 0 10px", fontSize:11, color:"#9ca3af" }}>
                    Tasks/day required vs {project.complexity??""} complexity max
                  </p>
                  {pressData.length>0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={110}>
                        <BarChart data={pressData} layout="vertical" barSize={28} margin={{ top:0,right:8,left:0,bottom:0 }}>
                          <XAxis type="number" domain={[0,Math.max(3,r2(p.deadlinePressure)+.5)]} tick={{ fill:"#9ca3af",fontSize:10 }}/>
                          <YAxis dataKey="name" type="category" tick={{ fill:"#4b5563",fontSize:11 }} width={92}/>
                          <Tooltip content={<ChartTip/>}/>
                          <Bar dataKey="value" radius={[0,4,4,0]}>
                            {pressData.map((e,i)=><Cell key={i} fill={e.fill}/>)}
                          </Bar>
                          <ReferenceLine x={p.complexityCapacity} stroke="#1d4ed8" strokeDasharray="5 3" strokeWidth={1.5}/>
                        </BarChart>
                      </ResponsiveContainer>
                      {p.capacityWarning && (
                        <div style={{ marginTop:10, padding:"8px 12px", background:"#fff7ed", border:"1px solid #fed7aa", borderRadius:6, fontSize:11, color:"#c2410c" }}>
                          ⚠ {p.capacityWarning}
                        </div>
                      )}
                    </>
                  ) : <EmptyChart text="Complete tasks to see pressure analysis."/>}
                </Card>

                {/* Pace vs Time */}
                <Card label="Pace vs Time">
                  <ProgBar label="Time Elapsed" value={p.timeElapsedPct??0}  color="#7c3aed"/>
                  <ProgBar label="Work Done"    value={workPct}               color="#2563eb" style={{ marginTop:16 }}/>
                  {p.paceDelta!=null && (
                    <div style={{ marginTop:16, padding:"11px 14px", borderRadius:8, textAlign:"center", background:p.paceDelta>=0?"#f0fdf4":"#fef2f2", border:`1px solid ${p.paceDelta>=0?"#bbf7d0":"#fecaca"}` }}>
                      <span style={{ fontSize:22, fontWeight:800, color:p.paceDelta>=0?"#15803d":"#dc2626" }}>
                        {p.paceDelta>=0?"+":""}{p.paceDelta}%
                      </span>
                      <span style={{ fontSize:11, color:"#6b7280", marginLeft:8 }}>
                        {p.paceDelta>=0?"ahead of schedule":"behind schedule"}
                      </span>
                    </div>
                  )}
                  {p.projectedFinishDate && (
                    <div style={{ marginTop:14, padding:"10px 14px", background:"#f8fafc", borderRadius:8, border:"1px solid #e5e7eb" }}>
                      <p style={{ margin:"0 0 3px", fontSize:9, color:"#9ca3af", letterSpacing:".12em", textTransform:"uppercase" }}>Projected Finish</p>
                      <div style={{ fontSize:15, fontWeight:700, color:"#1d4ed8" }}>
                        {fmtShort(p.projectedFinishDate)}
                        {dl!=null && p.projectedDaysNeeded!=null && (
                          <span style={{ fontSize:11, color:"#9ca3af", fontWeight:400, marginLeft:8 }}>
                            ({p.projectedDaysNeeded>dl?`${p.projectedDaysNeeded-dl}d late`:`${dl-p.projectedDaysNeeded}d early`})
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              </div>

              {/* 14-day trend */}
              <div className="ps-fade">
                <Card label="14-Day Performance Trend">
                  {trend.length>0 ? (
                    <>
                      <div style={{ display:"flex", gap:18, flexWrap:"wrap", marginBottom:14 }}>
                        <Dot color="#2563eb" label="Completed"/>
                        <Dot color="#22c55e" label="Target" dashed/>
                        <Dot color="#f97316" label="Trajectory Score (right axis)"/>
                      </div>
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={trend} margin={{ top:4,right:36,left:-16,bottom:0 }}>
                          <defs>
                            <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor="#2563eb" stopOpacity={.18}/>
                              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor="#f97316" stopOpacity={.14}/>
                              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                          <XAxis dataKey="date" tick={{ fill:"#9ca3af",fontSize:10 }}/>
                          <YAxis yAxisId="t" domain={[0,5]}    tick={{ fill:"#9ca3af",fontSize:10 }}/>
                          <YAxis yAxisId="s" orientation="right" domain={[0,100]} tick={{ fill:"#9ca3af",fontSize:10 }}/>
                          <Tooltip content={<ChartTip/>}/>
                          <Area yAxisId="t" type="monotone" dataKey="completed" stroke="#2563eb" fill="url(#gC)" strokeWidth={2} dot={{ fill:"#2563eb",r:3 }} name="Completed"/>
                          <Area yAxisId="t" type="monotone" dataKey="target"    stroke="#22c55e" fill="none"    strokeWidth={1.5} strokeDasharray="4 3" dot={false} name="Target"/>
                          <Area yAxisId="s" type="monotone" dataKey="score"     stroke="#f97316" fill="url(#gS)" strokeWidth={1.5} dot={false} name="Score"/>
                        </AreaChart>
                      </ResponsiveContainer>
                    </>
                  ) : <EmptyChart text="No history yet — complete tasks to see your trend."/>}
                </Card>
              </div>

              {/* Last 7 days + Capacity */}
              <div className="ps-fade" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
                <Card label="Last 7 Days — Daily Targets">
                  {last7.length>0 ? (
                    <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:4 }}>
                      {last7.map((d,i)=>{
                        const pct = d.target>0?clamp((d.completed/d.target)*100):0;
                        const met = d.completed>=d.target && d.target>0;
                        return (
                          <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <span style={{ width:38,fontSize:10,color:"#9ca3af",flexShrink:0 }}>{d.date}</span>
                            <div style={{ flex:1, height:16, background:"#f3f4f6", borderRadius:4, overflow:"hidden" }}>
                              <div style={{ width:`${pct}%`, height:"100%", borderRadius:4, background:met?"#22c55e":d.completed>0?"#f97316":"#e5e7eb", transition:"width .5s ease" }}/>
                            </div>
                            <span style={{ width:30,fontSize:11,color:"#6b7280",textAlign:"right",flexShrink:0 }}>{d.completed}/{d.target}</span>
                            <span style={{ fontSize:12,flexShrink:0,color:met?"#15803d":d.completed>0?"#ea580c":"#ef4444" }}>
                              {met?"✓":d.completed>0?"~":"✗"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : <EmptyChart text="No daily data yet."/>}
                </Card>

                <Card label="Capacity Analysis">
                  <Stat label="Load Factor"
                    value={p.loadFactor!=null?`${(p.loadFactor*100).toFixed(0)}%`:"—"}
                    sub={`${p.activeProjects??members.length??1} active project${(p.activeProjects??1)!==1?"s":""} dividing your time`}
                    color="#7c3aed"/>
                  <Hr/>
                  <Stat label="Burst Rate Needed"
                    value={p.burstRateNeeded!=null?`${p.burstRateNeeded} tasks/day`:"—"}
                    sub="Sustained effort required to finish on time"
                    color="#f97316"/>
                  <Hr/>
                  {p.burstFeasibilityPct!=null && (
                    <>
                      <p style={{ margin:"0 0 6px",fontSize:10,fontWeight:600,color:"#9ca3af",letterSpacing:".1em",textTransform:"uppercase" }}>Burst Feasibility</p>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ flex:1, height:7, background:"#f3f4f6", borderRadius:4, overflow:"hidden" }}>
                          <div style={{ width:`${clamp(p.burstFeasibilityPct)}%`, height:"100%", borderRadius:4, background:p.burstFeasibilityPct>=70?"#22c55e":p.burstFeasibilityPct>=40?"#f97316":"#ef4444" }}/>
                        </div>
                        <span style={{ fontSize:13,fontWeight:700,color:"#111827",width:38 }}>{p.burstFeasibilityPct}%</span>
                      </div>
                      <p style={{ margin:"5px 0 12px",fontSize:11,color:"#9ca3af" }}>
                        {p.burstFeasibilityPct>=70?"Achievable with consistent daily effort.":p.burstFeasibilityPct>=40?"Possible but will require real focus.":"Pace exceeds capacity — consider speaking to your supervisor."}
                      </p>
                      <Hr/>
                    </>
                  )}
                  <Stat label="Prediction Confidence"
                    value={p.confidence!=null?`${Math.round(p.confidence*100)}%`:"—"}
                    sub={p.dataPointsUsed!=null?`Based on ${p.dataPointsUsed} day${p.dataPointsUsed!==1?"s":""} of history`:"Collecting data…"}
                    color={p.confidence>=.7?"#16a34a":"#9ca3af"}/>
                </Card>
              </div>

              {/* Team members from BProjectMember */}
              {members.length>0 && (
                <div className="ps-fade">
                  <Card label={`Team (${members.length})`}>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))", gap:12 }}>
                      {members.map(m=>{
                        const u    = m.userId??{};
                        const name = u.firstName?`${u.firstName} ${u.lastName??""}`.trim():u.email??"—";
                        return (
                          <div key={m._id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", background:"#f9fafb", borderRadius:10, border:"1px solid #e5e7eb" }}>
                            <div style={{ width:36,height:36,borderRadius:"50%",background:"#dbeafe",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"#1d4ed8",flexShrink:0 }}>
                              {name.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ minWidth:0 }}>
                              <div style={{ fontSize:13,fontWeight:600,color:"#111827",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{name}</div>
                              {m.componentName && <div style={{ fontSize:11,color:"#6b7280",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{m.componentName}</div>}
                              {m.contributionTotal>0 && (
                                <div style={{ fontSize:10,color:"#9ca3af",marginTop:2 }}>
                                  Contribution: {m.contributionTotal}
                                  {m.freeRidingFlag && <span style={{ marginLeft:6,color:"#dc2626" }}>⚑ flagged</span>}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════ TASKS */}
          {tab==="tasks" && (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:8, marginBottom:4 }}>
                <p style={{ margin:0, fontSize:13, color:"#6b7280" }}>
                  {done.length} completed · {pending.length} remaining
                  {next && <span style={{ color:"#1d4ed8",marginLeft:10 }}>→ Next: {next.name}</span>}
                </p>
                <div style={{ display:"flex", gap:14 }}>
                  <Dot color="#2563eb" label="Completed"/>
                  <Dot color="#22c55e" label="Up next"/>
                </div>
              </div>

              {tasks.length===0
                ? <EmptyState icon="📋" text="No tasks yet. Generate tasks from the project page."/>
                : [...tasks].sort((a,b)=>(a.order??999)-(b.order??999)).map(task=>{
                    const isDone = task.status==="Completed";
                    const isNext = !isDone && next?._id===task._id;
                    return (
                      <div key={task._id} style={{ display:"flex", alignItems:"center", gap:14, padding:"13px 18px", background:isDone?"#f0f7ff":isNext?"#f0fdf4":"#fff", border:`1px solid ${isDone?"#bfdbfe":isNext?"#bbf7d0":"#e5e7eb"}`, borderRadius:10, opacity:isDone?.65:1 }}>
                        <div style={{ width:28,height:28,borderRadius:"50%",flexShrink:0, background:isDone?"#dbeafe":isNext?"#dcfce7":"#f3f4f6", border:`1.5px solid ${isDone?"#93c5fd":isNext?"#86efac":"#e5e7eb"}`, display:"flex",alignItems:"center",justifyContent:"center", fontSize:10,fontWeight:700, color:isDone?"#1d4ed8":isNext?"#15803d":"#9ca3af" }}>
                          {isDone?"✓":task.order??"·"}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:13,fontWeight:500,color:isDone?"#9ca3af":"#111827", textDecoration:isDone?"line-through":"none", overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                            {task.name}
                          </div>
                          {task.description && (
                            <div style={{ fontSize:11,color:"#9ca3af",marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{task.description}</div>
                          )}
                        </div>
                        {isNext && <span style={{ fontSize:10,fontWeight:700,color:"#15803d",background:"#dcfce7",padding:"2px 9px",borderRadius:20,flexShrink:0 }}>DO NEXT</span>}
                        {task.complexity!=null && (
                          <div style={{ display:"flex",gap:3,flexShrink:0 }}>
                            {Array.from({length:5},(_,i)=><div key={i} style={{ width:5,height:5,borderRadius:"50%",background:i<task.complexity?"#f97316":"#e5e7eb" }}/>)}
                          </div>
                        )}
                        {task.dueDate && <span style={{ fontSize:10,color:"#9ca3af",flexShrink:0 }}>{fmtShort(task.dueDate)}</span>}
                        <span style={{ fontSize:10,fontWeight:600,flexShrink:0,padding:"3px 10px",borderRadius:20, background:isDone?"#dbeafe":"#f3f4f6", color:isDone?"#1d4ed8":"#6b7280" }}>
                          {task.status}
                        </span>
                      </div>
                    );
                  })
              }
            </div>
          )}

          {/* ════════════════════════ HISTORY */}
          {tab==="history" && (
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <Card label="Trajectory Score Over Time">
                {trend.length>0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={trend} margin={{ top:5,right:20,left:-16,bottom:0 }}>
                      <defs>
                        <linearGradient id="gTr" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#f97316" stopOpacity={.18}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                      <XAxis dataKey="date" tick={{ fill:"#9ca3af",fontSize:10 }}/>
                      <YAxis domain={[0,100]} tick={{ fill:"#9ca3af",fontSize:10 }}/>
                      <Tooltip content={<ChartTip/>}/>
                      <ReferenceLine y={80} stroke="#16a34a" strokeDasharray="4 3" label={{ value:"Good (80)",fill:"#15803d",fontSize:10,position:"insideTopRight" }}/>
                      <ReferenceLine y={60} stroke="#f97316" strokeDasharray="4 3" label={{ value:"At risk (60)",fill:"#c2410c",fontSize:10,position:"insideTopRight" }}/>
                      <Area type="monotone" dataKey="score" stroke="#f97316" fill="url(#gTr)" strokeWidth={2} dot={{ fill:"#f97316",r:3 }} name="Trajectory Score"/>
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <EmptyChart text="No data yet — start completing tasks."/>}
              </Card>

              <Card label="Full Daily Log">
                {logs.length===0 ? <EmptyChart text="No daily logs recorded yet."/> : (
                  <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                      <thead>
                        <tr style={{ borderBottom:"2px solid #f3f4f6" }}>
                          {["Date","Target","Done","Met?","Score","Days Left","Status"].map(h=>(
                            <th key={h} style={{ padding:"8px 12px",color:"#9ca3af",fontWeight:600,textAlign:"left",fontSize:10,textTransform:"uppercase",letterSpacing:".07em" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[...logs].reverse().map((l,i)=>{
                          const rs = getRap(l.rapStatus??l.status);
                          return (
                            <tr key={i} className="ps-tr" style={{ borderBottom:"1px solid #f9fafb" }}>
                              <td style={{ padding:"10px 12px",color:"#374151",fontFamily:"monospace" }}>{l.date??"—"}</td>
                              <td style={{ padding:"10px 12px",color:"#6b7280" }}>{l.targetTaskCount??"—"}</td>
                              <td style={{ padding:"10px 12px",fontWeight:600,color:"#111827" }}>{l.completedTaskCount??"—"}</td>
                              <td style={{ padding:"10px 12px" }}><span style={{ color:l.targetMet?"#15803d":"#dc2626",fontSize:14 }}>{l.targetMet?"✓":"✗"}</span></td>
                              <td style={{ padding:"10px 12px" }}>
                                {l.trajectoryScore!=null?(
                                  <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                                    <div style={{ width:54,height:4,background:"#f3f4f6",borderRadius:2 }}>
                                      <div style={{ width:`${clamp(l.trajectoryScore)}%`,height:"100%",borderRadius:2, background:l.trajectoryScore>=80?"#22c55e":l.trajectoryScore>=60?"#f97316":"#ef4444" }}/>
                                    </div>
                                    <span style={{ fontSize:11,color:"#6b7280" }}>{l.trajectoryScore}</span>
                                  </div>
                                ):"—"}
                              </td>
                              <td style={{ padding:"10px 12px",color:"#6b7280" }}>{l.daysLeft??"—"}</td>
                              <td style={{ padding:"10px 12px" }}>
                                {(l.rapStatus||l.status)&&(
                                  <span style={{ padding:"2px 9px",borderRadius:20,fontSize:10,fontWeight:600, background:rs.fill,color:rs.ink,border:`1px solid ${rs.rim}` }}>
                                    {rs.tag}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

/* ─── Shared micro-components ──────────────────────────────────────────────── */

function Shell({ children }) {
  return <div style={{ minHeight:"100vh",background:"#f8f9fb",fontFamily:"'Outfit',sans-serif",display:"flex",alignItems:"center",justifyContent:"center" }}>{children}</div>;
}
function Card({ label, children }) {
  return (
    <div style={{ background:"#fff",border:"1px solid #e5e7eb",borderRadius:14,padding:"20px 22px" }}>
      {label && <p style={{ margin:"0 0 14px",fontSize:10,fontWeight:700,color:"#9ca3af",letterSpacing:".12em",textTransform:"uppercase" }}>{label}</p>}
      {children}
    </div>
  );
}
function Kpi({ label, value, sub, accent, pct }) {
  return (
    <div style={{ background:"#fff",border:"1px solid #e5e7eb",borderRadius:14,padding:"18px 20px" }}>
      <p style={{ margin:"0 0 10px",fontSize:10,fontWeight:700,color:"#9ca3af",letterSpacing:".12em",textTransform:"uppercase" }}>{label}</p>
      <div style={{ fontSize:27,fontWeight:800,color:accent,lineHeight:1,letterSpacing:"-.02em" }}>{value}</div>
      <p style={{ margin:"6px 0 12px",fontSize:11,color:"#9ca3af" }}>{sub}</p>
      <div style={{ height:3,background:"#f3f4f6",borderRadius:2,overflow:"hidden" }}>
        <div style={{ width:`${clamp(pct)}%`,height:"100%",background:accent,borderRadius:2,transition:"width .9s cubic-bezier(.16,1,.3,1)" }}/>
      </div>
    </div>
  );
}
function ProgBar({ label, value, color, style={} }) {
  return (
    <div style={style}>
      <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
        <span style={{ fontSize:12,color:"#6b7280" }}>{label}</span>
        <span style={{ fontSize:12,color,fontWeight:600 }}>{value??0}%</span>
      </div>
      <div style={{ height:7,background:"#f3f4f6",borderRadius:4,overflow:"hidden" }}>
        <div style={{ width:`${clamp(value)}%`,height:"100%",background:color,borderRadius:4,transition:"width .8s ease" }}/>
      </div>
    </div>
  );
}
function Stat({ label, value, sub, color }) {
  return (
    <div style={{ marginBottom:2 }}>
      <p style={{ margin:"0 0 2px",fontSize:10,fontWeight:600,color:"#9ca3af",letterSpacing:".1em",textTransform:"uppercase" }}>{label}</p>
      <div style={{ fontSize:18,fontWeight:700,color }}>{value}</div>
      {sub && <p style={{ margin:"2px 0 0",fontSize:11,color:"#9ca3af" }}>{sub}</p>}
    </div>
  );
}
function Chip({ children, bg="#f3f4f6", color="#374151", border }) {
  return <span style={{ background:bg,color,border:border??"none",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:500,whiteSpace:"nowrap" }}>{children}</span>;
}
function Dot({ color, label, dashed, border }) {
  return (
    <div style={{ display:"flex",alignItems:"center",gap:6 }}>
      {dashed
        ? <div style={{ width:16,borderTop:`2px dashed ${color}` }}/>
        : <div style={{ width:8,height:8,borderRadius:"50%",background:color,border:border?"1px solid #d1d5db":"none" }}/>}
      {label && <span style={{ fontSize:11,color:"#9ca3af" }}>{label}</span>}
    </div>
  );
}
function Hr()     { return <div style={{ height:1,background:"#f3f4f6",margin:"12px 0" }}/>; }
function EmptyChart({ text }) { return <div style={{ padding:"24px 0",textAlign:"center",color:"#d1d5db",fontSize:13 }}>{text}</div>; }
function EmptyState({ icon, text }) {
  return (
    <div style={{ textAlign:"center",padding:"48px 20px" }}>
      <div style={{ fontSize:36,marginBottom:12 }}>{icon}</div>
      <p style={{ color:"#9ca3af",fontSize:14,margin:0 }}>{text}</p>
    </div>
  );
}
function Spinner() {
  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:14 }}>
        <div style={{ width:36,height:36,border:"3px solid #e5e7eb",borderTop:"3px solid #2563eb",borderRadius:"50%",animation:"spin .75s linear infinite" }}/>
        <p style={{ color:"#9ca3af",fontSize:13,margin:0 }}>Loading project stats…</p>
      </div>
    </>
  );
}
function ErrState({ msg, onRetry }) {
  return (
    <div style={{ textAlign:"center" }}>
      <div style={{ fontSize:32,marginBottom:10 }}>⚠️</div>
      <p style={{ color:"#dc2626",fontSize:13,margin:"0 0 14px" }}>{msg}</p>
      <button onClick={onRetry} style={{ background:"#2563eb",border:"none",borderRadius:8,padding:"8px 20px",color:"#fff",cursor:"pointer",fontSize:13,fontFamily:"inherit" }}>Try Again</button>
    </div>
  );
}