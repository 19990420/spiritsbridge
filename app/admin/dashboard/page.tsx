'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'

interface Item {
  title: string
  type: string
  date: string
  status: string
}

export default function Dashboard() {
  const { logout, isAuthenticated } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [videos, setVideos] = useState<Item[]>([])
  const [images, setImages] = useState<Item[]>([])
  const [articles, setArticles] = useState<Item[]>([])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login')
      return
    }
    const v = JSON.parse(localStorage.getItem('sb_videos') || '[]')
    const i = JSON.parse(localStorage.getItem('sb_images') || '[]')
    const a = JSON.parse(localStorage.getItem('sb_articles') || '[]')
    setVideos(v)
    setImages(i)
    setArticles(a)
  }, [isAuthenticated, router])

  const allItems = [...videos, ...images, ...articles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const pending = allItems.filter(item => item.status !== 'published').length

  const recentItems = allItems.slice(0, 5)

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-navy text-white p-4 flex justify-between items-center">
        <div className="flex items-center">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white mr-4 text-xl">
            ☰
          </button>
          <h1 className="text-gold text-xl font-bold">SPIRITSBRIDGE</h1>
        </div>
        <div>
          <span>Admin Dashboard</span>
          <button onClick={logout} className="bg-gold text-black px-4 py-2 rounded ml-4">Logout</button>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`bg-navy text-white p-4 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
          {sidebarOpen && (
            <>
              <h2 className="text-lg mb-4">Navigation</h2>
              <ul>
                <li><a href="/admin/dashboard" className="block py-2 text-white">Dashboard</a></li>
                <li><a href="/admin/upload-video" className="block py-2 text-white">Upload Video</a></li>
                <li><a href="/admin/upload-image" className="block py-2 text-white">Upload Image</a></li>
                <li><a href="/admin/create-article" className="block py-2 text-white">Create Article</a></li>
              </ul>
            </>
          )}
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-navy text-white p-4 rounded shadow">
              <div className="text-2xl font-bold">Videos: {videos.length}</div>
            </div>
            <div className="bg-navy text-white p-4 rounded shadow">
              <div className="text-2xl font-bold">Images: {images.length}</div>
            </div>
            <div className="bg-navy text-white p-4 rounded shadow">
              <div className="text-2xl font-bold">Articles: {articles.length}</div>
            </div>
            <div className="bg-navy text-white p-4 rounded shadow">
              <div className="text-2xl font-bold">Pending: {pending}</div>
            </div>
          </div>

          {/* Buttons - onClick ハンドラを追加 */}
          <div className="mb-6">
            <button 
              onClick={() => router.push('/admin/upload-video')} 
              className="bg-gold text-black px-4 py-2 rounded mr-2 hover:bg-yellow-500 transition"
            >
              + Upload Video
            </button>
            <button 
              onClick={() => router.push('/admin/upload-image')} 
              className="bg-gold text-black px-4 py-2 rounded mr-2 hover:bg-yellow-500 transition"
            >
              + Upload Image
            </button>
            <button 
              onClick={() => router.push('/admin/create-article')} 
              className="bg-gold text-black px-4 py-2 rounded hover:bg-yellow-500 transition"
            >
              + Write Article
            </button>
          </div>

          {/* Recent Activity */}
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <table className="w-full bg-white shadow rounded">
            <thead>
              <tr className="bg-navy text-white">
                <th className="p-2 text-left">Title</th>
                <th className="p-2 text-left">Type</th>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentItems.length > 0 ? recentItems.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">{item.title}</td>
                  <td className="p-2">{item.type}</td>
                  <td className="p-2">{item.date}</td>
                  <td className="p-2">{item.status}</td>
                  <td className="p-2">
                    <button className="mr-2">Edit</button>
                    <button>Delete</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="p-4 text-center">No uploads yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </main>
      </div>
    </div>
  )
}
