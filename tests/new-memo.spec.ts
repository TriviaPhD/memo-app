import { test, expect } from '@playwright/test';

test.describe('새 메모 작성', () => {
  test('사용자는 새 메모를 작성하고 저장할 수 있다', async ({ page }) => {
    // 1. 페이지 접속
    await page.goto('/');

    // 2. "새 메모" 버튼 클릭
    await page.getByRole('button', { name: '새 메모' }).click();

    // 3. "새 메모 작성" 폼이 나타나는지 확인
    const newMemoForm = page.getByRole('heading', { name: '새 메모 작성' });
    await expect(newMemoForm).toBeVisible();

    // 4. 제목 입력
    await page.getByLabel('제목 *').fill('테스트 메모 제목');

    // 5. 카테고리 선택
    await page.getByLabel('카테고리').selectOption({ label: '업무' });

    // 6. 내용 입력
    const contentInput = page.getByPlaceholder('마크다운으로 메모를 작성하세요...');
    await contentInput.fill('테스트 메모 내용입니다.');
    
    // 7. 태그 입력
    const tagInput = page.getByPlaceholder('태그를 입력하고 Enter를 누르세요');
    await tagInput.fill('테스트');
    await tagInput.press('Enter');

    // 8. "저장하기" 버튼 클릭
    await page.getByRole('button', { name: '저장하기' }).click();

    // 9. "새 메모 작성" 폼이 사라질 때까지 대기
    await expect(newMemoForm).not.toBeVisible();

    // 10. 새로운 메모가 목록에 나타나는지 확인
    const newMemo = page.locator('article').filter({ hasText: '테스트 메모 제목' });
    await expect(newMemo).toBeVisible();
    await expect(newMemo.getByText('테스트 메모 내용입니다.')).toBeVisible();
    await expect(newMemo.getByText('#테스트')).toBeVisible();
  });
});
