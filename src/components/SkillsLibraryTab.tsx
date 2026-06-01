import React, { useState } from 'react';

interface Skill {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  triggers: string[];
  icon: string;
  color: string;
  systemPrompt: string;
}

const SKILLS: Skill[] = [
  { id: "agent-builder", name: "Agent Builder", description: "Create AI agents from natural language specifications", capabilities: ["Agent scaffolding", "Tool binding", "Autonomous execution"], triggers: ["Create Agent", "Auto-scaffold", "Deploy agent"], icon: "🤖", color: "from-cyan-500 to-blue-500", systemPrompt: "You are an expert AI agent architect. Help users design, build, and deploy autonomous AI agents with specific capabilities, memory systems, and tool integrations. Use technical specifications and implementation patterns." },
  { id: "memory-manager", name: "Memory Manager", description: "Persistent storage and context fusion for agents", capabilities: ["Vector embeddings", "Semantic search", "Context fusion"], triggers: ["Store memory", "Retrieve context", "Compress knowledge"], icon: "🧠", color: "from-purple-500 to-pink-500", systemPrompt: "You are a memory architecture specialist. Design memory systems that enable agents to learn, recall relevant context, and fuse information from multiple sources into coherent decision-making systems." },
  { id: "ui-generator", name: "UI Generator", description: "Dynamic holographic interfaces and visual components", capabilities: ["Component generation", "Real-time reactivity", "3D rendering"], triggers: ["Generate UI", "Create dashboard", "Build interface"], icon: "🎨", color: "from-pink-500 to-rose-500", systemPrompt: "You are a UI/UX architect specializing in dynamic interfaces. Generate beautiful, responsive components with holographic aesthetics, real-time data binding, and modern design patterns." },
  { id: "platform-orchestrator", name: "Platform Orchestrator", description: "Central hub for AI creation, management, and coordination", capabilities: ["Microservice orchestration", "API routing", "Event handling"], triggers: ["Orchestrate service", "Route request", "Manage pipeline"], icon: "⚙️", color: "from-blue-500 to-indigo-500", systemPrompt: "You are a platform architect. Design and orchestrate distributed systems with multiple microservices, APIs, and event-driven workflows. Ensure reliability, scalability, and seamless integration." },
  { id: "workflow-designer", name: "Workflow Designer", description: "Visual automation pipelines and orchestration", capabilities: ["Flowchart design", "Conditional logic", "Parallel execution"], triggers: ["Create workflow", "Design automation", "Build pipeline"], icon: "🔀", color: "from-green-500 to-emerald-500", systemPrompt: "You are a workflow automation expert. Design visual pipelines, define branching logic, and create complex automations that coordinate multiple agents and tasks." },
  { id: "marketplace", name: "Marketplace", description: "Share, discover, and fork AI agents and components", capabilities: ["Agent publishing", "Version control", "Community features"], triggers: ["Publish agent", "Fork component", "Rate & review"], icon: "🏪", color: "from-orange-500 to-red-500", systemPrompt: "You are a marketplace curator and community builder. Help users publish agents, discover pre-built solutions, manage versions, and engage with the AI builder community." },
  { id: "deployment-manager", name: "Deployment Manager", description: "API endpoints, webhooks, and production deployment", capabilities: ["API generation", "Webhook management", "Load balancing"], triggers: ["Deploy API", "Setup webhook", "Configure endpoint"], icon: "🚀", color: "from-yellow-500 to-orange-500", systemPrompt: "You are a DevOps and deployment specialist. Manage production deployments, API endpoints, webhooks, scaling, monitoring, and ensuring high availability." },
  { id: "crew-integrator", name: "Crew Integrator", description: "Multi-agent crew management and coordination", capabilities: ["Crew composition", "Role assignment", "Inter-agent communication"], triggers: ["Form crew", "Assign roles", "Coordinate agents"], icon: "👥", color: "from-teal-500 to-cyan-500", systemPrompt: "You are a multi-agent systems expert. Design crews of specialized agents, define their roles, establish communication protocols, and orchestrate complex multi-agent workflows." },
  { id: "collaboration", name: "Collaboration", description: "Real-time team features and shared workspaces", capabilities: ["Real-time sync", "Conflict resolution", "Permission management"], triggers: ["Invite team member", "Create workspace", "Share agent"], icon: "🤝", color: "from-violet-500 to-purple-500", systemPrompt: "You are a collaboration platform expert. Enable teams to work together on AI projects, manage permissions, resolve conflicts, and maintain workspace integrity." },
  { id: "astrid-copilot", name: "Astrid Co-pilot", description: "Autonomous optimization and intelligent recommendations", capabilities: ["Auto-optimization", "Smart suggestions", "Performance tuning"], triggers: ["Optimize agent", "Suggest improvement", "Auto-tune parameters"], icon: "✨", color: "from-indigo-500 to-violet-500", systemPrompt: "You are Astrid, an autonomous AI co-pilot. Provide real-time suggestions, auto-optimize configurations, analyze performance metrics, and continuously improve user workflows." },
  { id: "model-playground", name: "Model Playground", description: "Custom LLM tuning, chaining, and experimentation", capabilities: ["Model fine-tuning", "Prompt chaining", "Evaluation framework"], triggers: ["Fine-tune model", "Chain prompts", "Test configuration"], icon: "🎮", color: "from-red-500 to-pink-500", systemPrompt: "You are a machine learning researcher specializing in LLMs. Help users experiment with models, fine-tune on custom data, chain complex prompts, and evaluate outputs." },
];

interface SkillsLibraryTabProps {
  onActivateSkill: (skillName: string, systemPrompt: string) => void;
}

export default function SkillsLibraryTab({ onActivateSkill }: SkillsLibraryTabProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSkills = SKILLS.filter(skill =>
    skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    skill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    skill.capabilities.some(cap => cap.toLowerCase().includes(searchTerm.toLowerCase())) ||
    skill.triggers.some(trig => trig.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="p-6 border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <h2 className="text-2xl font-bold mb-2">⚡ Skills Library</h2>
        <p className="text-sm text-slate-400 mb-4">Activate pre-built AI capabilities and integrated workflows</p>
        <input
          type="text"
          placeholder="Search skills, capabilities, or triggers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      <div className="px-6 py-3 bg-slate-800/50 border-b border-slate-700 flex gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Σ-Matrix Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span>ERPS Online</span>
        </div>
        <div className="text-slate-500">{filteredSkills.length} / {SKILLS.length} skills available</div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map(skill => (
            <div key={skill.id} className={`bg-gradient-to-br ${skill.color} p-0.5 rounded-lg hover:shadow-lg transition-all cursor-pointer`}>
              <div className="bg-slate-800 rounded-lg p-4 h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{skill.icon}</span>
                  <div className="text-right text-xs"><div className="text-slate-400">Tier</div><div className="font-bold text-cyan-400">Pro</div></div>
                </div>
                <h3 className="font-bold text-lg mb-2">{skill.name}</h3>
                <p className="text-sm text-slate-300 mb-3 flex-1">{skill.description}</p>
                <div className="mb-3">
                  <div className="text-xs text-slate-400 mb-1">Capabilities:</div>
                  <div className="flex flex-wrap gap-1">{skill.capabilities.map(cap => <span key={cap} className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-200">{cap}</span>)}</div>
                </div>
                <div className="mb-3">
                  <div className="text-xs text-slate-400 mb-1">Quick Actions:</div>
                  <div className="flex flex-wrap gap-1">{skill.triggers.map(trigger => <span key={trigger} className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-300">{trigger}</span>)}</div>
                </div>
                <button
                  onClick={() => onActivateSkill(skill.name, skill.systemPrompt)}
                  className="w-full mt-auto py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded font-semibold text-sm transition-all"
                >
                  ⚡ Activate {skill.name.split(' ')[0]}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {filteredSkills.length === 0 && <div className="flex-1 flex items-center justify-center"><p className="text-slate-400">No skills match "{searchTerm}"</p></div>}
    </div>
  );
}