// Toast Notification Component
// Chic Shop Galena's

function Toast({ toast }) {
  if (!toast) return null;
  const isError = toast.type === "error";
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-2.5 rounded-full shadow-2xl text-xs font-semibold border backdrop-blur-md transition-all animate-fade-in ${
      isError 
        ? 'bg-rose-950/90 text-rose-100 border-rose-700' 
        : 'bg-stone-900/95 text-white border-stone-700'
    }`}>
      <i className={`fa-solid ${isError ? 'fa-circle-exclamation text-rose-400' : 'fa-circle-check text-amber-400'}`}></i>
      <span>{toast.message}</span>
    </div>
  );
}

window.Toast = Toast;
