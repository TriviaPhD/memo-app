import { supabase } from '@/lib/supabase'
import { Memo, MemoFormData } from '@/types/memo'
import { v4 as uuidv4 } from 'uuid'

export const supabaseUtils = {
  // 모든 메모 가져오기
  getMemos: async (): Promise<Memo[]> => {
    try {
      const { data, error } = await supabase
        .from('memos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return data.map(memo => ({
        id: memo.id,
        title: memo.title,
        content: memo.content,
        category: memo.category,
        tags: memo.tags,
        createdAt: memo.created_at,
        updatedAt: memo.updated_at,
      }))
    } catch (error) {
      console.error('Error fetching memos:', error)
      return []
    }
  },

  // 메모 추가
  addMemo: async (formData: MemoFormData): Promise<Memo | null> => {
    try {
      const id = uuidv4()
      const now = new Date().toISOString()
      
      const newMemo = {
        id,
        title: formData.title,
        content: formData.content,
        category: formData.category,
        tags: formData.tags,
        created_at: now,
        updated_at: now,
      }

      const { data, error } = await supabase
        .from('memos')
        .insert(newMemo)
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
    } catch (error) {
      console.error('Error adding memo:', error)
      return null
    }
  },

  // 메모 업데이트
  updateMemo: async (id: string, formData: MemoFormData): Promise<Memo | null> => {
    try {
      const { data, error } = await supabase
        .from('memos')
        .update({
          title: formData.title,
          content: formData.content,
          category: formData.category,
          tags: formData.tags,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
    } catch (error) {
      console.error('Error updating memo:', error)
      return null
    }
  },

  // 메모 삭제
  deleteMemo: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('memos')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting memo:', error)
      return false
    }
  },

  // 특정 메모 가져오기
  getMemoById: async (id: string): Promise<Memo | null> => {
    try {
      const { data, error } = await supabase
        .from('memos')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return {
        id: data.id,
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
    } catch (error) {
      console.error('Error fetching memo by id:', error)
      return null
    }
  },

  // 메모 검색
  searchMemos: async (query: string): Promise<Memo[]> => {
    try {
      const { data, error } = await supabase
        .from('memos')
        .select('*')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data.map(memo => ({
        id: memo.id,
        title: memo.title,
        content: memo.content,
        category: memo.category,
        tags: memo.tags,
        createdAt: memo.created_at,
        updatedAt: memo.updated_at,
      }))
    } catch (error) {
      console.error('Error searching memos:', error)
      return []
    }
  },

  // 카테고리별 메모 필터링
  getMemosByCategory: async (category: string): Promise<Memo[]> => {
    try {
      const { data, error } = await supabase
        .from('memos')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data.map(memo => ({
        id: memo.id,
        title: memo.title,
        content: memo.content,
        category: memo.category,
        tags: memo.tags,
        createdAt: memo.created_at,
        updatedAt: memo.updated_at,
      }))
    } catch (error) {
      console.error('Error fetching memos by category:', error)
      return []
    }
  },

  // 모든 메모 삭제
  clearAllMemos: async (): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('memos')
        .delete()
        .neq('id', '') // Delete all records

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error clearing all memos:', error)
      return false
    }
  },
}