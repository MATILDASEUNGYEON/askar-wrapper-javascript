import { Buffer } from 'buffer'

export type JwkProps = {
  kty: string
  crv: string
  x: string
  d?: string
  y?: string
}

export class Jwk {
  public kty: string
  public crv: string
  public x: string
  public d?: string
  public y?: string

  public constructor({ kty, crv, x, d, y }: JwkProps) {
    this.kty = kty
    this.crv = crv
    this.x = x
    this.d = d
    this.y = y
  }

  public static fromJson(jwk: JwkProps) {
    return new Jwk(jwk)
  }

  public static fromString(str: string) {
    return new Jwk(JSON.parse(str) as JwkProps)
  }

  public toUint8Array() {
    // undefined 속성들을 제외하고 유효한 속성들만 포함하여 JWK 생성
    const jwkObject: Record<string, any> = {
      kty: this.kty,
      crv: this.crv,
      x: this.x,
    }
    
    if (this.d !== undefined) {
      jwkObject.d = this.d
    }
    
    if (this.y !== undefined) {
      jwkObject.y = this.y
    }
    
    return Uint8Array.from(Buffer.from(JSON.stringify(jwkObject)))
  }
}