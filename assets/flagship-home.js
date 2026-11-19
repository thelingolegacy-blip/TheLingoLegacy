(() => {
  const search = document.querySelector("[data-realm-search]");
  const cards = [...document.querySelectorAll("[data-realm-card]")];
  const filters = [...document.querySelectorAll("[data-realm-filter]")];
  const empty = document.querySelector("[data-no-results]");
  const count = document.querySelector("[data-result-count]");
  if (!cards.length) return;
  let active = "all";
  const apply = () => {
    const query = (search?.value || "").trim().toLowerCase();
    let visible = 0;
    for (const card of cards) {
      const categoryMatch = active === "all" || card.dataset.category === active;
      const textMatch = !query || (card.dataset.search + " " + card.textContent).toLowerCase().includes(query);
      const show = categoryMatch && textMatch;
      card.hidden = !show;
      if (show) visible += 1;
    }
    if (empty) empty.hidden = visible !== 0;
    if (count) count.textContent = visible + (visible === 1 ? " destination" : " destinations");
  };
  search?.addEventListener("input", apply);
  filters.forEach((filter) => filter.addEventListener("click", () => {
    active = filter.dataset.realmFilter;
    filters.forEach((item) => item.setAttribute("aria-pressed", String(item === filter)));
    apply();
  }));
  apply();
})();