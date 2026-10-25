function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="h-7 w-64 rounded bg-(--border-color) sm:w-80" />
          <div className="h-9 w-44 rounded bg-(--border-color)" />
        </div>
        <div className="hidden h-32 w-48 rounded-xl bg-(--border-color) sm:block" />
      </div>

      <div className="rounded-xl border border-(--border-color) bg-(--card-background) p-4">
        <div className="mb-4 h-3 w-20 rounded bg-(--border-color)" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-20 rounded-lg bg-(--input-background)"
            />
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-(--border-color) bg-(--card-background) p-5">
        <div className="mb-6 h-4 w-28 rounded bg-(--border-color)" />
        <div className="space-y-5">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="flex items-center gap-4">
              <div className="h-3 w-20 rounded bg-(--border-color)" />
              <div className="h-1 flex-1 rounded-full bg-(--border-color)" />
              <div className="h-5 w-16 rounded-full bg-(--border-color)" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[1, 2].map((card) => (
          <div
            key={card}
            className="rounded-xl border border-(--border-color) bg-(--card-background) p-5"
          >
            <div className="mb-5 h-5 w-36 rounded bg-(--border-color)" />
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <div className="h-3 w-28 rounded bg-(--border-color)" />
                    <div className="h-2 w-14 rounded bg-(--border-color)" />
                  </div>
                  <div className="h-5 w-16 rounded-full bg-(--border-color)" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardSkeleton;