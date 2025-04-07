"use client"

import { ProtectedRoute } from "@/components/protected-route"

interface EditorLayoutProps {
  children: React.ReactNode
}

export default function EditorLayout({ children }: EditorLayoutProps) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  )
} 