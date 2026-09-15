"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckSquare, Square, Plus, Trash2, Maximize, X, ListTodo } from "lucide-react";
import { useAssistantStore } from "@/store/useAssistantStore";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export function TodoListWidget() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", text: "SYSTEM DIAGNOSTICS", completed: true },
    { id: "2", text: "UPDATE SECURITY PROTOCOLS", completed: false },
    { id: "3", text: "CALIBRATE SENSORS", completed: false },
  ]);
  const [newTask, setNewTask] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { appendLog } = useAssistantStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    const task = tasks.find(t => t.id === id);
    if (task) {
      appendLog(`SYSTEM: Task [${task.text}] status updated.`);
    }
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now().toString(), text: newTask.toUpperCase(), completed: false }]);
    appendLog(`SYSTEM: New task added to queue.`);
    setNewTask("");
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    appendLog(`SYSTEM: Task purged from memory.`);
  };

  const modalContent = (
    <AnimatePresence>
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />
          <motion.div 
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            className="relative w-full max-w-lg chamfer-card light-pipe-cyan bg-surface-container-low/95 p-8 shadow-2xl backdrop-blur-2xl flex flex-col gap-6 z-10 transform-gpu text-left"
          >
            <div className="flex justify-between items-center border-b border-cyan/20 pb-4">
              <div className="flex items-center gap-2">
                <ListTodo className="text-cyan glow-cyan" size={18} />
                <span className="font-mono text-xs text-cyan tracking-widest font-extrabold glow-cyan">[MISSION_OBJECTIVES_DB]</span>
              </div>
              <X 
                className="text-cyan hover:text-white cursor-pointer transition-colors active:scale-90" 
                size={18} 
                onClick={() => setIsModalOpen(false)}
              />
            </div>

            <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto scrollbar-hide pr-2">
              <AnimatePresence>
                {tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-3 group/task bg-surface-container-lowest/50 p-3 chamfer-card-sm border border-cyan/10 hover:border-cyan/40 transition-all"
                  >
                    <button 
                      onClick={() => toggleTask(task.id)}
                      className="text-cyan/80 hover:text-cyan hover:glow-cyan transition-all flex-shrink-0"
                    >
                      {task.completed ? <CheckSquare size={16} /> : <Square size={16} />}
                    </button>
                    <span 
                      className={`font-mono text-[11px] flex-1 break-words ${task.completed ? 'text-cyan/40 line-through' : 'text-cyan/90'} transition-all font-bold`}
                    >
                      {task.text}
                    </span>
                    <button 
                      onClick={() => removeTask(task.id)}
                      className="opacity-0 group-hover/task:opacity-100 text-red-400 hover:text-red-500 transition-all cursor-pointer p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <form onSubmit={addTask} className="relative flex items-center mt-2">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="INPUT NEW PROTOCOL..."
                className="w-full bg-surface-container-lowest/80 border border-cyan/30 focus:border-cyan text-cyan font-mono text-[10px] px-4 py-3 outline-none placeholder:text-cyan/30 transition-all focus:shadow-[0_0_15px_rgba(0,242,255,0.2)] chamfer-card-sm font-bold tracking-wider"
              />
              <button type="submit" className="absolute right-3 text-cyan hover:text-white hover:glow-cyan transition-all">
                <Plus size={16} />
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <div className="chamfer-card light-pipe-cyan glass-panel p-4 w-52 sm:w-56 flex flex-col gap-3 group transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,242,255,0.3)]">
        <div className="flex items-center justify-between border-b border-cyan/30 pb-2">
          <div>
            <div className="font-mono text-[9px] text-cyan/70 tracking-[0.2em] uppercase">
              [MOD_TASK_77]
            </div>
            <div className="font-mono text-[10px] text-cyan font-bold tracking-wider group-hover:glow-cyan transition-all">
              MISSION_OBJECTIVES
            </div>
          </div>
          <button 
            className="text-cyan/70 hover:text-cyan transition-colors" 
            title="Expand View"
            onClick={() => setIsModalOpen(true)}
          >
            <Maximize size={14} />
          </button>
        </div>
        
        <div className="flex flex-col gap-2 max-h-40 overflow-y-auto scrollbar-hide">
          <AnimatePresence>
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-start gap-2 group/task"
              >
                <button 
                  onClick={() => toggleTask(task.id)}
                  className="mt-0.5 text-cyan/80 hover:text-cyan hover:glow-cyan transition-all flex-shrink-0"
                >
                  {task.completed ? <CheckSquare size={12} /> : <Square size={12} />}
                </button>
                <span 
                  className={`font-mono text-[9px] flex-1 break-words ${task.completed ? 'text-cyan/40 line-through' : 'text-cyan/90'} transition-all`}
                >
                  {task.text}
                </span>
                <button 
                  onClick={() => removeTask(task.id)}
                  className="opacity-0 group-hover/task:opacity-100 text-red-400 hover:text-red-500 hover:drop-shadow-[0_0_5px_rgba(248,113,113,0.8)] transition-all"
                >
                  <Trash2 size={10} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <form onSubmit={addTask} className="mt-1 relative flex items-center">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="ADD NEW PROTOCOL..."
            className="w-full bg-surface-container-lowest/50 border border-cyan/20 focus:border-cyan/50 text-cyan font-mono text-[9px] px-2 py-1.5 outline-none placeholder:text-cyan/30 transition-all focus:shadow-[0_0_10px_rgba(0,242,255,0.1)]"
          />
          <button type="submit" className="absolute right-1 text-cyan/70 hover:text-cyan hover:glow-cyan">
            <Plus size={12} />
          </button>
        </form>
      </div>
      
      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}
