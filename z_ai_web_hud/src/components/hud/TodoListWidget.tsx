"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckSquare, Square, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
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
  const [isExpanded, setIsExpanded] = useState(true);
  const { appendLog } = useAssistantStore();

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

  return (
    <div className="chamfer-card light-pipe-cyan glass-panel p-4 w-56 flex flex-col group transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,242,255,0.3)]">
      <div className="flex items-center justify-between border-b border-cyan/30 pb-2 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div>
          <div className="font-mono text-[9px] text-cyan/70 tracking-[0.2em] uppercase">
            [MOD_TASK_77]
          </div>
          <div className="font-mono text-[10px] text-cyan font-bold tracking-wider group-hover:glow-cyan transition-all">
            MISSION_OBJECTIVES
          </div>
        </div>
        <button className="text-cyan/70 hover:text-cyan transition-colors">
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: "auto", opacity: 1, marginTop: 12 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            className="flex flex-col gap-3 overflow-hidden"
          >
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

            <form onSubmit={addTask} className="relative flex items-center">
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
