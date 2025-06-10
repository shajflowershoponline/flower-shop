export class StaffAccess {
  accessId: string;
  accessCode: string;
  name: string;
  active?: boolean;
  accessPages?: AccessPages[];
}

export class AccessPages {
  page?: string;
  view?: boolean;
  modify?: boolean;
  rights?: string[] = [];
}
