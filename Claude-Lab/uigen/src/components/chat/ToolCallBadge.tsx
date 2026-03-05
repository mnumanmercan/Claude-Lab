"use client";

import { Loader2, FilePlus, FilePen, Eye, Trash2, RotateCcw, FolderPen } from "lucide-react";

interface ToolCallBadgeProps {
  toolName: string;
  args: Record<string, any>;
  state: string;
  result?: any;
}

function getFileName(path?: string): string {
  if (!path) return "";
  const parts = path.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

export function getToolCallLabel(toolName: string, args: Record<string, any>): string {
  const fileName = getFileName(args.path);

  if (toolName === "str_replace_editor") {
    switch (args.command) {
      case "create":    return fileName ? `Creating ${fileName}`   : "Creating file";
      case "str_replace": return fileName ? `Editing ${fileName}`  : "Editing file";
      case "insert":    return fileName ? `Editing ${fileName}`    : "Editing file";
      case "view":      return fileName ? `Reading ${fileName}`    : "Reading file";
      case "undo_edit": return fileName ? `Reverting ${fileName}`  : "Reverting file";
    }
  }

  if (toolName === "file_manager") {
    const targetName = getFileName(args.new_path ?? args.path);
    switch (args.command) {
      case "rename": return targetName ? `Renaming to ${targetName}` : "Renaming file";
      case "delete": return fileName   ? `Deleting ${fileName}`      : "Deleting file";
    }
  }

  return toolName;
}

function getToolCallIcon(toolName: string, args: Record<string, any>) {
  if (toolName === "str_replace_editor") {
    switch (args.command) {
      case "create":    return FilePlus;
      case "str_replace":
      case "insert":    return FilePen;
      case "view":      return Eye;
      case "undo_edit": return RotateCcw;
    }
  }

  if (toolName === "file_manager") {
    switch (args.command) {
      case "rename": return FolderPen;
      case "delete": return Trash2;
    }
  }

  return FilePen;
}

export function ToolCallBadge({ toolName, args, state, result }: ToolCallBadgeProps) {
  const isDone = state === "result" && result != null;
  const label = getToolCallLabel(toolName, args);
  const Icon = getToolCallIcon(toolName, args);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-xs border border-neutral-200 dark:border-neutral-700">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600 shrink-0" />
      )}
      <Icon className="w-3 h-3 text-neutral-500 dark:text-neutral-400 shrink-0" />
      <span className="text-neutral-700 dark:text-neutral-300">{label}</span>
    </div>
  );
}
