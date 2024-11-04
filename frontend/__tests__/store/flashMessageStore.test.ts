import { renderHook, act } from '@testing-library/react';
import { useFlashMessageStore } from '../../src/store/flashMessageStore';

describe('useFlashMessageStore', () => {
  // ストアをリセット
  beforeEach(() => {
    act(() => {
      useFlashMessageStore.getState().clearFlashMessage();
    });
  });

  // レンダリングをシミュレートする方法
  describe('using renderHook', () => {
    it('should initialize with null message', () => {
      const { result } = renderHook(() => useFlashMessageStore());
      expect(result.current.message).toBeNull();
    });

    it('should set flash message', () => {
      const { result } = renderHook(() => useFlashMessageStore());
      act(() => {
        result.current.setFlashMessage('Test message');
      });
      expect(result.current.message).toBe('Test message');
    });

    it('should clear flash message', () => {
      const { result } = renderHook(() => useFlashMessageStore());
      act(() => {
        result.current.setFlashMessage('Test message');
      });
      act(() => {
        result.current.clearFlashMessage();
      });
      expect(result.current.message).toBeNull();
    });
  });

  // ストアを直接操作する方法
  describe('using store directly', () => {
    it('should initialize with null message', () => {
      expect(useFlashMessageStore.getState().message).toBeNull();
    });

    it('should set flash message', () => {
      act(() => {
        useFlashMessageStore.getState().setFlashMessage('Test message');
      });
      expect(useFlashMessageStore.getState().message).toBe('Test message');
    });

    it('should clear flash message', () => {
      act(() => {
        useFlashMessageStore.getState().setFlashMessage('Test message');
      });
      act(() => {
        useFlashMessageStore.getState().clearFlashMessage();
      });
      expect(useFlashMessageStore.getState().message).toBeNull();
    });
  });
});