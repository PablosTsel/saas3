"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // After hydration, set mounted to true
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme} 
      className="rounded-full w-9 h-9"
      aria-label="Toggle theme"
    >
      {mounted ? (
        theme === 'dark' ? (
          <Sun className="h-4 w-4 text-yellow-300" />
        ) : (
          <Moon className="h-4 w-4 text-indigo-700 dark:text-indigo-400" />
        )
      ) : (
        // Show empty div with same dimensions during server render
        <div className="h-4 w-4" />
      )}
    </Button>
  )
} 