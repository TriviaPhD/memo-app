'use client'

import { useEffect } from 'react'
import MDEditor from '@uiw/react-md-editor'
import { Memo, MEMO_CATEGORIES } from '@/types/memo'

interface MemoDetailModalProps {
  memo: Memo | null
  isOpen: boolean
  onClose: () => void
  onEdit: (memo: Memo) => void
  onDelete: (id: string) => Promise<boolean>
}

export default function MemoDetailModal({
  memo,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: MemoDetailModalProps) {
  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // 모달이 열릴 때 스크롤 방지
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !memo) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'long',
    })
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      personal: 'bg-blue-100 text-blue-800',
      work: 'bg-green-100 text-green-800',
      study: 'bg-purple-100 text-purple-800',
      idea: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    }
    return colors[category as keyof typeof colors] || colors.other
  }

  const handleDelete = async () => {
    if (window.confirm('정말로 이 메모를 삭제하시겠습니까?')) {
      const success = await onDelete(memo.id)
      if (success) {
        onClose()
      } else {
        alert('메모 삭제에 실패했습니다.')
      }
    }
  }

  const handleEdit = () => {
    onEdit(memo)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* 모달 콘텐츠 */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1 mr-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                {memo.title}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(memo.category)}`}
                >
                  {MEMO_CATEGORIES[memo.category as keyof typeof MEMO_CATEGORIES] ||
                    memo.category}
                </span>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">생성:</span>{' '}
                  {formatDate(memo.createdAt)}
                </div>
                {memo.createdAt !== memo.updatedAt && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">수정:</span>{' '}
                    {formatDate(memo.updatedAt)}
                  </div>
                )}
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                title="편집"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                편집
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                title="삭제"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                삭제
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="닫기"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* 메모 내용 */}
        <div className="px-6 py-6">
          <div className="prose prose-sm max-w-none wmde-markdown">
            <MDEditor.Markdown 
              source={memo.content || '내용이 없습니다.'} 
              style={{ 
                whiteSpace: 'pre-wrap',
                backgroundColor: 'transparent',
                fontFamily: 'inherit',
                fontSize: '14px',
                lineHeight: '1.6'
              }}
            />
          </div>

          {/* 태그 */}
          {memo.tags.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">태그</h3>
              <div className="flex gap-2 flex-wrap">
                {memo.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md border"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 하단 정보 */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <span className="font-medium">메모 ID:</span> {memo.id}
            </div>
            <div className="text-right">
              <div>
                <span className="font-medium">작성일:</span>{' '}
                {new Date(memo.createdAt).toLocaleDateString('ko-KR')}
              </div>
              {memo.createdAt !== memo.updatedAt && (
                <div className="mt-1">
                  <span className="font-medium">수정일:</span>{' '}
                  {new Date(memo.updatedAt).toLocaleDateString('ko-KR')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}