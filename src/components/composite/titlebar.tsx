export function Titlebar() {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-12 select-none bg-sidebar border-b border-sidebar-border"
      data-tauri-drag-region
    >
      <div className="flex h-full items-center pl-20" data-tauri-drag-region>
        <span className="text-xs font-semibold tracking-wide text-sidebar-foreground"></span>
      </div>
    </div>
  );
}
