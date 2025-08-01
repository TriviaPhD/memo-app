'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Memo, MemoFormData } from '@/types/memo'
import { supabaseMCPUtils } from '@/utils/supabase-mcp'

export const useMemos = () => {
  const [memos, setMemos] = useState<Memo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // 메모 로드 (MCP 연동)
  useEffect(() => {
    const loadMemos = async () => {
      setLoading(true)
      try {
        // MCP를 통한 데이터베이스 초기화
        await supabaseMCPUtils.initializeDatabase()
        // 샘플 데이터 생성 (필요시)
        await supabaseMCPUtils.seedSampleData()
        // 메모 로드
        const loadedMemos = await supabaseMCPUtils.getMemos()
        setMemos(loadedMemos)
        console.log('MCP를 통한 메모 로드 완료:', loadedMemos.length, '개')
      } catch (error) {
        console.error('Failed to load memos via MCP:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMemos()
  }, [])

  // 메모 생성 (MCP 연동)
  const createMemo = useCallback(async (formData: MemoFormData): Promise<Memo | null> => {
    try {
      const newMemo = await supabaseMCPUtils.addMemo(formData)
      if (newMemo) {
        setMemos(prev => [newMemo, ...prev])
        return newMemo
      }
      return null
    } catch (error) {
      console.error('Failed to create memo via MCP:', error)
      return null
    }
  }, [])

  // 메모 업데이트 (MCP 연동)
  const updateMemo = useCallback(
    async (id: string, formData: MemoFormData): Promise<boolean> => {
      try {
        const updatedMemo = await supabaseMCPUtils.updateMemo(id, formData)
        if (updatedMemo) {
          setMemos(prev => prev.map(memo => (memo.id === id ? updatedMemo : memo)))
          return true
        }
        return false
      } catch (error) {
        console.error('Failed to update memo via MCP:', error)
        return false
      }
    },
    []
  )

  // 메모 삭제 (MCP 연동)
  const deleteMemo = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await supabaseMCPUtils.deleteMemo(id)
      if (success) {
        setMemos(prev => prev.filter(memo => memo.id !== id))
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to delete memo via MCP:', error)
      return false
    }
  }, [])

  // 메모 검색
  const searchMemos = useCallback((query: string): void => {
    setSearchQuery(query)
  }, [])

  // 카테고리 필터링
  const filterByCategory = useCallback((category: string): void => {
    setSelectedCategory(category)
  }, [])

  // 특정 메모 가져오기
  const getMemoById = useCallback(
    (id: string): Memo | undefined => {
      return memos.find(memo => memo.id === id)
    },
    [memos]
  )

  // 필터링된 메모 목록
  const filteredMemos = useMemo(() => {
    let filtered = memos

    // 카테고리 필터링
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(memo => memo.category === selectedCategory)
    }

    // 검색 필터링
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        memo =>
          memo.title.toLowerCase().includes(query) ||
          memo.content.toLowerCase().includes(query) ||
          memo.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [memos, selectedCategory, searchQuery])

  // 모든 메모 삭제 (MCP 연동)
  const clearAllMemos = useCallback(async (): Promise<boolean> => {
    try {
      const success = await supabaseMCPUtils.clearAllMemos()
      if (success) {
        setMemos([])
        setSearchQuery('')
        setSelectedCategory('all')
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to clear all memos via MCP:', error)
      return false
    }
  }, [])

  // 통계 정보
  const stats = useMemo(() => {
    const totalMemos = memos.length
    const categoryCounts = memos.reduce(
      (acc, memo) => {
        acc[memo.category] = (acc[memo.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return {
      total: totalMemos,
      byCategory: categoryCounts,
      filtered: filteredMemos.length,
    }
  }, [memos, filteredMemos])

  return {
    // 상태
    memos: filteredMemos,
    allMemos: memos,
    loading,
    searchQuery,
    selectedCategory,
    stats,

    // 메모 CRUD
    createMemo,
    updateMemo,
    deleteMemo,
    getMemoById,

    // 필터링 & 검색
    searchMemos,
    filterByCategory,

    // 유틸리티
    clearAllMemos,
  }
}
