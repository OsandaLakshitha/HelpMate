// components/BDailyTargets.jsx — Corrected version with proper conditional display
export default function BDailyTargets({ projects = [], onGoToProject }) {
  // Empty state
  if (!projects?.length) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 24px', background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9' }}>
        <p style={{ fontSize: 28, marginBottom: 8 }}>📭</p>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#0f172a' }}>No active projects yet</p>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Create a project to see your daily tasks!</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {projects.map(project => {
        // Status configurations
        const targetStatus = {
          'met': { label: '✅ Target Met', color: '#059669', bg: '#ecfdf5' },
          'in-progress': { label: '🔄 In Progress', color: '#d97706', bg: '#fffbeb' },
          'missed': { label: '❌ Target Missed', color: '#dc2626', bg: '#fef2f2' },
          'not-started': { label: '⚪ Not Started', color: '#94a3b8', bg: '#f8fafc' },
        }[project.targetStatus] || { label: '—', color: '#94a3b8', bg: '#f8fafc' };

        const rapCfg = {
          'on-track': { color: '#059669', bg: '#ecfdf5', label: 'On Track', icon: '✨' },
          'on-track-fragile': { color: '#0891b2', bg: '#ecfeff', label: 'On Track', icon: '✨' },
          'at-risk-recoverable': { color: '#d97706', bg: '#fffbeb', label: 'Can Catch Up', icon: '🔄' },
          'at-risk': { color: '#d97706', bg: '#fffbeb', label: 'Behind', icon: '⚠️' },
          'danger-recoverable': { color: '#ea580c', bg: '#fff7ed', label: 'Urgent · Can Recover', icon: '⚡' },
          'in-danger': { color: '#dc2626', bg: '#fef2f2', label: 'Urgent', icon: '🚨' },
          'complete': { color: '#7c3aed', bg: '#f5f3ff', label: 'Done! 🎉', icon: '✅' },
          'not-started': { color: '#94a3b8', bg: '#f8fafc', label: 'Not Started', icon: '👋' },
        }[project.rapStatus] || { color: '#94a3b8', bg: '#f8fafc', label: '—', icon: '❓' };

        // ✅ NEW: Calculate if target should be shown
        // Only show target if:
        // 1. dailyTarget exists AND > 0
        // 2. Project is NOT in cold start (has passed the 4-task unlock)
        // 3. Project has tasks OR has some completion activity
        const shouldShowTarget = 
          project.dailyTarget > 0 && 
          !project.coldStart ;

        // Calculate progress percentage
        const progressPct = project.dailyTarget > 0 
          ? Math.min(100, Math.round((project.completedToday / project.dailyTarget) * 100)) 
          : (project.completedToday > 0 ? 100 : 0);

        return (
          <div key={project.projectId} style={{
            background: '#fff',
            borderRadius: 16,
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: `1px solid #f1f5f9`,
            borderLeft: `4px solid ${rapCfg.color}`,
          }}>
            
            {/* Header: Project + Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{project.title}</h3>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>
                  📅 Due {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : '—'}
                </p>
              </div>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 99,
                background: rapCfg.bg,
                color: rapCfg.color,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}>
                {rapCfg.icon} {rapCfg.label}
              </span>
            </div>

            {/* ✅ CONDITIONAL: Cold Start Message (shown BEFORE target is active) */}
            {project.coldStart && (
              <div style={{ 
                padding: '12px', 
                background: '#f8fafc', 
                borderRadius: 10, 
                textAlign: 'center',
                marginBottom: 16,
                border: '1px dashed #cbd5e1'
              }}>
                <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                  🔐 Complete {project.completionsNeeded || 4} tasks to unlock personalized predictions
                </p>
                <p style={{ margin: '6px 0 0', fontSize: 11, color: '#94a3b8' }}>
                  Start with any task — predictions will activate automatically!
                </p>
              </div>
            )}

            {/* ✅ CONDITIONAL: Today's Target Progress (only shows when meaningful) */}
            {shouldShowTarget && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                    🎯 Today: {project.completedToday} / {project.dailyTarget} tasks
                  </p>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: targetStatus.bg,
                    color: targetStatus.color,
                  }}>
                    {targetStatus.label}
                  </span>
                </div>
                <div style={{ height: 8, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${progressPct}%`,
                    background: progressPct >= 100 ? '#059669' : progressPct >= 50 ? '#d97706' : '#dc2626',
                    borderRadius: 99,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
                {project.dailyTarget > 0 && project.completedToday < project.dailyTarget && (
                  <p style={{ margin: '6px 0 0', fontSize: 12, color: '#64748b' }}>
                    {project.dailyTarget - project.completedToday} more to hit today's target
                  </p>
                )}
              </div>
            )}

            {/* ✅ Task List: Only show if tasks exist AND target not yet met */}
            {project.tasksForToday?.length > 0 && project.completedToday < project.dailyTarget && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                  📋 Complete these today:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {project.tasksForToday.map((task, index) => {
                    const complexityStyle = {
                      'High': { bg: '#fef2f2', color: '#dc2626', text: 'Hard' },
                      'Medium': { bg: '#fffbeb', color: '#d97706', text: 'Medium' },
                      'Low': { bg: '#ecfdf5', color: '#059669', text: 'Easy' },
                    }[task.complexity] || { bg: '#f1f5f9', color: '#64748b', text: '—' };

                    return (
                      <div key={task._id || index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '12px',
                        background: '#f8fafc',
                        borderRadius: 10,
                        border: '1px solid #e2e8f0',
                      }}>
                        {/* Number badge */}
                        <div style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: '#0f172a',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}>
                          {index + 1}
                        </div>
                        
                        {/* Task name */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ 
                            margin: 0, 
                            fontSize: 14, 
                            fontWeight: 500, 
                            color: '#0f172a',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {task.name || task.title || 'Untitled task'}
                          </p>
                        </div>
                        
                        {/* Complexity badge */}
                        <span style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: '3px 10px',
                          borderRadius: 99,
                          background: complexityStyle.bg,
                          color: complexityStyle.color,
                          flexShrink: 0,
                        }}>
                          {complexityStyle.text}
                        </span>
                        
                        {/* Estimated time */}
                        {task.estimatedMinutes && (
                          <span style={{ fontSize: 11, color: '#64748b', flexShrink: 0 }}>
                            ~{task.estimatedMinutes}m
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ✅ Success Message: Only if target met AND target was > 0 */}
            {project.completedToday >= project.dailyTarget && project.dailyTarget > 0 && (
              <div style={{ 
                padding: '12px', 
                background: '#ecfdf5', 
                borderRadius: 10, 
                textAlign: 'center',
                marginBottom: 16
              }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#059669' }}>
                  🎉 Great job! You've hit today's target.
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#059669' }}>
                  Keep up the momentum or get ahead for tomorrow!
                </p>
              </div>
            )}

            {/* ✅ No tasks yet message (only if no cold start and no tasks) */}
            
{!project.coldStart && 
 (!project.tasksForToday?.length) && 
 project.dailyTarget > 0 && 
 !project.isOverdue && (   // ← Add this guard
  <div>📋 Tasks will appear here once your project is set up</div>
)}


{project.isOverdue && (
  <div style={{ 
    padding: '12px', 
    background: '#fef2f2', 
    borderRadius: 10, 
    textAlign: 'center',
    marginBottom: 16,
    border: '1px solid #fecaca'
  }}>
    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#dc2626' }}>
      ⏰ Deadline Passed
    </p>
    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#dc2626' }}>
      {project.pendingTaskCount} tasks still incomplete. Complete them now.
    </p>
  </div>
)}

            
          </div>
        );
      })}
    </div>
  );
}