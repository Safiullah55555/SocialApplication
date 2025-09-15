import Link from 'next/link'
import React from 'react'
import DesktopNavbar from './DesktopNavbar'
import MobileNavbar from './MobileNavbar'
import { currentUser } from '@clerk/nextjs/server'
import { syncUser } from '@/actions/user.action'
import SearchBar from './SearchBar'
import ErrorBoundary from './ErrorBoundary'

async function Navbar() {

  const user = await currentUser()
  if(user) await syncUser() //Post request.
  
  return (
    <nav className='sticky top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50'>
         <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary font-mono tracking-wider">
              SocialApp
            </Link>
          </div>

          <ErrorBoundary fallback={<div>Search is temporarily unavailable</div>}>
          <div className="flex-1 mx-6 hidden md:block">
            <SearchBar />
          </div>
          </ErrorBoundary>

          <DesktopNavbar />
          <MobileNavbar />
        </div>
      </div>
    </nav>
  )
}

export default Navbar