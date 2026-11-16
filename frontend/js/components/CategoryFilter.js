// Category Filter Navigation Pills
// Chic Shop Galena's

function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onSelectCategory(cat.id)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
            selectedCategory === cat.id
              ? "bg-stone-900 text-white shadow-sm"
              : "bg-white text-stone-700 border border-stone-200 hover:border-stone-400"
          }`}
        >
          <i className={`fa-solid ${cat.icon} text-[11px]`}></i>
          <span>{cat.name}</span>
        </button>
      ))}
    </div>
  );
}

window.CategoryFilter = CategoryFilter;
