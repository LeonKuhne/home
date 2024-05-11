
export default class Theme {

  static randomizeBrightsAndDarks(theme, hue, saturation, contrast, step) {
    const idx = Theme.randomize(theme.bright, hue, saturation, 1 - contrast, step)
    Theme.randomize(theme.dark, hue, saturation, contrast, step, idx)
  }

  static randomize(theme, hue, saturation, brightness, step, offset=0) {
    const entries = Object.entries(theme).sort(() => Math.random() - 0.5) // random order
    for (let i=0;i<entries.length;i++) {
      const [key, _] = entries[i]
      const idx = i + offset
      // hsl: hue, saturation, lightness
      const color = `hsl(${hue + idx * step}, ${saturation * 100}%, ${brightness * 100}%)`
      theme[key] = color
    }
    return entries.length
  }
}