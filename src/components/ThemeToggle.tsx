"use client";
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="p-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700"
    >
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}