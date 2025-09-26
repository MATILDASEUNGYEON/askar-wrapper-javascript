import koffi from 'koffi'
import { allocateCallbackBuffer, deallocateCallbackBuffer } from './alloc'

/**
 * Koffi 비동기 콜백 처리를 위한 전용 매니저 클래스
 * 이벤트 루프 타이밍 이슈를 해결하기 위해 설계됨
 */
export class CallbackManager {
  private static instance: CallbackManager
  private activeCallbacks = new Map<number, {
    resolve: (value: any) => void
    reject: (error: any) => void
    registeredCallback: any
    // timeoutId?: NodeJS.Timeout
  }>()
  private callbackCounter = 0

  static getInstance(): CallbackManager {
    if (!CallbackManager.instance) {
      CallbackManager.instance = new CallbackManager()
    }
    return CallbackManager.instance
  }

  /**
   * 비동기 콜백을 등록하고 Promise를 반환
   * 이벤트 루프 타이밍 이슈를 해결하기 위해 특별한 처리를 함
   */
  async registerAsyncCallback<T>(
    callbackType: any,
    nativeFunction: (callback: any, id: number) => number,
    timeoutMs = 10000
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const callbackId = ++this.callbackCounter
      
      // 콜백 함수 생성
      const callbackFunction = (id: number, errorCode: number, ...args: any[]) => {
        console.log(`🎯 CallbackManager callback called:`, { id, errorCode, args })
        
        const callbackInfo = this.activeCallbacks.get(id)
        if (!callbackInfo) {
          console.warn(`⚠️ Callback info not found for id: ${id}`)
          return
        }

        // 타임아웃 클리어
        // if (callbackInfo.timeoutId) {
        //   clearTimeout(callbackInfo.timeoutId)
        // }

        // 콜백 정리
        this.cleanupCallback(id)

        // 에러 처리
        if (errorCode !== 0) {
          callbackInfo.reject(new Error(`Native error: ${errorCode}`))
          return
        }

        // 성공 처리 - 이벤트 루프 타이밍을 고려한 지연 처리
        this.scheduleResolution(callbackInfo, args)
      }

      // 콜백 등록
      const registeredCallback = koffi.register(callbackFunction, koffi.pointer(callbackType))
      const bufferId = allocateCallbackBuffer(registeredCallback)

      // 타임아웃 설정
      // const timeoutId = setTimeout(() => {
      //   const callbackInfo = this.activeCallbacks.get(callbackId)
      //   if (callbackInfo) {
      //     console.error(`⏰ Callback timeout for id: ${callbackId}`)
      //     this.cleanupCallback(callbackId)
      //     callbackInfo.reject(new Error('Callback timeout'))
      //   }
      // }, timeoutMs)

      // 콜백 정보 저장
      this.activeCallbacks.set(callbackId, {
        resolve,
        reject,
        registeredCallback,
        // timeoutId
      })

      // 네이티브 함수 호출
      const errorCode = nativeFunction(registeredCallback, bufferId)
      
      // 동기 에러 처리
      if (errorCode !== 0) {
        this.cleanupCallback(callbackId)
        reject(new Error(`Synchronous error: ${errorCode}`))
      }
    })
  }

  /**
   * 이벤트 루프 타이밍을 고려한 Promise resolve 스케줄링
   */
  private scheduleResolution(callbackInfo: any, args: any[]) {
    // 여러 단계의 지연을 통해 이벤트 루프가 안정적으로 처리되도록 함
    setImmediate(() => {
      process.nextTick(() => {
        setImmediate(() => {
          try {
            // 첫 번째 인자가 결과값이라고 가정
            const result = args.length > 0 ? args[0] : null
            callbackInfo.resolve(result)
          } catch (error) {
            callbackInfo.reject(error)
          }
        })
      })
    })
  }

  /**
   * 콜백 정리
   */
  private cleanupCallback(id: number) {
    const callbackInfo = this.activeCallbacks.get(id)
    if (callbackInfo) {
      // if (callbackInfo.timeoutId) {
      //   clearTimeout(callbackInfo.timeoutId)
      // }
      try {
        koffi.unregister(callbackInfo.registeredCallback)
      } catch (error) {
        console.warn('Failed to unregister callback:', error)
      }
      deallocateCallbackBuffer(id)
      this.activeCallbacks.delete(id)
    }
  }

  /**
   * 모든 활성 콜백 정리
   */
  cleanup() {
    for (const [id, callbackInfo] of this.activeCallbacks) {
      this.cleanupCallback(id)
    }
  }
}
