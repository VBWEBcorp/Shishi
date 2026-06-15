export function ThemeScript() {
  // Shi Shi Samui = thème clair uniquement (charte blanc / noir / orange).
  // On force le retrait de toute classe `.dark` et on purge l'ancien réglage
  // `mymag-theme` qui pouvait rester coincé sur "dark" dans le localStorage.
  const script = `(function(){document.documentElement.classList.remove('dark');try{localStorage.removeItem('mymag-theme')}catch(e){}})();`
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
