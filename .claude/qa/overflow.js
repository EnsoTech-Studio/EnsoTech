// Phần tử tràn ra mép phải mà không bị cha nào cắt: thủ phạm làm trang cuộn ngang.
[...document.querySelectorAll('body *')]
  .filter((e) => {
    const r = e.getBoundingClientRect()
    if (!(r.width > 0 && r.right > innerWidth + 0.5)) return false
    for (let p = e.parentElement; p && p !== document.body; p = p.parentElement) if (getComputedStyle(p).overflowX !== 'visible') return false
    return getComputedStyle(e).position !== 'fixed'
  })
  .slice(0, 12)
  .map((e) => `${e.tagName}#${e.id}.${String(e.className?.baseVal ?? e.className).slice(0, 70)} right=${e.getBoundingClientRect().right.toFixed(1)} sw=${document.documentElement.scrollWidth}`)
