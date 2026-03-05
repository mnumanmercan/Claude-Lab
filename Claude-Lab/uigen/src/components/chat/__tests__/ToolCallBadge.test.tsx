import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge, getToolCallLabel } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

// --- getToolCallLabel unit tests ---

test("getToolCallLabel: str_replace_editor create returns filename", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "create", path: "/components/Card.jsx" }))
    .toBe("Creating Card.jsx");
});

test("getToolCallLabel: str_replace_editor str_replace returns Editing", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "str_replace", path: "/App.jsx" }))
    .toBe("Editing App.jsx");
});

test("getToolCallLabel: str_replace_editor insert returns Editing", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "insert", path: "/App.jsx" }))
    .toBe("Editing App.jsx");
});

test("getToolCallLabel: str_replace_editor view returns Reading", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "view", path: "/src/index.tsx" }))
    .toBe("Reading index.tsx");
});

test("getToolCallLabel: str_replace_editor undo_edit returns Reverting", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "undo_edit", path: "/App.jsx" }))
    .toBe("Reverting App.jsx");
});

test("getToolCallLabel: file_manager rename uses new_path filename", () => {
  expect(getToolCallLabel("file_manager", { command: "rename", path: "/old.jsx", new_path: "/Button.jsx" }))
    .toBe("Renaming to Button.jsx");
});

test("getToolCallLabel: file_manager delete returns Deleting", () => {
  expect(getToolCallLabel("file_manager", { command: "delete", path: "/Button.jsx" }))
    .toBe("Deleting Button.jsx");
});

test("getToolCallLabel: missing path falls back gracefully", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "create" }))
    .toBe("Creating file");
});

test("getToolCallLabel: unknown tool returns tool name", () => {
  expect(getToolCallLabel("unknown_tool", {})).toBe("unknown_tool");
});

// --- ToolCallBadge render tests ---

test("ToolCallBadge renders friendly label for str_replace_editor create", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/components/Card.jsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Creating Card.jsx")).toBeDefined();
});

test("ToolCallBadge renders friendly label for str_replace_editor str_replace", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "str_replace", path: "/App.jsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Editing App.jsx")).toBeDefined();
});

test("ToolCallBadge renders friendly label for file_manager delete", () => {
  render(
    <ToolCallBadge
      toolName="file_manager"
      args={{ command: "delete", path: "/old.jsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Deleting old.jsx")).toBeDefined();
});

test("ToolCallBadge renders friendly label for file_manager rename", () => {
  render(
    <ToolCallBadge
      toolName="file_manager"
      args={{ command: "rename", path: "/old.jsx", new_path: "/Button.jsx" }}
      state="result"
      result={{ success: true }}
    />
  );
  expect(screen.getByText("Renaming to Button.jsx")).toBeDefined();
});

test("ToolCallBadge shows loading spinner when not done", () => {
  const { container } = render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="call"
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("ToolCallBadge shows green dot when done", () => {
  const { container } = render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="result"
      result="File created: /App.jsx"
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("ToolCallBadge does not show green dot when result is null", () => {
  const { container } = render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="result"
      result={null}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});
