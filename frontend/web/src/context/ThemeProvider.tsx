import { useState, type ReactNode } from 'react'
import { ThemeContext, type Theme } from './themeContext'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))
  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}
