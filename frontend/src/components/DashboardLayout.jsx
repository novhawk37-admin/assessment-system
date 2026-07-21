import React from 'react'
import Sidebar from './Sidebar'

export default function DashboardLayout({
  children,
  hideSidebar = false,
}) {
  return (
    <div className="flex h-screen overflow-hidden">

      {!hideSidebar && <Sidebar />}

      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>

    </div>
  )
}