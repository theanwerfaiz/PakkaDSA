/* Updates an existing SVG in place from a freshly rendered one, so CSS transitions can run.
   Children are matched by data-k (keyed) or, failing that, by position and tag. */

export function morphEl(o: Element, n: Element): void {
  for (const at of [...o.attributes]) if (!n.hasAttribute(at.name)) o.removeAttribute(at.name);
  for (const at of [...n.attributes])
    if (o.getAttribute(at.name) !== at.value) o.setAttribute(at.name, at.value);
  if (!n.children.length) {
    if (o.textContent !== n.textContent) o.textContent = n.textContent;
    return;
  }
  morphKids(o, n);
}

export function morphKids(o: Element, n: Element): void {
  const ok = [...o.children];
  const nk = [...n.children];
  const map = new Map<string, Element>();
  const un: Element[] = [];
  ok.forEach((c) => {
    const k = c.getAttribute('data-k');
    if (k !== null) map.set(k, c);
    else un.push(c);
  });
  let ui = 0;
  const out: Element[] = [];
  const keep = new Set<Element>();
  nk.forEach((c) => {
    const k = c.getAttribute('data-k');
    let m: Element | null = null;
    if (k !== null) {
      m = map.get(k) || null;
      if (m) map.delete(k);
    } else {
      const cand = un[ui++];
      if (cand && cand.tagName === c.tagName) m = cand;
    }
    if (m) {
      morphEl(m, c);
      out.push(m);
      keep.add(m);
    } else {
      const imp = c.cloneNode(true) as Element;
      if (k !== null) imp.classList.add('enter');
      out.push(imp);
    }
  });
  ok.forEach((c) => {
    if (!keep.has(c)) c.remove();
  });
  out.forEach((c, i) => {
    if (o.children[i] !== c) o.insertBefore(c, o.children[i] || null);
  });
}
