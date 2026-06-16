import React from 'react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => { 
  const { user } = useAuth();
  const isTrainer = user?.role === 'trainer';

  return (
    <aside className="w-64 bg-[#161925] p-5 flex flex-col h-screen border-r border-slate-800">
      <div className="text-xl font-bold text-cyan-400 mb-1">Fit Track •</div>
      <div className="text-[10px] text-purple-400 font-mono uppercase tracking-widest mb-8">
        {user?.role || 'Guest'} Mode
      </div>

      <nav className="flex-1 space-y-2">
        <a href="#overview" className="block p-3 rounded bg-cyan-950/40 text-cyan-400 font-semibold text-sm">
          Workspace Overview
        </a>

        {isTrainer ? (
          /* Trainer View Menu Items */
          <>
            <a href="#roster" className="block p-3 rounded text-sm text-gray-300 hover:bg-slate-800/50">Assigned Client Roster</a>
            <a href="#reviews" className="block p-3 rounded text-sm text-gray-300 hover:bg-slate-800/50">Performance Reviews</a>
            <a href="#prescriptions" className="block p-3 rounded text-sm text-gray-300 hover:bg-slate-800/50">Prescription Programs</a>
            <a href="#chat" className="block p-3 rounded text-sm text-gray-300 hover:bg-slate-800/50">Coach Connection Chat</a>
          </>
        ) : (
          /* Member View Menu Items */
          <>
            <a href="#my-plan" className="block p-3 rounded text-sm text-gray-300 hover:bg-slate-800/50">My Workout & Diet</a>
            <a href="#log-metrics" className="block p-3 rounded text-sm text-gray-300 hover:bg-slate-800/50">Log Daily Metrics</a>
            <a href="#progress" className="block p-3 rounded text-sm text-gray-300 hover:bg-slate-800/50">My Progress Charts</a>
            <a href="#chat" className="block p-3 rounded text-sm text-gray-300 hover:bg-slate-800/50">Chat with Coach</a>
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
