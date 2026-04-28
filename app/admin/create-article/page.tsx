'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '@/lib/supabase'
import ProtectedRoute from '../../components/ProtectedRoute'

export default function CreateArticle() {
  const { user } = useAuth()
  const router = useRouter()
  const [distilleryId, setDistilleryId] = useState<string | null>(null)
  const [articleId, setArticleId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState('')
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastSaved, setLastSaved] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!user) return
    fetchDistillery()
  }, [user])

  const fetchDistillery = async () => {
    const { data } = await supabase
      .from('distilleries')
      .select('id')
      .eq('user_id', user!.id)
      .single()
    if (data) setDistilleryId(data.id)
  }

  const handleThumbnailSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) { setError('画像は10MB以下にしてください'); return }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setError('JPG・PNG・WebPのみ対応しています'); return }
    setThumbnail(file)
    setError('')
    const reader = new FileReader()
    reader.onload = (e) => setThumbnailPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const uploadThumbnail = async (): Promise<string> => {
    if (!thumbnail) return thumbnailUrl
    const ext = thumbnail.name.split('.').pop()
    const path = `articles/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('images').upload(path, thumbnail)
    if (error) throw error
    const { data } = supabase.storage.from('images').getPublicUrl(path)
    return data.publicUrl
  }

  const saveArticle = async (status: 'draft' | 'published') => {
    setError('')
    setSuccess('')
    if (!title.trim()) { setError('タイトルは必須です'); return }
    if (!body.trim()) { setError('本文は必須です'); return }
    setLoading(true)
    try {
      const url = await uploadThumbnail()
      const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean)
      const payload = {
        distillery_id: distilleryId,
        title: title.trim(),
        body: body.trim(),
        tags: tagArray,
        thumbnail_url: url || null,
        status,
        published_at: status === 'published' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      }

      if (articleId) {
        const { error } = await supabase.from('articles').update(payload).eq('id', articleId)
        if (error) throw error
      } else {
        const { data, error } = await supabase.from('articles').insert([payload]).select('id').single()
        if (error) throw error
        setArticleId(data.id)
      }

      setLastSaved(new Date().toLocaleTimeString())
      setSuccess(status === 'published' ? '記事を公開しました' : '下書きを保存しました')
      if (status === 'published') setTimeout(() => router.push('/admin/dashboard'), 1200)
    } catch (e: any) {
      setError(e.message || '保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-blue-900 text-white p-4 flex justify-between items-center">
          <h1 className="text-yellow-400 text-xl font-bold">SPIRITSBRIDGE</h1>
          <span className="text-sm">記事作成</span>
        </nav>

        <main className="max-w-4xl mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">記事を書く</h1>
            <a href="/admin/dashboard" className="text-blue-700 hover:underline text-sm">← ダッシュボードへ</a>
          </div>

          {!distilleryId && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-4 rounded mb-4">
              先に<a href="/admin/distillery" className="underline font-semibold">蒸留所プロフィール</a>を作成してください。
            </div>
          )}
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
          {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}

          <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">記事タイトル *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="例：余市の大地が育む、一滴の哲学"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">サムネイル画像</label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition"
                onClick={() => fileInputRef.current?.click()}
                onDrop={e => { e.preventDefault(); e.dataTransfer.files[0] && handleThumbnailSelect(e.dataTransfer.files[0]) }}
                onDragOver={e => e.preventDefault()}
              >
                {thumbnailPreview
                  ? <img src={thumbnailPreview} alt="preview" className="max-h-48 mx-auto rounded" />
                  : <p className="text-gray-500 text-sm">クリックまたはドラッグ＆ドロップ（JPG/PNG/WebP, 10MB以下）</p>
                }
              </div>
              <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden"
                onChange={e => e.target.files?.[0] && handleThumbnailSelect(e.target.files[0])} />
              {thumbnailPreview && (
                <button type="button" onClick={() => { setThumbnail(null); setThumbnailPreview(''); setThumbnailUrl('') }}
                  className="mt-1 text-xs text-red-500 hover:underline">画像を削除</button>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                本文 * <span className="text-xs text-gray-400 font-normal">（Markdown対応）</span>
              </label>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={16}
                placeholder={'## 作り手の思い\n\n蒸留所が生まれた背景、杜氏の哲学、原料へのこだわり...'}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">文字数: {body.length}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                タグ <span className="text-xs text-gray-400 font-normal">（カンマ区切り）</span>
              </label>
              <input
                type="text"
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="例：蔵元, インタビュー, 余市, クラフトウイスキー"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-4 pt-2 border-t">
              <button type="button" onClick={() => saveArticle('draft')} disabled={loading || !distilleryId}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300 disabled:opacity-50 font-medium">
                {loading ? '保存中...' : '下書き保存'}
              </button>
              <button type="button" onClick={() => saveArticle('published')} disabled={loading || !distilleryId}
                className="bg-blue-900 text-white px-6 py-2 rounded hover:bg-blue-800 disabled:opacity-50 font-medium">
                {loading ? '保存中...' : '公開する'}
              </button>
              {lastSaved && <span className="text-xs text-gray-400 ml-auto">最終保存: {lastSaved}</span>}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
