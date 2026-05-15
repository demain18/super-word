export type PackageCode = 'P5' | 'P15' | 'P30';

export interface PackageDef {
  code: PackageCode;
  credits: number;
  amount: number;
  label: string;
  orderName: string;
}

export const PACKAGES: Record<PackageCode, PackageDef> = {
  P5: { code: 'P5', credits: 5, amount: 1000, label: '5회 다운로드 이용권', orderName: '5회 다운로드 이용권' },
  P15: { code: 'P15', credits: 15, amount: 3000, label: '15회 다운로드 이용권', orderName: '15회 다운로드 이용권' },
  P30: { code: 'P30', credits: 30, amount: 5000, label: '30회 다운로드 이용권', orderName: '30회 다운로드 이용권' },
};

export const PACKAGE_LIST: PackageDef[] = [PACKAGES.P5, PACKAGES.P15, PACKAGES.P30];

export function isPackageCode(v: unknown): v is PackageCode {
  return v === 'P5' || v === 'P15' || v === 'P30';
}
