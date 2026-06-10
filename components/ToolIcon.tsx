import {
  Hash, Binary, Link2, Code, Key, ImageIcon, Type, Fingerprint, Shield,
  Lock, KeyRound, Zap, Shuffle, QrCode, FileText, Globe, Braces, FileCode,
  Database, Terminal, ArrowLeftRight, Table2, Clock, Palette, AlarmClock,
  FileJson, Minimize2, FilePlus, FileImage, Archive, Table, Search,
  CaseSensitive, Minus, BarChart2, BarChart, Wrench, AlignJustify, BookOpen,
  ShieldCheck, SortAsc, Layers, Wand2, Sparkles, Ruler, CalendarDays,
  Sigma, Code2, Rows, Server, Settings, Layers2, SquareCode, type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Hash, Binary, Link2, Code, Key, ImageIcon, Type, Fingerprint, Shield,
  Lock, KeyRound, Zap, Shuffle, QrCode, FileText, Globe, Braces, FileCode,
  Database, Terminal, ArrowLeftRight, Table2, Clock, Palette, AlarmClock,
  FileJson, Minimize2, FilePlus, FileImage, Archive, Table, Search,
  CaseSensitive, Minus, BarChart2, BarChart, Wrench, AlignJustify, BookOpen,
  ShieldCheck, SortAsc, Layers, Wand2, Sparkles, Ruler, CalendarDays,
  Sigma, Code2, Rows, Server, Settings, Layers2, SquareCode,
};

interface Props {
  name: string;
  size?: number;
  className?: string;
}

export default function ToolIcon({ name, size = 16, className }: Props) {
  const Icon = ICON_MAP[name];
  if (!Icon) return <span className="text-neutral-500 text-xs font-mono">{name.charAt(0)}</span>;
  return <Icon size={size} className={className} />;
}
