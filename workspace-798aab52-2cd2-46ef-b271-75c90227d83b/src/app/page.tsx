"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  CheckCircle2, 
  Clock, 
  Target, 
  Trophy, 
  Flame, 
  Calendar as CalendarIcon,
  Brain,
  Timer,
  ListTodo,
  BarChart3,
  Zap,
  Star,
  Award,
  BookOpen,
  Coffee,
  Play,
  Pause,
  RotateCcw,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Sunrise,
  Sunset,
  Moon,
  Bell,
  Repeat,
  AlertCircle,
  TrendingUp,
  CalendarDays,
  Clock3,
  ArrowRight,
  Filter,
  Search,
  Download,
  Upload,
  Share2,
  Settings,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  xp: number;
  priority: 'low' | 'medium' | 'high';
  description?: string;
  category?: string;
  subject?: string;
  dueDate?: Date;
  createdAt: Date;
  parentId?: string;
  subtasks?: Task[];
}

interface StudySession {
  id: string;
  subject: string;
  duration: number;
  xp: number;
  timestamp: Date;
}

interface ScheduledTask {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  subject?: string;
  recurring?: boolean;
  recurringType?: 'daily' | 'weekly' | 'monthly';
  reminder?: boolean;
  reminderTime?: string;
  notes?: string;
  color?: string;
  completed: boolean;
}

export default function StudyDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userStats, setUserStats] = useState({
    level: 1,
    totalXP: 0,
    currentLevelXP: 0,
    nextLevelXP: 100,
    streak: 0,
    totalStudyTime: 0,
    completedTasks: 0,
  });
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isScheduleTaskOpen, setIsScheduleTaskOpen] = useState(false);
  const [isQuickScheduleOpen, setIsQuickScheduleOpen] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as 'low' | 'medium' | 'high',
    category: "general",
    subject: "",
    xp: 10,
    parentId: null as string | null
  });
  
  const [scheduleForm, setScheduleForm] = useState({
    title: "",
    date: new Date(),
    startTime: "",
    endTime: "",
    priority: "medium" as 'low' | 'medium' | 'high',
    category: "general",
    subject: "",
    recurring: false,
    recurringType: "daily" as 'daily' | 'weekly' | 'monthly',
    reminder: false,
    reminderTime: "15",
    notes: "",
    color: "#3b82f6"
  });

  const [quickScheduleForm, setQuickScheduleForm] = useState({
    title: "",
    duration: 30,
    subject: "",
    type: "study" as 'study' | 'break' | 'pomodoro' | 'review',
    startTime: ""
  });

  const [pomodoroState, setPomodoroState] = useState({
    isActive: false,
    isBreak: false,
    timeLeft: 25 * 60,
    sessions: 0,
    settings: {
      workDuration: 25,
      breakDuration: 5,
      longBreakDuration: 15,
    }
  });

  const [studySessions, setStudySessions] = useState<StudySession[]>([]);

  // Load data from database on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      // Load user stats
      const statsResponse = await fetch('/api/user/stats');
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        setUserStats(stats);
      }

      // Load tasks
      const tasksResponse = await fetch('/api/tasks');
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        const organizedTasks = organizeTasks(tasksData);
        setTasks(organizedTasks);
      }

      // Load scheduled tasks
      const scheduledResponse = await fetch('/api/scheduled-tasks');
      if (scheduledResponse.ok) {
        const scheduledData = await scheduledResponse.json();
        setScheduledTasks(scheduledData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const organizeTasks = (tasksData: any[]): Task[] => {
    const taskMap = new Map();
    const rootTasks: Task[] = [];

    // First pass: create all tasks and map them
    tasksData.forEach(task => {
      const taskObj: Task = {
        ...task,
        subtasks: []
      };
      taskMap.set(task.id, taskObj);
    });

    // Second pass: organize hierarchy
    tasksData.forEach(task => {
      const taskObj = taskMap.get(task.id);
      if (task.parentId) {
        const parent = taskMap.get(task.parentId);
        if (parent) {
          parent.subtasks = parent.subtasks || [];
          parent.subtasks.push(taskObj);
        }
      } else {
        rootTasks.push(taskObj);
      }
    });

    return rootTasks;
  };

  // Pomodoro Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (pomodoroState.isActive && pomodoroState.timeLeft > 0) {
      interval = setInterval(() => {
        setPomodoroState(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1
        }));
      }, 1000);
    } else if (pomodoroState.timeLeft === 0) {
      handlePomodoroComplete();
    }

    return () => clearInterval(interval);
  }, [pomodoroState.isActive, pomodoroState.timeLeft]);

  const handlePomodoroComplete = async () => {
    setPomodoroState(prev => {
      const newSessions = prev.isBreak ? prev.sessions : prev.sessions + 1;
      const isLongBreak = newSessions > 0 && newSessions % 4 === 0;
      const nextDuration = prev.isBreak 
        ? prev.settings.workDuration 
        : isLongBreak 
          ? prev.settings.longBreakDuration 
          : prev.settings.breakDuration;
      
      return {
        ...prev,
        isActive: false,
        isBreak: !prev.isBreak,
        timeLeft: nextDuration * 60,
        sessions: newSessions
      };
    });

    // Award XP for completed work session
    if (!pomodoroState.isBreak) {
      await updateUserStats(25);
      await savePomodoroSession(pomodoroState.settings.workDuration, false);
    }
  };

  const togglePomodoro = () => {
    setPomodoroState(prev => ({ ...prev, isActive: !prev.isActive }));
  };

  const resetPomodoro = () => {
    setPomodoroState(prev => ({
      ...prev,
      isActive: false,
      isBreak: false,
      timeLeft: prev.settings.workDuration * 60
    }));
  };

  const addTask = async () => {
    if (!newTask.title.trim()) return;

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });

      if (response.ok) {
        const task = await response.json();
        await loadAllData(); // Reload all data to get proper hierarchy
        setNewTask({
          title: "",
          description: "",
          priority: "medium",
          category: "general",
          subject: "",
          xp: 10,
          parentId: null
        });
        setIsAddTaskOpen(false);
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const toggleTask = async (taskId: string) => {
    const findTask = (tasks: Task[]): Task | null => {
      for (const task of tasks) {
        if (task.id === taskId) return task;
        if (task.subtasks) {
          const found = findTask(task.subtasks);
          if (found) return found;
        }
      }
      return null;
    };

    const task = findTask(tasks);
    if (!task) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed })
      });

      if (response.ok) {
        await loadAllData(); // Reload to get updated hierarchy
        if (!task.completed) {
          await updateUserStats(task.xp);
        } else {
          await updateUserStats(-task.xp);
        }
      }
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const addSubtask = (parentTaskId: string) => {
    setNewTask(prev => ({ ...prev, parentId: parentTaskId }));
    setIsAddTaskOpen(true);
  };

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const scheduleTask = async () => {
    if (!scheduleForm.title.trim() || !scheduleForm.startTime || !scheduleForm.endTime) return;

    try {
      const response = await fetch('/api/scheduled-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleForm)
      });

      if (response.ok) {
        await loadAllData(); // Reload scheduled tasks
        setScheduleForm({
          title: "",
          date: new Date(),
          startTime: "",
          endTime: "",
          priority: "medium",
          category: "general",
          subject: "",
          recurring: false,
          recurringType: "daily",
          reminder: false,
          reminderTime: "15",
          notes: "",
          color: "#3b82f6"
        });
        setIsScheduleTaskOpen(false);
      }
    } catch (error) {
      console.error('Error scheduling task:', error);
    }
  };

  const quickScheduleTask = async () => {
    if (!quickScheduleForm.title.trim() || !quickScheduleForm.startTime) return;

    const now = new Date();
    const [hours, minutes] = quickScheduleForm.startTime.split(':');
    const startDate = new Date(now);
    startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + quickScheduleForm.duration);

    const scheduleData = {
      title: quickScheduleForm.title,
      date: now.toISOString().split('T')[0],
      startTime: quickScheduleForm.startTime,
      endTime: `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`,
      priority: "medium",
      subject: quickScheduleForm.subject,
      category: quickScheduleForm.type,
      color: quickScheduleForm.type === 'study' ? '#10b981' : quickScheduleForm.type === 'pomodoro' ? '#ef4444' : quickScheduleForm.type === 'break' ? '#f59e0b' : '#8b5cf6'
    };

    try {
      const response = await fetch('/api/scheduled-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData)
      });

      if (response.ok) {
        await loadAllData();
        setQuickScheduleForm({
          title: "",
          duration: 30,
          subject: "",
          type: "study",
          startTime: ""
        });
        setIsQuickScheduleOpen(false);
      }
    } catch (error) {
      console.error('Error quick scheduling task:', error);
    }
  };

  const deleteScheduledTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/scheduled-tasks/${taskId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadAllData();
      }
    } catch (error) {
      console.error('Error deleting scheduled task:', error);
    }
  };

  const updateUserStats = async (xpChange: number) => {
    const newTotalXP = userStats.totalXP + xpChange;
    const newLevel = Math.floor(newTotalXP / 100) + 1;
    const nextLevelXP = newLevel * 100;
    const currentLevelXP = newTotalXP % nextLevelXP;

    const newStats = {
      ...userStats,
      totalXP: newTotalXP,
      level: newLevel,
      currentLevelXP,
      nextLevelXP,
      completedTasks: xpChange > 0 ? userStats.completedTasks + 1 : Math.max(0, userStats.completedTasks - 1)
    };

    setUserStats(newStats);

    try {
      await fetch('/api/user/stats', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          xp: newTotalXP, 
          level: newLevel,
          completedTasks: newStats.completedTasks 
        })
      });
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  };

  const savePomodoroSession = async (duration: number, isBreak: boolean) => {
    try {
      await fetch('/api/pomodoro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration, isBreak, sessionType: isBreak ? 'short_break' : 'work' })
      });
    } catch (error) {
      console.error('Error saving pomodoro session:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const levelProgress = (userStats.currentLevelXP / userStats.nextLevelXP) * 100;

  // Get tasks scheduled for selected date
  const getScheduledTasksForDate = (date: Date) => {
    return scheduledTasks.filter(task => {
      const taskDate = new Date(task.date);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  // Get week view dates
  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(currentMonth);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Render task with subtasks
  const renderTask = (task: Task, level: number = 0) => {
    const isExpanded = expandedTasks.has(task.id);
    const hasSubtasks = task.subtasks && task.subtasks.length > 0;
    
    return (
      <div key={task.id} className={`${level > 0 ? 'ml-6' : ''}`}>
        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleTask(task.id)}
              className="p-2"
            >
              {task.completed ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
              )}
            </Button>
            
            {hasSubtasks && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleTaskExpansion(task.id)}
                className="p-1"
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            )}
            
            <div>
              <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                {task.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}>
                  {task.priority}
                </Badge>
                <span className="text-xs text-gray-500">+{task.xp} XP</span>
                {task.category && <span className="text-xs text-gray-500">{task.category}</span>}
                {hasSubtasks && (
                  <span className="text-xs text-gray-500">
                    {task.subtasks?.length} subtasks
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {task.completed && (
              <Badge variant="outline" className="text-green-600">
                <Star className="w-3 h-3 mr-1" />
                Earned
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => addSubtask(task.id)}
              className="p-2"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {isExpanded && hasSubtasks && (
          <div className="mt-2 space-y-2">
            {task.subtasks?.map(subtask => renderTask(subtask, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Brain className="w-8 h-8 text-purple-600" />
              StudyQuest
            </h1>
            <p className="text-gray-600 dark:text-gray-300">Level up your learning journey</p>
          </div>
          
          {/* User Stats Card */}
          <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">Lv. {userStats.level}</div>
                  <div className="text-xs opacity-90">{userStats.totalXP} XP</div>
                </div>
                <Separator orientation="vertical" className="h-10 bg-white/20" />
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-300" />
                  <span className="font-semibold">{userStats.streak}</span>
                  <span className="text-xs">day streak</span>
                </div>
              </div>
              <Progress value={levelProgress} className="mt-3 bg-white/20" />
              <div className="text-xs mt-1 opacity-90">
                {userStats.currentLevelXP}/{userStats.nextLevelXP} XP to next level
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <ListTodo className="w-4 h-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="pomodoro" className="flex items-center gap-2">
              <Timer className="w-4 h-4" />
              Pomodoro
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Schedule
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Study Time</p>
                      <p className="text-2xl font-bold">{Math.floor(userStats.totalStudyTime / 60)}h {userStats.totalStudyTime % 60}m</p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Tasks Done</p>
                      <p className="text-2xl font-bold">{userStats.completedTasks}</p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Current Streak</p>
                      <p className="text-2xl font-bold">{userStats.streak} days</p>
                    </div>
                    <Flame className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Achievements</p>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                    <Trophy className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  Welcome to StudyQuest!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Start fresh at Level 1</span>
                    </div>
                    <Badge variant="secondary">Ready!</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="flex items-center gap-3">
                      <ListTodo className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Create your first task</span>
                    </div>
                    <Badge variant="secondary">+10 XP</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Timer className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">Try a Pomodoro session</span>
                    </div>
                    <Badge variant="secondary">+25 XP</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Tasks Tab with Subtasks */}
          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ListTodo className="w-5 h-5" />
                    Your Tasks
                  </CardTitle>
                  <CardDescription>Complete tasks to earn XP and level up!</CardDescription>
                </div>
                <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Task</DialogTitle>
                      <DialogDescription>
                        {newTask.parentId ? "Add a subtask" : "Add a new task to your study list"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Task title"
                        value={newTask.title}
                        onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                      />
                      <Textarea
                        placeholder="Description (optional)"
                        value={newTask.description}
                        onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Select value={newTask.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setNewTask(prev => ({ ...prev, priority: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          placeholder="XP"
                          value={newTask.xp}
                          onChange={(e) => setNewTask(prev => ({ ...prev, xp: parseInt(e.target.value) || 10 }))}
                        />
                      </div>
                      <Input
                        placeholder="Category"
                        value={newTask.category}
                        onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value }))}
                      />
                      <Input
                        placeholder="Subject"
                        value={newTask.subject}
                        onChange={(e) => setNewTask(prev => ({ ...prev, subject: e.target.value }))}
                      />
                      <Button onClick={addTask} className="w-full">Create Task</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks.length === 0 ? (
                    <div className="text-center py-8">
                      <ListTodo className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500">No tasks yet. Create your first task!</p>
                    </div>
                  ) : (
                    tasks.map(task => renderTask(task))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pomodoro Tab */}
          <TabsContent value="pomodoro" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="w-5 h-5" />
                  Pomodoro Timer
                </CardTitle>
                <CardDescription>Focus for 25 minutes, then take a 5-minute break</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className={`text-6xl font-bold font-mono ${pomodoroState.isBreak ? 'text-green-600' : 'text-blue-600'}`}>
                    {formatTime(pomodoroState.timeLeft)}
                  </div>
                  <div className="mt-2 text-lg font-medium">
                    {pomodoroState.isBreak ? (
                      <span className="flex items-center justify-center gap-2 text-green-600">
                        <Coffee className="w-5 h-5" />
                        Break Time
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2 text-blue-600">
                        <Brain className="w-5 h-5" />
                        Focus Time
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-center gap-3">
                  <Button
                    onClick={togglePomodoro}
                    size="lg"
                    className="px-8"
                  >
                    {pomodoroState.isActive ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={resetPomodoro}
                    variant="outline"
                    size="lg"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{pomodoroState.sessions}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Sessions</div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{pomodoroState.sessions * 25}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Minutes</div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{pomodoroState.sessions * 25}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">XP Earned</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Study Sessions Tab */}
          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Study Sessions
                </CardTitle>
                <CardDescription>Track your study progress across different subjects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studySessions.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500">No study sessions yet. Start studying!</p>
                    </div>
                  ) : (
                    studySessions.map(session => (
                      <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{session.subject}</p>
                            <p className="text-sm text-gray-500">{session.duration} minutes</p>
                          </div>
                        </div>
                        <Badge variant="secondary">+{session.xp} XP</Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Simplified Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  Quick Schedule
                </CardTitle>
                <CardDescription>Quickly add tasks to your schedule</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Dialog open={isQuickScheduleOpen} onOpenChange={setIsQuickScheduleOpen}>
                    <DialogTrigger asChild>
                      <Button className="h-16 flex-col">
                        <Clock3 className="w-6 h-6 mb-2" />
                        Quick Add
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Quick Schedule</DialogTitle>
                        <DialogDescription>Quickly add a task to today</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="quick-title">Title</Label>
                          <Input
                            id="quick-title"
                            placeholder="Task title"
                            value={quickScheduleForm.title}
                            onChange={(e) => setQuickScheduleForm(prev => ({ ...prev, title: e.target.value }))}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="quick-duration">Duration (min)</Label>
                            <Input
                              id="quick-duration"
                              type="number"
                              value={quickScheduleForm.duration}
                              onChange={(e) => setQuickScheduleForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="quick-start">Start Time</Label>
                            <Input
                              id="quick-start"
                              type="time"
                              value={quickScheduleForm.startTime}
                              onChange={(e) => setQuickScheduleForm(prev => ({ ...prev, startTime: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="quick-subject">Subject</Label>
                          <Input
                            id="quick-subject"
                            placeholder="Subject"
                            value={quickScheduleForm.subject}
                            onChange={(e) => setQuickScheduleForm(prev => ({ ...prev, subject: e.target.value }))}
                          />
                        </div>
                        <Button onClick={quickScheduleTask} className="w-full">Add to Schedule</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog open={isScheduleTaskOpen} onOpenChange={setIsScheduleTaskOpen}>
                    <DialogTrigger asChild>
                      <Button className="h-16 flex-col" variant="outline">
                        <CalendarIcon className="w-6 h-6 mb-2" />
                        Detailed Schedule
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Detailed Schedule</DialogTitle>
                        <DialogDescription>Add a detailed task to your schedule</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="schedule-title">Title</Label>
                          <Input
                            id="schedule-title"
                            placeholder="Task title"
                            value={scheduleForm.title}
                            onChange={(e) => setScheduleForm(prev => ({ ...prev, title: e.target.value }))}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="schedule-date">Date</Label>
                            <Input
                              id="schedule-date"
                              type="date"
                              value={scheduleForm.date.toISOString().split('T')[0]}
                              onChange={(e) => setScheduleForm(prev => ({ ...prev, date: new Date(e.target.value) }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="schedule-start">Start</Label>
                            <Input
                              id="schedule-start"
                              type="time"
                              value={scheduleForm.startTime}
                              onChange={(e) => setScheduleForm(prev => ({ ...prev, startTime: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="schedule-end">End</Label>
                            <Input
                              id="schedule-end"
                              type="time"
                              value={scheduleForm.endTime}
                              onChange={(e) => setScheduleForm(prev => ({ ...prev, endTime: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="schedule-priority">Priority</Label>
                            <Select value={scheduleForm.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setScheduleForm(prev => ({ ...prev, priority: value }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="schedule-category">Category</Label>
                            <Select value={scheduleForm.category} onValueChange={(value) => setScheduleForm(prev => ({ ...prev, category: value }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="study">Study</SelectItem>
                                <SelectItem value="review">Review</SelectItem>
                                <SelectItem value="break">Break</SelectItem>
                                <SelectItem value="general">General</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="schedule-subject">Subject</Label>
                          <Input
                            id="schedule-subject"
                            placeholder="Subject"
                            value={scheduleForm.subject}
                            onChange={(e) => setScheduleForm(prev => ({ ...prev, subject: e.target.value }))}
                          />
                        </div>
                        <Button onClick={scheduleTask} className="w-full">Schedule Task</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Calendar View */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Schedule Calendar
                </CardTitle>
                <CardDescription>View and manage your scheduled tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                    />
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-4">
                      {selectedDate ? selectedDate.toLocaleDateString() : 'Select a date'}
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {getScheduledTasksForDate(selectedDate || new Date()).length === 0 ? (
                        <div className="text-center py-8">
                          <CalendarIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                          <p className="text-gray-500">No tasks scheduled for this date</p>
                        </div>
                      ) : (
                        getScheduledTasksForDate(selectedDate || new Date()).map(task => (
                          <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: task.color }}></div>
                              <div>
                                <p className="font-medium">{task.title}</p>
                                <p className="text-sm text-gray-500">{task.startTime} - {task.endTime}</p>
                                {task.subject && <p className="text-xs text-gray-400">{task.subject}</p>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}>
                                {task.priority}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteScheduledTask(task.id)}
                                className="p-1"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center py-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
            Made By Alien 👽
          </p>
        </div>
      </div>
    </div>
  );
}