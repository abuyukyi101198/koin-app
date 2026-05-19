export function SettingsView() {
  return (
    <div className="h-full w-full flex flex-col border-collapse">
      <div className="flex flex-1">
        <div className="w-1/6" />
        <section
          // aria-busy={isLoading}
          aria-label="Settings"
          className="h-full w-7/12 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <header className="w-full flex justify-between shrink-0 border-b pl-6 pt-4 pr-4 pb-3">
            <div className="space-y-1">
              <h2 className="scroll-m-20 text-2xl font-medium tracking-wide text-balance">
                Settings
              </h2>
            </div>
          </header>
        </section>
      </div>
    </div>
  );
}
