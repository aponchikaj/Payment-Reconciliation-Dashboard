'use client'
import {Suspense} from 'react'
import {DashboardContent} from'./dashboard-content'

export default function Home(){
  return(
    <Suspense fallback={
        <main className="mx-auto max-w-6xl p-6">
          <p className="text-gray-500">Loading…</p>
        </main>}>
      <DashboardContent/>
    </Suspense>
  )
}