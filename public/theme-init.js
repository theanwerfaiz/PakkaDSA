/* Applies the saved theme before first paint, so dark mode never flashes light. */
try {
  var t = JSON.parse(localStorage.getItem('pakkadsa:theme'));
  if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
  if (JSON.parse(localStorage.getItem('pakkadsa:anim')) === false)
    document.documentElement.classList.add('noanim');
} catch {
  /* storage unavailable: follow the system theme */
}
