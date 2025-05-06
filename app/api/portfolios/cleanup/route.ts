import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// API route to clean up temporary preview files
export async function POST(request: NextRequest) {
  try {
    const { excludeId } = await request.json()
    const portfoliosDir = path.join(process.cwd(), 'public', 'portfolios')
    
    // Ensure the directory exists
    if (!fs.existsSync(portfoliosDir)) {
      return NextResponse.json({ success: true, message: 'No portfolios directory to clean' })
    }
    
    // Read all directories in the portfolios directory
    const dirs = fs.readdirSync(portfoliosDir)
    
    // Filter for preview directories
    const previewDirs = dirs.filter(dir => dir.startsWith('preview-'))
    
    // Keep track of how many we deleted
    let deletedCount = 0
    
    // Delete each preview directory, except the one we want to keep
    for (const dir of previewDirs) {
      // Skip the directory we want to exclude
      if (excludeId && dir === excludeId) {
        continue
      }
      
      const dirPath = path.join(portfoliosDir, dir)
      
      // Check how old the directory is - delete if older than 1 hour
      const stats = fs.statSync(dirPath)
      const ageInHours = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60)
      
      // Delete if older than 1 hour or if we have more than 5 preview dirs
      if (ageInHours > 1 || previewDirs.length > 5) {
        // Recursively delete the directory
        fs.rmSync(dirPath, { recursive: true, force: true })
        deletedCount++
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Cleaned up ${deletedCount} preview directories` 
    })
  } catch (error) {
    console.error('Error cleaning up preview portfolios:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to clean up preview portfolios' },
      { status: 500 }
    )
  }
} 