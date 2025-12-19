import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  TreePine, 
  GitBranch, 
  Binary, 
  Layers, 
  ChevronRight, 
  Code2, 
  BookOpen, 
  Cpu, 
  Network, 
  Terminal,
  Zap,
  Info,
  Box,
  Layout
} from 'lucide-react';

// --- Types & Data ---

type NodeData = {
  id: string;
  value: string | number;
  left?: NodeData;
  right?: NodeData;
  x?: number;
  y?: number;
};

const TREE_PRESETS: Record<string, NodeData> = {
  binary: {
    id: '1', value: 10,
    left: { id: '2', value: 5, left: { id: '4', value: 2 }, right: { id: '5', value: 7 } },
    right: { id: '3', value: 15, left: { id: '6', value: 12 }, right: { id: '7', value: 20 } }
  },
  skewed: {
    id: '1', value: 1,
    right: { id: '2', value: 2, right: { id: '3', value: 3, right: { id: '4', value: 4 } } }
  },
  bst: {
    id: '1', value: 50,
    left: { id: '2', value: 30, left: { id: '4', value: 20 }, right: { id: '5', value: 40 } },
    right: { id: '3', value: 70, left: { id: '6', value: 60 }, right: { id: '7', value: 80 } }
  }
};

const PYTHON_SNIPPETS = {
  traversal: `def preorder(node):
    if node:
        print(node.val)
        preorder(node.left)
        preorder(node.right)

def inorder(node):
    if node:
        inorder(node.left)
        print(node.val)
        inorder(node.right)

def postorder(node):
    if node:
        postorder(node.left)
        postorder(node.right)
        print(node.val)`,
  bst: `class Node:
    def __init__(self, key):
        self.left = None
        self.right = None
        self.val = key

def insert(root, key):
    if root is None:
        return Node(key)
    else:
        if root.val < key:
            root.right = insert(root.right, key)
        else:
            root.left = insert(root.left, key)
    return root`
};

// --- Components ---

const SidebarItem = ({ active, icon: Icon, label, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30' 
        : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
    }`}
  >
    <Icon size={18} />
    <span className="font-medium text-sm">{label}</span>
  </button>
);

const TreeVisualizer = ({ data, activeNodeId, visitedIds = [] }: { data: NodeData, activeNodeId?: string, visitedIds?: string[] }) => {
  const canvasWidth = 600;
  const canvasHeight = 400;

  // Calculate coordinates
  const calculatePositions = (node: NodeData, depth: number, xStart: number, xEnd: number): NodeData => {
    const x = (xStart + xEnd) / 2;
    const y = depth * 80 + 60;
    return {
      ...node,
      x, y,
      left: node.left ? calculatePositions(node.left, depth + 1, xStart, x) : undefined,
      right: node.right ? calculatePositions(node.right, depth + 1, x, xEnd) : undefined
    };
  };

  const treeWithPos = useMemo(() => calculatePositions(data, 0, 0, canvasWidth), [data]);

  const renderLinks = (node: NodeData) => {
    const links: React.ReactNode[] = [];
    if (node.left && node.x && node.y && node.left.x && node.left.y) {
      links.push(
        <line 
          key={`l-${node.id}`} 
          x1={node.x} y1={node.y} x2={node.left.x} y2={node.left.y} 
          stroke="#475569" strokeWidth="2" strokeLinecap="round"
        />
      );
      links.push(...renderLinks(node.left));
    }
    if (node.right && node.x && node.y && node.right.x && node.right.y) {
      links.push(
        <line 
          key={`r-${node.id}`} 
          x1={node.x} y1={node.y} x2={node.right.x} y2={node.right.y} 
          stroke="#475569" strokeWidth="2" strokeLinecap="round"
        />
      );
      links.push(...renderLinks(node.right));
    }
    return links;
  };

  const renderNodes = (node: NodeData) => {
    const nodes: React.ReactNode[] = [];
    const isActive = node.id === activeNodeId;
    const isVisited = visitedIds.includes(node.id);

    nodes.push(
      <g key={`node-g-${node.id}`} className="tree-node">
        {isActive && (
          <circle 
            cx={node.x} cy={node.y} r="28" 
            className="fill-emerald-500/30 traversal-highlight"
          />
        )}
        <circle 
          cx={node.x} cy={node.y} r="20" 
          fill={isActive ? "#10b981" : (isVisited ? "#065f46" : "#1e293b")}
          stroke={isActive ? "#34d399" : "#475569"}
          strokeWidth="2"
        />
        <text 
          x={node.x} y={node.y} 
          dy=".35em" textAnchor="middle" 
          fill="white" className="text-xs font-bold pointer-events-none select-none"
        >
          {node.value}
        </text>
      </g>
    );
    if (node.left) nodes.push(...renderNodes(node.left));
    if (node.right) nodes.push(...renderNodes(node.right));
    return nodes;
  };

  return (
    <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-slate-900/40 rounded-xl border border-slate-700/50 overflow-hidden">
      <svg 
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`} 
        className="w-full h-auto max-h-[400px] max-w-[600px] drop-shadow-2xl"
        preserveAspectRatio="xMidYMid meet"
      >
        {renderLinks(treeWithPos)}
        {renderNodes(treeWithPos)}
      </svg>
    </div>
  );
};

const SectionHeader = ({ title, icon: Icon, description }: any) => (
  <div className="mb-8">
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
        <Icon size={24} />
      </div>
      <h2 className="text-2xl font-bold text-slate-100">{title}</h2>
    </div>
    <p className="text-slate-400 max-w-2xl">{description}</p>
  </div>
);

const App = () => {
  const [activeTab, setActiveTab] = useState('intro');
  const [traversalType, setTraversalType] = useState('preorder');
  const [traversalStep, setTraversalStep] = useState(-1);
  const [visited, setVisited] = useState<string[]>([]);

  // Simulation logic for traversal
  const getTraversalOrder = (node: NodeData, type: string): string[] => {
    const order: string[] = [];
    const walk = (n?: NodeData) => {
      if (!n) return;
      if (type === 'preorder') order.push(n.id);
      walk(n.left);
      if (type === 'inorder') order.push(n.id);
      walk(n.right);
      if (type === 'postorder') order.push(n.id);
    };
    walk(node);
    return order;
  };

  const startTraversal = () => {
    setTraversalStep(0);
    setVisited([]);
  };

  useEffect(() => {
    if (traversalStep >= 0) {
      const order = getTraversalOrder(TREE_PRESETS.binary, traversalType);
      if (traversalStep < order.length) {
        const timer = setTimeout(() => {
          setVisited(prev => [...prev, order[traversalStep]]);
          setTraversalStep(prev => prev + 1);
        }, 800);
        return () => clearTimeout(timer);
      } else {
        setTraversalStep(-1);
      }
    }
  }, [traversalStep, traversalType]);

  const currentOrder = useMemo(() => getTraversalOrder(TREE_PRESETS.binary, traversalType), [traversalType]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f172a] text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-md flex flex-col p-4 z-10">
        <div className="flex items-center gap-2 px-2 mb-8">
          <TreePine className="text-emerald-500" size={28} />
          <h1 className="text-xl font-bold tracking-tight text-white">TreeExplorer</h1>
        </div>

        <nav className="space-y-1 flex-1">
          <SidebarItem 
            active={activeTab === 'intro'} 
            icon={BookOpen} label="Introduction" 
            onClick={() => setActiveTab('intro')} 
          />
          <SidebarItem 
            active={activeTab === 'types'} 
            icon={GitBranch} label="Tree Types" 
            onClick={() => setActiveTab('types')} 
          />
          <SidebarItem 
            active={activeTab === 'traversals'} 
            icon={Zap} label="Traversals" 
            onClick={() => setActiveTab('traversals')} 
          />
          <SidebarItem 
            active={activeTab === 'advanced'} 
            icon={Layers} label="Advanced Trees" 
            onClick={() => setActiveTab('advanced')} 
          />
          <SidebarItem 
            active={activeTab === 'applications'} 
            icon={Cpu} label="Applications" 
            onClick={() => setActiveTab('applications')} 
          />
        </nav>

        <div className="pt-4 mt-4 border-t border-slate-800">
          <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
            <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-widest">Global Complexity</p>
            <div className="flex justify-between items-center">
              <span className="text-slate-300 text-xs">Traversals</span>
              <span className="text-emerald-400 font-mono text-sm">O(n)</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          
          {/* Introduction Section */}
          {activeTab === 'intro' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SectionHeader 
                title="Introduction to Trees" 
                icon={BookOpen}
                description="A hierarchical, non-linear data structure consisting of nodes connected by edges."
              />
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12 items-stretch">
                <div className="glass-panel p-8 rounded-2xl flex flex-col">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-white">
                    <Info size={18} className="text-emerald-400" />
                    Key Terminology
                  </h3>
                  <div className="space-y-6 flex-1">
                    {[
                      { term: 'Root', desc: 'Topmost node with no parent.' },
                      { term: 'Parent / Child', desc: 'Hierarchical relationship where one node is the predecessor of others.' },
                      { term: 'Leaf Node', desc: 'Node with no children (terminal nodes).' },
                      { term: 'Subtree', desc: 'A tree formed from any node and its descendants.' }
                    ].map((item, i) => (
                      <div key={i} className="flex gap-4 group">
                        <div className="w-1 h-full min-h-[40px] rounded-full bg-slate-700 group-hover:bg-emerald-500 transition-colors shrink-0" />
                        <div>
                          <p className="font-bold text-slate-100">{item.term}</p>
                          <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-4 min-h-[400px]">
                  <div className="glass-panel p-6 rounded-2xl flex-1 flex flex-col items-center justify-center overflow-hidden">
                    <TreeVisualizer data={TREE_PRESETS.binary} />
                    <p className="text-xs text-slate-500 mt-4 italic font-medium">Standard Hierarchical Visualization</p>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-2xl">
                <h3 className="text-emerald-400 font-semibold mb-2 flex items-center gap-2">
                  <Layout size={18} />
                  Non-Linear Nature
                </h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  Unlike linear data structures like Arrays or Stacks, Trees organize data in a way that represents complex relationships. This hierarchical nature allows for faster searching (in BSTs) and natural representation of nested structures like file systems or XML documents.
                </p>
              </div>
            </div>
          )}

          {/* Tree Types Section */}
          {activeTab === 'types' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SectionHeader 
                title="Classification of Trees" 
                icon={GitBranch}
                description="Categorizing trees based on their branching factors and structural properties."
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {[
                  { title: 'General Tree', desc: 'Any node can have any number of children.', icon: Network },
                  { title: 'Binary Tree', desc: 'At most two children (left & right).', icon: Binary },
                  { title: 'Ternary Tree', desc: 'At most three children per node.', icon: GitBranch }
                ].map((t, i) => (
                  <div key={i} className="glass-panel p-6 rounded-xl hover:bg-slate-800/60 transition-all border-slate-700/50 hover:border-emerald-500/30">
                    <t.icon className="text-emerald-400 mb-4" size={24} />
                    <h4 className="font-bold mb-2 text-white">{t.title}</h4>
                    <p className="text-sm text-slate-400">{t.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mb-10">
                <h3 className="text-xl font-bold mb-6 text-slate-100 border-b border-slate-800 pb-2">Binary Tree Variants</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: 'Full Binary Tree', desc: 'Each node has exactly 0 or 2 children.' },
                    { name: 'Complete Binary Tree', desc: 'Levels filled except possibly last (left-aligned).' },
                    { name: 'Perfect Binary Tree', desc: 'All levels completely filled.' },
                    { name: 'Skewed Tree', desc: 'Nodes only on one side (Left/Right Skewed).' },
                    { name: 'Balanced Binary Tree', desc: 'Height difference ≤ 1 between subtrees.' },
                    { name: 'Binary Search Tree (BST)', desc: 'Maintains Left < Root < Right sorted property.' }
                  ].map((v, i) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 flex items-start gap-3 hover:bg-slate-800/50 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <div>
                        <span className="font-bold block text-slate-200 text-sm mb-1">{v.name}</span>
                        <span className="text-[12px] text-slate-500 leading-tight">{v.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel rounded-2xl p-8 border-slate-700/40">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <Code2 className="text-emerald-400" size={20} />
                    <h3 className="font-bold text-lg text-white">Binary Search Tree (BST) Node</h3>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-[10px] text-slate-400 font-mono tracking-widest font-bold">PYTHON</div>
                </div>
                <pre className="code-font text-sm text-emerald-300/90 bg-[#020617] p-6 rounded-xl overflow-x-auto border border-slate-800 shadow-inner">
                  {PYTHON_SNIPPETS.bst}
                </pre>
              </div>
            </div>
          )}

          {/* Traversals Section */}
          {activeTab === 'traversals' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SectionHeader 
                title="Tree Traversal Algorithms" 
                icon={Zap}
                description="Visiting each node exactly once. Essential for searching and manipulating tree data."
              />

              <div className="flex flex-col xl:flex-row gap-8">
                <div className="flex-1 space-y-6">
                  <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900/80 rounded-xl w-fit border border-slate-700/50">
                    {['preorder', 'inorder', 'postorder'].map((type) => (
                      <button
                        key={type}
                        onClick={() => { setTraversalType(type); setTraversalStep(-1); setVisited([]); }}
                        className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                          traversalType === type 
                            ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(5,150,105,0.3)]' 
                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {type === 'preorder' ? 'Preorder (R-L-R)' : type === 'inorder' ? 'Inorder (L-R-R)' : 'Postorder (L-R-R)'}
                      </button>
                    ))}
                  </div>

                  <div className="relative glass-panel rounded-2xl p-4 md:p-8 min-h-[450px] flex items-center justify-center">
                    <TreeVisualizer 
                      data={TREE_PRESETS.binary} 
                      activeNodeId={traversalStep >= 0 ? currentOrder[traversalStep] : undefined}
                      visitedIds={visited}
                    />
                    <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur border border-slate-700 p-2 rounded-lg text-[10px] font-mono text-emerald-400">
                      STATUS: {traversalStep >= 0 ? 'EXECUTING...' : 'IDLE'}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <button 
                      onClick={startTraversal}
                      className="w-full sm:w-auto flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-black shadow-[0_10px_30px_rgba(5,150,105,0.2)] transition-all active:scale-95 group"
                    >
                      <Terminal size={20} className="group-hover:rotate-12 transition-transform" />
                      START VISUALIZATION
                    </button>
                    
                    <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-700/50 shadow-inner">
                      <p className="text-[10px] font-black text-slate-500 mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                        <ChevronRight size={14} className="text-emerald-500" />
                        Sequence Output
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {currentOrder.map((id, i) => {
                          const nodeValue = id === '1' ? 10 : id === '2' ? 5 : id === '3' ? 15 : id === '4' ? 2 : id === '5' ? 7 : id === '6' ? 12 : 20;
                          const isDone = visited.includes(id);
                          const isCurrent = traversalStep >= 0 && currentOrder[traversalStep] === id;
                          return (
                            <div 
                              key={i} 
                              className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm border-2 transition-all duration-300 ${
                                isCurrent 
                                  ? 'bg-emerald-500 border-emerald-300 text-white scale-125 z-10 shadow-[0_0_25px_rgba(16,185,129,0.6)]' 
                                  : isDone 
                                    ? 'bg-slate-800 border-emerald-600/50 text-emerald-400 shadow-md' 
                                    : 'bg-slate-950 border-slate-800 text-slate-600 opacity-40'
                              }`}
                            >
                              {nodeValue}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full xl:w-[400px] space-y-6">
                  <div className="glass-panel p-6 rounded-2xl border-slate-700/30">
                    <h4 className="font-bold text-slate-100 mb-4 flex items-center gap-2">
                      <Code2 size={18} className="text-emerald-400" />
                      DFS Strategy
                    </h4>
                    <pre className="code-font text-[12px] leading-relaxed text-slate-300 bg-[#020617] p-4 rounded-xl border border-slate-800 max-h-[400px] overflow-y-auto custom-scrollbar">
                      {PYTHON_SNIPPETS.traversal}
                    </pre>
                  </div>
                  <div className="bg-blue-500/5 border border-blue-500/20 p-6 rounded-2xl relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-10">
                      <Layers size={100} className="text-blue-400" />
                    </div>
                    <h4 className="text-blue-400 text-sm font-black mb-2 uppercase tracking-wider">Level Order (BFS)</h4>
                    <p className="text-[13px] text-slate-400 leading-relaxed relative z-10">
                      Explores the tree level by level using a <strong>Queue</strong> data structure. Guarantees visiting nodes closest to the root first.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Trees Section */}
          {activeTab === 'advanced' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SectionHeader 
                title="Specialized Tree Architectures" 
                icon={Layers}
                description="Engineered for maximum efficiency in searching, indexing, and persistent storage."
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { title: 'Heap (Max/Min)', desc: 'Complete binary tree used in priority queues. Efficiently retrieves max/min element in O(1).', tag: 'Fast Access' },
                  { title: 'Trie (Prefix Tree)', desc: 'Dictionary storage where edges represent characters. Ideal for auto-complete and spell checkers.', tag: 'Text Processing' },
                  { title: 'Self-Balancing (AVL)', desc: 'Maintains height balance automatically during insertion. Guarantees O(log n) worst-case search.', tag: 'Stability' },
                  { title: 'B-Tree & B+', desc: 'Optimized for large systems. Reduces disk I/O significantly, used in every major database engine.', tag: 'Heavy Data' }
                ].map((tree, i) => (
                  <div key={i} className="glass-panel p-8 rounded-3xl relative overflow-hidden group border-slate-700/40 hover:border-emerald-500/40 transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-12 -mt-12 group-hover:bg-emerald-500/10 transition-all" />
                    <div className="flex justify-between items-start mb-6">
                      <h4 className="text-2xl font-black text-white">{tree.title}</h4>
                      <span className="px-3 py-1 rounded-lg text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black uppercase tracking-widest shadow-sm">{tree.tag}</span>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed mb-8">{tree.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {['Segment Tree', 'Suffix Tree', 'Decision Tree'].map(tag => (
                        <span key={tag} className="text-[11px] font-bold text-slate-500 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Applications Section */}
          {activeTab === 'applications' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SectionHeader 
                title="Real-World Impact" 
                icon={Cpu}
                description="From the operating system kernel to the browser DOM, trees are the backbone of computing."
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { title: 'Modern File Systems', icon: Layers, desc: 'NTFS, EXT4, and APFS use tree variants to manage nested file/folder hierarchies efficiently.' },
                  { title: 'Database Indexing', icon: Terminal, desc: 'SQL databases use B-Trees to find records among billions of rows in milliseconds.' },
                  { title: 'Network Infrastructure', icon: Network, desc: 'OSPF and Spanning Tree Protocols (STP) use trees to find optimal data paths without loops.' },
                  { title: 'Syntax Analysis', icon: Code2, desc: 'Compilers build Abstract Syntax Trees (AST) to transform source code into machine instructions.' },
                  { title: 'AI Reasoning', icon: Zap, desc: 'Decision Trees and Random Forests form the logic of critical machine learning prediction models.' },
                  { title: 'Web Development', icon: Box, desc: 'Every website you visit is rendered through the DOM (Document Object Model) tree structure.' }
                ].map((app, i) => (
                  <div key={i} className="glass-panel p-8 rounded-3xl group hover:bg-slate-800/40 transition-all border-slate-700/50 flex flex-col items-center text-center">
                    <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400 w-fit mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-900/20">
                      <app.icon size={28} />
                    </div>
                    <h4 className="font-black text-lg text-white mb-4">{app.title}</h4>
                    <p className="text-sm text-slate-400 leading-relaxed font-medium">{app.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);